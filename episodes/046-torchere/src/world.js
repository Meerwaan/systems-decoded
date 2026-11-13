// DOSSIER 046 — Torchère : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (a MAQUETTE at the scale of the subject: no length is ever shown)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Three files build it (docs/046-decors.md):
//   model.js       THE SYSTEM, solid: the flare network — three relief valves, the header, the knock-out drum, the water
//                  seal, the stack, the tip and its pilot nozzle; the gas inside it (flow, liquid, bubbles, purge, air)
//   flamme.js      the fire and the gas out of the tip: the giant flare and its black smoke, the pilot flame, the raw gas
//                  of a dead tip, the rain of fire
//   raffinerie.js  the refinery around it, X-ray: the columns that fill with pressure, the compressor that stops, the
//                  rack, the plant; the ghosts (a column bursting, a cloud in the open air); the flat's window (like);
//                  the next file's X-ray dishwasher and its spray arm (abo, boucle)
// TWO SETS, ONE PLACE. The SCENE: the refinery at dusk, X-ray, the network solid in it. The BENCH: the same network,
// in place (nothing moves on the cut), the refinery gone but the three columns as faint glass, a pool of light under it.
//
// THE STORY (docs/faits/046-torchere.md; a scenario after Fos-sur-Mer, 31/08/2017, never named — `sources` says so):
// 16:30, an electrical fault stops a compressor; the units must be emptied of their gas under pressure; by procedure it
// goes to the flare: the relief valves open into the header, the drum keeps the liquid, the gas bubbles through the
// water seal, climbs the stack, the pilot lights it, the flare swells and roars, the pressure falls; half an hour
// later the compressor restarts. Nothing exploded. Colours: signal is the threat — the pressure in the columns, the
// relief gas, the liquid, the air, the raw gas, the ghosts; veille the system alive — the pilot, the purge, the seal
// that holds; ink the rest. The FLARE itself is signal (a fire), its smoke dark.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { STACK, TIP, PILOT, FLAME, SEAL, KO, HEADER, FLOWAT, VALVES, COLUMNS, COMPRESSOR, PANE, TEASER, BENCHAT, NETWORK } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildFlamme } from "./flamme.js";
import { buildRaffinerie } from "./raffinerie.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = NETWORK.size;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off.
 *  `dof` on the CLOSE-UPS only (the poses that spread CLOSE); `air` off (no net gain proven yet: the flare is a
 *  candidate for it — judge before/after at 270 px); `finish` the solids' surface. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// THE FIRST FRAME (chosen by the chef on three planches, 13/11 — « m », between candidates i and k of
