// c1 · « 15 h 27 : des oies dans les deux moteurs », « Ce qu'il y a dans un A320 », « La check-list » jusqu'à
// « …elle comptera » — 0 → HAND.c12 (bouton − 0,15 ≈ 114,80). The plan, phrase by phrase: docs/L05-actes.md « c1 »
// (+ docs/L05-actes-maj.md: the first frame is hook4, inside the glass nacelle, lock 1). Journal: docs/journal/L05-c1.md.
// Every instant is read off the script (D.at). A cut gives what changes, never a number a running tween carries;
// `track` and `lock` only change on a cut (or `lock` over ≥ 2 s). The last shot is over before the c12 cut (c2 lays it).
import { SET, AT, VIEW, CLOSE, SHARP, POSE0, span, cardAt, onFrame } from "./world.js";
import { A320 } from "./plan.js";
import { fact } from "@kit/long.js";
import { glide } from "@kit/direct.js";

const E = A320.engine;
const OFF = { clockOn: 0, countOn: 0 }; // from « Tu connais la fin » on, the header leaves the day

/* the engine opened in place (explode 1, lock 1): the parts slide apart along +x (systemes.js · buildEngine) */
const FAN_X = { ...VIEW.fan, tx: E.x - 10, ty: E.y + 5, tz: E.z, d: 480, az: -40, el: 10, ...CLOSE };
const AFT_X = { ...FAN_X, tx: E.x + 470, d: 580, az: -32 }; // retouche 02/11 (heurté 35,8): a shorter, wider slide
const CORE_A = { ...VIEW.core, tx: E.x + 300, d: 330, ...CLOSE };
const CORE_B = { ...VIEW.core, tx: E.x + 350, d: 255, ...CLOSE };
const IDG_X = { ...VIEW.idg, tx: E.x + 168, ty: E.y - 175, tz: E.z + 27, d: 215, az: -18, el: 6, ...CLOSE };
/* the whole glass A320, its left engine open */
const WIDE_A = { ...VIEW.wide, tx: -350, ty: -100, tz: 250, d: 2900, az: -32, el: 12, ...SHARP };

