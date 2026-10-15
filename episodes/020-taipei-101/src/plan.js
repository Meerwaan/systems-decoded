// DOSSIER 020 — Taipei 101 : the plan of the set. Centimetres, y up. No import here:
// model.js, tour.js and world.js all read it — it is what lets them be built at the same time.
//
// TWO SCALES, ON PURPOSE.
//   THE SYSTEM (model.js) is at TRUE scale: a ball of 5.50 m, 41 plates of 12.5 cm, a bumper ring 150 cm away from
//   the pin. Only its cables are shortened (42 m in the tower: here the pendulum is 9.80 m long).
//   THE TOWER (tour.js) is a MODEL AT THE SCALE OF THE SUBJECT (CLAUDE.md, the 008 case): 142 m instead of 508, so
//   that the ball still shows inside it, and its sway is exaggerated so that it shows at all. NO length is ever
//   written on the tower; the voice gives the true orders of magnitude.
//
// The wind blows along +x. The camera mostly stands on the −x / +z side (az −20 … −70), where the key light falls:
// the tower leans to the right of the picture, the ball lags to the left.

/* ───────────── THE SYSTEM (model.js) ─────────────
   Its root's origin: the middle of the cage's floor, right under the ball at rest. */
/** The ball: 41 welded steel plates, stacked (their strata SHOW: it is the signature of this film). */
export const BALL = { r: 275, at: [0, 470, 0], plates: 41, plate: 12.5 };
/** The cradle under the ball, and the lugs on it where the cables end. */
export const CRADLE = { r: 200, y: 215, h: 40 };
/** The pin under the cradle: it travels inside the bumper ring. */
export const PIN = { r: 30, y0: 92, y1: 215 };
/** The bumper ring, around the pin: the pin touches it after `gap` cm — the 150 cm of the script, at true scale. */
export const RING = { y: 120, inner: 180, tube: 16, gap: 150, legs: 4 };
/** The eight dampers, in four pairs on the axes (0°, 90°, 180°, 270° ± `spread`): feet on the floor, heads on the cradle. */
export const DAMPERS = { n: 8, at: [0, 90, 180, 270], spread: 13, foot: 520, footY: 18, head: 205, headY: 232, body: 22, rod: 9 };
/** The 92 cables, drawn as 8 legs (4 mounts on the diagonals, 2 legs each: 4 legs of 12 strands + 4 of 11 = 92). */
export const CABLES = { n: 92, legs: 8, at: [45, 135, 225, 315], split: 20, mountR: 300, mountY: 1230, lugR: 300, lugY: 250, len: 980 };
/** What carries it (glass: it is a piece of the tower): the floor, four posts on the diagonals, the frame the cables hang from. */
export const FRAME = { floor: 620, post: 560, top: 1262 };
/** ≈ the radius of the system on the bench. */
export const SYSTEM = { size: 640 };
/** The course of the ball, in true centimetres: what the bumper allows, and the record (typhoon Soudelor, 8 August 2015). */
export const COURSE = { max: 150, record: 100, quake: 20 };

/* ───────────── THE TOWER (tour.js) — a model, not to scale ─────────────
   Its origin: the ground, under the tower's axis. From the ground up: a tapering base, eight modules that each
   flare out (what makes Taipei 101 recognisable), a crown, a spire. */
export const TOWER = {
  base: { h: 2400, half0: 1000, half1: 760 },
  modules: { n: 8, h: 1100, half0: 640, half1: 800 }, // from y = 2400 to y = 11200
  crown: { h: 1100, half: 540 }, //                      to y = 12300
  spire: { h: 1900 }, //                                 to y = 14200
  top: 14200,
};
/** Where the system stands in the tower (its root's origin): the cage spans the last module, floor to frame. */
export const CAGE = { at: [0, 9950, 0], h: 1262 };
/** How far the cage travels per unit of `bend` (exaggerated), and how the tower bends below it: u(y) = tip · (y / CAGE.at[1]) ^ pow. */
export const LEAN = { cage: 280, pow: 1.7 };
/** The viewing gallery around the ball (a ring of floor, in the cage's own space), and you on it, behind the glass. */
export const GALLERY = { y: 330, inner: 400, outer: 620 };
export const YOU = { at: [-520, 330, 150] }; // in the cage's space (add CAGE.at): between the façade (x ≈ −640) and the ball
/** The skeleton: eight mega-columns (two per face), the core, a belt of trusses at every module joint. */
export const BONES = { columns: 8, core: 300 };
/** The city at the foot of the tower: low blocks, out to `r`. */
export const CITY = { r: 9000, h: 500 };
