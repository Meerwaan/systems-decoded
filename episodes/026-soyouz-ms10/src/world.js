// DOSSIER 026 — Soyouz MS-10 : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, launcher.js, sky.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SKY: 50 km up, the Soyuz-FG seen like an X-ray (launcher.js), the curve of the Earth below, and solid
// in all that glass only what matters — the escape head with its four small motors, you and your crewmate in the
// descent module, the two sensors on the rocket (model.js); then the fall, the parachute, the steppe (sky.js). The
// BENCH: that same system alone on its pool of light, the head standing on a glass section of the rocket that
// holds the sensors. ONE object, re-parented: the cut from one to the other matches on it, in place.
// Three colours. signal is the threat: booster D and its strike, the faulty part, the rocket that turns, the
// АВАРИЯ lamp, the heat of the fall. veille is the system alive: the four motors (lit, then their jets), the
// sensors that feel the turn, you — alive — at the end. ink is the rest: the rocket, its jets, the tower, the sky.
//
// THE STORY (docs/faits/026-soyouz-ms10.md, 026-contre-verification.md — their « À ne pas dire » hold for every
// picture and every label): 11 October 2018, ≈ 50 km up, about two minutes into the flight. The tower has already
// left (≈ 3 s before). The four boosters separate; booster D does not pull away, its nose strikes the core; the
// rocket shakes and turns; nobody presses anything: sensors that feel it turn give the order, « avaria » lights on
// the console; ≈ 3 s after the strike the four small solid motors at the top of the fairing fire and tear the head
// (fairing + orbital module + descent module) off the rocket. The module climbs on to 93 km, falls back at nearly
// seven times your weight, a parachute, a last push, the ground: alive. NEVER: a speed, a thrust, a burn time, a g
// during the motors' burn, « la tour a sauvé », « la fusée a explosé », the exact second of the failure.
//
// THE ORIGIN IS YOU (plan.js): the base of the descent module. The stack turns about it (`tilt`), is thrown along x
// (`sway`), and once torn away the rocket falls away down its own axis (`apart`) while the head straightens up; the
// sky and the ground come from `alt`. Nothing ever travels 93 km.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  DEG, around, DM, OM, FAIRING, MOTORS, FINS, TOWER, SEATS, YOU, MATE, CONSOLE, SENSORS, BENCH, SYSTEM, HEAD,
  SKIRT, SM, STAGE3, TRUSS, CORE, BOOSTERS, IMPACT, FAULT, ENGINES, EARTH, PAD, CHUTE, TEASER,
} from "./plan.js";
import { buildSystem } from "./model.js";
import { buildLauncher } from "./launcher.js";
import { buildSky } from "./sky.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the bench column (the head on its glass section of rocket): sizes the bench, its light. */
export const SIZE = SYSTEM.size;
/** The story's clock: seconds from booster D's strike. The voice says « Trois secondes » from the strike to the
 *  motors: the acts bring `clock` to 3.0 on « tirent » and hold it (the header turns veille when they fire). */
export const MOTORS_AT = 3;
/** The window of the four motors (« de la tour qui part à la coiffe qui tombe »), in seconds from the strike:
 *  the tower left at −4.4 (T+114.6 s of the flight), the fairing would drop at +38 (≈ T+157 s): ≈ 42 s, « quarante
 *  secondes, environ ». The strike sits 10 % into it (the frise #window of act 2). */
export const WINDOW = { from: -4.4, to: 38, hitAt: 4.4 / 42.4 };
/** Where the tower is when the story has done with it: far out of any frame (metres). On the bench it is back on
 *  the nose (0) only when an act brings it there — « de la tour qui part », « quand ta tour s'en va ». */
export const TOWER_GONE = 400;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (u) => u * u * (3 - 2 * u);

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the part in focus, what lies in front and
 *           behind melts. The hook, the wide shots, the exploded view stay sharp from edge to edge.
 *  `air`    off: no lamp behind the subject in this film (the sky is black, the jets are in front of it)
 *  `finish` the surface of the solid parts: the machining grain and the handling marks that break a highlight */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// THE FIRST FRAME is the hook, « Ta fusée lâche, en pleine montée » — PROVISIONAL (candidate a): from under the
