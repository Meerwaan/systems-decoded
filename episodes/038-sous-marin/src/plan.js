// DOSSIER 038 — Sous-marin : the plan of the set. Centimetres, y up. No import here: sousmarin.js, mer.js and
// world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN IS THE BOAT: the centre of its hull's axis, at mid-length. THE BOAT NEVER MOVES IN THE WORLD — the sea
// does (034's convention, whose fond.js mer.js wraps): the surface stands at y = +depth·100 above it, the rock's face
// at x = SUB.bow − gap·100 ahead of it. Only its attitude turns: `pitch` (degrees, + nose up) about the axis z through
// the origin — in three.js root.rotation.z = −pitch·DEG (the bow is at −x).
//
// THE BOAT'S FRAME (sousmarin.js's root): THE BOW POINTS TOWARD −x, the stern toward +x, the sail up (+y). Looking
// forward, PORT (bâbord) is +z and STARBOARD (tribord) is −z. Nothing in the film names a side: +z is « the camera
// side », the flank the key light falls on.
//
// AZIMUTH (kit/lib/stage.js, checked: the camera stands at t + d·(sin az·cos el, sin el, cos az·cos el)): az 0 stands
// at +z (the port flank, face on), −90 at −x (in front of the bow), +90 at +x (behind the stern). A camera that sees
// the boat AND the rock beyond its bow stands on the +x side of what it aims at: 0 < az < 180 (az 60: behind and to
// port). The key light comes from −x, +y, +z: the bow and the port flank are lit. `el` negative: the camera stands
// below what it aims at and looks up (the hook's « vue basse sous la coque »).
//
// ONE SCALE: TRUE, the order of a Los Angeles class (≈ 110 m long, ≈ 10 m across, ≈ 6 900 t submerged — CBS says
// ≈ 7 000 t [S]). The inner layout (where the bottles, the valves, the pipes, the command stand; the tanks' shapes)
// is SCHEMATIC: the picture reconstitutes it, `sources` says so, and nothing of it is ever written on screen. The
// seamount is schematic too (its true shape is unknown to us). No speed, no time, no knot ever shown.

/* ───────────── THE BOAT (sousmarin.js) ───────────── */
/** The hull: a cylinder of radius r, a blunt bow (the sonar dome) over `nose` from the bow, a tail cone over `tail`
 *  ending at the shaft (radius `hub`), the screw at `screw.x`. */
export const SUB = { len: 11030, r: 503, bow: -5515, stern: 5515, nose: 1300, tail: 2600, hub: 90, screw: { x: 5150, r: 340, blades: 7 } };
/** The sail (le kiosque), forward, and its two planes. */
export const SAIL = { x: -2900, len: 850, h: 610, w: 200, planes: { x: -2950, y: 900, span: 520, chord: 260 } };
/** The stern planes and the rudder: a cross at the tail, radius from the axis. */
export const FINS = { x: 4600, r: 850, chord: 420 };
/** The pressure hull (la coque épaisse): it holds the crew; intact at San Francisco [S]. Domed ends (`dome` deep). */
export const PHULL = { from: -4000, to: 3400, r: 470, dome: 260 };
/** The sonar sphere inside the bow's dome — destroyed by the shock [S]. */
export const SONAR = { x: -4950, r: 330 };
/** The main ballast tanks (les ballasts), outside the pressure hull, under the light hull: two forward, two aft
 *  (port +z / starboard −z), each a half-shell of the space between the two hulls from x0 to x1, from rIn to rOut.
 *  Full of water while the boat dives. The FORWARD ones are torn by the shock [S]: their tears (`tears`, points on
 *  their lower front, boat frame) are where the air pours out. */
export const MBT = {
  fwd: { x0: -4750, x1: -3850, rIn: 320, rOut: 495, tears: [[-4700, -300, 260], [-4650, -360, -240], [-4560, -120, 420]] },
  aft: { x0: 3300, x1: 4100, rIn: 300, rOut: 470 },
};
/** The high-pressure air (les bouteilles d'air comprimé): a bank of bottles lying along x under the control room,
 *  across z. Their pressure is never given (not sourced). */
export const BANK = { x: -1500, y: -340, len: 560, r: 34, n: 6, pitch: 80 };
/** The valves (les vannes) on the manifold at the bank's forward head: one feeds the forward line, one the aft line.
 *  A valve turns its handle 90° when it opens. */
