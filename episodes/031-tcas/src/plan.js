// DOSSIER 031 — Anti-collision (TCAS) : the plan of the sets. Centimetres, y up. NO IMPORT here: world.js, tcas.js
// and cockpit.js all read it.
//
// THE FRAME IS YOUR PLANE'S (as in 023, whose A330 is reused as it is: episodes/023-eolienne-de-secours/src/avion.js):
// your plane stands still at the origin, NOSE TOWARD −x, up +y, its LEFT side (the captain's) toward +z. The world
// comes to it: the sea and the cloud deck, the other plane, the waves. When you climb (`up`), the world goes down.
//   Camera azimuth (kit/lib/stage.js: camera = target + d·(sin az·cos el, sin el, cos az·cos el)), checked:
//   az 0 → the camera on your LEFT flank (+z) · az −90 → ahead of your nose (−x) · az 90 → behind the tail (+x)
//   az ±180 → your right flank (−z). On screen from az 0, +x is to the right: your nose points LEFT, the other
//   plane comes from the left.
//
// THE OTHER PLANE: the same A330, a second instance of buildAvion (no livery, no company: an airliner), turned
// half a turn about y (its nose toward +x), head-on, on your track (z 0), at your level until it dives (`down`).
// Its centre stands at x = OTHER.x0 − gap·100 (gap: metres between the two noses, drawn), y = −(up + down)·100.
//
// A MODEL AT THE SCALE OF THE SUBJECT (the 008 rule): 35 seconds before the closest point two airliners at cruise
// are ≈ 15 to 20 km apart, and they pass a few hundred feet apart vertically — neither fits a vertical frame with a
// plane 59 m long in it. Here the gap is drawn in metres that mean nothing (`gap` 0 → 2400), the climb and the dive
// are a few tens of metres, the sea and the cloud deck are 023's maquette (the altimeter's scale: the sea ≈ 300 m
// under the plane). NO length, NO height, NO distance is ever written on this picture; the voice gives the real
// orders of magnitude only in seconds and in feet per minute (true, [P] FAA/BFU). `sources` says it.

/* ── your plane: 023's A330-200 (its own plan: episodes/023-eolienne-de-secours/src/plan.js) ── */
// what this file needs of it, copied (023's plan.js: FUSE, YOU) — never imported, never changed there
export const PLANE = { nose: -2900, tail: 2980, r: 282, len: 5880, cockpit: -2550, span: 6030 };
/** 023's passenger « you », a body of glass at a left window (023 `you`): the sleeper of the like. */
export const SLEEPER = { at: [-1500, -40, 215] };

/* ── the flight deck (cockpit.js), in the plane's frame — the A330's: two seats, side sticks on the outer consoles ── */
// The windscreen: 023 draws four panes a side between x −2768 and −2584 (it already has them, as lines).
export const DECK = {
  floor: -62, //               the cockpit floor's y
  windscreen: [-2770, -2580], // x of the panes (023's)
  shield: { x: -2700, y: 52, w: 210, depth: 34 }, // the glare shield over the panel, across the deck (w along z)
  panel: { x: -2688, y: 18, tilt: 14 }, //          the main panel's face (screens on it), leaning back by `tilt` degrees
  seat: { x: -2560, z: 55 }, //                      captain at z +55 (left), first officer at z −55
  eye: { x: -2545, y: 92 }, //                       a pilot's eye height (seated)
  stick: { x: -2600, y: 8, z: 108 }, //              the captain's side stick on the left console (z −108 for the F/O)
};
/** The two screens of each pilot, on the panel (z: captain's side; mirrored for the F/O). Sizes: a maquette. */
export const SCREENS = {
  pfd: { z: 78, w: 19, h: 19 }, // the PFD: the vertical speed scale and its arcs (the VSI) on its right edge
  nd: { z: 54, w: 19, h: 19 }, //  the ND: the traffic display, your plane's symbol at the centre, the intruder's symbol
};

/* ── the TCAS in the plane (tcas.js gives the parts, world.js mounts them here), the plane's frame ── */
// Positions are illustrative (an A330 has its TCAS processor in the avionics bay under the flight deck, its two
// directional antennas on the crown and the belly, forward): never written on screen.
export const ANT = {
  top: [-2150, 282, 0], // the upper directional antenna, on the crown, behind the flight deck
  bottom: [-2050, -282, 0], // the lower one, under the belly
};
export const BAY = {
  cpu: [-2440, -175, 0], // the TCAS processor, in the avionics bay under the flight deck
  xpdr: [-2440, -175, -45], // the Mode S transponder, next to it
};

/* ── the other plane ── */
export const OTHER = {
  x0: -5800, //      its centre's x when gap is 0 (its nose then touches yours: x = PLANE.nose): centre = x0 − gap·100
  gap0: 1400, //     the gap of the first frame (drawn metres): its lights already big in the night
  // its anti-collision beacon (red: signal) on the crown and belly; its landing lights (ink) in the wing roots and nose gear
  beacon: [[-200, 300, 0], [-200, -300, 0]],
  landing: [[-2350, -260, 0], [-420, -160, 330], [-420, -160, -330]], // in ITS frame (nose −x before the half turn)
};

/* ── the waves (cockpit.js, buildOndes): in the world frame, between the two antennas ── */
export const WAVES = {
  period: 1, //        one interrogation a second (true when an alert is possible: [P] FAA)
  ring: 900, //        the radius a ring reaches before it fades (drawn cm) — a sphere of light, never a line
  atc: { from: [-3000, -30000, 600] }, // where the controller's wave comes up from: the ground, ahead, far below
};

/* ── the bench (tcas.js, buildTcas): the system alone on its pool, a maquette of its parts gathered ── */
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SYSTEM = { size: 46 };
/** Where the parts stand on the bench (bench frame: the processor's centre at the origin, y up). Illustrative. */
export const RIG = {
  cpu: [0, 0, 0], top: [0, 28, 0], bottom: [0, -30, 0], xpdr: [-15.5, -4, -31.3], // the heart, the two antennas, the Mode S transponder (tcas.js LAY)
  panel: [15.2, -19, 44.1], speaker: [22.1, 14, 42.1], // the two screens and the speaker, in front
  peer: [-57.9, 40, -61.7], // THE OTHER PLANE's transponder, far at the left of the pool
};
/** The bench's origin in the world (the bench is drawn elsewhere; nothing of the sky shows on it). */
export const BENCHAT = [0, 0, 0];

/* ── the story's numbers (all [P] FAA « Introduction to TCAS II v7.1 » and BFU AX001-1-2/02) ── */
export const TCAS = {
  ta: 48, //     seconds before the closest point: TRAFFIC, TRAFFIC (above 20 000 ft)
  ra: 35, //     …and the order (RA)
  react: 5, //   seconds the pilot has to answer an RA
  rate: 1500, // ft/min: the climb (or descent) an RA asks
};
