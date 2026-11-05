// t4 → t6, and « Sauf que… au bout ? » (tot4 → tocanal). docs/CR01-actes.md « acte2b.js », docs/CR01-actes-maj.md (V3: green while it
// holds, red on the word of the incident; one red part at a time).
//   1. t4, the salle — the BOARD, tight on the eight lit dials: they light green on « huit », turn red on « quinze » (the margin is
//      violated) while « Minimum : 15 » joins the chip. Cut to the KEYS: the protection lamps go out one by one on « coupées »; on
//      « Et l'essai est lancé quand même » the pull-back to the whole room: the crew, the desk, the red board behind them.
//   2. t5, the centrale — close on the turbine (its chequered drum spinning): on « commence » the steam stops, on « ralentit » the
//      drum slows, and the camera backs off the detail until the pumps are in the frame — « les pompes aussi »: their flow halves.
//      Cut to the fuel channel (the flow that fails → the channel): « bout » the vapour takes the channel, « plus de puissance » the
//      glow climbs, the neutrons multiply (the trap of the principle, same frame).
//   3. t6 — the AZ-5 button, green (the safety, trusted): it sinks on its own on « AZ-5 ». Cut to the core: the green rods come down
//      slowly; the camera chooses the middle rod and goes down with it; « près de vingt secondes » on a chip; « Sauf que… » the act
//      02 lights and the camera dives to the rod's foot — acte3 cuts on the same foot, in the canal.
// Starts with a complete cut at `tot4`; hands over at `tocanal`. Never writes the header (main.js).
import { setAct } from "@kit/overlay.js";
import { STAGED, VIEW, SET, W } from "./world.js";
/** ∫ of a speed ramping linearly r0 → r1, as an ease (05/11: the turbine angle `rotorT`, seek-safe). */
const ramp = (r0, r1) => (u) => (2 * r0 * u + (r1 - r0) * u * u) / (r0 + r1);


const at = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};
/** The light around a point of a maquette (fx fy fz) and its size (fs). */
const lit = (name, local, fs) => {
  const [fx, fy, fz] = W(name, local);
  return { fx, fy, fz, fs };
};

