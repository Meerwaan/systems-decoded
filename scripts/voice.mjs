// Voice-over, recorded like a dubbing session: a few takes of the whole script (ElevenLabs),
// every phrase of every take measured against the direction written in the script, and the film
// keeps — phrase by phrase — the recording that played it best. A phrase that still sounds wrong
// is retaken alone, with its neighbours for context, instead of paying for a whole new session.
// The numbers only sort and warn: the last word belongs to the ear (the booth of `npm run front`).
//
// Credits are someone's money: nothing is ever recorded without a budget on the command line.
import fs from "node:fs";
import path from "node:path";
import { elevenKey } from "./lib/env.mjs";
import { loadEpisode, scriptHash, beatHash, beatHashes, directions, alignTokens, schedule, hashOf, core, acts, stabilityOf } from "./lib/episode.mjs";
import { decodeAudio, trackPitch, prosodyReport } from "./lib/audio.mjs";
import { masterVoice, assemble, joinAudio, excerpt, tool } from "./lib/ffmpeg.mjs";
import { creditRate, spendGuard } from "./credits.mjs";

const API = "https://api.elevenlabs.io/v1";
const ANALYSIS = 4; // bump when what is stored next to a recording changes
const DEFAULT_TAKES = 1; // whole takes for a new script — one per film since 018 (three takes of a phrase differ by 0.7 st)
const RETAKES = 3; // recordings of one phrase when it is retaken alone
const SWITCH = 0.7; // what a change of recording must earn: phrases stay together unless one is clearly better elsewhere
const WHOLE = 6; // a recording of at least this many phrases is a "take"; shorter, a retake
// fader: dB under (or over) the usual level that are left alone, share of the rest given back (or taken off), ceilings
const RIDE = { margin: 2, slope: 0.6, max: 3.5, over: 2.5, down: 3 };

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};
const rel = (dir, file) => path.relative(dir, file).split(path.sep).join("/");
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : 0;
};
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const letters = (beat) => beat.tokens.reduce((n, t) => n + t.s.replace(/[^\p{L}\p{N}]/gu, "").length, 0);

/* ---------------------------------------------------------------- recording */

async function synthesize(ep, text, seed, stability = ep.voice.stability) {
  const v = ep.voice;
  const body = {
    text,
    model_id: v.model,
    seed,
    voice_settings: { stability, similarity_boost: v.similarity, speed: v.speed },
  };
  const res = await fetch(`${API}/text-to-speech/${v.voiceId}/with-timestamps?output_format=${v.format ?? "mp3_44100_128"}`, {
    method: "POST",
    headers: { "xi-api-key": elevenKey(), "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const cost = Number(res.headers.get("character-cost") ?? 0);
  const json = await res.json();
  return { audio: Buffer.from(json.audio_base64, "base64"), alignment: json.alignment, cost };
}

export function tagSpans(alignment) {
  const text = alignment.characters.join("");
  return [...text.matchAll(/\[[^\]]+\]/g)].map((m) => ({
    text: m[0],
    start: alignment.character_start_times_seconds[m.index],
    end: alignment.character_end_times_seconds[m.index + m[0].length - 1],
  }));
}

/* ---------------------------------------------------------------- the direction, as the script writes it */

const MOODS = [
  { key: "grave", label: "grave", re: /\b(ominous|grave|low|dark|menacing)\b/ },
  { key: "tendu", label: "tendu", re: /\b(tense|urgent|nervous|anxious|rushed|breathless|fast|alarmed)\b/ },
  { key: "climax", label: "climax", re: /\b(dramatic|shouts?|shouting|excited|intense)\b/ },
  { key: "pose", label: "posé", re: /\b(slowly|slow|calm|thoughtful|soft|softly)\b/ },
  { key: "murmure", label: "murmuré", re: /\b(whispers?|whispering|quietly)\b/ },
];

/** What a beat's "vo" line asks of the actor. */
export function direction(beat) {
  const vo = (beat.vo ?? "").trim();
  const tags = [...vo.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1].toLowerCase());
  const bare = vo.replace(/\[[^\]]+\]/g, " ").trim();
  const lead = /^\s*\[([^\]]+)\]/.exec(vo)?.[1].toLowerCase() ?? "";
  const mood = MOODS.find((m) => m.re.test(lead));
  // a pause asked for inside the phrase (not the silence that follows it anyway)
  const inner = vo.replace(/(\s|\[[^\]]+\]|\.\.\.|…|[.!?])+$/u, "");
  const stress = [...bare.matchAll(/(?<![\p{L}\p{N}])\p{Lu}{2,}(?![\p{L}\p{N}])/gu)].map((m) => core(m[0]));
  return {
    tags,
    mood: mood?.key ?? "neutre",
    label: mood?.label ?? (lead || "neutre"),
    pause: /\[[^\]]*pause[^\]]*\]|\.\.\.|…/.test(inner),
    stress,
    ending: /\?\s*$/.test(bare) ? "question" : /(\.\.\.|…)\s*$/.test(bare) ? "suspendu" : "ferme",
  };
}

/* ---------------------------------------------------------------- the recordings on disk
   audio/takes/<script hash>/take-<seed>.mp3   a take of the whole script, as it was when recorded
   audio/takes/reprises/<phrase>-<n>.mp3       one phrase retaken, with the phrase before and after
   next to each: .json (words, per-phrase fingerprints, pitch track), .wav (mastered), cut/ (booth excerpts)
   A recording is good for a phrase as long as that phrase is still the one it was recorded for. */

