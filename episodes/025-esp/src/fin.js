// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
//   chute        on the bench, matched on the car straight in its lane (the same frame, from above): « ta voiture
//                ne freine pas d'abord pour ralentir » struck, « pour tourner » — the skeleton turns on its pool
//                while its front-right brake bites. The account name lights up (D.verdict)
//   commentaire  what the film owes: the moose of the hook. 1997 (archive 1, no speed in the header, rain off: a
//                test, not our night): the same frame as the first one, the moose in the boar's place; the swerve,
//                the car tips — on two wheels, frozen before it falls back. Then the bench all lit (« en série »),
//                today's road (2014), your hands on the wheel for the question
//   like         the car alone on the night road, between its two ditches
//   prochain     the stopped car, the sky over the wood: a rocket climbs, its trail breaks, a veille point comes down.
//                The LAST thing the film says; the voice does not ask to subscribe, the panel does
//   boucle       « Comme toi, face à… » — the boar in your beams, from a little further than POSE0: the road keeps
//                coming in a straight line until FIRST.gap on the last frame; the camera rides with the boar
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, MPS, SLOWMO, CAR } from "./world.js";

const V = MPS / SLOWMO; // m per film second on the road (the slowed-down story)
const zOf = (gap) => CAR.nose - 100 * gap; // where an animal stands on the road at `gap`

