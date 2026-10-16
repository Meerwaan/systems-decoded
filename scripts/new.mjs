// Create a new episode from kit/template.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";

const SERIES = JSON.parse(fs.readFileSync(path.join(ROOT, "kit", "series.json"), "utf8"));

export function newEpisode(id, slug, title) {
  if (!id || !slug) throw new Error('Usage: npm run new -- 002 airbag "Airbag"');
  const dir = path.join(ROOT, "episodes", `${id}-${slug}`);
  if (fs.existsSync(dir)) throw new Error(`${path.relative(ROOT, dir)} existe déjà`);
  // L01, L02…: a long (YouTube, 16:9) from kit/template-long; 001, 002…: a short from kit/template
  const from = path.join(ROOT, "kit", /^L\d/.test(id) ? "template-long" : "template");
  // HS01, HS02…: a hors-série short (a promo now, sponsored films later): same template, its own tag and acts
  const serie = /^HS\d/.test(id) ? "hors-serie" : "dossier";
  const { tag, acts } = SERIES[serie];
  const fill = (text) => text.replaceAll("__SERIE__", serie).replaceAll("__TAG__", tag).replaceAll("__ACT1__", acts[0]).replaceAll("__ACT2__", acts[1]).replaceAll("__ACT3__", acts[2]).replaceAll("__NUM__", serie === "dossier" ? id : id.replace(/^[A-Z]+/, "")).replaceAll("__ID__", id).replaceAll("__SLUG__", slug).replaceAll("__TITLE__", title || slug);
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
