// Audio decoding + prosody measurement, with no ffmpeg dependency:
// the MP3 is decoded by the headless Chrome that HyperFrames already ships.
import fs from "node:fs";
import { launchChrome } from "./chrome.mjs";

/** Decode any browser-playable audio file to mono Float32 at `rate` Hz. */
export async function decodeAudio(file, rate = 16000) {
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    const out = await page.evaluate(
      async (b64, targetRate) => {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const ctx = new OfflineAudioContext(1, targetRate, targetRate);
        const buf = await ctx.decodeAudioData(bytes.buffer);
        const n = buf.length;
        const pcm = new Int16Array(n);
        for (let c = 0; c < buf.numberOfChannels; c++) {
          const ch = buf.getChannelData(c);
          for (let i = 0; i < n; i++) pcm[i] += Math.round((ch[i] / buf.numberOfChannels) * 32767);
        }
        const u8 = new Uint8Array(pcm.buffer);
        let s = "";
        for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return { rate: buf.sampleRate, duration: buf.duration, pcm: btoa(s) };
      },
      fs.readFileSync(file).toString("base64"),
      rate,
    );
    const raw = Buffer.from(out.pcm, "base64");
    const samples = new Float32Array(raw.length / 2);
    for (let i = 0; i < samples.length; i++) samples[i] = raw.readInt16LE(i * 2) / 32768;
    return { rate: out.rate, duration: out.duration, samples };
  } finally {
    await browser.close();
  }
}

/** 10 ms frames: level (dBFS) and fundamental frequency (YIN), 0 when unvoiced. */
export function trackPitch({ samples, rate }, { fmin = 55, fmax = 330 } = {}) {
  const hop = Math.round(rate * 0.01);
  const win = Math.round(rate * 0.04);
  const tauMin = Math.floor(rate / fmax);
  const tauMax = Math.ceil(rate / fmin);
  const d = new Float32Array(tauMax + 2);
  const frames = [];
  for (let start = 0; start + win + tauMax < samples.length; start += hop) {
    let energy = 0;
    for (let i = 0; i < win; i++) energy += samples[start + i] * samples[start + i];
    const db = 10 * Math.log10(energy / win + 1e-12);
    let f0 = 0;
    if (db > -55) {
      let running = 0;
      d[0] = 1;
      for (let tau = 1; tau <= tauMax + 1; tau++) {
        let sum = 0;
        for (let i = 0; i < win; i++) {
          const x = samples[start + i] - samples[start + i + tau];
          sum += x * x;
        }
        running += sum;
        d[tau] = running > 0 ? (sum * tau) / running : 1;
      }
      let best = -1;
      for (let tau = tauMin; tau <= tauMax; tau++) {
        if (d[tau] < 0.15) {
          while (tau + 1 <= tauMax && d[tau + 1] < d[tau]) tau++;
          best = tau;
          break;
        }
      }
      if (best === -1) {
        let min = 1;
        for (let tau = tauMin; tau <= tauMax; tau++) {
          if (d[tau] < min) {
            min = d[tau];
            best = tau;
          }
        }
        if (min > 0.3) best = -1;
      }
      if (best > 0) {
        const a = d[best - 1];
        const b = d[best];
        const c = d[best + 1];
        const shift = a + c - 2 * b !== 0 ? (0.5 * (a - c)) / (a + c - 2 * b) : 0;
        f0 = rate / (best + shift);
      }
    }
    frames.push({ t: (start + win / 2) / rate, db, f0 });
  }
  return frames;
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))))];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const sd = (xs) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

/**
 * Objective read on "is this take flat?".
 * `segments`: [{ id, start, end, letters }] (seconds in the audio file).
 * `tags`: [{ text, start, end }] spans of audio tags, to check none was read aloud.
 */
export function prosodyReport(frames, segments = [], tags = []) {
  const peak = quantile(frames.map((f) => f.db).sort((a, b) => a - b), 0.98);
  const gate = peak - 32;
  const speaking = frames.filter((f) => f.db > gate);
  const voicedHz = frames.filter((f) => f.f0 > 0 && f.db > gate).map((f) => f.f0);
  const median = quantile([...voicedHz].sort((a, b) => a - b), 0.5);
  const st = (hz) => 12 * Math.log2(hz / median);
  // drop octave errors
  const semis = (list) => list.map(st).filter((x) => Math.abs(x) < 11);

  const all = semis(voicedHz).sort((a, b) => a - b);
  const pauses = [];
  let run = null;
  for (const f of frames) {
    if (f.db <= gate) run ??= { start: f.t, end: f.t };
    if (run) {
      if (f.db <= gate) run.end = f.t;
      else {
        if (run.end - run.start >= 0.22) pauses.push(run);
        run = null;
      }
    }
  }
  const inner = pauses.filter((p) => p.start > 0.2);

  const perSegment = segments.map((seg) => {
    const fr = frames.filter((f) => f.t >= seg.start && f.t <= seg.end);
    const hz = semis(fr.filter((f) => f.f0 > 0 && f.db > gate).map((f) => f.f0));
    const talk = fr.filter((f) => f.db > gate);
    return {
      id: seg.id,
      register: hz.length ? mean(hz) : 0,
      spread: hz.length ? sd(hz) : 0,
      level: talk.length ? mean(talk.map((f) => f.db)) - peak : -60,
      rate: seg.letters / Math.max(0.2, talk.length * 0.01),
      voiced: fr.length ? hz.length / fr.length : 0,
    };
  });

  const tagChecks = tags.map((tag) => {
    const fr = frames.filter((f) => f.t >= tag.start && f.t <= tag.end);
    const loud = fr.filter((f) => f.db > gate).length;
    const span = tag.end - tag.start;
    return { ...tag, span, spoken: span > 0.4 && loud / Math.max(1, fr.length) > 0.6 };
  });

  return {
    medianHz: median,
    pitchSd: sd(all),
    pitchRange: quantile(all, 0.95) - quantile(all, 0.05),
    registerSpread: sd(perSegment.map((s) => s.register)),
    levelSd: sd(speaking.map((f) => f.db)),
    speechSeconds: speaking.length * 0.01,
    pauses: inner.length,
    pauseTotal: inner.reduce((a, p) => a + (p.end - p.start), 0),
    longestPause: inner.reduce((a, p) => Math.max(a, p.end - p.start), 0),
    segments: perSegment,
    tags: tagChecks,
  };
}
