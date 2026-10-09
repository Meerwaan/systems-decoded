// 03 · RÉPONSE — from "À 18 ampères…" to "…et l'éteint." (tozero → toverdict). The climax: the two traps, then the arc.
// Every cut is laid a few frames before its sentence, its pose is complete and so is its state ({ ...BENCHED, … } or
// { ...STAGED, … }): nothing is inherited.
//
// THE HEADER TELLS THE TWO TRAPS BY THEIR CLOCKS. `amps` and `load` move in the same call — but while the arc burns:
// there `load` is only what the picture draws of the path (it comes down so that the arc is the brightest thing).
//   · the slow trap — the film speeds up: at 18 A "Depuis" runs to the hour and stops there, the blade has held;
//     at 24 A it runs again, and the breaker trips before the hour is reached. No trip time is ever left standing
//     in the header: on the trip the current is 0, and so is the time it has lasted;
//   · the fast trap — the film slows down: from the instant the two wires touch, "Depuis" counts in hundredths of a
//     second, and stops on 0,02 when the coil's core strikes the latch. It stays there while the arc is put out —
//     and the current, in the thousands until the plates cut the arc, falls while they do, and is 0 on "l'éteint".
//
// Where the camera stands, and why:
//   · the slow trap is ONE move on the bench: in profile on the blade and the latch's bar, closing on the gap between
//     them while the header runs (the gap holds at 18 A, closes at 24), then back from that detail to everything the
//     blade is about to let go — the latch, the arm, the handle — and the trip plays in that frame, in a quarter of
//     a second. A short cut to the room: the heater and the kettle go out;
//   · the fast trap in cuts: inside the wall, the two wires lean and touch; the bench, the blade that has no time and
//     the coil that has — its field, its core thrown at the foot of the latch; then close on the contacts as they
//     part, and back with the arc as it runs into the chamber, is cut in slices, and dies.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, BENCHED, VIEW, RATING } from "./world.js";

