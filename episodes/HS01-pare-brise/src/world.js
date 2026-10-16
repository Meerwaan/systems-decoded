// HORS-SÉRIE 01 — Ton pare-brise (la promo verticale du L01) : the world. The CONTRACT between the four acts.
//
// THERE IS NO NEW SET HERE. The world IS the L01's (episodes/L01-pare-brise/src/world.js: the factory LINE, the CAR,
// the ROAD, the BENCH, the LAB of 1903 — car.js, verre.js, casse.js, dossier.js, kit/lib/usine.js, postes.js), built
// as it is: its world.js imports no 16:9 code (only its main.js does, through kit/lib/landscape.js — never imported
// here, nor its chapter files c*.js / chapters.js). What changes is the frame: 1080 × 1920, the kit's zones —
//   subject 440–1160 (its centre ≈ y 800: `shift` ≈ +160 lifts it there) · the top slot 436–790 is #film's (fin) ·
//   nothing that matters under y 1600, nor right of x 905 between y 880 and 1760.
// So the L01's poses (its VIEW, framed for 16:9 with `side`) are re-framed here: `side` 0, `shift` for the height,
// and closer — a portrait frame is a third as wide: a wide shot of the long becomes a tight one.
//
//   · SET, AT, onLine, run     re-exported from the L01: the places, their complete states, the line's clock
//   · FIRST                    the L01's closed list of numbers + three of the hors-série's header (l01, fils, yt)
//   · POSE0                    the first frame (chosen on a board of four, see docs/HS01-actes.md)
//   · VIEW                     the portrait poses each act starts from / hands over (seen with `look` unless "posed")
//   · buildWorld               the L01's, untouched: world.apply(S, time) reads only the L01's numbers
import { buildWorld as buildL01, FIRST as L01_FIRST, SET, SIZE, FAR, AT, onLine, run, FLOW, DRIVE } from "../../L01-pare-brise/src/world.js";
import { ST, LAB, SIDE } from "../../L01-pare-brise/src/plan.js";

export { SET, SIZE, FAR, AT, onLine, run, FLOW, DRIVE, ST, LAB, SIDE };

/** A portrait pose: nothing inherited across a cut (D.cut completes roll, side, fov, drift — we say them anyway). */
const P = { fov: 30, shift: 160, side: 0, roll: 0, drift: 0.3 };

// THE FIRST FRAME (= the last: the film loops). Chosen 16/10 on a board of four candidates (docs/HS01-actes.md):
// candidate "1a": your glass head in the windshield, seen from OUTSIDE, three quarters front, close — the glowing head
// in the middle of the web, the wheel and your arms under it, the stamp at the bottom left. Head centre ≈ y 870.
export const POSE0 = { tx: -37, ty: 126, tz: -29, d: 175, az: -150, el: 12, fov: 34, shift: 30, side: 0, roll: 0, drift: 0.3 };

/** The instant of the L01 (s) each shot lives in, as the header shows it ("FILM · 01:31"); −1 = the whole film ("8 MIN 51"). */
export const L01_AT = {
  accroche: 0.26, promesse: 29.4, curiosite: 376.9, lancement: 27.3, four: 48.4, fusion: 61.0, flotte: 90.7, ruban: 105.1,
  bande: 166.9, tampon: 180.9, flacon: 229.2, etoile: 239.2, grains: 376.9, nickel: 391.2, tete: 441.1, ouvre: 27.3, couches: 29.4,
};
/** The film's length, said in the header and on #film. */
export const L01_LENGTH = 531; // 8 min 51

export const FIRST = {
  ...L01_FIRST,
  // the L01's first frame, as it is (car, crash 0.6, lunge 1, web 0.35, rings 0.2): acte1 makes it MOVE from frame 1
  /* ── the hors-série's header (main.js reads them; integers: set them with `now`, never `st`) ── */
  l01: L01_AT.accroche, // the instant of the L01 the shot on screen lives in (s) — #hud-clock "FILM · 00:00"; −1 → "FILM · 8 MIN 51"
  fils: 0, //             the open threads: +1 on curiosite, flotte, bande, flacon, tampon, nickel, tete (→ 7) — #hud-count, signal
  yt: 0, //               1 on `youtube`: the counter reads « Réponses · Sur YouTube », veille
};

/**
 * The portrait poses. "seen" = looked at on a board (with the state given); "posed" = taken from the L01's VIEW and
 * re-framed, NOT looked at yet: the act that uses it looks first (`npm run look -- HS01 --file … --out <temp>`).
 */
