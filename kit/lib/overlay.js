// 2D layer on top of the stage: captions timed on the voice, and callouts whose
// leader lines follow 3D anchors while the labels stay put (readable, no jitter).
import { BRAND } from "./brand.js";

const INK = "#e9e4d8";
const DIM = "rgba(233, 228, 216, 0.62)";
const VEILLE = "#5cffb0";
const TONE = { danger: "#ff5b2e", system: "#5cffb0" };
const NS = "http://www.w3.org/2000/svg";

const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
};

// words a caption line must not end on (French function words)
const STOP = new Set(
  (
    "le la les l un une des du de d au aux à en et ou ne n se s te t me m ce c qui que qu il elle ils elles on tu je " +
    "son sa ses ton ta tes mon ma mes leur leurs pour par sur sous dans avec sans chez plus très est es sont a as y " +
    "tout toute toutes tous si mais donc car ni"
  ).split(" "),
);
const isStop = (w) => {
  if (/\d/.test(w.t)) return false;
  const last = w.t
    .toLowerCase()
    .replace(/[…?!»«]/g, "")
    .trim()
    .split(/[\s'’-]/)
    .filter(Boolean)
    .at(-1);
  return STOP.has(last) || /^(c'est|qu'il|qu'elle|qu'un|qu'une|d'un|d'une|n'est|s'est|t'en)$/i.test(w.t);
};

/**
 * Cuts the spoken words into caption blocks of one or two lines, sentence by sentence, by cost:
 * a block never spans a sentence end or a long breath, should not end on a function word, and
 * stays on screen long enough to be read. Two lines only when that avoids one of those faults.
 * Returns blocks: [line] or [line, line], each line an array of words.
 */
export function captionBlocks(EP, { maxChars = 17, maxWords = 4, skip = [], minDur = 0.6 } = {}) {
  const width = (words) => words.reduce((n, w) => n + w.t.length + 1, -1);
  const sentences = [];
  let run = [];
  for (const w of EP.beats.filter((b) => !skip.includes(b.id)).flatMap((b) => b.words)) {
    run.push(w);
    if (w.p === 2) {
      sentences.push(run);
      run = [];
    }
  }
  if (run.length) sentences.push(run);

  const blocks = [];
  for (const words of sentences) {
    const n = words.length;
    const nextStart = (j) => (j < n ? words[j].s : words[n - 1].e + 0.5);
    // best line break inside words[i..j-1]: [cost, break index or null]
    const layout = (i, j) => {
      const line = words.slice(i, j);
      if (width(line) <= maxChars && line.length <= maxWords) return [0, null];
      let best = [Infinity, null];
      for (let k = i + 1; k < j; k++) {
        const a = words.slice(i, k);
        const b = words.slice(k, j);
        if (width(a) > maxChars || width(b) > maxChars) continue;
        let c = 1.2;
        if (isStop(a.at(-1))) c += 3;
        if (a.at(-1).p === 1) c -= 1;
        c += 0.01 * Math.pow(width(a) - width(b), 2);
        if (c < best[0]) best = [c, k];
      }
      return best;
    };
    const cost = (i, j) => {
      const [lc, k] = layout(i, j);
      if (lc === Infinity) return [Infinity, null];
      // a block does not wait half lit across a long breath
      for (let m = i; m < j - 1; m++) if (words[m + 1].s - words[m].e > 0.6) return [Infinity, null];
      const last = words[j - 1];
      const end = j === n;
      const dur = nextStart(j) - words[i].s;
      let c = 1 + lc;
      if (!end && isStop(last)) c += 6;
      if (j - i === 1 && isStop(last)) c += 8;
      if (dur < minDur) c += 50 * (minDur - dur);
      if (dur > 2.6) c += 4 * (dur - 2.6);
      if (!end && last.p === 1) c -= 2.5;
      else if (!end && words[j].s - last.e > 0.3) c -= 2;
      for (let m = i; m < j - 1; m++) {
        if (words[m].p === 1) c += 1.5;
        if (words[m + 1].s - words[m].e > 0.3) c += 1.2;
      }
      return [c, k];
    };
    const best = new Array(n + 1).fill(Infinity);
    const prev = new Array(n + 1).fill(-1);
    const brk = new Array(n + 1).fill(null);
    best[0] = 0;
    for (let j = 1; j <= n; j++) {
      for (let i = Math.max(0, j - maxWords - 2); i < j; i++) {
        const [c, k] = cost(i, j);
        if (best[i] + c < best[j]) {
          best[j] = best[i] + c;
          prev[j] = i;
          brk[j] = k;
        }
      }
    }
    const cuts = [];
    for (let j = n; j > 0; j = prev[j]) cuts.unshift([prev[j], j, brk[j]]);
    for (const [i, j, k] of cuts) blocks.push(k == null ? [words.slice(i, j)] : [words.slice(i, k), words.slice(k, j)]);
  }
  return blocks;
}

/**
 * Word-by-word captions, in blocks of one or two lines (see captionBlocks): each word comes up
 * when it is said, never before (accent colour for marked words).
 * `skip`: beats that have their own text on screen (the hook cards). `lastEnd`: when the last
 * line leaves, if not on the final frame (a film that loops hands the frame back to its first card).
 */
export function buildCaptions(container, EP, tl, { maxChars = 17, maxWords = 4, skip = [], lastEnd } = {}) {
  const blocks = captionBlocks(EP, { maxChars, maxWords, skip });
  const chunks = blocks.map((rows) => rows.flat());

  chunks.forEach((words, i) => {
    const start = Math.max(0, words[0].s - 0.06);
    const nextStart = chunks[i + 1] ? chunks[i + 1][0].s - 0.06 : EP.duration;
    // the last line holds to the final frame: on a loop it hands over to the first one
    const end = chunks[i + 1] ? Math.min(nextStart, words.at(-1).e + 0.5) : (lastEnd ?? EP.duration);
    const cap = el("div", "cap");
    const box = el("div", "cap__box");
    cap.append(box);
    const spans = [];
    for (const row of blocks[i]) {
      const line = el("span", "cap__line");
      for (const w of row) {
        const span = el("span", "cap__w", w.t);
        span.style.color = TONE[w.a] ?? INK;
        line.append(span, " ");
        spans.push(span);
      }
      box.append(line);
    }
    container.append(cap);

    tl.set(cap, { visibility: "visible" }, start);
    // A word is on screen when it is said, never before (a block that lands whole reads as a slab).
    // Each one comes up in the place the block keeps for it: the lines do not re-centre as they fill.
    words.forEach((w, k) => {
      tl.fromTo(spans[k], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: "back.out(2)" }, Math.max(start, w.s - 0.04));
    });
    tl.set(cap, { visibility: "hidden" }, end);
  });
  return chunks;
}

/**
 * The hook, as cards: one per sentence of the opening beats, larger than the captions. Like them,
 * each word comes up when it is said — the first frame carries no text, the picture has to stop
 * the thumb on its own. A sentence of one or two words ("50 km/h.")
 * becomes the small line above the next one.
 *   beats    ids of the opening beats, in order (the A, B, C of the hook)
 *   loopAt   unused (kept for the films that pass it): no text on the first frame, none to hand back
 * Returns when the last card leaves (the captions take over from there).
 */
export function buildHook(container, EP, tl, { beats, maxChars = 19, loopAt } = {}) {
  const width = (words) => words.reduce((n, w) => n + w.t.length + 1, -1);
  // 1. sentences, a very short one riding on top of the next
  const cards = [];
  let kicker = null;
  for (const id of beats) {
    const beat = EP.beats.find((b) => b.id === id);
    let cur = [];
    beat.words.forEach((w, i) => {
      cur.push(w);
      if (w.p !== 2 && i < beat.words.length - 1) return;
      if (cur.length <= 2 && i < beat.words.length - 1 && !kicker) kicker = cur;
      else {
        cards.push({ kicker, words: cur });
        kicker = null;
      }
      cur = [];
    });
  }
  // 2. up to three lines, the cheapest of all cuts: broken at a comma, never after a function
  //    word, of similar length. A line may run to maxChars + 2: the card then shrinks to fit.
  const linesOf = (words) => {
    const n = words.length;
    const wide = maxChars + 2;
    const best = Array.from({ length: n + 1 }, () => new Array(4).fill(Infinity));
    const prev = Array.from({ length: n + 1 }, () => new Array(4).fill(-1));
    best[0][0] = 0;
    const lineCost = (i, j) => {
      const chars = width(words.slice(i, j));
      if (chars > wide) return Infinity;
      const last = words[j - 1];
      let c = 0.6;
      if (j < n && isStop(last)) c += 4;
      if (j < n && last.p === 1) c -= 3;
      for (let k = i; k < j - 1; k++) if (words[k].p === 1) c += 1.5;
      if (chars > maxChars) c += 1.2 * (chars - maxChars);
      return c;
    };
    for (let j = 1; j <= n; j++)
      for (let l = 1; l <= 3; l++)
        for (let i = 0; i < j; i++) {
          const c = best[i][l - 1] + lineCost(i, j);
          if (c < best[j][l]) {
            best[j][l] = c;
            prev[j][l] = i;
          }
        }
    let pick = null;
    for (let l = 1; l <= 3; l++) {
      if (best[n][l] === Infinity) continue;
      const lines = [];
      for (let j = n, k = l; j > 0; j = prev[j][k], k--) lines.unshift(words.slice(prev[j][k], j));
      const ws = lines.map(width);
      const total = best[n][l] + 0.012 * ws.reduce((s, w) => s + Math.pow(Math.max(...ws) - w, 2), 0);
      if (!pick || total < pick.total) pick = { total, lines };
    }
    return pick ? pick.lines : [words];
  };

  const make = (card, lit) => {
    const node = el("div", "hook");
    const spans = new Map();
    const row = (words, cls, size) => {
      const line = el("div", cls);
      if (size) line.style.fontSize = size + "px";
      for (const w of words) {
        const span = el("span", "hook__w", w.t);
        if (lit) spans.set(w, span);
        line.append(span, " ");
      }
      node.append(line);
    };
    // the small line is data (mono) only when it carries a figure; otherwise it is said, like the rest
    if (card.kicker) row(card.kicker, card.kicker.some((w) => /\d/.test(w.t)) ? "hook__k" : "hook__k hook__k--say");
    const lines = linesOf(card.words);
    const longest = Math.max(...lines.map(width));
    const size = longest > maxChars ? Math.max(72, Math.floor((88 * (maxChars + 0.5)) / longest)) : 0;
    for (const line of lines) row(line, "hook__l", size);
    container.append(node);
    return { node, spans };
  };

  let leaves = 0;
  cards.forEach((card, i) => {
    const all = [...(card.kicker ?? []), ...card.words];
    const { node, spans } = make(card, true);
    const from = i === 0 ? 0 : all[0].s - 0.16;
    const to = cards[i + 1] ? [...(cards[i + 1].kicker ?? []), ...cards[i + 1].words][0].s - 0.16 : all.at(-1).e + 0.4;
    leaves = to;
    tl.set(node, { visibility: "visible" }, from);
    // like the captions: each word comes up as it is said, in the place the card keeps for it
    for (const w of all) {
      const span = spans.get(w);
      const at = Math.max(from, w.s - 0.04);
      span.style.color = TONE[w.a] ?? INK;
      tl.fromTo(span, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: "back.out(2)" }, at);
      if (w.a) tl.fromTo(span, { scale: 1 }, { scale: 1.08, duration: 0.09, ease: "power2.out", yoyo: true, repeat: 1 }, at + 0.14);
    }
    tl.to(node, { opacity: 0, y: -22, duration: 0.14, ease: "power2.in" }, to - 0.14);
    tl.set(node, { visibility: "hidden" }, to);
  });

  // `loopAt` is kept for the films that pass it: the first frame carries no text any more (the first
  // word comes with the voice), so the last one has none to hand back.
  void loopAt;
  return leaves;
}

