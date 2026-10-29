// c3 · « Le réacteur nucléaire qui lance les avions », « Des centaines de tonnes sous le pont » — HAND.c23 (204,74)
// → HAND.c34 (320,95). The plan, phrase by phrase: docs/L04-actes.md, « c3 » ; journal docs/journal/L04-c3.md.
// The travel from Pedro goes on round the bow, which charges into the wind; a cut to the next aircraft's wing in that
// wind; the ship from ahead, then down to the sea along its hull, up and back to the whole ship; a dive into it to the
// two reactors; the steam main followed up to the receiver, the catapult throwing the next aircraft; a form cut to the
// bench (the steam cylinder beside an electromagnetic launcher). Back to the sea astern: the ship heels. Under the card
// "Des centaines de tonnes", a push; around the port quarter into the hangar; the lift; the ship seen from ahead heels
// to starboard — the same line in the section, where the masses roll; the fins under the hull; a match on the rise to
// the stern; dusk over your dog's shoulder; « abonne-toi » while the camera already flies aft to the seam.
// The camera never crosses the deck plane inside the deck's outline, never runs through the hangar, the island or the
// rows of masses: every move that changes side goes round the OUTSIDE of the ship (checked on the poses below).
import { SET, AT, HAND, VIEW, CLOSE, SHARP, seam, onFrame, cardAt } from "./world.js";
import { CAT, CREW, PLANT, TANK, SHUTTLE_STOP } from "./plan.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const NG = CAT[0].from; //            the nose-gear tow point of the bow catapult (−200, 0, −5500)
const DOG = CREW.dog; //              your yellow dog, ahead of the catapult (−950, 0, −7300)
const DEG = Math.PI / 180;

/** A pose from where the camera STANDS: `eye`, looking along az / el, `d` to the aim. */
const fromEye = (eye, az, el, d, extra = {}) => {
  const ce = Math.cos(el * DEG);
  return { ...P, tx: eye[0] - d * Math.sin(az * DEG) * ce, ty: eye[1] - d * Math.sin(el * DEG), tz: eye[2] - d * Math.cos(az * DEG) * ce, d, az, el, ...extra };
};

