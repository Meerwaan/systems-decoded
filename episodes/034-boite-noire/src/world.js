// DOSSIER 034 — Boîte noire : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by model.js, fond.js and this file)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
// Three sets, ONE object re-parented between them — the flight recorder (model.js), solid, orange:
//   DEEP   the Atlantic at night, surface to bottom (fond.js): the box sinks, its beacon pings, it lies at 3 900 m,
//          the wreck of glass around it, the light that comes down two years later. THE BOX STANDS STILL AT THE ORIGIN,
//          THE SEA COMES TO IT (`depth`, plan.js).
//   AIR    023's A330 of glass at night over the Atlantic (imported untouched, already dressed): « ton avion »,
//          the recorder hanging in its tail.
//   BENCH  the recorder alone on its pool of light: the exploded view, the module in section, the like.
// Three colours. signal is the threat: the sinking wreck, the countdown once the beacon is lost (`alarm`), the
// flame, the water's pressure. veille is the system alive: the beacon's pings, its battery, the steel that holds,
// the memory read. ink is the rest. The recorder itself is ORANGE-painted in the story — drawn with the brand's
// signal hue on its paint ONLY (model.js): it is the one object the film is about, and the like pays it off.
//
// THE STORY (docs/faits/034-boite-noire.md; the scene reconstitutes, `sources` says so): AF447, Rio-Paris, night
// of 31 May – 1 June 2009. Its recorders sink to 3 900 m. Their beacons (water-activated, one ping a second, ≈ 1 NM
// of reach, 30 days at the time) are never heard (the acoustic searches of June–July 2009 found nothing: do NOT say
// or show why). The wreck is found on 2 April 2011; in May the recorders come up and are read. What saved them:
// the protected memory module only (steel / insulation / heat absorber around the memory). No victim, no transcript,
// no name. No claim that the box is in the tail of the A330 (NTSB: « generally the tail » — the picture may put it
// there, a label never says it).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { REC, CHASSIS, BOARDS, MODULE, LAYERS, BEACON, PING, SYSTEM, BENCHAT, DEEP, WRECK, BEAM } from "./plan.js";
import { buildSystem } from "./model.js";
import { buildFond } from "./fond.js";
import { buildAvion } from "../../023-eolienne-de-secours/src/avion.js"; // already dressed (023/habillage.js, inside)
import { FUSE, GEAR, ALT, ISLAND } from "../../023-eolienne-de-secours/src/plan.js";

