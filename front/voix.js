// Système Décodé — cabine de doublage.
// Plain script, no build step. The PC says what was recorded and what its measurements chose
// (/api/voix/<dossier>); this page plays every phrase in every recording and sends back what the
// ear keeps. It records nothing: it only chooses among recordings that are already on the disk.
(() => {
  "use strict";

  const SP = String.fromCharCode(160); // non-breaking space (U+00A0): French punctuation wants one
  const LEAD = 1.5; // "in the comp": seconds heard before the phrase…
  const TAIL = 1; // …and after it, to judge the joins
  const NOTE_MAX = 400; // what the PC keeps of a note

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

  const two = (n) => String(n).padStart(2, "0");
  /** 93.86 → "1 min 33 s" — whole seconds elapsed, the way a player counts ("1:33") */
  function long(seconds) {
    const s = Math.floor(seconds);
    return s < 60 ? `${s}${SP}s` : `${Math.floor(s / 60)}${SP}min${SP}${two(s % 60)}${SP}s`;
  }
  /** 65.2 → "1:05" */
  const clock = (seconds) => `${Math.floor(seconds / 60)}:${two(Math.floor(seconds % 60))}`;
  const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  function when(ms) {
    const d = new Date(ms);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} à ${two(d.getHours())}:${two(d.getMinutes())}`;
  }

  /**
   * How lively the intonation is, on 5 steps, from the spread the PC measured (semitones):
   * 1.6 and under is flat (1), 4 and over is fully played (5).
   */
  const liveliness = (spread) => Math.min(5, Math.max(1, Math.round(1 + (4 * ((spread || 0) - 1.6)) / 2.4)));

  const live = $("#live");
  function announce(message) {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = message));
  }

  /* ---------------------------------------------------------------- what the page knows */

  const dir = new URLSearchParams(location.search).get("ep") || "";
  const api = `/api/voix/${encodeURIComponent(dir)}`;
  const main = $("#booth");
  const link = $("#link");
  const title = $("#title");

  let session = null; // the last answer of the PC
  let seen = ""; // …as text: nothing is repainted while the disk has not changed
  let built = ""; // what the cards are made of (phrases, recordings): they are rebuilt only when that changes
  let busy = false; // the PC is redoing the comp: one change at a time
  let montage = null; // the parts of the "Le montage" block that change
  let followed = new Map(); // phrase id → the recording it was in before the last choice moved it
  const cards = new Map(); // phrase id → the parts of its card that change with the comp
  const waiting = new Map(); // notes typed while the PC was busy: phrase id → text

  const number = (id) => two(session.beats.findIndex((b) => b.id === id) + 1);
  const nameIn = (beat, rec) => (beat.takes.find((t) => t.id === rec) || { name: rec }).name;
  /** The stretch of the comp heard around a phrase: a little before it, a little after, never past the end of the file. */
  const around = (beat) => [Math.max(0, beat.start - LEAD), Math.min(beat.end + TAIL, session.duration || Infinity)];

  /* ---------------------------------------------------------------- the status line at the bottom */

  /**
   * Words from the PC, ready to show. What it wrote between backticks is something to type on the PC:
   * set as code, where "--" stays two hyphens (the display face draws them as one long dash).
   */
  const worded = (message) => message.split("`").map((part, i) => (i % 2 ? h("code", { text: part }) : part));

  const toast = $("#toast");
  const toastText = $("#toast-text");
  let toastTimer;
  function hush() {
    clearTimeout(toastTimer);
    toast.hidden = true;
  }
  /** kind: "busy" (stays while the PC works), "done" (goes away, unless `stay`), "failed" (stays until closed). */
  function say(kind, message, { stay = false } = {}) {
    clearTimeout(toastTimer);
    toast.className = `toast is-${kind}`;
    toastText.replaceChildren(...worded(message));
    toast.hidden = false;
    announce(message.replace(/`/g, ""));
    if (kind === "done" && !stay) toastTimer = setTimeout(hush, 4200);
  }
  $("#toast-close").addEventListener("click", hush);

  /* ---------------------------------------------------------------- one sound at a time */

  // One <audio> for every excerpt and every window of the comp. iOS only lets a sound start inside
  // a tap: play() is called there, on this same element, before anything has loaded.
  const sound = new Audio();
  sound.preload = "auto";
  let playing = null; // { control, from, to }: the control that started what is being heard
  let frame = 0;

  /** Stop everything that makes a sound — except `keep`, the player that has just been started by hand. */
  function silence(keep) {
    cancelAnimationFrame(frame);
    if (playing) {
      const { control } = playing;
      playing = null; // first: the "pause" that follows is ours, not an interruption
      control.setAttribute("aria-pressed", "false");
      control.classList.remove("is-loading", "is-playing");
      control.style.removeProperty("--p");
    }
    if (!sound.paused) sound.pause();
    for (const el of document.querySelectorAll("audio")) if (el !== keep && !el.paused) el.pause();
  }

  function soundLost(control, refused) {
    if (!playing || playing.control !== control) return; // already said, or something else is playing by now
    silence();
    say("failed", refused ? "Le téléphone n'a pas voulu lancer le son : touche à nouveau." : "Ce son est injoignable : le PC ne le trouve pas, ou ne répond plus.");
  }

  /** Play `url` from the tapped `control`; `from`/`to` (seconds) cut a window in it. A second tap on the same control stops it. */
  function listen(control, url, from = 0, to = Infinity) {
    const again = playing !== null && playing.control === control;
    silence();
    if (again) return;
    playing = { control, from, to };
    control.setAttribute("aria-pressed", "true");
    control.classList.add("is-loading");
    // "#t=12.50": start there. Looked at again once the file is known, for a browser that ignores it.
    sound.src = from > 0 ? `${url}#t=${from.toFixed(2)}` : url;
    const started = sound.play();
    if (started) {
      started.catch((err) => {
        // AbortError: stopped before it had started (another tap). NotAllowedError: the browser wants a tap of its own.
        if (err && err.name !== "AbortError") soundLost(control, err.name === "NotAllowedError");
      });
    }
  }

  function follow() {
    cancelAnimationFrame(frame);
    if (!playing) return;
    const { control, from, to } = playing;
    if (sound.currentTime >= to) return silence();
    const end = Number.isFinite(to) ? to : sound.duration;
    if (end > from) control.style.setProperty("--p", Math.min(1, Math.max(0, (sound.currentTime - from) / (end - from))).toFixed(3));
    frame = requestAnimationFrame(follow);
  }

  // Where a window starts is asked three times: in the address ("#t="), once the file is known, and
  // again when it starts to sound — the last two for a browser that ignored the one before.
  const toStart = (slack) => {
    if (playing && playing.from > 0 && sound.currentTime < playing.from - slack) sound.currentTime = playing.from;
  };
  sound.addEventListener("loadedmetadata", () => toStart(0.25));
  sound.addEventListener("playing", () => {
    if (!playing) return;
    toStart(0.5);
    playing.control.classList.remove("is-loading");
    playing.control.classList.add("is-playing");
    follow();
  });
  // the end of a window, even with the page in the background (no animation frame there)
  sound.addEventListener("timeupdate", () => {
    if (playing && sound.currentTime >= playing.to) silence();
  });
  sound.addEventListener("ended", () => {
    if (playing) silence();
  });
  // paused by something else than this page (a call, headphones unplugged): the control must not keep saying it plays
  sound.addEventListener("pause", () => {
    if (playing && sound.paused && !sound.ended) silence();
  });
  sound.addEventListener("error", () => {
    if (playing) soundLost(playing.control);
  });
  // the comp's own player was started by hand: it is now the one sound
  document.addEventListener("play", (event) => silence(event.target), true);

  /* ---------------------------------------------------------------- sending a change to the PC */

  let pending = null; // the control that was pressed, and what it said before
  let asked = 0; // every question put to the PC: an answer that comes back after a newer question is dropped

  /** Mark (or free) every control that changes something. They stay focusable: a tap on one says why nothing happens. */
  function hold(on) {
    for (const el of document.querySelectorAll("[data-change]")) {
      if (on) el.setAttribute("aria-disabled", "true");
      else el.removeAttribute("aria-disabled");
    }
  }

  /** While the PC redoes the comp (a few seconds) nothing else can be changed; the control that was pressed says so. */
  function lock(on, control, label) {
    busy = on;
    hold(on);
    if (pending) {
      pending.control.firstElementChild.textContent = pending.said;
      pending.control.classList.remove("is-pending");
      pending = null;
    }
    if (on && control && label) {
      pending = { control, said: control.firstElementChild.textContent };
      control.firstElementChild.textContent = label;
      control.classList.add("is-pending");
    }
  }

  /** Which phrases changed recording without having been asked to: left to the measurements, they followed a neighbour. */
  function followers(before, after, picks) {
    const out = new Map();
    for (const beat of after.beats) {
      const was = before.beats.find((b) => b.id === beat.id);
      if (was && was.chosen !== beat.chosen && !Object.prototype.hasOwnProperty.call(picks, beat.id)) out.set(beat.id, nameIn(was, was.chosen));
    }
    return out;
  }

  /** What a choice did, in a sentence or two — nothing for a note: its own field says it is saved. */
  function told(patch) {
    const picks = Object.entries(patch.picks || {});
    if (!picks.length) return "";
    const lines = [];
    if (picks.length === 1) {
      const [id, rec] = picks[0];
      const beat = session.beats.find((b) => b.id === id);
      lines.push(rec === null ? `Phrase ${number(id)} rendue au choix automatique${SP}: ${nameIn(beat, beat.chosen)}.` : `${nameIn(beat, rec)} gardée pour la phrase ${number(id)}.`);
    } else {
      lines.push("Tout est rendu au choix automatique.");
    }
    if (followed.size) {
      const many = followed.size > 1;
      lines.push(`${followed.size} ${many ? "autres phrases en auto ont" : "autre phrase en auto a"} suivi${SP}: ${[...followed.keys()].map(number).join(", ")}.`);
    }
    return lines.join(" ");
  }

  /**
   * POST one change and repaint from the booth the PC answers with. On a refusal nothing has moved:
   * the PC's own words are shown and the page stays as it was. Resolves with { ok, message }.
   */
  async function save(patch, { control = null, label = "", wait = "Le PC refait le montage… deux ou trois secondes." } = {}) {
    if (busy) {
      announce("Le PC refait le montage : un changement à la fois.");
      return { ok: false, message: "Le PC est occupé" };
    }
    lock(true, control, label);
    say("busy", wait);
    asked++; // an older look at the disk still on its way back must not repaint over this answer
    const before = session;
    let result;
    try {
      const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch), cache: "no-store" });
      const body = await res.text();
      if (!res.ok) {
        result = { ok: false, message: body.trim() || `Refus du PC (${res.status})` };
      } else {
        const next = JSON.parse(body);
        if (patch.picks) followed = followers(before, next, patch.picks); // a note moves nothing: the marks of the last choice stay
        session = next;
        seen = body;
        result = { ok: true, message: "" };
      }
    } catch (err) {
      // no answer at all (Wi-Fi, PC asleep): the change may or may not have been written
      result = { ok: false, message: err instanceof SyntaxError ? "Réponse illisible du PC." : "PC injoignable : le changement n'est peut-être pas passé." };
    }
    lock(false);
    if (result.ok) {
      render(session); // the kept marks, the comp's player and the phrases that followed, all from what the PC answered
      const words = told(patch);
      if (words) say("done", words, { stay: followed.size > 0 });
      else hush();
    } else {
      say("failed", result.message);
      load(); // look at the disk again: the page must show what is really kept
    }
    queueMicrotask(sendNotes); // the notes typed meanwhile
    return result;
  }

  function keep(beatId, recId, control) {
    const beat = session.beats.find((b) => b.id === beatId);
    if (beat.manual && beat.chosen === recId) return announce(`${nameIn(beat, recId)} est déjà gardée pour la phrase ${number(beatId)}.`);
    save({ picks: { [beatId]: recId } }, { control, label: "Envoi…" });
  }

  /* ---------------------------------------------------------------- notes for the director */

  // as tall as what is written in it
  function fit(area) {
    area.style.height = "auto";
    area.style.height = `${area.scrollHeight + 2}px`;
  }

  function paintNote(card) {
    const words = card.area.value.trim();
    let text = "";
    let kind = "";
    if (card.status && card.status.sending !== undefined) text = "Enregistrement sur le PC…";
    else if (card.status === "waiting") text = "En attente : le PC finit le montage…";
    else if (card.status && card.status.failed) [text, kind] = [`Pas enregistrée${SP}: ${card.status.failed}`, "is-failed"];
    else if (words !== card.note) text = "Modifiée, pas encore enregistrée";
    else if (card.note) [text, kind] = ["Enregistrée sur le PC", "is-done"];
    card.state.replaceChildren(...worded(text));
    card.state.className = kind ? `notefield__state ${kind}` : "notefield__state";
    card.retry.hidden = kind !== "is-failed"; // the words are still in the field: one tap sends them again
  }

  /** The field lost focus: send its note if it is not the one the PC already has. */
  function noteLeft(id) {
    const card = cards.get(id);
    const words = card.area.value.trim();
    if (card.status && card.status.sending === words) return; // these very words are already on their way
    if (words === card.note) {
      card.status = null;
      return paintNote(card);
    }
    waiting.set(id, words);
    card.status = "waiting";
    paintNote(card);
    sendNotes();
  }

  async function sendNotes() {
    if (busy || !waiting.size) return;
    const notes = Object.fromEntries(waiting);
    waiting.clear();
    const sent = new Map(); // phrase id → the status this send gave its card
    for (const [id, words] of Object.entries(notes)) {
      const card = cards.get(id);
      if (!card) continue;
      card.status = { sending: words };
      sent.set(id, card.status);
      paintNote(card);
    }
    const result = await save({ notes }, { wait: "Note en cours d'enregistrement sur le PC…" });
    for (const [id, status] of sent) {
      const card = cards.get(id);
      if (!card || card.status !== status) continue; // typed in again since: its state is already the newer one
      // refused or lost: the words stay in the field, marked as not saved, with a way to send them again
      card.status = result.ok ? null : { failed: result.message };
      paintNote(card);
    }
  }

  /* ---------------------------------------------------------------- the comp */

  function montageBlock() {
    const length = h("small", {});
    const player = h("audio", { class: "montage__player", controls: true, preload: "metadata", "aria-label": "Le montage en entier" });
    const absent = h("p", {
      class: "note",
      hidden: true,
      text: "Le montage n'a pas pu être assemblé en un seul fichier sur le PC : seuls les extraits s'écoutent ici.",
    });
    const count = h("p", { class: "note" });
    const film = h("p", { class: "note", hidden: true });

    const reset = h("button", { type: "button", class: "btn", "data-change": true }, h("span", { text: "Tout rendre au choix automatique" }));
    const sureText = h("p", { class: "note" });
    const cancel = h("button", { type: "button", class: "btn" }, h("span", { text: "Annuler" }));
    const confirm = h("button", { type: "button", class: "btn btn--primary", "data-change": true }, h("span", { text: "Oui, tout rendre" }));
    const sure = h("div", { class: "confirm", hidden: true }, sureText, h("div", { class: "pair" }, cancel, confirm));
    const ask = (on) => {
      sure.hidden = !on;
      reset.hidden = on;
    };
    reset.addEventListener("click", () => {
      if (busy) return announce("Le PC refait le montage : un changement à la fois.");
      const n = session.beats.filter((b) => b.manual).length;
      sureText.textContent = `${n > 1 ? `Tes ${n} choix à l'oreille seront oubliés` : "Ton choix à l'oreille sera oublié"} : chaque phrase reprendra la prise que retiennent les mesures. Tes notes restent.`;
      ask(true);
      cancel.focus();
    });
    cancel.addEventListener("click", () => {
      ask(false);
      reset.focus();
    });
    confirm.addEventListener("click", () => {
      ask(false);
      // every phrase, not only the ones this page shows as chosen: a pick the comp ignores goes too
      save({ picks: Object.fromEntries(session.beats.map((b) => [b.id, null])) }, { control: reset, label: "Envoi…" });
    });

    const key = h(
      "details",
      { class: "key" },
      h("summary", {}, h("span", { text: "Comment lire une prise" })),
      h(
        "dl",
        {},
        h("div", {}, h("dt", {}, meter(3)), h("dd", { text: "La vivacité de l'intonation, mesurée : une barre, c'est plat ; cinq, très joué." })),
        h("div", {}, h("dt", {}, h("span", { class: "take__auto", text: "auto" })), h("dd", { text: "La prise que retiennent les mesures. Elles trient et alertent ; elles n'entendent pas." })),
        h("div", {}, h("dt", {}, h("span", { class: "flag", text: "plate" })), h("dd", { text: "Un doute des mesures sur cette prise : à vérifier à l'oreille." })),
        h("div", {}, h("dt", {}, h("span", { class: "take__mood", text: "climax" })), h("dd", { text: "Une prise dirigée avec une autre intention que celle de la phrase." })),
      ),
      h("p", {
        class: "note",
        text: "Garder une prise fixe sa phrase. Les phrases laissées en auto se réarrangent alors autour d'elle pour éviter les raccords inutiles : garde aussi celles que tu ne veux pas voir bouger.",
      }),
      h("p", {
        class: "note",
        text: `«${SP}Écouter dans le montage${SP}» joue la phrase à sa place dans le film, avec une seconde et demie avant et une seconde après, pour juger les raccords.`,
      }),
    );

    montage = { length, player, absent, count, film, reset, ask };
    return h(
      "section",
      { class: "block montage", "aria-labelledby": "montage-h" },
      h("h2", { class: "block__h", id: "montage-h" }, h("span", { text: "Le montage" }), length),
      player,
      absent,
      count,
      film,
      reset,
      sure,
      key,
    );
  }

  function paintMontage(s) {
    const m = montage;
    m.length.textContent = s.duration ? long(s.duration) : "";
    // the comp keeps its name when it is redone: the date of the file in the address makes the phone fetch the new one
    const src = s.comp ? `${s.comp.url}?v=${s.comp.mtime}` : "";
    if (m.player.dataset.src !== src) {
      if (playing && playing.to !== Infinity) silence(); // a window of the old comp
      m.player.dataset.src = src;
      if (src) m.player.src = src;
      else m.player.removeAttribute("src");
    }
    m.player.hidden = !s.comp;
    m.absent.hidden = !!s.comp;

    const n = s.beats.filter((b) => b.manual).length;
    const all = s.beats.length;
    m.count.textContent =
      n === 0
        ? `Aucun choix à l'oreille pour l'instant : les ${all} phrases suivent les mesures.`
        : `${n} phrase${n > 1 ? "s" : ""} sur ${all} choisie${n > 1 ? "s" : ""} à l'oreille. Les autres suivent les mesures.`;
    m.ask(false);
    m.reset.hidden = n === 0;

    // the film on the desk was rendered from an older comp: said, because it is the MP4 that gets posted
    const stale = s.comp && s.rendered && s.rendered < s.comp.mtime;
    m.film.hidden = !stale;
    if (stale) {
      m.film.replaceChildren(
        `Le MP4 du bureau a été rendu avant ce montage (${when(s.rendered)}). Un choix fait ici n'entre dans le film qu'au prochain rendu, sur le PC${SP}: `,
        h("code", { text: `npm run render -- ${s.id}` }),
      );
    }
  }

  /* ---------------------------------------------------------------- one phrase */

  function meter(level) {
    return h("span", { class: "meter", "data-level": String(level), "aria-hidden": "true" }, h("i", {}), h("i", {}), h("i", {}), h("i", {}), h("i", {}));
  }

  function phraseCard(beat, index) {
    const key = `phrase-${index + 1}`;
    const num = two(index + 1);

    const revert = h("button", { type: "button", class: "textbtn", "data-change": true }, h("span", { text: "Rendre à l'auto" }));
    revert.addEventListener("click", () => save({ picks: { [beat.id]: null } }, { control: revert, label: "Envoi…" }));
    const ear = h("p", { class: "phrase__ear", hidden: true }, h("span", { text: "Choisie à l'oreille" }), revert);
    const moved = h("p", { class: "phrase__moved", hidden: true });

    const takes = new Map();
    const rows = beat.takes.map((take) => {
      const level = liveliness(take.spread);
      const other = take.mood !== beat.mood; // a retake that tried another intention than the script's
      const twin = beat.takes.some((t) => t !== take && t.name === take.name); // two recordings with one name: told apart by their id
      const auto = h("span", { class: "take__auto", text: "auto", hidden: true });
      const inComp = h("span", { class: "take__in", text: "Dans le montage", hidden: true });
      const play = h(
        "button",
        { type: "button", class: "take__play", "aria-pressed": "false" },
        h("i", { class: "take__icon", "aria-hidden": "true" }),
        h(
          "span",
          { class: "take__id" },
          h("span", { class: "take__line" }, h("span", { class: "take__name", text: take.name }), other && h("span", { class: "take__mood", text: take.mood }), twin && h("span", { class: "take__rec", text: take.id })),
          h("span", { class: "take__line take__line--marks" }, auto, inComp),
        ),
        meter(level),
      );
      play.addEventListener("click", () => listen(play, take.url));
      const keepLabel = h("span", { text: "Garder" });
      const keepButton = h("button", { type: "button", class: "take__keep", "aria-pressed": "false", "data-change": true }, keepLabel);
      keepButton.addEventListener("click", () => keep(beat.id, take.id, keepButton));
      const flags =
        take.flags.length > 0 &&
        h("p", { class: "take__flags" }, h("span", { class: "sr", text: "À vérifier à l'oreille : " }), take.flags.map((flag) => h("span", { class: "flag", text: flag })));
      const row = h("li", { class: "take" }, play, keepButton, flags);
      takes.set(take.id, { row, play, keepButton, keepLabel, auto, inComp, level, other });
      return row;
    });

    const windowTimes = h("span", { class: "btn__data" });
    const inMontage = h("button", { type: "button", class: "btn btn--split phrase__in", "aria-pressed": "false" }, h("span", { text: "Écouter dans le montage" }), windowTimes);
    inMontage.addEventListener("click", () => {
      const now = session.beats.find((b) => b.id === beat.id); // where the phrase sits today: it moves with every choice
      if (!session.comp || !now) return;
      listen(inMontage, `${session.comp.url}?v=${session.comp.mtime}`, ...around(now));
    });

    const area = h("textarea", { id: `${key}-note`, rows: "2", maxlength: String(NOTE_MAX), placeholder: `«${SP}plus lent${SP}», «${SP}plus inquiétant${SP}»…`, "aria-describedby": `${key}-note-state` });
    area.value = beat.note;
    const state = h("p", { class: "notefield__state", id: `${key}-note-state`, "aria-live": "polite" });
    const retry = h("button", { type: "button", class: "textbtn", hidden: true }, h("span", { text: "Renvoyer la note" }));
    const card = { el: null, ear, moved, takes, inMontage, windowTimes, area, state, retry, note: beat.note, status: null };
    area.addEventListener("input", () => {
      fit(area);
      card.status = null;
      paintNote(card);
    });
    area.addEventListener("blur", () => noteLeft(beat.id));
    retry.addEventListener("click", () => noteLeft(beat.id));

    card.el = h(
      "article",
      { class: "phrase", "aria-labelledby": `${key}-h` },
      h(
        "header",
        { class: "phrase__head" },
        h("h2", { class: "tag", id: `${key}-h` }, h("i", { class: "dot" }), h("span", { text: `Phrase ${num}` }), h("span", { class: "phrase__id", text: beat.id })),
        beat.mood && h("p", { class: "chip chip--mood" }, h("span", { class: "sr", text: "Intention : " }), beat.mood),
      ),
      h("p", { class: "phrase__text", text: beat.text }),
      beat.vo && h("p", { class: "phrase__vo" }, h("span", { class: "sr", text: "Direction : " }), beat.vo),
      // the other ways this phrase was directed for a retake: what the recordings marked with another intention were asked
      beat.voAlt.map((line) => h("p", { class: "phrase__vo" }, h("b", { text: "ou" }), " ", line)),
      ear,
      moved,
      h("ul", { class: "takes", "aria-label": `Prises de la phrase ${num}` }, rows),
      inMontage,
      h("div", { class: "notefield" }, h("label", { for: `${key}-note`, text: "Note pour la direction" }), area, state, retry),
    );
    cards.set(beat.id, card);
    return card.el;
  }

  function paintCard(beat, index) {
    const card = cards.get(beat.id);
    const num = two(index + 1);
    card.el.classList.toggle("is-manual", beat.manual); // its light comes on: decided by ear
    card.ear.hidden = !beat.manual;
    const was = followed.get(beat.id);
    card.moved.hidden = !was;
    card.moved.textContent = was ? `A suivi une voisine${SP}: ${was} → ${nameIn(beat, beat.chosen)}` : "";

    for (const take of beat.takes) {
      const t = card.takes.get(take.id);
      const current = take.id === beat.chosen;
      const auto = take.id === beat.auto;
      const mine = current && beat.manual;
      t.row.classList.toggle("is-current", current);
      if (current) t.row.setAttribute("aria-current", "true");
      else t.row.removeAttribute("aria-current");
      t.auto.hidden = !auto;
      t.inComp.hidden = !current;
      t.keepButton.setAttribute("aria-pressed", String(mine));
      t.keepButton.setAttribute("aria-label", mine ? `${take.name} gardée pour la phrase ${num}` : `Garder ${take.name} pour la phrase ${num}`);
      t.keepLabel.textContent = mine ? "Gardée" : "Garder";
      t.play.setAttribute(
        "aria-label",
        [`Écouter ${take.name}`, t.other && `jouée ${take.mood}`, `vivacité ${t.level} sur 5`, auto && "choix automatique", current && "dans le montage"].filter(Boolean).join(", "),
      );
    }

    card.inMontage.hidden = !session.comp;
    const [from, to] = around(beat).map(clock);
    card.windowTimes.textContent = `${from} → ${to}`;
    card.inMontage.setAttribute("aria-label", `Écouter la phrase ${num} dans le montage, de ${from} à ${to}`);

    // The note: the PC's, unless something is being typed here that it does not have yet.
    const typing = card.area.value.trim() !== card.note;
    card.note = beat.note;
    if (!typing && card.area.value !== beat.note) {
      card.area.value = beat.note;
      fit(card.area);
    }
    paintNote(card);
  }

  /* ---------------------------------------------------------------- the page */

  function build(s) {
    silence(); // the control that was playing is about to go
    const drafts = new Map(); // what was being typed survives the rebuild
    for (const [id, card] of cards) if (card.area.value.trim() !== card.note) drafts.set(id, { value: card.area.value, note: card.note });
    cards.clear();
    main.replaceChildren(montageBlock(), ...s.beats.map(phraseCard));
    for (const [id, draft] of drafts) {
      const card = cards.get(id);
      if (!card) continue;
      card.area.value = draft.value;
      card.note = draft.note; // still "being typed" when the card is painted
    }
    for (const card of cards.values()) fit(card.area);
  }

  function render(s) {
    document.title = `Cabine · Dossier ${s.id}`;
    title.replaceChildren(h("span", { text: `Dossier ${s.id}${SP}—` }), " ", s.title);
    // What a card is made of. The rest (what is kept, where the phrase sits, its note) is painted on it:
    // a field being typed in is never taken from under the fingers.
    const made = JSON.stringify(s.beats.map((b) => [b.id, b.text, b.vo, b.voAlt, b.mood, b.takes.map((t) => [t.id, t.name, t.mood, t.flags, t.spread, t.url])]));
    if (made !== built) {
      build(s);
      built = made;
    }
    paintMontage(s);
    s.beats.forEach(paintCard);
    hold(busy); // rebuilt in the middle of a change: the new controls are held too
  }

  function setLink(up) {
    link.classList.toggle("is-down", !up);
    link.lastElementChild.textContent = up ? "Cabine" : "PC injoignable";
  }

  /** The cabin cannot open: say why, plainly, with a way out. */
  function closed(heading, words, ...kids) {
    silence();
    session = null;
    seen = "";
    built = "";
    cards.clear();
    document.title = "Cabine";
    title.textContent = "Cabine de doublage";
    main.replaceChildren(h("div", { class: "state state--alert" }, h("b", { text: heading }), words, ...kids));
  }
  const backLink = () => h("a", { class: "btn", href: "/" }, h("span", { text: "Retour au bureau de publication" }));

  async function load() {
    if (!dir) {
      closed("Quel dossier ?", "Cette page s'ouvre depuis un dossier du bureau de publication, par son lien « Voix ».", backLink());
      return false;
    }
    const mine = ++asked;
    let res;
    let body;
    try {
      res = await fetch(api, { cache: "no-store" });
      body = await res.text();
    } catch {
      if (mine !== asked) return false;
      setLink(false);
      if (!session) {
        const retry = h("button", { type: "button", class: "btn" }, h("span", { text: "Réessayer" }));
        retry.addEventListener("click", load);
        closed("PC injoignable", ["Vérifie que ", h("code", { text: "npm run front" }), " tourne sur le PC et que ton téléphone est sur le même Wi-Fi."], retry);
      }
      return false;
    }
    if (mine !== asked) return false; // a change was sent meanwhile: its answer is the newer one
    setLink(true);
    if (!res.ok) {
      // 404: no such dossier, or no booth for it — 409: its voice no longer matches its script. The PC says which.
      closed(res.status === 404 || res.status === 409 ? "Pas de cabine" : "Cabine indisponible", worded(body.trim() || `Le PC a répondu ${res.status}.`), backLink());
      return false;
    }
    if (body !== seen) {
      let next;
      try {
        next = JSON.parse(body);
      } catch {
        closed("Cabine indisponible", "La réponse du PC est illisible.", backLink());
        return false;
      }
      if (seen) followed = new Map(); // the disk moved on its own: what "followed" no longer describes it
      session = next;
      seen = body;
      render(session);
    }
    return true;
  }

  // back from the PC (new recordings, a note read): look at the disk again — not in the middle of a change
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !busy) load();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && !busy) load();
  });
  document.addEventListener("touchstart", () => {}, { passive: true }); // lets :active show under a finger on iOS

  load();
})();
