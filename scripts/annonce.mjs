// Système Décodé — the Instagram story that announces a long film's release: "ce soir, 18 h 15, sur YouTube".
// A real frame of the film (the 3D alone, taken from its vertical promo HSnn, whose world is the long's), the house
// type and the three colours; no platform logo. It keeps Instagram's zones clear (its header down to y ≈ 250, its reply
// bar under y ≈ 1640) and leaves a marked slot (y 1410–1538) for the countdown sticker, which reminds whoever taps it.
//   node scripts/annonce.mjs <HSnn> --heure "18 h 15" [--out <dossier>]   → renders/<HSnn>-story-annonce.png
//   node scripts/annonce.mjs <HSnn> --lien [--out <dossier>]              → renders/<HSnn>-story-lien.png (the long is out: link sticker)
// The words come from the long's episode.json (post.youtube, thumb) and must be its own: no spoiler, no "série".
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { resolveEpisode } from "./lib/episode.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { build } from "./build.mjs";

const PAGE = ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"];
const GPU = ["--use-gl=angle", ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []), "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"];

// What each announce says, per promo. `at` (s) and `cam`: the frame of the promo's 3D used as the picture.
const ANNONCES = {
  HS02: {
    at: 25.5,
    cam: { tx: 0, ty: 748, tz: 0, d: 360, az: -28, el: 8, fov: 32, shift: -20, side: 0, roll: 0, drift: 0 },
    kicker: "Nouveau grand format · 9 min 10",
    title: ["Coupée,", "et <s>mortelle</s>"],
    sub: "400 000 volts. La ligne est coupée.<br>Le détecteur dit : rien. Et pourtant…",
  },
  // --lien: the story posted once the long is out, with the link sticker (not a countdown)
  HS04: {
    at: 0.04,
    kicker: "Le film complet · 10 min 28",
    title: ["Il ne bouge", "<s>pas</s>"],
    sub: "Moteurs à fond, ton Rafale reste cloué au pont.<br>Puis zéro à 240 km/h, en 75 mètres.",
  },
};

const fonts = (dir) =>
  [["Barlow Condensed", "barlow-condensed", [500, 600, 700, 800]], ["JetBrains Mono", "jetbrains-mono", [400, 500, 700]]]
    .flatMap(([family, file, weights]) => weights.map((w) => `@font-face { font-family: "${family}"; font-weight: ${w}; src: url("${pathToFileURL(path.join(dir, "gen", "fonts", `${file}-latin-${w}-normal.woff2`)).href}") format("woff2"); }`))
    .join("\n");

/** The account's mark (brand/avatar.svg without its ground), as in scripts/social.mjs. */
const EYE = `<svg viewBox="150 250 780 580" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(540 540) scale(1.1) translate(-540 -540)">
    <g stroke="#e9e4d8" stroke-opacity="0.45" stroke-width="9" stroke-linecap="round" stroke-dasharray="4 22"><line x1="244" y1="474" x2="244" y2="606" /><line x1="836" y1="474" x2="836" y2="606" /></g>
    <g fill="none" stroke="#e9e4d8" stroke-width="56" stroke-linecap="round"><path d="M 244 462 A 312 236 0 0 1 836 462" /><path d="M 244 618 A 312 236 0 0 0 836 618" /></g>
    <circle cx="540" cy="540" r="150" fill="none" stroke="#5cffb0" stroke-opacity="0.32" stroke-width="7" />
    <circle cx="540" cy="540" r="94" fill="#5cffb0" />
  </g></svg>`;

