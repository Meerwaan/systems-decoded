// c2 · Le poste (de « sol » à « voisine »), Le disjoncteur (jusqu'à « disj5 ») — HAND.c12 → HAND.c23.
//
// The descent of c1 goes on through the gravel: the ground opens in section under your bay, the mesh lights, a fault
// sends rings of potential from the foot of your gantry leg. You step (the step voltage between your feet), walk to
// the leg and lay your hand on it (the touch voltage, hand to feet); on "relie" the whole mesh lights and everything
// rises together. Down to your feet on the gravel: its resistance chokes the current. Then ONE long pull-back, from
// your feet to the last pylon: two circuits on the same steel; yours drops a notch ("une seule"), the neighbour
// reaches for it through the air. The card "Le disjoncteur" (the mid-roll): a cut, the same way, a fast travel along
// your line that slows on your breaker pole. The push goes on through a cut to the bench, on the same pole at the same
// place of the picture; the chamber opens, the contacts part, the arc strikes — the film's showpiece — and the camera
// dives into its white core (20 000 °C), pulls back as the SF6 blows, the sine runs to a zero, and the gas chokes it.
// A slow pull-back from the dead chamber hands over to c3.
import { fact } from "@kit/long.js";
import { SET, AT, HAND, seam, cardAt } from "./world.js";
import { BREAKER, PH } from "./plan.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
/* ── the poste: the ground in section (the +z bay fades with `cutaway`: never these poses without the cut) ── */
const GROUND_A = { ...P, tx: 120, ty: 20, tz: 1150, d: 1100, az: -18, el: 14, side: -100 }; // the section, the mesh, your foot of leg
const GROUND_B = { ...P, tx: 160, ty: 62, tz: 1120, d: 560, az: -14, el: 8, side: -60 }; //  lateral: your legs in the section
const TOUCH_HI = { ...P, tx: 0, ty: 125, tz: 1230, d: 720, az: -24, el: 5, side: -100 }; // up to your hand on the leg
const MESH_WIDE = { ...P, tx: 500, ty: -50, tz: 1100, d: 1700, az: -28, el: 24, side: -100 }; // the whole mesh lit
const GRAVEL = { ...P, tx: 10, ty: 5, tz: 1255, d: 330, az: -22, el: 24 }; //                     your feet on the gravel
const GRAVEL_2 = { ...P, tx: 10, ty: 3, tz: 1255, d: 280, az: -34, el: 19 };
const PYLON_A = { ...P, tx: -2600, ty: 2300, tz: -1200, d: 6200, az: -56, el: 7, side: -100 }; // the two circuits, pylon to gantry
const PYLON_HOLD = { ...PYLON_A, tx: -2300, ty: 2250, d: 5900 }; // the two circuits, pylon to gantry
/* ── the poste: the breaker ── */
const BX = [BREAKER.x, 0, PH[0]]; // the hero pole's foot in the poste (model.js · heroHome)
const RUN = { ...P, tx: 350, ty: 1100, tz: PH[0], d: 1500, az: -74, el: 10 }; //                 along your line, looking +x
const POLE = { ...P, tx: BX[0], ty: 720, tz: BX[2], d: 760, az: -35, el: 8, side: -160 }; //      your breaker pole (VIEW.breaker)
const POLE_IN = { ...P, tx: BX[0], ty: 750, tz: BX[2], d: 560, az: -28, el: 6, side: -160 }; //   pushed on its chamber
/* ── the bench (the cut of the chamber faces az −25: keep az in −5 … −45) ── */
const onBench = (p) => ({ ...p, tx: p.tx - BX[0], tz: p.tz - BX[2] });
const CHAMBER = { ...P, tx: 0, ty: 748, tz: 0, d: 300, az: -25, el: 6, side: -160 };
const CHAMBER_O = { ...P, tx: 0, ty: 746, tz: 0, d: 270, az: -36, el: 4, side: -190 };
// THE THUMBNAIL (disj3:approche): the chamber cut open, its arc lighting it, at the right third
const THUMB = { ...P, tx: 0, ty: 748, tz: 0, d: 215, az: -30, el: 5, side: -330 };
const CORE = { ...P, tx: 0, ty: 745, tz: 0, d: 90, az: -20, el: 4, fov: 32, side: -60 }; //       the white core (VIEW.arcCore)
const CORE_2 = { ...CORE, d: 105, az: -14, el: 2 };
const SINE = { ...P, tx: 0, ty: 748, tz: 0, d: 380, az: -28, el: 7, side: -120 }; //                chamber + the sine on its left
const QUENCH = { ...P, tx: 0, ty: 748, tz: 0, d: 250, az: -22, el: 5, side: -160 };
const DEAD = { ...P, tx: 0, ty: 748, tz: 0, d: 270, az: -36, el: 8, side: -150 };

