// Create a new episode from kit/template.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";

const SERIES = JSON.parse(fs.readFileSync(path.join(ROOT, "kit", "series.json"), "utf8"));

export function newEpisode(id, slug, title, { affaire = false } = {}) {
  if (!id || !slug) throw new Error('Usage: npm run new -- 002 airbag "Airbag"');
  if (affaire && !/^L\d/.test(id)) throw new Error("--affaire : une affaire réelle est un long (L05, L06…)");
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
  // an affaire réelle (docs/recette-long-affaire.md): the long's page and code, its own script skeleton
  if (affaire) {
    const file = path.join(dir, "episode.json");
    const base = JSON.parse(fs.readFileSync(file, "utf8"));
    const { "//": _, ...over } = JSON.parse(fill(fs.readFileSync(path.join(ROOT, "kit", "template-affaire.json"), "utf8")));
    const merged = { ...base, ...over };
    // keep the long's key order, the genre right after the format
    const ordered = {};
    for (const k of Object.keys(base)) {
      ordered[k] = merged[k];
      if (k === "format") ordered.genre = merged.genre;
    }
    fs.writeFileSync(file, JSON.stringify({ ...ordered, ...merged }, null, 2) + "\n");
  }
  fs.mkdirSync(path.join(dir, "audio"), { recursive: true });
  if (affaire) console.log(`\n  Affaire réelle : lire docs/recette-long-affaire.md avant d'écrire le script`);
  console.log(`\n  Épisode créé: ${path.relative(ROOT, dir)}`);
  console.log(`  1. script dans episode.json   2. modèle + mise en scène dans src/   3. npm run snap -- ${id}\n`);
}
