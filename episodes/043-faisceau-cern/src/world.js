// DOSSIER 043 — Le faisceau du CERN : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by anneau.js and sortie.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Two new files, ONE world (a maquette at the scale of the subject, plan.js says why; no re-parenting, no bench):
//   anneau.js  AROUND, X-ray, and the TRAIN: the ring's tunnel and its arc magnets, the beam pipe, the train of bunches
//              (solid light), the grain and its shower, the struck coil, the 3 600 loss monitors, the alert's pulse, the
//              comment's 37 grains; far away, the 044 teaser.
//   sortie.js  THE SYSTEM, solid: point 6 — the 15 kickers on the ring pipe, the septa, the extraction line (X-ray), the
//              10 dilution magnets, the block (steel vessel X-ray, graphite core solid) in its cavern, its halo, the
//              « e » painted on its face, the stream that runs down the line, the principle's ghost (one point, it cracks).
// The autopsy happens IN PLACE (the system is 40 m long): BENCHED is not a bench, it is « the system alone » — the
// tunnel, the cavern and the train gone, the block on its halo.
// Three colours. signal is the threat: the grain, its shower, the hot coil, the loss over the threshold, every ghost
// (« sur un seul point… », « ailleurs… »). veille is the system alive: the monitors, the alert, the kickers armed and
// fired, the route out, the block's halo. ink is the rest — and the BEAM: the train is white light (ink, hot), it is
// neither the system nor the threat until it strikes. Heat on the graphite is signal held low (orange, never white).
//
// THE STORY (docs/faits/043-faisceau-cern.md; a typical case reconstituted, not a dated day — `sources` says so): a dust
// grain falls into the beam; the protons it scatters rain on the magnets downstream; the loss monitors see it cross
// their threshold; the alert goes to point 6; the system waits for the gap in the train (3 µs without a proton); in the
// gap the 15 kickers rise; the whole train leaves the ring in one turn (89 µs) down the line; 10 dilution magnets sweep
// it so it paints an « e » over the block's face instead of one point; the graphite heats, and holds.
import * as THREE from "three";
import { setMood } from "@kit/blocks.js";
import { RING, C, BEAM, S6, PLACES, BLOCK, TEASER, lineAt, LINE_DIR } from "./plan.js";
import { buildAnneau } from "./anneau.js";
import { buildSortie } from "./sortie.js";

