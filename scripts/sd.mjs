#!/usr/bin/env node
// Système Décodé — one entry point for the whole episode pipeline.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { resolveEpisode, loadEpisode, schedule } from "./lib/episode.mjs";
import { master } from "./lib/ffmpeg.mjs";
import { hyperframes, hyperframesLogged } from "./lib/hf.mjs";
import { logFile, verbose } from "./lib/log.mjs";
import { checkSummary, renderSummary, snapSummary } from "./lib/hfreport.mjs";
import { logCommand } from "./metrics.mjs";

const [cmd, ...rest] = process.argv.slice(2);
const flags = {};
const args = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith("--")) {
    const key = rest[i].slice(2);
    const next = rest[i + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[key] = next;
      i++;
    } else flags[key] = true;
  } else args.push(rest[i]);
}
// --verbose: every command prints what it printed before the compact outputs (docs/outillage.md)
if (flags.verbose) process.env.SD_VERBOSE = "1";

// Every working command leaves one line in metrics/commandes.jsonl (what ran, on which episode, how long):
// `npm run metrics` reads them back. Servers and one-line lookups are not timed.
const TIMED = new Set(["build", "voice", "sfx", "snap", "check", "lint", "render", "review", "look", "cover", "phone", "qa"]);
const metric = { t: new Date().toISOString(), cmd, ep: /^(\d{3}|L\d{2}|HS\d{2})/.exec(args[0] ?? "")?.[0] };
const started = Date.now();
if (flags.draft) metric.draft = true;
process.on("exit", (code) => {
  if (TIMED.has(cmd)) logCommand({ ...metric, ms: Date.now() - started, ok: code === 0 });
});

function hf(sub, dir, extra = []) {
  const status = hyperframes(sub, dir, extra);
  if (status) process.exit(status);
}

/** HyperFrames with a compact report: `summarize` picks the lines, the whole output goes to .cache/logs/. */
function hfCompact(sub, dir, extra, name, summarize) {
  if (verbose()) return { status: hf(sub, dir, extra) ?? 0, lines: null };
  const log = logFile(dir, name);
  const { status, text } = hyperframesLogged(sub, dir, extra, log);
  const lines = summarize(text);
  console.log(lines.join("\n"));
  console.log(`  journal complet : ${log}`);
  if (status) process.exit(status);
  return { status, lines, log };
}

// A check reads the page and nothing else: when nothing the page loads has moved since the last check
// (index.html, gen/ — the bundle carries the kit and the episode's code —, the media it plays, HyperFrames'
// version, the flags), its verdict is that one. Asked again, it is given back at once; --force runs it anyway.
async function checkPrint(dir, extra, name) {
  const crypto = await import("node:crypto");
  const h = crypto.createHash("sha1");
  const html = fs.readFileSync(path.join(dir, "index.html"));
  h.update(html);
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else h.update(`${path.relative(dir, p)}\0`).update(fs.readFileSync(p));
    }
  };
  walk(path.join(dir, "gen"));
  for (const [, src] of String(html).matchAll(/\bsrc="([^"]+)"/g)) {
    const p = path.join(dir, src);
    // gen/ is read whole above (the build rewrites it each time: its dates move, its bytes do not); the media by size and date
    if (!/^gen\//.test(src) && fs.existsSync(p)) {
      const st = fs.statSync(p);
      h.update(`${src}\0${st.size}\0${st.mtimeMs}`);
    }
  }
  h.update(JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules", "hyperframes", "package.json"), "utf8")).version ?? "");
  h.update(JSON.stringify([name, extra]));
  const hash = h.digest("hex").slice(0, 12);
  const cacheFile = path.join(ROOT, ".cache", "check", `${path.basename(dir)}-${name}.json`);
  const before = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, "utf8")) : null;
  if (!flags.force && !verbose() && before?.hash === hash) {
    console.log(`  ${name} : rien n'a changé depuis le contrôle du ${before.at.slice(0, 16).replace("T", " ")} (empreinte ${hash}) — son résultat, repris tel quel (--force pour relancer) :`);
    console.log(before.lines.join("\n"));
    console.log(`  journal complet : ${before.log}`);
    if (before.status) process.exit(before.status);
    return;
  }
  const log = logFile(dir, name);
  const res = verbose() ? { status: hyperframes(name, dir, extra), text: null } : hyperframesLogged(name, dir, extra, log);
  if (res.text != null) {
    const lines = checkSummary(res.text);
    console.log(lines.join("\n"));
    console.log(`  journal complet : ${log}`);
    // only a check that passed is remembered: a failure may be the browser's, not the film's — it is run again
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    if (res.status === 0) fs.writeFileSync(cacheFile, JSON.stringify({ hash, at: new Date().toISOString(), status: 0, lines, log }, null, 1));
    else fs.rmSync(cacheFile, { force: true });
  }
  if (res.status) process.exit(res.status);
}