const story = ({ frame, a, heure, lien }) => `<!doctype html><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #070a0c; --ink: #e9e4d8; --dim: rgba(233, 228, 216, 0.68); --faint: rgba(233, 228, 216, 0.24); --veille: #5cffb0; --signal: #ff5b2e; --display: "Barlow Condensed", sans-serif; --mono: "JetBrains Mono", monospace; }
  body { background: var(--bg); color: var(--ink); overflow: hidden; }
  .page { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: var(--bg); }
  .mono { font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.14em; }
  .bg { position: absolute; inset: 0; width: 1080px; height: 1920px; }
  .shade { position: absolute; inset: 0; background:
    linear-gradient(to bottom, rgba(7, 10, 12, 0.97) 0, rgba(7, 10, 12, 0.9) 600px, rgba(7, 10, 12, 0.45) 860px, rgba(7, 10, 12, 0) 1000px),
    linear-gradient(to top, rgba(7, 10, 12, 0.97) 0, rgba(7, 10, 12, 0.9) 470px, rgba(7, 10, 12, 0.45) 620px, rgba(7, 10, 12, 0) 720px); }
  .hud { position: absolute; left: 88px; right: 88px; top: 286px; display: flex; justify-content: space-between; align-items: center; font: 500 25px/1 var(--mono); color: var(--dim); }
  .hud em { font-style: normal; display: flex; align-items: center; gap: 16px; color: var(--ink); }
  .hud .eye { width: 62px; height: 46px; }
  .dot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; background: var(--signal); box-shadow: 0 0 18px var(--signal); margin-right: 16px; vertical-align: 2px; }
  .rule { position: absolute; left: 88px; right: 88px; top: 352px; height: 2px; background: var(--faint); }
  .kicker { position: absolute; left: 88px; top: 396px; font: 700 30px/1 var(--mono); color: var(--veille); }
  h1 { position: absolute; left: 82px; top: 446px; font: 800 168px/0.9 var(--display); text-transform: uppercase; letter-spacing: -0.01em; text-shadow: 0 4px 40px rgba(7, 10, 12, 0.9); }
  h1 s { text-decoration: none; color: var(--signal); }
  .sub { position: absolute; left: 88px; right: 88px; top: 780px; font: 500 46px/1.2 var(--display); color: var(--ink); text-shadow: 0 2px 24px rgba(7, 10, 12, 1); }
  /* the rendezvous: the hour, big, and where */
  .when { position: absolute; left: 0; right: 0; top: 1268px; text-align: center; }
  .when .lbl { font: 700 30px/1 var(--mono); color: var(--dim); }
  .when .h { font: 800 150px/0.9 var(--display); color: var(--ink); text-shadow: 0 0 60px rgba(7, 10, 12, 1); }
  .when .where { margin-top: 18px; font: 700 34px/1 var(--mono); color: var(--veille); }
  .slot { position: absolute; left: 190px; right: 190px; top: 1462px; height: 120px; }
  .slot i { position: absolute; width: 34px; height: 34px; border: 0 solid var(--veille); }
  .slot i:nth-child(1) { left: 0; top: 0; border-left-width: 4px; border-top-width: 4px; } .slot i:nth-child(2) { right: 0; top: 0; border-right-width: 4px; border-top-width: 4px; }
  .slot i:nth-child(3) { left: 0; bottom: 0; border-left-width: 4px; border-bottom-width: 4px; } .slot i:nth-child(4) { right: 0; bottom: 0; border-right-width: 4px; border-bottom-width: 4px; }
  .handle { position: absolute; left: 0; right: 0; top: 1604px; text-align: center; font: 700 28px/1 var(--mono); letter-spacing: 0.1em; color: var(--dim); text-shadow: 0 0 20px rgba(7, 10, 12, 1); }
  .live { background: var(--veille); box-shadow: 0 0 18px var(--veille); }
  .go { position: absolute; left: 0; right: 0; top: 1300px; text-align: center; font: 800 76px/1 var(--display); text-transform: uppercase; color: var(--veille); text-shadow: 0 0 40px rgba(7, 10, 12, 1), 0 0 12px rgba(7, 10, 12, 1); }
  .chev { position: absolute; left: 50%; top: 1398px; width: 0; height: 0; }
  .chev i { position: absolute; left: -17px; width: 34px; height: 34px; border-right: 5px solid var(--veille); border-bottom: 5px solid var(--veille); transform: rotate(45deg); }
  .chev i:nth-child(1) { top: -30px; opacity: 0.35; } .chev i:nth-child(2) { top: -14px; opacity: 0.65; } .chev i:nth-child(3) { top: 2px; }
</style><div class="page">
  <img class="bg" src="${frame}"><div class="shade"></div>
  <div class="hud mono">${lien ? `<span><i class="dot live"></i>En ligne · maintenant</span>` : `<span><i class="dot"></i>Ce soir · ${heure}</span>`}<em><span class="eye">${EYE}</span>Système Décodé</em></div>
  <div class="rule"></div>
  <div class="kicker mono">${a.kicker}</div>
  <h1>${a.title.join("<br>")}</h1>
  <p class="sub">${a.sub}</p>
  ${lien
    ? `<div class="go">Le lien est juste là</div><div class="chev"><i></i><i></i><i></i></div>`
    : `<div class="when"><div class="h">${heure}</div><div class="where mono">Sur notre chaîne YouTube</div></div>`}
  <div class="slot"><i></i><i></i><i></i><i></i></div>
  <div class="handle mono">${lien ? "Système Décodé · sur YouTube" : "Le film complet · lien en bio"}</div>
</div>`;

const args = process.argv.slice(2);
const id = args.find((x) => !x.startsWith("--"));
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const a = ANNONCES[id];
if (!a) throw new Error(`annonce : ${id ?? "?"} inconnu (${Object.keys(ANNONCES).join(", ")})`);
const heure = opt("--heure", "18 h 15");
const lien = args.includes("--lien");
const out = path.resolve(opt("--out", path.join(ROOT, "renders")));
const dir = resolveEpisode(id);
await build(dir, { quiet: true });
const folder = fs.mkdtempSync(path.join(os.tmpdir(), "sd-annonce-"));
const browser = await launchChrome([...GPU, ...PAGE]);
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => {
    window.__timelines = {};
  });
  await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "#root > :not(#stage):not(#vignette) { display: none !important; }" });
  await page.evaluate(({ at, cam }) => {
    const { stage } = window.SD;
    window.__timelines.main.time(at);
    stage.pose = cam ? { dof: 0, ...cam } : cam; // sharp unless the frame asks for a lens
    stage.renderAt(at);
  }, a);
  const shot = path.join(folder, "frame.png");
  await page.screenshot({ path: shot, type: "png", clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  await page.close();
  const html = path.join(folder, "story.html");
  fs.writeFileSync(html, `<style>${fonts(dir)}</style>` + story({ frame: pathToFileURL(shot).href, a, heure, lien }));
  const sheet = await browser.newPage();
  await sheet.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await sheet.goto(pathToFileURL(html).href, { waitUntil: "load" });
  await sheet.evaluate(() => document.fonts.ready);
  fs.mkdirSync(out, { recursive: true });
  const target = path.join(out, `${path.basename(dir)}-story-${lien ? "lien" : "annonce"}.png`);
  await sheet.screenshot({ path: target, type: "png" });
  console.log(`  → ${target}`);
} finally {
  await browser.close();
  fs.rmSync(folder, { recursive: true, force: true });
}
