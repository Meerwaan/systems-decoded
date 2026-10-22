// Grid cover for an episode: one frame of the real film (the exploded view), posed for the
// cover, with a title lock-up. Every cover is built the same way, so the profile grid reads
// as one series. episode.json → "cover": { "at": <moment>, "title": ["LIGNE 1", "LIGNE 2"], "cam": {…} }
//
// A long's thumbnails are tried the same way, several at once, without touching episode.json:
//   node scripts/cover.mjs L01 --thumbs essais.json --out <dossier> [--gpu]
//     essais.json: [{ "name": "tete", "at": …, "cam": {…}, "state": {…}, "title": [...], …the options below }]
//     → <dossier>/<name>.png (1280×720) and <dossier>/planche-160.png: each one as YouTube shows it —
//       160 px wide in the "up next" list (dark and light), with the title and the duration badge, and 360 px in the feed.
//   node scripts/cover.mjs L01 --sheet --out <dossier>    the same sheet for the thumbnails already in renders/
// A short's cover is tried the same way (--thumbs, no sheet): a hors-série's solid tag and its foot line, see shortExtra.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { build } from "./build.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";
import { frameOf } from "./lib/frame.mjs";

const SERIES = JSON.parse(fs.readFileSync(path.join(ROOT, "kit", "series.json"), "utf8"));

// The long format's thumbnail (1280×720, drawn at 1920×1080 and scaled): one object, two or three words that read
// at 160 px wide. episode.json → "thumb": { "at", "cam", "state", "title": ["IL DOIT", "CASSER"], "tone": "signal" }.
// The last line takes the tone; the words sit on the left, the object on the right.
const LONG = `
  #root > :not(#stage):not(#vignette):not(#cover) { display: none !important; }
  #vignette { background: radial-gradient(ellipse 70% 80% at 66% 50%, transparent 40%, rgba(0,0,0,0.55) 100%) !important; }
  #cover { position: absolute; inset: 0; }
  #cover .shade { position: absolute; inset: 0; background: linear-gradient(to right, rgba(7,10,12,0.95) 0, rgba(7,10,12,0.85) 30%, rgba(7,10,12,0) 56%); }
  #cover .lock { position: absolute; left: 90px; top: 50%; transform: translateY(-50%); width: 1000px; }
  #cover .tag { display: inline-flex; align-items: center; gap: 18px; padding: 14px 22px; border: 4px solid var(--ink); font: 800 44px/1 var(--mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink); background: rgba(7,10,12,0.6); }
  #cover .tag i { display: block; width: 22px; height: 22px; border-radius: 50%; background: var(--veille); box-shadow: 0 0 26px var(--veille); }
  #cover h1 { margin-top: 30px; font: 800 300px/0.84 var(--display); letter-spacing: 0.004em; text-transform: uppercase; color: var(--ink); white-space: nowrap;
    -webkit-text-stroke: 3px rgba(7,10,12,0.9); text-shadow: 0 8px 0 rgba(0,0,0,0.75), 0 0 50px rgba(0,0,0,0.9); }
  #cover h1 span { display: block; }
  #cover h1 span:last-child { color: var(--tone); }
  #cover .brand { display: none; }
`;

