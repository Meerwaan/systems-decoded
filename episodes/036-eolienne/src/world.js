// DOSSIER 036 — L'éolienne dans la tempête : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, eolienne.js, vent.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SCENE: a country road at night in a storm (025's road and its car aux rayons X, you at the wheel,
// imported as they are), and 180 m ahead, 50 m to the right, a wind turbine of the order of an Enercon E-82: its tower
// and its three blades seen like an X-ray (eolienne.js), the rain and the wind (vent.js), and at the top, solid in all
// that glass, the only things that matter (model.js): the hub, each blade's pitch drive and ITS OWN battery, the
// generator, the brake that stays cold. The BENCH: that same system alone on its pool of light, the top of the tower
// under it. ONE object, re-parented: the bench stands exactly where the top of the tower is (turned the same way), so
// the cut from one to the other matches on it, in place — a pose aimed at the hub reads the same on both.
// Three colours. signal is the threat: the storm's gusts, the overspeed (the header, the blades' blur), the tip's
// reach to the car, a battery that has aged, the grid that dies. veille is the system alive: the grid while it feeds,
// the batteries, the pitch motors that turn, the blades that pivot to the feather. ink is the rest.
//
// THE STORY (docs/faits/036-eolienne.md; a scenario, `sources` says so): a storm at night. The grid fails: the turbine
// can no longer pitch its blades on the mains, its rotor runs away. Each blade has its own pitch motor and its own
// battery (this model: Enercon); they turn the three blades 90° « en drapeau », the wing stops lifting, the rotor falls
// back to a few turns a minute (≈ 3 tr/min [P]). No delay in seconds is ever shown (none is sourced), no hydraulic
// cylinder anywhere, no braking of the rotor (the brake is for maintenance: it stays cold). THE RUNAWAY IS AN INSTANT,
// NOT TEN SECONDS: the rotor accelerates over a sentence, it never spins wild for long.
// THE FILM IS IN REAL TIME. `rotor` is the rotor's angle (turns): the acts make it grow with `rpm` (turnsOver below);
// three identical blades: a rotor read modulo 1/3 is the same picture (the loop uses it).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  TOWER, TURBINE, WIND, top, BLADE, SECTION, FOLD, MAINS, CARAT, REACH,
  HUB, BEARING, PITCH, BATTERY, GENERATOR, BRAKE, CARRIER, YAW, NACELLE, VANE, STUB, SYSTEM,
} from "./plan.js";
import { buildSystem } from "./model.js";
import { buildTurbine } from "./eolienne.js";
import { buildWind } from "./vent.js";
import { buildRoute } from "../../025-esp/src/route.js"; // 025's road, its car aux rayons X, you, its habillage (dressRoute, inside)

const DEG = Math.PI / 180;
export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The rotor: 82 m across (E-82 [P]) — the header's tip speed is π·D·rpm/60. The nominal speed's top (18 tr/min [P])
 *  and the idle once feathered (≈ 3 tr/min [P]). Above NOMINAL is the overspeed: illustrative, `sources` says so. */
export const ROTOR_D = 82;
export const NOMINAL = 18;
export const IDLE = 3;
export const tipKmh = (rpm) => (Math.PI * ROTOR_D * Math.max(0, rpm)) / 60 * 3.6;
/** The turns a rotor gains while its speed goes linearly from rpm0 to rpm1 over `seconds`: an act that ramps `rpm`
 *  over a shot moves `rotor` by this much in the same tween — "power1.in" when rpm0 is 0, "none" when they are close. */
export const turnsOver = (rpm0, rpm1, seconds) => ((rpm0 + rpm1) / 2 / 60) * seconds;

// The hub in the world (the light, the poses): 78 m up, 180 m from the car.
const HUBW = top(...HUB.at);
const [HX, HY, HZ] = HUBW;
const CENTRE = top(...SYSTEM.centre);

/** The studio (kit/lib/stage.js). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE below); the hook and the wide shots stay sharp.
 *  `air`    off until a planche shows a net gain at 270 px (025: none on its rain at night).
 *  `finish` the solids' surface: machining grain and handling marks (full screen only). */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Tempête. Au-dessus de toi, les pales s'emballent. » : from the road, low, at night,
