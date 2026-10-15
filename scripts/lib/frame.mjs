// The frame of an episode, read off its page: 1080×1920 for the shorts, 1920×1080 for the long format.
import fs from "node:fs";
import path from "node:path";

export function frameOf(dir) {
  const file = path.join(dir, "index.html");
  const html = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const w = Number(/data-width="(\d+)"/.exec(html)?.[1] ?? 1080);
  const h = Number(/data-height="(\d+)"/.exec(html)?.[1] ?? 1920);
  return { w, h, long: w > h };
}