// What a long's thumbnail may ask for on top of LONG (none of it is drawn unless asked: an old thumb comes out as it was).
//   side "right"      the words on the right, the object on the left (the shade and the vignette follow)
//   size 300          the words' size in px of the 1920×1080 frame (the longest line still shrinks to fit `width`)
//   width 1000        the width the words may take
//   top 50            the words' vertical centre, % of the height
//   shade 1           how dark the band behind the words is (0 none → 1 the house's); `reach` 56: where it ends, %
//   tagStyle "solid"  the cartouche filled with the tone, dark letters (it reads as a block of colour at 160 px)
//   tagSize 44        the cartouche's letters, px
//   tones ["ink", "signal"]  a colour per line (default: the last line takes `tone`, the others ink)
//   ring { x, y, r }  a mark of the house (a ring and four ticks, in the tone) around what the eye must find, px of 1920×1080
//   vignette 0.55     how dark the corners go
//   kit { dof, air, airColor, airSpread, airDepth, airLift, airX, finish }  the studio's options for this picture alone
const extra = (c) => {
  const css = [];
  const right = c.side === "right";
  const shade = c.shade ?? 1;
  const reach = c.reach ?? 56;
  if (right || c.shade != null || c.reach != null) {
    const a = (v) => (v * shade).toFixed(3);
    css.push(`#cover .shade { background: linear-gradient(to ${right ? "left" : "right"}, rgba(7,10,12,${a(0.95)}) 0, rgba(7,10,12,${a(0.85)}) ${Math.round(reach * 0.54)}%, rgba(7,10,12,0) ${reach}%); }`);
  }
  if (right || c.vignette != null)
    css.push(`#vignette { background: radial-gradient(ellipse 70% 80% at ${right ? 34 : 66}% 50%, transparent 40%, rgba(0,0,0,${c.vignette ?? 0.55}) 100%) !important; }`);
  if (right) css.push(`#cover .lock { left: auto; right: 90px; text-align: right; } #cover .tag { flex-direction: row-reverse; }`);
  if (c.width != null) css.push(`#cover .lock { width: ${c.width}px; }`);
  if (c.top != null) css.push(`#cover .lock { top: ${c.top}%; }`);
  if (c.size != null) css.push(`#cover h1 { font-size: ${c.size}px; }`);
  if (c.tagSize != null) css.push(`#cover .tag { font-size: ${c.tagSize}px; padding: ${Math.round(c.tagSize * 0.32)}px ${Math.round(c.tagSize * 0.5)}px; }`);
  if (c.tagStyle === "solid")
    css.push(`#cover .tag { background: var(--tone); border-color: var(--tone); color: #070a0c; box-shadow: 0 8px 0 rgba(0,0,0,0.6); } #cover .tag i { background: #070a0c; box-shadow: none; }`);
  if (c.tones) c.tones.forEach((t, i) => css.push(`#cover h1 span:nth-child(${i + 1}) { color: var(--${t}); }`));
  css.push(`#cover .ring { position: absolute; border-radius: 50%; border: 12px solid var(--tone); box-shadow: 0 0 0 5px rgba(7,10,12,0.85), inset 0 0 0 5px rgba(7,10,12,0.85), 0 0 60px var(--tone); }
    #cover .ring i { position: absolute; background: var(--tone); box-shadow: 0 0 0 5px rgba(7,10,12,0.85); }
    #cover .ring i:nth-child(1), #cover .ring i:nth-child(2) { width: 12px; height: 26%; left: calc(50% - 6px); }
    #cover .ring i:nth-child(1) { top: -30%; } #cover .ring i:nth-child(2) { bottom: -30%; }
    #cover .ring i:nth-child(3), #cover .ring i:nth-child(4) { height: 12px; width: 26%; top: calc(50% - 6px); }
    #cover .ring i:nth-child(3) { left: -30%; } #cover .ring i:nth-child(4) { right: -30%; }`);
  return css.join("\n");
};

const STYLE = `
  #root > :not(#stage):not(#vignette):not(#cover) { display: none !important; }
  #cover { position: absolute; inset: 0; }
  #cover .shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(7,10,12,0.94) 0, rgba(7,10,12,0.7) 30%, rgba(7,10,12,0) 50%); }
  /* TikTok shows the middle 3:4 of the cover in the grid (y 240 → 1680): everything lives inside it */
  #cover .lock { position: absolute; left: 84px; right: 84px; top: 372px; }
  #cover .tag { display: flex; align-items: center; gap: 20px; font: 500 46px/1 var(--mono); letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-dim); }
  #cover .tag i { display: block; width: 22px; height: 22px; border-radius: 50%; background: var(--veille); box-shadow: 0 0 26px var(--veille); }
  #cover h1 { margin-top: 36px; font: 800 220px/0.9 var(--display); letter-spacing: 0.004em; text-transform: uppercase; color: var(--ink); white-space: nowrap; }
  #cover h1 span { display: block; }
  #cover h1 span:last-child { color: var(--veille); }
  #cover .brand { margin-top: 44px; padding-top: 28px; border-top: 3px solid var(--ink-faint); font: 700 36px/1 var(--mono); letter-spacing: 0.22em; color: var(--ink-dim); }
`;

