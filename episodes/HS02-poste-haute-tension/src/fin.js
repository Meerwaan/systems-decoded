// 03 · RENDEZ-VOUS — ouvre → boucle (49,3 → 62,4 s). The gag « Alors… on l'ouvre. [noir] Pas ici. », the appointment
// on YouTube (#film, filmCall; the account name lights up: D.verdict), the loop (D.loop: the last frame IS the first).
//   · under acte3's black, at ouvre − 0.15, your bay in three quarters; the black lifts on « Alors »
//   · the bay only STARTS to come apart (0 → 0.35) on « on », then a dry black on `black`
//   · « Le film entier… » — the poste at night, low in the frame: #film owns the top slot
//   · the loop: back to the mute head, gliding to POSE0 / FIRST
import { setAct } from "@kit/overlay.js";
import { filmCall } from "@kit/blocks.js";
import { SET, AT, VIEW, FIRST, POSE0, L02_AT } from "./world.js";

export default function fin({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    ouvre: "ouvre", explode: "explode", black: "black", pasiciEnd: "pasici$", youtube: "youtube", verdict: "verdict",
    toloop: "toloop", rewind: "rewind",
  });
  const from = t.ouvre - 0.15;
  setAct(tl, 3, from);

  /* « Alors… on l'ouvre. » — your bay; it starts to open… and black */
  const bay0 = { ...VIEW.bay, d: 4600, az: -38 };
  cut(from, SET.POSTE, bay0, { ...AT.poste, explode: 0, l02: L02_AT.ouvre, fx: 1400, fy: 600, fz: 0, fs: 2600 });
  tl.set("#black", { opacity: 0 }, t.ouvre - 0.05);
  shot(from, t.black - from, { ...VIEW.bay, d: 5000, az: -41, el: 15 }, "sine.inOut");
  st(t.explode, t.black - t.explode, { explode: 0.35 }, "power2.out");
  tl.set("#black", { opacity: 1 }, t.black);
  now(t.black, { l02: -1 });

  /* « Le film entier… notre chaîne YouTube » — the poste at night, low; #film in the top slot */
  const lift = t.pasiciEnd + 0.55;
  const low = { ...VIEW.wide, d: 10500, shift: -260 };
  cut(lift, SET.POSTE, low, { ...AT.poste, l02: -1, yt: 0, fx: 1500, fy: 300, fz: -1200, fs: 6000 });
  tl.set("#black", { opacity: 0 }, lift);
  shot(lift, t.toloop - lift, { ...low, d: 9600, az: -31 }, "sine.inOut");
  now(t.youtube, { yt: 1 });
  filmCall(tl, { showAt: t.youtube + 0.2, hideAt: t.toloop - 0.35 });
  D.verdict(t.verdict);

  /* the loop: back to the mute head; between rewind and the end everything glides to FIRST */
  const back = { ...POSE0, d: 220, az: 34, el: 4 };
  cut(t.toloop, SET.POSTE, back, {
    ...AT.poste, l02: FIRST.l02, fils: 0, yt: 0, perche: FIRST.perche, arms: FIRST.arms, probe: FIRST.probe, tool: FIRST.tool,
    walk: FIRST.walk, mood: FIRST.mood, gel: FIRST.gel, hot: FIRST.hot, pool: FIRST.pool, grid: FIRST.grid,
    fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs,
  });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: back.d });
}
