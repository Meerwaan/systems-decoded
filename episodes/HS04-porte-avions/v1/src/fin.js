// 03 · RENDEZ-VOUS — comment → boucle (51,9 → 66,1 s).
//   comment  out of the black, your dog from his front, his hands (#duel in the top slot: « Ses gestes » ou « Un cri »,
//            each lit on its word — the film never answers: the dog never waves off)
//   youtube  the whole Rafale in profile, at full power, low in the frame: the long's name in the top slot (filmTitle),
//            the account's name lights up on « chaîne » (D.verdict), the counter says where the answers are
//   boucle   « Et demain matin, sur cette catapulte… » — back behind the tail, gliding to POSE0 / FIRST
import { setAct } from "@kit/overlay.js";
import { duelCall, filmTitle } from "@kit/blocks.js";
import { SET, AT, VIEW, FIRST, POSE0, L04_AT, NG, DOG } from "./world.js";

export default function fin({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    comment: "comment", gestes: "comment:gestes", cri: "comment:cri", commentaire: "comment:commentaire", commentEnd: "comment$",
    youtube: "youtube", verdict: "verdict", toloop: "toloop", rewind: "rewind",
  });
  const after = D.breath("test$") + 0.6; // the black of D.cliff ends here
  setAct(tl, 3, after);

  /* comment — your dog, low in the frame (#duel owns the top slot) */
  const dogLow = { ...VIEW.dogFront, d: 520, az: 20, shift: -60 };
  cut(after, SET.PONT, dogLow, {
    ...AT.deck, gas: 1, tremble: 1, jbd: 1, strain: 1, hooked: 1, held: 1, dog: 1, crew: 0.6, parked: 0.6, sig: 1, vest: 0.6, mood: 1, hot: 0.12,
    under: 0, ship: 1, press: 0.3, valve: 0, named: 0, l04: L04_AT.chef, fx: DOG[0], fy: 150, fz: DOG[2], fs: 700,
  });
  now(t.gestes - 0.2, { sig: 2 });
  now(t.gestes + 0.5, { sig: 3 });
  st(t.cri - 0.1, 0.35, { vest: 1 }, "sine.out");
  const ytAt = Math.round((t.youtube - 0.12) * 30) / 30;
  shot(after, ytAt - after, { ...dogLow, d: 470, az: 14 });
  duelCall(tl, { from: t.comment + 0.1, aAt: t.gestes, bAt: t.cri, to: ytAt - 0.3, word: t.commentaire });

  /* youtube — the whole Rafale, low; the long's name over it */
  const low = { ...VIEW.hurl, d: 1500, az: 20, shift: -230 };
  cut(ytAt, null, low, { vest: 0.35, sig: 3, l04: -1, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200 });
  shot(ytAt, t.toloop - ytAt, { ...low, d: 1350, az: 15 }, "sine.inOut");
  now(t.youtube, { yt: 1 });
  filmTitle(tl, { showAt: t.youtube + 0.2, hideAt: t.toloop - 0.35 });
  D.verdict(t.verdict);

  /* the loop: behind the tail; between rewind and the end everything glides to FIRST */
  const back = { ...POSE0, d: 1700, el: 10 };
  cut(t.toloop, SET.PONT, back, {
    ...AT.deck, gas: 1, tremble: 1, jbd: 1, strain: 1, hooked: 1, held: 1, dog: 1, crew: 0.6, parked: 0.6, sig: FIRST.sig, vest: FIRST.vest,
    l04: FIRST.l04, fils: 0, yt: 0, mood: FIRST.mood, gel: FIRST.gel, hot: FIRST.hot, pool: FIRST.pool, grid: FIRST.grid,
    press: FIRST.press, tank: FIRST.tank, named: FIRST.named, fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs,
  });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: back.d });
}
