// DOSSIER 039 — Le cendrier du réacteur : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, corium.js, batiment.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Three files, ONE place (no re-parenting): the SYSTEM, solid (model.js: the pit's sacrificial lining, the melt
// plug, the channel, the spreading chamber, the IRWST pool and its passive valves); the THREAT (corium.js: the
// vessel's red belly, the drop, the melt in the pit, in the channel, spread in the chamber; the heat; the steam);
// AROUND, X-ray (batiment.js: 005's vessel moved over the pit, the basement of the reactor building; the next
// file's teaser far away). The BENCH is the same place with the building gone and a pool of light under it: a cut
// to the bench is IN PLACE (the system does not move), the exploded view opens there.
// Three colours. signal is the threat: the melt, its heat, the red belly, the steam explosion. veille is the system
// alive: the plug, the valves, the water's way when it opens, the whole system's rim once it has won. ink is the
// rest: the building, the vessel's glass, the water itself, the steam.
//
// THE STORY (docs/faits/039-cendrier-reacteur.md; a reconstitution — it never happened on an EPR, `sources` says
// so): the core melts, pierces the vessel's bottom, pools in the pit and eats its sacrificial concrete; it melts the
// plug, runs down the channel and spreads, dry, over the 170 m² of the chamber « en quelques dizaines de secondes »;
// spreading, it destroys the valves' triggers; the valves open by themselves; « après plusieurs minutes » the water
// comes down from the pool by gravity, rises around and covers it. Never water before the spreading; never the
// chamber under the vessel; nobody in the building.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  VESSEL, PIT, PLUG, SHAFT, CHANNEL, CHAMBER, AREA, CENTRAL, FLOOD, POOL, VALVES, TRIGGERS, PIPES, HEAP, BASEMENT, TEASER, SYSTEM,
} from "./plan.js";
import { buildSystem } from "./model.js";
import { buildCorium } from "./corium.js";
import { buildBatiment } from "./batiment.js";

export const SET = { BENCH: 0, PLANT: 1 };
/** ≈ the radius of the whole: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
const [CX, CY, CZ] = SYSTEM.centre;
const CHZ = (CHAMBER.z0 + CHAMBER.z1) / 2;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the plug, a valve, a trigger, the heap
 *  `air`    light in the air behind the plane in focus — off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts: machining grain and handling marks that break the reflections
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Ton réacteur nucléaire fond. » : from the bottom of the pit, low against its wall,
// looking up — the vessel's belly huge over the frame, red from underneath, a drop of melt hanging from its lowest
// point and falling at us; at the bottom of the frame, in the middle of the concrete floor, the plug, small but
// readable (faint veille). PROVISIONAL (candidate a, set on bouchons): the planche of four candidates
// (docs/039-actes.md) chooses it, and it is pasted here before the acts are staged.
export const POSE0 = { tx: 0, ty: 220, tz: 100, d: 1700, az: -20, el: 2, fov: 44, shift: -40, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.PLANT,
  /* ── around (batiment.js) ── */
  shell: 1, //    the building, X-ray: glass, fine lines (0–1; forced to 0 on the bench)
  vessel: 1, //   005's vessel, its glass and lines (0–1)
  core: 0.7, //   the fuel's glow inside it (0–1): the core that melts
  teaser: 0, //   the next file (040), far away: a line of fire closing on a row of shelters (0–1)
  /* ── the threat (corium.js) — all 0 while `explode` > 0 ── */
  belly: 0.85, // the vessel's lower head red from underneath (0–1)
  breach: 0.6, // the hole at its lowest point: 0 none → 1 open
  pour: 1,   //   what falls from it: 0 nothing · ≈ 0.3 a drop that swells, lets go, falls (periodic) · 1 a continuous stream
  pit: 0.04, //   the melt pooled in the pit (0 → 1 ≈ 80 cm deep), eating the sacrificial concrete
  fume: 0.2, //   the fumes over that pool, ink (0–1)
  flow: 0, //     the melt's front: 0 on the plug → 0.2 down the drop → 1 at the chamber's mouth
  mass: 0, //     how much melt is in the chamber (0–1)
  spread: 0, //   how it lies there: 0 a thick heap → 1 a thin sheet over the whole floor
  arrows: 0, //   the heat going down into the floor, signal arrows: long and tight when thick, short and sparse when thin (0–1)
  cool: 0, //     the sheet cools under the water: orange → a dark crust (0–1)
  steam: 0, //    the steam over the sheet as the water covers it, ink (0–1)
  blast: 0, //    the counter-example (« trop tôt »): 0 nothing · → 0.3 water poured on the thick pool in the pit · → 1 the steam explosion
  /* ── the system (model.js) ── */
  explode: 0, //  0 assembled → 1 its parts apart (the vessel lifts with them)
  eaten: 0.05, // the pit's sacrificial lining eaten away by the melt (0–1)
  plug: 0, //     the plug: 0 cold · → 0.5 red hot under the melt · → 1 sagged, melted, open
  valves: 0, //   the passive flooding valves: 0 shut → 1 open (they stay open)
  triggers: 0, // their triggers on the slab: 0 whole → 1 destroyed by the melt
  water: 0, //    the water's way: 0 still in the pool · → 0.25 down the pipes · → 0.5 the central channel · → 0.8 rising round the edges · 1 over the melt
  guard: 0, //    the whole system's veille rim: alive, it has won (0–1)
  litPit: 0, litPlug: 0.35, litChannel: 0, litChamber: 0, litPool: 0, litValves: 0, // the part the voice names glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 200, fz: 0, fs: 500, mood: 1, gel: 0, pool: 0, grid: 0,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/039-model.md, 039-corium.md, 039-batiment.md). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [TX, TY, TZ] = TEASER.at;
