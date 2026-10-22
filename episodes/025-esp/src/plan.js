// DOSSIER 025 — ESP : the plan of the set. Centimetres, y up, the road is y = 0. No import here:
// model.js, route.js and world.js all read it — it is what lets them be built at the same time.
//
// THE CAR IS 014's (011's body: 4.7 m long, 1.85 m wide, left-hand drive), its numbers copied below unchanged:
// its centre on the ground is the ORIGIN, its nose points toward −z, you sit on the −x side. LEFT is −x.
//
// TWO FRAMES, ONE NUMBER (world.js, `onboard`). The car turns on the road by `yaw` (degrees, + = to the LEFT: its
// nose swings from −z toward −x). route.js draws, like 014, the road turning around the car by −yaw (its `pivot`)
// and sliding by `lane`; world.js turns the whole set back by +yaw·(1 − onboard):
//   onboard 0  THE ROAD'S FRAME: the road lies still along z, the car turns on it — the spin, the arrows, the boar
//   onboard 1  THE CAR'S FRAME: the car stands square, the road turns under it — every close shot of the car and
//              of the system, and the cut to the bench (the bench never turns: the raccord holds whatever the yaw)
// With yaw 0 the two are the same. Every pose of VIEW is written in the frame its shot uses (said beside it).
// Azimuth (kit/lib/stage.js: the camera stands at t + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at
// +z — BEHIND the car, looking along the road toward the nose —, −90 at −x (its LEFT flank), ±180 in front (−z).
// The key light comes from −x, +y, +z: from behind-left; a camera between az −20 and −70 has it at its shoulder.
//
// ONE SCALE: TRUE for the car, the road and its verges; the system's parts are ILLUSTRATIVE (sizes guessed from
// Bosch pictures: never written on screen). The boar and the moose are at about their true size.

/* ───────────── THE CAR (route.js; 014's values) ───────────── */
/** The car: bumpers, axles, wheels. */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146, belt: 96, floor: 31, front: -145, rear: 143, wheel: 34, track: 80 };
/** You, at the wheel; the steering wheel's centre. */
export const YOU = { x: -37, y: 62, z: 8, head: [-37, 118, 14] };
export const STEERING = { x: -37, y: 98, z: -34 };
/** The front-left wheel's centre (014's name, for route.js), and the four of them: FL, FR, RL, RR. */
export const HUB = [-80, 34, -145];
export const HUBS = { FL: [-80, 34, -145], FR: [80, 34, -145], RL: [-80, 34, 143], RR: [80, 34, 143] };
export const TYRE = { r: 34, w: 22, rim: 21.5 };
/** The engine block between the front wheels and the two drive shafts to the front hubs (the car is a front
 *  driver): « il coupe les gaz » is the drive that stops flowing along them (`gas`). */
export const ENGINE = { at: [0, 52, -172], size: [62, 46, 48] };

/* ───────────── THE SYSTEM (model.js) — illustrative sizes, at their true PLACES in the car ─────────────
   ONE rigid assembly, its root's origin = the car's (the ground under its centre): in the car it hangs on the
   car's mount, on the bench it stands on its four tyres (drawn by model.js on the bench only).
   The brake of each wheel (014's, mirrored): a disc inboard of the rim, a caliper on its rear top quarter, a
   toothed ring and its speed sensor. The FRONT-RIGHT one is the film's (« l'avant, à l'extérieur du virage »:
   the swerve is to the LEFT): of the four, the one that brakes. */