// in the rain — the three blades sweeping the storm and speeding up, the tower climbing the frame, the hub solid and
// dark on its halo, small but readable; at the bottom, your car and its lamps.
// PROVISIONAL (candidate a, set on BOUCHONS): the planche of four candidates (docs/036-actes.md) chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { tx: -959, ty: 4728, tz: -1597, d: 13064, az: -12.2, el: -20, fov: 82, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── the road and the car (025's route.js) ── */
  shell: 1, //    the X-ray of the road and of the car: glass, fine lines (0–1)
  you: 1, //      you at the wheel, a body of glass (0–1)
  rain: 1, //     the car's own rain: streaks in its beams, the water's reflections (0–1)
  /* ── the turbine (eolienne.js) ── */
  tower: 1, //    the X-ray of the tower: its glass, its sections, its ladder and door (0–1)
  blades: 1, //   the three full blades of glass (0 on the bench: model.js keeps their solid roots)
  rotor: 0, //    the rotor's angle, in turns (it grows: the acts move it with rpm — turnsOver). Read modulo 1/3
  rpm: 11, //     the rotor's speed, tr/min: the blades' blur and the tips' trails; the header's tip speed (11 ≈ 170 km/h, 13 ≈ 200)
  pitchA: 0, pitchB: 0, pitchC: 0, // each blade's pitch, degrees: 0 producing (« de biais ») → 90 « en drapeau » (by the edge)
  shake: 0, //    blade A shudders (« une pale peut lâcher »): a bending that runs along it (0–1)
  reach: 0, //    the signal arc from a tip's path down to your car (« ta voiture est à portée »), drawn along (0–1)
  mains: 1, //    the grid: 1 its cable alive (veille heads flowing from the tower to the station) → 0 cut, dead
  fold: 0, //     Formerie: the tower's upper half folds about its middle, away from the road (0 → 1 ≈ 78°)
  tech: 0, //     the technician on the ladder inside the tower: 0 nobody · 0.01 at the foot → 1 at the top
  /* ── the system (model.js) ── */
  cover: 1, //    the nacelle's cover and the spinner, glass (0–1): the X-ray that shows the hub and the nacelle
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart, in ONE vertical frame
  batt: 0, //     the three batteries awake: 0 dark, waiting → 1 veille, feeding their motors
  charge: 1, //   the batteries' charge (their gauges): 1 full · 0.33 « au tiers » (Formerie) — signal under 0.5
  motors: 0, //   the three pitch motors powered: 0 dead → 1 veille (their pinions turn by themselves when a pitch moves)
  heart: 0, //    blade A's battery alone, the heart: the rest of the system dims around it (0–1)
  litMast: 0, litNacelle: 0, litGen: 0, litHub: 0, litMotor: 0, litBrake: 0, // the part the voice names glows faintly (litMast: the top of the tower and its yaw ring; litBrake: ink, cold)
  /* ── the storm and the wind (vent.js) ── */
  storm: 1, //    the rain across the sky and the gusts (veins of wind, signal), slanted along WIND (0–1)
  flow: 0, //     the principle: blade A's cross-section lit, the wind's filets meeting it (0–1)
  lift: 0, //     the pull of the wing on the rotor: an arrow at the section, as long as the profile lifts (vent.js reads pitchA)
  gauge: 0, //    the arc graduated 0 → 90 around the section, its needle on pitchA (0–1)
  slip: 0, //     the fall: the wind's filets sliding past the three feathered blades without pushing (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: HX, fy: HY - 2000, fz: HZ, fs: 6000, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/036-eolienne.md, 036-model.md, 036-vent.md).
 *  All in the world's frame; a pose aimed at the hub reads the same in the scene and on the bench. */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const T = (x, y, z) => { const [tx, ty, tz] = top(x, y, z); return { tx, ty, tz }; }; // aim at a point of the nacelle's frame
