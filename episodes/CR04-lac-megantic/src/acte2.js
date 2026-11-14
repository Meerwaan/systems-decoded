// CR04 — acte2.js · t1 → t2 (tot1 → tot3): 22:49 parked at Nantes, one locomotive left running, seven hand brakes; 23:03 the test,
// held on the locomotives' air: « réussi ». docs/CR04-actes.md « acte2.js ».
//   A  tot1 → megantic   cut (the slope, the head → the same slope, higher): the train rolls in and stops, its couplers bunch; ONE
//                        move up along the 72 tank cars (« soixante-douze » the camera runs over the row).
//   B  megantic → tu#2   cut (the cars → the slope they stand on): down the slope to the town's lights, which brighten.
//   C  tu#2 → tot2       cut (the town far below → the head in front): five locomotives, one smokes; ONE push along the left
//                        flank to the seven hand brakes, which light green one by one ON « sept », all at the head.
//   D  tot2 → mais       cut (the green of the hand brakes → the green of the stand): the control stand; « desserre » the automatic's
//                        handle goes, the camera pulls out of the cab along the train: the cars' green goes out from the head to
//                        the tail, the seven stay alone (« seuls »).
//   E  mais → rien       cut back to the stand: the independent stays applied (« serrés »), its gauge on 60; the camera cranes down
//                        the flank to the lead's brake cylinder, green, its shoe on the wheel (« des locomotives »).
//   F  rien → tot3       cut: the train, wide and low, does not move. « Essai réussi. »
// Hands over at tot3 (acte2b cuts): run park, engine 1, psi 60, brakes 7, auto 0.
import { FIRST, VIEW, STAGED, SET, lit, onLoco, onTrack, lookFrom, AT } from "./world.js";
import { RUN, PSI, PARTS } from "./plan.js";

const L = (local) => onLoco(0, AT.park, local); // a point of the lead locomotive, parked
/** What every cut of this act says (nothing inherited from the act before). */
const CLEAN = {
  culprit: 0, fault: 0, ok: 1, depuis: 0, run: RUN.park, slack: 0, brakes: 0, auto: 1, psi: PSI.full, leak: 0, derail: 0,
  engine: 1, smoke: 0.5, fire: 0, cutaway: 0, cab: 0, crew: 0, cutoff: 0, solo: 0,
  mano: 0, col: 0, mark: 0, speedo: 0, kmh: 0, pull: 0, hold: 0, road: 0, town: 1, glow: 0, cross: 0,
};
/** The seven hand brakes: ahead-left of the head, long lens low along its left flank — each volant a green ring, receding to
 *  the VB's at the top (s1 on .cache/planches/CR04/acte2/b4.jpg). */
const SEVEN = lookFrom(L([-60, 40, 45]), L([300, 14, 7]), { fov: 18, shift: 0 });
const SEVEN_LIT = lit(L([200, 14, 0]), 300);
/** Lac-Mégantic: the middle of its lights (the track curves toward the camera's side there). */
const TOWN = [-23300, -820, 800];

