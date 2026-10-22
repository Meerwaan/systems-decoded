// c1 — a placeholder: it shows the header's line moving, so a fresh long builds and plays. The architect replaces the
// chapter files (one per group of chapters, each starting with a cut to a complete state: docs/recette-long.md).
// What holds people through nine minutes (docs/recette-long-retention.md), one line each in a chapter file:
//   D.punch(D.at("beat:mot"), 0.05)         the word the chapter turns on: the lens closes and lets go (one per chapter, never on a cut)
//   threadCall(D.tl, { from, to, text })    import { threadCall } from "@kit/blocks.js" — the question left open, under the card
//                                           that follows a mid-roll (« La voisine ? Toujours sous tension. »), ≤ the card's 2.6 s
// and in episode.json → sfx: the long's grid (score in sections, chapters "film", space, ambience, boom, drop).
export default function ({ D }) {
  const { now, st, shot } = D;
  now(D.at("bravo"), { step: 1, tempOn: 1, temp: 1500 });
  st(D.at("avance"), 6, { temp: 600 });
  now(D.at("avance"), { step: 2 });
  shot(0, 12, { az: 20, d: 300 });
}
