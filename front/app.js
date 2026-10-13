// Système Décodé — bureau de publication.
// Plain script, no build step. An index of the dossiers (to post, posted, in the making) and one
// sheet at a time: the phone shows one or the other, a wide screen both side by side.
// The PC says what is on disk and what is online (/api/dossiers); a tick goes back to it
// (/api/publication/<dossier>), so the phone and the computer tell the same story. This device
// only remembers its own conveniences: the tab it was on, the reminders it ticked.
(() => {
  "use strict";

  const MEM_KEY = "sd.front.v2";
  const OLD_KEY = "sd.front.v1"; // the desk before this one: a switch per dossier, kept by each phone for itself
  const SP = String.fromCharCode(160); // non-breaking space (U+00A0): French punctuation wants one
  const WIDE = window.matchMedia("(min-width: 960px)"); // index and sheet side by side (the same number as in app.css)

  const PLATFORMS = [
    { id: "tiktok", name: "TikTok", short: "TT" },
    { id: "instagram", name: "Instagram", short: "IG" },
    { id: "youtube", name: "YouTube", short: "YT" },
  ];

  // TikTok's settings that are easy to forget, in the order they come up
  const STEPS = [
    { id: "photos", label: "Vidéo dans Photos" },
    { id: "cover", label: "Couverture importée" },
    { id: "caption", label: "Légende collée" },
    { id: "ai", label: `«${SP}Contenu généré par l'IA${SP}»` },
    { id: "hd", label: `«${SP}Importer en HD${SP}»` },
    { id: "live", label: "Commentaire épinglé" },
  ];

  const FILTERS = [
    { id: "todo", label: "À poster", none: ["Rien à poster", "Tout ce qui est rendu est en ligne partout."] },
    { id: "done", label: "Postés", none: ["Rien de classé", "Un dossier arrive ici quand ses trois cases sont cochées."] },
    { id: "wip", label: "En cours", none: ["Rien en cours", ""] },
  ];

  const $ = (selector) => document.querySelector(selector);

  /* ---------------------------------------------------------------- small tools */

  /** h("a", { class: "btn", href }, child, …) — text is always set as text, never parsed as HTML. */
  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  const oneDecimal = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  /** Sizes the way iOS shows them (1 Mo = 1 000 000 octets), so they match the download bar. */
  function size(bytes) {
    if (bytes >= 1e8) return `${Math.round(bytes / 1e6)}${SP}Mo`;
    if (bytes >= 1e6) return `${oneDecimal.format(bytes / 1e6)}${SP}Mo`;
    return `${Math.max(1, Math.round(bytes / 1e3))}${SP}Ko`;
  }

  const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  const two = (n) => String(n).padStart(2, "0");
  function when(ms) {
    const d = new Date(ms);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} à ${two(d.getHours())}:${two(d.getMinutes())}`;
  }
  /** "9 oct." out of a date the PC keeps ("2026-10-09T18:22"); nothing when it only knows "online". */
  function day(value) {
    const m = /^\d{4}-(\d\d)-(\d\d)/.exec(typeof value === "string" ? value : "");
    return m ? `${Number(m[2])} ${MONTHS[Number(m[1]) - 1]}` : "";
  }

  // a new render keeps its file name: the modification time in the URL keeps images and video fresh
  const fresh = (file) => `${file.url}?v=${file.mtime}`;
  const link = (dir) => `#${encodeURIComponent(dir)}`;

  const live = $("#live");
  function announce(message) {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = message));
  }

  /** A line that comes and goes above the ticks: what a tick just did, or why it did not. */
  const flashEl = $("#flash");
  function flash(message, ok = true) {
    clearTimeout(flashEl.timer);
    flashEl.textContent = message;
    flashEl.classList.toggle("is-failed", !ok);
    flashEl.hidden = false;
    flashEl.timer = setTimeout(() => (flashEl.hidden = true), ok ? 2600 : 5200);
    announce(message);
  }

  /* ---------------------------------------------------------------- what this device remembers */

  const mem = {
    data: null,
    all() {
      if (this.data) return this.data;
      const read = (key) => {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          return value && typeof value === "object" ? value : null;
        } catch {
          return null;
        }
      };
      let data = read(MEM_KEY);
      if (!data) {
        // First visit of the new desk: what the old one kept here is carried over — its reminders, and
        // its "posted" switches, which become the three ticks (handOver() then gives them to the PC).
        data = { checks: {}, posted: {} };
        for (const [dir, was] of Object.entries(read(OLD_KEY) || {})) {
          if (was && was.checks && typeof was.checks === "object") data.checks[dir] = was.checks;
          if (was && was.posted === true) data.posted[dir] = Object.fromEntries(PLATFORMS.map((p) => [p.id, true]));
        }
      }
      if (!data.checks || typeof data.checks !== "object") data.checks = {};
      if (!data.posted || typeof data.posted !== "object") data.posted = {};
      return (this.data = data);
    },
    save() {
      try {
        localStorage.setItem(MEM_KEY, JSON.stringify(this.data));
      } catch {
        // private browsing: kept for this visit only
      }
    },
  };

  /* ---------------------------------------------------------------- copy */

  /**
   * Copy without the Clipboard API. The page is opened as http://192.168.x.x, which is not a
   * secure context, so navigator.clipboard does not exist on the phone. A read-only textarea
   * (no keyboard) is selected with setSelectionRange — iOS ignores select() alone — and
   * execCommand does the rest. It has to run inside the tap itself.
   */
  function copyFallback(text) {
    const before = document.activeElement;
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.setAttribute("aria-hidden", "true");
    area.tabIndex = -1;
    // Fixed at the top so focusing it never scrolls the page; it keeps a real size (WebKit will not
    // select inside a box with no height) and a 16px font (below that, iOS zooms in on focus).
    area.style.cssText = "position:fixed;top:0;left:-999em;width:2em;height:2em;margin:0;padding:0;border:0;opacity:0;font-size:16px;";
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
    if (before && typeof before.focus === "function") before.focus({ preventScroll: true });
    return done;
  }

  async function copyText(text) {
    if (window.isSecureContext && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // refused (permission, focus): the old way may still work
      }
    }
    return copyFallback(text);
  }

  /** Swap a button's label for a verdict, then put it back. */
  function verdict(button, ok, message, ms) {
    const label = button.firstElementChild || button;
    button.dataset.label = button.dataset.label || label.textContent;
    clearTimeout(button.timer);
    label.textContent = message;
    button.classList.toggle("is-done", ok);
    button.classList.toggle("is-failed", !ok);
    button.timer = setTimeout(() => {
      label.textContent = button.dataset.label;
      button.classList.remove("is-done", "is-failed");
    }, ms);
  }

  /** `source` is the on-page element that shows the same words: selected for a manual copy if all else fails. */
  function copyButton(label, text, { primary = false, source = null } = {}) {
    const button = h("button", { type: "button", class: primary ? "btn btn--primary" : "btn" }, h("span", { text: label }));
    button.addEventListener("click", () => {
      copyText(text).then((ok) => {
        verdict(button, ok, ok ? "Copié" : "Copie refusée", ok ? 1600 : 3600);
        announce(ok ? "Copié dans le presse-papiers." : "Copie refusée : le texte est sélectionné, copie-le à la main.");
        if (!ok && source) getSelection().selectAllChildren(source);
      });
    });
    return button;
  }

  /* ---------------------------------------------------------------- share (HTTPS only) */

  // Never true on the phone over plain HTTP: the button simply does not exist there.
  const canShareVideo = (() => {
    if (!window.isSecureContext || typeof navigator.canShare !== "function" || typeof navigator.share !== "function") return false;
    try {
      return navigator.canShare({ files: [new File([""], "video.mp4", { type: "video/mp4" })] });
    } catch {
      return false;
    }
  })();

  function shareButton(d) {
    const label = "Partager la vidéo";
    const text = h("span", { text: label });
    const button = h("button", { type: "button", class: "btn" }, text);
    let file = null;
    let busy = false;
    const fail = (message) => {
      text.textContent = label; // what verdict() puts back afterwards
      verdict(button, false, message, 3600);
    };
    const open = async () => {
      try {
        await navigator.share({ files: [file], title: d.title });
        text.textContent = label;
      } catch (err) {
        // the tap "expired" while the file was coming down: it is ready now, a second tap shares it
        if (err && err.name === "NotAllowedError") text.textContent = "Vidéo prête : touche pour partager";
        else if (err && err.name === "AbortError") text.textContent = label;
        else fail("Partage refusé");
      }
    };
    button.addEventListener("click", async () => {
      if (busy) return;
      if (file) return open();
      busy = true;
      text.textContent = "Préparation…";
      try {
        const res = await fetch(d.files.video.url);
        if (!res.ok) throw new Error(String(res.status));
        file = new File([await res.blob()], `${d.dir}.mp4`, { type: "video/mp4" });
      } catch {
        busy = false;
        return fail("Vidéo injoignable");
      }
      busy = false;
      open();
    });
    return button;
  }

  /* ---------------------------------------------------------------- the cover and the film, whole */

  const viewer = $("#viewer");
  const stage = $("#viewer-stage");
  const canView = typeof viewer.showModal === "function"; // older Safari: the links open the files themselves

  function view(event, tag, node, hint) {
    if (!canView) return false;
    event.preventDefault();
    stage.replaceChildren(node);
    $("#viewer-tag").textContent = tag;
    $("#viewer-hint").textContent = hint;
    viewer.showModal();
    return true;
  }
  function openCover(event, d) {
    view(event, `Couverture · Dossier ${d.id}`, h("img", { src: fresh(d.files.cover), alt: `Couverture du dossier ${d.id}, ${d.title}` }), "Appui long sur l'image pour l'enregistrer dans Photos.");
  }
  function openFilm(event, d, film) {
    const video = h("video", { controls: true, playsinline: true, src: fresh(film.file), poster: d.files.cover && fresh(d.files.cover), "aria-label": `Film du dossier ${d.id}` });
    if (view(event, `${film.mute ? "Aperçu muet" : "Film"} · Dossier ${d.id}`, video, film.note)) video.play().catch(() => {}); // inside the tap: it starts with its sound
  }
  const quiet = (root) => {
    for (const video of root.querySelectorAll("video")) video.pause(); // a film taken off the page would go on talking
  };
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target.closest("[data-close]")) viewer.close();
  });
  viewer.addEventListener("close", () => {
    for (const video of stage.querySelectorAll("video")) {
      video.pause();
      video.removeAttribute("src"); // …and would go on downloading
      video.load();
    }
    stage.replaceChildren();
  });

  /** What the page plays for a dossier: a lighter copy when it is the same render, else the file itself. */
  function filmOf(d) {
    const { video, phone, preview, mute } = d.files;
    if (video) {
      const light = [phone, preview].find((file) => file && file.mtime >= video.mtime);
      return light
        ? { file: light, note: `Copie allégée (${size(light.bytes)}). Le fichier à poster, c'est la HD.` }
        : { file: video, note: `Lecture du fichier HD (${size(video.bytes)}).` };
    }
    return mute ? { file: mute, mute: true, note: `Aperçu muet (${size(mute.bytes)}) : la voix n'est pas encore posée.` } : null;
  }

  /* ---------------------------------------------------------------- where a dossier stands */

  const state = {
    raw: "", // the last answer of the PC, as it came: the page is only redrawn when the disk has changed
    data: null,
    filter: mem.all().filter || "todo",
    groups: { todo: [], done: [], wip: [] },
    order: [], // the dossiers of the list on screen, top to bottom
    sheet: null, // { id, key, el, paint?, advance? }
    tab: { dir: "", platform: "" }, // the platform whose words are open, as long as the dossier stays the same
    listY: 0,
    fromList: false,
    started: false,
  };

  const find = (dir) => state.data.dossiers.find((d) => d.dir === dir) || null;
  /** Does the PC keep the ticks? A desk started before this page was written does not: this device keeps them meanwhile. */
  const keeps = () => !state.data.dossiers.some((d) => d.posted === undefined);
  const postedOn = (d) => d.posted || mem.all().posted[d.dir] || {};
  const online = (d) => PLATFORMS.filter((p) => postedOn(d)[p.id]);
  const waiting = (d) => PLATFORMS.filter((p) => !postedOn(d)[p.id]);
  const bucket = (d) => (!d.ready ? "wip" : waiting(d).length === 0 ? "done" : "todo");
  const names = (list) => list.map((p) => p.name).join(", ");

  /**
   * Tick or untick one platform of one dossier. Shown at once, then confirmed by the PC, which
   * answers with the whole desk as it now stands; if it does not answer, the tick is taken back.
   */
  async function setPosted(dir, platform, on) {
    const d = find(dir);
    const which = platform ? [PLATFORMS.find((p) => p.id === platform)] : waiting(d); // no platform named: all those still waiting
    const patch = (value) => Object.fromEntries(which.map((p) => [p.id, value]));
    const said = () => {
      const now = find(dir);
      if (!on) return `${names(which)} décoché.`;
      const left = waiting(now);
      return left.length === 0 ? `Dossier ${now.id} : en ligne partout.` : `${names(which)} coché. Reste : ${names(left)}.`;
    };
    if (!keeps()) {
      mem.all().posted[dir] = { ...postedOn(d), ...patch(on) };
      mem.save();
      render();
      if (on && state.sheet && state.sheet.advance) state.sheet.advance(platform);
      return flash(said());
    }
    const before = d.posted;
    d.posted = { ...before, ...patch(on) };
    render();
    try {
      const res = await fetch(`/api/publication/${encodeURIComponent(dir)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch(!on ? false : platform ? "now" : true)), // one tick is a film that just went up; all at once is a filing
      });
      if (!res.ok) throw new Error(String(res.status));
      take(await res.text());
      setLink(true);
      if (on && state.sheet && state.sheet.advance) state.sheet.advance(platform);
      flash(said());
    } catch {
      const now = find(dir);
      if (now) now.posted = before;
      render();
      flash("Le PC n'a pas répondu : la case n'est pas enregistrée.", false);
    }
  }

  /** Ticks this device kept for itself (the old desk, or a PC that could not keep them yet): given to the PC, once. */
  let handing = false;
  async function handOver() {
    const local = mem.all().posted;
    if (handing || !keeps() || Object.keys(local).length === 0) return;
    handing = true;
    try {
      for (const [dir, was] of Object.entries(local)) {
        const d = find(dir);
        const ask = {};
        if (d && was) for (const p of PLATFORMS) if (was[p.id] === true && !d.posted[p.id]) ask[p.id] = true; // online, since nobody knows when: no date
        if (Object.keys(ask).length > 0) {
          const res = await fetch(`/api/publication/${encodeURIComponent(dir)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ask) });
          if (!res.ok) return; // next visit
          take(await res.text());
        }
        delete local[dir];
        mem.save();
      }
    } catch {
      // next visit
    } finally {
      handing = false;
    }
  }

  /* ---------------------------------------------------------------- the index */

  const desk = $("#desk");
  const filters = $("#filters");
  const rows = $("#rows");

  /** A sheet is being opened from the list: remember where the list was, it comes back there. */
  function leaveList() {
    state.listY = window.scrollY;
    state.fromList = true;
  }
  $("#to-profil").addEventListener("click", leaveList);

  function row(d, next) {
    const posted = postedOn(d);
    const thumb = d.files.thumb || d.files.cover;
    const left = waiting(d);
    const stands = !d.ready
      ? d.voiced ? "rendu manquant" : "sans voix"
      : left.length === 0 ? "en ligne partout" : left.length === PLATFORMS.length ? "à poster" : `en ligne sur ${names(online(d))}, reste ${names(left)}`;
    const a = h(
      "a",
      { class: "row", href: link(d.dir), "data-dir": d.dir, "aria-label": `Dossier ${d.id}, ${d.title} : ${stands}` },
      h("span", { class: thumb ? "row__thumb" : "row__thumb row__thumb--none" }, thumb && h("img", { src: fresh(thumb), alt: "", width: "360", height: "640", loading: "lazy", decoding: "async" })),
      h(
        "span",
        { class: "row__body" },
        h("span", { class: "row__top" }, h("b", { text: d.id }), next && h("em", { text: "Suivant" })),
        h("span", { class: "row__title", text: d.title }),
        d.ready
          ? h(
              "span",
              { class: "row__state" },
              h("span", { class: "pips" }, PLATFORMS.map((p) => h("i", { class: posted[p.id] ? "pip is-on" : "pip", text: p.short }))),
              left.length === 0 && day(posted.tiktok) && h("span", { class: "row__meta", text: day(posted.tiktok) }),
            )
          : h("span", { class: "row__state" }, h("span", { class: "chip chip--missing" }, h("i", {}), d.voiced ? "Rendu manquant" : "Sans voix")),
      ),
      h("i", { class: "row__go" }),
    );
    a.addEventListener("click", leaveList);
    return h("li", {}, a);
  }

  function drawIndex() {
    const groups = { todo: [], done: [], wip: [] };
    for (const d of state.data.dossiers) groups[bucket(d)].push(d); // newest first, as the PC lists them…
    groups.todo.reverse(); // …but the next one to post is the oldest still waiting
    groups.wip.reverse();
    if (!groups[state.filter] || (state.filter === "wip" && groups.wip.length === 0)) state.filter = "todo";
    state.groups = groups;
    state.order = groups[state.filter].map((d) => d.dir);

    filters.replaceChildren(
      ...FILTERS.filter((f) => f.id !== "wip" || groups.wip.length > 0).map((f) => {
        const button = h("button", { type: "button", class: "seg", "aria-pressed": String(f.id === state.filter) }, h("span", { text: f.label }), h("b", { text: String(groups[f.id].length) }));
        button.addEventListener("click", () => {
          if (f.id === state.filter) return;
          state.filter = f.id;
          mem.all().filter = f.id;
          mem.save();
          // on a wide screen the sheet follows the list: it shows the first dossier of the new one
          if (location.hash.length > 1) history.replaceState(null, "", location.pathname + location.search);
          drawIndex();
          route();
          $("#index").scrollTop = 0;
        });
        return button;
      }),
    );
    const list = groups[state.filter];
    const { none } = FILTERS.find((f) => f.id === state.filter);
    rows.replaceChildren(
      ...(state.data.dossiers.length === 0
        ? [h("li", { class: "state" }, h("b", { text: "Aucun dossier" }), "Le premier épisode créé sur le PC apparaîtra ici.")]
        : list.length > 0
          ? list.map((d, i) => row(d, state.filter === "todo" && i === 0))
          : [h("li", { class: "state" }, h("b", { text: none[0] }), none[1])]),
    );
  }

  /* ---------------------------------------------------------------- one dossier */

  function block(title, aside, ...kids) {
    return h("section", { class: "block" }, h("h3", { class: "block__h" }, h("i", {}), h("span", { text: title }), aside), ...kids);
  }
  // number the blocks like the acts of a film: 01 LÉGENDE · 02 COMMENTAIRE · …
  const numbered = (blocks) => {
    blocks.forEach((el, i) => (el.querySelector(".block__h i").textContent = two(i + 1)));
    return blocks;
  };
  const toWrite = (what) => h("p", { class: "note" }, `${what} : à écrire dans episode.json (`, h("code", { text: "node scripts/posts.mjs" }), ").");

  /** The words of one platform, each with its copy button. */
  function wordsFor(platform, d) {
    const post = d.post || {};
    if (platform === "tiktok") {
      const { caption, hashtags = [], pinned } = post;
      const tags = hashtags.join(" ");
      const blocks = [];
      if (caption || tags) {
        const words = caption && h("p", { text: caption });
        const marks = tags && h("p", { class: "quote__tags", text: tags });
        const quote = h("div", { class: "quote" }, words, marks);
        blocks.push(
          block(
            "Légende",
            null,
            quote,
            caption && tags
              ? [
                  copyButton("Copier légende + hashtags", `${caption}\n\n${tags}`, { primary: true, source: quote }),
                  h("div", { class: "pair" }, copyButton("La légende", caption, { source: words }), copyButton("Les hashtags", tags, { source: marks })),
                ]
              : copyButton(caption ? "Copier la légende" : "Copier les hashtags", caption || tags, { primary: true, source: quote }),
          ),
        );
      } else {
        blocks.push(block("Légende", null, toWrite("Légende et hashtags")));
      }
      if (pinned) {
        const quote = h("div", { class: "quote" }, h("p", { text: pinned }));
        blocks.push(block("Commentaire à épingler", null, quote, copyButton("Copier le commentaire", pinned, { source: quote })));
      }
      // TikTok's settings, ticked as they are done: kept on this device, they are nobody else's business
      const count = h("small", {});
      const checks = () => mem.all().checks[d.dir] || {};
      const paint = () => (count.textContent = `${STEPS.filter((step) => checks()[step.id]).length}/${STEPS.length}`);
      paint();
      blocks.push(
        block(
          "Avant de publier",
          count,
          h(
            "ul",
            { class: "memos" },
            STEPS.map((step, i) => {
              const input = h("input", { type: "checkbox" });
              input.checked = checks()[step.id] === true;
              input.addEventListener("change", () => {
                mem.all().checks[d.dir] = { ...checks(), [step.id]: input.checked };
                mem.save();
                paint();
              });
              return h("li", {}, h("label", { class: "memo" }, input, h("span", { class: "memo__box", "aria-hidden": "true", text: String(i + 1) }), h("span", { class: "memo__t", text: step.label })));
            }),
          ),
        ),
      );
      return numbered(blocks);
    }
    if (platform === "instagram") {
      const { caption, hashtags = [] } = post.instagram || {};
      if (!caption) return numbered([block("Légende", null, toWrite("Légende Instagram"))]);
      const tags = hashtags.join(" ");
      const quote = h("div", { class: "quote" }, h("p", { text: caption }), tags && h("p", { class: "quote__tags", text: tags }));
      return numbered([block("Légende", null, quote, copyButton("Copier légende + hashtags", tags ? `${caption}\n\n${tags}` : caption, { primary: true, source: quote }))]);
    }
    const { title, description, hashtags = [] } = post.youtube || {};
    if (!title) return numbered([block("Titre", null, toWrite("Titre et description YouTube"))]);
    const tags = hashtags.join(" ");
    const head = h("div", { class: "quote" }, h("p", { text: title }));
    const quote = h("div", { class: "quote" }, h("p", { text: description }), tags && h("p", { class: "quote__tags", text: tags }));
    return numbered([
      block("Titre", h("small", { text: `${title.length} caractères sur 100` }), head, copyButton("Copier le titre", title, { primary: true, source: head })),
      block("Description", null, quote, copyButton("Copier description + hashtags", tags ? `${description}\n\n${tags}` : description, { source: quote })),
    ]);
  }

  /** The bar at the top of a sheet: back to the list (phone), and the dossier before and after in that list. */
  function sheetBar(id) {
    const back = h("a", { class: "textbtn sheet__back", href: "#" }, h("i", { class: "sheet__chev" }), "Dossiers");
    back.addEventListener("click", (event) => {
      event.preventDefault();
      // opened from the list: going back there also brings its scroll back; opened straight on a dossier: the list replaces it
      if (state.fromList) history.back();
      else location.replace("#");
    });
    const pos = h("span", { class: "sheet__pos" });
    const step = (label, glyph) => {
      const a = h("a", { class: "step", "aria-label": label, text: glyph });
      a.addEventListener("click", (event) => {
        event.preventDefault();
        if (a.hasAttribute("href")) location.replace(a.getAttribute("href")); // along the list without piling up pages behind "back"
      });
      return a;
    };
    const prev = step("Dossier précédent de la liste", "‹");
    const next = step("Dossier suivant de la liste", "›");
    const aim = (a, dir) => {
      if (dir) a.setAttribute("href", link(dir));
      else a.removeAttribute("href");
      a.setAttribute("aria-disabled", String(!dir));
    };
    const paint = () => {
      const i = state.order.indexOf(id);
      pos.textContent = i >= 0 ? `${i + 1}/${state.order.length}` : "";
      aim(prev, i > 0 ? state.order[i - 1] : null);
      aim(next, i >= 0 ? state.order[i + 1] : state.order[0]); // no longer in this list (just filed): on to its first
    };
    const along = id !== "profil"; // the account is not a dossier of the list: only the way back
    return { el: h("nav", { class: "sheet__bar", "aria-label": along ? "D'un dossier à l'autre" : "Retour" }, back, along && [pos, prev, next]), paint };
  }

  function dossierSheet(d) {
    const { video, cover } = d.files;
    const thumb = d.files.thumb || cover;
    const film = filmOf(d);
    const key = d.dir.replace(/[^\w-]/g, "_"); // ids must not contain spaces
    const headingId = `dossier-${key}`;
    const bar = sheetBar(d.dir);

    /* who it is: the cover as the grid shows it, its number, where it stands */
    const chip = h("p", {});
    let face;
    if (cover) {
      face = h(
        "a",
        { class: "sheet__cover", href: fresh(cover), "aria-label": `Voir la couverture du dossier ${d.id} en entier` },
        h("img", { src: fresh(thumb), alt: "", width: "360", height: "640", decoding: "async" }),
        h("i", { class: "sheet__zoom" }),
      );
      face.addEventListener("click", (event) => openCover(event, d));
    } else {
      face = h("div", { class: "sheet__cover sheet__cover--none", role: "img", "aria-label": "Pas encore de couverture" });
    }
    // The listening booth, when the voice was comped out of several recordings.
    const booth = d.booth && h("a", { class: "textbtn", href: `/voix.html?ep=${encodeURIComponent(d.dir)}`, "aria-label": `Voix du dossier ${d.id} : la cabine de doublage`, text: "Voix" });
    const head = h(
      "header",
      { class: "sheet__head" },
      face,
      h(
        "div",
        { class: "sheet__id" },
        h("div", { class: "sheet__top" }, h("p", { class: "tag" }, h("i", { class: "dot" }), h("span", { text: `Dossier ${d.id}` })), booth),
        h("h2", { class: "sheet__title", id: headingId, text: d.title }),
        h("div", { class: "sheet__foot" }, chip, video && h("small", { class: "sheet__meta", text: `rendu le ${when(video.mtime)}` })),
      ),
    );

    /* online: one tick per platform — under the thumb on a phone, beside the title on a wide screen */
    const ticks = PLATFORMS.map((p) => {
      const button = h("button", { type: "button", class: "tick", "aria-pressed": "false" }, h("i", { "aria-hidden": "true" }), h("span", { text: p.name }));
      button.addEventListener("click", () => setPosted(d.dir, p.id, button.getAttribute("aria-pressed") !== "true"));
      return button;
    });
    // already online everywhere (a dossier posted before this desk kept count): the three at once, and no date is made up
    const all = h("button", { type: "button", class: "textbtn ticks__all", text: "Tout cocher" });
    all.addEventListener("click", () => setPosted(d.dir, null, true));
    const tickBar =
      d.ready && h("div", { class: "ticks", role: "group", "aria-label": "En ligne sur" }, h("div", { class: "ticks__k" }, h("span", { text: "En ligne sur" }), all), h("div", { class: "ticks__row" }, ticks));

    /* the files */
    const absent = (what, command) => h("div", { class: "absent" }, h("b", { text: what }), h("code", { text: command }));
    const play = film && h("a", { class: "btn film__play", href: fresh(film.file) }, h("i", { class: "film__tri" }), h("span", { text: film.mute ? "Voir l'aperçu" : "Voir le film" }));
    if (play) play.addEventListener("click", (event) => openFilm(event, d, film));
    const files = h(
      "section",
      { class: "film", "aria-label": "Le film et sa couverture" },
      film &&
        h(
          "video",
          { class: "player", controls: true, playsinline: true, preload: "none", poster: cover && fresh(cover), "aria-label": `Film du dossier ${d.id}` },
          h("source", { src: fresh(film.file), type: "video/mp4" }),
        ),
      film && h("p", { class: "note film__note", text: film.note }),
      video
        ? h(
            "a",
            { class: "btn btn--primary btn--split", href: `${video.url}?dl=1`, download: `${d.dir}.mp4` },
            h("span", { text: "Télécharger la vidéo HD" }),
            h("span", { class: "btn__data", text: size(video.bytes) }),
          )
        : absent(d.voiced ? "Vidéo HD pas encore rendue" : "Pas encore de voix, pas de vidéo HD", d.voiced ? `npm run render -- ${d.id}` : `npm run voice -- ${d.id}`),
      h(
        "div",
        { class: "pair film__pair" },
        play,
        cover &&
          h("a", { class: "btn btn--split", href: `${cover.url}?dl=1`, download: `${d.dir}-couverture.png` }, h("span", { text: "Couverture" }), h("span", { class: "btn__data", text: size(cover.bytes) })),
      ),
      !cover && absent("Couverture pas encore faite", `npm run cover -- ${d.id}`),
      video && canShareVideo && shareButton(d),
      (!video || !cover) && h("p", { class: "note", text: "À lancer sur le PC : la page se met à jour toute seule." }),
      video && h("p", { class: "note film__how", text: `iPhone : la vidéo arrive dans Fichiers. Ouvre-la, Partager, «${SP}Enregistrer la vidéo${SP}».` }),
    );

    /* the words: one platform at a time */
    const panels = {};
    const tabs = PLATFORMS.map((p) => {
      const tab = h("button", { type: "button", class: "seg", role: "tab", id: `onglet-${p.id}-${key}`, "aria-controls": `mots-${p.id}-${key}`, "aria-selected": "false" }, h("span", { text: p.name }));
      tab.addEventListener("click", () => select(p.id));
      panels[p.id] = h("div", { class: "words__panel", role: "tabpanel", id: `mots-${p.id}-${key}`, "aria-labelledby": tab.id, hidden: true }, wordsFor(p.id, d));
      return tab;
    });
    function select(platform) {
      state.tab = { dir: d.dir, platform };
      PLATFORMS.forEach((p, i) => {
        tabs[i].setAttribute("aria-selected", String(p.id === platform));
        panels[p.id].hidden = p.id !== platform;
      });
    }
    const done = h("div", { class: "done", hidden: true });
    const words = h("section", { class: "words", "aria-label": "Les textes à coller" }, done, h("div", { class: "segs segs--tabs", role: "tablist", "aria-label": "Plateforme" }, tabs), Object.values(panels));

    const el = h("article", { class: d.ready ? "dossier" : "dossier dossier--wip", "aria-labelledby": headingId }, bar.el, h("div", { class: "sheet__lead" }, head, tickBar), h("div", { class: "sheet__cols" }, files, words));

    // opened on the first platform still waiting; on the one that was open if the sheet is only being redrawn
    select(state.tab.dir === d.dir ? state.tab.platform : (waiting(d)[0] || PLATFORMS[0]).id);

    /** Everything that says where the dossier stands. `now` is the same dossier, as the PC last described it. */
    function paint(now) {
      const posted = postedOn(now);
      const left = waiting(now);
      const [kind, said] = !now.ready
        ? ["missing", now.voiced ? "Rendu manquant" : "Sans voix"]
        : left.length === 0
          ? ["posted", "Posté partout"]
          : left.length === PLATFORMS.length
            ? ["ready", "Prêt à poster"]
            : ["ready", `En ligne ${PLATFORMS.length - left.length}/${PLATFORMS.length}`];
      chip.className = `chip chip--${kind}`;
      chip.replaceChildren(h("i", {}), said);
      PLATFORMS.forEach((p, i) => {
        const on = Boolean(posted[p.id]);
        ticks[i].setAttribute("aria-pressed", String(on));
        ticks[i].title = on && day(posted[p.id]) ? `Coché le ${day(posted[p.id])}` : "";
        tabs[i].classList.toggle("is-on", on);
      });
      all.hidden = left.length < 2;
      const next = state.groups.todo.find((other) => other.dir !== now.dir);
      done.hidden = !(now.ready && left.length === 0);
      const onward = next && h("a", { class: "btn", href: link(next.dir) }, h("span", { text: `Suivant à poster : ${next.id} · ${next.title}` }));
      if (onward) {
        onward.addEventListener("click", (event) => {
          event.preventDefault();
          location.replace(onward.getAttribute("href")); // from sheet to sheet: "back" still leads to the list
        });
      }
      done.replaceChildren(h("p", { text: `Dossier ${now.id} : en ligne partout.` }), onward || h("p", { class: "note", text: "Plus rien à poster." }));
      bar.paint();
    }
    /** A platform has just been ticked: if its words are the ones open, on to the next one that waits. */
    function advance(platform) {
      const now = find(d.dir);
      const next = now && waiting(now)[0];
      if (next && state.tab.platform === platform) select(next.id);
    }
    return { el, paint, advance };
  }

  /* ---------------------------------------------------------------- the account */

  function profileSheet(p) {
    const field = (key, shown, copied, label = "Copier") => {
      const value = h("p", { class: "field__v", text: shown });
      return h(
        "div",
        { class: label === "Copier" ? "field" : "field field--stack" },
        h("div", { class: "field__body" }, h("p", { class: "field__k", text: key }), value),
        copyButton(label, copied, { source: value }),
      );
    };
    const bar = sheetBar("profil");
    const el = h(
      "article",
      { class: "profil", "aria-labelledby": "profil-h" },
      bar.el,
      h("h2", { class: "tag", id: "profil-h" }, h("i", { class: "dot" }), h("span", { text: "Profil du compte" })),
      h(
        "div",
        { class: "profil__id" },
        h("img", { class: "profil__avatar", src: "/brand/avatar.png", alt: "Photo de profil", width: "88", height: "88" }),
        h("a", { class: "btn", href: "/brand/avatar.png?dl=1", download: "avatar.png" }, h("span", { text: "Télécharger la photo" })),
      ),
      p.name && field("Nom", p.name, p.name),
      // shown with its @, copied without: the TikTok field refuses the @
      p.handle && field("Identifiant", `@${p.handle}`, p.handle),
      p.bio && field("Bio · TikTok", p.bio, p.bio, "Copier la bio"),
      p.instagram && field("Bio · Instagram", p.instagram, p.instagram, "Copier la bio"),
      p.youtube && field("Description · YouTube", p.youtube, p.youtube, "Copier la description"),
    );
    return { el, paint: bar.paint };
  }

  /* ---------------------------------------------------------------- which sheet is open */

  const sheet = $("#sheet");

  function mount(id) {
    const d = id && id !== "profil" ? find(id) : null;
    // a sheet is only rebuilt when what it shows has changed on the disk: a tick repaints it, a film goes on playing
    const key = id === "profil" ? JSON.stringify(state.data.profile) : d ? JSON.stringify({ ...d, posted: null }) : "";
    if (!state.sheet || state.sheet.id !== id || state.sheet.key !== key) {
      const made = id === "profil" ? profileSheet(state.data.profile) : d ? dossierSheet(d) : { el: h("p", { class: "state", text: "Aucun dossier dans cette liste." }) };
      quiet(sheet);
      sheet.replaceChildren(made.el);
      state.sheet = { id, key, ...made };
    }
    if (state.sheet.paint) state.sheet.paint(d);
  }

  /**
   * The address says which sheet is open: "#012-gaziniere", "#profil", or nothing — the list on a
   * phone, and on a wide screen the first dossier of the list, so that the sheet is never empty.
   */
  function route(navigated = false) {
    if (!state.data) return;
    let hash = "";
    try {
      hash = decodeURIComponent(location.hash.slice(1));
    } catch {
      // unreadable: the list
    }
    const asked = hash === "profil" || find(hash) ? hash : "";
    if (navigated && asked && asked !== "profil" && !state.order.includes(asked)) {
      state.filter = bucket(find(asked)); // the list follows the dossier that was asked for
      drawIndex();
    }
    const id = asked || state.order[0] || "";
    const view = asked ? "sheet" : "list";
    const before = desk.dataset.view;
    const moved = !state.sheet || state.sheet.id !== id;
    mount(id);
    desk.dataset.view = view;
    for (const a of rows.querySelectorAll(".row")) {
      if (a.dataset.dir === id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
    if (WIDE.matches) {
      if (moved) window.scrollTo(0, 0);
      const current = moved && rows.querySelector('.row[aria-current="true"]');
      if (current) current.scrollIntoView({ block: "nearest" });
    } else if (view === "list") {
      if (before === "sheet") window.scrollTo(0, state.listY);
    } else if (moved || before !== "sheet") {
      window.scrollTo(0, 0);
    }
    if (view === "list") state.fromList = false;
  }

  /* ---------------------------------------------------------------- load */

  const linkEl = $("#link");
  function setLink(up) {
    linkEl.classList.toggle("is-down", !up);
    linkEl.lastElementChild.textContent = up ? "Publication" : "PC injoignable";
  }

  function render() {
    const { name } = state.data.profile;
    document.title = name ? `Publication · ${name}` : "Publication";
    $("#brand").textContent = name || "Publication";
    $("#notice").hidden = keeps();
    drawIndex();
    route(!state.started);
    state.started = true;
  }

  /** What the PC answered. Drawn only when it differs from the last answer. */
  function take(body) {
    if (body === state.raw) return;
    state.data = JSON.parse(body);
    state.raw = body;
    render();
  }

  async function load() {
    try {
      const res = await fetch("/api/dossiers", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      take(await res.text());
      setLink(true);
      handOver();
      return true;
    } catch {
      setLink(false);
      if (!state.data) {
        $("#brand").textContent = "Publication"; // the account name comes from the PC: not known yet
        const retry = h("button", { type: "button", class: "btn", text: "Réessayer" });
        retry.addEventListener("click", load);
        rows.replaceChildren(
          h(
            "li",
            { class: "state state--alert" },
            h("b", { text: "PC injoignable" }),
            "Vérifie que ",
            h("code", { text: "npm run front" }),
            " tourne sur le PC et que ton téléphone est sur le même Wi-Fi.",
            retry,
          ),
        );
      }
      return false;
    }
  }

  const refresh = $("#refresh");
  refresh.addEventListener("click", async () => {
    const ok = await load();
    verdict(refresh, ok, ok ? "À jour" : "Injoignable", 1600);
  });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual"; // the list's place is put back by hand (route)
  window.addEventListener("hashchange", () => route(true));
  WIDE.addEventListener("change", () => route());

  // back from TikTok, a new render on the PC, a tick from the other device: look at the disk again
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) load();
  });
  setInterval(() => {
    if (!document.hidden) load();
  }, 20000);
  // one film at a time
  document.addEventListener(
    "play",
    (event) => {
      for (const video of document.querySelectorAll("video")) if (video !== event.target) video.pause();
    },
    true,
  );
  document.addEventListener("touchstart", () => {}, { passive: true }); // lets :active show under a finger on iOS

  window.SDFront = { copyText, copyFallback };
  load();
})();
