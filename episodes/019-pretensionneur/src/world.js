// DOSSIER 019 — Prétensionneur : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by cabine.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The CABIN: 011's car seen like an X-ray, its bumper on the wall, you at the wheel, belted — and, solid
// in all that glass, the only things that matter: the strap across you, and in the foot of your door pillar the
// retractor it comes from. The frame is the car's: the wall comes to it. The BENCH: that same retractor — the
// system — alone on its pool of light, with a length of its strap. It is ONE object, re-parented, turned the same
// way in both: the cut from one to the other matches on it.
// Three colours. signal is the threat: the crash, your body going forward, the strap's force on your chest (and
// its slack, which is what lets you go). veille is what the system does: the order, the gas, the strap pulled
// tight, the bar that gives way on purpose. ink is everything else — the charge's flash is white.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { CAR, WALL, CRUSH, YOU, BELT, TRAVEL, SLACK, ECU, WIRE, REAR, SYSTEM, RETRACTOR, FRAME, SPOOL, BAR, LOCK, TURBINE, CHARGE, REEL, LIMIT } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildCabine } from "./cabine.js";

export const SET = { BENCH: 0, CABIN: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** Where the system stands in the car, counted from where it stands on the bench (benchCut's origin). */
export const HOME = RETRACTOR.home;

// The first frame is the hook, at the very instant of the crash (T+0): the bumper on the wall, you upright at the
// wheel — you have not moved yet — and across your chest the strap, loose. From ahead of your door, three quarters
// front: the strap is the brightest thing in the picture; behind your shoulder, the pillar and the retractor in its
// foot. It moves on frame 1: the strap pulls itself tight (slack 1 → 0), alone. (A starting point: the acts refine it.)
export const POSE0 = { tx: -44, ty: 90, tz: 8, d: 300, az: -124, el: 8, fov: 38, shift: 150, side: 200, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.CABIN,
  /* ── the cabin: the car, the wall, you, the strap across you (cabine.js) ── */
  shell: 1, //   the X-ray of the car: its body of glass and fine lines, wheels, seats, steering wheel (0–1)
  wall: 1, //    the wall and the road (0–1)
  gap: 0, //     metres between your bumper and the wall: 0 it touches (the first frame) · more, the wall is still away (the road slides with it)
  crush: 0.03, // the crash: 0 the bumper touches the wall → 1 the nose folded by CRUSH.depth. It does NOT move you: `lunge` does
  debris: 0, //  what the crash throws: slow shards and dust, and the blow's own light where the bumper meets the wall (0–1)
  you: 1, //     0 nobody · 1 you at the wheel: a body of glass, hands on the rim
  coat: 0, //    your winter coat, drawn: a padded shell of glass over your trunk, under the strap (0–1) — why there is slack
  lean: 0, //    how you sit: 0 back against the seat · 1 a little forward, off the seat back — the strap leaves your shoulder
  lunge: 0, //   your body thrown forward: 0 seated → 1 as far as the strap lets it go (farther with `slack`, a little farther with `give`: TRAVEL)
  bags: 0, //    011's two airbags, pale and never commented: 0 folded away → 1 full (your head ends in one, not on the wheel)
  order: 0, //   the airbag control unit's order: 0 nothing → 0.15 the unit, on the tunnel, has decided (lit veille) → 1 a head of veille light has run along its wire to the retractor
  rear: 0, //    0 nobody · 1 someone of glass on the back seat, behind you, the belt hanging beside him, unbuckled (he never moves)
  /* ── the strap: read by BOTH sets (cabine.js draws it across you, model.js from the spool up) ── */
  slack: 1, //   the strap's slack: 1 loose (it stands off your chest, it sags on the bench) → 0 taut. The retractor's spool has turned BACKWARD by as much strap
  give: 0, //    the torsion bar twisted, the strap paid out again: 0 → 1 (a few centimetres, on purpose)
  load: 0, //    the strap's force on your chest, in kilos: the header's second readout (0 … LIMIT); a signal glow along the strap where it bears on you
  ms: 0, //      thousandths of a second since the crash, in slow motion: the header's big readout (it may go negative: the wall is still coming)
  /* ── the system (model.js) ── */
  fire: 0, //    the charge: 0 intact → the burn (a white flash that has a place, ≈ 0.15; the gas, veille, rushing into the turbine's case, 0.1 → 0.8; the turbine starts) → 1 spent: dark, burnt, it will not fire again
  lock: 0, //    the everyday lock: 0 free → 1 the pendulum has tipped, its pawl is in the ratchet wheel — the spool cannot pay out
  tug: 0, //     the strap pulled out by hand (0–1): free, the spool turns and pays out; locked, it stops dead and the strap goes taut
  xray: 0, //    the frame's cheeks, the covers and the spool turn to glass: the bar inside the spool, the turbine in its case show (0–1)
  explode: 0, // on the bench: 0 assembled → 1 its parts apart, in a row across the camera (along the spool's axis)
  litFrame: 0, litSpool: 0, litCharge: 0, litTurbine: 0, litBar: 0, litPendulum: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -44, fy: 88, fz: 6, fs: 150, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = HOME;
export const VIEW = {
  hook: POSE0,
  /* ── in the cabin ── */
  // your chest and the strap across it, from ahead of your door · the same from the side: the strap standing off your chest, the wheel ahead
  chest: { ...P, tx: -36, ty: 94, tz: 4, d: 200, az: -128, el: 6, fov: 36, shift: 150 },
  side: { ...P, tx: -37, ty: 92, tz: -8, d: 330, az: -90, el: 4, fov: 36, shift: 150 },
  // the strap going up from your shoulder to the ring, and down the pillar to the retractor
  ring: { ...P, tx: -76, ty: 100, tz: 34, d: 230, az: -100, el: 2, fov: 36, shift: 150 },
  pillar: { ...P, tx: -80, ty: 72, tz: 40, d: 300, az: -78, el: 6, fov: 34, shift: 160 },
  // the crash in profile, wide (011's): the wall, the nose, you · the car and the wall from three quarters rear
  profile: { ...P, tx: -30, ty: 80, tz: -120, d: 800, az: -90, el: 5, fov: 42, shift: 150, drift: 0 },
  rear34: { ...P, tx: -30, ty: 80, tz: -110, d: 700, az: -60, el: 10, fov: 46, shift: 150, drift: 0 },
  // the order: the control unit on the tunnel, its wire, the pillar's foot — from above
  order: { ...P, tx: -42, ty: 40, tz: 30, d: 300, az: -36, el: 40, shift: 60 },
  // the back seat and the one who has not buckled up
  back: { ...P, tx: -40, ty: 86, tz: 90, d: 330, az: -62, el: 8, fov: 36, shift: 150 },
  // the retractor in the pillar's foot, everything else gone dark: act 2 cuts to the bench from it (it is `whole`, moved by HOME)
  system: { ...P, tx: HX, ty: HY + 9, tz: HZ, d: 110, az: -70, el: 12, shift: 160 },
  /* ── on the bench (the system stands on the origin, turned as in the car) ── */
  whole: { ...P, tx: 0, ty: 9, tz: 0, d: 110, az: -70, el: 12, shift: 160 },
  // with its length of strap, up to the guide loop · exploded, in a row across the camera
  strap: { ...P, tx: 0, ty: 16, tz: 0, d: 170, az: -70, el: 10, shift: 170 },
  exploded: { ...P, tx: 0, ty: 9, tz: 8, d: 280, az: -74, el: 14, shift: 180 },
  // each named part from close (the builder of model.js gives the true ones)
  spool: { ...P, tx: 0, ty: 6, tz: 0, d: 60, az: -70, el: 12, shift: 160 },
  charge: { ...P, tx: 5, ty: 9, tz: 0, d: 46, az: -52, el: 14, shift: 160 },
  turbine: { ...P, tx: 5, ty: 6, tz: 0, d: 50, az: -48, el: 10, shift: 160 },
  bar: { ...P, tx: 0, ty: 6, tz: 0, d: 56, az: -74, el: 16, shift: 160 },
  // the lock's side: the ratchet wheel, the pawl, the pendulum (the far end of the spool: seen from ahead)
  lockSide: { ...P, tx: -5, ty: 4, tz: 0, d: 50, az: -118, el: 10, shift: 160 },
};
/** What a cut to the bench sets, whatever came before: the retractor whole, at rest, its strap loose, nothing fired. */
export const BENCHED = {
  shell: 0, wall: 0, gap: 0, crush: 0, debris: 0, you: 0, coat: 0, lean: 0, lunge: 0, bags: 0, order: 0, rear: 0,
  slack: 1, give: 0, load: 0, ms: 0, fire: 0, lock: 0, tug: 0, xray: 0, explode: 0,
  litFrame: 0, litSpool: 0, litCharge: 0, litTurbine: 0, litBar: 0, litPendulum: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 9, fz: 0, fs: SIZE,
};
/** What a cut to the cabin sets: the instant of the crash (T+0) — the bumper on the wall, you upright, the strap loose, nothing fired. */
export const STAGED = {
  shell: 1, wall: 1, gap: 0, crush: 0.03, debris: 0, you: 1, coat: 0, lean: 0, lunge: 0, bags: 0, order: 0, rear: 0,
  slack: 1, give: 0, load: 0, ms: 0, fire: 0, lock: 0, tug: 0, xray: 0, explode: 0,
  litFrame: 0, litSpool: 0, litCharge: 0, litTurbine: 0, litBar: 0, litPendulum: 0,
  mood: 1, gel: 0, fx: -44, fy: 88, fz: 6, fs: 150,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const cabine = buildCabine();
  const system = buildSystem();
  const set = new THREE.Group(); // the cabin set, in the car's frame
  const mount = new THREE.Group(); // where the retractor stands in the car: the foot of your door pillar
  mount.position.set(...HOME);
  mount.rotation.y = (RETRACTOR.turn * Math.PI) / 180;
  set.add(cabine.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench: the origin, turned the same
  benchMount.rotation.y = mount.rotation.y;
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    cabine, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      system.update({ bench: onBench ? 1 : 0, slack: S.slack, give: S.give, load: S.load, fire: S.fire, lock: S.lock, tug: S.tug, xray: S.xray, explode: S.explode, order: S.order, litFrame: S.litFrame, litSpool: S.litSpool, litCharge: S.litCharge, litTurbine: S.litTurbine, litBar: S.litBar, litPendulum: S.litPendulum }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        cabine.update({ shell: S.shell, wall: S.wall, gap: S.gap, crush: S.crush, debris: S.debris, you: S.you, coat: S.coat, lean: S.lean, lunge: S.lunge, bags: S.bags, order: S.order, rear: S.rear, slack: S.slack, give: S.give, load: S.load }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.pose?.d ?? stage.cam.d) : 0.00022;
    },
  };
}

export { CAR, WALL, CRUSH, YOU, BELT, TRAVEL, SLACK, ECU, WIRE, REAR, SYSTEM, RETRACTOR, FRAME, SPOOL, BAR, LOCK, TURBINE, CHARGE, REEL, LIMIT };
