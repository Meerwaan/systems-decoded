// Publishing desk: a small HTTP server (node:http, no dependency) that hands each finished
// dossier to the phone over the home Wi-Fi — full-quality MP4, cover, caption, hashtags,
// pinned comment. Everything is read from disk on every request: a new render shows up on
// the next refresh, without a restart.
// It also opens the listening booth of an episode (front/voix.html): every phrase in every
// recording, and the one address of this server that writes anything — the ear's choice of a
// recording, handed to voice.mjs, which re-comps from what is already on the disk.
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";
import { loadEpisode, schedule } from "./lib/episode.mjs";
import { choose, readPicks } from "./voice.mjs";

const FRONT = path.join(ROOT, "front");
const RENDERS = path.join(ROOT, "renders");
const FONTS = path.join(ROOT, "kit", "fonts");
const BRAND = path.join(ROOT, "brand");
const EPISODES = path.join(ROOT, "episodes");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

// URL prefix → the one folder it may read, and the file types it may hand out.
const FOLDERS = {
  "": { dir: FRONT, types: [".html", ".css", ".js"] },
  media: { dir: RENDERS, types: [".mp4", ".png"] },
  fonts: { dir: FONTS, types: [".woff2"] },
};

/* ---------------------------------------------------------------- what is on disk */

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};

/**
 * Is this MP4 whole? While ffmpeg is still writing it (or after a render that was cut short) the
 * file is on disk but has no index yet: announcing it as ready would hand the phone a video that
 * cannot play. A finished file has both a `moov` and an `mdat` atom, and none runs past its end.
 */
