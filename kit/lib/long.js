// The long format (YouTube, 16:9): what the page shows instead of the word-by-word captions of the shorts.
//   · chapter cards — one per beat that opens a chapter (`chap` in episode.json), a little before its first word:
//     they are YouTube's chapters, and the sting under them hides the seam between two voice requests
//   · keywords — the marked words of the script (*signal*, +veille+), each shown when it is said, one at a time
//   · the header's readouts: the step of the line (ÉTAPE 03 / 08, a row of ticks) and the temperature of the glass
// The words themselves go in the .srt (npm run srt), never on the picture.
const INK = "#e9e4d8";
const TONE = { danger: "#ff5b2e", system: "#5cffb0" };

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};

/** The chapters of the film: [{ n, id, title, start (first word), at (card in) }] — the first one is the opening, no card. */
export function chaptersOf(EP, lead = 0.9) {
  return EP.beats
    .filter((b) => b.chap)
    .map((b, n) => ({ n, id: b.id, title: b.chap, start: b.start, at: n === 0 ? 0 : Math.max(0, b.start - lead) }));
}

/**
 * The cards. Each one comes in `lead` s before the chapter's first word and holds `hold` s; `kicker(n)` gives
 * its small line, `sub(chapter)` an optional line under the rule (a station: "Étape 03 / 08"). Returns the chapters.
 */
export function buildChapters(container, EP, tl, { lead = 0.9, hold = 2.6, skip = [], kicker = () => "Chapitre", sub = () => "" } = {}) {
  const list = chaptersOf(EP, lead);
  for (const c of list) {
    if (c.n === 0 || skip.includes(c.id)) continue;
    const node = el("div", "chap");
    const inner = el("div", "chap__in");
    const k = el("div", "chap__k");
    k.append(el("i"), el("span", null, kicker(c.n)));
    const num = el("div", "chap__n", String(c.n).padStart(2, "0"));
    const title = el("div", "chap__t", c.title);
    const rule = el("div", "chap__rule");
    inner.append(k, num, title, rule);
    const s = sub(c);
    if (s) inner.append(el("div", "chap__s", s));
    node.append(inner);
    container.append(node);
    // a card has left before the next one comes, however close two chapters are
    const next = list[c.n + 1];
    const out = Math.min(c.at + hold, next ? next.at - 0.05 : Infinity);
    tl.set(node, { visibility: "visible" }, c.at);
    tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, c.at);
    tl.fromTo(num, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: "power3.out", immediateRender: false }, c.at + 0.05);
    tl.fromTo(title, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, c.at + 0.12);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power3.inOut", immediateRender: false }, c.at + 0.18);
    tl.to(node, { opacity: 0, x: -30, duration: 0.3, ease: "power2.in" }, out - 0.3);
    tl.set(node, { visibility: "hidden" }, out);
  }
  return list;
}

/**
 * The keywords: the runs of marked words (`a` = danger | system), one at a time, bottom left. A keyword comes in
 * with its first word and leaves when the next one comes, after `hold` s at most, never over a chapter card.
 * `skip`: beat ids whose marks stay off the picture (the chapter shows something better there).
 */
export function buildKeywords(container, EP, tl, { hold = 2.6, skip = [], quiet = [] } = {}) {
  const runs = [];
  for (const beat of EP.beats) {
    if (skip.includes(beat.id)) continue;
    let cur = null;
    beat.words.forEach((w) => {
      if (w.a && cur && cur.tone === w.a) cur.words.push(w);
      else if (w.a) runs.push((cur = { tone: w.a, words: [w] }));
      else cur = null;
    });
  }
  const busy = quiet.slice().sort((a, b) => a[0] - b[0]); // [from, to] where nothing may show (cards, a big title)
  runs.forEach((r, i) => {
    const from = r.words[0].s - 0.05;
    let to = Math.min(r.words.at(-1).e + hold, (runs[i + 1]?.words[0].s ?? Infinity) - 0.12);
    const clash = busy.find(([a, b]) => from < b && to > a);
    if (clash && from >= clash[0]) return;
    if (clash) to = Math.min(to, clash[0] - 0.05);
    if (to - from < 0.5) return;
    const node = el("div", "kw");
    node.style.color = TONE[r.tone] ?? INK;
    const t = el("span", "kw__t", r.words.map((w) => w.t).join(" ").replace(/[…?!]+$/u, ""));
    const rule = el("span", "kw__rule");
    node.append(t, rule);
    container.append(node);
    tl.set(node, { visibility: "visible" }, from);
    tl.fromTo(t, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, ease: "back.out(1.8)", immediateRender: false }, from);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.out", immediateRender: false }, from + 0.08);
    tl.to(node, { opacity: 0, duration: 0.18 }, to - 0.18);
    tl.set(node, { visibility: "hidden" }, to);
  });
  return runs.length;
}

