// CR04 — fin.js · 03 DEPUIS — depuis → boucle (todepuis → end). Cuts in at `todepuis` on the lead as it failed (BENCHED); hands
// the film back to its first frame (POSE0, FIRST) on the last frame.
//   depuis    cut on « Depuis 2013 »: the lead parked, its cab opened (`cab`), its hand-brake wheel red — the light whitens and the
//             wheel heals green (`depuis` 0 → 1) while the camera glides into the cab; « deux »: two helmets land on the two seats
//             (`crew` 0 → 2, punch, chip-deux). Cut on « Et chaque compagnie » (green to green): the tank cars' row, low along the
//             flank; « déposer sa méthode d'essai des freins à main »: their wheels light green one after another (`brakes` 7 → 18),
//             the camera sliding slowly with the lit front
//   comment   cut on « Alors, qui le tenait ? » back on the night, on the very frame of the question (acte1's CAMP: the wheel high,
//             the cylinder low); #colonne: air 60 psi + the seven = 119 t; « Surtout l'air » the camera goes down to the cylinder,
//             the air side lights green (`ok`). Cut on « Pour l'enquête »: the head of the train along its flank, the seven wheels
//             green; « douze »: five more light behind them (`brakes` 7 → 12, chip-douze). Cut on « Toi, en commentaire »: the
//             parked train on its slope at night, the lead smoking; the duel; one slow move down to the head through `abo`
//   boucle    cut on « Comme cette nuit-là »: FIRST, the train 1.4 run/s short of its first-frame place, rolling into it; the
//             camera riding as acte1 does — both land on POSE0 / FIRST on the last frame
import { duelCall, nextFile } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { FIRST, BENCHED, SET, POSE0, onLoco, lit, lookFrom } from "./world.js";
import { PARTS, PSI } from "./plan.js";

const S0 = { run: 0, slack: 0 };
const L = (local) => onLoco(0, S0, local); // a point of the lead, parked
const V = 1.4; // acte1's departure (run per second): the loop rolls in at the same speed
// every number of the place that BENCHED does not say (a cut says them all)
const PLACE = { ok: 0, depuis: 0, pull: 0, hold: 0, road: 0, town: 1, cross: 0 };
const CAMP = (camY, aimY, o = {}) => lookFrom(L([-50, camY, 64]), L([-32, aimY, 6]), { fov: 30, shift: 220, ...o }); // = acte1