export const SET = { RING: 1 };
/** ≈ the size of what the light is usually set round (the kicker row, the block): sizes the key light's shadows. */
export const SIZE = 120;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): one bunch, the coil, the monitor's bar, the face
 *  `air`    off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts (kickers, septa, dilution magnets, the core): machining grain, handling marks
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Ton faisceau porte l'énergie d'un train lancé. Un grain de poussière va le jeter
// dehors. » : low at the pipe, in the X-ray magnet just downstream of the grain, three-quarter front: the train of light
// comes at the lens out of the ring's curve, the grain (signal) falling in front of it, the first protons it scatters
// already raining toward us; far behind, small, the block on its veille halo. PROVISIONAL (candidate a, set on
// bouchons): the planche of four candidates (docs/043-actes.md, .cache/planches/043/image0.json) chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { tx: 0, ty: 2, tz: 0, d: 62, az: -77, el: 4.6, fov: 34, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.RING,
  /* ── around and the train (anneau.js) ── */
  shell: 1, //     the tunnel and the arc magnets, X-ray (0–1)
  ring: 1, //      the ring far away: its line of light, the far magnets, the far monitors (0–1)
  beam: 1, //      the train's light (0 none · 1 the train of white light)
  gap: 9000, //    cm: where the train is — the arc distance of the GAP's centre past the kickers' centre (plan.js S6), mod C.
  //               The train moves when `gap` moves: tween it with ease "none"; d(gap)/dt is its speed (cm/s). 0 = the gap
  //               centred on the kickers; −BEAM.gap/2 its front edge at them (« le trou passe »); +BEAM.gap/2 its tail at
  //               them: THE ONLY VALUE AT WHICH THE KICKERS FIRE (then hold `gap` and run `dump`).
  dump: 0, //      the extraction: the share of the train gone into the line (0 → 1 over one turn, « 89 µs »); the train in
  //               the ring advances with it and empties from its head; sortie.js runs the stream and paints the « e » with it
  grain: 0.35, //  the grain: 0 none · 0.1 it appears at the pipe's top · 1 on the beam's axis, struck
  spray: 0.15, //  the protons it scatters (signal), raining downstream on the pipe and the coil (0–1)
  coil: 0.1, //    the struck magnet's coil heats, signal through its glass (0–1)
  hero: 0, //      ONE bunch drawn big, its protons as grains of light, at the coil (0–1)
  slice: 0, //     a twentieth of it comes away and strikes the coil (0 → 1)
  sensors: 0.3, // the 3 600 loss monitors: 0 dark · 0.3 standby (a faint veille) · 1 lit, a wave round the ring from point 6
  loss: 0.1, //    the bar on the grain's monitor: 0 → 0.7 it rises to the threshold · 0.7 → 1 it crosses it, the threshold goes signal
  alert: 0, //     the alert: a veille pulse along the ring from the grain's monitor to point 6 (0 → 1)
  sweep: 0, //     the repos ghost, « ailleurs… » : kickers fired in mid-train sweep the bunches against the pipe's wall (0–1)
  grains: 0, //    the comment's tally: 0 → 37 grains in a row over the empty pipe, each with its little ring that empties
  teaser: 0, //    the 044 teaser: 0 → 0.4 the vest under seals lights · 0.4 → 1 the stone turns into a flattened bullet
  /* ── the system (sortie.js) ── */
  cavern: 1, //    the line's tunnel, the cavern and its shielding, X-ray (0–1)
  explode: 0, //   0 assembled → 1 apart along the line: kickers, septa, dilution magnets lift; the vessel slides off the core
  litKick: 0, litSepta: 0, litLine: 0, litDil: 0, litBlock: 0, // the part the voice names, a faint veille (0–1)
  arm: 0.3, //     the kickers armed, waiting: a veille breath (0–1)
  kick: 0, //      the 15 kickers fire: 0 → 1 their field rises (a veille flash that settles bright; signal while `sweep` > 0: the ghost)
  septa: 0, //     the septa take the beam over: their gap lights after the kickers (0–1)
  dil: 0, //       the 10 dilution magnets sweep (0–1): lit in turn, the spot turns
  route: 0, //     the way out drawn in veille: a head of light from point 6 down the line to the face (0 → 1)
  paint: 0, //     the « e » drawn on the face (0 → 1), the principle's demonstration; the film's « e » is max(paint, dump)
  heat: 0, //      the graphite along the trace: 0 cold · 0.5 orange · 1 the hottest (still orange: NEVER white)
  point: 0, //     the principle's ghost: the whole beam on ONE point of the face, a signal spot that grows hot (0–1)
  crack: 0, //     …and the plate gives: cracks run out from it (0–1; « abîmé », never a hole through)
  pool: 0.6, //    the block's halo on the cavern floor, veille (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black)
  fx: 0, fy: 0, fz: 0, fs: 120, mood: 1, gel: 0,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). THE CAMERA TURNS ONE WAY: in every
 *  path, az DECREASES (the order of the film is in docs/043-actes.md). All set on BOUCHONS: the builders give better ones
 *  in their journals (docs/journal/043-<file>.md). Distances: a portrait frame sees ≈ 0.34·d across at fov 34. */
