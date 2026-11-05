// DOSSIER 040 — L'abri anti-feu : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by crete.js, feu.js, model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The CREST: the Butte Fire's ridge top (Idaho, 29/08/1985), scraped pads along it, the 72 other shelters and
// their crews, the forest on the flanks — all seen like an X-ray — and the FIRE (feu.js), the front that climbs the
// canyon and crosses the crest. Solid in all that glass: your shelter (model.js) and you under it. The BENCH: that
// same shelter alone on its pool of light — its four layers, its air, the rays. ONE object, re-parented: the cut from
// one to the other matches on it, in place (the shelter stands on the origin in both).
// Three colours. signal is the threat: the front, its embers, its light on the foil, the rays that come in, the hot
// gas up under the dome, the glue that smokes, the hole. veille is the system alive: the rays it sends BACK (once they
// have bounced), the cool clean air at the floor, the layer the voice names. ink is the rest.
//
// THE STORY (docs/faits/040-abri-anti-feu.md; the image reconstitutes: `sources` says so). 73 firefighters on the crest,
// the wind laying the flames on them. Your clock is real time: −0:25 when the scene opens, −0:20 on « Vingt secondes »,
// frozen through the autopsy, caught up on the last words of the repos, 0:00 on « Zéro », then the hour and a half
// under the shelter (« environ », wildfiretoday). The hook is a flash-forward: the front passing over you, +0:04.
// What the picture must never show (contre-vérification): a ring of fire closed round the 73 (the pads are spread
// along the crest, the far flank's fire never joins the front), the alu MELTING (it glows, it does not melt), « 73
// intacts » as a caption, water.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { SHELTER, YOU, AIR, PACK, BAG, CREW, SHOVEL, DUO, FIRE, RAYS, SYSTEM, SIZE, ridgeY } from "./plan.js";
import { buildModel } from "./model.js";
import { buildCrete } from "./crete.js";
import { buildFire } from "./feu.js";

export const SET = { BENCH: 0, CRETE: 1 };
export { SIZE };
const [CX, CY, CZ] = SYSTEM.centre;

/** The studio. ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE): the layer named, the glue, the shovel, your mouth
 *           at the cool air. The hook, the crest's wide shots, the exploded view, the section stay sharp everywhere.
 *  `air`    the front's glow hanging behind the dome is the one place it could help (a real back-light): off until a
 *           before / after planche shows a net gain at 270 px (docs/recette-agents.md). Never on the bench.
 *  `finish` the solids' surface: on the crinkled foil it breaks the highlight — keep only if the alu still reads silver. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// THE FIRST FRAME — « Le feu te passe dessus. » Low on the scraped ground at your head's end, the silver dome lying in
// the foreground, three-quarters, ≈ 45 % of the width; the wall of flame just behind it, laid over by the wind, rolling
// over it from frame 1; embers flying at the lens; the foil glowing signal on its fire side. PROVISIONAL (candidate A,
// set on bouchons): the planche of four candidates (docs/040-actes.md, « Les candidates ») chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { tx: 0, ty: 60, tz: -20, d: 560, az: -22, el: -5, fov: 44, shift: 40, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.CRETE,
  /* ── the header (main.js) ── */
  clock: 4, //     the story's clock, seconds from « Zéro » (the front reaching you): −25 … 0 … 5 400 (1 h 30)
  abris: 73, //    shelters deployed on the crest, 0–73 (the header's second readout; 73 is sourced)
  /* ── the crest (crete.js) ── */
  shell: 1, //     the X-ray of the place (0–1)
  crowd: 0, //     the 72 others standing (0–1)
  deploy: 1, //    the 72 others under their shelters (0 standing → 1 lying, each its turn)
  burn: 0.6, //    the forest on the flanks: 0 standing → 1 burnt
  shovel: 1, //    your shovel beside you (0–1)
  char: 0.15, //   its handle: 0 whole → 1 consumed to the steel
  duo: 0, //       the comment's two figures (0–1)
  debris: 0, //    the next file's spark across the sky (0 → 1 one stroke)
  /* ── the fire (feu.js) ── */
  front: -6, //    metres: the front's foot along z (0 at your feet, −200 the canyon floor, +40 gone past)
  fire: 1, //      the front's strength (0–1)
  lean: 0.75, //   the wind lays it over toward +z (0 upright → 1 flat)
  flank: 0.35, //  the far flank's own line of fire (0–1), never joined to the front
  smoke: 1, //     smoke over the front (0–1)
  embers: 1, //    embers flying (0–1)
  rays: 0, //      the ten radiation rays (0–1)
  bounce: 0, //    0 all in → 1 nine bounce back (veille once bounced)
  leak: 0, //      the tenth goes in and dies across the air gap (0–1)
  lick: 0, //      one tongue of flame plastered on the corner (0–1)
  /* ── the system (model.js) ── */
  explode: 0, //   0 assembled → 1 the layers apart like pages
  fold: 0, //      0 deployed · 0.5 out of its case, shaking open · 1 folded in its case (on the bag, on the bench)
  cut: 0, //       0 whole → 1 the section (the −x half off)
  you: 1, //       you under it (0–1)
  head: 0, //      0 face in the dirt → 1 head lifted into the hot gas
  hands: 1, //     hands and boots pressing the hem down (0–1)
  rise: 0, //      0 lying → 1 standing beside it (the like)
  cool: 0, //      the cool air at the floor, veille (0–1)
  hot: 0, //       the hot gas higher up, signal (0–1)
  heat: 0.4, //    the foil glows under the front (0–1; it never melts)
  glue: 0, //      the glue joint smokes, the corner lifts (0–1)
  hole: 0, //      the corner gives: a hole, the heat comes in (0–1)
  litFoil: 0, litGap: 0, litFibre: 0, litInner: 0, // the layer the voice names glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1); `gel` a
  // signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 20, fz: 0, fs: 420, mood: 1, gel: 0.12, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next — complete: nothing is inherited across a cut. ALL PROVISIONAL, set on
 *  BOUCHONS (architecte, 05/11): the decor agents give better ones in their journals (docs/journal/040-*.md), and
 *  docs/040-actes-maj.md lists the ones to re-set. Every pose says its lens (dof 0; the close-ups spread CLOSE). */
