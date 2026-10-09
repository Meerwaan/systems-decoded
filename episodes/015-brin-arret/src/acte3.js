// 03 · RÉPONSE — from "Tes roues touchent." to the bolter (tozero → toverdict). The climax, in cuts, in slow motion.
// Each cut is laid a few frames before its sentence, its pose is complete and so is its state ({ ...STAGED, … }):
// nothing is inherited.
//
// THE HEADER TELLS ONE STORY. `sec` is the story's clock, `kmh` the aircraft's speed, and `pos` / `pull` / `ram`
// follow them: before the wire the aircraft flies 60 m a second (−0.15 s → 0, −9 m → 0); once the hook has the wire
// it is ONE even braking, 220 km/h to nothing in 2.9 s and 90 m — the plan's table to within a metre (posAt, kmhAt).
// The film's own slow motion changes from shot to shot (S below says where the story stands at each cut); inside a
// shot the clock runs straight and the aircraft slows the way the brake slows it (`glide`).
//
// Where the camera stands, and why:
//   · the hook's own picture again, twice as close: the left wheel hits the deck;
//   · what your hand has just asked for: the two nozzles from astern, going hard on the word;
//   · the shoe dragging its sparks, three-quarter rear, the camera riding with it — the wire comes to it, the
//     throat takes it, a head of light leaves along both legs;
//   · from astern and above, the camera standing still: the aircraft goes away up the picture and the wire's two
//     legs swing from level to a long V;
//   · under the deck, ONE move: the crosshead pushes the ram into the cylinder, then the camera runs along the
//     cylinder — the way the oil is pushed — to the valve's throat, and closes in while the oil turns signal;
//   · the stop, from astern and above, inside the V: its two legs come out of the bottom corners to the hook, the
//     end of the deck and the sea just beyond the nose;
//   · the same instant replayed: the shoe bounces OVER the wire, then the film lets go and the camera watches the
//     aircraft leave over the third one;
//   · the chase, from astern (seen from ahead the Rafale is pale: nothing signal in the frame; from astern it has
//     its two hard cores and the sea it is running at): the edge of the deck comes down the picture, the wheels
//     leave it, the aircraft climbs over the water.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, ENGINE, RAFALE, RUNOUT } from "./world.js";

const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const RAD = 180 / Math.PI;
/** Where the hook's tip is along the deck, cm. */
const Z = (pos) => -100 * pos;
/** The pose of a camera standing at `from`, looking at `to`. */
const aim = (from, to, rest = {}) => {
  const v = [from[0] - to[0], from[1] - to[1], from[2] - to[2]];
  const d = Math.hypot(v[0], v[1], v[2]);
  return { ...P, tx: to[0], ty: to[1], tz: to[2], d, az: Math.atan2(v[0], v[2]) * RAD, el: Math.asin(v[1] / d) * RAD, ...rest };
};

