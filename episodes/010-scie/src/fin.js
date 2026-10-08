// DOSSIER 010 — the chute, the three calls to action, the loop (`toverdict` → the end).
//   chute        under the table, where the blade now is: stopped, sunk, a block of aluminium in its teeth. One move, from
//                the whole blade to the bite; the received idea is struck on "pas", the bite ends on "bloc"
//   poubelle     the bench: the same blade, the same cartridge, bitten — each named, each lost; the light under them goes
//                down on "poubelle" and comes back veille on "sacrifie", while the camera goes to the wound
//   like · abo   the bench, a NEW kit (the signal breathing on its blade), turning slowly under the panel of the top slot
//   commentaire  what the hook left open ("son inventeur l'a testée sur son doigt"): the hook's side of the saw, the blade
//                running, a hand held over it that comes down on purpose — and, for the only time in the film, the system
//                at REAL speed: the spinning blade is gone within three frames, stopped and sunk under the table
//   boucle       you at the saw, whole; then down to the first frame, the hand sliding back to a centimetre from the teeth
// Every pose was placed by projection (the blade's rim, the cartridge, your head, your fingertip), then looked at.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, FIRST, BENCHED, STAGED, KIT } from "./world.js";

const rest = { fov: 28, roll: 0, drift: 0.3 };

/* chute — under the table (the top at 0.15, you gone: your arm would shade the blade). The blade has swung down (drop 1):
   its centre near (0, 69, −2), the block at its back (−z: the left of the picture), the cartridge behind the block */
const UNDER = {
  ...STAGED, table: 0.15, you: 0, slip: 1, flinch: 1, nick: 1, dust: 0,
  turn: 0.085, blur: 0, signal: 0, wire: 0, pawl: 1, bite: 0.72, drop: 1, mood: 0, fx: 0, fy: 68, fz: -8, fs: 30,
};
const SUNK = { tx: 0, ty: 68.5, tz: -7, d: 165, az: -58, el: -6, shift: 12, side: 40, ...rest }; // the whole blade under the title, the cartridge at its back
const BITE = { tx: 0, ty: 67, tz: -14, d: 54, az: -42, el: -10, shift: 0, side: 30 }; // the teeth in the aluminium

/* poubelle — the bench: blade and cartridge whole, the blade's top under the title (its shade carries it), the stand above
   the captions; then the wound */
const SCRAP = { tx: 0, ty: 15.4, tz: -4.2, d: 185, az: -55, el: 10, shift: 106, side: 60, ...rest };
const SCRAP_END = { az: -50 };
const WOUND = { tx: 0, ty: 10.5, tz: -8.5, d: 100, az: -44, el: 5, shift: 40, side: 20 };

/* like · abonnement — the new kit under a panel (#net ends at y ≈ 766, #next at 771): seen from above and almost square
   on, it is wider than tall — it holds between y ≈ 790 and 1245, left of TikTok's buttons */
const NEW = { tx: 0, ty: 14, tz: -5, d: 222, az: -84, el: 28, shift: -74, side: 70, ...rest };
const NEW_END = { az: -66, el: 29 }; // (past −62 the kit gets narrower than half the frame)

/* commentaire — the hook's side of the saw, from a little further than the hook: the WHOLE dome of the blade above the board
   (its vanishing is the picture) and the whole hand, the fingertip and the tooth it goes to near the middle of the frame;
   only the wrist goes under TikTok's buttons */
const FINGER = { tx: -2.5, ty: 92.5, tz: 5, d: 118, az: -64, el: 14, fov: 40, shift: 100, side: 70, roll: 0, drift: 0 };
const FINGER_ON = { d: 105 };
const HOVER = 0.2; // the hand held ≈ 8 cm above the board before it comes down
const FINGER_ASK = { d: 92, ty: 94 };

/* boucle — you at the saw, whole, under the question's panel: your head under it, your hands and the blade above the captions */
const YOU = { tx: -6, ty: 118, tz: 32, d: 600, az: -74, el: 8, shift: -5, side: 0, ...rest };
const YOU_END = { d: 560 };

