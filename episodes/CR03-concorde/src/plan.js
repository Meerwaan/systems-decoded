// CR03 — Concorde : the plan. Centimetres of MAQUETTE, y up, the floor y = 0 is the ground (the runway, the fields).
// No import here: concorde.js, piste.js, reservoir.js and world.js all read it — it is what lets them be built at the same time.
//
// « LE NOIR CHAUD » (kit/lib/reconstitution.js, docs/reconstitution.md): the studio 3D of the dossiers, turned warm. Every piece is a
// maquette in satin clay (clay({ tone }), clayEdges()), under the stage's softbox key and an amber spot that follows stage.focus.
// Colour code (Merwan, 05/11): veille GREEN = what works (the tanks that hold, the runway left to stop, the Kevlar of `depuis`) ·
// alarme RED = the incident (the fire, the fuel that leaks, the part in fault) · AMBER = the time (header) and the mood.
// One red PART at a time (alarm() + setAlarm(mat, k), chosen by S.culprit, see CULPRIT); the fire is red by nature (it IS the incident).
//
// TWO PLACES, THREE MAQUETTES. SET.PISTE (0) is the ground at Roissy and west of it — the runway 26R and its lamelle, the fields,
// Gonesse and its hotel, Le Bourget far ahead — with THE AIRCRAFT on it (concorde.js, placed by world.js from S.run / alt / pitch /
// bank). SET.RESERVOIR (1) is the tank n° 5 in section, alone, at its own scale, far away (ORIGIN.reservoir). Only one set is shown.
//
// AXES (SET.PISTE, world = local): the runway runs along x; THE AIRCRAFT ROLLS TOWARD −x (« west »); its LEFT wing is on +z.
// AZIMUTH (kit/lib/stage.js l. 381: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at +z, az −90
// at −x, ±180 at −z. So az 0 sees the aircraft's LEFT flank (tank 5, the left gear, engines 1 and 2), az −30 … −70 its front-left
// three-quarter (the camera ahead of it, on its left), az +30 … +70 its rear-left three-quarter; el < 0 looks up from below.
// `shift` positive moves the picture up. A mechanism is never filmed face on.
//
// SCALE: MAQUETTES. SET.PISTE is at 1:20 (the aircraft 308 long, a tyre 6, the lamelle 2.2) and its DISTANCES ARE COMPRESSED west of
// the runway (Gonesse and Le Bourget are much closer than in reality: one frame must hold them). SET.RESERVOIR is at 1:2.
// NO size is ever written on screen except in the chips the voice says; `sources` says the picture reconstitutes.
// The positions on the runway (V1, the lamelle, the rotation) are RECONSTITUTED from the times of the CVR (≈ 1 240 m, ≈ 1 780 m), not read.

/** Where each maquette stands in the world (its local origin). The aircraft has no fixed origin: world.js places it every frame. */
export const ORIGIN = {
  piste: [0, 0, 0],
  reservoir: [30000, 0, -30000],
};

/* ───────────── CONCORDE (concorde.js) — the aircraft, whole, plein, ≈ 1:20 ─────────────
   LOCAL FRAME: origin on the ground, on the centreline, at the main gear (midway between the two bogies' centres); the NOSE toward −x,
   the LEFT wing toward +z, y up; gear down, the tyres touch y = 0. Values ≈, from the published three-view (length 61.66 m, span
   25.6 m, track 7.72 m, wheelbase 18.19 m, tyre 47 in ≈ 1.19 m): the decor agent recalibrates the shape on a three-view, keeps the
   anchors where these numbers put them (world.js and piste.js read GEAR.tyre2, NOSE_GEAR.x, TANK5). */
export const PLANE = {
  nose: -172, // the nose tip (x) · tail cone end: +136
  tail: 136,
  body: { r: 7.2, h: 16.6, y: 25 }, // fuselage half-width (2.88 m / 2), height, axis height above the ground (gear down)
  droop: 5, // the nose drooped 5° for take-off (the visor down): a fixed shape, not a number of the state
  wing: { le: -52, te: 116, tipX: 100, span: 64, y: 18 }, // ogival delta: leading edge at the root (x), trailing edge, tip (x, z ±span), intrados height at the root
  fin: { le: 74, te: 132, top: 61 }, // the fin: its root along the top of the fuselage, its top (y)
};
/** The four Olympus 593, in two nacelles side by side under each wing (n° 1 outboard left … n° 4 outboard right). */
export const ENGINES = { z: [34, 26, -26, -34], inlet: 20, exit: 120, w: 8, y0: 8, y1: 19 }; // centres (z) of n° 1 … 4, intake lip (x), nozzle exit (x), width of one engine, bottom / top (y)
export const GEAR = {
  track: 19.3, // the main legs at z ±track (the LEFT one on +z)
  bogie: { dx: 4.2, dz: 1.8 }, // four wheels per bogie: at x ±dx (front −x), z ±dz around the leg
  tyre: { r: 3.0, w: 2.0 }, // radius, width
  tyre2: [-4.2, 0, 17.5], // TYRE N° 2: front, right-hand (inboard) wheel of the LEFT bogie — its contact point (the one that runs over the lamelle)
};
export const NOSE_GEAR = { x: -91, dz: 1.2 }; // twin wheels; it is the nose gear that crosses the V1 line (t2)
/** Tank n° 5: integral, in the LEFT wing, just above / ahead of the left main gear (BEA). Its outline on the intrados, and THE PANEL that
    is torn off from inside (≈ 30 × 30 cm, magnified ≈ 2× here so that it reads). The decor agent may move them by a few units. */
