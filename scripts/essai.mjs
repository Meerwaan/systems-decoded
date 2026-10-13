// The voice test bench: one short passage of a film, played under several directions (and settings),
// each measured against the narrator of that film. This is where a tag or a setting nobody has tried
// on this voice is heard and measured, for the price of a few phrases, before a whole session relies on it.
//
// Credits are someone's money: nothing is recorded without a budget on the command line.
import fs from "node:fs";
import path from "node:path";
import { elevenKey } from "./lib/env.mjs";
import { loadEpisode, alignTokens, hashOf, beatHash } from "./lib/episode.mjs";
import { decodeAudio, trackPitch, prosodyReport } from "./lib/audio.mjs";
import { masterVoice, excerpt, tool } from "./lib/ffmpeg.mjs";
import { voice, choose, direction, tagSpans } from "./voice.mjs";
import { creditRate, spendGuard } from "./credits.mjs";

const API = "https://api.elevenlabs.io/v1";
const LOUD = 4.2; // dB over the narrator's usual level: past this, Merwan hears shouting

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : 0;
};
const signed = (x, d = 1) => `${x >= 0 ? "+" : ""}${x.toFixed(d)}`;
const letters = (beat) => beat.tokens.reduce((n, t) => n + t.s.replace(/[^\p{L}\p{N}]/gu, "").length, 0);

/**
 * `file`: { phrases: ["zero", "reponse"], essais: [{ nom, note?, vo?: { phrase: "…" }, stability?, model? }] }
 * A phrase a trial does not redirect keeps the direction of the film. Same words, same order: only
 * the tags, the punctuation and the capitals may change (checked before anything is paid for).
 * `model`: the same passage on another ElevenLabs model, billed at that model's own rate.
 */
