// c5 · Vérifier, Mettre à la terre (jusqu'à « pret ») — HAND.c45 → HAND.c56 (336.21 → 429.35 s).
// The plan, sentence by sentence: docs/L02-actes.md (c5); what changed since: docs/L02-actes-maj.md.
//   VÉRIFIER        the detector presented to each conductor, mute; the neighbour makes a voltage it cannot see
//   (midroll at the card 366.50)
//   METTRE À LA TERRE  the two circuits side by side in the country; back to the mute head; the clamps, earth end
//                   first, then the conductors; the three phases tied; the zone, you inside; "on en fabrique un, exprès";
//                   you climb (the seam c56: the camera rises with you)
import { SET, AT, WORKAT, span, seam, cardAt } from "./world.js";
import { fact } from "@kit/long.js";

/** A complete pose (nothing inherited across a cut or a long move). */
const P = (p) => ({ fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, ...p });

export default function ({ D }) {
  const { st, now, shot, cut, match, tl } = D;
  const at = D.at;
  const [from] = span(D, "c5");

  /* what the poste is, all chapter long: your line cut (breaker open), its disconnector open, locked, signed */
  const CONS = { ...AT.poste, open: 1, sopen: 1, lock: 1, sign: 1, mark: 0, kv: 0, kvOn: 1 };

  /* ─────────────── VÉRIFIER (card 336.21) ─────────────── */
  // the seam: the camera turns from your mute detector toward the neighbour (−z) — and goes on turning under the card
  // c4 hands over { ...AT.poste, open, sopen, lock, sign, perche 1, arms 1, probe 0, tool 0, mark 0, geste 3 }: the same, but the header
  // turns to gesture 4 on the card "Vérifier" (the HUD only: the picture does not jump)
  seam(D, "c45", "in", { set: SET.POSTE, state: { ...CONS, perche: 1, arms: 1, probe: 0, tool: 0, named: 0, clamps: 0, geste: 4 } });

  // vat1 — "On ne croit personne. Ni le papier, ni le sectionneur." The turn comes back in an arc over your bay: far
  // off, your line disconnectors, open and locked, light up — then go out (we don't believe them either)
  const SECT = P({ tx: 760, ty: 520, tz: 420, d: 2500, az: -34, el: 11, side: -160 });
  shot(from + 1.0, at("vat1:personne") - from - 1.0, SECT, "sine.inOut");
  shot(at("vat1:personne"), at("vat1:sectionneur") + 0.2 - at("vat1:personne"), P({ ...SECT, d: 2300, az: -31 }), "sine.inOut");
  now(at("vat1:ni"), { named: 4 });
  now(at("vat1:sectionneur") + 0.55, { named: 0 });
  fact(tl, { id: "c5-vat", k: "Geste 04", v: "VAT", s: "Vérification d'absence de tension", from: at("vat1:la"), to: at("vat1:on") - 0.06 });

  // vat2 — down to you, the pole in your hands; then UP along the insulating pole to its head (the rhyme of "promesse")
  const YOU = P({ tx: 320, ty: 170, tz: 960, d: 700, az: 15, el: 8, side: -150 });
  shot(at("vat1:sectionneur") + 0.2, at("vat2:perche") - 0.4 - at("vat1:sectionneur") - 0.2, YOU, "sine.inOut", 2300);
  // the head on phase k, always at the same place and size in the picture (you stand under the phase it is on)
  const HEAD = (k, d = 270) => P({ tx: 300, ty: 1046, tz: WORKAT[k][2], d, az: 20, el: -3, fov: 34, side: -220 });
  shot(at("vat2:perche") - 0.4, at("vat2:et") - at("vat2:perche") + 0.4, HEAD(0, 330), "sine.inOut");
  // "on le présente à chaque conducteur… un par un": a cut from phase to phase, matched on the head (a slow push
  // goes on through the three); `probe` jumps on each cut — the walk between them is never shown
  const tP1 = at("vat2:conducteur") - 0.1;
  const tP2 = at("vat2:un#5") - 0.08;
  shot(at("vat2:et"), tP1 - at("vat2:et"), HEAD(0, 280), "sine.inOut");
  cut(tP1, null, HEAD(1, 280), { probe: 1 });
  shot(tP1, tP2 - tP1, HEAD(1, 262), "none");
  cut(tP2, null, HEAD(2, 275), { probe: 2 });
  shot(tP2, at("vat2$") + 0.25 - tP2, HEAD(2, 255), "none");

  // vat3 — "Le détecteur ne réagit pas." In close on the head, its lamps off, the neighbour burning behind; then "mort":
  // the picture lets go, a very slow push
  const MUTE = P({ tx: 300, ty: 1046, tz: -600, d: 190, az: 20, el: -3, fov: 34, side: -220 });
  shot(at("vat2$") + 0.25, at("vat3:réagit") + 0.2 - at("vat2$") - 0.25, MUTE, "sine.inOut", 255);
  shot(at("vat3:réagit") + 0.2, at("vat4") - at("vat3:réagit") - 0.2, P({ ...MUTE, d: 165, az: 17 }), "sine.inOut");

  // vat4 — "Une tension que la voisine fait naître dans ta ligne…": the camera slides so the neighbour stands beside
  // the head; on "naître" thin field lines run from it to yours, and your dead line takes a faint life, right under
  // the mute head. "…est-elle vraiment morte ?": a long pull-back, in profile, both circuits — held in the hold, it
  // drifts on into the card (midroll)
  const SIDE = P({ tx: 300, ty: 1070, tz: -760, d: 330, az: -12, el: 0, fov: 32, side: -260 });
  shot(at("vat4"), at("vat4:naître") - at("vat4"), SIDE, "sine.inOut");
  st(at("vat4:naître"), 1.8, { couple: 1 }, "sine.inOut");
  st(at("vat4:naître") + 0.3, 2.0, { induced: 1 }, "sine.inOut");
  const PAIR0 = P({ tx: 250, ty: 1250, tz: -1250, d: 2700, az: -78, el: 5, fov: 30 });
  const PAIR1 = P({ ...PAIR0, d: 2950 });
  const tPull = at("vat4:ta#2") - 0.1; // "Alors ta ligne…": the pull-back lands, the question is asked on a still picture
  shot(at("vat4:naître") + 0.6, tPull - at("vat4:naître") - 0.6, PAIR0, "sine.inOut", 330);

  /* ─────────────── METTRE À LA TERRE (card 366.50 · midroll) ─────────────── */
  // the form: your three conductors beside the neighbour's, seen along them in the poste → the same two circuits along
  // the line in the country, at night. The pull-back goes on across the cut, then becomes a travel along the spans
  const tCard = cardAt(D, "induit1");
  const LINE = { ...AT.ligne, live: 0, couple: 1, induced: 0.6, clamps: 0.012, perche: 1, arms: 1, probe: 2, tool: 0, geste: 5, kv: 0, kvOn: 1 }; // the card says "Geste 05 / 05"
  // the camera stays inside the span 40 000 → 80 000 (it flew through the pylon at 40 000: a parasite frame at 371.67)
  const PAIRL = P({ tx: 56000, ty: 4300, tz: -100, d: 7600, az: -82, el: 4, fov: 30 });
  match(tCard, [PAIR0, PAIR1], PAIRL, { set: SET.LIGNE, state: LINE, before: tCard - tPull, after: 1.1, fade: 0.25 });
  // induit1 — "Vos deux lignes courent côte à côte sur des kilomètres": the travel along the spans
  const RUN = P({ tx: 70000, ty: 4500, tz: -100, d: 7000, az: -80, el: 3, fov: 30 });
  shot(tCard + 1.1, at("induit1:travers") - tCard - 1.1, RUN, "sine.inOut");
  // "à travers l'air, elle agit sur la tienne": closer to the field lines between the two circuits
  const AIR = P({ tx: 66000, ty: 2900, tz: 0, d: 3200, az: -35, el: 14, fov: 30 });
  shot(at("induit1:travers"), at("induit2") - at("induit1:travers"), AIR, "sine.inOut");
  // induit2 — the simulation: the travel goes on; "plus de vingt mille" your line lights up more
  const AIR2 = P({ tx: 69500, ty: 2950, tz: 0, d: 2700, az: -48, el: 11, fov: 30 });
  shot(at("induit2"), at("induit2:ton") - at("induit2"), AIR2, "sine.inOut");
  st(at("induit2:plus"), 1.0, { induced: 1.0 }, "sine.inOut");
  fact(tl, { id: "c5-sim", k: "Simulation", v: "345 000 V", s: "Lignes américaines", from: at("induit2:simulé"), to: at("induit2:plus") - 0.1 });
  fact(tl, { id: "c5-20kv", k: "Sur un circuit ouvert", v: "Plus de 20 000 V", tone: "signal", from: at("induit2:plus"), to: at("induit2:ton") + 0.7 });

  // "Et ton détecteur n'en voit rien": back on the mute head, against your conductor (the line's conductor → yours)
  const tBack = at("induit2:ton") - 0.05;
  const BACK = P({ tx: 300, ty: 1046, tz: -600, d: 210, az: 22, el: -3, fov: 34, side: -220 });
  cut(tBack, SET.POSTE, BACK, { ...CONS, perche: 1, arms: 1, probe: 2, tool: 0, clamps: 0.012, couple: 1, induced: 1.0, geste: 5 }, { fade: 0.2 });
  shot(tBack, at("malt1:cinquième") - tBack, P({ ...BACK, d: 185, az: 19 }), "sine.inOut");

  // malt1 — "cinquième geste": the detector withdraws, the camera follows the head down and pulls back to take you
  // whole; "met à la terre": the pole now carries a clamp
  st(at("malt1:cinquième") + 0.1, 1.5, { perche: 0, arms: 0 }, "sine.inOut");
  now(at("malt1:terre"), { tool: 1 });
  const STAND = P({ tx: 330, ty: 170, tz: -210, d: 760, az: -15, el: 7, side: -150 });
  shot(at("malt1:cinquième"), at("malt1:immédiatement") - at("malt1:cinquième"), STAND, "sine.inOut", 185);
  shot(at("malt1:immédiatement"), at("malt2:pinces") - at("malt1:immédiatement"), P({ ...STAND, d: 680, az: -26, ty: 120, el: 12 }), "sine.inOut");

  // malt2 — "De grosses pinces…": down to the set on the ground; "côté terre": its clamp closes on the terminal;
  // "aux conducteurs": the pole picks the line ends up, phase after phase, and the camera rises with cable and pole
  const SET0 = P({ tx: 290, ty: 30, tz: 1210, d: 260, az: -38, el: 18, side: -120 });
  cut(at("malt2:pinces") - 0.08, null, P({ ...SET0, d: 300 }), { probe: 0 });
  shot(at("malt2:pinces") - 0.08, at("malt2:accroche") - at("malt2:pinces") + 0.08, SET0, "sine.inOut");
  const EARTHC = P({ tx: 300, ty: 22, tz: 1250, d: 130, az: -34, el: 16, side: -100 });
  shot(at("malt2:accroche"), at("malt2:terre") + 0.5 - at("malt2:accroche"), EARTHC, "sine.inOut");
  st(at("malt2:accroche"), at("malt2:terre") + 0.3 - at("malt2:accroche"), { clamps: 1 }, "sine.inOut");
  // the pole comes off your shoulder to the line ends lying there (no jump: it is lowered when the set takes it)
  now(at("malt2:seulement") - 0.1, { clamps: 1.002 });
  st(at("malt2:seulement"), at("malt2:conducteurs") - at("malt2:seulement"), { perche: 1, arms: 1 }, "sine.inOut");
  const tUp = at("malt2:conducteurs");
  const CLAMP = (k, d = 180) => P({ tx: 300, ty: 1048, tz: WORKAT[k][2], d, az: 24, el: 2, fov: 30, side: -220 });
  const tC2 = at("malt3:reliées") - 0.1;
  const tC3 = at("malt3:elles") - 0.05;
  st(tUp, tC2 - tUp - 0.05, { clamps: 1 + 1 / 3 }, "sine.inOut");
  now(tC2, { clamps: 1 + 1.78 / 3 });
  st(tC2, tC3 - tC2 - 0.05, { clamps: 1 + 2 / 3 }, "sine.out");
  now(tC3, { clamps: 1 + 2.78 / 3 });
  st(tC3, 0.7, { clamps: 1.995 }, "sine.out");
  cut(tC2, null, CLAMP(1, 185), {});
  shot(tC2, tC3 - tC2, CLAMP(1, 175), "none");
  cut(tC3, null, CLAMP(2, 182), {});
  shot(tC3, at("malt3:terre") - tC3, CLAMP(2, 168), "sine.out");
  shot(at("malt2:terre") + 0.5, tUp - at("malt2:terre") - 0.5, P({ ...SET0, d: 420, ty: 160, el: 10 }), "sine.inOut", 130);
  // phase 1: the camera rises with the clamp, from the ground to its conductor
  // a cut on "conducteurs" (the rise from the ground was too fast: 399.2), the clamp comes up into the frame
  cut(tUp, null, P({ ...CLAMP(0, 600), ty: 420 }), {});
  shot(tUp, tC2 - tUp, CLAMP(0, 190), "sine.inOut", 600);

  // malt3 — "Les trois phases sont reliées entre elles et à la terre": your line turns veille, its induced life goes;
  // "Des deux côtés": pull-back, the second set on the line side; "zone": the veille volume rises between them;
  // "Et toi, tu es dedans": the camera finds you inside it — the second thumbnail
  st(at("malt3:reliées"), at("malt3:terre") + 0.1 - at("malt3:reliées"), { earthed: 1, induced: 0, couple: 0.4 }, "sine.inOut");
  st(at("malt3:terre") + 0.1, 1.3, { perche: 0, arms: 0 }, "sine.inOut");
  now(at("malt3:terre") + 1.45, { clamps: 2 });
  const BOTH = P({ tx: -120, ty: 950, tz: 450, d: 2700, az: -40, el: 10, side: -120 });
  shot(at("malt3:terre"), at("malt3:une") - at("malt3:terre"), BOTH, "sine.inOut", 168);
  // the zone never fills the picture: 0.5 while it is named and you are found in it, then its edges only (0.15)
  st(at("malt3:zone"), 1.5, { zone: 0.5 }, "sine.inOut");
  st(at("malt4"), 1.2, { zone: 0.1 }, "sine.inOut");
  st(at("pret:montes"), 2.0, { zone: 0.15 }, "sine.inOut"); // the seam c56 gets 0.15
  now(at("malt3:zone"), { kv: -1 });
  const INSIDE = P({ tx: 300, ty: 260, tz: 1000, d: 950, az: 22, el: 7, side: -150 });
  shot(at("malt3:une"), at("malt3:dedans") + 0.15 - at("malt3:une"), INSIDE, "sine.inOut", 2700);

  // malt4 — "il file par les pinces": a current runs down the sets; "entre ta main et tes pieds… presque plus rien":
  // you, calm, in a slow orbit
  st(at("malt4:file"), 0.6, { current: 0.6 }, "sine.inOut");
  st(at("malt4:pieds") + 0.3, 0.8, { current: 0 }, "sine.inOut");
  const ORBIT = P({ tx: 300, ty: 280, tz: 980, d: 840, az: 4, el: 8, side: -160 });
  shot(at("malt3:dedans") + 0.15, at("malt5") - at("malt3:dedans") - 0.15, ORBIT, "sine.inOut", 1500);

  // malt5 — "on en fabrique un. Exprès.": down from you to the short-circuit bar and its three cables, along it;
  // "Exprès": the sets light up veille
  const BAR = P({ tx: 300, ty: 40, tz: 1220, d: 320, az: -34, el: 16, side: -120 });
  shot(at("malt5"), at("malt5:fabrique") - at("malt5"), BAR, "sine.inOut", 820);
  shot(at("malt5:fabrique"), at("pret") - at("malt5:fabrique"), P({ ...BAR, d: 290, az: -22, tz: 1180 }), "sine.inOut");
  now(at("malt5:exprès"), { named: 8 });

  // pret — "Tu montes": you walk to the gantry leg and climb it, the camera rises with you; at the top, yours veille,
  // the neighbour burning just behind — onto the seam c56
  now(at("pret:montes"), { named: 0 });
  st(at("pret"), at("pret:montes") - at("pret"), { walk: 1 }, "sine.inOut");
  st(at("pret:montes"), 5, { climb: 1 }, "sine.inOut");
  const LEG = P({ tx: 60, ty: 210, tz: 1130, d: 1000, az: -40, el: 2, side: -100 });
  shot(at("pret"), at("pret:montes") - at("pret"), LEG, "sine.inOut", 270);
  const c56 = D.at("orage-0.9") - 1.0; // HAND.c56: from[0] at its `at − before`
  shot(at("pret:montes"), c56 - at("pret:montes"), P({ tx: 0, ty: 1500, tz: 900, d: 1000, az: -40, el: 2 }), "sine.inOut");
  seam(D, "c56", "out");
}
