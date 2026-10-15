// DOSSIER 019 — Prétensionneur : the plan of the set. Centimetres, y up, the road is y = 0. No import here:
// cabine.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// THE CABIN (cabine.js) is 011's car (episodes/011-fusible-pyro/src/car.js, its own plan.js): an X-ray at true
// scale, its nose toward −z, its bumper on a wall. The frame is the CAR's: the wall and the road come to it.
// You drive (left-hand drive: your seat is on the −x side), BELTED — and here the belt is solid: it is the subject.
// The camera stands on the −x side: az −60 … −75 from behind your door (where the key light falls: the pillar,
// the retractor in its foot), az −115 … −130 from ahead of it (your chest and the strap across it).

/** 011's car, for memory (do not change: it is that file's). `nose` is the bumper before the crash; CRUSH how far it folds. */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146, belt: 96, floor: 31, front: -145, rear: 143 };
export const WALL = { z: -235 };
export const CRUSH = { depth: 62 };
/** You, at the wheel (011's seat): your hips, your head, the middle of your chest; the steering wheel's hub. */
export const YOU = { x: -37, hips: [-37, 48, -17], head: [-37, 118, 14], chest: [-37, 92, 2], wheel: [-37, 98, -34] };

/**
 * THE BELT (cabine.js draws it from the ring down; model.js from the spool up to the ring):
 *   ring    the guide loop at the top of your door pillar — the strap comes up the pillar, turns in it, goes down over your LEFT shoulder
 *   buckle  by your right hip, on the tunnel side      anchor  the lap strap's end, at the foot of the pillar
 *   width   of the strap (011's)
 */
export const BELT = { ring: [-77, 113, 40], buckle: [-18, 46, -14], anchor: [-66, 42, -10], width: 4.8 };
/**
 * How far your chest travels forward at `lunge` 1, in cm — ILLUSTRATIVE, never written on screen (no length of
 * strap is published for a production car): `taut` with a tight strap, plus `slack` × its slack, plus `give` × what
 * the torsion bar lets out. With everything at 1 your head still stops well short of the wheel: nobody is hurt.
 */
export const TRAVEL = { taut: 9, slack: 9, give: 6 };
/** How far the loose strap stands off your chest at `slack` 1 (illustrative, exaggerated to read at 270 px). */
export const SLACK = { off: 6 };
/** The airbag control unit on the tunnel (011's), and the way its order takes to the retractor: under the seat, up the sill, into the pillar's foot. */
export const ECU = [0, 40, 20];
export const WIRE = [[0, 40, 20], [-22, 34, 26], [-60, 33, 34], [-78, 34, 40]];
/** The one on the back seat, behind you, who has not buckled up (the like). */
export const REAR = { hips: [-37, 50, 96], ring: [-78, 108, 128] };

// THE SYSTEM (model.js): the retractor, in its own frame — the origin is the middle of its base, the spool's axis
// runs along x, the strap leaves the spool on the +z side (the "front") and rises along +y.
//   −x end  the everyday lock: ratchet wheel, pawl, pendulum          +x end  the pretensioner: turbine, gas generator
/** ≈ the radius of the system on the bench (the retractor and its length of strap). */
export const SYSTEM = { size: 16 };
/**
 * Where it stands. In the car: `home`, in the foot of your door pillar, turned by `turn` degrees about y — its front
 * (the strap) faces the door (−x), its pretensioner end faces the tail (+z): from az −70 the camera sees both.
 * On the bench it stands on the origin, turned the same: a pose written in the car is the bench's, moved by −home.
 *   top       where its strap ends in the car, in ITS frame: the ring (BELT.ring seen from home)
 *   benchTop  where it ends on the bench, on a slim post with a guide loop
 */
export const RETRACTOR = { home: [-82, 34, 40], turn: -90, top: [0, 79, -5], benchTop: [0, 31, 1] };
/** Its pieces, in its frame. */
export const FRAME = { w: 7.4, h: 11, d: 7, wall: 0.35 }; //                    the steel U: two cheeks `w` apart, a back plate on the −z side
export const SPOOL = { y: 5.8, core: 1.5, full: 3.0, len: 5.6 }; //             its axis at `y`; `full`: its radius with the strap wound on it — the strap leaves at z = +full
export const BAR = { r: 0.55, len: 9.6 }; //                                    the torsion bar: inside the spool, along its axis
export const LOCK = { x: -5.2, wheel: 2.9, pendulum: [-5.2, 1.6, 0.6] }; //     the ratchet wheel on the −x end, and under it the pendulum in its cup
export const TURBINE = { x: 5.4, r: 2.7, thick: 1.2 }; //                       the turbine wheel in its case, on the +x end, on the spool's axis
export const CHARGE = { at: [5.4, 9.6, -1.2], r: 1.05, len: 4.2 }; //           the gas generator: a small cylinder lying along z above the turbine's case, its nozzle into it
/**
 * How much strap the spool takes back when the charge fires (`take`) and lets out again when the bar twists (`out`),
 * in cm — ILLUSTRATIVE (the sources say "a few centimetres"): never written on screen.
 */
export const REEL = { take: 8, out: 5 };
/** The strap's force when the bar gives way, in kg — the header's second readout tops out there (3 to 4 kN: IRCOBI, NHTSA). */
export const LIMIT = 400;
