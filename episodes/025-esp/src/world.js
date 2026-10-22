// DOSSIER 025 — ESP : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by route.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ROAD: a French country road at night, wet, a boar in your lane — and 014's car seen like an X-ray,
// you at the wheel, and solid in all that glass the only things that matter: the four brakes and their wheel
// sensors, the steering angle sensor, the yaw sensor, the ESP unit and its computer. The BENCH: that same system
// alone on its pool of light — the whole car's skeleton, standing on four glass tyres. ONE object, re-parented:
// the cut from one to the other matches on it, in place.
// Three colours. signal is the threat: the boar's eyes in the beams, the rear that lets go, its trails, the car's
// arrow when it no longer goes where you steer, the comparator when the answer is no. veille is the system alive:
// the sensors' pulses, the comparator when the answer is yes, the ONE brake that bites, the turn it gives back.
// ink is the rest — and where your steering wheel asks to go.
//
// THE STORY (docs/faits/025-esp.md; the scene is a scenario, `sources` says so): at night, about 80 km/h on a wet
// country road (illustrative: the header's speed is never said), a boar in your lane. You swerve LEFT; the rear
// lets go (oversteer) and the car starts to spin. The ESP cuts the engine's power first, then brakes ONE wheel:
// the front one OUTSIDE the turn — the front-RIGHT — and the car turns back into line. (Which wheel: one secondary
// source only; the picture shows it, the screen claims nothing more than the script.) No delay in milliseconds,
// no « une seule roue, toujours ». Nobody is hurt; the boar is never hit.
//
// THE FILM IS SLOWED DOWN on the road (like 015): the header gives the story's speed, `gap` and `rolled` move at
// MPS / SLOWMO metres per film second. TWO FRAMES (plan.js): `onboard` 0 the road lies still and the car turns on
// it; 1 the car stands square and the road turns under it. A cut may switch it; inside a shot it holds (or glides
// slowly, sine.inOut, while yaw is near 0). The bench never turns — but on it, `onboard` 0 lets `yaw` turn the
// skeleton on its pool (the yaw sensor's gesture).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  CAR, YOU, STEERING, HUB, HUBS, TYRE, ENGINE, DISC, CALIPER, RING, corner, UNIT, ECU, SAS, YAWS, LINES, SYSTEM, BENCHAT,
  LANE, ROAD, TRUCK, BOAR, MOOSE, ARROW,
} from "./plan.js";
import { buildSystem } from "./model.js";
import { buildRoute } from "./route.js";

const DEG = Math.PI / 180;
export const SET = { BENCH: 0, ROAD: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The story's speed (illustrative: a French two-way road), what it is in metres per second, and how much the film
 *  slows it on the road: `gap` and `rolled` move at MPS / SLOWMO ≈ 3.7 m per film second. */
export const KMH = 80;
export const MPS = KMH / 3.6;
export const SLOWMO = 6;
/** The écart the header shows: how far, in degrees, the car points from where the steering wheel asks. */
export const ecartOf = (W) => Math.abs(W.yaw - W.aim);

const [CX, CY, CZ] = SYSTEM.centre;

// The first frame is the hook, « Un sanglier. » : low on the wet road, just in front of the boar and looking back
// at the car — the boar's glass silhouette in the foreground, its eyes giving back two signal points, the car's
// two headlamps rushing at it behind, their long reflections on the water, the rain in the beams.
// PROVISIONAL (candidate b): the planche of four candidates (docs/025-actes.md) chooses it, and it is pasted here
// before the acts are staged.
/** The studio (kit/lib/stage.js, docs/scale/2-rendu-decors.md). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE below): the part in focus, what lies in front
 *           and behind it melts — the eye goes where the voice is. The hook and the wide shots stay sharp everywhere.
 *  `air`    the headlamps' light hanging in the rain, a tight pool that follows them: tried on the hook (1 → amount 2),
 *           no visible gain at 270 px — off. Not on the bench: it greys its green.
 *  `finish` the solids' surface: the grain of machining and the smudges that break a highlight (full screen only). */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };
const AIR_ROAD = { amount: 2, spread: 0.15 };

