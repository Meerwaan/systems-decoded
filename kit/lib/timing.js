import { resolveMoment } from "./ref.mjs";

/** Read moments off the script so choreography follows the voice, whatever the take. */
export function makeTiming(EP) {
  const at = (ref) => resolveMoment(EP.beats, EP.cues, ref);
  return {
    at,
    beat: (id) => EP.beats.find((b) => b.id === id),
    span: (from, to) => Math.max(0.01, at(to) - at(from)),
    duration: EP.duration,
  };
}
