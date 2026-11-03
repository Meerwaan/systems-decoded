// 02 · AUTOPSIE — from "…on l'ouvre." to the cut of act 3 (tobench 18.71 → tozero 40.30).
//
// Act 1 leaves the hero signal whole, seen from the car's left (VIEW.system). On "on" the same signal stands on the
// bench at the same place of the picture (benchCut) and comes apart on "l'ouvre" — lid up the mast, bell up, lenses
// out of their plates, the boom out of its hub — while the camera eases back to the whole exploded view. "un mât":
// the support lights veille and the camera climbs it, up to the R24 ("un feu rouge" — it blinks), and slides on up
// to the bell ("une sonnerie" — it rings), in ONE gliding frame. "La demi-barrière": the signal closes again as the
// camera comes down and back along the boom; "elle brille dans tes phares": two headlamp spots run along it and the
// bands light where they hit. "Et sa lisse…": the boom alone on its veille halo (the rest a ghost), big — "céder"
// hits, without showing where it would break.
// "Un train approche": a cut to the crossing seen from above as a maquette — no car, booms up. The R24s light on
// "feu", the twenty seconds count down, the entry booms come down, then the exit ones (the header counts them), and
// the TGV comes into the frame "juste après". The threshold never stops the film: a cut back to the road at the
// stuck instant (clock 8.8), the camera already low over voie 2 and coming down to the rail toward the headlamps —
// it lands on VIEW.rail on the frame act 3 cuts to it.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, BENCHAT, STAGED, trainAt } from "./world.js";
import { R24, BELL } from "./plan.js";

/* ── on the bench (the hero's foot at the origin; explode lifts the bell +70, the lenses +26) ── */
// (retouche: closer and a little more side-on — the lifted bell still just under the header, the housing's foot ≈ 1600)
const EXPL = { ...VIEW.exploded, tx: -45, ty: 175, d: 1045, az: -30, el: 14, shift: -130 };
const LAMP = { ...VIEW.lampBench, ty: R24.y + 8 };
const BELLUP = { ...VIEW.bellBench, ty: BELL.y + 70 + 6, d: 260 };
// the half-barrier from beyond its tip: the boom runs from the foreground to its housing (lit), the mast above
const BOOM = { ...VIEW.boomBench, tx: -200, ty: 110, d: 700, az: -68, el: 14, fov: 34, shift: 40 };
const SWEEP = { ...BOOM, d: 650, az: -72, el: 12 };
// the boom alone, big, 3/4 from above its tip: it runs across the frame on its halo
const ALONE = { ...BOOM, tx: -230, ty: 100, d: 620, az: -62, el: 20 };
// the light: what it stands around, and how wide
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_TOP = { fx: 0, fy: 250, fz: 0, fs: 120 };
const L_BOOM = { fx: -230, fy: 100, fz: 0, fs: 230 };

/* ── the maquette (car's frame, the car hidden) ── */
// (VIEW.top, and a high 3/4, are a tangle of lines at 270 px. Retouche: low, from beyond the hood, on the pair in front
// of it — inB near the centre, the hero outA beyond — their two booms meeting across the road; voie 2 runs up behind
// them to the upper left, where the TGV's headlamps come in. The X-ray of the rails, deck and road dimmed: shell 0.15)
const TOP0 = { ...VIEW.plunge, tx: -250, ty: 110, tz: -250, d: 2000, az: -120, el: 24, fov: 40, shift: 40 };
const TOP1 = { ...TOP0, d: 1880, az: -123, el: 23 };

/* ── the threshold: low over voie 2, coming down to the rail ── */
const RAIL0 = { ...VIEW.rail, el: 5.5, az: -84, d: 3400 };

