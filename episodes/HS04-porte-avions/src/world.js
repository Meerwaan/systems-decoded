// HORS-SÉRIE 04 — Porte-avions (la promo verticale du L04, le pont d'envol du Charles de Gaulle) : the world.
//
// THERE IS NO NEW SET HERE. The world IS the L04's (episodes/L04-porte-avions/src/world.js: the PONT — the ship like an
// X-ray, the sea and the sky, the two steam catapults, the holdback bar and its calibrated piece, the receiver, the
// valve, the cabin, the nuclear plant, your Rafale, your yellow dog — and the BENCH; navire.js, model.js, bord.js,
// habillage.js), built as it is: its world.js imports no 16:9 code (only its main.js does, through kit/lib/landscape.js
// — never imported here, nor its chapter files c*.js: their poses are READ there and re-framed here).
// The frame: 1080 × 1920, the kit's zones — subject 440–1160 (`shift` ≈ +160 lifts it to y ≈ 800) · the top slot
// 436–790 is #duel's and #film's (fin) · nothing that matters under y 1600, nor right of x 905 between y 880 and 1760.
// The L04's poses (16:9, framed with `side`) become: `side` 0, `shift` for the height, and closer.
//
// LA RÈGLE (docs/recette-promo.md): the catapult is opened and its steam paid (receiver → plant → main); never the
// night landing (night 0, wires as they are), never why « chien » (the dog never waves off: `sig` ≠ 6). The piece
// breaking (`broken` 0) and the launch (`shuttle` ≤ 0.15, `run` 0) are locked EVERYWHERE BUT the beat `tir` (v2,
// docs/HS04-v2-montage.md § 6: the launch played whole, L04 c2 « release » → « airborne »); acte3.js puts them back
// (broken 0, shuttle 0, run 0, hooked 1, kmhOn 0) under the black of `tir$`.
import { buildWorld as buildL04, FIRST as L04_FIRST, SET, SIZE, FAR, AT, VIEW as LV, CLOSE, SHARP } from "../../L04-porte-avions/src/world.js";
import { CAT, CREW, TANK, VALVE, CABIN, PLANT, HOLDBACK, onCat, SHUTTLE_STOP, BOW_EDGE } from "../../L04-porte-avions/src/plan.js";

export { SET, SIZE, FAR, AT, CLOSE, SHARP, CAT, CREW, TANK, VALVE, CABIN, PLANT, HOLDBACK, onCat, SHUTTLE_STOP, BOW_EDGE };

/** The plateau of the long (docs/recette-promo-image.md § 2.5): dof 5 on the close shots only, finish and air off. */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };

/** A portrait pose: nothing inherited across a cut. */
export const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
export const NG = CAT[0].from; //                                   the nose-gear tow point (−200, 0, −5500)
export const NECK = [NG[0], 20, NG[2] + 163]; //                    the calibrated piece's neck, in place
export const DOG = CREW.dog;

// THE FIRST FRAME (= the last: the film loops). Chosen on a board of four (docs/recette-promo-image.md § 2).
export const POSE0 = { ...P, tx: NG[0], ty: 190, tz: NG[2] + 400, d: 1500, az: 0, el: 8, fov: 44, shift: 120, ...SHARP }; // in the tail's axis: the two cores white-hot (board of four, 23/10)

/** The instant of the L04 (s) each shot lives in, as the header shows it (« FILM · 02:42 »); −1 = the whole film. */
export const L04_AT = {
  accroche: 0.3, promesse: 3.5, curiosite: 18.0, dessous: 24.9, ouvre: 30.5, eclate: 32.8, ballon: 60.6, gestes: 103.6,
  plein: 156.5, tremble: 162.5, pare: 167.1, souffle: 170.4, nucleaire: 231.5, vapeur2: 238.8, chef: 112.7,
  casse: 175.7, chariot: 179.1, deux: 182.6, arrete: 184.0, vol: 185.9, // the launch (tir, v2)
};
/** The film's length, said in the header and on #film. */
export const L04_LENGTH = 628; // 10 min 28

