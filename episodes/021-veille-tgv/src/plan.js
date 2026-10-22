// DOSSIER 021 — Veille du TGV : the plan of the set. Centimetres, y up. No import here:
// model.js, train.js and world.js all read it — it is what lets them be built at the same time.
//
// ONE SCALE: TRUE. The TGV Duplex (two power cars and eight double-deck trailers, ≈ 200 m), its track and its
// catenary are drawn at true scale (ordres de grandeur: no length is ever written on the set). The system's own
// sizes (the pedal, the keys, the countdown box, the bell, the relay, the valve) are ILLUSTRATIVE: the layout of a
// TGV cab was not found (docs/faits/021-vacma-tgv.md, « Non trouvé ») — nothing of them is ever written on screen.
//
// THE TRAIN'S FRAME: the train stands still at the origin and the world comes to it (011, 013, 014, 015, 023): the
// camera poses stay true all film long. Its NOSE points to −x, up is +y, the top of the rail is y = 0; its LEFT
// side faces +z — the camera's side (az −20 … −70 stands at −x / +z: front-left three quarters, where the key
// light falls). On a French line trains keep left: the OTHER track is on the train's right (−z), and so are the
// catenary masts (drawn on the far side only: nothing tall stands between the camera and the train).
// Azimuth, as everywhere in the kit: az 0 looks from the front (−x), −90 from the left side (+z), −180 from behind.

/* ───────────── THE TRACK AND THE WORLD (train.js) ───────────── */
/** The track: gauge, the sleepers' spacing (drawn SMEARED in a shader at speed — never as lines that jump),
 *  the ballast's half-width, the other track (−z), the ground under the ballast (a grid, never a solid floor). */
export const TRACK = { gauge: 143.5, sleeper: 60, ballast: 170, other: -480, ground: -30 };
/** The catenary: masts on the far side only, one every `every` cm (63 m: at 255 km/h one passes every ≈ 0.9 s),
 *  their arms reaching over both tracks, the contact wire at `wire` above the rail. */
export const CATENARY = { z: -820, every: 6300, h: 800, arm: 560, wire: 520 };
/** The world scrolls by `run` (true METRES, moved by the acts) toward +x: an object of the world at X stands at
 *  X + run·100. Everything periodic (masts, sleepers, the fields' grid) wraps; `run` may be negative. */
export const WORLD = { far: 60000, fields: 4000 };

/* ───────────── THE TRAIN (train.js) — true scale ───────────── */
/** The front power car (motrice): the nose tip at −x, its body, its roof. The cab is at its front. */
export const POWER = { nose: -1330, back: 1100, w: 290, roof: 405, floor: 150 };
/** The cab, inside the front power car: the windscreen, the desk (pupitre), the EMPTY seat, the back wall and its
 *  door (closed: between the cab and the passengers), the side windows. The driver sits on the axis (z = 0). */
export const CAB = {
  screen: [-960, 260, -840, 380], //  the windscreen's foot and head (x, y)
  desk: { x: -790, top: 240, w: 160, depth: 70 }, // its front edge (toward the seat) at x, its top at y; a KNEE SPACE under it, open toward the seat: the pedal stands in it
  seat: { x: -650, y: 200, back: 290 }, //            the empty seat: cushion height, top of the back
  wall: -430, //                                      the back wall of the cab, its door on the axis
  door: { w: 70, h: 190 },
  side: [-910, 250, -700, 360], //                    the side windows (both sides): x from, y from, x to, y to
  display: [-830, 252, 0], //                         the desk's speed display (the TVM's readout), facing the seat: lit by `display`
};
/** The radio antenna on the front power car's roof: where the alarm leaves (`radio`). */
export const ANTENNA = { at: [-300, 405, 0], h: 40 };
/** The pantograph on the front power car's roof, up against the contact wire; the traction chain under it. */
export const PANTO = { x: 650 };
export const TRACTION = { transformer: [0, 160, 0], size: [400, 120, 180] };
/** The bogies (x of each): the power cars' motor bogies and the trailers' shared (articulated) bogies. */
export const BOGIES = [-640, 640, 1300, 3300, 5170, 7040, 8910, 10780, 12650, 14520, 16480, 17280, 18560];
/** The brake pipe (« la conduite générale »): along the whole train under the floors, from the cab to the tail.
 *  Venting it to the air puts every brake on: `brake` runs a head along it, front → back. */
export const PIPE = { y: 110, z: 70, from: -1000, to: 19900 };
/** The eight double-deck trailers (x from, x to), then the rear power car. Two decks: floors and heads. */
export const TRAILERS = [[1120, 3300], [3300, 5170], [5170, 7040], [7040, 8910], [8910, 10780], [10780, 12650], [12650, 14520], [14520, 16700]];
export const REAR = [16720, 18920];
export const DECKS = { lower: 70, upper: 255, roof: 430, w: 290, head: 105 };
/** 393 passengers on board (BEA-TT): how many in each trailer (sum 393), seated in rows `row` cm apart, four
 *  across at `zs`. Drawn as small glass heads (and shoulders) when `pax` > 0, facing −x. */
export const PAX = { perCar: [46, 50, 50, 48, 50, 50, 50, 49], row: 95, zs: [-100, -45, 45, 100] };
/** You: a passenger of the first trailer, upper deck, at a LEFT window (+z), seated, facing the nose. Your phone. */
export const YOU = { at: [1900, 255, 100] };

/* ───────────── THE SYSTEM (model.js) — illustrative sizes, never displayed ─────────────
   Its root's origin: the pedal's hinge on the cab floor, under the desk, in front of the seat (x CAB_PEDAL).
   The driver's foot would come from +x (the seat). */
export const CAB_PEDAL = [-800, POWER.floor, 0];
/** The pedal: a plate hinged at its heel (+x end, the origin), its toe toward −x; up = `rest` degrees, pressed = flat.
 *  Its return spring under the toe. */
export const PEDAL = { len: 32, w: 16, rest: 14 };
/** The keys (« des touches, sous les doigts »): two touch pads lying on the desk's front edge, facing UP (+y): seen
 *  from above at any azimuth, lit by the key light. */
export const KEYS = { at: [8, 90, 0], gap: 44, size: 7 };
/** The countdown box, inside the desk behind its face; its DIAL (a ring that empties: `count`) on its +z face
 *  (the camera's side, lit by the key). */
export const BOX = { at: [-50, 45, 0], size: [30, 24, 14], dial: 9 };
/** The bell (« une sonnerie ») on the desk top; the relay (« le courant est coupé ») by the box; the emergency
 *  valve (« l'air des freins s'échappe ») on a stub of the brake pipe under the floor (PIPE.y − floor = −40). */
export const BELL = { at: [-25, 92, 42], r: 5 };
export const RELAY = { at: [-50, 64, 2], size: [10, 12, 8] };
export const VALVE = { at: [10, PIPE.y - POWER.floor, PIPE.z], r: 6, stub: 60 };
/** The boot (a demonstration prop, on the bench only): a shoe of glass, `len` long, that presses the pedal. */
export const BOOT = { len: 28 };
/** ≈ the radius of the system on the bench; its centre in its own frame (for the camera and the light). */
export const SYSTEM = { size: 70, centre: [-20, 35, 15] };
/** On the bench the root stands this high, the floor plate held by two glass posts (the valve hangs under it). */
export const BENCHAT = [0, 70, 0];