/** "1 500 °C" — the temperature as the header shows it (rounded to a readable step). */
export function fmtTemp(c) {
  const r = Math.abs(c) >= 200 ? Math.round(c / 10) * 10 : Math.round(c);
  const s = String(Math.abs(r)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${r < 0 ? "−" : ""}${s} °C`;
}

/** The temperature's colour: the glass glows (signal) above ~450 °C, is plain (ink) below. */
export const tempTone = (c) => (c >= 450 ? TONE.danger : INK);

/**
 * The header's line of steps: `steps` names, `step(time)` → the step on screen (0 = off the line). Writes
 * #hud-step-n, #hud-step-t and the ticks of #hud-line, every frame (only when they change).
 */
export function lineHud(stage, { steps, step, temp }) {
  const $ = (id) => document.getElementById(id);
  const n = $("hud-step-n");
  const t = $("hud-step-t");
  const v = $("hud-temp-v");
  const line = $("hud-line");
  const ticks = steps.map(() => line.appendChild(el("i")));
  let last = null;
  let lastT = null;
  stage.onProject((time) => {
    const k = step(time);
    if (k !== last) {
      last = k;
      n.textContent = k > 0 ? `Étape ${String(k).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}` : "Hors chaîne";
      t.textContent = k > 0 ? steps[k - 1] : "";
      ticks.forEach((i, j) => (i.className = j + 1 === k ? "is-on" : j + 1 < k ? "is-done" : ""));
    }
    const c = temp(time);
    const text = c == null ? "—" : fmtTemp(c);
    if (text !== lastT) {
      lastT = text;
      v.textContent = text;
      v.style.color = c == null ? INK : tempTone(c);
    }
  });
}

/**
 * A figure of the dossier (#facts): a small line, a big value, an optional line under it. One at a time on a
 * side, from `from` to `to`. `tone`: "veille" | "signal" | null (ink). `side`: "left" | "right". `top` in px.
 * Returns the element (its value can be rewritten by a readout: give it an `id`).
 */
export function fact(tl, { id, k = "", v = "", s = "", tone = null, side = "left", top = 250, from, to }) {
  const node = el("div", `fact${tone ? ` is-${tone}` : ""}${side === "right" ? " fact--right" : ""}`);
  if (id) node.id = id;
  node.style.top = `${top}px`;
  if (k) node.append(el("div", "fact__k", k));
  const val = el("div", "fact__v", v);
  if (id) val.id = `${id}-v`;
  node.append(val);
  if (s) node.append(el("div", "fact__s", s));
  document.getElementById("facts").append(node);
  tl.fromTo(node, { opacity: 0, x: side === "right" ? 30 : -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out", immediateRender: false }, from);
  tl.to(node, { opacity: 0, duration: 0.22, ease: "power2.in" }, to - 0.22);
  return node;
}

/** A chip (#chips), styled `.chip .chip--live`, coloured by `color` (a token: "ink" | "veille" | "signal"). Place it with D.chip(id, …). */
export function chipEl(id, { label = "", value = "", color = "ink" } = {}) {
  const node = el("div", "chip chip--live");
  node.id = id;
  node.style.color = `var(--${color})`;
  node.style.opacity = "0";
  if (label) node.append(el("span", null, label));
  if (value) node.append(el("b", null, value));
  document.getElementById("chips").append(node);
  return node;
}
