// DOSSIER 048 — Tunnelier : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, sol.js, rue.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The SECTION: a Paris street at night cut open down to the machine — rue.js (the road in section, the
// six-storey building, 011's car of glass, the settlement gauge, the town from above, the sky) over sol.js (the soil
// and its water, the tunnel already lined, the face, the column that loosens), all X-ray; and solid in all that
// glass, the only thing that matters: the FRONT of the tunnel boring machine (model.js) — its cutterhead, the
// chamber full of earth, the bulkhead and its manometer, the screw, the thrust rams and the last ring. The BENCH:
// that same machine alone on its pool of light. ONE object, re-parented: the cut from one to the other matches on it.
// Three colours. signal is the threat: the soil's push (red arrows), the face that slides, the column that loosens,
// the road's trough, the gauge past its red band, the needle out of its green band. veille is the system alive: the
// chamber's push (green arrows), the needle in its band, the ring's segments, the part the voice names. ink: the rest.
//
// THE STORY (docs/faits/048-tunnelier.md; the scene is a SCENARIO, `sources` says so): at night, a tunnel boring
// machine of the Grand Paris Express 11 m under a street. The pressure in its chamber drops: the face slides, the
// street sinks — 2, 5, 7 millimetres; the screw slows, the rams push, the chamber fills, the pressure comes back: it
// stops at 8. NEVER a collapse, never centimetres: the road moves by its TRUE millimetres (invisible) and what reads is
// the trough's glow and the gauge, magnified ×50. NEVER a pressure value on screen, never a contractual threshold.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { TBM, BENCH_FROM, SYSTEM, GROUND, STREET, BUILDING, BEDROOM, TROUGH, RULER, SKY } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildGround } from "./sol.js";
import { buildStreet } from "./rue.js";

export const SET = { BENCH: 0, SECTION: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** On the bench the machine stands with BENCH_FROM on the bench's origin: benchCut's `origin`. */
export { BENCH_FROM };
/** The header's second readout: how the chamber's pressure stands against the soil's (`press`): a word, never a figure. */
export const pressWord = (p) => (Math.abs(p - 1) < 0.08 ? "Équilibre" : p < 1 ? "En chute" : "Trop forte");

const AY = TBM.axisY;
const [CX, CY, CZ] = SYSTEM.centre;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE): the manometer, the face, the gauge, a ring's segment
 *  `air`    off: the section is a dark X-ray, there is no light hanging in it worth a pass
 *  `finish` the solids' surface (the machine): machining grain and handling marks — full screen only */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// THE FIRST FRAME (« Ta rue s'enfonce. ») — PROVISIONAL (candidate A « plongée du 5e », set on the stubs): from above the
