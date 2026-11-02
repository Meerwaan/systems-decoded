// 02 · AUTOPSIE — from "…on l'ouvre" (tobench, a cut in place) to the cut of act 3 (tozero).
//
// Act 1 leaves the box lying on the bottom, three quarters, on its halo (VIEW.floor, closer). On "on" the same box
// stands on the bench at the same place of the picture (benchCut, origin 0) and comes apart: the beacon flies forward,
// its battery out of it, the chassis back on the floor, the boards fanned, the module lifted toward the eye — and the
// camera pulls back with it to the whole exploded view. Then each part the voice names has its frame and its gesture:
// the beacon and its battery (they light up on their words); a cut to the chassis and its boards from behind (they
// light up; on "blindé" they turn to glass — nothing protects them); the camera comes round to the module, the one
// solid thing left, and closes on it for "la mémoire". "Autour d'elle" : it opens in section, its three layers light
// up one by one on their words; the flame licks the steel and dies in the insulation; the arrows of the sea squeeze
// it and it does not move. "Mais sa balise compte déjà les jours" : back to the beacon, its battery drops a notch,
// the header ticks J−29. The threshold does not stop the film: a cut back to the bottom, high above the box, and one
// long dive toward it while the days run out in the header (J−29 → J−2). Act 3 cuts from there on « Zéro ».
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED } from "./world.js";

/* ── the poses ── */
// where act 1 ends: the box on the bottom, the camera come closer during "Alors…" (docs/034-actes.md: d 115 → 90)
const ACT1_END = { ...VIEW.floor, d: 200 };
// the deep, at the threshold: high above the box, diving toward it
const SEUIL_FROM = { ...VIEW.floor, d: 400, el: 50, shift: 60 };
const SEUIL_TO = { ...VIEW.floor, d: 150, el: 32, shift: 90 };
// on the bench (planche p2): the battery out in front, its beacon behind it, the module at the right edge
const BEACON = { ...VIEW.beaconBench, tx: -25, ty: 31, tz: 12, d: 90, az: -35, el: 14, shift: 110, dof: 0 };
const BEACON_IN = { ...BEACON, d: 112 }; // where the cuts onto the beacon land (retouche)
// the chassis and its boards from the rear-right, the whole of both under the header
const CASE = { ...VIEW.caseBench, tx: 2, ty: 15, tz: -2, d: 170, az: 55, el: 26, shift: 40 };
// the module alone, 45 % of the width, high enough to leave its label the top-left corner
const CORE = { ...VIEW.core, d: 95, shift: 110 };
// the module in section, 55 %, its three labels above it
const SECTION = { ...VIEW.section, d: 78, shift: 80 };

