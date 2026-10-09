// DOSSIER 016 — Disjoncteur : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// wall.js, model.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ROOM (wall.js), like 004's: the wall is the plane z = 0, the room is on the +z side. Inside the wall, the
// wire of one circuit runs from the consumer unit to a socket; on that socket, a power strip, a kettle and a fan
// heater; you, standing by them. The consumer unit hangs on the wall to the left (−x). The film looks at the wall
// from the room's side AND from behind it (through it: it is an X-ray) — the wire in the wall is the first frame.

/** The wall and the room. */
export const WALL = { x0: -260, x1: 210, h: 250, thick: 10 };
/** The consumer unit: a box on the wall, its row of devices on a rail at `rowY`; a module is 1.8 cm wide. */
export const BOARD = { at: [-180, 165, 0], w: 36, h: 30, d: 9, rowY: 165, front: 7 };
export const MODULE = { w: 1.8, h: 8.5, d: 7 };
/**
 * The row, slot by slot from the left (x of a slot's centre = ROW.x0 + slot × MODULE.w): the differential switch
 * takes slots 0–1 (two modules wide — "son voisin"), THE FILM'S BREAKER — the system, model.js — is slot 2,
 * wall.js draws the breakers of slots 3 … 8, NOT slot 2.
 */
export const ROW = { x0: -187.2, diff: [0, 1], hero: 2, last: 8 };
/** Where the film's breaker stands in the room: the middle of its base (its back against the rail, its face toward +z). */
export const HOME = [ROW.x0 + ROW.hero * MODULE.w, BOARD.rowY - MODULE.h / 2, 0.5];

/** The socket, low on the wall; the power strip on the floor; what is plugged in; you. */
export const SOCKET = { at: [120, 30, 0] };
export const STRIP = { at: [118, 3, 34], len: 26 };
export const KETTLE = { at: [158, 92, 40], r: 8, h: 22, table: 90 }; // on a low sideboard, 90 cm high
export const HEATER = { at: [60, 0, 62], w: 26, h: 42, d: 14 };
export const YOU = { x: 112, y: 0, z: 92, head: [112, 162, 92] };
/**
 * The circuit's wire inside the wall (the phase: the one the film follows), point by point, from the breaker's
 * lower terminal to the socket. Its neutral runs 1.6 cm beside it. `FAULT`: the place on that run where the
 * insulation cooks — and where, in the short circuit, the two wires touch.
 */
export const WIRE = [[HOME[0], BOARD.rowY - 6, -3], [HOME[0], 228, -3], [120, 228, -3], [120, 34, -3]];
export const FAULT = [120, 132, -3];

// THE SYSTEM (model.js): one modular breaker, at its true size — 1.8 cm wide (x), 8.5 high (y), 7 deep (z); its
// root's origin is the middle of its base; its back (−z) is on the rail, its face and its handle toward +z; the
// feed comes in by its upper terminal, the circuit leaves by the lower one. Its works lie in the y–z plane: they
// are seen from the side — the half-shell on the −x side is the one that comes off.
/** ≈ the radius of the system on the bench. */
export const SYSTEM = { size: 7 };
/** The current, as the film shows it: `load` is the current over the rating (16 A). 18 A is 1.125, 23.2 A is 1.45; a short circuit is drawn at 3. */
export const RATING = 16;
