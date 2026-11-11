// DOSSIER 041 — Le bouclier de l'ISS : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by whipple.js and station.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two new files and one reused, ONE place (no re-parenting): the SYSTEM, solid, with what hits it (whipple.js: the
// coupon of stuffed Whipple shield on the lab's +z flank, the bille, the impact, the counter-example plate); AROUND,
// X-ray (station.js: the ISS, the sleeper and the crew, the capsules, the dodge, Kosmos 1408 far away, the next file's
// tank); the EARTH (026's dome, imported as it is, at 400 km). The BENCH is the same place with the station and the Earth
// gone and a pool of light under the coupon: a cut to the bench is IN PLACE (the coupon does not move).
// Three colours. signal is the threat: the bille, the cloud of fragments, the heat, the crater, the baseball-size debris,
// the Kosmos cloud. veille is the system alive: the layer the voice names, the shield on the station, the wall that held.
// ink is the rest: the station's glass, the crew, the Earth, the gauges, the ghost bullet.
//
// THE STORY (docs/faits/041-bouclier-iss.md; a reconstitution — no impact of this size is dated, `sources` says so):
// a 1 cm debris, too small to be tracked, comes at 10 km/s at the lab where you sleep; it hits the 2 mm bumper, is broken
// into a cloud (fragments and drops of molten metal, never « vaporised »), the cloud spreads through 10 cm of empty gap,
// the Nextel/Kevlar blanket breaks it again, the rear wall takes a rain, bulges a hair, holds. Bigger debris (≥ 10 cm,
// tracked) are dodged; 15/11/2021 the seven took shelter in Dragon and Soyuz. The shield stops ≈ 1 cm, no more.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { ORBIT, LAYERS, COUPON, BILLE, MIRROR, HERO, SLEEPER, DRAGON, SOYUZ, PROGRESS, TRUSS, DODGE, KOSMOS, TEASER, SYSTEM, BENCH } from "./plan.js";
import { buildWhipple } from "./whipple.js";
import { buildStation } from "./station.js";
import { buildSky } from "../../026-soyouz-ms10/src/sky.js"; // the Earth from orbit: 026's dome (docs/catalogue.md), at ORBIT.alt

