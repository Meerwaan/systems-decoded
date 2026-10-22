// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
//   chute        the received idea, struck and corrected (retitle) — the account name lights up (D.verdict)
//   commentaire  what the film still owes: the question of the hook's C, answered. Right after the fall, nothing in between
//   like         its reason comes from the story
//   prochain     the next file, one fact as bait, no unsourced figure — the LAST thing the film says. Nothing of the
//                current subject comes back after it: placed before the answer (001–017), it read as the end of the
//                film and viewers left without it (comments under 015, October 2026). The voice does not ask to
//                subscribe again (it did, once, at the threshold): the panel carries it
//   boucle       the tail of that announcement: an unfinished half-sentence, two seconds at most, no new fact,
//                that lands on the first words of the hook; the last frame IS the first
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, commentCall, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST } from "./world.js";

export default function fin({ D }) {
  const { tl, shot, cut } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", inverse: "chute:l'inverse", tocta: "tocta",
    comment: "comment", commentaire: "comment:commentaire", savais: "comment:savais",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:prochain", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* chute — on the bench, the heart: what the film left as a question */
  cut(t.toverdict, SET.BENCH, { ...VIEW.whole, d: 60, az: -52 }, { ...BENCHED, heart: 1.2 });
  shot(t.toverdict, t.tocta - t.toverdict, { d: 52, az: -44 }, "sine.inOut");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.inverse - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);

  /* COMMENTAIRE — the question of the hook, paid: the system whole again, turning slowly */
  cut(t.tocta, SET.BENCH, VIEW.whole, BENCHED);
  shot(t.tocta, t.like - 0.2 - t.tocta, { d: 70, az: -34 }, "sine.inOut");
  commentCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, typedAt: t.savais, chars: 7, to: t.like - 0.3 });
  // …the field types the answer the FILM owes (the C of the hook). A question put to the VIEWER is never answered on
  // screen: if it is a choice the voice says (« d'avant… ou d'après ? »), ask it as a duel — each answer lights on its
  // word (two cues), the caret waits under « À toi » (the #duel markup is in index.html):
  // duelCall(tl, { from: t.commentaire - 0.5, aAt: t.reponseA, bAt: t.reponseB, to: t.like - 0.3, toneA: "signal", toneB: "veille" });
  void duelCall;

  /* LIKE */
  shot(t.like - 0.2, t.abo - t.like, { d: 74, az: -26 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* PROCHAIN DOSSIER — classified, and last: it stays until the loop */
  shot(t.abo - 0.2, t.toloop - t.abo, { d: 96, az: -12, shift: -110 }, "sine.inOut");
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* rebouclage — back in the scene, close; then the camera returns to the first frame */
  cut(t.toloop, SET.SCENE, VIEW.system, { ...STAGED, threat: FIRST.threat, heart: FIRST.heart, mood: FIRST.mood, fs: 9 });
  shot(t.toloop, t.rewind - t.toloop, { d: 70, az: -32 }, "sine.inOut");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: 70 });
}
