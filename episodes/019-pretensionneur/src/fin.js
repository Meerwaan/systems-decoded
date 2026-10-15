// DOSSIER 019 — the end (toverdict → the last frame). The order of 018 onward: chute → what the film still owes + the
// comment → like → the next file, LAST → the loop. Nothing of the belt comes back after the announcement.
//   chute        the bench, the retractor in glass: it plays its two moves again on the words — on "resserre" the
//                charge fires and the spool takes the slack back (the header: "Du mou" → "Tendue", T+20 ms), on "cède"
//                the camera has come down to the bar and it twists, the strap pays out. "Retient, c'est tout" is struck
//                on "retenir", "Serre, puis cède" lands on "cède" with the account name.
//   commentaire  what the hook owes ("qu'une fois"), right away: the generator, spent, close · a cut to the car, a light
//                knock: you upright, the strap tight, NO airbag out — on "remplace" the label on the pillar's foot ·
//                a pull-back to the car on its wall while the question comes back and types its answer.
//   like         the back seat, mid-shot: the one who has not buckled up, his belt hanging beside him — the camera
//                goes to him on "banquette" and stops on the hanging belt on "s'attache".
//   prochain     the bench, the retractor whole under the next file: the last thing the film says.
//   boucle       the car seen side-on, the wall still a metre away and coming at a steady speed (T−70 ms); the
//                camera dives into POSE0 and the bumper touches the wall on the very last frame — which IS the first.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, BENCHED, STAGED, FIRST, POSE0 } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — model.js's `climax` and `chute` poses, lowered under the title (#retitle ends at y ≈ 632, its shade at 840) */
const REPLAY = { ...P, tx: 0, ty: 11, tz: 1.5, d: 96, az: -50, el: 10, shift: 20 };
const REPLAY_END = { d: 90 };
const TWIST = { ...P, tx: 0, ty: 7.4, tz: 1.5, d: 52, az: -40, el: 3, shift: 20 };
const MS_SPENT = 60; // the header after the replay: ≈ T+60 ms (past 20 the clock is only an order of magnitude)

/* commentaire */
// the gas generator, spent: dark on its pool (world: the retractor turned −90°, the generator at ≈ (1.2, 9.6, 5.4))
const SPENT = { ...P, tx: 1.2, ty: 9.6, tz: 5.4, d: 34, az: -46, el: 32, shift: 60 };
const L_SPENT = { fx: 1.2, fy: 9.6, fz: 5.4, fs: 12, pool: 0.34 };
// a light knock: you upright, the strap tight, no airbag out — and the pillar's foot, where the retractor is
const KNOCK = { ...P, tx: -46, ty: 84, tz: 8, d: 350, az: -122, el: 8, fov: 38, shift: 90, side: 180 };
const L_KNOCK = { fx: -60, fy: 64, fz: 20, fs: 140 };
// the car on its wall, from three quarters rear, under #cta-field (it ends at y ≈ 615)
const WALLED = { ...P, tx: -30, ty: 80, tz: -110, d: 720, az: -66, el: 10, fov: 46, shift: -20, drift: 0 };

/* like — #net ends at y ≈ 764: the back seat under it, mid-shot */
const BACK0 = { ...P, tx: -40, ty: 88, tz: 66, d: 500, az: -86, el: 8, fov: 36, shift: -110, side: 75 };
const BACK_BELT = { ...P, tx: -50, ty: 92, tz: 112, d: 390, az: -84, el: 7, fov: 36, shift: -130, side: 60 };
const L_BACK = { fx: -50, fy: 80, fz: 100, fs: 150 };

/* prochain — #next ends at y ≈ 860: the retractor under it */
const ABO = { ...P, tx: 0, ty: 6, tz: 0, d: 112, az: -64, el: 12, shift: -40 };
const ABO_END = { ...ABO, d: 92, az: -58, shift: -80 };