function pool(dir, ep) {
  const root = path.join(dir, "audio", "takes");
  const current = scriptHash(ep);
  const now = Object.fromEntries(ep.beats.map((b) => [b.id, beatHashes(ep, b)])); // a phrase may be directed several ways
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const folder of fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)) {
    for (const name of fs.readdirSync(path.join(root, folder)).filter((n) => n.endsWith(".json")).sort()) {
      const base = name.slice(0, -5);
      const mp3 = path.join(root, folder, `${base}.mp3`);
      const metaFile = path.join(root, folder, name);
      const meta = readJson(metaFile);
      if (!meta?.words || !fs.existsSync(mp3)) continue;
      // sessions recorded before phrases were tracked one by one: only the one of today's script can be trusted
      if (!meta.hashes) {
        if (folder !== current) continue;
        meta.order = ep.beats.map((b) => b.id);
        meta.hashes = Object.fromEntries(ep.beats.map((b) => [b.id, now[b.id][0]]));
      }
      const reprise = folder === "reprises";
      out.push({
        id: reprise ? base.replace(/-(\d+)$/, "~$1") : `${folder.slice(0, 4)}.${meta.seed}`,
        reprise,
        target: [meta.target ?? []].flat(),
        folder,
        base,
        mp3,
        wav: path.join(root, folder, `${base}.wav`),
        metaFile,
        meta,
        good: new Set(meta.order.filter((id) => now[id]?.includes(meta.hashes[id]))),
        made: fs.statSync(mp3).mtimeMs,
      });
    }
  }
  // in the order they were recorded: "Prise 1" stays "Prise 1"
  return out.sort((a, b) => a.made - b.made || a.id.localeCompare(b.id));
}

/* ---------------------------------------------------------------- measuring one recording */

/** Where to cut between two phrases: the quietest instant of the silence, preferably near its middle. */
function quietest(frames, a, b, from = a) {
  // A gap the alignment squeezes under a quarter of a second may be misplaced: eleven_v4_turbo's word ends come
  // ≈ 0.1 s late (HS02: the true silence sat 0.1–0.2 s before the gap, and a hold cut into the next phrase's first
  // word). So look back into the last word, never before it starts, and a little past the next word's start.
  if (b - a < 0.25) [a, b] = [Math.max(from, a - 0.35), b + 0.05];
  const mid = (a + b) / 2;
  if (b - a < 0.12) return mid;
  const half = (b - a) / 2;
  let best = { t: mid, cost: Infinity };
  for (let i = 1; i < frames.length - 1; i++) {
    const t = frames[i].t;
    if (t < a + 0.04 || t > b - 0.04) continue;
    const db = (frames[i - 1].db + frames[i].db + frames[i + 1].db) / 3;
    const cost = db + 5 * ((t - mid) / half) ** 2;
    if (cost < best.cost) best = { t, cost };
  }
  return best.t;
}

