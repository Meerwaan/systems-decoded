// DOSSIER 041 — the chute, what the film owes, the like, the next file last, the loop (toverdict → end).
// Plan-séquence (docs/recette-actes.md): one path per place, az DECREASING in every one of them, the end an orbit that
// never stops; cuts only where the place changes — Kosmos (another day), the capsules, the bench (the duo, the like),
// the next file, the loop. The seam with act 3 is invisible: it lands at speed on VIEW.cabin, we cut on the same pose.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, LIGHT, LOOK, HERO, DODGE } from "./world.js";

const HZ = HERO.centre[2];
const UP = DODGE.dy; // after « esquive » the whole station (and its coupon) sits DODGE.dy higher: the aim follows it

/* ── the poses ── */
// the chute's pull-back: out of the cabin, round the lab, up to the whole station seen from behind (az −130 → −212)
const LAB_OUT = { tx: 0, ty: 0, tz: HZ, d: 1200, az: -142, el: 12, fov: 38, shift: 0 }; // the glass lab, you in it, the green coupon
const ARMOURED = { tx: 250, ty: 120, tz: HZ, d: 12000, az: -170, el: 22, fov: 34, shift: 40 }; // closer, the arrays sit in front
const WHOLE_BACK = { tx: 400, ty: 200, tz: HZ, d: 22000, az: -186, el: 16, fov: 34, shift: 60 };
// the bench: the 1 cm bille and the baseball-size one side by side, the coupon behind them (a close-up: the lens)
const DUO = { tx: -6, ty: 4.5, tz: 34, d: 90, az: -68, el: 10, fov: 30, shift: -40, side: 0, roll: 0, drift: 0.3, dof: LOOK.dof };
// Dragon and Harmony's hatch, close enough for the four to read as people
const SHELTER = { ...VIEW.shelter, tx: -1650, ty: 0, d: 1700, az: -42, el: -12, shift: -100 };
// the like: the thick plate (MIRROR, 54 cm above the coupon) under the like panel, then down to the shield in profile
const PLATE = { tx: 0, ty: 52, tz: 2, d: 105, az: -81, el: 8, fov: 30, shift: 0, dof: 0 }; // 9° off profile: a plate, not a bar
const SHIELD = { tx: 0, ty: 3, tz: -4, d: 105, az: -90, el: 6 };
// retouche: the cut in to the like (the plate and its twin from « Like »), « ta station » past the arrays, the crew close
const LIKE_IN = { ...DUO, tx: 0, ty: 50, tz: 6, d: 150, az: -76, el: 9, shift: 0, dof: 0 };
const STATION_IN = { ...VIEW.cabin, ...ARMOURED, d: 10000, az: -164 };
// Harmony from above and ahead: one of the six reads whole, no array or radiator in front (az −165 el 6: a radiator across)
const CREW_IN = { ...VIEW.cabin, tx: -1000, ty: 10 + UP, tz: -100, d: 1800, az: -150, el: 30, fov: 34, shift: 0 };
/* the loop — the first frame, 7° further round on the way the whole film turns (az decreasing), a touch further back
   (retouche: 12° and × 1.1 shimmered in the X-ray cabin, qa 92.6) */
const BACK = { ...POSE0, d: POSE0.d * 1.05, az: POSE0.az + 7 };

