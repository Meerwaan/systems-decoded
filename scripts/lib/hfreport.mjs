// What an agent needs from a HyperFrames report, in a few lines. Built by removal, never by selection:
// a line this file does not know passes through, so a new kind of warning is never hidden.
import { SHADER_NOISE, shaderLine } from "./log.mjs";

const CLEAN = /^\s*◇\s+0 errors?, 0 warnings?\s*$/;

/** `hyperframes check` / `lint`: sections that passed in one line, every ⚠ and ✗ kept, the compiler's chatter counted. */
export function checkSummary(text) {
  const lines = text.split("\n").map((l) => l.replace(/\s+$/, ""));
  const out = [];
  const passed = [];
  const codes = new Set();
  let shader = 0;
  let afterNoise = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (SHADER_NOISE.test(line)) {
      for (const m of line.matchAll(/X\d{4}/g)) codes.add(m[0]);
      if (/Program Info Log/.test(line)) shader++;
      afterNoise = true;
      continue;
    }
    // where the compiler's note came from: the page itself, at t=0 — it means nothing without the note
    if (afterNoise && /^\s*index\.html \[data-composition-id\]/.test(line)) continue;
    afterNoise = false;
    if (/^\[hyperframes\] browserGpuMode probe/.test(line)) continue;
    if (/^\s*Fix: /.test(line)) continue; // HyperFrames' generic advice: in the log
    if (/^\s*◆\s+Checking /.test(line)) continue;
    // the kit never raises HyperFrames' __renderReady flag: every check of every film waits 3 s and says so
    if (/Runtime did not become render-ready within \d+ms — checking the current page state/.test(line)) continue;
    // a section header followed by "0 errors, 0 warnings" (or "disabled"): one word on the summary line
    if (/^[A-Z][A-Za-z ]+$/.test(line) && (CLEAN.test(lines[i + 1] ?? "") || /^\s*◇\s+disabled\s*$/.test(lines[i + 1] ?? ""))) {
      if (CLEAN.test(lines[i + 1])) passed.push(line.trim());
      i++;
      continue;
    }
    out.push(line);
  }
  const note = shaderLine({ shader, codes: [...codes].sort() });
  return [passed.length ? `  ✓ ${passed.join(" · ")}` : null, ...out, note].filter(Boolean);
}

// The render's own chatter: progress bars, traces, the start of each worker, the compiler.
const RENDER_NOISE = [
  /^\s*[█░]+\s+\d+%/, // progress bars
  /^\s*\[INFO\]/,
  /^\s*\[initSession/,
  /^\s*\[BrowserManager\] Browser launched/,
  /^\s*\[HyperFrames\] render runtime fps/,
  /^\s*\[engine\] fast capture: falling back to screenshot capture — webgl-context/,
  /^\s*\[hyperframes\] browserGpuMode probe/,
  /^\s*GPU: browser GPU/,
  /^\s*◒|^\s*◐|^\s*◇\s+Browser: cache|^\s*│\s*$/,
  // HyperFrames pins three workers for this kind of film whatever the heap allows; the heap warning is about six
  /^\s*\[WARN\] \[Render\] \d+ capture workers may exceed this process's V8 heap/,
];

/** `hyperframes render`: header, warnings and errors, and HyperFrames' closing lines (size, length, time, phases). */
export function renderSummary(text) {
  const out = [];
  const codes = new Set();
  let shader = 0;
  const seen = new Set();
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) continue;
    if (SHADER_NOISE.test(line)) {
      for (const m of line.matchAll(/X\d{4}/g)) codes.add(m[0]);
      if (/Program Info Log/.test(line)) shader++;
      continue;
    }
    if (RENDER_NOISE.some((re) => re.test(line))) continue;
    const key = line.trim().replace(/\{"renderJobId"[^}]*\}?/, "");
    if (seen.has(key)) continue; // the same warning from each of the workers
    seen.add(key);
    out.push(line.length > 400 ? `${line.slice(0, 400)}…` : line);
  }
  const note = shaderLine({ shader, codes: [...codes].sort() });
  return note ? [...out, note] : out;
}

/** `hyperframes snapshot`: the count, the folder once, the file names on one line. */
export function snapSummary(text) {
  const out = [];
  const names = [];
  for (const raw of text.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || SHADER_NOISE.test(line)) continue;
    if (/^\[hyperframes\] browserGpuMode probe/.test(line)) continue;
    if (/^\s*Fonts: /.test(line)) continue;
    if (/^\s{3}\S.*[\\/][^\\/]+\.(png|jpe?g)$/i.test(line)) {
      names.push(line.trim().split(/[\\/]/).pop()); // the folder is on the line above: the names are enough
      continue;
    }
    out.push(line);
  }
  if (names.length) out.push(`   ${names.join(" · ")}`);
  return out;
}
