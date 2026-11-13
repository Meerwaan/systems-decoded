// 02 → 03 · the machine at rest (repos, still « 02 Autopsie »), then RÉPONSE — the drop and the answer, in the section.
// From « Ses vérins poussent… » to « Le front tient. » (torepos → toverdict). In cuts: one shot per breath, each laid a
// few frames before its sentence, each one moving (a small turn and push: a cut is never a stop).
//
// What the picture says, and what it never says (docs/faits/048-contre-verification.md):
//   · the settlement is a few MILLIMETRES: the road does not move to the eye; what reads is the trough's glow, the gauge
//     magnified ×50 and the header — and the header says the voice's numbers on the voice's words: 2 on « deux »,
//     5 on « Cinq », 7 on « Sept », 8 on « Huit » (each one a short step, a counter, landing on the word);
//   · the face SLIDES by a few decimetres (`face` 0.9), the column above it LOOSENS as a glow (`loose` ≤ 0.9): never a
//     void, never a collapse; the chamber's earth sinks under its crown (`earth` 0.55), it does not empty;
//   · no pressure value anywhere: the needle and the header's word (Équilibre · En chute) only.
// The mood: calm (0) for the rest; it turns signal, frankly, on « lâche »; back to veille on « s'arrête ».
// Twice the same place on purpose: the chamber (it sinks · it fills), the manometer (it drops · it comes back), the
// gauge on the kerb (2 mm · 8 mm) — the answer replays the drop backwards, in the same frames.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, TBM } from "./world.js";

const AY = TBM.axisY;
const STROKE = TBM.rams.stroke; // the head, the chamber, the bulkhead and the screw move ahead (−x) by STROKE × rams
const R0 = 0.5; // the rams' stroke after « Ses vérins poussent »
const R1 = 0.7; // …and after « Les vérins poussent » (the head goes ≈ 36 cm further into the face)

/* ── the poses (plan.js coordinates; what moves ahead with the rams is shifted by its stroke) ── */
const P = { fov: 30, side: 0, roll: 0, drift: 0.3, dof: 0 };
// rear-left three quarters, on the cut side: the rams on the last ring, its seven segments
const REAR0 = { ...P, ...VIEW.rear };
const REAR1 = { ...REAR0, tx: 1060, d: 2150, az: 44, el: 15 };
// the machine in profile (az ≈ 0, or the wheel and the bulkhead hide the chamber): the wheel, the chamber, the screw
const FLOW = { ...P, tx: 250 - STROKE * R0, ty: AY - 60, tz: 0, d: 3000, az: 2, el: 8, shift: 60 };
const FLOWA = { ...FLOW, d: 3200, az: 5, el: 9 }; // the cut lands a little wider, then pushes in (retouche 13/11)
// the manometer on its bracket behind the bulkhead
const gauge = (r) => ({ ...P, ...VIEW.gauge, fov: 28, tx: TBM.bulkhead.gauge[0] - STROKE * r });
const GAUGE0 = gauge(R0);
const GAUGE1 = { ...GAUGE0, d: 330, az: -17, el: 10 };
const GAUGE2 = { ...gauge(R1), az: -30, el: 6, d: 360 };
const GAUGE3 = { ...GAUGE2, d: 320, az: -22, el: 9 };
// the chamber close, in profile: its earth level under the crown
const chamber = (r) => ({ ...P, tx: 160 - STROKE * r, ty: AY + 20, tz: 0, d: 2400, az: 0, el: 7, shift: 60 });
const CHAMBER0 = chamber(R0);
// …sliding left onto the face as it slides (the wheel's rim, the blocks under the crown, the column's foot)
const FRONT0 = { ...CHAMBER0, tx: -230, ty: AY + 260, d: 2400, az: -11, el: 6, shift: 60 };
const CHAMBER1 = { ...chamber(R1), az: 4, el: 9 };
const CHAMBER2 = { ...CHAMBER1, d: 2250, az: -2, el: 6 };
// the street at the gauge, low on the near sidewalk
const KERB0 = { ...P, ...VIEW.kerb };
const KERB1 = { ...KERB0, d: 390, az: -31 };
const KERB2 = { ...KERB0, az: -30, d: 440 };
const KERB3 = { ...KERB0, az: -40, d: 400 };
// the street from above the kerb: the gauge big in the frame, the car of glass behind it over the trough
// (retouche 13/11: from d 1500 el 34 the gauge was tiny under TikTok's buttons)
const CAR0 = { ...P, tx: -250, ty: 40, tz: 380, d: 820, az: -26, el: 18, fov: 30, shift: 90 };
const CAR1 = { ...CAR0, d: 760, az: -22 };
// the whole section, the street down to the machine: the column that loosens between them
const COLUMN0 = { ...P, tx: 0, ty: -1000, tz: 0, d: 7600, az: -12, el: 6, fov: 34, shift: 80 };
const COLUMN1 = { ...COLUMN0, d: 7200, az: -6 };
// the screw close, in its casing
const SCREW0 = { ...P, tx: 640 - STROKE * R0, ty: AY - 120, tz: -30, d: 1700, az: 9, el: 6, shift: 60 };
const SCREW1 = { ...SCREW0, d: 1580, az: 3 };
// the rams from behind the bulkhead, three quarters (not the rear of 41.68: closer, lower)
const RAMS0 = { ...P, tx: 760, ty: AY + 40, tz: 0, d: 2300, az: 28, el: 10, shift: 80 };
const RAMS1 = { ...RAMS0, d: 2150, az: 20 };
// the face in the section, the column above it
const HOLD0 = { ...P, tx: -200, ty: -1300, tz: 0, d: 4400, az: -10, el: 6, shift: 60 };
const HOLD1 = { ...HOLD0, d: 4150, az: -3 };