export const FIRST = {
  ...L04_FIRST,
  etape: 0, // the L04's step: unused here
  kmh: 0, kmhOn: 0, // « Ton Rafale » during `tir` only (kmhOn 1; kmh 0 → 240 in one `st`, −1 « En vol »): main.js reads them on #hud-count
  /* ── the hors-série's header (main.js reads them; integers: set them with `now`, never `st`) ── */
  l04: L04_AT.accroche, // #hud-clock « FILM · 00:00 »; −1 → « FILM · 10 MIN 28 »
  fils: 0, //             the open threads (D.threads): 1 on curiosite, 2 on vapeur, back to 1 when it is paid, 2 on the test
  yt: 0, //               1 on `youtube`: « Réponses · Sur YouTube », veille
};

/** The portrait poses (re-framed from the L04's chapters; "seen" once looked at on a board). */
export const VIEW = {
  hook: POSE0,
  // the four candidates of the first frame
  hook1: POSE0, //                                                                                         behind the tail, over the deflector: the two cores white-hot, the slot to the signal horizon (the L04's own)
  hook2: { ...P, tx: NG[0], ty: 70, tz: NG[2] + 60, d: 430, az: -150, el: 5, fov: 40, shift: 140, ...SHARP }, // at the nose gear, from ahead-port: the launch bar in the hook, the holdback taut
  hook3: { ...P, tx: NG[0], ty: 200, tz: NG[2] + 500, d: 1500, az: -90, el: 2, fov: 40, shift: 120, ...SHARP }, // the whole Rafale in profile (miniature 1 « IL NE BOUGE PAS »)
  hook4: { ...P, tx: NG[0], ty: 150, tz: NG[2] + 300, d: 1000, az: -35, el: 0, fov: 44, shift: 140, ...SHARP }, // three-quarter rear from port, at deck level, the heat near the camera
  /* ── the bow catapult ── */
  bar: { ...P, tx: NECK[0], ty: NECK[1], tz: NECK[2], d: 230, az: -60, el: 12, shift: 120, ...CLOSE }, //       the calibrated piece, in place, taut
  stroke: { ...P, tx: NG[0], ty: 150, tz: NG[2] - 1000, d: 2600, az: 0, el: 14, fov: 44, shift: 140, ...SHARP }, // seen: over your tail, the slot climbs the frame to the signal horizon (`trace` runs on it)
  nose: { ...P, tx: NG[0], ty: 70, tz: NG[2] + 60, d: 480, az: -150, el: 5, fov: 40, shift: 140, ...CLOSE }, //  seen: the nose gear from ahead-port — the launch bar in the shuttle's hook, the holdback taut
  hurl: { ...P, tx: NG[0], ty: 190, tz: NG[2] + 400, d: 1250, az: 10, el: 7, fov: 46, shift: 120, ...SHARP }, //  seen: the cores, three-quarter rear
  dog: { ...LV.dog, side: 0, d: 480, az: -36, shift: 140, ...CLOSE }, //                                         your dog, his gesture
  dogFront: { ...LV.dog, side: 0, ty: 150, d: 420, az: 12, el: 6, shift: 140, ...CLOSE }, //                    from his front: his hands
  tail: { ...LV.hook3, side: 0, d: 1100, shift: 120 }, //                                                        behind the tail, closer
  profile: { ...LV.thumb1, d: 1700, shift: 140 }, //                                                            the whole aircraft in profile
  troughMid: { ...P, tx: NG[0], ty: -30, tz: NG[2] - 150, d: 700, az: -62, el: 24, shift: 120, ...CLOSE }, //  the bar and the slot from above
  trough: { ...LV.trough, side: 0, d: 1600, az: -40, el: 18, shift: 140 }, //                                  under the deck, the two cylinders
  expA: { ...P, tx: -500, ty: -150, tz: -5300, d: 1700, az: -14, el: 28, fov: 34, shift: 140, ...SHARP }, //       the catapult apart, along its axis
  expZ: { ...P, tx: -500, ty: -150, tz: -5300, d: 1400, az: -10, el: 30, fov: 34, shift: 140, ...SHARP }, //       seen: a cylinder, its piston out
  hookP: { ...P, tx: NG[0], ty: 275, tz: NG[2], d: 420, az: -52, el: 12, shift: 120, ...CLOSE }, //             the shuttle and its hook, raised
  recv: { ...P, tx: -300, ty: -1130, tz: -3800, d: 1900, az: -32, el: 10, shift: 140, ...CLOSE }, //               seen: the receiver, its green rings
  recvAft: { ...P, tx: -180, ty: -1120, tz: -3300, d: 1500, az: -24, el: 9, shift: 140, ...CLOSE }, //          the main leaves aft into the dark
  plant: { ...P, tx: 0, ty: -1900, tz: 900, d: 5400, az: 0, el: 10, fov: 30, shift: 160, ...SHARP }, //              seen: the two reactors side by side ({ plant: 1, ship: 0.4 })
  plantUp: { ...P, tx: 0, ty: -1800, tz: 300, d: 2800, az: -72, el: 18, shift: 140, ...SHARP }, //             along to where the main leaves them
  main: { ...P, tx: -150, ty: -1200, tz: -2600, d: 4200, az: -38, el: 22, fov: 30, shift: 160, ...SHARP }, //       seen: the steam climbs the main to the receiver ({ feed: 1 })
  shut: { ...LV.shuttle, side: 0, d: 340, shift: 120, ...CLOSE }, //                                            the shuttle, its hook in the launch bar
  neck: { ...LV.holdback, side: 0, d: 150, az: -60, el: 12, shift: 120, ...CLOSE }, //                          the neck, taut
  dogFar: { ...P, tx: DOG[0], ty: 110, tz: DOG[2], d: 820, az: -44, el: 6, shift: 140, ...SHARP }, // « Paré pont » : he kneels, the aircraft behind
  cab: { ...P, tx: CABIN.at[0] - 120, ty: 30, tz: CABIN.at[2], d: 560, az: -34, el: 28, shift: 140, ...CLOSE }, // the cabin
  valve: { ...LV.valve, side: 0, d: 340, az: -40, el: 9, shift: 120, ...CLOSE }, //                             the launch valve
  cyl: { ...P, tx: NG[0] - 30, ty: -70, tz: NG[2] - 1000, d: 900, az: -20, el: 20, fov: 32, shift: 120, ...CLOSE }, //   the cylinders through the glass deck
  /* ── tir (v2): the launch. No `ride` here (main.js gives none): acte3.js carries tz with your aircraft (launchZ) ── */
  gearRun: { ...P, tx: NG[0], ty: 150, tz: NG[2] + 200, d: 1800, az: -78, el: 8, fov: 30, shift: 120, ...SHARP }, // « le chariot t'arrache » : nose gear + shuttle from port, tracked
  chase: { ...P, tx: NG[0], ty: 150, tz: NG[2] + 400, d: 2600, az: -30, el: 14, fov: 32, shift: 120, ...SHARP }, // « deux secondes » : tracked from behind-port, high: the deck runs out ahead of you, the bow comes
  fly: { ...P, tx: NG[0], ty: 150, tz: NG[2], d: 6000, az: -120, el: 8, fov: 30, shift: 120, ...SHARP }, //          « le pont s'arrête sous toi · tu voles » : tracked, the bow slides back under you
};

/** The world: the L04's, as it is. apply(S, time) reads the L04's numbers; l04, fils, yt are read by main.js only. */
export function buildWorld(stage) {
  return buildL04(stage);
}
