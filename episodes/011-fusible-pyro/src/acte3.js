// 03 · RÉPONSE — thirty milliseconds, stretched over twenty-five seconds (`tozero` → `toverdict`). The crash again,
// in slow motion: the nose creeps, the shards hang in the air, and under the floor one millisecond is played in four
// gestures. In cuts — each one a few frames before its sentence, its pose complete and its state too ({ ...STAGED, … }).
//
// Where the camera stands, and why:
//   · "Choc."        the film's first picture, the bumper ON the wall: it only pushes in while the nose starts to fold.
//   · the unit       on the tunnel, from above and close: its three bars come on with the ticks, the whole panel on
//                    "compris". On "Le même ordre" the camera backs away by ratio until the car holds the three ends
//                    of the order — your wheel, the dashboard, the box under the back seat — then goes after the head
//                    that runs to the fuse, and is on the box when the head lands on the plug.
//   · the fuse       ONE frame for the four gestures (the charge · the piston · the break · the arc put out): in
//                    section, the bar across the picture, the camera creeping in. From the break on it goes down with
//                    the piston and closes in on the gap, in one move: two stumps, nothing live between them.
//   · the battery    the pack and its cable in a row, from the box toward the nose, nobody on it: the car steps back
//                    on "seule", the dashes die in the orange cable on "plus rien" — the modules go on glowing.
//   · you            your window: the bags half out, still filling; you, still going forward.
//
// Three numbers run through the whole act, cut after cut, each on ONE curve (crush, debris, bags): every shot lays
// its own piece — no tween runs across a cut on a number the cut sets.
import { setAct } from "@kit/overlay.js";
import { along, moved } from "@kit/direct.js";
import { SET, STAGED, POSE0, HOME } from "./world.js";

const FLAT = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const STILL = { ...FLAT, drift: 0 };
const FUSE_AT = [HOME[0], HOME[1] + 7, HOME[2]]; // the centre of the fuse's housing, in the car
/** What STAGED does not say: no part is lit by the voice (act 2 leaves the charge glowing). */
const UNLIT = { litCase: 0, litBar: 0, litPiston: 0, litCharge: 0 };
const ROAD = { ...STAGED, ...UNLIT };