// the hook keeps its pinhole (dof 0): the picture Merwan liked, sharp from the boar to the lamps
export const POSE0 = { tx: 0, ty: 50, tz: -2035, d: 950, az: -172, el: 3, fov: 34, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.ROAD,
  onboard: 0, //  0 the road's frame (the road still, the car turns on it) · 1 the car's frame (the car square, the road turns under it)
  /* ── the road and the car (route.js) ── */
  shell: 1, //    the X-ray of the car and the road: glass, fine lines (0–1)
  gap: 18, //     metres from your front bumper to the boar (the road, its paint, the rain come with it; it goes negative once the boar is passed)
  lane: 0, //     metres the car has moved to the LEFT of its lane (3.5: the other lane's centre)
  yaw: 0, //      degrees the car has turned to the LEFT on the road (its heading)
  aim: 0, //      degrees the steering wheel asks it to have turned: where you want to go (the ink arrow, the comparator's ink needle)
  steer: 0, //    the steering wheel in your hands and the front wheels: −1 full right … 1 full left
  kmh: KMH, //    the car's speed: the header's big readout (and how fast the rain, the road, the wheels go by)
  rolled: 0, //   metres the wheels have rolled: their rotation (it grows with the travel)
  rain: 1, //     the wet night: streaks in the beams, the water's reflections, the spray (0–1)
  boar: 1, //     the boar in your lane at `gap`, its eyes in the beams (0–1)
  moose: 0, //    the moose (0–1), standing in the lane at `gap` — or at the verge, see `mooseAt`
  mooseAt: 0, //  where the moose stands: 0 in your lane (1997) → 1 at the far verge, in the beams' edge (the hook's C)
  you: 1, //      0 nobody · 1 you at the wheel: a body of glass, hands on the wheel
  slide: 0, //    the rear lets go: the rear tyres' trails, signal, curving out on the wet road (0–1)
  arrows: 0, //   the two arrows on the road from the car: ink where you steer (`aim`), the car's own along `yaw` (0–1)
  moment: 0, //   the turn the braked wheel gives the car: a veille arc around it, against the spin (0–1)
  gas: 1, //      the engine drives the front wheels: ink heads flowing along the drive shafts (1) → cut (0)
  tip: 0, //      1997: the car tips — its left wheels lift, it leans on its right ones (0 flat → 1 ≈ 40°, the tipping point: never on its roof, never landed: « elle bascule », side or roof unknown)
  rocket: 0, //   the next file's teaser, far in the night sky over the wood: 0 nothing · → 0.7 a light climbing on its trail · 0.7–0.8 the trail breaks (a small signal flare) · → 1 a veille point falls away under it, slowly
  archive: 0, //  1997 (the header shows « Oct. 1997 », no speed: no speed of the test is sourced) — 0 today, 1 then
  /* ── the system (model.js) ── */
  bFL: 0, bFR: 0, bRL: 0, bRR: 0, // each brake: 0 open → 1 the pressure runs down its line, the pads bite, the disc goes veille
  sense: 1, //    the sensors alive: slow veille pulses up their wires to the computer (0–1)
  alarm: 0, //    the comparison's answer: 0 yes (veille) → 1 no (signal) — the comparator and the car's arrow. Held frank
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart, in ONE vertical frame
  litSteer: 0, litYaw: 0, litWheels: 0, litEcu: 0, // the part the voice is naming glows faintly veille (litWheels: the four speed sensors)
  litCorners: 0, litFR: 0, // the four wheels' corners, and the front-right one alone (« une roue… pas les quatre »)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 50, fz: -900, fs: 1200, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The state act 1 hands to act 2 (act 1 ENDS on it, act 2's cut STARTS from it: the header's écart does not jump
 *  on « Alors… on l'ouvre »): the spin thrown the other way by a counter-steer too strong (« …ou trop fort »). */
export const HANDOFF = { yaw: -24, aim: -6, steer: -0.8, lane: 2.4 };

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/025-route.md, 025-model.md).
 *  [0] = written for onboard 0 (the road's frame), [1] for onboard 1 (the car's) — the same when yaw is 0. */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [FRX, FRY, FRZ] = HUBS.FR;
