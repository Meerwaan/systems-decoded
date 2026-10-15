// DOSSIER L01 — Ton pare-brise : the plan of the sets. Centimetres, y up, the floor is y = 0. NO IMPORT here:
// verre.js, casse.js, dossier.js, car.js and world.js all read it — it is what lets them be built at the same time.
// The factory blocks of the kit (kit/lib/usine.js, kit/lib/postes.js) never read it: world.js hands them these numbers.
//
// FIVE PLACES, one shown at a time (world.js · SET), all built around the world's origin:
//   · LINE   the factory: ONE continuous line along +x (downstream), the conveyor at y = LINE.y, its axis z = 0.
//            The camera stands on the +z side (az −45 … +25: the key light falls from −x / +z) and travels along x.
//            On screen, downstream (+x) is to the RIGHT: the glass moves left → right, station after station.
//   · CAR    011's car (its own frame: nose toward −z, the driver on the −x side), you at the wheel, a wall ahead.
//   · ROAD   014's street: the same car body at the same place, the road scrolling under it.
//   · BENCH  the matt bench of the shorts: the finished windshield standing on it, the pieces of the dossier.
//   · LAB    Paris, November 1903: Bénédictus's laboratory, a room seen like an X-ray.
//
// THE FACTORY IS A MODEL AT THE SCALE OF THE WINDSHIELD (CLAUDE.md, the 008): a real float line is half a kilometre
// long (a 45 m furnace, a 50 m tin bath, a 100 m lehr) — here each station is 4 to 18 m, so that the windshield
// (1.5 m) still reads next to it. The ribbon keeps its true width (3.6 m: "trois à quatre mètres"); the voice
// gives the true lengths; no length of the model is ever shown. Heights are true where a test says them
// (the 2.26 kg ball from 4 m, the 227 g ball from ≈ 9 m, the head from 1.5 m).

/** The line: the height of its conveyor (where the glass lies), its first and last x, the width of its hall floor. */
export const LINE = { y: 90, x0: -700, x1: 12600, half: 700 };

/** The STATIONS, upstream → downstream: [x0, x1] along the line, `half` = half-width (z), `h` = height of the machine. */
export const ST = {
  // the batch: five heaps on a platform before the hopper, named one by one; the hopper feeds the furnace from above
  batch: { x0: -640, x1: -260, heaps: [-600, -520, -440, -360, -290], y: 60 },
  hopper: { at: [-60, 0, 0], top: 560, mouth: 330 }, // over the melt, inside the vault (x0 −120): the batch falls INTO the furnace
  // ≈ 1 500 °C — a long low vault; the melt fills it to `melt`; the throat at x1 pours onto the tin. The canal (usine.js
  // `spout`) runs from x1 to the bath (x1 → canal.x1), 2 × canal.half wide, its floor at canal.floor (= melt − 16): the
  // tongue of glass passes IN it, above its floor, and only drops to the tin past canal.x1 (the furnace's A.exit = (1 060, 110))
  furnace: { x0: -120, x1: 1000, half: 300, h: 380, melt: 110, throat: [1000, 104, 0], canal: { half: 130, floor: 94, x1: 1060 } },
  // the tin bath: ≈ 1 100 °C at x0 → ≈ 600 °C at x1; the tin's mirror at y; its hood (nitrogen + hydrogen) above
  bath: { x0: 1060, x1: 2700, half: 260, y: 88, hood: 210 },
  // the lift-out rollers between bath and lehr
  lift: { x0: 2700, x1: 2820 },
  // the lehr: a long low tunnel of rollers, the glass cools slowly from ≈ 600 °C to the air of the room
  lehr: { x0: 2820, x1: 4600, half: 240, h: 200 },
  // the cutting gantry: the ribbon ENDS at `at` — scored across, snapped; two blanks the shape of the windshield leave it
  cut: { x0: 4700, x1: 5300, at: 5000, h: 280 },
  // the printing gantry (screen printing): the black band, its dots, the silver lines, the stamp
  print: { x0: 5500, x1: 5900, at: 5700, h: 260 },
  // the bending furnace: the two blanks one on the other on the same mould, > 600 °C, they sag
  bend: { x0: 6100, x1: 7100, at: 6600, half: 230, h: 260 },
  // the clean room: filtered dry air; the film slid between the two glasses
  clean: { x0: 7400, x1: 8400, at: 7900, half: 320, h: 300 },
  // the autoclave: a cylinder lying along x, ≈ 140 °C under pressure; its door at x0; the glass rides in on a cart
  autoclave: { x0: 8700, x1: 9900, at: 9300, r: 175, axisY: 195 },
  // the last touch: rain sensor, camera mount — then a tunnel of light: every glazing is inspected
  eyes: { x0: 10100, x1: 10600, at: 10300, h: 260 },
  // the test hall (R43): the drop tower (the 2.26 kg ball from 4 m on a 30 cm sample; the 227 g ball from ≈ 9 m,
  // after the climatic box: +40 °C then −20 °C), the windshield on its frame under the 10 kg head (1.5 m), the
  // optical bench (looked through), the witness pane of tempered glass, struck, its grains counted in a 5 cm square
  test: { x0: 10900, x1: 12400, tower: 11300, frame: 11850, optics: 11050, witness: 12250, y: 100 },
  // the tempering lane, parallel to the line (z = TEMPER.z), beside the bending furnace: a furnace (≈ 620 °C) then the blower
  temper: { z: -1100, x0: 6000, x1: 7700, furnace: [6000, 6800], blower: [7000, 7500], y: 90 },
};

