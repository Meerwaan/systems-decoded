// DOSSIER 042 — Le toit du char : WHERE EVERYTHING STANDS. Centimetres, Y up. No import: caisson.js, char.js, feu.js,
// world.js and the acts all read this file, nothing else holds a dimension.
//
// THE CONVENTIONS (checked on kit/lib/stage.js: camera = target + d·(sin az·cos el, sin el, cos az·cos el)):
//   · THE ORIGIN is the centre of the ammunition compartment (the turret's « nuque », the bustle): the inside of the
//     caisson, halfway between its floor and its roof panel, halfway across its width.
//   · the tank faces −x: its gun, its driver, its crew are toward −x; the caisson is at the turret's REAR (+x end).
//     The caisson's wall toward the crew (the bulkhead, with its two sliding doors, the rod and the egg-shaped cam) faces
//     −x. The caisson's long side lies along z. The ground is below (GROUND.y).
//   · the tank's LEFT is +z (facing −x with y up, right = −z): the loader — « toi » — stands on the +z side, his door is
//     the +z one; the commander and the gunner sit on the −z side; the driver is in the hull, at the front (−x), low.
//   · az 0: the camera on +z (the tank's left flank, the loader's side); az +90: behind the tank (+x); az −90: in front of
//     it (−x, the gun toward the lens). Screen right = (cos az, 0, −sin az): at az −45 the caisson's crew face (doors,
//     rod, cam) is seen three-quarter with +x and +z to the right; at az +40 (the hook) the tank's rear corner is close
//     and its gun goes away to the right. The key light comes from −x, +y, +z: the doors' face is lit between az −20 and
//     −70; from behind (az > 0) the tank is lit by its own fire.
//   · THE CAMERA TURNS ONE WAY: in every path of the film, az DECREASES (world.js, above VIEW).
//
// THE SCALE. The tank and its caisson are drawn TRUE SIZE for a modern main battle tank (≈ 8 m of hull, 2.4 m to the
// turret roof, a 120 mm gun) but are NO real tank: no country, no insignia, a generic silhouette (faits § 10, `sources`).
// The inside (caisson, rounds, panel, doors, rod, cam) is schematic, after the figures of US 5,201,556. ONE place: the
// caisson is the turret's rear, so a move can go from the whole tank to the cam without a cut (the near plane follows
// the distance). Only the fire column, the panel's flight, the other turret (« une machine ») and the next file's
// teaser are a maquette — and nothing is ever measured on screen.

export const DEG = Math.PI / 180;

/** The ground (a grid, at night) under the tracks. */
export const GROUND = { y: -214 };

/* ─────────────────────────────────────────────── the system: the ammunition compartment (caisson.js), solid */

/** The caisson, INSIDE dimensions (the origin is its centre). Its walls: rear (+x), sides (±z) and floor `wall` thick;
 *  the bulkhead toward the crew (−x) `bulkhead` thick, with the two door openings; the roof is the PANEL (thin, on a
 *  ledge). Outer box: x −63 → +61, y −34 → +30.5, z ±131. */
export const CAISSON = {
  x: [-55, 55], y: [-28, 28], z: [-125, 125],
  wall: 6, //                  rear, sides, floor: thick armour (drawn 6)
  bulkhead: [-63, -55], //     the wall toward the crew (−x), 8 cm, the two door openings in it
  ledge: 4, //                 the frame the panel sits on, all round the top opening
  section: { z: 125 }, //      « en coupe »: the +z side wall (the camera's side) cut away at `section` 1
};
/** The roof panel (« un panneau fait pour lâcher »): the whole top of the caisson, thin, held by four light fasteners
 *  only. `bulge` bows it up (the principle); `blow` lifts it off and flies it (a maquette: ≈ 25 m up at 1, tumbling). */
export const PANEL = {
  x: [-59, 59], z: [-129, 129], y: [28, 30.5], //   2.5 cm thick, flush with the turret roof
  bulge: 6, //                                       cm of bow at its centre, bulge = 1
  flight: { up: 2500, drift: [160, 0, 220], turns: 1.4 }, // at blow = 1 (blow 0.05 cracked free, 0.15 ≈ 40 cm up)
  fasteners: [[-50, -120], [-50, 120], [50, -120], [50, 120]], // (x, z) of the four light bolts that shear first
};
/** The rounds: 120 mm, base toward the doors (−x), in two racks either side of the middle, 3 rows × 6 columns each
 *  (36 slots, 34 rounds: the two nearest the loader's door are empty). A round: case Ø 13, 98 long. */
export const ROUNDS = {
  r: 6.5, length: 98, base: -50, //                  base at x −50, tip at x +48
  rows: [-18, 0, 18], //                             y of the three rows
  cols: [21, 39, 57, 75, 93, 111], //                |z| of the six columns (rack +z and its mirror −z)
  empty: [[1, 0, 1], [1, 1, 1]], //                  [rack (1 = +z, −1 = −z), column, row]: the two empty slots
  grab: [1, 2, 1], //                                the round the loader takes (`grab`): rack +z, column 3, middle row
  pull: 120, //                                       cm it comes out toward −x at grab = 1 (into the loader's hands)
};
/** The two sliding blast doors, on the crew side of the bulkhead. Each closes its own opening; the +z one (the
 *  loader's) slides toward +z to open (`door`); the −z one never opens. Seals all round each opening (`seal`). */