const HELP = `
  npm run new     -- <numéro> <slug> "<Titre>"   crée episodes/<numéro>-<slug> depuis le kit (L02… : un long, depuis kit/template-long)
  npm run build   -- <ep>                        données de timing + bundle + pistes audio
  npm run voice   -- <ep>                        séance de doublage : mesure les prises du disque, monte la meilleure par phrase
                     [--takes 3] [--retake phrase,…] [--count 3]   ce qu'il faudrait enregistrer : le coût est annoncé, rien n'est dépensé
                     [--isole]                                     …les phrases reprises seules, dans leur propre requête (un acte joué à part)
                     [--budget 700]                                …sauf avec un budget en crédits (accord de Merwan d'abord)
                     [--pick phrase=enregistrement,…] [--solo enregistrement]
  npm run credits                                solde ElevenLabs (appel gratuit)
  npm run essai   -- <ep> --file essais.json [--budget 300]   banc d'essai voix : un passage joué sous plusieurs directions, mesuré contre le narrateur du film
                     --ref <ep>                                   …un film sans voix encore : mesuré contre le narrateur d'un autre film
                     --garder <essai>                             …l'essai retenu à l'oreille entre dans le film : sa direction dans le script, son enregistrement en reprise (gratuit)
  npm run sfx     -- <ep>                        régénère l'habillage sonore (audio/bed.wav) — le build le fait seul quand le timing bouge
  npm run script  -- <ep>                        affiche le script, le minutage et les cues
  npm run salle   -- <ep> [<ep>…]                salle d'écriture : chaque accroche, ses mots, ses ⚠/✗ d'écriture et le devis voix (rien n'est enregistré)
  npm run snap    -- <ep> [--at 1,5,12] [--zoom sel]   images de contrôle (PNG)
  npm run review  -- <ep> [--from s --to s] [--every s]   planche-contact : une image par phrase et par repère (renders/<ep>-planche.jpg)
  npm run look    -- <ep> --at 0.04,beat:mot+0.2 | --file essais.json   images d'essai côte à côte, chacune avec sa pose de caméra si on veut (renders/<ep>-essais.jpg)
  npm run check   -- <ep> [--force]              lint + audits HyperFrames (rien de changé depuis le dernier : son résultat, tout de suite)
  npm run preview -- <ep>                        studio HyperFrames (lecture en direct)
  npm run render  -- <ep> [--draft] [--out f.mp4]   MP4 final dans renders/ (--out : ailleurs, pour un essai)
  npm run qa      -- <ep> [--file x.mp4]         contrôle le MP4 rendu : voix calée, niveau, images parasites, fluidité
  npm run srt     -- <ep>                        format long : sous-titres (renders/<ep>.srt) et chapitres horodatés de la description YouTube
  npm run cover   -- <ep> [--alt 2|3]   (un long : renders/<ep>-miniature[-2|-3].png, depuis thumb, thumb2, thumb3)
  npm run cover   -- <ep>                        couverture de grille (PNG 1080×1920 dans renders/)
  npm run phone   -- <ep>                        copie du film sous 30 Mio (renders/<ep>-iphone.mp4) : ce que l'app Claude peut envoyer au téléphone hors du Wi-Fi
  npm run brand                                  exporte la photo de profil (brand/avatar.svg → .png)
  npm run chrono  -- <ep> <étape> | stop | agent <nom> --jetons N | jauge --session N --hebdo N   le chronomètre de la fabrication
  npm run metrics [-- <ep>]                      ce que coûte un dossier (temps, jetons, calcul) et ce qu'il rapporte (audience)
  npm run social  [-- --out <dossier>] [--only facebook|stories|youtube]   deux stories Instagram, la bannière YouTube et l'image du post Facebook, dans renders/
  npm run front   [-- --port 4173]               bureau de publication (vidéo, couverture, légende) et cabine d'écoute de la voix, à ouvrir sur l'iPhone (même Wi-Fi)
  --verbose : la sortie complète d'autrefois (par défaut : un résumé, le détail dans .cache/logs/<ep>-<commande>.log)
  <ep> = numéro d'épisode (ex: 001)
`;