/* ── the poses (worked out on the projection, then judged with `look`: docs/journal/015-acte3.md) ── */
// the left main wheel from ahead and to port, at deck level: POSE0, twice as close. The camera rides with the wheel
// and stands AHEAD of the film's wire all along (astern of it, the wire would sweep through the lens)
const WHEEL = (pos, d) => ({ ...P, fov: 46, tx: -128, ty: 45, tz: Z(pos) - RAFALE.wheels, d, az: -138, el: 2, shift: -20 });
// the two nozzles from astern, the hook hanging under them
const NOZZLES = (pos, d) => ({ ...P, fov: 30, tx: 0, ty: 185, tz: Z(pos) + 110, d, az: -20, el: 12, shift: 165 });
// the shoe on the deck, three-quarter rear: its arm leaves by the left edge under the header, the sparks fly right
const SHOE = (pos) => ({ ...P, fov: 30, tx: 0, ty: 45, tz: Z(pos) + 20, d: 560, az: -58, el: 8, shift: 120 });
// from astern and above, standing still 17 m behind the wire's line
const BEHIND = [-300, 1050, 1750];
const UNREEL = (pos, ahead, ty) => aim(BEHIND, [0, ty, Z(pos) - ahead], { fov: 44, shift: 150 });
// under the deck: the crosshead (right), the ram, the glass cylinder (left)…
const RAM0 = { ...P, tx: 380, ty: ENGINE.y, tz: 0, d: 2600, az: -24, el: 10, shift: 160 };
const RAM1 = { ...RAM0, tx: 360, d: 2450 };
// …and the valve: the vessel (left), the throat and its needle, the wheel of the setting (top right). The tackle's
// upper cables run 131 cm above the axis on the picture: pushed down until they clear the header (y ≈ 430), and
// never closer than d 1050 (closer, they climb behind its labels)
const VALVE0 = { ...P, tx: -350, ty: ENGINE.y, tz: 0, d: 1150, az: -30, el: 12, shift: 80 };
const VALVE1 = { ...VALVE0, tx: -335, d: 1050, shift: 40 };
// the stop: high astern, then down into the V (written for pos 81 and pos 90)
const STOP0 = aim([-150, 2300, -1800], [0, 0, -8300], { fov: 34, shift: 80 });
const STOP1 = aim([-150, 1300, -5200], [0, 100, -9300], { fov: 34, shift: 60 });
// the bolter: the shoe again, a step back (its whole arm in the frame, under the header; the nozzles out by the right edge)…
const SKIP = (pos) => ({ ...P, fov: 30, tx: 0, ty: 45, tz: Z(pos) - 40, d: 900, az: -58, el: 9, shift: 20, side: 60 });
// …and from where that camera stands when the hook is over the wire, the aircraft gone 24 m further
const LEFT = 24;
const SKIP_CAM = (() => {
  const s = SKIP(0);
  const ce = Math.cos(s.el / RAD);
  return [s.tx + s.d * Math.sin(s.az / RAD) * ce, s.ty + s.d * Math.sin(s.el / RAD), s.tz + s.d * Math.cos(s.az / RAD) * ce];
})();
const LEAVE = aim(SKIP_CAM, [0, 150, Z(LEFT) + 100], { fov: 30, shift: 60 });
// the chase: low astern of the nozzles, `back` cm behind them, `h` above the deck
const CHASE = (pos, back, h) => aim([-300, h, Z(pos) - RAFALE.tail + back], [0, 190, Z(pos) - RAFALE.tail - 300], { fov: 36, shift: 70 });
// …and where it ends, 7 m short of the edge, looking up at the aircraft climbing away (pos 150, 9 m up)
const GONE = aim([-300, 480, -10790], [0, 1050, Z(150) - RAFALE.tail - 300], { fov: 36, shift: 110 });

/** The light stands around the aircraft. */
const lit = (pos, alt = 0, fs = 900) => ({ fx: 0, fy: 150 + 100 * alt, fz: Z(pos) - 400, fs });

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);
/** An ease for something that leaves at speed v0 and arrives at speed v1 (any unit: only their ratio counts). */
const glide = (v0, v1) => (v0 + v1 < 1e-6 ? (u) => u : (u) => (v0 * u + ((v1 - v0) * u * u) / 2) / ((v0 + v1) / 2));

