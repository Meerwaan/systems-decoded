// ffmpeg / ffprobe: HyperFrames needs both to encode. If they are not on PATH,
// look where npm projects keep them (this one, then its neighbours), or in FFMPEG_DIR.
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

/** Full path of ffmpeg / ffprobe, or null. */
export function tool(name) {
  const dir = pathOf(withFfmpeg())
    .split(path.delimiter)
    .find((d) => d && fs.existsSync(path.join(d, name + EXE)));
  return dir ? path.join(dir, name + EXE) : null;
}

/** Bring the mix to social-video loudness (-14 LUFS, true peak -1.5 dB). The picture is copied untouched. */
export function master(file) {
  const ffmpeg = tool("ffmpeg");
  if (!ffmpeg) return console.log("  (ffmpeg introuvable : mastering audio ignoré)");
  const tmp = file.replace(/\.mp4$/, ".master.mp4");
  const res = spawnSync(
    ffmpeg,
    ["-hide_banner", "-nostats", "-y", "-i", file, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=summary", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp],
    { encoding: "utf8" },
  );
  if (res.status !== 0 || !fs.existsSync(tmp)) return console.log("  ✗ mastering audio échoué — le MP4 non masterisé est conservé");
  const read = (label) => new RegExp(`${label}:\\s+(-?[\\d.]+)`).exec(res.stderr)?.[1];
  fs.renameSync(tmp, file);
  console.log(`  mastering audio: ${read("Input Integrated")} → ${read("Output Integrated")} LUFS (crête ${read("Output True Peak")} dBTP)`);
}

/** Pull the audio track out of a video into a small file (stream copy). Returns null without ffmpeg. */
export function extractAudio(video, out) {
  const ffmpeg = tool("ffmpeg");
  if (!ffmpeg) return null;
  const res = spawnSync(ffmpeg, ["-hide_banner", "-nostats", "-y", "-i", video, "-vn", "-c:a", "copy", out], { encoding: "utf8" });
  return res.status === 0 && fs.existsSync(out) ? out : null;
}
