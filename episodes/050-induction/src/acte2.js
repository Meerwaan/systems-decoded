// 02 · AUTOPSIE — « Alors… on l'ouvre » (tobench) to the cut back to the kitchen (torepos).
//
// Act 1 leaves the hob three quarters, its glass and case gone X-ray (VIEW.system). The cut puts the same hob on the
// bench at the same place of the picture (benchCut); on « on » it comes apart — case, fan, board, coils, glass, and the
// saucepan above them — and the camera pulls back to the whole column. Then it follows the current, as the voice does:
// round to the back for the board (the lead lights, then the track), up the riser to the hero coil (its turns light),
// up through the glass to the base of the saucepan, seen from just below — the heart, alone and lit.
// The cut to the principle matches on that base: the same base, closed and cut in half, seen on its cut face — coil,
// glass, base, water. The field beats out of the coil and through the glass (the glass stays dark), the camera closes
// in on the base until its three layers read, the currents turn in its magnetic sheet, and the heat is born in it and
// rises into the water. Act 3 cuts at `torepos`.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, BENCH_ORIGIN, SIZE } from "./world.js";
import { BENCH_LIFT as B, ZONES, EXPLODE } from "./plan.js";

const PX = ZONES.pan.x, PZ = ZONES.pan.z;

/* ── the exploded column ── */
// the board, close, from behind on the left (az −120: from −40 the hero coil hides it)
const BOARD = { ...VIEW.board };
// the hero coil, risen — the camera has followed the riser up to it
// (seen from high up: lower, the other coils of the column stand between the camera and this one)
const COIL = { ...VIEW.coil, d: 70, az: -70, el: 48, shift: 120 };
// the whole column, case to saucepan, with room above for the pan (VIEW.exploded sends it into the header)
const EXPL = { ...VIEW.exploded, ty: B + 19, d: 210, el: 14, shift: 60 };
// the base of the saucepan from just below, through the glass — then a slow push while it is named
// (from just below, far enough for the saucepan to read whole above its lit base)
const HEART = { ...VIEW.heart, ty: B + EXPLODE.pan + 2, d: 80, az: -84, el: -9, shift: 20 };
const HEART_IN = { ...HEART, d: HEART.d * 0.86, az: HEART.az + 6 };

/* ── the section (cut 1, assembled): on the cut face z = PZ, seen from +z ── */
// the cut opens on the base and the coil under it, three quarters high: the base's rings will open there in arcs
// (retouche 14/11: no blur anywhere in the section — the field's loops went to a green haze under dof 8 — and the
// cut opens closer, the coil across the frame; one nest alone, tried, flattens the loops into stripes)
const SEC = { ...VIEW.section, tx: PX, ty: B + 0.9, tz: PZ, d: 32, az: -14, el: 10, shift: 120, dof: 0 };
// the field beats out of the coil: down to the glass, the loops in the cut plane
const SEC_FIELD = { ...SEC, tx: PX + 1, ty: B + 0.6, d: 26, az: -12, el: 6, shift: 90 };
// « il traverse le verre » : at the glass's level, the loops crossing its line
const SEC_GLASS = { ...SEC_FIELD, tx: PX + 2, ty: B + 0.35, d: 23, az: -9, el: 2, shift: 75 };
// « dans le métal » : back up over the base, where the currents turn in arcs
const SEC_METAL = { ...SEC, ty: B + 1.3, d: 34, el: 14, shift: 140 };
// « comme un grille-pain » : back, the base and the water above it, where the heat rises
const SEC_WIDE = { ...VIEW.sectionWide, tx: PX - 2, ty: B + 3.5, tz: PZ, d: 52, az: -14, el: 10, shift: 150, dof: 0 };

/* ── the light: what it stands around ── */
const L_WHOLE = { fx: 0, fy: B + 6, fz: 0, fs: SIZE * 1.6 };
const L_BOARD = { fx: -4, fy: B + EXPLODE.board, fz: -6, fs: 34 };
const L_COIL = { fx: PX, fy: B + EXPLODE.coils, fz: PZ, fs: 30 };
const L_HEART = { fx: PX, fy: B + EXPLODE.pan, fz: PZ, fs: 30 };
const L_SEC = { fx: PX, fy: B + 1, fz: PZ, fs: 22 };

