// c2 · « Sans radio » de « on se parle avec les mains » à la fin, « Le catapultage, seconde par seconde » — HAND.c12
// (103,37) → HAND.c23 (204,74). The plan, phrase by phrase: docs/L04-actes.md, « c2 » ; journal docs/journal/L04-c2.md.
// THE FILM'S SHOWPIECE is here: the launch seen through the glass deck (casse 176,22 → s'arrête 184,32), in slow motion.
// Every instant is read off the script (D.at). The seam gives the COMPLETE state; an inner cut gives what changes, and
// never a number that a running tween carries (run 112 → 140, shuttle / kmh 176 → 184, gas / tremble at « gaz »).
import { SET, AT, HAND, VIEW, CLOSE, SHARP, seam, onFrame, cardAt, cockpitPose } from "./world.js";
import { CAT, CREW, CABIN, VALVE, PEDRO, HOLDBACK, SHUTTLE_STOP } from "./plan.js";
import { fact, chipEl } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const NG = CAT[0].from; //                      the nose-gear tow point at launch (−200, 0, −5500)
const DOG = CREW.dog; //                        your yellow dog, ahead of your nose (−950, 0, −7300)
const PE = PEDRO.at; //                         Pedro, abeam to port
const HBZ = NG[2] + HOLDBACK.len * HOLDBACK.piece; // the calibrated piece, in place
const FIT = NG[2] + HOLDBACK.deckZ; //          the holdback's deck fitting
const DEG = Math.PI / 180;

