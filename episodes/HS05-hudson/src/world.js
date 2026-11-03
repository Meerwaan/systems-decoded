// HORS-SÉRIE 05 — Hudson (la promo verticale du L05, l'avion de l'Hudson, 15 janvier 2009) : the world.
//
// THERE IS NO NEW SET HERE. The world IS the L05's (episodes/L05-hudson/src/world.js: VOL — the A320 like an X-ray over
// New York at true scale, its left CFM56 that opens in place, the cockpit, the geese; CARTE — the maquette; BENCH — the
// check-list binder, the engine on its test stand and its bird gun), built as it is: its world.js imports no 16:9 code
// (only its main.js does, through kit/lib/landscape.js — never imported here, nor its chapter files c*.js: their poses
// are READ there and re-framed here).
// The frame: 1080 × 1920, the kit's zones — subject 440–1160 (`shift` ≈ +140 lifts it) · the top slot 436–790 is
// #duel's and #film's (fin) · nothing that matters under y 1600, nor right of x 905 between y 880 and 1760.
// The L05's poses (16:9, framed with `side`) become: `side` 0, `shift` for the height, and closer.
//
// LA RÈGLE (docs/recette-promo.md): the engine is opened and the goose paid (3,6 kg against the 1,8 kg of the tests);
// the touchdown is played whole. NEVER here: the simulator passes (`sims`, `simLate`), the APU (`apu`), the angle-of-
// attack limit (`limit`, `aoa`), the ditching button (`named` 9) — they are the L05's answers.
//
// THE HEADER: the time in New York (`clockOn`), and the countdown to the river « Il te reste 3:32 » (`countOn`) — the
// visible countdown of a dossier. The clock is THIS film's (PROMO_CLOCK, below): real time through act 1, held through
// the autopsy, then the two times the long says (« On va être dans l'Hudson » 15:29:28 · « Trente mètres » 15:30:36),
// and the river at 15:30:43. `track` −1 makes the plane follow it.
import { buildWorld as buildL05, FIRST as L05_FIRST, SET, SIZE, FAR, AT, VIEW as LV, CLOSE, SHARP, LOOK } from "../../L05-hudson/src/world.js";
import { A320, COUNT, hms } from "../../L05-hudson/src/plan.js";

export { SET, SIZE, FAR, AT, CLOSE, SHARP, LOOK, A320, COUNT, hms };

/** A portrait pose: nothing inherited across a cut. */
export const P = { fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3 };
const E = A320.engine;
const C = A320.cockpit;

/** The long's length, on #film and in the header at the end. */
export const L05_LENGTH = 680; // 11 min 20

/**
 * THE CLOCK of this film — [cue, "hh:mm:ss"], linear in between (two anchors close together make a jump, the same
 * time twice a hold). Act 1 runs at the true speed from the strike; the autopsy holds it; then the long's two times.
 */
export const PROMO_CLOCK = [
  [0, "15:27:11"], //              the strike
  ["ouvre-0.1", "15:27:29"], //     act 1 in real time (18 s)
  ["hudson-0.14", "15:27:29"], //   held through the autopsy and the check-list
  ["hudson-0.13", "15:29:28"], //   « On va être dans l'Hudson » (the L05's clock)
  ["test-0.14", "15:29:32"],
  ["test-0.13", "15:30:36"], //     « Trente mètres » (the L05: 15 h 30 min 36 s)
  ["test:fleuve+0.39", "15:30:43"], // the river (the L05: 15 h 30 min 43 s) — the impact lands in the breath after « fleuve »
  ["toloop-0.04", "15:30:43"],
  ["toloop", "15:27:11"],
];
export function makeClock(D) {
  const keys = PROMO_CLOCK.map(([cue, s]) => [typeof cue === "number" ? cue : D.at(cue), hms(s)]);
  return (time) => {
    if (time <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, va] = keys[i];
      const [b, vb] = keys[i + 1];
      if (time <= b) return b - a < 1e-3 ? vb : va + ((vb - va) * (time - a)) / (b - a);
    }
    return keys[keys.length - 1][1];
  };
}
export const CONTACT = COUNT.to; // 15:30:43, seconds after 15:00

/* ───────────────────────────── the first frame ───────────────────────────── */
// Chosen on a board of four (docs/recette-promo-image.md § 2, 03/11): VIEW.hook2 — under the left intake, looking up,
// the geese streaming into it (the L05's hook7, re-framed). The fan's face on half the width, the geese moving from
// frame 1, the city of X-ray blocks below. (hook1, the L05's first frame inside the nacelle, read as a burning machine
// cut by the edge; hook3 and hook4 had the engine smaller and the geese hard to see.)
export const POSE0 = { ...P, tx: -640, ty: -230, tz: 575, d: 1300, az: -72, el: -14, fov: 48, shift: 140, ...SHARP };

