// c5 · « 51,4 hertz : l'autre moitié s'emballe », « Recoller l'Europe », « L'enquête » jusqu'à « …sur son seul réseau »
// HAND.c45 (≈ 446,57) → HAND.c56 (lebout − 0,15 ≈ 572,91). The plan, phrase by phrase: docs/L06-actes.md § c5 (the common top first). Journal: docs/journal/L06-c5.md.
// Every instant is read off the script (D.at). A cut gives what changes, never a number a running tween carries.
// The header: zone 1 (Nord-Est) until the card « Recoller l'Europe » (484,2), then 0 · hzOn 0 from `reviennent` to
// 484,2, 0 on the bench of the recoupling, 1 until `bilan` · clockOn 1 until `bilan` · era 3 from the card « L'enquête ».
// THE PUNCHES: `f514` (chapter 9) and `recoupleOk` (chapter 10) — both short, both clear of the next cut.
import { SET, AT, VIEW, SHARP, span, seam, cardAt, onFrame } from "./world.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";
import { showPiece } from "./pieces.js";

/** The numbers this file carries by tweens across cuts (frequencies, marks): a cut never sets them. */
const RUN = ["hzW", "hzE", "hzS", "turnW", "turnE", "turnS"];
const free = (o) => {
  const r = { ...o };
  for (const k of RUN) delete r[k];
  return r;
};
/** After 22:10:28: the West shed, its relays watching, its small units out; the dams' pumps stopped at 49,5. */
const SPLIT = { ...AT.split, era: 0, clockOn: 1, hzOn: 1, shed: 1, relays: 1, smallOut: 1, pumps: 0 };

