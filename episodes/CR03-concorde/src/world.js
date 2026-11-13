// CR03 — Concorde : the world. This file is the contract between the acts:
//   · the three maquettes (plan.js): the ground (piste.js) and THE AIRCRAFT (concorde.js) in SET.PISTE, tank n° 5 in section
//     (reservoir.js) in SET.RESERVOIR, far away — only the set `S.set` names is shown
//   · FIRST   the state of the world on the first frame — the CLOSED list of numbers the acts may move
//   · POSE0   the camera of the first frame, and VIEW: the poses the acts start from (PROVISIONAL: set on grey stubs)
//   · STAGED  what a cut to each place sets (which set, its light) · BENCHED: the tank as it failed, at the start of `depuis`
//   · apply   what each number does to the world, every frame (it also places the aircraft and writes the flow gauge)
// The acts (acte1, acte2, acte2b, acte2c, acte3, fin) only write st / shot / path / cut / chip / tl calls against it.
//
// LE NOIR CHAUD (kit/lib/reconstitution.js): satin clay maquettes, the studio's softbox and an amber spot, the part in fault in red
// (`culprit` picks it — plan.js CULPRIT, one table for all —, `fault` lights it), green = what works (`ok`), `depuis` 0 → 1 the
// correction. Never call blocks.js's setMood: recon.setMood(S.depuis) after stage.focus, every frame.
import * as THREE from "three";
import { setupReconstitution, setOk } from "@kit/reconstitution.js";
import { ORIGIN, RUNWAY, trajZ, TANK5, ENGINES, GEAR, STRIP, V1_LINE, FOUND, GROUND, IMPACT, PANEL } from "./plan.js";
import { buildConcorde } from "./concorde.js";
import { buildPiste } from "./piste.js";
import { buildReservoir } from "./reservoir.js";

export const SET = { PISTE: 0, RESERVOIR: 1 };
/** ≈ the radius of the subjects: sizes the light, the shadows (createStage scale). The aircraft is 308 long, the bay 120. */
export const SIZE = 150;

/** The studio options (docs/recette-agents.md). `dof` on the close-ups only (poses that spread CLOSE); `finish` off: clay has no machining. */
export const LOOK = { dof: 6, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };
const CLOSE = { dof: LOOK.dof };
const P = { side: 0, roll: 0, drift: 0.25, dof: 0 };

/** A point of a fixed maquette, in the world: W("reservoir", [20, 85, 0]). */
export const W = (name, [x, y, z]) => [ORIGIN[name][0] + x, ORIGIN[name][1] + y, ORIGIN[name][2] + z];

/* THE AIRCRAFT'S PLACE (the same law world.apply uses): its origin (the main gear, on the ground) at x = −run, on the runway's axis,
   then along TRAJ — a slow curve to the left (+z) past `bend`, which also yaws it. alt lifts it, pitch raises the nose (about the main
   gear: the rotation on the ground is right), bank lowers the LEFT wing. */
function trajYaw(run) {
  const h = 40;
  return Math.atan2(trajZ(run + h) - trajZ(run - h), 2 * h);
}
const _o = new THREE.Object3D();
_o.rotation.order = "YZX";
const _v = new THREE.Vector3();
function placePlane(obj, run, alt, pitch, bank) {
  obj.position.set(RUNWAY.start - run, alt, trajZ(run));
  obj.rotation.set(THREE.MathUtils.degToRad(bank), trajYaw(run), -THREE.MathUtils.degToRad(pitch), "YZX");
}
/** A point of the aircraft (its local frame, plan.js), in the world, for the aircraft at { run, alt, pitch, bank }. */
export function onPlane({ run = 0, alt = 0, pitch = 0, bank = 0 }, local) {
  placePlane(_o, run, alt, pitch, bank);
  _o.updateMatrixWorld(true);
  _v.set(...local).applyMatrix4(_o.matrixWorld);
  return [_v.x, _v.y, _v.z];
}
const aimAt = ([tx, ty, tz]) => ({ tx, ty, tz });
/** The light around a point (fx fy fz: the subject, fs: its size). */
export const lit = ([fx, fy, fz], fs) => ({ fx, fy, fz, fs });