// near sidewalk, a fifth-floor height, looking steeply down through the glass street into the ground — the car of glass
// near and big (upper left), the trough glowing under its wheels, the loosened column, the cutterhead far below
// turning in the soil that slides. The planche of four candidates (docs/048-actes.md) chooses it, and it is pasted
// here before the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: -250, ty: -700, tz: 0, d: 2663, az: -30, el: 55.7, fov: 56, shift: 80, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SECTION,
  /* ── the street (rue.js) ── */
  street: 1, //   the X-ray of the street, the building and the car (0–1)
  carX: -400, //   cm along x where the car's centre stands; it drives toward −x (tween it with ease "none")
  settle: 1, //   mm of settlement at the trough's deepest point (0 → 8 sinks; < 0 heaves): the header's big readout
  ruler: 1, //    the settlement gauge on the kerb, magnified ×50 (0–1)
  lights: 1, //   the building's windows at night (0–1)
  sleeper: 0, //  the bedroom on the 2nd floor and the one asleep in it (0–1)
  town: 0, //     the neighbourhood from above (0–1)
  trace: 0, //    the tunnel's trace under the town (0–1)
  sat: 0, //      the satellite crossing the sky (0 hidden → 1 its whole way)
  /* ── the ground (sol.js) ── */
  soil: 1, //     the X-ray of the soil block (0–1)
  face: 0.4, //   the face at the head: 0 stands · → 1 slides toward the head in blocks · → −1 pushed back
  loose: 0.5, //  the column that loosens above the face, signal (0–1) — never a void
  water: 1, //    the water table (0–1)
  depth: 0, //    the depth scale, a tick every 10 m (0–1)
  tunnel: 1, //   the tunnel already lined behind the machine (0–1)
  /* ── the system (model.js) ── */
  explode: 0, //  on the bench: 0 assembled → 1 its parts apart in a diagonal row
  wheel: 0, //    the cutterhead's turns (cumulative, ease "none")
  screw: 0, //    the screw's turns (cumulative, ease "none")
  earth: 0.7, //  the chamber's earth: 1 full and pressed → 0.6 voids under the crown → 0.2 nearly empty
  press: 0.6, //  the chamber's pressure against the soil's: 1 balance · < 1 drops · > 1 too strong (the header's word, the needle)
  rams: 0.4, //   the thrust rams' stroke (0 → 1)
  ring: 0, //     the last ring's segments lit veille, one by one (0 → 7)
  cutaway: 1, //  0 the shield whole → 1 its near half cut away (the inside reads)
  arrows: 0, //   the soil's push on the face: red arrows from the soil and the water (0 hidden → 1 shown)
  hold: 0, //     the chamber's push: green arrows from the chamber, their length (0 none → 1 they meet the red ones → 1.4 too strong)
  solo: 0, //     the heart alone: all but the chamber, the bulkhead and its manometer fade to a ghost (0–1)
  cote: 0, //     the dimension line across the cutterhead (0–1)
  litHead: 0, litChamber: 0, litBulk: 0, litScrew: 0, litRams: 0, // the part the voice names, faintly veille
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: -250, fy: -800, fz: 0, fs: 1800, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL, set on the STUBS:
 *  the builders give better ones in their journals (docs/journal/048-model.md, 048-sol.md, 048-rue.md).
 *  Section poses are in plan.js coordinates; bench poses in the bench's (plan point p sits at p − BENCH_FROM). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const B = (x, y, z) => [x - BENCH_FROM[0], y - BENCH_FROM[1], z - BENCH_FROM[2]];
const [BHX, BHY] = B(40, AY, 0);
const [BGX, BGY, BGZ] = B(...TBM.bulkhead.gauge);
export const VIEW = {
  hook: POSE0,
  /* ── the section ── */
  // the whole section, from the roof of the building down to the machine's invert: « Au-dessus… un immeuble… »
  section: { ...P, tx: 0, ty: 100, tz: 0, d: 7600, az: -22, el: 6, fov: 34, shift: 40 },
  // the street at the gauge, low on the near sidewalk: the car, the kerb, the gauge's staff (« Ta rue ne supporte… »)
  kerb: { ...P, ...CLOSE, tx: RULER.at[0], ty: 40, tz: RULER.at[2], d: 420, az: -38, el: 4, fov: 30, shift: 120 },
  // the face and the cutterhead from the front-left, in the soil (« Devant la roue, la terre s'écroule »)
  face: { ...P, tx: -60, ty: AY + 120, tz: 0, d: 2300, az: -58, el: 8, fov: 30, shift: 120 },
  // the machine in profile, its near half cut away: the head, the chamber, the bulkhead, the screw, the rams, the ring
  profile: { ...P, tx: 560, ty: AY, tz: 0, d: 3600, az: -8, el: 4, fov: 30, shift: 60 },
  // the chamber close, the manometer on its bracket (« Et au cœur… la pression », in the section)
  gauge: { ...P, ...CLOSE, tx: TBM.bulkhead.gauge[0], ty: TBM.bulkhead.gauge[1], tz: TBM.bulkhead.gauge[2], d: 380, az: -24, el: 8, shift: 120 },
  // the principle in section: the face between the soil's red arrows and the chamber's green ones, the depth scale aside
  principle: { ...P, tx: -300, ty: AY + 300, tz: 0, d: 3000, az: -6, el: 4, fov: 30, shift: 80 },
  // rear-left three quarters: the rams on the last ring, its seven segments, the screw's outlet (repos)
  rear: { ...P, tx: 1000, ty: AY, tz: 0, d: 2400, az: 55, el: 12, fov: 32, shift: 100 },
  // the front of the building from the street, the bedroom's window (like)
  bedroom: { ...P, tx: BEDROOM.window[0], ty: 660, tz: -1000, d: 850, az: -10, el: 10, fov: 34, shift: 0 },
  // the town from above, the tunnel's trace dashed under it (comment)
  town: { ...P, tx: 0, ty: 0, tz: 0, d: 26000, az: -30, el: 58, fov: 40, shift: 60 },
  // the night sky from the street, the satellite crossing it (abo)
  sky: { ...P, tx: -433, ty: 2566, tz: -244, d: 3000, az: -15, el: -53, fov: 50, shift: 0 },
  /* ── on the bench ── */
  // the machine whole, three quarters front-left on its halo (« Alors… on l'ouvre »)
  whole: { ...P, tx: 0, ty: 520, tz: 0, d: 5200, az: -48, el: 14, fov: 30, shift: 120 },
  // the exploded view: a diagonal row along +x, read from the front-left (head nearest)
  exploded: { ...P, tx: 250, ty: 650, tz: 0, d: 7400, az: -62, el: 16, fov: 30, shift: 120 },
  // the cutterhead close, its dimension line (« Sa roue : presque dix mètres »)
  headBench: { ...P, ...CLOSE, tx: BHX - 520, ty: BHY, tz: 0, d: 2400, az: -70, el: 10, shift: 100 },
  // the manometer on the bench, close (« au cœur… la pression »)
  gaugeBench: { ...P, ...CLOSE, tx: BGX, ty: BGY, tz: BGZ, d: 360, az: -24, el: 8, shift: 120 },
};

