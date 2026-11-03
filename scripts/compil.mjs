// A compilation for YouTube (16:9, 9 to 15 min): our rendered shorts, each cut right after what it owed (its
// answer and its comment question; no like, no subscribe, no next file, no loop), joined by a NEW voice — an
// opening, a bridge before each file, an ending — so the film tells something none of the shorts tells alone
// (docs/recette-compil.md). Nothing is modelled again: the picture of a short sits in the middle of the frame, on a
// blurred copy of itself, between two panels that say where we are in the file.
//   npm run compil -- C01            → renders/C01-<slug>.mp4 + renders/C01-<slug>-chapitres.txt
//   npm run compil -- C01 --draft    → .cache/compil/C01/draft.mp4 (fast encode; silent bridges until the voice exists)
//   --out <file>                      anywhere else
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/env.mjs";
import { loadEpisode, resolveEpisode, schedule, resolveRef } from "./lib/episode.mjs";
import { tool } from "./lib/ffmpeg.mjs";
import { launchChrome } from "./lib/chrome.mjs";
import { mixVoice } from "./voice.mjs";
import { sfx } from "./sfx.mjs";

const W = 1920;
const H = 1080;
const FPS = 30;
const SLOT_W = 608; // a 9:16 picture at full height
const SLOT_X = (W - SLOT_W) / 2;
const DIP = 0.22; // the dip to dark between two pieces, in and out
const round = (x) => Math.round(x * 1000) / 1000;
const clock = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

/** What a rendered short says about itself: its picture, its title lines, and the instants of its phrases as rendered. */
function shortOf(ref) {
  const dir = resolveEpisode(ref);
  const name = path.basename(dir);
  const ep = loadEpisode(dir);
  const film = path.join(ROOT, "renders", `${name}.mp4`);
  if (!fs.existsSync(film)) throw new Error(`${ref} : pas de rendu (${path.relative(ROOT, film)})`);
  // the instants the film was rendered with (gen/), or else what the voice says now
  let beats = null;
  const gen = path.join(dir, "gen", "episode.data.js");
  if (fs.existsSync(gen)) {
    const data = JSON.parse(fs.readFileSync(gen, "utf8").replace(/^window\.__EPISODE = /, "").replace(/;\s*$/, ""));
    if (!data.estimated) beats = data.beats;
  }
  if (!beats) {
    const s = schedule(ep);
    if (!s.estimated) beats = s.beats;
  }
  const duration = probeDuration(film);
  const cover = path.join(ROOT, "renders", `${name}-couverture.png`);
  return { ref, dir, name, ep, film, beats, duration, cover: fs.existsSync(cover) ? cover : null, num: String(ep.id).padStart(3, "0"), lines: ep.cover?.title ?? [ep.title] };
}

/** The pieces of a short that stay: up to its answer and comment question (the order of the end changed at 018). */
function keepOf(short, wanted) {
  const at = (ref) => {
    if (typeof ref === "number" || /^-?\d*\.?\d+$/.test(String(ref))) return Number(ref);
    if (!short.beats) throw new Error(`${short.ref} : pas d'instants fiables pour « ${ref} » — donne des secondes dans "keep"`);
    return resolveRef({ beats: short.beats }, ref);
  };
  let ranges = wanted;
  if (!ranges) {
    if (!short.beats) throw new Error(`${short.ref} : pas d'instants fiables — donne "keep": [[début, fin], …] en secondes`);
    const ids = short.beats.map((b) => b.id);
    const like = ids.indexOf("like");
    const comment = ids.indexOf("comment");
    if (comment < 0 || like < 0) throw new Error(`${short.ref} : ni "like" ni "comment" — donne "keep" à la main`);
    // since 018: chute → comment → like … ; before: chute → (fin) → like → abo → comment → boucle
    ranges = comment < like ? [[0, "comment$+1.2"]] : [[0, `${ids[like - 1]}$+1.0`], ["comment-0.25", "comment$+1.2"]];
  }
  return ranges.map(([a, b]) => {
    const s = Math.max(0, at(a));
    const e = Math.min(short.duration - 0.05, at(b));
    if (!(e > s + 1)) throw new Error(`${short.ref} : morceau [${a}, ${b}] vide`);
    return [round(s), round(e)];
  });
}

