import { resolveMoment } from "./ref.mjs";

/**
 * The breath at or after `t` (seconds): if a word is being said at `t`, or one starts less than `need` s after it,
 * the instant just after that word (+ 0.03 s) — again, until `need` s are free of words. A sound (or the picture's
 * answer to it) put there never lands on a word. Read by scripts/sfx.mjs and scripts/qa.mjs too (2026-10-21).
 */
export function breathAfter(beats, t, need = 0.15, max = 0.8) {
  const words = beats.flatMap((b) => b.words ?? []);
  const scan = (t, need) => {
    for (let guard = 0; guard < 500; guard++) {
      const hit = words.find((w) => w.s < t + need && w.e + 0.02 > t);
      if (!hit) return t;
      t = hit.e + 0.03;
    }
    return t;
  };
  // no breath of `need` s within `max` s (a phrase said in one go): a shorter one, never a word
  for (const n of [need, need / 2, 0.03]) {
    const b = scan(t, n);
    if (b - t <= max) return b;
  }
  return scan(t, 0.03);
}

/** The cues fil1, fil2, … of a promo (hors-série) in order: the moments its threads open. */
export const threadCues = (cues = {}) =>
  Object.keys(cues)
    .filter((k) => /^fil\d+$/.test(k))
    .sort((a, b) => Number(a.slice(3)) - Number(b.slice(3)));

/** Read moments off the script so choreography follows the voice, whatever the take. */
export function makeTiming(EP) {
  const at = (ref) => resolveMoment(EP.beats, EP.cues, ref);
  return {
    at,
    beat: (id) => EP.beats.find((b) => b.id === id),
    span: (from, to) => Math.max(0.01, at(to) - at(from)),
    duration: EP.duration,
    /** The moment `ref`, moved to the breath that follows if it falls on a word (see breathAfter). */
    breath: (ref, need = 0.15) => breathAfter(EP.beats, at(ref), need),
  };
}