function analyse(ep, rec) {
  const { order, words, tags, duration } = rec.meta;
  const frames = unpack(rec.meta.frames);
  const round = (x) => Math.round(x * 1000) / 1000;
  const bounds = [round(Math.max(0, words[order[0]][0].s - 0.15))];
  for (let k = 1; k < order.length; k++) bounds.push(round(quietest(frames, words[order[k - 1]].at(-1).e, words[order[k]][0].s, words[order[k - 1]].at(-1).s)));
  bounds.push(round(Math.min(duration, words[order.at(-1)].at(-1).e + 0.5)));
  const cuts = Object.fromEntries(order.map((id, k) => [id, [bounds[k], bounds[k + 1]]]));

  const segments = ep.beats
    .filter((b) => rec.good.has(b.id))
    .map((b) => {
      const w = words[b.id];
      // the words the script writes in CAPS (a token can hold several: "trois cents")
      const todo = [...direction({ vo: rec.meta.vo?.[b.id] ?? b.vo }).stress]; // as that recording was directed
      const marks = [];
      b.tokens.forEach((tok, k) => {
        const hits = core(tok.s).split(/[\s'-]+/).filter((part) => todo.includes(part));
        if (!hits.length) return;
        for (const hit of hits) todo.splice(todo.indexOf(hit), 1);
        marks.push({ key: core(tok.s), start: w[k].s, end: w[k].e });
      });
      return { id: b.id, start: w[0].s, end: w.at(-1).e, letters: letters(b), marks };
    });
  const qa = prosodyReport(frames, segments, tags ?? []);
  // a tag read aloud belongs to the phrase it falls in
  for (const seg of qa.segments) seg.spokenTag = qa.tags.some((t) => t.spoken && t.start >= cuts[seg.id][0] && t.start < cuts[seg.id][1]);
  return { qa, cuts };
}

/** Level of each phrase while it is spoken, in dBFS: { beatId: dB }. */
function phraseLevels({ samples, rate }, words) {
  const win = Math.round(rate * 0.02);
  const out = {};
  for (const [id, w] of Object.entries(words)) {
    const from = Math.max(0, Math.round(w[0].s * rate));
    const to = Math.min(samples.length, Math.round(w.at(-1).e * rate));
    let sum = 0;
    let n = 0;
    for (let i = from; i + win <= to; i += win) {
      let e = 0;
      for (let k = 0; k < win; k++) e += samples[i + k] * samples[i + k];
      e /= win;
      if (e > 1e-5) {
        sum += e; // only while a sound is being made (above −50 dBFS)
        n++;
      }
    }
    out[id] = Math.round(10 * Math.log10(n ? sum / n : 1e-9) * 10) / 10;
  }
  return out;
}

const pack = (frames) => ({ t0: frames[0]?.t ?? 0, db: frames.map((f) => Math.round(f.db * 10) / 10), f0: frames.map((f) => Math.round(f.f0 * 10) / 10) });
const unpack = (p) => p.db.map((db, i) => ({ t: p.t0 + i * 0.01, db, f0: p.f0[i] }));

/* ---------------------------------------------------------------- judging a phrase */

const PENALTY = {
  "balise prononcée": 4,
  "durée anormale": 2,
  "pause trop longue": 1.5,
  plate: 1.2,
  "pas assez grave": 1,
  "pas assez tendu": 1,
  "climax timide": 1,
  "trop pressé": 1,
  "pas murmuré": 1,
  crié: 1.6,
  "très grave": 0.8,
  "silence dans l'accroche": 0.8,
  "pause non jouée": 0.5,
  "accent manqué": 0.5,
  "question qui tombe": 0.4,
  "fin qui retombe": 0.4,
  "« on l'ouvre » traîne": 1.5,
};

// "Alors… on l'ouvre", the account's signature: in 005 to 017 (one request, right after the tense scene) it lasts
// 1.06 to 1.36 s at 10.5 to 15.9 l/s — offhand, sure of itself. In 018 to 020, where it opened the autopsy's own
// request, it dragged to 1.7 s at 7.5 l/s and viewers heard a narrator who no longer wanted to open anything.
const SIGNATURE = /on l.ouvre/i;
const isSignature = (b) => SIGNATURE.test(b.text ?? b.vo ?? "");

/**
 * Score one phrase of one recording (higher = better played) and list what an ear should check.
 * `ref`: the usual rate and level of the takes — a phrase is fast or loud against them.
 * `seconds`: how long the other recordings needed for the same phrase (an outlier is often a stumble).
 */
function judge(dir, seg, ref, seconds, first, signature) {
  const flags = [];
  const rate = seg.rate - ref.rate;
  const level = seg.db - ref.db;
  let score = Math.min(seg.spread, 4.5); // intonation that moves

  if (dir.mood === "grave") {
    score += clamp(-seg.register / 3, -0.6, 0.6);
    if (seg.register > 1) flags.push("pas assez grave");
  } else if (dir.mood === "tendu") {
    score += clamp(rate / 4, -0.5, 0.5) + clamp((seg.register + 1) / 4, -0.4, 0.4);
    if (rate < -2.5 && seg.register < -1.5) flags.push("pas assez tendu");
  } else if (dir.mood === "climax") {
    score += clamp(level / 4, -0.6, 0.8) + clamp(seg.register / 4, -0.4, 0.6);
    if (level < 1 && seg.register < 0.5) flags.push("climax timide");
  } else if (dir.mood === "pose") {
    score += clamp(-rate / 4, -0.5, 0.5);
    if (rate > 3) flags.push("trop pressé");
  } else if (dir.mood === "murmure") {
    if (level > -2) flags.push("pas murmuré");
  }

  if (dir.mood !== "murmure" && seg.spread < 1.6) flags.push("plate");
  // far below the narrator's register the voice goes breathy and intimate — Merwan heard it as flirting (002, "promesse")
  if (dir.mood !== "murmure" && seg.register < -5) flags.push("très grave");
  // loud is fine, shouting is not: Merwan heard the hook of 002 (+5.5 dB, "[dramatic]" with a "!") as yelling in the viewer's ears
  if (level > 4.2) flags.push("crié");
  if (seg.pause > 1.1) flags.push("pause trop longue");
  else if (first && seg.pause > 0.7) flags.push("silence dans l'accroche"); // the first seconds decide whether the viewer stays
  if (dir.pause && seg.pause < 0.2) flags.push("pause non jouée");
  if (seconds && Math.abs(seg.seconds - seconds) / seconds > 0.2) flags.push("durée anormale");
  if (seg.marks.some((m) => m.level < 0.8 && m.pitch < 1.5)) flags.push("accent manqué");
  if (dir.ending === "question" && seg.tail < -1.5) flags.push("question qui tombe");
  if (dir.ending === "suspendu" && seg.tail < -2.5) flags.push("fin qui retombe");
  if (seg.spokenTag) flags.push("balise prononcée");
  if (signature && (seg.seconds > 1.5 || seg.rate < 9.5)) flags.push("« on l'ouvre » traîne");

  for (const f of flags) score -= PENALTY[f] ?? 0;
  return { score: Math.round(score * 100) / 100, flags };
}

/**
 * The best path through the recordings: the sum of the scores, minus SWITCH at every cut.
 * Two phrases that follow each other inside the same recording are not a cut.
 */
function compose(beats, candidates, score, follows, forced = {}) {
  const allowed = (b) => (forced[b.id] != null && candidates[b.id].includes(forced[b.id]) ? [forced[b.id]] : candidates[b.id]);
  let layer = Object.fromEntries(allowed(beats[0]).map((r) => [r, { total: score(beats[0].id, r), path: [r] }]));
  for (let i = 1; i < beats.length; i++) {
    const next = {};
    for (const r of allowed(beats[i])) {
      let best = null;
      for (const [p, node] of Object.entries(layer)) {
        const total = node.total - (p === r && follows(r, beats[i - 1].id, beats[i].id) ? 0 : SWITCH);
        if (!best || total > best.total) best = { total, path: node.path };
      }
      next[r] = { total: best.total + score(beats[i].id, r), path: [...best.path, r] };
    }
    layer = next;
  }
  const end = Object.values(layer).sort((a, b) => b.total - a.total)[0];
  return Object.fromEntries(beats.map((b, i) => [b.id, end.path[i]]));
}

/* ---------------------------------------------------------------- the tension curve
   A film is three acts and each asks something else of the voice: the menace presses, the autopsy
   settles and shows, the response is the peak, then the fall lands. Melody inside the phrases is not
   enough: a narrator who moves well but plays every act in the same register, at the same level and
   at the same pace is heard as one tone from end to end (the viewers of October: "soporific", on films
   this sheet called "très joué"). So the acts are measured against each other. */

const ACTS = [
  { key: "menace", label: "01 MENACE" },
  { key: "autopsie", label: "02 AUTOPSIE" },
  { key: "reponse", label: "03 RÉPONSE" },
  { key: "fin", label: "CHUTE · CTA" },
];
// what is heard, alone, as another tone: a semitone and a half up, 2 dB louder, 10 % faster
const STEP = { register: 1.5, level: 2, rate: 10 };
// under this spread between the phrases (semitones, dB), the whole film sits on one tone: 002–004 were at 2.2–2.6 dt
// and 2–2.9 dB, the films the viewers found soporific at 0.8–1.2 dt and 0.9–1.6 dB
const FLAT = { register: 1.5, level: 1.8 };

/**
 * How the comp plays each act, against the film's own average.
 * `rows`: one per phrase, { id, register (semitones), level (dB), rate (letters/s), seconds }.
 * Three readings: how far the phrases sit from one another (`spread`), how far act 3 climbs above the
 * autopsy (`step`: 1 = one tone higher, heard as such) and where the most tense phrase of the film is.
 */
export function tensionArc(ep, rows) {
  const act = acts(ep);
  const weight = (r) => Math.max(0.5, r.seconds ?? 1);
  const mean = (list, key) => list.reduce((a, r) => a + r[key] * weight(r), 0) / (list.reduce((a, r) => a + weight(r), 0) || 1);
  const sd = (list, key) => Math.sqrt(list.reduce((a, r) => a + (r[key] - mean(list, key)) ** 2 * weight(r), 0) / (list.reduce((a, r) => a + weight(r), 0) || 1));
  const film = { register: mean(rows, "register"), level: mean(rows, "level"), rate: mean(rows, "rate") || 1 };
  const read = (list) => ({ register: mean(list, "register") - film.register, level: mean(list, "level") - film.level, rate: 100 * (mean(list, "rate") / film.rate - 1) });
  const round = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "number" ? Math.round(v * 100) / 100 : v]));
  const perAct = ACTS.map((a) => ({ ...a, list: rows.filter((r) => act[r.id] === a.key) }))
    .filter((a) => a.list.length)
    .map(({ list, ...a }) => ({ ...a, phrases: list.length, ...read(list) }));
  const rest = perAct.find((a) => a.key === "autopsie");
  const top = perAct.find((a) => a.key === "reponse");
  const step = rest && top ? Math.max(...Object.keys(STEP).map((k) => (top[k] - rest[k]) / STEP[k])) : 0;
  // the most tense phrase: register and level only (the rate of a three-word phrase means nothing)
  const peak = rows.map((r) => ({ id: r.id, act: act[r.id], ...read([r]) })).sort((a, b) => b.register / STEP.register + b.level / STEP.level - a.register / STEP.register - a.level / STEP.level)[0];
  const spread = { register: sd(rows, "register"), level: sd(rows, "level") };
  const flat = spread.register < FLAT.register && spread.level < FLAT.level;
  const misplaced = peak && peak.act !== "reponse" && peak.act !== "menace";
  return {
    acts: perAct.map(round),
    spread: round(spread),
    step: Math.round(step * 100) / 100,
    peak: peak && round(peak),
    verdict: flat ? "MÊME TON PARTOUT" : step < 1 || misplaced ? "relief incomplet" : "en relief",
    why: [
      flat && `d'une phrase à l'autre la voix ne bouge que de ${spread.register.toFixed(1)} dt et ${spread.level.toFixed(1)} dB (il en faut ${FLAT.register} ou ${FLAT.level})`,
      step < 1 && `l'acte 3 ne monte pas au-dessus de l'autopsie (il lui faut +${STEP.register} dt, +${STEP.level} dB ou +${STEP.rate} % de débit)`,
      misplaced && `la phrase la plus tendue du film est « ${peak.id} » (${ACTS.find((a) => a.key === peak.act).label}), pas dans la menace ni la réponse`,
    ].filter(Boolean),
  };
}

