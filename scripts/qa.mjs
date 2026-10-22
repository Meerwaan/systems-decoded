// Check a rendered MP4 against the episode: is every voice clip where the schedule says, at a sane
// level — and is the picture clean from the first frame to the last (no stray frame, no shimmer)?
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { loadEpisode, schedule } from "./lib/episode.mjs";
import { decodeAudio } from "./lib/audio.mjs";
import { spawnSync } from "node:child_process";
import { extractAudio, loudness, tool } from "./lib/ffmpeg.mjs";
import { printFlicker } from "./flicker.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";
import { breathAfter, threadCues } from "./sfx.mjs";

/* ───────────── THE RHYTHM OF THE OPENING (2026-10-21) ─────────────
   The TikTok curves of 015 (the best film of the account) and 012 lose people in two places: the first second, and
   from the end of the hook to ≈ 25 s. What the renders measure there (docs/scale/3-retention-wow.md):
   · MOTION, the mean |Δ| of a frame on a small grey copy (0–255). First half-second: 015 9.8; 010, 013, 014 3.3–3.7;
     024 2.7; 025 1.4; 012 1.3. A SLOW STRETCH: two seconds or more under 1 (a held frame, a slow drift).
   · THE SOUND A PHONE PLAYS: attacks of the bed above 400 Hz (audio/bed.wav, no voice). 0 → 25 s: 010 18; 012, 013 4;
     015, 014, 024 3; 025 2 — the bed of almost every film is silent on a phone.
   · A SOUND OVER A WORD: what the bed puts on a spoken word (the voice must stay alone on its words). */