export const VIEW = {
  hook: POSE0,
  /* ── the plant ── */
  // candidate b: high in the pit, looking DOWN past the red belly: the drop falling onto the plug at the centre of the floor
  overPit: { ...P, tx: 0, ty: 40, tz: 0, d: 760, az: -35, el: 66, fov: 40, shift: 80 },
  // candidate c: outside, low at the chamber's far end, looking back along the path: the empty chamber in front, the pit and its red vessel behind
  chamberLow: { ...P, tx: 0, ty: 420, tz: 400, d: 3300, az: -14, el: 8, fov: 40, shift: -60 },
  // candidate d: the whole plant from high at the far end, the vessel glowing over the pit, the path drawn toward us (= wide, with the melt)
  section: { ...P, tx: 0, ty: 250, tz: 1000, d: 5600, az: -18, el: 22, fov: 34, shift: 120 },
  // « une porte qui doit fondre »: a plunge on the plug, the melt round it
  plugTop: { ...P, ...CLOSE, tx: 0, ty: 0, tz: 0, d: 600, az: -35, el: 68, fov: 34, shift: 90 },
  // along the channel, at its height (the travelling of « promesse » and of « s'engouffre »)
  channel: { ...P, tx: 0, ty: -300, tz: 380, d: 700, az: -28, el: 62, fov: 40, shift: 0 },
  // the chamber, wide, from above at the far end: the spreading (the climax), its 170 m²
  sheet: { ...P, tx: 0, ty: -330, tz: CHZ, d: 2600, az: -22, el: 52, fov: 38, shift: 110 },
  // the chamber, grazing: empty, cold (« il dort »)
  graze: { ...P, tx: 0, ty: -330, tz: 1700, d: 2200, az: -24, el: 12, fov: 34, shift: 150 },
  // the pool, its still water, the valves low in its wall
  pool: { ...P, tx: 900, ty: 0, tz: 2000, d: 1700, az: -55, el: 30, fov: 34, shift: 120 },
  // a valve and its trigger on the slab, in one frame (« les vannes s'ouvrent », « il détruit les déclencheurs »)
  valve: { ...P, ...CLOSE, tx: 520, ty: -230, tz: TRIGGERS[1][2], d: 1100, az: -16, el: 38, fov: 30, shift: 0 },
  trigger: { ...P, ...CLOSE, tx: TRIGGERS[1][0], ty: TRIGGERS[1][1] + 10, tz: TRIGGERS[1][2], d: 300, az: -50, el: 24, fov: 30, shift: 100 },
  // the heap on the slab (« le principe »): close, low
  heap: { ...P, ...CLOSE, tx: HEAP.at[0], ty: HEAP.at[1], tz: HEAP.at[2], d: 1300, az: -30, el: 7, fov: 32, shift: 0 },
  // the pit from outside, its block of glass: the counter-example (water on the thick pool)
  pitSide: { ...P, tx: 0, ty: 150, tz: 0, d: 1300, az: -40, el: 18, fov: 32, shift: 110 },
  // everything assembled, the whole path: act 2 cuts to the bench from it
  wide: { ...P, tx: 0, ty: 250, tz: 1000, d: 5600, az: -18, el: 22, fov: 34, shift: 120 },
  /* ── on the bench (the same place, the building gone) ── */
  exploded: { ...P, tx: 300, ty: 450, tz: 1000, d: 7400, az: -18, el: 22, fov: 34, shift: 280 },
  // the next file, far away
  teaser: { ...P, tx: TX, ty: 0, tz: TZ, d: 5600, az: -20, el: 34, fov: 36, shift: -20 },
};

