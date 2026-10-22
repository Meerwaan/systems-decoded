// DOSSIER 021 — the chute, what the film still owes, like, the next file — and the loop (toverdict → the end).
//   chute        the bench, the system whole: « Elle surveille : le conducteur » comes on "secret", struck on "pas";
//                the dial waits, veille, slowly emptying — on "quelqu'un a bougé" the glass boot presses the pedal and
//                the ring fills at once: « Un geste ». The account name lights up on "bougé".
//   commentaire  the dial alone, close: on "minute" it starts to empty; on "s'assoupit" its blind spot is drawn, and the
//                ring's head passes over it on "elle ne le voit pas" — nothing rings, the ring stays veille · a cut to the
//                desk in the stopped cab: on "surveillent" the speed display lights veille (TVM, COVIT) · a cut under the
//                desk: the pedal, while the question types its answer
//   like         the stopped train from high and in front: on "centaines" the passengers light up, trailer by trailer
//   prochain     you at your window, through the glass: on "téléphone" your screen lights up. The panel carries the
//                subscription; nothing of the subject comes back after it
//   boucle       the night, the nose, a little further than the first frame, the train at speed again: `run` files in a
//                straight line and lands on FIRST.run on the last frame; on "partout" the camera comes back to POSE0
//                (by ratio). The cut puts every number back to FIRST, so D.loop has nothing left to glide — its
//                rewind is set on the last frame and the move to POSE0 is written here (a glide of `run` would make
//                the world slow down and stop before the hook starts it at full speed).
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, MPS } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — the title ends at y ≈ 640: the heart of the system (the dial on the box, the pedal under it) stands under
   it, between y ≈ 660 and 1170; the desk's glass tray, above, stays under the title's shade */
const WHOLE = { ...P, tx: -32, ty: 96, tz: 8, d: 430, az: -40, el: 16, shift: -40 };
const WHOLE_END = { d: 410, az: -32 };
// the pedal, the boot and the dial in ONE frame (the dial on the box's +z face, the pedal below it to the right)
const GESTURE = { ...P, tx: -32, ty: 96, tz: 8, d: 340, az: -28, el: 14, shift: -60 };
const GESTURE_END = { d: 325, az: -26 };

/* commentaire */
const DIAL = { ...VIEW.dial, d: 150, shift: 40 }; // the ring between the chip (ends y ≈ 520) and the captions (1248)
const DIAL_END = { d: 142, az: -16 };
// the desk from behind the empty seat and above (el 30: the track ahead, through the windscreen, stays at the top,
// faint): the speed display in the middle, the keys and the bell on the desk
const DESK = { ...P, tx: -810, ty: 250, tz: 0, d: 290, az: 70, el: 30, fov: 36, shift: 0 };
const DESK_END = { d: 275 };
// the pedal under the desk, big, under the comment field (which ends at y ≈ 610)
const PEDAL = { ...VIEW.pedal, d: 165 };
const PEDAL_END = { d: 150 };

/* like / prochain */
// the stopped train from high, front-left, under the like panel (which ends at y ≈ 755)
const TRAIN = { ...P, tx: 2400, ty: 250, tz: 0, d: 5000, az: -40, el: 16, fov: 34, shift: -200 };
const TRAIN_END = { d: 4700, az: -37 };
// you at your window, through the glass, the first rows lit around you: your head just under the next file (≈ 840),
// never a close-up of the glass body
const YOU = { ...P, tx: 1900, ty: 320, tz: 100, d: 600, az: -50, el: 8, fov: 34, shift: -170 };
const YOU_END = { d: 560 };

/* boucle — the nose at night, from POSE0's side, a little further */
const AWAY = { ...POSE0, d: 1300, az: -56 };
const AWAY_MID = { d: 1240 };

