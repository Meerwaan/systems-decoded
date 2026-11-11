// c6 · « L'enquête » de « Et le détail du début ? », « Ce qui te protège depuis », « Alors, qui a éteint ta lumière ? », la boucle
// HAND.c56 (≈ 572,91) → la fin (708,3). The plan, phrase by phrase: docs/L06-actes.md § c6 (the common top first). Journal: docs/journal/L06-c6.md.
// Every instant is read off the script (D.at). A cut gives what changes, never a number a running tween carries.
// The header: clockOn 0, hzOn 0 to the loop; era 3 → 4 under the card « Ce qui te protège depuis » → 5 on `avril2025` →
// 4 on `veille`; the loop puts FIRST back. From 686,6 (the comment) to the end: the subject in the LEFT half (end screen).
// Punches: `decide` (L'enquête) · `verdict` (Ce qui te protège depuis). The pièces: `reglages`, `cre` (text frames).
import { SET, AT, VIEW, POSE0, FIRST, SHARP, seam, onFrame, cardAt } from "./world.js";
import { fact } from "@kit/long.js";
import { threadCall, retitle } from "@kit/blocks.js";
import { showPiece } from "./pieces.js";

export default function ({ D, world, co }) {
  const { at, st, now, shot, cut, path, punch, quiet, tl } = D;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const LA = world.europe.A;
  /** A figure in the left column (or the right one); the keywords keep quiet meanwhile. */
  const fig = (o) => {
    fact(tl, o);
    quiet(o.from, o.to);
  };
  /** A place label: one at a time, never during a fast move; the keywords keep quiet meanwhile. */
  const label = (anchor, title, sub, from, to, x = 1260, y = 300) => {
    co.add({ title, sub, x, y, anchor }).show(tl, from).hide(tl, to - 0.24);
    quiet(from, to);
  };

  /* ═════════ 572,91 → 589,3 · the bench, the line: « 3 000 », « 2 100 », the two dials, « le plus bas… qui décide » ═════════ */
  // the seam: a cut (fade) onto the line on the bench (VIEW.lwWide); neither threshold shown yet — the inquiry reveals them
  seam(D, "c56", "in", { state: { ...AT.lw, era: 3, amps: 2120, markRwe: 0, markEon: 0 } });
  const t0 = onFrame(at("lebout") - 0.15);
  const TWO = { ...VIEW.twoDials };
  // ONE move: push to Landesbergen (E.ON) → ONE glide along the line to Wehrendorf (RWE) → back: both dials in one frame
  path(
    [
      [t0, VIEW.lwWide],
      [at("cote1") + 0.45, { ...VIEW.relayEon, d: 215, dof: 0 }], //            Landesbergen's dial (≈ 45 %)
      [at("lebout") + 4.75, { ...VIEW.relayEon, d: 196, az: 20, dof: 0 }], //  577,8: the glide leaves
      [at("cote2") + 0.22, { tx: 0, ty: 50, tz: 30, d: 330, az: -3, el: 8 }], // along the line (the conductor, signal)
      [at("lebout") + 7.15, { ...VIEW.relayRwe, d: 200, az: -26, dof: 0 }], //  580,2: Wehrendorf's dial
      [at("lebout$") + 0.05, { ...VIEW.relayRwe, d: 186, az: -31, dof: 0 }],
      [at("deuxReglages") + 0.5, { ...TWO, d: 405, az: -13 }], //                        « Deux réglages » : both dials
      [at("bas") - 0.1, { ...TWO, d: 370, az: -6 }],
      [at("decide") - 0.12, { ...TWO, d: 352, az: 0 }], //                      at rest for the clack
    ],
    { from: "rest", to: "rest" },
  );
  st(at("cote1") + 0.85, 0.5, { markEon: 1 }, "power2.out"); //   « coupait à 3 000 ampères » : the reveal
  st(at("lebout") + 7.45, 0.45, { markRwe: 1 }, "power2.out"); // « à 2 100 »
  showPiece(tl, { id: "reglages", from: at("deux003") - 0.05, to: at("valeurs03") + 0.5, side: "right", top: 200 });
  fig({ id: "c6-2003", k: "DERNIÈRES VALEURS ÉCHANGÉES", v: "2003", from: at("valeurs03") + 0.7, to: at("deux003$") - 0.05 });
  st(at("valeurs03") + 0.5, 1.9, { amps: 1800 }, "sine.inOut"); //  the needles settle back…
  st(at("bas") + 0.05, 1.85, { amps: 2120 }, "power1.in"); //       …and climb together: RWE's passes its mark first
  st(at("decide"), 0.2, { lwTrip: 1 }, "power2.out"); //            « qui décide » : the breaker opens (the camera holds)
  punch(at("decide"), 0.06, { hold: 0.18, down: 0.34 }); //          the chapter's word — over before the cut (589,3)

  /* ═════════ 589,3 → 598,75 · the CRE: « huit départs sur dix », « quinze centièmes de hertz » ═════════ */
  const tHero = F("precision", -0.14);
  const HW = { ...VIEW.heroW };
  cut(tHero, SET.BENCH, HW, { ...AT.hero, era: 3, clac: 1 }, { fade: 0.2 }); // round: the ammeter → the hero
  const tRelay = F("centiemes", -1.58); //                                         ≈ 594,8
  path(
    [
      [tHero, HW],
      [at("huitSurDix") - 0.3, { tx: -62, ty: 118, tz: 42, d: 280, az: -30, el: 5 }],
      [at("huitSurDix") + 0.9, { ...VIEW.heroFlags, d: 172, dof: 0 }], //            the ten flags under the relay
      [tRelay, { ...VIEW.heroFlags, d: 150, az: -24, dof: 0 }],
    ],
    { from: "go", to: "go" },
  );
  showPiece(tl, { id: "cre", from: tHero + 0.25, to: at("huitSurDix") + 1.0, side: "right", top: 220 });
  st(at("huitSurDix") - 0.2, 2.0, { dep: 1 }, "none"); //           eight drop, two stay
  fig({ id: "c6-dep", v: "8 SUR 10", s: "DÉPARTS OUVERTS", tone: "veille", from: at("huitSurDix") + 1.25, to: tRelay - 0.2 });
  // the cut: the flags → the relay above them (the same column, closer)
  const RLY = { ...VIEW.heroRelay, d: 92, az: -28 };
  cut(tRelay, null, RLY, { setpt: 1 });
  const tBars = F("pascause", -0.15); //                                           ≈ 598,75
  shot(tRelay, tBars - tRelay, { ...RLY, d: 76, az: -22 }, "none");
  st(at("centiemes") - 0.2, 0.8, { precision: 1 }, "power2.out");
  fig({ id: "c6-prec", k: "PRÉCISION DES RELAIS", v: "± 0,15 HERTZ", s: "RÈGLE : 0,10", tone: "signal", from: at("centiemes") - 0.15, to: at("precision$") - 0.1 });

  /* ═════════ 598,75 → 604,7 · « la manœuvre de vingt-deux heures dix » : the busbars, coupled ═════════ */
  const BARS = { ...VIEW.bars, ...SHARP, tx: 205, ty: 60, tz: -20, d: 240, az: 120, el: 20 }; // from behind the busbars: the coupler, the line leaving (the E.ON cabinet out of the way)
  cut(tBars, SET.BENCH, BARS, { ...AT.lw, era: 3, bars: 1, couple: 1, amps: 2120, markRwe: 1, markEon: 1 }, { fade: 0.2 });
  const tReg = F("condamne", -0.12); //                                            ≈ 604,7
  shot(tBars, tReg - tBars, { ...BARS, d: 222, az: 131, el: 18 }, "none"); //   a slow orbit
  fig({ id: "c6-cause", k: "LA MANŒUVRE DE 22 H 10", v: "PAS UNE CAUSE", from: at("pasCause") - 1.85, to: at("pascause$") - 0.05 });

  /* ═════════ 604,7 → 626,2 · the map: no margin left, « une ligne » ; for you ; (ad) ; what the report asks for ═════════ */
  // ONE move that never stops: the region → Landesbergen–Wehrendorf → back to France (you) → through the ad's breath →
  // under the card, into the control areas → the sweeps → back to the continent
  cut(tReg, SET.CARTE, VIEW.region, { ...AT.region, era: 3, emsCut: 2, load: 1, alarm: 1, smallOut: 1 }, { fade: 0.2 });
  const tCard = cardAt(D, "depuis"); //                                            612,3
  const tPoste = F("decret", -0.14); //                                            ≈ 626,2
  // (retouch: the pull-back line → France in 2 s was the film's harshest move (qa 33 at 610,0) → a clean cut before « pour toi »)
  const tYou = F("pourToi", -0.3); //                                              ≈ 611,16
  path(
    [
      [tReg, VIEW.region],
      ["marge", { tx: -20, tz: -117, d: 90, az: -17, el: 38 }],
      ["uneLigne", { ...VIEW.lwMap, d: 72, az: -12, el: 38, dof: 0 }], //            the line that sufficed
      [tYou, { ...VIEW.lwMap, d: 66, az: -10, el: 38, dof: 0 }], //                  a slow push holds on it
    ],
    { from: "go", to: "go" },
  );
  const YOU = { ...VIEW.mapWide, tx: -62, tz: -56, d: 380, az: -19, el: 46 }; //   France and the north, your dot
  cut(tYou, null, YOU, {}); //                                                      cut: the line → where you live
  path(
    [
      [tYou, YOU],
      [tCard + 0.5, { tx: -57, tz: -64, d: 340, az: -16, el: 47 }], //               the breath: a slow drift goes on
      [tCard + 2.7, { ...VIEW.zonesDE }], //                                         under the card, into the areas
      ["chezVoisins", { ...VIEW.zonesDE, d: 258, az: 2, el: 50 }],
      ["petites", { tx: -20, tz: -45, d: 540, az: -12, el: 45 }],
      [tPoste, { ...VIEW.mapWide, d: 760 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("uneLigne") - 0.1, 0.6, { lw: 1 }, "power2.out"); //         it lights — it does NOT trip: the margin is gone
  st(at("pourToi") - 0.2, 0.6, { you: 1 }, "power2.out");
  // the chapter card « Ce qui te protège depuis » + the open thread; the past fades, the areas come
  now(tCard, { era: 4, zoneLit: 4 });
  st(tCard + 0.2, 1.8, { load: 0, alarm: 0, lw: 0, region: 0, zones: 1, fs: 320 }, "sine.inOut"); // the light opens to the continent
  threadCall(tl, { from: tCard + 0.15, to: tCard + 2.55, text: "Et pour toi, qu'est-ce qui a changé ?", tone: "veille" });
  st(at("enLigne") - 0.1, 1.6, { scan: 1 }, "sine.inOut"); //          each sweep stops at its border…
  st(at("chezVoisins") - 1.25, 1.8, { scanAll: 1 }, "sine.inOut"); //   …this one crosses them
  st(at("tempsReel") - 1.25, 2.0, { share: 1 }, "sine.out"); //        the dispatch points linked
  st(at("petites"), 2.4, { smallOut: 0 }, "sine.inOut"); //            the small units come back and hold

  /* ═════════ 626,2 → 631,9 · the decree: the poste source, its feeders ═════════ */
  const PW = { ...VIEW.posteW };
  cut(tPoste, SET.QUARTIER, PW, { ...AT.quartier, era: 4, feed: 1 }, { fade: 0.2 }); // light: the links → the feeders
  const tBxl = F("bruxelles", -0.1); //                                            ≈ 631,9
  shot(tPoste, tBxl - tPoste, { ...PW, d: 2750, az: -32 }, "none");
  fig({ id: "c6-decret", k: "DÉCRET DU", v: "23 DÉCEMBRE 2006", s: "DÉLESTAGE OBLIGATOIRE", tone: "veille", from: at("decretW") + 0.05, to: at("decret$") - 1.45 });

  /* ═════════ 631,9 → 638,45 · Brussels, every fifteen minutes ═════════ */
  const BX = { ...VIEW.bruxelles };
  cut(tBxl, SET.CARTE, BX, { ...AT.carte, era: 4, dial: 0 }, { fade: 0.2 });
  const tTower = F("pylones", -0.12); //                                           ≈ 638,45
  shot(tBxl, tTower - tBxl, { ...BX, d: 168, az: 4, el: 52 }, "none");
  st(at("bruxellesW"), 4.6, { bxl: 1 }, "sine.out");
  label(LA.bruxelles, "Bruxelles", "Coordination · depuis 2009", at("bruxellesW") + 0.1, at("bruxellesW") + 2.8);
  fig({ id: "c6-15", k: "TOUTES LES", v: "15 MINUTES", tone: "veille", from: at("quinzeMin") - 1.4, to: at("bruxelles$") - 0.1 });

  /* ═════════ 638,45 → 643,65 · the Ems, 2007: the towers raised to 110 m; the ships pass under ═════════ */
  const TW = { ...VIEW.tower };
  cut(tTower, SET.TERRAIN, TW, { ...AT.terrain, era: 4 }, { fade: 0.2 }); // form: the ring → the tower
  const tUnder = F("passent", -0.6); //                                           ≈ 642,3
  shot(tTower, tUnder - tTower, { ...TW, ty: 6600, el: 6, d: 20000, az: -29 }, "none"); // a slow tilt up with the tower
  st(at("pylones") + 0.85, 2.0, { raise: 1 }, "sine.inOut");
  fig({ id: "c6-110", k: "DEPUIS 2007", v: "110 MÈTRES", tone: "veille", from: at("m110") - 0.7, to: at("passent") });
  const UND = { ...VIEW.under };
  cut(tUnder, null, UND, { pass: 0.42, gap: 0 }); //                  the raised span → what passes under it (cables ink)
  const tIb = F("espagne", -0.13); //                                              ≈ 643,65
  shot(tUnder, tIb - tUnder, { ...UND, d: 47000 }, "none");
  st(tUnder + 0.05, tIb - tUnder - 0.1, { pass: 0.57 }, "none");

  /* ═════════ 643,65 → 656,3 · 28 April 2025: Spain and Portugal; « par la tension » ; the dial at 50 ═════════ */
  const IB = { ...VIEW.iberia, az: -37, d: 292 };
  cut(tIb, SET.CARTE, IB, { ...AT.carte, era: 4, dial: 0 }, { fade: 0.2 }); // (dial 1 here: its back, cut by the frame)
  const tDial = F("parTension", 0.44); //                                          ≈ 654,9
  path(
    [
      [tIb, IB],
      ["entier", { ...VIEW.iberia, tx: -195, tz: 88, d: 470, az: -21, el: 50 }], // (retouch) the dark country whole, France lit above it
      [at("severe") + 2.6, { tx: -160, tz: 50, d: 560, az: -34, el: 45 }], //       the Iberia dark, the rest lit
      [tDial, { tx: -138, tz: 28, d: 530, az: -18, el: 42 }],
    ],
    { from: "go", to: "go" },
  );
  quiet(tIb, at("avril2025") + 1.2); //                               no keyword of the Ems (« dessous ») over Iberia
  now(at("avril2025") - 0.05, { era: 5 });
  st(at("avril2025") + 0.85, 2.4, { iberia: 1 }, "sine.inOut");
  st(at("parTension") - 0.08, 0.36, { volt: 0.6 }, "sine.inOut"); //  a dip in the voltage…
  st(at("parTension") + 0.3, 0.7, { volt: 1 }, "sine.inOut"); //       …that comes back
  const DM = { ...VIEW.dialMap };
  cut(tDial, null, DM, { dial: 1, needles: 1, hzW: 50 }); //          round: the needle at 50, still
  const tRq = F("veille", -0.12); //                                               ≈ 656,3
  shot(tDial, tRq - tDial, { ...DM, d: 136 }, "none");

  /* ═════════ 656,3 → 660,7 · your neighbourhood's relay: still there, set on the frequency, it watches ═════════ */
  const RQ = { ...VIEW.relayQ, d: 112 };
  cut(tRq, SET.QUARTIER, RQ, { ...AT.poste, era: 4, setpt: 1, hero: 0.55 }, { fade: 0.2 }); // round: the dial → the light
  const tVerdict = F("toverdict");
  shot(tRq, tVerdict - tRq, { ...RQ, d: 88, az: -22 }, "none");
  st(at("ilVeille") - 0.12, 0.5, { hero: 1 }, "power2.out");

  /* ═════════ 660,7 → 671,26 · the chute: not collapsed, sacrificed; « un black-out européen a été évité » ═════════ */
  const THREE = { ...VIEW.three, side: -180 };
  cut(tVerdict, SET.CARTE, THREE, { ...AT.split, era: 4, clockOn: 0, hzOn: 0, shed: 1, relays: 1, needles: 1, dial: 0 }, { fade: 0.2 });
  const tCard2 = onFrame(cardAt(D, "du")); //                                      671,26
  // (retouch: 14 s without a change of view) a cut on « Quinze millions de foyers »: closer, on the crack (form)
  const tFoy = F("chute2", -0.12); //                                              ≈ 664,62
  path(
    [
      [tVerdict, THREE],
      [tFoy, { tx: 20, tz: -12, d: 590, az: -11, el: 53 }],
    ],
    { from: "go", to: "go" },
  );
  const FOY = { ...THREE, tx: 35, tz: -25, d: 420, az: 16, el: 40 };
  cut(tFoy, null, FOY, {});
  path(
    [
      [tFoy, FOY],
      ["resteAllume", { tx: 5, tz: -8, d: 650, az: -2, el: 55 }],
      [tCard2, { tx: -12, tz: -2, d: 880, az: 2, el: 61, side: -110 }],
    ],
    { from: "go", to: "go" },
  );
  retitle(tl, { showAt: at("chute") + 0.2, strikeAt: at("effondre") + 0.5, swapAt: at("verdict") - 0.15, hideAt: at("evite") - 0.5 });
  quiet(at("chute"), at("evite") - 0.3); //                          no keyword under the title
  D.verdict(at("verdict"));
  punch(at("verdict"), 0.06); //                                     the chapter's word
  st(at("evite") - 1.9, 1.8, { apartE: 0, apartS: 0, weld: 1, crack: 0 }, "sine.inOut"); // over before the cut (671,26)

  /* ═════════ 671,26 → 682,6 · « Alors, qui a éteint ta lumière ? » — one piece of the dossier per cause ═════════ */
  const ROOM = { ...VIEW.room, ...SHARP }; //                                      under the card: sharp
  cut(tCard2, SET.QUARTIER, ROOM, { ...AT.quartier, era: 4, shed: 1, feed: 0 }, { fade: 0.2 }); // your room, dark
  const tBoat = F("pasBateau", -0.2); //                                           ≈ 674,4
  shot(tCard2, tBoat - tCard2, { ...ROOM, d: 290, az: 156 }, "none");
  const UB = { ...VIEW.under, side: 160 };
  cut(tBoat, SET.TERRAIN, UB, { ...AT.terrain, era: 4, emsCut: 2, pass: 0.5, gap: 1 }, { fade: 0.15 }); // « Pas le bateau »
  const tRule = F("regleDu", -0.18); //                                            ≈ 675,3
  shot(tBoat, tRule - tBoat, { ...UB, d: 49000 }, "none");
  const N1 = { ...VIEW.n1, side: 160 };
  cut(tRule, SET.CARTE, N1, { ...AT.region, era: 4, emsCut: 2, load: 1, n1sim: 0 }, { fade: 0.15 }); // the rule, without simulation
  const tNb = F("voisins19", -0.22); //                                           ≈ 678,3
  shot(tRule, tNb - tRule, { ...N1, d: 62, az: -22 }, "none");
  st(at("regleDu") + 0.1, 1.4, { n1sim: 1 }, "sine.inOut");
  const NB = { ...VIEW.zonesDE, side: 160, d: 232, az: -16 };
  cut(tNb, null, NB, { n1sim: 0, load: 0, region: 0, zones: 1, zoneLit: 4, fs: 320 }); //   the neighbours, the calls
  const tTwo = F("deuxBouts", -0.2); //                                           ≈ 681,4
  shot(tNb, tTwo - tNb, { ...NB, d: 205, az: 1 }, "none");
  st(at("voisins19") + 0.05, 0.7, { phone: 1 }, "power1.out");
  const TD = { ...VIEW.twoDials, side: 100, d: 400 };
  cut(tTwo, SET.BENCH, TD, { ...AT.lw, era: 4, amps: 2120, markRwe: 1, markEon: 1 }, { fade: 0.15 }); // two figures, two ends
  const tBrk = F("toi", -0.11); //                                                ≈ 682,6
  shot(tTwo, tBrk - tTwo, { ...TD, d: 380 }, "none");

  /* ═════════ 682,6 → 686,6 · « Et à la fin… ton propre réseau » : the breaker, open, in the poste ═════════ */
  const BRK = { ...VIEW.breakerQ };
  cut(tBrk, SET.QUARTIER, BRK, { ...AT.poste, era: 4, shed: 1, feed: 1, heroOpen: 1, clac: 1, hero: 1 }, { fade: 0.2 }); // round: the dials → the relay
  const tHome = F("tocta");
  shot(tBrk, tHome - tBrk, { ...BRK, az: -64, d: 165 }, "none");

  /* ═════════ 686,6 → 694,1 · the comment: your building, the LEFT half; d'accord… ou pas d'accord ? (no answer) ═════════ */
  const HOME = { ...VIEW.windowC, ...SHARP, d: 4900, az: -26, el: 8, side: 440 }; // your building, on your window (≈ 45 %, left) — retouch: further back
  cut(tHome, null, HOME, { ...AT.quartier, era: 4, shed: 0, feed: 0, heroOpen: 0, clac: 0 }, { fade: 0.2 }); // object: from the poste to your home
  const tLike = F("like", -0.12); //                                               ≈ 694,1
  shot(tHome, tLike - tHome, { ...HOME, d: 4000, az: -8, el: 6 }, "none"); // slow: the windows are a stripe
  quiet(tHome, at("daccord") - 0.5); //                              no « perdre » over your building
  st(at("daccord"), 0.4, { shed: 1 }, "power2.inOut"); //            « d'accord… » : feeder 1 out
  st(at("pasDaccord"), 0.4, { shed: 0 }, "power2.inOut"); //         « …ou pas d'accord ? » : back on
  fig({ id: "c6-ok", v: "D'ACCORD…", s: "OU PAS D'ACCORD ?", side: "right", from: at("daccord") - 0.45, to: at("comment$") - 0.05 });

  /* ═════════ 694,1 → 705,8 · the like, the appointment, « Et ce relais attend… » : the hero, LEFT half ═════════ */
  const HL = { ...VIEW.heroW, side: 340 };
  cut(tLike, SET.BENCH, HL, { ...AT.hero, era: 4 }, { fade: 0.2 }); //  light: the veille
  const tLoopIn = F("toloop"); //                                                  ≈ 704,0: the relay, on the impact
  path(
    [
      [tLike, HL],
      ["electricien", { ...HL, d: 450, az: -37 }],
      ["petitLike", { ...HL, d: 375, az: -42, ty: 112 }],
      ["autreJour", { tx: -70, ty: 135, tz: 60, d: 260, az: -46, el: 5, side: 340 }], // the row recedes: the right half stays dark
      [tLoopIn, { ...VIEW.heroRelay, d: 128, az: -48, side: 300, dof: 0 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("electricien") - 0.1, 1.5, { heroOpen: 1 }, "sine.inOut"); // « un électricien » : the cover off, the mechanism
  st(at("abo$") - 1.75, 1.93, { heroOpen: 0 }, "power2.in"); //      the truck rolls back; the cover lands on the clack (703,84)
  const RL = { ...VIEW.heroRelay, d: 84, az: -48, side: 300 };
  cut(tLoopIn, null, RL, {}); //                                     in the axis: the relay, its light
  // the loop: « Et ce relais attend… » stays on the relay; on « le soir où » (cue `rewind`) a CLEAN CUT back under
  // the line (POSE0 + FIRST), then a slow push onto POSE0
  const tLoop = onFrame(at("rewind"));
  shot(tLoopIn, tLoop - tLoopIn, { ...RL, d: 76, az: -45 }, "none");
  const LOOP0 = { ...POSE0, d: POSE0.d * 1.1 };
  cut(tLoop, SET.TERRAIN, LOOP0, { ...FIRST });
  D.loop({ at: tLoop, rewindAt: tLoop, fromD: LOOP0.d });
}