export default function acte2({ D, world }) {
  const { st, shot, cut, chip, punch } = D;
  const t = D.times({
    tobench: "tobench", explode: "explode", eclate: "eclate", secteur: "secteur", elle: "eclate:elle", lance: "lance",
    inducteur: "inducteur", une: "eclate:une", bobine: "bobine", sousverre: "sousverre", et: "eclate:et", coeur: "coeur",
    casserole: "casserole1", eclateEnd: "eclate$",
    toprincipe: "toprincipe", principe: "principe", la: "principe:la", pbobine: "principe:bobine", champ: "champ",
    environ: "environ", il: "principe:il", traverse: "traverse", etf: "principe:et", tourner: "tourner", metal: "metal",
    qui: "principe:qui", grille: "grille", principeEnd: "principe$",
    torepos: "torepos",
  });
  setAct(D.tl, 2, t.tobench);

  /* ───────────── « …on l'ouvre. » — the same hob on the bench; on « on » it comes apart ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCH_ORIGIN,
    state: { ...BENCHED, see: 1, ...L_WHOLE, fs: SIZE },
  });
  st(t.explode, 1.4, { explode: 1 }, "power2.inOut");
  // (retouche 14/11: the turns of 80° and more in a second were cuts to be — board, coil and heart now come on a clean cut,
  // camera only, a few frames before their word, each with a slow push; the light jumps with the cut, no tween left on it)
  const cB = t.eclate - 0.12;
  st(t.tobench + 0.03, cB - 0.02 - (t.tobench + 0.03), { fs: L_WHOLE.fs }, "sine.inOut");
  shot(t.tobench + 0.03, cB - 0.02 - (t.tobench + 0.03), EXPL, "sine.inOut", bench.d);

  /* ───────────── « L'électronique prend le courant du secteur. » — cut to the board; the lead lights ───────────── */
  const cC = t.inducteur - 0.1;
  cut(cB, null, { ...BOARD, d: BOARD.d * 1.12, az: BOARD.az - 4 }, L_BOARD);
  shot(cB, cC - 0.02 - cB, BOARD, "sine.inOut");
  st(t.eclate + 0.1, 0.5, { litBoard: 1 }, "sine.out");
  st(t.secteur - 0.35, 0.7, { flow: 0.45 }, "sine.inOut");
  chip("chip-onduleur", null, 96, 470, t.eclate + 0.15, t.elle - 0.1);

  /* ───────────── « Elle le lance dans l'inducteur : » — the current runs up the riser; cut to the coil on « inducteur » ───────────── */
  st(t.lance, t.inducteur + 0.25 - t.lance, { flow: 1 }, "sine.inOut");
  st(t.inducteur, 0.5, { litBoard: 0.25 }, "sine.inOut");
  cut(cC, null, { ...COIL, d: COIL.d * 1.1 }, L_COIL);

  /* ───────────── « une bobine de cuivre, sous le verre. » — the current runs round its turns; the glass above draws ───────────── */
  const cH = t.et - 0.1;
  st(t.bobine - 0.1, 0.5, { coil: 1, litCoil: 1 }, "sine.out");
  shot(cC, cH - 0.02 - cC, { ...COIL, d: 58, az: COIL.az + 8, el: COIL.el - 4 }, "sine.inOut");
  st(t.sousverre, 0.4, { litGlass: 1 }, "sine.out");
  chip("chip-inducteur", null, 96, 470, t.bobine, t.et - 0.15);

  /* ───────────── « Et au bout… le cœur : le fond de ta casserole. » — cut under the glass to the base, seen from below ───────────── */
  cut(cH, null, { ...HEART, d: HEART.d * 1.08 }, L_HEART);
  // the rest steps back: the base is the only lit thing in the frame
  st(t.coeur - 0.2, 0.6, { litCoil: 0, litGlass: 0, litBoard: 0, coil: 0.3, flow: 0.4 }, "sine.inOut");
  st(t.coeur, 0.4, { litPan: 1 }, "sine.out");
  punch(t.coeur, 0.06);
  shot(cH, t.toprincipe - 0.02 - cH, HEART_IN, "sine.inOut");
  chip("chip-coeur", null, 96, 470, t.coeur + 0.05, t.toprincipe - 0.25);

  /* ───────────── cut: the same base, closed and cut in half — « Pourquoi ça chauffe ? » ───────────── */
  cut(t.toprincipe, SET.BENCH, SEC, {
    // (on 0.7: the field and the coil drawn softer — at 1 the loops bloomed into one green haze)
    ...BENCHED, see: 1, cut: 1, explode: 0, on: 0.7, coil: 0, flow: 0, field: 0, eddy: 0, panHeat: 0, glassHeat: 0,
    litPan: 0, ...L_SEC,
  });
  // (no slow stretch: the camera already settles down toward the coil)
  shot(t.toprincipe + 0.02, t.champ - (t.toprincipe + 0.02), SEC_FIELD, "sine.inOut");

  /* ───────────── « La bobine fait battre un champ magnétique, environ 25 000 fois par seconde. » ───────────── */
  st(t.pbobine - 0.1, 0.4, { coil: 1, litCoil: 0.6 }, "sine.out");
  st(t.champ - 0.15, 0.9, { field: 1 }, "sine.out");
  shot(t.champ, t.il - t.champ, { ...SEC_FIELD, az: SEC_FIELD.az + 6, d: SEC_FIELD.d * 0.92 }, "sine.inOut");
  chip("chip-champ", null, 96, 470, t.environ, t.il - 0.1);

  /* ───────────── « Il traverse le verre… » — along the glass: the loops pass it, it stays dark ───────────── */
  st(t.il, 0.4, { litCoil: 0.3 }, "sine.inOut");
  shot(t.il, t.tourner - t.il, SEC_GLASS, "sine.inOut");

  /* ───────────── « et fait tourner des courants dans le métal, » — the base close; its sheet carries the currents ───────────── */
  st(t.tourner - 0.1, 0.7, { eddy: 0.35 }, "sine.out"); // (0.35: at 1 the rings covered the cut face)
  shot(t.tourner - 0.05, t.qui - (t.tourner - 0.05), SEC_METAL, "sine.inOut");
  chip("chip-courants", null, 96, 470, t.metal, t.torepos - 0.24);

  /* ───────────── « qui chauffe comme un grille-pain. » — the heat is born in the base and rises into the water ───────────── */
  st(t.qui, t.principeEnd - t.qui, { panHeat: 1 }, "sine.inOut");
  st(t.qui, 0.6, { on: 1 }, "sine.inOut"); // back to the seam's state before the wide
  st(t.qui + 0.3, t.principeEnd - t.qui, { glassHeat: 0.6 }, "sine.inOut");
  shot(t.qui - 0.05, t.torepos - (t.qui - 0.05), SEC_WIDE, "sine.inOut");
  st(t.qui, t.torepos - t.qui, { fy: B + 3, fs: 34 }, "sine.inOut");
  punch(t.grille, 0.06);
}