function wholeMp4(file, size) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const head = Buffer.alloc(16);
    const seen = new Set();
    let pos = 0;
    for (let i = 0; i < 64 && pos + 8 <= size; i++) {
      const got = fs.readSync(fd, head, 0, 16, pos);
      let length = head.readUInt32BE(0);
      if (length === 1 && got === 16) length = Number(head.readBigUInt64BE(8)); // 64-bit size
      else if (length === 0) length = size - pos; // "until the end of the file"
      if (got < 8 || length < 8 || pos + length > size) return false;
      seen.add(head.toString("latin1", 4, 8));
      pos += length;
    }
    return seen.has("moov") && seen.has("mdat");
  } catch {
    return false;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/** A file of renders/ as the page needs it, or null when it is not there (or not finished). */
function rendered(name) {
  try {
    const file = path.join(RENDERS, name);
    const st = fs.statSync(file);
    if (!st.isFile() || (name.endsWith(".mp4") && !wholeMp4(file, st.size))) return null;
    return { url: `/media/${encodeURIComponent(name)}`, bytes: st.size, mtime: Math.round(st.mtimeMs) };
  } catch {
    return null;
  }
}

function postOf(post) {
  if (!post || typeof post !== "object") return null;
  return {
    caption: typeof post.caption === "string" ? post.caption : "",
    hashtags: Array.isArray(post.hashtags) ? post.hashtags.filter((t) => typeof t === "string") : [],
    pinned: typeof post.pinned === "string" ? post.pinned : "",
  };
}

/** The folders of episodes/ that hold an episode.json: the only names a URL may use for a dossier. */
function episodeDirs() {
  let dirs = [];
  try {
    dirs = fs.readdirSync(EPISODES, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    // no episodes/ yet
  }
  return dirs.filter((dir) => fs.existsSync(path.join(EPISODES, dir, "episode.json")));
}

/** What a dossier is called. An episode.json caught half-written says nothing: the folder name ("002-airbag") does. */
function named(ep, dir) {
  const [, num, rest] = /^(\d+)-(.+)$/.exec(dir) ?? [];
  return { id: String(ep.id ?? num ?? dir), slug: String(ep.slug ?? rest ?? dir), title: String(ep.title ?? rest ?? dir) };
}

/** Every episode folder, newest id first. Renders are named after the folder. */
function dossiers() {
  return episodeDirs()
    .map((dir) => {
      // an episode.json caught half-written must not take the desk down: fall back on the folder name
      const ep = readJson(path.join(EPISODES, dir, "episode.json")) ?? {};
      const files = {
        video: rendered(`${dir}.mp4`),
        cover: rendered(`${dir}-couverture.png`),
        preview: rendered(`${dir}-apercu.mp4`),
      };
      return {
        ...named(ep, dir),
        dir,
        post: postOf(ep.post),
        files,
        ready: files.video !== null,
        booth: boothOf(dir) !== null, // a voice comped phrase by phrase: its recordings can be compared on /voix.html
      };
    })
    .sort((a, b) => b.id.localeCompare(a.id, "fr", { numeric: true }) || b.dir.localeCompare(a.dir));
}

function profile() {
  const p = readJson(path.join(BRAND, "profil.json")) ?? {};
  return { name: String(p.name ?? ""), handle: String(p.handle ?? ""), bio: String(p.bio ?? "") };
}

/* ---------------------------------------------------------------- the listening booth: what was recorded */

/** A refusal a route words itself — a status and what to tell the phone: handle() answers it as it is. */
const refuse = (status, message) => Object.assign(new Error(message), { status });

const isMap = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
/** object[key] for a key that came in a URL or a body: its own entries only, never what every object inherits. */
const own = (object, key) => (isMap(object) && Object.hasOwn(object, key) ? object[key] : undefined);

/**
 * audio/vo.json of an episode, when it carries a booth: its voice was comped phrase by phrase out of
 * several recordings (voice.mjs). The single-take voice of the first episodes has none: null.
 */
function boothOf(dir) {
  const vo = readJson(path.join(EPISODES, dir, "audio", "vo.json"));
  const booth = vo?.booth;
  return isMap(vo?.comp) && isMap(booth) && isMap(booth.names) && isMap(booth.auto) && isMap(booth.beats) ? vo : null;
}

/** Seconds of sound in a PCM WAV, as its header counts them (bytes of samples ÷ bytes per second), or null. */
function wavSeconds(file) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const head = Buffer.alloc(1024); // "fmt " and the start of "data" come first, with at most a small tag chunk between them
    const got = fs.readSync(fd, head, 0, head.length, 0);
    if (head.toString("latin1", 0, 4) !== "RIFF" || head.toString("latin1", 8, 12) !== "WAVE") return null;
    let perSecond = 0;
    for (let pos = 12; pos + 8 <= got; ) {
      const id = head.toString("latin1", pos, pos + 4);
      const length = head.readUInt32LE(pos + 4);
      if (id === "data") return perSecond > 0 ? Math.round((length / perSecond) * 1000) / 1000 : null;
      if (id === "fmt " && pos + 20 <= got) perSecond = head.readUInt32LE(pos + 16);
      pos += 8 + length + (length % 2); // chunks are padded to an even size
    }
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/** The whole comp as one file (audio/voix.wav), or null when it could not be assembled (no ffmpeg on this PC). */
function compOf(dir) {
  try {
    const file = path.join(EPISODES, dir, "audio", "voix.wav");
    const st = fs.statSync(file);
    if (!st.isFile()) return null;
    // rewritten at every new choice under the same name: its modification time is what tells the phone to fetch it again
    return { url: `/voix-audio/${encodeURIComponent(dir)}/comp`, bytes: st.size, mtime: Math.round(st.mtimeMs), seconds: wavSeconds(file) };
  } catch {
    return null;
  }
}

/**
 * The booth of one episode as its page needs it, rebuilt from the disk on every request like the rest
 * of the desk: each phrase, what the measurements chose for it, what the ear chose, and every recording
 * it can be heard in. Throws a refusal when there is no booth to open.
 */
function boothSession(dir) {
  const folder = path.join(EPISODES, dir);
  const { id, title } = named(readJson(path.join(folder, "episode.json")) ?? {}, dir);
  const vo = boothOf(dir);
  if (!vo) {
    throw refuse(
      404,
      fs.existsSync(path.join(folder, "audio", "vo.json"))
        ? `Le dossier ${id} n'a pas de cabine : sa voix n'a pas été montée prise par prise, il n'y a rien à comparer.`
        : `Le dossier ${id} n'a pas encore de voix : pas de cabine.`,
    );
  }
  let ep;
  let sched;
  try {
    ep = loadEpisode(folder);
    sched = schedule(ep);
  } catch (err) {
    // an episode.json or a vo.json caught half-written (a voice session running on the PC): it will read again in a moment
    console.error(`  ✗ cabine ${dir}: ${err.message}`);
    throw refuse(500, `Le dossier ${id} est illisible pour l'instant (episode.json ou audio/vo.json). Réessaie dans un instant.`);
  }
  // The comp no longer speaks this script (a phrase or its direction changed since the recordings):
  // nothing the booth would play is what the film will say.
  if (sched.estimated) {
    // (between backticks: what to type — the page sets it as code, so that "--" stays two hyphens)
    throw refuse(409, `La voix du dossier ${id} ne correspond plus à son script. Relance \`npm run voice -- ${id}\` sur le PC : sans \`--budget\` il n'enregistre rien, il dit ce qu'il manque.`);
  }

  const { picks, notes } = readPicks(folder);
  const { names, auto, beats: told } = vo.booth;
  const order = Object.keys(names); // as voice.mjs lists them, whole takes in the order they were recorded: "Prise 1" stays first
  const timing = new Map(sched.beats.map((b) => [b.id, b]));
  const num = (x) => (Number.isFinite(x) ? Math.round(x * 100) / 100 : null);
  const beats = ep.beats.map((beat) => {
    const { mood = "", takes } = own(told, beat.id) ?? {};
    const chosen = own(vo.comp, beat.id) ?? null;
    const note = own(notes, beat.id);
    const { start, end } = timing.get(beat.id);
    return {
      id: beat.id,
      text: beat.tokens.map((t) => t.d).join(" "), // as the viewer reads it: accents unmarked, "[50 km/h|Cinquante…]" shown as "50 km/h"
      vo: typeof beat.vo === "string" ? beat.vo : "",
      voAlt: Array.isArray(beat.voAlt) ? beat.voAlt.filter((line) => typeof line === "string") : [], // the other ways a retake may have been directed
      mood: String(mood),
      start, // where the phrase sits in the comp, in seconds
      end,
      chosen,
      auto: own(auto, beat.id) ?? null,
      // the ear's choice, as long as it is the one in the comp: voice.mjs ignores a pick whose recording was redone since
      manual: own(picks, beat.id) === chosen,
      note: typeof note === "string" ? note : "",
      takes: order
        .filter((rec) => isMap(own(takes, rec))) // not every recording has every phrase (a retake holds two or three)
        .map((rec) => {
          const t = takes[rec];
          return {
            id: rec,
            name: String(names[rec]),
            mood: String(t.mood ?? mood), // the intention this recording was given: a retake may try another one than the script's
            score: num(t.score),
            flags: Array.isArray(t.flags) ? t.flags.map(String) : [],
            register: num(t.register),
            spread: num(t.spread),
            rate: num(t.rate),
            pause: num(t.pause),
            seconds: num(t.seconds),
            level: num(t.level),
            url: `/voix-audio/${encodeURIComponent(dir)}/${encodeURIComponent(rec)}/${encodeURIComponent(beat.id)}`,
          };
        }),
    };
  });
  const comp = compOf(dir);
  return {
    dir,
    id,
    title,
    // Seconds of the comp. Read in the file when it is there: a build re-mixes it (a new "lead", a new
    // "hold") without touching vo.json, whose own figure then lags behind what is heard.
    duration: comp?.seconds ?? (Number.isFinite(vo.duration) ? vo.duration : null),
    comp,
    rendered: rendered(`${dir}.mp4`)?.mtime ?? null, // when the film on the desk was rendered: before this comp, or after?
    beats,
  };
}

/* ---------------------------------------------------------------- answers */

function text(res, status, message, headers = {}) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers });
  res.end(`${message}\n`);
}

