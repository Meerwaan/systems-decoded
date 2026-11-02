// DOSSIER 032 — Barre anti-panique : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by salle.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Three sets. The SALLE (salle.js): a public hall seen like an X-ray, its emergency door and the crowd that pushes,
// you crushed against the door, your hip on the bar — and, at the SAME place (`era` 1), the same door in 1883 at the
// foot of Sunderland's stairs, opening inward, held ajar by a bolt. The BENCH: the system (model.js) alone on its pool
// of light, with a section of its leaf — ONE object, re-parented: the cut from the door to the bench matches on it, in
// place (benchCut, origin BENCHAT). The AVION (avion.js): L03's cabin, imported, for the next file's announcement.
// Three colours. signal is the threat: the crowd's load (the arrows on the leaf), the bolt jammed in its strike, the
// ghost door that would open toward you, 1883's bolt. veille is the system alive: the bar and the parts the voice
// names, the bolt that comes out, the way out (the arc toward the exit, the exit sign). ink is the rest.
//
// THE STORY (docs/faits/032-barre-anti-panique.md; today's scene is a scenario, `sources` says so): a crowd in a hall
// pushes toward the emergency door; you are pressed against it, chest on the leaf, arms caught, your hip on the bar.
// The bar is a lever: pushed anywhere, it draws the bolt out of the strike — even under the crowd's load (the norm's
// test: a simulated crowd on the door, the bar must still release; no figure on screen) — and the door swings OUT.
// 1883: Victoria Hall, Sunderland — at the foot of a staircase, a door opening INWARD, bolted to let one child through
// at a time; 183 children die (crushed: no fire, no child identifiable, nobody shown hurt).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { DOOR, BAR, BOX, PENE, GACHE, SYSTEM, BENCHAT, YOU, STAIR, PLANE } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildSalle } from "./salle.js";
import { buildAvion } from "./avion.js";

