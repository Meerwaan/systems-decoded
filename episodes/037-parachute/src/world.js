// DOSSIER 037 — Le parachute de secours : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, sauteur.js, ciel.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SCENE: you, unconscious, in free fall over the countryside — your body and the canopy seen like an
// X-ray (sauteur.js), the sky, the countryside in squares and the air going by (ciel.js), and on your back, solid,
// the only thing that matters (model.js): the reserve container, its box, its cutter, its closing loop. The BENCH:
// that same rig alone on its pool of light. ONE object, re-parented: the bench stands at the origin, the rig lies on
// it exactly as it lies on your back with spin, tilt and hang at 0 — the cut « on l'ouvre » matches in place.
// Three colours. signal is the threat: the ground coming up, the speed of the fall, the box switched off. veille is
// the system alive: the box's diode, the window at 225 m, the loop it cuts, the canopy that saves you. ink is the rest.
//
// THE STORY (docs/faits/037-parachute.md; a scenario, `sources` says so): you lose consciousness in free fall and spin,
// belly to earth, at ≈ 200 km/h. Nobody pulls. Under ≈ 225 m, still falling faster than 35 m/s, the box fires its
// cutter: the piston (≈ 5 mm) cuts the closing loop, the flaps open, the pilot chute leaves, the reserve inflates over
// a body that has not moved. THE BOX NEVER « OPENS » THE PARACHUTE: it cuts a loop. No opening time is ever shown.
// THE FILM IS IN REAL TIME in act 1 (`alt` falls at ≈ 55 m/s: 1 350 m → ≈ 250 m at the cut); time stops on the bench;
// act 3 is slow motion around the window (225 m crossed on « deux cent vingt-cinq », the loop cut a few metres
// lower). `alt` is the one truth: the header reads it, the ground and the air follow it — in the principle and the
// rest it is the altitude of THAT shot (0 on the ground in the morning, the climb, the fall seen from afar).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { ALT, SPEED, CONTAINER, RESERVE, LOOP, PIN, CUTTER, UNIT, CONTROL, PILOT, BAG, SYSTEM, BODY, CANOPY, TWIN, GATE } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildDiver } from "./sauteur.js";
import { buildSky } from "./ciel.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The header's speed, km/h, from `vz` (m/s): rounded to ten (55.6 m/s → 200 km/h, « deux cents »). */
export const kmh = (vz) => Math.round((Math.max(0, vz) * 3.6) / 10) * 10;
/** The turns a body gains while its spin rate goes linearly from r0 to r1 (turns/s) over `seconds`. */
export const turnsOver = (r0, r1, seconds) => ((r0 + r1) / 2) * seconds;
/** Act 1 falls in real time: the altitude `seconds` after a moment at `alt0`, at the fall's speed. */
export const fallen = (alt0, seconds) => alt0 - SPEED.fall * seconds;

/** The studio (kit/lib/stage.js). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE below); the hook, the fall, the wide shots
 *           and the exploded view stay sharp
 *  `air`    off until a planche shows a net gain at 270 px
 *  `finish` the solids' surface: machining grain and handling marks (full screen only) */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the body's middle in the diver's frame (the container is at the origin, your head toward +z)
const MID = { tx: 0, ty: -12, tz: -20 };

