// 03 · RÉPONSE — five milliseconds, stretched over fifteen seconds (`tozero` → `toverdict`). Time starts again
// on "Contact", in slow motion: the blade creeps (three teeth in all) until the block stops it. In cuts — each
// one a few frames before its sentence, its pose complete and its state too ({ ...STAGED, … }).
//
// Where the camera stands, and why:
//   · "Contact"      the hook's own picture, twice as close: your fingertip ON the teeth, the teeth still crawling
//                    past it. On "boit" it backs away without letting go of the fingertip (same aim, the framing is
//                    done with shift / side): the glow leaves the blade and runs up your hand, your wrist, your arm.
//   · the trigger    under the table, in profile and close (d ≈ 50: nearer, the bright block goes behind the header).
//                    One frame for the whole chain: the wire lights and burns, the leaf gives way, the spring throws
//                    the block — the camera only slides from the wire to the teeth.
//   · the bite       a real cut (30° round, and from below): the free end of the block, where the teeth come in. The
//                    ember where they enter is at its largest halfway through `bite`: it is crossed in three frames.
//   · the stop       the hook's frame from lower and wider (el 10, fov 40): the blade's dome and every tooth above
//                    the board, your finger against them AND, through the glass, the rest of the blade with the
//                    block in its teeth. The dome sinks into its slot in this very picture; the camera follows it
//                    down, then a cut to the profile says where it now is.
//   · you            never the hand alone (close, it is a mannequin's fist): the lifted hand, the empty slot under it.
//
// No tween runs across a cut on a number the cut sets (the blade's `turn` is laid shot by shot, on one curve).
import { setAct } from "@kit/overlay.js";
import { SET, STAGED } from "./world.js";

const FLAT = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const STILL = { ...FLAT, drift: 0 };
/** What STAGED does not say: no part is lit by the voice. */
const UNLIT = { litBlock: 0, litSpring: 0, litWire: 0 };
/** The blade in slow motion: every tooth there, a hair drawn out (0.05–0.17 is the model's own cross-fade). */
const SLOW = 0.12;
/** How far the blade still turns before the block has stopped it, in turns: three teeth. */
const TURN = 0.085;

/* ── above the table ── */
const TIP = { tx: -0.25, ty: 90.4, tz: 9.7 }; // your fingertip on the teeth
const CONTACT = { ...FLAT, ...TIP, d: 64, az: -64, el: 19, shift: 60, side: -90 };
const CONTACT_IN = { d: 58 };
const ARM = { ...TIP, d: 118, az: -66, el: 17, shift: 60, side: -20 }; // the blade whole, your hand, your forearm leaving the frame
const STOP = { ...STILL, tx: -0.5, ty: 88.5, tz: 1, d: 94, az: -68, el: 10, fov: 40, shift: 170, side: 50 };
const STOP_IN = { d: 85 };
const STOP_DOWN = { shift: 400 }; // …the picture tilts down with the blade
const YOU = { ...FLAT, tx: -7, ty: 97, tz: 12, d: 112, az: -56, el: 18, shift: 30, side: 20 }; // the hand over the slot it has just left
const YOU_IN = { tx: -9, ty: 98.5, tz: 12.5, d: 98, az: -52 };

/* ── under the table (the top at 0.15, the housing gone, you gone: your arm would shade the blade) ── */
const UNDER = { ...STAGED, ...UNLIT, table: 0.15, lid: 0, you: 0, dust: 0, blur: SLOW, signal: 0.1, fx: 0, fy: 71.5, fz: -12.5, fs: 16 };
const FIRE = { ...STILL, tx: 0, ty: 71.5, tz: -12.6, d: 55, az: -84, el: 3, shift: 50 }; // the whole trigger, in profile
const FIRE_WIRE = { tz: -12.9, d: 50 }; //                       toward the wire
const FIRE_ALL = { ty: 71.9, tz: -11.4, d: 52, az: -80, el: 2 }; // the leaf, the spring, the block, the teeth it faces
const FIRE_TEETH = { ty: 72.3, tz: -9.8, d: 49, az: -78, el: 1 }; // the free end of the block, on the teeth
const BITE = { ...STILL, tx: 0, ty: 72.4, tz: -8, d: 50, az: -50, el: -12, shift: 40, side: -20 };
const BITE_IN = { d: 45 };
const SIDE = { ...STILL, tx: 0, ty: 72, tz: -7, d: 160, az: -80, el: 3, shift: 90 }; // the top's edge, the blade under it, the block in its teeth
const SIDE_IN = { ty: 71, tz: -9, d: 140, az: -78, el: 2 };