/* Where the aircraft stands in the shots the poses are set for (the acts move run / alt / pitch / bank and re-aim). */
export const AT = {
  first: { run: 10300, alt: 0, pitch: 2, bank: 0 }, // 16:43:13: the rotation begins, the fire already trails
  roll: { run: 1500, alt: 0, pitch: 0, bank: 0 }, // t1: early in the take-off roll
  dessous: { run: 16000, alt: 420, pitch: 6, bank: 0 }, // the reservoir beat (an explanation, not a moment): high enough to be seen from below
  air: { run: 14500, alt: 60, pitch: 10, bank: 0 }, // t5: just airborne
  low: { run: 23000, alt: 300, pitch: 10, bank: 0 }, // t6: « 60 mètres », it no longer climbs
  bourget: { run: 25500, alt: 300, pitch: 10, bank: 2 }, // t7
  fall: { run: 30000, alt: 280, pitch: 12, bank: 10 }, // t8 (bank goes to ≈ 100° and the aircraft drops: the acts)
};

/** What a cut to each place sets: which set, and the light around it. The acts move fx fy fz fs with the subject. */
export const STAGED = {
  piste: { set: SET.PISTE, ...lit(onPlane(AT.first, [0, 20, 0]), 160) },
  reservoir: { set: SET.RESERVOIR, ...lit(W("reservoir", [20, 85, 0]), 90) },
};

export const FIRST = {
  // which place is shown (SET), and the light: what it stands around (fx fy fz) and its size (fs)
  ...STAGED.piste,
  // the part in fault: `culprit` names it (plan.js CULPRIT: 1 the strip · 2 tank 5 and its panel · 3 tyre 2 · 4 engine 2 · 5 the left
  // gear; 0 none), `fault` 0 → 1 lights it red · `ok` 0 → 1 what works in green (the wing tanks, setOk) · `depuis` 0 → 1 the
  // correction (light, grid and halo to green; tank 5 red → green)
  culprit: 0, fault: 0, ok: 0, depuis: 0,
  // THE FLOW GAUGE (index.html #gauge, written by apply — a chip in the top slot, not 3D): shown (`gauge`), the needle in kg/s
  // (`debit`, 0 … 70), the mark « 4 » lit and kept (`mark`)
  gauge: 0, debit: 0, mark: 0,
  // THE AIRCRAFT (concorde.js; world places it): `run` the distance rolled / flown (plan.js RUN: v1 6200, strip 8920, rotate 10300,
  // liftoff 12800) · `alt` height of the main gear above the ground (−100: no aircraft) · `pitch` nose up (°) · `bank` LEFT wing down (°) ·
  // each engine's thrust n1 … n4 (1 full reheat → 0 out: the blades' spin, the nozzle's flame) · `gear` 1 down → 0 up ·
  // `burst` tyre 2 shreds (0 whole → 1 burst) · `chunk` the tyre piece flies from tyre 2 up to the intrados under tank 5 (1 = the hit)
  // · `surge` engines 1 and 2 choke (flame puffs out of their intakes) · `cutaway` the outer wall of the left nacelles opened (the two
  // engines in section) · `tear` the panel of tank 5 bulges and is blown off (also in reservoir.js) · `leak` the kerosene out of
  // tank 5 (< 0.15 a drip from a small hole — the 1979 case — → 1 the 60 kg/s jet) · `fire` the trail of fire behind the left wing
  run: AT.first.run, alt: AT.first.alt, pitch: AT.first.pitch, bank: AT.first.bank,
  n1: 1, n2: 0.7, n3: 1, n4: 1, gear: 1, burst: 1, chunk: 1, surge: 0.3, cutaway: 0, tear: 1, leak: 1, fire: 0.85,
  // THE GROUND (piste.js): `stop` the stopping bar ahead of the aircraft (principe: green while it fits, red past the end — it reads
  // run) · `v1` the V1 line drawn across the runway · `ruler` the 43 cm rule unrolled beside the strip · `found` the panel and the
  // tyre piece lying on the runway (preuve) · `soot` the soot trail on the runway (issue) · `traj` the amber trajectory drawn on the
  // ground from the runway to Gonesse · `bourget` Le Bourget's runway lights on · `inspect` the inspection vehicle along the runway
  stop: 0, v1: 0, ruler: 0, found: 0, soot: 0, traj: 0, bourget: 0, inspect: 0,
  // TANK 5 IN SECTION (reservoir.js): `hit` the tyre piece flies up to the intrados (1 = contact) · `dent` the intrados pushed in ·
  // `wave` the pressure front across the kerosene (0 at IMPACT → 1 at PANEL) · `bulge` the panel bulges outward · `tear` (shared)
  // the panel blown off · `gush` the kerosene out of the hole · `kevlar` the lining of `depuis` (with it the same hit does not tear)
  hit: 0, dent: 0, wave: 0, bulge: 0, gush: 0, kevlar: 0, kero: 0.5, // `kero` the kerosene in the cut lights up (0.5 dull → 1 on « plein »)
};

