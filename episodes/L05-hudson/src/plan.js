// DOSSIER L05 — Hudson (US Airways 1549, 15 January 2009) : the numbers every set reads, in centimetres, Y up.
// NO import, so that the sets can be built at the same time against it (docs/L05-decors.md).
//
// THREE FRAMES, one shown at a time (world.js · SET):
//
//  1. THE PLANE'S FRAME (avion.js, systemes.js mounted in it) — the A320 stands STILL at the origin and the world comes
//     to it (L03's rule): nose toward −x, up +y, its LEFT side (captain, left wing, doors L1/L2) toward +z, the
//     fuselage axis is y = 0, x = 0 is the wing's root (≈ the centre of gravity: the plane pitches and banks about it).
//     Camera azimuth (kit/lib/stage.js, checked): az 0 looks at the LEFT flank from +z · az −90 looks at the NOSE
//     from −x (from ahead) · az +90 looks from behind the tail (+x) · az 180 the right flank (−z).
//
//  2. THE GEOGRAPHIC FRAME (hudson.js: New York at TRUE scale) — x EAST, y up (0 = the river's surface, sea level), z
//     SOUTH (north is −z), origin at the DITCHING POINT (mid-river off West 48th Street). Positions below in KM
//     (× KM to get cm). world.js puts this whole frame under the plane: geo = R_y(ψ) · T(−P(track)), so a camera pose
//     is ALWAYS written around the plane. Simplified geography (rounded positions after the report's figure 1 and
//     a map): the sources say the 3D reconstructs it — never a distance shown on it that the voice does not say.
//
//  3. THE TABLE (carte.js: the MAQUETTE of New York at 1 : 2 000, MAP.k cm per km — same axes, same origin, the
//     ditching point at the table's (0, 0, 0)) and THE BENCH (makeBench + systemes.js), each with its SPOTS.
//
// THE CLOCK: every time of the day is `t` = seconds after 15:00:00 EST (15:27:11 → 1631). The voice's times are
// those of the report (NTSB AAR-10/03, p. 1-5 and 47-48): world.js · CLOCK ties them to the words.

export const KM = 100000; // cm per km
export const DEG = Math.PI / 180;
/** "15:27:11" → 1631 (seconds after 15:00:00). */
export const hms = (s) => {
  const [h, m, x] = s.split(":").map(Number);
  return (h - 15) * 3600 + m * 60 + (x || 0);
};

/* ─────────────────────────────── the day (report, EST) ─────────────────────────────── */
export const DAY = {
  cleared: hms("15:24:54"), //  takeoff clearance, runway 4
  after: hms("15:27:07"), //    after-takeoff checklist complete
  birds: hms("15:27:10"), //    "Birds." (15:27:10.4)
  strike: hms("15:27:11"), //   the impacts — 2 818 ft above the ground (859 m)
  ign: hms("15:27:19"), //      ignition
  apu: hms("15:27:21"), //      the APU started (≈)
  myAircraft: hms("15:27:23"), // the captain takes the controls
  top: hms("15:27:30"), //      the highest point, ≈ 3 060 ft (933 m)
  lga13: hms("15:28:05"), //    runway 13 offered, refused
  leftUp: hms("15:28:25"), //   the left engine "coming back up a little bit"
  lga31: hms("15:28:31"), //    runway 31, refused
  tcas: hms("15:28:36"), //     TCAS "traffic" (a helicopter)
  teb: hms("15:28:46"), //      Teterboro mentioned
  brace: hms("15:29:11"), //    "brace for impact"
  teb1: hms("15:29:21"), //     Teterboro runway 1, refused
  hudson: hms("15:29:28"), //   "we're gonna be in the Hudson"
  flaps: hms("15:29:44"), //    "no relight", flaps
  gpws: hms("15:30:24"), //     "terrain, pull up" from here on
  low: hms("15:30:36"), //      ≈ 100 ft
  stop: hms("15:30:41"), //     the sidestick against its aft stop
  contact: hms("15:30:43"), //  the river — 125 knots (231 km/h)
  wingExits: hms("15:30:58"), // the left overwing exits open
  raft1R: hms("15:31:16"), //   the 1R slide-raft
  ferry: hms("15:34:40"), //    the first boat
};
/** 3 min 32 s: the strike to the river (the countdown of the header). */
export const COUNT = { from: DAY.strike, to: DAY.contact };

