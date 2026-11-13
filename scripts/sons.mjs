// THE SOUND BANK (2026-11-12): the recorded sounds every film shares, listed in kit/sons/banque.json and made once with
// ElevenLabs' sound effects. Like the voice, nothing is spent without a ceiling: without --budget the command lists what
// is missing and what it would cost, and stops. The real cost of each sound is read on the balance before and after it.
//   npm run sons                         ce qui manque, et le devis
//   npm run sons -- --budget 2200        fabrique ce qui manque, jamais au-delà de 2 200 crédits facturés
//   npm run sons -- --only verrou,pyro --force --budget 60     refait ces sons-là
// Each sound: the raw MP3 kept in .cache/sons/, the WAV in kit/sons/<id>.wav — 44.1 kHz stereo, silence trimmed at both
// ends (not the loops), one-shots brought to a -1 dBTP peak, loops to -20 LUFS (never above -1 dBTP). Its card (length,
// level, cost, date) goes to kit/sons/banque-fiches.json.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, elevenKey } from "./lib/env.mjs";
import { tool, loudness } from "./lib/ffmpeg.mjs";
import { credits } from "./credits.mjs";

const BANK = path.join(ROOT, "kit", "sons", "banque.json");
const CARDS = path.join(ROOT, "kit", "sons", "banque-fiches.json");
const RAW = path.join(ROOT, ".cache", "sons");
const MODEL = "eleven_text_to_sound_v2";

