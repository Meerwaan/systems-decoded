// DOSSIER 026 — Soyouz MS-10 : the plan of the set. Centimetres, y up. No import here: model.js, launcher.js,
// sky.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN IS YOU. The base of the descent module (the bottom of its heat shield, on the stack's axis) is the
// origin; the stack's axis is y, its nose up. Everything is placed around the module the story cares about, and
// the world comes to it (like 013, 014, 015): the sky, the horizon and the ground are drawn at infinity by
// sky.js from the altitude (`alt`); the rocket hangs under the head and, once torn away, falls away down its own
// axis (`apart`). Nothing ever travels 93 km: `alt` does.
//
// THE STACK TURNS ABOUT THE ORIGIN. `tilt` (degrees, + = the stack's top toward +x) turns the rocket — and the head
// while it is still on it — about the z axis through the origin (world.js). A camera that wants to SEE it turn
// stands near az 0 or ±180 (the turn is in its picture plane). After the abort the head straightens up as it
// leaves (world.js: its tilt fades out over the first metres of `apart`), the rocket goes on turning.
//
// Azimuth (kit/lib/stage.js, checked: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)):
// az 0 stands at +z looking toward −z; az −90 stands at −x (looking toward +x); ±180 at −z. el > 0 looks down,
// el < 0 looks up. The key light comes from −x, +y, +z: a camera between az −20 and −70 has it at its shoulder.
// Boosters, motors and sensors are placed with the SAME azimuth convention: (sin az, 0, cos az) · r.
//
// ONE SCALE, ILLUSTRATIVE AND NEVER SHOWN: the rocket and the spacecraft at about their true size (a Soyuz-FG is
// ≈ 50 m tall; the figures below are rounded, from public drawings — no length is ever written on screen). What
// does not fit a vertical frame is not modelled at scale: 50 and 93 km are `alt` (the horizon, the curve of the
// Earth, the counter of the header); the tower is flown a few hundred metres at most; the parachute is drawn
// smaller than it is (`sources` says so). The voice gives the true orders of magnitude.

export const DEG = Math.PI / 180;
/** A point at azimuth `az` (degrees, camera convention), radius `r`, height `y`. */
export const around = (az, r, y) => [Math.sin(az * DEG) * r, y, Math.cos(az * DEG) * r];

/* ───────────── THE SYSTEM (model.js): the escape head, the crew, the sensors ─────────────
   The ESCAPE HEAD is what the four motors tear off the rocket: the upper fairing (two halves, split along the
   plane x = 0), its nose, the four small solid motors at the top of it, the orbital module inside it and the
   descent module hanging under the orbital module. The service module stays with the rocket (launcher.js). */
/** The descent module (« ton vaisseau », with you in it): a bell, its heat shield at y 0, its hatch at the top. */
export const DM = { base: 0, top: 224, r: 108, neck: 46, shield: 16 };
/** The orbital module, above it (an egg with a short waist), and its docking probe on top. */
export const OM = { base: 228, top: 498, r: 112, probe: 532 };
/** The upper fairing, the part that leaves with you: a cylinder from `low` (the split from the skirt that stays,
 *  just under the descent module) to `shoulder`, then the ogive of the nose to `nose`. Two halves: x < 0, x > 0. */
export const FAIRING = { r: 150, low: -40, shoulder: 560, nose: 790, wall: 4 };
/** THE FOUR SMALL SOLID MOTORS (« quatre petits moteurs à poudre ») at the top of the fairing, just above its shoulder,
 *  each in its pod against the ogive, its nozzle canted out and down: their jets run down along the fairing.
 *  At the four azimuths of `az`: a camera at az −40 sees the one at −45 almost face on. */
export const MOTORS = { y: 615, r: 132, az: [-45, 45, 135, -135], len: 74, body: 17, exit: 15, cant: 28 };
/** The four lattice fins, folded flat against the bottom of the fairing (they are on the real one; never named). */
export const FINS = { y: 40, h: 150, w: 70, az: [0, 90, 180, -90] };
/** THE TOWER (« ta tour de sauvetage »): on the nose until it leaves — then it flies along `away` (unit-ish: mostly
 *  up, a little aside), `tower` metres, its own small jet behind it. It has always left before the failure. */
