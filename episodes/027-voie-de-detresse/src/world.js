// DOSSIER 027 — Voie de détresse : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by col.js, camion.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SCENE: a mountain road at night, the long descent from the top of the col to a bend at the bottom, the
// ravine beyond it — and a 40-tonne truck seen like an X-ray, you at the wheel; solid in all that glass only what counts:
// its drums, hot, and the front-left wheel. To the right, before the bend, the escape lane: SOLID, it is the system.
// The BENCH: that same lane alone on its pool of light, raised on its block of ground (the cut-away shows its depth) —
// ONE object, re-parented: the cut from one to the other matches on it, in place (the bench is tilted like the slope).
// Three colours (plan.js): signal the heat, the brake lights, the bend and the ravine · veille the lane and what it does
// · ink the rest.
//
// THE STORY (docs/faits/027-voie-de-detresse.md; the scene is a scenario, `sources` says so). Your brakes are not
// broken: they are too hot (fading — the lining's grip goes, the drum grows, the pedal sinks and the truck does not
// slow). 80, 90 km/h (illustrative). At the bottom a bend and the ravine; on the right an escape lane — a pit of ROUND
// gravel, a concrete barrier, an earth mound at its end. You steer right; the wheels leave the bitumen and sink; each
// turn of a wheel has to push the gravel in front of it: about half a g (4.9 m/s², the Laffrey project's design value;
// 0.516 g measured on US beds) — without touching the pedal. Your forty tonnes stop. No distance is said or written.
//
// THE CAMERA RIDES WITH THE TRUCK (`ride` 1): every shot written around the truck as it stands on the first frame (its
// front axle at the origin) holds while the truck runs down the road — the director adds its travel, truckAt(s), to the
// camera and to the light. `ride` 0: the shot is written in the road's frame (the bend, the valley, the bench). `ride`
// changes ON A CUT ONLY (a cut that keeps the picture: the same pose plus travel(s)).
// THE FILM IS SLOWED DOWN on the road: `s` moves at rate(kmh) = kmh / 3.6 / SLOWMO metres per film second, in straight
// runs ("none"); `kmh` is the story's speed, the header's. A cut may set `s` anew (RUN gives the agreed values).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  SLOPE, TILT, TRUCK, AXLES, HUB_FL, DRUM, YOU, PATH, truckAt, BED, LANE, ACCESS, PANEL, RAIL, BERM, GRAIN, SINK, STOP,
  inBed, DEMO, ROAD, CURVE, EDGE, MOUNTAIN, HOME,
} from "./plan.js";
import { buildLane } from "./model.js";
import { buildTruck } from "./camion.js";
import { buildCol } from "./col.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the lane on the bench (from its sign to its berm: 125 m): sizes the bench, its pool, its grid. */
export const SIZE = 6000;
/** The ground block the lane stands on, on the bench (its bottom on the bench's floor): the bed's depth and 30 cm more. */
export const BLOCK = BED.depth + 30;
/** The speeds of the story (illustrative: the voice says « Quatre-vingts. Quatre-vingt-dix. »), and how much the film
 *  slows them down on the road: `s` moves at rate(kmh) metres per film second (≈ 10 at 90 km/h). */
export const KMH0 = 72;
export const KMH = 90;
export const SLOWMO = 2.5;
export const rate = (kmh) => kmh / 3.6 / SLOWMO;
/** The agreed values of `s` (m) where the acts hand over — act 1 freezes the truck at `freeze` (« Alors… »), act 2's
 *  return to the road runs it from `freeze` to `zero` (tozero), act 3 steers it into the lane and stops it at `stop`. */