/** The train once it is stopped: no current, the brakes holding (veille), the relay open, the dial fed again. */
const HALTED = { kmh: 0, traction: 0, brake: 1, cut: 1, vent: 0, count: 1, danger: 0, bell: 0, mood: 0 };

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", strike: "strike", sleep: "sleep", one: "one", verdict: "verdict",
    tocta: "tocta", minute2: "minute2", doze: "doze", unseen: "unseen",
    others: "others", watch: "comment:surveillent", speed: "speed", ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    tolike: "tolike", hundreds: "hundreds", likeEnd: "like$",
    toabo: "toabo", battery: "battery", phone: "abo:téléphone", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: "Voilà son secret : elle ne surveille pas le conducteur. Elle ne sait pas s'il dort. Elle sait une seule
     chose… quelqu'un a bougé." ── */
  cut(t.toverdict, SET.BENCH, WHOLE, { ...BENCHED, kmh: 0 });
  shot(t.toverdict, t.sleep - t.toverdict, WHOLE_END, "sine.inOut");
  // the dial waits, veille: it empties slowly, nobody feeds it
  st(t.toverdict + 0.3, t.verdict - t.toverdict - 0.3, { count: 0.42 }, "none");
  // "Elle ne sait pas s'il dort…" — the camera comes down to the pedal and the dial
  shot(t.sleep, t.one + 0.2 - t.sleep, GESTURE, "sine.inOut", WHOLE_END.d);
  shot(t.one + 0.2, t.tocta - t.one - 0.2, GESTURE_END, "sine.inOut");
  // "…quelqu'un a bougé": the boot comes and presses the pedal, down on "bougé" — and the ring fills at once
  st(t.one + 0.4, t.verdict - t.one - 0.4, { foot: 1 }, "sine.inOut");
  st(t.verdict - 0.35, 0.35, { pedal: 1 }, "power2.in");
  st(t.verdict, 0.16, { count: 1 }, "power3.out");
  // the boot lifts and leaves before the cut
  st(t.verdict + 0.4, t.tocta - 0.1 - t.verdict - 0.4, { foot: 0, pedal: 0 }, "sine.inOut");
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.strike, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);

  /* ── COMMENTAIRE 1: "Son angle mort ? La minute. Un conducteur qui s'assoupit quelques secondes… elle ne le voit pas." ── */
  cut(t.tocta, SET.BENCH, DIAL, { ...BENCHED, kmh: 0, count: 1 });
  shot(t.tocta, t.others - t.tocta, DIAL_END, "sine.inOut");
  // on "minute" the ring starts to empty; its head (at 1 − count, clockwise from noon) passes over the blind spot
  // (0.21 … 0.29 of the turn) on "elle ne le voit pas" — nothing rings, it stays veille
  const over = t.unseen + 0.5; // the head in the middle of the wedge
  const rate = 0.25 / (over - t.minute2);
  st(t.minute2, t.others - t.minute2, { count: 1 - rate * (t.others - t.minute2) }, "none");
  st(t.doze, 0.5, { blind: 1 }, "sine.out");
  chip("chip-angle", null, 96, 470, t.minute2, t.others - 0.25);

  /* ── COMMENTAIRE 2: "Pour ça, d'autres systèmes surveillent la vitesse." — the stopped cab, its desk ── */
  cut(t.others, SET.LINE, DESK, { ...STAGED, ...HALTED, cab: 1, fx: DESK.tx, fy: DESK.ty, fz: 0, fs: 150 });
  shot(t.others, t.ask - t.others, DESK_END, "sine.inOut");
  st(t.watch, 0.35, { display: 1 }, "power2.out");
  chip("chip-vitesse", null, 96, 470, t.others + 0.05, t.ask - 0.15);

  /* ── COMMENTAIRE 3: "En commentaire : cette pédale, tu connaissais ?" — under the desk, the pedal ── */
  cut(t.ask, SET.LINE, PEDAL, { ...STAGED, ...HALTED, display: 1, litPedal: 0.6, fx: PEDAL.tx, fy: PEDAL.ty, fz: 0, fs: 120 });
  shot(t.ask, t.tolike - t.ask, PEDAL_END, "sine.inOut");
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 3, to: t.tolike - 0.3 });

  /* ── LIKE: "Like. Pour celles et ceux qui conduisent, seuls, des centaines de passagers." — the stopped train ── */
  cut(t.tolike, SET.LINE, TRAIN, { ...STAGED, ...HALTED, pax: 0.3, fx: TRAIN.tx, fy: TRAIN.ty, fz: 0, fs: 4000 });
  shot(t.tolike, t.toabo - t.tolike, TRAIN_END, "sine.inOut");
  st(t.hundreds, 0.9, { pax: 1 }, "sine.inOut");
  likeCall(tl, { from: t.tolike + 0.12, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });

  /* ── PROCHAIN DOSSIER: "Prochain dossier : la batterie de ton téléphone. Entre ses deux pôles… un film de plastique,
     plus fin qu'un cheveu." — you at your window; the last thing the film announces ── */
  cut(t.toabo, SET.LINE, YOU, { ...STAGED, ...HALTED, pax: 0.4, you: 1, phone: 0, fx: YOU.tx, fy: YOU.ty, fz: YOU.tz, fs: 250 });
  shot(t.toabo, t.toloop - t.toabo, YOU_END, "sine.inOut");
  st(t.phone, 0.4, { phone: 1 }, "power2.out");
  nextFile(tl, { showAt: t.toabo + 0.06, factAt: t.battery, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: "Et lui, tu l'emportes partout. Même dans…" — the night, the nose, at speed again ── */
  const end = D.tEnd;
  cut(t.toloop, SET.LINE, AWAY, { ...STAGED, ...numbers(FIRST), run: FIRST.run - MPS * (end - t.toloop) });
  st(t.toloop, end - t.toloop, { run: FIRST.run }, "none");
  shot(t.toloop, t.rewind - t.toloop, AWAY_MID, "sine.inOut", AWAY.d);
  shot(t.rewind, end - t.rewind, POSE0, "sine.inOut", AWAY_MID.d);
  D.loop({ at: t.toloop, rewindAt: end });
}