function json(req, res, data) {
  const body = Buffer.from(JSON.stringify(data));
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(req.method === "HEAD" ? undefined : body);
}

const attachment = (name) =>
  `attachment; filename="${name.replace(/[^\x20-\x7e]|["\\]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(name)}`;

/**
 * Stream one file, with byte ranges: iOS Safari refuses to play a video from a server that
 * cannot answer `Range` with a 206.
 */
function sendFile(req, res, file, { download = false } = {}) {
  let st;
  try {
    st = fs.statSync(file);
  } catch {
    return text(res, 404, "Introuvable");
  }
  if (!st.isFile()) return text(res, 404, "Introuvable");

  const size = st.size;
  const etag = `"${size.toString(16)}-${Math.round(st.mtimeMs).toString(16)}"`;
  const modified = st.mtime.toUTCString();
  const headers = {
    "Content-Type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache", // always revalidated: a re-render is never served stale
    ETag: etag,
    "Last-Modified": modified,
    "X-Content-Type-Options": "nosniff",
  };
  if (download) headers["Content-Disposition"] = attachment(path.basename(file));

  if (req.headers["if-none-match"] === etag) {
    res.writeHead(304, headers);
    return res.end();
  }

  let start = 0;
  let end = size - 1;
  let status = 200;
  const range = req.headers.range;
  const ifRange = req.headers["if-range"];
  // a range asked against another version of the file (If-Range) gets the whole new file instead
  if (range && size > 0 && (!ifRange || ifRange === etag || ifRange === modified)) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    // several ranges, or another unit: the header is ignored and the whole file is sent
    if (m && (m[1] !== "" || m[2] !== "")) {
      if (m[1] === "") start = Math.max(0, size - Number(m[2])); // "-500": the last 500 bytes
      else {
        start = Number(m[1]);
        if (m[2] !== "") end = Math.min(Number(m[2]), size - 1);
      }
      if (start > end) {
        res.writeHead(416, { ...headers, "Content-Range": `bytes */${size}`, "Content-Length": 0 });
        return res.end();
      }
      status = 206;
      headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
    }
  }

  headers["Content-Length"] = end - start + 1;
  res.writeHead(status, headers);
  if (req.method === "HEAD" || size === 0) return res.end();
  const stream = fs.createReadStream(file, { start, end });
  stream.on("error", () => res.destroy());
  res.on("close", () => stream.destroy()); // the phone gave up (seek, closed tab): stop reading
  stream.pipe(res);
}

