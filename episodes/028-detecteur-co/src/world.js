// DOSSIER 028 — Détecteur de CO : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by foyer.js and model.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The FLAT, at night, seen like an X-ray: 022's bedroom (chambre.js, imported unchanged, already dressed),
// you asleep in it; behind its back wall the corridor and the wall boiler that leaks; the children's room; outside
// the window, the garden. Solid in all that glass, only what matters: the CO detector on the wall (and, for the
// comment, the white smoke detector on the ceiling). The BENCH: that same detector alone on its pool of light. ONE
// object, re-parented: the cut from the wall to the bench matches on it, in place (benchCut, origin BENCH_ORIGIN).
// And a maquette: THE BLOOD (model.js, buildBlood), mounted at your chest — the dive into it dissolves the flat.
// Three colours. signal is the threat: the gas, wherever it is (the haze, its streaks from the boiler), the boiler's
// flame, the ache, the CO beads that take the oxygen's place. veille is the system alive (the detector's light, its
// current, its count, its alarm) and what it gives back: the fresh air, your breath outside, the oxygen. ink is the
// rest. Nobody is hurt at the image.
//
// THE STORY (docs/faits/028-*.md; the scene is a scenario, `sources` says so): at night a wall boiler leaks carbon
// monoxide — no smell, no colour. It mixes with the air at every height (NEVER a layer on the floor or under the
// ceiling: « ni plus lourd ni plus léger »). At a low concentration (≈ 50 ppm) the detector may wait an hour
// (EN 50291-1, as its makers publish it: 60 to 90 min); it counts the dose. An hour passes; the gas rises (≈ 100 ppm:
// 10 to 40 min); ten, twenty minutes; the dose reaches its threshold; it sounds. You wake, the window, outside; the
// children breathe. Never « the gas powers the alarm » (the battery does), never « obligatoire » for the CO detector.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { buildChambre } from "../../022-batterie-telephone/src/chambre.js";
import {
  ROOM, BED, PILLOW, YOU, TABLE, WINDOW, HALL, DOOR, BOILER, LEAK, KIDS, OUTSIDE, SMOKE, DETECTOR, BENCHAT, ROW, SYSTEM, BLOOD, STORY,
} from "./plan.js";
import { buildModel, buildBlood } from "./model.js";
import { buildFoyer } from "./foyer.js";