/** `depuis`: tank 5 as it failed (the panel torn off, red, the intrados dented), before the Kevlar heals it. */
export const BENCHED = {
  ...STAGED.reservoir, culprit: 2, fault: 1, hit: 1, dent: 1, wave: 1, bulge: 1, tear: 1, gush: 0, kevlar: 0, kero: 1, gauge: 0,
};

/* The camera. Each pose is complete (nothing is inherited across a cut). PROVISIONAL: set on grey stubs (docs/journal/CR03-architecte.md);
   the decor agents give the poses that frame best in their journals. */
// el < 0 puts the camera BELOW its target: on the ground, keep ty + d·sin(el) ≥ 1.5 (the camera never goes under the asphalt)
const pose = (point, o) => ({ ...P, fov: 30, shift: 0, ...aimAt(point), ...o });
export const VIEW = {
  // PISTE — (a) the first image: on the runway by the strip, looking up the runway at the Concorde rotating, the fire toward you
  first: pose(onPlane(AT.first, [30, 24, 0]), { d: 1370, az: 89.2, el: -0.8, fov: 24, shift: 60 }), // the camera ≈ 25 behind the strip, 4 up
  // (b) ahead of it, low on its left: it comes at you, the nose rising, the fire under the left wing
  charge: pose(onPlane(AT.first, [-30, 22, 0]), { d: 950, az: -38, el: -1.1, fov: 30, shift: 60 }),
  // (c) its left profile, low: the whole trail
  profil: pose(onPlane(AT.first, [40, 25, 0]), { d: 1500, az: 6, el: -0.7, fov: 26, shift: 40 }),
  // (d) under the left wing, close: tank 5, the gear, the jet of kerosene on fire
  aile: pose(onPlane(AT.first, [-16, 12, 18]), { d: 90, az: 28, el: -6, fov: 34, shift: 0 }),
  // principe: the runway from above and behind, it recedes up the frame; the aircraft, the stopping bar, the V1 line
  runway: pose([-5943, 0, 0], { d: 15002.5, az: 84.26, el: 36.86, fov: 38, shift: 0 }), // fs ≈ 6 000 on this shot
  // t2: the V1 line at ground level, the nose gear crossing it
  v1: pose([V1_LINE.x, 8, 0], { d: 170, az: -52, el: 8, fov: 30, shift: 60 }),
  // t3: tyre 2 on the strip, seen from ahead and INBOARD (az < −90: tyre 2 is the inner front wheel of the left bogie)
  pneu: pose([STRIP.at[0] - 3, 8, STRIP.at[2]], { d: 80, az: -118, el: -2, fov: 30, shift: 40, ...CLOSE }),
  // t1: the strip alone on the asphalt, close (the rule unrolls beside it)
  lamelle: pose([STRIP.at[0], 0.4, STRIP.at[2]], { d: 16, az: -60, el: 24, fov: 30, shift: 40, ...CLOSE }),
  // t1: the aircraft at the start of the runway, its four nozzles, from ahead
  depart: pose(onPlane(AT.roll, [0, 22, 0]), { d: 700, az: -62, el: 2, fov: 30, shift: 60 }),
  // reservoir: the aircraft climbing out, seen from below, three-quarter: the wing tanks on the intrados
  dessous: pose(onPlane(AT.dessous, [-10, 14, 10]), { d: 800, az: 30, el: -42, fov: 32, shift: 0 }),
  // t5: the two left engines, from below and ahead (the cutaway opens on their outer side)
  moteurs: pose(onPlane(AT.air, [40, 13, 30]), { d: 180, az: -32, el: -12, fov: 30, shift: 40, ...CLOSE }),
  // t6: in flight, its left profile, low over the fields, its shadow below
  vol: pose(onPlane(AT.low, [0, -110, 0]), { d: 1400, az: 8, el: 2, fov: 30, shift: 0 }),
  // t6: the gear legs, down, from ahead and below
  train: pose(onPlane(AT.low, [0, 8, 19]), { d: 150, az: -22, el: -8, fov: 30, shift: 40, ...CLOSE }),
  // t7: from high behind it: the trajectory from Roissy, Gonesse's roofs, Le Bourget far ahead
  carte: pose([-27000, 0, 2500], { d: 26000, az: 78, el: 42, fov: 34, shift: 0 }), // fs ≈ 12 000
  // t8: three-quarter rear, its nozzles; it banks and drops out of the frame
  chute: pose(onPlane(AT.fall, [40, 20, 0]), { d: 720, az: 58, el: 4, fov: 30, shift: 40 }),
  // issue: the empty runway, low, the strip in the foreground, the soot trail away (the first image without the aircraft)
  vide: pose([-10200, 9, 26], { d: 1310.03, az: 90.31, el: -0.245, fov: 24, shift: 240 }), // fs ≈ 60
  // preuve: the panel on the asphalt, three-quarter, on its halo; the strip and the tyre piece beside it
  preuve: pose([FOUND.panel[0], 0.3, FOUND.panel[2]], { d: 10, az: -58, el: 30, fov: 30, shift: 40, ...CLOSE }),
  // depuis: the runway from above, the inspection vehicle running along it
  inspection: pose([-10500, 0, 0], { d: 15000, az: 78, el: 52, fov: 30, shift: 0 }),
  // RESERVOIR — the bay in section, three-quarter (the master shot of `defaut`, depuis)
  bay: pose(W("reservoir", [18, 76, -4]), { d: 470, az: -62, el: 5, fov: 30, shift: 40 }),
  // close on the impact under the intrados
  impact: pose(W("reservoir", [-2, 70, -36]), { d: 120, az: -48, el: 2, fov: 30, shift: 40, ...CLOSE }),
  // close on the panel that gives way
  panneau: pose(W("reservoir", [-2, 66, 30]), { d: 130, az: -64, el: -6, fov: 30, shift: 40, ...CLOSE }),
  cede: pose(W("reservoir", [10, 66, 8]), { d: 380, az: -58, el: 4, fov: 30, shift: 40 }),
  couverture: pose(W("reservoir", [10, 60, 6]), { d: 350, az: -56, el: 5, fov: 30, shift: 60 }),
  arriere: pose(onPlane(AT.first, [60, 25, 0]), { d: 1300, az: 48, el: 5, fov: 30, shift: 20 }), // the fire along its whole length
};
/** The first frame (candidate c « arrière », d 900). Sharp. */
export const POSE0 = { ...VIEW.arriere, d: 900, drift: 0 }; // chosen 13/11 on the board of four (.cache/planches/CR03/image0b.jpg, « c d900 »): three-quarter rear, the fire trailing the whole length

