// DOSSIER 023 — Éolienne de secours : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by avion.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SKY: the A330 like an X-ray, at night over the Atlantic, its engines dead — a glass shell, fine
// lines, and solid inside only what counts: the two engines, the control surfaces, the tanks, the three hydraulic
// circuits, you at a window, and the RAT in its bay under the belly. The BENCH: that same RAT — door, arm and
// spring, propeller, pump, the three lines — alone on its pool of light, opened. ONE object, re-parented: the cut
// from one to the other matches on it.
// Three colours. signal is the failure: the dead engines, the dead circuits, the descent, the runway out of reach.
// veille is the RAT: its blades, the circuit it brings back, the control surfaces that answer, the runway reached.
// ink is the rest.
//
// THE PLANE STANDS STILL, THE WORLD COMES TO IT. Two numbers say where it is, and world.js turns them into the set:
//   the ground under the wheels   groundY = −(FUSE.r + GEAR.h) − ALT.depth · alt / ALT.cruise
//   the runway's threshold        x = −ISLAND.far · ahead          (ahead < 0: the threshold is behind, the plane rolls)
// Every shot in the sky moves `ahead` a little, straight ("none"): the plane flies — a still sea is a still plane.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { FUSE, WING, ENGINES, TAIL, SURFACES, GEAR, BAY, YOU, CABIN, HYD, DOOR, ARM, SPRING, PROP, PUMP, LINES, SYSTEM, BENCHAT, ALT, ISLAND, SKY } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildAvion } from "./avion.js";