const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0, shift: 0 };
const at = (p, o = {}) => ({ tx: p[0], ty: p[1], tz: p[2], ...o });
const face = PLACES.face, block = PLACES.block, kick = PLACES.kick;
export const VIEW = {
  hook: POSE0,
  /* ── the candidates of the first frame (docs/043-actes.md) ── */
  // b: further out, three-quarter: the magnets of glass, the train diagonally at the lens, the grain's monitors lit
  side: { ...P, tx: 60, ty: 2, tz: 0, d: 260, az: -62, el: 6, fov: 34 },
  // c: under the pipe, looking up the train: the grain falls toward the lens out of the pipe's top
  under: { ...P, tx: 70, ty: 2, tz: 0, d: 120, az: -86, el: -9, fov: 40 },
  // d: in the pipe itself, off its axis: the tunnel of glass, the train coming like a train in its tunnel
  inpipe: { ...P, tx: 120, ty: -1.5, tz: 0.5, d: 160, az: -89, el: 1, fov: 46 },
  /* ── act 1 (the tunnel, the ring, point 6) ── */
  train: { ...P, tx: 40, ty: 0, tz: 0, d: 75, az: -78, el: 4 }, //               « train lancé » : the train plein cadre
  blockFar: { ...P, ...at(face, { tz: face[2] - 56 }), d: 2300, az: -146, el: 15 }, // « un bloc de six tonnes »
  grainFloat: { ...P, ...CLOSE, tx: 25, ty: 0, tz: 0, d: 55, az: -70, el: 6 }, // « gagné ? » : the grain before the train
  coil: { ...P, ...CLOSE, tx: -130, ty: -2, tz: 0, d: 130, az: -35, el: 12 }, //  « pleuvoir sur les aimants »
  hero: { ...P, ...CLOSE, tx: -102, ty: 0, tz: 0, d: 34, az: -58, el: 8 }, //      « un vingtième d'un paquet »
  trainLong: { ...P, tx: -600, ty: 0, tz: 0, d: 1800, az: -104, el: 16, fov: 40 }, // « ton train en compte des milliers »
  ringArc: { ...P, tx: 2250, ty: 0, tz: -2250, d: 19000, az: -118, el: 34, fov: 34 }, // the quarter ring, the grain → point 6
  ringHigh: { ...P, ...at(RING.centre), d: 28000, az: -40, el: 44, fov: 34 }, //  the whole ring, point 6 at its right
  exitLit: { ...P, ...at(lineAt(450)), d: 1700, az: -160, el: 30 }, // « la sortie de secours », lit veille
  /* ── act 2 (point 6, the line, the block) ── */
  dive: { ...P, ...at(kick), d: 600, az: -150, el: 10, fov: 38 }, //              « Alors… on l'ouvre » : into the branch
  exploded: { ...P, ...at(lineAt(380), { ty: 10 }), d: 1400, az: -150, el: 18 }, //   the exit system apart along its line
  sensors: { ...P, ...at(RING.centre), d: 22000, az: -54, el: 30, fov: 34, shift: 120 }, // « 3 600 capteurs »
  kickers: { ...P, ...at(kick, { ty: 20, tz: kick[2] + 20 }), d: 680, az: -152, el: 16 }, //                    « 15 aimants le poussent »
  lineLong: { ...P, ...at(lineAt(2400)), d: 1700, az: -168, el: 10, fov: 36 }, //   « 700 mètres de ligne »
  blockHero: { ...P, ...at(lineAt(3500)), d: 1500, az: -150, el: 16 }, //                « et au bout… le bloc »
  faceClose: { ...P, ...CLOSE, ...at(face, { tz: face[2] + 12 }), d: 170, az: -150, el: 10, fov: 32 }, // the principle
  dilution: { ...P, ...at(lineAt(1170), { ty: 5 }), d: 480, az: -160, el: 8 }, //         « dix aimants le font tourner »
  gapFind: { ...P, ...at(kick, { tz: kick[2] + 30 }), d: 700, az: -132, el: 12 }, //                      « dans le train, un trou »
  /* ── act 3 ── */
  monitor: { ...P, ...CLOSE, tx: -33, ty: 31, tz: 44, d: 95, az: -22, el: 8, fov: 32 }, // « la perte franchit le seuil »
  ringPulse: { ...P, tx: 2250, ty: 0, tz: -2250, d: 11000, az: -46, el: 36, fov: 34 }, // « l'alerte part »
  fire: { ...P, ...at(kick, { tz: kick[2] + 100 }), d: 700, az: -135, el: 14 }, //                          « 15 aimants s'allument »
  lineRush: { ...P, ...at(lineAt(1960)), d: 1100, az: -160, el: 8, fov: 36 }, //    « le train quitte l'anneau »
  /* ── the end ── */
  verdict: { ...P, ...at(face, { tz: face[2] + 200 }), d: 1000, az: -160, el: 20, shift: 200 }, // the block cools, up the line
  etrace: { ...P, ...CLOSE, ...at(face), d: 125, az: -165, el: 8, fov: 32 }, //     « on l'étale » : the « e » alone
  tally: { ...P, tx: 80, ty: 4, tz: 0, d: 170, az: -60, el: 10 }, //               « 37 fois » : the grains over the empty pipe
  like: { ...P, tx: 40, ty: 0, tz: 0, d: 95, az: -74, el: 5 }, //                  the grain before the train, still
  teaser: { ...P, ...at(TEASER.at, { ty: TEASER.at[1] + 40 }), d: 420, az: -40, el: 12, fov: 34 },
};

