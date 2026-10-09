// DOSSIER 017 — IRM : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by suite.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SUITE: an MRI room seen like an X-ray — walls and a door of glass, the line on the floor, you in
// the doorway with an oxygen cylinder — and, solid in all that glass, the scanner, the cylinder, the box with its
// two buttons. The BENCH: that same scanner — the system — alone on its pool of light, opened.
// It is ONE object, re-parented: the cut from one to the other matches on it.
// Three colours. signal is the threat: the magnet's field (its lines, its pull, the header's readout), whatever
// it throws. veille is the system alive: the helium, the button that stops the magnet, the field coming down.
// ink is everything else — the machine's own lights, the current's quiet round included.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { ROOM, MAGNET, PIPE, BOX, YOU, BOTTLE, LINE, SYSTEM, TESLA } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildSuite } from "./suite.js";

export const SET = { BENCH: 0, SUITE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

// The first frame is the hook, taken from BEHIND the door's wall (it is glass): the silent scanner, the mouth of its
// tunnel toward us, and in the doorway, seen from three quarters behind, you, the cylinder in your arms. The
// cylinder's flight crosses this frame from right to left.
export const POSE0 = { tx: 75, ty: 130, tz: 220, d: 1260, az: -10.8, el: 11.8, fov: 38, shift: 240, side: 70, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.SUITE,
  /* ── the room (suite.js) ── */
  shell: 1, //   the X-ray of the room: walls, ceiling, the door's frame (0–1)
  door: 1, //    the door: 0 shut · 1 open
  line: 1, //    the line painted on the floor around the magnet (0–1)
  you: 1, //     0 nobody · 1 you, a body of glass
  spot: 0, //    where you stand: 0 in the doorway (the cylinder in your arms) · 1 at the box with the two buttons
  reach: 0, //   your LEFT hand at the box: 0 down · 1 on the emergency stop · 2 on the magnet stop
  carry: 1, //   you carry the oxygen cylinder (1) or your hands are empty and there is no cylinder at all (0)
  bottle: 0, //  the oxygen cylinder: 0 in your arms · 1 against the mouth of the tunnel (in between it flies, turning to line up with the field)
  loose: 0, //   small iron things leaving a trolley by the wall and flying to the magnet: keys, scissors, a pen (0–1)
  victim: 0, //  0 nobody · 1 someone of glass held against the machine by the cylinder (bottle must be 1) — never hurt on screen
  sky: 0, //     above the roof: the open air where the pipe ends (0–1); it only matters when the camera goes up there
  /* ── the system (model.js) ── */
  tesla: 1.5, // the field at the centre of the tunnel: the header's big readout; the pull on everything
  seen: 0.3, //  how much of the field is DRAWN: its lines around the magnet, signal (0–1) — the field is there even at 0
  spin: 0, //    the current running round the coils, drawn: a quiet light going round and round (0–1)
  power: 1, //   the machine's electronics: 1 on (its lights, the table, the panel) · 0 off — the field does not care
  knock: 0, //   an exam is running: the gradient coils knock (0–1)
  cover: 1, //   the covers: 1 on · 0 off (they leave), the works showing
  xray: 0, //    covers and vessels turn to glass where they stand (0–1)
  explode: 0, // on the bench: 0 assembled → 1 its parts apart, in a row across the camera
  helium: 1, //  the liquid helium in the vessel (1 full → 0 gone)
  boil: 0, //    the helium boiling (0–1)
  plume: 0, //   the gas rushing up the pipe and out above the roof: a cold white cloud (0–1)
  hot: 0, //     the coils losing their superconductivity: a warm stretch that spreads along the wire (0–1)
  estop: 0, //   the emergency stop: 0 out · 1 pressed
  flap: 0, //    the cover over the magnet stop: 0 shut · 1 lifted
  mstop: 0, //   the magnet stop: 0 out · 1 pressed
  litBore: 0, litGradients: 0, litMagnet: 0, litHelium: 0, litPipe: 0, litButtons: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 108, fz: 60, fs: 320, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [MX, MY, MZ] = MAGNET.at;
export const VIEW = {
  hook: POSE0,
  /* ── in the room ── */
  // the whole room from the far corner: the scanner, the table, the door, you
  room: { ...P, tx: 40, ty: 100, tz: 150, d: 2200, az: -20, el: 26, fov: 36, shift: 190 },
  // the doorway, you in it, the line on the floor in front of you
  door: { ...P, tx: 110, ty: 105, tz: 330, d: 969.7, az: -10.5, el: 15.2, fov: 36, shift: 200 },
  // the trolley by the wall and its small iron things (their take-off) · their whole flight to the magnet
  trolley: { ...P, tx: -190, ty: 110, tz: 140, d: 484.7, az: -52.9, el: 16.8, fov: 40, shift: 100 },
  loose: { ...P, tx: -170, ty: 105, tz: 130, d: 608.9, az: -54.1, el: 17.7, fov: 40, shift: 140 },
  // the mouth of the tunnel, where things end up
  mouth: { ...P, tx: -30, ty: 100, tz: 100, d: 1100, az: -24, el: 8, shift: 170 },
  // the box with the two buttons, and you at it
  box: { ...P, tx: 62, ty: 100, tz: 398, d: 760, az: 150, el: 12, fov: 40, shift: 170 },
  boxNear: { ...P, tx: 64, ty: 128, tz: 404, d: 330, az: 152, el: 10, fov: 44, shift: 150 },
  // the pipe above the roof
  roof: { ...P, tx: 0, ty: 450, tz: -30, d: 1000, az: -34, el: 5, fov: 36, shift: 80 },
  // the top of the pipe, the cloud coming out (plume 0.5) · the cloud grown (plume 1; light: fy 300, fs 420)
  pipe: { ...P, tx: 20, ty: 440, tz: -30, d: 1300, az: -40, el: -4, shift: 160 },
  plume: { ...P, tx: 60, ty: 520, tz: -30, d: 1900, az: -40, el: -6, shift: 160 },
  // the scanner alone, everything else gone dark: act 2 cuts to the bench from it (the same pose: on the bench it stands on the origin too)
  system: { ...P, tx: 28, ty: 105, tz: 24, d: 1450, az: -40, el: 14, shift: 160 },
  /* ── on the bench ── */
  whole: { ...P, tx: 28, ty: 105, tz: 24, d: 1450, az: -40, el: 14, shift: 160 },
  // (the exploded view wants the light wide: fs 420; from explode 0.45 up the vessel turns to glass by itself)
  exploded: { ...P, tx: -4, ty: 150, tz: -3, d: 2750, az: -40, el: 16, shift: 200 },
  // opened (cover 0, xray 1): the tunnel, the gradients, the rings in their bath · the field around it (seen 1, fs 420)
  open: { ...P, tx: 6, ty: 104, tz: 5, d: 1250, az: -40, el: 14, shift: 185 },
  field: { ...P, tx: 0, ty: 190, tz: 0, d: 2900, az: -40, el: 14, shift: 160 },
  // the rings, close · the gradients (xray 1, knock 1) · the front: its lights (power)
  coils: { ...P, tx: -25, ty: 150, tz: 30, d: 560, az: -40, el: 12, shift: 160 },
  gradients: { ...P, tx: 0, ty: 108, tz: 50, d: 700, az: -30, el: 10, shift: 160 },
  front: { ...P, tx: 0, ty: 112, tz: 90, d: 620, az: -28, el: 8, shift: 160 },
  // the box with the two buttons, on its post beside the machine (light: fx 178, fy 118, fz 70, fs 60)
  boxBench: { ...P, tx: 178, ty: 118, tz: 70, d: 150, az: -38, el: 8, shift: 160 },
};
/** What a cut to the bench sets, whatever came before: the scanner whole, covers on, at field, at rest. */
export const BENCHED = {
  shell: 0, door: 0, line: 0, you: 0, spot: 0, reach: 0, carry: 0, bottle: 0, loose: 0, victim: 0, sky: 0,
  tesla: 1.5, seen: 0, spin: 0, power: 1, knock: 0, cover: 1, xray: 0, explode: 0, helium: 1, boil: 0, plume: 0, hot: 0, estop: 0, flap: 0, mstop: 0,
  litBore: 0, litGradients: 0, litMagnet: 0, litHelium: 0, litPipe: 0, litButtons: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 110, fz: 0, fs: SIZE,
};
/** What a cut to the room sets: the scanner silent, at field; you in the doorway, the cylinder in your arms. */
export const STAGED = {
  shell: 1, door: 1, line: 1, you: 1, spot: 0, reach: 0, carry: 1, bottle: 0, loose: 0, victim: 0, sky: 0,
  tesla: 1.5, seen: 0.3, spin: 0, power: 1, knock: 0, cover: 1, xray: 0, explode: 0, helium: 1, boil: 0, plume: 0, hot: 0, estop: 0, flap: 0, mstop: 0,
  litBore: 0, litGradients: 0, litMagnet: 0, litHelium: 0, litPipe: 0, litButtons: 0,
  mood: 1, gel: 0, fx: 0, fy: 108, fz: 60, fs: 320,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const suite = buildSuite();
  const system = buildSystem();
  const set = new THREE.Group(); // the room
  const mount = new THREE.Group(); // where the scanner stands in it: the origin
  set.add(suite.group, mount);
  const bench = makeBench(SIZE);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    suite, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? bench.group : mount;
      if (system.root.parent !== home) home.add(system.root);
      system.update({ bench: onBench ? 1 : 0, tesla: S.tesla, seen: S.seen, spin: S.spin, power: S.power, knock: S.knock, cover: S.cover, xray: S.xray, explode: S.explode, helium: S.helium, boil: S.boil, plume: S.plume, hot: S.hot, estop: S.estop, flap: S.flap, mstop: S.mstop, litBore: S.litBore, litGradients: S.litGradients, litMagnet: S.litMagnet, litHelium: S.litHelium, litPipe: S.litPipe, litButtons: S.litButtons }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        suite.update({ shell: S.shell, door: S.door, line: S.line, you: S.you, spot: S.spot, reach: S.reach, carry: S.carry, bottle: S.bottle, loose: S.loose, victim: S.victim, sky: S.sky, tesla: S.tesla }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0002;
    },
  };
}

export { ROOM, MAGNET, PIPE, BOX, YOU, BOTTLE, LINE, SYSTEM, TESLA };
