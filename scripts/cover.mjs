// Grid cover for an episode: one frame of the real film (the exploded view), posed for the
// cover, with a title lock-up. Every cover is built the same way, so the profile grid reads
// as one series. episode.json → "cover": { "at": <moment>, "title": ["LIGNE 1", "LIGNE 2"], "cam": {…} }
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

export async function cover(dir, { alt = false } = {}) {
  const { ep, sched } = await build(dir, { quiet: true });
  const F = frameOf(dir);
  // a long may carry more thumbnails for YouTube's test: `--alt 2` reads "thumb2", `--alt 3` "thumb3" → <dossier>-miniature-<n>.png
  const cfg = (F.long ? (alt ? ep[`thumb${alt}`] ?? ep.thumbAlt : ep.thumb) : ep.cover) ?? {};
  const at = resolveMoment(sched.beats, sched.cues, cfg.at ?? sched.duration * 0.3);
  const lines = cfg.title ?? [ep.title];
  const out = path.join(ROOT, "renders", `${path.basename(dir)}-${F.long ? (alt ? `miniature-${alt}` : "miniature") : "couverture"}.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const browser = await launchChrome(["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"]);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: F.w, height: F.h, deviceScaleFactor: F.long ? 1280 / 1920 : 1 });
    // the film expects the HyperFrames runtime to have created this registry
    await page.evaluateOnNewDocument(() => {
      window.__timelines = {};
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    if (errors.length) throw new Error(`La page a levé une erreur: ${errors[0]}`);

    await page.evaluate(
      ({ at, cam, lines, id, style, state, tone, tag, grade }) => {
        const { stage } = window.SD;
        window.SD.force = state;
        if (grade) Object.assign(stage.grade, grade);
        window.__timelines.main.time(at);
        document.documentElement.style.setProperty("--tone", `var(--${tone})`);
        stage.pose = { ...cam, drift: 0 }; // hold the camera on the cover pose, whatever the timeline says
        stage.renderAt(at);

        document.head.append(Object.assign(document.createElement("style"), { textContent: style }));
        const brand = document.querySelector(".hud__brand")?.textContent ?? "";
        const el = Object.assign(document.createElement("div"), { id: "cover" });
        el.innerHTML = `<div class="shade"></div><div class="lock"><div class="tag"><i></i><span>${tag ?? `Dossier ${id}`}</span></div><h1>${lines
          .map((l) => `<span>${l}</span>`)
          .join("")}</h1><div class="brand">${brand}</div></div>`;
        document.getElementById("root").append(el);
        // the longest line sets the size
        const h1 = el.querySelector("h1");
        let size = parseFloat(getComputedStyle(h1).fontSize);
        while (size > 90 && h1.scrollWidth > h1.clientWidth) h1.style.fontSize = `${(size -= 4)}px`;
      },
      { at, cam: cfg.cam ?? {}, lines, id: ep.id, style: F.long ? LONG : STYLE, state: cfg.state ?? null, tone: cfg.tone ?? "veille", tag: cfg.tag ?? `${SERIES[ep.serie ?? "dossier"]?.tag ?? "Dossier"} ${ep.serie && ep.serie !== "dossier" ? ep.id.replace(/^[A-Z]+/, "") : ep.id}`, grade: cfg.grade ?? null },
    );
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: F.w, height: F.h } });
  } finally {
    await browser.close();
  }
  console.log(`\n  couverture → ${out}\n`);
  return out;
}
