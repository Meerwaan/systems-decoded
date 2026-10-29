// c2 · « Comment se gonfle le toboggan », « D'où viennent les 90 secondes » — HAND.c12 (49,84) → HAND.c23 (161,59).
// docs/L03-actes.md, c2 ; journal docs/journal/L03-c2.md.
// Every instant is read off the script (D.at). Every cut gives a COMPLETE state (AT.* + what differs), and no number is
// moved by two tweens at once: each tween ends before the next one on the same number, and before any cut that resets it.
import { SET, AT, HAND, VIEW, CLOSE, SHARP, benchLight, seam, onFrame, cardAt } from "./world.js";
import { ITEM, PLANES } from "./plan.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const D1 = PLANES.a350.doors[0][1]; // door 1 (x)

export default function ({ D }) {
  const { at, st, now, shot, cut, match, punch } = D;
  const A = (ref) => at(ref);
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame

  /* complete states, one per place */
  const cab = (x = {}) => ({ ...AT.cabin, crew: 0, ...x }); //                      the cabin at rest, lit (the crew of glass would fill the door shots)
  const trial = (x = {}) => ({ ...AT.trial, ...x }); //                               the trial's cabin, dark
  const apron = (x = {}) => ({ ...AT.apron, ...x }); //                               the apron at night (site 3)
  const hangar = (x = {}) => ({ ...AT.hangar, shut: 1, ...x }); //                    the trial hangar, the right doors condemned
  const RIG = { ...AT.bench, ...benchLight(ITEM.PACK), explode: 2, gas: 1 }; //       the working rig on the bench
  const ASPL = { fx: -23, fy: 80, fz: 0, fs: 60 }; //                                 the light on the aspirator

  /* ───────── 49,84 → 56,2 · « Pendant le vol, chaque porte est armée. Un levier… et la barre … accrochée au plancher. » ───────── */
  const t12 = onFrame(A(HAND.c12.at));
  const p0 = seam(D, "c12", "in", { set: SET.CABINE, state: cab({ arm: 0 }) });
  now(t12, { step: 1, chronoOn: 0, chrono: 0 });
  const LEVER = { ...VIEW.lever, ...CLOSE };
  shot(t12 + HAND.c12.opt.after, 52.35 - (t12 + HAND.c12.opt.after), LEVER, "sine.inOut", p0.d); // the push goes on, to the lever
  st(A("arm"), 1.1, { arm: 0.35 }); //                     « armée » : her hand pushes the lever
  const tSill = F("gonfle:barre", -0.37); //                 « et la barre » : cut on the floor brackets
  shot(52.35, tSill - 52.35, { ...LEVER, d: 108, az: 153, el: 10 });
  const SILL = { ...VIEW.sill, ...CLOSE };
  cut(tSill, null, SILL, cab({ arm: 0.35 }));
  shot(tSill, 2.6, { ...SILL, d: 100, az: 146, el: 22 });
  st(tSill + 0.25, 1.25, { arm: 0.65 }, "sine.inOut"); //      the girt bar goes down into its brackets — « accrochée »
  st(A("gonfle:plancher") - 0.4, 0.5, { arm: 1 }, "power2.out"); // hooked: the lever ends its turn, the lamp

  /* ───────── 56,2 → 61,5 · « La porte s'ouvre et tire le paquet… Retenu au plancher par sa barre… » ───────── */
  const tDoor = F("ouverture", -0.15);
  const DOOR = { ...P, ...CLOSE, tx: -20, ty: 90, tz: 262, d: 400, az: 138, el: 8, fov: 30 };
  cut(tDoor, null, DOOR, cab({ arm: 1 }));
  st(A("ouverture:s'ouvre"), 2.0, { door: 1 });
  st(A("pull"), 1.0, { pulled: 1 });
  now(A("ouverture:retenu"), { named: 4 }); //               the bar holds at the sill, lit a moment
  now(A("ouverture:toboggan"), { named: 0 });
  const tFall = F("drop", -0.12);
  const fallA = { ...DOOR, tx: -36, d: 370, az: 134 };
  shot(tDoor, tFall - 0.6 - tDoor, fallA);
  // « tombe » : the fall goes on across the cut (down on both sides), outside under the sill of door 1L
  const OUT_C = { ...P, ...CLOSE, tx: D1, ty: 530, tz: 330, d: 450, az: -18, el: -6 };
  match(tFall, [fallA, { ...fallA, ty: 72, el: 11 }], [OUT_C, { ...OUT_C, ty: 470, el: -2, d: 470 }], {
    set: SET.PISTE, state: apron({ doorA: 0.3 }), fade: 0.2,
  });
  st(A("drop"), 0.6, { doorA: 0.45 }, "power2.in"); //       the pack drops and hangs by its bar

  /* ───────── 62,5 → 71,2 · « Et là, sa bouteille libère son gaz : de l'azote… ce n'est pas elle qui le gonfle. Pas toute seule. » ───────── */
  const tBottle = F("bouteille", -0.14);
  const BOTTLE = { ...VIEW.bottle, ...CLOSE };
  cut(tBottle, SET.BENCH, BOTTLE, { ...RIG, gas: 0, tube: 0, fx: 122, fy: 10, fz: 20, fs: 60 }, { fade: 0.2 });
  shot(tBottle, 65.0 - tBottle, { ...BOTTLE, d: 118, az: -26 });
  st(A("gas"), 1.4, { gas: 1 }, "power1.out"); //            « libère » : the valve, the needle, the cold jet in the hose
  fact(D.tl, { id: "c2-gaz", k: "Le gaz", v: "AZOTE", s: "souvent mêlé de gaz carbonique", from: A("bouteille:l'azote") - 0.2, to: A("bouteille:mais") });
  const RIGP = { ...VIEW.rig, ...SHARP, d: 430, az: -42, el: 22 }; // three quarters, from above: hung and flat
  shot(65.0, 3.6, RIGP, "sine.inOut", 118); //                the pull-back to the flat tube
  st(65.0, 3.6, { fx: 0, fy: 40, fz: 0, fs: 120 });
  st(A("bouteille:n'est"), 0.7, { tube: 0.12 }); //           « ce n'est pas elle » : the tube hardly moves
  // « Pas toute seule » : the camera glides toward the aspirators, and the move goes on into the cut-open one
  const AW = { ...P, ...CLOSE, tx: -23, ty: 84, tz: 0, d: 200, az: -14, el: 8 };
  const tAsp = F("jet", -0.15);
  shot(68.6, tAsp - 0.6 - 68.6, AW);
  st(68.7, tAsp - 0.1 - 68.7, ASPL);
  const ASP = { ...VIEW.asp, ...CLOSE };
  const aspIn = match(tAsp, [AW, { ...AW, d: 185, az: -11 }], ASP, { state: { ...RIG, ...ASPL, see: 1, tube: 0.12 } });

  /* ───────── 71,2 → 76,4 · « Son gaz file… Ce jet crée un vide… et un clapet s'ouvre. » ───────── */
  shot(tAsp + 0.9, 76.3 - (tAsp + 0.9), { ...ASP, d: 78, az: aspIn.az - 2 });
  st(A("jet:file"), 0.8, { jet: 0.6 });
  st(A("venturi"), 0.5, { jet: 1 }); //                      « vide » : the low pressure behind the nozzle darkens
  punch(A("venturi"), 0.06);
  st(A("valve"), 0.4, { valve: 1 }, "power2.out"); //          « clapet »
  now(A("valve"), { named: 5 });

  /* ───────── 76,4 → 81,9 · « Alors, l'air du dehors s'engouffre… Ton toboggan se gonfle… en avalant l'air » ───────── */
  st(A("aspire:s'engouffre"), 1.0, { air: 1 });
  const R1 = { ...P, ...CLOSE, tx: -12, ty: 70, tz: 0, d: 220, az: -12, el: 8 };
  const R2 = { ...P, ...SHARP, tx: -6, ty: 62, tz: 0, d: 265, az: -15, el: 9 };
  const tGulp = F("gulp", -0.1);
  shot(77.9, tGulp - 0.6 - 77.9, R1, "sine.inOut", 78); //     the pull-back along the tube that rounds
  st(78.0, tGulp - 0.15 - 78.0, { tube: 0.85 }, "sine.inOut");
  st(77.9, tGulp - 0.2 - 77.9, { fx: -10, fy: 60, fs: 100 });
  const SLIDE_IN = { ...P, ...SHARP, tx: D1, ty: 300, tz: 650, d: 1100, az: -20, el: 3 };
  const slideOut = match(tGulp, [R1, R2], SLIDE_IN, { set: SET.PISTE, state: apron({ doorA: 0.45 }), fade: 0.2 });
  st(tGulp + 0.05, 1.3, { doorA: 0.9 }); //                   the slide of 1L inflates outside
  st(A("gulp"), 0.35, { gulp: 1 }); //                        « avalant l'air » : the veille wisps drawn in
  st(81.25, 0.5, { gulp: 0 });
  shot(tGulp + 0.9, 0.5, { ...slideOut, d: slideOut.d * 0.98 });

  /* ───────── 81,9 → 85,2 · « Quand il est plein, les clapets se referment. » ───────── */
  const tFull = F("plein", -0.1);
  cut(tFull, SET.BENCH, { ...ASP, d: 86, az: -2 }, { ...RIG, ...ASPL, see: 1, jet: 1, valve: 1, air: 1, tube: 0.85, named: 5 }, { fade: 0.2 });
  shot(tFull, 3.3, { ...ASP, d: 80, az: 2 });
  st(A("plein:plein"), 0.4, { tube: 1 });
  st(A("plein:referment"), 0.4, { valve: 0 }, "power2.in");
  st(A("plein:referment"), 0.6, { air: 0 });
  st(A("plein:referment"), 0.8, { jet: 0 });
  now(A("plein:referment") + 1.0, { named: 0 }); //            the flaps stay veille a second

  /* ───────── 85,2 → 88,3 · « En quelques secondes, il est debout : ta porte donne sur une pente, jusqu'au sol. » ───────── */
  const tUp = F("full", -0.15);
  const PROF = { ...VIEW.slideProfile, ...SHARP };
  cut(tUp, SET.PISTE, PROF, apron({ doorA: 1 }), { fade: 0.2 });
  const tClap = F("fuite", -0.12);
  shot(tUp, 86.4 - tUp, { ...PROF, d: 1720, az: 28 });
  shot(86.4, tClap - 86.4, { ...PROF, tx: -2620, ty: 360, tz: 620, d: 1500, az: 24, el: 6 }); // « une pente » : up the slope to the door

  /* ───────── 88,3 → 94,0 · « Et ces clapets doivent rester fermés. Un doigt, un débris… et le toboggan peut se dégonfler. » ───────── */
  const CLAP = { ...P, ...CLOSE, tx: -23, ty: 86, tz: 0, d: 100, az: 6, el: 8 };
  cut(tClap, SET.BENCH, CLAP, { ...RIG, ...ASPL, see: 1, tube: 1, named: 5 }, { fade: 0.2 });
  shot(tClap, 92.4 - tClap, { ...CLAP, d: 92, az: 2 });
  st(A("fuite:débris"), 0.6, { leak: 1 }); //                 a debris props a flap open: the air streams out
  now(A("fuite:débris"), { named: 0, mood: 1 });
  const tArr = F("desarme", -0.1);
  shot(92.4, tArr - 0.05 - 92.4, { ...VIEW.tube, ...SHARP, d: 300 }, "sine.inOut", 92); // « dégonfler » : pull back, the tube sags
  st(92.4, 1.5, { fx: 0, fy: 50, fs: 100 });
  st(A("fuite:dégonfler") - 0.1, 0.65, { tube: 0.65 });

  /* ───────── 94,0 → 97,8 · « Et à l'arrivée ? L'équipage désarme les portes avant d'ouvrir. » ───────── */
  const LEV2 = { ...VIEW.lever, ...CLOSE, d: 160, az: 158, el: 12 };
  cut(tArr, SET.CABINE, LEV2, cab({ arm: 1 }), { fade: 0.2 });
  const tTerm = F("desarme:terminal", -0.15);
  shot(tArr, tTerm - tArr, { ...LEV2, d: 138, az: 154 });
  st(A("disarm"), 1.0, { arm: 0 }); //                        « désarme » : the bar comes back up into the door

  /* ───────── 97,8 → 100,8 · « Sinon, au terminal, le toboggan se gonflerait… pour rien. » ───────── */
  const AD = { ...VIEW.apronDoor, ...SHARP };
  cut(tTerm, SET.PISTE, AD, apron({ doorA: 0, bridge: 0 }), { fade: 0.2 });
  const tRel = F("relance1", -0.1);
  shot(tTerm, tRel - tTerm, { ...AD, d: 1980, az: -26 });
  st(tTerm + 0.05, 2.2, { bridge: 0.3 }); //                  the jet bridge still coming (never above 0.3: it would disarm)
  st(98.45, 1.6, { doorA: 1 }); //                             the door opens, the slide bursts out under its nose
  st(99.0, 0.35, { gulp: 1 });
  st(99.9, 0.5, { gulp: 0 });

  /* ───────── 100,8 → 107,6 · « Un toboggan, c'est quelques secondes. Mais ces 90 secondes… d'où viennent-elles ? » (+ coupure pub) ───────── */
  const HW = { ...VIEW.hangarWide, ...SHARP };
  cut(tRel, SET.PISTE, HW, hangar({ doorA: 1, evac: 0.3 }));
  const card2 = cardAt(D, "origine");
  const tDoc = onFrame(card2 + 0.73);
  const HW2 = { ...HW, d: 12500, el: 22, az: -37 };
  shot(tRel, card2 + 0.08 - tRel, HW2, "sine.inOut", HW.d); //  a slow pull-back that rises, through the mid-roll's silence
  st(tRel + 0.05, card2 - 0.05 - tRel, { evac: 0.45 }, "none");
  now(A("relance1:secondes#2"), { chronoOn: 1, chrono: -90 });
  now(card2 - 0.07, { chronoOn: 0 });
  now(card2, { step: 2 });
  threadCall(D.tl, { from: card2 + 0.2, to: card2 + 2.5, text: "90 secondes : d'où viennent-elles ?" });
  shot(card2 + 0.08, tDoc - 0.05 - (card2 + 0.08), { ...HW2, d: 16000, el: 42, az: -33 }, "sine.inOut", HW2.d); // the whip under the card

  /* ───────── 107,6 → 114,9 · « Des États-Unis. En 1965… en deux minutes, avec la moitié des sorties. » ───────── */
  const DOC = { ...VIEW.doc, ...SHARP };
  const docState = (x) => ({ ...AT.bench, ...benchLight(ITEM.DOC), ...x });
  cut(tDoc, SET.BENCH, DOC, docState({ doc: 1, docIn: 0, hl: 0 }), { fade: 0.2 });
  st(tDoc + 0.05, 0.8, { docIn: 1 }, "power2.out");
  const tDoc2 = F("regle67", -0.14);
  shot(tDoc, tDoc2 - tDoc, { ...DOC, tx: 3, tz: -6, d: 150, az: -4 });
  punch(A("origine:1965"), 0.05);
  now(A("origine:deux"), { chronoOn: 1, chrono: 120 }); //   « deux minutes » : 2 min 00, ink
  st(A("origine:deux"), 0.5, { hl: 0.67 });
  st(A("origine:moitié"), 0.5, { hl: 1 });

  /* ───────── 114,9 → 122,0 · « Deux ans plus tard… Et le chrono descend à 90 secondes. Il n'a plus bougé. » ───────── */
  const DOC2 = { ...DOC, d: 170, az: -20, el: 52 };
  cut(tDoc2, null, DOC2, docState({ doc: 1, docIn: 1, hl: 1 }));
  st(tDoc2 + 0.02, 0.3, { docIn: 0 }, "power2.in"); //        one sheet at a time: 1965 leaves…
  now(tDoc2 + 0.34, { doc: 2, hl: 0 });
  st(tDoc2 + 0.36, 0.8, { docIn: 1 }, "power2.out"); //       …1967 slides in, at the same place
  st(A("regle67:règle"), 0.6, { hl: 0.33 });
  st(A("regle67:chrono"), 1.1, { chrono: 90 }, "power1.inOut"); // « le chrono descend »
  now(A("regle67:secondes"), { chrono: -90 }); //             stopped, veille
  punch(A("regle67:secondes"), 0.05);
  st(A("regle67:bougé") - 0.3, 0.6, { hl: 1 });
  const tEssai = F("essai", -0.1);
  shot(tDoc2, 121.2 - tDoc2, { ...DOC2, tx: 4, d: 140, az: -8 }); // a slow push that turns along the sheet
  shot(121.2, tEssai - 121.2, { ...DOC2, tx: 4, d: 180, el: 62, az: -6 }); // « plus bougé » : the camera lifts off the sheet

  /* ───────── 122,0 → 132,5 · « Pour le prouver, on fait un essai grandeur nature… On éteint tout… la moitié. » ───────── */
  const PS = { ...VIEW.planeSide, ...SHARP, tx: -1400, ty: 470, tz: 300, d: 2800, az: -16, el: 5 };
  cut(tEssai, SET.PISTE, PS, hangar({ lights: 1, pax: 0, shut: 0 }), { fade: 0.2 });
  now(tEssai, { chronoOn: 0 });
  const tTokyo = F("noir:à", -0.12);
  const PS2 = { ...PS, tx: -1000, az: -14 };
  const PS3 = { ...PS, tx: -800, ty: 540, el: 16, az: -12, d: 2900 };
  shot(tEssai, A("lightsoff") - tEssai, PS2); //               a slow travelling along the flank
  shot(A("lightsoff"), tTokyo - A("lightsoff"), PS3); //       a slow tilt up: the right flank through the hull
  st(A("essai:plein"), 1.0, { pax: 1 }); //                    « plein à craquer » : the heads fill the windows
  st(A("lightsoff"), 0.25, { lights: 0 }); //                  « éteint » : emergency lights only
  st(A("half"), 0.5, { shut: 1 }); //                          « la moitié » : the right doors condemned

  /* ───────── 132,5 → 135,0 · « À Tokyo, ce soir-là, tu n'en auras même pas autant. » ───────── */
  cut(tTokyo, SET.PISTE, PS3, { ...AT.haneda, fire: 1, shut: 1 });
  const tPax = F("passagers", -0.12);
  shot(tTokyo, tPax - tTokyo, { ...PS3, tx: -650, el: 18 });

  /* ───────── 135,0 → 140,8 · « Et les passagers ressemblent aux vrais… Des gens comme toi. » ───────── */
  // the trial's cabin in section (the forward bulkhead removed), seen from the front: the volunteers face us; a slow
  // sideways travel (< 40 cm/s), far from every head, that ends on you
  const TR1 = { ...P, ...SHARP, tx: 600, ty: 95, tz: -40, d: 1000, az: -90, el: 2, fov: 34 };
  const TR2 = { ...P, ...SHARP, tx: 786, ty: 100, tz: 150, d: 880, az: -88, el: 3, fov: 34 };
  cut(tPax, SET.CABINE, TR1, trial({ cut: 1 }), { fade: 0.2 });
  const tDoll = F("poupees", -0.12);
  shot(tPax, tDoll - tPax, TR2);
  st(A("passagers:gens") - 0.2, 0.5, { you: 1 }); //           « Des gens comme toi » : you, in your seat
  fact(D.tl, { id: "c2-femmes", k: "Au moins", v: "40 %", s: "DE FEMMES", from: A("passagers:moins") - 0.1, to: A("passagers:plus") });
  fact(D.tl, { id: "c2-ages", k: "Plus d'un tiers", v: "+ DE 50 ANS", from: A("passagers:plus") + 0.05, to: A("passagers:gens") + 0.45 });

  /* ───────── 140,8 → 143,4 · « Dans leurs bras, trois poupées… qui jouent les bébés. » ───────── */
  const DOLL = { ...VIEW.doll, ...CLOSE, d: 150, fov: 26 };
  cut(tDoll, null, DOLL, trial({ you: 1 }));
  const tObs = F("obstacles", -0.1);
  shot(tDoll, tObs - tDoll, { ...DOLL, d: 132, az: -56 });
  st(A("dolls") - 0.1, 0.5, { dolls: 1 });

  /* ───────── 143,4 → 148,6 · « Et dans les allées, on pose des sacs, des couvertures, des oreillers. Exprès : ce sont des obstacles. » ───────── */
  // the camera stays AFT of the obstacles it films (x ≈ 955 → 930, between the row-7 blanket and the row-9 bag): a pillow
  // that fell 40 cm in front of the lens made a one-frame flash at 146,23 in the draft
  const LOW = { ...P, ...CLOSE, tx: 300, ty: 10, tz: 123, d: 660, az: 90, el: 2, fov: 30 };
  cut(tObs, null, LOW, trial({ you: 1, dolls: 1, floor: 1 }));
  const tPil = F("pilotes", -0.12);
  shot(tObs, A("obstacles:exprès") - 0.1 - tObs, { ...LOW, d: 655 });
  shot(A("obstacles:exprès") - 0.1, tPil - (A("obstacles:exprès") - 0.1), { ...LOW, ty: 8, d: 630 }); // « Exprès » : a slow push along the obstacles
  st(A("aisle"), 0.35, { obstacles: 0.33 });
  st(A("obstacles:couvertures"), 0.35, { obstacles: 0.66 });
  st(A("obstacles:oreillers"), 0.35, { obstacles: 1 });
  punch(A("obstacles:obstacles"), 0.05, { hold: 0.12, down: 0.35 });

  /* ───────── 148,6 → 153,1 · « Même les pilotes n'ont pas le droit d'aider. Aucun volontaire n'a fait d'essai semblable depuis six mois. » ───────── */
  const COCK = { ...VIEW.cockpit, ...CLOSE, d: 500 };
  cut(tPil, SET.PISTE, COCK, hangar({ pilots: 1 }), { fade: 0.2 });
  const tBelt = F("top:ceintures", -0.12);
  shot(tPil, A("pilotes$") + 0.05 - tPil, { ...COCK, d: 460, az: -47 });
  shot(A("pilotes$") + 0.05, tBelt - (A("pilotes$") + 0.05), { ...P, ...SHARP, tx: -2700, ty: 560, tz: 120, d: 1800, az: -36, el: 7 }, "sine.inOut", 460); // a pull-back along the flank

  /* ───────── 153,1 → 154,4 · « Ceintures bouclées. » ───────── */
  const BELT = { ...VIEW.doorIn, ...CLOSE, d: 420, az: 146 }; // the door 1L, closed and armed, in the dark trial cabin: the next cut opens it from outside
  cut(tBelt, SET.CABINE, BELT, trial({ you: 1, arm: 1, floor: 1 }), { fade: 0.2 });
  const tGo = F("go", -0.12);
  shot(tBelt, tGo - tBelt, { ...BELT, d: 380, az: 150 });

  /* ───────── 154,4 → 161,59 · « Le chrono part… les pieds au sol. Et ces volontaires, dans le noir… pas tous indemnes. » ───────── */
  const LOWSIDE = { ...P, ...SHARP, tx: -2000, ty: 380, tz: 800, d: 4200, az: -6, el: 6 };
  cut(tGo, SET.PISTE, LOWSIDE, hangar({ doorA: 0, evac: 0, pax: 1 }), { fade: 0.2 });
  now(A("go"), { chronoOn: 1, chrono: 0 }); //                 « chrono » : it runs, in real time
  st(A("go"), 3.5, { chrono: 3.5 }, "none");
  now(A("go") + 3.5, { chronoOn: 0 });
  st(A("go") + 0.02, 1.4, { doorA: 1 }); //                    the four left doors open, the slides burst out
  st(A("go") + 1.0, 161.2 - (A("go") + 1.0), { evac: 0.16 }, "none"); // the figures slide (slowly: the foot must read)
  const FOOT = { ...VIEW.slideFoot, ...CLOSE };
  const tFootA = onFrame(A(HAND.c23.at)) - HAND.c23.opt.before;
  shot(tGo, 157.6 - tGo, { ...FOOT, az: 8, d: 1100 }, "sine.inOut", LOWSIDE.d); // down to the foot of slide 1L (a small turn: no jolt)
  shot(157.6, tFootA - 157.6, HAND.c23.from[0]); //             then the slow pull-back the seam carries on
  st(A("indemnes:indemnes") - 0.06, 0.5, { hurt: 1 }); //       « indemnes » : a seated figure turns signal
  seam(D, "c23", "out");
}
