// DOSSIER 014 — ABS : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by street.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The STREET: a wet road in the rain, a car seen like an X-ray, a truck stopped ahead — and, solid in
// all that glass, the only things that matter: the front-left wheel and its brake, the toothed ring and its
// sensor, the ABS unit, the pedal under your foot. The frame is the car's: the road and the truck come to it.
// The BENCH: that same assembly — the system — alone on its pool of light. It is ONE object, re-parented.
// Three colours. signal is the threat: the truck, a wheel that locks and slides. veille is the system alive:
// the sensor's reading, the valves, the pump, a wheel that turns again. ink is everything else — the brake
// fluid your foot pushes included.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { SYSTEM, CAR, YOU, STEERING, HUB, TYRE, DISC, CALIPER, RING, PEDAL, MASTER, UNIT, LINES, LANE, TRUCK } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildStreet } from "./street.js";

export const SET = { BENCH: 0, STREET: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

// The first frame is the hook: low beside the front-left wheel, the rain, the truck's lights ahead — your foot
// has just gone down. (A starting point: the sets' builders refine it with `look`.)
// (The wheel and the truck only hold together between az −11 and −16.)
export const POSE0 = { tx: -84, ty: 34, tz: -150, d: 304.2, az: -9.09, el: -3.01, fov: 38, shift: 140, side: -60, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.STREET,
  /* ── the street: the road, the rain, the truck, the car's body, you (street.js) ── */
  shell: 1, //   the X-ray of the car's body and of the road: glass and fine lines (0–1)
  gap: 26, //    metres between your front bumper and the truck's rear (the road scrolls with it; it may go negative: the truck is passed)
  lane: 0, //    metres the car has moved to the LEFT of its lane (the road and the truck slide to the right): 0 → 3.5 the next lane
  yaw: 0, //     degrees the car's body has turned to the left
  steer: 0.5, //   the steering wheel in your hands and the front wheels: −1 full right … 1 full left
  dive: 0.2, //  the nose dipping under braking (0–1)
  rain: 1, //    the rain: streaks in the air, the wet road's reflections, the spray behind the wheels (0–1)
  truck: 1, //   the truck is there, its lights on (0–1: a fade)
  skid: 0, //    the look of locked wheels: the tyres plough the water, straight signal trails on the road (0–1)
  you: 1, //     0 nobody · 1 you at the wheel: a body of glass, hands on the wheel, right foot on the pedal
  kmh: 80, //    the car's speed: the header's big readout (and how fast the rain, the spray and the road go by)
  wkmh: 80, //   the front-left wheel's speed: the header's second readout
  rolled: 0, //  metres the wheels have ROLLED since the first frame: their rotation. Rolling, it grows as `gap` shrinks; locked, it stops
  /* ── the system (model.js) ── */
  brake: 1, //   your foot on the pedal (0–1): the pad goes down, the master cylinder pushes the fluid (a light that runs down the line)
  grip: 0.6, //  the pressure at the caliper: the pads clamp the disc (0–1); at 1 on a wet road the wheel locks
  lock: 0, //    the front-left wheel locked: it no longer turns, a signal trail under its tyre (0–1)
  inlet: 1, //   the inlet valve: 1 open (your foot reaches the brake) · 0 shut (the brake is isolated)
  outlet: 0, //  the outlet valve: 0 shut · 1 open (the caliper's pressure is let go)
  pump: 0, //    the return pump runs: it sends the fluid back toward your foot (0–1)
  pulse: 0, //   the pedal trembling under your foot (0–1)
  sense: 1, //   the sensor reading the toothed ring: veille pulses up its wire, as fast as the wheel turns (0–1)
  xray: 0, //    the tyre, the rim and the unit's block turn to glass: the disc, the ring, the valves and the pump show (0–1)
  explode: 0, // on the bench: 0 the assembly whole → 1 its parts apart, in a row across the camera
  litRing: 0, litSensor: 0, litEcu: 0, litValves: 0, litPump: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -80, fy: 40, fz: -145, fs: 90, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = HUB;
export const VIEW = {
  hook: POSE0,
  /* ── in the street ── */
  // the front-left wheel from outside · your foot on the pedal, through the glass · your hands on the wheel
  wheel: { ...P, tx: HX, ty: 38, tz: HZ, d: 190, az: -62, el: 8, shift: 150 },
  pedal: { ...P, tx: -33, ty: 48, tz: -64, d: 170, az: -104, el: 18, shift: 150 },
  hands: { ...P, tx: -37, ty: 100, tz: -20, d: 210, az: -58, el: 12, shift: 150 },
  // the car and the truck, from behind (it holds from gap 38 to 8; for the swerve, shift: 160) · from above (at gap 6 the truck's lights go under the header: use `chase` for the two together)
  chase: { ...P, tx: 0, ty: 43, tz: -1500, d: 3023, az: -4.57, el: 5.45, fov: 40, shift: 237, side: 200 },
  top: { ...P, tx: 0, ty: 0, tz: -230, d: 1500, az: -9.5, el: 37.5, fov: 50, shift: 230 },
  // locked wheels seen from the front left · the car in profile, wide, with its spray
  lockedFront: { ...P, tx: 0, ty: 30, tz: -150, d: 620, az: -140, el: 10, fov: 36, shift: 150 },
  sideWide: { ...P, tx: -80, ty: 40, tz: 250, d: 2450, az: -82, el: 5, fov: 36, shift: 150 },
  // the system in the car, everything else gone dark: act 2 cuts to the bench from it (it is `whole`, moved back by SYSTEM.bench)
  system: { ...P, tx: -65.7, ty: 40, tz: -116.7, d: 580, az: -42, el: 14, shift: 200, side: 60 },
  /* ── on the bench (the system stands at SYSTEM.bench: a point of the car at (x, z) is at (x + 56, z + 108) there) ── */
  // whole (best with xray 1, brake 1, sense 1) · exploded on TWO levels, a situation shot: the names are said on the close ones
  whole: { ...P, tx: -9.7, ty: 40, tz: -8.7, d: 580, az: -42, el: 14, shift: 200, side: 60 },
  exploded: { ...P, tx: 0, ty: 54, tz: 0, d: 800, az: -44, el: 14, shift: 230, side: 45 },
  // on the exploded view: the toothed ring and its sensor · the unit opened (computer lifted, valves out, pump down) · the caliper and its pads
  ringPart: { ...P, tx: 20.8, ty: 37, tz: 20.1, d: 200, az: -44, el: 12, shift: 170 },
  unitOpen: { ...P, tx: 10.1, ty: 80, tz: 9.7, d: 185, az: -44, el: 12, shift: 170 },
  caliperOpen: { ...P, tx: 56, ty: 43, tz: 54.1, d: 130, az: -44, el: 12, shift: 170 },
  // assembled: the unit, xray 1 — THE frame of the cycle · the brake from above (xray 1, grip 0 → 1) · the brake locked · the pedal
  unitPart: { ...P, tx: 6, ty: 61.5, tz: -19, d: 92, az: -30, el: 12, shift: 170 },
  brakeTop: { ...P, tx: -18, ty: 45, tz: -29, d: 120, az: -14, el: 38, shift: 170 },
  brakeLock: { ...P, tx: -24, ty: 38, tz: -37, d: 200, az: -58, el: 8, shift: 170 },
  pedalPart: { ...P, tx: 23, ty: 62, tz: 18, d: 210, az: -64, el: 10, shift: 170 },
};
/** What a cut to the bench sets, whatever came before: the system whole, at rest, nothing pressed. */
export const BENCHED = {
  shell: 0, you: 0, truck: 0, rain: 0, skid: 0, brake: 0, grip: 0, lock: 0, inlet: 1, outlet: 0, pump: 0, pulse: 0, sense: 0, xray: 0, explode: 0,
  litRing: 0, litSensor: 0, litEcu: 0, litValves: 0, litPump: 0, steer: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 36, fz: 0, fs: SIZE,
};
/** What a cut to the street sets: 80 km/h in the rain, the truck ahead, your foot not down yet. */
export const STAGED = {
  shell: 1, gap: 38, lane: 0, yaw: 0, steer: 0, dive: 0, rain: 1, truck: 1, skid: 0, you: 1, kmh: 80, wkmh: 80,
  rolled: 0, brake: 0, grip: 0, lock: 0, inlet: 1, outlet: 0, pump: 0, pulse: 0, sense: 1, xray: 0, explode: 0,
  litRing: 0, litSensor: 0, litEcu: 0, litValves: 0, litPump: 0, mood: 1, gel: 0, fx: -80, fy: 40, fz: -145, fs: 90,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const street = buildStreet();
  const system = buildSystem();
  const set = new THREE.Group(); // the street set, in the car's frame
  const mount = new THREE.Group(); // where the system stands in the car: the origin
  set.add(street.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench
  benchMount.position.set(...SYSTEM.bench);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    street, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      const b = onBench ? 1 : 0;
      system.update({ bench: b, shell: S.shell, steer: S.steer, dive: onBench ? 0 : S.dive, rolled: S.rolled, wkmh: S.wkmh, brake: S.brake, grip: S.grip, lock: S.lock, inlet: S.inlet, outlet: S.outlet, pump: S.pump, pulse: S.pulse, sense: S.sense, xray: S.xray, explode: S.explode, rain: onBench ? 0 : S.rain, kmh: S.kmh, litRing: S.litRing, litSensor: S.litSensor, litEcu: S.litEcu, litValves: S.litValves, litPump: S.litPump }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        street.update({ shell: S.shell, gap: S.gap, lane: S.lane, yaw: S.yaw, steer: S.steer, dive: S.dive, rain: S.rain, truck: S.truck, skid: S.skid, you: S.you, kmh: S.kmh, rolled: S.rolled, brake: S.brake, pulse: S.pulse }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.00016;
    },
  };
}

export { SYSTEM, CAR, YOU, STEERING, HUB, TYRE, DISC, CALIPER, RING, PEDAL, MASTER, UNIT, LINES, LANE, TRUCK };
