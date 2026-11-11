// c4 · « Les 17 secondes » de « 22:10:27. Au sud du Main », « Le délestage : 11 secondes pour ne pas tout perdre »
// HAND.c34 (≈ 334,82) → HAND.c45 (nordest − 0,2 ≈ 446,57). The plan, phrase by phrase: docs/L06-actes.md § c4 (the common top first). Journal: docs/journal/L06-c4.md.
// Every instant is read off the script (D.at). A cut gives what changes, never a number a running tween carries:
// `free()` strips the marks (turnW/E/S) and the three frequencies (hzW/E/S) from every AT.* a cut posts — they are tweened
// across the cuts (turnW: ONE tween 367,1 → 436,1 ; hzW: a chain 50 → 49,0 between 368,8 and 418,97).
// THE CLIMAX: cuts every 3 to 5 s. The words that hit: « déchire » (separation, 344,50) and « ouvrent » (420,34) —
// one per chapter. The sounds are the architect's: drop + boom on « déchire », hit after « Maroc », buzz under the
// délestage, drop + clack on « Les relais ouvrent », hush on « Ça tient ».
import { SET, AT, VIEW, span, seam, onFrame, cardAt } from "./world.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const HDR = { clockOn: 1, hzOn: 1, era: 0, zone: 0 };
const RUNNING = ["turnW", "turnE", "turnS", "hzW", "hzE", "hzS"];
/** A complete state minus the numbers a tween carries across the cuts. */
const free = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => !RUNNING.includes(k)));
/** The West after the split (the CARTE): one needle on the rim, the stumps, the header on the West. */
const WEST = { ...free(AT.split), ...HDR, needles: 1, dial: 0 }; // the dial (on the rim) only in its own shots: from behind it is a dark slab