export const VALVE = { x: -1850, y: -340, f: { z: -100 }, a: { z: 100 } };
/** The pipes: from each valve along the keel (y), to the tanks of its end — they enter each tank at its lower aft
 *  corner (forward) / lower front corner (aft). The green air runs along them from the valve. */
export const PIPE = { y: -420, r: 9, f: { to: -3800, z: -100 }, a: { to: 3350, z: 100 } };
/** The control room (le poste de conduite), under the sail, inside the pressure hull: its deck, its ceiling. */
export const ROOM = { x0: -3400, x1: -2200, deck: -80, ceil: 330 };
/** The emergency blow command (la commande de chasse d'urgence) on the ballast control panel, starboard side, its
 *  face toward +z (seen from the camera side, through the glass, past the chief of the watch's shoulder). The image
 *  reconstitutes it: no source says what it looks like (never « chicken switch »). Its control line runs down
 *  through the deck to the valves. */
export const CMD = { at: [-2500, 60, -310], panel: [170, 150, 30] };
/** The crew of glass (kit/lib/figure.js, 1,76 m): where each one stands or sits, and the way he faces (degrees,
 *  0 = toward −x, the bow; 90 = toward −z). [0] is the chief of the watch, seated at the panel. `jolt` throws
 *  them toward the bow. Never a body close up; nobody is shown hurt. */
export const CREW = [
  { at: [-2500, -80, -170], face: 90, seated: true }, //   the chief of the watch, at the ballast panel
  { at: [-2950, -80, -120], face: 0, seated: true }, //    a planesman
  { at: [-2950, -80, 120], face: 0, seated: true }, //     a planesman
  { at: [-2700, -80, 200], face: 20 }, //                  the officer of the deck, standing
  { at: [-3150, -80, 40], face: -30 }, //                  standing, forward
];

/** The pressure's arrows (« dix-sept fois la pression de surface »): rings of short arrows pointing at the hull. */
export const PRESS = { stations: [-4200, -2400, -600, 1200, 3000], n: 10, len: 260, off: 120 };
/** « Contre sept mille tonnes »: the weight, an arrow down above the boat (signal). The buoyancy: an arrow up
 *  under it (veille). Lengths at amount 1. */
export const WEIGHT = { x: -300, top: 2600, len: 1700 };
export const LIFT = { x: -300, bottom: -2600, len: 1700 };
/** The principle's cube: one cubic metre of water in the forward port tank, at its bottom; chased by the air, it
 *  leaves through the tank's bottom and sinks out of the frame (« mille kilos en moins »). */
export const CUBE = { at: [-4300, -300, 330], side: 100 };

/** Where the bench stands when the film cuts to it: IN PLACE, under the forward half of the boat (pitch 0) — a pose
 *  aimed at the boat reads the same in the sea and on the bench. Its floor is the bench's grid. */
export const BENCHAT = [-3000, -SUB.r - 40, 0];
/** ≈ the radius of what the bench holds: sizes its light and its shadows. */
export const SYSTEM = { size: 900, centre: [-3000, -40, 0] };

/* ───────────── THE SEA, THE ROCK (mer.js) ───────────── */
/** The boat's depth (m), its axis: 160 m at the shock (525 ft [S]); floating once surfaced (the hull's top just
 *  awash, the sail out — never higher: it never leaps out of the water). */
export const DEPTH = { dive: 160, float: 4.5 };
/** The header's pressure: how many times the surface's, at the boat's depth (≈ 17 at 160 m, contre-vérification). */
export const pressureAt = (depth) => 1 + (Math.max(0, depth) * 1.025) / 10.33;
/** The rock (la paroi): the seamount's flank that the bow hits. Its face looks toward +x (toward the boat), leans
 *  back by `lean` degrees; it is `width` wide across z, runs `below` under the contact and `above` over it (where it
 *  rounds into the shoulder). The contact point is at sea depth `depth` (m) — the boat's axis at the shock. */
export const ROCK = { depth: 160, width: 14000, below: 9000, above: 5500, lean: 14 };
/** The whole seamount, schematic (« elle n'avait pas cette montagne »): a cone of rock from the bottom (`base`, m)
 *  to a summit at `summit` m under the surface, `radius` (cm) at its foot; its summit stands `peak` (cm, x) beyond
 *  the contact. Drawn in contour lines when the camera is far. */
export const SEAMOUNT = { base: 3900, summit: 90, radius: 360000, peak: -45000 };
