// 03 · RÉPONSE — back in the kitchen, from « Sans casserole, son voyant clignote… » to « Juste au-dessus. »
// (torepos → toverdict). The voice comes in short breaths: one picture per breath, cuts between places.
//
//   · the empty zone (torepos → tozero): ONE move — your hand flat on its dark coil, the « 9 » blinking, then the camera
//     leaves the hand along the glass to the saucepan sitting on its zone, its base seen through its wall (`xray`), the
//     currents turning in it, and the ring of glass under it going hot on « brûlant »;
//   · the lift (tozero → toreponse): from the right (az −15: from the left your arm passes in front of the pan), the
//     pan rises in your right hand; on « éteint » the field and the currents drop on ONE frame (the header reads 0); on
//     « Net. » nothing moves; then the camera rises over the pan to see the bubbles die, and your left hand crosses to
//     the ring — high (hover 2.6 ≈ 5 cm);
//   · the H (toreponse → toverdict): the hot ring at glass level, the hand above it, coming down slowly; « la plaque le
//     sait »: the temperature point lights veille under the glass; the camera runs to the display, the H lights on
//     « apparaît »; a cut back to the hand, which stops a finger above the ring (hover 1 on « s'arrête »); a cut to the
//     profile — the gap of a finger — and it withdraws.
// The heat in the lifted base (`panHeat`) falls with the bubbles (casserole.js: else its underside stays orange).
// Displays are filmed at el ≥ 32 (a figure flat on the glass is crushed below el 26).
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED } from "./world.js";

const P = { fov: 30, side: 0, roll: 0, drift: 0.3 };
// the empty zone and your hand: VIEW.emptyZone, then closer on the hand and its dark coil, then backing off it
const EMPTY0 = { ...VIEW.emptyZone, tx: 170, ty: 92, tz: 46, d: 88 };
const EMPTY1 = { tx: 168, ty: 92, tz: 44, d: 74, az: -44, el: 32, dof: 8 };
const EMPTY2 = { tx: 178, ty: 93, tz: 41, d: 88, az: -52, el: 22, dof: 0 };
// the saucepan sitting on the glass, low, three quarters from the left
const PANSIT0 = { tx: 194, ty: 98, tz: 39, d: 100, az: -50, el: 9, dof: 0 };
const PANSIT1 = { tx: 195, ty: 97, tz: 39, d: 88, az: -44, el: 8, dof: 0 };
// the lift, from the right (VIEW.panLow), the camera follows the pan up a little
const LIFT0 = { ...VIEW.panLow, tx: 197, ty: 103, tz: 42, d: 168, az: -16, el: 12, dof: 0 };
const LIFT1 = { ...LIFT0, ty: 106, d: 156, el: 15 };
// over the lifted pan: its water, the ring below, your left hand coming across
const OVER = { ...P, tx: 188, ty: 104, tz: 41, d: 165, az: -32, el: 32, shift: 120, dof: 0 };
// the hot ring at glass level, the hand above it
const RING0 = { ...VIEW.hotRing, ty: 95, d: 86, el: 16 };
const RING1 = { ...RING0, d: 74, az: -50, el: 19 };
// the hero display (el ≥ 32)
const DISP = { ...VIEW.display, el: 36, dof: 8 };
// your hand stopped above the ring, the lit H in the same frame
const HAND0 = { ...P, tx: 193, ty: 95, tz: 47, d: 70, az: -40, el: 28, shift: 110, dof: 0 };
// the profile: a finger between the palm and the glass
const PROF = { ...P, tx: 194, ty: 92.6, tz: 39, d: 48, az: -84, el: 2, shift: 110, dof: 8 };