function probeDuration(file) {
  const r = spawnSync(tool("ffprobe"), ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return Number(r.stdout.trim());
}

function ffmpeg(args, what, level = "error") {
  const r = spawnSync(tool("ffmpeg"), ["-hide_banner", "-loglevel", level, "-y", ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg a échoué (${what}) :\n${(r.stderr || "").slice(-2000)}`);
  return r;
}

/* ---------------------------------------------------------------- the panels (HTML → transparent PNG) */

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function panelHtml(ep, shorts, state) {
  const font = (file) => pathToFileURL(path.join(ROOT, "kit", "fonts", file)).href;
  const list = shorts
    .map((s, i) => {
      const cls = state.index == null ? "" : i === state.index ? "on" : i < state.index ? "past" : "";
      return `<li class="${cls}"><span class="n">${esc(s.num)}</span><span class="t">${esc(s.label)}</span></li>`;
    })
    .join("");
  const cur = state.index != null ? shorts[state.index] : null;
  const right =
    state.kind === "fin"
      ? ""
      : cur
        ? `<div class="file">Dossier ${esc(cur.num)} <b>· ${state.index + 1}/${shorts.length}</b></div>
           <h2>${cur.lines.map(esc).join("<br>")}</h2>
           ${cur.moment ? `<div class="moment">${esc(cur.moment)}</div>` : ""}`
        : `<div class="file">${esc(ep.compil?.kicker ?? `${shorts.length} dossiers`)}</div>
           <h2>${(ep.compil?.lines ?? [ep.title]).map(esc).join("<br>")}</h2>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:B;font-weight:600;src:url(${font("barlow-condensed-latin-600-normal.woff2")})}
@font-face{font-family:B;font-weight:800;src:url(${font("barlow-condensed-latin-800-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${font("jetbrains-mono-latin-500-normal.woff2")})}
@font-face{font-family:M;font-weight:700;src:url(${font("jetbrains-mono-latin-700-normal.woff2")})}
:root{--bg:#070a0c;--ink:#e9e4d8;--dim:rgba(233,228,216,.62);--faint:rgba(233,228,216,.24);--veille:#5cffb0;--signal:#ff5b2e}
html,body{margin:0;width:${W}px;height:${H}px;background:transparent;overflow:hidden}
.side{position:absolute;top:0;bottom:0;width:${SLOT_X}px;box-sizing:border-box;padding:84px 64px;color:var(--ink)}
.l{left:0;background:linear-gradient(90deg,rgba(7,10,12,.9),rgba(7,10,12,.72) 80%,rgba(7,10,12,.5))}
.r{right:0;background:linear-gradient(270deg,rgba(7,10,12,.9),rgba(7,10,12,.72) 80%,rgba(7,10,12,.5));display:flex;flex-direction:column;justify-content:center}
.slot{position:absolute;top:0;bottom:0;left:${SLOT_X}px;width:${SLOT_W}px;box-shadow:0 0 0 2px var(--faint),0 0 80px 10px rgba(0,0,0,.65)}
.brand{font:500 22px/1 M;letter-spacing:.16em;text-transform:uppercase;color:var(--dim);display:flex;align-items:center;gap:14px}
.brand i{width:12px;height:12px;border-radius:50%;background:var(--veille);box-shadow:0 0 16px var(--veille)}
h1{font:800 84px/.92 B;text-transform:uppercase;margin:44px 0 10px;letter-spacing:.01em}
.sub{font:500 22px/1.3 M;color:var(--dim);letter-spacing:.06em;text-transform:uppercase}
ul{list-style:none;margin:56px 0 0;padding:0;border-top:2px solid var(--faint)}
li{display:flex;gap:22px;align-items:baseline;padding:17px 0;border-bottom:1px solid rgba(233,228,216,.1);font:500 25px/1 M;color:var(--faint);text-transform:uppercase;letter-spacing:.06em}
li .n{width:62px}
li.past{color:var(--dim)}
li.on{color:var(--veille)}
li.on .t{font-weight:700}
.file{font:500 24px/1 M;letter-spacing:.16em;text-transform:uppercase;color:var(--signal)}
.file b{color:var(--dim);font-weight:500}
h2{font:800 104px/.9 B;text-transform:uppercase;margin:26px 0 0;letter-spacing:.01em}
.moment{margin-top:34px;align-self:flex-start;font:700 22px/1 M;letter-spacing:.14em;text-transform:uppercase;color:var(--bg);background:var(--veille);padding:12px 16px}
.foot{position:absolute;left:64px;right:64px;bottom:70px;font:500 18px/1.4 M;letter-spacing:.08em;color:var(--faint);text-transform:uppercase}
</style></head><body>
${
  // the end: the six covers on the left half, the right half left free for YouTube's end screen
  state.kind === "fin"
    ? `<div class="brand" style="position:absolute;left:64px;top:44px"><i></i>Système Décodé · ${esc((ep.compil?.lines ?? [ep.title]).join(" "))}</div>`
    : `<div class="side l"><div class="brand"><i></i>Système Décodé</div>
<h1>${(ep.compil?.lines ?? [ep.title]).map(esc).join("<br>")}</h1><div class="sub">${esc(ep.compil?.kicker ?? "")}</div>
<ul>${list}</ul></div>
<div class="slot"></div><div class="side r">${right}<div class="foot">Reconstitutions 3D · sources dans la description</div></div>`
}
<script>
// a long word (« prétensionneur ») shrinks its title until it fits its column
for (const el of document.querySelectorAll("h1,h2")) {
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > el.clientWidth + 1 && size > 40) el.style.fontSize = (size -= 2) + "px";
}
</script>
</body></html>`;
}

async function renderPanels(ep, shorts, states, work) {
  const browser = await launchChrome();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    for (const st of states) {
      const html = path.join(work, `${st.key}.html`);
      fs.writeFileSync(html, panelHtml(ep, shorts, st));
      await page.goto(pathToFileURL(html).href, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(work, `${st.key}.png`), omitBackground: true });
    }
  } finally {
    await browser.close();
  }
}

/* ---------------------------------------------------------------- the pieces */

// the backdrop: the same picture, blurred and darkened, filling the frame (it moves with the film)
const BACK = `scale=480:-2,gblur=sigma=12,scale=${W}:${Math.round((W * 16) / 9)},crop=${W}:${H}:0:(ih-${H})/2,colorchannelmixer=rr=.42:gg=.42:bb=.42`;
const dips = (d) => `fade=t=in:st=0:d=${DIP},fade=t=out:st=${round(d - DIP)}:d=${DIP}`;
const adips = (d) => `afade=t=in:st=0:d=0.06,afade=t=out:st=${round(d - 0.18)}:d=0.18`;
const AFMT = "aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo";

function encodeArgs(draft) {
  return [
    "-c:v", "libx264", "-preset", draft ? "veryfast" : "slow", "-crf", draft ? "26" : "18", "-pix_fmt", "yuv420p", "-r", String(FPS),
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
  ];
}

/** The narration under a piece: the slice [from, from + d] of the mastered voice-and-music track, or silence. */
function narrationInput(mix, from, d) {
  return mix ? ["-ss", String(from), "-t", String(d), "-i", mix] : ["-f", "lavfi", "-t", String(d), "-i", "anullsrc=r=48000:cl=stereo"];
}

function pieceShort(p, out, draft) {
  const d = round(p.to - p.from);
  ffmpeg([
    "-ss", String(p.from), "-t", String(d), "-i", p.short.film,
    "-i", p.panel,
    "-filter_complex",
    `[0:v]fps=${FPS},split=2[a][b];[a]${BACK}[bg];[b]scale=${SLOT_W}:${H}[fg];[bg][fg]overlay=${SLOT_X}:0[m];[m][1:v]overlay=0:0,${dips(d)},format=yuv420p[v];[0:a]${AFMT},${adips(d)}[o]`,
    "-map", "[v]", "-map", "[o]", "-t", String(d), ...encodeArgs(draft), out,
  ], `${p.short.ref} ${p.from}–${p.to}`);
}

function pieceStill(p, out, draft, mix) {
  const d = p.d;
  const frames = Math.round(d * FPS);
  // a slow push on the file's grid cover, from 1.00 to 1.05
  const zoom = `zoompan=z='1+0.05*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${SLOT_W}x${H}:fps=${FPS}`;
  ffmpeg([
    "-loop", "1", "-framerate", String(FPS), "-t", String(d), "-i", p.image,
    "-i", p.panel,
    ...narrationInput(mix, p.from, d),
    "-filter_complex",
    `[0:v]split=2[a][b];[a]${BACK}[bg];[b]scale=${SLOT_W * 2}:${H * 2},${zoom}[fg];[bg][fg]overlay=${SLOT_X}:0[m];[m][1:v]overlay=0:0,${dips(d)},format=yuv420p[v];[2:a]${AFMT},${adips(d)}[o]`,
    "-map", "[v]", "-map", "[o]", "-t", String(d), ...encodeArgs(draft), out,
  ], `pont ${p.key}`);
}

function pieceMontage(p, out, draft, mix) {
  const d = p.d;
  const n = p.clips.length;
  const each = round(d / n);
  const inputs = p.clips.flatMap((c) => ["-ss", String(c.at), "-t", String(each + 0.1), "-i", c.film]);
  const chain = p.clips.map((_, i) => `[${i}:v]fps=${FPS},trim=duration=${each},setpts=PTS-STARTPTS,scale=1080:1920,setsar=1[c${i}]`).join(";");
  const cat = `${p.clips.map((_, i) => `[c${i}]`).join("")}concat=n=${n}:v=1:a=0[mont]`;
  ffmpeg([
    ...inputs,
    "-i", p.panel,
    ...narrationInput(mix, p.from, d),
    "-filter_complex",
    `${chain};${cat};[mont]split=2[a][b];[a]${BACK}[bg];[b]scale=${SLOT_W}:${H}[fg];[bg][fg]overlay=${SLOT_X}:0[m];[m][${n}:v]overlay=0:0,${dips(d)},format=yuv420p[v];[${n + 1}:a]${AFMT},${adips(d)}[o]`,
    "-map", "[v]", "-map", "[o]", "-t", String(d), ...encodeArgs(draft), out,
  ], "ouverture");
}

function pieceMosaic(p, out, draft, mix, shorts) {
  const d = p.d;
  const covers = shorts.filter((s) => s.cover);
  const n = covers.length;
  const cols = n <= 3 ? n : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  // the left half only: the right half stays free for YouTube's end screen
  const cellH = Math.floor((H - 120 - (rows - 1) * 24) / rows);
  const cellW = Math.round((cellH * 9) / 16);
  const gridW = cols * cellW + (cols - 1) * 24;
  const x0 = Math.round((W / 2 - gridW) / 2);
  const y0 = Math.round((H - (rows * cellH + (rows - 1) * 24)) / 2);
  const inputs = covers.flatMap((s) => ["-loop", "1", "-framerate", String(FPS), "-t", String(d), "-i", s.cover]);
  let graph = `color=c=0x070a0c:s=${W}x${H}:r=${FPS}:d=${d}[base0]`;
  covers.forEach((_, i) => {
    const x = x0 + (i % cols) * (cellW + 24);
    const y = y0 + Math.floor(i / cols) * (cellH + 24);
    graph += `;[${i}:v]scale=${cellW}:${cellH}[k${i}];[base${i}][k${i}]overlay=${x}:${y}:shortest=1[base${i + 1}]`;
  });
  graph += `;[base${n}][${n}:v]overlay=0:0,${dips(d)},format=yuv420p[v];[${n + 1}:a]${AFMT},${adips(d)}[o]`;
  ffmpeg([...inputs, "-i", p.panel, ...narrationInput(mix, p.from, d), "-filter_complex", graph, "-map", "[v]", "-map", "[o]", "-t", String(d), ...encodeArgs(draft), out], "fin");
}

/* ---------------------------------------------------------------- the film */

export async function compil(dir, { draft = false, out = null } = {}) {
  if (!tool("ffmpeg") || !tool("ffprobe")) throw new Error("ffmpeg et ffprobe sont introuvables");
  const ep = loadEpisode(dir);
  if (!Array.isArray(ep.dossiers) || ep.dossiers.length < 2) throw new Error(`${ep.id} : "dossiers" manque (deux courts au moins)`);
  const name = path.basename(dir);
  const work = path.join(ROOT, ".cache", "compil", ep.id);
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });

  // 1. the shorts, and what stays of each
  const shorts = ep.dossiers.map((d) => {
    const s = shortOf(d.ep);
    return { ...s, keep: keepOf(s, d.keep), label: d.label ?? s.ep.title, moment: d.moment ?? null, chap: d.chap ?? null, lines: d.lines ?? s.lines, pont: d.pont ?? `pont-${s.ep.id}` };
  });

  // 2. the new voice and its music, mastered together at −14 LUFS (silence until the voice is recorded)
  const sched = schedule(ep);
  let mix = null;
  if (!sched.estimated) {
    const voice = mixVoice(dir, sched);
    sfx(dir, { ep, sched, quiet: true });
    const bed = path.join(dir, "audio", "bed.wav");
    if (voice) {
      mix = path.join(work, "narration.wav");
      const inputs = ["-i", path.join(dir, voice), ...(fs.existsSync(bed) ? ["-i", bed] : [])];
      const sum = fs.existsSync(bed) ? `[0:a][1:a]amix=inputs=2:normalize=0:weights='1 ${ep.bedVolume ?? 0.7}'` : "[0:a]anull";
      const m = ffmpeg([...inputs, "-filter_complex", `${sum},${AFMT},loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"], "mesure de la voix", "info"); // loudnorm prints its JSON at info level
      const j = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf("{")));
      ffmpeg([...inputs, "-filter_complex", `${sum},${AFMT},loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}:linear=true,${AFMT}`, mix], "voix masterisée");
    }
  } else if (!draft) throw new Error(`${ep.id} : la voix n'est pas enregistrée (npm run voice -- ${ep.id}) — un brouillon muet : --draft`);
  const beat = (id) => sched.beats.find((b) => b.id === id);
  const group = (test) => sched.beats.filter((b) => test(b.id));
  const windowOf = (beats, pad = 0.7) => ({ from: round(Math.max(0, beats[0].start - 0.15)), d: round(beats.at(-1).end - Math.max(0, beats[0].start - 0.15) + pad) });

  // 3. the plan of the film
  const states = [{ key: "panel-intro", kind: "intro", index: null }, ...shorts.map((_, i) => ({ key: `panel-${i}`, kind: "dossier", index: i })), { key: "panel-fin", kind: "fin", index: null }];
  const pieces = [];
  const intro = group((id) => id.startsWith("intro"));
  if (intro.length) {
    const w = windowOf(intro, 0.5);
    pieces.push({ kind: "montage", ...w, panel: path.join(work, "panel-intro.png"), clips: shorts.map((s) => ({ film: s.film, at: 0.05 })), chap: ep.compil?.chapIntro ?? ep.title });
  }
  shorts.forEach((s, i) => {
    const b = beat(s.pont);
    if (!b) throw new Error(`${ep.id} : pas de phrase "${s.pont}" (le pont avant le dossier ${s.ref})`);
    const w = windowOf([b], 0.5);
    pieces.push({ kind: "still", key: s.pont, ...w, image: s.cover ?? path.join(ROOT, "renders", `${s.name}-couverture.png`), panel: path.join(work, `panel-${i}.png`), chap: s.chap ?? `${s.label} · dossier ${s.num}` });
    for (const [from, to] of s.keep) pieces.push({ kind: "short", short: s, from, to, d: round(to - from), panel: path.join(work, `panel-${i}.png`) });
  });
  const fin = group((id) => id.startsWith("fin"));
  if (fin.length) pieces.push({ kind: "mosaic", ...windowOf(fin, 2.5), panel: path.join(work, "panel-fin.png"), chap: ep.compil?.chapFin ?? null });

  // 4. the panels, then each piece, then the film
  await renderPanels(ep, shorts, states, work);
  const files = [];
  pieces.forEach((p, i) => {
    const f = path.join(work, `piece-${String(i).padStart(2, "0")}.mp4`);
    process.stdout.write(`  ${String(i + 1).padStart(2)}/${pieces.length} ${p.kind.padEnd(8)} ${p.d.toFixed(1).padStart(6)} s\r`);
    if (p.kind === "short") pieceShort(p, f, draft);
    else if (p.kind === "still") pieceStill(p, f, draft, mix);
    else if (p.kind === "montage") pieceMontage(p, f, draft, mix);
    else pieceMosaic(p, f, draft, mix, shorts);
    files.push(f);
  });
  const list = path.join(work, "pieces.txt");
  fs.writeFileSync(list, files.map((f) => `file '${f.replace(/\\/g, "/")}'`).join("\n"));
  const target = out ? path.resolve(out) : draft ? path.join(work, "draft.mp4") : path.join(ROOT, "renders", `${name}.mp4`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", target], "assemblage");

  // 5. the chapters of the description (YouTube: the first at 00:00, none shorter than 10 s)
  const chapters = [];
  let t = 0;
  for (const p of pieces) {
    if (p.chap && (!chapters.length || t - chapters.at(-1).t >= 10)) chapters.push({ t, title: p.chap });
    t += p.d;
  }
  if (chapters.length) chapters[0].t = 0;
  const chapFile = target.replace(/\.mp4$/i, "-chapitres.txt");
  fs.writeFileSync(chapFile, chapters.map((c) => `${clock(c.t)} ${c.title}`).join("\n") + "\n");

  const total = probeDuration(target);
  console.log(`\n  ${ep.id} · ${pieces.length} morceaux · ${clock(total)} (${Math.round(total)} s)${mix ? "" : " · ponts muets (pas encore de voix)"}`);
  console.log(`  film : ${path.relative(ROOT, target)}\n  chapitres : ${path.relative(ROOT, chapFile)}\n`);
  return { target, chapters, total };
}
