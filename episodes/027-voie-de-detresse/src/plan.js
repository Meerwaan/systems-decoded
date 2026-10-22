// DOSSIER 027 — Voie de détresse : the plan of the set. Centimetres, y up. No import here: model.js, camion.js, col.js
// and world.js all read it — it is what lets them be built at the same time.
//
// THE ROAD'S FRAME. The scene never moves: the truck runs down it, and the camera rides with it (world.js, `ride`).
//   The ORIGIN is the truck's front axle centre, on the road, on the first frame (s = 0).
//   The truck drives DOWNHILL toward −z (its nose at −z). Its lane is centred on x = 0, the other lane at x = −350
//   (a two-way mountain road, you drive on the right): LEFT is −x — the mountain —, RIGHT is +x — the escape lane,
//   and beyond it the ravine.
//   THE DESCENT: the road, its verges and the escape lane all lie on ONE plane, y = SLOPE·z (z < 0: ahead, and lower).
// Azimuth (kit/lib/stage.js, line 381: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)) — checked:
//   az 0 stands at +z, BEHIND the truck, uphill, looking down the descent · az −90 at −x, its LEFT flank (your side,
//   the mountain's) · az +90 at +x, its right (the lane's, the ravine's) · ±180 in front, downhill, looking up at it.
//   The key light comes from −x, +y, +z (kit/lib/stage.js, KEY_DIR): from behind-left — a camera between az −20 and −70
//   has it at its shoulder. A shot from the right (+x) has it behind the subject: a rim, no modelling.
//
// ONE SCALE, TRUE across: the truck (a 40 t articulated lorry, 16.6 m), the road's width, the lane's width and depth,
// the wheel, the grains (10/14 mm). The DISTANCES ALONG the descent are TIGHTENED — the panel stands 52 m before the
// bed (a kilometre on the Laffrey project), the bed is 66 m, the truck stops 40 m into it, the descent between the top
// of the col and the bend is 500 m: none of them is ever said nor written on screen, `sources` says so (rule of 008).
//
// Three colours. signal is the threat: the drums' heat and their embers, the brake lights (they burn and nothing slows),
// the bend's chevrons and the ravine's edge. veille is the system alive: the lane (its panel's chequers, its rim, the
// sheen of its gravel), and what it does (the tracks the wheels push, the « Pédale 0 % » that still stops you).
// ink is the rest: the glass truck, the road, the mountain, you.

/** The descent: 8 % (illustrative — Laffrey ≈ 10 %, Mayres ≈ 6.5 %, sources). */
export const SLOPE = 0.08;
/** The plane's tilt about the x axis (radians): what turns a flat thing so that its −z end goes DOWN the slope.
 *  Three.js: rotation.x = TILT sends (0, 0, −L) to y = −L·sin|TILT| (lower). world.js tilts the lane, the truck and the
 *  bench with it. */
export const TILT = -Math.atan(SLOPE);

/* ───────────── THE TRUCK (camion.js — glass; model.js brings its front-left wheel and that wheel's brake) ─────────────
   Its own frame: origin at its FRONT AXLE centre on the ground, nose toward −z, you (left-hand drive) on the −x side.
   world.js stands it at truckAt(s), turned to its heading and tilted with the descent. A 4×2 tractor and a 3-axle
   semi-trailer: « quarante tonnes » (40 to 44 t in France: sources), 16.6 m. Sizes: a European tractor and trailer. */
export const TRUCK = {
  nose: -145, //                                     the front bumper
  cab: { back: 95, w: 250, floor: 125, roof: 390 }, // the cab: from the bumper to its back wall; its floor and roof heights
  drive: 370, //                                     the drive axle (twin tyres), 3.70 m behind the front one
  tail: 465, //                                      the tractor's chassis ends
  kingpin: 320, //                                   the fifth wheel: where the trailer turns
  trailer: { front: 160, back: 1520, w: 255, floor: 125, roof: 400, axles: [960, 1091, 1222] },
  track: 205, //  between the front tyres' centres (x = ±102.5); the twin tyres of the drive axle at ±(102.5 ∓ 17)
  wheel: 53, //   the tyre's radius (315/80 R22.5: 107 cm across)
  tyre: 32, //    the tyre's width
};
/** Every axle, in METRES behind the front axle, along the path (the trailer's are followed along it: camion.js turns
 *  the trailer on its kingpin so that its axles stay on the path). */