/**
 * Callouts. `x,y` is where the leader meets the label (px); `align: "start"` puts the
 * label to the right of that point, `"end"` to the left. `anchor` is an Object3D.
 */
export function createCallouts(stage, layer, svg) {
  const items = [];
  stage.onProject(() => {
    for (const it of items) {
      const p = stage.project(it.anchor);
      const ex = it.align === "start" ? it.x - it.elbow : it.x + it.elbow;
      it.poly.setAttribute("points", `${p.x.toFixed(1)},${p.y.toFixed(1)} ${ex},${it.y} ${it.x},${it.y}`);
      it.dot.setAttribute("cx", p.x.toFixed(1));
      it.dot.setAttribute("cy", p.y.toFixed(1));
    }
  });

  return {
    add({ title, sub, x, y, align = "start", tone, anchor, elbow = 46 }) {
      const toneCls = tone === "system" ? "is-sys" : tone === "danger" ? "is-danger" : "";
      const poly = document.createElementNS(NS, "polyline");
      poly.setAttribute("pathLength", "1");
      poly.setAttribute("stroke-dasharray", "1");
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("r", "0");
      for (const node of [poly, dot]) {
        if (toneCls) node.classList.add(toneCls);
        svg.append(node);
      }

      const box = el("div", `co ${align === "end" ? "co--right" : ""} ${tone === "system" ? "co--sys" : tone === "danger" ? "co--danger" : ""}`);
      const inner = el("span", "co__in");
      inner.append(el("span", "co__t", title));
      if (sub) inner.append(el("span", "co__s", sub));
      box.append(inner);
      if (align === "end") box.style.right = `${1080 - x}px`;
      else box.style.left = `${x}px`;
      box.style.top = `${y - 1}px`;
      layer.append(box);

      const item = { poly, dot, inner, x, y, align, elbow, anchor };
      items.push(item);
      return {
        show(tl, at) {
          tl.fromTo(dot, { attr: { r: 0 }, opacity: 1 }, { attr: { r: 7 }, duration: 0.24, ease: "back.out(3)" }, at);
          tl.fromTo(poly, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.36, ease: "power2.out" }, at + 0.06);
          tl.fromTo(inner, { opacity: 0, x: align === "start" ? -20 : 20 }, { opacity: 1, x: 0, duration: 0.32, ease: "power3.out" }, at + 0.26);
          return this;
        },
        hide(tl, at) {
          tl.to([inner, poly, dot], { opacity: 0, duration: 0.24, ease: "power1.in" }, at);
          return this;
        },
      };
    },
  };
}

