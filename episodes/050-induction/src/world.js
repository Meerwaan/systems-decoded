// DOSSIER 050 — Plaque à induction : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, casserole.js, cuisine.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The KITCHEN: 009's kitchen seen like an X-ray, and you of glass — and, solid in all that glass, the hob let
// into the worktop and the saucepan boiling on its front-right zone; your left hand flat on the front-left zone, ON and
// empty. The BENCH: the same hob and the same saucepan — the system — alone on its pool of light, opened, cut in half.
// It is ONE object (the hob + the pan on its zone), re-parented: the cut from one set to the other matches on it.
// Three colours. veille is the system ALIVE: the current along its path, the field that beats, the currents it makes turn
// in the base, the displays, the temperature point. signal is the HEAT, and only where it really is: in the base of the
// saucepan, and in the ring of glass the base warms by contact — never under your hand, never in the coil. ink: the rest.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makeBench, setMood } from "@kit/blocks.js";
import { HOME, BENCH_LIFT, ZONES, PAN, EXPLODE, DISPLAYS } from "./plan.js";
import { buildHob } from "./model.js";
import { buildCasserole } from "./casserole.js";
import { buildCuisine } from "./cuisine.js";

export const SET = { BENCH: 0, KITCHEN: 1 };
/** ≈ the radius of the system on the bench (the hob is 59 × 52): sizes the bench, its light, its shadows. */
export const SIZE = 32;
export { HOME };

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof` on the CLOSE-UPS only (the poses that spread CLOSE). Every pose says its lens: a cut never inherits a blur. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };
const CLOSE = { dof: LOOK.dof };
const SHARP = { dof: 0 };

// world points the poses aim at (kitchen): the two front zones, the hero display
const [HX, HY, HZ] = HOME;
const PANW = [HX + ZONES.pan.x, HY, HZ + ZONES.pan.z]; //    (195, 90.4, 39)
const HANDW = [HX + ZONES.hand.x, HY, HZ + ZONES.hand.z]; // (167, 90.4, 39)
const DISPW = [HX + DISPLAYS.pan.x, HY, HZ + DISPLAYS.pan.z]; // (195, 90.4, 53)
// bench points: the hob's origin stands at (0, BENCH_LIFT, 0)
const B = BENCH_LIFT;

const P = { fov: 30, side: 0, roll: 0, drift: 0.3 };
// The first frame (candidate (a), PROVISIONAL — chosen on the sheet of four, docs/050-actes.md): at the glass, from the low
// left: your hand flat on the empty zone in front, the saucepan boiling behind it, its steam, the « 9 » blinking.
export const POSE0 = { tx: 179, ty: 95, tz: 40, d: 72, az: -58, el: 9, fov: 40, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.KITCHEN,
  /* ── the kitchen, you (cuisine.js) ── */
  shell: 1, //     the X-ray of the kitchen (0–1)
  you: 1, //       you at the hob (0/1)
  palm: 0, //      your LEFT hand: 0 flat on the empty zone → 1 over the zone where the saucepan stood
  hover: 0, //     its height: 0 pressed on the glass → 1 a finger's breadth above
  away: 0, //      0 where palm/hover put it → 1 withdrawn toward your body
  grip: 0, //      your RIGHT hand: 0 at your side → 1 closed on the saucepan's handle
  child: 0, //     a child's hand on the worktop's front edge (0–1) — the like
  /* ── the saucepan (casserole.js) ── */
  lift: 0, //      the saucepan lifted off its zone: 0 on the glass → 1 PAN.lift cm above (your right hand follows if grip 1)
  boil: 1, //      the water boils (0–1): 0 still — « les bulles retombent »
  steam: 1, //     its steam (0–1)
  xray: 0, //      the pan's wall turns to glass (0–1): the water, the bubbles, the base's thickness show
  eddy: 0, //      the induced currents in the base, drawn veille, turning (0–1)
  panHeat: 1, //   THE HEAT in the base, signal (0–1) — a warm tint, never a glow of fire
  litPan: 0, //    the base glows faintly veille as the voice names it
  /* ── the hob (model.js) ── */
  see: 0, //       0 the hob as seen (black glass, closed case) → 1 glass and case in X-ray: coils, board, fan show
  on: 1, //        the hero zone is POWERED (0/1): its coil fed, its field there — the header reads it (« Champ »)
  field: 0, //     how much of that field is DRAWN (0–1): loops through the glass into the base, beating (slowed)
  coil: 0, //      the current in the hero coil drawn veille (0–1)
  flow: 0, //      the current's path drawn: lead → board → coil (0–1, it advances along it)
  glassHeat: 0.6, // the ring of glass under the base, warm (signal, 0–1): it stays when the pan is lifted
  sensor: 0, //    the hero zone's temperature point under the glass, veille (0–1)
  blink: 1, //     the EMPTY zone's display: its « 9 » blinks (0/1)
  power: 1, //     the hero display shows its « 9 » (0/1)
  hot: 0, //       the hero display shows « H » (0/1, wins over power)
  explode: 0, //   the layers rise (0–1): case, fan, board, coils, glass — and the saucepan above them
  cut: 0, //       hob and saucepan cut through the front zones' centres, the +z half gone (0–1)
  fan: 1, //       the fan turns (0–1)
  litBoard: 0, litCoil: 0, litGlass: 0, litSensor: 0, // the part the voice names glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`), `fs` its size; `mood` 0 veille → 1 signal (held frank); `gel` a signal light over
  // the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: PANW[0] - 8, fy: HY + 6, fz: PANW[2], fs: 60, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next — complete (nothing is inherited across a cut). PROVISIONAL: set on the stubs;
 *  the decor agents and the acts refine them on the real sets. [K] kitchen (world) · [B] bench (hob origin at (0, B, 0)). */