/** The test heights, true (R43, Annex 6): the plate where samples lie is at ST.test.y. */
export const DROP = { ball: 400, small: 900, head: 150, sample: 30 }; // the sample is a 30 cm square

/**
 * THE WINDSHIELD — the hero, the only solid thing of the factory. A curved trapezoid, its width `w` at the foot,
 * `wTop` at the top, `h` up its slant. True glass: 2 × ≈ 2.1 mm, film ≈ 0.76 mm ("environ trois quarts de
 * millimètre") — DRAWN thicker (`drawn`) or nobody would see a layer. `sag`: the depth of its curve across, `sagV`
 * along its height. `band`: the black band's width along each edge (`bandTop` along the top: the mirror's patch
 * is wider), `dots`: the width of the dot gradient inside it. `stamp`: the corner stamp, in the windshield's own
 * plane (x across from the centre, toward the passenger side at +x; y up the slant from the centre).
 */
export const WS = {
  w: 150, wTop: 128, h: 92, sag: 9, sagV: 3,
  glass: 0.21, film: 0.076, drawn: { glass: 0.4, film: 0.22 },
  band: 7, bandTop: 11, dots: 4,
  stamp: [-58, -34], // bottom corner, driver's side (−x): 6 cm square
  silver: 0, // a windshield has no silver lines (the rear screen has): the voice says "même procédé" — see SILVER
  sensor: [0, 38], // the rain sensor and the camera mount: top centre, behind the mirror
};
/** The silver lines are shown on a separate small rear-screen sample on the print gantry (they are the rear screen's). */
export const SILVER = { w: 120, h: 50, lines: 11 };

/** Where the windshield stands on the BENCH: its centre, its rake (degrees from vertical, the top leaning away from the camera). */
export const BENCH = { at: [0, 60, 0], rake: 28, size: 95, doc: [0, 0.6, 0] };

/**
 * Where the windshield sits in the CAR (011 / 014: the same body, the same numbers). Its foot (the cowl) and its top
 * (the roof's front bar) on the car's centre line; its half-width at the foot and at the top. Outward = −z and up.
 * Taken off 011's body (its TOP curve: z −98 → y 99.5, z −16 → y 142): rake ≈ 27° from horizontal.
 */
export const MOUNT = { foot: [0, 99.5, -98], top: [0, 142, -16], halfFoot: 72, halfTop: 62 };
/** The driver's side window, in the driver's door (−x): its centre, its size; it leans in a little at the top. */
export const SIDE = { at: [-88, 118, 12], w: 78, h: 40, lean: 12 };
/** You, at the wheel (011): your head; where it meets the glass (in the windshield's plane: x across, y up the slant). */
export const YOU = { head: [-37, 118, 14] };

/** Where things break, in the plane of the glass that breaks (cm from its centre: x across, y up). */
export const IMPACT = {
  head: [-37, 22], //  your head in the hook (driver's side, above the wheel: no interpenetration, the neck bends 8°)
  test: [0, 0], //     the 10 kg head on the test frame: the centre
  ball: [0, 0], //     the balls on the 30 cm sample
  chip: [34, -26], //  the gravel on the road: passenger side, low
  side: [8, 2], //     the side window: where the window-breaker strikes (and the grain of nickel sulfide)
  witness: [0, 0], //  the tempered witness pane
  bubble: [18, -30], // the bubble in the film (casse.js keeps its own copy, BUBBLE: the same numbers)
};

/** The tempered side window on the tempering lane, and the witness pane on the test hall (a 50 × 50 tempered square). */
export const PANE = { witness: 50, plain: [140, 80] }; // `plain`: the ordinary pane of before (one sheet, no film)

/** THE LAB, 1903 — a room 6 × 5 m, 3.5 m high ("ce flacon est tombé de 3,5 mètres de haut", his own label). */
export const LAB = {
  half: 300, depth: 250, h: 350,
  shelf: [-150, 330, -230], //  the top shelf, against the back wall: where the flask was
  floor: [-90, 0, -120], //     where it lands
  table: [110, 0, -90], //      his bench of flasks and retorts
  ben: [20, 0, -40], //         Édouard Bénédictus, standing (he will kneel to pick it up)
  flask: { r: 6.5, h: 21 }, //  ≈ 1 litre
};

/** The documents of the dossier on the BENCH (facsimiles in our type, not photos): drawn size, lying flat. */
export const DOC = { w: 60, h: 84, mark: 72 }; // `mark`: the side of the enlarged stamp plate

/** The car's set and the road's: everything in the car's frame (011 / 014 plan.js: CAR, nose −235, roof 146). */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146 };
