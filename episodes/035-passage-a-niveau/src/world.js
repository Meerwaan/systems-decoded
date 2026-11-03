// DOSSIER 035 — Passage à niveau : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by passage.js and model.js) — TWO frames, the car's and the crossing's
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The ROAD: 025's country road at night and its car seen like an X-ray, you at the wheel, stopped ON the
// far track of an automatic level crossing with four half-barriers, the queue stuck ahead, 021's TGV coming on
// that track (passage.js). Solid in all that glass: the four G2 signals (model.js, built four times) — mast, R24,
// bell, housing, and the boom in white and red. The BENCH: the HERO signal (outA, the exit boom in front of your
// hood) alone on its pool of light. ONE object, re-parented: the cut from one to the other matches on it, in place
// (benchCut, origin BENCHAT).
// Three colours. signal is the threat: the R24s, the TGV's headlamps and the ruler of its 800 m, the queue's stop
// lights, the boom's red bands. veille is the way out: the boom that gives (« ta +sortie+ »), the part the voice
// names on the bench, the phone and the signboard, the car alive (its dashboard). ink: the rest.
//
// THE STORY (docs/faits/035-passage-a-niveau.md; a scenario — `sources` says so). T = 0 when the R24s light. The
// bell rings at once; the entry booms come down a few seconds later (T ≈ 3 → 5.4), the exit booms once those are
// down (T ≈ 5.4 → 8.4). Your car: on voie 2, the queue ahead not moving. The HOOK is the instant the exit boom lands
// in front of your hood (T ≈ 8.2, on « casser »); the SCENE goes back to T = 0 and runs again up to that instant
// (« Tu es enfermé » = the hook's picture). Time stops in act 2. Act 3 runs it again from T ≈ 9: the TGV, the car
// that pushes the boom, the train behind you at T ≈ 22 (« au moins vingt secondes » after the lights: true).
// The header shows T (illustrative: the voice says only « au moins vingt secondes ») and how many booms are down.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { CAR, ROAD, TRACKS, BARRIER, SIGNALS, HERO, R24, BELL, BOOM, SYSTEM, GAP_STUCK, GAP_OUT, BENCHAT, FILE, TRAIN, PHONE } from "./plan.js";
import { buildSignal } from "./model.js";
import { buildPassage } from "./passage.js";

export const SET = { BENCH: 0, ROAD: 1 };
/** ≈ the radius of the hero signal on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** The story's seconds (header): when each pair of booms is down. Illustrative — the decree says « quelques secondes ». */
export const STORY = { inDown: 5.4, outDown: 8.4, train: 22, mps: 38.9 };
/** Where the TGV's nose is (metres up voie 2) at the story's second T: it reaches the road at T = 22 (140 km/h, illustrative). */
export const trainAt = (T) => (STORY.train - T) * STORY.mps;
/** How many booms are down (header): a boom counts once it is 95 % down; the hero, once given, no longer does. */
export const loweredOf = (W) => (W.downIn > 0.95 ? 2 : 0) + (W.downOut > 0.95 ? 2 : 0) - (W.downOut > 0.95 && W.give > 0.5 ? 1 : 0);

/** The studio (kit/lib/stage.js). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE below): the hook and the wide shots stay sharp.
 *  `air`    off (025 tried it on the night road: no gain at 270 px). To try once on the hook's TGV headlamps only.
 *  `finish` the solids' surface (the four signals): grain and smudges that break a highlight (full screen only). */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// THE CAR'S FRAME with the car stuck (gap −3): the crossing's centre at z = +300; voie 2 at z = +90 (under the car's
// rear half), voie 1 at z = +510; the hero boom at z = −350 (115 cm before the nose), its mast at x = +235; the entry
// booms at z = +950; the queue's last car at z = −900.
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const ZPN = -100 * GAP_STUCK; // the crossing's centre in the car's frame, the car stuck
const V2 = ZPN + TRACKS.z[1]; // voie 2
const V1 = ZPN + TRACKS.z[0]; // voie 1
const [HX, , HZ] = BENCHAT; // the hero's foot, the car stuck