// rocket, three quarters, looking up its body: Korolev's cross opening — three boosters peeling away, booster D
// (signal) swinging in toward the core —, the core's jet streaming toward the lens, the head small at the top.
// The planche of four candidates (docs/026-actes.md) chooses it on the finished sets; it is pasted here, with
// FIRST, before the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: 0, ty: -1100, tz: 0, d: 6400, az: -28, el: -32, fov: 46, shift: -40, side: 0, roll: 0, drift: 0, dof: 0 }; // 21/10: chosen on the planche of the candidates (a6: the cross from below, the head in the high zone)

export const FIRST = {
  set: SET.SCENE,
  /* ── the story (the header: main.js) ── */
  clock: -0.8, //  seconds from booster D's strike (T−0,8 s … T+0,0 … T+3,0 when the motors fire). A replay resets it on a cut
  era: 0, //       0 the flight · 1 on the pad, before the launch (header « 11 oct. 2018 ») · 2 five months later, Soyuz MS-12 (« 14 mars 2019 »)
  /* ── the sky, the ground, the descent (sky.js) ── */
  alt: 50, //      km: the module's height above the ground — the limb, the curve of the Earth, the steppe close up; the header's « Altitude ». PAD.alt on the pad, 0 on landing
  pitch: 0, //     degrees the local vertical leans from the stack's axis (the climb's angle): the horizon tilts by it — a camera `roll` levels it again
  flown: 0, //     metres travelled along the axis: the air streaks and the ripples of the jets move with it (+ climbing, − falling). It grows (or shrinks) steadily inside a shot: a still `flown` is a frozen sky
  airspeed: 0.6, // how long the streaks are, signed: + climbing (they run down past) · − falling (they run up past) · 0 none (the top of the arc, the ground)
  heat: 0, //      the fall: the sheath of hot air on the heat shield, signal, and its wake (0–1)
  chute: 0, //     the parachute: 0 packed · → 0.35 its lines pay out, a small canopy · → 1 the main canopy open above the module
  retro: 0, //     the last push, just above the ground: a short burst under the module and the steppe's dust thrown out in a ring (0–1)
  truck: 0, //     the next file (027), far away at night: 0 nothing · → 0.8 two headlamps coming down a slope · → 1 a short lit spur at the roadside, the exit
  /* ── the rocket (launcher.js) ── */
  shell: 1, //     the X-ray of the rocket: glass and fine lines (0–1)
  sep: 0.25, //    the three good boosters (B, V, G): 0 on · their tops swing out (the cross) · 1 fallen away, gone
  bad: 0.4, //    booster D: 0 on · → 1 its foot pulls out but its nose swings IN, to the core: contact at exactly 1 · 1 → 2 it rebounds and tumbles away
  impact: 0, //    the light at the strike (a light that has a place: white core, signal halo) and the dent it leaves (0–1)
  fault: 0, //     the faulty part at the top of booster D glints signal (« une pièce faussée, au montage ») (0–1)
  burn: 1, //      the core's jet (ink: a white core that cools along its length) (0–1)
  boost: 0.3, //   the four boosters' jets — dying at the separation (0–1)
  trail: 1, //     the exhaust trail below the rocket, where it came from: it stays in the sky when the rocket turns (0–1)
  pad: 0, //       the launch pad at Baïkonour around the rocket's foot, on the ground (0–1; with `alt` ≈ PAD.alt)
  /* ── the stack (world.js) ── */
  tilt: 0, //      degrees the rocket has turned since the strike (+: its top toward +x); the head turns with it until it leaves
  sway: 0, //      cm the stack is thrown along x (« ça secoue, de gauche à droite »: the acts swing it, ± 40 at most)
  apart: 0, //     metres between the head and the rocket once torn away: the rocket falls away down its own axis
  /* ── the system (model.js) ── */
  skin: 1, //      the fairing: 1 solid (the system as an object) → 0 glass, its edges and the four motors still solid: you can see in
  explode: 0, //   on the bench: 0 whole → 1 opened — the nose and its four motors up, the two halves apart, the orbital module up
  shed: 0, //      the fairing jettisoned (« la coiffe qui tombe »): its two halves part and fall (0–1)
  tower: 90, //    metres the tower has flown from its seat on the nose (0: on it). It has always left before the failure
  fire: 0, //      the four motors fire: four veille jets running down along the fairing (0–1)
  litMotors: 0, // the four motors lit faintly veille, one by one: 0 none … 4 all four (« quatre petits moteurs »)
  free: 0, //      the module frees itself: the fairing, its nose and the orbital module rise off it and are gone (0–1)
  avaria: 0, //    the АВАРИЯ lamp on the console (signal) (0–1)
  press: 0, //     you and your crewmate pressed into your seats (« plaqué dans ton siège », the seven g of the fall) (0–1)
  sense: 0, //     the sensors feel the turn: their lamp, and pulses up their wires to the head (veille) (0–1)
  litShip: 0, litMate: 0, litYou: 0, litSensors: 0, // the part the voice names glows faintly veille (litShip: the orbital and descent modules)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: -1700, fz: 0, fs: 2600, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/026-model.md, -launcher.md, -sky.md). */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [HX, HY, HZ] = HEAD.centre;
export const VIEW = {
  hook: POSE0,
  /* ── the sky: the rocket ── */
  // the whole rocket in profile from +z (az ≈ 0: its turn is in the picture plane — « Ta fusée tourne »), the limb under it
  stack: { ...P, tx: 0, ty: -1600, tz: 0, d: 15000, az: -8, el: 2, fov: 32, shift: 60 },
  // Korolev's cross from under, three quarters: the boosters peeling away, D swinging in (candidate a)
  cross: { ...P, tx: 0, ty: -2600, tz: 0, d: 4600, az: -30, el: -40, fov: 46, shift: 100 },
  // the strike: booster D's nose against the core, in profile, close (« Il frappe ta fusée »)
  strike: { ...P, ...CLOSE, tx: IMPACT[0], ty: IMPACT[1], tz: IMPACT[2], d: 1300, az: -12, el: 6, fov: 34, shift: 120 },
  // the faulty part at the top of booster D (« ce qui la fait lâcher »)
  fault: { ...P, ...CLOSE, tx: FAULT[0], ty: FAULT[1], tz: FAULT[2], d: 420, az: -55, el: 12, fov: 32, shift: 120 },
  // the head in the sky, three quarters: the fairing, its four motors, the empty place of the tower (« juste la coiffe »)
  head: { ...P, tx: 0, ty: 560, tz: 0, d: 2300, az: -38, el: 10, fov: 32, shift: 120 },
  // from the nose, looking up: the tower going away (« vient de partir »)
  // (with `tower` ≈ 10–15 m: further, the tower leaves the frame under the header; it is a small glass shape anyway)
  towerUp: { ...P, tx: 180, ty: 1500, tz: 96, d: 5700, az: -40, el: -12, fov: 46, shift: 120 },
  // inside: you and your crewmate through the glass fairing (skin 0) (« Ça secoue », « Personne n'appuie sur rien »)
  inside: { ...P, ...CLOSE, tx: -24, ty: 100, tz: -8, d: 420, az: -72, el: 20, fov: 32, shift: 60 }, // 21/10: from the decor journals
  // the console and its АВАРИЯ lamp, from over your shoulder
  console: { ...P, ...CLOSE, tx: -40, ty: 164.5, tz: -31.1, d: 115, az: -170, el: -32, fov: 32, shift: 0 }, // 21/10: from the decor journals
  // one motor, close: its nozzle (« regarde-les tirer », « Les quatre moteurs tirent »)
  nozzle: { ...P, ...CLOSE, tx: -109.5, ty: 586.8, tz: 109.5, d: 420, az: -40, el: -14, fov: 32, shift: 120 }, // 21/10: from the decor journals
  // the head torn off the rocket on its four jets, from the side and below (« Ils t'arrachent à la fusée »)
  torn: { ...P, tx: -640, ty: -800, tz: 0, d: 9400, az: -20, el: -4, fov: 36, shift: 0 }, // 21/10: from the decor journals
  // the module alone over the curve of the Earth (« jusqu'à 93 kilomètres »), looking down at the limb
  apogee: { ...P, tx: 0, ty: 110, tz: 0, d: 1500, az: -32, el: 3, fov: 40, shift: 100 }, // 21/10: from the decor journals
  // the module falling, its sheath (« Puis tu retombes »), from under it
  fall: { ...P, tx: 0, ty: 220, tz: 0, d: 1250, az: -40, el: -14, fov: 36, shift: 0 }, // 21/10: from the decor journals
  // the module under its canopy (« Un parachute »)
  chute: { ...P, tx: 0, ty: 780, tz: 0, d: 4700, az: -30, el: -6, fov: 36, shift: -40 }, // 21/10: from the decor journals
  // the module on the steppe (« tu touches le sol. Vivant. »)
  ground: { ...P, tx: 0, ty: 110, tz: 0, d: 1000, az: -36, el: 9, fov: 34, shift: 130 },
  // on the pad at Baïkonour: the whole rocket in its arms, at night (« avant le décollage », « vous repartez »)
  pad: { ...P, tx: 0, ty: -1500, tz: 0, d: 9000, az: -32, el: 4, fov: 34, shift: 100 },
  /* ── where act 1 ends: close on the head in the sky, the fairing gone to glass — act 2 cuts to the bench from it ── */
  system: { ...P, tx: HX, ty: HY, tz: HZ, d: 2900, az: -34, el: 14, fov: 30, shift: 0 }, // 21/10: acte1 — the whole head from y 451 to 1446
  /* ── on the bench (the origin is the origin: a point of the head is at the same place there) ── */
  whole: { ...P, tx: 0, ty: 500, tz: 0, d: 3600, az: -30, el: 12, fov: 30, shift: 100 }, // 21/10: from the decor journals
  exploded: { ...P, tx: 0, ty: 480, tz: 0, d: 4300, az: -30, el: 16, fov: 32, shift: 120 }, // 21/10: from the decor journals
  motorsBench: { ...P, ...CLOSE, tx: 0, ty: 830, tz: 0, d: 1300, az: -40, el: 18, fov: 30, shift: 60 }, // 21/10: from the decor journals
  shipBench: { ...P, ...CLOSE, tx: -24, ty: 100, tz: -10, d: 700, az: -30, el: 48, fov: 30, shift: 40 }, // 21/10: from the decor journals
  sensorsBench: { ...P, ...CLOSE, tx: -88, ty: -395, tz: 126, d: 800, az: -40, el: 6, fov: 30, shift: 160 }, // 21/10: from the decor journals
  column: { ...P, tx: 0, ty: -250, tz: 0, d: 6400, az: -20, el: 4, fov: 30, shift: -40 }, // 21/10: from the decor journals
  stackTrail: { ...P, tx: 0, ty: -2400, tz: 0, d: 16500, az: -8, el: 2, fov: 32, shift: 60 }, // 21/10: from the decor journals
  night: { ...P, tx: 0, ty: 150, tz: 0, d: 1200, az: -166, el: -2, fov: 40, shift: -40, side: -260 }, // 21/10: from the decor journals
};

/** What a cut to the bench sets, whatever came before: the head whole on its glass section, the fairing solid,
 *  nothing firing, nothing lit; the story's numbers the header reads (`clock`, `era`, `alt`) keep their values. */
export const BENCHED = {
  shell: 0, sep: 0, bad: 0, impact: 0, fault: 0, burn: 0, boost: 0, trail: 0, pad: 0,
  heat: 0, chute: 0, retro: 0, truck: 0, airspeed: 0,
  tilt: 0, sway: 0, apart: 0,
  skin: 1, explode: 0, shed: 0, tower: TOWER_GONE, fire: 0, litMotors: 0, free: 0, avaria: 0, press: 0, sense: 0,
  litShip: 0, litMate: 0, litYou: 0, litSensors: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: SYSTEM.centre[1], fz: 0, fs: SIZE,
};
/** What a cut to the sky sets: 50 km up, the rocket whole and burning, the boosters still on, the tower gone, the
 *  fairing solid, nothing lit. `clock`, `flown` and the boosters' numbers are the act's. */
export const STAGED = {
  era: 0, alt: 50, pitch: FIRST.pitch, airspeed: 0.6, heat: 0, chute: 0, retro: 0, truck: 0,
  shell: 1, sep: 0, bad: 0, impact: 0, fault: 0, burn: 1, boost: 1, trail: 1, pad: 0,
  tilt: 0, sway: 0, apart: 0,
  skin: 1, explode: 0, shed: 0, tower: FIRST.tower, fire: 0, litMotors: 0, free: 0, avaria: 0, press: 0, sense: 0,
  litShip: 0, litMate: 0, litYou: 0, litSensors: 0,
  mood: 1, gel: 0, fx: 0, fy: -1700, fz: 0, fs: 2600,
};
/** What a cut to the pad sets (Baïkonour, before the launch — or MS-12, five months later): the rocket whole on the
 *  ground, nothing burning, the tower ON the nose, the boosters on. The header reads `era` (1 or 2: the act's). */
export const GROUNDED = {
  ...STAGED, era: 1, alt: PAD.alt, pitch: 0, airspeed: 0, burn: 0, boost: 0, trail: 0, pad: 1, tower: 0, mood: 1,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const launcher = buildLauncher();
  const sky = buildSky();

  // the sky set: the sky around the module, the stack (turned about the origin), the head, the pad on the ground
  const set = new THREE.Group();
  const stack = new THREE.Group(); // the rocket: turned by `tilt`, thrown by `sway`; inside it, `apart` lets it fall away
  stack.add(launcher.group);
  const head = new THREE.Group(); // the escape head: turns with the rocket until it leaves, then straightens up
  set.add(sky.group, stack, head, launcher.pad);

  // the bench: lowered under the glass section, so that the head stands at the origin there too; `tilt` turns the
  // column about its foot (« qui la sentent tourner »)
  const bench = makeBench(SIZE);
  bench.group.position.y = BENCH.floor;
  const benchPivot = new THREE.Group();
  const benchMount = new THREE.Group();
  benchMount.position.y = -BENCH.floor;
  benchPivot.add(benchMount);
  bench.group.add(benchPivot);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    system, launcher, sky, bench, set, stack, head,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const turn = S.tilt * DEG;
      // the head and the sensors: on the bench, on the column; in the sky, the head on the stack, the sensors on the rocket
      const home = onBench ? benchMount : head;
      if (system.root.parent !== home) home.add(system.root);
      const sensorsHome = onBench ? system.root : launcher.group;
      if (system.sensors.parent !== sensorsHome) sensorsHome.add(system.sensors);
      if (onBench) {
        benchPivot.rotation.z = -turn;
      } else {
        stack.rotation.z = -turn;
        stack.position.x = S.sway;
        launcher.group.position.y = -S.apart * 100;
        const leave = smooth(clamp01(S.apart / 6)); // over its first 6 m the head stops turning with the rocket
        head.rotation.z = -turn * (1 - leave);
        head.position.x = S.sway * (1 - leave);
        launcher.pad.position.y = -S.alt * 100000;
        launcher.update({
          shell: S.shell, sep: S.sep, bad: S.bad, impact: S.impact, fault: S.fault, burn: S.burn, boost: S.boost, trail: S.trail,
          tilt: S.tilt, apart: S.apart, alt: S.alt, pad: S.pad, flown: S.flown, airspeed: S.airspeed,
        }, time, px);
        sky.update({
          alt: S.alt, pitch: S.pitch, flown: S.flown, airspeed: S.airspeed, heat: S.heat, chute: S.chute, retro: S.retro, truck: S.truck,
        }, time, px);
      }
      system.update({
        bench: onBench ? 1 : 0, skin: S.skin, explode: onBench ? S.explode : 0, shed: S.shed, tower: S.tower, fire: S.fire,
        litMotors: S.litMotors, free: onBench ? 0 : S.free, avaria: S.avaria, press: S.press, sense: S.sense,
        litShip: S.litShip, litMate: S.litMate, litYou: S.litYou, litSensors: S.litSensors,
      }, time, px);
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.000012;
    },
  };
}

export {
  DEG, around, DM, OM, FAIRING, MOTORS, FINS, TOWER, SEATS, YOU, MATE, CONSOLE, SENSORS, BENCH, SYSTEM, HEAD,
  SKIRT, SM, STAGE3, TRUSS, CORE, BOOSTERS, IMPACT, FAULT, ENGINES, EARTH, PAD, CHUTE, TEASER,
};