export default function ({ D }) {
  const { at, st, now, shot, cut, match, punch } = D;
  const A = (ref) => at(ref);
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame

  /* ═════════ 204,74 → 213,4 · (card « Le réacteur ») « Et sous toi, le navire fonce face au vent… une cinquantaine de kilomètres-heure. » ═════════ */
  const t23 = A(HAND.c23.at);
  seam(D, "c23", "in", {
    set: SET.PONT,
    state: {
      ...AT.deck, etape: 4, kmhOn: 0, kmh: 0, jet: 0, next: 1, nextRun: 0, hooked: 0, held: 0, strain: 0, pedro: 1, speed: 0.6, wind: 0.5,
      dog: 1, sig: 0, crew: 1, parked: 1, fx: -500, fy: -800, fz: -9000, fs: 6000,
    },
  });
  const s0 = t23 + HAND.c23.opt.after; // the seam's own move is over (≈ 205,94)
  // round the bow, low on the sea, from ahead and to port: the stem charging at the camera, its bow wave
  const BOW1 = { ...P, ...SHARP, tx: 0, ty: -700, tz: -12000, d: 8000, az: -155, el: 7, fov: 30, side: -80 };
  const BOW2 = { ...BOW1, d: 7000, az: -160, el: 6 };
  const tPush = A("fonce:parce") + 0.6; //                       ≈ 209,3
  shot(s0, tPush - s0, BOW1);
  const tWing = F("fabrique", -0.05); //                         ≈ 213,4
  shot(tPush, tWing - tPush, BOW2);
  st(A("fonce") - 0.6, 1.0, { pedro: 0 }); //                     he stays abeam, out of the picture
  st(A("fonce:fonce"), 2.0, { speed: 1 }); //                     « fonce » : the bow wave grows
  st(A("wind"), 1.5, { wind: 1 }); //                             « vent » : the streaks run aft over the deck
  st(s0, 3.0, { fx: 0, fy: -700, fz: -12000, fs: 7000 });
  fact(D.tl, { id: "c3-vent", k: "Vent sur le pont", v: "≈ 50 KM/H", from: A("fonce:cinquantaine"), to: tWing - 0.15 });

  /* ═════════ 213,4 → 219,4 · « Ce vent, c'est de la vitesse en plus sous tes ailes, avant même de partir. Et quand il n'y en a pas assez… » ═════════ */
  // a cut on the sentence: the next aircraft on the catapult, its starboard wing from ahead and low (the port sea behind
  // it, not the island), the wind streaming past it
  const WING1 = fromEye([1100, 170, -6500], 147, 1.5, 1740, { ...CLOSE, fov: 34, side: -40 });
  const WING2 = fromEye([1180, 160, -6250], 142, 1.5, 1700, { ...CLOSE, fov: 34, side: -40 });
  cut(tWing, null, WING1, { fx: NG[0] - 300, fy: 140, fz: NG[2] + 500, fs: 1500 });
  const tFront = F("speedup", -0.12); //                          ≈ 219,4
  shot(tWing, tFront - tWing, WING2);

  /* ═════════ 219,4 → 227,2 · « …le navire le fabrique : il fonce dedans. » « Lui peut filer à 27 nœuds… à lui seul. » ═════════ */
  // « le navire le fabrique » : a cut on the word to the ship from ahead and high, charging at the camera, its wake behind
  const FRONT1 = { ...P, ...SHARP, tx: 0, ty: -600, tz: -3000, d: 26000, az: -150, el: 12, fov: 30 };
  const FRONT2 = { ...FRONT1, d: 23500, az: -147 };
  cut(tFront, null, FRONT1, { fx: 0, fy: -600, fz: -3000, fs: 16000 });
  const tDown = A("vitesse") - 0.35; //                           ≈ 221,0
  shot(tFront, tDown - tFront, FRONT2);
  // then down to the sea, along the port bow: the hull at the water, the sea running past (the camera rides with the ship)
  const FLANK1 = fromEye([-4500, -800, -14000], -153.8, 3.2, 7256, { ...SHARP, side: -60 }); // ahead of the port bow, looking aft along the hull
  const FLANK2 = fromEye([-4400, -820, -13300], -151, 3.0, 7000, { ...SHARP, side: -60 });
  const tFlank = A("knots") + 0.6; //                             ≈ 222,8
  shot(tDown, tFlank - tDown, FLANK1, "sine.inOut", FRONT2.d);
  const tRise = A("vitesse:seul") - 0.45; //                      ≈ 226,0
  shot(tFlank, tRise - tFlank, FLANK2);
  st(tDown, 1.8, { fx: -1300, fy: -1200, fz: -7500, fs: 6000 });
  fact(D.tl, { id: "c3-noeuds", k: "Il file à", v: "27 NŒUDS", s: "≈ 50 KM/H", from: A("knots"), to: A("vitesse:presque") + 0.6 });

  /* ═════════ 226,0 → 232,8 · « Plus de 260 mètres. 42 000 tonnes. Et pour pousser tout ça… deux réacteurs nucléaires. » ═════════ */
  // « à lui seul » : up toward the deck, which becomes a pull-back (by ratio) to the whole ship
  const UP = { ...P, ...SHARP, tx: -1300, ty: -200, tz: -6500, d: 4400, az: -130, el: 12, side: -40 };
  const WIDE = { ...VIEW.shipWide, ...SHARP };
  const tWide = A("hull") - 0.25; //                              ≈ 227,15
  shot(tRise, tWide - tRise, UP);
  const tDive = A("reactor") - 0.15; //                           ≈ 231,33
  shot(tWide, tDive - tWide, WIDE, "sine.inOut", UP.d);
  st(tWide, 2.0, { fx: 0, fy: -400, fz: 0, fs: 16000 });
  fact(D.tl, { id: "c3-long", k: "Le Charles de Gaulle", v: "+ DE 260 MÈTRES", from: A("hull"), to: A("nucleaire:tonnes") - 0.55 });
  fact(D.tl, { id: "c3-masse", k: "Il pèse", v: "42 000 TONNES", from: A("nucleaire:tonnes") - 0.5, to: A("nucleaire:pousser") + 0.45 });
  // « deux réacteurs » : the glass clears, the two vessels light deep in it, and the camera dives toward them
  const PLANT1 = { ...P, ...SHARP, tx: 0, ty: PLANT.reactors[0][1] + 50, tz: PLANT.reactors[0][2], d: 3600, az: -60, el: 9, side: -60 };
  const tPlant = A("unique") - 0.25; //                           ≈ 232,6
  shot(tDive, tPlant - tDive, PLANT1, "sine.inOut", WIDE.d);
  st(tDive, 1.2, { ship: 0.6, under: 0.6 });
  st(A("reactor"), 1.2, { plant: 1 });
  st(tDive + 0.2, 1.4, { fx: 0, fy: -2050, fz: 900, fs: 2600 });
  D.quiet(A("unique"), A("vapeur2")); //                          the picture says it: no keyword over the fact below

  /* ═════════ 232,6 → 237,7 · « C'est le seul porte-avions nucléaire au monde… qui ne soit pas américain. » ═════════ */
  // two moves, never a still: a crane up over the two vessels, then along to where the main leaves them (the eye
  // stays outboard of the sponson: it rises past the deck's height later)
  const PLANT2 = { ...PLANT1, ty: -2050, d: 3600, az: -62, el: 22 };
  const PLANT3 = { ...P, ...SHARP, tx: 0, ty: -1800, tz: 300, d: 3600, az: -72, el: 16, side: -60 };
  const tFeed = A("vapeur2:vient") - 0.1; //                      ≈ 237,7
  const tAlong = A("unique:monde") + 0.4; //                       ≈ 234,8
  shot(tPlant, tAlong - tPlant, PLANT2);
  shot(tAlong, tFeed - tAlong, PLANT3);
  fact(D.tl, { id: "c3-seul", k: "Porte-avions nucléaire", v: "LE SEUL", s: "hors des États-Unis", from: A("unique"), to: A("unique$") + 0.25 });

  /* ═════════ 237,7 → 242,0 · « Et ta vapeur du début ? Elle vient de là. La chaufferie nucléaire… vient de te lancer. » ═════════ */
  // « vient de là » : the steam runs up the main (fixed-speed dashes) and the camera follows it forward and UP, outside
  // the hull (it crosses the deck's height outboard of the sponson), to the receiver and the catapult above it
  const MAIN = { ...P, ...SHARP, tx: TANK.at[0], ty: TANK.at[1], tz: TANK.at[2], d: 5200, az: -62, el: 30, side: -60 };
  const CATV = { ...P, ...SHARP, tx: NG[0], ty: -200, tz: NG[2] - 2500, d: 8000, az: -28, el: 28, side: -40 }; // along the catapult, from high astern-port
  const tCat = A("launchedby") - 0.75; //                         ≈ 240,6
  shot(tFeed, tCat - tFeed, MAIN);
  const tBench = F("nimitz", -0.07); //                           ≈ 241,97
  shot(tCat, tBench - tCat, CATV);
  st(A("vapeur2:vient"), 2.6, { feed: 1 }, "sine.inOut"); //       the front climbs; its dashes run at a fixed speed
  st(A("steamfrom") + 0.5, 0.8, { tank: 1 });
  st(tFeed, 2.4, { fx: -100, fy: -1000, fz: -2400, fs: 3500 });
  st(tFeed, 1.5, { speed: 0.15 }, "sine.inOut"); //              the bow-wave collar, seen from above through the glass, was a blurred white U across the frame (241,3)
  st(tCat, 0.6, { ship: 0.35 }); //                                the glass of the hull steps back: the catapult reads
  st(tCat + 0.1, 0.3, { valve: 1 });
  st(tCat + 0.15, 0.4, { press: 1 });
  // « vient de te lancer » : the next aircraft is thrown down the catapult (not yours: `hooked` 0, its own track)
  const tThrow = tCat + 0.25; //                                  ≈ 240,85
  st(tThrow, 0.75, { shuttle: SHUTTLE_STOP, nextRun: SHUTTLE_STOP }, "power2.in");
  st(tThrow + 0.75, 0.33, { nextRun: 110 }, "none"); //            gone past the bow before the cut

  /* ═════════ 242,0 → 254,8 · « Avec les grands porte-avions américains de la classe Nimitz… Lui est resté… à la vapeur. » ═════════ */
  // a dissolve to the bench on the FORM: the steam cylinder lies in the same place and the same direction as the
  // catapult's cylinders a frame before (same az / el), its piston behind the steam; then a slow glide along it
  const SX = -95; //                      model.js: the steam length at x −95, the electromagnetic one at x +95, along z
  const B1 = { ...P, ...CLOSE, tx: SX, ty: 44, tz: -60, d: 680, az: -28, el: 28, side: -40 };
  const B2 = { ...P, ...CLOSE, tx: SX, ty: 44, tz: 30, d: 560, az: -34, el: 16, side: -60 };
  const B3 = { ...P, ...CLOSE, tx: 95, ty: 40, tz: 0, d: 600, az: -28, el: 16, side: -60 };
  const B4 = { ...P, ...CLOSE, tx: -30, ty: 40, tz: -10, d: 960, az: -24, el: 19, side: -20 };
  cut(tBench, SET.BENCH, B1, { ...AT.bench, etape: 4, kmhOn: 0, item: 2, press: 1, coils: 0, mood: 0, fx: SX, fy: 44, fz: 0, fs: 260, pool: 0.32 }, { fade: 0.2 });
  const tEm = A("aimants") - 0.1; //                              ≈ 247,76
  shot(tBench, tEm - tBench, B2);
  const tBack = A("aimants:lui") - 0.3; //                        ≈ 252,5
  shot(tEm, tBack - tEm, B3); //                                  « Les tout derniers… » : sideways to the coils
  st(A("emals"), 1.4, { coils: 1 }, "sine.inOut"); //             « électromagnétiques » : the wave runs along them (and stays lit, low)
  st(tEm, 2.5, { fx: 95, fy: 40, fs: 300 });
  const tSea = onFrame(A("penche") - 0.1); //                     ≈ 254,8
  shot(tBack, tSea - tBack + 0.6, B4); //                         « Lui est resté… à la vapeur » : back, toward the steam
  st(tBack, 1.6, { fx: -40, fs: 360 });

  /* ═════════ 254,8 → 262,0 · « Mais un navire qui vire, que le vent pousse… ça penche. Alors comment ce pont reste-t-il à plat… ? » ═════════ */
  // a dissolve back to the sea: the whole ship from astern, low, the horizon level — it heels, the horizon does not.
  // The forward lift's platform waits down at the hangar floor (`lift` 1): it comes up with its two aircraft later.
  const AST1 = { ...P, ...SHARP, tx: 0, ty: -900, tz: 13075, d: 7500, az: 0, el: 2 };
  const AST2 = { ...AST1, d: 7200, az: 2, el: 2.4 };
  const AST3 = { ...AST1, ty: -800, d: 6400, az: 3, el: 3 };
  cut(tSea, SET.PONT, AST1, {
    ...AT.deck, etape: 4, kmhOn: 0, jet: 0, next: 0, dog: 1, crew: 0.6, parked: 1, speed: 1, wind: 1, swell: 0.2, lift: 1,
    fx: 0, fy: -900, fz: 12000, fs: 7000,
  }, { fade: 0.2 });
  const tLean = A("lean") - 0.15; //                               ≈ 257,33
  shot(tSea, tLean - tSea, AST2);
  const tCard5 = cardAt(D, "gite"); //                             262,02
  shot(tLean, tCard5 - tLean, AST3); //                            the push goes on through the 1,2 s hold (the ad break)
  st(tLean, 1.2, { heel: 4 }); //                                  « penche » : the deck tilts, starboard down
  punch(A("lean"), 0.05);

  /* ═════════ 262,0 → 270,0 · (card « Des centaines de tonnes ») « À plat… ce n'est pas si simple. Dans un virage serré… aussi. » ═════════ */
  now(tCard5, { etape: 5 });
  threadCall(D.tl, { from: tCard5, to: tCard5 + 2.5, text: "Le pont ? Toujours penché." });
  // under the card, a whip: a push by ratio and a swing to starboard, higher (the deck is never seen grazing)
  const G1 = { ...P, ...SHARP, tx: -300, ty: -700, tz: 12000, d: 4800, az: 14, el: 14 };
  const G2 = { ...G1, tx: -200, tz: 11500, d: 4400, az: 19, el: 15 };
  shot(tCard5, 1.0, G1, "sine.inOut", AST3.d);
  const tHangar = A("hangar") - 0.05; //                           ≈ 269,96
  shot(tCard5 + 1.0, tHangar - (tCard5 + 1.0), G2);
  st(A("gite:virage") - 0.05, 1.0, { heel: 6 }); //                « virage serré » : further
  st(tCard5, 2.0, { fx: -200, fy: -700, fz: 11000, fs: 6000 });

  /* ═════════ 270,0 → 279,1 · « Et même ses avions le font pencher. Sous le pont, ils dorment dans un hangar… deux ascenseurs au bord du navire. » ═════════ */
  // round the port quarter, OUTSIDE the ship and up (never over the deck at its height), then down to the hangar's glass
  const H2 = { ...VIEW.hangar, ...SHARP, el: 9 };
  const H3 = { ...H2, ty: -420, d: 4500, az: -62, el: 9 };
  const H4 = { ...P, ...SHARP, tx: 1500, ty: -420, tz: 850, d: 6000, az: -64, el: 8, side: -140 };
  // (the brouillon: the swing round the port quarter was jerky at 272,7 — now the push from astern goes on, and a CUT on
  // « Sous le pont » lands at the hangar's glass, still pushing: a cut matched on the forward move)
  const G3 = { ...G2, d: 4000, az: 22, el: 15.5 };
  const tCutH = F("hangar:sous", -0.1); //                         ≈ 271,83
  shot(tHangar, tCutH - tHangar, G3);
  cut(tCutH, null, H2, { ship: 0.8, fleet: 1, hangar: 0.4, fx: 0, fy: -380, fz: 1500, fs: 5000 });
  const tTurn = A("hangar:deux") - 0.2; //                         ≈ 277,0
  shot(tCutH, tTurn - tCutH, H3);
  const tLift = F("ascenseur", -0.06); //                          ≈ 279,1
  shot(tTurn, tLift - tTurn, H4); //                               « deux ascenseurs » : toward the hangar's starboard opening
  st(A("hangar:avions") - 0.1, 1.3, { heel: 0 }); //               ends before the cut
  st(tCutH + 0.1, 1.2, { hangar: 1 });
  fact(D.tl, { id: "c3-hangar", k: "Le hangar", v: "4 000 M²", s: "6 MÈTRES DE HAUT", from: A("hangar:mètres") - 0.35, to: A("hangar:pour") - 0.1 });

  /* ═════════ 279,1 → 283,4 · « Chacun peut porter deux avions, jusqu'à 36 tonnes. » ═════════ */
  // a cut to the other side, on the object: the lift, seen from starboard; its platform comes UP with its two aircraft
  const L1 = { ...VIEW.lift, ...SHARP, side: -140 };
  const L2 = { ...L1, ty: -60, d: 3500, az: 45, el: 13 };
  cut(tLift, null, L1, { fx: 2925, fy: -300, fz: 850, fs: 3000 });
  const tAhead = F("ascenseur:rangés", -0.1); //                   ≈ 283,4
  shot(tLift, tAhead - tLift, L2);
  st(A("lift"), 2.8, { lift: 0 }, "sine.inOut"); //                « porter » : the platform rises to the deck
  st(tLift + 0.3, 1.0, { hangar: 0.6 });
  fact(D.tl, { id: "c3-lift", k: "Un ascenseur porte", v: "36 TONNES", s: "deux avions", from: A("ascenseur:tonnes") - 0.45, to: tAhead - 0.15 });

  /* ═════════ 283,4 → 287,1 · « Et quand quelques avions sont rangés d'un même côté… tout le pont se met à pencher. » ═════════ */
  // a cut on « rangés » to the ship from ahead and high: starboard (the island, the lift, the parked aircraft) on the LEFT —
  // it heels starboard down, the deck line tilting left-down, as it will in the section that follows
  const AH1 = { ...P, ...SHARP, tx: 300, ty: -200, tz: -1000, d: 14000, az: 160, el: 16 };
  const AH2 = { ...AH1, d: 12600, az: 163, el: 15 };
  cut(tAhead, null, AH1, { ship: 1, hangar: 0, fx: 300, fy: -200, fz: -1000, fs: 12000 });
  const tSection = F("masses:coque", -0.12); //                    ≈ 287,1
  shot(tAhead, tSection - tAhead, AH2);
  st(A("ascenseur:rangés"), 0.6, { parked: 1, crew: 0.8 });
  st(A("lean2") - 0.1, 1.0, { heel: 3 }); //                       « pencher »

  /* ═════════ 287,1 → 294,0 · « Alors, dans la coque, quelque chose se met en marche. Des masses de métal… qui roulent de l'autre côté. » ═════════ */
  // a cut on the FORM to the section (from ahead, inside the bow: starboard on the LEFT): the same deck line at the same
  // angle; the masses light, the camera pushes onto their first row — and they roll to port while the deck rights
  const X1 = { ...VIEW.section, ...SHARP };
  const X1b = { ...X1, d: 5900, el: 4.5 };
  const X2 = { ...P, ...CLOSE, tx: 0, ty: -1180, tz: -3500, d: 2700, az: 172, el: 9, fov: 30 };
  const X3 = { ...X2, d: 2550, az: 168, el: 9.5 };
  cut(tSection, null, X1, { ...AT.section, etape: 5, kmhOn: 0, heel: 3, masses: 0, massGlow: 0, mood: 0, swell: 0.2, speed: 1, wind: 1 });
  const tPushM = A("massesall") - 0.2; //                          ≈ 289,3
  shot(tSection, tPushM - tSection, X1b);
  const tRoll = A("masses") - 0.25; //                             ≈ 292,4
  shot(tPushM, tRoll - tPushM, X2);
  const tBackX = A("tonnes") - 0.1; //                             ≈ 294,0
  shot(tRoll, tBackX - tRoll, X3);
  st(A("masses:marche") - 0.2, 0.8, { massGlow: 1 }); //            « se met en marche »
  st(A("masses"), 2.5, { masses: -1, heel: 0 }, "sine.inOut"); //    « roulent de l'autre côté » : the deck rights on the picture
  st(tPushM, 2.2, { fy: -1180, fz: -3500, fs: 2200 });

  /* ═════════ 294,0 → 303,8 · « Combien ? Plusieurs centaines de tonnes… pour que ton pont reste plat. » « C'est un ordinateur… elles glissent de l'autre. » ═════════ */
  const X4 = { ...X1, d: 6400, az: 178, el: 5 };
  const X5 = { ...X1, d: 6100, az: 175, el: 6 };
  const X6 = { ...X1, d: 6200, az: 156, el: 10 };
  const tSlow = A("tonnes:baladent") - 0.3; //                     ≈ 296,5
  shot(tBackX, tSlow - tBackX, X4); //                             back to the whole section
  const tOrb = A("ordinateur") - 0.05; //                          ≈ 299,5
  shot(tSlow, tOrb - tSlow, X5);
  const tFins = F("ailerons", -0.1); //                            ≈ 303,8
  shot(tOrb, tFins - tOrb, X6); //                                  a slow orbit to three-quarters
  st(tBackX, 2.0, { fy: -900, fs: 3500 });
  D.quiet(A("tonnes:centaines") - 0.1, A("tonnes:qui") + 1.1); //   one thing written at a time: the fact, not « CÔTÉ »
  fact(D.tl, { id: "c3-tonnes", k: "Les masses", v: "PLUSIEURS CENTAINES", s: "DE TONNES", from: A("tonnes:centaines") - 0.05, to: A("tonnes:qui") + 1.05 });
  st(A("tonnes:baladent"), 2.1, { masses: 0 }, "sine.inOut"); //    « d'un bord à l'autre » : the deck stays flat
  st(A("ordinateur:penche") - 0.1, 0.9, { heel: -3 }); //           « penche d'un côté » : port down
  st(A("ordinateur:glissent") - 0.05, onFrame(tFins - 0.05) - (A("ordinateur:glissent") - 0.05), { masses: 1, heel: 0 }); // « elles glissent de l'autre »

  /* ═════════ 303,8 → 307,1 · « Et avec ses ailerons sous la coque et son gouvernail, le navire vise un pont plat… » ═════════ */
  // a cut on the word: under the hull, the fins lit and beating; the camera rises along the flank toward the surface
  const FN1 = { ...P, ...CLOSE, tx: -1400, ty: -2300, tz: -3500, d: 2300, az: -60, el: -6, fov: 32 }; // the port fin, close
  const FN2 = { ...FN1, d: 2150, az: -66, el: -7 };
  const FN3 = { ...P, ...CLOSE, tx: -1300, ty: -2150, tz: -3300, d: 2400, az: -70, el: -5, fov: 32 };
  const FN4 = { ...FN3, ty: -1950, tz: -3150, az: -72, el: -2 };
  cut(tFins, SET.PONT, FN1, {
    ...AT.deck, etape: 5, kmhOn: 0, jet: 0, next: 0, dog: 1, crew: 0.6, parked: 1, mood: 0, hot: 0, speed: 1, wind: 1, swell: 0.2, fins: 0,
    fx: 0, fy: -2300, fz: -3500, fs: 3000,
  });
  const tUp = A("ailerons:gouvernail") + 0.3; //                   ≈ 305,9
  shot(tFins, tUp - tFins, FN2);
  const tMatch = F("ailerons:pont", -0.2); //                      ≈ 307,1
  const before = 0.8;
  shot(tUp, tMatch - before - tUp, FN3);
  st(A("fins") - 0.05, 0.7, { fins: 1 }); //                       « ailerons » : lit, working

  /* ═════════ 307,1 → 312,4 · « …à un demi-degré près. De quoi faire voler ses avions même par mer forte. » ═════════ */
  // a match on the rise: under water along the flank → above it, astern: the deck seen from behind, flat; then the swell
  const ASTF0 = { ...P, ...SHARP, tx: 0, ty: -1500, tz: 13075, d: 8000, az: -8, el: 0.6 };
  const ASTF1 = { ...P, ...SHARP, tx: 0, ty: -750, tz: 12500, d: 7600, az: -4, el: 8 };
  const ASTF2 = { ...ASTF1, ty: -700, d: 7300, az: -3, el: 9 };
  const after = 0.9;
  match(tMatch, [FN3, FN4], ASTF0, { before, after, state: { fx: 0, fy: -900, fz: 12000, fs: 7000 } });
  const tFlat = A("halfdeg") + 1.7; //                             ≈ 310,1
  shot(tMatch + after, tFlat - (tMatch + after), ASTF1);
  const tSeuil = A("seuil") - 0.1; //                               ≈ 312,3
  shot(tFlat, tSeuil - tFlat, ASTF2);
  fact(D.tl, { id: "c3-degre", k: "Pont plat à", v: "UN DEMI-DEGRÉ", s: "près", from: A("halfdeg"), to: A("ailerons:mer") - 0.2 });
  st(A("ailerons:mer") + 0.05, 1.5, { swell: 1 }); //               « mer forte » : the long rollers; the deck stays level over them
  st(tFlat, 1.4, { fins: 0 });

  /* ═════════ 312,3 → 320,95 · LE SEUIL « Ce pont plat, ce soir, il faudra le retrouver. De nuit, sous les yeux de ton chien jaune. Si tu veux voir comment on s'y pose… abonne-toi : on y arrive. » ═════════ */
  const ASTF3 = { ...ASTF2, ty: -550, d: 7000, az: -2, el: 10 };
  const tDog = F("seuil:sous", -0.1); //                            ≈ 315,53
  shot(tSeuil, tDog - tSeuil, ASTF3);
  st(A("seuil:soir") - 0.1, 6.9, { night: 0.45 }, "sine.inOut"); //  « ce soir » : the day begins to fall (until ≈ 320,1)
  st(A("seuil:soir") + 0.3, 2.8, { swell: 0.3 });
  // « sous les yeux de ton chien jaune » : a cut over his right shoulder (at the bow, looking aft), the deck at dusk
  const DOG1 = fromEye([DOG[0] - 150, 270, DOG[2] - 800], -180, 4, 2500, { ...CLOSE, fov: 40, side: -60 });
  const DOG2 = fromEye([DOG[0] - 140, 262, DOG[2] - 680], -180, 4, 2400, { ...CLOSE, fov: 40, side: -70 });
  cut(tDog, null, DOG1, { mood: 1, hot: 0.12, sig: 0, vest: 0.35, fx: DOG[0], fy: 150, fz: DOG[2], fs: 1500 });
  const tFly = A("seuil:jaune") + 0.4; //                           ≈ 317,0
  shot(tDog, tFly - tDog, DOG2);
  st(A("seuil:chien") - 0.1, 0.4, { vest: 1 }); //                   his vest, lit
  // « Si tu veux voir comment on s'y pose… abonne-toi » : the camera is ALREADY on its way — it rises and swings out over
  // the port side (az −180 → −36 by port: never over the island), aft, onto the seam's first pose at 319,95
  const c34 = HAND.c34;
  const tA = A(c34.at) - c34.opt.before; //                         319,95
  shot(tFly, tA - tFly, c34.from[0], "sine.inOut");
  st(tFly, tA - tFly, { speed: 0.4, wind: 0.4, fx: NG[0], fy: 150, fz: NG[2] + 400, fs: 900 }, "sine.inOut"); // AT.deck's, for c4's seam
  D.tl.to(".hud__brand", { color: "#5cffb0", duration: 0.2 }, A("subscribe")); //               « abonne-toi » : the account name
  D.tl.to(".hud__brand", { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, A("seuil$") + 0.1);
  seam(D, "c34", "out");
}
