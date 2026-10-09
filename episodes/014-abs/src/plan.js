// DOSSIER 014 — ABS : the plan of the set. Centimetres, y up, the road is y = 0. No import here:
// street.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// THE FRAME IS THE CAR'S (the same car as 011: 4.7 m long, 1.85 m wide, left-hand drive). Its nose points toward
// −z and it never moves: it is the wet road, its markings and the stopped truck that come to it (street.js).
// You drive: your seat is on the −x side. The camera mostly stands on the −x / +z side (az −20 … −70), where the
// key light falls: it sees the car's left flank, your door, the FRONT-LEFT WHEEL — the film's wheel — and, far
// ahead (−z), the truck.

/** The car: bumpers, axles, wheels. */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146, belt: 96, floor: 31, front: -145, rear: 143, wheel: 34, track: 80 };
/** You, at the wheel; the steering wheel's centre. */
export const YOU = { x: -37, y: 62, z: 8, head: [-37, 118, 14] };
export const STEERING = { x: -37, y: 98, z: -34 };

// THE SYSTEM (model.js): the brake of the front-left wheel and everything that stands between it and your foot —
// ONE rigid assembly, at its true places in the car (its root's origin is the car's: the road under the cabin).
// street.js draws the three other wheels, the body, you: NOT this wheel, NOT the pedal.
/** The front-left wheel: its centre, the tyre, the rim. It steers about the vertical through `HUB` (`steer`). */
export const HUB = [-80, 34, -145];
export const TYRE = { r: 34, w: 22, rim: 21.5 };
/** Behind the rim: the brake disc (on the hub, inboard of the spokes), its caliper (on the disc's rear top quarter), and, further inboard, the toothed ring the sensor reads. */
export const DISC = { r: 15.5, thick: 2.6, x: -74 };
export const CALIPER = { at: [-74, 45, -137], w: 8, h: 9, d: 13 };
export const RING = { r: 6.4, x: -66.5, teeth: 44, sensor: [-66.5, 42.4, -145] }; // the sensor's tip stands just above the teeth
/** The brake pedal: a lever hanging from its pivot, its pad under your RIGHT foot; pushed, the pad goes forward and down by `travel`. */
export const PEDAL = { pivot: [-33, 74, -76], pad: [-33, 46, -68], travel: 7 };
/**
 * Where the pedal's pad is, for a foot pressing it by `brake` (0–1) while it trembles by `pulse` (0–1): model.js
 * moves the pedal with it, street.js keeps your foot on it. Thirty beats a second — one whole beat per frame, so the shutter turns it into a steady blur — riding a slow swell one can follow. (Twelve beats a second jumped from frame to frame: qa counted fifty stray frames.)
 */
export const pedalPad = (brake, pulse, time) => {
  const k = brake * PEDAL.travel + pulse * (0.42 * Math.sin(time * 188.4956) + 0.2 * Math.sin(time * 21.99)); // 30 beats a second (one per frame: a steady blur, never a jump) on a slow 3.5 Hz swell
  return [PEDAL.pad[0], PEDAL.pad[1] - 0.45 * k, PEDAL.pad[2] - 0.9 * k];
};
/** On the bulkhead ahead of the pedal: the servo and the master cylinder (your foot's pressure is made here). */
export const MASTER = { servo: [-33, 76, -98], r: 12, cyl: [-33, 76, -114] };
/** The ABS unit, in the engine bay behind the front-left wheel arch: an aluminium valve block, its pump motor on one side, the computer on the other. */
export const UNIT = { at: [-50, 62, -128], w: 13, h: 11, d: 10 };
/** The brake fluid's way: master cylinder → unit, then unit → the hose that goes down to the caliper. Point by point. */
export const LINES = {
  feed: [[-33, 76, -120], [-33, 72, -126], [-44, 68, -128]],
  wheel: [[-56, 66, -128], [-62, 62, -132], [-68, 54, -136], [-72, 49, -137]],
  /** the sensor's wire, from the sensor up to the unit's computer */
  wire: [[-66.5, 43.6, -145], [-62, 52, -142], [-56, 60, -134], [-52, 64, -130]],
};
/** Where the system stands on the bench (centred, the tyre resting on the bench's floor), and ≈ its radius there. */
export const SYSTEM = { bench: [56, 0, 108], size: 62 };

// THE STREET (street.js). One number places the truck: `gap`, the metres between your front bumper and its rear.
// The road scrolls with it. `lane` (metres) is how far the car has moved to the LEFT (toward −x) of its lane.
/** The road: two lanes each way seen as a grid and its paint; your lane's centre is x = 0, the lane to your left is centred on −LANE.w. */
export const LANE = { w: 350 };
/** The truck: stopped in your lane, its rear face square to the road. Width, height of its box, the underrun bar. */
export const TRUCK = { half: 125, floor: 110, top: 390, bar: 55 };