/* ── the story's numbers ── */
const STOP = 2.9; //  seconds from the wire to the stop
const V0 = 220; //    km/h on the wire
const kmhAt = (sec) => V0 * (1 - Math.max(0, sec) / STOP);
const posAt = (sec) => (sec < 0 ? 60 * sec : RUNOUT * (1 - (1 - sec / STOP) ** 2));
/** The aircraft on its wire at `sec`. */
const riding = (sec) => {
  const pos = posAt(sec);
  return { sec, kmh: kmhAt(sec), pos, pull: pos, ram: pos / RUNOUT, held: 1, tense: 1, alt: 0, nose: -1.5, squat: 0.7, gas: 1, litBrin: 1 };
};
// where the story stands when the film cuts (seconds from the wire)
const S = { caught: 0.04, ram: 0.45, resist: 1, arret: 2 };

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, chip } = D;
  const t = D.times({
    tozero: "tozero", wheels: "wheels", togas: "zero:plein-0.15", gas: "gas", tohook: "zero:ta-0.12", scrape: "scrape", trigger: "trigger",
    toreponse: "toreponse", toram: "reponse:tire-0.12", piston: "reponse:piston#2-0.26", push: "push", valve: "valve", resist: "resist", eats: "eats", heats: "heats",
    toarret: "toarret", stopped: "stopped",
    tobolter: "tobolter", missed: "missed", topower: "bolter:tu-0.12", edge: "edge", fly: "fly",
    toverdict: "toverdict",
  });
  // (whatever the voice does to them, these stay in order)
  t.togas = Math.max(t.wheels + 0.3, Math.min(t.togas, t.gas - 0.03));
  t.tohook = Math.max(t.gas + 0.4, Math.min(t.tohook, t.scrape - 0.1));
  t.toram = Math.max(t.toreponse + 0.6, t.toram);
  t.piston = Math.max(t.toram + 0.6, Math.min(t.piston, t.push - 0.3));
  t.topower = Math.max(t.missed + 0.7, Math.min(t.topower, t.edge - 0.8));
  setAct(tl, 3, t.tozero);

  /** The aircraft on its wire from one instant of the story to another, between two instants of the film. Returns its ease. */
  const run = (from, to, s0, s1) => {
    const dur = span(from, to);
    const pos = posAt(s1);
    const ease = glide(kmhAt(s0), kmhAt(s1));
    st(from, dur, { sec: s1, kmh: kmhAt(s1) }, "none");
    st(from, dur, { pos, pull: pos, ram: pos / RUNOUT }, ease);
    return ease;
  };
  /** A readout of the header answers. */
  const beat = (sel, at) => {
    tl.to(sel, { scale: 1.2, duration: 0.1, ease: "power2.out", transformOrigin: "100% 50%" }, at);
    tl.to(sel, { scale: 1, duration: 0.4, ease: "power2.out" }, at + 0.1);
  };

  /* ── before the wire: 9 m and 0.15 s, straight, from the first cut to « accroche » ── */
  const secAt = (time) => -0.15 * (1 - (time - t.tozero) / span(t.tozero, t.trigger));
  const [sA, sB] = [secAt(t.togas), secAt(t.tohook)];
  const [pA, pB] = [posAt(sA), posAt(sB)];

  /* ══════════ « Tes roues touchent. » ══════════ */
  // the hook's picture, twice as close: the left wheel comes down at an even rate and hits on the word — the leg
  // gives, the tyre smokes, the nose starts to fall
  const hit = t.wheels + 0.05;
  cut(t.tozero, SET.DECK, WHEEL(-9, 640), { ...STAGED, fx: -128, fy: 40, fz: Z(-9) - RAFALE.wheels, fs: 350 });
  shot(t.tozero, span(t.tozero, t.togas), WHEEL(pA, 600), "none");
  st(t.tozero, span(t.tozero, t.togas), { sec: sA, pos: pA, fz: Z(pA) - RAFALE.wheels }, "none");
  st(t.tozero, span(t.tozero, hit), { alt: 0, nose: 7 }, "none");
  st(hit, 0.07, { squat: 1 }, "power2.out");
  st(hit + 0.07, Math.min(0.4, span(hit + 0.07, t.togas) - 0.02), { squat: 0.45 }, "sine.inOut");
  st(hit, 0.12, { puff: 1 }, "power2.out");
  st(hit + 0.07, Math.min(0.45, span(hit + 0.07, t.togas) - 0.02), { nose: 3 }, "sine.inOut");
  jolt(hit, 0.3, 0.4);

  /* ══════════ « Plein gaz. » ══════════ */
  // the hook showed your hand; here, what it asks for: the two throats go hard and bright on the word
  cut(t.togas, SET.DECK, NOZZLES(pA, 760), { ...STAGED, sec: sA, pos: pA, alt: 0, nose: 3, squat: 0.45, puff: 0.6, scrape: 0.5, fx: 0, fy: 190, fz: Z(pA) + 100, fs: 400 });
  shot(t.togas, span(t.togas, t.tohook), NOZZLES(pB, 700), "none");
  st(t.togas, span(t.togas, t.tohook), { sec: sB, pos: pB, fz: Z(pB) + 100 }, "none");
  st(t.gas + 0.05, 0.28, { gas: 1 }, "power2.out");
  st(t.togas, 0.6, { nose: 1, squat: 0.25, puff: 0 }, "sine.out");

  /* ══════════ « Ta crosse traîne sur le pont… et accroche. » ══════════ */
  // the shoe drags its sparks, the camera riding with it; the film's wire comes across the deck to it. On the word
  // the throat takes it: the sparks stop, the wire lights, a head of light leaves along both legs, the nose dips
  // and the legs give — the aircraft is HELD. The clock starts
  cut(t.tohook, SET.DECK, SHOE(pB), { ...STAGED, sec: sB, pos: pB, alt: 0, nose: 1, squat: 0.25, gas: 1, scrape: 0.7, litBrin: 1, fx: 0, fy: 30, fz: Z(pB), fs: 300 });
  shot(t.tohook, span(t.tohook, t.trigger), SHOE(0), "none");
  st(t.tohook, span(t.tohook, t.trigger), { sec: 0, pos: 0, fz: 0 }, "none");
  st(t.scrape, 0.3, { scrape: 1 }, "sine.out");
  st(t.trigger, 0.04, { held: 1 }, "none");
  st(t.trigger, 0.1, { tense: 1 }, "power2.out");
  st(t.trigger, 0.14, { scrape: 0 }, "power2.out");
  st(t.trigger + 0.02, 0.3, { nose: -1.5, squat: 0.7 }, "power2.out");
  st(t.trigger + 0.02, span(t.trigger + 0.02, t.toreponse), { wave: 0.3 }, "power1.out");
  jolt(t.trigger, 0.45, 0.5);
  const caught = run(t.trigger, t.toreponse, 0, S.caught);
  shot(t.trigger, span(t.trigger, t.toreponse), SHOE(posAt(S.caught)), caught);
  st(t.trigger, span(t.trigger, t.toreponse), { fz: Z(posAt(S.caught)) }, caught);
  beat("#hud-clock", t.trigger);
  chip("chip-pris", null, 150, 470, t.trigger + 0.12, t.toreponse - 0.14);

  /* ══════════ « Le brin se déroule, » ══════════ */
  // from astern and above, the camera standing still: the aircraft goes away up the picture, the wire's two legs
  // swing from level to a long V behind it
  const p0 = posAt(S.caught);
  cut(t.toreponse, SET.DECK, UNREEL(p0, 450, 120), { ...STAGED, ...riding(S.caught), ...lit(p0, 0, 1300) });
  const unreel = run(t.toreponse, t.toram, S.caught, S.ram);
  shot(t.toreponse, span(t.toreponse, t.toram), UNREEL(posAt(S.ram), -280, 60), unreel);
  st(t.toreponse, span(t.toreponse, t.toram), { fz: Z(posAt(S.ram)) - 400 }, unreel);

  /* ══════════ « tire le piston. Le piston chasse l'huile par une vanne étroite. » ══════════ */
  // under the deck, the cylinder turned to glass: the pull arrives through the tackle (the head of light), the
  // crosshead comes in and the ram with it. Then the camera goes the way the oil is pushed, along the cylinder to
  // the valve: on « chasse » the jet shows in its throat
  cut(t.toram, SET.DECK, RAM0, { ...STAGED, ...riding(S.ram), under: 1, shell: 0.3, sea: 0.2, xray: 1, wave: 0.4, fx: 300, fy: ENGINE.y, fz: 0, fs: 600 });
  run(t.toram, t.resist, S.ram, S.resist);
  shot(t.toram, span(t.toram, t.piston), RAM1, "sine.out", RAM0.d);
  st(t.toram, span(t.toram, t.piston), { wave: 0.93 }, "sine.inOut");
  st(t.piston, 0.2, { wave: 1 }, "none");
  shot(t.piston, span(t.piston, t.valve), VALVE0, "sine.inOut", RAM1.d);
  // (the cables have said what they had to say: they dim, the oil is the subject — and the captions lie over them)
  st(t.piston, span(t.piston, t.valve), { fx: -350, fs: 500, tense: 0.35 }, "sine.inOut");
  // (veille, the oil is the brightest thing of the film: the jet is held back until it turns signal)
  st(t.push + 0.1, 0.3, { flow: 0.6 }, "power2.out");

  /* ══════════ « L'huile résiste… et ta vitesse devient de la chaleur. » ══════════ */
  // closer: the oil turns signal while the header's speed empties (through the banded part of the scale in a
  // third of a second, then slowly)
  shot(t.resist, span(t.resist, t.heats + 0.3), VALVE1, "sine.inOut", VALVE0.d);
  run(t.resist, t.toarret, S.resist, S.arret);
  st(t.resist + 0.1, 0.35, { heat: 0.5 }, "power2.out");
  st(t.resist + 0.1, 0.6, { flow: 1 }, "sine.out");
  st(t.resist + 0.45, span(t.resist + 0.45, t.toarret), { heat: 0.9 }, "sine.inOut");
  beat("#hud-count", t.eats + 0.1);
  chip("chip-chaleur", null, 96, 470, t.heats + 0.1, t.toarret - 0.15);

  /* ══════════ « Deux à trois secondes. Une centaine de mètres. Tu es arrêté. » ══════════ */
  // from astern and above, down into the V: its two legs run from the bottom corners to the hook, the end of the
  // deck and the sea just beyond the nose. On « arrêté » the aircraft rocks back on its wire, the light turns, the
  // clock stops and goes veille
  const stop = t.stopped + 0.05;
  cut(t.toarret, SET.DECK, STOP0, { ...STAGED, ...riding(S.arret), flow: 1, heat: 0.9, ...lit(posAt(S.arret), 0, 1500) });
  run(t.toarret, stop, S.arret, STOP);
  shot(t.toarret, span(t.toarret, stop), STOP1, "sine.inOut", STOP0.d);
  st(t.toarret, span(t.toarret, stop), { fz: Z(RUNOUT) - 400 }, "sine.inOut");
  st(stop - 0.05, 0.3, { nose: 0.8, squat: 0.15 }, "power2.out");
  st(stop + 0.25, Math.min(0.5, span(stop + 0.25, t.tobolter) - 0.03), { nose: 0 }, "sine.inOut");
  st(stop, 0.4, { flow: 0 }, "sine.out");
  st(stop, 0.1, { mood: 0 }, "none");
  tl.to("#hud-clock", { color: VEILLE, duration: 0.12 }, stop);
  beat("#hud-clock", stop);
  chip("chip-arret", null, 96, 470, stop + 0.05, t.tobolter - 0.15);

  /* ══════════ « Et si ta crosse les rate, tous les trois ? » ══════════ */
  // the same instant, replayed: the shoe hits the deck short of the wire and bounces OVER it (on « rate »). Then
  // the film lets go: the camera stays where it is and watches the aircraft leave, over the third wire
  const miss = t.missed + 0.1;
  const slow = span(t.tobolter, miss);
  const fast = span(miss, t.topower);
  const away = glide(3 / slow, (2 * LEFT) / fast - 3 / slow);
  cut(t.tobolter, SET.DECK, SKIP(-3), { ...STAGED, sec: -0.05, pos: -3, alt: 0, nose: 1, squat: 0.25, gas: 1, hook: 0.9, litBrin: 1, fx: 0, fy: 40, fz: Z(-3), fs: 400 });
  tl.set("#hud-clock", { color: INK }, t.tobolter);
  shot(t.tobolter, slow, SKIP(0), "none");
  st(t.tobolter, slow, { sec: 0, pos: 0, fz: 0 }, "none");
  st(t.tobolter, 0.36 * slow, { hook: 1 }, "power1.in");
  st(t.tobolter + 0.36 * slow, 0.05, { scrape: 1 }, "none");
  st(t.tobolter + 0.36 * slow + 0.05, 0.3, { scrape: 0 }, "power2.out");
  st(t.tobolter + 0.36 * slow, 0.5 * slow, { hook: 0.66 }, "power2.out");
  shot(miss, fast, LEAVE, away);
  st(miss, fast, { pos: LEFT, sec: LEFT / 61, fy: 150, fz: Z(LEFT) - 300, fs: 900 }, away);
  st(miss + 0.05, 0.25 * fast, { hook: 1 }, "power1.in");
  st(miss + 0.05 + 0.25 * fast, 0.05, { scrape: 1 }, "none");
  st(miss + 0.1 + 0.25 * fast, 0.25, { scrape: 0 }, "power2.out");
  st(miss + 0.05 + 0.25 * fast, 0.22 * fast, { hook: 0.76 }, "power2.out");
  st(miss + 0.74 * fast, 0.2 * fast, { hook: 1 }, "power1.in");
  st(miss + 0.94 * fast, 0.05, { scrape: 0.6 }, "none");
  chip("chip-bolter", null, 470, 470, t.missed + 0.05, t.topower - 0.14);

  /* ══════════ « Tu es déjà à pleine puissance : au bout du pont… tu redécolles. » ══════════ */
  // low astern of the two cores, the shoe dragging its sparks: the aircraft runs at the end of the deck and the
  // sea, the camera a little slower than it — the edge comes down the picture. On « redécolles » the wheels leave
  // the deck just short of the edge and the aircraft climbs over the water; the light turns
  const [P1, P2] = [104, 150];
  cut(t.topower, SET.DECK, CHASE(LEFT, 2100, 520), { ...STAGED, sec: LEFT / 61, kmh: 222, pos: LEFT, alt: 0, nose: 0.5, squat: 0.2, gas: 1, scrape: 0.6, ...lit(LEFT, 0, 1000) });
  shot(t.topower, span(t.topower, t.fly), CHASE(P1, 2900, 620), "none");
  st(t.topower, span(t.topower, t.fly), { pos: P1, sec: P1 / 62, kmh: 231, fz: Z(P1) - 400 }, "none");
  st(t.edge, span(t.edge, t.fly + 0.1), { nose: 8 }, "sine.inOut");
  const climb = span(t.fly, t.toverdict);
  shot(t.fly, climb, GONE, "none");
  st(t.fly, climb, { pos: P2, sec: P2 / 62, kmh: 235, fz: Z(P2) - 400 }, "none");
  st(t.fly, climb, { alt: 9, fy: 1050 }, (u) => Math.pow(u, 1.5));
  st(t.fly, 0.15, { scrape: 0, squat: 0 }, "power2.out");
  st(t.fly + 0.1, 0.6, { nose: 11 }, "sine.out");
  st(t.fly + 0.1, 0.12, { mood: 0 }, "none");
  chip("chip-repart", null, 96, 470, t.fly + 0.14, t.toverdict - 0.14);
}
