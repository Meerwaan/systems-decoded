// Chapters 0 · Introduction and 1 · On l'ouvre — beats accroche → remonter (docs/L01-actes.md · c1).
// Starts from FIRST and POSE0 (no cut) and moves from frame 1; hands over at the card of "Le four".
// Places: CAR (the hook, the film, the side window, the ordinary pane of before) · LINE (one flight along the whole
// factory, down to the 10 kg head held over the windshield) · BENCH (the windshield opened, layer by layer).
import { SET, AT, VIEW, POSE0, CARD_LEAD, onLine, span, run } from "./world.js";
import { ST } from "./plan.js";
import { fact } from "@kit/long.js";

export default function ({ D }) {
  const [, to] = span(D, "accroche", "four");
  run(D, 0, to);
  const at = D.at;

  /* ── 00 · the hook, in the car: the head is in the glass; it breaks… exactly as planned ── */
  // From POSE0, a slow push toward the point of impact, turning toward your face (moving from frame 1: power1.out).
  const HOOK_IN = { ...POSE0, tx: -37, ty: 134, tz: -36, d: 84, az: -168, el: 14, side: 210 };
  D.shot(0, at("promesse:sable") - 0.2, HOOK_IN, "power1.out");
  D.st(at("accroche:casse"), 0.9, { web: 1 }, "power2.out"); //            the radials run, on "casse"
  D.st(at("accroche:exactement"), 1.1, { rings: 1 }, "power1.inOut"); //   the rings, neat and even: order in the break

  // "sable": macro on the front of the cracks, the shards catch the key light like grains
  // quick to arrive (the head slides off to the left), then a slow glide across the shards
  const MACRO = { tx: -19, ty: 138, tz: -41, d: 40, az: -165, el: 34, fov: 32, shift: 0, side: 200, roll: 0, drift: 0.3 };
  const tSand = at("promesse:sable") - 0.2;
  D.shot(tSand, 1.1, MACRO, "power2.inOut");
  D.shot(tSand + 1.1, at("promesse:film") - 0.12 - tSand - 1.1, { ...MACRO, tx: -12, d: 36, az: -172 }, "sine.inOut");

  // "film": cut inside, your eyes — between the shards the veille of the film; "au travers": nothing passes
  const CAR_STATE = { ...AT.car, crash: 0.6, lunge: 1, web: 1, rings: 1, fx: -37, fy: 120, fz: -50, fs: 240 };
  const tFilm = at("promesse:film") - 0.12;
  D.cut(tFilm, SET.CAR, { ...VIEW.hook3 }, { ...CAR_STATE, stick: 0, mood: 0 });
  D.st(tFilm + 0.1, 1.0, { stick: 1 }, "power2.out");
  D.shot(tFilm + 0.02, at("curiosite") - tFilm, { ...VIEW.hook3, d: 52, side: 200, el: 0 }, "sine.inOut");
  fact(D.tl, { id: "c1-film", k: "Le film", v: "Moins d'1 mm", tone: "veille", side: "right", from: at("promesse:millimètre"), to: at("curiosite") - 0.1 });

  /* ── the side window may not have it: pan from the windshield to the driver's window ── */
  D.now(at("curiosite") - 0.05, { sideOn: 1 }); //                          off frame at that instant (the eyes look ahead)
  D.st(at("curiosite"), 2.2, { lunge: 0 }, "sine.inOut"); //               you sit back from the glass
  const OUT = { ...VIEW.sideOut, d: 240, az: -66, el: 8, side: -40 }; // from outside the driver door: the window, the windshield beyond
  D.shot(at("curiosite"), 2.4, OUT, "sine.inOut");
  D.st(at("curiosite:ce") + 0.3, 0.9, { litFilm: 1 }, "power2.out"); //    the windshield's film lit veille…
  // …the side window stays ink. "sortir": your hand rises toward it, empty
  D.st(at("curiosite:sortir") - 0.15, 0.9, { tool: 0.3 }, "power2.inOut");
  D.st(at("curiosite:sortir") + 1.0, 1.4, { litFilm: 0 }, "sine.inOut");
  // a slow pull-back, all through "On y reviendra"
  const tBack = at("curiosite") + 2.45;
  const tLine = at("defi:fabriquer") - 0.12;
  D.shot(tBack, tLine - tBack, { ...OUT, d: 330, az: -84, el: 12, side: -120 }, "sine.inOut");

  /* ── "il faut le fabriquer": the sand heaps, a travel toward the furnace, then a cut to the 10 kg head ── */
  const HIGH = onLine(-450, { ty: 70, d: 1700, az: -32, el: 34, side: -60 });
  D.cut(tLine, SET.LINE, HIGH, { ...AT.line, step: 0, temp: 20, tempOn: 0, pos: ST.test.frame, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, batch: 5 });
  D.shot(tLine + 0.02, at("defi:sable") + 0.3 - tLine, onLine(-560, { ty: 72, d: 430, az: -34, el: 22, side: -100 }), "sine.inOut", 1700); // dive on the heaps
  const HELD = onLine(ST.test.frame, { ty: 172, d: 400, az: -24, el: 10, side: -180 }); // the head held over the windshield
  const tFly = at("defi:jusqu'au") - 0.2;
  const tHead = at("defi:tête") - 0.12;
  // a readable travel: along the heaps toward the hopper and the glowing furnace (≈ 3 m/s), then a CUT to the head
  D.shot(tFly, tHead - tFly, onLine(-200, { ty: 95, d: 520, az: -40, el: 16, side: -120 }), "sine.inOut");
  D.cut(tHead, SET.LINE, { ...HELD, az: -40, d: 430 }, { ...AT.line, step: 0, temp: 20, tempOn: 0, pos: ST.test.frame, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, batch: 5 });
  fact(D.tl, { id: "c1-tete", k: "Tête factice", v: "10 kg", tone: "signal", from: at("defi:dix"), to: at("defi:devra") - 0.1 });
  D.shot(tHead + 0.02, at("defi:casser") - 0.12 - tHead, { ...HELD, az: -6, d: 370, ty: 176 }, "sine.inOut"); // a slow turn round it
  // "il devra casser": the clamp opens, the head falls — CUT before the contact (it is paid at the test)
  const tCard1 = at("ouvre") - CARD_LEAD;
  D.st(at("defi:casser"), tCard1 - at("defi:casser") - 0.02, { drop: 0.82 }, "power2.in");
  D.shot(at("defi:casser") - 0.1, tCard1 - at("defi:casser") + 0.1, { ...VIEW.frameLow, az: -10, d: 340, ty: 140, el: 8, side: -180 }, "sine.inOut");

  /* ── 01 · On l'ouvre: the windshield whole on the bench; "Alors… on l'ouvre" alone in its shot ── */
  const B1 = { ...VIEW.benchClose, az: -30, d: 330, side: -320 };
  D.cut(tCard1, SET.BENCH, { ...B1, az: -90, d: 380 }, { ...AT.bench });
  D.shot(tCard1 + 0.02, 0.8, B1, "expo.out"); //                           the whip, under the card
  D.shot(tCard1 + 0.85, at("explode") - tCard1 - 0.85, { ...B1, d: 300, az: -36, el: 16 }, "sine.inOut");
  D.st(at("explode"), 1.4, { explode: 1, litFilm: 0.7 }, "power3.out"); //  ON "ouvre"
  const OPEN = { ...VIEW.exploded, side: -220 };
  D.shot(at("explode"), at("couches") - at("explode") - 0.05, OPEN, "power2.out"); // it pulls back and turns

  /* a layer per word, one travelling along the stack, then a dive on the corner */
  const L_OUT = { ...OPEN, tx: 0, ty: 72, tz: 24, d: 330, az: -48, el: 16, side: -200 };
  const L_FILM = { ...OPEN, tx: 0, ty: 60, tz: 0, d: 360, az: -60, el: 14, side: -200 };
  const L_IN = { ...OPEN, tx: 0, ty: 48, tz: -24, d: 340, az: -72, el: 12, side: -200 };
  const L_BAND = { ...OPEN, tx: 34, ty: 40, tz: 36, d: 270, az: -34, el: 18, side: -160 };
  const STAMP = { ...VIEW.stamp, ty: 44, tz: 42 }; //                      the corner where the outer glass stands at explode 1
  D.shot(at("couches") - 0.05, at("couches:film") - at("couches"), L_OUT, "sine.inOut");
  D.st(at("couches:verre") - 0.1, 0.4, { litGlass: 1, litFilm: 0 }, "power2.out");
  D.shot(at("couches:film") - 0.05, at("couches:deuxième") - at("couches:film"), L_FILM, "sine.inOut");
  D.st(at("couches:film") - 0.05, 0.4, { litGlass: 0, litFilm: 1 }, "power2.out");
  D.shot(at("couches:deuxième") - 0.05, at("couches:autour") - at("couches:deuxième"), L_IN, "sine.inOut");
  D.st(at("couches:deuxième") - 0.05, 0.4, { litGlass: 1, litFilm: 0 }, "power2.out");
  D.shot(at("couches:autour") - 0.05, at("couches:petit") - at("couches:autour") - 0.1, L_BAND, "sine.inOut");
  D.st(at("couches:bande") - 0.1, 0.4, { litGlass: 0, litBand: 1 }, "power2.out");
  D.shot(at("couches:petit") - 0.15, 0.85, STAMP, "sine.inOut", L_BAND.d);
  D.st(at("couches:tampon") - 0.1, 0.4, { litBand: 0, litStamp: 1 }, "power2.out");
  const tBefore = at("avant") - 0.1;
  D.shot(at("couches:petit") + 0.72, tBefore - at("couches:petit") - 0.72, { ...STAMP, d: 66, az: -16 }, "sine.inOut");

  /* ── before all that: an ordinary pane, and its blades at the height of your face ── */
  const SIDE_ON = { ...VIEW.hook2, side: 220 };
  D.cut(tBefore, SET.CAR, SIDE_ON, { ...AT.car, plain: 1, hero: 0, wall: 1, mood: 1, fx: -37, fy: 120, fz: -40, fs: 260 });
  D.shot(tBefore + 0.02, at("avant:choc") - tBefore, { ...SIDE_ON, d: 300, az: -100 }, "sine.inOut");
  D.st(at("avant:choc") - 0.05, 0.6, { crash: 0.5 }, "power3.out"); //    the world comes to the car
  D.st(at("avant:briser") - 0.05, 0.4, { blades: 0.12 }, "power2.in"); //  it splits and turns signal
  D.st(at("avant:lames") - 0.05, at("avant$") - at("avant:lames") + 0.4, { blades: 1 }, "sine.out"); // the blades fly, slowed
  D.shot(at("avant:choc"), at("remonter") - 0.1 - at("avant:choc"), { ...SIDE_ON, tx: -37, ty: 126, tz: 0, d: 260, az: -96, el: 6, side: 160 }, "sine.inOut");

  /* ── the three layers close; "Dans le sable": a dive onto the glass's edge ── */
  const tBack2 = at("remonter") - 0.1;
  D.cut(tBack2, SET.BENCH, OPEN, { ...AT.bench, explode: 1, litFilm: 0.5 });
  D.shot(tBack2 + 0.02, at("remonter:tout") - tBack2, { ...OPEN, az: -26, d: 480 }, "sine.inOut");
  D.st(at("remonter:trois") - 0.1, 1.1, { explode: 0, litFilm: 0 }, "power2.inOut");
  const EDGE = { tx: 40, ty: 22, tz: 21, d: 22, az: -20, el: 8, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 };
  D.shot(at("remonter:tout"), to - at("remonter:tout"), EDGE, "sine.inOut", 480);
}
