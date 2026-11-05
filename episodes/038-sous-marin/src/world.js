// DOSSIER 038 — Sous-marin : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by sousmarin.js, mer.js and this file) — read its head: frames, azimuth
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SCENE: the Pacific at night, 160 m down — 034's sea (its marine snow, its surface seen from below,
// wrapped by mer.js), the seamount's rock wall coming out of the black, and the boat, a Los Angeles class: its two
// hulls and its sail aux rayons X, its crew of glass, and SOLID in all that glass the only things that matter
// (sousmarin.js): the main ballast tanks fore and aft, the bank of high-pressure bottles, the valves, the pipes, the
// emergency blow command. The air of the blow is veille. The BENCH: the same boat IN PLACE (bench under its forward
// half, pitch 0): the sea and the rock go black, the hull's glass fades, the system stays where it is on its pool of
// light — a pose aimed at the boat reads the same on both: the cut matches on it.
// Three colours. signal is the threat: the rock, the shock, the pressure's arrows, the 7 000 t, the tears, the air
// that escapes. veille is the system alive: the air in the bottles, the pipes, the tanks; the buoyancy; the command
// thrown. ink is the rest (the hull, the crew, the sea, the bubbles).
//
// THE STORY (docs/faits/038-sous-marin.md — the case is real, [S]): USS San Francisco, 8 January 2005, 160 m down at
// full speed, hits a seamount that is not on its chart. The bow crushed « comme une canette », the forward tanks torn,
// the sonar dome gone, the pressure hull intact. The chief of the watch throws the emergency blow: the air pours into
// the forward tanks and out of their tears; the aft tanks fill with air and lift the boat, slowly. It breaks the
// surface WITHOUT LEAVING THE WATER (it never leaps: no source). No knot, no time, no hour is ever shown. The sailor
// who died is never a dramatic device: the film says it once, the picture shows nobody hurt.
// THE HEADER is the depth (`depth`, m) and the pressure (×, from the depth: pressureAt) — main.js reads them.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  SUB, SAIL, PHULL, SONAR, MBT, BANK, VALVE, PIPE, ROOM, CMD, CREW, PRESS, WEIGHT, LIFT, CUBE, BENCHAT, SYSTEM,
  DEPTH, pressureAt, ROCK, SEAMOUNT,
} from "./plan.js";
import { buildSub } from "./sousmarin.js";
import { buildMer } from "./mer.js";

const DEG = Math.PI / 180;
export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of what the bench holds: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

/** The studio (kit/lib/stage.js). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE below); the hook and the wide shots stay sharp.
 *  `air`    off until a planche shows a net gain at 270 px.
 *  `finish` the solids' surface: machining grain and handling marks (full screen only). */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// Points of the boat (boat frame = world frame while pitch is 0)
const BOW = [SUB.bow, 0, 0];
const TANKF = [(MBT.fwd.x0 + MBT.fwd.x1) / 2, 0, 300];
const TANKA = [(MBT.aft.x0 + MBT.aft.x1) / 2, 0, 280];
const [CX, CY, CZ] = SYSTEM.centre;

