// DOSSIER 052 — Télésiège débrayable : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, gare.js, ligne.js): the path of a chair (pathAt), the speeds
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two sets. The STATION: a detachable chairlift's station at night, X-ray (gare.js: the housing, the quay, and solid
// inside them the cable round the bullwheel, the came, the tyre rows, the weighing) and the line out of it (ligne.js:
// the chairs of glass, you, the cable up the towers, the ground that drops into a hollow past the mouth, the crests);
// solid on the hero chair, the only thing that matters: ITS GRIP (model.js) — the came's roller, the lever, the two
// jaws, the spring. The BENCH: that same grip alone on its pool of light. ONE object, re-parented: the cut from one
// to the other matches on it.
// Three colours. signal is the threat: the spring that closes weak, the gauge in its red band, the cable that would
// not stop, the comment's red arrow. veille is the system alive: the part the voice names, the chair's speed arrow,
// the grips that leave well gripped, the comment's green arrow. ink: the rest.
//
// THE STORY (docs/faits/052-telesiege.md; the scene is a SCENARIO, `sources` says so): you board a detachable chair.
// In the station your chair has let go of the cable (the came holds its grip open); the cable never stops. The tyres
// launch the chair to the cable's speed, the came stops, the spring closes the grip… badly. The weighing reads it:
// too weak. The cable that never stops… stops; your chair will not leave the station; it is isolated. NEVER an
// accident on screen, never a chair sliding down the line, never a clamping figure (it depends on the grip), and the
// weighing is never shown infallible (no absolute green verdict: docs/faits/052-contre-verification.md).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { AT, BENCH_LIFT, GRIP_SIZE, STATION, WEIGH, BULLWHEEL, CABLE, CABLE_Y, FREE, SIDE, GARAGE, TYRES, STEEP_X, sLine, sDeparture, groundAt } from "./plan.js";
import { buildGrip } from "./model.js";
import { buildStation } from "./gare.js";
import { buildLine } from "./ligne.js";