/** What a cut to « the system alone » sets: the tunnel, the cavern, the train gone; the block on its halo; nothing lit.
 *  The act says what lights and where the light stands. */
export const BENCHED = {
  set: SET.RING, shell: 0.12, ring: 0.3, beam: 0, dump: 0, grain: 0, spray: 0, coil: 0, hero: 0, slice: 0, sensors: 0.3,
  loss: 0, alert: 0, sweep: 0, grains: 0, teaser: 0,
  cavern: 0.2, explode: 0, litKick: 0, litSepta: 0, litLine: 0, litDil: 0, litBlock: 0, arm: 0.3, kick: 0, septa: 0, dil: 0,
  route: 0, paint: 0, heat: 0, point: 0, crack: 0, pool: 1,
  mood: 0, gel: 0, fx: block[0], fy: block[1], fz: block[2], fs: 500,
};
/** What a cut to the ring at work sets: tunnel and cavern X-ray, the train running whole, the monitors on standby,
 *  the kickers armed, nothing struck. The act says where the train is (`gap`), what burns, where the light stands. */
export const STAGED = {
  set: SET.RING, shell: 1, ring: 1, beam: 1, dump: 0, grain: 0, spray: 0, coil: 0, hero: 0, slice: 0, sensors: 0.3,
  loss: 0, alert: 0, sweep: 0, grains: 0, teaser: 0,
  cavern: 1, explode: 0, litKick: 0, litSepta: 0, litLine: 0, litDil: 0, litBlock: 0, arm: 0.3, kick: 0, septa: 0, dil: 0,
  route: 0, paint: 0, heat: 0, point: 0, crack: 0, pool: 0.6,
  mood: 1, gel: 0, fx: 0, fy: 0, fz: 0, fs: 120,
};
/** The light's stand-points, ready to spread into a `st`. */
export const LIGHT = {
  grain: { fx: 0, fy: 0, fz: 0, fs: 120 },
  kick: { fx: kick[0], fy: 0, fz: kick[2], fs: 300 },
  line: { fx: PLACES.dilution[0], fy: 0, fz: PLACES.dilution[2], fs: 900 },
  block: { fx: block[0], fy: 0, fz: block[2], fs: 500 },
  ring: { fx: RING.centre[0], fy: 0, fz: RING.centre[2], fs: 6000 },
};

export function buildWorld(stage) {
  const { scene } = stage;
  const ring = buildAnneau();
  const exit = buildSortie();
  scene.add(ring.group, exit.group);
  stage.grade.gel.set(0xff5b2e);
  if (!scene.fog) scene.fog = new THREE.FogExp2(0x000000, 0.0001);

  return {
    ring, exit,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const eye = stage.camera.position;
      ring.update({
        shell: S.shell, ring: S.ring, beam: S.beam, gap: S.gap, dump: S.dump, grain: S.grain, spray: S.spray, coil: S.coil,
        hero: S.hero, slice: S.slice, sensors: S.sensors, loss: S.loss, alert: S.alert, sweep: S.sweep, grains: S.grains,
        teaser: S.teaser, kick: S.kick,
      }, time, px, eye);
      exit.update({
        cavern: S.cavern, explode: S.explode, litKick: S.litKick, litSepta: S.litSepta, litLine: S.litLine, litDil: S.litDil,
        litBlock: S.litBlock, arm: S.arm, kick: S.kick, septa: S.septa, dil: S.dil, route: S.route, paint: S.paint,
        heat: S.heat, point: S.point, crack: S.crack, pool: S.pool, dump: S.dump, beam: S.beam, sweep: S.sweep,
      }, time, px, eye);
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, S.mood * 0.4);
      // the air: relative to how far the camera stands — a close-up keeps the block at 47 m faintly; the whole ring clear
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = 0.25 / Math.max(2000, d * 3);
    },
  };
}

export { RING, C, BEAM, S6, PLACES, BLOCK, TEASER, LINE_DIR };
