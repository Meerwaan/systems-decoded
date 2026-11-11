// DOSSIER L06 — Blackout (affaire réelle : la panne européenne du 4 novembre 2006) : THE PLAN — the numbers every set
// reads, in centimetres, y up. NO import: the three sets (europe.js, terrain.js, model.js) are built at the same time
// against this file. Sources: docs/faits/L06-blackout-europe.md (UCTE Final Report 30/01/2007, CRE 07/02/2007).
//
// FOUR PLACES, FOUR SCALES (world.js · SET), one shown at a time, each around its own origin:
//   CARTE     the MAQUETTE of continental Europe on a table in the dark (the film's centrepiece): 1 km = MAP.k cm
//             (1 : 500 000), east +x, NORTH −z, the table top at y = 0. It breaks into THREE PLATES along SPLIT.
//   TERRAIN   northern Germany at TRUE scale, at night: the Ems and the double 380 kV line that crosses it (EMS), the
//             corridor of pylons across the plain, the shipyard's hall, the wind farm. The LINE runs along x (east +x:
//             the power comes from the east, flows toward −x), the RIVER along z (downstream, toward the sea: −z).
//   QUARTIER  your neighbourhood in France at TRUE scale, at night: the street along x, your building's front facing
//             +z, the poste source at the east end (+x) where the film's hero — the frequency relay — is mounted.
//   BENCH     the solid systems on the bench, one spot at a time (BENCH.spots): maquettes at the subject's scale.
//
// AZIMUTH (kit/lib/stage.js: the camera stands at tx + d·sin(az), tz + d·cos(az)) — checked on the stubs:
//   az 0    the camera stands on the +z side and looks toward −z: on the CARTE, from the SOUTH toward the north (the
//           map as in an atlas, west on the left); in the TERRAIN, the line in profile, the river flowing away
//   az −90  the camera stands on the −x side and looks toward +x: on the CARTE from the Atlantic toward Poland; in
//           the TERRAIN, ALONG the line toward the east; in the QUARTIER, along the street toward the poste source
//   az −35  from France toward Germany (the key light comes from −x, +y, +z: film between az −20 and −70)
//
// SCALE HONESTY (episode.json → sources): the CARTE is a maquette (borders, the grid and the split line are
// SCHEMATIC, after the report's figure 4); in the TERRAIN the hall stands 1.2 km from the crossing instead of ≈ 10 km
// and the ship's and the wires' heights are orders of magnitude; the bench pieces are maquettes. NO length, height or
// distance is ever written on screen except what the voice says (84 m, 110 m, 380 000 V, the amperes, the hertz).

export const DEG = Math.PI / 180;
/** "22:10:13" → seconds after midnight. */
export const hms = (s) => {
  const [h, m, sec = 0] = s.split(":").map(Number);
  return h * 3600 + m * 60 + sec;
};

/* ───────────────────────────── the day (UCTE p. 17-23, 42 ; CRE p. 3) ───────────────────────────── */
export const DAY = {
  told: "19:00:00", //      E.ON Netz tells RWE and TenneT the new time
  lastCalc: "21:29:00", //  last load-flow at E.ON Netz: no limit exceeded; N-1 assumed, not computed
  cut1: "21:38:00", //      first circuit of Conneforde–Diele switched off
  cut2: "21:39:00", //      second circuit
  n1Lost: "21:40:00", //    N-1 no longer met (the committee's simulation)
  warn: "21:41:00", //      RWE: its limit on Landesbergen–Wehrendorf is 1 795 A
  calls: ["21:46:00", "21:50:00", "21:52:00"],
  more: "22:05:00", //      +100 MW on the line: over the limit
  urgent: "22:08:00", //    RWE asks for an urgent intervention
  couple: "22:10:11", //    the busbars coupled at Landesbergen (+67 A)
  trip: "22:10:13", //      Landesbergen–Wehrendorf trips at Wehrendorf (2 120 A measured, threshold 2 100 A)
  bielefeld: "22:10:15",
  main: "22:10:27", //      the lines south of the Main, Bavaria, Austria
  split: "22:10:28", //     22:10:28.7 (West / North-East) and 28.9 (West / South-East)
  maroc: "22:10:32",
  held: "22:10:39", //      the fall of the West stops, close to 49 Hz
  poland: "22:13:00", //    the North-East's frequency rises again
  back50: "22:24:00", //    the West is back at 50 Hz
  relit1: "22:30:00", //    France: first half of the shed load back
  relit2: "22:40:00",
  recouple: "22:47:00", //  Germany / Austria: West and North-East recoupled
  southEast: "22:49:00", // the South-East is back: 38 min after the split
  allLit: "23:10:00", //    France: everyone has power again
};