const RHYTHM_END = 25;
const EFFECT = {
  // the part of each sound that can cover a word: [start, end] in seconds, from its entry in episode.json
  hit: (x, at) => [at(x.at), at(x.at) + 0.12],
  click: (x, at) => [at(x.at), at(x.at) + 0.05],
  clack: (x, at) => [at(x.at), at(x.at) + 0.08],
  blip: (x, at) => [at(x.at), at(x.at) + 0.1],
  impact: (x, at) => [at(x.at), at(x.at) + 0.1],
  zap: (x, at) => [at(x.at), at(x.at) + (x.dur ?? 0.09)],
  tick: (x, at) => [at(x.at), at(x.at) + ((x.count ?? 1) - 1) * (x.every ?? 1) + 0.05],
  swish: (x, at) => [at(x.at) - (x.dur ?? 0.45) / 3, at(x.at) + (x.dur ?? 0.45) / 3],
  whoosh: (x, at) => [at(x.at) - (x.dur ?? 1.2) / 3, at(x.at) + (x.dur ?? 1.2) / 3],
  screech: (x, at) => [at(x.from), at(x.to)],
  suck: (x, at) => [at(x.to) - (x.dur ?? 0.7) / 2, at(x.to)],
  riser: (x, at) => [at(x.to) - (x.dur ?? 1) / 2, at(x.to)],
  // the promo's (2026-10-21): they move themselves to a breath — measured where they really land
  braam: (x, at, s) => [breathAfter(s.beats, at(x.at), 0.25), breathAfter(s.beats, at(x.at), 0.25) + 0.2],
  cliff: (x, at, s) => [breathAfter(s.beats, at(x.at), 0.05), breathAfter(s.beats, at(x.at), 0.05) + 0.1],
  threads: (x, at, s) => [].concat(x.at ?? threadCues(s.cues)).map((r) => breathAfter(s.beats, at(r), 0.08)).map((t) => [t, t + 0.06]),
};
export function rhythm(dir, mp4, ep, sched) {
  const ff = tool("ffmpeg");
  if (!ff) return null;
  const W = 72;
  const H = 128;
  const v = spawnSync(ff, ["-v", "error", "-t", String(RHYTHM_END), "-i", mp4, "-vf", `fps=30,scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
  const n = Math.floor(v.stdout.length / (W * H));
  const diff = [0];
  for (let f = 1; f < n; f++) {
    let s = 0;
    for (let i = 0; i < W * H; i++) s += Math.abs(v.stdout[f * W * H + i] - v.stdout[(f - 1) * W * H + i]);
    diff.push(s / (W * H));
  }
  const mean = (f0, f1) => diff.slice(f0, f1).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(f1, n) - f0);
  const first = mean(1, 15);
  const halves = Array.from({ length: Math.floor(n / 15) }, (_, h) => mean(Math.max(1, h * 15), h * 15 + 15));
  const slow = [];
  for (let h = 0, h0 = -1; h <= halves.length; h++) {
    if (h < halves.length && halves[h] < 1) h0 = h0 < 0 ? h : h0;
    else {
      if (h0 >= 0 && h - h0 >= 4) slow.push([h0 / 2, h / 2]);
      h0 = -1;
    }
  }
  // the bed as a phone plays it
  let attacks = null;
  const bed = path.join(dir, "audio", "bed.wav");
  if (fs.existsSync(bed)) {
    const SR = 16000;
    const a = spawnSync(ff, ["-v", "error", "-t", String(RHYTHM_END), "-i", bed, "-ac", "1", "-ar", String(SR), "-af", "highpass=f=400:poles=2,highpass=f=400:poles=2", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
    const hi = new Float32Array(a.stdout.buffer, a.stdout.byteOffset, Math.floor(a.stdout.length / 4));
    const level = (t0, t1) => {
      let e = 0;
      let k = 0;
      for (let i = Math.max(0, Math.round(t0 * SR)); i < Math.min(hi.length, Math.round(t1 * SR)); i++, k++) e += hi[i] * hi[i];
      return k ? 10 * Math.log10(e / k + 1e-12) : -120;
    };
    attacks = [];
    for (let t = 0.06; t < RHYTHM_END; t += 0.01) {
      const now = level(t, t + 0.01);
      if (now > -42 && now - level(t - 0.05, t - 0.04) > 9 && (!attacks.length || t - attacks.at(-1) > 0.15)) attacks.push(t);
    }
  }
  // what the bed puts on a word
  const at = (ref) => resolveMoment(sched.beats, sched.cues, ref);
  const words = sched.beats.flatMap((b) => b.words.map((w) => ({ ...w, beat: b.id })));
  const over = [];
  for (const x of ep.sfx ?? []) {
    const got = EFFECT[x.type]?.(x, at, sched);
    if (!got?.length) continue;
    for (const span of Array.isArray(got[0]) ? got : [got]) {
      const hitWords = words.filter((w) => w.s < span[1] - 0.02 && w.e > span[0] + 0.02);
      if (hitWords.length) over.push(`${x.type} ${span[0].toFixed(2)} s sur « ${hitWords.map((w) => w.t).join(" ")} »`);
    }
  }
  return { first, halves, slow, attacks, over };
}
export function printRhythm(r) {
  if (!r) return;
  console.log(`  rythme · les deux fuites de la courbe TikTok : la première seconde, puis la fin de l'accroche → ${RHYTHM_END} s`);
  console.log(`    première demi-seconde : mouvement ${r.first.toFixed(1)}   (015, le meilleur film : 9,8 · 010 à 014 : 3,3 à 3,7 · 012 : 1,3)`);
  console.log(`    par seconde : ${r.halves.filter((_, i) => i % 2 === 0).map((m, i) => `${i}:${m.toFixed(1)}`).join(" ")}`);
  console.log(`    plages lentes (≥ 2 s sous 1) avant ${RHYTHM_END} s : ${r.slow.length ? r.slow.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)} s`).join(", ") : "aucune"}`);
  if (r.attacks) console.log(`    attaques que joue un téléphone (habillage seul, 0 → ${RHYTHM_END} s) : ${r.attacks.length}   (010 : 18 · 015 : 3 · 025 avant le 21/10 : 2)`);
  console.log(`    sons posés sur un mot : ${r.over.length ? `${r.over.length}\n      ${r.over.join("\n      ")}` : "aucun"}`);
}

/* ───────────── THE RHYTHM OF A LONG (2026-10-21) ─────────────
   Merwan's rules for the long (CLAUDE.md, docs/recette-long.md): a new shot every 5 to 10 s, never 4 s without a visible
   move, transitions that join, a cliffhanger before each mid-roll, the right half free under the end screen. What the
   render measures (docs/scale/long-3-retention-wow.md): the 16×9 picture one second apart (a VIEW CHANGE: a cut, a fade,
   a reveal), the stretches without one, the stills, the first 30 s (YouTube's « intro »), the breath before each chapter
   card and each mid-roll (where to put the slot), the sounds on a word, the bed as a television and a laptop hear it.
   Measured on the two published longs: L01 a view every 2.4 s, longest 11 s; L02 every 5.4 s but 14 stretches over 10 s
   (228 s, the longest 34 s), its first view change at 8.9 s (L01: 1.0 s). */
const VIEW = 14; // mean |Δ| of the 16×9 signature, one second apart
const STILL = 0.35; // mean |Δ| frame to frame, under which nothing visibly moves
const LONG_EFFECT = {
  ...EFFECT,
  boom: (x, at) => [at(x.at), at(x.at) + 0.15],
  sting: (x, at) => [at(x.at), at(x.at) + 0.1],
  swell: (x, at) => [at(x.to) - Math.min(0.85, x.dur ?? 0.85) / 3, at(x.to)],
};
export function rhythmLong(dir, mp4, ep, sched) {
  const ff = tool("ffmpeg");
  if (!ff) return null;
  const W = 128;
  const H = 72;
  const P = W * H;
  const v = spawnSync(ff, ["-v", "error", "-i", mp4, "-vf", `fps=30,scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 29 });
  const px = v.stdout;
  const n = Math.floor(px.length / P);
  const fps = 30;
  const d1 = new Float32Array(n);
  const sig = new Float32Array(n * 144);
  for (let f = 0; f < n; f++) {
    let s = 0;
    for (let i = 0; i < P; i++) {
      const p = px[f * P + i];
      if (f) s += Math.abs(p - px[(f - 1) * P + i]);
      sig[f * 144 + Math.floor(Math.floor(i / W) / 8) * 16 + Math.floor((i % W) / 8)] += p / 64;
    }
    d1[f] = f ? s / P : 0;
  }
  const sd = (a, b) => {
    let s = 0;
    for (let k = 0; k < 144; k++) s += Math.abs(sig[a * 144 + k] - sig[b * 144 + k]);
    return s / 144;
  };
  // view changes: a hard cut (a one-frame spike that leaves the view changed) or the signature one second apart
  const ev = [];
  for (let f = 2; f < n - 3; f++) {
    const around = [...d1.slice(Math.max(1, f - 8), f), ...d1.slice(f + 1, f + 9)].sort((a, b) => a - b);
    if (d1[f] >= 8 && d1[f] >= 3 * around[around.length >> 1] + 3 && sd(f - 1, f + 2) >= 8) ev.push(f);
  }
  for (let f = fps; f < n; f += 3) if (sd(f, f - fps) >= VIEW) ev.push(f);
  // (a move that keeps revealing counts again every 1.5 s; two cuts closer than that, once)
  const kept = [];
  for (const f of ev.sort((a, b) => a - b)) if (!kept.length || f - kept.at(-1) > 1.5 * fps) kept.push(f);
  const views = kept.map((f) => f / fps);
  const dur = n / fps;
  const spans = [0, ...views, dur].map((t, i, a) => (i ? [a[i - 1], t] : null)).filter(Boolean);
  const longs = spans.filter(([a, b]) => b - a > 12).sort((x, y) => y[1] - y[0] - (x[1] - x[0]));
  const half = [];
  for (let h = 0; h * 15 < n; h++) half.push(d1.slice(h * 15 + 1, h * 15 + 16).reduce((a, b) => a + b, 0) / 15);
  const stills = [];
  for (let h = 0, h0 = -1; h <= half.length; h++) {
    if (h < half.length && half[h] < STILL) h0 = h0 < 0 ? h : h0;
    else {
      if (h0 >= 0 && h - h0 >= 8) stills.push([h0 / 2, h / 2]);
      h0 = -1;
    }
  }
  const chapters = sched.beats.filter((b) => b.chap).map((b, i, a) => {
    const t1 = a[i + 1]?.start ?? dur;
    const inside = views.filter((t) => t >= b.start && t < t1).length;
    const longest = Math.max(...spans.filter(([x, y]) => y > b.start && x < t1).map(([x, y]) => Math.min(y, t1) - Math.max(x, b.start)));
    return { title: b.chap, t0: b.start, t1, views: inside, longest };
  });
  const first = {
    move: d1.slice(1, 15).reduce((a, b) => a + b, 0) / 14,
    perSecond: Array.from({ length: 30 }, (_, s) => (half[2 * s] + half[2 * s + 1]) / 2),
    views: views.filter((t) => t < 30),
  };
  // the last 15 s: the right half belongs to YouTube's end screen (detail = mean |Δ| between neighbouring pixels)
  const f0 = Math.max(0, n - 15 * fps);
  const side = (x0, x1) => {
    let lum = 0;
    let det = 0;
    let k = 0;
    for (let f = f0; f < n; f += 5)
      for (let y = 0; y < H; y++)
        for (let x = x0; x < x1 - 1; x++, k++) {
          lum += px[f * P + y * W + x];
          det += Math.abs(px[f * P + y * W + x + 1] - px[f * P + y * W + x]);
        }
    return { lum: lum / k, det: det / k };
  };
  const end = { left: side(0, W / 2), right: side(W / 2, W) };
  // the sound: chapter cards and mid-rolls (the breath before them), sounds on a word, the bed
  const at = (ref) => resolveMoment(sched.beats, sched.cues, ref);
  const words = sched.beats.flatMap((b) => b.words.map((w) => ({ ...w, beat: b.id })));
  const prevEnd = (b) => sched.beats[sched.beats.indexOf(b) - 1]?.words.at(-1).e ?? 0;
  const list = ep.sfx ?? [];
  const chap = list.find((x) => x.type === "chapters");
  const lead = chap?.lead ?? 0.9;
  const cardAt = (b) => Math.max(b.start - lead, Math.min(prevEnd(b) + 0.04, b.start - 0.05));
  const cards = sched.beats.filter((b) => b.chap).slice(1).map((b) => ({ id: b.id, title: b.chap, card: b.start - lead, breath: b.start - prevEnd(b), sting: !!chap && !(chap.skip ?? []).includes(b.id) }));
  // what the bed puts on a word — the chapter stings included, as the sound grid places them
  const items = [...list];
  if (chap)
    for (const b of sched.beats.filter((x) => x.chap).slice(1)) {
      if ((chap.skip ?? []).includes(b.id)) continue;
      if (chap.style === "film") items.push({ type: "boom", at: cardAt(b) }, { type: "sting", at: cardAt(b) });
      else items.push({ type: "whoosh", at: b.start - 1.35, dur: 0.9 }, { type: "impact", at: b.start - 0.9 });
    }
  const over = [];
  for (const x of items) {
    const got = LONG_EFFECT[x.type]?.(x, at, sched);
    if (!got?.length) continue;
    for (const span of Array.isArray(got[0]) ? got : [got]) {
      const hit = words.filter((w) => w.s < span[1] - 0.02 && w.e > span[0] + 0.02);
      if (hit.length) over.push(`${x.type} ${span[0].toFixed(2)} s sur « ${hit.map((w) => w.t).join(" ")} »`);
    }
  }
  // the mid-rolls: the slot goes in the quietest 50 ms of the breath after the cliffhanger (from the render's sound)
  const SR = 8000;
  const au = spawnSync(ff, ["-v", "error", "-i", mp4, "-vn", "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  const pcm = new Float32Array(au.stdout.buffer, au.stdout.byteOffset, Math.floor(au.stdout.length / 4));
  const level = (t0, t1) => {
    let e = 0;
    let k = 0;
    for (let i = Math.max(0, Math.round(t0 * SR)); i < Math.min(pcm.length, Math.round(t1 * SR)); i++, k++) e += pcm[i] * pcm[i];
    return k ? 10 * Math.log10(e / k + 1e-12) : -120;
  };
  const mids = sched.beats
    .map((b, i) => [b, sched.beats[i + 1]])
    .filter(([b]) => b.midroll)
    .map(([b, next]) => {
      const e = b.words.at(-1).e;
      const s = next?.start ?? dur;
      let best = { t: (e + s) / 2, db: 0 };
      for (let t = e + 0.05; t < s - 0.1; t += 0.025) {
        const l = level(t, t + 0.05);
        if (l < best.db || best.db === 0) best = { t: t + 0.025, db: l };
      }
      const moving = d1.slice(Math.round(e * fps), Math.round(s * fps)).reduce((a, x) => a + x, 0) / Math.max(1, Math.round((s - e) * fps));
      return { id: b.id, end: e, next: next?.id, breath: s - e, chapter: !!next?.chap, slot: best.t, quiet: best.db, moving };
    });
  // the bed as a television, a laptop and headphones hear it
  let bed = null;
  const bedFile = path.join(dir, "audio", "bed.wav");
  if (fs.existsSync(bedFile)) {
    const st = spawnSync(ff, ["-v", "error", "-i", bedFile, "-ac", "2", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 29 });
    const x = new Float32Array(st.stdout.buffer, st.stdout.byteOffset, Math.floor(st.stdout.length / 4));
    let m = 0;
    let s = 0;
    for (let i = 0; i + 1 < x.length; i += 2) {
      m += ((x[i] + x[i + 1]) / 2) ** 2;
      s += ((x[i] - x[i + 1]) / 2) ** 2;
    }
    const hi = spawnSync(ff, ["-v", "error", "-i", bedFile, "-ac", "1", "-ar", String(SR), "-af", "highpass=f=200:poles=2,highpass=f=200:poles=2", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
    const y = new Float32Array(hi.stdout.buffer, hi.stdout.byteOffset, Math.floor(hi.stdout.length / 4));
    const lv = (t0, t1) => {
      let e = 0;
      let k = 0;
      for (let i = Math.max(0, Math.round(t0 * SR)); i < Math.min(y.length, Math.round(t1 * SR)); i++, k++) e += y[i] * y[i];
      return k ? 10 * Math.log10(e / k + 1e-12) : -120;
    };
    let attacks = 0;
    for (let t = 0.06, last = -1; t < y.length / SR; t += 0.01) {
      const now = lv(t, t + 0.01);
      if (now > -42 && now - lv(t - 0.05, t - 0.04) > 9 && t - last > 0.15) {
        attacks++;
        last = t;
      }
    }
    const music = list.find((x) => x.type === "music");
    bed = { width: 10 * Math.log10(s / (m + 1e-12) + 1e-12), attacks: attacks / (y.length / SR / 60), sections: music ? (music.width != null || music.sections != null ? "en sections" : "une boucle de quatre accords pour tout le film") : "aucune" };
  }
  return { dur, views, longs, stills, chapters, first, end, cards, over, mids, bed };
}
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
export function printRhythmLong(r) {
  if (!r) return;
  const per = r.dur / (r.views.length + 1);
  console.log(`  rythme du long · un nouveau plan toutes les 5 à 10 s, jamais 4 s sans mouvement, la rétention d'abord`);
  console.log(`    changements de vue (coupe, fondu, révélation) : ${r.views.length} · un toutes les ${per.toFixed(1)} s   (L01 : 2,4 s · L02 : 5,4 s)`);
  console.log(`    plans de plus de 12 s sans changement de vue : ${r.longs.length ? `${r.longs.length} (${r.longs.reduce((s, [a, b]) => s + b - a, 0).toFixed(0)} s) — ${r.longs.slice(0, 8).map(([a, b]) => `${mmss(a)} (${(b - a).toFixed(0)} s)`).join(", ")}` : "aucun"}`);
  console.log(`    plages ≥ 4 s sans mouvement visible : ${r.stills.length ? r.stills.map(([a, b]) => `${mmss(a)}–${mmss(b)}`).join(", ") : "aucune"}`);
  console.log(`    par chapitre (vues · plus long plan) : ${r.chapters.map((c) => `${c.title} ${c.views} · ${c.longest.toFixed(0)} s`).join(" | ")}`);
  console.log(`    les 30 premières s (l'« intro » de YouTube) : première demi-seconde, mouvement ${r.first.move.toFixed(2)} (L01 2,19 · L02 0,21) · vues à ${r.first.views.map((t) => t.toFixed(1)).join(", ") || "—"} s (L01 : 1,0 · L02 : 8,9)`);
  console.log(`      mouvement par seconde : ${r.first.perSecond.map((m, s) => `${s}:${m.toFixed(1)}`).join(" ")}`);
  const bad = r.cards.filter((c) => c.breath < 0.9);
  console.log(`    cartes de chapitre : ${r.cards.length} · souffle avant la carte ${r.cards.map((c) => c.breath.toFixed(1)).join(" ")} s${bad.length ? ` — sur des mots (moins de 0,9 s) : ${bad.map((c) => c.title).join(", ")}` : ""}`);
  for (const m of r.mids)
    console.log(`    coupure pub après « ${m.id} » : souffle ${m.breath.toFixed(2)} s${m.chapter ? ", puis une carte" : ""} · REPÈRE À POSER DANS YOUTUBE STUDIO : ${mmss(m.slot)} (${m.quiet.toFixed(0)} dB) · image ${m.moving < 1.5 ? "posée" : "en mouvement"} (${m.moving.toFixed(1)})${m.breath < 1 ? " — trop court : YouTube préfère une vraie pause" : ""}`);
  console.log(`    écran de fin (15 dernières s) : moitié droite luminance ${r.end.right.lum.toFixed(0)}, détail ${r.end.right.det.toFixed(1)} · moitié gauche ${r.end.left.lum.toFixed(0)}, ${r.end.left.det.toFixed(1)}${r.end.right.det > r.end.left.det ? " — la moitié droite est la plus chargée : les vignettes de YouTube s'y posent" : ""}`);
  console.log(`    sons posés sur un mot : ${r.over.length ? `${r.over.length}\n      ${r.over.join("\n      ")}` : "aucun"}`);
  if (r.bed) console.log(`    habillage : largeur côté/milieu ${r.bed.width.toFixed(1)} dB (mono sous −30 ; L02 publié : −43) · attaques au-dessus de 200 Hz (un portable les joue) ${r.bed.attacks.toFixed(1)} par minute · musique ${r.bed.sections}`);
}

/* ───────────── THE PROMO OF A LONG (hors-série, 2026-10-21) ─────────────
   On TikTok and Shorts a promo is judged like any short — completion, satisfaction — and HS01 and HS02 did badly
   there (Instagram apart: « ils font des stats de merde sauf insta », Merwan, 21/10). What a render says of one
   (docs/scale/promo-3-retention-wow.md, docs/recette-promo-retention.md): the seconds the film spends talking about
   itself (the launch, the call — `meta` beats, or the ids lancement / youtube), the first of them against the second
   leak of the curve (10–25 s); the threads it opens (cues fil1, fil2, … or, failing them, read off the header's
   counter) and the pieces it pays (`"paye": true` beats); the black; the call to the long (when, how long, what is
   left after it); the last five seconds (motion, the sound a phone plays, the loop: is the last frame the first?). */
const META = new Set(["lancement", "youtube"]);
export function rhythmPromo(dir, mp4, ep, sched) {
  const ff = tool("ffmpeg");
  if (!ff) return null;
  const dur = sched.duration;
  const span = (b) => [b.words[0].s, b.words.at(-1).e];
  const meta = sched.beats.filter((b, i) => (ep.beats[i]?.meta ?? META.has(b.id)) && b.words.length).map((b) => ({ id: b.id, at: span(b) }));
  const paid = sched.beats.filter((b, i) => ep.beats[i]?.paye && b.words.length).map((b) => ({ id: b.id, at: span(b)[1] }));
  const callBeat = sched.beats.find((b, i) => ep.beats[i]?.call || b.id === "youtube");
  // the picture, whole: a small grey copy (motion, black, the loop)
  const W = 72;
  const H = 128;
  const v = spawnSync(ff, ["-v", "error", "-i", mp4, "-vf", `fps=30,scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
  const n = Math.floor(v.stdout.length / (W * H));
  const px = (f, i) => v.stdout[f * W * H + i];
  const diff = [0];
  for (let f = 1; f < n; f++) {
    let s = 0;
    for (let i = 0; i < W * H; i++) s += Math.abs(px(f, i) - px(f - 1, i));
    diff.push(s / (W * H));
  }
  // black: below the header (rows 30–107 of 128: y 450–1600), nine pixels in ten under 24 (a caption may stay on it)
  const black = [];
  for (let f = 0; f < n; f++) {
    let dark = 0;
    for (let y = 30; y < 108; y++) for (let x = 0; x < W; x++) dark += px(f, y * W + x) < 24 ? 1 : 0;
    black.push(dark / (78 * W) > 0.9);
  }
  const runs = [];
  for (let f = 0, f0 = -1; f <= n; f++) {
    if (f < n && black[f]) f0 = f0 < 0 ? f : f0;
    else if (f0 >= 0) {
      runs.push([f0 / 30, f / 30]);
      f0 = -1;
    }
  }
  const blackIn = (a, b) => runs.reduce((s, [r0, r1]) => s + Math.max(0, Math.min(b, r1) - Math.max(a, r0)), 0);
  const mean = (f0, f1) => diff.slice(Math.max(1, f0), f1).reduce((a, b) => a + b, 0) / Math.max(1, Math.min(f1, n) - Math.max(1, f0));
  let loopGap = 0;
  for (let i = 0; i < W * H; i++) loopGap += Math.abs(px(n - 1, i) - px(0, i));
  loopGap /= W * H;
  // the threads: the cues fil1… — or the header's counter figure, read in the picture (red pixels that change)
  let threads = threadCues(sched.cues).map((k) => breathAfter(sched.beats, resolveMoment(sched.beats, sched.cues, k), 0.08));
  let source = "repères fil1…";
  if (!threads.length) {
    source = "lus sur le compteur de l'en-tête";
    const cw = 40;
    const ch = 36;
    const c = spawnSync(ff, ["-v", "error", "-i", mp4, "-vf", `fps=30,crop=${cw}:${ch}:962:294`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 28 });
    const m = Math.floor(c.stdout.length / (cw * ch * 3));
    const red = (f) => {
      const out = new Uint8Array(cw * ch);
      for (let i = 0; i < cw * ch; i++) {
        const o = (f * cw * ch + i) * 3;
        out[i] = c.stdout[o] > 150 && c.stdout[o + 1] < 150 && c.stdout[o] - c.stdout[o + 2] > 60 ? 1 : 0;
      }
      return out;
    };
    let prev = red(0);
    let prevOn = prev.reduce((s, p) => s + p, 0);
    for (let f = 1; f < m; f++) {
      const cur = red(f);
      let x = 0;
      let on = 0;
      for (let i = 0; i < cw * ch; i++) {
        x += cur[i] ^ prev[i];
        on += cur[i];
      }
      // a figure swapped for another (about as many red pixels before as after) — not the scene's red passing
      // behind the header on a cut or a black, nor the counter's switch to « Sur YouTube »
      const swap = x > 20 && on > 25 && prevOn > 25 && on / prevOn > 0.55 && on / prevOn < 1.8;
      if (swap && (!threads.length || f / 30 - threads.at(-1) > 0.8) && !black[Math.min(n - 1, f)] && !black[Math.max(0, f - 1)]) threads.push(f / 30);
      prev = cur;
      prevOn = on;
    }
    // the loop puts the counter back to 0: that is not a thread
    threads = threads.filter((t) => !callBeat || t < callBeat.words[0].s);
  }
  // the sound a phone plays in the last five seconds (the bed alone)
  let endAttacks = null;
  const bed = path.join(dir, "audio", "bed.wav");
  if (fs.existsSync(bed)) {
    const SR = 16000;
    const a = spawnSync(ff, ["-v", "error", "-ss", String(Math.max(0, dur - 5)), "-i", bed, "-ac", "1", "-ar", String(SR), "-af", "highpass=f=400:poles=2,highpass=f=400:poles=2", "-f", "f32le", "-"], { maxBuffer: 1 << 26 });
    const hi = new Float32Array(a.stdout.buffer, a.stdout.byteOffset, Math.floor(a.stdout.length / 4));
    const level = (t0, t1) => {
      let e = 0;
      let k = 0;
      for (let i = Math.max(0, Math.round(t0 * SR)); i < Math.min(hi.length, Math.round(t1 * SR)); i++, k++) e += hi[i] * hi[i];
      return k ? 10 * Math.log10(e / k + 1e-12) : -120;
    };
    endAttacks = 0;
    for (let t = 0.06, last = -1; t < 5; t += 0.01) {
      if (level(t, t + 0.01) > -42 && level(t, t + 0.01) - level(t - 0.05, t - 0.04) > 9 && t - last > 0.15) {
        endAttacks++;
        last = t;
      }
    }
  }
  const metaTime = meta.reduce((s, m) => s + m.at[1] - m.at[0], 0);
  return {
    dur, meta, metaTime, paid, threads, source,
    call: callBeat ? { at: callBeat.words[0].s, said: callBeat.words.at(-1).e - callBeat.words[0].s } : null,
    black: runs.reduce((s, [a, b]) => s + b - a, 0), blackEnd: blackIn(dur - 15, dur), longestBlack: runs.reduce((b, r) => (r[1] - r[0] > b[1] - b[0] ? r : b), [0, 0]),
    end: { move: mean(n - 150, n), attacks: endAttacks, loopGap },
  };
}
export function printRhythmPromo(p) {
  if (!p) return;
  const f = (x, d = 1) => x.toFixed(d).replace(".", ",");
  console.log(`  promo (hors-série) · sur TikTok et Shorts un court jugé comme les autres : complétion, satisfaction`);
  const leak = p.meta.filter((m) => m.at[0] < 25 && m.at[1] > 9);
  console.log(`    le film parle de lui-même : ${f(p.metaTime)} s (${Math.round((100 * p.metaTime) / p.dur)} %) — ${p.meta.map((m) => `${m.id} ${f(m.at[0])}–${f(m.at[1])} s`).join(", ") || "jamais"}${leak.length ? ` · DANS LA DEUXIÈME FUITE (10–25 s) : ${leak.map((m) => m.id).join(", ")}` : ""}`);
  const gaps = p.threads.slice(1).map((t, i) => t - p.threads[i]);
  console.log(`    fils ouverts : ${p.threads.length} (${p.source})${p.threads.length ? ` à ${p.threads.map((t) => f(t)).join(" · ")} s${gaps.length ? `, un toutes les ${f(gaps.reduce((a, b) => a + b, 0) / gaps.length)} s` : ""}` : ""}`);
  console.log(`    morceaux payés dans le film : ${p.paid.length ? p.paid.map((x) => `${x.id} (${f(x.at)} s)`).join(", ") : "aucun — le spectateur ne reçoit rien avant de partir sur YouTube"}`);
  console.log(`    noir : ${f(p.black)} s en tout, ${f(p.blackEnd)} s dans les 15 dernières${p.longestBlack[1] > p.longestBlack[0] ? ` (le plus long : ${f(p.longestBlack[1] - p.longestBlack[0])} s à ${f(p.longestBlack[0])} s)` : ""}   (un noir de plus d'une respiration est un pouce qui balaie)`);
  if (p.call) console.log(`    l'appel au long : à ${f(p.call.at)} s (${Math.round((100 * p.call.at) / p.dur)} % du film), dit en ${f(p.call.said)} s, puis ${f(p.dur - p.call.at - p.call.said)} s de film`);
  console.log(`    les 5 dernières s : mouvement ${f(p.end.move)} · attaques que joue un téléphone ${p.end.attacks ?? "—"} · dernière image contre la première : écart ${f(p.end.loopGap)} (0 : la boucle est parfaite)`);
}

const HOP = 0.002;
function envelope({ samples, rate }) {
  const hop = Math.round(rate * HOP);
  const out = new Float32Array(Math.floor(samples.length / hop));
  for (let i = 0; i < out.length; i++) {
    let e = 0;
    for (let k = 0; k < hop; k++) e += samples[i * hop + k] ** 2;
    out[i] = Math.sqrt(e / hop);
  }
  return out;
}

export async function qa(dir, file) {
  const ep = loadEpisode(dir);
  const sched = schedule(ep);
  const mp4 = file ?? path.join(ROOT, "renders", `${path.basename(dir)}.mp4`);
  if (!fs.existsSync(mp4)) throw new Error(`Rendu introuvable: ${mp4}`);
  // decode the audio track only: a whole MP4 is far too heavy to hand to the browser
  const track = extractAudio(mp4, path.join(os.tmpdir(), `sd-qa-${process.pid}.m4a`));
  const render = await decodeAudio(track ?? mp4);
  if (track) fs.rmSync(track, { force: true });
  const R = envelope(render);

  // The reference: the comp as one file (it sits on the film's own timeline), else the takes the slices were cut from.
  const mixFile = path.join(dir, "audio", "voix.wav");
  const mix = fs.existsSync(mixFile) ? envelope(await decodeAudio(mixFile)) : null;
  const takes = {};
  if (!mix) for (const src of new Set(sched.clips.map((c) => c.src))) takes[src] = envelope(await decodeAudio(path.join(dir, src)));

  let peak = 0;
  for (const s of render.samples) peak = Math.max(peak, Math.abs(s));
  const loud = loudness(mp4);
  console.log(
    `\n  ${path.basename(mp4)} · audio ${render.duration.toFixed(2)} s (attendu ${sched.duration}) · crête ${(20 * Math.log10(peak)).toFixed(1)} dBFS` +
      (loud ? ` · ${loud.i} LUFS · crête vraie ${loud.tp} dBTP · dynamique ${loud.lra} LU` : ""),
  );
  console.log("\n  clip   attendu   décalage   corrélation");
  let worst = 0;
  let weakest = 1;
  sched.clips.forEach((clip, i) => {
    const from = mix ? clip.at : clip.from;
    const seg = (mix ?? takes[clip.src]).subarray(Math.round(from / HOP), Math.round((from + clip.length) / HOP));
    const at = Math.round(clip.at / HOP);
    let best = { lag: 0, c: -1 };
    for (let lag = -250; lag <= 250; lag++) {
      let ab = 0, aa = 0, bb = 0;
      for (let k = 0; k < seg.length; k += 2) {
        const r = R[at + lag + k] ?? 0;
        ab += seg[k] * r;
        aa += seg[k] * seg[k];
        bb += r * r;
      }
      const c = ab / Math.sqrt(aa * bb + 1e-12);
      if (c > best.c) best = { lag, c };
    }
    worst = Math.max(worst, Math.abs(best.lag * HOP));
    weakest = Math.min(weakest, best.c);
    console.log(`  vo-${String(i).padEnd(3)} ${clip.at.toFixed(2).padStart(7)}s  ${(best.lag * HOP * 1000).toFixed(0).padStart(6)} ms   ${best.c.toFixed(3)}   prise ${clip.seed}`);
  });
  const ok = worst <= 0.05 && weakest > 0.5;
  console.log(
    `\n  ${ok ? `✓ voix calée (écart max ${(worst * 1000).toFixed(0)} ms)` : worst > 0.05 ? `✗ voix décalée de ${(worst * 1000).toFixed(0)} ms au pire — à vérifier` : "✗ une tranche de voix est méconnaissable dans le rendu — à vérifier"}\n`,
  );
  // the picture: no stray frame, no shimmer
  const smooth = printFlicker(mp4);
  console.log("");
  // the rhythm of the opening: what holds people through the two leaks of the curve (a measure, not a verdict)
  const rhythmOf = sched.duration < 240 ? rhythm(dir, mp4, ep, sched) : rhythmLong(dir, mp4, ep, sched); // (the long has its own pace)
  if (sched.duration < 240) printRhythm(rhythmOf);
  else printRhythmLong(rhythmOf);
  if (rhythmOf) console.log("");
  // a promo of a long (hors-série): what keeps a trailer watched to the end on a short-video platform
  const promo = ep.serie === "hors-serie" && sched.duration < 240 ? rhythmPromo(dir, mp4, ep, sched) : null;
  if (promo) {
    printRhythmPromo(promo);
    console.log("");
  }
  return { ok, worst, loud, smooth, rhythm: rhythmOf, promo };
}
