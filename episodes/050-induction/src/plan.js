// DOSSIER 050 — Plaque à induction : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// model.js (the hob), casserole.js (the saucepan), cuisine.js (the kitchen of 009 and you) and world.js all read it —
// it is what lets them be built at the same time.
//
// THE KITCHEN is 009's (episodes/009-micro-ondes/src/plan.js): its back wall is the plane z = 0, the room is on +z,
// the worktop's top face is y = 90 and runs x 31 … 260, z 0 … 62. Its glass hob is left out (`hob: false`): ours is let
// into the worktop where 012's gas hob stood (x 152 … 210). You stand in front of it, at +z, FACING −z — so YOUR LEFT
// IS −x: your left hand lies flat on the front-left zone, your right hand takes the saucepan's handle at front-right.
//
// THE HOB has its own frame, the one the system is built in (model.js): origin = the centre of the glass's TOP face,
// x to the right (as you stand), z toward you (front), y up. In the kitchen that origin is HOME; on the bench the
// hob's underside stands on the bench (world.js lifts it by BENCH_LIFT).
//
// THE CAMERA (kit/lib/stage.js: camera = target + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at +z (in
// the room, facing the wall), az −90 at −x (the left end of the run, looking +x), +90 at +x. The key light comes from
// −x, +y, +z: film from az −20 … −80. From the low left (az −60 … −80) the empty zone and your hand are in FRONT, the
// saucepan boils BEHIND them — the hook's order.
//
// True scale throughout: a 4-zone hob 59 × 52 cm, glass 4 mm, a 20 cm saucepan. Nothing in the film displays a size.

/** Where the hob's origin (centre of the glass's top face) stands in the kitchen. */
export const HOME = [181, 90.4, 31];
/** On the bench the hob's underside (y = −CASE.depth − GLASS.thick) stands on the bench's origin. */
export const BENCH_LIFT = 6;

/** The vitroceramic plate: black glass, 59 × 52, 4 mm, its top face is y = 0. Bevelled edge, a fine frame line. */
export const GLASS = { w: 59, d: 52, thick: 0.4, bevel: 0.15 };
/** The case under the glass (sheet metal, let into the worktop's cut-out): 56 × 49 × 5.6, its top under the glass. */
export const CASE = { w: 56, d: 49, depth: 5.6, wall: 0.1 };
/** The kitchen's worktop around it (009): top face y = 90 in the room, i.e. −0.4 in the hob's frame; 4 thick. */
export const WORKTOP = { y: -0.4, thick: 4 };

/** The four zones (centre in the hob's frame, radius of the drawn ring = radius of the coil). */
export const ZONES = {
  hand: { x: -14, z: 8, r: 9 }, //    FRONT-LEFT: ON, NO SAUCEPAN — your left hand lies flat on it. Its display blinks.
  pan: { x: 14, z: 8, r: 10.5 }, //   FRONT-RIGHT: THE HERO. The saucepan boils on it; its coil is drawn in full.
  backL: { x: -14, z: -13, r: 7.25 }, // off all film long
  backR: { x: 14, z: -13, r: 9 }, //     off all film long
};
/** The inductor of each zone: a flat spiral of copper strand under the glass, on a tray of ferrite bars, on its mica disc. */
export const COIL = { gap: 0.6, h: 0.5, turns: 18, inner: 0.22, ferrite: { n: 8, w: 1.2, h: 0.5, len: 0.75 }, tray: 0.25 };
// gap: from the glass's underside to the coil's top · inner: the empty centre, as a fraction of r · ferrite.len: fraction of r
/** The temperature point of a zone: a small pad under the glass at the coil's centre (drawn discreet: it may be a probe or an
 *  estimate depending on the model — never a thermometer, never a figure). */
export const SENSOR = { r: 0.9, h: 0.3 };

/** The front strip of controls, printed on the glass: one 7-segment display per zone, in front of it; a slider in the middle. */
export const STRIP = { z: 22, h: 3.2 };
export const DISPLAYS = {
  hand: { x: -14, z: 22, h: 2.4 }, // the digit « 9 » blinks: on, no saucepan
  pan: { x: 14, z: 22, h: 2.4 }, //  the digit « 9 » steady while it cooks · « H » once the saucepan is lifted and the glass is hot
  backL: { x: -5, z: 22, h: 1.8 },
  backR: { x: 5, z: 22, h: 1.8 },
};
export const SLIDER = { x0: -6, x1: 6, z: 24.2 }; // (between the back zones' displays and the front edge)

/** Under the coils: the power board (rectifier, inverter — two big capacitors, a heat sink and its transistors), the fan
 *  that cools it, the mains lead coming in at the back-left corner. Local positions, hob frame (all below y = −thick). */
export const BOARD = { x: 0, z: -2, y: -4.2, w: 40, d: 30, thick: 0.16, sink: { x: 6, z: 2, w: 12, d: 4, h: 2.2 }, caps: [[-12, -8], [-8, -8]], capR: 1.2, capH: 2.6 };
export const FAN = { x: -19, z: -14, y: -3.4, r: 3.6, h: 2.2, blades: 7 };
export const CORD = { from: [-26, -3.2, -24], to: [-15, -3.9, -12], out: [-26, -3.2, -40] }; // the lead leaves the case at the back

/** The saucepan (stainless, magnetic base): Ø 20 at the base, 11 high, a long handle toward your right hand (front-right). */
export const PAN = {
  r: 10, top: 10.6, h: 11, wall: 0.12, base: 0.5, // base: the capsule bottom (several layers, a magnetic one under)
  water: 8.2, //                                      the water's height inside, boiling
  handle: { dir: [0.71, 0, 0.71], len: 17, y: 9.2 }, // horizontal, from the rim toward front-right
  lift: 22, //                                        how high « tu soulèves » takes it (cm above the glass) at lift 1
};
/** The field and the currents: the field's loops rise from the coil through the glass into the base (no higher than ≈ 2 cm
 *  above the glass: the base takes it); the induced currents are rings in the base, concentric with the coil. */
export const FIELD = { loops: 10, reach: 2.2 };
export const EDDY = { rings: 5 };
/** The heat: in the base (signal, a warm tint — NEVER incandescent: a pan does not glow like a toaster's wire) and, by
 *  contact only, in the glass under it: a ring of the base's radius that stays when the saucepan is lifted. */
export const HEAT = { ring: 10 };

/** The exploded view (bench, `explode` 1): how high each layer rises (cm), from the case up — and the saucepan above all. */
export const EXPLODE = { case: 0, fan: 3.5, board: 7, coils: 13, glass: 19, pan: 30 };

/** You: standing at the hob, facing −z (world.js turns the figure). The hand poses, world coordinates. */
export const YOU = { x: 181, z: 78 };
const W = (z, dx = 0, dy = 0, dz = 0) => [HOME[0] + z.x + dx, HOME[1] + dy, HOME[2] + z.z + dz];
export const HAND = {
  flat: W(ZONES.hand, 0, 0.9, 1.5), //   your left palm flat on the empty zone (its centre a little in front of the zone's)
  over: W(ZONES.pan, 0, 3.0, 1.5), //    the same hand a finger's breadth above the zone where the saucepan was (« juste au-dessus »)
  away: [HOME[0] - 22, HOME[1] + 18, HOME[2] + 40], // withdrawn toward your body
};
/** A child's hand coming in over the front edge of the worktop, left of the hob (like): it stops on the worktop's edge. */
export const CHILD = { from: [HOME[0] - 34, HOME[1] - 6, HOME[2] + 42], to: [HOME[0] - 30, HOME[1] + 1.5, HOME[2] + 30] };
