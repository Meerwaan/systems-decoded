// DOSSIER 006 — Défibrillateur. Two sets:
//   the HALL (a station concourse seen like an X-ray: the one who falls, the witness, TOI, and on
//   the wall, thirty metres away, the green box) and the BENCH (what is in the box, taken apart).
//   01 MENACE is one move: the fall → along the wall to the box → up, to see how far it is →
//   down into the chest, where the heart only trembles → back to the three of them → TOI runs.
//   02 AUTOPSIE on the bench, part by part. 03 RÉPONSE in the hall: the electrodes, the voice of
//   the box, ten seconds of reading, the charge — then ten milliseconds, slowed down: the current
//   through the heart, every cell off at once, the silence… and the heart starts again by itself.
// The story clock: T+0:00 when the heart stops pumping. It runs on, faster than the film (the box
// is thirty metres away), until the shock at T+2:50. Every minute costs ten chances out of a hundred.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { explode, setPartOpacity } from "@kit/build3d.js";
import { buildCaptions, buildHook, createCallouts, setAct, brandHud, rail, likeNet, typeAnswer } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildAED } from "./model.js";
import { buildHall, HALL, BOX, SPOT } from "./hall.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const BENCH = 0;
const IN_HALL = 1;
const X = HALL.x;

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { fog: 0.0016, scale: 30, far: 40000 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const surface = makeSurface({ radius: 700, cell: 6, fade: 120 });
  const pool = makePool({ radius: 62 });
  const motes = makeMotes({ count: 220, seed: 5, min: [-90, 2, -90], size: [180, 110, 180], psize: [0.4, 1.4], drift: [0.4, -0.7, 0.2] });
  const aed = buildAED();
  const bench = new THREE.Group();
  bench.add(surface.group, pool.mesh, motes.points, aed.root);
  const hall = buildHall();
  scene.add(bench, hall.group);
  const partList = Object.values(aed.parts);

  /* ───────────────────────────── state ───────────────────────────── */
  // The first frame is the hook: someone is falling, the heart alight with chaos — and far along the wall, the green box.
  const POSE0 = { tx: X - 8, ty: 76, tz: 4, d: 420, az: -70, el: 6, fov: 44, shift: 130, side: 100, roll: 0 };
  const FIRST = {
    set: IN_HALL, cast: 1, collapse: 0.5, witness: 0, push: 0, off: 0, toi: 0, toiS: 0,
    boxAt: 0, pad1: 0, pad2: 0, armed: 0, charge: 0, listen: 0, speak: 0,
    chaos: 1, order: 0, flash: 0, heartDim: 1, halo: 1, shock: 0,
    route: 0, call: 0, lines: 1, beacon: 1.4, far: 1, ground: 0.2, door: 0, sign: 1, ghost: 0,
    explode: 0, out: 0, lidA: 1, bArmed: 0, bCharge: 0, bListen: 0, days: 0, ms: 0, ecg: 0,
    pool: 0.24, grid: 0.16, mood: 1, gel: 0,
  };
  const S = { ...FIRST, shake: 0 };
  Object.assign(cam, POSE0);
  window.SD.S = S; // for the trial frames

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage, below)
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const now = (at, props) => tw.set(S, props, at);
  const shots = [];
  /**
   * A move of the camera. `fromD`: for a dive or a long pull-back, the distance it leaves from — the distance then
   * changes by ratio, not by centimetres, and the subject grows at an even pace all the way. (In centimetres, the last
   * metre of a dive goes by in three frames.) The point it aims at moves with the distance: aimed at by halves while
   * the camera is still far, the subject would leave the picture in the middle of the dive.
   */
  const shot = (at, dur, pose, ease = "power2.inOut", fromD = null) => shots.push({ at, dur, pose, ease, fromD });
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
  const show = (sel, at, dur = 0.3) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: dur }, at);
  const hide = (sel, at, dur = 0.2) => tl.to(sel, { opacity: 0, duration: dur }, at);
  const seen = new Set();
  /** A panel of the top slot, from `at` to `until`. Shown again later, it must not be reset at once (it is already hidden). */
  /** The same picture from the same place, aimed at a nearer point of the same line of sight: where the next move should leave from. */
  const reaim = (pose, d) => {
    const az = (pose.az * Math.PI) / 180;
    const el = (pose.el * Math.PI) / 180;
    const k = pose.d - d;
    return { roll: 0, side: 0, ...pose, d, tx: pose.tx + k * Math.sin(az) * Math.cos(el), ty: pose.ty + k * Math.sin(el), tz: pose.tz + k * Math.cos(az) * Math.cos(el) };
  };
  const panel = (sel, at, until) => {
    tl.fromTo(sel, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: !seen.has(sel) }, at);
    tl.to(sel, { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, until);
    seen.add(sel);
  };

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    effondre: T.at("accroche:s'effondre"), devant: T.at("accroche:Devant"), pompe: T.at("accroche:pompe"),
    promesse: T.at("promesse"), mur: T.at("promesse:mur"), boiteMot: T.at("promesse:boîte"), sauver: T.at("promesse:sauver"), tu: T.at("promesse:Tu"), decide: T.at("promesse:décide"), encore: T.at("promesse:Encore"), ou: T.at("promesse:où"),
    tremble: T.at("tremble"), trembleMot: T.at("tremble:tremble"), goutte: T.at("tremble:goutte"),
    compte: T.at("compte"), minute: T.at("compte:minute"), dix: T.at("compte:dix"), secours: T.at("compte:secours"), quart: T.at("compte:quart"),
    chaine: T.at("chaine"), appelle: T.at("chaine:appelle"), masse: T.at("chaine:masse"), toi: T.at("chaine:Toi"), laBoite: T.at("chaine:boîte"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    electrodes: T.at("eclate:électrodes"), batterie: T.at("eclate:batterie"), condo: T.at("eclate:condensateur"), puce: T.at("eclate:puce"), ecoute: T.at("eclate:écoute"),
    repos: T.at("repos"), annees: T.at("repos:années"), teste: T.at("repos:teste"), voyant: T.at("repos:Voyant"), prete: T.at("repos:prête"),
    colle: T.at("colle"), colles: T.at("colle:colles"), electrodes2: T.at("colle:électrodes"), parle: T.at("colle:parle"), touchez: T.at("colle:touchez"),
    analyse: T.at("analyse"), lit: T.at("analyse:lit"), chaosMot: T.at("analyse:chaos"), chargeMot: T.at("analyse:charge"), analyseEnd: T.at("analyse$"),
    choc: T.at("choc"), volts: T.at("choc:mille"), ms: T.at("choc:dix"), chocEnd: T.at("choc$"),
    eteint: T.at("eteint"), traverse: T.at("eteint:traverse"), seteignent: T.at("eteint:s'éteignent"), meme: T.at("eteint:même"),
    repart: T.at("repart"), repartMot: T.at("repart:repart"), seul: T.at("repart:seul"),
    chute: T.at("chute"), relance: T.at("chute:relance"), arrete: T.at("chute:l'arrête"), redemarre: T.at("chute:redémarre"), luiMeme: T.at("chute:lui-même"),
    refuse: T.at("refuse"), bat: T.at("refuse:bat"), refuseMot: T.at("refuse:refuse"), blesser: T.at("refuse:blesser"), refuseEnd: T.at("refuse$"),
    like: T.at("like"), likeMot: T.at("like:Like"), likeEnd: T.at("like$"),
    comment: T.at("comment"), commentaire: T.at("comment:commentaire"), proche: T.at("comment:proche"), sais: T.at("comment:sais"), quinze: T.at("comment:15"), commentEnd: T.at("comment$"),
    abo: T.at("abo"), avion: T.at("abo:avion"), fusee: T.at("abo:fusée"), aboEnd: T.at("abo$"),
    boucle: T.at("boucle"), repere: T.at("boucle:repère"), jour: T.at("boucle:jour"), rewind: T.at("rewind"),
  };
  // the cuts
  const toBox = t.laBoite - 0.12;
  const toBench = t.explode - 0.14;
  const toHall = t.colle - 0.14;
  const toButton = t.chargeMot - 0.3;
  const toShock = t.choc - 0.1;
  const toCta = t.like - 0.12;
  const toTomorrow = t.boucle - 0.12;
  const back = Math.min(1.2, END - t.rewind - 0.04);
  const toHook = t.rewind + back * 0.45;
  // the shock, the cells off, the first beat
  const tShock = t.choc + 0.12;
  const tDark = t.seteignent;
  const tBeat = t.repartMot - 0.05;
  const PULSE = 60 / 65; // one beat: the picture and the sound share this clock
  hall.heart.restart(tBeat, PULSE);

  // The story clock, in seconds since the heart stopped pumping. It runs faster than the film.
  const keys = [[0, 0], [t.tremble, 14], [t.compte, 24], [t.chaine, 40], [t.toi, 50], [toBox, 68], [toBench, 74], [t.repos, 110], [toHall, 148], [t.analyse, 154], [t.chargeMot, 164], [tShock, 170]];
  const secAt = (time) => {
    if (time >= toHook) return 0;
    if (time >= tShock) return 170;
    for (let i = 1; i < keys.length; i++) {
      if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    }
    return 170;
  };
  const stamp = (s) => `T+${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const chancesAt = (s) => Math.round(100 - (10 * s) / 60);

  const co = createCallouts(stage, $("callouts"), $("leaders"));
  const chips = []; // [element, anchor, dx, dy]: placed every frame on a point of the scene (or fixed, without an anchor)
  const follow = (id, anchor, dx, dy) => chips.push([$(id), anchor, dx, dy]);

  /* ════════════════════ 01 · MENACE — one move ════════════════════ */
  setAct(tl, 1, 0);
  // A — "quelqu'un s'effondre. devant toi, son cœur ne pompe plus."
  st(0.02, 0.85, { collapse: 1 }, "power1.in");
  jolt(0.85, 0.3, 0.4);
  shot(0, t.promesse - 0.25, { tx: X - 30, ty: 38, d: 400, az: -60, el: 13, fov: 44, side: 30 }, "sine.inOut");
  // B — "au mur, une boîte verte peut le sauver" — along the wall, to the box
  const BOXWIDE = { tx: X + BOX.x, ty: 150, tz: BOX.z, d: 2650, az: -81, el: 1.5, fov: 30, shift: 150, side: 0 };
  const BOXCLOSE = { tx: X + BOX.x, ty: BOX.y + 12, tz: BOX.z, d: 210, az: -16, el: 3, fov: 28, shift: 40, side: 0 };
  shot(t.promesse - 0.25, 1.5, BOXWIDE);
  st(t.promesse, 1.0, { halo: 0.6, far: 1.3 });
  shot(t.promesse + 1.3, t.tu - t.promesse - 1.4, { d: 1500, az: -74 }, "sine.inOut");
  follow("chip-box", hall.A.sign, -330, -60);
  show("#chip-box", t.boiteMot);
  hide("#chip-box", t.tu + 0.3);
  // "tu ne peux pas te tromper : c'est elle qui décide"
  shot(t.tu - 0.15, t.encore - t.tu - 0.1, BOXCLOSE, "sine.inOut", 1500);
  st(t.tu, 1.2, { far: 0.15, beacon: 1, sign: 0.12 });
  // C — "encore faut-il… savoir où elle est" — the camera backs away from the box without letting go of it, down the
  // whole hall, to high behind the one who fell: here the orange, over there the green, between the two, thirty metres
  const WHERE = { tx: X + BOX.x, ty: BOX.y, tz: BOX.z, d: 3821, az: -81.7, el: 3.56, fov: 62, shift: 490, side: 0 };
  shot(t.encore - 0.25, 1.7, WHERE, "sine.inOut", BOXCLOSE.d);
  st(t.encore, 1.0, { route: 1.6, far: 1.5, halo: 3, beacon: 2, lines: 1.5, ground: 0.5 });
  st(t.encore + 0.5, 0.5, { sign: 1 }); // the sign above the box: back on once the box has shrunk away from the header
  follow("chip-far", hall.A.routeMid, 60, -30);
  show("#chip-far", t.encore + 1.35);
  hide("#chip-far", t.tremble - 1.1);

  // "son cœur ne s'est pas arrêté. il tremble. et plus une goutte de sang ne part." — down into the chest
  const HEART = { tx: X + SPOT.heart.x, ty: SPOT.heart.y + 1, tz: SPOT.heart.z, d: 86, az: 10, el: 40, fov: 28, shift: -70, side: 0 };
  shots.push({ at: t.tremble - 1.15, cut: true, pose: reaim(WHERE, 900) }); // same picture, aimed close: the dive does not swing out of the hall
  shot(t.tremble - 1.15, 1.95, HEART, "sine.inOut", 900);
  st(t.tremble - 0.9, 1.2, { halo: 0.06, route: 0, far: 0, beacon: 1, lines: 1, ground: 0.07 });
  shot(t.tremble + 0.8, t.compte - t.tremble - 1.5, { d: 76, az: -8 }, "sine.inOut");
  st(t.trembleMot - 0.3, 0.3, { ecg: 1 });
  panel("#ecg", t.trembleMot - 0.25, t.compte - 0.3);
  tl.set(["#ecg-s1", "#ecg-s2", "#ecg-v0", "#ecg-v1"], { opacity: 0 }, 0);
  follow("chip-flow", hall.A.heart, 60, 150);
  show("#chip-flow", t.goutte - 0.1);
  hide("#chip-flow", t.compte - 0.3);

  // "chaque minute : dix pour cent de chances en moins. les secours ? un quart d'heure."
  const GROUP = { tx: X - 30, ty: 44, tz: -14, d: 640, az: 24, el: 11, fov: 28, shift: -90, side: 0 };
  now(t.compte - 0.6, { witness: 1, off: 1 }); // as the camera leaves the chest, the witness is down on the knees…
  st(t.compte - 0.35, 1.25, { off: 0 }, "power2.inOut"); // …and the hands come to the breastbone
  shot(t.compte - 0.7, 2.2, GROUP, "sine.inOut", 76);
  st(t.compte - 0.2, 0.9, { halo: 0.8, ecg: 0, ground: 0.22 });
  panel("#odds", t.minute - 0.3, t.chaine - 0.25);
  const bars = Array.from({ length: 10 }, (_, i) => {
    const bar = document.createElement("div");
    bar.className = "odd";
    bar.style.left = `${(i / 15.6) * 100}%`;
    bar.style.height = `${100 - i * 10}%`;
    $("odds-plot").prepend(bar);
    tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 0.22, ease: "power2.out" }, t.minute + i * 0.13);
    return bar;
  });
  void bars;
  $("odds-help").style.left = `${(15 / 15.6) * 100 + 1.2}%`;
  tl.fromTo("#odds-help", { opacity: 0 }, { opacity: 1, duration: 0.25 }, t.secours - 0.05);
  shot(t.compte + 1.5, t.chaine - t.compte - 1.7, { d: 600, az: 18 }, "sine.inOut");

  // "un témoin appelle le 15, et masse. toi : la boîte."
  st(t.appelle - 0.1, 0.3, { call: 1 });
  follow("chip-call", hall.A.phone, -330, -40);
  show("#chip-call", t.appelle + 0.1);
  hide("#chip-call", t.toi - 0.2);
  st(t.masse - 0.25, 0.4, { push: 1 }, "power2.out");
  shot(t.chaine, t.toi - t.chaine - 0.2, { tx: X - 40, ty: 46, d: 520, az: 12, el: 13, shift: 60 }, "sine.inOut");
  follow("chip-toi", hall.A.toi, -40, -70);
  show("#chip-toi", t.toi - 0.15, 0.15);
  hide("#chip-toi", t.toi + 0.9);
  now(t.toi + 0.2, { toi: 1 });
  st(t.toi + 0.2, toBox - t.toi - 0.2, { toiS: 0.2 }, "power1.in"); // TOI is off, along the dashes on the floor
  st(t.toi + 0.1, 0.4, { route: 1 });
  shot(t.toi, toBox - t.toi, { tx: X + 10, az: 6, d: 560 }, "sine.inOut");
  // "la boîte": TOI is there — and on "alors…", the door opens
  cut(toBox, IN_HALL, { ...BOXCLOSE, d: 300, az: -20 }, { toi: 3, far: 0.1, route: 0, halo: 0, beacon: 1, sign: 0.12 });
  shot(toBox, toBench - toBox, { d: 215, az: -12 }, "sine.inOut");
  st(t.ouvre - 0.05, toBench - t.ouvre + 0.05, { door: 1 }, "power2.inOut");

  /* ════════════════════ 02 · AUTOPSIE (sur l'établi) ════════════════════ */
  setAct(tl, 2, t.ouvre);
  // what was in the box, on the bench: same object, same place on the screen, seen from above as it hung
  cut(toBench, BENCH, { tx: 0, ty: 6, tz: 0, d: 170, az: 0, el: 66, shift: 150 }, { pool: 0.26, grid: 0.18, mood: 0, gel: 0, cast: 1 });
  // "alors… on l'ouvre"
  st(t.explode, 1.4, { explode: 1 }, "none");
  st(t.explode + 0.2, 1.3, { out: 1 });
  shot(t.explode - 0.3, 1.7, { tx: 0, ty: 18, tz: 5, d: 300, az: 24, el: 22, shift: 150 });
  // "deux électrodes."
  shot(t.electrodes - 0.45, 1.1, { tx: 0, ty: 3, tz: 15, d: 215, az: 10, el: 42, shift: 150 });
  const cPads = co.add({ title: "Électrodes", sub: "Lire, puis choquer", x: 300, y: 600, align: "end", anchor: aed.A.padL });
  cPads.show(tl, t.electrodes - 0.05);
  cPads.hide(tl, t.batterie - 0.4);
  // "une batterie."
  shot(t.batterie - 0.4, 0.95, { tx: -3, ty: 13.5, tz: 1, d: 120, az: -28, el: 22, shift: 150 });
  const cBatt = co.add({ title: "Batterie", sub: "4 ans en veille", x: 300, y: 620, align: "end", anchor: aed.A.battery });
  cBatt.show(tl, t.batterie - 0.05);
  cBatt.hide(tl, t.condo - 0.4);
  // "un condensateur." — it fills, to show what it is for, and empties
  shot(t.condo - 0.4, 0.95, { tx: 4, ty: 14.5, tz: 2, d: 108, az: 34, el: 20, shift: 150 });
  const cCap = co.add({ title: "Condensateur", sub: "Il stocke le choc", x: 330, y: 600, align: "end", anchor: aed.A.cap });
  cCap.show(tl, t.condo - 0.05);
  cCap.hide(tl, t.puce - 0.5);
  st(t.condo + 0.1, 0.8, { bCharge: 0.9 }, "power1.in");
  st(t.condo + 1.0, 0.5, { bCharge: 0 }, "power2.out");
  // "et une puce… qui écoute."
  shot(t.puce - 0.5, 1.2, { tx: -1.4, ty: 27.5, tz: -0.6, d: 88, az: 14, el: 40, shift: 150 });
  st(t.puce - 0.45, 0.5, { lidA: 0.08 }); // the lid steps aside: it was in the way of what decides
  st(t.puce + 0.1, 0.6, { bListen: 1 });
  const cChip = co.add({ title: "Puce", sub: "Elle seule décide", x: 300, y: 610, align: "end", tone: "system", anchor: aed.A.chip });
  cChip.show(tl, t.puce);
  cChip.hide(tl, t.repos - 0.2);

  // "chaque jour, depuis des années, elle se teste toute seule. voyant vert : prête."
  st(t.repos - 0.15, 1.2, { explode: 0, out: 0 }, "none");
  st(t.repos - 0.15, 0.5, { lidA: 1 });
  st(t.repos + 0.9, 0.5, { bListen: 0 });
  shot(t.repos - 0.2, 1.5, { tx: 0, ty: 6, tz: 0, d: 150, az: -22, el: 36, shift: -80, side: -40 });
  panel("#selftest", t.repos + 0.25, toHall - 0.25);
  st(t.repos + 0.3, t.voyant - t.repos - 0.3, { days: 1 }, "power2.in");
  tl.fromTo("#selftest-s", { opacity: 0.2 }, { opacity: 1, duration: 0.25 }, t.prete - 0.1);
  shot(t.voyant - 0.3, toHall - t.voyant + 0.3, { tx: 5, ty: 9.5, tz: -4, d: 84, az: -34, el: 30, shift: -80, side: -40 }, "sine.inOut");

  /* ════════════════════ 03 · RÉPONSE (dans le hall) ════════════════════ */
  setAct(tl, 3, t.colle);
  // "tu colles les électrodes."
  const CHEST = { tx: X + SPOT.chest.x + 2, ty: 18, tz: -1, d: 180, az: 86, el: 62, fov: 28, shift: 150, side: 0 };
  cut(toHall, IN_HALL, CHEST, { collapse: 1, witness: 1, push: 1, off: 0, toi: 2, boxAt: 1, halo: 0.35, chaos: 1, route: 0, far: 0, call: 1, mood: 1, gel: 0.08, lines: 1, beacon: 1, ground: 0.05, sign: 1, door: 1, ghost: 1 });
  st(t.colles - 0.3, 0.5, { pad1: 1 }, "power2.inOut");
  st(t.electrodes2 - 0.4, 0.6, { pad2: 1 }, "power2.inOut");
  shot(toHall, t.parle - toHall, { d: 165, az: 78 }, "sine.inOut");
  // "elle parle : ne touchez pas le patient."
  const DEVICE = { tx: X + SPOT.floorBox.x, ty: 10, tz: SPOT.floorBox.z, d: 185, az: 34, el: 30, fov: 28, shift: -110, side: 70 };
  cut(t.parle - 0.12, IN_HALL, { ...DEVICE, d: 205, az: 42 });
  shot(t.parle - 0.12, t.analyse - t.parle, DEVICE, "sine.inOut");
  st(t.parle, 0.3, { speak: 1 });
  st(t.analyse - 0.4, 0.25, { speak: 0 });
  follow("say-touch", null, 96, 470); // what it says takes the top slot: the camera travels
  show("#say-touch", t.touchez - 0.25, 0.2);
  hide("#say-touch", t.analyse - 0.35);
  st(t.touchez, 0.5, { push: 0, off: 1 }, "power2.out");

  // "dix secondes : elle lit le cœur. du chaos ? elle charge."
  const READ = { tx: X + SPOT.heart.x + 3, ty: 13, tz: -5.5, d: 140, az: -96, el: 70, fov: 28, shift: -80, side: 0 };
  cut(t.analyse - 0.12, IN_HALL, READ);
  shot(t.analyse - 0.12, toButton - t.analyse, { d: 124, az: -86 }, "sine.inOut");
  now(t.analyse - 0.12, { halo: 0.06, ecg: 1 });
  st(t.analyse - 0.1, 0.5, { listen: 1 });
  panel("#ecg", t.analyse, t.chargeMot - 0.45);
  tl.fromTo("#ecg-v1", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", immediateRender: false }, t.chaosMot + 0.35);
  // "elle charge": on the box, the button comes alive
  const BUTTON = { tx: X + SPOT.floorBox.x + 2, ty: 10, tz: SPOT.floorBox.z, d: 118, az: -36, el: 50, fov: 28, shift: 40, side: 0 };
  cut(toButton, IN_HALL, BUTTON, { halo: 0.3, ecg: 0 });
  shot(toButton, toShock - toButton, { d: 104, az: -28 }, "sine.inOut");
  st(toButton + 0.1, toShock - toButton - 0.35, { charge: 1 }, "power1.in");
  st(toShock - 0.25, 0.18, { armed: 1 }, "power2.out");
  follow("chip-charge", null, 96, 470);
  show("#chip-charge", toButton + 0.05, 0.12);
  hide("#chip-charge", toShock - 0.05, 0.05);

  // T+2:50 — "cent cinquante joules. plus de mille volts. dix millisecondes." — ten milliseconds, slowed down
  const SHOCK = { tx: X + SPOT.chest.x + 2, ty: 14, tz: -3, d: 165, az: -104, el: 62, fov: 28, shift: 150 };
  cut(toShock, IN_HALL, SHOCK, { halo: 0.12, listen: 0 });
  st(tShock, 0.07, { shock: 1, flash: 1 }, "power2.out");
  jolt(tShock, 0.55, 0.5);
  blip("#flash", tShock, 0.07, 0.03, 0.3);
  st(tShock + 0.07, 0.45, { shock: 0.42 }, "power2.out"); // the film slows down here: the current is still passing
  st(tShock + 0.07, 0.5, { flash: 0.3 }, "power2.out");
  st(tShock, t.meme - tShock, { ms: 1 }, "none");
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, tShock);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.6, ease: "power2.out" }, tShock + 0.12);
  follow("chip-ms", null, 96, 470);
  show("#chip-ms", tShock + 0.1, 0.15);
  hide("#chip-ms", t.repart - 0.2);
  shot(toShock, t.eteint - toShock - 0.2, { d: 140, az: -92 }, "sine.inOut");

  // "le courant traverse le cœur : toutes ses cellules s'éteignent. en même temps."
  const INSIDE = { tx: X + SPOT.heart.x, ty: SPOT.heart.y + 1, tz: SPOT.heart.z, d: 76, az: -86, el: 64, fov: 28, shift: -70, side: 0 };
  shot(t.eteint - 0.2, 1.3, INSIDE);
  st(t.eteint - 0.1, 0.6, { halo: 0.04 });
  st(tDark - 0.05, 0.1, { flash: 1 }, "power2.out"); // every cell at once…
  now(tDark + 0.05, { chaos: 0 });
  st(tDark + 0.05, 0.7, { flash: 0, shock: 0 }, "power2.out"); // …then nothing
  st(tDark, 0.5, { ecg: 1 });
  panel("#ecg", tDark + 0.1, t.chute - 0.3);
  tl.set("#ecg-v1", { opacity: 0 }, tDark);
  tl.to("#ecg-s0", { opacity: 0, duration: 0.1 }, tDark);
  tl.to("#ecg-s1", { opacity: 1, duration: 0.15 }, tDark + 0.1);

  // "silence… et le cœur repart. tout seul."
  shot(t.repart - 0.1, t.chute - t.repart, { d: 84, az: -74, el: 56 }, "sine.inOut");
  now(tBeat - 0.02, { order: 1 });
  st(tBeat, 0.6, { mood: 0, gel: 0 });
  tl.to("#ecg-s1", { opacity: 0, duration: 0.1 }, tBeat + 0.15);
  tl.to("#ecg-s2", { opacity: 1, duration: 0.15 }, tBeat + 0.25);
  tl.to("#hud-count", { color: "#5cffb0", duration: 0.3 }, tBeat + 0.2);

  /* ════════════════════ chute ════════════════════ */
  // "voilà le secret : elle ne relance pas un cœur. elle l'arrête. pour qu'il redémarre… de lui-même."
  const CALM = { tx: X + SPOT.chest.x + 1, ty: 18, tz: -1, d: 180, az: 88, el: 62, fov: 28, shift: -60, side: 0 };
  cut(t.chute - 0.12, IN_HALL, CALM, { halo: 0.5, ecg: 0, ground: 0.16 });
  tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.35 }, t.chute + 0.6);
  tl.to("#title-shade", { opacity: 0, duration: 0.25 }, t.refuse - 0.3);
  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.chute + 0.7);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.relance + 0.2);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.arrete - 0.15);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.arrete);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.refuse - 0.3);
  shot(t.chute - 0.12, t.refuse - t.chute, { d: 150, az: 78 }, "sine.inOut");

  // "un cœur qui bat ? elle refuse. tu ne peux blesser personne."
  cut(t.refuse - 0.12, IN_HALL, { ...BUTTON, d: 162, az: -50, shift: -40 }, { armed: 0, charge: 0, listen: 1, ecg: 1, halo: 0.4 });
  shot(t.refuse - 0.12, toCta - t.refuse, { d: 146, az: -40 }, "sine.inOut");
  panel("#ecg", t.refuse, toCta - 0.4);
  tl.set(["#ecg-s0", "#ecg-s1"], { opacity: 0 }, t.refuse - 0.05);
  tl.fromTo("#ecg-v0", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.2, ease: "back.out(2)", immediateRender: false }, t.refuseMot - 0.05);
  follow("chip-ready", hall.A.aed, 40, 150);
  show("#chip-ready", t.refuseMot + 0.25);
  hide("#chip-ready", toCta - 0.12, 0.12);

  /* ════════════════════ appels à l'action (sur l'établi) ════════════════════ */
  // LIKE — seven times out of ten, there is a witness
  cut(toCta, BENCH, { tx: 0, ty: 6, tz: 0, d: 236, az: 26, el: 26, shift: -150, side: 0 }, { explode: 0, out: 0, lidA: 1, bListen: 0, bCharge: 0, bArmed: 0, pool: 0.28, grid: 0.16, mood: 0, gel: 0, ecg: 0 });
  shot(toCta, t.comment - toCta - 0.15, { az: 12, d: 212 }, "sine.inOut");
  likeNet(tl, {
    showAt: t.likeMot - 0.15,
    hideAt: t.likeEnd + 0.12,
    hits: [[7, T.at("like:sept")], [4, T.at("like:il")], [10, T.at("like:témoin")], [2, T.at("like:vu")]],
    label: (n) => `Témoins prêts ${n}/12`,
  });
  rail(tl, "rail-like", t.likeMot, t.likeEnd + 0.12);

  // COMMENTAIRE — the nearest one: where is it?
  shot(t.comment - 0.15, 1.5, { tx: 0, ty: 6, tz: 0, d: 190, az: -8, el: 30, shift: -150, side: 0 });
  typeAnswer(tl, { showAt: t.commentaire, typedAt: t.proche + 0.5, chars: 9, hideAt: t.commentEnd + 0.12 });
  rail(tl, "rail-comment", t.commentaire, t.commentEnd + 0.12);
  blip("#flash", t.quinze, 0.05, 0.04, 0.3);

  // ABONNEMENT — the next file, classified
  shot(t.abo - 0.15, 1.6, { tx: 0, ty: 6, tz: 0, d: 215, az: 20, el: 26, shift: -260, side: 0 });
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.abo + 0.3);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.avion - 0.6);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.avion + 0.2);
  rail(tl, "rail-follow", t.abo + 0.1, Math.min(t.aboEnd + 0.15, toTomorrow - 0.3));
  tl.to("#next", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, toTomorrow - 0.38);

  /* ════════════════════ rebouclage ════════════════════
     "…demain, repère la boîte verte. parce qu'un jour, sur ton trajet…" → tomorrow, the same hall, nobody on the floor:
     only the box, on its wall. Then: "Quelqu'un s'effondre." */
  cut(toTomorrow, IN_HALL, { ...BOXWIDE, d: 1050, az: -44, shift: 60 }, { ...FIRST, cast: 0, chaos: 0, halo: 0, mood: 0, far: 1, beacon: 1.2, lines: 1.7 });
  st(toTomorrow + 0.4, 1.6, { far: 0.3 });
  shot(toTomorrow, t.rewind - toTomorrow, { ...BOXCLOSE, d: 400, az: -24, shift: -60 }, "sine.inOut", 1050);
  shot(t.rewind, toHook - t.rewind, { d: 520 }, "power2.in");
  cut(toHook, IN_HALL, { ...POSE0, d: POSE0.d + 40 }, { ...FIRST });
  shot(toHook, END - toHook, POSE0, "power2.out");
  blip("#flash", toHook, 0.05, 0.03, 0.3);
  setAct(tl, 1, toHook);
  tl.set("#hud-count", { color: "#ff5b2e" }, toHook);

  brandHud(tl, { decodedAt: t.arrete, resetAt: toHook });

  /* ───────────────────────── text on screen, commit ───────────────────────── */
  const HOOK = ["accroche", "promesse"];
  const handOver = END - 0.34; // the last caption leaves, the first card of the hook is back
  buildHook($("hook"), EP, tl, { beats: HOOK, loopAt: handOver });
  buildCaptions($("captions"), EP, tl, { skip: HOOK, lastEnd: handOver });
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => {
    if (s.cut) return tw.set(cam, s.pose, s.at);
    const room = (shots[i + 1]?.at ?? END) - s.at;
    const duration = Math.min(s.dur, Math.max(0.05, room));
    if (s.fromD == null) return tw.to(cam, { ...s.pose, duration, ease: s.ease }, s.at);
    const { d, tx, ty, tz, ...turn } = s.pose;
    const aim = Object.fromEntries(Object.entries({ d, tx, ty, tz }).filter(([, v]) => v !== undefined));
    const r = d / s.fromD;
    tw.to(cam, { ...turn, duration, ease: s.ease }, s.at);
    tw.to(cam, { ...aim, duration, ease: (u) => (Math.pow(r, 0.5 - 0.5 * Math.cos(Math.PI * u)) - 1) / (r - 1) }, s.at);
  });

  /* ───────────────────────── per-frame: state → world ───────────────────────── */
  const mix = new THREE.Color();
  const rim = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgHot = new THREE.Color(0x150b07);
  stage.grade.gel.copy(SIGNAL);
  const FOCUS = [
    { x: 0, y: 0, z: 0, scale: 30 },
    { x: X - 30, y: 30, z: 0, scale: 240 },
  ];

  stage.onUpdate((time) => {
    tw.time(time);
    const px = stage.pixelScale();
    bench.visible = S.set === BENCH;
    hall.group.visible = S.set === IN_HALL;
    scene.fog.density = S.set === BENCH ? 0.0016 : 0.00005;
    Object.assign(stage.focus, FOCUS[S.set]);
    stage.grade.gelAmount = S.gel;
    mix.copy(VEILLE).lerp(SIGNAL, S.mood);

    if (S.set === IN_HALL) {
      hall.update({ ...S, padsOn: [S.pad1, S.pad2] }, time, px);
    }
    // the bench: taken apart, or whole
    explode(partList, S.explode);
    setPartOpacity(aed.parts.lid, S.lidA);
    aed.pose({ led: 1, armed: S.bArmed, charge: S.bCharge, listen: S.bListen, out: S.out }, time);

    cam.roll = S.shake * Math.sin(time * 30) * 1.1;
    rim.copy(mix).lerp(INK, S.set === BENCH ? 0.5 : 0.35);
    lights.rim.color.copy(rim);
    lights.rim.intensity = 1.1 + S.mood * 0.7;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgHot, S.mood * 0.5);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = 0.1;
    motes.update(time, px);
  });

  /* ───────────────────────── per-frame: the clock, the trace, the chips ───────────────────────── */
  const hudClock = $("hud-clock");
  const hudCount = $("hud-count-v");
  const ecgLine = $("ecg-line");
  const daysV = $("selftest-v");
  const chargeV = $("chip-charge-v");
  const msV = $("chip-ms-v");
  const bump = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
  /** What the electrodes bring back at `time`: chaos, then the shock, then nothing, then beats. */
  const trace = (time) => {
    if (time >= tBeat) {
      const ph = ((time - tBeat) / PULSE) % 1;
      return 0.1 * bump(ph, 0.1, 0.03) - 0.16 * bump(ph, 0.186, 0.009) + 1.0 * bump(ph, 0.2, 0.011) - 0.26 * bump(ph, 0.216, 0.01) + 0.25 * bump(ph, 0.43, 0.05);
    }
    if (time >= tDark) return 0.9 * Math.exp(-(time - tDark) / 0.03);
    return 0.5 * Math.sin(time * 27 + 1.3 * Math.sin(time * 4.4)) + 0.28 * Math.sin(time * 44.6 + 0.5) + 0.2 * Math.sin(time * 14.5 + 2.0);
  };
  const WINDOW = 2.4; // seconds of trace across the panel
  stage.onProject((time) => {
    const s = secAt(time);
    hudClock.textContent = stamp(s);
    hudCount.textContent = `${chancesAt(s)} %`;
    daysV.textContent = String(Math.round(1 + 1459 * S.days)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    chargeV.textContent = `${Math.round(150 * S.charge)} J`;
    msV.textContent = `${(10 * S.ms).toFixed(1).replace(".", ",")} ms`;
    if (S.ecg > 0.01) {
      let d = "";
      for (let i = 0; i <= 150; i++) {
        const u = i / 150;
        const y = 75 - 62 * trace(time - (1 - u) * WINDOW);
        d += `${i ? "L" : "M"}${(u * 900).toFixed(1)} ${y.toFixed(1)}`;
      }
      ecgLine.setAttribute("d", d);
      ecgLine.style.stroke = time >= tBeat ? "#5cffb0" : time >= tDark ? "#e9e4d8" : "#ff5b2e";
    }
    for (const [el, anchor, dx, dy] of chips) {
      const p = anchor ? stage.project(anchor) : { x: 0, y: 0 };
      el.style.transform = `translate(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px)`;
    }
  });

  stage.start();
  return tl;
}

window.SD = { build };