/* ---------------------------------------------------------------- the one voice file of the film */

/**
 * The comp, laid on the film's timeline as a single file (audio/voix.wav) — what the film plays
 * and what the booth lets you hear. Rebuilt only when the schedule or a recording changed.
 * Returns its path relative to the episode, or null (no ffmpeg, no voice): the film then plays the slices themselves.
 */
export function mixVoice(dir, sched) {
  if (sched.estimated || !sched.clips.length || !tool("ffmpeg")) return null;
  const files = sched.clips.map((c) => path.join(dir, c.src));
  if (!files.every((f) => fs.existsSync(f))) return null;
  const out = path.join(dir, "audio", "voix.wav");
  const meta = path.join(dir, "audio", "voix.json");
  const stamp = hashOf(JSON.stringify(sched.clips) + files.map((f) => `${fs.statSync(f).size}:${Math.round(fs.statSync(f).mtimeMs)}`).join("|"));
  if (readJson(meta)?.stamp === stamp && fs.existsSync(out)) return "audio/voix.wav";
  if (!assemble(sched.clips.map((c, i) => ({ file: files[i], from: c.from, length: c.length, at: c.at, gain: c.gain })), out)) return null;
  fs.writeFileSync(meta, JSON.stringify({ stamp, clips: sched.clips.length }));
  return "audio/voix.wav";
}

/* ---------------------------------------------------------------- the session */

const verdict = (sd) => (sd < 2 ? "MONOTONE" : sd < 2.8 ? "plat" : sd < 3.6 ? "vivant" : "très joué");
const signed = (x, d = 1) => `${x >= 0 ? "+" : ""}${x.toFixed(d)}`;

/** The ear's choices (audio/picks.json): { picks: { phrase: recording }, notes: { phrase: "…" } }. */
export function readPicks(dir) {
  const saved = readJson(path.join(dir, "audio", "picks.json")) ?? {};
  return { picks: saved.picks ?? {}, notes: saved.notes ?? {} };
}

/**
 * Measure, comp, write audio/vo.json and audio/voix.wav — and record what is missing, if a budget allows it.
 *   takes    whole takes the current script must have (a new script asks for 3)
 *   retake   phrases to record again on their own, `count` times each (default 3)
 *   alone    retakes without the phrase before and the phrase after: an act played in its own request
 *   budget   credits this run may spend. Without it nothing is recorded: the cost is announced instead.
 *   solo     use this one recording everywhere it can be used
 *   pick     { phrase: recording } forced for this run, on top of audio/picks.json
 */
