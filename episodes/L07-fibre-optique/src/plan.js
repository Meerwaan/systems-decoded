// DOSSIER L07 — La fibre optique : the numbers every set reads, in centimetres, Y up — NO import, so that the three
// sets (fibre.js, fabrique.js, voyage.js) are built at the same time against it. Written by the architect.
//
// FOUR PLACES, one shown at a time (world.js · SET), each with its OWN origin (0, 0, 0):
//   BANC   the systems, SOLID, one item at a time on the bench's pool (fibre.js) — the cable and its fibre, the
//          principle, the 1960s glass, the subsea cable, the splice, the coupler, the green connector
//   USINE  the factory, X-ray, a station every LINE.step along +x (fabrique.js) — the liquid, the soot, the lathe,
//          the furnace, the DRAW TOWER (the film's centrepiece), the proof test
//   MER    the sea, X-ray (voyage.js) — the cable ship, the bottom, the plough, the repeater, the grapnel, the loop
//   TERRE  from the beach to your wall (voyage.js) — the duct under the beach, the street and its old ducts, the
//          blowing, the cabinet, the 32 homes, your landing, your room, your box
//
// AZIMUTH (kit/lib/stage.js, checked in the code): the camera stands at target + d·(sin az·cos el, sin el,
// cos az·cos el). az 0 = the camera on +z, looking toward −z (it sees the +z flank); az −90 = the camera on −x
// (it sees the −x end); az +90 = on +x. The key light comes from −x, +y, +z: most shots use az −20 … −70.
//
// SCALE. Nothing in this film fits a frame at its true scale (a 9 µm core, a tower "of several floors", an ocean),
// so EVERY place is a MODEL at the scale of its subject, and NO size is ever displayed on the picture except the
// ones the voice says about the fibre itself (125 µm, 9 µm — true RATIOS on the bench) — `sources` says so.
// The facts forbid: a tower height, a preform length, a subsea cable diameter, a temperature for the splicer's arc.

/* ───────────────────────────── BANC (fibre.js) — the systems, solid ───────────────────────────── */

/** The bench: its pool is centred on the origin, its top at y = 0. `size` ≈ the radius the light stands around. */
export const BENCH = { size: 60 };

/** THE FIBRE, true ratios (125 µm glass, ≈ 190 µm soft coating, ≈ 245 µm hard coating, 9 µm core): Ø in cm.
 *  MAG: centimetres of model per micron (1 cm ≈ 10.4 µm). Axis along x, centred on `at`. */
export const FIBER = { glass: 12, soft: 18.2, hard: 23.5, core: 0.86, mag: 12 / 125, len: 260, at: [0, 22, 0] };

/** THE INDOOR CABLE ("Ton câble, d'abord. Une gaine de plastique. Des fils de renfort. Une couche de résine. Et dessous,
 *  le fil de verre"). A model: the jacket and the yarns are NOT to scale (no size shown); the fibre inside is FIBER.
 *  Axis x, centred on `at`. The exploded view is a TELESCOPE along +x (a long thin system opens in a row across the
 *  camera, never in a column): each layer slides out of the one around it by `explode` × its offset. */
export const CABLE = {
  at: [0, 34, 0],
  len: 240, //            the length of jacket seen (x from −120 to +120)
  jacket: [48, 58], //     inner / outer Ø
  yarn: [25, 47], //       the strength yarns fill this ring (a few dozen strands, laid with a long twist)
  explode: { jacket: -60, yarn: 0, resin: 70, glass: 150 }, // x offsets at explode 1 (cm)
};

/** THE PRINCIPLE, a model of the core and its cladding seen along their length (the ratio is NOT the real one: the
 *  core is drawn big so a ray can be followed). The ray ricochets at a GRAZING angle ("à plat"); in the BEND (du2) it
 *  comes too steep and leaves. Axis x, centred on `at`. */
export const PRINCIPE = {
  at: [0, 45, 0],
  core: 26, clad: 72, len: 640, //   Ø, Ø, length (x from −320 to +320)
  graze: 7, //                       the ray's angle to the axis while it is caught (°)
  steep: 34, //                      the angle that crosses the wall (the stone thrown from high: "lancé de haut, il coule")
  bend: { r: 150, arc: 120 }, //     the tight bend of du2: radius of the core's axis (cm), arc (°), in the x–y plane
};

