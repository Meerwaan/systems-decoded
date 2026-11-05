// DOSSIER 037 — Le parachute de secours : the plan of the set. Centimetres, y up. NO IMPORT HERE: model.js,
// sauteur.js, ciel.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN IS THE RIG. The centre of the back plate of the container (where the container meets your back) is the
// origin. The world comes to it, as in 007, 015, 026: the sky, the horizon and the countryside are drawn at infinity by
// ciel.js from the altitude (`alt`, metres above the ground: the ground is the plane y = −alt · 100); the air goes by
// (streaks) at `vz`. Nothing ever travels 1 350 m: `alt` does.
//
// THE DIVER'S FRAME (sauteur.js, `A.back`): you fall belly to earth, flat — your back up (+y), your belly down (−y),
// your head toward +z, your feet toward −z, your LEFT toward +x (kit/lib/figure.js: a standing figure looks toward +z
// with +x its left; laid face down with rotation.x = +90°, +x stays its left). With spin 0, tilt 0, hang 0 this frame
// IS the scene's frame. `spin` turns it about the vertical (y) through the origin; `tilt` pitches the head down about
// x; `hang` swings you upright under the canopy (risers at the shoulders). The rig rides `A.back`: whatever you do, the
// container stays on your back.
//
// THE BENCH stands at the origin, the scene's frame: the system lies on it exactly as it lies on your back with spin 0,
// tilt 0, hang 0 (back plate down, flaps up, the top of the container toward +z). So the cut « on l'ouvre » matches
// in place: act 1 lands `spin` on a whole number and `tilt`, `hang` on 0 at `tobench` — a pose aimed at the container
// reads the same on both.
//
// Azimuth (kit/lib/stage.js, checked: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)):
// az 0 stands at +z (off your head) looking toward −z; az −90 stands at −x (off your RIGHT side) looking toward +x;
// ±180 at −z (off your feet). el > 0 looks down, el < 0 looks up. The key light comes from −x, +y, +z: a camera
// between az −20 and −70 has it at its shoulder — on your right, a little toward your head.
//
// TWO SCALES. The rig, its box, its cutter at their true size (CYPRES 2 User's Guide [P]: processing unit 85 × 43 × 32
// mm, control unit 65 × 18 × 6.5 mm, cutter 43 × 8 mm, piston ≈ 5 mm). The sky and the ground at their true heights
// (`alt`: 1 350 m on the first frame, the window ≈ 225 m, the climb to ≈ 4 000 m). The canopy is a little smaller than
// a real reserve and its lines shorter (a vertical frame): no length is ever written on screen, `sources` says so.

export const DEG = Math.PI / 180;
/** A point at azimuth `az` (degrees, camera convention), radius `r`, height `y`. */
export const around = (az, r, y) => [Math.sin(az * DEG) * r, y, Math.cos(az * DEG) * r];

/* ───────────── THE STORY (the acts move these numbers; the header reads them) ───────────── */
/** Altitudes, metres above the ground. `first`: the hook (act 1 falls from it in real time, ≈ 55 m/s: ≈ 250 m at the
 *  cut to the bench). `pull`: where a diver pulls normally (≈ 1 000 m: the fall passes it, nobody pulls — never said).
 *  `gate`: where the window opens (Expert mode ≈ 225 m, 750 ft [P]; « vers » : it can fire higher, never a stopwatch).
 *  `floor`: where it stops trying (≈ 40 m [P] — never shown, never said). `climb`: the plane's top (≈ 4 000 m [S]). */
export const ALT = { first: 1350, pull: 1000, gate: 225, floor: 40, climb: 4000 };
/** Vertical speeds, m/s. Free fall belly to earth ≈ 55 m/s ≈ 200 km/h [S/O]; the threshold 35 m/s [P]; under an open
 *  canopy « quelques mètres par seconde » (3 to 13 m/s, Student mode [P]): 5 here. */
export const SPEED = { fall: 55.6, gate: 35, canopy: 5 };

/* ───────────── THE SYSTEM (model.js): the container, the AAD, the closing loop ─────────────
   In the diver's frame. The container on your back: the RESERVE at the top (toward your head), the MAIN below it. */
/** The whole container: x ±w/2, y 0 → depth (out of your back), z z0 → z1 (feet → head). */
export const CONTAINER = { w: 36, depth: 18, z0: -32, z1: 28, r: 3 };
/** The reserve tray (the upper part) and its four flaps closing on its outer face (y = depth). */
export const RESERVE = { z0: 4, z1: 28, floor: 1.2 };
/** The four reserve flaps, on the outer face, hinged on the tray's rim; they close in this order (bottom, top, left,
 *  right), each grommet over the loop; `open` lifts them outward about their hinge (90°: the tray is open). */
