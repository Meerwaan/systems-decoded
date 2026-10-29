// c5 · « Tokyo, 2 janvier 2024 » — HAND.c45 (361,82) → HAND.c56 (435,05). docs/L03-actes.md, c5. THE CLIMAX OF THE FILM.
// The approach (the camera rides the plane down), the coast guard's Dash 8 waiting on the runway (a camera that stands
// on the ground: the A350 comes at it), the collision on « percutent », the wreck alone on « cinq des six », the A350
// that stops on « s'arrêter », 379 aboard; inside, the dead speakers, the crew at the door, the smoke; outside, five
// doors shut, two slides, the 4L, the engine still turning; inside, the walk, the bags left under the seats; the slide in profile,
// the 379 on the grass, the fire that enters the empty cabin, « moins de vingt minutes » — and the slow pull-back that
// HAND.c56 carries into c6. A shot every 2 to 5 s. Every instant is read off the voice (D.at, D.times).
// Journal: docs/journal/L03-c5.md.
import { fact } from "@kit/long.js";
import { SET, AT, VIEW, HAND, seam, onFrame, runAt } from "./world.js";
import { APPROACH, DASH } from "./plan.js";

/** An ease that follows f(t) between a and b: a shot written with it keeps pace with a number the world moves by f. */
const follow = (f, a, b) => {
  const fa = f(a);
  const fb = f(b);
  return (p) => (f(a + p * (b - a)) - fa) / (fb - fa);
};

