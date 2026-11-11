// DOSSIER 044 — Le gilet pare-balles : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by gilet.js and rue.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two new files, ONE place (no re-parenting of the camera's subject between sets): the SYSTEM, solid (gilet.js: the vest
// on the body, the front panel — housse, 24 woven layers, seams —, the bullet, the cone, the mushroom; on the bench the
// exploded view, the heart yarn and the strength test); AROUND, X-ray (rue.js: the street of a housing estate at night,
// its riot, « toi » the policeman of glass and his X-ray torso, the walk home; on the bench the clay block and its
// gauge, the ghost plate, the ghost blade, the 045 rocket). The BENCH is the same place with the street faded and a pool
// of light at the panel's foot, 64 cm to his left: the panel SLIDES OUT of its pocket onto it (`out`), and back.
// Three colours. signal is the threat: the bullet and its wake, the yarns that snap, the riot's fires, the blow on the
// belly. veille is the system alive: the yarns that take the strain, the fold that runs out, each layer taking its
// part, the heart yarn, the panel's two faces. ink is the rest: the street, the glass, the ghosts, the clay's gauge.
//
// THE STORY (docs/faits/044-gilet-pare-balles.md): Nîmes, a night of riots (30 June → 1 July 2023, ≈ 2.30 a.m.), a
// policeman thinks a stone has hit him; the next evening a bullet is found lodged in his vest. The film never shows the
// shooter, the gun, the distance, his face or his name, and nothing broken in him. The bullet is a reconstitution.
import { makeBench, setMood } from "@kit/blocks.js";
import { STREET, PANEL, IMPACT, BENCH, TEST, CLAY, TEASER, IMPACT_BENCH } from "./plan.js";
import { buildGilet } from "./gilet.js";
import { buildRue } from "./rue.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of what stands on the bench (the exploded panel spans ≈ 80 cm): sizes the bench, its light, its shadows. */
export const SIZE = BENCH.size;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the tip, the weave, the heart yarn, the mushroom, the clay
 *  `air`    off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts (the bullet, the carrier's buckles): machining grain, handling marks
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Tu prends une balle. Tu crois à une pierre. » : low behind his left shoulder, looking
// up at the flank of his torso (glass, the ribs in fine lines); the front panel of his vest cut open (`section`), the
// bullet already flattening in it, the layers already bending into a cone toward the ribs; up the street behind him,
// the riot's red night. PROVISIONAL (candidate a, set on bouchons): the planche of four candidates (docs/044-actes.md)
// chooses it, and it is pasted here before the acts are staged.
export const POSE0 = { tx: -9.5, ty: 107, tz: 5, d: 34, az: 28, el: -8, fov: 34, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 }; // image 0 : macro en coupe, choisie sur planche (c2)

export const FIRST = {
  set: SET.SCENE,
  /* ── around (rue.js) ── */
  shell: 1, //     the street, X-ray: façades of glass, ground lines, lamps (0–1)
  riot: 1, //      the riot's life: the fires (signal), the smoke, the far silhouettes, the burnt car (0–1)
  you: 1, //       the policeman of glass, standing in the street facing up it (0–1)
  xray: 1, //      his torso seen close: the ribs, the sternum, the belly in fine lines (0–1; at a distance the figure is enough)
  wave: 0, //      the blow on his belly: a signal ripple that runs out once over the ribs, 0 → 1
  walk: 0, //      0 standing · 0 → 0.12 he turns round · → 1 ≈ 26 m down the street, toward home (+x)
  clay: 0, //      the clay block on the bench behind the panel (0–1)
  dent: 0, //      its dent: the cone's own profile, 1 = 4.4 cm
  gauge: 0, //     the depth gauge: 0.2 the edge laid across · → 1 the probe at the bottom of the dent, the 44 mark lit veille
  wall: 0, //      the chute's ghost: a rigid plate of glass in front of the panel, on the torso (0–1)
  bounce: 0, //    its ghost bullet: 0 → 0.5 comes at the plate · 0.5 contact · → 1 bounced back up the street
  blade: 0, //     the comment's ghost blade, facing the panel on the bench, never touching (0–1)
  teaser: 0, //    the 045 rocket on the halo: 0 → 0.5 it comes up · → 1 its charge along the body lit signal
  /* ── the system (gilet.js) ── */
  vest: 1, //      the carrier on the body: its front pocket, the back panel, the straps — solid (0–1)
  out: 0, //       the front panel: 0 in its pocket on the belly · 1 standing on the halo, 64 cm to his left
  section: 1, //   the panel (and the carrier, and the clay) cut through the impact: their part at z > IMPACT z hidden (0–1)
  housse: 0, //    the housse opens: its two halves away along ±x (0–1)
  explode: 0, //   the 24 layers apart along the bullet's path, fanned like pages (0–1; on the bench)
  litHousse: 0, // the part the voice names, a faint veille edge: the housse (0–1)
  litSeams: 0, //  the seams, dotted veille (0–1)
  litWeave: 0, //  the crossed yarns of every layer, their lines brought up (0–1; « des fils croisés, serrés », « un filet »)
  fiber: 0, //     the heart: one yarn drawn out of the first layer, veille (0 in · 1 drawn out ≈ 20 cm)
  solo: 0, //      the first layer alone, the others gone (0–1)
  spread: 0, //    the strain along the crossed yarns from the impact point: 0.3 a cross · 1 a star over hundreds of yarns (veille)
  test: 0, //      the strength test on the halo: two strands of the same weight, Kevlar and steel (0–1)
  load: 0, //      its blocks: 0.2 one on each · 0.4 the second — the steel wire snaps, its block falls · 1 five on the Kevlar
  faces: 0, //     the two faces: 0 → 0.5 the arrow toward the street · 0.5 → 1 the arrow toward the body (veille)
  bullet: 1, //    the bullet seen (0–1)
  dist: 0, //      cm from the strike face before contact (≥ 0; at 0 the tip touches; the acts never go below 0)
  trail: 0.6, //   its wake, signal, behind it along the path (0–1; after contact a streak that fades)
  pierce: 0.2, //  the front layers broken through: a fraction of the 24 (0–1; never above 0.45: it stops in the panel)
  breaks: 0.5, //  the broken yarn ends: 0 → 0.5 they spring out (peak, signal) · 0.5 → 1 they droop and dim
  tense: 0.5, //   the struck yarns pulled tight along the path, lit veille (0–1)
  ring: 0.35, //   the fold that runs out from the tip, layer after layer: its radius 0 → R (0–1)
  share: 0, //     « chaque couche prend sa part »: each layer lights veille in turn, from the strike face to the wear face (0 → 1)
  cone: 0.5, //    the hollow toward the body: 1 = 4.4 cm at the wear face (the clay, the belly follow the same profile)
  mushroom: 0.55, // the bullet flattening: 0 round nose · 1 the mushroom, lodged
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -10, fy: 110, fz: 5, fs: 40, mood: 1, gel: 0, pool: 0, grid: 0,
};

/** The light's stand-points, ready to spread into a `st`: on the panel at home, on the bench, on the street, on the test, on the clay. */
export const LIGHT = {
  panel: { fx: PANEL.x, fy: IMPACT[1] + 4, fz: IMPACT[2], fs: 40 },
  bench: { fx: BENCH.at[0], fy: PANEL.y, fz: BENCH.at[2], fs: 70 },
  street: { fx: -300, fy: 140, fz: 0, fs: 700 },
  test: { fx: TEST.at[0], fy: TEST.at[1] + 40, fz: TEST.at[2], fs: 60 },
  clay: { fx: CLAY.face, fy: IMPACT_BENCH[1], fz: IMPACT_BENCH[2], fs: 50 },
};

/** The poses one act hands to the next (complete where a cut lands on them). THE CAMERA TURNS ONE WAY: in every path,
 *  az DECREASES. The order below follows the film (a | is a cut):
 *   acte1  +32 (POSE0) → +18 → +8 (cut) → 0 (belly) → −4 | +82 (night) → +70 (shot) → +36 (track) → +20 → 0 (ahead) → −14 (gilet) → −28 (tip)
 *   acte2  −28 → −36 (frozen) → −42 (benchIn) → −50 (exploded) → −62 (weave) → −68 (fiber) → −72 (solo) → −80 → −88 (test)
 *          → −100 (rest) → −130 → −150 (faceRue) → −195 (faceToi) | +30 (touch) → +18 (zero)
 *   acte3  +18 (zero) → +12 → +4 → −4 → −10 → −16 (cone) → −22 → −28 → −34 (mush) → −40 (planted) → −52 → −62 (home)
 *   fin    | +24 (verdict) → +16 → +8 (net) → 0 → −8 → −16 → −24 → −30 (clayView) → −44 (blade) → −52 (like) → −60 → −66 (teaser) → −74
 *          | +44 (back = POSE0 + 12) → +32 (POSE0)
 *  Starting points, set on BOUCHONS: the builders give better ones in their journals (docs/journal/044-<file>.md). */
const P = { fov: 34, shift: 120, side: 0, roll: 0, drift: 0.3, dof: 0 };
const BX = BENCH.at[0], BZ = BENCH.at[2];
export const VIEW = {
  hook: POSE0,
  /* ── the candidates of the first frame (docs/044-actes.md § Les candidates) ── */
  // b: in front of him, low, to his left: the strike face, the bullet's wake coming out of the foreground, the cut
  front: { ...P, tx: -11, ty: 108, tz: 5, d: 100, az: -38, el: -10, fov: 40, shift: 150 },
  // c: the macro in section: the mushroom in the bent layers, the ribs behind, low
  macro: { ...P, tx: -9.5, ty: 107, tz: 5, d: 24, az: 16, el: -4, fov: 34, shift: 0 },
  // d: wide and low behind his left shoulder: the policeman whole in the riot street, the hit a point of light on his belly
  wide: { ...P, tx: -140, ty: 120, tz: 20, d: 430, az: 78, el: -6, fov: 44, shift: 90 },
  /* ── act 1 ── */
  cut: { ...P, tx: -9, ty: 110, tz: 5, d: 150, az: 8, el: 4, fov: 36, shift: 130 }, //            « pas d'acier : du tissu » — the panel in section
  belly: { ...P, tx: -4, ty: 116, tz: 6, d: 170, az: 0, el: 8, fov: 36 }, //                     « ce choc dans ton ventre » — the wave on the ribs
  night: { ...P, tx: -60, ty: 125, tz: 10, d: 330, az: 82, el: 6, fov: 44, shift: 40 }, //       « La nuit, le bruit couvre tout » — 3/4 back, the street ahead
  shot: { ...P, tx: -900, ty: 130, tz: 0, d: 1150, az: 70, el: 4, fov: 44, shift: 60 }, //      « personne n'entend le tir » — up the street over his shoulder
  track: { ...P, tx: -800, ty: 106, tz: 5, d: 160, az: 36, el: 2, fov: 40 }, //                   « la balle fonce » — alongside the bullet (tx follows it: IMPACT x − dist)
  ahead: { ...P, tx: -60, ty: 108, tz: 5, d: 220, az: 0, el: 2, fov: 40 }, //                    « Devant elle… » — the bullet, the vest coming into the frame
  gilet: { ...P, tx: -18, ty: 110, tz: 3, d: 160, az: -14, el: 4, fov: 38 }, //                  « …ton gilet »
  tip: { ...P, ...CLOSE, tx: -13, ty: 106, tz: 5, d: 30, az: -28, el: 4, fov: 34 }, //           « Combien de couches vont tenir ? » — the tip 4 cm away
  /* ── act 2 (the bench: the same place, the street faded) ── */
  frozen: { ...P, tx: -13, ty: 108, tz: 8, d: 44, az: -36, el: 8, fov: 34 }, //                  « Alors… » — time stops
  benchIn: { ...P, tx: BX, ty: PANEL.y, tz: BZ, d: 130, az: -42, el: 14, fov: 30, shift: 60 }, //  « …on l'ouvre » — the panel on its halo
  exploded: { ...P, tx: BX + 9, ty: PANEL.y + 2, tz: BZ + 4, d: 260, az: -50, el: 16, fov: 30, shift: 60 }, // the housse, the 24 layers
  weave: { ...P, ...CLOSE, tx: BX - 29.9, ty: 112, tz: BZ + 4, d: 26, az: -62, el: 10, fov: 30 }, // « des fils croisés, serrés »
  fiber: { ...P, ...CLOSE, tx: BX - 31.9, ty: 141, tz: BZ + 9, d: 34, az: -66, el: 8, fov: 30, shift: 0 }, //    « …du Kevlar » — the heart yarn
  solo: { ...P, tx: BX - 29.9, ty: PANEL.y, tz: BZ, d: 125, az: -72, el: 12, fov: 30, shift: 40 }, // « Pourquoi ça tient ? » — one layer, 3/4
  test: { ...P, tx: TEST.at[0], ty: TEST.at[1] + 40, tz: TEST.at[2], d: 140, az: -88, el: 10, fov: 30, shift: 40 }, // « À poids égal… »
  rest: { ...P, tx: -12, ty: 118, tz: 10, d: 300, az: -100, el: 8, fov: 36, shift: 60 }, //      « Toute la nuit, il attend » — him, standing, the panel back in
  faceRue: { ...P, tx: -11, ty: 100, tz: 0, d: 120, az: -150, el: 6, fov: 34 }, //              « une face vers la rue »
  faceToi: { ...P, tx: -11, ty: 100, tz: 0, d: 110, az: -195, el: 6, fov: 34 }, //              « une face vers toi »
  touch: { ...P, ...CLOSE, tx: -12.5, ty: 106, tz: 5, d: 34, az: 30, el: 4, fov: 32 }, //        « Puis une pointe touche… » (cut), the section close
  /* ── act 3 ── */
  zero: { ...P, ...CLOSE, tx: -10.5, ty: 106.5, tz: 5, d: 30, az: 18, el: 4, fov: 32, shift: 0 }, //           « Les premiers fils cassent »
  cone: { ...P, tx: -8, ty: 110, tz: 5, d: 95, az: -10, el: 6, fov: 34 }, //                     « Le tissu se creuse en cône »
  mush: { ...P, ...CLOSE, tx: -8.5, ty: 106, tz: 5, d: 36, az: -28, el: 6, fov: 32 }, //         « …en champignon »
  planted: { ...P, tx: -9, ty: 110, tz: 5, d: 90, az: -34, el: 8, fov: 34 }, //                  « Elle reste plantée dans le gilet »
  home: { ...P, tx: 200, ty: 100, tz: 11, d: 560, az: -62, el: 10, fov: 40, shift: 130 }, //     « Toi, tu rentres te coucher »
  /* ── the end ── */
  verdict: { ...P, tx: -9, ty: 110, tz: 5, d: 120, az: 24, el: 6, fov: 36 }, //                  « pas un mur » — the panel on the torso, in section
  net: { ...P, tx: -9, ty: 110, tz: 5, d: 100, az: 8, el: 8, fov: 36 }, //                       « C'est un filet »
  clayView: { ...P, ...CLOSE, tx: CLAY.face, ty: IMPACT_BENCH[1], tz: IMPACT_BENCH[2], d: 70, az: -30, el: 8, fov: 32 }, // « 44 millimètres de creux »
  blade: { ...P, tx: BX - 8, ty: 108, tz: BZ + 5, d: 80, az: -44, el: 10, fov: 32 }, //          « …un couteau, vrai ou faux ? »
  like: { ...P, tx: BX, ty: 110, tz: BZ, d: 80, az: -52, el: 16, fov: 30, shift: 40 }, //    the panel closed on its halo, the mushroom in it
  teaser: { ...P, tx: TEASER.at[0] - 30, ty: TEASER.at[1] + 45, tz: TEASER.at[2] + 20, d: 260, az: -66, el: 14, fov: 34, shift: 0 },
  back: { ...POSE0, az: POSE0.az + 12, d: POSE0.d * 1.05 }, //                                   the loop's cut: POSE0 turned 12° the film's way
};

/** What a cut to the bench sets, whatever came before: the panel whole on its halo, nobody, no street, no bullet. */
export const BENCHED = {
  set: SET.BENCH, shell: 0, riot: 0, you: 0, xray: 0, wave: 0, walk: 0, clay: 0, dent: 0, gauge: 0, wall: 0, bounce: 0, blade: 0, teaser: 0,
  vest: 0, out: 1, section: 0, housse: 0, explode: 0, litHousse: 0, litSeams: 0, litWeave: 0, fiber: 0, solo: 0, spread: 0,
  test: 0, load: 0, faces: 0, bullet: 0, dist: 4, trail: 0, pierce: 0, breaks: 0, tense: 0, ring: 0, share: 0, cone: 0, mushroom: 0,
  mood: 0, gel: 0, pool: 0.25, grid: 0.16, ...LIGHT.bench,
};
/** What a cut to the scene sets: the street at night, him standing, the vest on, the panel in section, the bullet far up
 *  the street (15 m: T−37,5 ms). The act says where the bullet is and where the light stands. */
export const STAGED = {
  set: SET.SCENE, shell: 1, riot: 1, you: 1, xray: 1, wave: 0, walk: 0, clay: 0, dent: 0, gauge: 0, wall: 0, bounce: 0, blade: 0, teaser: 0,
  vest: 1, out: 0, section: 1, housse: 0, explode: 0, litHousse: 0, litSeams: 0, litWeave: 0, fiber: 0, solo: 0, spread: 0,
  test: 0, load: 0, faces: 0, bullet: 1, dist: 1500, trail: 1, pierce: 0, breaks: 0, tense: 0, ring: 0, share: 0, cone: 0, mushroom: 0,
  mood: 1, gel: 0, pool: 0, grid: 0, ...LIGHT.street,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const rue = buildRue();
  const gilet = buildGilet();
  rue.A.carry.add(gilet.group); // carry is the identity at build time: gilet.js's world coordinates stay true
  const bench = makeBench(SIZE);
  bench.group.position.set(...BENCH.at); // at the panel's foot, 64 cm to his left: the bench is in place
  scene.add(rue.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    rue, gilet, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const eye = stage.camera.position;
      const b = onBench ? 1 : 0;
      rue.update({
        shell: S.shell, riot: S.riot, you: S.you, xray: S.xray, wave: S.wave, walk: S.walk, cone: S.cone, out: S.out,
        section: S.section, clay: S.clay, dent: S.dent, gauge: S.gauge, wall: S.wall, bounce: S.bounce, blade: S.blade,
        teaser: S.teaser, bench: b,
      }, time, px, eye);
      gilet.update({
        vest: S.vest, out: S.out, section: S.section, housse: S.housse, explode: S.explode, litHousse: S.litHousse,
        litSeams: S.litSeams, litWeave: S.litWeave, fiber: S.fiber, solo: S.solo, spread: S.spread, test: S.test,
        load: S.load, faces: S.faces, bullet: S.bullet, dist: S.dist, trail: S.trail, pierce: S.pierce, breaks: S.breaks,
        tense: S.tense, ring: S.ring, share: S.share, cone: S.cone, mushroom: S.mushroom, bench: b,
      }, time, px, eye);
      bench.group.visible = S.pool > 0.001 || S.grid > 0.001;
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.4);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : STREET.fog;
    },
  };
}

export { STREET, PANEL, IMPACT, BENCH, TEST, CLAY, TEASER, IMPACT_BENCH };