export default function ({ D }) {
  const { at, st, now, shot, cut, match, punch, tl } = D;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const [, tEnd] = span(D, "c1");

  /* ═════════ 0 → 3,45 · « 15 h 27. Tes deux moteurs viennent d'avaler des oies. » ═════════
     Frame 0 = POSE0 (inside the glass nacelle, the core on fire, the goose in it). The camera is already pulling
     back (glide), out under the wing: the geese stream into the intake, the flame, the Bronx below. */
  const tA = F("promesse", -0.11); // 3,45
  shot(0, tA, { ...VIEW.hook1, d: 1100 }, glide(1.5, 1.3), POSE0.d);
  punch(at("accroche$") - 0.2, 0.05, { up: 0.08, hold: 0.12, down: 0.3 }); // « oies » — over before the cut

  /* ═════════ 3,45 → 9,17 · « Tu es à 860 m au-dessus de New York. Et ta check-list… plus de 6 000 m. » ═════════
     Raccord: the pull-back goes on across the cut — the same plane, small now, 860 m of air, the city under it. */
  const tB = F("defi", -0.12); // 9,17
  cut(tA, null, { ...VIEW.over860, d: 11500 }, { lock: 0 });
  shot(tA, tB - tA, { ...VIEW.over860, az: 172, el: 8 }, "sine.out", 11500);
  fact(tl, { id: "c1-alt", k: "Au-dessus de New York", v: "860 MÈTRES", tone: "signal", from: 4.0, to: 6.4 });
  fact(tl, { id: "c1-cl", k: "Check-list · une panne à", v: "PLUS DE 6 000 MÈTRES", from: at("check") + 0.3, to: tB - 0.15 });

  /* ═════════ 9,17 → 16,2 · « Il te reste 3 min 32. 155 personnes à bord. Et l'aéroport… est derrière toi. » ═════════
     The camera keeps turning the same way (az going down) across each cut: chase → the cabin of glass (the fuselage,
     form) → over the plane, back toward LaGuardia lit signal. */
  const tC = F("personnes", -0.86); // ≈ 11,5, before « 155 »
  const tD = F("aeroport", -0.16); //  ≈ 13,2
  cut(tB, null, { ...VIEW.chase, d: 5600, az: 68, el: 12 }, {}); // three-quarters from behind, never straight from behind
  shot(tB, tC - tB, { ...VIEW.chase, d: 4900, az: 58, el: 13 }, "none");
  cut(tC, null, { ...VIEW.cabin, d: 3400, az: 30 }, { pax: 1 });
  shot(tC, tD - tC, { ...VIEW.cabin, d: 2950, az: 22 }, "none");
  cut(tD, null, { ...VIEW.lookBack, d: 8600, az: -110 }, { pax: 0, track: 1660 });
  st(at("aeroport"), 1.0, { lgaSig: 1 }, "sine.out");
  now(at("curiosite") - 0.03, OFF);

  /* ═════════ 16,2 → 21,3 · « Tu connais la fin : tout le monde s'en sort. On a appelé ça un miracle. » ═════════
     A dip to black: the foretaste — afloat on the Hudson, people on the wings and the rafts. A slow push. */
  const tE = F("monde", -0.16); // 16,2
  const tF = F("sauves", -0.3); // 21,3
  shot(tD, tE - tD, { ...VIEW.lookBack, d: 7600, az: -118 }, "none");
  cut(tE, SET.VOL, { ...VIEW.water }, { ...AT.water, evac: 0.8, rafts: 1, wingExits: 1, doors: 1, ...OFF }, { fade: 0.3, kind: "dip" });
  shot(tE, tF - tE, { ...VIEW.water, d: 5200, el: 5 }, "sine.inOut");

  /* ═════════ 21,3 → 27,45 · « …qu'est-ce qui les a vraiment sauvés ? Pour le savoir, il faut regarder ce que cet
     avion a dans le ventre. Et ce qui vient d'y entrer… » — a dip back to 15:27:11, then the dive to the left engine. */
  cut(tF, SET.VOL, { ...VIEW.wide }, { ...AT.vol, ...OFF, lock: 1 }, { fade: 0.3, kind: "dip" });
  const tG = at("ouvre") - 0.2; // 27,46: the dive has landed on the engine
  shot(tF, tG - tF, { ...VIEW.engine }, "sine.inOut", VIEW.wide.d);
  st(tF + 2.2, 3.0, { fs: 600 }, "sine.inOut");
  st(at("ventre") - 0.1, 1.0, { shell: 0.45 }, "sine.inOut");
  st(at("entrer") - 0.9, 1.3, { goose: 0.5 }, "sine.inOut"); // the goose arrives at the fan

  /* ═════════ 27,46 → 29,77 · « Alors… on l'ouvre. » — the engine comes apart in place, the camera backs off ═════════
     → 29,77 · « Un Airbus A320. » Raccord: the pull-back goes on across the cut, out to the whole glass plane. */
  const tH = F("eclate", -0.12); // 29,77
  st(at("explode"), 1.3, { explode: 1 }, "power2.out"); // 28,44 → 29,74
  // retouche 02/11 (heurté 29,6): the way out to the exploded view at an even speed (glide, no sine.in rushing into
  // the cut) and a smaller turn, az -48 → -36 — the same way WIDE_A goes on (-32 → -30)
  shot(tG, tH - tG, { ...VIEW.exploded, az: -36 }, glide(0.8, 1.0));
  const wideA2 = match(tH, [VIEW.engine, VIEW.exploded], [WIDE_A, { ...WIDE_A, d: 3400, az: -30 }], {
    only: "out",
    after: 1.6,
    state: { goose: 0, flame: 0, burn: 0.3, gen: 0.2, shell: 1, fs: 2000 },
  });

  /* ═════════ 31,45 → 38,9 · « Sous chaque aile, un moteur : une grande soufflante aspire l'air, en comprime une
     partie, la brûle… et rejette tout vers l'arrière. » — the dive back to the fan, then one part per word, gliding
     along the axis. */
  const tI = onFrame(tH + 1.68);
  const tJ = at("soufflante") - 0.1; // 33,66
  // retouche 02/11 (heurté 32,1): the 7× dive in 2,2 s becomes a cut onto the engine (« Sous chaque aile, un
  // moteur ») and a slow push to the fan; the shell already at 0.45 on the cut
  cut(tI, null, { ...FAN_X, d: 820, az: -34, el: 11 }, { shell: 0.45, fs: 600 });
  shot(tI, tJ - tI, FAN_X, "sine.inOut", 820);
  const tK = F("coeur", -0.12); // 38,9
  shot(tJ, tK - tJ, AFT_X, glide(0.7, 1.15));
  now(at("soufflante"), { named: 1 });
  now(at("comprime"), { named: 2 });
  now(at("brule"), { named: 3 });
  st(at("brule") - 0.15, 0.6, { burn: 1 }, "sine.out");
  now(at("rejette"), { named: 4 });

  /* ═════════ 38,9 → 45,6 · « Au centre, le cœur du moteur, là où l'air devient du feu. Ce jour-là… une oie est
     entrée. » Raccord: the slide goes on (+x) across the cut, closer on the fire. */
  cut(tK, null, CORE_A, { named: 3 });
  const tL = onFrame(at("courant") - 0.25); // 45,58
  shot(tK, tL - tK, CORE_B, "sine.out");
  st(at("oie") - 0.4, 0.9, { goose: 1 }, "sine.inOut");

  /* ═════════ 45,6 → 56,2 · « Chacun fait tourner une génératrice… Mais si le moteur ralentit trop… elle se tait. »
     Gliding down under the case to the generator; it lights veille, its current runs to the wing; it dies out. */
  const tM = F("ici", -0.13); // 56,2
  // retouche 02/11 (heurté 46,1): the 2,6 s slide core → generator becomes a cut on « Chacun », then a slow push
  cut(tL, null, { ...IDG_X, d: 240, az: -24 }, {});
  shot(tL, 4.0, IDG_X, "sine.inOut");
  shot(tL + 4.0, tM - tL - 4.0, { ...IDG_X, d: 185, az: -10 }, "sine.inOut");
  now(at("generatrice"), { named: 5 });
  st(at("generatrice") - 0.1, 0.6, { gen: 1 }, "sine.out");
  st(at("generatrice") + 0.3, 0.6, { feed: 1 }, "sine.inOut");
  st(at("tait") - 1.6, 1.5, { n1L: 35, gen: 0 }, "sine.inOut");
  st(at("tait") - 0.65, 0.6, { feed: 0 }, "sine.inOut");

  /* ═════════ 56,2 → 64,97 · « Ici, le manche ne tire aucun câble : il envoie des ordres à des ordinateurs. Et ces
     ordinateurs suivent une règle, la loi normale. » — the sidestick, then a glide down to the computers' bay. */
  // retouche 02/11: closer and narrower, the stick and the hand are the subject (≈ 30 % of the frame), not the pedestal
  cut(tM, null, { ...VIEW.stick, d: 86, az: -30, el: 28, fov: 30 }, { explode: 0, named: 7, shell: 1, fs: 150, pf: 1, n1R: 15, stick: 0 });
  const tN = F("ordis", -0.15); // 59,53
  shot(tM, tN - tM, { ...VIEW.stick, d: 78, az: -20, el: 28, fov: 30 }, "sine.inOut");
  st(at("ici") + 0.9, 0.7, { stick: 0.6 }, "sine.inOut"); // « tire aucun câble »
  st(at("ici") + 1.9, 0.9, { stick: 0 }, "sine.inOut");
  // « …des ordres à des ordinateurs » — a cut down to the bay (a glide crossed the dark pedestal: sombre sur sombre)
  cut(tN, null, { ...VIEW.computers, d: 230, az: -28 }, { named: 8, fs: 300 });
  const tO = F("decroche", -0.2); // 64,97
  const tN2 = at("loi"); // 62,88
  shot(tN, tN2 - tN, { ...VIEW.computers, d: 200, az: -20 }, "sine.out");
  shot(tN2, tO - tN2, { ...VIEW.computers, d: 250, az: -12 }, "sine.in"); // backing off, faster into the cut

  /* ═════════ 64,97 → 73,4 · « Avec elle, l'avion ne peut pas décrocher. Tu tires trop fort sur le manche ?
     L'ordinateur ne lèvera pas le nez au-delà de la limite. C'est une protection. Retiens-la… » — the plane in profile,
     the veille arc ahead of its nose; the nose comes up and stops at the limit. Raccord: the pull-back goes on. */
  cut(tO, null, { ...VIEW.limitSide, d: 3700 }, { lock: 0, limit: 1, aoa: 0, pitch: 0, named: 0, fs: 2000 });
  shot(tO, 1.4, { ...VIEW.limitSide }, "sine.out");
  const tP = at("apu") + 0.13; // 73,4
  // retouche 02/11 (immobile 67 → 71,5): the camera turns slowly round the nose as it backs off (az 0 → 10)
  shot(tO + 1.4, tP - tO - 1.4, { ...VIEW.limitSide, tx: -600, d: 4400, az: 10, el: 3 }, "sine.inOut");
  st(at("tires"), 3.45, { pitch: 6, aoa: 1 }, "power2.out"); // → 69,41: the needle at the stop on « limite »
  st(at("protection") - 0.05, 0.22, { limit: 0.55 }, "power2.out");
  st(at("protection") + 0.2, 0.6, { limit: 1 }, "sine.inOut");
  st(at("protection") + 0.7, 2.0, { pitch: 0, aoa: 0 }, "sine.inOut");

  /* ═════════ 73,4 → 80,2 · « Mais sans le courant des moteurs, plus de loi normale. Alors, dans la queue… l'APU. »
     One move along the glass fuselage to the tail and into the tail cone; the plane bolted to the camera on the way. */
  const tQ = at("apuName") - 0.08; // 78,84
  shot(tP, tQ - tP, { ...VIEW.apu }, "sine.inOut", 4400);
  st(tP, 2.6, { lock: 1 }, "sine.inOut");
  st(tP, 0.8, { limit: 0 }, "sine.inOut");
  st(at("apu") + 1.6, 0.5, { law: 0.2 }, "sine.inOut"); // « plus de loi normale » (the computers flicker)
  st(tQ - 2.6, 2.4, { fs: 500 }, "sine.inOut");
  now(at("apuName"), { named: 6 });
  st(at("apuName"), 1.2, { apu: 1 }, "sine.out");
  st(at("apuName") + 0.3, 0.8, { law: 1 }, "sine.inOut"); // it takes over
  punch(at("apuName"), 0.05);

  /* ═════════ 80,2 → 85,87 · « Elle sert surtout au sol. En vol, presque personne n'y pense. Jusqu'au jour où… » —
     it goes back to sleep; the camera backs off until it is a veille point in the tail of the whole plane. */
  const tR = F("pensera", -0.9); // 85,87
  shot(tQ + 1.4, tR - tQ - 1.4, { ...VIEW.tail, d: 3400 }, "sine.inOut", VIEW.apu.d);
  st(at("sol"), 1.5, { apu: 0 }, "sine.inOut");
  st(at("sol") + 0.2, 3.0, { fs: 2000 }, "sine.inOut");

  /* ═════════ 85,87 → 87,3 · « …et ce jour-là, qui y pensera ? » — the two pilots of glass, the binder in the first
     officer's hands (it becomes the binder on the bench). */
  cut(tR, null, { ...VIEW.cockpit }, { qrh: 1, pf: 0, named: 0, fs: 300 });
  const tS = onFrame(cardAt(D, "plan") - 0.07); // 87,3
  shot(tR, tS - tR, { ...VIEW.cockpit, d: 200 }, "none");

  /* ═════════ 87,3 → 102,2 · carte « La check-list… » — « Et pour le jour où les deux moteurs lâchent, il y a un plan.
     Une check-list… Trois parties, sur trois pages. D'abord, rallumer… Ensuite, planer. Et à la fin seulement…
     se poser » — the bench (raccord objet: the binder). Sharp under the card. */
  cut(tS, SET.BENCH, { ...VIEW.qrh, d: 76, az: -26, ...SHARP }, { ...AT.bench, pool: 0, grid: 0 }, { fade: 0.2 });
  st(tS + 0.02, 0.6, { pool: 0.3, grid: 0.16 }, "sine.out");
  const tCard = tS + 2.7; // the card is gone
  shot(tS, tCard - tS, { ...VIEW.qrh, d: 71, az: -21, ...SHARP }, "none");
  const tT = F("pages", -0.13); // 94,03
  shot(tCard, tT - tCard, { ...VIEW.qrh, d: 62, az: -12 }, "sine.out");
  st(at("checklist") - 0.1, 0.8, { pool: 0.5 }, "sine.inOut"); // « check-list »: the binder lights
  const Q1 = { ...VIEW.qrh, d: 96, az: 6, el: 62 };
  cut(tT, null, Q1, {});
  const tU = F("certifie", -0.12); // 102,2
  shot(tT, tU - tT - 0.1, { ...Q1, d: 88, az: 18 }, "sine.inOut");
  for (const [cue, page, named] of [["rallumer", 1, 10], ["planer", 2, 11], ["poser", 3, 12]]) {
    st(at(cue) - 0.2, 0.8, { page }, "sine.inOut");
    now(at(cue), { named });
  }

  /* ═════════ 102,2 → 109,23 · « Même l'eau est prévue. L'A320 est certifié pour amerrir, d'après plus de 200 essais
     en bassin, sur des maquettes d'avions voisins. » — raccord forme: the page of the water → the water of the basin. */
  cut(tU, SET.CARTE, { ...VIEW.basin, d: 285, az: -36 }, { ...AT.basin, dropK: 0 }, { fade: 0.2 });
  const tV = F("certifie2", -0.1); // 109,23
  shot(tU, tV - tU - 0.05, { ...VIEW.basin, d: 240, az: -22 }, "sine.inOut");
  st(at("bassin") - 2.8, 4.6, { dropK: 1 }, "none"); // touches (0,6) on « bassin »; over by 109,0
  fact(tl, { id: "c1-bassin", k: "Certifié pour amerrir", v: "PLUS DE 200 ESSAIS", s: "en bassin, sur maquettes", from: at("bassin") - 1.6, to: tV - 0.15 });

  /* ═════════ 109,23 → 114,8 · « Mais certifié pour toucher l'eau comment ? À quelle vitesse ? Retiens la question :
     au moment du choc, elle comptera. » — at the waterline, the model plays again and touches on « choc ». */
  const B1 = { ...VIEW.basin, d: 190, az: -32, el: 4 };
  cut(tV, null, B1, { dropK: 0 });
  shot(tV, tEnd - 0.05 - tV, { ...B1, d: 165, az: -24 }, "sine.inOut");
  st(at("choc") - 3.2, 4.0, { dropK: 1 }, "none"); // touches ≈ 113,0, the spray on « choc »; over (114,6) before the seam
}