// What a short's cover may ask for on top of STYLE (2026-10-21; none of it is drawn unless asked: every cover already in
// renders/ comes out as it was). Made for the hors-séries, the promos of the longs: in a grid of dossiers they must read
// as something else at 130 px wide, where the grey tag does not read at all.
//   tagStyle "solid"   the tag filled with `tagTone` (default "veille"), dark letters: a block of colour in the grid
//   tagSize 46         the tag's letters, px
//   foot "…"           the line under the title instead of the account's name ("Film complet · 8 min 51")
const shortExtra = (c) => {
  const css = [];
  const tone = `var(--${c.tagTone ?? "veille"})`;
  if (c.tagStyle === "solid")
    css.push(`#cover .tag { display: inline-flex; padding: 16px 24px; background: ${tone}; color: #070a0c; font-weight: 700; box-shadow: 0 8px 0 rgba(0,0,0,0.55); } #cover .tag i { background: #070a0c; box-shadow: none; }`);
  if (c.tagSize != null) css.push(`#cover .tag { font-size: ${c.tagSize}px; }`);
  if (c.foot) css.push(`#cover .brand { color: ${tone}; }`);
  return css.join("\n");
};

// YouTube lays its duration badge over the bottom-right corner of every thumbnail; in the "up next" list (160 px wide)
// it covers about a quarter of the width and of the height. Nothing that matters goes there.
const BADGE = { x: 0.75, y: 0.75 };
const MAX_BYTES = 2 * 1024 * 1024; // YouTube refuses a custom thumbnail above 2 MB

const CPU = ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const GPU = ["--use-gl=angle", ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []), "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"];
const PAGE = ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"];

/** The page of the film, loaded once, ready to be posed. `gpu`: drawn by the graphics card (trials), else in software like the render. */
async function openFilm(dir, F, gpu) {
  const browser = await launchChrome([...(gpu ? GPU : CPU), ...PAGE]);
  const page = await browser.newPage();
  await page.setViewport({ width: F.w, height: F.h, deviceScaleFactor: F.long ? 1280 / 1920 : 1 });
  // the film expects the HyperFrames runtime to have created this registry
  await page.evaluateOnNewDocument((kit) => {
    window.__timelines = {};
    if (kit) window.__SD_KIT = kit; // the stage's options, as if the film had asked for them
  }, process.env.SD_KIT ? JSON.parse(process.env.SD_KIT) : null);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) {
    await browser.close();
    throw new Error(`La page a levé une erreur: ${errors[0]}`);
  }
  return { browser, page };
}

