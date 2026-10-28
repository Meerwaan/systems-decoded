// 02 · AUTOPSIE — from the cut to the bench to the cut of act 3 (tobench → tozero).
//
// Act 1 ends close on the detector on its wall (VIEW.system), its current glowing under the face. Just before "on"
// the bedroom goes out around it and the same detector stands on its pool, in place (benchCut, BENCH_ORIGIN); on
// "on" it comes apart into ONE row across the camera and the camera pulls back to the whole row (by ratio).
// Then the air's way through it, part by part, each on its word, the camera gliding along the row:
//   « L'air de ta chambre entre par la grille » — the beads come in from the left, the grille lights up ;
//   « Il traverse une membrane… » — on to the membrane, the beads cross it ;
//   « …et touche une électrode » — on to the cell, the beads land on its platinum face ;
//   « Derrière : une puce, un buzzer, et une pile » — ONE frame for the three, each lit on its word.
// Every part once named stays faintly lit: at eclate$ the whole row glows (the cover).
// « Sur cette électrode, le monoxyde brûle » — a cut to the platinum, close: on "brûle" a glint, the lens closes.
// « Ça fait un petit courant, proportionnel au gaz » — a faint head of light (0.2) leaves for the chip; on
// "proportionnel" the gas doubles and the current goes FULL (1); on "gaz" both come down: the proportion, seen.
// « La puce l'additionne, minute après minute… » — a cut to the chip and its ring; #gauge comes in; on each "minute"
// the clock gains one and a segment fills. « …comme ton sang » — a cut to the blood (the ring filling → the cells
// loading): one more cell gives its oxygen up.
// The threshold does not stop the film: « Abonne-toi : cette heure… regarde-la passer » — the camera is already
// pulling back out of your chest, the flat comes back around you asleep, the detector on its wall, the boiler
// behind: the hook's picture. On "heure" the clock of the header knocks. Act 3 cuts from there to the flat seen high.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, POSE0, LOOK, BENCHED, STAGED, BLOODED, BENCH_ORIGIN, BENCHAT, ROW } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const BY = BENCHAT[1];
/** Where a part of the row stands (root coordinates on the bench: the root is at BENCHAT). */
const rowX = (i) => (i - (ROW.order.length - 1) / 2) * ROW.pitch;
const X = Object.fromEntries(ROW.order.map((n, i) => [n, rowX(i)]));

/* ── the frames ── */
// the whole row (VIEW.exploded): the façade at left, the battery near the right edge
const WIDE = VIEW.exploded;
// the grille near, the membrane beside it: the beads coming in from the left
const GRILLE = { ...P, ...CLOSE, tx: X.grille + 4, ty: BY, tz: ROW.z, d: 115, az: -30, el: 16, fov: 30, shift: 70 };
const MEMBRANE = { ...GRILLE, tx: X.membrane + 3, d: 105 };
const ELECTRODE = { ...GRILLE, tx: X.electrode + 2, d: 100 };
// the far end of the row: chip, buzzer, battery in one frame
const TRIO = { ...P, tx: X.buzzer + 1, ty: BY, tz: ROW.z, d: 150, az: -20, el: 18, fov: 30, shift: 40 };
// the platinum close (VIEW.electrode), and the electrode with the chip beside it: the current's way
const PLATINUM = VIEW.electrode;
const TRACE = { ...P, ...CLOSE, tx: (X.electrode + X.puce) / 2, ty: BY, tz: ROW.z + 2, d: 92, az: -26, el: 12, fov: 28, shift: 60 };
const CHIP = { ...VIEW.puce, shift: -110 }; // (VIEW.puce put the chip under the gauge, in the top slot)
const BLOOD = { ...VIEW.blood, shift: -40 }; // (the gauge stays up: the cells below it)
// where the threshold's pull-back lands: the hook's picture (you asleep, the detector on its wall, the boiler behind)
const HOOK = { ...POSE0, drift: 0.3 };

// the light: what it stands around, and how wide
const lightAt = (x, fs) => ({ fx: x, fy: BY, fz: ROW.z, fs });
const L_ROW = lightAt(0, 45);
const L_FLAT = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: STAGED.fs };

