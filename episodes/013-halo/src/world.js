// DOSSIER 013 — Halo : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, f1.js, rail.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The TRACK: a Formula 1 car seen like an X-ray going through a triple steel barrier — and, solid in
// all that glass, the only things that matter: the survival cell, the halo bolted on it, your helmet. The frame
// is the car's: the cell never moves, the barrier comes to it (`ahead`). The BENCH: that same assembly — the
// system — alone on its pool of light. It is ONE object, re-parented: the cut from one to the other matches on it.
// Three colours. signal is the threat: the steel of the barrier where it is struck, the fire. veille is what
// protects you: the halo when the voice names it, the space it keeps around your head. ink is everything else.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { SYSTEM, CAR, CELL, COCKPIT, HELMET, HALO, RAIL, FIRE, EXIT, RIVAL, SPLIT } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildCar } from "./f1.js";
import { buildRail } from "./rail.js";

export const SET = { BENCH: 0, TRACK: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

// The first frame is the hook: the cell half-way through the barrier, the beams giving way around it, the halo
// about to reach the steel — and it MOVES from frame 1. (A starting point: the sets' builders refine it with `look`.)
// Low and almost head-on: it is the only place from which your helmet and the ring show through the opening
// while the top beam is still ahead of them (from az −38 the torn beam and a bent post stand in front of the cockpit).
export const POSE0 = { tx: 0, ty: 72, tz: 30, d: 400, az: -12, el: 2, fov: 38, shift: 150, side: 60, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.TRACK,
  /* ── the track, the barrier, the fire (rail.js) ── */
  shell: 1, //   the X-ray of the car's body and of the track: glass and fine lines (0–1)
  ahead: 1.6, // metres between the barrier and its final place, along the car's path: 60 far away · RAIL.first (3.75) the nose touches · ≈ 0.9 the beams are at the front of the halo · 0 LODGED. The beams give way around the car by themselves as it goes through
  fire: 0, //    the fuel fire, born at the cell's rear: 0 nothing · 0.3 the first flames · 1 the fireball over the barrier (0–1)
  /* ── the rest of the car (f1.js) ── */
  split: 0, //   the rear end (engine, gearbox, rear wheels, wing) tears off the cell: 0 bolted on → 1 gone, lying on the track side
  rival: 0, //   the other car's front-left wheel: 0 nowhere → 1 against your right-rear wheel
  /* ── the system: the cell, the halo, you (model.js) ── */
  you: 1, //     0 nobody · 1 you in the seat: a body of glass, a solid helmet, your hands on the wheel
  out: 0, //     your way out (0–1): 0 seated · 0.5 standing in the cockpit, out of the fire · 1 over the bent top beam
  harness: 0, // your six-point harness, lit veille (0–1)
  space: 0, //   the space the halo keeps: a soft veille volume around your head, under the ring (0–1)
  stress: 0, //  the halo bearing the steel: a white-hot line where the beam leans on the ring, sparks (0–1)
  press: 0, //   the homologation test, on the bench: a ram comes down on the halo — 0 away · 0.3 it touches · 1 full load; the halo does not yield
  explode: 0, // on the bench: 0 the assembly whole → 1 the halo lifted off the cell, its three fixings apart
  litHalo: 0, litFoot: 0, litMounts: 0, litCell: 0, // the part the voice is naming glows faintly veille
  /* ── the header's readouts (main.js prints them) ── */
  kmh: 192, //   the speed the header shows
  sec: 0, //     the header's clock: seconds since the impact (printed T+0:SS)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 72, fz: 30, fs: 170, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  hook: POSE0,
  /* ── on the track, from BEHIND the barrier (the camera's usual side: the car comes out toward us) ── */
  // the cockpit from close: your helmet under the ring, the top beam on it (the strong picture: ahead 0.9, stress 1)
  cockpit: { ...P, tx: 0, ty: 74, tz: 4, d: 340, az: -30, el: 13, shift: 150, side: 30 },
  // from above: your shoulders, the harness (it only reads from el ≥ 30), your hands on the wheel
  belts: { ...P, tx: 0, ty: 62, tz: 14, d: 320, az: -26, el: 36, shift: 150 },
  // in profile: the top beam at the height of your helmet, the halo between them (good at ahead 0.9)
  profile: { ...P, tx: 0, ty: 74, tz: 30, d: 420, az: -88, el: 3, shift: 150 },
  // the barrier whole, a triple steel rail one recognises (ahead ≥ 5.6; light it with fz: 335)
  barrier: { ...P, tx: 0, ty: 60, tz: 335, d: 620, az: -30, el: 9, fov: 36, shift: 150 },
  // the whole car, far from the barrier (ahead 60): three quarters · in profile
  coming: { ...P, tx: 0, ty: 40, tz: 60, d: 1400, az: -26, el: 12, fov: 30, shift: 60, side: 70 },
  carSide: { ...P, tx: 0, ty: 45, tz: 50, d: 2000, az: -90, el: 5, fov: 30, shift: 0 },
  // your right-rear wheel and the other car's wheel
  contact: { ...P, tx: -105, ty: 44, tz: -165, d: 640, az: -140, el: 16, shift: 150, side: 40 },
  // from above: the barrier across the car's path, the breach
  above: { ...P, tx: 0, ty: 40, tz: 80, d: 900, az: -20, el: 60, fov: 32, shift: 150 },
  // lodged: the wreck and its fire (fire ≤ 0.6) · the fireball (fire 1: from `lodged` it is an orange wall) · your way out
  lodged: { ...P, tx: 0, ty: 80, tz: -20, d: 760, az: -40, el: 10, fov: 34, shift: 150 },
  blaze: { ...P, tx: 20, ty: 150, tz: -60, d: 1250, az: -38, el: 6, fov: 40, shift: 100 },
  exit: { ...P, tx: 30, ty: 90, tz: 10, d: 600, az: -40, el: 8, fov: 32, shift: 100 },
  /* ── on the track, from the TRACK side ── */
  // the rear end torn off, from behind and above · the front breaking up in the beams · the wreck and the fire · the beams lit by the fire
  torn: { ...P, tx: 20, ty: 30, tz: -190, d: 1400, az: 165, el: 32, fov: 30, shift: 90 },
  shatter: { ...P, tx: 20, ty: 30, tz: 170, d: 950, az: 52, el: 24, fov: 30, shift: 0 },
  trackSide: { ...P, tx: 60, ty: 120, tz: -120, d: 1100, az: 135, el: 8, fov: 38, shift: 100 },
  railLit: { ...P, tx: -145, ty: 55, tz: -302, d: 272, az: 173, el: 3, fov: 34, shift: 150 },
  // the system in the track set, everything else gone dark: act 2 cuts to the bench from it (it is `whole`, moved back by SYSTEM.bench)
  system: { ...P, tx: 0, ty: 50, tz: 67, d: 860, az: -30, el: 20, shift: 160, side: 70 },
  /* ── on the bench (the system stands at SYSTEM.bench: a point of the car at z is at z − 61 there, y − 4) ── */
  whole: { ...P, tx: 0, ty: 46, tz: 6, d: 860, az: -30, el: 20, shift: 160, side: 70 },
  // the halo lifted off · closer, for the sentence that names the fixings (at d 1080 they are thirty pixels)
  exploded: { ...P, tx: 0, ty: 74, tz: -8, d: 1080, az: -46, el: 17, shift: 110, side: 60 },
  explodedClose: { ...P, tx: 0, ty: 82, tz: -30, d: 860, az: -42, el: 18, shift: 80, side: 50 },
  // assembled: the halo · its foot · a rear mount · the whole cell · the ram on the ring · your head under the ring (you: 1)
  haloPart: { ...P, tx: 0, ty: 72, tz: -58, d: 400, az: -36, el: 16, shift: 150, side: 40 },
  footPart: { ...P, tx: 0, ty: 70, tz: -4, d: 190, az: -50, el: 12, shift: 170 },
  mountPart: { ...P, tx: -27, ty: 62, tz: -101, d: 150, az: -64, el: 16, shift: 150 },
  cellPart: { ...P, tx: 0, ty: 36, tz: 10, d: 1010, az: -50, el: 16, shift: 170, side: 60 },
  pressPart: { ...P, tx: 0, ty: 84, tz: -40, d: 460, az: -36, el: 12, shift: 60, side: 20 },
  head: { ...P, tx: 0, ty: 70, tz: -57, d: 340, az: -30, el: 13, shift: 150, side: 30 },
};
/** What a cut to the bench sets, whatever came before: the system whole, nobody in it. */
export const BENCHED = {
  shell: 0, split: 0, rival: 0, fire: 0, you: 0, out: 0, harness: 0, space: 0, stress: 0, press: 0, explode: 0,
  litHalo: 0, litFoot: 0, litMounts: 0, litCell: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 50, fz: 0, fs: SIZE,
};
/** What a cut to the track sets: the car is on the barrier, nothing has touched yet (the right front endplate touches at 5.5, the nose tip at RAIL.first). */
export const STAGED = {
  shell: 1, ahead: 5.6, fire: 0, split: 0, rival: 0, you: 1, out: 0, harness: 0, space: 0, stress: 0, press: 0, explode: 0,
  litHalo: 0, litFoot: 0, litMounts: 0, litCell: 0, kmh: 192, mood: 1, gel: 0, fx: 0, fy: 72, fz: 30, fs: 170,
};
/** …and the wreck, at rest: the cell lodged in the barrier, the rear end gone, the fire. */
export const LODGED = { ahead: 0, split: 1, fire: 1, kmh: 0 };

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const car = buildCar();
  const rail = buildRail();
  const set = new THREE.Group(); // the track set, in the car's frame
  const mount = new THREE.Group(); // where the system stands in the car: the origin
  set.add(car.group, rail.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench
  benchMount.position.set(...SYSTEM.bench);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    system, car, rail, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      const b = onBench ? 1 : 0;
      system.update({ bench: b, ahead: S.ahead, you: S.you, out: S.out, harness: S.harness, space: S.space, stress: S.stress, press: S.press, explode: S.explode, fire: onBench ? 0 : S.fire, litHalo: S.litHalo, litFoot: S.litFoot, litMounts: S.litMounts, litCell: S.litCell }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        car.update({ shell: S.shell, ahead: S.ahead, split: S.split, rival: S.rival, fire: S.fire }, time, px);
        rail.update({ shell: S.shell, ahead: S.ahead, fire: S.fire, split: S.split }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.00012;
    },
  };
}

export { SYSTEM, CAR, CELL, COCKPIT, HELMET, HALO, RAIL, FIRE, EXIT, RIVAL, SPLIT };