/** Draw one cover on the open page and write it to `out`. Returns what the checks found. */
async function shoot(page, { ep, sched, F, cfg, out }) {
  const at = resolveMoment(sched.beats, sched.cues, cfg.at ?? sched.duration * 0.3);
  const lines = cfg.title ?? [ep.title];
  const tag = cfg.tag ?? `${SERIES[ep.serie ?? "dossier"]?.tag ?? "Dossier"} ${ep.serie && ep.serie !== "dossier" ? ep.id.replace(/^[A-Z]+/, "") : ep.id}`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const found = await page.evaluate(
    ({ at, cam, lines, style, state, tone, tag, grade, kit, ring, badge, foot }) => {
      const { stage } = window.SD;
      // a page that already drew a cover: its words, its style and its grade go first
      document.getElementById("cover")?.remove();
      document.getElementById("cover-style")?.remove();
      window.__coverGrade ??= { ...stage.grade, gel: stage.grade.gel.clone() };
      const { gel: gel0, ...grade0 } = window.__coverGrade;
      Object.assign(stage.grade, grade0);
      stage.grade.gel.copy(gel0);
      if (grade) {
        const { gel, ...rest } = grade; // gel: a colour ("#FF5B2E"), with gelAmount — it multiplies, black stays black
        Object.assign(stage.grade, rest);
        if (gel) stage.grade.gel.set(gel);
      }
      window.SD.force = state;
      window.__timelines.main.time(at);
      document.documentElement.style.setProperty("--tone", `var(--${tone})`);
      stage.pose = { dof: 0, ...cam, drift: 0 }; // hold the camera on the cover pose, whatever the timeline says — sharp from edge to edge unless the cover asks for a lens
      // the studio's options for this picture alone (as `look` does), put back once it is drawn
      const was = { air: stage.air && { ...stage.air, color: stage.air.color?.clone() }, finish: stage.finish };
      if (kit) {
        if (kit.dof != null || kit.focus != null) stage.pose = { ...stage.pose, ...(kit.dof != null && { dof: kit.dof }), ...(kit.focus != null && { focus: kit.focus }) };
        if (kit.air != null && stage.air) stage.air.amount = kit.air;
        if (kit.airColor && stage.air) stage.air.color.set(kit.airColor);
        for (const k of ["depth", "spread", "lift", "x", "floor"]) {
          const v = kit["air" + k[0].toUpperCase() + k.slice(1)];
          if (v != null && stage.air) stage.air[k] = v;
        }
        if (kit.finish != null) stage.finish = kit.finish;
      }
      stage.renderAt(at);
      if (kit) {
        if (was.air) Object.assign(stage.air, was.air);
        stage.finish = was.finish;
      }

      document.head.append(Object.assign(document.createElement("style"), { id: "cover-style", textContent: style }));
      const brand = document.querySelector(".hud__brand")?.textContent ?? "";
      const el = Object.assign(document.createElement("div"), { id: "cover" });
      el.innerHTML = `<div class="shade"></div><div class="lock"><div class="tag"><i></i><span>${tag}</span></div><h1>${lines
        .map((l) => `<span>${l}</span>`)
        .join("")}</h1><div class="brand">${foot ?? brand}</div></div>`;
      if (ring) {
        const r = Object.assign(document.createElement("div"), { className: "ring", innerHTML: "<i></i><i></i><i></i><i></i>" });
        Object.assign(r.style, { left: `${ring.x - ring.r}px`, top: `${ring.y - ring.r}px`, width: `${2 * ring.r}px`, height: `${2 * ring.r}px` });
        el.append(r);
      }
      document.getElementById("root").append(el);
      // the longest line sets the size
      const h1 = el.querySelector("h1");
      let size = parseFloat(getComputedStyle(h1).fontSize);
      while (size > 90 && h1.scrollWidth > h1.clientWidth) h1.style.fontSize = `${(size -= 4)}px`;
      // what the duration badge would hide: the words' box against the bottom-right corner
      const W = window.innerWidth, H = window.innerHeight;
      const words = el.querySelector(".lock").getBoundingClientRect();
      const hidden = words.right > W * badge.x && words.bottom > H * badge.y;
      return { size, hidden };
    },
    { at, cam: cfg.cam ?? {}, lines, style: F.long ? LONG + extra(cfg) : STYLE + shortExtra(cfg), state: cfg.state ?? null, tone: cfg.tone ?? "veille", tag, grade: cfg.grade ?? null, kit: cfg.kit ?? null, ring: cfg.ring ?? null, badge: BADGE, foot: F.long ? null : cfg.foot ?? null },
  );
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: F.w, height: F.h } });
  const bytes = fs.statSync(out).size;
  const notes = [];
  if (F.long && found.hidden) notes.push("des mots tombent sous la durée (coin bas droit)");
  if (F.long && bytes > MAX_BYTES) notes.push(`${(bytes / 1048576).toFixed(2)} Mo : YouTube refuse au-dessus de 2 Mo`);
  return { out, bytes, size: found.size, notes };
}