export default function fin({ D, world }) {
  const { tl, st, now, shot, cut } = D;
  const { A } = world.saw;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", block: "block",
    lame: "chute:lame#2", cart: "chute:cartouche", trash: "trash", scie: "chute:scie", truth: "truth", tocta: "tocta",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:Prochain", charge: "abo:charge", aboEnd: "abo$",
    tocomment: "tocomment", finger: "finger", snap: "comment:lame$+0.08", ask: "ask", commentaire: "comment:commentaire",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── chute: "Cette lame ne ralentit PAS. Elle prend un bloc de métal dans les dents." ── */
  const tobench = t.lame - 0.13;
  cut(t.toverdict, SET.SHOP, SUNK, UNDER);
  shot(t.toverdict, tobench - 0.1 - t.toverdict, BITE, "sine.inOut", SUNK.d);
  st(t.toverdict, tobench - 0.1 - t.toverdict, { fy: 67, fz: -14, fs: 16 }, "sine.inOut");
  retitle(tl, { showAt: t.chute, strikeAt: t.pas, swapAt: t.truth, hideAt: t.tocta - 0.27 });
  D.verdict(t.pas);
  // "un bloc": the teeth finish their bite on the word (the ember where they enter flares, then cools)
  st(t.block, 0.22, { bite: 1 }, "power3.out");
  D.jolt(t.block, 0.3, 0.4);

  /* ── "Lame, cartouche : à la poubelle." — the bench: what it cost, each part on its word ── */
  cut(tobench, SET.BENCH, SCRAP, { ...BENCHED, turn: 0.085, wire: 0, pawl: 1, bite: 1 });
  shot(tobench, t.scie - 0.1 - tobench, SCRAP_END);
  D.chip("chip-lame", A.blade, 37, -161, t.lame, t.scie - 0.22);
  D.chip("chip-cart", A.cartridge, -209, 131, t.cart, t.scie - 0.22);
  st(t.trash, 0.5, { pool: 0.05, grid: 0.07 }, "power2.out");
  /* "La scie se sacrifie… pour ton doigt." — the truth takes the struck title's place; the light comes back, the camera goes to the wound */
  st(t.truth - 0.05, 0.45, { pool: 0.36, grid: 0.16 }, "power2.out");
  st(t.truth + 0.5, Math.max(0.3, t.tocta - t.truth - 0.7), { pool: 0.2 }, "sine.inOut");
  shot(t.scie - 0.1, t.tocta - t.scie, WOUND, "sine.inOut", SCRAP.d);
  st(t.scie - 0.1, t.tocta - t.scie, { fy: KIT.blade[1] - 7, fz: KIT.blade[2] - 9, fs: 12 }, "sine.inOut");

  /* ── LIKE: a new kit, alive (its signal breathing on the blade), turning slowly ── */
  cut(t.tocta, SET.BENCH, NEW, { ...BENCHED, signal: 0.6 });
  shot(t.tocta, t.tocomment - t.tocta, NEW_END, "none"); // a turntable: the same slow turn from the cut to the next one
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: it keeps turning; the next file, classified ── */
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.charge - 0.12, hideAt: t.tocomment - 0.4, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE: "Et l'inventeur ?" — the saw running, a hand on the board: his ── */
  // (`slip` 1 is where the fingertip lands; `flinch` holds the hand above the board, over the teeth: nothing slips here)
  cut(t.tocomment, SET.SHOP, FINGER, { ...STAGED, feed: FIRST.feed, slip: 1, flinch: HOVER, dust: 0.35 });
  shot(t.tocomment, t.snap - t.tocomment, FINGER_ON, "sine.inOut");
  // the hand waits over the blade while the voice sets the scene; on "posé" it comes down, on purpose, and touches as the sentence ends
  st(t.tocomment, t.finger - t.tocomment, { flinch: HOVER - 0.04 }, "sine.inOut");
  st(t.finger, t.snap - t.finger, { flinch: 0 }, "sine.inOut");
  // contact — at REAL speed: the spark of the signal at the fingertip, and the spinning blade is gone (stopped, sunk) within three frames.
  // No knock on the camera: the frame is full of level lines (the board, the rails), one of them would jump and come back
  // (the colour of the scene turns on that same frame: the threat is over at once, never half-way)
  now(t.snap, { blur: 0, dust: 0, signal: 0, wire: 0, pawl: 1, bite: 1, nick: 1, mood: 0 });
  st(t.snap, 0.1, { drop: 1 }, "power1.in");
  st(t.snap, 0.04, { circuit: 0.16, flash: 1.2 }, "power2.out");
  st(t.snap + 0.05, 0.22, { circuit: 0, flash: 0 }, "power2.out");
  // "Ça a marché." — he lifts his finger and looks at it
  st(t.snap + 0.3, t.ask - t.snap, { flinch: 0.1 }, "sine.inOut");
  shot(t.ask, t.toloop - t.ask, FINGER_ASK, "sine.inOut");
  // the question; its answer types itself on the first words of the loop
  commentCall(tl, { from: t.ask + 0.2, word: t.commentaire, typedAt: t.toloop + 0.02, chars: 6, to: t.rewind - 0.32 });

  /* ── BOUCLE: "Lui a gardé le sien." — you, at your saw, an ordinary day ── */
  cut(t.toloop, SET.SHOP, YOU, { ...STAGED, feed: 2, slip: 0.3, fx: -6, fy: 118, fz: 32, fs: 110 });
  shot(t.toloop, t.rewind - t.toloop, YOU_END);
  /* "Mais un accident de scie commence souvent comme ça…" — down to the first frame: the board goes on, the hand slides */
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: YOU_END.d });
}
