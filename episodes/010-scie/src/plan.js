// DOSSIER 010 — Scie sur table : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// shop.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// A cabinet saw seen like an X-ray. Its blade stands in the plane x = 0 and cuts along z: the board is fed
// from +z (where you stand, facing −z) toward −z. The blade's top runs TOWARD you: its teeth come down on
// the board at the front (+z), pass under the table toward the back, and rise again at the back (−z).
// Your left hand is on the −x side of the blade: the camera mostly stands on that side (−x / +z, az −20 … −70),
// where the key light falls — nothing between it and your hand.

/** The cast-iron top (its upper face is `y`), the cabinet under it, the insert plate round the blade. */
export const TABLE = { x0: -56, x1: 56, z0: -38, z1: 38, y: 87, thick: 4 };
export const CABINET = { x0: -28, x1: 28, z0: -30, z1: 30 };
export const THROAT = { x0: -5, x1: 5, z0: -19, z1: 19 };
/** The blade: 10 inches, 40 teeth, 4 000 rpm (the film never says nor shows the speed). 8 cm of it stand above the table (its full height), 5.3 above the board. */
export const BLADE = { x: 0, y: 82.3, z: 0, r: 12.7, kerf: 0.32, teeth: 40, rpm: 4000 };
/**
 * The arbor block carries the arbor, the blade and the cartridge. It pivots about a line along x through
 * `pivot`, behind the blade: when the block of aluminium stops the teeth, the blade's own momentum swings
 * the whole of it down by `drop` degrees — enough to take the blade entirely under the table.
 */
export const ARBOR = { pivot: [0, 79.1, -27], drop: 28 };
/**
 * The brake cartridge: a small closed box bolted to the arbor block, under the table, behind the blade and
 * below it. On its top, the block of aluminium faces the teeth `gap` away (2.5 mm), where they rise at the
 * back. Beside it in the box: the spring in its tube, held back by a wire 0.25 mm thick stretched between
 * two heavy conductors; under them, the electronics that listen to the blade.
 */
export const CARTRIDGE = { centre: [0, 71.1, -15], w: 4.6, h: 9.5, d: 12, gap: 0.25 };
/** The board being ripped: it rides against the fence (the fence's near face is x1). `lead0`: where its leading edge is (z) when `feed` = 0 — well past the blade: the cut is already long. */
export const BOARD = { x0: -14, x1: 16, thick: 2.7, length: 92, lead0: -40 };
export const FENCE = { x: 16, w: 7, h: 6.5 };
/** You stand here, facing −z, a little to the left of the blade's line; your left hand lies flat on the board, left of the blade. */
export const YOU = { x: -13, z: 78 };
/** Where your fingertip meets the teeth: at the front of the blade, just above the board. */
export const TOUCH = [-0.25, 90.5, 9.7];
/** On the bench: the blade standing, its centre here, and the cartridge at its own place under it (same offsets as in the saw). */
export const KIT = { blade: [0, 17, 0] };
