// DOSSIER 033 — Porte d'avion : where everything stands. Centimetres, Y up. No import (the contract, read by every file).
//
// ONE FRAME FOR THE WHOLE FLIGHT: the frame of 023's A330 (023-eolienne-de-secours/src/plan.js), true scale — nose
// toward −x, up +y, its LEFT side toward +z, the fuselage's axis on y = 0 (radius 282). The plane stands still and
// the world comes to it (023: the sea under it at a depth that follows `alt`). L03's cabin at night
// (L03-evacuation-avion/src/cabine.js) is set INSIDE that plane, its door 1L on 023's door 1L: its own frame (floor
// y = 0, forward −x, LEFT wall +z, door 1L at x = 0 on that wall) is only moved by CABIN_AT, never turned.
//
// CAMERA AZIMUTH (kit/lib/stage.js, line 381: camera = target + d·(sin az · cos el, sin el, cos az · cos el)):
//   az 0 the camera stands on the +z side (LEFT flank, outside the door) looking toward −z · az −90 it stands ahead
//   (−x, the nose) · az +90 behind (+x, aft, down the aisle) · az ±180 on the −z side: INSIDE the cabin looking at
//   the door 1L. From inside the cabin, the door is filmed with az ≈ 130 → 170 (aft-inside → inside).
//   The key light comes from −x, +y, +z: it lights the door's OUTER face and the plane's left flank.
//
// THE SYSTEM, true scale: a type-A passenger door of 107 × 193 cm clear opening (L03's wide cabin, CAB.wide.door —
// 023 draws its 1L outline 106 × 188), a PLUG door: its panel is larger than the opening and rests FROM THE INSIDE on
// stops. Its own frame (model.js): origin at the middle of the sill, the panel in the local x-y plane, local +z
// OUTWARD (toward the night), local −z toward the cabin, local −x forward. In the plane it stands at DOOR_AT with
// no rotation (its +z is the plane's +z). On the bench it stands at the origin, turned BENCH_TURN about y (see
// world.js · benchPose): the cabin face then faces the key light.

/** The plane (023 · FUSE, DOORS[0]): door 1L's middle x, the cabin floor's height in the plane. */
export const PLANE = { r: 282, door1L: -2420, floor: -96 };

/** L03's cabin set in the plane: its origin (floor, centreline, at door 1L) → the plane's frame. `half`: its wall. */
export const CABIN_AT = [PLANE.door1L, PLANE.floor, 0];
export const CABIN = { half: 280, x0: 300, pitch: 81 }; // L03 · CAB.wide (w 560, first row 300 cm aft of the door)

/** The door, in the plane: the middle of its sill, on the left wall of the cabin (the model's origin there). */
export const DOOR_AT = [PLANE.door1L, PLANE.floor, CABIN.half];

/**
 * The plug door (model.js), local frame (origin: the middle of the sill; +z outward, −x forward):
 *   open    the clear opening in the fuselage frame (w × h)
 *   lap     how much the panel overhangs the opening on each vertical edge, and top and bottom: the stops live there
 *   t       the panel's thickness (its outer skin at z = 0, its inner lining at −t)
 *   stops   per vertical edge (forward and aft), evenly spread over the height (12 in all — 737-9 plug, NTSB; the
 *           A320's own count is not sourced: no number is ever said or written)
 *   hooks   locking hooks on a shaft along the AFT edge, catching pins in the frame
 *   handle  the inner handle: its pivot (x, y) on the lining, its length; it turns the hook shaft
 *   frame   the fuselage frame around the opening (door surround), its width and depth
 */
export const DOOR = {
  open: { w: 107, h: 193 },
  lap: 7,
  t: 14,
  stops: { perSide: 6, from: 22, to: 172, w: 6, h: 8, d: 5 },
  hooks: { n: 3, ys: [36, 96, 156], x: 49, r: 2.2 },
  handle: { at: [34, 150], len: 46, yaw: -30 }, // pivot; the lever hangs forward-down, its grip ≈ (11, 110)
  frame: { w: 16, d: 18 },
  window: { y: 141, w: 20, h: 28 }, // the door's porthole (what makes it read as an aircraft door in a third of a second)
  hinge: { x: -60, y: 96 }, // the hinge arm's root on the frame, forward edge (the opening swings OUT and forward)
};

/** The door's middle, local (for poses and the light): */
export const DOOR_MID = [0, DOOR.open.h / 2, 0];

/**
 * THE AIR (model.js draws it, world.js computes it from `alt`): arrows on both faces of the door, their number
 * proportional to the absolute pressure on that side (sea level = 1). Inside, those that outnumber the outside are
 * the ones that press the door outward: they turn veille. `reach`: how far into the cabin the « wall » goes (wall 1).
 */
export const AIR = {
  cruise: 11300, //  m, FL370 (sources: ≈ 11,3 km → « plus de dix kilomètres »)
  cabinMax: 2440, // m, cabin altitude at cruise: ≤ 8 000 ft (14 CFR 25.841)
  area: 1.5, //      m², the door (≈ 1,85 × 0,81, [S/O]) → ≈ 8 t at cruise, said « environ »
  approach: 200, //  m, Asiana OZ8124 (« environ deux cents mètres »)
  n: 36, //          arrows on one face at sea level
  reach: 650, //     cm into the cabin, wall 1
};

/** The bench: the door alone on its pool of light, sill on the origin. */
export const BENCH = { size: 120, turn: Math.PI };

/** People of glass (vol.js, @kit/figure.js): the neighbour standing at the door, you seated in the first row,
 *  window side (left block), the passenger of Korea seated by the door (on the crew's side). Plane frame. */
export const PEOPLE = {
  voisin: { at: [PLANE.door1L + 6, PLANE.floor, 208] }, //   facing +z, the handle in both hands
  you: { at: [PLANE.door1L + CABIN.x0, PLANE.floor, 232] }, // row 0, left window seat, facing −x
  seated: { at: [PLANE.door1L + 74, PLANE.floor, 222] }, //    facing −x then turned to the door: Korea
};

/** The recorder (034's bait): in the tail cone, then down into the dark, onto its halo far below. */
export const RECORDER = { at: [2700, 40, 0], size: [50, 18, 22], depth: 9000 };
