// 01 · MENACE — from the first frame to "Alors…" (0 → tofuse). The crash; under the floor, a charge goes off.
//
// The hook A · B is ONE move that changes scale seventeen times, each stage landing on its word. The first frame
// is the poster (POSE0): the car's nose folding on the wall, you thrown forward. The camera pushes to your window
// while the nose finishes folding ("Choc.") and the bags burst in front of you ("Tes airbags partent"); it slides
// back and down along your flank, through the back door, onto the junction box under the back seat, whose cover
// fades ("Sous le plancher") — there the fuse goes off: a light that has a place, and the dashes of the current
// stop on its bar ("une autre charge explose"). Then it backs away, by ratio, along the orange cable while the
// dashes shorten and go out ("Elle coupe ta batterie : quatre cents volts, en une milliseconde").
// C is a cut on "Mais": the whole car, everything out, the battery dimmed ("ces volts restent… quelque part" —
// the answer is kept for the end), and the camera backs away from it.
// Then three cuts, WITHOUT the fuse: the cable crushed bare on the body's steel; the same wide frame, where the
// light of the threat takes the body from the nose to your door; and the one who comes to that door — the camera
// cuts in on his hand, which stops two centimetres from the handle. And the film winds back.
//
// The hook's cards lie over y 1186–1542: the subject stays above them. Your two bags are solid and pale — the
// brightest things in the car: every frame here either shows them whole, under the header, or leaves them out.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, POSE0 } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// your window: you, the wheel, the bag that bursts out of it
const BAGS = { ...P, tx: -15, ty: 100, tz: -30, d: 300, az: -72, el: 10, fov: 40, shift: 150, drift: 0 };
const BAGS_ON = { d: BAGS.d * 0.93, az: BAGS.az - 3 };
// the fuse in its junction box (box 0), under the back seat
const FUSE_IN = { ...P, tx: 10, ty: 35.3, tz: 101, d: 68, az: -42, el: 18, shift: 140 };
const FUSE_ON = { d: FUSE_IN.d * 0.9, az: FUSE_IN.az + 3 };
// the orange cable in a row over the battery, from the box (bottom) forward (top left). Not wider, not lower: any
// frame that holds the whole front cable holds the bags above it, in the header
const CABLES = { ...P, tx: 8, ty: 34, tz: 45, d: 400, az: -22, el: 34, shift: 180 };
const CABLES_ON = { d: CABLES.d * 1.07, az: CABLES.az - 4 };
// the whole car against the wall, from three quarters rear — the frame of the first picture, dark, backing away
const REAR = { ...P, tx: -30, ty: 80, tz: -110, d: 700, az: -60, el: 10, fov: 46, shift: 150, drift: 0 };
const REAR_IN = { ...REAR, d: REAR.d * 0.86, az: REAR.az - 6 };
// WITHOUT the fuse: where the crash pinches the front cable against the body
const PINCH = { ...P, tx: 10, ty: 37.5, tz: -108, d: 76, az: -58, el: 30, shift: 120 };
const PINCH_IN = { ...PINCH, d: PINCH.d * 1.35 };
// …the same wide frame as REAR, and the push to your window
const LIVE = { ...P, tx: -30, ty: 80, tz: -100, d: 660, az: -62, el: 11, fov: 44, shift: 150, drift: 0 };
const LIVE_ON = { d: LIVE.d * 0.95 };
const YOU = { ...P, tx: -40, ty: 95, tz: -40, d: 430, az: -66, el: 9, fov: 42, shift: 150, drift: 0 };
// …the one at your door, from behind him
const HIM = { ...P, tx: -105, ty: 108, tz: 22, d: 450, az: -32, el: 7, fov: 38, shift: 90, drift: 0 };
const HIM_ON = { d: HIM.d * 0.93, az: HIM.az + 3 };
// …his fingertips and your door handle, from 30° above: the handle is a bar of light on a dark ground (the battery is
// turned down behind it), and your bag is out. From lower (el 8) the bag fills the top right of the frame, behind the
// header; in the line of the flank (az −3) the handle drowns in the lit body
const HAND = { ...P, tx: -93, ty: 92, tz: 34, d: 110, az: -26, el: 30, fov: 30, shift: 120, side: -80, drift: 0 };
const HAND_IN = { ...HAND, d: HAND.d * 1.15 };