// The first frame is the hook, « Ton sous-marin fonce dans une montagne. » : under the hull, low, from behind its
// port flank — the bow rushing ahead, the marine snow streaking past, and beyond the bow, out of the black, the rock.
// A vertical frame is narrow (≈ 30° across at fov 50): a camera that keeps the bow AND the rock beyond it looks almost
// along the boat (az 60–90), never from its side. PROVISIONAL (candidate b, set on BOUCHONS): the planche of four candidates (docs/038-actes.md) chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { tx: -4800, ty: 200, tz: 0, d: 9000, az: 55, el: -8, fov: 46, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── the sea and the rock (mer.js) ── */
  sea: 1, //      the X-ray of the sea: marine snow, the surface seen from below, the bottom's lines (0–1)
  depth: DEPTH.dive, // the boat's depth, m (160 at the shock → DEPTH.float surfaced): the header, the surface, the rock
  gap: 120, //    from the bow to the rock's face, m (0: the bow is on it)
  speed: 1, //    the boat's speed, 0 still → 1 full speed: the snow streaks along the hull, the screw turns (no figure ever)
  rush: 0, //     the water's drift past the boat, vertical: +1 the boat climbs (the snow falls past it), −1 it sinks
  rock: 1, //     the rock wall, out of the black (0 gone → 1)
  mount: 0, //    the whole seamount, schematic, in contour lines (the comment's far shot) (0–1)
  sky: 0, //      above the surface: the surface seen from the side, the low sky, the foam where the hull breaks it (0–1)
  /* ── the boat (sousmarin.js) ── */
  hull: 1, //     the glass of the light hull, the sail and its planes, the fins (0–1)
  inner: 1, //    the glass of the pressure hull, the control room's deck and panels (0–1)
  crew: 1, //     the crew of glass in the control room (0–1)
  jolt: 0, //     the crew thrown toward the bow by the shock (0 → 1; back to 0 = they are up again)
  pitch: 0, //    the boat's attitude, degrees, + nose up (world.js turns the boat)
  crush: 0, //    the bow against the rock: 0 intact → 1 « comme une canette » — the sonar dome burst, the forward tanks torn
  press: 0, //    the pressure: rings of signal arrows squeezing the hull (0–1)
  weight: 0, //   « sept mille tonnes »: a signal arrow pressing down on the boat (0–1)
  lift: 0, //     the buoyancy: a veille arrow pushing up under it (0–1)
  explode: 0, //  the exploded view (on the bench): the light hull's panels off, the tanks apart, the bank out (0 → 1)
  cmd: 0, //      the emergency blow command: 0 at rest → 1 thrown (veille)
  valves: 0, //   the two valves: 0 shut → 1 open (their handles turn a quarter)
  bank: 1, //     the air in the bottles: 1 full (veille) → 0 emptied
  flowF: 0, //    the air running down the forward pipe: 0 → 1 its green front from the valve to the forward tanks (then it flows)
  flowA: 0, //    the same, aft
  airF: 0, //     the air in the forward tanks: 0 full of water → 1 full of air (torn: it pours out through the tears)
  airA: 0, //     the air in the aft tanks: 0 full of water → 1 full of air — the green that grows
  leak: 0, //     the forward tears pour the air out: sheaves of bubbles rising (0–1)
  cube: 0, //     the principle: one cubic metre of water in the forward port tank, cut out and chased through the bottom (0 → 1)
  heart: 0, //    the forward port tank alone: the rest of the boat dims around it (0–1)
  litBank: 0, litCmd: 0, litValve: 0, litPipe: 0, litTank: 0, litHull: 0, // the part the voice names glows faintly
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: BOW[0], fy: 0, fz: 0, fs: 4000, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/038-sousmarin.md, 038-mer.md).
 *  Every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before. */