const H = TURBINE.heading;
export const VIEW = {
  hook: POSE0,
  /* ── the scene, from the road ── */
  // [a] behind your car, low, over its roof: its beams in the rain toward the tower's foot, the rotor high and big
  behind: { ...P, tx: -959, ty: 4728, tz: -1597, d: 13064, az: -12.2, el: -20, fov: 70, shift: 0 },
  // [b] through your windscreen, from your seat, looking up: « au-dessus de toi »
  windscreen: { ...P, tx: -636, ty: 5584, tz: -1311, d: 12469, az: -15, el: -26, fov: 76, shift: 0 },
  // [c] far back on the road, a longer lens: the road runs to the tower's foot, the car in it, the rotor over the road
  road: { ...P, tx: -1263, ty: 4923, tz: -1346, d: 14844, az: -9.4, el: -19, fov: 50, shift: 0 },
  // [d] from the far verge, low across the road: your car in profile in the foreground, the turbine behind and above
  verge: { ...P, tx: 4049, ty: 4764, tz: 1895, d: 13724, az: -50.5, el: -20, fov: 64, shift: 0 },
  // the whole turbine from the field, the road at its foot: the grid, the station, the fold, the like's wide
  wide: { ...P, tx: -1500, ty: 3800, tz: 3000, d: 26000, az: -30, el: 2, fov: 40, shift: 60 },
  // the rotor face-on-ish from below and upwind: the three blades, their pitch read at a glance (« chaque pale pivote »)
  rotor: { ...P, tx: HX, ty: HY, tz: HZ, d: 13000, az: H + 25, el: -18, fov: 34, shift: 80 },
  // along blade A, from beyond its tip, its section in front: the principle (blade A level, pointing to the camera side)
  section: { ...P, ...CLOSE, ...T(2390, 250, 380), d: 1500, az: H + 118, el: 8, fov: 30, shift: 150 },
  // poses checked by the decor agents (036-vent, 036-eolienne journals)
  feather: { ...P, tx: -291, ty: 7800, tz: 244, d: 11000, az: 5, el: -12, fov: 34, shift: 80 },
  fold: { ...P, tx: -1500, ty: 3800, tz: 3000, d: 30000, az: -30, el: 2, fov: 40, shift: -150 },
  // inside the tower, at the foot of the ladder, looking up: the technician climbing toward the hub (like)
  ladder: { ...P, tx: -75, ty: 3990, tz: 161, d: 985, az: 155, el: -70.6, fov: 64, shift: 0 },
  /* ── at the top (the same poses on the bench: it stands where the top of the tower is) ── */
  // the hub and the nacelle through their glass, from the left and a little above: act 1 ends here, act 2 cuts to the bench
  system: { ...P, tx: HX, ty: HY, tz: HZ, d: 2600, az: H - 60, el: 28, fov: 32, shift: 120 },
  // the top whole — hub, nacelle, blade A's root standing up — on its halo, rotor still (the end of act 1, « Sans
  // courant »; act 2 cuts to the bench on it and opens the exploded view). Retouche 04/11: d 1000 filled the frame dark
  // = act 1's last pose (acte1.js HUB_RIN): the cut to the bench is the same picture, blade A up, the roots in the plane
  root: { ...P, tx: HX, ty: HY, tz: HZ, d: 2900, az: H + 25, el: 8, fov: 32, shift: 100 },
  // the whole system on the bench, three-quarter front
  whole: { ...P, tx: CENTRE[0], ty: CENTRE[1], tz: CENTRE[2], d: 3400, az: H - 55, el: 26, fov: 32, shift: 150, side: 110 },
  // the exploded view, in ONE vertical frame
  exploded: { ...P, tx: CENTRE[0], ty: CENTRE[1] + 250, tz: CENTRE[2], d: 4000, az: H - 25, el: 24, fov: 32, shift: -40, side: 170 },
  // a pitch drive and its toothed ring, blade A at the top of the rotor (rotor 0)
  motor: { ...P, ...CLOSE, ...T(PITCH.at[0], 250 + BEARING.r + PITCH.at[1], 380 + PITCH.at[2]), d: 640, az: H - 60, el: -10, shift: 0 },
  // THE HEART: blade A's battery cabinet (rotor 0)
  battery: { ...P, ...CLOSE, ...T(BATTERY.at[0], 250 + BEARING.r + BATTERY.at[1], 380 + BATTERY.at[2]), d: 420, az: H - 30, el: 16, shift: 160 },
  // the generator and the brake's caliper on its rim (« ce n'est pas un frein »)
  brake: { ...P, ...CLOSE, ...T(-74, 47, GENERATOR.z + GENERATOR.depth / 2 + 11), d: 460, az: H - 70, el: 10, shift: 0 },
};

/** What a cut to the bench sets, whatever came before: the system whole, at rest, the rotor still, nothing lit.
 *  `rpm` and the pitches keep the act's values (the header reads them); the rotor stands with blade A at the top. */