/** `out`: write the cover there instead of renders/ (a trial). `thumb`: a thumbnail's settings in place of episode.json's.
 *  SD_KIT='{"dof":4,"finish":1}' hands the stage its options, like `look`. */
export async function cover(dir, { alt = false, out: to = null, thumb = null, gpu = false } = {}) {
  const { ep, sched } = await build(dir, { quiet: true });
  const F = frameOf(dir);
  // a long may carry more thumbnails for YouTube's test: `--alt 2` reads "thumb2", `--alt 3` "thumb3" → <dossier>-miniature-<n>.png
  const cfg = thumb ?? (F.long ? (alt ? ep[`thumb${alt}`] ?? ep.thumbAlt : ep.thumb) : ep.cover) ?? {};
  const out = to ?? path.join(ROOT, "renders", `${path.basename(dir)}-${F.long ? (alt ? `miniature-${alt}` : "miniature") : "couverture"}.png`);
  const { browser, page } = await openFilm(dir, F, gpu);
  let shot;
  try {
    shot = await shoot(page, { ep, sched, F, cfg, out });
  } finally {
    await browser.close();
  }
  for (const n of shot.notes) console.log(`  ! ${n}`);
  console.log(`\n  couverture → ${out}\n`);
  return out;
}

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

/** Several of a long's thumbnails at once (`list`: [{ name, …thumb }]) into `outDir`, then the sheet that judges them at 160 px. */
export async function covers(dir, { list, outDir, gpu = false, sheet = true } = {}) {
  const { ep, sched } = await build(dir, { quiet: true });
  const F = frameOf(dir);
  fs.mkdirSync(outDir, { recursive: true });
  const { browser, page } = await openFilm(dir, F, gpu);
  const shots = [];
  try {
    for (const [i, cfg] of list.entries()) {
      const shot = await shoot(page, { ep, sched, F, cfg, out: path.join(outDir, `${cfg.name ?? String(i + 1)}.png`) });
      shots.push({ ...shot, cfg });
      console.log(`  ${path.basename(shot.out)} · ${(shot.bytes / 1024).toFixed(0)} Ko · mots ${Math.round(shot.size)} px${shot.notes.map((n) => ` · ! ${n}`).join("")}`);
    }
  } finally {
    await browser.close();
  }
  if (sheet && F.long)
    await thumbSheet({
      groups: [{ title: ep.post?.youtube?.title ?? ep.title, duration: mmss(sched.duration), files: shots.map((s) => s.out), labels: shots.map((s) => s.cfg.name ?? ""), titles: shots.map((s) => s.cfg.videoTitle) }],
      out: path.join(outDir, "planche-160.png"),
    });
  return shots;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** The thumbnails as YouTube shows them: the "up next" list (160 px wide, title on the right, the duration badge over the
 *  bottom-right corner) in the dark and the light theme, and the phone's feed (360 px). Drawn at 1:1: what reads here reads there.
 *  `groups`: [{ title, duration: "8:51", files: [png…], labels?: [...], titles?: [...] }] */
export async function thumbSheet({ groups, out }) {
  const url = (f) => pathToFileURL(path.resolve(f)).href;
  const item = (f, g, i, theme, w) => `
    <div class="it ${theme}" style="--w:${w}px">
      <div class="th"><img src="${url(f)}"><b>${g.duration}</b></div>
      <div class="tx"><p class="ti">${esc(g.titles?.[i] ?? g.title)}</p><p class="ch">Système Décodé</p><p class="ch">1,2 k vues · il y a 2 jours</p><p class="lb">${esc(g.labels?.[i] ?? i + 1)}</p></div>
    </div>`;
  const html = `<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; background: #222; font-family: Roboto, Arial, sans-serif; }
    .g { display: flex; } .col { padding: 14px 16px; }
    .dark { background: #0f0f0f; color: #f1f1f1; } .light { background: #fff; color: #0f0f0f; }
    .it { display: flex; gap: 8px; margin-bottom: 10px; width: calc(var(--w) + 210px); }
    .th { position: relative; width: var(--w); height: calc(var(--w) * 9 / 16); flex: none; border-radius: 8px; overflow: hidden; background: #333; }
    .th img { width: 100%; height: 100%; display: block; }
    .th b { position: absolute; right: 4px; bottom: 4px; background: rgba(0,0,0,0.8); color: #fff; font: 500 12px/1 Roboto, Arial; padding: 3px 4px; border-radius: 4px; }
    .tx p { margin: 0; }
    .ti { font: 500 14px/20px Roboto, Arial; max-height: 40px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
    .ch { font: 400 12px/18px Roboto, Arial; opacity: 0.6; } .lb { font: 700 11px/16px monospace; color: #e33; }
    .feed { display: flex; flex-wrap: wrap; gap: 16px; padding: 14px 16px; background: #0f0f0f; color: #f1f1f1; }
    .feed .it { flex-direction: column; width: var(--w); } .feed .ti { font-size: 15px; }
  </style><body>${groups
    .map(
      (g) => `<div class="g"><div class="col dark">${g.files.map((f, i) => item(f, g, i, "dark", 160)).join("")}</div>
        <div class="col light">${g.files.map((f, i) => item(f, g, i, "light", 160)).join("")}</div></div>
        <div class="feed">${g.files.map((f, i) => item(f, g, i, "", 360)).join("")}</div>`,
    )
    .join("")}</body>`;
  const tmp = out.replace(/\.png$/i, "") + ".html";
  fs.writeFileSync(tmp, html);
  const browser = await launchChrome(PAGE);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 400, deviceScaleFactor: 1 });
    await page.goto(url(tmp), { waitUntil: "load" });
    await page.screenshot({ path: out, fullPage: true });
  } finally {
    await browser.close();
    fs.rmSync(tmp, { force: true });
  }
  console.log(`\n  planche à 160 px → ${out}\n`);
  return out;
}