const P = { fov: 30, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the crest ── */
  // under the sheet: the section of your shelter in the crest, low from −x — you, face in the dirt, the glow through
  under: { ...P, tx: 0, ty: 16, tz: 0, d: 620, az: -86, el: 6, fov: 34, shift: 60 },
  // from the end of the crest, low, along it: the pads, the crews, the front climbing the −z flank (scene)
  crest: { ...P, tx: -2200, ty: -200, tz: -1600, d: 5600, az: -62, el: 15, fov: 38, shift: 140 },
  // over the crest's edge, down into the canyon: the front climbing at the crews (scene, « le vent rabat »)
  canyon: { ...P, tx: 0, ty: -2600, tz: -6000, d: 9000, az: 8, el: 32, fov: 40, shift: 100 },
  // your hands shaking the packet open by its two handles (scene's last image) — the figure standing, kneeling
  shake: { ...P, ...CLOSE, tx: 0, ty: 80, tz: 0, d: 300, az: -40, el: 4, fov: 34, shift: 60 },
  // act 2 cuts to the bench from it (benchCut, origin [0,0,0]): the deployed shelter, three-quarters
  system: { ...P, tx: CX, ty: CY, tz: CZ, d: 620, az: -40, el: 18, fov: 30, shift: 120 },
  /* ── on the bench (the shelter at the origin, as on its pad) ── */
  whole: { ...P, tx: 0, ty: 24, tz: 0, d: 640, az: -42, el: 20, shift: 140 },
  // the exploded view: the pages one above the other, in ONE vertical frame (fs SIZE)
  exploded: { ...P, tx: 0, ty: 60, tz: 0, d: 720, az: -36, el: 24, shift: 150 },
  // each layer named: the camera goes down the pages (eclate)
  foilClose: { ...P, ...CLOSE, tx: -10, ty: 120, tz: 10, d: 380, az: -46, el: 26, shift: 60 },
  gapClose: { ...P, ...CLOSE, tx: -20, ty: 70, tz: 30, d: 330, az: -50, el: 14, shift: 120 },
  fibreClose: { ...P, ...CLOSE, tx: -20, ty: 52, tz: 30, d: 330, az: -50, el: 12, shift: 120 },
  innerClose: { ...P, ...CLOSE, tx: -10, ty: 20, tz: 30, d: 330, az: -60, el: 10, shift: 120 },
  // the section from the side (the long axis across the frame): the rays come from −z (principe, chute)
  section: { ...P, tx: 0, ty: 30, tz: -50, d: 620, az: -90, el: 9, fov: 32, shift: 100 },
  // folded on the bag: the loaf (repos) · close on the glue's corner
  packBench: { ...P, ...CLOSE, tx: 0, ty: 52, tz: 0, d: 150, az: -38, el: 24, shift: 80 },
  glueClose: { ...P, ...CLOSE, tx: SHELTER.glue[0], ty: SHELTER.glue[1] + 6, tz: SHELTER.glue[2], d: 120, az: -20, el: 18, shift: 120 },
  /* ── act 3 in the crest ── */
  // the front cresting, your dome in the foreground from +x, low (zero)
  zeroWide: { ...P, tx: 0, ty: 200, tz: -500, d: 2600, az: 58, el: 4, fov: 36, shift: 140 },
  // inside, the section in place: you, the straps, your hands at the hem (zero)
  inside: { ...P, tx: 0, ty: 16, tz: 10, d: 380, az: -80, el: 10, fov: 34, shift: 60 },
  // the climax: low at your shelter's side, the front rolling over it (reponse « te passe dessus »)
  over: { ...P, tx: 0, ty: 60, tz: -60, d: 820, az: -64, el: 2, fov: 38, shift: -40 },
  // the shovel beside you, its handle burning (« les manches de pelle se consument »)
  shovelClose: { ...P, ...CLOSE, tx: -107, ty: 4, tz: 19, d: 460, az: -62, el: 26, fov: 30, shift: 60 },
  // your mouth at the cool layer, inside the section (« tu respires l'air du sol »)
  mouth: { ...P, ...CLOSE, tx: 0, ty: 10, tz: 70, d: 260, az: -100, el: 6, shift: 60 },
  // the long recoil: the burnt crest, the 73 silver domes along it (reponse « 73 abris »)
  // along the crest from your −x side: you first, then the clusters receding in perspective (from high, a dome is 4 px)
  back: { ...P, tx: 1800, ty: -1200, tz: 3000, d: 7000, az: -150, el: 34, fov: 40, shift: 140 },
  /* ── the end ── */
  // the comment's two figures, the front below them (comment)
  duo: { ...P, tx: DUO.at[0], ty: 20, tz: DUO.at[2], d: 700, az: 24, el: 30, fov: 32, shift: 120 },
  // you standing at your shelter's edge, from behind, facing the smoking slope (like)
  standing: { ...P, tx: -90, ty: 110, tz: -100, d: 520, az: 20, el: 4, fov: 34, shift: 80 },
  // the crest going black, the sky over it (abo)
  sky: { ...P, tx: 0, ty: 3000, tz: -9000, d: 16000, az: 10, el: -6, fov: 50, shift: -200 },
};