/* ───────────────────────────── the frequency (UCTE p. 25-30, 54 ; CRE p. 33) ───────────────────────────── */
// The ONLY values the needle and the header may show: the ones the voice says or the report gives.
export const FREQ = {
  f0: 50,
  band: 0.18, //           normal operation: ± 0.18 Hz
  pumps: 49.5, //          storage pumps stop; many small wind and CHP units trip below it
  steps: [49, 48.5, 48, 47.5], // France's four load-shedding steps (CRE): only the FIRST one was used
  black: 47.5, //          the plants disconnect to protect themselves: never reached, never shown as a reading
  slope: 0.15, //          Hz per second, at most (the West)
  westLow: 49.0, //        "tout près de quarante-neuf" (22:10:39)
  eastPeak: 51.4, //       the North-East
  eastAfter: 50.3, //      after ≈ 6 200 MW of wind tripped
  southEast: 49.7, //      the South-East (mild) — never said by the voice: no reading, a needle only
  relayPrecision: 0.15, // the French relays (CRE note 27) against the 0.1 the rule asked for
};

/* ───────────────────────────── CARTE: the maquette of Europe ───────────────────────────── */
const KM = 0.2; // cm per km
const LON0 = 10;
const LAT0 = 47;
const KX = 111.32 * Math.cos(LAT0 * DEG) * KM; // cm per degree of longitude (15.18)
const KZ = 111.32 * KM; //                        cm per degree of latitude (22.26)
/** (longitude °E, latitude °N) → [x, z] on the table. North is −z. */
export const geo = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0) * KZ];
const g3 = (lon, lat, y = 0) => {
  const [x, z] = geo(lon, lat);
  return [x, y, z];
};
export const MAP = {
  k: KM,
  lon0: LON0,
  lat0: LAT0,
  // the table: from the Atlantic off Lisbon to the Black Sea, from Tangier to Jutland
  box: { x0: -360, x1: 300, z0: -250, z1: 265 },
  slab: 3, //            the plates' thickness (cm): they are SOLID dark slabs with engraved borders
  wire: 1.6, //          the 380 kV grid floats this high over the plates (explode 0)
  // « Alors… on l'ouvre » : four layers lift apart (explode 1). Bottom → top, as the voice names them top → bottom:
  // « Des centrales. Des lignes à très haute tension. Des postes. Et au bout, des millions de prises. »
  layers: { homes: 0, subs: 70, lines: 140, plants: 215 },
  // the three plates (UCTE fig. 4, schematic): how far each one drifts from the West at `apartE` / `apartS` = 1
  drift: { east: [30, 0, -17.5], south: [22.5, 0, 30] }, // ×5 (decor europe, 10/11): at 6 cm the gap did not read on a 660 cm map
  centre: [0, 0, -20], // the middle of the lit map
};
/** Cities and nodes, [x, 0, z]. The 3D never writes a name: the chapters label them (callouts) from these anchors. */
export const PLACE = {
  paris: g3(2.35, 48.86),
  lisbonne: g3(-9.14, 38.72),
  varsovie: g3(21.01, 52.23),
  bruxelles: g3(4.35, 50.85),
  madrid: g3(-3.7, 40.42),
  rome: g3(12.5, 41.9),
  berlin: g3(13.4, 52.52),
  vienne: g3(16.37, 48.21),
  you: g3(3.05, 46.6), //            "en France… ta lumière": a point in the middle of France, never named
  // the story's nodes in north-west Germany
  papenburg: g3(7.4, 53.08),
  conneforde: g3(8.05, 53.33), //    Conneforde–Diele: the double 380 kV line over the Ems (cut at 21:38 and 21:39)
  diele: g3(7.31, 53.13),
  landesbergen: g3(9.13, 52.56), //  E.ON Netz's end (relay: 3 000 A)
  wehrendorf: g3(8.35, 52.33), //    RWE's end (relay: 2 100 A)
  bielefeld: g3(8.6, 52.02),
  spexard: g3(8.4, 51.88),
  bechterdissen: g3(8.66, 51.98),
  elsen: g3(8.68, 51.73),
  twistetal: g3(8.96, 51.33),
  dipperz: g3(9.79, 50.55),
  grafenrheinfeld: g3(10.19, 49.98),
  raitersaich: g3(10.85, 49.37),
  schwandorf: g3(12.11, 49.33),
  ernsthofen: g3(14.48, 48.13), //   Austria
  hessenberg: g3(15.03, 47.38),
  mikulowa: g3(14.98, 51.07), //     Poland: Mikulowa–Czarna overloads after 22:13
  czarna: g3(16.15, 51.4),
  tarifa: g3(-5.6, 36.01), //        the Spain–Morocco link (trips at 22:10:32)
  fardioua: g3(-5.55, 35.85),
  // three dispatch points, one inside each control area (the report names no place: never labelled with a city)
  dispatchEon: g3(9.98, 52.37),
  dispatchRwe: g3(6.78, 50.96),
  dispatchTennet: g3(5.9, 51.98),
};
/** The Main (the cascade "descend vers le sud… au sud du Main"), a polyline of [x, z]. */
export const MAIN_RIVER = [[8.25, 50.0], [8.68, 50.11], [9.15, 49.97], [9.6, 49.8], [9.93, 49.79], [10.23, 50.04], [10.89, 49.89], [11.58, 49.95]].map(([a, b]) => geo(a, b));
/** THE SPLIT (22:10:28.7 and 28.9), polylines of [x, z], SCHEMATIC after the report's figure 4 — to be checked against
 *  the figure before the final render (docs/journal/L06-architecte.md § Ce qui reste ouvert). `wne`: West | North-East,
 *  from the North Sea coast (between Diele and Conneforde) down through Germany (between Wehrendorf and Landesbergen,
 *  south of the Main, Bavaria) and Austria to the corner Slovenia / Hungary / Croatia. `wse`: West | South-East,
 *  through Croatia to the Adriatic. `nese`: North-East | South-East, along Hungary's southern and eastern borders. */