export default function acte2b({ D }) {
  const { st, shot, cut, punch, chip } = D;
  const t = D.times({
    tot4: "tot4", huit: "huit", quinze: "quinze", toprot: "toprot", protections: "protections", coupees: "t4:coupées",
    et: "t4:Et", lance: "lance",
    tot5: "tot5", commence: "commence", ralentit: "ralentit", pompes: "pompes2", tofuel5: "tofuel5", bout: "bout",
    souviens: "souviens", vapeur: "vapeur2", puissance: "puissance2",
    tot6: "tot6", arret: "arret", azcinq: "azcinq", tobarres: "tobarres", descendent: "descendent", pres: "t6:près",
    vingt: "vingt", defaut: "defaut", sauf: "defaut:Sauf", bout2: "bout2", tocanal: "tocanal",
  });
  // what no shot of this act shows: the night's end, the canal's extras
  const night = { blast: 0, slab: 0, blast2: 0, fire: 0, split: 0, xenon: 0, newRod: 0, solo: 0, rep: 0, depuis: 0 };

  /* ── 1 · t4, LA SALLE ── */
  // the board, tight on the inner dials: `rodsIn` 8/72 lights exactly eight of them (salle.js: dial i lit when (29·i) mod 72 < n)
  const EIGHT = 8 / 72;
  const BOARD = { ...VIEW.board, ...at("salle", [330, 166, 0]), d: 250, az: -64, el: 4, fov: 58, shift: 20, side: 100, dof: 0 }; // in front of the crew: no head in the dials · shift 20 (retouche 05/11): the 8th dial clear of the captions
  const BOARD_IN = { ...BOARD, d: 236 };
  cut(t.tot4, SET.SALLE, BOARD, {
    ...STAGED.salle, ...night, ...lit("salle", [300, 150, 0], 170),
    fault: 0, ok: 1, viol: 0, rodsIn: EIGHT, scram: 0, az5: 0, prot: 1, crew: 1,
  });
  shot(t.tot4, t.toprot - 0.04 - t.tot4, BOARD_IN);
  // « huit barres »: the number enters with the word · « quinze au moins »: the margin is violated — the eight go red, the minimum shows
  chip("chip-barres", null, 96, 470, t.huit - 0.08, t.toprot - 0.3);
  D.tl.fromTo("#chip-barres i", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, t.quinze - 0.04);
  st(t.quinze, 0.22, { viol: 1 }, "power2.out");

  // the keys: « Plusieurs protections sont coupées » — the lamps go out one by one
  cut(t.toprot, SET.SALLE, VIEW.keys, { ...lit("salle", [136, 96, 34], 90), viol: 1, prot: 1 });
  shot(t.toprot, t.et - 0.12 - t.toprot, { ...VIEW.keys, d: 112 });
  st(t.protections, t.coupees + 0.35 - t.protections, { prot: 0 }, "none");
  // « Et l'essai est lancé quand même » — cut wide (a pull-back from the keys would brush a silhouette's head): the crew, the desk,
  // the red board behind them; a slow push
  cut(t.et - 0.12, SET.SALLE, VIEW.salle, { ...lit("salle", [200, 110, 0], 220), prot: 0, viol: 1 });
  shot(t.et - 0.12, t.tot5 - 0.04 - (t.et - 0.12), { ...VIEW.salle, d: 800 });

  /* ── 2 · t5, LA CENTRALE ── */
  // close on the turbine: the chequered drum spins at full speed, the steam line runs
  const TURB = { ...VIEW.turbineClose };
  // backed off the detail, the same side: the turbine and the four pumps it will feed, in one frame
  const TURB_PUMPS = { ...VIEW.turbine, ...at("centrale", [18, 22, -4]), d: 560, az: -36, el: 44, shift: 40, dof: 0 };
  cut(t.tot5, SET.CENTRALE, TURB, {
    ...STAGED.centrale, ...night, ...lit("centrale", [66, 30, -10], 120),
    fault: 0, ok: 1, viol: 0, spin: 1, flow: 1, feed: 1, mains: 1, diesel: 0, rotorT: t.tot5,
  });
  shot(t.tot5, t.ralentit - t.tot5, { ...TURB, d: 222 });
  // « L'essai commence »: the steam to the turbine is shut (its heads die under spin 0.82) · « ralentit »: the drum slows
  st(t.commence, 0.5, { spin: 0.78 }, "power2.out");
  st(t.ralentit, t.tofuel5 - t.ralentit, { spin: 0.35 }, "sine.out");
  { // the drum's angle follows the same speeds, seek-safe (rotorT: seconds at full speed)
    const a = t.commence, b = t.ralentit, d = t.tofuel5 - t.ralentit;
    const R1 = a + 0.5 * 0.89, R2 = R1 + 0.78 * Math.max(0, b - a - 0.5), R3 = R2 + d * (0.78 + 0.35) / 2;
    st(t.tot5, a - t.tot5, { rotorT: a }, "none");
    st(a, 0.5, { rotorT: R1 }, ramp(1, 0.78));
    if (b > a + 0.5) st(a + 0.5, b - a - 0.5, { rotorT: R2 }, "none");
    st(b, d, { rotorT: R3 }, ramp(0.78, 0.35));
  }
  // backing off the detail without losing it, until the pumps are in: « les pompes aussi » — their flow halves
  shot(t.ralentit, t.tofuel5 - 0.04 - t.ralentit, TURB_PUMPS, "sine.inOut", 222);
  st(t.ralentit, t.tofuel5 - t.ralentit, lit("centrale", [18, 24, -4], 190), "sine.inOut");
  st(t.pompes, 0.7, { flow: 0.5 }, "sine.inOut");

  // the fuel channel (the flow that fails → the channel): the water boils more, the power follows
  const FUEL = { ...VIEW.fuel, d: 350, shift: 60 };
  cut(t.tofuel5, SET.CANAL, FUEL, {
    ...STAGED.canal, ...night, ...lit("canal", [0, 120, -44], 70),
    fault: 0, ok: 0, viol: 0, rod: 0, flux: 1, steam: 0.3, pLow: 0.15, pHigh: 0.15,
  });
  shot(t.tofuel5, t.tot6 - 0.04 - t.tofuel5, { ...FUEL, d: 305 });
  // « L'eau bout davantage » — the vapour front takes the channel
  st(t.bout, 1.1, { steam: 0.8 }, "sine.inOut");
  // « plus de vapeur, plus de puissance » — the glow climbs, the neutrons multiply
  // (retouche 05/11) « vapeur »: the vapour turns red (canal.js: viol paints the vapour, the water stays light) and takes a little more
  st(t.vapeur - 0.06, 0.3, { viol: 1, steam: 0.9 }, "power2.out");
  // « puissance »: the glow climbs, clearly (pellet light ≈ 0.10 → 0.7)
  st(t.puissance - 0.06, 0.55, { pLow: 0.95, pHigh: 0.95 }, "power2.out");
  punch(t.puissance, 0.06, { hold: 0.14, down: 0.38 });

  /* ── 3 · t6, AZ-5, THE RODS ── */
  // the button, green: the safety everyone trusts (V3: an alarm part is green while it is not at fault); it sinks on its own
  const BTN = { ...VIEW.az5, d: 104 };
  cut(t.tot6, SET.SALLE, BTN, {
    ...STAGED.salle, ...night, ...lit("salle", [136, 97, -46], 80),
    fault: 0, ok: 1, viol: 1, rodsIn: EIGHT, scram: 0, az5: 0, prot: 0, crew: 1,
  });
  shot(t.tot6, t.azcinq - t.tot6, { ...BTN, d: 92 });
  st(t.azcinq - 0.04, 0.15, { az5: 1 }, "power3.out");
  punch(t.azcinq + 0.02, 0.06, { hold: 0.2, down: 0.5 });
  shot(t.azcinq + 0.7, t.tobarres - 0.04 - (t.azcinq + 0.7), { ...BTN, d: 98 });

  // the core: the rods (green) come down — slowly; the middle rod's tip: 112 − 70·(0.5 + 0.5·scram) (coeur.js)
  const SCRAM_OUT = 0.08;
  const tip = (s) => 112 - 70 * (0.5 + 0.5 * s);
  const CORE = { ...VIEW.coeur, ...at("coeur", [0, 92, 0]), d: 520, az: -58, el: 18, shift: 60, side: 70, dof: 0 };
  // retouche 05/11: the two dives (520 → 230 → 104 in 4.6 s) jolted at 83.4 and 85.4 — now a slow push on the rod, a cut a few
  // frames before « Sauf », a slow linear push to the foot (FOOT unchanged: the pose acte3 cuts from)
  const ROD = { ...VIEW.coeurBottom, ...at("coeur", [0.75, tip(SCRAM_OUT * 0.55) + 10, 0]), d: 340, az: -60, el: 14, shift: 60, side: 70, dof: 0 };
  const FOOT = { ...VIEW.coeurBottom, ...at("coeur", [0.75, tip(SCRAM_OUT) + 4, 0]), d: 104, az: -64, el: 6, shift: 120 };
  const FOOT_FROM = { ...FOOT, ...at("coeur", [0.75, tip(SCRAM_OUT * 0.62) + 5, 0]), d: 150, el: 8, shift: 110 };
  cut(t.tobarres, SET.COEUR, CORE, {
    ...STAGED.coeur, ...night,
    fault: 0, ok: 1, viol: 0, pLow: 0.38, pHigh: 0.38, rodsIn: 0.25, scram: 0,
  });
  D.st(t.tobarres, t.tocanal - t.tobarres, { scram: SCRAM_OUT }, "none");
  // « Il leur faut près de vingt secondes »: the camera picks the middle rod and goes down with it
  shot(t.tobarres + 0.1, t.sauf - 0.1 - (t.tobarres + 0.1), ROD, "sine.inOut", CORE.d);
  chip("chip-20s", null, 96, 470, t.pres + 0.14, t.sauf + 0.5);
  // « Sauf que… tu sais ce qu'il y a au bout ? » — act 02; the dive to the rod's foot (the shape acte3 cuts on)
  setAct(D.tl, 2, t.defaut);
  cut(t.sauf - 0.1, null, FOOT_FROM);
  shot(t.sauf - 0.1, t.tocanal - 0.04 - (t.sauf - 0.1), FOOT, "none", FOOT_FROM.d);
  st(t.sauf, t.tocanal - t.sauf, lit("coeur", [0, 76, 0], 70), "sine.inOut");
}