/* ── the light: what it stands around, and how wide ── */
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_WIDE = { fx: 0, fy: 20, fz: 2, fs: 40 };
const L_BEACON = { fx: -26, fy: 31, fz: 12, fs: 20 };
const L_CASE = { fx: 6, fy: 12, fz: -6, fs: 30 };
const L_CORE = { fx: -4, fy: 27, fz: 12, fs: 16 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode", ouvreEnd: "ouvre$",
    devant: "devant", balise: "balise", pile: "pile", puis: "eclate:Puis",
    boitier: "boitier", electronique: "electronique", blinde: "blinde",
    milieu: "milieu", bloc: "bloc", memoire: "memoire", eclateEnd: "eclate$",
    torepos: "torepos", autour: "repos:Autour", acier: "acier", isolant: "isolant", absorbeur: "absorbeur",
    testee: "testee", degres: "degres", sixmille: "sixmille", deau: "deau", mais: "mais", jours: "comptejours",
    toseuil: "toseuil", seuil: "seuil", traverse: "traverse", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── "…on l'ouvre." — the same box on the bench, at the same place; it comes apart ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: ACT1_END, origin: [0, 0, 0],
    state: { ...BENCHED, days: 30, alarm: 1, depth: 3900, ping: 1, ...L_WHOLE },
  });
  st(t.explode, t.devant - 0.25 - t.explode, { explode: 1 }, "power2.out");
  const wide = t.devant - 0.12 - (t.tobench + 0.02);
  shot(t.tobench + 0.02, wide, VIEW.exploded, "sine.inOut", bench.d);
  st(t.tobench + 0.02, wide, L_WIDE, "sine.inOut");

  /* ───────────── "Devant, sa +balise+, avec sa propre pile." ───────────── */
  // retouche: a CUT a few frames before « Devant » (the move exploded → beacon in 0.9 s was heurté at 22.6 s), then a slow push
  const inB = t.devant - 0.1;
  cut(inB, SET.BENCH, BEACON_IN, { ...L_BEACON });
  shot(inB, t.puis - 0.14 - inB, BEACON, "sine.out", BEACON_IN.d);
  st(t.balise - 0.04, 0.4, { litBeacon: 1 }, "sine.out");
  punch(t.balise, 0.05);
  const cBeacon = co.add({ title: "Balise", x: 470, y: 560, align: "end", tone: "system", anchor: A.beacon });
  cBeacon.show(tl, t.balise - 0.1);
  cBeacon.hide(tl, t.puis - 0.3);
  st(t.pile - 0.04, 0.3, { litPile: 1 }, "sine.out");
  const cPile = co.add({ title: "Pile", x: 360, y: 1080, align: "end", tone: "system", anchor: A.pile });
  cPile.show(tl, t.pile - 0.1);
  cPile.hide(tl, t.puis - 0.3);

  /* ───────────── "Puis le boîtier et son électronique : rien n'est blindé." — a cut: from behind ───────────── */
  // (a quarter turn from the beacon: it is a cut, a few frames before "Puis")
  cut(t.puis - 0.12, SET.BENCH, CASE, { litBeacon: 0, litPile: 0, ...L_CASE });
  // (retouche: its aim drifts toward the module — aimed at the chassis, the tour cut the module at the left edge at 29.3 s)
  shot(t.puis - 0.1, t.milieu - (t.puis - 0.1), { ...CASE, d: 160, tx: -1, ty: 21, tz: 5 }, "sine.inOut", CASE.d);
  st(t.boitier - 0.04, 0.35, { litCase: 1 }, "sine.out");
  const cCase = co.add({ title: "Boîtier", x: 430, y: 1060, align: "end", tone: "system", anchor: A.chassis });
  cCase.show(tl, t.boitier - 0.1);
  cCase.hide(tl, t.milieu - 0.2);
  const cBoards = co.add({ title: "Électronique", x: 500, y: 560, align: "end", tone: "system", anchor: A.boards });
  cBoards.show(tl, t.electronique - 0.1);
  cBoards.hide(tl, t.milieu - 0.2);
  // "rien n'est blindé" : the chassis, its boards and the beacon turn to glass — the module shows, solid, inside
  st(t.blinde, 0.4, { xray: 1 }, "sine.inOut");
  st(t.blinde + 0.3, 0.4, { litCase: 0 }, "sine.inOut");

  /* ───────────── "Et au milieu… un bloc de quelques kilos : la *mémoire*." — round to the module, close ───────────── */
  const toCore = t.memoire + 0.05 - (t.milieu - 0.1);
  shot(t.milieu - 0.1, toCore, CORE, "sine.inOut", 160);
  st(t.milieu - 0.1, toCore, L_CORE, "sine.inOut");
  st(t.bloc - 0.04, 0.4, { litCore: 1 }, "sine.out");
  punch(t.memoire, 0.06);
  const cCore = co.add({ title: "Mémoire", x: 380, y: 540, align: "end", tone: "system", anchor: A.module });
  cCore.show(tl, t.memoire - 0.1);
  cCore.hide(tl, t.torepos - 0.12);

  /* ───────────── "Autour d'elle : de l'acier, un isolant, un absorbeur de chaleur." — it opens in section ───────────── */
  shot(t.torepos, t.acier - t.torepos, SECTION, "sine.inOut", CORE.d);
  st(t.autour - 0.04, 0.8, { section: 1 }, "sine.inOut");
  st(t.autour + 0.3, 0.4, { litCore: 0 }, "sine.inOut");
  const layer = (lit, at, prev) => {
    st(at - 0.04, 0.3, { [lit]: 1 }, "sine.out");
    if (prev) st(at - 0.04, 0.3, { [prev]: 0 }, "sine.inOut");
  };
  layer("litSteel", t.acier);
  layer("litInsul", t.isolant, "litSteel");
  layer("litAbsorb", t.absorbeur, "litInsul");
  st(t.testee - 0.3, 0.3, { litAbsorb: 0 }, "sine.inOut");
  const cSteel = co.add({ title: "Acier", x: 560, y: 470, align: "end", tone: "system", anchor: A.steel });
  const cInsul = co.add({ title: "Isolant", x: 560, y: 540, align: "end", tone: "system", anchor: A.insul });
  const cAbsorb = co.add({ title: "Absorbeur de chaleur", x: 560, y: 610, align: "end", tone: "system", anchor: A.absorb });
  cSteel.show(tl, t.acier - 0.1);
  cInsul.show(tl, t.isolant - 0.1);
  cAbsorb.show(tl, t.absorbeur - 0.1);
  for (const c of [cSteel, cInsul, cAbsorb]) c.hide(tl, t.testee - 0.2);

  /* ───────────── "Testée à onze cents degrés… et à six mille mètres d'eau." ───────────── */
  // the flame licks the steel and dies in the insulation (`heat` does both), the frame holds and closes in a little
  shot(t.acier, t.degres - t.acier, { ...SECTION, d: 70 }, "sine.inOut", SECTION.d);
  // …and steps back for the sea's arrows, which come from every side (retouche: the lens is back at d 230 BEFORE they
  // fly in — they come from far — and they are smaller: at d 90 they reached above y 205 and under 1600 at 37.7 s)
  const backOut = t.sixmille + 0.15;
  shot(t.degres, backOut - t.degres, { ...SECTION, d: 230, dof: 0 }, "sine.inOut", 70);
  shot(backOut, t.mais - 0.12 - backOut, { ...SECTION, d: 240, dof: 0 }, "sine.in", 230);
  st(t.testee, t.degres + 0.3 - t.testee, { heat: 1 }, "sine.inOut");
  chip("chip-feu", null, 96, 470, t.testee, t.deau - 0.7);
  st(t.sixmille - 0.2, 0.4, { heat: 0 }, "sine.inOut");
  // the sea squeezes it from every side — the steel gives a hair and springs back, the module does not move
  st(t.sixmille, t.deau + 0.15 - t.sixmille, { crush: 0.4, flex: 0.3 }, "power2.in");
  st(t.deau + 0.2, 0.2, { flex: 0.12 }, "sine.out"); // (over before the cut at mais − 0.12)
  chip("chip-eau", null, 96, 470, t.sixmille, t.mais - 0.15);

  /* ───────────── "Mais sa balise compte déjà les *jours*." — back to the beacon: its battery drops ───────────── */
  // retouche: a CUT a few frames before « Mais » (the move section → beacon was heurté at 38.8 s), the module closed
  const backAt = t.mais - 0.12;
  cut(backAt, SET.BENCH, BEACON_IN, { crush: 0, flex: 0, section: 0, xray: 0, ...L_BEACON });
  shot(backAt, t.jours - 0.15 - backAt, BEACON, "sine.out", BEACON_IN.d);
  st(t.mais + 0.3, 0.4, { litBeacon: 1, litPile: 1 }, "sine.out");
  st(t.mais + 0.4, t.jours - t.mais - 0.3, { charge: 0.85 }, "sine.inOut");
  st(t.jours, 0.15, { days: 29 }, "none");
  punch(t.jours, 0.06, { up: 0.08, hold: 0.18, down: 0.4 });

  /* ───────────── the threshold — "+Abonne-toi+ : ces deux ans au fond, on les *traverse*." ───────────── */
  // A cut back to the bottom on the flashing beacon, high above the box, and one long dive toward it (by ratio):
  // the film never stops for the call. The days run out in the header — J−29 … J−2 — act 3 says « Zéro ».
  cut(t.toseuil, SET.DEEP, SEUIL_FROM, { ...STAGED, days: 29, alarm: 1, ping: 1, pool: 0.25, charge: 0.85 });
  shot(t.toseuil + 0.02, t.tozero - 0.06 - t.toseuil, SEUIL_TO, "sine.inOut", SEUIL_FROM.d);
  st(t.seuil, t.seuilEnd + 0.1 - t.seuil, { days: 2 }, "none");
  punch(t.traverse, 0.05, { up: 0.08, hold: 0.16, down: 0.4 });
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