// The first frame is the hook, « Tu tombes, inconscient. Ton sac, lui, est réveillé. » : you, in free fall, spinning,
// limp, over the countryside in squares, the air rushing past; the rig solid on your back, the diode small but lit.
// PROVISIONAL (candidate a, set on BOUCHONS): the planche of four candidates (docs/037-actes.md) chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { ...P, ...MID, d: 400, az: -40, el: 60, fov: 58, shift: 40, drift: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── the sky and the countryside (ciel.js) ── */
  alt: ALT.first, // metres above the ground: the ground's plane (−alt · 100 cm), the header's altitude, the air's travel
  vz: SPEED.fall, // the fall's speed, m/s: the streaks' length, the header's km/h (55.6 → 200); 5 under the canopy, 0 on the ground
  sky: 1, //       the dome, the countryside and the air (0 on the bench)
  threat: 0.4, //  the ground coming up: its lines warm toward signal (0–1)
  strata: 0, //    the principle's pressure layers, closer lower down (0–1)
  gate: 0, //      the window's sheet at 225 m above the ground, veille (0–1)
  /* ── you (sauteur.js) ── */
  body: 1, //      your body of glass and the harness (0: the rig alone, on the ground)
  shell: 1, //     how bright your glass and the canopy's are (0–1)
  spin: 0, //      your turn about the vertical, in TURNS (it grows; act 1 lands it on a whole number at tobench)
  tilt: 0, //      your head pitched down, degrees (0: flat, belly to earth — 0 at every cut to the bench)
  hang: 0, //      0 flat in the fall → 1 upright under the canopy
  land: 0, //      0 → 1 down in the field, the canopy collapsed beside you
  hand: 0, //      your right hand drifting by the ripcord handle, not taking it (0–1)
  deploy: 0, //    the pilot chute out (0.05–0.25), the bag and lines (0.25–0.5), the canopy inflating (0.5–0.85), full (1)
  twin: 0, //      the principle's second diver under his open canopy, at TWIN (0–1)
  /* ── the system (model.js) ── */
  explode: 0, //   on the bench: 0 assembled → 1 apart, in ONE vertical frame
  flaps: 0, //     the reserve flaps opened (0 closed → 1 open): the climax, after the loop is cut
  loop: 0, //      the closing loop: 0 whole → 1 cut in the cutter's hole, its two ends apart
  piston: 0, //    the piston's travel across the hole (0 → 1 = ≈ 5 mm)
  section: 0, //   the cutter's casing cut away (a quarter of the tube): the piston and the loop seen in the hole (0–1)
  power: 1, //     the box: 0 off (screen and diode dark) → 1 on (the diode breathing, veille)
  wake: 0, //      the diode lit frank instead of breathing (« réveillé ») (0–1)
  test: 0, //      the self-test running on the screen (0 → 1)
  press: 0, //     the pressure gauge on the unit's flank (0 → 1)
  rate: 0, //      how fast the pressure rises: the gauge's rate mark (0 → 1, signal over the threshold)
  fabric: 1, //    the container's cloth: 1 solid → 0 glass (the box, the cutter, the loop seen inside)
  solo: 0, //      the processing unit alone, the rest faded (the principle) (0–1)
  heart: 0, //     the loop and the cutter alone, the loop veille on its halo (0–1)
  litFlap: 0, litUnit: 0, litSensor: 0, litCable: 0, litCutter: 0, litLoop: 0, // the part the voice names glows faintly
  // (litCable is a HEAD OF LIGHT running along the cable: 0 at the unit → 1 at the cutter, gone after)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: MID.tx, fy: MID.ty, fz: MID.tz, fs: 140, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

const T = (p) => ({ tx: p[0], ty: p[1], tz: p[2] }); // aim at a point of the diver's frame (= the bench's)
/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/037-model.md, 037-sauteur.md, 037-ciel.md).
 *  A pose aimed at the rig reads the same in the scene (spin 0, tilt 0, hang 0) and on the bench. */
export const VIEW = {
  hook: POSE0,
  /* ── the fall (the four candidates of the first frame: docs/037-actes.md) ── */
  // [a] from above you, plunging: your back and the rig, the countryside far below, the air rushing up at the lens
  dive: { ...P, ...MID, d: 400, az: -40, el: 60, fov: 58, shift: 40 },
  // [b] beside you, a little above: your body across the frame, the horizon high, the squares under you
  side: { ...P, ...MID, d: 680, az: -70, el: 24, fov: 42, shift: 40 },
  // [c] under you, grazing: you against the sky, the countryside and its horizon at the bottom of the frame
  under: { ...P, ...MID, d: 520, az: -50, el: -14, fov: 56, shift: 0 },
  // [d] head down (tilt 55): diving, seen from your right at your level, the ground filling the bottom of the frame
  headdown: { ...P, ...MID, d: 640, az: -90, el: 14, fov: 42, shift: 60 },
  /* ── on your back (the same poses on the bench) ── */
  // the rig through its cloth, three-quarter above: the box under the flap, the diode (« dedans, environ 200 grammes »)
  rig: { ...P, ...CLOSE, tx: 0, ty: 10, tz: 12, d: 150, az: -45, el: 46, fov: 30, shift: 60 },
  // act 1's last pose and the cut to the bench: close on the reserve, its flaps, the control unit and its diode
  back: { ...P, ...CLOSE, tx: 0, ty: 14, tz: 16, d: 170, az: -40, el: 36, fov: 30, shift: 80 },
  // the ripcord handle on the front of the harness and the hand floating by it, from under your chest (« ta poignée ? »)
  handle: { ...P, ...CLOSE, ...T(BODY.handle), d: 300, az: -20, el: -28, fov: 32, shift: 40 },
  /* ── the bench ── */
  whole: { ...P, ...T(SYSTEM.centre), d: 190, az: -42, el: 32, fov: 30, shift: 60 },
  // the exploded view, in ONE vertical frame — sharp
  exploded: { ...P, tx: -2, ty: 28, tz: 14, d: 190, az: -42, el: 26, fov: 30, shift: 0 },
  // the processing unit and its pressure port (« le boîtier et son capteur de pression »)
  unit: { ...P, ...CLOSE, ...T(UNIT.at), d: 42, az: -62, el: 22, shift: 60 },
  // the cutter, its hole, the loop through it (« le coupe-boucle », « dans son trou »)
  cutter: { ...P, ...CLOSE, tx: CUTTER.at[0] - CUTTER.holeAt, ty: CUTTER.at[1] + 0.4, tz: CUTTER.at[2], d: 16, az: -35, el: 24, shift: 40 },
  // THE HEART: the loop alone, standing through the cutter, on its halo
  heart: { ...P, ...CLOSE, tx: LOOP.base[0], ty: (LOOP.base[1] + LOOP.top[1]) / 2, tz: LOOP.base[2], d: 44, az: -40, el: 14, shift: 40 },
  /* ── the principle and the rest ── */
  // you and the second diver side by side, seen across x: a canopy coming down slowly, a body that rushes
  twin: { ...P, tx: TWIN.at[0] / 2, ty: 380, tz: TWIN.at[2] / 2, d: 1700, az: -20, el: 2, fov: 40, shift: 0 },
  // the rig alone on the grass in the morning (alt 0, body 0): « au sol, il prend cette pression comme son zéro »
  ground: { ...P, ...T(SYSTEM.centre), d: 200, az: -40, el: 30, fov: 32, shift: 40 },
  // the fall seen from afar and the window lit under you (alt ≈ 400)
  gateWide: { ...P, tx: 0, ty: -9000, tz: 0, d: 32000, az: -40, el: 6, fov: 36, shift: 0 },
  /* ── act 3 and the end ── */
  // low, beside you, at the window's level: you cross the sheet (« deux cent vingt-cinq mètres »)
  cross: { ...P, ...MID, d: 900, az: -60, el: -8, fov: 50, shift: 0 },
  // the canopy inflating over you, from below and aside (« la voile se gonfle »)
  open: { ...P, tx: 0, ty: 260, tz: 0, d: 1600, az: -40, el: -12, fov: 44, shift: 0 },
  // you hanging under the canopy, still (the fall: « il ne sait pas que tu es inconscient »)
  hanging: { ...P, tx: 0, ty: 220, tz: 0, d: 1400, az: -35, el: -6, fov: 40, shift: 0 },
  // down in the field, the canopy collapsed beside you, from afar (like)
  landed: { ...P, tx: 0, ty: 20, tz: -40, d: 1900, az: -35, el: 18, fov: 36, shift: 0 },
};

