// DOSSIER 018 — Cocotte-minute : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js and cuisine.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The KITCHEN: the kitchen of 009 seen like an X-ray, the gas hob of 012, you at the hob — and, solid in
// all that glass, the pressure cooker on its ring of flame. The BENCH: that same cooker — the system — alone on its
// pool of light, opened. It is ONE object, re-parented: the cut from one to the other matches on it.
// Three colours. signal is the PRESSURE: the steam held prisoner under the lid, its push, the foam that blocks a
// hole — and the fire that makes it. veille is whatever LETS IT OUT: the valve that whistles, the safety valve that
// opens, the seal that leaks on purpose, the pin that keeps your hand off the lid. ink is everything else.
// Nothing ever bursts in this film: the fall says a cooker does not explode. No flash, no debris, no lid flying.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { HOME, KNOB, YOU, HOOD, POT, LID, SEAL, WINDOW, HANDLE, VALVE, SAFETY, PIN, STOP, INSIDE, HALF, APART, SYSTEM, PUSH, polar } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildCuisine } from "./cuisine.js";

export const SET = { BENCH: 0, KITCHEN: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

const [HX, HY, HZ] = HOME;
// The first frame is the hook: the cooker on its ring of flame, low and close, its valve whistling a tall jet of
// steam — and your arm of glass coming in from the right, your fingers on the knob. Filmed from az −64: from az −36
// your hand stands in front of the cooker. (A starting point, tried on a sheet: act 1 refines it and hands it back.)
export const POSE0 = { tx: HX, ty: HY + 14.3, tz: HZ, d: 104, az: -64, el: 2, fov: 40, shift: 130, side: 70, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.KITCHEN,
  /* ── the kitchen (cuisine.js) ── */
  shell: 1, //   the X-ray of the kitchen and of the hob: glass and fine lines (0–1)
  you: 1, //     0 nobody · 1 you at the hob, the fingers of your left hand on the burner's knob
  press: 0, //   your fingers push that knob down (0–1): « coupe le feu »
  flame: 1, //   the crown of flame under the cooker: 1 full → 0 out
  /* ── the system (model.js) ── */
  bar: 1, //     THE PRESSURE under the lid — the header reads it: 0 none (cold, the lid is free) · 1 cooking pressure (the valve regulates) · up to 2 with nothing letting it out. The locking pin follows it by itself: up as soon as there is any left
  seen: 1, //    how much of that pressure is DRAWN, signal: the steam held under the lid, its push against it (0–1) — the pressure is there even at 0
  xray: 1, //    the vessel and the lid turn to glass where they stand (0–1): the water, the lentils, the foam, the steam show
  fill: 0.8, //  what is in the vessel, water and lentils: 0 empty · 0.5 the half never to pass with what foams · 0.8 tonight: too full · 1 to the brim
  mark: 0, //    the half-way line drawn round the vessel, veille (0–1)
  boil: 1, //    the water boils: its surface heaves, the lentils tumble (0–1)
  foam: 0, //    the foam on the water: 0 none · 0.5 half-way up to the lid · 1 against the lid, at the mouth of the chimney
  clog: 0, //    the working valve's hole blocked by foam: 0 clear · 1 blocked — nothing whistles any more, whatever `whistle` says
  clog2: 0, //   the safety valve blocked too: 0 clear · 1 blocked — its steam stops, whatever `safety` says
  whistle: 1, // the working valve at work: the steam lifts its weight, the weight dances, a jet leaves it (0–1) — the second readout of the header
  off: 0, //     the weight taken off its chimney by hand: 0 standing on its hole · 1 held above it, the hole in view
  safety: 0, //  the safety valve: 0 shut · 1 open, its steam out
  leak: 0, //    the seal at the window of the lid: 0 in place · 0.5 it bulges out through the window · 1 it has given way there and the steam leaks sideways
  plume: 1, //   how much of the steam LET OUT is drawn, veille: 1 the whole plume, gone before the hood and the header · 0.3 only its root, for a close shot (0–1)
  twist: 0, //   the lid's handle pushed toward « open »: 0 at rest · 1 pushed home — with pressure left the lid turns a hair and stops dead on the pin; with none it turns free
  explode: 0, // on the bench: 0 assembled → 1 the lid has turned and everything has lifted off, in one column
  litBody: 0, litLid: 0, litSeal: 0, litValve: 0, litSafety: 0, litPin: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: HX, fy: HY + 11, fz: HZ, fs: 40, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [SX, SY, SZ] = SAFETY.at;
const [PX, PY, PZ] = PIN.at;
const [WX, , WZ] = polar(WINDOW.at, LID.r);
const TOP = VALVE.at[1] + VALVE.chimney.h; // the mouth of the chimney
export const VIEW = {
  hook: POSE0,
  /* ── in the kitchen ── */
  // the working valve and its jet, from close · the lid from above, three quarters: the two valves, the pin
  valve: { ...P, tx: HX, ty: HY + TOP + 2, tz: HZ, d: 48, az: -34, el: 10, shift: 150 },
  lidTop: { ...P, tx: HX - 1, ty: HY + LID.top, tz: HZ + 2, d: 76, az: -45, el: 30, shift: 150 },
  // through the glass (xray 1): the water, the steam held under the lid · the whole vessel: the level, the half mark
  inside: { ...P, tx: HX, ty: HY + 12, tz: HZ, d: 62, az: -40, el: 4, shift: 150 },
  level: { ...P, tx: HX, ty: HY + 9, tz: HZ, d: 104, az: -50, el: 6, shift: 150 },
  // under the lid, looking up: the foam reaching the mouth of the chimney
  foam: { ...P, tx: HX, ty: HY + INSIDE.top + 1, tz: HZ, d: 42, az: -38, el: -5, shift: 150 },
  // the lid's edge: its lugs under the vessel's (« tient toujours »)
  lugs: { ...P, tx: HX - 6, ty: HY + SEAL.y, tz: HZ + 8, d: 46, az: -45, el: 6, shift: 150 },
  // the safety valve · the window of the lid, three quarters · the same in profile: the seal bulging out
  safety: { ...P, tx: HX + SX, ty: HY + SY + 1, tz: HZ + SZ, d: 36, az: -50, el: 14, shift: 150 },
  window: { ...P, tx: HX + WX, ty: HY + SEAL.y, tz: HZ + WZ, d: 46, az: -70, el: 8, shift: 150 },
  windowSide: { ...P, tx: HX + WX, ty: HY + SEAL.y, tz: HZ + WZ, d: 46, az: -22, el: 6, shift: 150 },
  // you at the hob, your hand on the knob · you standing at the cooker, whole (tried: you fill the right edge) · the kitchen
  // (with `you` 1, film from az −58 … −72: nearer to −40 your hand and forearm stand IN FRONT of the cooker — or set `you` 0)
  knob: { ...P, tx: 166, ty: 112, tz: 58, d: 190, az: -60, el: 10, fov: 30, shift: 0 },
  youAt: { ...P, tx: 170, ty: 116, tz: 44, d: 260, az: -66, el: 8, fov: 36, shift: 120 },
  kitchen: { ...P, tx: 176, ty: 112, tz: 40, d: 430, az: -36, el: 9, fov: 36, shift: 150 },
  // the cooker alone, the kitchen gone dark around it: act 2 cuts to the bench from it (benchCut, origin HOME)
  system: { ...P, tx: HX, ty: HY + 10.5, tz: HZ, d: 165, az: -40, el: 14, shift: 160 },
  /* ── on the bench (the cooker's base on the origin) ── */
  whole: { ...P, tx: 0, ty: 10.5, tz: 0, d: 165, az: -40, el: 14, shift: 160 },
  // the column (explode 1): the vessel, the seal, the lid, and above it the pin, the safety valve, the weight
  exploded: { ...P, tx: 0, ty: 19, tz: 0, d: 215, az: -40, el: 12, shift: 170 },
  // the working valve in profile (xray 1): the weight, the chimney, the hole · opened (xray 1): what is inside
  valvePart: { ...P, tx: 0, ty: TOP + 0.6, tz: 0, d: 40, az: -34, el: 8, shift: 160 },
  open: { ...P, tx: 0, ty: 11, tz: 0, d: 124, az: -40, el: 8, shift: 160 },
  // the pin and its stop, seen along the lid's edge: the pin rises into the tongue · the lid from above
  pinPart: { ...P, tx: PX, ty: PY + 1, tz: PZ, d: 32, az: -70, el: 6, shift: 160 },
  lidPart: { ...P, tx: 0, ty: LID.top, tz: 2, d: 84, az: -40, el: 32, shift: 160 },
  // the window and the seal, in profile · three quarters
  sealPart: { ...P, tx: WX, ty: SEAL.y, tz: WZ, d: 42, az: -22, el: 6, shift: 160 },
  windowPart: { ...P, tx: WX, ty: SEAL.y, tz: WZ, d: 42, az: -72, el: 8, shift: 160 },
};
/** What a cut to the bench sets, whatever came before: the cooker whole, cold, empty, silent — its lid free. */
export const BENCHED = {
  shell: 0, you: 0, press: 0, flame: 0,
  bar: 0, seen: 0, xray: 0, fill: 0, mark: 0, boil: 0, foam: 0, clog: 0, clog2: 0, whistle: 0, off: 0, safety: 0, leak: 0, plume: 1, twist: 0, explode: 0,
  litBody: 0, litLid: 0, litSeal: 0, litValve: 0, litSafety: 0, litPin: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 10, fz: 0, fs: SIZE,
};
/** What a cut to the kitchen sets: tonight — the cooker on its fire, too full, whistling; you at the hob. */
export const STAGED = {
  shell: 1, you: 1, press: 0, flame: 1,
  bar: 1, seen: 0, xray: 0, fill: 0.8, mark: 0, boil: 1, foam: 0, clog: 0, clog2: 0, whistle: 1, off: 0, safety: 0, leak: 0, plume: 1, twist: 0, explode: 0,
  litBody: 0, litLid: 0, litSeal: 0, litValve: 0, litSafety: 0, litPin: 0,
  mood: 1, gel: 0, fx: HX, fy: HY + 11, fz: HZ, fs: 40,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const cuisine = buildCuisine();
  const system = buildSystem();
  const set = new THREE.Group(); // the kitchen
  const mount = new THREE.Group(); // where the cooker stands in it: on the burner
  mount.position.set(...HOME);
  set.add(cuisine.group, mount);
  const bench = makeBench(SIZE);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);
  const SYS = {}; // (filled every frame: no allocation in apply)

  return {
    cuisine, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? bench.group : mount;
      if (system.root.parent !== home) home.add(system.root);
      SYS.bench = onBench ? 1 : 0;
      SYS.bar = S.bar; SYS.seen = S.seen; SYS.xray = S.xray; SYS.fill = S.fill; SYS.mark = S.mark; SYS.boil = S.boil; SYS.foam = S.foam;
      SYS.clog = S.clog; SYS.clog2 = S.clog2; SYS.whistle = S.whistle; SYS.off = S.off; SYS.safety = S.safety; SYS.leak = S.leak;
      SYS.plume = S.plume; SYS.twist = S.twist; SYS.explode = S.explode;
      SYS.litBody = S.litBody; SYS.litLid = S.litLid; SYS.litSeal = S.litSeal; SYS.litValve = S.litValve; SYS.litSafety = S.litSafety; SYS.litPin = S.litPin;
      system.update(SYS, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        cuisine.update({ shell: S.shell, you: S.you, press: S.press, flame: S.flame }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.pose?.d ?? stage.cam.d) : 0.0003;
    },
  };
}

export { HOME, KNOB, YOU, HOOD, POT, LID, SEAL, WINDOW, HANDLE, VALVE, SAFETY, PIN, STOP, INSIDE, HALF, APART, SYSTEM, PUSH, polar };
