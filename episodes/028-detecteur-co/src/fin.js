// La fin — chute → ce qui est dû et le commentaire (duel) → like → prochain dossier → boucle (the last frame IS the first).
//   « Voilà le secret : il ne sonne pas    the bench, the detector whole on its pool (mood 0). The gas goes in and NOTHING
//     dès qu'il sent le gaz. »             sounds (sniff, alarm 0): the title « Dès qu'il sent le gaz », struck on « gaz »
//   « Il compte ta dose… »                 its ring counts up to the threshold, segment by segment (dose 0.6 → 1); the
//                                          account name lights on « compte » (D.verdict)
//   « …et sonne avant qu'elle soit         on « sonne » the buzzer's rings (alarm 1); the title swaps to « Avant le danger »
//     dangereuse. »                        and leaves before the cut
//   « Et le détecteur blanc, au plafond ? » CUT to the flat, the night again (mood 1): the white disc alone, from below,
//   « …il ne voit pas ce gaz. Jamais. »    the haze behind it (co 1, d ≥ 200: closer, the haze is not drawn); nothing
//                                          lights; it turns slowly; punch on « Jamais »
//   « Celui de fumée est obligatoire. »    chip-oblig in the top slot
//   « Celui de CO, non. »                  CUT (from the ceiling to the wall): the CO detector, close, green; chip-nonoblig
//   « En commentaire : le tien… fumée,     the duel in the top slot; one shot per answer, cut on its word: « fumée » →
//     ou CO ? »                            the disc, « CO » → the box. Each answer lights on its word; the film never
//                                          answers (no frame holds both: 180 cm apart, they do not fit under the panel)
//   « Like : … qui rallume sa chaudière    CUT to the boiler, its burner off, no gas (mood 0); the flame comes back on
//     ce soir. »                           « rallume »; likeCall
//   « Prochain dossier : une avalanche… »  CUT outside, nobody: the camera rises into the night; nextFile (no figure)
//   « Dehors comme chez toi… le jour où… » CUT on « Dehors »: the flat from outside, far, on the first frame's line of
//                                          sight, the night of the hook (FIRST); the camera comes in by ratio and lands on
//                                          POSE0 (D.loop): the last frame is the first.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, LOOK, DETECTOR, SMOKE, BOILER, BENCHAT } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const [DX, DY, DZ] = DETECTOR.at;
const [SX, SY, SZ] = SMOKE.at;
const [BX, BY, BZ] = BOILER.burner;

/* ── the poses (complete) ── */
// the chute: the detector whole on the bench, low in the frame (the title holds the top slot)
const CHUTE0 = { ...P, tx: 0, ty: BENCHAT[1], tz: 2, d: 100, az: -40, el: 12, fov: 28, shift: -70 };
const CHUTE1 = { ...CHUTE0, d: 88, az: -28, el: 14 };
// the smoke detector, from below, alone in the haze (co 1: the orange behind it IS the gas), turning slowly
const SMOKE0 = { ...P, tx: SX, ty: SY - 6, tz: SZ, d: 215, az: -44, el: -32, fov: 34, shift: 30 };
const SMOKE1 = { ...SMOKE0, d: 185, az: -24, el: -34 };
// « Celui de CO, non. »: the CO detector on the wall, close; it pulls back a little while the question comes
const WALLC = { ...P, ...CLOSE, tx: DX, ty: DY, tz: DZ + 3, d: 100, az: -36, el: 2, fov: 30, shift: -40 };
const WALLC2 = { ...WALLC, d: 118, az: -28, el: 0 };
// the duel, one shot per answer: « fumée » → the disc (under the panel) · « CO » → the box
const DUELA = { ...P, tx: SX, ty: SY - 6, tz: SZ, d: 175, az: -30, el: -34, fov: 34, shift: -90 };
const DUELB = { ...P, ...CLOSE, tx: DX, ty: DY, tz: DZ + 3, d: 105, az: -22, el: 0, fov: 30, shift: -110 };
const DUELB2 = { ...DUELB, d: 98 };
// the like: the boiler, low, its burner relit
// (az −30: from −58 a tall glass cone of the corridor lit white over it)
const BOIL0 = { ...P, tx: BX, ty: 140, tz: BZ, d: 460, az: -30, el: -6, fov: 40, shift: -145 };
const BOIL1 = { ...BOIL0, d: 430, az: -24, el: -5 };
// the next file: outside, nobody, the camera rising into the night
const SKY0 = { ...P, ...VIEW.outside, dof: 0 };
const SKY1 = { ...SKY0, ty: 220, el: -14, d: 620 };
// the loop: the first frame's line of sight, from far outside
const FAR = { ...POSE0, d: 1100, az: -27, el: 8, shift: 70 };

