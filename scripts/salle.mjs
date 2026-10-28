// `npm run salle -- 031 032 …` — the writers' room: every script of a batch on one page, before the one message to Merwan
// (each hook, its numbers, the writing checks, and the voice quote exactly as `npm run voice` announces it).
// Nothing is recorded and nothing is written but the log: the quote is `planVoice` + `estimateVoice` (scripts/voice.mjs),
// whose only network call is `creditRate` — GET /v1/models, read-only, never billed. No TTS request can leave from here.
import fs from "node:fs";
import { resolveEpisode, loadEpisode, schedule } from "./lib/episode.mjs";
import { ecriture, mesures } from "./lib/ecriture.mjs";
import { planVoice, estimateVoice } from "./voice.mjs";
import { logFile, verbose } from "./lib/log.mjs";

const fr = (x, d = 0) => Number(x).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const SIGNATURE = /on l['’]ouvre/i;
// Without a voice the schedule's own estimate runs long (026: 123 s estimated, 91 s spoken). Measured on 026 to 030
// (eleven_v4_turbo, holds included): 0.335 to 0.359 s per word said, 0.343 on average.
const SEC_PER_WORD = 0.343;
// what the screen shows: [85|quatre-vingt-cinq] → 85, *signal* and +veille+ without their marks
const shownText = (text) => text.replace(/\[([^|\]]+)\|[^\]]*\]/g, "$1").replace(/[*+]/g, "").replace(/\s+/g, " ").trim();

async function dossier(arg) {
  const r = { arg, errors: [], warnings: [] };
  let dir;
  try {
    dir = resolveEpisode(arg);
  } catch (err) {
    r.errors.push(err.message);
    return r;
  }
  r.name = dir.split(/[\\/]/).pop();
  let ep, sched;
  try {
    ep = loadEpisode(dir);
    sched = schedule(ep);
  } catch (err) {
    r.errors.push(`script illisible : ${err.message}`);
    return r;
  }
  r.title = ep.title;
  r.estimated = sched.estimated;
  const m = mesures(ep);
  r.duration = sched.estimated ? m.total * SEC_PER_WORD : sched.duration;
  r.hook = m.hook.map((b) => shownText(b.text)).join(" ");
  r.words = { film: m.total, accroche: m.hookWords, scene: m.sceneWords };
  const choc = ep.cues?.choc;
  r.choc = choc ? { word: String(choc).split(":")[1]?.replace(/[#$+-].*$/, "") ?? "?", t: sched.cues?.choc } : null;
  try {
    r.warnings = ecriture(ep, sched) ?? [];
  } catch (err) {
    r.warnings = [`contrôles d'écriture indisponibles : ${err.message}`];
  }

  // the voice quote: what `npm run voice -- <ep>` would announce today, and what a first full take costs
  try {
    const planned = planVoice(dir);
    const q = await estimateVoice(planned);
    r.voice = { model: ep.voice?.model, what: q.what, estimate: q.estimate, rate: q.rate, chars: q.chars, requests: q.requests };
    const fresh = planVoice(dir, { fresh: true });
    if (!planned.plan.length) r.voice.fresh = (await estimateVoice(fresh)).estimate;
    // "Alors… on l'ouvre" never opens a request nor stands alone in one (voice.mjs makes it ride on the scene before it)
    for (const req of fresh.requests.flat()) {
      if (SIGNATURE.test(req.beats[0]?.text ?? "")) r.errors.push(`« Alors… on l'ouvre » ${req.beats.length === 1 ? "seul dans sa requête voix" : "ouvre une requête voix"} — il se dit dans la requête de la scène`);
    }
  } catch (err) {
    r.errors.push(`devis voix impossible : ${err.message}`);
  }
  return r;
}

function lines(r, detail) {
  const out = [];
  if (!r.title) {
    out.push(`  ${r.arg} · ✗ ${r.errors.join(" · ")}`);
    return out;
  }
  out.push(`  ${r.name} · ${r.title} · ${fr(r.duration, 1)} s (${r.estimated ? `estimé : ${r.words.film} mots × ${fr(SEC_PER_WORD, 3)} s` : "voix réelle"}) · ${r.errors.length} ✗ · ${r.warnings.length} ⚠`);
  out.push(`    « ${r.hook} »`);
  const choc = r.choc ? `mot-choc « ${r.choc.word} »${r.choc.t != null ? ` à ${fr(r.choc.t, 2)} s${r.estimated ? " (estimé)" : ""}` : ""}` : "pas de mot-choc déclaré";
  out.push(`    mots dits : film ${r.words.film} · accroche ${r.words.accroche} · scène ${r.words.scene ?? "—"} · ${choc}`);
  if (r.voice) {
    if (r.voice.estimate > 0) out.push(`    voix : À enregistrer : ${r.voice.what} ≈ ${fr(r.voice.estimate)} crédits ElevenLabs (avec l'accord de Merwan : --budget ${Math.ceil(r.voice.estimate / 50) * 50})`);
    else out.push(`    voix : rien à enregistrer (déjà sur le disque)${r.voice.fresh != null ? ` · une prise neuve coûterait ≈ ${fr(r.voice.fresh)} crédits` : ""}`);
  }
  for (const e of r.errors) out.push(`    ✗ ${e}`);
  if (detail) for (const w of r.warnings) out.push(`    ⚠ ${w}`);
  return out;
}

export async function salle(args) {
  if (!args.length) throw new Error("Précise les dossiers, ex: npm run salle -- 031 032 033");
  const rows = [];
  for (const arg of args) rows.push(await dossier(arg));
  const toPay = rows.filter((r) => r.voice?.estimate > 0);
  const total = toPay.reduce((n, r) => n + r.voice.estimate, 0);
  const rates = [...new Set(rows.filter((r) => r.voice).map((r) => `${r.voice.model} ${fr(r.voice.rate, 2)} crédit/caractère`))];
  const errors = rows.reduce((n, r) => n + r.errors.length, 0);
  const warnings = rows.reduce((n, r) => n + r.warnings.length, 0);

  const head = [`\n  Salle d'écriture · ${rows.length} dossier${rows.length > 1 ? "s" : ""} · tarif lu aujourd'hui : ${rates.join(", ") || "—"}\n`];
  const tail = [
    "",
    `  Total voix : ≈ ${fr(total)} crédits ElevenLabs à enregistrer (${toPay.length} dossier${toPay.length > 1 ? "s" : ""}${toPay.length ? ` : ${toPay.map((r) => r.name.slice(0, 3)).join(", ")}` : ""}) — rien n'a été enregistré`,
    `  Verdict : ${errors ? `✗ ${errors} erreur${errors > 1 ? "s" : ""} à corriger avant le devis` : "✓ prêt pour le message à Merwan"} · ${warnings} ⚠ d'écriture (docs/recette-script.md)`,
  ];
  const full = [...head, ...rows.flatMap((r) => [...lines(r, true), ""]), ...tail];
  // .cache/logs/salle-031-032-033.log — an argument may be a path: only its number goes in the name
  const tag = (a) => /^(\d{3}|L\d{2}|HS\d{2}|X\d{2})/.exec(a.split(/[\\/]/).filter(Boolean).pop() ?? "")?.[0] ?? "x";
  const log = logFile("salle", args.map(tag).join("-").slice(0, 80));
  fs.writeFileSync(log, full.join("\n") + "\n");
  if (verbose()) console.log(full.join("\n"));
  else console.log([...head, ...rows.flatMap((r) => lines(r, false)), ...tail, `  détail des ⚠ : ${log}  (ou --verbose)`, ""].join("\n"));
  return { rows, total, errors, warnings };
}
