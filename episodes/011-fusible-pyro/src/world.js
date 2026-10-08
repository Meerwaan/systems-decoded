// DOSSIER 011 — Fusible pyro : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by car.js, pack.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ROAD: an electric car seen like an X-ray, its nose against a wall — the film opens ON the
// crash; you at the wheel, the airbags, and under the floor, solid, what matters: the battery, its junction
// box, the orange cables, the airbag control unit and its order. The BENCH: the pyro fuse alone on its pool
// of light. It is ONE fuse: model.js moves it to the bench (`bench` 1), the cut matches on it.
// Three colours: signal is the high voltage (the orange cables, the current, the body made live — the threat);
// veille is the system alive (the order, the charge, the fuse when it has cut); ink is everything else.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { CAR, WALL, PACK, BOX, FUSE, YOU, ECU } from "./plan.js";
import { buildCar } from "./car.js";
import { buildPack } from "./pack.js";
import { buildFuse } from "./model.js";

export const SET = { BENCH: 0, ROAD: 1 };
/** ≈ the radius of the fuse and its busbar on the bench: sizes the bench, its light, its shadows. */
export const SIZE = 9;

// The first frame is the hook: the car's nose folding against the wall, you thrown forward, seen from your
// side of the car. (A starting point: the sets' builders refine it with `look`.)
export const POSE0 = { tx: -34, ty: 82, tz: -108, d: 700, az: -64, el: 10, fov: 42, shift: 150, side: 0, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.ROAD,
  /* ── the road, the wall, the car, you, the airbags, the one who comes to help (car.js) ── */
  shell: 1, //   the X-ray of the car: its body of glass and fine lines, wheels, seats (0–1)
  wall: 1, //    the wall (0–1)
  you: 1, //     you, at the wheel (0 / 1)
  crush: 0.15, // the crash: 0 the bumper touches the wall → 1 the nose folded by CRUSH.depth, you thrown into your belt (the film opens ON it: 0.15)
  debris: 0.3, // what the crash throws: slow shards and dust, as long streaks (0–1)
  bags: 0, //    the two airbags: 0 folded away → 1 full
  rescuer: 0, // the one who comes to your door, outside (0 / 1)
  reach: 0, //   …his hand: 0 at his side → 1 on your door handle
  live: 0, //    WITHOUT the fuse: the body made live — a signal light creeping over the shell from where the cable is pinched, to the door handle (0–1)
  /* ── the battery, its junction box, the cables, the order (pack.js) ── */
  pack: 1, //    the traction battery under the floor: its modules, and the charge they keep (a signal glow inside them — it never goes out) (0–1)
  box: 1, //     the junction box's cover and what stands in it round the fuse (contactors, bars): 1 closed → 0 gone, the fuse seen in place
  hv: 1, //      the high voltage in the cables OUTSIDE the pack: dashes of signal light running in the orange cables, 1 alive → 0 dead
  cable: 0, //   the front cable where the crash pinches it: 0 whole → 1 crushed bare against the body (sparks while `hv` is up)
  ecu: 0, //     the airbag control unit making up its mind: 0 dark → 1 decided (lit veille)
  order: 0, //   its order on the wires: a head of veille light leaving the unit, 0 → 1 arrived at the two airbags AND at the fuse
  /* ── the pyro fuse (model.js) ── */
  flow: 1, //    the battery's whole current through the fuse's copper bar: wide dashes of signal light (0–1)
  lid: 1, //     the fuse's housing: 1 closed → 0 gone (the bar, the piston, the charge seen in place)
  fire: 0, //    the charge going off: a light that has a place, behind the piston (0–1.5)
  piston: 0, //  the piston's travel: 0 at rest → 1 through the bar
  broken: 0, //  the bar: 0 whole → 1 its middle punched out, pushed into the pit under it (NOT named "snap": that word is GSAP's own, a tween never moves it)
  arc: 0, //     the arc between the two stumps (0–1.5) — the acts light it and put it out
  explode: 0, // on the bench: 0 the fuse whole → 1 its parts apart (housing · copper bar · piston · charge)
  litCase: 0, litBar: 0, litPiston: 0, litCharge: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a veille light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -20, fy: 70, fz: -60, fs: 330, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  // close on the fuse in its junction box (state: box 0), under the back seat: act 2 cuts to the bench from it (benchCut, origin HOME)
  fuse: { ...P, tx: 10, ty: 35.3, tz: 101, d: 48, az: -40, el: 16, shift: 150 },
  // the fuse on the bench: whole (the calls to action play over it), opened into a column (charge · piston · bar · pit), each named part from close
  whole: { ...P, tx: 0, ty: 7, tz: 0, d: 62, az: -32, el: 18, shift: 160 },
  exploded: { ...P, tx: 0, ty: 10.8, tz: 0, d: 68, az: -38, el: 13, shift: 160 },
  barPart: { ...P, tx: 0, ty: 6.6, tz: 0, d: 52, az: -34, el: 17, shift: 160 },
  pistonPart: { ...P, tx: 0, ty: 8.6, tz: 0, d: 26, az: -30, el: 12, shift: 160 },
  chargePart: { ...P, tx: 0, ty: 10.6, tz: 0, d: 30, az: -28, el: 10, shift: 160 },
  // the firing, in section (lid 0), on the bench — in the car, the same poses moved by HOME · the cut from close
  section: { ...P, tx: 0, ty: 7.7, tz: 0, d: 36, az: -22, el: 11, shift: 160 },
  macro: { ...P, tx: 0, ty: 5.8, tz: 0.4, d: 21, az: -18, el: 12, shift: 160 },
  // the battery is the floor · the junction box closed, open (box 0), open seen as a column · the cables in a row (shell 0.6) · the pinch (crush 1, cable 1)
  pack: { ...P, tx: 0, ty: 30, tz: 36, d: 640, az: -36, el: 40, shift: 0 },
  box: { ...P, tx: 0, ty: 35, tz: 101, d: 210, az: -40, el: 32, shift: 0 },
  boxOpen: { ...P, tx: 9, ty: 34.5, tz: 101, d: 125, az: -44, el: 30, shift: 60 },
  cables: { ...P, tx: 8, ty: 34, tz: -15, d: 540, az: -24, el: 30, shift: 0 },
  pinch: { ...P, tx: 10, ty: 37.5, tz: -108, d: 76, az: -58, el: 30, shift: 40 },
  // the order leaving the control unit toward the bags AND the fuse (box 0, shell 0.7) · the unit from close · the battery alone still lit (hv 0, shell 0.5)
  order: { ...P, tx: -4, ty: 58, tz: 24, d: 720, az: -52, el: 28, shift: 0 },
  ecu: { ...P, tx: 0, ty: 41, tz: 20, d: 78, az: -40, el: 40, shift: 0 },
  alone: { ...P, tx: 0, ty: 30, tz: 10, d: 560, az: -48, el: 30, shift: 0 },
  // the crash in profile · the bonnet from close · the bags through your window · the whole car against the wall, from three quarters rear
  profile: { ...P, tx: -30, ty: 80, tz: -120, d: 800, az: -90, el: 5, fov: 42, shift: 150, drift: 0 },
  bonnet: { ...P, tx: -30, ty: 80, tz: -160, d: 330, az: -62, el: 24, fov: 40, shift: 150, drift: 0 },
  bags: { ...P, tx: -15, ty: 100, tz: -30, d: 300, az: -72, el: 10, fov: 40, shift: 150, drift: 0 },
  rear: { ...P, tx: -30, ty: 80, tz: -110, d: 700, az: -60, el: 10, fov: 46, shift: 150, drift: 0 },
  // the one at your door and the body made live (rescuer 1, reach 1, live) · the floor and the back seat from above
  door: { ...P, tx: -105, ty: 105, tz: 20, d: 560, az: -38, el: 8, fov: 40, shift: 150, drift: 0 },
  floor: { ...P, tx: 0, ty: 45, tz: 70, d: 520, az: -35, el: 40, fov: 40, shift: 150, drift: 0 },
  wide: POSE0,
};
/** Where the fuse stands in the car, counted from where it stands on the bench (benchCut's origin). */
export const HOME = [FUSE.home[0] - FUSE.bench[0], FUSE.home[1] - FUSE.bench[1], FUSE.home[2] - FUSE.bench[2]];
/** What a cut to the bench sets, whatever came before: the fuse whole, nothing fired. */
export const BENCHED = { flow: 0, lid: 1, fire: 0, piston: 0, broken: 0, arc: 0, explode: 0, litCase: 0, litBar: 0, litPiston: 0, litCharge: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: FUSE.bench[0], fy: FUSE.bench[1], fz: FUSE.bench[2], fs: SIZE };
/** What a cut to the road sets: the instant of the crash (T+0) — the bumper on the wall, nothing fired yet, the car alive. */
export const STAGED = {
  shell: 1, wall: 1, you: 1, crush: 0, debris: 0, bags: 0, rescuer: 0, reach: 0, live: 0, pack: 1, box: 1, hv: 1, cable: 0, ecu: 0, order: 0,
  flow: 1, lid: 1, fire: 0, piston: 0, broken: 0, arc: 0, explode: 0, litCase: 0, litBar: 0, litPiston: 0, litCharge: 0, mood: 1, gel: 0, fx: -20, fy: 70, fz: -60, fs: 330,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const car = buildCar();
  const pack = buildPack();
  const fuse = buildFuse();
  const set = new THREE.Group(); // the road set
  set.add(car.group, pack.group, fuse.group);
  const bench = makeBench(SIZE);
  bench.group.add(fuse.benchGroup);
  scene.add(set, bench.group);
  stage.grade.gel.set(0x5cffb0);

  return {
    car, pack, fuse, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      fuse.update({ bench: onBench ? 1 : 0, flow: S.flow, lid: S.lid, fire: S.fire, piston: S.piston, snap: S.broken, arc: S.arc, explode: S.explode, litCase: S.litCase, litBar: S.litBar, litPiston: S.litPiston, litCharge: S.litCharge }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        car.update({ shell: S.shell, wall: S.wall, you: S.you, crush: S.crush, debris: S.debris, bags: S.bags, rescuer: S.rescuer, reach: S.reach, live: S.live }, time, px);
        pack.update({ pack: S.pack, box: S.box, hv: S.hv, cable: S.cable, ecu: S.ecu, order: S.order, crush: S.crush, shell: S.shell }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.00022;
    },
  };
}

export { CAR, WALL, PACK, BOX, FUSE, YOU, ECU };