export default function ({ D }) {
  const { at, st, now, shot, cut, punch } = D;
  const t = D.times({
    t1: "t1", heures: "t1:heures", unA350: "t1:un", pose: "t1:pose",
    sur: "t2", les: "t2:les", collide: "collide", petit: "t2:petit#2",
    a350: "t3", sarreter: "t3:s'arrêter", a: "t3:bord", n379: "t3:379",
    hp: "t4", marchent: "pa", equipage: "t4:l'équipage", megaphone: "t4:mégaphone", fumee: "t4:fumée",
    cinq: "t5", fermees: "closed", souvrent: "t5:s'ouvrent", slides: "slides", avalent: "t5:avalent", ceux: "t5:ceux",
    arriere: "t6", rear: "rear", et: "t6:et", engine: "engine",
    on: "t7", presque: "t7:presque",
    un: "t8", last: "last", p379: "t8:379", alive: "alive",
    quelques: "t9", firein: "firein",
    il: "t10", vingt: "t10:vingt", moitie: "t10:moitié",
  });
  const seamIn = onFrame(at(HAND.c45.at)); //                                     361,83
  const seamOut = onFrame(at(HAND.c56.at)); //                                    435,03
  const handAt = seamOut - HAND.c56.opt.before; //                                433,83: the last shot ends on HAND.c56.from[0]

  /* ── the world's two clocks: the plane's height (down ON « se pose ») and the runway under it ── */
  const tPose = t.pose; //                                                        370,72
  const altAt = (x) => {
    const u = Math.min(1, Math.max(0, (x - seamIn) / (tPose - seamIn)));
    return APPROACH.alt * (1 - (1 - Math.cos(Math.PI * u)) / 2); //               sine.inOut, as the tween below
  };
  const tStop = t.sarreter + 0.05; //                                             the A350 stops on « s'arrêter »
  const T = tStop - t.collide;
  const SLIDE = APPROACH.speed * T * 0.5; //                                      power1.out from the approach speed: no jolt at the hit
  const runPost = (x) => {
    const u = Math.min(1, Math.max(0, (x - t.collide) / T));
    return DASH.hit + SLIDE * (1 - (1 - u) * (1 - u));
  };
  const run = (x) => (x <= t.collide ? runAt(D, x) : runPost(x));
  const dashX = (x) => DASH.x + run(x) - 2 * DASH.hit; //                         where the Dash 8 (then its wreck) stands, in the plane's frame

  /* ── 361,83 → 365,95 · « Le deux janvier 2024, à Tokyo. Il est presque six heures du soir, … » — the approach ── */
  // the seam: the camera rides the plane (HAND.c45: ty follows APPROACH.alt); c4 lays the other half
  const p0 = seam(D, "c45", "in", { set: SET.PISTE, state: { ...AT.haneda, fire: 0, pax: 1, alt: APPROACH.alt, run: runAt(D, seamIn) } });
  now(seamIn, { step: 0, chronoOn: 0, chrono: 0 });
  st(seamIn, t.collide - seamIn, { run: DASH.hit }, "none"); //                   straight: the nose meets the Dash 8 ON « percutent »
  st(t.collide, T, { run: DASH.hit + SLIDE }, "power1.out"); //                   then it slides and stops ON « s'arrêter »
  st(seamIn, tPose - seamIn, { alt: 0 }, "sine.inOut"); //                        down, wheels on the runway ON « se pose »
  const tCab = onFrame(t.heures - 0.13); //                                   the shot from the seam stays under 6 s
  const tLow = onFrame(t.unA350 - 0.16);
  const after = seamIn + HAND.c45.opt.after;
  shot(after, tCab - after, { ...p0, tx: -300, ty: altAt(tCab) + 600, d: 7600, az: -31, el: -4 }, follow(altAt, after, tCab)); // the camera comes down with it
  fact(D.tl, { id: "c5-date", k: "Haneda, Tokyo", v: "2 JANVIER 2024", from: at("t1:Tokyo") + 0.1, to: tCab - 0.05 });

  /* ── 365,95 → 368,2 · « …six heures du soir, la nuit est tombée. » — inside, the passengers seated, the cabin dimmed for landing ── */
  // a true change of view (the seam's shot is outside): the aisle forward, the windows dark. `run` and `alt` go on
  // under it (never set by a cut while they move): the states below leave them out
  const { run: _r0, alt: _a0, ...CABIN } = AT.tokyo;
  const { run: _r1, alt: _a1, ...HANEDA } = AT.haneda;
  const CAB = { ...VIEW.aisle, tx: 520, d: 1150, az: 90, el: 9 }; // above the aisle, the heads of glass ≥ 1 m below the lens
  cut(tCab, SET.CABINE, CAB, { ...CABIN, fire: 0, smoke: 0, lights: 0.3, signs: 1, emerg: 1, pax: 1, floor: 0, dash: 0, fx: 600, fy: 110, fz: 60, fs: 900 }, { fade: 0.2 });
  shot(tCab, tLow - tCab, { ...CAB, tx: 460, d: 1080 }, "sine.inOut"); //            a slow push down the aisle (≈ 25 cm/s)

  /* ── 368,2 → 371,45 · « Un A350 de Japan Airlines se pose. » — outside again, low, beside the runway ── */
  // the same direction of travel, lower and closer: the runway comes up to meet the wheels
  const LOW = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: -500, ty: altAt(tLow) + 520, tz: 0, d: 7600, az: -16, el: 2 };
  cut(tLow, SET.PISTE, LOW, { ...HANEDA, fire: 0, pax: 1, dash: 1 }, { fade: 0.2 });
  shot(tLow, tPose - tLow, { ...LOW, tx: -900, ty: 560, d: 7200, az: -13 }, follow(altAt, tLow, tPose));
  const tDash = onFrame(t.sur - 0.13);
  shot(tPose, tDash - tPose, { ...LOW, tx: -1300, ty: 560, d: 7000, az: -12 }, "none"); //  it rolls on

  /* ── 371,45 → 376,7 · « Sur la piste, il y a un petit avion des garde-côtes, en route pour porter secours… » ── */
  // a camera that STANDS on the runway (it travels with the ground: tx follows the Dash 8), in front of the Dash 8,
  // looking back up the runway: the small plane waiting, and behind it the A350's lights that come at it
  const tHit = onFrame(t.les - 0.1);
  const DASHV = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, ty: 330, tz: 0, az: -62, el: 3 }; // close: the Dash 8 ≥ 40 % of the height, the A350 behind it, to its right
  cut(tDash, SET.PISTE, { ...DASHV, tx: dashX(tDash) + 600, d: 4300, az: -66 }, {}, {});
  shot(tDash, tHit - tDash, { ...DASHV, tx: dashX(tHit) + 600, d: 3800, az: -80, el: 3, ty: 300 }, "none"); // tx keeps pace with the ground (linear); a steady push and a turn of 14° onto the runway axis: the A350 grows behind it

  /* ── 376,7 → 378,9 · « Les deux avions se percutent. » — wide, low; the light at the nose ON « percutent » ── */
  const WIDE = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, fov: 14, tx: -5000, ty: 450, tz: 0, d: 12000, az: -74, el: 2 }; // a long lens from ahead of the Dash 8: it runs away from us into the nose (little sideways blur), both planes big
  cut(tHit, SET.PISTE, WIDE, {});
  const tWreck = onFrame(t.petit - 0.1); //                                    the A350's tail has passed over the wreck
  shot(tHit, tWreck - tHit, { ...WIDE, tx: -4600, d: 12800, el: 3 }, "sine.out", WIDE.d); // a pull-back by ratio
  st(t.collide, 0.35, { dash: 2 }, "power2.out"); //                              the Dash 8 breaks: a light and a fire at the nose, small
  st(t.collide + 0.08, 1.8, { fire: 0.7 }, "power2.out"); //                       the A350's fire takes under its belly
  punch(t.collide, 0.05);

  /* ── 378,9 → 382,1 · « À bord du petit, cinq des six membres d'équipage perdent la vie. » — the wreck, alone ── */
  // the camera stands on the ground again, by the wreck: it stays, dim, burning low; the A350 slides away into the night
  const tSide = onFrame(t.a350 - 0.13);
  const WRK = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, ty: 220, tz: 0, az: 68, el: 5 };
  cut(tWreck, SET.PISTE, { ...WRK, tx: dashX(tWreck), d: 4600 }, {});
  shot(tWreck, tSide - tWreck, { ...WRK, tx: dashX(tSide), d: 5400, el: 6 }, follow(dashX, tWreck, tSide)); // a slow pull-back that keeps it

  /* ── 382,1 → 385,25 · « L'A350 en feu finit par s'arrêter. » — from the side, it slides and stops ── */
  const SIDE = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: -1100, ty: 430, tz: 0, d: 4300, az: -34, el: 3, side: 300 }; // close: the fuselage ≥ 40 % of the height, the fire under the belly, in the left half
  cut(tSide, SET.PISTE, SIDE, { lights: 0, spin: 0 });
  st(tSide + 0.1, 1.6, { fire: 1 }, "sine.inOut");
  const tWin = onFrame(t.a - 0.22);
  shot(tSide, tWin - tSide, { ...SIDE, tx: -1300, d: 4000, az: -37 }, "sine.inOut");

  /* ── 385,25 → 390,37 · « À bord, vous êtes 379. Dont huit bébés. Des vrais, cette fois. » — the windows ── */
  const WIN = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: -1800, ty: 560, tz: 0, d: 5200, az: -38, el: 4 };
  cut(tWin, SET.PISTE, WIN, { pax: 0.3 });
  st(t.n379, 1.0, { pax: 1 }, "sine.inOut"); //                                   « 379 »: the heads behind the windows light up
  const tSpk = onFrame(t.hp - 0.16);
  shot(tWin, tSpk - tWin, { ...WIN, d: 3400, az: -32 }, "sine.inOut", WIN.d); //   a push toward them, by ratio
  fact(D.tl, { id: "c5-bord", k: "À bord", v: "379", s: "dont 8 bébés", from: t.n379 - 0.2, to: tSpk - 0.05 });

  /* ── 390,37 → 391,97 · « Les haut-parleurs ne marchent plus. » — inside, the grille of the hook (3,6 s) ── */
  const SPK = { ...VIEW.speaker, d: 135 };
  cut(tSpk, SET.CABINE, SPK, { ...AT.tokyo, smoke: 0.45, fire: 0.7, floor: 1, pa: 1, signs: 0.5, fx: 839, fy: 230, fz: 118, fs: 300 }, { fade: 0.2 });
  const tCrew = onFrame(t.equipage - 0.14);
  shot(tSpk, tCrew - tSpk, { ...VIEW.speaker, d: 110 }, "sine.inOut");
  st(t.marchent, 0.3, { pa: 0 }, "power2.out"); //                                « marchent »: dead, cold

  /* ── 391,97 → 397,1 · « L'équipage crie les consignes au mégaphone, ou à pleine voix. La fumée remplit la cabine. » ── */
  // low, under the smoke that comes (the camera at ≈ 80 cm): the crew at the front door, the megaphone raised
  const CREW = { ...VIEW.crewFront, ty: 110, el: -1, d: 360, az: 64, side: -150 }; // from aft of the door: the galley and the pack out of the way
  cut(tCrew, SET.CABINE, CREW, { ...AT.tokyo, crew: 1, smoke: 0.55, pax: 1, crowd: 0.15, fire: 0.7, floor: 1, signs: 0.4, fx: -20, fy: 130, fz: 170, fs: 400 });
  st(t.megaphone - 0.25, 0.5, { crew: 2 }, "power2.out"); //                       « mégaphone »: raised
  st(t.fumee, 1.3, { smoke: 1, signs: 0 }, "sine.inOut"); //                       « La fumée remplit »
  const tFlank = onFrame(t.cinq - 0.14);
  shot(tCrew, tFlank - tCrew, { ...CREW, d: 315, az: 58 }, "sine.inOut");

  /* ── 397,1 → 402,73 · « Cinq portes donnent sur le feu : elles restent fermées. Devant, deux portes s'ouvrent. » ── */
  // outside, the flank of the hook (5,1 s), travelling toward the nose; the runway moved under the stopped plane (run 0,
  // across a cut from the cabin: nobody sees it — c6 starts from AT.haneda)
  const FLANK = { ...VIEW.planeSide, tx: 300, d: 6800, shift: -60 };
  cut(tFlank, SET.PISTE, FLANK, { ...AT.haneda, fire: 1, smoke: 0.9, shut: 0, pax: 1, spin: 0, fx: -200, fy: 450, fz: 0, fs: 3500 }, { fade: 0.2 });
  st(t.fermees, 0.5, { shut: 1 }, "power2.out"); //                                « fermées »: five doors turn signal
  punch(t.fermees, 0.05);
  st(t.souvrent, 0.6, { doorA: 0.3 }, "power2.inOut"); //                           « s'ouvrent »: 1L and 1R swing out
  const tSlide = onFrame(t.slides - 0.13);
  shot(tFlank, tSlide - tFlank, { ...FLANK, tx: -1500, d: 6400 }, "sine.inOut");

  /* ── 402,73 → 405,08 · « Deux toboggans jaillissent… et avalent l'air de la nuit. » — slide 1L ── */
  const SL = { ...VIEW.slide1L, d: 2150, el: 3 };
  cut(tSlide, SET.PISTE, SL, {});
  st(t.slides, 1.4, { doorA: 1 }, "power2.out"); //                                « jaillissent »
  st(t.avalent, 0.4, { gulp: 1 }, "sine.out"); //                                   « avalent l'air »
  const tCrowd = onFrame(t.ceux - 0.14);
  st(tCrowd - 0.45, 0.35, { gulp: 0 }, "sine.in"); //                               back to 0 before the cut
  shot(tSlide, tCrowd - tSlide, { ...SL, d: 1900, el: 5 }, "sine.out");

  /* ── 405,08 → 406,77 · « Ceux du milieu remontent l'allée. » — inside, low, the people walking to the doors ── */
  const CRD = { fov: 36, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: 350, ty: 50, tz: -110, d: 850, az: 92, el: 2 }; // the RIGHT aisle, low (to 1R)
  cut(tCrowd, SET.CABINE, CRD, { ...AT.tokyo, crowd: 0.25, pax: 1, smoke: 1, floor: 1, door: 1, fire: 0.8, signs: 0, fx: 300, fy: 60, fz: 130, fs: 700 }, { fade: 0.2 });
  const t4L = onFrame(t.arriere - 0.16);
  st(tCrowd, t4L - tCrowd - 0.05, { crowd: 0.31 }, "none"); //  slow: the walkers near the lens stay smooth (qa: 16,3 at 405,8)
  shot(tCrowd, t4L - tCrowd, { ...CRD, tx: 300, d: 820 }, "sine.inOut"); //       ≈ 30 cm/s

  /* ── 406,77 → 410,2 · « À l'arrière, une seule porte. La quatrième à gauche. » — outside, the 4L ── */
  const D4 = { ...VIEW.door4L, d: 1350 };
  cut(t4L, SET.PISTE, D4, { ...AT.haneda, fire: 1, smoke: 1, doorA: 1, shut: 1, pax: 1, spin: 0, fx: VIEW.door4L.tx, fy: 430, fz: 400, fs: 1500 }, { fade: 0.2 });
  st(t.rear, 1.3, { doorB: 1 }, "power2.out"); //                                   « quatrième »: it opens, its slide drops
  now(t.rear, { mark: 7 }); //                                                       a veille ring around it
  const tEng = onFrame(t.et - 0.14);
  shot(t4L, tEng - t4L, { ...D4, d: 1700, el: 5 }, "sine.inOut");

  /* ── 410,2 → 412,47 · « Et à droite, un moteur tourne encore. » — the right engine, the 4R shut beside it ── */
  const ENG = { ...VIEW.engineR, d: 2400 };
  cut(tEng, SET.PISTE, ENG, { mark: 0, spin: 0.3, fx: VIEW.engineR.tx, fy: VIEW.engineR.ty, fz: VIEW.engineR.tz, fs: 1200 });
  st(t.engine - 0.1, 0.6, { spin: 1 }, "power2.out"); //                             « tourne »: the threat on the right side
  const tWalk = onFrame(t.on - 0.15);
  shot(tEng, tWalk - tEng, { ...ENG, d: 2100, az: 166 }, "sine.inOut");

  /* ── 412,47 → 415,13 · « On avance dans la fumée. On suit ceux de devant. » — inside, low, behind you ── */
  const WALK = { fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: 520, ty: 45, tz: 115, d: 650, az: 88, el: 3 };
  cut(tWalk, SET.CABINE, WALK, { ...AT.tokyo, smoke: 1.2, floor: 1, pax: 1, crowd: 0.45, you: 2, bag: 0, fire: 0.8, signs: 0, fx: 600, fy: 50, fz: 110, fs: 700 }, { fade: 0.2 });
  const tHand = onFrame(t.presque - 0.13);
  st(tWalk, tHand - tWalk - 0.05, { crowd: 0.58 }, "none");
  shot(tWalk, tHand - tWalk, { ...WALK, tx: 440 }, "none"); //                      30 cm/s: we follow the ones in front

  /* ── 415,13 → 417,1 · « Presque personne ne prend son sac. » — the row left behind, the bags under the seats ── */
  // the glass crowd hides a hand (tried: a wall of legs) — the row left behind, low: the bags stay under the seats,
  // the line runs out to the door; everyone has gone (the bag lies small, ≤ 20 %, never seen from above)
  const HAND0 = { fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: 694, ty: 15, tz: 160, d: 330, az: -130, el: 10 };
  cut(tHand, SET.CABINE, HAND0, { bag: 0, crowd: 1, you: 0 });
  const tProf = onFrame(t.un - 0.14);
  shot(tHand, tProf - tHand, { ...HAND0, d: 290 }, "sine.inOut");

  /* ── 417,1 → 420,93 · « Un par un, tout le monde glisse jusqu'au sol. Et le dernier sort. » — slide 1L in profile ── */
  const PROF = { ...VIEW.slideProfile };
  cut(tProf, SET.PISTE, PROF, { ...AT.haneda, fire: 1, smoke: 1, doorA: 1, doorB: 1, shut: 1, spin: 1, pax: 0.4, evac: 0.58, fx: -2600, fy: 250, fz: 850, fs: 1400 }, { fade: 0.2 });
  const tGather = onFrame(t.p379 - 0.15);
  st(tProf, tGather - tProf - 0.05, { evac: 0.73 }, "none"); //                      one by one; the last of 1L on « dernier »
  shot(tProf, tGather - tProf, { ...PROF, d: 1700, az: 33 }, "sine.inOut");

  /* ── 420,93 → 424,4 · « 379 personnes. Toutes vivantes. » — on the grass, the A350 burning behind ── */
  const GAT = { ...VIEW.gather, d: 6800, el: 12 };
  cut(tGather, SET.PISTE, GAT, { evac: 0.95, pax: 0.15, fx: -1500, fy: 100, fz: 4500, fs: 3000 });
  const tBreach = onFrame(t.quelques - 0.13);
  st(tGather, tBreach - tGather - 0.1, { evac: 1 }, "sine.out");
  shot(tGather, tBreach - tGather, { ...GAT, d: 6400, el: 16 }, "sine.inOut"); //  a slow rise
  fact(D.tl, { id: "c5-vivantes", v: "379", s: "toutes vivantes", tone: "veille", from: t.p379, to: tBreach - 0.05 });
  punch(t.alive, 0.04);

  /* ── 424,4 → 427,3 · « Quelques minutes plus tard, le feu entre dans la cabine. » — the empty plane, end to end ── */
  const EMPTY = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0, tx: 400, ty: 480, tz: 0, d: 6500, az: -6, el: 3 };
  cut(tBreach, SET.PISTE, EMPTY, { ...AT.haneda, fire: 1, doorA: 1, doorB: 1, shut: 1, evac: 1, pax: 0, spin: 1, breach: 0 });
  st(t.firein - 0.05, 1.0, { breach: 1 }, "power1.inOut"); //                        « entre »
  const tLast = onFrame(t.il - 0.12);
  shot(tBreach, tLast - tBreach, { ...EMPTY, tx: -200, d: 6300 }, "sine.inOut");

  /* ── 427,3 → 435,03 · « Il aura fallu moins de vingt minutes. Pas quatre-vingt-dix secondes. Mais avec moins de la
       moitié des portes… alors, la règle a-t-elle échoué ? » — a slow pull-back into the night, carried into c6 ── */
  const [BURN_A] = HAND.c56.from;
  cut(tLast, SET.PISTE, { ...BURN_A, d: 5000, az: -29, el: 5 }, { breach: 1 });
  shot(tLast, handAt - tLast, BURN_A, "sine.inOut", 5000);
  now(t.vingt, { chronoOn: 1, chrono: -1200 }); //                                   « vingt minutes »: < 20 min, signal
  punch(t.moitie, 0.04);
  now(seamOut - 0.25, { chronoOn: 0, chrono: 0 });
  seam(D, "c56", "out");
}