const DEG = Math.PI / 180;
export const SET = { BENCH: 0, DEEP: 1, AIR: 2 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof`    the lens, on the CLOSE-UPS only (the poses that spread CLOSE): the part in focus, what lies in front and behind melts
 *  `air`    light in the air behind the plane in focus — off until a planche shows a net gain at 270 px
 *  `finish` the surface of the solid parts: machining grain and handling marks that break the reflections
 *  Every pose says its lens (dof 0 unless it spreads CLOSE): a cut never inherits the blur of the shot before. */
export const LOOK = { dof: 6, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

/** How far the box has risen above the rest of the recorder (cm): once the module is `free`, it rises with `depth`
 *  while the chassis and the beacon stay on the bottom. */
export const sepOf = (S) => Math.max(0, S.free) * Math.max(0, DEEP.floor - S.depth) * 100;
/** 023's plane: the ground under its wheels for a cruise altitude, the threshold of its island far ahead. */
const AIR_GROUND = -(FUSE.r + GEAR.h) - ALT.depth;

// The first frame is the hook, « Une boîte noire coule. » : under the water at night, from below (contre-plongée),
// the orange recorder sinking toward the camera and turning slowly, a ring leaving its beacon; behind it, the faint
// surface and the tail of the A330 of glass sinking into the black. PROVISIONAL (candidate a, docs/034-actes.md):
// the planche of four candidates chooses it, and it is pasted here before the acts are staged.
export const POSE0 = { tx: 0, ty: 13, tz: 0, d: 120, az: -28, el: -52, fov: 44, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.DEEP,
  /* ── the sea (fond.js) — DEEP only ── */
  depth: DEEP.first, // the box's depth in TRUE metres (0 surface → 3 900 bottom): the header's « Profondeur », the surface and the bottom around the box
  rush: 1, //    the water rushing past the box: marine snow drawn as streaks — + sinking (they go UP), − rising (they go down), 0 still (−1…1)
  wreck: 0, //   the tail section of glass: 0 sinking above and behind the box (WRECK.tailSink) → 1 lying in the debris field on the bottom (set on a cut)
  ping: 0.6, //  the beacon alive: its nose flashes veille once a second (model.js) and a ring leaves it into the water (fond.js) — 0 silent → 1
  range: 0, //   the beacon's reach drawn: the rings stop on a faint veille sphere of PING.reach (≈ 1.85 km) around the box (0–1)
  beam: 0, //    the light that comes down (avril 2011): 0 none → 1 its head at BEAM.stop above the bottom, its cone on the wreck
  shell: 1, //   the X-ray of the sea: the wreck's glass, the bottom's lines, the surface, the snow (0–1)
  spin: 20, //   the box turning about its vertical as it sinks (degrees; the acts move it straight, ≈ 15–25 °/s while sinking)
  tilt: 18, //   …and leaning (degrees, about z: + the beacon end down)
  /* ── the plane (023/avion.js) — AIR only ── */
  ahead: 0.92, // its island's threshold far ahead (023's meaning): move it straight in every AIR shot — a still sea is a still plane
  plane: 1, //   the A330's X-ray (its `shell`): lowered to see the box through the tail (0.35–0.5)
  you: 1, //     you at the left window (023's glass figure), « ton avion »
  /* ── the system (model.js) ── */
  explode: 0, // on the bench: 0 assembled → 1 the exploded view, from the front to the heart (beacon, its battery, chassis, boards; the module stays)
  xray: 0, //    the chassis, its boards and the beacon turn to glass (0 solid → 1): the solid module shows inside — « rien n'est blindé »
  free: 0, //    the module free of the chassis (0/1, set on a cut): it rises with `depth`, the rest stays on the bottom (sepOf)
  apart: 0, //   the chassis and the beacon broken apart on the bottom, dark, around the module (0–1) — the chute
  section: 0, // the module cut open (a quarter removed) and its layers spread a little: steel, insulation, heat absorber, the memory (0–1)
  heat: 0, //    a flame licks the steel and dies on the insulation (0–1): « onze cents degrés »
  crush: 0, //   the water's pressure: signal arrows squeezing the module from every side (0–1, their size and reach)
  flex: 0, //    the steel shell flexes under it — and holds (0–1: a slight dent that springs back when it drops)
  hold: 0, //    the steel lights veille: it held (0–1)
  charge: 1, //  the beacon's battery, its level drawn veille (1 full → 0 empty): « sa balise compte déjà les jours »
  read: 0, //    the memory board lights veille and its data rise from it in green lines (0–1): « et on la lit »
  shine: 0, //   the reflective bands catch the light — a sheen that sweeps along them (0–1): « elle est orange vif »
  litBeacon: 0, litPile: 0, litCase: 0, litCore: 0, // the part the voice is naming glows faintly veille (case = chassis + boards)
  litSteel: 0, litInsul: 0, litAbsorb: 0, //          the layer the voice is naming (with `section` 1)
  /* ── the header (main.js) ── */
  days: 30, //   the beacon's days left: « J−30 » … « J−0 » (the acts move it; never a hidden clock)
  months: 0, //  months on the bottom once the beacon is silent: « +1 mois », « +12 mois », « +23 mois » (shown when ≥ 0.5)
  alarm: 0, //   the countdown turns signal (0 ink → 1 signal), held frank: from « taise »
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  // (`pool` is also the halo the recorder lies on, on the bottom: fond.js)
  fx: 0, fy: 12.5, fz: 0, fs: 60, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). Starting points, set on stubs:
 *  the builders' journals give better ones. DEEP and BENCH poses are written around the box (same frame: the cut
 *  between them is in place); AIR poses in the plane's frame (023). Close poses assume spin 0, tilt 0. */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [IX, IY, IZ] = REC.inPlane;
export const VIEW = {
  hook: POSE0,
  /* ── DEEP (the box at the origin) ── */
  // the beacon, close, three quarters front: its nose and the ring leaving it (fs 30) — « sa balise ne tient que trente jours »
  beacon: { ...P, ...CLOSE, tx: -9, ty: 19, tz: 0, d: 48, az: -58, el: 8, shift: 110 },
  // riding down with the box, from a little below and to the side, the snow streaking up (fs 60) — « elle descend dans le noir »
  sink: { ...P, tx: 0, ty: 12.5, tz: 0, d: 170, az: -38, el: -16, fov: 40, shift: 130 },
  // the whole water column, true scale: the bottom, the box (a veille point), the reach sphere, the surface 3.9 km up (fs 400000) — « quelques kilomètres, au mieux »
  range: { ...P, tx: 0, ty: 175000, tz: 0, d: 1100000, az: -36, el: 4, fov: 40, shift: 0, drift: 0 },
  // further still: the reach a small veille bubble on the bottom of a black ocean (fs 2000000) — « au mieux »
  ocean: { ...P, tx: 0, ty: 300000, tz: 0, d: 4000000, az: -36, el: 16, fov: 40, shift: 0, drift: 0 },
  // the box lying on the bottom, three quarters, on its halo (fs 60) — « taise », « Alors… »
  floor: { ...P, tx: 0, ty: 11, tz: 0, d: 260, az: -40, el: 22, fov: 32, shift: 130 },
  // the box small and alone on the bottom, the black water above it (fs 3000) — « zéro », « elle attend »
  alone: { ...P, tx: 0, ty: 400, tz: 0, d: 3000, az: -34, el: 9, fov: 40, shift: 60 },
  // the module through the glass chassis, the pressure on it (fs 40) — « l'eau pèse, l'acier tient »
  crushed: { ...P, ...CLOSE, tx: 2, ty: 18, tz: 0, d: 72, az: -42, el: 10, shift: 120 },
  // the wreck field under the light that comes down, the box at its edge (fs 9000) — « on retrouve l'épave »
  wreck: { ...P, tx: -2200, ty: 700, tz: -3800, d: 9500, az: -18, el: 24, fov: 40, shift: 0 },
  // the module rising in the beam, from below: the bottom and the dark chassis fall away under it (fs 80) — « sa mémoire remonte »
  rise: { ...P, tx: 0, ty: 19, tz: 0, d: 170, az: -30, el: 24, fov: 40, shift: 160 },
  // the chute: the broken chassis and beacon dark on the bottom, the module alone in the light (fs 120)
  verdict: { ...P, tx: 0, ty: -30, tz: 0, d: 240, az: -36, el: 14, fov: 34, shift: 80 }, // with free 1, apart 1, depth 3 899.2 (the module 80 cm up)
  /* ── AIR (023's plane frame: nose −x, left side +z) ── */
  // the whole A330 at night, three quarters rear-left, a little above: the tail toward the camera (fs 3500) — « ton avion »
  plane: { ...P, tx: 400, ty: 0, tz: 0, d: 12500, az: 48, el: 10, fov: 40, shift: 120 },
  // the tail, the box seen through the glass (shell `plane` ≈ 0.45) (fs 700)
  tail: { ...P, tx: IX, ty: IY + 50, tz: IZ, d: 900, az: 20, el: 18, fov: 32, shift: 110 },
  // the box in the tail, close (fs 60) — « elle n'écoute peut-être que deux heures »
  tailBox: { ...P, ...CLOSE, tx: IX, ty: IY + 13, tz: IZ, d: 240, az: 24, el: 30, shift: 110 }, // PROVISIONAL: at d 120 the skin of glass hides the box (stub planche)
  /* ── BENCH (the box's base at the origin, as on the bottom) ── */
  // the recorder whole on its pool (fs 20)
  whole: { ...P, tx: 0, ty: 12, tz: 0, d: 112, az: -40, el: 16, shift: 110 },
  // the exploded view in ONE vertical frame: the beacon and its battery up front, the chassis and boards below, the module at the centre
  exploded: { ...P, tx: 0, ty: 22, tz: 2, d: 180, az: -40, el: 20, shift: 60 },
  // the beacon and its battery, in the exploded view (fs 20)
  beaconBench: { ...P, ...CLOSE, tx: -26, ty: 31, tz: 12, d: 58, az: -52, el: 10, shift: 110 },
  // the chassis and the boards, glass, below (fs 30)
  caseBench: { ...P, tx: 6, ty: 12, tz: -6, d: 120, az: 35, el: 22, shift: 110 },
  // the module alone on its halo, close (fs 15) — « la mémoire »
  core: { ...P, ...CLOSE, tx: -4, ty: 27, tz: 12, d: 58, az: -38, el: 12, shift: 110 },
  // the module in section, its layers spread (fs 15) — « de l'acier, un isolant, un absorbeur »
  section: { ...P, ...CLOSE, tx: -5, ty: 27, tz: 12, d: 50, az: -28, el: 20, shift: 110 },
  // the recorder whole, close on its bands and its orange paint (fs 25) — « elle est orange vif »
  like: { ...P, ...CLOSE, tx: -2, ty: 9, tz: 0, d: 74, az: -52, el: 8, shift: 110 },
};

/** What a cut to the bench sets, whatever came before: the recorder whole, at rest, nothing lit. The header's
 *  `days`, `months`, `alarm` and `depth` keep their story values (they are the acts'). */
export const BENCHED = {
  rush: 0, wreck: 1, ping: 0, range: 0, beam: 0, shell: 0, spin: 0, tilt: 0,
  explode: 0, xray: 0, free: 0, apart: 0, section: 0, heat: 0, crush: 0, flex: 0, hold: 0, read: 0, shine: 0,
  litBeacon: 0, litPile: 0, litCase: 0, litCore: 0, litSteel: 0, litInsul: 0, litAbsorb: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 12.5, fz: 0, fs: SIZE,
};
/** What a cut to the bottom sets: the box lying still on the bottom at 3 900 m, the wreck around it, silent. */
export const STAGED = {
  depth: DEEP.floor, rush: 0, wreck: 1, ping: 0, range: 0, beam: 0, shell: 1, spin: 0, tilt: 0,
  explode: 0, xray: 0, free: 0, apart: 0, section: 0, heat: 0, crush: 0, flex: 0, hold: 0, read: 0, shine: 0,
  litBeacon: 0, litPile: 0, litCase: 0, litCore: 0, litSteel: 0, litInsul: 0, litAbsorb: 0,
  mood: 1, gel: 0, pool: 0.25, fx: 0, fy: 12.5, fz: 0, fs: 60,
};
/** What a cut to the plane sets: night over the sea, the A330 intact in cruise, the box in its tail, assembled. */
export const FLOWN = {
  ahead: 0.92, plane: 1, you: 1, ping: 0, spin: 0, tilt: 0,
  explode: 0, xray: 0, free: 0, apart: 0, section: 0, heat: 0, crush: 0, flex: 0, hold: 0, read: 0, shine: 0,
  litBeacon: 0, litPile: 0, litCase: 0, litCore: 0, litSteel: 0, litInsul: 0, litAbsorb: 0,
  mood: 0, gel: 0, fx: 400, fy: 0, fz: 0, fs: 3500,
};

export function buildWorld(stage) {
  const { scene } = stage;
  const system = buildSystem();
  const fond = buildFond();
  const avion = buildAvion();
  const bench = makeBench(SIZE);

  // DEEP: the box turns about its centre (spin, tilt) — a pivot at REC.centre, the root hung back under it
  const deepPivot = new THREE.Group();
  deepPivot.position.set(...REC.centre);
  deepPivot.rotation.order = "YZX";
  const deepMount = new THREE.Group();
  deepMount.position.set(-REC.centre[0], -REC.centre[1], -REC.centre[2]);
  deepPivot.add(deepMount);
  fond.group.add(deepPivot);
  // AIR: a mount in the A330's tail, on the plane's own group (it pitches and banks with it) — 023's file untouched
  const tailMount = new THREE.Group();
  tailMount.position.set(...REC.inPlane);
  avion.mount.parent.add(tailMount);
  // BENCH: the recorder's base at BENCHAT (the origin, as on the bottom)
  const benchMount = new THREE.Group();
  benchMount.position.set(...BENCHAT);
  bench.group.add(benchMount);

  scene.add(fond.group, avion.group, bench.group);
  stage.grade.gel.set(0xff5b2e);
  // 023 draws its control surfaces dead (signal) or alive (veille): here the plane is simply flying, and the only
  // system alive is the recorder — so they are quietened to ink, from outside (023's file is not changed). Its
  // surface material is the one dark, double-sided solid (023/avion.js, `fx.surfMat`), its edges the lines on it.
  const quiet = { mats: [], edges: [] };
  avion.group.traverse((o) => {
    const m = o.material;
    if (o.isMesh && m && m.side === THREE.DoubleSide && m.color?.getHex() === 0x2c3236 && m.emissive && !quiet.mats.includes(m)) {
      quiet.mats.push(m);
      const e = o.children[0]?.material;
      if (e?.color && !quiet.edges.includes(e)) quiet.edges.push(e);
    }
  });
  const INKDIM = new THREE.Color(0xe9e4d8).multiplyScalar(0.7);

  return {
    system, fond, avion, bench,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const onBench = S.set === SET.BENCH;
      const inAir = S.set === SET.AIR;
      const deep = !onBench && !inAir;
      bench.group.visible = onBench;
      avion.group.visible = inAir;
      fond.group.visible = deep;
      const home = onBench ? benchMount : inAir ? tailMount : deepMount;
      if (system.root.parent !== home) home.add(system.root);
      deepPivot.rotation.set(0, (deep ? S.spin : 0) * DEG, (deep ? S.tilt : 0) * DEG);

      system.update({
        bench: onBench ? 1 : 0, explode: onBench ? S.explode : 0, xray: S.xray, sep: deep ? sepOf(S) : 0, apart: deep ? S.apart : 0,
        section: S.section, heat: S.heat, crush: S.crush, flex: S.flex, hold: S.hold, ping: S.ping, charge: S.charge,
        read: S.read, shine: S.shine, litBeacon: S.litBeacon, litPile: S.litPile, litCase: S.litCase, litCore: S.litCore,
        litSteel: S.litSteel, litInsul: S.litInsul, litAbsorb: S.litAbsorb,
      }, time, px);

      if (onBench) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else if (inAir) {
        avion.update({
          whirl: 0, ground: AIR_GROUND, threshold: -ISLAND.far * S.ahead, ahead: S.ahead, pitch: 1.5, bank: 0, dawn: 0, wind: 0.5,
          shell: S.plane, engines: 2, fuel: 0.7, leak: 0, lines: 1, press: 0, flow: 0, surf: 1, stick: 0,
          pax: 1, you: S.you, grip: 0, brakes: 0, gear: 0, tires: 0, runway: 0, made: 0, mood: S.mood,
        }, time, px);
        for (const m of quiet.mats) m.emissive.setRGB(0, 0, 0);
        for (const m of quiet.edges) m.color.copy(INKDIM);
      } else {
        fond.update({
          depth: S.depth, rush: S.rush, wreck: S.wreck, ping: S.ping, range: S.range, beam: S.beam, shell: S.shell,
          pool: S.pool, mood: S.mood,
        }, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : inAir ? 0.45 / Math.max(60000, d * 2.4) : fond.fog(d);
    },
  };
}

export { REC, CHASSIS, BOARDS, MODULE, LAYERS, BEACON, PING, SYSTEM, BENCHAT, DEEP, WRECK, BEAM };
