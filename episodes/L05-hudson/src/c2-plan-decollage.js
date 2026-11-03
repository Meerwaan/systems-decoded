// c2 · « La check-list » from « Il y a même un bouton », « 15 h 24 : le décollage », « La check-list faite pour un
// autre ciel » up to « …cet avion n'a pas » — HAND.c12 (114,80) → HAND.c23 (216,64, a CUT laid by c3).
// The plan, sentence by sentence: docs/L05-actes.md « c2 » (+ docs/L05-actes-maj.md); journal docs/journal/L05-c2.md.
// Every instant is read off the script (D.at). Each cut gives what changes; no number is carried by two tweens at once,
// and no cut sets a number that a running tween carries. `lock` and `track` only change on a cut; `high` glides ≥ 2 s.
// Ad break 3:06,6 (after « un seul mot »): the cockpit push goes on, nothing new.
import { SET, AT, HAND, VIEW, CLOSE, SHARP, seam, onFrame, cardAt } from "./world.js";
import { A320 } from "./plan.js";
import { fact, chipEl } from "@kit/long.js";

const E = A320.engine;
const DOOR = A320.doors.L1;

export default function ({ D }) {
  const { st, now, shot, cut, punch } = D;
  const A = (ref) => D.at(ref);
  const F = (ref, dt = 0) => onFrame(D.at(ref) + dt); // a cut ON a frame
  const T23 = onFrame(A(HAND.c23.at)); //                  c3 cuts here: everything of mine is over

  /* ═════════ 114,80 → 121,28 · « Il y a même un bouton… « amerrissage ». Il ferme les ouvertures… » ═════════ */
  const t0 = onFrame(A(HAND.c12.at));
  const OV = seam(D, "c12", "in", {
    set: SET.VOL,
    state: { ...AT.vol, clockOn: 0, countOn: 0, geese: 0, flame: 0, goose: 0, burn: 0 },
  });
  const tBelly = F("ouvertures", -0.33); //                ≈ 117,9
  shot(t0, tBelly - t0, { ...OV, d: 72, az: 70, el: -40 }); // a push onto the button: the ring comes on « amerrissage » //    a slow push onto the button, the ring around it
  now(A("ditch") - 0.1, { named: 9 }); //                  « amerrissage » : the ink ring (the button never lit)

  // under the glass belly: the openings under the waterline, marked, then shut
  // lock stays 1 (as in the cockpit): the plane level, its belly where the pose says — under it, from its right side, looking up
  const BELLY = { ...VIEW.belly, tx: 1000, ty: -180, tz: -100, d: 950, az: 160, el: -30 };
  cut(tBelly, null, BELLY, { named: 0, fs: 1200 });
  shot(tBelly, F("refonte", -0.17) - tBelly, { ...VIEW.belly, tx: 560, ty: -180, tz: -60, d: 1080, az: 150, el: -32 }); // along the belly, forward
  st(A("ouvertures") - 0.1, 0.6, { seal: 0.3 }, "power2.out"); //  « ouvertures » : marked ink
  st(A("ouvertures") + 1.0, 1.4, { seal: 1 }); //            their doors shut, before « flotte »

  /* ═════════ 121,67 → 126,88 · « En 2005, la check-list a même été refondue… tout au bout, dans la troisième partie. » ═════════ */
  const tQ = F("refonte", -0.17); //                        ≈ 121,5 — place → place (fade)
  cut(tQ, SET.BENCH, { ...VIEW.qrh, d: 70, az: -24, el: 58 }, { ...AT.bench, page: 1, named: 0 }, { fade: 0.2 });
  shot(tQ, F("paradoxe", -0.18) - tQ, { ...VIEW.qrh, d: 60, az: -10, el: 52 });
  st(A("refonte") + 1.3, A("toutAuBout") - 0.15 - (A("refonte") + 1.3), { page: 3 }); // the pages turn to the third part
  now(A("toutAuBout"), { named: 12 }); //                   « tout au bout » : the third tab
  fact(D.tl, { id: "c2-2005", k: "Check-list refondue", v: "2005", from: A("refonte") + 0.35, to: A("refonte") + 2.85 });

  /* ═════════ 127,28 → 133,20 · « Un plan complet, donc. Pensé pour une panne à plus de 6 000 mètres… de longues minutes. » ═════════ */
  const tHigh = F("paradoxe", -0.18); //                   ≈ 127,1
  const GLIDE = { n1L: 30, n1R: 30, burn: 0, goose: 0, flame: 0, geese: 0 };
  cut(tHigh, SET.VOL, { ...VIEW.skyHigh, az: 66, d: 7200 }, { ...AT.vol, ...GLIDE, high: 1, lock: 0, fs: 2000, clockOn: 0, countOn: 0, named: 0, page: 0 }, { fade: 0.2 });
  const tFaille = F("faille", -0.15); //                    ≈ 133,2
  shot(tHigh, tFaille - tHigh, { ...VIEW.skyHigh, az: 50, el: 10, d: 6400 }); // the camera rides the long glide

  /* ═════════ 133,34 → 138,00 · « Ce jeudi-là, l'avion vole sept fois plus bas. Et pour lire trois pages… il n'aura pas le temps. » ═════════ */
  const SIDE = { ...VIEW.skyHigh, tx: -300, ty: -400, d: 6000, az: 28, el: 14 }; // the same plane, the same place, from its side
  cut(tFaille, null, SIDE, {});
  const tDown = A("septFois") - 0.1;
  shot(tFaille, tDown - tFaille, { ...SIDE, az: 24, d: 5800 });
  shot(tDown, 3.4, { ...SIDE, ty: -900, d: 9800, az: 18, el: 22 }, "sine.inOut", 5800); // the ground comes up: pull back
  st(tDown, 2.4, { high: 0 });
  punch(A("septFois"), 0.06);
  now(A("pasLeTemps") - 0.1, { countOn: 1 }); //            « temps » : the countdown, a moment
  now(A("pasLeTemps") + 1.3, { countOn: 0 });

  /* ═════════ 138,08 → 142,80 · « Mais avant les oies, il y a un détail… et qui va compter. » ═════════ */
  const tDoor = F("avant:détail", -0.12); //                ≈ 139,9: along the fuselage to the front left door
  const DOORS = { ...VIEW.doors, tx: DOOR[0] + 650, d: 950, az: -26, el: 9 };
  cut(tDoor, null, DOORS, { lock: 1, fs: 900, n1L: 82, n1R: 82 });
  shot(tDoor, cardAt(D, "normal") - tDoor, { ...VIEW.doors, d: 880 }, "sine.out");
  st(A("remarque"), 0.7, { packs: 1 }, "power2.out"); //    « remarque » : the folded slide-raft, veille

  /* ═════════ 143,2 card « 15 h 24 : le décollage » · 144,11 → 150,28 « Jeudi 15 janvier 2009… moins sept degrés. » ═════════ */
  const tRun = onFrame(cardAt(D, "normal"));
  const GROUND = { track: 1494, gearDown: 1, airports: 1, cold: 1, n1L: 25, n1R: 25, lock: 0, fs: 2000, packs: 0 };
  cut(tRun, null, { ...VIEW.runway, az: -136, d: 7600 }, GROUND, { fade: 0.2 });
  const tCab = F("charlotteW", -0.2); //                     ≈ 152,8
  const tCold = F("normal:Dehors", -0.12); //                ≈ 148,2 — retouche 02/11: the long still frame split, an axial cut closer
  shot(tRun, tCold - tRun, { ...VIEW.runway, az: -118, d: 6300, el: 6 }); // an orbit at the threshold
  const RUN2 = { ...VIEW.runway, ty: -200, az: -118, d: 4300, el: 12 }; //   higher: the lit runway fills the bottom of the frame
  cut(tCold, null, RUN2, {});
  shot(tCold, tCab - tCold, { ...RUN2, az: -102, d: 3600, el: 10 }); // a push and a turn round the plane
  fact(D.tl, { id: "c2-froid", k: "Dehors", v: "MOINS 7 DEGRÉS", from: A("moins7") - 0.2, to: A("vol") + 1.4 });

  /* ═════════ 150,76 → 156,04 · « Vol US Airways 1549 pour Charlotte. 150 passagers, cinq membres d'équipage. » ═════════ */
  const CAB = { ...VIEW.cabin, tx: 300, d: 3100, az: 24 };
  const CAB2 = { ...VIEW.cabin, tx: -500, d: 2700, az: 30 };
  const CAB3 = { ...VIEW.cabin, tx: -700, d: 2550, az: 32 };
  cut(tCab, null, CAB, { pax: 1, cabin: 0.8 }); //            the same fuselage, from above: its rows
  const tCock = F("cockpit", -0.12); //                      ≈ 156,3
  shot(tCab, tCock - 0.6 - tCab, CAB2);
  fact(D.tl, { id: "c2-pax", k: "À bord", v: "150 PASSAGERS", s: "5 MEMBRES D'ÉQUIPAGE", from: A("passagers") - 0.25, to: tCock - 0.05 });

  /* ═════════ 156,43 → 165,08 · « Aux commandes, le commandant Chesley Sullenberger… c'est le copilote qui pilote. » ═════════ */
  const COCK = { ...VIEW.cockpit, d: 250, el: 11 };
  D.match(tCock, [CAB2, CAB3], [COCK, { ...COCK, d: 236 }], { state: { lock: 1, fs: 400, pax: 0 } }); // the travelling goes on, forward
  const tFO = A("cockpit:pour") - 0.2; //                    « Pour ce décollage… » : toward the right seat
  shot(tCock + 0.9, tFO - tCock - 0.9, { ...VIEW.cockpit, d: 226, az: 94, el: 10 });
  const tDoor2 = F("detail", -0.15); //                      ≈ 165,0
  shot(tFO, tDoor2 - tFO, { ...VIEW.cockpit, tz: -22, d: 205, az: 84, el: 9 }, "sine.out");
  chipEl("c2-cdt", { label: "Commandant", value: "CHESLEY SULLENBERGER" });
  chipEl("c2-fo", { label: "Copilote", value: "JEFFREY SKILES", color: "veille" });
  D.chip("c2-cdt", null, 470, 250, A("commandant") - 0.1, A("copilote") - 0.25);
  D.chip("c2-fo", null, 1130, 250, A("copilote") - 0.05, tDoor2 - 0.12);

  /* ═════════ 165,15 → 174,12 · « Et à l'avant, sur les portes… des radeaux. » « …personne ne les exige. Cet avion les a quand même. » ═════════ */
  cut(tDoor2, null, { ...VIEW.doors, tx: DOOR[0] + 120, d: 1000, az: -30, el: 7 }, { lock: 1, fs: 900, packs: 0.45, pilots: 1 });
  const tMap = F("detail2", -0.12); //                       ≈ 169,0
  shot(tDoor2, tMap - tDoor2, { ...VIEW.doors, d: 800, az: -20, el: 8 });
  st(A("toboggans") - 0.1, 0.6, { packs: 1 }, "power2.out");
  // the maquette: the planned route to Charlotte, over the land
  cut(tMap, SET.CARTE, { ...VIEW.mapPlan, d: 1850, az: 4 }, { ...AT.carte, track: 1494, gearDown: 0, charlotte: 0, clockOn: 0, countOn: 0 }, { fade: 0.2 });
  const tBack = F("detail2:Cet", -0.12); //                  « Cet avion les a quand même. »
  shot(tMap, tBack - tMap, { ...VIEW.mapPlan, d: 1650, az: 12 });
  st(tMap + 0.35, A("exige") - 0.2 - (tMap + 0.35), { charlotte: 1 }); // the route runs south-west, over the land
  const DOOR3 = { ...VIEW.doors, tx: DOOR[0], d: 760, az: -17, el: 8 };
  cut(tBack, SET.VOL, DOOR3, { ...AT.vol, ...GROUND, lock: 1, fs: 900, packs: 1, geese: 0, flame: 0, goose: 0, burn: 0, clockOn: 0, countOn: 0 }, { fade: 0.2 });
  const tLGA = F("decolle", -0.1); //                        ≈ 174,1
  shot(tBack, tLGA - tBack, { ...DOOR3, d: 700, az: -14 }, "sine.out");

  /* ═════════ 174,20 → 178,52 · « 15 h 24 min 54 s, décollage autorisé, piste quatre. » ═════════ */
  // the maquette: the glyph leaves runway 4, its track drawn as it flies (fast motion: the clock runs 133 s in 4.4 s)
  cut(tLGA, SET.CARTE, { ...VIEW.mapLGA, d: 950, az: 34 }, { ...AT.carte, track: -1, route: -1, glyph: 1, charlotte: 0, clockOn: 1, countOn: 0 }, { fade: 0.2 });
  const tChase = F("monte", -0.2); //                        ≈ 178,4
  shot(tLGA, tChase - tLGA, { ...VIEW.mapLGA, tx: 455, tz: -330, d: 900, az: 22, el: 42 });

  /* ═════════ 178,60 → 183,64 · « 15 h 27 min 07 s, la check-list d'après décollage est terminée. Tout est normal. » ═════════ */
  const CH = { ...VIEW.chase, tx: -500, az: 58, el: 11, d: 5400 }; // lock 1: the plane level, the world banks and climbs
  cut(tChase, SET.VOL, CH, { ...AT.vol, track: -1, gearDown: 0, n1L: 90, n1R: 90, geese: 0, flame: 0, goose: 0, burn: 0, lock: 1, fs: 2000, clockOn: 1, countOn: 0 }, { fade: 0.2 });
  const tC2 = F("unmot", -0.1); //                           ≈ 183,7
  shot(tChase, tC2 - tChase, { ...VIEW.chase, tx: -600, az: 70, el: 9, d: 4900 });

  /* ═════════ 183,78 → 186,36 · « Trois secondes plus tard, le commandant dit un seul mot. »  — AD BREAK 3:06,6 ═════════ */
  const C1 = { ...VIEW.cockpit, d: 240, az: 88, el: 9 };
  cut(tC2, null, C1, { lock: 1, fs: 400 });
  const tCard = onFrame(cardAt(D, "birds")); //               187,0: the card, under it the same cockpit, closer
  shot(tC2, tCard - tC2, { ...VIEW.cockpit, d: 228, az: 90, el: 10 }, "sine.out"); // a very slow push, through the break
  st(A("unmot") + 0.6, 1.4, { geese: 0.3 }); //              far ahead, a dark scatter
  punch(A("unSeul"), 0.06);

  /* ═════════ 187,0 card « La check-list faite pour un autre ciel » · 187,92 → 191,84 « « Birds. »… droit devant. » ═════════ */
  const C2 = { ...VIEW.cockpit, ...SHARP, ty: 64, fov: 48, el: 4 };
  cut(tCard, null, C2, {}); //                                 the same place, a longer lens (an axial cut)
  const tHit = F("lesImpacts", -0.3); /* in the breath before « Les » (qa 02/11) */ //                    the boom
  shot(tCard, tHit - tCard, { ...VIEW.cockpit, ty: 66, fov: 42, el: 2, d: 214 });
  st(A("oiseaux") - 0.1, 1.1, { geese: 0.6 }); //              the flock fills the windshield

  /* ═════════ 192,38 → 196,96 · « 15 h 27 min 11 s. Les impacts. À 860 mètres du sol. » ═════════ */
  now(A("impact"), { countOn: 1 }); //                        the countdown, for good
  const H1 = VIEW.hook1;
  cut(tHit, null, { ...H1, d: 1300 }, { lock: 0, geese: 1, flame: 1, goose: 1, burn: 1, n1L: 82, n1R: 82, fs: 2000 });
  st(tHit + 0.1, 1.5, { flame: 0.5 });
  const tPull = F("impact:À", -0.15); //                      « À 860 mètres du sol »: a CUT out to the city (retouche 02/11: the ×5,4 pull-back jerked)
  shot(tHit, tPull - tHit, { ...H1, d: 1400, az: 60 }, "sine.out");
  const tH4 = F("poids", -0.12); //                            ≈ 197,4
  const WIDE = { ...VIEW.hook6, tx: -1800, d: 7250, az: 67, el: 12.5, side: 0 }; // the same plane, above it, the ground far below
  cut(tPull, null, WIDE, {});
  shot(tPull, tH4 - 0.15 - tPull, { ...WIDE, d: 7600, az: 68, el: 13 }); // a slow drift back

  /* ═════════ 197,51 → 201,92 · « Ces bernaches pèsent environ 3,6 kg chacune. Au moins deux entrent dans chaque moteur. » ═════════ */
  // back in the nacelle of the first frame (hook4): the goose in the core, the fire
  cut(tH4, null, { ...VIEW.hook4, d: 470, az: 24 }, { lock: 1, fs: 700 });
  const tGun = F("certif", -0.12); //                          ≈ 202,2
  shot(tH4, tGun - tH4, { ...VIEW.hook4, d: 410, az: 34, el: 13 });
  fact(D.tl, { id: "c2-poids", k: "Une bernache", v: "≈ 3,6 KILOS", tone: "signal", from: A("pesent") - 0.1, to: A("poids:Au") - 0.1 });

  /* ═════════ 202,31 → 206,00 · « Le gros oiseau de leurs essais de certification pesait 1,8 kg. La moitié. » ═════════ */
  const CMP = { ...VIEW.gun, tx: -470, ty: 100, tz: 185, d: 330, az: -40, el: 13 }; // the two birds, the engine behind them
  cut(tGun, SET.BENCH, CMP, { ...AT.stand, birdCmp: 1, gun: 0, clockOn: 1, countOn: 1 }, { fade: 0.2 });
  const tRec = F("recul", -0.15); //                           ≈ 206,3
  shot(tGun, tRec - tGun, { ...CMP, d: 290, az: -32, el: 12 });
  fact(D.tl, { id: "c2-essai", k: "Essai de certification", v: "1,8 KILO", from: A("certif") + 0.5, to: A("moitie") - 0.25 });
  punch(A("moitie"), 0.06, { up: 0.08, hold: 0.14, down: 0.32 }); // over before the cut

  /* ═════════ 206,45 → 211,84 · « Les deux moteurs perdent presque toute leur poussée. Le gauche… 35 %. Le droit à 15 %. » ═════════ */
  const BACK = { ...VIEW.chase, tx: -400, ty: -200, az: 80, el: 4, d: 3300 }; // from behind: the two exhausts
  cut(tRec, SET.VOL, BACK, { ...AT.hit, n1L: 82, n1R: 82, flame: 0.5, burn: 1, goose: 1, gen: 1, geese: 0, lock: 1, fs: 2000, clockOn: 1, countOn: 1 }, { fade: 0.2 });
  const tRup = F("rupture", -0.14); //                          ≈ 212,1
  shot(tRec, tRup - tRec, { ...VIEW.chase, tx: -400, ty: -200, az: 92, el: 5, d: 3000 });
  st(A("recul") + 0.3, 2.0, { n1L: 35, n1R: 15, burn: 0.35 }, "power2.out");
  st(A("recul") + 0.3, 1.6, { flame: 0 });
  fact(D.tl, { id: "c2-g", k: "Moteur gauche", v: "35 %", tone: "signal", from: A("pctG") - 0.1, to: A("pctD") - 0.2 });
  fact(D.tl, { id: "c2-d", k: "Moteur droit", v: "15 %", tone: "signal", from: A("pctD") - 0.1, to: tRup - 0.05 });

  /* ═════════ 212,24 → 216,32 · « Le plan prévu, c'est la check-list. Et elle suppose trois choses que cet avion n'a pas. » ═════════ */
  cut(tRup, SET.BENCH, { ...VIEW.qrh, d: 74, az: -6, el: 60 }, { ...AT.bench, page: 1, named: 0, clockOn: 1, countOn: 1 }, { fade: 0.2 });
  shot(tRup, T23 - 0.05 - tRup, { ...VIEW.qrh, d: 58, az: -18, el: 54 });
  now(A("troisChoses"), { named: 10 }); //                      « trois » : the three tabs, one, two, three
  now(A("troisChoses") + 0.32, { named: 11 });
  now(A("troisChoses") + 0.64, { named: 12 });

  // one written thing at a time: no keyword while a figure or a name is up
  D.quiet(A("refonte"), A("refonte") + 3);
  D.quiet(A("moins7") - 0.3, tCock);
  D.quiet(A("commandant") - 0.2, tDoor2);
  D.quiet(A("pesent") - 0.2, tRup);
}