/** What a cut to the bench sets, whatever came before: the machine whole, at rest, in balance, nothing lit. The
 *  street's and the ground's numbers keep their story values except `settle` (the header reads 0 mm on the bench:
 *  the autopsy is before the drop) and `press` (balance). */
export const BENCHED = {
  explode: 0, earth: 1, press: 1, rams: 0, ring: 0, cutaway: 0, arrows: 0, hold: 0, solo: 0, cote: 0,
  litHead: 0, litChamber: 0, litBulk: 0, litScrew: 0, litRams: 0, settle: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: CX - BENCH_FROM[0], fy: CY - BENCH_FROM[1], fz: CZ - BENCH_FROM[2], fs: SIZE,
};
/** What a cut back to the section sets: night, the street and the soil as X-ray, the machine cut away, in balance,
 *  the chamber full, the face standing, nothing loosened, no settlement. The car's place and the turns are the act's. */
export const STAGED = {
  street: 1, settle: 0, ruler: 1, lights: 1, sleeper: 0, town: 0, trace: 0, sat: 0,
  soil: 1, face: 0, loose: 0, water: 1, depth: 0, tunnel: 1,
  explode: 0, earth: 1, press: 1, rams: 0, ring: 0, cutaway: 1, arrows: 0, hold: 0, solo: 0, cote: 0,
  litHead: 0, litChamber: 0, litBulk: 0, litScrew: 0, litRams: 0,
  mood: 1, gel: 0, fx: 0, fy: AY + 300, fz: 0, fs: 1600,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const ground = buildGround();
  const street = buildStreet();
  const set = new THREE.Group();
  const mount = new THREE.Group(); // where the machine stands in the section: plan.js coordinates, the origin
  set.add(street.group, ground.group, mount);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group();
  benchMount.position.set(-BENCH_FROM[0], -BENCH_FROM[1], -BENCH_FROM[2]);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    system, ground, street, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : mount;
      if (system.root.parent !== home) home.add(system.root);
      system.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, wheel: S.wheel, screw: S.screw, earth: S.earth, press: S.press,
        rams: S.rams, ring: S.ring, cutaway: onBench ? Math.min(S.cutaway, 1) : S.cutaway, arrows: S.arrows, hold: S.hold, solo: S.solo, cote: S.cote,
        litHead: S.litHead, litChamber: S.litChamber, litBulk: S.litBulk, litScrew: S.litScrew, litRams: S.litRams,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        street.update({
          street: S.street, carX: S.carX, settle: S.settle, ruler: S.ruler, lights: S.lights, sleeper: S.sleeper,
          town: S.town, trace: S.trace, sat: S.sat,
        }, time, px);
        ground.update({ soil: S.soil, face: S.face, loose: S.loose, water: S.water, depth: S.depth, tunnel: S.tunnel, rams: S.rams }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.000012;
    },
  };
}

export { TBM, GROUND, STREET, BUILDING, BEDROOM, TROUGH, RULER, SKY };
