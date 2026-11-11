// DOSSIER 044 — Le gilet pare-balles : where everything stands. Centimetres, Y up. No import: gilet.js, rue.js and
// world.js read it, nothing else decides a position.
//
// ONE PLACE, AT TRUE SIZE (the bench is the same place, the street faded — the panel slides out of the vest onto it):
//   · the ground is y 0. The policeman (« toi ») stands at the origin, IN THE MIDDLE OF THE STREET, FACING −x: the riot
//     and the shot are up the street toward −x, home is down it toward +x. HIS LEFT IS +z (the camera's usual side).
//   · the bullet flies along +x, at the impact's height, and hits the FRONT panel of his vest low on the belly, a little
//     to his left (IMPACT): « ventre », below the ribs (the ribs above it in fine lines; nothing broken, ever).
//   · azimuth (kit/lib/stage.js): camera = target + d·(sin az·cos el, sin el, cos az·cos el). az 0 looks at his LEFT
//     flank (camera on +z), az −90 at his FRONT (camera on −x, up the street), az +90 at his BACK. Screen right is
//     (cos az, 0, −sin az): at az −40 the bullet travels left → right; at az +35 (behind his left shoulder) the street
//     and its fires are BEHIND the subject. The key light comes from −x, +y, +z.
//   · THE CAMERA TURNS ONE WAY: in every path az DECREASES (world.js, above VIEW).
// True sizes: the panel, its layers, the bullet (9 mm), the cone (≤ 44 mm, the norm's limit in clay), the clay block.
// Maquettes, said in `sources`: the yarn pitch drawn coarser than real (a fabric at 0.7 mm would shimmer at 270 px), the
// number of layers (24 drawn — « des dizaines »; no number is ever written), the strength test, the rocket.
export const DEG = Math.PI / 180;

/** The street of a housing estate at night (rue.js), X-ray. It runs along x; façades of tall blocks on both sides. */
export const STREET = {
  half: 650, //                 the façades stand at z = ±half (13 m between them)
  kerb: 470, //                 the pavements: |z| from kerb to half
  from: -5600, to: 3600, //     its length along x (the riot up the street, −x; home down it, +x)
  blocks: { h: [1500, 3600], floor: 290, w: [1800, 3200] }, // blocks of flats: 5 to 12 storeys, each 18 to 32 m long
  lamps: { every: 2400, z: 520, h: 800 }, // street lamps, both sides
  fog: 0.00009, //              night air: the façades at 40 m still read, the far end melts
};
/** The riot (rue.js, `riot`): its fires, its smoke, its silhouettes — up the street, where the shot comes from. One
 *  ember far behind him (+x) so that every angle has signal behind the subject. Nobody is ever shown shooting. */
export const RIOT = {
  fires: [[-320, -460], [-2100, -300], [-2900, 260], [-3700, -140], [-4500, 320], [1900, 380]], // [x, z] on the ground: burning bins, a car — the first, a bin on the far pavement 5 m ahead of him, reddens the back of POSE0
  car: [-2600, -360], //        a burnt-out car on its side of the street (glass, its insides glowing signal)
  crowd: { x: [-2700, -4600], z: [-420, 420], n: 26 }, // blurred glass silhouettes, never one in focus
};

/** « Toi »: a policeman of glass (kit/lib/figure.js, 1.76 m), feet at the origin, facing −x (`turn` −90 about y). */
export const YOU = { at: [0, 0, 0], turn: -90 };
/** His trunk, as figure.js draws it once turned (its lathe, depth × 0.62): x of the front of the trunk at three heights,
 *  the back mirrors it. The vest and the X-ray torso of rue.js fit these. */
export const BODY = {
  hip: 90,
  front: [[96, -7.6], [106, -7.0], [127, -8.8], [141, -10.8]], // [y, x of the front surface]
  half: [[96, 12.2], [110, 11.2], [127, 14.2], [141, 17.4]], //   [y, half-width along z]
  ribs: { top: 142, low: 112, front: 118 }, // the rib cage: its top, its lowest point at the flank, its lowest at the front (costal margin)
  shoulder: 144, head: 166.5,
};

/** THE SYSTEM. The front panel of soft armour (gilet.js): a stack of woven layers in its housse, in the carrier's front
 *  pocket. Flat and vertical, its strike face toward −x (the street), its wear face toward +x (the body). */
export const PANEL = {
  w: 32, h: 42, //              z −16 → +16, y 94 → 136
  y: 115, z: 0, //              its centre (x below)
  strike: -11.2, //             x of the strike face (the first layer's front), toward the street
  wear: -10.0, //               x of the wear face (the last layer's back), toward the body: ≈ 3 cm in front of the belly
  n: 24, //                     layers drawn (« des dizaines »: no count is ever said or written)
  cover: 0.12, //               the housse, each side (thin, sealed, matt)
  weave: 0.4, //                the yarn pitch DRAWN (cm) — maquette: real ≈ 0.07
  stitch: 1.4, //               the seams: a box stitch this far in from the edge, and two lines across (dotted)
};
PANEL.x = (PANEL.strike + PANEL.wear) / 2; // −10.6
PANEL.pitch = (PANEL.wear - PANEL.strike) / PANEL.n; // 0.05: layer k (0 = strike side) spans x strike + k·pitch → + (k+1)·pitch

/** Where the bullet hits: on the strike face, low on the belly, a little to his left (+z: toward the camera's side). */
export const IMPACT = [PANEL.strike, 106, 5];
/** The cut that shows the panel « en coupe » (`section`): everything of the panel, the carrier and the clay at z > cut is
 *  hidden; seen from +z (az −50 → +50) the layers, the cone and the bullet read in section. */
