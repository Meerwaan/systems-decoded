// HORS-SÉRIE 03 — Évacuation d'un avion (la promo verticale du L03, le troisième format long) : the world.
//
// THERE IS NO NEW SET HERE. The world IS the L03's (episodes/L03-evacuation-avion/src/world.js: the PISTE — the A350
// of glass at Haneda, the trial hangar, the apron —, the CABINE at night, the BENCH and its slide pack — avion.js,
// cabine.js, model.js, habillage.js), built as it is: its world.js imports no 16:9 code (only its main.js does, through
// kit/lib/long.js — never imported here, nor its chapter files c*.js / chapters.js: their poses are READ there and
// re-framed here).
// The frame: 1080 × 1920, the kit's zones — subject 440–1160 · the top slot 436–790 is #film's (fin) · nothing that
// matters under y 1600, nor right of x 905 between y 880 and 1760.
// The L03's poses (16:9, framed with `side`) become: `side` 0, `shift` for the height, and closer.
//
// LA RÈGLE (docs/recette-promo.md): never the answer to the bag (`bags`, `bins` stay 0: Dubai, Denver are the long's),
// never the outcome of Tokyo (`evac` stays 0 at Haneda: nobody on the slides, nobody on the grass), never the chute.
import { buildWorld as buildL03, FIRST as L03_FIRST, SET, SIZE, FAR, AT, CLOSE, SHARP, LOOK, benchLight, benchFromCabin, PACK_IN_DOOR } from "../../L03-evacuation-avion/src/world.js";
import { PLANES, ITEM, PACK } from "../../L03-evacuation-avion/src/plan.js";

export { SET, SIZE, FAR, AT, CLOSE, SHARP, LOOK, benchLight, benchFromCabin, PACK_IN_DOOR, ITEM, PACK };

/** A portrait pose: nothing inherited across a cut. */
export const P = { fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3, ...SHARP };
const D1 = PLANES.a350.doors[0][1]; // door 1 (x)

/** The instant of the L03 (s) each shot lives in, as the header shows it ("FILM · 06:47"); −1 = the whole film. */
export const L03_AT = {
  accroche: 0.26, fumee: 1.6, haut: 3.5, flanc: 5.1, defi: 16.9, sac: 21.87, porte: 26.5, ouvre: 30.96, eclate: 33.29,
  bouteille: 62.57, jet: 71.35, aspire: 76.5, fuite: 88.41, essai: 122.1, quatre: 406.93, moteur: 410.2, comment: 514.21,
};
/** The film's length, said in the header and on #film. */
export const L03_LENGTH = 534; // 8 min 54

// THE FIRST FRAME (= the last: the film loops). Chosen on a board of four (scratchpad, 23/10).
export const POSE0 = { ...P, tx: -2600, ty: 330, tz: 400, d: 1500, az: -70, el: -4, fov: 36, shift: 60 }; // A3: the slide in front of the fire

export const FIRST = {
  ...L03_FIRST,
  doorA: 0.55, // the slide is unrolling on frame 1 (→ 0.86 in 1,5 s: acte1)
  fire: 0.85, //  it swells to 1 on « brûle »
  /* ── the hors-série's header (main.js reads them; integers: set them with `now`, never `st`) ── */
  l03: L03_AT.accroche, // #hud-clock "FILM · 00:00"; −1 → "FILM · 8 MIN 54"
  fils: 0, //             the open threads (D.threads(): fil1, fil2, fil3)
  yt: 0, //               1 on `youtube`: « Réponses · Sur YouTube », veille
};

