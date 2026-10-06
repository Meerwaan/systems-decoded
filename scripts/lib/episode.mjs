import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";
import { core, resolveRef as resolveIn } from "../../kit/lib/ref.mjs";

export { core };

export const EPISODES = path.join(ROOT, "episodes");

export function resolveEpisode(arg) {
  if (!arg) throw new Error("Précise l'épisode, ex: 001");
  const direct = path.resolve(arg);
  if (fs.existsSync(path.join(direct, "episode.json"))) return direct;
  const hits = fs.existsSync(EPISODES)
    ? fs.readdirSync(EPISODES).filter((n) => n === arg || n.startsWith(`${arg}-`))
    : [];
  if (hits.length === 1) return path.join(EPISODES, hits[0]);
  if (hits.length > 1) throw new Error(`"${arg}" correspond à plusieurs épisodes: ${hits.join(", ")}`);
  throw new Error(`Épisode introuvable: ${arg}`);
}

export function loadEpisode(dir) {
  const ep = JSON.parse(fs.readFileSync(path.join(dir, "episode.json"), "utf8"));
  ep.dir = dir;
  ep.fps ??= 30;
  ep.lead ??= 0.5;
  ep.tail ??= 2.0;
  for (const beat of ep.beats) beat.tokens = parseText(beat.text);
  return ep;
}

/* ---------------------------------------------------------------- script markup
   Beat text markup:
     *mot*            accent "danger"  (orange)
     +mot+            accent "system"  (mint)
     [85|quatre-vingt-cinq]   shown as "85", spoken as "quatre-vingt-cinq"
   Markup never reaches the voice: `plainText()` strips it. */
export function parseText(text) {
  const tokens = [];
  const re = /\[([^\]|]+)\|([^\]]+)\]|([*+])|(\s+)|([^\s*+[]+)/g;
  let accent = null;
  let spaced = true;
  for (const m of text.matchAll(re)) {
    if (m[3]) {
      const kind = m[3] === "*" ? "danger" : "system";
      accent = accent === kind ? null : kind;
    } else if (m[4]) {
      spaced = true;
    } else {
      const d = m[1] ?? m[5];
      const s = m[2] ?? m[5];
      const last = tokens.at(-1);
      const punctOnly = !/[\p{L}\p{N}]/u.test(s);
      if (last && (!spaced || punctOnly)) {
        last.d += (spaced ? " " : "") + d;
        last.s += (spaced ? " " : "") + s;
      } else {
        tokens.push({ d, s, accent });
      }
      spaced = false;
    }
  }
  return tokens;
}

export const plainText = (tokens) => tokens.map((t) => t.s).join(" ");

/** What a caption shows for a token: no trailing , . ; : — keeps ? ! … */
export const captionOf = (tok) => tok.d.replace(/\s*[.,;:]+$/u, "").trim();

/* ---------------------------------------------------------------- timing */

const LETTERS_PER_SEC = 16.5; // measured on Eleven v4 narration (speech time only)

function estimateBeat(tokens) {
  let t = 0;
  const words = [];
  for (const tok of tokens) {
    const n = tok.s.replace(/[^\p{L}\p{N}]/gu, "").length;
    const dur = Math.max(0.16, n / LETTERS_PER_SEC + 0.05);
    words.push({ s: t, e: t + dur });
    t += dur;
    t += /[.!?…]\s*$/.test(tok.s) ? 0.42 : /[:;]\s*$/.test(tok.s) ? 0.26 : /,\s*$/.test(tok.s) ? 0.17 : 0.03;
  }
  return words;
}

/**
 * Locate every token of every beat inside an ElevenLabs character alignment
 * (`beats`: the run of beats that was sent, when it is not the whole script).
 * Audio tags ("[whispers]") are masked so a script word can never match inside one.
 */
