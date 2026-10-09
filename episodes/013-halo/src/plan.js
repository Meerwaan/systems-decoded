// DOSSIER 013 — Halo : the plan of the set. Centimetres, y up, the track is y = 0. No import here:
// model.js, f1.js, rail.js and world.js all read it — it is what lets them be built at the same time.
//
// THE FRAME IS THE CAR'S. A Formula 1 car at true scale, its nose toward +z, its survival cell around the
// origin: the cell never moves. It is the track and the steel barrier that come to the car (rail.js), from +z.
// You drive: your helmet is on the car's axis (x = 0). The barrier stands on the car's right (−x) and crosses
// its path at 29°. From the camera's usual side (−x / +z, az −20 … −70, where the key light falls) we stand
// BEHIND the barrier — on the side the car comes out of it — and see it come through, nose first, toward us.

/** The car (2020 Formula 1, simplified): bumpers, axles, wheels. */
export const CAR = { nose: 335, tail: -232, half: 100, front: 196, rear: -164, trackF: 83, trackR: 79, wheelR: 33.5, wheelWF: 30.5, wheelWR: 40.5 };

// THE SYSTEM (model.js): the survival cell, the halo bolted on it, and you in it — ONE rigid assembly, its
// root's origin on the track under the cockpit. On the bench the same assembly stands at SYSTEM.bench.
/** The survival cell, a carbon tub: from its rear bulkhead (the fuel cell is just ahead of it, behind your seat; the engine bolts on behind) to its front bulkhead (the nose cone bolts on ahead). */
export const CELL = { z0: -76, z1: 198, floor: 4, rim: 60, half: 30, halfFront: 16, topFront: 46, hoop: { z: -56, top: 96, half: 13 } };
/** The opening you sit in, and your helmet (the only solid thing of you: the rest of you is glass). */
export const COCKPIT = { z0: -30, z1: 46, half: 23 };
export const HELMET = { c: [0, 71, -4], r: 13.5 };
// The halo: a titanium tube, Ø ≈ 5. `ring`: its centre line on the +x side, from the top of the foot round to the
// rear mount (mirror it on −x). `foot`: the single pillar ahead of your eyes, from the cell's top up to the ring.
// `mounts`: where the two ends of the ring are bolted on the cell's shoulders, behind your head.
export const HALO = {
  r: 2.6,
  ring: [[0, 85, 52], [10, 86, 49], [20, 87, 40], [27, 88, 22], [29.5, 88, 0], [29, 85, -18], [28, 76, -30], [27.5, 66, -38]],
  foot: [[0, 57, 60], [0, 85, 52]],
  mounts: [[27.5, 64, -38], [-27.5, 64, -38]],
};
/** Where the system stands on the bench (the cell lying on the bench's floor, centred), and ≈ its radius there. */
export const SYSTEM = { bench: [0, -4, -61], size: 150 };

// THE REST OF THE CAR (f1.js), seen like an X-ray. Everything behind the cell's rear bulkhead — engine, gearbox,
// rear wheels, rear wing — is the REAR END: it tears off at the plane z = SPLIT.z (`split` 0 → 1).
export const SPLIT = { z: -76 };
/** The other car: only its front-left wheel, which comes against your right-rear wheel (`rival` 0 → 1). */
export const RIVAL = { touch: [-114, 33.5, -150] };

// THE BARRIER (rail.js): a triple steel guardrail — three corrugated beams on posts. `ahead` (metres) is how far
// it still stands from its final place, measured along the car's path: at `ahead` a its line passes through the
// point (0, ·, cross + 100·a) and runs along (sin 29°, 0, cos 29°):   x = (z − cross − 100·a) · tan 29°.
// The track side is x > that line (the car comes from there); the camera's usual side is the other one.
//   ahead = first (3.75)  the nose tip touches the beams
//   ahead ≈ 0.9           the barrier's line crosses the car's axis under the FRONT of the halo's ring, ahead of your helmet
//   ahead = 0             LODGED: the line crosses behind your head — the cockpit has gone through, the cell's rear (the fire) has not
// Untouched, the top beam spans y 77.5 → 108.5: your helmet (57.5 → 84.5) is in it. The halo's ring tops at 90.6.
export const RAIL = {
  angle: 29,
  cross: -40,
  first: 3.75,
  beams: [27, 60, 93], // the centre height of each beam
  beamH: 31, depth: 8, // a beam is 31 high, its corrugation 8 deep
  post: { every: 190, h: 112, w: 10 }, // the posts stand behind the beams, on the side away from the track
};
/** The fire: born at the cell's rear bulkhead (the fuel line torn off the tank), on the track side of the barrier. */
export const FIRE = { seat: [0, 50, -92], r: 260 };
/** Your way out (`out` 0 → 1): up from the seat, then over the bent top beam on your left, back to the track side. */
export const EXIT = { seat: [0, 62, 0], over: [36, 100, 24], down: [86, 0, 12] };
