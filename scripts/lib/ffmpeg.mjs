// ffmpeg / ffprobe: HyperFrames needs both to encode, and the sound chain uses ffmpeg to
// master the voice and the final mix. If they are not on PATH, look where npm projects keep
// them (this one, then its neighbours), or in FFMPEG_DIR.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";

const EXE = process.platform === "win32" ? ".exe" : "";
const pathOf = (env) => Object.entries(env).find(([k]) => k.toLowerCase() === "path")?.[1] ?? "";

/** A copy of `env` whose PATH can reach ffmpeg and ffprobe (unchanged if it already can, or if none is found). */
export function withFfmpeg(env = process.env) {
  const sep = path.delimiter;
  const onPath = (name) => pathOf(env).split(sep).some((d) => d && fs.existsSync(path.join(d, name + EXE)));
  if (onPath("ffmpeg") && onPath("ffprobe")) return env;

  const parent = path.dirname(ROOT);
  const projects = [ROOT, ...fs.readdirSync(parent).map((n) => path.join(parent, n))];
  const dirs = (env.FFMPEG_DIR ?? "").split(sep).filter(Boolean);
  for (const p of projects) {
    dirs.push(path.join(p, "node_modules", "ffmpeg-static"), path.join(p, "node_modules", "ffprobe-static", "bin", process.platform, process.arch));
  }
  const ffmpeg = dirs.find((d) => fs.existsSync(path.join(d, "ffmpeg" + EXE)));
  const ffprobe = dirs.find((d) => fs.existsSync(path.join(d, "ffprobe" + EXE)));
  if (!ffmpeg || !ffprobe) return env;

  // Windows env names are case-insensitive: keep a single PATH entry or the child sees the old one
  const next = { ...env };
  const current = pathOf(env);
  for (const k of Object.keys(next)) if (k.toLowerCase() === "path") delete next[k];
  next.PATH = [ffmpeg, ffprobe, current].join(sep);
  return next;
}

let found; // name → full path (looked up once: the search walks the neighbouring projects)
/** Full path of ffmpeg / ffprobe, or null. */
export function tool(name) {
  found ??= {};
  if (name in found) return found[name];
  const dir = pathOf(withFfmpeg())
    .split(path.delimiter)
    .find((d) => d && fs.existsSync(path.join(d, name + EXE)));
  return (found[name] = dir ? path.join(dir, name + EXE) : null);
}

const run = (args, opts = {}) => spawnSync(tool("ffmpeg"), ["-hide_banner", "-nostats", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 28, ...opts });
const lin = (db) => (10 ** (db / 20)).toFixed(5);

/** Decode any audio file to mono Float32 at `rate` Hz. Null without ffmpeg. */
export function decodePcm(file, rate = 16000) {
  if (!tool("ffmpeg")) return null;
  const res = run(["-i", file, "-vn", "-ac", "1", "-ar", String(rate), "-f", "s16le", "-"], { encoding: "buffer" });
  if (res.status !== 0 || !res.stdout?.length) return null;
  const samples = new Float32Array(res.stdout.length >> 1);
  for (let i = 0; i < samples.length; i++) samples[i] = res.stdout.readInt16LE(i * 2) / 32768;
  return { rate, duration: samples.length / rate, samples };
}

/* ---------------------------------------------------------------- loudness (EBU R128) */

const LOUD = /\{[^{}]*"input_i"[^{}]*\}/;

/** Integrated loudness (LUFS), true peak (dBTP) and range of a file, after optional `filters`. Null without ffmpeg. */
export function loudness(file, filters = "") {
  if (!tool("ffmpeg")) return null;
  const res = run(["-i", file, "-vn", "-af", `${filters ? `${filters},` : ""}loudnorm=print_format=json`, "-f", "null", "-"]);
  const json = LOUD.exec(res.stderr)?.[0];
  if (!json) return null;
  const m = JSON.parse(json);
  return { i: Number(m.input_i), tp: Number(m.input_tp), lra: Number(m.input_lra) };
}

/* ---------------------------------------------------------------- the narrator's chain
   Deliberately light — rumble out, loud syllables evened, a ceiling on the peaks. No EQ, no
   effect: the timbre stays the actor's. Every take leaves at the same loudness, so a phrase
   cut from one take sits at the level of the next. */
export const VOICE = { lufs: -23, peak: -9.5 };
const voiceBody = (pre) => `volume=${pre.toFixed(2)}dB,highpass=f=70,acompressor=threshold=-21dB:ratio=2.5:attack=4:release=140:knee=5`;
// `latency`: the limiter looks a few ms ahead; it gives them back, so nothing shifts against the picture
const ceiling = (db) => `alimiter=limit=${lin(db)}:attack=3:release=70:level=false:latency=true`;

/**
 * Master one voice recording to a lossless file. Returns { i, tp, lra, pre, post }, or null without ffmpeg.
 * A whole take is brought to VOICE.lufs. A retake of one phrase is too short to be measured on its
 * own — a quiet line would be pushed up to the level of a whole film — so it takes the gains of the
 * full takes (`gains`: { pre, post }) and keeps the level it was played at.
 */