export const RUN = { freeze: 167, zero: 220, entry: BED.s0, stop: STOP, top: -150 };
/** The truck's front axle after `s` metres: [x, y, z] in the road's frame — what the camera adds when it rides. */
const AT = { x: 0, y: 0, z: 0, yaw: 0 };
export const travel = (s) => {
  truckAt(s, AT);
  return [AT.x, AT.y, AT.z];
};
const RIDE = [0, 0, 0];
/** The director's `ride` (main.js): the truck's travel, times `ride`. */
export const rideOf = (W) => {
  truckAt(W.s, AT);
  RIDE[0] = W.ride * AT.x;
  RIDE[1] = W.ride * AT.y;
  RIDE[2] = W.ride * AT.z;
  return RIDE;
};
/** Where the lane's origin stands on the bench, in the world (the bench is tilted like the slope, the lane raised on its
 *  block): a point of the lane is at the same place of the picture in both sets once moved by LANE.at − BENCHAT. */
const ON_BENCH = new THREE.Vector3(0, BLOCK, 0).applyEuler(new THREE.Euler(TILT, 0, 0));
export const BENCHAT = [ON_BENCH.x, ON_BENCH.y, ON_BENCH.z];
/** The `origin` to hand benchCut (kit/blocks.js) so that the cut to the bench matches IN PLACE: the lane's place in the
 *  scene, minus where it stands on the bench — and, if the last shot of the scene rode with the truck (`ride` 1), minus
 *  the truck's travel at the `s` of that instant. benchOrigin(null) for a shot written in the road's frame. */
export const benchOrigin = (s = null) => {
  const [tx, ty, tz] = s == null ? [0, 0, 0] : travel(s);
  return [LANE.at[0] - BENCHAT[0] - tx, LANE.at[1] - BENCHAT[1] - ty, LANE.at[2] - BENCHAT[2] - tz];
};

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the drum, the pedal, the wheel in the gravel,
 *           the grains — the part in focus, what lies in front and behind melts. Never on a wide shot, the exploded view,
 *           the chute.
 *  `air`    off: no gain proven at 270 px (the decorator may propose the headlamps as a source, with a planche)
 *  `finish` the surface of the solid parts: machining grain and handling marks (the drum, the rim, the barrier)
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

/** A point `h` cm above the road at (x, z) — the road descends: 1.6 m higher 20 m behind the truck. Valid in the road's
 *  frame AND around the truck (the slope is a plane: riding with the truck keeps it). */
export const road = (x, h, z) => [x, SLOPE * z + h, z];
/** A pose from where the camera stands and the point it aims at (kit/lib/stage.js: the camera at t + d·(sin az · cos el,
 *  sin el, cos az · cos el)): the easy way to write a pose that is right. */
export const frame = (cam, aim, rest = {}) => {
  const dx = cam[0] - aim[0];
  const dy = cam[1] - aim[1];
  const dz = cam[2] - aim[2];
  const d = Math.hypot(dx, dy, dz);
  const r = (x) => Math.round(x * 10) / 10;
  return { ...rest, tx: r(aim[0]), ty: r(aim[1]), tz: r(aim[2]), d: Math.round(d), az: r((Math.atan2(dx, dz) * 180) / Math.PI), el: r((Math.asin(dy / d) * 180) / Math.PI) };
};
// THE FIRST FRAME — « Ton camion n'a plus de freins. » PROVISIONAL (candidate a, « les tambours »): low behind the
// trailer's last axles, the camera riding with the truck: the drums glowing signal and their embers in the foreground,
// the glass truck rushing down, the road filing to its vanishing point; through the glass, far down, the bend's chevrons
// and the ravine; on the right, small and veille, the lane. The planche of four candidates (docs/027-actes.md) chooses
// it, and it is pasted here before the acts are staged. Sharp (dof 0).
const LENS0 = { fov: 44, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };
export const POSE0 = frame(road(-200, 55, 2350), road(-40, 150, 500), LENS0);

