// DOSSIER 036 — L'éolienne dans la tempête : the plan of the set. Centimetres, y up, the ground is y = 0. No import
// here: model.js, eolienne.js, vent.js and world.js all read it — it is what lets them be built at the same time.
//
// THE ORIGIN IS THE FOOT OF THE TOWER (its centre, on the ground). The road of 025 (025-esp/src/route.js, imported as
// it is) lies along z, 50 m to the LEFT (−x) of the tower: its car stands at CARAT, nose toward −z, the tower 180 m
// ahead of it and 35 m to its right — 84 m upwind of the rotor and 50 m to its side: in reach, never under it. world.js puts the whole road group at CARAT; route.js draws in its own frame
// (the car at its origin), untouched.
//
// AZIMUTH (kit/lib/stage.js, checked: the camera stands at t + d·(sin az·cos el, sin el, cos az·cos el)): az 0 stands
// at +z, −90 at −x, ±180 at −z. Seen from the car, the tower is toward −z (ahead) and +x (right): a camera behind the
// car looking at the rotor has az ≈ −15. The key light comes from −x, +y, +z.
//
// THE NACELLE'S FRAME (« the yaw frame », model.js's root): its origin is the TOP OF THE TOWER (the yaw bearing's centre,
// y = TOWER.top in the world); local +z points UPWIND, where the spinner looks; the nacelle's body runs toward −z; y up.
// It is turned so that its +z points toward az = TURBINE.heading: a camera at az = heading stands in front of the
// spinner. No tilt, no cone: the rotor axis is level, the blades are straight out of the hub (simplified, never said).
// THE ROTOR turns CLOCKWISE seen from upwind (from +z, looking toward −z: from up to the right). `rotor` (turns) is its
// angle: blade k (A = 0, B = 1, C = 2) points at θk = 2π·(rotor + k/3) from straight up, its axis (sin θk, cos θk, 0)
// in the hub frame. In three.js: hub.rotation.z = −2π·rotor; root k inside it, rotation.z = −2π·k/3.
// THE BLADE'S FRAME (root[k], rotor-fixed, NOT pitched): origin at the centre of the blade bearing's flange, +y along
// the blade toward its tip, +z UPWIND (the rotor axis), +x the way the blade moves when the rotor turns. THE PITCH
// (`pitchA`, `pitchB`, `pitchC`, degrees) turns the blade about +y: at 0 (producing) the chord lies across, in the
// rotor plane, its leading edge toward +x; at 90 (« en drapeau ») the chord lies along the wind, the leading edge
// toward +z — the blade shows the wind its edge. In three.js: pitch[k].rotation.y = −pitch·DEG.
//
// ONE SCALE: TRUE, the order of an Enercon E-82 (rotor 82 m, hub 78 m, 6 to 18 tr/min: the notice of the dossier,
// [P]); the inner parts' sizes are ILLUSTRATIVE (nothing is ever written on screen). The voice never gives a height.

/* ───────────── THE TURBINE (eolienne.js) ───────────── */
/** The tower: a cone of concrete / steel sections, seen like an X-ray; its door faces the road (az ≈ −20). The ladder
 *  climbs inside it on the road side. Its top flange carries the yaw bearing (the nacelle's origin). */
export const TOWER = { top: 7550, r0: 330, r1: 160, sections: 6, door: { az: -20, w: 90, h: 220 }, ladder: { az: -25, inset: 40 } };
/** Where the rotor faces (the wind comes from there): degrees, same convention as az. The rotor shows its 3/4 face to
 *  a camera behind the car (az ≈ −15): the spinner is turned 35° to the left of it. */
export const TURBINE = { heading: -50 };
/** The wind blows FROM `heading` (unit vector, world): the rain and the gusts go along −WIND. */
export const WIND = [Math.sin(TURBINE.heading * Math.PI / 180), 0, Math.cos(TURBINE.heading * Math.PI / 180)];
/** A point of the nacelle's frame, in the world (fold 0). */
export const top = (x, y, z) => {
  const h = (TURBINE.heading * Math.PI) / 180;
  return [x * Math.cos(h) + z * Math.sin(h), TOWER.top + y, -x * Math.sin(h) + z * Math.cos(h)];
};
/** The three blades (eolienne.js draws them full length; model.js only their solid roots). In the blade's frame:
 *  `len` from the flange to the tip (the tip is at 190 + 3910 = 4100 cm from the axis: a rotor of 82 m), the widest
 *  chord near the root, `twist` the chord's turn at the root, falling to 0 at the tip (degrees, toward +z). */
