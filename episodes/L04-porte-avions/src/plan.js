// DOSSIER L04 — Le pont d'envol du Charles de Gaulle (format long, 16:9) : the plan. Centimetres, y up. NO import here:
// navire.js, model.js, bord.js and world.js all read it — it is what lets the three sets be built at the same time.
//
// THE FRAME IS THE SHIP'S (as in 015): the flight deck is y = 0, the BOW is toward −z, STARBOARD (the island) is +x,
// PORT (where the angled deck overhangs the sea) is −x. The origin is amidships, on the centreline, at deck level.
// The camera mostly stands on the port / aft side (az −20 … −70: the key light comes from −x, +y, +z). In stage.js,
// az 0 puts the camera ASTERN of its target looking toward the bow, az −90 to PORT looking starboard, az 180 AHEAD.
// The whole ship (hull, deck, catapults, wires, aircraft on deck, crew) heels together around the roll axis
// (ROLL): the sea and the sky stay level (world.js).
//
// It is a MODEL of the Charles de Gaulle at its true scale, not a survey: the voice gives the real figures (261.5 m,
// 42 000 t, 75 m of catapult, a hangar of ≈ 4 000 m² and 6 m high, two lifts of 36 t), the picture never displays a
// length of its own. Divergent figures (the masses: 240 to 520 t) are never drawn as a number: "plusieurs centaines".

const DEG = Math.PI / 180;

/** The ship. */
export const SHIP = {
  len: 26150, //       261.5 m (Marine nationale)
  bow: -13075, //      the stem, at deck level
  stern: 13075, //     the transom / the round-down
  sea: -1650, //       the waterline, below the deck (the flight deck stands ≈ 16.5 m above the water)
  keel: -2590, //      9.4 m of draught
  halfWL: 1575, //     half the beam at the waterline (31.5 m)
  /** The flight deck seen from above, [x, z], clockwise from the port quarter (simplified CDG outline: the angled
   *  deck overhangs to port forward of amidships, the island and the two deck-edge lifts to starboard). */
  deck: [
    [-1400, 13075], [1500, 13075], [1900, 9000], [2300, 6000], [2300, -1000], [2000, -6000], [1200, -10500], [400, -12600],
    [0, -13075], [-500, -12600], [-1300, -10500], [-2000, -8200], [-3350, -6650], [-3550, -5000], [-3050, 0], [-2400, 6000], [-1800, 10500],
  ],
  slab: 60, //         the flight deck's thickness (its edge, drawn)
};
/** The axis the whole ship heels around (the waterline, on the centreline): `heel` degrees, positive = starboard DOWN. */
export const ROLL = { y: SHIP.sea, z: 0 };

/** The angled deck: the landing runway (≈ 195 m, at 8.5° to port of the keel) — Naval Technology. */
export const ANGLED = { origin: [300, 0, 12800], skew: 8.5, len: 19500, half: 1300 };
const SK = Math.sin(ANGLED.skew * DEG);
const CK = Math.cos(ANGLED.skew * DEG);
/** Along the angled runway: its direction (forward, toward the port bow) and its right hand (toward starboard). */
export const ANGLED_DIR = [-SK, 0, -CK];
export const ANGLED_RIGHT = [CK, 0, -SK];
/** A point of the angled deck: `s` cm from the round-down along its axis, `off` cm to starboard of it, `y` up. */
export const onAngled = (s, off = 0, y = 0) => [ANGLED.origin[0] + s * ANGLED_DIR[0] + off * ANGLED_RIGHT[0], y, ANGLED.origin[2] + s * ANGLED_DIR[2] + off * ANGLED_RIGHT[2]];
/** The heading of the angled runway, as a rotation.y (the aircraft's nose toward −z is 0). */
export const ANGLED_YAW = ANGLED.skew * DEG; // turning −z toward −x is a positive rotation about y

/**
 * The two steam catapults (C13-3 type, 75 m of stroke): ONE in the bow, along the keel (the film's: you are launched
 * from it), ONE on the angled deck ("posée… sur la piste où tu vas te poser"). `from` is where the shuttle waits (the
 * aircraft's NOSE-GEAR tow point at launch), `to` 75 m ahead; `dir` the way it throws.
 */
export const STROKE = 7500;
export const CAT = [
  { name: "avant", from: [-200, 0, -5500], dir: [0, 0, -1], yaw: 0 },
  { name: "oblique", from: onAngled(11800), dir: ANGLED_DIR, yaw: ANGLED_YAW },
].map((c) => ({ ...c, to: [c.from[0] + STROKE * c.dir[0], 0, c.from[2] + STROKE * c.dir[2]] }));
/** On the bow catapult's line the deck ends 73.8 m ahead of `from` (model.js): the shuttle stops in its water brake at
 *  SHUTTLE_STOP m (the stroke drawn is 70.4 m, the voice says 75: nobody measures it on the picture). A chapter tweens
 *  `shuttle` up to SHUTTLE_STOP and puts `hooked` to 0 THERE: your aircraft then goes on alone (`run`), and starts to
 *  climb past BOW_EDGE. */