export const BENCHED = {
  shell: 0, you: 0, rain: 0, tower: 0, blades: 0, shake: 0, reach: 0, fold: 0, tech: 0, storm: 0, flow: 0, lift: 0, gauge: 0, slip: 0,
  rotor: 0, cover: 0.6, explode: 0, heart: 0, litMast: 0, litNacelle: 0, litGen: 0, litHub: 0, litMotor: 0, litBrake: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CENTRE[0], fy: CENTRE[1], fz: CENTRE[2], fs: SIZE,
};
/** What a cut to the scene sets: night, storm, the road, the car and you, the turbine whole and producing, the grid
 *  alive, nothing lit in the hub. `rotor`, `rpm`, the pitches, `batt`, `charge`, `motors` are the act's. */
export const STAGED = {
  shell: 1, you: 1, rain: 1, tower: 1, blades: 1, shake: 0, reach: 0, mains: 1, fold: 0, tech: 0,
  cover: 1, explode: 0, heart: 0, litMast: 0, litNacelle: 0, litGen: 0, litHub: 0, litMotor: 0, litBrake: 0,
  storm: 1, flow: 0, lift: 0, gauge: 0, slip: 0,
  mood: 1, gel: 0, fx: HX, fy: HY - 2000, fz: HZ, fs: 6000,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const route = buildRoute();
  const turbine = buildTurbine();
  const system = buildSystem();
  const wind = buildWind();

  // the scene: the road at CARAT (untouched, its car at its origin), the turbine at the origin, the storm around
  const set = new THREE.Group();
  const road = new THREE.Group();
  road.position.set(...CARAT);
  road.add(route.group);
  set.add(road, turbine.group, wind.group);
  // the full blades ride the system's pitched frames, the principle's section rides blade A's (unpitched) frame,
  // the fall's filets ride the nacelle's frame: they turn with the rotor wherever the system stands
  turbine.blades.forEach((b, k) => system.A.pitch[k].add(b));
  system.A.root[0].add(wind.flow);
  system.root.add(wind.disc);

  // the bench, where the top of the tower is: the system's stub stands on its floor, turned like the nacelle
  const bench = makeBench(SIZE);
  bench.group.position.set(0, TOWER.top - STUB, 0);
  const benchMount = new THREE.Group();
  benchMount.position.set(0, STUB, 0);
  benchMount.rotation.y = TURBINE.heading * DEG;
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    route, turbine, system, wind, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : turbine.A.top;
      if (system.root.parent !== home) home.add(system.root);
      system.update({
        bench: onBench ? 1 : 0, cover: S.cover, rotor: S.rotor, rpm: S.rpm, pitchA: S.pitchA, pitchB: S.pitchB, pitchC: S.pitchC,
        explode: onBench ? S.explode : 0, batt: S.batt, charge: S.charge, motors: S.motors, heart: S.heart,
        litMast: S.litMast, litNacelle: S.litNacelle, litGen: S.litGen, litHub: S.litHub, litMotor: S.litMotor, litBrake: S.litBrake,
      }, time, px);
      // the blades and the wind's insets ride the system: they are drawn on the bench too when their numbers say so
      turbine.update({
        tower: S.tower, blades: onBench ? 0 : S.blades, rpm: S.rpm, pitchA: S.pitchA, pitchB: S.pitchB, pitchC: S.pitchC,
        shake: S.shake, reach: S.reach, mains: S.mains, fold: S.fold, tech: S.tech, mood: S.mood, flow: S.flow,
      }, time, px);
      wind.update({
        storm: onBench ? 0 : S.storm, flow: S.flow, lift: S.lift, gauge: S.gauge, slip: S.slip, rotor: S.rotor,
        pitchA: S.pitchA, pitchB: S.pitchB, pitchC: S.pitchC, rpm: S.rpm,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        route.update({
          shell: S.shell, gap: 40, lane: 0, yaw: 0, aim: 0, steer: 0, kmh: 0, rolled: 0, rain: S.rain,
          boar: 0, moose: 0, mooseAt: 0, you: S.you, slide: 0, arrows: 0, alarm: 0, moment: 0, gas: 0, tip: 0, rocket: 0, bFR: 0,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      stage.air.amount = 0;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.000022;
    },
  };
}

export {
  TOWER, TURBINE, WIND, top, BLADE, SECTION, FOLD, MAINS, CARAT, REACH,
  HUB, BEARING, PITCH, BATTERY, GENERATOR, BRAKE, CARRIER, YAW, NACELLE, VANE, STUB, SYSTEM, HUBW,
};
