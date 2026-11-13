// 01 · MENACE — from the first frame to "Alors…" (0 → tobench). ONE cut in the act (10.32, onto the section).
//
// THE HOOK, one move from the first frame. POSE0 looks steeply down through the glass street: the car of glass drives
// off, the trough glows under it, the loosened column climbs, the cutterhead turns far below in the soil that slides.
//   "Ta rue s'enfonce."            the header goes 1 → 2 mm on "s'enfonce" (punch); the camera already closes in
//   "Dessous, une machine…"        a dive BY RATIO down the column to the cutterhead; the face's blocks slide on "lâcher"
//   "Ce qui la tenait ? …"         the camera turns into the machine's profile, its near half cut away: as a memory,
//                                  the chamber full, lit, the green arrows of its push meet the face; the header reads
//                                  Équilibre (punch "pression")
//   "Et si cette terre pousse trop fort… ta rue fait quoi ?"   the green arrows grow (Trop forte), the face is pushed
//                                  back; the camera pulls back and up to the road: the header reads "Monte"; the
//                                  picture settles on "quoi ?"
// THE SCENE. A cut, back to the story (the pressure drops again): the street in section, a car crosses ("Au-dessus,
// une voiture roule"); the camera rises along the lit building ("six étages"); a dive to the face, which slides
// under the crown ("s'écroule", punch); up again with the column's light to the gauge on the kerb, magnified ×50
// ("environ un centimètre", #chip-cm: its index climbs 2 → 3 mm toward the red band, a car passes behind it); down
// fast along the machine to its profile ("derrière la roue", punch); "Alors…": a slow push, only the wheel turns.
// Act 2 cuts to the bench from END (docs/journal/048-acte1.md).
//
// The road never moves to the eye (true millimetres): the trough's glow, the gauge and the header carry it.
// No pressure figure anywhere: the header's second readout is a word.
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, TBM } from "./world.js";

const AY = TBM.axisY; // −1591: the tunnel's axis
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* ── the poses (plan.js coordinates) ── */
// down the column to the cutterhead: the face, the crown, the column's foot (« une machine vient de lâcher la terre »)
const DIVE = { ...P, tx: -80, ty: AY + 220, tz: 0, d: 2500, az: -40, el: 26, fov: 36, shift: 110 };
// the chamber in profile, cut open, the face to its left: the green arrows meet the face (« De la terre, sous pression »)
const CHAMBER = { ...P, tx: -40, ty: AY - 20, tz: 60, d: 3700, az: -8, el: 6, fov: 30, shift: 90 };
// the same, pushed in a little while the green arrows grow (« pousse trop fort »)
const CHAMBER_IN = { ...CHAMBER, d: 3350, az: -5 };
// up to the road, the gauge on the kerb from the front-left: its index above zero (« ta rue fait quoi ? »)
const UP = { ...P, tx: -250, ty: 45, tz: 395, d: 470, az: -54, el: 8, fov: 32, shift: 110 };
const UP_IN = { ...UP, d: 430, az: -50 };
// the street in section, the car crossing (« Au-dessus, une voiture roule »)…
const SEC_A = { ...P, tx: 150, ty: 260, tz: 0, d: 3700, az: -24, el: 5, fov: 34, shift: 140 };
// …and up along the lit front (« Un immeuble, six étages »)
const SEC_B = { ...P, tx: -450, ty: 1150, tz: -650, d: 5600, az: -16, el: 10, fov: 34, shift: 60 };
// the face and the cutterhead from the front-left (« Devant la roue, la terre s'écroule »)
const FACE = { ...P, tx: -120, ty: AY + 250, tz: 0, d: 2700, az: -34, el: 12, fov: 30, shift: 110 };
const FACE_IN = { ...FACE, d: 2450, az: -30 }; // the slow push after the cut
// the gauge on the kerb (« Ta rue ne supporte qu'environ un centimètre »), and the same a little closer
const KERB = { ...VIEW.kerb, shift: 40 }; // lower than VIEW's: the staff's top clears #chip-cm
const KERB_IN = { ...KERB, d: KERB.d * 0.88 };
// the whole machine from above, cut open, before its profile (the cut on « Tout »)
const DOWN = { tx: 100, ty: AY + 200, tz: 0, d: 3600, az: -20, el: 22, fov: 34, shift: 90 };
// the machine in profile (az within ±4: the wheel and the bulkhead whole, the chamber between them)
const PROFILE = { ...P, tx: 250, ty: AY - 40, tz: 0, d: 3300, az: -2, el: 5, fov: 30, shift: 100 };
// « Alors… »: the slow push; act 2's benchCut leaves from here
export const END = { ...PROFILE, d: 3150 };