const wavOf = (id) => path.join(ROOT, "kit", "sons", `${id}.wav`);
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : d);
const ff = (args) => spawnSync(tool("ffmpeg"), ["-hide_banner", "-nostats", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

/** MP3 → the bank's WAV: trimmed, levelled. Returns its card. */
function finish(raw, out, loop) {
  const tmp = out.replace(/\.wav$/, ".tmp.wav");
  // a one-shot loses the silence the model often leaves at its start (≈ 1 s) and at its end; a loop keeps all of itself
  const trim = "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.005,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.05,areverse";
  let r = ff(["-i", raw, "-vn", "-ac", "2", "-ar", "44100", ...(loop ? [] : ["-af", trim]), "-c:a", "pcm_s16le", tmp]);
  if (r.status !== 0) throw new Error(`sons: ffmpeg n'a pas lu ${raw}\n${r.stderr.slice(-400)}`);
  const m = loudness(tmp);
  if (!m || !Number.isFinite(m.tp)) throw new Error(`sons: niveau illisible pour ${tmp} (son vide ?)`);
  const gain = loop ? Math.min(-20 - m.i, -1 - m.tp) : -1 - m.tp;
  r = ff(["-i", tmp, "-af", `volume=${gain.toFixed(2)}dB`, "-c:a", "pcm_s16le", out]);
  fs.rmSync(tmp, { force: true });
  if (r.status !== 0) throw new Error(`sons: ffmpeg n'a pas écrit ${out}\n${r.stderr.slice(-400)}`);
  const after = loudness(out);
  const dur = fs.statSync(out).size / (44100 * 4);
  return { duree: Number(dur.toFixed(2)), lufs: after?.i, crete: after?.tp };
}

async function generate(s) {
  const url = `https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128`;
  // 12/11: a 429 (« too many requests ») after ≈ 30 sounds in a row — wait and try again, a refused request is not billed
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": elevenKey(), "content-type": "application/json" },
      body: JSON.stringify({ text: s.prompt, duration_seconds: s.duree, prompt_influence: s.influence ?? 0.5, loop: Boolean(s.boucle), model_id: MODEL }),
    });
    if (res.status === 429 && attempt < 5) {
      const wait = 15 * 2 ** attempt;
      console.log(`  … limite de fréquence ElevenLabs : nouvel essai dans ${wait} s`);
      await new Promise((r) => setTimeout(r, wait * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`ElevenLabs ${res.status} sur « ${s.id} » : ${(await res.text()).slice(0, 300)}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

/* ------------------------------------------------------------------ a film's own sounds (12/11)
   Merwan : « si on met un ding sur un coup de pistolet, ça marche pas ». Every film lists in episode.json → `sons`
   the real objects and gestures its picture shows, each with its own sound: { id, image, duree, prompt, famille?,
   boucle? } to make, or { id, image, reprend: "<id de la banque>" } when the bank already has the right one.
   What is made joins the bank (banque.json, "sujet": "<ep>"): the next film that shows the same thing reuses it. */

/** Seconds kept in reserve in every film's quote: what the sound editor finds missing once the picture exists. */
export const RESERVE_SECONDES = 9;

const bankRate = (bank) => bank.tarif.creditsParSeconde;

/** A film's sounds: those to make (not on disk, not taken from the bank), their quote, and the reserve. */
export function devisSons(ep, bank = readJson(BANK, null)) {
  const list = ep.sons ?? [];
  const rate = bankRate(bank);
  const reused = list.filter((s) => s.reprend || fs.existsSync(wavOf(s.id)));
  const todo = list.filter((s) => !s.reprend && !fs.existsSync(wavOf(s.id)));
  const est = (s) => Math.ceil(s.duree * rate);
  return {
    listed: list.length,
    reused,
    todo,
    credits: todo.reduce((n, s) => n + est(s), 0),
    reserve: Math.ceil(RESERVE_SECONDES * rate),
    rate,
    est,
  };
}

/** One line for the film's quote (npm run salle, npm run voice). */
export function ligneSons(ep) {
  const bank = readJson(BANK, null);
  if (!bank) return "sons : banque introuvable (kit/sons/banque.json)";
  const d = devisSons(ep, bank);
  if (!d.listed) return "sons : ✗ aucune liste `sons` dans episode.json — les objets que l'image montre, chacun avec son vrai bruit (recette-son § 2)";
  return `sons : ${d.listed} sons du sujet, ${d.reused.length} déjà dans la banque · à fabriquer : ${d.todo.length} ≈ ${d.credits.toLocaleString("fr-FR")} crédits + réserve ${d.reserve} (seulement si le monteur son en a besoin)`;
}

/** Make `todo` (bank entries), never past `budget` credits really billed; `onMade(s)` after each one. */
async function fabriquer(todo, budget, est, onMade = () => {}) {
  if (!tool("ffmpeg")) throw new Error("sons: ffmpeg introuvable");
  fs.mkdirSync(RAW, { recursive: true });
  const cards = readJson(CARDS, {});
  // The balance lags the requests (12/11: four sounds showed up at once, 104 billed for 105 announced): costs are
  // compared run against run — all that the balance has lost since the start, against all that was announced.
  // …and a run started right after another would count the end of that one: wait until the balance stops moving
  let start = (await credits()).left;
  for (let k = 0; k < 6; k++) {
    await new Promise((r) => setTimeout(r, 20000));
    const again = (await credits()).left;
    if (again === start) break;
    start = again;
  }
  let left = start;
  let announced = 0;
  const spent = () => Math.max(start - left, announced);
  console.log(`  solde : ${start.toLocaleString("fr-FR")} crédits · plafond : ${budget}\n`);
  for (const s of todo) {
    if (spent() + est(s) > budget) {
      console.log(`  ⚠ arrêt : « ${s.id} » (${est(s)} cr) dépasserait le plafond (${spent()} déjà comptés)`);
      break;
    }
    const raw = path.join(RAW, `${s.id}.mp3`);
    fs.writeFileSync(raw, await generate(s));
    announced += est(s);
    left = (await credits()).left;
    const card = finish(raw, wavOf(s.id), s.boucle);
    cards[s.id] = { ...card, annonce: est(s), fait: new Date().toISOString().slice(0, 16), prompt: s.prompt };
    fs.writeFileSync(CARDS, JSON.stringify(cards, null, 2) + "\n");
    onMade(s);
    console.log(`  ✓ ${s.id.padEnd(24)} ${card.duree.toFixed(2).padStart(5)} s · ${String(est(s)).padStart(4)} cr annoncés · ${card.lufs?.toFixed(1)} LUFS · crête ${card.crete?.toFixed(1)} · solde −${start - left}`);
    if (start - left > announced * 1.15 + 15) {
      console.log(`  ✗ ${start - left} facturés pour ${announced} annoncés : arrêt, le tarif a changé — relire le devis avant de reprendre`);
      break;
    }
  }
  left = (await credits()).left;
  console.log(`\n  annoncé : ${announced.toLocaleString("fr-FR")} · facturé (au solde) : ${(start - left).toLocaleString("fr-FR")} crédits · solde : ${left.toLocaleString("fr-FR")} · fiches : ${path.relative(ROOT, CARDS)}\n`);
}

const NEED = ["id", "image", "duree", "prompt"];

/** `npm run sons [-- <ep>] [--budget N] [--only a,b] [--force]` */
export async function sons({ dir = null, budget = 0, only = null, force = false } = {}) {
  const bank = readJson(BANK, null);
  if (!bank) throw new Error(`sons: ${BANK} introuvable`);
  const rate = bankRate(bank);
  const est = (s) => Math.ceil(s.duree * rate);
  const ids = only ? String(only).split(",").map((x) => x.trim()) : null;
  let pool;
  let ep = null;
  if (dir) {
    ep = JSON.parse(fs.readFileSync(path.join(dir, "episode.json"), "utf8"));
    const list = ep.sons ?? [];
    for (const s of list) {
      if (s.reprend) {
        if (!fs.existsSync(wavOf(s.reprend))) throw new Error(`sons: « ${s.id ?? s.reprend} » reprend « ${s.reprend} », absent de la banque`);
        continue;
      }
      const miss = NEED.filter((k) => s[k] == null);
      if (miss.length) throw new Error(`sons: un son de ${path.basename(dir)} n'a pas ${miss.join(", ")} (${JSON.stringify(s).slice(0, 120)})`);
      const clash = bank.sons.find((b) => b.id === s.id && b.sujet !== String(ep.id));
      if (clash) throw new Error(`sons: « ${s.id} » existe déjà dans la banque (${clash.famille}) — le reprendre ("reprend") ou changer d'id`);
    }
    pool = list.filter((s) => !s.reprend);
    const d = devisSons(ep, bank);
    console.log(`\n  ${path.basename(dir)} : ${list.length} sons du sujet, ${d.reused.length} déjà dans la banque`);
    for (const s of list) {
      const have = s.reprend || fs.existsSync(wavOf(s.id));
      const cost = s.reprend ? `← ${s.reprend}` : `${String(s.duree).padStart(4)} s ${String(est(s)).padStart(4)} cr`;
      console.log(`    ${have ? "♻" : "+"} ${(s.id ?? s.reprend).padEnd(26)} ${cost}  ${s.image ?? ""}`);
    }
    console.log(`  réserve du film : ${d.reserve} crédits (${RESERVE_SECONDES} s), seulement si le monteur son en a besoin`);
  } else {
    pool = bank.sons;
    console.log(`\n  banque : ${bank.sons.length} sons, ${bank.sons.filter((s) => fs.existsSync(wavOf(s.id))).length} faits`);
  }
  for (const id of ids ?? []) if (!pool.some((s) => s.id === id)) throw new Error(`sons: « ${id} » n'est pas dans la liste`);
  const todo = pool.filter((s) => (!ids || ids.includes(s.id)) && (force || !fs.existsSync(wavOf(s.id))));
  const total = todo.reduce((n, s) => n + est(s), 0);
  console.log(`  à fabriquer : ${todo.length} (${todo.reduce((n, s) => n + s.duree, 0).toFixed(1)} s) · devis ${total.toLocaleString("fr-FR")} crédits (${rate} crédits par seconde, tarif lu le ${bank.tarif.lu})`);
  if (!todo.length) return console.log("");
  if (!budget) {
    if (!dir) for (const s of todo) console.log(`    ${s.id.padEnd(24)} ${String(s.duree).padStart(4)} s  ${String(est(s)).padStart(4)} cr  ${s.famille}`);
    console.log(`\n  Rien n'est fabriqué sans --budget <crédits> (un plafond sur ce qui est réellement facturé).\n`);
    return;
  }
  // a film's new sound joins the bank as soon as it is made: the next film that shows the same thing reuses it
  const join = (s) => {
    if (!dir) return;
    const b = readJson(BANK, null);
    if (b.sons.some((x) => x.id === s.id)) return;
    const { image, reserve, ...entry } = s;
    b.sons.push({ ...entry, famille: s.famille ?? "sujet", sujet: String(ep.id), image });
    fs.writeFileSync(BANK, JSON.stringify(b, null, 2) + "\n");
  };
  await fabriquer(todo, budget, est, join);
}

