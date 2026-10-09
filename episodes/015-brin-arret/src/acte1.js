// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). The hook tells the whole dossier, then the scene
// lays the deck out: the aircraft, the sea at the end, the three wires, the hook one metre from its wire.
//
// THE SEA IS ALWAYS UP THE PICTURE. Every frame of this act looks the way the aircraft flies (from astern, or from
// its port quarter): the threat — the end of the deck, its signal glow — stays ahead, at the top or to the left.
//
// THE HOOK, one move and one cut. The first frame (POSE0 / FIRST) is low on the deck behind the tail, a little to
// port: the two nozzles, the hook hanging between them and dragging its sparks, the main wheels half a metre up,
// the film's wire lying veille across the strip ahead of them, the signal glow where the deck ends. And it is
// already moving: the aircraft rushes in for half a second, then time thickens (the film is in slow motion: from
// the first frame to "Alors…" the aircraft covers 8 metres, 0.14 s of its life).
//   the wheel    in under the left wing to the left main wheel as it hits ("touchent"): squat, smoke — and it
//                rolls over the wire
//   your hand    up through the wing's glass to the canopy, over your left shoulder: on "plein" the throttle goes
//   the nozzles  back along the fuselage to the first frame again — and now the two cores are hard and bright
//   the hook     down on the shoe dragging its sparks, the wire ahead of it ("un câble va t'arrêter")
//   the strip    back and up by ratio to the frame of the arrest ("en cent mètres")
//   its end      a dive along the strip to where it stops: the edge, the void, the glow ("Sauf si tu le rates…")
//   the wire     A CUT, on "ou s'il casse": the wire close, taut, the scene gone signal — the picture holds there
// THE SCENE, one move, one cut, one move. Back by ratio from the wire to the whole aircraft from its port quarter;
// ahead of it along the axis to the end of the deck ("finit dans la mer"); a cut back astern: the three wires
// across; a dive under the tail to the shoe, one metre from its wire, while the deck clears; and back out through
// the glass deck to the brake — VIEW.system, everything else gone dark, where act 2 cuts to the bench.
//
// The camera has no `ride` in this film: a pose written around the aircraft (for pos 0) is moved to where the
// aircraft will be when the shot lands — on(pose, time) — and a hold creeps along with it.
import { setAct } from "@kit/overlay.js";
import { SET, SIZE, VIEW } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0 };
// ON THE AIRCRAFT — written for pos 0 (the hook's tip at z = 0): on() moves them
// the first frame, written for pos 0 (POSE0 in world.js is REAR0 with tz − 100 × FIRST.pos) — and the same frame
// again, lower in the picture: the label stands over the nozzles
const REAR0 = { ...P, tx: -40, ty: 112, tz: -200, d: 1181, az: -7.5, el: -2.2, fov: 50, shift: 120, side: 50 };
const REAR = { ...REAR0, shift: 40 };
// the left main wheel from behind and outboard, level with its axle: the whole tyre, its leg, the wire beyond
const WHEEL = { ...P, tx: -98, ty: 45, tz: -556, d: 556.6, az: -26.9, el: 1.8, fov: 40, shift: 140 };
// your left hand on the throttle, over your left shoulder, through the canopy (never closer: a glass mannequin)
const COCK = { ...P, tx: -36, ty: 228, tz: -1066, d: 330, az: -40, el: 28, fov: 30, shift: 160, side: 60 };
// low behind the shoe, almost on the axis: the hook's arm down the middle, the wire across, a wheel on each side
const HOOKWIRE = { ...P, tx: -8, ty: 30, tz: -183, d: 601.6, az: -5, el: 3.8, fov: 46, shift: 80 };
// the whole aircraft from its port quarter, above: the delta, the two cores, the wire under it
const TAIL = { ...P, tx: 0, ty: 150, tz: -620, d: 4300, az: -24, el: 12, shift: 170, side: 110, drift: 0.3 };
// ON THE DECK
// the frame of the arrest, lowered: the end of the strip and its glow clear of the label
const CHASE = { ...VIEW.chase, shift: 130, drift: 0 };
// the end of the deck, low, almost on the axis: the edge across the picture, the glow on the water beyond, the
// horizon just under the label — and the same line of sight from further back, for the hook
const SEA = { ...P, tx: 0, ty: 0, tz: -11500, d: 1525.8, az: -4.8, el: 9.4, fov: 46, shift: 40, drift: 0.3 };
const END = { ...SEA, d: 2300, shift: 100, drift: 0 };
// the film's wire, close; and the same frame a step astern: the shoe comes into it, one metre short
const WIRE = VIEW.wire;
const SHOE = { ...VIEW.wire, tz: 40 };
// from astern, to port, low enough for the three wires to lie close together across the picture — and clear of
// the brake, which shows under the deck — the aircraft sitting on the middle one
const THREE = { ...P, tx: 0, ty: 0, tz: -250, d: 5200, az: -22, el: 9, shift: 150, drift: 0.3 };