export const SET = { BENCH: 0, ORBIT: 1 };
/** ≈ the radius of the coupon and its mirror plate: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
const [CX, CY, CZ] = SYSTEM.centre;
const [HX, HY, HZ] = HERO.centre;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the bille, the layers in profile, the gap, the impact
 *  `air`    off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts (the coupon): machining grain and handling marks that break the reflections
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Un débris fonce sur ta tête » : under the lab, low and three-quarter, the Earth's limb
// at the bottom of the frame; through the hull's glass the sleeper in his bag along the wall; outside, the bumper a
// hand's breadth off the hull; the bille's white-hot light crossing the frame toward the wall at his head, its trail
// behind it. PROVISIONAL (candidate a, set on bouchons): the planche of four candidates (docs/041-actes.md) chooses it,
// and it is pasted here before the acts are staged.
export const POSE0 = { tx: 70, ty: -20, tz: -60, d: 520, az: -30, el: -10, fov: 44, shift: -40, side: 0, roll: 0, drift: 0, dof: 0 }; // image 0 (planche .cache/planches/041/image0e.jpg q2) : toi dans ton sac, la tôle veille contre ta tête, la bille qui file du fond à droite

export const FIRST = {
  set: SET.ORBIT,
  /* ── around (station.js) ── */
  shell: 1, //     the station, X-ray: glass and fine lines (0–1; forced to 0 on the bench)
  you: 1, //       the sleeper in his bag, « toi » (0–1)
  cabin: 0.4, //     the cabin's air, a pale ink glow inside the lab (« derrière ta paroi, ton air ») (0–1)
  shield: 0, //    the bumpers over every module, veille lines (« il attend ») (0–1)
  ram: 0, //       the front ones drawn thicker (« plus épais à l'avant ») (0–1)
  crew: 0, //      the six others, at their posts (0–1)
  shelter: 0, //   the seven float to Dragon (4) and Soyuz (3); at 1 inside, hatches shut (0–1)
  capsules: 0, //  Dragon and Soyuz picked out (0–1)
  burn: 0, //      Progress's engines at the back (0–1)
  dodge: 0, //     the whole station pushed aside (+y, DODGE.dy at 1) — the coupon goes with it
  flyby: 0, //     the baseball-size debris of the chute: 0 far ahead → 1 gone by, under the station
  kosmos: 0, //    far away: 0 nothing · 0.1 the satellite · 0.3 hit · → 1 its cloud spread along its orbit
  teaser: 0, //    the next file (042): a tank under seals, its roof outlined (0–1)
  flown: 0, //     km along the orbit: what slides on the Earth (« la Terre qui défile »)
  /* ── the system and what hits it (whipple.js) ── */
  explode: 0, //   0 assembled → 1 the layers apart along the bille's path (outward, +z)
  litBumper: 0.6, litGap: 0, litBlanket: 0, litWall: 0, // the part the voice names glows faintly veille
  bille: 1, //     the bille shown (0–1)
  dist: 100, //    cm left before contact (0 = contact): main.js turns it into the countdown at 10 km/s
  trail: 1, //     its streak (0 the ball alone, frozen · 1 a long streak)
  scan: 0, //      a radar sweep passes over it without catching it (0 → 1)
  bullet: 0, //    the rifle bullet left behind, ghost (0–1)
  gauge1: 0, //    « un centimètre » against the bille (0–1)
  big: 0, //       the baseball-size one beside it, signal (0–1)
  burst: 0, //     the impact: 0 · 0.1 flash, contact · 0.3 bumper holed, the cloud born · 0.7 spread across the gap · 0.85 the
  //               blanket breaks it again · 1 a rain on the wall, which bulges a hair and holds
  shock: 0, //     the shock ring running through the bumper (0 → 1 once)
  molten: 0, //    how many of the fragments glow as drops of molten metal (0–1)
  gauge10: 0, //   « dix centimètres » along the gap (0–1)
  mirror: 0, //    the counter-example: one plate of the same metal, beside (0–1)
  pierce: 0, //    its twin bille: 0 far · 0.4 contact · → 1 a single point dug through
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 0, fy: 0, fz: -224, fs: 520, mood: 1, gel: 0, pool: 0, grid: 0,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). THE CAMERA TURNS ONE WAY: in every
 *  path, az DECREASES (the order below follows the film: −62 → −80 → −92 → −130 | cut −46 → −62 → −70 → −78 | cut −84 →
 *  −90 | cut −40 → −72 → −84 | cut −48 → −62 → −130 | −40 → −64 | −72 → −86 | −30 → −44 | cut −50 → −62 = POSE0).
 *  Starting points, set on BOUCHONS: the builders give better ones in their journals (docs/journal/041-whipple.md, 041-station.md). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
