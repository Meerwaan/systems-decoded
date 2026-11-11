// DOSSIER 043 — 02 → 03 RÉPONSE (tozero → toverdict): back to the grain, the threshold, the alert, the gap, the
// kickers, the train out, the « e », it holds. Two moves, the camera never stops (D.path, az always DECREASING):
//   1 · tozero → « Le système »   the grain from outside the pipe, its shower raining downstream; up to its monitor,
//                                 whose bar crosses the threshold (signal); the alert leaves it and the camera pulls back
//                                 BY RATIO with it (the aim travels with the distance) over the quarter ring it runs
//                                 along, up to point 6.
//   2 · « Le système » → toverdict ONE travel from point 6 to the block, NO CUT ON THE EJECTION: the armed kickers, the
//                                 train and its gap coming in from the left; the gap passes, the fifteen rise in it; the
//                                 train leaves the ring down the line, the camera rushes with the stream to the face and
//                                 the « e » it paints; then it pulls back up the line while the graphite glows (orange,
//                                 never white); « Il tient »: veille. It lands on VIEW.verdict at speed (fin.js cuts there,
//                                 invisibly).
// The train moves only by `gap` (ease "none": d(gap)/dt is its speed); the kickers fire at gap = +BEAM.gap/2 only, then
// `gap` is held and `dump` runs 0 → 1 (the film's « e » is max(paint, dump·1.108 − 0.108): the stream's head touches
// the face at dump ≈ 0.1, the « e » is whole at 1).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, LIGHT, LOOK, BEAM, PLACES } from "./world.js";
import { lineAt } from "./plan.js";

const kick = PLACES.kick;
const face = PLACES.face;
const LENS = { dof: LOOK.dof }; // the close-ups only
const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0, shift: 0 };
const HALF = BEAM.gap / 2; // 477: the gap's tail leaves the kickers — the only value at which they fire

/* ── the poses (complete for the cuts; the path keys only say what changes) ── */
// « Retour au grain » : from outside the ring (+z), the train running right → left, the grain red in its gap, the
// shower raining to the left (downstream)
const GRAIN0 = { ...P, ...LENS, tx: -2, ty: -1.5, tz: 0, d: 80, az: 8, el: 7 };
// the quarter ring seen along its chord, from above and outside: the grain low in the frame, point 6 high, the arc
// bulging right — the alert climbs it
const RING0 = { ...P, tx: 1800, ty: 0, tz: -1800, d: 16000, az: -45, el: 28, shift: 170, side: 140 };
// point 6 from inside the ring, between two framings seen on planche (53.40 of p3, 54.20 of p4): the bare ring pipe
// on the left 60 %, the train in it a white line running left → right, the first five kickers at the right (they are
// solid: the train only shows on the bare pipe — closer, at d 410–460, the frame was a thin line on black)
const POINT0 = { ...P, tx: kick[0], ty: 0, tz: kick[2] - 260, d: 760, az: -114, el: 11 };
const G = { ...VIEW.monitor, ty: VIEW.monitor.ty + 4, d: 100 }; // the gauge clear of the header