export const AXLES = [0, 3.7, 9.6, 10.91, 12.22];
/** THE HERO WHEEL: the FRONT-LEFT hub (your side, the key light's side), in the truck's frame. model.js builds that
 *  wheel (tyre, rim, hub, its drum brake); world.js hangs it on camion.js's anchor `hubFL`, which steers and sinks. */
export const HUB_FL = [-102.5, 53, 0];
/** A drum brake (inside each wheel): the drum's inner radius (16.5-inch drums: 42 cm across), its width, how far its
 *  centre plane stands inboard of the tyre's (toward the truck's middle). Two shoes, their linings, an S-cam. */
export const DRUM = { r: 21, w: 20, inset: 16 };
/** You, in the cab: your seat, the steering wheel's centre, the brake pedal's pad (truck's frame). */
export const YOU = { seat: [-60, 185, -20], wheel: [-60, 235, -95], pedal: [-54, 140, -118] }; // 21/10: camion.js — at −72 the right foot crossed

/* ───────────── THE RUN ───────────── */
/** The truck's path (its front axle): straight down its lane; then, just before the road bends left, edging RIGHT by
 *  PATH.x over [PATH.s0, PATH.s1] metres (a smooth S — « Tu braques à droite ») to run straight on, down the bed's
 *  centre line. A truck that does not steer goes straight on, through the bend's rail, into the ravine. */
export const PATH = { s0: 222, s1: 252, x: 470 };
const clamp01 = (u) => Math.min(1, Math.max(0, u));
/** Where the front axle is after `s` metres (s < 0: higher up the col) and the truck's heading (radians, + toward +x,
 *  to the RIGHT). Pure arithmetic, no allocation if `out` is given: called sixteen times a frame. */
export function truckAt(s, out = { x: 0, y: 0, z: 0, yaw: 0 }) {
  const span = PATH.s1 - PATH.s0;
  const u = clamp01((s - PATH.s0) / span);
  const k = u * u * u * (u * (u * 6 - 15) + 10); //   smootherstep: the heading comes and goes without a kink
  const dk = (30 * u * u * (u - 1) * (u - 1)) / span; // dk/ds, per metre
  out.x = PATH.x * k;
  out.z = -100 * s;
  out.y = SLOPE * out.z;
  out.yaw = Math.atan2(PATH.x * dk, 100);
  return out;
}

/* ───────────── THE ESCAPE LANE (model.js — the SYSTEM: solid) ─────────────
   Its own frame, LANE: origin at the HEAD OF THE BED (where the bitumen ends and the gravel begins), on the bed's centre
   line, on its surface; the bed runs toward −z, +x to its right — the road's axes, tilted with the descent (world.js).
   In the road's frame its origin stands at LANE.at. Lengths along the lane below are written in METRES of `s` (like the
   truck's path) when they say « s », in cm otherwise. */
/** The bed: 4.5 m wide, ≈ 90 cm of round gravel (« 36 inches give similar decelerations »: an order of size, never
 *  said), from s0 to s1 (66 m). Its surface is flush with the road's. */
export const BED = { s0: 252, s1: 318, x: 470, w: 450, depth: 90 };
export const LANE = { at: [BED.x, SLOPE * -100 * BED.s0, -100 * BED.s0] };
/** The paved access (« la voie quitte la route »): from the road's right edge at s0, a wedge widening (the « biseau »)
 *  to the bed's whole width at its head (s1 = BED.s0). Bitumen: the truck rolls on it until the bed. */
export const ACCESS = { s0: 222, s1: 252 };
/** The sign (C26a, « voie de détresse à droite »: a blue square with a chequered symbol on the real road — here a dark
 *  plate, its chequers veille, NO text): on the right verge, « bien avant » (52 m before the bed: tightened). */
