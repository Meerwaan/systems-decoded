// DOSSIER 009 — Micro-ondes : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by kitchen.js, model.js, waves.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The KITCHEN: a column unit seen like an X-ray, the oven built into it at face height, you in
// front of it, your face ten centimetres from the glass, and inside the cavity the field of the microwaves.
// The BENCH: the door alone — the system — on its pool of light. It is ONE door: model.js moves it from its
// hinge to the bench (`bench` 1), the cut from one to the other matches on it.
// Three colours: signal is the microwaves (the threat) and what they heat; veille is the door's own
// safeties when they hold (the plate that throws the wave back, the switches closed); ink is everything else.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { OVEN, DOOR, CAVITY, WINDOW, YOU } from "./plan.js";
import { buildKitchen } from "./kitchen.js";
import { buildOven } from "./model.js";
import { buildWaves } from "./waves.js";

export const SET = { BENCH: 0, KITCHEN: 1 };
/** ≈ the radius of the door on the bench: sizes the bench, its light, its shadows. */
export const SIZE = 27;

// The first frame is the hook: you, your face at the glass, and behind the plate full of holes the cavity
// full of waves. (A starting point: the sets' builders refine it with `look`.)
export const POSE0 = { tx: -8, ty: 160.5, tz: 62, d: 195, az: -58, el: 5, fov: 40, shift: 135, side: 40, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.KITCHEN,
  /* ── the kitchen and you (kitchen.js) ── */
  shell: 1, //   the X-ray of the kitchen: the column unit, the worktop, the wall units — glass and fine lines (0–1)
  you: 1, //     you, standing in front of the oven (0 / 1)
  near: 1, //    1: your face ten centimetres from the glass (the hook) · 0: a step back, upright
  pull: 0, //    your hand: 0 at your side · 0.5 closed on the handle · 1 pulling — past 0.5 it follows the handle as `open` grows
  eyes: 0, //    WITHOUT the door: the heat building in your eyes (a signal glow that has a place: your eyes), 0–1
  hand: 0, //    the researchers' test: a forearm of glass reaches into the open cavity, 0 → 1
  pain: 0, //    …and what the field does to its fingertips (a signal glow that has a place), 0–1
  /* ── the oven and its door (model.js) ── */
  body: 1, //    the oven's body: its X-ray shell and, solid inside it, the cavity's edges, the turntable and the plate, the magnetron, the latch board (0–1)
  door: 1, //    the door is there (1) or not (0: "sans elle")
  open: 0, //    the door's angle: 0 closed → 1 wide open (≈ 100°)
  latch: 0, //   the hooks: 0 engaged in the latch → 1 lifted clear of the switches (the door has not moved yet)
  sw: 1, //      the two interlock switches: 1 closed (the oven may heat: lit veille) → 0 open (dark)
  stuck: 0, //   1: the "what if" — both stay stuck closed although the hooks have gone (they turn signal)
  monitor: 0, // the third switch: 0 open → 1 closed (it closes when the door opens)
  fuse: 1, //    the fuse: 1 whole → 0 blown
  spark: 0, //   the flash of the fuse as it blows — a light that has a place (0–1.5)
  spin: 0, //    how far the turntable has turned, in turns (tween it while the oven runs)
  lamp: 1, //    the cavity's lamp (0–1)
  explode: 0, // on the bench: 0 the door whole → 1 its layers apart (glass · perforated plate · inner film · frame and hooks)
  litGlass: 0, litMesh: 0, litHooks: 0, // the part the voice is naming glows faintly veille
  /* ── the microwaves (waves.js) ── */
  power: 0.55, // the field in the cavity: a standing wave, lobes of signal light (0 off → 1 a thousand watts; the hook swells it from 0.55)
  seen: 1, //    how much of that field is DRAWN — the camera's choice: the oven heats all the same (0.15 on the latch and the fuse, where the lobes eat the picture)
  leak: 0, //    WITHOUT the door (or with it open and the switches stuck): the field spilling out of the cavity's mouth toward you, 0 → 1
  ruler: 0, //   the measure: ONE wave, 12.2 cm long, laid against the plate and its holes of 1.5 mm (0–1)
  light: 0.4, // visible light getting out through the holes: thin ink rays from the lamp and the plate to your eyes (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a veille light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -8, fy: 150, fz: 70, fs: 110, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  // close on the door, closed, in the kitchen: act 2 cuts to the bench from it (benchCut, origin DOOR.home → DOOR.bench)
  door: { ...P, tx: -8, ty: 161, tz: 57.3, d: 185, az: -40, el: 6, shift: 160 },
  // the door on the bench: whole (the calls to action play over it), its layers apart, and each named part from close
  whole: { ...P, tx: 0, ty: 21, tz: 0, d: 200, az: -40, el: 10, shift: 140 },
  exploded: { ...P, tx: 0, ty: 21, tz: 3.5, d: 270, az: -48, el: 24, shift: 230, side: 70 },
  glassPart: { ...P, tx: -12, ty: 24, tz: 11, d: 100, az: -46, el: 14, shift: 160 },
  meshPart: { ...P, tx: -9, ty: 22, tz: 0, d: 85, az: -38, el: 8, shift: 160 },
  hooksPart: { ...P, tx: 19, ty: 21, tz: -19, d: 92, az: 142, el: 8, shift: 160 }, // from BEHIND the door: the hooks cannot be seen from its front
  // in the kitchen — the hook's closer frame; your face and the ten centimetres, in profile; you seen from inside the cavity
  close: { ...P, tx: -8, ty: 161, tz: 58, d: 150, az: -48, el: 5, fov: 40, shift: 120 },
  gap: { ...P, tx: -8, ty: 162, tz: 68, d: 135, az: -80, el: 2, shift: 60 },
  inside: { ...P, tx: -8, ty: 163, tz: 76, d: 52, az: 180, el: 0, fov: 55, shift: 0 },
  // the plate from outside, aimed at the hole of HOLES.origin (the plate stands at z = 57): dive from d 30 to d 3.2 (the hole ≈ 170 px)
  plate: { ...P, tx: -8, ty: 161, tz: 57, d: 30, az: -18, el: 6, fov: 30, shift: 0, drift: 0 },
  hole: { ...P, tx: -8, ty: 161, tz: 57, d: 3.2, az: -18, el: 6, fov: 30, shift: 0, drift: 0 },
  // ONE wave against the plate, from inside the cavity (state: ruler 1, light 0, you 0)
  ruler: { ...P, tx: -7.7, ty: 161.2, tz: 56.7, d: 30, az: 166, el: 5, fov: 50, shift: 0 },
  // the light that gets out, from three quarters; the leak and the bounce, in profile
  rays: { ...P, tx: -8, ty: 159, tz: 60, d: 80, az: -62, el: 8, fov: 30, shift: 0 },
  profile: { ...P, tx: -8, ty: 160, tz: 55, d: 260, az: -90, el: 0, fov: 30, shift: 0, drift: 0 },
  // your hand on the handle (pull 0.5), then pulling (pull 1, open 0.15 → 0.6)
  handle: { ...P, tx: 2, ty: 158, tz: 66, d: 150, az: -42, el: -14, fov: 30, shift: 0 },
  pulling: { ...P, tx: -6, ty: 156, tz: 80, d: 190, az: -46, el: -8, fov: 30, shift: 0 },
  // WITHOUT the door: your eyes (door 0, eyes 1) · the researchers' hand in the cavity (door 0, hand 1, pain 1, you 0)
  eyes: { ...P, tx: -8, ty: 163, tz: 70, d: 125, az: -122, el: 2, fov: 30, shift: 0 },
  test: { ...P, tx: -7, ty: 157.5, tz: 45, d: 92, az: -28, el: 25, fov: 30, shift: 220 }, // (lamp 0.4, light: fx −6, fy 158, fz 46, fs 60)
  // the safety chain, in profile, from behind the plane of the front (state: body 0.5, fx 11, fy 161, fz 52, fs 30): the latch board · one hook on its lever · the fuse
  latch: { ...P, tx: 11.2, ty: 160.5, tz: 50.5, d: 135, az: -100, el: 4, shift: 210 },
  hook: { ...P, tx: 11.2, ty: 168.6, tz: 53.2, d: 45, az: -102, el: 5, shift: 160 },
  fuse: { ...P, tx: 20.6, ty: 149, tz: 46, d: 30, az: -100, el: 6, shift: 160 },
  // the whole kitchen
  kitchen: { ...P, tx: 70, ty: 112, tz: 40, d: 600, az: -38, el: 8, fov: 36, shift: 150 },
  wide: POSE0,
};
/** What a cut to the bench sets, whatever came before. */
export const BENCHED = { explode: 0, litGlass: 0, litMesh: 0, litHooks: 0, open: 0, latch: 0, door: 1, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: DOOR.bench[0], fy: DOOR.bench[1], fz: DOOR.bench[2], fs: SIZE };
/** What a cut to the kitchen sets: the oven running, the door closed, you at the glass. */
export const STAGED = {
  shell: 1, you: 1, near: 1, pull: 0, eyes: 0, hand: 0, pain: 0, body: 1, door: 1, open: 0, latch: 0, sw: 1, stuck: 0, monitor: 0, fuse: 1, spark: 0, lamp: 1, explode: 0,
  power: 1, seen: 1, leak: 0, ruler: 0, light: 0.4, mood: 1, gel: 0, fx: -8, fy: 150, fz: 70, fs: 110,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const kitchen = buildKitchen();
  const oven = buildOven();
  const waves = buildWaves();
  if (waves.watch && kitchen.A.youEyes) waves.watch(kitchen.A.youEyes); // the rays of light end on your real eyes
  const set = new THREE.Group(); // the kitchen set
  set.add(kitchen.group, oven.group, waves.group);
  const bench = makeBench(SIZE);
  bench.group.add(oven.benchGroup);
  scene.add(set, bench.group);
  stage.grade.gel.set(0x5cffb0);

  return {
    kitchen, oven, waves, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      oven.update({ bench: onBench ? 1 : 0, body: S.body, door: S.door, open: S.open, latch: S.latch, sw: S.sw, stuck: S.stuck, monitor: S.monitor, fuse: S.fuse, spark: S.spark, spin: S.spin, lamp: S.lamp, explode: S.explode, litGlass: S.litGlass, litMesh: S.litMesh, litHooks: S.litHooks }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        kitchen.update({ shell: S.shell, you: S.you, near: S.near, pull: S.pull, open: S.open, eyes: S.eyes, hand: S.hand, pain: S.pain }, time, px);
        waves.update({ power: S.power * S.seen, door: S.door, open: S.open, leak: S.leak, ruler: S.ruler, light: S.light, near: S.near }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0003;
    },
  };
}

export { OVEN, DOOR, CAVITY, WINDOW, YOU };
