// Sound design, synthesized: no samples, no licences, same result every run.
// The episode lists its sounds in episode.json ("sfx"), placed on the same cues as the picture.
// The continuous layers (drone, heartbeat) step back a little while the narrator speaks and come
// forward in the silences ("duck", in dB): the voice stays in front without the bed going thin.
// The moving effects (whoosh, riser, rewind, bursts of ticks) sit in the consonant band: they step
// back further under a spoken phrase ("duckFx", in dB) and play at their written level in the silences.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEpisode, schedule, hashOf } from "./lib/episode.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";

/**
 * The breath at or after `t`: if a word is being said at `t`, or one starts less than `need` s after it, the instant
 * just after that word (+ 0.03 s) — again, until `need` s are free. The same as kit/lib/timing.js (which the page
 * reads: the picture and the sound land on the same instant); the package is CommonJS, so the scripts keep this copy.
 */
export function breathAfter(beats, t, need = 0.15, max = 0.8) {
  const words = beats.flatMap((b) => b.words ?? []);
  const scan = (t, need) => {
    for (let guard = 0; guard < 500; guard++) {
      const hit = words.find((w) => w.s < t + need && w.e + 0.02 > t);
      if (!hit) return t;
      t = hit.e + 0.03;
    }
    return t;
  };
  // no breath of `need` s within `max` s (a phrase said in one go): a shorter one, never a word
  for (const n of [need, need / 2, 0.03]) {
    const b = scan(t, n);
    if (b - t <= max) return b;
  }
  return scan(t, 0.03);
}
/** The cues fil1, fil2, … of a promo (hors-série), in order: the moments its threads open. */
export const threadCues = (cues = {}) =>
  Object.keys(cues)
    .filter((k) => /^fil\d+$/.test(k))
    .sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)));

const SR = 44100;
const TAU = Math.PI * 2;
const db = (x) => Math.pow(10, x / 20);
const BODY = 0.55; // impact: level of the 240 Hz body against the sub
const CRACK = 0.6; // impact: level of the 2 kHz crack
const VALVE = 0.3; // heartbeat with a body: level of the valve click (620 + 930 Hz)
const SOURCE = hashOf(fs.readFileSync(fileURLToPath(import.meta.url), "utf8")); // a change to the synths re-renders every bed

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* THE LONG FORMAT'S SCORE (2026-10-21): the same minor world around D as `music`, a palette of four progressions —
   one per section, a section per chapter. In semitones from the root; each chord its three voices. */
const PROG = [
  [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], //   Dm B♭ F C  — the film's world (the shorts' and L01's music)
  [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]], //  Dm C B♭ A  — the descent: something is coming
  [[-4, 0, 3], [3, 7, 10], [-2, 2, 5], [0, 3, 7]], //   B♭ F C Dm  — open: the machine works, the place is shown
  [[0, 3, 7], [-7, -4, 0], [-4, 0, 3], [-5, -1, 2]], // Dm Gm B♭ A — dark, it moves: the threat, the test
];
const ARP = [[0, 1, 2, 1, 2, 0, 1, 2], [0, 2, 1, 2, 0, 2, 1, 2], [2, 1, 0, 1, 2, 1, 0, 1], [0, 1, 2, 0, 1, 2, 0, 2]];
const WT = 2048;
const wavetable = (harm) => Float32Array.from({ length: WT + 1 }, (_, i) => harm.reduce((v, a, n) => v + a * Math.sin((TAU * (n + 1) * i) / WT), 0));
const PAD = wavetable([1, 0.5, 0.33, 0.22, 0.14, 0.09, 0.05]);
const PLUCK = wavetable([1, 0, 0.11, 0, 0.04]);
const readWT = (w, ph) => w[((ph - Math.floor(ph)) * WT) | 0];
const semi = (n) => Math.pow(2, n / 12);

/** A stereo room (Freeverb's comb and all-pass network), deterministic: `input` mono → [left, right] tails. */
function room(input, { size = 0.82, damp = 0.3, from = 0 } = {}) {
  const n = input.length;
  const outL = new Float32Array(n);
  const outR = new Float32Array(n);
  const COMB = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const ALL = [556, 441, 341, 225];
  for (const [out, spread] of [[outL, 0], [outR, 23]]) {
    const combs = COMB.map((d) => ({ buf: new Float32Array(d + spread), i: 0, store: 0 }));
    const alls = ALL.map((d) => ({ buf: new Float32Array(d + spread), i: 0 }));
    let hp = 0;
    for (let s = from; s < n; s++) {
      const x0 = input[s];
      hp += 0.03 * (x0 - hp); // the room does not ring the sub: below ≈ 200 Hz stays dry
      const x = (x0 - hp) * 0.015;
      let acc = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.store = y * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * size;
        if (++c.i >= c.buf.length) c.i = 0;
        acc += y;
      }
      for (const a of alls) {
        const b = a.buf[a.i];
        a.buf[a.i] = acc + b * 0.5;
        acc = b - acc;
        if (++a.i >= a.buf.length) a.i = 0;
      }
      out[s] = acc;
    }
  }
  return [outL, outR];
}

/**
 * Render audio/bed.wav. Skipped when the bed on disk already matches the schedule, the sound list
 * and this file (pass `force` to render anyway). Returns true when a new bed was written.
 */
