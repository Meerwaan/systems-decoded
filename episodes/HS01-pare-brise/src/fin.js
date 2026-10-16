// 03 · RENDEZ-VOUS — ouvre → boucle (49,8 → 64,7 s). The gag « Alors… on l'ouvre. [noir] Pas ici. », the appointment
// on YouTube (#film, filmCall; the account name lights up: D.verdict), the loop (D.loop: the last frame IS the first).
// See docs/HS01-actes.md for the plan.
//   · cuts under acte3's black at ouvre − 0.15 to the bench (the same windshield: the raccord through the black)
//   · the exploded view only STARTS (0 → 0.35) on « on », then a dry black on `black`: the account's gesture, cut short
//   · the ribbon, the hottest image of the film, low in the frame: #film owns the top slot
//   · the loop: the car before the crash, in profile, gliding back to POSE0 / FIRST
import { setAct } from "@kit/overlay.js";
import { filmCall } from "@kit/blocks.js";
import { SET, AT, VIEW, FIRST, POSE0, L01_AT, onLine, run } from "./world.js";

export default function fin({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    ouvre: "ouvre", explode: "explode", black: "black", pasiciEnd: "pasici$", youtube: "youtube", verdict: "verdict",
    toloop: "toloop", rewind: "rewind",
  });
  const from = t.ouvre - 0.15;
  setAct(tl, 3, from);

  /* « Alors… on l'ouvre. » — under the black, the same windshield on the bench; the black lifts on « Alors » */
  const bench0 = { ...VIEW.bench, tx: 0, ty: 62, tz: -10, d: 720, az: -34, el: 13, shift: 120 };
  cut(from, SET.BENCH, bench0, { ...AT.bench, l01: L01_AT.ouvre, litFilm: 0.4 });
  tl.set("#black", { opacity: 0 }, t.ouvre - 0.05);
  shot(from, t.black - from, { ...bench0, d: 610, az: -40, el: 12 }, "sine.inOut");
  // « on » : it starts to open… and the film lights up between the glasses
  st(t.explode, t.black - t.explode, { explode: 0.35, litFilm: 1 }, "power2.out");

  /* …dry black. « Pas ici. » — the header alone: FILM · 8 MIN 51 */
  tl.set("#black", { opacity: 1 }, t.black);
  now(t.black, { l01: -1 });

  /* « …notre chaîne YouTube » — the black lifts on the ribbon, low in the frame; #film in the top slot */
  const lift = t.pasiciEnd + 0.55; // « Pas ici. » held on the black, then the ribbon
  const rib0 = onLine(1300, { ty: 95, tz: 0, d: 900, az: -74, el: 12, fov: 30, shift: -220, side: 0, roll: 0, drift: 0.3 });
  cut(lift, SET.LINE, rib0, { ...AT.line, pos: 5000, l01: -1, yt: 0 });
  tl.set("#black", { opacity: 0 }, lift);
  run(D, lift, t.toloop);
  shot(lift, t.toloop - lift, { ...rib0, tx: 1450, d: 820, az: -62, el: 11 }, "sine.inOut");
  now(t.youtube, { yt: 1 });
  filmCall(tl, { showAt: t.youtube + 0.2, hideAt: t.toloop - 0.35 });
  D.verdict(t.verdict);

  /* the loop: back in the car before the crash, in profile; between rewind and the end everything glides to FIRST */
  const prof = { ...VIEW.hook2, tz: -2, ty: 118, d: 250 };
  cut(t.toloop, SET.CAR, prof, {
    ...AT.car, l01: FIRST.l01, fils: 0, yt: 0, mood: FIRST.mood, gel: FIRST.gel, pool: FIRST.pool, grid: FIRST.grid,
    fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs,
  });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: prof.d });
}
