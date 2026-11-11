// DOSSIER 045 — L'autodestruction de la fusée : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by fusee.js, sauvegarde.js, kourou.js)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Three files. AROUND, X-ray: kourou.js (the base at Kourou, maquette: the dome of 026/sky.js, the savanna and the mangrove,
// the pad ELA-3, the flight corridor, the planned path and its ghost, the debris' footprint, the CNES safety booth and its
// screens, the 046 flare on the horizon) and fusee.js (Ariane 5 of glass, true size, its insides solid where they count:
// the equipment bay and its two SRI, the nozzles, the booster/core junction and its links, the linear charges along the
// hull; the flight, the veer, the tearing, the detonation, the hull that opens, the debris, the trail). The SYSTEM, solid
// and lit like a studio piece: sauvegarde.js (the destruction chain — antenna, receiver, safe-and-arm, detonator, cord,
// linear charge on its strip of hull — and the principle's section: the V, the copper, the jet, the 2 cm steel plate).
// The system is ONE object, re-parented: in the scene it sits in the bay (fusee.A.seat), on the bench on its halo.
// Three colours. signal is the threat: the failing guidance, the veer, the tearing and its fire, the debris, the ghost path.
// veille is the system alive: the charges along the hull, the chain, the antenna's call, the corridor (the rule), the
// detonation and its jet. ink is the rest: the base, the glass rocket, the booth, the ground.
import { makeBench, setMood } from "@kit/blocks.js";
import { DEG, BENCH, BOOTH, BOOTH_AZ, TEASER, CENTER, LINKS, BOOSTER, SEAT, SYS, ROW, HOOK, ALT, DOWN, KM, onRocket, ringPoint, rocketAt } from "./plan.js";
import { buildKourou } from "./kourou.js";
import { buildFusee } from "./fusee.js";
import { buildSauvegarde } from "./sauvegarde.js";

export const SET = { BENCH: 0, SCENE: 1 };
/** ≈ the radius of what stands on the bench (the exploded row spans ≈ 200 cm): sizes the bench, its light, its shadows. */
export const SIZE = BENCH.size;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the detonator, the lock, the section, the plate, the SRI, the junction
 *  `air`    off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts (the chain, the SRI, the nozzles): machining grain, handling marks
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

/** A point of the system's LOCAL frame (plan.js SYS: +x down the axis, +y inward, +z along the skin) → the rocket's frame. */
const sysToRocket = ([lx, ly, lz]) => {
  const a = SEAT.az * DEG;
  const [sx, sy, sz] = ringPoint(SEAT.az, SEAT.r, SEAT.y);
  return [sx - ly * Math.sin(a) + lz * Math.cos(a), sy - lx, sz - ly * Math.cos(a) - lz * Math.sin(a)];
};
/** World points the poses aim at, for a state of the rocket. */
const at = (climb, incid, p) => onRocket(climb, incid, p);
const C_HOOK = at(HOOK.climb, HOOK.incid, [0, CENTER, 0]); //               the rocket's middle on the first frame
const DET_HOOK = at(HOOK.climb, HOOK.incid, sysToRocket([SYS.det.at[0], 4, 0])); // the detonator in the bay, on the first frame
const C_PAD = at(0, 0, [0, CENTER, 0]); //                                   the rocket's middle on its pad
const SEAT_PAD = at(0, 0, sysToRocket([-30, 6, 0])); //                       the chain in the bay, on the pad
const BAY_ZERO = at(1, 0, ringPoint(-42, 120, 3135)); //                      the bay at H0+36 (the SRI), on its path, not yet veering
const BASE_ZERO = at(1, 0, [0, -160, 0]); //                                  the nozzles, same instant
const C_ZERO = at(1, 0, [0, CENTER, 0]);
const LINK_HOOK = at(HOOK.climb, HOOK.incid, [0, LINKS.y, BOOSTER.side - BOOSTER.r - 8]); // the +z booster's links (comment)
const CONSOLE = [BOOTH.at[0] + 120 * Math.sin(BOOTH_AZ * DEG + Math.PI), BOOTH.desk + 30, BOOTH.at[2] + 120 * Math.cos(BOOTH_AZ * DEG + Math.PI)];

