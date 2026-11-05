// DOSSIER 039 — the chute, what the film owes, like, the next file, the loop (toverdict → the end).
//   chute        the counter-example first: the thick pool still in the pit, seen through the cut in its wall — « Noyé
//                tout de suite » struck on « pas »; « Trop tôt » water is poured on it, « exploser » the steam bursts ·
//                a cut to the chamber: the thin sheet under water, the system's rim turns veille on « après »
//   commentaire  « Et l'eau, qui l'a ouverte ? » — back in time, on a trigger and its valve: the orange sea comes,
//                « il détruit » the trigger, « des vannes » the lever drops, the water leaves · a cut to the whole plant,
//                calm, drowned: « le réacteur près de chez toi… un EPR, ou pas ? » (duelCall: the film never answers)
//   like         the cooled sheet under its water, three quarters, low
//   prochain     the next file, last: the shelters, the ring of fire closing over the length of the sentence
//   boucle       back under the vessel: the first frame. D.loop brings every number back.
// A title or a panel has finished leaving BEFORE the cut that follows it. Every instant comes from a cue.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, CHAMBER, TRIGGERS, VALVES, TEASER } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CHZ = (CHAMBER.z0 + CHAMBER.z1) / 2;
const [TRX, , TRZ] = TRIGGERS[1];

/* chute — the pit from outside, through the cut in its wall, under the title (#retitle + its shade end at y ≈ 840) */
// (wide enough for the whole block: the vessel over it, the stream, the pool — the steam burst has a shape inside it)
const PIT_A = { ...P, tx: 0, ty: 60, tz: 0, d: 2400, az: -40, el: 26, fov: 32, shift: -150 };
const PIT_B = { ...PIT_A, d: 2200 };
const L_PIT = { fx: 0, fy: 60, fz: 0, fs: 600 };
// the counter-example: the core still thick in the pit, the plug red under it, the stream still falling
const THICK = { belly: 0.6, breach: 0.6, pour: 1, pit: 1, eaten: 0.8, fume: 0.5, plug: 0.5 };

/* « L'eau vient après » — the chamber, the sheet under water */
const AFTER_A = { ...P, tx: 0, ty: -330, tz: 1600, d: 4200, az: -24, el: 50, fov: 38, shift: -60 };
const AFTER_B = { ...AFTER_A, d: 3950 };
const L_SHEET = { fx: 0, fy: -330, fz: CHZ, fs: 1500 };
// what the melt has done by now (act 3 hands this over): out of the pit, spread, the plug gone
const SPREAD = { belly: 0.6, breach: 0.6, pour: 1, eaten: 0.9, pit: 0.45, plug: 1, flow: 1, mass: 1, spread: 1 };

/* « qui l'a ouverte ? » — a trigger and its valve in one frame, back in time (chip-reponse over them) */
// (high, over the low wall: the sea on the left, the trigger in the middle, its cable up to the valve on the right)
const VALVE_A = { ...P, dof: 8, tx: (TRX + VALVES[1][0]) / 2, ty: -250, tz: TRZ, d: 1300, az: -16, el: 48, fov: 30, shift: -40 };
const VALVE_B = { ...VALVE_A, tx: 500, ty: -280, d: 1080 };
const L_VALVE = { fx: 520, fy: -230, fz: TRZ, fs: 400 };

/* « le réacteur près de chez toi » — the whole plant, drowned and calm, under #duel */
const WIDE_A = { ...VIEW.wide, d: 6000, shift: -120, dof: 0 };
const WIDE_B = { ...WIDE_A, d: 5700, az: -22 };
const L_WIDE = { fx: 0, fy: 0, fz: 1000, fs: 3000 };
const CALM = { ...SPREAD, belly: 0.35, pour: 0, triggers: 1, valves: 1, water: 1, cool: 1, steam: 0.15, guard: 1, mood: 0 };

/* like — the cooled sheet under water, low three quarters, under #net */
// (on the axis of the wide shot before: a cut in — the box, its veille rim, the crust under the water)
const LIKE_A = { ...P, tx: 0, ty: -330, tz: 1700, d: 2400, az: -24, el: 14, fov: 34, shift: -60 };
const LIKE_B = { ...LIKE_A, d: 2250, az: -28 };

/* prochain dossier — VIEW.teaser: the ring between y ≈ 800 and 1260, under #next */
const [TX, , TZ] = TEASER.at;
const TEASER_B = { ...VIEW.teaser, d: 5300 };

