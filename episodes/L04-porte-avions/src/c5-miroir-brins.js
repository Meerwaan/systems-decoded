// c5 · « De nuit » de « Devant toi, un repère » à la fin, « L'officier d'appontage », « Les trois brins d'arrêt »
// jusqu'à « pour l'avion qui arrive » — HAND.c45 (414,15) → the c56 seam (525,53). The plan, phrase by phrase:
// docs/L04-actes.md, « c5 » ; journal docs/journal/L04-c5.md.
// Here the approach is EXPLAINED: the mirror and its ball, the paddles of before, the officer and his power, the laser,
// the go-around and the tanker, then 1911 on the bench, and the three wires and Andromède's brake under the deck.
// Every instant is read off the script (D.times). A cut that falls while `run` is carried by its one tween (your
// approach, 438,9 → 476,4) says only what changes, never `run`: the tween runs through it.
import { SET, AT, HAND, VIEW, CLOSE, SHARP, APPROACH, seam, onFrame, cardAt, approachRun, CARD_LEAD } from "./world.js";
import { MIRROR, LSO, BRINS, TOUCH, RAFALE, onAngled, jetAt } from "./plan.js";
import { fact, chipEl } from "@kit/long.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const DEG = Math.PI / 180;
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const unit = (a) => mul(a, 1 / Math.hypot(a[0], a[1], a[2]));
const mix = (a, b, u) => add(a, mul(sub(b, a), u));
/** A pose from where the camera STANDS (`eye`) toward what it looks at (`tgt`). */
const aimAt = (eye, tgt, extra = {}) => {
  const v = sub(eye, tgt);
  const d = Math.hypot(v[0], v[1], v[2]);
  return { ...P, tx: tgt[0], ty: tgt[1], tz: tgt[2], d, az: Math.atan2(v[0], v[2]) / DEG, el: Math.asin(v[1] / d) / DEG, ...extra };
};
/** Behind `head`, `back` cm, on the side `turn`° off the line head → `far` (positive: the eye to starboard of it), `up` cm higher. */
const behind = (head, far, back, turn, up) => {
  const u = unit(sub(far, head));
  const ya = Math.atan2(u[0], u[2]) + turn * DEG;
  return [head[0] - back * Math.sin(ya), head[1] + up, head[2] - back * Math.cos(ya)];
};

const MB = [MIRROR.at[0], 190, MIRROR.at[2]]; //   the meatball on its datum (model.js · YC)
const HL = [LSO.at[0], 95, LSO.at[2]]; //          the landing officer's chest (his platform is 40 cm under the deck)
const A3 = onAngled(BRINS.s[2]); //                Andromède, mid-runway
const L0 = onAngled(900, -1350, 130); //           the laser's source (model.js · LASER0)
const J = [0, 0, 0, 0, 0];
const jet3 = (run, alt) => {
  jetAt(3, run, alt, J);
  return [J[0], J[1] + 120, J[2]];
};

