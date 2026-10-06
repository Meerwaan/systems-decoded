// Is the film clean and smooth all the way through? This reads a rendered MP4 frame by frame.
//   · a STRAY FRAME: the picture jumps away and comes straight back (a black slab, a ghost of the
//     previous shot at a cut). Frame i differs from both neighbours, which look alike.
//   · SHIMMER: the picture keeps going back and forth instead of changing steadily (thin lines
//     hopping, dots blinking). The second difference in time stays high for a while.
// "Ça scintille" becomes a list of time codes to go and fix.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { tool } from "./lib/ffmpeg.mjs";

const W = 270;
const H = 480;
const FPS = 30;

export function flicker(file, { top = 6 } = {}) {
  if (!tool("ffmpeg")) return null;
  if (!fs.existsSync(file)) throw new Error(`Rendu introuvable: ${file}`);
  const res = spawnSync(tool("ffmpeg"), ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
  if (res.status !== 0) throw new Error(`Lecture impossible: ${String(res.stderr).slice(0, 200)}`);
  const size = W * H;
  const n = Math.floor(res.stdout.length / size);
  const frame = (i) => res.stdout.subarray(i * size, (i + 1) * size);
  const stray = [];
  const jitter = new Float32Array(n);
  for (let i = 1; i < n - 1; i++) {
    const a = frame(i - 1);
    const b = frame(i);
    const c = frame(i + 1);
    let ab = 0;
    let bc = 0;
    let ac = 0;
    let j = 0;
    for (let k = 0; k < size; k++) {
      ab += Math.abs(a[k] - b[k]);
      bc += Math.abs(b[k] - c[k]);
      ac += Math.abs(a[k] - c[k]);
      j += Math.abs(a[k] - 2 * b[k] + c[k]);
    }
    jitter[i] = j / size;
    const odd = (Math.min(ab, bc) - ac) / size; // how much frame i stands apart from two neighbours that agree
    if (odd > 1.2) stray.push({ t: i / FPS, odd });
  }
  // shimmer: the median over 0.4 s, so that one jump (a cut, a flash) does not count
  const win = 6;
  const score = new Float32Array(n);
  for (let i = win; i < n - win; i++) score[i] = [...jitter.subarray(i - win, i + win + 1)].sort((x, y) => x - y)[win];
  const mean = score.reduce((s, x) => s + x, 0) / n;
  const worst = [];
  for (const i of [...score.keys()].sort((x, y) => score[y] - score[x])) {
    if (worst.length >= top) break;
    if (worst.every((w) => Math.abs(w.i - i) > FPS * 1.5)) worst.push({ i, t: i / FPS, score: score[i] });
  }
  return { frames: n, stray, mean, worst };
}

export function printFlicker(file) {
  const f = flicker(file);
  if (!f) return console.log("  (ffmpeg introuvable : fluidité non mesurée)");
  console.log(`  ${path.basename(file)} · ${f.frames} images`);
  if (f.stray.length) {
    console.log(`  ✗ ${f.stray.length} image(s) parasite(s) — l'image saute et revient : ${f.stray.slice(0, 12).map((s) => `${s.t.toFixed(2)} s`).join(", ")}`);
  } else console.log("  ✓ aucune image parasite");
  console.log(`  mouvement le plus heurté (plus c'est bas, plus c'est fluide ; moyenne ${f.mean.toFixed(2)}) : ${f.worst.map((w) => `${w.t.toFixed(1)} s (${w.score.toFixed(1)})`).join(" · ")}`);
  return f;
}