export const SHUTTLE_STOP = 70.4;
export const BOW_EDGE = 73.8;
/** A point along a catapult: `s` cm from where the shuttle waits (negative: astern of it, where the aircraft taxis). */
export const onCat = (i, s, y = 0) => [CAT[i].from[0] + s * CAT[i].dir[0], y, CAT[i].from[2] + s * CAT[i].dir[2]];
/**
 * Under each catapult, in its own frame (the trough runs along its `dir`): two cylinders side by side, a piston in
 * each, the shuttle riding on them through the slot, the water brake at the far end. Sizes in cm.
 */
export const TROUGH = {
  y: -95, //         the cylinders' axis, under the deck
  r: 27, //          a cylinder's radius (≈ 21 in bore, outer skin a little more)
  gap: 46, //        half the distance between the two cylinders' axes (left −gap, right +gap)
  aft: -200, //      where the cylinders begin, cm astern of `from` (the launch valve's end)
  fore: STROKE + 350, // where they end (the water brake), cm ahead of `from`
  slot: 6, //        the slot's half-width in the deck
  shuttle: [60, 22, 220], // the shuttle's size (x, height above the deck, length)
  depth: 170, //     the trough under the deck (for navire.js to leave room: nothing of the hull crosses it)
  halfW: 140,
};
/** The holdback bar: from the aft face of the nose gear back to its deck fitting (the calibrated piece in its middle). */
export const HOLDBACK = { len: 230, piece: 0.55, deckZ: 260 }; // deck fitting `deckZ` cm astern of `from`; the piece at 55 % of the bar from the gear
/** The steam receiver ("un grand ballon", 54 m³ at 30 bar — Journal de l'Aviation) and the launch valve, for the bow catapult. */
export const TANK = { at: [-200, -1050, -3700], r: 150, len: 760 }; //   lying along z, astern of the cylinders' aft end, deeper
export const VALVE = { at: [-200, -420, -5250], r: 55 }; //              between the receiver and the cylinders
/** The catapult's control cabin, "à côté de la catapulte, au ras du pont" (its top just above the deck). */
export const CABIN = { at: [520, 0, -5750], size: [300, 150, 220], top: 55 }; // a sunken box: its glazed top `top` cm above the deck
/** The jet blast deflector of the bow catapult: a panel that rises from the deck behind the nozzles. */
export const JBD = { z: -5500 + 1650, half: 600, h: 300 };

/** The three arresting wires, across the angled deck, astern (Athéna · Aphrodite · Andromède, from the stern). */
export const BRINS = { s: [3600, 4800, 6000], half: 1100, lift: 9, names: ["Athéna", "Aphrodite", "Andromède"] };
/** The brake under the deck, for each wire (the film details Andromède's): along the runway's right hand, under the wire. */
export const ENGINE = { y: -430, len: 1500, r: 70 };
/** The touchdown: `run` 0 of track 3 puts the NOSE-WHEEL point (the aircraft's origin) at s = TOUCH.s, the wheels on the deck;
 *  the hook's tip is then RAFALE.hook cm astern, before Athéna. The glide slope the mirror shows: ≈ 3.5° (a model value,
 *  never displayed). hookRun(i): the `run` at which the hook's tip crosses wire i (0 Athéna 12.9 m · 1 Aphrodite 24.9 m ·
 *  2 Andromède 36.9 m) — the film's landing skips the first two and takes the third. */
export const TOUCH = { s: 3400, glide: 3.5 };
/** The landing mirror (an optical landing system), on the port edge of the runway, facing the aircraft that comes. */
export const MIRROR = { at: onAngled(5200, -1950), h: 320, arm: 480, cells: 12 };
/** The landing signal officer's platform, on the port edge, aft of the mirror. */
export const LSO = { at: onAngled(2700, -2050, -40) };

/** The island (starboard, forward of amidships) and its mast. */
export const ISLAND = { x: [1750, 2550], z: [-4300, -1300], h: 1700, mast: 3600 };
/** The two deck-edge lifts, starboard, aft of the island (36 t each: two aircraft). `y` from the deck (0) to the hangar floor. */
export const LIFTS = [
  { x: [2300, 3550], z: [-100, 1800] },
  { x: [2300, 3550], z: [2700, 4600] },
].map((l) => ({ ...l, down: -680 }));
/** The hangar (≈ 138 × 29 m, ≈ 6 m high), under the flight deck; the fire curtain across it. */
export const HANGAR = { x: [-1450, 1450], z: [-6500, 7300], floor: -680, ceil: -80, curtain: 600 };
/** The anti-heel masses: rails ACROSS the hull, below the hangar, in two groups; a block rolls from port to starboard. */
export const MASSES = { y: -1180, rows: [-3500, -3000, -2500, 2100, 2600, 3100], half: 1250, travel: 1050, block: [300, 200, 220] };
/** The cut across the hull for the section shots (`cutaway`): just ahead of the first row of masses (its block stays
 *  whole). navire.js discards what is ahead of it; model.js and bord.js do not — on a section shot the chapter puts
 *  what stands ahead of CUT.z out of the picture: { under: 0, explode: 0, press: 0, tank: 0, parked: 0, next: 0, jet: 0, dog: 0, crew: 0 }. */