export default function acte2({ D }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    droite: "droite", mat: "mat", r24: "r24", bell: "bell", demi: "demi", blanc: "blanc", brille: "brille",
    lisse: "lisse", ceder: "ceder", eclEnd: "eclate$",
    repos: "repos", feu: "repos:feu", vingt: "vingt", entree: "entree", sortieB: "sortieB", apres: "apres",
    toseuil: "toseuil", seuil: "seuil", seuilCeder: "seuil:céder", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── "…on l'ouvre." — the same signal on the bench, in place; it comes apart on "l'ouvre" ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCHAT,
    state: { ...BENCHED, clock: 8.8, annonce: 20, gap: -3, car: 1, alive: 1, train: trainAt(8.8) },
  });
  st(t.explode + 0.1, 1.15, { explode: 1 }, "power2.out");
  const wide = t.droite + 0.1 - (t.tobench + 0.02);
  shot(t.tobench + 0.02, wide, EXPL, "sine.inOut", bench.d);

  /* ───────────── "À droite de la route, un mât :" — the support lights; the camera climbs the mast… ───────────── */
  st(t.mat - 0.12, 0.3, { litBar: 1 }, "sine.out");
  const climb = t.droite + 0.1;
  shot(climb, t.r24 - 0.04 - climb, LAMP, "sine.inOut", EXPL.d);
  st(climb, t.r24 - climb, L_TOP, "sine.inOut");

  /* ───────────── "un feu rouge," — the R24 blinks… ───────────── */
  st(t.r24 - 0.2, 0.25, { litBar: 0 }, "sine.inOut");
  st(t.r24 - 0.06, 0.2, { litLamp: 1 }, "sine.out");
  now(t.r24 + 0.02, { flash: 1 });
  chip("chip-r24", null, 96, 470, t.r24 - 0.04, t.bell - 0.2);

  /* ───────────── "une sonnerie." — …and the frame slides on up to the bell: it rings ───────────── */
  const up = t.r24 + 0.32;
  shot(up, t.bell + 0.08 - up, BELLUP, "sine.inOut", LAMP.d);
  st(t.bell - 0.12, 0.25, { litLamp: 0 }, "sine.inOut");
  st(t.bell - 0.06, 0.2, { litBell: 1, ring: 1 }, "sine.out");
  chip("chip-sonnerie", null, 96, 470, t.bell - 0.02, t.demi - 0.22);

  /* ───────────── "La demi-barrière, blanc et rouge :" — it closes again; down and back along the boom ───────────── */
  const down = t.demi - 0.3;
  st(down, 0.3, { litBell: 0, ring: 0, flash: 0 }, "sine.inOut");
  st(down, 1.1, { explode: 0 }, "sine.inOut");
  shot(down, t.blanc - down, BOOM, "sine.inOut", BELLUP.d);
  st(down, t.blanc - down, L_WHOLE, "sine.inOut");
  st(t.demi - 0.05, 0.3, { litBar: 1 }, "sine.out");
  chip("chip-demi", null, 96, 470, t.blanc, t.lisse - 0.3);

  /* ───────────── "elle brille dans tes phares." — two headlamp spots run along it, the bands light ───────────── */
  st(t.brille - 0.12, t.lisse - 0.3 - (t.brille - 0.12), { sweep: 1 }, "none");
  shot(t.blanc, t.lisse - 0.35 - t.blanc, SWEEP, "sine.inOut");

  /* ───────────── "Et sa lisse… est conçue pour céder." — the boom alone on its halo, big ───────────── */
  st(t.lisse - 0.3, 0.3, { litBar: 0 }, "sine.inOut");
  st(t.lisse - 0.06, 0.4, { litBoom: 1 }, "sine.out");
  shot(t.lisse - 0.35, t.repos - 0.2 - (t.lisse - 0.35), ALONE, "sine.inOut");
  st(t.lisse - 0.35, 0.8, L_BOOM, "sine.inOut");
  punch(t.ceder, 0.06, { hold: 0.18, down: 0.4 });
  chip("chip-lisse", null, 96, 470, t.ceder - 0.08, t.repos - 0.3);

  /* ───────────── "Un train approche : le feu s'allume, au moins 20 secondes avant lui." — the maquette ───────────── */
  const torepos = t.repos - 0.12;
  cut(torepos, SET.ROAD, TOP0, {
    ...STAGED, shell: 0.15, car: 0, you: 0, file: 0, downIn: 0, downOut: 0, flash: 0, ring: 0, give: 0,
    train: 900, beam: 1, clock: 8.8, annonce: 20, explode: 0, sweep: 0,
  });
  shot(torepos + 0.02, t.toseuil - 0.04 - torepos, TOP1, "sine.inOut");
  st(t.feu - 0.04, 0.12, { flash: 1, ring: 1 }, "power2.out");
  chip("chip-annonce", null, 96, 470, t.feu + 0.05, t.toseuil - 0.24);
  st(t.vingt, t.apres - t.vingt, { annonce: 0 }, "none");

  /* ───────────── "Les barrières d'entrée descendent, puis celles de sortie." — the header counts them ───────────── */
  st(t.entree - 0.05, 1.1, { downIn: 1 }, "sine.inOut");
  st(t.sortieB - 0.45, 0.95, { downOut: 1 }, "sine.inOut");

  /* ───────────── "Et le train peut passer juste après." — the TGV comes into the frame once the last boom is down ───────────── */
  st(torepos, t.sortieB + 0.5 - torepos, { train: 120 }, "none");
  st(t.sortieB + 0.5, t.toseuil - (t.sortieB + 0.5), { train: -25 }, "none");

  /* ───────────── "Abonne-toi : cette barrière, tu vas la voir céder." — back to the road, already on its way ───────────── */
  cut(t.toseuil, SET.ROAD, RAIL0, { ...STAGED, train: trainAt(8.8), beam: 1, clock: 8.8, annonce: 20 });
  shot(t.toseuil + 0.02, t.tozero - t.toseuil - 0.02, VIEW.rail, "sine.inOut");
  followCall(tl, { from: t.seuil, to: t.seuilEnd });
  punch(t.seuilCeder, 0.05, { hold: 0.18, down: 0.4 });
}