export const TOWER = { base: 790, top: 1360, r: 38, away: [0.3, 0.94, 0.16] };
/** Where the crew lie (Soyuz seats: on their backs, backs toward the heat shield, knees up, faces toward +y):
 *  three seats side by side along x; YOU in the left one (−x, the camera's side), YOUR CREWMATE in the middle one,
 *  the right one empty. `head`: where each head is; the console hangs above their faces. */
export const SEATS = { y: 34, x: [-60, 4, 66], len: 150, w: 52 };
export const YOU = { x: -60, head: [-60, 74, -52], chest: [-60, 86, -14], knees: [-60, 128, 40] };
export const MATE = { x: 4, head: [4, 74, -52], chest: [4, 86, -14], knees: [4, 128, 40] };
/** The console (« au pupitre »): above the two of you, tilted toward your faces; its АВАРИЯ lamp on its face. */
export const CONSOLE = { at: [-28, 168, -26], w: 92, h: 46, tilt: 52, lamp: [-40, 166, -14] };
/** THE SENSORS (« des capteurs… qui la sentent tourner »): two boxes on the rocket, one in the instrument bay at
 *  the top of the third stage, one at the top of the core — and their wires up to the head (the order). They are
 *  the system: solid, and they go with the ROCKET (world.js mounts them on it), not with the head. */
export const SENSORS = { at: [around(-35, 112, -395), around(-150, 128, -1235)], size: [26, 16, 20] };
/** ON THE BENCH the head stands where it stands in the scene (the cut to the bench matches in place: the origin is
 *  the origin); the floor is lowered under the glass section of rocket model.js draws there — from the service
 *  module down to a cut through the top of the core, under the second sensor. */
export const BENCH = { floor: -1290 };
/** ≈ the radius and the centre of what the light stands around: the whole bench column, the head alone. */
export const SYSTEM = { size: 1050, centre: [0, -260, 0] };
export const HEAD = { size: 430, centre: [0, 380, 0] };

/* ───────────── THE ROCKET (launcher.js), under the head, X-ray ───────────── */
/** The lower fairing that stays (around the service module) and the service module in it. */
export const SKIRT = { top: -40, bottom: -330, r: 150 };
export const SM = { top: -4, bottom: -230, r: 136 };
/** The third stage (Block I), the open lattice under it, the core (Block A) — widest at its top, narrower at its
 *  foot, where the boosters' noses lean on it. */
export const STAGE3 = { top: -330, bottom: -1000, r: 133 };
export const TRUSS = { top: -1000, bottom: -1150, r: 133 };
export const CORE = { top: -1150, bottom: -3850, r: 148, waist: -1900, foot: 104 };
/** THE FOUR BOOSTERS (Korolev's cross): long cones, their noses leaning on the core at `top`, their engines at
 *  `bottom`. Azimuths: B +z, V +x, G −z, D −x. D is THE ONE: it does not pull away, it swings into the core. */
export const BOOSTERS = { top: -1905, bottom: -3860, rTop: 34, rBottom: 134, out: 238, az: { B: 0, V: 90, G: 180, D: -90 } };
/** Where booster D's nose strikes the core (the light that has a place), and the part at its top, bent at the
 *  assembly (« une pièce faussée, au montage » — never said whether a sensor or a ball joint: just « a part »). */
export const IMPACT = [-146, -1905, 0];
export const FAULT = [-176, -1960, 0];
/** The engines' plumes, from the nozzle planes. */
export const ENGINES = { core: -3930, boosters: -3940 };

/* ───────────── THE WORLD (sky.js) ───────────── */
/** The Earth, for the limb seen from `alt` km (drawn at infinity: only the angle matters). */
export const EARTH = { R: 6371 };
/** On the pad at Baïkonour, the module's base stands ≈ 37 m above the deck: `alt` = PAD.alt km. The rocket hangs
 *  in its four support arms over the flame pit (launcher.js draws the pad, at the ground under the rocket). */
export const PAD = { alt: 0.037, deck: -3700, arms: -2300, pit: [1200, 2400] };
/** The parachute (« Un parachute »): drawn SMALLER than the real one (≈ 1 000 m²) so that the module still reads
 *  under it in a vertical frame — its canopy ≈ 9 m wide, its lines ≈ 12 m. The riser leaves from the top of the module. */
export const CHUTE = { riser: [0, 224, 0], lines: 1200, r: 450, depth: 260 };
/** The next file's teaser (027: the truck runaway ramp): far away at night, a road coming down a slope. */
export const TEASER = { az: 25, far: 380000, top: 9000, len: 160000 };
