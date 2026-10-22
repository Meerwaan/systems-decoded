// HORS-SÉRIE 02 — Poste haute tension (la promo verticale du L02, le deuxième format long) : the world.
//
// THERE IS NO NEW SET HERE. The world IS the L02's (episodes/L02-poste-haute-tension/src/world.js: the POSTE at night,
// the BENCH and its breaker chamber, the LIGNE in the country, the MAP — poste.js, model.js, ligne.js, habillage.js),
// built as it is: its world.js imports no 16:9 code (only its main.js does, through kit/lib/landscape.js — never
// imported here, nor its chapter files c*.js / chapters.js: their poses are READ there and re-framed here).
// The frame: 1080 × 1920, the kit's zones — subject 440–1160 (`shift` ≈ +160 lifts it to y ≈ 800) · the top slot
// 436–790 is #film's (fin) · nothing that matters under y 1600, nor right of x 905 between y 880 and 1760.
// The L02's poses (16:9, framed with `side`) become: `side` 0, `shift` for the height, and closer.
//
// LA RÈGLE (docs/HS02-brief.md): never the helicopter (`heli` draws it: only the basket is framed, its sling leaves
// the top of the frame), never the gas on the arc (`gas` stays 0), never the induced voltage (`couple`, `induced`
// stay 0), never the order of the clamps (`wrong`, `grab`, `shock` stay 0), never the incident's aftermath.
import { buildWorld as buildL02, FIRST as L02_FIRST, SET, SIZE, FAR, AT, WORKAT } from "../../L02-poste-haute-tension/src/world.js";
import { WORK, EARTH, BREAKER, PH, PYLON } from "../../L02-poste-haute-tension/src/plan.js";

export { SET, SIZE, FAR, AT, WORKAT, WORK, EARTH, BREAKER, PH, PYLON };

/** A portrait pose: nothing inherited across a cut. */
export const P = { fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 };
const W0 = WORKAT[0];

// THE FIRST FRAME (= the last: the film loops). The L02's own first frame (c1 · HOOK: the detector's head in macro,
// hooked on your cut conductor, the neighbour burning behind), re-framed in portrait. Chosen on a board of four.
export const POSE0 = { tx: W0[0], ty: W0[1] - 7, tz: W0[2], d: 170, az: 30, el: -14, fov: 38, shift: -80, side: 0, roll: 0, drift: 0.3 };

/** The instant of the L02 (s) each shot lives in, as the header shows it ("FILM · 05:53"); −1 = the whole film. */
export const L02_AT = {
  accroche: 0.26, promesse: 8.27, curiosite: 15.79, lancement: 48.98, champ: 62.65, arc: 132.96, gravier: 107.69,
  sanscouper: 224.17, coupe: 241.23, detecteur: 345.55, mort: 353.62, test: 420.84, orage: 430.25, ouvre: 37.52,
};
/** The film's length, said in the header and on #film. */
export const L02_LENGTH = 550; // 9 min 10

export const FIRST = {
  ...L02_FIRST,
  /* ── the hors-série's header (main.js reads them; integers: set them with `now`, never `st`) ── */
  l02: L02_AT.accroche, // #hud-clock "FILM · 00:00"; −1 → "FILM · 9 MIN 10"
  fils: 0, //             the open threads: +1 on curiosite, champ, arc, gravier, sanscouper, detecteur, test (→ 7)
  yt: 0, //               1 on `youtube`: « Réponses · Sur YouTube », veille
};

