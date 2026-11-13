// DOSSIER 048 — Tunnelier : where everything stands. No import: model.js, sol.js, rue.js and world.js all read it.
// Centimetres, Y up. TRUE SCALE everywhere (the section is 45 m tall from the roof to the machine's invert: it fits a
// vertical frame) — except the settlement gauge (RULER), an instrument that magnifies the millimetres (×50).
//
// THE AXES
//   y = 0     the road's surface (the carriageway); the sidewalks stand 15 cm above it
//   x         along the street AND the tunnel: the machine advances toward −x (its cutterhead face at x = 0)
//   z         across the street: z = 0 the street's axis = the tunnel's axis; +z the camera's side (the near
//             sidewalk, open: no building there), −z the far side (the six-storey building, its front on z = −650)
//
// AZIMUTH (kit/lib/stage.js: the camera stands at t + d·(sin az·cos el, sin el, cos az·cos el)) — checked on the stubs:
//   az 0      the camera on the +z side, looking toward −z: the section in profile, the machine advancing to the LEFT
//   az −90    the camera on the −x side, ahead of the machine, looking toward +x: the cutterhead face-on
//   az −40    front-left three quarters (the key light comes from −x, +y, +z): film between az −20 and −70
//   az −140   rear-left three quarters: the thrust rams, the last ring, the screw's outlet
//
// SCALE HONESTY (episode.json → sources): the street, the building, the soil and its layers, the water table are a
// SCENARIO (illustrative: no real address, no real borehole); the machine follows the ministry's EAE paper (line 16,
// lot 1) and Implenia (L15 Sud T2C); the cover of 11 m is the most sensitive passage of L15 Sud T3C (Soletanche
// Bachy). NO length, depth or pressure is ever written on screen except what the voice says (presque dix mètres,
// un bar tous les dix mètres, environ un centimètre, 2 / 5 / 7 / 8 millimètres). Never a pressure at the face.

export const DEG = Math.PI / 180;

/* ───────────────────────────── the machine (model.js) ───────────────────────────── */
/** The cover above the crown: 11 m (L15 Sud T3C, its most sensitive passage). */
export const COVER = 1100;
/** The shield: Ø 9.83 m, 11.1 m long (EAE line 16); the cutterhead's face on x = 0, the machine toward +x. */
export const TBM = {
  r: 491, //            the shield's outer radius (Ø 9.83 m)
  axisY: -(COVER + 491), // −1591: the tunnel's axis
  length: 1110, //      the shield, from the cutterhead's face to the tail skin
  // the cutterhead (roue de coupe): ~9.8 m, spokes, disc cutters and scrapers; it turns (`wheel`, turns)
  head: { x0: 0, x1: 85, r: 488, spokes: 6, cutters: 111, scrapers: 26 },
  // the excavation chamber (chambre d'abattage), between the head and the bulkhead: full of earth (`earth`)
  chamber: { x0: 85, x1: 240 },
  // the pressure bulkhead (cloison étanche) and its pressure sensors; the manometer stands on a bracket at the
  // near cut (+z), facing the camera's side, so that it reads in every three-quarter shot of the chamber
  bulkhead: { x0: 240, x1: 300, sensors: 5, gauge: [372, -1591 + 230, 344], gaugeR: 42 },
  // the screw conveyor (vis d'extraction): from the chamber's floor up through the bulkhead to the back
  screw: { from: [190, -1591 - 360, 0], to: [1330, -1591 + 140, -60], r: 46 },
  // the thrust rams (vérins de poussée): 14 pairs on a ring, their shoes on the last ring; `rams` 0 → 1 = their stroke
  rams: { pairs: 14, r: 420, x0: 560, x1: 1040, stroke: 180 },
  // the erector arm, between the rams (it lays the segments under the tail skin's shelter)
  erector: { x: 960, r: 330 },
  // the LAST RING laid (dernier anneau): seven segments (sept voussoirs), lit one by one (`ring` 0 → 7)
  ring: { x0: 1040, x1: 1220, rOut: 472, rIn: 435, segments: 7 },
};
/** Where a point of the machine sits on the bench: BENCH_FROM goes to the bench's origin (the shield's invert, mid-length). */
export const BENCH_FROM = [610, TBM.axisY - TBM.r, 0];
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SYSTEM = { size: 650, centre: [610, TBM.axisY, 0] };
/** The exploded view (`explode` 1): how far each part moves, in cm along +x / up (a diagonal row, read from az ≈ −65). */
export const EXPLODE = { head: [-520, 0, 0], chamber: [-180, 0, 0], bulkhead: [120, 0, 0], screw: [380, 420, 0], rams: [620, 0, 0], ring: [900, 0, 0] };

