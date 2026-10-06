// Check a rendered MP4 against the episode: is every voice clip where the schedule says, at a sane
// level — and is the picture clean from the first frame to the last (no stray frame, no shimmer)?
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { loadEpisode, schedule } from "./lib/episode.mjs";
import { decodeAudio } from "./lib/audio.mjs";
import { extractAudio, loudness } from "./lib/ffmpeg.mjs";
import { printFlicker } from "./flicker.mjs";

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
  return { ok, worst, loud, smooth };
}
