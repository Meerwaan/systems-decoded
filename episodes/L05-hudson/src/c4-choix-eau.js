// c4 · « LaGuardia, Teterboro… » from « Alors le commandant regarde », « Les 75 dernières secondes », « L'amerrissage »
// up to « …sur ce vol » — HAND.c34 (328,63) → HAND.c45 (440,98). The plan, sentence by sentence: docs/L05-actes.md § c4
// (and docs/L05-actes-maj.md); journal docs/journal/L05-c4.md.
// Every instant is read off the script (D.at). A cut from place to place gives a COMPLETE state ({ ...AT.x, … }) and
// fades 0.2 s on a frame; a cut inside a place gives what changes. No number is carried by two tweens at once, and no
// cut sets a number that a running tween carries. `track` follows the header (−1) until the last seconds before the
// river: from « L'ordinateur » it is held a hair behind the clock so that the plane is still in the air through the
// dip and the card, and touches on « frappe ». `lock` changes on cuts only. The midroll (6:43,8) falls in the dip.
import { SET, AT, VIEW, HAND, CLOSE, SHARP, seam, onFrame, cardAt } from "./world.js";
import { A320 } from "./plan.js";
import { glide } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const C = A320.cockpit;
const BINDER = { tx: C.floorX - 32, ty: C.floorY + 76, tz: -50 }; // the binder on the first officer's lap (systemes.js · A.lap)
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

  /* ═════════ 328,63 → 333,2 · « Alors le commandant regarde de l'autre côté du fleuve. … Teterboro. » ═════════ */
  // the seam: the camera keeps turning round the plane toward its right (west, New Jersey), the helicopter below
  const t0 = onFrame(A(HAND.c34.at));
  const p0 = seam(D, "c34", "in", { set: SET.VOL, state: { ...AT.hit, heli: 1 } });
  const tTe = F("tete", -0.17); //                                           333,2
  shot(t0 + HAND.c34.opt.after, tTe - t0 - HAND.c34.opt.after, { ...p0, az: p0.az + 26, el: p0.el - 2, d: p0.d * 1.06 }, GO); // the seam lands at rest: leave from rest

  /* ═════════ 333,2 → 334,2 · « Teterboro. » — the maquette: the little airport across the river ═════════ */
  const MAP = { ...AT.carte, countOn: 1, route: -1, airports: 1, radio: 0 };
  const T0 = { ...VIEW.mapTEB, d: 1060, az: -14 };
  cut(tTe, SET.CARTE, T0, { ...MAP, opt: 3 }, FADE);
  const tMa = F("masters", -0.13); //                                         334,2
  shot(tTe, tMa - tTe, { ...VIEW.mapTEB, d: 980, az: -20 }, ON); //           still turning, the same way

  /* ═════════ 334,2 → 340,8 · « Pendant ce temps, le copilote déroule la check-list. … couper les moteurs… pour les relancer. » ═════════ */
  const FO = { ...VIEW.cockpit, tx: C.floorX - 60, ty: 10, tz: -42, d: 175, az: 140, el: 30, fov: 46 }; // over the first officer's shoulder, the binder
  cut(tMa, SET.VOL, FO, { ...AT.hit, lock: 1, pf: 1, qrh: 1, page: 1, done: 0, fs: 300 }, FADE);
  st(tMa + 0.3, 4.2, { done: 0.15 }, "sine.inOut"); //                       the marker goes down the first page
  const tCo = F("couper", -0.12); //                                          ≈ 338,8
  shot(tMa, tCo - tMa, { ...FO, d: 150, az: 126, el: 27 }, "sine.inOut");
  // « couper » : the binder itself, the marker on the line that says it (the master switches are 3 cm knobs: unreadable)
  const MS = { ...VIEW.cockpit, ...BINDER, d: 96, az: 150, el: 42, fov: 44 };
  cut(tCo, null, MS, { fs: 150, pilots: 0.05 }); //                           the glass pilots fade: nothing blurred in front of the binder
  st(A("couper", -0.05), 1.3, { done: 0.2 }, "sine.inOut"); //               « couper… pour les relancer »
  const tBr = F("brace", -0.13); //                                           ≈ 340,8
  shot(tCo, tBr - tCo, { ...MS, d: 86, az: 140 }, "sine.inOut");

  /* ═════════ 340,8 → 346,3 · « 15 h 29 min 11 s. Dans la cabine, le commandant annonce : préparez-vous à l'impact. » ═════════ */
  cut(tBr, null, { ...VIEW.cabin, d: 3000, az: 14 }, { lock: 0, pax: 1, cabin: 0.5, fs: 2000, qrh: 0, done: 0, page: 0, pilots: 1 });
  st(A("impactW", -0.15), 0.8, { brace: 1 }, "power2.inOut"); //               « impact » : 150 backs bend forward
  const tT2 = F("teter2", -0.13); //                                          ≈ 346,3
  shot(tBr, tT2 - tBr, { ...VIEW.cabin, d: 2350, az: 30, el: 42 }, "sine.inOut");

  /* ═════════ 346,3 → 356,6 · « Dix secondes plus tard, … Teterboro, piste un. Réponse : on ne peut pas. » · « … on va être dans l'Hudson. » ═════════ */
  cut(tT2, SET.CARTE, { ...VIEW.mapTEB, d: 1040, az: -26, el: 42 }, { ...MAP, radio: 1, opt: 3, optNo: 0 }, FADE);
  const tPi = A("pisteUn", -0.2);
  shot(tT2, tPi - tT2, { ...VIEW.mapTEB, d: 900, az: -18, el: 40 }, GO); //   toward Teterboro's runway
  const tHu = A("hudson", 0.2); //                                            ≈ 351,9
  shot(tPi, tHu - tPi, { ...VIEW.mapTEB, d: 820, az: -10, el: 38 }, ON); //   « piste un »
  st(A("teter2:peut", -0.05), 0.5, { optNo: 1 }, "power2.out"); //           « on ne peut pas » : struck, signal
  const tFl = F("fleuve", -0.16); //                                          ≈ 356,6
  shot(tHu, tFl - tHu, { ...VIEW.mapRiver, d: 960, az: 12, el: 36 }, ON);  // a glide from Teterboro to the river
  now(A("hudsonW", -0.35), { opt: 4 }); //                                   « dans l'Hudson » : the river is the option
  st(A("hudsonW", -0.3), 0.85, { riverLit: 1 }, "sine.out"); //               lit along its length (over before the cut)
  punch(A("hudsonW"), 0.05, { up: 0.08, hold: 0.12, down: 0.4 }); //          ends 0,05 s before the cut

  /* ═════════ 356,6 → 362,4 · « Un fleuve en plein mois de janvier. Une eau à cinq degrés. Et une coque qui va devoir tenir. » ═════════ */
  const W0 = { ...VIEW.toWater, d: 9600, az: -118 };
  cut(tFl, SET.VOL, W0, { ...AT.hit, cold: 1 }, FADE);
  const tCq = F("coqueW", -0.14); //                                          ≈ 360,4
  shot(tFl, tCq - tFl, { ...VIEW.toWater, d: 8400, az: -106 }, "sine.inOut");
  fact(tl, { id: "c4-eau", k: "Eau", v: "5 DEGRÉS", from: A("fleuve:eau", -0.15), to: tCq - 0.06 });
  // « coque » : the aft belly, the hull that will take the blow
  const B0 = { ...VIEW.belly, d: 1900, az: 26 };
  cut(tCq, null, B0, { fs: 1400 });
  const tAv = F("avant2", -0.13); //                                          ≈ 362,4
  shot(tCq, tAv - tCq, { ...VIEW.belly, tx: 760, d: 1800, az: 14 }, GO); //  sliding forward along it…

  /* ═════════ 362,4 → 367,6 · « À l'avant, les radeaux que personne n'exigeait attendent toujours. Serviront-ils… ou pas ? » ═════════ */
  const DR = { ...VIEW.doors, d: 820, az: -14 };
  cut(tAv, null, DR, { lock: 1, fs: 600 }); //                                …to the front door
  st(A("radeauxA", -0.1), 0.7, { packs: 1 }, "power2.out"); //               « les radeaux » : the folded packs, veille
  const tCard1 = onFrame(cardAt(D, "descente")); //                           367,6
  shot(tAv, A("ouPas") - tAv, { ...VIEW.doors, d: 760, az: -22 }, "sine.inOut");
  shot(A("ouPas"), tCard1 - A("ouPas"), { ...VIEW.doors, d: 900, az: -26, el: 9 }, GO); // « ou pas ? » : a slow pull-back

  /* ═════════ 367,6 → 371,3 · card « Les 75 dernières secondes » — « 1 min 15. C'est ce qui reste. » ═════════ */
  const CH = { ...VIEW.chase, d: 5600, az: 96, el: 10 };
  cut(tCard1, null, CH, { lock: 0, packs: 0, fs: 2000, cold: 0.6 });
  const tPg = F("page", -0.11); //                                            ≈ 371,3
  shot(tCard1, tPg - tCard1, { ...VIEW.chase, d: 4900, az: 80, el: 8 }, "sine.inOut"); // along the plane, above the river

  /* ═════════ 371,3 → 376,3 · « La check-list en est toujours à sa première partie. La page de l'eau… ne sera jamais atteinte. » ═════════ */
  const QB = { ...VIEW.cockpit, ...BINDER, d: 88, az: 118, el: 50, fov: 44 }; // the binder in the first officer's hands
  cut(tPg, null, QB, { lock: 1, qrh: 1, page: 1, done: 0.25, fs: 300, pilots: 0.05 }); // the glass pilots fade (camera in the first officer's head)
  now(A("page:eau", -0.1), { named: 12 }); //                                 « la page de l'eau » : the third part's tab
  now(A("jamaisW", 0.1), { named: 0 }); //                                    « jamais » : out
  const tVo = F("volets", -0.14); //                                          ≈ 376,3
  shot(tPg, tVo - tPg, { ...QB, d: 80, az: 108, el: 52 }, "sine.inOut");

  /* ═════════ 376,3 → 380,3 · « 15 h 29 min 44 s. Pas de rallumage. Le commandant demande les volets. » ═════════ */
  // over the two pilots' shoulders: the river ahead through the windshield, nothing restarts
  cut(tVo, null, { ...VIEW.cockpit, d: 240, az: 96, el: 11 }, { qrh: 0, done: 0, page: 0, fs: 300, pilots: 1 });
  const tWg = F("voletsW", -0.2); //                                          ≈ 380,2
  shot(tVo, tWg - tVo, { ...VIEW.cockpit, d: 205, az: 86, el: 9 }, "sine.inOut");

  /* ═════════ 380,2 → 384,6 · « volets » — « Les volets sortent. L'avion ralentit. Il plonge vers le fleuve. » ═════════ */
  cut(tWg, null, { ...VIEW.wing, d: 2600, az: 44, el: 24 }, { lock: 0, fs: 2000 });
  st(tWg + 0.15, 2.0, { flaps: 1 }, "power2.inOut"); //                       the flaps run out
  const tGl = A("glisse", 0.6); //                                            ≈ 381,6
  shot(tWg, tGl - tWg, { ...VIEW.wing, d: 2750, az: 38, el: 22 }, GO);
  const tAl = F("alarme", -0.1); //                                           ≈ 384,6
  shot(tGl, tAl - tGl, { ...VIEW.profile, tx: -200, d: 4800, az: 10, el: 4 }, ON); // round to its side: it dives
  st(A("plonge", -0.1), 1.0, { pitch: -4 }, "sine.inOut"); //                 « il plonge » : the nose drops, the river comes up

  /* ═════════ 384,6 → 390,7 · « 15 h 30 min 24 s. Une alarme retentit dans le cockpit : terrain, remontez. Elle ne s'arrêtera plus. » ═════════ */
  const GS = { ...VIEW.cockpit, tx: C.windX + 30, ty: 40, tz: 0, d: 170, az: 104, el: 16, fov: 52 }; // the glareshield and the screens
  cut(tAl, null, GS, { lock: 1, fs: 300 });
  st(A("terrain", -0.05), 0.3, { alarm: 1, ecam: 1 }, "power2.out"); //      « terrain » : the glareshield pulses, slowly
  const tTr = F("trente", -0.1); //                                           ≈ 390,7
  shot(tAl, tTr - tAl, { ...GS, d: 140, az: 96, el: 13 }, "sine.inOut");

  /* ═════════ 390,7 → 393,5 · « Trente mètres. 15 h 30 min 36 s. » ═════════ */
  const LW = { ...VIEW.toWater, ty: -150, d: 5200, az: -116, el: -2 };
  cut(tTr, null, LW, { lock: 0, pitch: 0, fs: 2000 });
  const tTi = F("tire", -0.1); //                                             ≈ 393,5
  shot(tTr, tTi - tTr, { ...LW, d: 4600, az: -108 }, "sine.inOut");

  /* ═════════ 393,5 → 395,4 · « Il tire sur le manche. Doucement. » ═════════ */
  cut(tTi, null, { ...VIEW.stick, d: 128, az: -36 }, { lock: 1, fs: 150 });
  st(A("tireW", -0.05), 0.5, { stick: 0.4 }, "sine.inOut"); //               « Doucement »
  const tQz = F("quinzem", -0.1); //                                          ≈ 395,4
  shot(tTi, tQz - tTi, { ...VIEW.stick, d: 116, az: -28 }, "sine.inOut");

  /* ═════════ 395,4 → 397,4 · « Quinze mètres. Il tire plus fort. » ═════════ */
  const PL = { ...VIEW.profile, ty: -60, d: 4600, az: -6, el: 1 };
  cut(tQz, null, PL, { lock: 0, fs: 2000 });
  st(A("fort", -0.05), 0.3, { stick: 0.8 }, "power2.out"); //                 (the stick, off screen: the next shot finds it there)
  st(A("fort", -0.05), 1.1, { pitch: 2 }, "sine.inOut"); //                   the nose comes up a little
  const tBu = F("butee", -0.08); //                                           ≈ 397,4
  shot(tQz, tBu - tQz, { ...PL, d: 4300, az: -2 }, "sine.inOut");

  /* ═════════ 397,4 → 398,9 · « Le manche est en butée. » ═════════ */
  cut(tBu, null, { ...VIEW.stick, d: 112, az: -22, el: 24 }, { lock: 1, fs: 150 });
  st(A("buteeW", -0.05), 0.3, { stick: 1 }, "power2.out"); //                 against its stop
  const tOr = F("butee:ordinateur", -0.12); //                                ≈ 398,9
  shot(tBu, tOr - tBu, { ...VIEW.stick, d: 104, az: -18, el: 25 }, "sine.inOut");

  /* ═════════ 398,9 → 403,1 · « L'ordinateur, lui, retient encore un peu le nez. » · « 15 h 30 min 43 s. » ═════════ */
  // the limit of « loi normale » beside the nose: the needle climbs to it on « nez » — and the plane, held a hair behind
  // the header's clock, comes down to its reflection (it is still in the air at the dip)
  const tWa = F("water"); //                                                  403,1
  const LS = { ...VIEW.limitSide, ty: 40, d: 4400 };
  cut(tOr, null, LS, { lock: 0, track: 1840.2, limit: 1, aoa: 0, fs: 2000 });
  st(tOr + 0.05, A("nez") - tOr - 0.05, { aoa: 1 }, "sine.inOut"); //          the needle reaches the limit on « nez »
  punch(A("nez"), 0.05, { up: 0.08, hold: 0.15, down: 0.45 });
  st(tOr, tWa - tOr, { track: 1842.4 }, "none"); //                            down to the water's skin
  const tCt = A("contact", 0.3); //                                           ≈ 401,3
  shot(tOr, tCt - tOr, { ...VIEW.limitSide, ty: 0, d: 4700, az: 2, el: 1.5 }, GO);
  shot(tCt, tWa - tCt, { ...VIEW.profile, ty: -60, d: 5000, az: 4, el: 1 }, ON); // level with the water: the plane and its reflection
  st(A("contact", 0.4), 0.6, { limit: 0 }, "sine.inOut"); //                   the arc goes (aoa stays at the limit)

  /* ═════════ 403,1 → 409,9 · « Et l'eau… » — dip, midroll 6:43,8 — card « 15 h 30 min 43 s : l'amerrissage » · « 230 km/h. L'avion frappe le fleuve… et il flotte. » ═════════ */
  const SP = { ...VIEW.splash, tx: 0, ty: 400, d: 5600, az: -28 }; //       the whole plane, hanging over its reflection, centred under the card
  cut(tWa, null, SP, { alarm: 0, ecam: 0, aoa: 0, pitch: 0, stick: 0, cold: 0.6 }, { fade: 0.7, kind: "dip" });
  now(A("eau$", 0.06), { countOn: 0 }); //                                    the countdown has said 0:00
  const tCard2 = cardAt(D, "toucher"); //                                     404,4
  threadCall(tl, { from: tCard2, to: tCard2 + 2.6, text: "L'eau ? À cinq degrés." });
  const tFr = A("frappe"); //                                                 407,6
  shot(tWa, tFr - tWa, { ...VIEW.splash, tx: 400, ty: 200, d: 4500, az: -25 }, "sine.inOut"); // a slow push through the break and the card: the plane hangs above the river
  fact(tl, { id: "c4-vitesse", k: "Vitesse", v: "230 KM/H", from: tCard2 + 2.55, to: A("float", 0.9) });
  st(tFr - 0.55, 0.55, { track: 1843 }, "power1.in"); //                      it comes down…
  st(tFr - 0.04, 2.8, { spray: 1 }, "none"); //                                …the sheets of water rise and fall
  st(tFr - 0.02, 0.45, { damage: 1 }, "power2.out"); //                        the aft belly takes the blow
  punch(tFr + 0.02, 0.06);
  const tCe = F("pression:certification", -0.15); //                         ≈ 411,4
  st(A("float", -0.05), tCe - A("float") - 0.05, { track: 1860 }, "power2.out"); // « et il flotte » : it slides, slows, rests
  shot(tFr, tCe - tFr, { ...VIEW.splash, tx: 300, ty: 150, d: 4900, az: -34, el: 5 }, "sine.inOut");

  /* ═════════ 411,4 → 418,8 · « La certification supposait un avion qui touche l'eau presque à plat… Lui descend de presque quatre mètres par seconde. » ═════════ */
  cut(tCe, SET.CARTE, { ...VIEW.basin, d: 235, az: -32 }, { ...AT.basin, clockOn: 1, dropK: 0, dropFast: 0 }, FADE);
  const tPl = A("aPlat"); //                                                  414,4: the soft touch (dropK 0.6)
  st(tPl - 1.5, 2.5, { dropK: 1 }, "none");
  const tQ = A("quatreMS"); //                                                417,3: the steep one (dropFast 0.55)
  st(tQ - 1.2, 2.2, { dropFast: 1 }, "none");
  const tCo2 = F("coque", -0.14); //                                          ≈ 418,8
  shot(tCe, tCo2 - tCe, { ...VIEW.basin, d: 210, az: -22, el: 12 }, "sine.inOut");

  /* ═════════ 418,8 → 425,3 · « Et la pression sur la coque, au choc, dépasse quatre fois celle de la certification. Pourtant… elle ne se disloque pas. » ═════════ */
  const FLOAT = { ...AT.water, track: 1860, damage: 1, lock: 0 };
  const BF = { ...VIEW.belly, tx: 1000, ty: -60, d: 2600, az: 36, el: 20 }; // the aft hull afloat from above, through the glass
  cut(tCo2, SET.VOL, BF, { ...FLOAT, fs: 1400 }, FADE);
  const tDi = A("disloque", -0.3);
  shot(tCo2, tDi - tCo2, { ...BF, d: 2300, az: 30, el: 19 }, GO); //            in on the dented hull…
  const tAi = F("aile", -0.12); //                                            ≈ 425,3
  shot(tDi, tAi - tDi, { ...BF, tx: 800, d: 2750, az: 28, el: 22 }, STOP); //            …« elle ne se disloque pas » : it holds

  /* ═════════ 425,3 → 431,2 · « Quinze secondes après, les issues au-dessus de l'aile gauche s'ouvrent. Les premiers passagers sortent… debout sur l'aile. » ═════════ */
  cut(tAi, null, { ...VIEW.wing, d: 3000, az: 46, el: 27 }, { fs: 2000 });
  st(A("issues", -0.05), 0.8, { wingExits: 1 }, "power2.inOut");
  st(A("issues", 0.9), 2.7, { evac: 0.3 }, "none"); //                        the first ones out, standing on the left wing
  const tCu = F("courant3", -0.12); //                                        ≈ 431,2
  shot(tAi, tCu - tAi, { ...VIEW.wing, d: 2650, az: 38, el: 25 }, "sine.inOut");

  /* ═════════ 431,2 → 434,5 · « Le fleuve, lui, emporte doucement l'avion vers le sud. » ═════════ */
  cut(tCu, null, { ...VIEW.ferries, d: 5000, az: -36, el: 14 }, { track: 1922 }); // low over the water: the plane ≈ 55 % of the frame, the city behind
  st(tCu + 0.05, 3.1, { track: 1930 }, "sine.inOut"); //                       a slow drift south (≈ 5 m/s on screen)
  st(tCu + 0.1, 1.5, { flow: 1 }, "sine.out"); //                              the current drawn on the water (back to 0,5 on the next cut)
  const tRa = F("radeaux", -0.12); //                                         ≈ 434,5
  shot(tCu, tRa - tCu, { ...VIEW.ferries, d: 4500, az: -28, el: 13 }, "sine.inOut");

  /* ═════════ 434,5 → 440,98 · « À l'avant, les portes s'ouvrent. Les toboggans se gonflent… et deviennent des radeaux. Ceux que personne n'exigeait sur ce vol. » ═════════ */
  const [ha] = HAND.c45.from; //                                              the seam leaves from `ha` at 439,98
  const tOut = onFrame(A(HAND.c45.at)) - HAND.c45.opt.before;
  cut(tRa, null, { ...ha, d: 1150, az: -18, el: 8 }, { fs: 900, flow: 0.5 });
  st(A("radeaux", 0.15), 1.0, { doors: 1 }, "power2.inOut"); //                « les portes s'ouvrent »
  st(A("gonflent", -0.1), 1.4, { rafts: 1 }, "power2.out"); //                 « se gonflent… et deviennent des radeaux »
  st(A("rafts", 0.35), tOut + 0.85 - A("rafts", 0.35), { evac: 0.7 }, "none"); // people step into them
  shot(tRa, tOut - tRa, ha, "sine.inOut"); //                                  a slow pull-back to the seam's start
  seam(D, "c45", "out"); //                                                    then on, faster, to the whole plane afloat
}