export const FIRST = {
  set: SET.SCENE,
  ride: 1, //      the camera rides with the truck (1) or stands in the road's frame (0) — changes on a cut only
  /* ── the truck and its run (camion.js; world.js places it) ── */
  s: 0, //         metres the truck's front axle has run down its path (< 0: higher up the col; RUN: the agreed values)
  kmh: KMH0, //    the story's speed: the header's big readout (72 → 80 → 90, as the voice says them; 0 when it stops)
  pedal: 0.6, //   your foot on the brake pedal: 0 lifted … 1 floored — the header's « Pédale », the brake lights, the hero drum's shoes
  steer: 0, //     the steering wheel and the front wheels: −1 full left … 1 full RIGHT
  heat: 0.8, //    the drums' heat: 0 cold → 1 glowing (all ten drums, their embers, the heat in the air under them)
  sink: 0, //      how deep the tyres are in the gravel: 0 → 1 ≈ 35 cm (each axle only once it is in the bed: plan.js inBed) — on the bench, the hero wheel's
  you: 1, //       you at the wheel (glass), your foot on the pedal (0 nobody)
  shell: 1, //     the X-ray of the truck, the road, the mountain: glass, fine lines (0–1)
  /* ── the place (col.js) ── */
  danger: 0.6, //  the threat at the bottom: the bend's chevrons and the ravine's edge, signal (0–1)
  home: 0, //      the next file's teaser: in the valley far below, a house's window lights (0–1)
  /* ── the system (model.js) ── */
  cutaway: 0, //   the hero drum opened: a quarter of the tyre, the rim and the drum taken away, the two shoes and their linings inside (0–1)
  laneLit: 0.35, // the lane alive: the sign's chequers, the bed's rim, the sheen of its gravel, veille (0–1) — small but readable on frame 0
  explode: 0, //   on the bench: 0 assembled → 1 the lane's parts apart (the sign rises, the gravel lifts out of its pit, the barrier and the berm rise)
  litPanel: 0, litAccess: 0, litGravel: 0, litRail: 0, litBerm: 0, // the part the voice names glows veille
  crushed: 0, //   on the bench: the comparison — the bed's right half crushed, its divider, the twin wheel (0–1)
  benchS: 0, //    on the bench: metres the hero wheel has rolled into the round half (it stops at DEMO.round)
  twinS: 0, //     on the bench: metres the twin wheel has rolled into the crushed half (it stops at DEMO.crushed)
  section: 0, //   on the bench: the cut-away — the round half's gravel opened outboard of the hero wheel, the grains in depth (0–1)
  wheelIn: 0, //   on the bench: the hero wheel there (0 → 1; in the scene it is always on the truck)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`: written around the truck when the camera rides) and `fs` its size; `mood`
  // 0 veille → 1 signal (held frank: 0 or 1); `gel` a signal light over the whole scene (it multiplies: black stays
  // black); the bench's pool and grid
  fx: 0, fy: 150, fz: 600, fs: 1100, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** A point of the lane (its own frame, plan.js LANE) where it stands ON THE BENCH, in the world: the bench is tilted like
 *  the slope and the lane raised on its block. And where the same point stands in the SCENE (the road's frame). */
const TILTED = new THREE.Euler(TILT, 0, 0);
export const benchPoint = (x, y, z) => new THREE.Vector3(x, y + BLOCK, z).applyEuler(TILTED).toArray();
export const lanePoint = (x, y, z) => {
  const v = new THREE.Vector3(x, y, z).applyEuler(TILTED);
  return [v.x + LANE.at[0], v.y + LANE.at[1], v.z + LANE.at[2]];
};

/** The poses one act hands to the next — STARTING POINTS set on BOUCHONS (2026-10-21): the builders give better ones in
 *  their journals (docs/journal/027-*.md). Complete: nothing is inherited across a cut. Each says its frame:
 *  [r] written around the truck as it stands on the first frame — with `ride` 1 it holds while the truck runs;
 *  [0] in the road's frame (`ride` 0); [b] on the bench (`ride` 0). Every pose says its lens (dof 0, or CLOSE). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [HX, HY, HZ] = HUB_FL;
const [PX, PY, PZ] = YOU.pedal;
const [WX, WY, WZ] = YOU.wheel;
const PANEL_Z = -100 * (PANEL.s - BED.s0); // the sign along the lane (its own frame): 52 m before the bed's head
export const VIEW = {
  hook: POSE0,
  /* ── the four candidates of the first frame (docs/027-actes.md) ── */
  // [r] (a) « les tambours »: low behind the trailer, outside its left wheels: the drums glowing in a row, the glass truck
  //         rushing down, the road filing to its vanishing point, the bend's chevrons far down beyond it — POSE0
  rear: POSE0,
  // [r] (b) « la roue »: on the road, behind-left of the front-left wheel: the hero wheel big, its drum glowing through
  //         the rim, the cab of glass over it, the descent beyond
  wheel: frame(road(-200, 45, 380), road(-60, 70, -800), { ...P, fov: 50, shift: 140 }),
  // [r] (c) « dessous »: under the chassis between the axles, looking down the road: the drums on both sides, a tunnel
  under: frame(road(0, 38, 640), road(0, 50, -1200), { ...P, fov: 54, shift: 40 }),
  // [r] (d) « la carte »: high behind: the truck, the descent, the bend and the ravine, the lane on the right
  map: frame(road(-1500, 5500, 11000), road(100, 0, -9000), { ...P, fov: 40, shift: 100 }),
  /* ── the road, around the truck [r] ── */
  // the hero drum, close, from the left: « Ils ne sont pas cassés : ils sont trop chauds » (cutaway)
  drum: frame([HX - 175, HY + 30, HZ + 60], [HX + DRUM.inset, HY, HZ], { ...P, ...CLOSE, shift: 110 }),
  // your foot on the pedal, from outside the left door, through its glass: « c'est ton propre pied », « la pédale s'enfonce »
  pedal: frame([PX - 170, PY + 35, PZ + 60], [PX, PY + 15, PZ], { ...P, ...CLOSE, shift: 110 }),
  // your hands on the steering wheel: « Tu braques à droite »
  hands: frame([WX - 180, WY + 30, WZ - 110], [WX, WY - 10, WZ], { ...P, ...CLOSE, shift: 110 }),
  // low, behind-left, the whole truck rushing down in three-quarter view: « le camion non »
  side: frame(road(2600, 140, 3600), road(0, 190, 500), { ...P, fov: 34, shift: 110 }), // 21/10: from the decor journals
  // high behind the truck, over its trailer, looking down the descent: « En bas, un virage… et le ravin »
  ahead: frame(road(-300, 900, 1800), road(-300, 0, -9000), { ...P, fov: 36, shift: 100 }),
  // [r at s = RUN.freeze] far behind and above the truck, the lane ahead on its right, the bend beyond: the last shot of
  //   act 1 (« Alors… »). Act 2's benchCut leaves from it: origin benchOrigin(RUN.freeze)
  lane: frame([-900, 3956, 8200], [300, -344, -4300], { ...P, fov: 36, shift: 100 }),
  // low at the front wheels as they leave the bitumen (act 3, s ≈ BED.s0)
  entry: frame(road(-640, 70, 420), road(HX, 50, -100), { ...P, fov: 36, shift: 140 }), // 21/10: from the decor journals
  // the hero wheel in the gravel, from the left, low: « Les pneus s'enfoncent », « Chaque tour de roue pousse le gravier »
  sinkL: frame([HX - 280, 70, HZ + 120], [HX, 25, HZ - 40], { ...P, ...CLOSE, shift: 140 }),
  // the whole truck in the bed, from the left and above: « Et tes quarante tonnes… s'arrêtent »
  bedWide: frame(road(-2400, 2300, 2000), road(100, 120, 600), { ...P, fov: 34, shift: 110 }), // 21/10: from the decor journals
  // [r at s = STOP] high above the stopped truck, behind-left: its ruts behind it, the berm ahead untouched — the chute
  top: frame(road(-1500, 3800, 2600), road(0, 150, 700), { ...P, fov: 36, shift: 60 }),
  // [r at s = RUN.top] the top of the col: ahead-left and below, looking back up at the truck coming down from the pass,
  //   its crest against the sky (« Il freinait sans arrêt depuis le haut du col »)
  colTop: frame(road(650, 260, -4300), road(-80, 230, 700), { ...P, fov: 34, shift: 110 }), // 21/10: from the decor journals
  /* ── the road's frame [0] ── */
  // the bend and its chevrons, the ravine beyond, from above the truck's lane
  bend: frame(road(-100, 1400, -16000), road(-700, 0, -25800), { ...P, fov: 36, shift: 110 }),
  // the escape lane alone, waiting (« Lui aussi attend »): from behind its head, high
  waiting: frame(road(-600, 2200, -19000), lanePoint(0, 0, -2000), { ...P, fov: 34, shift: 110 }),
  // the valley far below and the next file's house, from over the berm's end
  valley: frame([900, -1600, -34000], [HOME[0], HOME[1] + 400, HOME[2]], { ...P, fov: 30, shift: 100 }),
  /* ── the bench [b]: the lane raised on its block, the bench tilted like the slope (benchPoint) ── */
  // the whole lane, from behind its sign, high: the exploded view lies along it, in ONE vertical frame
  exploded: frame(benchPoint(-2600, 4200, 6800), benchPoint(0, 0, -1800), { ...P, fov: 36, shift: 110 }),
  // the sign, close (« Un panneau, bien avant »)
  panelBench: frame(benchPoint(PANEL.x - BED.x - 480, 790, PANEL_Z + 520), benchPoint(PANEL.x - BED.x, 667, PANEL_Z), { ...P, shift: 60 }), // 21/10: from the decor journals
  // the round gravel, close: the macro of the grains (« des grains ronds »)
  grains: frame(benchPoint(-DEMO.lane - 40, 35, -355), benchPoint(-DEMO.lane, 0, -400), { ...P, ...CLOSE, shift: 80 }),
  // the comparison: the two halves, from behind the bed's head, above (« plus court que des grains concassés »)
  demo: frame(benchPoint(-150, 1500, 1200), benchPoint(0, 0, -1200), { ...P, fov: 34, shift: 60 }), // 21/10: from the decor journals
  // the cut-away: the hero wheel sinking in the round grains, from the left, low (« Ronds, ils roulent sous la roue »)
  section: frame(benchPoint(-650, 20, -720), benchPoint(-125, -20, -800), { ...P, ...CLOSE, shift: 0 }), // 21/10: from the decor journals
  drumTop: frame([HX - 140, HY + 75, HZ + 110], [HX + 12, HY + 6, HZ + 4], { ...P, ...CLOSE, shift: 60 }), // 21/10: from the decor journals
  demoTop: frame(benchPoint(-60, 2600, 200), benchPoint(0, 0, -1100), { ...P, fov: 34, shift: 0 }), // 21/10: from the decor journals
};

const [LBX, LBY, LBZ] = benchPoint(0, 0, -1000);
const LIGHT_BENCH = { fx: LBX, fy: LBY, fz: LBZ }; // the light over the lane's middle, on the bench
/** What a cut to the bench sets, whatever came before: the lane whole, at rest, its gravel smooth; the camera in the
 *  road's frame. `kmh`, `pedal`, `heat` keep their story values (the header goes on reading the truck). */
export const BENCHED = {
  ride: 0, shell: 0, you: 0, sink: 0, steer: 0, cutaway: 0, danger: 0, home: 0,
  laneLit: 1, explode: 0, litPanel: 0, litAccess: 0, litGravel: 0, litRail: 0, litBerm: 0,
  crushed: 0, benchS: 0, twinS: 0, section: 0, wheelIn: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, ...LIGHT_BENCH, fs: SIZE,
};
/** What a cut to the road sets: night, the truck whole, you at the wheel, the camera riding with it, the drums hot, the
 *  threat lit, the lane small and alive. `s`, `kmh`, `pedal`, `steer`, `sink` are the act's (RUN). */
export const STAGED = {
  ride: 1, shell: 1, you: 1, heat: 0.9, cutaway: 0, danger: 0.6, home: 0, laneLit: 0.35,
  explode: 0, litPanel: 0, litAccess: 0, litGravel: 0, litRail: 0, litBerm: 0,
  crushed: 0, benchS: 0, twinS: 0, section: 0, wheelIn: 0,
  mood: 1, gel: 0, fx: 0, fy: 150, fz: 600, fs: 1100,
};

/** The scene's fog: the descent, the bend 250 m below, the valley 500 m away fade into the night (col.js may ask for
 *  another value, « À changer ailleurs »). */
const FOG = 0.000035;

export function buildWorld(stage) {
  const { scene } = stage;
  const col = buildCol();
  const truck = buildTruck();
  const lane = buildLane();

  // the scene: the place (never moved), the truck (placed every frame), the lane (on the slope, at LANE.at)
  const set = new THREE.Group();
  const laneMount = new THREE.Group();
  laneMount.position.set(...LANE.at);
  laneMount.rotation.x = TILT;
  set.add(col.group, truck.group, laneMount);
  // the bench, tilted like the slope (the cut matches in place); the lane on its block of ground
  const bench = makeBench(SIZE);
  bench.group.rotation.x = TILT;
  bench.pool.mesh.position.z = -1000; // the pool under the lane's middle (its sign is 52 m behind the bed's head, its berm 73 m ahead)
  const benchMount = new THREE.Group();
  benchMount.position.set(0, BLOCK, 0);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(BRAND.signal);

  const at = { x: 0, y: 0, z: 0, yaw: 0 };
  const lamp = new THREE.Vector3();
  const beam = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const C = {}; // what the col reads
  const T = {}; // what the truck reads
  const M = {}; // what the lane reads

  return {
    col, truck, lane, bench, set,
    /** Every frame (and several times per frame: it depends on S, `time` and the camera's ride only). */
    apply(S, time, riding = [0, 0, 0]) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;

      // the lane, and the hero wheel: on the truck in the scene, on its mount on the bench
      const home = onBench ? benchMount : laneMount;
      if (lane.root.parent !== home) home.add(lane.root);
      const hub = onBench ? lane.A.benchWheel : truck.A.hubFL;
      if (lane.wheel.parent !== hub) hub.add(lane.wheel);

      if (!onBench) {
        // the truck down its path, turned to its heading, tilted with the descent
        truckAt(S.s, at);
        truck.group.position.set(at.x, at.y, at.z);
        truck.group.rotation.set(TILT, -at.yaw, 0, "YXZ");
        Object.assign(T, { s: S.s, kmh: S.kmh, pedal: S.pedal, steer: S.steer, heat: S.heat, sink: S.sink, you: S.you, shell: S.shell });
        truck.update(T, time, px);
        truck.group.updateMatrixWorld();
        truck.A.lamps.getWorldPosition(lamp);
        ahead.set(0, 0, -1).applyQuaternion(truck.group.quaternion);
        beam.copy(ahead);
        Object.assign(C, { shell: S.shell, danger: S.danger, home: S.home, lamp, beam });
        col.update(C, time, px);
      }
      Object.assign(M, {
        bench: onBench ? 1 : 0, s: S.s, kmh: S.kmh, sink: S.sink, heat: S.heat, pedal: S.pedal, cutaway: S.cutaway, laneLit: S.laneLit,
        explode: onBench ? S.explode : 0, litPanel: S.litPanel, litAccess: S.litAccess, litGravel: S.litGravel,
        litRail: S.litRail, litBerm: S.litBerm, crushed: S.crushed, benchS: S.benchS, twinS: S.twinS, section: S.section,
        wheelIn: S.wheelIn,
      });
      lane.update(M, time, px);

      // the light follows what the camera follows
      Object.assign(stage.focus, { x: S.fx + riding[0], y: S.fy + riding[1], z: S.fz + riding[2], scale: S.fs });
      stage.grade.gelAmount = S.gel;
      const air = stage.air;
      air.amount = 0;
      air.floor = 0;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : FOG;
    },
  };
}

export {
  SLOPE, TILT, TRUCK, AXLES, HUB_FL, DRUM, YOU, PATH, truckAt, BED, LANE, ACCESS, PANEL, RAIL, BERM, GRAIN, SINK, STOP,
  inBed, DEMO, ROAD, CURVE, EDGE, MOUNTAIN, HOME,
};