export const SET = { BENCH: 0, SKY: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

/** The ground under the wheels (cm, plane's frame) and the threshold's x, for a state. */
export const groundOf = (S) => -(FUSE.r + GEAR.h) - (ALT.depth * Math.max(0, S.alt)) / ALT.cruise;
export const thresholdOf = (S) => -ISLAND.far * S.ahead;

const [BX, BY, BZ] = BAY.at;

// The first frame is the hook, « Au-dessus de l'Atlantique, ton avion n'a plus un seul moteur » : the A330 of glass,
// at night, from below and in front on its left, the near engine big and dead (signal), your lit window along the
// cabin, the black sea far below. The RAT is still in its bay: it comes out on « sortir ». (Act 1 tries four frames
// and gives the best one back.)
export const POSE0 = { tx: -700, ty: -250, tz: 500, d: 5200, az: -38, el: -9, fov: 34, shift: 160, side: 0, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.SKY,
  /* ── where the plane is (sky) ── */
  alt: 10500, //   altitude in TRUE metres: the header's big readout, and the depth of the sea under the plane (0 = wheels on the runway)
  ahead: 0.92, //  the runway's threshold ahead, 0–1 of ISLAND.far (≈ 120 km told, 800 m drawn); < 0 once on the runway (−0.25 ≈ stopped). Move it straight in every sky shot
  pitch: -2, //    the plane's attitude, degrees (+ nose up): ≈ −2 in the glide, +4 at the flare
  bank: 0, //      degrees, + the left wing (+z) down: the turn toward the island
  dawn: 0, //      0 night → 1 first light: a low ink band on the horizon, a sheen on the sea (never a colour)
  wind: 0.5, //    the air along the plane: fine streaks flowing aft (0–1); where they cross the RAT's disc they turn veille
  /* ── the plane (avion.js) ── */
  shell: 1, //     the X-ray of the plane: glass skin, frames, windows (0–1)
  engines: 0, //   how many engines run (0–2): below 2 the RIGHT (far) one is dead, below 1 the LEFT (near) one too; dead = cold, outlined signal; the fraction is the spool-down
  fuel: 0, //      the wing tanks, solid in the glass: how full (0–1)
  leak: 0, //      a thin trail of fuel from the right engine's pylon, drawn signal (0–1)
  lines: 0, //     the three hydraulic circuits under engine pressure: ink when 1, dead signal when 0 (along the belly, to the wings and the tail)
  surf: 0, //      the control surfaces alive: 0 dead (dim signal, still) → 1 veille (the green circuit holds them)
  stick: 0, //     their deflection, −1…1: ailerons opposite, elevators together — what « les gouvernes répondent » shows
  pax: 0, //       the 306 on board: rows of small glass heads in the cabin (0 unseen → 1)
  you: 1, //       you at the left window: a body of glass, seated (0 nobody)
  grip: 0, //      your hand closes on the armrest (0–1)
  brakes: 0, //    the main gear's wheels and brakes, solid in their bay, drawn hot signal: « tes freins », the problem (0–1)
  gear: 0, //      the landing gear: 0 up in its bays → 1 down
  tires: 0, //     the main tyres let go on the runway: they flatten, a few slow sparks (0–1) — no violence, nothing breaks
  runway: 0, //    the runway's lights drawn (0 unseen → 1): a line of points on the island, the threshold bar
  made: 0, //      0 out of reach (signal) → 1 reached (veille): the runway's colour
  /* ── the system (model.js) ── */
  door: 0, //      the bay's door: 0 shut (flush with the belly) → 1 open
  arm: 0, //       the arm: 0 stowed in the bay → 1 out, hanging in the wind (the spring lengthens with it)
  turn: 0, //      the propeller's angle, in TURNS: the acts move it (≈ 1 to 2 turns a second, straight) — never a hidden clock
  whirl: 0, //     the spinning disc drawn over the blades, veille (0–1): set it with a fast `turn`
  press: 0, //     the pump's pressure: the live circuit (HYD.live) lit veille from the pump outward (0–1)
  flow: 0, //      a head of veille light running along the live circuit, from the pump to the control surfaces (0–1: its position)
  explode: 0, //   on the bench: 0 assembled → 1 its parts apart (door, spring, arm, propeller, pump, the three lines)
  litDoor: 0, litArm: 0, litProp: 0, litPump: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -700, fy: -250, fz: 300, fs: 3500, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  hook: POSE0,
  /* ── in the sky (plane's frame) ── */
  // the whole plane, three quarters front-left, a little below (fs 3500)
  plane: { ...P, tx: 0, ty: -100, tz: 0, d: 13000, az: -40, el: -6, fov: 32, shift: 170 },
  // the plane small over the sea, the horizon, the island far ahead (fs 8000) — « au-dessus de l'océan », « cent vingt kilomètres »
  wide: { ...P, tx: -9000, ty: -3000, tz: 0, d: 42000, az: -62, el: 8, fov: 40, shift: 160 },
  // the near (left) engine, close, three quarters front (fs 600)
  engine: { ...P, tx: ENGINES.x, ty: ENGINES.y, tz: ENGINES.z, d: 1900, az: -34, el: -4, shift: 150 },
  // you at the window, from outside, the wing and the near engine behind you (fs 500)
  you: { ...P, tx: YOU.at[0], ty: YOU.at[1] + 60, tz: YOU.at[2], d: 1300, az: -24, el: 4, fov: 34, shift: 150 },
  // the belly and the RAT's bay, from below and to the left: the door, then the arm and the propeller in the wind (fs 300)
  bay: { ...P, tx: BX, ty: BY - 90, tz: BZ, d: 900, az: -42, el: -14, shift: 150 },
  // the main gear's bay, from below: « tes freins » (fs 400)
  gear: { ...P, tx: GEAR.main[0], ty: -330, tz: GEAR.main[1], d: 1400, az: -36, el: -18, shift: 150 },
  // the three circuits along the belly, out to the wing and the tail, from below (fs 3000)
  circuits: { ...P, tx: 400, ty: -260, tz: 0, d: 9000, az: -30, el: -24, fov: 34, shift: 170 },
  // the tail and its surfaces (fs 1200)
  tail: { ...P, tx: TAIL.x, ty: 200, tz: 0, d: 3600, az: -50, el: 8, shift: 160 },
  // the approach: from behind and above the plane, the island and its runway ahead (fs 6000)
  approach: { ...P, tx: -4000, ty: -1500, tz: 0, d: 16000, az: -118, el: 10, fov: 38, shift: 170 },
  // the RAT in the plane, alone lit: act 2 cuts to the bench from it (on the bench: the same pose, less BAY.at plus BENCHAT)
  system: { ...P, tx: BX, ty: BY - 70, tz: BZ, d: 620, az: -40, el: -8, shift: 150 },
  /* ── on the bench (the hinge at BENCHAT) ── */
  whole: { ...P, tx: 0, ty: 170, tz: 0, d: 620, az: -40, el: 6, shift: 160 },
  // the exploded view, in ONE vertical frame (fs 300)
  exploded: { ...P, tx: 0, ty: 170, tz: 0, d: 900, az: -40, el: 8, shift: 170 },
  // the door and the spring, close · the propeller, nearly square on · the pump and the three lines
  door: { ...P, tx: 0, ty: 225, tz: 0, d: 380, az: -36, el: 14, shift: 150 },
  prop: { ...P, tx: 0, ty: 85, tz: 0, d: 420, az: -62, el: 4, shift: 150 },
  pump: { ...P, tx: 30, ty: 110, tz: 0, d: 380, az: -30, el: 10, shift: 150 },
};

/** What a cut to the bench sets, whatever came before: the RAT out (arm 1, door 1), still, nothing lit. */
export const BENCHED = {
  alt: FIRST.alt, ahead: FIRST.ahead, pitch: 0, bank: 0, dawn: 0, wind: 0,
  shell: 0, engines: 0, fuel: 0, leak: 0, lines: 0, surf: 0, stick: 0, pax: 0, you: 0, grip: 0, brakes: 0, gear: 0, tires: 0, runway: 0, made: 0,
  door: 1, arm: 1, whirl: 0, press: 0, flow: 0, explode: 0, litDoor: 0, litArm: 0, litProp: 0, litPump: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 160, fz: 0, fs: SIZE,
};
/** What a cut to the sky sets: night over the sea, the glide, both engines dead, the RAT in its bay, you at the window. */
export const STAGED = {
  pitch: -2, bank: 0, dawn: 0, wind: 0.5,
  shell: 1, engines: 0, fuel: 0, leak: 0, lines: 0, surf: 0, stick: 0, pax: 0, you: 1, grip: 0, brakes: 0, gear: 0, tires: 0, runway: 0, made: 0,
  door: 0, arm: 0, whirl: 0, press: 0, flow: 0, explode: 0, litDoor: 0, litArm: 0, litProp: 0, litPump: 0,
  mood: 1, gel: 0, fx: -700, fy: -250, fz: 300, fs: 3500,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const avion = buildAvion();
  const system = buildSystem();
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // standing at BENCHAT
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);
  scene.add(avion.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    avion, system, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      avion.group.visible = !onBench;
      const home = onBench ? benchMount : avion.mount; // avion.mount: the bay, moved with the plane's pitch and bank
      if (system.root.parent !== home) home.add(system.root);
      system.update({ bench: onBench ? 1 : 0, door: S.door, arm: S.arm, turn: S.turn, whirl: S.whirl, wind: onBench ? S.wind : 0, press: S.press, flow: S.flow, lines: S.lines, explode: S.explode, litDoor: S.litDoor, litArm: S.litArm, litProp: S.litProp, litPump: S.litPump }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        avion.update({
          ground: groundOf(S), threshold: thresholdOf(S), ahead: S.ahead, pitch: S.pitch, bank: S.bank, dawn: S.dawn, wind: S.wind,
          shell: S.shell, engines: S.engines, fuel: S.fuel, leak: S.leak, lines: S.lines, press: S.press, flow: S.flow, surf: S.surf, stick: S.stick,
          pax: S.pax, you: S.you, grip: S.grip, brakes: S.brakes, gear: S.gear, tires: S.tires, runway: S.runway, made: S.made, mood: S.mood,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.45 / Math.max(60000, d * 2.4);
    },
  };
}

export { FUSE, WING, ENGINES, TAIL, SURFACES, GEAR, BAY, YOU, CABIN, HYD, DOOR, ARM, SPRING, PROP, PUMP, LINES, SYSTEM, BENCHAT, ALT, ISLAND, SKY };
