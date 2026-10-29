// DOSSIER 029 — Airbag d'avalanche : the world. This file is the contract between the sets and the acts:
//   · plan.js    where everything stands (shared by pente.js and model.js) — and the two frames, slope and world
//   · FIRST      the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0      the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply      what each number does to the world, every frame
// Two sets. The SLOPE (pente.js): a slab slope seen like an X-ray — a grid that hugs the mountain, the crests and the
// sky far away — the crack that runs, the slab that breaks into blocks, the snow that flows and sorts its grains, and
// you, of glass, on your skis, then carried, rolled, buried, raised. The BENCH: the system alone on its pool of light —
// the pack, its harness, the handle, the cable, the cartridge, the venturi, the balloon. ONE object (model.js),
// re-parented: on your back (pente.js's A.pack) and on the bench; the cut from one to the other matches on it, in
// place AND at the same angle (`upright`, below).
// Three colours. signal is the threat: the crack, the snow that goes, the flow, the clock while you are under. veille
// is what saves: the handle, the gas, the balloon (and its promise), the surface you come back to. ink is the rest —
// the mountain, you, the air the venturi draws in.
//
// THE STORY (docs/faits/029-airbag-avalanche.md; the scene is a scenario, `sources` says so): off-piste, you set off a
// slab yourself; it breaks under your skis and carries you. If nothing acts, it rolls you, swallows you: buried, a
// dozen minutes (an order of magnitude). On your shoulder strap a handle: pull it, a cable pierces a gas cartridge,
// the gas through a venturi draws in the air around, ONE balloon of at least 150 L comes out of your back in a few
// seconds; in snow that flows the big blocks rise and the small ones sink — with the balloon you are nearly three
// times your volume, the snow passes under you, you rise toward the surface (never « ta tête sort »: not guaranteed).
// Never « flotter », « flottabilité » as a claim (the chute strikes it out: the idea it overturns); no brand; no speed
// of the avalanche; one balloon, not two.
//
// THE FRAME IS YOURS (plan.js): you stay at the slope's origin, the still mountain scrolls uphill past you by
// `travel`; the flow moves with you. Every pose of VIEW stays true through the whole slide.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  DEG, SLOPE, slopePt, DOWNHILL, NORMAL, SLAB, PACK_SNOW, FLOW, BLOCKS, YOU, SKIS, PACK_ON_TORSO,
  PACK, STRAPS, HANDLE, CABLE, CARTRIDGE, TRIGGER, VENTURI, HOSE, BAG, SYSTEM, BENCHAT, VALLEY,
} from "./plan.js";
import { buildModel } from "./model.js";
import { buildSlope } from "./pente.js";

