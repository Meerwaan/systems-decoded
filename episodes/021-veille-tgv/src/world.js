// DOSSIER 021 — Veille du TGV : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by train.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The LINE: a TGV Duplex like an X-ray, at night on the high-speed line, at 255 km/h — a glass shell,
// fine lines, and solid inside only what counts: the EMPTY cab (its desk, its empty seat, the closed door behind
// it), the traction chain, the brake pipe and the bogies' brakes, the 393 passengers as small glass heads, you at a
// window, and the system in the cab. The BENCH: that same system — the pedal, the keys, the countdown box and its
// dial, the bell, the relay, the emergency valve — alone on its pool of light, opened. ONE object, re-parented:
// the cut from one to the other matches on it.
// Three colours. signal is the threat: the empty cab at speed, the countdown running out, the bell nobody answers,
// the train that runs on. veille is the system alive: the dial fed by a gesture, the relay that cuts, the air that
// vents, the brakes that bite, the radio that warns, the train stopped. ink is the rest.
//
// TACT (docs/faits/021-*.md, « À ne pas dire »): the film rests on a real event (24 December 2024: the driver
// died). NOBODY is ever in the cab: no fall, no body, no driver, no name, no cause. The cab is empty from the
// first frame to the last; the closed door stays closed. The only figures are the passengers (glass heads), you at
// your window, and — on the bench only — a glass boot that shows what « appuyer » means.
//
// THE TRAIN STANDS STILL, THE WORLD COMES TO IT. `run` (metres) scrolls the world toward +x: EVERY shot on the line
// moves it in a straight line (≈ 70.8 m per film second at 255 km/h, "none") — a still landscape is a stopped train.
// The braking (« freinage d'urgence » → « arrêté ») moves it in "power1.out" (constant deceleration) while `kmh`
// falls in "none" over the same span. `kmh` is the header's readout AND the speed the set smears its sleepers at.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import {
  TRACK, CATENARY, WORLD, POWER, CAB, ANTENNA, PANTO, TRACTION, BOGIES, PIPE, TRAILERS, REAR, DECKS, PAX, YOU,
  CAB_PEDAL, PEDAL, KEYS, BOX, BELL, RELAY, VALVE, BOOT, SYSTEM, BENCHAT,
} from "./plan.js";
import { buildSystem } from "./model.js";
import { buildTrain } from "./train.js";