const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the four candidates of the first frame (docs/038-actes.md) ── */
  // [a] right under the hull's port flank, close: the hull overhead converging to the bow, the rock beyond it
  underA: { ...P, tx: -7500, ty: -50, tz: 0, d: 5500, az: 80, el: -10, fov: 50, shift: 0, drift: 0 },
  // [b] lower and farther: the forward third of the boat over the camera, the wall filling the back (= POSE0)
  underB: { ...P, tx: -6000, ty: 0, tz: 0, d: 9000, az: 70, el: -16, fov: 46, shift: 0, drift: 0 },
  // [c] worm's eye under the keel, looking forward and up along the hull to the wall
  keelC: { ...P, tx: -7000, ty: 0, tz: 0, d: 4200, az: 88, el: -30, fov: 60, shift: 0, drift: 0 },
  // [d] three-quarter under the bow from port: the bow ≈ 45 % of the width right of centre, the wall beyond on the left
  bowD: { ...P, tx: -5800, ty: -100, tz: 0, d: 3200, az: 60, el: -20, fov: 50, shift: 0, drift: 0 },
  /* ── act 1 ── */
  // along the hull to the bank of bottles (« tu n'as que de l'air »), through the glass from port, a little below
  bottles: { ...P, ...CLOSE, tx: BANK.x, ty: BANK.y, tz: 0, d: 2300, az: 38, el: 26, fov: 34, shift: 60 },
  // the whole boat under the 7 000 t arrow
  mass: { ...P, tx: -1500, ty: 700, tz: 0, d: 23000, az: 64, el: 12, fov: 34, shift: 40 },
  // the bow and the rock a few metres off, in profile, low (« pourquoi ta carte l'ignore ? », the chart up top)
  near: { ...P, tx: -6200, ty: -100, tz: 0, d: 4400, az: 16, el: -4, fov: 40, shift: -40 },
  // the shock: the bow against the wall, low three-quarter from port
  impact: { ...P, tx: -5600, ty: -100, tz: 0, d: 3300, az: 28, el: -8, fov: 40, shift: 90 },
  // the control room through the glass: the crew thrown toward the bow
  crew: { ...P, ...CLOSE, tx: -2800, ty: 40, tz: 0, d: 1150, az: 30, el: 12, fov: 36, shift: 60 },
  // the whole boat squeezed by the pressure's arrows
  press: { ...P, tx: -1500, ty: 0, tz: 0, d: 22000, az: 64, el: 14, fov: 34, shift: 60 },
  // the command, close, over the chief of the watch's shoulder — the end of act 1
  cmd: { ...P, ...CLOSE, tx: CMD.at[0], ty: CMD.at[1], tz: CMD.at[2], d: 520, az: 18, el: 10, fov: 32, shift: 130 },
  /* ── on the bench, in place (the same poses read in the sea) ── */
  // the forward half of the boat, system lit: act 2 cuts to the bench on it
  system: { ...P, tx: CX, ty: CY, tz: CZ, d: 5600, az: 34, el: 16, fov: 34, shift: 120 },
  // the exploded view, three-quarter from the bow's port side: the air's path bank → valves → pipe → tanks, ONE frame
  exploded: { ...P, tx: -2600, ty: -250, tz: 0, d: 9800, az: 64, el: 38, fov: 32, shift: 150 },
  // the bank of bottles and its valves
  bank: { ...P, ...CLOSE, tx: BANK.x - 150, ty: BANK.y, tz: 0, d: 1500, az: 36, el: 18, fov: 32, shift: 120 },
  // a valve, its handle turning
  valve: { ...P, ...CLOSE, tx: VALVE.x, ty: VALVE.y, tz: VALVE.a.z, d: 520, az: 30, el: 16, fov: 32, shift: 120 },
  // THE HEART: the forward port tank alone, on its halo
  tank: { ...P, ...CLOSE, tx: TANKF[0], ty: TANKF[1], tz: TANKF[2], d: 2700, az: 30, el: 14, fov: 32, shift: 60 },
  // the principle: the cubic metre at the bottom of that tank
  cube: { ...P, ...CLOSE, tx: CUBE.at[0], ty: CUBE.at[1] - 60, tz: CUBE.at[2], d: 1300, az: 22, el: 10, fov: 32, shift: 140 },
  /* ── back in the sea ── */
  // the whole boat diving, calm, X-ray: bottles full, tanks full of water (the rest)
  whole: { ...P, tx: -1000, ty: 0, tz: 0, d: 22000, az: 65, el: 14, fov: 32, shift: 60 },
  // an aft tank, closed — then (same family) a forward tank torn: « que d'un réservoir intact »
  aft: { ...P, ...CLOSE, tx: TANKA[0], ty: TANKA[1], tz: TANKA[2], d: 2300, az: 40, el: 8, fov: 32, shift: 120 },
  torn: { ...P, ...CLOSE, tx: MBT.fwd.x0 + 150, ty: -200, tz: 260, d: 2300, az: 30, el: -6, fov: 32, shift: 120 },
  // the blow: command, bank, valves and the two pipes leaving fore and aft
  blow: { ...P, tx: -2200, ty: -150, tz: 0, d: 2800, az: 30, el: 14, fov: 34, shift: 120 },
  // the climax wide: the whole boat three-quarter, bubbles fore, green aft, the rock behind the bow
  climb: { ...P, tx: -2500, ty: 0, tz: 0, d: 24000, az: 62, el: 6, fov: 34, shift: 60 },
  // « La surface. »: at the waterline, the hull breaking it without leaving the water
  surface: { ...P, tx: -2500, ty: 300, tz: 0, d: 16000, az: 62, el: 5, fov: 34, shift: 60 },
  // floating, still, under a low sky
  float: { ...P, tx: -1000, ty: 350, tz: 0, d: 22000, az: 66, el: 6, fov: 34, shift: 40 },
  // the whole seamount, schematic, the boat a speck at the surface (the comment)
  mountain: { ...P, tx: -50000, ty: -170000, tz: 0, d: 1100000, az: 30, el: 6, fov: 50, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 },
};

