// DOSSIER 003 — Ascenseur. Two sets:
//   the SHAFT (twelve floors seen like an X-ray: the car, its ropes, its rails, the governor at the top)
//   and the BENCH (the safety gear — "le parachute" — on a length of rail, taken apart, then at work).
//   The same gear is in both: bolted under the car, and alone on the bench.
//   01 MENACE is one move: the car and the rope that snaps → under the floor → up to the ropes that are
//   left → the plunge into the void → back up to what waits under your feet.
//   02 AUTOPSIE on the bench, then up the governor's rope to the governor.
//   03 RÉPONSE: half a second, told in slow motion, cut between the car, the governor and the wedge.
//   Then the chute, 1854, the appels à l'action, and the film is back on its first frame.
// The story clock: T+0,00 s when every rope lets go, T+0,50 s when the car stands still, 52 cm lower.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { explode, setPartOpacity } from "@kit/build3d.js";
import { buildCaptions, buildHook, createCallouts, setAct, brandHud, rail, likeNet, typeAnswer } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildParachute, buildGovernor } from "./model.js";
import { buildShaft, SHAFT } from "./shaft.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const comma = (x, digits) => x.toFixed(digits).replace(".", ",");
const BENCH = 0;
const IN_SHAFT = 1;
const X = SHAFT.x;
// what the lights and the shadows are set on, in the shaft
const ON_CAR = 0;
const ON_GEAR = 1;
const ON_GOVERNOR = 2;

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { fog: 0.0016, scale: 26, far: 9000 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const surface = makeSurface({ radius: 700, cell: 6, fade: 120 });
  const pool = makePool({ radius: 62 });
  const motes = makeMotes({ count: 300, seed: 5, min: [-90, 2, -90], size: [180, 110, 180], psize: [0.4, 1.4], drift: [0.4, -0.7, 0.2] });
  const gear = buildParachute();
  const bench = new THREE.Group();
  bench.add(surface.group, pool.mesh, motes.points, gear.root);
  const governor = buildGovernor();
  const shaft = buildShaft({ governor, gears: [buildParachute({ rail: false }), buildParachute({ rail: false })] });
  scene.add(bench, shaft.group);
  const partList = Object.values(gear.parts);
  const G = { x: X + shaft.G.x, y: shaft.G.y, z: shaft.G.z }; // the governor, in the world

  /* ───────────────────────────── state ───────────────────────────── */
  // The first frame is the hook: the car hanging in its well, seen from above, one rope glowing where it will give.
  const POSE0 = { tx: X, ty: 185, tz: 0, d: 660, az: 34, el: 44, fov: 58, shift: 130, side: 20, roll: 0 };
  const ROPES0 = { c0: 0, c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, h0: 0, h1: 0, h2: 1, h3: 0, h4: 0, h5: 0, p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 };
  const FIRST = {
    set: IN_SHAFT, focus: ON_CAR, ...ROPES0, keep: 0, lone: -1, stubs: 1, box: 1, you: 1, shell: 1, ropesA: 1, gov: 1, dashes: 0.35,
    aura: 0, grip: 0, hold: 0, gBite: 0, gHeat: 0, rails: 0, drop: 0, pit: 0.3, haze: 0.5,
    fall: 1, extra: 0, lock: 0, mood: 0, gel: 0,
    explode: 0, bite: 0, work: 0, live: 0, heat: 0, lid: 1, bAura: 0, pool: 0.24, grid: 0.14,
  };
  const S = { ...FIRST, shake: 0 };
  Object.assign(cam, POSE0);
  window.SD.S = S; // for the trial frames

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
    shots.push({ at, cut: true, pose: { roll: 0, side: 0, fov: 28, ...pose } });
  };
  const blip = (el, at, peak, up = 0.05, down = 0.5) => {
    tl.to(el, { opacity: peak, duration: up }, at);
    tl.to(el, { opacity: 0, duration: down }, at + up);
  };
  const jolt = (at, k, dur = 0.5) => {
    st(at, 0.04, { shake: k }, "power2.out");
    st(at + 0.04, dur, { shake: 0 }, "power2.out");
  };
  /** A slow beat on a state value: up and down `n` times, back to 0. */
  const beat = (key, at, n = 2, half = 0.45) => tw.fromTo(S, { [key]: 0 }, { [key]: 1, duration: half, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1, immediateRender: false }, at);
  /** Rope `i` gives: it parts, and light bursts where it breaks. */
  const snap = (i, at, dur = 0.7) => {
    st(at - 0.03, dur, { [`c${i}`]: 1 }, "power3.out");
    tw.fromTo(S, { [`p${i}`]: 0 }, { [`p${i}`]: 1, duration: 0.3, ease: "none", immediateRender: false }, at - 0.02);
  };
  const show = (sel, at, dur = 0.3) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: dur }, at);
  const hide = (sel, at, dur = 0.2) => tl.to(sel, { opacity: 0, duration: dur }, at);

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    casser: T.at("accroche:casser"),
    promesse: T.at("promesse"), tomberas: T.at("promesse:tomberas"), et: T.at("promesse:Et"), cable: T.at("promesse:câble"), retenir: T.at("promesse:retenir"),
    cinq: T.at("cinq"), reste: T.at("cinq:cinq"), seul: T.at("cinq:seul"),
    tous: T.at("tous"), tousMot: T.at("tous:tous"), metres: T.at("tous:36"), bas: T.at("tous:bas"), cent: T.at("tous:cent"),
    boite: T.at("boite"), pieds: T.at("boite:pieds"), attend: T.at("boite:attend"), date: T.at("boite:1854"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    bloc: T.at("eclate:bloc"), coinMot: T.at("eclate:coin"), rail: T.at("eclate:rail"), eclateEnd: T.at("eclate$"),
    nom: T.at("nom"), parachute: T.at("nom:parachute"), nomEnd: T.at("nom$"),
    poulie: T.at("poulie"), pouMot: T.at("poulie:poulie"), surveille: T.at("poulie:surveille"), chose: T.at("poulie:chose"), quinze: T.at("poulie:15"), poulieEnd: T.at("poulie$"),
    zero: T.at("zero"), lachent: T.at("zero:lâchent"),
    dix: T.at("dix"), vite: T.at("dix:vite"), bloque: T.at("dix:bloque"),
    coin: T.at("coin"), levier: T.at("coin:levier"), remonte: T.at("coin:remonte"), mord: T.at("coin:mord"),
    stop: T.at("stop"), arret: T.at("stop:arrêt"), demi: T.at("stop:demi-mètre"),
    chute: T.at("chute"), fil: T.at("chute:fil"), rails: T.at("chute:rails"), tombe: T.at("chute:tombe"), serre: T.at("chute:serre"),
    otis: T.at("otis"), foule: T.at("otis:foule"), debout: T.at("otis:debout"), couper: T.at("otis:couper"), otisEnd: T.at("otis$"),
    like: T.at("like"), likeMot: T.at("like:Like"), likeEnd: T.at("like$"),
    comment: T.at("comment"), commentaire: T.at("comment:commentaire"), sauterais: T.at("comment:sauterais"), epinglee: T.at("comment:épinglée"), commentEnd: T.at("comment$"),
    abo: T.at("abo"), trente: T.at("abo:30"), coeur: T.at("abo:cœur"), aboEnd: T.at("abo$"),
    boucle: T.at("boucle"), rewind: T.at("rewind"),
  };
  // the cuts
  const toBench = t.ouvre - 0.14;
  const toGov = t.poulie - 0.14;
  const toFall = t.zero - 0.4;
  const toLock = t.dix - 0.1;
  const toWedge = t.coin - 0.1;
  const toSill = t.stop - 0.12;
  const toHeld = t.chute - 0.14;
  const toOtis = t.otis - 0.14;
  const toCta = t.like - 0.12;
  const back = Math.min(1.2, END - t.rewind - 0.04);
  const toHook = t.rewind + back * 0.45;

  // The story clock: half a second, stretched from "Zéro" to "Tu es à l'arrêt".
  //   0 → 0,12 s  free fall, the governor reaches 115 % and locks
  //   → 0,25 s    the car goes on, its own rope pulls the wedges up: they bite
  //   → 0,50 s    it slows on its rails and stands still
  const keys = [[t.zero, 0], [t.bloque, 0.12], [t.mord, 0.25], [t.arret, 0.5]];
  const storyAt = (time) => {
    if (time <= keys[0][0] || time >= toHook) return 0; // before anything gives — and again once the film is back on its first frame
    for (let i = 1; i < keys.length; i++) {
      if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    }
    return 0.5;
  };
  const VMAX = 1.9; // m/s reached before the wedges take over (orders of magnitude: see the sources of the episode)
  const speedOf = (s) => (s < 0.2 ? (VMAX * s) / 0.2 : s < 0.25 ? VMAX : (VMAX * (0.5 - s)) / 0.25);
  const fallOf = (s) => {
    // cm fallen: the integral of the speed above
    if (s < 0.2) return ((VMAX * s * s) / 0.4) * 100;
    if (s < 0.25) return (0.19 + VMAX * (s - 0.2)) * 100;
    const u = s - 0.25;
    return (0.285 + VMAX * (u - (u * u) / 0.5)) * 100;
  };
  const storyOf = (time) => {
    const s = storyAt(time);
    return { s, fall: fallOf(s), speed: speedOf(s) };
  };

  // What the governor is shown measuring. Before anything happens: a trip at the normal speed,
  // then the one thing it waits for. After "Zéro": the real thing, until it locks.
  const demoAt = (time) => (smooth(t.surveille - 0.15, t.surveille + 1.0, time) + 0.15 * smooth(t.quinze - 0.55, t.quinze + 0.05, time)) * (1 - smooth(toFall + 0.02, toFall + 0.3, time)); // it runs until the film looks away
  const carSpeed = (time) => (time < t.zero ? demoAt(time) : storyOf(time).speed); // m/s, what the gauge reads
  // The sheave is shown at the speed it really turns at that instant — in a film slowed forty times it
  // would hardly move, and its speed is the whole story. Its angle is the sum of that speed, frame after frame.
  const STEP = 1 / 240;
  const runs = new Float32Array(Math.ceil(END / STEP) + 2);
  for (let i = 1; i < runs.length; i++) {
    const time = i * STEP;
    runs[i] = runs[i - 1] + (time < t.bloque || time >= toHook ? carSpeed(time) : 0) * 100 * STEP;
  }
  const runAt = (time) => {
    const u = clamp01(time / (STEP * (runs.length - 1))) * (runs.length - 1);
    const i = Math.min(runs.length - 2, Math.floor(u));
    return lerp(runs[i], runs[i + 1], u - i); // cm of governor rope gone by
  };
  const caught = -runAt(t.bloque) / governor.groove;
  const TURN0 = governor.settle(caught) - caught; // so that, when it locks, the weights sit in the teeth
  const swingOf = (v) => 0.97 * Math.pow(clamp01(v / 1.15), 1.6);

  const co = createCallouts(stage, $("callouts"), $("leaders"));
  const chips = []; // [element, anchor, dx, dy]: placed every frame on a point of the scene
  const follow = (id, anchor, dx, dy) => chips.push([$(id), anchor, dx, dy]);

  /* ════════════════════ 01 · MENACE — one move ════════════════════ */
  setAct(tl, 1, 0);
  // A — "le câble de ton ascenseur vient de casser": it glows where it will give; on the word, it does
  shot(0, t.casser, { d: 622, az: 30 }, "sine.inOut");
  snap(2, t.casser);
  st(t.casser - 0.04, 0.2, { mood: 1, gel: 0.24 }, "power2.out");
  jolt(t.casser, 0.55, 0.5);
  blip("#flash", t.casser, 0.06, 0.04, 0.3);
  shot(t.casser, 0.55, { d: 596, az: 27 }, "power3.out");

  // B — "tu ne tomberas pas": nothing moves; the five ropes left turn to veille
  st(t.promesse - 0.1, 0.5, { mood: 0, gel: 0, keep: 1 }, "power2.out");
  shot(t.promesse, t.et - t.promesse - 0.12, { d: 610, az: 24 }, "sine.inOut");

  // C — "et ce n'est pas un câble qui va te retenir": down, under the floor — two blocks, on the rails
  shot(t.et - 0.12, 1.4, { tx: X, ty: -42, tz: 0, d: 800, az: 38, el: -13, fov: 44, shift: 130, side: 0 }, "power2.inOut");
  st(t.et + 0.3, 0.5, { keep: 0.3 });
  beat("aura", t.retenir - 0.5, 2, 0.4);

  // "d'abord, il en reste cinq. un seul suffirait." — back up, to the crosshead they hang from
  shot(t.cinq - 0.35, 1.5, { tx: X, ty: 292, tz: 0, d: 540, az: 22, el: 17, fov: 40, shift: 150, side: 0 }, "power2.inOut");
  st(t.cinq, 0.4, { keep: 1 });
  follow("chip-keep", shaft.A.ropes, 96, -40);
  show("#chip-keep", t.reste - 0.1);
  now(t.seul - 0.05, { lone: 4 }); // …any one of them would do
  hide("#chip-keep", t.tous - 0.15);

  // "alors coupons-les tous" — every rope gets its hot point…
  now(t.tous - 0.05, { lone: -1 });
  st(t.tous, 0.3, { keep: 0, mood: 1, gel: 0.18 });
  [0, 1, 3, 4, 5].forEach((i, k) => st(t.tousMot - 0.25 + k * 0.07, 0.25, { [`h${i}`]: 1 }, "power2.out"));
  jolt(t.tousMot, 0.2, 0.3);
  // "…trente-six mètres de vide" — and the camera goes where the car would: down the front of it, into the well
  const VOID = { tx: X, ty: -323, tz: 62, d: 200, az: 0, el: 86.5, fov: 28, shift: 30, side: 0 };
  const dive = t.metres - 0.75;
  shot(dive, 1.35, VOID, "power2.inOut");
  st(dive, 0.3, { dashes: 0 });
  st(dive + 0.3, 0.9, { pit: 1, haze: 0.9 });
  shot(dive + 1.35, t.boite - dive - 1.55, { ty: -420 }, "sine.inOut");
  follow("chip-depth", shaft.A.pit, -322, -330);
  follow("chip-speed", shaft.A.pit, -110, 96);
  show("#chip-depth", t.metres + 0.5);
  show("#chip-speed", t.cent - 0.2);
  hide(["#chip-depth", "#chip-speed"], t.boite - 0.5);

  // "sauf que sous tes pieds, quelque chose attend ce moment depuis 1854" — look up: it is right there, on its rail
  const GEAR = { tx: X + 92, ty: -44, tz: 0, d: 200, az: -55, el: -14, fov: 28, shift: 150, side: 0 };
  const up = t.boite - 0.45;
  now(up, { focus: ON_GEAR });
  shot(up, 1.35, GEAR, "power2.inOut");
  st(up, 0.7, { mood: 0, gel: 0, pit: 0.3, haze: 0.5 });
  st(up, 0.5, { aura: 0.75, rails: 0.55 });
  shot(up + 1.35, toBench - up - 1.35, { d: 184, az: -48 }, "sine.inOut");
  follow("chip-date", shaft.A.block, -330, -210);
  show("#chip-date", t.date - 0.15);
  hide("#chip-date", toBench - 0.12, 0.12);

  /* ════════════════════ 02 · AUTOPSIE (sur l'établi) ════════════════════ */
  setAct(tl, 2, t.ouvre);
  // the same block, on the bench, where the last picture left it on the screen
  cut(toBench, BENCH, { tx: 0, ty: 9, tz: 0, d: 190, az: 150, el: 32, shift: 150 }, { bAura: 0.75, pool: 0.3, grid: 0.2 });
  st(toBench, 0.7, { bAura: 0 }, "power2.out");
  const OPEN = { tx: 0, ty: 25, tz: 0, d: 292, az: 150, el: 28, shift: 70, side: -44 };
  st(t.explode, 2.0, { explode: 1 }, "none");
  shot(t.explode - 0.3, 2.4, OPEN);
  shot(t.bloc, t.eclateEnd - t.bloc + 0.3, { az: 138, el: 25 }, "sine.inOut");
  const cLid = co.add({ title: "Bloc", sub: "Acier", x: 288, y: 500, align: "end", anchor: gear.A.lid });
  const cWedge = co.add({ title: "Coin", sub: "Denté", x: 288, y: 770, align: "end", tone: "system", anchor: gear.A.wedge });
  const cRail = co.add({ title: "Rail", sub: "Il te guide", x: 288, y: 1090, align: "end", anchor: gear.A.rail });
  cLid.show(tl, t.bloc);
  cWedge.show(tl, t.coinMot - 0.1);
  cRail.show(tl, t.rail - 0.15);
  [cLid, cWedge, cRail].forEach((c) => c.hide(tl, t.nom - 0.05));

  // "ça s'appelle un parachute" — it closes, and gets its name
  st(t.nom - 0.05, 1.3, { explode: 0 }, "none");
  shot(t.nom - 0.05, 1.5, { tx: 0, ty: 9, tz: 0, d: 250, az: 160, el: 34, shift: -70, side: 20 });
  tl.fromTo("#reveal", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.parachute - 0.3);
  tl.to("#reveal", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, toGov - 0.25);

  // "tout en haut, une poulie surveille ta vitesse" — its rope starts at the car: follow it up
  const GOV = { tx: G.x, ty: G.y - 2, tz: G.z, d: 372, az: -24, el: 16, shift: 0, side: 24 };
  cut(toGov, IN_SHAFT, { tx: G.x + governor.groove, ty: 285, tz: G.z, d: 560, az: 10, el: 8, shift: 0, side: 24 }, { focus: ON_GOVERNOR, keep: 0, mood: 0, gel: 0, aura: 0, rails: 0, dashes: 1, ropesA: 0.22, h0: 0, h1: 0, h3: 0, h4: 0, h5: 0 });
  shot(toGov, 1.45, GOV, "sine.inOut");
  shot(toGov + 1.45, toFall - toGov - 1.45, { d: 348, az: -15 }, "sine.inOut");
  tl.fromTo("#gauge", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.surveille - 0.25);
  tl.set("#gauge-s1", { opacity: 0 }, 0);
  co.add({ title: "Limiteur", sub: "De vitesse", x: 270, y: 760, align: "end", tone: "system", anchor: governor.A.wheel }).show(tl, t.pouMot + 0.35).hide(tl, t.chose - 0.1);
  // "quinze pour cent de trop": the weights reach the teeth — that is all it waits for
  tl.to("#gauge-fill", { backgroundColor: "#ff5b2e", duration: 0.15 }, t.quinze - 0.1);
  tl.to("#gauge-s0", { opacity: 0, duration: 0.1 }, t.quinze - 0.1);
  tl.to("#gauge-s1", { opacity: 1, duration: 0.1 }, t.quinze - 0.02);
  tl.to("#gauge", { opacity: 0, duration: 0.15 }, toFall - 0.17);
  tl.set("#gauge-fill", { backgroundColor: "#5cffb0" }, toFall);
  tl.set("#gauge-s0", { opacity: 1 }, toFall);
  tl.set("#gauge-s1", { opacity: 0 }, toFall);

  /* ════════════════════ 03 · RÉPONSE ════════════════════ */
  setAct(tl, 3, t.zero);
  // T+0,00 — every rope lets go
  const FALL = { tx: X, ty: 190, tz: 0, d: 690, az: -30, el: 42, fov: 58, shift: 110, side: -10 };
  cut(toFall, IN_SHAFT, FALL, { focus: ON_CAR, ropesA: 1, mood: 1, gel: 0.2, h0: 1, h1: 1, h3: 1, h4: 1, h5: 1 });
  [0, 1, 3, 4, 5].forEach((i, k) => snap(i, t.zero + k * 0.04));
  blip("#flash", t.zero, 0.08, 0.04, 0.4);
  jolt(t.zero, 0.9, 0.8);
  shot(toFall, toLock - toFall, { d: 640, az: -24 }, "sine.out");
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.zero);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.6, ease: "power2.out" }, t.zero + 0.12);
  show("#hud-count", t.zero, 0.15);
  // …and you: for an instant, you weigh nothing
  follow("chip-you", shaft.A.head, -330, -36);
  show("#chip-you", t.lachent - 0.1);
  hide("#chip-you", toLock - 0.14, 0.12);

  // T+0,10 — "tu vas trop vite. la poulie se bloque."
  cut(toLock, IN_SHAFT, { ...GOV, d: 336, az: -30, el: 12 }, { focus: ON_GOVERNOR, ropesA: 0.22 });
  shot(toLock, toWedge - toLock, { d: 306, az: -18 }, "sine.inOut");
  tl.fromTo("#gauge", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, toLock + 0.05);
  tl.to("#gauge-fill", { backgroundColor: "#ff5b2e", duration: 0.12 }, t.bloque - 0.1);
  tl.to("#gauge-s0", { opacity: 0, duration: 0.1 }, t.bloque - 0.05);
  tl.to("#gauge-s1", { opacity: 1, duration: 0.1 }, t.bloque);
  st(t.bloque - 0.03, 0.08, { lock: 1 }, "power2.out");
  jolt(t.bloque, 0.5, 0.45);
  blip("#flash", t.bloque, 0.06, 0.03, 0.3);
  tl.to("#gauge", { opacity: 0, duration: 0.15 }, toWedge - 0.17);

  // T+0,25 — "son câble tire un levier. le coin remonte… et mord le rail": the bench, at work, seen from above
  const TOP = { tx: 0, ty: 8, tz: 4, d: 178, az: 180, el: 80, shift: 130, side: 0 };
  cut(toWedge, BENCH, TOP, { live: 1, work: 0, lid: 0, bAura: 0, explode: 0, pool: 0.26, grid: 0.2, mood: 1, gel: 0.14 });
  shot(toWedge, t.mord - toWedge, { d: 164 }, "sine.in");
  st(t.levier - 0.1, Math.max(0.3, t.remonte - t.levier - 0.05), { work: 0.14 }, "power2.out"); // the rope takes up the slack…
  st(t.remonte - 0.05, Math.max(0.3, t.mord - t.remonte + 0.05), { work: 1 }, "power2.in"); // …and the wedge climbs until it bites
  co.add({ title: "Levier", sub: "Tiré par son câble", x: 300, y: 500, align: "end", anchor: gear.A.rod }).show(tl, t.levier - 0.15).hide(tl, t.remonte + 0.1);
  st(t.mord - 0.05, 0.12, { heat: 1 }, "power2.out");
  st(t.mord + 0.1, 1.4, { heat: 0.3 }, "power2.out");
  jolt(t.mord, 0.55, 0.6);
  blip("#flash", t.mord, 0.08, 0.04, 0.35);
  shot(t.mord, 0.5, { d: 154 }, "power3.out");

  // T+0,50 — "tu es à l'arrêt. un demi-mètre plus bas, à peine": the floor of the car, under the sill it left
  const SILL = { tx: X - 24, ty: -34, tz: 70, d: 900, az: -28, el: 6, shift: 150, side: 0 };
  cut(toSill, IN_SHAFT, SILL, { focus: ON_CAR, live: 0, drop: 1, grip: 1, gBite: 1, gHeat: 0.7, ropesA: 1 });
  shot(toSill, toHeld - toSill, { d: 830, az: -22 }, "sine.inOut");
  st(t.arret - 0.1, 0.6, { hold: 1, gHeat: 0, mood: 0, gel: 0, rails: 1 }, "power2.out");
  follow("chip-drop", shaft.A.drop, -262, -34);
  show("#chip-drop", toSill + 0.15);
  tl.to("#hud-count", { color: "#5cffb0", duration: 0.3 }, t.arret);
  hide("#chip-drop", toHeld - 0.12, 0.12);

  /* ════════════════════ chute ════════════════════ */
  // "un ascenseur ne tient pas à un fil. il tient à ses rails. et plus il tombe, plus il serre."
  cut(toHeld, IN_SHAFT, { tx: X, ty: 40, tz: 0, d: 2380, az: 28, el: 13, shift: -150, side: -150 }, { drop: 0, grip: 0, lock: 0.12 }); // the governor, up there behind the header, keeps quiet
  shot(toHeld, toOtis - toHeld, { d: 2260, az: 16 }, "sine.inOut");
  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.chute + 0.9);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.fil + 0.25);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.rails - 0.3);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.rails - 0.15);
  beat("aura", t.tombe, 2, 0.4);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, toOtis - 0.25);

  // "en 1854, son inventeur l'a prouvé devant la foule" — the same thing, with no walls: a platform, one rope
  cut(toOtis, IN_SHAFT, { tx: X, ty: 134, tz: 0, d: 2160, az: -30, el: 9, shift: 135, side: 10 }, { fall: 0, box: 0, shell: 0.5, stubs: 0, gov: 0, rails: 0, hold: 0, grip: 0, aura: 0, gBite: 0, c3: 0, h3: 0, keep: 0, mood: 0 });
  shot(toOtis, toCta - toOtis, { d: 2030, az: -20 }, "sine.inOut"); // the rope is cut under the header, where it can be seen
  follow("chip-otis", shaft.A.you, 60, -40);
  show("#chip-otis", t.otis + 0.2);
  st(t.debout, 0.4, { h3: 1 }, "power2.out");
  snap(3, t.couper);
  st(t.couper, 0.16, { extra: 4, gBite: 1, grip: 1 }, "power2.in");
  st(t.couper + 0.16, 0.45, { hold: 1, rails: 1 }, "power2.out");
  jolt(t.couper, 0.3, 0.5);
  hide("#chip-otis", toCta - 0.12, 0.12);

  /* ════════════════════ appels à l'action (sur l'établi) ════════════════════ */
  // LIKE — for the one who holds their breath when the car shudders
  cut(toCta, BENCH, { tx: 0, ty: 9, tz: 0, d: 286, az: 150, el: 27, shift: -80, side: 20 }, { pool: 0.3, grid: 0.16, mood: 0, gel: 0, heat: 0, bite: 0, lid: 1 });
  shot(toCta, t.comment - toCta - 0.15, { az: 164, d: 270 }, "sine.inOut");
  likeNet(tl, {
    showAt: t.likeMot - 0.15,
    hideAt: t.likeEnd + 0.12,
    hits: [[7, T.at("like:retient")], [4, T.at("like:souffle")], [10, T.at("like:cabine")], [2, T.at("like:tremble")]],
    label: (n) => `Cabines rassurées ${n}/12`,
  });
  rail(tl, "rail-like", t.likeMot, t.likeEnd + 0.12);

  // COMMENTAIRE — would you jump? the answer is pinned
  shot(t.comment - 0.15, 1.5, { el: 74, az: 180, d: 250, ty: 8, shift: -70, side: 0 });
  st(t.comment - 0.1, 0.6, { lid: 0 });
  typeAnswer(tl, { showAt: t.commentaire, typedAt: t.sauterais, chars: 8, hideAt: t.commentEnd + 0.12 });
  rail(tl, "rail-comment", t.commentaire, t.commentEnd + 0.12);
  st(t.epinglee - 0.1, 0.3, { bite: 1, heat: 0.6 }, "power2.out"); // the wedge answers for you
  st(t.epinglee + 0.2, 0.6, { heat: 0 });
  blip("#flash", t.epinglee, 0.12, 0.04, 0.35);

  // ABONNEMENT — the next file, classified
  shot(t.abo - 0.15, 1.6, { el: 30, az: 152, d: 310, ty: 9, shift: -190, side: 20 });
  st(t.abo, 0.5, { bite: 0, lid: 1 });
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.abo + 0.3);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.trente - 0.5);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.trente - 0.1);
  rail(tl, "rail-follow", t.abo + 0.1, t.aboEnd + 0.15);
  tl.to("#next", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.boucle + 0.1);

  /* ════════════════════ rebouclage ════════════════════
     "…la prochaine fois que tu appuies sur le bouton du…" → the car, hanging in its well: "Douzième étage." */
  shot(t.boucle, t.rewind - t.boucle, { el: 44, az: 168, d: 290, shift: -60 }, "sine.inOut");
  shot(t.rewind, toHook - t.rewind, { d: 420, el: 60 }, "power3.in");
  cut(toHook, IN_SHAFT, { ...POSE0, d: 720 }, { ...FIRST });
  shot(toHook, END - toHook, POSE0, "power2.out");
  blip("#flash", toHook, 0.1, 0.03, 0.3);
  setAct(tl, 1, toHook);
  tl.to("#hud-count", { opacity: 0, duration: 0.15 }, toHook - 0.15);
  tl.set("#hud-count", { color: "#ff5b2e" }, toHook);

  brandHud(tl, { decodedAt: t.rails, resetAt: toHook });

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
  const mix = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgHot = new THREE.Color(0x150b07);
  stage.grade.gel.copy(SIGNAL);
  const FOCUS = [
    (y) => ({ x: X, y: 100 - y, z: 0, scale: 130 }),
    (y) => ({ x: X + SHAFT.half - 14, y: -44 - y, z: 0, scale: 30 }),
    () => ({ x: G.x, y: G.y, z: G.z, scale: 26 }),
  ];

  stage.onUpdate((time) => {
    tw.time(time);
    const px = stage.pixelScale();
    const inShaft = S.set === IN_SHAFT;
    bench.visible = !inShaft;
    shaft.group.visible = inShaft;
    scene.fog.density = inShaft ? 0.00042 : 0.0016;
    const cur = storyOf(time);
    const y = cur.fall * S.fall + S.extra;
    Object.assign(stage.focus, inShaft ? FOCUS[S.focus](y) : { x: 0, y: 0, z: 0, scale: 26 });
    stage.grade.gelAmount = S.gel;
    mix.copy(VEILLE).lerp(SIGNAL, S.mood);
    const spark = time - t.mord; // seconds since the teeth met the steel

    if (inShaft) {
      // the governor: turned by the car through its rope
      const speed = time < t.bloque || time >= toHook ? carSpeed(time) : 0;
      governor.pose({ turn: TURN0 - runAt(time) / governor.groove, swing: Math.max(swingOf(speed), S.lock), lock: S.lock });
      shaft.update(
        {
          y, cut: [S.c0, S.c1, S.c2, S.c3, S.c4, S.c5], hot: [S.h0, S.h1, S.h2, S.h3, S.h4, S.h5], pop: [S.p0, S.p1, S.p2, S.p3, S.p4, S.p5], keep: S.keep, lone: S.lone, stubs: S.stubs,
          box: S.box, you: S.you, shell: S.shell, ropesA: S.ropesA, gov: S.gov, dashes: S.dashes, aura: S.aura, grip: S.grip, hold: S.hold, bite: S.gBite, heat: S.gHeat, spark: S.fall ? spark : -1,
          rails: S.rails, drop: S.drop, pit: S.pit, haze: S.haze, dustT: time * 0.04, streak: 0, rope: runAt(time), mood: mix,
        },
        time,
        px,
      );
    }

    // the bench: taken apart, or at work
    explode(partList, S.explode);
    setPartOpacity(gear.parts.lid, S.lid);
    const working = S.live > 0.5;
    gear.pose({ bite: working ? S.work : S.bite, slip: working ? cur.fall : 0, heat: S.heat, aura: S.bAura, spark: working ? spark : -1, px });

    cam.roll = S.shake * Math.sin(time * 30) * 1.1; // a lurch that settles (under 5 Hz): faster, on a picture made of fine lines, it buzzes
    lights.rim.color.copy(mix);
    lights.rim.intensity = 1.3 + S.mood * 1.5;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgHot, S.mood * 0.8);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = 0.12;
    motes.update(time, px);
  });

  /* ───────────────────────── per-frame: the chrono, the gauge, the chips ───────────────────────── */
  const hudClock = $("hud-clock");
  const hudCount = $("hud-count-v");
  const gaugeV = $("gauge-v");
  const gaugeFill = $("gauge-fill");
  const dropV = $("chip-drop-v");
  const GAUGE_MAX = 2.2; // m/s at the right end of the gauge
  $("gauge-th").style.left = `${(1.15 / GAUGE_MAX) * 100}%`;
  stage.onProject((time) => {
    const cur = storyOf(time);
    const before = time < t.zero || time >= toHook;
    hudClock.textContent = before ? "12e étage" : `T+${comma(cur.s, 2)} s`;
    hudCount.textContent = `${comma(cur.speed, 2)} m/s`;
    const speed = carSpeed(time);
    gaugeV.textContent = `${comma(speed, 2)} m/s`;
    gaugeFill.style.transform = `scaleX(${clamp01(speed / GAUGE_MAX).toFixed(4)})`;
    dropV.textContent = `${Math.round(cur.fall)} cm`;
    for (const [el, anchor, dx, dy] of chips) {
      const p = stage.project(anchor);
      el.style.transform = `translate(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px)`;
    }
  });

  stage.start();
  return tl;
}

window.SD = { build };
