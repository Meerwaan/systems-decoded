// t4 → t9, la nuit (tot4 → todefaut). docs/CR02-actes.md « acte2b.js », docs/CR02-actes-maj.md. PLAN-SÉQUENCE (docs/recette-actes.md):
// one D.path per place, each key 1 to 3 s apart and 3 to 8° of az from the last, and the az always turns the SAME way on screen
// (less negative, act-long: −76 → −49) — every path enters its cut and leaves it running ("go").
//   1. t4, the rig — the first image again, wider: on « déborde » the camera pulls back and up, the mud floods the drill floor; on
//      « jaillit » it lifts its eyes along the jet to the crown.
//   2. t5, the BOP — from the whole stack down to the upper annular: it swells round the pipe on « joint »… « ne scelle pas »: it turns
//      red, the red circle, the gas still passes.
//   3. t6, the VBR — the jaws close, green, on « mâchoire… ferme »; « ça tient »: nothing passes above. Cut on « Sauf » to the puits:
//      the red pocket above the simple BOP climbs the riser, the camera climbs with it, « vers toi ».
//   4. t7, the rig seen from the sea — a slow approach; « Tout explose » in the same shot (no cut on the moment).
//   5. t8, the EDS panel — the button sinks on its own on « presse » (no hand), the signal runs down the cable, the camera rides it to
//      the simple BOP: nothing moves. Cut on « Rien » to the BOP's blades, open, still.
//   6. t9, the same BOP, one path to the end: back off to the pods (« seul »: their lamps light; « perd la surface »: the lines die),
//      then in to the blades: « il ferme probablement les lames » — they close SLOWLY on the bent, off-centre pipe and pierce it
//      (pinched, never cut: `buckle` 1 — the pipe had buckled after the VBR closed, docs/faits; acte3 explains it on « plié »).
// Starts with a complete cut at `tot4`; hands over at `todefaut` (acte3 cuts on the master shot). Never writes the header (main.js).
import { feutre } from "@kit/reconstitution.js";
import { STAGED, VIEW, SET, W, lit } from "./world.js";

const aim = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};

// every number of a maquette, so that each cut says the whole state (nothing inherited from the act before)
const RIG = { culprit: 0, fault: 0, ok: 0, depuis: 0, jet: 0.6, spill: 0.2, blast: 0, fire: 0, sink: 0, lamps: 1 };
const WELL = {
  culprit: 0, fault: 0, ok: 0, depuis: 0, sea: 0.85, balance: 1, gas: 0.5, gasBase: 0.42, debit: 22, mark: 0,
  dialTube: 0, dialLine: 0, eds: 0, signal: 0, link: 1, annular: 1, vbr: 1, bsr: 0,
};
const STACK = {
  culprit: 0, fault: 0, ok: 0, depuis: 0, annular: 0, vbr: 0, bsr: 0, flow: 1, pass: 1, buckle: 0, inside: 0, amf: 0, link: 1,
  podOpen: 0, charge: 1, coils: 0, plume: 0, rams2: 0, ring: 0, shear: 0,
};

