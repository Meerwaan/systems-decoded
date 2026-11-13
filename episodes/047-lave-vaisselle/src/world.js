// DOSSIER 047 — Lave-vaisselle : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, cuve.js, cuisine.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SCENE: 009's kitchen at night seen like an X-ray, the dishwasher at the end of its run (cabinet,
// tub, door, baskets: glass and fine lines), and solid in all that glass the only things that matter — the gratin
// dish upside down in the lower basket with its burnt crust, and the water circuit: inlet valve, sump and its three
// filters, circulation pump, tube, the lower spray arm, the heating element, the dispenser and its tablet. The BENCH:
// that same circuit alone on its pool of light. ONE object (model.js), re-parented: the cut matches on it, in place.
// Three colours. signal is the threat: the crust, and the water that runs to waste at the sink. veille is the system
// alive: the jets, the water's round, the eco lamp, the part the voice names. ink is the rest. The heater's glow is
// signal (heat), held small: a lamp with a place, never a veil.
//
// THE STORY (docs/faits/047-lave-vaisselle.md; the scene is a scenario, `sources` says so): a gratin dish with a
// crust baked on, an eco programme started at night. ABOUT TEN LITRES for the WHOLE cycle — never in the tub at once:
// at any time there is only A LITTLE water at the bottom (the sump, a film on the floor), warmed, pumped, thrown. The
// arm has NO MOTOR: the reaction of its own jets turns it (`thrust`). The same water goes round hundreds of times
// DURING THE WASH — not during the whole cycle (`water` empties and fills again between phases if a shot shows them).
// The tablet falls when the trap opens: never « into a full tub ».
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makeBench, setMood } from "@kit/blocks.js";
import { SYSTEM, BENCH_FROM, ARM, DISH, SUMP, DISPENSER, SINK, COLUMNS } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildCuve } from "./cuve.js";
import { buildCuisine } from "./cuisine.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** On the bench the system stands with BENCH_FROM on the bench's origin: benchCut's `origin`. */
export { BENCH_FROM };

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE): the part in focus, what lies in front and behind melts
 *  `air`    off: no backlight in this film that would earn it (to try on the hook only, against the crust's glow)
 *  `finish` the solids' surface: machining grain and handling marks that break the reflections (full screen only)
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Ton plat de gratin a cramé. » — PROVISIONAL (candidate A of docs/047-actes.md, set on
// the BOUCHONS): low at the front-left of the tub, under the lower basket, looking up: the dish upside down over the
// arm, its crust signal, the arm already turning and its jets hitting the crust, a little water in the sump. The
// planche of four candidates chooses it on the real sets; it is pasted here before the acts. Sharp (dof 0).
export const POSE0 = { tx: -2, ty: 24, tz: 2, d: 74, az: -34, el: -16, fov: 50, shift: 60, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── the kitchen (cuisine.js) ── */
  room: 1, //    the X-ray of 009's kitchen and the worktop over the dishwasher (0–1)
  night: 1, //   0 the kitchen lit (the evening) → 1 the light off (the night: the glass dims, the eco lamp is all that glows)
  tap: 0, //     the sink's tap runs (0–1): a column of water from its mouth into the bowl
  drain: 0, //   that water goes to waste: signal heads run down the waste pipe into the wall (0–1)
  you: 0, //     0 nobody · 1 you, of glass, at the sink, a plate in your hand
  rinse: 0, //   the plate goes under the tap (0 held in front of you → 1 under the water)
  litres: 0, //  the machine's column beside it: 0 empty → 1 TEN LITRES (the whole cycle's water — never in the tub)
  hand: 0, //    the hand-washing column: 0 empty → 1 full, twice the machine's height (« moitié moins ») — no figure, ever
  /* ── the dishwasher (cuve.js) ── */
  shell: 1, //   the X-ray of the cabinet, the tub, the door, the baskets (0–1)
  door: 0, //    0 shut → 1 open flat (it falls open about its bottom hinge, top toward +z); the dispenser goes with it
  eco: 1, //     the eco lamp on the door's top edge (veille, 0–1)
  dish: 1, //    the gratin dish upside down in the lower basket (0/1)
  crust: 1, //   its burnt crust inside, signal (1 baked on → 0 clean)
  crack: 0, //   « et la croûte lâche »: 0 whole → 1 split in plates that have fallen onto the coarse filter
  ghosts: 0, //  « ni éponge, ni brosse »: a sponge and a brush of glass in the tub, that fade (0–1)
  /* ── the system (model.js) ── */
  explode: 0, // on the bench: 0 assembled → 1 its parts apart, in ONE vertical frame
  turn: 0, //    turns of the arm (cumulative: tween it, never jump it; 1 = one full turn, it reads the same every half turn)
  jets: 1, //    the jets out of the arm's nozzles (0–1); they end on the crust where the dish is over them
  thrust: 0, //  the reaction: an arrow of push at each tip, opposite its tip jet (0–1) — « ses propres jets le font tourner »
  inlet: 0, //   the valve opens: its coil lights, a stream arcs out of the inlet port and runs into the sump (0–1)
  water: 0.6, // the water at the bottom: 0 dry → 1 the sump full to the brim and a thin film on the micro filter. NEVER more
  pump: 1, //    the pump runs (0–1): its motor breathes, it draws from the sump
  passes: 0, //  how many times the water has gone round (cumulative): the heads along LOOP, and the counter #passes-v
  loop: 0, //    the water's round drawn as one veille line through the circuit and the tub (0–1)
  heat: 0, //    the heating element glows (signal, 0–1): cold in the hook (it is the pre-wash), it warms from the scene's « cinquante »
  trap: 0, //    the dispenser's trap: 0 shut → 1 open
  tab: 0, //     the tablet: 0 in its chamber · 0.3 → 0.55 it falls to the tub floor · → 1 dissolved, gone
  litValve: 0, litSump: 0, litPump: 0, litArm: 0, litTrap: 0, // the part the voice is naming glows faintly veille
  solo: 0, //    the heart alone: 0 every part · 1 all but the arm fade to a quarter (« …et au bout, le bras d'aspersion »)
  /* ── the header (main.js) ── */
  cycle: 8, //   minutes into the eco programme (the clock « 0 h 08 »): illustrative up to the wash; ≈ 210 at the end (sourced)
  temp: 22, //   the water's temperature, °C (the header's count): it climbs « vers cinquante » and stops there, never above
  /* ── the Sinner panel (index.html #sinner, drawn by main.js) ── */
  sinner: 0, //  the circle of four levers (0–1)
  sHeat: 1, //   the heat sector's share: 1 a quarter → 0.4 « si l'un baisse »; the time sector takes what it gives (the circle stays full)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: DISH.centre[0], fy: DISH.rim, fz: DISH.centre[2], fs: 40, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL: set on the
 *  BOUCHONS (docs/journal/047-architecte.md); the decor agents give better ones in their journals. Scene poses are in
 *  plan.js coordinates; bench poses in the bench's (plan point p sits at p − BENCH_FROM). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the scene ── */
  // the promise: back from the tub to the kitchen, the sink at the left, the two columns at the right of the machine
  kitchen: { ...P, tx: -10, ty: 58, tz: 18, d: 330, az: -68, el: 16, fov: 40, shift: 110 },
  // the door shut, the eco lamp, the kitchen going dark behind (scene: « Porte fermée, programme éco »)
  door: { ...P, tx: 0, ty: 42, tz: 30, d: 300, az: -40, el: 10, shift: -100 },
  // inside, the empty tub where no sponge works: the dish over the arm, the heater on the floor
  tub: { ...P, tx: 0, ty: 30, tz: 0, d: 130, az: -36, el: 10, fov: 32, shift: 110 },
  // where act 1 ends, close on the arm under the dish — act 2 cuts to the bench from it (benchCut)
  system: { ...P, ...CLOSE, tx: 0, ty: 18, tz: 2, d: 110, az: -36, el: 22, shift: 60 },
  // the dispenser shut on the door's inner face, seen from inside the tub (repos: « Sa pastille attend »)
  dispenser: { ...P, ...CLOSE, tx: DISPENSER.centre[0], ty: DISPENSER.centre[1], tz: DISPENSER.centre[2], d: 46, az: -150, el: 8, shift: 60 },
  // the hub and a tip of the arm, from above: the tip jet and its push (repos: « Le bras n'a pas de moteur »)
  hub: { ...P, ...CLOSE, tx: 8, ty: 15, tz: 0, d: 85, az: -30, el: 34, shift: 40 },
  // the crust from under it, intact (repos: « Et ta croûte… tient toujours »)
  crust: { ...P, ...CLOSE, tx: DISH.centre[0], ty: DISH.crust, tz: DISH.centre[2], d: 58, az: -30, el: -24, fov: 34, shift: 40 },
  // the climax: the tub in section, full frame — sump, filters, pump, tube, arm, jets, dish, all in one picture
  section: { ...P, tx: 0, ty: 30, tz: 2, d: 165, az: -28, el: 6, fov: 30, shift: 60 },
  // the sink (promise, comment): the tap, your plate, the waste pipe under it
  sink: { ...P, tx: -160, ty: 92, tz: 15, d: 300, az: -40, el: 12, fov: 28, shift: 150 },
  // the columns of water beside the machine
  columns: { ...P, tx: (COLUMNS.machine[0] + COLUMNS.hand[0]) / 2, ty: 50, tz: COLUMNS.machine[2], d: 260, az: -20, el: 8, shift: 80 },
  // under the kitchen floor, looking up through its grid (the loop starts there: « Et juste au-dessus, chez toi… »)
  below: { ...P, tx: 0, ty: 40, tz: 10, d: 260, az: -30, el: -38, fov: 36, shift: 0 },
  /* ── the bench (bench coordinates) ── */
  // the system whole, three quarters, on its pool (« Alors… on l'ouvre »)
  whole: { ...P, tx: 0, ty: 22, tz: 0, d: 150, az: -38, el: 18, shift: 120 },
  // exploded: in ONE vertical frame, every part reads
  exploded: { ...P, tx: 0, ty: 42, tz: 0, d: 240, az: -36, el: 14, shift: 120 },
  // the arm alone, the heart (eclate: « …et au bout, le bras d'aspersion »)
  arm: { ...P, ...CLOSE, tx: ARM.hub[0] - BENCH_FROM[0], ty: ARM.hub[1] - BENCH_FROM[1] + 52, tz: ARM.hub[2] - BENCH_FROM[2], d: 70, az: -36, el: 26, shift: 100 },
  // the principle: the system whole under the Sinner panel (zone haute), a little lower in the frame
  principle: { ...P, tx: 0, ty: 20, tz: 0, d: 170, az: -40, el: 20, shift: -60 },
};

/** What a cut to the bench sets, whatever came before (the light around the system's middle). */
export const BENCHED = {
  shell: 0, room: 0, dish: 0, ghosts: 0, tap: 0, drain: 0, you: 0, litres: 0, hand: 0,
  explode: 0, jets: 0, thrust: 0, inlet: 0, loop: 0, heat: 0, water: 0.4,
  litValve: 0, litSump: 0, litPump: 0, litArm: 0, litTrap: 0, solo: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 18, fz: 0, fs: SIZE,
};
/** What a cut to the scene sets (back in the tub, around the dish). */
export const STAGED = { shell: 1, room: 1, dish: 1, explode: 0, gel: 0, fx: DISH.centre[0], fy: DISH.rim, fz: DISH.centre[2], fs: 40 };

/** The Sinner panel's four arcs (index.html #sinner): heat, time, product, force, in that order around the circle.
 *  Heat gives `1 − sHeat` of its quarter to time: the circle stays full. main.js draws it every frame. */
export const sinnerShares = (sHeat) => {
  const h = 0.25 * sHeat;
  return [h, 0.5 - h, 0.25, 0.25];
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const cuve = buildCuve();
  const cuisine = buildCuisine();

  const set = new THREE.Group();
  set.name = "scene";
  const mount = new THREE.Group(); // where the system stands in the scene: plan.js coordinates, the origin
  set.add(cuisine.group, cuve.group, mount);

  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group();
  benchMount.position.set(-BENCH_FROM[0], -BENCH_FROM[1], -BENCH_FROM[2]);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(BRAND.signal);

  // what each set reads, kept between frames (no allocation in apply)
  const SYS = {};
  const CUV = {};
  const CUI = {};

  return {
    system, cuve, cuisine, bench, set,
    hero: system, // the template's name, for the acts' anchors (world.hero.A …)
    /** Every frame (and sixteen times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);

      SYS.bench = onBench ? 1 : 0;
      SYS.explode = onBench ? S.explode : 0;
      SYS.door = onBench ? 0 : S.door;
      SYS.turn = S.turn; SYS.jets = S.jets; SYS.thrust = S.thrust; SYS.inlet = S.inlet; SYS.water = S.water;
      SYS.pump = S.pump; SYS.passes = S.passes; SYS.loop = S.loop; SYS.heat = S.heat; SYS.trap = S.trap; SYS.tab = S.tab;
      SYS.litValve = S.litValve; SYS.litSump = S.litSump; SYS.litPump = S.litPump; SYS.litArm = S.litArm; SYS.litTrap = S.litTrap; SYS.solo = S.solo;
      system.update(SYS, time, px);

      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        CUV.shell = S.shell; CUV.door = S.door; CUV.eco = S.eco; CUV.dish = S.dish; CUV.crust = S.crust; CUV.crack = S.crack;
        CUV.ghosts = S.ghosts; CUV.jets = S.jets; CUV.turn = S.turn; CUV.passes = S.passes; CUV.mood = S.mood;
        cuve.update(CUV, time, px);
        CUI.room = S.room; CUI.night = S.night; CUI.tap = S.tap; CUI.drain = S.drain; CUI.you = S.you; CUI.rinse = S.rinse;
        CUI.litres = S.litres; CUI.hand = S.hand;
        cuisine.update(CUI, time, px);
      }

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.0004;
    },
  };
}

export { SYSTEM, ARM, DISH, SUMP, DISPENSER, SINK, COLUMNS };
