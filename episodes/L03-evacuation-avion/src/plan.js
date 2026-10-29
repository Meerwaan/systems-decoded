// DOSSIER L03 — Évacuation d'un avion : the plan of the sets. Centimetres, y up. NO IMPORT here: avion.js, cabine.js,
// model.js and world.js all read it — it is what lets them be built at the same time.
//
// THREE PLACES, one shown at a time (world.js · SET):
//   · PISTE   the airliner seen like an X-ray from OUTSIDE, at its TRUE scale, standing on the ground (y = 0 is the
//             ground). THREE VARIANTS (`variant`): the A350-900 (Tokyo 2024, and the certification trial), the A380
//             (Hamburg 2006, two decks), the Boeing 737-200 (Manchester 1985). FOUR SITES (`site`): Haneda's runway at
//             night · the trial hangar · Manchester's runway in the morning · an apron at night (the jet bridge).
//   · CABINE  the INSIDE, at night: the aisle(s), the rows, the passengers of glass, the floor line, the door seen
//             from inside with its lever, the smoke. Two LAYOUTS (`layout`): wide-body (A350, two aisles) and
//             narrow-body (737, one aisle, the overwing hatch). Its floor is y = 0.
//   · BENCH   the matt bench of the shorts: the slide pack and its insides, the 16 g seat on its sled, the cushion
//             and the burner, the documents of the rule, twenty figurines. One ITEM at a time, at the origin.
//
// THE PLANE'S FRAME (avion.js) — as in 023: the plane stands still and the world comes to it (the runway slides
// with `run`, the plane rises with `alt`): the camera poses stay true all film long. Its NOSE points to −x, up is +y,
// its LEFT side faces +z — the camera's side (az −20 … −70 stands at −x / +z: front-left three quarters, where the key
// light falls). So the LEFT doors (1L … 4L) face the camera, the RIGHT ones are seen through the glass.
// THE CABIN'S FRAME (cabine.js) — the same orientation: forward is −x, the LEFT wall is +z. The front left door (1L)
// is at x = 0 on the +z wall; the rows run aft toward +x. Passengers face −x.
// stage.js: az 0 puts the camera on +z (it sees the left flank), az −90 on −x (it sees the nose), az 90 on +x (it
// looks forward along the cabin), az 180 on −z (inside the cabin, it looks at the left wall: the door).
//
// No length of any model is ever written on screen: the voice gives the numbers (27 cm, 22 kg, 1,20 m are SAID).

/* ───────────────────────── PISTE — the planes, true scale (rounded) ───────────────────────── */
/**
 * One entry per variant. Fuselage: a tube along x from `nose` to `tail`, its axis at `axis` above the ground, radius
 * `r` (the A380's section is taller than wide: `h` is its full height, `r` its half-width). `floor`: the cabin floor
 * above the ground (the sill of the main-deck doors stands there); `upper`: the A380's upper deck floor.
 * `wing`: where the wing root's leading edge meets the fuselage (x), its span, its sweep (degrees).
 * `engines`: their x (inlet lip) and z (± spanwise; the 737 and the A350 have two, the A380 four), the nacelle's
 * radius and length, the height of its axis above the ground.
 * `doors`: the exits, as [id, x, deck] — deck 0 main, 1 upper; each exists on both sides (L = +z, R = −z), but the
 * 737's overwing exit (`W`) is a hatch, not a door. `door`: their clear width and height.
 */
export const PLANES = {
  a350: {
    nose: -3340, tail: 3340, axis: 560, r: 298, floor: 470,
    wing: { x: -700, span: 6475, sweep: 31, root: 1100, tip: 260 },
    engines: { x: -1300, z: [1040], r: 150, len: 560, y: 330 },
    tailFin: 1400, // fin height above the fuselage top
    doors: [["1", -2700, 0], ["2", -1300, 0], ["3", 750, 0], ["4", 2550, 0]],
    door: { w: 107, h: 193 },
  },
  a380: {
    nose: -3635, tail: 3635, axis: 700, r: 357, h: 840, floor: 520, upper: 790,
    wing: { x: -1100, span: 7980, sweep: 33, root: 1700, tip: 400 },
    engines: { x: -1700, z: [1550, 2600], r: 150, len: 600, y: 380 },
    tailFin: 1500,
    doors: [["M1", -3000, 0], ["M2", -1700, 0], ["M3", -350, 0], ["M4", 1400, 0], ["M5", 2700, 0], ["U1", -2050, 1], ["U2", 200, 1], ["U3", 2250, 1]],
    door: { w: 107, h: 193 },
  },
  b737: {
    nose: -1525, tail: 1525, axis: 300, r: 188, floor: 255,
    wing: { x: -350, span: 2840, sweep: 25, root: 470, tip: 120 },
    engines: { x: -500, z: [470], r: 70, len: 420, y: 150 }, // the long thin JT8D under the wing
    tailFin: 600,
    doors: [["1", -1150, 0], ["W", 120, 0], ["2", 1250, 0]], // W: the overwing hatch (51 × 91 cm, its sill 50 cm above the floor)
    door: { w: 86, h: 183 },
  },
};
export const VARIANT = { A350: 0, A380: 1, B737: 2 };
export const VARIANT_KEY = ["a350", "a380", "b737"];

