// DOSSIER 002 — Airbag. Two sets:
//   the ROAD (a car seen like an X-ray, the wall, the last second) and the BENCH (the module, taken apart).
//   The same steering wheel is in both: mounted in the car, and alone on the bench.
//   hook A·B·C at the wheel, from the driver's seat → one move out of the cabin: 01 MENACE on the road
//   → 02 AUTOPSIE on the bench → 03 RÉPONSE (the wall, then the bench, 150 ms in slow motion)
//   → chute + appels à l'action → rebouclage, back in the driver's seat.
// The story clock is the chrono: T−1,00 s before the wall, then T+000 ms… T+150 ms after it.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { explode, setPartOpacity, setGlow, glow, fatLine } from "@kit/build3d.js";
import { buildCaptions, buildHook, createCallouts, setAct, brandHud, rail, likeNet, typeAnswer } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildAirbag, RIM, ECU_Z, BAG } from "./model.js";
import { buildRoad, ROAD, MOUNT } from "./road.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const comma = (x, digits) => x.toFixed(digits).replace(".", ",");
const BENCH = 0;
const ON_ROAD = 1;

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { fog: 0.0011, scale: 34, far: 9000 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const surface = makeSurface({ radius: 900, cell: 10, fade: 170 });
  const pool = makePool({ radius: 64 });
  // seen from the driver's seat, the air going by: motes rushing away from the camera, into the dashboard
  const motes = makeMotes({ count: 520, seed: 5, min: [-170, 8, -170], size: [340, 260, 340], psize: [0.6, 2.2], drift: [0, -170, 0] });
  const bag = buildAirbag();
  const { parts, fx, A, ecu } = bag;
  const bench = new THREE.Group();
  bench.add(surface.group, pool.mesh, motes.points, bag.root);
  const road = buildRoad();
  scene.add(bench, road.group);
  // the same module again, where it lives: behind the wheel of the car
  const inCar = buildAirbag();
  road.mount.add(inCar.root);
  setPartOpacity(inCar.ecu, 0);
  inCar.fx.bag.visible = false;
  inCar.fx.head.visible = false;
  inCar.fx.spark.visible = false;
  const modules = [bag, inCar];
  for (const m of modules) m.partList = Object.values(m.parts);

  // the line from the control unit to the igniter, and the order running along it
  const wirePts = fx.wirePath;
  const wire = fatLine(wirePts.map((p) => p.toArray()), { color: BRAND.signal, width: 2.4, dashed: true, dashSize: 0.9, gapSize: 0.7 });
  const wireLen = [0];
  for (let i = 1; i < wirePts.length; i++) wireLen.push(wireLen[i - 1] + wirePts[i].distanceTo(wirePts[i - 1]));
  const along = (u, out) => {
    const d = clamp01(u) * wireLen.at(-1);
    let i = 1;
    while (i < wirePts.length - 1 && wireLen[i] < d) i++;
    return out.lerpVectors(wirePts[i - 1], wirePts[i], (d - wireLen[i - 1]) / (wireLen[i] - wireLen[i - 1]));
  };
  const pulse = Array.from({ length: 7 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.9 - i * 0.09, 16, 12), glow(BRAND.signal, 7 - i * 0.8, { additive: true }));
    m.visible = false;
    bag.root.add(m);
    return m;
  });
  bag.root.add(wire);

  /* ───────────────────────────── state ───────────────────────────── */
  // The first frame is the hook: the wheel as the driver sees it, the cover gone see-through,
  // something glowing behind it. The last frame comes back to exactly this.
  const FIRST = { explode: 0, aCover: 0.16, aPack: 0.2, aWheel: 1, aEcu: 0, fire: 0.16, mood: 0, haze: 0.5, pool: 0.24, grid: 0.13, gel: 0 };
  // facing the wheel, the way the driver does (6° off its axis, like the bench view below: the two match)
  const POSE0 = { tx: ROAD.x + MOUNT.x, ty: MOUNT.y, tz: MOUNT.z, d: 216, az: 0, el: 19, shift: 196, roll: 0 };
  const BENCH_TOP = { tx: 0, ty: 4, tz: 0, d: 216, az: 0, el: 84, shift: 196, roll: 0 };
  const ROAD0 = { phone: 0, nod: 0, you: 0, brake: 0, hazard: 0, rule: 0, ring: 0, rHaze: 0.9, rGrid: 0.2, cluster: 0.55 };
  const S = {
    ...FIRST,
    wire: 0, pulse: -0.2, chip: 0.6, alarm: 0, spark: 0, gas: 0, spread: 0,
    flaps: 0, inflate: 0, deflate: 0, bagA: 1, vent: 0,
    head: 0, sink: 0, headA: 0,
    hands: 0, handPos: 0, reach: 0, safe: 0,
    shake: 0,
    set: ON_ROAD, ...ROAD0,
  };
  Object.assign(cam, POSE0);

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage, below)
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const now = (at, props) => tw.set(S, props, at);
  const shots = [];
  const shot = (at, dur, pose, ease = "power3.inOut") => shots.push({ at, dur, pose, ease });
  /** A cut: the picture jumps to another set (or another angle) on one frame. `pose` must be complete. */
  const cut = (at, set, pose, state = {}) => {
    stage.cut(at);
    now(at, { set, ...state });
    shots.push({ at, cut: true, pose: { roll: 0, ...pose } });
  };
  const blip = (el, at, peak, up = 0.05, down = 0.5) => {
    tl.to(el, { opacity: peak, duration: up }, at);
    tl.to(el, { opacity: 0, duration: down }, at + up);
  };
  const jolt = (at, k, dur = 0.5) => {
    st(at, 0.04, { shake: k }, "power2.out");
    st(at + 0.04, dur, { shake: 0 }, "power2.out");
  };

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    explose: T.at("accroche:explose"), visage: T.at("accroche:visage"),
    promesse: T.at("promesse"), sauver: T.at("promesse:sauver"), sauf: T.at("promesse:Sauf"), mains: T.at("promesse:mains"), mauvais: T.at("promesse:mauvais"),
    yeux: T.at("yeux"), telephone: T.at("yeux:téléphone"), une: T.at("yeux:Une"), slow: T.at("yeux$"),
    mur: T.at("mur"), sans: T.at("mur:sans"), trop: T.at("mur:Trop"), cerveau: T.at("cerveau"), dixieme: T.at("cerveau:dixième"), deux: T.at("cerveau:deux"),
    boite: T.at("boite"), swoop: T.at("swoop"), exploser: T.at("boite:exploser"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    couvercle: T.at("eclate:couvercle"), sac: T.at("eclate:sac"), charge: T.at("eclate:charge"), eclateEnd: T.at("eclate$"),
    toBox: T.at("toBox"), boitier: T.at("boitier:boîtier"),
    bouge: T.at("attend:bouge"), ilAttend: T.at("attend:attend"), attendEnd: T.at("attend$"),
    impact: T.at("impact"), dix: T.at("dix"), decide: T.at("decide"), toi: T.at("dix:Toi"),
    spark: T.at("spark"), burn: T.at("burn"), soixante: T.at("feu:60"), feuEnd: T.at("feu$"),
    plein: T.at("plein"), burst: T.at("burst"), full: T.at("full"),
    chute: T.at("chute"), vent: T.at("vent"), percutes: T.at("chute:percutes"), gonfle: T.at("chute:gonfle"), sink: T.at("sink"), degonfle: T.at("chute:dégonfle"), chuteEnd: T.at("chute$"),
    fin: T.at("fin"), over: T.at("over"), blink: T.at("blink"),
    like: T.at("like"), likeMot: T.at("like:Like"), likeEnd: T.at("like$"),
    comment: T.at("comment"), commentaire: T.at("comment:commentaire"), hands: T.at("hands"), typed: T.at("typed"), la: T.at("comment:là"), commentEnd: T.at("comment$"),
    abo: T.at("abo"), next: T.at("next"), casse: T.at("abo:casse"), aboEnd: T.at("abo$"),
    boucle: T.at("boucle"), rewind: T.at("rewind"),
  };
  const bumps = ["bump1", "bump2", "bump3"].map((c) => T.at(c));
  const toBench = t.boite - 0.12;
  const toWall = t.impact - 0.04;
  const fromWall = t.decide - 0.06;

  // The story clock. Until "Une seconde." the car runs in real time; from there the last second —
  // 13.9 m — is stretched over the whole investigation, and reaches zero on "Zéro". When the film
  // loops back into the car, the road runs again and arrives exactly where the first frame starts.
  const back = Math.min(1.25, END - t.rewind - 0.04);
  const toSeat = t.rewind + back * 0.6; // the cut back into the driver's seat
  const left = (time) => clamp01((t.impact - time) / (t.impact - t.slow));
  const crush = (time) => clamp01((time - t.impact) / (t.decide - t.impact));
  const distAt = (time) => {
    if (time >= toSeat) return ROAD.speed * (1 + t.slow + END - time);
    if (time < t.slow) return ROAD.speed * (1 + t.slow - time);
    return time < t.impact ? ROAD.speed * left(time) : -14 * crush(time); // 10 ms at 50 km/h: 14 cm of bumper
  };
  const travelAt = (time) => {
    if (time >= toSeat) return ROAD.speed * (time - END);
    return time < t.slow ? ROAD.speed * time : ROAD.speed * (t.slow + 1 - left(time)) + 14 * crush(time);
  };

  const co = createCallouts(stage, $("callouts"), $("leaders"));

  /* ════════════════════ accroche · A B C (au volant) ════════════════════ */
  setAct(tl, 1, 0);
  tl.set("#senses", { opacity: 0 }, 0);
  // A — "dans une seconde, ton volant t'explose au visage": it throbs behind its cover, then flares at you
  shot(0, t.explose, { d: 204 }, "sine.inOut");
  const throbs = Math.max(2, Math.floor((t.explose - 0.16) / 0.42 / 2) * 2); // an even number of half-beats: back to rest before the flare
  tw.fromTo(S, { fire: FIRST.fire }, { fire: 0.34, duration: 0.42, ease: "sine.inOut", yoyo: true, repeat: throbs - 1 }, 0);
  shot(t.explose - 0.06, 0.45, { d: 190 }, "power3.out");
  st(t.explose - 0.06, 0.22, { fire: 1, mood: 1, gel: 0.5, aCover: 0.07, aPack: 0.1, cluster: 0.8 }, "power2.out");
  jolt(t.explose, 0.55, 0.5);
  blip("#flash", t.explose, 0.2, 0.04, 0.4);
  tw.fromTo(S, { reach: 0 }, { reach: 1, duration: 0.85, ease: "power2.out" }, t.visage - 0.12); // straight at whoever is watching
  shot(t.explose + 0.4, t.promesse - t.explose, { d: 196, az: -3 }, "sine.inOut");

  // B — "c'est ce qui va te sauver la vie": the same thing, read as what stands guard
  st(t.promesse - 0.1, 0.5, { fire: 0, mood: 0, gel: 0, aCover: 1, aPack: 1, cluster: 0.7 }, "power2.out");
  now(t.sauver - 0.3, { safe: 1 });
  tw.fromTo(S, { reach: 0 }, { reach: 1, duration: 1.0, ease: "power2.out", immediateRender: false }, t.sauver - 0.08);
  shot(t.promesse, t.sauf - t.promesse, { d: 204, az: 2 }, "sine.inOut");

  // C — "sauf si tes mains sont au mauvais endroit": two hands, where everyone puts them
  now(t.sauf - 0.05, { safe: 0 });
  st(t.sauf - 0.05, 0.4, { mood: 1, gel: 0.3, cluster: 0.5 });
  st(t.mains - 0.1, 0.32, { hands: 1 }, "back.out(2)");
  shot(t.sauf, t.yeux - t.sauf, { d: 212, az: -2 }, "sine.inOut");
  jolt(t.mauvais, 0.25, 0.4);

  /* ════════════════════ 01 · MENACE (sur la route) ════════════════════ */
  // "tu baisses les yeux sur ton téléphone" — one move: out of the cabin, behind the car at full speed
  const CHASE = { tx: ROAD.x, ty: 80, tz: 90, d: 1260, az: 5, el: 11, shift: -40 };
  const WIDE = { tx: ROAD.x + 20, ty: 0, tz: -650, d: 2500, az: 3, el: 8.5, shift: 150 };
  const out = t.yeux - 0.3;
  shot(out, 1.5, CHASE, "power3.inOut");
  st(out, 0.5, { hands: 0, mood: 0, gel: 0, cluster: 0.3 });
  st(out + 0.55, 0.4, { you: 1 }); // the camera has passed the driver: there he is
  st(t.telephone - 0.3, 0.3, { phone: 1, nod: 1 }, "power2.out");
  const cYou = co.add({ title: "Toi", sub: "Les yeux sur l'écran", x: 640, y: 560, align: "start", anchor: road.A.driver });
  cYou.show(tl, Math.max(t.telephone - 0.1, out + 1.2)).hide(tl, t.mur - 0.05);
  // "une seconde" — the clock starts; what was a blur becomes a distance
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%" }, t.une);

  // "quatorze mètres sans regarder" — pull up: the car, the wall, and what is left between them
  shot(t.mur - 0.1, 1.9, WIDE, "power3.inOut");
  st(t.mur + 0.25, 0.5, { rule: 1 });
  tl.fromTo("#chip-dist", { opacity: 0 }, { opacity: 1, duration: 0.3 }, t.mur + 0.55);
  tl.fromTo("#hud-count", { opacity: 0 }, { opacity: 1, duration: 0.25 }, t.mur + 0.55);
  // "trop tard pour freiner" — the brake lights, for nothing
  st(t.trop - 0.05, 0.12, { brake: 1 }, "power2.out");
  st(t.trop, 0.9, { hazard: 1, mood: 1, gel: 0.12 }, "power1.out");
  shot(t.mur + 1.8, t.cerveau - t.mur, { az: -2, d: 2400 }, "sine.inOut");

  // "un dixième de seconde… ton cerveau en met deux" — the car coming at us, in slow motion; two bars, one too long
  const toFront = t.cerveau - 0.12;
  cut(toFront, ON_ROAD, { tx: ROAD.x - 10, ty: 78, tz: ROAD.nose, d: 940, az: 171, el: 5, shift: -110 });
  shot(toFront, toBench - toFront, { az: 177, d: 900 }, "sine.inOut");
  tl.to("#chip-dist", { opacity: 0, duration: 0.15 }, toFront - 0.15);
  tl.fromTo("#versus", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.cerveau + 0.1);
  tl.fromTo("#vs-choc .vs__bar", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power3.out" }, t.dixieme - 0.1);
  tl.fromTo("#vs-toi", { opacity: 0.25 }, { opacity: 1, duration: 0.2 }, t.deux - 0.5);
  tl.fromTo("#vs-toi .vs__bar", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.out" }, t.deux - 0.4);
  tl.to("#versus", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, toBench - 0.25);

  // "une seule chose peut encore te sauver… elle est dans ton volant" — back on the bench, coming down on it
  cut(toBench, BENCH, { tx: 0, ty: 4, tz: 0, d: 300, az: 0, el: 76, shift: 130 }, { fire: 0, pool: 0.5, grid: 0.24, haze: 0.3, mood: 1, gel: 0.1, rule: 0 });
  shot(toBench, t.swoop - toBench, { d: 262, el: 68, az: -6 }, "sine.inOut");
  shot(t.swoop, 2.3, { tx: 0, ty: 5, tz: 0, d: 226, az: -30, el: 30, shift: 110 });
  tw.fromTo(S, { reach: 0 }, { reach: 1, duration: 0.55, ease: "power2.out", immediateRender: false }, t.exploser); // a first taste of what is inside
  co.add({ title: "Airbag conducteur", sub: "60 litres, pliés", x: 560, y: 500, align: "start", anchor: A.cover }).show(tl, t.swoop + 1.5).hide(tl, t.explode - 0.1);

  /* ════════════════════ 02 · AUTOPSIE ════════════════════ */
  setAct(tl, 2, t.ouvre);
  st(t.explode, 2.2, { explode: 1 }, "none");
  st(t.explode, 1.2, { mood: 0.12, haze: 0.14, pool: 0.3, gel: 0 });
  shot(t.explode, 2.4, { ty: 12.5, d: 126, az: -14, el: 21, shift: 150 });
  shot(t.couvercle, t.eclateEnd - t.couvercle + 0.3, { az: 12, el: 23 }, "sine.inOut");
  const cCover = co.add({ title: "Couvercle", sub: "Prédécoupé", x: 772, y: 470, align: "start", anchor: A.cover });
  const cPack = co.add({ title: "Sac", sub: "Nylon plié", x: 262, y: 636, align: "end", anchor: A.pack });
  const cCharge = co.add({ title: "Charge", sub: "Pyrotechnique", x: 792, y: 838, align: "start", tone: "danger", anchor: A.inflator });
  cCover.show(tl, t.couvercle);
  cPack.show(tl, t.sac);
  cCharge.show(tl, t.charge - 0.15);
  [cCover, cPack, cCharge].forEach((c) => c.hide(tl, t.toBox));
  st(t.charge, 0.4, { fire: 0.12 }); // it is only waiting
  st(t.toBox, 0.4, { fire: 0 });

  // "plus loin, un boîtier": everything closes again, we go and see who decides
  st(t.toBox, 1.5, { explode: 0 }, "none");
  st(t.toBox, 0.6, { aEcu: 1, grid: 0.16 });
  st(t.toBox + 0.25, 0.6, { aWheel: 0 }); // the wheel steps out while we look at the unit
  st(t.ilAttend - 0.35, 0.5, { aWheel: 1 });
  shot(t.toBox, 1.7, { tx: 0, ty: 2, tz: ECU_Z, d: 104, az: 20, el: 40, shift: 10 });
  const cEcu = co.add({ title: "Boîtier", sub: "Accéléromètre", x: 744, y: 700, align: "start", tone: "system", anchor: A.ecu });
  cEcu.show(tl, t.boitier).hide(tl, t.ilAttend - 0.3);

  // the scope: every jolt it measures, against the one threshold that matters
  tl.fromTo("#scope", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.boitier + 0.5);
  const plot = $("scope-plot");
  const samples = [
    [bumps[0], 0.26], [bumps[1], 0.41], [bumps[2], 0.33], // pothole, kerb, braking
    [t.impact + 0.1, 0.55], [t.impact + 0.38, 0.84], [t.impact + 0.66, 0.97], // the wall
  ];
  samples.forEach(([at, level], i) => {
    const bar = document.createElement("div");
    bar.className = `bar ${level > 0.62 ? "bar--hot" : ""}`;
    bar.style.left = `${24 + i * 146}px`;
    bar.style.height = `${Math.round(level * 100)}%`;
    plot.append(bar);
    tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 0.16, ease: "power3.out" }, at + 0.03);
    tl.set("#scope-n", { textContent: `Mesure ${i + 1}` }, at);
  });
  bumps.forEach((at) => {
    st(at, 0.06, { chip: 3.2 }, "power2.out");
    st(at + 0.06, 0.4, { chip: 0.6 }, "power2.out");
    jolt(at, 0.22, 0.35);
  });
  tl.set("#scope-s1", { opacity: 0 }, 0);
  tl.set("#scope-s2", { opacity: 0 }, 0);
  tl.fromTo("#scope-s0", { opacity: 0 }, { opacity: 1, duration: 0.25 }, t.bouge);

  // "il attend un mur": the whole chain in one look — unit, line, wheel
  const CHAIN = { tx: 0, ty: 0, tz: 14, d: 372, az: 0, el: 62, shift: -90 };
  st(t.ilAttend - 0.2, 0.6, { wire: 1 });
  shot(t.ilAttend - 0.2, 1.5, CHAIN);
  st(t.attendEnd, toWall - t.attendEnd, { mood: 0.6, gel: 0.08 }, "power1.in");

  /* ════════════════════ 03 · RÉPONSE ════════════════════ */
  setAct(tl, 3, t.impact);
  // T+000 — the bumper touches the wall: back on the road, at the point of contact
  cut(toWall, ON_ROAD, { tx: ROAD.x, ty: 72, tz: ROAD.nose + 46, d: 1180, az: 88, el: 4, shift: -90 }, { hazard: 0.5, brake: 1, phone: 1, nod: 1, you: 1, rule: 0, rHaze: 1, cluster: 0.3 });
  shot(toWall, fromWall - toWall, { d: 1040, az: 83, el: 6 }, "power2.out");
  tw.fromTo(S, { ring: 0 }, { ring: 1, duration: 1.3, ease: "power2.out" }, t.impact);
  blip("#flash", t.impact, 0.45, 0.04, 0.5);
  jolt(t.impact, 1, 0.9);
  st(t.impact, 0.1, { mood: 1, haze: 0.7, gel: 0.2 }, "power2.out");
  tl.set("#hud-count-l", { textContent: "Vitesse" }, t.impact);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.22, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.impact);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.7, ease: "power2.out" }, t.impact + 0.12);
  tl.to("#scope-s0", { opacity: 0, duration: 0.1 }, t.impact);
  tl.to("#scope-s1", { opacity: 1, duration: 0.1 }, t.impact + 0.05);

  // T+010 — the unit has understood; you have not
  cut(fromWall, BENCH, CHAIN);
  tl.to("#scope-s1", { opacity: 0, duration: 0.1 }, t.decide);
  tl.to("#scope-s2", { opacity: 1, duration: 0.1 }, t.decide + 0.05);
  st(t.decide, 0.12, { alarm: 1, chip: 4 }, "power2.out");
  tw.fromTo(S, { pulse: 0 }, { pulse: 1.1, duration: 0.8, ease: "power1.in" }, t.decide + 0.1); // the order to fire
  shot(t.decide + 0.05, 1.25, { tx: 0, ty: 5, tz: 0, d: 152, az: -16, el: 52, shift: -70 });
  tl.to("#scope", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, t.toi - 0.3);
  tl.fromTo("#senses", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out", immediateRender: false }, t.toi - 0.05);
  tl.set("#sense-cerveau-t", { textContent: "Pas au courant" }, t.toi + 0.25);
  tl.fromTo("#sense-cerveau", { scale: 1 }, { scale: 1.08, duration: 0.14, ease: "power2.out", transformOrigin: "0 50%", immediateRender: false }, t.toi + 0.25);
  tl.to("#sense-cerveau", { scale: 1, duration: 0.4, ease: "power2.out" }, t.toi + 0.39);
  tl.to("#senses", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, t.spark - 0.3);

  // a spark, the charge catches, sixty litres of gas
  st(t.spark - 0.35, 0.35, { aCover: 0.14, aPack: 0.16, wire: 0 });
  shot(t.spark - 0.35, 1.2, { d: 98, el: 57, az: -8, ty: 5, shift: -90 });
  st(t.spark, 0.05, { spark: 1 }, "power2.out");
  st(t.spark + 0.05, 0.4, { spark: 0 }, "power2.out");
  st(t.burn, 0.22, { fire: 1, gas: 1 }, "power2.out");
  jolt(t.burn, 0.3, 0.5);
  tl.fromTo("#db", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power4.out" }, t.soixante - 0.05);
  tl.to("#db", { opacity: 0, y: -30, duration: 0.28, ease: "power2.in" }, t.plein - 0.15);

  // T+040 — the bag tears through the wheel, full
  const grow = Math.max(0.5, t.full - t.burst + 0.1);
  st(t.burst - 0.12, 0.1, { aCover: 1 }, "none");
  st(t.burst, 0.2, { flaps: 1 }, "power3.out");
  st(t.burst, 0.06, { aPack: 0 }, "none");
  st(t.burst, grow, { inflate: 1 }, "back.out(1.5)");
  st(t.burst, 0.5, { spread: 1 }, "power2.out");
  st(t.burst, 0.4, { gel: 0.07 }); // the bag is cream: past this, the gel would paint it pink
  st(t.burst + 0.35, 0.4, { gas: 0, fire: 0.25 });
  blip("#flash", t.burst, 0.3, 0.04, 0.45);
  jolt(t.burst, 0.7, 0.6);
  shot(t.burst - 0.1, 0.95, { tx: 0, ty: 17, tz: 0, d: 338, az: -38, el: 22, shift: -40 }, "power3.out");
  shot(t.burst + 0.95, t.chute - t.burst, { az: -30, d: 350 }, "sine.inOut");

  /* ════════════════════ chute ════════════════════ */
  // "il se vide déjà": seen from the side — the head arrives on a bag that is already letting go
  shot(t.chute - 0.25, 1.6, { tx: 0, ty: 27, tz: 0, d: 404, az: -72, el: 7, shift: -30 });
  st(t.chute, 0.8, { fire: 0, mood: 0.5, gel: 0.08 });
  st(t.vent - 0.1, 0.4, { vent: 1 });
  st(t.vent, t.sink - t.vent, { deflate: 0.22 }, "sine.inOut");
  st(t.chute + 0.2, 0.2, { headA: 1 });
  st(t.chute + 0.2, Math.max(0.8, t.gonfle - t.chute - 0.1), { head: 1 }, "power2.inOut");
  st(t.sink, Math.max(0.8, t.degonfle - t.sink + 0.5), { sink: 1, deflate: 0.72 }, "power2.out");
  const cHead = co.add({ title: "Toi", x: 790, y: 770, align: "start", anchor: A.head });
  cHead.show(tl, t.percutes - 0.2).hide(tl, t.sink + 0.4);

  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.percutes - 0.05);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.gonfle + 0.2);
  tl.to("#retitle-k", { opacity: 0, duration: 0.15 }, t.sink - 0.1);
  tl.set("#retitle-k", { textContent: "Tu t'enfonces dans", color: "#5cffb0" }, t.sink + 0.05);
  tl.to("#retitle-k", { opacity: 1, duration: 0.15 }, t.sink + 0.05);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.degonfle - 0.14);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.degonfle);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, t.fin - 0.1);

  // T+150 — over, in the time of a blink
  st(t.fin, 1.0, { deflate: 0.86, vent: 0.25, mood: 0.12, haze: 0.14, gel: 0 });
  tl.fromTo("#co-count", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, t.fin + 0.15);
  tl.to("#hud-count", { color: "#5cffb0", duration: 0.3 }, t.over);
  tl.fromTo(".lid", { scaleY: 0 }, { scaleY: 1, duration: 0.1, ease: "power2.in" }, t.blink + 0.5);
  tl.to(".lid", { scaleY: 0, duration: 0.14, ease: "power2.out" }, t.blink + 0.62);
  tl.to("#co-count", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.like + 0.15);

  /* ════════════════════ appels à l'action ════════════════════ */
  // LIKE — "seulement si tu es bien assis": the film has to reach the one with their feet on the dashboard
  st(t.like, 0.4, { headA: 0, vent: 0, aEcu: 0 });
  st(t.like + 0.1, 0.5, { bagA: 0 });
  st(t.like + 0.6, 0.5, { flaps: 0 });
  st(t.like + 0.65, 0.05, { inflate: 0, deflate: 0, head: 0, sink: 0 }, "none");
  st(t.like + 0.9, 0.3, { aPack: 1, pool: 0.4 });
  shot(t.like - 0.1, 1.9, { tx: 0, ty: 5, tz: 0, d: 240, az: 16, el: 28, shift: -50 });
  likeNet(tl, {
    showAt: t.likeMot - 0.15,
    hideAt: t.likeEnd + 0.15,
    hits: [[7, T.at("like:tombe")], [4, T.at("like:quelqu'un")], [10, T.at("like:pieds")], [2, T.at("like:tableau")]],
    label: (n) => `Passagers prévenus ${n}/12`,
  });
  rail(tl, "rail-like", t.likeMot, t.likeEnd + 0.15);

  // COMMENTAIRE — the question of the hook comes back: hands at ten-to-two, exactly where the bag goes
  shot(t.comment - 0.2, 1.6, { el: 66, az: 0, d: 266, ty: 4, shift: -50 });
  st(t.hands - 0.1, 0.35, { hands: 1 }, "back.out(2)");
  typeAnswer(tl, { showAt: t.commentaire, typedAt: t.typed, chars: 7, hideAt: t.commentEnd + 0.15 });
  rail(tl, "rail-comment", t.commentaire, t.commentEnd + 0.15);
  tw.fromTo(S, { reach: 0 }, { reach: 1, duration: 0.7, ease: "power2.out", immediateRender: false }, t.la);
  blip("#flash", t.la, 0.14, 0.04, 0.4);
  st(t.la + 0.3, 0.6, { handPos: 1 }, "power3.inOut"); // and where they belong: quarter past nine
  const cHands = co.add({ title: "9 h 15", x: 250, y: 838, align: "end", tone: "system", anchor: A.hand });
  cHands.show(tl, t.la + 0.6).hide(tl, t.abo + 0.05);

  // ABONNEMENT — the next file, classified
  shot(t.abo - 0.15, 1.6, { el: 30, az: -18, d: 322, ty: 4, shift: -130 });
  st(t.abo + 0.2, 0.4, { hands: 0 });
  now(t.abo + 0.65, { handPos: 0 });
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.abo + 0.3);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.next - 0.3);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.casse - 0.25);
  rail(tl, "rail-follow", t.abo + 0.1, t.aboEnd + 0.2);
  tl.to("#next", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.boucle + 0.1);

  /* ════════════════════ rebouclage ════════════════════
     "Surtout à…" → the film is back on its first frame, where the voice says "Cinquante kilomètres-heure". */
  shot(t.boucle, t.rewind - t.boucle, { el: 46, az: -8, d: 360, shift: -40 }, "sine.inOut");
  shot(t.rewind, toSeat - t.rewind, BENCH_TOP, "power3.in");
  st(t.rewind, toSeat - t.rewind, { ...FIRST, alarm: 0, chip: 0.6 });
  cut(toSeat, ON_ROAD, { ...POSE0, d: 226 }, { ...ROAD0 });
  shot(toSeat, END - toSeat, POSE0, "power2.out");
  blip("#flash", toSeat, 0.1, 0.03, 0.3);
  setAct(tl, 1, t.rewind + 0.2);
  tl.set("#hud-count-l", { textContent: "Mur à" }, t.rewind + 0.3);
  tl.to("#hud-count", { opacity: 0, duration: 0.25 }, t.rewind + 0.1);
  tl.set("#hud-count", { color: "#ff5b2e" }, t.rewind + 0.4);

  brandHud(tl, { decodedAt: t.degonfle + 0.25, resetAt: t.rewind + 0.2 });

  /* ───────────────────────── text on screen, commit ───────────────────────── */
  const HOOK = ["accroche", "promesse"];
  const handOver = END - 0.34; // the last caption leaves, the first card of the hook is back
  buildHook($("hook"), EP, tl, { beats: HOOK, loopAt: handOver });
  buildCaptions($("captions"), EP, tl, { skip: HOOK, lastEnd: handOver });
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => {
    if (s.cut) return tw.set(cam, s.pose, s.at);
    const room = (shots[i + 1]?.at ?? END) - s.at;
    tw.to(cam, { ...s.pose, duration: Math.min(s.dur, Math.max(0.05, room)), ease: s.ease }, s.at);
  });

  /* ───────────────────────── per-frame: state → world ───────────────────────── */
  const tmp = new THREE.Vector3();
  const mix = new THREE.Color();
  const moodC = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgHot = new THREE.Color(0x150b07);
  const HEAD_FAR = 128; // off the top of the frame
  const HEAD_TOUCH = bag.dims.BAG_Y + BAG.h * 2 + 9.5; // resting on the full bag
  stage.grade.gel.copy(SIGNAL);

  stage.onUpdate((time) => {
    tw.time(time);
    const px = stage.pixelScale();
    const onRoad = S.set === ON_ROAD;
    bench.visible = !onRoad;
    road.group.visible = onRoad;
    scene.fog.density = onRoad ? 0.00022 : 0.0011;
    // at the wheel the lights are set for the wheel; from outside, for the whole car
    const seat = onRoad && cam.d < 420;
    Object.assign(stage.focus, !onRoad ? { x: 0, y: 0, z: 0, scale: 34 } : seat ? { x: ROAD.x + MOUNT.x, y: MOUNT.y - 20, z: MOUNT.z, scale: 34 } : { x: ROAD.x, y: 0, z: -150, scale: 150 });
    stage.grade.gelAmount = S.gel;
    const step = Math.min(60, Math.abs(travelAt(time) - travelAt(time - 1 / 30))); // road covered during one frame
    if (onRoad) {
      moodC.copy(VEILLE).lerp(SIGNAL, S.mood);
      road.update(
        { shell: clamp01((cam.d - 300) / 500), step, dist: distAt(time), travel: travelAt(time), phone: S.phone, nod: S.nod, you: S.you, brake: S.brake, hazard: S.hazard, rule: S.rule, ring: S.ring, haze: S.rHaze, grid: S.rGrid, cluster: S.cluster, alarm: S.alarm, mood: moodC },
        time,
        px,
      );
    }

    for (const m of modules) {
      explode(m.partList, S.explode);
      setPartOpacity(m.parts.cover, S.aCover * S.aWheel);
      setPartOpacity(m.parts.pack, S.aPack * S.aWheel);
      for (const key of ["wheel", "housing", "inflator"]) setPartOpacity(m.parts[key], S.aWheel);
      setGlow(m.fx.holes, S.fire * (5 + (0.5 * Math.sin(time * 19) + 0.3 * Math.sin(time * 31 + 1)) * S.fire)); // it only wavers when it burns, and never blinks
      m.fx.fireHalo.material.opacity = Math.min(1, S.fire * 0.5);
      m.fx.fireHalo.visible = S.fire > 0.01;
      const flaps = m === bag ? S.flaps : 0;
      m.fx.seam.material.opacity = 0.9 * (1 - clamp01(flaps * 4)) * clamp01(S.aCover * 1.5);
      // hands on the rim: ten-to-two (signal) → quarter past nine (veille)
      mix.copy(SIGNAL).lerp(VEILLE, S.handPos);
      m.fx.hands.forEach(({ hand, mat, side }) => {
        const clock = lerp(300, 270, S.handPos) * DEG;
        hand.position.set(side * -RIM * Math.sin(clock), 5.6, -RIM * Math.cos(clock));
        hand.scale.setScalar(Math.max(0.001, S.hands));
        hand.visible = S.hands > 0.01;
        setGlow(mat, 2.2, mix);
      });
      // the ring: what the bag reaches (signal) — or, once in the hook, what it shields (veille)
      setGlow(m.fx.reach.material, 3, S.safe > 0.5 ? VEILLE : SIGNAL);
      m.fx.reach.scale.setScalar(8 + S.reach * 26);
      m.fx.reach.material.opacity = Math.sin(Math.PI * clamp01(S.reach)) * 0.9;
      m.fx.reach.visible = m.fx.reach.material.opacity > 0.01;
    }
    setPartOpacity(ecu, S.aEcu);

    // the charge
    fx.spark.material.opacity = S.spark;
    fx.spark.scale.setScalar(1 + S.spark * 1.6);
    fx.spark.visible = S.spark > 0.01;
    fx.gas.uniforms.uTime.value = time;
    fx.gas.uniforms.uScale.value = px;
    fx.gas.uniforms.uAmount.value = S.gas;
    fx.gas.uniforms.uSpread.value = S.spread;

    // cover flaps and bag
    fx.flaps.forEach(({ pivot, side }) => (pivot.rotation.x = side * S.flaps * 118 * DEG));
    const sx = lerp(0.2, 1, S.inflate) * (1 - 0.05 * S.deflate);
    const sy = lerp(0.08, 1, S.inflate) * (1 - 0.42 * S.deflate);
    fx.bag.scale.set(sx, sy, sx);
    fx.bag.visible = S.inflate > 0.002 && S.bagA > 0.01;
    fx.bagMat.opacity = S.bagA;
    if (fx.bagMat.transparent !== S.bagA < 0.999) {
      fx.bagMat.transparent = S.bagA < 0.999;
      fx.bagMat.needsUpdate = true;
    }
    fx.bagSeams.opacity = 0.55 * S.bagA;
    fx.ventDirs.forEach((dir, i) => {
      fx.vent.uniforms.uOrigin.value[i].set(dir.x * BAG.r * sx, bag.dims.BAG_Y + (1 + dir.y) * BAG.h * sy, dir.z * BAG.r * sx);
      fx.vent.uniforms.uDir.value[i].copy(dir);
    });
    fx.vent.uniforms.uTime.value = time;
    fx.vent.uniforms.uScale.value = px;
    fx.vent.uniforms.uAmount.value = S.vent * (fx.bag.visible ? 1 : 0);

    // the head: comes down onto the bag, then into it
    fx.head.position.y = lerp(lerp(HEAD_FAR, HEAD_TOUCH, S.head), HEAD_TOUCH - 15, S.sink);
    fx.head.visible = S.headA > 0.01;
    fx.headMats.forEach((m) => {
      m.opacity = S.headA;
      m.transparent = true;
    });

    // control unit, its line, the order running along it
    mix.copy(VEILLE).lerp(SIGNAL, clamp01(S.alarm));
    const tick = 0.88 + 0.12 * Math.sin(time * 9); // it never stops sampling — a breath, not a blink
    setGlow(fx.chip, S.chip * tick * 4, mix);
    setGlow(fx.chipHalo.material, 2.4, mix);
    fx.chipHalo.material.opacity = Math.min(1, S.chip * 0.22 * tick) * S.aEcu;
    wire.material.opacity = S.wire * 0.6;
    wire.visible = wire.material.opacity > 0.01;
    pulse.forEach((dot, i) => {
      const u = S.pulse - i * 0.03;
      dot.visible = u > 0 && u < 1;
      if (dot.visible) dot.position.copy(along(u, tmp));
    });

    // mood, and the jolt of the impact
    cam.roll = S.shake * Math.sin(time * 52) * 1.1;
    mix.copy(VEILLE).lerp(SIGNAL, S.mood);
    lights.rim.color.copy(mix);
    lights.rim.intensity = 1.3 + S.mood * 1.5;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgHot, S.mood * 0.8);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = S.haze;
    motes.update(travelAt(time) / ROAD.speed, px, (step / ROAD.speed) * 1.2);
  });

  /* ───────────────────────── per-frame: the chrono, the distance ───────────────────────── */
  // Story time: one second before the wall, then the milliseconds the voice calls out.
  const keys = [[t.impact, 0], [t.dix, 10], [t.plein, 40], [t.sink + 1.0, 70], [t.fin, 150]];
  const msAt = (time) => {
    if (time <= keys[0][0]) return 0;
    for (let i = 1; i < keys.length; i++) {
      if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    }
    return 150;
  };
  const hudClock = $("hud-clock");
  const hudCount = $("hud-count-v");
  const chip = $("chip-dist");
  const chipV = $("chip-dist-v");
  stage.onProject((time) => {
    const rewound = time >= t.rewind + 0.3;
    if (time < t.une || rewound) {
      hudClock.textContent = "50 km/h";
      hudCount.textContent = "13,9 m";
    } else if (time < t.impact) {
      const metres = `${comma(13.9 * left(time), 1)} m`;
      hudClock.textContent = `T−${comma(left(time), 2)} s`;
      hudCount.textContent = metres;
      chipV.textContent = metres;
    } else {
      const ms = msAt(time);
      hudClock.textContent = `T+${String(Math.round(ms)).padStart(3, "0")} ms`;
      hudCount.textContent = `${Math.round(50 * (1 - ms / 150))} km/h`;
    }
    // the chip rides on the ruler drawn on the road
    if (S.set === ON_ROAD) {
      const p = stage.project(road.A.rule);
      chip.style.transform = `translate(${(p.x + 30).toFixed(1)}px, ${(p.y - 34).toFixed(1)}px)`;
    }
  });

  stage.start();
  return tl;
}

window.SD = { build };
