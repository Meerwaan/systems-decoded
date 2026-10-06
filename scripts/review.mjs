// Contact sheet: the whole film on one page — one frame in the middle of every phrase, one just
// after every cue, the first frame and the last. Under each, the time and what is being said.
// It is how an episode is reviewed before a render: rhythm, framing, legibility, the loop.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { hyperframes } from "./lib/hf.mjs";
import { build } from "./build.mjs";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** `only`: [from, to] seconds · `every`: one frame every N seconds instead of one per phrase and per cue. */
export const ZONES = [[0, 0, 53, 1920], [1027, 0, 53, 1920], [53, 0, 974, 205], [905, 880, 122, 880], [53, 1620, 974, 300]]
  .map(([x, y, w, h]) => `<i style="left:${x / 4}px;top:${y / 4}px;width:${w / 4}px;height:${h / 4}px"></i>`)
  .join("");

export async function review(dir, { cols = 8, only, every, zones = true } = {}) {
  const { ep, sched } = await build(dir, { quiet: true });
  const said = (t) => {
    const beat = sched.beats.find((b) => t >= b.start - 0.05 && t <= b.end + 0.05);
    if (!beat) return "";
    const i = beat.words.findLastIndex((w) => w.s <= t);
    return beat.words.slice(Math.max(0, i - 2), i + 3).map((w) => w.t).join(" ");
  };

  let moments = [{ t: 0.04, label: "première image", kind: "edge" }];
  for (const b of sched.beats) moments.push({ t: (b.start + b.end) / 2, label: b.id, kind: "beat" });
  for (const [name, t] of Object.entries(sched.cues)) moments.push({ t: t + 0.25, label: `▸ ${name}`, kind: "cue" });
  moments.push({ t: sched.duration - 0.04, label: "dernière image", kind: "edge" });
  moments = moments.filter((m) => m.t > 0 && m.t < sched.duration).sort((a, b) => a.t - b.t);
  // two frames a few hundredths apart show the same picture: keep the cue
  moments = moments.filter((m, i) => !moments.some((o, k) => k !== i && Math.abs(o.t - m.t) < 0.12 && (o.kind === "cue") > (m.kind === "cue")));
  if (every) {
    moments = [];
    for (let x = only?.[0] ?? 0.04; x <= Math.min(only?.[1] ?? Infinity, sched.duration - 0.04); x += every) moments.push({ t: x, label: sched.beats.findLast((b) => b.start <= x + 0.05)?.id ?? "", kind: "beat" });
  } else if (only) moments = moments.filter((m) => m.t >= only[0] && m.t <= only[1]);
  moments.forEach((m) => (m.t = Math.round(m.t * 1000) / 1000));

  const shots = path.join(dir, "snapshots", "planche");
  fs.rmSync(shots, { recursive: true, force: true });
  fs.mkdirSync(shots, { recursive: true });
  const status = hyperframes("snapshot", dir, ["--describe", "false", "--no-end", "--at", moments.map((m) => m.t).join(","), "-o", shots], { quiet: true });
  const files = fs.readdirSync(shots).filter((n) => n.endsWith(".png")).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  if (status !== 0 || files.length !== moments.length) throw new Error(`Captures incomplètes (${files.length}/${moments.length}) : lance npm run check -- ${ep.id}`);

  const cells = moments
    .map(
      (m, i) => `<figure class="${m.kind}"><div><img src="${pathToFileURL(path.join(shots, files[i])).href}">${zones ? ZONES : ""}</div><figcaption><b>${esc(m.label)}</b><i>${m.t.toFixed(2)} s</i><span>${esc(said(m.t))}</span></figcaption></figure>`,
    )
    .join("");
  const html = `<!doctype html><meta charset="utf-8"><style>
    body { margin: 0; padding: 28px; background: #070a0c; color: #e9e4d8; font: 500 15px/1.25 "Segoe UI", system-ui, sans-serif; width: ${cols * 286 + 56}px; box-sizing: border-box; }
    h1 { font-size: 26px; margin: 0 0 20px; letter-spacing: 0.04em; } h1 small { font-weight: 400; opacity: 0.6; font-size: 17px; margin-left: 14px; }
    main { display: grid; grid-template-columns: repeat(${cols}, 270px); gap: 16px; }
    figure { margin: 0; } img { display: block; width: 270px; height: 480px; border-radius: 6px; outline: 1px solid #1c2428; }
    figure.cue img { outline-color: #5cffb0; } figure.edge img { outline-color: #ff5b2e; }
    figure > div { position: relative; }
    /* what TikTok covers on a tall phone (¼ scale): side crops, search bar, buttons, name and caption */
    figure > div i { position: absolute; background: rgba(255, 91, 46, 0.2); outline: 1px dashed rgba(255, 91, 46, 0.7); pointer-events: none; }
    figcaption { padding: 7px 2px 0; display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; }
    figcaption i { opacity: 0.55; font-style: normal; font-variant-numeric: tabular-nums; } figcaption span { grid-column: 1 / -1; opacity: 0.7; font-size: 13px; min-height: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    figure.cue b { color: #5cffb0; } figure.edge b { color: #ff5b2e; }
  </style><h1>Dossier ${esc(ep.id)} — ${esc(ep.title)}<small>${sched.duration.toFixed(1)} s · ${sched.beats.length} phrases · ${Object.keys(sched.cues).length} repères · timing ${sched.estimated ? "estimé" : "voix réelle"}</small></h1><main>${cells}</main>`;
  const sheet = path.join(shots, "planche.html");
  fs.writeFileSync(sheet, html);

  const out = path.join(ROOT, "renders", `${path.basename(dir)}-planche.jpg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const browser = await launchChrome(["--allow-file-access-from-files"]);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: cols * 286 + 56, height: 900, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(sheet).href, { waitUntil: "load" });
    await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 86 });
  } finally {
    await browser.close();
  }
  console.log(`\n  planche-contact: ${moments.length} images → ${out}\n`);
  return { out, moments, shots };
}