/* ── the light: what it stands around, and how wide ── */
const L_HOOK = { fx: -250, fy: -800, fz: 0, fs: 1800 };
const L_MACHINE = { fx: 150, fy: AY, fz: 0, fs: 1500 };
const L_STREET = { fx: -300, fy: 700, fz: -300, fs: 3200 };
const L_FACE = { fx: -100, fy: AY, fz: 0, fs: 1500 };
const L_KERB = { fx: -250, fy: 20, fz: 395, fs: 800 };

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const t = D.times({
    enfonce: "accroche:enfonce", dessous: "accroche:Dessous", lacher: "accroche:lâcher", hookEnd: "accroche$",
    tenait: "promesse:Ce", pression: "promesse:pression", et: "promesse:Et", fort: "promesse:fort", ta: "promesse:ta",
    quoi: "promesse:quoi",
    voiture: "scene:Au", immeuble: "scene:immeuble", devant: "scene:Devant", ecroule: "scene:écroule",
    ta2: "scene:Ta", centimetre: "scene:centimètre", tout: "scene:Tout", roue: "scene:roue#2", alors: "ouvre:Alors",
    tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── what turns all act long (cumulative: act 2 takes them on from here) ── */
  st(0, t.tobench, { wheel: 1.2, screw: 2 }, "none");

  /* ── the hook: one move ── */
  // the car drives off, the column climbs, the soil slides toward the wheel — from frame 1
  // (retouche) eased OUT: the car, the column and the soil are already at speed on frame 1, not starting from rest
  st(0, 3.7, { carX: -1700 }, "power1.out");
  st(0, 3.6, { loose: 0.75 }, "power2.out");
  st(0, t.lacher - 0.05, { face: 0.6 }, "power2.out");
  st(t.enfonce, 0.45, { settle: 2 }, "power2.out");
  punch(t.enfonce, 0.06);
  shot(0, t.dessous - 0.1, { ...POSE0, d: POSE0.d * 0.93 }, "sine.in", POSE0.d);
  // « Dessous, une machine vient de lâcher la terre » — the dive down the column, by ratio
  shot(t.dessous - 0.1, t.hookEnd - t.dessous + 0.2, DIVE, "sine.out", POSE0.d * 0.93);
  st(t.lacher, 0.7, { face: 0.92 }, "power2.out");
  st(0, t.dessous, L_HOOK, "none");
  st(t.dessous, 2.2, L_FACE, "sine.inOut");

  // « Ce qui la tenait ? De la terre, sous pression. » — into the machine's profile: the memory of the balance
  shot(t.tenait - 0.35, t.pression - t.tenait + 0.2, CHAMBER, "sine.inOut");
  st(t.tenait - 0.2, 0.7, { earth: 1, press: 1, face: 0, loose: 0 }, "sine.inOut");
  st(t.tenait + 0.1, 0.6, { litChamber: 1 }, "sine.out");
  st(t.tenait + 0.5, t.pression - t.tenait - 0.55, { hold: 1 }, "sine.out");
  st(t.tenait - 0.35, 1.8, L_MACHINE, "sine.inOut");
  punch(t.pression, 0.06);

  // « Et si cette terre pousse trop fort… » — too strong: the green arrows grow, the face is pushed back
  shot(t.pression + 0.4, t.ta - t.pression - 0.5, CHAMBER_IN, "sine.inOut");
  st(t.et + 0.1, t.fort - t.et + 0.1, { hold: 1.4, press: 1.4, face: -0.4 }, "sine.inOut");
  punch(t.fort, 0.06, { hold: 0.1, down: 0.25 });
  // « … ta rue fait quoi ? » — a cut up to the gauge on the kerb: its index goes above zero, the header reads « Monte »
  cut(t.ta - 0.1, null, UP, L_KERB);
  shot(t.ta - 0.1, t.voiture - t.ta, UP_IN, "sine.out");
  st(t.ta - 0.1, 0.55, { settle: -0.6 }, "power2.out");

  /* ── the scene: a cut back to the story (the pressure drops) ── */
  const c1 = t.voiture - 0.08;
  cut(c1, null, SEC_A, {
    press: 0.6, earth: 0.7, hold: 0, litChamber: 0, face: 0.5, loose: 0.75, settle: 2, carX: 500, ...L_STREET,
  });
  shot(c1, t.immeuble - c1 - 0.15, { ...SEC_A, tx: -150, d: 3500, az: -20 }, "sine.inOut");
  st(c1, 2.4, { carX: -1300 }, "none");
  // « Un immeuble, six étages. » — up along the lit front
  // (chef) a cut onto the facade, then a slow push: the fast climb strobed the facade lines (qa 29 at 13.3)
  cut(t.immeuble - 0.15, null, { ...SEC_B, d: 6000 }, {});
  shot(t.immeuble - 0.15, t.devant - t.immeuble + 0.05, SEC_B, "sine.out");
  // « Devant la roue, la terre s'écroule. » — (retouche) a clean cut to the face from the front-left, then a slow
  // push: the dive through the street read as a blur at 270 px
  const c2 = t.devant - 0.1;
  cut(c2, null, FACE, L_FACE);
  shot(c2, t.ta2 - 0.1 - c2, FACE_IN, "sine.inOut");
  st(t.devant + 0.4, t.ecroule - t.devant + 0.2, { face: 0.92, loose: 0.85 }, "sine.in");
  punch(t.ecroule + 0.05, 0.06);
  // « Ta rue ne supporte qu'environ un centimètre. » — (retouche) a cut to the gauge, then a slow push: the way up
  // by OVER went through a blur
  const up = t.ta2 - 0.1;
  cut(up, null, KERB, { ...L_KERB, carX: 700 });
  shot(up, t.tout - 0.1 - up, KERB_IN, "sine.inOut");
  st(up, 1.1, { loose: 0.95 }, "sine.out");
  st(up, t.tout - up, { carX: -900 }, "none");
  st(t.centimetre - 0.3, 1.3, { settle: 3 }, "sine.inOut");
  chip("chip-cm", null, 96, 470, t.centimetre - 0.2, t.tout - 0.25);
  // « Tout se joue… derrière la roue. » — down fast along the machine, to its profile
  // (retouche) a cut to the machine from above, then it settles into its profile: the way down was a blur
  cut(t.tout - 0.1, null, DOWN, L_MACHINE);
  shot(t.tout - 0.1, t.roue - t.tout, PROFILE, "sine.inOut");
  st(t.tout, 1.4, { carX: -1100 }, "none");
  punch(t.roue, 0.05);
  // « Alors… » — almost still: a slow push, only the wheel turns
  shot(t.roue - 0.1, t.tobench - t.roue + 0.1, END, "sine.inOut", PROFILE.d);
}
