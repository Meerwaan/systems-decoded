// DOSSIER 011 — Fusible pyro : the plan of the set. Centimetres, y up, the road is y = 0. No import here:
// car.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// An electric car at true scale, seen like an X-ray, its nose toward −z, stopped against a wall: the film
// opens ON the crash. You drive (left-hand drive: your seat is on the −x side). The camera mostly stands
// on the −x / +z side (az −20 … −70), where the key light falls: it sees your door, the car's left flank.

/** The car: 4.7 m long, 1.85 m wide. `nose` and `tail` are its bumpers before the crash; the axles; the floor. */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146, belt: 96, floor: 31, front: -145, rear: 143, wheel: 34 };
/** The wall it hits: its face is the plane z = wall. On the first frame the bumper touches it. */
export const WALL = { z: -235, w: 520, h: 230, thick: 60 };
/** How far the nose gives way at `crush` 1 (the crash is frontal: everything ahead of the front axle folds). */
export const CRUSH = { depth: 62 };
/** You, at the wheel; and the one who comes to your door afterwards (standing outside, on the −x side). */
export const YOU = { x: -37, y: 62, z: 8, head: [-37, 118, 14] };
export const RESCUER = { x: -150, z: 20 };
export const DOOR_HANDLE = [-93, 92, 34];
export const WHEEL = { x: -37, y: 98, z: -34 }; // the steering wheel (its airbag); the passenger's bag bursts from the dashboard at x = +37
/** The traction battery: a flat slab under the floor, between the axles — four hundred volts. */
export const PACK = { x0: -72, x1: 72, y0: 15, y1: 29, z0: -112, z1: 112 };
/** The junction box on the pack (contactors, the pyro fuse): at its rear end, under the back seat. The busbar leaves the pack through it. */
export const BOX = { x0: -34, x1: 34, y0: 29, y1: 41, z0: 84, z1: 118 };
/** The pyro fuse, in the junction box: the centre of its housing. Its busbar runs along x. */
export const FUSE = { home: [10, 35, 101], bench: [0, 7, 0] };
/** The front drive unit (motor and inverter) between the front wheels, and the rear one. */
export const DRIVE = { front: [0, 44, -150], rear: [0, 40, 150] };
/** The orange cables: from the junction box forward along the tunnel to the front drive unit — point by point. */
export const CABLE = {
  front: [[14, 35, 86], [14, 33, 60], [10, 33, -40], [10, 36, -104], [6, 44, -132]],
  rear: [[-8, 35, 118], [-8, 38, 136]],
  // where the crash pinches the front cable against the body (bare copper on steel): the "what if"
  pinch: [10, 37, -110],
};
/** The airbag control unit, on the tunnel between the seats; its signal lines go to the two airbags and to the fuse. */
export const ECU = [0, 40, 20];
