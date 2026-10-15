// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). One movement, two cuts (marked).
//
// THE HOOK. The first frame (POSE0 / FIRST) is taken from outside, level with the cage: you behind the glass, and the
// ball, enormous, filling the right; the rain flies level across the picture. It moves from frame 1: the sway runs
// straight (the whole top of the tower slides through the rain) and the camera leaves toward you at once.
//   "Typhon sur Taipei. Tu es au sommet d'une tour…"   the camera closes in on you, your label over your head
//   "…et elle se balance."                             the plumb line of the tower appears, and the tower arrives at the
//                                                      end of its lean ON "balance": the ball has left the line
//   "Ce qui la calme : 660 tonnes d'acier,"            the camera goes past you, through the glass, to the ball — and
//                                                      climbs aboard on the way (the cage holds still, the rain sways)
//   "…qui bougent à contretemps."                      aboard: the rest of the ball drawn under it; the ball goes one way,
//                                                      the storm the other — the ball reaches the end of its course on
//                                                      "contretemps"
//   "Pour les séismes ? Pas vraiment."                 everything shivers, the ball hardly answers; still on "vraiment"
// THE SCENE. A long pull-back by ratio out of the cage to the top third, the rain over the whole picture; the typhoon's
// label. CUT 1: the tower from its foot, a wide lens — one half-swing per word ("plient, reviennent, repartent"). CUT 2:
// you at the window, the ball behind you; on "Sans rien" the ball turns to glass (it is not there) and the storm swings
// harder; on "mal de mer" you bend and hold the rail. Then the ball comes back solid and the camera pulls back to the
// system alone, everything else going out: act 2 cuts to the bench from VIEW.system.
//
// The rain has never been seen moving: no fast move while it fills the picture, `storm` 0.6 at most in the wide lens.
import { setAct } from "@kit/overlay.js";
import { SET, POSE0, STAGED, VIEW, CAGE } from "./world.js";

const [, CY] = CAGE.at;
const HEART = CY + 470; // the ball's centre in the tower

/* ── the poses ── */
// the hook: the camera backs away gently, sliding left with the tower (it leans left on "balance": you stay in the
// picture, in front of the ball, and the plumb line it has left shows on the right)
const SWAY = { ...POSE0, tx: -480, ty: HEART + 10, tz: 90, d: 2500, drift: 0 };
// aboard, the ball whole and under it the ring's centre (the rest the course is read against)
const BALL = { tx: 0, ty: HEART - 140, tz: 0, d: 3400, az: -36, el: 4, fov: 30, shift: 60, side: 0, roll: 0, drift: 0.3 };
// the top third of the tower in the typhoon: the cage low in the picture, the label's slot above it
const TOP = { ...VIEW.top, ty: CY + 350, d: 9600, shift: 60 };
// the tower from its foot, a wide lens (the crown kept out of the header: aimed lower)
const LOW = { ...VIEW.low, ty: 5600 };
// you at the window and the ball behind you, aboard (you on the left, the ball centre right)
const YOUBALL = { tx: -260, ty: HEART, tz: 60, d: 2900, az: -30, el: 3, fov: 34, shift: 110, side: 0, roll: 0, drift: 0.3 };
const SYSTEM = VIEW.system;

