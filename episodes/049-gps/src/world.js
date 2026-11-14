// DOSSIER 049 — GPS : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by route.js, model.js, satellite.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ROAD (route.js, 025's country road at night as it is, plus a T junction and a dark field on your
// right): the car of glass, you at the wheel, the PHONE in its holder on the dashboard — and above, in the car's
// frame, the SKY (satellite.js): four satellites in a maquette 30 to 45 m up, the rest of the constellation, their
// rings of light, the four distance spheres and their circles on the ground, the blue dot on the ground. The BENCH:
// the phone standing on its pool of light, the satellite above it, a thread of light between their antennas.
// The phone and THE satellite are each ONE object, re-parented: the cuts match on them.
// Three colours. signal: the dot in the field, the ditch, the spheres while the clock is wrong, the quartz when
// it is « fausse ». veille: the clocks alive, the rings, the spheres once corrected, the dot back on the road.
// ink: the rest, the ground clock.
//
// THE STORY (docs/faits/049-gps.md; a scenario, `sources` says so): at night, an unknown country road, 70 km/h
// (illustrative, never said), a T junction 5 s ahead. Your blue dot is in the field: the phone's quartz clock is one
// microsecond late (a demonstration, the contre-vérification says so). It hears three satellites: three spheres, ALL
// shrunk by the same amount, meet in the field. A fourth signal, a fourth sphere: the phone solves its own clock,
// the four meet on the asphalt, the dot comes back on the road. The header: seconds to the junction (`eta`) and the
// phone's lag in µs (`err`).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  CAR, PHONE, SATS, OTHERS, SAT, SKY_SCALE, BENCH, JUNCTION, FIELD, DITCH, ROAD_FIX, FIELD_FIX, DELTA, KMH, MPS, STREAK,
} from "./plan.js";
import { buildPhone } from "./model.js";
import { buildSky } from "./satellite.js";
import { buildRoad } from "./route.js";

export const SET = { BENCH: 0, ROAD: 1 };
/** ≈ the radius of the phone on the bench: sizes the bench, its light, its shadows. */
export const SIZE = BENCH.size;
/** The film is slowed down on the road: the five seconds of the story stretch over the scene and act 3.
 *  `eta` is the story's clock (seconds to the junction): the header reads it, the road scrolls with it. */
export const SLOWMO = 4;

/** The studio (kit/lib/stage.js). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof` on the CLOSE-UPS only (the poses that spread CLOSE: the chip, the quartz, the clock); `air` off (the 025
 *  tried it on this road at night: no gain at 270 px); `finish` the solids' grain (full screen only). */