/* ───────────────────────────── the A320 (plane's frame, cm) ───────────────────────────── */
// A320-214, CFM56-5B4/P. Overall sizes from Airbus; the stations (x of a door, of the engine…) are ROUNDED for the
// picture — the avion.js agent may refine them, but keeps the anchors' meaning (and says so in its journal).
export const A320 = {
  length: 3757, span: 3410, height: 1176,
  fuse: { r: 198, noseX: -1700, tailX: 2057, cabin: [-1180, 1480] }, // Ø 3.95 m; the cabin's floor at y −75
  wing: { rootLE: -330, rootChord: 620, tipChord: 160, sweep: 25, dihedral: 5, rootY: -125, tipZ: 1705 },
  flap: { from: 280, chord: 120, span: [230, 1250] }, //                      the trailing-edge flaps (x of their hinge at the root, span along z)
  engine: { x: -640, y: -250, z: 575, len: 440, nacD: 210, fanD: 173 }, // x of the inlet lip; the LEFT engine at +z (the right at −z)
  tail: { finLE: 1440, finTop: 780, tailplaneX: 1720, tailplaneSpan: 1245 },
  apu: { x: 1930, y: 30, len: 140, d: 70, exhaustX: 2057 }, //               in the tail cone, its exhaust at the very tail
  cockpit: { floorX: -1420, floorY: -60, eyeX: -1440, eyeY: 60, seatZ: 53, windX: -1580 }, // captain LEFT (+z), first officer RIGHT (−z)
  avionics: { x: -1300, y: -150 }, //                                         the computers' bay, under the cockpit floor
  doors: { L1: [-1310, -20, 198], R1: [-1310, -20, -198], L2: [1230, -20, 198], R2: [1230, -20, -198] }, // sill centres
  overwing: { x: [-40, 50], y: -10 }, //                                      two exits a side over the wing
  card: [-200, -10, 120], //                                                   a seat's back pocket and its safety card (row 12, left)
  float: { axisY: 120, sinkAft: 220 }, //                                     afloat: the axis 1.2 m above the river; `sink` 1 lowers the tail by 2.2 m
  ground: { axisY: 390 }, //                                                  on its gear at LaGuardia: the axis 3.9 m above the runway
};

/* ───────────────────────────── New York (geographic frame, KM) ───────────────────────────── */
export const GEO = {
  // the Hudson: its axis from the north (beyond the George Washington Bridge) to the Battery, and its width there (km)
  hudson: { axis: [[5.6, -14.0], [4.35, -9.1], [3.0, -5.9], [1.5, -2.7], [-0.1, 0.0], [-0.6, 3.0], [-1.0, 6.0], [-1.4, 8.6]], width: [1.1, 1.05, 1.15, 1.3, 1.3, 1.4, 1.6, 2.2] },
  // Manhattan (a simplified outline, clockwise from the Battery): its towers are tallest between z −1.5 and +1.2 (Midtown) and at z 6.5 to 8 (Downtown)
  manhattan: [[-0.6, 8.0], [0.1, 3.2], [0.55, 0.3], [1.85, -3.1], [3.45, -6.6], [4.75, -9.6], [5.9, -13.0], [6.9, -12.3], [5.9, -9.3], [4.9, -6.2], [4.4, -4.2], [3.7, -1.2], [3.1, 2.2], [2.4, 5.4], [1.3, 7.6], [0.4, 8.3]],
  eastRiver: { axis: [[0.9, 8.2], [2.8, 5.4], [3.5, 2.0], [4.0, -1.4], [4.9, -4.2], [6.4, -4.4], [8.6, -3.4], [10.4, -2.6]], width: [0.7, 0.55, 0.4, 0.45, 0.5, 0.9, 1.4, 1.6] },
  lga: { r04: [[10.10, 0.0], [11.58, -1.53]], r13: [[10.70, -1.60], [12.20, -0.14]] }, // LaGuardia: runway 4/22 (04 threshold first), 13/31 (13 threshold first)
  teb: { r01: [[-4.90, -8.00], [-4.53, -10.10]] }, //                                    Teterboro, New Jersey: runway 1/19 (01 threshold first)
  gwb: { a: [3.75, -9.0], b: [4.85, -9.25], deck: 65, towers: 184 }, //                    the George Washington Bridge (deck and towers in metres)
  strike: [8.7, -8.4], //                                                                  ≈ 4.5 mi north-north-west of runway 22's threshold
  ferryPier: [0.75, -0.45], //                                                             the ferries' terminal on the Manhattan side (West 39th St)
};

/**
 * THE TRACK — the plane's way through the day: [t, x km, z km, alt m (its AXIS above the ground or the river), pitch°].
 * Simplified from the report's figure 1 (rounded, smoothed): LaGuardia runway 4 → the strike over the Bronx → the
 * left turn → down the Hudson → the river at the origin → the drift south. Read it with pathAt().
 */