// The first frame is the hook, « Ta fusée bascule et se déchire. » : from the mangrove, low and looking up, Ariane 5 already
// crossways across the sky (≈ 40 % of the width), its two boosters lifting off the core, fire at the junctions, the
// trail bent behind it; the charges along the hull a faint veille line (`charge` 0.25) that runs bright on « prévu ».
// PROVISIONAL (candidate a, set on bouchons): the planche of four candidates (docs/045-actes.md) chooses it, and it is
// pasted here before the acts are staged.
export const POSE0 = { tx: C_HOOK[0], ty: C_HOOK[1], tz: C_HOOK[2], d: 14000, az: -46, el: -8, fov: 42, shift: 160, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SCENE,
  /* ── around: the base (kourou.js) ── */
  ground: 1, //    the base: the dome (026), the savanna, the mangrove and its creeks, the coast, the pad (0–1)
  corridor: 0.35, // the flight corridor: its band on the ground and its faint walls, veille (0–1)
  track: 0, //     the PLANNED path drawn in the air, a fine veille dash from the pad over the coast (0–1)
  fall: 0, //      the debris' footprint on the ground east of the pad: 0 → 1 it spreads (signal)
  ghost: 0, //     the chute's ghost: 0 → 1 the path it would have flown on, veering out of the corridor (signal dash)
  barred: 0, //    the ghost struck out, signal (0–1)
  salle: 0, //     the CNES safety booth: glass, its console, its two screens (0–1)
  alarm: 0, //     on its screen: 0 the track inside the band · → 1 it turns signal and drops out of it
  teaser: 0, //    the 046 flare on the south-east horizon: 0 → 0.5 it rises in · → 1 its pilot flame lit
  /* ── around: the rocket (fusee.js) ── */
  rocket: 1, //    the rocket seen: glass hull and edges (0–1)
  inside: 0, //    its insides that count, solid: the bay and its two SRI, the nozzles and their actuators, the links (0–1)
  climb: HOOK.climb, // its place on the planned path: 0 on the pad · 1 the point of H0+39 s (plan.js flightAt)
  incid: HOOK.incid, // its angle off the path, DEGREES: 0 on the path · 24 « plus de vingt degrés » · ≤ 36 as it breaks
  gimbal: 1, //    the nozzles: 0 straight · 1 hard over (« à fond »)
  guide: 0, //     the two SRI in the bay: 1 alive (veille) · 0 dead (dim, signal)
  burn: 0.85, //   the jets of the Vulcain and the two boosters (0–1)
  trail: 1, //     the smoke trail along the flown path; it keeps its place in the sky when the rocket turns (0–1)
  tear: 0.25, //   the boosters: 0 attached · 0.25 their noses lifting off the core, fire at the junctions · 1 torn away, tumbling
  links: 1, //     the electric links across each forward junction: 1 whole · 0 torn
  pulse: 0, //     the signal from the torn links to the detonator in the bay: 0 → 1 it runs (veille)
  charge: 0.25, // the linear charges along the hull: 0 dark · 0.25 a faint veille line · 0.25 → 1 the light runs from the bay down every line
  blast: 0, //     the detonation along them: 0 → 1 a white-veille front runs from the bay along every line
  rip: 0, //      the hull opens along the lines « comme une fermeture éclair »: 0 closed · 1 open, its panels peeled
  debris: 0, //    the pieces: 0 in place · 0.1 they part · 1 on the ground east of the pad
  arc: 0, //       the angle drawn against its route: its axis, its path, the arc between them (veille, 0–1)
  /* ── the system (sauvegarde.js) ── */
  explode: 0, //   the chain in a row across the bench (0–1; on the bench only)
  litAnt: 0, litLock: 0, litDet: 0, litCord: 0, litCharge: 0, // the part the voice names: a veille edge (0–1)
  solo: 0, //      the charge alone, the other parts gone (0–1)
  listen: 0, //    the ground's call: rings rising to the antenna (0–1)
  arm: 1, //       the safe-and-arm rotor: 0 safe (turned, the barrier across) · 1 armed (aligned)
  fire: 0, //      the firing down the chain: 0 → 0.2 the detonator · → 0.6 the cord · → 1 the charge (a white-veille front)
  section: 0, //   the charge cut open (its part at x < SYS.cut hidden): the V, the copper liner (0–1; on the bench only)
  jet: 0, //       the liner folds into a jet: 0 → 0.5 the jet forms · → 1 it has gone through the plate, which opens
  plate: 0, //     the 2 cm steel plate under the charge (0–1; on the bench only)
  watch: 0, //     the chain's slow veille breath at rest, armed (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: C_HOOK[0], fy: C_HOOK[1], fz: C_HOOK[2], fs: 6000, mood: 1, gel: 0, pool: 0, grid: 0,
};