export async function voice(dir, { takes, retake = [], count = RETAKES, alone = false, budget = 0, seed, solo, pick = {}, quiet = false } = {}) {
  const say = quiet ? () => {} : (line = "") => console.log(line);
  const ep = loadEpisode(dir);
  const hash = scriptHash(ep);
  const base = seed ?? ep.voice.seed ?? 21;
  const root = path.join(dir, "audio", "takes");
  const index = Object.fromEntries(ep.beats.map((b, i) => [b.id, i]));
  for (const id of retake) if (!(id in index)) throw new Error(`--retake: phrase inconnue "${id}" (phrases: ${ep.beats.map((b) => b.id).join(", ")})`);

  // 1. what is on disk, and what is missing
  let recs = pool(dir, ep);
  const covered = (id) => recs.some((r) => r.good.has(id));
  const wholeHere = recs.filter((r) => r.folder === hash).map((r) => r.meta.seed);
  const plan = [];
  // phrases with no recording any more (new script, or their direction or words changed since the takes)
  const orphans = ep.beats.filter((b) => !covered(b.id)).map((b) => b.id);
  // a few orphans are retaken alone; past a third of the script, whole takes cost less and play better
  const wantWhole = takes ?? (orphans.length > ep.beats.length / 3 ? DEFAULT_TAKES : 0);
  // A film whose voice has "acts" is recorded act by act: one request per act, joined into one take.
  // Heard and measured on the bench of 2026-10-13: played in its own short request an act keeps the
  // register its direction asks for, where a 90-second request lets the narrator settle on one low tone.
  // A long film (more than ElevenLabs takes in one request) names in `voice.parts` the phrases where a new request
  // starts — at a chapter card, where a change of breath goes unheard. Its pieces are levelled at the join.
  const cuts = Array.isArray(ep.voice.parts) ? ep.voice.parts : null;
  const byAct = ep.voice.acts != null || cuts != null;
  const actOf = acts(ep);
  const partOf = {};
  { let n = 1; ep.beats.forEach((b, i) => { if (i > 0 && cuts?.includes(b.id)) n++; partOf[b.id] = cuts ? `partie${n}` : actOf[b.id]; }); }
  // "Alors… on l'ouvre" never starts a request: said cold, it drags (018 to 020). It rides on the breath of the scene before it.
  ep.beats.forEach((b, i) => { if (i > 0 && isSignature(b)) partOf[b.id] = partOf[ep.beats[i - 1].id]; });
  const parts = [];
  for (const b of ep.beats) {
    if (parts.at(-1)?.act === partOf[b.id]) parts.at(-1).beats.push(b);
    else parts.push({ act: partOf[b.id], beats: [b], stability: stabilityOf(ep, b) });
  }
  for (let s = base; plan.length + wholeHere.length < wantWhole; s++) {
    if (!wholeHere.includes(s)) plan.push({ beats: ep.beats, seed: s, folder: hash, base: `take-${s}`, parts: byAct ? parts : null });
  }
  if (!plan.length) {
    // Retaken on their own: neighbouring phrases in one breath, with the phrase before and the phrase
    // after for context. From one recording to the next the direction alternates between the ways the
    // script proposes ("vo", then "voAlt"), so the ear compares two intentions, not two accidents.
    const wanted = [...new Set([...orphans, ...retake])].map((id) => index[id]).sort((a, b) => a - b);
    const runs = [];
    for (const i of wanted) {
      // act by act, a run stops at the door of the next act: one request, one act, one setting
      const joins = runs.length && runs.at(-1).at(-1) === i - 1 && (!byAct || partOf[ep.beats[i].id] === partOf[ep.beats[i - 1].id]);
      if (joins) runs.at(-1).push(i);
      else runs.push([i]);
    }
    for (const run of runs) {
      const id = ep.beats[run[0]].id;
      const used = recs.filter((r) => r.reprise && r.base.replace(/-\d+$/, "") === id).map((r) => Number(/-(\d+)$/.exec(r.base)?.[1] ?? 0));
      const first = Math.max(0, ...used) + 1;
      for (let n = first; n < first + count; n++) {
        // `alone`: the run by itself, in its own request. Measured on the bench (017, act 3): the same lines sit two
        // semitones higher than inside a 90-second take, where the narrator settles into his low register.
        // …except the signature, which is always retaken behind the phrase before it (said cold, it drags: 018 to 020)
        const lead = isSignature(ep.beats[run[0]]) ? 1 : 0;
        const beats = alone || byAct ? ep.beats.slice(Math.max(0, run[0] - lead), run.at(-1) + 1) : ep.beats.slice(Math.max(0, run[0] - 1), run.at(-1) + 2);
        const vo = Object.fromEntries(beats.map((b) => [b.id, directions(b)[(n - 1) % directions(b).length]]));
        plan.push({ beats, vo, seed: base + 100 + n, folder: "reprises", base: `${id}-${n}`, target: run.map((i) => ep.beats[i].id), stability: stabilityOf(ep, ep.beats[run[0]]) });
      }
    }
  }
  for (const p of plan) p.vo ??= Object.fromEntries(p.beats.map((b) => [b.id, directions(b)[0]]));

  say(`\nVoix: ${ep.voice.name ?? ep.voice.voiceId} · ${ep.voice.model} · script ${hash} · ${recs.length} enregistrement${recs.length > 1 ? "s" : ""} sur le disque`);

  // 2. record — only inside the budget given on the command line
  let spent = 0;
  if (plan.length) {
    // One request = one text sent to the model. A take recorded act by act is several: each act is kept on
    // disk as soon as it is paid for (parts/), so a run that stops halfway never pays for the same act twice.
    const requests = plan.map((p) =>
      (p.parts ?? [{ beats: p.beats, stability: p.stability }]).map((part, n) => {
        const text = part.beats.map((b) => p.vo[b.id]).join("\n\n");
        const stability = part.stability ?? ep.voice.stability;
        const cache = p.parts ? path.join(root, p.folder, "parts", `${p.base}.${n + 1}-${part.act}`) : null;
        const stamp = hashOf(JSON.stringify({ text, stability, seed: p.seed }));
        return { ...part, text, stability, cache, stamp, paid: cache != null && readJson(`${cache}.json`)?.stamp === stamp && fs.existsSync(`${cache}.mp3`) };
      }),
    );
    // the script's own check, run on each request's text before anything is paid for: a word displayed one way and
    // directed another ("I" on screen, "un" in the voice) is caught here, for free — not after a paid request.
    for (const q of requests.flat()) {
      if (q.paid) continue;
      const chars = [...q.text];
      try {
        alignTokens(ep, { characters: chars, character_start_times_seconds: chars.map((_, i) => i), character_end_times_seconds: chars.map((_, i) => i + 1) }, q.beats);
      } catch (err) {
        throw new Error(`Rien n'a été payé : ${err.message}`);
      }
    }
    const guard = spendGuard(budget, await creditRate(ep.voice.model)); // today's rate, asked of ElevenLabs
    const estimate = requests.flat().reduce((n, q) => n + (q.paid ? 0 : guard.estimate(q.text.length)), 0);
    const what = plan[0].target ? `${plan.length} reprise${plan.length > 1 ? "s" : ""} (${[...new Set(plan.flatMap((p) => p.target))].join(", ")})` : `${plan.length} prise${plan.length > 1 ? "s" : ""} complète${plan.length > 1 ? "s" : ""}${byAct ? `, ${cuts ? "partie par partie" : "acte par acte"} (${parts.length} requêtes chacune)` : ""}`;
    if (budget < estimate) {
      say(`\n  À enregistrer : ${what} ≈ ${estimate} crédits ElevenLabs.`);
      say(`  Rien n'a été enregistré. Avec l'accord de Merwan : ajoute --budget ${Math.ceil(estimate / 50) * 50}  (solde : npm run credits)`);
      if (!ep.beats.every((b) => covered(b.id))) throw new Error("Des phrases n'ont aucun enregistrement : pas de voix à monter pour l'instant.");
    } else {
      say(`\n  Enregistrement : ${what} ≈ ${estimate} crédits (budget ${budget})`);
      let halted = null;
      for (const [k, p] of plan.entries()) {
        const name = p.target ? `reprise ${p.base}` : `prise ${p.seed}`;
        const got = [];
        for (const q of requests[k]) {
          let part = q.paid ? readJson(`${q.cache}.json`) : null;
          if (!part) {
            // the budget is a ceiling on what is billed: checked before every request, and against every bill
            if (!guard.before(q.text.length)) {
              halted = `le budget (${budget}) ne couvre plus la suite`;
              break;
            }
            if (!quiet) process.stdout.write(`  ${name}${q.act && p.parts ? ` · ${q.act}` : ""} … `);
            const out = await synthesize(ep, q.text, p.seed, q.stability);
            spent += out.cost;
            if (q.cache) {
              // what is paid is on disk before anything else can fail
              fs.mkdirSync(path.dirname(q.cache), { recursive: true });
              fs.writeFileSync(`${q.cache}.mp3`, out.audio);
            }
            part = { stamp: q.stamp, cost: out.cost, act: q.act, stability: q.stability, words: alignTokens(ep, out.alignment, q.beats), tags: tagSpans(out.alignment) };
            if (q.cache) {
              fs.mkdirSync(path.dirname(q.cache), { recursive: true });
              fs.writeFileSync(`${q.cache}.mp3`, out.audio);
              fs.writeFileSync(`${q.cache}.json`, JSON.stringify(part));
            } else part.audio = out.audio;
            say(`${out.cost} crédits`);
            if (!guard.after(out.cost, q.text.length)) halted = `facturé ${out.cost} crédits pour ${guard.estimate(q.text.length)} annoncés`;
          }
          got.push(part);
          if (halted) break;
        }
        // a take with an act missing is not a take: what is paid stays in parts/ for the next run
        if (got.length < requests[k].length) break;

        const file = path.join(root, p.folder, `${p.base}.mp3`);
        fs.mkdirSync(path.join(root, p.folder), { recursive: true });
        let words = got[0].words;
        let tags = got[0].tags;
        let joined = null;
        if (p.parts) {
          // the acts end to end: each one's words and tags move by the length of what comes before it
          const files = requests[k].map((q) => `${q.cache}.mp3`);
          const lengths = [];
          for (const f of files) lengths.push((await decodeAudio(f)).duration);
          const at = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
          if (!joinAudio(files, file, { match: cuts != null })) throw new Error(`Impossible d'assembler les actes de la ${name} (ffmpeg) : ils restent dans ${path.join(p.folder, "parts")}, déjà payés.`);
          const total = (await decodeAudio(file)).duration;
          if (Math.abs(total - (at.at(-1) + lengths.at(-1))) > 0.03) throw new Error(`Assemblage de la ${name} : ${total.toFixed(3)} s pour ${(at.at(-1) + lengths.at(-1)).toFixed(3)} s attendues — les mots ne seraient plus calés.`);
          const shift = (list, d) => list.map((x) => ({ ...x, ...(x.s != null ? { s: x.s + d, e: x.e + d } : { start: x.start + d, end: x.end + d }) }));
          words = Object.assign({}, ...got.map((g, i) => Object.fromEntries(Object.entries(g.words).map(([id, w]) => [id, shift(w, at[i])]))));
          tags = got.flatMap((g, i) => shift(g.tags, at[i]));
          joined = got.map((g, i) => ({ act: g.act, at: Math.round(at[i] * 1000) / 1000, length: Math.round(lengths[i] * 1000) / 1000, cost: g.cost, stability: g.stability }));
        } else fs.writeFileSync(file, got[0].audio);
        fs.rmSync(path.join(root, p.folder, `${p.base}.wav`), { force: true });
        const by = Object.fromEntries(requests[k].flatMap((q) => q.beats.map((b) => [b.id, q.stability])));
        fs.writeFileSync(
          path.join(root, p.folder, `${p.base}.json`),
          JSON.stringify({
            seed: p.seed,
            cost: got.reduce((n, g) => n + g.cost, 0),
            target: p.target ?? null,
            order: p.beats.map((b) => b.id),
            hashes: Object.fromEntries(p.beats.map((b) => [b.id, beatHash(ep, b, p.vo[b.id], by[b.id])])),
            vo: p.vo,
            words,
            tags,
            ...(joined ? { parts: joined } : {}),
          }),
        );
        if (p.parts) say(`  ${name} : ${got.length} actes assemblés`);
        if (halted) break;
      }
      say(`  ${spent} crédits dépensés`);
      if (halted) say(`  ⚠ Enregistrement arrêté : ${halted}. Rien d'autre n'a été dépensé ; à voir avec Merwan avant de relancer.`);
      recs = pool(dir, ep);
    }
  }
  recs = recs.filter((r) => r.good.size);
  if (!recs.length) throw new Error("Aucun enregistrement utilisable pour ce script.");

  // 3. measure (cached next to each recording) and master (what the film plays)
  for (const r of recs) {
    let meta = r.meta;
    if (meta.v !== ANALYSIS || !meta.frames) {
      const audio = await decodeAudio(r.mp3);
      meta = { ...meta, v: ANALYSIS, duration: audio.duration, frames: pack(trackPitch(audio)), tags: meta.tags ?? meta.qa?.tags?.map(({ text: t, start, end }) => ({ text: t, start, end })) ?? [] };
      delete meta.qa;
      fs.writeFileSync(r.metaFile, JSON.stringify(meta));
      r.meta = meta;
    }
  }
  const whole = recs.filter((r) => r.good.size >= WHOLE);
  const store = (r, gains) => {
    r.meta.gains = { pre: gains.pre, post: gains.post };
    fs.writeFileSync(r.metaFile, JSON.stringify(r.meta));
  };
  for (const r of whole) {
    if (fs.existsSync(r.wav) && r.meta.gains) continue;
    const out = masterVoice(r.mp3, r.wav);
    if (out) store(r, out);
  }
  // a retake keeps the level it was played at: it goes through the gains of the whole takes
  const gains = whole.some((r) => r.meta.gains) ? { pre: median(whole.filter((r) => r.meta.gains).map((r) => r.meta.gains.pre)), post: median(whole.filter((r) => r.meta.gains).map((r) => r.meta.gains.post)) } : undefined;
  for (const r of recs.filter((x) => !whole.includes(x))) {
    if (fs.existsSync(r.wav) && r.meta.gains) continue;
    const out = masterVoice(r.mp3, r.wav, gains);
    if (out) store(r, out);
  }
  for (const r of recs) {
    r.file = fs.existsSync(r.wav) ? r.wav : r.mp3;
    Object.assign(r, analyse(ep, r));
    // how loud each phrase sits once mastered (dBFS while speaking): what the fader rides on
    if (!r.meta.loud || r.meta.loudOf !== path.basename(r.file)) {
      r.meta.loud = phraseLevels(await decodeAudio(r.file, 8000), r.meta.words);
      r.meta.loudOf = path.basename(r.file);
      fs.writeFileSync(r.metaFile, JSON.stringify(r.meta));
    }
  }
  const usual = median((whole.length ? whole : recs).flatMap((r) => Object.values(r.meta.loud)));

  // 4. judge every phrase of every recording
  const seg = (r, id) => r.qa.segments.find((x) => x.id === id);
  const refOf = (list) => ({ rate: median(list.flatMap((r) => r.qa.segments.map((x) => x.rate))), db: median(list.flatMap((r) => r.qa.segments.map((x) => x.db))) });
  const shared = refOf(whole.length ? whole : recs);
  const filmHz = median(whole.map((r) => r.qa.medianHz)); // the narrator's median pitch, over the whole takes
  const dirs = Object.fromEntries(ep.beats.map((b) => [b.id, direction(b)]));
  const candidates = {};
  const grid = {}; // phrase → recording → { score, flags, … }
  for (const b of ep.beats) {
    const list = recs.filter((r) => r.good.has(b.id));
    if (!list.length) throw new Error(`La phrase "${b.id}" n'a aucun enregistrement valable (sa direction ou ses mots ont changé) : npm run voice -- <ep> --retake ${b.id}`);
    candidates[b.id] = list.map((r) => r.id);
    const seconds = list.length >= 3 ? median(list.map((r) => seg(r, b.id).seconds)) : 0;
    grid[b.id] = {};
    for (const r of list) {
      const s = seg(r, b.id);
      const ref = whole.includes(r) ? refOf([r]) : shared;
      const given = direction({ vo: r.meta.vo?.[b.id] ?? b.vo }); // each recording is judged against the direction it was given
      grid[b.id][r.id] = {
        ...judge(given, s, ref, seconds, index[b.id] === 0, isSignature(b)),
        mood: given.label,
        register: s.register,
        spread: s.spread,
        rate: s.rate,
        pause: s.pause,
        seconds: s.seconds,
        level: s.db - ref.db,
        // a retake is measured against its own few phrases: this is what brings its register back to the narrator of the film
        lift: whole.includes(r) || !filmHz ? 0 : Math.round(12 * Math.log2(r.qa.medianHz / filmHz) * 100) / 100,
        clip: rel(dir, path.join(root, r.folder, "cut", `${r.base}.${b.id}.mp3`)), // the booth's excerpt of this phrase
      };
    }
  }

  // 5. comp: the ear's choices first, then the best path through the rest
  const byId = Object.fromEntries(recs.map((r) => [r.id, r]));
  const follows = (r, a, b) => byId[r].meta.order.indexOf(a) + 1 === byId[r].meta.order.indexOf(b);
  const saved = readPicks(dir);
  const asked = solo != null ? Object.fromEntries(ep.beats.map((b) => [b.id, String(solo)])) : { ...saved.picks, ...pick };
  const forced = {};
  const dropped = [];
  for (const [id, r] of Object.entries(asked)) {
    if (candidates[id]?.includes(String(r))) forced[id] = String(r);
    else if (solo == null) dropped.push(`${id}=${r}`);
  }
  if (solo != null && !byId[String(solo)]) throw new Error(`Enregistrement "${solo}" inconnu (disponibles: ${recs.map((r) => r.id).join(", ")})`);
  const score = (id, r) => grid[id][r].score;
  const auto = compose(ep.beats, candidates, score, follows);
  const comp = compose(ep.beats, candidates, score, follows, forced);

  // 6. write the voice of the film
  const names = {}; // what the booth calls each recording
  whole.forEach((r, k) => (names[r.id] = `Prise ${k + 1}`));
  // numbered in the order they were recorded, all phrases together: a name points at one recording only
  recs.filter((x) => !whole.includes(x)).forEach((r, k) => (names[r.id] = `Reprise ${k + 1}`));
  const used = recs.filter((r) => Object.values(comp).includes(r.id));
  // The fader: a phrase played well under the usual level (a low, ominous line) is brought part of
  // the way back up, so that a phone speaker still carries it over the sound bed. And a phrase played
  // well over it is brought part of the way down: the narrator may speak loud, he never yells in the viewer's ears.
  const ride = {};
  for (const b of ep.beats) {
    const level = byId[comp[b.id]].meta.loud[b.id];
    const under = usual - RIDE.margin - level;
    const over = level - usual - RIDE.over;
    const gain = Math.round((over > 0 ? -clamp(over * RIDE.slope, 0, RIDE.down) : clamp(under * RIDE.slope, 0, RIDE.max)) * 10) / 10;
    if (gain !== 0) ride[b.id] = gain;
  }
  const vo = {
    format: 3,
    voice: ep.voice,
    beatHash: Object.fromEntries(ep.beats.map((b) => [b.id, byId[comp[b.id]].meta.hashes[b.id]])),
    comp,
    ride,
    takes: Object.fromEntries(used.map((r) => [r.id, { file: rel(dir, r.file), duration: r.meta.duration }])),
    takeWords: Object.fromEntries(used.map((r) => [r.id, r.meta.words])),
    cuts: Object.fromEntries(used.map((r) => [r.id, r.cuts])),
    arc: tensionArc(ep, ep.beats.map((b) => ({ id: b.id, ...grid[b.id][comp[b.id]], register: grid[b.id][comp[b.id]].register + grid[b.id][comp[b.id]].lift }))),
    booth: {
      names,
      auto,
      beats: Object.fromEntries(ep.beats.map((b) => [b.id, { mood: dirs[b.id].label, takes: grid[b.id] }])),
    },
  };
  const voFile = path.join(dir, "audio", "vo.json");
  fs.writeFileSync(voFile, JSON.stringify(vo, null, 1));

  // 7. the comp as one file, measured as a whole (this is what the audience hears)
  const sched = schedule(ep);
  const mix = mixVoice(dir, sched);
  if (mix) {
    const audio = await decodeAudio(path.join(dir, mix));
    const report = prosodyReport(
      trackPitch(audio),
      sched.beats.map((b, i) => ({ id: b.id, start: b.start, end: b.end, letters: letters(ep.beats[i]) })),
    );
    vo.qa = { ...report, segments: report.segments.map(({ marks, ...s }) => s) };
    vo.duration = audio.duration;
    fs.writeFileSync(voFile, JSON.stringify(vo, null, 1));
  }

  // 8. the booth's excerpts: every phrase of every recording, ready to play on the phone
  if (tool("ffmpeg")) {
    for (const r of recs) {
      const cut = path.join(root, r.folder, "cut");
      fs.mkdirSync(cut, { recursive: true });
      for (const id of r.good) {
        const out = path.join(cut, `${r.base}.${id}.mp3`);
        if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(r.file).mtimeMs) excerpt(r.file, r.cuts[id][0], r.cuts[id][1] - r.cuts[id][0], out);
      }
    }
  }

  // 9. the session sheet
  say("\n  enregistrement        durée   hauteur σ   étendue   mélodie des phrases");
  for (const r of whole) {
    const q = r.qa;
    say(`  ${`${names[r.id]} [${r.id}]`.padEnd(20)} ${r.meta.duration.toFixed(1).padStart(5)}s  ${q.pitchSd.toFixed(2).padStart(6)} dt  ${q.pitchRange.toFixed(1).padStart(6)} dt   ${verdict(q.pitchSd)}`);
  }
  const reprises = recs.length - whole.length;
  if (reprises) say(`  + ${reprises} reprise${reprises > 1 ? "s" : ""} de phrase`);
  const chosen = Object.keys(forced).length;
  say(`\n  Montage (${used.length} enregistrement${used.length > 1 ? "s" : ""}${chosen && solo == null ? `, ${chosen} choix à l'oreille •` : ""})`);
  say("  phrase         source          intention   registre  variation   débit    pause   à vérifier à l'oreille");
  for (const b of ep.beats) {
    const r = comp[b.id];
    const g = grid[b.id][r];
    const mark = forced[b.id] != null && solo == null ? "•" : " ";
    const better = candidates[b.id].filter((x) => x !== r && grid[b.id][x].score > g.score + SWITCH).length;
    say(
      `  ${b.id.padEnd(13)} ${mark}${names[r].padEnd(15)} ${g.mood.slice(0, 10).padEnd(10)}${signed(g.register).padStart(6)} dt  ${g.spread.toFixed(2).padStart(6)} dt  ${g.rate.toFixed(1).padStart(4)} l/s  ${g.pause.toFixed(2)}s   ${g.flags.join(", ")}${better ? `${g.flags.length ? " · " : ""}(${better} mieux notée${better > 1 ? "s" : ""})` : ""}`,
    );
  }
  if (vo.qa) say(`\n  Voix montée: ${vo.duration.toFixed(1)} s · hauteur σ ${vo.qa.pitchSd.toFixed(2)} dt (mélodie des phrases : ${verdict(vo.qa.pitchSd)}) · registres ${vo.qa.registerSpread.toFixed(2)} dt · ${vo.qa.pauses} pauses, la plus longue ${vo.qa.longestPause.toFixed(2)} s`);
  // the melody inside the phrases says nothing of the tone from one act to the next: that is this second reading
  say(`\n  Courbe de tension : ${vo.arc.verdict}${vo.arc.why.length ? ` — ${vo.arc.why.join(" ; ")}` : ""}`);
  say("  acte            registre    niveau    débit");
  for (const a of vo.arc.acts) say(`  ${a.label.padEnd(14)} ${signed(a.register).padStart(6)} dt  ${signed(a.level).padStart(5)} dB  ${signed(a.rate, 0).padStart(4)} %`);
  if (dropped.length) say(`  (choix à l'oreille ignorés, l'enregistrement ne vaut plus pour la phrase : ${dropped.join(", ")})`);
  say(
    "\n  Ces mesures trient et alertent ; elles n'entendent pas. Écoute dans la cabine (npm run front → Voix) et choisis\n" +
      "  une autre prise là où une phrase sonne faux. Refaire une seule phrase : npm run voice -- <ep> --retake <phrase>\n",
  );
  return { ep, vo, recs, grid, comp, auto, dirs, names, spent, shared, gains };
}

