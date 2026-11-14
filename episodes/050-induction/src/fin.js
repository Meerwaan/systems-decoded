// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
//   chute        on the bench, in section: the coil below stays DARK, the heat is born in the base (retitle, D.verdict)
//   commentaire  back in the kitchen: the saucepan comes back down on its ring and warms the glass again — the answer
//                to the hook's C — then the hero display and its « H », the question asked as a duel (never answered)
//   like         the hob from above, the « H » lit, a child's hand on the worktop's edge
//   prochain     the same picture rising slowly (one orbit, no stop): the next file, last; nothing of the subject after
//   boucle       « Pendant ce temps, chez toi… »: cut on FIRST in the kitchen, the camera settles on POSE0
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0 } from "./world.js";

export default function fin({ D }) {
  const { tl, st, cut, path } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", nait: "nait", chuteEnd: "chute$", tocta: "tocta", parce: "parce",
    commentaire: "commentaire", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", likeEnd: "like$", toabo: "toabo", abo: "abo", prochain: "prochain", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* CHUTE — the section on the bench: below, the coil, dark; in the base, the heat is born */
  cut(t.toverdict, SET.BENCH, VIEW.sectionWide, {
    ...BENCHED, cut: 1, boil: 0.5, panHeat: 0.15, glassHeat: 0, eddy: 0.3, coil: 0, field: 0,
    fx: VIEW.section.tx, fy: VIEW.section.ty, fz: VIEW.section.tz, fs: 30,
  });
  const SB = VIEW.section; // the section's aim: the base on the glass (ty = B + 1.5)
  path([
    [t.toverdict, { ...VIEW.sectionWide, shift: 70 }],
    [t.pas, { tx: SB.tx - 3, ty: SB.ty - 2.5, d: 50, az: -20, el: 5, shift: 30 }], //   « pas d'en dessous »: the dark coil
    [t.nait + 0.4, { tx: SB.tx, ty: SB.ty, d: 36, az: -12, el: 10, shift: 50 }], // into the base: the heat is born there
    [t.tocta, { d: 31, az: -7, el: 12 }],
  ]);
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.nait - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  D.punch(t.pas, 0.06);
  // the currents fade (their rings saturate even at 0.15 and hid the base): the orange of the base reads alone
  st(t.nait - 0.1, 1.3, { panHeat: 1, eddy: 0.05 }, "sine.inOut"); // the heat is born IN the base…
  st(t.chuteEnd - 0.3, 0.9, { glassHeat: 0.6 }, "sine.inOut"); //               …and reaches the glass only by contact

  /* CE QUI EST DÛ — the saucepan comes back down on its ring: it is what warms the glass */
  // the hob from the front, high: worktop lines square to the frame (no diagonal band), saucepan and « H » under the
  // panel, the child's hand on the front edge at the left (sheet of four, retouche 14/11)
  const TOP = { ...VIEW.top, tx: 177, ty: 91, tz: 52, d: 215, az: 0, el: 40, shift: -120 };
  const PAN_UP = { ...VIEW.panLow, el: 11, shift: 60 };
  cut(t.tocta, SET.KITCHEN, PAN_UP, {
    ...STAGED, grip: 1, lift: 0.55, away: 1, palm: 1, hover: 1, on: 0, boil: 0, steam: 0.25, panHeat: 0.8, glassHeat: 0.45,
    xray: 0.6, power: 0, hot: 1,
  });
  st(t.tocta + 0.1, 1.0, { lift: 0 }, "sine.inOut");
  path([
    [t.tocta, PAN_UP],
    [t.parce, { tx: 196, ty: 94, tz: 42, d: 70, az: -24, el: 9 }], //   down to the base sitting on its ring
    [t.commentaire - 0.2, { d: 58, az: -32, el: 12 }],
  ]);
  st(t.parce - 0.1, 1.4, { glassHeat: 1, panHeat: 1 }, "sine.inOut");

  /* COMMENTAIRE — the hero display, its « H »: a choice, never answered for the viewer */
  cut(t.commentaire - 0.2, SET.KITCHEN, VIEW.display, {
    ...STAGED, grip: 0, lift: 0, away: 1, palm: 1, hover: 1, on: 0, boil: 0, steam: 0.15, panHeat: 1, glassHeat: 1,
    power: 0, hot: 1,
  });
  path([
    [t.commentaire - 0.2, VIEW.display],
    [t.tolike, { d: 33, az: -20, el: 36 }],
  ], { to: "rest" });
  duelCall(tl, { from: t.commentaire - 0.1, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.3, toneA: "signal", toneB: null });

  /* LIKE, then the NEXT FILE — the hob from above, one slow orbit to the loop */
  cut(t.tolike, SET.KITCHEN, TOP, {
    ...STAGED, you: 0, grip: 0, lift: 0, away: 1, on: 0, boil: 0, steam: 0, panHeat: 0.8, glassHeat: 1, power: 0, hot: 1,
    child: 0, fx: TOP.tx, fy: TOP.ty, fz: TOP.tz, fs: 90,
  });
  st(t.like, 1.2, { child: 1 }, "sine.out");
  st(t.toabo, 1.0, { child: 0 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} familles` });
  path([
    [t.tolike, TOP],
    [t.toabo, { az: 4, el: 42, d: 208 }],
    [t.toloop, { az: 8, el: 44, d: 200 }],
  ]);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* BOUCLE — back to tonight, the first frame */
  cut(t.toloop, SET.KITCHEN, { ...POSE0, d: 96, el: 10 }, { ...FIRST });
  D.shot(t.toloop, t.rewind - t.toloop, { ...POSE0, d: 84, el: 7 }, "sine.out");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: 84 });
}
