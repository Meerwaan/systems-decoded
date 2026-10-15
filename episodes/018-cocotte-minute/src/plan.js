// DOSSIER 018 — Cocotte-minute : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// model.js, cuisine.js and world.js all read it — it is what lets them be built at the same time.
//
// THE KITCHEN (cuisine.js) is the one of 009 with the gas hob of 012 let into its worktop: back wall z = 0, the
// room on the +z side, the worktop's top face at y = 90, the hob's top at 90.8, its pan supports at 95.2. The
// pressure cooker stands on the HERO burner of that hob (front left), where 012 stood its saucepan — same
// radius as that saucepan, so the crown of flame of 012 licks its base as it is. The camera mostly stands on the
// −x / +z side (az −20 … −70), where the key light falls.

/** Where the cooker stands in the kitchen: the centre of its base, on the pan supports of the hero burner. */
export const HOME = [166, 95.2, 34];
/** The hero burner's knob (you push it down, `press`) and where you stand at the hob — read from 012's plan, repeated here for the cameras. */
export const KNOB = [163, 93.8, 50];
export const YOU = { x: 178, z: 86, head: 158 };
/** The hood's underside, above the hob: the steam of the valve rises toward it and is gone before it. */
export const HOOD = { y: 150 };

// THE SYSTEM (model.js): the pressure cooker. Its root's origin is the centre of its base; its axis is y.
// Angles (`at`, degrees) turn from +x toward +z: the camera at az −40 stands at 130°, at az −60 at 150°.
// What matters faces the camera: the safety valve in front of the working valve, the pin and its stop on the
// front right, the window of the lid on the left, the two handles away to the right.
const DEG = Math.PI / 180;
/** A point of the cooker from its angle, its radius and its height. */
export const polar = (at, r, y = 0) => [r * Math.cos(at * DEG), y, r * Math.sin(at * DEG)];

/** The vessel: a straight pot of 20 cm (≈ 4.5 L), a thick base under it. Inside: radius `r − wall`, floor at `base.h`. */
export const POT = { r: 10, wall: 0.3, h: 14.5, base: { r: 9.4, h: 0.9 }, rim: 10.5 };
// The lid, a bayonet: its skirt comes down over the vessel's rim, `LUGS.n` lugs of the lid pass between those of
// the rim and slide under them when the lid is turned by `turn` degrees (0: locked, the handles one over the
// other · `turn`: free, it lifts off). `top`: the height of its flat crown, radius `flat`; `shoulder`: its height
// where the dome meets the skirt.
export const LID = { r: 10.9, skirt: [13.3, 15.4], shoulder: 15.6, top: 17.4, flat: 3.2, turn: 30 };
export const LUGS = { n: 6, arc: 24 };
/** The seal: a ring lodged in the lid's skirt, squeezed on the vessel's rim. */
export const SEAL = { r: 10.15, y: 14.55, w: 0.85, h: 0.95 };
/** The window: a slot cut in the lid's skirt, on the left of the picture. When nothing else lets the steam out, the seal bulges through it and leaks — on purpose. */
export const WINDOW = { at: 190, arc: 24, h: 1.0 };
/** The two handles, one on the vessel, one on the lid above it (locked: one over the other). */
export const HANDLE = { at: -15, len: 15, w: 3.4, h: 1.9 };

// THE WORKING VALVE — the one that whistles: a chimney on the lid's axis, a weight standing on its hole.
// `at`: the foot of the chimney on the lid. The weight lifts by `lift` when the steam raises it, and comes
// right off (`off`) to be cleaned: it then hangs `away` above its seat.
export const VALVE = { at: [0, 17.4, 0], chimney: { r: 0.55, h: 2.2, hole: 0.22 }, weight: { r: 1.9, h: 2.8 }, lift: 0.45, away: 6 };
/** The safety valve: a small plug on the lid, in front of the working valve (camera side). It lifts by `lift` and lets the steam out all round. */
export const SAFETY = { at: polar(125, 5.9, 16.75), r: 0.95, h: 1.0, lift: 0.5 };
// The locking pin: a small piston through the lid, pushed up by the pressure (`travel`). Up, its head stands in
// the hole of the STOP — a tongue fixed to the vessel's rim that bends over the lid: the lid cannot turn. Down,
// it passes under the tongue. (A liberty, taken to be read in one frame: on a real cooker the pin blocks the
// latch of the lid's handle. To be said in `sources`.)
export const PIN = { at: polar(70, 8.6, 16.1), r: 0.42, travel: 0.95 };
export const STOP = { at: 70, r0: 7.7, r1: 11.3, y: 17.25, w: 2.2, thick: 0.35 };

/** What is inside. `fill` 0 → 1 is the level between the vessel's floor and its rim; `HALF`: the mark never to pass with what foams. */
export const INSIDE = { r: 9.7, floor: 0.9, top: 14.5, under: 16.9 };
export const HALF = 0.5;
/** The exploded view (the bench): the lid turns, then everything lifts off in ONE column — how far each part rises. (Kept short: at 7 / 15 / 20 / 26 the column was 49 cm for 22 wide, a thin thing in the frame.) */
export const APART = { seal: 4.5, lid: 9.5, pin: 12.5, safety: 14.5, weight: 17.5 };

/** ≈ the radius of the system on the bench. */
export const SYSTEM = { size: 17 };
/** The push under the lid at cooking pressure, as the State words it: « plus de 350 kg ». The header reads it. */
export const PUSH = 350;