export const SPLIT = {
  wne: [[7.7, 53.9], [7.7, 53.2], [8.75, 52.45], [8.55, 51.9], [9.3, 51.2], [9.6, 50.6], [10.0, 50.05], [10.7, 49.5], [11.9, 49.2], [13.0, 48.5], [14.2, 48.0], [14.7, 47.4], [15.3, 46.75], [16.3, 46.45]].map(([a, b]) => geo(a, b)),
  wse: [[16.3, 46.45], [16.6, 45.9], [16.2, 45.2], [15.6, 44.6], [15.1, 44.2], [14.6, 43.6]].map(([a, b]) => geo(a, b)),
  // Checked on 10/11 against the report's text (annex 4 p. 74, fig. 1 p. 15): HUNGARY IS CUT — « MAVIR South (Szeged area) »
  // went with the South-East (the 220 kV Szolnok–Szeged line tripped). So `nese` follows the Hungary–Croatia border, then
  // loops NORTH of Szeged (20.15 E, 46.25 N) before it reaches the Hungary–Romania border. Still schematic (fig. 4 not read).
  nese: [[16.3, 46.45], [17.5, 45.95], [18.8, 45.9], [19.55, 46.17], [19.75, 46.6], [20.6, 46.65], [21.0, 46.3], [21.3, 46.7], [22.3, 47.8], [23.5, 48.1], [25.6, 47.9]].map(([a, b]) => geo(a, b)),
};
/** Which plate a country stands on (UCTE annex 4 p. 74, checked 10/11). Germany, Austria, Croatia AND Hungary are CUT by SPLIT.
 *  Jutland (DK ouest) is North-East (« E.ON East (Germany, including Jutland) »). Morocco hangs on the West until 22:10:32. */