/* ---------------------------------------------------------------- the listening booth: the ear's choices */

const BODY_MAX = 16 * 1024; // a POST carries a few ids and short notes: anything bigger does not come from the booth's page
const NOTE_MAX = 400; // what voice.mjs keeps of a note: a longer one is refused here rather than cut there without a word
const TOO_BIG = `Corps trop gros : ${BODY_MAX} octets au plus`;
const NO_DOSSIER = "Ce dossier n'existe pas sur le PC";
const shown = (value) => String(value).slice(0, 40); // an id sent by the phone, quoted back in a refusal

/**
 * Does this POST come from one of the desk's own pages? There is no password here: any page open on
 * any device of the Wi-Fi could post to this address. Browsers name the page that sends (Origin) on
 * every POST, and it has to be this very server. No Origin at all is a tool on the PC (curl), not a page.
 */
function ownPage(req) {
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  try {
    const from = new URL(origin);
    return from.host === new URL(`${from.protocol}//${req.headers.host}`).host; // both read the same way: case, default port
  } catch {
    return false; // "null" (a sandboxed page, a local file), or no Host to compare with
  }
}

/** The body of a request, up to `max` bytes — counted as they arrive, whatever Content-Length claims. */
function readBody(req, max) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const take = (chunk) => {
      size += chunk.length;
      if (size <= max) return void chunks.push(chunk);
      req.off("data", take); // the rest falls on the floor: the refusal leaves on a connection that is still whole
      reject(refuse(413, TOO_BIG));
    };
    req.on("data", take);
    req.once("end", () => resolve(Buffer.concat(chunks)));
    req.once("error", () => reject(refuse(400, "Requête interrompue")));
    req.once("close", () => reject(refuse(400, "Requête interrompue"))); // the phone gave up half-way (after "end", this changes nothing)
  });
}

