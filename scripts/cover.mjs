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

export async function cover(dir) {
  const { ep, sched } = await build(dir, { quiet: true });
  const cfg = ep.cover ?? {};
  const at = resolveMoment(sched.beats, sched.cues, cfg.at ?? sched.duration * 0.3);
  const lines = cfg.title ?? [ep.title];
  const out = path.join(ROOT, "renders", `${path.basename(dir)}-couverture.png`);
  fs.mkdirSync(path.dirname(out), { recursive: true });

  const browser = await launchChrome(["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"]);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
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
      ({ at, cam, lines, id, style }) => {
        const { stage } = window.SD;
        window.__timelines.main.time(at);
        stage.pose = { ...cam, drift: 0 }; // hold the camera on the cover pose, whatever the timeline says
        stage.renderAt(at);

        document.head.append(Object.assign(document.createElement("style"), { textContent: style }));
        const brand = document.querySelector(".hud__brand")?.textContent ?? "";
        const el = Object.assign(document.createElement("div"), { id: "cover" });
        el.innerHTML = `<div class="shade"></div><div class="lock"><div class="tag"><i></i><span>Dossier ${id}</span></div><h1>${lines
          .map((l) => `<span>${l}</span>`)
          .join("")}</h1><div class="brand">${brand}</div></div>`;
        document.getElementById("root").append(el);
        // the longest line sets the size
        const h1 = el.querySelector("h1");
        let size = 220;
        while (size > 90 && h1.scrollWidth > h1.clientWidth) h1.style.fontSize = `${(size -= 4)}px`;
      },
      { at, cam: cfg.cam ?? {}, lines, id: ep.id, style: STYLE },
    );
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  } finally {
    await browser.close();
  }
  console.log(`\n  couverture → ${out}\n`);
  return out;
}
