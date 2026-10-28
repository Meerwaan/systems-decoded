// Le catalogue des décors : ce qui existe déjà, ce que ça sait faire, comment l'importer.
//
//   npm run catalogue                 réécrit docs/catalogue.md (lu par l'architecte et les décors AVANT de modéliser)
//   npm run catalogue -- --check      n'écrit rien : liste les fichiers de décor sans note, sort en erreur s'il y en a
//   npm run catalogue -- --vignettes  refait aussi les vignettes (docs/catalogue/*.jpg) depuis les films rendus
//
// Deux sources :
//   · le CODE (lu à chaque fois, jamais recopié à la main) : exports, signature de la fonction d'entrée, état lu par
//     update() quand l'en-tête le dit, imports du kit et des autres épisodes, qui le réutilise, VIEW de l'épisode,
//     nombre de lignes ; les fonctions d'aide recopiées d'un épisode à l'autre ; les fichiers presque identiques ;
//   · les NOTES écrites à la main (docs/catalogue-notes.json) : ce que c'est, en une phrase, ses forces, ses défauts,
//     les poses qui marchent, la vignette. Un nouveau fichier de décor sans note apparaît en fin de catalogue,
//     « à décrire » : une ligne à ajouter dans les notes, puis `npm run catalogue`.
//
// Lecture seule sur episodes/, kit/ et renders/ : n'écrit que docs/catalogue.md et docs/catalogue/.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NOTES = path.join(ROOT, "docs", "catalogue-notes.json");
const OUT = path.join(ROOT, "docs", "catalogue.md");
const THUMBS = path.join(ROOT, "docs", "catalogue");
const args = process.argv.slice(2);
const CHECK = args.includes("--check");
const VIGNETTES = args.includes("--vignettes");

// Ce qui n'est pas un décor : la mise en scène (actes, chapitres, fin, colle) et le contrat (plan, world).
const STAGING = /^(acte\d|fin|main|chapters|c\d+-.*)\.js$/;
const CONTRACT = /^(plan|world)\.js$/;

const read = (p) => fs.readFileSync(p, "utf8");
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const notes = JSON.parse(read(NOTES));
const epShort = (ep) => ep.replace(/^(\w+?)-.*$/, "$1"); // "009-micro-ondes" → "009"

