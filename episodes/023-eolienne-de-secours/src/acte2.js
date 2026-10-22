// DOSSIER 023 — 02 AUTOPSIE, from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Act 1 leaves the RAT alone in its shut bay, under the glass belly (VIEW.system). What is left of the plane goes out
// on "Alors…", and the same RAT, still stowed, stands on the bench at the same place of the picture (benchCut). On
// "on" it is opened for real: the door swings, the spring throws the arm out, and as the camera pulls back the parts
// move apart — door up top, spring aft, propeller forward, the pump out of its nacelle, the three lines in a row.
// Each part the voice names lights up, with its gesture: the door, the arm and its spring (the arm lifts, the spring
// closes, then throws it back), the propeller (half a turn), and behind it the pump. "Elle dort" : it gathers, folds
// into its bay, the door shuts. "Elle sort seule" : door, spring, arm, landed on "seule". "le vent" : the streaks
// come from the nose, the propeller spins up on "tourner". "elle pousse l'huile" : the pump lights, a head of light
// climbs the arm into ONE line of three.
// The threshold does not stop the film: on its first word the same RAT is back under the plane, at the same place of
// the picture, and the camera pulls far back along the same line, out to the whole plane gliding over the black sea.
// The altimeter answers "plané". Act 3 cuts from there to the left engine, three quarters front: a cut-in on the axis.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED, BAY, BENCHAT, SIZE } from "./world.js";

const [BX, BY, BZ] = BAY.at;
// the RAT's hinge in the plane, seen from the bench: a pose written round the plane's bay, moved onto the bench
const ORIGIN = [BX - BENCHAT[0], BY - BENCHAT[1], BZ - BENCHAT[2]];

/* ── on the bench (the hinge at BENCHAT) ── */
// the stowed RAT in its bay, a little below and in front: where "Alors…" ends, in the plane and on the bench
const SYS_B = { ...VIEW.whole, tx: 95, ty: 235, tz: 0, d: 950, az: -52, el: -12, shift: 80 };
const EXPL = { ...VIEW.exploded, d: 1500, shift: 150 }; //                                          the whole exploded view
const UPPER = { ...EXPL, tx: 30, ty: 190, d: 1250, shift: 150 }; //                                 door, arm and spring, closer
const PROP_X = { ...VIEW.prop, tx: -75, ty: 60, tz: 0, d: 640, az: -66, el: 6, shift: 170 }; //     the propeller, out front
const PUMP_X = { ...VIEW.prop, tx: 46, ty: 82, tz: 0, d: 560, az: -8, el: 10, shift: 140 }; //      behind it: the pump
const WHOLE = { ...VIEW.whole, tx: 60, ty: 157, tz: 0, d: 1250, az: -50, el: 4, shift: 150 }; // assembled, out: from the roof of the bay to the blades
// out, from the front and the right: the open door hangs behind the RAT, not in front of it
const WHOLE_B = { ...WHOLE, az: -135, el: 2, shift: 90 };
const SLEEP = { ...SYS_B, d: 780, az: -100, el: -4, shift: 20 }; //                                                    folded in its bay
const PROP = VIEW.prop; //                                                                           the propeller in the wind
// the whole path of the pressure: the pump, the arm, and up in the roof of the bay the three lines — one lights up
const CIRC = { ...VIEW.pump, tx: 70, ty: 150, tz: -10, d: 1350, az: -40, el: -12, shift: 40 };

/* ── in the sky (plane's frame) ── */
// the pump's frame, moved back under the plane: the threshold's cut lands on the same picture
const PUMP_SKY = moved(CIRC, BENCHAT, BAY.at);
// …and pulls far back along nearly the same line: the whole plane over the black sea, from a little above and in front
const GLIDE = { tx: -300, ty: -250, tz: 300, d: 17000, az: -30, el: 9, fov: 40, shift: 120, side: 0, roll: 0, drift: 0.3 };

// the light: what it stands around, and how wide
const L_SYS = { fx: BX, fy: BY - 40, fz: BZ, fs: 300 };
const L_BENCH = { fx: 0, fy: 200, fz: 0, fs: SIZE };
const L_WIDE = { fx: 0, fy: 160, fz: 0, fs: 300 };
const L_UPPER = { fx: 45, fy: 225, fz: 0, fs: 200 };
const L_PROP = { fx: -40, fy: 80, fz: 0, fs: 170 };
const L_PUMP = { fx: 30, fy: 95, fz: 0, fs: 170 };
const L_PLANE = { fx: -300, fy: -250, fz: 300, fs: 3500 };