export const LOOK = { dof: 6, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Ton point bleu saute dans un champ » — PROVISIONAL: candidate A of
// docs/049-actes.md (inside the car, low, under the phone in its holder: its screen, the dot about to jump; through
// the windscreen the road at night, the junction ahead, THE satellite up in the right corner). The planche of four
// chooses it; it is pasted here before the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: 6, ty: 104, tz: -66, d: 40, az: 22, el: -8, fov: 48, shift: 110, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.ROAD,
  /* ── the road (route.js) ── */
  eta: 6, //       seconds to the junction (the story's clock, the header's big readout): gap = eta × MPS. 5,0 on « cinq secondes »
  yaw: 0, //       degrees the car has turned LEFT at the junction (route.js turns the road under the car); 0 straight
  lane: 0, //      metres the car has moved to the LEFT of its lane
  steer: 0, //     the steering wheel and the front wheels: −1 full right … 1 full left
  shell: 1, //     the X-ray of the car and the road (0–1)
  you: 1, //       you at the wheel, glass (0–1)
  branchL: 0, branchR: 0, // the junction's two branches lit (« À gauche… ou à droite ? ») 0–1
  ditch: 0, //     the ditch between the road and the field marked signal (0–1)
  sign: 0, //      the direction sign on the far verge, in the beams (comment's duel) 0–1
  streak: 0, //    « onze kilomètres de lumière »: a stroke of light unrolling over the road into the night (0–1)
  /* ── the phone (model.js) ── */
  explode: 0, //   on the bench: 0 whole → 1 its layers apart, from the screen backwards (chip, antenna, quartz on the board)
  peek: 0, //      in the car: the phone's shell goes glass, the board and its chip, antenna, quartz stay solid (0–1)
  quartz: 0, //    the quartz: 0 veille (right) → 1 signal (« elle est fausse »). Held frank
  qBeat: 0, //     the quartz's beats (a counter: its fraction is the pulse; tween it linearly)
  tremble: 0, //   the quartz's beat trembles (0–1)
  screen: 1, //    the screen lit (0–1)
  map: 1, //       the map on the screen: 1 → 0 erased (chute: « ne vient pas d'une carte »)
  strike: 0, //    the map struck through, before it goes (0–1)
  litChip: 0, litQuartz: 0, // the part the voice names glows faintly veille
  /* ── the sky (satellite.js) ── */
  err: 0, //       the phone's clock lag, in µs (0 right → 1 « un millionième »): the dot leaves the road for the field (on
  //               the screen AND on the ground), every sphere shrinks by DELTA, the header's second readout
  sats: 1, //      how many of the four satellites over you show: 1 THE satellite … 4 (fractional: the next fades in)
  others: 0, //    the rest of the constellation (« ou plus »), fainter (0–1)
  satGlass: 0, //  THE satellite's bus goes X-ray: its clock solid inside (0 solid → 1 glass)
  satExplode: 0, // THE satellite opens: oscillator, clock apart (0–1)
  core: 0, //      « au cœur » : everything of the satellite fades but its atomic clock, alone on its light (0–1)
  twin: 0, //      the ground clock beside the satellite's (promesse, comment) 0–1
  beatSat: 0, //   the satellite clock's beats (counter, tween linearly: slower than beatGnd = « réglée trop lente »)
  beatGnd: 0, //   the ground clock's beats
  rings: 0, //     the rings of light streaming down from the satellites shown, all the time (0–1)
  w1: 0, w2: 0, w3: 0, w4: 0, // ONE marked ring per satellite: 0 leaves it → 1 reaches the car (zero, reponse)
  spheres: 0, //   how many distance spheres show (0 … 4, fractional fades the next in), and their circles on the ground
  dot: 0, //       the blue dot projected on the ground, where the phone thinks it is (0–1)
  thread: 0, //    on the bench: the thread of light from the phone's antenna to the satellite's (0–1)
  travel: 0, //    on the bench: the marked ring travelling it, satellite → phone (0 → 1); the ruler's marks light as it passes
  ruler: 0, //     on the bench: the ruler along the thread, a mark per « 300 mètres » (0–1)
  distance: 0, //  on the bench: the trip's time turned into a stroke of distance along the thread (0–1)
  litOsc: 0, litClock: 0, // the satellite's part the voice names glows
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 6, fy: 106, fz: -66, fs: 60, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL, set on BOUCHONS:
 *  the builders give better ones in their journals (docs/journal/049-route.md, 049-model.md, 049-satellite.md). */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [S1X, S1Y, S1Z] = SATS[0];
const [PX, PY, PZ] = PHONE.at;
export const VIEW = {
  hook: POSE0,
  /* ── the road (the car's frame) ── */
  // the phone in its holder, close, from your right: its screen, the dot (promesse's start, scene's end: « Tout se joue dans ton téléphone »)
  phone: { ...P, ...CLOSE, tx: PX, ty: PY, tz: PZ, d: 34, az: 28, el: 6, fov: 34, shift: 80 },
  // the phone in the car gone glass (peek 1): its board, the quartz (repos's « horloge à quartz », reponse's quartz recaled)
  quartzCar: { ...P, ...CLOSE, tx: PX - 1, ty: PY + 2, tz: PZ, d: 22, az: 30, el: 10, fov: 30, shift: 60 },
  // from the car up to THE satellite: the rings coming down (promesse)
  up: { ...P, tx: 1001, ty: 2154, tz: -1708, d: 3234, az: -29, el: -35, fov: 50, shift: 0, dof: 0 },
  // THE satellite close in the sky, its bus X-ray, the clock inside, the twin beside (promesse « trop lentes »)
  satSky: { ...P, tx: 1500, ty: 3077, tz: -2400, d: 1500, az: -40, el: 12, fov: 30, shift: 120, dof: 0 },
  // plunge on the road: the car, the junction ahead, the ditch, the dot in the field (scene)
  plunge: { ...P, tx: 600, ty: 0, tz: -500, d: 3200, az: -20, el: 52, fov: 40, shift: 120 },
  // behind the car, low: the beams, the junction ahead (scene « Un carrefour »; zero « Le carrefour »)
  chase: { ...P, tx: 0, ty: 110, tz: -1500, d: 2200, az: -3, el: 5, fov: 34, shift: 250 },
  // high over the car: the four satellites, their spheres through you (repos), the constellation around
  high: { ...P, tx: 0, ty: 2400, tz: 0, d: 15000, az: -35, el: 28, fov: 40, shift: 80 },
  // from the sky down to the road: the circles on the ground, their crossing in the field / on the asphalt (zero, reponse)
  climax: { ...P, tx: 250, ty: 0, tz: -1900, d: 7000, az: -12, el: 62, fov: 40, shift: 100 },
  branches: { ...P, tx: 0, ty: 0, tz: -1300, d: 2600, az: -10, el: 34, fov: 40, shift: 100 },
  // the junction ahead, the sign in the beams (comment's duel « …ou les panneaux ? »)
  sign: { ...P, tx: 0, ty: 170, tz: -2800, d: 1500, az: -6, el: 1, fov: 30, shift: 40 },
  /* ── on the bench (the origin) ── */
  // « Alors… » : the phone whole on its light, the thread up to the satellite above
  bench: { ...P, tx: 0, ty: 24, tz: -4, d: 110, az: -34, el: 8, fov: 34, shift: 160 },
  // the phone exploded, three quarters, in ONE vertical frame
  exploded: { ...P, tx: 1.5, ty: 8, tz: 0, d: 100, az: -40, el: 20, fov: 30, shift: 80 },
  // the chip and its antenna on the board (« une puce et son antenne »)
  chip: { ...P, ...CLOSE, tx: 1.4, ty: 11.5, tz: 0.8, d: 24, az: -60, el: 22, fov: 30, shift: 0 },
  // the satellite on the bench, whole then exploded (« un satellite », « son oscillateur »)
  satBench: { ...P, tx: 0, ty: 84, tz: -10, d: 230, az: -36, el: 10, fov: 30, shift: 100, dof: 0 },
  // the atomic clock alone on its light (« au cœur, une horloge atomique »)
  heart: { ...P, ...CLOSE, tx: 0, ty: 92, tz: -14, d: 48, az: -40, el: 12, fov: 30, shift: 100 },
  // the whole thread, satellite to phone, the ruler along it (principe)
  thread: { ...P, tx: 0, ty: 44, tz: -7, d: 220, az: -70, el: 6, fov: 34, shift: 60 },
  // the quartz on the bench (repos's alternative: if « on plonge dans le téléphone » cuts to the bench)
  quartzBench: { ...P, ...CLOSE, tx: -1.6, ty: 9.5, tz: 0.8, d: 18, az: -40, el: 20, fov: 30, shift: 100 },
  // the two clocks side by side (comment): the satellite's and the ground's
  clocks: { ...P, tx: 7, ty: 81, tz: -7, d: 110, az: -30, el: 8, fov: 30, shift: 120, dof: 0 },
};

/** What a cut to the bench sets, whatever came before: the phone whole and lit, the satellite whole, solid. The
 *  story's clock (`eta`) and the phone's lag (`err`) keep their values: the header goes on reading the story. */
export const BENCHED = {
  shell: 0, you: 0, branchL: 0, branchR: 0, ditch: 0, sign: 0, streak: 0,
  explode: 0, peek: 0, quartz: 0, tremble: 0, screen: 1, map: 1, strike: 0, litChip: 0, litQuartz: 0,
  sats: 1, others: 0, satGlass: 0, satExplode: 0, core: 0, twin: 0, rings: 0, w1: 0, w2: 0, w3: 0, w4: 0, spheres: 0, dot: 0,
  thread: 1, travel: 0, ruler: 0, distance: 0, litOsc: 0, litClock: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 9, fz: 0, fs: SIZE,
};
/** What a cut to the road sets: night, dry, you at the wheel, the car square in its lane, the phone whole in its
 *  holder, THE satellite alone in the sky, solid. `eta` and `err` are the act's. */
export const STAGED = {
  yaw: 0, lane: 0, steer: 0, shell: 1, you: 1, branchL: 0, branchR: 0, ditch: 0, sign: 0, streak: 0,
  explode: 0, peek: 0, quartz: 0, tremble: 0, screen: 1, map: 1, strike: 0, litChip: 0, litQuartz: 0,
  sats: 1, others: 0, satGlass: 0, satExplode: 0, core: 0, twin: 0, rings: 0, w1: 0, w2: 0, w3: 0, w4: 0, spheres: 0, dot: 0,
  thread: 0, travel: 0, ruler: 0, distance: 0, litOsc: 0, litClock: 0,
  mood: 1, gel: 0, fx: PX, fy: PY, fz: PZ, fs: 60,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const road = buildRoad();
  const phone = buildPhone();
  const sky = buildSky();
  const set = new THREE.Group(); // the road set, the car's frame
  set.add(road.group, sky.group);
  const bench = makeBench(SIZE);
  const phoneBench = new THREE.Group();
  phoneBench.position.set(...BENCH.phone);
  bench.group.add(phoneBench, sky.bench);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    road, phone, sky, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const phoneHome = onBench ? phoneBench : road.A.holder;
      if (phone.root.parent !== phoneHome) phoneHome.add(phone.root);
      const satHome = onBench ? bench.group : sky.group;
      if (sky.hero.root.parent !== satHome) satHome.add(sky.hero.root);
      const gap = S.eta * MPS;
      phone.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, peek: onBench ? 0 : S.peek, quartz: S.quartz, qBeat: S.qBeat,
        tremble: S.tremble, screen: S.screen, map: S.map, strike: S.strike, err: S.err, eta: S.eta, litChip: S.litChip, litQuartz: S.litQuartz,
      }, time, px);
      sky.update({
        bench: onBench ? 1 : 0, sats: S.sats, others: S.others, satGlass: S.satGlass, satExplode: S.satExplode, core: S.core, twin: S.twin,
        beatSat: S.beatSat, beatGnd: S.beatGnd, rings: S.rings, w1: S.w1, w2: S.w2, w3: S.w3, w4: S.w4, spheres: S.spheres, err: S.err,
        dot: S.dot, thread: S.thread, travel: S.travel, ruler: S.ruler, distance: S.distance, litOsc: S.litOsc, litClock: S.litClock,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        road.update({
          shell: S.shell, gap, yaw: S.yaw, lane: S.lane, steer: S.steer, rolled: -gap, you: S.you, branchL: S.branchL, branchR: S.branchR,
          ditch: S.ditch, sign: S.sign, streak: S.streak, holder: 1,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00004;
    },
  };
}

export {
  CAR, PHONE, SATS, OTHERS, SAT, SKY_SCALE, BENCH, JUNCTION, FIELD, DITCH, ROAD_FIX, FIELD_FIX, DELTA, KMH, MPS, STREAK,
};
