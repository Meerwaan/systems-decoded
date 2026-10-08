// Système Décodé — bureau de publication.
// Plain script, no build step. The PC says what is on disk (/api/dossiers); this phone keeps
// its own "before posting" ticks in localStorage, one entry per dossier folder.
(() => {
  "use strict";

  const STORE_KEY = "sd.front.v1";
  const SP = String.fromCharCode(160); // non-breaking space (U+00A0): French punctuation wants one

  const STEPS = [
    {
      id: "photos",
      label: "Vidéo enregistrée dans Photos",
      hint: `Télécharger, ouvrir le fichier dans Fichiers, Partager, «${SP}Enregistrer la vidéo${SP}».`,
    },
    { id: "cover", label: "Couverture choisie", hint: `«${SP}Modifier la couverture${SP}» puis importer l'image.` },
    { id: "caption", label: "Légende collée" },
    { id: "ai", label: `«${SP}Contenu généré par l'IA${SP}» activé` },
    { id: "hd", label: `Plus d'options${SP}: «${SP}Importer en HD${SP}» activé` },
    { id: "live", label: "Publié, commentaire épinglé" },
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

  // a new render keeps its file name: the modification time in the URL keeps images and video fresh
  const fresh = (file) => `${file.url}?v=${file.mtime}`;

  const live = $("#live");
  function announce(message) {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = message));
  }

  /* ---------------------------------------------------------------- what this phone remembers */

  const store = {
    data: null,
    all() {
      if (!this.data) {
        try {
          this.data = JSON.parse(localStorage.getItem(STORE_KEY));
        } catch {
          this.data = null;
        }
        if (!this.data || typeof this.data !== "object") this.data = {};
      }
      return this.data;
    },
    get(dir) {
      const saved = this.all()[dir] || {};
      return { checks: saved.checks || {}, posted: saved.posted === true };
    },
    set(dir, patch) {
      this.all()[dir] = { ...this.get(dir), ...patch };
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(this.data));
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

  /* ---------------------------------------------------------------- the cover, whole */

  const viewer = $("#viewer");
  function openCover(event, d) {
    if (typeof viewer.showModal !== "function") return; // older Safari: the link opens the image itself
    event.preventDefault();
    const img = $("#viewer-img");
    img.src = fresh(d.files.cover);
    img.alt = `Couverture du dossier ${d.id}, ${d.title}`;
    $("#viewer-tag").textContent = `Couverture · Dossier ${d.id}`;
    viewer.showModal();
  }
  viewer.addEventListener("click", (event) => {
    if (event.target === viewer || event.target.closest("[data-close]")) viewer.close();
  });

  /* ---------------------------------------------------------------- one dossier */

  function block(title, aside, ...kids) {
    return h("section", { class: "block" }, h("h3", { class: "block__h" }, h("i", {}), h("span", { text: title }), aside), ...kids);
  }

  function dossierCard(d) {
    const { video, cover, preview } = d.files;
    const saved = store.get(d.dir);
    const key = d.dir.replace(/[^\w-]/g, "_"); // ids must not contain spaces
    const headingId = `dossier-${key}`;
    const bodyId = `corps-${key}`;
    // On the desk: rendered and not posted yet. Anything else (no render, already posted) is drawn
    // small and folded, so the dossier to post is never buried under the others.
    const live = d.ready && !saved.posted;

    /* header: the cover as the grid shows it, the dossier number, where it stands */
    const chip = h("p", {});
    const paintChip = (posted) => {
      const [kind, words] = posted ? ["posted", "Posté"] : d.ready ? ["ready", "Prêt à poster"] : ["missing", "Rendu manquant"];
      chip.className = `chip chip--${kind}`;
      chip.replaceChildren(h("i", {}), words);
    };
    paintChip(saved.posted);

    let thumb;
    if (cover) {
      thumb = h(
        "a",
        { class: "dossier__cover", href: fresh(cover), "aria-label": `Voir la couverture du dossier ${d.id} en entier` },
        h("img", { src: fresh(cover), alt: "", width: "1080", height: "1920", decoding: "async" }),
        h("i", { class: "dossier__zoom" }),
      );
      thumb.addEventListener("click", (event) => openCover(event, d));
    } else {
      thumb = h("div", { class: "dossier__cover dossier__cover--none", role: "img", "aria-label": "Pas encore de couverture" });
    }

    const fold = !live && h("button", { type: "button", class: "textbtn", "aria-expanded": "false", "aria-controls": bodyId, text: "Ouvrir" });
    // The listening booth, when the voice was comped out of several recordings. Reachable even from a
    // folded dossier: the voice is chosen before there is anything to post.
    const booth =
      d.booth && h("a", { class: "textbtn", href: `/voix.html?ep=${encodeURIComponent(d.dir)}`, "aria-label": `Voix du dossier ${d.id} : la cabine de doublage`, text: "Voix" });
    const head = h(
      "header",
      { class: "dossier__head" },
      thumb,
      h(
        "div",
        { class: "dossier__id" },
        h("div", { class: "dossier__top" }, h("p", { class: "tag" }, h("i", { class: "dot" }), h("span", { text: `Dossier ${d.id}` })), booth),
        h("h2", { class: "dossier__title", id: headingId, text: d.title }),
        h("div", { class: "dossier__foot" }, chip, fold),
      ),
    );

    /* the files */
    const absent = (what, command) => h("div", { class: "absent" }, h("b", { text: what }), h("code", { text: command }));
    const files = [
      video
        ? h(
            "a",
            { class: "btn btn--primary btn--split", href: `${video.url}?dl=1`, download: `${d.dir}.mp4` },
            h("span", { text: "Télécharger la vidéo HD" }),
            h("span", { class: "btn__data", text: size(video.bytes) }),
          )
        : absent("Vidéo HD pas encore rendue", `npm run render -- ${d.id}`),
      cover
        ? h(
            "a",
            { class: "btn btn--split", href: `${cover.url}?dl=1`, download: `${d.dir}-couverture.png` },
            h("span", { text: "Télécharger la couverture" }),
            h("span", { class: "btn__data", text: size(cover.bytes) }),
          )
        : absent("Couverture pas encore faite", `npm run cover -- ${d.id}`),
      video && canShareVideo && shareButton(d),
      (!video || !cover) && h("p", { class: "note", text: "À lancer sur le PC, puis touche Actualiser." }),
    ];

    const film = preview || video;
    if (film) {
      files.push(
        h(
          "video",
          { class: "player", controls: true, playsinline: true, preload: "none", poster: cover && fresh(cover), "aria-label": `Aperçu du dossier ${d.id}` },
          h("source", { src: fresh(film), type: "video/mp4" }),
        ),
        h("p", {
          class: "note",
          text: preview ? `Aperçu allégé (${size(preview.bytes)}). Le fichier à poster, c'est la HD.` : `Lecture du fichier HD (${size(film.bytes)}).`,
        }),
      );
    }

    const blocks = [block("Vidéo", video && h("small", { text: `rendu le ${when(video.mtime)}` }), files)];

    /* the words */
    if (!d.post) {
      blocks.push(
        block("Légende", null, h("p", { class: "note" }, "Pas de bloc ", h("code", { text: "post" }), " dans episode.json : légende, hashtags et commentaire restent à écrire.")),
      );
    } else {
      const { caption, hashtags, pinned } = d.post;
      const tags = hashtags.join(" ");
      if (caption || tags) {
        const words = caption && h("p", { text: caption });
        const marks = tags && h("p", { class: "quote__tags", text: tags });
        const quote = h("div", { class: "quote" }, words, marks);
        const buttons =
          caption && tags
            ? [
                copyButton("Copier légende + hashtags", `${caption}\n\n${tags}`, { primary: true, source: quote }),
                h("div", { class: "pair" }, copyButton("Copier la légende", caption, { source: words }), copyButton("Copier les hashtags", tags, { source: marks })),
              ]
            : [copyButton(caption ? "Copier la légende" : "Copier les hashtags", caption || tags, { primary: true, source: quote })];
        blocks.push(block("Légende · TikTok", null, quote, buttons));
      } else {
        blocks.push(block("Légende", null, h("p", { class: "note", text: "Légende et hashtags restent à écrire dans episode.json." })));
      }
      if (pinned) {
        const quote = h("div", { class: "quote" }, h("p", { text: pinned }));
        blocks.push(block("Commentaire à épingler", null, quote, copyButton("Copier le commentaire", pinned, { source: quote })));
      }
      /* the same film on Instagram (Reels) and YouTube (Shorts) */
      const { instagram, youtube } = d.post;
      if (instagram && instagram.caption) {
        const tags = instagram.hashtags.join(" ");
        const words = h("p", { text: instagram.caption });
        const marks = tags && h("p", { class: "quote__tags", text: tags });
        const quote = h("div", { class: "quote" }, words, marks);
        blocks.push(block("Légende · Instagram", null, quote, copyButton("Copier légende + hashtags", tags ? `${instagram.caption}\n\n${tags}` : instagram.caption, { primary: true, source: quote })));
      }
      if (youtube && youtube.title) {
        const tags = youtube.hashtags.join(" ");
        const title = h("div", { class: "quote" }, h("p", { text: youtube.title }));
        const words = h("p", { text: youtube.description });
        const marks = tags && h("p", { class: "quote__tags", text: tags });
        const quote = h("div", { class: "quote" }, words, marks);
        blocks.push(
          block("YouTube Shorts", h("small", { text: `titre : ${youtube.title.length} caractères` }), title, copyButton("Copier le titre", youtube.title, { primary: true, source: title }), quote, copyButton("Copier description + hashtags", tags ? `${youtube.description}\n\n${tags}` : youtube.description, { source: quote })),
        );
      }
    }

    /* before posting: ticks kept on this phone */
    const count = h("small", {});
    const paintCount = () => {
      const { checks } = store.get(d.dir);
      count.textContent = `${STEPS.filter((step) => checks[step.id]).length}/${STEPS.length}`;
    };
    paintCount();
    const steps = STEPS.map((step, i) => {
      const input = h("input", { type: "checkbox" });
      input.checked = saved.checks[step.id] === true;
      input.addEventListener("change", () => {
        store.set(d.dir, { checks: { ...store.get(d.dir).checks, [step.id]: input.checked } });
        paintCount();
      });
      return h(
        "li",
        {},
        h(
          "label",
          { class: "check" },
          input,
          h("span", { class: "check__box", "aria-hidden": "true", text: String(i + 1) }),
          h("span", { class: "check__t" }, step.label, step.hint && h("small", { text: step.hint })),
        ),
      );
    });
    const posted = h(
      "button",
      { type: "button", class: "switch", role: "switch", "aria-checked": String(saved.posted) },
      h("span", { text: "Marquer comme posté" }),
      h("i", { class: "switch__track", "aria-hidden": "true" }),
    );
    posted.addEventListener("click", () => {
      const on = posted.getAttribute("aria-checked") !== "true";
      store.set(d.dir, { posted: on });
      posted.setAttribute("aria-checked", String(on));
      paintChip(on);
    });
    blocks.push(block("Avant de publier", count, h("ul", { class: "checks" }, steps), posted));

    // number the blocks like the acts of a film: 01 VIDÉO · 02 LÉGENDE · …
    blocks.forEach((el, i) => (el.querySelector(".block__h i").textContent = two(i + 1)));
    const body = h("div", { id: bodyId, hidden: !live }, blocks);
    if (fold) {
      fold.addEventListener("click", () => {
        body.hidden = !body.hidden;
        fold.setAttribute("aria-expanded", String(!body.hidden));
        fold.textContent = body.hidden ? "Ouvrir" : "Replier";
      });
    }
    return h("article", { class: live ? "dossier" : "dossier dossier--idle", "aria-labelledby": headingId }, head, body);
  }

  /* ---------------------------------------------------------------- the account */

  function profileSection(p) {
    const field = (key, shown, copied, label = "Copier") => {
      const value = h("p", { class: "field__v", text: shown });
      return h(
        "div",
        { class: label === "Copier" ? "field" : "field field--stack" },
        h("div", { class: "field__body" }, h("p", { class: "field__k", text: key }), value),
        copyButton(label, copied, { source: value }),
      );
    };
    return [
      h("h2", { class: "tag", id: "profil-h" }, h("i", { class: "dot" }), h("span", { text: "Profil" })),
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
    ];
  }

  /* ---------------------------------------------------------------- load */

  const main = $("#dossiers");
  const link = $("#link");
  let shown = ""; // the last answer drawn: the page is only rebuilt when the disk has changed

  function setLink(up) {
    link.classList.toggle("is-down", !up);
    link.lastElementChild.textContent = up ? "Publication" : "PC injoignable";
  }

  function render(data) {
    const name = data.profile.name;
    document.title = name ? `Publication · ${name}` : "Publication";
    $("#brand").textContent = name || "Publication";
    main.replaceChildren(
      ...(data.dossiers.length
        ? data.dossiers.map(dossierCard)
        : [h("div", { class: "state" }, h("b", { text: "Aucun dossier" }), "Le premier épisode créé sur le PC apparaîtra ici.")]),
    );
    const profil = $("#profil");
    profil.replaceChildren(...profileSection(data.profile).filter(Boolean));
    profil.hidden = false;
  }

  async function load() {
    try {
      const res = await fetch("/api/dossiers", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.text();
      if (body !== shown) {
        render(JSON.parse(body));
        shown = body;
      }
      setLink(true);
      return true;
    } catch {
      setLink(false);
      if (!shown) {
        $("#brand").textContent = "Publication"; // the account name comes from the PC: not known yet
        const retry = h("button", { type: "button", class: "btn", text: "Réessayer" });
        retry.addEventListener("click", load);
        main.replaceChildren(
          h(
            "div",
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

  // back from TikTok or from a new render on the PC: look at the disk again
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) load();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) load();
  });
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