// The first frame is the hook — PROVISIONAL (candidate « rail », docs/035-actes.md): low on voie 2's ballast, to
// the car's left, looking up the track (+x) toward the TGV's headlamps; the car across the rails in the middle, the
// hero boom coming down in front of its nose, the R24 flashing. Chosen on the planche of four, pasted here before
// the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: 1100, ty: 90, tz: 0, d: 2300, az: -94, el: 3, fov: 46, shift: 40, side: -130, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.ROAD,
  /* ── the road and the car (passage.js › 025/route.js) ── */
  shell: 1, //    the X-ray of the road, the car, the train, the crossing (0–1)
  gap: GAP_STUCK, // metres from the car's centre to the crossing's centre (ahead +, behind −): −3 stuck on voie 2, −6.8 out
  kmh: 0, //      the car's speed (its wheels, the road's smear)
  rolled: 0, //   metres its wheels have rolled
  wet: 0.25, //   the road's wetness (reflections of the lights): 0 dry → 1 rain. No rain falls in this film
  you: 1, //      you at the wheel (glass) 0/1
  car: 1, //      our car seen: 0 hides it (the top-view maquette of « repos »)
  alive: 1, //    the car alive: dashboard lit, engine driving (1) → dead (0); between, the dashboard flickers
  people: 0, //   0 everybody inside → 1 you and a passenger out, at the verge by the phone (« tout le monde sort »)
  /* ── the crossing (passage.js) ── */
  train: 638, //  (= trainAt(5.6)) metres from our lane's line to the TGV's nose along voie 2 (+ coming from +x, − gone past)
  beam: 1, //     the TGV's headlamps (0–1)
  other: 0, //    the second train's headlamps on voie 1 (0 → 1: they appear far and come closer)
  ruler: 0, //    the 800 m stopping distance unrolling along voie 2 (0–1)
  file: 1, //     the queue ahead, its stop lights (0–1)
  phone: 0, //    the alert phone and the signboard lit veille (0–1)
  /* ── the four G2 signals (model.js) ── */
  downIn: 1, //   the two ENTRY booms: 0 up → 1 down
  downOut: 0.62, // the two EXIT booms (the hero is one): 0 up → 1 down — the hook catches them coming down
  give: 0, //     the hero boom yields under your hood: 0 → 1 it swings away and fades (no break point shown)
  flash: 1, //    the R24s blinking (0–1)
  ring: 1, //     the bells ringing (0–1)
  shine: 0.6, //  the booms' retroreflective bands in the headlamps (the hero full, the others 40 %)
  /* ── the hero on the bench (model.js) ── */
  explode: 0, //  0 assembled → 1 apart
  sweep: 0, //    two headlamps pass along the boom (0 → 1), the bands light where they hit
  litLamp: 0, litBell: 0, litBar: 0, litBoom: 0, // the part the voice names glows veille
  /* ── the header ── */
  clock: 5.6, //  T: the story's seconds since the R24s lit (frozen in act 2)
  annonce: 20, // the countdown of the « repos » chip (« au moins vingt secondes »): seconds, 20 → 0
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 60, fz: 0, fs: 900, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses (complete: nothing is inherited across a cut). PROVISIONAL, set on BOUCHONS — the decor agents give
 *  better ones in their journals (docs/journal/035-model.md, 035-passage.md). Car's frame, the car stuck, unless said. */
export const VIEW = {
  hook: POSE0,
  /* ── the road ── */
  // candidate « capot »: ahead of the car, low, to the right: the hero boom across the frame like a blade in front of
  // the hood, its mast and R24 in the foreground, the car's face behind it
  hood: { ...P, tx: 200, ty: 120, tz: -380, d: 820, az: 150, el: 4, fov: 40, shift: 150 },
  // candidate « plongée » / the scene: high 3/4 over the crossing, wide — the four booms, the car between them
  plunge: { ...P, tx: 0, ty: 0, tz: 200, d: 1900, az: -40, el: 38, fov: 50, shift: 120 },
  // candidate « sous la lisse »: very low beyond the hero boom, looking back up at the car's face through it
  under: { ...P, tx: 40, ty: 110, tz: -250, d: 520, az: 172, el: -6, fov: 50, shift: 120 },
  // candidate « cabine »: from the TGV's side, at its cab's height, 40 m up voie 2, looking down the track at the car
  cab: { ...P, tx: 0, ty: 80, tz: V2, d: 4200, az: 92, el: 4, fov: 30, shift: 140 },
  // « dans ton dos »: ahead of the car, looking back past it at the entry boom coming down
  behind: { ...P, tx: 100, ty: 110, tz: 800, d: 1900, az: 168, el: 9, fov: 34, shift: 140 },
  // « devant ton capot… la deuxième »: over your shoulder, the hood and the hero boom beyond it
  over: { ...P, tx: 60, ty: 100, tz: HZ, d: 620, az: 14, el: 16, fov: 40, shift: 130 },
  // where act 1 ends: the hero signal whole, from the car's left, a little above — act 2 cuts to the bench from it
  system: { ...P, tx: HX - 170, ty: 150, tz: HZ, d: 1050, az: -38, el: 14, fov: 32, shift: 140 },
  // the crossing from above as a maquette (« repos »: the car hidden): the four booms, both tracks, the TGV coming
  top: { ...P, tx: -175, ty: 0, tz: ZPN, d: 5200, az: -24, el: 68, fov: 40, shift: 120 },
  // « le phare du train grossit »: low on voie 2 at the road, looking up the track (+x) at the headlamps
  rail: { ...P, tx: 4000, ty: 90, tz: V2, d: 3600, az: -90, el: 0.5, fov: 30, shift: 120 },
  // the climax: low, in front, 3/4 — the hood pushing the boom
  push: { ...P, tx: 60, ty: 80, tz: -380, d: 620, az: 140, el: 5, fov: 36, shift: 150 },
  // « tes roues quittent les rails »: low at the car's left, the wheels over voie 2 (gap −6.8: voie 2 at z = +470)
  wheels: { ...P, ...CLOSE, tx: -80, ty: 34, tz: 143, d: 380, az: -120, el: 4, fov: 34, shift: 60 },
  // « derrière toi… le train passe » (gap −6.8): ahead of the car, low, looking back: the TGV crossing behind it
  pass: { ...P, tx: 0, ty: 150, tz: 470 + 100 * (GAP_OUT - GAP_STUCK) * 0, d: 1700, az: 172, el: 5, fov: 36, shift: 130 },
  // the phone and the signboard on our verge, behind the entry boom (the car stuck: crossing at z = +300)
  phone: { ...P, ...CLOSE, tx: PHONE.at[0], ty: 110, tz: ZPN + PHONE.at[2] + 80, d: 520, az: -55, el: 8, fov: 32, shift: 130 },
  /* ── on the bench (the hero's foot at the origin) ── */
  whole: { ...P, tx: -70, ty: 165, tz: 0, d: 850, az: -38, el: 12, fov: 32, shift: 40 },
  // the exploded view, in ONE vertical frame (fs SIZE)
  exploded: { ...P, tx: -130, ty: 195, tz: 0, d: 1050, az: -38, el: 14, fov: 32, shift: 40 },
  lampBench: { ...P, ...CLOSE, tx: 0, ty: R24.y + 8, tz: 0, d: 300, az: -30, el: 6, fov: 30, shift: 60 },
  bellBench: { ...P, ...CLOSE, tx: 0, ty: BELL.y + 12, tz: 0, d: 240, az: -30, el: 10, fov: 30, shift: 60 },
  boomBench: { ...P, tx: -200, ty: 116, tz: 0, d: 900, az: -22, el: 12, fov: 30, shift: 60 },
};