/** Light one act in the HUD ("01 MENACE / 02 AUTOPSIE / 03 RÉPONSE"). */
export function setAct(tl, n, at) {
  document.querySelectorAll(".hud__acts span").forEach((span, i) => {
    // at the very start the act is simply lit: a film that loops must not fade its header in again
    tl.to(span, { opacity: i + 1 === n ? 1 : 0.4, color: i + 1 === n ? INK : DIM, duration: at > 0 ? 0.3 : 0 }, at);
  });
}

/**
 * The account name sits at the right of the HUD, dim. It is also the verdict:
 * `decodedAt` is when the system gives up its secret (the name lights up),
 * `resetAt` when the film loops back to its first frame.
 */
export function brandHud(tl, { decodedAt, resetAt } = {}) {
  const els = document.querySelectorAll(".hud__brand");
  els.forEach((el) => (el.textContent = BRAND.name));
  if (decodedAt == null) return;
  tl.to(els, { color: VEILLE, duration: 0.25, ease: "power2.out" }, decodedAt);
  if (resetAt != null) tl.to(els, { color: DIM, duration: 0.3 }, resetAt);
}

/* ─────────────────────────── the three calls to action, as recurring devices ─────────────────────────── */

/** Chevrons pointing at one of TikTok's own buttons (#rail-like / #rail-comment / #rail-follow). */
export function rail(tl, id, from, to) {
  const node = document.getElementById(id);
  tl.fromTo(node, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, from);
  const beats = Math.max(1, Math.floor((to - from - 0.3) / 0.6));
  node.querySelectorAll("i").forEach((arrow, i) => {
    tl.fromTo(arrow, { opacity: 0.25 }, { opacity: 1, duration: 0.3, ease: "sine.inOut", repeat: beats * 2 - 1, yoyo: true }, from + 0.1 + i * 0.1);
  });
  tl.to(node, { opacity: 0, duration: 0.25 }, to);
}