export const DISC = { r: 15.5, thick: 2.6, inset: 6 }; //        the disc stands `inset` cm inboard of the hub centre
export const CALIPER = { up: 11, back: 8, w: 8, h: 9, d: 13 }; // on the disc's rear (+z) top quarter
export const RING = { r: 6.4, inset: 13.5, teeth: 44 }; //         further inboard; its sensor's tip just above the teeth
/** Where a brake's parts are, for a wheel `k` of HUBS: the side's sign (−1 left, +1 right) points outboard. */
export const corner = (k) => {
  const [x, y, z] = HUBS[k];
  const s = Math.sign(x);
  return {
    hub: [x, y, z], side: s,
    disc: [x - s * DISC.inset, y, z],
    caliper: [x - s * DISC.inset, y + CALIPER.up, z + CALIPER.back],
    ring: [x - s * RING.inset, y, z],
    sensor: [x - s * RING.inset, y + RING.r + 2, z],
  };
};
/** The ESP's hydraulic unit, in the engine bay behind the front-LEFT arch (014's ABS unit, the same block: the
 *  ESP is the ABS's hardware and more): valve block, pump motor, and the COMPUTER clipped on it. On the
 *  computer's face (toward −x / +z, the camera's side), THE COMPARATOR: two needles — where you steer (ink, read
 *  off `aim`) and where the car goes (veille or signal, read off `yaw`) — and the gap between them. It is a
 *  picture of the computation, not a part of the real thing: `sources` says so. */
export const UNIT = { at: [-50, 62, -128], w: 13, h: 11, d: 10 };
export const ECU = { at: [-50, 76, -126], w: 15, h: 6, d: 12, dial: 5.5 };
/** The steering angle sensor: a ring on the steering column, just behind the wheel (« où tu veux aller »). */
export const SAS = { at: [-37, 92, -48], r: 5.5 };
/** The yaw rate sensor, at the car's heart, on the floor tunnel (« où la voiture va vraiment »). */
export const YAWS = { at: [0, 30, -10], size: [6, 2.5, 6] };
/** The lines: from the unit to each caliper (four brake lines), and the wires of the sensors to the computer. */
export const LINES = {
  FL: [[-56, 64, -132], [-64, 56, -137], [-72, 47, -138]],
  FR: [[-44, 60, -132], [0, 58, -150], [50, 56, -150], [72, 47, -138]],
  RL: [[-50, 56, -124], [-30, 24, -100], [-30, 22, 110], [-72, 47, 151]],
  RR: [[-46, 56, -124], [30, 24, -100], [30, 22, 110], [72, 47, 151]],
};
/** ≈ the radius of the system on the bench (the whole car's footprint: 4.7 m × 1.85 m) and its centre. */
export const SYSTEM = { size: 260, centre: [0, 50, -20] };
/** On the bench the root stands at the bench's centre, its tyres on the floor: the cut matches in place. */
export const BENCHAT = [0, 0, 0];

/* ───────────── THE ROAD AND THE NIGHT (route.js) ───────────── */
/** A French country road at night, wet: one lane each way. Your lane's centre is x = 0, the other lane's at
 *  −LANE.w (you drive on the right: the other lane is on your LEFT). Beyond the edge lines, the verges (grass,
 *  a grid), and the DITCHES — « c'est lui qui t'évite le fossé » —, then the trees (route.js draws the edge of the
 *  wood; the decorator dresses it). Distances along the road scroll with `gap`, like 014. */
export const LANE = { w: 350 };
export const ROAD = { edge: 175, otherEdge: -525, verge: 120, ditch: { w: 140, depth: 60 }, trees: 520 };
/** The truck of 014: not in this film (route.js keeps it at 0, or drops it). */
export const TRUCK = { half: 125, floor: 110, top: 390, bar: 55 };
/** THE BOAR (« Un sanglier »): in your lane, `gap` metres ahead of the bumper — glass, simple, about its true
 *  size; its eyes give the headlamps back in signal. It stands still (the film is slowed down). */
export const BOAR = { x: 20, len: 140, h: 85 };
/** THE MOOSE (« à un élan » — the C of the hook, and 1997): the same place in the lane when it stands there
 *  (`moose`), or at the verge in the beams' edge (`mooseAt` 0 lane → 1 verge, on your left, the other side's). */
export const MOOSE = { x: 0, verge: -780, len: 260, h: 210 };
/** The arrows on the road, from the car's centre (`arrows`): where the steering wheel asks to go (ink, along
 *  `aim`) and where the car really points (along `yaw`: veille while the two agree, signal when `alarm`). */
export const ARROW = { len: 900, w: 26 };
