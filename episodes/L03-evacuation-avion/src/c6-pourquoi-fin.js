// c6 · « Pourquoi pas 90 secondes ? », « Ton sac, tu le prends ? », la boucle — HAND.c56 (435,05) → la fin (534,27).
// docs/L03-actes.md, c6 ; journal docs/journal/L03-c6.md. Every instant is read off the voice (D.at / D.times): no
// second is written by hand. The chapter starts on its half of the seam c56 (the burning A350, the pull-back into the
// night goes on), answers « la règle a-t-elle échoué ? » (the rule judges the plane, not the accident), lands the chute
// on the 379 on the grass, then the bag: Dubai, Denver, the 2025 note, « une seconde de trop », the comment in two
// camps (the film never answers), the like with the RIGHT HALF FREE, the rendez-vous on the closed pack, and the loop:
// Haneda at night, door 1L shut — « le jour où… » it swings out and the pack drops: the last frame IS the first one.
import { fact } from "@kit/long.js";
import { threadCall, retitle } from "@kit/blocks.js";
import { SET, AT, VIEW, HAND, POSE0, CLOSE, SHARP, seam, onFrame, cardAt, benchLight } from "./world.js";
import { ITEM, PLANES } from "./plan.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const D1 = PLANES.a350.doors.find((d) => d[0] === "1")[1];

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const t = D.times({
    non: "p1", la: "p1:la", chrono: "p1:chronomètre", elle: "p1:elle",
    avec: "p2", moitie: "p2:moitié", pretes: "p2:prêtes", volont: "p2:volontaires",
    un: "p2b", souvrent: "p2b:s'ouvrent", fumee: "p2b:fumée",
    ce: "p3", trois: "p3:trois", plus: "p3:plus", fumee3: "p3:fumée", mais: "p3:mais", et: "p3:et#2",
    manch: "p4", perce: "p4:percé", ce4: "p4:ce", entre: "p4:entré", dernier: "p4:dernier",
    chute: "chute", ne: "chute:ne", brule1: "chute:brûler", brule2: "chute:brûler#2", apres: "verdict",
    toverdict: "toverdict",
    sac: "du", dubai: "du:dubaï", et5: "du:et#2", avecb: "du:avec",
    trois6: "dubai:trois", survivent: "dubai:survivent", mais6: "dubai:mais",
    denver: "denver", valises: "denver:valises",
    safo: "safo", ecrit: "safo:l'écrit", lente: "safo:lente", blesses: "safo:blessés", vies: "safo:vies",
    derriere: "derriere", derriere2: "derriere:derrière",
    alors: "conseil", equipage: "conseil:l'équipage", et7: "conseil:et", laisses: "conseil:laisses",
    tocta: "tocta", laisses8: "comment:laisses", prends: "comment:prends",
    like: "like", abo: "abo", ouvrir: "abo:ouvrir", veille: "abo:veille",
    toloop: "toloop", le: "boucle:le",
  });

  /* ── 435,05 → 436,27 · « Non. » — the seam: the burning A350, the slow pull-back into the night goes on ── */
  const tSeam = onFrame(at(HAND.c56.at));
  seam(D, "c56", "in", { set: SET.PISTE, state: { ...AT.haneda, fire: 1, doorA: 1, doorB: 1, shut: 1, evac: 1, pax: 0, breach: 1, spin: 1 } });
  now(tSeam, { step: 2, chrono: 0, chronoOn: 0 });
  threadCall(D.tl, { from: tSeam + 0.2, to: tSeam + 2.5, text: "La règle a-t-elle échoué ?" });

  /* ── 436,27 → 438,6 · « La règle ne chronomètre pas les accidents : … » — the 1967 sheet on the bench ── */
  // under the card (it covers the left half): the sheet sits right, and drifts to the centre as the card leaves
  const tDoc = onFrame(tSeam + HAND.c56.opt.after);
  const DOC0 = { ...VIEW.doc, ...SHARP, side: -300, d: 178, az: -16, el: 50 };
  const DOC1 = { ...VIEW.doc, ...SHARP, side: -40, d: 150, az: -6, el: 56 };
  cut(tDoc, SET.BENCH, DOC0, { ...AT.bench, ...benchLight(ITEM.DOC), doc: 2, docIn: 0, hl: 0 }, { fade: 0.2 });
  st(tDoc + 0.05, 0.8, { docIn: 1 }, "power2.out");
  st(t.chrono, 0.4, { hl: 0.06 }, "power1.inOut"); //                          « chronomètre »: « 90 SECONDES » underlined
  const tHang = onFrame(t.elle - 0.13);
  shot(tDoc, tHang - tDoc, DOC1, "sine.inOut");

  /* ── 438,6 → 448,07 · « …elle juge l'avion avant qu'il ait le droit de voler. Avec la moitié des portes prêtes dès la
     première seconde. Des volontaires en bonne santé. Et ni feu, ni fumée. » — the hangar, one long pull-back ── */
  // raccord on the form: the sheet seen from above → the flank of the clean A350, lit; then the trial, in the dark
  // close on the forward flank (the fuselage ≈ 40 % of the height, doors 1L and 2L), then the pull-back from « prêtes »
  const SIDE = { ...P, ...SHARP, tx: -2050, ty: 520, tz: 300, d: 2450, az: -18, el: 3 };
  const SIDE2 = { ...SIDE, tx: -1750, d: 2350, az: -20 };
  const WIDE = { ...VIEW.hangarWide, ...SHARP, d: 10500, az: -40, el: 17 };
  const tHan = onFrame(t.un - 0.13);
  const tBack = t.pretes - 0.3;
  cut(tHang, SET.PISTE, SIDE, { ...AT.hangar, lights: 1, doorA: 0, shut: 0, fx: -2000, fy: 500, fz: 300, fs: 1800 }, { fade: 0.2 });
  shot(tHang, tBack - tHang, SIDE2, "sine.inOut"); //                              a slow travelling along the doors
  shot(tBack, tHan - tBack, WIDE, "sine.inOut", SIDE2.d); //                       by ratio: × 3,7, and it rises
  st(t.avec - 0.05, 0.5, { lights: 0 }, "power2.inOut"); //                       the trial: in the dark
  st(t.moitie, 0.5, { shut: 1 }, "power2.out"); //                                « moitié »: the right doors condemned
  st(t.pretes - 0.05, 1.0, { doorA: 1 }, "power2.out"); //                       « prêtes dès la première seconde »: the four, together
  st(t.volont, tHan - 0.1 - t.volont, { evac: 0.11 }, "none"); //                « volontaires »: the first ones slide

  /* ── 448,07 → 454,07 · « Un vrai accident dure plus longtemps : des portes ne s'ouvrent pas, la fumée gêne. Ça ne rend
     pas la règle fausse. » — Haneda, the same frame: the same plane, now burning ── */
  cut(tHan, SET.PISTE, WIDE, { ...AT.haneda, fire: 1, spin: 1, doorA: 1, doorB: 0, shut: 0, evac: 0.08, smoke: 0.3 });
  const tTrois = onFrame(t.ce - 0.13);
  shot(tHan, tTrois - tHan, { ...WIDE, d: 7350, az: -68, el: 11 }, "sine.inOut", WIDE.d); // an orbit that closes in (28°, × 0,7)
  st(t.souvrent - 0.05, 0.5, { shut: 1 }, "power2.out"); //                       « ne s'ouvrent pas »: five doors turn signal
  st(t.fumee - 0.05, 1.1, { smoke: 1 }, "sine.inOut"); //                          « la fumée gêne »: the cabin darkens from the top
  const tSpk = onFrame(t.plus - 0.13);
  st(tHan + 0.05, tSpk - 0.1 - (tHan + 0.05), { evac: 0.2 }, "none"); //           they keep sliding, slowly (it only grows)

  /* ── 454,07 → 456,97 · « Ce soir-là, rien de tout ça : trois portes sur huit… » — closer on the left flank ── */
  shot(tTrois, tSpk - tTrois, { ...SHARP, ...P, tx: -600, ty: 420, tz: 0, d: 6600, az: -62, el: 8, side: -60 }, "sine.inOut");
  st(t.trois - 0.04, 0.85, { doorB: 1 }, "power2.out"); //                        « trois portes »: 4L bursts out, the third slide
  now(t.trois + 0.25, { mark: 7 }); //                                            a ring around 4L

  /* ── 456,97 → 459,05 · « …plus de haut-parleurs, et la fumée. » — inside: the PA grille, dead; the smoke swallows it ── */
  // raccord on the object: the same grille as at 3,6 s (it died there; here it is already cold)
  const tLow = onFrame(t.mais - 0.13);
  // seen from the left aisle, low, the cabin already empty (no glass head near the lens): the ceiling running to the door, the
  // dead grille above, the exit signs; the rows soft below. (c1 at 3,5 s holds the grille close: here the room around it)
  const SPK = { ...P, ...CLOSE, tx: 839, ty: 230, tz: 123, d: 490, az: 90, el: -25, fov: 34 };
  cut(tSpk, SET.CABINE, SPK, { ...AT.tokyo, pax: 0, smoke: 0.3, fire: 0.7, floor: 1, pa: 0, signs: 1, fx: 839, fy: 220, fz: 123, fs: 500 }, { fade: 0.2 });
  shot(tSpk, tLow - tSpk, { ...SPK, d: 468, az: 88 }, "sine.inOut");
  st(t.fumee3 - 0.08, 0.6, { smoke: 0.62 }, "sine.inOut"); //                      « la fumée »: the edge rolls over the grille

  /* ── 459,05 → 460,8 · « Mais il y avait tout ce qu'on vient de voir… » — down to the floor: the line under the smoke ── */
  const tDoor = onFrame(t.et - 0.1);
  const LOW = { ...VIEW.aisleLow, d: 275 };
  cut(tLow, SET.CABINE, LOW, { ...AT.tokyo, floor: 1, smoke: 1.3, pax: 1, emerg: 1, fire: 0.7, fx: 300, fy: 10, fz: 140, fs: 400 });
  shot(tLow, tDoor - tLow, { ...LOW, d: 240 }, "sine.inOut"); //                  a push of 35 cm along the aisle (< 20 cm/s)

  /* ── 460,8 → 463,67 · « …et un équipage qui a gardé fermées les portes côté feu. » — the door 1L shut, a hand on it ── */
  // a reconstruction: 1L plays the door on the fire's side; the fire's glow at its window; the crew's hand on the lever
  const tMan = onFrame(t.manch - 0.15);
  const DIN = { ...VIEW.doorIn, d: 430, az: 154 };
  cut(tDoor, SET.CABINE, DIN, { ...AT.tokyo, door: 0, crew: 1, arm: 0.5, fire: 1, smoke: 0.6, floor: 1, emerg: 1, signs: 0.5, fx: 0, fy: 100, fz: 250, fs: 260 });
  shot(tDoor, tMan - tDoor, { ...VIEW.doorIn, d: 370, az: 148 }, "sine.inOut");

  /* ── 463,67 → 467,33 · « À Manchester, le feu avait percé la cabine en moins d'une minute. » — the 737 ── */
  const tH2 = onFrame(t.ce4 - 0.12);
  const B7 = { ...VIEW.b737Wide, ...SHARP };
  cut(tMan, SET.PISTE, B7, { ...AT.manchester, fire: 0.8, breach: 0 }, { fade: 0.2 });
  shot(tMan, tH2 - tMan, { ...B7, d: 4900, az: -36, el: 7 }, "sine.inOut");
  st(t.perce - 0.05, 1.0, { breach: 1 }, "power2.out"); //                        « percé »: the fire runs along the cabin

  /* ── 467,33 → 470,17 · « Ce soir-là, il n'est entré qu'après le dernier passager. » — Haneda, the same place on screen ── */
  // raccord on the object: one plane, then the other, at the same place of the picture (the A350 is twice as long)
  const tVer = onFrame(t.toverdict);
  const A3 = { ...P, ...SHARP, tx: -800, ty: 420, tz: 0, d: 5800, az: -32, el: 5 }; // the field (GATHER) stays off the right edge
  cut(tH2, SET.PISTE, A3, { ...AT.haneda, fire: 1, spin: 1, doorA: 1, doorB: 1, shut: 1, evac: 0.95, pax: 0, smoke: 1, breach: 0 }, { fade: 0.2 });
  shot(tH2, tVer - tH2, { ...A3, d: 5400, az: -35 }, "sine.inOut");
  st(tH2 + 0.05, 1.4, { evac: 1 }, "sine.out"); //                                the last ones leave the slides
  st(t.entre - 0.05, 1.3, { breach: 1 }, "power2.out"); //                       « entré qu'après »: then the fire comes in
  punch(t.dernier, 0.05);

  /* ── 470,17 → 474,99 · LA CHUTE « Un avion n'est pas fait pour ne jamais brûler. Il est fait pour brûler… après toi. »
     — the 379 on the grass, veille, the A350 burning behind; a slow rise. The account name lights up on « après ». ── */
  const cardSac = cardAt(D, "du"); //                                            474,99
  const GA = { ...VIEW.gather, ...SHARP, ty: 250, d: 7800, az: -18, el: 9 }; // the plane small and burning above the field
  cut(tVer, SET.PISTE, GA, { ...AT.haneda, fire: 1, spin: 1, doorA: 1, doorB: 1, shut: 1, evac: 1, pax: 0, smoke: 1, breach: 1, fx: -1500, fy: 200, fz: 3000, fs: 5000 });
  const tBag = onFrame(t.sac - 0.06); //                                        after the title has left (475,83)
  shot(tVer, tBag - tVer, { ...GA, d: 7300, el: 13, az: -20 }, "sine.inOut");
  const $ = (id) => document.getElementById(id);
  $("retitle-k").textContent = "Ce qui te sauve";
  $("retitle-a").firstChild.nodeValue = "Ne jamais brûler";
  $("retitle-b").textContent = "Brûler après toi";
  // the card « Ton sac » comes at 474,99 on the left: the title sits on the right, and stays 2 s
  Object.assign($("retitle").style, { left: "1040px", right: "auto" });
  retitle(D.tl, { showAt: t.ne - 0.1, strikeAt: t.brule1 + 0.3, swapAt: t.apres - 0.38, hideAt: tBag - 0.24 });
  D.verdict(t.apres);
  now(cardSac, { step: 0 });

  /* ── 474,99 → 477,35 · « Et ton sac du début ? » — under the card: your bag, full, hanging from your hand (the hook) ── */
  const tDub = onFrame(t.dubai - 0.12);
  const BAG = { ...VIEW.thumbBag, side: -260, d: 250 };
  cut(tBag, SET.CABINE, BAG, { ...AT.tokyo, you: 2, bag: 1, smoke: 0.9, floor: 1, fire: 0.6, fx: 742, fy: 60, fz: 110, fs: 250 }, { fade: 0.2 });
  shot(tBag, tDub - tBag, { ...VIEW.thumbBag, side: -150, d: 218 }, "sine.inOut"); // one gentle push under the card

  /* ── 477,35 → 483,1 · « À Dubaï, en 2016, un avion… rate son atterrissage. L'équipage dit de tout laisser… » — a slide in
     profile at night, never the whole plane; they come down with nothing ── */
  const apron = (x) => ({ ...AT.apron, bridge: 0, doorA: 1, fx: D1, fy: 200, fz: 900, fs: 1200, ...x });
  const PROF = { ...P, ...SHARP, tx: D1 + 200, ty: 230, tz: 850, d: 1900, az: 32, el: 3, fov: 30, side: 120 };
  const tFoot = onFrame(t.et5 - 0.15);
  cut(tDub, SET.PISTE, PROF, apron({ evac: 0.1 }), { fade: 0.2 });
  shot(tDub, tFoot - tDub, { ...PROF, d: 1700, az: 26 }, "sine.inOut");
  st(tDub + 0.05, tFoot - 0.1 - (tDub + 0.05), { evac: 0.2 }, "none");
  fact(D.tl, { id: "c6-dubai", k: "Dubaï", v: "2016", from: t.dubai, to: t.dubai + 2.4 });

  /* ── 483,1 → 488,4 · « …et plusieurs passagers sortent quand même avec leurs bagages. Les trois cents personnes à bord
     survivent. » — the foot of the slide: the bags come, signal ── */
  const tBins = onFrame(t.mais6 - 0.13);
  const FOOT = { ...P, ...CLOSE, tx: -2500, ty: 280, tz: 750, d: 1150, az: 28, el: 6 }; // the slope, not the crowd at its foot
  cut(tFoot, SET.PISTE, FOOT, apron({ evac: 0.2 }));
  shot(tFoot, tBins - tFoot, { ...FOOT, d: 1060, az: 24 }, "sine.inOut");
  st(tFoot + 0.05, tBins - 0.1 - (tFoot + 0.05), { evac: 0.3 }, "none");
  st(t.avecb - 0.05, 1.0, { bags: 0.6 }, "power1.out"); //                       « avec leurs bagages »
  fact(D.tl, { id: "c6-bord", k: "À bord", v: "300", s: "tous survivent", tone: "veille", from: t.trois6, to: tBins - 0.02 });

  /* ── 488,4 → 491,0 · « Mais plusieurs ont pris le temps de récupérer leurs bagages. » — the bins open, a short shot ── */
  const tDen = onFrame(t.denver - 0.1);
  const BINS = { ...VIEW.bins, ...SHARP, tx: 760, ty: 120, tz: 123, d: 560, az: 96, el: 2, fov: 32 };
  cut(tBins, SET.CABINE, BINS, { ...AT.tokyo, pax: 0.5, crowd: 0.15, you: 2, bag: 0.6, smoke: 0.4, floor: 1, fire: 0.5, fx: 760, fy: 150, fz: 123, fs: 400 }, { fade: 0.2 });
  shot(tBins, tDen - tBins, { ...BINS, d: 520 }, "sine.inOut");
  st(t.mais6 + 0.1, 1.0, { bins: 1 }, "power2.out"); //                         the bins open, arms reach up
  st(t.mais6 + 0.6, 1.4, { bag: 1 }, "sine.inOut"); //                          and you take yours

  /* ── 491,0 → 497,1 · « En juillet 2025, à Denver, des passagers descendent encore le toboggan… avec sacs à dos et
     valises. » — a slide, standing, bags everywhere ── */
  const tSafo = onFrame(t.safo - 0.12);
  const S1L = { ...VIEW.slide1L, ...SHARP, d: 2150 };
  cut(tDen, SET.PISTE, S1L, apron({ evac: 0.3, bags: 1 }), { fade: 0.2 });
  shot(tDen, tSafo - tDen, { ...S1L, d: 1800, az: -16, ty: 220 }, "sine.inOut");
  st(tDen + 0.05, tSafo - 0.1 - (tDen + 0.05), { evac: 0.43 }, "none");
  fact(D.tl, { id: "c6-denver", k: "Denver", v: "Juillet 2025", from: tDen + 0.2, to: tDen + 2.6 });

  /* ── 497,1 → 506,7 · « Deux mois plus tard, l'aviation civile américaine l'écrit noir sur blanc… plus lente, plus de
     blessés… et des vies en jeu. » — the 2025 sheet, highlighted signal, line by line ── */
  const tDer = onFrame(t.derriere - 0.13);
  const SH0 = { ...VIEW.doc, ...SHARP, d: 172, az: -12, el: 52 };
  const SH1 = { ...VIEW.doc, ...SHARP, d: 158, az: -5, el: 56 };
  const SH2 = { ...VIEW.doc, ...SHARP, tz: 6, d: 136, az: 2, el: 60 };
  cut(tSafo, SET.BENCH, SH0, { ...AT.bench, ...benchLight(ITEM.DOC), doc: 7, docIn: 0, hl: 0, mood: 1 }, { fade: 0.2 });
  st(tSafo + 0.05, 0.8, { docIn: 1 }, "power2.out");
  const tMid = t.lente - 2.2;
  shot(tSafo, tMid - tSafo, SH1, "sine.inOut");
  shot(tMid, tDer - tMid, SH2, "sine.inOut"); //                                closer on the lines as they light up
  st(t.ecrit, 0.4, { hl: 0.06 }, "power1.inOut"); //                            « noir sur blanc »: LES BAGAGES
  st(t.lente - 0.05, 0.4, { hl: 0.33 }, "power1.inOut");
  st(t.blesses - 0.05, 0.4, { hl: 0.66 }, "power1.inOut");
  st(t.vies - 0.05, 0.4, { hl: 1 }, "power1.inOut");
  punch(t.vies, 0.05, { up: 0.08, hold: 0.12, down: 0.4 });

  /* ── 506,7 → 510,45 · « Un sac, c'est une seconde de trop… pour celui qui est derrière toi. » — you in the aisle, your
     bag; behind you, the ones who wait ── */
  const tCrew = onFrame(t.alors - 0.15);
  const YOU = { ...P, ...CLOSE, tx: 760, ty: 82, tz: 150, d: 360, az: -95, el: -5, fov: 32 };
  cut(tDer, SET.CABINE, YOU, { ...AT.tokyo, you: 2, bag: 1, crowd: 0.15, smoke: 0.9, floor: 1, fire: 0.6, fx: 760, fy: 80, fz: 130, fs: 350 }, { fade: 0.2 });
  // one slow move for the whole sentence: the push, and the eye drifting past you toward the ones behind (« derrière toi »)
  shot(tDer, tCrew - tDer, { ...YOU, tx: 790, ty: 88, d: 335, az: -97 }, "sine.inOut");

  /* ── 510,45 → 513,1 · « Alors, le jour où ça t'arrive, tu écoutes l'équipage. » — at the front, the megaphone ── */
  const tDrop = onFrame(t.et7 - 0.12);
  const CF = { ...VIEW.crewFront, d: 410 };
  cut(tCrew, SET.CABINE, CF, { ...AT.tokyo, crew: 1, arm: 1, pax: 1, crowd: 0.15, smoke: 0.5, floor: 1, fire: 0.6, emerg: 1, fx: -20, fy: 140, fz: 170, fs: 300 });
  shot(tCrew, tDrop - tCrew, { ...CF, d: 370, az: 54 }, "sine.inOut");
  st(t.equipage - 0.15, 0.6, { crew: 2 }, "power2.out"); //                     « l'équipage »: she turns, the megaphone up

  /* ── 513,1 → 514,07 · « Et tu laisses tout. » — your hand opens, the bag drops (cut before it lies) ── */
  const tTocta = onFrame(t.tocta);
  const YOU2 = { ...YOU, tx: 750, ty: 70, d: 300, az: -88, el: -3 };
  cut(tDrop, SET.CABINE, YOU2, { ...AT.tokyo, you: 2, bag: 1, crowd: 0.15, smoke: 0.9, floor: 1, fire: 0.6, fx: 760, fy: 60, fz: 130, fs: 350 });
  shot(tDrop, tTocta - tDrop, { ...YOU2, d: 285 }, "sine.inOut");
  st(t.laisses, 0.45, { bag: 0.74 }, "power2.in"); //                           it falls, still upright

  /* ── 514,07 → 519,27 · « Mais sois honnête… ton sac… tu le laisses ? Ou tu le prends ? » — the bag in your hand; the two
     answers come, each on its word, and both stay: the film does not answer ── */
  const tLike = onFrame(at("like") - 0.04);
  cut(tTocta, SET.CABINE, { ...VIEW.thumbBag, d: 212 }, { ...AT.tokyo, you: 2, bag: 1, smoke: 0.9, floor: 1, fire: 0.6, fx: 742, fy: 60, fz: 110, fs: 250 });
  shot(tTocta, tLike - tTocta, { ...VIEW.thumbBag, d: 182 }, "sine.inOut");
  fact(D.tl, { id: "c6-laisse", k: "Ton sac", v: "Tu le laisses", tone: "veille", from: t.laisses8 - 0.05, to: tLike - 0.06 });
  fact(D.tl, { id: "c6-prend", k: "Ton sac", v: "Tu le prends", tone: "signal", side: "right", from: t.prends - 0.05, to: tLike - 0.06 });

  /* ── 519,27 → 525,6 · « Et envoie cette vidéo… Si tu as appris quelque chose, un petit like. » — THE RIGHT HALF FREE: a
     slide standing in the night, people walking away with nothing in their hands, the subject on the left ── */
  const tPack = onFrame(t.abo - 0.15);
  const LIKE0 = { ...POSE0, d: 2700, az: -64, el: -6, side: 420 }; // from ahead of the nose (the first frame's angle): slide and nose left, the hull fading into the right half
  cut(tLike, SET.PISTE, LIKE0, apron({ evac: 0.35, bags: 0 }), { fade: 0.2 });
  shot(tLike, tPack - tLike, { ...LIKE0, d: 2450, az: -67, side: 400 }, "sine.inOut");
  st(tLike + 0.05, tPack - 0.1 - (tLike + 0.05), { evac: 0.5 }, "none");

  /* ── 525,6 → 530,5 · « On se retrouve très vite… pour ouvrir un autre système qui veille sur toi. » — the pack, closed,
     on the left of the bench; « ouvrir »: its lid lifts a little; « veille »: the mouths glow ── */
  const tLoop = onFrame(t.toloop);
  const PK = { ...VIEW.pack, side: 330, d: 290 };
  cut(tPack, SET.BENCH, PK, { ...AT.bench, ...benchLight(ITEM.PACK), explode: 0, named: 0, mood: 0 }, { fade: 0.2 });
  shot(tPack, tLoop - tPack, { ...VIEW.pack, side: 300, d: 255, az: -20 }, "sine.inOut");
  st(t.ouvrir - 0.05, 0.8, { explode: 0.14 }, "power2.out");
  now(t.veille, { named: 3 });

  /* ── 530,54 → 534,27 · LA BOUCLE « Un système qui attend, lui aussi, le jour où… » — Haneda at night, door 1L shut: the
     system that waits. From « le jour », everything glides to FIRST and POSE0: the door swings out, the pack drops and
     starts to unroll (doorA 0 → 0,52), the five doors turn signal, the fire swells — the next word is « Ton avion brûle ». ── */
  const LOOP0 = { ...POSE0, d: 2900, az: -74, el: -8, side: 300 };
  const tRew = t.le - 0.2;
  cut(tLoop, SET.PISTE, LOOP0, { ...AT.haneda, doorA: 0, shut: 0, smoke: 0.6, fire: 0.4, fx: -2700, fy: 300, fz: 300, fs: 1800 }, { fade: 0.2 });
  shot(tLoop, tRew - tLoop, { ...POSE0, d: 2500, az: -70, el: -9.5, side: 240 }, "sine.inOut");
  D.loop({ at: tLoop, rewindAt: tRew });
}
