// DOSSIER 035 — Passage à niveau : where everything stands. No import: shared by world.js, model.js, passage.js.
// Centimetres, Y up. TRUE SCALE (the road, the car, the TGV are reused at their true size).
//
// TWO FRAMES, nested (world.js):
//   · THE CAR'S (025/route.js, 014, 011): it never moves. Origin at the car's centre on the ground, NOSE TOWARD −z,
//     the car's LEFT toward −x (the other lane), RIGHT toward +x. The road, its paint and the wood scroll with `gap`.
//   · THE CROSSING'S (`PN`, passage.js): fixed to the road. Origin on the ground, in the middle of OUR lane (x = 0
//     is the car's line), halfway between the two tracks. The road runs along z (we drive toward −z); the TRACKS run
//     along x. In the car's frame the crossing stands at z = −100·gap: `gap` = metres from the car's centre to the
//     crossing's centre, ahead +, behind − (−3 : the car stuck on the far track; −6.8 : out of the danger zone).
//
// THE CAMERA (kit/lib/stage.js): the camera stands at target + d·(sin az·cos el, sin el, cos az·cos el).
//   az 0 → the camera on +z: BEHIND the car, looking toward its nose (−z) · az −90 → on −x: the car's LEFT side
//   az 180 / −180 → in FRONT of the car, looking back at its face · az 90 → its RIGHT side.
//   (Checked on the bouchons, planche .cache/planches/035/architecte/: az 0 sees the car's tail.)
//
// What is NOT documented (docs/faits/035-passage-a-niveau.md, « à ne pas dire ») and the picture reconstitutes:
// where and how the boom gives (nothing shown: it swings away and fades), the motor in the housing, the boom's
// material. The story's seconds (header) are illustrative — the voice says only « au moins vingt secondes ».

/* ───────────── THE CAR AND THE ROAD (025/route.js, its plan: the same values) ───────────── */
export const CAR = { nose: -235, tail: 235, half: 92, roof: 146, belt: 96, floor: 31, front: -145, rear: 143, wheel: 34, track: 80 };
/** You at the wheel (left-hand drive: the wheel on the car's left, −x). */
export const YOU = { x: -37, y: 62, z: 8, head: [-37, 118, 14] };
export const STEERING = { x: -37, y: 98, z: -34 };
/** The dashboard: a strip of glass behind the wheel, its lights (passage.js `dash`). Car's frame. */
export const DASH = { at: [-37, 96, -72], w: 46, h: 9 };
/** Our lane is x ∈ [−175, 175]; the other lane x ∈ [−525, −175]; the centre line at x = −175. */
export const LANE = { w: 350 };
export const ROAD = { edge: 175, otherEdge: -525, centre: -175, verge: 120 };

/* ───────────── THE CROSSING (crossing's frame) ───────────── */
/** Two tracks across the road. Voie 1 (near, +z) and voie 2 (far, −z) — the car is stuck ON voie 2. Rail heads flush
 *  with the road (y = 0: the TGV of 021 stands with its rail top at y = 0). `entraxe` 420 (French classic lines). */
export const TRACKS = { z: [210, -210], gauge: 143.5, head: 7, sleeper: 60, sleeperLen: 260, ballast: 170, far: 120000 };
/** The deck: the road surface laid over both tracks (z from −deck to +deck), a band of rubber panels between the rails. */
export const DECK = { half: 360 };
/** Where the four half-barriers stand: the boom lines at z = ±BARRIER.z. Right-hand masts (x = right) close OUR lane,
 *  left-hand masts (x = left) the other one. */
export const BARRIER = { z: 650, right: ROAD.edge + 60, left: ROAD.otherEdge - 60 };
/** The four G2 signals (model.js, built four times). `turn` (radians about y): 0 = the model's own frame (the boom
 *  lowered points toward −x), π = mirrored across the road (the boom points toward +x). Every R24 is DOUBLE-FACED
 *  (two lamps back to back: the « second feu au-delà des voies ») so it flashes toward both approaches.
 *  inA  our entry, BEHIND the stuck car (« dans ton dos, la barrière descend »)
 *  outA our exit, AHEAD of the hood: THE HERO (« devant ton capot… la deuxième », the one that gives)
 *  inB  the other lane's entry (far side) · outB the other lane's exit (near side) */
