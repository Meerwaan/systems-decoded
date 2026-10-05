// Shared by the Node pipeline and the browser bundle: locate a moment in the script.
//   "eclate"          start of the beat          "eclate$"        end of the beat
//   "eclate:pile"     start of the first word beginning with "pile"
//   "verif:fois#2"    second match               "led:flash$+0.2" end of the word, 0.2 s later

/** Letters/digits only, lowercased — the comparable form of a word. */
export const core = (s) =>
  s
    .toLocaleLowerCase("fr")
    .replace(/[’`]/g, "'")
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

const round = (x) => Math.round(x * 1000) / 1000;

export function resolveRef(beats, ref) {
  let rest = String(ref).trim();
  let offset = 0;
  const mo = /[+-]\d*\.?\d+$/.exec(rest);
  if (mo) {
    offset = Number(mo[0]);
    rest = rest.slice(0, mo.index);
  }
  const atEnd = rest.endsWith("$");
  if (atEnd) rest = rest.slice(0, -1);
  let nth = 1;
  const mn = /#(\d+)$/.exec(rest);
  if (mn) {
    nth = Number(mn[1]);
    rest = rest.slice(0, mn.index);
  }
  const colon = rest.indexOf(":");
  const beatId = colon === -1 ? rest : rest.slice(0, colon);
  const word = colon === -1 ? null : rest.slice(colon + 1);

  const beat = beats.find((x) => x.id === beatId);
  if (!beat) throw new Error(`Repère "${ref}": beat "${beatId}" inconnu`);
  let t;
  if (word) {
    const key = core(word);
    const matches = (form) => form.startsWith(key) || form.split(/[\s'-]+/).some((part) => part.startsWith(key));
    const hit = beat.words.filter((w) => matches(w.k) || matches(w.ks))[nth - 1];
    if (!hit) throw new Error(`Repère "${ref}": mot "${word}" introuvable dans le beat "${beatId}"`);
    t = atEnd ? hit.e : hit.s;
  } else {
    t = atEnd ? beat.end : beat.start;
  }
  return round(t + offset);
}

/** A named cue ("alarm"), a cue with an offset ("alarm+0.8"), a number, or a script reference. */
export function resolveMoment(beats, cues, ref) {
  if (typeof ref === "number") return ref;
  const text = String(ref).trim();
  if (text in cues) return cues[text];
  const mo = /[+-]\d*\.?\d+$/.exec(text);
  if (mo && text.slice(0, mo.index) in cues) return round(cues[text.slice(0, mo.index)] + Number(mo[0]));
  if (/^-?\d*\.?\d+$/.test(text)) return Number(text);
  return resolveRef(beats, text);
}