/** Save the ear's choices (and its notes), then re-comp from the recordings on disk. Never records anything. */
export async function choose(dir, { picks = {}, notes = {} }) {
  const ep = loadEpisode(dir);
  const ids = new Set(ep.beats.map((b) => b.id));
  const before = readPicks(dir);
  const next = { picks: { ...before.picks }, notes: { ...before.notes } };
  // what the last comp knew of each phrase: a choice must be one of its recordings
  const known = readJson(path.join(dir, "audio", "vo.json"))?.booth?.beats ?? {};
  for (const [id, r] of Object.entries(picks)) {
    if (!ids.has(id)) throw new Error(`Phrase inconnue: ${id}`);
    if (r == null || r === "") delete next.picks[id];
    else if (typeof r === "string" && /^[\w.~-]{1,60}$/.test(r) && (!known[id] || r in known[id].takes)) next.picks[id] = r;
    else throw new Error(`Enregistrement invalide pour ${id}`);
  }
  // a phrase that left the script takes its choice and its note with it
  for (const kind of ["picks", "notes"]) for (const id of Object.keys(next[kind])) if (!ids.has(id)) delete next[kind][id];
  for (const [id, n] of Object.entries(notes)) {
    if (!ids.has(id)) throw new Error(`Phrase inconnue: ${id}`);
    const clean = String(n ?? "").trim().slice(0, 400);
    if (clean) next.notes[id] = clean;
    else delete next.notes[id];
  }
  const file = path.join(dir, "audio", "picks.json");
  const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  fs.writeFileSync(file, JSON.stringify(next, null, 1));
  try {
    return await voice(dir, { quiet: true });
  } catch (err) {
    // a choice that cannot be honoured must not stay on disk
    if (previous == null) fs.rmSync(file, { force: true });
    else fs.writeFileSync(file, previous);
    throw err;
  }
}