export function alignTokens(ep, alignment, beats = ep.beats) {
  const chars = alignment.characters;
  const starts = alignment.character_start_times_seconds;
  const ends = alignment.character_end_times_seconds;
  let depth = 0;
  const hay = chars
    .map((c) => {
      if (c === "[") depth++;
      const masked = depth > 0 ? "\u0000" : c;
      if (c === "]") depth = Math.max(0, depth - 1);
      return masked;
    })
    .join("")
    .toLocaleLowerCase("fr")
    .replace(/[’`]/g, "'");
  // toLocaleLowerCase can change string length for exotic characters; French never does.
  if (hay.length !== chars.length) throw new Error("Alignement: longueur inattendue après normalisation");

  let cursor = 0;
  const out = {};
  for (const beat of beats) {
    const words = [];
    for (const tok of beat.tokens) {
      const needle = core(tok.s);
      const at = findWord(hay, needle, cursor);
      if (at === -1) {
        throw new Error(
          `Beat "${beat.id}": le mot "${tok.s}" est introuvable dans la voix générée. ` +
            `Le champ "vo" doit contenir les mêmes mots que "text", dans le même ordre.`,
        );
      }
      words.push({ s: starts[at], e: ends[at + needle.length - 1] });
      cursor = at + needle.length;
    }
    out[beat.id] = words;
  }
  return out;
}

const isLetter = (c) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

/** indexOf that only accepts whole words (so "a" never matches inside "chargeur"). */
function findWord(hay, needle, from) {
  let at = hay.indexOf(needle, from);
  while (at !== -1) {
    if (!isLetter(hay[at - 1]) && !isLetter(hay[at + needle.length])) return at;
    at = hay.indexOf(needle, at + 1);
  }
  return -1;
}

/**
 * Resolve the final schedule.
 * With a voice take (audio/vo.json) → real word timings. Otherwise → estimate from text.
 */
export function schedule(ep) {
  const voFile = path.join(ep.dir, "audio", "vo.json");
  const vo = fs.existsSync(voFile) ? JSON.parse(fs.readFileSync(voFile, "utf8")) : null;
  // A comp is valid phrase by phrase (vo.beatHash): each beat must still be the one that was recorded.
  // The single-take voice of the first episodes is valid for its whole script or not at all.
  const usable =
    !!vo && (vo.beatHash ? ep.beats.every((b) => beatHashes(ep, b).includes(vo.beatHash[b.id]) && vo.comp?.[b.id] != null) : vo.scriptHash === scriptHash(ep));
  const beats = [];
  const clips = []; // slices of the voice takes, laid end to end (a "hold" opens a gap between two)

  // The voice is a comp: each beat comes from the take that played it best (vo.comp).
  // A single-take voice (first episodes) is the same thing with one take everywhere.
  const takes = usable ? (vo.takes ?? { [vo.seed]: { file: "audio/vo.mp3", duration: vo.duration } }) : null;
  const pick = (beat) => (vo.comp ? vo.comp[beat.id] : vo.seed);
  const spoken = (seed, beat) => (vo.takeWords ? vo.takeWords[seed] : vo.words)[beat.id];
  // Where a take is cut around beat i: at the quietest instant of each silence when the take was
  // analysed (vo.cuts), otherwise in the middle of the silence.
  const edges = (seed, i) => {
    if (vo.cuts?.[seed]) return vo.cuts[seed][ep.beats[i].id];
    const raw = spoken(seed, ep.beats[i]);
    const prev = ep.beats[i - 1];
    const next = ep.beats[i + 1];
    return [
      prev ? (spoken(seed, prev).at(-1).e + raw[0].s) / 2 : Math.max(0, raw[0].s - 0.3),
      next ? (raw.at(-1).e + spoken(seed, next)[0].s) / 2 : takes[seed].duration,
    ];
  };

  let cursor = ep.lead; // where the next slice lands on the film's timeline
  let lastHold = 0;

  ep.beats.forEach((beat, i) => {
    let words;
    if (usable) {
      const seed = pick(beat);
      const raw = spoken(seed, beat);
      const [cutIn, cutOut] = edges(seed, i);
      words = raw.map((w) => ({ s: cursor + w.s - cutIn, e: cursor + w.e - cutIn }));
      const gain = vo.ride?.[beat.id] ?? 0; // the fader, in dB, for this phrase
      const last = clips.at(-1);
      if (last && last.seed === seed && last.gain === gain && lastHold === 0 && Math.abs(last.from + last.length - cutIn) < 1e-6) last.length += cutOut - cutIn;
      else clips.push({ seed, src: takes[seed].file, from: cutIn, length: cutOut - cutIn, at: cursor, gain });
      lastHold = beat.hold ?? 0;
      cursor += cutOut - cutIn + lastHold;
    } else {
      words = estimateBeat(beat.tokens).map((w) => ({ s: w.s + cursor, e: w.e + cursor }));
      cursor = words.at(-1).e + (beat.gap ?? 0.45) + (beat.hold ?? 0);
    }
    beats.push({
      id: beat.id,
      start: round(words[0].s),
      end: round(words.at(-1).e),
      words: beat.tokens.map((tok, k) => ({
        t: captionOf(tok),
        k: core(tok.d),
        ks: core(tok.s),
        a: tok.accent,
        p: /[.!?…]\s*$/.test(tok.d) ? 2 : /[,;:]\s*$/.test(tok.d) ? 1 : 0,
        s: round(words[k].s),
        e: round(words[k].e),
      })),
    });
  });

  for (const clip of clips) Object.assign(clip, { from: round(clip.from), length: round(clip.length), at: round(clip.at) });
  const lastEnd = usable ? cursor - lastHold : beats.at(-1).end;
  const frame = 1 / ep.fps;
  const duration = Math.ceil((Math.max(lastEnd, beats.at(-1).end) + ep.tail) / frame - 1e-6) * frame;
  const sched = { estimated: !usable, stale: !!vo && !usable, duration: round(duration), beats, clips };
  sched.cues = resolveCues(ep, sched);
  return sched;
}

const round = (x) => Math.round(x * 1000) / 1000;

/* ---------------------------------------------------------------- cues
   A cue is a named moment, written against the script so it follows the voice:
     "eclate"            start of beat
     "eclate$"           end of beat
     "eclate:pile"       start of the first word starting with "pile" in that beat
     "eclate:pile$"      end of that word
     "verif:fois#2"      second match
     "led:flash+0.2"     any of the above, shifted by seconds                       */
export const resolveRef = (sched, ref) => resolveIn(sched.beats, ref);

function resolveCues(ep, sched) {
  const cues = {};
  for (const [name, ref] of Object.entries(ep.cues ?? {})) cues[name] = resolveRef(sched, ref);
  return cues;
}

/** Short fingerprint of a string (FNV-1a): tells a derived file whether its source changed. */
export function hashOf(payload) {
  let h = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** The ways a phrase may be directed: its "vo" line, then the alternatives the booth can compare ("voAlt"). */
export const directions = (beat) => [beat.vo ?? plainText(beat.tokens), ...(beat.voAlt ?? [])].map((v) => v.trim());

/** What makes two recordings of a phrase interchangeable: same voice, same direction, same words. */
export function beatHash(ep, beat, vo = directions(beat)[0]) {
  const { voiceId, model, stability, similarity, speed, format } = ep.voice ?? {};
  return hashOf(
    JSON.stringify({
      voice: { voiceId, model, stability, similarity, speed, format },
      vo,
      words: beat.tokens.map((t) => core(t.s)),
    }),
  );
}

/** Every fingerprint a recording of this phrase may carry: one per direction. */
export const beatHashes = (ep, beat) => directions(beat).map((vo) => beatHash(ep, beat, vo));

/** Hash of everything that changes the spoken audio of the whole script (names a recording session). */
export function scriptHash(ep) {
  return hashOf(
    JSON.stringify({
      voice: ep.voice,
      text: voiceText(ep),
      words: ep.beats.map((b) => b.tokens.map((t) => core(t.s))),
    }),
  );
}

/** The exact string sent to the voice model: one paragraph per beat (all of them, or a run of them). */
export function voiceText(ep, beats = ep.beats) {
  return beats.map((b) => (b.vo ?? plainText(b.tokens)).trim()).join("\n\n");
}