// .cache/planches/046/image0c.json): low under the stack, into the dusk glow (az ≈ 100): the stack dark on its halo,
// the tip and its green pilots big at the top, the flare swelling at once; the three columns red, X-ray, behind its foot.
// Candidate (a) at az 156 left the columns out of frame. Sharp (dof 0).
export const POSE0 = { tx: -750, ty: 1950, tz: 0, d: 3300, az: 100, el: -22, fov: 50, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── the refinery (raffinerie.js) ── */
  shell: 1, //    the X-ray of the plant: glass, fine lines (0–1). On the bench only the three columns stay, faint
  press: 1, //    the pressure in the columns: their inside fills signal from the bottom (0 calm → 1 full, about to blow)
  rotor: 0, //    the compressor's rotor angle, in TURNS (the act makes it run, slow down, stop, restart)
  hum: 0, //      the compressor running: its motor alive, the rotor's blur (0 stopped → 1 running)
  spark: 0, //    the electrical fault: a light that has a place, on the motor (0 → 1 → 0, one flash)
  blast: 0, //    the ghost of what the flare prevents: a column bursting, signal, then gone (0 → 1 is its whole life)
  cloud: 0, //    the ghost of a cloud in the open air round the columns, « prêt à flamber » (0–1)
  pane: 0, //     the flat's window in the foreground (like): 0 none → 1 the frame of glass, the torch beyond
  teaser: 0, //   the next file (047): the X-ray dishwasher on its own floor (0 hidden → 1 there)
  arm: 0, //      its spray arm's angle, in DEGREES (the act makes it turn)
  jets: 0, //     its jets: veille streaks out of the arm (0–1)
  /* ── the system (model.js) ── */
  explode: 0, //  on the bench: 0 assembled → 1 the network apart along the gas path (valves up, tip up)
  section: 0, //  the knock-out drum, the seal and the stack open in section: what is inside reads (0–1)
  relief: 0, //   the relief valves open: their discs lift (0 shut → 1 wide open)
  flow: 0, //     where the relief gas has reached along the path (plan.js FLOWAT: valves 0, header .12, drum .36, seal .55, stack .72, tip 1)
  liquid: 0, //   the liquid falling out in the drum and lying at its bottom, signal (0–1)
  bubbles: 0, //  the purge bubbling through the seal, veille (the relief gas bubbles by itself when `flow` is in the seal)
  purge: 1, //    the thin stream of gas rising in the stack day and night, veille (0–1)
  air: 0, //     the air trying to come down into the tip, signal arrows pushed back by the purge (0–1)
  litValves: 0, litHeader: 0, litDrum: 0, litSeal: 0, litStack: 0, // the part the voice names glows faintly veille
  /* ── the fire (flamme.js) ── */
  flare: 0.35, // the flare: 0 nothing → ≈ 0.08 the purge's tiny flame → 1 the giant flame (signal) — the first frame swells it
  smoke: 0.6, //  its black smoke, climbing (0–1)
  pilot: 1, //    the pilot flame on the tip, veille (0 out → 1 lit); the header reads it
  raw: 0, //      a dead tip: raw gas pouring out and sinking toward the plant, a grey cloud with signal lines (0–1)
  drip: 0, //     the rain of fire: burning drops falling from the flame, ghosts (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -300, fy: 1500, fz: 0, fs: 2400, mood: 1, gel: 0.15, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Set on BOUCHONS: the builders
 *  give better ones in their journals (docs/journal/046-*.md). Every pose says its lens. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [KX, KY] = KO.at;
const [VX, VY] = VALVES[1].at;
export const VIEW = {
  hook: POSE0,
  /* ── the scene ── */
  // the tip, close, from the camera's side of the hero pilot: the pilot and the flame's root (« sa plus petite flamme »)
  tip: { ...P, ...CLOSE, tx: -40, ty: TIP.y1 + 40, tz: 30, d: 520, az: -40, el: -14, fov: 32, shift: 140 },
  // the compressor in the foreground, the columns behind it (scene: « coupe un compresseur »)
  compressor: { ...P, tx: COMPRESSOR.at[0] - 150, ty: 260, tz: COMPRESSOR.at[2], d: 2400, az: 25, el: 12, fov: 34, shift: 60 },
  // the three columns and their valves, the header leaving them (« ton usine doit vider son gaz », the ghost cloud)
  columns: { ...P, tx: -1800, ty: 800, tz: 0, d: 3900, az: -42, el: 12, fov: 36, shift: 130 },
  // the header on its rack, followed toward the drum (« il reste une sortie… ») and the gas in act 3
  header: { ...P, tx: -1450, ty: 600, tz: 0, d: 1500, az: -52, el: 13, fov: 32, shift: 140 },
  // the stack's foot and the seal, close: where act 1 ends and act 2 cuts to the bench in place
  foot: { ...P, ...CLOSE, tx: -240, ty: 360, tz: 0, d: 1200, az: -38, el: 11, fov: 30, shift: 140 },
  // the whole plant under the giant flare (« Rien n'a explosé », the chute)
  flare: { ...P, tx: -1500, ty: 1700, tz: 0, d: 9000, az: -62, el: 7, fov: 40, shift: 60 },
  // from the flat's window: the frame in the foreground, the torch beyond (like). Camera ≈ 1 m behind PANE.at
  pane: { ...P, tx: 0, ty: 1600, tz: 0, d: 3700, az: 40, el: -2, fov: 34, shift: 120 },
  /* ── on the bench (in place) ── */
  // the network whole, every part readable (the exploded view in ONE frame)
  exploded: { ...P, tx: -1000, ty: 950, tz: 0, d: 8400, az: -24, el: 14, fov: 32, shift: 80 },
  // the three valves and the manifold (« toutes les soupapes débouchent dans un seul tuyau »)
  valves: { ...P, ...CLOSE, tx: VX + 100, ty: (VY + HEADER.y) / 2, tz: 0, d: 2600, az: -55, el: 12, shift: 140 },
  // the drum in section (« un ballon y retient le liquide »)
  drum: { ...P, ...CLOSE, tx: KX, ty: KY + 30, tz: 0, d: 3000, az: -38, el: 18, shift: 120 },
  // the seal in section, the heart (« la garde hydraulique »)
  seal: { ...P, ...CLOSE, tx: SEAL.at[0], ty: 250, tz: SEAL.at[1], d: 1300, az: -34, el: 16, shift: 120 },
  // up the stack (« un filet de gaz monte dans la torche »): aim mid-stack, the purge rising in it
  stack: { ...P, tx: 0, ty: 1100, tz: 0, d: 2100, az: -40, el: 6, fov: 32, shift: 140 },
  // the system whole again, calm (repos)
  whole: { ...P, tx: -1000, ty: 950, tz: 0, d: 7600, az: -32, el: 14, fov: 32, shift: 160 },
  /* ── the next file (047) ── */
  // the dishwasher whole, three-quarter, the #next panel above it in the high zone
  washer: { ...P, tx: TEASER.at[0], ty: 42, tz: TEASER.at[2], d: 300, az: -35, el: 16, fov: 30, shift: -170 },
  // inside it, under the upper arm, looking up: the arm turns in the frame — the loop's match on the rotation
  washerArm: { ...P, tx: TEASER.at[0], ty: TEASER.arm.y, tz: TEASER.at[2], d: 30, az: -30, el: -84, fov: 64, shift: 0 },
};

/** What a cut to the bench sets, whatever came before: the network whole, at rest, in place; the plant gone (the
 *  columns faint), the pressure gone from the picture, the purge and the pilot alive, the flare at its tiny flame. */
export const BENCHED = {
  shell: 0, press: 0, hum: 0, spark: 0, blast: 0, cloud: 0, pane: 0, teaser: 0, jets: 0,
  explode: 0, section: 0, relief: 0, flow: 0, liquid: 0, bubbles: 0, purge: 1, air: 0,
  litValves: 0, litHeader: 0, litDrum: 0, litSeal: 0, litStack: 0,
  flare: 0.08, smoke: 0, pilot: 1, raw: 0, drip: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: NETWORK.centre[0], fy: NETWORK.centre[1], fz: NETWORK.centre[2], fs: SIZE,
};
/** What a cut to the scene sets: dusk, the plant running, the network at rest, the pilot lit, the tiny flame. */
export const STAGED = {
  shell: 1, press: 0, hum: 1, spark: 0, blast: 0, cloud: 0, pane: 0, teaser: 0, jets: 0,
  explode: 0, section: 0, relief: 0, flow: 0, liquid: 0, bubbles: 0, purge: 1, air: 0,
  litValves: 0, litHeader: 0, litDrum: 0, litSeal: 0, litStack: 0,
  flare: 0.08, smoke: 0, pilot: 1, raw: 0, drip: 0,
  mood: 1, gel: 0, fx: -1000, fy: 800, fz: 0, fs: 3200,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const flamme = buildFlamme();
  const raffinerie = buildRaffinerie();
  const set = new THREE.Group(); // the scene: the system stands in it at the world's origin
  set.add(raffinerie.group);
  const bench = makeBench(SIZE);
  bench.group.position.set(...BENCHAT);
  const benchMount = new THREE.Group(); // …and on the bench, at the same place (the cut matches in place)
  benchMount.position.set(-BENCHAT[0], -BENCHAT[1], -BENCHAT[2]);
  bench.group.add(benchMount);
  scene.add(set, bench.group, flamme.group);
  stage.grade.gel.set(0xff5b2e);
  const eye = new THREE.Vector3();
  const FL = { flare: 0, smoke: 0, pilot: 0, raw: 0, drip: 0 }; // one object for flamme.update, filled in apply

  return {
    system, flamme, raffinerie, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      const home = onBench ? benchMount : set;
      if (system.root.parent !== home) home.add(system.root);
      raffinerie.update({
        bench: onBench ? 1 : 0, shell: onBench ? 0 : S.shell, press: S.press, rotor: S.rotor, hum: S.hum, spark: S.spark,
        blast: S.blast, cloud: S.cloud, pane: S.pane, teaser: S.teaser, arm: S.arm, jets: S.jets,
      }, time, px);
      system.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, section: S.section, relief: S.relief, flow: S.flow,
        liquid: S.liquid, bubbles: S.bubbles, purge: S.purge, air: S.air, litValves: S.litValves, litHeader: S.litHeader,
        litDrum: S.litDrum, litSeal: S.litSeal, litStack: S.litStack,
      }, time, px);
      stage.camera.getWorldPosition(eye);
      flamme.group.position.y = onBench ? 140 * S.explode : 0; // the flame rides on the lifted tip
      FL.flare = S.flare; FL.smoke = S.smoke; FL.pilot = S.pilot; FL.raw = S.raw; FL.drip = S.drip;
      flamme.update(FL, time, px, eye);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00011;
    },
  };
}

export { STACK, TIP, PILOT, FLAME, SEAL, KO, HEADER, FLOWAT, VALVES, COLUMNS, COMPRESSOR, PANE, TEASER, BENCHAT, NETWORK };
