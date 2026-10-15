// DOSSIER 020 — Taipei 101 : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by tour.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The TOWER: Taipei 101 seen like an X-ray, in the typhoon — a model at the scale of the subject, its sway
// exaggerated — with you at the top behind the glass and, solid in all that glass, the ball in its cage. The BENCH:
// that same ball — the system: ball, cables, dampers, bumper ring — alone on its pool of light, opened.
// It is ONE object, re-parented: the cut from one to the other matches on it.
// Three colours. signal is the typhoon: the rain and the wind, the tower's momentum, the course that nears the
// bumper. veille is the system alive: the ball holding back, the cables pulling, the dampers braking. ink is the rest.
//
// THE SWAY IS ONE NUMBER: `swing`, counted in half-swings, that the acts move on the words (never a hidden clock).
//   the cage travels   tip    = LEAN.cage · bend · sin(π · swing)      (tour.js bends the tower to it)
//   the ball's course  course = −reach · cos(π · swing)                (true cm, relative to the tower)
// The ball is a quarter of a swing LATE on the tower — that lag is the whole film, and it is written here once: no act
// can get it wrong. On a whole value of `swing` the ball is at the end of its course (|course| = reach) and the tower
// crosses its axis at full speed; on a half value the tower is at the end of its lean and the ball crosses its rest.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { BALL, CRADLE, PIN, RING, DAMPERS, CABLES, FRAME, SYSTEM, COURSE, TOWER, CAGE, LEAN, GALLERY, YOU, BONES, CITY } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildTour } from "./tour.js";