/**
 * LIKE: twelve tiles, the first one is "TOI"; every hit lights another — the film reaching someone.
 * `hits`: [[tileIndex, time], …] · `label(n)`: the counter text once n tiles are lit.
 */
export function likeNet(tl, { showAt, hideAt, hits, label }) {
  const grid = document.getElementById("net-grid");
  const tiles = Array.from({ length: 12 }, (_, i) => {
    const tile = el("div", "tile");
    tile.innerHTML = '<i class="tile__on"></i><i class="tile__dot"></i>' + (i === 0 ? '<span class="tile__you">TOI</span>' : "");
    grid.append(tile);
    return tile;
  });
  tl.fromTo("#net", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, showAt);
  tiles.slice(1).forEach((tile) => tl.set(tile.querySelectorAll(".tile__on, .tile__dot"), { opacity: 0 }, 0));
  tl.fromTo("#net-wave", { scale: 1, opacity: 0 }, { scale: 6, duration: 1.1, ease: "power2.out", keyframes: { opacity: [0.9, 0.5, 0] } }, showAt + 0.25);
  hits.forEach(([i, at], n) => {
    const tile = tiles[i];
    tl.to(tile.querySelector(".tile__on"), { opacity: 1, duration: 0.15 }, at);
    tl.fromTo(tile.querySelector(".tile__dot"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at);
    tl.fromTo(tile, { scale: 1 }, { scale: 1.16, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, at);
    tl.set("#net-n", { textContent: label(n + 2) }, at);
  });
  tl.to("#net", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, hideAt);
}

/**
 * COMMENT: the question, and an answer that types itself. The answer is already in the markup
 * (#cta-typed, fixed-pitch); it is revealed by width, never by rewriting text.
 */
export function typeAnswer(tl, { showAt, typedAt, chars, hideAt }) {
  tl.fromTo("#cta-field", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, showAt);
  const blinks = Math.max(1, Math.floor((typedAt - showAt - 0.3) / 0.5));
  tl.fromTo("#cta-caret", { opacity: 1 }, { opacity: 0, duration: 0.25, ease: "steps(1)", repeat: blinks * 2 - 1, yoyo: true }, showAt + 0.3);
  for (let i = 1; i <= chars; i++) tl.set("#cta-typed", { width: `${i}ch` }, typedAt + (i - 1) * 0.055);
  tl.set("#cta-caret", { opacity: 1 }, typedAt);
  tl.to("#cta-field", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, hideAt);
}

export const pad2 = (n) => String(Math.floor(n)).padStart(2, "0");
