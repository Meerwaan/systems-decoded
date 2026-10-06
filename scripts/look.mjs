// Trial frames: the film's own page, seeked to a few moments — each optionally with another camera
// pose — laid side by side with TikTok's zones over them. It is how a framing is found: ten poses
// in one look, no render, nothing written into the film until one of them is right.
//   npm run look -- 003 --at 0.04,accroche:casser+0.2,31.5
//   npm run look -- 003 --file essais.json      [{ "at": "poulie:surveille", "pose": { "d": 240 }, "label": "plus près" }, …]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { build } from "./build.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";
import { ZONES } from "./review.mjs";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** `shots`: [{ at, pose?, label? }] · `width`: px of one frame on the sheet · `bare`: the 3D alone, no text over it. */
export async function look(dir, { shots, cols = 4, width = 405, zones = true, bare = false, out } = {}) {
  const { sched } = await build(dir, { quiet: true });
  const list = shots.map((s) => ({ ...s, t: Math.min(sched.duration - 0.01, Math.max(0, resolveMoment(sched.beats, sched.cues, s.at))) }));
  const folder = path.join(dir, "snapshots", "essais");
  fs.rmSync(folder, { recursive: true, force: true });
  fs.mkdirSync(folder, { recursive: true });
  const sheet = out ?? path.join(ROOT, "renders", `${path.basename(dir)}-essais.jpg`);
  fs.mkdirSync(path.dirname(sheet), { recursive: true });

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
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    if (errors.length) throw new Error(`La page a levé une erreur: ${errors[0]}`);
    if (bare) await page.addStyleTag({ content: "#root > :not(#stage):not(#vignette) { display: none !important; }" });

    for (const [i, s] of list.entries()) {
      await page.evaluate(
        ({ t, pose }) => {
          const { stage } = window.SD;
          window.__timelines.main.time(t);
          stage.pose = pose ? { ...pose, drift: 0 } : null;
          stage.renderAt(t);
        },
        { t: s.t, pose: s.pose ?? null },
      );
      if (errors.length) throw new Error(`Erreur à ${s.t} s: ${errors[0]}`);
      s.file = path.join(folder, `${String(i).padStart(2, "0")}.jpg`);
      await page.screenshot({ path: s.file, type: "jpeg", quality: 90, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    }

    // the zones are drawn for a frame 270 px wide (the contact sheet): one scaled layer puts them on ours
    const layer = zones ? `<div class="zones">${ZONES}</div>` : "";
    const cells = list
      .map((s) => `<figure><div><img src="${pathToFileURL(s.file).href}">${layer}</div><figcaption><b>${esc(s.label ?? s.at)}</b><i>${s.t.toFixed(2)} s</i></figcaption></figure>`)
      .join("");
    const html = `<!doctype html><meta charset="utf-8"><style>
      body { margin: 0; padding: 16px; background: #070a0c; color: #e9e4d8; font: 500 15px/1.25 "Segoe UI", system-ui, sans-serif; width: ${cols * (width + 12) + 32}px; box-sizing: border-box; }
      main { display: grid; grid-template-columns: repeat(${cols}, ${width}px); gap: 12px; }
      figure { margin: 0; } img { display: block; width: ${width}px; height: ${width * (1920 / 1080)}px; outline: 1px solid #1c2428; }
      figure > div { position: relative; overflow: hidden; }
      .zones { position: absolute; left: 0; top: 0; width: 270px; height: 480px; transform-origin: 0 0; transform: scale(${(width / 270).toFixed(4)}); }
      .zones i { position: absolute; background: rgba(255, 91, 46, 0.14); outline: 1px dashed rgba(255, 91, 46, 0.6); }
      figcaption { padding: 5px 2px 0; display: flex; justify-content: space-between; gap: 8px; } figcaption i { opacity: 0.55; font-style: normal; }
    </style><main>${cells}</main>`;
    const htmlFile = path.join(folder, "essais.html");
    fs.writeFileSync(htmlFile, html);
    const board = await browser.newPage();
    await board.setViewport({ width: cols * (width + 12) + 32, height: 900, deviceScaleFactor: 1 });
    await board.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
    await board.screenshot({ path: sheet, fullPage: true, type: "jpeg", quality: 90 });
  } finally {
    await browser.close();
  }
  console.log(`\n  essais: ${list.length} images → ${sheet}\n`);
  return { sheet, shots: list };
}