/* ── the car against the wall ── */
const WIDE_IN = { d: 735 };
/* ── the control unit, the order ── */
const UNIT_AT = [0, 41, 20];
const UNIT = { ...STILL, tx: 0, ty: 41, tz: 20, d: 78, az: -40, el: 40, shift: 120 };
const UNIT_IN = { d: 70 };
// your wheel, the unit, the box: the three ends of the order (the wheel at x ≈ 170, the box at x ≈ 850: left of TikTok's buttons)
const ORDER = { tx: -4, ty: 58, tz: 34, d: 780, az: -52, el: 28, shift: 60 };
const TOBOX = { tx: 10, ty: 36, tz: 101, d: 150, az: -40, el: 26, shift: 120 }; //  …after the head that runs to the fuse
/* ── the fuse in the car, in section (the bench's poses, moved to where it stands under the back seat) ── */
const CUTAWAY = moved({ ...STILL, tx: 0, ty: 7.7, tz: 0, d: 36, az: -22, el: 11, shift: 160 }, [0, 0, 0], HOME);
const CUTAWAY_IN = { d: 33 };
const GAP = moved({ tx: 0, ty: 5.8, tz: 0.4, d: 21, az: -18, el: 12, shift: 160 }, [0, 0, 0], HOME);
/* ── the battery and its cable, in a row · your window ── */
// (the last framing is worked out from the one seen on the sheets, not seen itself: the far corner of the pack stops at
// the header's foot (y ≈ 410), the box stands above the captions (y ≈ 1000–1190), the fuse at x ≈ 690 — clear of
// TikTok's buttons — and the cable is a diagonal from the top left down to it)
const CABLES = { ...STILL, tx: 28, ty: 34, tz: 10, d: 600, az: -24, el: 30, shift: 225 };
const CABLES_IN = { tz: 13, d: 565, shift: 200 };
const BAGS = { ...STILL, tx: -15, ty: 100, tz: -30, d: 300, az: -72, el: 10, fov: 40, shift: 150 };
const BAGS_IN = { d: 270 };

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, chip, blip } = D;
  const t = D.times({
    tozero: "tozero", crash: "crash", ecu: "ecu", got: "zero:compris", same: "zero:même", order: "order", and: "zero:et",
    tofire: "tofire", trigger: "trigger", hit: "hit", snap: "snap", arc: "arc", out: "out",
    tocut: "tocut", battery: "coupe:La", alone: "alone", nothing: "coupe:plus", tied: "coupe:voiture",
    tobag: "tobag", inflate: "inflate", toverdict: "toverdict",
  });
  const toorder = t.same - 0.2; // "Le même ordre": the camera leaves the unit
  const tochase = t.and - 0.1; //  "et vers lui"
  const toalone = t.battery - 0.12; // the cut to the battery, a few frames before its sentence
  const span = (a, b, least = 0.05) => Math.max(least, b - a);
  const has = (id) => !!document.getElementById(id);
  setAct(tl, 3, t.crash);

  /* The slow motion: one curve per number, from the crash to the end of the act; a shot lays the piece it shows. */
  const curve = (name, keys) => ({
    at: (time) => along(keys, time),
    lay(a, b) {
      const from = along(keys, a);
      const gain = along(keys, b) - from;
      if (Math.abs(gain) > 1e-6) st(a, b - a, { [name]: from + gain }, (u) => (along(keys, a + u * (b - a)) - from) / gain);
    },
  });
  const first = span(t.crash, t.ecu);
  const crush = curve("crush", [[t.crash, 0], [t.crash + 0.25 * first, 0.09], [t.ecu, 0.2], [t.tobag, 0.5], [t.toverdict, 0.7]]);
  const debris = curve("debris", [[t.crash, 0], [t.crash + 0.2 * first, 0.16], [t.ecu, 0.3], [t.toverdict, 0.72]]);
  const bags = curve("bags", [[t.trigger, 0], [t.tobag, 0.35], [t.toverdict, 0.8]]);
  const slow = (time) => ({ crush: crush.at(time), debris: debris.at(time), bags: bags.at(time) });
  const run = (a, b, curves = [crush, debris, bags]) => curves.forEach((c) => c.lay(a, b));
  /** The light follows what is filmed. */
  const light = (at, dur, [fx, fy, fz], fs, ease = "sine.inOut") => st(at, dur, { fx, fy, fz, fs }, ease);

  /* ══════════ « Choc. » ══════════ */
  // the film's first picture, an instant earlier: the bumper touches the wall. On the word the nose starts to fold, slowly.
  cut(t.tozero, SET.ROAD, POSE0, { ...ROAD });
  run(t.tozero, t.ecu);
  shot(t.tozero, t.ecu - t.tozero, WIDE_IN, "sine.out");

  /* ══════════ « En dix millièmes de seconde, le calculateur a compris. » ══════════ */
  // (`pack` at half: the modules fill the picture behind the unit, up to the header — it is the unit's shot)
  cut(t.ecu, SET.ROAD, UNIT, { ...ROAD, ...slow(t.ecu), shell: 0.7, pack: 0.5, fx: UNIT_AT[0], fy: UNIT_AT[1], fz: UNIT_AT[2], fs: 34 });
  run(t.ecu, t.tofire);
  shot(t.ecu, toorder - t.ecu, UNIT_IN, "sine.out");
  // it makes up its mind: one bar, two, three (the ticks) — and on "compris" the whole panel
  const think = Math.max(0.1, Math.min(0.6, t.got - t.ecu - 0.2));
  st(t.ecu + 0.05, think, { ecu: 0.78 }, "none");
  st(t.got - 0.06, 0.16, { ecu: 1 }, "power2.out");
  if (has("chip-ecu")) chip("chip-ecu", null, 96, 470, t.ecu + 0.15, toorder - 0.15);

  /* ══════════ « Le même ordre part vers tes airbags… et vers lui. » ══════════ */
  // the camera backs away from the unit (by ratio) until the car holds the three ends of the order; the cover of the box goes
  const back = span(toorder, tochase);
  shot(toorder, back, ORDER, "sine.inOut", UNIT_IN.d);
  light(toorder, back, [-10, 62, 30], 260);
  st(toorder + 0.2 * back, 0.6 * back, { box: 0 }, "sine.inOut");
  st(toorder, 0.7 * back, { pack: 1 }, "sine.inOut"); // the battery comes up under the car as the camera finds it
  // one order, three wires: the heads leave together, and reach the bags AND the fuse together — as the camera gets there
  st(t.order, span(t.order, t.tofire - 0.03), { order: 1 }, "sine.inOut");
  // "et vers lui": after the head that runs to the box under the back seat
  const chase = span(tochase, t.tofire);
  shot(tochase, chase, TOBOX, "sine.inOut", ORDER.d);
  light(tochase, chase, FUSE_AT, 60);

  /* ══════════ « La charge explose. Le piston frappe la barre. Le cuivre casse : un arc… éteint. » ══════════ */
  // ONE frame for the four gestures: the fuse in section, where it stands in the car, the bar across the picture.
  // (the battery glows right behind it: `pack` down, or it bleeds into a pink sheet. And `order` back to 0: the head
  // of light has arrived in the shot before — parked on the plug, its halo is 4 cm wide: from here it would hide the
  // charge and all it does. What the order wakes is the charge itself.)
  cut(t.tofire, SET.ROAD, CUTAWAY, {
    ...ROAD, ...slow(t.tofire), shell: 0.7, pack: 0.4, box: 0, lid: 0, flow: 0.6, hv: 0.6, ecu: 1, order: 0,
    fx: FUSE_AT[0], fy: FUSE_AT[1], fz: FUSE_AT[2], fs: 12,
  });
  run(t.tofire, toalone);
  shot(t.tofire, t.snap + 0.1 - t.tofire, CUTAWAY_IN, "sine.inOut");
  // the order is there: the charge wakes, faintly…
  st(t.tofire + 0.1, span(t.tofire + 0.1, t.trigger - 0.04), { litCharge: 0.5 }, "sine.in");
  // …"explose": a light that has a place, two frames at its peak, then it falls — its gases go on pushing. For those
  // two frames the can flares and everything round it takes the colour of the burst.
  // (`gel` no higher than 0.1: at 0.2 it repaints the signal dashes of the bar green)
  st(t.trigger, 0.06, { litCharge: 0.9, gel: 0.1 }, "power2.out");
  st(t.trigger + 0.12, 0.45, { litCharge: 0, gel: 0 }, "power2.out");
  st(t.trigger, 0.08, { fire: 1.2 }, "power2.out");
  st(t.trigger + 0.15, 0.5, { fire: 0.4 }, "power2.out");
  st(t.trigger + 0.65, span(t.trigger + 0.65, t.snap), { fire: 0.15 }, "sine.out");
  if (has("flash")) blip("#flash", t.trigger, 0.05, 0.03, 0.22);
  // The bar is the PISTON's doing all the way: the state's `snap` cannot be moved from here (the word is one of
  // GSAP's own — a tween or a set that carries it leaves S.snap where it was), and the model does without it: past
  // 0.25 the piston pushes the middle of the bar, at 1 it is in the pit, the lips folded.
  // the piston leaves its seat, barely: the gases are still building behind it…
  st(t.trigger + 0.06, span(t.trigger + 0.06, t.hit - 0.02), { piston: 0.05 }, "power2.out");
  // …"frappe": its wedge is on the copper, and in it — the bar dents, its current squeezed, not broken yet.
  // (No further than 0.33 before "casse": past 0.4 the model counts the bar as cut and the dashes stop at the first
  // stump, one sentence early.)
  st(t.hit, 0.12, { piston: 0.31 }, "power2.in");
  jolt(t.hit + 0.1, 0.2, 0.25);
  st(t.hit + 0.12, span(t.hit + 0.12, t.snap - 0.02), { piston: 0.33 }, "sine.out");
  // "casse": three frames — the middle of the bar is punched into the pit, the lips fold. The current still crosses
  // the gap: on an arc born with the break (it is there before the bar has finished parting: the dashes never blink)
  st(t.snap, 0.1, { piston: 1 }, "power2.in");
  st(t.snap, 0.1, { broken: 1 }, "power2.in"); // (the state's number, renamed since: the slug in the pit, the lips bent)
  jolt(t.snap + 0.08, 0.35, 0.3);
  st(t.snap, 0.04, { arc: 0.6 }, "none");
  st(t.snap + 0.02, 0.4, { fire: 0 }, "sine.out");
  // "un arc": it flares (two frames at its peak) and burns on, thinner…
  st(t.arc, 0.07, { arc: 1.2 }, "power2.out");
  st(t.arc + 0.14, span(t.arc + 0.14, t.out - 0.02), { arc: 0.65 }, "sine.out");
  // …"éteint": out — nothing crosses any more, and the threat is over: the light turns veille
  st(t.out, 0.12, { arc: 0 }, "power2.in");
  st(t.out + 0.04, 0.3, { flow: 0, hv: 0 }, "power2.out");
  st(t.out + 0.1, 0.3, { mood: 0 }, "sine.inOut");
  if (has("chip-cut")) chip("chip-cut", null, 96, 470, t.out + 0.12, Math.min(t.tocut + 0.5, toalone - 0.15)); // gone before the piston's crown comes up under it

  /* ══════════ « Une milliseconde. » ══════════ */
  // from the break on, the camera goes down with the piston and closes in, in one move: it is on the gap when the
  // voice counts — the two stumps, bent down, and nothing live between them
  const close = span(t.snap + 0.1, toalone);
  shot(t.snap + 0.1, close, GAP, "sine.inOut", CUTAWAY_IN.d);
  st(t.snap + 0.1, close, { fy: FUSE_AT[1] - 1, fs: 6 }, "sine.inOut");

  /* ══════════ « La batterie est seule : plus rien ne la relie à la voiture. » ══════════ */
  cut(toalone, SET.ROAD, CABLES, {
    ...ROAD, ...slow(toalone), you: 0, bags: 0, shell: 0.5, box: 0, lid: 0, flow: 0, piston: 1, ecu: 1, order: 1, mood: 0,
    fx: 0, fy: 30, fz: 0, fs: 260,
  });
  run(toalone, t.tobag, [crush, debris]); // (a shot about what is under the floor: nobody on it, no bags)
  shot(toalone, t.tobag - toalone, CABLES_IN, "sine.inOut");
  // "seule": the car steps back round it; "plus rien ne la relie": the dashes die in the orange cable — the modules go on glowing
  st(t.alone, 0.5, { shell: 0.22 }, "sine.inOut");
  st(t.nothing - 0.1, span(t.nothing - 0.1, t.tied + 0.1), { hv: 0 }, "sine.inOut");
  if (has("chip-seule")) chip("chip-seule", null, 96, 470, t.alone + 0.1, t.tobag - 0.15);

  /* ══════════ « Tes airbags, eux, n'ont pas fini de se gonfler. » ══════════ */
  cut(t.tobag, SET.ROAD, BAGS, {
    ...ROAD, ...slow(t.tobag), hv: 0, flow: 0, piston: 1, ecu: 1, order: 1, mood: 0,
    fx: -30, fy: 96, fz: -20, fs: 150,
  });
  run(t.tobag, t.toverdict);
  shot(t.tobag, t.toverdict - t.tobag, BAGS_IN, "sine.inOut");
  if (has("chip-bags")) chip("chip-bags", null, 96, 470, t.tobag + 0.45, t.toverdict - 0.15); // the header's clock runs to it
}