/**
 * What the booth's page may ask for — { picks?: { phrase: recording | null }, notes?: { phrase: "…" } } —
 * checked against the session on disk. Left to itself, choose() takes a recording that does not exist
 * for the phrase, writes it in picks.json and keeps it out of the comp without a word.
 */
function boothPatch(asked, session) {
  if (!isMap(asked)) throw refuse(400, "Corps attendu : { picks: { phrase: enregistrement ou null }, notes: { phrase: texte } }");
  const stray = Object.keys(asked).find((key) => key !== "picks" && key !== "notes");
  if (stray !== undefined) throw refuse(400, `Champ inconnu : ${shown(stray)}`);
  const { picks = {}, notes = {} } = asked;
  if (!isMap(picks) || !isMap(notes)) throw refuse(400, "picks et notes sont des objets { phrase: valeur }");
  const beats = new Map(session.beats.map((b) => [b.id, b]));
  for (const id of [...Object.keys(picks), ...Object.keys(notes)]) {
    if (!beats.has(id)) throw refuse(400, `Phrase inconnue : ${shown(id)}`);
  }
  for (const [id, rec] of Object.entries(picks)) {
    // null hands the phrase back to the measurements
    if (rec !== null && !beats.get(id).takes.some((t) => t.id === rec)) throw refuse(400, `Enregistrement inconnu pour la phrase ${id} : ${shown(rec)}`);
  }
  for (const [id, words] of Object.entries(notes)) {
    if (typeof words !== "string") throw refuse(400, `La note de la phrase ${id} doit être un texte`);
    if (words.trim().length > NOTE_MAX) throw refuse(400, `Note trop longue pour la phrase ${id} : ${NOTE_MAX} caractères au plus`);
  }
  return { picks, notes };
}

// One comp at a time. choose() rewrites picks.json, vo.json and voix.wav and runs ffmpeg: two of them
// at once would cross their files. Each POST waits for the one before it, whatever its dossier.
let turn = Promise.resolve();
function inTurn(job) {
  const done = turn.then(job);
  turn = done.catch(() => {}); // a refusal must not hold up the next in line
  return done;
}

/** POST /api/voix/<dossier>: keep these recordings and these notes, then answer with the booth as it now stands. */
async function boothPost(req, res, dir) {
  if (!ownPage(req)) return text(res, 403, "Origine refusée : seule la page de la cabine peut envoyer un choix");
  // JSON and nothing else: a form on another site cannot send that type, and a script there has to ask first (and is told no)
  if (!/^application\/json\s*(;|$)/i.test(req.headers["content-type"] ?? "")) return text(res, 415, "Type refusé : envoie du JSON (Content-Type: application/json)");
  if (Number(req.headers["content-length"]) > BODY_MAX) return text(res, 413, TOO_BIG);
  if (!dir) return text(res, 404, NO_DOSSIER);
  const body = await readBody(req, BODY_MAX);
  let asked;
  try {
    asked = JSON.parse(body.toString("utf8"));
  } catch {
    return text(res, 400, "JSON illisible");
  }
  const { patch, session } = await inTurn(async () => {
    const patch = boothPatch(asked, boothSession(dir)); // against the disk as the POST before this one left it
    try {
      await choose(path.join(EPISODES, dir), patch);
    } catch (err) {
      // choose() words what it will not keep (unknown phrase, malformed recording id) for Merwan: passed on as it is
      if (/^(Phrase inconnue|Enregistrement invalide)/.test(err.message)) throw refuse(400, err.message);
      // anything else is a comp that failed on this PC (ffmpeg, a file gone); a system error keeps its paths for this window
      console.error(`  ✗ cabine ${dir}: ${err.stack ?? err.message}`);
      const plain = err.constructor === Error && !err.code;
      throw refuse(500, `Le montage a échoué sur le PC${plain ? ` : ${err.message}` : " (le détail est dans la fenêtre du serveur)"}`);
    }
    return { patch, session: boothSession(dir) };
  });
  const name = (id, rec) => session.beats.find((b) => b.id === id)?.takes.find((t) => t.id === rec)?.name ?? rec;
  const said = [
    ...Object.entries(patch.picks).map(([id, rec]) => `${id} → ${rec === null ? "auto" : name(id, rec)}`),
    ...Object.keys(patch.notes).map((id) => `note sur ${id}`),
  ];
  note(`cabine ${dir} : ${said.length > 3 ? `${said.length} changements` : said.join(", ") || "montage refait"} (${who(req)})`);
  return json(req, res, session);
}

