// 03 · RENDEZ-VOUS — comment → boucle. The question of the hook comes back in two answers (duelCall: both stay lit,
// the film never answers), over your bag in your hand; the appointment on YouTube (filmTitle, the account name lights
// up: D.verdict) over the slide of 1L standing in the night at Haneda (the object of the long's first thumbnail); the
// loop: back to the first frame (D.loop: the last frame IS the first).
import { setAct } from "@kit/overlay.js";
import { duelCall, filmTitle } from "@kit/blocks.js";
import { SET, AT, VIEW, FIRST, POSE0, L03_AT } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut ON a frame

export default function fin({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    comment: "comment", commentaire: "comment:commentaire", laisses: "comment:laisses", prends: "comment:prends",
    youtube: "youtube", verdict: "verdict", toloop: "toloop", rewind: "rewind", noir: "noir",
  });
  const from = F(t.comment - 0.12);
  setAct(tl, 3, from);

  /* « Alors sois honnête, et dis-le en commentaire : ton sac… tu le laisses ? Ou tu le prends ? » */
  const BAG = { ...VIEW.bag, d: 240, shift: -160 };
  const tBag = F(D.breath("noir") + 0.5); // the black ends ON the bag (acte3's shot ends there too)
  cut(tBag, SET.CABINE, BAG, { ...AT.tokyo, you: 2, bag: 1, smoke: 0.9, floor: 1, fire: 0.6, spin: 0, doorB: 0, mark: 0, fx: 742, fy: 60, fz: 110, fs: 250 });
  now(tBag, { l03: L03_AT.comment });
  shot(tBag, F(t.youtube - 0.12) - tBag, { ...BAG, d: 205 }, "sine.inOut");
  duelCall(tl, { from: t.commentaire - 0.2, aAt: t.laisses, bAt: t.prends, to: F(t.youtube - 0.12) - 0.3, word: t.commentaire, toneA: null, toneB: null });

  /* « Le film complet de cette évacuation… notre chaîne YouTube : le lien est en bio. » — the slide standing, low */
  const tY = F(t.youtube - 0.12);
  const SLD = { ...VIEW.slideProfile, shift: -200 };
  cut(tY, SET.PISTE, SLD, { ...AT.haneda, fire: 1, smoke: 0.8, shut: 1, doorA: 1, pax: 1, gulp: 0, fx: SLD.tx, fy: 250, fz: 850, fs: 1500 });
  now(tY, { l03: -1 });
  now(t.youtube, { yt: 1 });
  shot(tY, t.toloop - tY, { ...SLD, d: 1180, az: 26 }, "sine.inOut");
  filmTitle(tl, { showAt: t.youtube + 0.2, hideAt: t.toloop - 0.35 });
  D.verdict(t.verdict);

  /* the loop: back to the slide that unrolls; between rewind and the end everything glides to FIRST */
  const back = { ...POSE0 };
  cut(t.toloop, SET.PISTE, back, {
    ...AT.haneda, l03: FIRST.l03, fils: 0, yt: 0, doorA: FIRST.doorA, doorB: 0, fire: FIRST.fire, smoke: FIRST.smoke,
    shut: FIRST.shut, pax: FIRST.pax, emerg: FIRST.emerg, mood: FIRST.mood, hot: FIRST.hot, gel: FIRST.gel,
    fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs,
  });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: back.d });
}