/** The portrait poses (re-framed from the L02's chapters; "seen" once looked at on a board). */
export const VIEW = {
  hook: POSE0,
  // the four candidates of the first frame
  hook1: POSE0, //                                                                                     the detector's head, macro
  hook2: { ...P, tx: 0, ty: 748, tz: 0, d: 260, az: -30, el: 5, fov: 32, shift: 140 }, //            BENCH: the arc in the chamber (the thumbnail)
  hook3: { ...P, tx: W0[0], ty: W0[1], tz: W0[2], d: 700, az: -50, el: -14, fov: 34, shift: 160 }, // POSTE: the clamps on the three phases
  hook4: { ...P, tx: 0, ty: 1300, tz: 1180, d: 1100, az: -40, el: -6, shift: 160 }, //                POSTE: you climbing the gantry leg, at night
  /* ── the poste ── */
  you: { ...P, tx: 320, ty: 105, tz: 980, d: 560, az: -16, el: 8, shift: -260 }, //                    you standing, the pole up (promesse)
  clampHead: { ...P, tx: 300, ty: 1046, tz: WORKAT[0][2], d: 200, az: 26, el: -12, fov: 38, shift: -80 }, // seen: the clamp on your conductor, where the detector was
  clamp: { ...P, tx: 295, ty: 35, tz: 1235, d: 200, az: -24, el: 14, shift: 140 }, //                 the earth end at your feet
  bay: { ...P, tx: 1400, ty: 600, tz: 0, d: 4200, az: -40, el: 14, shift: 120 }, //                   your bay, three quarters
  wide: { ...P, tx: 1500, ty: 300, tz: -1200, d: 11000, az: -35, el: 24, shift: 80 }, //              the whole poste
  field: { ...P, tx: 300, ty: 500, tz: 980, d: 900, az: -30, el: 0, shift: -60 }, //                  you under your line, the field
  rise: { ...P, tx: 250, ty: 1100, tz: 650, d: 1100, az: -70, el: -10, shift: 120 }, //                up to the conductors
  gravel: { ...P, tx: 300, ty: 0, tz: 1000, d: 420, az: -30, el: 30, shift: -150 }, // seen: your legs, the gravel cut open, the mesh line veille //                   your feet on the gravel
  pole: { ...P, tx: BREAKER.x, ty: 720, tz: PH[0], d: 640, az: -35, el: 8, shift: 140 }, //            your breaker pole
  youVat: { ...P, tx: 320, ty: 170, tz: 960, d: 560, az: 15, el: 8, shift: 160 }, //                   you, the pole up (vat2)
  head: { ...P, tx: 300, ty: 1046, tz: WORKAT[0][2], d: 260, az: 26, el: -12, fov: 38, shift: -80 }, //  the head on phase 1
  mute: { ...P, tx: 300, ty: 1046, tz: WORKAT[0][2], d: 170, az: 30, el: -14, fov: 38, shift: -80 }, //          the mute head, the neighbour behind
  climbLow: { ...P, tx: 0, ty: 1100, tz: 1130, d: 900, az: -40, el: -8, shift: -100 }, // you on the leg at climb 0.4 (seen)
  climbMid: { ...P, tx: 0, ty: 1450, tz: 1000, d: 950, az: -44, el: -6, shift: -100 },
  neigh: { ...P, tx: 300, ty: 1046, tz: 600, d: 620, az: 30, el: -14, fov: 38, shift: -80 }, //         the hook's lines, wider: your grey conductor, the neighbour's three signal lines
  /* ── the bench ── */
  chamber: { ...P, tx: 0, ty: 748, tz: 0, d: 300, az: -25, el: 6, shift: 140 },
  core: { ...P, tx: 0, ty: 745, tz: 0, d: 175, az: -20, el: 4, fov: 32, shift: 60 }, // at d 110 heat washes the frame (seen)
  /* ── the line ── */
  basket: { ...P, tx: 60010, ty: 3700, tz: 880, d: 520, az: -40, el: 10, shift: 60 }, //               the basket, the sling out of the top
  fault: { ...P, tx: 200000, ty: 3391, tz: -1000, d: 2300, az: 70, el: 4, shift: 120 }, //               the far fault on the neighbour
};

/** The world: the L02's, as it is. apply(S, time) reads the L02's numbers; l02, fils, yt are read by main.js only. */
export function buildWorld(stage) {
  return buildL02(stage);
}