export const SET = { BENCH: 0, SLOPE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the handle, the cartridge, the venturi on the
 *           bench, the strap in the snow. Never the hook, the slab, the section, the exploded view, the chute.
 *  `air`    off (no backlight here; on the bench it greys the green).
 *  `finish` the surface of the solid parts (the cartridge, the venturi, the handle): machining grain, handling marks. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

// The first frame is the hook, « Sous tes skis, la neige casse » — PROVISIONAL (candidate a, docs/029-actes.md): from
// below, at snow level, downhill of you: your skis of glass coming at the lens, the signal crack running across the
// slope under them toward the camera, the slab starting to go, the snow in streaks, the handle veille on your strap.
// The planche of four candidates (on the real sets) chooses it; it is pasted here before the acts are staged.
export const POSE0 = { tx: 0, ty: 40, tz: 0, d: 420, az: 60, el: -40, fov: 54, shift: 40, side: 0, roll: 0, drift: 0, dof: 0 }; // chosen on the candidates sheet (22/10): your skis seen from below, the step of the crack in a signal diagonal under them

export const FIRST = {
  set: SET.SLOPE,
  /* ── the slope and you (pente.js) ── */
  shell: 1, //    the X-ray of the mountain: the grid that hugs the slope, the crests, the sky (0–1)
  crack: 0.12, // the fracture running across the slope from under your skis: 0 none → 1 out to both edges (signal). Already running on frame 0
  slab: 0, //     the slab: 0 one plate → 1 cut into blocks along its cracks (the blocks still lie in place)
  travel: 0, //   metres the avalanche has carried you down the slope: the still mountain scrolls uphill past you (it never runs backwards)
  rush: 0.35, //   how hard the snow flies: the streaks' number and length, the churn — tie it to `travel`'s pace (0 still → 1 full)
  flow: 0, //     0 the slab slides as a raft of blocks → 1 a churning granular mass around you, its bed deeper (FLOW.bed)
  sort: 0, //     the grains: 0 mixed → 1 sorted, the BIG blocks riding the top, the small grains at the bottom (the demonstration)
  you: 1, //      0 nobody · 1 you, of glass, on your skis
  fall: 0, //     0 standing on your skis (upright in the world) → 1 knocked down, lying in the flow chest up, head uphill
  roll: 0, //     turns you have tumbled, head over heels (it accumulates: 1 = one turn, back to the same pose)
  bury: 0, //     0 on the flow's surface → 1 under it (your chest at YOU.chestDown: a metre of snow over you, illustrative)
  reach: 0, //    your left hand: 0 at your side → 1 on the handle (it follows the handle when `pull` moves it)
  teaser: 0, //   the next file far below in the valley: 0 nothing → 0.6 a chalet of glass → 1 a veille line into the ground under it
  sec: 0, //      the story's clock: seconds since the crack (main.js prints it); it may run fast (the « dizaine de minutes ») and come back
  /* ── the system (model.js) ── */
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart, in ONE vertical frame
  upright: 1, //  on the bench: 0 the pack holds the angle it had on your back at HANDOFF (the raccord) → 1 standing straight
  pull: 0, //     the handle pulled: 0 on the strap → 1 drawn HANDLE.pull cm out; the cable runs (your hand goes with it)
  pierce: 0, //   the trigger's pin through the cartridge's seal: a small veille spark at the head (0–1)
  gas: 0, //      the gas runs: veille heads from the cartridge through the venturi and the hose into the balloon (0–1)
  draw: 0, //     the venturi draws the air around in by its intakes: ink heads converging from all round (0–1)
  bag: 0, //      the balloon: 0 folded in its compartment → 1 full (≥ 150 L) round your head — the header's count reads it
  promise: 0, //  the hook's promise: the full balloon's OUTLINE, veille, round your head (the real one stays folded) (0–1)
  seethru: 0, //  the pack's fabric: 0 solid → 1 glass, the cartridge and the venturi seen inside (on your back, act 3)
  litHandle: 0.35, litCart: 0, litVenturi: 0, litBag: 0, // the part the voice is naming glows veille (the cable with the handle). The handle is lit a little from frame 0: the system already there
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 80, fz: 0, fs: 300, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The state act 1 ENDS on and act 2's cut STARTS from (« Tire. », the time frozen): you carried in the flow, half
 *  lying, near the surface, your hand on the handle. world.js poses the sets on it once at build time and reads where
 *  the pack and the handle are then: `world.handoff` (below) and VIEW.strap are aimed at them. */
export const HANDOFF = { crack: 1, slab: 1, travel: 9, rush: 0, flow: 0.9, sort: 0, fall: 0.55, roll: 1, bury: 0.3, reach: 1, pull: 0, sec: 17 };

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/029-pente.md, 029-model.md).
 *  On the slope: world coordinates (plan.js: az 0 downhill of you, +90 your left, ±180 uphill; el < 0 looks up). */
const [CX, CY, CZ] = SYSTEM.centre;
const at = (x, h, s) => {
  const [tx, ty, tz] = slopePt(x, h, s);
  return { tx, ty, tz };
};
export const VIEW = {
  hook: POSE0,
  /* ── the four candidates of the first frame (docs/029-actes.md) ── */
  // (b) behind you, low over your right shoulder: the pack, the crack across in front of your skis, the slope plunging into the void
  back: { ...P, tx: 0, ty: 90, tz: 60, d: 260, az: -170, el: 19, fov: 50, shift: 80 },
  // (c) at snow level ON the crown, on your left: the crack running at the lens across the slope, you in profile, the handle on your strap
  crackSide: { ...P, tx: 0, ty: 90, tz: 0, d: 355, az: 93, el: -9, fov: 46, shift: 60 },
  // (d) under the snow, in the old snowpack: up through the weak layer at your skis, the crack along it, the sky beyond
  under: { ...P, tx: 0, ty: 10, tz: 10, d: 215, az: 38, el: -63, fov: 54, shift: 0 },
  /* ── the slope ── */
  // your right side, low: the slab cut into blocks and sliding with you on it, the crown behind
  side: { ...P, tx: 0, ty: 90, tz: 0, d: 520, az: -80, el: 4, fov: 40, shift: 100 },
  // carried: low, downhill and to your right, the flow coming at the lens (« la neige t'emporte, te roule, t'avale »)
  ride: { ...P, ...at(0, 20, 0), d: 420, az: -35, el: -10, fov: 44, shift: 100 },
  // THE SECTION: from your right, across the slope, through the snow (X-ray) — the flow from its bed to its surface,
  // the blocks, you in it: the demonstration (act 3), the burial (act 1's vision), the chute
  section: { ...P, tx: 0, ty: -60, tz: 10, d: 950, az: -90, el: 4, fov: 34, shift: 0, roll: -32 }, // pente.js journal: the slope laid flat by the roll
  // the vision of act 1: the flow stopped and set, you under it — the same section, closer
  buried: { ...P, tx: 0, ty: -100, tz: -40, d: 600, az: -90, el: 4, fov: 36, shift: 0, roll: -32 }, // pente.js journal
  // your left strap and the handle, close — act 1 ends here (« Tire. »), act 2's benchCut leaves from it.
  // Its aim (tx, ty, tz) is FILLED IN by buildWorld: the handle, posed on HANDOFF.
  strap: { ...P, ...CLOSE, tx: 0, ty: 0, tz: 0, d: 150, az: 55, el: 12, fov: 30, shift: 60 },
  // above and behind you lying in the flow: the pack's top, where the balloon comes out (act 3)
  behind: { ...P, ...at(0, 30, -60), d: 300, az: -150, el: 30, fov: 36, shift: 100 },
  // the avalanche's path, wide: from the side and below, the crown far up, the crests and the sky
  wide: { ...P, ...at(0, 0, 1500), d: 6000, az: -60, el: 6, fov: 40, shift: 120 },
  // the valley far below, the chalet of the next file (abo) — from behind you, looking down the slope
  valley: { ...P, tx: 600, ty: -14145, tz: 21944, d: 15000, az: 178, el: 22, fov: 30, shift: -90 }, // pente.js journal, at travel 0; travel T m held: ty += 61.6·T, tz −= 78.8·T
  /* ── on the bench (the pack's origin at BENCHAT: its bottom on the floor) ── */
  whole: { ...P, tx: CX, ty: CY, tz: CZ, d: 230, az: -30, el: 18, fov: 30, shift: 120 },
  // the exploded view, in ONE vertical frame, read bottom → top in the voice's order: handle, cable, cartridge, venturi, balloon
  exploded: { ...P, tx: -3, ty: 40, tz: 18, d: 250, az: -24, el: 14, fov: 30, shift: 60 }, // model.js journal
  handleBench: { ...P, ...CLOSE, tx: -1, ty: 2, tz: 40, d: 95, az: 20, el: 14, shift: 80 }, // model.js journal
  cartBench: { ...P, ...CLOSE, tx: -6, ty: 38, tz: 34, d: 80, az: -40, el: 12, shift: 120 }, // model.js journal
  venturiBench: { ...P, ...CLOSE, tx: -6, ty: 58, tz: 34, d: 70, az: -40, el: 14, shift: 120 }, // model.js journal
  bagBench: { ...P, ...CLOSE, tx: -3, ty: 77, tz: 31, d: 90, az: -30, el: 18, shift: 120 }, // model.js journal
  // the balloon full on the bench, the pack whole (« Au moins cent cinquante litres »)
  bagFull: { ...P, tx: 0, ty: 70, tz: -5, d: 390, az: -30, el: 14, fov: 30, shift: 40 }, // model.js journal
};

/** What a cut to the bench sets, whatever came before: the system whole, at rest, folded, nobody. `sec` keeps its
 *  story value (the header goes on reading the story). */
export const BENCHED = {
  shell: 0, you: 0, crack: 0, slab: 0, rush: 0, flow: 0, sort: 0, fall: 0, roll: 0, bury: 0, reach: 0, teaser: 0,
  explode: 0, upright: 1, pull: 0, pierce: 0, gas: 0, draw: 0, bag: 0, promise: 0, seethru: 0,
  litHandle: 0, litCart: 0, litVenturi: 0, litBag: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the slope sets: the slab broken and flowing, you in it lying near the surface, the pack folded.
 *  `travel`, `roll`, `bury`, `sort`, `sec` are the act's (the mountain scrolls; every periodic thing wraps). */
export const STAGED = {
  shell: 1, you: 1, crack: 1, slab: 1, rush: 1, flow: 1, fall: 1, reach: 0, teaser: 0,
  explode: 0, upright: 1, pull: 0, pierce: 0, gas: 0, draw: 0, bag: 0, promise: 0, seethru: 0,
  litHandle: 0.35, litCart: 0, litVenturi: 0, litBag: 0,
  mood: 1, gel: 0, fx: 0, fy: 0, fz: 0, fs: 400,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const slope = buildSlope();
  const hero = buildModel();
  const set = new THREE.Group(); // the slope set (never moved nor turned)
  set.add(slope.group);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // the pack on the bench: its origin at BENCHAT, turned by `upright`
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  const qHand = new THREE.Quaternion(); // the pack's angle on your back at HANDOFF
  const qUp = new THREE.Quaternion();
  const v = new THREE.Vector3();

  function apply(S, time) {
    const onBench = S.set === SET.BENCH;
    const px = stage.pixelScale();
    bench.group.visible = onBench;
    set.visible = !onBench;
    const home = onBench ? benchMount : slope.A.pack;
    if (hero.root.parent !== home) home.add(hero.root);
    if (onBench) benchMount.quaternion.slerpQuaternions(qHand, qUp, Math.min(1, Math.max(0, S.upright)));
    hero.update({
      bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, pull: S.pull, pierce: S.pierce, gas: S.gas, draw: S.draw,
      bag: S.bag, promise: onBench ? 0 : S.promise, seethru: S.seethru,
      litHandle: S.litHandle, litCart: S.litCart, litVenturi: S.litVenturi, litBag: S.litBag,
    }, time, px);
    if (onBench) {
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
    } else {
      slope.update({
        shell: S.shell, crack: S.crack, slab: S.slab, travel: S.travel, rush: S.rush, flow: S.flow, sort: S.sort,
        you: S.you, fall: S.fall, roll: S.roll, bury: S.bury, reach: S.reach, pull: S.pull, teaser: S.teaser,
      }, time, px);
    }
    Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
    stage.grade.gelAmount = S.gel;
    setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
    const d = stage.pose?.d ?? stage.cam.d;
    scene.fog.density = onBench ? bench.fog(d) : 0.00012;
  }

  // HANDOFF, once, at build time: where the pack and the handle are, and at what angle the pack hangs — the raccord
  apply({ ...FIRST, ...STAGED, ...HANDOFF, set: SET.SLOPE }, 0);
  scene.updateMatrixWorld(true);
  const packAt = slope.A.pack.getWorldPosition(new THREE.Vector3());
  slope.A.pack.getWorldQuaternion(qHand);
  const handleAt = hero.A.handle.getWorldPosition(v).toArray();
  Object.assign(VIEW.strap, { tx: handleAt[0], ty: handleAt[1], tz: handleAt[2] });
  /** For act 2's benchCut: `origin` (where the pack stood, minus where it stands on the bench: the cut matches in
   *  place), the handle's point on the slope, and the pack's point. */
  const handoff = { origin: [packAt.x - BENCHAT[0], packAt.y - BENCHAT[1], packAt.z - BENCHAT[2]], handle: handleAt, pack: packAt.toArray() };

  return { slope, hero, bench, set, handoff, apply };
}

export {
  DEG, SLOPE, slopePt, DOWNHILL, NORMAL, SLAB, PACK_SNOW, FLOW, BLOCKS, YOU, SKIS, PACK_ON_TORSO,
  PACK, STRAPS, HANDLE, CABLE, CARTRIDGE, TRIGGER, VENTURI, HOSE, BAG, SYSTEM, BENCHAT, VALLEY,
};
