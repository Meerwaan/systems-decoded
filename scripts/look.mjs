// Trial frames: the film's own page, seeked to a few moments — each optionally with another camera
// pose — laid side by side with TikTok's zones over them. It is how a framing is found: ten poses
// in one look, no render, nothing written into the film until one of them is right.
//   npm run look -- 003 --at 0.04,accroche:casser+0.2,31.5
//   npm run look -- 003 --file essais.json      [{ "at": "poulie:surveille", "pose": { "d": 240 }, "label": "plus près" }, …]
//   …and, in a film staged with kit/lib/direct.js, "state": { "explode": 1 } holds numbers of the world's state for that frame:
//   a model or a set is judged before any act is written.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { build } from "./build.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";
import { ZONES } from "./review.mjs";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// A trial frame is drawn by the graphics card when there is one: 10 to 30 ms a frame, against 2 to 14 s
// on the processor (SwiftShader). The film itself is still rendered by HyperFrames, in software: a
// framing is judged here, a fine point of the picture (bloom, the edge of a line) on a draft render.
const PAGE = ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"];
const GPU = ["--use-gl=angle", ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []), "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"];
const CPU = ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
const drawnBy = (page) =>
  page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const info = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl ? String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) : "";
  });

/** `shots`: [{ at, pose?, state?, label? }] · `width`: px of one frame on the sheet · `bare`: the 3D alone, no text over it · `cpu`: draw in software, like the render. */
export async function look(dir, { shots, cols = 4, width = 405, zones = true, bare = false, cpu = false, out } = {}) {
  const { sched } = await build(dir, { quiet: true });
  const list = shots.map((s) => ({ ...s, t: Math.min(sched.duration - 0.01, Math.max(0, resolveMoment(sched.beats, sched.cues, s.at))) }));
  // its own folder: two looks at once (two episodes, or two people at work on the kit) never share their frames
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "sd-look-"));
  const sheet = out ?? path.join(ROOT, "renders", `${path.basename(dir)}-essais.jpg`);
  fs.mkdirSync(path.dirname(sheet), { recursive: true });

  let browser = await launchChrome([...(cpu ? CPU : GPU), ...PAGE]).catch(() => null);
  let renderer = browser ? await drawnBy(await browser.newPage()).catch(() => "") : "";
  if (!browser || !renderer || (!cpu && /swiftshader|llvmpipe/i.test(renderer))) {
    // no card to draw with (or it refused): the processor does it, slowly
    await browser?.close();
    browser = await launchChrome([...CPU, ...PAGE]);
    renderer = "processeur (SwiftShader)";
  }
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
        ({ t, pose, state }) => {
          const { stage } = window.SD;
          window.__timelines.main.time(t);
          stage.pose = pose ? { ...pose, drift: 0 } : null;
          window.SD.force = state; // numbers of the world's state held whatever the timeline says (kit/lib/direct.js)
          stage.renderAt(t);
        },
        { t: s.t, pose: s.pose ?? null, state: s.state ?? null },
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
    fs.rmSync(folder, { recursive: true, force: true });
  }
  console.log(`\n  essais: ${list.length} images → ${sheet}\n  dessinées par : ${renderer}\n`);
  return { sheet, shots: list };
}
