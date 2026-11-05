// Système Décodé — le bureau (front/index.html).
// Quatre onglets, un seul but chacun :
//   Publier     le film du jour : tout copier, tout télécharger, cocher « publié », en quelques touches
//   Calendrier  ce qui sort quel jour (sorti, prévu, jours vides) ; on change une date d'un geste
//   Chiffres    les trois comptes en direct (lus par le PC) et ce que font les films
//   Films       tous les dossiers, cherchables, triables, avec leurs vues
// Toucher un film, où qu'il soit, ouvre sa fiche en feuille par-dessus l'onglet : on ne perd jamais sa place.
// Le PC dit ce qui est sur le disque (/api/dossiers) et ce que disent les comptes (/api/comptes) ; une
// case cochée (/api/publication/<dossier>) ou une date fixée (/api/calendrier/<dossier>) repart vers lui,
// pour que l'iPhone et le PC disent la même chose.
(() => {
  "use strict";

  const SP = " ";
  const PLATFORMS = [
    { id: "tiktok", name: "TikTok", short: "TT" },
    { id: "instagram", name: "Instagram", short: "IG" },
    { id: "youtube", name: "YouTube", short: "YT" },
  ];
  const TABS = ["publier", "calendrier", "chiffres", "films"];
  const TAB_TITLES = { publier: "Publier", calendrier: "Calendrier", chiffres: "Chiffres", films: "Films" };
  const HOUR = 20; // l'heure fixe de sortie (docs/plan-scale-novembre.md)
  const LONG_DAYS = [2, 4, 6]; // mardi, jeudi, samedi : les longs (docs/plan-rush-youtube.md)
  const MEM_KEY = "sd.bureau.v2";
  const IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const WIDE = window.matchMedia("(min-width: 900px)");

  const $ = (s, root = document) => root.querySelector(s);

  /* ---------------------------------------------------------------- petits outils */

  /** h("a", { class, href, onclick }, enfant…) — le texte est toujours posé comme texte, jamais lu comme HTML. */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  // Les icônes : des traits, de la couleur du texte (constantes écrites ici, jamais venues du disque).
  const PATHS = {
    send: '<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    chart: '<path d="M4 19l5-6 4 3 7-9"/><path d="M15 7h5v5"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    play: '<path d="M7 4.5l13 7.5-13 7.5z"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    image: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="M20.5 16l-5-5-9 9"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0013 0M12 18v3"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.5a2 2 0 002 2h2.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 18.5v-11A1.5 1.5 0 015.5 6H10"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 11-2.2-5.3"/><path d="M20 4.5v4.5h-4.5"/>',
    alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.2v.3"/>',
    share: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M6 11v8.5h12V11"/>',
    doc: '<path d="M14 3.5H7A1.5 1.5 0 005.5 5v14A1.5 1.5 0 007 20.5h10a1.5 1.5 0 001.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    arrowdown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  };
  function icon(name) {
    const tpl = document.createElement("template");
    tpl.innerHTML = `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name] || ""}</svg>`;
    return tpl.content.firstChild;
  }
  for (const el of document.querySelectorAll("[data-ico]")) el.append(icon(el.dataset.ico));
  for (const el of document.querySelectorAll("[data-close], [data-close-sheet]")) el.append(icon("x"));

  const mem = (() => {
    let data = {};
    try {
      data = JSON.parse(localStorage.getItem(MEM_KEY)) || {};
    } catch {
      data = {};
    }
    return {
      get: (k, fallback) => (k in data ? data[k] : fallback),
      set(k, v) {
        data[k] = v;
        try {
          localStorage.setItem(MEM_KEY, JSON.stringify(data));
        } catch {
          // navigation privée : gardé pour cette visite
        }
      },
    };
  })();

  const full = new Intl.NumberFormat("fr-FR");
  const compact = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });
  const fmt = (n) => (n == null || !Number.isFinite(n) ? "–" : Math.abs(n) >= 10000 ? compact.format(n) : full.format(n));
  const oneDecimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  function size(bytes) {
    if (bytes >= 1e9) return `${oneDecimal.format(bytes / 1e9)}${SP}Go`;
    if (bytes >= 1e6) return `${Math.round(bytes / 1e6)}${SP}Mo`;
    return `${Math.max(1, Math.round(bytes / 1e3))}${SP}Ko`;
  }

  const DAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
  const DAYS_LONG = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const two = (n) => String(n).padStart(2, "0");
  const key = (d) => `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
  const parseDay = (k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  const addDays = (k, n) => {
    const d = parseDay(k);
    d.setDate(d.getDate() + n);
    return key(d);
  };
  const today = () => key(new Date());
  const mondayOf = (k) => addDays(k, -((parseDay(k).getDay() + 6) % 7));
  const dayLabel = (k) => {
    const d = parseDay(k);
    return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  const hhmm = (d) => `${two(d.getHours())}:${two(d.getMinutes())}`;
  const cap = (s) => s.replace(/^./, (c) => c.toUpperCase());
  /** "5 nov. à 18:25" d'une date gardée par le PC ("2026-11-05T18:25"). */
  function stamp(value, { time = true } = {}) {
    const m = /^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d))?/.exec(typeof value === "string" ? value : "");
    if (!m) return "";
    return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}${time && m[4] ? ` à ${m[4]}:${m[5]}` : ""}`;
  }
  /** "aujourd'hui", "demain", "samedi", "mar. 18 nov.". */
  const relDay = (k) => {
    const diff = Math.round((parseDay(k) - parseDay(today())) / 86400000);
    if (diff === 0) return "aujourd'hui";
    if (diff === 1) return "demain";
    if (diff === -1) return "hier";
    if (diff > 1 && diff < 7) return DAYS_LONG[parseDay(k).getDay()];
    return dayLabel(k);
  };
  /** Le temps qui reste avant 20 h aujourd'hui, ou null s'il est passé. */
  function untilTonight() {
    const now = new Date();
    const at = new Date(now);
    at.setHours(HOUR, 0, 0, 0);
    const min = Math.round((at - now) / 60000);
    if (min <= 0) return null;
    return min < 60 ? `${min}${SP}min` : `${Math.floor(min / 60)}${SP}h${SP}${two(min % 60)}`;
  }
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const fresh = (file) => `${file.url}?v=${file.mtime}`;
  const plural = (n, one, many = `${one}s`) => `${n}${SP}${n > 1 ? many : one}`;

  /* ---------------------------------------------------------------- copier, prévenir */

  const toast = $("#toast");
  const toastT = $("#toast-t");
  const toastAct = $("#toast-act");
  function say(message, { ok = true, action = null, run = null, ms } = {}) {
    clearTimeout(toast.timer);
    toastT.textContent = message;
    toast.classList.toggle("is-failed", !ok);
    toast.classList.toggle("has-act", Boolean(action));
    toastAct.hidden = !action;
    toastAct.textContent = action || "";
    toastAct.onclick = action
      ? () => {
          toast.hidden = true;
          run();
        }
      : null;
    toast.hidden = false;
    toast.style.animation = "none"; // relancer l'animation d'entrée
    void toast.offsetWidth;
    toast.style.animation = "";
    toast.timer = setTimeout(() => (toast.hidden = true), ms || (action ? 6000 : ok ? 2400 : 5200));
  }

  // Ouverte en http://192.168.x.x, la page n'est pas un « contexte sûr » : pas de navigator.clipboard
  // sur l'iPhone. Une zone de texte en lecture seule, sélectionnée dans le geste même, fait l'affaire.
  function copyFallback(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:-999em;width:2em;height:2em;opacity:0;font-size:16px;";
    document.body.append(area);
    let done = false;
    try {
      area.focus({ preventScroll: true });
      area.select();
      area.setSelectionRange(0, area.value.length);
      done = document.execCommand("copy");
    } catch {
      done = false;
    }
    area.remove();
    return done;
  }
  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // refusé : l'ancienne façon peut encore marcher
      }
    }
    return copyFallback(text);
  }

  /**
   * Un texte à copier, montré en entier ou replié : le toucher le copie. Rend [champ, « Tout lire »?].
   * Ce qui part dans le presse-papiers est le texte et ses hashtags, d'un coup.
   */
  function field(label, text, { tags = "", title = false } = {}) {
    const all = tags ? (text ? `${text}\n\n${tags}` : tags) : text;
    const act = h("span", { class: "field__act" }, icon("copy"), h("span", { text: "Copier" }));
    const body = h("span", { class: "field__text" }, text, tags ? h("span", { class: "tags", text: `${text ? "\n\n" : ""}${tags}` }) : null);
    const el = h("button", { type: "button", class: `field${title ? " field--title" : ""}`, "aria-label": `${label} : toucher pour copier` }, h("span", { class: "field__top" }, h("span", { class: "field__label", text: label }), act), body);
    el.addEventListener("click", async () => {
      const ok = await copyText(all);
      clearTimeout(el.timer);
      el.classList.toggle("is-copied", ok);
      act.replaceChildren(icon(ok ? "check" : "alert"), h("span", { text: ok ? "Copié" : "Refusé" }));
      if (!ok) {
        getSelection().selectAllChildren(body);
        say("Copie refusée : le texte est sélectionné, copie-le à la main.", { ok: false });
      }
      el.timer = setTimeout(() => {
        el.classList.remove("is-copied");
        act.replaceChildren(icon("copy"), h("span", { text: "Copier" }));
      }, 1800);
    });
    if (title || (text + tags).length <= 220) return [el];
    el.classList.add("is-clamped");
    const more = h("button", { type: "button", class: "more", text: "Tout lire" });
    more.addEventListener("click", () => {
      const clamped = el.classList.toggle("is-clamped");
      more.textContent = clamped ? "Tout lire" : "Replier";
    });
    return [el, more];
  }

  /* ---------------------------------------------------------------- l'état */

  const state = {
    raw: "",
    data: null,
    accounts: null,
    accountsFailed: false,
    accountsBusy: false,
    tab: "publier",
    sheet: null, // le dossier ouvert en feuille
    open: new Set(), // plateformes publiées qu'on a rouvertes : "dir:platform"
    filter: mem.get("filter", "all"),
    query: "",
    sort: mem.get("sort2", { key: "auto", dir: 1 }),
    month: null,
    week: null,
    past: false,
    cal: null,
    synced: null, // la dernière lecture réussie du PC
    offline: false,
  };

  const all = () => (state.data ? state.data.dossiers : []);
  const find = (dir) => all().find((d) => d.dir === dir) || null;
  const platformsOf = (d) => PLATFORMS.filter((p) => (d.platforms || ["tiktok", "instagram", "youtube"]).includes(p.id));
  const postedOn = (d) => d.posted || {};
  const isOn = (d, p) => Boolean(postedOn(d)[p]);
  const waiting = (d) => platformsOf(d).filter((p) => !isOn(d, p.id));
  const onlineSomewhere = (d) => platformsOf(d).some((p) => isOn(d, p.id));
  const fullyOnline = (d) => waiting(d).length === 0;
  const kindOf = (d) => (/^HS\d/.test(d.id) ? "Hors-série" : /^CR\d/.test(d.id) ? "Compte à rebours" : /^C\d/.test(d.id) ? "Compilation" : d.long ? "Vidéo longue" : "Dossier");
  const thumbOf = (d) => d.files.thumb || d.files.cover || null;
  const wipWhy = (d) => (d.voiced ? "rendu manquant" : "voix pas enregistrée");
  function firstPosted(d) {
    const dates = platformsOf(d)
      .map((p) => postedOn(d)[p.id])
      .filter((v) => typeof v === "string")
      .sort();
    return dates.length ? dates[0].slice(0, 10) : null;
  }

  /* ---------------------------------------------------------------- le calendrier, calculé */

  // Un court par jour ; les longs (L, compilations) le mardi, le jeudi, le samedi ; une promo (HS) le
  // jour de son long. Les Comptes à rebours sont des essais Instagram : ils n'ont de jour que si on leur en donne un.
  const slotOf = (d) => (/^CR\d/.test(d.id) ? "free" : /^HS\d/.test(d.id) ? "promo" : d.long || /^C\d/.test(d.id) ? "long" : "short");

  function computeCalendar() {
    const t = today();
    const events = []; // { day, d, status: done|ready|wip, how: posted|fixed|proposed }
    const taken = { short: new Set(), long: new Set() };
    const dayOf = new Map();
    const howOf = new Map();
    const push = (day, d, how) => {
      const status = how === "posted" ? "done" : d.ready ? "ready" : "wip";
      events.push({ day, d, status, how });
      dayOf.set(d.dir, day);
      howOf.set(d.dir, how);
      const slot = slotOf(d);
      if (slot === "short" || slot === "long") taken[slot].add(day);
    };
    const unplaced = [];
    for (const d of all()) {
      const first = firstPosted(d);
      if (first) push(first, d, "posted");
      else if (onlineSomewhere(d)) continue; // en ligne, jour inconnu (les premiers films)
      else if (d.planned) push(d.planned, d, "fixed");
    }
    const rest = all()
      .filter((d) => !dayOf.has(d.dir) && !onlineSomewhere(d))
      .sort((a, b) => Number(b.ready) - Number(a.ready) || a.id.localeCompare(b.id, "fr", { numeric: true }));
    const firstFree = (slot) => {
      for (let i = 0, day = t; i < 180; i++, day = addDays(day, 1)) {
        if (slot === "long" && !LONG_DAYS.includes(parseDay(day).getDay())) continue;
        if (!taken[slot].has(day)) return day;
      }
      return null;
    };
    for (const d of rest.filter((x) => slotOf(x) === "short" || slotOf(x) === "long")) {
      const day = firstFree(slotOf(d));
      if (day) push(day, d, "proposed");
      else unplaced.push(d);
    }
    for (const d of rest.filter((x) => slotOf(x) === "promo")) {
      const long = all().find((x) => x.id === `L${d.id.slice(2)}`);
      const day = long && dayOf.get(long.dir);
      if (day && day >= t) push(day, d, "proposed");
      else unplaced.push(d);
    }
    for (const d of rest.filter((x) => slotOf(x) === "free")) unplaced.push(d);

    const byDay = new Map();
    for (const e of events) {
      if (!byDay.has(e.day)) byDay.set(e.day, []);
      byDay.get(e.day).push(e);
    }
    const rank = (e) => ({ short: 0, long: 1, promo: 2, free: 3 })[slotOf(e.d)];
    for (const list of byDay.values()) list.sort((a, b) => rank(a) - rank(b));
    // les jours à venir sans court prêt : ce qu'il ne faut pas découvrir le soir même
    const gaps = [];
    for (let i = 0, day = t; i < 35; i++, day = addDays(day, 1)) {
      const shorts = (byDay.get(day) || []).filter((e) => slotOf(e.d) === "short");
      if (!shorts.some((e) => e.status !== "wip")) gaps.push(day);
    }
    return { events, byDay, dayOf, howOf, unplaced, gaps };
  }

  /** La file : ce qui a commencé à sortir d'abord, puis les prêts dans l'ordre du calendrier. */
  function queue() {
    const cal = state.cal;
    const started = all()
      .filter((d) => d.ready && onlineSomewhere(d) && !fullyOnline(d))
      .sort((a, b) => (firstPosted(a) || "").localeCompare(firstPosted(b) || ""));
    const next = all()
      .filter((d) => d.ready && !onlineSomewhere(d))
      .sort((a, b) => (cal.dayOf.get(a.dir) || "9999").localeCompare(cal.dayOf.get(b.dir) || "9999") || a.id.localeCompare(b.id, "fr", { numeric: true }));
    return [...started, ...next];
  }

  /* ---------------------------------------------------------------- le PC */

  const sync = $("#sync");
  const syncT = $("#sync-t");
  function paintSync() {
    sync.classList.toggle("is-on", !state.offline && Boolean(state.synced));
    sync.classList.toggle("is-off", state.offline);
    syncT.textContent = state.offline ? "Hors ligne" : state.synced ? `À jour · ${hhmm(state.synced)}` : "Connexion…";
    const banner = $("#banner");
    if (state.offline && state.data) {
      banner.hidden = false;
      banner.replaceChildren(h("b", { text: "Le PC ne répond plus. " }), `Ce que tu vois date de ${hhmm(state.synced)} ; une case cochée maintenant ne serait pas gardée. Vérifie que publier.cmd tourne et que cet appareil est sur le même Wi-Fi.`);
    } else if (state.data && !state.data.accounts) {
      banner.hidden = false;
      banner.replaceChildren("Le bureau du PC date d'avant cette page : ferme sa fenêtre et relance ", h("code", { text: "publier.cmd" }), " pour les chiffres en direct et le calendrier.");
    } else banner.hidden = true;
  }

  async function load() {
    sync.classList.add("is-busy");
    try {
      const res = await fetch("/api/dossiers", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      take(await res.text());
    } catch {
      state.offline = true;
      if (!state.data) drawUnreachable();
    } finally {
      sync.classList.remove("is-busy");
      paintSync();
    }
  }
  sync.addEventListener("click", () => {
    load();
    if (state.tab === "chiffres") loadAccounts(true);
  });

  function take(raw) {
    state.synced = new Date();
    state.offline = false;
    if (raw === state.raw) return paintSync();
    state.raw = raw;
    state.data = JSON.parse(raw);
    if (state.data.profile && state.data.profile.name) $("#brand").textContent = state.data.profile.name;
    paintSync();
    render();
  }

  async function loadAccounts(force = false) {
    if (state.accountsBusy) return;
    state.accountsBusy = true;
    if (state.data) drawChiffres();
    try {
      const res = await fetch(`/api/comptes${force ? "?force=1" : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      state.accounts = await res.json();
      state.accountsFailed = false;
    } catch {
      state.accountsFailed = true;
    }
    state.accountsBusy = false;
    if (state.data) {
      drawChiffres();
      drawFilmsList();
    }
  }

  async function post(path, body) {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error((await res.text()).trim() || "le PC n'a pas répondu");
    take(await res.text());
  }

  /** Cocher ou décocher une plateforme. Montré tout de suite, confirmé par le PC, repris s'il refuse. */
  async function setPosted(d, platform, on, { quiet = false } = {}) {
    const before = d.posted;
    const wasFull = fullyOnline(d);
    d.posted = { ...before, [platform]: on ? new Date().toISOString().slice(0, 16) : false };
    if (on) state.open.delete(`${d.dir}:${platform}`);
    state.raw = "";
    render();
    const name = PLATFORMS.find((p) => p.id === platform).name;
    try {
      await post(`/api/publication/${encodeURIComponent(d.dir)}`, { [platform]: on ? "now" : false });
      if (quiet) return;
      const now = find(d.dir);
      if (!on) return say(`${name} décoché`);
      const undo = () => setPosted(find(d.dir), platform, false, { quiet: true }).then(() => say(`${name} décoché`));
      if (now && fullyOnline(now) && !wasFull) {
        say(`${now.id} est en ligne partout`, { action: "Annuler", run: undo });
        if (state.tab === "publier" && !state.sheet) window.scrollTo({ top: 0, behavior: "smooth" });
      } else say(`${name} coché · reste ${waiting(now).map((p) => p.name).join(", ")}`, { action: "Annuler", run: undo });
    } catch (err) {
      const now = find(d.dir);
      if (now) now.posted = before;
      state.raw = "";
      render();
      say(`Pas enregistré : ${err.message}`, { ok: false });
    }
  }

  /** Un dossier déjà en ligne partout, sans date connue (l'ancien « Tout cocher »). */
  async function fileAsOnline(d) {
    try {
      await post(`/api/publication/${encodeURIComponent(d.dir)}`, Object.fromEntries(platformsOf(d).map((p) => [p.id, true])));
      say(`${d.id} rangé : en ligne partout`);
    } catch (err) {
      say(`Pas enregistré : ${err.message}`, { ok: false });
    }
  }

  async function setPlanned(d, date, { quiet = false } = {}) {
    const before = d.planned || null;
    try {
      await post(`/api/calendrier/${encodeURIComponent(d.dir)}`, { date });
      if (quiet) return;
      say(date ? `${d.id} : sortie ${relDay(date)} à ${HOUR}${SP}h` : `${d.id} : date proposée par le bureau`, {
        action: "Annuler",
        run: () => setPlanned(find(d.dir), before, { quiet: true }).then(() => say("Date remise")),
      });
    } catch (err) {
      say(`Pas enregistré : ${err.message}`, { ok: false });
    }
  }

  /* ---------------------------------------------------------------- lecture plein écran */

  const viewer = $("#viewer");
  const stage = $("#viewer-stage");
  viewer.addEventListener("click", (e) => {
    if (e.target === viewer || e.target.closest("[data-close]")) viewer.close();
  });
  viewer.addEventListener("close", () => {
    for (const v of stage.querySelectorAll("video")) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    stage.replaceChildren();
  });
  /** Ce que la page lit : une copie légère quand c'est le même rendu, sinon le fichier lui-même. */
  function filmOf(d) {
    const { video, phone, preview, mute } = d.files;
    if (video) {
      const light = [phone, preview].find((f) => f && f.mtime >= video.mtime);
      return light ? { file: light, note: "Copie allégée pour la lecture : le fichier à poster, c'est « Télécharger la vidéo »." } : { file: video, note: "" };
    }
    return mute ? { file: mute, note: "Aperçu muet : la voix n'est pas encore posée.", mute: true } : null;
  }
  function playFilm(d) {
    const film = filmOf(d);
    if (!film || typeof viewer.showModal !== "function") return;
    const v = h("video", { controls: true, playsinline: true, src: fresh(film.file), poster: d.files.cover ? fresh(d.files.cover) : null });
    stage.replaceChildren(v);
    $("#viewer-tag").textContent = `${kindOf(d)} ${d.id} · ${d.title}`;
    $("#viewer-hint").textContent = film.note;
    viewer.showModal();
    v.play().catch(() => {});
  }

  const canShareVideo = (() => {
    if (!window.isSecureContext || typeof navigator.canShare !== "function") return false;
    try {
      return navigator.canShare({ files: [new File([""], "v.mp4", { type: "video/mp4" })] });
    } catch {
      return false;
    }
  })();

  /* ---------------------------------------------------------------- navigation */

  function go(tab, { top = true } = {}) {
    if (!TABS.includes(tab)) tab = "publier";
    state.tab = tab;
    mem.set("tab", tab);
    document.body.dataset.tab = tab;
    for (const a of document.querySelectorAll(".tabs [data-tab-link]")) {
      const on = a.dataset.tabLink === tab;
      a.classList.toggle("is-on", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    document.title = `${TAB_TITLES[tab]} · Bureau`;
    if (!state.sheet && location.hash !== `#${tab}`) history.replaceState(null, "", `#${tab}`);
    if (tab === "chiffres" && !state.accounts) loadAccounts();
    if (top) window.scrollTo(0, 0);
  }
  for (const a of document.querySelectorAll("[data-tab-link]")) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      if (state.sheet) closeSheet();
      if (a.dataset.tabLink === state.tab) return window.scrollTo({ top: 0, behavior: "smooth" });
      go(a.dataset.tabLink);
    });
  }

  /* ---------------------------------------------------------------- la feuille d'un film */

  const sheet = $("#sheet");
  const sheetPanel = $("#sheet-panel");
  const sheetBody = $("#sheet-body");

  function openSheet(dir, { push = true } = {}) {
    const d = find(dir);
    if (!d || typeof sheet.showModal !== "function") return;
    state.sheet = dir;
    fillSheet(true);
    if (!sheet.open) {
      sheet.classList.remove("is-closing");
      sheetPanel.style.transform = "";
      sheet.showModal();
      document.body.classList.add("is-locked");
    }
    if (push) history.pushState({ sheet: dir }, "", `#film/${encodeURIComponent(dir)}`);
    else if (!location.hash.startsWith("#film/")) history.replaceState(null, "", `#film/${encodeURIComponent(dir)}`);
  }
  function fillSheet(reset = false) {
    const d = state.sheet && find(state.sheet);
    if (!d) return;
    const y = sheetBody.scrollTop;
    $("#sheet-kicker").textContent = `${kindOf(d)} ${d.id}`;
    $("#sheet-title").textContent = d.title;
    sheetBody.replaceChildren(filmView(d, { inSheet: true }));
    sheetBody.scrollTop = reset ? 0 : y;
  }
  let closing = false;
  function closeSheet({ fromHistory = false } = {}) {
    if (!sheet.open || closing) return;
    closing = true;
    sheet.classList.add("is-closing");
    setTimeout(() => {
      sheet.close();
      sheet.classList.remove("is-closing");
      sheetPanel.style.transform = "";
      document.body.classList.remove("is-locked");
      state.sheet = null;
      closing = false;
      if (!fromHistory && history.state && history.state.sheet) history.back();
      else if (location.hash.startsWith("#film/")) history.replaceState(null, "", `#${state.tab}`);
    }, 230);
  }
  sheet.addEventListener("cancel", (e) => {
    e.preventDefault();
    closeSheet();
  });
  sheet.addEventListener("click", (e) => {
    if (e.target === sheet || e.target.closest("[data-close-sheet]")) closeSheet();
  });
  window.addEventListener("popstate", () => {
    const m = /^#film\/(.+)$/.exec(location.hash);
    if (m) openSheet(decodeURIComponent(m[1]), { push: false });
    else if (sheet.open) closeSheet({ fromHistory: true });
    else {
      const tab = location.hash.slice(1);
      if (TABS.includes(tab) && tab !== state.tab) go(tab);
    }
  });
  // glisser la feuille vers le bas pour la fermer (iPhone)
  (() => {
    let y0 = null;
    let dy = 0;
    let t0 = 0;
    const start = (e) => {
      if (WIDE.matches || e.target.closest("button, a")) return;
      y0 = e.clientY;
      dy = 0;
      t0 = performance.now();
      sheetPanel.style.transition = "none";
      e.currentTarget.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (y0 == null) return;
      dy = Math.max(0, e.clientY - y0);
      sheetPanel.style.transform = `translateY(${dy}px)`;
    };
    const end = () => {
      if (y0 == null) return;
      const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
      y0 = null;
      sheetPanel.style.transition = "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)";
      if (dy > 120 || (fast && dy > 30)) {
        sheetPanel.style.transform = "translateY(100%)";
        setTimeout(() => {
          sheetPanel.style.transition = "";
          closeSheet();
        }, 200);
      } else {
        sheetPanel.style.transform = "";
        setTimeout(() => (sheetPanel.style.transition = ""), 260);
      }
    };
    for (const el of [$("#sheet-grab"), $(".sheet__head")]) {
      el.addEventListener("pointerdown", start);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    }
  })();

  /* ---------------------------------------------------------------- dessiner */

  function render() {
    if (!state.data) return;
    state.cal = computeCalendar();
    const q = queue();
    for (const b of document.querySelectorAll('[data-count="publier"]')) b.textContent = q.length ? String(q.length) : "";
    const soon = state.cal.gaps.filter((day) => day <= addDays(today(), 6)).length;
    for (const b of document.querySelectorAll('[data-count="calendrier"]')) {
      b.textContent = soon ? String(soon) : "";
      b.classList.toggle("is-alert", soon > 0);
      b.title = soon ? `${plural(soon, "jour")} sans court prêt cette semaine` : "";
    }
    drawPublier();
    drawCalendrier();
    drawChiffres();
    drawFilms();
    if (state.sheet) fillSheet();
  }

  function drawUnreachable() {
    $("#publier").replaceChildren(
      vhead("Publier", "Le PC ne répond pas.", [], "publier"),
      h(
        "div",
        { class: "empty" },
        h("b", { text: "PC injoignable" }),
        "Le bureau ne tourne pas, ou cet appareil n'est pas sur le même Wi-Fi que le PC. Lance publier.cmd sur le PC, puis réessaie.",
        h("br"),
        h("button", { type: "button", class: "btn btn--primary", onclick: () => load() }, icon("refresh"), "Réessayer"),
      ),
    );
  }

  function vhead(title, sub, acts = [], id = state.tab) {
    return h("header", { class: "vhead" }, h("div", {}, h("h1", { id: `h-${id}`, text: title }), sub ? h("p", {}, sub) : null), acts.length ? h("div", { class: "vhead__acts" }, acts) : null);
  }
  function sh(title, small) {
    return h("div", { class: "sh" }, h("h2", { text: title }), small ? h("small", {}, small) : null);
  }
  function thumb(d) {
    const t = thumbOf(d);
    return h("span", { class: `thumb${d.long ? " thumb--wide" : ""}` }, t ? h("img", { src: fresh(t), alt: "", loading: "lazy", decoding: "async" }) : d.id);
  }
  function dots(d) {
    return h("span", { class: "dots", "aria-label": platformsOf(d).map((p) => `${p.name} ${isOn(d, p.id) ? "publié" : "à publier"}`).join(", ") }, platformsOf(d).map((p) => h("i", { class: isOn(d, p.id) ? "is-on" : "" })));
  }
  /** Une ligne de film : la toucher ouvre sa fiche. */
  function item(d, kicker, end) {
    return h(
      "button",
      { type: "button", class: "item", onclick: () => openSheet(d.dir) },
      thumb(d),
      h("span", { class: "item__body" }, h("span", { class: "kicker" }, kicker), h("span", { class: "item__t", text: d.title })),
      h("span", { class: "item__end" }, end, icon("chev")),
    );
  }

  /* ---------------------------------------------------------------- la fiche d'un film (onglet ou feuille) */

  function when(d) {
    const posted = firstPosted(d);
    if (posted) return { label: relDay(posted) === dayLabel(posted) ? `Sorti le ${dayLabel(posted)}` : `Sorti ${relDay(posted)}`, editable: false };
    const day = state.cal.dayOf.get(d.dir);
    if (!day) return { label: "Choisir un jour", sub: "pas de date", editable: true };
    return { label: `${cap(relDay(day))} · ${HOUR}${SP}h`, sub: state.cal.howOf.get(d.dir) === "fixed" ? "date fixée" : "date proposée", editable: true, day };
  }

  function filmView(d, { inSheet = false } = {}) {
    const film = filmOf(d);
    const cover = d.files.cover || thumbOf(d);
    const media = h(
      film ? "button" : "div",
      { class: `cover${d.long ? " cover--wide" : ""}`, type: film ? "button" : null, "aria-label": film ? `Lire ${d.title}` : null, onclick: film ? () => playFilm(d) : null },
      cover ? h("img", { src: fresh(cover), alt: "" }) : h("span", { class: "cover__none", text: d.id }),
      film ? h("span", { class: "cover__play" }, h("span", {}, icon("play"))) : null,
    );
    const status = !d.ready ? h("span", { class: "pill pill--warn" }, `Pas prêt · ${wipWhy(d)}`) : fullyOnline(d) ? h("span", { class: "pill pill--ok" }, "En ligne partout") : null;
    const card = h(
      "div",
      { class: `film__card${d.long ? " film__card--wide" : ""}` },
      media,
      h(
        "div",
        {},
        inSheet ? null : h("p", { class: "kicker", text: `${kindOf(d)} ${d.id}` }),
        inSheet ? null : h("h2", { class: "film__title", text: d.title }),
        h("div", { class: "progress" }, platformsOf(d).map((p) => h("span", { class: `pp${isOn(d, p.id) ? " is-on" : ""}` }, h("i", {}, icon("check")), p.name))),
        status ? h("div", { style: "margin-top:10px" }, status) : null,
      ),
    );

    // ce qu'on fait du fichier
    const rows = [];
    const v = d.files.video;
    if (film) rows.push(h("button", { type: "button", class: "row", onclick: () => playFilm(d) }, h("span", { class: "row__ico" }, icon("play")), h("span", { class: "row__t", text: film.mute ? "Voir l'aperçu muet" : "Regarder le film" }), h("span", { class: "row__v" }, icon("chev"))));
    if (v) rows.push(h("a", { class: "row", href: `${v.url}?dl=1`, download: `${d.dir}.mp4` }, h("span", { class: "row__ico row__ico--go" }, icon("download")), h("span", { class: "row__t" }, "Télécharger la vidéo", IOS ? h("small", { text: "Puis dans Fichiers : Partager › Enregistrer la vidéo" }) : null), h("span", { class: "row__v" }, h("b", { text: size(v.bytes) }))));
    if (d.files.cover && !d.long) rows.push(h("a", { class: "row", href: `${d.files.cover.url}?dl=1`, download: `${d.dir}-couverture.png` }, h("span", { class: "row__ico" }, icon("image")), h("span", { class: "row__t", text: "Couverture" }), h("span", { class: "row__v" }, "PNG", icon("download"))));
    if (canShareVideo && v) rows.push(shareRow(d));
    const w = when(d);
    if (w.editable) {
      rows.push(h("label", { class: "row is-tap" }, h("span", { class: "row__ico" }, icon("calendar")), h("span", { class: "row__t" }, "Sortie", h("small", { text: w.sub })), h("span", { class: "row__v" }, h("b", { text: w.label }), icon("chev")), dateInput(d, w.day)));
      if (d.planned) rows.push(h("button", { type: "button", class: "row", onclick: () => setPlanned(d, null) }, h("span", { class: "row__ico" }, icon("refresh")), h("span", { class: "row__t", text: "Revenir à la date proposée" }), h("span", { class: "row__v" })));
    } else rows.push(h("div", { class: "row" }, h("span", { class: "row__ico" }, icon("calendar")), h("span", { class: "row__t", text: "Sortie" }), h("span", { class: "row__v" }, h("b", { text: w.label }))));
    if (d.booth && !onlineSomewhere(d)) rows.push(h("a", { class: "row", href: `/voix.html?ep=${encodeURIComponent(d.dir)}` }, h("span", { class: "row__ico" }, icon("mic")), h("span", { class: "row__t" }, "Cabine voix", h("small", { text: "Écouter et choisir les prises" })), h("span", { class: "row__v" }, icon("chev"))));

    const side = h("div", { class: "film__side" }, card, h("div", { class: "group" }, rows));
    const done = platformsOf(d).filter((p) => isOn(d, p.id)).length;
    const main = h(
      "div",
      { class: "film__main" },
      sh("Publier", `${done}${SP}/${SP}${platformsOf(d).length}`),
      h("div", { class: "plats" }, platformsOf(d).map((p) => platCard(d, p))),
      d.ready && !onlineSomewhere(d) ? h("div", { style: "margin-top:14px;text-align:center" }, h("button", { type: "button", class: "btn btn--quiet", onclick: () => fileAsOnline(d) }, "Déjà en ligne partout ? Le ranger sans date")) : null,
    );
    return h("div", { class: "film" }, side, main);
  }

  function dateInput(d, value) {
    const input = h("input", { type: "date", value: value || "", min: today(), "aria-label": `Jour de sortie de ${d.id}` });
    input.addEventListener("change", () => /^\d{4}-\d\d-\d\d$/.test(input.value) && setPlanned(d, input.value));
    input.addEventListener("click", () => {
      try {
        if (typeof input.showPicker === "function") input.showPicker();
      } catch {
        // le navigateur ouvre son propre sélecteur
      }
    });
    return input;
  }

  function shareRow(d) {
    const label = h("span", { class: "row__t", text: "Partager la vidéo" });
    let file = null;
    return h(
      "button",
      {
        type: "button",
        class: "row",
        onclick: async () => {
          try {
            if (!file) {
              label.textContent = "Préparation…";
              const res = await fetch(d.files.video.url);
              file = new File([await res.blob()], `${d.dir}.mp4`, { type: "video/mp4" });
            }
            label.textContent = "Partager la vidéo";
            await navigator.share({ files: [file], title: d.title });
          } catch (err) {
            label.textContent = err && err.name === "NotAllowedError" ? "Vidéo prête : touche encore" : "Partager la vidéo";
          }
        },
      },
      h("span", { class: "row__ico" }, icon("share")),
      label,
      h("span", { class: "row__v" }, icon("chev")),
    );
  }

  /** Une carte par plateforme : ce qu'il faut copier, et « Publié ». */
  function platCard(d, p) {
    const done = isOn(d, p.id);
    const k = `${d.dir}:${p.id}`;
    const open = state.open.has(k);
    const posted = postedOn(d)[p.id];
    const card = h("section", { class: `plat${done ? " is-done" : ""}${open ? " is-open" : ""}`, "aria-label": p.name });
    const kids = [h("span", { class: "plat__check" }, icon("check")), h("h3", { class: "plat__name", text: p.name }), h("span", { class: "plat__state", text: done ? (typeof posted === "string" ? `Publié le ${stamp(posted)}` : "Publié") : "À publier" }), h("span", { class: "plat__chev" }, icon("down"))];
    let head;
    if (done) {
      head = h("button", { type: "button", class: "plat__head", "aria-expanded": String(open) }, kids);
      head.addEventListener("click", () => {
        if (state.open.has(k)) state.open.delete(k);
        else state.open.add(k);
        const now = card.classList.toggle("is-open");
        head.setAttribute("aria-expanded", String(now));
      });
    } else head = h("div", { class: "plat__head" }, kids);
    const body = h("div", { class: "plat__body" }, platWords(d, p.id));
    body.append(
      done
        ? h("button", { type: "button", class: "btn btn--quiet", onclick: () => setPosted(d, p.id, false) }, `Pas encore sur ${p.name} : décocher`)
        : h("button", { type: "button", class: "btn btn--go btn--full", "aria-disabled": d.ready ? null : "true", onclick: () => setPosted(d, p.id, true) }, icon("check"), `Publié sur ${p.name}`),
    );
    card.append(head, body);
    return card;
  }

  const missing = (what) => h("p", { class: "hint" }, `${what} pas encore écrit. Sur le PC : `, h("b", { text: "node scripts/posts.mjs" }), ".");
  const steps = (lead, items, after) => h("div", { class: "steps" }, lead, items.map((x) => h("span", { class: "pill", text: x })), after);

  function platWords(d, platform) {
    const post = d.post || {};
    const out = [];
    if (platform === "tiktok") {
      const tags = (post.hashtags || []).join(" ");
      if (post.caption || tags) out.push(field("Légende + hashtags", post.caption || "", { tags }));
      else out.push(missing("La légende TikTok"));
      if (post.pinned) out.push(field("Commentaire à épingler", post.pinned));
      out.push(steps("Avant de publier :", ["Couverture", "Contenu généré par l'IA", "Importer en HD"], post.pinned ? " puis épingle le commentaire." : null));
      return out;
    }
    if (platform === "instagram") {
      const ig = post.instagram || {};
      if (!ig.caption) return [missing("La légende Instagram")];
      return [field("Légende + hashtags", ig.caption, { tags: (ig.hashtags || []).join(" ") }), h("p", { class: "hint" }, "Même couverture que TikTok. Pense à la story ", h("b", { text: "« ce soir sur TikTok »" }), ".")];
    }
    const yt = post.youtube || {};
    if (!yt.title) return [missing("Le titre YouTube")];
    const tags = (yt.hashtags || []).join(" ");
    out.push(field(`Titre · ${yt.title.length}/100`, yt.title, { title: true }));
    if (d.long) for (const [i, alt] of (yt.titleAlts || []).entries()) out.push(field(`Titre de test ${i + 2}`, alt, { title: true }));
    if (yt.description || tags) out.push(field("Description", yt.description || "", { tags }));
    if (d.long) {
      const th = d.files.thumbnails || [];
      if (th.length)
        out.push(
          h(
            "div",
            {},
            h("p", { class: "field__label", style: "margin:4px 0 8px", text: "Miniatures · Tester et comparer" }),
            h("div", { class: "thumbs" }, th.map((t) => h("a", { href: `${t.url}?dl=1`, download: t.url.split("/").pop(), title: t.title || "" }, h("img", { src: fresh(t), alt: t.title || `Miniature ${t.n}`, loading: "lazy" }), `Miniature ${t.n} ↓`))),
          ),
        );
      if (d.files.srt) out.push(h("a", { class: "btn btn--full", href: `${d.files.srt.url}?dl=1`, download: `${d.dir}.srt` }, icon("doc"), "Sous-titres .srt"));
      if (yt.pinned) out.push(field("Commentaire à épingler", yt.pinned));
      if (yt.endScreen) out.push(h("p", { class: "hint" }, h("b", { text: "Écran de fin : " }), yt.endScreen));
      out.push(steps("Dans Studio :", ["3 miniatures en test", "Sous-titres", "Écran de fin"], yt.pinned ? " puis épingle le commentaire." : null));
    } else out.push(h("p", { class: "hint" }, "Relie la ", h("b", { text: "vidéo associée" }), " à un long quand le sujet s'y prête."));
    return out;
  }

  /* ---------------------------------------------------------------- Publier */

  /** Le titre de l'onglet : où en est le film du jour. */
  function publierHead(d) {
    const day = state.cal.dayOf.get(d.dir);
    if (onlineSomewhere(d)) return ["En cours", ["Reste ", h("b", { text: waiting(d).map((p) => p.name).join(", ") }), ` pour ${d.id}.`]];
    if (day === today()) {
      const left = untilTonight();
      return ["Ce soir", left ? [h("b", { text: `${HOUR}${SP}h` }), ` · dans ${left}`] : [h("b", { text: `${HOUR}${SP}h passée` }), " · à publier dès que possible"]];
    }
    if (day && day < today()) return ["En retard", [`Prévu ${relDay(day)}, `, h("span", { class: "warn", text: "pas encore publié" }), "."]];
    if (day) return ["Prochain", ["Prévu ", h("b", { text: `${relDay(day)} à ${HOUR}${SP}h` }), "."]];
    return ["À publier", null];
  }

  function drawPublier() {
    const root = $("#publier");
    const q = queue();
    const d = q[0] || null;
    if (!d) {
      const next = state.cal.events.filter((e) => e.day >= today() && e.status === "wip").sort((a, b) => a.day.localeCompare(b.day))[0];
      root.replaceChildren(
        vhead("Publier", "Tout ce qui est prêt est en ligne.", [], "publier"),
        h("div", { class: "empty" }, h("b", { text: "Rien à publier" }), next ? `Le prochain, ${next.d.id} ${next.d.title}, est prévu ${relDay(next.day)} : ${wipWhy(next.d)}.` : "Aucun film en attente."),
        wipBlock(),
      );
      return;
    }
    const [title, sub] = publierHead(d);
    const others = q.slice(1);
    const aside = h(
      "aside",
      { class: "pub__aside" },
      sh("Ensuite", others.length ? plural(others.length, "film prêt", "films prêts") : "rien d'autre de prêt"),
      others.length
        ? h("div", { class: "list" }, others.map((x) => item(x, [x.id, state.cal.dayOf.get(x.dir) ? ` · ${relDay(state.cal.dayOf.get(x.dir))}` : ""], dots(x))))
        : h("p", { class: "hint", style: "padding:0 4px" }, "Le film suivant n'est pas encore rendu. ", h("a", { href: "#calendrier", style: "text-decoration:underline", onclick: (e) => (e.preventDefault(), go("calendrier")) }, "Voir le calendrier")),
      wipBlock(),
    );
    root.replaceChildren(vhead(title, sub, [], "publier"), h("div", { class: "pub" }, h("div", {}, filmView(d)), aside));
  }

  /** Le compte à rebours du titre (« dans 2 h 14 ») avance sans redessiner la fiche. */
  function tickPublierHead() {
    const d = state.data && queue()[0];
    const old = $("#publier > .vhead");
    if (!d || !old) return;
    const [title, sub] = publierHead(d);
    old.replaceWith(vhead(title, sub, [], "publier"));
  }

  function wipBlock() {
    const wip = all()
      .filter((d) => !d.ready)
      .sort((a, b) => (state.cal.dayOf.get(a.dir) || "9999").localeCompare(state.cal.dayOf.get(b.dir) || "9999") || a.id.localeCompare(b.id, "fr", { numeric: true }));
    if (!wip.length) return null;
    const fold = h(
      "details",
      { class: "fold", open: mem.get("wipOpen", false) ? true : null },
      h("summary", {}, `En fabrication · ${wip.length}`, icon("down")),
      h("div", { class: "list" }, wip.map((d) => item(d, [d.id, state.cal.dayOf.get(d.dir) ? ` · prévu ${relDay(state.cal.dayOf.get(d.dir))}` : ""], h("span", { class: "pill pill--warn", text: d.voiced ? "rendu" : "voix" })))),
    );
    fold.addEventListener("toggle", () => mem.set("wipOpen", fold.open));
    return fold;
  }

  /* ---------------------------------------------------------------- Calendrier */

  function evButton(e, { drag = false } = {}) {
    const d = e.d;
    const what =
      e.status === "done"
        ? `En ligne · ${platformsOf(d).filter((p) => isOn(d, p.id)).map((p) => p.short).join(" ")}`
        : e.status === "wip"
          ? `Pas prêt · ${wipWhy(d)}`
          : `Prêt · ${HOUR}${SP}h${e.how === "proposed" ? " · proposé" : ""}`;
    const k = e.status === "done" ? "k-done" : e.status === "wip" ? "k-wip" : e.how === "proposed" ? "k-prop" : "k-ready";
    const kind = kindOf(d);
    const b = h(
      "button",
      { type: "button", class: `ev ev--${e.status}${e.how === "proposed" ? " ev--prop" : ""}`, title: `${d.id} · ${d.title}`, onclick: () => openSheet(d.dir) },
      thumb(d),
      h("span", { class: "ev__body" }, h("span", { class: "ev__t", text: `${d.id} · ${d.title}` }), h("span", { class: "ev__m", text: `${kind === "Dossier" ? "" : `${kind} · `}${what}` })),
      h("i", { class: `k ${k}` }),
    );
    if (drag && e.status !== "done") {
      b.draggable = true;
      b.addEventListener("dragstart", (ev) => {
        ev.dataTransfer.setData("text/plain", d.dir);
        ev.dataTransfer.effectAllowed = "move";
        b.classList.add("is-dragging");
      });
      b.addEventListener("dragend", () => b.classList.remove("is-dragging"));
    }
    return b;
  }

  function legend() {
    return h(
      "div",
      { class: "legend" },
      h("span", {}, h("i", { class: "k k-done" }), "Sorti"),
      h("span", {}, h("i", { class: "k k-ready" }), "Prêt, date fixée"),
      h("span", {}, h("i", { class: "k k-prop" }), "Prêt, date proposée"),
      h("span", {}, h("i", { class: "k k-wip" }), "Pas encore prêt"),
      h("span", {}, h("i", { class: "k k-none" }), "Aucun court"),
    );
  }

  /** La couleur d'un jour dans la barre de la semaine : ce que dit son court. */
  function dayTone(day) {
    const list = state.cal.byDay.get(day) || [];
    const e = list.find((x) => slotOf(x.d) === "short") || list[0];
    if (!e) return day >= today() ? "var(--signal)" : "transparent";
    if (e.status === "done") return "var(--ink-4)";
    if (e.status === "wip") return "var(--signal)";
    return "var(--veille)";
  }

  function scrollToDay(day) {
    const el = document.getElementById(`day-${day}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.remove("is-hit");
    void el.offsetWidth;
    el.classList.add("is-hit");
  }

  function drawCalendrier() {
    const root = $("#calendrier");
    const t = today();
    const gaps7 = state.cal.gaps.filter((day) => day <= addDays(t, 6));
    let lastGood = t;
    while (!state.cal.gaps.includes(lastGood) && lastGood < addDays(t, 34)) lastGood = addDays(lastGood, 1);
    lastGood = addDays(lastGood, -1);
    const sub = gaps7.length
      ? [h("span", { class: "warn", text: plural(gaps7.length, "jour") }), " sans court prêt dans les 7 prochains jours."]
      : [h("span", { class: "ok", text: "Un court prêt chaque jour" }), ` jusqu'à ${relDay(lastGood)}.`];

    // iPhone : la barre de la semaine, puis l'agenda jour par jour
    if (!state.week) state.week = mondayOf(t);
    const from = state.past ? addDays(t, -21) : t;
    const to = addDays(t, 34);
    const jump = (day) => {
      if (day < from) {
        state.past = true;
        drawCalendrier();
      }
      scrollToDay(day < addDays(t, -21) ? addDays(t, -21) : day);
    };
    const weekbar = h(
      "div",
      { class: "weekbar", role: "group", "aria-label": "Semaine" },
      h("button", { type: "button", class: "iconbtn", "aria-label": "Semaine précédente", onclick: () => ((state.week = addDays(state.week, -7)), drawCalendrier(), jump(state.week)) }, icon("left")),
      Array.from({ length: 7 }, (_, i) => {
        const day = addDays(state.week, i);
        const dd = parseDay(day);
        return h(
          "button",
          { type: "button", class: `wd${day === t ? " is-today" : ""}${day < t ? " is-past" : ""}`, "aria-label": dayLabel(day), onclick: () => jump(day) },
          h("span", { text: DAYS[dd.getDay()].replace(".", "") }),
          h("b", { text: String(dd.getDate()) }),
          h("i", { style: `background:${dayTone(day)}` }),
        );
      }),
      h("button", { type: "button", class: "iconbtn", "aria-label": "Semaine suivante", onclick: () => ((state.week = addDays(state.week, 7)), drawCalendrier(), jump(state.week < t ? t : state.week)) }, icon("right")),
    );
    const agenda = h("div", { class: "agenda" });
    let wk = null;
    for (let day = from; day <= to; day = addDays(day, 1)) {
      const m = mondayOf(day);
      if (m !== wk) {
        wk = m;
        const label = m === mondayOf(t) ? "Cette semaine" : m === addDays(mondayOf(t), 7) ? "La semaine prochaine" : m === addDays(mondayOf(t), -7) ? "La semaine dernière" : `Semaine du ${parseDay(m).getDate()} ${MONTHS[parseDay(m).getMonth()]}`;
        agenda.append(h("p", { class: "wk", text: label }));
      }
      const list = state.cal.byDay.get(day) || [];
      const dd = parseDay(day);
      const hasShort = list.some((e) => slotOf(e.d) === "short");
      agenda.append(
        h(
          "div",
          { class: `day${day === t ? " is-today" : ""}${day < t ? " is-past" : ""}`, id: `day-${day}` },
          h("div", { class: "day__d" }, h("span", { text: day === t ? "auj." : DAYS[dd.getDay()] }), h("b", { text: String(dd.getDate()) })),
          h(
            "div",
            { class: "day__evs" },
            list.map((e) => evButton(e)),
            !hasShort && day >= t && day <= addDays(t, 13) ? h("div", { class: "day__none" }, icon("alert"), "Aucun court prévu ce jour-là") : null,
            !list.length && day < t ? h("p", { class: "day__quiet", text: "Rien de sorti" }) : null,
            !list.length && day > addDays(t, 13) ? h("p", { class: "day__quiet", text: "Rien de prévu" }) : null,
          ),
        ),
      );
    }
    const agendaWrap = h(
      "div",
      { class: "agenda-wrap" },
      weekbar,
      legend(),
      h("div", { class: "agenda-tools" }, h("button", { type: "button", class: "btn btn--quiet", onclick: () => ((state.past = !state.past), drawCalendrier()) }, state.past ? "Masquer les jours passés" : "Voir les 3 semaines passées")),
      agenda,
    );

    // PC : le mois, où l'on glisse un film sur un autre jour
    if (!state.month) state.month = t.slice(0, 7);
    const [y, m] = state.month.split("-").map(Number);
    const start = mondayOf(key(new Date(y, m - 1, 1)));
    const grid = h("div", { class: "grid7" }, ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."].map((x) => h("div", { class: "grid7__h", text: x })));
    for (let i = 0, day = start; i < 42; i++, day = addDays(day, 1)) {
      const dd = parseDay(day);
      if (i === 35 && dd.getMonth() !== m - 1) break;
      const list = state.cal.byDay.get(day) || [];
      const gap = day >= t && day <= addDays(t, 13) && state.cal.gaps.includes(day);
      const cell = h(
        "div",
        { class: `cell7${dd.getMonth() !== m - 1 ? " is-out" : ""}${day === t ? " is-today" : ""}${gap ? " is-gap" : ""}` },
        h("div", { class: "cell7__n" }, h("span", { text: String(dd.getDate()) }), gap ? h("small", { text: "Aucun court" }) : null),
        list.map((e) => evButton(e, { drag: true })),
      );
      if (day >= t) {
        cell.addEventListener("dragover", (ev) => {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = "move";
          cell.classList.add("is-drop");
        });
        cell.addEventListener("dragleave", (ev) => !cell.contains(ev.relatedTarget) && cell.classList.remove("is-drop"));
        cell.addEventListener("drop", (ev) => {
          ev.preventDefault();
          cell.classList.remove("is-drop");
          const d = find(ev.dataTransfer.getData("text/plain"));
          if (d && state.cal.dayOf.get(d.dir) !== day) setPlanned(d, day);
        });
      }
      grid.append(cell);
    }
    const shift = (n) => {
      const d = new Date(y, m - 1 + n, 1);
      state.month = `${d.getFullYear()}-${two(d.getMonth() + 1)}`;
      drawCalendrier();
    };
    const month = h(
      "div",
      { class: "month" },
      h(
        "div",
        { class: "month__nav" },
        h("h2", { text: `${MONTHS_LONG[m - 1]} ${y}` }),
        h("span", { class: "month__hint", text: "Glisse un film sur un autre jour pour changer sa date." }),
        h("button", { type: "button", class: "iconbtn", "aria-label": "Mois précédent", onclick: () => shift(-1) }, icon("left")),
        h("button", { type: "button", class: "btn btn--small", onclick: () => ((state.month = null), drawCalendrier()) }, "Aujourd'hui"),
        h("button", { type: "button", class: "iconbtn", "aria-label": "Mois suivant", onclick: () => shift(1) }, icon("right")),
      ),
      grid,
      legend(),
    );

    const unplaced = state.cal.unplaced;
    root.replaceChildren(
      vhead("Calendrier", sub, [], "calendrier"),
      agendaWrap,
      month,
      unplaced.length
        ? h(
            "section",
            {},
            sh("Sans date", "à placer toi-même"),
            h(
              "div",
              { class: "group" },
              unplaced.map((d) => h("label", { class: "row is-tap" }, h("span", { class: "row__ico" }, icon("calendar")), h("span", { class: "row__t" }, `${d.id} · ${d.title}`, h("small", { text: `${kindOf(d)}${d.ready ? " · prêt" : ` · ${wipWhy(d)}`}` })), h("span", { class: "row__v" }, h("b", { text: "Choisir un jour" }), icon("chev")), dateInput(d, null))),
            ),
          )
        : null,
      h("p", { class: "note" }, `La règle : un court par jour à ${HOUR}${SP}h ; les longs et les compilations le mardi, le jeudi et le samedi ; une promo le jour de son long. Une date proposée suit la file toute seule ; une date que tu fixes ne bouge plus.`),
    );
  }

  /* ---------------------------------------------------------------- Chiffres */

  function historyOf(platform) {
    const hist = (state.accounts && state.accounts.history) || {};
    return Object.keys(hist)
      .sort()
      .map((day) => ({ day, n: hist[day] && hist[day][platform] && hist[day][platform].abonnes, approx: Boolean(hist[day] && hist[day][platform] && hist[day][platform].approx) }))
      .filter((x) => Number.isFinite(x.n));
  }
  function nowOf(platform) {
    const live = state.accounts && state.accounts.accounts && state.accounts.accounts[platform];
    if (live && !live.error && Number.isFinite(live.followers)) return { n: live.followers, approx: Boolean(live.approx), live };
    const hist = historyOf(platform);
    const last = hist[hist.length - 1];
    return last ? { n: last.n, approx: last.approx, live, stale: last.day } : { n: null, approx: false, live };
  }
  function delta(platform, now) {
    const list = historyOf(platform).filter((x) => x.day < today());
    if (!list.length || !Number.isFinite(now)) return null;
    const weekAgo = addDays(today(), -7);
    const base = [...list].reverse().find((x) => x.day <= weekAgo) || list[0];
    const label = base.day <= weekAgo && base.day >= addDays(today(), -9) ? "en 7 jours" : `depuis le ${stamp(base.day, { time: false })}`;
    return { diff: now - base.n, label };
  }
  function deltaPill(dl) {
    if (!dl) return null;
    const sign = dl.diff > 0 ? "+" : dl.diff < 0 ? "−" : "±";
    return h("span", { class: `delta${dl.diff > 0 ? " is-up" : dl.diff < 0 ? " is-down" : ""}` }, `${sign}${fmt(Math.abs(dl.diff))} ${dl.label}`);
  }
  function spark(platform, now) {
    const pts = historyOf(platform).map((p) => ({ ...p }));
    if (Number.isFinite(now) && (!pts.length || pts[pts.length - 1].day !== today())) pts.push({ day: today(), n: now });
    if (pts.length < 2) return null;
    const t0 = parseDay(pts[0].day).getTime();
    const t1 = parseDay(pts[pts.length - 1].day).getTime();
    const lo = Math.min(...pts.map((p) => p.n));
    const hi = Math.max(...pts.map((p) => p.n));
    const X = (p) => (((parseDay(p.day).getTime() - t0) / (t1 - t0 || 1)) * 100).toFixed(2);
    const Y = (p) => (42 - ((p.n - lo) / (hi - lo || 1)) * 36).toFixed(2);
    const line = pts.map((p) => `${X(p)},${Y(p)}`).join(" ");
    const tpl = document.createElement("template");
    tpl.innerHTML = `<svg class="spark" viewBox="0 0 100 46" preserveAspectRatio="none" aria-hidden="true"><polygon class="area" points="0,46 ${line} 100,46"/><polyline class="line" points="${line}"/></svg>`;
    return tpl.content.firstChild;
  }

  function accountCard(p) {
    const known = (state.data.profile.accounts || {})[p.id] || {};
    const now = nowOf(p.id);
    const live = now.live;
    const facts = [];
    if (live && Number.isFinite(live.likes)) facts.push([h("b", { text: fmt(live.likes) }), " j'aime"]);
    if (live && Number.isFinite(live.videos)) facts.push([h("b", { text: String(live.videos) }), p.id === "instagram" ? " publications" : " vidéos"]);
    return h(
      "article",
      { class: "acct" },
      h(
        "div",
        { class: "acct__top" },
        h("span", { class: "acct__name", text: p.name }),
        h("span", { class: "acct__handle", text: known.handle ? (known.handle.startsWith("@") ? known.handle : `@${known.handle}`) : "" }),
        known.url ? h("a", { class: "iconbtn", href: known.url, target: "_blank", rel: "noopener", "aria-label": `Ouvrir ${p.name}`, title: `Ouvrir ${p.name}` }, icon("ext")) : null,
      ),
      h("div", { class: "acct__row" }, h("span", { class: "acct__n" }, now.n == null ? "–" : `${now.approx ? "≈ " : ""}${fmt(now.n)}`, h("small", { text: "abonnés" })), deltaPill(delta(p.id, now.n)) || (Number.isFinite(now.n) ? h("span", { class: "delta", text: "suivi depuis aujourd'hui" }) : null)),
      spark(p.id, now.n),
      facts.length ? h("p", { class: "acct__facts" }, facts.map((f) => h("span", {}, f))) : null,
      live && live.error ? h("p", { class: "acct__err", text: `Page muette (${live.error})${now.stale ? ` · chiffre du ${stamp(now.stale, { time: false })}` : ""}` }) : null,
      !state.accounts && !state.accountsFailed ? h("p", { class: "acct__wait", text: "Lecture du compte…" }) : null,
    );
  }

  function rank(items) {
    const top = Math.max(1, ...items.map((x) => x.n || 0));
    return h(
      "div",
      { class: "rank" },
      items.map((x) =>
        h(
          x.onclick ? "button" : "a",
          { class: "rk", type: x.onclick ? "button" : null, onclick: x.onclick || null, href: x.href || null, target: x.href ? "_blank" : null, rel: x.href ? "noopener" : null },
          h("span", { class: `rk__img${x.tall ? " rk__img--tall" : ""}` }, x.img ? h("img", { src: x.img, alt: "", loading: "lazy", decoding: "async" }) : null),
          h("span", { class: "rk__t" }, x.tag ? h("span", { class: "kicker", text: x.tag }) : null, x.title),
          h("span", { class: "rk__n", text: fmt(x.n) }),
          h("span", { class: "rk__bar" }, h("i", { style: `width:${Math.max(2, (100 * (x.n || 0)) / top).toFixed(1)}%` })),
          x.meta ? h("span", { class: "rk__m", text: x.meta }) : null,
        ),
      ),
    );
  }

  function ytLatestFor(d) {
    const latest = (state.accounts && state.accounts.accounts && state.accounts.accounts.youtube && state.accounts.accounts.youtube.latest) || [];
    const t = norm(d.post && d.post.youtube && d.post.youtube.title);
    return latest.find((v) => (d.views && d.views.youtubeId === v.id) || (t && norm(v.title) === t)) || null;
  }
  function viewsOf(d, platform) {
    if (platform === "youtube") {
      const live = ytLatestFor(d);
      if (live && Number.isFinite(live.views)) return { vues: live.views, date: "direct" };
    }
    return (d.views && d.views[platform]) || null;
  }

  function drawChiffres() {
    const root = $("#chiffres");
    if (!state.data) return;
    const acc = state.accounts;
    let total = 0;
    let approx = false;
    let some = 0;
    for (const p of PLATFORMS) {
      const now = nowOf(p.id);
      if (Number.isFinite(now.n)) {
        total += now.n;
        some++;
        approx = approx || now.approx;
      }
    }
    const refresh = h("button", { type: "button", class: `iconbtn${state.accountsBusy ? " is-spin" : ""}`, "aria-label": "Relire les comptes", title: "Relire les comptes", onclick: () => loadAccounts(true) }, icon("refresh"));
    const read = acc && acc.at ? new Date(acc.at) : null;
    const sub = state.accountsFailed ? [h("span", { class: "warn", text: "Comptes injoignables" }), " pour l'instant."] : read ? `Comptes lus à ${hhmm(read)}.` : "Lecture des comptes…";

    const shorts = all().filter((d) => !d.long);
    const tt = shorts.filter((d) => d.views && d.views.tiktok).map((d) => ({ d, v: d.views.tiktok }));
    const ttDate = tt.map((x) => x.v.date).sort().pop();
    const recent = all()
      .filter((d) => /^\d/.test(d.id) && firstPosted(d) && d.views && d.views.tiktok)
      .sort((a, b) => firstPosted(b).localeCompare(firstPosted(a)))
      .slice(0, 7);
    const sorted = recent.map((d) => d.views.tiktok.vues).sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor((sorted.length - 1) / 2)] : null;
    const ttBest = [...tt].sort((a, b) => b.v.vues - a.v.vues).slice(0, 6);
    const ig = shorts.filter((d) => d.views && d.views.instagram).map((d) => ({ d, v: d.views.instagram }));
    const igBest = [...ig].sort((a, b) => b.v.vues - a.v.vues).slice(0, 6);
    const igDate = ig.map((x) => x.v.date).sort().pop();
    const yt = (acc && acc.accounts && acc.accounts.youtube && acc.accounts.youtube.latest) || [];
    const dossierOfYt = (v) => all().find((d) => (d.views && d.views.youtubeId === v.id) || (norm(d.post && d.post.youtube && d.post.youtube.title) && norm(d.post.youtube.title) === norm(v.title)));
    const ago = (iso) => {
      const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
      return days <= 0 ? "aujourd'hui" : days === 1 ? "hier" : `il y a ${days}${SP}j`;
    };
    const filmRank = (list) =>
      rank(
        list.map(({ d, v }) => {
          const t = thumbOf(d);
          return { title: d.title, tag: d.id, n: v.vues, img: t ? fresh(t) : null, tall: !d.long, meta: Number.isFinite(v.likes) ? `${fmt(v.likes)} j'aime` : "", onclick: () => openSheet(d.dir) };
        }),
      );

    const profile = state.data.profile || {};
    const wasOpen = $("#chiffres details.fold") ? $("#chiffres details.fold").open : false;
    root.replaceChildren(
      vhead("Chiffres", sub, [refresh], "chiffres"),
      h("div", { class: "hero-n" }, h("div", { class: "hero-n__n", text: some ? `${approx ? "≈ " : ""}${fmt(total)}` : "…" }), h("div", { class: "hero-n__l" }, h("p", { text: "abonnés sur les trois comptes" }))),
      h("div", { class: "accts" }, PLATFORMS.map(accountCard)),
      h(
        "div",
        { class: "stats-cols" },
        h(
          "section",
          {},
          sh("YouTube · dernières vidéos", "en direct"),
          yt.length
            ? rank(
                yt.map((v) => {
                  const d = dossierOfYt(v);
                  return { title: v.title, tag: d ? d.id : null, n: v.views, img: `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/mqdefault.jpg`, meta: `${ago(v.published)}${Number.isFinite(v.likes) ? ` · ${fmt(v.likes)} j'aime` : ""}`, href: `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}` };
                }),
              )
            : h("p", { class: "hint", style: "padding:0 4px" }, state.accountsFailed ? "La chaîne ne répond pas pour l'instant." : "Lecture de la chaîne…"),
        ),
        h(
          "section",
          {},
          sh("TikTok · meilleurs films", ttDate ? `relevé du ${stamp(ttDate, { time: false })}` : ""),
          median != null ? h("p", { class: "hint", style: "padding:0 4px 10px" }, "Médiane des 7 derniers courts relevés : ", h("b", { text: `${fmt(median)} vues` }), ".") : null,
          ttBest.length ? filmRank(ttBest) : h("p", { class: "hint", style: "padding:0 4px" }, "Pas encore de relevé."),
          sh("Instagram · meilleurs films", igDate ? `relevé du ${stamp(igDate, { time: false })}` : ""),
          igBest.length ? filmRank(igBest) : h("p", { class: "hint", style: "padding:0 4px" }, "Pas encore de relevé."),
        ),
      ),
      h("p", { class: "note" }, "Les abonnés se lisent tout seuls sur les pages publiques (au plus tous les quarts d'heure) et se gardent jour par jour. Instagram et YouTube n'affichent qu'un arrondi, d'où le « ≈ ». Les vues film par film de TikTok et d'Instagram demandent ta connexion : elles viennent des relevés — demande-m'en un, ou envoie tes captures."),
      h(
        "details",
        { class: "fold", open: wasOpen ? true : null },
        h("summary", {}, "Profil · bios et photo", icon("down")),
        h(
          "div",
          { class: "profile" },
          profile.bio ? field("Bio TikTok", profile.bio) : null,
          profile.instagram ? field("Bio Instagram", profile.instagram) : null,
          profile.youtube ? field("Description de la chaîne YouTube", profile.youtube) : null,
          h("div", { class: "group" }, h("a", { class: "row", href: "/brand/avatar.png?dl=1", download: "avatar.png" }, h("span", { class: "row__ico" }, icon("image")), h("span", { class: "row__t", text: "Photo de profil" }), h("span", { class: "row__v" }, "PNG", icon("download")))),
        ),
      ),
    );
  }

  /* ---------------------------------------------------------------- Films */

  const FILTERS = [
    { id: "all", label: "Tous", test: () => true },
    { id: "todo", label: "À publier", test: (d) => d.ready && !fullyOnline(d) },
    { id: "done", label: "En ligne", test: (d) => onlineSomewhere(d) },
    { id: "wip", label: "En fabrication", test: (d) => !d.ready },
    { id: "long", label: "Longs", test: (d) => d.long || /^C\d/.test(d.id) },
  ];
  // « auto » : d'abord ce qui est à publier (le plus proche en tête), puis les sorties (la plus récente en tête), puis la fabrication
  const autoRank = (d) => {
    const posted = firstPosted(d);
    const day = state.cal.dayOf.get(d.dir) || "9999-99-99";
    if (d.ready && !fullyOnline(d)) return `0 ${onlineSomewhere(d) ? "0000" : day}`;
    if (posted || onlineSomewhere(d)) return `1 ${String(99999999 - Number((posted || "0000-00-00").replace(/-/g, "")))}`;
    return `2 ${day}`;
  };
  const SORTS = {
    auto: autoRank,
    film: (d) => d.id,
    date: (d) => firstPosted(d) || state.cal.dayOf.get(d.dir) || "",
    tiktok: (d) => (viewsOf(d, "tiktok") || {}).vues ?? -1,
    instagram: (d) => (viewsOf(d, "instagram") || {}).vues ?? -1,
    youtube: (d) => (viewsOf(d, "youtube") || {}).vues ?? -1,
  };

  let filmsBuilt = false;
  let searchInput = null;
  function drawFilms() {
    const root = $("#films");
    if (!filmsBuilt) {
      filmsBuilt = true;
      searchInput = h("input", { type: "search", placeholder: "Chercher un film : airbag, 031, L05…", autocomplete: "off", autocapitalize: "off", spellcheck: "false", enterkeyhint: "search", "aria-label": "Chercher un film" });
      const clear = h("button", { type: "button", class: "iconbtn", "aria-label": "Effacer la recherche", hidden: true }, icon("x"));
      const kbd = h("kbd", { class: "only-wide", text: "/", title: "Raccourci : /" });
      searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        clear.hidden = !searchInput.value;
        kbd.hidden = Boolean(searchInput.value);
        drawFilmsList();
      });
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          searchInput.value = "";
          searchInput.dispatchEvent(new Event("input"));
          searchInput.blur();
        }
      });
      clear.addEventListener("click", () => {
        searchInput.value = "";
        searchInput.dispatchEvent(new Event("input"));
        searchInput.focus();
      });
      root.replaceChildren(h("div", { id: "films-head" }), h("div", { class: "tools" }, h("div", { class: "search" }, icon("search"), searchInput, kbd, clear), h("div", { class: "segs", id: "film-segs", role: "group", "aria-label": "Filtrer" })), h("div", { id: "film-list" }));
    }
    const n = all().length;
    const on = all().filter(onlineSomewhere).length;
    const wip = all().filter((d) => !d.ready).length;
    $("#films-head").replaceChildren(vhead("Films", `${plural(n, "dossier")} · ${on} en ligne · ${wip} en fabrication`, [], "films"));
    drawFilmsList();
  }

  function cellFor(d, p) {
    if (!platformsOf(d).some((x) => x.id === p.id)) return h("span", { class: "cell" }, h("span", { class: "dash", text: "—" }));
    const v = viewsOf(d, p.id);
    return h("span", { class: "cell", title: v && v.date ? (v.date === "direct" ? "en direct" : `relevé du ${stamp(v.date, { time: false })}`) : "" }, v ? fmt(v.vues) : h("span", { class: "dash", text: isOn(d, p.id) ? "en ligne" : "" }), h("i", { class: isOn(d, p.id) ? "is-on" : "" }));
  }

  function dateCell(d) {
    const posted = firstPosted(d);
    if (posted) return h("span", { class: "t-date", text: dayLabel(posted) });
    const day = state.cal.dayOf.get(d.dir);
    if (!d.ready) return h("span", { class: "t-date is-wip", text: day ? `${cap(relDay(day))} · pas prêt` : "En fabrication" });
    if (day) return h("span", { class: "t-date is-plan", text: `Prévu ${relDay(day)}` });
    return h("span", { class: "t-date", text: onlineSomewhere(d) ? "En ligne" : "Sans date" });
  }

  function drawFilmsList() {
    const segs = $("#film-segs");
    const list = $("#film-list");
    if (!segs || !list || !state.data) return;
    const q = norm(state.query);
    const match = (d) => !q || norm(`${d.id} ${d.title} ${d.slug} ${kindOf(d)}`).includes(q);
    segs.replaceChildren(
      ...FILTERS.map((f) =>
        h(
          "button",
          {
            type: "button",
            class: "seg",
            "aria-pressed": String(state.filter === f.id),
            onclick: () => {
              state.filter = f.id;
              mem.set("filter", f.id);
              drawFilmsList();
            },
          },
          f.label,
          h("b", { text: String(all().filter(f.test).length) }),
        ),
      ),
    );
    const filter = FILTERS.find((f) => f.id === state.filter) || FILTERS[0];
    const { key: sk, dir } = state.sort;
    const val = SORTS[sk] || SORTS.date;
    const films = all()
      .filter((d) => filter.test(d) && match(d))
      .sort((a, b) => {
        const x = val(a);
        const y = val(b);
        const c = typeof x === "number" ? x - y : String(x).localeCompare(String(y), "fr", { numeric: true });
        return c * dir || b.id.localeCompare(a.id, "fr", { numeric: true });
      });
    if (!films.length) return list.replaceChildren(h("div", { class: "empty" }, h("b", { text: "Aucun film" }), q ? `Rien ne correspond à « ${state.query} ».` : "Rien dans ce filtre."));

    const th = (k, label, right = false) =>
      h(
        "th",
        { class: right ? "r" : null, "aria-sort": sk === k ? (dir > 0 ? "ascending" : "descending") : null },
        h(
          "button",
          {
            type: "button",
            class: sk === k ? "is-sorted" : null,
            onclick: () => {
              state.sort = { key: k, dir: sk === k ? -dir : k === "film" ? 1 : -1 };
              mem.set("sort2", state.sort);
              drawFilmsList();
            },
          },
          right ? icon(sk === k && dir > 0 ? "up" : "arrowdown") : null,
          label,
          right ? null : icon(sk === k && dir > 0 ? "up" : "arrowdown"),
        ),
      );
    const table = h(
      "table",
      { class: "table only-wide" },
      h("thead", {}, h("tr", {}, h("th", { style: "width:58px" }), th("film", "Film"), th("date", "Sortie"), PLATFORMS.map((p) => th(p.id, p.name, true)))),
      h(
        "tbody",
        {},
        films.map((d) => {
          const tr = h(
            "tr",
            { tabindex: "0", "aria-label": `${d.id} ${d.title}` },
            h("td", {}, thumb(d)),
            h("td", {}, h("div", { class: "t-title", text: d.title }), h("div", { class: "t-sub", text: `${kindOf(d)} ${d.id}` })),
            h("td", {}, dateCell(d)),
            PLATFORMS.map((p) => h("td", { class: "r" }, cellFor(d, p))),
          );
          tr.addEventListener("click", () => openSheet(d.dir));
          tr.addEventListener("keydown", (e) => e.key === "Enter" && openSheet(d.dir));
          return tr;
        }),
      ),
    );
    const rows = h(
      "div",
      { class: "list frows only-narrow" },
      films.map((d) => {
        const posted = firstPosted(d);
        const day = state.cal.dayOf.get(d.dir);
        const kicker = [d.id, posted ? ` · ${stamp(posted, { time: false })}` : !d.ready ? h("span", { class: "warn", text: " · en fabrication" }) : day ? h("em", { text: ` · prévu ${relDay(day)}` }) : ""];
        return h(
          "button",
          { type: "button", class: "item", onclick: () => openSheet(d.dir) },
          thumb(d),
          h(
            "span",
            { class: "item__body" },
            h("span", { class: "kicker" }, kicker),
            h("span", { class: "item__t", text: d.title }),
            h(
              "span",
              { class: "frow__nums" },
              platformsOf(d).map((p) => {
                const v = viewsOf(d, p.id);
                return h("span", {}, h("i", { class: isOn(d, p.id) ? "is-on" : "" }), p.short, v ? h("b", { text: fmt(v.vues) }) : null);
              }),
            ),
          ),
          h("span", { class: "item__end" }, icon("chev")),
        );
      }),
    );
    list.replaceChildren(table, rows);
  }

  /* ---------------------------------------------------------------- squelette de chargement */

  function skeleton() {
    $("#publier").replaceChildren(
      h("div", { class: "vhead" }, h("div", { class: "skel", style: "width:180px;height:40px" })),
      h("div", { class: "film" }, h("div", { class: "skel", style: "height:220px" }), h("div", { class: "skel", style: "height:320px" })),
    );
  }

  /* ---------------------------------------------------------------- clavier (PC) */

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (typing || viewer.open) return;
    if (/^[1-4]$/.test(e.key)) {
      if (state.sheet) closeSheet();
      go(TABS[Number(e.key) - 1]);
    } else if (e.key === "/" && !state.sheet) {
      e.preventDefault();
      go("films", { top: false });
      setTimeout(() => searchInput && searchInput.focus(), 0);
    } else if (e.key.toLowerCase() === "r" && !state.sheet) load();
  });

  /* ---------------------------------------------------------------- départ */

  const film = /^#film\/(.+)$/.exec(location.hash);
  const startTab = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : mem.get("tab", "publier");
  go(film ? "publier" : startTab, { top: false });
  window.addEventListener("hashchange", () => {
    const tab = location.hash.slice(1);
    if (TABS.includes(tab) && tab !== state.tab) go(tab);
  });
  skeleton();
  paintSync();
  load().then(() => {
    if (film) openSheet(decodeURIComponent(film[1]), { push: false });
    if (state.tab === "chiffres") loadAccounts();
    else setTimeout(() => loadAccounts(), 1200);
  });

  // la page relit le disque du PC toute seule tant qu'elle est à l'écran
  setInterval(() => document.visibilityState === "visible" && load(), 8000);
  setInterval(() => document.visibilityState === "visible" && loadAccounts(), 15 * 60 * 1000);
  setInterval(() => state.tab === "publier" && !state.sheet && tickPublierHead(), 30 * 1000);
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && load());
})();