export const VIEW = {
  hook: POSE0,
  /* ── [K] in the kitchen ── */
  // along the glass, low, from the empty zone to the saucepan (the travelling of « promesse ») — the pan zone at the centre
  glassLow: { ...P, tx: PANW[0] - 4, ty: HY + 4, tz: PANW[2], d: 58, az: -70, el: 3, fov: 36, shift: 110, ...SHARP },
  // the boiling water, close and from above (« à gros bouillons »)
  boil: { ...P, tx: PANW[0], ty: HY + PAN.water + 1, tz: PANW[2], d: 40, az: -40, el: 34, shift: 120, ...CLOSE },
  // the two front zones on one glass (« même verre, même plaque »), three quarters high
  twoZones: { ...P, tx: HX + 8, ty: HY + 3, tz: HANDW[2] + 3, d: 140, az: -38, el: 22, shift: 120, ...SHARP },
  // your empty zone and your hand, close (« sans casserole, son voyant clignote ») — the display in the frame
  emptyZone: { ...P, tx: HANDW[0] + 1, ty: HY + 1, tz: HANDW[2] + 8, d: 58, az: -36, el: 36, shift: 110, ...CLOSE },
  // the saucepan's base on the glass, at glass level (« posée à même le verre »)
  panLow: { ...P, tx: 204, ty: 106, tz: 47, d: 100, az: -15, el: 8, shift: 120, ...CLOSE },
  // the ring of glass where the base stood, your hand above it (« juste au-dessus »)
  hotRing: { ...P, tx: PANW[0], ty: HY + 3, tz: PANW[2] + 2, d: 56, az: -58, el: 12, shift: 110, ...CLOSE },
  // the hero display, close (« un H apparaît »)
  display: { ...P, tx: DISPW[0], ty: HY + 0.5, tz: DISPW[2], d: 30, az: -30, el: 32, shift: 110, ...CLOSE },
  // the hob seen from above, the edge of the worktop in frame (the like: the child's hand)
  top: { ...P, tx: HX - 11, ty: HY, tz: HZ + 15, d: 160, az: -20, el: 60, shift: 120, ...SHARP },
  // « regarde dessous »: the camera drops to the glass, the hob whole three quarters, its glass and case gone X-ray (`see` 1):
  // act 1 ENDS here, act 2's benchCut leaves from it (view: VIEW.system, origin: BENCH_ORIGIN). Not lower than el ≈ 6: the
  // same pose on the bench must stay above the bench's floor
  system: { ...P, tx: HX, ty: HY - 2, tz: HZ, d: 120, az: -40, el: 8, shift: 130, ...SHARP },
  /* ── [B] on the bench ── */
  // the hob and its saucepan whole, three quarters: VIEW.system moved to the bench — where benchCut lands (same picture)
  whole: { ...P, tx: 0, ty: B - 2, tz: 0, d: 120, az: -40, el: 8, shift: 130, ...SHARP },
  // the exploded column (explode 1): case, fan, board, coils, glass, and the saucepan above
  exploded: { ...P, tx: 0, ty: B + 16, tz: 0, d: 190, az: -40, el: 16, shift: 150, ...SHARP },
  // the power board, risen (explode 1) · the hero coil, risen · the base of the saucepan, from just below
  board: { ...P, tx: -4, ty: B + 0.5, tz: -6, d: 80, az: -120, el: 14, shift: 120, ...CLOSE },
  coil: { ...P, tx: ZONES.pan.x, ty: B - 1.2 + EXPLODE.coils, tz: ZONES.pan.z, d: 58, az: -40, el: 28, shift: 140, ...CLOSE },
  heart: { ...P, tx: ZONES.pan.x, ty: B + EXPLODE.pan + 1, tz: ZONES.pan.z, d: 56, az: -40, el: -18, shift: 140, ...CLOSE },
  // the section (cut 1, assembled): coil / glass / base / water, seen on the cut face (from +z) — the principle
  section: { ...P, tx: ZONES.pan.x, ty: B + 1.5, tz: ZONES.pan.z, d: 36, az: -14, el: 14, shift: 140, ...CLOSE },
  sectionWide: { ...P, tx: ZONES.pan.x - 6, ty: B + 4, tz: ZONES.pan.z, d: 78, az: -14, el: 8, shift: 140, ...SHARP },
};
/** Where the kitchen's HOME lands when a cut goes to the bench (benchCut's `origin`): the same hob, the same place in frame. */
export const BENCH_ORIGIN = [HX, HY - B, HZ];