export default function fin({ D }) {
  const { st, cut, path, shot, punch, chip, tl } = D;
  const t = D.times({
    todepuis: "todepuis", canada: "canada", un: "depuis:un", deux: "deux", et: "depuis:Et", compagnie: "compagnie",
    deposer: "depuis:déposer", main: "depuis:main", tocta: "tocta", surtout: "surtout", pour: "comment:Pour", douze: "douze",
    commentaire: "commentaire", normal: "normal", pas: "pas", toabo: "toabo", lache: "lache", toloop: "toloop", rewind: "rewind",
  });
  const c1 = t.et - 0.12; // cut: the tank cars' row
  const c2 = t.tocta; // cut: the two camps (acte1's frame)
  const c3 = t.pour - 0.12; // cut: the head of the train, twelve wheels
  const c4 = t.commentaire - 0.12; // cut: the parked train, the duel, abo

  /* ── « Depuis 2013, au Canada, un train … roule avec deux personnes à bord, au minimum. » — the cab, healed; two helmets ── */
  const CAB0 = lookFrom(L([-6, 36, 46]), L([-32, 13, 3]), { fov: 30, shift: 40 });
  cut(t.todepuis, SET.PENTE, CAB0, { ...BENCHED, ...PLACE, cab: 1, ...lit(L([-31, 12, 3]), 40) });
  st(t.todepuis + 0.16, 1.2, { depuis: 1 }, "sine.inOut");
  path([
    [t.todepuis, CAB0],
    [t.un, lookFrom(L([-14, 31, 36]), L([-34, 12.5, 2]), { fov: 30, shift: 40 })],
    [t.deux, lookFrom(L([-22, 26, 27]), L([-36.5, 12, 0.5]), { fov: 30, shift: 30 })],
    [c1, lookFrom(L([-25, 24, 23]), L([-37, 11.5, 0]), { fov: 30, shift: 30 })],
  ]);
  st(t.deux - 0.1, 0.4, { crew: 2 }, "power2.out");
  punch(t.deux, 0.06);
  chip("chip-deux", null, 96, 470, t.deux, c1 - 0.2);

  /* ── « Et chaque compagnie a dû déposer sa méthode d'essai des freins à main. » — the row of tank cars lights green ── */
  const ROW0 = lookFrom(L([420, 290, 200]), L([980, 10, 0]), { fov: 30, shift: 0 });
  cut(c1, SET.PENTE, ROW0, { ...BENCHED, ...PLACE, depuis: 1, ok: 1, ...lit(L([1000, 12, 0]), 520) });
  path([
    [c1, ROW0],
    [t.main, lookFrom(L([520, 280, 250]), L([1080, 10, 0]), { fov: 30, shift: 0 })],
    [c2, lookFrom(L([540, 278, 262]), L([1100, 10, 0]), { fov: 30, shift: 0 })],
  ]);
  st(c1, c2 - c1, { ...lit(L([1150, 12, 0]), 540) }, "none");
  st(t.deposer, t.main + 0.12 - t.deposer, { brakes: 18 }, "power1.inOut");

  /* ── « Alors, qui le tenait ? Surtout l'air. » — the night again, the question's own frame; the column ── */
  cut(c2, SET.PENTE, CAMP(13, 9.2), {
    ...BENCHED, ...PLACE, culprit: 0, fault: 0, engine: 1, smoke: 0.4, psi: PSI.held, brakes: 7, ...lit(L([-32, 9, 6]), 30),
  });
  path([
    [c2, CAMP(13, 9.2)],
    [t.surtout, CAMP(8, 8.2, { side: -420 })], // the train slides right: #colonne on the dark, not on the « 5017 »
    [c3, CAMP(7.5, 8.2, { d: 56, side: -420 })],
  ]);
  st(c2 + 0.1, 0.3, { col: 1, mark: 1 }, "power2.out");
  st(t.surtout + 0.25, 0.35, { ok: 1 }, "power2.out"); // « l'air »: the air side green
  st(c3 - 0.34, 0.24, { col: 0 }, "power2.in");

  /* ── « Pour l'enquête, il fallait au moins 12 freins à main. » — the head of the train: seven green, five more ── */
  // acte2c's « sept » frame (the seven red there): here the seven green, and five more
  const HEAD0 = lookFrom(L([-120, 300, 140]), L([420, 10, 0]), { fov: 30, shift: 0 });
  cut(c3, SET.PENTE, HEAD0, {
    ...BENCHED, ...PLACE, culprit: 0, fault: 0, ok: 1, engine: 1, smoke: 0.4, psi: PSI.held, brakes: 7, ...lit(L([450, 12, 0]), 620),
  });
  path([
    [c3, HEAD0],
    [c4, lookFrom(L([-100, 290, 175]), L([440, 10, 0]), { fov: 30, shift: 0 })],
  ]);
  st(t.douze - 0.05, 0.75, { brakes: 12 }, "power1.out");
  chip("chip-douze", null, 96, 470, t.douze - 0.05, c4 - 0.2);

  /* ── « Toi, en commentaire : un train de pétrole garé la nuit, seul… tu trouves ça normal, ou pas ? » → abo ── */
  // the parked train on its slope, the lead smoking; low in the frame (the duel, then the next file, hold the top); one slow move
  // that comes down the train to its head
  const END = t.toloop - 0.02;
  const DUEL0 = lookFrom(L([-200, 60, 170]), L([120, 12, 0]), { fov: 30, shift: -150 });
  cut(c4, SET.PENTE, DUEL0, {
    ...BENCHED, ...PLACE, culprit: 0, fault: 0, engine: 1, smoke: 0.4, psi: PSI.held, brakes: 7, ...lit(L([100, 10, 0]), 260),
  });
  path([
    [c4, DUEL0],
    [t.pas, lookFrom(L([-218, 48, 138]), L([90, 12, 0]), { fov: 30, shift: -150 })],
    [t.lache, lookFrom(L([-180, 30, 112]), L([30, 10, 0]), { fov: 30, shift: -150 })],
    [END, lookFrom(L([-140, 16, 84]), L([-25, 8, 0]), { fov: 30, shift: -140 })],
  ]);
  st(c4, END - c4, { ...lit(L([-20, 9, 0]), 90) }, "sine.inOut");
  punch(t.commentaire, 0.06);
  punch(t.pas, 0.06);
  duelCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, aAt: t.normal, bAt: t.pas, to: t.toabo - 0.32, toneA: null, toneB: null });
  nextFile(tl, { showAt: t.toabo + 0.2, factAt: t.lache, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.toloop - 0.3 });
  punch(t.lache, 0.05);

  /* ── « Comme cette nuit-là, à… » — FIRST, rolling into its first-frame place; the camera rides as acte1 does ── */
  const tEnd = D.tEnd;
  const runAt = (time) => -V * (tEnd - time); // 0 on the last frame, the first frame's speed
  const LR = (time, local) => onLoco(0, { run: runAt(time), slack: 0 }, local);
  // acte1: the camera follows at 60 % of the train's speed and draws back 2 % in 2.6 s — run backwards here
  const camAt = (time) => ({ ...moved(POSE0, L([0, 0, 0]), onLoco(0, { run: 0.6 * runAt(time) }, [0, 0, 0])), d: POSE0.d * (1 - 0.008 * (tEnd - time)) });
  cut(t.toloop, SET.PENTE, camAt(t.toloop), { ...FIRST, run: runAt(t.toloop), ...lit(LR(t.toloop, PARTS.wheel), 14) });
  st(t.toloop, tEnd - t.toloop, { run: 0, ...lit(LR(tEnd, PARTS.wheel), 14) }, "none");
  shot(t.toloop, t.rewind - t.toloop, camAt(t.rewind), "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, ease: "none" });
}
