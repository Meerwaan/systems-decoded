// Système Décodé — what an episode costs to make, and what it earns once posted.
//
//   metrics/commandes.jsonl   written by sd.mjs: one line per command (what ran, on which episode, how long)
//   metrics/production.json   the stopwatch: the stages of each episode, its agents (tokens, minutes, images read),
//                             the plan gauges before and after — kept with `npm run chrono`
//   metrics/audience.json     what TikTok says of each posted film (Merwan's screenshots, typed in)
//
//   npm run chrono  -- 012 faits            a stage starts (the one before it ends)
//   npm run chrono  -- 012 stop             the running stage ends
//   npm run chrono  -- 012 agent acte1 --genre acte --modele opus --jetons 352000 --min 24 --outils 61 --images 28
//   npm run chrono  -- 012 jauge --session 12 --hebdo 37 --quoi début
//   npm run metrics [-- 012]                the report
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";

const DIR = path.join(ROOT, "metrics");
const FILES = { log: path.join(DIR, "commandes.jsonl"), prod: path.join(DIR, "production.json"), aud: path.join(DIR, "audience.json") };
const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback);
const writeJson = (file, data) => {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
};

/** Called by sd.mjs when a command ends. Never throws: a metric must not break a render. */
export function logCommand(entry) {
  try {
    fs.mkdirSync(DIR, { recursive: true });
    fs.appendFileSync(FILES.log, JSON.stringify(entry) + "\n");
  } catch {
    /* the log is a convenience */
  }
}

const min = (ms) => ms / 60000;
const dur = (m) => (m == null ? "—" : m >= 60 ? `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, "0")}` : m >= 1 ? `${Math.round(m)} min` : `${Math.round(m * 60)} s`);
const tok = (n) => (n == null ? "—" : n >= 1e6 ? `${(n / 1e6).toFixed(2).replace(".", ",")} M` : `${Math.round(n / 1000)} k`);
const pct = (x) => `${Math.round(100 * x)} %`;
const bar = (x, width = 24) => "█".repeat(Math.max(0, Math.min(width, Math.round(x * width))));
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);
const sum = (list, f) => list.reduce((n, x) => n + (f(x) || 0), 0);

/** "20:31" today, or a full ISO date; nothing: now. */
function when(at) {
  if (!at || at === true) return new Date();
  const hm = /^(\d{1,2})[:h](\d{2})$/.exec(String(at));
  if (hm) {
    const d = new Date();
    d.setHours(Number(hm[1]), Number(hm[2]), 0, 0);
    return d;
  }
  const d = new Date(String(at));
  if (Number.isNaN(d.getTime())) throw new Error(`--a attend HH:MM ou une date ISO, reçu "${at}"`);
  return d;
}

export function chrono(ep, what, name, flags) {
  if (!/^\d{3}$/.test(ep ?? "") || !what) throw new Error("Usage : npm run chrono -- 012 <étape> | stop | agent <nom> --jetons … | jauge --session … --hebdo …");
  const data = readJson(FILES.prod, { cibles: { minutes: 120, jetons: 1500000, imagesParAgent: 30 }, episodes: {} });
  const e = (data.episodes[ep] ??= {});
  e.etapes ??= [];
  e.agents ??= [];
  e.jauges ??= [];
  const t = when(flags.a).toISOString();
  const running = e.etapes.find((s) => !s.fin);

  if (what === "agent") {
    if (!name) throw new Error("npm run chrono -- 012 agent <nom> --genre faits|verif|decor|acte --jetons N [--min N --outils N --images N --modele sonnet]");
    const num = (k) => (flags[k] != null ? Number(flags[k]) : undefined);
    const row = { nom: name, genre: flags.genre, modele: flags.modele, jetons: num("jetons"), minutes: num("min"), outils: num("outils"), images: num("images"), note: flags.note };
    const i = e.agents.findIndex((a) => a.nom === name);
    if (i >= 0) e.agents[i] = { ...e.agents[i], ...Object.fromEntries(Object.entries(row).filter(([, v]) => v !== undefined)) };
    else e.agents.push({ ...row, genre: row.genre ?? "autre" });
    console.log(`\n  ${ep} · agent ${name} : ${tok(row.jetons)}${row.minutes ? ` · ${dur(row.minutes)}` : ""}\n`);
  } else if (what === "jauge") {
    e.jauges.push({ t, quoi: flags.quoi ?? "", session: Number(flags.session), hebdo: Number(flags.hebdo) });
    console.log(`\n  ${ep} · jauge : session ${flags.session} % · hebdo ${flags.hebdo} %\n`);
  } else if (what === "stop") {
    if (!running) throw new Error(`${ep} : aucune étape en cours`);
    running.fin = t;
    console.log(`\n  ${ep} · ${running.nom} : ${dur(min(new Date(t) - new Date(running.debut)))}\n`);
  } else {
    if (running) running.fin = t;
    e.etapes.push({ nom: what, debut: t, ...(flags.note ? { note: String(flags.note) } : {}) });
    console.log(`\n  ${ep} · ${what} démarre${running ? ` (${running.nom} : ${dur(min(new Date(t) - new Date(running.debut)))})` : ""}\n`);
  }
  if (flags.titre) e.titre = String(flags.titre);
  writeJson(FILES.prod, data);
}

