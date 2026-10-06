// Create a new episode from kit/template.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";

export function newEpisode(id, slug, title) {
  if (!id || !slug) throw new Error('Usage: npm run new -- 002 airbag "Airbag"');
  const dir = path.join(ROOT, "episodes", `${id}-${slug}`);
  if (fs.existsSync(dir)) throw new Error(`${path.relative(ROOT, dir)} existe déjà`);
  const from = path.join(ROOT, "kit", "template");
  const fill = (text) => text.replaceAll("__ID__", id).replaceAll("__SLUG__", slug).replaceAll("__TITLE__", title || slug);
  const copy = (src, dst) => {
    fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const a = path.join(src, entry.name);
      const b = path.join(dst, entry.name);
      if (entry.isDirectory()) copy(a, b);
      else fs.writeFileSync(b, fill(fs.readFileSync(a, "utf8")));
    }
  };
  copy(from, dir);
  fs.mkdirSync(path.join(dir, "audio"), { recursive: true });
  console.log(`\n  Épisode créé: ${path.relative(ROOT, dir)}`);
  console.log(`  1. script dans episode.json   2. modèle + mise en scène dans src/   3. npm run snap -- ${id}\n`);
}
