// DOSSIER 037 — the chute, what the film still owes, the calls to action, the next file last, the loop (toverdict → end).
//   chute        a cut, closer: you hanging under the open canopy, limp — the camera backs away and the canopy comes into
//                the frame (« il ne sait pas que tu es inconscient », the account name lights on « pas ») · a cut to the
//                bench: the cutter cut open, the loop whole through its hole (« il n'ouvre même pas ton parachute »,
//                the received idea struck on « pas ») — on « coupe » the piston crosses and the loop parts, veille
//                (« il coupe un fil »)
//   comment      a cut to the grass, in the morning: the rig alone, its box dead (« Et si tu ne l'as pas allumé ? Il ne
//                fait rien. ») · the camera dives onto the control unit: on « allumé » it wakes, its self-test turns,
//                and on « saut » it is ready (« En France… ») · then it backs away round the rig under the duel
//   like         a cut to the field: you down, the canopy collapsed beside you
//   abo          the same shot, backing away slowly under the next file (no submarine model: the panel carries it)
//   boucle       a cut back up into the fall, a little wider than the first frame: « comme ce boîtier » the box glows
//                faintly; on « quand » the camera closes in onto POSE0 — the last frame IS the first.
// A title or a panel has finished leaving BEFORE the cut that follows it; one panel at a time in the top slot.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { glide } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, SPEED } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* chute — you under the canopy: close on your body first, then the whole of it (VIEW.hanging) */
const HANG_NEAR = { ...P, tx: 0, ty: -40, tz: 0, d: 640, az: -38, el: -4, fov: 40, shift: 160 };
const HANG_FAR = { ...HANG_NEAR, d: 920, az: -28, shift: 170 };
/* the cutter on the bench, cut open (section 1): under the title's shade (it ends at y ≈ 840) */
const CUTTER = { ...VIEW.cutter, shift: -60 };
const CUTTER_IN = { d: 13.5, az: -30 };

/* comment — the rig on the grass, then its control unit (model.js: the four states of the unit read at this pose) */
const GROUND = { ...VIEW.ground, tx: 6, ty: 12, tz: 14, d: 190, az: -36, el: 34, shift: 60 };
const GROUND_IN = { d: 150, az: -32 };
const UNIT = { ...P, dof: VIEW.rig.dof, tx: 11, ty: 19.2, tz: 23.5, d: 30, az: -30, el: 46, fov: 28, shift: 150 };
const GROUND_OUT = { ...GROUND, d: 150, az: -14, shift: 40 };

/* like, abo — down in the field (sauteur.js: closer than VIEW.landed, the body and the collapsed canopy read), under
   #net then #next: the picture pushed down, the header over the dark sky */
const LANDED = { ...P, tx: 120, ty: 20, tz: -60, d: 1800, az: -60, el: 32, fov: 36, shift: -180 };
const LANDED_OUT = { d: 2000, az: -52, shift: -170 };

/* boucle — the first frame, a little wider: the camera closes in on it */
const WIDE0 = { ...POSE0, d: 520 };