export default function acte3({ D }) {
  const { tl, st, path, cut, punch, jolt } = D;
  const t = D.times({
    tozero: "tozero", franchit: "zero:franchit", seuil: "zero:seuil", part: "zero:part",
    systeme: "zero:système", trou: "zero:trou", passe: "reponse:passe", allument: "reponse:s'allument",
    trigger: "trigger", anneau: "reponse:l'anneau", peint: "reponse:peint", micro: "reponse:microsecondes",
    dedans: "reponse:dedans", graphite: "reponse:graphite", degres: "reponse:degrés", tient: "reponse:tient",
    toverdict: "toverdict",
  });
  const t6 = t.systeme - 0.12; // the cut to point 6, a few frames before « Le système attend »
  const alerte = t.part - 0.45; // « L'alerte »

  /* ═══ 1 · « Retour au grain. La perte franchit le seuil. L'alerte part. » ═══ */
  setAct(tl, 3, t.tozero);
  const G0 = 10000; // the abort gap well downstream of the grain, going away (it never crosses this shot)
  cut(t.tozero, SET.RING, GRAIN0, {
    ...STAGED, ...LIGHT.grain, mood: 1, gap: G0, grain: 1, spray: 1, coil: 0.8, loss: 0.3, sensors: 0.3,
  });
  st(t.tozero, t6 - t.tozero, { gap: G0 + 900 * (t6 - t.tozero) }, "none"); // the train at the hook's speed
  st(t.franchit - 0.55, 0.6, { loss: 0.7 }, "sine.in"); // the bar rises to the threshold…
  st(t.franchit + 0.05, t.seuil + 0.05 - t.franchit, { loss: 0.85 }, "power2.out"); // …and crosses it: signal
  punch(t.seuil, 0.06, { hold: 0.12, down: 0.2 }); // relaxed before the cut on « L'alerte »
  // retouche 2026-11-08: two cuts instead of the travels (175 °/s, 133 °/s, the gauge blurred under the header, the
  // pull-back near black): the gauge held still, then the quarter ring lit as a whole as « L'alerte » lands
  const tg = t.franchit - 0.6; // 49.20: a few frames before « La perte »
  const ta = alerte - 0.12; //    50.67: a few frames before « L'alerte »
  const G1 = { ...G, d: 112, az: -17 };
  const RINGA = { ...RING0, d: 14500, az: -42, el: 27 };
  // the alert: the green head leaves the gauge at once and climbs the arc, reaching point 6 just before the cut
  st(alerte + 0.05, t6 - 0.1 - alerte - 0.05, { alert: 1 }, "sine.in");
  path([[t.tozero, GRAIN0], [tg, { d: 72, az: 4, el: 7 }]]); //                 « Retour au grain »: a slow push in
  cut(tg, null, G1); //                                                          the gauge: the bar rises, crosses
  path([[tg, G1], [t.seuil + 0.04, G], [ta, { d: 94, az: -24 }]]);
  cut(ta, null, RINGA, { ...LIGHT.ring }); //                                    the ring's light comes with the cut
  path([[ta, RINGA], [t6, RING0]]); //                                           the quarter ring, point 6 at the top

  /* ═══ 2 · « Le système attend… le trou. Le trou passe. Quinze aimants s'allument. Le train quitte l'anneau. Il peint
         son « e » sur le bloc. Quatre-vingt-neuf microsecondes : tout est dedans. Le graphite peut monter jusqu'à
         quatorze cents degrés. Il tient. » ═══ */
  // the gap at 545 cm/s: its front (where the white line ends) sweeps the bare pipe on « trou » (53.05 → 53.35) and goes
  // into the row; the pipe stays dark through « Le trou passe »; the train comes back on the left at ≈ 54.8 and its
  // head (the gap's tail) reaches the kickers' centre at the trigger — the only instant they may fire
  const g0 = HALF - 545 * (t.trigger - t6);
  cut(t6, SET.RING, POINT0, { ...STAGED, ...LIGHT.kick, mood: 1, gap: g0, arm: 0.6 });
  st(t6 + 0.05, 0.6, { arm: 1 }, "sine.out"); // the alert is in: the row armed, breathing
  st(t6, t.trigger - t6, { gap: HALF }, "none");
  punch(t.trou, 0.06, { hold: 0.14, down: 0.35 });
  // « Quinze aimants s'allument »: the cascade rises IN the gap, the row is full as the word lands and the gap's
  // tail leaves; the septa take the beam over; the camera takes the knock (no cut on it)
  st(t.trigger - 0.48, 0.5, { kick: 1 }, "none");
  st(t.trigger + 0.08, 0.32, { septa: 1 }, "power2.out");
  jolt(t.allument, 0.9);
  punch(t.allument, 0.06, { hold: 0.12, down: 0.3 });
  // the train leaves the ring in one turn: the stream down the line, the « e » it paints
  const DUMP0 = t.allument;
  const DUMP1 = t.dedans - 0.19; // whole just before « dedans »
  const tp = t.peint - 0.28; // 57.40: the cut to the face
  st(DUMP0, DUMP1 - DUMP0, { dump: 1 }, "none");
  st(DUMP0 + 0.4, 0.3, { dil: 1 }, "power2.out");
  st(DUMP0 + 0.5, DUMP1 - DUMP0 - 0.5, { heat: 0.8 }, "none"); // the trace heats behind its head
  st(t.anneau - 0.55, 0.9, { ...LIGHT.line }, "sine.inOut");
  st(t.peint - 0.2, 0.8, { ...LIGHT.block }, "sine.inOut");
  punch(t.dedans, 0.06, { hold: 0.14, down: 0.4 });
  // everything is in: the train's light goes out, point 6 rests (out of the frame)
  st(t.dedans + 0.1, 0.7, { beam: 0 }, "sine.inOut");
  st(t.dedans + 0.2, 1.0, { kick: 0, septa: 0, dil: 0, arm: 0.3 }, "sine.inOut");
  // « jusqu'à quatorze cents degrés »: orange at its brightest — never white
  st(t.graphite - 0.1, t.degres + 0.3 - t.graphite, { heat: 1 }, "sine.inOut");
  // « Il tient »: the system has won — veille, the block on its halo
  st(t.tient - 0.04, 0.3, { mood: 0 }, "sine.inOut");
  st(t.tient - 0.04, 0.6, { pool: 1 }, "sine.out");
  st(t.tient + 0.3, t.toverdict - t.tient - 0.35, { heat: 0.9 }, "sine.inOut");
  punch(t.tient, 0.06, { hold: 0.14, down: 0.35 });
  path([
    [t6, POINT0], //                                                                  the train, the row waiting at the right
    [t.trou, { tz: kick[2] - 230, d: 700, az: -118, el: 11 }], //                     the line's end sweeps in from the left
    [t.passe, { tz: kick[2] - 110, d: 640, az: -124, el: 12 }], //                    the pipe dark, the row three-quarter
    [t.allument, { tz: kick[2] + 60, d: 760, az: -132, el: 13 }], //                  the fifteen rise, the row three-quarter
    [t.anneau, { ...at(lineAt(1150)), ty: 10, d: 1500, az: -143, el: 11, fov: 36 }], // the stream down the line
    [tp, { ...at(lineAt(1550)), ty: 10, d: 1450, az: -145 }], //                      it runs on down the line
  ]);
  // « Il peint son « e » »: a cut a few frames before « Il » (the dive to the face ran at 294 °/s)
  const FACE0 = { ...P, ...LENS, ...at(face), tz: face[2] + 12, d: 250, az: -146, el: 10, fov: 32 };
  cut(tp, null, FACE0);
  path([
    [tp, FACE0], //                                                                   the « e » it paints
    [t.micro, { d: 200, az: -150, el: 11 }], //                                       the « e » closing
    [t.dedans, { tz: face[2] + 60, d: 380, az: -153, el: 13, fov: 34, dof: 0 }], //   all in: back from the face
    [t.degres, { tz: face[2] + 140, d: 650, az: -156.5, el: 16 }], //                 the graphite at its hottest
    [t.tient, { tz: face[2] + 170, d: 820, az: -158.5, el: 18 }], //                   it holds
    [t.toverdict, VIEW.verdict], //                                                   fin.js cuts on this very pose
  ]);
}

const at = (p) => ({ tx: p[0], ty: p[1], tz: p[2] });
