// DOSSIER 023 — Éolienne de secours : the plan of the set. Centimetres, y up. No import here:
// model.js, avion.js and world.js all read it — it is what lets them be built at the same time.
//
// TWO SCALES, ON PURPOSE.
//   THE PLANE (avion.js) and THE SYSTEM (model.js) are at TRUE scale: an A330-200 of 58.8 m, 60.3 m of span, a
//   fuselage of 5.64 m. The RAT's own sizes (arm, propeller, pump) are ILLUSTRATIVE: the A330's were not found —
//   nothing of them is ever written on screen.
//   THE WORLD AROUND (the sea, the island, its runway) is a MODEL AT THE SCALE OF THE SUBJECT (CLAUDE.md, the 008
//   case): 10 km of altitude are drawn 300 m, 120 km of glide 800 m. NO length is ever written on it.
//
// THE PLANE'S FRAME: the plane stands still at the origin and the world comes to it (011, 013, 014): the camera
// poses stay true all film long. Its NOSE points to −x, up is +y; its LEFT side faces +z — the camera's side
// (az −20 … −70 stands at −x / +z: front-left three quarters, where the key light falls). So the LEFT engine
// (+z, « moteur 1 », the SECOND to die, 06:26) is the near one; the RIGHT engine (−z, the one that leaked, dead
// at 06:13) is the far one, seen through the glass.

/* ───────────── THE PLANE (avion.js) — true scale ───────────── */
/** The fuselage: a tube along x, the nose at −x. Its axis is y = 0. */
export const FUSE = { len: 5880, r: 282, nose: -2900, tail: 2980, cockpit: -2550 };
/** The wings: low on the fuselage, swept back (toward +x), with their fuel tanks (solid in the glass). */
export const WING = { span: 6030, root: 1050, tip: 270, sweep: 30, y: -150, x: -150, dihedral: 5 };
/** The two engines under the wings: L = +z (near, dies at 06:26), R = −z (far, leaked, dies at 06:13). */
export const ENGINES = { z: 960, x: -360, y: -335, r: 150, len: 520 };
/** The tail: fin and stabiliser, at the back (+x). */
export const TAIL = { x: 2350, fin: 880, stab: 1940 };
/** The control surfaces the green circuit moves: ailerons (outer wings), elevators, rudder. */
export const SURFACES = { aileron: [2000, 2800], elevator: 900, rudder: 700 };
/** The landing gear: the mains under the wing roots, the nose gear forward; `h` the drop below the belly. */
export const GEAR = { main: [80, 530], nose: -2250, h: 300 };
/** The RAT's bay (where the system's root stands, in the plane): the belly, forward of the wing, camera side. */
export const BAY = { at: [-850, -268, 95] };
/** You: a passenger at a left-side window (+z), seated, facing the nose. */
export const YOU = { at: [-1500, -40, 215] };
/** The cabin: 306 people — rows of seats from `from` to `to` (x), drawn as small glass heads when `pax` > 0. */
export const CABIN = { from: -2250, to: 2050, rows: 38 };
/** The three hydraulic circuits: three lines along the belly, out to the wings and the tail. One of them — `HYD.live`,
 *  the one the RAT feeds (the « green » circuit; NEVER coloured green: ink when alive, signal when dead, veille when
 *  the RAT brings it back) — starts at the BAY. */
export const HYD = { n: 3, live: 1, gap: 22, y: -230 };

/* ───────────── THE SYSTEM (model.js) — illustrative sizes, never displayed ─────────────
   Its root's origin: the arm's hinge, inside the bay, just above the door. Stowed, everything lies inside the belly
   (y > −12); extended, the arm hangs down out of the door, the propeller faces the wind (its axis along −x: the air
   comes from the nose). */
/** The bay above the door, and the door in the belly skin (it opens downward, hinged on its +z edge). */
export const DOOR = { len: 226, w: 76, y: -12, bay: 62 };
/** The arm: from the hinge, stowed along +x (folded back), it swings DOWN through `travel` degrees. */
export const ARM = { len: 150, r: 8, travel: 100 };
/** The spring actuator: from the bay's roof to the arm's middle; it lengthens as the arm goes out. */
export const SPRING = { from: [112, 52, 0], at: 0.5, r: 6 };
/** The propeller at the arm's end: two blades, its axis along x, facing −x (the wind). */
export const PROP = { r: 55, blades: 2, hub: 12 };
/** Behind the propeller (aft, +x), in the pod: the pump. */
export const PUMP = { len: 34, r: 13 };
/** The three lines leaving the pump's side of the bay (in the system they are short stubs; avion.js carries them on). */
export const LINES = { len: 180, r: 2.6 };
/** ≈ the radius of the system on the bench. */
export const SYSTEM = { size: 160 };
/** On the bench the root stands this high, held by two glass posts (a piece of belly skin on a museum mount). */
export const BENCHAT = [0, 230, 0];

/* ───────────── THE WORLD AROUND (avion.js) — a model, not to scale ───────────── */
/** Altitude: `alt` (true metres, the header's readout) is drawn `depth` cm below at cruise, proportionally. */
export const ALT = { cruise: 10500, depth: 30000 };
/** The island and its runway: the threshold stands `far` cm ahead (−x) when `ahead` is 1, under the wheels at 0;
 *  the runway runs on toward −x for `len`; the island's top stands `h` above the sea. */
export const ISLAND = { far: 80000, len: 26000, w: 4500, h: 1500, r: 16000 };
/** The sea and the sky: a dome around the plane. */
export const SKY = { dome: 85000 };