/** What a cut to the bench sets, whatever came before: the shelter whole, deployed, you under it, nothing burning.
 *  `clock` and `abris` keep their story values (the header goes on reading the crest). */
export const BENCHED = {
  shell: 0, crowd: 0, deploy: 0, burn: 0, shovel: 0, char: 0, duo: 0, debris: 0,
  fire: 0, lean: 0, flank: 0, smoke: 0, embers: 0, rays: 0, bounce: 0, leak: 0, lick: 0,
  explode: 0, fold: 0, cut: 0, you: 1, head: 0, hands: 0, rise: 0, cool: 0, hot: 0, heat: 0, glue: 0, hole: 0,
  litFoil: 0, litGap: 0, litFibre: 0, litInner: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the crest sets: the 73 deployed, you under yours, the front 30 m down the flank, laid by the wind.
 *  `front`, `clock`, `abris` are the act's to set. */
export const STAGED = {
  shell: 1, crowd: 0, deploy: 1, burn: 0, shovel: 1, char: 0, duo: 0, debris: 0,
  fire: 1, lean: 0.5, flank: 0.3, smoke: 1, embers: 1, rays: 0, bounce: 0, leak: 0, lick: 0,
  explode: 0, fold: 0, cut: 0, you: 1, head: 0, hands: 1, rise: 0, cool: 0, hot: 0, heat: 0, glue: 0, hole: 0,
  litFoil: 0, litGap: 0, litFibre: 0, litInner: 0,
  mood: 1, gel: 0.1, fx: 0, fy: 20, fz: 0, fs: 600,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const crete = buildCrete();
  const fire = buildFire();
  const hero = buildModel();
  const set = new THREE.Group(); // the crest set
  set.add(crete.group, fire.group);
  const mount = crete.A.pad; // your pad: the origin of the crest
  const bench = makeBench(SIZE);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    crete, fire, hero, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? bench.group : mount;
      if (hero.root.parent !== home) home.add(hero.root);
      if (fire.rays.group.parent !== home) home.add(fire.rays.group);
      hero.update({
        bench: onBench ? 1 : 0, explode: S.explode, fold: S.fold, cut: S.cut, you: S.you, head: S.head, hands: S.hands,
        rise: S.rise, cool: S.cool, hot: S.hot, heat: S.heat, glue: S.glue, hole: S.hole, lean: S.lean,
        litFoil: S.litFoil, litGap: S.litGap, litFibre: S.litFibre, litInner: S.litInner,
      }, time, px);
      fire.rays.update({ rays: S.rays, bounce: S.bounce, leak: S.leak, lick: S.lick, bench: onBench ? 1 : 0 }, time, px);
      fire.update({
        bench: onBench ? 1 : 0, front: S.front, fire: S.fire, lean: S.lean, flank: S.flank, smoke: S.smoke, embers: S.embers,
      }, time, px);
      if (!onBench) {
        crete.update({
          shell: S.shell, crowd: S.crowd, deploy: S.deploy, burn: S.burn, shovel: S.shovel, char: S.char, duo: S.duo,
          debris: S.debris,
        }, time, px);
      }
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.6);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00004;
    },
  };
}

export { SHELTER, YOU, AIR, PACK, BAG, CREW, SHOVEL, DUO, FIRE, RAYS, SYSTEM, ridgeY };
