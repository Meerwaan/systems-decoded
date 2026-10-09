// DOSSIER 012 — Gazinière : the plan of the set. Centimetres, y up, the floor is y = 0. No import here:
// hob.js, model.js, fire.js and world.js all read it — it is what lets them be built at the same time.
//
// The kitchen is the one of 009 (../../009-micro-ondes/src/kitchen.js, built here WITHOUT its glass hob and
// without anybody in it). Its back wall is the plane z = 0, the room is on the +z side, its right wall is the
// plane x = 300. The worktop runs along the back wall from x = 31 to x = 260, its top face at y = 90, 62 deep;
// the hood hangs over the hob. The camera mostly stands on the −x / +z side (az −20 … −70), where the key
// light falls: the HERO burner is the front-left one, the nearest to it.

export const WORKTOP = { x0: 31, x1: 260, y: 90, depth: 62, thick: 4 };
/** The hood's underside (a flat canopy), and the ceiling the gas gathers under. */
export const HOOD = { x0: 151, x1: 211, y: 150, depth: 48 };
export const CEILING = 250;

/** The gas hob: a 60 cm top let into the worktop. `top` is its upper face; its shallow body hangs `body` below it. */
export const HOB = { x0: 152, x1: 210, z0: 6, z1: 56, top: 90.8, body: 5.4 };
/** Where a pan stands: the top of the cast-iron pan supports. */
export const GRATE = { y: 95.2 };
// Four burners: centre (x, z), `r` the radius of the circle of flame ports, `knob` the x of its knob.
// The knobs stand in a row on the top, along its front edge (z = KNOBS.z), their axes vertical: you push them DOWN.
export const BURNERS = [
  { id: "hero", x: 166, z: 34, r: 4.4, knob: 163 }, // front left: the big one (≈ 3 kW) — the film's burner
  { id: "fr", x: 196, z: 34, r: 3.3, knob: 175 },
  { id: "rl", x: 166, z: 15, r: 3.3, knob: 187 },
  { id: "rr", x: 196, z: 15, r: 2.5, knob: 199 },
];
export const KNOBS = { z: 50, r: 1.9, h: 2.4, travel: 0.5, float: 0.6 }; // travel: how far a knob goes down when pushed · float: how far it stands above the top at rest

// THE SYSTEM (model.js): everything that belongs to the hero burner, as ONE rigid assembly — burner, knob, tap,
// magnet unit, thermocouple. Its root's origin is the centre of the hero burner on the hob's top face.
// `home`: where that origin stands in the kitchen. `bench`: where it stands on the bench (the tap, which hangs
// under the top, then rests ≈ on the bench's floor, and the assembly is centred over the bench's origin).
export const SYSTEM = { home: [166, 90.8, 34], bench: [1.5, 7.4, -8] };
// The assembly, in ITS OWN frame (origin: the burner's centre on the top face; same axes as the kitchen).
export const PARTS = {
  burner: { capR: 3.7, capTop: 2.5, portsY: 1.6, cupDepth: 2.6 }, // the cap's top is 2.5 above the top face; the flame ports, a ring of radius BURNERS[0].r at y = 1.6
  /** The thermocouple's tip: a pin standing beside the crown, in the flame, on the camera's side. Ø 0.6. */
  tip: { x: -2.9, z: 4.9, y0: 0, y1: 2.9, r: 0.3 },
  /** The knob (its axis vertical) and, under the top, the tap it turns and pushes. */
  knob: { x: -3, z: 16, y: 0 },
  tap: { x: -3, y: -3.9, z: 16, w: 2.4, h: 3.4, d: 2.6 },
  // The magnet unit: a small can screwed into the back of the tap, its axis along z, toward the burner.
  // Inside, from the tap outward: the seal that shuts the gas, its spring, the armature plate, the electromagnet.
  magnet: { x: -3, y: -3.9, z0: 14.7, z1: 10.9, r: 0.9 },
  /** The thermocouple's lead: a thin copper tube from the back of the magnet unit, under the top, up to the tip. */
  lead: [[-3, -3.9, 10.9], [-3, -3.9, 8.6], [-2.9, -3.2, 5.8], [-2.9, -1.2, 4.9], [-2.9, 0, 4.9]],
  /** The gas: the rail feeds the tap from below-front; the tap's outlet tube goes to the injector under the burner. */
  rail: { y: -4.6, z: 18.6, r: 0.8 }, // a pipe along x (the hob has the whole rail; the system carries a short stub of it)
  outlet: [[-1.8, -2.7, 15], [0, -2.7, 15], [0, -3.0, 0.55]], // (above the magnet unit's axis: seen in profile it must not lie behind the heart)
};

/** The saucepan on the hero burner: its bottom on the pan supports, its handle away from the camera. */
export const POT = { x: 166, z: 34, y0: 95.2, r: 10, h: 11.5, water: 9.2, handle: { dir: [0.82, 0, -0.57], len: 17 } };

/** You. `hob`: standing at the hob, facing −z, your LEFT hand on the hero knob (the right one would cross your body). `door`: in the doorway of the right wall, your hand on the light switch (hob.js stands you 12 / 20 cm further in: from here your chest hid the switch). */
export const YOU = { hob: { x: 178, z: 86 }, door: { x: 268, z: 176 } };
export const DOOR = { x: 300, z0: 152, z1: 236, h: 206 };
export const SWITCH = { x: 299.2, y: 112, z: 141 };

// The boil-over: where the foam runs down the saucepan and falls on the burner — a direction in the (x, z) plane from the
// burner's centre: the camera's side, where the thermocouple's tip stands. hob.js pours it there; fire.js lets the crown die from there.
export const SPILL = { dir: [-0.5, 0.87] };