/** What a cut to the bench sets, whatever came before: the rig whole, at rest, closed, on, nothing lit. `alt` and `vz`
 *  keep the act's values (the header reads them: the clock stops on the bench). */
export const BENCHED = {
  sky: 0, threat: 0, strata: 0, gate: 0, body: 0, twin: 0, spin: 0, tilt: 0, hang: 0, land: 0, hand: 0, deploy: 0,
  explode: 0, flaps: 0, loop: 0, piston: 0, section: 0, wake: 0, test: 0, press: 0, rate: 0, fabric: 1, solo: 0, heart: 0,
  litFlap: 0, litUnit: 0, litSensor: 0, litCable: 0, litCutter: 0, litLoop: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: SYSTEM.centre[0], fy: SYSTEM.centre[1], fz: SYSTEM.centre[2], fs: SIZE,
};
/** What a cut to the scene sets: the sky, you, the rig closed on your back, nothing lit. `alt`, `vz`, `spin`, `tilt`,
 *  `hang`, `land`, `deploy`, `flaps`, `loop`, `piston`, `power`, `fabric` are the act's. */
export const STAGED = {
  sky: 1, body: 1, shell: 1, twin: 0, strata: 0, gate: 0, hand: 0, explode: 0, section: 0, solo: 0, heart: 0, wake: 0, test: 0, press: 0, rate: 0,
  litFlap: 0, litUnit: 0, litSensor: 0, litCable: 0, litCutter: 0, litLoop: 0,
  mood: 1, gel: 0, fx: MID.tx, fy: MID.ty, fz: MID.tz, fs: 140,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const diver = buildDiver();
  const sky = buildSky();

  // the scene: the sky at the origin (never turned), you at the origin (you turn), the rig on your back
  const set = new THREE.Group();
  set.add(sky.group, diver.group);
  // the bench at the origin: the rig lies on it as on your back with spin, tilt, hang 0
  const bench = makeBench(SIZE);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    system, diver, sky, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? bench.group : diver.A.back;
      if (system.root.parent !== home) home.add(system.root);
      system.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, flaps: S.flaps, deploy: onBench ? 0 : S.deploy,
        loop: S.loop, piston: S.piston, section: S.section, power: S.power, wake: S.wake, test: S.test, press: S.press, rate: S.rate,
        fabric: S.fabric, solo: S.solo, heart: S.heart,
        litFlap: S.litFlap, litUnit: S.litUnit, litSensor: S.litSensor, litCable: S.litCable, litCutter: S.litCutter, litLoop: S.litLoop,
      }, time, px);
      if (!onBench) {
        diver.update({
          body: S.body, shell: S.shell, spin: S.spin, tilt: S.tilt, hang: S.hang, land: S.land, hand: S.hand,
          deploy: S.deploy, twin: S.twin, vz: S.vz, groundY: -Math.max(0, S.alt) * 100, mood: S.mood,
        }, time, px);
        sky.update(S, time, px);
      } else {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      stage.air.amount = 0;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00002;
    },
  };
}

export { ALT, SPEED, CONTAINER, RESERVE, LOOP, PIN, CUTTER, UNIT, CONTROL, PILOT, BAG, SYSTEM, BODY, CANOPY, TWIN, GATE, MID };