/** What a cut to the bench sets, whatever came before: the boat level and still, the sea black, its glass faded,
 *  nobody aboard, nothing lit. `depth` keeps the act's value (the header reads it); the air numbers are the act's. */
export const BENCHED = {
  sea: 0, rock: 0, mount: 0, sky: 0, speed: 0, rush: 0, hull: 0.35, inner: 0.25, crew: 0, jolt: 0, pitch: 0,
  press: 0, weight: 0, lift: 0, explode: 0, leak: 0, cube: 0, heart: 0,
  litBank: 0, litCmd: 0, litValve: 0, litPipe: 0, litTank: 0, litHull: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the scene sets: night, the sea, the rock, the boat whole in its glass, its crew, nothing lit, no
 *  arrow, not exploded. `depth`, `gap`, `speed`, `pitch`, `crush`, `jolt`, the air numbers, `cmd`, `valves`, `bank`
 *  are the act's. */
export const STAGED = {
  sea: 1, rock: 1, mount: 0, sky: 0, rush: 0, hull: 1, inner: 1, crew: 1, press: 0, weight: 0, lift: 0, explode: 0,
  cube: 0, heart: 0, litBank: 0, litCmd: 0, litValve: 0, litPipe: 0, litTank: 0, litHull: 0,
  gel: 0, fx: BOW[0], fy: 0, fz: 0, fs: 4000,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const sub = buildSub();
  const mer = buildMer();

  // the boat at the origin, turned by its pitch; the sea around it (it moves, the boat does not)
  const set = new THREE.Group();
  set.add(mer.group);
  const boat = new THREE.Group();
  boat.rotation.order = "ZYX";
  boat.add(sub.root);
  scene.add(set, boat);

  // the bench, in place under the forward half (the boat is level on it)
  const bench = makeBench(SIZE);
  bench.group.position.set(...BENCHAT);
  scene.add(bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    sub, mer, bench, set, boat,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      boat.rotation.z = onBench ? 0 : -S.pitch * DEG;
      sub.update({
        bench: onBench ? 1 : 0, hull: S.hull, inner: S.inner, crew: onBench ? 0 : S.crew, jolt: S.jolt, crush: S.crush,
        press: S.press, weight: S.weight, lift: S.lift, explode: onBench ? S.explode : 0, cmd: S.cmd, valves: S.valves,
        bank: S.bank, flowF: S.flowF, flowA: S.flowA, airF: S.airF, airA: S.airA, leak: onBench ? 0 : S.leak,
        cube: S.cube, heart: S.heart, speed: onBench ? 0 : S.speed,
        litBank: S.litBank, litCmd: S.litCmd, litValve: S.litValve, litPipe: S.litPipe, litTank: S.litTank, litHull: S.litHull,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        mer.update({
          sea: S.sea, depth: S.depth, gap: S.gap, speed: S.speed, rush: S.rush, rock: S.rock, mount: S.mount, sky: S.sky, mood: S.mood, pitch: S.pitch,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      stage.air.amount = 0;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : mer.fog(d);
    },
  };
}

export {
  SUB, SAIL, PHULL, SONAR, MBT, BANK, VALVE, PIPE, ROOM, CMD, CREW, PRESS, WEIGHT, LIFT, CUBE, BENCHAT, SYSTEM,
  DEPTH, pressureAt, ROCK, SEAMOUNT,
};