export default function fin({ D }) {
  const { tl, tw, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", strike: "strike", one: "one", verdict: "verdict", tocta: "tocta",
    date: "date", journalist: "journalist", avoid: "avoid", tips: "tips", stops: "stops", serie: "serie",
    since: "since", ask: "ask", before: "before", answer: "answer", tolike: "tolike", ditch: "ditch", likeEnd: "like$",
    toabo: "toabo", rocket: "rocket", lets2: "lets2", D_climb: "climb", crew: "crew", alive: "alive", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });
  const tEnd = D.tEnd;

  /* ── CHUTE — the bench, matched on the car straight in its lane (act 3 ends from above) ── */
  cut(t.toverdict, SET.BENCH, VIEW.top, { ...BENCHED, onboard: 0, kmh: 74 });
  const chute = { ...VIEW.whole, shift: -40, side: 60 }; // under the title: the skeleton in the lower half
  shot(t.toverdict + 0.05, t.one - t.toverdict - 0.05, chute, "sine.inOut", VIEW.top.d);
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.strike, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  // « Elle freine une roue… pour tourner » : the front-right bites, the whole skeleton turns right on its pool
  st(t.one, 0.35, { bFR: 1, litFR: 0.8 }, "power2.out");
  st(t.one + 0.1, t.verdict + 0.4 - t.one, { yaw: -12, aim: -12 }, "sine.inOut");
  shot(t.one, t.tocta - t.one, { ...chute, d: chute.d * 0.95, az: -20 }, "sine.inOut", chute.d);
  D.verdict(t.verdict);

  /* ── ET L'ÉLAN ? — 1997, the first frame's rhyme: the moose in the lane, the car coming at it ── */
  const gTip = -1.6; // the car's nose 1.6 m past the moose when it tips (beside it, swerved left)
  const g0 = gTip + V * (t.tips - t.tocta);
  const gAvoid = gTip + V * (t.tips - t.avoid);
  cut(t.tocta, SET.ROAD, { ...POSE0, tx: -40, ty: 95, tz: zOf(g0), d: 1750, az: -170, el: 4, fov: 34, shift: 40 },
    { ...STAGED, archive: 1, you: 0, rain: 0, moose: 1, mooseAt: 0, gap: g0, rolled: 0 });
  st(t.tocta, t.tips - t.tocta, { gap: gTip, rolled: V * (t.tips - t.tocta) }, "none");
  // a camera standing on the test track ahead of the moose, pushing in a little
  shot(t.tocta, t.avoid - 0.12 - t.tocta, { tz: zOf(gAvoid), d: 1450 }, "none");
  chip("chip-1997", null, 96, 470, t.date, t.avoid - 0.15);
  // « l'évitement d'un élan » : from the front, the car swerves left past it…
  const tipView = { tx: 40, ty: 80, tz: -120, d: 1350, az: -164, el: 5, fov: 36, shift: 110 };
  cut(t.avoid - 0.12, SET.ROAD, tipView);
  st(t.avoid, 0.35, { steer: 0.75 }, "power2.out");
  st(t.avoid, t.tips + 0.5 - t.avoid, { aim: 16 }, "sine.out");
  st(t.avoid + 0.1, t.tips + 0.5 - t.avoid - 0.1, { yaw: 18, lane: 1.9 }, "sine.inOut");
  // « Elle bascule » : on two wheels, and the time stops before it falls back
  st(t.tips, 0.8, { tip: 1 }, "power2.out");
  st(t.tips, 0.6, { gap: gTip - V * 0.3 }, "power2.out");
  shot(t.avoid - 0.1, t.serie - t.avoid, { ...tipView, d: 1200, az: -150, el: 7 }, "sine.inOut");
  chip("chip-livraisons", null, 96, 470, t.stops, t.serie - 0.15);

  /* ── « …et monte ce système en série » — the bench, everything lit at once ── */
  cut(t.serie, SET.BENCH, VIEW.whole, { ...BENCHED, archive: 1 });
  st(t.serie + 0.12, 0.3, { litEcu: 0.7, litSteer: 0.7, litYaw: 0.7, litWheels: 0.7, sense: 1 }, "power2.out");
  shot(t.serie, t.since - t.serie, { ...VIEW.whole, d: VIEW.whole.d * 0.92, az: -18 }, "sine.inOut", VIEW.whole.d);

  /* ── « Depuis 2014… » — today's road: your car straight in the night, the system alive in it ── */
  const g1 = 60;
  const today = { ...VIEW.system, d: 1750, el: 24, az: -26, shift: 60 };
  cut(t.since, SET.ROAD, today, { ...STAGED, gap: g1, rolled: 0, litEcu: 0.45, litSteer: 0.45, litYaw: 0.45, litWheels: 0.45 });
  st(t.since, t.tolike - t.since, { gap: g1 - V * (t.tolike - t.since), rolled: V * (t.tolike - t.since) }, "none");
  shot(t.since, t.ask - t.since, { ...today, d: today.d * 0.88, az: -34 }, "sine.inOut", today.d);
  chip("chip-2014", null, 96, 470, t.since, t.ask - 0.15);

  /* ── COMMENTAIRE — your hands on the wheel and its sensor ── */
  const hands = { ...VIEW.hands, d: 430, az: -46, el: 22, shift: -40 }; // you at the wheel, never the hand alone
  cut(t.ask, SET.ROAD, hands, { onboard: 1, litEcu: 0, litYaw: 0, litWheels: 0, litSteer: 0.6 });
  shot(t.ask, t.tolike - t.ask, { ...hands, d: hands.d * 0.92, az: -52 }, "sine.inOut", hands.d);
  // (2026-10-21) the question asked as a choice: each answer lights on its word, and the film never answers for
  // the viewer (the field used to type « APRÈS »: a question answered on screen kills the comment — 022)
  duelCall(tl, { from: t.ask, aAt: t.before, bAt: t.answer, to: t.tolike - 0.3, toneA: "signal", toneB: "veille" });

  /* ── LIKE — alone on the road, between its two ditches ── */
  const g2 = 40;
  const wide = { ...VIEW.wide, tx: 60, d: 2800, el: 50, az: -28, shift: -120 }; // under the like panel, left of the buttons
  cut(t.tolike, SET.ROAD, wide, { ...STAGED, gap: g2, rolled: 0, mood: 0, fx: 0, fy: 0, fz: -300, fs: 4000 });
  st(t.tolike, t.toabo - t.tolike, { gap: g2 - V * (t.toabo - t.tolike), rolled: V * (t.toabo - t.tolike) }, "none");
  shot(t.tolike, t.toabo - t.tolike, { ...wide, tx: 0, az: -34 }, "sine.inOut");
  likeCall(tl, { from: t.tolike + 0.12, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER — the stopped car, the sky over the wood: the rocket of 026 ── */
  // the top of the climb — where it breaks and where the pod falls — big UNDER the next-file panel (436–850):
  // y 4000–9000 of the trail fills 880–1500; the car is left behind the camera's back
  const sky = { tx: 250, ty: 7200, tz: -17000, d: 22080, az: 0.5, el: -12, fov: 34, shift: -240 };
  cut(t.toabo, SET.ROAD, sky, { ...STAGED, kmh: 0, lane: -0.6, gap: 40, mood: 0, fx: -400, fy: 2000, fz: -8000, fs: 9000 });
  st(t.toabo + 0.1, t.lets2 + 0.1 - t.toabo - 0.1, { rocket: 0.7 }, "power2.out");
  // the break, slow enough to be seen: from « lâche » to « montée »
  st(t.lets2 + 0.1, t.D_climb - t.lets2, { rocket: 0.8 }, "sine.inOut");
  st(t.crew, t.alive + 0.6 - t.crew, { rocket: 1 }, "sine.inOut");
  shot(t.toabo, t.toloop - t.toabo, { ...sky, d: sky.d * 0.94 }, "sine.inOut", sky.d);
  nextFile(tl, { showAt: t.toabo + 0.06, factAt: t.rocket, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE — « Comme toi, face à… » : the boar in your beams; the last frame is the first ── */
  // gap (and the wheels) keep coming in a straight line until FIRST on tEnd; the camera rides with the boar.
  const gapAt = (time) => FIRST.gap + V * (tEnd - time);
  const rolledAt = (time) => FIRST.rolled - V * (tEnd - time);
  const tzAt = (time) => POSE0.tz - 100 * (gapAt(time) - FIRST.gap);
  const fromD = POSE0.d * 1.25;
  cut(t.toloop, SET.ROAD, { ...POSE0, tz: tzAt(t.toloop), d: fromD, az: -166 }, { ...FIRST, gap: gapAt(t.toloop), rolled: rolledAt(t.toloop) });
  // D.loop glides every number left away back to FIRST (sine) from `rewind`; these straight runs start a
  // millisecond after it, so they are drawn after it and win — fromTo, so that a jump in time cannot shift their start
  const r1 = t.rewind + 0.001;
  const run = (from, to) => ({ gap: gapAt(from), rolled: rolledAt(from), to: { gap: gapAt(to), rolled: rolledAt(to) } });
  const a = run(t.toloop, r1);
  tw.fromTo(D.S, { gap: a.gap, rolled: a.rolled }, { ...a.to, duration: r1 - t.toloop, ease: "none", immediateRender: false }, t.toloop);
  tw.fromTo(D.S, { ...a.to }, { gap: FIRST.gap, rolled: FIRST.rolled, duration: tEnd - r1, ease: "none", immediateRender: false }, r1);
  shot(t.toloop, t.rewind - t.toloop, { tz: tzAt(t.rewind) }, "none");
  tw.fromTo(D.C, { tz: tzAt(r1) }, { tz: POSE0.tz, duration: tEnd - r1, ease: "none", immediateRender: false }, r1);
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD });
}