/** THE 1960s GLASS ("elle perd la moitié de sa force tous les trois mètres"): a rod at TRUE length — 20 m along +x from
 *  x = 0 — so "trois mètres", "six", "vingt" are where the light is. `half` the distance (cm) over which it halves. */
export const HIST = { at: [0, 20, 0], len: 2000, d: 10, half: 300, marks: [300, 600, 2000] };

/** The two documents of the dossier, flat on the bench (reconstitutions, never a facsimile): Kao & Hockham 1966 (the
 *  page that says the losses are impurities: "fer, cuivre, eau") and Corning, August 1970 (the measured kilometre). */
export const DOCS = { at: [0, 0.4, 0], page: [42, 59], gap: 56 };

/** THE SUBSEA CABLE in section (a model; "pas plus gros qu'un tuyau d'arrosage" is said, never drawn to a size): from the
 *  centre out — the fibres in their steel tube, the steel wires, the copper, the thick plastic. Ø of each layer. */
export const SUBSEA = { at: [0, 40, 0], len: 220, tube: 9, wires: 30, copper: 34, jacket: 60, fibres: 12, wireCount: 18 };

/** THE CABLE BEING ASSEMBLED ("chaque fibre reçoit une couleur… dans des tubes… des renforts, une gaine"): six tubes of
 *  twelve fibres around a central strength member. The DA has three colours: a fibre's "colour" is its own MARK (a
 *  pattern of ink rings), never a hue — the voice says colour. */
export const MULTI = { at: [0, 38, 0], len: 260, tubes: 6, perTube: 12, tube: 14, ring: 34, jacket: 62 };

/** THE SPLICE (soudure). The fibres here are model fibres Ø `fiber` with the true core ratio. They meet at x = 0
 *  (`at`), left one from −x, right one from +x, in V-grooves; the two electrodes along ±z; the two cameras look from
 *  above at ±45° about x. The cleaver stands at `cleaver` (it scores and breaks the fibre's end: clivage). The sleeve
 *  ("manchon", `sleeve` long) waits on the left fibre at x = −90 and slides over the joint. */
export const SPLICE = { at: [0, 30, 0], fiber: 6, groove: 70, electrode: 14, cam: 45, sleeve: 44, cleaver: [-170, 0, 40] };

/** THE COUPLER (1 → 32): a small block of glass; one light guide in at x = −60, a tree of splits (5 stages) to 32
 *  guides out at x = +60, spread over `fan` in z. The light that comes in is `split` into 32 equal shares (≈ 3 %). */
export const COUPLER = { at: [0, 20, 0], len: 120, w: 40, h: 8, fan: 34, outs: 32 };

/** THE PLUG: your wall socket (PTO) in a wall plane facing +z at z = 0, the green connector (SC/APC: the only green
 *  object of the film is "veille", and it IS green) coming from +z, its ferrule's end polished at 8°; the optical box
 *  (ONT) at `ont`. A model ×10 (no size shown). */
export const PLUG = { at: [0, 40, 0], bevel: 8, ferrule: 25, body: [90, 90, 380], ont: [190, 0, 60] };

/* ───────────────────────────── USINE (fabrique.js) — the factory, X-ray ───────────────────────────── */

/** The factory line: one station every `step` along +x, the floor at y = 0. */
export const LINE = { y: 0, step: 1600 };

/** Station 1 — the liquid: a tank of silicon tetrachloride, the still that boils it, the vapour line to the burner. */
export const STILL = { x: 0, tank: [160, 180], column: [60, 520], burner: [600, 120, 0] };

/** Station 2 — the lathe (the soot builds on a turning rod; the flame travels back and forth along it).
 *  `rod` [length, Ø]; the soot body grows from Ø rod to Ø `body` (the first layers doped: the core; then pure: the cladding). */
export const LATHE = { x: LINE.step, y: 140, rod: [260, 4], body: 34, coreBody: 12, travel: 220 };