export const FIRST = {
  ...L05_FIRST, // lock 1, geese 1, flame 0.5, goose 1, burn 1: the strike, in the left nacelle
  track: -1,
  clockOn: 1,
  countOn: 1,
  yt: 0, //        1 on `youtube`: the header says where the answer is (« Réponse · Sur YouTube », veille). main.js reads it
};

/** The portrait poses (re-framed from the L05's chapters). */
export const VIEW = {
  // the four candidates of the first frame
  hook1: { ...LV.hook4, shift: 120 }, //                                                                                                  inside the glass nacelle: the core on fire, the goose in it (the L05's own first frame, miniature B « 2 OIES, 2 MOTEURS »)
  hook2: POSE0, //                                                                under the left intake, looking up: the geese streaming in
  hook3: { ...LV.hook2, side: 0, d: 1000, shift: 140 }, //                                                               ahead-left, low: the geese into the left engine, its flame behind
  hook4: { ...LV.thumb, d: 1900, shift: 140 }, //                                                                        the miniature's plane, from below-front-left
  /* ── act 1 ── */
  out: { ...LV.hook1, side: 0, d: 1100, shift: 140 }, //                                                                  under the left wing, behind the engine
  over: { ...P, tx: 0, ty: 0, tz: 0, d: 8200, az: 120, el: 55, fov: 40, shift: 200, ...SHARP }, //                         « 860 mètres » : the whole plane from above, the city under it
  qrh: { ...LV.qrh, d: 66, az: -15, el: 55, shift: 120 }, //                                                            the check-list binder
  back: { ...P, tx: 6000, ty: -800, tz: 1800, d: 8000, az: -108, el: 10, fov: 40, shift: 0, ...SHARP }, //             over the tail, back toward LaGuardia (signal) — track 1660
  engineL: { ...LV.engine, d: 640, az: -48, shift: 120 }, //                                                            the left engine, its fan
  engineR: { ...P, tx: E.x, ty: E.y + 20, tz: -E.z, d: 680, az: -132, el: 8, shift: 120, ...CLOSE }, //                  the right engine (the closed nacelle), mirrored from engineL
  cabin: { ...P, tx: 150, ty: 0, tz: 0, d: 2600, az: 90, el: 62, fov: 36, shift: 0, ...SHARP }, //                       the cabin from above, nose up the frame
  city: { ...P, tx: 150, ty: 0, tz: 0, d: 8500, az: 90, el: 70, fov: 40, shift: 0, ...SHARP }, //                        pulled back: New York under you
  /* ── act 2 ── */
  engine: { ...LV.engine, shift: 120 },
  exploded: { ...LV.exploded, d: 1150, az: -26, el: 12, shift: 100 },
  fan: { ...LV.fan, tx: E.x - 10, ty: E.y + 5, tz: E.z, d: 520, az: -40, el: 10, shift: 120, ...CLOSE },
  aft: { ...LV.fan, tx: E.x + 470, ty: E.y + 5, tz: E.z, d: 600, az: -32, el: 10, shift: 120, ...CLOSE },
  core: { ...LV.core, tx: E.x + 330, d: 340, shift: 120, ...CLOSE },
  coreB: { ...LV.core, tx: E.x + 350, d: 260, shift: 120, ...CLOSE },
  stand: { ...LV.stand, d: 900, shift: 140 },
  gun: { ...LV.gun, d: 650, az: -62, el: 10, shift: 140 },
  cmp: { ...LV.gun, tx: -470, ty: 100, tz: 185, d: 420, az: -38, el: 13, shift: 120 }, //                                  the two birds, the engine behind them
  glide: { ...LV.chase, d: 4400, az: 70, el: 10, shift: 140 }, //                                                        « jamais plus de 214 »
  descent: { ...P, tx: -4000, ty: -800, tz: 0, d: 7000, az: 88, el: 14, fov: 40, shift: -100, ...SHARP }, //           behind the plane, down the Hudson ahead (track ≈ 1765)
  /* ── act 3: the test ── */
  toWater: { ...LV.toWater, ty: -150, d: 4800, az: -116, el: -2, shift: 140 },
  stick: { ...LV.stick, d: 110, az: -30, shift: 120 },
  low: { ...LV.profile, ty: -60, d: 4400, az: -6, el: 1, shift: 160 },
  splash: { ...P, tx: -300, ty: 150, tz: 0, d: 6500, az: -60, el: 8, shift: 120, ...SHARP }, //                         the whole plane, three-quarter front, over its reflection
  /* ── fin ── */
  map: { ...LV.mapStrike, d: 1100, az: 0, el: 62, shift: -200 },
  thumb: { ...LV.thumb, d: 2100, shift: -150 },
};

/** The world: the L05's, as it is. apply(S, time) reads the L05's numbers; `yt` is read by main.js only. */
export function buildWorld(stage) {
  return buildL05(stage);
}