// the light: what it stands around, and how wide
const L_CAGE = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: 900 };
const L_TOP = { fx: 0, fy: CY, fz: 0, fs: 3000 };
const L_LOW = { fx: 0, fy: 7000, fz: 0, fs: 6500 };

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.tour.A;
  const t = D.times({
    sommet: "sommet", sways: "sways", balance: "accroche:balance",
    calm: "calm", six: "promesse:660", tons: "tons", counter: "counter", contre: "promesse:contretemps",
    seisms: "seisms", notreally: "notreally", vraiment: "promesse:vraiment",
    toscene: "toscene", soudelor: "soudelor", winds: "winds",
    cent: "scene:cent#2", floors: "floors", bends: "bends", plient: "scene:plient", comes: "comes", goes: "goes", repartent: "scene:repartent",
    boat: "boat", bateau: "scene:bateau",
    without: "without", calmer: "scene:calmer", seasick: "seasick", mal: "scene:mal", end: "scene$", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);
  const cut1 = t.cent - 0.12; // a few frames before "Cent un étages"
  const cut2 = t.without - 0.04; // …before "Sans rien"

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── "Typhon sur Taipei. Tu es au sommet d'une tour… et elle se balance." ───────────── */
  // the sway runs straight from frame 1 and arrives at the end of the tower's lean (left) on "balance"
  const lean1 = t.balance + 0.05;
  st(0, lean1, { swing: 1.5 }, "none");
  // the camera backs away at once — fastest at the start: a hook moves before its first half second — and keeps
  // going, slower and slower, until "Ce qui la calme"
  shot(0, t.calm, SWAY, glide(1.5, 0));
  chip("chip-toi", A.head, -48, -118, t.sommet + 0.05, t.sways - 0.15);
  // "et elle se balance": the tower's plumb line appears — the ball has already left it
  st(t.sways, 0.5, { axis: 1 }, "sine.out");

  /* ───────────── "Ce qui la calme : 660 tonnes d'acier, qui bougent à contretemps." ───────────── */
  // past you, through the glass, to the ball — and aboard on the way: the cage holds still, the storm sways
  const atBall = t.tons + 0.5;
  shot(t.calm, atBall - t.calm, BALL, "sine.inOut");
  st(t.calm, atBall - t.calm, { aboard: 1, axis: 0 }, "sine.inOut");
  st(t.six - 0.1, 0.5, { litBall: 1 }, "sine.out");
  chip("chip-660", null, 96, 470, t.six, t.counter - 0.2);
  // the ball reaches the end of its course on "contretemps" (a whole value of `swing`); its rest drawn under it
  st(lean1, t.contre + 0.1 - lean1, { swing: 3 }, "none");
  st(t.counter - 0.6, 0.5, { datum: 1, litBall: 0.4 }, "sine.inOut");
  st(t.counter - 0.6, t.contre + 0.1 - (t.counter - 0.6), { reach: 45 }, "sine.inOut");
  shot(atBall, t.toscene - atBall, { d: BALL.d * 0.94 }, "sine.inOut");

  /* ───────────── "Pour les séismes ? Pas vraiment." ───────────── */
  // everything shivers, fast and small; the ball hardly answers. Still again on "vraiment"
  const sway2 = (t.contre + 0.1 - lean1) / 1.5; // seconds per half-swing, as it ran so far
  st(t.contre + 0.1, t.toscene - (t.contre + 0.1), { swing: 3 + (t.toscene - (t.contre + 0.1)) / sway2 }, "none");
  st(t.seisms, 0.25, { quake: 0.6 }, "power2.out");
  st(t.seisms, 0.6, { reach: 10, litBall: 0 }, "sine.inOut");
  st(t.vraiment, 0.3, { quake: 0 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "Huit août 2015 : le typhon Soudelor. Des vents à 160 kilomètres-heure." ───────────── */
  // a long pull-back by ratio out of the cage to the top third: the rain takes the whole picture (held at 0.6)
  const swingAt = (time) => 3 + (time - (t.contre + 0.1)) / sway2;
  st(t.toscene, cut1 - t.toscene, { swing: swingAt(cut1) }, "none");
  shot(t.toscene, cut1 - 0.05 - t.toscene, TOP, "sine.inOut", BALL.d * 0.94);
  st(t.toscene, 2.4, { aboard: 0, datum: 0, reach: 30 }, "sine.inOut");
  st(t.toscene, cut1 - 0.3 - t.toscene, { ...L_TOP, bend: 1.8, storm: 0.6 }, "sine.inOut");
  // (one line, the label is wider than the picture: its two lines stacked)
  tl.set("#chip-vent", { flexDirection: "column", alignItems: "flex-start", gap: 10 }, 0);
  chip("chip-vent", null, 96, 470, t.soudelor, cut1 - 0.15);

  /* ───────────── CUT 1 · "Cent un étages qui plient, reviennent, repartent… comme un bateau." ───────────── */
  // from its foot: the tower at the end of its lean to the left — then one half-swing per word: right on "plient",
  // across its axis on "reviennent", left on "repartent"; it hangs there, and goes again on "bateau"
  cut(cut1, SET.TOWER, LOW, { ...STAGED, swing: 1.5, bend: 2.5, axis: 1, city: 1, storm: 0.6, ...L_LOW });
  st(cut1, t.plient + 0.1 - cut1, { swing: 2.5 }, "none");
  st(t.plient + 0.1, t.repartent + 0.1 - (t.plient + 0.1), { swing: 3.5 }, "none");
  st(t.bateau - 0.25, cut2 - (t.bateau - 0.25), { swing: 4.1 }, "none");
  shot(cut1, cut2 - cut1, { d: LOW.d * 0.94 }, "sine.inOut");
  chip("chip-101", null, 96, 470, t.floors, t.boat);

  /* ───────────── CUT 2 · "Sans rien pour les calmer, là-haut, tu aurais le mal de mer." ───────────── */
  // you at the window, the ball behind you, aboard. "Sans rien": the ball turns to glass — it is not there — and the
  // storm outside swings further; "mal": you bend and hold the rail
  cut(cut2, SET.TOWER, YOUBALL, { ...STAGED, swing: 0.3, aboard: 1, storm: 0.9, ...L_CAGE });
  st(cut2, t.end - cut2, { swing: 0.3 + (t.end - cut2) / 1.6 }, "none");
  st(t.without + 0.1, 0.6, { xray: 1 }, "sine.inOut");
  st(t.without + 0.1, t.calmer - t.without, { bend: 1.8 }, "sine.inOut");
  const back = t.mal + 0.3; // (the pull-back leaves while you bend: the silence before "Alors…" is short)
  shot(cut2, back - cut2, { d: YOUBALL.d * 0.95 }, "sine.inOut");
  st(t.mal - 0.05, 0.55, { grip: 1 }, "sine.inOut");

  /* ───────────── the silence before "Alors…" ───────────── */
  // the ball comes back solid, and the camera pulls back to the system alone: the rain dies first (no fast move
  // through it), then everything else goes out; nothing moves any more (act 2 cuts to the bench from here)
  const settle = t.tosystem - 0.04;
  shot(back, settle - back, SYSTEM, "sine.inOut", YOUBALL.d * 0.95);
  st(back - 0.1, 0.45, { storm: 0 }, "sine.in");
  st(back, settle - back, { xray: 0, shell: 0.15, you: 0, city: 0, axis: 0, bend: 0, reach: 0, aboard: 0, fs: 900, fy: CY + 600 }, "sine.inOut");
  st(t.tosystem - 0.3, 0.28, { mood: 0 }, "none");
}