export async function essai(dir, { file, budget = 0 } = {}) {
  if (!file) throw new Error("npm run essai -- <ep> --file <essais.json> [--budget <crédits>]");
  const ep = loadEpisode(dir);
  const plan = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  const beats = plan.phrases.map((id) => {
    const beat = ep.beats.find((b) => b.id === id);
    if (!beat) throw new Error(`Phrase inconnue "${id}" (phrases : ${ep.beats.map((b) => b.id).join(", ")})`);
    return beat;
  });
  const out = path.join(dir, "audio", "essais");
  fs.mkdirSync(out, { recursive: true });

  const trials = plan.essais.map((t) => {
    const vo = Object.fromEntries(beats.map((b) => [b.id, (t.vo?.[b.id] ?? b.vo).trim()]));
    const text = beats.map((b) => vo[b.id]).join("\n\n");
    const settings = { stability: t.stability ?? ep.voice.stability, similarity_boost: ep.voice.similarity, speed: ep.voice.speed };
    // the script's own check, run on the text itself: a word changed by mistake is caught here, for free
    try {
      const chars = [...text];
      alignTokens(ep, { characters: chars, character_start_times_seconds: chars.map((_, i) => i), character_end_times_seconds: chars.map((_, i) => i + 1) }, beats);
    } catch (err) {
      throw new Error(`Essai "${t.nom}" : les mots ne sont plus ceux du script (${err.message})`);
    }
    const model = t.model ?? ep.voice.model;
    const stamp = hashOf(JSON.stringify({ voice: ep.voice.voiceId, model, settings, text }));
    return { ...t, model, vo, text, settings, stamp, mp3: path.join(out, `${t.nom}.mp3`), meta: path.join(out, `${t.nom}.json`) };
  });
  const have = (t) => fs.existsSync(t.mp3) && fs.existsSync(t.meta) && JSON.parse(fs.readFileSync(t.meta, "utf8")).stamp === t.stamp;
  const todo = trials.filter((t) => !have(t));
  const rates = {}; // today's rate of each model on trial, asked of ElevenLabs
  for (const t of todo) rates[t.model] ??= await creditRate(t.model);
  const guard = spendGuard(budget, 1);
  const estimate = todo.reduce((n, t) => n + guard.estimate(t.text.length, rates[t.model]), 0);

  console.log(`\nBanc d'essai voix · ${path.basename(dir)} · ${plan.phrases.join(" + ")} · ${trials.length} essais`);
  if (todo.length && budget < estimate) {
    console.log(`\n  À enregistrer : ${todo.length} essai${todo.length > 1 ? "s" : ""} (${todo.map((t) => t.nom).join(", ")}) ≈ ${estimate} crédits ElevenLabs.`);
    console.log(`  Rien n'a été enregistré. Avec l'accord de Merwan : ajoute --budget ${Math.ceil(estimate / 50) * 50}  (solde : npm run credits)\n`);
    for (const t of trials) console.log(`  ${t.nom.padEnd(14)} stabilité ${t.settings.stability}${t.model === ep.voice.model ? "" : ` · ${t.model}`}  ${t.note ?? ""}\n${t.text.split("\n\n").map((l) => `      ${l}`).join("\n")}`);
    console.log();
    return { estimate, spent: 0 };
  }
  // the narrator of this film: his median pitch, his usual level and pace — what a trial is heard against.
  // Read before anything is paid for: a film whose voice cannot be measured stops the bench for free.
  const film = await voice(dir, { quiet: true });
  const whole = film.recs.filter((r) => r.good.size >= 6);
  const hz = median((whole.length ? whole : film.recs).map((r) => r.qa.medianHz));
  const now = Object.fromEntries(beats.map((b) => [b.id, film.grid[b.id][film.comp[b.id]]]));

  let spent = 0;
  let halted = null;
  for (const t of todo) {
    // the budget is a ceiling on what is billed: checked before every request, and against every bill
    if (!guard.before(t.text.length, rates[t.model])) {
      halted = `le budget (${budget}) ne couvre plus la suite`;
      break;
    }
    process.stdout.write(`  ${t.nom} … `);
    const res = await fetch(`${API}/text-to-speech/${ep.voice.voiceId}/with-timestamps?output_format=${ep.voice.format ?? "mp3_44100_128"}`, {
      method: "POST",
      headers: { "xi-api-key": elevenKey(), "content-type": "application/json" },
      body: JSON.stringify({ text: t.text, model_id: t.model, seed: ep.voice.seed ?? 21, voice_settings: t.settings }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 400)}`);
    const cost = Number(res.headers.get("character-cost") ?? 0);
    const json = await res.json();
    fs.writeFileSync(t.mp3, Buffer.from(json.audio_base64, "base64"));
    fs.writeFileSync(t.meta, JSON.stringify({ stamp: t.stamp, cost, model: t.model, vo: t.vo, settings: t.settings, words: alignTokens(ep, json.alignment, beats), tags: tagSpans(json.alignment) }));
    spent += cost;
    console.log(`${cost} crédits`);
    if (!guard.after(cost, t.text.length, rates[t.model])) {
      halted = `facturé ${cost} crédits pour ${guard.estimate(t.text.length, rates[t.model])} annoncés`;
      break;
    }
  }
  if (todo.length) console.log(`  ${spent} crédits dépensés`);
  if (halted) console.log(`  ⚠ Enregistrement arrêté : ${halted}. Rien d'autre n'a été dépensé ; à voir avec Merwan avant de relancer.`);
  trials.splice(0, trials.length, ...trials.filter(have)); // only what is on disk is measured

  console.log("\n  essai          phrase        intention      registre   niveau    débit   variation   à vérifier à l'oreille");
  const line = (name, id, mood, m, flags = []) =>
    console.log(`  ${name.padEnd(14)} ${id.padEnd(13)} ${mood.slice(0, 13).padEnd(13)} ${signed(m.register).padStart(6)} dt ${signed(m.level).padStart(5)} dB ${signed(m.rate, 0).padStart(5)} %  ${m.spread.toFixed(2).padStart(6)} dt   ${flags.join(", ")}`);
  for (const b of beats) line("dans le film", b.id, now[b.id].mood, { ...now[b.id], rate: 100 * (now[b.id].rate / film.shared.rate - 1) }, now[b.id].flags);
  const results = [];
  for (const t of trials) {
    const meta = JSON.parse(fs.readFileSync(t.meta, "utf8"));
    const audio = await decodeAudio(t.mp3);
    const report = prosodyReport(
      trackPitch(audio),
      beats.map((b) => ({ id: b.id, start: meta.words[b.id][0].s, end: meta.words[b.id].at(-1).e, letters: letters(b) })),
    );
    const shift = 12 * Math.log2(report.medianHz / hz); // from this recording's own median to the film's
    const rows = report.segments.map((s) => {
      const m = { register: s.register + shift, level: s.db - film.shared.db, rate: 100 * (s.rate / film.shared.rate - 1), spread: s.spread, pause: s.pause };
      const flags = [m.level > LOUD && "crié", m.spread < 1.6 && "plate", m.register < -5 && "très grave"].filter(Boolean);
      line(t.nom, s.id, direction({ vo: t.vo[s.id] }).tags[0] ?? "neutre", m, flags); // the tag itself: it is what is on trial
      return { id: s.id, ...m, flags };
    });
    // what Merwan listens to: the trial through the film's own mastering, at the level it would have in the film
    let listen = null;
    if (tool("ffmpeg")) {
      const wav = path.join(out, `${t.nom}.wav`);
      if (masterVoice(t.mp3, wav, film.gains)) {
        listen = path.join(out, `${path.basename(dir).slice(0, 3)}-essai-${t.nom}.mp3`);
        excerpt(wav, 0, audio.duration, listen);
        fs.rmSync(wav, { force: true });
      }
    }
    results.push({ nom: t.nom, note: t.note, stability: t.settings.stability, model: t.model, rows, listen });
  }
  fs.writeFileSync(path.join(out, "mesures.json"), JSON.stringify({ phrases: plan.phrases, film: now, essais: results }, null, 1));
  console.log(`\n  À écouter : ${path.relative(process.cwd(), out)}${path.sep}<ep>-essai-<nom>.mp3 (au niveau du film). Les mesures trient ; l'oreille tranche.\n`);
  return { estimate, spent, results };
}

/**
 * A trial chosen by ear enters the film, for free — it is already recorded. Its direction becomes the
 * script's (the former one stays as an alternative: the takes on disk remain good for the phrase), its
 * recording a retake of the film, and the choice is written where the booth writes its own (audio/picks.json).
 * The film is not rendered again: `npm run render` afterwards.
 */
export async function garder(dir, { file, nom } = {}) {
  if (!file || !nom) throw new Error("npm run essai -- <ep> --file <essais.json> --garder <essai>");
  const plan = JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
  if (!plan.essais.some((t) => t.nom === nom)) throw new Error(`Essai inconnu "${nom}" (essais : ${plan.essais.map((t) => t.nom).join(", ")})`);
  const src = path.join(dir, "audio", "essais", `${nom}.mp3`);
  const metaFile = path.join(dir, "audio", "essais", `${nom}.json`);
  if (!fs.existsSync(src) || !fs.existsSync(metaFile)) throw new Error(`L'essai "${nom}" n'est pas enregistré.`);
  const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
  const v = loadEpisode(dir).voice;
  // a recording stands for the film's voice only if it was made with the film's model and settings
  if ((meta.model ?? v.model) !== v.model) throw new Error(`L'essai "${nom}" a été enregistré sur un autre modèle que celui du film (${meta.model} contre ${v.model}) : il ne peut pas y entrer tel quel.`);
  if (meta.settings.stability !== v.stability || meta.settings.similarity_boost !== v.similarity || meta.settings.speed !== v.speed) {
    throw new Error(`L'essai "${nom}" a été enregistré avec d'autres réglages que ceux du film (stabilité ${meta.settings.stability} contre ${v.stability}) : il ne peut pas y entrer tel quel.`);
  }

  // 1. the script: the chosen direction first, the former one kept as an alternative
  const scriptFile = path.join(dir, "episode.json");
  const script = JSON.parse(fs.readFileSync(scriptFile, "utf8"));
  for (const id of plan.phrases) {
    const beat = script.beats.find((b) => b.id === id);
    const next = meta.vo[id].trim();
    if ((beat.vo ?? "").trim() === next) continue;
    beat.voAlt = [beat.vo, ...(beat.voAlt ?? []).filter((x) => x.trim() !== next)];
    beat.vo = next;
  }
  fs.writeFileSync(scriptFile, `${JSON.stringify(script, null, 2)}\n`);
  const ep = loadEpisode(dir);

  // 2. the recording, as a retake of those phrases (once: keeping the same trial twice changes nothing)
  const root = path.join(dir, "audio", "takes", "reprises");
  fs.mkdirSync(root, { recursive: true });
  const first = plan.phrases[0];
  const metas = fs.readdirSync(root).filter((n) => n.startsWith(`${first}-`) && n.endsWith(".json"));
  let base = metas.find((n) => JSON.parse(fs.readFileSync(path.join(root, n), "utf8")).essai?.stamp === meta.stamp)?.slice(0, -5);
  if (!base) {
    base = `${first}-${Math.max(0, ...metas.map((n) => Number(/-(\d+)\.json$/.exec(n)?.[1] ?? 0))) + 1}`;
    fs.copyFileSync(src, path.join(root, `${base}.mp3`));
    fs.writeFileSync(
      path.join(root, `${base}.json`),
      JSON.stringify({
        seed: ep.voice.seed ?? 21,
        cost: meta.cost,
        target: plan.phrases,
        order: plan.phrases,
        hashes: Object.fromEntries(plan.phrases.map((id) => [id, beatHash(ep, ep.beats.find((b) => b.id === id), meta.vo[id].trim())])),
        vo: meta.vo,
        words: meta.words,
        tags: meta.tags ?? [],
        essai: { nom, stamp: meta.stamp },
      }),
    );
  }

  // 3. the choice — the comp must have met the recording before it can be picked
  const rec = base.replace(/-(\d+)$/, "~$1");
  await voice(dir, { quiet: true });
  const note = `Essai « ${nom} » retenu à l'oreille par Merwan (${new Date().toISOString().slice(0, 10)}).`;
  const { vo } = await choose(dir, { picks: Object.fromEntries(plan.phrases.map((id) => [id, rec])), notes: Object.fromEntries(plan.phrases.map((id) => [id, note])) });
  console.log(`\n  « ${nom} » est dans le film : ${plan.phrases.join(" + ")} → ${rec} · voix montée ${vo.duration?.toFixed(1)} s`);
  console.log(`  Courbe de tension : ${vo.arc.verdict}${vo.arc.why.length ? ` — ${vo.arc.why.join(" ; ")}` : ""}`);
  for (const a of vo.arc.acts) console.log(`  ${a.label.padEnd(14)} ${signed(a.register).padStart(6)} dt  ${signed(a.level).padStart(5)} dB  ${signed(a.rate, 0).padStart(4)} %`);
  console.log("  Le film n'est pas refait : npm run render ensuite.\n");
  return { rec, vo };
}