export default function acte2({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode", opened: "ouvre$",
    p1: "p1", p2: "p2", spring: "spring", p3: "p3", behind: "behind", p4: "p4", eclateEnd: "eclate$",
    torepos: "torepos", sleeps: "sleeps", folded: "folded", door2: "door2",
    allstop: "allstop", flight: "flight", sorts: "sorts", self: "self", selfEnd: "repos:seule$",
    nomotor2: "nomotor2", wind: "wind", spins: "spins", pushes: "pushes", oil: "oil", circuit: "circuit", reposEnd: "repos$",
    toseuil: "toseuil", seuil: "seuil", plane0: "plane0", ocean: "ocean", whole: "whole", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── "Alors…" — the RAT alone in its shut bay: what is left of the plane goes out ───────────── */
  // (a cut from act 1: the bay alone, from below and in front, the near engine out of the frame)
  cut(t.tosystem, SET.SKY, moved({ ...SYS_B, d: 1020 }, BENCHAT, BAY.at), { ...STAGED, alt: 10300, ahead: 0.9, shell: 0.2, you: 0, mood: 0, ...L_SYS });
  st(t.tosystem, t.tobench - t.tosystem, { ahead: 0.892 }, "none");
  st(t.tosystem + 0.04, (t.tobench - t.tosystem) * 0.8, { shell: 0 }, "sine.inOut");
  // …and the camera settles on the bay, a little below and in front, the near engine out of the frame
  shot(t.tosystem + 0.04, t.tobench - 0.02 - (t.tosystem + 0.04), moved(SYS_B, BENCHAT, BAY.at), "sine.inOut"); // (a slow push: the cut from act 1 has already found the bay)

  /* ───────────── "…on l'ouvre." — the same RAT on the bench, still stowed; on "on" it is opened, and comes apart ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: moved(SYS_B, BENCHAT, BAY.at), origin: ORIGIN, state: { ...BENCHED, alt: 10300, door: 0, arm: 0, ...L_BENCH } });
  st(t.explode, 0.34, { door: 1 }, "power2.out"); //                 the door swings out on "on"…
  st(t.explode + 0.1, 0.5, { arm: 1 }, "power2.out"); //            …the spring throws the arm down…
  const apart = t.explode + 0.42;
  st(apart, t.p1 - 0.12 - apart, { explode: 1 }, "sine.inOut"); //  …and the parts move apart as the camera pulls back
  const wide = t.p1 - 0.1 - (t.tobench + 0.03);
  shot(t.tobench + 0.03, wide, EXPL, "sine.inOut", bench.d);
  st(t.tobench + 0.03, wide, L_WIDE, "sine.inOut");

  /* ───────────── "Une trappe. Un bras, poussé par un ressort." — the same frame for the three, closing in slowly ───────────── */
  // (no label: the caption says the word, the part lights up on it — and moves)
  const up = t.p3 - 0.25 - (t.p1 - 0.05);
  shot(t.p1 - 0.05, up, UPPER, "sine.inOut", EXPL.d);
  st(t.p1 - 0.05, up, L_UPPER, "sine.inOut");
  st(t.p1, 0.25, { litDoor: 1 }, "sine.out");
  st(t.p2 - 0.1, 0.25, { litDoor: 0 }, "sine.inOut");
  st(t.p2 + 0.02, 0.25, { litArm: 1 }, "sine.out");
  // the gesture: the arm lifts, the spring closes… and throws it back out
  st(t.spring - 0.05, 0.42, { arm: 0.62 }, "sine.inOut");
  st(t.spring + 0.4, 0.36, { arm: 1 }, "power2.out");

  /* ───────────── "Une hélice." — out front, it turns half a turn, slowly ───────────── */
  const toProp = t.behind - 0.05 - (t.p3 - 0.2);
  shot(t.p3 - 0.2, toProp, PROP_X, "sine.inOut", UPPER.d);
  st(t.p3 - 0.2, toProp, L_PROP, "sine.inOut");
  st(t.p3 - 0.1, 0.25, { litArm: 0 }, "sine.inOut");
  st(t.p3, 0.25, { litProp: 1 }, "sine.out");
  st(t.p3, t.behind + 0.2 - t.p3, { turn: 0.5 }, "sine.inOut");

  /* ───────────── "Et derrière… une pompe." — the camera goes round behind the propeller ───────────── */
  const round = t.p4 + 0.2 - t.behind;
  shot(t.behind, round, PUMP_X, "sine.inOut", PROP_X.d);
  st(t.behind, round, L_PUMP, "sine.inOut");
  st(t.p4 - 0.1, 0.25, { litProp: 0 }, "sine.inOut");
  st(t.p4, 0.25, { litPump: 1 }, "sine.out");

  /* ───────────── "Elle dort, repliée, derrière une trappe." — it gathers, folds into its bay, the door shuts ───────────── */
  st(t.torepos, 0.3, { litPump: 0 }, "sine.inOut");
  st(t.torepos, t.folded - 0.05 - t.torepos, { explode: 0 }, "sine.inOut");
  const back = t.folded + 0.1 - t.torepos;
  shot(t.torepos, back, WHOLE, "sine.inOut", PUMP_X.d);
  st(t.torepos, back, L_BENCH, "sine.inOut");
  st(t.folded, t.door2 - 0.12 - t.folded, { arm: 0 }, "sine.inOut"); //   it folds up
  const shut = t.door2 - 0.3;
  shot(shut, t.allstop - shut, SLEEP, "sine.inOut", WHOLE.d);
  st(t.door2, 0.45, { door: 0 }, "power2.inOut"); //                       the door shuts over it

  /* ───────────── "Tous les moteurs s'arrêtent en vol ? Elle sort seule." — door, spring, arm: landed on "seule" ───────────── */
  shot(t.allstop, t.selfEnd - t.allstop, WHOLE_B, "sine.inOut", SLEEP.d);
  st(t.sorts - 0.32, 0.32, { door: 1 }, "power2.out");
  st(t.sorts - 0.2, 0.2, { litArm: 1 }, "sine.out");
  st(t.sorts - 0.12, t.self + 0.12 - (t.sorts - 0.12), { arm: 1 }, "power2.out");

  /* ───────────── "Pas de moteur pour elle : c'est le vent de l'avion qui la fait tourner." ───────────── */
  st(t.nomotor2, 0.3, { litArm: 0 }, "sine.inOut");
  const toWind = t.wind - t.nomotor2;
  shot(t.nomotor2, toWind, PROP, "sine.inOut", WHOLE.d);
  st(t.nomotor2, toWind, L_PROP, "sine.inOut");
  st(t.wind - 0.05, 0.5, { wind: 1 }, "sine.out"); //                     the streaks come from the nose
  chip("chip-vent", null, 96, 470, t.wind, t.pushes - 0.2);
  // the propeller: it starts on "vent", spins up on "tourner" (≈ 1.6 turns a second from there: never faster)
  st(t.wind, t.spins - t.wind, { turn: 1.1 }, "power2.in");
  const spin = 1.6;
  st(t.spins, t.tozero - t.spins, { turn: 1.1 + spin * (t.tozero - t.spins) }, "none");
  st(t.spins - 0.05, 0.5, { whirl: 1 }, "sine.out");

  /* ───────────── "Et elle pousse l'huile… dans un seul circuit." — the pump lights, the head climbs into one line ───────────── */
  const toPump = t.circuit - 0.2 - (t.pushes - 0.25);
  shot(t.pushes - 0.25, toPump, CIRC, "sine.inOut", PROP.d);
  st(t.pushes - 0.25, toPump, { fx: 40, fy: 150, fz: -10, fs: 260 }, "sine.inOut");
  st(t.pushes, 0.4, { press: 1 }, "sine.out");
  st(t.oil, t.reposEnd - t.oil, { flow: 1 }, "sine.inOut");
  chip("chip-circuit", null, 96, 470, t.circuit - 0.3, t.toseuil - 0.15);

  /* ───────────── the threshold — "Abonne-toi : ce plané au-dessus de l'océan… regarde-le en entier." ───────────── */
  // (kit: followCall) The film does not stop for it: on its first word the same RAT is back under the plane, spinning,
  // at the same place of the picture; the camera pulls far back, nearly along the same line, to the whole plane
  // gliding over the black sea. The head of light stops at the bay's exit (flow 0.15): act 3 brings the circuit back.
  cut(t.toseuil, SET.SKY, PUMP_SKY, {
    ...STAGED, alt: 10300, ahead: 0.95, wind: 0.6, shell: 1, you: 1, door: 1, arm: 1, whirl: 1, press: 1, flow: 0.15, mood: 1,
    fx: BX, fy: BY - 90, fz: BZ, fs: 300,
  });
  st(t.toseuil, t.tozero - t.toseuil, { ahead: 0.95 - 0.01 * (t.tozero - t.toseuil) }, "none");
  const out = t.whole + 0.3 - (t.toseuil + 0.04);
  shot(t.toseuil + 0.04, out, GLIDE, "sine.inOut", PUMP_SKY.d);
  st(t.toseuil + 0.04, out, L_PLANE, "sine.inOut");
  // the altimeter answers "plané": back to 10 500 — 06 h 26, the moment act 3 opens on
  st(t.plane0 + 0.05, 0.6, { alt: 10500 }, "sine.inOut");
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.plane0 + 0.05);
  tl.to("#hud-clock", { scale: 1, duration: 0.36, ease: "power2.out" }, t.plane0 + 0.35);
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
}
