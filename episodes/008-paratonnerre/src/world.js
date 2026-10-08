// DOSSIER 008 — Paratonnerre : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by house.js, bolt.js, model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The STORM: your house seen like an X-ray, you at the window, the rod on the ridge, the
// stepped leader coming down — time is stopped one millisecond before it touches. The BENCH: the
// rod's three parts (the kit), alone on their pool of light.
// Three colours: signal is the lightning (the threat), veille is the rod and what it sends up (the
// system alive), ink is everything else — the house, the tree, the chimney and their own weak answers.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { HOUSE, ROD, YOU, LEADER } from "./plan.js";
import { buildHouse } from "./house.js";
import { buildStorm } from "./bolt.js";
import { buildRod, buildKit, KIT } from "./model.js";

export const SET = { BENCH: 0, STORM: 1 };
/** ≈ the radius of the kit on the bench: sizes the bench, its light, its shadows. */
export const SIZE = 70;

// The first frame is the hook: from the lawn, low, looking up — the house, you at the window, the rod, and
// above them the leader stopped in the air among the hanging drops. (Found with `look`: see VIEW.)
export const POSE0 = { tx: -260, ty: 1500, tz: 0, d: 3600, az: -38, el: -24, fov: 62, shift: 275, side: 100, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.STORM,
  /* ── the house (house.js) ── */
  shell: 1, //     the X-ray of the house and of the tree: glass and fine lines (0–1)
  inside: 0.6, //  what is drawn inside: the roof frame, the wires, the pipes (how bright)
  you: 1, //       you, at the window (0 / 1)
  out: 0, //       you, outside on the lawn (0 / 1)
  whatif: 0, //    WITHOUT the rod: the stroke's way through the house, 0 → 1 (chimney → roof frame → wires and pipes → past you → the ground)
  fire: 0, //      embers falling from the roof where it came in (0–1)
  /* ── the rod on the house (model.js · buildRod) ── */
  rod: 1, //       0: no rod on this house (the "what if")
  charge: 0.35, // the earth's charge drawn up the conductor to the top of the rod (0–1)
  climb: 1, //     how far up it has got: 0 at the foot of the stake → 1 the top of the rod (a head of light marks its front on the way)
  dash: 1, //      the dashes of light on the conductor: 1 dashes · 0 a plain line (while the camera runs along the wire)
  field: 0, //     the field lines gathering on the top of the rod (0–1)
  flow: 0, //      the stroke's current on its way down the conductor: where its head is, 0 the tip → 1 the foot of the stake
  flowOn: 0, //    how bright that current is (0–1.5): the conductor stays lit behind the head, and fades with this
  earth: 0, //     the current spreading in the ground around the stake: rings, 0 → 1
  /* ── the sky (bolt.js) ── */
  sky: 1, //       the cloud ceiling, the horizon, the grid of the ground
  cloud: 0.6, //   the glow inside the cloud, where the leader left
  rain: 1, //      the drops (how visible)
  fall: 0, //      how fast time runs for them: 0 hanging in the air (the film is stopped at T−1 ms) → 1 real rain
  drop: 0, //      how far they have fallen since the first frame, in cm (tween it when time runs again: `fall` only sets the length of their streaks)
  leader: LEADER.first, // the stepped leader: 0 in the cloud → 1 at the junction
  up: 0, //        the rod's upward leader: 0 → 1 at the junction
  upTree: 0, upChimney: 0, upAntenna: 0, // the others' answers, each 0 → 1 its full length — they never connect
  hair: 0, //      the one that rises from your head, outside (0–1)
  strike: 0, //    the return stroke: its front going UP the channel, 0 at the tip of the rod → 1 in the cloud
  hot: 0, //       how bright the channel is once struck (the acts make it decay, and flicker with the next strokes)
  hit: 0, //       the house WITHOUT its rod: the stroke that comes down on the chimney, how bright (0–1.5)
  /* ── the kit on the bench (model.js · buildKit) ── */
  explode: 0, //   0 assembled (a column) → 1 its three parts side by side, in a row across the camera
  litRod: 0, litWire: 0, litStake: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a veille light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -200, fy: 500, fz: 100, fs: 700, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). */
