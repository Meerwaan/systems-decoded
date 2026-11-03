// c3 · « La check-list faite pour un autre ciel » from « De l'altitude », « Les vingt premières secondes : l'APU »,
// « LaGuardia, Teterboro… » up to « …dans les parages » — HAND.c23 (216,64) → HAND.c34 (328,63). The plan, sentence by
// sentence: docs/L05-actes.md § c3 (and docs/L05-actes-maj.md); journal docs/journal/L05-c3.md.
// Every instant is read off the script (D.at). A cut from place to place gives a COMPLETE state ({ ...AT.x, … }) and
// fades 0.2 s on a frame; a cut inside a place gives what changes. No number is carried by two tweens at once, and no
// cut sets a number that a running tween carries. `track` only jumps on a cut (here it never leaves −1: the plane is
// where the header says); `high` takes ≥ 2.5 s each way; `lock` changes on cuts only.
import { SET, AT, VIEW, HAND, CLOSE, SHARP, seam, onFrame, cardAt } from "./world.js";
import { A320 } from "./plan.js";
import { glide } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const E = A320.engine;
const C = A320.cockpit;
const FADE = { fade: 0.2 };
// chained moves: leave / arrive at the mean speed, so that a move flows into the next without stopping
const GO = glide(0, 1); //   starts from rest, ends at speed
const ON = glide(1, 1); //   at speed on both ends
const STOP = glide(1, 0); // at speed, lands at rest

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const A = (ref, dt = 0) => at(ref) + dt;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const tl = D.tl;

  /* ═════════ 216,64 → 219,6 · « De l'altitude, d'abord : il en a sept fois moins que prévu. » ═════════ */
  // the seam: the plane small over the city, frozen at 15:27:11 (860 m) — the ground close under it
  const t0 = onFrame(A(HAND.c23.at));
  const p0 = seam(D, "c23", "in", { set: SET.VOL, state: { ...AT.hit } });
  const tV = F("vitesse", -0.15); //                                        219,6
  shot(t0, tV - t0, { ...p0, ty: -150, d: 9600, az: 57, el: 43 }, "sine.inOut"); // a slow turn over it: the city, so near
  fact(tl, { id: "c3-alt", k: "Altitude", v: "860 MÈTRES", s: "PRÉVU : 6 000 ET PLUS", from: A("altW", -0.2), to: tV - 0.05 });

  /* ═════════ 219,6 → 234,9 · the check-list on the bench: speed, time, the separate ditching card ═════════ */
  // « De la vitesse, ensuite : … 300 nœuds. L'avion n'en atteindra jamais plus de 214. »
  const Q0 = { ...VIEW.qrh, d: 68, az: -24, el: 56 };
  cut(tV, SET.BENCH, Q0, { ...AT.bench, page: 1, named: 10 }, FADE);
  const tT = A("temps", -0.12); //                                          ≈ 226,1
  const Q1 = { ...VIEW.qrh, d: 58, az: -8, el: 52 };
  shot(tV, tT - tV, Q1, GO); //                                             a slow push on the open binder
  fact(tl, { id: "c3-kt", k: "Pour rallumer", v: "300 NŒUDS", from: A("noeuds", -0.15), to: A("jamaisPlus", -0.1) });
  fact(tl, { id: "c3-kt2", k: "L'avion", v: "214 AU MAXIMUM", tone: "signal", from: A("jamaisPlus"), to: tT - 0.1 });
  // « Et surtout, du temps. Trois pages à lire… quand il te reste trois minutes et demie. » — the pages turn, seen low
  const tO = A("autre", -0.1); //                                           ≈ 230,7
  const Q2 = { ...VIEW.qrh, d: 70, az: 26, el: 30 };
  shot(tT, tO - tT, Q2, ON); //                                             down to the side: the leaves turning over
  st(A("temps", 0.8), 2.5, { page: 3 }, "sine.inOut"); //                   227 → 229,5 (the header says « 3:32 »)
  // « Et la check-list d'amerrissage, celle qui existe à part ? Elle suppose qu'au moins un moteur tourne encore. »
  const tC = F("tourne", -0.2); //                                          234,9
  const Q3 = { ...VIEW.qrh, d: 56, az: 8, el: 58 };
  shot(tO, tC - tO, Q3, STOP); //                                           up over the card as it lands on the binder
  st(A("autre", 0.15), 1.5, { page: 4 }, "power2.inOut"); //                the separate card slides in

  /* ═════════ 234,9 → 246,9 · « …un moteur tourne encore. » · « Il est juste écrit pour un autre ciel. » · the threshold ═════════ */
  cut(tC, SET.VOL, { ...VIEW.chase, d: 5400 }, { ...AT.hit }, FADE); //      from behind: the two slow fans
  const tCiel = A("autreciel"); //                                          236,0
  shot(tC, tCiel - tC, { ...VIEW.chase, d: 5100, az: 86 }, GO);
  // « …écrit pour un autre ciel » : the sky the check-list was written for — the plane lifted over the cloud deck
  const tS = A("seuil"); //                                                 239,27
  const SKY = { ...VIEW.chase, ty: 250, d: 5600, az: 78, el: 28, fov: 38 };
  shot(tCiel, tS - tCiel, SKY, ON);
  st(tCiel + 0.1, 2.6, { high: 1 }, "sine.inOut"); //                       236,1 → 238,7 (« ciel » 238,56)
  // « Alors il va falloir faire autrement. » — back down to 860 m; the camera goes down and forward, to the nose
  st(tS + 0.05, 2.6, { high: 0 }, "sine.inOut"); //                         239,3 → 241,9
  const tIn = F("entre", -0.1); //                                          246,9 « on y entre »
  const NOSE = { ...SHARP, fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3, tx: C.windX + 40, ty: 40, tz: 0, d: 1500, az: 62, el: 14 };
  shot(tS, tIn - tS, NOSE, STOP, SKY.d); //                                 one long move to the cockpit windows

  /* ═════════ 246,9 → 251,9 · the card « Les vingt premières secondes : l'APU » · « 15 h 27 min 19 s. Allumage. » ═════════ */
  const K0 = { ...VIEW.cockpit, ...SHARP, d: 250 }; //                      sharp under the card
  cut(tIn, SET.VOL, K0, { ...AT.hit, lock: 1, fs: 300 }); //                we go on, through the glass, into the cockpit
  const tIg = F("allumage", -0.18); //                                      250,7
  shot(tIn, tIg - tIn, { ...VIEW.cockpit, ...SHARP, d: 212, el: 8 }, "sine.inOut");
  cut(tIg, null, { ...VIEW.core, d: 400 }, { shell: 0.5, fs: 400 }); //    the core, its igniters
  st(A("allumage", 0.02), 0.3, { ign: 1 }, "power2.out");
  const tApu = F("lance", -0.1); //                                         251,9
  shot(tIg, tApu - tIg, { ...VIEW.core, d: 360, az: -16 }, "sine.out");

  /* ═════════ 251,9 → 259,7 · « Deux secondes plus tard, le commandant lance l'APU. » · « …bien plus loin. » ═════════ */
  cut(tApu, null, { ...VIEW.apu, d: 400, az: 60 }, { shell: 1, fs: 500 }); // the tail cone: the APU asleep
  const tQb = F("memoire", 1.86); //                                        256,8 (before « check-list »)
  shot(tApu, tQb - tApu, { ...VIEW.apu, d: 340, az: 44, el: 16 }, "sine.inOut");
  st(A("apuOn"), 2, { apu: 1 }, "power2.inOut"); //                         « l'APU » : it spins up, its generator veille
  punch(A("apuOn"), 0.06);
  st(A("memoire", 0.1), 1.6, { feed: 1 }, "sine.inOut"); //                 its current runs forward
  // « Là-dedans, l'APU ne vient que bien plus loin. » — the binder: the pages run to its line
  cut(tQb, SET.BENCH, { ...VIEW.qrh, d: 66, az: -30, el: 50 }, { ...AT.bench, page: 1 }, FADE);
  const tPr = F("prend", -0.13); //                                         259,7
  shot(tQb, tPr - tQb, { ...VIEW.qrh, d: 58, az: -18, el: 54 }, "sine.inOut");
  st(A("loin", -1.7), 1.6, { page: 3 }, "sine.inOut"); //                   the leaves run to the last part
  st(A("loin"), 0.35, { apuMark: 1 }, "power2.out"); //                      « loin » : the APU's line

  /* ═════════ 259,7 → 265,1 · « 15 h 27 min 23 s. Il prend les commandes. Le copilote, lui, prend la check-list. » ═════════ */
  const KC = { ...VIEW.cockpit, tx: C.floorX - 60, ty: 10, tz: 45, d: 160, az: 52, el: 26, fov: 46 }; // behind the captain's left shoulder: his hand, his sidestick
  cut(tPr, SET.VOL, KC, { ...AT.hit, lock: 1, fs: 300 }, FADE);
  const tH = F("haut", -0.1); //                                            265,1
  shot(tPr, tH - tPr, { ...KC, tz: 30, d: 185, az: 70, el: 24, fov: 48 }, "sine.inOut"); // opening to the first officer, the binder
  st(A("commandes"), 0.6, { pf: 1 }, "power2.inOut"); //                    his hand on his sidestick
  st(A("clPrise", -0.1), 0.6, { qrh: 1 }, "power2.out"); //                 the binder in the first officer's hands

  /* ═════════ 265,1 → 271,2 · « …un peu plus de 900 mètres. À partir de maintenant… il ne fera que descendre. » ═════════ */
  cut(tH, null, { ...VIEW.profile, d: 5400 }, { ...AT.hit }); //            outside, the whole plane (lock 0)
  const tM = F("mayday", -0.16); //                                         271,2
  shot(tH, tM - tH, { ...VIEW.profile, d: 4800, az: -7, el: 3 }, "sine.inOut");
  fact(tl, { id: "c3-top", k: "Point le plus haut", v: "UN PEU PLUS DE 900 MÈTRES", from: A("pointHaut", -0.1), to: A("descendre", -0.6) });
  st(A("descendre", -0.4), 0.9, { pitch: -4 }, "sine.inOut");//            the nose goes under the horizon

  /* ═════════ 271,2 → 281,5 · the maquette: « mayday… ne passe même pas » · « virez à gauche… leur retour » ═════════ */
  // (retouche 02/11) a clean cut, not a fade: profile → maquette, both dark, the fade did not read as a new view
  cut(tM, SET.CARTE, { ...VIEW.mapStrike, d: 740, az: 14 }, { ...AT.carte, route: -1, radio: 0, jam: 0, opt: 0 });
  const tCap = A("cap"); //                                                 276,88
  const tCp = F("cap", -0.1); //                                            276,8
  shot(tM, tCp - tM, { ...VIEW.mapStrike, d: 660, az: 24, el: 36 }, GO);
  st(A("mayday", 0.3), 1.2, { radio: 1 }, "sine.inOut"); //                 the call goes out toward the controller
  st(A("passe"), 0.5, { jam: 1 }, "power2.out"); //                         « ne passe même pas » : the line breaks
  st(tCap, 0.5, { jam: 0 }, "power2.inOut"); //                             « répond tout de suite »
  const tRl = F("relight", -0.1); //                                        281,5
  // « Le contrôleur lui répond » : cut along the radio line, to its other end — LaGuardia's side of the table
  const LC = { ...VIEW.mapLGA, tx: 500, tz: -170, d: 620, az: 52, el: 30 };
  cut(tCp, null, LC);
  shot(tCp, tRl - tCp, { ...LC, d: 560, az: 42, el: 33 }, "sine.inOut");
  now(A("retour"), { opt: 1 }); //                                          « leur retour » : the dotted way back

  /* ═════════ 281,5 → 286,3 · « Le copilote lit : vitesse de rallumage, trois cents nœuds. Et il ajoute : on ne les a pas. » ═════════ */
  const FO = { ...VIEW.cockpit, tx: C.floorX - 60, ty: 10, tz: -45, d: 160, az: 128, el: 26, fov: 46 }; // over the first officer's right shoulder, the binder
  cut(tRl, SET.VOL, FO, { ...AT.hit, lock: 1, pf: 1, qrh: 1, page: 1, fs: 300 }, FADE);
  const tDr = F("derriere", -0.1); //                                       286,3
  shot(tRl, tDr - tRl, { ...FO, d: 146, az: 116, el: 24 }, "sine.inOut");
  fact(tl, { id: "c3-relight", k: "Rallumage", v: "300 NŒUDS", from: A("relight", 0.9), to: A("ajoute", 0.2) });

  /* ═════════ 286,3 → 309,4 · « Une piste. Derrière eux… à LaGuardia. » · midroll 4:51,2 · LGA 13 refused · « Pourquoi refuser ? » ═════════ */
  const L0 = { ...VIEW.mapLGA, d: 960, az: 26 };
  cut(tDr, SET.CARTE, L0, { ...AT.carte, route: -1, radio: 1, opt: 1, optNo: 0 }, FADE);
  const tPub = A("derriere$", 0.3); //                                      ≈ 291,2: the move goes on, slowly, through the break
  const L1 = { ...VIEW.mapLGA, tx: 470, d: 640, az: 40, el: 34 };
  shot(tDr, tPub - tDr, L1, "sine.inOut"); //                               toward LaGuardia, landing at rest on the break
  st(A("laguardia"), 0.6, { airports: 1 }, "power2.out"); //                « LaGuardia » : its runways light
  threadCall(tl, { from: cardAt(D, "lga"), to: cardAt(D, "lga") + 2.6, text: "LaGuardia ? Derrière eux." });
  // (retouche 02/11) the 23 s on the maquette split into five views, each born of the last (LGA → its runway 13 → the
  // glyph at the other end of the dotted line → both in one frame → from the glyph toward Manhattan)
  const t13 = F("treize", -1.7); //                                         ≈ 294,3 (« Le contrôleur propose… »)
  shot(tPub, t13 - tPub, { ...L1, d: 600, az: 44 }, "sine.inOut"); //       a slow drift through the break and the card
  const R13 = { ...VIEW.mapLGA, tx: 560, tz: -60, d: 400, az: 40, el: 26 }; // runway 13, the dotted way back landing on it
  cut(t13, null, R13);
  const tUn = F("unable", -0.12); //                                        ≈ 297,25 « Réponse du commandant »
  shot(t13, tUn - t13, { ...R13, d: 350, az: 32 }, "sine.inOut");
  const GL = { ...VIEW.mapLGA, tx: 270, tz: -530, d: 500, az: 120, el: 30 }; // the other end of the line: the glyph, the Hudson beside it
  cut(tUn, null, GL);
  const tW = F("pourquoi", -0.12); //                                       ≈ 300,87 « L'aéroport est à quelques kilomètres »
  shot(tUn, tW - tUn, { ...GL, d: 440, az: 108, el: 28 }, "sine.inOut");
  st(A("peutPas"), 0.5, { optNo: 1 }, "power2.out"); //                     « on ne peut pas » : struck, signal
  st(A("hudson1", -0.05), 0.5, { riverLit: 0.4 }, "power2.out"); //         « l'Hudson » : the river glints…
  st(A("hudson1", 0.6), 0.9, { riverLit: 0 }, "sine.inOut"); //             …and goes out
  cut(tW, null, { ...VIEW.mapWide, d: 1250, az: -24, el: 46 }); //          the glyph and LaGuardia in one frame
  const tTr = F("virage", -0.12); //                                        ≈ 307,1 « Faire demi-tour »
  shot(tW, tTr - tW, { ...VIEW.mapWide, d: 1600, az: 2, el: 52 }, "sine.inOut"); // pulling back and turning while the question is set
  const EM = { ...VIEW.mapWide, tx: 260, tz: -420, d: 760, az: 0, el: 26 }; // from the glyph, Manhattan between it and LaGuardia
  cut(tTr, null, EM);
  const tMh = F("manhattan", -0.16); //                                     309,4
  shot(tTr, tMh - tTr, { ...EM, d: 680, az: 14, el: 22 }, "sine.inOut");

  /* ═════════ 309,4 → 312,9 · « Faire demi-tour, c'est virer et traverser Manhattan. Et un avion qui vire sans moteurs descend plus vite. » ═════════ */
  cut(tMh, SET.VOL, { ...VIEW.over860 }, { ...AT.hit }, FADE);
  const tG = F("gauche", -0.1); //                                          312,9
  shot(tMh, tG - tMh, { ...VIEW.over860, tz: 4500, d: 12500, el: 9 }, "sine.inOut");
  st(tMh + 0.1, 2.0, { bank: 25 }, "sine.inOut"); //                        it banks: the city under the wing

  /* ═════════ 312,9 → 320,3 · « 15 h 28 min 25 s. Le moteur gauche remonte. Un peu. Pas assez. Ce qu'il a avalé, on le saura plus tard. » ═════════ */
  cut(tG, null, { ...VIEW.engine }, { lock: 1, bank: 0, fs: 600 });
  const tAv = A("avale", -1.0); //                                          ≈ 317,6
  const EN1 = { ...VIEW.engine, d: 640, az: -40, el: 9 };
  shot(tG, tAv - tG, EN1, GO);
  st(A("remonte"), 0.9, { n1L: 42 }, "power2.out"); //                      « remonte. Un peu. »
  st(A("remonte", 1.5), 1.0, { n1L: 35 }, "sine.inOut"); //                 « Pas assez. »
  const tL31 = F("lga31", -0.13); //                                        320,3
  shot(tAv, tL31 - tAv, { ...VIEW.engine, tx: E.x + 220, d: 470, az: -8, el: 14 }, STOP); // round to the cutaway: the goose in the core
  st(A("avale"), 0.8, { shell: 0.4 }, "sine.inOut");

  /* ═════════ 320,3 → 324,8 · « Six secondes plus tard, une autre piste de LaGuardia, la trente et un. Même réponse. » ═════════ */
  const L2 = { ...VIEW.mapLGA, d: 840, az: 22, el: 42 };
  cut(tL31, SET.CARTE, L2, { ...AT.carte, route: -1, radio: 1, opt: 1, optNo: 1, airports: 1 }, FADE);
  const tTc = F("tcas", -0.11); //                                          324,8
  shot(tL31, tTc - tL31, { ...L2, d: 760, az: 32 }, "sine.inOut");
  now(A("trenteEtUn"), { opt: 2, optNo: 0 }); //                             « la trente et un »
  st(A("lga31$", -0.75), 0.4, { optNo: 1 }, "power2.out"); //               « Même réponse. »

  /* ═════════ 324,8 → 328,63 · « Et une autre alarme s'ajoute : trafic. Un hélicoptère dans les parages. » → seam c34 ═════════ */
  const [ha] = HAND.c34.from; //                                            the seam leaves from `ha` at 327,43
  const tOut = onFrame(A(HAND.c34.at)) - HAND.c34.opt.before;
  const H0 = { ...ha, d: 8800, az: 38, el: 23 };
  cut(tTc, SET.VOL, H0, { ...AT.hit }, FADE);
  shot(tTc, tOut - tTc, ha, "sine.inOut"); //                               the camera starts its turn round the plane
  st(A("trafic"), 0.5, { heli: 1 }, "power2.out"); //                       « trafic » : the helicopter, ringed signal
  seam(D, "c34", "out"); //                                                 then turns on toward the plane's right
}