// Run directly: trials of a long's thumbnails, and the 160 px sheet (npm run cover stays the way to write the real ones).
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const { resolveEpisode } = await import("./lib/episode.mjs");
  const [arg, ...rest] = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith("--")) continue;
    const next = rest[i + 1];
    if (next != null && !next.startsWith("--")) flags[rest[i].slice(2)] = rest[++i];
    else flags[rest[i].slice(2)] = true;
  }
  const dir = resolveEpisode(arg);
  const outDir = path.resolve(String(flags.out ?? path.join(ROOT, ".cache", "miniatures", path.basename(dir))));
  if (flags.thumbs) {
    const list = JSON.parse(fs.readFileSync(path.resolve(String(flags.thumbs)), "utf8"));
    await covers(dir, { list, outDir, gpu: !!flags.gpu, sheet: !flags["no-sheet"] });
  } else if (flags.sheet) {
    const { ep, sched } = await build(dir, { quiet: true });
    const base = path.join(ROOT, "renders", `${path.basename(dir)}-miniature`);
    const files = [`${base}.png`, `${base}-2.png`, `${base}-3.png`].filter((f) => fs.existsSync(f));
    fs.mkdirSync(outDir, { recursive: true });
    await thumbSheet({ groups: [{ title: ep.post?.youtube?.title ?? ep.title, duration: mmss(sched.duration), files }], out: path.join(outDir, "planche-160.png") });
  } else {
    await cover(dir, { alt: flags.alt === true ? 2 : Number(flags.alt ?? 0), out: flags.out ? path.resolve(String(flags.out)) : null, gpu: !!flags.gpu });
  }
}
