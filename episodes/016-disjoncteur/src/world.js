// DOSSIER 016 — Disjoncteur : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by wall.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ROOM: a wall seen like an X-ray — the wire that runs inside it from the consumer unit to a socket,
// a kettle and a heater on that socket, you beside them, the unit and its row of devices — and, solid in the row,
// the film's breaker. The BENCH: that same breaker — the system — alone on its pool of light, its side open.
// It is ONE object, re-parented: the cut from one to the other matches on it.
// Three colours. signal is the threat: the wire that heats, the overload, the short circuit, the arc. veille is the
// system alive: the blade that bends, the coil's pull, the latch that lets go, the arc put out — and, at the end,
// its neighbour the differential. ink is everything else, the ordinary current included.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { WALL, BOARD, MODULE, ROW, HOME, SOCKET, STRIP, KETTLE, HEATER, YOU, WIRE, FAULT, SYSTEM, RATING } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildWall } from "./wall.js";

export const SET = { BENCH: 0, ROOM: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

// The first frame is the hook: inside the wall, close on the wire that glows — it runs up and away toward the
// consumer unit — and, beyond the wall, you, the kettle, the heater. (A starting point: the builders refine it.)
export const POSE0 = { tx: 121.9, ty: 132.4, tz: -1.4, d: 46, az: 164, el: -8, fov: 64, shift: 150, side: -100, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.ROOM,
  /* ── the room (wall.js) ── */
  shell: 1, //    the X-ray of the room: the wall, the unit's box, the furniture (0–1)
  you: 1, //      0 nobody · 1 you, a body of glass, standing by the kettle
  kettle: 1, //   the kettle is on: its element glows, a little steam (0–1)
  heater: 1, //   the fan heater is on: its bars glow (0–1)
  hotwire: 0.7, // how hot the wire in the wall is: from an ink thread (0) to a signal glow that has a heart and a halo (1)
  char: 0, //     the insulation cooking at FAULT: it darkens, a wisp of smoke leaves it (0–1) — never a flame
  fault: 0, //    the short circuit at FAULT: the two wires touch, a light that has a place (0–1)
  dark: 0, //     the circuit is off: the kettle, the heater and their light go out (0 on · 1 off)
  others: 1, //   the other breakers of the row (0–1); under 0.8 the differential switch leaves too, unless `diff` lights it (it hides the film's breaker from the left)
  diff: 0, //     the differential switch, the breaker's neighbour, lights up veille (0–1); it is always there, in ink
  /* ── the system (model.js) ── */
  load: 1.125, // the current through the breaker, over its rating: 0 none · 1 is 16 A · 1.125 is 18 · 1.45 is 23 · 3 a short circuit (the wall's wire carries the same)
  cover: 1, //    its case: 1 closed · 0 the half-shell on the −x side off, the works showing
  xray: 0, //     the case turns to glass where it stands (0–1): the works show through
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart, in a row across the camera
  handle: 1, //   the handle: 1 up, on · 0 down, tripped
  gap: 0, //      the contacts: 0 closed · 1 apart
  latch: 0, //    the latch that holds the spring: 0 held · 1 let go
  bend: 0.1, //   the bimetal blade's bend: 0 straight · 1 it reaches the latch
  warm: 0.3, //   the blade's heat: it glows from ink to signal (0–1)
  pull: 0, //     the coil's field, right now: rings of veille around it (0–1)
  plunger: 0, //  the coil's core: 0 at rest · 1 thrown at the latch
  arc: 0, //      an arc burns between the contacts (0–1)
  split: 0, //    where the arc is: 0 between the contacts · 1 driven into the chamber, cut in slices by its plates
  litHandle: 0, litSpring: 0, litContacts: 0, litBlade: 0, litCoil: 0, litChamber: 0, // the part the voice is naming glows faintly veille
  /* ── the header ── */
  amps: 18, //    the current, in amperes: the header's big readout (it turns signal above 16)
  secs: 0, //     the time this current has lasted, in seconds: the header's second readout (it writes itself in seconds, then in minutes)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 120, fy: 120, fz: 0, fs: 120, mood: 1, gel: 0.25, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = HOME;
export const VIEW = {
  hook: POSE0,
  /* ── in the room ── */
  // the whole wall from the room: you, the kettle, the heater, the wire's run, the unit
  room: { ...P, tx: -20, ty: 120, tz: 10, d: 617.5, az: -71, el: 6.5, fov: 50, shift: 130, side: 50 },
  // the socket, the strip, the two plugs
  plugs: { ...P, tx: 114, ty: 14, tz: 30, d: 192, az: -32.1, el: 30.3, fov: 36, shift: 30, side: -40 },
  // inside the wall, close on the place where the insulation cooks and where the two wires touch
  fault: { ...P, tx: 120.8, ty: 132, tz: -3, d: 118, az: -30.3, el: 7.9, shift: 60 },
  // the consumer unit and its row
  board: { ...P, tx: BOARD.at[0], ty: BOARD.rowY, tz: 4, d: 150, az: -24, el: 6, shift: 150 },
  // the film's breaker in its row, the others gone: act 2 cuts to the bench from it (it is `whole`, moved to the bench)
  system: { ...P, tx: HX, ty: HY + 4.2, tz: HZ + 3.5, d: 46, az: -62, el: 12, shift: 150 },
  /* ── on the bench (the breaker stands on the origin) ── */
  whole: { ...P, tx: 0, ty: 4.2, tz: 3, d: 46, az: -62, el: 12, shift: 150 },
  exploded: { ...P, tx: 0, ty: 6.1, tz: 3.3, d: 63, az: -60, el: 12, shift: 160 },
  // the upper row of the exploded view alone, in the voice's order: handle and link · latch · spring · contacts · blade · coil
  row: { ...P, tx: 0, ty: 10.8, tz: 3.3, d: 50, az: -60, el: 8, shift: 150 },
  // closed, three quarters · the blade · the coil · the contacts and the chamber (the arc)
  closed: { ...P, tx: 0, ty: 4.2, tz: 3, d: 46, az: -40, el: 14, shift: 150 },
  blade: { ...P, tx: 0, ty: 3.2, tz: 3.9, d: 20, az: -80, el: 6, shift: 120 },
  coil: { ...P, tx: 0, ty: 2.7, tz: 2.3, d: 20, az: -62, el: 10, shift: 120 },
  arc: { ...P, tx: 0, ty: 5.0, tz: 2.4, d: 22, az: -62, el: 10, shift: 120 },
};
/** What a cut to the bench sets, whatever came before: the breaker whole, on, its side open, no current. */
export const BENCHED = {
  shell: 0, you: 0, kettle: 0, heater: 0, hotwire: 0, char: 0, fault: 0, dark: 0, others: 0, diff: 0,
  load: 0, cover: 0, xray: 0, explode: 0, handle: 1, gap: 0, latch: 0, bend: 0, warm: 0, pull: 0, plunger: 0, arc: 0, split: 0,
  litHandle: 0, litSpring: 0, litContacts: 0, litBlade: 0, litCoil: 0, litChamber: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 4.2, fz: 3, fs: SIZE,
};
/** What a cut to the room sets: the evening of the hook — kettle and heater on, 18 A, the wire warm, the breaker closed. */
export const STAGED = {
  shell: 1, you: 1, kettle: 1, heater: 1, hotwire: 0.5, char: 0, fault: 0, dark: 0, others: 1, diff: 0,
  load: 1.125, cover: 1, xray: 0, explode: 0, handle: 1, gap: 0, latch: 0, bend: 0.1, warm: 0.3, pull: 0, plunger: 0, arc: 0, split: 0,
  litHandle: 0, litSpring: 0, litContacts: 0, litBlade: 0, litCoil: 0, litChamber: 0,
  amps: 18, secs: 0, mood: 1, gel: 0, fx: 120, fy: 120, fz: 0, fs: 120,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const wall = buildWall();
  const system = buildSystem();
  const set = new THREE.Group(); // the room
  const mount = new THREE.Group(); // where the breaker stands in the row
  mount.position.set(...HOME);
  set.add(wall.group, mount);
  const bench = makeBench(SIZE);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    wall, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? bench.group : mount;
      if (system.root.parent !== home) home.add(system.root);
      system.update({ bench: onBench ? 1 : 0, load: S.load, cover: S.cover, xray: S.xray, explode: S.explode, handle: S.handle, gap: S.gap, latch: S.latch, bend: S.bend, warm: S.warm, pull: S.pull, plunger: S.plunger, arc: S.arc, split: S.split, litHandle: S.litHandle, litSpring: S.litSpring, litContacts: S.litContacts, litBlade: S.litBlade, litCoil: S.litCoil, litChamber: S.litChamber }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        wall.update({ shell: S.shell, you: S.you, kettle: S.kettle, heater: S.heater, hotwire: S.hotwire, char: S.char, fault: S.fault, dark: S.dark, others: S.others, diff: S.diff, load: S.load }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0004;
    },
  };
}

export { WALL, BOARD, MODULE, ROW, HOME, SOCKET, STRIP, KETTLE, HEATER, YOU, WIRE, FAULT, SYSTEM, RATING };
