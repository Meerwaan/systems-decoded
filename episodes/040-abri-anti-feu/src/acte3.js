// 03 · RÉPONSE — from « Zéro. » to « …Aucun brûlé. » (tozero → toverdict). The climax: one shot per place, and inside
// each the camera never stops (plan-séquence, 06/11: D.path, keys 6 to 15° apart, launched in and out). The front
// passing over you is seen whole, no cut on it: the camera closing in keeps closing in and takes the blow (jolt).
// Every cut is laid a few frames before its sentence, its pose is complete and so is its state ({ ...HERE, … }, built
// on STAGED): nothing is inherited from the act before, nothing from the shot before.
//
// THE STORY OF THE ACT, shot by shot (docs/040-actes.md § acte3.js):
//   · « Zéro. Le front monte sur la crête. » — low behind your head end, your dome in the foreground, the crest's lip
//     behind it: on « monte » the wall climbs over the lip and stands up behind the dome (front −25 → −6);
//   · « À plat ventre, le visage dans la terre. Tes mains plaquent les bords. » — inside, the section in place: you,
//     face down, feet to the fire; the hot gas gathers under the top; on « plaquent » hands and boots pin the hem;
//   · « Le feu te passe dessus. L'alu renvoie le rayonnement. » — low at the dome's side, the front rolling over it;
//     the rays come in signal and, on « renvoie », bounce back veille off the foil;
//   · « À côté, les manches de pelle se consument. » — your shovel, its handle burning down to the steel;
//   · « Dessous, tu respires l'air du sol. Environ une heure et demie. » — your mouth in the cool layer; on
//     « Environ » the clock runs to 1:30:00 and the red withdraws;
//   · « 73 abris. Aucun brûlé. » — the long pull-back along the black crest, the silver domes; on « Aucun » the
//     colour lets go (mood 1 → 0): the system has won.
// THE CLOCK: 0:00 on the cut (signal, the header swells on « Zéro »), real time to « Environ », then 1:30:00 by
// « demie ». Never written in a later cut's state (it would fight the tween that runs it).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, LOOK } from "./world.js";