// the light: what it stands around, and how wide
const L_GROUND = { fx: 250, fy: 0, fz: 1150, fs: 1400 };
const L_FEET = { fx: 10, fy: 0, fz: 1255, fs: 300 };
const L_PYLON = { fx: -2000, fy: 1600, fz: -1000, fs: 6000 };
const L_POLE = { fx: BX[0], fy: 750, fz: BX[2], fs: 500 };
const L_CHAMBER = { fx: 0, fy: 750, fz: 0, fs: 300 };

export default function ({ D }) {
  const { st, now, shot, cut, tl } = D;
  const at = D.at;

  /* ═════ the seam: the descent of c1 goes on (your line is live, nothing is cut yet) ═════ */
  // c1 leaves you faded out (you → 0) and the envelope gone: you come back in the section
  const S0 = at(HAND.c12.at);
  seam(D, "c12", "in", {
    set: SET.POSTE,
    state: { ...AT.poste, live: 1, geste: 0, kv: 400, kvOn: 1, you: 0, walk: 0.8, climb: 0, arms: 0, perche: 0, ...L_GROUND, fs: 1800 },
  });
  const seamEnd = S0 + HAND.c12.opt.after;

  /* ── sol: "Et le maillage enterré sous tes pieds ?" ── */
  st(S0 + 0.1, 1.0, { cutaway: 1 }, "sine.inOut"); //   the gravel opens in section ("enterré" 89.3)
  st(at("sol:enterré"), 0.9, { mesh: 0.6 }, "sine.out");
  st(at("sol:enterré") + 0.2, 1.3, { you: 1, fs: L_GROUND.fs }, "sine.inOut");
  shot(seamEnd, at("sol:Entre") - 0.4 - seamEnd, GROUND_A);
  st(at("faultsol"), 3.0, { fault: 1 }, "sine.out"); //   the fault: rings from the foot of the leg, uneven
  // "Entre tes deux pieds": one step toward the leg, feet apart; the step voltage lights between them
  shot(at("sol:Entre") - 0.4, at("toucher") - at("sol:Entre") + 0.2, GROUND_B);
  st(at("sol:Entre") - 0.2, 0.9, { walk: 0.9 }, "sine.inOut");

  /* ── toucher: "Pose la main sur une structure de métal…" ── */
  st(at("sol:pas#2") + 0.1, 0.9, { walk: 1 }, "sine.inOut");
  st(at("toucher:main"), 0.6, { arms: 2 }, "sine.out");
  shot(at("toucher") - 0.2, at("toucher:Le") - at("toucher") - 0.4, TOUCH_HI); // up from your feet to your hand
  st(at("bondall"), 1.2, { bond: 1, mesh: 1 }, "sine.inOut"); // "relie": the whole mesh, everything rises together
  shot(at("toucher:Le") - 0.6, at("gravier") + 0.5 - at("toucher:Le") + 0.6, MESH_WIDE, "sine.inOut", TOUCH_HI.d); // a slow pull-back by ratio, 3.6 s
  st(at("toucher:Le"), 1.4, { fs: 3000 }, "sine.inOut");

  /* ── gravier: "Et le gravier, partout au sol ?" — down to your feet ── */
  st(at("gravier"), 1.6, { fault: 0, bond: 0, mesh: 0.25, cutaway: 0.4, arms: 0, ...L_FEET }, "sine.inOut");
  shot(at("gravier") + 0.5, at("gravier:Il") + 0.3 - at("gravier") - 0.5, GRAVEL, "sine.inOut", MESH_WIDE.d);
  st(at("gravier:résistance"), 1.2, { gravel: 1 }, "sine.out"); // the layer lights, the current choked in it
  shot(at("gravier:Il") + 0.3, at("voisine") - at("gravier:Il") - 0.3, GRAVEL_2);

  /* ── voisine: one long pull-back, from your feet to the last pylon ── */
  const V0 = at("voisine");
  const CARD = cardAt(D, "disj1"); // 127.03: the card — and YouTube's mid-roll
  // up to the pylon; then the hold: a slow push that goes on through the card (clipped there while it still glides)
  shot(V0, at("voisine:tension") + 0.2 - V0, PYLON_A, "sine.inOut", GRAVEL_2.d); // 6.6 s: the climb no longer jerks
  shot(at("voisine:tension") + 0.2, CARD + 2.5 - at("voisine:tension") - 0.2, PYLON_HOLD);
  st(V0 + 0.2, 1.4, { you: 0, gravel: 0 }, "sine.inOut"); //  you fade before the camera passes you
  st(V0 + 0.6, 2.2, { cutaway: 0, mesh: 0 }, "sine.inOut");
  st(V0, at("voisine:une") - V0, { ...L_PYLON }, "sine.inOut");
  st(at("voisine:seule"), 0.8, { live: 0.3 }, "sine.inOut"); // "une seule": your line drops a notch, and stays so
  st(at("voisine:que"), 1.2, { couple: 0.4 }, "sine.out"); //   the neighbour reaches for it through the air

  /* ═════ Le disjoncteur: after the ad, the same way — a fast travel along your line that slows on your pole ═════ */
  cut(CARD, SET.POSTE, RUN, { ...AT.poste, live: 1, geste: 0, kv: 400, kvOn: 1, you: 0, ...L_POLE, fs: 1600 });
  shot(CARD, at("disj2") - CARD, POLE, "sine.out"); // fast at the cut, it slows all the way onto the pole
  st(CARD, 2.0, { fs: L_POLE.fs }, "sine.inOut");
  // "Le disjoncteur": the poste goes dark around it, the pole holds the light
  st(at("disj1:Le") - 0.3, 0.8, { poste: 0.3 }, "sine.inOut");
  now(at("disj1:Le"), { named: 3 });
  now(at("disj2:interrupteur"), { named: 0 }); // the light goes inside: what the chamber hides
  // "Couper 400 000 V…": the push on its chamber, through the cut to the bench (same pole, same place)
  const B0 = at("disj2:Quand") - 0.25; // 135.93
  D.match(B0, [POLE, POLE_IN], onBench(POLE_IN), {
    before: B0 - at("disj2"),
    after: 1.5,
    set: SET.BENCH,
    state: { ...AT.bench, ...L_CHAMBER, geste: 0, kv: 400, kvOn: 1, pool: 0, grid: 0, mood: 1, hot: 0.3 }, // the threat: a signal rim, a warm ground behind the dark chamber
    fade: 0.15,
  });
  st(B0 + 0.02, 0.6, { pool: 0.3, grid: 0.16 }, "sine.out");
  st(B0 + 0.05, 0.8, { see: 1 }, "sine.inOut"); //               the chamber opens
  st(at("contacts"), 1.2, { open: 1 }, "power2.inOut"); //         "s'écartent"
  shot(B0 + 1.5, at("disj2:saute") + 0.6 - B0 - 1.5, CHAMBER);
  // "saute": the arc strikes — the scene turns signal on the spot, a knock, and the arc burns hot a moment
  st(at("arcon"), 0.3, { arc: 1, heat: 0.45 }, "power2.out");
  st(at("arcon"), 0.25, { hot: 0.42 }, "power2.out");
  D.jolt(at("arcon"), 0.5, 0.45);
  st(at("arcon") + 0.5, 1.2, { heat: 0.15 }, "sine.inOut");
  // "Un éclair qui refuse de mourir": it breathes; a slow turn round it, onto the thumbnail
  shot(at("disj2:saute") + 0.6, at("disj3:approche") + 0.2 - at("disj2:saute") - 0.6, THUMB);

  /* ── disj3: the dive into the white core ── */
  shot(at("disj3:approche") + 0.2, at("disj3:Il") - at("disj3:approche") - 0.1, CORE, "sine.inOut", THUMB.d);
  st(at("disj3:vingt") - 0.1, 0.6, { heat: 1 }, "power2.out");
  fact(tl, { id: "c2-heat", k: "L'arc", v: "≈ 20 000 °C", tone: "signal", from: at("disj3:vingt"), to: at("disj3:Il") + 0.95 });
  st(at("disj3:deux"), 1.5, { heat: 0.3 }, "sine.inOut"); //       "à moins de deux mille": it pales
  fact(tl, { id: "c2-cool", k: "À refroidir sous", v: "2 000 °C", tone: "veille", from: at("disj3:deux"), to: at("disj4") - 0.5 });
  shot(at("disj3:Il") - 0.1, at("disj4") - at("disj3:Il") + 0.1, CORE_2);

  /* ── disj4: pull back as the SF6 blows; the sine runs to a zero ── */
  shot(at("disj4"), at("disj4:courant") - 0.12 - at("disj4"), CHAMBER_O, "sine.inOut", CORE_2.d);
  st(at("disj4:souffle"), 1.0, { gas: 1 }, "sine.out");
  fact(tl, { id: "c2-sf6", k: "Le gaz", v: "SF6", tone: "veille", from: at("disj4:SF6"), to: at("disj4:courant") - 0.3 });
  st(at("disj4:courant"), 0.6, { wave: 1 }, "sine.out");
  st(at("disj4:alternatif"), at("zero") - at("disj4:alternatif"), { cycle: 6 }, "none"); // the zero lands on "zéro"
  shot(at("disj4:courant") - 0.12, at("zero") - at("disj4:courant") + 0.32, SINE);
  fact(tl, { id: "c2-hz", k: "Il change de sens", v: "100 fois", s: "par seconde", tone: null, side: "right", from: at("disj4:cent"), to: at("disj4$") - 0.1 });

  /* ── disj5: on the zero, the gas chokes the arc ── */
  st(at("quench"), 0.4, { arc: 0 }, "power2.in"); //                 "étouffe"
  st(at("quench") + 0.3, 0.5, { mood: 0, hot: 0, heat: 0 }, "sine.inOut"); // the gas has won
  st(at("quench") + 0.5, 1.5, { gas: 0.4 }, "sine.inOut");
  st(at("disj5:capte") - 0.2, 0.8, { wave: 0 }, "sine.inOut");
  shot(at("zero") + 0.2, at("disj5:capte") - at("zero") + 0.2, QUENCH);
  shot(at("disj5:capte") + 0.4, at("disj5:Entre") - at("disj5:capte") - 0.4, DEAD);
  fact(tl, { id: "c2-amps", k: "Il peut couper", v: "63 000 ampères", tone: "signal", from: at("disj5:jusqu'à") + 0.4, to: at("disj5:Entre") + 1.2 });
  fact(tl, { id: "c2-ms", k: "Entre l'ordre et la coupure", v: "≈ 50", s: "millièmes de seconde", tone: "veille", from: at("disj5:cinquantaine") - 0.15, to: at("disj5:clignement") + 0.05 });
  // the slow pull-back from the dead chamber, onto the seam
  const H23 = at(HAND.c23.at) - HAND.c23.opt.before; // 169.55
  shot(at("disj5:Entre"), H23 - at("disj5:Entre"), HAND.c23.from[0]);
  seam(D, "c23", "out");
}