/* ── the light: what it stands around ── */
const L_MACHINE = { fx: 500, fy: AY, fz: 0, fs: 1500 };
const L_FACE = { fx: -100, fy: AY + 200, fz: 0, fs: 1400 };
const L_STREET = { fx: -250, fy: 0, fz: 300, fs: 900 };
const L_SECTION = { fx: -250, fy: -800, fz: 0, fs: 1900 };

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, punch, chip } = D;
  const t = D.times({
    torepos: "torepos", rams: "repos:vérins", sept: "repos:sept", vis: "repos:vis", la: "repos:Et", lache: "repos:lâche",
    tozero: "tozero", vide: "zero:vide", front: "zero:front", rue: "zero:Ta", deux: "zero:deux", cinq: "zero:Cinq",
    sept2: "zero:Sept", zeroEnd: "zero$",
    vis2: "reponse:vis", ralentit: "reponse:ralentit", verins2: "reponse:vérins", chambre2: "reponse:chambre",
    pression2: "reponse:pression", remonte: "reponse:remonte", huit: "reponse:Huit", arrete: "reponse:s'arrête",
    tient: "reponse:tient", toverdict: "toverdict",
  });

  /* ── the cuts: a few frames before each sentence, in the breath before it ── */
  const c = {
    flow: t.vis - 0.26, // the move toward the chamber starts on the breath (no cut: the camera travels)
    gauge: t.la - 0.06,
    kerb: t.rue - 0.14,
    car: t.cinq - 0.1,
    column: t.sept2 - 0.08,
    screw: t.zeroEnd + 0.05,
    rams: t.verins2 - 0.19,
    chamber: t.chambre2 - 0.14,
    gauge2: t.pression2 - 0.32,
    kerb2: t.huit - 0.07,
    hold: t.tient - 0.52,
  };
  const span = (a, b) => Math.max(0.05, b - a);

  /* ── the numbers that turn, across the whole act (one tween each, ease "none": no cut resets them) ── */
  // the wheel turns slowly (≈ 0.06 turn/s); the screw at ≈ 0.2 turn/s, then it BRAKES on « ralentit »
  now(t.torepos, { wheel: 2, screw: 3 });
  st(t.torepos, span(t.torepos, t.toverdict), { wheel: 2 + 0.06 * span(t.torepos, t.toverdict) }, "none");
  const fast = 0.2 * span(t.torepos, t.ralentit);
  st(t.torepos, span(t.torepos, t.ralentit), { screw: 3 + fast }, "none");
  st(t.ralentit, 1.3, { screw: 3 + fast + 0.13 }, "power2.out"); // leaves at 0.2 turn/s, stops braking at ≈ 0
  st(t.ralentit + 1.3, span(t.ralentit + 1.3, t.toverdict), { screw: 3 + fast + 0.13 + 0.025 * span(t.ralentit + 1.3, t.toverdict) }, "none");
  // the car of glass drives toward −x (its place jumps between the street's shots: they are cuts)

  /* ═════════ REPOS (still 02 Autopsie) — the machine at rest, calm ═════════ */
  // 41.68 · the cut: rear-left three quarters, the rams on the last ring
  cut(t.torepos, SET.SECTION, REAR0, { ...STAGED, ...L_MACHINE, mood: 0, carX: 600, litRams: 0 });
  shot(t.torepos, span(t.torepos, c.flow), REAR1, "sine.inOut");
  // « Ses vérins poussent sur le dernier anneau : »
  st(t.rams, span(t.rams, t.sept - 0.3), { rams: R0 }, "sine.inOut");
  st(t.rams, 0.3, { litRams: 1 }, "sine.out");
  st(t.sept - 0.2, 0.5, { litRams: 0 }, "sine.inOut");
  // « sept voussoirs de béton. » — one segment every ≈ 0.2 s, in the order they are laid
  st(t.sept - 0.12, 1.4, { ring: 7 }, "none");
  chip("chip-anneau", null, 96, 470, t.sept - 0.05, c.flow + 0.1);
  // « La vis sort la terre au rythme où elle entre. » — a cut in the breath to the chamber in profile, then a slow push
  // (retouche 13/11: the 42° travel along the machine was jerky at 46.2 and crossed a bright background behind the header)
  cut(c.flow, null, FLOWA, { litScrew: 0 });
  shot(c.flow, span(c.flow, c.gauge - 0.15), FLOW, "sine.inOut");
  st(t.vis, 0.4, { litScrew: 1 }, "sine.out");
  st(c.gauge - 0.45, 0.35, { litScrew: 0 }, "sine.in");
  chip("chip-debit", null, 96, 470, t.vis + 0.3, c.gauge - 0.2);

  // 47.30 · the manometer — « Et là… la pression lâche. »
  cut(c.gauge, null, GAUGE0, { litScrew: 0 });
  shot(c.gauge, span(c.gauge, t.tozero), GAUGE1, "sine.inOut");
  st(t.lache, 0.4, { press: 0.65 }, "power3.out"); // the needle drops out of its band: the header says « En chute »
  st(t.lache, 0.22, { mood: 1 }, "power2.out"); // frank: the threat
  punch(t.lache, 0.06, { hold: 0.12, down: 0.3 }); // let go before the cut on tozero

  /* ═════════ 03 RÉPONSE — the drop ═════════ */
  setAct(tl, 3, t.tozero);
  // 49.27 · the chamber in profile, close — « La chambre se vide. »
  cut(t.tozero, null, CHAMBER0, { ...L_FACE });
  st(t.tozero + 0.12, span(t.tozero + 0.12, t.vide + 0.3), { earth: 0.55 }, "sine.inOut"); // voids open under the crown
  punch(t.vide, 0.06);
  chip("chip-lache", null, 96, 470, t.tozero + 0.2, c.kerb - 0.15);
  // « Le front glisse. » — the camera slides left onto the face as its blocks slide toward the wheel
  // (retouche 13/11: the sine.in → sine.out pair hit its top speed at the junction, jerky at 50.7 — now two moves that
  // both ease in and out: the chamber breathes until « vide » has landed, then the camera glides to the face)
  shot(t.tozero, span(t.tozero, t.vide + 0.2), { ...CHAMBER0, d: 2300, az: -3, el: 8 }, "sine.inOut");
  shot(t.vide + 0.2, span(t.vide + 0.2, c.kerb), FRONT0, "sine.inOut");
  st(t.front - 0.05, span(t.front - 0.05, c.kerb), { face: 0.9 }, "sine.inOut");
  st(t.front - 0.05, span(t.front - 0.05, c.kerb), { loose: 0.5 }, "sine.inOut");
  st(c.kerb, span(c.kerb, t.sept2 + 0.1), { loose: 0.9 }, "sine.inOut"); // the column keeps loosening up to the street

  // 51.53 · the gauge on the kerb — « Ta rue descend : deux millimètres. »
  cut(c.kerb, null, KERB0, { ...L_STREET, carX: 350 });
  shot(c.kerb, span(c.kerb, c.car), KERB1, "sine.inOut");
  st(c.kerb, span(c.kerb, c.car), { carX: -450 }, "none");
  // the header counts the voice's millimetres ON its words: a slow creep under 0.5 (it still reads 0), a step on « deux »
  st(t.rue + 0.1, span(t.rue + 0.1, t.deux - 0.08), { settle: 0.45 }, "sine.in");
  st(t.deux - 0.06, 0.14, { settle: 2 }, "power2.out");
  st(t.deux + 0.08, span(t.deux + 0.08, t.cinq - 0.08), { settle: 2.4 }, "none");
  // 53.46 · the car over the trough that reddens — « Cinq. »
  cut(c.car, null, CAR0, { carX: -60 });
  shot(c.car, span(c.car, c.column), CAR1, "sine.out");
  st(c.car, span(c.car, c.column), { carX: -520 }, "none");
  st(t.cinq - 0.06, 0.16, { settle: 5 }, "power2.out");
  st(t.cinq + 0.1, span(t.cinq + 0.1, t.sept2 - 0.08), { settle: 5.4 }, "none");
  // 54.20 · the whole section: the column from the crown to the road — « Sept. »
  cut(c.column, null, COLUMN0, { ...L_SECTION, carX: -700 });
  shot(c.column, span(c.column, c.screw), COLUMN1, "sine.out");
  st(t.sept2 - 0.06, 0.16, { settle: 7 }, "power2.out");
  st(t.sept2 + 0.1, span(t.sept2 + 0.1, t.huit - 0.08), { settle: 7.45 }, "none"); // still sinking, the header holds 7

  /* ═════════ 03 RÉPONSE — the answer: the drop replayed backwards ═════════ */
  // 54.89 · the screw, close — « La vis ralentit. »
  cut(c.screw, null, SCREW0, { ...L_MACHINE, litScrew: 1 });
  shot(c.screw, span(c.screw, c.rams), SCREW1, "sine.inOut");
  punch(t.ralentit, 0.06, { hold: 0.15, down: 0.4 });
  // 56.05 · the rams — « Les vérins poussent. » — at once: the head goes ≈ 36 cm further and feeds the chamber
  cut(c.rams, null, RAMS0, { litScrew: 0, litRams: 1 });
  shot(c.rams, span(c.rams, c.chamber), RAMS1, "sine.inOut");
  st(t.verins2 + 0.05, 0.5, { rams: R1 }, "power2.out");
  // 57.25 · the chamber again, the same place — « La chambre se remplit. »
  cut(c.chamber, null, CHAMBER1, { ...L_FACE, litRams: 0, litChamber: 1 });
  shot(c.chamber, span(c.chamber, c.gauge2), CHAMBER2, "sine.inOut");
  st(t.chambre2 - 0.05, span(t.chambre2 - 0.05, c.gauge2), { earth: 1 }, "sine.inOut");
  st(t.chambre2, span(t.chambre2, t.remonte - 0.15), { press: 0.86 }, "sine.in"); // the needle starts back (still « En chute »)
  // 58.45 · the manometer again — « La pression remonte. » — the needle lands in its band on the word
  cut(c.gauge2, null, GAUGE2, { ...L_MACHINE, litChamber: 0 });
  shot(c.gauge2, span(c.gauge2, c.kerb2), GAUGE3, "sine.inOut");
  st(t.remonte - 0.12, 0.4, { press: 1 }, "power2.out");
  punch(t.remonte, 0.06, { hold: 0.12, down: 0.3 });
  // 59.70 · the gauge on the kerb again — « Huit millimètres… et ta rue s'arrête. »
  cut(c.kerb2, null, KERB2, { ...L_STREET, carX: 420 });
  shot(c.kerb2, span(c.kerb2, c.hold), KERB3, "sine.inOut");
  st(c.kerb2, span(c.kerb2, c.hold), { carX: -640 }, "none");
  st(t.huit - 0.06, 0.18, { settle: 8 }, "power2.out"); // the index stops short of the red band
  st(t.arrete, 0.35, { mood: 0 }, "sine.inOut"); // the system has won: veille
  // 61.69 · the section: the face holds, the column calms — « Le front tient. »
  cut(c.hold, null, HOLD0, { ...L_SECTION });
  shot(c.hold, span(c.hold, t.toverdict), HOLD1, "sine.inOut");
  st(t.tient - 0.2, span(t.tient - 0.2, t.toverdict - 0.1), { loose: 0.35 }, "sine.inOut");
  chip("chip-tient", null, 96, 470, t.tient - 0.1, t.toverdict - 0.25);
}