export const VIEW = {
  hook: POSE0,
  /* ── the candidates of the first frame (docs/041-actes.md) ── */
  // b: in the cabin, low behind the sleeper's head, looking out past the coupon: through the hull's glass the bille coming
  cabinHead: { ...P, tx: 0, ty: 10, tz: 60, d: 260, az: -128, el: -6, fov: 46, shift: -20 },
  // c: the lab and Harmony from below-front, the Earth's limb under them, the bille's trail a long line into the lab
  labLow: { ...P, tx: -300, ty: 60, tz: -100, d: 3600, az: -66, el: -6, fov: 40, shift: -80 },
  // d: the whole ISS from below and in front, the bille's trail a fine line converging on the lab
  issLow: { ...P, tx: 400, ty: 200, tz: -224, d: 23000, az: -55, el: -10, fov: 40, shift: 0 },
  /* ── the orbit (true size, one place) ── */
  // « Devant ta coque, une tôle… » : the layers in profile, the bille at the frame's edge
  profile: { ...P, ...CLOSE, tx: 0, ty: 0, tz: -5, d: 52, az: -80, el: 5, fov: 32, shift: 0 },
  // « Un centimètre » : the bille close, its gauge
  billeClose: { ...P, ...CLOSE, tx: -1.6, ty: 1, tz: 41, d: 22, az: -92, el: 8, fov: 30, shift: 0 },
  // « ton air… tu dors » : inside the lab, the sleeper in his bag along the wall
  cabin: { ...P, tx: 70, ty: -8, tz: -60, d: 330, az: -130, el: 14, fov: 40, shift: 0 },
  // « Tout repose sur cette tôle » : the bumper alone, big, three-quarter (the bench cut is in place from here)
  tole: { ...P, ...CLOSE, tx: 0, ty: 0, tz: -4, d: 78, az: -46, el: 12, fov: 30, shift: 40 },
  // the lab whole, three-quarter (« derrière ta paroi »)
  lab: { ...P, tx: 0, ty: 0, tz: HZ, d: 1500, az: -56, el: 14, fov: 34, shift: 40 },
  // the station whole, from below-front, the Earth's limb low (« il attend », the dodge)
  whole: { ...P, tx: 400, ty: 200, tz: HZ, d: 26000, az: -40, el: 16, fov: 34, shift: 60 },
  // its front: Harmony, Dragon, the thicker shield (« plus épais à l'avant »)
  front: { ...P, tx: -1300, ty: 0, tz: HZ, d: 4600, az: -72, el: 12, fov: 34, shift: 40 },
  // Act 3's contact: the bille on the bumper, three-quarter, close
  contact: { ...P, ...CLOSE, tx: 0, ty: 0, tz: 1, d: 40, az: -48, el: 6, fov: 32, shift: 0 },
  // the cloud in the gap, three-quarter, the cut layers readable
  cone: { ...P, ...CLOSE, tx: 0, ty: 0, tz: -6, d: 50, az: -90, el: 8, fov: 32, shift: 0 },
  // the capsules of 15/11/2021 and the crew going to them
  shelter: { ...P, tx: -1400, ty: -50, tz: HZ, d: 2600, az: -40, el: -18, fov: 40, shift: 0 },
  shelterSoyuz: { ...P, tx: 1700, ty: -350, tz: HZ, d: 2600, az: -40, el: -18, fov: 40, shift: 0 },
  kosmos: { ...P, tx: 2000, ty: 300, tz: HZ, d: 9000, az: 112, el: 6, fov: 34, shift: -300 },
  /* ── on the bench (the same place, the station and the Earth gone) ── */
  system: { ...P, tx: 0, ty: 0, tz: -6, d: 125, az: -62, el: 16, fov: 30, shift: 30 },
  exploded: { ...P, tx: 0, ty: 0, tz: 10, d: 150, az: -70, el: 18, fov: 32, shift: 60 },
  gap: { ...P, ...CLOSE, tx: 0, ty: -5, tz: -5.5, d: 52, az: -90, el: 8, fov: 30, shift: 0 },
  // the coupon and the mirror plate side by side (« pourquoi du vide ? », the like)
  pair: { ...P, tx: 0, ty: 25, tz: -4, d: 190, az: -89, el: 8, fov: 30, shift: 0 },
  // the next file, far away on its own floor (seen on the bench set)
  teaser: { ...P, tx: TEASER.at[0], ty: TEASER.at[1] + 120, tz: TEASER.at[2], d: 2000, az: -30, el: 18, fov: 34, shift: -60 },
};