export default function fin({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", dedans: "promesse:dedans",
    toverdict: "toverdict", pas: "verdict", tobench: "chute:Il#2-0.06", pas2: "chute:pas#2",
    coupe: "chute:coupe", fil: "fil", tocta: "tocta",
    allume: "comment:allumé#2", france: "france", saut: "saut", commentaire: "commentaire", duelA: "duelA", duelB: "duelB",
    like: "like", weekend: "like:week-end", likeEnd: "like$",
    abo: "abo", prochain: "abo:prochain", jaillit: "abo:jaillit", aboEnd: "abo$",
    toloop: "toloop", boitier: "boucle:boîtier", rewind: "rewind",
  });

  /* ── CHUTE: « Voilà le secret : il ne sait pas que tu es inconscient. » ── */
  const ALT0 = 190; // where act 3 leaves you, under the canopy (5 m/s from here: the header keeps counting down)
  cut(t.toverdict, SET.SCENE, HANG_NEAR, {
    ...STAGED, alt: ALT0, vz: SPEED.canopy, threat: 0, spin: 0, tilt: 0, hang: 1, land: 0, deploy: 1, flaps: 1,
    loop: 1, piston: 1, power: 1, fabric: 1, mood: 0,
  });
  st(t.toverdict, t.tobench - t.toverdict, { alt: ALT0 - SPEED.canopy * (t.tobench - t.toverdict) }, "none");
  shot(t.toverdict, t.tobench - 0.02 - t.toverdict, HANG_FAR, "sine.inOut", HANG_NEAR.d);
  D.verdict(t.pas);
  punch(t.pas, 0.05);

  /* « Il n'ouvre même pas ton parachute. Il coupe un fil. » — the bench: the loop whole, then cut on « coupe » */
  cut(t.tobench, SET.BENCH, CUTTER, { ...BENCHED, alt: ALT0 - SPEED.canopy * (t.tobench - t.toverdict), vz: SPEED.canopy, section: 1, heart: 1, piston: 0, loop: 0, power: 1 });
  shot(t.tobench, t.coupe - t.tobench, CUTTER_IN, "sine.inOut");
  retitle(tl, { showAt: t.tobench + 0.12, strikeAt: t.pas2, swapAt: t.coupe, hideAt: t.tocta - 0.42 });
  st(t.coupe, 0.26, { piston: 1 }, "power2.in");
  st(t.coupe + 0.24, 0.08, { loop: 1, litLoop: 1 }, "power2.out");
  punch(t.fil, 0.06);
  shot(t.coupe + 0.1, t.tocta - 0.04 - t.coupe - 0.1, { d: 21, az: -26, el: 34, shift: -40 }, "sine.inOut");

  /* ── COMMENT: « Et si tu ne l'as pas allumé ? Il ne fait rien. » — the rig on the grass, dead ── */
  const GROUNDED = {
    ...STAGED, alt: 0, vz: 0, body: 0, threat: 0, spin: 0, tilt: 0, hang: 0, land: 0, deploy: 0, flaps: 0, loop: 0,
    piston: 0, power: 0, fabric: 1, mood: 0,
  };
  cut(t.tocta, SET.SCENE, GROUND, GROUNDED);
  shot(t.tocta, t.france - 0.3 - t.tocta, GROUND_IN, "sine.inOut");
  // « En France, il doit être allumé à chaque saut. » — onto the unit: it wakes on « allumé », its self-test turns, ready on « saut »
  shot(t.france - 0.3, t.allume - (t.france - 0.3), UNIT, "sine.inOut", GROUND_IN.d);
  chip("chip-france", null, 96, 470, t.france, t.saut + 0.06);
  st(t.allume, 0.12, { power: 1 }, "power2.out");
  st(t.allume + 0.05, t.saut - t.allume - 0.05, { test: 0.74 }, "none");
  st(t.saut, 0.12, { test: 0.8, wake: 1 }, "power2.out");
  // « En commentaire : tu fais confiance au boîtier… ou à ta main ? » — backing away round the rig, under the duel
  shot(t.saut + 0.2, t.like - 0.05 - t.saut - 0.2, GROUND_OUT, "sine.inOut", UNIT.d);
  duelCall(tl, { from: t.saut + 0.26, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.36, toneA: null, toneB: null });

  /* ── LIKE: « Like : pour quelqu'un qui saute ce week-end. » — down in the field ── */
  const toLike = t.like - 0.06;
  cut(toLike, SET.SCENE, LANDED, {
    ...STAGED, alt: 0, vz: 0, body: 1, threat: 0, spin: 0, tilt: 0, hang: 1, land: 1, deploy: 1, flaps: 1, loop: 1,
    piston: 1, power: 1, fabric: 1, mood: 0,
  });
  likeCall(tl, { from: t.like + 0.06, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });
  punch(t.weekend, 0.05);

  /* ── ABO: « Abonne-toi : prochain dossier, le sous-marin… et il jaillit. » — the same shot, backing away ── */
  shot(toLike, t.toloop - 0.04 - toLike, LANDED_OUT, "sine.inOut", LANDED.d);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });
  punch(t.jaillit, 0.05, { hold: 0.14, down: 0.36 });

  /* ── BOUCLE: « Comme ce boîtier, quand… » — back into the fall; the last frame IS the first ──
     Act 1 starts IN MOTION: the spin at ≈ 1/3 turn a second, the fall at SPEED.fall, the camera already closing in.
     So the end arrives on FIRST at those speeds (linear spin and altitude, the camera's ease still moving), and
     D.loop only checks: its own glide (sine, from rewindAt) would stop the spin dead on the seam. */
  const tEnd = D.tEnd;
  const a1 = t.choc + 0.9, a2 = t.dedans - 0.1;
  const R1 = 1 / (a1 + (a2 - a1) / 2); // act 1's spin rate on frame 1 (acte1.js)
  const back = tEnd - t.toloop;
  cut(t.toloop, SET.SCENE, WIDE0, { ...STAGED, ...FIRST, spin: FIRST.spin - R1 * back, alt: FIRST.alt + SPEED.fall * back });
  st(t.toloop, back, { spin: FIRST.spin, alt: FIRST.alt }, "none");
  st(t.boitier, 0.2, { litUnit: 0.6 }, "power2.out");
  st(t.boitier + 0.3, t.rewind - t.boitier - 0.35, { litUnit: 0 }, "sine.inOut");
  shot(t.toloop, t.rewind - t.toloop, { d: 490 }, "sine.inOut");
  shot(t.rewind, tEnd - t.rewind, POSE0, glide(0.6, 0.7), 490);
  D.loop({ at: t.toloop, rewindAt: tEnd - 0.03, fromD: POSE0.d });
}