// a sine.inOut that is already under way on the first frame…
const underWay = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u) + 0.4 * u * (1 - u) * (1 - u);
// …and the same by ratio (r = the distance it reaches / the distance it leaves): the picture grows at an even rate
const byRatio = (r, g = underWay) => (u) => (Math.pow(r, g(u)) - 1) / (r - 1);

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip, jolt } = D;
  const t = D.times({
    bags0: "bags0", partent: "accroche:partent", under: "under", boom0: "boom0",
    split: "split", v400: "promesse:400", ms: "ms", spot: "spot",
    tosans: "tosans", cable: "cable", ecrase: "scene:écrasé", tolive: "scene:et-0.12", carro: "scene:carrosserie", live: "live",
    you: "you", tohim: "scene:et#2-0.12", celui: "scene:celui", tohand: "scene:ouvre-0.12", door: "door", back: "back", tofuse: "tofuse",
  });
  const A = world.car.A;
  setAct(tl, 1, 0);

  /* ───────────── A · "Choc. Tes airbags partent." ───────────── */
  // the first frame is POSE0 / FIRST. From frame 1 the nose goes on folding and the shards fly — it is folded
  // halfway to "airbags" — and the camera is already on its way to your window (by ratio: the car grows evenly)
  const folded = t.bags0 * 0.47;
  st(0, folded, { crush: 0.8, debris: 0.85 }, "power2.out");
  st(folded, Math.max(0.2, t.partent - folded), { crush: 1 }, "sine.out");
  st(folded, t.spot - folded, { debris: 1 }, "sine.out");
  const atWindow = t.partent - 0.1;
  shot(0, atWindow, BAGS, byRatio(BAGS.d / POSE0.d));
  st(0, atWindow, { fx: -30, fy: 96, fz: -25, fs: 180 }, "sine.inOut");
  // "partent": the two bags burst
  st(t.bags0 + 0.04, 0.45, { bags: 1 }, "power3.out");
  shot(atWindow, t.under - atWindow, BAGS_ON, "sine.inOut", BAGS.d);

  /* ───────────── "Sous le plancher, une autre charge explose." ───────────── */
  // back and down along your flank, through the back door, onto the junction box under the back seat: its
  // cover fades, the fuse is there, the battery's whole current running through it
  const atFuse = t.boom0 - 0.45;
  const dive = atFuse - t.under;
  shot(t.under, dive, FUSE_IN, "sine.inOut", BAGS_ON.d);
  st(t.under, dive, { fx: 10, fy: 35, fz: 101, fs: 16 }, "sine.inOut");
  // (the body steps right back while the camera goes through its glass, two thirds of the way down: at 0.55 that
  // crossing was one milky frame over the whole picture — qa, 3.73 s — then it comes back round the junction box)
  st(t.under, dive * 0.5, { shell: 0.1 }, "sine.inOut");
  st(t.under + dive * 0.8, dive * 0.2, { shell: 0.55 }, "sine.inOut");
  st(t.under + dive * 0.35, dive * 0.45, { box: 0 }, "sine.inOut");
  // (from close, full dashes on bright copper are a barber's pole: they are thinned as the camera comes down)
  st(t.under + dive * 0.4, dive * 0.6, { flow: 0.6, hv: 0.7 }, "sine.inOut");
  // "explose": a light that has a place — two frames at its top, then it falls; the bar is cut, the dashes stop on
  // it and shorten in the bars around
  st(t.boom0, 0.07, { fire: 1.2 }, "power2.out");
  st(t.boom0 + 0.13, 0.45, { fire: 0 }, "power2.out");
  st(t.boom0 + 0.03, 0.1, { piston: 1 }, "power2.in");
  st(t.boom0 + 0.1, 0.07, { broken: 1 }, "none");
  st(t.boom0 + 0.13, 0.05, { arc: 1.1 }, "none");
  st(t.boom0 + 0.2, 0.15, { arc: 0 }, "power2.out");
  st(t.boom0 + 0.13, 0.25, { flow: 0 }, "power2.out");
  st(t.boom0 + 0.13, 0.5, { hv: 0.4 }, "power2.out");
  jolt(t.boom0, 0.35, 0.4);
  shot(atFuse, t.split - atFuse, FUSE_ON, "sine.inOut", FUSE_IN.d);

  /* ───────────── B · "Elle coupe ta batterie : quatre cents volts, en une milliseconde." ───────────── */
  // back, by ratio, along the orange cable: its dashes shorten and go out while it comes into the picture —
  // none is left on "milliseconde"
  const wide = t.ms - 0.1;
  shot(t.split, wide - t.split, CABLES, "sine.inOut", FUSE_ON.d);
  st(t.split, wide - t.split, { fx: 5, fy: 35, fz: 0, fs: 260, shell: 0.6 }, "sine.inOut");
  st(t.split, 0.45, { mood: 0 }, "sine.inOut");
  st(t.v400, t.ms - t.v400, { hv: 0 }, "sine.inOut");
  // (on the right, over the cells: on the left the label lay on the far end of the cable)
  chip("chip-400", null, 420, 470, t.v400, t.spot - 0.15);
  shot(wide, t.spot - wide, CABLES_ON, "sine.inOut", CABLES.d);

  /* ───────────── C · "Mais ces volts restent… quelque part." ───────────── */
  // the whole car, and everything in it is out: the battery is dimmed — the answer is kept for the end. The
  // camera backs away from it and leaves the question there.
  // (a cut on "Mais", not a climb out of the floor: on the way up your two bags came down through the header
  // for a whole second)
  cut(t.spot, SET.ROAD, REAR_IN, { shell: 1, box: 1, pack: 0.35, fx: -20, fy: 70, fz: -60, fs: 330 });
  shot(t.spot, t.tosans - 0.02 - t.spot, REAR, "sine.inOut", REAR_IN.d);

  /* ───────────── "Sans elle, un câble écrasé contre la tôle…" ───────────── */
  // the crash again, WITHOUT the fuse: nothing has cut — the front block comes back, the cable folds…
  cut(t.tosans, SET.ROAD, PINCH_IN, { ...STAGED, crush: 0.8, bags: 1, debris: 0.6, fx: 10, fy: 37, fz: -108, fs: 30 });
  st(t.tosans + 0.02, 0.6, { crush: 1 }, "power2.out");
  shot(t.tosans, t.ecrase - t.tosans, PINCH, "sine.inOut", PINCH_IN.d);
  // (on the right: on the left the label lay on the cable's bend)
  chip("chip-sans", null, 500, 470, t.tosans + 0.12, t.tolive - 0.16);
  // …"écrasé": it is jammed on the body's steel, its sheath torn, the copper bare — and the current is still in it
  st(t.cable, t.ecrase - t.cable, { cable: 0.45 }, "sine.inOut");
  st(t.ecrase, 0.4, { cable: 1 }, "power2.in");
  shot(t.ecrase, t.tolive - t.ecrase, { d: PINCH.d * 0.9, az: PINCH.az + 4 }, "sine.inOut", PINCH.d);

  /* ───────────── "…et la carrosserie peut être sous tension. Pour toi." ───────────── */
  // the wide frame again — the same car, the other outcome: the light of the threat takes the body from the
  // nose, and is at your door handle on "tension"
  cut(t.tolive, SET.ROAD, LIVE, { ...STAGED, crush: 1, bags: 1, debris: 0.6, cable: 1, fx: -40, fy: 80, fz: -40, fs: 300 });
  const rew = Math.min(t.back, t.tofuse - 0.37); // the film winds back just before act 2 cuts
  st(t.tolive + 0.03, rew - t.tolive - 0.03, { debris: 0.9 }, "none");
  const lit = t.live + 0.3;
  st(t.tolive + 0.05, lit - t.tolive - 0.05, { live: 0.8 }, "sine.in");
  shot(t.tolive, lit - t.tolive, LIVE_ON, "sine.inOut", LIVE.d);
  chip("chip-live", null, 96, 470, t.carro, t.you - 0.14);
  // "Pour toi": the camera comes to your window — you are in that bag
  const atYou = Math.min(t.you + 0.25, t.tohim - 0.1);
  shot(lit, atYou - lit, YOU, "sine.inOut", LIVE_ON.d);
  chip("chip-toi", A.youHead, -70, -170, t.you, t.tohim - 0.14);
  shot(atYou, t.tohim - atYou, { d: YOU.d * 0.96 }, "sine.inOut", YOU.d);

  /* ───────────── "Et pour celui qui ouvre ta portière." ───────────── */
  // he is there, at your door, whole; on "celui qui" his arm leaves his side…
  cut(t.tohim, SET.ROAD, HIM, { rescuer: 1, fx: -110, fy: 95, fz: 30, fs: 130 });
  chip("chip-rescue", A.rescuerHead, 70, -20, t.tohim + 0.12, t.tohand - 0.14);
  shot(t.tohim, t.tohand - t.tohim, HIM_ON, "sine.inOut", HIM.d);
  st(t.celui, t.door - t.celui, { reach: 1 }, "sine.inOut");
  // …"ouvre": a cut in on that hand — it comes into the frame and stops two centimetres from the handle on
  // "portière", and the heart of the light is on that handle (the battery is turned down behind it: the handle is
  // what is lit).
  // (a cut, not a push that follows the hand: on the way in, your bag went up through the header)
  cut(t.tohand, SET.ROAD, HAND_IN, { pack: 0.3, fx: -95, fy: 92, fz: 34, fs: 45 });
  const atHand = Math.min(t.door + 0.12, rew - 0.1);
  shot(t.tohand, atHand - t.tohand, HAND, "sine.inOut", HAND_IN.d);
  st(t.door, Math.min(0.25, Math.max(0.05, rew - 0.02 - t.door)), { live: 1 }, "power2.out");
  shot(atHand, rew - atHand, { d: HAND.d * 0.94 }, "sine.inOut", HAND.d);

  // …and the film winds back: none of this happens (act 2 cuts at tofuse)
  st(rew, 0.35, { live: 0, reach: 0 }, "power2.inOut");
  shot(rew, t.tofuse - 0.02 - rew, { d: HAND.d * 1.1 }, "power2.inOut", HAND.d * 0.94);
}