/** The light's stand-points, ready to spread into a `st`. */
export const LIGHT = {
  sky: { fx: C_HOOK[0], fy: C_HOOK[1], fz: C_HOOK[2], fs: 6000 }, //  the breakup, 4 km up (maquette)
  pad: { fx: C_PAD[0], fy: C_PAD[1], fz: C_PAD[2], fs: 6000 }, //     the rocket on its pad
  wide: { fx: 2 * KM, fy: ALT / 2, fz: 0, fs: 30000 }, //            the base and the sky
  booth: { fx: CONSOLE[0], fy: CONSOLE[1], fz: CONSOLE[2], fs: 900 },
  bench: { fx: 0, fy: 6, fz: 0, fs: SIZE },
};

/** The poses one act hands to the next (complete where a cut lands on them). THE CAMERA TURNS ONE WAY: in every path,
 *  az DECREASES. The order below follows the film (a | is a cut):
 *   acte1  −28 (POSE0) → −32 → −36 → −40 (prevu) → −48 → −56 → −62 (det)  | −36 (wide) → −42 (pad) → −48 (fall) → −54 (couloir) → −60 (hull)
 *   acte2  | −8 (benchIn) → −14 → −18 (exploded) → −24 (antenna) → −30 (lock) → −36 (det) → −42 (cord) → −48 (charge)
 *          → −56 (section) → −62 → −68 (blast) → −74 (jetView) → −80 (plateView)
 *   acte3  | −26 (padBay) → −40 (padOut) → BOOTH_AZ ≈ −54 (booth) → −62 (corridorView) → −68 (bascule)
 *          | −18 (bay) → −26 → −34 (nozzles) → −40 (whole) → −46 (tearView) → −52 (blastView) → −60 (rain)
 *   fin    | −36 (verdict) → −44 → −52 | −14 (junction) → −24 → −34 (duel) → −46 → −58 (like) → −66 (teaserView) → −74
 *          | −16 (back = POSE0 + 12) → −28 (POSE0)
 *  Starting points, set on BOUCHONS: the builders give better ones in their journals (docs/journal/045-<file>.md). */