export const PANEL = { s: 200, x: 330, h: 230, size: 95 };
/** The concrete barrier (GBA profile) along the bed's RIGHT side — the ravine's side: the far side for a camera at
 *  az −20…−70, a wall closing the picture behind the bed. */
export const RAIL = { x: BED.x + BED.w / 2 + 40, w: 60, h: 80 };
/** The earth mound closing the bed: 1 m high at most (sources: « pour éviter l'impression d'aboutir à un vide »). */
export const BERM = { s0: BED.s1, s1: BED.s1 + 7, h: 100 };
/** The grains: 10/14 mm, drawn at their size — only the close-ups see each one. ROUND in the bed (river gravel),
 *  CRUSHED (angular) on the bench's comparison half only. */
export const GRAIN = { size: 1.2 };
/** How deep a tyre sinks at `sink` 1 (« quelques dizaines de centimètres »: sources). */
export const SINK = 35;
/** Where the front axle stops (s): 40 m into the bed (illustrative, tightened; never said). */
export const STOP = 292;
/** 0 on the bitumen → 1 once an axle standing at `sAxle` metres is in the gravel (it drops in over 60 cm). */
export const inBed = (sAxle) => {
  const u = clamp01((sAxle - BED.s0 + 0.1) / 0.6);
  return u * u * (3 - 2 * u);
};
/** On the bench only — « ils arrêtent plus court que des grains concassés » : the first DEMO.len cm of the bed split
 *  lengthwise by a low divider on its centre line: its LEFT half ROUND (the hero wheel rolls at x = −DEMO.lane), its
 *  RIGHT half CRUSHED (the twin wheel at x = +DEMO.lane). Rolled in from the bed's head, the hero stops at DEMO.round
 *  metres, the twin at DEMO.crushed: 2.5 times further (Québec 1998: 77 m against 192 m entering at 70 km/h — sources;
 *  never written). The cut-away (`section`) opens the LEFT half's gravel outboard of the hero wheel, where it stops. */
export const DEMO = { len: 2400, lane: 110, round: 8, crushed: 20 };

/* ───────────── THE PLACE (col.js — the X-ray: glass, fine lines) ───────────── */
/** The road: two lanes of 350, edge lines 15 wide just inside its edges, a dashed centre line (3 m dash, 10 m gap — a
 *  French two-way road). Uphill it starts over the TOP OF THE COL (s = ROAD.top: « depuis le haut du col »); downhill it
 *  bends LEFT at CURVE.s, round the mountain's spur. */
export const ROAD = { right: 175, left: -525, w: 700, line: 15, dash: [300, 1000], verge: 140, top: -250 };
/** The bend: radius `r` to the road's centre line (x = −175), turning LEFT by `turn` degrees; its centre stands at
 *  [−175 − r, s]. Its OUTER edge carries a guard rail and a row of chevrons (signal): straight on from your lane (x = 0)
 *  the rail is met at s ≈ 256, and behind it the ravine. */
export const CURVE = { s: 245, r: 2500, turn: 75, chevrons: 7 };
/** The shelf the road and the lane are cut on ends at its EDGE (a polyline of [x cm, s m], from the mountain's side
 *  round the bend's outside, in front of the berm, then up the right side); beyond it the cliff falls DROP cm to the
 *  valley floor. The ground between the bend and the bed (the gore) is shelf: the bed is never on the edge. */
export const EDGE = { line: [[1150, -320], [1150, 333], [60, 333], [60, 290], [45, 274], [-20, 266], [-150, 262], [-493, 266.2], [-906, 269.8], [-1376, 272.5], [-1887, 274.4], [-17342, 315.8]], drop: 12000 }; // 21/10: as col.js draws it
/** The mountain on the LEFT: its foot along the left verge (x = MOUNTAIN.foot), rising steeply (`rise`: 0.75 cm up per
 *  cm out) to its crest 60 m above the road. The rock seen like an X-ray: contour lines. */
export const MOUNTAIN = { foot: -700, rise: 0.75, crest: 6000 };
/** The valley below the ravine: a village, and in it the next file's house (« chez toi » : `home`), [x, y, z] cm. */
export const HOME = [2600, -14600, -52000];
