// 02 · AUTOPSIE, 17.62 → 41.83 (docs/040-actes.md § acte2.js, docs/040-actes-maj.md).
// « Alors… » the wind drops on the shake → cut to the bench, the shelter alone → « on l'ouvre »: the pages lift, each
// landing on its click → ONE move down the pages, each layer lit on its word (foil, silica, air gap, fibre, the inner
// sheet — the section opens on « tournée vers toi ») → « Pourquoi ça marche ? » the pages close on the section, the ten
// rays come in, nine bounce back veille, the tenth dies across the air gap → cut: the loaf on the bag, 2 kilos → cut: the
// glue's corner lets go — and the clock catches up from « Mais » to −0:00.5, the 73 counted, until act 3 cuts at `tozero`.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED } from "./world.js";

export default function acte2({ D, world }) {
  const { tl, st, now, cut, path, chip, punch } = D;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode", ouvreEnd: "ouvre$",
    dehors: "eclate", alu: "alu", collee: "eclate:collée", silice: "silice", dessous: "eclate:dessous", lame: "lame",
    puis: "eclate:puis", fibre: "fibre", et: "eclate:et", seconde: "seconde", tournee: "eclate:tournée", eclateEnd: "eclate$",
    principe: "principe", feu: "principe:feu", rayon: "rayon", miroir: "principe:miroir", renvoie: "principe:renvoie",
    neuf: "neuf", dix: "principe:dix", lame2: "principe:lame", freine: "freine", principeEnd: "principe$",
    repos: "repos", kilos: "kilos", pain: "repos:pain", rattrape: "rattrape", colle: "colle", lache: "repos:lâche",
    degres: "degres", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ── « Alors… » — on the shake act 1 leaves, the wind drops, the embers die: the story's time stops (hush) ── */
  st(t.ouvre - 0.05, 0.5, { embers: 0, lean: 0.15, fire: 0.35, smoke: 0.5 }, "power2.out");
  // retouche 2 (raccord acte1): from act 1's exit pose (SHAKE_IN, unchanged) the orbit goes on the way act 1 turned
  // (az up, backing off) until the cut — the hush is not a still frame
  const SHAKE_OUT = { ...VIEW.shake, ty: 70, d: 470, az: -46, el: 6, shift: 70 };
  path([
    [t.ouvre - 0.05, SHAKE_OUT],
    [t.tobench - 0.02, { ...SHAKE_OUT, ty: 67, d: 515, az: -37, el: 5, shift: 75 }],
  ], { from: "go", to: "go" });

  /* ── cut to the bench: the shelter deployed, alone on its pool, you under it in glass ── */
  const cutAt = t.tobench - 0.02;
  const sys = benchCut(D, {
    at: cutAt, set: SET.BENCH, view: VIEW.system, origin: [0, 0, 0],
    state: { ...BENCHED, fold: 0, clock: -16.26, abris: 9 },
  });

  /* ── « …on l'ouvre. » — the pages lift on « on », each one landing on its click (ouvre$ +0.34 / +0.56 / +0.78):
   *  foil lands at explode 0.66, silica at 0.76, fibre at 0.86 (model.js DELAY) ── */
  // retouche 06/11: landings spread (+0.75 / +1.05 / +1.35) — the opening was the jerkiest stretch at 18.9 (qa 12.6)
  const c1 = t.ouvreEnd + 0.75, c2 = t.ouvreEnd + 1.05, c3 = t.ouvreEnd + 1.35;
  st(t.explode, c1 - t.explode, { explode: 0.66 }, "none");
  st(c1, c2 - c1, { explode: 0.76 }, "none");
  st(c2, c3 - c2, { explode: 0.86 }, "none");
  now(c3 + 0.02, { explode: 1 });

  // ONE move, from the cut to the principe's section: back to the whole exploded view, then down the pages, one
  // layer per word, never stopping on any of them (path); the near half comes off on « tournée vers toi ».
  const exploded = VIEW.exploded;
  path([
    [cutAt, sys],
    [c3 + 0.1, exploded],
    [t.alu - 0.04, { ...exploded, ty: 88, d: 720, az: -40, el: 28, shift: 130 }],
    [t.silice + 0.1, { ...exploded, ty: 78, d: 690, az: -44, el: 22, shift: 130 }],
    [t.lame - 0.04, { ...exploded, ty: 68, d: 670, az: -48, el: 16, shift: 130 }],
    // retouche: the feet end stayed past the right edge at 25.4 → farther, less side-on, the pile pushed left (tz +)
    [t.fibre - 0.04, { ...exploded, tz: 20, ty: 56, d: 800, az: -46, el: 12, shift: 130 }],
    [t.seconde - 0.04, { ...exploded, tz: 24, ty: 42, d: 780, az: -52, el: 9, shift: 130 }],
    // retouche 2 (plan-séquence): the turn toward « toi » spread over three keys, the pile kept whole until « tournée »
    // (26.9 it brushed the right edge), accelerating into the cut — never braking on a key
    [t.tournee - 0.04, { ...exploded, tx: 0, tz: 34, ty: 38, d: 830, az: -57, el: 9, shift: 126 }],
    [t.tournee + 0.58, { ...exploded, tx: 0, tz: 44, ty: 32, d: 600, az: -72, el: 8, shift: 106 }],
    [t.principe - 0.1, { ...exploded, tx: 0, tz: 45, ty: 30, d: 500, az: -84, el: 8, shift: 100 }],
  ], { from: "go", to: "go" });
  // retouche: « Pourquoi » — a clean cut onto the closed section (the close of the pages was the jerkiest of the film)
  // retouche 2 (plan-séquence): ONE move from « Pourquoi » to the end of the principe — it turns round the section's
  // fire end (az and el change on every key) and dives, without a cut, onto the tenth ray on « freine »: it goes in,
  // slows, dies in the gap, seen whole (no cut on the strong moment). az, el, d, tz all monotone: no key brakes.
  const secAt = t.principe - 0.1;
  const section = { ...VIEW.section, tx: 0, ty: 30, tz: -72, d: 470, az: -110, el: 16, shift: 75, dof: 0 };
  cut(secAt, null, section, { explode: 0, litInner: 0 });
  const leakAt = t.freine - 0.12; // the tenth ray's start
  path([
    [secAt, section],
    [t.feu, { ...section, ty: 29, tz: -76, d: 440, az: -102, el: 13, shift: 72 }],
    [t.rayon, { ...section, ty: 28, tz: -80, d: 410, az: -95, el: 11, shift: 70 }],
    [t.miroir, { ...section, ty: 26, tz: -84, d: 370, az: -87, el: 9, shift: 66 }],
    [t.neuf, { ...section, ty: 25, tz: -88, d: 270, az: -81, el: 7, shift: 58 }],
    [t.lame2, { ...section, ty: 23, tz: -96, d: 140, az: -77, el: 6, shift: 30, dof: 2 }],
    [t.freine - 0.04, { ...section, ty: 22, tz: -102, d: 85, az: -75, el: 5, shift: 14, dof: 3 }],
    [t.principeEnd + 0.24, { ...section, ty: 22, tz: -104, d: 55, az: -72, el: 4, shift: 10, dof: 4 }],
  ], { from: "go", to: "go" });

  // each layer lit on its word
  st(t.alu - 0.1, 0.35, { litFoil: 1 }, "power2.out");
  st(t.lame - 0.1, 0.35, { litFoil: 0, litGap: 1 }, "power2.out");
  st(t.fibre - 0.1, 0.35, { litGap: 0, litFibre: 1 }, "power2.out");
  st(t.seconde - 0.1, 0.35, { litFibre: 0, litInner: 1 }, "power2.out");
  now(t.tournee, { cut: 1 }); // the near half off: the inner sheet's silver face, turned toward you
  // the chips, one at a time, at a fixed place in the top slot (the camera travels)
  chip("chip-alu", null, 96, 470, t.alu, t.silice - 0.12);
  chip("chip-silice", null, 96, 470, t.silice, t.lame - 0.5);
  chip("chip-air", null, 96, 470, t.lame, t.fibre - 0.14);
  chip("chip-fibre", null, 96, 470, t.fibre, t.seconde - 0.14);
  chip("chip-inner", null, 96, 470, t.seconde, t.principe + 0.2);

  /* ── « Pourquoi ça marche ? » — the pages close on the section; the rays ── */
  st(t.rayon - 0.12, 0.7, { rays: 1 }, "power2.out"); // ten strokes come in from the fire side
  st(t.renvoie, t.dix - t.renvoie + 0.1, { bounce: 1 }, "sine.inOut"); // nine bounce back, veille
  punch(t.renvoie, 0.06);
  st(t.freine - 0.08, 0.6, { litGap: 1 }, "power2.out");
  st(leakAt + 0.06, 0.8, { leak: 1 }, "power3.out"); // the tenth goes in fast, slows across the air gap, dies before you

  /* ── cut: the loaf on the bag — it settles into its case; 2 kilos ── */
  const packAt = t.principeEnd + 0.26;
  // retouche 2: it turns round the loaf (20° of az across the shot), it does not only grow
  const pack = { ...VIEW.packBench, az: -48, el: 28 };
  cut(packAt, SET.BENCH, pack, {
    ...BENCHED, fold: 0.9, clock: -16.26, abris: 9, rays: 0, bounce: 0, leak: 0, pool: 0.2, grid: 0.16,
  });
  st(packAt + 0.05, 0.9, { fold: 1 }, "sine.out");
  path([
    [packAt, pack],
    [t.kilos, { ...pack, d: pack.d * 0.93, az: -38, el: 25 }],
    [t.rattrape - 0.16, { ...pack, d: pack.d * 0.86, az: -28, el: 22 }],
  ], { from: "go", to: "go" });
  chip("chip-poids", null, 96, 470, t.kilos, t.rattrape - 0.3);

  /* ── cut: the glue's corner — « Mais sa colle lâche vers 260 degrés » — and the clock catches up ── */
  const glueAt = t.rattrape - 0.14;
  // from the −x side, three-quarters on the head end: the dome's corner, its hem, the smoke and the glow under it
  // (VIEW.glueClose at d 120 reads as a grey mass at 270 px; from +x the eye falls inside the shelter)
  // retouche 2: it comes round the corner (az −12 → −20, el 27 → 24: the corner drifts from the centre toward its
  // place, never into the right zone); the end pose (act 3's seam) unchanged
  const glueEnd = { ...VIEW.glueClose, tx: 20, ty: 10, tz: 100, d: 260 * 0.88, az: -20, el: 24, shift: 100, dof: 6 };
  const glue = { ...glueEnd, d: 275, az: -12, el: 27 };
  cut(glueAt, SET.BENCH, glue, { ...BENCHED, fold: 0, glue: 0, clock: -16.26, abris: 9 });
  path([
    [glueAt, glue],
    [t.lache, { ...glueEnd, d: 252, az: -16, el: 25.5 }],
    [t.tozero, glueEnd],
  ], { from: "go", to: "go" });
  st(t.lache - 0.06, 1.3, { glue: 1 }, "power2.out");
  punch(t.lache, 0.06);
  chip("chip-colle", null, 96, 470, t.colle, t.tozero - 0.16);
  st(t.rattrape, t.tozero - t.rattrape, { clock: -0.5, abris: 73 }, "power2.in");
}