/** The commands logged for one episode, grouped: how many, how long, how many trial frames. */
function machine(ep) {
  if (!fs.existsSync(FILES.log)) return [];
  const by = new Map();
  for (const line of fs.readFileSync(FILES.log, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (row.ep !== ep) continue;
    const key = row.cmd === "render" && row.draft ? "render --draft" : row.cmd;
    const g = by.get(key) ?? { cmd: key, n: 0, ms: 0, images: 0, failed: 0 };
    g.n++;
    g.ms += row.ms || 0;
    g.images += row.n || 0;
    if (!row.ok) g.failed++;
    by.set(key, g);
  }
  return [...by.values()].sort((a, b) => b.ms - a.ms);
}

/** One episode, reduced to what the table compares. */
function digest(ep, e) {
  const now = Date.now();
  const stages = (e.etapes ?? []).map((s) => ({ ...s, minutes: min((s.fin ? new Date(s.fin) : now) - new Date(s.debut)), running: !s.fin }));
  const measured = stages.length > 0;
  const agents = e.agents ?? [];
  const g = e.jauges ?? [];
  const delta = (k) => (g.length >= 2 ? g[g.length - 1][k] - g[0][k] : undefined);
  return {
    ep, titre: e.titre ?? "", note: e.note, measured, stages, agents,
    minutes: measured ? sum(stages, (s) => s.minutes) : e.minutes,
    jetons: agents.length ? sum(agents, (a) => a.jetons) : e.jetons,
    nAgents: agents.length || e.nAgents,
    session: delta("session"), hebdo: delta("hebdo"),
    running: stages.some((s) => s.running),
  };
}

export function report(only) {
  const data = readJson(FILES.prod, { cibles: {}, episodes: {} });
  const C = { minutes: 120, jetons: 1500000, imagesParAgent: 30, ...data.cibles };
  const all = Object.keys(data.episodes).sort().map((ep) => digest(ep, data.episodes[ep]));
  const out = [];
  const say = (s = "") => out.push(s);

  say();
  say("  FABRICATION — ce que coûte un dossier");
  say();
  say(`  ${pad("dossier", 26)}${lpad("durée", 9)}${lpad("jetons", 10)}${lpad("agents", 8)}   mesure`);
  for (const d of all) {
    const flag = (v, target) => (v == null ? " " : v <= target ? "✓" : " ");
    say(`  ${pad(`${d.ep} ${d.titre}`.slice(0, 25), 26)}${lpad(dur(d.minutes), 9)}${flag(d.minutes, C.minutes)}${lpad(tok(d.jetons), 9)}${flag(d.jetons, C.jetons)}${lpad(d.nAgents ?? "—", 7)}   ${d.measured ? (d.running ? "chronométré, en cours" : "chronométré") : "reconstitué"}${d.note ? ` · ${d.note}` : ""}`);
  }
  say(`  ${pad("cible", 26)}${lpad(dur(C.minutes), 9)} ${lpad(tok(C.jetons), 9)}`);

  for (const d of all.filter((x) => x.measured && (!only || x.ep === only))) {
    say();
    say(`  ${d.ep} ${d.titre} — ${dur(d.minutes)} · ${tok(d.jetons)}${d.running ? " (en cours)" : ""}`);
    say();
    say("  Le temps, étape par étape");
    for (const s of d.stages) say(`    ${pad(s.nom, 14)}${lpad(dur(s.minutes), 8)}  ${lpad(pct(s.minutes / (d.minutes || 1)), 5)}  ${bar(s.minutes / (d.minutes || 1))}${s.running ? " …" : ""}`);
    if (d.agents.length) {
      say();
      say("  Les jetons, agent par agent");
      for (const a of [...d.agents].sort((x, y) => (y.jetons || 0) - (x.jetons || 0))) {
        const over = a.images != null && a.images > C.imagesParAgent ? ` (> ${C.imagesParAgent})` : "";
        say(`    ${pad(a.nom, 14)}${pad(a.genre, 8)}${pad(a.modele ?? "", 8)}${lpad(tok(a.jetons), 8)}${lpad(a.minutes != null ? dur(a.minutes) : "", 9)}${a.images != null ? `   ${a.images} images${over}` : ""}  ${bar((a.jetons || 0) / (d.jetons || 1), 16)}`);
      }
      const kinds = new Map();
      for (const a of d.agents) kinds.set(a.genre, [...(kinds.get(a.genre) ?? []), a]);
      say(`    par genre : ${[...kinds].map(([k, list]) => `${k} ${tok(sum(list, (a) => a.jetons))} (${list.length} × ${tok(sum(list, (a) => a.jetons) / list.length)})`).join(" · ")}`);
    }
    const m = machine(d.ep);
    if (m.length) {
      say();
      say("  La machine");
      say(`    ${m.map((g) => `${g.cmd} ×${g.n}${g.images ? ` (${g.images} images)` : ""} ${dur(min(g.ms))}${g.failed ? `, ${g.failed} en échec` : ""}`).join(" · ")}`);
      say(`    total ${dur(min(sum(m, (g) => g.ms)))} de calcul`);
    }
    if (d.hebdo != null) {
      say();
      say(`  La jauge : session +${d.session} pts · hebdo +${d.hebdo} pts${d.hebdo > 0 ? ` → ${Math.floor(100 / d.hebdo)} dossiers par semaine au plus à ce prix` : ""}`);
    }
    // what to cut first
    const worstStage = [...d.stages].sort((a, b) => b.minutes - a.minutes)[0];
    const worstAgent = [...d.agents].sort((a, b) => (b.jetons || 0) - (a.jetons || 0))[0];
    say();
    say(`  Où chercher d'abord : ${worstStage ? `le temps part dans « ${worstStage.nom} » (${pct(worstStage.minutes / (d.minutes || 1))})` : ""}${worstAgent ? ` · les jetons dans « ${worstAgent.nom} » (${pct((worstAgent.jetons || 0) / (d.jetons || 1))})` : ""}`);
  }

  // the audience
  const aud = readJson(FILES.aud, { episodes: {} });
  const eps = Object.keys(aud.episodes).sort();
  if (eps.length && !only) {
    say();
    say("  AUDIENCE — ce que rapporte un dossier");
    say();
    say(`  ${pad("dossier", 22)}${lpad("vues", 7)}${lpad("regardé", 9)}${lpad("en entier", 11)}${lpad("abo/1000", 10)}${lpad("likes/100", 11)}${lpad("com/1000", 10)}${lpad("à 5 s", 7)}`);
    let stock = 0;
    for (const ep of eps) {
      const a = aud.episodes[ep];
      const rendered = fs.readdirSync(path.join(ROOT, "episodes")).find((d) => d.startsWith(ep));
      const hasFilm = rendered && fs.existsSync(path.join(ROOT, "renders", `${rendered}.mp4`));
      if (!a.publie && hasFilm) stock++;
      if (!a.vues) {
        say(`  ${pad(`${ep} ${a.titre ?? ""}`.slice(0, 21), 22)}${a.publie ? `   en ligne depuis le ${String(a.publie).slice(0, 10)} — chiffres à demander` : hasFilm ? "   rendu, pas en ligne (ou date inconnue)" : "   en préparation"}`);
        continue;
      }
      const at = (s) => {
        const c = a.courbe ?? [];
        for (let i = 1; i < c.length; i++) if (s <= c[i][0]) return c[i - 1][1] + ((c[i][1] - c[i - 1][1]) * (s - c[i - 1][0])) / (c[i][0] - c[i - 1][0]);
        return undefined;
      };
      const per = (n, k) => (n == null ? "—" : ((n / a.vues) * k).toFixed(1).replace(".", ","));
      say(`  ${pad(`${ep} ${a.titre ?? ""}`.slice(0, 21), 22)}${lpad(a.vues, 7)}${lpad(a.dureeMoyenne && a.duree ? pct(a.dureeMoyenne / a.duree) : "—", 9)}${lpad(a.enEntier != null ? `${String(a.enEntier).replace(".", ",")} %` : "—", 11)}${lpad(per(a.abonnes, 1000), 10)}${lpad(per(a.likes, 100), 11)}${lpad(per(a.commentaires, 1000), 10)}${lpad(at(5) != null ? `${Math.round(at(5))} %` : "—", 7)}`);
    }
    say();
    say(`  Stock : ${stock} dossier${stock > 1 ? "s" : ""} rendu${stock > 1 ? "s" : ""} sans date de mise en ligne connue.`);
  }
  say();
  console.log(out.join("\n"));
}
