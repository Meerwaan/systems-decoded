// Run a HyperFrames command on an episode, with ffmpeg reachable.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./env.mjs";
import { withFfmpeg } from "./ffmpeg.mjs";

/** Returns the exit status. `quiet` keeps HyperFrames' own output off the terminal. */
export function hyperframes(sub, dir, extra = [], { quiet = false } = {}) {
  const bin = path.join(ROOT, "node_modules", "hyperframes", "bin", "hyperframes.mjs");
  const opts = { stdio: quiet ? "ignore" : "inherit", cwd: ROOT, env: withFfmpeg(process.env) };
  const res = fs.existsSync(bin)
    ? spawnSync(process.execPath, [bin, sub, dir, ...extra], opts)
    : spawnSync("npx", ["hyperframes", sub, dir, ...extra], { ...opts, shell: true });
  return res.status ?? 1;
}
