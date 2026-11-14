// The end — chute, what the film still owes (the comment), like, next file, loop (docs/052-actes.md « fin.js »).
//   chute        the hook's frame again, but frozen (the cable stopped): « ta pince ne te sauve pas seule » — the
//                spring STAYS lit (contre-vérification: the grip is not useless), the station's checks light faintly
//                BESIDE it (came, tyres, weighing), never the whole station green; the account name lights (verdict)
//   commentaire  the steepest span in profile, the grip closed: the red arrow (what drags it down) and the green one,
//                twice as long; then the duel, each answer lit on its word — the film never answers for the viewer
//   like         the cable starts again, the line's grips light veille one by one from the mouth up
//   prochain     the camera leaves the line for the crests and the sky: nothing of the chairlift comes back after it
//   boucle       back in the station, moving INTO the first frame: chair, rope and grip glide at the speed frame 1
//                leaves with (D.loop, ease "none"), the camera on a straight line into POSE0
// The weighing is never shown infallible: no green verdict anywhere (docs/faits/052-contre-verification.md).
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, ROPE_V, AT_S, POSE0 } from "./world.js";

export default function fin({ D }) {
  const { tl, st, cut, path, shot, chip, punch } = D;
  const t = D.times({
    arrete: "reponse:s'arrête", toverdict: "toverdict", chute: "chute", pince: "chute:ta", pas: "chute:pas",
    gare: "chute:gare", verdict: "verdict", lache: "chute:lâche", assez: "chute:assez",
    tocta: "tocta", deux: "comment:deux", glisser: "comment:glisser", raide: "comment:raide", commentaire: "comment:commentaire",
    duelA: "duelA", duelB: "duelB", tolike: "tolike", like: "like", likeEnd: "like$",
    toabo: "toabo", et: "accroche:Et", prochain: "abo:prochain", aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });
  const R_STOP = ROPE_V * t.arrete + 250; // where the cable stood when it stopped (acte3: ≈ 1 s of braking)
  const AT_HOOK_X = POSE0.tx; // the hook's grip, on its came (arrival side)
  const LIGHT = { fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs };

  /* ── CHUTE — the hook's frame, frozen: a chair on the came, the cable stopped ── */
  const HOOK = { tx: AT_HOOK_X, ty: 340, tz: -260, d: 480, az: -140, el: 6, fov: 40, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 };
  cut(t.toverdict, SET.STATION, HOOK, {
    ...STAGED, ...LIGHT, line: 0.3, chair: AT_S.hook, rope: R_STOP, free: 0.6, open: 1, weak: 0, rider: 1, sit: 1, sway: 0,
    others: 1, kmh: 0, cableKmh: 0, mood: 0,
  });
  path([
    [t.toverdict, HOOK], // from outside, the grip under its came: the spring between the jaws
    [t.gare - 0.1, { d: 440, az: -132, el: 7 }],
    [t.assez - 0.2, { d: 860, az: -121, el: 13, shift: 80 }], // the slow pull-back: the came's tyres lit beside it
    [t.tocta - 0.04, { d: 920, az: -118, el: 14 }],
  ]);
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  st(t.pince - 0.05, 0.4, { litSpring: 1 }, "power2.out"); // « ta pince »: the spring stays lit, all the end long
  st(t.gare - 0.05, 0.6, { litCame: 0.6, litTyres: 0.6, litWeigh: 0.6 }, "power2.out"); // « La gare vérifie », beside it
  D.verdict(t.verdict);
  punch(t.assez, 0.06);

  /* ── COMMENTAIRE — the steepest span, the grip closed, the two arrows; then the duel ── */
  // retouche 14/11: opens close (grip and chair big on « Et assez fort »), backs off as the arrows grow
  const STEEP = { ...VIEW.steep, d: 1250, az: -14, shift: 40 };
  cut(t.tocta, SET.STATION, STEEP, {
    ...STAGED, line: 1, chair: AT_S.steep, rope: R_STOP, free: 0, open: 0, weak: 0, pull: 0, rider: 1, sit: 1, sway: 0,
    litSpring: 0, kmh: 0, cableKmh: 0, mood: 0, fx: STEEP.tx - 30, fy: STEEP.ty, fz: STEEP.tz, fs: 900,
  });
  path([
    [t.tocta, STEEP],
    [t.deux, { az: -18, d: 1650, shift: -20 }],
    [t.raide + 0.3, { az: -26, d: 2000, shift: -60 }], // both arrows in the frame
    [t.duelA, { az: -36, d: 2000, el: 6, shift: -20 }], // the grip just under the duel
    [t.tolike - 0.04, { az: -44, d: 2000, el: 7 }],
  ]);
  st(t.deux, t.glisser + 0.3 - t.deux, { pull: 1 }, "power2.out"); // « Deux fois ce qu'il faut pour ne pas glisser »
  chip("chip-deux", null, 53, 470, t.deux + 0.05, t.commentaire - 0.35);
  duelCall(tl, { from: t.duelA - 0.6, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.4 }); // gone before the cut

  /* ── LIKE — the cable starts again, the grips light up the line ── */
  const CLIMB = { ...VIEW.climb, tx: 6500, ty: 1600, d: 6000 };
  cut(t.tolike, SET.STATION, CLIMB, {
    ...STAGED, line: 1, chair: AT_S.steep, rope: R_STOP, free: 0, open: 0, pull: 0, greens: 0, rider: 1, sit: 1,
    kmh: 0, cableKmh: 0, mood: 0, fx: CLIMB.tx, fy: CLIMB.ty, fz: 0, fs: 2400,
  });
  const UP = 1.5; // the cable takes 1.5 s to reach its speed again (constant pull: it runs 0.75 s of its speed)
  // your chair rides the cable up the line with the others (gripped: it moves exactly as the rope does)
  const RUN = ROPE_V * (t.toloop - t.tolike - UP * 0.5);
  st(t.tolike, UP, { rope: R_STOP + ROPE_V * UP * 0.5, chair: AT_S.steep + ROPE_V * UP * 0.5 }, "power2.in");
  st(t.tolike + UP, t.toloop - t.tolike - UP, { rope: R_STOP + RUN, chair: AT_S.steep + RUN }, "none");
  st(t.tolike, UP, { cableKmh: 18, kmh: 18 }, "none");
  st(t.like, t.likeEnd - t.like + 0.4, { greens: 1 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER — up to the crests and the sky, the line left below ── */
  path([
    [t.tolike, CLIMB],
    [t.likeEnd, { az: -54, d: 6400, el: 6 }],
    // retouche 14/11: not the empty sky — up the line, its lit grips and chairs big under the panel
    [t.prochain, { tx: 10000, ty: 4000, tz: 0, d: 3400, az: -42, el: 4, fov: 34, shift: -150 }],
    [t.toloop - 0.04, { tx: 10400, ty: 4200, tz: 0, d: 3200, az: -40, el: 4, fov: 34, shift: -150 }],
  ]);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.2, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE — back in the station, gliding INTO the first frame ── */
  // Frame 1 leaves moving (acte1: the chair comes in ≈ 4 m/s, its grip opening, the cable at 5 m/s): the last 1.7 s
  // arrive at FIRST at that speed, on straight lines — so the loop's own glide (rewind → end) runs "none" too.
  const LEFT = D.tEnd - t.toloop;
  // retouche 14/11: frame 1's own speeds (acte1: chair S0 → S0 + 360 and camera tx → xArr(S0 + 0.78 × 360), d → 470,
  // all "sine.out" over quayCut = « Et » − 0.1; free starts still) — so the glide lands in frame 0 without a kink,
  // from POSE0's own angle (the chair reads, not only you)
  const quayCut = t.et - 0.1;
  const k = Math.PI / 2 / quayCut; // a "sine.out" tween's starting speed, per unit of its span
  const V_CHAIR = 360 * k;
  const A = { ...POSE0, tx: POSE0.tx + 0.78 * 360 * k * LEFT, d: POSE0.d + (POSE0.d - 470) * k * LEFT };
  const u = (t.rewind - t.toloop) / LEFT;
  const mid = Object.fromEntries(Object.keys(POSE0).map((k) => [k, A[k] + (POSE0[k] - A[k]) * u]));
  cut(t.toloop, SET.STATION, A, {
    ...STAGED, ...FIRST, chair: FIRST.chair - V_CHAIR * LEFT, rope: FIRST.rope - ROPE_V * LEFT,
  });
  st(t.toloop, t.rewind - t.toloop, {
    chair: FIRST.chair - V_CHAIR * LEFT * (1 - u), rope: FIRST.rope - ROPE_V * LEFT * (1 - u),
  }, "none");
  shot(t.toloop, t.rewind - t.toloop, mid, "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, ease: "none" });
}