export const SIGNALS = {
  outA: { at: [BARRIER.right, 0, -BARRIER.z], turn: 0, pair: "out" },
  inA: { at: [BARRIER.right, 0, BARRIER.z], turn: 0, pair: "in" },
  inB: { at: [BARRIER.left, 0, -BARRIER.z], turn: Math.PI, pair: "in" },
  outB: { at: [BARRIER.left, 0, BARRIER.z], turn: Math.PI, pair: "out" },
};
export const HERO = "outA";

/* ───────────── THE SIGNAL G2 (model.js, its own frame) ───────────── */
/** Mast foot at the origin; the R24 faces ±z; the boom pivots about the z axis at `pivot` on the housing's side, and
 *  LOWERED it points toward −x, `len` long (it stops short of the centre line: a HALF-barrier). Raised: vertical.
 *  Its section is rounded, painted in white and red bands `band` long (retroreflective all over). */
export const MAST = { h: 300, r: 6 };
export const R24 = { y: 228, r: 15, plate: [56, 56], visor: 14 }; // one lamp each face, its black plate, its visor
export const BELL = { y: 288, r: 11 }; //   the bell, on top of the mast
export const HOUSING = { at: [0, 0, 0], size: [46, 112, 40] }; // the boom's housing (motor, counterweight) at the foot
export const BOOM = { pivot: [-30, 96, 0], len: 400, w: 9, band: 50 };
/** ≈ the radius of the signal, and its centre (boom lowered): sizes the bench, its light, its shadows. */
export const SYSTEM = { size: 260, centre: [-170, 150, 0] };

/* ───────────── THE STORY'S PLACES (car's frame where it says so) ───────────── */
/** The car stuck on voie 2: its centre 3 m past the crossing's centre (crossing at z = +300 in the car's frame). Its
 *  nose 115 cm short of the hero boom; voie 2 passes under its rear half. */
export const GAP_STUCK = -3;
/** Out of the danger zone (« tes roues quittent les rails »): the boom given, the car 3.8 m further, its tail clear of
 *  the TGV's flank (voie 2 ± 145) by ≈ 50 cm; its nose 5 cm short of the queue's last car. */
export const GAP_OUT = -6.8;
/** Where the hero signal stands in the CAR's frame while the car is stuck: the bench is set there (world.js), so that
 *  the cut to the bench matches on it, in place. */
export const BENCHAT = [BARRIER.right, 0, -BARRIER.z - 100 * GAP_STUCK];

/** The queue ahead, beyond the exit boom, in our lane (crossing's frame): the last car is 011's car (its centre),
 *  the ones further on are only their stop lights in the night. */
export const FILE = { car: -1200, lights: [-1900, -2650, -3400] };

/** The TGV (021/train.js, at true scale ≈ 202 m, nose toward −x): on VOIE 2, it comes from +x. `train` (metres) =
 *  where its nose is along the track from our lane's line (x = 0): + still coming, 0 on the car, − gone past.
 *  Illustrative speed in the story (never shown): TRAIN_KMH. The second train (`other`) comes on VOIE 1 from −x. */
export const TRAIN = { track: 1, length: 20250, half: 145, kmh: 140 };
export const OTHER = { track: 0, from: 150000, to: 60000 };
/** The ruler of the stopping distance, along voie 2 from the road toward the train: 800 m at 90 km/h
 *  (SNCF Réseau 2020, Sécurité routière 2026). A tick every 100 m. */
export const RULER = { len: 80000, tick: 10000 };

/** Where to call from, on our verge, behind the entry barrier — out of the danger zone (crossing's frame). Both stand
 *  side by side for the film (« le téléphone… ou la pancarte » : in reality one or the other, on both sides). */
export const PHONE = { at: [ROAD.edge + 150, 0, BARRIER.z + 220], h: 150 };
export const SIGNBOARD = { at: [ROAD.edge + 150, 0, BARRIER.z + 380], h: 190, w: 60 };
/** Everybody out (« tout le monde sort »): you and a passenger, from the car's doors to the verge by the phone (crossing's frame, the car stuck at GAP_STUCK). */
export const PEOPLE = { from: [[-95, 0, -260], [95, 0, -260]], to: [[ROAD.edge + 260, 0, BARRIER.z + 120], [ROAD.edge + 340, 0, BARRIER.z + 40]] };