/* boucle — the car side-on, the wall coming in from the left; then the dive into POSE0 */
const ARRIVE = { roll: 0, drift: 0, side: 0, tx: -40, ty: 80, tz: -180, d: 1400, az: -88, el: 5, fov: 40, shift: 120 };
const L_ARRIVE = { fx: -30, fy: 80, fz: -160, fs: 400 };
const GAP0 = 1.2; // metres: ≈ 70 ms at the tests' speed (one metre ≈ 60 ms)

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", notonly: "notonly", before: "before", verdict: "verdict", purpose: "purpose",
    tocta: "tocta", spent: "spent", meme: "comment:même-0.12", replace: "replace", ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    tolike: "tolike", like: "like", rearseat: "rearseat", unbelted: "unbelted",
    toabo: "toabo", ball: "ball", aboEnd: "abo$",
    toloop: "toloop",
  });

  /* ── CHUTE: "Voilà son secret : ta ceinture ne fait pas que te retenir. Elle se resserre avant que tu bouges… puis elle cède. Exprès." ── */
  cut(t.toverdict, SET.BENCH, REPLAY, { ...BENCHED, xray: 1, pool: 0.26 });
  shot(t.toverdict, t.before - t.toverdict, REPLAY_END, "sine.inOut");
  // "se resserre": the charge fires (the white flash, then the gas into the turbine) and the spool takes the slack back
  const fired = t.before + 1.25;
  st(t.before - 0.05, fired - t.before + 0.05, { fire: 1 }, "none");
  st(t.before + 0.12, 0.85, { slack: 0, ms: 20 }, "power2.inOut");
  // then down to the bar, which twists on "cède"
  const down = t.before + 1.35;
  shot(down, t.verdict - 0.05 - down, TWIST, "sine.inOut", REPLAY_END.d);
  st(t.verdict - 0.04, 0.95, { give: 1 }, "sine.inOut");
  st(t.verdict, t.tocta - 0.1 - t.verdict, { ms: MS_SPENT }, "none");
  retitle(tl, { showAt: t.secret, strikeAt: t.notonly, swapAt: t.verdict, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);

  /* ── COMMENTAIRE 1: "Une seule fois ? Oui. Une fois la charge partie," — the generator, spent ── */
  cut(t.tocta, SET.BENCH, SPENT, { ...BENCHED, fire: 1, slack: 0, give: 1, ms: MS_SPENT, ...L_SPENT });
  shot(t.tocta, t.meme - t.tocta, { d: 42 }, "sine.inOut");

  /* ── COMMENTAIRE 2: "même sans airbag, la ceinture se remplace." — a light knock, the bags folded away ── */
  cut(t.meme, SET.CABIN, KNOCK, { ...STAGED, crush: 0.15, slack: 0, fire: 1, bags: 0, ms: 20, mood: 0, ...L_KNOCK });
  shot(t.meme, t.ask + 0.15 - t.meme, { d: 338 }, "sine.inOut");
  // (the label is a row ≈ 930 px wide: it cannot stand beside the pillar's foot — it takes the top slot, and leaves before the question)
  chip("chip-usage", null, 70, 470, t.meme + 0.25, t.ask - 0.12);

  /* ── COMMENTAIRE 3: "En commentaire : ta voiture… elle a déjà tapé ?" — the car on its wall ── */
  shot(t.ask + 0.15, t.answer - t.ask, WALLED, "sine.inOut", KNOCK.d);
  st(t.ask + 0.15, t.answer - t.ask, { fx: -30, fy: 80, fz: -100, fs: 330 }, "sine.inOut");
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 8, to: t.tolike - 0.3 });

  /* ── LIKE: "Like : pour celui qui, sur la banquette arrière, ne s'attache pas." ── */
  cut(t.tolike, SET.CABIN, BACK0, { ...STAGED, shell: 0.6, wall: 0, crush: 0, rear: 1, slack: 0, mood: 0, ...L_BACK });
  shot(t.tolike, t.rearseat - 0.1 - t.tolike, { d: BACK0.d * 0.97 }, "none");
  shot(t.rearseat - 0.1, t.unbelted + 0.35 - t.rearseat, BACK_BELT, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.toabo - 0.3, count: 5, label: (n) => `${n} passager${n > 1 ? "s" : ""}` });

  /* ── PROCHAIN DOSSIER: "Prochain dossier : une boule d'acier de 660 tonnes, suspendue en haut d'une tour." — last ── */
  cut(t.toabo, SET.BENCH, ABO, { ...BENCHED, slack: 0, pool: 0.3 });
  shot(t.toabo, t.toloop - 0.05 - t.toabo, ABO_END, "sine.inOut", ABO.d);
  nextFile(tl, { showAt: t.toabo + 0.05, factAt: t.ball, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: "Elle aussi, elle attend son…" — the car arrives at the wall; the last frame is the first ── */
  // Everything is the first frame's but the wall, still GAP0 away, and the clock that counts down to it. The wall comes
  // at a steady speed (no ease: it must not slow down before it touches) and touches on D.tEnd; the camera dives into
  // POSE0 and settles there just before. D.loop then has nothing left to bring back.
  const settle = D.tEnd - 0.01;
  cut(t.toloop, SET.CABIN, ARRIVE, { ...STAGED, ...numbers(FIRST), gap: GAP0, ms: -60 * GAP0, ...L_ARRIVE });
  st(t.toloop, D.tEnd - t.toloop, { gap: FIRST.gap, ms: FIRST.ms }, "none");
  // the wall shot only creeps (a fast dive into POSE0 at the seam was the film's harshest move: qa 23 at 118.8 s)
  const inside = D.tEnd - 1.3;
  shot(t.toloop, inside - t.toloop, { d: ARRIVE.d * 0.96 }, "none");
  // a clean cut, 1.3 s before the contact, on POSE0 a little wider: it slides in slowly while the clock counts down
  // and the wall comes on, out of the picture
  cut(inside, SET.CABIN, { ...POSE0, d: POSE0.d * 1.08 }, { fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs });
  shot(inside, settle - inside, POSE0, "sine.inOut", POSE0.d * 1.08);
  D.loop({ at: t.toloop, rewindAt: settle, ease: "none" });
}