export const BLADE = { len: 3910, root: 105, chordMax: 330, atMax: 650, chordTip: 45, twist: 14 };
/** THE SECTION OF THE PRINCIPLE (vent.js: « une pale, c'est une aile »): blade A cut across at `y` (blade frame), its
 *  chord there and its twist at pitch 0 (the profile is « de biais au vent »: the wind from +z meets it at `twist`). */
export const SECTION = { y: 2200, chord: 205, thick: 0.2, twist: 9 };
/** Formerie (« le mât a plié en deux »): the upper half folds about a level hinge at `y`, falling AWAY from the road
 *  (toward az `toward`), by `max` degrees at fold 1. A reconstitution: the ARIA file gives a 66 m tower, no model. */
export const FOLD = { y: 3780, toward: 60, max: 78 };
/** The grid (« le réseau »): the cable leaves the tower's foot underground to the delivery station by the road, then
 *  the line goes on along the road. Points on the ground (world). */
export const MAINS = { foot: [-250, 0, 250], post: [-2700, 0, 4200], away: [-2700, 0, -30000], post_size: [300, 260, 220] }; // the station on the road's right verge, past the trees

/* ───────────── THE ROAD (025's route.js, imported) ───────────── */
/** Where the road's car stands (its centre on the ground): the road group goes there, unturned (nose toward −z). */
export const CARAT = [-3500, 0, 9500];
/** « Une pale peut lâcher… ta voiture est à portée » (eolienne.js, `reach`): a signal arc from where a blade tip
 *  passes on the road side of the rotor, down to the car. Its two ends (world). */
export const REACH = { from: top(4100, 250, 380), to: [-3500, 120, 9500] }; // the car lies on the nacelle's +x side

/* ───────────── THE SYSTEM (model.js) — in the nacelle's frame, illustrative sizes ───────────── */
/** The hub's centre (on the rotor axis, in the rotor plane): 250 above the yaw bearing, 380 upwind of it — the hub
 *  height is TOWER.top + 250 = 7800 (78 m). The cast hub; the spinner (glass) around it and its nose. */
export const HUB = { at: [0, 250, 380], r: 170, depth: 260, spinner: 290, nose: 330 };
/** Each blade's bearing (the pitch bearing: a ring of balls between hub and blade, its inner ring toothed): its
 *  flange is `r` from the axis, the ring's radius `ring`. The blade's root (solid in model.js) runs `stub` beyond it. */
export const BEARING = { r: 190, ring: 115, teeth: 120, stub: 300 };
/** ONE PITCH DRIVE PER BLADE (« un moteur par pale »): an electric motor and its gearbox, inside the hub beside the
 *  bearing, its pinion in the toothed ring. In the blade's frame (y toward the tip, measured from the flange). */
export const PITCH = { at: [48.5, -100, 54], motor: { r: 22, len: 50 }, gear: { r: 19, len: 28 }, pinion: { r: 14.5 } };
/** ITS OWN BATTERY (« et sa propre batterie »): the cabinet of batteries of each blade's emergency pitch, in the hub
 *  next to its drive (Enercon [P]; at Formerie, 18 lead batteries in series per blade [P, ARIA 53010]). */
export const BATTERY = { at: [-56, -80, 49], size: [62, 82, 32], cells: 18 };
/** The ring generator (Enercon: no gearbox, the rotor drives it directly), behind the hub; the rotor brake's caliper
 *  on its rim, at the bottom. */
export const GENERATOR = { z: 120, outer: 270, inner: 150, depth: 120 };
export const BRAKE = { angle: 200, w: 40, h: 34, d: 50 };
/** The main carrier over the yaw bearing (the nacelle's frame of cast steel), the yaw bearing and its six motors
 *  (E-82: six yaw drives [P]), the nacelle's cover (glass: Enercon's « egg », from the spinner to its tail), the
 *  anemometer and the wind vane on its roof. */
export const CARRIER = { at: [0, 120, -90], size: [250, 200, 360] };
export const YAW = { r: 165, motors: 6 };
export const NACELLE = { tail: -760, r: 300, y: 250 };
export const VANE = { at: [0, 560, -520] };
/** On the bench, the top of the tower stands under the system (`stub` cm, glass): « en haut du mât ». */
export const STUB = 600;
/** ≈ the radius of the system (spinner nose to tail, and the tower's stub) and its centre, in the nacelle's frame. */
export const SYSTEM = { size: 760, centre: [0, 180, -60] };
