// c6 · « Le geste qui n'était pas dans l'ordre » from « Mais il y a un geste », « Ce qui te protège depuis »,
// « Alors, qu'est-ce qui les a sauvés ? » and the loop — HAND.c56 (553,25) → the end (680,7). The plan, sentence by
// sentence: docs/L05-actes.md § c6 (and docs/L05-actes-maj.md); journal docs/journal/L05-c6.md.
// Every instant is read off the script (D.at). A cut from place to place gives a COMPLETE state ({ ...AT.x, … }) and
// fades 0.2 s on a frame; a cut inside a place gives what changes. No number is carried by two tweens at once, and no
// cut sets a number that a running tween carries. `track` is a fixed time of the day in every VOL shot here (the
// header's clock is hidden: the plane stands where the sentence needs it) and only changes on cuts; `lock` too.
// The last 15 s (from `like`, 665,7) keep the right half free for YouTube's end screen; the loop lands on POSE0.
import { SET, AT, VIEW, HAND, CLOSE, SHARP, POSE0, FIRST, seam, onFrame, cardAt } from "./world.js";
import { A320, hms } from "./plan.js";
import { glide } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { retitle } from "@kit/blocks.js";
import { showPiece } from "./pieces.js";

const FADE = { fade: 0.2 };
const GO = glide(0, 1); //   starts from rest, ends at speed
const ON = glide(1, 1); //   at speed on both ends
const STOP = glide(1, 0); // at speed, lands at rest