export default function acte2b({ D, world }) {
  const { st, cut, path, punch, jolt } = D;
  const t = D.times({
    tot4: "tot4", deborde: "deborde", plancher: "t4:plancher", jaillit: "jaillit", derrick: "t4:derrick",
    tot5: "tot5", ferme5: "t5:ferme", joint: "joint", scelle: "scelle", pas5: "t5:pas",
    tot6: "tot6", machoires: "machoires2", tube6: "t6:conduit", tient: "tient", sauf: "sauf", dessus: "dessus", monte: "t6:monte",
    toi: "toi1",
    tot7: "tot7", explose: "explose",
    tot8: "tot8", presse: "t8:presse", celui: "celui", lames8: "t8:lames", rien: "rien", passe: "passe",
    tot9: "tot9", seul: "seul", perd: "t9:perd", surface: "surface", avant58: "avant58", ferme9: "t9:ferme", lames2: "lames2",
    todefaut: "todefaut",
  });
  const B = (y, o) => ({ ...aim("bop", [0, y, 0]), ...o });
  const Pw = (local, o) => ({ ...aim("puits", local), ...o });
  const Rg = (y, o) => ({ ...aim("plateforme", [0, y, 0]), ...o });

  /* ── 1 · t4, 21 h 40 — the drill floor (raccord: the red climbing the column → it comes out of the hole) ── */
  const F0 = { ...VIEW.floorLow, d: 129, az: -66, el: -36 };
  cut(t.tot4, SET.PLATEFORME, F0, { ...STAGED.plateforme, ...RIG });
  path([
    [t.tot4, F0],
    [t.deborde, Rg(494, { d: 190, az: -63, el: 2, fov: 48 })],
    [t.plancher + 0.35, Rg(500, { d: 220, az: -60, el: 14, fov: 40 })], // retouche: el 14 (not 20) and ty climbing all along — no turn-back at 65 s
    [t.jaillit + 0.6, Rg(532, { d: 300, az: -57, el: 7 })],
    [t.tot5 - 0.04, Rg(566, { d: 330, az: -54, el: -4 })],
  ]);
  // « La boue déborde sur le plancher » — the sheet spreads from the floor to the deck
  st(t.deborde, t.plancher + 0.45 - t.deborde, { spill: 1 }, "sine.inOut");
  punch(t.deborde, 0.06);
  // « …et jaillit jusqu'en haut du derrick »
  st(t.jaillit - 0.04, 0.5, { jet: 1 }, "power2.out");
  st(t.jaillit, t.tot5 - t.jaillit, lit("plateforme", [0, 560, 0], 160), "sine.inOut");

  /* ── 2 · t5, 21 h 43 — the BOP, the upper annular (raccord: the jet's axis → the riser's axis, downward) ── */
  const A0 = B(124, { d: 620, az: -76, el: 9, shift: 40 });
  cut(t.tot5, SET.BOP, A0, { ...STAGED.bop, ...STACK, culprit: 1 });
  path([
    [t.tot5, A0],
    [t.ferme5, B(122, { d: 420, az: -71, el: 7, shift: 20 })],
    [t.joint, B(122, { d: 255, az: -66, el: 6, shift: 0, dof: 6 })],
    [t.scelle, B(122, { d: 228, az: -63 })],
    [t.tot6 - 0.04, B(122, { d: 218, az: -61 })],
  ]);
  st(t.ferme5, t.joint - t.ferme5, lit("bop", [0, 122, 0], 80), "sine.inOut");
  // « son joint en caoutchouc… » — the rubber swells round the pipe
  st(t.joint, t.scelle - t.joint, { annular: 1 }, "sine.inOut");
  // « …ne scelle pas » — the gas still passes (pass 1); the joint turns red, circled
  st(t.scelle, 0.2, { fault: 1 }, "power2.out");
  feutre(D, { id: "feutre-annulaire", anchor: world.bop.A.annular, kind: "circle", w: 560, h: 300, dy: 0, from: t.scelle + 0.04, to: t.tot6 - 0.16, draw: 0.36, seed: 4 });
  punch(t.pas5, 0.06, { hold: 0.06, down: 0.18 });

  /* ── 3 · t6, 21 h 47 — the VBR closes, green; then the pocket above it climbs to you ── */
  const V0 = B(56, { d: 240, az: -63, el: 8, shift: 0, dof: 6 });
  cut(t.tot6, SET.BOP, V0, { ...STAGED.bop, ...STACK, ...lit("bop", [0, 52, 0], 80), annular: 1, inside: 0, ok: 1, culprit: 1 }); // culprit 1, fault 0: the annular that failed stays clay, never green
  path([
    [t.tot6, V0],
    [t.machoires, B(53, { d: 218, az: -59, el: 7 })],
    [t.tube6 + 0.2, B(52, { d: 200, az: -55, el: 6 })],
    [t.tient, B(54, { d: 190, az: -52 })],
    [t.sauf - 0.14, B(56, { d: 184, az: -50 })],
  ]);
  // « Une mâchoire se ferme sur le tube » — green as it closes
  st(t.machoires, t.tube6 + 0.2 - t.machoires, { vbr: 1 }, "sine.inOut");
  // « Cette fois, ça tient. » — nothing passes above any more
  st(t.tient - 0.04, 0.35, { pass: 0 }, "power2.out");
  punch(t.tient, 0.06, { hold: 0.1, down: 0.24 });

  // « Sauf que le gaz est déjà au-dessus… et il monte vers toi. » (raccord: above the VBR → above the simple BOP)
  const cutSauf = t.sauf - 0.1;
  const G0 = Pw([0, 300, 0], { d: 360, az: -72, el: 6, shift: 40 });
  cut(cutSauf, SET.PUITS, G0, { ...STAGED.puits, ...WELL, ...lit("puits", [0, 300, 0], 160) });
  path([
    [cutSauf, G0],
    [t.dessus, Pw([0, 336, 0], { d: 362, az: -68, el: 6 })],
    [t.monte, Pw([0, 440, 0], { d: 380, az: -64, el: 5 })],
    [t.tot7 - 0.04, Pw([0, 545, 0], { d: 400, az: -60, el: 4 })], // « toi »: the drill floor (y 560) enters under the header
  ]);
  st(cutSauf + 0.2, t.tot7 - cutSauf - 0.2, { gas: 0.9, gasBase: 0.6 }, "power1.in");
  st(cutSauf, t.tot7 - cutSauf, lit("puits", [0, 460, 0], 180), "sine.inOut");

  /* ── 4 · t7, 21 h 49 — the rig from the sea; « Tout explose » in the same shot (raccord: the pocket reaching the floor → the rig) ── */
  const R0 = { ...VIEW.rig, d: 1010, az: -63 };
  cut(t.tot7, SET.PLATEFORME, R0, { ...STAGED.plateforme, ...RIG, jet: 1, spill: 1 });
  path([
    [t.tot7, R0],
    [t.explose, { d: 900, az: -58, el: 3 }],
    [t.tot8 - 0.04, { d: 850, az: -55, el: 4 }],
  ]);
  st(t.explose - 0.02, 0.6, { blast: 1 }, "sine.out");
  st(t.explose, 0.25, { lamps: 0 }, "power2.out");
  st(t.explose + 0.06, 0.8, { fire: 1 }, "sine.out");
  punch(t.explose, 0.06, { hold: 0.18, down: 0.5 });
  jolt(t.explose + 0.04, 0.5);

  /* ── 5 · t8, 21 h 56 — the emergency button, the signal down the cable… nothing (raccord: the flash → the button's light) ── */
  const E0 = Pw([10, 578, 66], { d: 122, az: -76, el: 12, shift: 40, dof: 6 });
  cut(t.tot8, SET.PUITS, E0, { ...STAGED.puits, ...WELL, ...lit("puits", [10, 578, 66], 70), gas: 1, gasBase: 0.4 });
  const cutCelui = t.celui - 0.1;
  const cutRien = t.rien - 0.1;
  path([
    [t.tot8, E0],
    [t.presse, Pw([10, 578, 66], { d: 102, az: -72, el: 12 })],
    [t.presse + 0.7, Pw([8, 572, 58], { d: 128, az: -70, el: 11, dof: 0 })],
    [cutCelui - 0.04, Pw([8, 570, 50], { d: 148, az: -68, el: 11 })],
  ]);
  // « On presse le bouton d'urgence » — it sinks on its own (the impulse leaves on the cut: close to the lens its glow flares white)
  st(t.presse - 0.02, 0.18, { eds: 1 }, "power2.out");
  // « celui qui ferme les lames » — retouche: a clean cut a few frames before the word, onto the whole cable, beside the red
  // column; the camera tilts down slowly with the impulse to the simple BOP, where it dies (no more fast pull-back)
  const C0 = Pw([6, 530, 28], { d: 460, az: -64, el: 7, shift: 40 });
  cut(cutCelui, SET.PUITS, C0, { ...STAGED.puits, ...WELL, ...lit("puits", [0, 420, 20], 200), gas: 1, gasBase: 0.4, eds: 1, signal: 0 });
  path([
    [cutCelui, C0],
    [t.lames8, Pw([6, 360, 30], { d: 470, az: -62, el: 6 })],
    [cutRien - 0.04, Pw([6, 330, 32], { d: 475, az: -61, el: 6 })],
  ]);
  st(cutCelui, cutRien - 0.15 - cutCelui, { signal: 1 }, "none");

  /* ── 6 · « Rien ne se passe. » → t9 — the BOP, one path: the blades, the pods, the lines, the blades closing ── */
  const Q0 = B(80, { d: 205, az: -76, el: 7, shift: 0, dof: 6 });
  cut(cutRien, SET.BOP, Q0, {
    ...STAGED.bop, ...STACK, ...lit("bop", [0, 80, 0], 90), annular: 1, vbr: 1, pass: 0, inside: 1, buckle: 1, ok: 1, culprit: 1,
  });
  path([
    [cutRien, Q0],
    [t.tot9, B(86, { d: 300, az: -71, el: 8, shift: 20, dof: 0 })],
    [t.seul, { ...aim("bop", [8, 104, 0]), d: 470, az: -66, el: 10, shift: 40 }],
    [t.surface, { ...aim("bop", [6, 106, 0]), d: 500, az: -61, el: 11, shift: 40 }],
    [t.ferme9, B(81, { d: 232, az: -55, el: 11, shift: 0, dof: 6 })],
    [t.lames2, B(82, { d: 176, az: -51, el: 14 })],
    [t.todefaut - 0.04, B(82, { d: 170, az: -49, el: 14 })],
  ]);
  punch(t.passe, 0.06);
  st(t.tot9, t.seul - t.tot9, lit("bop", [8, 100, 0], 120), "sine.inOut");
  // « un système qui agit seul » — the pods' lamps · « quand le BOP perd la surface » — the lines from above die
  st(t.seul - 0.04, 0.3, { amf: 1 }, "power2.out");
  st(t.perd, 0.4, { link: 0 }, "power3.in"); // retouche: a clean cut-off on « perd », not a slow fade (bop.js lines are faint)
  // « Avant 21 h 58, il ferme probablement les lames. » — slowly, on the bent pipe: pinched, pierced, a thread of red escapes
  st(t.surface + 0.4, t.ferme9 - t.surface - 0.4, lit("bop", [0, 80, 0], 80), "sine.inOut");
  st(t.ferme9, t.lames2 + 0.16 - t.ferme9, { bsr: 0.9 }, "sine.inOut");
  st(t.lames2 - 0.3, t.todefaut - t.lames2 + 0.3, { pass: 0.4 }, "sine.in");
}