export default function acte2({ D }) {
  const { st, cut, path, punch, chip } = D;
  const t = D.times({
    tot1: "tot1", tu: "t1:Tu", soixantedouze: "soixantedouze", megantic: "megantic", bas: "bas", tu2: "t1:Tu#2",
    et: "t1:et", sept: "sept", main: "t1:main", tot2: "tot2", desserre: "desserre", et2: "t2:et", seuls: "seuls",
    mais: "t2:Mais", serres: "serres2", locos: "t2:locomotives", rien: "rien", reussi: "reussi", tot3: "tot3",
  });

  /* ───────────── A · 22:49 — it rolls in, stops; along the 72 tank cars ───────────── */
  const ARR = VIEW.arrivee;
  cut(t.tot1, SET.PENTE, ARR, { ...FIRST, ...CLEAN, ...lit(L([200, 0, 0]), 500), run: RUN.arrive, slack: 1 });
  st(t.tot1, 1.45, { run: RUN.park }, "power2.out"); // it stops at ≈ 31.4
  st(t.tot1 + 0.45, 1.7, { slack: 0 }, "sine.out"); // the couplers bunch behind it
  path([
    [t.tot1, ARR],
    [t.tu, { az: ARR.az + 3, el: ARR.el + 0.5, d: ARR.d * 0.96 }],
    [t.soixantedouze - 0.16, { az: ARR.az + 8, el: ARR.el + 1.5, d: ARR.d * 0.9 }],
  ]);
  // « soixante-douze wagons de pétrole »: cut (the train → its cars, closer): the tank cars big, their cylinders green; ONE slow
  // move along the row toward the tail (a fast one smears them: .cache/planches/CR04/acte2/b3.jpg, 34.6 s)
  const CARS = lookFrom(L([600, 220, 380]), L([1000, 0, 0]), { fov: 30 });
  cut(t.soixantedouze - 0.14, null, CARS, { ...lit(L([1050, 0, 0]), 700), run: RUN.park, slack: 0 });
  path([
    [t.soixantedouze - 0.14, CARS],
    [t.megantic - 0.16, lookFrom(L([820, 235, 360]), L([1250, 0, 0]), { fov: 30 })],
  ]);
  st(t.soixantedouze, t.megantic - t.soixantedouze, lit(L([1250, 0, 0]), 700), "sine.inOut");

  /* ───────────── B · « Lac-Mégantic est à douze kilomètres, en bas de la pente » — down the slope ───────────── */
  const VAL0 = lookFrom(onTrack(10000, [0, 1700, 1800]), TOWN, { fov: 30 });
  cut(t.megantic - 0.14, null, VAL0, { ...STAGED.ville, town: 0.35 });
  st(t.megantic, 0.6, { town: 1 }, "power2.out"); // ON « Lac-Mégantic » its lights brighten
  path([
    [t.megantic - 0.14, VAL0],
    [t.bas, lookFrom(onTrack(12500, [0, 1500, 1600]), TOWN, { fov: 30 })],
    [t.tu2 - 0.16, lookFrom(onTrack(13600, [0, 1380, 1480]), TOWN, { fov: 30 })],
  ]);

  /* ───────────── C · one locomotive left running, seven hand brakes ───────────── */
  const HEAD = lookFrom(L([-210, 60, 150]), L([70, 14, 0]), { fov: 30, shift: 20 });
  cut(t.tu2 - 0.14, null, HEAD, { ...STAGED.tete, ...lit(L([0, 12, 0]), 200), smoke: 0.6 });
  // ONE slow push (2.4 s; a 0.7 s leg smeared the locomotives: b5.jpg, 40.5 s) from the lead to the seven, there before « sept »
  path([
    [t.tu2 - 0.14, HEAD],
    [t.sept - 0.16, SEVEN],
    [t.tot2 - 0.02, { az: SEVEN.az + 3, el: SEVEN.el + 0.6, d: SEVEN.d * 0.96 }],
  ]);
  st(t.et - 0.6, t.sept - t.et + 0.4, SEVEN_LIT, "sine.inOut");
  st(t.sept, 0.64, { brakes: 7 }, "none"); // ON « sept »: one by one from the head, ≈ 0.09 s each
  punch(t.main, 0.06);

  /* ───────────── D · 23:03 — the test: the automatic released, the hand brakes must hold alone ───────────── */
  // retouche: tighter and higher on the two handles (the brown stand read dark on brown at 270 px), the halo on the handles alone
  const STAND = lookFrom(L([-33.2, 18.6, 4]), L([-37.8, 12.9, -4.6]), { fov: 30, shift: 20, dof: VIEW.pupitre.dof });
  const HANDLES = lit(L([-38.2, 12.7, -4.6]), 8);
  cut(t.tot2, null, STAND, { ...STAGED.tete, ...HANDLES, brakes: 7, psi: PSI.held, cab: 1 });
  path([
    [t.tot2, STAND],
    [t.desserre, { az: STAND.az - 6, el: STAND.el + 2, d: STAND.d * 0.95 }],
    [t.et2 - 0.16, { az: STAND.az - 11, el: STAND.el + 3, d: STAND.d * 0.9 }],
  ]);
  st(t.desserre, 0.9, { auto: 0 }, "power2.inOut"); // ON « desserre » the automatic's handle goes (the cars' cylinders go out)
  // « et les freins à main doivent tenir seuls »: cut (the stand's handle → the seven green rings, alone in the dark train)
  const ALONE = { ...SEVEN, az: SEVEN.az + 9, el: SEVEN.el + 4, d: SEVEN.d * 1.1 };
  cut(t.et2 - 0.14, null, ALONE, { ...SEVEN_LIT, cab: 0 });
  path([
    [t.et2 - 0.14, ALONE],
    [t.seuls, { az: SEVEN.az + 4, el: SEVEN.el + 2, d: SEVEN.d * 1.0 }],
    [t.mais - 0.16, { az: SEVEN.az + 1, el: SEVEN.el + 1.5, d: SEVEN.d * 0.96 }],
  ]);
  st(t.seuls, 0.5, lit(L([200, 14, 0]), 220), "sine.inOut"); // « seuls »: the light closes on them

  /* ───────────── E · « tu laisses serrés les freins à air des locomotives » ───────────── */
  const STAND2 = { ...STAND, az: STAND.az + 10, el: STAND.el - 2, d: STAND.d * 1.05 };
  const CYL = VIEW.cylindre;
  cut(t.mais - 0.14, null, STAND2, { ...HANDLES, cab: 1 });
  path([
    [t.mais - 0.14, STAND2],
    [t.serres, { az: STAND.az + 6, el: STAND.el - 1, d: STAND.d * 1.0 }],
    [t.locos - 0.16, { az: STAND.az + 4, el: STAND.el - 1, d: STAND.d * 0.97 }],
  ]);
  // retouche: a CUT to the cylinder on « locomotives » (the crane from the stand down to it in 0.8 s was the film's harshest move)
  const CYL0 = { ...CYL, az: CYL.az - 6, d: CYL.d * 1.5 };
  cut(t.locos - 0.14, null, CYL0, { ...lit(L(PARTS.cylinder), 18), cab: 1 });
  path([
    [t.locos - 0.14, CYL0],
    [t.rien - 0.16, { az: CYL.az + 2, d: CYL.d * 1.4 }],
  ]);
  st(t.serres, 0.3, { mano: 1 }, "power2.out"); // its gauge stays on 60
  st(t.rien - 0.45, 0.25, { mano: 0 }, "power2.in");

  /* ───────────── F · « Rien ne bouge. Essai réussi. » ───────────── */
  const IMM = VIEW.immobile;
  cut(t.rien - 0.14, null, IMM, { ...lit(L([200, 9, 0]), 420), cab: 0 });
  path([
    [t.rien - 0.14, IMM],
    [t.tot3 - 0.02, { az: IMM.az + 6, el: IMM.el + 1, d: IMM.d * 0.93 }],
  ]);
  chip("chip-essai", null, 96, 470, t.reussi, t.tot3 - 0.2);
  punch(t.reussi, 0.06);
}
