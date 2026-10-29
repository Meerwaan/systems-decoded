// c3 · « 853 personnes dans le noir », « Manchester, 1985 : la fumée » — HAND.c23 (161,59) → HAND.c34 (272,06).
// docs/L03-actes.md, c3 ; journal docs/journal/L03-c3.md.
// Every instant is read off the script (D.at). Every cut gives a COMPLETE state (AT.* + what differs), and no number is
// moved by two tweens at once: each tween ends before the next one on the same number, and before any cut that resets it.
// `run` never moves across a cut; `evac` only grows inside a shot (≈ 1/40 per second at most: avion.js).
import { SET, AT, HAND, VIEW, CLOSE, SHARP, benchLight, seam, onFrame } from "./world.js";
import { ITEM, PLANES } from "./plan.js";
import { fact } from "@kit/long.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const doorX = (plane, id) => plane.doors.find((d) => d[0] === id)[1];
const M1 = doorX(PLANES.a380, "M1"); //  the A380's first main-deck door
const U1 = doorX(PLANES.a380, "U1"); //  its first upper-deck door
const D737 = doorX(PLANES.b737, "1"); // the 737's front doors
const R737 = PLANES.b737.r;

export default function ({ D }) {
  const { at, st, now, shot, cut, match, punch } = D;
  const A = (ref) => at(ref);
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame

  /* complete states, one per place */
  const a380 = (x = {}) => ({ ...AT.hangar, variant: 1, doorA: 0, shut: 0, evac: 0, hurt: 0, ...x }); // the A380 in the trial hangar
  const man = (x = {}) => ({ ...AT.manchester, ...x }); //                                                   the 737 at Manchester
  const nar = (x = {}) => ({ ...AT.narrow, fire: 0.8, smoke: 0, mood: 1, ...x }); //                         the 737 inside, the fire behind its windows
  const docState = (x) => ({ ...AT.bench, ...benchLight(ITEM.DOC), ...x });
  const DOC = { ...VIEW.doc, ...SHARP };

  /* ───────── 161,59 → 172,2 · « Prends le plus gros avion de ligne du monde : l'A380. Hambourg, 2006. À bord, 853 passagers… Dans le noir. » ───────── */
  // the pull-back and the rise of c2 go on across the dip: the A350 has become the A380, its doors still shut
  const tSeam = onFrame(A(HAND.c23.at));
  const p0 = seam(D, "c23", "in", { set: SET.PISTE, state: a380({ lights: 0, pax: 0 }) });
  now(tSeam, { step: 2, chronoOn: 0, chrono: 0 });
  const t1 = tSeam + HAND.c23.opt.after;
  // three quarters from the front, high enough to read both decks, wide enough for the four engines
  const WIDE = { ...P, ...SHARP, tx: -600, ty: 600, tz: 0, d: 8800, az: -40, el: 6 };
  const tWide = A("a380:hambourg") + 0.9;
  shot(t1, tWide - t1, WIDE, "sine.inOut", p0.d); //            the pull-back reveals the two decks
  st(A("a380:l'a380") - 0.1, 0.6, { lights: 1 }); //            « l'A380 » : both rows of windows light up
  fact(D.tl, { id: "c3-hambourg", k: "Hambourg", v: "2006", from: A("a380:hambourg") - 0.1, to: A("a380$") + 0.3 });
  const tHigh = F("bord:portes", -0.35); //                      just before « huit portes »
  shot(tWide, tHigh - tWide, { ...WIDE, d: 8400, az: -32, el: 7 }); // a slow orbit along the flank
  st(A("bord:passagers") - 0.1, 1.2, { pax: 1 }); //            « 853 passagers » : the heads fill both decks
  fact(D.tl, { id: "c3-bord", k: "À bord", v: "853", s: "passagers + l'équipage", from: A("bord:passagers") - 0.1, to: A("bord:noir") - 0.05 });
  st(A("bord:noir"), 0.25, { lights: 0 }); //                    « Dans le noir » : emergency lights only

  /* ───────── 172,2 → 175,4 · « Et huit portes condamnées sur seize. Top. » ───────── */
  // the right flank from the front, close: its doors on both decks (the ones that will be condemned), two rows of windows
  const HIGH = { ...P, ...SHARP, tx: -2400, ty: 550, tz: -350, d: 3900, az: -135, el: 4 };
  cut(tHigh, null, HIGH, a380({ pax: 1, lights: 0 }));
  const tLow = F("a380go", -0.13);
  shot(tHigh, tLow - tHigh, { ...HIGH, d: 3500, az: -140, el: 5 });
  st(A("bord:condamnées"), 0.5, { shut: 1 }); //                 « condamnées » : the eight right doors barred
  now(A("top2"), { chronoOn: 1, chrono: 0 }); //                 « Top » : the chrono runs (compressed)
  st(A("top2"), A("a380end") - 0.02 - A("top2"), { chrono: 78 }, "none");
  now(A("a380end") + 0.3, { chrono: -78 }); //                    78 s, stopped, veille

  /* ───────── 175,4 → 180,4 · « Les toboggans jaillissent… et le dernier touche le sol en 78 secondes. Douze secondes d'avance. » ───────── */
  // low on the left flank: the main-deck slides and, starting higher, the long steep upper-deck ones
  const SIDE = { ...P, ...SHARP, tx: -2200, ty: 450, tz: 1000, d: 4800, az: -50, el: 6 };
  cut(tLow, null, SIDE, a380({ pax: 1, lights: 0, shut: 1 }));
  const tUp = F("debit", -0.12);
  shot(tLow, tUp - tLow, { ...SIDE, d: 4400, az: -46 });
  st(A("a380go"), 1.2, { doorA: 1 }, "power2.out"); //           « jaillissent » : the eight left slides
  st(A("a380go") + 1.0, tUp - 0.05 - (A("a380go") + 1.0), { evac: 0.1 }, "none"); // the figures slide down
  punch(A("a380end"), 0.05);
  fact(D.tl, { id: "c3-avance", k: "Sur 90 secondes", v: "12 SECONDES", s: "d'avance", tone: "veille", from: A("top2:douze") - 0.1, to: tUp - 0.03 });
  now(tUp, { chronoOn: 0 });

  /* ───────── 180,4 → 184,0 · « En moyenne, plus d'une personne par seconde… à chaque porte. » ───────── */
  // an upper-deck slide in profile, the main-deck one below it: the figures one at a time, countable
  const UP = { ...P, ...SHARP, tx: U1 + 50, ty: 420, tz: 1300, d: 2800, az: -62, el: 6 };
  cut(tUp, null, UP, a380({ pax: 1, lights: 0, shut: 1, doorA: 1, evac: 0.1 }));
  const tDoc = F("debit:décembre", -0.25);
  shot(tUp, tDoc - tUp, { ...UP, d: 2650, az: -58 });
  st(tUp + 0.05, tDoc - 0.1 - (tUp + 0.05), { evac: 0.19 }, "none");

  /* ───────── 184,0 → 187,5 · « En décembre, l'Europe et les États-Unis lui donnent son certificat. » ───────── */
  cut(tDoc, SET.BENCH, DOC, docState({ doc: 5, docIn: 0, hl: 0 }), { fade: 0.2 });
  st(tDoc + 0.05, 0.8, { docIn: 1 }, "power2.out");
  st(A("debit:l'europe"), 0.4, { hl: 0.5 });
  st(A("debit:états-unis"), 0.4, { hl: 1 });
  const tFoot = F("blesses", -0.13);
  shot(tDoc, tFoot - tDoc, { ...DOC, tx: 3, d: 148, az: -4 });

  /* ───────── 187,5 → 190,5 · « Mais trente-trois blessés. Dont une jambe cassée. » ───────── */
  // close on the one seated at the foot of the first main-deck slide (≥ 40 % of the height), the slide's foot behind
  // her; seen from aft, off every walking lane (the figures walk away along +z): she turns signal on « blessés »
  const FOOT = { ...P, ...CLOSE, tx: M1 + 260, ty: 55, tz: 1500, d: 440, az: 110, el: 10, side: -200 };
  cut(tFoot, SET.PISTE, FOOT, a380({ pax: 1, lights: 0, shut: 1, doorA: 1, evac: 0.19 }), { fade: 0.2 });
  const tTwenty = F("cout", -0.13);
  shot(tFoot, tTwenty - tFoot, { ...FOOT, d: 410, az: 114 });
  st(tFoot + 0.05, tTwenty - 0.1 - (tFoot + 0.05), { evac: 0.26 }, "none");
  st(A("blesses:blessés") - 0.05, 0.5, { hurt: 1 }); //          « blessés »
  fact(D.tl, { id: "c3-blesses", v: "33", s: "blessés", tone: "signal", from: A("blesses:blessés") - 0.25, to: tTwenty - 0.05 });

  /* ───────── 190,5 → 196,2 · « Et ce n'est pas une exception : … presque un volontaire sur vingt en est ressorti blessé. » ───────── */
  // the row already begun (five standing) and close on them; the camera pulls back along it as the others stand
  const TW = { ...VIEW.twenty, ...SHARP, tx: -55, d: 190, side: -120 };
  cut(tTwenty, SET.BENCH, TW, { ...AT.bench, ...benchLight(ITEM.TWENTY), twenty: 0.25, oneIn: 0 }, { fade: 0.2 });
  const tDoc91 = F("rate1991", -0.13);
  shot(tTwenty, tDoc91 - tTwenty, { ...TW, tx: 15, d: 265 }); //  a slow travelling back along the row
  st(tTwenty + 0.1, A("cout:vingtaine") + 1.1 - (tTwenty + 0.1), { twenty: 1 }, "none"); // they stand up one by one
  st(A("cout:volontaire") + 0.3, 0.45, { oneIn: 1 }); //          « un volontaire sur vingt »
  fact(D.tl, { id: "c3-vingt", k: "Presque", v: "1 SUR 20", s: "ressorti blessé", from: A("cout:volontaire") + 0.5, to: tDoc91 - 0.05 });

  /* ───────── 196,2 → 202,1 · « En 1991, deux essais ratent le même jour. Et cette année-là, un volontaire est gravement blessé. » ───────── */
  const DOC91 = { ...DOC, d: 180, az: -16 };
  cut(tDoc91, null, DOC91, docState({ doc: 4, docIn: 0, hl: 0, mood: 1 })); // the row → the sheet, same place
  st(tDoc91 + 0.05, 0.8, { docIn: 1 }, "power2.out");
  st(A("rate1991:ratent"), 0.3, { hl: 0.06 }); //                « ratent » : the big words
  st(A("rate1991:année-là") - 0.1, 0.5, { hl: 0.5 });
  st(A("rate1991:gravement"), 0.5, { hl: 1 }); //                 « gravement blessé » : its own line
  punch(A("rate1991$") - 0.25, 0.05, { hold: 0.1, down: 0.35 }); // « blessé » — released before the cut
  const tDoc78 = F("calcul", -0.12);
  shot(tDoc91, tDoc78 - tDoc91, { ...DOC91, tx: 4, d: 138, az: -2 }); // a slow push that turns over the sheet

  /* ───────── 202,1 → 207,3 · « Depuis 1978, d'ailleurs, un calcul appuyé sur des essais peut remplacer le grand essai. » ───────── */
  const DOC78 = { ...DOC, d: 182, az: -26, el: 52 };
  cut(tDoc78, null, DOC78, docState({ doc: 4, docIn: 1, hl: 1, mood: 1 }));
  st(tDoc78 + 0.02, 0.3, { docIn: 0 }, "power2.in"); //           one sheet at a time: 1991 leaves…
  st(tDoc78 + 0.02, 0.3, { mood: 0 });
  now(tDoc78 + 0.34, { doc: 3, hl: 0 });
  st(tDoc78 + 0.36, 0.8, { docIn: 1 }, "power2.out"); //          …1978 slides in, at the same place
  st(A("calcul:calcul"), 0.5, { hl: 0.5 });
  st(A("calcul:remplacer"), 0.5, { hl: 1 });
  const tCalm = F("fumee", -0.13);
  shot(tDoc78, tCalm - tDoc78, { ...DOC78, d: 140, az: -8, el: 56 }); // a slow push that turns over the sheet

  /* ───────── 207,3 → 210,2 · « Mais dans ces essais, il n'y a ni feu, ni fumée. » ───────── */
  const HW = { ...VIEW.hangarWide, ...SHARP };
  cut(tCalm, SET.PISTE, HW, { ...AT.hangar, doorA: 1, shut: 1, evac: 0.3, pax: 1 }, { fade: 0.2 });
  const tSmoke = F("fumee:et", -0.12);
  shot(tCalm, tSmoke - tCalm, { ...HW, d: 10800, el: 19, az: -38 }, "sine.inOut", HW.d); // a slow pull-back, calm
  st(tCalm + 0.05, tSmoke - 0.1 - (tCalm + 0.05), { evac: 0.37 }, "none");

  /* ───────── 210,2 → 213,1 · « Et la fumée… c'est elle qui a tout changé. » (+ la carte « Manchester ») ───────── */
  // the trial's cabin in section, from the front at 80 cm (no head near the lens): the smoke starts to roll from the
  // ceiling over the volunteers and swallows the exit signs
  const C12 = { ...P, ...SHARP, tx: 600, ty: 150, tz: 0, d: 1000, az: -90, el: -4, fov: 34 };
  cut(tSmoke, SET.CABINE, C12, { ...AT.trial, cut: 1, smoke: 0.3, mood: 1 }, { fade: 0.2 });
  st(tSmoke + 0.05, 2.2, { smoke: 0.6 });
  st(A("fumee:changé") - 0.2, 0.6, { signs: 0.3 });
  const tCard = onFrame(A("manch1") - 0.9);
  const Ca = { ...C12, ty: 170, el: -6, d: 980 };
  shot(tSmoke, tCard - 0.6 - tSmoke, Ca);
  // under the card: a whip UPWARD on both sides — into the smoke, then down out of the morning sky onto the runway
  const Cb = { ...C12, ty: 215, el: -9, d: 960 };
  const MA = { ...P, ...SHARP, tx: -600, ty: 300, tz: 0, d: 2000, az: -50, el: 14 }; // close: the fuselage ≥ 40 % of the height
  const MB = { ...MA, el: 4 };
  match(tCard, [Ca, Cb], [MA, MB], { set: SET.PISTE, state: man({ run: 0 }), fade: 0.25 });
  now(tCard, { step: 3 });

  /* ───────── 213,1 → 221,6 · « Manchester, un matin d'août 1985. Un Boeing accélère sur la piste pour décoller. Cent trente-sept personnes à bord. » ───────── */
  const tFire = F("manch2", -0.1);
  // the camera lags behind the 737 that accelerates: the plane moves forward through the frame, the nose leaving it
  shot(tCard + 0.9, tFire - (tCard + 0.9), { ...MA, tx: 600, el: 4, az: -46, d: 1900 }, "sine.in");
  st(tCard + 0.05, tFire - 0.1 - (tCard + 0.05), { run: 27000 }, "power2.in"); // it accelerates (the runway slides)
  fact(D.tl, { id: "c3-manch", k: "Manchester", v: "1985", s: "22 août", from: Math.max(tCard + 2.65, A("manch1:1985") - 0.1), to: A("manch1:accélère") - 0.25 });
  fact(D.tl, { id: "c3-137", k: "À bord", v: "137", from: A("manch1:trente-sept") - 0.15, to: tFire - 0.05 });

  /* ───────── 221,6 → 228,6 · « Un bruit sourd. L'équipage interrompt le décollage. L'avion s'arrête… et le feu perce la cabine… » ───────── */
  const FIRE = { ...VIEW.b737Fire, ...CLOSE };
  cut(tFire, null, FIRE, man({ run: 27000 }));
  st(A("thump"), 0.1, { thump: 1 }, "power2.out"); //               « sourd » : the engine fails, before the fire
  st(A("thump") + 0.12, 0.45, { thump: 0 });
  st(A("thump") + 0.5, 2.0, { fire: 0.5 }); //                      the fire takes (≤ 0.5 on this close frame)
  const tStop = A("manch2:s'arrête");
  st(tFire + 0.04, tStop - (tFire + 0.04), { run: 38000 }, "power2.out"); // « interrompt » … « s'arrête »
  const tBack = A("manch2:interrompt") + 1.06;
  shot(tFire, tBack - tFire, { ...FIRE, d: 1380, az: -34 });
  const tDoor = F("manch3", -0.15);
  shot(tBack, tDoor - tBack, { ...VIEW.b737Wide, ...SHARP, az: -32 }, "sine.inOut", 1380); // the pull-back to the whole 737
  st(tBack + 0.5, 1.4, { fire: 0.8 });
  st(A("breach"), 0.8, { breach: 0.6 }); //                         « perce » : the fire enters the cabin
  st(A("breach") + 0.3, 1.6, { smoke: 0.4 });
  now(tStop, { chronoOn: 1, chrono: 0 }); //                         the chrono runs from the stop
  st(tStop, A("manch3:vingt-cinq") - 0.02 - tStop, { chrono: 25 }, "none");

  /* ───────── 228,6 → 231,8 · « Devant, à gauche, la porte s'ouvre au bout de vingt-cinq secondes. » ───────── */
  const DOOR = { ...P, ...CLOSE, tx: D737, ty: 230, tz: R737 + 50, d: 1000, az: -20, el: 4 };
  cut(tDoor, null, DOOR, man({ run: 38000, fire: 0.8, breach: 0.6, smoke: 0.4 }));
  const tRight = F("manch3:devant#2", -0.12);
  shot(tDoor, tRight - tDoor, { ...DOOR, d: 940, az: -24 });
  st(A("manch3:s'ouvre"), 1.5, { doorA: 1 }); //                     « s'ouvre » : the door, its slide
  const tHatch = F("manch4", -0.12);
  st(A("manch3:vingt-cinq"), A("manch4b:quarante-cinq") - 0.02 - A("manch3:vingt-cinq"), { chrono: 45 }, "none");

  /* ───────── 231,8 → 236,7 · « Devant, à droite, elle reste coincée : un défaut de son toboggan. Il faudra près d'une minute. » ───────── */
  // door 1R from the right, at the same place of the picture as 1L
  const RIGHT = { ...VIEW.b737Right, ...CLOSE, tz: -R737 - 50, d: 1000, az: 200, el: 4 };
  cut(tRight, null, RIGHT, man({ run: 38000, fire: 0.8, breach: 0.6, smoke: 0.4, doorA: 1 }));
  shot(tRight, tHatch - tRight, { ...RIGHT, d: 900, az: 204 });
  st(tRight + 0.1, 0.8, { doorC: 0.15 }); //                         ajar, its pack stuck in the sill
  punch(A("jam"), 0.06); //                                          « coincée »

  /* ───────── 236,7 → 240,1 · « Au milieu, l'issue sur l'aile : une trappe de vingt-deux kilos, » ───────── */
  // inside the 737, the fire behind the left windows: the hatch and its passage from the side, the seats empty (no
  // glass head near the lens)
  const HATCH = { ...P, ...CLOSE, tx: 861, ty: 90, tz: -150, d: 330, az: 20, el: 12, fov: 32, side: -150 };
  cut(tHatch, SET.CABINE, HATCH, nar({ pax: 0 }), { fade: 0.2 });
  const tPass = F("manch4:et", -0.08);
  shot(tHatch, tPass - tHatch, { ...HATCH, d: 300, az: 26 });
  fact(D.tl, { id: "c3-trappe", k: "La trappe", v: "22 KILOS", from: A("hatch") + 0.4, to: tPass - 0.03 });

  /* ───────── 240,1 → 242,8 · « …et un passage de vingt-sept centimètres pour l'atteindre. » ───────── */
  const PASS = { ...P, ...SHARP, tx: 861, ty: 50, tz: -100, d: 260, az: 60, el: 40, fov: 34 }; // from above, without passengers: the gap between the seat backs
  cut(tPass, null, PASS, nar({ pax: 0 }));
  const tHand = F("manch4:rien", -0.12);
  shot(tPass, tHand - tPass, { ...PASS, d: 245, az: 63 });
  fact(D.tl, { id: "c3-passage", k: "Le passage", v: "27 CENTIMÈTRES", from: A("manch4:centimètres") - 0.4, to: tHand - 0.03 });

  /* ───────── 242,8 → 248,4 · « Rien n'obligeait à expliquer … comment l'ouvrir. Elle ne s'ouvre qu'au bout de quarante-cinq secondes. » ───────── */
  // the passengers seated there, from above the middle of the aisle, aft of the hatch (the heads ≈ 1 m aside)
  const NEAR = { ...P, ...CLOSE, tx: 861, ty: 95, tz: -150, d: 311, az: 60, el: 15, fov: 32, side: -110 };
  cut(tHand, null, NEAR, nar());
  const tOpen = A("manch4b:s'ouvre");
  const tBackH = A("manch4:comment");
  shot(tHand, tBackH - tHand, { ...NEAR, d: 300, az: 59 });
  const tMorts = F("manch5", -0.1);
  shot(tBackH, tMorts - tBackH, { ...P, ...SHARP, tx: 861, ty: 80, tz: -185, d: 350, az: 46, el: 19, fov: 33, side: -60 }); // a long gentle move back, to see the hole
  st(tOpen, 0.7, { hatch: 0.5 }); //                                 pulled in (22 kg in the arms)…
  st(tOpen + 0.75, 1.0, { hatch: 1 }, "sine.inOut"); //                              …thrown out, the hole open
  const t45 = A("manch4b:quarante-cinq");
  st(t45, tMorts - 0.05 - t45, { chrono: 46.2 }, "none");
  now(tMorts, { chronoOn: 0 });

  /* ───────── 248,4 → 256,4 · « Mais ce n'est pas le feu qui tue le plus. … quarante-huit sont morts de la fumée. Dans un avion qui n'avait jamais quitté le sol. » ───────── */
  // outside: the 737's cabin fills with smoke; nobody is shown
  const OUT = { ...VIEW.b737Wide, ...SHARP, az: -28, el: 10 };
  cut(tMorts, SET.PISTE, OUT, man({ run: 38000, fire: 0.45, breach: 0.5, smoke: 0.6, pax: 0, doorA: 1, doorB: 1, doorC: 0.15 }), { fade: 0.2 });
  const tGround = A("manch5:jamais") - 0.45;
  st(tMorts + 0.05, tGround - (tMorts + 0.05), { smoke: 1.3 }, "sine.inOut");
  shot(tMorts, tGround - tMorts, { ...OUT, d: 4900, az: -24, el: 8 });
  const tCabin = F("apres", -0.12);
  shot(tGround, tCabin - tGround, { ...OUT, ty: 160, d: 4300, az: -20, el: -1 }); // « jamais quitté le sol » : down to the wheels
  fact(D.tl, { id: "c3-morts", k: "Morts de la fumée", v: "48 SUR 55", tone: "signal", from: A("manch5:quarante-huit") - 0.15, to: A("manch5:jamais") - 0.2 });
  punch(A("smokekills"), 0.05);

  /* ───────── 256,4 → 261,6 · « Après Manchester, au Royaume-Uni, la cabine change. Des panneaux qui brûlent moins. Plus d'extincteurs. » ───────── */
  // from behind the last row, down the middle of the aisle (every head more than 1 m from the lens)
  const NA = { ...P, ...SHARP, tx: 400, ty: 95, tz: 0, d: 1180, az: 90, el: 4, fov: 34 };
  const clean = (x = {}) => ({ ...AT.narrow, fire: 0, smoke: 0, mood: 0, ...x });
  cut(tCabin, SET.CABINE, NA, clean(), { fade: 0.2 });
  const tWider = F("apres:et", -0.12);
  shot(tCabin, tWider - tCabin, { ...NA, d: 1150 }); //              a slow push down the aisle (≈ 6 cm/s)
  st(A("apres:panneaux"), 0.6, { panels: 1 });
  st(A("apres:d'extincteurs"), 0.8, { extinguisher: 1 });

  /* ───────── 261,6 → 264,35 · « Et à côté des issues sur l'aile… un siège en moins. » ───────── */
  const PASS2 = { ...PASS, d: 250, az: 66 };
  cut(tWider, null, PASS2, clean({ panels: 1, extinguisher: 1, pax: 0 }));
  const tTokyo = F("relance2", -0.12);
  shot(tWider, tTokyo - tWider, { ...PASS2, d: 236, az: 69 });
  st(A("apres:siège") - 0.05, 0.8, { wider: 1 }); //                 « un siège en moins »

  /* ───────── 264,35 → 272,06 · « Mais la fumée, elle, descend du plafond. Et les lumières sont en haut. … comment trouves-tu ta porte ? » ───────── */
  // the A350 at Tokyo, from the aisle at 1 m: the smoke comes down; the camera lifts toward the lamps that drown, then
  // tilts back down toward the floor — the move c4 carries on (the line lights there)
  const T0 = { ...P, ...SHARP, tx: 600, ty: 150, tz: 123, d: 700, az: 90, el: -4, fov: 34 }; // down the middle of the left aisle
  cut(tTokyo, SET.CABINE, T0, { ...AT.tokyo, smoke: 0.3 }, { fade: 0.2 });
  st(tTokyo + 0.3, A("relance2$") - 1.1 - (tTokyo + 0.3), { smoke: 0.7 }, "sine.inOut"); // never 1 here: the camera would be in it
  const tLamps = A("relance2:lumières") + 0.6;
  shot(tTokyo, tLamps - tTokyo, { ...T0, ty: 245, el: -12 }); // « les lumières sont en haut »
  st(A("relance2:lumières"), 1.2, { signs: 0.3 }); //                 the lamps and the signs drown
  const tC34 = onFrame(A(HAND.c34.at)) - HAND.c34.opt.before;
  shot(tLamps, tC34 - tLamps, HAND.c34.from[0]);
  seam(D, "c34", "out");
}