/** `file` (absolute) when it sits inside `folder`, else null — judged on the resolved path, once every ".." has been played out. */
function within(folder, file) {
  const rel = path.relative(folder, file);
  return rel !== "" && rel.split(path.sep)[0] !== ".." && !path.isAbsolute(rel) ? file : null;
}

/**
 * A sound of the booth: "comp" is the whole comp, "<recording>/<phrase>" the excerpt of one phrase in
 * one recording. The URL only names things; the file is the one vo.json gives for them, and it has to
 * be an MP3 inside the episode's audio folder — vo.json is a file like another, not trusted to point anywhere.
 */
function boothSound(req, res, dir, names) {
  const audio = path.join(EPISODES, dir, "audio");
  if (names.length === 1) return names[0] === "comp" ? sendFile(req, res, path.join(audio, "voix.wav")) : text(res, 404, "Introuvable");
  const [rec, beat] = names;
  const clip = own(own(own(own(boothOf(dir)?.booth.beats, beat), "takes"), rec), "clip");
  const file = typeof clip === "string" ? within(audio, path.resolve(EPISODES, dir, clip)) : null;
  if (!file || path.extname(file).toLowerCase() !== ".mp3") return text(res, 404, "Introuvable");
  return sendFile(req, res, file);
}

/* ---------------------------------------------------------------- routes */

const who = (req) => (req.socket.remoteAddress ?? "?").replace(/^::ffff:/, "");
const note = (message) => console.log(`  ${new Date().toLocaleTimeString("fr-FR")}  ${message}`);

function route(req, res) {
  const raw = req.url ?? "/";
  const q = raw.indexOf("?");
  let pathname = null;
  try {
    pathname = decodeURIComponent(q === -1 ? raw : raw.slice(0, q));
  } catch {
    // unreadable: said below, once the method has been looked at
  }
  // The desk only reads. One address takes a POST: the booth of a dossier, for the ear's choices.
  const booth = pathname !== null && /^\/api\/voix\/[^/]+$/.test(pathname);
  if (req.method !== "GET" && req.method !== "HEAD" && !(booth && req.method === "POST")) {
    return text(res, 405, "Méthode refusée", { Allow: booth ? "GET, HEAD, POST" : "GET, HEAD" });
  }
  if (pathname === null) return text(res, 400, "Adresse illisible");
  // Nothing is normalised for us (no URL parser): a path that tries to climb, in any encoding, stops here.
  if (!pathname.startsWith("/") || pathname.includes("..") || /[\\:\0]/.test(pathname)) return text(res, 403, "Chemin refusé");
  const download = new URLSearchParams(q === -1 ? "" : raw.slice(q + 1)).get("dl") === "1";

  if (pathname === "/") {
    if (req.method === "GET") note(`page ouverte depuis ${who(req)}`);
    return sendFile(req, res, path.join(FRONT, "index.html"));
  }
  if (pathname === "/api/dossiers") return json(req, res, { profile: profile(), dossiers: dossiers() });
  if (pathname === "/brand/avatar.png") return sendFile(req, res, path.join(BRAND, "avatar.png"), { download });

  const parts = pathname.slice(1).split("/");
  // The booth: "/api/voix/<dossier>" and "/voix-audio/<dossier>/…". The dossier is a real folder of
  // episodes/ or nothing — like every name here, looked up in the listing, never joined to a path as it came.
  const dossier = (name) => (episodeDirs().includes(name) ? name : null);
  if (booth) {
    if (req.method === "POST") return boothPost(req, res, dossier(parts[2]));
    return dossier(parts[2]) ? json(req, res, boothSession(parts[2])) : text(res, 404, NO_DOSSIER);
  }
  if (parts[0] === "voix-audio" && (parts.length === 3 || parts.length === 4)) {
    return dossier(parts[1]) ? boothSound(req, res, parts[1], parts.slice(2)) : text(res, 404, "Introuvable");
  }

  // Everything else is "<file>" (front/) or "<prefix>/<file>": one basename, which must be a real
  // entry of its whitelisted folder — the name is matched against the listing, never used to build a path blindly.
  const folder = parts.length === 1 ? FOLDERS[""] : parts.length === 2 && parts[0] ? FOLDERS[parts[0]] : undefined;
  const name = parts.at(-1);
  if (!folder || !name || !folder.types.includes(path.extname(name).toLowerCase())) return text(res, 404, "Introuvable");
  let names = [];
  try {
    names = fs.readdirSync(folder.dir);
  } catch {
    // folder not there yet (no render so far)
  }
  if (!names.includes(name)) return text(res, 404, "Introuvable");
  if (download && req.method === "GET" && !req.headers.range) note(`téléchargement de ${name} (${who(req)})`);
  return sendFile(req, res, path.join(folder.dir, name), { download });
}

