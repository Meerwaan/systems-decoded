// 03 · RÉPONSE — from « Le propulseur frappe. » to « …et tu touches le sol. Vivant. » (tozero → toverdict). The climax:
// the failure of act 1 played again — with the system. In cuts, one shot per breath: the voice is hacked into short
// sentences, each picture reads in half a second. Every cut falls a few frames BEFORE the first word of its sentence.
//
// TWO KINDS OF NUMBERS here (like 025). The story's — clock, alt, flown, airspeed, tilt, apart, sep, bad, impact, fire,
// free, press, heat, chute, retro, mood — run in ONE chain across the act, on the words: a cut never sets one while a
// tween moves it (the only jumps are the ellipse of the descent, on purpose: 35 → 8 km on the parachute's cut, 15 → 4 m
// on the ground's). The picture's — set, skin, shell, the light — are set by each cut, complete.
//
// WHAT THE SCREEN CLAIMS (docs/faits/026-soyouz-ms10.md): nobody presses anything, sensors that feel the turn give the
// order; ≈ 3 s after the strike the four small motors fire and tear the head off the rocket; 93 km at the top; nearly
// seven times your weight on the way down; a parachute, a last push, the ground. No speed, no thrust, no burn time, no
// g during the motors' push (« Plaqué » has no figure), the rocket never explodes on screen: it falls away, out of frame.
//
// THE HEADER: `clock` −0,4 → 0 on « frappe », then 0 → 3,0 in a straight line to « tirent » (the story at its own
// second, slowed down), held; `alt` 50 → 93 on « kilomètres », down to 35, then the ellipse: 8 under the canopy, 0 on
// « touches » (veille: main.js).
//
// Where the camera stands, and why:
//   · the strike in profile, wider than act 1's close-up (at 13 m VIEW.strike saw only the core's edge): D's signal cone
//     rising to its nose, the flash where it touches, the core's two edges;
//   · the whole rocket from az ≈ 0, where its turn lies in the picture plane; the camera's aim turns WITH the rocket's
//     middle, so that it turns about its middle (it pivots about you, at its top) and leaves its trail behind;
//   · inside, twice on purpose, the same picture — nobody presses anything · pressed into the seat — the camera bolted to
//     the stack while the head is on it (rideTurn): the cabin as at tilt 0, the sky turned behind it;
//   · the console from under it, over your shoulder: АВАРИЯ in big letters, lit on « avarie »;
//   · the head and its four motors (VIEW.head, aimed at the turned head): closer, the nearest jet is a green veil;
//   · then the module's own journey: torn off, the rocket falling out of the frame under it; alone at the top over the
//     curve of the Earth (VIEW.apogee); falling, from under it (its sheath); « sept fois ton poids » closer, from its side,
//     the two of you in the fire; under its canopy; on the steppe (VIEW.ground — the tufts of the dressing are computed
//     for that exact camera: it does not move).
// Every place on the frame was worked out with the stage's camera, then seen on a planche (docs/journal/026-acte3.md).
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, VIEW, DEG, IMPACT, HEAD, MOTORS_AT, TOWER_GONE } from "./world.js";

/* ── the camera bolted to the stack ── */
/** A pose aimed at a point of the stack, re-aimed at where that point stands once the stack has turned by `deg`
 *  (world.js: stack.rotation.z = −tilt, about the origin). The camera keeps its own angles: the world stays level. */
const turned = (pose, deg) => {
  const a = deg * DEG;
  return { ...pose, tx: pose.tx * Math.cos(a) + pose.ty * Math.sin(a), ty: -pose.tx * Math.sin(a) + pose.ty * Math.cos(a) };
};
/** The same pose carried round with the stack, angles and all: the very picture of the cabin it gives at tilt 0, and the
 *  sky turned behind it by `deg`. (Three.js lookAt: the camera's back is the unit vector from the aim to the eye.) */
