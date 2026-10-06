// Build one episode: timing data (from the voice, or estimated), bundle, kit assets, the sound
// that follows that timing (voice comp as one file, sound bed), and the generated parts of
// index.html (duration + audio tracks). Everything derived is rebuilt only when its source moved.
import fs from "node:fs";
import path from "node:path";
import { build as esbuild } from "esbuild";
import { ROOT } from "./lib/env.mjs";
import { loadEpisode, schedule } from "./lib/episode.mjs";
import { mixVoice } from "./voice.mjs";
import { sfx } from "./sfx.mjs";

const KIT = path.join(ROOT, "kit");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const name of fs.readdirSync(from)) fs.copyFileSync(path.join(from, name), path.join(to, name));
}

export async function build(dir, { quiet = false } = {}) {
  const ep = loadEpisode(dir);
  const sched = schedule(ep);
  const gen = path.join(dir, "gen");
  fs.mkdirSync(gen, { recursive: true });

  // 1. data
  const data = {
    id: ep.id,
    slug: ep.slug,
    title: ep.title,
    fps: ep.fps,
    lead: ep.lead,
    duration: sched.duration,
    estimated: sched.estimated,
    beats: sched.beats,
    cues: sched.cues,
    extra: ep.extra ?? {},
  };
  fs.writeFileSync(path.join(gen, "episode.data.js"), `window.__EPISODE = ${JSON.stringify(data)};\n`);

  // 2. kit assets
  copyDir(path.join(KIT, "fonts"), path.join(gen, "fonts"));
  fs.copyFileSync(path.join(KIT, "brand.css"), path.join(gen, "brand.css"));
  fs.copyFileSync(path.join(ROOT, "node_modules", "gsap", "dist", "gsap.min.js"), path.join(gen, "gsap.min.js"));

  // 3. bundle (three + kit + episode code → one classic script, no network at render time)
  await esbuild({
    entryPoints: [path.join(dir, "src", "main.js")],
    bundle: true,
    format: "iife",
    minify: true,
    target: "chrome120",
    outfile: path.join(gen, "bundle.js"),
    alias: {
      "three/addons": path.join(ROOT, "node_modules", "three", "examples", "jsm"),
      "@kit": path.join(KIT, "lib"),
    },
    logLevel: "warning",
  });

  // 4. sound, kept in step with the schedule: the comped voice as one file, and the bed on its cues
  const mix = mixVoice(dir, sched);
  const newBed = sfx(dir, { ep, sched, quiet });

  // 5. index.html: duration + audio tracks
  const htmlFile = path.join(dir, "index.html");
  let html = fs.readFileSync(htmlFile, "utf8");
  html = html.replace(/(<div\s+id="root"[^>]*?data-duration=")[^"]*(")/s, `$1${sched.duration}$2`);
  const tracks = [];
  const has = (rel) => fs.existsSync(path.join(dir, rel));
  if (mix) {
    tracks.push(`<audio id="vo" src="${mix}" data-start="0" data-track-index="10" data-volume="1"></audio>`);
  } else if (!sched.estimated && sched.clips.every((clip) => has(clip.src))) {
    // no ffmpeg to assemble them: the film plays the slices of the takes themselves
    sched.clips.forEach((clip, i) => {
      tracks.push(
        `<audio id="vo-${i}" src="${clip.src}" data-start="${clip.at}" data-media-start="${clip.from}" data-duration="${clip.length}" data-track-index="${10 + (i % 2)}" data-volume="1"></audio>`,
      );
    });
  }
  if (has("audio/bed.wav")) {
    tracks.push(`<audio id="bed" src="audio/bed.wav" data-start="0" data-track-index="12" data-volume="${ep.bedVolume ?? 0.7}"></audio>`);
  }
  html = html.replace(
    /(<!-- AUDIO:START[^>]*-->)[\s\S]*?(<!-- AUDIO:END -->)/,
    (_, a, b) => `${a}\n      ${tracks.join("\n      ")}${tracks.length ? "\n      " : ""}${b}`,
  );
  fs.writeFileSync(htmlFile, html);

  if (!quiet) {
    const state = sched.estimated ? (sched.stale ? "ESTIMÉ (la voix ne correspond plus au script)" : "ESTIMÉ (pas encore de voix)") : "calé sur la voix";
    console.log(`  ${path.basename(dir)} · ${sched.duration}s · ${sched.beats.length} beats · timing ${state}`);
  }
  return { ep, sched, mix, newBed };
}