async function handle(req, res) {
  try {
    await route(req, res); // the booth's routes answer later (a body to read, a comp to redo): their failures land here too
  } catch (err) {
    if (err.status && !res.headersSent) return text(res, err.status, err.message); // a refusal the route worded itself
    console.error(`  ✗ ${req.url}: ${err.message}`);
    if (res.headersSent) res.destroy();
    else text(res, 500, "Erreur interne");
  }
}

/* ---------------------------------------------------------------- start */

/** Every non-loopback IPv4 of this machine, the Wi-Fi first. */
function lanAddresses() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const a of list ?? []) {
      if ((a.family === "IPv4" || a.family === 4) && !a.internal) out.push({ name, address: a.address });
    }
  }
  const rank = (x) => (x.address.startsWith("169.254.") ? 2 : /wi-?fi|wlan|wireless/i.test(x.name) ? 0 : 1);
  return out.sort((a, b) => rank(a) - rank(b));
}

function banner(port) {
  const name = profile().name;
  const lan = lanAddresses();
  const pad = (s) => s.padEnd(14);
  console.log(`\n  Bureau de publication${name ? ` · ${name}` : ""}\n`);
  console.log(`  ${pad("Sur ce PC")}http://localhost:${port}`);
  if (lan.length === 0) console.log(`  ${pad("Sur l'iPhone")}aucune adresse réseau trouvée : ce PC est-il connecté au Wi-Fi ?`);
  const width = Math.max(...lan.map((a) => `http://${a.address}:${port}`.length), 0);
  lan.forEach((a, i) => console.log(`  ${pad(i === 0 ? "Sur l'iPhone" : "")}${`http://${a.address}:${port}`.padEnd(width)}   (${a.name})`));
  console.log(`\n  L'iPhone doit être sur le même Wi-Fi que ce PC. La page relit le disque à chaque ouverture.`);
  console.log(`  Ctrl+C pour arrêter.\n`);
}

/** Start the desk. Resolves with the http.Server once it listens; the process then stays alive. */
export function front({ port = 4173 } = {}) {
  return new Promise((resolve, reject) => {
    if (!Number.isInteger(port) || port < 1 || port > 65535) return reject(new Error(`Port invalide : ${port} (ex : --port 4173)`));
    const server = http.createServer(handle);
    server.once("error", (err) =>
      reject(
        err.code === "EADDRINUSE"
          ? new Error(`Le port ${port} est déjà pris. Essaie : npm run front -- --port ${port + 1}`)
          : new Error(`Impossible d'ouvrir le port ${port} : ${err.message}`),
      ),
    );
    server.listen(port, "0.0.0.0", () => {
      banner(port);
      resolve(server);
    });
  });
}