export const SET = { BENCH: 0, TOWER: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

/** The cage's travel (cm, tower's model — exaggerated) and the ball's course in it (true cm), for a state. */
export const tipOf = (S) => LEAN.cage * S.bend * Math.sin(Math.PI * S.swing);
export const courseOf = (S) => -S.reach * Math.cos(Math.PI * S.swing);

const [CX, CY, CZ] = CAGE.at;
const HEART = CY + BALL.at[1]; // the ball's centre in the tower

// The first frame is the hook, taken from OUTSIDE the tower, level with the cage (the façade is glass): you behind the
// window, small, and behind you the ball, enormous, sliding in its cage; the rain flies level across the picture. The
// tower's top fills the frame and travels sideways from frame 1. (Act 1 tries four frames and gives the best one back.)
export const POSE0 = { tx: -330, ty: HEART + 10, tz: 80, d: 2100, az: -48, el: 2, fov: 34, shift: 170, side: 0, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.TOWER,
  /* ── the sway (both sets) ── */
  swing: 0.15, // the phase, in half-swings: the ONE number of the sway (see the header). Move it straight ("none"), ≈ one half-swing every 3 to 4 s in the storm
  bend: 1, //     how far the tower leans at the end of a swing (0 still · 1 the cage travels LEAN.cage · up to 3 in a very wide picture)
  reach: 30, //   how far the ball goes at the end of a swing, in TRUE centimetres (0–150): the header's big readout
  aboard: 0, //   the camera: 0 stands in the world (the tower travels in the picture) · 1 is aboard the cage (the cage holds still, the rain sways: the ball's course reads)
  /* ── the tower (tour.js) ── */
  shell: 1, //    the X-ray of the tower: façade, floors, the cage's own floors and the gallery (0–1)
  storm: 1, //    the typhoon, drawn: rain flying level, trails of wind — signal (0 a calm day · 1 its peak)
  city: 0.6, //   Taipei at the foot of the tower: low blocks of glass, a grid for the ground (0–1); only matters in a wide picture
  axis: 0, //     the tower's own axis at rest: a fine ink plumb line, and its ghost outline — what the lean is read against (0–1)
  bones: 0, //    the skeleton, solid in the glass: mega-columns, core, belts of trusses (0 unseen · 1 lit ink · 2 lit veille: it takes the load)
  quake: 0, //    the ground shakes: an earthquake (0–1) — fast and small, from the base up; nothing breaks
  you: 1, //      0 nobody · 1 you, a body of glass, on the gallery behind the window
  grip: 0, //     you: 0 standing · 1 bent, holding the rail (« le mal de mer »)
  /* ── the system (model.js) ── */
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart (frame up, cables fanned, dampers out, ring down)
  plates: 0, //   the ball's 41 plates: 0 welded → 1 apart, a stack of floating discs
  xray: 0, //     the ball and its cradle turn to glass where they stand (0–1): the pin, the ring, the dampers show through
  pull: 0, //     the cables pulling the tower back: a head of veille light climbing from the cradle to the mounts (0–1)
  brake: 0, //    the dampers at work: the stroke that moves glows veille, by its speed (0–1)
  heat: 0, //     what the dampers have swallowed: their cylinders warm, a haze rises off them (0–1) — the momentum become heat
  lock: 0, //     the dampers stiffen and hold the ball (an earthquake): 0 free · 1 bridled
  limit: 0, //    the bumper ring, drawn hot: signal on the side the pin nears, by how near (0 unseen · 1)
  datum: 0, //    the ball's rest: a fine ink cross and circle at the ring's centre — what the course is read against (0–1)
  litBall: 0, litCables: 0, litDampers: 0, litRing: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: CX, fy: HEART, fz: CZ, fs: 900, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  hook: POSE0,
  /* ── in the tower (world space: the cage at rest stands at CAGE.at) ── */
  // the whole tower in the storm, the city at its foot (bend 2–3, fs 8000)
  tower: { ...P, tx: 0, ty: 6900, tz: 0, d: 52000, az: -30, el: 2, fov: 36, shift: 180 },
  // the tower from its foot, looking up: 101 floors leaning over you (fs 6000)
  low: { ...P, tx: 0, ty: 6200, tz: 0, d: 10500, az: -28, el: -34, fov: 55, shift: 60 },
  // the top third: the last modules, the crown, the ball a point of veille in the glass (fs 3000)
  top: { ...P, tx: 0, ty: 9700, tz: 0, d: 9200, az: -32, el: 3, fov: 36, shift: 170 },
  // the cage whole: frame, cables, ball, dampers, you on the gallery (fs 900)
  cage: { ...P, tx: 0, ty: CY + 600, tz: 0, d: 4300, az: -36, el: 6, fov: 30, shift: 170 },
  // you at the window, the ball behind you
  you: { ...P, tx: YOU.at[0] + 120, ty: CY + YOU.at[1] + 110, tz: YOU.at[2] - 40, d: 1500, az: -64, el: 3, fov: 36, shift: 150 },
  // the pin in its ring, from above, through the ball turned to glass (xray 1, limit 1, datum 1, aboard 1)
  pin: { ...P, tx: 0, ty: CY + 150, tz: 0, d: 1900, az: -30, el: 38, shift: 140 },
  // the dampers, low, from three quarters (xray 0.6, aboard 1)
  dampers: { ...P, tx: 60, ty: CY + 150, tz: 120, d: 1700, az: -34, el: 8, shift: 150 },
  // the system alone, everything else gone dark: act 2 cuts to the bench from it (on the bench: the same pose less CAGE.at)
  system: { ...P, tx: 0, ty: CY + 600, tz: 0, d: 4700, az: -36, el: 8, shift: 170 },
  /* ── on the bench (the system's floor on the origin) ── */
  whole: { ...P, tx: 0, ty: 600, tz: 0, d: 4700, az: -36, el: 8, shift: 170 },
  // (the exploded view wants the light wide: fs 900)
  exploded: { ...P, tx: 0, ty: 700, tz: 0, d: 6400, az: -36, el: 10, shift: 190 },
  // the ball, its strata · the cables up to their mounts · the dampers · the ring and the pin
  ball: { ...P, tx: 0, ty: 470, tz: 0, d: 2300, az: -32, el: 6, shift: 160 },
  cables: { ...P, tx: 0, ty: 860, tz: 0, d: 2900, az: -40, el: -6, shift: 150 },
  dampersBench: { ...P, tx: 60, ty: 150, tz: 120, d: 1700, az: -34, el: 8, shift: 150 },
  ring: { ...P, tx: 0, ty: 130, tz: 0, d: 1500, az: -30, el: 24, shift: 150 },
  // the pendulum, almost square on: the swing reads at its widest (reach 60, datum 1)
  swing: { ...P, tx: 0, ty: 620, tz: 0, d: 4200, az: -14, el: 5, shift: 170 },
};
/** What a cut to the bench sets, whatever came before: the system whole, at rest, nothing lit. */
export const BENCHED = {
  swing: 0.5, bend: 0, reach: 0, aboard: 0,
  shell: 0, storm: 0, city: 0, axis: 0, bones: 0, quake: 0, you: 0, grip: 0,
  explode: 0, plates: 0, xray: 0, pull: 0, brake: 0, heat: 0, lock: 0, limit: 0, datum: 0,
  litBall: 0, litCables: 0, litDampers: 0, litRing: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 520, fz: 0, fs: SIZE,
};
/** What a cut to the tower sets: the typhoon, the tower swaying, the ball lagging in its cage, you at the window. */
export const STAGED = {
  swing: 0.15, bend: 1, reach: 30, aboard: 0,
  shell: 1, storm: 1, city: 0.6, axis: 0, bones: 0, quake: 0, you: 1, grip: 0,
  explode: 0, plates: 0, xray: 0, pull: 0, brake: 0, heat: 0, lock: 0, limit: 0, datum: 0,
  litBall: 0, litCables: 0, litDampers: 0, litRing: 0,
  mood: 1, gel: 0, fx: CX, fy: HEART, fz: CZ, fs: 900,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const tour = buildTour();
  const system = buildSystem();
  const bench = makeBench(SIZE);
  scene.add(tour.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    tour, system, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const phase = Math.PI * S.swing;
      const tip = onBench ? 0 : LEAN.cage * S.bend * Math.sin(phase); //  the cage's travel along x, cm
      const course = -S.reach * Math.cos(phase); //                       the ball's course along x in its cage, true cm
      const vel = (S.reach / COURSE.max) * Math.sin(phase); //            its speed, signed, 1 = the fastest a full course gives
      bench.group.visible = onBench;
      tour.group.visible = !onBench;
      const home = onBench ? bench.group : tour.mount; // tour.mount: the cage's floor — tour.js moves and tilts it with the lean
      if (system.root.parent !== home) home.add(system.root);
      system.update({ bench: onBench ? 1 : 0, course, vel, explode: S.explode, plates: S.plates, xray: S.xray, pull: S.pull, brake: S.brake, heat: S.heat, lock: S.lock, limit: S.limit, datum: S.datum, litBall: S.litBall, litCables: S.litCables, litDampers: S.litDampers, litRing: S.litRing }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        tour.update({ tip, shell: S.shell, storm: S.storm, city: S.city, axis: S.axis, bones: S.bones, quake: S.quake, you: S.you, grip: S.grip }, time, px);
      }
      // aboard, the light travels with the cage, like the camera (main.js: the director's `ride`)
      Object.assign(stage.focus, { x: S.fx + tip * S.aboard, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.45 / Math.max(30000, d * 2.4);
    },
  };
}

export { BALL, CRADLE, PIN, RING, DAMPERS, CABLES, FRAME, SYSTEM, COURSE, TOWER, CAGE, LEAN, GALLERY, YOU, BONES, CITY };