// ───────────────────────────────────────────── lecture du code
function header(src) {
  const m = src.match(/^\s*(\/\*[\s\S]*?\*\/|(?:\/\/.*\r?\n)+)/);
  return m ? m[1] : "";
}
function exportsOf(src) {
  const fns = [...src.matchAll(/^export (?:async )?function (\w+)\s*\(([^)]*)\)/gm)].map((m) => ({ name: m[1], params: m[2].replace(/\s+/g, " ").trim() }));
  const consts = [...src.matchAll(/^export (?:const|let|class) (\w+)/gm)].map((m) => m[1]);
  return { fns, consts };
}
function importsOf(src) {
  return [...src.matchAll(/^import\s+(?:[\s\S]*?)\s+from\s+["']([^"']+)["']/gm)].map((m) => m[1]).filter((p) => !p.startsWith("three"));
}
/** L'état que lit update() : la ligne « p = { … } » de l'en-tête, ou la déstructuration du premier update({ … }). */
function stateOf(src) {
  const head = header(src).replace(/^\s*(\/\/|\*)\s?/gm, "");
  let m = head.match(/\b[pPs]\s*=\s*\{([^}]*)\}/);
  if (!m) m = src.match(/update\s*\(\s*\{([^}]*)\}/);
  if (!m) return null;
  const keys = m[1]
    .replace(/\([^)]*\)/g, "")
    .split(",")
    .map((x) => x.trim().split(/[\s:=?]/)[0])
    .filter((x) => /^[A-Za-z_]\w*$/.test(x));
  return keys.length ? [...new Set(keys)] : null;
}
/** Les noms des poses de VIEW dans world.js (premier niveau seulement). */
function viewKeys(worldSrc) {
  const i = worldSrc.search(/^export const VIEW\s*=\s*\{/m);
  if (i < 0) return [];
  let k = worldSrc.indexOf("{", i), j = k, d = 0;
  for (; j < worldSrc.length; j++) {
    if (worldSrc[j] === "{") d++;
    else if (worldSrc[j] === "}" && !--d) break;
  }
  const body = worldSrc.slice(k + 1, j), keys = [];
  let dd = 0;
  for (const m of body.matchAll(/([{}])|^\s*([A-Za-z_]\w*)\s*:/gm)) {
    if (m[1] === "{") dd++;
    else if (m[1] === "}") dd--;
    else if (dd === 0) keys.push(m[2]);
  }
  return keys;
}

const episodes = fs.readdirSync(path.join(ROOT, "episodes")).filter((e) => fs.existsSync(path.join(ROOT, "episodes", e, "src"))).sort();
const files = []; // { rel, ep, base, src, kind: "decor" | "kit" }
const views = {}; // ep → [pose names]
for (const ep of episodes) {
  const dir = path.join(ROOT, "episodes", ep, "src");
  for (const base of fs.readdirSync(dir).filter((f) => f.endsWith(".js")).sort()) {
    const src = read(path.join(dir, base));
    if (base === "world.js") views[ep] = viewKeys(src);
    if (STAGING.test(base) || CONTRACT.test(base)) continue;
    files.push({ rel: `episodes/${ep}/src/${base}`, ep, base, src, kind: "decor" });
  }
}
for (const base of fs.readdirSync(path.join(ROOT, "kit", "lib")).filter((f) => f.endsWith(".js")).sort())
  files.push({ rel: `kit/lib/${base}`, ep: null, base, src: read(path.join(ROOT, "kit", "lib", base)), kind: "kit" });

// Qui importe quoi, d'un épisode à l'autre (y compris world.js et les actes : un long qui reprend un décor le fait là).
const importers = {}; // rel → Set(ep)
const kitUsers = {}; // "kit/lib/x.js" → Set(ep)
for (const ep of episodes) {
  const dir = path.join(ROOT, "episodes", ep, "src");
  for (const base of fs.readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    for (const p of importsOf(read(path.join(dir, base)))) {
      if (p.startsWith("@kit/")) (kitUsers[`kit/lib/${p.slice(5)}`] ??= new Set()).add(epShort(ep));
      else if (p.startsWith("../../")) {
        const target = rel(path.resolve(dir, p));
        if (!target.startsWith(`episodes/${ep}/`)) (importers[target] ??= new Set()).add(epShort(ep));
      }
    }
  }
}

// ───────────────────────────────────────────── copies : fonctions d'aide et fichiers presque identiques
function bodyOf(src, name) {
  const i = src.search(new RegExp(`^(?:export )?function ${name}\\b`, "m"));
  if (i < 0) return null;
  let k = src.indexOf("{", src.indexOf(")", i)), d = 0;
  for (let j = k; j < src.length; j++) {
    if (src[j] === "{") d++;
    else if (src[j] === "}" && !--d) return src.slice(i, j + 1);
  }
  return null;
}
const stmts = (s) => new Set(s.replace(/\/\/.*$/gm, "").split(/[;{}\n]/).map((x) => x.replace(/\s+/g, " ").trim()).filter((x) => x.length > 10));
function overlap(a, b) {
  let n = 0;
  for (const x of a) if (b.has(x)) n++;
  return n / Math.max(1, Math.min(a.size, b.size));
}
const decors = files.filter((f) => f.kind === "decor");
const helpers = {}; // nom → [{ ep, base, set, len }]
for (const f of decors)
  for (const m of f.src.matchAll(/^function (\w+)\s*\(/gm)) {
    const b = bodyOf(f.src, m[1]);
    if (b && b.length > 600) (helpers[m[1]] ??= []).push({ ep: epShort(f.ep), base: f.base.replace(/\.js$/, ""), set: stmts(b), len: b.split("\n").length });
  }
const helperRows = [];
for (const [name, list] of Object.entries(helpers)) {
  const eps = new Set(list.map((x) => x.ep));
  if (eps.size < 3) continue;
  const groups = [];
  for (const x of list) {
    const g = groups.find((g) => overlap(g[0].set, x.set) > 0.75);
    g ? g.push(x) : groups.push([x]);
  }
  helperRows.push({ name, eps: eps.size, groups: groups.sort((a, b) => b.length - a.length) });
}
helperRows.sort((a, b) => b.eps - a.eps || a.name.localeCompare(b.name));

const fileSets = decors.map((f) => ({ f, set: new Set(f.src.split("\n").map((l) => l.replace(/\/\/.*$/, "").trim()).filter((l) => l.length > 12)) }));
const twins = [];
for (let i = 0; i < fileSets.length; i++)
  for (let j = i + 1; j < fileSets.length; j++) {
    const a = fileSets[i], b = fileSets[j];
    if (a.f.ep === b.f.ep || a.set.size < 150 || b.set.size < 150) continue;
    const k = overlap(a.set, b.set);
    if (k >= 0.45) twins.push({ a: a.f.rel, b: b.f.rel, k });
  }
twins.sort((x, y) => y.k - x.k);

// ───────────────────────────────────────────── écriture
const enCours = new Set(notes.enCours ?? []);
const flag = (ep) => (ep && enCours.has(epShort(ep)) ? " · *en chantier*" : "");
const short = (list, n) => (list.length > n ? `${list.slice(0, n).join(" ")} …(+${list.length - n})` : list.join(" "));

function importLine(f, fns) {
  const from = f.kind === "kit" ? `@kit/${f.base}` : `../../${f.ep}/src/${f.base}`;
  const names = (notes.entries[f.rel]?.importe ?? fns.map((x) => x.name)).join(", ");
  return names ? `import { ${names} } from "${from}";` : `import "${from}";`;
}

function entryLines(f) {
  const n = notes.entries[f.rel] ?? {};
  const { fns } = exportsOf(f.src);
  const lines = f.src.split("\n").length;
  const local = importsOf(f.src).filter((p) => p.startsWith("./")).map((p) => p.slice(2).replace(/\.js$/, ""));
  const cross = importsOf(f.src).filter((p) => p.startsWith("../../")).map((p) => epShort(p.split("/")[2]) + "/" + path.basename(p, ".js"));
  const users = [...(f.kind === "kit" ? kitUsers[f.rel] ?? [] : importers[f.rel] ?? [])].sort();
  const reuse = [...new Set([...(n.reutilise ?? []), ...(f.kind === "kit" ? [] : users)])];
  const title = n.nom ?? f.base.replace(/\.js$/, "");
  const where = f.kind === "kit" ? f.rel : `${epShort(f.ep)}/${f.base}`;
  const head = `- **${title}** \`${where}\`${flag(f.ep)} — ${n.quoi ?? "*(à décrire)*"}`;
  const pick = () => importLine(f, fns.filter((x) => n.importe || /^(build|make|dress)/.test(x.name)));
  if (notes.categories.find((c) => c.id === n.cat)?.compact) {
    // une catégorie compacte (les systèmes) : une ligne et l'import, rien d'autre
    const extra = [reuse.length ? `**repris par ${reuse.join(", ")}**` : "", n.forces ?? ""].filter(Boolean).join(" ; ");
    return [`${head} (${lines} l.${extra ? " ; " + extra : ""})`, ...(fns.length && n.importe !== false ? [`  \`${pick()}\``] : [])];
  }
  const out = [head];
  const facts = [];
  const sig = fns.filter((x) => /^(build|make|dress)/.test(x.name)).map((x) => `${x.name}(${x.params.length > 70 ? "{ … }" : x.params})`);
  if (sig.length) facts.push(`entrée ${sig.join(", ")}`);
  const st = n.etat ?? stateOf(f.src);
  if (st && st !== "—" && f.kind !== "kit") facts.push(`état \`${Array.isArray(st) ? short(st, 14) : st}\``);
  if (local.length || cross.length) facts.push(`lit ${[...local.map((x) => "./" + x), ...cross].join(", ")}`);
  facts.push(`${lines} l.`);
  if (f.kind === "kit") { if (users.length) facts.push(`utilisé par ${users.length} dossiers`); }
  else if (reuse.length) facts.push(`**repris par ${reuse.join(", ")}**`);
  out.push(`  ${facts.join(" · ")}`);
  if (n.forces) out.push(`  + ${n.forces}`);
  if (n.defauts) out.push(`  − ${n.defauts}`);
  const v = f.ep && n.poses !== false ? (n.poses ?? (views[f.ep]?.length ? `VIEW : ${short(views[f.ep], 8)}` : null)) : null;
  if (v) out.push(`  ◎ ${v}`);
  if (fns.length && n.importe !== false) out.push(`  \`${pick()}\``);
  return out;
}

const md = [];
md.push("# Catalogue des décors");
md.push("");
md.push(`Généré par \`npm run catalogue\` le ${new Date().toISOString().slice(0, 10)} à partir du code et de \`docs/catalogue-notes.json\` — **ne pas éditer à la main** (les notes se corrigent dans le JSON). Vignettes : \`docs/catalogue/\`.`);
md.push("");
for (const l of notes.intro ?? []) md.push(l);
md.push("");

const byCat = {};
for (const f of files) {
  const n = notes.entries[f.rel];
  if (!n || n.cat === "ignore") continue;
  (byCat[n.cat] ??= []).push(f);
}
for (const cat of notes.categories) {
  const list = byCat[cat.id];
  if (!list?.length) continue;
  md.push(`## ${cat.titre}`);
  if (cat.vignette) md.push(`Vignettes : \`${cat.vignette}\``);
  md.push("");
  const order = (f) => notes.entries[f.rel].rang ?? 50;
  for (const f of list.sort((a, b) => order(a) - order(b) || a.rel.localeCompare(b.rel))) md.push(...entryLines(f));
  md.push("");
}

if (notes.effetsCopies?.length || helperRows.length) {
  md.push("## Effets et aides recopiés d'un épisode à l'autre (non exportés)");
  md.push("");
  md.push("Ces fonctions ne s'importent pas (elles ne sont pas exportées) : on recopie **la version indiquée en premier** (la plus récente du plus gros groupe), ou mieux, on la fait monter dans le kit (voir « Recommandations »). Détecté automatiquement (trois épisodes ou plus) ; les crochets groupent les copies identiques à plus de 75 %.");
  md.push("");
  for (const h of helperRows) {
    const note = notes.effetsCopies?.find((x) => x.nom === h.name);
    if (!note) continue; // les petites aides géométriques (bent, tube, spline…) ne valent pas une ligne
    const groups = h.groups.map((g) => `[${g.map((x) => `${x.ep}/${x.base}`).reverse().join(" ")}]`).join(" ");
    md.push(`- \`${h.name}\` (${h.eps} ép.)${note ? ` — ${note.quoi}` : ""} : ${groups}`);
  }
  md.push("");
}
if (twins.length) {
  md.push("## Fichiers presque identiques d'un épisode à l'autre");
  md.push("");
  for (const t of twins) md.push(`- \`${t.b}\` ≈ \`${t.a}\` (${Math.round(100 * t.k)} % de lignes communes)`);
  md.push("");
}

const missing = files.filter((f) => !notes.entries[f.rel]);
if (missing.length) {
  md.push("## À décrire (fichiers sans note)");
  md.push("");
  md.push("Ajouter une entrée dans `docs/catalogue-notes.json` → `entries` (au moins `cat`, `nom`, `quoi`), puis `npm run catalogue`.");
  md.push("");
  for (const f of missing) md.push(...entryLines(f));
  md.push("");
}

if (notes.fin?.length) {
  md.push("## Recommandations");
  md.push("");
  for (const l of notes.fin) md.push(l);
  md.push("");
}

const text = md.join("\n").replace(/\n{3,}/g, "\n\n");
const tokens = Math.round(text.length / 3.6);
if (CHECK) {
  console.log(`${files.length} fichiers lus, ${missing.length} sans note, ≈ ${tokens} jetons.`);
  for (const f of missing) console.log(`  à décrire : ${f.rel}`);
  process.exit(missing.length ? 1 : 0);
}
fs.writeFileSync(OUT, text);
console.log(`docs/catalogue.md : ${files.length - missing.length} entrées décrites, ${missing.length} à décrire, ${helperRows.length} aides recopiées, ${twins.length} paires de fichiers presque identiques — ${(text.length / 1024).toFixed(1)} Ko, ≈ ${tokens} jetons.`);

// ───────────────────────────────────────────── vignettes (sur demande : coûte ≈ 1 s par film)
if (VIGNETTES) {
  const { tool } = await import("./lib/ffmpeg.mjs");
  const ffmpeg = tool("ffmpeg");
  if (!ffmpeg) {
    console.error("✗ ffmpeg introuvable : pas de vignettes");
    process.exit(1);
  }
  fs.mkdirSync(THUMBS, { recursive: true });
  const font = ["consola.ttf", "arial.ttf"].map((f) => path.join(process.env.WINDIR ?? "C:\\Windows", "Fonts", f)).find((f) => fs.existsSync(f));
  const label = (t) => (font ? `,drawtext=fontfile='${font.split(path.sep).join("/").replace(":", "\\:")}':text='${t.replace(/[':\\]/g, " ")}':x=8:y=5:fontsize=16:fontcolor=0xE9E4D8` : "");
  const W = 240;
  for (const sheet of notes.planches ?? []) {
    const strips = [];
    for (const row of sheet.lignes) {
      const ep = episodes.find((e) => epShort(e) === row.ep);
      const film = ep && path.join(ROOT, "renders", `${ep}.mp4`);
      if (!film || !fs.existsSync(film)) { console.warn(`  pas de film rendu pour ${row.ep} : ligne sautée`); continue; }
      if (enCours.has(row.ep)) { console.warn(`  ${row.ep} est en chantier : ligne sautée`); continue; }
      const long = /^L/.test(row.ep);
      const crop = long ? "crop=1920:1080:0:0" : "crop=1080:820:0:420"; // court : la bande du sujet, sans en-tête ni sous-titres
      const h = 2 * Math.round(((W * (long ? 1080 / 1920 : 820 / 1080)) / 2)); // pair : le 4:2:0 refuse une hauteur impaire
      const ins = row.t.flatMap((t) => ["-ss", String(t), "-i", film]);
      const chains = row.t.map((_, i) => `[${i}:v]${crop},scale=${W}:${h}[v${i}]`).join(";");
      const stack = row.t.map((_, i) => `[v${i}]`).join("");
      const out = path.join(THUMBS, `${row.ep}-${row.nom}.jpg`.replace(/[^\w.-]+/g, "-"));
      const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...ins, "-filter_complex", `${chains};${stack}hstack=${row.t.length},pad=iw:ih+26:0:26:color=0x0b0d10${label(`${row.ep}  ${row.titre ?? row.nom}`)}`, "-frames:v", "1", "-q:v", "5", out], { encoding: "utf8" });
      if (r.status) { console.warn(`  ✗ ${row.ep} : ${r.stderr.trim().split("\n").pop()}`); continue; }
      strips.push(out);
    }
    if (!strips.length) continue;
    const out = path.join(THUMBS, sheet.fichier);
    // des bandes de largeurs différentes (courts : 4 images, longs : 4 images 16:9) : on les cale à gauche sur la plus large
    const r = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...strips.flatMap((s) => ["-i", s]), "-filter_complex", `${strips.map((_, i) => `[${i}:v]pad=${W * 4}:ih:0:0:color=0x0b0d10[s${i}]`).join(";")};${strips.map((_, i) => `[s${i}]`).join("")}vstack=${strips.length}`, "-frames:v", "1", "-q:v", "5", out], { encoding: "utf8" });
    console.log(r.status ? `  ✗ ${sheet.fichier} : ${r.stderr.trim().split("\n").pop()}` : `  ${rel(out)} (${strips.length} lignes, ${Math.round(fs.statSync(out).size / 1024)} Ko)`);
  }
}
