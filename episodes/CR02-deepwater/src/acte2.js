// t1 → t3 (tot1 30,47 → tot4 61,28) — the well, one maquette, three travelling shots (plan-séquence: docs/recette-actes.md).
// Each place is ONE D.path, launched ("go") at both ends; in every path the azimuth turns the same way on screen (toward −).
//   A  tot1 → tot2   the top of the column: the seawater replaces the mud from the top (the camera goes down with the
//                    interface), then up to the console: « deux cadrans qui doivent dire pareil » (both at 0, they shiver
//                    together) · lecture — no cut: toward TUBE as it climbs to 1 400 on « mille », « Et l'autre ? » the
//                    camera slides across to LIGNE, « Zéro » it turns red, circled, punch · « réussi »: back on both
//                    (1 400 / 0), the green chip turns alarm on « Il ne l'était pas ».
//   B  tot2 → tot3   cut (the red dial → the red bottom): the bottom of the bore, the balance tips on « coule », the gas
//                    enters on « gaz » and the camera climbs with its front; « Personne ne réagit »: the calm column above.
//   C  tot3 → tot4   cut (the same column, higher, later): the front climbs faster, the bubbles run; « En bas » the camera
//                    goes down to the flow dial: 9 → 22 past the mark 10 into the red; « dix »: the mark flares, punch;
//                    pull-back: the dial and the red running up the bore.
// Hands over at tot4 (acte2b cuts to the rig): puits, gas 0.6, debit 22, mark 1, sea 0.82.
// The dials read 0 until « mille » (0 = the needle toward the LOWER LEFT; 1 400 toward the upper right: on a small
// picture both read as the same diagonal — see the journal, « À changer ailleurs »).
// Poses are in WORLD coordinates (the well stands at ORIGIN.puits): every aim goes through at().
import { feutre } from "@kit/reconstitution.js";
import { STAGED, VIEW, SET, lit, W } from "./world.js";

const DOF = VIEW.dials.dof; // the close-ups of the console only
/** The aim of a key, in the well's own frame. */
const at = (x, y, z) => {
  const [tx, ty, tz] = W("puits", [x, y, z]);
  return { tx, ty, tz };
};

/* ── the light: what it stands around (local to the well), and how wide ── */
const L_TOP = lit("puits", [0, 470, 0], 170);
const L_SEA = lit("puits", [0, 400, 0], 170);
const L_DIALS = lit("puits", [10, 588, -64], 90);
const L_LINE = lit("puits", [10, 588, -47], 70);
const L_BOT = lit("puits", [0, 100, 0], 160);
const L_COL = lit("puits", [0, 170, 0], 190);
const L_MID = lit("puits", [0, 230, 0], 200);
const L_FLOW = lit("puits", [-3, 74, 40], 80);
const L_FLOWW = lit("puits", [0, 100, 26], 130);
// what every cut to the well says (nothing inherited)
const WELL = { eds: 0, signal: 0, link: 1, annular: 0, vbr: 0, bsr: 0, ok: 0, gasBase: 0 };

