// Compact output: what an agent reads to decide, and the full detail in a log file.
// Every line a command prints enters an agent's context and is read again at each of its next calls:
// a render used to print ≈ 18 000 tokens of progress bars and traces. By default a command now prints
// its verdict, its warnings and errors, its key numbers and the path of what it wrote; the rest goes to
// .cache/logs/<ep>-<command>.log, whose path is printed. `--verbose` (or SD_VERBOSE=1) gives the old output.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";

export const verbose = () => Boolean(process.env.SD_VERBOSE);

/** .cache/logs/<episode folder>-<name>.log (the folder is created). */
export function logFile(dir, name) {
  const folder = path.join(ROOT, ".cache", "logs");
  fs.mkdirSync(folder, { recursive: true });
  return path.join(folder, `${path.basename(dir)}-${name}.log`);
}

/** Terminal text made plain: colours and cursor codes out, a progress bar redrawn with \r keeps its last state. */
export function plain(text) {
  return String(text)
    .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "")
    .replace(/\0/g, "")
    .split("\n")
    .map((line) => line.split("\r").filter((s) => s.trim()).pop() ?? "")
    .join("\n");
}

/** Run a command; its whole output goes to `log` (stdout, then stderr: the order between the two is not kept). */
export function runLogged(cmd, args, { log, env, cwd = ROOT, shell = false } = {}) {
  const res = spawnSync(cmd, args, { cwd, env, shell, encoding: "utf8", maxBuffer: 1 << 30 });
  const text = plain(`${res.stdout ?? ""}\n${res.stderr ?? ""}`);
  if (log) fs.writeFileSync(log, `$ ${[cmd, ...args].join(" ")}\n\n${text}`);
  return { status: res.status ?? 1, text };
}

// Direct3D's shader compiler talks while it compiles three.js programs: "sum of 1 and -1.49e-17 cannot be
// represented accurately", "floating point division by zero", "isnan() may not be necessary". It says it in
// every film, at every compile, and HyperFrames reports it as a console warning. Counted, never listed.
export const SHADER_NOISE = /Program Info Log|warning X\d{4}:/;

/** Lines kept from a HyperFrames report: blank lines, known noise and repeats out; the count of compiler notes. */
export function sift(text, drop = []) {
  const kept = [];
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
    if (drop.some((re) => re.test(line))) continue;
    const key = line.trim();
    if (seen.has(key) && /^\s*(\[|index\.html)/.test(line)) continue; // the same trace or anchor twice
    seen.add(key);
    kept.push(line);
  }
  return { kept, shader, codes: [...codes].sort() };
}

export const shaderLine = ({ shader, codes }) =>
  shader ? `  (${shader} note${shader > 1 ? "s" : ""} du compilateur de shaders Direct3D ${codes.join(", ")} : bruit connu, dans le journal)` : null;