export default function acte3({ D, world }) {
  const { tl, st, shot, cut, jolt, chip, blip } = D;
  const { saw, shop } = world;
  const t = D.times({
    tozero: "tozero", trigger: "trigger", drink: "drink", sensed: "zero:scie",
    tofil: "tofil", burn: "burn", spring: "fil:ressort", throw: "throw", bite: "bite",
    tostop: "tostop", stop: "stop", dive: "dive",
    toyou: "toyou", nick: "nick", stitches: "toi:Deux", toverdict: "toverdict",
  });
  const tobite = t.bite - 0.1;
  const has = (id) => !!document.getElementById(id);
  setAct(tl, 3, t.tozero);

  /* The blade, in slow motion: steady from the contact to the bite, then braked to nothing on "arrêtée" (its
     speed falls in a straight line: the header's counter reads the same). One curve; each shot lays its piece. */
  const speed = TURN / (t.bite - t.tozero + (t.stop - t.bite) / 2);
  const turnAt = (time) => {
    if (time <= t.bite) return speed * Math.max(0, time - t.tozero);
    const u = Math.min(1, (time - t.bite) / (t.stop - t.bite));
    return speed * (t.bite - t.tozero + (t.stop - t.bite) * (u - (u * u) / 2));
  };
  const turn = (a, b) => {
    const from = turnAt(a);
    const span = turnAt(b) - from;
    if (span > 1e-9) st(a, b - a, { turn: from + span }, (u) => (turnAt(a + u * (b - a)) - from) / span);
  };

  /* ══════════ « Contact. Ta peau boit le signal : la scie l'a senti avant toi. » ══════════ */
  cut(t.tozero, SET.SHOP, CONTACT, { ...STAGED, ...UNLIT, blur: SLOW });
  turn(t.tozero, t.tofil);
  shot(t.tozero, t.drink - t.tozero, CONTACT_IN, "sine.out");
  // on the word: the veille spark, where skin meets steel
  st(t.trigger, 0.1, { circuit: 0.15 }, "power2.out");
  // "boit": the blade's glow goes out as the light runs up your arm — and the camera backs away with it
  st(t.drink, Math.min(0.9, t.tofil - t.drink - 0.1), { signal: 0.1 }, "sine.out");
  st(t.drink, t.tofil - t.drink - 0.25, { circuit: 1 }, "sine.inOut");
  shot(t.drink, t.tofil - t.drink, ARM, "sine.inOut", CONTACT_IN.d);
  if (has("chip-detect")) chip("chip-detect", saw.A.top, -80, -160, t.sensed, t.tofil - 0.15); // it rides the blade as the camera backs away

  /* ══════════ « Un courant brûle le fil. Le ressort jette l'aluminium dans les dents. » ══════════ */
  cut(t.tofil, SET.SHOP, FIRE, { ...UNDER, turn: turnAt(t.tofil) });
  turn(t.tofil, tobite);
  shot(t.tofil, t.burn + 0.35 - t.tofil, FIRE_WIRE, "sine.inOut");
  // "un courant": the wire lights; "brûle": it parts in the middle — a light that has a place, three frames at its peak
  st(t.tofil + 0.05, t.burn - t.tofil - 0.1, { litWire: 1 }, "sine.in");
  st(t.burn, 0.07, { flash: 1.1 }, "power2.out");
  st(t.burn + 0.07, 0.75, { flash: 0 }, "power2.out");
  st(t.burn, 0.5, { wire: 0 }, "power2.out");
  st(t.burn + 0.1, 0.4, { litWire: 0 }, "sine.out");
  // nothing holds the leaf any more: it starts to give way… ("le ressort": a breath of veille on it — at 0.8 it is a green plastic spring)
  const give = t.burn + 0.45;
  st(give, t.throw - give, { pawl: 0.1 }, "power2.in");
  shot(give, t.throw - 0.08 - give, FIRE_ALL, "sine.inOut");
  st(t.spring - 0.05, 0.25, { litSpring: 0.3 }, "sine.out");
  // …"jette": and lets go — the leaf flies open, the spring throws the block onto the teeth
  st(t.throw, 0.16, { pawl: 1 }, "power3.out");
  jolt(t.throw, 0.2, 0.25);
  st(t.throw + 0.2, tobite - t.throw - 0.25, { litSpring: 0 }, "sine.inOut");
  shot(t.throw + 0.18, tobite - t.throw - 0.18, FIRE_TEETH, "sine.inOut");
  st(t.throw, tobite - t.throw, { fy: 72.3, fz: -10 }, "sine.inOut");

  // "dans les dents": from below, where they come in
  const crush = Math.min(0.5, t.tostop - t.bite - 0.15);
  cut(tobite, SET.SHOP, BITE, { ...UNDER, wire: 0, pawl: 1, turn: turnAt(tobite), fy: 72.6, fz: -8.5 });
  turn(tobite, t.tostop);
  shot(tobite, t.tostop - tobite, BITE_IN, "sine.out");
  st(t.bite, crush, { bite: 1 }, "power2.out");
  jolt(t.bite, 0.5, Math.min(0.35, t.tostop - t.bite - 0.1));
  if (has("flash")) blip("#flash", t.bite, 0.06, 0.03, Math.min(0.25, t.tostop - t.bite - 0.08));

  /* ══════════ « Moins de cinq millisecondes : la lame est arrêtée. Et son propre élan la tire sous la table. » ══════════ */
  cut(t.tostop, SET.SHOP, STOP, { ...STAGED, ...UNLIT, blur: SLOW, signal: 0.1, circuit: 1, wire: 0, pawl: 1, bite: 1, turn: turnAt(t.tostop) });
  turn(t.tostop, t.stop);
  shot(t.tostop, t.dive - t.tostop, STOP_IN, "sine.inOut");
  // "arrêtée": the last tooth stands still, sharp — and the threat is over: the light turns veille
  st(t.stop - 0.2, 0.2, { blur: 0 }, "sine.in");
  st(t.stop, 0.3, { mood: 0, signal: 0 }, "sine.inOut");
  if (has("chip-stop")) chip("chip-stop", saw.A.top, -150, -130, t.stop + 0.05, t.dive - 0.15);
  // "la tire": the dome sinks into its slot, the camera goes down with it — through the glass, the blade under the table
  // (0.7 s: the sound of it landing is laid at dive+0.7 — shorter only if the voice leaves less room)
  const sink = Math.min(0.7, 0.45 * (t.toyou - t.dive));
  const toside = t.dive + Math.max(sink + 0.15, 0.5 * (t.toyou - t.dive));
  st(t.dive, sink, { drop: 1 }, "power2.inOut");
  shot(t.dive, toside - t.dive, STOP_DOWN, "sine.inOut");
  // "sous la table": in profile — the top's edge, the blade under it, the block of aluminium in its teeth
  cut(toside, SET.SHOP, SIDE, { ...UNDER, table: 0.6, wire: 0, pawl: 1, bite: 1, drop: 1, blur: 0, turn: TURN, signal: 0, mood: 0, fy: 71, fz: -7, fs: 34 });
  shot(toside, t.toyou - toside, SIDE_IN, "sine.out");

  /* ══════════ « Toi ? Une entaille. Deux ou trois points de suture. » ══════════ */
  // your hand leaves the board, over the empty slot; on "entaille" the mark on your fingertip — the only signal left.
  // (`flinch` stops halfway: an open hand above the slot. At 1 it is a fist under the header, and the slot is out of the picture.)
  cut(t.toyou, SET.SHOP, YOU, { ...STAGED, ...UNLIT, blur: 0, dust: 0, signal: 0, wire: 0, pawl: 1, bite: 1, drop: 1, turn: TURN, mood: 0, fx: -10, fy: 100, fz: 14 });
  shot(t.toyou, t.toverdict - t.toyou, YOU_IN, "sine.inOut");
  const lift = Math.max(0.3, t.nick - t.toyou - 0.14); // it is up when the voice says "une entaille"…
  const up = t.toyou + 0.04 + lift + 0.02;
  st(t.toyou + 0.04, lift, { flinch: 0.4 }, "power2.out");
  st(up, t.toverdict - up - 0.1, { flinch: 0.52 }, "sine.out"); // …and goes on drawing back, slowly
  st(t.nick, 0.25, { nick: 1 }, "power2.out");
  if (has("chip-nick")) chip("chip-nick", shop.A.fingertip, -270, -165, t.stitches, t.toverdict - 0.15); // above the fingertip, clear of the knuckles
}