/** What a cut to the bench sets, whatever came before: the hob and its saucepan, still, cold, closed, nobody. */
export const BENCHED = {
  shell: 0, you: 0, palm: 0, hover: 0, away: 1, grip: 0, child: 0,
  lift: 0, boil: 0, steam: 0, xray: 0, eddy: 0, panHeat: 0, litPan: 0,
  see: 0, on: 1, field: 0, coil: 0, flow: 0, glassHeat: 0, sensor: 0, blink: 0, power: 1, hot: 0, explode: 0, cut: 0, fan: 0,
  litBoard: 0, litCoil: 0, litGlass: 0, litSensor: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: B, fz: 0, fs: SIZE,
};
/** What a cut to the kitchen sets: tonight — the saucepan boiling on its zone, your hand flat on the empty one. */
export const STAGED = {
  shell: 1, you: 1, palm: 0, hover: 0, away: 0, grip: 0, child: 0,
  lift: 0, boil: 1, steam: 1, xray: 0, eddy: 0, panHeat: 1, litPan: 0,
  see: 0, on: 1, field: 0, coil: 0, flow: 0, glassHeat: 0.6, sensor: 0, blink: 1, power: 1, hot: 0, explode: 0, cut: 0, fan: 1,
  litBoard: 0, litCoil: 0, litGlass: 0, litSensor: 0,
  mood: 1, gel: 0, fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: 60,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const cuisine = buildCuisine();
  const hob = buildHob();
  const pan = buildCasserole();
  const system = new THREE.Group(); // the hob, and the saucepan on its hero zone: ONE object
  system.name = "system";
  const panAt = new THREE.Group();
  panAt.position.set(ZONES.pan.x, 0, ZONES.pan.z);
  panAt.add(pan.root);
  system.add(hob.root, panAt);
  const set = new THREE.Group(); // the kitchen
  const mount = new THREE.Group(); // where the system stands in it
  mount.position.set(...HOME);
  set.add(cuisine.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group();
  benchMount.position.y = B;
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(BRAND.signal);
  // (filled every frame: no allocation in apply)
  const HOB = {}, PANP = {}, CUIS = {};

  return {
    cuisine, hob, pan, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.parent !== home) home.add(system);

      HOB.see = S.see; HOB.on = S.on; HOB.field = S.field; HOB.coil = S.coil; HOB.flow = S.flow; HOB.glassHeat = S.glassHeat;
      HOB.sensor = S.sensor; HOB.blink = S.blink; HOB.power = S.power; HOB.hot = S.hot; HOB.explode = S.explode; HOB.cut = S.cut;
      HOB.fan = S.fan; HOB.litBoard = S.litBoard; HOB.litCoil = S.litCoil; HOB.litGlass = S.litGlass; HOB.litSensor = S.litSensor;
      hob.update(HOB, time, px);
      // the saucepan: lifted by your hand, risen above the column in the exploded view
      panAt.position.y = S.lift * PAN.lift + S.explode * EXPLODE.pan;
      PANP.boil = S.boil; PANP.steam = S.steam; PANP.xray = S.xray; PANP.eddy = S.eddy * S.on; PANP.panHeat = S.panHeat;
      PANP.litPan = S.litPan; PANP.cut = S.cut;
      pan.update(PANP, time, px);
      if (!onBench) {
        CUIS.shell = S.shell; CUIS.you = S.you; CUIS.palm = S.palm; CUIS.hover = S.hover; CUIS.away = S.away; CUIS.grip = S.grip;
        CUIS.lift = S.lift; CUIS.child = S.child;
        cuisine.update(CUIS, time, px);
      }

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.5);
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.0004;
    },
  };
}