export function sfx(dir, { ep = loadEpisode(dir), sched = schedule(ep), force = false, quiet = false } = {}) {
  const out = path.join(dir, "audio", "bed.wav");
  const meta = path.join(dir, "audio", "bed.json");
  const list = ep.sfx ?? [];
  const duck = ep.duck ?? -4.5;
  const duckFx = ep.duckFx ?? -7;
  const stamp = hashOf(JSON.stringify([SOURCE, list, duck, duckFx, sched.duration, sched.cues, sched.beats.map((b) => b.words.map((w) => [w.s, w.e]))]));
  if (!list.length) return false;
  if (!force && fs.existsSync(out)) {
    try {
      if (JSON.parse(fs.readFileSync(meta, "utf8")).stamp === stamp) return false;
    } catch {
      // no stamp yet: render
    }
  }

  const total = sched.duration;
  const N = Math.ceil(total * SR);
  const L = new Float32Array(N);
  const R = new Float32Array(N);
  // the layers that step back under the voice are written apart, and folded in at the end
  const under = { L: new Float32Array(N), R: new Float32Array(N) };
  // music given its own "duck" (the shorts): a bus that follows the phrase, further down than the drone
  const mus = { L: new Float32Array(N), R: new Float32Array(N), duck: null };
  const fx = { L: new Float32Array(N), R: new Float32Array(N) };
  const at = (ref) => resolveMoment(sched.beats, sched.cues, ref);
  // THE LONG FORMAT (2026-10-21): a room for the punctuation — only when the list asks for it ("space"): its send
  // gathers what is written on the main bus, the tail is added at the end. Without "space", nothing here exists.
  const SPACE = list.find((x) => x.type === "space");
  const send = SPACE ? new Float32Array(N) : null;
  const main = { L, R };

  /** Write `fn(seconds since start, sample index)` → mono sample, from t0 for dur, at pan −1…1. */
  const write = (t0, dur, pan, fn, bus = main) => {
    const i0 = Math.max(0, Math.round(t0 * SR));
    const i1 = Math.min(N, Math.round((t0 + dur) * SR));
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    const wet = send && bus === main && SPACE.all !== false;
    for (let i = i0; i < i1; i++) {
      const v = fn((i - i0) / SR, i);
      bus.L[i] += v * gl * 1.414;
      bus.R[i] += v * gr * 1.414;
      if (wet) send[i] += v;
    }
  };
  /** The long's wide layers: `fn(t, i, pair)` writes the left and right samples into `pair`. `toSend` (0…1): into the room. */
  const pair = [0, 0];
  const writeLR = (t0, dur, fn, bus = main, toSend = 0) => {
    const i0 = Math.max(0, Math.round(t0 * SR));
    const i1 = Math.min(N, Math.round((t0 + dur) * SR));
    for (let i = i0; i < i1; i++) {
      pair[0] = 0;
      pair[1] = 0;
      fn((i - i0) / SR, i, pair);
      bus.L[i] += pair[0];
      bus.R[i] += pair[1];
      if (send && toSend) send[i] += (pair[0] + pair[1]) * 0.5 * toSend;
    }
  };
  const drops = []; // [from, to, back] — the music (and the continuous layers) silent before a moment
  const cliffs = []; // [at, tape, dur, back] — the promo's cuts: the whole bed winds down and goes dead ("cliff")
  let late = null; // what rings through a cliff's silence, added after it (exists only when a cliff does)
  const lateBus = () => (late ??= { L: new Float32Array(N), R: new Float32Array(N) });
  // a chapter card's sound lands on the card (`lead` s before its first word) — or, when the phrase before is still
  // being said then, in the breath right after it: a sound never lands on a word
  const prevEnd = (b) => {
    const prev = sched.beats[sched.beats.indexOf(b) - 1];
    return prev ? prev.words.at(-1).e : 0;
  };
  const cardAt = (b, lead) => Math.max(b.start - lead, Math.min(prevEnd(b) + 0.04, b.start - 0.05));

  const synth = {
    // low two-note bed that breathes with the story ("curve": [[moment, level], …])
    drone({ gain = -27, curve = [[0, 1]] }) {
      const pts = curve.map(([ref, level]) => [at(ref), level]).sort((a, b) => a[0] - b[0]);
      const levelAt = (t) => {
        if (t <= pts[0][0]) return pts[0][1];
        for (let k = 1; k < pts.length; k++) {
          if (t < pts[k][0]) {
            const u = (t - pts[k - 1][0]) / (pts[k][0] - pts[k - 1][0]);
            return pts[k - 1][1] + (pts[k][1] - pts[k - 1][1]) * (u * u * (3 - 2 * u));
          }
        }
        return pts.at(-1)[1];
      };
      const g = db(gain);
      const noise = rng(3);
      let lp = 0;
      let airA = 0;
      let airB = 0;
      write(0, total, 0, (t) => {
        const edge = Math.min(1, t / 0.5) * Math.min(1, (total - t) / 0.35);
        const n = noise() * 2 - 1;
        lp += 0.012 * (n - lp); // dark rumble
        airA += 0.2 * (n - airA); // "air" band ≈ 300–1400 Hz: what a phone actually plays
        airB += 0.04 * (n - airB);
        const tone =
          Math.sin(TAU * 55 * t) * 0.5 +
          Math.sin(TAU * 55.37 * t) * 0.36 +
          Math.sin(TAU * 82.41 * t) * 0.26 * (0.6 + 0.4 * Math.sin(TAU * 0.07 * t)) +
          Math.sin(TAU * 110.2 * t) * 0.16 * (0.5 + 0.5 * Math.sin(TAU * 0.11 * t + 1)) +
          Math.sin(TAU * 164.8 * t) * 0.12 * (0.5 + 0.5 * Math.sin(TAU * 0.13 * t + 2)) +
          Math.sin(TAU * 220.6 * t) * 0.1 * (0.5 + 0.5 * Math.sin(TAU * 0.09 * t + 0.5)) +
          Math.sin(TAU * 329.6 * t) * 0.045 * (0.5 + 0.5 * Math.sin(TAU * 0.05 * t + 1.7));
        return (tone + lp * 2.0 + (airA - airB) * 0.16) * g * levelAt(t) * edge * (0.85 + 0.15 * Math.sin(TAU * 0.19 * t));
      }, under);
    },
    // The long format: under each chapter card (it comes 0.9 s before the chapter's first word) a whoosh and a hit,
    // which also hide the seam between two voice requests. `skip`: chapter beats that carry their own sound.
    // `style: "film"` (2026-10-21, a television, a computer): under each card a swell that rises out of the silence,
    // a boom (a sub for the television, a body and a crack for a laptop) and a chord struck in the key of the section
    // that starts there (the score's palette) — with "space", its tail. `lead`: the card comes that long before the word.
    chapters({ skip = [], gain = -17, whoosh = -22, style, lead = 0.9, boom = -15, sting = -21, swell = -22, palette = [0, 1, 2, 3] }) {
      if (style === "film") {
        sched.beats.filter((b) => b.chap).forEach((b, k) => {
          if (k === 0 || skip.includes(b.id)) return;
          const card = cardAt(b, lead);
          const room = card - prevEnd(b) - 0.02; // the breath before the card: the swell lives there, or not at all
          if (room >= 0.3) synth.swell({ to: card, dur: Math.min(0.85, room), gain: swell });
          synth.boom({ at: card, gain: boom, size: 0.9 });
          synth.sting({ at: card, gain: sting, chord: PROG[palette[k % palette.length]][0] });
        });
        return;
      }
      sched.beats.filter((b) => b.chap).slice(1).forEach((b) => {
        if (skip.includes(b.id)) return;
        synth.whoosh({ at: `${b.id}-1.35`, dur: 0.9, gain: whoosh });
        synth.impact({ at: `${b.id}-0.9`, gain, size: 0.9 });
      });
    },
    // The long format's music (a computer, a television: there is room for it), under the voice like the drone.
    // A minor progression, two bars a chord (Dm · B♭ · F · C): a pad of detuned voices, a bass on the half bar,
    // and — where the story pushes ("drive" > 0) — an arpeggio and a soft kick. "curve": [[moment, level, drive], …].
    // Read from wavetables: nine minutes are written in a few seconds. Deterministic, like everything here.
    // "phone" (0…1, the shorts): a phone speaker plays nothing under ≈ 400 Hz, where the pad, the bass and the kick
    // live — it brightens the pad, gives the bass its upper harmonics, keeps a soft arpeggio (an octave doubled) even
    // where the story rests, and gives the kick a tick. "fadeIn": seconds before the music is full (a hook can't wait 2 s).
    // "duck" (dB): the music steps back that far under each spoken phrase, on its own bus (without it: with the drone).
    music({ gain = -24, bpm = 84, root = 73.42, curve = [[0, 1, 0]], from = 0, to, phone = 0, fadeIn = 2, duck: musDuck }) {
      if (musDuck != null) mus.duck = musDuck;
      const bus = musDuck != null ? mus : under;
      const pts = curve.map(([ref, level, drive = 0]) => [at(ref), level, drive]).sort((a, b) => a[0] - b[0]);
      const valueAt = (t, k) => {
        if (t <= pts[0][0]) return pts[0][k];
        for (let j = 1; j < pts.length; j++) {
          if (t < pts[j][0]) {
            const u = (t - pts[j - 1][0]) / (pts[j][0] - pts[j - 1][0]);
            return pts[j - 1][k] + (pts[j][k] - pts[j - 1][k]) * (u * u * (3 - 2 * u));
          }
        }
        return pts.at(-1)[k];
      };
      const t0 = at(from);
      const t1 = to == null ? total : at(to);
      const SIZE = 2048;
      const table = (harm) => Float32Array.from({ length: SIZE + 1 }, (_, i) => harm.reduce((v, a, n) => v + a * Math.sin((TAU * (n + 1) * i) / SIZE), 0));
      const padWave = table([1, 0.5, 0.33, 0.22, 0.14, 0.09, 0.05]);
      const pluck = table([1, 0, 0.11, 0, 0.04]);
      const read = (w, ph) => w[((ph - Math.floor(ph)) * SIZE) | 0];
      const semi = (n) => Math.pow(2, n / 12);
      const CHORDS = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]; // Dm, B♭, F, C — around D
      const beat = 60 / bpm;
      const span = beat * 8; // two bars
      const g = db(gain);
      const pad = [0, 0, 0, 0, 0, 0];
      let lpL = 0;
      let lpHi = 0;
      let lpBass = 0;
      write(t0, t1 - t0, 0, (t) => {
        const T = t0 + t;
        const level = valueAt(T, 1);
        const drive = valueAt(T, 2);
        const edge = Math.min(1, t / fadeIn) * Math.min(1, (t1 - T) / 1.5);
        const c = Math.floor(T / span);
        const u = (T - c * span) / span;
        const cur = CHORDS[c % 4];
        const prev = CHORDS[(c + 3) % 4];
        const x = Math.min(1, u / 0.12); // a slow crossfade into each chord
        // the pad: three voices, each two detuned oscillators, an octave above the root
        let p = 0;
        let hi = 0; // for a phone: the same chord two octaves up (300 to 520 Hz and its harmonics), where a phone plays
        for (let v = 0; v < 3; v++) {
          const fa = root * 2 * semi(cur[v]);
          const fb = root * 2 * semi(prev[v]);
          const ph = T * fa;
          const phb = T * fb;
          p += x * (read(padWave, ph * 1.0015) + read(padWave, ph * 0.9985)) + (1 - x) * (read(padWave, phb * 1.0015) + read(padWave, phb * 0.9985));
          if (phone) hi += x * read(padWave, ph * 2.003) + (1 - x) * read(padWave, phb * 2.003);
        }
        const cutoff = 0.05 + 0.03 * Math.sin(TAU * 0.031 * T) + 0.04 * drive + 0.1 * phone;
        lpL += cutoff * (p - lpL);
        lpHi += (0.12 + 0.06 * drive) * (hi - lpHi);
        // the bass: the chord's root, on each half bar, a soft attack and a long tail
        const half = beat * 2;
        const kb = (T % half) / half;
        const bassEnv = Math.min(1, (T % half) / 0.03) * Math.exp(-kb * 2.2);
        const fr = root * semi(cur[0] < 0 ? cur[0] + 12 : cur[0]) / (cur[0] > 5 ? 2 : 1);
        const bassRaw =
          Math.sin(TAU * fr * T) + 0.35 * Math.sin(TAU * 2 * fr * T) + phone * (0.32 * Math.sin(TAU * 3 * fr * T) + 0.22 * Math.sin(TAU * 4 * fr * T) + 0.14 * Math.sin(TAU * 5 * fr * T));
        lpBass += 0.2 * (bassRaw - lpBass);
        let out = (lpL * 0.22 + lpBass * 0.5 * bassEnv) * (1 - 0.45 * phone) + lpHi * 0.09 * phone; // a phone: less of what it cannot play, more of what it can
        const arp = Math.max(drive, 0.5 * phone);
        if (arp > 0.01) {
          // the arpeggio: eighth notes over the chord, two octaves up, plucked (doubled an octave higher for a phone)
          const e = beat / 2;
          const n = Math.floor(T / e);
          const te = T - n * e;
          const order = [0, 1, 2, 1, 2, 0, 1, 2];
          const fa = root * 4 * semi(cur[order[n % 8]]);
          const env = Math.exp(-te * 9) * Math.min(1, te / 0.004);
          out += arp * 0.16 * (1 + 0.8 * phone) * (read(pluck, T * fa) + 0.9 * phone * read(pluck, T * fa * 2)) * env;
        }
        if (drive > 0.01) {
          // a soft kick on beats one and three (and, for a phone, its tick)
          const kbt = T % (beat * 2);
          if (kbt < 0.3) {
            out += drive * 0.42 * Math.sin(TAU * (48 + 60 * Math.exp(-kbt * 30)) * kbt) * Math.exp(-kbt * 11);
            out += drive * phone * 0.1 * Math.sin(TAU * 1100 * kbt) * Math.exp(-kbt * 70);
          }
        }
        return out * g * level * edge;
      }, bus);
    },
    // a hit with weight: pitch-dropping sub + a short dull transient. The sub is for headphones;
    // a phone plays the saturated body (240 Hz and its odd harmonics) and, on the hits that count
    // (above −14 dB, full above −10), a short crack around 2 kHz. Same peak as the sub alone.
    // `crack` (0…1): the 2 kHz crack forced in, whatever the level (a phone plays it; the default follows the gain)
    impact({ at: ref, gain = -12, size = 1, crack }) {
      const t0 = at(ref);
      const noise = rng(Math.round(t0 * 1000) + 7);
      const snap = crack ?? Math.max(0, Math.min(1, (gain + 14) / 4));
      const n = Math.round(1.6 * size * SR);
      const buf = new Float32Array(n);
      let lp = 0;
      let hi = 0;
      let phase = 0;
      let knock = 0;
      let body = 0;
      let crackLow = 0;
      let crackBand = 0;
      let subPeak = 0;
      let peak = 0;
      const fc = 2 * Math.sin((Math.PI * 2000) / SR);
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const f = 36 + 80 * Math.exp(-t / (0.07 * size));
        phase += (TAU * f) / SR;
        knock += (TAU * (95 + 150 * Math.exp(-t / 0.03))) / SR; // mid-range body
        body += (TAU * (240 + 110 * Math.exp(-t / 0.02))) / SR;
        const x = noise() * 2 - 1;
        lp += 0.09 * (x - lp);
        hi += 0.35 * (x - hi);
        const high = x - crackLow - 1.2 * crackBand;
        crackBand += fc * high;
        crackLow += fc * crackBand;
        const edge = Math.min(1, t / 0.003);
        const sub =
          (Math.sin(phase) * Math.exp(-t / (0.38 * size)) +
            Math.sin(knock) * 0.55 * Math.exp(-t / (0.13 * size)) +
            lp * 1.4 * Math.exp(-t / 0.05) +
            (hi - lp) * 0.5 * Math.exp(-t / 0.035)) *
          edge;
        const mid = Math.tanh(Math.sin(body) * 4) * BODY * Math.exp(-t / (0.08 * size)) * edge;
        const crack = crackBand * CRACK * snap * Math.exp(-t / 0.014) * edge;
        buf[i] = sub + mid + crack;
        subPeak = Math.max(subPeak, Math.abs(sub));
        peak = Math.max(peak, Math.abs(buf[i]));
      }
      const g = db(gain) * Math.min(1, subPeak / peak);
      write(t0, n / SR, 0, (t) => buf[Math.min(n - 1, Math.round(t * SR))] * g);
    },
    // air moving past: band-passed noise that swells and passes
    whoosh({ at: ref, dur = 1.2, gain = -22 }) {
      const t0 = at(ref) - dur / 2;
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 11);
      let low = 0;
      let band = 0;
      const pan0 = noise() > 0.5 ? -0.7 : 0.7;
      const i0 = Math.max(0, Math.round(t0 * SR));
      const i1 = Math.min(N, Math.round((t0 + dur) * SR));
      for (let i = i0; i < i1; i++) {
        const u = (i - i0) / (i1 - i0);
        const fc = 280 + 2400 * Math.sin(Math.PI * u) ** 2;
        const f = 2 * Math.sin((Math.PI * fc) / SR);
        const high = noise() * 2 - 1 - low - 0.5 * band;
        band += f * high;
        low += f * band;
        const v = band * Math.sin(Math.PI * u) ** 2 * g;
        const pan = pan0 * (1 - 2 * u);
        fx.L[i] += v * Math.cos(((pan + 1) * Math.PI) / 4) * 1.414;
        fx.R[i] += v * Math.sin(((pan + 1) * Math.PI) / 4) * 1.414;
      }
    },
    // the LED firing: a small glassy tick; "heavy" adds body when it hits smoke
    blip({ at: ref, gain = -20, pitch = 1, heavy = false, pan = 0 }) {
      const t0 = at(ref);
      const g = db(gain);
      write(t0, 0.5, pan, (t) => {
        const ping = Math.sin(TAU * 1380 * pitch * t) * Math.exp(-t / 0.045) + Math.sin(TAU * 2070 * pitch * t) * 0.35 * Math.exp(-t / 0.03);
        const body = heavy ? Math.sin(TAU * 140 * t) * 0.9 * Math.exp(-t / 0.09) : 0;
        return (ping + body) * g * Math.min(1, t / 0.0015);
      });
    },
    tick({ at: ref, count = 1, every = 1, gain = -24 }) {
      const t0 = at(ref);
      const g = db(gain);
      const bus = count > 3 ? fx : undefined; // a burst is a texture, a single tick is a punctuation
      for (let k = 0; k < count; k++) {
        write(t0 + k * every, 0.12, k % 2 ? 0.15 : -0.15, (t) => (Math.sin(TAU * 920 * t) * Math.exp(-t / 0.012) + Math.sin(TAU * 2600 * t) * 0.5 * Math.exp(-t / 0.004)) * g, bus);
      }
    },
    // piezo sounder: hard, nasal, on/off
    beeps({ from, to, gain = -16, freq = 3100, on = 0.15, off = 0.11 }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const period = on + off;
      write(t0, t1 - t0, 0, (t) => {
        const ph = t % period;
        if (ph > on) return 0;
        const env = Math.min(1, ph / 0.004) * Math.min(1, (on - ph) / 0.006) * Math.min(1, (t1 - t0 - t) / 0.2 + 0.0001);
        return (Math.sin(TAU * freq * t) + 0.33 * Math.sin(TAU * freq * 3 * t) + 0.12 * Math.sin(TAU * freq * 0.5 * t)) * 0.7 * env * g;
      });
    },
    // tension climbing into a moment
    riser({ to, dur = 1, gain = -22 }) {
      const t1 = at(to);
      const g = db(gain);
      const noise = rng(Math.round(t1 * 1000) + 5);
      let lp = 0;
      let phase = 0;
      write(t1 - dur, dur, 0, (t) => {
        const u = t / dur;
        phase += (TAU * (90 + 520 * u * u)) / SR;
        lp += (0.02 + 0.25 * u) * (noise() * 2 - 1 - lp);
        return (Math.sin(phase) * 0.6 + lp * 0.9) * u * u * g;
      }, fx);
    },
    // "body": a heart the phone can play (a mid thump and the click of the valve), for the beats
    // that are the point of the scene; without it, a low pulse felt on headphones only
    heartbeat({ from, to, bpm = 54, gain = -24, body = false }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const period = 60 / bpm;
      for (let t = t0; t < t1 - 0.3; t += period) {
        for (const [dt, k] of [[0, 1], [0.24, 0.7]]) {
          let phase = 0;
          let thump = 0;
          write(t + dt, 0.3, 0, (x) => {
            phase += (TAU * (64 + 60 * Math.exp(-x / 0.03))) / SR;
            thump += (TAU * (190 + 120 * Math.exp(-x / 0.02))) / SR;
            const mid = body ? Math.sin(thump) * 0.55 * Math.exp(-x / 0.05) + (Math.sin(TAU * 620 * x) + 0.5 * Math.sin(TAU * 930 * x)) * VALVE * Math.exp(-x / 0.018) : 0;
            return (Math.sin(phase) + 0.45 * Math.sin(phase * 2) + mid) * Math.exp(-x / 0.07) * k * g * Math.min(1, x / 0.004) * Math.min(1, (t1 - t) / 1.2);
          }, under);
        }
      }
    },
    // the film running backwards to its first frame
    rewind({ at: ref, dur = 1.1, gain = -20 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(91);
      let lp = 0;
      let phase = 0;
      write(t0, dur, 0, (t) => {
        const u = t / dur;
        phase += (TAU * (180 + 1500 * u * u)) / SR;
        lp += 0.3 * (noise() * 2 - 1 - lp);
        const flutter = 0.6 + 0.4 * Math.sin(TAU * (14 + 40 * u) * t);
        return (Math.sin(phase) * 0.5 + lp * 0.6) * flutter * Math.sin(Math.PI * Math.min(1, u * 1.04)) ** 0.7 * g;
      }, fx);
    },
    // lightning striking close: the crack — a tearing burst around 2 kHz, what a phone plays — then
    // the roll: the same sound arriving again and again from farther up the channel, darker each time
    thunder({ at: ref, gain = -8, dur = 4.5 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 23);
      const echo = rng(41);
      const hits = Array.from({ length: 9 }, (_, k) => [k === 0 ? 0 : 0.12 + k * 0.33 * (0.7 + 0.6 * echo()), Math.pow(0.72, k) * (0.7 + 0.5 * echo())]);
      const fc = 2 * Math.sin((Math.PI * 1800) / SR);
      let lp1 = 0;
      let lp2 = 0;
      let bandL = 0;
      let bandB = 0;
      write(t0, dur, 0, (t) => {
        const x = noise() * 2 - 1;
        const high = x - bandL - 0.9 * bandB;
        bandB += fc * high;
        bandL += fc * bandB;
        lp1 += 0.07 * (x - lp1); // under ≈ 500 Hz: the body of the roll
        lp2 += 0.022 * (x - lp2); // under ≈ 150 Hz: its weight, for headphones
        const crack = (bandB * 0.9 + (x - lp1) * 0.3) * Math.exp(-t / 0.05) * Math.min(1, t / 0.002);
        let env = 0;
        for (const [d, a] of hits) {
          const u = t - d;
          if (u > 0) env += a * Math.min(1, u / 0.02) * Math.exp(-u / 0.42);
        }
        return (crack + (lp1 * 1.6 + lp2 * 3.2) * env) * g * Math.min(1, (dur - t) / 0.6);
      });
    },
    // rain between two moments: a hiss with a little grain, under the voice
    rain({ from, to, gain = -30 }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const noise = rng(57);
      let lp = 0;
      let lp2 = 0;
      write(t0, t1 - t0, 0, (t) => {
        const x = noise() * 2 - 1;
        lp += 0.45 * (x - lp);
        lp2 += 0.06 * (x - lp2);
        const env = Math.min(1, t / 0.5) * Math.min(1, (t1 - t0 - t) / 0.5);
        return (lp - lp2) * (0.8 + 0.2 * Math.sin(TAU * 0.31 * t)) * env * g;
      }, under);
    },
    // a spark: a short gritty buzz in the consonant band (one bound of a leader, an arc that jumps)
    zap({ at: ref, gain = -20, dur = 0.09, pan = 0 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 31);
      let lp = 0;
      let hp = 0;
      write(t0, dur + 0.05, pan, (t) => {
        const x = noise() * 2 - 1;
        lp += 0.5 * (x - lp);
        hp += 0.12 * (lp - hp);
        const buzz = Math.sin(TAU * 118 * t) > 0 ? 1 : 0.25;
        return (lp - hp) * buzz * Math.exp(-t / (dur * 0.5)) * Math.min(1, t / 0.001) * g;
      }, fx);
    },
    // gas leaving a burner: a steady band of high noise with a thin whistle in it (`tone` 1) — or, at `tone` 0,
    // something wetter and lower that spits: a pan boiling over onto a flame. It ends short: the valve shuts.
    hiss({ from, to, gain = -26, tone = 1 }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 73);
      const k = 0.1 + 0.16 * tone; // where the band starts: higher for dry gas
      let lp = 0;
      let hp = 0;
      let spit = 0;
      write(t0, t1 - t0, 0, (t) => {
        const x = noise() * 2 - 1;
        lp += 0.7 * (x - lp);
        hp += k * (lp - hp);
        if (noise() < (1 - tone) * 0.0009) spit = 1; // droplets on hot metal
        spit *= 0.9985;
        const whistle = Math.sin(TAU * 3400 * t) * 0.05 * tone;
        const env = Math.min(1, t / 0.18) * Math.min(1, (t1 - t0 - t) / 0.05);
        return ((lp - hp) * (0.85 + 0.15 * Math.sin(TAU * 0.23 * t) + (1 - tone) * 0.9 * spit) + whistle) * env * g;
      }, under);
    },
    // a spring-loaded valve snapping shut: the click of metal on its seat — what a phone plays — and the knock of the body behind it
    clack({ at: ref, gain = -8, pan = 0 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 17);
      let lp = 0;
      write(t0, 0.3, pan, (t) => {
        lp += 0.6 * (noise() * 2 - 1 - lp);
        const click = (Math.sin(TAU * 2900 * t) + 0.6 * Math.sin(TAU * 4300 * t) + lp * 0.8) * Math.exp(-t / 0.006);
        const u = Math.max(0, t - 0.011);
        const knock = t < 0.011 ? 0 : (Math.sin(TAU * 520 * u) + 0.5 * Math.sin(TAU * 860 * u) + 0.35 * Math.sin(TAU * 190 * u)) * Math.exp(-u / 0.035);
        return (click * 0.7 + knock) * Math.min(1, t / 0.0006) * g;
      });
    },

    /* ── THE PHONE GRID (2026-10-21) — what a phone speaker plays: everything here lives between 600 Hz and 5 kHz.
       Measured on the beds of 010 to 025: from the end of the first second to the 25th, the best film of the account
       (015) gives a phone THREE attacks it can hear, 024 three, 025 two; only 010 (eighteen) is heard. These place one
       on what the picture does: a keyword, a fast move, a piece that lands, a car that lets go, the silence before
       « Alors… on l'ouvre ». Never over a word: in the breaths between them (the voice's own gaps). ── */

    // THE WORD THAT HITS (with D.punch on the same cue) — and a cut, a title that is struck: a short bright knock.
    hit({ at: ref, gain = -14, pitch = 1, pan = 0 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 101);
      const fc = 2 * Math.sin((Math.PI * 3000) / SR);
      let lo = 0;
      let band = 0;
      let ph = 0;
      write(t0, 0.36, pan, (t) => {
        const x = noise() * 2 - 1;
        const hp = x - lo - 1.1 * band;
        band += fc * hp;
        lo += fc * band;
        ph += (TAU * (330 + 140 * Math.exp(-t / 0.03)) * pitch) / SR;
        const click = band * 1.3 * Math.exp(-t / 0.006);
        const body = Math.tanh(Math.sin(ph) * 3) * 0.55 * Math.exp(-t / 0.06);
        const snap = Math.sin(TAU * 1650 * pitch * t) * 0.35 * Math.exp(-t / 0.025);
        return (click + body + snap) * g * Math.min(1, t / 0.0008);
      });
    },
    // A PIECE THAT LANDS (each part of the exploded view, on its word): a small mechanical click, light.
    click({ at: ref, gain = -18, pitch = 1, pan = 0 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 131);
      let lo = 0;
      write(t0, 0.14, pan, (t) => {
        lo += 0.5 * (noise() * 2 - 1 - lo);
        const tick = (Math.sin(TAU * 3200 * pitch * t) + 0.6 * Math.sin(TAU * 4700 * pitch * t) + lo * 0.7) * Math.exp(-t / 0.004);
        const u = Math.max(0, t - 0.006);
        const knock = t < 0.006 ? 0 : Math.sin(TAU * 900 * pitch * u) * 0.6 * Math.exp(-u / 0.02);
        return (tick + knock) * g * Math.min(1, t / 0.0005);
      });
    },
    // A FAST MOVE OF THE CAMERA (a rise, a turn, a pull-back): air that passes higher and quicker than the whoosh.
    // On the effects bus: heard in the breaths, it steps back under a phrase.
    swish({ at: ref, dur = 0.45, gain = -18 }) {
      const t0 = at(ref) - dur / 2;
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 151);
      let low = 0;
      let band = 0;
      write(t0, dur, 0, (t) => {
        const u = t / dur;
        const fcHz = 700 + 3500 * Math.sin(Math.PI * Math.min(1, u * 1.25)) ** 2;
        const f = 2 * Math.sin((Math.PI * fcHz) / SR);
        const high = noise() * 2 - 1 - low - 0.45 * band;
        band += f * high;
        low += f * band;
        return band * Math.sin(Math.PI * u) ** 2 * g;
      }, fx);
    },
    // TYRES THAT LET GO (a car skids, spins, swerves): a squeal — a tone round 1 kHz that stutters, and its grit.
    // On the effects bus, like the swish.
    screech({ from, to, gain = -24, pitch = 1 }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 171);
      let ph = 0;
      let wob = 0;
      let lo = 0;
      let band = 0;
      const fc = 2 * Math.sin((Math.PI * 3200) / SR);
      write(t0, t1 - t0, 0, (t) => {
        const x = noise() * 2 - 1;
        wob += 0.0008 * (x - wob);
        const f = 1050 * pitch * (1 + 0.05 * Math.sin(TAU * 5.3 * t) + 0.035 * Math.sin(TAU * 11.7 * t + 1) + 2.5 * wob);
        ph += (TAU * f) / SR;
        const hp = x - lo - 0.8 * band;
        band += fc * hp;
        lo += fc * band;
        const tone = (Math.sin(ph) + 0.45 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) * (0.72 + 0.28 * Math.sin(TAU * 23 * t));
        const env = Math.min(1, t / 0.06) * Math.min(1, (t1 - t0 - t) / 0.25);
        return (tone * 0.6 + band * 0.35) * env * g;
      }, fx);
    },
    // THE BREATH IN, BEFORE « ALORS… » : a reverse swell that rises into `to` and stops dead — the silence that
    // follows is what makes the calm line land. Put it in the gap before the line; pair it with "hush".
    suck({ to, dur = 0.7, gain = -18 }) {
      const t1 = at(to);
      const g = db(gain);
      const noise = rng(Math.round(t1 * 1000) + 191);
      let low = 0;
      let band = 0;
      let ph = 0;
      write(t1 - dur, dur, 0, (t) => {
        const u = t / dur;
        const fcHz = 300 + 2700 * u * u;
        const f = 2 * Math.sin((Math.PI * fcHz) / SR);
        const high = noise() * 2 - 1 - low - 0.6 * band;
        band += f * high;
        low += f * band;
        ph += (TAU * (220 + 1000 * u * u)) / SR;
        return (band * 0.8 + Math.sin(ph) * 0.25) * u * u * u * g * Math.min(1, (dur - t) / 0.003);
      });
    },
    // SILENCE: the whole bed steps back by `depth` dB between `from` and `to` (40 ms in, 120 ms out) — around the
    // signature line, or the instant before a hit. The voice is not touched.
    hush({ from, to, depth = -16 }) {
      hushes.push([at(from), at(to), db(depth)]);
    },

    /* ── THE PROMO'S GRID (2026-10-21) — the hors-séries (HSnn): the trailer of a long, on a phone. HS01 and HS02
       had seven sounds for a minute (a drone, four impacts, a riser, a blip): ONE attack a phone could hear in their
       first 25 s (010: 18), seven open threads that opened in silence, and the answer kept for YouTube cut to black
       over a drone that went on. These are the trailer's punctuation: the thread that opens (a step higher each time),
       the horn of the rendezvous, the cut that kills the bed dead on the answer we do not give. Each one lands in a
       breath of the voice — moved to the next one if its moment falls on a word (breathAfter). All opt-in: a list
       without them renders as before, to the byte. ── */

    // THREADS THAT OPEN (with D.threads on the picture: the header's counter pops): a tick, a low knock and a bright
    // ping that climbs a step at each thread (n = 1, 2, … up a minor scale from G5): the questions are HEARD piling up.
    // `at`: a moment or a list (n = from, from + 1, …); without it, the script's cues fil1, fil2, … in order.
    threads({ at: refs, gain = -16, from = 1, base = 784 }) {
      const moments = refs == null ? threadCues(sched.cues) : [].concat(refs);
      const STEP = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];
      const g = db(gain);
      // a thread that opens on a cut (a "cliff" of the list): the cut is its sound — no ping in a silence
      const cuts = list.filter((x) => x.type === "cliff").map((x) => [breathAfter(sched.beats, at(x.at), 0.05), x.dur ?? 0.6]);
      moments.forEach((ref, k) => {
        const t0 = breathAfter(sched.beats, at(ref), 0.08); // (its attack needs 80 ms: the ping may ring under the next word)
        if (cuts.some(([c, d]) => t0 > c - 0.12 && t0 < c + d)) return;
        const f = base * Math.pow(2, STEP[Math.min(STEP.length - 1, from + k - 1)] / 12);
        const noise = rng(Math.round(t0 * 1000) + 211);
        let lo = 0;
        write(t0, 0.45, 0, (t) => {
          const x = noise() * 2 - 1;
          lo += 0.35 * (x - lo);
          const tick = (x - lo) * Math.exp(-t / 0.003);
          const knock = Math.tanh(Math.sin(TAU * (230 + 120 * Math.exp(-t / 0.01)) * t) * 2.5) * 0.45 * Math.exp(-t / 0.035);
          const ping = (Math.sin(TAU * f * t) + 0.32 * Math.sin(TAU * f * 2.005 * t) + 0.1 * Math.sin(TAU * f * 3.01 * t)) * 0.7 * Math.exp(-t / 0.12);
          return (tick * 0.8 + knock + ping) * g * Math.min(1, t / 0.0006);
        });
      });
    },
    // THE HORN OF THE RENDEZVOUS (a trailer's « braam »): a brass chord on D — root, its double, the fifth and the
    // octaves, raw saws through a filter that opens in 50 ms and closes over the swell — a sub for headphones, its
    // partials up to ≈ 3 kHz for a phone. On the cut to the long's title (#film), in the breath before the call.
    braam({ at: ref, gain = -15, dur = 1.8, root = 36.71 }) {
      const t0 = breathAfter(sched.beats, at(ref), 0.25);
      const g = db(gain);
      const V = [[1, 1], [1.006, 0.8], [1.5, 0.55], [2, 0.6], [2.004, 0.45], [3, 0.35], [4.01, 0.25]];
      const ph = V.map((_, k) => k * 0.37);
      let a = 0;
      let b = 0;
      write(t0, dur, 0, (t) => {
        let s = 0;
        V.forEach(([m, w], k) => {
          ph[k] += (root * m * (1 + 0.0035 * Math.sin(TAU * (0.9 + k * 0.23) * t))) / SR;
          s += (2 * (ph[k] % 1) - 1) * w;
        });
        const fcHz = 140 + 2900 * Math.min(1, t / 0.05) * Math.exp(-t / (0.32 * dur));
        const c = 1 - Math.exp((-TAU * fcHz) / SR);
        a += c * (s - a);
        b += c * (a - b);
        const env = Math.min(1, t / 0.012) * Math.pow(Math.max(0, 1 - t / dur), 1.7);
        return Math.tanh(b * 0.9) * env * g;
      });
    },
    // THE ANSWER WE DO NOT GIVE (with D.cliff on the picture, the same instant): at `at` the whole bed winds down
    // like a tape that stops (`tape` s, its pitch falling) and goes dead for `dur` s — only a boom rings in the
    // silence — then comes back in `back` s. The voice is not touched. `at` (the black) is moved to a breath.
    cliff({ at: ref, dur = 0.6, back = 0.3, tape = 0.22, gain = -13 }) {
      const t0 = breathAfter(sched.beats, at(ref), 0.05);
      cliffs.push([t0, tape, dur, back]);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 261);
      let ph = 0;
      let bp = 0;
      let lo = 0;
      let band = 0;
      const fc = 2 * Math.sin((Math.PI * 2400) / SR);
      write(t0, 1.6, 0, (t) => {
        ph += (TAU * (30 + 48 * Math.exp(-t / 0.08))) / SR;
        bp += (TAU * (125 + 80 * Math.exp(-t / 0.02))) / SR;
        const x = noise() * 2 - 1;
        const hp = x - lo - 1.1 * band;
        band += fc * hp;
        lo += fc * band;
        const sub = Math.sin(ph) * Math.exp(-t / 0.5);
        const body = Math.tanh(Math.sin(bp) * 3.5) * 0.5 * Math.exp(-t / 0.15);
        const snap = band * 0.7 * Math.exp(-t / 0.012);
        return (sub + body + snap) * 0.62 * g * Math.min(1, t / 0.002);
      }, lateBus());
    },

    /* ── THE LONG FORMAT'S GRID (2026-10-21) — a computer, a television, headphones: the bed was mono (side/middle
       −43 dB on L02), one four-chord loop for nine minutes (24 times round), three sounds tied to the picture in
       a chapter of a minute. These give it width, sections, a room, a place that sounds, and the contrast of the
       moments that count (a silence, then a boom). All opt-in: a list without them renders as before, to the byte. ── */

    // THE SCORE: `music` with `width` or `sections` comes here (see the dispatch below). Stereo — the pad's three
    // voices spread, each side detuned its own way, the arpeggio from side to side, bass and kick in the middle —
    // and in sections: at each chapter card (`skip`: cards that do not turn it) the harmony takes the next
    // progression of `palette` (PROG) and starts on the card; `drop` (s): the music is silent just before each card,
    // the card lands on a breath. Where `drive` passes 0.6, a pulse (a muted sixteenth on the root: the clock of the
    // test). On its own bus, down by `duck` (dB) under each phrase. "curve": [[moment, level, drive], …].
    score({ gain = -24, bpm = 84, root = 73.42, curve = [[0, 1, 0]], from = 0, to, phone = 0, fadeIn = 2, duck: musDuck = duck, width = 0.6, sections = "chapters", skip = [], drop = 0.45, lead = 0.9, palette = [0, 1, 2, 3] }) {
      mus.duck = musDuck;
      const pts = curve.map(([ref, level, drive = 0]) => [at(ref), level, drive]).sort((a, b) => a[0] - b[0]);
      const valueAt = (t, k) => {
        if (t <= pts[0][0]) return pts[0][k];
        for (let j = 1; j < pts.length; j++) {
          if (t < pts[j][0]) {
            const u = (t - pts[j - 1][0]) / (pts[j][0] - pts[j - 1][0]);
            return pts[j - 1][k] + (pts[j][k] - pts[j - 1][k]) * (u * u * (3 - 2 * u));
          }
        }
        return pts.at(-1)[k];
      };
      const t0 = at(from);
      const t1 = to == null ? total : at(to);
      // the sections: [start, progression] — by chapter (the section that starts at card k plays palette[k])
      const marks = [[t0, palette[0]]];
      if (Array.isArray(sections)) sections.forEach((ref, k) => marks.push([at(ref), palette[(k + 1) % palette.length]]));
      else if (sections) sched.beats.filter((b) => b.chap).forEach((b, k) => k > 0 && !skip.includes(b.id) && marks.push([cardAt(b, lead), palette[k % palette.length]]));
      const bounds = marks.filter(([m]) => m >= t0 && m < t1 - 1).sort((a, b) => a[0] - b[0]);
      const beat = 60 / bpm;
      const span = beat * 8; // two bars a chord
      const g = db(gain);
      const w = Math.max(0, Math.min(1, width));
      const pans = [-0.8 * w, 0, 0.8 * w].map((p) => [Math.cos(((p + 1) * Math.PI) / 4) * 1.414, Math.sin(((p + 1) * Math.PI) / 4) * 1.414]);
      let lpL = 0;
      let lpR = 0;
      let lpHiL = 0;
      let lpHiR = 0;
      let lpBass = 0;
      let k = 0;
      writeLR(t0, t1 - t0, (t, i, out) => {
        const T = t0 + t;
        while (k + 1 < bounds.length && T >= bounds[k + 1][0]) k++;
        const [s0, prog] = bounds[k];
        const next = bounds[k + 1]?.[0] ?? Infinity;
        const P = PROG[prog];
        const Ts = T - s0; // the section's own clock: its first chord lands on the card
        const level = valueAt(T, 1);
        const drive = valueAt(T, 2);
        const edge = Math.min(1, t / fadeIn) * Math.min(1, (t1 - T) / 1.5);
        // the drop: silent `drop` s before the next card (60 ms out), back on the card (25 ms in)
        const gate = Math.min(1, Math.max(0, (next - drop - T) / 0.06) + (T >= next ? 1 : 0)) * (k > 0 ? Math.min(1, Ts / 0.025) : 1);
        const c = Math.floor(Ts / span);
        const u = (Ts - c * span) / span;
        const cur = P[c % 4];
        const prev = c > 0 ? P[(c - 1) % 4] : cur;
        const x = Math.min(1, u / 0.12);
        let pl = 0;
        let pr = 0;
        let hl = 0;
        let hr = 0;
        for (let v = 0; v < 3; v++) {
          const fa = root * 2 * semi(cur[v]);
          const fb = root * 2 * semi(prev[v]);
          const ph = T * fa;
          const phb = T * fb;
          // each side its own detune: the width is in the beating, not only in the pan
          const sl = x * (readWT(PAD, ph * 1.0015) + readWT(PAD, ph * 0.9979)) + (1 - x) * (readWT(PAD, phb * 1.0015) + readWT(PAD, phb * 0.9979));
          const sr = x * (readWT(PAD, ph * 1.0021) + readWT(PAD, ph * 0.9985)) + (1 - x) * (readWT(PAD, phb * 1.0021) + readWT(PAD, phb * 0.9985));
          pl += sl * pans[v][0];
          pr += sr * pans[v][1];
          if (phone) {
            const hv = x * readWT(PAD, ph * 2.003) + (1 - x) * readWT(PAD, phb * 2.003);
            hl += hv * pans[2 - v][0];
            hr += hv * pans[2 - v][1];
          }
        }
        const cutoff = 0.05 + 0.03 * Math.sin(TAU * 0.031 * T) + 0.04 * drive + 0.1 * phone;
        lpL += cutoff * (pl - lpL);
        lpR += cutoff * (pr - lpR);
        lpHiL += (0.12 + 0.06 * drive) * (hl - lpHiL);
        lpHiR += (0.12 + 0.06 * drive) * (hr - lpHiR);
        const half = beat * 2;
        const kb = (Ts % half) / half;
        const bassEnv = Math.min(1, (Ts % half) / 0.03) * Math.exp(-kb * 2.2);
        let bn = cur[0];
        while (bn < -2) bn += 12;
        while (bn > 7) bn -= 12;
        const fr = root * semi(bn);
        const bassRaw = Math.sin(TAU * fr * T) + 0.35 * Math.sin(TAU * 2 * fr * T) + phone * (0.32 * Math.sin(TAU * 3 * fr * T) + 0.22 * Math.sin(TAU * 4 * fr * T));
        lpBass += 0.2 * (bassRaw - lpBass);
        const mid = lpBass * 0.5 * bassEnv * (1 - 0.45 * phone);
        let l = lpL * 0.22 * (1 - 0.45 * phone) + lpHiL * 0.09 * phone + mid;
        let r = lpR * 0.22 * (1 - 0.45 * phone) + lpHiR * 0.09 * phone + mid;
        const arp = Math.max(drive, 0.5 * phone);
        if (arp > 0.01) {
          const e = beat / 2;
          const n = Math.floor(Ts / e);
          const te = Ts - n * e;
          const order = ARP[prog % ARP.length];
          const fa = root * 4 * semi(cur[order[n % 8]]);
          const env = Math.exp(-te * 9) * Math.min(1, te / 0.004);
          const note = arp * 0.16 * (1 + 0.8 * phone) * (readWT(PLUCK, T * fa) + 0.9 * phone * readWT(PLUCK, T * fa * 2)) * env;
          const side = n % 2 ? 0.55 * w : -0.55 * w; // eighth notes from side to side
          l += note * (1 - side);
          r += note * (1 + side);
        }
        if (drive > 0.01) {
          const kbt = Ts % (beat * 2);
          if (kbt < 0.3) {
            const kick = drive * 0.42 * Math.sin(TAU * (48 + 60 * Math.exp(-kbt * 30)) * kbt) * Math.exp(-kbt * 11) + drive * phone * 0.1 * Math.sin(TAU * 1100 * kbt) * Math.exp(-kbt * 70);
            l += kick;
            r += kick;
          }
        }
        if (drive > 0.6) {
          // the pulse: a muted sixteenth on the root, an octave up — the clock under the test
          const s16 = beat / 4;
          const tp = Ts % s16;
          const p = ((drive - 0.6) / 0.4) * 0.11 * readWT(PLUCK, T * root * 2) * Math.exp(-tp * 34) * Math.min(1, tp / 0.002);
          l += p * 0.9;
          r += p * 1.1;
        }
        const k2 = g * level * edge * gate;
        out[0] = l * k2;
        out[1] = r * k2;
      }, mus);
    },
    // A SWELL into a moment (under a chapter card): two noises, one a side, rising and brightening into `to`, where
    // the boom takes over. In the silence before the card; on the effects bus.
    swell({ to, dur = 0.85, gain = -22 }) {
      const t1 = at(to);
      const g = db(gain);
      const nl = rng(Math.round(t1 * 1000) + 211);
      const nr = rng(Math.round(t1 * 1000) + 223);
      const st = [0, 0, 0, 0];
      writeLR(t1 - dur, dur, (t, i, out) => {
        const u = t / dur;
        const f = 2 * Math.sin((Math.PI * (250 + 3800 * u * u)) / SR);
        const hl = nl() * 2 - 1 - st[0] - 0.55 * st[1];
        st[1] += f * hl;
        st[0] += f * st[1];
        const hr = nr() * 2 - 1 - st[2] - 0.55 * st[3];
        st[3] += f * hr;
        st[2] += f * st[3];
        const env = u * u * u * g * Math.min(1, (dur - t) / 0.004);
        out[0] = st[1] * env;
        out[1] = st[3] * env;
      }, fx);
    },
    // THE BOOM (a chapter card, the two or three moments of the film that must hit): a sub that drops (the
    // television), a saturated body round 120 Hz (a laptop plays it), a crack round 2.6 kHz (everything plays it),
    // and the body echoed 11 ms later on the other side — width without a room. With "space": its tail.
    boom({ at: ref, gain = -12, size = 1, crack = 0.7 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 241);
      const n = Math.round(2.2 * size * SR);
      const mono = new Float32Array(n);
      let ph = 0;
      let bp = 0;
      let lo = 0;
      let band = 0;
      const fc = 2 * Math.sin((Math.PI * 2600) / SR);
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        ph += (TAU * (28 + 52 * Math.exp(-t / (0.09 * size)))) / SR;
        bp += (TAU * (118 + 90 * Math.exp(-t / 0.025))) / SR;
        const x = noise() * 2 - 1;
        const hp = x - lo - 1.1 * band;
        band += fc * hp;
        lo += fc * band;
        const sub = Math.sin(ph) * Math.exp(-t / (0.55 * size));
        const body = Math.tanh(Math.sin(bp) * 3.5) * 0.5 * Math.exp(-t / (0.16 * size));
        const snap = band * crack * Math.exp(-t / 0.012);
        mono[i] = (sub + body + snap) * Math.min(1, t / 0.002);
      }
      const d = Math.round(0.011 * SR);
      let peak = 0;
      for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(mono[i]));
      const gp = g / Math.max(1e-6, peak); // `gain` is the boom's peak, like the impact's
      writeLR(t0, n / SR, (t, i, out) => {
        const j = Math.round(t * SR);
        const a = mono[Math.min(n - 1, j)];
        const b = j >= d ? mono[Math.min(n - 1, j - d)] : 0;
        out[0] = (a * 0.85 + b * 0.25) * gp;
        out[1] = (a * 0.85 - b * 0.1) * gp;
      }, main, 0.9);
    },
    // A CHORD STRUCK (with the boom, under a card): the section's first chord, an octave and two up, a fast attack
    // and a long ring that darkens — the music answering the cut. Stereo; with "space", its tail.
    sting({ at: ref, gain = -21, chord = [0, 3, 7], root = 73.42, dur = 2.6 }) {
      const t0 = at(ref);
      const g = db(gain);
      const w = [[1.414 * Math.cos(Math.PI * 0.1), 1.414 * Math.sin(Math.PI * 0.1)], [1, 1], [1.414 * Math.cos(Math.PI * 0.4), 1.414 * Math.sin(Math.PI * 0.4)]];
      let lpl = 0;
      let lpr = 0;
      writeLR(t0, dur, (t, i, out) => {
        const T = t0 + t;
        let l = 0;
        let r = 0;
        for (let v = 0; v < 3; v++) {
          const f = root * 4 * semi(chord[v]);
          const s = readWT(PAD, T * f * 1.002) + readWT(PAD, T * f * 0.998) + 0.5 * readWT(PAD, T * f * 0.5);
          l += s * w[v][0];
          r += s * w[v][1];
        }
        const cut = 0.04 + 0.5 * Math.exp(-t / 0.18); // bright on the strike, darker as it rings
        lpl += cut * (l - lpl);
        lpr += cut * (r - lpr);
        const env = Math.min(1, t / 0.008) * Math.exp(-t / 0.6) * Math.min(1, (dur - t) / 0.3) * g * 0.22;
        out[0] = lpl * env;
        out[1] = lpr * env;
      }, main, 0.7);
    },
    // THE PLACE THAT SOUNDS, in stereo, under the voice like the drone: "hum" (a substation, a transformer: 100 Hz and
    // its harmonics, the corona's crackle — the crackle is what a laptop plays), "factory" (a rumble, a machine that
    // breathes every `period` s, a far clank), "wind" (outdoors, up a pylon), "room" (air, never digital silence).
    // "curve": [[moment, level], …] — a place that comes forward when the picture is there.
    ambience({ preset = "room", from = 0, to, gain = -34, curve = [[0, 1]], period = 2.6, mains = 50 }) {
      const t0 = at(from);
      const t1 = to == null ? total : at(to);
      const g = db(gain);
      const pts = curve.map(([ref, level]) => [at(ref), level]).sort((a, b) => a[0] - b[0]);
      const levelAt = (t) => {
        if (t <= pts[0][0]) return pts[0][1];
        for (let j = 1; j < pts.length; j++) if (t < pts[j][0]) return pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * smoothstep((t - pts[j - 1][0]) / (pts[j][0] - pts[j - 1][0]));
        return pts.at(-1)[1];
      };
      const nl = rng(Math.round(t0 * 1000) + 307);
      const nr = rng(Math.round(t0 * 1000) + 311);
      const ev = rng(Math.round(t0 * 1000) + 313);
      const s = new Float32Array(12);
      let pop = 0;
      let popPan = 0;
      let popF = 0;
      let clank = -1;
      let clankPan = 0;
      writeLR(t0, t1 - t0, (t, i, out) => {
        const T = t0 + t;
        const env = Math.min(1, t / 1.2) * Math.min(1, (t1 - T) / 1.2) * levelAt(T) * g;
        const xl = nl() * 2 - 1;
        const xr = nr() * 2 - 1;
        let l = 0;
        let r = 0;
        if (preset === "hum") {
          const f = mains;
          const beat = 0.85 + 0.15 * Math.sin(TAU * 0.07 * T);
          const hum = (Math.sin(TAU * 2 * f * T) * 0.5 + Math.sin(TAU * 3 * f * T + 0.7) * 0.18 + Math.sin(TAU * 4 * f * T + 1.3) * 0.26 + Math.sin(TAU * 6 * f * T + 2.1) * 0.1 + Math.sin(TAU * 8 * f * T) * 0.05) * beat;
          // the sizzle: high air, pulsing at 2 × mains
          s[0] += 0.5 * (xl - s[0]);
          s[1] += 0.12 * (s[0] - s[1]);
          s[2] += 0.5 * (xr - s[2]);
          s[3] += 0.12 * (s[2] - s[3]);
          const buzz = Math.sin(TAU * 2 * f * T) ** 2;
          // the crackle: sparse pops, each a few ms of bright noise, somewhere in the field
          if (ev() < 4.5 / SR) {
            pop = 1;
            popPan = ev() * 1.6 - 0.8;
            popF = 0.25 + ev() * 0.3;
          }
          pop *= 0.9965;
          s[4] += popF * (xl - s[4]);
          const crack = (xl - s[4]) * pop * pop * 0.9;
          l = hum * 0.55 + (s[0] - s[1]) * buzz * 0.18 + crack * (1 - popPan);
          r = hum * 0.55 + (s[2] - s[3]) * buzz * 0.18 + crack * (1 + popPan);
        } else if (preset === "factory") {
          // the rumble, a side each
          s[0] += 0.004 * (xl - s[0]);
          s[1] += 0.004 * (xr - s[1]);
          // the machine breathes: a hiss that swells every `period` s
          const ph = (T % period) / period;
          const breath = Math.sin(Math.PI * Math.min(1, ph / 0.45)) ** 2 * (ph < 0.45 ? 1 : 0);
          s[2] += 0.35 * (xl - s[2]);
          s[3] += 0.06 * (s[2] - s[3]);
          s[4] += 0.35 * (xr - s[4]);
          s[5] += 0.06 * (s[4] - s[5]);
          // a far clank, now and then: metal partials, a side
          if (clank < 0 && ev() < 0.3 / SR) {
            clank = 0;
            clankPan = ev() * 1.4 - 0.7;
          }
          let c = 0;
          if (clank >= 0) {
            const tc = clank / SR;
            c = (Math.sin(TAU * 1180 * tc) + 0.7 * Math.sin(TAU * 1873 * tc) + 0.45 * Math.sin(TAU * 2641 * tc)) * Math.exp(-tc / 0.12) * 0.22;
            if (++clank > 0.8 * SR) clank = -1;
          }
          l = s[0] * 9 + (s[2] - s[3]) * breath * 0.3 + c * (1 - clankPan);
          r = s[1] * 9 + (s[4] - s[5]) * breath * 0.3 + c * (1 + clankPan);
        } else if (preset === "wind") {
          const gust = 0.55 + 0.45 * Math.sin(TAU * 0.11 * T) * Math.sin(TAU * 0.037 * T + 1);
          const fw = 0.02 + 0.03 * gust;
          s[0] += fw * (xl - s[0]);
          s[1] += fw * (s[0] - s[1]);
          s[2] += fw * (xr - s[2]);
          s[3] += fw * (s[2] - s[3]);
          l = (s[0] - s[1] * 0.6) * gust * 2.2;
          r = (s[2] - s[3] * 0.6) * (1.1 - gust * 0.2) * 2.2;
        } else {
          s[0] += 0.08 * (xl - s[0]);
          s[1] += 0.01 * (s[0] - s[1]);
          s[2] += 0.08 * (xr - s[2]);
          s[3] += 0.01 * (s[2] - s[3]);
          l = (s[0] - s[1]) * 0.7;
          r = (s[2] - s[3]) * 0.7;
        }
        out[0] = l * env;
        out[1] = r * env;
      }, under);
    },
    // AN ARC that holds (the breaker's, the one that comes to find you): a 100 Hz buzz rich in odd harmonics, its
    // crackle and its hiss, the whole thing trembling. On the effects bus: it steps back under a phrase.
    buzz({ from, to, gain = -24, mains = 50 }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const nz = rng(Math.round(t0 * 1000) + 331);
      let lo = 0;
      let jit = 0;
      writeLR(t0, t1 - t0, (t, i, out) => {
        const x = nz() * 2 - 1;
        lo += 0.4 * (x - lo);
        jit += 0.0006 * (x - jit);
        const ph = 2 * mains * t * (1 + 0.02 * jit);
        const sq = Math.tanh(Math.sin(TAU * ph) * 6); // a hard 100 Hz, its odd harmonics up into a laptop's band
        const crackle = (x - lo) * (0.4 + 0.6 * Math.abs(Math.sin(TAU * ph)));
        const env = Math.min(1, t / 0.03) * Math.min(1, (t1 - t0 - t) / 0.08) * (0.8 + 0.2 * Math.sin(TAU * 7.3 * t)) * g;
        out[0] = (sq * 0.35 + crackle * 0.55) * env;
        out[1] = (sq * 0.35 + crackle * 0.45 + jit * 2) * env;
      }, fx);
    },
    // A DROP: the music and the continuous layers silent from `pre` s before the moment (60 ms out) — back on it
    // (`back` s in). Put a boom or a hit on the moment: the silence is what makes it land.
    drop({ at: ref, pre = 0.6, back = 0.03 }) {
      const t = at(ref);
      drops.push([t - pre, t, back]);
    },
    // THE ROOM: declares the reverb (see SPACE above) — `mix` (the tail's level), `size` (0.7 a room … 0.9 a hall),
    // `damp` (a darker tail), `all: false` to keep it to the boom, the sting and the swell.
    space() {},
  };
  const smoothstep = (u) => u * u * (3 - 2 * u);
  const hushes = [];

  for (const item of list) {
    // the long's score is `music` asked wide or in sections; any other music plays as it always has
    const fn = synth[item.type === "music" && (item.width != null || item.sections != null) ? "score" : item.type];
    if (!fn) throw new Error(`sfx: type inconnu "${item.type}"`);
    fn(item);
  }

  // the drops: the continuous layers (drone, music, places) silent before a moment, back on it
  for (const [d0, d1, back] of drops) {
    const i0 = Math.max(0, Math.round((d0 - 0.06) * SR));
    const i1 = Math.min(N, Math.round((d1 + back) * SR));
    for (let i = i0; i < i1; i++) {
      const t = i / SR;
      const k = t < d1 ? Math.min(1, Math.max(0, (d0 - t) / 0.06)) : Math.min(1, (t - d1) / Math.max(1e-3, back));
      under.L[i] *= k;
      under.R[i] *= k;
      mus.L[i] *= k;
      mus.R[i] *= k;
    }
  }

  // Under the voice: down by `duck` dB while a word is spoken (quick to step back, slow to return),
  // and a touch above their written level in the silences, where the picture carries the film alone.
  const speaking = new Uint8Array(N);
  for (const beat of sched.beats) {
    for (const w of beat.words) speaking.fill(1, Math.max(0, Math.round((w.s - 0.04) * SR)), Math.min(N, Math.round((w.e + 0.08) * SR)));
  }
  const low = db(duck);
  const high = duck < 0 ? db(1.5) : 1;
  const down = 1 - Math.exp(-1 / (0.09 * SR));
  const up = 1 - Math.exp(-1 / (0.45 * SR));
  let gain = speaking[0] ? low : high;
  for (let i = 0; i < N; i++) {
    const target = speaking[i] ? low : high;
    gain += (target - gain) * (target < gain ? down : up);
    L[i] += under.L[i] * gain;
    R[i] += under.R[i] * gain;
  }

  // The effects bus follows the phrase, not the word: gaps shorter than 0.35 s stay closed, or a
  // whoosh would pump between two words.
  const phrase = Uint8Array.from(speaking);
  const gap = Math.round(0.35 * SR);
  for (let i = 0, last = -1; i < N; i++) {
    if (!speaking[i]) continue;
    if (last >= 0 && i - last > 1 && i - last <= gap) phrase.fill(1, last, i);
    last = i;
  }
  // The music's own bus follows the phrase too (no pumping between two words), down by its "duck" while one is
  // spoken, back at its written level in the silences.
  if (mus.duck != null) {
    const mLow = db(mus.duck);
    const mDown = 1 - Math.exp(-1 / (0.12 * SR));
    const mUp = 1 - Math.exp(-1 / (0.5 * SR));
    let mGain = phrase[0] ? mLow : 1;
    for (let i = 0; i < N; i++) {
      const target = phrase[i] ? mLow : 1;
      mGain += (target - mGain) * (target < mGain ? mDown : mUp);
      L[i] += mus.L[i] * mGain;
      R[i] += mus.R[i] * mGain;
    }
  }

  const fxLow = db(duckFx);
  const fxDown = 1 - Math.exp(-1 / (0.03 * SR));
  const fxUp = 1 - Math.exp(-1 / (0.18 * SR));
  let fxGain = phrase[0] ? fxLow : 1;
  for (let i = 0; i < N; i++) {
    const target = phrase[i] ? fxLow : 1;
    fxGain += (target - fxGain) * (target < fxGain ? fxDown : fxUp);
    L[i] += fx.L[i] * fxGain;
    R[i] += fx.R[i] * fxGain;
  }

  // the room ("space"): the tails of the punctuation, wide, added under everything else
  if (send) {
    let first = 0;
    while (first < N && send[first] === 0) first++;
    const [wl, wr] = room(send, { size: SPACE.size ?? 0.82, damp: SPACE.damp ?? 0.3, from: first });
    const mix = (SPACE.mix ?? 0.25) * 3; // (Freeverb's own wet scale)
    for (let i = first; i < N; i++) {
      L[i] += wl[i] * mix;
      R[i] += wr[i] * mix;
    }
  }

  // the silences ("hush"): the whole bed steps back, 40 ms in and 120 ms out
  for (const [h0, h1, low] of hushes) {
    const i0 = Math.max(0, Math.round((h0 - 0.04) * SR));
    const i1 = Math.min(N, Math.round((h1 + 0.12) * SR));
    for (let i = i0; i < i1; i++) {
      const t = i / SR;
      const k = Math.min(1, Math.max(0, (t - (h0 - 0.04)) / 0.04), Math.max(0, (h1 + 0.12 - t) / 0.12));
      const gain = 1 + (low - 1) * k;
      L[i] *= gain;
      R[i] *= gain;
    }
  }

  // the cliffs (the promo): the whole bed winds down like a stopping tape (its pitch falls with its speed), is dead
  // until `dur` s after the cut, comes back in `back` s; then what rings through the silence is added
  for (const [t0, tape, dur, back] of cliffs) {
    const i0 = Math.max(0, Math.round(t0 * SR));
    const i1 = Math.min(N, Math.round((t0 + Math.min(tape, dur)) * SR));
    const i2 = Math.min(N, Math.round((t0 + dur) * SR));
    const i3 = Math.min(N, Math.round((t0 + dur + back) * SR));
    for (const ch of [L, R]) {
      const src = ch.slice(i0, Math.min(N, i1 + 2));
      let p = 0;
      for (let i = i0; i < i1; i++) {
        const u = (i - i0) / Math.max(1, i1 - i0);
        const k = Math.floor(p);
        const f = p - k;
        ch[i] = ((src[k] ?? 0) * (1 - f) + (src[k + 1] ?? 0) * f) * (1 - u * u);
        p += 1 - u;
      }
      ch.fill(0, i1, i2);
      for (let i = i2; i < i3; i++) ch[i] *= smoothstep((i - i2) / Math.max(1, i3 - i2));
    }
  }
  if (late) {
    for (let i = 0; i < N; i++) {
      L[i] += late.L[i];
      R[i] += late.R[i];
    }
  }

  // gentle ceiling, then 16-bit stereo WAV
  let peak = 0;
  for (let i = 0; i < N; i++) {
    L[i] = Math.tanh(L[i] * 1.1) / 1.1;
    R[i] = Math.tanh(R[i] * 1.1) / 1.1;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  const buf = Buffer.alloc(44 + N * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + N * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  fs.writeFileSync(meta, JSON.stringify({ stamp }));
  if (!quiet) console.log(`  habillage sonore: ${list.length} éléments · ${total.toFixed(1)} s · crête ${(20 * Math.log10(peak + 1e-9)).toFixed(1)} dBFS · sous la voix ${duck} dB → audio/bed.wav`);
  return true;
}