/** What a cut to the bench sets, whatever came before: the hero alone, at rest, boom down, nothing lit. `clock`
 *  keeps its value (the header goes on reading the story). */
export const BENCHED = {
  shell: 0, you: 0, people: 0, file: 0, beam: 0, other: 0, ruler: 0, phone: 0,
  downIn: 1, downOut: 1, give: 0, flash: 0, ring: 0, shine: 0, explode: 0, sweep: 0,
  litLamp: 0, litBell: 0, litBar: 0, litBoom: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: -170, fy: 150, fz: 0, fs: SIZE,
};
/** What a cut to the road sets: night, the car stuck on voie 2 and alive, you at the wheel, all four booms down,
 *  the R24s and the bells on, the queue there. `train`, `beam`, `clock` are the act's. */
export const STAGED = {
  shell: 1, gap: GAP_STUCK, kmh: 0, wet: 0.25, you: 1, car: 1, alive: 1, people: 0,
  other: 0, ruler: 0, file: 1, phone: 0,
  downIn: 1, downOut: 1, give: 0, flash: 1, ring: 1, shine: 0.6, explode: 0, sweep: 0,
  litLamp: 0, litBell: 0, litBar: 0, litBoom: 0,
  mood: 1, gel: 0, fx: 0, fy: 60, fz: 0, fs: 900,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const passage = buildPassage();
  const signals = {};
  for (const k of Object.keys(SIGNALS)) {
    signals[k] = buildSignal({ hero: k === HERO });
    passage.mounts[k].add(signals[k].root);
  }
  const hero = signals[HERO];
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group(); // the hero's foot on the bench: the origin
  bench.group.add(benchMount);
  scene.add(passage.group, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    passage, signals, hero, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      passage.group.visible = !onBench;
      const home = onBench ? benchMount : passage.mounts[HERO];
      if (hero.root.parent !== home) home.add(hero.root);
      if (!onBench) {
        passage.update({
          shell: S.shell, gap: S.gap, kmh: S.kmh, rolled: S.rolled, wet: S.wet, you: S.you, car: S.car, alive: S.alive,
          people: S.people, train: S.train, beam: S.beam, other: S.other, ruler: S.ruler, file: S.file, phone: S.phone,
        }, time, px);
      }
      for (const [k, sig] of Object.entries(signals)) {
        const isHero = sig === hero;
        if (onBench && !isHero) continue;
        sig.update({
          down: SIGNALS[k].pair === "in" ? S.downIn : S.downOut,
          give: isHero ? S.give : 0,
          flash: S.flash, ring: S.ring, shine: isHero ? S.shine : 0.4 * S.shine,
          explode: onBench ? S.explode : 0, sweep: onBench ? S.sweep : 0,
          litLamp: isHero ? S.litLamp : 0, litBell: isHero ? S.litBell : 0, litBar: isHero ? S.litBar : 0, litBoom: isHero ? S.litBoom : 0,
          bench: onBench ? 1 : 0,
        }, time, px);
      }
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00011;
    },
  };
}

export { CAR, ROAD, TRACKS, BARRIER, SIGNALS, HERO, SYSTEM, GAP_STUCK, GAP_OUT, BENCHAT, FILE, TRAIN, PHONE };
