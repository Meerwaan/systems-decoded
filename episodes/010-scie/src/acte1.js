// 01 · MENACE — from the first frame to "Alors…" (0 → tounder). Your hand slips; your fingertip meets the teeth.
//
// The hook A · B · C is ONE move round your fingertip, each stage landing on its word. The first frame is the
// poster (POSE0): the whole blade seen through the table, the board across it, your hand flat on the board, its
// forefinger a centimetre from the teeth. The camera pushes and rises to the fingertip while the hand slides
// ("Ta main glisse") and lands on the contact ("Ton doigt touche la lame"): THE FILM STOPS — every tooth sharp, a
// veille light at the fingertip, the clock at T+0,0 ms. From there time stands still and only the camera moves:
// it comes down and backs away until the whole stopped blade is there ("elle s'arrête en moins de cinq
// millisecondes"), goes on round it to the finger on the teeth ("Son inventeur l'a testée sur son doigt"), then
// backs up along your arm until you are in the picture, bent over your saw ("Toi… tu poses le tien ?").
// Then a cut: the same saw, ORDINARY — no signal on the blade, and time does not stop. The light of the threat
// takes the fingertip, then the hand; the camera backs away to you, whole, while the count runs; the film winds back.
//
// The hook's cards lie over y 1186–1542. Under the table the blade is a bright disc: a low frame keeps the WHOLE
// disc above the cards (the poster, the stopped blade), a close one looks down from 27° so that the board lies
// under them. A label in the top slot (y 452–522) needs the top of the blade under y 540.
// The poster is POSE0 (world.js): { tx: -0.8, ty: 90.5, tz: 7, d: 98, az: -70, el: 20, fov: 36, shift: 348, side: 34 } —
// ORD below is the same frame 90 px lower.
import { setAct } from "@kit/overlay.js";
import { ramp } from "@kit/direct.js";
import { SET, STAGED } from "./world.js";

/* ── the poses (found with `look`) ── */
// the fingertip on the teeth, from 27° above: the front of the blade rises to the left, the board lies under the cards
const NEAR = { tx: -0.5, ty: 91.3, tz: 7.4, d: 54, az: -72, el: 27, fov: 32, shift: 150, side: 50, drift: 0.3 };
// …and it never stands still: the camera leans round the finger while the film is stopped
const NEAR_ON = { d: 51, az: -78, el: 25 };
// the whole blade, stopped, seen flat on from the level of the table: every tooth, and your finger on one of them
const WHOLE = { tx: -1, ty: 90, tz: 5, d: 134, az: -88, el: 8, fov: 32, shift: 300, side: 40 };
const WHOLE_ON = { d: 128, az: -97 };
// further round and down on it again: the finger on its tooth, the hand behind it (from low and near, the lower half
// of the blade lies under the cards: tried, the words sit on a pale disc)
const HIS = { tx: -0.6, ty: 91.2, tz: 7.8, d: 66, az: -112, el: 28, fov: 32, shift: 150, side: 30 };
// you, bent over the saw: your face, your arm, and at the bottom your finger on the blade
const YOU_OVER = { tx: -6, ty: 126, tz: 22, d: 360, az: -128, el: 9, fov: 32, shift: 125, side: 0 };
// an ORDINARY saw: the frame of the first picture, a little lower (a label stands in the top slot)
const ORD = { tx: -0.8, ty: 90.5, tz: 7, d: 98, az: -70, el: 20, fov: 36, shift: 258, side: 34, roll: 0, drift: 0.3 };
// the hand the light takes
const HARM = { tx: -3.5, ty: 91, tz: 13, d: 66, az: -62, el: 24, fov: 40, shift: 150, side: 70 };
// you, whole, at the saw: your head under the label, your hand above the captions
const YOU = { tx: -6, ty: 92, tz: 30, d: 480, az: -74, el: 8, fov: 28, shift: -215, side: 0 };