// the plane's moments (the header's clock is off: `track` says where the plane is)
const GESTURE = hms("15:27:25"); // just after the strike: the APU starts, the plane over the Bronx
const RIVER = hms("15:29:50"); //  low down the Hudson
const SHORT = hms("15:30:38"); //  the last metres over the water
const CLIMB = hms("15:26:00"); //  an ordinary climb, before the birds
const STRIKE = hms("15:27:11"); // the first frame's instant

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const A = (ref, dt = 0) => at(ref) + dt;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const tl = D.tl;
  // after the strike, the APU running and its current holding (from « l'a fait tout de suite » on)
  const HIT = (era) => ({ ...AT.hit, era, clockOn: 0, countOn: 0, apu: 1, feed: 1 });
  const FLY = (era) => ({ ...AT.vol, era, clockOn: 0, countOn: 0, track: CLIMB });

  /* ═════════ 553,25 → 561,2 · « Mais il y a un geste… Le commandant l'a fait tout de suite : l'APU. » · « …l'électricité a tenu » ═════════ */
  const t0 = onFrame(A(HAND.c56.at));
  const p0 = seam(D, "c56", "in", { set: SET.VOL, state: { ...AT.hit, era: 2, clockOn: 0, countOn: 0, apu: 0, feed: 0, track: GESTURE } });
  const tPC = F("courant2:ordinateurs", -0.12); //                           ≈ 561,2 « Les ordinateurs »
  const APU1 = { ...p0, d: 330, az: 47, el: 15 };
  shot(t0, A("tenu", -0.4) - t0, APU1, GO); //                               a slow push on the sleeping APU
  st(A("geste:fait", -0.1), 2.0, { apu: 1 }, "power2.inOut"); //             556,7 → 558,7: it spins up, its exhaust warms
  now(A("apuGeste", -0.05), { named: 6 }); //                                557,7 « l'APU »
  // « Grâce à lui, l'électricité a tenu » — the dashes leave the APU forward; the camera follows them a little
  const APU2 = { ...p0, tx: A320.apu.x - 160, d: 420, az: 62, el: 13 };
  shot(A("tenu", -0.4), tPC - A("tenu", -0.4), APU2, STOP);
  st(A("tenu", -0.3), 1.0, { feed: 1 }, "power1.inOut"); //                   560,3 → 561,3

  /* ═════════ 561,2 → 565,7 · « Les ordinateurs sont restés en loi normale. Jusqu'au fleuve, l'avion ne pouvait pas décrocher. » ═════════ */
  // raccord: the same veille dashes, now arriving into the computers' bay
  const PC0 = { ...VIEW.computers, d: 240, az: -28, el: 15 };
  cut(tPC, null, PC0, { named: 8, fs: 300 });
  const tLim = F("courant2:jusqu", -0.12); //                                 563,1
  shot(tPC, tLim - tPC, { ...VIEW.computers, d: 205, az: -16, el: 13 }, ON);
  // the limit: the arc ahead of the nose, the needle climbing to it as the voice says « décrocher »
  const LIM0 = { ...VIEW.limitSide, d: 4500, az: 6 };
  cut(tLim, null, LIM0, { named: 0, fs: 2000, lock: 0, track: RIVER, limit: 1, aoa: 0.3 });
  const tQ1 = F("noir", -0.12); //                                            565,7
  shot(tLim, tQ1 - tLim, { ...VIEW.limitSide, d: 4100, az: -2, el: 3 }, ON);
  st(tLim + 0.1, A("decrocher2", 0.2) - tLim - 0.1, { aoa: 0.9 }, "power2.out"); // 563,2 → 565,3

  /* ═════════ 565,7 → 571,4 · « Le rapport l'écrit noir sur blanc : en suivant simplement l'ordre de la check-list, ce geste n'aurait pas été fait. » ═════════ */
  const Q0 = { ...VIEW.qrh, d: 74, az: -26, el: 60 };
  cut(tQ1, SET.BENCH, Q0, { ...AT.bench, era: 2, page: 0 }, FADE);
  const tL = F("lent", -0.12); //                                             571,4
  shot(tQ1, tL - tQ1, { ...VIEW.qrh, d: 56, az: -6, el: 54 }, STOP); //       down onto the pages
  st(tQ1 + 0.4, 1.6, { page: 1 }, "power2.inOut"); //                         the binder opens
  st(A("noir:ordre", -0.05), 0.7, { apuMark: 1 }, "power2.out"); //           568,6: the APU's line, far down

  /* ═════════ 571,4 → 577,8 · « …l'avion volait trop lentement. Et que l'alarme de vitesse était masquée par celle du sol. » ═════════ */
  const PR0 = { ...VIEW.profile, d: 5000, az: 10, el: 3 };
  cut(tL, SET.VOL, PR0, { ...HIT(2), track: SHORT, limit: 1, aoa: 0.8 }, FADE);
  const tM = F("masquee", -0.12); //                                          576,4
  shot(tL, tM - tL, { ...VIEW.profile, d: 4400, az: -10, el: 3 }, ON); // (retouche: 20° and closer — no still stretch) //       along the plane, the water just under
  st(A("lent:trop", -0.1), 1.0, { aoa: 0.95 }, "sine.inOut"); //              574,3 « trop lentement »
  // « masquée » — inside: the ground alarm pulses on the glareshield
  cut(tM, null, { ...VIEW.cockpit, d: 165, az: 76, el: 17 }, { lock: 1, fs: 400, limit: 0, aoa: 0, alarm: 1 }); // the glareshield, three-quarter

  /* ═════════ 577,8 → 583,0 · « Il ne cherche pas de coupable. Il parle de charge de travail… et d'un entraînement… » ═════════ */
  const tQ2 = F("place", -0.12); //                                           583,0
  shot(tM, A("charge") - tM, { ...VIEW.cockpit, d: 185, az: 82, el: 14 }, GO);
  shot(A("charge"), tQ2 - A("charge"), { ...VIEW.cockpit, d: 290, az: 92, el: 9 }, STOP); // a slow pull-back: the two silhouettes
  st(A("charge", 0.1), 1.2, { alarm: 0 }, "power2.inOut");

  /* ═════════ 583,0 → 591,4 · « Pas un coup de chance. Un geste fait au bon moment… à la mauvaise place. » · « …Moins que tu ne crois. » ═════════ */
  const Q2 = { ...VIEW.qrh, tx: 3, tz: 4, d: 38, az: 46, el: 26 }; // grazing along the page, the APU's line across it
  cut(tQ2, SET.BENCH, Q2, { ...AT.bench, era: 2, page: 1, apuMark: 1 }, FADE); // low along the pages, the APU's line
  const tCh = A("change:alors"); //                                           587,2
  shot(tQ2, tCh - tQ2, { ...VIEW.qrh, tx: 3, tz: 4, d: 33, az: 36, el: 23 }, GO);
  punch(A("mauvaisePlace"), 0.06); //                                         586,1
  const tCard = onFrame(cardAt(D, "depuis")); //                              591,4
  shot(tCh, tCard - tCh, { ...VIEW.qrh, d: 60, az: -34, el: 46 }, STOP); // //   the binder shuts, we pull back from it
  st(tCh + 0.1, 1.7, { page: 0 }, "power2.inOut");

  /* ═════════ 591,4 → 599,6 · card « Ce qui te protège depuis » — « Ces moteurs ouverts : dedans, des plumes… bernaches du Canada. » ═════════ */
  // under the card: a whip onto the engine stand (the engine on the left, the piece of the dossier on the right)
  const ST0 = { ...VIEW.stand, d: 1500, az: -88, el: 20, side: 260, ...SHARP };
  cut(tCard, SET.BENCH, ST0, { ...AT.stand, era: 3 }, FADE);
  const tSt = A("depuis:ouverts", -0.4);
  shot(tCard, tSt - tCard, { ...VIEW.stand, d: 1050, az: -54, el: 13, side: 300, ...SHARP }, "power3.out");
  const tG1 = F("essais", -0.12); //                                          599,6
  shot(tSt, tG1 - tSt, { ...VIEW.stand, d: 920, az: -36, el: 11, side: 320, ...SHARP }, STOP); // (retouche: a slow turn to the end)
  st(A("depuis:ouverts", -0.05), 1.4, { explode: 1 }, "power2.out"); //        593,3 « ouverts »
  st(A("depuis:dedans"), 1.2, { goose: 1 }, "power2.out"); //                  594,3 « dedans » — the bird in the core
  showPiece(tl, { id: "plume", from: A("plumes", -0.3), to: A("bernaches", 0.35), side: "right" }); // 594,8 → 598,6

  /* ═════════ 599,6 → 603,6 · « Dans les essais de l'époque, le gros oiseau n'était pas lancé dans le cœur du moteur. » ═════════ */
  cut(tG1, null, { ...VIEW.gun, d: 700, az: -66, el: 9 }, { explode: 0, goose: 0, gun: 0, aimCore: 0, fs: 220 });
  const tG2 = F("regle", -0.12); //                                           603,6
  shot(tG1, tG2 - tG1, { ...VIEW.gun, d: 630, az: -58, el: 10 }, ON);
  st(A("coeur2") - 0.55 * 1.6, 1.6, { gun: 1 }, "none"); //                   the bird hits the blades on « cœur » (602,6)

  /* ═════════ 603,6 → 610,7 · « Depuis juin 2023… un oiseau tiré exprès dans son cœur. » ═════════ */
  cut(tG2, null, { ...VIEW.gun, d: 720, az: -38, el: 17 }, { gun: 0, aimCore: 1 }); // the gun lowered to the core
  const tN = F("nouveaux", -0.12); //                                         610,7
  shot(tG2, tN - tG2, { ...VIEW.gun, d: 560, az: -62, el: 12 }, ON); // (retouche: 24° round the core)
  fact(tl, { id: "c6-juin", k: "Nouvelle règle", v: "JUIN 2023", s: "ÉTATS-UNIS", tone: "veille", from: A("juin", -0.1), to: A("tire2", -0.6) });
  st(A("tire2") - 0.55 * 1.4, 1.4, { gun: 1 }, "none"); //                    into the core on « tiré » (608,9)
  punch(A("tire2"), 0.06);

  /* ═════════ 610,7 → 618,7 · « Seulement pour les nouveaux moteurs… » · « La règle cite le vol 1549. Quatorze ans après. » ═════════ */
  cut(tN, SET.VOL, { ...VIEW.chase, d: 5800, az: 94, el: 8 }, { ...FLY(3) }, FADE); // an ordinary A320 that flies today
  const tR = F("cite$", 0.27); //                                             618,7 (« reste » alone is the hook's cue, 9,5 s)
  const CH1 = { ...VIEW.chase, d: 5200, az: 78, el: 10 };
  shot(tN, A("cite") - tN, CH1, GO);
  shot(A("cite"), tR - A("cite"), { ...VIEW.wide, d: 6600, az: 28, el: 11 }, STOP); // round to its side: the whole plane
  fact(tl, { id: "c6-14", k: "Quatorze ans", v: "2009 → 2023", from: A("quatorze", -0.1), to: tR + 0.1 });

  /* ═════════ 618,7 → 629,2 · « Le reste ? … Trente-cinq recommandations. Six suivies. » · « La check-list… pas été rendue obligatoire. » ═════════ */
  cut(tR, SET.BENCH, { ...VIEW.qrh, d: 64, az: -34, el: 62 }, { ...AT.bench, era: 3, page: 0, apuMark: 0 }, FADE); // (retouche: the binder ≥ 40 %)
  const tCab = F("gilets", -0.12); //                                         629,2
  const tRj = A("rejet");
  shot(tR, tRj - tR, { ...VIEW.qrh, d: 58, az: -8, el: 56 }, GO);
  shot(tRj, tCab - tRj, { ...VIEW.qrh, d: 62, az: 8, el: 52 }, STOP); //        down onto the page that opens
  st(A("rejet:check", -0.1), 1.5, { page: 1 }, "power2.inOut");
  fact(tl, { id: "c6-35", k: "Associated Press · 2016", v: "35 RECOMMANDATIONS", from: A("reste:trente", -0.15), to: A("reste:six", -0.05) });
  fact(tl, { id: "c6-6", k: "Suivies", v: "6", from: A("reste:six"), to: tRj + 1.6 });

  /* ═════════ 629,2 → 638,9 · « Les gilets de sauvetage… non plus. » · « …la carte de sécurité… » ═════════ */
  const CAB = { ...VIEW.cabin, d: 3200, az: 14, el: 40 };
  cut(tCab, SET.VOL, CAB, { ...FLY(3), lock: 1, fs: 1200, pax: 0 }, FADE); //  the rows from above (lock 1: the cabin level)
  const tSeat = F("toi:vois", -0.12); //                                      633,7 « …que tu vois »
  shot(tCab, tSeat - tCab, { ...VIEW.cabin, d: 2300, az: 24, el: 42 }, "sine.inOut", CAB.d); // down onto the rows
  // raccord: the same row, now from its seat — the pocket where the card waits
  cut(tSeat, null, { ...VIEW.safety, d: 82, az: 70, el: 20, ...SHARP }, { fs: 160, shell: 0.12, safety: 1 }); // (retouche: nothing in front, the card from the cut)
  const tV = onFrame(at("toverdict")); //                                     638,9
  shot(tSeat, tV - tSeat, { ...VIEW.safety, d: 62, az: 80, el: 16, ...SHARP }, "sine.inOut"); // the card ≥ 30 %, a slow push

  /* ═════════ 638,9 → 653,5 · « On a appelé ça un miracle… une liste de pièces. » · card · « …Des ferries à quatre minutes. » ═════════ */
  const LU0 = { ...VIEW.lineup, d: 860, az: -20, el: 23, shift: 70 }; // the four, high in the frame (the title comes under them)
  cut(tV, SET.BENCH, LU0, { ...AT.lineup, era: 3, listK: 0, pool: 0.55 }, FADE); // a stronger halo: dark pieces on light
  const tCard2 = onFrame(cardAt(D, "du")); //                                 643,1
  shot(tV, tCard2 - tV, { ...VIEW.lineup, d: 780, az: -10, el: 21, shift: 70 }, ON);
  retitle(tl, { showAt: A("chute", 0.2), strikeAt: A("chute:miracle", 0.9), swapAt: A("verdict", -0.15), hideAt: tCard2 - 0.27 }); // gone before the card (they share the left)
  D.verdict(A("verdict")); //                                                 the account name lights up, until the loop
  // under the card, a whip to the row's left end; then along the row as each piece lights up
  const LU1 = { ...VIEW.lineup, tx: -300, d: 700, az: -38, el: 14, shift: 0 };
  shot(tCard2, A("liste", -0.1) - tCard2, LU1, "power3.out");
  const tCo = F("equipage", -0.12); //                                        653,5
  shot(A("liste", -0.1), tCo - A("liste", -0.1), { ...VIEW.lineup, tx: 260, d: 780, az: -14, el: 13 }, "sine.inOut");
  st(A("gesteL", -0.05), 0.5, { listK: 1 }, "power2.out");
  st(A("decrocherL", -0.05), 0.5, { listK: 2 }, "power2.out");
  st(A("radeauxL", -0.05), 0.5, { listK: 3 }, "power2.out");
  st(A("ferriesL", -0.05), 0.5, { listK: 4 }, "power2.out");

  /* ═════════ 653,5 → 657,6 · « Et un équipage qui a choisi le fleuve… pendant qu'il était encore temps. » ═════════ */
  cut(tCo, SET.VOL, { ...VIEW.cockpit, d: 240, az: 90, el: 9 }, { ...HIT(3), track: RIVER, lock: 1, fs: 400 }, FADE);
  const tC = onFrame(at("tocta")); //                                         657,6
  shot(tCo, tC - tCo, { ...VIEW.cockpit, d: 190, az: 90, el: 8 }, ON); //      toward the windshield, the river in it

  /* ═════════ 657,6 → 665,7 · « Et toi ? … Dis-moi en commentaire : demi-tour… ou fleuve ? » ═════════ */
  cut(tC, SET.CARTE, { ...VIEW.mapWide, d: 1850, az: -14, el: 55 }, { ...AT.carte, era: 3, clockOn: 0, track: STRIKE, route: -1, glyph: 1, opt: 0, riverLit: 0 }, FADE);
  const tE = F("like", -0.18); //                                             665,7
  shot(tC, tE - tC, { ...VIEW.mapWide, d: 1600, az: 16, el: 50 }, ON); // (retouche: 30° over 8 s)
  now(A("demiTourC", -0.05), { opt: 1 }); //                                  663,6 « demi-tour » : the way back, signal
  st(A("fleuveC", -0.1), 0.6, { riverLit: 0.6 }, "power2.out"); // (0.6: no stronger than the way back — the film does not answer)              664,6 « fleuve » : the river, veille
  fact(tl, { id: "c6-cta", k: "En commentaire", v: "DEMI-TOUR… OU FLEUVE ?", from: A("demiTourC", -0.1), to: tE - 0.05 });
  punch(A("fleuveC"), 0.05);

  /* ═════════ 665,7 → 680,7 · like, rendez-vous, the loop — the plane on the LEFT half, the right half free ═════════ */
  const END0 = { ...VIEW.over860, ty: -300, el: -6, side: 330 }; // (retouche: from below — the right half is dark sky)
  cut(tE, SET.VOL, END0, { ...HIT(3), track: STRIKE, feed: 0 }, FADE); //    15:27:11 over the Bronx: where it all began
  const tAbo = A("abo", -0.2); //                                             672,6 (the breath between like and abo)
  const END1 = { ...VIEW.over860, ty: 250, tz: 4200, d: 10500, az: 160, el: -9, side: 380 };
  shot(tE, tAbo - tE, END1, GO, END0.d); //                                    a slow descent toward the plane
  const tLoop = onFrame(A("toloop")); //                                       676,9 « Parce qu'un jour… »
  const END2 = { ...SHARP, fov: 40, shift: 0, roll: 0, drift: 0.3, tx: -500, ty: 300, tz: 900, d: 7000, az: 120, el: -10, side: 540 }; // the whole plane in the left half
  shot(tAbo, tLoop - tAbo, END2, STOP, END1.d); //                             down to its level, the left engine near
  // the loop: a CLEAN CUT back into the glass engine on fire (POSE0 + FIRST, lock 1), then a slow push onto POSE0
  const LOOP0 = { ...POSE0, d: POSE0.d * 1.12, az: POSE0.az + 3 };
  cut(tLoop, SET.VOL, LOOP0, { ...FIRST });
  D.loop({ at: tLoop, rewindAt: tLoop, fromD: LOOP0.d }); //                 every number is already FIRST; the camera lands on POSE0
}
