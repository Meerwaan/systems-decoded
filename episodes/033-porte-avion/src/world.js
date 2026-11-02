// DOSSIER 033 — Porte d'avion : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (read by vol.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The FLIGHT (vol.js): 023's A330 of glass at night, with L03's cabin of glass inside it, a neighbour of
// glass forcing door 1L, you seated just beside — and in the door, SOLID, the system. The BENCH: the same door alone
// on its pool of light, opened. ONE object (model.js), re-parented: the cut from one to the other matches on it.
// Three colours. signal is the threat: the neighbour's pull, the locks that let go (a hypothesis), the door that opens
// in Korea, low over the runway. veille is what holds the door: the stops, and the cabin's air that outnumbers the
// night's (the arrows that press). ink is the rest — and the air that only balances.
//
// THE AIR IS COMPUTED, NOT POSED. One number, `alt` (true metres: the header's big readout), gives the pressure on each
// face of the door (pOut, pCab below — the standard atmosphere, the cabin's altitude growing with the plane's to 8 000 ft
// at cruise), hence the arrows' numbers on each face, the load on the stops and the header's « Sur la porte » (≈ 8 t at
// cruise, ≈ 0 on the ground or at 200 m). An act never writes the arrows: it moves `alt` (and `air`, `wall`).
//
// THE PLANE STANDS STILL, THE WORLD COMES TO IT (023): `alt` sets the depth of the sea under it, `ahead` where the
// runway's threshold is. Move `ahead` a little, straight ("none"), in every outside shot: a still sea is a still plane.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { DOOR_AT, DOOR, AIR, BENCH, PEOPLE, PLANE, RECORDER } from "./plan.js";
import { buildModel } from "./model.js";
import { buildVol } from "./vol.js";

