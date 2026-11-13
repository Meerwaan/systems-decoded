// CR03 — acte2b.js · t3 → t5 (tot3 44,38 → tot6 71,89): the tyre, the fire, the engine. Three strong moments, no cut on any.
//   A1 tot3 → (lamelle)   cut (the V1 line → the same ground, further on): a long lens dead ahead of the left bogie, at ground
//                         level; the Concorde comes at you down the runway, tyre 2 turns red on « pneu », the strip is circled
//                         where it lies; the tyre reaches it on « lamelle ». Then a cut 0.45 s before « Il éclate ».
//   A2 → tot4             close on the bogie (VIEW.pneu, carried with the aircraft): it bursts ON « éclate » (the roll slows to a
//                         crawl: the film is in slow motion from the contact on); the camera tilts up with the piece of tyre to
//                         the intrados — the hit ON « frappe », the camera takes it (jolt); tank 5 red, circled.
//   B  tot4 → tot5        cut: the shot of the first image, wider. The jet of kerosene already trails; the fire takes ON
//                         « flammes »; the gauge: 4 then 60 ON « soixante »; the camera travels back along the trail; the mark
//                         4 pulses on « quatre »; the fire swells on « dix fois ».
//   C  tot5 → tot6        cut (the trail from behind → the nozzles beside it): the two left engines from behind and below, their
//                         amber darts, the fire beyond; « L'alarme feu » chip; engine 2 red and circled on « moteur », its dart
//                         shortens on « avale » and dies out on « coupe »; engine 1's falters in steps on « s'étouffer ».
// Hands over at tot6 (acte2c cuts and sets everything): AT.air-ish (run ≈ 15 300, alt ≈ 70), n1 0.35, n2 0, culprit 4.
// The aircraft moves in every shot: the camera's aim and the light are computed from where it is (onPlane) at each key.
import * as THREE from "three";
import { feutre } from "@kit/reconstitution.js";
import { glide } from "@kit/direct.js";
import { STAGED, SET, VIEW, AT, onPlane, lit } from "./world.js";
import { RUN } from "./plan.js";

const TYRE2 = [-4.2, 3, 17.5]; // tyre n° 2 (local), its centre
const NOZZLES = [118, 13, 30]; // the nozzles of engines 1 and 2 (local): the shot of t5 is from behind, the reheat darts read
const NOZ2 = [120, 13.5, 26], NOZ1 = [120, 13.5, 34]; // engine 2 (inboard), engine 1 (outboard)
const ALL_ON = { n1: 1, n2: 1, n3: 1, n4: 1 };
const aim = ([tx, ty, tz]) => ({ tx, ty, tz });

