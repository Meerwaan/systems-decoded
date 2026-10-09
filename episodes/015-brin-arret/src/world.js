// DOSSIER 015 — Brin d'arrêt : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by carrier.js, rafale.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The DECK: an aircraft carrier seen like an X-ray — a hull and a deck of glass, the painted strip, the
// sea all around and at the end of it — a Rafale of glass coming down on it, you at its controls; and, solid in all
// that glass, the only things that matter: the wheels, the hook, the wire across the deck and, under the deck, the
// brake the wire pulls. The frame is the ship's: the deck never moves, the aircraft comes to it.
// The BENCH: that same wire and its brake — the system — alone on its pool of light. It is ONE object, re-parented.
// Three colours. signal is the threat: the aircraft's speed (its nozzles, the header's readout), the sea at the end
// of the deck, a wire that parts. veille is the system alive: the wire that holds, the pull running down the cable,
// the ram, the oil at work. ink is everything else.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { DECK, BRINS, RAFALE, ENGINE, SYSTEM, RUNOUT, hookAt } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildCarrier } from "./carrier.js";
import { buildRafale } from "./rafale.js";

export const SET = { BENCH: 0, DECK: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

// The first frame is the hook: low on the deck BEHIND the tail, a little to port — the two nozzles, the hook hanging
// between them and dragging its sparks, the main wheels half a metre up, the film's wire lying veille across the
// strip ahead of them, the signal glow where the deck ends. (Set by act 1.)
export const POSE0 = { tx: -40, ty: 112, tz: 700, d: 1181, az: -7.5, el: -2.2, fov: 50, shift: 120, side: 50, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.DECK,
  /* ── the ship (carrier.js) ── */
  shell: 1, //   the X-ray of the ship: the hull, the island, the deck's paint (0–1)
  sea: 1, //     the sea and the sky: the swell going by, the horizon, the wake (0–1)
  under: 0, //   how much the deck lets one see under it, around the film's wire: 0 a deck · 1 clear glass, the brake's bay lit
  others: 1, //  the two other wires (0–1)
  crew: 0, //    the deck crew, a few figures of glass standing clear of the strip, to starboard (0–1)
  away: 0, //    a light climbing away beyond the end of the deck: an aircraft that has gone around (0–1: how far it has climbed)
  /* ── the aircraft (rafale.js) ── */
  jet: 1, //     the Rafale is there (0–1: a fade)
  pos: -9, //    metres of its hook's tip along the landing axis, from the film's wire: negative before it, 0 on it, ≈ 90 stopped (it touches down PAST the first wire: the film's wire is the first its hook meets)
  alt: 0.5, //   metres between its main wheels and the deck (0: rolling)
  nose: 8, //    degrees its nose is up (≈ 8 coming down, 0 rolling on three wheels)
  squat: 0, //   its legs compressed by the hit (0–1)
  hook: 1, //    the hook: 1 down, 0 up against the tail
  gas: 0.5, //   the throttle under your left hand and what the nozzles answer: 0.5 the approach · 1 full power (no afterburner flame: a hard, bright core)
  puff: 0, //    the smoke of the tyres hitting the deck (0–1, it lives a moment behind the wheels)
  scrape: 0.7, // the hook's tip dragging on the deck: sparks (0–1)
  you: 1, //     0 nobody · 1 you in the seat: a body of glass, left hand on the throttle
  /* ── the system (model.js) ── */
  held: 0, //    the hook has the wire: its bight follows the hook (0 lying across the deck · 1 held)
  pull: 0, //    metres the wire's bight has been pulled along the deck (in the ship: `pos` while it is held, up to 90; on the bench: a few)
  ram: 0, //     the ram's stroke into the cylinder (0–1): the sheaves turn, the crosshead travels with it
  flow: 0, //    the oil being forced through the valve, right now: a jet into the next vessel (0–1)
  heat: 0, //    how hot the oil has become (0–1: it goes from veille to signal)
  tense: 0.45, // the wire and its cables under load: they glow veille, taut (0–1)
  wave: 0, //    a head of light running the cable's way, from the wire on the deck (0) down to the ram (1): the pull, travelling
  dial: 0.5, //  the valve's setting, a graduated wheel on it: 0.5 is right for this aircraft (0–1)
  wrong: 0, //   the setting shown as a fault: the wheel and the valve turn signal (0–1)
  parted: 0, //  the wire breaks in the middle and its two ends whip back toward their sheaves (0–1)
  xray: 0, //    the cylinder and its vessels turn to glass: the ram, the oil, the valve's throat show (0–1)
  explode: 0, // on the bench: 0 the assembly whole → 1 its parts apart, in a row across the camera
  litBrin: 1, litCable: 0, litSheaves: 0, litRam: 0, litCyl: 0, litValve: 0, // the part the voice is naming glows faintly veille
  /* ── the header ── */
  sec: -0.15, // the story's clock, in seconds from the instant the hook takes the wire (the header's big readout)
  kmh: 220, //   the aircraft's speed over the deck (the header's second readout)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 200, fz: 500, fs: 900, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points: the builders give better ones. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [BX, BY, BZ] = SYSTEM.bench;
export const VIEW = {
  hook: POSE0,
  /* ── on the deck ── */
  // from astern and above, to port: the aircraft going away up the picture, the wire's V behind it, the end of the deck and the sea
  chase: { ...P, tx: 600, ty: 0, tz: -3000, d: 15500, az: -8, el: 12, fov: 46, shift: 200 },
  // close behind the aircraft, from astern and above (written for pos 40: tz follows the aircraft, −100 × pos − 100)
  tail: { ...P, tx: 0, ty: 120, tz: -3900, d: 2300, az: -16, el: 17, fov: 34, shift: 200 },
  // the end of the deck, its edge, the sea beyond (from above; weak from this high: prefer it low)
  end: { ...P, tx: 0, ty: 0, tz: -11500, d: 5200, az: -14, el: 22, fov: 34, shift: 120 },
  // the end of the deck, looking back at the three wires and the aircraft coming
  ahead: { ...P, tx: 0, ty: 60, tz: 300, d: 8500, az: -172, el: 12, fov: 28, shift: 150 },
  // the film's wire where the hook will take it, low on the deck
  wire: { ...P, tx: 0, ty: 20, tz: 0, d: 900, az: -58, el: 8, shift: 150 },
  // the system in the ship, the deck clear above it, everything else gone dark: act 2 cuts to the bench from it (it is `whole`, moved down by SYSTEM.bench)
  system: { ...P, tx: 0, ty: -220, tz: 0, d: 6000, az: -58, el: 18, shift: 230 },
  /* ── on the bench (the system stands at SYSTEM.bench) ── */
  whole: { ...P, tx: BX, ty: BY - 220, tz: BZ, d: 6000, az: -58, el: 18, shift: 230 },
  exploded: { ...P, tx: -120, ty: 330, tz: 200, d: 8300, az: -40, el: 16, shift: 230 },
  // the brake alone: the cylinder, the ram, the valve (best with xray 1)
  brake: { ...P, tx: -150, ty: BY + ENGINE.y, tz: 0, d: 3300, az: -48, el: 13, shift: 180 },
};
/** What a cut to the bench sets, whatever came before: the system whole, at rest, nothing pulled. */
export const BENCHED = {
  shell: 0, sea: 0, under: 0, others: 0, crew: 0, away: 0, jet: 0, you: 0, puff: 0, scrape: 0,
  held: 0, pull: 0, ram: 0, flow: 0, heat: 0, tense: 0, wave: 0, dial: 0.5, wrong: 0, parted: 0, xray: 0, explode: 0,
  litBrin: 0, litCable: 0, litSheaves: 0, litRam: 0, litCyl: 0, litValve: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: BY - 200, fz: 0, fs: SIZE,
};
/** What a cut to the deck sets: the Rafale about to touch, its hook 9 m short of the film's wire, nothing held yet. */
export const STAGED = {
  shell: 1, sea: 1, under: 0, others: 1, crew: 0, away: 0, jet: 1, pos: -9, alt: 0.5, nose: 8, squat: 0, hook: 1, gas: 0.5, puff: 0, scrape: 0, you: 1,
  held: 0, pull: 0, ram: 0, flow: 0, heat: 0, tense: 0, wave: 0, dial: 0.5, wrong: 0, parted: 0, xray: 0, explode: 0,
  litBrin: 0, litCable: 0, litSheaves: 0, litRam: 0, litCyl: 0, litValve: 0,
  sec: -0.15, kmh: 220, mood: 1, gel: 0, fx: 0, fy: 150, fz: 450, fs: 900,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const carrier = buildCarrier();
  const rafale = buildRafale();
  const system = buildSystem();
  const set = new THREE.Group(); // the deck set, in the ship's frame
  const mount = new THREE.Group(); // where the system stands in the ship: the origin
  set.add(carrier.group, rafale.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench
  benchMount.position.set(...SYSTEM.bench);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    carrier, rafale, system, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      system.update({ bench: onBench ? 1 : 0, under: S.under, held: S.held, pull: S.pull, ram: S.ram, flow: S.flow, heat: S.heat, tense: S.tense, wave: S.wave, dial: S.dial, wrong: S.wrong, parted: S.parted, xray: S.xray, explode: S.explode, litBrin: S.litBrin, litCable: S.litCable, litSheaves: S.litSheaves, litRam: S.litRam, litCyl: S.litCyl, litValve: S.litValve }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        carrier.update({ shell: S.shell, sea: S.sea, under: S.under, others: S.others, crew: S.crew, away: S.away }, time, px);
        rafale.update({ jet: S.jet, pos: S.pos, alt: S.alt, nose: S.nose, squat: S.squat, hook: S.hook, gas: S.gas, puff: S.puff, scrape: S.scrape, you: S.you, held: S.held }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.35);
      scene.fog.density = onBench ? bench.fog(stage.pose?.d ?? stage.cam.d) : 0.00001;
    },
  };
}

export { DECK, BRINS, RAFALE, ENGINE, SYSTEM, RUNOUT, hookAt };
