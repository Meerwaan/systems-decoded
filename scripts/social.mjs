// Système Décodé — what goes on the other networks to bring people over: two Instagram stories (one sends to TikTok,
// one to YouTube Shorts) and the YouTube channel banner. Real frames of a film — the 3D alone, posed for the page —
// with the house type and the three colours over them. No platform logo: its name, in our type.
//   npm run social [-- --out <dossier>] [--only facebook]
//     → renders/story-tiktok.png · renders/story-youtube.png (1080×1920) · renders/banniere-youtube.jpg (2560×1440) · renders/post-facebook.png (1080×1350)
// A story keeps Instagram's own zones clear (its header down to y ≈ 250, its reply bar under y ≈ 1640) and leaves a marked
// slot (y 1410–1538) where Merwan drops the link sticker. The banner holds everything that matters in YouTube's safe
// area (1546×423, centred): a phone shows nothing else, a desktop the whole strip, a television the whole picture.
// The Facebook picture goes with the post that introduces the page: 4:5, the tallest picture the feed shows whole —
// the account's line, a frame of a film, and three files already opened (the bare frame of their covers).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { resolveEpisode } from "./lib/episode.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { build } from "./build.mjs";
import { resolveMoment } from "../kit/lib/ref.mjs";

const EPISODE = "012"; // the film the frames are taken from: fire, and a mechanism seen through glass
const ONLY = { facebook: ["post-facebook.png"], stories: ["story-tiktok.png", "story-youtube.png"], youtube: ["banniere-youtube.jpg"] };
// The files under the Facebook picture: each one's cover frame (episode.json → cover) without its title, and the part of it that is shown
const FILES = [
  { ep: "002", name: "Airbag", crop: { x: 0, y: 770, w: 1080 } },
  { ep: "003", name: "Ascenseur", crop: { x: 0, y: 740, w: 1080 } },
  { ep: "006", name: "Défibrillateur", crop: { x: 60, y: 800, w: 960 } },
];
const PAGE = ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"];
const GPU = ["--use-gl=angle", ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []), "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"];

// The bench, the burner alight, the whole chain alive (see episodes/012-gaziniere/src/world.js)
const P = { fov: 28, side: 0, roll: 0, drift: 0 };
const BENCH = { set: 0, shell: 0, pot: 0, spill: 0, boil: 0, you: 0, safety: 1, explode: 0, gas: 0, fill: 0, spark: 0, mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 6, fz: 0, fs: 13, flame: 1, heat: 1, volts: 1, hold: 1, valve: 1 };
const FRAMES = {
  // the thermocouple's tip in the crown of flame, from close
  fire: { pose: { ...P, tx: -1.4, ty: 9.6, tz: -3.1, d: 30, az: -42, el: 10, shift: -300 }, state: { ...BENCH, press: 1, fs: 8 } },
  // the heart in profile, seen through its glass: the magnet holding the spring
  heart: { pose: { ...P, tx: -1.5, ty: 3.5, tz: 4.9, d: 28, az: -78, el: 8, shift: -150 }, state: { ...BENCH, xray: 1, fs: 6 } },
  // the kitchen: the crown of flame under the saucepan, from below
  crown: { pose: { ...P, tx: 166, ty: 93.4, tz: 35, d: 62, az: -34, el: 7, shift: 0 }, state: { flame: 1, spill: 0, boil: 0.7, gas: 0 } },
};

const fonts = (dir) =>
  [["Barlow Condensed", "barlow-condensed", [500, 600, 700, 800]], ["JetBrains Mono", "jetbrains-mono", [400, 500, 700]]]
    .flatMap(([family, file, weights]) => weights.map((w) => `@font-face { font-family: "${family}"; font-weight: ${w}; src: url("${pathToFileURL(path.join(dir, "gen", "fonts", `${file}-latin-${w}-normal.woff2`)).href}") format("woff2"); }`))
    .join("\n");

/** The account's mark (brand/avatar.svg without its ground): an eye opened in two, its heart alight. */
const EYE = `<svg viewBox="150 250 780 580" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(540 540) scale(1.1) translate(-540 -540)">
    <g stroke="#e9e4d8" stroke-opacity="0.45" stroke-width="9" stroke-linecap="round" stroke-dasharray="4 22"><line x1="244" y1="474" x2="244" y2="606" /><line x1="836" y1="474" x2="836" y2="606" /></g>
    <g fill="none" stroke="#e9e4d8" stroke-width="56" stroke-linecap="round"><path d="M 244 462 A 312 236 0 0 1 836 462" /><path d="M 244 618 A 312 236 0 0 0 836 618" /></g>
    <circle cx="540" cy="540" r="150" fill="none" stroke="#5cffb0" stroke-opacity="0.32" stroke-width="7" />
    <circle cx="540" cy="540" r="94" fill="#5cffb0" />
  </g></svg>`;

