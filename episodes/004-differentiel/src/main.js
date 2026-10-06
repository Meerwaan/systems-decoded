// DOSSIER 004 — Différentiel. Two sets:
//   the ROOM (a bathroom wall seen like an X-ray: you, a hand closed on a bare flex, the two wires
//   in the wall, the consumer unit next door) and the BENCH (the differential, taken apart, then at work).
//   The same device is in both: clipped in the unit, and alone on the bench.
//   01 MENACE: your hand on the wire → along the wires to the unit (not your breaker) → you, read as
//   a circuit → the breaker that waits for 16 A → the box beside it.
//   02 AUTOPSIE on the bench: the lever, the loaded spring, the ring; how the ring waits.
//   03 RÉPONSE: forty milliseconds, in slow motion, cut between you and the ring.
//   Then the chute, the appels à l'action, the test button — and the film is back on its first frame.
// The story clock: T+00 ms when you touch, T+30 ms when the contacts are open (under the 40 ms of the standard).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { explode, setPartOpacity } from "@kit/build3d.js";
import { buildCaptions, buildHook, createCallouts, setAct, brandHud, rail, likeNet, typeAnswer } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildDifferential, BOX } from "./model.js";
import { buildRoom, ROOM, UNIT } from "./room.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const comma = (x, digits) => x.toFixed(digits).replace(".", ",");
const BENCH = 0;
const IN_ROOM = 1;
const X = ROOM.x;
// what the lights and the shadows are set on, in the room
const ON_YOU = 0;
const ON_UNIT = 1;

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { fog: 0.004, scale: 8, far: 6000 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const surface = makeSurface({ radius: 220, cell: 2, fade: 34 });
  const pool = makePool({ radius: 20 });
  const motes = makeMotes({ count: 220, seed: 5, min: [-30, 0.6, -30], size: [60, 34, 60], psize: [0.12, 0.42], drift: [0.14, -0.22, 0.07] });
  const dev = buildDifferential();
  const bench = new THREE.Group();
  bench.add(surface.group, pool.mesh, motes.points, dev.root);
  const inUnit = buildDifferential({ flows: false });
  const room = buildRoom({ device: inUnit });
  scene.add(bench, room.group);
  const partList = Object.values(dev.parts);
  const DEVICE = room.A.device.getWorldPosition(new THREE.Vector3()); // the unit's differential, in the world

  /* ───────────────────────────── state ───────────────────────────── */
  // The first frame is the hook: your hand closed on the bare flex, seen from inside the wall — the
  // current already on its way to your heart.
  const POSE0 = { tx: X + 22, ty: 113, tz: 18, d: 108, az: 148, el: 6, fov: 40, shift: 130, side: 0, roll: 0 };
  const FIRST = {
    set: IN_ROOM, focus: ON_YOU, grip: 1, clench: 0.4, shock: 1, hot: 1, pop: 0, live: 1, lack: 1, lines: 1, body: 1, mine: 0, dull: 0, aura: 0,
    mood: 1, gel: 0.1,
    explode: 0, cover: 1, shell: 1, off: 0, paddle: 0, sense: 0, pulse: -1, arc: 0, flow: 0, bLack: 0, press: 0, bAura: 0, cut: 0, pool: 0.2, grid: 0.16,
  };
  const S = { ...FIRST, shake: 0 };
  Object.assign(cam, POSE0);
  window.SD.S = S; // for the trial frames

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage, below)
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const now = (at, props) => tw.set(S, props, at);
  const shots = [];
  const shot = (at, dur, pose, ease = "power2.inOut") => shots.push({ at, dur, pose, ease });
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
  const show = (sel, at, dur = 0.3) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: dur }, at);
  const hide = (sel, at, dur = 0.2) => tl.to(sel, { opacity: 0, duration: dur }, at);

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    touches: T.at("accroche:touches"), referme: T.at("accroche:referme"), lacher: T.at("accroche:lâcher"),
    promesse: T.at("promesse"), place: T.at("promesse:place"), et: T.at("promesse:Et"), disjMot: T.at("promesse:disjoncteur"),
    corps: T.at("corps"), mouille: T.at("corps:mouillé"), cent: T.at("corps:150"), coeur: T.at("corps:cœur"), trente: T.at("corps:trente"),
    disj: T.at("disj"), bouge: T.at("disj:bouge"), seize: T.at("disj:16"), fois: T.at("disj:Cinq"),
    boite: T.at("boite"), cote: T.at("boite:côté"), autre: T.at("boite:autre#2"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    manette: T.at("eclate:manette"), ressort: T.at("eclate:ressort"), anneau: T.at("eclate:anneau"), eclateEnd: T.at("eclate$"),
    repos: T.at("repos"), dedans: T.at("repos:dedans"), tant: T.at("repos:Tant"), rien: T.at("repos:rien"), reposEnd: T.at("repos$"),
    zero: T.at("zero"), tuTouches: T.at("zero:touches"), partie: T.at("zero:partie"), toi: T.at("zero:toi"),
    manque: T.at("manque"), sent: T.at("manque:sent"), bobine: T.at("manque:bobine"), aimant: T.at("manque:aimant"),
    clac: T.at("clac"), claque: T.at("clac:claque"), souvrent: T.at("clac:s'ouvrent"),
    stop: T.at("stop"), coupe: T.at("stop:coupé"), main: T.at("stop:main"),
    chute: T.at("chute"), vu: T.at("chute:vu"), ilManque: T.at("chute:manque"),
    verdict: T.at("verdict"), fils: T.at("verdict:fils"), diff: T.at("verdict:différentiel"), toiQuil: T.at("verdict:toi"),
    like: T.at("like"), likeMot: T.at("like:Like"), likeEnd: T.at("like$"),
    comment: T.at("comment"), commentaire: T.at("comment:commentaire"), trenteMa: T.at("comment:30"), commentEnd: T.at("comment$"),
    abo: T.at("abo"), deux: T.at("abo:deux"), panne: T.at("abo:panne"), aboEnd: T.at("abo$"),
    boucle: T.at("boucle"), boutonT: T.at("boucle:bouton"), mois: T.at("boucle:mois"), rewind: T.at("rewind"),
  };
  // the cuts
  const toBody = t.corps - 0.12;
  const toUnit = t.disj - 0.12;
  const toBench = t.ouvre - 0.14;
  const toTouch = t.zero - 0.4;
  const toRing = t.partie - 0.12;
  const toHand = t.stop - 0.12;
  const toChute = t.chute - 0.14;
  const toVerdict = t.verdict - 0.12;
  const toCta = t.like - 0.12;
  const back = Math.min(1.2, END - t.rewind - 0.04);
  const toHook = t.rewind + back * 0.45;

  // The story clock: thirty milliseconds, stretched from "Zéro" to "les contacts s'ouvrent".
  const keys = [[t.zero, 0], [t.sent, 6], [t.aimant, 14], [t.claque, 22], [t.souvrent, 30]];
  const msAt = (time) => {
    if (time <= keys[0][0] || time >= toHook) return 0;
    for (let i = 1; i < keys.length; i++) {
      if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    }
    return 30;
  };
  const LEAK = 150; // mA through you (an order of magnitude: 230 V across a wet body)
  const LOAD = 8.7; // A the dryer draws
  /** What is missing between the two wires, in mA, as the film shows it. */
  const leakAt = (time) => (time >= t.zero && time < t.souvrent ? LEAK : 0);
  // the dashes of the current: they run as long as the contacts are closed
  const live = (time) => time < t.souvrent || time >= toHook;
  // 2,6 cm/s: a seventh of the dashes' period per frame. Faster, big bright dashes hop from one place to the next: they strobe
  const flowAt = (time) => (time < t.souvrent ? time : time >= toHook ? time - toHook + t.souvrent : t.souvrent) * 2.6;

  const co = createCallouts(stage, $("callouts"), $("leaders"));
  const chips = []; // [element, anchor, dx, dy]: placed every frame on a point of the scene
  const follow = (id, anchor, dx, dy) => chips.push([$(id), anchor, dx, dy]);

  /* ════════════════════ 01 · MENACE ════════════════════ */
  setAct(tl, 1, 0);
  // A — "tu touches le fil… et ta main se referme dessus : impossible de lâcher"
  shot(0, t.referme, { d: 100, az: 145 }, "sine.inOut");
  st(t.referme - 0.1, 0.3, { clench: 1 }, "power3.out");
  jolt(t.referme, 0.35, 0.5);
  shot(t.referme - 0.15, t.promesse - t.referme, { tx: X + 26, ty: 108, tz: 14, d: 80, az: 140, el: 8 }, "power2.out"); // in on the hand as it closes

  // B — "quelque chose va lâcher à ta place": follow the wire into the wall, all the way to the unit next door
  const AT_UNIT = { tx: DEVICE.x + 6, ty: UNIT.y, tz: 4, d: 132, az: 14, el: 4, fov: 28, shift: 150, side: 0 };
  // first the whole wall: the flex, the socket, the two wires that leave along it… then along them
  const half = (t.et - t.promesse + 0.5) / 2;
  shot(t.promesse - 0.15, half, { tx: X - 20, ty: 140, tz: 0, d: 240, az: 62, el: 4, fov: 34, shift: 150, side: 0 });
  shot(t.promesse - 0.15 + half, half, AT_UNIT);
  st(t.promesse + half, 0.6, { mood: 0, gel: 0 });
  // C — "et ce n'est pas ton disjoncteur": it is the one that does nothing
  st(t.et, 0.4, { mine: 1 });
  st(t.disjMot - 0.1, 0.3, { dull: 1 });
  const cBreaker = co.add({ title: "Disjoncteur", sub: "Ne bouge pas", x: 700, y: 560, align: "start", tone: "danger", anchor: room.A.breaker });
  cBreaker.show(tl, t.disjMot - 0.2).hide(tl, toBody - 0.1);
  shot(t.et + 0.5, toBody - t.et - 0.5, { d: 118, az: 8 }, "sine.inOut");

  // "pieds nus sur le carrelage mouillé : 150 mA te traversent, par le cœur. passé trente, il peut s'arrêter."
  cut(toBody, IN_ROOM, { tx: X + 6, ty: 96, tz: 34, d: 790, az: 197, el: 5, shift: 150, side: 100 }, { focus: ON_YOU, mood: 1, gel: 0.1, mine: 0, dull: 0 });
  shot(toBody, toUnit - toBody, { d: 720, az: 186 }, "sine.inOut");
  follow("chip-skin", room.A.touch, -190, 46);
  follow("chip-heart", room.A.heart, 44, -62);
  follow("chip-limit", room.A.heart, 44, 34);
  show("#chip-skin", t.mouille - 0.2);
  show("#chip-heart", t.cent - 0.15);
  show("#chip-limit", t.trente - 0.2);
  hide(["#chip-skin", "#chip-heart", "#chip-limit"], toUnit - 0.14, 0.12);

  // "ton disjoncteur, lui, ne bouge pas : il attend seize ampères. cinq cents fois trop."
  cut(toUnit, IN_ROOM, { ...AT_UNIT, tx: DEVICE.x + 9, d: 96, az: 8, shift: -150 }, { focus: ON_UNIT, mine: 1, dull: 1, mood: 0, gel: 0 });
  // the row of breakers is a striped pattern: slid across fast, it strobes. The camera drifts toward the neighbour all along, slowly
  shot(toUnit, t.boite - toUnit, { tx: DEVICE.x + 3.5, d: 88, az: 2 }, "sine.inOut");
  tl.fromTo("#versus", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.bouge - 0.2);
  tl.fromTo("#vs-toi .vs__bar", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, t.bouge);
  tl.fromTo("#vs-disj", { opacity: 0.25 }, { opacity: 1, duration: 0.2 }, t.seize - 0.3);
  tl.fromTo("#vs-disj .vs__bar", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.out" }, t.seize - 0.2);
  tl.to("#versus", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.boite - 0.1);

  // "mais juste à côté, une autre boîte compte… autre chose" — the neighbour, face on
  const FACE = { tx: DEVICE.x, ty: UNIT.y, tz: 4, d: 46, az: 0, el: 0, fov: 28, shift: 150, side: 0 };
  shot(t.boite - 0.1, 1.8, FACE, "sine.inOut");
  st(t.boite, 0.5, { mine: 0, dull: 0 });
  st(t.cote - 0.1, 0.6, { aura: 0.8 });
  co.add({ title: "Différentiel", sub: "30 mA", x: 300, y: 620, align: "end", tone: "system", anchor: room.A.device }).show(tl, t.autre - 0.3).hide(tl, toBench - 0.2);

  /* ════════════════════ 02 · AUTOPSIE (sur l'établi) ════════════════════ */
  setAct(tl, 2, t.ouvre);
  // the same device, on its back on the bench, where the last picture left it on the screen
  cut(toBench, BENCH, { tx: 0, ty: BOX.d, tz: 0, d: 46, az: 180, el: 86, shift: 150 }, { bAura: 0.8, pool: 0.22, grid: 0.18, mood: 0, gel: 0 });
  st(toBench, 0.7, { bAura: 0 }, "power2.out");
  const OPEN = { tx: 0, ty: 6.3, tz: -0.4, d: 64, az: 154, el: 24, shift: 150, side: -50 }; // from the load side: the ring in front, nothing hiding it
  st(t.explode, 2.0, { explode: 1 }, "none");
  shot(t.explode - 0.35, 2.4, OPEN);
  shot(t.manette, t.eclateEnd - t.manette + 0.3, { az: 144, el: 22 }, "sine.inOut");
  const cLever = co.add({ title: "Manette", x: 290, y: 600, align: "end", anchor: dev.A.lever });
  const cSpring = co.add({ title: "Ressort", sub: "Armé", x: 290, y: 800, align: "end", anchor: dev.A.spring });
  const cRing = co.add({ title: "Anneau", sub: "Le cœur", x: 290, y: 1010, align: "end", tone: "system", anchor: dev.A.ring });
  cLever.show(tl, t.manette - 0.1);
  cSpring.show(tl, t.ressort - 0.1);
  cRing.show(tl, t.anneau - 0.2);
  [cLever, cSpring, cRing].forEach((c) => c.hide(tl, t.repos - 0.1));

  // "tes deux fils passent dedans. tant qu'il revient autant de courant qu'il en part, l'anneau ne sent rien."
  const CORE = { tx: 0, ty: 2.3, tz: -1.0, d: 34, az: 150, el: 30, shift: -150, side: 0 };
  st(t.repos - 0.1, 1.2, { explode: 0 }, "none");
  st(t.repos - 0.1, 0.5, { cover: 0, shell: 0.12 });
  shot(t.repos - 0.1, 1.5, CORE);
  st(t.dedans - 0.2, 0.5, { flow: 1 });
  shot(t.repos + 1.4, toTouch - t.repos - 1.4, { d: 30, az: 160 }, "sine.inOut");
  tl.fromTo("#gauge", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.tant - 0.2);
  tl.set("#gauge-s1", { opacity: 0 }, 0);
  tl.to("#gauge", { opacity: 0, duration: 0.15 }, toTouch - 0.17);

  /* ════════════════════ 03 · RÉPONSE ════════════════════ */
  setAct(tl, 3, t.zero);
  // T+00 — "zéro. tu touches." The first picture again: this time the clock runs.
  cut(toTouch, IN_ROOM, { ...POSE0, d: 98, az: 170 }, { focus: ON_YOU, grip: 0, clench: 0, shock: 0, hot: 0.5, lack: 0, mood: 0, gel: 0 });
  st(toTouch, 0.36, { grip: 1 }, "power2.out");
  shot(toTouch, toRing - toTouch, { d: 84, az: 162 }, "sine.out");
  tw.fromTo(S, { pop: 0 }, { pop: 1, duration: 0.32, ease: "none", immediateRender: false }, t.zero - 0.02);
  st(t.zero - 0.02, 0.12, { shock: 1, hot: 1, clench: 1, lack: 1, mood: 1, gel: 0.1 }, "power2.out");
  jolt(t.zero, 0.6, 0.6);
  blip("#flash", t.zero, 0.06, 0.04, 0.3);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.zero);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.6, ease: "power2.out" }, t.zero + 0.12);
  show("#hud-count", t.zero, 0.15);

  // "une partie du courant ne revient plus : elle passe par toi" — the ring: fewer dashes come back
  cut(toRing, BENCH, { ...CORE, d: 31, az: 156 }, { bLack: 1, sense: 0, flow: 1, cover: 0, shell: 0.12, explode: 0, mood: 1, gel: 0.08, pool: 0.2 });
  shot(toRing, t.manque - toRing, { d: 28, az: 164 }, "sine.inOut");
  tl.fromTo("#gauge", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, toRing + 0.05);
  tl.to("#gauge-fill", { backgroundColor: "#ff5b2e", duration: 0.12 }, toRing + 0.1);
  tl.to("#gauge-s0", { opacity: 0, duration: 0.1 }, toRing + 0.1);
  tl.to("#gauge-s1", { opacity: 1, duration: 0.1 }, toRing + 0.18);

  // "l'anneau sent ce qui manque. ce manque réveille une bobine… qui fait lâcher un aimant."
  st(t.sent - 0.1, 0.4, { sense: 1 }, "power2.out");
  shot(t.manque, t.bobine - t.manque, { tx: 0.5, ty: 2.6, tz: -0.9, d: 24, az: 148, el: 34 }, "sine.inOut");
  tw.fromTo(S, { pulse: 0 }, { pulse: 1, duration: Math.max(0.4, t.aimant - t.bobine), ease: "power1.in", immediateRender: false }, t.bobine - 0.05);
  co.add({ title: "Bobine", x: 300, y: 900, align: "end", anchor: dev.A.coil }).show(tl, t.bobine - 0.25).hide(tl, t.aimant - 0.1);
  shot(t.bobine, t.aimant - t.bobine + 0.3, { tx: 1.2, ty: 2.5, tz: -0.25, d: 17, az: 104, el: 22, shift: 140 }, "sine.inOut"); // clear of the captions
  st(t.aimant, 0.22, { paddle: 1 }, "back.out(2.4)");
  jolt(t.aimant, 0.25, 0.3);
  tl.to("#gauge", { opacity: 0, duration: 0.15 }, t.clac - 0.25);

  // "le ressort claque. les contacts s'ouvrent."
  shot(t.clac - 0.15, 0.9, { tx: 0, ty: 3.2, tz: 0.9, d: 34, az: 118, el: 30, shift: 60 }, "power3.out");
  st(t.claque - 0.02, 0.14, { off: 1 }, "power3.in");
  jolt(t.claque + 0.1, 0.6, 0.6);
  tw.fromTo(S, { arc: 0 }, { arc: 1, duration: 0.3, ease: "none", immediateRender: false }, t.claque + 0.06);
  blip("#flash", t.claque + 0.1, 0.06, 0.03, 0.3);
  st(t.souvrent, 0.25, { flow: 0, sense: 0 });
  shot(t.clac + 0.8, toHand - t.clac - 0.8, { d: 32, az: 108 }, "sine.inOut");

  // T+30 — "moins de quarante millisecondes. le courant est coupé. ta main s'ouvre."
  cut(toHand, IN_ROOM, { ...POSE0, d: 130, az: 158, el: 5, shift: 170 }, // further back: the heart and the hand that opens, both clear of the text
    { focus: ON_YOU, shock: 0, hot: 0, lack: 0, live: 0, mood: 0, gel: 0, grip: 1, clench: 1 });
  shot(toHand, toChute - toHand, { d: 138, az: 150 }, "sine.inOut");
  st(t.main - 0.1, 0.5, { clench: 0 }, "power2.out");
  st(t.main, 0.9, { grip: 0 }, "power2.inOut");
  tl.to("#hud-count", { color: "#5cffb0", duration: 0.3 }, toHand);

  /* ════════════════════ chute ════════════════════ */
  // "il ne t'a jamais vu. il sait seulement… qu'il manque quelque chose."
  cut(toChute, BENCH, { tx: 0, ty: 2.5, tz: -1.6, d: 28, az: 208, el: 20, shift: -200, side: 0 }, { off: 0, paddle: 0, sense: 0, flow: 1, bLack: 0, cover: 0, shell: 0.12, pool: 0.24 });
  shot(toChute, toVerdict - toChute, { d: 24, az: 192 }, "sine.inOut"); // the ring first, the lever behind it
  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.chute + 0.4);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.vu + 0.3);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.ilManque - 0.35);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.ilManque - 0.2);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, toVerdict - 0.25);

  // "le disjoncteur protège tes fils. le différentiel, c'est toi qu'il protège." — back at the unit: each one its job
  cut(toVerdict, IN_ROOM, { ...AT_UNIT, tx: DEVICE.x + 7, d: 92, az: 6 }, { focus: ON_UNIT, live: 1, mine: 1, dull: 0, aura: 0, grip: 0, clench: 0 });
  shot(toVerdict, toCta - toVerdict, { d: 84, az: -2 }, "sine.inOut");
  co.add({ title: "Tes fils", sub: "Le disjoncteur", x: 700, y: 560, align: "start", anchor: room.A.breaker }).show(tl, t.fils - 0.3).hide(tl, toCta - 0.15);
  st(t.diff - 0.1, 0.5, { aura: 0.9, mine: 0 });
  co.add({ title: "Toi", sub: "Le différentiel", x: 300, y: 1010, align: "end", tone: "system", anchor: room.A.device }).show(tl, t.toiQuil - 0.3).hide(tl, toCta - 0.15);

  /* ════════════════════ appels à l'action (sur l'établi) ════════════════════ */
  // LIKE — for the one who has never looked at their consumer unit
  cut(toCta, BENCH, { tx: 0, ty: 3, tz: 0, d: 66, az: 150, el: 28, shift: -90, side: 20 }, { cover: 1, shell: 1, off: 0, flow: 0, pool: 0.26, grid: 0.16 });
  shot(toCta, t.comment - toCta - 0.15, { az: 166, d: 62 }, "sine.inOut");
  likeNet(tl, {
    showAt: t.likeMot - 0.15,
    hideAt: t.likeEnd + 0.12,
    hits: [[7, T.at("like:jamais")], [4, T.at("like:tableau")], [10, T.at("like:trois")], [2, T.at("like:urgences")]],
    label: (n) => `Tableaux vérifiés ${n}/12`,
  });
  rail(tl, "rail-like", t.likeMot, t.likeEnd + 0.12);

  // COMMENTAIRE — what do you read on yours?
  shot(t.comment - 0.15, 1.5, { tx: 0, ty: BOX.d, tz: -1.2, el: 80, az: 180, d: 44, shift: -90, side: 0 });
  typeAnswer(tl, { showAt: t.commentaire, typedAt: t.trenteMa, chars: 5, hideAt: t.commentEnd + 0.12 });
  rail(tl, "rail-comment", t.commentaire, t.commentEnd + 0.12);
  co.add({ title: "30 mA", sub: "Écrit ici", x: 300, y: 1130, align: "end", tone: "system", anchor: dev.A.plate }).show(tl, t.trenteMa - 0.1).hide(tl, t.commentEnd + 0.1);

  // ABONNEMENT — the next file, classified
  shot(t.abo - 0.15, 1.6, { tx: 0, ty: 3, tz: 0, el: 30, az: 152, d: 72, shift: -210, side: 20 });
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.abo + 0.3);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.deux - 0.6);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.deux - 0.1);
  rail(tl, "rail-follow", t.abo + 0.1, t.aboEnd + 0.15);
  tl.to("#next", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.boucle + 0.1);

  /* ════════════════════ rebouclage ════════════════════
     "teste-le : le bouton T, une fois par mois" — the button, pressed; the lever drops.
     "car dans tes murs, il y a toujours…" → your hand on the wire: "Deux cent trente volts." */
  shot(t.boucle, 1.2, { tx: 0, ty: BOX.d, tz: -1.4, el: 62, az: 162, d: 40, shift: -40, side: 0 });
  st(t.boutonT - 0.15, 0.14, { press: 1 }, "power2.out");
  st(t.boutonT + 0.02, 0.12, { off: 1 }, "power3.in");
  jolt(t.boutonT + 0.1, 0.3, 0.4);
  st(t.boutonT + 0.3, 0.3, { press: 0 });
  co.add({ title: "Bouton T", sub: "Une fois par mois", x: 300, y: 1090, align: "end", tone: "system", anchor: dev.A.button }).show(tl, t.boutonT - 0.35).hide(tl, t.rewind - 0.2);
  shot(t.rewind, toHook - t.rewind, { d: 70, el: 70 }, "power3.in");
  cut(toHook, IN_ROOM, { ...POSE0, d: 104 }, { ...FIRST });
  shot(toHook, END - toHook, POSE0, "power2.out");
  blip("#flash", toHook, 0.06, 0.03, 0.3);
  setAct(tl, 1, toHook);
  tl.to("#hud-count", { opacity: 0, duration: 0.15 }, toHook - 0.15);
  tl.set("#hud-count", { color: "#ff5b2e" }, toHook);

  brandHud(tl, { decodedAt: t.ilManque, resetAt: toHook });

  /* ───────────────────────── text on screen, commit ───────────────────────── */
  const HOOK = ["accroche", "promesse"];
  const handOver = END - 0.34; // the last caption leaves, the first card of the hook is back
  buildHook($("hook"), EP, tl, { beats: HOOK, loopAt: handOver });
  buildCaptions($("captions"), EP, tl, { skip: HOOK, lastEnd: handOver });
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => {
    if (s.cut) return tw.set(cam, s.pose, s.at);
    const room_ = (shots[i + 1]?.at ?? END) - s.at;
    tw.to(cam, { ...s.pose, duration: Math.min(s.dur, Math.max(0.05, room_)), ease: s.ease }, s.at);
  });

  /* ───────────────────────── per-frame: state → world ───────────────────────── */
  const mix = new THREE.Color();
  const rim = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgHot = new THREE.Color(0x150b07);
  stage.grade.gel.copy(SIGNAL);
  const FOCUS = [
    { x: X + 4, y: 100, z: 36, scale: 70 },
    { x: DEVICE.x + 5, y: UNIT.y, z: 4, scale: 14 },
  ];

  stage.onUpdate((time) => {
    tw.time(time);
    const px = stage.pixelScale();
    const inRoom = S.set === IN_ROOM;
    bench.visible = !inRoom;
    room.group.visible = inRoom;
    scene.fog.density = inRoom ? 0.0008 : 0.004;
    Object.assign(stage.focus, inRoom ? FOCUS[S.focus] : { x: 0, y: 0, z: 0, scale: 8 });
    stage.grade.gelAmount = S.gel;
    mix.copy(VEILLE).lerp(SIGNAL, S.mood);
    const flow = flowAt(time);

    if (inRoom) {
      room.update({ grip: S.grip, clench: S.clench, shock: S.shock, hot: S.hot, pop: S.pop, flow: flow * 7, lack: S.lack, live: S.live, lines: S.lines, body: S.body, mine: S.mine, dull: S.dull, mood: mix }, time, px);
      inUnit.pose({ aura: S.aura, off: S.live < 0.5 ? 1 : 0 });
    }

    // the bench: taken apart, or at work
    explode(partList, S.explode);
    setPartOpacity(dev.parts.cover, S.cover);
    setPartOpacity(dev.parts.shell, S.shell);
    dev.pose({ off: S.off, paddle: S.paddle, sense: S.sense, pulse: S.pulse, arc: S.arc, out: flow, back: flow, flow: S.flow, lack: S.bLack, press: S.press, aura: S.bAura });

    cam.roll = S.shake * Math.sin(time * 30) * 1.1;
    // pale plastic takes a coloured rim like paint: on the bench the rim is mostly ink
    rim.copy(mix).lerp(INK, inRoom ? 0 : 0.6);
    lights.rim.color.copy(rim);
    lights.rim.intensity = inRoom ? 1.3 + S.mood * 1.2 : 0.55 + S.mood * 0.5;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgHot, S.mood * 0.8);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = 0.1;
    motes.update(time, px);
  });

  /* ───────────────────────── per-frame: the chrono, the gauge, the chips ───────────────────────── */
  const hudClock = $("hud-clock");
  const hudCount = $("hud-count-v");
  const gaugeL = $("gauge-l");
  const gaugeV = $("gauge-v");
  const gaugeFill = $("gauge-fill");
  const GAUGE_MAX = 200; // mA at the right end of the gauge
  $("gauge-th").style.left = `${(30 / GAUGE_MAX) * 100}%`;
  stage.onProject((time) => {
    const before = time < t.zero || time >= toHook;
    const leak = leakAt(time);
    hudClock.textContent = before ? "230 V" : `T+${String(Math.round(msAt(time))).padStart(2, "0")} ms`;
    hudCount.textContent = `${leak} mA`;
    const on = live(time);
    gaugeL.textContent = on ? `Part ${comma(LOAD + leak / 1000, 2)} A · revient ${comma(LOAD, 2)} A` : "Part 0,00 A · revient 0,00 A";
    gaugeV.textContent = `${leak} mA`;
    gaugeFill.style.transform = `scaleX(${clamp01(leak / GAUGE_MAX).toFixed(4)})`;
    for (const [el, anchor, dx, dy] of chips) {
      const p = stage.project(anchor);
      el.style.transform = `translate(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px)`;
    }
  });

  stage.start();
  return tl;
}

window.SD = { build };