export const TANK5 = { x: [-34, 2], z: [8, 24], panel: [-12, 16], panelSize: 3 };

/* ───────────── PISTE (piste.js) — the runway 26R, the ground west of it, ≈ 1:20, distances compressed past the runway ─────────────
   run = the distance (units) the aircraft has rolled or flown from the start: the aircraft's origin (main gear) stands at x = −run
   (and on the trajectory TRAJ once past the runway). */
export const RUNWAY = { x0: 300, x1: -21075, half: 112.5, start: 0 }; // from behind the threshold (x0) to the far end (x1 = 4 215 m), half-width (45 m); run 0 at x = start
export const RUN = { v1: 6200, strip: 8920, rotate: 10300, liftoff: 12800 }; // reconstituted: V1, tyre 2 on the lamelle, rotation, lift-off
/** The V1 line, painted across the runway where the NOSE GEAR stands when run = RUN.v1. */
export const V1_LINE = { x: -RUN.v1 + NOSE_GEAR.x, w: 6 };
/** The stopping bar of `principe`: ahead of the aircraft, the runway it needs to stop from its speed (∝ run, as speed² is): green
    while it ends before the runway's end, red past it. By construction it reaches the end exactly at V1. */
export const STOP = { k: (RUNWAY.x1 * -1 - RUN.v1) / RUN.v1 }; // stop length = run × k (≈ 2.40)
/** The titanium wear strip lost by the DC-10: 435 × ≈ 30 mm × 1.4 mm (thickness magnified ×4), lying across tyre 2's track. */
export const STRIP = { at: [-RUN.strip + GEAR.tyre2[0], 0, GEAR.tyre2[2]], len: 2.2, w: 0.24, thick: 0.11, yaw: 70 }; // centre, length, width, thickness, angle to the track (°): almost ACROSS it (reconstituted)
/** `preuve`: what was found on the runway near the strip — the intrados panel (bulged outward) and the tyre piece (> 4 kg). */
export const FOUND = { panel: [-RUN.strip - 160, 0, 30], chunk: [-RUN.strip - 60, 0, 6], panelSize: 1.5 }; // panel at true size here (30 cm)
/** West of the runway (COMPRESSED): the fields, the N17, Gonesse and the hotel, Le Bourget's runway far ahead (its lights: `bourget`). */
export const GROUND = {
  road: { x: -25500, w: 60 }, // the N17, along z
  gonesse: { x: [-29500, -33500], z: [-2000, 3500] }, // the block of roofs
  hotel: { at: [-32000, 0, 1600], size: [300, 55, 75] }, // the hotel: x × h × z
  bourget: { at: [-42000, 0, 6000], len: 9000, half: 112.5, yaw: 35 }, // Le Bourget's runway: centre, length, half-width, angle (°) to x
};
/** The trajectory (`traj`): straight down the runway, then a slow curve to the left (+z) to the hotel. world.js places the aircraft on it. */
export const TRAJ = { bend: RUN.liftoff, end: 32000, side: 1600 }; // the curve starts at run = bend, reaches z = side at run = end
/** z of the trajectory at a given run (0 on the runway, a smooth curve to TRAJ.side): world.js and piste.js both use it. */
export function trajZ(run) {
  const u = (run - TRAJ.bend) / (TRAJ.end - TRAJ.bend);
  return TRAJ.side * (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
}
/** `depuis`: the runway inspection vehicle drives the whole runway (0 → 1). */
export const INSPECT = { size: [24, 10, 12] };

/* ───────────── RESERVOIR (reservoir.js) — tank n° 5 in section, ≈ 1:2: THE MECHANISM OF THE FAULT ─────────────
   LOCAL FRAME (its ORIGIN): a bay of the integral tank between two ribs, lying in the air (the intrados below, the extrados above), the
   span along z, the chord along x. CUT OPEN by the plane x = 0: the −x half removed, the cut faces look toward −x (the skins, the
   stringers, the kerosene, the wave are seen in section). The debris comes from BELOW (−y) and hits the intrados at IMPACT; the
   pressure wave crosses the kerosene; the skin gives way at PANEL — elsewhere, from the inside — and the panel is blown downward. */
export const BAY = { z: [-60, 60], depth: 60, y0: 70, y1: 105, skin: 1.2, fill: 0.94 }; // span (z), chord kept (x 0 → depth), intrados / extrados (y), skin thickness, kerosene level
export const IMPACT = { at: [0, 70, -34] }; // where the debris strikes the intrados (local) — ON the cut: the dent is drawn in the section
export const PANEL = { at: [0, 70, 30], size: 15 }; // THE panel that gives way (30 cm), centre on the cut (half of it is built)
export const DEBRIS = { size: [17, 12, 2.3], from: [-26, 9, -118] }; // the tyre piece (4.45 kg) and where it comes from (low left, above the floor)

/* CULPRIT — the part in fault (S.culprit; S.fault lights it in alarm red; 0 = none). ONE table for all the maquettes:
   1 the titanium strip (piste.js)             « une lamelle de titane »
   2 tank n° 5 and its panel (concorde.js: its outline and the panel on the intrados · reservoir.js: the panel that gives way)
   3 tyre n° 2 (concorde.js)                    « un pneu du train gauche… il éclate »
   4 engine n° 2 (concorde.js)                  « ton moteur 2 avale des gaz brûlants »
   5 the left main gear legs (concorde.js)      « il ne rentre pas »                                                                 */
export const CULPRIT = { strip: 1, tank5: 2, tyre2: 3, engine2: 4, gear: 5 };