const P = { fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
const B = { ...P, fov: 30, shift: 60, drift: 0.2 }; // the bench
const chargeMid = (ROW.charge[0] + ROW.charge[1]) / 2;
const plateX = ROW.charge[0] + (SYS.plate.at[0] - SYS.charge.from[0]);
export const VIEW = {
  hook: POSE0,
  /* ── the candidates of the first frame (docs/045-actes.md § Les candidates) ── */
  // b: wider and lower, the pad small at the bottom of the frame, the rocket crossways at the top
  low: { ...P, tx: C_HOOK[0] - 2600, ty: C_HOOK[1] - 5200, tz: 0, d: 30000, az: -34, el: -30, fov: 52, shift: 260 },
  // c: at its height, beside it: the rocket big and crossways, the ground far below (the pad, the corridor band)
  side: { ...P, tx: C_HOOK[0], ty: C_HOOK[1], tz: 0, d: 15000, az: -46, el: 10, fov: 40, shift: 60 },
  // d: close on the +z booster tearing off: its nose leaving the core, the fire at the junction, the rocket receding
  rip: { ...P, tx: LINK_HOOK[0], ty: LINK_HOOK[1], tz: LINK_HOOK[2] + 200, d: 4200, az: -18, el: -22, fov: 44, shift: 120 },
  /* ── act 1 ── */
  prevu: { ...P, tx: C_HOOK[0], ty: C_HOOK[1], tz: 0, d: 17000, az: -40, el: -36 }, //   « comme prévu »: the charges run bright
  det: { ...P, ...CLOSE, tx: DET_HOOK[0], ty: DET_HOOK[1], tz: DET_HOOK[2], d: 40, az: -62, el: -10, fov: 34 }, // « qui l'a déclenchée ? »
  wide: { ...P, tx: 2600, ty: 7600, tz: 0, d: 42000, az: -36, el: -6, fov: 44, shift: 120 }, // « Quatre kilomètres au-dessus du sol »
  padView: { ...P, tx: 1600, ty: 6000, tz: 0, d: 38000, az: -42, el: -2, fov: 44, shift: 160 }, // « À un kilomètre du pas de tir »
  couloir: { ...P, tx: 7000, ty: 7000, tz: 0, d: 46000, az: -54, el: 12, fov: 44, shift: 0 }, // « …que dans son couloir »
  hull: { ...P, tx: C_HOOK[0], ty: C_HOOK[1], tz: 0, d: 2400, az: -60, el: -14, fov: 36 }, //  « Il reste sa charge »
  /* ── act 2 (the bench) ── */
  benchIn: { ...B, tx: -14, ty: 6, tz: 0, d: 320, az: -56, el: 22, shift: 40 }, //                     « Alors… on l'ouvre » — the chain whole on its halo
  exploded: { ...B, tx: -14, ty: 6, tz: 0, d: 430, az: -64, el: 22, shift: 40 }, //                the row, end to end
  antenna: { ...B, ...CLOSE, tx: ROW.antenna, ty: 5, tz: 0, d: 80, az: -24, el: 12, shift: 0 }, // « une antenne écoute le sol »
  lock: { ...B, ...CLOSE, tx: ROW.lock, ty: 8.8, tz: 6.5, d: 60, az: -30, el: 14, shift: 0 }, //      « Un verrou, la sécurité-armement »
  detView: { ...B, ...CLOSE, tx: ROW.det, ty: 1.6, tz: 0, d: 40, az: -36, el: 12, shift: 0 }, //    « Un détonateur »
  cord: { ...B, tx: (ROW.cord[0] + ROW.cord[1]) / 2, ty: 2.4, tz: 0, d: 80, az: -42, el: 14 }, //   « Un cordeau qui file… »
  charge: { ...B, tx: chargeMid, ty: 3, tz: 0, d: 150, az: -66, el: 16, shift: 40 }, //                       « …la charge linéaire »
  section: { ...B, ...CLOSE, tx: ROW.cut, ty: 4, tz: 0, d: 34, az: -56, el: 14, shift: 0 }, //    « Pliée en V, doublée de cuivre »
  blast: { ...B, tx: chargeMid + 4, ty: 3, tz: 0, d: 120, az: -64, el: 14, shift: 0 }, //        « elle détone… »
  jetView: { ...B, ...CLOSE, tx: ROW.cut + 2, ty: 1, tz: 0, d: 34, az: -74, el: 8, shift: 0 }, // « …un jet de métal »
  plateView: { ...B, ...CLOSE, tx: 62, ty: 0, tz: 0, d: 60, az: -72, el: 18, shift: 0 }, //   « …deux centimètres d'acier »
  /* ── act 3 ── */
  padBay: { ...P, ...CLOSE, tx: SEAT_PAD[0], ty: SEAT_PAD[1], tz: SEAT_PAD[2], d: 420, az: -26, el: 6, fov: 36 }, // « Armée avant l'allumage »
  padOut: { ...P, tx: C_PAD[0], ty: C_PAD[1], tz: 0, d: 9000, az: -40, el: 4, fov: 40 }, //        pulling back off the pad
  booth: { ...P, tx: CONSOLE[0], ty: CONSOLE[1], tz: CONSOLE[2], d: 350, az: BOOTH_AZ, el: 4.5, fov: 50, shift: -110 }, // « la sauvegarde du CNES »
  corridorView: { ...P, tx: 9000, ty: 9000, tz: 0, d: 44000, az: -62, el: 14, fov: 44, shift: 0 }, // « jamais hors du couloir »
  bascule: { ...P, tx: C_ZERO[0], ty: C_ZERO[1], tz: 0, d: 22000, az: -68, el: -10, fov: 40 }, //   « Et là… ta fusée bascule »
  bay: { ...P, ...CLOSE, tx: BAY_ZERO[0], ty: BAY_ZERO[1], tz: BAY_ZERO[2], d: 850, az: -18, el: 8, fov: 36 }, // « centrales inertielles »
  nozzles: { ...P, tx: BASE_ZERO[0], ty: BASE_ZERO[1], tz: 0, d: 2800, az: -34, el: -10, fov: 38 }, //   « Les tuyères braquent à fond »
  whole: { ...P, tx: C_ZERO[0], ty: C_ZERO[1], tz: 0, d: 15000, az: -40, el: -6, fov: 40 }, //      « Elle se met en travers »
  tearView: { ...P, tx: C_HOOK[0], ty: C_HOOK[1], tz: 0, d: 12000, az: -46, el: -8, fov: 40 }, //   « Les boosters s'arrachent »
  blastView: { ...P, tx: C_HOOK[0], ty: C_HOOK[1], tz: 0, d: 10500, az: -52, el: -6, fov: 40 }, //  « la charge détone »
  rain: { ...P, tx: 2600, ty: 6200, tz: 0, d: 46000, az: -60, el: 4, fov: 44, shift: 120 }, //      « Tout retombe près du pas de tir »
  /* ── the end ── */
  verdict: { ...P, tx: 2800, ty: 7600, tz: 0, d: 42000, az: -36, el: -4, fov: 44, shift: 120 }, //  « ce jour-là, la fusée a raté »
  junction: { ...P, ...CLOSE, tx: LINK_HOOK[0], ty: LINK_HOOK[1], tz: LINK_HOOK[2] + 60, d: 1300, az: -80, el: 4, fov: 36 }, // « ils ont coupé leurs fils »
  duel: { ...P, tx: C_PAD[0], ty: C_PAD[1], tz: 0, d: 16000, az: -34, el: 6, fov: 40 }, //          « un humain… ou la machine ? »
  like: { ...P, tx: C_PAD[0], ty: C_PAD[1] - 400, tz: 0, d: 13000, az: -58, el: 4, fov: 40 }, //   the rocket whole again, standing on its pad
  teaserView: { ...P, tx: 6000, ty: 2600, tz: -2400, d: 26000, az: -72, el: 2, fov: 40, shift: -300 }, // the 046 flare far behind
  back: { ...POSE0, az: POSE0.az + 12, d: POSE0.d * 1.05 }, //                                   the loop's cut: POSE0 turned 12° against the film's way
};

/** What a cut to the bench sets, whatever came before: the chain whole and armed on its halo, nothing of the base. */
export const BENCHED = {
  set: SET.BENCH, ground: 0, corridor: 0, track: 0, fall: 0, ghost: 0, barred: 0, salle: 0, alarm: 0, teaser: 0,
  rocket: 0, inside: 0, explode: 0, litAnt: 0, litLock: 0, litDet: 0, litCord: 0, litCharge: 0, solo: 0, listen: 0,
  arm: 1, fire: 0, section: 0, jet: 0, plate: 0, watch: 0, mood: 0, gel: 0, pool: 0.25, grid: 0.16, ...LIGHT.bench,
};
/** What a cut to the scene sets: the base, the rocket at the breakup point (HOOK), nothing of the bench. The act says the rest. */
export const STAGED = {
  set: SET.SCENE, ground: 1, corridor: 0.35, track: 0, fall: 0, ghost: 0, barred: 0, salle: 0, alarm: 0, teaser: 0,
  rocket: 1, inside: 0, climb: HOOK.climb, incid: HOOK.incid, gimbal: 1, guide: 0, burn: 0.85, trail: 1, tear: 0.25, links: 1,
  pulse: 0, charge: 0.25, blast: 0, rip: 0, debris: 0, arc: 0, explode: 0, litAnt: 0, litLock: 0, litDet: 0, litCord: 0,
  litCharge: 0, solo: 0, listen: 0, arm: 1, fire: 0, section: 0, jet: 0, plate: 0, watch: 0,
  mood: 1, gel: 0, pool: 0, grid: 0, ...LIGHT.sky,
};
/** The rocket whole on its pad, before ignition, its chain armed and breathing (the rest, the like). */
export const ONPAD = {
  ...STAGED, climb: 0, incid: 0, gimbal: 0, guide: 1, burn: 0, trail: 0, tear: 0, charge: 0.25, inside: 1, watch: 1,
  mood: 0, ...LIGHT.pad,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const kourou = buildKourou();
  const fusee = buildFusee();
  const sys = buildSauvegarde();
  const bench = makeBench(SIZE);
  bench.group.position.set(...BENCH.at);
  scene.add(kourou.group, fusee.group, fusee.free, bench.group);
  stage.grade.gel.set(0xff5b2e);

  return {
    kourou, fusee, sys, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const onBench = S.set === SET.BENCH;
      const b = onBench ? 1 : 0;
      const px = stage.pixelScale();
      const eye = stage.camera.position;
      kourou.group.visible = !onBench;
      fusee.group.visible = !onBench;
      fusee.free.visible = !onBench;
      // the rocket on its path, turned by the path and its veer (plan.js rocketAt)
      const r = rocketAt(S.climb, S.incid);
      fusee.group.position.set(r.pos[0], r.pos[1], r.pos[2]);
      fusee.group.rotation.set(0, 0, -r.tilt * DEG);
      if (!onBench) {
        kourou.update({
          ground: S.ground, corridor: S.corridor, track: S.track, fall: S.fall, ghost: S.ghost, barred: S.barred,
          salle: S.salle, alarm: S.alarm, teaser: S.teaser, climb: S.climb, incid: S.incid, debris: S.debris,
        }, time, px, eye);
        fusee.update({
          rocket: S.rocket, inside: S.inside, climb: S.climb, incid: S.incid, gimbal: S.gimbal, guide: S.guide, burn: S.burn,
          trail: S.trail, tear: S.tear, links: S.links, pulse: S.pulse, charge: S.charge, blast: S.blast, rip: S.rip,
          debris: S.debris, arc: S.arc,
        }, time, px, eye);
      }
      // the system: in the bay in the scene, on its halo on the bench — the same object
      const home = onBench ? bench.group : fusee.A.seat;
      if (sys.group.parent !== home) home.add(sys.group);
      sys.update({
        explode: onBench ? S.explode : 0, litAnt: S.litAnt, litLock: S.litLock, litDet: S.litDet, litCord: S.litCord,
        litCharge: S.litCharge, solo: S.solo, listen: S.listen, arm: S.arm, fire: S.fire, section: onBench ? S.section : 0,
        jet: onBench ? S.jet : 0, plate: onBench ? S.plate : 0, watch: S.watch, bench: b,
        shown: onBench ? 1 : S.inside, // in the scene the chain is seen only with the rocket's insides
      }, time, px, eye);
      bench.group.visible = onBench && (S.pool > 0.001 || S.grid > 0.001);
      bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.4);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.000011;
    },
  };
}

export { DEG, BENCH, BOOTH, BOOTH_AZ, TEASER, CENTER, SEAT, SYS, ROW, HOOK, ALT, DOWN, KM, onRocket, ringPoint, rocketAt, sysToRocket };