/* boucle — the first frame, from a little further back on the same axis */
const BACK = POSE0.d * 1.3;

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", trop: "trop", exploser: "chute:exploser", apres: "apres",
    tocta: "tocta", ouverte: "ouverte", coeur: "comment:cœur", detruit: "detruit", vannes: "comment:vannes",
    commentaire: "commentaire", epr2: "epr2", pasq: "pasq",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "prochain", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });
  const toAfter = t.apres - 0.54; // « L'eau vient après »: the cut sits just before « L'eau »
  const toWide = t.commentaire - 0.4;
  const toLike = t.like - 0.12;

  /* ── CHUTE: « Voilà le secret : on ne noie pas tout de suite un cœur fondu. Trop tôt, l'eau peut exploser en vapeur. » ── */
  cut(t.toverdict, SET.PLANT, PIT_A, { ...STAGED, ...THICK, ...L_PIT, mood: 1 });
  shot(t.toverdict, t.exploser - t.toverdict, PIT_B, "sine.inOut");
  shot(t.exploser, toAfter - t.exploser, PIT_A, "power2.out", PIT_B.d); // the burst pushes the camera back
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.apres - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  D.punch(t.pas, 0.05);
  // « Trop tôt » water is poured on the thick pool (it hisses) · « exploser » the steam bursts out of the pit, and falls back
  st(t.trop, 0.6, { blast: 0.3 }, "sine.out");
  // (the burst is a cloud between 0.45 and 0.8: it swells on « exploser » and is still there at the cut)
  st(t.exploser, 0.35, { blast: 0.55 }, "power2.out");
  st(t.exploser + 0.35, toAfter - 0.02 - t.exploser - 0.35, { blast: 0.78 }, "sine.inOut");
  st(t.exploser, 0.08, { gel: 0.15 }, "power2.out");
  st(t.exploser + 0.1, 0.5, { gel: 0 }, "sine.inOut");

  /* ── « L'eau vient après. » — the chamber: the sheet thin, the water over it; the rim turns veille on « après » ── */
  cut(toAfter, SET.PLANT, AFTER_A, { ...STAGED, ...SPREAD, triggers: 1, valves: 1, water: 0.86, cool: 0.4, steam: 0.6, ...L_SHEET, mood: 0 });
  shot(toAfter, t.tocta - toAfter, AFTER_B, "sine.inOut");
  st(toAfter, t.apres - toAfter, { water: 1 }, "sine.out");
  st(t.apres, 0.4, { guard: 1 }, "power2.out");
  st(t.apres, t.tocta - t.apres, { steam: 0.3, cool: 0.6 }, "sine.inOut");

  /* ── « Et l'eau, qui l'a ouverte ? Le cœur fondu lui-même : en s'étalant, il détruit les déclencheurs des vannes. » ── */
  // back in time: the orange sea comes to the trigger; « détruit » it breaks; « vannes » the lever drops, the water leaves
  cut(t.tocta, SET.PLANT, VALVE_A, { ...STAGED, ...SPREAD, spread: 0.8, ...L_VALVE, mood: 1 });
  shot(t.tocta, toWide - t.tocta, VALVE_B, "sine.inOut");
  st(t.ouverte + 0.3, t.detruit - t.ouverte - 0.3, { spread: 0.97 }, "sine.inOut");
  st(t.detruit, 0.3, { spread: 1 }, "sine.out");
  st(t.detruit - 0.05, 0.3, { triggers: 1 }, "power2.out");
  st(t.vannes, 0.5, { valves: 1, litValves: 1 }, "power2.out");
  chip("chip-reponse", null, 96, 470, t.coeur - 0.1, toWide - 0.3);

  /* ── « En commentaire : le réacteur près de chez toi… un EPR, ou pas ? » — the whole plant, drowned, calm ── */
  cut(toWide, SET.PLANT, WIDE_A, { ...STAGED, ...CALM, ...L_WIDE });
  shot(toWide, toLike - toWide, WIDE_B, "sine.inOut");
  duelCall(tl, { from: t.commentaire - 0.5, aAt: t.epr2, bAt: t.pasq, to: t.like - 0.45, toneA: "veille", toneB: "signal" });

  /* ── LIKE: « Like : pour quelqu'un qui croit qu'on éteint tout avec de l'eau. » — the cooled sheet under water ── */
  cut(toLike, SET.PLANT, LIKE_A, { ...STAGED, ...CALM, ...L_SHEET });
  shot(toLike, t.abo - 0.12 - toLike, LIKE_B, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER, last: the shelters, the ring of fire closing over the sentence ── */
  cut(t.abo - 0.12, SET.PLANT, VIEW.teaser, { ...STAGED, teaser: 0.3, mood: 1, fx: TX, fy: 0, fz: TZ, fs: 3000 });
  shot(t.abo - 0.12, t.toloop - t.abo + 0.12, TEASER_B, "sine.inOut");
  st(t.abo, t.toloop - t.abo, { teaser: 1 }, "sine.out");
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.prochain + 0.7, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Et tout recommence quand… » — back under the vessel, the first frame ── */
  cut(t.toloop, SET.PLANT, { ...POSE0, d: BACK }, { ...FIRST });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: BACK });
}