try {
  switch (cmd) {
    case "new": {
      const { newEpisode } = await import("./new.mjs");
      newEpisode(args[0], args[1], args.slice(2).join(" "));
      break;
    }
    case "build": {
      const { build } = await import("./build.mjs");
      await build(resolveEpisode(args[0]));
      break;
    }
    case "voice": {
      const { voice } = await import("./voice.mjs");
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      // --pick hook=1d35.23,like=like~2 : a phrase forced to a recording for this run (the booth saves them for good)
      const pick = {};
      for (const pair of flags.pick ? String(flags.pick).split(",") : []) {
        const [id, rec] = pair.split("=").map((s) => s.trim());
        if (!id || !rec) throw new Error(`--pick attend phrase=enregistrement (ex: --pick hook=1d35.23), reçu "${pair}"`);
        pick[id] = rec;
      }
      await voice(dir, {
        takes: flags.takes != null ? Number(flags.takes) : undefined,
        retake: flags.retake ? String(flags.retake).split(",").map((s) => s.trim()).filter(Boolean) : [],
        count: flags.count != null ? Number(flags.count) : undefined,
        alone: Boolean(flags.isole),
        budget: flags.budget != null ? Number(flags.budget) : 0,
        seed: flags.seed != null ? Number(flags.seed) : undefined,
        solo: flags.solo != null ? String(flags.solo) : undefined,
        pick,
      });
      await build(dir);
      break;
    }
    case "essai": {
      const { essai, garder } = await import("./essai.mjs");
      const dir = resolveEpisode(args[0]);
      if (flags.garder) {
        // --garder F-hache : the trial Merwan chose becomes a retake of the film (free: it is already recorded)
        const { build } = await import("./build.mjs");
        await garder(dir, { file: flags.file, nom: String(flags.garder) });
        await build(dir);
      } else await essai(dir, { file: flags.file, budget: flags.budget != null ? Number(flags.budget) : 0, ref: flags.ref ? resolveEpisode(String(flags.ref)) : null });
      break;
    }
    case "credits": {
      const { printCredits } = await import("./credits.mjs");
      await printCredits();
      break;
    }
    case "sfx": {
      const { sfx } = await import("./sfx.mjs");
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      sfx(dir, { force: true });
      await build(dir);
      break;
    }
    case "script": {
      const ep = loadEpisode(resolveEpisode(args[0]));
      const s = schedule(ep);
      const words = s.beats.reduce((n, b) => n + b.words.length, 0);
      console.log(`\n  ${ep.title} · ${s.duration}s · ${words} mots affichés · timing ${s.estimated ? "estimé" : "voix réelle"}\n`);
      for (const b of s.beats) {
        // a long: its chapter cards and its mid-roll ads, where they fall (a short has neither)
        if (b.chap) console.log(`  ── ${b.chap} ──`);
        console.log(`  ${b.start.toFixed(2).padStart(6)} → ${b.end.toFixed(2).padStart(6)}  ${b.id.padEnd(10)} ${b.words.map((w) => w.t).join(" ")}${b.midroll ? "   ⏸ pub" : ""}`);
      }
      console.log("\n  cues:");
      if (verbose()) for (const [k, v] of Object.entries(s.cues)) console.log(`    ${v.toFixed(2).padStart(6)}  ${k}`);
      else {
        // compact: "  0.26 boar · 1.38 swerve · …", lines of about 110 characters
        let line = "   ";
        for (const [k, v] of Object.entries(s.cues)) {
          const cell = ` ${v.toFixed(2)} ${k}`;
          if (line.length + cell.length > 110) {
            console.log(line);
            line = "   ";
          }
          line += line.length > 3 ? ` ·${cell}` : cell;
        }
        if (line.length > 3) console.log(line);
      }
      console.log("");
      // the writing checks (a short: docs/recette-script.md; a long: docs/recette-long.md, with its map of chapters,
      // mid-rolls and threads): warnings only, never in the way of the table above
      try {
        const { printEcriture } = await import("./lib/ecriture.mjs");
        printEcriture(ep, s);
      } catch (err) {
        console.log(`  (contrôles d'écriture indisponibles : ${err.message})\n`);
      }
      break;
    }
    case "salle": {
      // the writers' room: every script of a batch, its numbers, its checks and its voice quote — nothing recorded
      const { salle } = await import("./salle.mjs");
      const res = await salle(args);
      if (res.errors) process.exitCode = 1;
      break;
    }
    case "snap": {
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      await build(dir, { quiet: true });
      const extra = ["--describe", "false"];
      if (flags.at) extra.push("--at", String(flags.at), "--no-end");
      if (flags.frames) extra.push("--frames", String(flags.frames));
      if (flags.zoom) extra.push("--zoom", String(flags.zoom));
      if (flags.out) extra.push("-o", String(flags.out));
      hfCompact("snapshot", dir, extra, "snap", snapSummary);
      break;
    }
    case "check":
    case "lint":
    case "preview": {
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      await build(dir, { quiet: true });
      if (cmd === "preview") hf(cmd, dir, ["--background"]);
      else await checkPrint(dir, [], cmd);
      break;
    }
    case "render": {
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      const { sched } = await build(dir);
      if (sched.estimated) console.log("  ⚠ timing estimé : pas de voix valide pour ce script (npm run voice -- <ep>)");
      // --out: a trial render goes outside renders/ (Merwan sees renders/)
      const out = flags.out ? path.resolve(String(flags.out)) : path.join(ROOT, "renders", `${path.basename(dir)}${flags.draft ? "-draft" : ""}.mp4`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      hfCompact("render", dir, ["-o", out, "--fps", "30", "--quality", flags.draft ? "draft" : "high"], flags.draft ? "render-draft" : "render", renderSummary);
      master(out);
      console.log(`\n  → ${out}\n`);
      break;
    }
    case "review": {
      const { review } = await import("./review.mjs");
      await review(resolveEpisode(args[0]), {
        cols: flags.cols != null ? Number(flags.cols) : undefined,
        only: flags.from != null || flags.to != null ? [Number(flags.from ?? 0), Number(flags.to ?? 1e9)] : undefined,
        every: flags.every != null ? Number(flags.every) : undefined,
        out: flags.out ? path.resolve(String(flags.out)) : undefined, // a working sheet goes outside renders/
      });
      break;
    }
    case "look": {
      const { look } = await import("./look.mjs");
      if (flags.out) metric.out = path.basename(String(flags.out));
      const shots = flags.file ? JSON.parse(fs.readFileSync(path.resolve(String(flags.file)), "utf8")) : String(flags.at ?? "0.04").split(",").map((at) => ({ at: at.trim() }));
      metric.n = shots.length;
      await look(resolveEpisode(args[0]), {
        shots,
        cols: flags.cols != null ? Number(flags.cols) : undefined,
        width: flags.width != null ? Number(flags.width) : undefined,
        bare: !!flags.bare,
        cpu: !!flags.cpu,
        zones: !flags["no-zones"],
        out: flags.out ? path.resolve(String(flags.out)) : undefined,
      });
      break;
    }
    case "srt": {
      const { srt } = await import("./srt.mjs");
      srt(resolveEpisode(args[0]));
      break;
    }
    case "cover": {
      const { cover } = await import("./cover.mjs");
      await cover(resolveEpisode(args[0]), {
        alt: flags.alt === true ? 2 : Number(flags.alt ?? 0),
        out: flags.out ? path.resolve(String(flags.out)) : null, // a trial goes outside renders/: Merwan sees renders/
        gpu: !!flags.gpu,
      });
      break;
    }
    case "phone": {
      const { phone } = await import("./phone.mjs");
      phone(resolveEpisode(args[0]));
      break;
    }
    case "brand": {
      const { brand } = await import("./brand.mjs");
      await brand();
      break;
    }
    case "qa": {
      const { qa } = await import("./qa.mjs");
      await qa(resolveEpisode(args[0]), flags.file ? path.resolve(String(flags.file)) : undefined);
      break;
    }
    case "chrono": {
      const { chrono } = await import("./metrics.mjs");
      chrono(args[0], args[1], args[2], flags);
      break;
    }
    case "metrics": {
      const { report } = await import("./metrics.mjs");
      report(args[0]);
      break;
    }
    case "social": {
      const { social } = await import("./social.mjs");
      await social({ out: flags.out ? path.resolve(String(flags.out)) : undefined, only: flags.only ? String(flags.only) : undefined });
      break;
    }
    case "front": {
      const { front } = await import("./front.mjs");
      await front({ port: flags.port != null ? Number(flags.port) : undefined });
      break;
    }
    default:
      console.log(HELP);
  }
} catch (err) {
  console.error(`\n  ✗ ${err.message}\n`);
  process.exit(1);
}