export const VIEW = {
  hook: POSE0,
  /* ── the road ── */
  // [0] behind the car, low, over its roof: the beams on the wet road, the boar in them (candidate a)
  chase: { ...P, tx: 0, ty: 60, tz: -1100, d: 1700, az: -8, el: 6, fov: 38, shift: 150 },
  // [0] from above, the car in the middle: the swerve, the spin, the arrows — THE frame of the toupie (candidate c)
  top: { ...P, tx: 0, ty: 0, tz: -150, d: 1900, az: -25, el: 55, fov: 44, shift: 120 },
  // [0] high and wide: the road, both verges and their ditches, the edge of the wood — where the spin would end
  wide: { ...P, tx: -150, ty: 0, tz: -300, d: 3600, az: -30, el: 42, fov: 40, shift: 100 },
  // [0] low in front: the nose (« le nez revient ») · low behind: the rear (« l'arrière suit »)
  front: { ...P, tx: 0, ty: 45, tz: -235, d: 900, az: -150, el: 6, fov: 36, shift: 150 },
  rear: { ...P, tx: 0, ty: 45, tz: 200, d: 900, az: -35, el: 6, fov: 36, shift: 150 },
  // [0] the far verge in the beams' edge, the moose standing there (the hook's C) — from behind the car
  verge: { ...P, tx: -500, ty: 100, tz: -1600, d: 2000, az: 12, el: 8, fov: 36, shift: 140 },
  // [0] 1997: the car on two wheels, from the front-left, low
  tip: { ...P, tx: 0, ty: 70, tz: 0, d: 1100, az: -140, el: 4, fov: 36, shift: 150 },
  // [1] over your shoulder: your hands on the wheel, the boar through the windscreen (candidate d)
  shoulder: { ...P, tx: -20, ty: 100, tz: -300, d: 370, az: 8, el: 4, fov: 50, shift: 60 },
  // [1] your hands on the wheel and, behind it on the column, the steering angle sensor
  hands: { ...P, ...CLOSE, tx: -37, ty: 94, tz: -44, d: 200, az: -60, el: 14, shift: 150 },
  // [1] the engine and its drive shafts (« il coupe les gaz »)
  engine: { ...P, ...CLOSE, tx: 0, ty: 45, tz: -165, d: 520, az: -160, el: 40, fov: 30, shift: 80 },
  // [1] the ESP unit and its computer, the comparator on its face
  unit: { ...P, ...CLOSE, tx: -52.5, ty: 74.8, tz: -125, d: 140, az: -50, el: 16, shift: 140 },
  // [1] THE wheel: the front-right brake seen from the left, through the car's glass (the disc is inboard)
  cornerFR: { ...P, ...CLOSE, tx: 70, ty: 42, tz: -142, d: 340, az: -135, el: 30, shift: 140 },
  // [1] the whole system in the car, everything else dim: act 2 cuts to the bench from it (benchCut, origin [0,0,0])
  system: { ...P, tx: CX, ty: CY, tz: CZ, d: 1200, az: -30, el: 32, fov: 32, shift: 120, side: 130 },
  /* ── on the bench (the root at BENCHAT = the origin: a point of the car is at the same place there) ── */
  whole: { ...P, tx: 0, ty: 29, tz: 0, d: 1150, az: -12, el: 28, fov: 32, shift: 160, side: 90 },
  // the exploded view, in ONE vertical frame (fs SIZE)
  exploded: { ...P, tx: 0, ty: 55, tz: 0, d: 1380, az: -12, el: 30, fov: 32, shift: 160, side: 70 },
  wheelBench: { ...P, ...CLOSE, tx: -37, ty: 95, tz: -40, d: 270, az: -20, el: 34, shift: 120 },
  yawBench: { ...P, ...CLOSE, tx: YAWS.at[0], ty: YAWS.at[1], tz: YAWS.at[2], d: 180, az: -40, el: 30, shift: 120 },
  ecuBench: { ...P, ...CLOSE, tx: -52.5, ty: 74.8, tz: -125, d: 110, az: -45, el: 14, shift: 120 },
  frBench: { ...P, ...CLOSE, tx: FRX - 6, ty: 36, tz: FRZ, d: 260, az: -40, el: 22, shift: 120 },
  // the rocket of the next file, the car stopped (kmh 0, lane -0.6, gap fixed): you and the car at the bottom, the whole trajectory in frame
  rocket: { ...P, tx: -150, ty: 5200, tz: -17000, d: 19650, az: 0.5, el: -14.7, fov: 62, shift: -340 },
};