export default function ({ D, world, co }) {
  const { at, st, shot, cut, path, punch, quiet, tl } = D;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const [, tEnd] = span(D, "c4");
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

  /* ═════════ 334,82 → 341,4 · « 22:10:27. Au sud du Main… Bavière. Autriche. » ═════════ */
  // the seam: the slide south goes on (D.match, the architect's carry), onto the Main
  const s0 = seam(D, "c34", "in", { state: { ...AT.region, ...HDR, emsCut: 2, load: 1, lw: 2, volt: 0.5, cascade: 0.7, alarm: 0, phone: 0, n1sim: 0 } });
  const tSeam = onFrame(at("main-0.15")) + 1.2;
  // then on to the south-east with the front: Bavaria (Raitersaich), Austria (Ernsthofen)
  path(
    [
      [tSeam, s0],
      ["baviere", { tx: 20, tz: -44, d: 170, az: 4, el: 36 }], //  lower and lower: it leads into the low frame of the slit
      [F("dechire", -0.14), { tx: 30, tz: -36, d: 165, az: 10, el: 30 }],
    ],
    { from: "rest", to: "go" },
  );
  st(at("mainW") - 0.1, 1.0, { cascade: 0.85 }, "sine.out"); //   « au sud du Main… déclenchent »
  st(at("baviere") - 0.05, 0.5, { cascade: 0.93 }, "sine.out"); // Bavière
  st(at("autriche") - 0.05, 0.5, { cascade: 1 }, "sine.out"); //  Autriche — the last ties

  /* ═════════ 341,4 → 345,25 · « 22:10:28 et sept dixièmes. L'Europe se déchire. » ═════════ */
  // form: the front's line → the slit. Low, along the future crack, from the south — a slow glide (the mesh grazed: never fast)
  const tTear = F("dechire", -0.14);
  const TEAR = { ...VIEW.tear, tz: -80, d: 140, el: 14 };
  cut(tTear, null, TEAR, { fs: 150 });
  path(
    [
      [tTear, TEAR],
      [F("trois", -0.12), { tz: -88, d: 128, az: 3, el: 15 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("separation") - 0.2, 0.6, { crack: 1 }, "power1.inOut"); // north → south, the light pours up through the joint
  punch(at("separation"), 0.06, { down: 0.4 }); //                   the chapter's word (over before the cut)
  st(at("separation") + 0.4, 2.3, { apartE: 1, apartS: 1 }, "power2.inOut"); // the plates start to drift — on through the cut

  /* ═════════ 345,25 → 352,3 · « Trois morceaux… Trois fréquences… » ═════════ */
  const tThree = F("trois", -0.12);
  const THREE = { ...VIEW.three, az: -25, el: 49 };
  cut(tThree, null, THREE, { region: 0, fs: 320, dial: 0, cascade: 1 }); // form: the slit, seen from above: three plates
  path([[tThree, THREE], [F("frequences3", -0.12), { ...VIEW.three, d: 590, az: -12, el: 44 }]], { from: "go", to: "go" }); // no brake before the cut
  label(LA.west, "Ouest", "avec la France", at("ouestW") - 0.1, at("nordEstW") - 0.05);
  label(LA.east, "Nord-Est", "", at("nordEstW") - 0.05, at("sudEstW") - 0.05);
  label(LA.south, "Sud-Est", "", at("sudEstW") - 0.05, F("frequences3", -0.12));
  // form: the three plates → the three needles
  const tDial = F("frequences3", -0.12);
  cut(tDial, null, VIEW.dialMap, { needles: 3, dial: 1 });
  shot(tDial, F("seule", -0.12) - tDial, { ...VIEW.dialMap, d: 132, az: -108 }, "sine.inOut");
  st(tDial + 0.1, 2.2, { hzW: 49.6, hzE: 51.0, hzS: 49.7 }, "power2.inOut"); // « Trois fréquences… »
  st(tDial + 0.1, 9.8, { turnE: 500, turnS: -150 }, "none"); //                « …et plus aucune ne suit les autres »

  /* ═════════ 352,3 → 359,9 · « Chaque morceau doit tenir seul. » · « …même le Maroc décroche. » ═════════ */
  const tSeule = F("seule", -0.12);
  const LOW = { ...VIEW.three, tx: -10, tz: -20, d: 540, az: -26, el: 32 };
  cut(tSeule, null, LOW, { dial: 0 });
  shot(tSeule, F("maroc", -0.12) - tSeule, { ...LOW, d: 500, az: -30 }, "sine.inOut");
  st(tSeule + 0.1, 1.6, { lost: 1 }, "power2.out"); // the stumps at the West's edge
  // movement: on toward the south — Iberia, then a dive to the strait
  const tIb = F("maroc", -0.12);
  cut(tIb, null, VIEW.iberia, {});
  path(
    [
      [tIb, VIEW.iberia],
      [at("maroc") + 2.2, { ...VIEW.strait, tz: VIEW.strait.tz - 16, d: 125, el: 34, dof: 0 }], // Spain's south coast, the link under it
      [at("marocW") + 0.4, { ...VIEW.strait, tz: VIEW.strait.tz - 12, d: 100, el: 31 }],
      [onFrame(cardAt(D, "delestage") + 0.2), { ...VIEW.strait, tz: VIEW.strait.tz - 11, d: 92, az: -36, el: 30 }], // the breath before the ad: a slow drift
    ],
    { from: "go", to: "go" },
  );
  st(at("marocW") + 0.05, 0.3, { maroc: 0 }, "power2.in"); // the Spain–Morocco link trips

  /* ═════════ 359,9 → 366,3 · « Le délestage » — « il manque d'un coup près de 9 000 mégawatts » ═════════ */
  const tCard = cardAt(D, "delestage");
  threadCall(tl, { from: tCard + 0.15, to: tCard + 2.55, text: "Trois morceaux. Chacun seul." });
  // under the card: the whip from high onto the West plate (SHARP), the clock and the header back to 22:10:28 · 50,0
  const tWest = onFrame(tCard + 0.2);
  const WHIP = { ...VIEW.westPlate, tx: -110, tz: -20, d: 720, az: -44, el: 58 };
  cut(tWest, null, WHIP, { ...WEST, hzW: 50, hzE: 50, hzS: 50 });
  path(
    [
      [tWest, WHIP],
      [tCard + 2.3, VIEW.westPlate],
      [F("freinent", -0.17), { ...VIEW.westPlate, tx: -165, tz: 30, d: 440, az: -18, el: 40 }], // toward the stumps
    ],
    { from: "go", to: "go" },
  );
  fig({ id: "c4-manque", k: "IL MANQUE", v: "≈ 9 000", s: "MÉGAWATTS", tone: "signal", from: tCard + 2.7, to: at("delestage$") - 0.1 });

  /* ═════════ 366,3 → 378,1 · the bench: the alternators brake, 0,15 Hz/s, the first reserve ═════════ */
  // light: the signal stumps → the signal arrow on the shaft
  const tAlt = F("freinent", -0.17);
  const ALTD = { ...VIEW.altDial, d: 360 }; // the flange and the dial, tighter (≈ 70 %)
  cut(tAlt, SET.BENCH, ALTD, { ...free(AT.alt), ...HDR, brake: 0, marks: 1, gov: 0, res: 0 }, { fade: 0.2 });
  path(
    [
      [tAlt, ALTD],
      ["plonge1", { ...VIEW.altDial, tx: -135, d: 335, az: -60 }],
      [at("reserve") + 0.3, { ...VIEW.alt, tx: -20, d: 440, az: -44, el: 12 }], //   the valve comes in
      ["trou", { ...VIEW.alt, d: 400, az: -38 }],
      [F("pompes", -0.15), { ...VIEW.alt, d: 380, az: -34 }],
    ],
    { from: "go", to: "go" },
  );
  st(at("freinentW") - 0.1, 0.6, { brake: 1 }, "power2.out"); //            « Les alternateurs freinent »
  st(at("freinentW"), at("arrete") - at("freinentW"), { turnW: -900 }, "none"); // the West's marks fall behind… until 22:10:39
  st(at("plonge1") - 0.2, 3.2, { hzW: 49.75 }, "sine.inOut"); //            « l'aiguille plonge »
  fig({ id: "c4-pente", v: "0,15", s: "HERTZ PAR SECONDE", tone: "signal", from: at("plonge1") + 1.2, to: at("freinent$") });
  st(at("reserve1") - 0.05, 0.9, { gov: 1, res: 1 }, "power2.out"); //      « La première réserve démarre »
  st(at("reserve1") + 0.4, 4.0, { hzW: 49.65 }, "sine.inOut");
  fig({ id: "c4-reserve", k: "RÉSERVE", v: "≈ 2 000", s: "MÉGAWATTS", tone: "veille", from: at("reserve1") + 0.9, to: at("trou") - 0.3 });
  st(at("trou") - 0.05, 0.25, { brake: 1.35 }, "power2.out"); //             « pour un trou de neuf mille » : the brake swells
  st(at("trou") + 0.2, 0.6, { brake: 1 }, "sine.inOut");

  /* ═════════ 378,1 → 393,9 · the Alps' pumps stop · « Et ça empire » · 11 000 MW let go ═════════ */
  // form: the valve → the pipes of the dams
  // (retouche 10/11) three shots instead of one 16 s path, the split's curtain kept off the top edge and the HUD:
  // the Swiss dams from the south-east (the split out of frame, to the right) → cut on « empire » to the West, the split
  // across its middle (az −51 lays it flat) → in-axis cut on « onze », tighter. The plinth stays out of all three.
  const tAlps = F("pompes", -0.15);
  const ALPS = { ...VIEW.alps, tx: -25, tz: 10, d: 105, az: 35, el: 40 };
  cut(tAlps, SET.CARTE, ALPS, { ...WEST, lost: 1, reserve: 1 }, { fade: 0.2 });
  const tPire = F("empire", -0.12);
  shot(tAlps, tPire - tAlps, { ...ALPS, tx: -20, d: 92, az: 30 }, "sine.inOut"); // a slow push onto the dams' lakes
  const WPIRE = { ...VIEW.westPlate, tx: -67, tz: -64, d: 520, az: -51, el: 38 };
  cut(tPire, null, WPIRE, {}); //                                  the pull-back onto the West, by a cut
  const tOnze = F("onze", -0.12);
  shot(tPire, tOnze - tPire, { ...WPIRE, d: 480, az: -48 }, "sine.inOut");
  const WONZE = { ...VIEW.westPlate, tx: 0, tz: -48, d: 290, az: -51, el: 34 };
  cut(tOnze, null, WONZE, {}); //                                  in the axis, tighter: the West's units let go
  path([[tOnze, WONZE], [F("vingt", -0.12), { ...WONZE, d: 270, az: -45 }]], { from: "go", to: "go" }); // no brake before the cut
  st(at("pompage") + 0.9, 0.3, { pumps: 0 }, "power2.in"); //      « s'arrêtent net »
  st(at("pompage") + 1.2, at("empire") - at("pompage") - 1.2, { hzW: 49.5 }, "sine.inOut");
  fig({ id: "c4-495", k: "SOUS", v: "49,5", s: "HERTZ", tone: "signal", from: at("empire") + 0.75, to: at("empire") + 2.95 });
  st(at("empire") + 1.35, 3.6, { smallOut: 1 }, "sine.inOut"); //  the small units go out across the West
  st(at("onze") + 0.1, 4.4, { hzW: 49.3 }, "sine.inOut");
  fig({ id: "c4-11000", k: "PRODUCTION QUI LÂCHE", v: "≈ 11 000", s: "MÉGAWATTS", tone: "signal", from: at("onze") + 1.75, to: at("onze$") - 0.1 });

  /* ═════════ 393,9 → 401,85 · 47,5 in about twenty seconds · « Ce serait le noir » ═════════ */
  // the round: the plate's needle, close
  const tDial2 = F("vingt", -0.12);
  cut(tDial2, null, VIEW.dialMap, { marks: 1, dial: 1 });
  path(
    [
      [tDial2, VIEW.dialMap],
      ["vingtaine", { ...VIEW.dialMap, d: 140, az: -110 }],
      [at("noir") + 1.0, { ...VIEW.dialWest, tx: VIEW.dialWest.tx - 30, d: 230, el: 10 }], // the pull-back: the West behind
      [F("geste", -0.09), { ...VIEW.dialWest, d: 340 }],
    ],
    { from: "go", to: "go" },
  );
  fig({ id: "c4-475", k: "47,5 HERTZ DANS", v: "≈ 20", s: "SECONDES", tone: "signal", from: at("vingt") + 0.8, to: at("vingt$") - 0.05 });
  st(at("leNoir") - 1.66, 1.6, { whatif: 0.85 }, "power2.in"); // a CONDITIONAL: only for its sentence
  st(at("leNoir") + 0.24, 0.3, { whatif: 0 }, "power2.out");

  /* ═════════ 401,85 → 408,75 · « …un seul geste assez rapide. Et ce n'est pas un humain. » ═════════ */
  const tFr = F("geste", -0.09);
  cut(tFr, null, VIEW.france, { you: 1, relays: 0, dial: 0 });
  path(
    [
      [tFr, VIEW.france],
      [at("gesteW") - 0.3, { ...VIEW.france, tx: -100, tz: 8, d: 190, el: 36 }],
      [F("relais", -0.14), { ...VIEW.youMap, d: 56 }], //   the dive into your point: it becomes the place
    ],
    { from: "go", to: "go" },
  );
  st(at("gesteW") - 0.34, 1.6, { relays: 1 }, "power2.out"); // the relays across the West: a dust of veille points

  /* ═════════ 408,75 → 414,6 · « Dans les postes qui alimentent ton quartier… réglés à 49 hertz » ═════════ */
  // light: your veille point → the poste source
  const tPoste = F("relais", -0.14);
  cut(tPoste, SET.QUARTIER, VIEW.posteW, { ...free(AT.poste), ...HDR, feed: 0, setpt: 0, heroOpen: 0, clac: 0, hero: 1, shed: 0 }, { fade: 0.2 });
  shot(tPoste, F("regles49", -0.85) - tPoste, { ...VIEW.posteW, d: 2700, az: -34 }, "sine.inOut");
  st(at("quartierW") - 0.1, 1.6, { feed: 1 }, "sine.out"); //  « qui alimentent ton quartier »
  st(at("relais") + 0.4, 5.0, { hzW: 49.2 }, "sine.inOut");
  const tRelay = F("regles49", -0.85);
  const RELAY = { ...VIEW.relayQ, d: 92 };
  cut(tRelay, null, RELAY, {}); //                              the voyant: the relay that watches
  shot(tRelay, F("seul", -0.14) - tRelay, { ...RELAY, d: 80, az: -21 }, "sine.inOut");
  st(at("regles49") - 0.05, 0.7, { setpt: 1 }, "power2.out"); // « …à 49 hertz »
  fig({ id: "c4-regle", k: "RÉGLÉ À", v: "49", s: "HERTZ", tone: "veille", from: at("regles49") + 0.1, to: at("relais$") });

  /* ═════════ 414,6 → 419,9 · « Pas d'ordinateur central… la même aiguille » · « Quarante-neuf. » ═════════ */
  // round: the relay's little dial → the big one, the West's dust of relays behind it
  const tSame = F("seul", -0.14);
  cut(tSame, SET.CARTE, VIEW.dialWest, { ...WEST, lost: 1, reserve: 1, pumps: 0, smallOut: 1, relays: 1, you: 1, marks: 1, dial: 1 }, { fade: 0.2 });
  path(
    [
      [tSame, VIEW.dialWest],
      ["memeAiguille", { ...VIEW.dialWest, tx: VIEW.dialWest.tx - 25, d: 260, az: -104 }],
      [F("clac", 0.93), { ...VIEW.dialMap, d: 175, az: -108 }], //  « Quarante-neuf » : onto the needle
    ],
    { from: "go", to: "go" },
  );
  st(at("seul") + 0.3, at("q49") - at("seul") - 0.85, { hzW: 49.05 }, "sine.inOut");
  st(at("q49") - 0.55, 0.55, { hzW: 49.0 }, "sine.out"); //   the needle on its mark

  /* ═════════ 419,9 → 420,95 · « Les relais ouvrent. » ═════════ */
  // round → the piece that snaps: the first cell's breaker, in profile, in the poste (the carriage out: heroOpen 1)
  const tBrk = F("clac", 0.93);
  cut(tBrk, SET.QUARTIER, VIEW.breakerQ, { ...free(AT.poste), ...HDR, feed: 1, setpt: 1, heroOpen: 1, clac: 0, hero: 1, shed: 0 }, { fade: 0.15 });
  shot(tBrk, at("ouvrent") + 0.05 - tBrk, { ...VIEW.breakerQ, d: 170 }, "sine.out"); // still before the snap
  st(at("ouvrent") + 0.1, 0.15, { clac: 1 }, "power2.out"); // the snap (the clack is in the sfx, in the breath after)
  punch(at("ouvrent") + 0.1, 0.06, { hold: 0.12, down: 0.28 });

  /* ═════════ 420,95 → 427,9 · five million homes · perhaps yours · the hospitals ═════════ */
  // object: from the breaker, the feeder under the street
  const tFeed = F("foyers", -0.11);
  cut(tFeed, null, VIEW.feeders, { fs: 1500, you: 1 });
  shot(tFeed, F("tien", -0.3) - tFeed, { ...VIEW.feeders, d: 8200, az: -56 }, "sine.inOut");
  st(tFeed + 0.25, 2.4, { shed: 1 }, "sine.inOut"); //       the feeder dies from the poste, the windows go dark
  fig({ id: "c4-foyers", v: "5 MILLIONS", s: "DE FOYERS", tone: "veille", from: at("foyers5") - 0.35, to: F("tien", -0.3) });
  const tWin = F("tien", -0.3);
  const WIN = { ...VIEW.windowC, d: 1300, az: -28, el: 2 };
  cut(tWin, null, WIN, {}); //                                 your window, out
  shot(tWin, F("hopitaux", -0.15) - tWin, { ...WIN, d: 1180, az: -25 }, "sine.inOut");
  const tHosp = F("hopitaux", -0.15);
  cut(tHosp, null, VIEW.hospital, {});
  shot(tHosp, F("ouest", -0.1) - tHosp, { ...VIEW.hospital, d: 4600, az: -26 }, "sine.inOut");
  st(at("hopitaux") + 0.1, 2.2, { prio: 1 }, "sine.inOut"); // « une liste qu'on ne coupe pas »

  /* ═════════ 427,9 → 433,75 · 17 000 MW cut across the West · Portugal ═════════ */
  // form: the dark windows → the dark patches on the plate
  const tShed = F("ouest", -0.1);
  cut(tShed, SET.CARTE, VIEW.westPlate, { ...WEST, lost: 1, reserve: 1, pumps: 0, smallOut: 1, relays: 1, you: 1, shed: 0, marks: 0 }, { fade: 0.2 });
  path(
    [
      [tShed, VIEW.westPlate],
      ["mw17000", { ...VIEW.westPlate, tx: -175, tz: 60, d: 470, az: -28 }],
      ["portugal", { ...VIEW.iberia, d: 300 }],
      [F("tient", -0.11), { ...VIEW.iberia, d: 270, az: -26 }],
    ],
    { from: "go", to: "go" },
  );
  st(tShed + 0.3, 2.4, { shed: 1 }, "sine.inOut"); // uneven dark patches across the West
  fig({ id: "c4-17000", k: "COUPÉS", v: "17 000", s: "MÉGAWATTS", tone: "veille", from: at("mw17000") - 1.0, to: at("portugal") - 0.4 });
  fig({ id: "c4-portugal", k: "PORTUGAL · PRESQUE", v: "1 / 5", s: "DE LA CONSOMMATION", tone: "veille", from: at("portugal") - 0.25, to: at("ouest$") });

  /* ═════════ 433,75 → 439,3 · « 22:10:39. L'aiguille s'arrête. Tout près de quarante-neuf. Ça tient. » ═════════ */
  const tStop = F("tient", -0.11);
  cut(tStop, null, { ...VIEW.dialMap, d: 140 }, { marks: 1, dial: 1 });
  shot(tStop, F("etage", -0.15) - tStop, { ...VIEW.dialMap, d: 170, az: -110, el: 6 }, "sine.inOut"); // only a slow pull-back
  // (turnW's single tween ends on `arrete`: the marks keep the common pace again)

  /* ═════════ 439,3 → 442,7 · « En France, un seul étage du plan a servi. Il en restait trois. » ═════════ */
  // round → the four voyants
  const tSteps = F("etage", -0.15);
  cut(tSteps, SET.BENCH, VIEW.heroSteps, { ...free(AT.hero), ...HDR, clac: 1, heroOpen: 0, setpt: 1, steps: 0 }, { fade: 0.2 });
  shot(tSteps, F("inverse", -0.11) - tSteps, { ...VIEW.heroSteps, d: 430, az: -16 }, "sine.inOut");
  st(tSteps + 0.3, 1.8, { steps: 4 }, "none");
  fig({ id: "c4-etage", k: "ÉTAGES DU PLAN", v: "1 SUR 4", s: "A SERVI", tone: "veille", from: at("unEtage") - 0.1, to: at("etage$") });

  /* ═════════ 442,7 → 446,57 · « Mais à l'autre bout de l'Europe… c'est exactement l'inverse » ═════════ */
  const tInv = F("inverse", -0.11);
  const PRE = { ...VIEW.westPlate, tx: -178, tz: 40, d: 545, az: -36 };
  cut(tInv, SET.CARTE, PRE, { ...WEST, lost: 1, reserve: 1, pumps: 0, smallOut: 1, relays: 1, you: 1, shed: 1, marks: 0 }, { fade: 0.2 });
  path(
    [
      [tInv, PRE],
      [onFrame(tEnd) - 1.4, VIEW.westPlate], // the seam's move leaves from here, toward the east
    ],
    { from: "go", to: "rest" },
  );
  seam(D, "c45", "out");
}
