// Chapter 11 · Le test — beats pret → temoin (docs/L01-actes.md · c6). The climax: every test in cuts, one breath of
// the voice = one shot, and every shot moves. The threat (the balls, the head, the punch) is signal; `mood` 1 from
// "On le frappe" to "Rien ne passe" (the release). The tower in a wide shot is unreadable: it is a scale shot only,
// the tests are held in close-ups (the ball, the plate, the box, the head, the web, the witness).
import { SET, AT, onLine, span, run } from "./world.js";
import { ST } from "./plan.js";
import { fact } from "@kit/long.js";

const X = ST.test; // optics 11050 · tower 11300 · frame 11850 · witness 12250 · plate y 100

export default function ({ D }) {
  const [from, to] = span(D, "pret", "recap");
  run(D, from, to);
  const T = D.times({
    detruire: "pret:détruire",
    optique: "optique",
    lumiere: "optique:soixante",
    tordre: "optique:tordre",
    dedoubler: "optique:dédoubler",
    devant: "optique:devant",
    deform: "optique:déformation",
    trois: "optique:trois",
    frappe: "zero:frappe",
    bille: "bille",
    kilos: "bille:kilos",
    lachee: "bille:lâchée",
    quatre: "bille:quatre",
    tape: "bille:frappe",
    casse: "bille:casse",
    tient: "bille:tient",
    passer: "bille:elle#2",
    unefois: "bille:et",
    onze: "bille:onze",
    froid: "froid",
    g227: "froid:petite",
    lachee2: "froid:lâchée",
    neuf: "froid:neuf",
    plaque: "froid:sur",
    plus40: "froid:plus",
    moins20: "froid:moins",
    detache: "froid:détache",
    g25: "froid:vingt-cinq",
    tete: "tete",
    factice: "tete:une#2",
    dix: "tete:dix",
    lachee3: "tete:lâchée",
    metre: "tete:mètre",
    surprise: "surprise",
    reussir: "surprise:pour",
    casser: "surprise:casser",
    cercles: "surprise:cercles",
    proches: "surprise:les",
    huit: "surprise:huit",
    reponse: "reponse",
    eclat: "reponse:et",
    colle: "reponse:collé",
    rien: "reponse:rien",
    passe: "reponse:passe",
    temoin: "temoin",
    coup: "temoin:coup",
    sec: "temoin:sec",
    compte: "temoin:on",
    carre: "temoin:carré",
    cinq: "temoin:cinq",
    quarante: "temoin:quarante",
  });
  const tozero = D.at("tozero");
  const trigger = D.at("trigger");

  // the test hall, whole: the finished windshield (on the frame or on the bench), the witness on its stand
  const HALL = { ...AT.line, step: 8, temp: 20, tempOn: 1, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, witness: 1, hot: 0.2 };
  const at = (x, y, s) => ({ fx: x, fy: y, fz: 0, fs: s }); // where the light looks

  /** A line of a fact that comes in later than the fact itself (the number when the voice says it). */
  const late = (node, sel, t) => {
    const el = node.querySelector(sel);
    D.tl.set(el, { opacity: 0 }, Math.max(0, t - 2));
    D.tl.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: "power3.out", immediateRender: false }, t);
  };

  /* ── « Ton pare-brise est fini. Maintenant… on va essayer de le détruire. » ─────────────────────────────────────
     The whip under the card: the hall seen from high above, then fast down to the frame; the windshield slides
     onto the frame; on "détruire" the camera drops under the head that hangs over it. */
  D.cut(from, SET.LINE, onLine(11560, { ty: 130, d: 1500, az: 34, el: 50, side: -220 }), { ...HALL, pos: X.frame, mood: 0, ...at(X.frame, 120, 420) });
  D.shot(from + 0.05, 0.85, onLine(11760, { ty: 120, d: 560, az: -30, el: 30, side: -220 }), "power3.out", 1500);
  D.shot(from + 0.9, 2.6, onLine(X.frame, { ty: 120, d: 470, az: -22, el: 24, side: -200 }), "sine.inOut");
  D.shot(T.detruire - 0.5, 1.5, onLine(X.frame, { ty: 190, d: 340, az: -12, el: 2, fov: 32, side: -170 }), "sine.inOut", 470);

  /* ── « Mais d'abord, on regarde au travers. … 70 % … tordre … dédoubler. Devant tes yeux… trois fois plus faible. »
     The optical bench: its grid seen THROUGH the windshield, from above (the grid is under the glass). */
  const tOpt = T.optique - 0.12;
  D.cut(tOpt, SET.LINE, onLine(X.optics, { ty: 70, d: 420, az: -14, el: 48, side: -200 }), { ...HALL, pos: X.optics, optic: 1, mood: 0, ...at(X.optics, 80, 380) });
  D.shot(tOpt + 0.05, T.tordre - tOpt - 0.2, onLine(X.optics, { ty: 70, d: 380, az: -32, el: 40, side: -190 }), "sine.inOut");
  D.st(T.tordre, 0.45, { optic: 2 }, "power2.inOut");
  D.st(T.dedoubler, 0.45, { optic: 3 }, "power2.inOut");
  D.shot(T.tordre - 0.15, T.devant - T.tordre, onLine(X.optics, { ty: 62, d: 270, az: -22, el: 52, side: -170 }), "sine.inOut", 380);
  D.st(T.devant, 0.5, { optic: 1 }, "power2.inOut");
  D.shot(T.devant - 0.1, tozero - T.devant + 0.1, onLine(X.optics, { ty: 58, d: 230, az: -6, el: 62, side: -150 }), "sine.inOut", 270);
  fact(D.tl, { id: "c6-70", k: "Lumière transmise", v: "≥ 70 %", from: T.lumiere, to: T.devant - 0.1 });
  const f3 = fact(D.tl, { id: "c6-3x", k: "Déformation tolérée", v: "3 × moins", s: "Devant tes yeux", from: T.deform, to: tozero });
  late(f3, ".fact__v", T.trois);

  /* ── « Dernière étape. On le frappe. » — the tower: a scale shot that climbs to the 2.26 kg ball; signal on "frappe" */
  D.cut(tozero, SET.LINE, onLine(X.tower, { ty: 280, d: 1100, az: -30, el: 4, side: -170 }), { ...HALL, pos: X.frame, sample: 1, web: 0, rings: 0, mood: 0, ...at(X.tower, 300, 600) });
  D.st(T.frappe, 0.25, { mood: 1 }, "power2.out");
  D.shot(tozero + 0.05, T.bille - tozero - 0.1, onLine(X.tower, { ty: 470, d: 420, az: -24, el: -6, side: -170 }), "sine.inOut", 1100);

  /* ── « Une bille d'acier de plus de deux kilos. Lâchée de quatre mètres. Elle frappe. Le verre casse. Le film tient.
     Elle ne doit pas passer. Et pas une fois : onze plaques sur douze doivent tenir. » */
  D.now(T.bille, at(X.tower, 500, 200));
  D.shot(T.bille - 0.1, T.kilos - T.bille + 0.2, onLine(X.tower, { ty: 504, d: 115, az: -18, el: -3, side: -170 }), "sine.inOut", 420);
  D.shot(T.kilos + 0.1, T.lachee - T.kilos - 0.05, onLine(X.tower, { ty: 504, d: 105, az: -8, el: -1, side: -170 }), "sine.inOut");
  const tHit = T.tape; // the ball meets the sample on "frappe"
  const fallFrom = T.lachee + 0.08;
  const tPlate = tHit - 0.16;
  D.st(fallFrom, tHit - fallFrom, { ball: 1 }, "none"); // k² inside: slow, then fast
  D.st(fallFrom, tPlate - fallFrom, { fy: 140 }, "power2.in");
  D.shot(fallFrom, tPlate - fallFrom, onLine(X.tower, { ty: 170, d: 210, az: -22, el: 3, side: -170 }), "power2.in"); // it falls with the ball
  D.cut(tPlate, SET.LINE, onLine(X.tower, { ty: 100, d: 135, az: -30, el: 38, side: -180 }), { ...HALL, pos: X.frame, sample: 1, web: 0, rings: 0, mood: 1, ...at(X.tower, 105, 160) });
  D.st(tHit, 0.15, { web: 0.12 }, "power2.out"); // the crushed star, on the blow
  D.jolt(tHit, 0.35, 0.4);
  D.st(T.casse, 0.7, { web: 0.8, rings: 0.7 }, "power2.out");
  D.st(T.tient, 0.7, { stick: 1 }, "power2.inOut");
  D.shot(tPlate + 0.05, T.passer - tPlate - 0.15, onLine(X.tower, { ty: 100, d: 118, az: -14, el: 42, side: -180 }), "sine.inOut");
  // close over the sample: the ball rests in the web, on the film — it has not gone through
  D.cut(T.passer - 0.1, SET.LINE, onLine(X.tower, { ty: 101, d: 80, az: 30, el: 56, side: -170 }), {});
  D.st(T.passer, 0.9, { ball: 1.2 }, "power2.out");
  D.shot(T.passer - 0.05, T.unefois - T.passer, onLine(X.tower, { ty: 101, d: 72, az: 48, el: 60, side: -170 }), "sine.inOut");
  D.shot(T.unefois - 0.05, T.froid - T.unefois, onLine(X.tower, { ty: 104, d: 200, az: 30, el: 26, side: -180 }), "sine.inOut", 72);
  const f226 = fact(D.tl, { id: "c6-226", k: "Bille d'acier", v: "2,26 kg", s: "Lâchée de 4 m", tone: "signal", from: T.kilos, to: tPlate - 0.02 });
  late(f226, ".fact__s", T.quatre);
  fact(D.tl, { id: "c6-1112", k: "Plaques qui tiennent", v: "11 sur 12", tone: "veille", from: T.onze, to: T.froid - 0.12 });

  /* ── « Une petite bille, cette fois, de 227 g. Lâchée d'environ neuf mètres, sur une plaque de feuilleté à plus
     quarante degrés… puis à moins vingt. Ce qui se détache ne doit pas dépasser vingt-cinq grammes. » */
  const tSmall = T.froid - 0.12;
  const SM = [X.tower + 8, X.y + 900, 5]; // the 227 g ball, held on its own axis, ≈ 9 m over the sample
  D.cut(tSmall, SET.LINE, { ...onLine(SM[0], { ty: SM[1] + 2, tz: SM[2], d: 52, az: -34, el: -8, side: -170 }) }, { ...HALL, pos: X.frame, sample: 1, ball: 0, small: 0, web: 0, rings: 0, stick: 0, mood: 1, ...at(SM[0], SM[1], 200) });
  D.shot(tSmall + 0.05, T.lachee2 - tSmall, onLine(SM[0], { ty: SM[1], tz: SM[2], d: 40, az: -12, el: -3, side: -170 }), "sine.inOut");
  const hit2 = T.detache; // it lands on "Ce qui se détache"
  D.st(T.lachee2, hit2 - T.lachee2, { small: 1 }, "none");
  const tBox = T.plaque - 0.1;
  // the camera falls with it, close (k² in the tower: ≈ 9 m × u² of the way, the same curve as power2.in)
  const u2 = ((tBox - T.lachee2) / (hit2 - T.lachee2)) ** 2;
  D.shot(T.lachee2, tBox - T.lachee2, onLine(SM[0], { ty: SM[1] - 900 * u2, tz: SM[2], d: 46, az: 4, el: 2, side: -170 }), "power2.in");
  D.cut(tBox, SET.LINE, onLine(X.tower, { ty: 110, d: 185, az: -36, el: 24, side: -140 }), { ...at(X.tower, 110, 200) });
  D.st(T.plus40, 0.5, { chamber: 1 }, "power2.inOut");
  D.now(T.plus40, { temp: 40 });
  D.st(T.moins20, 0.7, { chamber: -1 }, "power2.inOut");
  D.now(T.moins20, { temp: -20 });
  D.shot(tBox + 0.05, hit2 - tBox - 0.1, onLine(X.tower, { ty: 108, d: 160, az: -12, el: 22, side: -140 }), "sine.inOut");
  D.st(hit2, 0.5, { web: 0.3, rings: 0.2 }, "power2.out");
  D.shot(hit2 - 0.05, T.tete - hit2, onLine(X.tower, { ty: 103, d: 150, az: -4, el: 44, side: -150 }), "sine.inOut", 205);
  const f227 = fact(D.tl, { id: "c6-227", k: "Petite bille", v: "227 g", s: "Lâchée d'environ 9 m", tone: "signal", from: T.g227, to: tBox - 0.02 });
  late(f227, ".fact__s", T.neuf);
  const f25 = fact(D.tl, { id: "c6-25", k: "Ce qui se détache", v: "≤ 25 g", tone: "veille", from: T.detache + 0.3, to: T.tete - 0.14 });
  late(f25, ".fact__v", T.g25);

  /* ── « Puis une tête. Une tête factice de dix kilos, lâchée d'un mètre cinquante. Elle tombe. » ───────────────── */
  const tHead = T.tete - 0.12;
  D.cut(tHead, SET.LINE, onLine(X.frame, { ty: 160, d: 420, az: -44, el: 22, side: -180 }), { ...HALL, pos: X.frame, sample: 0, ball: 0, small: 0, chamber: 0, web: 0, rings: 0, stick: 0, drop: 0, mood: 1, ...at(X.frame, 150, 380) });
  D.shot(tHead + 0.05, T.factice - tHead, onLine(X.frame, { ty: 175, d: 360, az: -26, el: 16, side: -180 }), "sine.inOut");
  D.shot(T.factice - 0.05, 1.2, onLine(X.frame, { ty: 252, d: 105, az: -16, el: 6, side: -160 }), "sine.inOut", 360);
  D.shot(T.lachee3 - 0.05, trigger - T.lachee3 - 0.2, onLine(X.frame, { ty: 175, d: 320, az: -22, el: 3, side: -160 }), "sine.inOut", 105); // down the 1.5 m
  const tLow = trigger - 0.22;
  D.cut(tLow, SET.LINE, onLine(X.frame, { ty: 140, d: 300, az: -20, el: 5, fov: 32, side: -150 }), { ...at(X.frame, 100, 260) });
  const fall = 0.55; // 1.5 m: ≈ 0.55 s
  const contact = trigger + fall;
  D.st(trigger, fall, { drop: 1 }, "none");
  D.st(contact, 0.5, { web: 0.55, rings: 0.1 }, "power2.out");
  D.jolt(contact, 0.3, 0.4);
  D.shot(tLow + 0.05, T.reussir - tLow - 0.1, onLine(X.frame, { ty: 112, d: 230, az: -14, el: 9, fov: 32, side: -150 }), "sine.inOut", 300);
  const f10 = fact(D.tl, { id: "c6-10", k: "Tête factice", v: "10 kg", s: "Lâchée d'1,5 m", tone: "signal", from: T.dix, to: tLow - 0.02 });
  late(f10, ".fact__s", T.metre);

  /* ── « Et là, pour réussir l'essai… le pare-brise doit casser. Des cercles de fissures, tout autour de la tête.
     Les plus proches, à moins de huit centimètres. » — the payoff of the hook: the web pushes, its rings light up */
  const tWeb = T.reussir - 0.1;
  D.cut(tWeb, SET.LINE, onLine(X.frame, { ty: 98, d: 170, az: -62, el: 26, side: -160 }), { ...at(X.frame, 95, 200) });
  D.shot(tWeb + 0.05, T.cercles - tWeb, onLine(X.frame, { ty: 96, d: 150, az: -36, el: 34, side: -160 }), "sine.inOut");
  D.st(T.casser, 0.9, { web: 1 }, "power2.out");
  D.st(T.cercles, 1.4, { rings: 1 }, "power2.inOut");
  D.shot(T.cercles - 0.05, T.proches - T.cercles, onLine(X.frame, { ty: 95, d: 140, az: -24, el: 50, side: -160 }), "sine.inOut");
  D.shot(T.proches - 0.05, T.reponse - T.proches + 0.3, onLine(X.frame, { ty: 94, d: 115, az: -18, el: 72, side: -160 }), "sine.inOut", 140);
  fact(D.tl, { id: "c6-8", k: "Les cercles les plus proches", v: "< 8 cm", tone: "veille", from: T.huit, to: T.eclat - 0.2 });

  /* ── « Ces fissures dissipent une partie du choc. Et chaque éclat reste collé au film. Rien ne vole. Rien ne passe. » */
  D.shot(T.reponse + 0.3, T.eclat - T.reponse - 0.3, onLine(X.frame, { ty: 95, d: 150, az: 12, el: 56, side: -160 }), "sine.inOut");
  const tShards = T.eclat - 0.1;
  D.cut(tShards, SET.LINE, onLine(X.frame, { ty: 94, tz: 22, d: 95, az: -52, el: 34, side: -150 }), { ...at(X.frame, 95, 160) });
  D.st(T.colle, 0.7, { stick: 1 }, "power2.inOut");
  D.st(T.colle, 0.9, { drop: 1.15 }, "power2.out");
  D.shot(tShards + 0.05, T.rien - tShards, onLine(X.frame, { ty: 94, tz: 22, d: 80, az: -38, el: 38, side: -150 }), "sine.inOut");
  const tUnder = T.rien - 0.1;
  D.cut(tUnder, SET.LINE, onLine(X.frame, { ty: 88, d: 150, az: -34, el: -20, side: -160 }), { ...at(X.frame, 95, 260) });
  D.shot(tUnder + 0.05, T.temoin - tUnder, onLine(X.frame, { ty: 92, d: 165, az: 2, el: -18, side: -160 }), "sine.inOut");
  D.st(T.passe, 0.35, { mood: 0 }, "power2.inOut"); // the release: the system has won

  /* ── « À côté, un verre trempé. Un coup sec. On compte les grains dans un carré de cinq centimètres : pas moins
     de quarante. » — along the hall to the witness; the punch; its grains, counted in the 5 cm square */
  const tWit = T.temoin - 0.1;
  D.cut(tWit, SET.LINE, onLine(X.witness - 70, { ty: 110, d: 280, az: -38, el: 34, side: -170 }), { ...at(X.witness, 110, 200) });
  D.shot(tWit + 0.05, T.coup - tWit, onLine(X.witness, { ty: 106, d: 165, az: -20, el: 42, side: -170 }), "sine.inOut");
  D.st(T.coup + 0.05, T.sec - T.coup + 0.02, { strike: 1 }, "power2.in");
  D.st(T.sec + 0.07, 1.2, { grains: 1 }, "power1.out");
  D.jolt(T.sec + 0.07, 0.25, 0.35);
  D.shot(T.coup, T.compte - T.coup, onLine(X.witness, { ty: 104, d: 150, az: -12, el: 46, side: -170 }), "sine.inOut");
  const SQ = [X.witness + 12, X.y + 1, 10]; // the counting square (postes.js · squareAt)
  D.shot(T.compte - 0.05, T.cinq - T.compte, onLine(SQ[0], { ty: SQ[1], tz: SQ[2], d: 46, az: 20, el: 58, side: -130 }), "sine.inOut", 150);
  D.st(T.compte, 0.8, { strike: 0 }, "power2.inOut"); // the punch lifts off: the grains are left to count
  D.st(T.carre, 0.5, { count: 1 }, "power2.out");
  D.shot(T.cinq, to - T.cinq, onLine(SQ[0], { ty: SQ[1], tz: SQ[2], d: 38, az: 36, el: 62, side: -130 }), "sine.inOut");
  fact(D.tl, { id: "c6-5", k: "Un carré de", v: "5 × 5 cm", from: T.cinq, to: T.quarante - 0.05 });
  fact(D.tl, { id: "c6-40", k: "Pas moins de", v: "40 grains", from: T.quarante, to });
}
