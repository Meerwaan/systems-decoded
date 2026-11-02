// DOSSIER 032 — Barre anti-panique : the plan of the set. Centimetres, y up, the hall's floor is y = 0. No import here:
// model.js, salle.js and world.js all read it — it is what lets them be built at the same time.
//
// THE FRAME. The ORIGIN is on the floor, at the middle of the emergency door's threshold, in the wall's plane (z = 0).
//   +z  the HALL: the crowd, you, the bar (on the leaf's room face) — and, in 1883, the stairs
//   −z  OUTSIDE: where the exit leads (the light when the door opens)
//   −x  the LATCH side of the door: the box (boîtier), the bolt (pêne), the strike (gâche) on the frame
//   +x  the HINGE side
// Azimuth (kit/lib/stage.js, line 381: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)):
//   az 0 stands in the HALL (+z) facing the door · −90 at −x, the LATCH side, looking along the wall toward +x
//   (the hall on the right of the picture, outside on the left) · ±180 OUTSIDE (−z), facing the door through it.
// The key light comes from −x, +y, +z: a camera between az −20 and −70 has it at its shoulder and sees the latch
// side first — the box and the strike nearest to it.
//
// ONE SCALE, the true one for the door, the hall, the figures and the stairs; the panic device's parts are a little
// thicker than life so that they read (a bar of 4 cm, a bolt throw of 3 cm), never measured on screen. The stairs of
// 1883 are a RECONSTRUCTION (no plan of Victoria Hall is used: `sources` says so). No length is ever written.
//
// THE DOOR SWINGS. Today it opens OUTWARD (toward −z, the hinge axis on its outside face); in 1883 the same door, at
// the same place, opens INWARD (toward +z, toward the stairs, the hinge axis on its room face) — « elle s'ouvrait vers
// l'intérieur, contre la foule ». salle.js owns the leaf and its hinge: A.leaf (salle.js) is a group in which anything
// placed at its CLOSED-door coordinates of this file moves with the leaf. The system (model.js) is written in those
// closed-door coordinates: world.js hangs its `root` on A.leaf and its `fixed` part (the strike) on A.frame.

/* ───────────── THE HALL (salle.js) ───────────── */
/** The wall the door is in: its thickness straddles z = 0; it runs along x, as high as the hall. */
export const WALL = { thick: 20, h: 420, x0: -950, x1: 950 };
/** The hall in front of it (+z): its depth, its side walls at ±HALL.half, its ceiling (X-ray: lines, a grid floor). */
export const HALL = { depth: 1400, half: 950, h: 420 };
/** The door: the leaf (w × h × t, its centre plane at z = 0 when shut), the frame (dormant) around it, `hinge` the
 *  side of its hinges (+x). `swing` 1 = 95° open. */
export const DOOR = { w: 100, h: 210, t: 5, frame: 8, frameDepth: 14, hingeX: 50, latchX: -50, open: 95 };
/** The exit sign (pictogram, no text) above the door, on the room face of the wall: its centre and size. */
export const SIGN = { at: [0, 248, WALL.thick / 2 + 1], w: 44, h: 22 };
/** Outside: the light the open door lets in — a pool on the ground beyond the threshold (ink, cold). */
export const OUTSIDE = { at: [0, 0, -260], r: 260 };

/* ───────────── YOU AND THE CROWD (salle.js · @kit/figure.js) ───────────── */
/** You: standing against the door, facing it (the figure looks toward −z: rotation π), your chest on the leaf, your
 *  hip on the bar — slightly to the hinge side of the box, so that the box stays seen beside your hip. */
export const YOU = { at: [8, 0, 26], face: Math.PI, lean: 12 };
/** The crowd of today, in the hall: rows from `front` (just behind you) to `back`, as wide as `half` at the back,
 *  narrowing to the door (a funnel); `count` figures of glass (the front ones posed, the far ones simpler). */
export const CROWD = { front: 46, back: 900, half: 520, count: 46 };

/* ───────────── 1883 (salle.js, era 1) — a reconstruction ───────────── */
/** The stairs of 1883: they come DOWN toward the door from the hall's side (+z): a short landing at the door
 *  (0 → `landing`), then `steps` steps of `run` × `rise` up to the top landing, between two walls `half` apart. */
export const STAIR = { landing: 70, steps: 16, run: 30, rise: 18, half: 75, wall: 12 };
/** The door of 1883, held AJAR inward by a bolt: the angle it is held at, the bolt's place on the floor (under the
 *  leaf's free edge, x of the latch side, at the angle) — the gap it leaves lets one child through at a time. */
export const AJAR = { deg: 24, child: 0.72 };

/* ───────────── THE SYSTEM (model.js) — on the leaf's ROOM face, closed-door coordinates ───────────── */
/** The leaf's room face. */
export const FACE = DOOR.t / 2;
/** The push bar (barre-levier): a tube from the box's end to the hinge side — 72 % of the leaf's width, « plus de la
 *  moitié de la porte » — at hip height, `out` in front of the face at rest; pushed, it travels `stroke` toward the
 *  face (and a little down) on its two arms. */
export const BAR = { x0: -30, x1: 42, y: 96, out: 11, r: 2, stroke: 4.5 };
/** Its two arms (the lever): one in the box, one on the pivot bracket at the hinge end. Each pivots at `pivotOut`
 *  from the face, `len` long. */
export const ARM = { xs: [-27, 40], len: 9, pivotOut: 4 };
/** The pivot bracket at the hinge end (on the face). */
export const BRACKET = { at: [40, 96, FACE + 2.5], size: [6, 12, 5] };
/** The box (boîtier) at the latch end: surface-mounted on the face. */
export const BOX = { at: [-38, 96, FACE + 3.5], size: [20, 10, 7] };
/** The bolt (pêne): it slides out of the box's latch end along −x; `out` its tip when thrown (in the strike),
 *  `in` when drawn back (flush with the box). */
export const PENE = { y: 96, z: FACE + 3.5, size: [6, 3.4, 3], out: -53, in: -48 };
/** The strike (gâche): on the frame's room face, beside the leaf's latch edge, its notch where the bolt goes. */
export const GACHE = { at: [-55.5, 96, FACE + 3.5], size: [9, 13, 7] };
/** The return spring (ressort de rappel): in the box, along x, between the arm's cam and the box's end. */
export const SPRING = { from: [-34, 96, FACE + 3.5], to: [-44, 96, FACE + 3.5], r: 1.6, turns: 9 };
/** The system's centre and radius (the light, the bench). */
export const SYSTEM = { centre: [-6, 96, 6], size: 55 };

/* ───────────── THE BENCH ───────────── */
/** The scene point that stands at the bench's origin: the system sits on its pool with a section of the leaf
 *  (y 66 → 126 in the scene: the « slab », drawn by model.js on the bench only) standing on the bench's floor. */
export const BENCHAT = [-4, 66, 0];

/* ───────────── THE PLANE (avion.js: L03's cabin, imported) ───────────── */
/** The cabin of L03 stands in its own frame (L03/src/plan.js: floor y = 0, forward −x, the left wall +z, door 1L
 *  at x = 0 on the left wall); it is shown alone (`set` AVION), at this file's origin. */
export const PLANE = { door: [0, 100, 280] };
