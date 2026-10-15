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

let W = 270;
let H = 480;
const FPS = 30;

export function flicker(file, { top = 6 } = {}) {
  if (!tool("ffmpeg")) return null;
  const probe = spawnSync(tool("ffprobe") ?? "ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file]);
  const [vw, vh] = String(probe.stdout ?? "").trim().split(",").map(Number);
  const wide = vw > vh;
  [W, H] = wide ? [480, 270] : [270, 480];
  if (!fs.existsSync(file)) throw new Error(`Rendu introuvable: ${file}`);
  // Read by slices of 60 s (a long film decoded at once would not fit in memory), carrying the last two frames
  // of a slice into the next so that no frame is judged without its neighbours. The frame keeps the film's shape.
  const size = W * H;
  const SLICE = 60;
  const stray = [];
  const jit = [];
  let carry = [];
  let index = 0; // the film's frame number of carry[0]
  for (let k = 0; ; k++) {
    const res = spawnSync(tool("ffmpeg"), ["-hide_banner", "-loglevel", "error", "-ss", String(k * SLICE), "-t", String(SLICE), "-i", file, "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1 << 30 });
    if (res.status !== 0) throw new Error(`Lecture impossible: ${String(res.stderr).slice(0, 200)}`);
    const got = Math.floor(res.stdout.length / size);
    if (!got) break;
    const frames = [...carry, ...Array.from({ length: got }, (_, i) => res.stdout.subarray(i * size, (i + 1) * size))];
    for (let i = 1; i < frames.length - 1; i++) {
      const at = index + i;
      if (jit[at] !== undefined) continue;
      const fa = frames[i - 1];
      const fb = frames[i];
      const fc = frames[i + 1];
      let ab = 0;
      let bc = 0;
      let ac = 0;
      let j = 0;
      for (let q = 0; q < size; q++) {
        ab += Math.abs(fa[q] - fb[q]);
        bc += Math.abs(fb[q] - fc[q]);
        ac += Math.abs(fa[q] - fc[q]);
        j += Math.abs(fa[q] - 2 * fb[q] + fc[q]);
      }
      jit[at] = j / size;
      const odd = (Math.min(ab, bc) - ac) / size; // how much frame i stands apart from two neighbours that agree
      if (odd > 1.2) stray.push({ t: at / FPS, odd });
    }
    index += frames.length - 2;
    carry = frames.slice(-2).map((x) => Buffer.from(x));
    if (got < SLICE * FPS - 2) break;
  }
  const n = index + 2;
  const jitter = Float32Array.from({ length: n }, (_, i) => jit[i] ?? 0);
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
