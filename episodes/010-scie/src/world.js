// DOSSIER 010 — Scie sur table : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by shop.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SHOP: a cabinet saw seen like an X-ray, a board on its table, you pushing it — your left hand
// a finger's width from the blade. Under the table, solid: the blade, its arbor block, and the cartridge that
// waits beside the teeth. The BENCH: the blade and its cartridge alone on their pool of light. It is ONE blade
// and ONE cartridge: model.js moves them to the bench (`bench` 1), the cut from one to the other matches on them.
// Three colours: signal is the danger (the teeth on your finger, what an ordinary saw would do); veille is the
// system alive (the small signal the blade carries, the wire, the brake); ink is everything else.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { TABLE, BLADE, ARBOR, CARTRIDGE, BOARD, YOU, TOUCH, KIT } from "./plan.js";
import { buildShop } from "./shop.js";
import { buildSaw } from "./model.js";

export const SET = { BENCH: 0, SHOP: 1 };
/** ≈ the radius of the blade and its cartridge on the bench: sizes the bench, its light, its shadows. */
export const SIZE = 19;

// The first frame is the hook: your hand flat on the board, its fingertip a hair from the teeth of the spinning
// blade. (A starting point: the sets' builders refine it with `look`.)
export const POSE0 = { tx: -0.8, ty: 90.5, tz: 7, d: 98, az: -70, el: 20, fov: 36, shift: 348, side: 34, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.SHOP,
  /* ── the shop, the saw's cabinet and table, the board, you (shop.js) ── */
  shell: 1, //   the X-ray of the saw (cabinet, top, fence, motor) and of the shop round it: glass and fine lines (0–1)
  table: 1, //   the top alone: 1 as the rest · 0 gone — to look at what is under it
  you: 1, //     you, pushing the board (0 / 1)
  feed: 6, //    how far the board has been pushed past the front of the blade, in cm (the cut is that long)
  slip: 0.85, // your left hand: 0 flat on the board, well back from the blade → 1 its fingertip on the teeth (TOUCH)
  circuit: 0, // on contact: the blade's signal passing into your fingertip and running up your hand and arm — a thread of veille light inside the glass (0–1)
  harm: 0, //    an ORDINARY saw: what happens to that finger — a signal light that has a place (the fingertip, then the hand), never gore (0–1)
  flinch: 0, //  your hand pulled back from the blade, after (0–1)
  nick: 0, //    the cut you are left with: a thin signal mark on the fingertip (0–1)
  dust: 1, //    the sawdust thrown by the cut: slow streaks, while the blade turns (0–1)
  /* ── the blade, its arbor block and the cartridge (model.js) ── */
  turn: 0, //    the blade's angle, in turns (its top runs toward +z) — what the picture shows once `blur` is down
  blur: 1, //    1: the blade at full speed — a disc of smeared teeth · 0: every tooth sharp, standing at `turn`
  signal: 0.6, // the small electrical signal the blade carries: a veille glow breathing on its body (0–1; it drops when your body takes it)
  lid: 1, //     the cartridge's housing: 1 a closed box · 0 gone — the block, the spring, the wire seen in place
  wire: 1, //    the fuse wire that holds the spring back: 1 whole → 0 burnt through
  flash: 0, //   the wire burning: a light that has a place (0–1.5)
  pawl: 0, //    the block of aluminium: 0 at rest, 2.5 mm from the teeth → 1 thrown into them by the spring
  bite: 0, //    the teeth digging into the aluminium: the block bitten and folded round the blade, chips and slow sparks (0–1)
  drop: 0, //    blade, arbor block and cartridge swinging down about ARBOR.pivot: 0 → 1 the blade entirely under the table
  explode: 0, // on the bench: 0 the cartridge closed beside the blade → 1 its parts apart, in a row across the camera (block · spring · wire · electronics)
  litBlock: 0, litSpring: 0, litWire: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a veille light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 86, fz: 6, fs: 60, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  // under the table (state: table 0.15), close on the cartridge beside the blade: act 2 cuts to the bench from it (benchCut, origin HOME)
  cartridge: { ...P, tx: CARTRIDGE.centre[0], ty: CARTRIDGE.centre[1] + 5, tz: CARTRIDGE.centre[2] + 7, d: 95, az: -58, el: 4, shift: 150 },
  // blade and cartridge on the bench: whole (the calls to action play over it), the cartridge opened into a row, each named part from close
  whole: { ...P, tx: 0, ty: 15.4, tz: -4.2, d: 158, az: -55, el: 10, shift: 160, side: 60 },
  exploded: { ...P, tx: -5, ty: 13.5, tz: 3, d: 140, az: -58, el: 8, shift: 58, side: 65 }, // light: fx −5, fy 12, fz 3, fs 19
  blockPart: { ...P, tx: -14.81, ty: 7.4, tz: -2.95, d: 62, az: -58, el: 8, shift: 150 }, // (fs 8 to 10 on the part)
  springPart: { ...P, tx: -11.1, ty: 7.4, tz: 2.99, d: 50, az: -58, el: 8, shift: 150 },
  wirePart: { ...P, tx: -7.92, ty: 7.4, tz: 8.08, d: 44, az: -58, el: 8, shift: 150 },
  // in the saw, the housing gone (lid 0, table 0.15) — the trigger in profile (the wire, the spring, the block: d ≤ 56) · the teeth in the block, from below · the dive, from the side
  fire: { ...P, tx: 0, ty: 72.1, tz: -13, d: 56, az: -84, el: 3, shift: 100, drift: 0 },
  bite: { ...P, tx: 0, ty: 72.6, tz: -8.2, d: 46, az: -38, el: -12, shift: 150, drift: 0 },
  dive: { ...P, tx: 0, ty: 79, tz: -6, d: 125, az: -88, el: 4, shift: 60, drift: 0 },
  // your fingertip on the teeth (slip 0.95 → 1) · you whole at the saw · the signal running up your arm (slip 1, circuit) · an ordinary saw (harm) · after (drop 1, blur 0, flinch 1, nick 1)
  finger: { ...P, tx: -0.8, ty: 90.6, tz: 10.5, d: 26, az: -80, el: 42, shift: 150 },
  you: { ...P, tx: -6, ty: 92, tz: 30, d: 640, az: -74, el: 8, shift: 120 },
  circuit: { ...P, tx: -16, ty: 112, tz: 30, d: 170, az: -72, el: 12, shift: 150 },
  harm: { ...P, tx: -3.5, ty: 91, tz: 11, d: 66, az: -62, el: 24, fov: 40, shift: 150 },
  after: { ...P, tx: -15, ty: 100, tz: 18, d: 110, az: -62, el: 18, fov: 36, shift: 150, side: 40 },
  wide: POSE0,
};
/** Where the blade stands in the shop, counted from where it stands on the bench (benchCut's origin). */
export const HOME = [BLADE.x - KIT.blade[0], BLADE.y - KIT.blade[1], BLADE.z - KIT.blade[2]];
/** What a cut to the bench sets, whatever came before: the blade stopped, every tooth sharp, the cartridge whole. */
export const BENCHED = { turn: 0, blur: 0, signal: 0, lid: 1, wire: 1, flash: 0, pawl: 0, bite: 0, drop: 0, explode: 0, litBlock: 0, litSpring: 0, litWire: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: KIT.blade[0], fy: KIT.blade[1] - 4, fz: KIT.blade[2] - 6, fs: SIZE };
/** What a cut to the shop sets: the saw running, your fingertip on the teeth, time stopped at T+0. */
export const STAGED = {
  shell: 1, table: 1, you: 1, feed: 8, slip: 1, circuit: 0, harm: 0, flinch: 0, nick: 0, dust: 1,
  turn: 0, blur: 1, signal: 0.6, lid: 1, wire: 1, flash: 0, pawl: 0, bite: 0, drop: 0, explode: 0, litBlock: 0, litSpring: 0, litWire: 0, mood: 1, gel: 0, fx: 0, fy: 86, fz: 6, fs: 60,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const shop = buildShop();
  const saw = buildSaw();
  const set = new THREE.Group(); // the shop set
  set.add(shop.group, saw.group);
  const bench = makeBench(SIZE);
  bench.group.add(saw.benchGroup);
  scene.add(set, bench.group);
  stage.grade.gel.set(0x5cffb0);

  return {
    shop, saw, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      saw.update({ bench: onBench ? 1 : 0, turn: S.turn, blur: S.blur, signal: S.signal, lid: S.lid, wire: S.wire, flash: S.flash, pawl: S.pawl, bite: S.bite, drop: S.drop, explode: S.explode, litBlock: S.litBlock, litSpring: S.litSpring, litWire: S.litWire }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        shop.update({ shell: S.shell, table: S.table, you: S.you, feed: S.feed, slip: S.slip, circuit: S.circuit, harm: S.harm, flinch: S.flinch, nick: S.nick, dust: S.dust, drop: S.drop, blur: S.blur }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0004;
    },
  };
}

export { TABLE, BLADE, ARBOR, CARTRIDGE, BOARD, YOU, TOUCH, KIT };