// the light: what it stands around, and how wide
const L_CHASE = { fx: 0, fy: 0, fz: -3000, fs: 6000 };
const L_END = { fx: 0, fy: 0, fz: -11000, fs: 3000 };
const L_WIRE = { fx: 0, fy: 20, fz: 0, fs: 400 };
const L_THREE = { fx: 0, fy: 0, fz: 0, fs: 3000 };
const L_SYSTEM = { fx: 0, fy: -200, fz: 0, fs: SIZE }; // the bench's light (BENCHED), in the ship

// the aircraft's run, in metres of `pos`: a rush that dies in half a second, then slow motion
// (if a draft shows the deck's lattice strobing in the first half-second, lengthen TAU)
const RUSH = 3.9; //   metres of the opening rush…
const TAU = 0.7; //    …and its time constant, in seconds
const GAP = 1.05; //   metres between the shoe and its wire on "accrocher"

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: two moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    touch: "touch", porte: "accroche:porte-avions", throttle: "throttle", gaz: "accroche:gaz", wanted: "wanted", cable: "cable", hundred: "hundred",
    sauf: "sauf", breaks: "breaks", toscene: "toscene", v200: "v200", pont: "scene:pont", sea: "sea",
    travers: "scene:travers", three: "three", crosse: "crosse", catchone: "catchone", back: "back", tosystem: "tosystem",
  });
  const F = D.first;
  setAct(tl, 1, 0);
  const end = t.tosystem - 0.02; // everything has landed before act 2 cuts

  /* ── the aircraft's run, and the story's clock with it ── */
  const SLOW = (-GAP - F.pos - RUSH) / t.catchone; // metres of deck per second of film once the rush has died
  const posAt = (time) => F.pos + RUSH * (1 - Math.exp(-time / TAU)) + SLOW * time;
  st(0, end, { pos: posAt(end) }, (u) => (posAt(u * end) - F.pos) / (posAt(end) - F.pos));
  // the clock runs with the aircraft (T−0,15 s → the wire) but stops short of −0,05: the header prints one decimal,
  // and must not read "T+0,0" before the hook has the wire (drop the Math.min if main.js prints two decimals)
  const secAt = (time) => Math.min(-0.051, (F.sec * posAt(time)) / F.pos);
  st(0, end, { sec: secAt(end) }, (u) => (secAt(u * end) - F.sec) / (secAt(end) - F.sec));
  /** A pose written around the aircraft, moved to where the aircraft is at `time`. */
  const on = (pose, time) => ({ ...pose, tz: pose.tz - 100 * posAt(time) });
  /** Stay on the aircraft from `from` to `to`: creep in to `k` times the distance, and go with it. */
  const hold = (from, to, pose, k) => shot(from, to - from, { d: pose.d * k, tz: on(pose, to).tz }, "none");
  const light = (from, to, L, ease = "sine.inOut") => st(from, to - from, L, ease);
  const jetLight = (time) => ({ fx: 0, fy: 150, fz: -100 * posAt(time) - 400, fs: 900 });

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── A · "Tes roues touchent le pont du porte-avions." ───────────── */
  // the first second belongs to the first frame: the deck rushes in under the tail, the wheels come down their last
  // half-metre — and the camera is already on its way in under the left wing, to the wheel that hits
  const atWheel = t.touch + 0.22;
  shot(0, atWheel, on(WHEEL, atWheel), glide(1.3, 0.2));
  light(0, atWheel, { fx: -128, fy: 60, fz: -100 * posAt(atWheel) - 556, fs: 500 }, "sine.out");
  st(0, t.touch, { alt: 0 }, "none"); // no flare on a carrier: it comes down at a steady rate
  st(t.touch, 0.12, { squat: 1 }, "power2.out");
  st(t.touch + 0.12, 0.6, { squat: 0.4 }, "sine.inOut");
  st(t.touch, 0.1, { puff: 0.85 }, "power2.out");
  st(t.touch + 0.1, 1.4, { puff: 0 }, "power1.in");
  st(t.touch, 0.3, { nose: 3 }, "power2.out");
  st(t.touch + 0.3, 1.6, { nose: 0 }, "sine.inOut"); // …and the nose wheels come down

  // it stays on the wheel while the voice says the deck: the tyre rolls over the film's wire (≈ 1.2 s)
  const rise = t.porte + 0.1;
  hold(atWheel, rise, WHEEL, 0.95);

  /* ───────────── "Et là… tu mets plein gaz." ───────────── */
  // up along the fuselage, through the wing's glass, to the canopy: your left hand on the throttle. On "plein" it
  // goes forward — most of the way: the nozzles will have the rest
  const atCock = t.throttle - 0.35;
  const leave = t.gaz + 0.1;
  shot(rise, atCock - rise, on(COCK, atCock), "sine.inOut", WHEEL.d * 0.95);
  light(rise, atCock, { fx: -36, fy: 230, fz: -100 * posAt(atCock) - 1060, fs: 300 });
  hold(atCock, leave, COCK, 0.93);
  st(t.throttle + 0.05, 0.35, { gas: 0.9 }, "power2.out");
  // back along the fuselage to the frame of the first picture: the two cores, hard and bright now
  const atRear = t.wanted + 0.28;
  const toHook = t.cable - 0.2;
  shot(leave, atRear - leave, on(REAR, atRear), "sine.inOut", COCK.d * 0.93);
  light(leave, atRear, jetLight(atRear));
  st(atRear - 0.3, 0.4, { gas: 1 }, "sine.out");
  hold(atRear, toHook, REAR, 0.97);
  chip("chip-gaz", null, 96, 470, t.throttle + 0.3, toHook + 0.1);

  /* ───────────── B · "C'est voulu : un câble va t'arrêter," ───────────── */
  // down from the nozzles on the shoe that drags and, ahead of it, THE wire: it answers its word
  const atHook = t.cable + 0.36;
  const toChase = t.hundred - 0.16;
  shot(toHook, atHook - toHook, on(HOOKWIRE, atHook), "sine.inOut");
  light(toHook, atHook, { fx: 0, fy: 30, fz: -100 * posAt(atHook) - 150, fs: 400 });
  st(t.cable, 0.25, { tense: 0.85 }, "power2.out");
  st(t.cable + 0.25, 0.5, { tense: 0.5 }, "sine.inOut");
  hold(atHook, toChase, HOOKWIRE, 0.95);

  /* ───────────── "en cent mètres." ───────────── */
  // back and up, by ratio, to the frame of the arrest: the strip runs up the picture to its end
  const atChase = t.hundred + 0.84;
  shot(toChase, atChase - toChase, CHASE, "sine.inOut", HOOKWIRE.d * 0.95);
  light(toChase, atChase, L_CHASE);
  shot(atChase, t.sauf - atChase, { d: CHASE.d * 0.985 }, "none");
  chip("chip-100", null, 96, 470, t.hundred + 0.12, t.sauf + 0.08);

  /* ───────────── C · "Sauf si tu le rates…" ───────────── */
  // …then you go where the strip goes: a dive along it, by ratio, to its end — the edge, the void, the glow
  const atEnd = t.breaks - 0.27;
  const toWire = t.breaks - 0.1;
  shot(t.sauf, atEnd - t.sauf, END, "sine.inOut", CHASE.d * 0.985);
  light(t.sauf, atEnd, L_END);
  shot(atEnd, toWire - atEnd, { d: END.d * 0.97 }, "none");

  /* ───────────── "ou s'il casse." ───────────── */
  // the cut: the wire, close. On "casse" it goes taut and bright, the scene turns signal — and the picture holds
  // (the break itself is the end of the film: `parted` stays at 0)
  cut(toWire, SET.DECK, WIRE, { tense: 0.5, ...L_WIRE });
  shot(toWire, t.toscene - toWire, { d: WIRE.d * 0.9 }, "sine.out");
  st(t.breaks + 0.15, 0.22, { tense: 1 }, "power2.out");
  st(t.breaks + 0.15, 0.3, { gel: 0.22 }, "sine.out");
  st(t.toscene - 0.25, 0.25, { gel: 0 }, "sine.in");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "Ton Rafale arrive à plus de 200 kilomètres-heure." ───────────── */
  // back from the wire, by ratio, to the whole aircraft from its port quarter; the header's speed answers "200"
  const atTail = t.v200 - 0.06;
  const toSea = t.pont - 0.34;
  shot(t.toscene, atTail - t.toscene, on(TAIL, atTail), "sine.inOut", WIRE.d * 0.9);
  light(t.toscene, atTail, jetLight(atTail));
  st(t.toscene, 0.4, { tense: 0.5 }, "sine.inOut");
  hold(atTail, toSea, TAIL, 0.96);
  tl.to("#hud-count", { scale: 1.2, duration: 0.1, ease: "power2.out", transformOrigin: "100% 50%" }, t.v200);
  tl.to("#hud-count", { scale: 1, duration: 0.4, ease: "power2.out" }, t.v200 + 0.1);

  /* ───────────── "Le pont, lui, finit dans la mer." ───────────── */
  // ahead of the aircraft, along the axis, down to the end of the deck: the edge across the picture, the glow
  const atSea = t.sea + 0.04;
  const toThree = t.travers - 0.16;
  shot(toSea, atSea - toSea, SEA, "sine.inOut", TAIL.d * 0.96);
  light(toSea, atSea, L_END);
  shot(atSea, toThree - atSea, { d: SEA.d * 0.9 }, "sine.out");
  chip("chip-mer", null, 96, 470, t.sea - 0.15, toThree - 0.14);

  /* ───────────── "En travers : trois câbles." ───────────── */
  // the cut, back astern: the aircraft on the film's wire, veille across the picture; the ship is a ghost already
  // (its paint and its lattice would drown two thin cables). On "trois" the two others come: one ahead, one astern
  const dive = t.crosse - 0.1;
  cut(toThree, SET.DECK, THREE, { shell: 0.3, others: 0, tense: 0.6, ...L_THREE });
  st(t.three - 0.03, 0.25, { others: 1 }, "power2.out");
  shot(toThree, dive - toThree, { d: THREE.d * 0.95 }, "sine.out");
  chip("chip-3", null, 96, 470, t.three, dive - 0.04);

  /* ───────────── "Ta crosse doit en accrocher un." ───────────── */
  // a dive by ratio under the tail, to the shoe and the film's wire: one metre between them. The deck clears
  const atShoe = t.catchone + 0.3;
  const out = t.back - 0.1;
  shot(dive, atShoe - dive, SHOE, "sine.inOut", THREE.d * 0.95);
  light(dive, atShoe, { ...L_WIRE, fz: SHOE.tz });
  st(t.crosse + 0.2, 1.2, { under: 1 }, "sine.inOut");
  shot(atShoe, out - atShoe, { d: SHOE.d * 0.96 }, "none");

  /* ───────────── the silence before "Alors…" ───────────── */
  // back out, by ratio, through the glass deck: the brake under the wire. The aircraft, the sea, the two other wires
  // go; the ship is a ghost; the scene turns veille at the very end — VIEW.system, where act 2 cuts to the bench
  shot(out, end - out, VIEW.system, "sine.inOut", SHOE.d * 0.96);
  light(out, end, L_SYSTEM);
  st(out, 0.5, { jet: 0, scrape: 0 }, "sine.in");
  st(out, 0.7, { sea: 0, others: 0, shell: 0.25, litBrin: 0, tense: 0 }, "sine.inOut");
  st(end - 0.3, 0.3, { mood: 0 }, "sine.inOut");
}