const rideTurn = (pose, deg) => {
  const a = -deg * DEG;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const rot = (v) => [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
  const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const norm = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / l, v[1] / l, v[2] / l];
  };
  const basis = (back) => {
    const right = norm([back[2], 0, -back[0]]); // world up × back
    return { right, up: cross(back, right) };
  };
  const az = pose.az * DEG;
  const el = pose.el * DEG;
  const back = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
  const b0 = basis(back);
  const r0 = (pose.roll ?? 0) * DEG;
  const up = b0.up.map((u, i) => -Math.sin(r0) * b0.right[i] + Math.cos(r0) * u); // rotateZ(roll)
  const back2 = rot(back);
  const up2 = rot(up);
  const b2 = basis(back2);
  const [tx, ty, tz] = rot([pose.tx, pose.ty, pose.tz]);
  return {
    ...pose, tx, ty, tz,
    az: Math.atan2(back2[0], back2[2]) / DEG,
    el: Math.asin(Math.max(-1, Math.min(1, back2[1]))) / DEG,
    roll: Math.atan2(-dot(up2, b2.right), dot(up2, b2.up)) / DEG,
  };
};

/* ── the poses (VIEW: seen on the planches of the sets; what lies between two of them is arithmetic; the places on
   the frame, in px of 1080 × 1920, were worked out with the stage's camera before any picture was drawn) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const TILT = 16; // degrees the rocket has turned by the time anyone looks inside (« Ta fusée tourne »)
const CREW = 0.35; // the two of you, faintly veille while the danger runs (act 1 shows you so); « Vivant » lights you full
const TORN_TILT = 40; // …and while it falls away under the head
// the strike in profile, wide enough for the whole story of it: booster D's signal cone rising from the lower left to its
// nose, the flash where it touches, the core's two edges going up (VIEW.strike, at 13 m, saw only the core's edge)
const STRIKE0 = { ...P, tx: -190, ty: -2150, tz: 0, d: 2400, az: -14, el: 2, fov: 34, shift: -30 }; // the flash at y ≈ 670
const STRIKE1 = { ...STRIKE0, d: 2200 };
// the whole rocket from az ≈ 0, its turn in the picture plane (its nose under the header: y ≈ 465); the aim follows its
// middle round (turned): it turns about its middle, its trail stays where it was
const TURN0 = { ...VIEW.stack, shift: -40 };
const TURN1 = turned(TURN0, TILT);
// inside, bolted to the stack: the two of you in your seats, the console above (y ≈ 605) — a step back from VIEW.inside,
// whose 4 m were all glass rings and seats
const INSIDE = { ...VIEW.inside, d: 540, shift: -40 };
const IN0 = rideTurn(INSIDE, TILT);
const IN1 = rideTurn({ ...INSIDE, d: 500 }, TILT);
// the console from under it, over your shoulder
const CON0 = rideTurn(VIEW.console, TILT);
const CON1 = rideTurn({ ...VIEW.console, d: 100 }, TILT);
// the head and its four motors, aimed at the turned head (closer, the nearest jet becomes a veil)
const HEAD0 = turned({ ...VIEW.head, d: 2300 }, TILT);
const HEAD1 = turned({ ...VIEW.head, d: 2150 }, TILT);
// torn off: the head stays (nose y ≈ 460, base ≈ 825), the rocket falls away under it, out of the frame by ≈ 25 m
const TORN0 = { ...P, tx: -300, ty: -300, tz: 0, d: 6200, az: -20, el: -4, fov: 36, shift: 0 };
const TORN1 = { ...TORN0, d: 5800 };
// inside again, the head upright now (torn away: world.js lets it straighten up): the same picture as before
const PIN0 = { ...INSIDE };
const PIN1 = { ...INSIDE, d: 500 };
// the module alone at the top, over the curve of the Earth — the camera backs away as the shell lifts off
const APO0 = { ...VIEW.apogee };
const APO1 = { ...APO0, d: 1900 };
// falling, from under it: its sheath; lifted so that the heat shield stays over the captions (y ≈ 1200)
const FALL0 = { ...VIEW.fall, shift: 290 };
const FALL1 = { ...FALL0, d: 1150 };
// « sept fois ton poids »: closer, from its side, the module in its sheath and the two of you in it (module 455 → 1235)
const SEVEN0 = { ...P, tx: 0, ty: 130, tz: 0, d: 900, az: -40, el: -4, fov: 36, shift: 190 };
const SEVEN1 = { ...SEVEN0, d: 840 };
// under its canopy: all of it between the header and the captions (apex y ≈ 450, the module ≈ 1080 → 1180)
const CHUTE0 = { ...VIEW.chute, ty: 840, d: 6800, shift: 150 };
const CHUTE1 = { ...CHUTE0, d: 6400 };
// on the steppe — still (the dressing's tufts are computed for this very camera)
const GROUND0 = { ...VIEW.ground };

/* ── the light: what it stands around, and how wide ── */
const L_STRIKE = { fx: IMPACT[0], fy: IMPACT[1], fz: IMPACT[2], fs: 600 };
const L_STACK = { fx: 0, fy: -1700, fz: 0, fs: 2600 };
const L_CREW = { fx: -24, fy: 100, fz: -8, fs: 250 };
const L_CONSOLE = { fx: -40, fy: 164.5, fz: -31.1, fs: 250 };
const L_HEAD = { fx: HEAD.centre[0], fy: HEAD.centre[1], fz: HEAD.centre[2], fs: HEAD.size };
const L_TORN = { fx: 0, fy: 100, fz: 0, fs: 1400 };
const L_MODULE = { fx: 0, fy: 110, fz: 0, fs: 300 };
const L_CHUTE = { fx: 0, fy: 800, fz: 0, fs: 900 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, punch, chip } = D;
  const t = D.times({
    tozero: "tozero", strike: "strike",
    toturn: "zero:Ta-0.12", tourne: "zero:tourne",
    tonobody: "zero:Personne-0.12", rien: "zero:rien$",
    toconsole: "zero:Au-0.12", avarie: "zero:avarie",
    toreponse: "toreponse", trigger: "trigger",
    totorn: "torn", pressed: "pressed", plaque: "reponse:Plaqué",
    toclimb: "reponse:siège$+0.03", montes: "reponse:montes", km: "reponse:kilomètres",
    tofall: "reponse:Puis-0.12", retombes: "reponse:retombes",
    topress: "reponse:près-0.12", sept: "reponse:sept", poids: "reponse:poids",
    tosol: "tosol", parachute: "sol:parachute",
    toground: "sol:Une-0.12", poussee: "sol:poussée", touches: "sol:touches", alive: "sol:Vivant",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word (#hud-clock the story's clock, #hud-count the altitude). */
  const beat = (sel, at, k = 1.18) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  // the air goes by: ≈ 120 m a second of film while the rocket climbs; the head, torn away, climbs on and slows to the
  // top of its arc; still at the top; falling, faster and faster; under the canopy, slower, to a stop on the ground
  const F0 = 3000;
  const F1 = F0 + 120 * span(t.tozero, t.totorn);
  const top = t.km + 0.2;
  const F2 = F1 + 150 * span(t.totorn, top) * (2 / Math.PI); // sine.out from ≈ 150 m/s to 0
  const F3 = F2 - 240 * span(t.tofall, t.tosol) * (2 / Math.PI); // sine.in from 0 to ≈ −240 m/s

  // THE FIRST CUT, before anything else: a tween that starts on the instant of a cut must be written after it (GSAP
  // starts it from the value it finds — written first, it would start from act 2's numbers and fight the cut)
  // the match: from the nozzle on the bench to booster D's nose closing on the core — the same cone, at the same place
  cut(t.tozero, SET.SCENE, STRIKE0, {
    ...STAGED, ...L_STRIKE,
    clock: -0.4, flown: F0, sep: 0.45, bad: 0.85, boost: 0, tower: TOWER_GONE,
  });

  /* ══════════ THE STORY: one chain, on the words ══════════ */
  // the clock: −0,4 → 0 on « frappe », then the three seconds in a straight line to « tirent » — and held there
  st(t.tozero, span(t.tozero, t.strike), { clock: 0 }, "none");
  st(t.strike, span(t.strike, t.trigger), { clock: MOTORS_AT }, "none");
  st(t.tozero, span(t.tozero, t.totorn), { flown: F1 }, "none");
  st(t.totorn, span(t.totorn, top), { flown: F2 }, "sine.out");
  st(t.tofall, span(t.tofall, t.tosol - 0.02), { flown: F3 }, "sine.in");
  st(t.tosol + 0.001, span(t.tosol, t.touches), { flown: F3 - 55 }, "power2.out");
  // the streaks: longer as the head is torn away, none at the top, running up in the fall (the cuts of the descent set
  // them shorter: the canopy, the ground)
  st(t.totorn, 0.5, { airspeed: 1 }, "sine.out");
  st(t.montes, span(t.montes, top), { airspeed: 0 }, "sine.inOut");
  st(t.tofall, 0.8, { airspeed: -1 }, "sine.in");
  st(t.poussee, span(t.poussee, t.touches), { airspeed: 0 }, "sine.out");
  // the height: 50 km until the motors pull; 93 on « kilomètres »; down to 35 (then the ellipse of the descent: written
  // after the cuts that make it)
  st(t.totorn, span(t.totorn, t.km), { alt: 93 }, "sine.out");
  st(t.tofall, span(t.tofall, t.tosol - 0.02), { alt: 35 }, "sine.in");

  /* ══════════ THE PICTURE: one shot per breath ══════════ */

  /* ───────────── « Le propulseur frappe. » ───────────── */
  // D swings in (accelerating), touches on « frappe »: the light at its place, the knock, the word that hits; then it
  // rebounds and drops out of the frame, the three others peeling away
  shot(t.tozero, span(t.tozero, t.toturn), STRIKE1, "sine.out", STRIKE0.d);
  st(t.tozero, span(t.tozero, t.strike), { bad: 1 }, "power2.in");
  st(t.tozero, span(t.tozero, t.toturn - 0.02), { sep: 0.6 }, "none");
  st(t.strike, 0.08, { impact: 1 }, "power2.out");
  st(t.strike + 0.08, 0.4, { impact: 0.35 }, "sine.out");
  // the contact holds while the flash burns (≈ 0.1 s), then D bounces off
  st(t.strike + 0.1, span(t.strike + 0.1, t.toturn - 0.02), { bad: 1.3 }, "power2.out");
  jolt(t.strike, 0.6, 0.45);
  punch(t.strike, 0.06, { hold: 0.12, down: 0.3 });

  /* ───────────── « Ta fusée tourne. » ───────────── */
  // the whole rocket, from az ≈ 0: the boosters fall away; on « tourne » it turns — about its middle (the aim follows
  // it round) — and its trail stays where it was. The sensors light in the glass: they feel it
  cut(t.toturn, SET.SCENE, TURN0, { ...L_STACK, skin: 1, shell: 1 });
  const turnAt = t.tourne - 0.25;
  const turnEnd = t.tonobody - 0.04;
  st(t.toturn, span(t.toturn, t.tonobody - 0.02), { sep: 1, bad: 2 }, "sine.in");
  st(turnAt, span(turnAt, turnEnd), { tilt: TILT }, "sine.in");
  shot(turnAt, span(turnAt, turnEnd), TURN1, "sine.in");
  st(t.tourne, 0.3, { sense: 1, litSensors: 1 }, "sine.out");

  /* ───────────── « Personne n'appuie sur rien. » ───────────── */
  // inside, the camera bolted to the stack: the two of you in your seats, shaken, your hands where they were, the
  // console above you — nothing is touched. The shaking stops in the silence after « rien »
  // (the two of you faintly veille, as act 1 shows you: glass people among grey seats read only by their glow)
  cut(t.tonobody, SET.SCENE, IN0, { ...L_CREW, skin: 0, litYou: CREW, litMate: CREW });
  shot(t.tonobody, span(t.tonobody, t.toconsole), IN1, "sine.inOut", IN0.d);
  st(t.tonobody, 0.12, { shake: 0.9 }, "power2.out");
  st(t.rien, 0.2, { shake: 0 }, "sine.out");

  /* ───────────── « Au pupitre, un mot s'allume : avarie. » ───────────── */
  // the console from under it, over your shoulder; the lamp lights on « avarie »: АВАРИЯ, signal
  // (after the silence of « rien », the rocket shakes on, lighter: two seconds of a dark console must not lie still)
  cut(t.toconsole, SET.SCENE, CON0, { ...L_CONSOLE, skin: 0 });
  shot(t.toconsole, span(t.toconsole, t.toreponse), CON1, "sine.inOut", CON0.d);
  st(t.toconsole + 0.15, 0.3, { shake: 0.35 }, "sine.out");
  st(t.toreponse - 0.3, 0.2, { shake: 0 }, "sine.out");
  st(t.avarie - 0.06, 0.14, { avaria: 1 }, "power2.out");
  chip("chip-avarie", null, 96, 470, t.avarie + 0.04, t.toreponse - 0.16);

  /* ───────────── « Trois secondes. Les quatre moteurs… tirent. » ───────────── */
  // the head and its four motors, ready (lit faintly veille); the clock arrives at T+3,0. On « tirent »: the four jets,
  // the knock, the word that hits — and the header turns veille
  cut(t.toreponse, SET.SCENE, HEAD0, { ...L_HEAD, skin: 1, litMotors: 4 });
  shot(t.toreponse, span(t.toreponse, t.totorn), HEAD1, "sine.inOut", HEAD0.d);
  st(t.trigger, 0.15, { fire: 1 }, "power2.out");
  jolt(t.trigger, 0.5, 0.45);
  punch(t.trigger, 0.07, { hold: 0.12, down: 0.3 });
  beat("#hud-clock", t.trigger + 0.06, 1.2);

  /* ───────────── « Ils t'arrachent à la fusée. » ───────────── */
  // torn off: the head stays (it straightens up as it leaves), the rocket falls away under it, still turning, its trail
  // behind; the height starts to climb
  cut(t.totorn, SET.SCENE, TORN0, { ...L_TORN, skin: 1, sense: 0, litSensors: 0 });
  shot(t.totorn, span(t.totorn, t.pressed), TORN1, "sine.inOut", TORN0.d);
  st(t.totorn, span(t.totorn, t.pressed - 0.02), { apart: 40 }, "power2.in");
  st(t.totorn, span(t.totorn, t.pressed - 0.02), { tilt: TORN_TILT }, "sine.in");
  st(t.pressed, span(t.pressed, t.tofall), { apart: 400 }, "none");

  /* ───────────── « Plaqué dans ton siège, » ───────────── */
  // inside again: the four jets' green light on the glass, the motors' shudder; on « Plaqué » you sink into your seat
  cut(t.pressed, SET.SCENE, PIN0, { ...L_CREW, skin: 0, litYou: CREW, litMate: CREW });
  shot(t.pressed, span(t.pressed, t.toclimb), PIN1, "sine.out", PIN0.d);
  st(t.pressed, 0.1, { shake: 0.5 }, "power2.out");
  st(t.toclimb - 0.2, 0.15, { shake: 0 }, "sine.out");
  st(t.plaque, 0.22, { press: 1 }, "power2.out");

  /* ───────────── « tu montes encore… jusqu'à 93 kilomètres. » ───────────── */
  // the module alone over the curve of the Earth: the motors burn out, the shell (fairing, nose, motors, orbital module)
  // lifts off it and is gone; you coast up — 93 on « kilomètres », the top of the arc
  // (the fairing in glass: solid, at this distance, it was a dark slab hiding you; the rocket is 40 m below and out of
  // every frame from here on: its fire, its trail and its glass are put out)
  cut(t.toclimb, SET.SCENE, APO0, { ...L_MODULE, skin: 0, press: 0, litYou: CREW, litMate: CREW, burn: 0, boost: 0, trail: 0, shell: 0 });
  shot(t.toclimb, span(t.toclimb, t.tofall), APO1, "sine.inOut", APO0.d);
  st(t.toclimb + 0.1, 0.45, { fire: 0, litMotors: 0 }, "sine.in");
  st(t.montes + 0.25, span(t.montes + 0.25, t.km - 0.1), { free: 1 }, "sine.inOut");
  beat("#hud-count", t.km + 0.06, 1.22);

  /* ───────────── « Puis tu retombes : » ───────────── */
  // from under it: the heat shield lights, its sheath opens, the streaks run up past it
  cut(t.tofall, SET.SCENE, FALL0, { ...L_MODULE });
  shot(t.tofall, span(t.tofall, t.topress), FALL1, "sine.in", FALL0.d);
  st(t.tofall, 0.85, { heat: 1 }, "sine.in");

  /* ───────────── « près de sept fois ton poids. » ───────────── */
  // closer, from its side: the module in its burning sheath, and the two of you in it — pressed into your seats, harder
  // and harder, to « poids » (the word that hits); the picture shakes
  cut(t.topress, SET.SCENE, SEVEN0, { ...L_MODULE, litYou: CREW, litMate: CREW });
  shot(t.topress, span(t.topress, t.tosol), SEVEN1, "sine.in", SEVEN0.d);
  st(t.topress, 0.15, { shake: 0.8 }, "power2.out");
  st(t.poids + 0.3, 0.3, { shake: 0 }, "sine.out");
  st(t.sept - 0.3, span(t.sept - 0.3, t.poids), { press: 1 }, "sine.in");
  punch(t.poids, 0.06, { hold: 0.15, down: 0.35 });

  /* ───────────── « Un parachute. » ───────────── */
  // the cut is the ellipse (35 km → 8): the canopy opens on « parachute », the steppe comes up under it. You are dark
  // again: « Vivant » lights you
  cut(t.tosol, SET.SCENE, CHUTE0, { ...L_CHUTE, alt: 8, heat: 0, airspeed: -0.25, chute: 0.35, press: 0, litYou: 0, litMate: 0 });
  shot(t.tosol, span(t.tosol, t.toground), CHUTE1, "sine.out", CHUTE0.d);
  st(t.tosol, span(t.tosol, t.toground - 0.02), { alt: 0.015 }, "power2.out"); // never under 15 m: the tufts would come in
  st(t.parachute, 0.7, { chute: 1 }, "power2.out");

  /* ───────────── « Une dernière poussée… et tu touches le sol. Vivant. » ───────────── */
  // on the steppe, 4 m up, the canopy full above the frame: the last push on « poussée » (the burst, the dust), the ground
  // on « touches » (the header: 0 km, veille). « Vivant »: you glow veille through the glass — and the colour lets go
  cut(t.toground, SET.SCENE, GROUND0, { ...L_MODULE, alt: 0.004, airspeed: -0.1 });
  st(t.toground, span(t.toground, t.poussee), { alt: 0.0026 }, "none");
  st(t.poussee, span(t.poussee, t.touches), { alt: 0 }, "sine.in");
  st(t.poussee - 0.02, 0.12, { retro: 1 }, "power2.out");
  st(t.poussee + 0.1, 0.45, { retro: 0 }, "sine.out");
  beat("#hud-count", t.touches + 0.06, 1.22);
  st(t.alive, 0.3, { litYou: 1, litMate: 0.6 }, "sine.out"); // both of you came down alive
  st(t.alive, 0.35, { mood: 0 }, "sine.inOut");
  punch(t.alive, 0.06, { hold: 0.2, down: 0.45 });
}