export default function ({ D, world }) {
  const { at, st, now, shot, cut } = D;
  const F = (t) => onFrame(t);
  const t = D.times({
    repere: "miroir:repère", panneau: "miroir:panneau",
    boule: "ball", monte: "boule:monte", descend: "boule:descend", haut: "high", bas: "low",
    meat: "meatball:les", officier: "raquettes:officier", paddles: "paddles",
    visi: "visibilite", visibility: "visibility",
    quinze: "quinze", quinzeW: "quinze:quinze", slope: "slope", aoa: "aoa", axis: "axis",
    regarde: "regarde", cancel: "cancel",
    lsoB: "lso:lui", radio: "radio", plusHaut: "radio:haut", gauche: "radio:gauche",
    juge: "juge", pente: "juge:pente", lui: "juge:c'est",
    laserB: "laser:un", laserW: "laser",
    pouvoir: "pouvoir", recommencer: "pouvoir:recommencer", goaround: "goaround", tour: "pouvoir:tour", reviens: "pouvoir:reviens",
    planb: "planb", ashore: "ashore",
    y1911: "y1911", ropes: "ropes", sand: "sand",
    teste: "teste", paul: "teste:paul",
    cinq: "cinq", five: "five", cable: "cinq:câble", france: "cinq:france",
    wires: "wires", athena: "athena", aphrodite: "aphrodite",
    lastwire: "lastwire", andromeda: "andromeda", sauvee: "andromede:sauvée",
    usure: "usure", wear: "wear", sous: "usure:sous", brakeset: "brakeset",
    bolter: "bolter:au",
  });
  // THE SEAM c56: HAND.c56.at is "bolter-0.2", and "bolter" is ALSO a cue (530,94, « repars ») — the cue wins
  // (ref.mjs · resolveMoment): it resolves to 530,74, not 525,53. The seam is meant at the beat's first word − 0.2:
  // laid here on that instant (see the journal, « À changer ailleurs »: HAND.c56.at → "bolter:au-0.2").
  const tOut = t.bolter - 0.2; //                      525,53
  const tLand = tOut - HAND.c56.opt.before; //        524,33: the camera is on HAND.c56.from[0]

  /* ═════════ 414,15 → 416,9 · « Devant toi, un repère au bord de la piste… » — the push into the black goes on ═════════ */
  const t45 = at(HAND.c45.at);
  seam(D, "c45", "in", { set: SET.PONT, state: { ...AT.night, ride: 1, track: 3, run: APPROACH.run, etape: 7, kmhOn: 0, hud: 1, mirror: 0, hook: 1, gas: 0.8 } });
  const tIn = t45 + HAND.c45.opt.after; //            the seam's move is over
  const tMir = F(t.panneau - 0.09); //                the cut to the mirror, a few frames before « panneau »
  // « un repère » : a cut to our own cockpit, higher (as c6's): over the canopy, your helmet small, the ship's lights ahead
  const tCk = F(t.repere - 0.07);
  const CKp = (fov) => aimAt(onAngled(TOUCH.s - RAFALE.cockpit[2] - 330, 0, 470), onAngled(TOUCH.s + 6500, 0, 0), { fov, ...SHARP });
  cut(tCk, null, CKp(40), { hud: 1 });
  shot(tCk, tMir - tCk, CKp(31)); //                  a lens that closes on the lights ahead
  st(t45, tMir - t45, { run: approachRun(D, tMir) }, "none"); // your approach, one law (world.js · APPROACH)
  st(t.repere, 0.7, { mirror: 1 }, "sine.inOut"); //  « un repère » : far ahead, left of the runway, the mirror lights

  /* ═════════ 416,9 → 426,0 · « …un panneau de lumières. Le miroir d'appontage. » · « Au centre, une boule… » ═════════ */
  // the cluster of lights ahead → the mirror's lights, at the same place (the middle of the picture): OBJECT
  const M1 = { ...P, ...CLOSE, tx: MB[0], ty: MB[1], tz: MB[2], d: 1500, az: 17, el: 3 };
  const M1b = { ...M1, d: 1250, az: 12 };
  const M2 = { ...M1, d: 640, az: 8, el: 2 }; //     on the ball: its travel (± 125 cm) fills the height
  cut(tMir, null, M1, { ride: 0, hud: 0, fx: MB[0], fy: 150, fz: MB[2], fs: 900 });
  const tBall = F(t.boule - 0.1);
  shot(tMir, tBall - tMir, M1b);
  // « boule » : a cut on the ball, from a little below and to the left — the lens fills the picture; a push
  const M3a = { ...M1, d: 820, az: -8, el: -5 };
  const M3b = { ...M2, d: 600, az: -2, el: -3 };
  cut(tBall, null, M3a, {});
  shot(tBall, F(t.meat - 0.07) - tBall, M3b);
  st(t.monte, 0.34, { ball: 0.6 }, "sine.inOut"); //                « monte »
  st(t.descend, 0.5, { ball: -0.3 }, "sine.inOut"); //              « ou descend »
  st(t.haut - 0.15, 0.42, { ball: 0.7 }, "sine.inOut"); //          « trop haut »
  st(t.bas - 0.13, 0.45, { ball: -0.7 }, "sine.inOut"); //          « trop bas » : it turns signal

  /* ═════════ 426,0 → 431,7 · « Les pilotes l'appellent… la meatball. La boulette de viande. » ═════════ */
  // a cut inside the place, on the ball at the same place; from its side (its depth, the arms of lights) back to its face
  const tMeat = F(t.meat - 0.07);
  const M4a = { ...P, ...CLOSE, tx: MB[0], ty: MB[1], tz: MB[2], d: 820, az: 70, el: 22 };
  const M4b = { ...M4a, d: 980, az: 22, el: 4 };
  const tLso5 = F(t.officier - 0.12);
  cut(tMeat, null, M4a, {});
  shot(tMeat, tLso5 - tMeat, M4b);
  st(tMeat + 0.2, 0.8, { ball: 0 }, "sine.inOut"); //                back on the datum

  /* ═════════ 431,7 → 434,4 · « …un officier guidait les pilotes avec des raquettes de couleur. » ═════════ */
  // the two arms of lights across the picture → the officer's two arms spread, his paddles, at the same place: SHAPE
  const L5a = { ...P, ...CLOSE, tx: HL[0], ty: HL[1], tz: HL[2], d: 760, az: 6, el: 4 };
  const L5b = { ...L5a, d: 650, az: -5 };
  const tVis = F(t.visi - 0.08);
  cut(tLso5, null, L5a, { lso: 1, paddles: 0.5, mirror: 0, fx: HL[0], fy: 100, fz: HL[2], fs: 500 });
  shot(tLso5, tVis - tLso5, L5b);
  st(t.paddles, 0.5, { paddles: 1 }, "sine.inOut"); //                « raquettes » : he tilts them
  fact(D.tl, { id: "c5-raq", k: "Jusqu'aux", v: "ANNÉES 1960", s: "des raquettes de couleur", from: tLso5 + 0.15, to: tVis - 0.03 });

  /* ═════════ 434,4 → 438,9 · « Mais ce miroir, il faut encore le voir. Il ne marche que si la visibilité le permet. » ═════════ */
  // from the approach, ≈ 150 m out on the glide slope, a long lens: the mirror small but bright, the runway that places it
  const M6a = aimAt(onAngled(-9800, -400, 830), MB, { fov: 10, ...SHARP });
  const M6b = aimAt(onAngled(-9100, -390, 790), MB, { fov: 10, ...SHARP });
  const tApp = F(t.quinze - 0.1);
  cut(tVis, null, M6a, { lso: 0, paddles: 0, mirror: 1, fx: MB[0], fy: 150, fz: MB[2], fs: 2500 });
  shot(tVis, tApp - tVis, M6b);
  st(t.visibility - 0.15, 0.75, { mist: 1 }, "sine.inOut"); //       « visibilité » : its lights blur into halos and fade

  /* ═════════ 438,9 → 445,9 · « Et dans la dernière ligne droite, tu as quinze à vingt secondes pour tout tenir… » ═════════ */
  // behind your aircraft on the glide slope (ride 1): the runway ahead; the three guides, one per word
  const RUN0 = -800;
  const tTank = F(t.planb - 0.06);
  const runAt = (time) => RUN0 + 15 * (time - tApp); //  slowed: the voice explains, the picture keeps flying
  const APP1 = { ...VIEW.approach, d: 3300, az: 11, el: 10 }; // from above: the ship's lights show over your aircraft
  const APP2 = { ...APP1, d: 2800, az: 4, el: 9 };
  const tReg = F(t.regarde - 0.07);
  cut(tApp, SET.PONT, APP1, { ...AT.night, etape: 7, kmhOn: 0, ride: 1, track: 3, run: RUN0, hook: 1, gas: 0.8, jet: 1, mirror: 1, mist: 0 });
  shot(tApp, tReg - tApp, APP2);
  st(tApp, tTank - 0.04 - tApp, { run: runAt(tTank - 0.04) }, "none"); // ONE tween for your approach, through the cuts
  st(t.slope, 0.5, { guides: 1 / 3 }, "sine.inOut"); //               « ta pente »
  st(t.aoa, 0.5, { guides: 2 / 3 }, "sine.inOut"); //                 « l'angle de ton avion »
  st(t.axis, 0.5, { guides: 1 }, "sine.inOut"); //                    « l'axe de la piste »
  fact(D.tl, { id: "c5-quinze", k: "La dernière ligne droite", v: "15 À 20 SECONDES", from: t.quinzeW, to: t.slope - 0.15 });

  /* ═════════ 445,9 → 451,4 · « Mais tu n'es pas seul. Au bord de la piste, quelqu'un te regarde arriver… et il peut tout annuler. » ═════════ */
  // you were behind your aircraft; now you are where it comes from: the officer watches you
  // from where you come (astern of them, low): the officer and his team face you, lit, the mirror's lights and the
  // deck behind them — you are what they watch; on the right third, clear of the keywords; a slow push and glide
  const L8a = aimAt(onAngled(1450, -2420, 175), add(HL, [0, 15, 0]), { fov: 34, side: -220, ...CLOSE });
  const L8b = aimAt(onAngled(2150, -1980, 125), add(HL, [0, 15, 0]), { fov: 34, side: -220, ...CLOSE });
  const tCard8 = F(at("lso:lui") - CARD_LEAD); //     the card « L'officier d'appontage » (451,37)
  cut(tReg, null, L8a, { ride: 0, lso: 1, lsoArm: 0, guides: 0, fx: HL[0], fy: 100, fz: HL[2], fs: 900 });
  shot(tReg, tCard8 - tReg, L8b); //                  a slow push, through the hold
  st(t.cancel, 0.45, { waveoff: 0.6 }, "sine.inOut"); // « annuler » : the wave-off lights breathe once
  st(t.cancel + 0.45, 0.75, { waveoff: 0 }, "sine.inOut");

  /* ═════════ card 451,37 · 452,3 → 457,2 · « Lui, c'est l'officier d'appontage. Un ancien pilote de l'aéronavale… » ═════════ */
  // under the card, a whip around him (the subject on the right: the card holds the left); then a slow orbit
  const L9a = { ...P, ...SHARP, tx: HL[0], ty: HL[1] + 5, tz: HL[2], d: 1150, az: -80, el: 9, side: -170 };
  const L9b = { ...L9a, d: 830, az: -40, el: 6 };
  const L9c = { ...L9b, ...CLOSE, d: 720, az: -17, el: 5 };
  const tRad = F(t.radio - 0.06);
  cut(tCard8, null, L9a, { etape: 8 });
  shot(tCard8, 1.7, L9b, "power2.out");
  shot(tCard8 + 1.7, tRad - (tCard8 + 1.7), L9c);
  st(t.lsoB + 0.8, 0.6, { lsoArm: 0.3 }, "sine.inOut"); //            his handset in hand

  /* ═════════ 457,2 → 461,6 · « Il te suit des yeux, et il te parle à la radio : un peu plus haut, un peu plus à gauche. » ═════════ */
  // over his left shoulder, a long lens on your aircraft: it rises a little, it banks
  const jRad = jet3(runAt(tRad + 2), 4);
  // his eyes, a very long lens: your aircraft ≈ 15 % of the width; aimed where it would be WITHOUT the correction, so
  // « plus haut » lifts it in the frame and « à gauche » tilts its wings
  const e10 = behind(HL, jRad, 150, -8, 75);
  const L10a = aimAt(e10, jet3(runAt(tRad), 0), { fov: 7, drift: 0.1, ...SHARP });
  const tLeft = F(t.gauche - 0.1);
  const L10b = aimAt(e10, jet3(runAt(tLeft), 0), { fov: 3.6, drift: 0.1, ...SHARP }); // the lens closes on it
  const tJuge = F(t.pente - 0.25); //                « Le miroir te donne… » rides on the shot ahead of you
  cut(tRad, null, L10a, { fx: HL[0], fy: 100, fz: HL[2], fs: 1500 });
  shot(tRad, tLeft - tRad, L10b, "none"); // the aim follows the aircraft at its own pace
  // « à gauche » : ahead of your aircraft and to its left (ride 1), a little below: its wings tilt, a slow orbit
  const FR1 = { ...VIEW.approach, ty: 250, d: 1700, az: 206, el: -3, fov: 34, ...SHARP };
  const FR2 = { ...FR1, d: 1550, az: 192, el: -1 };
  cut(tLeft, null, FR1, { ride: 1, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tLeft, tJuge - tLeft, FR2);
  st(t.plusHaut - 0.15, 0.9, { alt: 8 }, "sine.inOut"); //           « un peu plus haut »
  st(t.gauche - 0.1, 0.6, { bank: -12 }, "sine.inOut"); //           « à gauche »
  st(t.gauche + 0.6, 1.2, { bank: 0 }, "sine.inOut");

  /* ═════════ 461,6 → 467,0 · « Le miroir te donne ta pente. Lui surveille tout le reste. Et de nuit… c'est lui qui compte le plus. » ═════════ */
  // from the sea side, low: the mirror on the left, the officer on the right — then a push onto him
  const tg11 = mix(HL, MB, 0.45);
  const L11a = aimAt(onAngled(500, -3000, 250), tg11, { fov: 16, ...CLOSE });
  const e11b = onAngled(650, -2980, 245);
  const L11b = aimAt(e11b, mix(HL, MB, 0.43), { fov: 16, ...CLOSE });
  const L11c = aimAt(mix(e11b, HL, 0.4), HL, { fov: 16, ...CLOSE });
  const tLas = F(t.laserB - 0.08);
  cut(tJuge, null, L11a, { ride: 0, fx: tg11[0], fy: 100, fz: tg11[2], fs: 1800 });
  shot(tJuge, t.lui - 0.1 - tJuge, L11b);
  shot(t.lui - 0.1, tLas - (t.lui - 0.1), L11c); //                  « c'est lui qui compte le plus »
  st(t.pente - 0.1, 0.35, { ball: 0.3 }, "sine.inOut"); //           « ta pente » : the ball answers
  st(t.pente + 0.3, 0.6, { ball: 0 }, "sine.inOut");

  /* ═════════ 467,0 → 470,4 · « Un laser l'aide même à te repérer plus tôt… et à mieux te suivre. » ═════════ */
  // from abeam, far to port: the ship's stern and its lights on the left, the beam across the picture to your aircraft's
  // lights on the right — « te suivre » : it follows them; the camera slides aft with it
  const jLas = jet3(runAt(tLas + 1.5), 8);
  const mid = mix(L0, jLas, 0.5);
  const L12a = aimAt(add(mid, [-43000, 2600, 1500]), add(mid, [0, -300, 0]), { fov: 30, ...SHARP });
  const L12b = aimAt(add(mid, [-42500, 2500, 4000]), add(mid, [0, -300, 2500]), { fov: 30, ...SHARP });
  const tPow = F(t.pouvoir - 0.07);
  cut(tLas, null, L12a, { fx: L0[0], fy: 150, fz: L0[2], fs: 1500 });
  shot(tLas, tPow - tLas, L12b);
  st(t.laserW, 0.5, { laser: 1 }, "sine.inOut"); //                  « laser »

  /* ═════════ 470,4 → 473,2 · « Et il a un pouvoir : te faire recommencer. » ═════════ */
  // from the sea side, astern of him: the officer on the right, the mirror on the left; « recommencer » — the wave-off
  // lights, steady; his arm up
  const e13 = onAngled(1200, -3100, 230);
  const L13a = aimAt(e13, mix(HL, MB, 0.3), { fov: 26, ...CLOSE });
  const L13b = aimAt(mix(e13, HL, 0.35), mix(HL, MB, 0.18), { fov: 26, ...CLOSE }); // a push onto him as his arm goes up
  const tGa = F(t.goaround - 0.09);
  cut(tPow, null, L13a, { fx: HL[0], fy: 100, fz: HL[2], fs: 1500 });
  shot(tPow, tGa - tPow, L13b);
  st(t.recommencer, 0.5, { waveoff: 1 }, "sine.inOut");
  st(t.recommencer, 0.6, { lsoArm: 1 }, "sine.inOut");

  /* ═════════ 473,2 → 476,4 · « Tu remets les gaz, tu refais un tour… et tu reviens. » ═════════ */
  // behind your aircraft again (ride 1), from its left and a little below: full power, it climbs, it banks away
  const GA1 = { ...VIEW.approach, d: 2200, az: -28, el: 1, fov: 30 };
  const GA2 = { ...GA1, d: 2700, az: -42, el: 3 };
  cut(tGa, null, GA1, { ride: 1, laser: 0, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tGa, tTank - tGa, GA2);
  st(t.goaround, 0.5, { gas: 1 }, "sine.inOut"); //                  « tu remets les gaz »
  st(t.goaround, 2.75, { alt: 48 }, "sine.inOut");
  st(t.tour - 0.05, 0.85, { bank: 25 }, "sine.inOut"); //            « tu refais un tour »
  st(t.reviens, 0.5, { waveoff: 0 }, "sine.inOut"); //               « et tu reviens » (off the picture)

  /* ═════════ 476,4 → 484,0 · « Et si ça ne passe toujours pas ? Un avion ravitailleur… ou on t'envoie te poser à terre. » ═════════ */
  // in the air, ahead of the ship (ride 0): you and the tanker, its hose and basket; « à terre » : a long pull-back, the coast
  const TK = VIEW.tanker; //                         seen (bord): { track: 2, run: 2000, alt: 400, tanker: 1 }
  const TK1 = { ...P, ...SHARP, tx: TK.tx, ty: TK.ty, tz: TK.tz, d: 3600, az: 22, el: 9 };
  const TK2 = { ...TK1, d: 2700, az: 50, el: 6 }; // an orbit around the two of them
  const TK3 = { ...TK1, d: 70000, az: 40, el: 2 }; // the coast is port-ahead (navire.js: 43° off the bow)
  const tPull = t.ashore - 0.3;
  const tBench = F(cardAt(D, "ely") + 0.76); //      484,0, under the card « Les trois brins d'arrêt »
  cut(tTank, null, TK1, {
    ride: 0, track: 2, run: 2000, alt: 400, bank: 0, gas: 0.8, hook: 0, tanker: 1, lso: 0, lsoArm: 0, waveoff: 0, laser: 0, guides: 0, mirror: 1,
    fx: TK.tx, fy: TK.ty, fz: TK.tz, fs: 3000,
  });
  shot(tTank, tPull - tTank, TK2);
  shot(tPull, tBench - 0.04 - tPull, TK3, "sine.inOut", TK2.d); // (TK3 az 40: back toward the coast, port-ahead)
  st(t.ashore - 0.6, 1.0, { coast: 1 }, "sine.inOut"); //            « à terre » : the coast far on the horizon
  now(cardAt(D, "ely"), { etape: 9 });

  /* ═════════ 484,0 → 494,5 · « Se poser sur un navire, c'est une vieille histoire… en 1911… arrêté par des cordes… lestées de sacs de sable. » ═════════ */
  // the line of the coast across the picture → Ely's ropes across the picture (the bench): SHAPE, a fade
  const E1 = { ...P, ...SHARP, tx: 0, ty: 30, tz: 0, d: 650, az: -4, el: 15 };
  const E2 = { ...P, ...CLOSE, tx: 0, ty: 30, tz: 0, d: 560, az: -24, el: 20 };
  const E4 = { ...P, ...CLOSE, tx: -236, ty: 16, tz: 110, d: 200, az: -58, el: 16 }; // its sandbag
  const tTeste = F(t.teste - 0.1);
  cut(tBench, SET.BENCH, E1, { ...AT.bench, item: 4, etape: 9, kmhOn: 0 }, { fade: 0.25 });
  shot(tBench, t.ropes - 0.15 - tBench, E2);
  shot(t.ropes - 0.15, tTeste - (t.ropes - 0.15), E4, "sine.inOut", E2.d); // « cordes… sacs de sable » : down along a rope to its bag
  fact(D.tl, { id: "c5-ely", k: "La toute première fois", v: "1911", s: "Eugene Ely", from: t.y1911, to: t.ropes - 0.75 });

  /* ═════════ 494,5 → 498,7 · « En France, le premier, c'est Paul Teste, en 1920, sur le Béarn. » ═════════ */
  // a cut inside the bench, from high: the ropes in a row, across the picture; a slow rise
  const T1 = { ...P, ...SHARP, tx: 0, ty: 20, tz: 0, d: 620, az: 0, el: 64 };
  const T2 = { ...T1, d: 700, el: 71 };
  const tCable = F(t.cinq - 0.07);
  cut(tTeste, null, T1, {});
  shot(tTeste, tCable - tTeste, T2);
  fact(D.tl, { id: "c5-teste", k: "En France, le premier", v: "1920", s: "Paul Teste · le Béarn", from: t.paul, to: tCable - 0.08 });

  /* ═════════ 498,7 → 504,2 · « Aujourd'hui, seules cinq marines au monde savent rattraper un avion sur un câble. La France en fait partie. » ═════════ */
  // the middle rope across the picture → Andromède across the picture, at night: SHAPE, a fade
  // low, just astern of Andromède: the wire across the picture, the runway's lights running on, the island and the
  // parked aircraft beyond — it is placed; a slow glide across and up
  const C1 = aimAt(onAngled(5300, -500, 140), onAngled(6700, 250, 0), CLOSE);
  const C1b = aimAt(onAngled(5420, -120, 250), onAngled(6800, 500, 0), CLOSE);
  // astern of the wires, high, looking down the runway: the three across the picture, one above the other
  const W1 = aimAt(onAngled(1300, 250, 1500), onAngled(4300, 0, 0), SHARP);
  cut(tCable, SET.PONT, C1, { ...AT.night, etape: 9, kmhOn: 0, ride: 0, jet: 0, fx: A3[0], fy: 0, fz: A3[2], fs: 900 }, { fade: 0.2 });
  shot(tCable, t.france - tCable, C1b);
  now(t.cable, { wireName: 3 }); //                                   « sur un câble » : it lights
  fact(D.tl, { id: "c5-cinq", k: "Aujourd'hui, seules", v: "5 MARINES", s: "savent rattraper un avion sur un câble", from: t.five, to: t.france - 0.1 });

  /* ═════════ 502,9 → 512,0 · « La France en fait partie. » · « Sur ton pont, trois câbles t'attendent… Athéna… Aphrodite. » ═════════ */
  // the pull-back opens to the runway seen from port-aft, high; then a slow advance along it (the wires cross the move)
  const W2 = aimAt(onAngled(1900, 220, 1370), onAngled(4800, 0, 0), SHARP); // a slow advance along the runway
  const tW = t.wires + 1.4;
  const tFar = t.lastwire - 0.1;
  const tThree = F(t.wires - 0.08);
  shot(t.france, tThree - t.france, W1, "sine.inOut", C1b.d);
  const tAth = F(t.athena - 0.08);
  const tAph = F(t.aphrodite - 0.08);
  // « trois câbles t'attendent » : from port, high — the deck turns to glass, their three brakes glow under it
  const W3 = aimAt(onAngled(2500, -3300, 950), onAngled(4800, 0, -200), { fov: 32, ...SHARP });
  const W3b = aimAt(onAngled(2950, -3150, 880), onAngled(5000, 0, -200), { fov: 32, ...SHARP });
  cut(tThree, null, W3, { under: 0.6 });
  shot(tThree, tAth - tThree, W3b);
  void W2; void tW;
  // « Athéna » · « Aphrodite » : each one close, from its port end, the same frame 12 m apart (SHAPE); a glide along it
  const wireAt = (sIdx, u) => aimAt(onAngled(BRINS.s[sIdx] - 480, -1750 + 420 * u, 150 + 10 * u), onAngled(BRINS.s[sIdx], -250 + 420 * u, 10), CLOSE);
  cut(tAth, null, wireAt(0, 0), { under: 0 });
  shot(tAth, tAph - tAth, wireAt(0, 1));
  cut(tAph, null, wireAt(1, 0), {});
  shot(tAph, F(tFar) - tAph, wireAt(1, 1));
  now(t.wires, { wireName: 0 }); //                                   « trois câbles » : the three light
  st(t.wires, 0.5, { wires: 1 }, "sine.inOut");
  now(t.athena, { wireName: 1 });
  now(t.aphrodite, { wireName: 2 });
  const labels = world.model.brins.A.labels;
  chipEl("c5-athena", { label: "Le premier", value: "ATHÉNA", color: "veille" });
  D.chip("c5-athena", labels[0], -70, -46, t.athena, t.aphrodite - 0.12);
  chipEl("c5-aphrodite", { label: "Le deuxième", value: "APHRODITE", color: "veille" });
  D.chip("c5-aphrodite", labels[1], -70, -46, t.aphrodite, tFar - 0.05);

  /* ═════════ 512,0 → 518,3 · « Et le troisième, le dernier avant la mer : Andromède. Comme la princesse… sauvée de justesse. » ═════════ */
  // from behind Andromède, looking down the runway to its end and the black sea; « sauvée de justesse » : back onto the wire
  const P20 = aimAt(onAngled(4000, 200, 850), onAngled(7000, 0, 0), SHARP);
  const P20b = aimAt(onAngled(4350, 180, 800), onAngled(7300, 0, 0), SHARP);
  const C2 = { ...P, ...CLOSE, tx: A3[0], ty: 10, tz: A3[2], d: 520, az: 8.5, el: 28 };
  const tSave = t.sauvee - 0.15;
  const tUse = F(t.usure - 0.05);
  const WEND = aimAt(onAngled(24000, -6000, 4000), onAngled(6000, 0, 0), { fov: 30, ...SHARP });
  const WEND2 = aimAt(onAngled(22800, -5400, 3650), onAngled(6000, 0, 0), { fov: 26, ...SHARP });
  const tSv = F(tSave);
  cut(F(tFar), null, WEND, { angled: 0.8 }); //                       « le dernier avant la mer » : the runway lit, the sea below
  shot(F(tFar), tSv - F(tFar), WEND2);
  cut(tSv, null, { ...C2, d: 640, az: 2 }, { angled: 0 }); //          « sauvée de justesse » : on the wire
  shot(tSv, tUse - tSv, C2);
  void P20; void P20b;
  now(t.andromeda, { wireName: 3 }); //                              « Andromède »

  /* ═════════ 518,3 → 525,53 · « Chacun est changé environ tous les 125 appontages. Et… sous le pont, on règle leur frein… » ═════════ */
  // a slow orbit on the wire; « sous le pont » : down through the glass deck to its brake (HAND.c56.from[0] at 524,33)
  // « Chacun est changé » : a cut to its port end, low — the wire runs into the sheave in its pot; a push; then down
  const C3a = aimAt(onAngled(5300, -1650, 150), onAngled(6000, -1100, 15), CLOSE);
  const C3 = aimAt(onAngled(5460, -1560, 125), onAngled(6000, -1100, 15), CLOSE);
  const tDive = t.sous - 0.1;
  cut(tUse, null, C3a, {});
  shot(tUse, tDive - tUse, C3);
  const tUnder = F(tDive);
  cut(tUnder, null, { ...HAND.c56.from[0], d: 1400, az: -28, el: 13 }, { under: 1, fx: AT.night.fx, fy: AT.night.fy, fz: AT.night.fz, fs: AT.night.fs });
  shot(tUnder, tLand - tUnder, HAND.c56.from[0]); //                    « sous le pont » : the brake, under the glass
  now(t.usure, { wireName: 0 }); //                                  « Chacun » : all three alike again
  st(t.usure + 0.4, 1.4, { wires: 0.6 }, "sine.inOut");
  st(t.brakeset, 0.7, { bdial: 0.62 }, "sine.inOut"); //            « on règle leur frein » : its wheel turns
  fact(D.tl, { id: "c5-usure", k: "Chaque câble, changé tous les", v: "≈ 125 APPONTAGES", from: t.wear, to: t.sous - 0.12 });

  /* ── the seam c56: the rise from the brake to the wire on the deck, which goes on in c6 ── */
  const h = HAND.c56;
  if (Math.abs(at(h.at) - tOut) < 0.02) seam(D, "c56", "out");
  else D.match(tOut, h.from, h.to, { ...h.opt, only: "out" });
}
