// DOSSIER L02 — Poste haute tension : the plan of the sets. Centimetres, y up, the ground is y = 0. NO IMPORT here:
// poste.js, model.js, ligne.js and world.js all read it — it is what lets them be built at the same time.
//
// FOUR PLACES, one shown at a time (world.js · SET):
//   · POSTE  the 400 kV substation at night, seen like an X-ray. ONE row of bays side by side along z; inside a bay the
//            line runs along +x: arrival gantry (x 0) → line disconnector → breaker → bus disconnector → busbars.
//            YOUR bay is at z = 0, THE NEIGHBOUR's at z = −2 400: the double circuit arrives on the same last pylon,
//            outside the fence at −x, and splits onto the two bays. The camera stands on the +z side (az −20 … −70:
//            the key light falls from −x / +z), so the neighbour is always BEHIND your bay — it glows there.
//   · BENCH  the matt bench of the shorts: the hero breaker pole standing on it (its chamber opened), the pieces of 1956.
//   · LIGNE  a double-circuit 400 kV line in the country: pylons along +x, both circuits on the same towers; the
//            helicopter and its basket (July 2025); Virginia 1987 (night, the earths both sides of the work).
//   · MAP    France, as a map of points and lines (≈ 2 900 substations, ≈ 100 000 km of overhead lines).
//
// THE POSTE IS AT ITS TRUE SCALE where the eye can check it against a person (you: 1.8 m): gantry ≈ 18 m,
// apparatus ≈ 6–9 m, phases 6 m apart. The last pylon is lower than a real one (≈ 45 m) so that it still fits a
// frame with the gantry. No length of the model is ever shown on screen: the voice gives the orders of magnitude.

/** The bays, side by side along z (centres). MINE and VOISINE are the double circuit; the others are other lines. */
export const BAY = { w: 2400, z: [4800, 2400, 0, -2400, -4800, -7200], mine: 0, voisine: -2400 };
/** The three phases of a bay, as z offsets from the bay's centre: phase 1 is nearest the camera (+z). */
export const PH = [600, 0, -600];

/** The enclosure: the fence's rectangle, its height; the gate where you come in (you walk to the gantry from it). */
export const FENCE = { x0: -1300, x1: 6200, z0: -8600, z1: 6200, h: 250, gate: [5600, 0, 1800] };

/**
 * Along x, inside a bay (every bay has the same; plan.js gives the x, the heights are true for 400 kV, rounded):
 *   GANTRY  the arrival gantry: a lattice beam across ALL the bays at y = beam, legs at the bay borders
 *           (z = bay centre ± w/2), the line's strain strings hang under the beam, their ends at y = attach
 *   LSECT   the line disconnector (horizontal centre-break: two rotating columns `gap` apart, their arms meet in the middle)
 *   BREAKER the circuit breaker, one pole per phase (live tank: pedestal → support insulator → interrupting chamber)
 *   BSECT   the bus disconnector (same as LSECT)
 *   BUS     the two busbars, tubes along z at y = h, x0 and x1
 */
export const GANTRY = { x: 0, beam: 1800, depth: 160, attach: 1500, string: 300 };
export const LSECT = { x: 800, base: 250, column: 380, gap: 450, top: 650, arm: 225 };
export const BREAKER = { x: 1700, base: 250, column: 350, chamber: { y0: 600, y1: 900, r: 28 }, top: 900 };
export const BSECT = { x: 2600, base: 250, column: 380, gap: 450, top: 650, arm: 225 };
export const BUS = { x0: 3300, x1: 3700, h: 1100, r: 12 };

/**
 * The work: the dropper of each phase runs from the strain string's end (GANTRY.x, attach) down to the line
 * disconnector's near terminal (LSECT.x − gap/2, top). WORK.x is where the detector and the earth clamps meet it
 * (station side); WORK.lineX is the line side (just outside the gantry, on the span to the pylon) — the earths are
 * put on BOTH sides of where you work. `stand` is where you stand on the ground (in front of phase 1, +z side).
 * `climb`: the gantry leg you climb (your bay's +z leg), and where you work on the beam (above phase 1's string).
 */
export const WORK = { x: 300, lineX: -600, stand: [300, 0, 980], climb: { leg: [0, 0, 1130], top: [0, 1800, 600] } }; // the leg: one gantry per bay, its +z leg at z 1 130 (poste.js)
/** The earth terminal of each earthing set, on the ground (the mesh comes up there): station side, line side. */
export const EARTH = { a: [300, 0, 1250], b: [-600, 0, 1250] };
/** The insulating pole (perche) and what it carries: its length, the detector's head, the clamp. */
export const POLE = { len: 1050, head: 32, clamp: 26 };

/** The ground in section: the gravel layer (thickness), the soil, the earth mesh (depth, cell). Drawn under your bay. */
export const GROUND = { gravel: 15, mesh: 80, cell: 600, cut: { x0: -800, x1: 3200, z: 1500 } };

/**
 * The last pylon, outside the fence, carrying BOTH circuits (yours on its +z arms, the neighbour's on −z), and the
 * corridor of pylons that leaves the poste toward −x (to the horizon): the far fault of the incident happens on it.
 *   arms: the three crossarm heights (bottom → top), `reach` how far each arm reaches from the tower's axis (z)
 */
export const PYLON = { at: [-4200, 0, -1200], h: 4500, arms: [2800, 3400, 4000], reach: [900, 1050, 900], earthWire: 4500 };
export const CORRIDOR = { span: 30000, n: 6, sag: 600 }; // in the POSTE: spans leaving toward −x from PYLON.at

/** LIGNE — the line in the country (its own place): pylons along +x from x = 0, true heights; the sag at mid-span. */
export const LINE = { span: 40000, n: 5, h: 6000, arms: [3600, 4500, 5400], reach: [1000, 1200, 1000], earthWire: 6000, sag: 1300 };
/**
 * The helicopter and its basket (July 2025, Dunkerque–Arras): they work at mid-span of span 1 (x = LINE.span · 1.5),
 * on the neighbour-less circuit's top phase; the basket hangs `sling` under the helicopter, and docks on a spacer
 * (`spacer`: where along the span, from its first pylon). Spacers every `pitch` along each phase bundle.
 */
export const HELI = { x: 60000, sling: 1800, spacer: 20000, pitch: 6000, bundle: 45 };
/**
 * Virginia, 1987 (its own night, same corridor): the work between pylons 1 and 2; the earth sets on both towers
 * (`towers`: their x); the apprentice stands at the foot of the first one (`at`); his crew mate a few metres away.
 */
export const V87 = { towers: [40000, 80000], at: [40000, 0, 1600], mate: [40500, 0, 2100] };

/** BENCH — the hero breaker pole standing on the bench (its chamber at chamber height above the bench). */
export const BENCH = { at: [0, 0, 0], size: 300, old: [520, 0, -260] }; // `old`: where the 1956 six-chamber breaker stands

/** MAP — France drawn flat (x east, −z north), `w` across; the poste's point (`here`) somewhere in the north. */
export const MAP = { w: 20000, here: [2600, 0, -5200], dots: 2900, links: 4200 };