/** What a cut to the bench sets, whatever came before: the system whole, at rest, nothing braking, nobody.
 *  `kmh` and `archive` keep their story values (the header goes on reading the car); yaw / aim / steer go square
 *  (act 2 starts from HANDOFF instead, so that the écart does not jump on the cut). */
export const BENCHED = {
  onboard: 1, shell: 0, you: 0, boar: 0, moose: 0, slide: 0, arrows: 0, moment: 0, tip: 0, rocket: 0, rain: 0,
  yaw: 0, aim: 0, steer: 0, bFL: 0, bFR: 0, bRL: 0, bRR: 0, sense: 0, alarm: 0, explode: 0,
  litSteer: 0, litYaw: 0, litWheels: 0, litEcu: 0, litCorners: 0, litFR: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the road sets: night, wet, you at the wheel, the car square in its lane at the story's speed,
 *  the engine driving, nothing braking, no animal. `gap` and `rolled` are the act's (everything periodic wraps). */
export const STAGED = {
  onboard: 0, shell: 1, lane: 0, yaw: 0, aim: 0, steer: 0, kmh: KMH, rain: 1, boar: 0, moose: 0, mooseAt: 0, you: 1,
  slide: 0, arrows: 0, moment: 0, gas: 1, tip: 0, rocket: 0, archive: 0,
  bFL: 0, bFR: 0, bRL: 0, bRR: 0, sense: 1, alarm: 0, explode: 0,
  litSteer: 0, litYaw: 0, litWheels: 0, litEcu: 0, litCorners: 0, litFR: 0,
  mood: 1, gel: 0, fx: 0, fy: 50, fz: -100, fs: 700,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const route = buildRoute();
  const system = buildSystem();
  const set = new THREE.Group(); // the road set: turned back by +yaw·(1 − onboard) (plan.js, « two frames »)
  const mount = new THREE.Group(); // where the system stands in the car: the car's origin
  set.add(route.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench, at the same place
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);
  // the headlamps, for the air's pool (it follows them wherever the camera goes)
  const lamps = new THREE.Object3D();
  lamps.position.set(0, 70, CAR.nose + 10);
  mount.add(lamps);
  const lampsAt = new THREE.Vector3();

  return {
    route, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const turn = S.yaw * DEG * (1 - Math.min(1, Math.max(0, S.onboard)));
      bench.group.visible = onBench;
      set.visible = !onBench;
      set.rotation.y = turn;
      benchMount.rotation.y = turn;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      // 1997: the car of the test had NO ESP — the system is not in it (and it does not tip with the body)
      system.root.visible = onBench || S.archive < 0.5;
      system.update({
        bench: onBench ? 1 : 0, shell: onBench ? 0 : S.shell, steer: S.steer, aim: S.aim, yaw: S.yaw, alarm: S.alarm,
        rolled: S.rolled, kmh: S.kmh, bFL: S.bFL, bFR: S.bFR, bRL: S.bRL, bRR: S.bRR, sense: S.sense,
        explode: onBench ? S.explode : 0, litSteer: S.litSteer, litYaw: S.litYaw, litWheels: S.litWheels, litEcu: S.litEcu,
        litCorners: S.litCorners, litFR: S.litFR,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        route.update({
          shell: S.shell, gap: S.gap, lane: S.lane, yaw: S.yaw, aim: S.aim, steer: S.steer, kmh: S.kmh, rolled: S.rolled,
          rain: S.rain, boar: S.boar, moose: S.moose, mooseAt: S.mooseAt, you: S.you, slide: S.slide, arrows: S.arrows,
          alarm: S.alarm, moment: S.moment, gas: S.gas, tip: S.tip, rocket: S.rocket, bFR: S.bFR,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      const air = stage.air;
      air.amount = onBench ? 0 : AIR_ROAD.amount * LOOK.air * S.rain * S.shell;
      air.source = onBench ? null : lamps.getWorldPosition(lampsAt);
      air.spread = AIR_ROAD.spread;
      air.lift = 0;
      air.floor = 0;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00016;
    },
  };
}

export {
  CAR, YOU, STEERING, HUB, HUBS, TYRE, ENGINE, DISC, CALIPER, RING, corner, UNIT, ECU, SAS, YAWS, LINES, SYSTEM, BENCHAT,
  LANE, ROAD, TRUCK, BOAR, MOOSE, ARROW,
};