export default function fin({ D }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", sent: "sent", strike: "strike", verdict: "verdict", dose: "chute:dose",
    sonne: "chute:sonne#2", avant: "avant", tocta: "tocta",
    plafond: "plafond", jamais: "jamais", oblig: "oblig", nonoblig: "nonoblig", ask: "ask", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", rallume: "like:rallume", likeEnd: "like$",
    toabo: "toabo", abo: "abo", avalanche: "avalanche", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: on the bench, the verdict ── */
  cut(t.toverdict, SET.BENCH, CHUTE0, { ...BENCHED, dose: 0.6, alarm: 0 });
  shot(t.toverdict, t.tocta - t.toverdict, CHUTE1, "sine.inOut");
  st(t.sent - 0.2, 0.6, { sniff: 0.6 }, "sine.out"); // the gas goes in…
  st(t.verdict, t.dose + 0.3 - t.verdict, { dose: 1, current: 0.6 }, "none"); // …it counts, up to its threshold
  st(t.sonne, 0.22, { alarm: 1 }, "power2.out"); // …and it sounds
  st(t.tocta - 0.6, 0.5, { sniff: 0, current: 0 }, "sine.inOut");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.strike, swapAt: t.avant, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);

  /* ── CE QUI EST DÛ: the smoke detector never sees this gas ── */
  const NIGHT = { ...STAGED, co: 1, smoke: 1, mood: 1 };
  cut(t.tocta, SET.FLAT, SMOKE0, { ...NIGHT, fx: SX, fy: SY - 10, fz: SZ, fs: 90 });
  shot(t.tocta, t.nonoblig - t.tocta, SMOKE1, "sine.inOut");
  D.punch(t.jamais, 0.06);
  D.chip("chip-oblig", null, 96, 470, t.oblig, t.nonoblig - 0.2);

  /* « Celui de CO, non. »: from the ceiling to the wall */
  cut(t.nonoblig - 0.08, SET.FLAT, WALLC, { ...NIGHT, fx: DX, fy: DY, fz: DZ, fs: 30 });
  shot(t.nonoblig - 0.08, t.duelA - t.nonoblig, WALLC2, "sine.inOut");
  D.chip("chip-nonoblig", null, 96, 470, t.nonoblig + 0.02, t.ask - 0.62);

  /* the comment, as a choice: the panel asks it, each answer has its shot on its word — the film never answers */
  duelCall(tl, { from: t.ask - 0.4, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.36, toneA: "signal", toneB: "veille" });
  cut(t.duelA - 0.02, SET.FLAT, DUELA, { fx: SX, fy: SY - 10, fz: SZ, fs: 90 });
  cut(t.duelB - 0.02, SET.FLAT, DUELB, { fx: DX, fy: DY, fz: DZ, fs: 30 });
  shot(t.duelB - 0.02, t.tolike - t.duelB, DUELB2, "sine.inOut");

  /* ── LIKE: the boiler, relit tonight ── */
  cut(t.tolike, SET.FLAT, BOIL0, { ...STAGED, you: 0, kids: 0, leak: 0, co: 0, flame: 0, mood: 0, fx: BX, fy: BY, fz: BZ, fs: 160 });
  shot(t.tolike, t.toabo - t.tolike, BOIL1, "sine.inOut");
  st(t.rallume, 0.35, { flame: 1 }, "power2.out");
  likeCall(tl, { from: t.like, to: t.likeEnd, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER: last, nothing of the subject after it ── */
  cut(t.toabo, SET.FLAT, SKY0, { ...STAGED, you: 0, kids: 0, leak: 0, co: 0, flame: 1, mood: 0, fx: 360, fy: 120, fz: 30, fs: 700 });
  shot(t.toabo, t.toloop - t.toabo, SKY1, "sine.inOut");
  nextFile(tl, { showAt: t.abo - 0.05, factAt: t.avalanche, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Dehors comme chez toi… » — from outside, back into the first frame ── */
  cut(t.toloop, SET.FLAT, FAR, { ...STAGED, ...FIRST });
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.04, fromD: FAR.d });
}