export const FLAPS = { order: ["bottom", "top", "left", "right"], thick: 0.8, open: 100 };
/** THE CLOSING LOOP (« la boucle qui le garde fermé »): a cord anchored on the tray's floor at `base`, running up
 *  through the cutter's hole, through the pilot chute and the flaps' grommets to `top`, where the PIN holds it. */
export const LOOP = { base: [0, RESERVE.floor, 16], top: [0, CONTAINER.depth + 0.9, 16], r: 0.18 };
/** The reserve pin through the loop, above the last flap (the ripcord pulls it; the cutter does not touch it). */
export const PIN = { at: [0, CONTAINER.depth + 0.9, 16], len: 4.5, r: 0.22 };
/** THE CUTTER (« le coupe-boucle », a small tube, 43 × 8 mm [P]) lies on the tray's floor, its axis along x, the loop
 *  through its HOLE (across it, along y). The PISTON runs along +x across the hole: 0 → `stroke` (≈ 5 mm [P]). */
export const CUTTER = { at: [0, RESERVE.floor + 0.4, 16], len: 4.3, r: 0.4, hole: 0.22, holeAt: 0.6, stroke: 0.5 };
/** THE PROCESSING UNIT (« le boîtier », 85 × 43 × 32 mm, 198 g [P]: its pressure sensor inside) in its pocket on the
 *  tray's floor, beside the bag, its long side along z. `sensor`: its pressure port, on its flank toward −x. */
export const UNIT = { at: [-12, RESERVE.floor + 2.15, 15.5], size: [3.2, 4.3, 8.5], sensor: [-13.6, RESERVE.floor + 2.4, 13] };
/** THE CONTROL UNIT (65 × 18 × 6.5 mm [P]): outside, on the top flap where you can read it — its screen, its button,
 *  and the DIODE (the film's « diode verte »: an image of « allumé », `sources` says the image reconstitutes it). */
export const CONTROL = { at: [11, CONTAINER.depth + 1.1, 23.5], size: [6.5, 0.65, 1.8], diode: [13.6, CONTAINER.depth + 1.5, 23.5] };
/** The two cables (« un câble file au coupe-boucle »): control → unit (≈ 650 mm [P], coiled in the tray), unit →
 *  cutter (≈ 500 mm [P]). Routed along the tray's floor and wall; their path is model.js's. */
export const CABLES = { r: 0.22 };
/** Under the flaps: the PILOT CHUTE (« l'extracteur », a spring, compressed) on top of the BAG (the folded reserve). */
export const PILOT = { at: [0, 9, 16], r: 7, low: 7, high: 50 };
export const BAG = { at: [0, 1.2, 16], size: [26, 7.6, 20] };
/** The system's size on the bench (its radius): sizes the bench, its light, its shadows. */
export const SYSTEM = { size: 34, centre: [0, 9, 0] };

/* ───────────── THE DIVER (sauteur.js) ───────────── */
/** Your body under the rig: the back's surface at y 0, the trunk ≈ 24 cm thick, the shoulders at z ≈ 34 (where the
 *  risers leave), the hips at z ≈ −34. The ripcord handle (« ta poignée ») on the front of the harness, left side,
 *  at the chest. `hang`: you swing upright about the shoulders' line. */
export const BODY = { back: 0, thick: 24, shoulders: [0, -6, 34], hips: [0, -12, -34], handle: [9, -24, 22], len: 176 };
/** The reserve canopy above you once open (ram-air, seven cells): the lines' length and its span — smaller than a
 *  real one (a vertical frame). In the diver's frame with hang 1 (upright): the canopy at y ≈ `lines` above the
 *  shoulders. */
export const CANOPY = { lines: 520, span: 560, chord: 230, cells: 7 };
/** The second diver of the principle (« une voile ouverte : quelques mètres par seconde »), under his open canopy,
 *  beside you and ABOVE you (a vertical frame: his canopy comes down slowly, you rush past under him): `twin` shows
 *  him, at this offset in the scene's frame (his harness; his canopy ≈ CANOPY.lines higher). Pale, never in front of you. */
export const TWIN = { at: [180, 260, -240] };

/* ───────────── THE SKY AND THE GROUND (ciel.js) ───────────── */
/** The countryside under you (« la campagne en damier »): fields of `field` metres (a range), hedges, a few roads, a
 *  village; drawn on the plane y = −alt · 100. Near the ground (alt < `near`) its closest fields have real geometry:
 *  the landing field and the morning (« au sol »). */
export const GROUND = { field: [120, 420], near: 60 };
/** The window (« sa fenêtre ne s'ouvre que vers 225 mètres du sol »): a horizontal sheet at ALT.gate above the
 *  ground, `r` wide around you, veille. */
export const GATE = { r: 90000 };
/** The pressure layers of the principle (« plus tu descends, plus l'air s'épaissit »): horizontal sheets of grains,
 *  spaced `step` metres apart up high, closer and denser toward the ground. Illustrative: no figure on them. */
export const STRATA = { step: [140, 40] };
