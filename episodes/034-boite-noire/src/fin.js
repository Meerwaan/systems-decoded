// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
//   chute      (toverdict → tocta) on the bottom, two years on: the beacon and the chassis broken and dark around it,
//              the block alone in the light that came down. « Sa balise » struck → « Sa mémoire »; the block lights
//              veille on « bloc », the account name on « attendre » (D.verdict)
//   commentaire (tocta → tolike) « Et ton avion ? » : the A330 of glass in cruise, then by ratio into its tail, onto
//              the box, before « Après » — 2 heures / 25 heures side by side; on « ton prochain avion » the lens pulls
//              back to the whole plane and the duel asks — the film never answers
//   like       (tolike → toabo) the recorder whole on the bench; « noire » punches, « orange » makes its bands shine
//   prochain   (toabo → toloop) the lens pulls back, the picture slid down under the classified panel. The LAST thing
//              said: nothing of the subject comes back after it
//   boucle     (toloop → end) under the water again, a little further than the first frame: the box sinks and turns,
//              J−30; D.loop brings FIRST and POSE0 back on « rewind »: the last frame IS the first
// A title or a panel has finished leaving BEFORE the cut that follows it. Every cut gives the header back explicitly.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FLOWN, FIRST, POSE0, REC } from "./world.js";

const DEG = Math.PI / 180;
const HEAD = { days: 0, months: 23, alarm: 1 }; // the header through the end: J−0, +23 mois, signal

/* ── the poses ── */
// the chute: the module (y ≈ 19) 80 cm over the debris (y ≈ −80): pulled back so both hold between the title and the
// captions, from above el 15 (lower, the white-pink sheen burns the orange paint); then a slow climb
// (retouche b : le verdict est le module, plus le champ de débris — visé sur lui (y ≈ 19), ≈ 40 % de la largeur, sous le
// titre, au-dessus des sous-titres ; les débris, 80 cm plus bas, sortent par le bas du cadre)
const VERDICT = { ...VIEW.verdict, ty: 19, d: 200, el: 20, shift: 20 };
const VERDICT2 = { ...VERDICT, d: 175, el: 24 }; // …and closes a little on the module
// AIR — 023 flies its plane nose up by 1.5°: the tail, 24.5 m behind its centre, hangs 64 cm lower than REC.inPlane
// says (the same correction as acte1.js; world.js is left as it is)
const SAG = -REC.inPlane[0] * Math.sin(1.5 * DEG);
const TAILBOX = { ...VIEW.tailBox, ty: VIEW.tailBox.ty + SAG };
// the box in the tail, low enough to leave the top slot to the chips and the duel
const INTAIL = { ...TAILBOX, d: TAILBOX.d * 1.12, az: 18, shift: 0 };
// VIEW.plane re-aimed at the box in its tail, the picture slid to keep the plane where VIEW.plane has it (acte1.js):
// the dive into the tail and the pull-back keep the box where it is, it never wanders off the edge
const PLANE = { ...VIEW.plane, tx: TAILBOX.tx, ty: TAILBOX.ty, tz: TAILBOX.tz, side: -290, shift: 60 };
// BENCH — the like: the box whole, low under the like panel (≈ 40 %), from above el 15; once the panel is gone,
// « orange vif » pushes in (≈ 55 %)
const LIKE = { ...VIEW.like, tx: 0, ty: 11, d: 290, az: -56, el: 24, shift: -50, dof: 0 };
const LIKE2 = { ...LIKE, d: 220, az: -46, el: 22, shift: 60 };
// …the next file: pulled back, the picture slid down under the panel (the box ≈ 35 %, nothing bright behind the header)
const NEXT = { ...VIEW.whole, tx: 0, ty: 12, d: 340, az: -34, el: 26, shift: -150, dof: 0 };

/* ── the light ── */
const L_VERDICT = { fx: 0, fy: 0, fz: 0, fs: 90 };
const L_PLANE = { fx: 400, fy: 0, fz: 0, fs: 3500 };
const L_TAILBOX = { fx: REC.inPlane[0], fy: REC.inPlane[1] + SAG + 12, fz: REC.inPlane[2], fs: 60 };