export default function acte3({ D }) {
  const { tl, st, shot, cut, path, punch, chip } = D;
  const t = D.times({
    torepos: "torepos", clignote: "clignote", chauffe: "repos:chauffe", senti: "senti", mais: "mais", posee: "posee",
    brulant: "brulant", tozero: "tozero", souleves: "souleves", eteint: "eteint", net: "net", bulles: "bulles",
    descend: "descend", toreponse: "toreponse", garde: "garde", sait: "sait", afficheur: "afficheur",
    trigger: "trigger", arrete: "arrete", dessus: "dessus", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /* ── the empty zone: the hand flat, the coil dark; then along the glass to the saucepan ── */
  cut(t.torepos, SET.KITCHEN, EMPTY0, { ...STAGED, see: 1 });
  path([
    [t.torepos, EMPTY0],
    [t.chauffe, EMPTY1],
    [t.senti, EMPTY2],
    [t.posee, PANSIT0],
    [t.tozero, PANSIT1],
  ]);
  chip("chip-vide", null, 96, 470, t.torepos + 0.25, t.mais - 0.2);
  // « Mais ta casserole… »: the glass goes back to black, the pan's wall to glass; the currents turn in its base
  st(t.mais, 0.7, { see: 0 }, "sine.inOut");
  st(t.mais + 0.2, 0.8, { xray: 0.35 }, "sine.inOut");
  st(t.posee - 0.3, 1.0, { eddy: 1, field: 0.5 }, "sine.inOut");
  // « Et son fond est brûlant. »: the orange passes from the base into the ring of glass
  st(t.brulant - 0.15, 0.5, { glassHeat: 1 }, "sine.out");
  punch(t.brulant, 0.06);

  /* ── the lift: from the right ── */
  cut(t.tozero, SET.KITCHEN, LIFT0, { ...STAGED, grip: 1, xray: 0.7, eddy: 1, field: 0.5, glassHeat: 1 });
  shot(t.tozero, t.net - 0.15 - t.tozero, LIFT1, "sine.inOut");
  st(t.souleves, 0.9, { lift: 1 }, "sine.inOut");
  // « Le champ s'éteint. »: on ONE frame — field, currents, coil, display (the header's « Champ » reads 0)
  st(t.eteint - 0.02, 0.04, { on: 0, field: 0, eddy: 0, coil: 0, power: 0 }, "none");
  punch(t.eteint + 0.04, 0.06);
  // « Net. »: held. Then « Les bulles retombent. »: the camera rises over the water; boil, steam and heat fall together
  shot(t.net + 0.25, t.toreponse - t.net - 0.25, OVER, "sine.inOut");
  st(t.bulles - 0.1, 1.5, { boil: 0, steam: 0.25, panHeat: 0.3 }, "sine.out");
  // « Et ta main descend. »: your left hand leaves its zone and comes over the ring, high
  st(t.descend - 0.6, 1.25, { palm: 1, hover: 2.6 }, "sine.inOut");

  /* ── the H ── */
  const HELD = { ...STAGED, grip: 1, lift: 1, xray: 0.7, on: 0, field: 0, eddy: 0, coil: 0, boil: 0, steam: 0.25, panHeat: 0.3, power: 0, glassHeat: 0.85, palm: 1 };
  cut(t.toreponse, SET.KITCHEN, RING0, { ...HELD, hover: 2.6 });
  shot(t.toreponse, t.afficheur - 0.15 - t.toreponse, RING1, "sine.inOut");
  // the hand comes down slowly — it stops on « s'arrête », a finger above
  st(t.toreponse, t.arrete - t.toreponse, { hover: 1 }, "sine.inOut");
  // « …a gardé la chaleur du fond. »: the ring glows on
  st(t.garde - 0.1, 0.8, { glassHeat: 1 }, "sine.out");
  // « La plaque le sait. »: the temperature point lights under the glass
  st(t.sait - 0.05, 0.3, { sensor: 1 }, "sine.out");
  // « Sur l'afficheur, un H apparaît. »
  shot(t.afficheur - 0.15, t.trigger - 0.1 - t.afficheur + 0.15, DISP, "sine.inOut");
  st(t.trigger - 0.02, 0.04, { hot: 1 }, "none");
  punch(t.trigger + 0.04, 0.06);
  chip("chip-h", null, 96, 470, t.trigger + 0.1, t.toverdict - 0.3);
  // « Ta main s'arrête. »: back to the hand, the H lit in the frame
  const toHand = t.arrete - 0.36;
  cut(toHand, SET.KITCHEN, HAND0, { ...HELD, glassHeat: 1, sensor: 1, hot: 1 });
  shot(toHand, t.dessus - 0.12 - toHand, { ...HAND0, d: 58, az: -48 }, "sine.inOut");
  // « Juste au-dessus. »: the profile — the gap of a finger; then it withdraws
  cut(t.dessus - 0.12, SET.KITCHEN, PROF, { ...HELD, glassHeat: 1, sensor: 1, hot: 1, hover: 1 });
  shot(t.dessus - 0.12, t.toverdict - t.dessus + 0.12, { ...PROF, d: 52 }, "sine.inOut");
  st(t.dessus + 0.55, t.toverdict - t.dessus - 0.6, { away: 1 }, "sine.inOut");
}