export const SET = { BENCH: 0, VOL: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = BENCH.size;

/** The studio (docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof` on the CLOSE-UPS only (the poses that spread CLOSE) · `air` 0 (no contre-jour here) · `finish` the solid parts' surface. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };
const CLOSE = { dof: LOOK.dof };

/* ── the air on the door, from `alt` ── */
const clamp01 = (x) => Math.min(1, Math.max(0, x));
/** The outside pressure at h metres, a fraction of sea level (ISA: troposphere, then the stratosphere above 11 km). */
export const pOut = (h) => {
  const t = Math.pow(1 - 2.25577e-5 * Math.min(Math.max(0, h), 11000), 5.25588);
  return h > 11000 ? t * Math.exp(-(h - 11000) / 6341.6) : t;
};
/** The cabin's pressure: its altitude grows with the plane's, to AIR.cabinMax (≤ 8 000 ft) at cruise. */
export const pCab = (h) => pOut(AIR.cabinMax * clamp01(h / AIR.cruise));
/** The force on the door, tonnes-force: Δp × the door's area (≈ 8,2 at cruise; said « environ huit tonnes »). */
export const tonnesOf = (h) => Math.max(0, ((pCab(h) - pOut(h)) * 101.325 * AIR.area) / 9.80665);
const LOAD_CRUISE = pCab(AIR.cruise) - pOut(AIR.cruise);
/** What model.js reads of the air: the pressures inside and out (arrows' numbers), the load on the stops (0–1). */
export const airOf = (h) => ({ pin: pCab(h), pout: pOut(h), load: clamp01((pCab(h) - pOut(h)) / LOAD_CRUISE) });

const [DX, DY, DZ] = DOOR_AT;
const MIDY = DY + DOOR.open.h / 2; // the door's middle, in the plane

// The first frame is the hook, « Ton voisin force la porte, en plein vol » : inside the cabin of glass, low against
// door 1L, looking up — the neighbour's hands on the handle, his body leaning back; behind the glass, the night; the
// door SOLID on its halo, still. PROVISIONAL (set on the bouchons): the four candidates are in docs/033-actes.md.
export const POSE0 = { tx: -2412, ty: -10, tz: 235, d: 400, az: 118, el: -14, fov: 44, shift: 110, side: 0, roll: 0, drift: 0, dof: 0 }; // chosen 30/10: low profile, the neighbour pulling, the stops lit

export const FIRST = {
  set: SET.VOL,
  /* ── the flight (vol.js · 023) ── */
  alt: AIR.cruise, // altitude, TRUE metres: the header's big readout, the sea's depth under the plane, AND the air on the door
  ahead: 0.05, //    the runway's threshold ahead (023: 0–1 of ISLAND.far; 0 under the wheels): move it straight in outside shots
  pitch: 0, //       the plane's attitude, degrees (+ nose up: the climb ≈ +8); keep 0 inside the cabin
  bank: 0, //        degrees, + the left wing down
  wind: 0.5, //      the air along the plane outside: fine streaks flowing aft (0–1)
  shell: 0.35, //       the A330's X-ray: glass skin, frames, windows (0–1) — inside the cabin, lower it (≈ 0.35)
  runway: 0, //      the runway's lights (0–1): Korea, the approach
  made: 0, //        0 the runway's lamps signal → 1 veille (keep 0: Korea is a threat)
  gear: 0, //        the landing gear: 0 up → 1 down (Korea)
  /* ── the cabin (vol.js · L03) ── */
  cabin: 1, //       L03's cabin drawn in the plane (0 / 1: hide it on the far outside shots only)
  lights: 0.15, //   the cabin lights (0 off → 1 on): night flight, dimmed
  emerg: 0, //       the emergency lamps (0–1): keep 0 (nothing is evacuating)
  pax: 1, //         the passengers of glass seated in the rows (0–1)
  /* ── the people (vol.js) ── */
  voisin: 1, //      the neighbour standing at door 1L, both hands on the handle (0 gone → 1 there)
  pull: 1, //      his weight on the handle: 0 hands resting → 1 all his weight, leaning back, jerking (time-driven, from frame 1)
  seated: 0, //      Korea: a passenger seated by the door: 0 none → 1 there, still → 2 his arm reaches the handle and lifts it
  you: 1, //         you, seated in the first row by the door (0 → 1)
  grip: 1, //        your hand on the armrest: 1 clenched → 0 let go (the like)
  /* ── the door (model.js) ── */
  explode: 0, //     « on l'ouvre »: 0 assembled → 1 the parts in their lanes (panel, handle, hook shaft; the frame stays)
  named: 0, //       the part the voice names, lit (integer, `now`): 0 none · 1 the handle · 2 the hooks and their shaft ·
  //                 3 the overhang (the frame's outline ink, the panel's overhang veille) · 4 the stops (the heart)
  section: 0, //     the door and its frame cut through the middle, seen edge-on (0 whole → 1 cut): the profile, inside | door |
  //                 stops | outside, with the arrows on both faces
  handle: 0, //      the handle: 0 stowed → 1 lifted all the way (Korea: « le levier a suffi »); forced in flight, ≤ 0.25 and jerking
  hooks: 0, //       the locking hooks: 0 engaged → 1 all retracted, one after the other, signal while they go (the hypothesis)
  stops: 0.25, //    the stops' light (veille, 0–1): 1 = lit, the heart; they shiver under the load (`alt`)
  open: 0, //        Korea only: 0 shut → 1 the door swings OUT and forward on its hinge arm (never up, never in), signal
  air: 0, //         the arrows on both faces of the door shown (0–1); their numbers come from `alt`
  wall: 0, //        the climax: the arrows of the whole cabin streaming to the door (0 → 1: up to AIR.reach deep)
  tug: 0, //         the neighbour's force drawn as ONE signal arrow at the handle, pointing into the cabin (0–1): tiny against the wall
  /* ── the next file (vol.js) ── */
  recorder: 0, //    034's bait: 0 none → 1 in the tail cone, solid → 2 fallen into the dark, onto its halo far below
  /* ── the light ── */
  fx: DX, fy: MIDY, fz: DZ, fs: 300, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL: set on bouchons —
 *  the agents of vol.js and model.js give better ones in their journals. Plane frame unless said. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── inside the cabin (az 130–170: from inside, aft, toward the door) ── */
  doorIn: { ...P, tx: DX, ty: MIDY, tz: DZ - 10, d: 460, az: 145, el: 4, fov: 32, shift: 110 }, //       the door whole, the neighbour on it (fs 250)
  handle: { ...P, ...CLOSE, tx: DX + 20, ty: DY + 108, tz: DZ - 48, d: 170, az: 140, el: 10, fov: 30, shift: 60 }, // his hands on the handle (fs 60)
  floor: { ...P, tx: DX + 60, ty: DY, tz: DZ - 70, d: 260, az: 120, el: 72, fov: 40, shift: 0 }, //       straight down through the glass floor
  deep: { ...P, tx: DX + 60, ty: -16000, tz: DZ - 70, d: 3000, az: 120, el: 84, fov: 40, shift: 0 }, // the plunge's end: the night, the island far below (ahead 0.02)
  you: { ...P, tx: -2270, ty: DY + 96, tz: 250, d: 560, az: 108, el: 8, fov: 34, shift: 40 }, // you in the foreground, the door, the neighbour on it (pax 0.35 for the shot)
  edge: { ...P, tx: DX + 54, ty: MIDY, tz: DZ - 30, d: 200, az: 155, el: 8, fov: 30, shift: 40 }, // the door's aft edge: what « on l'ouvre » opens
  aisle: { ...P, tx: DX + 40, ty: DY + 110, tz: 140, d: 1000, az: 98, el: 5, fov: 32, shift: 80 }, //   down the aisle to the door (the threshold)
  wall: { ...P, tx: DX + 230, ty: DY + 100, tz: DZ - 110, d: 1150, az: 125, el: 18, fov: 36, shift: 120 }, // the cabin, the air streaming to the door
  /* ── outside (az −20 → −60: the left flank, from ahead and below) ── */
  plane: { ...P, tx: DX + 500, ty: -40, tz: DZ - 20, d: 3600, az: -38, el: -14, fov: 34, shift: 150 }, // the A330 in flight, door 1L lit on its flank
  doorOut: { ...P, tx: DX, ty: MIDY, tz: DZ + 5, d: 700, az: -24, el: -8, fov: 30, shift: 100 }, //    the door from outside, three quarters
  approach: { ...P, tx: DX, ty: DY - 4, tz: DZ, d: 1900, az: 38, el: -6, fov: 40, shift: 120 }, //    Korea: low, the runway ahead (to check on the acts sheet)
  tail: { ...P, tx: RECORDER.at[0], ty: RECORDER.at[1], tz: 0, d: 520, az: -50, el: 14, fov: 32, shift: 60 }, // the tail cone: the recorder
  /* ── on the bench (the sill on the origin, the door turned BENCH.turn: its CABIN face toward +z, the key light) ── */
  whole: { ...P, tx: 0, ty: 100, tz: 0, d: 560, az: -32, el: 12, shift: 60 },
  exploded: { ...P, tx: -10, ty: 100, tz: 70, d: 660, az: -40, el: 14, fov: 30, shift: 100 }, // ONE vertical frame (fs 160)
  handleB: { ...P, tx: -52, ty: 105, tz: 145, d: 440, az: -40, el: 10, fov: 30, shift: 0 }, //      the handle (its lane)
  hooksB: { ...P, tx: -55, ty: 96, tz: 22, d: 300, az: -40, el: 8 }, //                  the hooks on their shaft, aft edge
  lapB: { ...P, tx: -30, ty: 100, tz: 20, d: 440, az: -55, el: 18 }, //                    the panel over its frame, nearly edge-on
  stopB: { ...P, ...CLOSE, tx: -56, ty: 82, tz: 16, d: 75, az: -60, el: 12 }, //          a stop pair: the heart
  section: { ...P, tx: -10, ty: 96, tz: 0, d: 720, az: 90, el: 4, shift: 0 }, //          the cut, edge-on: cabin LEFT of the screen, night RIGHT
};

/** The bench pose that frames what `pose` (plane frame, aimed at the door, pitch 0) frames: for the cut of « on l'ouvre »
 *  (acte2: cut(at, SET.BENCH, benchPose(VIEW.edge), BENCHED)) — the door is turned BENCH.turn on the bench. */
export function benchPose(pose) {
  const th = BENCH.turn;
  const lx = pose.tx - DX;
  const lz = pose.tz - DZ;
  const az = ((pose.az + (th * 180) / Math.PI + 540) % 360) - 180;
  return { ...pose, tx: lx * Math.cos(th) + lz * Math.sin(th), ty: pose.ty - DY, tz: -lx * Math.sin(th) + lz * Math.cos(th), az };
}

/** What a cut to the bench sets, whatever came before: the door whole, still, nothing lit; the flight's numbers kept. */
export const BENCHED = {
  explode: 0, named: 0, section: 0, handle: 0, hooks: 0, stops: 0.25, open: 0, air: 0, wall: 0, tug: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: DOOR.open.h / 2, fz: 0, fs: SIZE,
};
/** What a cut to the flight sets: night at cruise, the cabin dim, the neighbour at the door, you beside it. */
export const STAGED = {
  pitch: 0, bank: 0, wind: 0.5, shell: 0.35, runway: 0, made: 0, gear: 0,
  cabin: 1, lights: 0.15, emerg: 0, pax: 1, voisin: 1, pull: 0.7, seated: 0, you: 1, grip: 1,
  explode: 0, named: 0, section: 0, handle: 0, hooks: 0, stops: 0.25, open: 0, air: 0, wall: 0, tug: 0, recorder: 0,
  mood: 1, gel: 0, fx: DX, fy: MIDY, fz: DZ, fs: 300,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const model = buildModel();
  const vol = buildVol({ handle: model.A.handle });
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // the door on the bench: sill on the origin, turned
  benchMount.rotation.y = BENCH.turn;
  bench.group.add(benchMount);
  scene.add(vol.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    model, vol, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = Math.round(S.set) === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      vol.group.visible = !onBench;
      const home = onBench ? benchMount : vol.A.door;
      if (model.root.parent !== home) home.add(model.root);
      model.update({
        explode: S.explode, named: Math.round(S.named), section: S.section, handle: S.handle, hooks: S.hooks, stops: S.stops,
        open: S.open, air: S.air, wall: onBench ? 0 : S.wall, tug: S.tug, mood: S.mood, ...airOf(S.alt),
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        vol.update({
          alt: S.alt, ahead: S.ahead, pitch: S.pitch, bank: S.bank, wind: S.wind, shell: S.shell, runway: S.runway, made: S.made, gear: S.gear,
          cabin: S.cabin, lights: S.lights, emerg: S.emerg, pax: S.pax,
          voisin: S.voisin, pull: S.pull, seated: S.seated, you: S.you, grip: S.grip, recorder: S.recorder, mood: S.mood,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.45 / Math.max(60000, d * 2.4);
    },
  };
}

export { PLANE };
