// c4 · « Le feu sur le pont : le Forrestal, 1967 », « De nuit » jusqu'à « tout est noir » — HAND.c34 (320,95)
// → HAND.c45 (414,15). The plan, phrase by phrase: docs/L04-actes.md, « c4 » ; journal docs/journal/L04-c4.md.
// 1967 is told on a TABLE, with nobody on it: the fire has a place (site after site), the tone is grave and sober.
// THE RHYTHM (qa, after the first draft): a new view every 3 to 8 s — a cut on the phrase, each with its join (the
// object, the shape, the movement through D.match) — and never 4 s without a visible move.
// Every instant is read off the script (D.at). The seam gives the COMPLETE state; an inner cut gives what changes, and
// never a number that a running tween carries (run 397,9 → 414,15 is ONE linear tween).
import { SET, AT, HAND, VIEW, CLOSE, SHARP, seam, onFrame, cardAt, cockpitPose, approachRun } from "./world.js";
import { onAngled, TOUCH, LIFTS, PARK } from "./plan.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const DEG = Math.PI / 180;
const T0 = onAngled(TOUCH.s); //                 the touchdown point (run 0 of track 3)
const A6 = onAngled(6000); //                    Andromède, mid-runway
const AM = onAngled(9750); //                    the middle of the angled deck: the runway and the oblique catapult
const LIFT = [(LIFTS[0].x[0] + LIFTS[0].x[1]) / 2, 0, (LIFTS[0].z[0] + LIFTS[0].z[1]) / 2]; // the forward lift
const PK = PARK[1]; //                           the middle one of the three aircraft parked aft: [x, z, yaw]
const TAIL = [PK[0] - 350, 150, PK[1] + 200]; // between its centre and its nozzles (its nose points starboard-forward)
const SHIP_C = [-625, 0, 0]; //                  the deck's middle seen from above (its outline spans x −3550 … 2300)
const TABLE = [-5, 24, 0]; //                    the Forrestal's table: its middle, on its top
const SHIP_TABLE = 26150 / 320; //               the Charles de Gaulle's deck over the Forrestal's table: the shape match

/** A pose from where the camera STANDS: `eye`, looking along az / el, `d` to the aim. */
const fromEye = (eye, az, el, d, extra = {}) => {
  const ce = Math.cos(el * DEG);
  return { ...P, tx: eye[0] - d * Math.sin(az * DEG) * ce, ty: eye[1] - d * Math.sin(el * DEG), tz: eye[2] - d * Math.cos(az * DEG) * ce, d, az, el, ...extra };
};
const at3 = (p) => ({ tx: p[0], ty: p[1], tz: p[2] });