export default function acte2({ D, co, world }) {
  const { tl, st, now, shot, cut } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    air: "air", grille: "grille", grilleEnd: "eclate:grille$", membrane: "membrane", membraneW: "eclate:membrane", electrode: "electrode",
    electrodeW: "eclate:électrode", derriere: "derriere", puce: "puce", puceW: "eclate:puce", buzzer: "buzzer", buzzerW: "eclate:buzzer",
    pile: "pile", pileW: "eclate:pile", eclateEnd: "eclate$",
    torepos: "torepos", brule: "brule", bruleW: "repos:brûle", courant: "courant", proportionnel: "proportionnel", propW: "repos:proportionnel",
    gazEnd: "repos:gaz$", additionne: "additionne", minute1: "minute1", minuteW1: "repos:minute", minute2: "minute2", minuteW2: "repos:minute#2",
    sang2: "sang2", toseuil: "toseuil", seuil: "seuil", heure: "seuil:heure", passer: "passer", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  // what act 1 hands over (its numbers of the story, as the timeline holds them just before the cut)
  D.tw.time(t.tobench - 1e-3);
  const H = { clock: D.S.clock, ppm: D.S.ppm, dose: D.S.dose, co: D.S.co, swap: D.S.swap, current: D.S.current };
  D.tw.time(0);

  /* ───────────── "…on l'ouvre." — the same detector on the bench, in place; it comes apart ON "on" ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCH_ORIGIN,
    state: { ...BENCHED, clock: H.clock, ppm: H.ppm, dose: H.dose, co: H.co, current: H.current },
  });
  st(t.explode, 1.0, { explode: 1 }, "power2.out");
  st(t.explode, 0.5, { current: 0 }, "sine.inOut");
  const open = t.air - 0.08;
  shot(t.tobench + 0.02, open - t.tobench - 0.02, WIDE, "sine.inOut", bench.d);
  st(t.explode, open - t.explode, L_ROW, "sine.inOut");

  /* ───────────── "L'air de ta chambre entre par la grille." — the beads come in; the grille on its word ───────────── */
  st(t.air, 1.0, { sniff: 0.8 }, "sine.out");
  shot(open, t.grille - open, GRILLE, "sine.inOut", WIDE.d);
  st(open, t.grille - open, lightAt(X.grille, 22), "sine.inOut");
  st(t.grille + 0.08, 0.3, { litGrille: 1 }, "sine.out");
  const cG = co.add({ title: "Grille", x: 96, y: 500, align: "start", tone: "system", anchor: A.grille });
  cG.show(tl, t.grille + 0.12);
  cG.hide(tl, t.membrane - 0.2);

  /* ───────────── "Il traverse une membrane…" — along the row to the membrane ───────────── */
  shot(t.grilleEnd + 0.1, t.membrane + 0.25 - t.grilleEnd - 0.1, MEMBRANE, "sine.inOut");
  st(t.grilleEnd + 0.1, 0.8, lightAt(X.membrane, 22), "sine.inOut");
  st(t.membrane, 0.3, { litGrille: 0.35 }, "sine.inOut");
  st(t.membraneW, 0.3, { litMembrane: 1 }, "sine.out");
  const cM = co.add({ title: "Membrane", x: 96, y: 500, align: "start", tone: "system", anchor: A.membrane });
  cM.show(tl, t.membraneW + 0.05);
  cM.hide(tl, t.electrode - 0.12);

  /* ───────────── "…et touche une électrode." — on to the cell: the beads land on its platinum ───────────── */
  const toCell = t.electrode - 0.5;
  shot(toCell, t.electrodeW + 0.1 - toCell, ELECTRODE, "sine.inOut");
  st(toCell, 0.8, lightAt(X.electrode, 22), "sine.inOut");
  st(t.electrode, 0.3, { litMembrane: 0.35 }, "sine.inOut");
  st(t.electrodeW, 0.3, { litElectrode: 1 }, "sine.out");
  const cE = co.add({ title: "Électrode", x: 96, y: 500, align: "start", tone: "system", anchor: A.electrode });
  cE.show(tl, t.electrodeW + 0.05);
  cE.hide(tl, t.puce - 0.12);

  /* ───────────── "Derrière : une puce, un buzzer, et une pile." — one frame, each on its word ───────────── */
  shot(t.derriere - 0.1, t.puceW - t.derriere, TRIO, "sine.inOut", ELECTRODE.d);
  st(t.derriere - 0.1, 0.9, lightAt(X.buzzer, 32), "sine.inOut");
  st(t.derriere, 0.4, { litElectrode: 0.35 }, "sine.inOut");
  st(t.puceW, 0.3, { litPuce: 1 }, "sine.out");
  st(t.buzzerW, 0.3, { litPuce: 0.4, litBuzzer: 1 }, "sine.out");
  st(t.pileW, 0.3, { litBuzzer: 0.5, litPile: 1 }, "sine.out");
  // a slow drift along the three while they are named: the frame never rests
  shot(t.puceW, t.torepos - t.puceW, { ...TRIO, tx: X.buzzer + 1.5, d: TRIO.d * 0.95 }, "sine.inOut");
  const cP = co.add({ title: "Puce", x: 984, y: 500, align: "end", tone: "system", anchor: A.puce });
  cP.show(tl, t.puceW + 0.02);
  cP.hide(tl, t.buzzerW - 0.05);
  const cB = co.add({ title: "Buzzer", x: 984, y: 500, align: "end", tone: "system", anchor: A.buzzer });
  cB.show(tl, t.buzzerW + 0.02);
  cB.hide(tl, t.pileW - 0.05);
  const cPi = co.add({ title: "Pile", x: 984, y: 500, align: "end", tone: "system", anchor: A.pile });
  cPi.show(tl, t.pileW + 0.02);
  cPi.hide(tl, t.torepos - 0.3);
  // the whole row lit (the cover: eclate$)
  st(t.pileW + 0.05, 0.35, { litGrille: 0.6, litMembrane: 0.6, litElectrode: 0.6, litPuce: 0.6, litBuzzer: 0.6 }, "sine.out");

  /* ───────────── "Sur cette électrode, le monoxyde brûle." — the platinum close; a glint on "brûle" ───────────── */
  cut(t.torepos, SET.BENCH, PLATINUM, { litGrille: 0, litMembrane: 0, litPuce: 0, litBuzzer: 0, litPile: 0, litElectrode: 0.25, sniff: 0.6, ...lightAt(X.electrode, 16) });
  shot(t.torepos, t.courant - 0.1 - t.torepos, { ...PLATINUM, d: PLATINUM.d * 0.86 }, "sine.inOut");
  st(t.bruleW - 0.02, 0.1, { litElectrode: 1 }, "power2.out");
  st(t.bruleW + 0.2, 0.7, { litElectrode: 0.3 }, "sine.inOut");
  D.punch(t.bruleW, 0.06);

  /* ───────────── "Ça fait un petit courant, proportionnel au gaz." — 0.2, then FULL with the gas, then down ───────────── */
  shot(t.courant - 0.1, t.additionne - 0.1 - (t.courant - 0.1), TRACE, "sine.inOut", PLATINUM.d * 0.86);
  st(t.courant - 0.1, 1.0, lightAt((X.electrode + X.puce) / 2, 20), "sine.inOut");
  st(t.courant, 0.35, { current: 0.2 }, "sine.out");
  st(t.propW, 0.35, { sniff: 1, current: 1 }, "power2.out");
  st(t.gazEnd + 0.05, 0.4, { sniff: 0.5, current: 0.4 }, "sine.inOut");

  /* ───────────── "La puce l'additionne, minute après minute…" — the chip and its ring; the gauge; one minute, two ───────────── */
  cut(t.additionne - 0.1, SET.BENCH, CHIP, { litElectrode: 0, litPuce: 0.5, current: 0.4, sniff: 0.5, ...lightAt(X.puce, 14) });
  shot(t.additionne - 0.1, t.sang2 - t.additionne + 0.1, { ...CHIP, d: CHIP.d * 0.85 }, "sine.inOut");
  tl.set("#gauge-s1", { opacity: 0 }, 0);
  D.panel("#gauge", t.additionne + 0.05, t.tozero - 0.32);
  st(t.minuteW1, 0.2, { clock: H.clock + 1, dose: H.dose + 0.04 }, "sine.out");
  st(t.minuteW2, 0.2, { clock: H.clock + 2, dose: H.dose + 0.08 }, "sine.out");

  /* ───────────── "…comme ton sang." — the ring filling → the cells loading ───────────── */
  cut(t.sang2, SET.FLAT, BLOOD, { ...STAGED, ...BLOODED, swap: H.swap, co: H.co, current: 0.5, sniff: 0.5 });
  st(t.sang2 + 0.08, 0.5, { swap: H.swap + 0.05 }, "sine.out");
  shot(t.sang2, t.toseuil - t.sang2, { ...BLOOD, d: BLOOD.d * 0.93 }, "sine.inOut");

  /* ───────────── the threshold: "Abonne-toi : cette heure… regarde-la passer." — already on the way back ───────────── */
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
  shot(t.toseuil, t.tozero - t.toseuil, HOOK, "sine.inOut", BLOOD.d * 0.93);
  // the flat comes back only once the camera is out of your body (d ≈ 190, ≈ 38 % of the move): never a giant glass arm
  const out = t.toseuil + 0.38 * (t.tozero - t.toseuil);
  st(out, t.tozero - 0.35 - out, { micro: 0 }, "sine.inOut");
  st(t.toseuil, t.tozero - t.toseuil, L_FLAT, "sine.inOut");
  tl.to("#hud-clock", { scale: 1.16, transformOrigin: "100% 50%", duration: 0.12, ease: "power2.out" }, t.heure);
  tl.to("#hud-clock", { scale: 1, duration: 0.35, ease: "power2.inOut" }, t.heure + 0.12);
}
