// 01 · MENACE — accroche → curiosite (0 → 11,0 s), IN THE POSTE at night (FIRST: the L02's first frame — your line
// cut, the neighbour live, the pole raised, its detector's head on your conductor).
//   A  POSE0: the mute head in macro, the neighbour burning behind — it moves from frame 1 (closer, a turn onto it)
//   B  « Cinq gestes pour rentrer chez toi » — a cut down the same pole: you, standing, holding it
//   C  « Et le dernier, dans le mauvais ordre… tue » — the earthing clamps on the three phases, all placed, no order
//      shown, no earth lit (that is the long's answer). The thread stays open.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, L02_AT } from "./world.js";

export default function acte1({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    coupee: "accroche:coupée", promesse: "promesse", curiosite: "curiosite", mauvais: "curiosite:mauvais",
    bon: "curiosite:bon", end: "lancement",
  });
  setAct(D.tl, 1, 0);
  now(0, { l02: L02_AT.accroche });

  // A — moving from frame 1: closer, turning onto the mute head (the L02's HOOK → HOOK_IN)
  shot(0, t.promesse - 0.12, { ...POSE0, d: 128, az: 22, el: -11 }, "sine.inOut", POSE0.d);

  // B — down the same pole: you, standing, the pole up; a slow push
  const youAt = t.promesse - 0.12;
  cut(youAt, null, VIEW.you, { fx: 320, fy: 300, fz: 980, fs: 1100 });
  now(t.promesse, { l02: L02_AT.promesse });
  shot(youAt, t.curiosite - 0.12 - youAt, { ...VIEW.you, d: 500, az: -12 }, "sine.inOut");

  // C — the clamp on your conductor, where the detector was (all placed: no order to read), a slow push; the thread opens on « bon »
  const clAt = t.curiosite - 0.12;
  cut(clAt, null, VIEW.clampHead, { clamps: 2, earthed: 0, perche: 0, arms: 0, fx: POSE0.tx, fy: POSE0.ty, fz: POSE0.tz, fs: 600 });
  now(t.curiosite, { l02: L02_AT.curiosite });
  shot(clAt, t.end - 0.12 - clAt, { ...VIEW.clampHead, d: 175, az: 22 }, "sine.inOut");
  st(t.mauvais - 0.1, 0.4, { gel: 0.18 }, "power2.out"); // « mauvais »: a signal breath over the scene
  st(t.mauvais + 0.5, 1.0, { gel: 0 }, "sine.inOut");
  now(t.bon, { fils: 1 });
}