export const SET = { BENCH: 0, STATION: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = GRIP_SIZE;
/** Where the grip stands on the bench (its cable axis): benchCut's `origin` is the grip mount in the scene. */
export const BENCH_AT = [0, BENCH_LIFT, 0];
/** The cable's speed, cm/s (5 m/s): `rope` grows by it, ease "none", while it runs. ROPE(t0, t1) = the cm it runs. */
export const ROPE_V = CABLE.speed;
/** The chair's abscissae the acts aim at (plan.js AT), and the steepest span's chair on the departure line. */
export const AT_S = { ...AT, steep: sLine(STEEP_X) };

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens on the CLOSE-UPS only (the poses that spread CLOSE): the jaws, the roller on the came, the spring
 *  `air`    off: a dark X-ray at night, no light hanging in it worth a pass
 *  `finish` the solids' surface (the grip): machining grain and handling marks — full screen only */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// THE FIRST FRAME (« Ton siège lâche le câble. ») — PROVISIONAL (candidate A « contre-plongée du quai », set on the
// stubs): low in the station, between the two rails, looking up the arrival side toward the mouth: a four-seat chair
// coming in off the line big in the frame, its roller onto the came, its grip opening and dropping off the cable that
// runs on; through the mouth, the line climbing into the night and the next chair coming down it. The planche of four
// candidates (docs/052-actes.md) chooses it; it is pasted here before the acts are staged. Sharp (dof 0).
export const POSE0 = { tx: 1300, ty: 270, tz: -260, d: 520, az: -115, el: -14, fov: 46, shift: 20, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.STATION,
  /* ── the station (gare.js) ── */
  station: 1, //  the X-ray of the housing and the quay (0–1)
  rope: 0, //     cm the cable has run (cumulative, ease "none", ROPE_V a second while it runs; it stops ONCE, at « s'arrête »)
  arrows: 0, //   the principle's two speed arrows over the hero's grip (0–1)
  vchair: 1, //   the chair's arrow, a share of the cable's (0.2 at the quay → 1)
  weigh: 0, //    the weighing works: its came bends a hair, its gauge lights (0–1)
  force: 0.9, //  the measured clamp, a share of full force: the gauge (under WEIGH.ok: its red band). No figure.
  iso: 0, //      the side track's points thrown, the hero chair on it (0–1)
  litCame: 0, litTyres: 0, litWeigh: 0, // the part the voice names, faintly veille
  /* ── the chairs and the line (ligne.js) ── */
  line: 0.3, //   the X-ray of the ground (0.3 inside the station, 1 from the mouth: habillage), the towers, the line's chairs (0–1)
  chair: AT.hook, // the hero chair's abscissa (plan.js PATH; AT for the story's places). Ease it on the tyres' gradient.
  free: 0.6, //   the hero grip off the cable: 0 on it → 1 FREE cm under it (the hook's gap)
  others: 1, //   the other chairs in the station (0–1)
  rider: 1, //    you, of glass, on the hero chair (0–1) …
  sit: 0.7, //      … standing at the quay's edge 0 → seated 1
  sway: 0.5, //     every chair swings on its grip (the stop) (0–1)
  pull: 0, //     the comment's arrows, red down the cable / green up twice as long (0–1)
  greens: 0, //   the line's grips lit veille (the like) (0–1)
  /* ── the system (model.js) ── */
  explode: 0, //  on the bench: 0 assembled → 1 the parts apart
  open: 1, //     the grip: 0 closed on the cable → 1 open (roller pressed, lever swung, mobile jaw away, spring compressed)
  weak: 1, //     the spring's weakness, signal (0–1): « … mal »
  litLever: 0, litRoller: 0, litJaws: 0, litSpring: 0, // the part the voice names; the spring is the heart
  /* ── the header (main.js) ── */
  kmh: 18, //     the hero chair's speed, km/h (18 on the line, 3.6 at the quay — « cinq fois moins vite »)
  cableKmh: 18, // the cable's, km/h (18; 0 once it stops)
  track: 0, //    the camera rides with the hero grip (0–1): the cable's speed ON SCREEN is the slip
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: 1300, fy: 240, fz: -260, fs: 600, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL, set on the STUBS:
 *  the builders give better ones in their journals (docs/journal/052-model.md, 052-gare.md, 052-ligne.md).
 *  Station poses in plan.js coordinates; bench poses in the bench's (the grip's cable axis at BENCH_AT). Poses on the
 *  hero grip are written for the chair standing at the AT place their comment names (the acts move tx with it). */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const gx = (s) => s - AT.launch; // departure-side x of an abscissa (x 0 at AT.launch)
const GY = CABLE_Y - FREE; // the open grip's axis in the station
const [, BY] = BENCH_AT;
export const VIEW = {
  hook: POSE0,
  /* ── the station ── */
  // the cable round the bullwheel, from above and behind it (« Le câble, lui, ne s'arrête jamais »)
  wheel: { ...P, tx: -900, ty: 330, tz: 0, d: 1300, az: -62, el: 34, fov: 34, shift: 40 },
  // the open jaws close, the cable running between them, arrival side, from outside (« Mais assez fort, c'est combien ? »)
  jaws: { ...P, ...CLOSE, tx: 700, ty: GY + 4, tz: -SIDE, d: 120, az: -150, el: 8, shift: 120 },
  // the hero chair at the quay, three quarters rear-outside, you on it (« Tu avances au pas »), chair at AT.board
  quay: { ...P, tx: STATION.board, ty: 130, tz: SIDE + 40, d: 680, az: -38, el: 8, fov: 34, shift: 120 },
  // the launching tyres under the chair, from outside low (« Devant, des pneus vont te lancer »)
  tyres: { ...P, tx: 500, ty: 265, tz: 260, d: 700, az: -28, el: 6, fov: 32, shift: 40 },
  // out of the mouth and down: the hollow under the line (« Puis la gare finit… et sous toi… la pente »)
  exit: { ...P, tx: 2600, ty: -500, tz: SIDE, d: 1800, az: -78, el: 40, fov: 50, shift: 0 },
  // the hero grip close, open over the cable, from outside: act 2 cuts to the bench from it (chair at AT.launch)
  grip: { ...P, ...CLOSE, tx: gx(AT.launch), ty: GY, tz: SIDE, d: 130, az: -40, el: 10, shift: 150 },
  // the principle: the two speed arrows over the grip, the tyres under it (chair between AT.launch and AT.close)
  principle: { ...P, tx: 500, ty: 340, tz: 260, d: 520, az: -18, el: 10, fov: 30, shift: 40 },
  // the grip close at equal speed: the strands stand still between the jaws (« le câble est immobile »)
  still: { ...P, ...CLOSE, tx: 900, ty: GY + 2, tz: SIDE, d: 95, az: -30, el: 6, shift: 140 },
  // the roller riding the came, the chair rolling alone (repos)
  came: { ...P, ...CLOSE, tx: -520, ty: 330, tz: 280, d: 190, az: -50, el: 10, shift: 40 },
  // the weighing and its gauge at the end of the quay (« un capteur pèse chaque pince »)
  weigh: { ...P, tx: 1230, ty: 380, tz: 360, d: 640, az: -30, el: 4, fov: 30, shift: 40 },
  // the chair launched, the quay streaming past, low and outside (zero)
  run: { ...P, tx: 1050, ty: 260, tz: 260, d: 360, az: -70, el: 4, fov: 34, shift: 40 },
  // the whole station from above and outside: the wheel, the tyres, the cable, the chairs — the stop (réponse)
  wide: { ...P, tx: -100, ty: 250, tz: 0, d: 4600, az: -100, el: 50, fov: 34, shift: 60 },
  // the side track: the hero chair isolated (« On l'isole pour contrôle »)
  garage: { ...P, tx: 1280, ty: 260, tz: 420, d: 1000, az: -15, el: 42, fov: 32, shift: 60 },
  // the comment: the chair on the steepest span in profile, the two arrows along the cable
  steep: { ...P, tx: STEEP_X + 30, ty: 3440, tz: SIDE, d: 1400, az: -12, el: 4, fov: 30, shift: 100 },
  // the like: the line from below, the chairs climbing it one by one
  climb: { ...P, tx: 8000, ty: 2400, tz: 0, d: 7000, az: -62, el: 8, fov: 34, shift: 60 },
  /* ── on the bench ── */
  // the grip whole, three quarters from outside on its halo (« Alors… on l'ouvre »)
  whole: { ...P, tx: 2, ty: BY - 6, tz: 4, d: 250, az: 30, el: 18, fov: 30, shift: 130 },
  // the exploded view, every part reads
  exploded: { ...P, tx: 4, ty: BY + 4, tz: 6, d: 340, az: 30, el: 20, fov: 30, shift: 120 },
  // the roller under its came, the lever (« une came pousse un levier et son galet »)
  cameBench: { ...P, ...CLOSE, tx: -30, ty: BY + 14, tz: 14, d: 110, az: -58, el: 12, shift: 120 },
  // the spring close: the heart (« Et au bout… le ressort qui les serre »)
  spring: { ...P, ...CLOSE, tx: 14, ty: BY - 16, tz: 12, d: 85, az: -34, el: 10, shift: 120 },
};

/** What a cut to the bench sets, whatever came before: the grip whole, open over its length of cable, nothing lit. */
export const BENCHED = {
  explode: 0, open: 1, weak: 0, litLever: 0, litRoller: 0, litJaws: 0, litSpring: 0, litCame: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: BY - 10, fz: 0, fs: SIZE,
};
/** What a cut back to the station sets: night, the X-ray, the cable running, the grip open on the came, nothing lit,
 *  no arrows, no weighing, no sway. The chair's place, the rope, the speeds and the rider are the act's. */
export const STAGED = {
  station: 1, line: 1, arrows: 0, weigh: 0, iso: 0, others: 1, sway: 0, pull: 0, greens: 0,
  explode: 0, open: 1, weak: 0, free: 1, litCame: 0, litTyres: 0, litWeigh: 0, litLever: 0, litRoller: 0, litJaws: 0, litSpring: 0,
  mood: 1, gel: 0, fs: 600,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const grip = buildGrip();
  const station = buildStation();
  const line = buildLine();
  const set = new THREE.Group();
  set.add(station.group, line.group);
  const bench = makeBench(SIZE);
  const benchMount = new THREE.Group();
  benchMount.position.set(...BENCH_AT);
  bench.group.add(benchMount);
  scene.add(set, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    grip, station, line, bench, set,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale ? stage.pixelScale() : 1;
      bench.group.visible = onBench;
      set.visible = !onBench;
      const home = onBench ? benchMount : line.gripMount;
      if (grip.root.parent !== home) home.add(grip.root);
      grip.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, open: S.open, weak: S.weak, slip: S.rope - S.chair,
        litCame: S.litCame, litLever: S.litLever, litRoller: S.litRoller, litJaws: S.litJaws, litSpring: S.litSpring,
      }, time, px);
      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        station.update({
          station: S.station, rope: S.rope, chair: S.chair, arrows: S.arrows, vchair: S.vchair, weigh: S.weigh, force: S.force,
          iso: S.iso, litCame: S.litCame, litTyres: S.litTyres, litWeigh: S.litWeigh, vrope: S.cableKmh * 100 / 3.6 * (1 - S.track),
        }, time, px);
        line.update({
          line: S.line, rope: S.rope, chair: S.chair, free: S.free, iso: S.iso, others: S.others, rider: S.rider, sit: S.sit,
          sway: S.sway, pull: S.pull, greens: S.greens,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.00002;
    },
  };
}

export { AT, WEIGH, STATION, GARAGE, sDeparture };