export function masterVoice(src, dst, gains) {
  if (!tool("ffmpeg")) return null;
  const write = (pre, post) => {
    const res = run(["-i", src, "-af", `${voiceBody(pre)},volume=${post.toFixed(2)}dB,${ceiling(VOICE.peak)}`, "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", dst]);
    return res.status === 0 && fs.existsSync(dst) ? loudness(dst) : null;
  };
  if (gains) {
    const out = write(gains.pre, gains.post);
    return out && { ...out, ...gains };
  }
  const raw = loudness(src);
  if (!raw) return null;
  const pre = -24 - raw.i; // the compressor always meets the take at the same level
  const mid = loudness(src, voiceBody(pre));
  if (!mid) return null;
  let post = VOICE.lufs - mid.i;
  let out = null;
  // the ceiling shaves a little loudness off: a correction pass or two lands on the target
  for (let pass = 0; pass < 4; pass++) {
    out = write(pre, post);
    if (!out) return null;
    if (Math.abs(out.i - VOICE.lufs) < 0.15) break;
    post += VOICE.lufs - out.i;
  }
  return { ...out, pre, post };
}

/**
 * Lay voice slices on the film's timeline and write them as one file: [{ file, from, length, at, gain? }]
 * (`gain` in dB). Each slice gets a few milliseconds of fade at both ends, so a cut in a breath never clicks.
 */
export function assemble(clips, out, { format = "wav" } = {}) {
  if (!tool("ffmpeg") || !clips.length) return null;
  const args = [];
  const chains = [];
  const FADE = 0.008;
  clips.forEach((c, i) => {
    args.push("-ss", c.from.toFixed(4), "-t", c.length.toFixed(4), "-i", c.file);
    const tail = i === clips.length - 1 ? 0.09 : FADE;
    chains.push(
      `[${i}:a]aresample=44100,aformat=channel_layouts=mono,${c.gain ? `volume=${c.gain.toFixed(2)}dB,` : ""}afade=t=in:st=0:d=${FADE},afade=t=out:st=${Math.max(0, c.length - tail).toFixed(4)}:d=${tail},adelay=${Math.round(c.at * 1000)}:all=1[a${i}]`,
    );
  });
  const mix = clips.length > 1 ? `${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length}:normalize=0[out]` : "[a0]anull[out]";
  const codec = format === "mp3" ? ["-c:a", "libmp3lame", "-b:a", "160k"] : ["-c:a", "pcm_s16le"];
  const res = run([...args, "-filter_complex", `${chains.join(";")};${mix}`, "-map", "[out]", "-ar", "44100", "-ac", "1", ...codec, out]);
  return res.status === 0 && fs.existsSync(out) ? out : null;
}

/** Cut one slice of an audio file to a small MP3 (the listening booth plays these). */
export function excerpt(src, from, length, out) {
  if (!tool("ffmpeg")) return null;
  const res = run([
    "-ss", from.toFixed(4), "-t", length.toFixed(4), "-i", src,
    "-af", `afade=t=in:st=0:d=0.008,afade=t=out:st=${Math.max(0, length - 0.03).toFixed(4)}:d=0.03`,
    "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", out,
  ]);
  return res.status === 0 && fs.existsSync(out) ? out : null;
}

/* ---------------------------------------------------------------- the film's master */

const TARGET = { lufs: -14, peak: -1.8 };

/**
 * Bring the finished film to social-video loudness (-14 LUFS).
 * One plain gain for the whole film, then a ceiling that only the loudest hits reach: the
 * balance between voice and sound bed stays exactly as mixed. (A loudness "normaliser" would
 * ride the level up and down and make the bed breathe.) The picture is copied untouched.
 */
export function master(file) {
  if (!tool("ffmpeg")) return console.log("  (ffmpeg introuvable : mastering audio ignoré)");
  const before = loudness(file);
  if (!before) return console.log("  ✗ mesure du niveau impossible — le MP4 non masterisé est conservé");
  const tmp = file.replace(/\.mp4$/, ".master.mp4");
  let gain = TARGET.lufs - before.i;
  let after = null;
  for (let pass = 0; pass < 3; pass++) {
    const res = run(["-i", file, "-c:v", "copy", "-af", `volume=${gain.toFixed(2)}dB,${ceiling(TARGET.peak)}`, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp]);
    if (res.status !== 0 || !fs.existsSync(tmp)) return console.log("  ✗ mastering audio échoué — le MP4 non masterisé est conservé");
    after = loudness(tmp);
    if (!after || Math.abs(after.i - TARGET.lufs) < 0.2) break;
    gain += TARGET.lufs - after.i;
  }
  fs.renameSync(tmp, file);
  if (after) console.log(`  mastering audio: ${before.i} → ${after.i} LUFS · crête ${after.tp} dBTP · gain ${gain >= 0 ? "+" : ""}${gain.toFixed(1)} dB`);
  return after;
}

/** Pull the audio track out of a video into a small file (stream copy). Returns null without ffmpeg. */
export function extractAudio(video, out) {
  if (!tool("ffmpeg")) return null;
  const res = run(["-i", video, "-vn", "-c:a", "copy", out]);
  return res.status === 0 && fs.existsSync(out) ? out : null;
}