export const SET = { BENCH: 0, LINE: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The speed of the story (BEA-TT: 255 km/h when the veille triggers) and what it is in metres per film second. */
export const KMH = 255;
export const MPS = KMH / 3.6; // ≈ 70.8 — « soixante-dix mètres par seconde »
/** The stop (BEA-TT): 2 320 m. The header's distance is read off the speed with the law of a constant deceleration. */
export const STOP_M = 2320;
export const brakedOf = (kmh) => STOP_M * (1 - Math.min(1, Math.max(0, kmh / KMH)) ** 2);

const [PX, PY, PZ] = CAB_PEDAL;
const [CX, CY, CZ] = SYSTEM.centre;

// The first frame is the hook, « Ton TGV file à 255 kilomètres-heure. Dans la cabine… plus personne. » : the glass
// nose of the TGV at night, from the front-left and low, rushing at us; the cab the brightest thing in the night,
// its desk lit and its seat EMPTY behind the windscreen; the far masts streaking past, the rails converging under
// it. PROVISIONAL: the planche of four candidates (docs/021-actes.md) chooses it, and it is pasted here before the
// acts are staged.
export const POSE0 = { tx: -950, ty: 280, tz: 0, d: 1000, az: -60, el: -9, fov: 44, shift: 100, side: 0, roll: 0, drift: 0 };

export const FIRST = {
  set: SET.LINE,
  /* ── the line (train.js) ── */
  run: 0, //      the world's scroll, true METRES toward +x (masts, sleepers, fields): the acts move it straight, ≈ MPS per second; it may go negative
  kmh: KMH, //    the train's speed: the header's big readout, and how much the set smears what passes (0 = stopped: everything sharp, still)
  shell: 1, //    the X-ray of the train: glass skin, frames, windows (0–1)
  cab: 1, //      the cab's light: the desk glows, it lights the EMPTY seat — the brightest thing in the night (0–1)
  pax: 0, //      the 393 on board: rows of small glass heads on both decks (0 unseen → 1)
  you: 0, //      you at your window, first trailer, upper deck: a body of glass, seated (0 nobody → 1)
  phone: 0, //    your phone, in your hand, its screen lit ink (0–1) — the next file's subject, for the loop
  traction: 1, // the current from the contact wire down the pantograph to the transformer and the motors: ink heads flowing (1) → cut (0, the chain goes dark)
  brake: 0, //    the emergency braking: a veille head runs along the brake pipe front → back (0–1 its position); behind it every bogie's brakes bite, veille
  radio: 0, //    the alarm: rings of veille leaving the roof antenna into the night (0 none → 1: three rings out)
  display: 0, //  the desk's speed display (the TVM's readout) lit veille: « d'autres systèmes surveillent la vitesse » (0–1)
  /* ── the system (model.js) ── */
  pedal: 0, //    the pedal: 0 up (released, its rest angle) → 1 pressed flat
  foot: 0, //     ON THE BENCH ONLY: the glass boot, 0 away (lifted, faded) → 1 resting on the pedal (it follows `pedal` down)
  still: 0, //    the boot goes inert: 0 alive → 1 heavy and dim, sunk on the pedal (« un corps effondré… peut appuyer encore »)
  keys: 0, //     the two touch keys lit, as under fingers (0–1)
  count: 1, //    the dial: what remains of the countdown, a ring that empties clockwise (1 full → 0 empty)
  danger: 0, //   the ring's colour: 0 veille (fed by a gesture) → 1 signal (running out with nobody there). Held frank
  bell: 0, //     the bell rings: slow rings of signal around it (0–1)
  cut: 0, //      the relay: 0 closed (the current line through it, ink) → 1 open (its contacts apart, veille)
  vent: 0, //     the emergency valve: 0 shut → 1 open, the air leaves it in slow ink streaks
  blind: 0, //    the dial's blind spot: a short dark-signal wedge inside the ring, « quelques secondes » it does not see (0 none → 1 drawn)
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart in ONE vertical frame
  litPedal: 0, litKeys: 0, litBox: 0, litBell: 0, // the part the voice is naming glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -800, fy: 260, fz: 0, fs: 1500, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS: the builders give better ones in their journals (docs/journal/021-train.md, 021-model.md). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
export const VIEW = {
  hook: POSE0,
  /* ── on the line (train's frame) ── */
  // inside the cab, from the windscreen: the EMPTY seat lit by the desk, the closed door behind it (fs 250)
  cab: { ...P, tx: -660, ty: 235, tz: 0, d: 273, az: -69, el: 20, fov: 40, shift: 60 },
  // inside the cab, from behind the empty seat: the desk, the windscreen, the night rushing at it (fs 250)
  seatBack: { ...P, tx: -800, ty: 260, tz: 0, d: 250, az: 80, el: 9, fov: 40, shift: 100 },
  // the system in the cab, under the desk: the pedal, the box behind the desk face — act 2 cuts to the bench from it (fs 120)
  system: { ...P, tx: -830, ty: 190, tz: 15, d: 210, az: -50, el: 22, fov: 28, shift: 40 },
  // the pedal alone, close, under the desk (fs 60)
  pedal: { ...P, tx: PX - 15, ty: PY + 5, tz: 0, d: 140, az: -45, el: 26, shift: 120 },
  // the bell on the desk top in the foreground, the EMPTY seat behind it: « Une sonnerie. Personne ne répond. » (fs 120)
  bellCab: { ...P, tx: PX + BELL.at[0], ty: PY + BELL.at[1], tz: BELL.at[2], d: 170, az: -35, el: 18, shift: 120 },
  // the dial of the countdown box, inside the desk, seen through its glass side: the hero of act 3 (fs 60)
  dialCab: { ...P, tx: -850, ty: 195, tz: 7, d: 130, az: -14, el: 10, shift: 120 },
  // outside, the cab's left side: its lit window, empty — « le conducteur tombe du train » is told on THIS, nothing else (fs 600)
  side: { ...P, tx: -790, ty: 300, tz: 140, d: 950, az: -10, el: 4, fov: 32, shift: 140 },
  // the front of the train from high, front-left: the power car and the first trailers, the passengers lit (fs 4000)
  train: { ...P, tx: 3000, ty: 250, tz: 0, d: 7000, az: -40, el: 18, fov: 34, shift: -120 },
  // from above the first trailer, looking forward over the rows of heads to the power car and its lit cab (fs 2500)
  pax: { ...P, tx: 1300, ty: 330, tz: 0, d: 1400, az: 80, el: 22, fov: 34, shift: 100 },
  // rail level, beside the front bogie: the wheels, the rails, the masts streaking (fs 700)
  rail: { ...P, tx: -700, ty: 70, tz: 0, d: 720, az: -25, el: -2, fov: 40, shift: 120 },
  // the front power car from the left and above: pantograph, transformer, motor bogies — « le courant est coupé » (fs 2200)
  traction: { ...P, tx: 350, ty: 280, tz: 0, d: 3000, az: -12, el: 16, fov: 30, shift: 40 },
  // low, from the left: the brake pipe under the floors and the bogies' brakes, the power car and two trailers (fs 3500)
  brakes: { ...P, tx: 1600, ty: 80, tz: 0, d: 3400, az: -25, el: -6, fov: 32, shift: 150 },
  // the whole line at night from high, front-left: the train on it, the masts in a row to the horizon (fs 9000)
  wide: { ...P, tx: 4000, ty: 0, tz: 0, d: 32000, az: -40, el: 20, fov: 34, shift: -200 },
  // the roof of the front power car and its antenna, the night sky above: the radio's rings (fs 1200)
  roof: { ...P, tx: -300, ty: 485, tz: 0, d: 1500, az: -25, el: 16, fov: 28, shift: 100 },
  // the desk from behind the empty seat, close: its speed display (fs 150)
  desk: { ...P, tx: CAB.display[0], ty: CAB.display[1], tz: 0, d: 190, az: 90, el: 18, shift: 120 },
  // you at your window, from outside through the glass, the phone lit in your hand (fs 250)
  you: { ...P, tx: 1890, ty: 350, tz: 100, d: 330, az: -40, el: 6, fov: 34, shift: 40 },
  /* ── on the bench (the root at BENCHAT) ── */
  whole: { ...P, tx: -22, ty: 108, tz: 15, d: 440, az: -38, el: 18, shift: 30 },
  // the exploded view, in ONE vertical frame (fs SIZE)
  exploded: { ...P, tx: -18, ty: 113, tz: 15, d: 430, az: -40, el: 14, shift: 100 },
  // the pedal and the boot, close, three quarters (the boot comes from +x)
  pedalBench: { ...P, tx: -15, ty: BENCHAT[1] + 6, tz: 0, d: 150, az: -40, el: 22, shift: 120 },
  // the keys, from above and the left — they face up
  keysBench: { ...P, tx: 8, ty: 162, tz: 0, d: 240, az: -82, el: 42, shift: 100 },
  // the countdown box and its dial (on its +z face), square on, the bell above it
  dial: { ...P, tx: -50, ty: 115, tz: 7, d: 130, az: -14, el: 8, shift: 120 },
};

/** What a cut to the bench sets, whatever came before: the system assembled, the pedal up, nobody, nothing lit.
 *  The line's numbers keep their story values (`kmh` stays: the header goes on reading the train). */
export const BENCHED = {
  shell: 0, cab: 0, pax: 0, you: 0, phone: 0, radio: 0, display: 0,
  pedal: 0, foot: 0, still: 0, keys: 0, count: 1, danger: 0, bell: 0, cut: 0, vent: 0, blind: 0, explode: 0,
  litPedal: 0, litKeys: 0, litBox: 0, litBell: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX, fy: BENCHAT[1] + CY, fz: CZ, fs: SIZE,
};
/** What a cut to the line sets: night, the cab lit and empty, the current flowing, the pedal up, nobody at the boot. */
export const STAGED = {
  shell: 1, cab: 1, pax: 0, you: 0, phone: 0, traction: 1, brake: 0, radio: 0, display: 0,
  pedal: 0, foot: 0, still: 0, keys: 0, blind: 0, explode: 0, litPedal: 0, litKeys: 0, litBox: 0, litBell: 0,
  mood: 1, gel: 0, fx: -800, fy: 260, fz: 0, fs: 1500,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const train = buildTrain();
  const system = buildSystem();
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // standing at BENCHAT
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);
  scene.add(train.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    train, system, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      train.group.visible = !onBench;
      const home = onBench ? benchMount : train.mount; // train.mount: the pedal's place on the cab floor
      if (system.root.parent !== home) home.add(system.root);
      system.update({
        bench: onBench ? 1 : 0, pedal: S.pedal, foot: onBench ? S.foot : 0, still: S.still, keys: S.keys, count: S.count, danger: S.danger,
        bell: S.bell, cut: S.cut, vent: S.vent, blind: S.blind, explode: onBench ? S.explode : 0,
        litPedal: S.litPedal, litKeys: S.litKeys, litBox: S.litBox, litBell: S.litBell,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        train.update({
          run: S.run, kmh: S.kmh, shell: S.shell, cab: S.cab, pax: S.pax, you: S.you, phone: S.phone,
          traction: S.traction, brake: S.brake, radio: S.radio, display: S.display, mood: S.mood,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.45 / Math.max(20000, d * 2.4);
    },
  };
}

export {
  TRACK, CATENARY, WORLD, POWER, CAB, ANTENNA, PANTO, TRACTION, BOGIES, PIPE, TRAILERS, REAR, DECKS, PAX, YOU,
  CAB_PEDAL, PEDAL, KEYS, BOX, BELL, RELAY, VALVE, BOOT, SYSTEM, BENCHAT,
};
