#!/usr/bin/env node
// Système Décodé — one entry point for the whole episode pipeline.
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { resolveEpisode, loadEpisode, schedule } from "./lib/episode.mjs";
import { master } from "./lib/ffmpeg.mjs";
import { hyperframes } from "./lib/hf.mjs";
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

// Every working command leaves one line in metrics/commandes.jsonl (what ran, on which episode, how long):
// `npm run metrics` reads them back. Servers and one-line lookups are not timed.
const TIMED = new Set(["build", "voice", "sfx", "snap", "check", "lint", "render", "review", "look", "cover", "phone", "qa"]);
const metric = { t: new Date().toISOString(), cmd, ep: /^\d{3}/.test(args[0] ?? "") ? args[0].slice(0, 3) : undefined };
const started = Date.now();
if (flags.draft) metric.draft = true;
process.on("exit", (code) => {
  if (TIMED.has(cmd)) logCommand({ ...metric, ms: Date.now() - started, ok: code === 0 });
});

function hf(sub, dir, extra = []) {
  const status = hyperframes(sub, dir, extra);
  if (status) process.exit(status);
}

const HELP = `
  npm run new     -- <numéro> <slug> "<Titre>"   crée episodes/<numéro>-<slug> depuis le kit
  npm run build   -- <ep>                        données de timing + bundle + pistes audio
  npm run voice   -- <ep>                        séance de doublage : mesure les prises du disque, monte la meilleure par phrase
                     [--takes 3] [--retake phrase,…] [--count 3]   ce qu'il faudrait enregistrer : le coût est annoncé, rien n'est dépensé
                     [--budget 700]                                …sauf avec un budget en crédits (accord de Merwan d'abord)
                     [--pick phrase=enregistrement,…] [--solo enregistrement]
  npm run credits                                solde ElevenLabs (appel gratuit)
  npm run sfx     -- <ep>                        régénère l'habillage sonore (audio/bed.wav) — le build le fait seul quand le timing bouge
  npm run script  -- <ep>                        affiche le script, le minutage et les cues
  npm run snap    -- <ep> [--at 1,5,12] [--zoom sel]   images de contrôle (PNG)
  npm run review  -- <ep> [--from s --to s] [--every s]   planche-contact : une image par phrase et par repère (renders/<ep>-planche.jpg)
  npm run look    -- <ep> --at 0.04,beat:mot+0.2 | --file essais.json   images d'essai côte à côte, chacune avec sa pose de caméra si on veut (renders/<ep>-essais.jpg)
  npm run check   -- <ep>                        lint + audits HyperFrames
  npm run preview -- <ep>                        studio HyperFrames (lecture en direct)
  npm run render  -- <ep> [--draft]              MP4 final dans renders/
  npm run qa      -- <ep> [--file x.mp4]         contrôle le MP4 rendu : voix calée, niveau, images parasites, fluidité
  npm run cover   -- <ep>                        couverture de grille (PNG 1080×1920 dans renders/)
  npm run phone   -- <ep>                        copie du film sous 30 Mio (renders/<ep>-iphone.mp4) : ce que l'app Claude peut envoyer au téléphone hors du Wi-Fi
  npm run brand                                  exporte la photo de profil (brand/avatar.svg → .png)
  npm run chrono  -- <ep> <étape> | stop | agent <nom> --jetons N | jauge --session N --hebdo N   le chronomètre de la fabrication
  npm run metrics [-- <ep>]                      ce que coûte un dossier (temps, jetons, calcul) et ce qu'il rapporte (audience)
  npm run front   [-- --port 4173]               bureau de publication (vidéo, couverture, légende) et cabine d'écoute de la voix, à ouvrir sur l'iPhone (même Wi-Fi)
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
        budget: flags.budget != null ? Number(flags.budget) : 0,
        seed: flags.seed != null ? Number(flags.seed) : undefined,
        solo: flags.solo != null ? String(flags.solo) : undefined,
        pick,
      });
      await build(dir);
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
        console.log(`  ${b.start.toFixed(2).padStart(6)} → ${b.end.toFixed(2).padStart(6)}  ${b.id.padEnd(10)} ${b.words.map((w) => w.t).join(" ")}`);
      }
      console.log("\n  cues:");
      for (const [k, v] of Object.entries(s.cues)) console.log(`    ${v.toFixed(2).padStart(6)}  ${k}`);
      console.log("");
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
      hf("snapshot", dir, extra);
      break;
    }
    case "check":
    case "lint":
    case "preview": {
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      await build(dir, { quiet: true });
      hf(cmd, dir, cmd === "preview" ? ["--background"] : []);
      break;
    }
    case "render": {
      const { build } = await import("./build.mjs");
      const dir = resolveEpisode(args[0]);
      const { sched } = await build(dir);
      if (sched.estimated) console.log("  ⚠ timing estimé : pas de voix valide pour ce script (npm run voice -- <ep>)");
      fs.mkdirSync(path.join(ROOT, "renders"), { recursive: true });
      const out = path.join(ROOT, "renders", `${path.basename(dir)}${flags.draft ? "-draft" : ""}.mp4`);
      hf("render", dir, ["-o", out, "--fps", "30", "--quality", flags.draft ? "draft" : "high"]);
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
    case "cover": {
      const { cover } = await import("./cover.mjs");
      await cover(resolveEpisode(args[0]));
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