/**
 * The slides: from the sill of an open door down and OUT (+z on the left side, −z on the right) to the ground.
 * `reach` is how far the foot lands from the fuselage's side (main deck); the A380's upper deck slides reach further.
 * `w` the slide's width (a double lane), `tube` the radius of its side tubes. They are SOLID (yellow-grey in life:
 * here a light warm grey), the only solid things of the outside with the fire.
 */
export const SLIDE = { reach: 1050, reachUpper: 1700, w: 180, tube: 22, reach737: 600 };

/**
 * Which doors each SITE opens (`doorA`, `doorB`, `doorC` in world.js · FIRST: 0 → 0.3 the door swings out,
 * 0.3 → 1 its slide drops, unrolls and stands), and which ones stay SHUT (`shut` 0 → 1 marks them: signal with the
 * fire behind at Haneda; dark ink and crossed — condemned — in the hangar). Ids are door + side ("1L", "U2R", "WR").
 */
export const OPEN = {
  // 0 · Haneda, 2 January 2024 (A350): the two front doors, then the fourth on the left, much later; five stay shut
  haneda: { A: ["1L", "1R"], B: ["4L"], C: [], shut: ["2L", "3L", "2R", "3R", "4R"] },
  // 1 · the hangar of the trial: ONE DOOR OF EACH PAIR — the reconstruction opens the left side (camera side), the
  //     right side is condemned (A350: 4 of 8; A380: 8 of 16). Which ones Airbus used is not sourced: never said.
  hangar: { A: ["1L", "2L", "3L", "4L", "M1L", "M2L", "M3L", "M4L", "M5L", "U1L", "U2L", "U3L"], B: [], C: [], shut: ["1R", "2R", "3R", "4R", "M1R", "M2R", "M3R", "M4R", "M5R", "U1R", "U2R", "U3R"] },
  // 2 · Manchester, 22 August 1985 (737): front left after ≈ 25 s, the right overwing hatch after ≈ 45 s, front right
  //     jammed (a fault of its slide) ≈ a minute; the fire is on the LEFT (camera side), from the left engine
  manchester: { A: ["1L"], B: ["WR"], C: ["1R"], shut: [] },
  // 3 · an apron at night (the slide explained, the crew disarms, Dubai / Denver's bags): the front left door only
  apron: { A: ["1L"], B: [], C: [], shut: [] },
};
export const SITE = { HANEDA: 0, HANGAR: 1, MANCHESTER: 2, APRON: 3 };

/** The runway (Haneda 34R, Manchester): along x, centred on z = 0, its edge and centre lamps every `pitch`. */
export const RUNWAY = { w: 6000, pitch: 3000, len: 400000 };
/** The trial hangar (Hamburg; any certification trial): an X-ray hall around the plane; dark — only the emergency lights. */
export const HANGAR = { len: 11000, w: 12000, h: 3000 };
/** The apron at night: the terminal's glass front at z = −4500 (behind the plane), the jet bridge reaching door 1L. */
export const APRON = { terminal: -4500, bridge: { from: [-2700, 470, 2600], len: 2200 } };
/**
 * Tokyo: the coast guard's Dash 8 stands on the runway ahead of the landing A350. The runway slides toward
 * +x as `run` grows, and the Dash 8 stands at x = DASH.x + run − 2·DASH.hit in the plane's frame: ahead of the nose
 * until run = DASH.hit, where its tail touches the nose (world.js · runAt lands that on « percutent »). Its size: a small X-ray twin turboprop (`len`, `span`).
 */
export const DASH = { x: -60000, hit: -56660, len: 2270, span: 2740 };
/**
 * The landing (a model, never displayed): `alt` (cm above the runway) on the approach shots; the plane runs at
 * ≈ `speed` cm/s (`run` grows by that much per second); it touches down at run = `touchRun` (alt 0), reaches the
 * Dash 8 at run = DASH.hit, then slides and stops. `run0`: run at the first approach shot (c4's last plan).
 */
export const APPROACH = { alt: 6000, speed: 7000, run0: -200000, touchRun: -110000 };
/** Where the evacuees gather (Haneda: the grass on the left, far from the fire): a field of small figures. */
export const GATHER = { at: [-1500, 0, 5200], r: 1600, n: 379 };