export const SECTION = { z: IMPACT[2] };

/** The hollow toward the body (`cone` 0 → 1): every layer is pushed toward +x by depth·cone·profile(r), r the distance
 *  from the impact's axis (y, z). At 1 the wear face is 4.4 cm deep at the axis — the norm's limit in clay (NIJ 0101.06,
 *  44 mm), the deepest the film ever draws. The same profile dents the clay (`dent`) and pushes the belly (rue.js). */
export const CONE = { R: 9, depth: 4.4, k: 1.5 };
/** The cone's profile at r (cm from the axis): 1 at the axis, 0 from R out, rounded at the apex (no needle). */
export function coneProfile(r) {
  if (r >= CONE.R) return 0;
  const u = 1 - r / CONE.R;
  const round = Math.min(1, r / 1.2); // within 1.2 cm the apex rounds off (the bullet's nose sits in it)
  return Math.pow(u, CONE.k) * (0.92 + 0.08 * round * round) / (0.92 + 0.08);
}
/** x displacement of the panel toward the body at a point (y, z), for a given `cone`. */
export const coneAt = (y, z, cone) => CONE.depth * cone * coneProfile(Math.hypot(y - IMPACT[1], z - IMPACT[2]));

/** The bullet: a 9 mm pistol bullet, round nose, jacketed (≈ 9 × 15.5 mm); flattened it is ≈ 17 × 8 mm (the mushroom
 *  of NIJ 0101.06's guide; its exact size here is a reconstitution). It flies along +x on the line through IMPACT. */
export const BULLET = { d: 0.9, len: 1.55, mush: { d: 1.7, len: 0.8 } };
/** The story's clock (main.js): before contact T = −dist / SPEED (≈ 400 m/s, the order of magnitude of the norm's test
 *  rounds, 373–448 m/s — Nîmes' real speed is unknown); from contact to the stop, T = STOP · cone (a reconstitution:
 *  ≈ 4 cm braked at ≈ 200 m/s on average). */
export const SPEED = 40; // cm per millisecond
export const STOP = 0.2; // ms

/** THE BENCH: the same place, the street gone. The panel slides out of its pocket toward his left (`out` 0 → 1) and
 *  stands on a pool of light that floats at the height of its lower edge. */
export const OUT = [-6, 0, 64]; //   the panel's move, pocket → bench
export const BENCH = { at: [PANEL.x + OUT[0], PANEL.y - PANEL.h / 2 - 0.5, PANEL.z + OUT[2]], size: 30 };
/** The exploded view on the bench, along the bullet's path (x): the housse halves out first, then the 24 layers fanned
 *  like the pages of a book (each a few degrees about its seam edge, z −16). */
export const EXPLODE = { pitch: 2.6, housse: 38, fan: 7 }; // layer k centre at x = bench.x + (k − 11.5)·pitch; housse at ±housse
/** The strength test (principe, « à poids égal »): a gallows on the halo, beside the first layer. Two strands of the same
 *  weight hang side by side — a Kevlar yarn (veille) and a steel wire ≈ 2.3 × thinner in diameter (steel is 5.5 × denser:
 *  same weight per length) — each under its blocks: the steel holds one, the Kevlar five. A maquette, said in `sources`. */
export const TEST = { at: [BENCH.at[0] - 30, BENCH.at[1], BENCH.at[2] + 44], bar: 66, gap: 16, len: 40, block: 5 };

/** The clay block of the comment (rue.js): Roma Plastilina n° 1 as in the NIJ test, 61 × 61 × 14 cm, standing on the halo
 *  behind the panel (the panel's wear face against its front face). The dent is the cone's own profile (`dent` 1 = 4.4 cm). */
export const CLAY = { face: BENCH.at[0] + (PANEL.wear - PANEL.x), size: [14, 61, 61], centre: [BENCH.at[1] + 30.5, BENCH.at[2]] };
/** The depth gauge: a straight edge across the clay face (along z) at the dent, and a graduated probe that goes down into
 *  it along +x — a tick every millimetre, a long one every centimetre, the 44 mark lit veille. No number is drawn. */
export const GAUGE = { edge: 40, probe: 6, mark: 4.4 };
/** The bench's impact point (where the bullet sits in the panel once out). */
export const IMPACT_BENCH = [IMPACT[0] + OUT[0], IMPACT[1] + OUT[1], IMPACT[2] + OUT[2]];

/** The chute's ghost: a rigid plate (glass, ink) 2 cm in front of the strike face, the panel's size, at home on the torso;
 *  a ghost bullet comes at it along the path and bounces back up the street (`bounce`). */
export const WALL = { x: PANEL.strike - 2, t: 0.8 };
/** The comment's ghost blade (no contact, ever): a kitchen knife of glass, its point 3 cm from the strike face at the
 *  bench's impact point, 18 cm of blade along −x, tipped 20° down. */
export const BLADE = { tip: [IMPACT_BENCH[0] - 3, IMPACT_BENCH[1], IMPACT_BENCH[2]], len: 18, tilt: 20 };

/** The walk home (`walk` 0 → 1): he turns round (0 → 0.12) and walks down the street, away from the riot, toward +x. */
export const WALK = { to: [2600, 0, 140], turn: 0.12 };

/** The next file (045): a rocket of glass on the halo behind the panel, its destruct charge along its body (signal). */
export const TEASER = { at: [BENCH.at[0] + 72, BENCH.at[1], BENCH.at[2] - 42], h: 92, r: 5.5 };
