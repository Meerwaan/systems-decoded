// c2 · « La règle N-1 » de « Ce n'est pas de la théorie », « Une ligne à couper pour un paquebot », « 21 h 38 » jusqu'à « …pendant trente et une minutes »
// HAND.c12 (≈ 111,82) → HAND.c23 (report − 0,15 ≈ 228,86). The plan, phrase by phrase: docs/L06-actes.md § c2 (the common top first). Journal: docs/journal/L06-c2.md.
// Every instant is read off the script (D.at). A cut inside a place gives what changes; a cut from place to place gives a
// COMPLETE state (AT.*); never a number a running tween carries. The camera rides D.path between cuts: it never stops.
// Punches: `coupee` (chapter « Une ligne à couper… ») and `horsTension` (chapter « 21 h 38 ») — one per chapter.
import { SET, AT, VIEW, SHARP, CLOSE, span, seam, onFrame, cardAt } from "./world.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

export default function ({ D, world, co }) {
  const { at, st, now, shot, cut, path, punch } = D;
  const [, tEnd] = span(D, "c2");
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame, a few frames before its words
  const MA = world.europe.A; // the maquette's anchors (callouts)

  /* ───────── « Ce n'est pas de la théorie : trois ans plus tôt, presque toute l'Italie s'est éteinte. » ───────── */
  // the seam: the camera lifts off c1's N-1 mesh and flies on, south over the Alps, onto Italy (D.match, "in" half)
  const r0 = seam(D, "c12", "in", { state: { ...AT.carte, era: 2 } });
  const tR0 = onFrame(at("italie-0.15")) + 1.5; // HAND.c12.opt.after: where the seam's move hands over
  st(at("italieW") - 0.3, 1.4, { italy: 1 }, "power1.inOut"); //         the boot goes dark, north to south
  fact(D.tl, { id: "c2-italie", k: "Italie · 2003", v: "PLUS DE 50 MILLIONS", s: "de personnes dans le noir", tone: "signal", from: at("italie2") + 0.15, to: at("italie2$") - 0.05 });
  const tRoue = F("roue", -0.13);
  path([[tR0, r0], [at("italie2"), { ...VIEW.italy, d: 300 }], [tRoue, { ...VIEW.italy, d: 268, az: 16 }]]);

  /* ───────── « Le N moins un, c'est la roue de secours. Et chaque gestionnaire la vérifie… dans sa zone. » ───────── */
  // cut inside the CARTE (forme: the dark boot → the lit areas)
  const Z0 = { ...VIEW.zonesDE, az: 4, d: 290 }; // retouche 10/11: a wider start, the push carries the whole beat (no quasi-fixed stretch)
  cut(tRoue, null, Z0, { italy: 0, era: 0, zones: 1, zoneLit: 0, scan: 0 });
  now(at("saZone") - 1.06, { zoneLit: 4 });
  st(at("saZone") - 1.06, 1.8, { scan: 1 }, "power1.inOut"); //          every sweep stops at its own border

  /* ───────── « Et si la roue de secours ne suffit pas ? Il reste une toute dernière défense. Cachée près de chez toi. Et ce soir-là… elle va servir. » ───────── */
  const tPoste = F("cachee", -0.33);
  st(at("derniere") + 0.2, 1.0, { zones: 0 }, "sine.inOut"); //          the areas fade as we fly to France
  st(at("derniere") + 1.4, 0.8, { you: 1 }, "sine.out"); //               your dot comes up ahead
  st(at("defense") - 0.3, 0.6, { relays: 1 }, "power2.out"); //           the relays of the postes sources: veille points, watching
  // retouche 10/11: the 2.4 s flight Germany → France was jerky (60 °/s at 124.7): a cut on « Il reste… » instead
  const tYou = F("derniere", 1.68); //                                    « Il reste une toute dernière défense »
  path([[tRoue, Z0], [at("saZone") - 1.06, { ...VIEW.zonesDE, az: -6, d: 252 }], [at("derniere"), { ...VIEW.zonesDE, az: -14, d: 222 }], [tYou, { ...VIEW.zonesDE, az: -18, d: 208 }]]);
  const YOU0 = { ...VIEW.youMap, d: 112, az: -18, el: 36, ...SHARP };
  cut(tYou, null, YOU0, {}); //                                           cut inside the CARTE: the areas → your corner of France
  path([[tYou, YOU0], [at("defense") - 0.6, { ...VIEW.youMap, d: 92, az: -26, el: 32, ...SHARP }], [tPoste, { ...VIEW.youMap, d: 74 }]]);
  // cut place → place (lumière: your veille dot → the relay's veille light), the poste source at night
    const CELLS = { ...VIEW.cellsQ, tx: 6960, ty: 120, tz: -730, az: -32, el: 8 }; // the hero's row (solid) and the glass row beside it
  const POSTE0 = { ...CELLS, d: 1150, az: -38, ...SHARP };
  cut(tPoste, SET.QUARTIER, POSTE0, { ...AT.quartier, era: 0 }, { fade: 0.2 });
  const tCard = onFrame(cardAt(D, "papenburg"));
  // the push goes on through the breath of the mid-roll (130,1): nothing new, a slow move
  path([[tPoste, POSTE0], [at("servir"), { ...CELLS, d: 760 }], [tCard, { ...CELLS, d: 680 }]]);

  /* ═════════ « Une ligne à couper pour un paquebot » — the card (130,57), the thread, a dive into Papenburg ═════════ */
  const EMS0 = { ...VIEW.emsMap, d: 170, az: -40, el: 40, ...SHARP };
  cut(tCard, SET.CARTE, EMS0, { ...AT.carte, region: 1, era: 1 }, { fade: 0.2 });
  threadCall(D.tl, { from: tCard + 0.1, to: tCard + 2.5, text: "La dernière défense ? Elle attend." });
  const tHall = F("chantier", -0.27);
  co.add({ title: "Papenburg", sub: "Meyer Werft", x: 1180, y: 330, align: "start", anchor: MA.papenburg }).show(D.tl, tCard + 2.65).hide(D.tl, tHall - 0.3);
  path([[tCard, EMS0], [tCard + 2.6, { ...VIEW.emsMap, d: 80, az: -34, el: 34, ...SHARP }], [tHall, { ...VIEW.emsMap, d: 44, ...SHARP }]]);

  /* ───────── « Retour en arrière. À Papenburg… le chantier naval Meyer Werft termine un paquebot de croisière, le Norwegian Pearl. » ───────── */
  // place → place: the dot we dived into becomes the hall (centre of frame both sides)
  cut(tHall, SET.TERRAIN, VIEW.hallW, { ...AT.terrain, era: 1 }, { fade: 0.2 });
  /* « Le chantier est loin de la côte. Pour gagner la mer, chaque navire doit descendre l'Ems. Et au-dessus de la rivière passe une double ligne à 380 000 volts. » */
  const tTower = F("coupe", -0.15);
  // retouche 10/11: no more wide flight down the river (the hall read as a wire slab at 144): a cut on « Et au-dessus… »
  // to the ship's dotted outline on the Ems, in profile, the line above it — then the glide to the two towers
  const tShipL = F("riviereW", -0.87);
  path([
    [tHall, VIEW.hallW],
    [at("pearl"), { ...VIEW.shipC, d: 42000 }],
    [at("ems") + 0.2, { ...VIEW.shipC, d: 36000, az: -20, el: 8 }],
    [tShipL, { ...VIEW.shipC, d: 30000, az: -6, el: 7 }],
  ]);
  const SHIPL = { ...VIEW.crossing, tx: 0, ty: 6000, tz: 28000, d: 66000, az: 55, el: 8 }; // verified (planche e2 « G »)
  cut(tShipL, null, SHIPL, { pass: 0.2 });
  st(tShipL, tTower - 0.1 - tShipL, { pass: 0.24 }, "none"); //          the outline drifts toward the span (under: 0.25)
  path([
    [tShipL, SHIPL],
    [at("volts") - 0.7, { ...VIEW.crossing, d: 52000 }], //               the two towers, the span over the water
    [tTower, { ...VIEW.crossing, d: 46000, el: 4 }],
  ]);
  fact(D.tl, { id: "c2-volts", k: "La double ligne", v: "380 000 VOLTS", from: at("volts") - 1.3, to: at("ems$") - 0.02 });

  /* ───────── « Des pylônes de 84 mètres. Pour laisser passer le navire dessous… la ligne doit être coupée. » ───────── */
  cut(tTower, null, VIEW.tower, {}); //                                    forme: the span → the tower that carries it
  const tUnder = F("dessousW", -0.42);
  shot(tTower, tUnder - tTower, { ...VIEW.tower, ty: 6200, el: 6, d: 20000 }, "none"); // a slow tilt up the 84 m
  fact(D.tl, { id: "c2-84", k: "Les pylônes", v: "84 MÈTRES", from: at("m84") - 0.7, to: tUnder - 0.2 });
  // the ghost outline glides toward the wires (lit ink: L06-actes-maj § 8 — `under` reads better with emsCut 0)
  cut(tUnder, null, VIEW.under, { pass: 0.25, gap: 0 });
  st(tUnder, at("riviere") - 0.25 - tUnder, { pass: 0.46 }, "none"); //  the outline nears the span, not yet under it
  st(at("dessousW"), 0.6, { gap: 1 }, "power2.out"); //                 the clearance: a signal bracket (thumbnail n° 1 here)
  st(at("coupee") - 0.75, 1.25, { emsCut: 2 }, "power1.inOut"); //      « …doit être coupée » : both circuits die along the span (retouche: softer, ends before tRiv)
  punch(at("coupee"), 0.06);
  shot(tUnder, at("riviere") - 0.14 - tUnder, { ...VIEW.under, d: 42000 }, "none");

  /* ───────── « Une rivière en Allemagne, une ligne coupée… et ta lumière, ce soir-là, en dépend déjà. » ───────── */
  // place → place (tête de lumière: from the line to your home) — the map keeps the line dead, as the sentence says
  const tRiv = F("riviere", -0.14);
  const EMS1 = { ...VIEW.emsMap, d: 80, ...SHARP }; //                   retouche: starts higher, the pull-back to France was 84 °/s at 156
  cut(tRiv, SET.CARTE, EMS1, { ...AT.carte, region: 1, era: 1, emsCut: 2 }, { fade: 0.2 });
  st(at("riviere") + 1.26, 3.0, { thread: 1 }, "sine.inOut"); //         a head that runs Papenburg → … → you
  st(at("depend") - 0.1, 0.5, { you: 1 }, "sine.out");
  const tDem = F("demande", -0.1);
  path([[tRiv, EMS1], [at("riviere") + 1.0, { ...VIEW.emsMap, d: 132, az: -32, ...SHARP }], [at("depend") + 0.3, { ...VIEW.france, d: 292 }], [tDem, { ...VIEW.france, d: 285 }]]);

  /* ───────── « Le chantier demande la coupure pour le 5 novembre, à une heure du matin. Les voisins font leurs calculs : très chargé… mais sûr. » ───────── */
  const Z1 = { ...VIEW.zonesDE, az: 4, d: 272 }; //                     retouche: a wider start, a push that does not stall
  cut(tDem, null, Z1, { thread: 0, zones: 1, zoneLit: 0, scan: 0, region: 0, emsCut: 0 });
  fact(D.tl, { id: "c2-prevu", k: "Prévu", v: "5 NOVEMBRE · 1 H DU MATIN", from: at("demande") + 0.5, to: at("demande") + 3.5 });
  now(at("sur") - 2.4, { zoneLit: 2 });
  st(at("sur") - 2.4, 1.1, { scan: 1 }, "power1.inOut");
  now(at("sur") - 1.2, { zoneLit: 3, scan: 0 }); //                     the RWE sweep has ended (− 1.3): TenneT's begins
  st(at("sur") - 1.2, 1.1, { scan: 1 }, "power1.inOut");

  /* ───────── « Puis, la veille, vers midi, nouvelle demande : avancer de trois heures. Au samedi soir… à 22 h. » ───────── */
  const tEon = F("eon", -0.15);
  // retouche 10/11: the 13 s single view is split — a cut on « Puis… » to the Ems line, where the request moves
  const tAv = F("avance", -0.15);
  path([[tDem, Z1], [at("sur") - 1.2, { ...VIEW.zonesDE, az: -10, d: 232 }], [tAv, { ...VIEW.zonesDE, az: -16, d: 214, el: 50 }]]);
  const AV0 = { ...VIEW.emsMap, d: 130, az: -12, el: 44, ...SHARP };
  cut(tAv, null, AV0, {});
  path([[tAv, AV0], [at("samedi"), { ...VIEW.emsMap, d: 98, az: -20, el: 40, ...SHARP }], [tEon, { ...VIEW.emsMap, d: 76, az: -26, el: 36, ...SHARP }]]);
  fact(D.tl, { id: "c2-avance", k: "Avancé", v: "SAMEDI 4 · 22 H", tone: "signal", from: at("samedi") - 1.7, to: at("avance$") - 0.08 });

  /* ───────── « E.ON Netz, qui gère la ligne, refait le calcul sur son réseau. Ça passe. Mais ses deux voisins, RWE et TenneT… ne sont pas prévenus. » ───────── */
  cut(tEon, null, { ...VIEW.zonesDE, az: -12 }, { zoneLit: 1, scan: 0 }); // forme: back to the areas
  st(at("refait"), 1.54, { scan: 1 }, "power1.inOut"); //                 E.ON's sweep stops at its border; RWE and TenneT stay dark
  const t19 = F("dixneuf", -0.12);
  path([[tEon, { ...VIEW.zonesDE, az: -12 }], [at("passe"), { ...VIEW.zonesDE, az: -22, d: 232 }], [t19, { ...VIEW.zonesDE, az: -34, d: 205 }]]);

  /* ───────── « Ils l'apprendront le soir même. À 19 h. Trois heures avant. » ───────── */
  const CALL = { ...VIEW.zonesDE, tx: -22, tz: -120, d: 150, az: -22, el: 60 }; // the two dispatch areas, from above
  cut(t19, null, CALL, { era: 0 });
  now(at("dixneuf"), { clockOn: 1 }); //                                  19:00:00
  st(at("dixneuf") + 0.6, 1.2, { phone: 1 }, "sine.inOut"); //           the call leaves toward the two neighbours
  now(at("dixneuf") + 1.0, { zoneLit: 4 });
  fact(D.tl, { id: "c2-19h", k: "Prévenus", v: "À 19 H", s: "trois heures avant", tone: "signal", from: at("dixneuf") + 1.0, to: at("dixneuf$") - 0.1 });

  /* ───────── « Et ailleurs, il y a un détail. Une autre ligne : Landesbergen–Wehrendorf. Un bout chez E.ON, l'autre chez RWE. » ───────── */
  now(at("detail") - 0.02, { clockOn: 0 });
  st(at("lwW") - 0.4, 0.6, { region: 1 }, "power2.out"); //              the story's lines drawn thick: L–W reads
  st(at("detail") + 0.2, 1.4, { zones: 0 }, "sine.inOut"); //          close up, the tint would wash the frame: the callouts name the two ends
  co.add({ title: "Landesbergen", sub: "E.ON", x: 1240, y: 300, align: "start", anchor: MA.landesbergen }).show(D.tl, at("lwW") + 0.1).hide(D.tl, at("unBout") + 0.05);
  co.add({ title: "Wehrendorf", sub: "RWE", x: 640, y: 300, align: "end", anchor: MA.wehrendorf }).show(D.tl, at("unBout") + 0.25).hide(D.tl, at("detail$") - 0.15);
  const tBench = F("detail2", -0.14);
  path([
    [t19, CALL],
    [at("detail"), { ...CALL, d: 124, az: -10 }],
    [at("lwW") - 0.2, { ...VIEW.lwMap, d: 44 }],
    [tBench, { ...VIEW.lwMap, d: 35, az: -22 }],
  ]);

  /* ───────── « À chaque bout un relais de protection. Et ces deux relais… ne sont pas réglés pareil. » ───────── */
  // place → place (forme: the line, same slope, the east on the right) — no figures: markRwe 0, markEon 0
  const LW0 = { ...VIEW.lwWide, d: 540 };
  cut(tBench, SET.BENCH, LW0, { ...AT.lw, era: 0 }, { fade: 0.2 });
  now(at("relais2") - 0.1, { lwNamed: 2 });
  now(at("relais2") + 0.8, { lwNamed: 1 });
  now(at("pareil") - 1.0, { lwNamed: 0 });
  const tCard3 = onFrame(cardAt(D, "coupure"));
  path([[tBench, LW0], [at("relais2") + 0.6, { ...VIEW.lwWide, d: 490, az: -10, el: 9 }], [at("pareil"), VIEW.twoDials], [tCard3, { ...VIEW.twoDials, d: 362 }]]);

  /* ═════════ « 21 h 38 : la règle N-1 ne tient plus » — the card (194,07): the plain, the wind farm ═════════ */
  // « Samedi soir. On consomme peu. Mais le vent souffle sur le nord de l'Allemagne, et l'électricité file d'est en ouest. »
  const PLAIN0 = { ...VIEW.plain, d: 72000, ...SHARP }; // the corridor under the wind farm (the machines stay small: a known weak pose)
  cut(tCard3, SET.TERRAIN, PLAIN0, { ...AT.terrain, era: 0 }, { fade: 0.2 });
  const tWest = F("estOuest", -1.33);
  path([[tCard3, PLAIN0], [at("vent"), { ...PLAIN0, tx: 136000, d: 68000 }], [tWest, { ...PLAIN0, tx: 122000, d: 66000 }]]);
  // place → place (mouvement: the wind and the dashes go the same way, west): the map, low, the dashes flying west
  const LOW0 = { ...VIEW.mapWide, tx: 10, d: 640, el: 26 };
  cut(tWest, SET.CARTE, LOW0, { ...AT.carte, era: 0 }, { fade: 0.2 });

  /* ───────── « C'est le week-end : des lignes sont déjà arrêtées pour travaux. Et sur tout le continent, 274 000 mégawatts sont produits. » ───────── */
  st(at("travauxW") - 0.2, 0.9, { region: 1 }, "sine.out");
  st(at("travauxW") - 0.2, 0.9, { works: 1 }, "power2.out"); //          two links out for the week-end, dark dashes
  const tTop = F("travauxW", 1.34);
  // retouche 10/11: the dive d 560 → 118 in 2.3 s was jerky (83 °/s at 203.6): a cut on « des lignes… », then a slow push
  const tDes = onFrame(at("travaux") + 0.85);
  path([[tWest, LOW0], [tDes, { ...LOW0, tx: -70, d: 520, az: -26 }]]);
  const REG0 = { ...VIEW.region, d: 150, az: -8 };
  cut(tDes, null, REG0, {});
  path([[tDes, REG0], [at("travauxW"), { ...VIEW.region, d: 118 }], [tTop, { ...VIEW.region, d: 104, az: -16 }]]);
  cut(tTop, null, { ...VIEW.mapTop, d: 780 }, { region: 0 }); //                        forme: the mesh → the whole continent, every rotor turning
  fact(D.tl, { id: "c2-mw", k: "Produits sur le continent", v: "274 000 MÉGAWATTS", from: at("mw274") - 1.46, to: at("travaux$") - 0.08 });
  const tCalc = F("calcul", -0.17);
  shot(tTop, tCalc - tTop, { ...VIEW.mapTop, d: 710, az: -16 }, "none");

  /* ───────── « 21 h 29. Dernier calcul chez E.ON Netz : aucune limite dépassée. » ───────── */
  cut(tCalc, null, { ...VIEW.zonesDE, az: -16 }, { zones: 1, zoneLit: 1, scan: 0 });
  now(at("calcul"), { clockOn: 1 });
  st(at("calcul") + 0.83, 2.2, { scan: 1 }, "power1.inOut");

  /* ───────── « Et le N moins un ? D'après le rapport, l'équipe le suppose respecté. Sans le calculer. » ───────── */
  // toward the mesh: the N-1 ghost does NOT run (n1ok 0, n1sim 0)
  st(at("suppose") - 0.25, 0.9, { zones: 0 }, "sine.inOut");
  st(at("suppose") - 0.25, 1.0, { region: 1 }, "sine.inOut");
  fact(D.tl, { id: "c2-suppose", k: "La règle N−1", v: "SUPPOSÉE", s: "sans calcul", tone: "signal", from: at("suppose") + 1.03, to: at("suppose$") - 0.08 });
  const tLine = F("premier", -0.12);
  path([[tCalc, { ...VIEW.zonesDE, az: -16 }], [at("suppose") - 0.4, { ...VIEW.zonesDE, az: -28, d: 222 }], [at("supposeW"), { ...VIEW.n1, d: 84 }], [tLine, { ...VIEW.n1, d: 74, az: -22 }]]);

  /* ───────── « 21 h 38 : premier circuit coupé. 21 h 39 : le second. La ligne est hors tension. » ───────── */
  // place → place (forme: the line, map → terrain), along the span: the head of the dying circuit runs back across it
  cut(tLine, SET.TERRAIN, VIEW.circuits, { ...AT.terrain, era: 0, clockOn: 1 }, { fade: 0.2 });
  st(at("ligneCoupee") - 0.19, 1.0, { emsCut: 1 }, "power1.inOut");
  st(at("second") - 0.1, 1.0, { emsCut: 2 }, "power1.inOut");
  punch(at("horsTension"), 0.06);
  const tDial = F("aiguille", -0.12);
  path([[tLine, VIEW.circuits], [at("second"), { ...VIEW.circuits, d: 45000, az: -14, el: 4 }], [tDial, { ...VIEW.crossing, d: 60000, az: 6 }]]);

  /* ───────── « Pour l'instant, l'aiguille est à cinquante. Elle ne bougera pas… pendant trente et une minutes. » ───────── */
  // place → place (rond: nothing moves but the camera) — the dial on the maquette's rim, the header shows 50,0 Hz
  cut(tDial, SET.CARTE, VIEW.dialMap, { ...AT.carte, era: 0, emsCut: 2, clockOn: 1, hzOn: 1 }, { fade: 0.2 });
  fact(D.tl, { id: "c2-31", k: "L'aiguille ne bougera pas", v: "31 MINUTES", from: at("bougera") + 0.3, to: at("aiguille$") - 0.1 });
  shot(tDial, onFrame(tEnd) - tDial, { ...VIEW.dialMap, d: 126, az: -102, el: 6, ...CLOSE }, "none"); // over at the c23 cut (c3 lays it)
}