export default function ({ D, world, co }) {
  const { at, st, now, cut, path, punch, quiet, tl } = D;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const [t0, tEnd] = span(D, "c5");
  const T0 = onFrame(t0);
  const T1 = onFrame(tEnd); // c6 cuts here (fade): the last path ends on it, still moving
  const LA = world.europe.A;
  /** A place label: one at a time, never during a fast move; the keywords keep quiet meanwhile. */
  const label = (anchor, title, sub, from, to, x = 1260, y = 300) => {
    co.add({ title, sub, x, y, anchor }).show(tl, from).hide(tl, to - 0.24);
    quiet(from, to);
  };
  /** A figure in the left column; the keywords keep quiet meanwhile. */
  const fig = (o) => {
    fact(tl, o);
    quiet(o.from, o.to);
  };

  /* ═════════ 446,57 → 453,1 · « Au Nord-Est, il y a trop d'électricité » : the surplus piles up at the crack ═════════ */
  // the seam: the move that crossed the crack (c4: westPlate →) lands on the North-East plate and goes on
  const d0 = seam(D, "c45", "in", { state: free({ ...SPLIT, zone: 1 }) });
  now(T0, { hzW: 49, hzE: 50, hzS: 49.7 }); // the three frequencies as c4 leaves them (no tween of these runs across the seam)
  path(
    [
      [T0 + 1.4, d0],
      [at("trop") + 1.2, { tx: 76, tz: -96, d: 410, az: 10, el: 52 }], //  toward the joint, the surplus on its east side — wide and high: the crack's light a slit, not a quarter of the frame
      [F("accelerent", -0.13), { tx: 70, tz: -94, d: 380, az: 6, el: 52 }],
    ],
    { from: "rest", to: "go" },
  );
  st(at("trop") + 0.5, 2.0, { surplus: 1 }); //                      the dashes pile up against the crack
  fig({ id: "c5-trop", k: "PLUS DE", v: "10 000", s: "MÉGAWATTS EN TROP", tone: "signal", from: at("route") + 0.06, to: at("nordest$") });

  /* ═════════ 453,1 → 458,2 · « Les alternateurs accélèrent… 51,4 hertz » : the three marks, the North-East racing ═════════ */
  const tB = F("accelerent", -0.13);
  cut(tB, SET.BENCH, VIEW.threeRotors, free({ ...AT.alt, rotors: 3, needles: 3, zone: 1, clockOn: 1, hzOn: 1, era: 0 }), { fade: 0.2 });
  now(tB, { turnE: 0 }); //                                          the North-East's offset, from here (no tween runs on it)
  const tC = F("eoliennes", -0.12);
  path([[tB, VIEW.threeRotors], [tC, { tz: -40, d: 290, az: -56, el: 7 }]], { from: "go", to: "go" });
  st(at("accelerentW"), at("redescend") - at("accelerentW"), { turnE: 1400 }, "none"); // ONE tween: the North-East's mark runs ahead
  st(at("accelerentW") + 0.06, 3.4, { hzE: 51.4 }, "sine.inOut"); //  « la fréquence grimpe… »
  punch(at("f514"), 0.05, { up: 0.08, hold: 0.14, down: 0.38 }); //  « 51,4 hertz » — over before the cut (458,17)

  /* ═════════ 458,2 → 484,2 · ONE glide over the North-East: the wind farms, the crack, Poland, the second crack ═════════ */
  const NORTH = { ...VIEW.eastPlate, tz: -125, d: 220 };
  cut(tC, SET.CARTE, NORTH, free({ ...SPLIT, zone: 1, surplus: 1 }), { fade: 0.2 });
  const tCard2 = onFrame(cardAt(D, "recolle"));
  const tPol = F("pologneW", -0.15); //                                                  ≈ 477,47: the cut, a few frames before « Pologne »
  path(
    [
      [tC, NORTH],
      [at("redescend"), { tx: 88, tz: -116, d: 225, az: 4 }], //                         the wind farms of the north (the crack kept to a slit at the left edge)
      [at("aucun") + 1.6, { tx: 48, ty: 1, tz: -92, d: 330, az: 4, el: 48 }], //        along the crack, wide (a slit): the West's dust left, the surplus right
      [at("ilyaTrop"), { tx: 44, tz: -88, d: 318, az: 2, el: 47 }],
      [at("toutesSeules"), { tx: 66, tz: -114, d: 280, az: 10, el: 44 }], //           back on the farms: they come back
      [tPol, { tx: 78, tz: -108, d: 236, az: 14, el: 40 }],
    ],
    { from: "go", to: "go" },
  );
  // raccord on the object: the line in Poland, already in the wide shot, now close and from the other side
  const POL = { ...VIEW.polandC, tx: 104, d: 140, az: 36, el: 34, dof: 0 }; // east of the crack, sharp: its light stays a slit
  cut(tPol, null, POL, {});
  path(
    [
      [tPol, POL], //                                                                     the line in Poland (≈ 35 %)
      [at("danger"), { tx: 88, tz: -98, d: 150, az: 28, el: 34 }],
      [at("deuxFois"), { tx: 92, tz: -102, d: 262, az: 16, el: 42, dof: 0 }], //       the dashed second crack, whole
      [tCard2, { tx: 93, tz: -103, d: 278 }], //                                          the breath before the ad: a slow drift goes on
    ],
    { from: "go", to: "go" },
  );
  st(at("eoliennesW") + 0.6, 2.4, { windOut: 1 }); //                « plus de 6 000 mégawatts se déconnectent »
  fig({ id: "c5-eol", k: "PLUS DE", v: "6 000", s: "MÉGAWATTS D'ÉOLIEN", tone: "veille", from: at("eoliennesW") + 0.86, to: at("eoliennesW") + 3.46 });
  st(at("redescend") - 0.3, 2.0, { hzE: 50.3 }, "sine.inOut"); //    « On redescend vers 50,3 »
  now(at("reviennent"), { hzOn: 0 });
  st(at("reconnectent") - 0.14, 3.4, { windBack: 1 }, "none"); //    parc après parc, toutes seules
  st(at("pologneW") - 0.1, 0.8, { poland: 1 }, "power2.out"); //      « une ligne sature »
  label(LA.mikulowa, "Pologne", "Mikulowa–Czarna", at("pologneW") + 0.1, at("pologne$") + 0.4);
  st(at("deuxFois") - 0.55, 1.2, { crack2: 1 }); //                   « …une deuxième fois » — dashed: a risk, never a crack

  /* ═════════ 484,2 → 490,95 · « Recoller l'Europe » : the dams start in the West ═════════ */
  const ALPS = { ...VIEW.alps, ...SHARP };
  cut(tCard2, null, { ...ALPS, d: 430, az: -12, el: 52 }, free({ ...SPLIT, zone: 0, crack2: 0, surplus: 1, windOut: 1, windBack: 1, poland: 1 }), { fade: 0.2 });
  threadCall(tl, { from: tCard2 + 0.15, to: tCard2 + 2.55, text: "Une deuxième cassure ? Possible." });
  const tE = F("pouls", -0.13);
  path(
    [
      [tCard2, { ...ALPS, d: 430, az: -12, el: 52 }],
      [tCard2 + 2.4, { d: 200, az: -22, el: 33 }], //  the whip under the card: down onto the Alps
      [tE, { d: 165, az: -38, el: 30 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("recolle") + 0.1, 5.6, { hzW: 49.6 }, "sine.inOut"); //       49,0 → 49,6 while the dams start
  st(at("recolle") + 0.9, 4.0, { hydro: 1 });
  fig({ id: "c5-hydro", k: "≈", v: "17 000", s: "MÉGAWATTS DÉMARRENT", tone: "veille", from: at("recolle") + 2.3, to: at("recolle$") - 0.1 });

  /* ═════════ 490,95 → 494,4 · « 22 h 24. Cinquante hertz. Le pouls est revenu. » ═════════ */
  cut(tE, null, VIEW.dialMap, {}); //                                  same place: the dial on the rim (rond)
  const tF = F("rallume", -0.14);
  path([[tE, VIEW.dialMap], [tF, { d: 126, az: -106 }]], { from: "go", to: "go" });
  st(tE + 0.06, 1.8, { hzW: 50 }, "sine.inOut");
  st(at("pouls50") - 0.1, 0.6, { band: 1 }, "power2.out"); //         the West's needle back in the band

  /* ═════════ 494,4 → 501,0 · « En France, on rallume par moitiés » : the street, your window ═════════ */
  const QH = { clockOn: 1, hzOn: 1, zone: 0, era: 0 };
  cut(tF, SET.QUARTIER, VIEW.feeders, free({ ...AT.quartier, ...QH, shed: 1, relit: 0, feed: 1 }), { fade: 0.2 });
  const tG = F("rallume", 4.66); //                                     « Pas tout d'un coup… » (499,2)
  path([[tF, VIEW.feeders], [tG, { tx: 2700, d: 7000, az: -44 }]], { from: "go", to: "go" });
  st(at("moities") - 0.1, 1.2, { relit: 0.5 }); //                    22 h 30: one half
  st(at("dixMin") - 0.1, 1.2, { relit: 1 }); //                       ten minutes later: the other (your building)
  const WIN = { ...VIEW.windowC, d: 1300, az: -28, el: 2 }; // as c3: closer, the glass is a white slab
  cut(tG, null, WIN, {}); //                                  the same lit rectangles, closer: your window
  const tH = F("plusdur", -0.1);
  path([[tG, WIN], [tH, { d: 1180, az: -24 }]], { from: "go", to: "go" });

  /* ═════════ 501,0 → 503,75 · « Reste le plus dur : recoller les trois morceaux. » ═════════ */
  const MAPH = { ...AT.split, era: 0, clockOn: 1, hzOn: 1, zone: 0, shed: 0, lost: 0, hydro: 1, pumps: 0 };
  cut(tH, SET.CARTE, VIEW.three, free(MAPH), { fade: 0.2 });
  const tI = F("conditions", -0.13);
  path([[tH, VIEW.three], [tI, { tx: 22, tz: -22, d: 560, az: -16 }]], { from: "go", to: "go" });

  /* ═════════ 503,75 → 519,7 · the bench: two flanges, the coupling device, 45 seconds, a failure, « ça tient » ═════════ */
  cut(tI, SET.BENCH, VIEW.syncC, free({ ...AT.alt, rotors: 2, needles: 3, sync: 1, clockOn: 1, hzOn: 0, zone: 0, era: 0 }), { fade: 0.2 });
  now(tI, { turnW: 0, turnE: 130 }); //                              the North-East's mark 130° ahead (no tween runs on them)
  st(tI + 0.1, at("recouple") + 1.1 - tI - 0.1, { turnE: 360 }, "sine.out"); // ONE tween: it drifts round into step (≡ turnW mod 360) by 519,0
  const tJ = F("automate", -0.13);
  path(
    [
      [tI, VIEW.syncC],
      [at("vitesse"), { d: 272, az: -72 }],
      [at("dixDegres"), { d: 238, az: -66, el: 7 }],
      [tJ, { d: 230, az: -65 }],
    ],
    { from: "go", to: "go" },
  );
  fig({ id: "c5-demi", k: "MOINS D'UN", v: "DEMI-HERTZ", s: "D'ÉCART", tone: "veille", from: at("demiHertz") - 0.4, to: at("demiHertz") + 1.6 });
  fig({ id: "c5-deg", k: "MOINS DE", v: "10", s: "DEGRÉS", tone: "veille", from: at("dixDegres") - 0.6, to: at("conditions$") + 0.2 });
  // the same device, closer and from the side of the West's flange (raccord on the object)
  const SYNC2 = { ...VIEW.syncC, d: 190, az: -46, el: 10 };
  cut(tJ, null, SYNC2, {});
  const tK = onFrame(at("recouple") + 1.8); //                        519,7
  path(
    [
      [tJ, SYNC2],
      [at("s45"), { d: 170, az: -36 }],
      [at("echouent"), { d: 164, az: -33, el: 9 }],
      [at("recouple"), { d: 158, az: -30 }],
      [tK, { d: 152, az: -27 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("automateW") + 0.8, 3.2, { tryK: 1 }, "none"); //            « on le lance… et on attend »
  fig({ id: "c5-45", k: "ON ATTEND", v: "45", s: "SECONDES", from: at("s45") - 1.1, to: at("automate$") });
  st(at("echouent"), 0.2, { fail: 1 }, "power2.out"); //              « Des tentatives échouent »
  st(at("echouent") + 0.2, 0.4, { fail: 0 }, "sine.inOut");
  now(at("echouent") + 0.7, { tryK: 0 }); //                          « On recommence »
  st(at("echouent") + 0.8, at("recouple") + 1.1 - at("echouent") - 0.8, { tryK: 0.7 }, "none");
  st(at("recouple") + 1.1, 0.5, { closed: 1 }, "power2.out"); //       519,0: the two marks locked
  st(at("recouple") + 1.1, 1.5, { hzE: 50 }, "sine.inOut"); //        the North-East back on 50

  /* ═════════ 519,7 → 521,5 · « …se recouplent. Ça tient. » : the joint closes ═════════ */
  const TEAR = { ...VIEW.tear, d: 170, el: 16 };
  cut(tK, SET.CARTE, TEAR, free(MAPH), { fade: 0.15 });
  const tL = F("sudest", -0.12);
  path([[tK, TEAR], [tL, { d: 140, az: 6 }]], { from: "go", to: "go" });
  st(tK + 0.1, 1.2, { apartE: 0 }, "sine.inOut");
  st(tK + 0.1, 1.0, { weld: 1 }, "sine.inOut");
  st(tK + 0.2, 1.2, { crack: 0.3 }, "sine.inOut");
  punch(at("recoupleOk"), 0.05, { up: 0.06, hold: 0.1, down: 0.22 }); // over at 521,48, before the cut

  /* ═════════ 521,5 → 527,5 · « Le Sud-Est revient… l'Europe bat de nouveau d'un seul cœur » ═════════ */
  cut(tL, null, VIEW.southPlate, {});
  now(tL, { turnS: -100 }); //                                        the South-East's mark behind (no tween runs on it)
  const tM = F("rallume2", -0.15);
  path(
    [
      [tL, VIEW.southPlate],
      [at("min38") - 0.4, { tx: 140, tz: 52, d: 340, az: 6 }],
      [at("unCoeur"), { tx: -20, tz: 5, d: 640, az: -10, el: 40 }], //  the whole continent, one beat
      [tM, { d: 660, az: -11 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("sudest") + 0.75, 1.4, { apartS: 0 }, "sine.inOut");
  st(at("sudest") + 0.75, 1.4, { hzS: 50 }, "sine.inOut");
  st(at("sudest") + 0.75, 4.4, { turnS: 0 }, "sine.out"); //            into step by 526,8
  fig({ id: "c5-38", k: "APRÈS LA CASSURE", v: "38", s: "MINUTES", tone: "veille", from: at("min38") - 0.5, to: at("min38") + 1.5 });
  st(at("unCoeur") - 0.35, 0.8, { crack: 0, weld: 0 }, "sine.inOut");
  now(at("unCoeur"), { needles: 1 });
  st(at("unCoeur") - 0.1, 0.8, { pulse: 1 }, "power2.out"); //         Lisbonne, Paris, Varsovie: one beat

  /* ═════════ 527,5 → 530,5 · « En France, vers 23 h 10, tout le monde est rallumé. » ═════════ */
  cut(tM, SET.QUARTIER, VIEW.home, free({ ...AT.quartier, ...QH, shed: 0, relit: 0, lift: 0.3 }), { fade: 0.2 });
  const tN = F("bilan", -0.12);
  path([[tM, VIEW.home], [tN, { d: 2900, az: -16 }]], { from: "go", to: "go" });
  st(tM + 0.15, 2.7, { lift: 0.7 }, "sine.inOut"); //                 the lift goes up again

  /* ═════════ 530,5 → 544,85 · the toll, « jusqu'au Maroc », then down onto the Ems and Landesbergen–Wehrendorf ═════════ */
  const WIDE = { ...VIEW.three, tx: -40, tz: 10, d: 680, az: -16, el: 44 };
  cut(tN, SET.CARTE, WIDE, free({ ...AT.carte, emsCut: 2, dial: 0, clockOn: 0, hzOn: 0, zone: 0, era: 0, pulse: 0 }), { fade: 0.2 });
  const tO = onFrame(cardAt(D, "enquete"));
  path(
    [
      [tN, WIDE],
      [at("m15") + 2.0, { tx: -110, tz: 70, d: 520, az: -20 }],
      [at("marocB") + 0.5, { tx: -195, tz: 195, d: 380, az: -24, el: 42 }], //   the strait: the link to Morocco goes dark
      [at("deces"), { tx: -170, tz: 150, d: 430, az: -22, el: 46 }],
      [at("comment2") + 0.3, { tx: -80, tz: -50, d: 380, az: -22, el: 50 }], //  rising, toward the north (seen from high)
      [at("bateauQ"), { ...VIEW.emsMap, d: 62, el: 36, dof: 0 }], //              the line cut for a boat
      [at("bateauQ") + 2.0, { tx: (VIEW.emsMap.tx + VIEW.lwMap.tx) / 2, tz: (VIEW.emsMap.tz + VIEW.lwMap.tz) / 2, d: 54, az: -18, el: 35 }],
      [at("deuxChiffres"), { ...VIEW.lwMap, d: 46, dof: 0 }], //                  Landesbergen–Wehrendorf
      [tO, { d: 44 }],
    ],
    { from: "go", to: "go" },
  );
  fig({ id: "c5-15m", k: "≈", v: "15 MILLIONS", s: "DE FOYERS", from: at("bilan") + 0.3, to: at("marocB") - 0.5 });
  st(at("marocB") - 0.1, 0.8, { maroc: 0 }, "power2.out"); //        « jusqu'au Maroc »
  fig({ id: "c5-2h", k: "MOINS DE", v: "2", s: "HEURES", tone: "veille", from: at("deces") - 1.7, to: at("deces") - 0.3 });
  st(at("comment2") + 0.4, 1.8, { region: 1 }); //                   the story's lines drawn thick
  st(at("deuxChiffres") - 0.5, 0.6, { lw: 1 }, "power2.out"); //    « deux chiffres » : the line lit, its glow

  /* ═════════ 544,85 → 554,25 · « L'enquête » : the report (a piece of the dossier) ═════════ */
  const REP = { ...VIEW.reportOpen, side: 320, ...SHARP }; // a document: no optics; the report on the left (≈ 40 %)
  cut(tO, SET.BENCH, { ...REP, d: 150, el: 68, az: -30 }, free({ ...AT.report, era: 3, clockOn: 0, hzOn: 0, zone: 0 }), { fade: 0.2 });
  const tP = F("climat", -0.13);
  path(
    [
      [tO, { ...REP, d: 150, el: 68, az: -30 }],
      [tO + 2.4, { d: 94, el: 58, az: -30 }], //  the whip under the card
      [at("janvier") + 3.6, { d: 84, el: 55, az: -14 }], //  then a steady orbit + dolly round the report (no quasi-fixed stretch)
      [at("p84"), { d: 72, el: 51, az: 4 }],
      [tP, { d: 68, el: 50, az: 12 }],
    ],
    { from: "go", to: "go" },
  );
  showPiece(tl, { id: "rapport", from: at("janvier") + 2.85, to: at("piece") + 0.35, side: "right" });
  quiet(at("janvier") + 2.85, at("piece") + 0.35);
  st(at("p84") - 0.1, 1.2, { page: 1 }); //                           84 pages: it opens on its conclusions

  /* ═════════ 554,25 → 560,05 · « Rien n'a cassé » : the crossing over the Ems, calm, intact ═════════ */
  const XING = { ...VIEW.crossing, tx: 8000, ty: 4500, d: 40000, az: 60, el: 8 }; // along the line: the crossing tower big, the wires running away
  cut(tP, SET.TERRAIN, XING, free({ ...AT.terrain, era: 3, emsCut: 2, wind: 0.5, clockOn: 0, hzOn: 0 }), { fade: 0.2 });
  const tQ = onFrame(at("climat") + 3.0); //                           « …ni défaillance du matériel »
  path([[tP, XING], [tQ, { d: 35000, az: 50 }]], { from: "go", to: "go" });
  cut(tQ, null, VIEW.tower, {}); //                                    a tower of the crossing: intact
  const tR = F("causes", -0.13);
  path([[tQ, VIEW.tower], [tR, { d: 19000, az: -35 }]], { from: "go", to: "go" });
  fig({ id: "c5-rien", k: "RIEN", v: "N'A CASSÉ", tone: "veille", from: at("rienCasse") - 1.06, to: at("climat$") - 0.1 });

  /* ═════════ 560,05 → 572,9 · two causes: N−1 not held, coordination; « chacun… sur son seul réseau » ═════════ */
  const REG = { ...AT.region, era: 3, emsCut: 2, load: 1, n1sim: 1, clockOn: 0, hzOn: 0, zone: 0 };
  cut(tR, SET.CARTE, VIEW.n1, free(REG), { fade: 0.2 });
  path(
    [
      [tR, VIEW.n1],
      [at("cause1") + 1.4, { tx: -18, tz: -110, d: 92, az: -22, el: 38 }],
      [at("cause2") + 0.6, { ...VIEW.zonesDE, d: 240, az: -18 }], //               the control areas
      [at("a19h"), { d: 228, az: -11 }],
      [at("chacun"), { d: 210, az: 0, tx: -10 }],
      [T1, { d: 196, az: 8, tx: -6 }],
    ],
    { from: "go", to: "go" },
  );
  fig({ id: "c5-c1", k: "CAUSE 1", v: "N−1", s: "NON TENUE", tone: "signal", from: at("cause1") - 0.24, to: at("cause1") + 2.36 });
  st(at("cause2") - 0.9, 1.0, { n1sim: 0 }, "sine.inOut");
  st(at("cause2") - 0.9, 1.2, { zones: 1 }, "sine.inOut");
  now(at("cause2") - 0.6, { zoneLit: 4 });
  fig({ id: "c5-c2", k: "CAUSE 2", v: "COORDINATION", s: "INSUFFISANTE", tone: "signal", from: at("cause2") - 0.18, to: at("causes$") - 0.06 });
  st(at("a19h"), 0.6, { phone: 1 }, "power1.out"); //               « des voisins prévenus à dix-neuf heures »
  fig({ id: "c5-prev", k: "LA COUPURE", v: "ABSENTE", s: "DES PRÉVISIONS", from: at("a19h") + 1.18, to: at("a19h") + 3.18 });
  st(at("chacun") - 0.18, 2.2, { scan: 1 }, "sine.inOut"); //         each sweep stops at its own border
}