const BASE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root { --bg: #070a0c; --ink: #e9e4d8; --dim: rgba(233, 228, 216, 0.66); --faint: rgba(233, 228, 216, 0.24); --veille: #5cffb0; --signal: #ff5b2e; --display: "Barlow Condensed", sans-serif; --mono: "JetBrains Mono", monospace; }
  body { background: var(--bg); color: var(--ink); overflow: hidden; }
  .page { position: relative; overflow: hidden; background: var(--bg); }
  .mono { font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.14em; }
  .dot { display: inline-block; width: 16px; height: 16px; border-radius: 50%; background: var(--veille); box-shadow: 0 0 18px var(--veille); margin-right: 16px; vertical-align: 2px; }
  b { font-weight: inherit; color: var(--veille); }
  .eye svg { display: block; width: 100%; height: 100%; }
`;

/** An Instagram story, 1080 × 1920. `shade`: where the picture is darkened so that the text reads. */
const story = ({ frame, platform, lines, handle, accent = "veille" }) => `<!doctype html><meta charset="utf-8"><style>${BASE}
  .page { width: 1080px; height: 1920px; }
  .bg { position: absolute; inset: 0; width: 1080px; height: 1920px; }
  .shade { position: absolute; inset: 0; background:
    linear-gradient(to bottom, rgba(7, 10, 12, 0.96) 0, rgba(7, 10, 12, 0.92) 520px, rgba(7, 10, 12, 0.5) 800px, rgba(7, 10, 12, 0) 980px),
    linear-gradient(to top, rgba(7, 10, 12, 0.94) 0, rgba(7, 10, 12, 0.78) 300px, rgba(7, 10, 12, 0.5) 560px, rgba(7, 10, 12, 0) 720px); }
  .hud { position: absolute; left: 88px; right: 88px; top: 286px; display: flex; justify-content: space-between; align-items: center; font: 500 25px/1 var(--mono); color: var(--dim); }
  .hud em { font-style: normal; display: flex; align-items: center; gap: 16px; color: var(--ink); }
  .hud .eye { width: 62px; height: 46px; }
  .rule { position: absolute; left: 88px; right: 88px; top: 352px; height: 2px; background: var(--faint); }
  h1 { position: absolute; left: 84px; top: 512px; font: 800 138px/0.93 var(--display); text-transform: uppercase; letter-spacing: -0.005em; }
  h1 b { color: var(--${accent}); }
  .sub { position: absolute; left: 88px; right: 88px; top: 388px; font: 500 40px/1.22 var(--display); color: var(--dim); }
  /* the link: chevrons, the words, and the slot the sticker is dropped into */
  .go { position: absolute; left: 0; right: 0; top: 1300px; text-align: center; font: 700 30px/1 var(--mono); color: var(--veille); text-shadow: 0 0 24px rgba(7, 10, 12, 1), 0 0 8px rgba(7, 10, 12, 1); }
  .chev { position: absolute; left: 50%; top: 1342px; width: 0; height: 0; }
  .chev i { position: absolute; left: -17px; width: 34px; height: 34px; border-right: 5px solid var(--veille); border-bottom: 5px solid var(--veille); transform: rotate(45deg) scale(1, 1); }
  .chev i:nth-child(1) { top: -14px; opacity: 0.35; } .chev i:nth-child(2) { top: 2px; opacity: 0.65; } .chev i:nth-child(3) { top: 18px; }
  .slot { position: absolute; left: 190px; right: 190px; top: 1410px; height: 128px; }
  .slot i { position: absolute; width: 34px; height: 34px; border: 0 solid var(--veille); }
  .slot i:nth-child(1) { left: 0; top: 0; border-left-width: 4px; border-top-width: 4px; } .slot i:nth-child(2) { right: 0; top: 0; border-right-width: 4px; border-top-width: 4px; }
  .slot i:nth-child(3) { left: 0; bottom: 0; border-left-width: 4px; border-bottom-width: 4px; } .slot i:nth-child(4) { right: 0; bottom: 0; border-right-width: 4px; border-bottom-width: 4px; }
  .handle { position: absolute; left: 0; right: 0; top: 1584px; text-align: center; font: 700 34px/1 var(--mono); letter-spacing: 0.1em; color: var(--ink); text-shadow: 0 0 20px rgba(7, 10, 12, 1); }
  .handle span { color: var(--dim); font-weight: 500; }
</style><div class="page">
  <img class="bg" src="${frame}"><div class="shade"></div>
  <div class="hud mono"><span><i class="dot"></i>Un dossier en 3D · 80 s</span><em><span class="eye">${EYE}</span>Système Décodé</em></div>
  <div class="rule"></div>
  <h1>${lines.join("<br>")}</h1>
  <p class="sub">Airbag, ascenseur, défibrillateur…<br>Un système de sécurité ouvert en 3D, à la seconde près.</p>
  <div class="go mono">Le lien est juste là</div>
  <div class="chev"><i></i><i></i><i></i></div>
  <div class="slot"><i></i><i></i><i></i><i></i></div>
  <div class="handle mono"><span>${platform} · </span>${handle}</div>
</div>`;

/** The YouTube channel banner, 2560 × 1440. Safe area (every screen): x 507–2053, y 508–931. */
const banner = ({ crown, heart }) => `<!doctype html><meta charset="utf-8"><style>${BASE}
  .page { width: 2560px; height: 1440px; }
  .grid { position: absolute; inset: 0; opacity: 0.5; background:
    repeating-linear-gradient(to right, rgba(233, 228, 216, 0.05) 0 2px, transparent 2px 128px),
    repeating-linear-gradient(to bottom, rgba(233, 228, 216, 0.05) 0 2px, transparent 2px 128px); }
  /* right: the crown of flame under the saucepan — it fades toward the name */
  .crown { position: absolute; left: 1420px; top: -240px; width: 1080px; height: 1920px;
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 34%, #000 86%, transparent 100%), linear-gradient(to bottom, transparent 4%, #000 26%, #000 70%, transparent 92%); -webkit-mask-composite: source-in; mask-composite: intersect; }
  /* left: the heart seen through its glass, held back */
  .heart { position: absolute; left: -84px; top: 108px; width: 648px; height: 1152px; opacity: 0.78;
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 16%, #000 62%, transparent 100%), linear-gradient(to bottom, transparent 22%, #000 40%, #000 66%, transparent 84%); -webkit-mask-composite: source-in; mask-composite: intersect; }
  .veil { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 70% at 50% 50%, rgba(7, 10, 12, 0) 40%, rgba(7, 10, 12, 0.7) 100%); }
  .tag { position: absolute; left: 600px; top: 548px; display: flex; align-items: center; gap: 22px; font: 500 27px/1 var(--mono); color: var(--dim); }
  .tag .eye { width: 92px; height: 68px; }
  h1 { position: absolute; left: 594px; top: 618px; font: 800 158px/0.92 var(--display); text-transform: uppercase; white-space: nowrap; text-shadow: 0 4px 40px rgba(7, 10, 12, 0.9); }
  .line { position: absolute; left: 600px; top: 778px; width: 880px; height: 2px; background: var(--faint); }
  .bio { position: absolute; left: 600px; top: 806px; font: 500 44px/1.18 var(--display); color: var(--ink); white-space: nowrap; text-shadow: 0 2px 24px rgba(7, 10, 12, 1); }
  .bio span { color: var(--dim); }
  /* what only a television shows: the list of files, the promise */
  .index { position: absolute; left: 600px; right: 200px; top: 300px; font: 500 24px/1.9 var(--mono); color: rgba(233, 228, 216, 0.34); }
  .index b { color: rgba(92, 255, 176, 0.6); }
  .foot { position: absolute; left: 600px; top: 1090px; font: 500 26px/1 var(--mono); color: rgba(233, 228, 216, 0.42); }
</style><div class="page">
  <div class="grid"></div>
  <img class="heart" src="${heart}"><img class="crown" src="${crown}"><div class="veil"></div>
  <div class="index mono"><b>001</b> Détecteur de fumée · <b>002</b> Airbag · <b>003</b> Ascenseur · <b>004</b> Différentiel · <b>005</b> Arrêt d'urgence<br><b>006</b> Défibrillateur · <b>007</b> Siège éjectable · <b>008</b> Paratonnerre · <b>009</b> Micro-ondes · <b>010</b> Scie sur table</div>
  <div class="tag mono"><span class="eye">${EYE}</span><span><i class="dot"></i>Un dossier en 3D · 80 secondes</span></div>
  <h1>Système <b>Décodé</b></h1>
  <div class="line"></div>
  <p class="bio">Ils veillent pendant que tu dors.<br><span>On les décode, un système à la fois.</span></p>
  <div class="foot mono">Chaque fait vérifié · chaque système ouvert pièce par pièce</div>
</div>`;

/** The picture of the Facebook post that introduces the page, 1080 × 1350. `files`: [{ id, name, src, crop }]. */
const TILE = { w: 290, h: 262 };
const post = ({ frame, files }) => `<!doctype html><meta charset="utf-8"><style>${BASE}
  .page { width: 1080px; height: 1350px; }
  .bg { position: absolute; left: 0; top: -392px; width: 1080px; height: 1920px; }
  .shade { position: absolute; inset: 0; background:
    linear-gradient(to bottom, rgba(7, 10, 12, 0.97) 0, rgba(7, 10, 12, 0.9) 340px, rgba(7, 10, 12, 0.45) 450px, rgba(7, 10, 12, 0) 560px),
    linear-gradient(to top, rgba(7, 10, 12, 1) 0, rgba(7, 10, 12, 0.97) 390px, rgba(7, 10, 12, 0.6) 470px, rgba(7, 10, 12, 0) 580px); }
  .hud { position: absolute; left: 88px; right: 88px; top: 62px; display: flex; justify-content: space-between; align-items: center; font: 500 25px/1 var(--mono); color: var(--dim); }
  .hud em { font-style: normal; display: flex; align-items: center; gap: 16px; color: var(--ink); }
  .hud .eye { width: 62px; height: 46px; }
  .rule { position: absolute; left: 88px; right: 88px; top: 128px; height: 2px; background: var(--faint); }
  h1 { position: absolute; left: 84px; top: 160px; font: 800 108px/0.93 var(--display); text-transform: uppercase; letter-spacing: -0.005em; white-space: nowrap; }
  .sub { position: absolute; left: 88px; right: 88px; top: 378px; font: 500 42px/1.2 var(--display); color: var(--dim); }
  .files { position: absolute; left: 88px; top: 978px; display: flex; gap: 17px; }
  .pic { position: relative; width: ${TILE.w}px; height: ${TILE.h}px; overflow: hidden; background: var(--bg); }
  .pic img { position: absolute; }
  .pic::after { content: ""; position: absolute; inset: 0; box-shadow: inset 0 0 0 2px var(--faint), inset 0 -70px 60px -40px rgba(7, 10, 12, 0.9); }
  .cap { margin-top: 16px; font: 500 21px/1 var(--mono); letter-spacing: 0.1em; color: var(--ink); white-space: nowrap; }
  .cap b { margin-right: 10px; }
</style><div class="page">
  <img class="bg" src="${frame}"><div class="shade"></div>
  <div class="hud mono"><span><i class="dot"></i>Un dossier en 3D · 80 s</span><em><span class="eye">${EYE}</span>Système Décodé</em></div>
  <div class="rule"></div>
  <h1><b>Ils veillent</b><br>pendant que tu dors.</h1>
  <p class="sub">On les décode, un système à la fois.</p>
  <div class="files">${files
    .map(({ id, name, src, crop }) => {
      const k = TILE.w / crop.w;
      return `<div><div class="pic"><img src="${src}" style="width: ${1080 * k}px; left: ${-crop.x * k}px; top: ${-crop.y * k}px"></div><div class="cap mono"><b>${id}</b>${name}</div></div>`;
    })
    .join("")}</div>
</div>`;

/** The frame a cover is made from (episode.json → cover), the 3D alone: scripts/cover.mjs without its title. */
async function coverFrame(browser, ep, file) {
  const dir = resolveEpisode(ep);
  const { ep: json, sched } = await build(dir, { quiet: true });
  const cfg = json.cover ?? {};
  const at = resolveMoment(sched.beats, sched.cues, cfg.at ?? sched.duration * 0.3);
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(() => {
    window.__timelines = {};
  });
  await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: "#root > :not(#stage):not(#vignette) { display: none !important; }" });
  await page.evaluate(
    ({ at, cam }) => {
      const { stage } = window.SD;
      window.__timelines.main.time(at);
      stage.pose = { dof: 0, ...cam, drift: 0 }; // sharp unless the frame asks for a lens: a close-up's blur is not inherited
      stage.renderAt(at);
    },
    { at, cam: cfg.cam ?? {} },
  );
  await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  await page.close();
  return { id: json.id, src: pathToFileURL(file).href };
}

/** `out`: where the pictures go (renders/ — or a scratch folder while they are being tuned: Merwan sees renders/). `only`: "facebook", "stories" or "youtube". */
export async function social({ out = path.join(ROOT, "renders"), only } = {}) {
  if (only && !ONLY[only]) throw new Error(`--only ${only} : inconnu (${Object.keys(ONLY).join(", ")})`);
  const wanted = (file) => !only || ONLY[only].includes(file);
  const dir = resolveEpisode(EPISODE);
  await build(dir, { quiet: true });
  const profile = JSON.parse(fs.readFileSync(path.join(ROOT, "brand", "profil.json"), "utf8"));
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "sd-social-"));
  fs.mkdirSync(out, { recursive: true });
  const browser = await launchChrome([...GPU, ...PAGE]);
  try {
    // 1 · the frames: the film's own page, the 3D alone
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => {
      window.__timelines = {};
    });
    await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: "#root > :not(#stage):not(#vignette) { display: none !important; }" });
    const frame = {};
    for (const [name, f] of Object.entries(FRAMES)) {
      await page.evaluate(({ pose, state }) => {
        const { stage } = window.SD;
        window.__timelines.main.time(0.05);
        stage.pose = pose ? { dof: 0, ...pose } : pose;
        window.SD.force = state;
        stage.renderAt(0.05);
      }, f);
      const file = path.join(folder, `${name}.png`);
      await page.screenshot({ path: file, type: "png", clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      frame[name] = pathToFileURL(file).href;
    }
    await page.close();
    const files = [];
    if (wanted("post-facebook.png")) for (const f of FILES) files.push({ ...f, ...(await coverFrame(browser, f.ep, path.join(folder, `dossier-${f.ep}.png`))) });

    // 2 · the pages
    const css = `<style>${fonts(dir)}</style>`;
    const sheets = [
      { file: "story-tiktok.png", w: 1080, h: 1920, html: story({ frame: frame.fire, platform: "TikTok", handle: `@${profile.handle}`, lines: ["On les ouvre", "un par un", "sur <b>TikTok</b>"] }) },
      { file: "story-youtube.png", w: 1080, h: 1920, html: story({ frame: frame.heart, platform: "YouTube", handle: profile.name, lines: ["On les ouvre", "aussi sur", "<b>YouTube Shorts</b>"] }) },
      { file: "banniere-youtube.jpg", w: 2560, h: 1440, html: banner(frame) },
      { file: "post-facebook.png", w: 1080, h: 1350, html: post({ frame: frame.fire, files }) },
    ].filter((s) => wanted(s.file));
    for (const s of sheets) {
      const htmlFile = path.join(folder, `${s.file}.html`);
      fs.writeFileSync(htmlFile, css + s.html);
      const sheet = await browser.newPage();
      await sheet.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
      await sheet.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
      await sheet.evaluate(() => document.fonts.ready);
      const target = path.join(out, s.file);
      await sheet.screenshot(s.file.endsWith(".jpg") ? { path: target, type: "jpeg", quality: 94 } : { path: target, type: "png" });
      console.log(`  → ${path.relative(ROOT, target)} · ${s.w}×${s.h} · ${(fs.statSync(target).size / 1048576).toFixed(1)} Mio`);
      await sheet.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(folder, { recursive: true, force: true });
  }
}

/* ------------------------------------------------------------------ le pont Instagram → YouTube (npm run pont)

   Pour un long en ligne (Lnn, Cnn, CRnn sur YouTube), tout ce que Merwan poste sur Instagram pour y emmener les
   41 000 abonnés, prêt à copier : les liens du profil, la séquence de stories (J-1, J0, J0 soir, J+2), le Reel de la
   promo HSnn s'il existe, les courts déjà en ligne dont la légende renvoie au long, et ce qu'on relève ensuite.
   Recette : docs/recette-pont-instagram-youtube.md.
     npm run pont -- L06 [--video <id|adresse>] [--heure "18 h"] [--out <dossier>] [--textes]
       → <out>/pont-<dossier>.md · story-annonce.png · story-lien.png · story-sondage.png · story-rappel.png · couverture-a-la-une.png
   Les visuels partent de la miniature du long (renders/<dossier>-miniature.png, celle que le spectateur retrouvera
   sur YouTube), sans 3D à recalculer. Aucun envoi, aucune connexion : seule la page publique de la chaîne est lue
   pour retrouver l'adresse du film (sinon --video). */

const STORY_CSS = `
  .page { width: 1080px; height: 1920px; }
  .blur { position: absolute; left: -200px; top: -120px; width: 1480px; height: 2160px; object-fit: cover; filter: blur(46px) brightness(0.5) saturate(1.1); }
  .shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(7, 10, 12, 0.9) 0, rgba(7, 10, 12, 0.55) 420px, rgba(7, 10, 12, 0.35) 900px, rgba(7, 10, 12, 0.85) 1500px, rgba(7, 10, 12, 0.96) 1920px); }
  .hud { position: absolute; left: 88px; right: 88px; top: 286px; display: flex; justify-content: space-between; align-items: center; font: 500 25px/1 var(--mono); color: var(--dim); }
  .hud em { font-style: normal; display: flex; align-items: center; gap: 16px; color: var(--ink); }
  .hud .eye { width: 62px; height: 46px; }
  .rule { position: absolute; left: 88px; right: 88px; top: 352px; height: 2px; background: var(--faint); }
  .dot.signal { background: var(--signal); box-shadow: 0 0 18px var(--signal); }
  .kicker { position: absolute; left: 88px; top: 392px; font: 700 30px/1 var(--mono); color: var(--veille); }
  .card { position: absolute; left: 40px; top: 440px; width: 1000px; height: 563px; overflow: hidden; background: var(--bg); box-shadow: 0 0 0 2px var(--faint), 0 30px 80px rgba(0, 0, 0, 0.7); }
  .card img { width: 100%; height: 100%; display: block; }
  .card .dur { position: absolute; right: 14px; bottom: 14px; padding: 8px 12px; background: rgba(7, 10, 12, 0.86); font: 700 26px/1 var(--mono); color: var(--ink); letter-spacing: 0.06em; }
  h1 { position: absolute; left: 84px; right: 84px; top: 1046px; max-height: 330px; font: 800 78px/1.0 var(--display); text-transform: uppercase; letter-spacing: -0.005em; text-shadow: 0 4px 40px rgba(7, 10, 12, 0.9); }
  h1 s { text-decoration: none; color: var(--signal); }
  .lbl { position: absolute; left: 0; right: 0; top: 1418px; text-align: center; font: 700 26px/1 var(--mono); color: var(--veille); }
  .slot { position: absolute; left: 190px; right: 190px; top: 1452px; height: 118px; }
  .slot i { position: absolute; width: 34px; height: 34px; border: 0 solid var(--veille); }
  .slot i:nth-child(1) { left: 0; top: 0; border-left-width: 4px; border-top-width: 4px; } .slot i:nth-child(2) { right: 0; top: 0; border-right-width: 4px; border-top-width: 4px; }
  .slot i:nth-child(3) { left: 0; bottom: 0; border-left-width: 4px; border-bottom-width: 4px; } .slot i:nth-child(4) { right: 0; bottom: 0; border-right-width: 4px; border-bottom-width: 4px; }
  .handle { position: absolute; left: 0; right: 0; top: 1598px; text-align: center; font: 700 26px/1 var(--mono); letter-spacing: 0.1em; color: var(--dim); }