export const PLATE = {
  west: ["PT", "ES", "FR", "BE", "NL", "LU", "CH", "IT", "SI", "DE (ouest)", "AT (ouest)", "HR (ouest)"],
  east: ["DE (est)", "AT (est)", "PL", "CZ", "SK", "HU (centre et nord)", "UA (ouest)", "DK (ouest)"],
  south: ["HR (est)", "HU (région de Szeged)", "BA", "RS", "ME", "MK", "AL", "GR", "BG", "RO"],
  out: ["GB", "IE", "Scandinavie", "MA (lié par le détroit)"], // drawn as dim outlines, never lit
};
/** The dial's home on the table: off the coast, west of the map, its face toward −x (film it from az −60 … −120). */
export const DIAL_AT = { at: [-345, 0, 70], r: 30 };

/* ───────────────────────────── TERRAIN: the Ems, the line, the plain (true scale) ───────────────────────────── */
export const EMS = {
  water: -350, //          the river's level under the dikes' crest (y = 0)
  width: 11000, //         the river, bank to bank (along x)
  dike: { x: 8000, h: 300 },
  // the crossing: two tall towers on the banks, the double circuit ("red" and "white") between them
  tower: { x: 23000, h: 8400, raised: 11000 }, //  84 m that night ; 110 m since 2007 (`raise` 0 → 1)
  wireLow: 6300, //        the lowest conductors at mid-river with the 84 m towers (order of magnitude, never written)
  // the corridor across the plain, on both sides: ordinary double-circuit towers
  corridor: { h: 5500, span: 38000, n: 6 },
  // the first frame's spot: under the corridor east of the river, looking east along the line (az −90)
  hook: [99000, 0, 0],
  far: [251000, 0, 0], //  the corridor's far east end: where the trip's flash stands (a light with a place)
};
/** Meyer Werft's covered building dock, an X-ray box on the east bank, upstream (compressed: 1.2 km, not ≈ 10). */
export const HALL = { at: [24000, 0, 120000], L: 50400, W: 12500, H: 7500 };
/** The cruise ship (Norwegian Pearl: 294 m, 32 m beam). In the hall (`ship`), and as a GHOST OUTLINE gliding down the
 *  river under the line (`pass` 0 → 1: z from +from to −from) — a demonstration of the clearance, NEVER the ship on
 *  the Ems that night (the report does not say whether it sailed). */
export const SHIP = { L: 29400, beam: 3220, air: 5900, draft: 820, from: 70000 };
/** The wind farm on the eastern horizon ("le vent souffle sur le nord de l'Allemagne"). */
export const WINDFARM = { x0: 140000, x1: 420000, z: 160000, n: 14, hub: 10000, r: 4500 };

/* ───────────────────────────── QUARTIER: your neighbourhood (true scale) ───────────────────────────── */
export const QUARTIER = {
  floor: 300, //                                       a storey
  // your building: its front on z = 0, facing +z (the south side of the street is open: nothing hides the fronts)
  home: { x0: -900, x1: 900, z0: -1200, floors: 5 },
  room: { floorY: 600, x0: 80, x1: 620, depth: 420 }, // YOUR room, second floor, behind the front
  window: [350, 760, 0], //                            the middle of your window
  lamp: [250, 835, -150], //                           « ta lumière »
  tv: [470, 700, -400],
  socket: [80, 630, -170], //                          « ta prise », on the room's west wall (solid, small)
  switchAt: [80, 715, -60], //                         « un interrupteur » (solid, small)
  you: [330, 600, -130], //                            a figure of glass
  lift: { x0: -2600, x1: -1100, floors: 7, shaft: [-1850, 0, -220], cabin: 230, top: 1800 }, // « un ascenseur qui monte »
  blocks: [
    { id: "b2", x0: 1100, x1: 2900, z0: -1300, floors: 4, feeder: 2 },
    { id: "b3", x0: 3100, x1: 4700, z0: -1200, floors: 6, feeder: 1 },
    { id: "far1", x0: -2400, x1: 400, z0: -4200, z1: -3000, floors: 6, feeder: 2 },
    { id: "far2", x0: 900, x1: 4200, z0: -4400, z1: -3100, floors: 5, feeder: 1 },
  ],
  // the poste source at the east end of the street: an X-ray hall, the transformer outside, the row of HTA cells
  // inside (the HERO of model.js is mounted on `cells`, its row along x, its fronts facing +z)
  poste: { at: [7600, 0, -700], w: 2200, d: 1100, h: 650, cells: [6900, 0, -750], transfo: [8900, 0, -700], lineTo: [60000, 0, -700] },
  // the feeders (20 kV cables under the street, y = −80, along z = 350): feeder 1 is the FIRST STEP — the one the
  // relay opens at 49 Hz (your building, the lift's, b3, far2); feeder 2 stays lit; feeder 0 is the priority one
  feeders: { y: -80, z: 350 },
  hospital: { at: [-9000, 0, -5200], w: 2600, d: 1500, h: 1800 }, // « sur une liste qu'on ne coupe pas »
};