export default function fin({ D }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", sauve: "sauve", bloc: "bloc2", attendre: "attendre",
    tocta: "tocta", sorti: "sorti", deuxh: "deuxh", apres: "apres", vingtcinq: "vingtcinq", commentaire: "commentaire",
    prochain: "prochain", davant: "davant", dapres: "dapres",
    tolike: "tolike", like: "like", likeEnd: "like$", noire: "noire", orange: "orange",
    toabo: "toabo", abo: "abo", barriere: "barriere", aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });

  /* ═════════════ CHUTE — « Voilà son secret : ce n'est pas sa balise qui la sauve. C'est un bloc… qui sait attendre. » ═════════════ */
  cut(t.toverdict, SET.DEEP, VERDICT, { ...STAGED, ...HEAD, mood: 0, depth: 3899.2, free: 1, apart: 1, beam: 1, ...L_VERDICT });
  shot(t.toverdict, t.tocta - t.toverdict, VERDICT2, "sine.inOut"); // the slow climb over the broken box
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.bloc - 0.25, hideAt: t.tocta - 0.42 });
  st(t.bloc - 0.1, 0.6, { litCore: 1 }, "sine.out"); // « un bloc de quelques kilos » : the block lights veille
  st(t.attendre - 0.05, 0.7, { hold: 0.6 }, "sine.out"); // « qui sait attendre » : the steel that held, alive
  D.verdict(t.attendre);

  /* ═════════════ COMMENTAIRE — « Et ton avion ? … deux heures de voix. Après : vingt-cinq. En commentaire : ton prochain avion… d'avant, ou d'après ? » ═════════════ */
  cut(t.tocta, SET.AIR, PLANE, { ...FLOWN, ...HEAD, ...L_PLANE });
  st(t.tocta, t.tolike - t.tocta, { ahead: FLOWN.ahead - 0.04 }, "none"); // the plane flies, all the beat long
  // « Et ton avion ? En Europe, sur un gros avion sorti avant 2021… » : the whole plane, pushed in slowly
  // (a dive through the tail reads as a chaos of glass, acte1 7.3–7.9 s: the box is reached by a cut)
  const inTail = t.deuxh - 0.6;
  shot(t.tocta, inTail - t.tocta, { ...PLANE, d: PLANE.d * 0.72 }, "sine.inOut", PLANE.d);
  // « …elle ne doit garder que deux heures de voix. Après : vingt-cinq. » : CUT into its tail, onto the box
  cut(inTail, SET.AIR, INTAIL, { ...FLOWN, ...HEAD, ahead: FLOWN.ahead - 0.04 * (inTail - t.tocta) / (t.tolike - t.tocta), plane: 0.8, ...L_TAILBOX });
  shot(inTail, t.tolike - inTail, { ...INTAIL, az: 38, d: INTAIL.d * 0.9 }, "sine.inOut"); // a slow turn round the box
  const chipsOut = t.prochain - 0.6;
  D.chip("chip-2h", null, 96, 470, t.deuxh - 0.3, chipsOut);
  D.chip("chip-25h", null, 96, 560, t.vingtcinq - 0.1, chipsOut);
  // « En commentaire : ton prochain avion… d'avant, ou d'après ? » — the duel, once the two chips have left
  duelCall(tl, { from: chipsOut + 0.2, word: t.commentaire, aAt: t.davant, bAt: t.dapres, to: t.tolike - 0.3, toneA: "signal", toneB: "veille" });

  /* ═════════════ LIKE — « Like : pour quelqu'un qui la croit encore noire. Elle est orange vif. » ═════════════ */
  cut(t.tolike, SET.BENCH, LIKE, { ...BENCHED, ...HEAD, depth: 3900 });
  const likeOut = t.noire + 0.45; // the panel leaves after « noire »: « elle est orange vif » is the box's
  shot(t.tolike, likeOut - t.tolike, { ...LIKE, az: -52 }, "sine.inOut");
  shot(likeOut - 0.15, t.toabo - likeOut + 0.15, LIKE2, "sine.inOut", LIKE.d); // « elle est orange vif » : it comes closer
  likeCall(tl, { from: t.like, to: likeOut, count: 5, label: (n) => `${n} personnes` });
  D.punch(t.noire, 0.06);
  st(t.orange - 0.05, 0.6, { shine: 1 }, "sine.out"); // « orange vif » : the bands catch the light

  /* ═════════════ PROCHAIN DOSSIER — « Prochain dossier : la barrière du passage à niveau. Elle est faite pour casser. » ═════════════ */
  const backAt = t.toabo + 2.2; // out from under the panel quickly, then a slow drift to the loop
  shot(t.toabo, backAt - t.toabo, NEXT, "sine.inOut", LIKE2.d);
  shot(backAt, t.toloop - backAt, { ...NEXT, d: NEXT.d * 0.95, az: -28 }, "sine.inOut");
  st(t.toabo + 0.6, 1.4, { shine: 0 }, "sine.inOut");
  nextFile(tl, { showAt: t.abo - 0.15, factAt: t.barriere, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ═════════════ BOUCLE — « Pendant ce temps, quelque part… » → the first frame ═════════════ */
  // (retouche b) ONE straight move from the cut to the last frame: the spin, the depth and the lens go on at the same
  // pace through « rewind » (a linear leg, then D.loop's glide in linear too) — no more stop at the join
  const LOOP_D0 = 150;
  const k = (t.rewind - t.toloop) / (D.tEnd - t.toloop); // how far along at « rewind »
  const LOOP0 = { ...POSE0, d: LOOP_D0 };
  const LOOP1 = { ...POSE0, d: LOOP_D0 * Math.pow(POSE0.d / LOOP_D0, k) }; // (by ratio, as shot() pulls with fromD)
  cut(t.toloop, SET.DEEP, LOOP0, { ...FIRST, depth: 30, spin: 2 });
  st(t.toloop, t.rewind - t.toloop, { spin: 2 + (FIRST.spin - 2) * k, depth: 30 + (FIRST.depth - 30) * k }, "none"); // it sinks and turns again
  shot(t.toloop, t.rewind - t.toloop, LOOP1, "none", LOOP0.d);
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: LOOP1.d, ease: "none" });
}
