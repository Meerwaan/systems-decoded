// c5 · « L'amerrissage » from « Dehors, moins sept degrés », « Pouvait-il rentrer à LaGuardia ? », « Le geste qui n'était
// pas dans l'ordre » up to « …une panne aussi basse » — HAND.c45 (440,98, a MOVE) → HAND.c56 (553,25, a CUT made by c6).
// The plan, sentence by sentence: docs/L05-actes.md § c5 (and docs/L05-actes-maj.md); journal docs/journal/L05-c5.md.
// Every instant is read off the script (D.at). A cut from place to place gives a COMPLETE state ({ ...AT.x, … }, with
// `era` and `clockOn`: REST puts them back to 0 and 1) and fades 0.2 s on a frame; a cut inside a place gives what
// changes. No number is carried by two tweens at once, and no cut sets a number that a running tween carries. `track`
// only changes on a cut. Facts and pieces have left before the cut that ends their shot.
import { SET, AT, VIEW, HAND, SHARP, CLOSE, seam, onFrame, cardAt } from "./world.js";
import { A320 } from "./plan.js";
import { glide } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";
import { showPiece } from "./pieces.js";

const E = A320.engine;
const FADE = { fade: 0.2 };
const GO = glide(0, 1); //   starts from rest, ends at speed
const ON = glide(1, 1); //   at speed on both ends
const STOP = glide(1, 0); // at speed, lands at rest
// the first ferry: hudson.js brings boat i in by e = 1 − (1 − a)³ from 450 m; with this ease e = 1 − (1 − u)⁴ — it
// covers the far, unseen part fast and spends the last 60 m (the 60 % of the time it is in the frame) settling in
const BERTH = (u) => 1 - Math.pow(Math.max(0, 1 - u), 4 / 3);
const T_AFLOAT = 1930; // 15:32:10 — the track afloat on the seam (= c4's last; the river carries it ≈ 2 m/s)

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const A = (ref, dt = 0) => at(ref) + dt;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const tl = D.tl;
  const AFLOAT = { doors: 1, rafts: 1, wingExits: 1, damage: 1, lock: 0 }; // what c4 left on the plane (flaps 0: its FLOAT cut)

  /* ═════════ 440,98 → 446,5 · « Dehors, moins sept degrés. L'eau à cinq. Maintenant, la menace, c'est le froid. » ═════════ */
  // the seam: the camera keeps pulling back from the front door to the whole plane afloat, people on the wings and rafts
  const p0 = seam(D, "c45", "in", { set: SET.VOL, state: { ...AT.water, ...AFLOAT, track: T_AFLOAT, evac: 0.7, flow: 0.5, fs: 900, clockOn: 1, era: 0 } }); // fs 900 = c4's last
  const tA = onFrame(A(HAND.c45.at) + HAND.c45.opt.after); //             442,58: the carried move has come to rest
  st(A(HAND.c45.at, 0.05), 1.5, { fs: 2000 }, "sine.inOut"); //           the light opens with the frame, the whole plane
  const tF = F("ferry", -0.12); //                                        446,5
  // back in, turning toward the bow: the plane ≈ 45 % by 444 (most of the way in 1,8 s), then the same move, slower, to the cut
  const IN = (k) => ({ ...p0, tx: p0.tx + k * (-450 - p0.tx), az: p0.az - 10 * k, el: p0.el + 2 * k, d: p0.d * (1 - 0.5 * k) });
  const tA2 = tA + 1.8; //                                                444,38
  shot(tA, 1.8, IN(1), glide(0, 0.08));
  shot(tA2, tF - tA2, IN(1 + (0.08 * (tF - tA2)) / 1.8), glide(1, 0.3)); // speeds matched at 444,38
  fact(tl, { id: "c5-froid", k: "Dehors", v: "MOINS 7 DEGRÉS", s: "EAU : 5 DEGRÉS", from: A("froid", 0.3), to: tF - 0.08 });
  st(A("menace", -0.3), 2, { cold: 1 }, "sine.inOut"); //                « la menace, c'est le froid » : the breath rises off the river

  /* ═════════ 446,5 → 451,1 · « 15 h 34 min 40 s, un premier bateau arrive. Un ferry de New York. » ═════════ */
  // from above, behind the left wing: the ferry comes in from far ahead-left and noses into the leading edge
  const W0 = { ...VIEW.wing, tx: -700, ty: -100, tz: 900, d: 5600, az: 38, el: 36, ...SHARP };
  const W1 = { ...W0, tx: -900, tz: 1200, d: 4900, az: 32, el: 32 };
  cut(tF, null, W0, {});
  const tR = F("renforts", -0.15); //                                    451,1
  shot(tF, tR - tF, W1, GO);
  st(A("ferry", 0.2), A("bateau", 1.7) - A("ferry", 0.2), { boats: 1 }, BERTH); // 446,8 → 450,6: alongside on « New York »

  /* ═════════ 451,1 → 457,2 · « En dix minutes, sept ferries sont là. Les pompiers… huit minutes. Les garde-côtes, dix-sept. » ═════════ */
  // the maquette: the boats leave their piers and close a ring around the glyph adrift; one figure at a time
  const M0 = { ...VIEW.mapFerries, d: 480, az: -38, el: 42 };
  const M1 = { ...VIEW.mapFerries, d: 410, az: -16, el: 38 };
  cut(tR, SET.CARTE, M0, { ...AT.carte, track: 2100, boatsMap: 0, clockOn: 0, era: 0 }, FADE);
  const tS = F("recupere", -0.13); //                                    457,2
  shot(tR, tS - tR, M1, "sine.inOut");
  st(tR + 0.25, 5.6, { boatsMap: 1 }, "none"); //                        451,35 → 456,95
  fact(tl, { id: "c5-f7", k: "En dix minutes", v: "7 FERRIES", from: A("septFerries", -0.1), to: A("pompiers", -0.08) });
  fact(tl, { id: "c5-fp", k: "Bateau-pompe", v: "8 MINUTES", from: A("pompiers", -0.05), to: A("gardes", -0.08) });
  fact(tl, { id: "c5-fg", k: "Garde-côtes", v: "17 MINUTES", from: A("gardes", -0.05), to: tS - 0.06 });

  /* ═════════ 457,2 → 460,0 · « En une vingtaine de minutes, tout le monde est récupéré. » ═════════ */
  // the nine boats around the plane; the people on the wings and rafts turn veille and leave; the piece on the right
  const R0 = { ...VIEW.ferries, tx: 0, tz: 400, d: 9800, az: -36, el: 30, side: 300, ...SHARP };
  const R1 = { ...R0, d: 9000, az: -28, el: 27 };
  cut(tS, SET.VOL, R0, { ...AT.water, ...AFLOAT, track: 2000, boats: 9, evac: 1, saved: 0, flow: 1, cold: 1, clockOn: 0, era: 0 }, FADE);
  const tB = F("bilan", -0.12); //                                       460,0
  shot(tS, tB - tS, R1, "sine.inOut");
  st(A("recupere", 0.1), 2.5, { saved: 1 }, "sine.inOut"); //            457,4 → 459,9
  showPiece(tl, { id: "secours", from: tS + 0.15, to: tB - 0.05, side: "right" });

  /* ═════════ 460,0 → 464,0 · « 155 personnes à bord. Cinq blessés graves. Aucun mort. » ═════════ */
  // wide and calm, low on the water: the plane alone, empty, adrift, Midtown behind
  const V0 = { ...VIEW.water, d: 7600, el: 4, ...SHARP };
  const V1 = { ...V0, d: 6900, az: -144, el: 3.5 };
  cut(tB, null, V0, { track: 2010, boats: 0 });
  const tJ = F("repeche", -0.12); //                                     464,0
  shot(tB, tJ - tB, V1, "sine.inOut");
  fact(tl, { id: "c5-bord", k: "À bord", v: "155 PERSONNES", from: tB + 0.25, to: A("aucun", -0.12) });
  fact(tl, { id: "c5-mort", k: "Blessés graves : 5", v: "AUCUN MORT", tone: "veille", from: A("aucun", -0.1), to: tJ - 0.02 });

  /* ═════════ 464,0 → 474,6 · « Les jours suivants, on sort les moteurs du fleuve… » · « On parlera de miracle… en France… » ═════════ */
  // the maquette dark behind the piece (on the left); then the camera travels up the route, to where the birds struck
  const J0 = { ...VIEW.mapWide, d: 1700, side: -330 };
  const J1 = { ...VIEW.mapWide, tx: 230, tz: -260, d: 1520, az: -2, el: 50, side: -300 };
  const J2 = { ...VIEW.mapWide, tx: 400, ty: 20, tz: -390, d: 1050, az: 14, el: 44, side: 0 };
  cut(tJ, SET.CARTE, J0, { ...AT.carte, track: 2100, clockOn: 0, era: 0 }, FADE);
  const tM = A("toulouse", 0.05); //                                     469,45
  const tK = F("simulateur", -0.15); //                                  474,6
  shot(tJ, tM - tJ, J1, GO);
  shot(tM, tK - tM, J2, STOP);
  showPiece(tl, { id: "moteur", from: A("moteursOut", -0.2), to: tM - 0.1, side: "left" });
  now(A("toulouse:France", -0.05), { era: 1 }); //                        « en France » : Avril 2009 · Toulouse

  /* ═════════ 474,6 → 479,85 · « …dans un simulateur. Pour une seule question. » · card « Pouvait-il rentrer à LaGuardia ? » ═════════ */
  // the plane put back where the birds struck (the route up to there, the strike pulsing), seen from ahead: LaGuardia behind it
  const L0 = { ...SHARP, fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3, tx: 480, ty: 18, tz: -320, d: 560, az: -168, el: 21 };
  const L1 = { ...L0, tx: 490, tz: -300, d: 600, az: -138, el: 26 };
  cut(tK, null, L0, { track: 1631, route: 1631, glyph: 1 });
  const tT = F("toulouseW", -0.12); //                                   479,8 (the card has left)
  shot(tK, tT - tK, L1, "sine.inOut"); //                                a slow turn, sharp under the card

  /* ═════════ 479,8 → 490,4 · « Avril 2009… rejouent la même panne… » · « Consigne : demi-tour… » · « …huit réussissent. » ═════════ */
  // above the strike, rising to the whole fan as the fifteen passes are flown
  const S0 = { ...VIEW.mapStrike, d: 760, az: 26, el: 36 };
  const S1 = { ...VIEW.mapStrike, tx: 430, tz: -360, d: 820, az: 4, el: 50 };
  cut(tT, null, S0, {});
  const tCo = F("consigne", -0.12); //                                   484,68
  shot(tT, tCo - tT, S1, GO);
  // « Consigne : demi-tour » : a cut close on the strike, from the other side; the heads leave it and the camera rises with the fan
  const C0 = { ...VIEW.mapStrike, tx: 440, ty: 24, tz: -400, d: 560, az: -34, el: 32 };
  const tSv = F("savaient", -0.12); //                                   490,7
  cut(tCo, null, C0, {});
  shot(tCo, tSv - tCo, { ...VIEW.mapSims }, "sine.inOut"); //            framed on the whole fan by « réussissent »
  st(A("demiTour", -0.2), 0.5, { glyph: 0 }, "power2.out"); //           the passes leave from the strike
  st(A("demiTour"), 0.8, { sims: 0.07 }, "sine.out"); //                  « demi-tour tout de suite » : the first heads go
  st(A("huit", -0.2), A("reussissent", 0.1) - A("huit", -0.2), { sims: 1 }, "sine.inOut"); // eight reach a runway
  fact(tl, { id: "c5-8", k: "Essais retenus", v: "8 SUR 15", from: A("reussissent", -0.05), to: A("ajout", -0.1) });

  /* ═════════ 490,8 → 495,6 · « Huit sur quinze. Mais ces pilotes savaient ce qui allait arriver… » ═════════ */
  const tW = F("ajout", -0.12); //                                       495,6
  // a cut on « Huit sur quinze » (raccord: the fan), low from the right, then down onto the strike, the passes fanning out of it
  cut(tSv, null, { ...VIEW.mapSims, tx: 436, ty: 20, tz: -405, d: 620, az: 44, el: 28 }, {});
  shot(tSv, tW - tSv, { ...VIEW.mapSims, tx: 436, ty: 20, tz: -405, d: 430, az: 12, el: 36 }, GO);

  /* ═════════ 495,6 → 502,0 · « …un autre essai : trente-cinq secondes de retard. Le temps de voir… de décider. » ═════════ */
  // the passes cleared: the plane alone at the strike, from ahead — the time it takes to understand
  const X0 = { ...L0, tx: 470, tz: -340, d: 470, az: -160, el: 18 };
  const X1 = { ...X0, d: 400, az: -152, el: 17 };
  cut(tW, null, X0, { sims: 0, glyph: 1 });
  const tE = F("echec", -0.1); //                                        502,0
  shot(tW, tE - tW, X1, "sine.inOut");
  fact(tl, { id: "c5-35", k: "Un autre essai", v: "+ 35 SECONDES", tone: "signal", from: A("retard", -0.1), to: tE - 0.06 });

  /* ═════════ 502,0 → 510,2 · « Avec trente-cinq secondes de retard… l'essai échoue. » · « Un seul essai… vers la piste treize… » ═════════ */
  // three-quarters over the strike and LaGuardia: the late pass falls short (signal); then down to where it ends
  const G0 = { ...VIEW.mapLGA, tx: 470, tz: -300, d: 980, az: 36, el: 42 };
  const G1 = { ...VIEW.mapLGA, tx: 500, tz: -180, d: 620, az: 24, el: 36 };
  cut(tE, null, G0, { glyph: 0 });
  const tFi = F("film", -0.12); //                                       510,2
  shot(tE, A("seul") - tE, { ...G0, d: 930, az: 33 }, "sine.inOut");
  shot(A("seul"), tFi - A("seul"), G1, GO); //                           « vers la piste treize » : onto the pass's end
  st(A("echec", 0.3), A("fail", -0.05) - A("echec", 0.3), { simLate: 1 }, "sine.inOut"); // 502,4 → 504,3
  punch(A("fail"), 0.06); //                                             « l'essai échoue »

  /* ═════════ 510,2 → 517,1 · « Si tu as vu le film Sully… Dans le rapport, ce sont eux qui ont ajouté ces trente-cinq secondes. » ═════════ */
  // no image of the film: the report (piece n° 3) on the right, the late pass on the maquette on the left
  const Y0 = { ...VIEW.mapSims, tx: 440, tz: -300, d: 1080, az: -14, el: 56, side: 330 };
  const Y1 = { ...Y0, d: 900, az: 12, el: 50 }; //                       a slow orbit, 26° in 6,9 s, never at rest
  cut(tFi, null, Y0, { era: 2 });
  const tC = F("conclusion", -0.12); //                                  517,1
  shot(tFi, tC - tFi, Y1, ON);
  showPiece(tl, { id: "rapport", from: A("film", 0.5), to: tC - 0.12, side: "right" });

  /* ═════════ 517,1 → 521,1 · « Leur conclusion : se poser sur l'Hudson donnait les meilleures chances de survie. » ═════════ */
  const Z0 = { ...VIEW.mapRiver, d: 1060, az: 4 };
  const Z1 = { ...VIEW.mapRiver, d: 940, az: 14, el: 33 };
  cut(tC, null, Z0, { simLate: 0, sims: 0, route: -1, track: 1860, glyph: 1, riverLit: 0 });
  const tG = F("gene", -0.12); //                                        521,1
  shot(tC, tG - tC, Z1, "sine.inOut");
  st(A("conclusion", 0.4), 2.4, { riverLit: 1 }, "sine.inOut"); //       517,6 → 520,0: the river lit, the way chosen

  /* ═════════ 521,1 → 529,4 · « Restait une question plus gênante… jusqu'au bout ? » · pub 8:46,3 · card « Le geste… » ═════════ */
  // the check-list on the bench: it opens; a slow glide down its first part, through the break and under the card
  const Q0 = { ...VIEW.qrh, d: 74, az: -30, el: 62 };
  const Q1 = { ...VIEW.qrh, d: 66, az: -6, el: 50, ...SHARP };
  cut(tG, SET.BENCH, Q0, { ...AT.bench, page: 0, clockOn: 0, era: 2 }, FADE);
  const tQ = F("tiers:trois", -0.12); //                                 ≈ 529,4 (« En trois minutes et demie »)
  shot(tG, tQ - tG, Q1, "sine.inOut");
  st(A("gene", 2.2), 1.5, { page: 1 }, "sine.inOut"); //                 « Pourquoi la check-list… » : it opens on part 1
  threadCall(tl, { from: cardAt(D, "tiers"), to: cardAt(D, "tiers") + 2.55, text: "La check-list ? Pas finie." });

  /* ═════════ 529,4 → 535,4 · « …l'équipage a parcouru environ un tiers de la check-list. » ═════════ */
  const Q2 = { ...VIEW.qrh, d: 58, az: 14, el: 56, ...CLOSE };
  const Q3 = { ...Q2, d: 54, az: 6, el: 60 };
  cut(tQ, null, Q2, {});
  const tN = F("quarante", -0.25); //                                    535,4
  shot(tQ, tN - tQ, Q3, "sine.inOut");
  st(A("tiersW", -0.35), 1.1, { done: 0.33 }, "sine.inOut"); //          the marker runs down part 1, and stops
  D.quiet(A("tiersW", -0.1), tN); //                                    the fact says it: no keyword under it
  fact(tl, { id: "c5-tiers", k: "Parcouru", v: "ENVIRON UN TIERS", from: A("tiersW", -0.05), to: tN - 0.06 });

  /* ═════════ 535,4 → 539,45 · « Les tentatives de rallumage ont pris trente à quarante secondes… » ═════════ */
  const Q4 = { ...VIEW.qrh, d: 50, az: -22, el: 46, ...CLOSE };
  const Q5 = { ...Q4, d: 46, az: -14, el: 48 };
  cut(tN, null, Q4, { named: 10 }); //                                   part 1's tab lit
  const tV = F("repartiront", -0.13); //                                 539,45
  shot(tN, tV - tN, Q5, "sine.inOut");
  fact(tl, { id: "c5-relight", k: "Les rallumages", v: "30 À 40 SECONDES", from: A("quarante", -0.05), to: tV - 0.06 });

  /* ═════════ 539,45 → 541,75 · « …“ces moteurs ne repartiront pas”… » — the fans turning slowly, in the air ═════════ */
  const N0 = { ...VIEW.engine, d: 760, az: -52, el: 9, ...CLOSE };
  const N1 = { ...N0, d: 700, az: -46 };
  cut(tV, SET.VOL, N0, { ...AT.hit, track: 1660, lock: 1, fs: 600, geese: 0, countOn: 0, clockOn: 0, era: 2 }, FADE);
  const tO = F("repartiront", 2.17); //                                  541,75
  shot(tV, tO - tV, N1, "sine.inOut");

  /* ═════════ 541,75 → 546,7 · « …ces secondes-là auraient servi ailleurs. » · « Et même la partie de l'eau avait un trou… » ═════════ */
  const Q6 = { ...VIEW.qrh, d: 64, az: 10, el: 52, ...CLOSE };
  const Q7 = { ...Q6, d: 58, az: 20, el: 56 };
  cut(tO, SET.BENCH, Q6, { ...AT.bench, page: 1, done: 0.33, clockOn: 0, era: 2 }, FADE);
  const tX = F("mauvaise", -0.15); //                                    546,7
  shot(tO, tX - tO, Q7, "sine.inOut");
  st(A("gpws", -0.2), 1.5, { page: 3 }, "sine.inOut"); //                the leaves turn to the water part
  st(A("trou", -0.1), 0.6, { gap: 1 }, "power2.out"); //                 « un trou » : the missing line, signal

  /* ═════════ 546,7 → 553,25 · « Était-ce la mauvaise check-list ? Non : c'était celle qui collait le mieux… aussi basse. » ═════════ */
  const Q8 = { ...VIEW.qrh, d: 80, az: -12, el: 58, ...SHARP };
  const Q9 = { ...Q8, d: 72, az: -20, el: 60 };
  cut(tX, null, Q8, {});
  const t1 = onFrame(A(HAND.c56.at)); //                                 553,25: c6 cuts here (a fade)
  shot(tX, t1 - tX - 0.02, Q9, "sine.inOut");
  st(A("mauvaise", 0.2), 0.6, { gap: 0 }, "sine.inOut");
  st(A("collait", -0.1), 2.6, { page: 0 }, "sine.inOut"); //            the binder closes before « aussi basse »
}
