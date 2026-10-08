// DOSSIER 008 — Paratonnerre : the plan of the set. Centimetres, y up, the ground is y = 0, the house
// stands on the origin, its ridge along x. No import here: house.js, bolt.js, model.js and world.js all
// read it — it is what lets them be built at the same time.
//
// The camera mostly stands on the −x / +z side (az −20 … −70), where the key light falls: the front of
// the house is its +z wall, the gable we see is the −x one, and the lightning rod stands on that end
// of the ridge with its conductor coming down in full view.
//
// THE SKY IS A STUDIO MODEL, at the scale of the house: a house 8 m tall and a junction 60 m above it do
// not hold in one upright frame (tried: the house was 248 px, or the leader's head out of the picture). The
// cloud hangs at 60 m, a bound is 2.5 to 4 m, the junction is 4.2 m above the tip of the rod. The film never
// shows a height or a length on a picture of the sky; what the voice says (bounds of about 50 m, a few tens
// of metres for the last gap) stays true to the sources, and episode.json says so under "sources".

/** The house: two storeys, a gable roof. Walls from x0 to x1 and z0 to z1; the roof overhangs by `over`. */
export const HOUSE = { x0: -450, x1: 450, z0: -350, z1: 350, floor1: 270, eave: 520, ridge: 820, over: 40 };
/** The height of the roof's +z slope above z (0 on the ridge … z1 + over at its edge). */
export const roofY = (z) => HOUSE.ridge - ((HOUSE.ridge - HOUSE.eave) * Math.abs(z)) / HOUSE.z1;

/** What else points at the sky: each of them answers the leader, none of them is earthed like the rod. */
export const CHIMNEY = { x: 210, z: -110, w: 62, top: 935 };
export const ANTENNA = { x: 70, z: 0, top: 1000 }; // a rake antenna on a mast, on the ridge
export const TREE = { x: 1350, z: -250, top: 960, crown: 300 }; // in the garden, 9 m from the house

/** The lightning rod, at its place on the house. `run`: the conductor, point by point, from the foot of the mast to the foot of the stake. */
export const ROD = {
  foot: [-400, HOUSE.ridge, 0],
  tip: [-400, 1220, 0], // 4 m above the ridge: 2.2 m above everything else up there
  run: [
    [-400, HOUSE.ridge, 0], // the foot of the mast
    [-400, roofY(388), 388], // down the +z slope to its edge
    [-400, 470, 356], // back to the wall, under the eave
    [-400, 0, 356], // down the front wall (the test joint is on this stretch)
    [-400, -50, 420], // underground, to the head of the stake
    [-400, -300, 420], // the stake: 2.5 m of metal driven into the earth
  ],
  joint: [-400, 190, 356], // the test joint, 1.9 m above the ground
};

/**
 * "Toi": inside, standing at the front window; and — for the sentences that say so — outside, on the lawn, between
 * the house (the shelter) and the tree (the trap): one frame holds the three of them.
 */
export const YOU = { inside: [-80, 0, 185], outside: [900, 0, 520] };
export const WINDOW = { x0: -190, x1: 30, y0: 95, y1: 225 }; // in the +z wall, ground floor

/** The sky (a model: see above). The stepped leader comes down from `from`, from behind the house, to the junction. */
export const SKY = { base: 6000 };
export const LEADER = {
  from: [1950, SKY.base, -890],
  junction: [-370, 1640, 40], // where the rod's own leader meets it: 4.2 m above the tip on the picture
  bounds: 14, // (bolt.js draws them: bound k has landed when `leader` = k / 14)
  first: 9 / 14, // how far down its path it is on the first frame…
  held: 10 / 14, // …and once the hook's bound is made (0.12 s into the film): where time stops, four bounds from the junction
};
