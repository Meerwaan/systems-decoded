// The long format's words, off the picture: a subtitle file drawn from the real timing of the voice, and the
// chapters of the description (YouTube reads "00:00 Title" lines: the first at 00:00, each at least 10 s long).
//   npm run srt -- L01     → renders/<dossier>.srt, and post.youtube.description filled from descriptionTemplate
// A cue: one sentence, cut into blocks of two lines of 42 characters at most, never longer than 6 s on screen.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { loadEpisode, schedule } from "./lib/episode.mjs";
// (the same rule as kit/lib/long.js → chaptersOf, which the page runs)
const chaptersOf = (sched, lead = 0.9) => sched.beats.filter((b) => b.chap).map((b, n) => ({ n, title: b.chap, at: n === 0 ? 0 : Math.max(0, b.start - lead) }));

const LINE = 42;
const stamp = (t) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const p = (n, k = 2) => String(n).padStart(k, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const clock = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const width = (ws) => ws.reduce((n, w) => n + w.t.length + 1, -1);

/** Two lines as even as possible, broken after a comma when one is near the middle. */
function twoLines(ws) {
  if (width(ws) <= LINE) return [ws.map((w) => w.t).join(" ")];
  let best = null;
  for (let i = 1; i < ws.length; i++) {
    const a = ws.slice(0, i);
    const b = ws.slice(i);
    if (width(a) > LINE || width(b) > LINE) continue;
    const cost = Math.abs(width(a) - width(b)) - (a.at(-1).p ? 12 : 0);
    if (!best || cost < best.cost) best = { cost, lines: [a, b] };
  }
  return (best?.lines ?? [ws]).map((l) => l.map((w) => w.t).join(" "));
}

export function srt(dir) {
  const ep = loadEpisode(dir);
  const sched = schedule(ep);
  if (sched.estimated) throw new Error("Pas de voix montée : le .srt se tire des instants réels (npm run voice d'abord).");
  // the words as written (with their punctuation), on the times of the voice
  const words = sched.beats.flatMap((b, i) => b.words.map((w, k) => ({ ...w, t: ep.beats[i].tokens[k]?.d?.trim() || w.t })));
  // sentences, then blocks that fit two lines and 6 s
  const blocks = [];
  let cur = [];
  const flush = () => cur.length && (blocks.push(cur), (cur = []));
  for (const w of words) {
    const next = [...cur, w];
    const tooLong = width(next) > 2 * LINE - 4 || (cur.length && w.e - cur[0].s > 6);
    const breath = cur.length && w.s - cur.at(-1).e > 0.7;
    if (cur.length && (tooLong || breath)) flush();
    cur.push(w);
    if (w.p === 2) flush();
  }
  flush();
  const cues = blocks.map((b, i) => {
    const from = b[0].s;
    const to = Math.min(b.at(-1).e + 0.35, (blocks[i + 1]?.[0].s ?? Infinity) - 0.04);
    return `${i + 1}\n${stamp(from)} --> ${stamp(Math.max(to, from + 0.8))}\n${twoLines(b).join("\n")}\n`;
  });
  const out = path.join(ROOT, "renders", `${path.basename(dir)}.srt`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, cues.join("\n"));

  // the chapters of the description: the card comes 0.9 s before the first word, the chapter starts with it
  const chapters = chaptersOf(sched).map((c) => `${clock(c.n === 0 ? 0 : Math.floor(c.at))} ${c.title}`);
  const file = path.join(dir, "episode.json");
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const yt = raw.post?.youtube;
  if (yt) {
    yt.descriptionTemplate ??= yt.description;
    if (yt.descriptionTemplate.includes("__CHAPITRES__")) {
      yt.description = yt.descriptionTemplate.replace("__CHAPITRES__", chapters.join("\n"));
      yt.chapters = chapters;
      fs.writeFileSync(file, JSON.stringify(raw, null, 2) + "\n");
    }
  }
  console.log(`\n  sous-titres : ${cues.length} → ${path.relative(ROOT, out)}\n  chapitres :\n    ${chapters.join("\n    ")}\n`);
  return { out, chapters };
}
