// c1 · « 22 h 10 : l'Europe coupée en trois », « Comment marche le réseau électrique européen », « La règle N-1 » jusqu'à « …la place de le prendre »
// 0 → HAND.c12 (italie − 0,15 ≈ 111,82). The plan, phrase by phrase: docs/L06-actes.md § c1 (+ docs/L06-actes-maj.md).
// Journal: docs/journal/L06-c1.md.
// Every instant is read off the script (D.at). A cut gives what changes, never a number a running tween carries.
// The marks (turnW/E/S) brake ONCE (« les alternateurs freinent ») and come back in step at −360 (≡ 0): the seam to c2
// lays turn* 0 without a visible jump.
import { SET, AT, VIEW, POSE0, SHARP, CLOSE, span, seam, onFrame, cardAt } from "./world.js";
import { glide } from "@kit/direct.js";
import { QUARTIER as Q } from "./plan.js";
import { fact } from "@kit/long.js";
import { showPiece } from "./pieces.js";

const P = { fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3 };

/** Where an anchor of the maquette stands (at build time: the plates at rest). */
const posOf = (obj) => {
  obj.updateWorldMatrix(true, false);
  const e = obj.matrixWorld.elements;
  return [e[12], e[13], e[14]];
};

export default function ({ D, world, co }) {
  const { at, st, now, shot, cut, path, punch } = D;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const [, tEnd] = span(D, "c1");
  const HUD = { clockOn: 1, hzOn: 1 }; // the header, from 0 to « curiosite »

  /* ═════════ 0 → 5,0 · « 22 h 10. Loin de toi, une ligne saute dans le nord de l'Allemagne. » ═════════ */
  // frame 0 = POSE0 (FIRST: tripRun 0.14, the flash held, the dashes running −x): the camera already rising along the tower
  const tH3 = F("accroche:ligne", -0.12); //                          ≈ 2,3: at the wires' height
  const P0b = { ...POSE0, ty: POSE0.ty + 700, el: -9, d: POSE0.d * 0.9 };
  shot(0, tH3, P0b, glide(1.6, 0.9)); //                           moving on frame 1
  const H3a = { ...VIEW.hook3, ty: VIEW.hook3.ty - 250, el: 4 };
  const H3b = { ...VIEW.hook3, ty: VIEW.hook3.ty + 150, el: 7, d: 4400 };
  cut(tH3, null, H3a, {}); //                                        movement: the rise goes on
  const tTear = F("promesse", -0.12); //                              ≈ 5,03
  shot(tH3, tTear - tH3, H3b, "sine.out");
  st(at("saute0") - 0.2, 1.4, { tripRun: 1 }, "none"); //             « saute » : the dark runs back along the wires toward us

  /* ═════════ 5,0 → 9,9 · « Quinze secondes plus tard, l'Europe est coupée en trois. Et en France… ta lumière s'éteint. » ═════════ */
  const TEAR = { ...VIEW.tear };
  cut(tTear, SET.CARTE, TEAR, { ...AT.split, crack: 0, apartE: 0, apartS: 0, lost: 0, needles: 1 }, { fade: 0.2 });
  st(at("coupee3") - 0.86, 0.8, { crack: 1 }, "sine.in"); //          the signal light pours up through the joint
  st(at("coupee3") - 0.16, 1.2, { apartE: 1, apartS: 1 }, "power2.out");
  const tWin = F("promesse:France", -0.3); //                         ≈ 8,3
  path([
    [tTear, TEAR],
    [at("coupee3") - 0.2, { d: 175, el: 13, az: 4 }],
    [tWin - 0.45, VIEW.three],
    [tWin, { ...VIEW.three, d: 680 }],
  ]);
  const WIN = { ...VIEW.windowC };
  cut(tWin, SET.QUARTIER, WIN, { ...AT.quartier, ...HUD, shed: 0 }, { fade: 0.2 });
  const tFeed = F("expres", -0.12); //                                ≈ 9,9
  shot(tWin, tFeed - tWin, { ...WIN, d: 600, az: -11 }, "none");
  st(at("lumiere0"), 0.5, { shed: 1 }, "none"); //                    feeder 1 goes dark, your window with it

  /* ═════════ 9,9 → 14,7 · « Cinq millions de foyers. Et ce n'est pas la ligne qui te coupe. C'est ton réseau. Exprès. » ═════════ */
  const FEED = { ...VIEW.feeders };
  cut(tFeed, null, FEED, { feed: 1 }); //                             object: we follow the dark feeder to the poste
  const tBrk = F("reseau0", -0.22); //                                ≈ 13,1
  shot(tFeed, tBrk - tFeed, { ...FEED, tx: 5200, tz: -450, d: 8200, az: -54 }, "sine.inOut");
  fact(D.tl, { id: "c1-foyers", v: "5 MILLIONS DE FOYERS", tone: "signal", from: at("foyers0") - 0.3, to: at("foyers0") + 2.2 });
  const BRK = { ...VIEW.breakerQ };
  cut(tBrk, null, BRK, { ...AT.poste, ...HUD, shed: 1, feed: 1, heroOpen: 1, clac: 1, hero: 1 });
  const tDial = F("defi", -0.14); //                                  ≈ 14,7
  shot(tBrk, tDial - tBrk, { ...BRK, az: -64, d: 165 }, "none");
  punch(at("titre"), 0.06, { hold: 0.15, down: 0.4 }); // over before the cut at « defi » —                                        « Exprès »

  /* ═════════ 14,7 → 21,1 · « À l'Ouest, l'aiguille des 50 hertz plonge. Si elle touche 47,5… tout l'ouest du continent s'éteint. » ═════════ */
  const DIALM = { ...VIEW.dialMap };
  cut(tDial, SET.CARTE, DIALM, { ...AT.split, needles: 1, marks: 0 }, { fade: 0.2 });
  const tWest = F("continent", -0.5); //                              ≈ 19,3
  shot(tDial, tWest - tDial, { ...DIALM, d: 118, az: -106 }, "none");
  st(at("plonge0") - 0.15, 3.3, { hzW: 49.5 }, "none"); //            0,15 Hz/s at most (plan.js · FREQ.slope); 49,5 a value of FREQ
  st(at("touche") - 0.1, 0.5, { marks: 1 }, "power2.out"); //          « touche 47,5 » : the thresholds, the last one signal
  const WP = { ...VIEW.westPlate };
  cut(tWest, null, WP, { dial: 0 }); //                                       the round of the dial → the plate it reads
  const tPaq = F("paquebot", -0.12); //                               ≈ 21,1
  shot(tWest, tPaq - tWest, { ...WP, d: 470, el: 40 }, "none");
  st(at("continent") - 0.3, 0.5, { whatif: 0.6 }, "power2.out"); //   « s'éteint » : a conditional, only its sentence
  st(at("defi$") - 0.3, 0.5, { whatif: 0 }, "sine.inOut");

  /* ═════════ 21,1 → 24,8 · « Une demi-heure plus tôt, on avait coupé une ligne… pour laisser passer un paquebot. » ═════════ */
  const CL = { ...VIEW.crossingLow };
  cut(tPaq, SET.TERRAIN, CL, { ...AT.terrain, ...HUD, emsCut: 2, hzW: 50, pass: 0.3, gap: 0 }, { fade: 0.3, kind: "dip" });
  const tUnder = F("coupeLigne", -0.12); //                           ≈ 22,86
  shot(tPaq, tUnder - tPaq, { ...CL, d: 27000, az: 30 }, "none");
  st(tPaq + 0.2, 3.3, { pass: 0.6 }, "none"); //                      the ghost outline glides under the wires
  const UND = { ...VIEW.under };
  cut(tUnder, null, UND, {}); //                                     object: the wires overhead → the ghost under them
  st(at("coupeLigne") + 0.15, 0.4, { gap: 1 }, "power2.out");
  const tRep = F("curiosite", -0.1); //                               ≈ 24,8
  shot(tUnder, tRep - tUnder, { ...UND, d: 49000 }, "none");

  /* ═════════ 24,8 → 31,2 · « Mais le rapport officiel conclut : ni tempête, ni panne. Ni le bateau. Alors, qui a éteint ta lumière ? » ═════════ */
  const REP = { ...VIEW.report, side: 300, shift: 110 }; //                       the subject on the left: the pièce on the right
  cut(tRep, SET.BENCH, REP, { ...AT.report, page: 0 }, { fade: 0.2 }); // clockOn 0, hzOn 0 (REST)
  st(at("rapport0") + 0.1, 1.1, { page: 1 }, "power2.inOut");
  showPiece(D.tl, { id: "rapport", from: at("rapport0") + 0.25, to: at("bateau0") - 0.45 });
  const tBoat = F("bateau0", -0.24); //                               ≈ 28,3
  shot(tRep, tBoat - tRep, { ...REP, d: 78, az: -30 }, "none");
  cut(tBoat, SET.TERRAIN, { ...UND, d: 47000 }, { ...AT.terrain, emsCut: 2, pass: 0.6, gap: 1 }, { fade: 0.2 }); // « Ni le bateau » : back to the ghost
  st(tBoat + 0.15, 0.5, { gap: 0 }, "sine.inOut");
  st(tBoat + 0.25, 1.1, { pass: 0.99 }, "sine.in"); //                  it glides away and fades
  const tRoom = F("qui0", -0.7); //                                   ≈ 29,6
  shot(tBoat, tRoom - tBoat, { ...UND, d: 45000 }, "none");
  const ROOM = { ...VIEW.room };
  cut(tRoom, SET.QUARTIER, ROOM, { ...AT.quartier, shed: 1, feed: 0 }, { fade: 0.2 }); // the rectangle of the report → your window
  const tSock = F("dessous", -0.16); //                               ≈ 31,2
  shot(tRoom, tSock - tRoom, { ...ROOM, d: 300, az: 161 }, "none");

  /* ═════════ 31,2 → 34,5 · « Pour le savoir… il faut ouvrir la machine sur laquelle ta prise est branchée. » ═════════ */
  const SOCK = { ...VIEW.socketC };
  cut(tSock, null, SOCK, { lights: 0.3 });
  st(at("dessous") + 0.64, 2.4, { socket: 1 }, "none"); //            the head of light leaves your socket, down the wall
  const tMap = onFrame(cardAt(D, "ouvre")); //                        ≈ 34,5 (under the card)
  shot(tSock, at("machine") - 0.2 - tSock, { ...SOCK, d: 58 }, "none");
  shot(at("machine") - 0.2, tMap - (at("machine") - 0.2), { ...SOCK, ty: Q.socket[1] - 33, d: 82, el: 3 }, "sine.in", 58); // it follows the head down and back

  /* ═════════ 34,5 → 37,4 · « Alors… on l'ouvre. » (the card over it: SHARP, nothing new but the opening) ═════════ */
  const MW = { ...VIEW.mapWide };
  cut(tMap, SET.CARTE, { ...MW, d: 860 }, { ...AT.carte, you: 1, dial: 0 }, { fade: 0.2 }); // the head of light lands on your point
  shot(tMap, at("explode") - 0.25 - tMap, MW, "sine.out");
  const EXP = { ...VIEW.exploded, ty: 125, d: 1050, el: 11 }; // el 11: each sheet clears the next (journal europe); ty 125: explode 1,2
  const tEcl = at("eclate") - 0.1;
  shot(at("explode") - 0.25, tEcl - (at("explode") - 0.25), EXP, "sine.inOut", MW.d); // down from el 42 to 14 while it opens
  st(at("explode"), 1.4, { explode: 1.2 }, "power2.out"); //          1,2: the sheets clear each other on the dark

  /* ═════════ 37,4 → 50,0 · « Des centrales… des prises. » « 23 pays… » « 450 millions… Un seul réseau. » « 220 000 km de lignes. » ═════════ */
  // retouche 10/11: the whole stack stays the subject (was a 560 close-up of one sheet: dark, near empty — the lit
  // points are screen-sized, a close view thins them); a slow dolly in and orbit (1050 → 840) while each sheet is named;
  // a cut in the same place on « prises »: the stack from the other side, the homes lit
  const LAY = (y, o = {}) => ({ ...P, ...SHARP, tx: -40, ty: y, tz: -20, d: 900, az: -30, el: 12, ...o });
  const tZones = F("chefW", -0.22); //                                ≈ 50,0
  const tPr = F("prises", -0.12); //                                  ≈ 42,30
  path(
    [
      [tEcl, EXP],
      [at("lignesHT") + 0.2, LAY(195, { d: 920, az: -32 })],
      [at("postes") + 0.1, LAY(185, { d: 870, az: -37 })],
      [tPr, LAY(180, { d: 840, az: -41 })],
    ],
    { from: "rest" },
  );
  const PR = { ...P, ...SHARP, tx: -40, ty: 60, tz: -20, d: 720, az: 12, el: 26 }; // the other side, the homes lit
  cut(tPr, null, PR, {});
  path([
    [tPr, PR],
    [at("pays") + 1.3, { ...VIEW.mapTop, d: 1050 }],
    [at("gens") + 1.4, { ...VIEW.mapTop, az: -12, el: 52, d: 900 }],
    [at("unSeul"), { ...MW, d: 780 }],
    [tZones, { ...MW, tx: -18, tz: -70, d: 430, az: -14, el: 50 }],
  ]);
  now(at("centrales"), { named: 1 });
  now(at("lignesHT"), { named: 2 });
  now(at("postes"), { named: 3 });
  now(at("prises"), { named: 4 });
  st(at("pays") - 0.15, 1.2, { explode: 0 }, "sine.inOut"); //       « 23 pays » : the layers come back together
  now(at("pays") - 0.15, { named: 0 });
  st(at("pays") - 0.15, 1.6, { homes: 0.4 }, "sine.inOut");
  st(at("pays"), 1.6, { pays: 23 }, "none");
  fact(D.tl, { id: "c1-pays", v: "23 PAYS", from: at("pays") + 0.25, to: at("gens") - 0.25 });
  st(at("gens"), 1.6, { homes: 1 }, "sine.inOut"); //                 the homes light up: 450 millions
  fact(D.tl, { id: "c1-gens", v: "450 MILLIONS DE PERSONNES", from: at("gens") + 0.25, to: at("unSeul") });
  st(at("unSeul"), 0.45, { pulse: 1 }, "power2.out"); //              « Un seul réseau » : one beat
  st(at("unSeul") + 0.5, 0.7, { pulse: 0 }, "sine.inOut");
  fact(D.tl, { id: "c1-km", v: "220 000 KILOMÈTRES DE LIGNES", from: at("chef") + 0.25, to: tZones - 0.1 });

  /* ═════════ 50,0 → 56,1 · « Et pas de chef : chaque gestionnaire gère sa zone… » « Au centre, les alternateurs des centrales. » ═════════ */
  const ZDE = { ...VIEW.zonesDE, d: 300 };
  cut(tZones, null, ZDE, {}); //                                     form: the mesh, we dive into it
  st(at("chefW"), 0.6, { zones: 1 }, "power2.out");
  now(at("chefW") + 0.78, { zoneLit: 1 });
  now(at("chefW") + 1.58, { zoneLit: 2 });
  now(at("chefW") + 2.38, { zoneLit: 3 });
  now(at("voisins"), { zoneLit: 4 });
  const tPlunge = F("coeur", -0.12); //                               ≈ 53,93
  shot(tZones, tPlunge - tZones, { ...VIEW.zonesDE, d: 255, az: -16 }, "none");
  const PL = posOf(world.europe.A.plant);
  const PLANT = { ...P, ...CLOSE, tx: PL[0], ty: PL[1], tz: PL[2], d: 52, az: -34, el: 26 };
  const tAlt = F("rotorsW", -0.28); //                                ≈ 56,1
  // retouche 10/11: the dive panned across the mesh in 2 s (qa: heurté 54,9) → a cut onto the plant before « Au centre »,
  // then a slow push, still moving into the cut
  cut(tPlunge, null, { ...PLANT, d: 110, az: -29, el: 32 }, {});
  shot(tPlunge, tAlt - tPlunge, PLANT, "sine.in", 110);
  st(tPlunge, 1.1, { zones: 0 }, "sine.inOut");
  now(tPlunge + 1.2, { zoneLit: 0 });

  /* ═════════ 56,1 → 60,6 · « Des rotors d'acier, entraînés par des turbines. Et tous tournent… au même rythme. » ═════════ */
  const ALT = { ...VIEW.alt };
  cut(tAlt, SET.BENCH, ALT, { ...AT.alt, altOpen: 0, altNamed: 0 }, { fade: 0.2 }); // light: the plant's veille mark → the rotor's
  st(tAlt + 0.1, 1.2, { altOpen: 1 }, "power2.inOut");
  now(at("rotorsW"), { altNamed: 2 });
  now(at("turbines"), { altNamed: 1 });
  const tFl = F("rythmeW", -0.56); //                                 ≈ 59,5
  shot(tAlt, tFl - tAlt, VIEW.altOpen, "sine.out");
  const FL = { ...VIEW.flange };
  cut(tFl, null, FL, { altNamed: 0 }); //                            the mark that turns, close

  /* ═════════ 60,6 → 67,3 · « Ce rythme, c'est la fréquence. 50 hertz. La même à Lisbonne, à Paris, à Varsovie. C'est le pouls du continent. » ═════════ */
  const tCities = F("lisbonne", -0.16); //                            ≈ 63,62
  shot(tFl, at("rythme") - tFl, { ...FL, az: -62 }, "none");
  shot(at("rythme"), 2.0, { ...VIEW.altDial, d: 380 }, "sine.inOut", FL.d); // from the flange to the dial
  shot(at("rythme") + 2.0, tCities - (at("rythme") + 2.0), { ...VIEW.altDial, d: 350 }, "none");
  punch(at("freq"), 0.06); //                                         « 50 hertz »
  fact(D.tl, { id: "c1-hz", v: "50 HERTZ", tone: "veille", from: at("freq") - 0.2, to: tCities - 0.12 });
  const CIT = { ...VIEW.cities };
  cut(tCities, SET.CARTE, CIT, { ...AT.carte, pulse: 1, dial: 0 }, { fade: 0.2 }); // round: the dial → the rings
  const tSens = F("sens", -0.1); //                                   ≈ 67,3
  shot(tCities, tSens - tCities, { ...CIT, d: 690, az: -17 }, "none");
  const lab = (id, title, x, y) => co.add({ title, x, y, anchor: world.europe.A[id] });
  // the three cities in one breath: they pile up (the sentence names them in 1,5 s), and go together before the ring
  lab("lisbonne", "Lisbonne", 240, 690).show(D.tl, at("lisbonne") - 0.1).hide(D.tl, at("poulsW") - 0.3);
  lab("paris", "Paris", 760, 330).show(D.tl, at("paris") - 0.1).hide(D.tl, at("poulsW") - 0.3);
  lab("varsovie", "Varsovie", 1420, 300).show(D.tl, at("varsovie") - 0.1).hide(D.tl, at("poulsW") - 0.3);

  /* ═════════ 67,3 → 71,6 · « Le courant de ta prise change de sens cent fois par seconde. Partout. En même temps. » ═════════ */
  cut(tSens, SET.BENCH, FL, { ...AT.alt, altOpen: 1 }, { fade: 0.2 }); // round → round: the flange, the same rhythm
  const tPart = F("partout", -0.2); //                                ≈ 70,1
  shot(tSens, tPart - tSens, { ...FL, az: -76, d: 175 }, "none");
  fact(D.tl, { id: "c1-100", v: "100 FOIS PAR SECONDE", from: at("cent100") - 0.3, to: tPart - 0.1 });
  cut(tPart, SET.CARTE, MW, { ...AT.carte, pulse: 1, dial: 0 }, { fade: 0.2 }); // the whole map beats

  /* ═════════ 71,6 → 76,7 · « Et sur un réseau, l'électricité ne se stocke pas. À chaque seconde, il faut produire ce que l'Europe consomme. » ═════════ */
  // retouche 10/11: closer, higher, a slow orbit (was d 560, el 16: a flat stack) and the layers further apart
  const SIDE = { ...P, ...SHARP, tx: -40, ty: 80, tz: -20, d: 450, az: -38, el: 24 };
  const tPrin = F("principe", -0.08); //                              ≈ 76,7
  path([
    [tPart, MW],
    [at("stock") + 0.3, { ...MW, d: 840, el: 32 }],
    [at("stocke") + 0.2, SIDE],
    [tPrin, { ...SIDE, az: -20, d: 410 }],
  ]);
  st(at("stock"), 1.2, { explode: 0.8 }, "power2.inOut"); //          the plants on top, the homes below, the dashes running down
  st(at("stock") + 1.3, 1.0, { pulse: 0 }, "sine.inOut");
  st(at("produire") + 0.4, 1.0, { explode: 0 }, "power2.inOut");

  /* ═════════ 76,7 → 87,2 · « Le principe tient en une phrase… les alternateurs freinent. Tous ensemble. Et la fréquence baisse. » « ± 0,18 » ═════════ */
  const AD = { ...VIEW.altDial, d: 345 }; // closer than VIEW (journal model: « peut se resserrer vers 340 »)
  cut(tPrin, SET.BENCH, AD, { ...AT.alt, altOpen: 1, brake: 0, band: 0 }, { fade: 0.2 }); // light: the dashes → the arrow on the shaft
  const tPush = at("bande") - 0.05;
  shot(tPrin, tPush - tPrin, { ...AD, d: 315, az: -52 }, "sine.inOut"); // a slow orbit while the marks brake
  st(at("consomme"), 0.6, { brake: 1 }, "power2.out");
  // ONE tween per mark, from « freinent » until they are back in step: −360 ≡ 0 (never back, never past the rhythm: 144°/s)
  st(at("freinentP") - 0.26, 5.4, { turnW: -360, turnE: -360, turnS: -360 }, "sine.inOut");
  st(at("baisse") - 0.26, 0.8, { hzW: 49.8 }, "sine.inOut");
  const DC = { ...VIEW.dialC };
  const tBack = at("reserves") + 0.05;
  shot(tPush, tBack - tPush, DC, "sine.inOut", 320); //         a push onto the dial
  st(at("bande") + 0.1, 0.6, { band: 1 }, "power2.out");
  st(at("bande") + 0.6, 1.6, { hzW: 49.9 }, "sine.inOut");
  fact(D.tl, { id: "c1-band", v: "± 0,18 HERTZ", tone: "veille", from: at("bande018") - 1.2, to: at("bande$") - 0.1 });

  /* ═════════ 87,2 → 95,0 · « Pour la tenir, des réserves en couches… Mais ce soir-là… il en faudra plus. » ═════════ */
  const tN1 = onFrame(cardAt(D, "n1")); //                            ≈ 94,99 (under the card)
  shot(tBack, 2.9, { ...VIEW.alt, d: 430 }, "sine.inOut", DC.d); //    back to the machine
  shot(tBack + 2.9, tN1 - (tBack + 2.9), { ...VIEW.alt, d: 500, az: -50, el: 14 }, "none");
  now(at("res1"), { res: 1 });
  st(at("res1"), 0.5, { gov: 1 }, "power2.out");
  now(at("res2"), { res: 2 });
  now(at("res3"), { res: 3 });
  st(at("res3"), 1.0, { brake: 0 }, "sine.inOut");
  st(at("res3"), 1.2, { hzW: 50 }, "sine.inOut");

  /* ═════════ 95,0 → 106,8 · « …une règle tient tout le réseau. Elle s'appelle N-1. » « Le réseau doit survivre à la perte de n'importe quel élément… » ═════════ */
  const REG = { ...VIEW.region };
  cut(tN1, SET.CARTE, REG, { ...AT.region }, { fade: 0.2 }); //      form: the machine's shaft → a line
  shot(tN1, at("n1b") - tN1, { ...REG, d: 88, az: -29 }, "none");
  punch(at("n1mot"), 0.06);
  fact(D.tl, { id: "c1-n1", v: "RÈGLE N−1", tone: "veille", from: at("n1mot") - 0.45, to: at("n1$") + 0.3 });
  const N1 = { ...VIEW.n1 };
  const tConc = F("concret", -0.12); //                               ≈ 106,7
  shot(at("n1b"), at("uneLigne0") - 0.3 - at("n1b"), N1, "sine.inOut", 92);
  shot(at("uneLigne0") - 0.3, tConc - (at("uneLigne0") - 0.3), { ...N1, d: 62, az: -34 }, "none");
  st(at("uneLigne0") - 0.18, 2.2, { n1ok: 1 }, "sine.inOut"); //      one line goes dark, its neighbours take it

  /* ═════════ 106,8 → 111,8 · « Concrètement, si une ligne tombe, son courant passe par les autres. Elles doivent avoir la place de le prendre. » ═════════ */
  const N1C = { ...N1, d: 40, az: -46, el: 24 }; // another angle: the cut is not a jump
  cut(tConc, null, N1C, { n1ok: 0 }); //                             closer, the same mesh: again
  st(at("tombe"), 2.25, { n1ok: 1 }, "sine.inOut");
  // retouche 10/11: the seam's lift-off over 1,8 s, not 1,0 (qa: heurté 111,6) — same poses, same state, slower
  const OUT = { before: 1.8 };
  const tOut = onFrame(tEnd) - OUT.before;
  shot(tConc, tOut - tConc, N1, "sine.inOut", N1C.d); //              back to VIEW.n1: the seam leaves from it
  seam(D, "c12", "out", OUT);
}