/** A pose from where the camera STANDS: `eye`, looking along az / el, `d` to the aim. */
const fromEye = (eye, az, el, d, extra = {}) => {
  const ce = Math.cos(el * DEG);
  return { ...P, tx: eye[0] - d * Math.sin(az * DEG) * ce, ty: eye[1] - d * Math.sin(el * DEG), tz: eye[2] - d * Math.cos(az * DEG) * ce, d, az, el, ...extra };
};
/** Where a pose's camera stands. */
const eyeOf = (p) => {
  const ce = Math.cos(p.el * DEG);
  return [p.tx + p.d * Math.sin(p.az * DEG) * ce, p.ty + p.d * Math.sin(p.el * DEG), p.tz + p.d * Math.cos(p.az * DEG) * ce];
};

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const A = (ref) => at(ref);
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame

  /* ── the cockpit (track 1, written around run 0: `ride` 1 carries it) ── */
  const EYE = eyeOf(cockpitPose(1)); //                                  over your right shoulder
  // your left hand on the throttle, from outside the canopy, high on the port side (seen: the arm, the hand, the seat)
  const HAND_P = { ...P, ...CLOSE, tx: NG[0] - 30, ty: 225, tz: NG[2] - 40, d: 230, az: -42, el: 40, fov: 34 };
  const HAND_P2 = { ...HAND_P, d: 195, az: -36, el: 38 };
  const DECK_P = fromEye([EYE[0], EYE[1] + 160, EYE[2] + 260], 0, 7, 800, { fov: 46, ...CLOSE }); // just behind and above the canopy: you, the deck that runs, the bow

  /* ═════════ 103,37 → 107,9 · « Alors on se parle avec les mains. Une centaine de gestes… » ═════════ */
  const t12 = A(HAND.c12.at);
  const p0 = seam(D, "c12", "in", {
    set: SET.PONT,
    state: {
      ...AT.deck, etape: 2, kmhOn: 0, kmh: 0, hooked: 0, held: 0, track: 1, run: -40, gas: 0.5, dog: 1, sig: 0, crew: 1, parked: 1, night: 0.15,
      fx: DOG[0], fy: 150, fz: DOG[2], fs: 600,
    },
  });
  const t1 = t12 + HAND.c12.opt.after; // the seam's move is over
  const DOG1 = { ...VIEW.dog, ...CLOSE, d: 720, az: -24, el: 7 };
  const tGest = F("gestes:centaine", -0.1); //                 ≈ 105,5: a new view, the same dog at the same place (object)
  shot(t1, tGest - t1, DOG1, "sine.inOut", p0.d); //            the sinking move lands on him
  const DOGF = { ...VIEW.dog, ...CLOSE, ty: 150, d: 470, az: 12, el: 6, side: 0 }; // from his front: his hands, the gestures
  cut(tGest, null, DOGF, {});
  shot(tGest, A("gestes:compris") + 1.25 - tGest, { ...DOGF, d: 440, az: 26 }); // a slow orbit while he signs
  now(A("gestes:mains"), { sig: 1 }); //                       « mains » : he raises his hands
  now(A("gestes:centaine"), { sig: 2 });
  now(A("gestes:gestes"), { sig: 5 });
  now(A("gestes:compris"), { sig: 3 }); //                     one gesture every half-second
  fact(D.tl, { id: "c2-gestes", k: "Sur le pont", v: "≈ 100 GESTES", from: A("gestes:centaine"), to: A("feux") - 0.4 });

  /* ═════════ 107,9 → 112,6 · « Et pour te faire rouler jusqu'à ta catapulte, la passerelle aviation allume des feux de couleur. » ═════════ */
  const tRise = A("gestes:compris") + 1.25; //                  ≈ 107,9
  const PATH = { ...P, ...SHARP, tx: -200, ty: 0, tz: -3200, d: 5500, az: -12, el: 20, fov: 32 }; // from behind your aircraft: the way to the catapult, the dog at its end, the island beyond
  shot(tRise, A("feux:feux") - 0.2 - tRise, PATH, "sine.inOut", 440); // up from the dog, a long pull-back
  st(tRise, 3.2, { fx: -200, fy: 150, fz: -3500, fs: 3000 });
  st(A("feux:feux"), 0.6, { taxi: 1 }); //                       « feux de couleur » : the way lights up veille, the stop bar signal
  const PATH2 = { ...PATH, tz: -3500, d: 5300, az: -10 };
  const tPush = A("chef") - 0.1; //                             ≈ 112,6
  shot(A("feux:feux") - 0.2, tPush - (A("feux:feux") - 0.2), PATH2); //  still drifting while the lights come on
  st(A("chef") - 0.6, A("toi:pièce") - 0.3 - (A("chef") - 0.6), { run: -12 }, "sine.inOut"); // your aircraft rolls slowly toward the catapult (ONE tween)

  /* ═════════ 112,6 → 120,3 · « Et celui qui ordonne ton catapultage, c'est lui : ton chien jaune. Son gilet… » ═════════ */
  const DOG2 = { ...VIEW.dog, ...CLOSE, d: 560, az: -30, el: 8 };
  shot(tPush, A("chef:chien") - 0.05 - tPush, DOG2, "sine.inOut", PATH2.d); // along the lights, forward, to him
  st(tPush, A("chef:chien") - tPush, { fx: DOG[0], fy: 150, fz: DOG[2], fs: 600 });
  st(A("chef:chien"), 0.35, { vest: 1 }, "power2.out"); //      « ton chien jaune » : his vest lights
  punch(A("chef:chien"), 0.06);
  const DOG3 = { ...VIEW.dog, ...CLOSE, ty: 130, d: 330, az: -18, el: 7 };
  shot(A("chef:chien") - 0.05, A("chef:gilet") + 1.0 - (A("chef:chien") - 0.05), DOG3); // « Son gilet » : on his vest
  const DOG4 = { ...DOG3, d: 360, az: 2, el: 9 };
  shot(A("chef:gilet") + 1.0, A("cabine") - 0.15 - (A("chef:gilet") + 1.0), DOG4); // a slow orbit around him
  st(A("cabine") - 0.4, 1.0, { vest: 0.6 });
  const flags = [
    ["c2-us", "Marine", "américaine", "chef:américains", "chef:britanniques"],
    ["c2-uk", "Marine", "britannique", "chef:britanniques", "chef:espagnols"],
    ["c2-es", "Marine", "espagnole", "chef:espagnols", "cabine"],
  ];
  for (const [id, label, value, from, to] of flags) {
    chipEl(id, { label, value, color: "veille" });
    D.chip(id, null, 1180, 470, A(from), A(to) - (to === "cabine" ? 0.35 : 0.14)); // fixed, to the right of him (the move would carry an anchored chip into the header)
  }

  /* ═════════ 120,3 → 127,8 · « À côté de la catapulte, au ras du pont, une petite cabine. Dedans, un ingénieur et un opérateur… » ═════════ */
  const CAB1 = { ...P, ...CLOSE, tx: CABIN.at[0] - 120, ty: 30, tz: CABIN.at[2], d: 640, az: -38, el: 28 };
  const tCab = A("cabine") - 0.15;
  shot(tCab, A("cabine:cabine") + 0.1 - tCab, CAB1); //          a pan from the dog to the cabin, across the catapult, high enough
  st(tCab, 2.4, { fx: CABIN.at[0], fy: 0, fz: CABIN.at[2], fs: 500 });
  st(A("cabine:cabine"), 0.5, { cabin: 1 }); //                  « cabine » : its glazing lights
  const CAB2 = { ...P, ...CLOSE, tx: CABIN.at[0] + 80, ty: -40, tz: CABIN.at[2], d: 320, az: -60, el: 48 }; // seen: the two of them, the console, its two screens
  shot(A("cabine:cabine") + 0.1, A("cabine:réglages") - 0.3 - (A("cabine:cabine") + 0.1), CAB2, "sine.inOut", CAB1.d); // « Dedans » : down onto its glass top
  st(A("cabine:dedans"), 0.5, { cabinCrew: 1 });
  const CAB3 = { ...P, ...CLOSE, tx: CABIN.at[0] + 120, ty: 0, tz: CABIN.at[2] - 50, d: 170, az: -90, el: 36, side: 220 }; // the round gauge, face on, where the wheel will be
  const tValve = F("reglage", -0.1); //                          ≈ 127,8
  shot(A("cabine:réglages") - 0.3, tValve - (A("cabine:réglages") - 0.3), CAB3); // « réglages du tir » : onto a screen, its dial

  /* ═════════ 127,8 → 134,4 · « Le plus important, c'est la vitesse à laquelle la vanne va s'ouvrir… » ═════════ */
  const VALVE1 = { ...VIEW.valve, ...CLOSE, d: 400, az: -40, el: 9 };
  // the dial of the screen → the valve's graduated wheel, the same circle at the same place (shape)
  cut(tValve, null, VALVE1, { under: 1, ship: 0.6, cabin: 0, cabinCrew: 0, named: 7, fx: VALVE.at[0], fy: VALVE.at[1], fz: VALVE.at[2], fs: 400 });
  const VALVE2 = { ...VALVE1, d: 350, az: -32 };
  const tUp = A("reglage:masse") - 0.3;
  shot(tValve, tUp - tValve, VALVE2);
  st(A("reglage:vanne"), 1.0, { dial: 0.72 }); //                « vanne va s'ouvrir » : the wheel turns
  now(tUp, { named: 0 });
  // « la masse de ton avion » : up through the glass deck to your aircraft rolling toward the catapult; the slot ahead of it
  const JET1 = { ...P, ...SHARP, tx: -200, ty: 150, tz: -4000, d: 2600, az: -30, el: 16 };
  const tCock = F("toi", -0.12); //                              ≈ 134,4
  shot(tUp, A("reglage:vitesse#2") - 0.1 - tUp, JET1, "sine.inOut", VALVE2.d);
  st(tUp, 1.8, { fx: -200, fy: 150, fz: -3900, fs: 1500 });
  shot(A("reglage:vitesse#2") - 0.1, tCock - (A("reglage:vitesse#2") - 0.1), { ...JET1, tz: -4400, d: 2700, az: -27 });
  st(A("reglage:vitesse#2") - 0.1, tCock - 0.1 - (A("reglage:vitesse#2") - 0.1), { trace: 1 }, "sine.in"); // « la vitesse qu'on veut te donner » : the 75 m drawn ahead of it

  /* ═════════ 134,4 → 140,7 · « Toi, tu ne choisis ni ta vitesse, ni le moment… pousser les gaz… et attendre que la pièce casse. » ═════════ */
  cut(tCock, null, HAND_P, { ride: 1, under: 0, ship: 1, fx: NG[0], fy: 220, fz: NG[2] + 100, fs: 400 }); // over your shoulder, your hand on the throttle
  const tBar = F("toi:pièce", -0.12); //                         ≈ 140,66
  shot(tCock, tBar - tCock, HAND_P2);
  // « que la pièce casse » : the holdback bar lying on the deck by its fitting — it waits
  const BAR0 = { ...P, ...CLOSE, tx: NG[0], ty: 12, tz: FIT - 60, d: 420, az: -75, el: 8 };
  cut(tBar, null, BAR0, { ride: 0, trace: 0, traceOut: 0, fx: NG[0], fy: 20, fz: FIT, fs: 400 });
  const tCard = cardAt(D, "avance"); //                          142,11
  shot(tBar, tCard - tBar, { ...BAR0, d: 395, az: -69 }); //       the midroll: a slow glide that goes on, nothing new

  /* ═════════ card 142,11 · 143,0 → 150,1 · « Bravo. Ton chien jaune te place sur la catapulte. Le croc s'accroche… » ═════════ */
  now(tCard, { etape: 3 });
  threadCall(D.tl, { from: tCard, to: tCard + 2.5, text: "La pièce ? Elle attend." });
  const LOWP = { ...P, ...SHARP, tx: -200, ty: 200, tz: -4200, d: 2700, az: -66, el: 12 }; // low from port: your aircraft rolling the last metres
  const tLand = A("avance") + 0.35;
  shot(tCard, tLand - tCard, LOWP, "sine.inOut", BAR0.d); //       under the card, a whip: up and back
  st(tCard, 2.2, { fx: -200, fy: 150, fz: -4600, fs: 1500 });
  now(A("avance"), { kmhOn: 1, kmh: 0, sig: 1 }); //               « Bravo » : the header « 0 km/h », the dog calls you on
  st(A("avance"), 2.9, { run: 0 }, "sine.inOut"); //               the last metres (the first tween ended at 140)
  st(A("avance"), 2.9, { night: 0 }); //                           the day back: it is the launch of the hook
  const tCroc = F("avance:croc", -0.12); //                        ≈ 146,0
  shot(tLand, tCroc - tLand, { ...LOWP, tz: -4700, d: 2400, az: -70 });
  // « croc » : the nose gear, the launch bar falls into the hook
  const SHUT = { ...VIEW.shuttle, ...CLOSE };
  cut(tCroc, null, SHUT, { fx: NG[0], fy: 40, fz: NG[2], fs: 400 });
  st(A("avance:croc"), 0.3, { hooked: 1 }, "power2.in");
  st(A("avance:croc") + 0.2, 2.2, { jbd: 1 }); //                  behind you, the deflector rises
  const tAft = A("avance:derrière") - 0.1;
  shot(tCroc, tAft - tCroc, { ...SHUT, d: 400, az: -60 });
  now(tAft, { sig: 0 });
  const FITP = { ...P, ...CLOSE, tx: NG[0], ty: 15, tz: FIT - 30, d: 340, az: -72, el: 12 }; // aft along the bar, to its fitting
  shot(tAft, A("avance:fixe") + 0.1 - tAft, FITP);
  st(A("avance:fixe"), 0.3, { held: 1 }, "power2.out"); //          « se fixe » : a clack
  const tTens = F("tension:tensionnement", -0.12); //               ≈ 151,8
  shot(A("avance:fixe") + 0.1, tTens - (A("avance:fixe") + 0.1), { ...FITP, d: 320, az: -78 });

  /* ═════════ 151,8 → 156,3 · « Tensionnement » : la catapulte tire ton avion vers l'avant… et le mou disparaît. ═════════ */
  const PROF = { ...P, ...CLOSE, tx: NG[0], ty: 45, tz: NG[2] + 120, d: 430, az: -90, el: 4 };
  cut(tTens, null, PROF, { sig: 2, fx: NG[0], fy: 40, fz: NG[2] + 120, fs: 500 });
  const tHand = F("plein", -0.12); //                               ≈ 156,33
  shot(tTens, tHand - tTens, { ...PROF, d: 390, az: -86 });
  st(A("tension:tire"), 0.8, { shuttle: 0.15 }); //                  « tire ton avion vers l'avant » : 15 cm
  st(A("tension:disparaît"), 0.25, { strain: 1 }, "power2.out"); //   « le mou disparaît » : taut, the neck lights

  /* ═════════ 156,3 → 162,1 · « Toi, tu pousses les gaz. À fond. Ton avion tire, la catapulte tire… et la pièce tient. » ═════════ */
  cut(tHand, null, HAND_P, { ride: 1, fx: NG[0], fy: 220, fz: NG[2] + 100, fs: 400 });
  shot(tHand, 1.6, HAND_P2);
  st(A("plein:gaz"), 0.6, { gas: 1 }, "power2.out"); //              « gaz » : the throttle forward, the two cores white
  st(A("plein:gaz"), 0.6, { tremble: 1 });
  now(A("plein:gaz"), { sig: 3 });
  // « À fond » : behind the tail, over the deflector — the hook's picture
  const tFond = F("plein:à", -0.07);
  const TAIL = { ...VIEW.hook3, side: 60 };
  cut(tFond, null, TAIL, { ride: 0, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200 });
  const tNeck = F("plein:ton", -0.1);
  shot(tFond, tNeck - tFond, { ...TAIL, d: 1580, el: 8 });
  // « Ton avion tire, la catapulte tire… » : the neck, taut, trembling
  const NECK = { ...VIEW.holdback, ...CLOSE, d: 175, az: -62, el: 10 };
  cut(tNeck, null, NECK, { named: 5, fx: NG[0], fy: 30, fz: HBZ, fs: 300 });
  const tHold = F("plein:tient", -0.12); //                        ≈ 161,77
  shot(tNeck, tHold - tNeck, { ...NECK, d: 145, az: -57 });
  // « et la pièce tient » : a whip back to the whole Rafale in profile, at full power — the thumbnail 1 at 161,9
  const THUMB = { ...VIEW.thumb1 };
  // « tient » : a cut on the word (the neck that holds → the whole aircraft that holds) — the thumbnail 1 at 161,9
  cut(tHold, null, THUMB, { fx: NG[0], fy: 200, fz: NG[2] + 500, fs: 1500 });
  now(A("plein:tient") + 0.1, { named: 0 });

  /* ═════════ 162,1 → 167,6 · « Tes moteurs hurlent. Tout ton avion tremble… retenu par une seule pièce. » ═════════ */
  const tNeck2 = F("tremble:retenu", -0.12);
  shot(tHold, tNeck2 - tHold, { ...THUMB, tz: -4850, d: 2150, az: -86, el: 4 }); // toward the wing, its shiver
  punch(A("tremble:tremble"), 0.06);
  const NECK2 = { ...VIEW.holdback, ...CLOSE, d: 125, az: -56, el: 9 };
  cut(tNeck2, null, NECK2, { named: 5, fx: NG[0], fy: 30, fz: HBZ, fs: 300 });
  const tPont = F("pare:paré", -0.12);
  shot(tNeck2, tPont - tNeck2, { ...NECK2, d: 112, az: -52 });

  /* ═════════ 167,7 → 170,3 · « Paré pont. » « Paré partout. » « Paré feu. » ═════════ */
  const DOGFAR = { ...P, ...SHARP, tx: DOG[0] + 200, ty: 120, tz: DOG[2] + 300, d: 2300, az: -48, el: 6 };
  cut(tPont, null, DOGFAR, { named: 0, sig: 4, fx: DOG[0], fy: 120, fz: DOG[2], fs: 800 }); // he kneels, his arm to the bow
  const tPart = F("pare:paré#2", -0.07);
  shot(tPont, tPart - tPont, { ...DOGFAR, d: 2150, az: -45 });
  cut(tPart, null, { ...CAB1, d: 760, az: -34 }, { cabin: 1, cabinCrew: 1, fx: CABIN.at[0], fy: 0, fz: CABIN.at[2], fs: 500 });
  const tFeu = F("pare:paré#3", -0.07);
  shot(tPart, tFeu - tPart, { ...CAB1, d: 700, az: -30 });
  const DOGC = { ...VIEW.dog, ...CLOSE, d: 560, az: -62, el: 6 };
  cut(tFeu, null, DOGC, { vest: 1, fx: DOG[0], fy: 150, fz: DOG[2], fs: 600 });
  const tVanne = F("souffle", -0.1); //                              ≈ 170,27
  shot(tFeu, tVanne - tFeu, { ...DOGC, d: 520, az: -68 });

  /* ═════════ 170,3 → 175,7 · « La vanne s'ouvre. La vapeur se jette dans les cylindres. La pression monte… monte… » ═════════ */
  cut(tVanne, null, VALVE1, { under: 1, ship: 0.6, named: 7, press: 0.3, vest: 0.6, fx: VALVE.at[0], fy: VALVE.at[1], fz: VALVE.at[2], fs: 400 });
  st(A("souffle:s'ouvre"), 0.4, { valve: 1 }, "power2.out"); //      « s'ouvre » : the disc turns, the steam runs
  const tSteam = A("souffle:vapeur") - 0.1;
  shot(tVanne, tSteam - tVanne, { ...VALVE1, d: 380, az: -36 });
  const CYL = { ...P, ...CLOSE, tx: NG[0] - 30, ty: -70, tz: NG[2] - 150, d: 520, az: -62, el: 16 }; // with the steam, up to the cylinders seen through the glass deck (the framing the launch rides on)
  const tRise2 = A("souffle:pression") - 0.15;
  shot(tSteam, tRise2 - tSteam, CYL);
  st(tSteam, 1.6, { fx: NG[0], fy: -95, fz: NG[2], fs: 600 });
  now(tRise2, { named: 0 });
  st(A("souffle:pression"), 1.2, { press: 1 }, "sine.inOut"); //       « La pression monte… monte… » : the cylinders light aft to fore
  // up through the glass deck to the neck — brighter as the load climbs
  const NECK3 = { ...VIEW.holdback, ...CLOSE, d: 150, az: -60, el: 12 };
  const tMacro = A("casse") - 0.05;
  shot(tRise2, tMacro - tRise2, NECK3, "sine.inOut", CYL.d);
  st(tRise2 + 0.3, 1.6, { fx: NG[0], fy: 30, fz: HBZ, fs: 300 });

  /* ═════════ 175,7 → 176,9 · « Et la pièce casse. » — the thumbnail 2 at 176,22 ═════════ */
  const tRide = onFrame(A("casse$") + 0.36); //                      ≈ 176,9
  shot(tMacro, tRide - tMacro, { ...NECK3, d: 110, az: -56 });
  now(A("casse") + 0.2, { named: 5 });
  st(A("casse:casse") - 0.03, 0.07, { broken: 0.3 }, "none"); //       the white light at the neck: up in two frames
  st(A("casse:casse") + 0.04, tRide - 0.06 - (A("casse:casse") + 0.04), { broken: 1 }, "power1.out"); // it dies small, the halves part
  // THE LAUNCH, in slow motion (≈ 8 s for ≈ 2 s): the shuttle to its water brake, your aircraft rides it
  const tGo = A("casse:casse") + 0.03;
  const tEnd = A("secondes:arrête"); //                              184,32: the shuttle stops, the deck ends under you
  st(tGo, tEnd - tGo, { shuttle: SHUTTLE_STOP }, "power1.in");
  st(tGo, tEnd - tGo, { kmh: 240 }, "none");

  /* ═════════ 176,9 → 179,1 · « Le piston file dans son cylindre. » — the camera rides the shuttle, through the glass deck ═════════ */
  // (ride 1: written around the shuttle's start; the move along the keel IS the ride — along the deck's lines, never across)
  const PIST0 = { ...P, ...CLOSE, tx: NG[0] - 30, ty: -70, tz: NG[2] + 60, d: 470, az: -58, el: 16, fov: 30 };
  const PIST1 = { ...PIST0, tz: NG[2] + 20, d: 430, az: -55 };
  cut(tRide, null, PIST0, { ride: 1, named: 0, dog: 0, crew: 0, parked: 0.3, cabin: 0, cabinCrew: 0, fx: NG[0], fy: -60, fz: NG[2], fs: 600 });
  const tGear = F("arrache:chariot", -0.12); //                       ≈ 179,13
  shot(tRide, tGear - tRide, PIST1, "none");
  // « Le chariot t'arrache vers l'avant » : the shuttle and the nose gear from port, your aircraft over them
  const GEAR0 = { ...P, ...CLOSE, tx: NG[0], ty: 95, tz: NG[2] + 40, d: 950, az: -80, el: 6 };
  const GEAR1 = { ...GEAR0, tz: NG[2] + 10, d: 900, az: -83 };
  cut(tGear, null, GEAR0, { fx: NG[0], fy: 150, fz: NG[2] + 300, fs: 900 });
  const tSeat = F("arrache:ton", -0.1); //                            ≈ 180,73
  shot(tGear, tSeat - tGear, GEAR1, "none");
  // « Ton corps s'écrase dans le siège » : over your shoulder, the deck running at you, to the bow
  cut(tSeat, null, DECK_P, { fx: NG[0], fy: 220, fz: NG[2] - 200, fs: 900 });
  const tSea = onFrame(A("vol") - 0.1); //                             ≈ 185,3
  shot(tSeat, tSea - tSeat, { ...DECK_P, d: 560, el: 3 }, "none");
  fact(D.tl, { id: "c2-deux", k: "Le lancement", v: "≈ 2 SECONDES", from: A("secondes:deux") + 0.2, to: A("vol") - 0.6 });
  // « et le pont s'arrête sous toi » : the shuttle in its water brake, your aircraft goes on alone, past the bow edge
  now(tEnd, { hooked: 0, run: SHUTTLE_STOP });
  const v = (2 * (SHUTTLE_STOP - 0.15)) / (tEnd - tGo); //            the shuttle's speed at the stop (m per second of film)
  st(tEnd, tSea - tEnd, { run: SHUTTLE_STOP + v * (tSea - tEnd) }, "none");

  /* ═════════ 185,3 → 188,6 · « 240 kilomètres-heure. Tu voles. » — low on the sea, it passes over the camera ═════════ */
  // low on the sea, abeam the bow to port: the camera pans with you as you leave the deck and climb away
  // ride 1 still: from port and ahead, the camera flies with you — your Rafale a third of the frame, the bow and the
  // deck it has just left behind it, the sea under it (written around the shuttle's start)
  const CHASE0 = { ...P, ...SHARP, tx: NG[0], ty: 160, tz: NG[2] + 450, d: 2900, az: -132, el: 5, fov: 30 };
  const CHASE1 = { ...CHASE0, d: 2600, az: -118, el: 7 };
  cut(tSea, null, CHASE0, { tremble: 0.3, fx: NG[0], fy: 200, fz: NG[2] + 400, fs: 2000 });
  const tTrait = F("trait", -0.1); //                                 ≈ 188,57
  st(tSea, tTrait - 0.02 - tSea, { run: 260 }, "none"); //             « Tu voles » : overhead at « voles »
  shot(tSea, tTrait - tSea, CHASE1, "none"); //                        a slow drift around you while you climb
  now(A("vol"), { kmh: 240 });
  now(A("vol:voles"), { kmh: -1 }); //                                 « En vol »

  /* ═════════ 188,6 → 191,6 · « Derrière toi, le navire n'est déjà plus qu'un trait sur la mer. » ═════════ */
  // (track 2, ride 1: written around the bow, jetAt(2, 0, 0) = (−200, 0, −13075) — the camera climbs with you)
  const AIR0 = { ...P, ...SHARP, tx: -200, ty: -900, tz: -13075 + 5000, d: 6500, az: 176, el: 15, fov: 30 };
  cut(tTrait, null, AIR0, { ride: 1, track: 2, run: 2000, alt: 400, tremble: 0, fx: -200, fy: 0, fz: -13075, fs: 3000 });
  const tNext = onFrame(A("suivant") - 0.1); //                         ≈ 191,6
  st(tTrait, tNext - 0.05 - tTrait, { alt: 430 }, "none");
  shot(tTrait, tNext - tTrait, { ...AIR0, d: 6200, el: 17 }, "none");

  /* ═════════ 191,6 → 197,5 · « En bas, ton chien jaune fait déjà avancer l'avion suivant. Ici, un avion peut partir toutes les 30 secondes. » ═════════ */
  // the line of the ship on the sea → the line of the bow catapult, seen from high (shape, a fade)
  const TOP = { ...P, ...SHARP, tx: -200, ty: 0, tz: -6500, d: 11000, az: -50, el: 48 };
  cut(tNext, null, TOP, {
    ...AT.deck, etape: 3, kmhOn: 0, kmh: 0, ride: 0, track: 2, run: 2000, jet: 0, next: 1, nextRun: -20, hooked: 0, held: 0, strain: 0, broken: 0, shuttle: 0,
    press: 0, valve: 0, under: 0, jbd: 0, dog: 1, sig: 0, crew: 1, parked: 1, pedro: 1, night: 0, fx: -200, fy: 150, fz: -4800, fs: 2500,
  }, { fade: 0.2 });
  const DESC = { ...P, ...SHARP, tx: -200, ty: 150, tz: -4600, d: 3000, az: -50, el: 11, side: -150 };
  shot(tNext, A("suivant:30") - 1.6 - tNext, DESC, "sine.inOut", TOP.d); // down onto the catapult, the next aircraft rolling up
  st(tNext + 0.2, A("suivant:30") - tNext, { nextRun: 0 }, "sine.inOut");
  now(A("suivant:chien"), { sig: 1 });
  const tPedro = F("pedro:gauche", -0.15); //                            ≈ 197,53
  shot(A("suivant:30") - 1.6, tPedro - (A("suivant:30") - 1.6), { ...DESC, tz: -4900, d: 2800, az: -52 });
  fact(D.tl, { id: "c2-trente", k: "Un avion toutes les", v: "30 SECONDES", from: A("suivant:30") - 0.1, to: A("pedro:plongeur") - 0.9 });

  /* ═════════ 197,5 → 204,74 · « Et à gauche du navire, un hélicoptère vole. Un plongeur à bord… ce soir, à ton retour. » ═════════ */
  // the same catapult at the same place of the picture, now far behind Pedro (object): the helicopter in the foreground
  const PEDW = fromEye([-11000, 2600, 1000], -44.5, 5.7, 6030, { ...SHARP });
  cut(tPedro, null, PEDW, { sig: 0, fx: PE[0], fy: PE[1], fz: PE[2], fs: 1500 });
  const tDoor = A("pedro:plongeur") - 0.1;
  shot(tPedro, tDoor - tPedro, fromEye([-11200, 2650, 300], -47, 5, 5800, { ...SHARP }));
  const PEDC = { ...P, ...CLOSE, tx: PE[0], ty: PE[1] - 100, tz: PE[2], d: 1800, az: -60, el: 4, side: -100 };
  const tBackP = A("pedro:soir") - 1.0;
  shot(tDoor, tBackP - tDoor, PEDC, "sine.inOut", 5800); //                « Un plongeur à bord » : toward its door
  const a23 = HAND.c23.from[0];
  const tA = A(HAND.c23.at) - HAND.c23.opt.before; //                         203,74
  shot(tBackP, tA - tBackP, a23, "sine.inOut", PEDC.d); //                    « ce soir, à ton retour » : back, onto the seam's first pose
  seam(D, "c23", "out");
}