/* ───────────────────────── CABINE — the inside (floor y = 0) ───────────────────────── */
/**
 * `w` the cabin's inner width at the armrests, `h` the ceiling at the centre, `bins` the height of the overhead bins'
 * lower edge. Rows from `x0`, every `pitch`, `rows` of them. `blocks`: the seat blocks (z from → to), `aisles` their
 * centres (z). `door`: 1L at x = 0 on the LEFT wall (z = +w/2), clear width × height, its sill at the floor; the
 * slide pack lives in the door's lower inner part (the bustle). Narrow: `hatch` the right overwing exit (−z wall),
 * at row `hatchRow`, its sill 50 cm up; `passage` the gap to reach it between the seatbacks (27 cm, SAID).
 */
export const CAB = {
  wide: { w: 560, h: 250, bins: 175, x0: 300, pitch: 81, rows: 16, blocks: [[170, 275], [-75, 75], [-275, -170]], aisles: [123, -123], door: { x: 0, w: 107, h: 193 } },
  narrow: { w: 354, h: 215, bins: 160, x0: 280, pitch: 81, rows: 16, blocks: [[50, 170], [-170, -50]], aisles: [0], door: { x: 0, w: 86, h: 183 }, hatch: { row: 7, w: 51, h: 91, sill: 50 }, passage: 27 },
};
export const LAYOUT = { WIDE: 0, NARROW: 1 };
/** The smoke: its lower edge goes down from the ceiling; `smoke` 1 = it reaches `line` (1,20 m, SAID); 1.5 = `low`. */
export const SMOKE = { line: 120, low: 60 };
/** You: seated in the wide cabin, left block, aisle seat, row `row` (facing −x); your bag under the seat in front. */
export const YOU = { row: 6, z: 175 };
/** The crew member at the front (the megaphone, the door): standing at the door's forward edge. */
export const CREW = { at: [-60, 0, 180] };

/* ───────────────────────── BENCH — one item at a time, at the origin ───────────────────────── */
/** The light stands around the item: `size` ≈ its radius (cm), for the stage's `scale` and the bench's pool. */
export const BENCH = { size: 90 };
export const ITEM = { PACK: 0, SEAT: 1, CUSHION: 2, DOC: 3, TWENTY: 4 };
/**
 * The slide pack (a folded slide in its fabric case) as it sits in the BUSTLE, the lower inner part of the door: an
 * upright slab `l` long (local x), `h` high (y), `t` thick (z). Its local +z faces the CABIN (the side you see from
 * the aisle); the girt bar runs along its lower +z edge (toward the floor brackets at the sill); the bottle lies along
 * its top, the two aspirators stand on its top face. On the bench it stands the SAME way on a low cradle (`y`), its
 * +z face toward the camera: the cut from the door to the bench keeps the object at the same place of the picture
 * (world.js · benchFromCabin turns the pose by 180°: in the cabin the bustle faces −z).
 */
export const PACK = { l: 100, h: 45, t: 32, y: 12, bottle: { l: 62, r: 9 }, asp: { r: 8, l: 28, n: 2, gap: 46 }, girt: { l: 110, r: 1.6 } };
/** The inflating section (the slide's head tube behind an aspirator): its length and full radius. */
export const TUBE = { l: 160, r: 22 };
/** The 16 g seat: a triple row (`w`) on a sled that runs along +x on two rails (`run`: the launch before the stop). */
export const SEAT = { w: 150, h: 112, run: 400 };
/** The cushion test: the cushion on its stand, the burner's nozzle `gap` in front of it. */
export const BURNER = { gap: 10 };
/**
 * The documents of the dossier, placed on the bench in our style (paper, ink, a veille highlight; NO logo, NO
 * agency name drawn as a mark). `doc` in world.js picks one (1-based), `hl` sweeps its highlighted lines in order.
 */
export const DOCS = [
  { year: "1965", title: "Démonstration d'évacuation", big: "2 MINUTES", lines: ["Les compagnies doivent prouver", "qu'elles vident l'avion", "avec la moitié des sorties"] },
  { year: "1967", title: "Certification des avions", big: "90 SECONDES", lines: ["La règle entre dans la certification", "Dans le noir · la moitié des sorties", "Elle n'a plus bougé"] },
  { year: "1978", title: "Analyse et essais", big: "LE CALCUL", lines: ["Un calcul appuyé sur des essais", "peut remplacer le grand essai"] },
  { year: "1991", title: "Le même jour", big: "2 ESSAIS RATÉS", lines: ["Cette année-là", "un volontaire gravement blessé"] },
  { year: "2006", title: "Décembre · A380", big: "CERTIFIÉ", lines: ["Europe", "États-Unis"] },
  { year: "1984", title: "Repérage lumineux près du plancher", big: "EN BAS", lines: ["Une ligne de lumière", "jusqu'aux sorties"] },
  { year: "2025", title: "Information de sécurité aux compagnies", big: "LES BAGAGES", lines: ["Une évacuation plus lente", "Plus de blessés", "Des vies en jeu"] },
];
export const DOC = { w: 60, h: 80 }; // a sheet lying on the bench, tilted toward the camera
