// Sound design, synthesized: no samples, no licences, same result every run.
// The episode lists its sounds in episode.json ("sfx"), placed on the same cues as the picture.
// The continuous layers (drone, heartbeat) step back a little while the narrator speaks and come
// forward in the silences ("duck", in dB): the voice stays in front without the bed going thin.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEpisode, schedule, hashOf } from "./lib/episode.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";

const SR = 44100;
const TAU = Math.PI * 2;
const db = (x) => Math.pow(10, x / 20);
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

/**
 * Render audio/bed.wav. Skipped when the bed on disk already matches the schedule, the sound list
 * and this file (pass `force` to render anyway). Returns true when a new bed was written.
 */
export function sfx(dir, { ep = loadEpisode(dir), sched = schedule(ep), force = false, quiet = false } = {}) {
  const out = path.join(dir, "audio", "bed.wav");
  const meta = path.join(dir, "audio", "bed.json");
  const list = ep.sfx ?? [];
  const duck = ep.duck ?? -4.5;
  const stamp = hashOf(JSON.stringify([SOURCE, list, duck, sched.duration, sched.cues, sched.beats.map((b) => b.words.map((w) => [w.s, w.e]))]));
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
  const at = (ref) => resolveMoment(sched.beats, sched.cues, ref);

  /** Write `fn(seconds since start, sample index)` → mono sample, from t0 for dur, at pan −1…1. */
  const write = (t0, dur, pan, fn, bus = { L, R }) => {
    const i0 = Math.max(0, Math.round(t0 * SR));
    const i1 = Math.min(N, Math.round((t0 + dur) * SR));
    const gl = Math.cos(((pan + 1) * Math.PI) / 4);
    const gr = Math.sin(((pan + 1) * Math.PI) / 4);
    for (let i = i0; i < i1; i++) {
      const v = fn((i - i0) / SR, i);
      bus.L[i] += v * gl * 1.414;
      bus.R[i] += v * gr * 1.414;
    }
  };

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
    // a hit with weight: pitch-dropping sub + a short dull transient
    impact({ at: ref, gain = -12, size = 1 }) {
      const t0 = at(ref);
      const g = db(gain);
      const noise = rng(Math.round(t0 * 1000) + 7);
      let lp = 0;
      let hi = 0;
      let phase = 0;
      let knock = 0;
      write(t0, 1.6 * size, 0, (t) => {
        const f = 36 + 80 * Math.exp(-t / (0.07 * size));
        phase += (TAU * f) / SR;
        knock += (TAU * (95 + 150 * Math.exp(-t / 0.03))) / SR; // mid-range body
        const n = noise() * 2 - 1;
        lp += 0.09 * (n - lp);
        hi += 0.35 * (n - hi);
        return (
          (Math.sin(phase) * Math.exp(-t / (0.38 * size)) +
            Math.sin(knock) * 0.55 * Math.exp(-t / (0.13 * size)) +
            lp * 1.4 * Math.exp(-t / 0.05) +
            (hi - lp) * 0.5 * Math.exp(-t / 0.035)) *
          g *
          Math.min(1, t / 0.003)
        );
      });
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
        L[i] += v * Math.cos(((pan + 1) * Math.PI) / 4) * 1.414;
        R[i] += v * Math.sin(((pan + 1) * Math.PI) / 4) * 1.414;
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
      for (let k = 0; k < count; k++) {
        write(t0 + k * every, 0.12, k % 2 ? 0.15 : -0.15, (t) => (Math.sin(TAU * 920 * t) * Math.exp(-t / 0.012) + Math.sin(TAU * 2600 * t) * 0.5 * Math.exp(-t / 0.004)) * g);
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
      });
    },
    heartbeat({ from, to, bpm = 54, gain = -24 }) {
      const t0 = at(from);
      const t1 = at(to);
      const g = db(gain);
      const period = 60 / bpm;
      for (let t = t0; t < t1 - 0.3; t += period) {
        for (const [dt, k] of [[0, 1], [0.24, 0.7]]) {
          let phase = 0;
          write(t + dt, 0.3, 0, (x) => {
            phase += (TAU * (64 + 60 * Math.exp(-x / 0.03))) / SR;
            return (Math.sin(phase) + 0.45 * Math.sin(phase * 2)) * Math.exp(-x / 0.07) * k * g * Math.min(1, x / 0.004) * Math.min(1, (t1 - t) / 1.2);
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
      });
    },
  };

  for (const item of list) {
    const fn = synth[item.type];
    if (!fn) throw new Error(`sfx: type inconnu "${item.type}"`);
    fn(item);
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