export default function fin({ D }) {
  const { tl, st, path, cut, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "chute:secret", blindee: "blindee", pas: "verdict", esquive: "esquive", voit: "voit",
    tocta: "tocta", caches: "comment:caches", annee: "annee", detruit: "comment:détruit", suivis: "comment:suivis",
    astronautes: "astronautes", capsules: "capsules", toduo: "toduo", commentaire: "commentaire", duelA: "duelA", duelB: "duelB",
    like: "like", epais: "epais", protege: "protege", likeEnd: "like$",
    toabo: "toabo", abo: "abo", prochain: "prochain", char: "char", sauver: "sauver", aboEnd: "abo$",
    toloop: "toloop",
  });
  const toKosmos = t.annee - 0.22; //      « En 2021 » — another day: a cut
  const toShelter = t.astronautes - 0.42; // « Les sept astronautes »
  // retouche: three cuts in a breath, where a glide braked in the arrays (qa 62.7), dived 24 000 → 3 000 through them,
  // or crossed 45 cm of empty bench (82.0)
  const toStation = t.secret + 0.36; //   after « secret », before « ta station »
  const toCrew = t.tocta - 0.1; //        before « Et au-dessus »
  const toLike = t.like - 0.3; //         after « le petit ? »: the thick plate, its twin already coming

  /* ───────────── CHUTE « Voilà le secret : ta station, la plus blindée jamais lancée, n'arrête pas les gros
     débris. Elle les esquive… quand elle les voit. » ───────────── */
  cut(t.toverdict, SET.ORBIT, VIEW.cabin, { ...STAGED, burst: 1, molten: 1, cabin: 0.6, mood: 0, dist: 0, shock: 1 }); // invisible
  st(t.toverdict, t.like - 0.12 - t.toverdict, { flown: 175 }, "none"); //      the Earth goes by, at the station's speed
  st(t.toverdict + 0.15, t.pas - t.toverdict, { ...LIGHT.station }, "sine.inOut");
  st(t.blindee - 0.15, 0.6, { shield: 1 }, "power2.out"); //                  « la plus blindée »: every module's bumpers
  st(t.toverdict, t.voit - t.toverdict, { flyby: 0.55 }, "none"); //            the baseball-size one comes from far ahead…
  st(t.voit, toKosmos - t.voit, { flyby: 0.8 }, "none"); //                      …passes under the lab on « voit », goes on
  st(t.esquive - 0.1, 0.4, { burn: 1 }, "power2.out"); //                      Progress fires…
  st(t.esquive, 1.2, { dodge: 1 }, "sine.inOut"); //                           …the station steps aside
  st(t.voit, 0.5, { burn: 0 }, "sine.inOut");
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.pas, swapAt: t.esquive - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  punch(t.pas, 0.05);

  /* « Et au-dessus, tu te caches où ? » — the six others at their posts: the camera goes back in toward them */
  st(t.tocta, 0.7, { crew: 1, cabin: 0.4 }, "sine.inOut");

  path([
    [t.toverdict, VIEW.cabin], //                       act 3 lands here at speed: you asleep, the wall that held
    [toStation, LAB_OUT], //                            out through the glass, the lab whole — cut while still moving
  ]);
  cut(toStation, SET.ORBIT, STATION_IN); //             « ta station »: already beyond the arrays, a slow glide
  path([
    [toStation, STATION_IN],
    [t.blindee, ARMOURED], //                           « la plus blindée »: the bumpers light up module by module
    // retouche (qa 65.4): seen down the truss, the arrays turn edge-on — a bright line across the frame — when
    // tan(el) = 1.6 sin(az) (az −190 at el 16). The sweep stays ≥ 10° on the side ARMOURED is on: el rises as az turns.
    [t.pas, { ...WHOLE_BACK, az: -180, el: 20 }], //    « n'arrête pas »: the whole station, from behind, on the Earth
    [t.esquive, { d: 24000, az: -182, el: 23 }], //     « esquive »: Progress fires, the station steps aside
    [t.voit, { ty: 200 + UP, d: 25500, az: -184, el: 26 }], // « voit »: it goes by under the lab
    [toCrew, { d: 26500, az: -186, el: 28 }],
  ]);
  cut(toCrew, SET.ORBIT, CREW_IN); //                   « tu te caches où ? »: in close, the crew at their posts
  path([
    [toCrew, CREW_IN],
    [t.caches, { d: CREW_IN.d * 0.93, az: CREW_IN.az - 3 }],
    [toKosmos, { d: CREW_IN.d * 0.88, az: CREW_IN.az - 5 }],
  ]);

  /* ───────────── COMMENTAIRE « En 2021, un missile russe détruit un satellite : plus de 1 500 morceaux suivis. » ── */
  cut(toKosmos, SET.ORBIT, VIEW.kosmos, { dodge: 0, burn: 0, flyby: 1, kosmos: 0.1, shield: 0.4, crew: 1, cabin: 0.4 });
  st(t.detruit - 0.2, 0.2, { kosmos: 0.3 }, "power2.in"); //                   the hit, far away
  st(t.detruit, t.suivis - t.detruit, { kosmos: 1 }, "sine.out"); //           the cloud spreads along its orbit
  path([
    [toKosmos, VIEW.kosmos], //                         from behind the station, the cloud far to the right
    [t.detruit, { az: 106, d: 8500 }],
    [t.suivis, { az: 99, d: 8000, el: 7 }],
    [toShelter, { az: 96, d: 7800 }],
  ]);

  /* « Les sept astronautes se réfugient… dans leurs capsules. » */
  cut(toShelter, SET.ORBIT, SHELTER, { kosmos: 0, shield: 0, crew: 1, shelter: 0.25, capsules: 1, cabin: 0.3 });
  st(t.astronautes - 0.1, t.capsules - 0.2 - t.astronautes, { shelter: 0.9 }, "sine.inOut");
  st(t.capsules - 0.2, 0.3, { shelter: 1 }, "sine.out"); //                    the hatches shut, veille
  punch(t.capsules, 0.06, { hold: 0.12, down: 0.3 });
  chip("chip-capsules", null, 96, 470, t.capsules - 0.2, t.toduo - 0.1);
  path([
    [toShelter, SHELTER], //                            Dragon: the four float in
    [t.capsules, { az: -50, d: 1560, el: -14 }],
    [t.toduo, { az: -53, d: 1520 }],
  ]);

  /* ───────────── « En commentaire : le plus dangereux… le gros, ou le petit ? » — then the like, same move ───── */
  cut(t.toduo, SET.BENCH, DUO, { ...BENCHED, bille: 1, big: 1, dist: 25, trail: 0 });
  duelCall(tl, { from: t.commentaire - 0.3, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.42, toneA: null, toneB: null }); // gone before the like panel
  st(t.duelB - 0.05, 0.3, { gauge1: 1 }, "power2.out"); //                     « le petit »: its centimetre against it
  path([
    [t.toduo, DUO], //                                  the two side by side: the big one, the 1 cm one
    [t.duelA, { az: -72, d: 84 }],
    [t.duelB, { az: -75, d: 80 }],
    [toLike, { az: -77, d: 77 }],
  ]);

  /* LIKE « Like pour qui croit que plus c'est épais, plus ça protège. » — the thick plate beside the shield; both hit
     on « épais »: the plate is dug through in one point, the bumper and its void hold */
  cut(toLike, SET.BENCH, LIKE_IN, { mirror: 1, big: 0, gauge1: 0, pierce: 0.25 }); // the plate, its twin 17 cm out
  st(toLike, t.epais - toLike, { pierce: 0.4 }, "none"); //                    …coming in, linear: a projectile does not brake
  st(t.epais - 0.56, 0.56, { dist: 0, trail: 0.4 }, "none"); //                the bille, 25 cm, on the shield (below)
  st(t.epais, 0.12, { burst: 0.1 }, "none");
  st(t.epais, 0.42, { pierce: 0.49 }, "none"); //                              the plate's flash (whipple.js 0.4 → 0.49): 3 frames up, 10 down (qa 84.10, chef)
  st(t.epais + 0.42, 0.35, { pierce: 1 }, "sine.out"); //                       the plate: one point, dug through
  st(t.epais + 0.12, t.protege + 0.1 - t.epais, { burst: 1 }, "sine.out"); //  the shield: the cloud, the rain, it holds
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });
  path([
    [toLike, LIKE_IN], //                               the thick plate, its twin at the right edge
    [t.epais, PLATE],//                                « épais »: its twin comes in from the right and digs through
    [t.epais + 0.45, { ty: 50, d: 100, az: -85 }],
    [t.protege, SHIELD], //                             « protège »: down to the shield — the cloud stopped, the wall holds
    [t.toabo, { ty: 2, d: 98, az: -93 }],
  ]);

  /* ───────────── PROCHAIN DOSSIER — classified, and last ───────────── */
  cut(t.toabo, SET.BENCH, VIEW.teaser, { ...BENCHED, teaser: 1, pool: 0 });
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.char - 0.05, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });
  path([
    [t.toabo, VIEW.teaser],
    [t.char, { az: -38, d: 1860 }],
    [t.sauver, { az: -46, d: 1720 }],
    [t.toloop, { az: -50, d: 1660 }],
  ]);

  /* ───────────── BOUCLE « Comme ici, quand… » — the first frame, 12° further round; D.loop glides onto POSE0, the
     bille comes in from further out and reaches the first frame's distance moving ───────────── */
  cut(t.toloop, SET.ORBIT, BACK, { ...STAGED, ...FIRST, dist: FIRST.dist + 60, flown: 0 }); // ≈ 34 cm/s, act 1 leaves at ≈ 29
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.04, ease: "none" });
}