/** The portrait poses (re-framed from the L03's chapters; "seen" once looked at on a board). */
export const VIEW = {
  hook: POSE0,
  /* the four candidates of the first frame */
  hookA: POSE0, //                                                                              Haneda, low by the nose: slide 1L unrolling, the fire behind
  hookB: { ...P, tx: -2650, ty: 260, tz: 850, d: 1500, az: -25, el: 2, fov: 32, shift: 80 }, //  Haneda: the slide bursting out of 1L (the first thumbnail)
  hookC: { ...P, tx: 500, ty: 150, tz: 115, d: 520, az: 86, el: -9, fov: 36 }, //             the cabin under the smoke, looking up (the second thumbnail)
  hookD: { ...P, ...CLOSE, tx: 742, ty: 52, tz: 92, d: 150, az: -95, el: -4, fov: 30, shift: 40 }, // your bag in your hand (the third thumbnail)
  /* ── the cabin ── */
  aisle: { ...P, tx: 400, ty: 60, tz: 123, d: 700, az: 85, el: 6, fov: 36 },
  ceil: { ...P, tx: 560, ty: 105, tz: 123, d: 760, az: 90, el: 0, fov: 36 }, //                     seen: the aisle, the exit signs, the smoke above
  smoke: { ...P, tx: 500, ty: 150, tz: 115, d: 520, az: 86, el: -9, fov: 36 },
  speaker: { ...P, ...CLOSE, tx: 839, ty: 243, tz: 118, d: 190, az: 70, el: -60, fov: 30 }, // seen: the grille from below
  section: { ...P, tx: 600, ty: 95, tz: 0, d: 850, az: -90, el: 0, fov: 36 }, //               seen: + { cut: 1 } the rows facing us
  doorOpen: { ...P, tx: -40, ty: 100, tz: 250, d: 480, az: 125, el: 8, fov: 32 }, //            seen: + { door: 0.35 } the pack in the door
  bag: { ...P, ...CLOSE, tx: 742, ty: 52, tz: 92, d: 150, az: -95, el: -4, fov: 30, shift: 40 },
  doorIn: { ...P, ...CLOSE, tx: 0, ty: 70, tz: 265, d: 300, az: 150, el: 9 },
  bustle: { ...P, ...CLOSE, tx: 0, ty: 45, tz: 255, d: 200, az: 150, el: 11, fov: 30 },
  /* ── the bench ── */
  exploded: { ...P, tx: 0, ty: 57, tz: 8, d: 450, az: -28, el: 18, shift: -100 }, // seen: the bottle under the header
  bottle: { ...P, ...CLOSE, tx: 122, ty: 8, tz: 30, d: 95, az: -30, el: 18 },
  rig: { ...P, tx: 60, ty: 40, tz: 0, d: 560, az: -32, el: 20 }, //                            seen: the tube, the aspirators, the bottle
  asp: { ...P, ...CLOSE, tx: -23, ty: 92, tz: 0, d: 78, az: 0, el: 6, shift: -200 },
  tube: { ...P, tx: -6, ty: 62, tz: 0, d: 220, az: -15, el: 9 },
  leak: { ...P, ...CLOSE, tx: -23, ty: 86, tz: 0, d: 80, az: 4, el: 8 },
  /* ── the piste ── */
  slide1L: { ...P, tx: D1, ty: 250, tz: 900, d: 1300, az: -12, el: 4, shift: 60 },
  slideProfile: { ...P, tx: -2500, ty: 230, tz: 850, d: 1300, az: 30, el: 3, shift: 60 },
  hangarSlide: { ...P, tx: -2650, ty: 230, tz: 850, d: 1700, az: -25, el: 2, fov: 32, shift: 60 },
  door4L: { ...P, tx: PLANES.a350.doors[3][1], ty: 300, tz: 700, d: 1600, az: 20, el: 4, fov: 32, shift: 40 }, // seen: + { doorB } its slide in front
  flank: { ...P, tx: 300, ty: 560, tz: 200, d: 2400, az: -10, el: 14, fov: 34 }, //               seen: the wing, the fire under it, the shut doors ringed signal (over the engine)
  engine: { ...P, tx: -1300, ty: 330, tz: -1040, d: 1100, az: -130, el: 2, fov: 32, shift: 40 }, // seen: the right intake, the fire behind
};

/** The world: the L03's, as it is. apply(S, time) reads the L03's numbers; l03, fils, yt are read by main.js only. */
export function buildWorld(stage) {
  return buildL03(stage);
}