export const PATH = [
  [hms("15:24:54"), 10.10, 0.00, 3.9, 0], // lined up on runway 4
  [hms("15:25:00"), 10.10, 0.00, 3.9, 0], // the roll starts
  [hms("15:25:30"), 11.25, -1.20, 3.9, 8], // rotation near the end of the runway
  [hms("15:25:45"), 11.95, -2.25, 150, 15],
  [hms("15:26:15"), 11.95, -4.40, 430, 12],
  [hms("15:26:45"), 10.60, -6.60, 680, 10],
  [hms("15:27:11"), 8.70, -8.40, 859, 8], //  the strike
  [hms("15:27:30"), 7.60, -9.70, 933, 4], //  the highest point
  [hms("15:27:50"), 6.50, -10.70, 880, 1],
  [hms("15:28:05"), 5.70, -10.95, 820, -1],
  [hms("15:28:25"), 4.75, -9.90, 700, -1], // turning onto the river, near the bridge
  [hms("15:29:11"), 3.00, -6.30, 420, 0],
  [hms("15:29:28"), 2.40, -5.00, 340, 0],
  [hms("15:29:44"), 1.85, -3.85, 280, 2],
  [hms("15:30:24"), 0.45, -0.95, 60, 4],
  [hms("15:30:36"), 0.13, -0.28, 30, 7],
  [hms("15:30:40"), 0.05, -0.11, 15, 9],
  [hms("15:30:43"), 0.0, 0.0, 1.2, 9.5], //    the river (the axis at A320.float.axisY)
  [hms("15:31:00"), -0.02, 0.10, 1.2, 6],
  [hms("15:50:00"), -0.40, 2.40, 1.2, 5], //   carried south by the current
];
const P_T = PATH.map((k) => k[0]);
function herm(col, t) {
  const n = PATH.length;
  if (t <= P_T[0]) return PATH[0][col];
  if (t >= P_T[n - 1]) return PATH[n - 1][col];
  let i = 0;
  while (P_T[i + 1] < t) i++;
  const t0 = P_T[i], t1 = P_T[i + 1], h = t1 - t0, u = (t - t0) / h;
  const v0 = PATH[i][col], v1 = PATH[i + 1][col];
  const m0 = i > 0 ? ((v1 - PATH[i - 1][col]) / (t1 - P_T[i - 1])) * h : v1 - v0;
  const m1 = i < n - 2 ? ((PATH[i + 2][col] - v0) / (P_T[i + 2] - t0)) * h : v1 - v0;
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
}
/**
 * Where the plane is at `t` (seconds after 15:00), written into `out` (no allocation):
 * out[0..2] = x, y, z in CM in the geographic frame (y = its axis) · out[3] = heading, compass radians (0 north,
 * clockwise) · out[4] = pitch° · out[5] = bank° (positive = RIGHT wing down, from the turn rate) · out[6] = ground
 * speed m/s. After the touchdown the heading stays the last one in flight (afloat, the plane does not turn).
 */
export function pathAt(t, out) {
  const tc = Math.min(t, DAY.contact - 0.5);
  const dt = 2;
  const ax = herm(1, tc - dt), az = herm(2, tc - dt), bx = herm(1, tc + dt), bz = herm(2, tc + dt);
  const hdg = Math.atan2(bx - ax, -(bz - az));
  const cx = herm(1, tc - 2 * dt), cz = herm(2, tc - 2 * dt), ex = herm(1, tc + 2 * dt), ez = herm(2, tc + 2 * dt);
  let dh = Math.atan2(ex - bx, -(ez - bz)) - Math.atan2(ax - cx, -(az - cz));
  dh = Math.atan2(Math.sin(dh), Math.cos(dh));
  const v = (Math.hypot(bx - ax, bz - az) * 1000) / (2 * dt);
  const w = dh / (3 * dt);
  const air = t < DAY.contact - 0.2 && herm(3, t) > 5;
  out[0] = herm(1, t) * KM;
  out[1] = herm(3, t) * 100;
  out[2] = herm(2, t) * KM;
  out[3] = hdg;
  out[4] = herm(4, t);
  out[5] = air ? Math.max(-28, Math.min(28, Math.atan((v * w) / 9.81) / DEG)) : 0;
  out[6] = t < DAY.contact ? v : 0;
  return out;
}

/* ───────────────────────────── the table (carte.js) and the bench ───────────────────────────── */
/** The maquette: 1 km = MAP.k cm, same axes and origin as GEO; heights at the same scale (860 m → 43 cm). */
export const MAP = { k: 50, x: [-6, 13.5], z: [-14, 9], glyph: 30 }; // the plane's glyph: 30 cm long (a map symbol, ≈ 15 × its scale)
/** The test basin of the certification (carte.js, CARTE spot 1): a model airliner touching still water. */
export const BASIN = { at: [3000, 0, 0], len: 420, w: 140, depth: 40, model: 60 };
/** The places of the table (SET.CARTE) and of the bench (SET.BENCH), one lit at a time (`spot`). */
export const SPOTS = {
  carte: [[0, 0, 0], BASIN.at], //                           0 the maquette of New York · 1 the test basin
  bench: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], //              0 the check-list (QRH) · 1 the engine on its test stand · 2 the lineup — each on its own bench, one shown
};
export const BENCH = { sizes: [70, 260, 320] }; // each spot's bench: the radius of its halo (cm) — the QRH ≈ 30 cm, the engine stand ≈ 250, the lineup of four

/** The simulator passes (Toulouse, April 2009 — report p. 50): 15 retained, 8 succeed with an IMMEDIATE turn; one
 *  more with a 35 s delay toward runway 13 of LaGuardia fails. Which runway each of the 15 aimed at is NOT drawn
 *  as a fact (the report gives the airports; the film never labels a pass). `ok` = it reached a runway. */
export const SIMS = { n: 15, ok: 8, delay: 35, lateTo: "lga13" };