export const CUT = { z: MASSES.rows[0] - 180 };
/** The stabiliser fins (two pairs) and the rudder(s), under the hull. */
export const FINS = { y: -2300, z: [-3500, 3500], span: 380, rudder: [0, -2000, 12200] };
/** The nuclear steam plant (two reactors amidships, low), the steam main forward to the catapults' receivers. */
export const PLANT = { reactors: [[-520, -2050, 900], [520, -2050, 900]], r: 260, h: 700, main: [[0, -1500, 900], [0, -1500, -3700], [-200, -1050, -3700]] };
/** The aviation fuel holds (signal when lit), low, forward and aft. */
export const FUEL = [[0, -2250, -8000], [0, -2250, 7000]];
/** Your parking spot after landing / the aircraft parked on deck (x, z, yaw°: nose toward −z is 0). */
export const PARK = [
  [1500, 7000, -60], [1500, 8600, -60], [1500, 10200, -60], [1600, -7600, 30], [900, -9100, 30],
];
/** The Pedro helicopter, hovering abeam to port (the ship's frame: it keeps station). */
export const PEDRO = { at: [-9000, 2600, -2500] };
/** The deck crew's marks: your yellow dog in front of the nose on the bow catapult, the others clear of it. */
export const CREW = {
  dog: [-950, 0, -7300], //   ahead and to port of your nose, facing the aircraft (+z)
  others: [[900, 0, -6400], [-1100, 0, -4300], [1300, 0, -3300], [-1700, 0, 2000]],
};

/** The aircraft (bord.js), a single-seat Rafale M — measured on 015's model: along its axis, its OWN frame has its
 *  origin on the deck under the NOSE-WHEEL axle, the nose toward −z. The hook's tip is `hook` cm astern of it. */
export const RAFALE = { length: 1535, span: 1088, nose: -354, mains: 530, hook: 1086, tail: 1215, cockpit: [0, 250, 44], tow: [0, 20, -50] }; // tow: the launch bar's tip down in the hook's notch (model.js · cats[0].A.croc = onCat(0, 50, 20))

export const hookRun = (i) => (BRINS.s[i] - TOUCH.s + RAFALE.hook) / 100;

/** Where the aircraft is in the ship's frame, and its heading (rotation.y), for the three tracks of `track`:
 *   1  the bow catapult: `run` m from the shuttle's start (negative: taxiing up to it); past 75 m it climbs away
 *   2  in the air, ahead of the ship: `run` m from the bow, `alt` m up (the far shots: "un trait sur la mer", the tanker)
 *   3  the angled runway: `run` m from the touchdown point (negative: on the approach, ON the glide slope; positive:
 *      rolling forward on the deck — or, with `alt` > 0, going around above it)
 * Writes into `out` = [x, y, z, yaw, pitch°] (no allocation). */
export function jetAt(track, run, alt, out) {
  const m = 100;
  if (track === 1) {
    const c = CAT[0];
    const s = run * m;
    const air = Math.max(0, run - BOW_EDGE); //             metres past the bow
    out[0] = c.from[0];
    out[1] = (air * 0.09 + alt) * m; //                     a shallow climb-out
    out[2] = c.from[2] - s;
    out[3] = 0;
    out[4] = Math.min(9, air * 0.6);
  } else if (track === 2) {
    out[0] = CAT[0].from[0] - run * m * 0.12; //           a slight turn to port as it goes
    out[1] = alt * m;
    out[2] = SHIP.bow - run * m;
    out[3] = 0.12;
    out[4] = 4;
  } else {
    const s = TOUCH.s + run * m;
    const glide = run < 0 ? -run * m * Math.tan(TOUCH.glide * DEG) : 0;
    out[0] = ANGLED.origin[0] + s * ANGLED_DIR[0];
    out[1] = glide + alt * m;
    out[2] = ANGLED.origin[2] + s * ANGLED_DIR[2];
    out[3] = ANGLED_YAW;
    out[4] = run < 0 ? 5 : alt > 0 ? 7 : 0;
  }
  return out;
}

/** The bench (the établi of the shorts): what stands there, one at a time (`item`), at its origin. */
export const BENCH = {
  size: 150, //   ≈ the radius the light stands around (the holdback bar, the valve)
  items: ["holdback", "board", "emals", "forrestal", "ely"], // 0 … 4: who builds each — model.js 0, 2, 4 · bord.js 1, 3
  board: [150, 340], // the deck-plan table: its size on the bench (x, z) — long along z, the bow toward −z, as the ship seen from above
};
