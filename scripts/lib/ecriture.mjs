// Writing checks for a script, read by `npm run script`: a short (001…) against docs/recette-script.md,
// a long (L01…) against docs/recette-long.md (« L'écriture d'un long »), a hors-série (HS01…, the promo of a long)
// against docs/recette-promo.md. Warnings only: nothing is blocked, nothing is written.
import { plainText } from "./episode.mjs";

const words = (s) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
const norm = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[’`]/g, "'").toLowerCase();
const TAG = /\[([^\]|]+)\]/g; // a direction or a pause; [shown|said] has a bar and is not a tag
const PAUSE = /^(short |long )?pause$/i;
const BANNED = ["urgent", "dramatic", "ominous", "low, grave voice", "relieved", "nervous", "slowly"];
const MENACE = ["accroche", "promesse", "scene", "zero", "reponse", "chute"]; // never [amused] there: a threat, a victim, a verdict
const END = ["chute", "comment", "like", "abo", "boucle"];
const YOU = /(^|[\s(«"])((tu|te|toi|ton|ta|tes)(?=[\s,.;:!?…»"]|$)|t['’])/iu;
const WEAK = /(tu le tentes|tu y vas|tu as déjà|a déjà|il a quel âge|tu le savais)/iu;

export function ecriture(ep, sched) {
  if (/^L\d{2}$/.test(String(ep.id))) return ecritureLong(ep, sched);
  if (/^HS\d{2}$/.test(String(ep.id))) return ecritureHorsSerie(ep, sched);
  if (!/^\d{3}$/.test(String(ep.id))) return null;
  const out = [];
  const warn = (msg) => out.push(msg);
  const ids = ep.beats.map((b) => b.id);
  const beat = (id) => ep.beats.find((b) => b.id === id);
  const plain = (b) => plainText(b.tokens);
  const shown = (b) => b.tokens.map((t) => t.d).join(" ");
  const spoken = (b) => (b.vo ?? plain(b)).replace(TAG, " ");

  // 1. the word budget: the film, the hook (A·B·C), the scene (the costliest ten seconds of the curve)
  const total = ep.beats.reduce((n, b) => n + words(plain(b)).length, 0);
  if (total > 265) warn(`${total} mots affichés : au-delà de 265 le film passe ≈ 95 s — couper la scène et le commentaire d'abord`);
  if (total < 240) warn(`${total} mots affichés : sous 240, vérifier que le film tient ses ≈ 85 s (60 s au moins)`);
  const sceneAt = ids.indexOf("scene");
  const hook = ep.beats.slice(0, sceneAt > 0 ? sceneAt : Math.min(2, ep.beats.length));
  const hookWords = hook.reduce((n, b) => n + words(plain(b)).length, 0);
  if (hookWords < 26 || hookWords > 32) warn(`accroche (${hook.map((b) => b.id).join(" + ")}) : ${hookWords} mots — 26 à 32, finis avant 10 s`);
  const hookEnd = sched.beats.find((b) => b.id === hook.at(-1)?.id)?.end;
  if (!sched.estimated && hookEnd > 10.5) warn(`l'accroche finit à ${hookEnd.toFixed(1)} s : A·B·C avant 10 s`);
  const scene = beat("scene");
  if (scene) {
    const n = words(plain(scene)).length;
    if (n > 30) warn(`scène : ${n} mots — 30 au plus (≈ 9 s) : c'est la zone qui coûte le plus (10 → 25 s)`);
    const vo = scene.vo ?? "";
    const pauses = (vo.match(/\[short pause\]/gi) ?? []).length + (vo.match(/\.\.\.|…/g) ?? []).length;
    if (pauses > 1) warn(`scène : ${pauses} pauses ([short pause], « ... ») — une seule : elle se dit vite (015 : une pause, +4 % de débit ; 025 : deux, −9 %)`);
    if (/^(ce n'est pas un scénario|sans (elle|lui)|\d|(un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|vingt|trente)\b.*\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b)/iu.test(plain(scene).trim()))
      warn("scène : elle commence par une date, un « Sans elle » ou un méta — elle reste dans l'instant de l'accroche");
  }

  // 2. the first three seconds: a short first sentence, "you" at once, the shock word declared and on time
  const first = plain(ep.beats[0]);
  const firstSentence = first.split(/(?<=[.?!…])\s+/)[0] ?? first;
  if (words(firstSentence).length > 8) warn(`première phrase : ${words(firstSentence).length} mots — huit au plus, elle finit sur le mot-choc`);
  const opening = ep.beats.slice(0, 2).map(plain).join(" ").split(/\s+/).slice(0, 10).join(" ");
  if (!YOU.test(opening)) warn("aucune 2ᵉ personne dans les dix premiers mots (ta, ton, tes, tu…)");
  if (ep.cues?.choc == null) warn('pas de repère "choc" : déclare le mot-choc de l\'accroche ("choc": "accroche:mot")');
  else if (sched.cues?.choc != null) {
    const t = sched.cues.choc;
    const b0 = sched.beats[0];
    const index = b0?.words?.findIndex((w) => w.e > t + 0.05) ?? -1;
    if (sched.estimated) {
      if (index >= 8) warn(`mot-choc : ${index + 1}ᵉ parole — avant la 8ᵉ (minutage estimé ; avec la voix : avant 3 s)`);
    } else if (t > 3.05) warn(`mot-choc à ${t.toFixed(2)} s — avant 3 s (les trois films qui ont percé : 2,3 à 3,2 s)`);
  }

  // 3. the signature, word for word, once, in its own beat
  const signature = ep.beats.filter((b) => /on l['’]ouvre/i.test(plain(b)));
  if (signature.length !== 1) warn(`« Alors… on l'ouvre. » : ${signature.length} fois — une seule, dans son beat`);
  for (const b of signature) {
    if (b.text.trim() !== "Alors… on l'ouvre.") warn(`« ${b.text.trim()} » : la phrase signature s'écrit « Alors… on l'ouvre. », mot pour mot, seule`);
    if (!/^\[calm\]/i.test((b.vo ?? "").trim())) warn("« Alors… on l'ouvre. » se dirige [calm]");
    if (ids.indexOf(b.id) === 0) warn("« Alors… on l'ouvre. » ne commence jamais le film");
  }

  // 4. the end, since 018: the fall, what is owed and the comment, the like, the next file, the loop
  const at = END.map((id) => ids.indexOf(id));
  if (at.includes(-1)) warn(`la fin attend ${END.join(" → ")} (manque : ${END.filter((id, i) => at[i] < 0).join(", ")})`);
  else if (at.some((x, i) => i > 0 && x < at[i - 1])) warn(`ordre de la fin : ${END.join(" → ")} (ici : ${ids.filter((id) => END.includes(id)).join(" → ")})`);
  const abo = beat("abo");
  if (abo && /abonne/i.test(plain(abo))) warn("prochain dossier : la voix ne redemande pas l'abonnement (le seuil l'a fait, le panneau le porte)");

  // 5. the threshold: two words of asking and a promise, three seconds, never in the hook
  const seuil = beat("seuil");
  if (!seuil) warn("pas de seuil : « Abonne-toi : … » à la porte de l'acte 3");
  else {
    if (!/^abonne-toi/i.test(plain(seuil).trim())) warn("seuil : il commence par « Abonne-toi »");
    if (words(plain(seuil)).length > 10) warn(`seuil : ${words(plain(seuil)).length} mots — dix au plus (3 s)`);
    if (ids.indexOf("zero") >= 0 && ids.indexOf("seuil") > ids.indexOf("zero")) warn("seuil : avant l'acte 3 (zero), pas après");
    const s = sched.beats.find((b) => b.id === "seuil");
    if (s && s.start < 12) warn(`seuil à ${s.start.toFixed(1)} s : jamais dans l'accroche`);
  }

  // 6. the loop: unfinished on screen, suspended in the voice
  const loop = beat("boucle");
  if (loop) {
    if (!/…\s*$/.test(loop.text)) warn("boucle : elle finit par « … » à l'écran");
    if (!/,\s*$/.test(loop.vo ?? "")) warn("boucle : son vo finit par une virgule (la voix reste en l'air)");
    if (words(plain(loop)).length > 7) warn(`boucle : ${words(plain(loop)).length} mots — une demi-phrase, deux secondes au plus`);
  }

  // 7. the comment: a closed question, two camps, a one-word answer
  const comment = beat("comment");
  if (comment) {
    const text = plain(comment);
    if (!/commentaire/i.test(text)) warn("commentaire : « En commentaire : … » n'est pas dit");
    const question = (text.match(/[^.?!:]*\?/g) ?? []).at(-1)?.trim() ?? "";
    if (!/\?\s*$/.test(text)) warn("commentaire : la phrase finit par la question");
    else {
      if (!/\bou\b/i.test(question)) warn(`question du commentaire « ${question} » : deux camps ? (« … ou … ? », une réponse d'un mot)`);
      if (WEAK.test(question)) warn(`question du commentaire « ${question} » : une forme qui n'a fait commenter personne (« tu le tentes ? », « tu as déjà… ? »)`);
    }
  }

  // 8. the directions: one per beat, at the head; none of the banned ones; [amused] once, never on a threat
  let amused = 0;
  const heads = [];
  for (const b of ep.beats) {
    const vo = (b.vo ?? "").trim();
    const tags = [...vo.matchAll(TAG)].map((m) => m[1].trim());
    const dirs = tags.filter((t) => !PAUSE.test(t));
    if (dirs.length > 1) warn(`${b.id} : ${dirs.length} balises (${dirs.join(", ")}) — une seule, en tête de ligne`);
    else if (dirs.length === 1 && !vo.startsWith(`[${dirs[0]}]`)) warn(`${b.id} : [${dirs[0]}] au milieu de la ligne — en tête`);
    for (const t of dirs) if (BANNED.includes(t.toLowerCase())) warn(`${b.id} : [${t}] est interdite sur un court`);
    if (dirs.some((t) => /amused/i.test(t))) {
      amused++;
      if (MENACE.includes(b.id)) warn(`${b.id} : [amused] sur une menace ou un verdict — seulement sur un paradoxe de l'autopsie`);
    }
    heads.push(dirs[0]?.toLowerCase() ?? null);
    const said = spoken(b);
    const caps = said.match(/\b\p{Lu}{3,}\b/gu);
    if (caps) warn(`${b.id} : MAJUSCULES dans la voix (${caps.join(", ")}) — crié ou épelé`);
    if (/!/.test(said)) warn(`${b.id} : un « ! » dans la voix — jamais`);
    if (/\d\s*(µ|m)?s\b/u.test(shown(b))) warn(`${b.id} : une unité à symbole dans les sous-titres (« µs » se lit « MS » en capitales) — en toutes lettres`);
  }
  if (amused > 1) warn(`[amused] ${amused} fois — une au plus par film`);
  for (let i = 2; i < heads.length; i++) {
    if (heads[i] && heads[i] === heads[i - 1] && heads[i] === heads[i - 2]) warn(`${ids[i - 2]}, ${ids[i - 1]}, ${ids[i]} : trois fois [${heads[i]}] de suite`);
  }

  // 9. the caption: the searched word first, the comment question last, five hashtags, a pinned of 150 characters
  const post = ep.post ?? {};
  if (post.caption) {
    // `post.keyword`: the word people search, when the title is not it; otherwise any word of the title
    const keys = post.keyword ? [norm(post.keyword)] : norm(String(ep.title)).split(/[\s'’-]+/).filter((w) => w.length >= 3);
    const head = norm(post.caption.slice(0, 60));
    if (!keys.some((k) => head.includes(k))) warn(`légende : le mot cherché (« ${post.keyword ?? ep.title} ») dès la première ligne`);
    if (!/\?\s*$/.test(post.caption)) warn("légende : elle finit par la question du commentaire");
  }
  if ((post.hashtags ?? []).length > 5) warn(`légende : ${post.hashtags.length} hashtags — cinq au plus`);
  if (post.pinned && post.pinned.length > 150) warn(`épinglé : ${post.pinned.length} caractères — 150 au plus`);
  return out;
}

/* ---------------------------------------------------------------- the hors-série (the promo of a long, vertical)
   docs/recette-promo.md, rewritten on 21/10 after HS01 and HS02 (« des stats de merde sauf insta »): a short that stands
   on its own — it pays ONE piece of the long and keeps the long's big answer (the C of the hook) for YouTube; no
   announcement before « on l'ouvre », which opens for real; the C comes back as a two-camp comment question; one
   rendezvous; the loop. Measured: 185 words → 64.7 s (HS01), 176 → 60.8 s (HS02), holds included.
   Its own branch: the checks of the shorts above and of the longs below are not touched. */
const HS_TAGS = ["tense", "calm", "conversational, curious", "warm, conversational", "curious", "amused"];
const HS_BANNED = ["serious", "firm, matter-of-fact", "thoughtful", ...BANNED];
const HS_AMUSED_NEVER = ["accroche", "promesse", "curiosite", "scene", "test", "comment", "boucle"]; // the hook, the threat, the question
// what tells a stranger, before anything is opened, that the film is elsewhere (HS01 at 11.3 s, HS02 at 11.1 s)
const HS_META = /(grand format|notre (tout )?(nouveau|nouvelle|premier|premiere)|notre chaine|youtube|jusqu'ici|cette fois|film complet|ce film|on a suivi)/;
const HS_REFUSE = /^pas ici\b/;

function ecritureHorsSerie(ep, sched) {
  const out = [];
  const warn = (msg) => out.push(msg);
  const ids = ep.beats.map((b) => b.id);
  const plain = (b) => plainText(b.tokens);
  const shown = (b) => b.tokens.map((t) => t.d).join(" ");
  const spoken = (b) => (b.vo ?? plain(b)).replace(TAG, " ");
  const time = Object.fromEntries(sched.beats.map((b) => [b.id, b]));
  // the estimate runs ≈ 20 % long against the turbo voice (CLAUDE.md): times are scaled to what the voice will say
  const k = sched.estimated ? 0.8 : 1;
  const est = sched.estimated ? ", minutage estimé × 0,8" : "";
  const fr = (x, d = 1) => Number(x).toFixed(d).replace(".", ",");
  const at = (id) => (time[id] ? `${fr(time[id].start * k)} s` : "?");
  const index = (b) => ep.beats.indexOf(b);
  const questionOf = (b) => (plain(b).match(/[^.?!:]*\?/g) ?? []).at(-1)?.trim() ?? "";

  // 1. the budget: a short that stands on its own, 62 to 70 s (never under 60) — counted as `npm run script` prints
  //    it, one word per token on screen ("400 000 V" is one), the unit HS01 and HS02 were measured in
  const total = ep.beats.reduce((n, b) => n + b.tokens.filter((t) => /[\p{L}\p{N}]/u.test(t.d)).length, 0);
  if (total > 215) warn(`${total} mots affichés : 215 au plus (≈ 70 s ; HS01 : 185 mots → 64,7 s)`);
  if (total < 190) warn(`${total} mots affichés : 190 à 215 pour un court qui tient seul (62 à 70 s, jamais sous 60)`);
  if (!sched.estimated && sched.duration < 60) warn(`${fr(sched.duration)} s : jamais sous 60 s`);
  if (!sched.estimated && sched.duration > 72) warn(`${fr(sched.duration)} s : 70 s au plus`);

  // 2. the hook: the long's own, the shock word before 3 s with no "…" before it, A·B·C finished before 10 s
  const hookEndAt = ids.includes("curiosite") ? ids.indexOf("curiosite") : Math.min(2, ep.beats.length - 1);
  const hook = ep.beats.slice(0, hookEndAt + 1);
  const hookIds = new Set(hook.map((b) => b.id));
  const hookWords = hook.reduce((n, b) => n + words(plain(b)).length, 0);
  if (hookWords < 22 || hookWords > 32) warn(`accroche (${hook.map((b) => b.id).join(" + ")}) : ${hookWords} mots — 22 à 32, finis avant 10 s`);
  const hookEnd = time[hook.at(-1)?.id]?.end;
  if (hookEnd != null && hookEnd * k > 10.5) warn(`l'accroche finit à ${fr(hookEnd * k)} s${est} : A·B·C avant 10 s`);
  const first = plain(ep.beats[0]);
  const firstSentence = first.split(/(?<=[.?!…])\s+/)[0] ?? first;
  if (words(firstSentence).length > 8) warn(`première phrase : ${words(firstSentence).length} mots — huit au plus, elle finit sur le mot-choc`);
  const opening = ep.beats.slice(0, 2).map(plain).join(" ").split(/\s+/).slice(0, 10).join(" ");
  if (!YOU.test(opening)) warn("aucune 2ᵉ personne dans les dix premiers mots (ta, ton, tes, tu…)");
  if (ep.cues?.choc == null) warn('pas de repère "choc" : déclare le mot-choc de l\'accroche ("choc": "accroche:mot")');
  else {
    if (sched.cues?.choc != null) {
      const t = sched.cues.choc;
      const w = sched.beats[0]?.words?.findIndex((x) => x.e > t + 0.05) ?? -1;
      if (sched.estimated) {
        if (w >= 8) warn(`mot-choc : ${w + 1}ᵉ parole — avant la 8ᵉ (minutage estimé ; avec la voix : avant 3 s)`);
      } else if (t > 3.05) warn(`mot-choc à ${fr(t, 2)} s — avant 3 s (HS02 : « tuer » à 3,6 s, derrière un « … »)`);
    }
    const [, word] = String(ep.cues.choc).match(/^[^:]+:([^#+$-]+)/) ?? [];
    const vo = norm(ep.beats[0].vo ?? "");
    const cut = word ? vo.indexOf(norm(word).trim()) : -1;
    if (cut > 0 && /\.\.\.|…/.test(vo.slice(0, cut))) warn(`accroche : un « … » avant le mot-choc « ${word} » — la pause le pousse au-delà de 3 s`);
  }

  // 3. nothing announces the long before « on l'ouvre »: at 11 s, HS01 and HS02 said they were an ad
  const signature = ep.beats.filter((b) => /on l['’]ouvre/i.test(plain(b)));
  const signatureAt = signature.length ? index(signature[0]) : -1;
  for (const b of signatureAt >= 0 ? ep.beats.slice(0, signatureAt) : ep.beats) {
    const m = norm(plain(b)).match(HS_META);
    if (m) warn(`${b.id} (${at(b.id)}${est}) : « ${m[0]} » — aucune annonce du long avant « on l'ouvre » (HS01, HS02 : à 11 s, la promo disait qu'elle était une publicité)`);
  }
  const scene = ep.beats.find((b) => b.id === "scene");
  if (!scene) warn("pas de scène (id « scene ») : l'instant de l'accroche, une image et un enjeu de plus par phrase — HS01 et HS02 passaient à une liste de teasers");
  else {
    const n = words(plain(scene)).length;
    if (n < 22 || n > 30) warn(`scène : ${n} mots — 22 à 30 (≈ 9 s)`);
    const vo = scene.vo ?? "";
    const pauses = (vo.match(/\[short pause\]/gi) ?? []).length + (vo.match(/\.\.\.|…/g) ?? []).length;
    if (pauses > 1) warn(`scène : ${pauses} pauses — une seule : elle se dit vite`);
    if (signatureAt >= 0 && index(scene) > signatureAt) warn("scène : avant « on l'ouvre », pas après");
  }

  // 4. the signature: once, word for word, [calm], short — and it opens for real (no « Pas ici. » behind it)
  if (signature.length !== 1) warn(`« Alors… on l'ouvre. » : ${signature.length} fois — une, dans son beat (Merwan : jamais une promo sans elle)`);
  for (const b of signature) {
    if (b.text.trim() !== "Alors… on l'ouvre.") warn(`« ${b.text.trim()} » : la phrase signature s'écrit « Alors… on l'ouvre. », mot pour mot, seule`);
    const head = ((b.vo ?? "").trim().match(/^\[([^\]|]+)\]/) ?? [])[1]?.trim();
    if (!/^calm$/i.test(head ?? "")) warn(`« Alors… on l'ouvre. » : [${head ?? "aucune balise"}] — [calm] (HS01 [casual, charismatic] : 1,76 s ; HS02 [nonchalant, confident] : 1,68 s, « traîne »)`);
    const sb = time[b.id];
    if (!sched.estimated && sb && sb.end - sb.start > 1.5) warn(`« Alors… on l'ouvre. » dure ${fr(sb.end - sb.start, 2)} s — 1,5 s au plus (1,06 à 1,36 s sur les courts) : à reprendre avant le montage`);
    const next = ep.beats[index(b) + 1];
    if (next && HS_REFUSE.test(norm(plain(next)).trim())) warn(`${next.id} : « ${plain(next).trim()} » — l'ouverture refusée ; depuis le HS03, « on l'ouvre » ouvre pour de vrai un morceau du long, payé dans la promo`);
  }

  // 5. the threads ("fil" / "paie", as in a long): the C of the hook is never paid here (it is the click);
  //    one piece of the long is, after « on l'ouvre » (that is what makes the promo stand on its own)
  const threads = threadsOf(ep, sched);
  if (!threads.length) warn('aucun fil déclaré ("fil" / "paie") : la C de l\'accroche (ouverte, jamais payée ici) et le morceau payé — une promo qui ne paie rien est une bande-annonce (HS01 et HS02 : six fils ouverts, aucun payé)');
  else {
    const c = threads.filter((t) => t.opens.some((o) => hookIds.has(o.id)));
    if (!c.length) warn("la C de l'accroche ne porte pas de \"fil\" : c'est la question que la promo laisse au long");
    for (const t of c) if (t.pays.length) warn(`fil « ${t.name} » (l'accroche) payé dans la promo (${t.pays.map((p) => p.id).join(", ")}) — c'est la réponse du long : un spoil`);
    const paid = threads.filter((t) => t.pays.length && !c.includes(t));
    if (!paid.length) warn("aucun morceau payé : la promo doit tenir seule — un fil du long, ouvert et payé ici, après « on l'ouvre »");
    for (const t of paid) {
      if (!t.opens.length) warn(`fil « ${t.name} » : payé sans avoir été ouvert`);
      else if (Math.min(...t.pays.map((p) => p.i)) < Math.min(...t.opens.map((o) => o.i))) warn(`fil « ${t.name} » : payé avant d'être ouvert`);
      if (signatureAt >= 0 && t.pays.every((p) => p.i < signatureAt)) warn(`fil « ${t.name} » : payé avant « on l'ouvre » — le morceau se paie après l'ouverture`);
    }
  }

  // 6. the comment: the C comes back as a closed question with two camps, to check at home — its answer is in the long
  const asked = ep.beats.filter((b, i) => i > hookEndAt && /\?/.test(plain(b)));
  const twoCamps = asked.filter((b) => /\bou\b/i.test(questionOf(b)));
  if (!twoCamps.length) warn("aucune question à deux camps après l'accroche (« … ou … ? ») : la promo n'a rien qui fasse écrire — la C revient, à vérifier chez soi, sa réponse dans le long");
  else if (!ep.beats.some((b) => /commentaire/i.test(plain(b)))) warn("« commentaire » n'est pas dit (« Dis-le en commentaire. »)");
  for (const b of asked) if (WEAK.test(questionOf(b))) warn(`${b.id} : « ${questionOf(b)} » — une forme qui n'a fait commenter personne`);

  // 7. the rendezvous: once, after « on l'ouvre » and after the comment, where the link is; « YouTube » said once
  // (a mention before « on l'ouvre » is an announcement, already reported in 3: only the ones after it are the rendezvous)
  const rdv = ep.beats.filter((b) => /youtube|cha[iî]ne/i.test(plain(b)) && (signatureAt < 0 || index(b) > signatureAt));
  if (!rdv.length) warn("pas de rendez-vous après « on l'ouvre » : « Le film complet… sur notre chaîne YouTube : le lien est en bio. »");
  for (const b of rdv) {
    const n = words(plain(b)).length;
    if (n > 22) warn(`${b.id} : ${n} mots — le rendez-vous tient en une phrase, 20 mots au plus`);
    if (!/\b(bio|lien)\b/i.test(plain(b))) warn(`${b.id} : il ne dit pas où est le lien (« le lien est en bio »)`);
  }
  if (rdv.length > 1) warn(`${rdv.length} phrases parlent de la chaîne ou de YouTube (${rdv.map((b) => b.id).join(", ")}) — un seul rendez-vous`);
  const ytSaid = ep.beats.reduce((n, b) => n + (spoken(b).match(/youtube/gi) ?? []).length, 0);
  if (ytSaid > 1) warn(`« YouTube » dit ${ytSaid} fois — une, au rendez-vous`);
  if (rdv.length && twoCamps.length && index(twoCamps.at(-1)) > index(rdv[0])) warn("ordre de la fin : le commentaire (la C), puis le rendez-vous, puis la boucle");

  // 8. the loop: last, unfinished on screen, suspended in the voice, short
  const loop = ep.beats.at(-1);
  if (loop.id !== "boucle") warn(`la dernière phrase est la boucle (id « boucle »), pas « ${loop.id} »`);
  if (!/…\s*$/.test(loop.text)) warn("boucle : elle finit par « … » à l'écran");
  if (!/,\s*$/.test(loop.vo ?? "")) warn("boucle : son vo finit par une virgule (la voix reste en l'air)");
  if (words(plain(loop)).length > 8) warn(`boucle : ${words(plain(loop)).length} mots — une demi-phrase, deux secondes au plus (la promesse est au rendez-vous)`);

  // 9. the voice: one direction per phrase, at the head, from the promo's table; [serious] sends Eric down
  let amused = 0;
  const heads = [];
  for (const b of ep.beats) {
    const vo = (b.vo ?? "").trim();
    const dirs = [...vo.matchAll(TAG)].map((m) => m[1].trim()).filter((t) => !PAUSE.test(t));
    if (dirs.length > 1) warn(`${b.id} : ${dirs.length} balises (${dirs.join(", ")}) — une seule, en tête de ligne`);
    else if (dirs.length === 1 && !vo.startsWith(`[${dirs[0]}]`)) warn(`${b.id} : [${dirs[0]}] au milieu de la ligne — en tête`);
    for (const t of dirs) {
      const low = t.toLowerCase();
      if (HS_BANNED.includes(low)) warn(`${b.id} : [${t}] — pas sur une promo${low === "serious" ? " (HS01 et HS02 : −1 à −4 dt sous le film, jusque sur le test)" : ""}`);
      else if (!HS_TAGS.includes(low) && !signature.includes(b)) warn(`${b.id} : [${t}] n'est pas dans le tableau de la promo (docs/recette-promo.md, « La voix »)`);
      if (low === "amused") {
        amused++;
        if (HS_AMUSED_NEVER.includes(b.id)) warn(`${b.id} : [amused] sur l'accroche, une menace ou une question — seulement sur un paradoxe mécanique du morceau payé`);
      }
    }
    heads.push(dirs[0]?.toLowerCase() ?? null);
    const said = spoken(b);
    const caps = said.match(/\b\p{Lu}{3,}\b/gu);
    if (caps) warn(`${b.id} : MAJUSCULES dans la voix (${caps.join(", ")}) — crié ou épelé`);
    if (/!/.test(said)) warn(`${b.id} : un « ! » dans la voix — jamais`);
    if (/\d\s*(µ|m)?s\b/u.test(shown(b))) warn(`${b.id} : une unité à symbole dans les sous-titres (« µs » se lit « MS » en capitales) — en toutes lettres`);
  }
  if (amused > 1) warn(`[amused] ${amused} fois — une au plus`);
  for (let i = 2; i < heads.length; i++) {
    if (heads[i] && heads[i] === heads[i - 1] && heads[i] === heads[i - 2]) warn(`${ids[i - 2]}, ${ids[i - 1]}, ${ids[i]} : trois fois [${heads[i]}] de suite`);
  }

  // 10. the sources: each phrase names the beat of the long that pays it ("id ← L0x beat, beat")
  const lines = (ep.sources ?? []).map((l) => String(l).trim());
  for (const b of ep.beats) {
    if (b === loop || signature.includes(b) || HS_REFUSE.test(norm(plain(b)).trim())) continue;
    if (!lines.some((l) => l.startsWith(`${b.id} ←`) || l.startsWith(`${b.id} <-`))) warn(`${b.id} : aucune ligne « ${b.id} ← L0x beat » dans sources — une phrase sans beat payeur dans le long sort du script`);
  }

  // 11. the texts: the searched word first, the two-camp question last, five hashtags, a pinned of 150 characters that
  //     never quotes the long's exact title (it changes under A/B test), a Short title without meta, the way to the long
  const post = ep.post ?? {};
  const keys = post.keyword ? [norm(post.keyword)] : norm(String(ep.title)).split(/[\s'’-]+/).filter((w) => w.length >= 4);
  if (post.keyword && !ep.beats.some((b) => norm(spoken(b)).includes(norm(post.keyword)))) warn(`le mot cherché « ${post.keyword} » n'est jamais dit dans la promo`);
  for (const [where, text, tags] of [
    ["TikTok", post.caption, post.hashtags],
    ["Instagram", post.instagram?.caption, post.instagram?.hashtags],
    ["YouTube", post.youtube?.description, post.youtube?.hashtags],
  ]) {
    if (!text) {
      warn(`${where} : pas de légende`);
      continue;
    }
    if (!keys.some((key) => norm(text.slice(0, 80)).includes(key))) warn(`${where} : le mot cherché (« ${post.keyword ?? ep.title} ») dès la première ligne`);
    if (!/\?\s*$/.test(text.trim())) warn(`${where} : la légende finit par la question à deux camps`);
    if ((tags ?? []).length > 5) warn(`${where} : ${tags.length} hashtags — cinq au plus`);
  }
  if (!post.pinned) warn("pas d'épinglé (post.pinned) : le chemin vers le long et la question");
  else {
    if (post.pinned.length > 150) warn(`épinglé : ${post.pinned.length} caractères — 150 au plus`);
    if (/«\s*[^»]{30,}»/.test(post.pinned)) warn("épinglé : le titre exact du long — il change en test A/B ; « cherche « Système Décodé <mot> » sur YouTube »");
  }
  const ytTitle = post.youtube?.title ?? "";
  if (!ytTitle) warn("YouTube : pas de titre de Short (post.youtube.title)");
  else {
    if (ytTitle.length > 100) warn(`YouTube : titre de ${ytTitle.length} caractères — 100 au plus`);
    if (HS_META.test(norm(ytTitle).replace(/youtube/g, ""))) warn(`YouTube : « ${ytTitle} » — un méta dans le titre du Short (« notre premier grand film ») : l'accroche, avec le mot cherché`);
  }
  if (!post.lien) warn("pas de post.lien : le mode d'emploi du pont vers le long, plateforme par plateforme, pour le bureau");
  return out;
}

/* ---------------------------------------------------------------- the long (YouTube, 16:9)
   docs/recette-long.md, « L'écriture d'un long ». Measured on L01 (8 min 51, 1 663 words) and L02 (9 min 10, 1 787 words):
   ≈ 188 to 195 words a minute, holds included. A long only earns its mid-roll ads above 8 minutes.
   What a script may declare for these checks (all optional, ignored by the rest of the kit):
     cues.titre, cues.miniature   the word that keeps the promise of the title, of the thumbnail — said before 30 s
     beat.fil  ("nom" | ["a","b"]) this phrase opens a thread (or recalls it, when it is already open)
     beat.paie ("nom" | ["a","b"]) this phrase pays it
     post.youtube.keyword         what people type (YouTube's autocomplete): in the title and the first lines of the description */
const LONG_TAGS = ["conversational, curious", "warm, conversational", "curious", "amused", "serious", "tense", "calm", "warm"];
const LONG_BANNED = ["firm, matter-of-fact", "thoughtful", ...BANNED];
const LONG_END = ["chute", "comment", "like", "abo", "boucle"];
const LONG_AMUSED_NEVER = ["accroche", "promesse", "curiosite", "chute", "boucle"]; // the hook, a victim, the verdict
// on normalised text (no accents, straight apostrophes): plain \b works
const SOMMAIRE = /(dans (cette|la) video|dans ce (film|dossier|episode)|au programme|on va (tout )?voir|nous allons|aujourd'hui,? (on|nous) (va|allons))/;
const RECAP = /\b(resumons|en resume|pour resumer|pour conclure|en conclusion|recapitulons)\b/;
const EXIT_CHAPTER = /(retenir|conclusion|resume|recap)/;
const FORWARD = /\b(va|vas|vont|allons|devra|devront|faudra|faudrait|tout a l'heure|a la fin|juste apres|on y arrive|tu verras|on verra|sauf|pourtant|probleme|attention)\b/;
const PROMISE = /(tout a l'heure|a la fin|juste apres|on y arrive|tu verras|on verra|tu vas voir|on va voir|tu l'auras|on te le montre)/;
const LATER = /\b(prochain|prochaine|episode|la semaine|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/;
const NUMBER_WORD = /^(deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingts?|trente|quarante|cinquante|soixante|cents?|mille|millions?|milliards?|et)$/;
const BIG_WORD = /(vingt|trente|quarante|cinquante|soixante|cent|mille|million|milliard)/;
const UNIT = /^(kilos?|kilogrammes?|grammes?|metres?|centimetres?|millimetres?|kilometres?|degres?|volts?|amperes?|watts?|secondes?|minutes?|heures?|jours?|semaines?|mois|ans|annees|fois|tonnes?|litres?|bars?|pour|milliemes?|centiemes?)$/;

const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
// a "…" before a lower-case word is a pause inside the sentence ("S'il casse… il fait des lames."), not its end
const lastSentence = (s) => s.trim().split(/(?<=[.?!])\s+|(?<=…)\s+(?=\p{Lu})/u).filter(Boolean).at(-1) ?? s;
const tail = (s, n = 60) => (s.length <= n ? s : `…${s.slice(s.length - n).replace(/^\S*\s/, "")}`);
const list = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);

/** How a phrase leaves the viewer: on a question, a suspension, a threat, a promise — or flat (null). */
function relance(b, { strict = false } = {}) {
  const text = plainText(b.tokens);
  const last = lastSentence(text);
  if (/\?/.test(last)) return "question";
  if (/…|\.\.\./.test(last)) return "suspension";
  const threat = strict ? b.tokens.slice(-words(last).length).some((t) => t.accent === "danger") : b.tokens.some((t) => t.accent === "danger");
  if (threat) return "menace";
  if (PROMISE.test(norm(text))) return "promesse";
  if (!strict && FORWARD.test(norm(text))) return "relance";
  return null;
}

/**
 * Numbers said in one phrase: a figure on screen ("1500°C", not "SF6"), a spelled-out number of some size
 * ("mille deux cents", "quarante"), or a small one with its unit ("deux kilos", "quatre mètres").
 */
function numbers(b) {
  let n = 0;
  let run = [];
  const isNumber = (w) => w.length > 0 && w.split("-").every((p) => NUMBER_WORD.test(p));
  const close = (next) => {
    if (run.some((w) => w !== "et") && (run.some((w) => BIG_WORD.test(w)) || UNIT.test(next))) n++;
    run = [];
  };
  for (const tok of b.tokens) {
    const w = norm(tok.d).replace(/[^a-z0-9%-]/g, "");
    if (/\d/.test(tok.d) && !/^\p{L}+\d+\p{P}*$/u.test(tok.d.trim())) {
      close(w);
      n++;
    } else if (isNumber(w)) run.push(w);
    else close(w);
  }
  close("");
  return n;
}

/**
 * The pieces of the voice: a new request at each phrase named in voice.parts (the first of a chapter) — except
 * "Alors… on l'ouvre", which rides on the breath of the request before it: the next phrase starts the new one (voice.mjs).
 */
export function requestsOf(ep) {
  const cuts = Array.isArray(ep.voice?.parts) ? ep.voice.parts : [];
  const out = [];
  let pending = false;
  ep.beats.forEach((b, i) => {
    const signature = /on l['’]ouvre/i.test(b.text);
    const cut = i > 0 && cuts.includes(b.id);
    if (i === 0 || (cut && !signature) || pending) out.push({ from: b.id, chars: 0, beats: 0 });
    pending = cut && signature;
    out.at(-1).chars += (b.vo ?? plainText(b.tokens)).length + 2;
    out.at(-1).beats++;
  });
  return out;
}

/** Letters spoken per second in a phrase (real voice only). */
const rateOf = (sb) => {
  const letters = sb.words.reduce((n, w) => n + String(w.ks ?? w.t).replace(/[^\p{L}\p{N}]/gu, "").length, 0);
  return sb.end > sb.start ? letters / (sb.end - sb.start) : 0;
};

/** The chapters of a long, with their times and how each one ends. */
export function chaptersOfLong(ep, sched) {
  const at = Object.fromEntries(sched.beats.map((b) => [b.id, b]));
  const chapters = [];
  ep.beats.forEach((b, i) => {
    if (b.chap || i === 0) chapters.push({ title: b.chap ?? "(début)", beats: [] });
    chapters.at(-1).beats.push(b);
  });
  for (const c of chapters) {
    c.start = at[c.beats[0].id].start;
    c.end = at[c.beats.at(-1).id].end;
    c.words = c.beats.reduce((n, b) => n + words(plainText(b.tokens)).length, 0);
    c.last = c.beats.at(-1);
    c.relance = relance(c.last);
  }
  return chapters;
}

/** Where to place each mid-roll by hand in YouTube Studio: in the silence after its phrase, before the next card (0.9 s before its word). */
export function midrollsOf(ep, sched) {
  return ep.beats
    .map((b, i) => [b, i])
    .filter(([b]) => b.midroll)
    .map(([b, i]) => {
      const end = sched.beats[i].end;
      const next = ep.beats[i + 1] ? sched.beats[i + 1].start - (ep.beats[i + 1].chap ? 0.9 : 0) : end + 0.5;
      return { id: b.id, at: (end + Math.max(end, next)) / 2, beat: b };
    });
}
const tenth = (t) => `${Math.floor(t / 60)}:${(Math.floor((t % 60) * 10) / 10).toFixed(1).padStart(4, "0").replace(".", ",")}`;

/** The threads: where each one opens, is recalled, is paid. */
export function threadsOf(ep, sched) {
  const at = Object.fromEntries(sched.beats.map((b) => [b.id, b]));
  const threads = {};
  ep.beats.forEach((b, i) => {
    for (const name of list(b.fil)) {
      const t = (threads[name] ??= { name, opens: [], pays: [] });
      t.opens.push({ id: b.id, i, t: at[b.id].start });
    }
    for (const name of list(b.paie)) {
      const t = (threads[name] ??= { name, opens: [], pays: [] });
      t.pays.push({ id: b.id, i, t: at[b.id].start });
    }
  });
  return Object.values(threads);
}

function ecritureLong(ep, sched) {
  const out = [];
  const warn = (msg) => out.push(msg);
  const ids = ep.beats.map((b) => b.id);
  const beat = (id) => ep.beats.find((b) => b.id === id);
  const plain = (b) => plainText(b.tokens);
  const spoken = (b) => (b.vo ?? plain(b)).replace(TAG, " ");
  const time = Object.fromEntries(sched.beats.map((b) => [b.id, b]));
  // the estimate runs ≈ 20 % long against the turbo voice (CLAUDE.md): times are scaled to what the voice will say
  const k = sched.estimated ? 0.8 : 1;
  const real = (t) => t * k;
  const total = ep.beats.reduce((n, b) => n + words(plain(b)).length, 0);
  const duration = real(sched.duration);

  // 1. the budget: above 8 minutes (mid-rolls), never padded towards 12
  if (total < 1550) warn(`${total} mots : sous ≈ 1 550 le film risque de passer sous 8 min, et YouTube n'y met plus de coupure pub — ajouter ce qui relance, jamais du remplissage`);
  if (total > 1950) warn(`${total} mots : au-delà de ≈ 1 950 le film passe 10 min 30 — couper ce qui ne relance pas (digressions, chiffres en rafale)`);
  if (!sched.estimated && duration < 8 * 60 + 10) warn(`${clock(duration)} : sous 8 min 10, pas de coupure pub au milieu (il faut 8 min)`);

  // 2. the first 30 seconds keep the promise of the title and of the thumbnail
  for (const [cue, what] of [["titre", "du titre"], ["miniature", "de la miniature"]]) {
    if (ep.cues?.[cue] == null) warn(`pas de repère "${cue}" : déclare le mot qui tient la promesse ${what} ("${cue}": "promesse:mot"), dit avant 30 s`);
    else if (sched.cues?.[cue] != null && real(sched.cues[cue]) > 30.5)
      warn(`promesse ${what} tenue à ${clock(real(sched.cues[cue]))}${sched.estimated ? " (estimé)" : ""} — avant 30 s : qui a cliqué pour ça part avant`);
  }
  const first = ep.beats[0];
  if (!YOU.test(plain(first))) warn(`${first.id} : pas de 2ᵉ personne (tu, ta, ton…) — l'accroche est une scène, à toi`);
  const firstSentence = plain(first).split(/(?<=[.?!…])\s+/)[0] ?? "";
  if (words(firstSentence).length > 12) warn(`première phrase : ${words(firstSentence).length} mots — douze au plus`);
  const openIndex = ep.beats.findIndex((b) => /on l['’]ouvre/i.test(plain(b)));
  const intro = ep.beats.slice(0, openIndex > 0 ? openIndex : 4);
  const introWords = intro.reduce((n, b) => n + words(plain(b)).length, 0);
  if (introWords > 110) warn(`avant « on l'ouvre » : ${introWords} mots — 110 au plus (L01 : 86, L02 : 131 avec l'appel à l'abonnement)`);
  for (const b of ep.beats) {
    if (real(time[b.id].start) > 60) break;
    if (SOMMAIRE.test(norm(plain(b)))) warn(`${b.id} : un sommaire dit (« dans cette vidéo », « on va voir ») — les étapes, c'est l'en-tête qui les montre`);
  }

  // 3. the signature: once, its own beat, [calm], within the first minute
  const signature = ep.beats.filter((b) => /on l['’]ouvre/i.test(plain(b)));
  if (signature.length !== 1) warn(`« Alors… on l'ouvre. » : ${signature.length} fois — une seule, dans son beat`);
  for (const b of signature) {
    if (b.text.trim() !== "Alors… on l'ouvre.") warn(`« ${b.text.trim()} » : la phrase signature s'écrit « Alors… on l'ouvre. », mot pour mot, seule`);
    if (!/^\[calm\]/i.test((b.vo ?? "").trim())) warn("« Alors… on l'ouvre. » se dirige [calm]");
    if (real(time[b.id].start) > 60) warn(`« on l'ouvre » à ${clock(real(time[b.id].start))} : dans la première minute (L01 : 0:27, L02 : 0:37)`);
  }

  // 4. the chapters: each one ends on a relaunch, none is a "what to remember" (the signal to leave)
  const chapters = chaptersOfLong(ep, sched);
  if (chapters.length < 6) warn(`${chapters.length} chapitres — 8 à 13 (L01 : 13, L02 : 11) : une carte toutes les 30 à 90 s`);
  chapters.forEach((c, n) => {
    if (n === 0 && !ep.beats[0].chap) warn(`le premier beat n'a pas de "chap" : YouTube veut un chapitre à 00:00`);
    if (n > 0 && real(c.start - chapters[n - 1].start) < 10) warn(`« ${c.title} » : moins de 10 s après le chapitre d'avant (YouTube les ignore tous)`);
    if (real(c.end - c.start) > 100) warn(`« ${c.title} » : ${Math.round(real(c.end - c.start))} s sans carte — 90 au plus`);
    if (EXIT_CHAPTER.test(norm(c.title))) warn(`« ${c.title} » : un titre de chapitre qui annonce la fin — le public part à la carte ; donner le fil qu'il paie (L01 : « La vitre à viser pour sortir »)`);
    if (n < chapters.length - 1 && !c.relance)
      warn(`« ${c.title} » finit à plat : « ${lastSentence(plain(c.last))} » (${c.last.id}) — une question, une menace, une promesse ou « … »`);
  });
  for (const b of ep.beats) if (RECAP.test(norm(plain(b)))) warn(`${b.id} : « ${plain(b).split(/\s+/).slice(0, 3).join(" ")}… » annonce un résumé — en question (« Qu'est-ce qui t'a sauvé ? », L02), jamais en annonce`);

  // 5. the mid-rolls: by hand, after a phrase that leaves a question in the air, ≥ 90 s apart
  const rolls = midrollsOf(ep, sched);
  if (!rolls.length) warn(`aucune coupure pub ("midroll": true) — trois pour 9 min, vers 2:00, 4:15, 6:30, juste après un fil laissé ouvert`);
  rolls.forEach((r, n) => {
    const t = real(r.at);
    // where they fall only means something in a film of a long's length (a skeleton is told so by the budget above)
    if (duration >= 7 * 60) {
      if (n === 0 && t < 90) warn(`coupure pub à ${clock(t)} : pas avant 1:30`);
      if (n > 0 && t - real(rolls[n - 1].at) < 90) warn(`coupure pub à ${clock(t)} : moins de 90 s après la précédente`);
      if (t > duration - 60) warn(`coupure pub à ${clock(t)} : pas dans la dernière minute`);
    }
    if (!relance(r.beat, { strict: true })) warn(`coupure pub après ${r.id} (${clock(t)}) : « ${lastSentence(plain(r.beat))} » ferme tout — la pub tombe après une question, une menace ou « … »`);
  });
  if (rolls.length > 4) warn(`${rolls.length} coupures pub — trois ou quatre pour 8 à 11 min`);

  // 6. the threads: declared, paid one at a time, open at every mid-roll, the promise of the start paid at the end
  const threads = threadsOf(ep, sched);
  if (!threads.length) warn(`aucun fil déclaré ("fil" / "paie" sur les beats) : la carte des fils et le contrôle des coupures pub s'en servent`);
  else {
    const fall = Math.max(0, ids.indexOf("chute"));
    for (const t of threads) {
      if (!t.opens.length) warn(`fil « ${t.name} » payé (${t.pays[0].id}) sans avoir été ouvert`);
      else if (!t.pays.length) warn(`fil « ${t.name} » ouvert (${t.opens[0].id}) et jamais payé`);
      else if (t.pays[0].i < t.opens[0].i) warn(`fil « ${t.name} » payé (${t.pays[0].id}) avant d'être ouvert (${t.opens[0].id})`);
      // a thread left open for long needs a reminder (Merwan: a phrase in every third recalls the test to come)
      if (t.opens.length && t.pays.length) {
        const marks = [...t.opens.map((o) => real(o.t)), real(t.pays[0].t)].sort((a, b) => a - b);
        for (let i = 1; i < marks.length; i++)
          if (marks[i] - marks[i - 1] > Math.max(150, duration / 3)) warn(`fil « ${t.name} » : plus d'un tiers du film sans rappel (de ${clock(marks[i - 1])} à ${clock(marks[i])}) — une phrase par tiers le rappelle`);
      }
    }
    const hookThreads = threads.filter((t) => t.opens.some((o) => o.i < Math.max(openIndex, 1)));
    if (!hookThreads.some((t) => t.pays.some((p) => p.i >= fall)))
      warn("aucun fil ouvert par l'accroche n'est payé après la chute — ce que le film doit encore, il le paie à la fin");
    for (const r of rolls) {
      const i = ids.indexOf(r.id);
      const open = threads.filter((t) => t.opens.some((o) => o.i <= i) && t.pays.every((p) => p.i > i));
      if (!open.length) warn(`coupure pub après ${r.id} : aucun fil ouvert à cet instant — on y perd ceux qui n'attendent plus rien`);
    }
  }

  // 7. the calls to action: born from the phrase before, said at an even pace; the end in order; a meeting, no subject
  const seuil = beat("seuil");
  if (!seuil) warn(`pas de seuil : l'abonnement se demande une fois, à la porte du test, né de la phrase d'avant`);
  else {
    const pos = real(time.seuil.start) / duration;
    if (pos < 0.25 || pos > 0.65) warn(`seuil à ${clock(real(time.seuil.start))} (${Math.round(pos * 100)} % du film) — entre 25 et 65 % (L01 : 39 %, L02 : 60 %)`);
    if (/^abonne/i.test(plain(seuil).trim())) warn(`seuil : il ne commence pas par « Abonne-toi » — trop brut (Merwan, L01) : il continue la phrase d'avant`);
    if (!/abonne/i.test(plain(seuil))) warn("seuil : « abonne-toi » n'est pas dit");
    if (words(plain(seuil)).length > 32) warn(`seuil : ${words(plain(seuil)).length} mots — 32 au plus (≈ 10 s)`);
  }
  for (const b of ep.beats) {
    if (b.id === "seuil" || !/abonne/i.test(plain(b))) continue;
    if (real(time[b.id].start) < 60) warn(`${b.id} : abonnement demandé à ${clock(real(time[b.id].start))}, dans la première minute — une seule demande, au seuil, tant que la courbe du L02 (demande à 0:31) n'a pas dit ce qu'elle coûte`);
  }
  const at = LONG_END.map((id) => ids.indexOf(id));
  if (at.includes(-1)) warn(`la fin attend ${LONG_END.join(" → ")} (manque : ${LONG_END.filter((id, i) => at[i] < 0).join(", ")})`);
  else if (at.some((x, i) => i > 0 && x < at[i - 1])) warn(`ordre de la fin : ${LONG_END.join(" → ")} (ici : ${ids.filter((id) => LONG_END.includes(id)).join(" → ")})`);
  const abo = beat("abo");
  if (abo) {
    if (/abonne/i.test(plain(abo))) warn("abo : le rendez-vous ne redemande pas l'abonnement");
    if (LATER.test(norm(plain(abo)))) warn(`abo : « ${plain(abo)} » — un rendez-vous sans sujet ni date (Merwan, 15/10)`);
  }
  const comment = beat("comment");
  if (comment) {
    if (!/commentaire/i.test(plain(comment))) warn("commentaire : « en commentaire » n'est pas dit");
    if (!/\?/.test(plain(comment)) && !/\b(dis-moi|ecris|reponds|donne-moi|raconte)\b/.test(norm(plain(comment))))
      warn("commentaire : ni question ni « dis-moi » — une lecture à faire chez soi, ou un camp à choisir");
  }
  const loop = beat("boucle");
  if (loop) {
    if (!/…\s*$/.test(loop.text)) warn("boucle : elle finit par « … » à l'écran");
    if (!/,\s*$/.test(loop.vo ?? "")) warn("boucle : son vo finit par une virgule (la voix reste en l'air)");
    if (words(plain(loop)).length > 12) warn(`boucle : ${words(plain(loop)).length} mots — une demi-phrase`);
  }
  if (!sched.estimated) {
    // a call to action said faster than the film is said too fast (L01: "comment" +32 %, "etiquette" +25 %)
    const rates = sched.beats.filter((b) => b.end - b.start > 1.5).map(rateOf).sort((a, b) => a - b);
    const median = rates[Math.floor(rates.length / 2)];
    const ctas = ["seuil", "comment", "like", "abo", ids[ids.indexOf("comment") - 1]].filter(Boolean);
    for (const id of new Set(ctas)) {
      if (!time[id]) continue;
      const r = rateOf(time[id]);
      if (r > median * 1.2) warn(`${id} : dit ${Math.round((r / median - 1) * 100)} % plus vite que le film — un appel à l'action se dit posé (une pause avant la question)`);
    }
  }

  // 8. the phrases: one idea, one figure, no specs in the middle of the climax
  for (const b of ep.beats) {
    const n = words(plain(b)).length;
    if (n > 40) warn(`${b.id} : ${n} mots — 40 au plus (≈ 13 s : coupe-la en deux)`);
    const figures = numbers(b);
    if (figures >= 3) warn(`${b.id} : ${figures} chiffres dans la même phrase — deux au plus, un de préférence`);
  }

  // 9. the voice of a long (H2): conversation, a smile on four paradoxes at most, [tense] for the hook only
  let amused = 0;
  const heads = [];
  for (const b of ep.beats) {
    const vo = (b.vo ?? "").trim();
    const dirs = [...vo.matchAll(TAG)].map((m) => m[1].trim()).filter((t) => !PAUSE.test(t));
    if (dirs.length > 1) warn(`${b.id} : ${dirs.length} balises (${dirs.join(", ")}) — une seule, en tête de ligne`);
    else if (dirs.length === 1 && !vo.startsWith(`[${dirs[0]}]`)) warn(`${b.id} : [${dirs[0]}] au milieu de la ligne — en tête`);
    for (const t of dirs) {
      const low = t.toLowerCase();
      if (LONG_BANNED.includes(low)) warn(`${b.id} : [${t}] — pas sur un long (${/firm|thoughtful/.test(low) ? "un ton de présentateur : « trop formel »" : "crié, grave ou joué"})`);
      else if (!LONG_TAGS.includes(low)) warn(`${b.id} : [${t}] n'a jamais été entendue sur un long — à essayer au banc d'abord`);
      if (low === "tense" && b !== ep.beats[0] && b.id !== "accroche") warn(`${b.id} : [tense] — l'accroche seulement (sur le test du L01, il sortait grave et plat)`);
      if (low === "calm" && !/on l['’]ouvre/i.test(plain(b)) && b.id !== "boucle") warn(`${b.id} : [calm] — « on l'ouvre » et la boucle seulement`);
    }
    if (dirs.some((t) => /amused/i.test(t))) {
      amused++;
      if (LONG_AMUSED_NEVER.includes(b.id)) warn(`${b.id} : [amused] sur l'accroche, la chute ou la boucle — un paradoxe seulement, jamais une victime`);
    }
    heads.push(dirs[0]?.toLowerCase() ?? null);
    const said = spoken(b);
    const caps = said.match(/\b\p{Lu}{3,}\b/gu);
    if (caps) warn(`${b.id} : MAJUSCULES dans la voix (${caps.join(", ")}) — criées ou épelées : [affiché|dit]`);
    if (/!/.test(said)) warn(`${b.id} : un « ! » dans la voix — jamais`);
  }
  if (amused > 4) warn(`[amused] ${amused} fois — quatre au plus par film (le rire qu'il aime, rare pour rester juste)`);
  for (let i = 2; i < heads.length; i++) {
    if (heads[i] && heads[i] === heads[i - 1] && heads[i] === heads[i - 2]) warn(`${ids[i - 2]}, ${ids[i - 1]}, ${ids[i]} : trois fois [${heads[i]}] de suite`);
  }
  const cuts = Array.isArray(ep.voice?.parts) ? ep.voice.parts : null;
  const requests = requestsOf(ep);
  const totalChars = requests.reduce((n, r) => n + r.chars, 0);
  if (!cuts && totalChars > 9000) warn(`${totalChars} caractères en une requête : ElevenLabs n'en prend que 10 000 — "voice.parts" : la première phrase de chaque chapitre`);
  for (const id of cuts ?? []) {
    if (!ids.includes(id)) warn(`voice.parts : « ${id} » n'est pas un beat`);
    else if (!beat(id).chap) warn(`voice.parts : « ${id} » n'ouvre pas de chapitre — une requête commence sous une carte, où la musique couvre le raccord`);
  }
  for (const r of requests) if (r.chars > 2500) warn(`requête qui commence à ${r.from} : ${r.chars} caractères — 2 500 au plus (une requête longue installe Eric dans son registre bas)`);

  // 10. the packaging: what people type, in the title and the first lines; a title that does not say the thumbnail again
  const yt = ep.post?.youtube ?? {};
  if (yt.title) {
    if (yt.title.length > 100) warn(`titre : ${yt.title.length} caractères — 100 au plus (YouTube coupe)`);
    if (yt.title.length < 40) warn(`titre : ${yt.title.length} caractères — l'accroche, puis « : » et la promesse avec le mot cherché (60 à 90)`);
    const loud = yt.title.match(/\b\p{Lu}{3,}\b/gu) ?? [];
    if (loud.length > 1) warn(`titre : ${loud.length} mots en capitales (${loud.join(", ")}) — un au plus`);
    const sig = (s) => new Set(norm(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 || /\d/.test(w)));
    const titleWords = sig(yt.title);
    for (const key of ["thumb", "thumb2", "thumb3"]) {
      const th = ep[key];
      if (!th?.title) continue;
      const same = [...sig(list(th.title).join(" "))].filter((w) => titleWords.has(w));
      if (same.length >= 2) warn(`titre et ${key} disent les mêmes mots (${same.join(", ")}) — ils se complètent, ils ne se répètent pas`);
    }
    if (!yt.keyword) warn(`pas de "post.youtube.keyword" : ce que les gens tapent (autocomplétion de YouTube), vérifié dans le titre et les deux premières lignes`);
    else {
      const key = norm(yt.keyword);
      if (!norm(yt.title).includes(key) && !(yt.titleAlts ?? []).some((t) => norm(t).includes(key))) warn(`le mot cherché « ${yt.keyword} » n'est dans aucun titre (ni le titre, ni ses variantes)`);
      const head = norm(String(yt.descriptionTemplate ?? yt.description ?? "").slice(0, 160));
      if (!head.includes(key)) warn(`description : le mot cherché « ${yt.keyword} » n'est pas dans les deux premières lignes (≈ 160 caractères)`);
    }
    if ((yt.titleAlts ?? []).length < 2) warn("titre : deux variantes dans post.youtube.titleAlts, pour « Tester et comparer »");
  }
  if ((yt.hashtags ?? []).length > 5) warn(`hashtags : ${yt.hashtags.length} — cinq au plus`);
  if (LATER.test(norm(String(yt.descriptionTemplate ?? yt.description ?? "")).replace(/prochaine fois/g, ""))) warn("description : elle annonce un sujet ou une date — un rendez-vous, rien d'autre");
  return out;
}

/** The map of a long, before its warnings: chapters and how they end, mid-rolls to place by hand, requests, threads. */
function printLongMap(ep, sched) {
  const k = sched.estimated ? 0.8 : 1;
  const est = sched.estimated ? " (estimé, ramené à la voix : × 0,8)" : "";
  const chapters = chaptersOfLong(ep, sched);
  console.log(`  Chapitres${est} :`);
  for (const c of chapters) {
    const end = c === chapters.at(-1) ? "fin du film" : c.relance ?? "À PLAT";
    console.log(`    ${clock(c.start * k).padStart(5)}  ${c.title.slice(0, 30).padEnd(30)} ${String(Math.round((c.end - c.start) * k)).padStart(3)} s ${String(c.words).padStart(4)} mots   ${end.padEnd(11)} « ${tail(lastSentence(plainText(c.last.tokens)))} »`);
  }
  const rolls = midrollsOf(ep, sched);
  if (rolls.length) console.log(`\n  Coupures pub — à poser à la main dans YouTube Studio, dans le silence après la phrase${est} : ${rolls.map((r) => `${tenth(r.at * k)} (après ${r.id})`).join(" · ")}`);
  const req = requestsOf(ep);
  console.log(`  Voix : ${req.length} requête${req.length > 1 ? "s" : ""}, ${Math.min(...req.map((r) => r.chars))} à ${Math.max(...req.map((r) => r.chars))} caractères`);
  const threads = threadsOf(ep, sched);
  if (threads.length) {
    console.log("  Fils :");
    for (const t of threads) {
      const marks = [...t.opens.map((o) => `${o === t.opens[0] ? "ouvert" : "rappel"} ${clock(o.t * k)} (${o.id})`), ...t.pays.map((p) => `payé ${clock(p.t * k)} (${p.id})`)];
      console.log(`    ${t.name.padEnd(14)} ${marks.join(" → ")}`);
    }
  }
  console.log("");
}

export function printEcriture(ep, sched) {
  const long = /^L\d{2}$/.test(String(ep.id));
  if (long) printLongMap(ep, sched);
  const out = ecriture(ep, sched);
  if (!out) return;
  const recipe = long ? "docs/recette-long.md" : /^HS\d{2}$/.test(String(ep.id)) ? "docs/recette-promo.md" : "docs/recette-script.md";
  if (!out.length) console.log(`  Écriture : rien à signaler (${recipe})\n`);
  else console.log(`  Écriture (${recipe}) — ${out.length} avertissement${out.length > 1 ? "s" : ""} :\n${out.map((m) => `    · ${m}`).join("\n")}\n`);
}
