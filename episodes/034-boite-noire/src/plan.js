// DOSSIER 034 — Boîte noire : the plan of the sets. Centimetres, y up. No import here: model.js, fond.js and
// world.js all read it — it is what lets them be built at the same time.
//
// THREE SETS (world.js, `set`), ONE OBJECT re-parented between them: the flight recorder (model.js).
//   DEEP   the Atlantic at night, from the surface to the bottom (fond.js). THE BOX STANDS STILL, THE WORLD COMES TO
//          IT: the recorder is always at the origin (its base centre — the point that touches the bottom), and the
//          sea moves around it with `depth` (TRUE metres, 0 at the surface → DEEP.floor on the bottom):
//              the surface        y = +depth · 100
//              the bottom         y = −(DEEP.floor − depth) · 100      (0 when the box lies on it)
//          Every pose of the DEEP set is written around the box, wherever it is in the water.
//   AIR    023's A330 of glass at night over the Atlantic (023/src/avion.js, imported untouched): ITS frame — nose
//          toward −x, up +y, its LEFT side toward +z, the plane at the origin. The recorder hangs in its tail at
//          REC.inPlane (world.js adds a mount to the plane's group: 023's file is not changed).
//   BENCH  the kit's bench: the recorder alone on its pool of light, its base centre at BENCHAT = the origin — so
//          the cut from the bottom to the bench is IN PLACE (benchCut, origin [0, 0, 0]): the sea vanishes around it.
//
// THE RECORDER'S FRAME (model.js, all three sets): its base centre at the origin, its FRONT (the beacon) toward −x,
// up +y, its width along z. In DEEP it tumbles while it sinks: world.js turns it about its centre (REC.centre) by
// `spin` (about y) and `tilt` (about z) — every close pose below is written for spin 0, tilt 0.
//
// Azimuth (kit/lib/stage.js, line 381: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)):
// az 0 stands at +z, −90 at −x (in front of the recorder, and in front of the plane's NOSE), +90 at +x (behind),
// ±180 at −z. The key light comes from −x, +y, +z: a camera between az −20 and −70 has it at its shoulder.
//
// SCALES. The recorder and its parts: ILLUSTRATIVE sizes, close to a real solid-state recorder (an ARINC « ½ ATR »
// chassis ≈ 32 cm long; a protected memory module of a few kilos; a beacon ≈ 10 cm × 3.3 cm) — never written on
// screen. Nothing says where the module sits in a real A330 recorder, nor its exact shape: the press describes
// AF447's as a cylinder, so it is drawn as a squat cylinder (a « bloc », never a brick), on top, in the middle.
// The sea is TRUE: 3 900 m of water, the beacon's reach ≈ 1 NM (1.85 km). The A330 is 023's (true scale).

/* ───────────── THE RECORDER (model.js) — its base centre at the origin, front (beacon) toward −x ───────────── */
/** The whole recorder: its centre (the pivot of `spin` / `tilt`), its half-size (≈ the radius of the system). */
export const REC = { centre: [0, 12.5, 0], half: [17, 12.5, 6.5], inPlane: [2450, 40, 0] };
/** The chassis (boîtier): an orange box, x from −16 to +16, y from 0 to 13, z ±6.5; its handle at the front (−x),
 *  its connector at the back (+x); two reflective bands around it at `bands` (x). NOT protected: « rien n'est blindé ». */
export const CHASSIS = { len: 32, h: 13, w: 13, bands: [-9, 9], band: 2.4 };
/** The electronics inside the chassis: `n` boards standing along x, spaced along z (their centres). */
export const BOARDS = { n: 4, len: 27, h: 10, z: [-4.2, -1.4, 1.4, 4.2] };
/** The protected memory module (le bloc mémoire, CSMU): a squat cylinder, axis along x, sitting in a cradle on top
 *  of the chassis, in the middle. Orange, with its own reflective band. Its centre: `at`. */
export const MODULE = { r: 6, len: 12, at: [2, 19, 0] };
/** Its layers, from the outside in (radii, cm) — Honeywell's patent (US 8 723 057): hardened steel / insulation /
 *  heat absorber / the memory board at the heart. The exact layers of an A330's recorder are not sourced. */
export const LAYERS = { steel: [6, 4.7], insul: [4.7, 3.6], absorb: [3.6, 2.2], board: [3.6, 2.6, 0.35] };
/** The underwater locator beacon (la balise, ULB): a cylinder, axis along x, fixed to the module's front face;
 *  its water switch at its nose; its own battery (la pile) inside it (`pile`: radius, length, centre along x). */
export const BEACON = { r: 1.65, len: 10, from: -4, to: -14, y: 19, pile: { r: 1.15, len: 5.2, x: -8.2 } };
/** One ping a second (the beacon's period, s): fond.js (the rings in the water) and model.js (the lamp at the
 *  beacon's nose) BOTH read it, so that a ring is born when the beacon flashes: phase = frac((time − at) / period). */
export const PING = { period: 1, at: 0.1, reach: 185200 };
/** The system's size (≈ its radius): sizes the bench, its light, its shadows. */
export const SYSTEM = { size: 20 };
/** The bench: the recorder's base centre on it — at the origin, as on the bottom (the cut is in place). */
export const BENCHAT = [0, 0, 0];

/* ───────────── THE SEA (fond.js) — TRUE metres, the box at the origin ───────────── */
/** The bottom: 3 900 m (AF447's wreck, BEA). `first`: the box's depth on the first frame (just under the surface:
 *  the surface and the sinking tail behind it). */
export const DEEP = { floor: 3900, first: 40 };
/** The wreck of glass (l'épave): AF447's A330 broke up; nothing says where its recorder fell — the picture
 *  reconstitutes. In the hook, the TAIL section (fin, stabilisers, the rear cone: 023's FUSE / TAIL numbers) sinks
 *  above and behind the box (`tailSink`, relative to the box); on the bottom (`wreck` 1) it lies in the debris field
 *  among a few pieces of fuselage (hoops of frames, a panel of windows) and an engine — positions on the bottom,
 *  relative to where the box lies (y = 0 is the bottom). The field: ≈ 150 m across, all of it within the beam. */
export const WRECK = {
  tailSink: [1250, 3080, -2120], //  the tail section's centre while it sinks (cm from the box): fin seen flat from POSE0's family, its break down-left behind the box
  tail: [-3200, 0, -5200], //         where it lies on the bottom, on its side
  pieces: [[2600, 0, -6400], [-7000, 0, -1800], [5200, 0, -2600], [-1500, 0, -9800]], // fuselage pieces, the engine (last)
};
/** The light that comes down (avril 2011): a lamp descending from the surface (`beam` 0 → 1: its head from the
 *  surface down to `stop` above the bottom), its cone lighting the bottom over `radius` around `at`. */
export const BEAM = { at: [-1600, 0, -3400], stop: 1800, radius: 5200 };