export const SET = { BENCH: 0, SALLE: 1, AVION: 2 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The two eras of the SALLE (`era`, switched on a cut with `now`). */
export const ERA = { TODAY: 0, Y1883: 1 };

const [CX, CY, CZ] = SYSTEM.centre;
/** A point of the scene, where it stands on the bench (the bench's origin is BENCHAT). */
export const onBench = ([x, y, z]) => [x - BENCHAT[0], y - BENCHAT[1], z - BENCHAT[2]];
const [BX, BY, BZ] = onBench(SYSTEM.centre);

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off:
 *  { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the part in focus, the rest melts
 *  `air`    off (no contre-jour in this film worth it; to try on the open door's light only, planche avant/après)
 *  `finish` the surface of the solid parts (the bar, the box, the bolt, the strike): grain and handling marks */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « La foule t'écrase contre une porte fermée. » PROVISIONAL (candidate a, set on the
// BOUCHONS): low in the hall on the latch side, the door on the left, the crowd surging from the right, you pressed
// against the leaf, the bar solid under your hip. The planche of four candidates (docs/032-actes.md) chooses it; it
// is pasted here before the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: -5, ty: 115, tz: 30, d: 380, az: -152, el: -8, fov: 40, shift: 110, side: 0, roll: 0, drift: 0.3, dof: 0 };

export const FIRST = {
  set: SET.SALLE,
  /* ── the place (salle.js) ── */
  era: ERA.TODAY, // 0 today · 1 Sunderland, 1883 (the same door, the stairs, the bolt). Integer: switched on a cut (`now`)
  shell: 1, //   the X-ray of the place: walls, ceiling lines, the frame, the leaf's glass, the grid floor (0–1)
  crowd: 1, //   the crowd of glass (0–1): today in the hall behind you · 1883 on the stairs, children's size
  press: 0.8, // how hard it pushes (0 standing loose → 1 packed, leaning on the door): its surge is alive from frame 1,
  //             the leaf trembles in its frame
  flow: 0, //    the crowd pours out through the open door into the light (0 → 1 the hall emptied, the front rows outside)
  you: 1, //     you, against the door (0–1): chest on the leaf, arms caught, hip on the bar (it follows `push`)
  swing: 0, //   the leaf: 0 shut → 1 open 95° — today OUTWARD (−z), in 1883 INWARD (+z, toward the stairs)
  arcIn: 0, //   a ghost of the leaf swings toward the hall (+z), drawing its arc on the floor — signal: « vers toi »
  arcOut: 0, //  the same toward the exit (−z) — veille: « vers la sortie »
  sign: 1, //    the exit pictogram above the door, lit veille (0–1); none in 1883
  outside: 0, // the light beyond the open door, a cold pool on the ground outside (0–1)
  bolt: 0, //    1883: the bolt (solid, signal) shot into the floor at the leaf's free edge, the door held ajar (0 → 1)
  slip: 0, //    1883: one child of glass slips through the gap (0 → 1), the others held
  /* ── the system (model.js) ── */
  slab: 0, //    on the bench: the section of the leaf and of the jamb, in glass, the bar on it (0–1)
  explode: 0, // 0 assembled → 1 apart, in a ROW across the camera (the bar off its arms, the box's cover, the bolt, the
  //             spring, the strike), under the header's line
  push: 0, //    the bar pushed in: 0 at rest (out) → 1 its full stroke — the arms pivot, the spring squeezes
  pene: 0, //    the bolt: 0 thrown, in the strike → 1 drawn back into the box (the door is free)
  see: 0, //     the box's cover turns to glass: the spring, the cam, the bolt's tail seen inside (0–1)
  load: 0, //    the crowd's load on the leaf: signal arrows on its room face, toward the exit (0–1)
  jam: 0, //     the bolt squeezed against the strike by the load: their contact signal (0–1)
  ghost: 0, //   the system drawn as a faint ink outline instead of solid (1883: « Sans barre » — where it is not) (0–1)
  hand: 0, //    the fall: a ghost hand of glass on the bar (0–1) …
  tapAt: 0, //   …at `tapAt` along it: −1 the box's end → 1 the hinge end
  litBar: 0, litPivot: 0, litBox: 0, litPene: 0, litGache: 0, litSpring: 0, // the part the voice names glows veille (0–1)
  /* ── the plane (avion.js) ── */
  tug: 0, //     the hand on door 1L's lever strains (0–1): nothing moves
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 110, fz: 60, fs: 500, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL: set on BOUCHONS;
 *  the builders give better ones in their journals (docs/journal/032-model.md, 032-salle.md). */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 30, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the hall, today ── */
  // (b) outside, low, through the leaf of glass: you pressed on it, the bar solid behind the glass, the crowd behind you
  outside: { ...P, tx: -5, ty: 115, tz: 30, d: 380, az: -152, el: -8, fov: 40, shift: 110 },
  // (c) high behind the crowd: the funnel of bodies to one small door — the scale of the scene
  crowd: { ...P, tx: 0, ty: 60, tz: 160, d: 1250, az: -28, el: 30, fov: 40, shift: -60 },
  // (d) under the bar, at the box's end: the hip on it overhead, the box and the bolt in front, the legs behind
  under: { ...P, tx: -30, ty: 92, tz: 14, d: 95, az: -58, el: -24, fov: 48, shift: 60 },
  // three quarters on the bar in the door, the crowd behind (« même avec la foule appuyée dessus »)
  bar: { ...P, tx: -4, ty: 100, tz: 14, d: 230, az: -40, el: 6, fov: 34, shift: 120 },
  // the door wide from the hall, its ghost arcs on the floor (« vers toi » · « vers la sortie »)
  door: { ...P, tx: 0, ty: 60, tz: 90, d: 560, az: -30, el: 30, fov: 36, shift: 120 },
  // along you: your chest on the leaf, your arms caught
  chest: { ...P, ...CLOSE, tx: 4, ty: 132, tz: 22, d: 230, az: -76, el: 3, shift: 100 },
  // your hip on the bar, the bar in full frame (act 1 ends there, and act 2 cuts to the bench from `system`)
  hip: { ...P, ...CLOSE, tx: -6, ty: 96, tz: 14, d: 120, az: -50, el: 6, shift: 120 },
  // the system in the door, everything else dim: act 2 cuts to the bench from it (benchCut, origin BENCHAT)
  system: { ...P, tx: CX, ty: CY, tz: CZ, d: 400, az: -36, el: 14, shift: 120 },
  // the box and the strike in the door, close (act 2's way back to the hall at the threshold; act 3's « malgré la foule »)
  latch: { ...P, ...CLOSE, tx: -48, ty: 96, tz: 6, d: 70, az: 25, el: 16, shift: 110 },
  // outside, the door wide open, the crowd pouring into the light (« et la salle respire »)
  outflow: { ...P, tx: 0, ty: 90, tz: -40, d: 620, az: -150, el: 14, fov: 38, shift: 120 },
  /* ── 1883 (era 1) ── */
  // from the top of the stairs, looking down at the door at their foot: the children packed on the steps
  stairTop: { ...P, tx: 0, ty: 70, tz: 120, d: 640, az: 8, el: 34, fov: 40, shift: 120 },
  // the door from the landing, three quarters: the leaf ajar inward, the gap, the bolt
  stairDoor: { ...P, tx: -32, ty: 45, tz: 28, d: 300, az: -35, el: 40, fov: 36, shift: 80 },
  // the bolt at the floor, close
  bolt: { ...P, ...CLOSE, tx: -42, ty: 18, tz: 40, d: 140, az: -40, el: 22, shift: 70 },
  // from above, the door and its arc toward the stairs (the comment: « elle s'ouvrait vers l'intérieur »)
  above1883: { ...P, tx: 0, ty: 0, tz: 70, d: 520, az: -20, el: 62, fov: 36, shift: 100 },
  /* ── on the bench (the bench's origin = BENCHAT in the scene) ── */
  whole: { ...P, tx: BX, ty: BY, tz: BZ, d: 300, az: -48, el: 18, shift: 130 },
  // the exploded view, seen three quarters ALONG the bar (a long thin system: in a portrait frame it recedes in depth)
  exploded: { ...P, tx: BX - 34, ty: BY + 8, tz: BZ + 10, d: 210, az: -55, el: 24, shift: 60 },
  // along the bar, its arm and pivot (the lever)
  barBench: { ...P, ...CLOSE, tx: BX + 46, ty: BY + 2, tz: BZ + 2, d: 75, az: 62, el: 10, shift: 110 },
  // the box, its cover off or of glass: the spring, the bolt's tail
  boxBench: { ...P, ...CLOSE, tx: BX - 36, ty: BY + 1, tz: BZ, d: 60, az: -30, el: 18, shift: 100 },
  // the bolt in the strike: « se coince »
  jamBench: { ...P, ...CLOSE, tx: BX - 46, ty: BY, tz: BZ, d: 50, az: 25, el: 18, shift: 100 },
  /* ── the plane (avion.js; L03's cabin frame) ── */
  // door 1L from inside, from the side: the crew's hand on its lever, the door's porthole (L03's cabin, tug 1)
  plane: { ...P, ...CLOSE, tx: PLANE.door[0], ty: 110, tz: 270, d: 320, az: 110, el: 6, shift: 90 }, // seen on bouchon: the lever, the hand on it, the porthole
};
function xyz([x, y, z]) {
  return { tx: x, ty: y, tz: z };
}

/** What a cut to the bench sets, whatever came before: the system whole, at rest, its slab, nobody. */
export const BENCHED = {
  shell: 0, crowd: 0, you: 0, press: 0, flow: 0, swing: 0, arcIn: 0, arcOut: 0, outside: 0, bolt: 0, slip: 0,
  slab: 1, explode: 0, push: 0, pene: 0, see: 0, load: 0, jam: 0, ghost: 0, hand: 0, tapAt: 0,
  litBar: 0, litPivot: 0, litBox: 0, litPene: 0, litGache: 0, litSpring: 0, tug: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: BX, fy: BY, fz: BZ, fs: SIZE,
};
/** What a cut to the hall of today sets: the crowd pushing, the door shut, the system at rest, you against it. */
export const STAGED = {
  era: ERA.TODAY, shell: 1, crowd: 1, press: 0.8, flow: 0, you: 1, swing: 0, arcIn: 0, arcOut: 0, sign: 1, outside: 0,
  bolt: 0, slip: 0, slab: 0, explode: 0, push: 0, pene: 0, see: 0, load: 0, jam: 0, ghost: 0, hand: 0, tapAt: 0,
  litBar: 0, litPivot: 0, litBox: 0, litPene: 0, litGache: 0, litSpring: 0, tug: 0,
  mood: 1, gel: 0, fx: 0, fy: 110, fz: 60, fs: 500,
};
/** What a cut to 1883 sets: the stairs, the children packed on them, the door ajar inward and bolted, no bar. */
export const PAST = {
  ...STAGED, era: ERA.Y1883, you: 0, sign: 0, press: 1, bolt: 1, fx: 0, fy: 80, fz: 160, fs: 600,
};
/** What a cut to the plane sets (the next file): nothing of this film's subject. */
export const FLIGHT = { ...BENCHED, slab: 0, mood: 0, tug: 0, fx: PLANE.door[0], fy: PLANE.door[1], fz: PLANE.door[2], fs: 300 };

export function buildWorld(stage) {
  const { scene } = stage;
  const salle = buildSalle();
  const system = buildSystem();
  const avion = buildAvion();
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // the system on the bench: a scene point P stands at P − BENCHAT
  benchMount.position.set(-BENCHAT[0], -BENCHAT[1], -BENCHAT[2]);
  bench.group.add(benchMount);
  scene.add(salle.group, bench.group, avion.group);
  stage.grade.gel.set(0xff5b2e);

  const home = (obj, parent) => {
    if (obj.parent !== parent) parent.add(obj);
  };

  return {
    salle, system, avion, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const set = S.set;
      const inBench = set === SET.BENCH;
      const era = S.era > 0.5 ? ERA.Y1883 : ERA.TODAY;
      bench.group.visible = inBench;
      salle.group.visible = set === SET.SALLE;
      avion.group.visible = set === SET.AVION;
      home(system.root, inBench ? benchMount : salle.A.leaf);
      home(system.fixed, inBench ? benchMount : salle.A.frame);
      // in 1883 there is no bar: the system is only ever its ghost (« Sans barre »)
      const shown = inBench || (set === SET.SALLE && (era === ERA.TODAY || S.ghost > 0.01));
      system.root.visible = shown;
      system.fixed.visible = shown && (inBench || era === ERA.TODAY);
      if (shown) {
        system.update({
          bench: inBench ? 1 : 0, slab: S.slab, explode: inBench ? S.explode : 0, push: S.push, pene: S.pene, see: S.see,
          load: S.load, jam: S.jam, ghost: era === ERA.Y1883 && !inBench ? Math.max(0.001, S.ghost) : S.ghost,
          hand: S.hand, tapAt: S.tapAt, litBar: S.litBar, litPivot: S.litPivot, litBox: S.litBox, litPene: S.litPene,
          litGache: S.litGache, litSpring: S.litSpring,
        }, time, px);
      }
      if (set === SET.SALLE) {
        salle.update({
          era, shell: S.shell, crowd: S.crowd, press: S.press, flow: S.flow, you: S.you, push: S.push, swing: S.swing,
          arcIn: S.arcIn, arcOut: S.arcOut, sign: S.sign, outside: S.outside, bolt: S.bolt, slip: S.slip,
        }, time, px);
      }
      if (set === SET.AVION) avion.update({ tug: S.tug }, time, px);
      if (inBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, inBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = inBench ? bench.fog(d) : set === SET.AVION ? 0.0003 : 0.00035;
    },
  };
}

export { DOOR, BAR, BOX, PENE, GACHE, SYSTEM, BENCHAT, YOU, STAIR, PLANE };