const thousands = (n) => (n < 1000 ? String(n) : `${Math.floor(n / 1000)} ${String(n % 1000).padStart(3, "0")}`);

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip, jolt } = D;
  const t = D.times({
    glisse: "accroche:glisse$", touch: "touch", keep: "keep", moins: "promesse:moins", his: "his", testee: "promesse:testée", yours: "yours", tien: "promesse:tien",
    tosans: "tosans", over: "over", usa: "usa", trente: "scene:trente", des: "scene:Des", milliers: "scene:milliers", amput: "amput", back: "back", tounder: "tounder",
  });
  const A = world.saw.A;
  setAct(tl, 1, 0);

  /* ───────────── A · "Ta main glisse. Ton doigt touche la lame." ───────────── */
  // the first frame is POSE0 / FIRST. The camera pushes toward the fingertip from frame 1 (a sine.inOut that is
  // already under way) and the hand slides from frame 1: a centimetre from the teeth, then two millimetres…
  const land = t.touch - 0.04;
  shot(0, land, NEAR, (u) => 0.5 - 0.5 * Math.cos(Math.PI * u) + 0.4 * u * (1 - u) * (1 - u));
  st(0, t.glisse, { slip: 0.95 }, "sine.out");
  st(0, t.touch, { feed: STAGED.feed }, "none"); // the board goes on under the hand
  // …"touche": the last two millimetres
  const reach = Math.min(0.45, t.touch - t.glisse);
  st(t.touch - reach, reach, { slip: 1 }, "power2.in");
  // the contact: THE FILM STOPS. Three frames and every tooth is sharp; a light that has a place, at the fingertip;
  // a knock on the camera (the picture is close: no long level line in it)
  st(t.touch, 0.1, { blur: 0 }, "power2.out");
  st(t.touch, 0.08, { circuit: 0.16 }, "power2.out");
  st(t.touch + 0.08, 0.7, { circuit: 0.12 }, "sine.inOut");
  jolt(t.touch, 0.4, 0.45);
  shot(land, t.keep - land, NEAR_ON, "sine.inOut", NEAR.d);

  /* ───────────── B · "Tu le gardes : elle s'arrête en moins de cinq millisecondes." ───────────── */
  // down to the level of the table and back, round the finger: the whole blade, stopped — there before "moins de"
  const whole = t.moins - 0.1;
  shot(t.keep, whole - t.keep, WHOLE, "sine.inOut", NEAR_ON.d);
  chip("chip-5ms", A.top, -280, -92, whole - 0.15, t.his - 0.3);
  shot(whole, t.his - 0.05 - whole, WHOLE_ON, "sine.inOut", WHOLE.d);

  /* ───────────── "Son inventeur l'a testée sur son doigt." ───────────── */
  // the arc goes on and comes down on the finger again: there on "testée"
  const climb = t.yours - 0.15; // "son doigt" is said: the camera leaves it just before "Toi"
  const onFinger = Math.min(t.testee + 0.2, climb - 0.3);
  shot(t.his - 0.05, onFinger - t.his + 0.05, HIS, "sine.inOut", WHOLE_ON.d);
  chip("chip-gass", null, 96, 452, t.his + 0.1, climb - 0.1);
  shot(onFinger, climb - onFinger, { d: HIS.d * 0.94, az: HIS.az - 3 }, "sine.inOut", HIS.d);

  /* ───────────── C · "Toi… tu poses le tien ?" ───────────── */
  // back along your arm until you are there, bent over the saw — and the camera stays on you
  const onYou = t.tien + 0.25;
  shot(climb, onYou - climb, YOU_OVER, "sine.inOut", HIS.d * 0.94);
  st(climb, onYou - climb, { fx: -8, fy: 118, fz: 26, fs: 130 }, "sine.inOut");
  shot(onYou, t.tosans - 0.02 - onYou, { d: YOU_OVER.d * 0.96 }, "sine.inOut", YOU_OVER.d);

  /* ───────────── "Sur une scie ordinaire, c'est déjà fini." ───────────── */
  // the frame of the first picture, but nothing listens on this blade and time does not stop: it turns, the
  // board goes on, the sawdust flies — and your finger is on it
  const rew = Math.min(t.back, t.tounder - 0.37);
  cut(t.tosans, SET.SHOP, ORD, { ...STAGED, signal: 0 });
  st(t.tosans + 0.02, rew - t.tosans - 0.02, { feed: STAGED.feed + 4 }, "none");
  chip("chip-ord", null, 96, 452, t.tosans + 0.12, t.usa - 0.14);
  // "c'est déjà fini": the light of the threat takes the fingertip, then the whole hand — the camera is on it
  const onHand = t.over + 0.5;
  shot(t.tosans, onHand - t.tosans, HARM, "sine.inOut", ORD.d);
  st(t.over, 0.3, { harm: 0.3 }, "power2.out");
  st(t.over + 0.3, 0.6, { harm: 1 }, "sine.inOut");
  shot(onHand, t.usa - onHand, { d: HARM.d * 0.96 }, "sine.inOut", HARM.d);

  /* ───────────── "Aux États-Unis : trente mille blessés par an." ───────────── */
  // back, by ratio, to you whole at the saw — the hand still alight; the count is there on "trente mille"
  const wide = t.des - 0.1;
  shot(t.usa, wide - t.usa, YOU, "sine.inOut", HARM.d * 0.96);
  st(t.usa, wide - t.usa, { fx: -8, fy: 110, fz: 36, fs: 170 }, "sine.inOut");
  chip("chip-usa", null, 96, 452, t.usa + 0.1, t.des - 0.14);
  D.readout("usa-v", (time) => thousands(Math.round((30000 * ramp(time, t.usa + 0.1, t.trente + 0.15)) / 100) * 100));

  /* ───────────── "Des milliers d'amputations." ───────────── */
  // the camera holds, leaning in; the hand's light sinks and flares again on the word
  chip("chip-amp", null, 96, 452, t.milliers - 0.05, t.tounder - 0.14);
  shot(wide, rew - wide, { d: YOU.d * 0.93 }, "sine.inOut", YOU.d);
  st(t.milliers, Math.max(0.1, t.amput - t.milliers), { harm: 0.72 }, "sine.inOut");
  st(t.amput, Math.min(0.3, Math.max(0.05, rew - 0.02 - t.amput)), { harm: 1 }, "power2.out");

  // …and the film winds back: none of this happens (act 2 cuts at tounder)
  st(rew, 0.35, { harm: 0 }, "power2.inOut");
  st(rew, t.tounder - 0.02 - rew, { feed: STAGED.feed + 2.5, slip: 0.9 }, "power2.inOut");
  shot(rew, t.tounder - 0.02 - rew, { d: YOU.d }, "power2.inOut", YOU.d * 0.93);
}
