// c4 · « Le balisage lumineux au sol », « Ton siège : 16 g » — HAND.c34 (272,06) → HAND.c45 (361,82).
// docs/L03-actes.md, c4 ; journal docs/journal/L03-c4.md.
// Every instant is read off the script (D.at). Every cut gives a COMPLETE state (AT.* + what differs), and no number is
// moved by two tweens at once: each tween ends before the next one on the same number, and before any cut that resets it.
// In the smoke the camera stays BELOW the smoke's lowest volutes (cabine.js: bottom = 250 − 130·min(smoke, 1) − 120·(smoke − 1),
// volutes ≈ 44 cm under it): the camera's height is written next to each cabin pose.
import { SET, AT, HAND, VIEW, CLOSE, SHARP, benchLight, seam, onFrame, cardAt, runAt } from "./world.js";
import { ITEM, APPROACH, PLANES } from "./plan.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const D1 = PLANES.a350.doors[0][1]; // door 1 (x)
export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const A = (ref) => at(ref);
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame

  /* complete states, one per place */
  const tok = (x = {}) => ({ ...AT.tokyo, ...x }); //                                  the Tokyo cabin, at night
  const cab = (x = {}) => ({ ...AT.cabin, crew: 0, ...x }); //                          the cabin at rest, lit
  const bench = (item, x = {}) => ({ ...AT.bench, ...benchLight(item), ...x }); //      one item on the bench
  const apron = (x = {}) => ({ ...AT.apron, ...x }); //                                 the apron at night (site 3)

  /* ───────── 272,06 → 275,4 · « En 1984, dix mois avant Manchester, … » ───────── */
  // the tilt from the ceiling goes on DOWN, under the smoke, toward the floor (the card covers the left half)
  const t34 = onFrame(A(HAND.c34.at));
  seam(D, "c34", "in", { set: SET.CABINE, state: tok({ smoke: 0.9, signs: 0.3, floor: 0 }) });
  now(t34, { step: 4, chronoOn: 0 });
  threadCall(D.tl, { from: t34 + 0.2, to: t34 + 2.5, text: "Dans la fumée, ta porte ?" });
  const tDoc = F("lum1:manchester", -0.15);
  // the seam leaves the camera at (1299, 112, 123), aim (520, 58, 123), el 4, at rest: the tilt goes on the SAME way, slowly and
  // a little (el 4 → 6, the camera 40 cm forward, 8 cm down): qa measured the bigger move here as the film's roughest
  const DOWN = { ...P, ...SHARP, tx: 500, ty: 25, tz: 123, d: 760, az: 90, el: 6, fov: 34 }; // camera ≈ 104 cm
  shot(t34 + HAND.c34.opt.after, tDoc - (t34 + HAND.c34.opt.after), DOWN);

  /* ───────── 275,4 → 279,7 · « …les États-Unis imposent une idée simple : mettre la lumière en bas. » ───────── */
  const DOC = { ...VIEW.doc, ...SHARP };
  cut(tDoc, SET.BENCH, DOC, bench(ITEM.DOC, { doc: 6, docIn: 0, hl: 0 }), { fade: 0.2 });
  st(tDoc + 0.05, 0.8, { docIn: 1 }, "power2.out"); //            the 1984 sheet slides in and lies down
  st(A("lum1:idée"), 0.5, { hl: 0.5 }); //                        « une idée simple »
  st(A("lum1:lumière"), 0.6, { hl: 1 }); //                       « mettre la lumière en bas »
  const tLine = F("floor", -0.12);
  shot(tDoc, tLine - tDoc, { ...DOC, tx: 2, tz: -4, d: 138, az: -3, el: 58 });

  /* ───────── 279,7 → 287,5 · « …en bas. Après l'accident… Une ligne de lumière au ras du plancher… jusqu'aux sorties. » ───────── */
  // at the floor of the aisle, looking forward to door 1L: « bas » lights the line; then a SLOW travelling along it
  const LOW = { ...VIEW.aisleLow, ...CLOSE }; //                    camera ≈ 31 cm (smoke 1.2: volutes ≥ 52)
  cut(tLine, SET.CABINE, LOW, tok({ smoke: 1.2, floor: 0, signs: 0.2 }), { fade: 0.2 });
  st(A("floor"), 1.4, { floor: 1 }, "power1.out"); //               « bas » : the line lights, from us to the door
  const tExit = F("lum2:sorties", -0.15);
  shot(tLine, tExit - tLine, { ...LOW, tx: LOW.tx - 230 }, "none"); // 230 cm in 7.7 s: 30 cm/s, constant (rows are a lattice)

  /* ───────── 287,5 → 291,6 · « Pas pour faire joli : pour le moment où tu ne verras plus rien d'autre. » ───────── */
  // the line turns into the door; the smoke comes down to the floor and only the line is left
  const EXIT = { ...VIEW.exit, ...CLOSE, ty: 40, el: -3 }; //         camera ≈ 24 cm, looking up a little: the smoke comes down (volutes ≥ 40)
  cut(tExit, null, EXIT,tok({ smoke: 0.9, floor: 1, signs: 1 }));
  const tSec = F("lum3", -0.15);
  shot(tExit, tSec - tExit, { ...EXIT, d: 262, az: 116 });
  st(A("lum2:pour#2") - 0.2, A("lum2:d'autre") + 0.3 - (A("lum2:pour#2") - 0.2), { smoke: 1.3, signs: 0.2 }, "sine.inOut");

  /* ───────── 291,6 → 299,2 · « Parce que la fumée remplit la cabine par le haut. Au-dessus d'un mètre vingt… En bas, la ligne reste visible. » ───────── */
  // the cabin in section, the camera at 95 cm: the smoke fills from the top down to the veille line at 1,20 m
  const SEC = { ...VIEW.section, ...SHARP, side: -120 };
  cut(tSec, null, SEC, tok({ cut: 1, smoke: 0.2, floor: 1, signs: 1, emerg: 1 }));
  const tStrip = F("lum4", -0.12);
  shot(tSec, tStrip - tSec, { ...SEC, d: 930, el: 1 });
  st(A("lum3:remplit"), 4.0, { smoke: 1 }, "sine.inOut"); //       « remplit… par le haut »
  punch(A("lum3:mètre"), 0.05); //                                 « un mètre vingt » : the veille line
  st(A("lum3:disparaissent"), 0.8, { signs: 0 }); //                « disparaissent les premières »
  fact(D.tl, { id: "c4-120", k: "Au-dessus de", v: "1,20 MÈTRE", s: "les lumières disparaissent", from: A("lum3:au-dessus") - 0.1, to: A("lum3:visible") - 0.3 });

  /* ───────── 299,2 → 304,8 · « …certaines de ces lignes n'ont même plus besoin d'électricité : elles brillent toutes seules dans le noir. » ───────── */
  const STRIP = { ...VIEW.aisleLow, ...CLOSE, d: 150 }; //           camera ≈ 20 cm
  cut(tStrip, null, STRIP, tok({ smoke: 1.2, floor: 1, signs: 0, fire: 0.25 }));
  const tTokyo = F("lum5", -0.12);
  shot(tStrip, tTokyo - tStrip, { ...STRIP, tx: STRIP.tx - 60, d: 126 }, "none"); // 12 cm/s
  st(A("lum4:d'électricité"), 0.4, { emerg: 0, floor: 0 }); //       everything goes out
  st(A("glow"), 0.8, { glow: 1 }, "power1.out"); //                 « brillent » : the strip shines on its own

  /* ───────── 304,8 → 308,8 · « Et ce soir-là, à Tokyo, la fumée remplit la cabine très vite. » ───────── */
  // from the door looking aft, LOW: the ceiling of smoke comes down over the heads
  const BACK = { ...VIEW.hook4, ...SHARP, ty: 30, el: 1, side: 0 }; // camera ≈ 46 cm (smoke 1.0: volutes ≥ 76)
  cut(tTokyo, null, BACK, tok({ smoke: 0.5, floor: 1, signs: 1, fire: 0.8, crowd: 0.1 }));
  const tSeuil = F("seuil", -0.12);
  shot(tTokyo, tSeuil - tTokyo, { ...BACK, d: 830 });
  st(A("lum5:fumée") - 0.1, 1.6, { smoke: 1.0, signs: 0.3 }, "power1.inOut"); // « très vite »

  /* ───────── 308,8 → 315,18 · « Ce qui se passe dans cette fumée… si tu veux le voir, abonne-toi : on y arrive. » (LE SEUIL) ───────── */
  // the reverse angle, low in the left aisle under the smoke: the camera pushes forward to the open door, among the legs
  const AIS = { ...P, ...SHARP, tx: 200, ty: 70, tz: 123, d: 900, az: 90, el: -1, fov: 36 }; // camera ≈ 54 cm, above the seat pans, under the volutes (≥ 76)
  cut(tSeuil, null, AIS, tok({ smoke: 1.0, floor: 1, signs: 0.3, fire: 0.7, crowd: 0.15, door: 1 }));
  const card5 = cardAt(D, "siege1");
  const tCard = onFrame(card5);
  const W0 = { ...AIS, d: 660 };
  shot(tSeuil, tCard - tSeuil, W0, "none"); //                     240 cm in 6.4 s: 37 cm/s, constant, into the cut
  st(tSeuil + 0.1, tCard - 0.15 - (tSeuil + 0.1), { crowd: 0.3 }, "none"); // they walk to the doors
  D.tl.to(".hud__brand", { color: "#5cffb0", duration: 0.2 }, A("seuil:abonne-toi")); // « abonne-toi » : the account name
  D.tl.to(".hud__brand", { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, A("seuil$"));

  /* ───────── 315,18 → 320,0 · « Mais pour sortir, il faut d'abord pouvoir te lever. Et ça, ça dépend de ton siège. » ───────── */
  // under the card: a clean cut (form: the aisle seat by the aisle → you in it), then a slow push
  now(tCard, { step: 5 });
  const YOU = { ...VIEW.you, ...CLOSE };
  cut(tCard, null, { ...YOU, d: 176, az: 157 }, cab({ you: 1 }));
  const tSeat = F("siege1:ton", -0.12);
  shot(tCard, tSeat - tCard, { ...YOU, d: 158, az: 163 });
  st(A("siege1:lever") - 0.15, 0.5, { you: 1.3 }, "power2.out"); //   « te lever » : you half rise…
  st(A("siege1:lever") + 0.45, 0.6, { you: 1 }, "power2.in"); //      …and fall back

  /* ───────── 320,0 → 326,0 · « Avant, on l'approuvait à neuf g, en appuyant dessus. Sans mesurer… » ───────── */
  const SEAT = { ...VIEW.seat, ...CLOSE, side: -150 };
  cut(tSeat, SET.BENCH, SEAT, bench(ITEM.SEAT, { press: 0 }), { fade: 0.2 });
  const t1988 = F("seizeg", -0.12);
  shot(tSeat, t1988 - tSeat, { ...SEAT, d: 400, az: -30 }); //         a slow orbit
  st(A("neufg:appuyant") - 0.6, 1.2, { press: 1 }); //                 « appuyant » : the plate presses the back
  fact(D.tl, { id: "c4-9g", k: "Avant", v: "9 G", s: "en appuyant dessus", from: A("neufg:neuf") - 0.1, to: t1988 - 0.1 });

  /* ───────── 326,0 → 332,0 · « En 1988, tout nouveau modèle… testés à seize g. Pour de vrai : … » ───────── */
  const SEAT2 = { ...P, ...CLOSE, tx: -10, ty: 100, tz: 30, d: 380, az: -62, el: 3, side: -150 };
  cut(t1988, null, SEAT2, bench(ITEM.SEAT, { press: 1, grid: 0 }));
  const tSled = F("seizeg:lancés", -0.12);
  shot(t1988, tSled - t1988, { ...SEAT2, d: 335, az: -56 });
  st(t1988 + 0.1, 0.8, { press: 0 }); //                               the press goes
  punch(A("seizeg:seize"), 0.05);
  fact(D.tl, { id: "c4-16g", k: "1988", v: "16 G", s: "testés pour de vrai", from: A("seizeg:seize") - 0.1, to: tSled });

  /* ───────── 332,0 → 334,1 · « …lancés, puis arrêtés net… » ───────── */
  // wide on the rails, grid 0: the TRACK runs under the sled (the camera does not travel); the stop is a 0,25-s snap
  const SLED = { ...VIEW.sled, ...SHARP, d: 500 };
  cut(tSled, null, SLED, bench(ITEM.SEAT, { grid: 0, sled: 0 }));
  const tDum = F("seizeg:mannequin", -0.15);
  shot(tSled, tDum - tSled, { ...SLED, d: 480, az: -22 });
  st(A("seizeg:lancés"), A("sled") - A("seizeg:lancés"), { sled: 1 }, "power2.in"); // launched: faster and faster
  st(A("sled"), 0.25, { sled: 2 }, "power1.out"); //                   « arrêtés » : stopped dead
  punch(A("sled"), 0.06);

  /* ───────── 334,1 → 338,0 · « …avec un mannequin attaché dessus. C'est lui qui juge : il mesure ce qu'un passager… » ───────── */
  const DUM = { ...VIEW.dummy, ...CLOSE, ty: 126 };
  cut(tDum, null, DUM, bench(ITEM.SEAT, { grid: 0, sled: 2, fz: 50, fy: 90 }));
  const tReplay = F("mannequin:encaissé", -0.12);
  shot(tDum, tReplay - tDum, { ...DUM, d: 185, az: -46 });
  st(A("mannequin:mesure") - 0.1, 0.6, { sensors: 1 }); //             « mesure » : the veille points

  /* ───────── 338,0 → 342,8 · « …aurait encaissé. Seize g, c'est la violence de l'essai… pas forcément celle d'un vrai choc. » ───────── */
  // the stop replayed in slow motion, in profile (the torso plunges toward −x, held at the pelvis); then a pull-back
  const PROF = { ...P, ...CLOSE, tx: -15, ty: 100, tz: 50, d: 250, az: -8, el: 4 };
  cut(tReplay, null, PROF, bench(ITEM.SEAT, { grid: 0, sled: 1, sensors: 1, fz: 50, fy: 90 }));
  st(tReplay + 0.05, 1.6, { sled: 2 }, "none"); //                      « encaissé » : the snap, sixteen times slower
  const tPull = A("mannequin:pas") - 0.15;
  const tCush = F("coussin", -0.12);
  shot(tReplay, tPull - tReplay, { ...PROF, d: 238, az: -10 });
  shot(tPull, tCush - tPull, { ...PROF, ...SHARP, ty: 108, d: 400, az: -18, el: 7 }, "sine.inOut", 238); // « pas forcément » : a pull-back

  /* ───────── 342,8 → 346,6 · « Et le coussin sous toi ? Depuis les années quatre-vingt, il doit résister à la flamme… » ───────── */
  const CUSH = { ...P, ...CLOSE, tx: -5, ty: 38, tz: 0, d: 200, az: -30, el: 14, side: -120 };
  cut(tCush, null, CUSH, bench(ITEM.CUSHION, { burner: 0 }));
  const tFlame = F("burner", -0.13);
  shot(tCush, tFlame - tCush, { ...CUSH, d: 178, az: -24 });

  /* ───────── 346,6 → 351,8 · « …d'un brûleur au kérosène. Aux États-Unis, environ 650 000 coussins ont dû être changés. » ───────── */
  // tight on the flame and the seam of the cushion: the burner licks it, the fire-blocking layer holds (veille edge)
  const FLAME = { ...P, ...CLOSE, tx: -5, ty: 34, tz: 0, d: 140, az: -18, el: 12, side: -120 };
  cut(tFlame, null, FLAME, bench(ITEM.CUSHION, { burner: 0, mood: 1 }));
  const tS = F("tout:siège", -0.15);
  shot(tFlame, tS - tFlame, { ...FLAME, d: 120, az: -14 });
  st(A("burner"), 0.8, { burner: 1 }, "power1.out"); //                « brûleur »
  fact(D.tl, { id: "c4-650", k: "Environ", v: "650 000", s: "coussins changés aux États-Unis", from: A("coussin:environ") + 0.4, to: tS - 0.02 });

  /* ───────── 351,8 → 357,4 · « Un siège qui tient. Un coussin qui résiste. Une ligne au sol. Un toboggan qui avale l'air. » ───────── */
  // four shots, each on its name
  const S1 = { ...VIEW.seat, ...CLOSE, d: 380, az: -36 };
  cut(tS, null, S1, bench(ITEM.SEAT, { grid: 0, sled: 2, sensors: 1 }));
  const tC = F("tout:coussin", -0.15);
  shot(tS, tC - tS, { ...S1, d: 350, az: -32 });
  cut(tC, null, FLAME, bench(ITEM.CUSHION, { burner: 1, mood: 1 }));
  const tL = F("tout:ligne", -0.15);
  shot(tC, tL - tC, { ...FLAME, d: 128, az: -12 });
  cut(tL, SET.CABINE, LOW, tok({ smoke: 1.2, floor: 1, signs: 0.2 }), { fade: 0.15 });
  const tT = F("tout:toboggan", -0.15);
  shot(tL, tT - tL, { ...LOW, tx: LOW.tx - 40 }, "none");
  const SLIDE = { ...P, ...SHARP, tx: D1, ty: 300, tz: 650, d: 1250, az: -20, el: 3 };
  cut(tT, SET.PISTE, SLIDE, apron({ doorA: 0.45, bridge: 0 }), { fade: 0.15 });
  const tQ = F("tout:et", -0.12);
  shot(tT, tQ - tT, { ...SLIDE, d: 1180, az: -22 });
  st(tT + 0.05, 1.4, { doorA: 1 }, "power1.out"); //                    the slide inflates
  st(A("tout:avale"), 0.35, { gulp: 1 }); //                            « avale l'air » : the veille wisps drawn in
  st(A("tout:l'air") + 0.1, 0.4, { gulp: 0 }); //                       back to 0 before the cut

  /* ───────── 357,4 → 361,82 · « Et un soir de janvier, à Tokyo, il va falloir tout ça… en même temps. » ───────── */
  // Haneda at night: the A350 on its approach, its runway far ahead; `run` a straight line, stopped ON the seam
  const t45 = onFrame(A(HAND.c45.at));
  const tA = t45 - HAND.c45.opt.before;
  const APP0 = HAND.c45.from[0];
  // first from BELOW (the belly, the gear, the lit windows over us), then a cut on the same plane, ON the seam pose, at 360,63
  const UNDER = { ...P, ...SHARP, tx: 0, ty: APPROACH.alt + 450, tz: 0, d: 5000, az: -62, el: -34 };
  cut(tQ, SET.PISTE, UNDER, { ...AT.haneda, fire: 0, pax: 1, lights: 1, alt: APPROACH.alt, run: runAt(D, tQ) }, { fade: 0.2 });
  st(tQ, tA - tQ, { run: runAt(D, tA) }, "none"); //            `run` never tweened across a cut: two straight pieces
  shot(tQ, tA - tQ, { ...UNDER, d: 4800, az: -57 });
  cut(tA, null, APP0, { run: runAt(D, tA) });
  st(tA, t45 - tA, { run: runAt(D, t45) }, "none");
  seam(D, "c45", "out");
}