/* ── the poses (found with `look`; what lies between two of them is arithmetic) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the blade and the latch's bar, in profile. The whole blade hangs between the label and the captions — its tip at
// y ≈ 690, its clamp at ≈ 1220: closer, the glowing blade runs behind the words — and the pair is pushed right of the
// middle: the coil, bright with the same current, is sent toward the left edge
const HOLD = { ...VIEW.blade, ty: 3.0, d: 22, shift: 40, side: -90 };
// …and as close as that allows: the gap between its tip and the bar (tip at y ≈ 625, clamp at ≈ 1235)
const GAP = { ...VIEW.blade, ty: 3.0, tz: 3.85, d: 19, shift: 70, side: -90 };
// what the blade lets go: the bar and its head, the arm and the contacts (top left), the handle (right)
const TRIP = { ...P, tx: 0, ty: 4.45, tz: 4.75, d: 24, az: -70, el: 8, shift: 160, side: 40 };
// the room, as act 1 showed it: the kettle (top right), the heater (bottom left), the strip between them
const ROOM = { ...P, tx: 115, ty: 60, tz: 40, d: 360, az: 36, el: 30, fov: 36, shift: 120, side: -30 };
// inside the wall, on the place where the two wires touch
// (pushed to the left, a little further than act 1 framed it for "il cuit": at side 255 the wire, white-hot here,
// ran under the first letter of the captions)
const FAULT0 = { ...VIEW.fault, side: 300 };
const FAULT1 = { ...FAULT0, d: 104 };
// the two traps in one frame: the blade (right), the coil lying under the chamber (left)
const TRAPS = { ...P, tx: 0, ty: 3.0, tz: 3.5, d: 27, az: -66, el: 9, shift: 110 };
// the coil, its core and the foot of the latch it is thrown at
const COIL0 = { ...VIEW.coil, tz: 2.8, d: 19, shift: 150 };
const COIL1 = { ...COIL0, d: 17.5 };
// the two contacts, from very close and in profile: from there the chamber's plates are dark blades seen on edge,
// not grey slabs (at VIEW.arc's three quarters they filled half the picture, pale, behind the captions)
const PADS0 = { ...VIEW.arc, ty: 5.9, tz: 2.7, d: 13, az: -80, el: 8 };
const PADS1 = { ...PADS0, d: 12 };
// the chamber, its two horns, its mouth: where the arc stands, then where it is cut. (VIEW.arc a step back and
// lower: the coil lies right under the chamber, bright with the same current — from here it hangs above the
// captions, its underside at y ≈ 1215, instead of shining through their words; the upper horn is at ≈ 550, under the label)
const CHAMBER = { ...VIEW.arc, ty: 4.3, d: 25, shift: 67 };

// the light: what it stands around, and how wide
const around = (pose, fs) => ({ fx: pose.tx, fy: pose.ty, fz: pose.tz, fs });
const L_ROOM = { fx: 110, fy: 50, fz: 40, fs: 160 };
const L_FAULT = { fx: 120, fy: 132, fz: 0, fs: 120 };

// the header: the current (and what the picture draws of it: over the rating, capped at the short circuit's 3)
const amps = (a) => ({ amps: a, load: Math.min(3, a / RATING) });
const HOUR = 3600;
const UNDER = 55 * 60; //  where the second run is when the breaker trips: under the hour (it is never left on screen)
const PACE = 30; //        seconds of story per second of film while the evening's overload lasts (as in act 1)
const SHORT = 3000; //     "des milliers d'ampères": illustrative
const BLINK = 0.02; //     seconds: the coil's bound

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, jolt, chip } = D;
  const t = D.times({
    tozero: "tozero", hold18: "hold18", norm: "norm", hour: "hour", a24: "a24", cut23: "cut23",
    blade: "zero:bilame", bend: "bend", trigger: "trigger", zeroEnd: "zero$",
    toreponse: "toreponse", short: "short", cc: "cc", kiloamps: "kiloamps",
    tocoil: "reponse:bilame-0.24", coil: "coil", yes: "reponse:si", fast: "fast", trip2: "trip2",
    toarc: "toarc", opens: "opens", arcon: "arcon", hotarc: "hotarc", runs: "arc:file", chamber: "chamber", plates: "plates", split: "split", out: "out",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the current (#hud-clock) or on the time it has lasted (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ══════════ THE SLOW TRAP ══════════ */

  /* ───────────── « À 18 ampères, la norme l'oblige à tenir au moins une heure. » ───────────── */
  // the bench, the breaker open: the blade and the bar of the latch in profile, the evening's current through them.
  // The header runs to the hour — the film speeds up — and the blade creeps, and stops short of the bar: it holds
  cut(t.tozero, SET.BENCH, HOLD, { ...BENCHED, ...amps(18), secs: 0, mood: 1, warm: 0.4, bend: 0.15, ...around(HOLD, 2.5) });
  // one slow push on the gap, for the two sentences of the standard
  const closing = span(t.tozero, t.blade - 0.2);
  shot(t.tozero, closing, GAP, "sine.inOut", HOLD.d);
  st(t.tozero, closing, around(GAP, 2), "sine.inOut");
  const anHour = span(t.hold18, t.hour + 0.1);
  st(t.hold18, anHour, { secs: HOUR }, "power1.in");
  st(t.hold18, anHour, { warm: 0.45, bend: 0.3 }, "sine.out");
  beat("#hud-count", t.hour + 0.1, 1.2);
  chip("chip-tenir", null, 96, 470, t.norm, t.a24 - 0.15);

  /* ───────────── « À 24… à couper, en moins d'une heure. » ───────────── */
  // on "24" the header climbs, its clock starts again from nothing; the blade glows like the wire and closes on the bar
  st(t.a24, 0.35, amps(24), "power2.out");
  beat("#hud-clock", t.a24 + 0.1);
  now(t.a24, { secs: 0 });
  st(t.a24 + 0.02, span(t.a24 + 0.02, t.trigger + 0.05), { secs: UNDER }, "power1.in");
  st(t.a24 + 0.1, span(t.a24 + 0.1, t.blade - 0.1), { warm: 1, bend: 0.7 }, "sine.inOut");
  chip("chip-couper", null, 96, 470, t.cut23 - 0.1, t.blade - 0.25);

  /* ───────────── « Le bilame se tord, et déclenche. » ───────────── */
  // back from the detail to what it holds: the latch's head under the arm's catch, the contacts, the handle. On
  // "tord" the tip reaches the bar. On "déclenche": the bar turns, its head lets the arm go, the spring opens the
  // contacts, the handle falls — in that order, in a quarter of a second. No current: the light turns
  const back = t.blade - 0.15;
  shot(back, span(back, t.trigger - 0.12), TRIP, "sine.inOut", GAP.d);
  st(back, span(back, t.trigger - 0.12), around(TRIP, 4.5), "sine.inOut");
  st(t.bend - 0.05, span(t.bend - 0.05, t.trigger - 0.08), { bend: 1 }, "sine.inOut");
  st(t.trigger, 0.07, { latch: 1 }, "power2.in");
  st(t.trigger + 0.05, 0.12, { gap: 1 }, "power2.out");
  st(t.trigger + 0.13, 0.12, { handle: 0 }, "power2.in");
  st(t.trigger + 0.05, 0.1, amps(0), "none");
  now(t.trigger + 0.06, { secs: 0 });
  st(t.trigger + 0.1, 0.35, { mood: 0 }, "sine.inOut");
  jolt(t.trigger + 0.05, 0.3, 0.35);
  // …and in the room, what was on that circuit goes out
  const toroom = Math.min(Math.max(t.trigger + 0.42, t.zeroEnd - 0.12), t.toreponse - 0.3);
  st(t.trigger + 0.3, span(t.trigger + 0.3, toroom), { warm: 0.85, bend: 0.92 }, "sine.inOut");
  cut(toroom, SET.ROOM, ROOM, { ...STAGED, you: 0, handle: 0, latch: 1, gap: 1, ...amps(0), secs: 0, hotwire: 0.35, mood: 0, ...L_ROOM });
  shot(toroom, span(toroom, t.toreponse), { d: ROOM.d * 0.96 }, "sine.out");
  st(toroom + 0.06, 0.22, { dark: 1 }, "power2.in");
  st(toroom, span(toroom, t.toreponse), { hotwire: 0.1 }, "sine.out");

  /* ══════════ THE FAST TRAP ══════════ */

  /* ───────────── « Deux fils se touchent : court-circuit. Des milliers d'ampères. » ───────────── */
  // inside the wall, the evening again. The two wires lean toward each other — and on "touchent" they touch: a light
  // that has a place. From that instant the film is in slow motion: the header's clock restarts in hundredths of a
  // second, the current climbs — and on "milliers" it is in the thousands
  cut(t.toreponse, SET.ROOM, FAULT0, { ...STAGED, ...L_FAULT });
  shot(t.toreponse, span(t.toreponse, t.tocoil), FAULT1, "sine.out", FAULT0.d);
  st(t.toreponse, span(t.toreponse, t.short), { secs: PACE * span(t.toreponse, t.short) }, "none");
  // (the wires' lean and their light are one number: they close in for a third of a second, the flash is on the word —
  // it swells for three frames, then settles: a light that has a place, not a veil)
  st(t.short - 0.3, 0.3, { fault: 0.2 }, "sine.in");
  st(t.short, 0.08, { fault: 1 }, "power2.out");
  st(t.short + 0.14, 0.6, { fault: 0.75 }, "sine.out");
  jolt(t.short + 0.03, 0.3, 0.4);
  now(t.short + 0.01, { secs: 0 });
  st(t.short + 0.02, span(t.short + 0.02, t.kiloamps), amps(900), "power1.in");
  st(t.kiloamps, 0.3, amps(SHORT), "power2.out");
  beat("#hud-clock", t.kiloamps + 0.1, 1.2);
  chip("chip-cc", null, 96, 470, t.cc, t.tocoil - 0.15);
  // the hundredths of a second: the count goes straight from the touch to the strike of the coil's core, where the
  // readout turns to 0,02 (one piece per shot: a cut says its own `secs`)
  const strike = t.trip2;
  const counted = (time) => 0.0145 * Math.min(1, (time - t.short) / span(t.short, strike - 0.06));
  st(t.short + 0.02, span(t.short + 0.02, t.tocoil), { secs: counted(t.tocoil) }, "none");

  /* ───────────── « Le bilame n'a pas le temps. La bobine, si : moins de deux centièmes de seconde. » ───────────── */
  // the bench, the short circuit through the open breaker: the blade, barely warm, has not moved. The camera leaves
  // it for the coil: on "bobine" its field shows — rings that travel toward the latch — and its core is thrown, in
  // slow motion, at the foot of the bar: it strikes, the bar turns. The header stops on 0,02 s
  cut(t.tocoil, SET.BENCH, TRAPS, { ...BENCHED, ...amps(SHORT), secs: counted(t.tocoil), mood: 1, warm: 0.2, bend: 0.1, ...around(TRAPS, 4) });
  st(t.tocoil, span(t.tocoil, strike - 0.06), { secs: counted(strike - 0.06) }, "none");
  st(strike - 0.06, 0.1, { secs: BLINK }, "none");
  beat("#hud-count", strike + 0.04, 1.2);
  const toCoil = span(t.tocoil, t.coil + 0.25);
  shot(t.tocoil, toCoil, COIL0, "sine.inOut", TRAPS.d);
  st(t.tocoil, toCoil, around(COIL0, 2.5), "sine.inOut");
  shot(t.coil + 0.25, span(t.coil + 0.25, t.toarc), COIL1, "sine.inOut", COIL0.d);
  st(t.coil, 0.3, { pull: 1 }, "sine.out");
  st(t.yes, span(t.yes, strike), { plunger: 1 }, "power1.in");
  st(strike, 0.08, { latch: 1 }, "power2.out");
  jolt(strike, 0.3, 0.35);
  chip("chip-002", null, 96, 470, t.fast - 0.45, t.toarc - 0.15);

  /* ══════════ THE ARC ══════════ */

  /* ───────────── « Les contacts s'écartent : un arc, à des milliers de degrés. » ───────────── */
  // close on the two contacts. They part — and the current does not stop: a spark holds between them from the first
  // instant. On "arc" it is an arc. (`load` comes down while it burns — the path was white-hot, and the arc must be
  // the brightest thing of the picture; the current still passes: the header stays in the thousands)
  // (the coil's rings are not drawn here: its work is done, and they would turn under the captions)
  cut(t.toarc, SET.BENCH, PADS0, { ...BENCHED, ...amps(SHORT), secs: BLINK, mood: 1, warm: 0.2, bend: 0.1, plunger: 1, latch: 1, ...around(PADS0, 2) });
  shot(t.toarc, span(t.toarc, t.runs - 0.1), PADS1, "sine.out", PADS0.d);
  st(t.opens - 0.03, 0.08, { arc: 0.4 }, "power2.out");
  st(t.opens, 0.6, { gap: 0.5 }, "power2.out");
  st(t.arcon, 0.08, { arc: 1 }, "power2.out");
  st(t.arcon + 0.05, 0.6, { load: 1.6 }, "sine.inOut");
  jolt(t.arcon, 0.3, 0.4);
  chip("chip-arc", null, 96, 470, t.hotarc - 0.5, t.runs - 0.2);

  /* ───────────── « Il file dans une chambre de plaques… qui le fractionne, et l'éteint. » ───────────── */
  // back with it: its foot leaves the contact for the horn, it runs along the two horns and stands, long, in the
  // mouth of the chamber ("il file"); the plates take it and cut it in slices ("fractionne"); it dies ("l'éteint"):
  // no current, the contacts wide open, the light turns — and the chamber that put it out glows veille
  // THE PICTURE OF THE FILM is the arc standing in the mouth (split ≈ 0.48): it is there when "plaques" is said and
  // holds through the voice's pause. Then the slices: every one of them is a little arc with its own voltage — they
  // choke the current, and the header says so: it falls through the thousands while "fractionne" is said, and is 0 on
  // "l'éteint". (The path stays signal to the end: dimmed to an ordinary current's ink, the pale coil and the blade
  // became the brightest things of the picture.)
  const running = span(t.runs - 0.1, t.plates + 0.25);
  shot(t.runs - 0.1, running, CHAMBER, "sine.inOut", PADS1.d);
  st(t.runs - 0.1, running, around({ tx: 0, ty: 5.0, tz: 2.2 }, 3), "sine.inOut");
  st(t.runs - 0.05, span(t.runs - 0.05, t.plates + 0.1), { split: 0.48 }, "sine.inOut");
  st(t.chamber, 0.2, { litChamber: 1 }, "sine.out");
  st(t.plates - 0.05, 0.3, { litChamber: 0 }, "sine.inOut");
  const slicing = span(t.split, t.out);
  st(t.split, Math.min(0.7, slicing), { split: 1 }, "power2.out");
  st(t.split, slicing, { amps: 1000 }, "sine.in");
  st(t.split, slicing, { load: 1.3 }, "sine.inOut");
  st(t.out, 0.16, { arc: 0, amps: 0, load: 0 }, "power2.in");
  st(t.out + 0.05, 0.3, { gap: 1 }, "power2.out");
  st(t.out + 0.1, 0.15, { handle: 0 }, "power2.in");
  st(t.out + 0.1, 0.35, { mood: 0 }, "sine.inOut");
  st(t.out + 0.15, 0.4, { litChamber: 1 }, "sine.out");
  chip("chip-eteint", null, 96, 470, t.out + 0.12, t.toverdict - 0.15);
}
