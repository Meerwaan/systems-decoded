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

/**
 * Word-by-word captions. Chunks break on punctuation, on a breath, or when the line
 * gets long; the word being spoken lights up (accent colour for marked words).
 */
export function buildCaptions(container, EP, tl, { maxChars = 19, maxWords = 4 } = {}) {
  // 1. phrases: runs of words between punctuation or a breath
  const phrases = [];
  for (const beat of EP.beats) {
    let cur = [];
    beat.words.forEach((w, i) => {
      cur.push(w);
      const next = beat.words[i + 1];
      if (!next || w.p === 2 || (w.p === 1 && cur.length >= 2) || next.s - w.e > 0.3) {
        phrases.push(cur);
        cur = [];
      }
    });
  }
  // 2. a phrase too long for one line is cut into lines of similar length (never one stray word)
  const width = (words) => words.reduce((n, w) => n + w.t.length + 1, -1);
  const chunks = [];
  for (const phrase of phrases) {
    const lines = Math.max(Math.ceil(width(phrase) / maxChars), Math.ceil(phrase.length / maxWords));
    const target = width(phrase) / lines;
    let cur = [];
    for (const w of phrase) {
      const next = width([...cur, w]);
      if (cur.length && next > maxChars) {
        chunks.push(cur);
        cur = [];
      } else if (cur.length && Math.abs(width(cur) - target) < Math.abs(next - target) && lines > 1) {
        chunks.push(cur);
        cur = [];
      }
      cur.push(w);
    }
    if (cur.length) chunks.push(cur);
  }

  chunks.forEach((words, i) => {
    const start = Math.max(0, words[0].s - 0.06);
    const nextStart = chunks[i + 1] ? chunks[i + 1][0].s - 0.06 : EP.duration;
    // the last line holds to the final frame: on a loop it hands over to the first one
    const end = chunks[i + 1] ? Math.min(nextStart, words.at(-1).e + 0.5) : EP.duration;
    const cap = el("div", "cap");
    const line = el("span", "cap__line");
    cap.append(line);
    const spans = words.map((w) => {
      const span = el("span", "cap__w", w.t);
      line.append(span, " ");
      return span;
    });
    container.append(cap);

    tl.set(cap, { visibility: "visible" }, start);
    tl.fromTo(line, { scale: 0.9, y: 16 }, { scale: 1, y: 0, duration: 0.18, ease: "back.out(2.2)" }, start);
    words.forEach((w, k) => {
      tl.to(spans[k], { opacity: 1, color: TONE[w.a] ?? INK, duration: 0.07, ease: "none" }, Math.max(start, w.s - 0.03));
    });
    tl.set(cap, { visibility: "hidden" }, end);
  });
  return chunks;
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
    tl.to(span, { opacity: i + 1 === n ? 1 : 0.4, color: i + 1 === n ? INK : DIM, duration: 0.3 }, at);
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