export const VIEW = {
  hook: POSE0,
  /* ── the car (AT.car + what is said) ── */
  // the four candidates of the first frame (the board): the state is FIRST's
  hook1: POSE0, //                                                                                    seen: outside, three quarters front, your head in the web
  hook2: { ...P, tx: -37, ty: 124, tz: -26, d: 190, az: -100, el: 6, fov: 34, shift: 80 }, //       seen: profile, the head into the raked glass, the body lunging (the best "B" shot)
  hook3: { ...P, tx: -30, ty: 126, tz: -39, d: 70, az: -8, el: -2, fov: 52, shift: 120 }, //         seen: from behind your head, the web in front (the head hides it: weak)
  hook4: { ...P, tx: -37, ty: 124, tz: -40, d: 110, az: -168, el: 28, fov: 40, shift: 160 }, //      seen: outside, from above (the head too high: under the header)
  // the film between the two glasses, edge-on: "moins d'un millimètre" (promesse). NOT FOUND: aimed at the impact the
  // camera ends INSIDE your head (seen: a grey ball). Aim at the windshield's edge AWAY from the head (passenger side,
  // x ≈ +40, outside the car) — or take promesse on the bench's edge (WS.drawn makes the layers readable). To find.
  edge: { ...P, tx: 40, ty: 120, tz: -57, d: 45, az: -95, el: 6, fov: 34 },
  // the side window, in the driver's door, from outside: "ta vitre de côté" (curiosite) — L01 sideOut, posed
  // seen ({ sideOn: 1, crash 0, lunge 0 }): you seated, seen through the door — the pane itself does not stand out:
  // light it (litGlass is the windshield's) or close in to d ≈ 150
  side: { ...P, tx: SIDE.at[0], ty: SIDE.at[1], tz: SIDE.at[2], d: 230, az: -78, el: 8, fov: 30, shift: 120 },
  // the side window from inside: seen ({ sideOn: 1, nickel: 1, grains: 0.5 }) — the pane gone to bright grains, full
  // width. (L01's "nickel" pose, d 70, puts the camera INSIDE the door in portrait: never use it.)
  sideIn: { ...P, tx: SIDE.at[0], ty: SIDE.at[1], tz: SIDE.at[2], d: 130, az: 75, el: 4, fov: 40, shift: 120 },
  /* ── the line (AT.line + `pos`, and `cut`/`print`/`bend`/`film` once the windshield exists) ── */
  lineWide: onLine(5500, { ...P, d: 9000, az: -22, el: 30, fov: 30 }), //                             posed: the whole line, from above (lancement)
  furnace: onLine(450, { ...P, ty: 150, d: 900, az: -24, el: 20 }), //                                posed (L01 seen at d 1800 in 16:9)
  throat: onLine(1030, { ...P, ty: 100, d: 380, az: -40, el: 16, shift: 120 }), //                    seen: the lip, the orange tongue spreading — a strong signal shot (four)
  ribbon: onLine(1500, { ...P, ty: 92, tz: 130, d: 380, az: 12, el: 10, shift: 120 }), //             seen: raking, the ribbon fills the frame, an edge roll top (flotte) — the tin's mirror does not show: go lower / wider
  bath: onLine(1700, { ...P, ty: 90, d: 700, az: -18, el: 32, shift: 120 }), //                        seen: an orange field, no edge (too close: d ≥ 1100)
  print: onLine(ST.print.at, { ...P, ty: 100, d: 200, az: -40, el: 22, shift: 120 }), //              seen ({ pos: 5700, cut: 1, print: 0.5, squeegee: 0.5 }): grey machine glass, the band does NOT read — to find (from above, el ≥ 50, or the bench)
  stamp: { ...P, tx: 58, ty: 30, tz: 16, d: 75, az: -10, el: 14, fov: 30, shift: 120 }, //             seen (BENCH): E2 · II · 43R · 00 4127 READABLE — too much for tampon: rake it (az ≈ −70, el ≈ 5) or keep it moving
  frame: onLine(ST.test.frame, { ...P, ty: 110, d: 360, az: -26, el: 32 }), //                         posed: the test frame (tete)
  frameLow: onLine(ST.test.frame, { ...P, ty: 105, d: 220, az: -20, el: 6, fov: 32, shift: 120 }), //  seen ({ drop: 0.8 }): the head is UNDER the header, the glass a grey slab — aim higher (ty ≈ 160), d ≈ 320, shift ≈ −100
  /* ── the lab, 1903 (AT.lab) ── */
  shelf: { ...P, tx: LAB.shelf[0], ty: LAB.shelf[1] - 10, tz: LAB.shelf[2], d: 260, az: -18, el: -12, shift: 120 }, // seen ({ labelOn: 1 }): his hand on the flask, « Novembre 1903 » — strong
  fall: { ...P, tx: -120, ty: 150, tz: -170, d: 420, az: -22, el: 2, fov: 34, shift: 120 }, //           seen ({ flask: 0.5 }): shelves only, the flask NOT in frame — follow it (ride) instead
  /* ── the bench (AT.bench) ── */
  bench: { ...P, tx: 0, ty: 60, tz: 0, d: 380, az: -28, el: 14, fov: 30, shift: 120 }, //              seen: the windshield whole, the film veille through it (ouvre)
  exploded: { ...P, tx: 0, ty: 62, tz: -10, d: 620, az: -38, el: 12, fov: 30, shift: 120 }, //          seen ({ explode: 1, litFilm: 1 }): the three layers apart, the film green — the gag's last image
};

/** The world: the L01's, as it is. apply(S, time) reads the L01's numbers; l01, fils, yt are read by main.js only. */
export function buildWorld(stage) {
  return buildL01(stage);
}