/* ── the poses ── */
const P = { fov: 30, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
// behind your head end, low, three-quarters: the dome in the foreground, the crest's lip and the front behind it
const ZERO0 = { ...P, tx: -20, ty: 50, tz: -60, d: 700, az: 38, el: 5, fov: 40, shift: 70, side: -60 };
// the section in place, from −x and a little above (the other domes along the crest stay above the frame): you, whole,
// face down, the straps, the hem — act 1's « under » again, a rhyme
// (retouche: at d 560 the body was a thin band and the hands did not read at 270 px — tight on you, head and the near
// hand at the hem, from a little higher so the floor and the far hand show; the 72 others hidden in the cut's state)
const IN0 = { ...P, ...CLOSE, tx: -15, ty: 14, tz: 40, d: 320, az: -80, el: 26, fov: 34, shift: 40 };
// low at the dome's side, the front rolling over it; the rays read here (green on the orange)
const OVER0 = { ...P, ...VIEW.over };
// the shovel from above, its handle running up the frame (blade far, tip near): the ring of embers walks down it.
// Tight, so that your dome (75 cm to the right, its foil pink under the fire) only grazes the right edge
// (at d 300 aimed at tz 30 the blade sat behind the header: aimed nearer the blade, a step back)
// (retouche: at el 50 the ring of embers walked out of the frame's bottom right by « consument », a blade alone on
// black; az −25 put your pink dome over a third of the frame. el 40, aimed further down the handle: blade tip ≥ y 470,
// the ring at char 0.65 ≤ y 1215 and x ≤ 870, the dome a sliver off the right edge — the stage's projection, see the journal)
const SHOVEL0 = { ...P, ...CLOSE, tx: -115, ty: 2, tz: 30, d: 370, az: -10, el: 40, fov: 30, shift: 40 };
// your mouth at the cool layer, inside the section
const MOUTH0 = { ...P, ...VIEW.mouth };
// the long pull-back ALONG the crest, low from your −x side: your dome first, then the others receding in perspective
// (VIEW.back, from high, makes a dome 4 px: « 73 abris » had one dome to show). Same angle, by ratio
const BACK0 = { ...P, tx: 300, ty: 10, tz: 0, d: 900, az: -96, el: 9, fov: 38, shift: 110 };
const BACK1 = { ...BACK0, tx: 1600, ty: 0, d: 2600, el: 14, shift: 40 }; // shift 130: the far domes ran under the header

/* ── the state ── */
const HERE = { ...STAGED, abris: 73, hands: 1 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D, world }) {
  const { tl, st, shot, cut, chip, path, jolt } = D;
  const t = D.times({
    tozero: "tozero", zero: "zero:zéro", monte: "monte", crete: "zero:crête",
    toinside: "zero:à-0.15", ventre: "ventre", terre: "zero:terre", plaquent: "zero:plaquent", bords: "bords",
    reponse: "reponse", dessus: "dessus2", alu: "reponse:alu", trigger: "trigger", rayonnement: "reponse:rayonnement",
    toshovel: "reponse:à-0.12", pelle: "pelle", consument: "reponse:consument",
    tomouth: "reponse:dessous-0.12", respires: "respires", sol: "reponse:sol", environ: "reponse:environ", heure: "heure", demie: "reponse:demie",
    toback: "reponse:73-0.14", aucun: "reponse:aucun", brule: "brule",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: the clock swells and settles (its colour is the readout's: signal at zero). */
  const beat = (at, k = 1.2) => {
    tl.fromTo("#hud-clock", { scale: 1 }, { scale: k, duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to("#hud-clock", { scale: 1, duration: 0.5, ease: "power2.out" }, at + 0.14);
  };

  /* ── the clock: 0:00 on the cut, real time, then the hour and a half on « Environ une heure et demie » ── */
  st(t.tozero, span(t.tozero, t.environ), { clock: t.environ - t.tozero }, "none");
  st(t.environ, span(t.environ, t.demie + 0.15), { clock: 5400 }, "power2.in");
  beat(t.zero + 0.02);
  beat(t.demie + 0.17, 1.16);

  /* ───────────── « Zéro. Le front monte sur la crête. » ───────────── */
  cut(t.tozero, SET.CRETE, ZERO0, { ...HERE, clock: 0, front: -25, lean: 0.6, heat: 0.1, burn: 0.3 });
  path([[t.tozero, ZERO0], [t.monte, { d: 655, az: 31, el: 7 }], [t.toinside, { d: 615, az: 24, el: 9 }]]); // round the dome as the wall climbs
  // from « front » to the cut, eased both ways (sine.in over 0.94 s ended at full speed on the cut: qa heurté 43.7)
  st(t.monte - 0.42, span(t.monte - 0.42, t.toinside - 0.02), { front: -6, lean: 0.85 }, "sine.inOut");
  st(t.monte, span(t.monte, t.toinside), { heat: 0.35 }, "sine.in");

  /* ───────────── « À plat ventre, le visage dans la terre. Tes mains plaquent les bords. » ───────────── */
  cut(t.toinside, SET.CRETE, IN0, { ...HERE, front: -6, lean: 0.85, heat: 0.5, cut: 1, hands: 0, hot: 0, burn: 0.4, deploy: 0, crowd: 0 });
  path([
    // your head sits nearest the centre around az −80 (to −96 or to −67 it runs into the buttons' column on the
    // right): a small swing in az, the angle carried by the elevation, rising over you
    // side 170 (the frame slides right, you slide left): on the draft the head sat at x ≈ 960, under the buttons
    [t.toinside, { ...IN0, d: 330, az: -84, el: 21, side: 170 }],
    [t.terre, { d: 305, az: -80, el: 26 }],
    [t.plaquent, { d: 295, az: -77, el: 31 }], // the hands at the hem
    [t.reponse - 0.12, { d: 285, az: -75, el: 35 }],
  ]);
  st(t.ventre, span(t.ventre, t.bords + 0.2), { hot: 0.55, front: -2 }, "sine.inOut");
  st(t.plaquent - 0.04, 0.32, { hands: 1 }, "power2.out");

  /* ───────────── « Le feu te passe dessus. L'alu renvoie le rayonnement. » ───────────── */
  cut(t.reponse - 0.12, SET.CRETE, OVER0, { ...HERE, front: -3, lean: 0.85, heat: 0.6, burn: 0.5 });
  // closing in all the way: the front rolls over the dome in the frame on « dessus », the camera takes it, the rays follow
  path([
    // (from az −71 the dome's tail ran off the right edge, under the buttons: the arc starts at the view's own az)
    [t.reponse - 0.12, { ...OVER0, d: 850, az: -63, el: 2 }],
    [t.dessus, { d: 785, az: -57, el: 4 }],
    [t.trigger, { d: 735, az: -51, el: 6 }],
    [t.toshovel, { d: 700, az: -45, el: 7 }],
  ]);
  st(t.reponse, span(t.reponse, t.toshovel), { front: 2 }, "none"); // past +2 the flames reach the lens: an orange wash
  jolt(t.dessus + 0.04, 0.6); // the camera takes the front (was a punch: one blow, not two)
  st(t.alu - 0.08, 0.35, { rays: 1 }, "sine.out");
  st(t.trigger, 0.6, { bounce: 1 }, "power2.out");

  /* ───────────── « À côté, les manches de pelle se consument. » ───────────── */
  cut(t.toshovel, SET.CRETE, SHOVEL0, { ...HERE, front: 8, lean: 0.85, heat: 0.25, burn: 0.6, char: 0.3 });
  // from higher to lower as the ring walks down the handle (at el 50 it left the frame by « consument »)
  path([[t.toshovel, { ...SHOVEL0, d: 375, az: -15, el: 46 }], [t.pelle, { d: 350, az: -10, el: 41 }], [t.tomouth, { d: 328, az: -5, el: 36 }]]);
  st(t.toshovel, span(t.toshovel, t.pelle), { char: 0.45 }, "none");
  st(t.pelle, span(t.pelle, t.consument + 0.3), { char: 0.65 }, "power2.in"); // a burning length stays, and the ring stays in frame (0.82 left it at y 1600)

  /* ───────────── « Dessous, tu respires l'air du sol. Environ une heure et demie. » ───────────── */
  cut(t.tomouth, SET.CRETE, MOUTH0, { ...HERE, front: 10, lean: 0.7, heat: 0.4, burn: 0.7, cut: 1, cool: 1, hot: 0.6 });
  path([[t.tomouth, { ...MOUTH0, d: 270, az: -110, el: 4 }], [t.sol, { d: 252, az: -99, el: 8 }], [t.toback, { d: 236, az: -88, el: 12 }]]);
  chip("chip-sol", world.hero.A.mouth, -300, -230, t.respires, t.heure);
  st(t.environ, span(t.environ, t.toback), { hot: 0.15, front: 60, fire: 0.5, heat: 0.1 }, "sine.inOut");

  /* ───────────── « 73 abris. Aucun brûlé. » ───────────── */
  cut(t.toback, SET.CRETE, BACK0, { ...HERE, front: 60, fire: 0.4, lean: 0.4, burn: 1, smoke: 0.6, embers: 0.3, heat: 0, hot: 0 });
  // at a constant RATIO of distance (shot()'s own ratio ease is sine-shaped and peaked at 1.6× around 57.6: qa
  // heurté): d grows by the same factor each frame; it starts on a cut and ends on fin's cut, so it never stops
  const R = BACK1.d / BACK0.d;
  shot(t.toback, span(t.toback, t.toverdict), BACK1, (u) => (Math.pow(R, u) - 1) / (R - 1));
  st(t.aucun, 0.4, { mood: 0, gel: 0.03 }, "sine.inOut");
}