/** Station 3 — the furnace (dry with chlorine, then sinter): a vertical tube furnace; the soot body hangs on its
 *  rod and goes down into it; it comes out clear and shrunk (`clear` Ø), the core visible inside. */
export const SINTER = { x: LINE.step * 2, top: 620, hot: [140, 360], body: 34, clear: 22, len: 180 };

/** Station 4 — THE DRAW TOWER, the centrepiece. A model of a tower "of several floors" (no height shown): the preform
 *  hangs from the feed at the top, its tip in the furnace; the drop forms under it; the fibre runs down the axis
 *  (x = TOWER.x, z = 0) through the laser gauge, the two coating cups, the UV lamps, to the capstan at the bottom,
 *  then sideways to the spool. Heights of each stage (y, cm). */
export const TOWER = {
  x: LINE.step * 3,
  feed: 1720, preform: [22, 180], furnace: [1420, 1560], drop: 1380,
  gauge: 1180, cup1: 1000, cup2: 900, uv: [600, 860], pulley: 160, capstan: 90,
  spool: [LINE.step * 3 + 320, 90, 0], frame: [260, 1900, 260],
};

/** Station 5 — THE PROOF TEST: the fibre runs off a pay-out spool, between two pairs of wheels that hold it at the
 *  load, onto a take-up spool. A break happens BETWEEN the two pairs (`breakAt`). Then the echo (OTDR) on the spool. */
export const PROOF = { x: LINE.step * 4, y: 110, payout: [-260, 0], wheelsA: [-90, 0], wheelsB: [90, 0], takeup: [260, 0], breakAt: 0, wheel: 34 };

/* ───────────────────────────── MER (voyage.js) — the sea, X-ray ───────────────────────────── */

/** The sea: the surface at y = 0; the coast at x = 0 (the land is +x, the open sea −x). The bottom rises from the
 *  abyss to the shelf; the cable lies along z = 0. A model (no depth, no length shown). */
export const SEA = {
  deep: -3200, abyss: -14000, //          the abyssal plain (y), from x = −∞ to `abyss`
  shelf: -700, shelfEdge: -9000, //       the slope rises to the shelf at `shelfEdge`; the shelf runs to `coastFoot`
  coastFoot: -1200, //                     then the bottom rises to the waterline at x = 0
  plough: [-8000, -1500], //               where the cable is ploughed in (x from, to): on the shelf, near the coast
  repeater: -16000, //                     one repeater on the abyssal plain (x)
  anchor: -4200, //                        where an anchor drags (x, on the shelf: "là où passent les bateaux")
  repair: -19000, loop: 700, //            the repair (x, deep: "personne ne plonge") and the loop's reach in z
};
/** The cable ship (a model, ≈ 1:10 of a real one): bow toward +x; the cable leaves over its stern sheave at `stern`. */
export const SHIP = { len: 1400, beam: 220, stern: -700, tanks: [[-200, 0], [200, 0]], path: [-22000, -1500] }; // path: its origin's x at sail 0 → 1 (toward the coast)

/* ───────────────────────────── TERRE (voyage.js) — the beach, the street, your wall ───────────────────────────── */

/** The land: ground at y = 0, the beach from x = 0 (waterline) to `beach`; the duct under the beach comes up from the
 *  sea; the street runs along +x on z = 0, its ducts at y = `duct`; the central office, the blowing pit, the crushed
 *  duct, the cabinet (PM, the coupler inside), the 32 homes, your building, your room (the wall socket, the box). */
export const LAND = {
  beach: 1600, beachDuct: -260, landing: 1900,
  street: [2400, 9600], duct: -90, central: 2600, pit: 4200, crushed: 5200,
  cabinet: [6000, 0, 420], homes: [6200, 9400], homeRows: [-900, 900],
  building: [7600, 0, -900], floor: 320, room: [7600, 320, -1100], // inside the building (its back face at z = building z − 250)
  // in your room: the WALL is the plane z = room z (facing +z), the socket on it; offsets from `room` (x, y, z):
  socket: [-80, 30, 0], box: [0, 30, 45], furniture: [20, 35, 110], //  the box stands ≈ 45 cm off the wall, the furniture in front of it
};