/* ───────────────────────────── BENCH: the solid systems ───────────────────────────── */
export const BENCH = {
  // one spot at a time (`spot`): 0 the alternators and the dial · 1 Landesbergen–Wehrendorf and its two relays ·
  // 2 the hero (the frequency relay and its four steps of HTA cells) · 3 the report
  sizes: [160, 200, 150, 34],
  focus: [[0, 60, 0], [0, 60, 0], [0, 90, 0], [0, 2, 0]],
};
/** The turbo-alternator, a maquette (≈ 1 : 20): shaft along x, the turbine on +x, the generator on −x; the STROBE MARK
 *  is on the −x end flange (the key light comes from −x: film the flange from az −55 … −80). Three of them stand side
 *  by side along z once Europe is cut in three (`rotors` 3): West in the middle, North-East behind, South-East in front. */
// `spin`: degrees per second every mark turns at, by itself, in every set (the common rhythm: 0.4 turn per second,
// 4.8° per frame). An area's mark stands at spin × time + its `turn*` (world.js): the chapters only move the OFFSET.
export const ROTOR = { spin: 144, axisY: 60, len: 260, turbine: { r: 40, len: 70, x: 80 }, stator: { r: 34, len: 110, x: -45 }, rotor: { r: 15, len: 130 }, flange: { r: 22, x: -122 }, row: [0, -115, 115] }; // z of West, North-East, South-East
/** The frequency dial: 47 → 52 Hz over 240°, 50 at the top. Its local frame: standing on its foot at the origin, its
 *  face toward +z, its centre at y = DIAL.r + 8. On the bench (spot 0) world.js stands it at DIAL.bench. */
export const DIAL = { r: 30, from: 47, to: 52, sweep: 240, bench: { at: [-215, 0, -95], yaw: -62 } };
export const dialAngle = (hz) => ((Math.min(DIAL.to, Math.max(DIAL.from, hz)) - 50) / (DIAL.to - DIAL.from)) * DIAL.sweep; // degrees, + = clockwise (faster)
/** Landesbergen–Wehrendorf on the bench (UCTE table 1, annex 3): one line, two ends, two relays. East is +x, as on
 *  the map: Landesbergen (E.ON Netz, its two busbars and their coupler) on +x, Wehrendorf (RWE) on −x. */
export const LW = {
  half: 160, //            the line's ends at x = ± half
  y: 62, //                the conductor's height on the bench
  dialR: 16, //            the relays' ammeters
  amps: { scale: 3200, alarm: 1795, tripRWE: 2100, tripEON: 3000, measured: 2120, bump: 67 },
  bars: { x: 205, gap: 26, len: 120 }, // Landesbergen's two busbars, along z, `gap` apart; the coupler between them
};
/** The hero at TRUE scale: four steps of HTA cells (one cell stands for a step: 49 / 48.5 / 48 / 47.5 Hz) side by
 *  side along x, fronts facing +z, and the frequency relay on the front of the first one. */
export const HERO = { cell: { w: 60, h: 200, d: 110 }, n: 4, relay: { w: 24, h: 18, d: 14, at: [0, 150, 58] }, feeders: 10 };
/** The UCTE final report: 84 pages (a solid document; its cover is drawn, never photographed). */
export const REPORT = { w: 21, h: 29.7, pages: 84, thick: 1.1 };
