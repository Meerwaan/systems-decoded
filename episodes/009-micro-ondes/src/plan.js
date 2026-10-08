// DOSSIER 009 — Micro-ondes : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// kitchen.js, model.js, waves.js and world.js all read it — it is what lets them be built at the same time.
//
// The kitchen's back wall is the plane z = 0; the room is on the +z side. A tall column unit stands against
// the wall and the oven is built into it at face height, its door facing +z. You stand in front of it,
// facing −z, your face ten centimetres from the glass. The camera mostly stands on the −x / +z side
// (az −20 … −70), where the key light falls.

/** The tall unit the oven is built into (60 cm wide), and the worktop that runs from it toward +x under wall units. */
export const COLUMN = { x0: -31, x1: 31, z0: 0, z1: 57, top: 222 };
export const WORKTOP = { x0: 31, x1: 260, y: 90, depth: 62, thick: 4 };

/** The oven's body (56 × 34 × 39). Its front is the plane z1: the door covers x0 … doorX1, the control panel doorX1 … x1. */
export const OVEN = { x0: -28, x1: 28, y0: 144, y1: 178, z0: 17, z1: 56, doorX1: 12, doorThick: 2.6 };
/** Where the door's centre is when it is closed — and where it stands on the bench (its centre). */
export const DOOR = { w: 40, h: 34, home: [-8, 161, 57.3], bench: [0, 21, 0] };
/** The cavity (36 × 26 × 34): five walls of metal, the sixth is the door. */
export const CAVITY = { x0: -26, x1: 10, y0: 147, y1: 173, z0: 21, z1: 55 };
export const TURNTABLE = { x: -8, y: 147.6, z: 38, r: 14 };
/** The perforated plate in the door (32 × 22), centre (−8, 161). True scale: holes of 1.5 mm, 2.5 mm apart, in a triangular pattern. */
export const WINDOW = { x0: -24, x1: 8, y0: 150, y1: 172 };
// The lattice: a hole at `origin` (the plate's centre), then every origin + i·pitch·(1, 0) + j·pitch·(0.5, √3/2), i and j whole numbers.
export const HOLES = { d: 0.15, pitch: 0.25, origin: [-8, 161] };
/** 2.45 GHz: one wave is 12.2 cm long — eighty times the hole. Visible light: 0.00005 cm, three thousand times smaller than the hole. */
export const WAVE = { length: 12.2 };
/** The door turns about this vertical line, outward (+z). Its handle is a bar near its free edge. */
export const HINGE = { x: -28, z: 56 };
export const HANDLE = { x: 8.5, y0: 150, y1: 172, out: 4.2 };
/** Two hooks on the door's free edge enter the body by `reach`; behind the front panel, the latch board and its three switches. */
export const HOOKS = { x: 11, y: [152, 170], reach: 2.4 };
export const LATCH = { x: 15, y: 161, z: 51, w: 5, h: 26, d: 9 };
/** Behind the control panel: the magnetron (its waveguide feeds the cavity's +x wall), and the fuse on its board. */
export const MAGNETRON = { x: 20, y: 163, z: 34 };
export const FUSE = { x: 21, y: 149, z: 46 };
/** You, on the first frame: standing in front of the door, your head's centre here — its front 10 cm from the glass. */
// `back`: how much further from the door (+z) your head is when you step back (`near` 0).
export const YOU = { x: -8, z: 79, head: 163, back: 45 };