export default function acte2({ D, world }) {
  const { tl, st, cut, chip, path, punch } = D;
  const A = world.puits.A;
  const t = D.times({
    tot1: "tot1", pour: "t1:pour", remplace: "t1:remplace", mer: "t1:mer", test1: "test1",
    cadrans: "cadrans1", pareil: "pareil",
    premier: "lecture:premier", mille: "mille", et: "lecture:et", zero: "zero", letest: "lecture:test", reussi: "reussi",
    ne: "lecture:ne",
    tot2: "tot2", coule: "t2:coule", deja: "deja1", gaz: "neufb", fond: "t2:fond",
    tot3: "tot3", pression: "t3:pression", pompes: "pompes", en: "t3:en", entre: "t3:entre", vingtdeux: "vingtdeux",
    souviens: "souviens", habitude: "t3:habitude", dix: "dix2", tot4: "tot4",
  });

  /* ───────────── A · 19 h 55 — the top of the column, then the console ───────────── */
  // the cut (the flow dial at the foot of the column → the top of the same column; the clock goes back, `clack`)
  const TOP = { ...VIEW.top, ...at(0, 545, 0), d: 440, az: -54, el: 8, shift: 20 };
  cut(t.tot1, SET.PUITS, TOP, {
    ...STAGED.puits, ...L_TOP, ...WELL, sea: 0, gas: 0, balance: -1, debit: 0, mark: 0,
    dialTube: 0, dialLine: 0, culprit: 0, fault: 0,
  });
  // from the cut, the clear water already creeps down from the top (paper on the brown: the column reads at once)
  st(t.tot1 + 0.1, t.remplace - t.tot1 - 0.1, { sea: 0.13 }, "sine.inOut");
  // « on remplace sa boue lourde par de l'eau de mer »: the clear water comes down from the top, the interface sharp
  st(t.remplace, t.mer - t.remplace + 0.25, { sea: 0.32 }, "sine.inOut");
  st(t.remplace, t.mer - t.remplace + 0.25, L_SEA, "sine.inOut");
  // « deux cadrans qui doivent dire pareil »: both at rest; on « pareil » both needles shiver together
  st(t.mer + 0.25, t.cadrans - t.mer - 0.25, L_DIALS, "sine.inOut");
  st(t.pareil, 0.12, { dialTube: 70, dialLine: 70 }, "power2.out");
  st(t.pareil + 0.12, 0.45, { dialTube: 0, dialLine: 0 }, "sine.inOut");
  // lecture « Le premier affiche 1 400 psi »: TUBE climbs on « mille »
  st(t.mille, 0.6, { dialTube: 1400 }, "power2.out");
  chip("chip-tube", null, 96, 470, t.mille - 0.1, t.zero - 0.25);
  // « Et l'autre ? … Zéro. »: LIGNE stays at 0 and turns red, circled
  st(t.et, 0.5, L_LINE, "sine.inOut");
  st(t.zero, 0.2, { culprit: 1, fault: 1 }, "power2.out");
  punch(t.zero, 0.06);
  feutre(D, { id: "feutre-ligne", anchor: A.dialLine, kind: "circle", w: 640, h: 600, dx: 0, dy: 0, from: t.zero + 0.02, to: t.reussi - 0.4, draw: 0.42, seed: 5 });
  chip("chip-ligne", null, 96, 470, t.zero - 0.05, t.reussi - 0.3);
  // « Le test est pourtant jugé réussi. Il ne l'était pas. »: back on both (1 400 / 0); the green chip turns alarm
  st(t.letest, 0.9, L_DIALS, "sine.inOut");
  chip("chip-reussi", null, 96, 470, t.reussi - 0.1, t.tot2 - 0.15);
  tl.to("#chip-reussi", { color: "var(--alarme)", duration: 0.15 }, t.ne);

  path([
    [t.tot1, TOP],
    // closer on the column: the paper cap coming down is the subject
    [t.pour, { ...at(0, 510, 0), d: 370, az: -58, el: 7 }],
    [t.remplace, { ...at(0, 485, 0), d: 350, az: -61, el: 6 }],
    // the interface reaches ≈ y 396 just after « mer »: the camera rides along it, the clear water filling the top
    [t.mer + 0.2, { ...at(0, 420, 0), d: 380, az: -64, el: 5 }],
    // « Avant, un test »: one slow climb to the console (no key on « test »: it made the climb jerk at 36,9 s)
    [t.cadrans, { ...VIEW.dials, d: 250, az: -66, el: 10, dof: DOF }],
    // « Le premier affiche 1 400 »: toward TUBE as its needle sweeps
    [t.premier, { ...at(10, 588, -70), d: 232, az: -68, el: 11 }],
    [t.mille + 0.3, { ...at(10, 588, -78), d: 208, az: -70, el: 11 }],
    // « Et l'autre ? » the slide across to LIGNE
    [t.et, { ...at(10, 588, -74), d: 205, az: -72, el: 10 }],
    [t.zero, { ...at(10, 588, -47), d: 196, az: -75, el: 7 }],
    [t.letest, { ...at(10, 588, -49), d: 202, az: -76, el: 7 }],
    // « réussi »: both dials, 1 400 and 0
    [t.reussi, { ...at(10, 588, -62), d: 262, az: -78, el: 10 }],
    [t.tot2, { d: 285, az: -81, el: 11 }],
  ]);

  /* ───────────── B · 21 h 08 — the bottom: the gas enters ───────────── */
  // the cut (the red dial → the red at the bottom of the well)
  const BOT = { ...VIEW.bottom, ...at(0, 92, 0), d: 450, az: -55, el: 6, shift: 40 };
  cut(t.tot2, SET.PUITS, BOT, {
    ...STAGED.puits, ...L_BOT, ...WELL, sea: 0.82, balance: -0.2, gas: 0, debit: 0, mark: 1,
    dialTube: 1400, dialLine: 0, culprit: 0, fault: 0,
  });
  // « le puits coule déjà »: the balance tips
  st(t.coule, 0.5, { balance: 0.6 }, "power2.out");
  punch(t.deja, 0.06);
  // « le gaz entre par le fond »: the red enters and climbs slowly; the flow dial stirs
  st(t.gaz, t.fond - t.gaz, { gas: 0.12, balance: 0.8, debit: 3 }, "sine.inOut");
  st(t.fond, t.tot3 - t.fond, { gas: 0.17 }, "sine.inOut");
  st(t.fond, t.tot3 - t.fond, L_COL, "sine.inOut");

  path([
    [t.tot2, BOT],
    [t.coule, { ...at(0, 90, 0), d: 405, az: -59, el: 7 }],
    [t.gaz, { ...at(0, 98, 0), d: 375, az: -62, el: 7 }],
    // the camera climbs with the front
    [t.fond, { ...at(0, 118, 0), d: 385, az: -65, el: 6 }],
    // « Personne ne réagit »: the calm column above, the red below
    [t.tot3, { ...at(0, 172, 0), d: 500, az: -69, el: 5, shift: 30 }],
  ]);

  /* ───────────── C · 21 h 31 — the front climbs, the flow dial past ten ───────────── */
  // the cut (the same column, higher, later)
  // close enough that the column fills ≈ 40 % of the width and the simple BOP stays above the frame
  const MID = { ...VIEW.middle, ...at(0, 214, 0), d: 320, az: -55, el: 4, shift: 30 };
  cut(t.tot3, SET.PUITS, MID, {
    ...STAGED.puits, ...L_MID, ...WELL, sea: 0.82, balance: 1, gas: 0.35, debit: 9, mark: 1,
    dialTube: 1400, dialLine: 0, culprit: 0, fault: 0,
  });
  // « Pression anormale : on coupe les pompes »: the front climbs, faster
  st(t.tot3, t.en - t.tot3, { gas: 0.47 }, "power1.in");
  st(t.en, t.tot4 - t.en, { gas: 0.6 }, "sine.inOut");
  // « En bas, ça entre à environ vingt-deux »: the needle passes the mark 10 and enters the red
  st(t.pompes, t.entre - t.pompes, L_FLOW, "sine.inOut");
  st(t.entre, t.vingtdeux - t.entre + 0.1, { debit: 22 }, "power1.inOut");
  chip("chip-22", null, 96, 470, t.vingtdeux - 0.1, t.tot4 - 0.15);
  // « Souviens-toi : d'habitude, de l'ordre de dix. »: the mark dims on « habitude », flares on « dix »
  st(t.habitude, 0.3, { mark: 0.25 }, "sine.inOut");
  st(t.dix - 0.04, 0.14, { mark: 1 }, "power2.out");
  punch(t.dix, 0.06, { up: 0.08, hold: 0.1, down: 0.28 });
  st(t.souviens, t.tot4 - t.souviens, L_FLOWW, "sine.inOut");

  path([
    [t.tot3, MID],
    [t.pression, { ...at(0, 226, 0), d: 308, az: -58, el: 4 }],
    [t.pompes, { ...at(0, 205, 10), d: 298, az: -61, el: 5 }],
    // « En bas »: down to the flow dial, spread from « pompes » to « vingt-deux » (one stretch of 1,2 s jerked at 56,2 s)
    [t.entre, { ...at(-2, 120, 30), d: 296, az: -64, el: 7, shift: 36 }],
    [t.vingtdeux, { ...at(-3, 77, 40), d: 280, az: -67, el: 8, shift: 40 }],
    // keeps pushing in on the dial (no still stretch 57,4–59 s)
    [t.souviens, { d: 256, az: -70, el: 9 }],
    // the pull-back: the dial and the red running up the bore
    [t.dix, { ...at(0, 95, 30), d: 330, az: -71, el: 7 }],
    [t.tot4, { ...at(0, 110, 26), d: 380, az: -73, el: 7 }],
  ]);
}