`;

/** Une story du pont, 1080 × 1920 : la miniature du long en carte, son titre au-dessus, la case de l'autocollant dessous. */
const pontStory = ({ thumb, hud, live, kicker, head, label, handle, dur }) => `<!doctype html><meta charset="utf-8"><style>${BASE}${STORY_CSS}</style><div class="page">
  <img class="blur" src="${thumb}"><div class="shade"></div>
  <div class="hud mono"><span><i class="dot${live ? "" : " signal"}"></i>${hud}</span><em><span class="eye">${EYE}</span>Système Décodé</em></div>
  <div class="rule"></div>
  <div class="kicker mono">${kicker}</div>
  <div class="card"><img src="${thumb}">${dur ? `<span class="dur">${dur}</span>` : ""}</div>
  <h1>${head}</h1>
  <div class="lbl mono">${label}</div>
  <div class="slot"><i></i><i></i><i></i><i></i></div>
  <div class="handle mono">${handle}</div>
</div>`;

/** La couverture du « À la une » : Instagram n'en montre que le cercle central. */
const highlightCover = () => `<!doctype html><meta charset="utf-8"><style>${BASE}
  .page { width: 1080px; height: 1920px; background: radial-gradient(circle at 50% 50%, #0f1518 0, var(--bg) 520px); }
  .ring { position: absolute; left: 190px; top: 610px; width: 700px; height: 700px; border-radius: 50%; border: 6px solid rgba(92, 255, 176, 0.5); }
  .eye { position: absolute; left: 330px; top: 740px; width: 420px; height: 312px; }
  .eye svg { overflow: visible; }
  .w { position: absolute; left: 0; right: 0; top: 1090px; text-align: center; font: 800 92px/1 var(--display); text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink); }
</style><div class="page"><div class="ring"></div><div class="eye">${EYE}</div><div class="w">Films</div></div>`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const readJson = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null);
const kitFonts = () =>
  [["Barlow Condensed", "barlow-condensed", [500, 600, 700, 800]], ["JetBrains Mono", "jetbrains-mono", [400, 500, 700]]]
    .flatMap(([family, file, weights]) => weights.map((w) => `@font-face { font-family: "${family}"; font-weight: ${w}; src: url("${pathToFileURL(path.join(ROOT, "kit", "fonts", `${file}-latin-${w}-normal.woff2`)).href}") format("woff2"); }`))
    .join("\n");

/** La durée du long, lue sur ses sous-titres (renders/<dossier>.srt) : { s, min, clock } ou null. */
function longDuration(base) {
  const srt = path.join(ROOT, "renders", `${base}.srt`);
  if (!fs.existsSync(srt)) return null;
  const all = [...fs.readFileSync(srt, "utf8").matchAll(/--> (\d+):(\d+):(\d+)[,.](\d+)/g)];
  if (!all.length) return null;
  const [, h, m, s] = all.at(-1).map(Number);
  const t = h * 3600 + m * 60 + s;
  return { s: t, min: Math.round(t / 60), clock: `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}` };
}

/** L'adresse du film sur YouTube : --video, sinon le flux public de la chaîne (même titre), sinon la chaîne. */
async function longUrl(profile, titles, video) {
  if (video) return { url: /^https?:/.test(video) ? video : `https://youtu.be/${video}`, from: "--video" };
  const channel = profile.comptes.youtube.url;
  try {
    const get = async (u) => {
      const r = await fetch(u, { headers: { "user-agent": "Mozilla/5.0", "accept-language": "fr-FR,fr;q=0.9" }, signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error(String(r.status));
      return r.text();
    };
    const id = /"externalId":"(UC[\w-]{22})"/.exec(await get(channel))?.[1];
    if (!id) throw new Error("chaîne sans identifiant");
    const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
    const wanted = titles.map(norm).filter(Boolean).map((w) => new Set(w.split(" ")));
    const entity = (s) => s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
    // le titre en ligne a pu être retouché dans Studio : on retient le film dont les mots sont, à 80 % au moins, ceux d'un de nos titres
    const close = (t) => wanted.some((w) => t.length && t.filter((x) => w.has(x)).length / Math.max(t.length, w.size) >= 0.8);
    for (const [, e] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const t = norm(entity(/<title>([^<]*)<\/title>/.exec(e)?.[1] ?? "")).split(" ").filter(Boolean);
      if (close(t)) return { url: `https://youtu.be/${/<yt:videoId>([^<]+)</.exec(e)[1]}`, from: "flux public de la chaîne", title: entity(/<title>([^<]*)<\/title>/.exec(e)?.[1] ?? "") || null };
    }
    return { url: channel, from: "⚠ film introuvable dans le flux public (15 dernières vidéos) : remplace par son adresse, ou --video <id>" };
  } catch (err) {
    return { url: channel, from: `⚠ chaîne illisible (${err.message}) : remplace par l'adresse du film, ou --video <id>` };
  }
}

/** Les courts qu'un long prolonge : la table du bureau (front/bureau.js → RELATED) et post.youtube.related des dossiers. */
function relatedShorts(longId) {
  const found = new Map();
  const src = fs.readFileSync(path.join(ROOT, "front", "bureau.js"), "utf8");
  const block = /const RELATED = (\{[\s\S]*?\n {2}\});/.exec(src)?.[1];
  const table = block ? new Function(`return ${block}`)() : {};
  for (const [num, [id, why]] of Object.entries(table)) if (id === longId) found.set(num, why);
  const dirs = fs.readdirSync(path.join(ROOT, "episodes"));
  for (const name of dirs) {
    const ep = readJson(path.join(ROOT, "episodes", name, "episode.json"));
    if (ep?.post?.youtube?.related === longId) found.set(name.split("-")[0], ep.post.youtube.relatedWhy ?? "");
  }
  return [...found].map(([num, why]) => ({ num, why, dir: dirs.find((n) => n.startsWith(`${num}-`)) })).filter((r) => r.dir);
}

/** La légende Instagram d'un court, avec la phrase d'appel posée juste avant la question de fin (qui reste la dernière). */
export function captionWithBridge(caption, line) {
  const parts = String(caption).split("\n\n");
  if (parts.length < 2) return `${caption}\n\n${line}`;
  return [...parts.slice(0, -1), line, parts.at(-1)].join("\n\n");
}

/** `id` : le long (L06, C01…). `out` : où écrire (renders/pont-<dossier>/ par défaut). `textes` : sans les visuels. */
export async function pont(id, { out, video, heure = "18 h", textes = false } = {}) {
  const dir = resolveEpisode(id);
  const base = path.basename(dir);
  const longId = base.split("-")[0];
  const ep = readJson(path.join(dir, "episode.json"));
  const yt = ep.post?.youtube ?? {};
  const profile = readJson(path.join(ROOT, "brand", "profil.json"));
  const published = readJson(path.join(ROOT, "metrics", "publication.json"))?.dossiers ?? {};
  out = out ?? path.join(ROOT, "renders", `pont-${base}`);
  fs.mkdirSync(out, { recursive: true });

  const where = await longUrl(profile, [yt.title, ...(yt.titleAlts ?? [])], video);
  const title = where.title ?? yt.title ?? ep.title; // le titre en ligne, s'il a été retouché dans Studio, c'est celui que le spectateur verra
  const dur = longDuration(base);
  const min = dur ? `${dur.min} min` : "le film complet";
  const question = /Et toi\s*:\s*([^\n]+\?)/.exec(yt.descriptionTemplate ?? yt.description ?? "")?.[1] ?? null;
  const search = `Système Décodé ${yt.keyword ?? ep.title}`;
  const online = published[base]?.youtube;

  // la promo verticale, s'il y en a une (HSnn pour Lnn)
  const hsDir = /^L\d+$/.test(longId) ? fs.readdirSync(path.join(ROOT, "episodes")).find((n) => n.startsWith(`HS${longId.slice(1)}-`)) : null;
  const hs = hsDir ? readJson(path.join(ROOT, "episodes", hsDir, "episode.json")) : null;
  const shorts = relatedShorts(longId);
  const bridge = `Pour aller plus loin : « ${title} ». Le film complet (${min}) est sur notre chaîne YouTube, lien en bio.`;
  const sticker = `LE FILM · ${min.toUpperCase()}`;

  const md = [];
  md.push(`# Pont Instagram → YouTube · ${base}`, "");
  md.push(`Écrit par \`npm run pont -- ${longId}\` le ${new Date().toISOString().slice(0, 10)}. Recette : docs/recette-pont-instagram-youtube.md. Rien n'est posté : tout se copie depuis le téléphone.`, "");
  md.push(`- **Film** : ${title} · ${dur ? `${dur.clock} (${min})` : `durée inconnue (pas de renders/${base}.srt)`}`);
  md.push(`- **Adresse** : ${where.url} (${where.from})`);
  md.push(`- **Sur YouTube** : ${online ? `oui (${online === true ? "date inconnue" : online})` : "⚠ pas encore coché au bureau : aucune story de lien avant que le film soit public"}`);
  md.push(`- **Recherche de secours** (épinglés) : « ${search} »`, "");

  md.push("## 1 · Liens du profil (à J0, dès que le film est public)", "");
  md.push("Modifier le profil → Liens. Le premier lien est le seul qu'Instagram affiche en clair sous la bio : c'est toujours le dernier long.", "");
  md.push("| Ordre | Titre du lien | Adresse |", "| --- | --- | --- |");
  md.push(`| 1 | Nouveau film : ${ep.title} (${min}) | ${where.url} |`);
  md.push(`| 2 | Tous nos films sur YouTube | ${profile.comptes.youtube.url} |`);
  md.push(`| 3 | TikTok | ${profile.comptes.tiktok.url} |`, "");

  md.push("## 2 · Les stories", "");
  md.push("| Quand | Visuel | Autocollant | Texte de l'autocollant | À la une « Films » |", "| --- | --- | --- | --- | --- |");
  md.push(`| J-1, 21 h (après le court du soir) | story-annonce.png | Compte à rebours, réglé sur J0 ${heure} | Sortie du film | non |`);
  md.push(`| J0, ${heure} 05 (film public, liens posés) | story-lien.png | Lien → ${where.url} | ${sticker} | **oui** (elle remplace celle de ce film s'il y en avait une) |`);
  md.push(`| J0, 21 h 30 (après le court) | story-sondage.png | Sondage, les deux camps de la question | — | non |`);
  md.push(`| J0, juste après le sondage | story-lien.png, reposée | Lien → ${where.url} | ${sticker} | non |`);
  md.push(`| J+2, 20 h 30 | story-rappel.png | Lien → ${where.url} | ${sticker} | non |`);
  md.push(`| Ensuite, au catalogue (lundi et vendredi 21 h, chaque film à son tour) | story-rappel.png | Lien → ${where.url} | ${sticker} | non |`, "");
  if (question) md.push(`Question du sondage : « ${question} »`, "");

  md.push("## 3 · Le Reel", "");
  if (hs) {
    const ig = hs.post?.instagram;
    const isOn = published[hsDir]?.instagram;
    md.push(`La promo **${hsDir}** ${isOn ? `est déjà sur Instagram (${isOn === true ? "date inconnue" : isOn}) : on n'y touche que pour l'épinglé.` : "sort sur Instagram **J0 vers 19 h 30**, une fois le film public et les liens posés (docs/recette-promo.md, « L'ordre de sortie »)."}`, "");
    if (ig && !isOn) md.push("Légende :", "", "```", `${ig.caption}\n\n${(ig.hashtags ?? []).join(" ")}`, "```", "");
  } else {
    md.push(`Pas de promo HS pour ${longId} : on n'en fabrique pas une pour le pont. Le relais vertical, ce sont les courts liés (§ 4).`, "");
  }
  md.push("Commentaire épinglé (sur le Reel de la promo et sur chaque court lié ; une adresse n'y est pas cliquable, d'où la recherche) :", "", "```", `Le film complet (${min}) est sur notre chaîne YouTube : lien en bio, ou cherche « ${search} ».`, "```", "");

  md.push("## 4 · Les courts liés : la phrase d'appel dans leur légende", "");
  if (!shorts.length) md.push(`Aucun court ne prolonge ${longId} (table RELATED de front/bureau.js, ou post.youtube.related) : rien à modifier.`, "");
  for (const s of shorts) {
    const c = readJson(path.join(ROOT, "episodes", s.dir, "episode.json"));
    const ig = c?.post?.instagram;
    const isOn = published[s.dir]?.instagram;
    md.push(`### ${s.dir} · ${isOn ? "déjà en ligne : … → Modifier la légende, puis épingler le commentaire du § 3" : "pas encore sur Instagram : légende à poster telle quelle"}`, "");
    if (s.why) md.push(`Pourquoi ce lien : ${s.why}`, "");
    if (ig?.caption) md.push("```", `${captionWithBridge(ig.caption, bridge)}\n\n${(ig.hashtags ?? []).join(" ")}`, "```", "");
    else md.push(`Pas de post.instagram dans ce dossier : ajoute, juste avant la question de fin, « ${bridge} »`, "");
  }

  md.push("## 5 · Ce qu'on relève (metrics/pont.json)", "");
  md.push("- **J+1 et J+7, Instagram** : chaque story → Statistiques → clics sur le lien (et vues) ; profil → tableau de bord professionnel → appuis sur les liens externes.");
  md.push("- **J+7, YouTube Studio** : ce film → Statistiques → Portée → Sources de trafic → Externe → la ligne Instagram (vues, durée de visionnage), et la part « Accès direct ou inconnu ».");
  md.push("- **Chaque jour, tout seul** : les abonnés YouTube dans metrics/comptes.json (le bureau les lit).", "");

  const mdFile = path.join(out, `pont-${base}.md`);
  fs.writeFileSync(mdFile, md.join("\n"));
  const shown = (f) => (path.relative(ROOT, f).startsWith("..") ? f : path.relative(ROOT, f));
  console.log(`  → ${shown(mdFile)}`);
  console.log(`  film : ${where.url} (${where.from}) · ${dur ? dur.clock : "durée ?"} · promo : ${hsDir ?? "aucune"} · courts liés : ${shorts.map((s) => s.num).join(", ") || "aucun"}`);
  if (!online) console.log(`  ⚠ ${base} n'est pas coché sur YouTube au bureau : rien ne se poste avant que le film soit public`);
  if (textes) return;

  // les visuels : la miniature du long, posée en carte
  const thumbFile = path.join(ROOT, "renders", `${base}-miniature.png`);
  if (!fs.existsSync(thumbFile)) {
    console.log(`  ⚠ pas de renders/${base}-miniature.png : npm run cover -- ${longId}, puis relance (les textes sont écrits)`);
    return;
  }
  const thumb = pathToFileURL(thumbFile).href;
  const handle = "Système Décodé · notre chaîne YouTube";
  const head = esc(title);
  const ask = question ? esc(question.charAt(0).toUpperCase() + question.slice(1)) : head;
  const sheets = [
    { file: "story-annonce.png", html: pontStory({ thumb, hud: `Demain · ${heure}`, live: false, kicker: `Nouveau film · ${min}`, head, label: "Touche pour le rappel", handle, dur: dur?.clock }) },
    { file: "story-lien.png", html: pontStory({ thumb, hud: "En ligne · maintenant", live: true, kicker: `Le film complet · ${min}`, head, label: "Le lien est juste là", handle, dur: dur?.clock }) },
    { file: "story-sondage.png", html: pontStory({ thumb, hud: `Le film complet · ${min}`, live: true, kicker: "Et toi ?", head: ask, label: "Vote, puis regarde le film", handle, dur: dur?.clock }) },
    { file: "story-rappel.png", html: pontStory({ thumb, hud: "Tu l'as raté ?", live: true, kicker: `Le film complet · ${min}`, head, label: "Le lien est juste là", handle, dur: dur?.clock }) },
    { file: "couverture-a-la-une.png", html: highlightCover() },
  ];
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "sd-pont-"));
  const browser = await launchChrome(PAGE);
  try {
    for (const s of sheets) {
      const htmlFile = path.join(folder, `${s.file}.html`);
      fs.writeFileSync(htmlFile, `<style>${kitFonts()}</style>` + s.html);
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
      await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      // un titre trop long pour sa place se resserre plutôt que de déborder sur la case de l'autocollant
      await page.evaluate(() => {
        const h = document.querySelector("h1");
        let size = 78;
        while (h && h.scrollHeight > 330 && size > 48) h.style.fontSize = `${(size -= 4)}px`;
      });
      const target = path.join(out, s.file);
      await page.screenshot({ path: target, type: "png" });
      console.log(`  → ${shown(target)}`);
      await page.close();
    }
  } finally {
    await browser.close();
    fs.rmSync(folder, { recursive: true, force: true });
  }
}
