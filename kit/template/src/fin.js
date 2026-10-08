// La chute, les trois appels à l'action, le rebouclage.
//   chute        the received idea, struck and corrected (retitle) — the account name lights up (D.verdict)
//   like         its reason comes from the story · abonnement: the next file, one fact as bait, no unsourced figure
//   commentaire  the question of the hook's C comes back, answered in a word
//   boucle       the last sentence is unfinished and ends on the first words of the hook; the last frame IS the first
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST } from "./world.js";

export default function fin({ D }) {
  const { tl, shot, cut } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", inverse: "chute:l'inverse", tocta: "tocta",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:prochain", aboEnd: "abo$",
    comment: "comment", commentaire: "comment:commentaire", savais: "comment:savais", toloop: "toloop", rewind: "rewind",
  });

  /* chute — on the bench, the heart: what the film left as a question */
  cut(t.toverdict, SET.BENCH, { ...VIEW.whole, d: 60, az: -52 }, { ...BENCHED, heart: 1.2 });
  shot(t.toverdict, t.tocta - t.toverdict, { d: 52, az: -44 }, "sine.inOut");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.inverse - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);

  /* LIKE — the system whole again, turning slowly */
  cut(t.tocta, SET.BENCH, VIEW.whole, BENCHED);
  shot(t.tocta, t.abo - 0.2 - t.tocta, { az: -26 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ABONNEMENT — the next file, classified */
  shot(t.abo - 0.2, t.comment - t.abo, { d: 96, az: -12, shift: -110 }, "sine.inOut");
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.comment - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* COMMENTAIRE — the question of the hook, paid */
  shot(t.comment - 0.1, t.toloop - t.comment, { d: 70, az: -34, shift: 40 }, "sine.inOut");
  commentCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, typedAt: t.savais, chars: 7, to: t.toloop - 0.3 });

  /* rebouclage — back in the scene, close; then the camera returns to the first frame */
  cut(t.toloop, SET.SCENE, VIEW.system, { ...STAGED, threat: FIRST.threat, heart: FIRST.heart, mood: FIRST.mood, fs: 9 });
  shot(t.toloop, t.rewind - t.toloop, { d: 70, az: -32 }, "sine.inOut");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: 70 });
}
