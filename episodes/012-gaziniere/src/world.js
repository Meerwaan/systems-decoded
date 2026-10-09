// DOSSIER 012 — Gazinière : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by hob.js, model.js, fire.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The KITCHEN: the kitchen of 009 seen like an X-ray, a gas hob let into its worktop, a saucepan
// boiling over on the front-left burner — and, solid in all that glass, the only things that matter: the
// burner, its knob, the tap under the top, the small magnet unit screwed into it, the thermocouple whose
// tip stands in the flame. The BENCH: that same assembly — the system — alone on its pool of light. It is
// ONE object, re-parented: the cut from one to the other matches on it, and its fire follows it.
// Three colours. signal is the GAS — burning (the flame: bright, a white heart) or not (a dull haze that
// drifts) — and what it heats. veille is what the flame pays for: the current the hot tip makes, the grip
// of the magnet. ink is everything else.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { buildKitchen } from "../../009-micro-ondes/src/kitchen.js";
import { SYSTEM, POT, BURNERS, YOU, DOOR, SWITCH, HOB } from "./plan.js";
import { buildHob } from "./hob.js";
import { buildSystem } from "./model.js";
import { buildFire } from "./fire.js";

export const SET = { BENCH: 0, KITCHEN: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = 13;

// The first frame is the hook: the saucepan boiling over, the foam running down onto a flame that is dying.
// (A starting point: the sets' builders refine it with `look`.)
export const POSE0 = { tx: 166, ty: 99.5, tz: 34, d: 90, az: -36, el: 8, fov: 40, shift: 150, side: 0, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.KITCHEN,
  /* ── the kitchen, the hob, the saucepan, you (hob.js) ── */
  shell: 1, //   the X-ray of the kitchen and of the hob's body: glass and fine lines (0–1)
  pot: 1, //     the saucepan stands on the hero burner (0 / 1)
  boil: 1, //    the water boils: its surface heaves, steam rises (0–1)
  spill: 0.55, // the boil-over: 0 nothing · 0.3 the foam swells above the rim · 0.6 it runs down the side · 1 it pours onto the burner
  you: 0, //     0 nobody · 1 you at the hob, your right hand on the hero knob (it goes down with `press`) · 2 you in the doorway, your hand on the light switch
  /* ── the system (model.js) ── */
  safety: 1, //  1 the hob HAS its safety · 0 the hob WITHOUT: the tip, its lead and the magnet unit are gone, the gas runs through a bare tap
  press: 0, //   the knob pushed down by your hand (0–1): it opens the valve by hand and sets the armature against the magnet
  valve: 1, //   the safety valve inside the magnet unit: 1 open → 0 shut by its spring (the snap is the film's climax)
  heat: 1, //    the thermocouple's tip: 0 cold → 1 red-hot in the flame (a signal glow that has a place: the tip)
  volts: 1, //   the current the hot tip makes, running down the lead to the magnet (veille; a head of light that travels when it changes), 0–1
  hold: 1, //    the magnet's grip on the armature (veille), 0–1
  xray: 0, //    the tap's body and the magnet's can turn to glass: the seal, the spring, the armature, the magnet show (0–1)
  explode: 0, // on the bench: 0 the assembly whole → 1 its parts apart, in a row across the camera
  litTap: 0, litSpring: 0, litMagnet: 0, litTip: 0, // the part the voice is naming glows faintly veille
  /* ── the fire (fire.js) ── */
  flame: 0.9, // the crown of flame: 1 full → 0 out. In between it dies port after port, from the side the foam falls on
  gas: 0, //     unburnt gas leaving the burner: a dull signal haze that drifts and rises (0–1)
  fill: 0, //    the "what if": the gas gathering under the ceiling, then down into the room (0–1)
  spark: 0, //   the spark of the light switch — a light that has a place (0–1.5)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 166, fy: 97, fz: 36, fs: 46, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = SYSTEM.home;
export const VIEW = {
  hook: POSE0,
  // in the kitchen — the burner under the saucepan, low: the ring of flame, then the haze · the tip beside the crown
  burner: { ...P, tx: HX, ty: HY + 2.6, tz: HZ + 1, d: 62, az: -34, el: 7, shift: 150 },
  tip: { ...P, tx: HX - 2.9, ty: HY + 2, tz: HZ + 4.9, d: 20, az: -42, el: 8, shift: 150 },
  // under the top, through the glass: the tap, the magnet unit, the lead going to the burner
  under: { ...P, tx: HX - 3, ty: HY - 3.6, tz: HZ + 12, d: 44, az: -62, el: -4, shift: 150 },
  // the heart under the top, in profile (xray 1): the frame of the snap
  heart: { ...P, tx: HX - 3, ty: HY - 3.9, tz: HZ + 13.4, d: 24, az: -78, el: 8, shift: 160 },
  // the whole system in the kitchen, the kitchen gone dark around it: act 2 cuts to the bench from it
  system: { ...P, tx: HX - 1.5, ty: HY - 1, tz: HZ + 8, d: 84, az: -40, el: 22, shift: 150 },
  // on the bench: whole (the calls to action play over it), its parts apart, and each named part from close
  whole: { ...P, tx: 0, ty: 5, tz: 0, d: 94, az: -40, el: 22, shift: 200, side: 60 },
  exploded: { ...P, tx: 0, ty: 5.5, tz: 0, d: 128, az: -44, el: 24, shift: 285, side: 30 },
  // the row, part by part (the voice names them from right to left: a travelling) — the tap and its knob · the spring, the armature and the magnet in ONE frame · the pin and the burner
  rowTap: { ...P, tx: 8.2, ty: 7, tz: 7.9, d: 58, az: -44, el: 20, shift: 170 },
  rowHeart: { ...P, tx: 4.6, ty: 3.6, tz: 4.45, d: 40, az: -44, el: 18, shift: 170 },
  rowTip: { ...P, tx: -7.4, ty: 7.6, tz: -3.2, d: 64, az: -44, el: 20, shift: 170 },
  tapPart: { ...P, tx: -1.5, ty: 4, tz: 8, d: 36, az: -50, el: 16, shift: 160 },
  // the assembly whole, xray 1 — the heart in profile: the spring AND the magnet in one frame · the knob, its spindle and the heart · the whole chain: tip, lead, magnet
  magnetPart: { ...P, tx: -1.5, ty: 3.5, tz: 4.9, d: 24, az: -78, el: 8, shift: 160 },
  pressPart: { ...P, tx: -1.5, ty: 4.4, tz: 6.3, d: 30, az: -82, el: 6, shift: 160 },
  chain: { ...P, tx: -1.5, ty: 5.8, tz: 2.2, d: 60, az: -68, el: 10, shift: 170 },
  tipPart: { ...P, tx: -1.4, ty: 9.6, tz: -3.1, d: 24, az: -42, el: 10, shift: 160 },
  // the kitchen — you at the hob, your hand on the knob · the whole room, the door on the right · you at the switch
  knob: { ...P, tx: 166, ty: 112, tz: 58, d: 190, az: -60, el: 10, fov: 30, shift: 0 },
  knobWide: { ...P, tx: 166, ty: 122, tz: 62, d: 300, az: -56, el: 8, fov: 30, shift: -130 },
  room: { ...P, tx: 215, ty: 125, tz: 127, d: 800, az: -48, el: 6, fov: 44, shift: 120 },
  roomLow: { ...P, tx: 205, ty: 150, tz: 80, d: 560, az: -52, el: -3, fov: 44, shift: 120 }, // from below: the layer under the ceiling
  door: { ...P, tx: 284, ty: 118, tz: 172, d: 330, az: -68, el: 4, fov: 34, shift: -60 },
  // under the top, wider: the rail and the four taps (three of glass, the hero's solid)
  taps: { ...P, tx: 172, ty: 87.6, tz: 49, d: 60, az: -38, el: -3, shift: 150 },
  kitchen: { ...P, tx: 176, ty: 112, tz: 40, d: 430, az: -36, el: 9, fov: 36, shift: 150 },
};
/** What a cut to the bench sets, whatever came before: the system whole, cold and shut. */
export const BENCHED = {
  safety: 1, explode: 0, xray: 0, press: 0, valve: 0, heat: 0, volts: 0, hold: 0, litTap: 0, litSpring: 0, litMagnet: 0, litTip: 0,
  flame: 0, gas: 0, fill: 0, spark: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 6, fz: 0, fs: SIZE,
};
/** What a cut to the kitchen sets: the flame is out, the gas is coming, nothing has shut yet — and the tip has been cooling for a while (the story runs in real time). */
export const STAGED = {
  shell: 1, pot: 1, boil: 0.3, spill: 1, you: 0, safety: 1, press: 0, valve: 1, heat: 0.6, volts: 0.66, hold: 1, xray: 0, explode: 0,
  litTap: 0, litSpring: 0, litMagnet: 0, litTip: 0, flame: 0, gas: 1, fill: 0, spark: 0,
  mood: 1, gel: 0, fx: 166, fy: 97, fz: 36, fs: 46,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const kitchen = buildKitchen({ hob: false, floorAt: [176, 105] });
  const hob = buildHob();
  const system = buildSystem();
  const fire = buildFire();
  const set = new THREE.Group(); // the kitchen set
  const mount = new THREE.Group(); // where the system stands in the hob
  mount.position.set(...SYSTEM.home);
  set.add(kitchen.group, hob.group, mount, fire.room);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench
  benchMount.position.set(...SYSTEM.bench);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    kitchen, hob, system, fire, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root, fire.crown);
      const b = onBench ? 1 : 0;
      system.update({ bench: b, shell: S.shell, safety: S.safety, explode: S.explode, press: S.press, valve: S.valve, heat: S.heat, volts: S.volts, hold: S.hold, xray: S.xray, litTap: S.litTap, litSpring: S.litSpring, litMagnet: S.litMagnet, litTip: S.litTip }, time, px);
      fire.update({ bench: b, flame: S.flame, gas: S.gas, pot: onBench ? 0 : S.pot, spill: S.spill, fill: S.fill, spark: S.spark, explode: S.explode }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        kitchen.update({ shell: S.shell, you: 0 }, time, px);
        hob.update({ shell: S.shell, pot: S.pot, boil: S.boil, spill: S.spill, you: S.you, press: S.press, flame: S.flame }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0003;
    },
  };
}

export { SYSTEM, POT, BURNERS, YOU, DOOR, SWITCH, HOB };