/* ───────────────────────────── the ground (sol.js) ───────────────────────────── */
export const GROUND = {
  x0: -3600, x1: 4600, //   the block of soil, cut along z = z1 (the camera's side: the section's face)
  z0: -1400, z1: 650,
  top: -60, bottom: -3000, // under the road's slab (rue.js owns 0 → −60)
  layers: [-320, -880, -1450, -2350], // the strata's lines (illustrative: no names on screen)
  water: -520, //           the water table (illustrative)
  face: 0, //               the soil's face, touching the cutterhead
  // the loosened column (`loose`): from the face up to the road, a little ahead of the machine
  loose: { x0: -620, x1: 260, topWidth: 1500 },
  // the depth scale (`depth`): ticks every 10 m down the section's face, near the machine's front, at x = −900
  scale: { x: -640, z: 650, step: 1000, from: 0, to: -2000 },
  // the tunnel already lined, behind the machine: rings from the last one (TBM.ring.x1) to the block's end
  lining: { x0: 1220, x1: 4600, width: 180 },
};

/* ───────────────────────────── the street (rue.js) ───────────────────────────── */
export const STREET = {
  x0: -4200, x1: 4800,
  carriage: 350, //         the carriageway: z −350 → 350, two lanes
  walk: 650, //             the sidewalks: z ±350 → ±650, 15 cm high
  slab: [8, 60], //         the asphalt's thickness, and the whole road's (asphalt + base) under y = 0
  lane: 175, //             the car's lane: z = +175 (the near one), driving toward −x
};
/** The six-storey building on the far side: ground floor + six storeys + the roof (combles), one cellar. */
export const BUILDING = { x0: -1500, x1: 600, zFront: -650, zBack: -1850, floor: 300, levels: 7, roof: 2400, cellar: -320 };
/** The bedroom of the one who sleeps (like): 022's chambre, mounted on the 2nd floor behind the front, its window lit. */
export const BEDROOM = { at: [-420, 2 * 300, -1050], window: [-420, 2 * 300 + 150, -650] };
/** The car: 011's car of glass, nose toward −x, in the near lane; `carX` (cm) is where its centre stands. */
export const CAR = { z: STREET.lane, y: 0 };
/** The settlement trough at the surface: a Gaussian across (iz) and along (ix), its deepest point just ahead of the face. */
export const TROUGH = { x: -250, z: 0, ix: 700, iz: 850 };
/** The settlement gauge (une règle d'un centimètre): a staff on the near kerb above the face. MAGNIFIED ×50: 1 mm of
 *  settlement moves its index 5 cm; graduated 0 → 12 mm, its red band from 10 mm (« environ un centimètre »). */
export const RULER = { at: [-250, 15, 395], height: 70, gain: 50, max: 12, red: 10 };
/** The neighbourhood seen from above (comment): blocks of glass along the street, the tunnel's trace dashed under them. */
export const TOWN = { x0: -12000, x1: 12000, z0: -9000, z1: 9000, block: 2600, street: 1100 };
/** The night sky above the street (abo, boucle): the satellite crosses it high, a small solid point with its trail. */
export const SKY = { satY: 60000, from: [-30000, 60000, -40000], to: [30000, 60000, -40000] };
