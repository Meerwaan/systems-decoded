// La fin — chute, what is owed, like, next file, the loop (toverdict → end). Plan: docs/038-actes.md (« src/fin.js »),
// the order of kit/template/src/fin.js. The boat has surfaced (DEPTH.float): it never leaves the water, pitch stays 0.
//   chute        under the surface, the floating boat seen from below: the torn bow still bleeding air (« pas
//                intacte », the account name lights up) — then a pull-back along it to the aft tanks, green, the rest
//                dimmed (« grâce à l'arrière »)
//   comment      above the water, the boat still under a low sky (the case, chip-ssn) — the whole seamount, absent
//                from the chart until the voice names it — the two charts — the duel; nothing typed for the viewer
//   like         a pull-back high over the ocean: far more ocean than mountain
//   abo          the sea darkens, nothing of the boat comes back; the next file, classified, last
//   boucle       back under the hull, the bow rushing at the rock: the gap closes at act 1's speed, the camera
//                settles on POSE0 — the last frame IS the first
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, DEPTH, MBT } from "./world.js";

const TANKA_X = (MBT.aft.x0 + MBT.aft.x1) / 2;

export default function fin({ D }) {
  const { tl, st, shot, cut, panel, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", avant: "avant", fuyait: "fuyait", remonte: "remonte",
    arriere: "arriere", tocta: "tocta", ssn: "sanfrancisco", carte: "carte2", montagne: "montagne3", autres: "autres", danger: "danger",
    commentaire: "commentaire", duelA: "duelA", duelB: "duelB", like: "like", likeEnd: "like$", abo: "abo",
    prochain: "prochain", aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });

  // the boat as act 3 hands it over: surfaced, the blow spent, the aft tanks full of air, the bow still leaking
  const floating = {
    ...STAGED, depth: DEPTH.float, gap: 400, speed: 0, rush: 0, pitch: 0, jolt: 0, crush: 1,
    cmd: 1, valves: 1, bank: 0.2, flowF: 1, flowA: 1, airF: 0.3, airA: 1, leak: 0.4, rock: 0, sky: 1, mood: 0,
  };

  /* CHUTE — under the surface, from below: the crushed bow, a torn tank, the air still pouring out of it */
  // el −8 (was −14): the hull runs flatter, its top stays under the header (the bubbles still rise into it)
  const under = { tx: -4000, ty: 0, tz: 0, d: 7000, az: 50, el: -8, fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
  cut(t.toverdict, SET.SCENE, under, { ...floating, fx: MBT.fwd.x0, fy: 0, fz: 300, fs: 4000 });
  shot(t.toverdict, t.fuyait + 0.4 - t.toverdict, { ...under, d: 6000, az: 46 }, "sine.inOut");
  punch(t.pas, 0.06);
  // « L'avant fuyait » : the sheaves of bubbles swell on the word
  st(t.avant - 0.1, t.fuyait + 0.3 - t.avant, { leak: 0.9 }, "sine.inOut");
  // « …grâce à l'arrière » : cut in the breath to the aft tanks (the same pair of shots as act 3: torn → aft), from
  // below, green and alone — the glass and the crew fade around them while the camera closes in
  const aft = { tx: TANKA_X - 200, ty: 0, tz: 150, d: 4400, az: 50, el: -6, fov: 32, shift: 80, side: 0, roll: 0, drift: 0.3, dof: 0 };
  const toAft = t.fuyait + 0.42;
  cut(toAft, SET.SCENE, { ...aft, d: 5800, az: 56 }, { ...floating, leak: 0.9, fx: TANKA_X, fy: 0, fz: 280, fs: 3500 });
  shot(toAft, t.arriere - toAft, aft, "sine.inOut", 5800);
  st(toAft, t.arriere - toAft, { hull: 0.45, inner: 0.35, crew: 0 }, "sine.inOut");
  st(t.remonte, t.arriere + 0.2 - t.remonte, { litTank: 1 }, "sine.inOut");
  punch(t.arriere, 0.06);
  shot(t.arriere, t.tocta - t.arriere, { ...aft, d: 4200, az: 48 }, "sine.inOut");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.arriere - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);

  /* WHAT IS OWED — the case: the boat still at the surface, under a low sky */
  // (no bubbles above the water: the leak stops at the cut — they would rise into the sky)
  // the eye 1,6 m above the water (surface at y 450, camera ≈ 610): the waterline crosses the hull at its deck, the sail
  // and the low sky above it, the rest under the dark water. el stays tiny so that the pull-in keeps the eye's height.
  const float = { ...VIEW.float, ty: 480, d: 25000, el: 0.3, side: 120, drift: 0.3, dof: 0 };
  cut(t.tocta, SET.SCENE, float, { ...floating, leak: 0, fx: -1000, fy: 0, fz: 0, fs: 12000 });
  shot(t.tocta, t.carte - 0.4 - t.tocta, { ...float, d: 22500, az: 63 }, "sine.inOut");
  chip("chip-ssn", null, 96, 470, t.ssn - 0.05, t.carte - 0.62);

  // « Et ta carte ? » : the ocean from far, empty as the chart — « …cette montagne » : it rises out of the dark
  cut(t.carte - 0.4, SET.SCENE, VIEW.mountain, { ...floating, gap: 3, rock: 1, mount: 0, leak: 0, fx: -1000, fy: 0, fz: 0, fs: 12000 });
  st(t.montagne - 0.35, 0.7, { mount: 1 }, "sine.out");
  shot(t.carte - 0.4, t.like - 0.2 - (t.carte - 0.4), { ...VIEW.mountain, d: 1250000, el: 9 }, "sine.inOut", VIEW.mountain.d);
  panel("#cartes", t.autres - 0.1, t.danger + 0.2); // gone before the duel comes
  duelCall(tl, { from: t.commentaire - 0.3, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.3 });

  /* LIKE — high over the ocean: far more ocean than mountain */
  shot(t.like - 0.2, t.abo - t.like + 0.2, { ...VIEW.mountain, ty: -120000, d: 1700000, el: 24 }, "sine.inOut", 1250000);
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* PROCHAIN DOSSIER — classified, and last: the sea darkens, nothing of the boat comes back */
  st(t.abo, t.prochain + 0.8 - t.abo, { sea: 0.3 }, "sine.inOut");
  shot(t.abo, t.toloop - t.abo, { ...VIEW.mountain, ty: -100000, d: 1850000, el: 28 }, "sine.inOut", 1700000);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* REBOUCLAGE — back under the hull, the bow rushing at the rock. The gap closes at act 1's own speed (120 m over
     the time to the crash, linear), so that it reaches FIRST.gap on the last frame; the camera settles on POSE0 as
     act 1 leaves it (sine: at rest on frame 0). */
  const rate = FIRST.gap / D.T.at("crash"); // m/s, act 1's closing speed
  const span = D.tEnd - t.toloop;
  cut(t.toloop, SET.SCENE, { ...POSE0, d: POSE0.d * 1.1 }, { ...STAGED, ...FIRST, gap: FIRST.gap + rate * span });
  st(t.toloop, span, { gap: FIRST.gap }, "none");
  shot(t.toloop, span, POSE0, "sine.out", POSE0.d * 1.1);
  // every number is already FIRST's but the gap, which lands on it by itself: the rewind is the camera's alone
  D.loop({ at: t.toloop, rewindAt: D.tEnd - 0.02 });
}
