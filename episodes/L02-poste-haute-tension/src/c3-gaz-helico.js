// c3 · Le disjoncteur (de « histoire » à « piege »), Sans couper — HAND.c23 → HAND.c34.
// The bench: the slow pull-back from the dead chamber goes on and finds 1956 beside it; the gas leaves as a cloud that
// turns signal as it rises; the camera dives back into the chamber, where a vacuum bottle takes its place. The poste: the
// same pole at the same place of the frame — its chamber closes, its mechanism could close it again; the camera glides
// toward the line that leaves. Under the card "Sans couper", a dip to the line in the country at dusk, the move going
// on: the helicopter flies in, the camera follows it down its sling, cranes over the basket (the drop), the two
// technicians change a spacer, a long pull-back keeps the line live under them. "Toi, tu coupes": the helicopter leaves
// to the right, the poste picks the move up — your line goes dark — and the travel along your bay hands over to c4.
import { moved } from "@kit/direct.js";
import { fact } from "@kit/long.js";
import { SET, AT, VIEW, HAND, span, seam, cardAt } from "./world.js";
import { PH, BREAKER, HELI } from "./plan.js";

export default function ({ D }) {
  const { st, now, shot, cut, match } = D;
  const t = D.at;
  const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
  const HERO = [BREAKER.x, 0, PH[0]]; // the hero pole's foot in the poste (on the bench: the origin)
  span(D, "c3");

  /* ═══ histoire — the pull-back from the dead chamber goes on, and finds 1956 beside the hero ═══ */
  const T0 = seam(D, "c23", "in", { set: SET.BENCH, state: { ...AT.bench, see: 1, open: 1, gas: 0.4, geste: 0, kv: 400, kvOn: 1 } });
  const s0 = t(HAND.c23.at) + HAND.c23.opt.after; // the seam's own move is over
  const O1 = { ...P, tx: 300, ty: 430, tz: -130, d: 1800, az: -30, el: 8, side: -60 }; // both breakers, the old one on the right
  const O2 = { ...P, tx: 520, ty: 300, tz: -260, d: 780, az: -34, el: 10, side: -150 }; // the push onto 1956
  const O3 = { ...P, tx: 560, ty: 300, tz: -260, d: 720, az: -40, el: 12, side: -150 }; // a glide along its six chambers
  const tWest = t("histoire:Westinghouse");
  shot(s0, tWest + 1.2 - s0, O1, "sine.inOut", T0.d);
  st(t("era56"), 1.6, { era: 1 });
  st(t("era56"), 3.0, { fx: 260, fy: 520, fz: -130, fs: 650, pool: 0.4 });
  fact(D.tl, { id: "c3-1956", k: "Premier disjoncteur au SF6", v: "1956", s: "Westinghouse", from: t("era56"), to: tWest + 0.85 });
  const tPush = tWest + 1.2;
  const tSix = t("histoire:chambres") - 0.15;
  shot(tPush, 2.8, O2);
  shot(tPush + 2.8, tSix - (tPush + 2.8), { ...O2, az: -37, d: 750 });
  st(tPush, 3.0, { fx: 520, fy: 300, fz: -260, fs: 500, pool: 0.45 });
  fact(D.tl, { id: "c3-5000", k: "Il coupe", v: "5 000 AMPÈRES", s: "sous 115 000 V", from: t("histoire:coupe") + 0.3, to: t("climat") - 0.75 });
  st(tSix, 1.3, { era: 2 });
  shot(tSix, t("climat") - 0.2 - tSix, O3);

  /* ═══ climat — a pan back to the hero, then the camera rises with the gas, which turns signal as it climbs ═══ */
  const tPan = t("climat") - 0.2;
  const tGas = t("climat:gaz");
  const H1 = { ...P, tx: 0, ty: 800, tz: 0, d: 900, az: -27, el: 6, side: -160 };
  const H2 = { ...P, tx: 0, ty: 1450, tz: 0, d: 1300, az: -29, el: 4, side: -100 }; // the cloud fills the frame
  shot(tPan, tGas - 0.1 - tPan, H1);
  st(t("climat"), 1.2, { era: 0 }); // the old one leaves the frame with the pan
  st(tPan, 2.0, { fx: 0, fy: 850, fz: 0, fs: 450, pool: 0.3 });
  st(tGas, 4.0, { cloud: 1 });
  st(tGas, 4.0, { fy: 1000, fs: 650 });
  const tDive = t("vide") - 0.3;
  shot(tGas - 0.1, tDive - (tGas - 0.1), H2);
  fact(D.tl, { id: "c3-co2", k: "Effet de serre : plus de", v: "20 000 FOIS", s: "celui du CO2", tone: "signal", from: t("climat:vingt"), to: t("vide") - 1.0 });

  /* ═══ vide — the rise turns into a dive back into the chamber: the gas goes, a vacuum bottle takes its place ═══ */
  const V1 = VIEW.chamber;
  const V2 = { ...P, tx: 0, ty: 748, tz: 0, d: 250, az: -22, el: 5, side: -160 };
  const tIn = t("vide:vide") - 0.25;
  shot(tDive, tIn - tDive, V1, "sine.inOut", H2.d);
  st(t("vide") - 0.2, 1.6, { cloud: 0 });
  st(t("vide") - 0.2, 2.6, { fx: 0, fy: 750, fz: 0, fs: 300, pool: 0.3 });
  st(t("vide:nouveaux"), 0.8, { gas: 0 });
  st(t("vide:nouveaux"), 2.2, { vacuum: 1 });
  const tP = t("piege") - 0.05; // the cut back to the poste, just before "Mais attention"
  shot(tIn, tP - tIn, V2);

  /* ═══ piege — the same pole, in the poste, at the same place of the frame: it closes, it could close again ═══ */
  const PC = moved(V2, [0, 0, 0], HERO);
  cut(tP, SET.POSTE, PC, { ...AT.poste, live: 1, see: 1, open: 1, poste: 0.35, you: 0, geste: 0, kv: 400, kvOn: 1, fx: HERO[0], fy: 750, fz: HERO[2], fs: 300 }, { fade: 0.2 });
  const PB1 = { ...P, tx: HERO[0], ty: 720, tz: HERO[2], d: 720, az: -32, el: 7, side: -160 };
  const PB2 = { ...P, tx: HERO[0], ty: 420, tz: HERO[2], d: 1150, az: -38, el: 10, side: -60 }; // down to its mechanism
  const PB3 = { ...PB2, ty: 420, d: 1000, az: -40 };
  const tShut = t("piege:enfermés");
  shot(tP, tShut - tP, PB1, "sine.inOut", V2.d);
  st(tP + 0.5, 3.0, { fs: 700, fy: 650 });
  st(tShut - 0.1, 0.8, { see: 0 });
  const tAgain = t("piege:ça");
  shot(tShut, tAgain - 0.05 - tShut, PB2);
  st(tAgain - 0.05, 0.3, { threat: 1 }, "power2.out");
  st(tAgain + 0.25, 1.0, { threat: 0.3 });
  const tSee = t("piege:voir");
  shot(tAgain - 0.05, tSee - (tAgain - 0.05), PB3);
  st(tShut + 0.3, 3.4, { poste: 1, fx: 1300, fy: 650, fz: 300, fs: 1600 }); // the poste comes back while the camera sinks, not in the glide

  /* ═══ tst1 — under the card, the glide along your bay toward the line goes on in the country (dip) ═══ */
  const tCard = cardAt(D, "tst1");
  const PB4 = { ...P, tx: 1350, ty: 420, tz: HERO[2], d: 1050, az: -41, el: 10, side: -70 }; // toward −x, level: rising, it swept the live connections into the top of the frame (qa)
  const L1 = { ...P, tx: 84000, ty: 4800, tz: 0, d: 4000, az: -34, el: 4, side: -80 }; // along the bundles, by a pylon
  const L1b = match(tCard, [PB3, PB4], L1, {
    set: SET.LIGNE,
    state: { ...AT.ligne, day: 1, heli: 1, fly: 50000, basket: 0, spacer: 0, geste: 0, kvOn: 0 },
    before: tCard - tSee, after: 1.0, fade: 0.2, kind: "dip",
  });
  const tWide = t("tst2") - 0.7;
  const L2 = { ...P, tx: 73000, ty: 4600, tz: 0, d: 15000, az: -30, el: 5, fov: 30 }; // the live line across the frame, its pylon
  shot(tCard + 1.0, tWide - (tCard + 1.0), L2, "sine.inOut", L1b.d);

  /* ═══ tst2 — the helicopter flies in (from the left) and stops over the spacer; down its sling to the basket ═══ */
  st(t("tst1:coûte"), t("tst3") - 0.6 - t("tst1:coûte"), { fly: HELI.x }, "power2.out");
  const T1 = { ...P, tx: 59000, ty: 5900, tz: 900, d: 9000, az: -32, el: -2, fov: 30, side: -100 }; // the live bundles, and the helicopter flying in over them
  const T2 = { ...P, tx: 59800, ty: 5300, tz: 900, d: 2600, az: -31, el: 1, fov: 30, side: -120 }; // "deux techniciens dans une nacelle": the basket, hanging
  const T3 = { ...VIEW.heliClose, ty: 7150 }; // "suspendue sous un hélicoptère": up the sling to it
  const tTrack = t("tst2:service") + 0.3;
  const tSling = t("tst2:suspendue");
  const tNear = t("tst2:ligne");
  shot(tWide, tNear - tWide, T1, "sine.inOut", L2.d);
  shot(tNear, tTrack - tNear, { ...T1, tx: 59600, d: 8500 }); // it flies in over the live line
  shot(tTrack, tSling - tTrack, T2);
  fact(D.tl, { id: "c3-2025", k: "Juillet", v: "2025", s: "Dunkerque – Arras", from: t("tst2"), to: t("tst2:ligne") + 1.3 });
  fact(D.tl, { id: "c3-live", k: "Ligne en service", v: "400 000 V", tone: "signal", from: t("tst2:service") - 0.4, to: tSling - 0.1 });

  /* ═══ tst3 — the crane over the basket (the drop), then the two technicians at the spacer ═══ */
  const tCrane = t("tst3") + 0.1;
  shot(tSling, tCrane - tSling, T3);
  st(t("tst3"), 2.4, { basket: 1 });
  const tWork = t("tst3:remplacent") - 0.15;
  const tHigh = t("tst3:protectrices");
  shot(tCrane, tHigh - tCrane, { ...VIEW.vertigo, d: 2400 }); // over it, the camera tilts down: the drop under the basket
  shot(tHigh, tWork - tHigh, { ...P, tx: HELI.x, ty: 3950, tz: 900, d: 1900, az: -27, el: 52, fov: 42 });
  fact(D.tl, { id: "c3-haut", k: "Au travail", v: "40 À 80 MÈTRES", s: "du sol", from: t("tst3"), to: t("tst3:ils") - 0.12 });
  const BK2 = { ...VIEW.basket, d: 600, az: -27, el: 13, side: -100 };
  const BK3 = { ...P, tx: HELI.x, ty: 3700, tz: 880, d: 1250, az: -31, el: 16, side: -60 }; // the burning bundles around
  cut(tWork, null, VIEW.basket); // on the object: the basket where the crane left it, the word "remplacent"
  st(tWork + 0.05, 2.0, { spacer: 1 });
  const tAround = t("tst3:sans") - 0.15;
  shot(tWork, tAround - tWork, BK2);
  fact(D.tl, { id: "c3-400", k: "Entretoises remplacées", v: "≈ 400", s: "en deux semaines", from: t("tst3:cents") - 0.2, to: t("tst3:sans") - 0.2 });
  const tBack = t("tst4") - 0.05;
  shot(tAround, tBack - tAround, BK3);

  /* ═══ tst4 — the long pull-back by ratio: the line stays live under the helicopter ═══ */
  const W1 = { ...P, tx: 60000, ty: 5200, tz: 900, d: 7000, az: -30, el: 3, fov: 30, side: -150 }; // the helicopter, the basket, the live line
  const W2 = { ...W1, tx: 60400, d: 6700 };
  const tGo = t("tst5:voles") - 0.5;
  shot(tBack, t("tst4:pendant") - tBack, W1, "sine.inOut", BK3.d);
  shot(t("tst4:pendant"), tGo - t("tst4:pendant"), W2);
  fact(D.tl, { id: "c3-rte", k: "Selon RTE · jusqu'à", v: "1 400 JOURS", s: "de coupure évités par an", from: t("tst4:jours") - 0.6, to: t("tst4:pendant") + 0.1 });
  st(t("tst4:pendant"), 1.6, { basket: 0.3 });

  /* ═══ tst5 — the helicopter leaves to the right; the poste picks the move up on you; your line goes dark ═══ */
  const tC = t("tst5:toi#2") - 0.05;
  st(t("tst5") + 0.2, tC - 0.05 - (t("tst5") + 0.2), { fly: 66000 }, "power2.in");
  const W3 = { ...W2, tx: W2.tx + 800 };
  const Y1 = { ...VIEW.field, d: 1000 }; // you under your line (poste.js: seen)
  const Y1b = match(tC, [W2, W3], Y1, {
    set: SET.POSTE,
    state: { ...AT.poste, live: 1, fly: HELI.x, arms: 0, perche: 0, geste: 0, kv: 400, kvOn: 1, fx: 600, fy: 600, fz: 600, fs: 1800 },
    before: tC - tGo, after: 0.9, fade: 0.2,
  });
  st(t("linecut"), 0.6, { live: 0 });
  st(t("linecut"), 1.0, { open: 1 });
  now(t("linecut"), { kv: 0 });
  const tTravel = t("tst5:cinq") - 0.1;
  shot(tC + 0.9, tTravel - (tC + 0.9), { ...Y1b, tx: VIEW.field.tx, tz: VIEW.field.tz, d: 800, ty: 160 }); // the push onto you: your line is cut
  const h = HAND.c34;
  const tOut = t(h.at) - h.opt.before;
  shot(tTravel, tOut - tTravel, h.from[0]);
  seam(D, "c34", "out");
}