export default function acte2b({ D, world }) {
  const { tl, st, cut, path, chip, punch, jolt } = D;
  const t = D.times({
    tot3: "tot3", pneu: "t3:pneu", lamelle: "t3:lamelle", eclate: "eclate", morceau: "t3:morceau", frappe: "frappe1",
    dessous: "t3:dessous",
    tot4: "tot4", flammes: "flammes", fuit: "t4:fuit", soixante: "soixante", souviens: "t4:Souviens", quatre: "t4:quatre",
    la: "t4:Là", dixfois: "dixfois",
    tot5: "tot5", alarme: "alarme1", sonne: "t5:sonne", ton: "t5:Ton", moteur: "t5:moteur", avale: "t5:avale", coupe: "coupe",
    le: "t5:Le#2", etouffer: "etouffer", tot6: "tot6",
  });

  /* ───────────── A · 16:43:10 — the tyre ───────────── */
  // the roll: fast down the runway, tyre 2 on the strip ON « lamelle », slowing to a crawl by « éclate », then a crawl
  const S0 = 1.3, S1 = 0.35; // glide: leaves at 1.3 × its mean speed, reaches « éclate » at 0.35 ×
  const fA = glide(S0, S1);
  const durA = t.eclate - t.tot3;
  const LA = 240; // units rolled from the cut to « éclate »
  const R0 = RUN.strip - fA((t.lamelle - t.tot3) / durA) * LA; // so that tyre 2 is ON the strip at « lamelle »
  const R1 = R0 + LA;
  const vEnd = (S1 * LA) / durA; // the crawl (units / s)
  const R2 = R1 + vEnd * (t.tot4 - t.eclate);
  const runA = (time) =>
    time <= t.eclate ? R0 + fA(Math.max(0, (time - t.tot3) / durA)) * LA : R1 + vEnd * (time - t.eclate);
  const atA = (time) => ({ run: runA(time), alt: 0, pitch: 0, bank: 0 });
  const litTyre = (run) => lit(onPlane({ run }, [-4, 3, 17.5]), 40);

  // A1 — the long lens, dead ahead of the left bogie, at ground level: the aircraft comes at you
  const strip = world.piste.A.strip;
  const SX = -RUN.strip + TYRE2[0]; // the strip's x (the contact point of tyre 2)
  const TELE = { tx: SX, ty: 4, tz: 17.5, d: 250, az: -92, el: -0.5, fov: 12, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };
  cut(t.tot3, SET.PISTE, TELE, {
    ...STAGED.piste, ...litTyre(R0), ...atA(t.tot3), ...ALL_ON, culprit: 0, fault: 0, ok: 0, gauge: 0, debit: 0, mark: 0,
    gear: 1, burst: 0, chunk: 0, tear: 0, leak: 0, fire: 0, surge: 0, cutaway: 0,
    stop: 0, v1: 1, ruler: 0, found: 0, soot: 0, traj: 0, bourget: 0, inspect: 0, depuis: 0,
  });
  st(t.tot3, durA, { run: R1, fx: litTyre(R1).fx }, fA);
  st(t.eclate, t.tot4 - t.eclate, { run: R2, fx: litTyre(R2).fx }, "none");
  // where it will happen: the strip circled on the asphalt, until the tyre is on it
  feutre(D, { id: "f2b-strip", anchor: strip, w: 230, h: 120, dy: -10, from: t.tot3 + 0.35, to: t.lamelle + 0.2, seed: 4 });
  // « pneu »: tyre 2 red
  st(t.pneu, 0.12, { culprit: 3, fault: 1 }, "none");
  const cutA2 = t.eclate - 0.45; // the cut, a few frames before « Il éclate »
  path([
    [t.tot3, TELE],
    [t.pneu, { ty: 4.5, d: 232, az: -88.5 }],
    [cutA2, { ty: 5, d: 210, az: -85, fov: 11 }],
  ]);

  // A2 — close on the bogie (VIEW.pneu carried with the aircraft), then up with the piece to the intrados
  const pneuAt = (time, local = [TYRE2[0] - 3, 8, TYRE2[2]]) => aim(onPlane(atA(time), local));
  const PNEU = { ...VIEW.pneu, ...pneuAt(cutA2), shift: 210 }; // the bogie above the captions
  cut(cutA2, null, PNEU);
  st(t.eclate, 0.15, { burst: 1 }, "power2.out");
  punch(t.eclate, 0.06);
  // the piece flies from « morceau » and hits ON « frappe » (chunk 0.85 = the contact), then drops and vanishes
  st(t.morceau, t.frappe - t.morceau, { chunk: 0.85 }, "sine.in");
  st(t.frappe, 0.5, { chunk: 1 }, "none");
  jolt(t.frappe, 0.7, 0.45);
  // « le dessous de l'aile »: tank 5 red, circled
  st(t.dessous - 0.12, 0.12, { culprit: 2, fault: 1 }, "none");
  feutre(D, { id: "f2b-panel", anchor: world.concorde.A.panel, w: 250, h: 150, from: t.dessous - 0.1, to: t.tot4 - 0.15, seed: 7 });
  const UP = [-9, 15, 17]; // between the piece's flight and the intrados
  // (retouche 13/11: the tilt-up bogie → intrados, shift 210 → −150 in 1.7 s, was jerky at 49.9 s: now a cut, a few frames
  //  before « morceau », on the same side (the piece flies up into it), then a slow push to the hit)
  const cutUp = t.morceau - 0.12;
  path([
    [cutA2, PNEU],
    [cutUp, { ...pneuAt(cutUp), d: 76, az: -122 }],
  ]);
  const INTRA = { ...PNEU, ...pneuAt(cutUp, UP), d: 74, az: -126, el: -9, shift: -150 };
  cut(cutUp, null, INTRA);
  path([
    [cutUp, INTRA],
    [t.frappe, { ...pneuAt(t.frappe, UP), d: 70, az: -128, el: -10, shift: -150 }],
    [t.tot4 - 0.02, { ...pneuAt(t.tot4 - 0.02, UP), d: 68, az: -132, el: -10.5, shift: -160 }],
  ]);

  /* ───────────── B · 16:43:13 — the fire ───────────── */
  // the shot of the first image, wider; the aircraft rolls on, rotating
  const RB0 = AT.first.run, RB1 = RB0 + 1500;
  const runB = (time) => RB0 + ((RB1 - RB0) * (time - t.tot4)) / (t.tot5 - t.tot4);
  const pitchB = (time) => (time < t.flammes ? 2 : Math.min(9.5, 8 + (1.5 * (time - t.flammes - 0.8)) / 7));
  const atB = (time) => ({ run: runB(time), alt: 0, pitch: pitchB(time), bank: 0 });
  const backAt = (time, local = [60, 25, 0]) => aim(onPlane(atB(time), local));
  const litB = (time) => lit(onPlane(atB(time), [0, 20, 0]), 160);
  const WIDE = { ...VIEW.arriere, ...backAt(t.tot4), d: 1150, drift: 0 };
  cut(t.tot4, SET.PISTE, WIDE, {
    ...STAGED.piste, ...litB(t.tot4), ...atB(t.tot4), ...ALL_ON, culprit: 0, fault: 0, ok: 0, gauge: 0, debit: 0, mark: 1,
    gear: 1, burst: 1, chunk: 1, tear: 1, leak: 1, fire: 0, surge: 0, cutaway: 0, stop: 0, v1: 1, ruler: 0,
  });
  st(t.tot4, t.tot5 - t.tot4, { run: RB1, fx: litB(t.tot5).fx, fz: litB(t.tot5).fz }, "none");
  // « flammes »: the fire takes and stretches in 0.6 s, the aircraft rotates
  st(t.flammes, 0.6, { fire: 0.85 }, "power2.out");
  st(t.flammes, 0.8, { pitch: 8 }, "sine.out");
  st(t.flammes + 0.8, t.tot5 - t.flammes - 0.8, { pitch: pitchB(t.tot5) }, "none");
  punch(t.flammes, 0.06);
  // engine 2 starts to lose thrust, the intakes lick the fire (the first image's state: n2 0.7, surge 0.3)
  st(t.flammes + 1, 2, { n2: 0.7, surge: 0.3 }, "sine.inOut");
  // « fuit »: the gauge; 4 (the worst case) passed, the needle runs to 60 ON « soixante »
  st(t.fuit, 0.25, { gauge: 1 }, "power2.out");
  st(t.fuit, 0.3, { debit: 4 }, "power1.out");
  st(t.fuit + 0.3, t.soixante - t.fuit - 0.3, { debit: 60 }, "power2.in");
  punch(t.soixante, 0.06);
  // « quatre »: the mark 4 dips and comes back, once
  st(t.quatre - 0.05, 0.2, { mark: 0.15 }, "power2.out");
  st(t.quatre + 0.15, 0.45, { mark: 1 }, "sine.inOut");
  // « dix fois »: the fire swells
  st(t.dixfois, 0.5, { fire: 1 }, "power2.out");
  punch(t.dixfois, 0.06);
  st(t.tot5 - 0.35, 0.25, { gauge: 0 }, "power2.in");
  // the camera: closes on the rotation, then travels back along the trail
  path([
    [t.tot4, WIDE],
    [t.flammes, { ...backAt(t.flammes), d: 1080, az: 42, el: 6 }],
    [t.soixante, { ...backAt(t.soixante), d: 1000, az: 36, el: 6 }],
    [t.souviens, { ...backAt(t.souviens, [160, 22, 10]), d: 1040, az: 46, el: 7, shift: -60 }],
    [t.la, { ...backAt(t.la, [210, 22, 10]), d: 1120, az: 58, el: 7, shift: -140 }],
    [t.tot5 - 0.02, { ...backAt(t.tot5 - 0.02, [230, 22, 10]), d: 1170, az: 64, el: 7, shift: -150 }],
  ]);

  /* ───────────── C · 16:43:22 — the engine ───────────── */
  // cut (the trail seen from behind → the nozzles beside it, from behind and below: the same direction of view): the two left
  // engines, their amber darts; the fire beyond them. The cutaway is NOT used (unreadable at 270 px, docs/journal/CR03-concorde.md):
  // what reads is engine 2's dart dying on « coupe », then engine 1's faltering in steps.
  const RC0 = AT.air.run, RC1 = RC0 + 900;
  const runC = (time) => RC0 + ((RC1 - RC0) * (time - t.tot5)) / (t.tot6 - t.tot5);
  const altC = (time) => AT.air.alt + (10 * (time - t.tot5)) / (t.tot6 - t.tot5);
  const atC = (time) => ({ run: runC(time), alt: altC(time), pitch: AT.air.pitch, bank: 0 });
  const engAt = (time, local = NOZZLES) => aim(onPlane(atC(time), local));
  const litC = (time) => lit(onPlane(atC(time), [100, 13, 28]), 110);
  // (retouche 13/11: from behind, az 46 → 36, the trail, level in the world while the aircraft climbs at 10°, ran 20 units above
  //  the nozzles and came at the lens: a blurred pink slab over the whole top, y 440–1050. Now from forward-outboard, below, sharp:
  //  the fire is a wedge going away behind / right of the nacelles, the two darts separate; the nozzles up at y ≈ 700–1000.)
  const ENG = { fov: 30, side: 0, roll: 0, drift: 0, dof: 0, ...engAt(t.tot5), d: 135, az: -14, el: -11, shift: 100 };
  cut(t.tot5, SET.PISTE, ENG, {
    ...STAGED.piste, ...litC(t.tot5), ...atC(t.tot5), n1: 1, n2: 0.7, n3: 1, n4: 1, culprit: 0, fault: 0, ok: 0,
    gauge: 0, debit: 60, mark: 1, gear: 1, burst: 1, chunk: 1, tear: 1, leak: 1, fire: 1, surge: 0.3, cutaway: 0,
  });
  const lC = litC(t.tot6);
  st(t.tot5, t.tot6 - t.tot5, { run: RC1, alt: altC(t.tot6), fx: lC.fx, fy: lC.fy, fz: lC.fz }, "none");
  chip("chip-feu", null, 96, 470, t.alarme - 0.1, t.ton - 0.12);
  // the marks follow the nozzles (empty points on the aircraft)
  const noz2 = new THREE.Object3D();
  noz2.position.set(...NOZ2);
  world.concorde.group.add(noz2);
  // « moteur »: engine 2 red, circled; « avale »: it chokes (its dart shortens); « coupe »: its blades and its dart die out
  st(t.moteur, 0.12, { culprit: 4, fault: 1 }, "none");
  feutre(D, { id: "f2b-engine", anchor: noz2, w: 230, h: 200, from: t.moteur + 0.05, to: t.le - 0.05, seed: 9 });
  st(t.avale, 0.4, { surge: 1, n2: 0.5 }, "power2.out");
  st(t.coupe, 1.5, { n2: 0 }, "power1.out");
  punch(t.coupe, 0.06);
  // « s'étouffer »: engine 1, beside it, falters in steps
  st(t.etouffer, 0.9, { n1: 0.35 }, "steps(3)");
  path([
    [t.tot5, ENG],
    [t.sonne, { ...engAt(t.sonne), d: 128, az: -16, el: -11.5 }],
    [t.moteur, { ...engAt(t.moteur, [118, 13, 28]), d: 118, az: -18, el: -12 }],
    [t.coupe, { ...engAt(t.coupe, [118, 13, 28]), d: 112, az: -19, el: -12 }],
    [t.le, { ...engAt(t.le, [118, 13, 32]), d: 115, az: -18, el: -11.5 }],
    [t.tot6 - 0.02, { ...engAt(t.tot6 - 0.02, [118, 13, 33]), d: 120, az: -17, el: -11 }],
  ]);
  void tl;
}
