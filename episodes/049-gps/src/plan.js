// DOSSIER 049 — GPS : where everything stands. No import: route.js, model.js, satellite.js and world.js all read it.
// Centimetres, Y up.
//
// THE FRAME IS THE CAR'S (025's road, itself 014's): the car never moves. Its centre is on the origin, its nose
// towards −z, its LEFT on −x (you drive on the left seat, x −37), the ground at y 0. The road, the junction and the
// field scroll under it with `gap` (route.js); the sky does NOT scroll: the satellites, their rings and their
// spheres hang in the car's frame (they are 20 000 km away: 100 m of road change nothing to where they are seen).
//
// CAMERA (kit/lib/stage.js, checked): camera = target + d·(sin az·cos el, sin el, cos az·cos el).
//   az 0 stands BEHIND the car (+z) looking forward; az −90 on its LEFT (−x); ±180 in front of it. el < 0 looks up.
//   The key light comes from −x, +y, +z: most poses sit between az −20 and −70.
//
// A MAQUETTE, NOT THE SCALE. The true sky (20 200 km, a phone of 15 cm, 300 m per microsecond) does not fit a
// vertical frame. The satellites float 30 to 45 m above the car, the clock error moves the blue dot 9 m into the
// field (the voice says « 300 mètres » of light per microsecond, never « the dot moved 300 m »). NO length, height or
// distance is ever written on this sky or this ground; `sources` says the picture rebuilds a maquette.

/* ── the car and the road (values of 025/src/plan.js, copied: route.js imports 025's road as it is) ── */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146, belt: 96, floor: 31, wheel: 34 };
export const YOU = { x: -37, head: [-37, 118, 14] }; // you at the wheel (025's glass figure)
export const ROAD = { edge: 175, otherEdge: -525, verge: 120, ditch: { w: 140, depth: 60 } }; // your lane's centre is x 0
/** the right ditch runs from x DITCH[0] to DITCH[1]; the FIELD starts past it */
export const DITCH = [ROAD.edge + ROAD.verge, ROAD.edge + ROAD.verge + ROAD.ditch.w]; // [295, 435]

/** The story's speed (illustrative, never said): 70 km/h on a country road. `eta` (seconds to the junction) gives
 *  `gap`, the metres from the front bumper to the junction's near edge: gap = eta × MPS (world.js). */
export const KMH = 70;
export const MPS = KMH / 3.6; // 19.4 m/s: five seconds = 97 m

/** The T junction, in the ROAD's coordinates: z measured from the junction's near edge (0), −z beyond it.
 *  The crossing road runs along x; your road ENDS at its far edge (a T: left… or right?). Beyond, a hedge and the
 *  dark field. The branches light in turn on « À gauche… ou à droite ? ». */
export const JUNCTION = {
  w: 600, //          the crossing road's width (two lanes of 300), from z 0 to z −600
  arm: 30000, //      each branch runs 300 m to the left and to the right (fades in the night)
  hedge: -900, //     the hedge and the far field start past the far verge
  sign: [0, 0, -760], // the direction sign on the far verge, facing you (comment's duel: « …ou les panneaux ? »)
};

/** The FIELD on your right, before the junction (where the blue dot lands): from the ditch outwards, ploughed rows
 *  along z. In the car's frame it scrolls with the road. */
export const FIELD = { x0: DITCH[1], x1: 9000, rows: 90 }; // a row every 90 cm

/** Where the phone stands in the car: in its holder on the dashboard, a little right of the wheel, its screen
 *  turned to you (+z) and tilted back. Portrait. The hook looks at it from below, past your right hand. */
export const PHONE = {
  at: [6, 106, -66], // its centre, in the car
  tilt: 16, //          degrees its screen leans back (towards the roof)
  turn: -10, //         degrees it turns towards you (the driver, on −x)
  w: 7.2, h: 15, t: 0.8, // the phone itself
  antenna: [0, 6.6, -0.1], // the GNSS antenna, near its top edge (phone's own frame: centre origin, screen +z, top +y)
  chip: [1.2, 2.4, -0.15], //  the receiver chip on its board
  quartz: [-1.6, 2.0, -0.15], // the quartz crystal, next to the chip (the phone's clock: « une horloge à quartz »)
};

/** The blue dot: where the phone thinks it is, on the ground, in the car's frame. `err` 0 → ROAD (under you);
 *  `err` 1 → FIELD_FIX: past the ditch, in the field. */
export const ROAD_FIX = [0, 0, 0];
export const FIELD_FIX = [850, 0, -150];
/** The clock error, in the maquette: « un millionième » of lag shrinks EVERY sphere by the same DELTA (cm).
 *  The three first satellites are placed so that their three spheres, all shrunk by DELTA, still meet EXACTLY at
 *  FIELD_FIX (checked: |S| − |S − FIELD_FIX| = DELTA for S1–S3). The fourth's does not: it misses by ≈ 9 m, and
 *  only the clock corrected (err → 0) brings the four back on ROAD_FIX. */
export const DELTA = 300;

/** The four satellites over you (car's frame, cm). SATS[0] is THE satellite: the hook's, the one that opens. */
export const SATS = [
  [1430, 3077, -2440], // S1 — forward, right, 47° up: seen through the windscreen in the hook
  [1642, 3165, -9], //    S2 — right, high (63°)
  [2667, 3240, 2819], //  S3 — right, behind (40°)
  [-3600, 4200, 1800], // S4 — left, behind: the fourth signal (its sphere misses the field point)
];
/** The rest of the constellation (« ou plus »): fainter, further, slowly drifting along their tracks. */
export const OTHERS = [
  [-5200, 2600, -4800], [4800, 1900, -6200], [-7000, 3300, -800], [600, 5600, -5200],
  [5600, 4300, 4200], [-2400, 2100, 7400], [-6000, 5200, 4600], [7800, 2800, -1200],
];

/** The satellite, in its OWN units (the bench's size): a bus, two solar wings, the antenna array facing the Earth
 *  (its −y in its own frame, turned to the car in the sky, to the phone on the bench). In the sky it is scaled by
 *  SKY_SCALE (a maquette: never a size on screen). */
export const SAT = { bus: [16, 18, 16], span: 64, wing: [22, 0.6, 12], array: 10, clock: [5, 7, 5] };
export const SKY_SCALE = 8;

/** The bench (the origin): the phone standing, the satellite above it, a thread of light between their antennas.
 *  « On remonte le fil » = the camera climbs from BENCH.phone to BENCH.sat. */
export const BENCH = {
  phone: [0, 9, 0], //   the phone's centre (standing on its bottom edge, screen +z)
  sat: [0, 78, -14], //  the satellite's centre (scale 1), its array turned down to the phone
  size: 12, //           ≈ the radius of what the light stands around (the phone); fs 40 for the satellite
};

/** The comment's « onze kilomètres de lumière »: a stroke of light unrolling over the road, ahead, into the night. */
export const STREAK = { y: 450, from: -600, to: -400000 };