export const VIEW = {
  // close on the top of the rod, on the house: act 1 ends there, act 2 cuts to the bench from it (benchCut, origin ROD.tip → KIT.tip)
  tip: { tx: ROD.tip[0], ty: ROD.tip[1] - 40, tz: ROD.tip[2], d: 420, az: -40, el: 4, fov: 28, shift: 120, side: 0, roll: 0, drift: 0.3 },
  // the kit on the bench, apart: its three parts in a row across the camera (rod · wire · stake) — a column of them was too thin to read
  exploded: { tx: KIT.open[0], ty: 40, tz: KIT.open[2], d: 448, az: -40, el: 10, fov: 28, shift: 160, side: 0, roll: 0, drift: 0.3 },
  // each part of the row from close, on its word
  rodPart: { tx: -33.7, ty: 46, tz: -28.3, d: 330, az: -40, el: 8, fov: 28, shift: 140, side: 0, roll: 0, drift: 0.3 },
  wirePart: { tx: -15.3, ty: 45, tz: -8.3, d: 200, az: -40, el: 8, fov: 28, shift: 140, side: 0, roll: 0, drift: 0.3 },
  stakePart: { tx: 0, ty: 19, tz: 2.95, d: 205, az: -40, el: 10, fov: 28, shift: 140, side: 0, roll: 0, drift: 0.3 },
  // the kit assembled (a thin column: the calls to action play over the row instead)
  whole: { tx: 0, ty: 72, tz: 1.5, d: 840, az: -42, el: 10, fov: 28, shift: 160, side: 0, roll: 0, drift: 0.3 },
  // on the house — the whole wire from the rod to the stake; the earth around the stake; the foot of the mast
  run: { tx: -400, ty: 460, tz: 200, d: 3300, az: -52, el: 5, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 },
  earth: { tx: -400, ty: -110, tz: 420, d: 1250, az: -40, el: 13, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 },
  foot: { tx: -400, ty: 852, tz: 10, d: 340, az: -44, el: 14, fov: 28, shift: 60, side: 0, roll: 0, drift: 0.3 },
  // the whole house and the sky above it, from the lawn (the first frame is this one)
  wide: POSE0,
  // starting points found by those who built the sets (each act refines its own with `look`) —
  house: { tx: 0, ty: 480, tz: 0, d: 2700, az: -38, el: -12, fov: 40, shift: 150, side: 0, roll: 0, drift: 0.3 },
  window: { tx: -60, ty: 150, tz: 300, d: 900, az: -34, el: -2, fov: 28, shift: 100, side: 0, roll: 0, drift: 0.3 }, // you, inside
  socket: { tx: -20, ty: 100, tz: 200, d: 560, az: -58, el: 3, fov: 30, shift: 100, side: 0, roll: 0, drift: 0.3 }, // you and the socket (whatif)
  sans: { tx: 40, ty: 430, tz: 0, d: 2900, az: -36, el: -8, fov: 38, shift: 150, side: 0, roll: 0, drift: 0.3 }, // the house without its rod (whatif)
  roof: { tx: -150, ty: 900, tz: 0, d: 2450, az: -30, el: 4, fov: 28, shift: 100, side: 0, roll: 0, drift: 0.3 },
  bounds: { tx: -200, ty: 2100, tz: -200, d: 3600, az: -66, el: -30, fov: 50, shift: 0, side: 0, roll: 0, drift: 0.3 }, // the last bounds, seen from the gable
  answers: { tx: 330, ty: 1150, tz: 0, d: 4300, az: -22, el: -14, fov: 46, shift: 0, side: 0, roll: 0, drift: 0.3 }, // tree, chimney, antenna apart
  junction: { tx: -385, ty: 1480, tz: 20, d: 1263, az: -38.3, el: -38.1, fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3 }, // from the edge of the roof, looking up
  stroke: { tx: 0, ty: 2300, tz: 0, d: 7000, az: -30, el: -18, fov: 50, shift: 0, side: 0, roll: 0, drift: 0.3 }, // the whole channel, from far
  outside: { tx: 900, ty: 260, tz: 520, d: 1500, az: -52, el: -8, fov: 34, shift: 150, side: 0, roll: 0, drift: 0.3 }, // you on the lawn, the tree behind
};
/** What a cut to the bench sets, whatever came before. */
export const BENCHED = { explode: 0, litRod: 0, litWire: 0, litStake: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 66, fz: 0, fs: SIZE };
/** What a cut to the storm sets: time stopped at T−1 ms (the leader four bounds from the junction, the rod charged to its top), nothing struck yet. */
export const STAGED = {
  shell: 1, inside: 0.6, you: 1, out: 0, whatif: 0, fire: 0, rod: 1, charge: 1, climb: 1, dash: 1, field: 0, flow: 0, flowOn: 0, earth: 0,
  sky: 1, cloud: 0.6, rain: 1, fall: 0, drop: 0, leader: LEADER.held, up: 0, upTree: 0, upChimney: 0, upAntenna: 0, hair: 0, strike: 0, hot: 0, hit: 0, mood: 1, gel: 0, fx: -200, fy: 500, fz: 100, fs: 700,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const house = buildHouse();
  const storm = buildStorm();
  const rod = buildRod();
  const kit = buildKit();
  const set = new THREE.Group(); // the storm set
  set.add(storm.group, house.group, rod.root);
  const bench = makeBench(SIZE);
  bench.group.add(kit.root);
  scene.add(set, bench.group);
  stage.grade.gel.set(0x5cffb0);

  return {
    house, storm, rod, kit, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      if (onBench) {
        kit.pose({ explode: S.explode, litRod: S.litRod, litWire: S.litWire, litStake: S.litStake }, time, px);
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        house.update({ shell: S.shell, inside: S.inside, you: S.you, out: S.out, whatif: S.whatif, fire: S.fire }, time, px);
        rod.update({ amount: S.rod, charge: S.charge, climb: S.climb, dash: S.dash, field: S.field, flow: S.flow, flowOn: S.flowOn, earth: S.earth }, time, px);
        storm.update({ sky: S.sky, cloud: S.cloud, rain: S.rain, fall: S.fall, drop: S.drop, leader: S.leader, up: S.up * S.rod, upTree: S.upTree, upChimney: S.upChimney, upAntenna: S.upAntenna, hair: S.hair * S.out, strike: S.strike, hot: S.hot, hit: S.hit }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.000004;
    },
  };
}

export { HOUSE, ROD, YOU, LEADER, KIT };