// the flow gauge (index.html #gauge): 0 … 70 kg/s over 180°, written only when it changes
const GAUGE = { max: 70 };
function gaugeWriter() {
  const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
  const el = $("gauge"), needle = $("gauge-needle"), val = $("gauge-val"), mark = $("gauge-mark");
  const last = { a: -1, v: -1, n: -1, m: -1 };
  return (S) => {
    if (!el) return;
    const a = Math.round(Math.max(0, Math.min(1, S.gauge ?? 0)) * 100) / 100;
    const v = Math.max(0, Math.min(GAUGE.max, S.debit ?? 0));
    const n = Math.round(v * 10) / 10;
    const m = Math.round(Math.max(0, Math.min(1, S.mark ?? 0)) * 100) / 100;
    if (a !== last.a) el.style.opacity = String((last.a = a));
    if (n !== last.n) {
      last.n = n;
      needle.style.transform = `rotate(${-90 + (180 * n) / GAUGE.max}deg)`;
      const shown = Math.round(n);
      if (shown !== last.v) val.textContent = String((last.v = shown));
      el.dataset.zone = n > 4.5 ? "rouge" : "ok";
    }
    if (m !== last.m) mark.style.opacity = String((last.m = m));
  };
}

export function buildWorld(stage) {
  const { scene } = stage;
  const recon = setupReconstitution(stage, { floor: 0 });
  const piste = buildPiste();
  const concorde = buildConcorde();
  const reservoir = buildReservoir();
  piste.group.position.set(...ORIGIN.piste);
  reservoir.group.position.set(...ORIGIN.reservoir);
  scene.add(piste.group, concorde.group, reservoir.group);
  concorde.group.rotation.order = "YZX";
  const faultAt = new THREE.Vector3();
  const writeGauge = gaugeWriter();

  return {
    piste, concorde, reservoir,
    /** Every frame (and several times per frame: it depends on S and `time` only — no allocation). */
    apply(S, time) {
      const px = stage.pixelScale();
      const shown = Math.round(S.set);
      setOk(S.ok ?? 0); // before the sets' update: their setAlarm reads it
      const onPiste = shown === SET.PISTE;
      piste.group.visible = onPiste;
      concorde.group.visible = onPiste && S.alt > -50; // `alt` −100: the aircraft is gone (the empty runway of `issue`)
      reservoir.group.visible = !onPiste;
      if (onPiste) {
        placePlane(concorde.group, S.run, S.alt, S.pitch, S.bank);
        piste.update(S, time, px);
        concorde.update(S, time, px);
      } else reservoir.update(S, time, px);
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      // the halo under the part in fault (each decor moves its A.fault onto its culprit); only when the part is near the ground
      const c = Math.round(S.culprit);
      const owner = !onPiste ? reservoir : c === 1 ? piste : concorde;
      owner.A.fault.getWorldPosition(faultAt);
      const heal = !onPiste ? S.depuis : 0;
      const near = faultAt.y < 90 ? 1 : 0;
      const k = c > 0 ? S.fault * near : 0;
      recon.halo({ at: [faultAt.x, 0, faultAt.z], r: owner.haloR ?? 40, amount: 0.5 * Math.max(k, heal), k: heal });
      recon.setMood(S.depuis); // after stage.focus: the light re-aims
      if (scene.fog) scene.fog.density = onPiste ? 0.000022 : 0.0001;
      writeGauge(S);
    },
  };
}

// (imports kept for the acts' reference: what the poses are measured against)
export const REF = { TANK5, ENGINES, GEAR, GROUND, PANEL };