export default function ({ D }) {
  const { at, st, now, shot, cut, match, punch } = D;
  const A = (ref) => at(ref);
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  /** A shot from `a` to `b` (seconds), never of zero length. */
  const move = (a, b, pose, ease = "sine.inOut", fromD = null) => shot(a, Math.max(0.1, b - a), pose, ease, fromD);

  /* ═════════ couture 320,95 · 321,9 → 328,1 · « Mais avant la nuit, une menace… ni de la mer… ni du ciel. Elle est déjà à bord : le feu. » ═════════ */
  const t34 = A(HAND.c34.at);
  seam(D, "c34", "in", {
    set: SET.PONT,
    state: {
      ...AT.deck, etape: 6, kmhOn: 0, kmh: 0, night: 0.45, jet: 0, dog: 0, parked: 1, running: 0, crew: 0.6, swell: 0.3,
      fx: PK[0], fy: 150, fz: PK[1], fs: 2500,
    },
  });
  const t1 = t34 + HAND.c34.opt.after; //                     322,15: the travel over the deck is over
  // « ni de la mer » : the gaze swings out over the starboard sea (the escorts on the dusk horizon) — « ni du ciel » : up
  const SEA = fromEye([-1150, 1100, 14300], -55, 3, 6000, SHARP);
  const tSea = A("r2menace:mer");
  move(t1, tSea, SEA);
  const SKY = fromEye([-1050, 1080, 14000], -50, -5, 6000, SHARP);
  const tBord = F("r2menace:déjà", -0.1); //                   326,4
  move(tSea, tBord, SKY);
  // « déjà à bord » : CUT, on the aircraft parked aft, low behind their nozzles — « le feu » : their engines light
  const NOZ = { ...P, ...CLOSE, ...at3(TAIL), d: 2600, az: -60, el: 7 };
  cut(tBord, null, NOZ, { fx: TAIL[0], fy: 150, fz: TAIL[2], fs: 1500 });
  const NOZ2 = { ...NOZ, d: 2250, az: -54, el: 8 };
  const tSoutes = F("r2soutes", -0.02); //                     328,73
  move(tBord, tSoutes - 0.6, NOZ2);
  st(A("r2menace:feu"), 0.6, { running: 1 }, "power2.out");
  punch(A("r2menace:feu"), 0.05);

  /* ═════════ 328,75 → 332,3 · « Dans ses soutes, plus de 3 000 tonnes de carburant pour ses avions. » ═════════ */
  // matched on the movement: the pull-back from the nozzles goes on, high over the ship — the gaze through the glass deck
  // down to the holds, lit signal (dosed)
  const FH = { ...VIEW.fuelHolds, ...SHARP, d: 18000 };
  const pFH = match(tSoutes, [NOZ2, { ...NOZ2, d: 2700, el: 10 }], FH, {
    state: { ship: 0.6, fx: 0, fy: -1500, fz: -1000, fs: 12000 },
    before: 0.6,
    after: 0.9,
  });
  st(A("fuelholds"), 0.8, { fuel: 0.7 });
  const tRow = F("r2soutes:et", 0.1); //                       332,2
  fact(D.tl, { id: "c4-carbu", k: "Dans ses soutes", v: "+ DE 3 000 TONNES", s: "de carburant", tone: "signal", from: A("r2soutes:plus") + 0.32, to: tRow - 0.02 });
  move(tSoutes + 0.9, tRow, { ...pFH, d: pFH.d * 1.12, az: pFH.az + 6 });

  /* ═════════ 332,2 → 335,7 · « Et sur le pont, des moteurs allumés à quelques mètres les uns des autres. » ═════════ */
  // CUT to deck level, along the row of parked aircraft, their cores signal, the dusk horizon behind (a slow glide)
  const ROW1 = fromEye([-1850, 420, 12300], -40, 5, 3500, SHARP);
  cut(tRow, null, ROW1, { ship: 1, fuel: 0, fx: PK[0], fy: 150, fz: PK[1], fs: 2500 });
  const ROW2 = fromEye([-1980, 400, 10900], -49, 5, 3300, SHARP);
  const tFuir = F("r2fuir", -0.02); //                         335,7
  move(tRow, tFuir - 0.6, ROW2);

  /* ═════════ 335,71 → 339,6 · « Et en pleine mer, impossible de fuir un incendie : il faut le combattre. » ═════════ */
  // matched on the movement: the glide becomes a pull-back, to the ship alone on the dusk sea; « combattre » : up over it
  const FAR = { ...P, ...SHARP, ...at3(SHIP_C), d: 45000, az: -30, el: 10 };
  const pFar = match(tFuir, [ROW2, { ...ROW2, d: 4300, el: 7 }], FAR, {
    state: { fx: SHIP_C[0], fy: 0, fz: SHIP_C[2], fs: 15000 },
    before: 0.6,
    after: 0.9,
  });
  const SHIPTOP = { ...P, ...SHARP, ...at3(SHIP_C), d: 87000, az: 0, el: 85 };
  const tTable = F("r2date", -0.1); //                         339,6
  move(tFuir + 0.9, tTable, SHIPTOP, "sine.inOut", pFar.d);

  /* ═════════ 339,71 → 345,32 · « Le 29 juillet 1967, sur un porte-avions américain, le Forrestal, des avions attendent leur départ. » ═════════ */
  // the shape match: the ship seen from above → the Forrestal's table seen from above, its outline at the same place
  const TOP = { ...P, ...SHARP, ...at3(TABLE), d: SHIPTOP.d / SHIP_TABLE, az: 0, el: 85 };
  cut(tTable, SET.BENCH, TOP, { ...AT.bench, etape: 6, kmhOn: 0, kmh: 0, item: 3, mood: 1, hot: 0.1, tokens: 0, rocket: 0, fire: 0, burnt: 0, fx: TABLE[0], fy: TABLE[1], fz: 40, fs: 260, pool: 0.3 }, { fade: 0.25 });
  const tForr = F("forrestal", -0.17); //                      343,0
  move(tTable, tForr, { ...TOP, d: TOP.d * 0.84, az: -22, el: 80 });
  fact(D.tl, { id: "c4-1967", k: "29 juillet 1967", v: "USS FORRESTAL", s: "porte-avions américain", from: A("y1967") - 0.28, to: A("forrestal") - 0.3 });
  // « Forrestal » : CUT on the table, from low aft-port — « des avions attendent » : they are set aft, one by one
  const FORR = { ...VIEW.forrestal, ...SHARP, tz: 60, d: 520, az: -28, el: 34 };
  cut(tForr, null, FORR, { fx: 0, fy: 26, fz: 90, fs: 200 });
  const tRock = F("r2roquette", -0.06); //                     345,65
  move(tForr, tRock, { ...FORR, d: 470, az: -40, el: 30 });
  st(A("r2date:avions") - 0.1, 1.4, { tokens: 1 }, "sine.inOut");

  /* ═════════ 345,71 → 353,4 · « Dans l'un d'eux, une surtension électrique. Et une roquette part… toute seule. Elle frappe un autre avion… » ═════════ */
  // CUT close on two of them: the F-4 to starboard (its rocket), the A-4 across the deck
  const ROCK = { ...P, ...CLOSE, tx: 3, ty: 26, tz: 116, d: 280, az: 22, el: 40 }; // from starboard-aft, behind the F-4
  cut(tRock, null, ROCK, { fx: 3, fy: 26, fz: 116, fs: 120 });
  st(A("surge"), 0.5, { rocket: 0.05 }, "power2.out"); //            « surtension » : a spark on it
  const tHit = A("r2feu:frappe");
  st(A("r2rocket"), tHit - A("r2rocket"), { rocket: 1 }, "power1.in"); // « roquette part… toute seule » : the head flies across
  const ROCK2 = { ...ROCK, d: 245, az: 8, el: 34 };
  move(tRock, tHit + 0.2, ROCK2);
  punch(tHit, 0.05); //                                              « frappe » : the impact, a light that has a place
  st(tHit + 0.3, 2.4, { fire: 0.12 }, "sine.out"); //               the A-4 struck burns first
  const tFire = F("r2fire", -0.1); //                                353,45
  move(tHit + 0.2, tFire, { ...ROCK2, d: 232, az: -4, el: 30 });

  /* ═════════ 353,45 → 357,6 · « Et le pont prend feu. Beaucoup de ceux qui se jettent dans le combat… n'ont jamais été formés au feu. » ═════════ */
  // CUT low from port: the fire spreads site after site across the frame; the camera sinks to the table's level — sober
  const FIREW = { ...P, ...CLOSE, tx: -6, ty: 27, tz: 118, d: 300, az: -84, el: 17 };
  cut(tFire, null, FIREW, { fx: -6, fy: 26, fz: 118, fs: 170 });
  st(A("r2fire") - 0.05, 3.0, { fire: 1 }, "sine.inOut"); //         « le pont prend feu »
  const tBilan = F("r2bilan", -0.07); //                             357,65
  move(tFire, tBilan, { ...FIREW, d: 340, az: -96, el: 8 });

  /* ═════════ 357,72 → 361,1 · « 134 morts. 21 avions détruits. » ═════════ */
  // CUT high over the whole table: the burnt aircraft go dark, the fire sinks; a slow rise — nothing else
  const HIGHB = { ...P, ...SHARP, ...at3(TABLE), d: 800, az: -40, el: 60 };
  cut(tBilan, null, HIGHB, { fx: TABLE[0], fy: TABLE[1], fz: 40, fs: 260 });
  st(A("r2bilan"), 2.6, { burnt: 1, fire: 0.2 }, "sine.inOut");
  fact(D.tl, { id: "c4-bilan", k: "USS Forrestal", v: "134 MORTS", s: "21 avions détruits", from: A("r2bilan"), to: A("r2bilan$") + 0.45 });
  const BEND = { ...P, ...SHARP, ...at3(TABLE), d: 880, az: -50, el: 52 };
  const tDeck = F("r2depuis", -0.08); //                             361,1
  move(tBilan, tDeck, BEND);

  /* ═════════ 361,18 → 368,38 · « Depuis, chaque marin apprend à combattre le feu. Et un avion ne reste plus longtemps sur le pont… plein et armé. » ═════════ */
  // the shape match back: the Forrestal's outline from above → the Charles de Gaulle's, at dusk, at the same place
  const DECK0 = { ...P, ...SHARP, ...at3(SHIP_C), d: BEND.d * SHIP_TABLE, az: -50, el: 52 };
  cut(tDeck, SET.PONT, DECK0, {
    ...AT.deck, etape: 6, kmhOn: 0, kmh: 0, night: 0.45, jet: 0, dog: 0, parked: 1, running: 0, crew: 0.6, swell: 0.3, fleet: 1, lift: 0,
    fx: LIFT[0], fy: 0, fz: LIFT[2], fs: 4000,
  }, { fade: 0.2 });
  st(A("r2depuis:chaque") + 0.3, 0.8, { crew: 1 }); //               « chaque marin apprend » : the people of the deck
  const tLift = F("r2depuis:et", -0.25); //                          364,93
  move(tDeck, tLift, { ...DECK0, ...at3(LIFT), d: 24000, az: -38, el: 42 }, "sine.inOut", DECK0.d); // down toward the forward lift
  // « Et un avion ne reste plus longtemps sur le pont » : CUT closer on the lift, the hangar lit below — it goes down
  const LIFTC = { ...P, ...SHARP, ...at3(LIFT), ty: -250, d: 4200, az: -22, el: 30 };
  cut(tLift, null, LIFTC, { hangar: 1, fx: LIFT[0], fy: -300, fz: LIFT[2], fs: 3000 });
  st(A("r2depuis:avion"), A("r2depuis:armé") + 0.1 - A("r2depuis:avion"), { lift: 1 }, "sine.inOut");
  const tHang = F("r2cdg", -0.06); //                                368,4
  move(tLift, tHang, { ...LIFTC, ty: -550, d: 3900, az: -30, el: 24 });

  /* ═════════ 368,46 → 375,95 · « Et sur le Charles de Gaulle ? Une centaine de marins-pompiers. Près de mille détecteurs… une cloison… » ═════════ */
  // CUT into the hangar through the hull's glass, from port (the lift has landed)
  const HANG = { ...VIEW.hangar, ...SHARP, el: 11 };
  cut(tHang, null, HANG, { ship: 0.7, fx: 0, fy: -380, fz: 600, fs: 6000 });
  fact(D.tl, { id: "c4-pompiers", k: "Charles de Gaulle", v: "≈ 100 MARINS-POMPIERS", from: A("r2cdg:centaine"), to: A("detect") - 0.25 });
  const tDet = F("detect", -0.17); //                                371,65
  move(tHang, tDet, { ...HANG, d: 4700, az: -64, el: 10 });
  // « mille détecteurs » : CUT closer, into the forward half — they light in a slow wave, bow to stern
  const DET = { ...P, ...SHARP, tx: 0, ty: -380, tz: -2500, d: 3300, az: -70, el: 14 };
  cut(tDet, null, DET, { fx: 0, fy: -380, fz: -2500, fs: 5000 });
  st(A("detect"), 1.8, { detectors: 1 }, "sine.inOut");
  fact(D.tl, { id: "c4-detect", k: "Charles de Gaulle", v: "≈ 1 000 DÉTECTEURS", s: "d'incendie", tone: "veille", from: A("detect") - 0.1, to: A("r2cdg:hangar") + 0.15 });
  const tCurt = F("curtain", -0.05); //                              374,25
  move(tDet, tCurt, { ...DET, d: 3000, az: -78, el: 12 });
  // « une cloison » : CUT on the curtain, face on from aft-port — it comes down and cuts the hangar in two
  const CURT = { ...P, ...SHARP, tx: 0, ty: -380, tz: 600, d: 4200, az: -36, el: 9 };
  cut(tCurt, null, CURT, { fx: 0, fy: -380, fz: 600, fs: 4000 });
  st(A("curtain"), 1.2, { curtain: 1 }, "sine.inOut");
  const tOut = F("r2nuit", -0.03); //                                375,95
  move(tCurt, tOut, { ...CURT, d: 3800, az: -42, el: 10 });

  /* ═════════ 375,98 → 381,24 · « Ce soir, c'est sur ce pont-là, au milieu de tout ça, que tu vas devoir te poser. De nuit. » — midroll after ═════════ */
  // CUT outside, the whole ship from aft-port, then a long pull-back as night falls; « De nuit » : the deck lights up
  const OUTP = { ...P, ...SHARP, tx: 0, ty: -400, tz: 0, d: 13000, az: -52, el: 12 };
  cut(tOut, null, OUTP, { fx: 0, fy: -400, fz: 0, fs: 15000 });
  const SHIPN = { ...VIEW.shipWide, ...SHARP };
  const tDusk = A("dusk") - 0.05; //                                   380,33
  move(tOut, tDusk, SHIPN, "sine.inOut", OUTP.d);
  st(tOut, 4.4, { night: 1 }, "sine.inOut");
  st(tOut, 1.8, { detectors: 0 });
  st(tOut + 0.6, 2.0, { ship: 1 });
  st(tOut + 0.8, 2.0, { hangar: 0 });
  st(tOut + 1.0, 3.0, { hot: 0.05, swell: 0.2, parked: 0.6 });
  st(tOut + 2.0, 2.6, { lift: 0 });
  st(tOut + 2.5, 1.5, { curtain: 0 }); //                               raised once the ship is small
  st(tOut + 3.0, 2.0, { fleet: 0 });
  st(A("dusk"), 0.6, { lights: 1 }, "power2.out");
  const tCard = onFrame(cardAt(D, "tombee")); //                         381,24
  move(tDusk, tCard, { ...SHIPN, d: 32500, az: -38, el: 17 }); //          the midroll: a slow glide that goes on

  /* ═════════ carte 381,24 · 382,14 → 387,98 · « La nuit est tombée. Les chiens jaunes ont dégagé la piste. Plus aucun avion ne part. » ═════════ */
  now(tCard, { etape: 7 });
  threadCall(D.tl, { from: tCard, to: tCard + 2.5, text: "Pourquoi « chien » ? Ce soir." });
  // under the card, CUT down to the angled runway at night, from aft-port, and a quick push along it
  const RW = { ...VIEW.runway, ...SHARP };
  cut(tCard, null, RW, { fx: A6[0], fy: 0, fz: A6[2], fs: 5000 });
  const tWires = F("cleared", -0.02); //                                384,95
  move(tCard, tWires, { ...RW, d: 4400, az: -12, el: 6.5 });
  st(tCard + 0.4, 1.2, { wires: 0.6 }); //                               the three wires across the runway
  // « ont dégagé la piste » : CUT on the wires, the runway empty — the people of glass leave it
  const WIRES = { ...VIEW.wires, ...SHARP };
  cut(tWires, null, WIRES, {});
  st(A("cleared"), 0.9, { crew: 0 });
  const tTop = F("simultane", -0.03); //                                388,0
  move(tWires, tTop, { ...WIRES, d: 2300, az: -50, el: 15 });

  /* ═════════ 388,03 → 395,3 · « On ne peut pas lancer et rattraper en même temps : l'une des deux catapultes est posée… sur la piste où tu vas te poser. » ═════════ */
  // « Sur ce navire… » : CUT on YOUR aircraft, out in the night on the approach (ride 1), the ship's lights far below ahead
  // — from now on it flies ONE linear law to the seam (approachRun)
  now(tTop - 0.1, { jet: 1, track: 3, run: approachRun(D, tTop), alt: 0, hook: 1, gas: 0.8, tremble: 0, you: 1, hud: 0 });
  st(tTop, A(HAND.c45.at) - tTop, { run: approachRun(D, A(HAND.c45.at)) }, "none");
  const JETV = { ...P, ...SHARP, tx: T0[0], ty: 250, tz: T0[2], d: 3600, az: 25, el: 9, shift: -60 };
  cut(tTop, null, JETV, { ride: 1, fx: T0[0], fy: 200, fz: T0[2], fs: 2500 });
  const tCat = F("cat2", -0.17); //                                      391,5
  move(tTop, tCat, { ...JETV, d: 3200, az: 14, el: 8 });
  // « catapultes » : CUT high over the angled deck (the runway across the frame), a steady orbit: the oblique catapult, then the runway
  const TOPANG = { ...P, ...SHARP, ...at3(AM), d: 30000, az: -92, el: 69 };
  cut(tCat, null, TOPANG, { ride: 0, fx: AM[0], fy: 0, fz: AM[2], fs: 12000 });
  now(A("cat2"), { named: 9 }); //                                       « catapultes » : the oblique one lights
  st(A("simultane:piste"), 0.8, { angled: 1 }, "power2.out"); //          « sur la piste » : the runway lights around it
  const tAxis = F("angled", -0.05); //                                   395,3
  move(tCat, tAxis, { ...TOPANG, d: 24000, az: -70, el: 74 }, "sine.inOut", TOPANG.d);

  /* ═════════ 395,3 → 403,3 · « Une piste en biais d'à peine deux cents mètres. Le vent dans l'axe… le moins vite possible par rapport à lui. » ═════════ */
  // « en biais » : CUT in the runway's axis, from aft and high (the line turned upright: the shape)
  const AXIS = { ...P, ...SHARP, ...at3(A6), d: 22000, az: 8.5, el: 25 };
  cut(tAxis, null, AXIS, { fx: T0[0], fy: 0, fz: T0[2], fs: 8000 });
  fact(D.tl, { id: "c4-200", k: "Piste en biais", v: "≈ 200 MÈTRES", from: A("biais:deux"), to: A("biais:vent") - 0.3 });
  now(A("biais:navire"), { named: 0 });
  const tLow = F("windaxis", -0.13); //                                  398,4
  move(tAxis, tLow, { ...AXIS, d: 16500, el: 20 });
  // « vent dans l'axe » : CUT low behind the stern, along the runway: the streaks turn into its axis; a pull-back begins
  const LOWAX = { ...P, ...SHARP, ...at3(onAngled(4500)), d: 4500, az: 8.5, el: 5 };
  cut(tLow, null, LOWAX, {});
  st(A("windaxis"), 1.5, { windAxis: 1, wind: 1 }, "sine.inOut");
  const tMatch = onFrame(A("cadence") - 0.17); //                        403,3
  const LOWA = { ...LOWAX, d: 6200, az: 6, el: 12 }; //                    rising: the lit runway fills the frame
  move(tLow, tMatch - 0.8, LOWA);

  /* ═════════ 403,47 → 408,4 · « De jour, on rattrape un avion par minute. De nuit… un toutes les deux minutes. » ═════════ */
  // matched on the movement: the pull-back along the axis → behind your aircraft on the approach (ride 1), the ship small
  // and bright ahead of its nose; the camera swings round it
  const APP = { ...P, ...SHARP, tx: T0[0], ty: 300, tz: T0[2], d: 4600, az: 8.5, el: 7, shift: -100 };
  const pA = match(tMatch, [LOWA, { ...LOWA, d: 6800, el: 12.5 }], APP, {
    state: { ride: 1, fx: T0[0], fy: 200, fz: T0[2], fs: 2500 },
    before: 0.8,
    after: 0.9,
  });
  st(A("cadence"), 1.2, { angled: 0.4 });
  fact(D.tl, { id: "c4-jour", k: "De jour", v: "1 AVION / MINUTE", tone: "veille", from: A("cadence:jour"), to: A("cadence:nuit") - 0.3 });
  const tSide = F("cadence:nuit", -0.2); //                              406,0
  move(tMatch + 0.9, tSide, { ...pA, d: pA.d * 0.8, az: 22, el: 8.5 });
  // « De nuit… » : CUT on your aircraft, three-quarter rear from starboard, the ship's lights at the edge of the frame
  const SIDE = { ...P, ...SHARP, tx: T0[0], ty: 200, tz: T0[2], d: 3200, az: 32, el: 6, side: 220 };
  cut(tSide, null, SIDE, {});
  fact(D.tl, { id: "c4-nuit", k: "De nuit", v: "1 AVION / 2 MINUTES", tone: "veille", from: A("cadence:nuit") - 0.05, to: A("cadence$") });
  const tCock = F("viseur", -0.12); //                                   408,4
  move(tSide, tCock, { ...SIDE, d: 2900, az: 20, el: 7 });

  /* ═════════ 408,53 → 413,90 · « Dans ton viseur tête haute, tes informations de vol s'affichent… Mais dehors… tout est noir. » ═════════ */
  // the lights of your aircraft → the head-up display, from behind your helmet (ride 1 goes on)
  const COCK = cockpitPose(3, { pitch: 5, el: 3.5 });
  cut(tCock, null, { ...COCK, d: 665, az: COCK.az + 3, el: 4.5 }, { fx: T0[0], fy: 300, fz: T0[2], fs: 1500 });
  st(A("hud"), 0.5, { hud: 1 }, "power2.out"); //                         « viseur » : the symbols light veille
  st(tCock + 0.6, 3.0, { windAxis: 0, wind: 0.4 }); //                     (1,4 km away: unseen) the seam's state
  st(A("viseur:yeux"), A("black") - A("viseur:yeux"), { angled: 0 }, "sine.inOut"); // « tout est noir » : the runway's paint goes out
  const t45 = A(HAND.c45.at);
  move(tCock, t45 - HAND.c45.opt.before, HAND.c45.from[0]); //            on the seam's first pose at 412,95
  seam(D, "c45", "out"); //                                                 « Mais dehors… » : the push into the black
}