/** What a cut to the bench sets, whatever came before: the system whole, at rest, dry, no melt, nobody. */
export const BENCHED = {
  set: SET.BENCH, shell: 0, vessel: 0.6, core: 0, teaser: 0,
  belly: 0, breach: 0, pour: 0, pit: 0, fume: 0, flow: 0, mass: 0, spread: 0, arrows: 0, cool: 0, steam: 0, blast: 0,
  explode: 0, eaten: 0, plug: 0, valves: 0, triggers: 0, water: 0, guard: 0,
  litPit: 0, litPlug: 0, litChannel: 0, litChamber: 0, litPool: 0, litValves: 0,
  mood: 0, gel: 0, pool: 0.25, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the plant sets: the building, the vessel over the pit, everything dry and shut, no melt yet.
 *  The act says where the melt is. */
export const STAGED = {
  set: SET.PLANT, shell: 1, vessel: 1, core: 0.7, teaser: 0,
  belly: 0, breach: 0, pour: 0, pit: 0, fume: 0, flow: 0, mass: 0, spread: 0, arrows: 0, cool: 0, steam: 0, blast: 0,
  explode: 0, eaten: 0, plug: 0, valves: 0, triggers: 0, water: 0, guard: 0,
  litPit: 0, litPlug: 0, litChannel: 0, litChamber: 0, litPool: 0, litValves: 0,
  mood: 1, gel: 0, pool: 0, grid: 0, fx: 0, fy: 200, fz: 0, fs: 500,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const corium = buildCorium();
  const batiment = buildBatiment();
  const bench = makeBench(SIZE);
  bench.group.position.y = BASEMENT.floor; // under everything: the cut to the bench is in place
  scene.add(batiment.group, system.root, corium.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    system, corium, batiment, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      batiment.update({ shell: S.shell, vessel: S.vessel, core: S.core, explode: S.explode, teaser: S.teaser, bench: onBench ? 1 : 0 }, time, px);
      system.update({
        explode: S.explode, eaten: S.eaten, plug: S.plug, valves: S.valves, triggers: S.triggers, water: S.water, guard: S.guard,
        litPit: S.litPit, litPlug: S.litPlug, litChannel: S.litChannel, litChamber: S.litChamber, litPool: S.litPool, litValves: S.litValves,
      }, time, px);
      // the melt only lives on the assembled system (the acts keep its numbers at 0 while it is exploded)
      corium.group.visible = S.explode < 0.02;
      corium.update({
        belly: S.belly, breach: S.breach, pour: S.pour, pit: S.pit, fume: S.fume, flow: S.flow, mass: S.mass, spread: S.spread,
        arrows: S.arrows, cool: S.cool, steam: S.steam, blast: S.blast, water: S.water, plug: S.plug,
      }, time, px);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00006;
    },
  };
}

export {
  VESSEL, PIT, PLUG, SHAFT, CHANNEL, CHAMBER, AREA, CENTRAL, FLOOD, POOL, VALVES, TRIGGERS, PIPES, HEAP, BASEMENT, TEASER, SYSTEM,
};