export const DOORS = {
  opening: { w: 64, h: 44, y: -2, z: [40, -40] }, // centres of the two openings (+z: the loader's)
  leaf: { w: 72, h: 52, t: 4, x: [-67, -63] }, //    a door leaf, 4 cm, right against the bulkhead
  slide: 72, //                                      cm the +z door travels at door = 1 (0.12: a slit of ≈ 8 cm)
  rails: { y: [-30, 26] }, //                        the two guides (glissières), above and below the leaves
  seal: 2.5, //                                      the seal's width, round each opening, on the bulkhead's face
  bow: 4, //                                         cm a leaf bows toward the crew at bow = 1 (exaggerated, to read)
};
/** The locking device (US 5,201,556): a vertical rod hooked to the panel's front edge, down the bulkhead's middle
 *  pillar to a lever on the cam; the cam, egg-shaped (« generally ovoid »), on a horizontal axle along z, between the
 *  two doors, bearing on both leaves' inner edges when it turns. The rod rises `travel` cm, the cam turns `turn` degrees
 *  (the patent: 60 to 90), then a shear pin at the rod's top breaks and frees the panel. */
export const ROD = { x: -71, z: 0, top: 30.5, bottom: 4, r: 1.2, travel: 10, pin: [-71, 27, 0] };
export const CAM = { at: [-73, -2, 0], length: 22, a: 8, b: 5, lever: 7, turn: 80 };

/** ≈ the radius of the system: sizes the bench, its light, its shadows. */
export const SYSTEM = { centre: [0, 0, 0], size: 140 };
/** The bench: the same place, the tank gone; its floor just under the caisson (the cut to the bench is in place). */
export const BENCH = { floor: -34.5 };
/** The counter-example of the like (« solide veut dire sûr »): a closed box of thick steel, beside the caisson on the
 *  bench, behind it (+x): it swells and splits on every face (`crack`) while the caisson only opens its roof. */
export const BLOCK = { at: [260, 0, 0], size: [90, 64, 90] };

/* ─────────────────────────────────────────────────────── around: the tank, X-ray (char.js) — a generic silhouette */

/** The hull: from the glacis (−x) to the rear plate (+x), its deck under the turret; the tracks either side. */
export const HULL = {
  x: [-560, 230], deck: -84, belly: -172, halfWidth: 120, //   the hull body between the tracks
  glacis: [-560, -400], //                                     the sloped front plate (x range)
};
export const TRACKS = { z: [120, 183], top: -114, wheels: { r: 33, x: [-470, -360, -250, -140, -30, 80, 170] } };
/** The turret: from its front (−x) to its rear, over the caisson; wider at the front; its roof flush with the panel. */
export const TURRET = {
  x: [-330, 75], roof: 31, base: -84, //                       its floor on the hull deck (the ring)
  halfWidth: { front: 170, rear: 140 }, ring: { x: -170, r: 115 },
  hatches: { loader: [-150, 70], commander: [-150, -80] }, //  (x, z) on the roof
};
export const GUN = { trunnion: [-330, -18, 0], muzzle: -860, r: 7.5, breech: [-330, -230], evacuator: -560 };
/** The crew of four (« toi et trois autres »), glass figures (@kit/figure.js), veille when `crew` is up. « Toi » is the
 *  loader: standing, facing −x (the breech), his back to his door. The driver is in the hull at the front, far from the
 *  caisson — NEVER « juste devant » (contre-vérification). */
export const CREW = {
  loader: { feet: [-225, -150, 78], facing: -90, stand: true, step: 0 }, // beside the breech; facing in degrees about y (−90: toward −x); `reach` 1: a step of `step` cm back toward his door
  commander: { feet: [-150, -122, -88], facing: -90, seat: 46 },
  gunner: { feet: [-240, -142, -62], facing: -90, seat: 42 },
  driver: { at: [-445, -150, 0], facing: -90, recline: 55 },
};
/** « D'autres chars confient ce geste à une machine » : a second turret of glass, alone (no hull), at our turret's
 *  height beside our tank on the loader's side; its rear holds an autoloader (a rack and an arm, solid). No door, no
 *  bulkhead drawn (not confirmed for any named tank); two crew in it (commander, gunner), no loader. A maquette. */
export const OTHER = { at: [150, 0, 470], heading: 180, arm: { pivot: [-10, -8, 0], reach: 90, turn: 110 } };

/* ─────────────────────────────────────────────────────── the fire (feu.js) — a maquette */

/** The column of fire out of the roof opening: base on the opening (PANEL x, z), straight up; ≈ 9 m at column = 1. */
export const FIRE = { base: [0, 30.5, 0], height: 900, spread: 1.6 /* top width / base width */ };
/** The next file (043, the CERN beam): far away on its own floor, behind the tank (−z). A maquette. */
export const TEASER = { at: [0, -214, -9000], tunnel: 1800, r: 120 };