/** What a cut to the bench sets, whatever came before: the coupon whole, at rest, nothing flying, nobody. */
export const BENCHED = {
  set: SET.BENCH, shell: 0, you: 0, cabin: 0, shield: 0, ram: 0, crew: 0, shelter: 0, capsules: 0, burn: 0, dodge: 0, flyby: 0,
  kosmos: 0, teaser: 0,
  explode: 0, litBumper: 0, litGap: 0, litBlanket: 0, litWall: 0, bille: 0, dist: 40, trail: 0, scan: 0, bullet: 0, gauge1: 0,
  big: 0, burst: 0, shock: 0, molten: 0, gauge10: 0, mirror: 0, pierce: 0,
  mood: 0, gel: 0, pool: 0.25, grid: 0.16, fx: CX, fy: CY, fz: CZ, fs: SIZE,
};
/** What a cut to the orbit sets: the station, you asleep, the bille close and coming, nothing yet broken.
 *  The act says where the bille is (`dist`) and what the light stands around. */
export const STAGED = {
  set: SET.ORBIT, shell: 1, you: 1, cabin: 0, shield: 0, ram: 0, crew: 0, shelter: 0, capsules: 0, burn: 0, dodge: 0, flyby: 0,
  kosmos: 0, teaser: 0,
  explode: 0, litBumper: 0, litGap: 0, litBlanket: 0, litWall: 0, bille: 1, dist: 20, trail: 0.6, scan: 0, bullet: 0, gauge1: 0,
  big: 0, burst: 0, shock: 0, molten: 0, gauge10: 0, mirror: 0, pierce: 0,
  mood: 1, gel: 0, pool: 0, grid: 0, fx: 0, fy: 0, fz: -6, fs: 40,
};
/** The light's stand-points, ready to spread into a `st`: on the coupon, on the lab, on the whole station. */
export const LIGHT = {
  coupon: { fx: 0, fy: 0, fz: -6, fs: 40 },
  lab: { fx: HX, fy: HY, fz: HZ, fs: 520 },
  station: { fx: 400, fy: 200, fz: HZ, fs: 6000 },
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildWhipple();
  const station = buildStation();
  const sky = buildSky();
  const bench = makeBench(SIZE);
  bench.group.position.y = BENCH.floor; // under the coupon: the cut to the bench is in place
  scene.add(sky.group, station.group, system.root, bench.group);
  stage.grade.gel.set(0xff5b2e);
  const SKY = { alt: ORBIT.alt, pitch: 0, flown: 0, airspeed: 0, heat: 0, chute: 0, retro: 0, truck: 0 };

  return {
    system, station, sky, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      const eye = stage.camera.position;
      bench.group.visible = onBench;
      sky.group.visible = !onBench;
      SKY.flown = S.flown;
      if (!onBench) sky.update(SKY, time, px);
      station.update({
        shell: S.shell, you: S.you, cabin: S.cabin, shield: S.shield, ram: S.ram, crew: S.crew, shelter: S.shelter,
        capsules: S.capsules, burn: S.burn, dodge: S.dodge, flyby: S.flyby, kosmos: S.kosmos, teaser: S.teaser, flown: S.flown,
        bench: onBench ? 1 : 0,
      }, time, px, eye);
      system.root.position.y = DODGE.dy * S.dodge; // the coupon is the lab's wall: it goes where the station goes
      system.update({
        explode: S.explode, litBumper: S.litBumper, litGap: S.litGap, litBlanket: S.litBlanket, litWall: S.litWall,
        bille: S.bille, dist: S.dist, trail: S.trail, scan: S.scan, bullet: S.bullet, gauge1: S.gauge1, big: S.big,
        burst: S.burst, shock: S.shock, molten: S.molten, gauge10: S.gauge10, mirror: S.mirror, pierce: S.pierce,
        bench: onBench ? 1 : 0,
      }, time, px, eye);
      if (onBench) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.000004; // space: nothing to eat the far station (exp2 at 26 000 cm ≈ 0.99)
    },
  };
}

export { ORBIT, LAYERS, COUPON, BILLE, MIRROR, HERO, SLEEPER, DRAGON, SOYUZ, PROGRESS, TRUSS, DODGE, KOSMOS, TEASER, SYSTEM, BENCH };