export const SET = { BENCH: 0, FLAT: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** benchCut's origin: a pose aimed at a point of the detector on the wall aims at the same point of it on the bench. */
export const BENCH_ORIGIN = [DETECTOR.at[0] - BENCHAT[0], DETECTOR.at[1] - BENCHAT[1], DETECTOR.at[2] - BENCHAT[2]];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (u) => u * u * (3 - 2 * u);

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the detector's face, a part on the bench
 *  `air`    off: no backlight in this film worth it (the boiler's glow is small; on the bench it greys the green)
 *  `finish` the solids' surface (the detector's plastic, its parts): full screen only
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

const [DX, DY, DZ] = DETECTOR.at;
const [BX, , BZ] = BOILER.at;
const [MX, MY, MZ] = BLOOD.at;

// The first frame is the hook, « Ta chaudière t'empoisonne. » PROVISIONAL (candidate a, docs/028-actes.md): low
// over your pillow, you asleep in the foreground; behind your head, through the bedroom's glass back wall, the
// boiler glowing signal and its gas streaming through the door toward you; on the wall, small, the detector's steady
// green. The planche of four candidates chooses it, on the real sets, BEFORE the acts; it is pasted here.
export const POSE0 = { tx: 70, ty: 112, tz: -175, d: 560, az: -36, el: 3, fov: 40, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.FLAT,
  /* ── the flat (022's chambre.js + foyer.js) ── */
  shell: 1, //    the X-ray of the flat: walls, beds, furniture, glass and fine lines (0–1)
  you: 1, //      you asleep in your bed (022's figure, it breathes) (0–1)
  micro: 0, //    the dive into your blood: 0 the flat · 1 only the maquette of the blood (the flat has dissolved)
  swap: 0.25, //  in the blood: 0 every cell carries oxygen (veille beads) → 1 most carry CO (signal beads)
  flame: 1, //    the boiler's burner, seen through its casing (signal) (0–1)
  leak: 1, //     the gas leaving the boiler: signal streaks from its underside, along the corridor, through the door, toward the bed — MOVING from frame 0 (0–1)
  co: 0.5, //     the CO in the air of the rooms: a soft signal haze at EVERY height, never a wall; 0.5 ≈ the 50 ppm, 1 ≈ the 100 ppm (0–1)
  ache: 0, //     « Mal de tête » : a slow signal throb at your temples (0–1)
  window: 0, //   your window: 0 shut → 1 wide open
  air: 0, //      the fresh night air pouring in by the open window, pushing the haze back (veille) (0–1)
  kids: 1, //     the two children (glass, smaller) (0–1)
  kidsOut: 0, //  where they are: 0 asleep in their beds · 1 outside, standing next to you (held 0 or 1; it switches on a cut)
  me: 0, //       you, awake (foyer.js's figure; the sleeping one is `you`) (0–1)
  mePose: 0, //   where you are: 0 sitting up in bed, eyes open · 1 at the window, a hand on its handle · 2 outside (held 0, 1 or 2; it switches on a cut)
  breath: 0, //   outside: your breath and the children's, slow plumes of veille in the cold air (0–1)
  smoke: 0, //    the smoke detector on the ceiling: 0 there, plain · 1 shown — its outline lit, the gas going round it (it sees nothing)
  /* ── the story (main.js: the header) ── */
  clock: STORY.start, // the night's clock, minutes after midnight (108 = 01:48): « Une heure passe » → 170, the alarm → 190
  ppm: STORY.ppmLow, //  the CO in the bedroom's air (the header's second readout): only 50 and 100 are ever held
  dose: 0.12, //  what the detector has counted (its sum): 0 → 1 = its threshold, it sounds. Its count on the detector's face, on the chip, and the #gauge
  /* ── the system (model.js) ── */
  explode: 0, //  on the bench: 0 assembled → 1 its six parts apart, in ONE row across the camera (ROW)
  sniff: 0.5, //  the air (and its CO) going in: signal motes through the grille, across the membrane, onto the electrode (0–1)
  current: 0.5, // the small current the electrode makes, proportional: a veille head of light along the trace to the chip, as bright as `current` (0–1)
  alarm: 0, //    the buzzer sounds: rings of veille from its mouth and the light that has a place — slow, never a flicker (0–1)
  litGrille: 0, litMembrane: 0, litElectrode: 0, litPuce: 0, litBuzzer: 0, litPile: 0, // the part the voice names glows faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 50, fy: 110, fz: -150, fs: 500, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on
 *  BOUCHONS (docs/journal/028-architecte.md): the builders give better ones in their journals (028-foyer.md, 028-model.md). */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the flat ── */
  // your pillow, close: you asleep, the detector on the wall above-left (022's pillow shot, a little wider)
  pillow: { ...P, tx: -8, ty: 70, tz: -80, d: 260, az: -52, el: 14, fov: 36, shift: 170 },
  // the whole flat from high at the front: the children's room left, the bedroom, the corridor and the boiler behind (candidate d)
  house: { ...P, tx: -110, ty: 30, tz: -90, d: 1900, az: -10, el: 50, fov: 36, shift: 60 },
  // the boiler from the corridor, low: its casing, its flame, the gas leaving its underside (candidate b)
  boiler: { ...P, tx: BX, ty: 145, tz: BZ, d: 300, az: -58, el: -14, fov: 40, shift: 100 },
  // the door: the gas coming through, the bed beyond (from the corridor, behind the back wall)
  door: { ...P, tx: 140, ty: 120, tz: -125, d: 420, az: 162, el: 10, fov: 36, shift: 140 },
  // the detector on the wall, upper left, and the boiler behind the glass back wall, lower right (candidate c)
  guard: { ...P, tx: 10, ty: 150, tz: -160, d: 150, az: -44, el: -8, fov: 40, shift: 60 },
  // the detector on the wall, three-quarters, the gas passing it
  wall: { ...P, ...CLOSE, tx: DX, ty: DY, tz: DZ + 3, d: 95, az: -30, el: 4, fov: 30, shift: 120 },
  // where act 1 ends, close on the detector: act 2 cuts to the bench from it (benchCut, origin BENCH_ORIGIN)
  system: { ...P, ...CLOSE, tx: DX, ty: DY, tz: DZ + 2.5, d: 52, az: -28, el: 8, shift: 150 },
  // your chest, before the dive into the blood · the maquette of the blood, the flat dissolved
  chest: { ...P, tx: MX, ty: MY, tz: MZ, d: 220, az: -60, el: 18, fov: 32, shift: 150 },
  blood: { ...P, ...CLOSE, tx: MX, ty: MY, tz: MZ, d: 120, az: -24, el: 10, fov: 30, shift: 150 },
  // the children asleep in their room
  kids: { ...P, tx: -330, ty: 50, tz: -30, d: 520, az: -30, el: 30, fov: 36, shift: 150 },
  // your window from inside (you at it, the air coming in) · outside, looking back at the house (you and the children)
  window: { ...P, tx: 165, ty: 130, tz: -30, d: 330, az: -48, el: 4, fov: 36, shift: 120 },
  outside: { ...P, tx: OUTSIDE.me[0] - 20, ty: 95, tz: OUTSIDE.me[2] + 20, d: 560, az: 62, el: 6, fov: 36, shift: 150 },
  // the smoke detector on the ceiling, from below
  smoke: { ...P, tx: SMOKE.at[0], ty: SMOKE.at[1] - 6, tz: SMOKE.at[2], d: 230, az: -40, el: -32, fov: 34, shift: 130 },
  /* ── on the bench (the root at BENCHAT: a point of the detector is at the same place there) ── */
  whole: { ...P, tx: 0, ty: BENCHAT[1], tz: 2, d: 70, az: -30, el: 14, shift: 150 },
  // the exploded view: the row across the camera, every part reads (fs 45)
  exploded: { ...P, tx: -5, ty: BENCHAT[1], tz: ROW.z, d: 265, az: -32, el: 20, fov: 30, shift: 40 },
  electrode: { ...P, ...CLOSE, tx: -3, ty: BENCHAT[1], tz: ROW.z + 2, d: 70, az: -28, el: 12, fov: 28, shift: 60 },
  puce: { ...P, ...CLOSE, tx: 0.5 * ROW.pitch, ty: BENCHAT[1], tz: ROW.z + 3, d: 60, az: -24, el: 14, shift: 150 },
};

/** What a cut to the bench sets, whatever came before: the detector whole, alone, nobody, no gas around it.
 *  The story's numbers (clock, ppm, dose) keep their values: the header goes on reading the night. */
export const BENCHED = {
  shell: 0, you: 0, micro: 0, flame: 0, leak: 0, co: 0, ache: 0, window: 0, air: 0, kids: 0, kidsOut: 0, me: 0, mePose: 0, breath: 0, smoke: 0,
  explode: 0, sniff: 0, current: 0, alarm: 0, litGrille: 0, litMembrane: 0, litElectrode: 0, litPuce: 0, litBuzzer: 0, litPile: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: BENCHAT[1], fz: 0, fs: SIZE,
};
/** What a cut to the flat sets: the night, you asleep, the boiler leaking, the children asleep, the detector
 *  counting. `co`, `ppm`, `dose`, `clock` are the act's. */
export const STAGED = {
  shell: 1, you: 1, micro: 0, flame: 1, leak: 1, ache: 0, window: 0, air: 0, kids: 1, kidsOut: 0, me: 0, mePose: 0, breath: 0, smoke: 0,
  explode: 0, sniff: 0.5, current: 0.5, alarm: 0, litGrille: 0, litMembrane: 0, litElectrode: 0, litPuce: 0, litBuzzer: 0, litPile: 0,
  mood: 1, gel: 0, fx: 50, fy: 110, fz: -150, fs: 500,
};
/** What a cut to the blood adds (over STAGED): the flat dissolved, the light on the maquette. */
export const BLOODED = { micro: 1, fx: MX, fy: MY, fz: MZ, fs: 60 };

export function buildWorld(stage) {
  const { scene } = stage;
  const chambre = buildChambre(); // 022's bedroom, dressed (the street through the shutter, the glass of water)
  const foyer = buildFoyer();
  const system = buildModel();
  const blood = buildBlood();
  const set = new THREE.Group(); // the flat (room coordinates)
  const mount = new THREE.Group(); // where the detector hangs: the centre of its back, on the bedroom's back wall
  mount.position.set(DX, DY, DZ);
  const lens = new THREE.Group(); // where the maquette of the blood stands: your chest
  lens.position.set(MX, MY, MZ);
  lens.add(blood.group);
  set.add(chambre.group, foyer.group, mount, lens);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // …and on the bench, standing upright on its bottom edge
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    chambre, foyer, system, blood, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const fade = 1 - smooth(clamp01(S.micro)); // in the blood, the flat (and the detector on its wall) has dissolved
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      system.root.visible = onBench || fade > 0.001;
      system.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, sniff: S.sniff, current: S.current, dose: S.dose, alarm: S.alarm,
        litGrille: S.litGrille, litMembrane: S.litMembrane, litElectrode: S.litElectrode, litPuce: S.litPuce, litBuzzer: S.litBuzzer, litPile: S.litPile,
      }, time, px);
      if (!onBench) {
        // 022's bedroom, its phone at « nothing »: no heat, no charge, the pillow flat, the charger lying on the bedside table
        chambre.update({ room: 1, fade, shell: S.shell, you: S.you, cloth: 1, pillow: 0, trapped: 0, plug: 0, charge: 0, place: 1, heat: 0, ranks: 0, recall: 0 }, time, px);
        foyer.update({
          shell: S.shell, fade, flame: S.flame, leak: S.leak, co: S.co, window: S.window, air: S.air, kids: S.kids, kidsOut: S.kidsOut,
          me: S.me, mePose: S.mePose, breath: S.breath, smoke: S.smoke, ache: S.ache,
        }, time, px);
        blood.update({ micro: S.micro, swap: S.swap }, time, px);
      } else {
        chambre.update({ room: 0, fade: 0, shell: 0, you: 0, cloth: 1, pillow: 0, trapped: 0, plug: 0, charge: 0, place: 1, heat: 0, ranks: 0, recall: 0 }, time, px);
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
        bench.pool.mesh.scale.setScalar(1 + 1.6 * smooth(clamp01(S.explode)));
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3 * fade);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00028;
    },
  };
}

export {
  ROOM, BED, PILLOW, YOU, TABLE, WINDOW, HALL, DOOR, BOILER, LEAK, KIDS, OUTSIDE, SMOKE, DETECTOR, BENCHAT, ROW, SYSTEM, BLOOD, STORY,
};
