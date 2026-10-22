// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One movement, three cuts: to the pad at Baïkonour
// (« …était là avant le décollage ») and back up to 50 km (« À cinquante kilomètres du sol »), both matched on the
// rocket at the same place of the picture; and, on the knock after « Il frappe ta fusée », from the blow to the
// shaking head (the move between them, 17 m up the rocket in half a second, was the jerkiest of the film).
//
// THE HOOK (0 → topad). The first frame (POSE0 / FIRST) is the Soyuz from under its cross, 50 km up: the boosters
// already peeling away, D askew in signal, the head small in the top slot. It moves from frame 1 by its subject:
//   « Ta fusée lâche, »          the three good boosters fall away fast, D swings in and STRIKES the core on « lâche »
//                                (the light that has a place, the sparks, a knock, the word that hits); the air runs
//                                down past the rocket; the camera swings round and reels (roll) as the rocket climbs
//                                away — the engines and their jets come into the bottom of the picture, the junction
//                                up out of the hook's cards, the head stays under the header
//   « …en pleine montée. »       D rebounds, the rocket starts to turn — and the story's clock stops at T+0,3 s: from
//                                here the sky crawls, almost frozen
//   « Et ta tour de sauvetage… » the camera rises along the core and the third stage to the head: the nose, its top
//                                empty — and it lifts its eyes: the tower, small, glass and ink, flying away; the
//                                camera follows it (its label from « sauvetage »; the word that hits on « partir »)
//   « Il te reste quatre petits moteurs. »  back down on the nose: the four motors light one by one, on the four clicks
//   « Et ce qui la fait lâcher… »           the camera dives down the rocket to D's nose, where the part is (the
//                                           rocket's glass dims while it streams past)
// THE PAD (topad → toscene). A cut on the same part at the same place of the picture: Baïkonour before the launch,
// at night, D whole in its socket; on « décollage » the part glows, bent. The camera pulls back faster and faster…
// THE SCENE (toscene → tosystem) …and on the cut it goes on pulling back, 50 km up (the part still glowing on D's
// nose, then gone dark), to the whole rocket over the limb. Then the scene is told again, slower, second by second:
//   « un propulseur se détache mal. »  the camera swoops on the junction: the boosters' jets die, the cross opens, D swings in
//   « Il frappe ta fusée. »            close, in profile: D's nose against the core, contact on « frappe » (the word
//                                      that hits); D bounces off — and on the knock, in the breath after « fusée »: CUT
//   « Ça secoue, de gauche à droite. » the head and the top of the rocket fill the picture: thrown left on « gauche »,
//                                      right on « droite » (a whip: ± 150 cm), turning
//   « Au-dessus de toi, plus de tour… » time stops again: the camera goes into the head, the fairing turns to glass —
//                                      you, lying in your seat — then up to the nose: the empty place of the tower
//   « …juste la coiffe. »              the fairing solid again, its four motors faintly lit
// and in the silence before « Alors… » the rocket fades, the head stands up straight: VIEW.system, act 2 cuts from it.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, FIRST, POSE0, STAGED, GROUNDED, VIEW, HEAD, IMPACT, FAULT } from "./world.js";

/* ── the poses (worked out on the plan's landmarks, checked with `look` and by measure) ── */
const P = { side: 0, roll: 0, drift: 0.3, dof: 0 };
// the hook: the camera swings round toward D's side, sinks, opens its lens and reels (roll) as the rocket climbs
// away — the head stays under the header (nose y ≈ 455), the junction comes up out of the cards (y ≈ 975), the
// engines come into the picture (y ≈ 1555) with their jets under them: what is bright enough to move a dark frame
const SINK = { ...POSE0, ty: -1800, d: 7300, az: -52, el: -34, shift: 0, fov: 50, roll: -6 };
// the head from just below its level: the nose, its top empty, the black where the tower stood (nose y ≈ 600)…
const NOSE = { ...P, tx: 0, ty: 650, tz: 0, d: 4468, az: -33.8, el: -9.9, fov: 32, shift: 255 };
// …and from the same place, the eyes lifted and the lens opened: the nose at the bottom, the tower flying away up
// to the right, clear of its label on the left…
const TOWER_UP = { ...P, tx: 150, ty: 1150, tz: 80, d: 4600, az: -36, el: -16, fov: 48, shift: 40, side: -150 };
// …and the camera goes after it: higher, closer, a little round (its tip stays under the header, punch included)
const TOWER_AFTER = { ...TOWER_UP, ty: 1150, d: 3250, az: -80, el: -22, fov: 54, shift: 0, side: -160 };
// back down on the nose, from a little under it: the four motors against the black (the limb stays low, behind the
// fairing — from above it ran right through them)
const MOTORS = { ...P, tx: 0, ty: 600, tz: 0, d: 1900, az: -70, el: -4, fov: 32, shift: 60 };
// D's nose where the story froze it (bad 1.1, tilt 2: its fitting there), framed as VIEW.fault frames it on the pad
const D_FROZEN = [-309.4, -2006.4, 0];
const DIVE = { ...VIEW.fault, tx: D_FROZEN[0], ty: D_FROZEN[1], tz: D_FROZEN[2] };
// the pad: VIEW.fault, then pulled straight back from the part — the pose the sky opens on, 50 km up
const OUT = { ...VIEW.fault, d: 1600, dof: 3 };
// 50 km up: the whole rocket over the limb, the head under the header (y ≈ 450), the junction at y ≈ 1145
const WIDE = { ...P, tx: 0, ty: -1500, tz: 0, d: 13000, az: -12, el: 2, fov: 32, shift: -80 };
// the strike, in profile and close: the core down the middle, the impact at y ≈ 920, D's nose coming in from the left
const STRIKE = { ...P, tx: IMPACT[0], ty: IMPACT[1], tz: IMPACT[2], d: 700, az: -12, el: 6, fov: 34, shift: 40, dof: 6 };
// the shaking: the head (nose y ≈ 470–496, its base ≈ 1050) and the top of the rocket under it fill the picture — 150 cm of sway ≈ 100 px
const SHAKE = { ...P, tx: 0, ty: -200, tz: 0, d: 4600, az: -24, el: -4, fov: 34, shift: -200 };
// into the head, the fairing glass: the descent module, you in your seat
const INSIDE = { ...P, tx: -24, ty: 110, tz: -8, d: 1300, az: -40, el: 14, fov: 32, shift: 40 };
// up to the nose: its top, the empty place of the tower, the black above (nose y ≈ 730)
const TOP = { ...P, tx: 0, ty: 760, tz: 0, d: 1500, az: -34, el: 4, fov: 32, shift: 160 };
// the fairing whole, its four motors (nose y ≈ 545)
const COIFFE = { ...P, tx: 0, ty: 560, tz: 0, d: 2300, az: -34, el: 8, fov: 32, shift: 80 };

// the light: what it stands around, and how wide (docs/026-actes.md)
const L_ROCKET = { fx: 0, fy: -1700, fz: 0, fs: 2600 };
const L_HEAD = { fx: 0, fy: 600, fz: 0, fs: 600 };
const L_MOTORS = { fx: 0, fy: 600, fz: 0, fs: 430 };
const L_DIVE = { fx: D_FROZEN[0], fy: D_FROZEN[1], fz: 0, fs: 300 };
const L_FAULT = { fx: FAULT[0], fy: FAULT[1], fz: FAULT[2], fs: 250 };
const L_STRIKE = { fx: IMPACT[0], fy: IMPACT[1], fz: IMPACT[2], fs: 600 };
const L_SHAKE = { fx: 0, fy: 100, fz: 0, fs: 1300 };
const L_CREW = { fx: -24, fy: 110, fz: -8, fs: 250 };
const L_SYSTEM = { fx: HEAD.centre[0], fy: HEAD.centre[1], fz: HEAD.centre[2], fs: HEAD.size };

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip, jolt, punch } = D;
  const t = D.times({
    choc: "choc", climb: "climb", tower: "tower", rescue: "rescue", partir: "accroche:partir", left: "left",
    moteurs: "promesse:moteurs$", topad: "topad", before: "before",
    toscene: "toscene", sol: "scene:sol$", booster: "booster", badly: "badly", hit: "hit", frappe: "scene:frappe",
    fusee: "scene:fusée$", swayL: "swayL", swayR: "swayR", droite: "scene:droite$", above: "above",
    toi: "scene:toi", tour: "scene:tour", justcoiffe: "justcoiffe", coiffe: "scene:coiffe", tosystem: "tosystem",
    tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── « Ta fusée lâche, » ───────────── */
  // from frame 1: the three good boosters fall away fast (their puffs die), D swings in at a steady pace — contact on
  // « lâche » —, the boosters' jets go out, the air runs down past the rocket at full speed (≈ 250 m/s of `flown`,
  // under the 300 where the streaks hop, and longer streaks), the clock runs to the strike in real time; the camera
  // leaves at 3.4 times its mean speed (glide)
  const freeze = t.choc + 0.55; // …and the story stops here
  st(0, t.choc, { bad: 1 }, "none");
  st(0, t.choc, { sep: 0.6, clock: 0 }, "none");
  st(0, 0.35, { boost: 0 }, "sine.out");
  st(0, 0.3, { airspeed: 1 }, "sine.out");
  st(0, 0.95, { flown: 240 }, "none");
  // then the air slows to a crawl (≈ 25 m/s): the sky never quite freezes while the camera travels
  const crawl = 1.6;
  st(0.95, crawl - 0.95, { flown: 305 }, glide(2.5, 0.25));
  st(crawl, t.topad - crawl, { flown: 305 + 25 * (t.topad - crawl) }, "none");
  shot(0, 0.98, SINK, glide(3.4, 0.2));
  /* ───────────── « …en pleine montée. » ───────────── */
  // the strike: the light that has a place, the sparks, a knock, the word that hits — then D rebounds, the three
  // fall on, the rocket starts to turn, and everything slows to a stop: the clock holds at T+0,3 s
  st(t.choc, 0.08, { impact: 1 }, "power2.out");
  st(t.choc + 0.08, 0.6, { impact: 0.35 }, "sine.out");
  st(t.choc, 0.06, { gel: 0.2 }, "power2.out");
  st(t.choc + 0.06, 0.4, { gel: 0 }, "power2.out");
  jolt(t.choc, 0.3, 0.45);
  punch(t.choc, 0.08);
  st(t.choc, freeze - t.choc, { bad: 1.1, sep: 0.75, tilt: 2, clock: 0.3 }, "sine.out");

  /* ───────────── « Et ta tour de sauvetage… » ───────────── */
  // the camera rises along the core and the third stage to the head, straight out of the opening move (it leaves
  // already moving; its fastest on the swish, ≈ 1.9 s): the fairing solid, its motors dark, the top of the nose
  // empty. (The tower is brought within sight while the camera flies: it was 90 m away, out of every frame since the
  // first; at 7.5 m it sits in the top strip, behind the app's bar, until the camera lifts its eyes.)
  const rise = 0.98;
  const atNose = t.tower - 0.03;
  shot(rise, atNose - rise, NOSE, glide(0.8, 0));
  st(rise, atNose - rise, L_HEAD, "sine.inOut");
  now(1.94, { tower: 7.5 });
  // …and lifts its eyes after « tour »: the tower, flying away, slowed down to almost nothing — and, without stopping,
  // goes after it, closer and round the head (one move in two legs: the first lands moving, the second leaves at
  // that speed). The label says « Ta tour de sauvetage » from « sauvetage », and « Partie » on « partir »
  const lift = t.tower + 0.06;
  const atTower = lift + 0.66;
  const down = t.partir - 0.17; // the eyes come down again on « vient de partir »: the tower leaves the top of the picture
  shot(lift, atTower - lift, TOWER_UP, glide(0.01, 0.9));
  shot(atTower, down - atTower, TOWER_AFTER, glide(0.9, 0));
  st(lift, t.left + 0.1 - lift, { tower: 10.5 }, "none");
  chip("chip-tour", null, 96, 470, t.rescue, t.left - 0.15);
  tl.fromTo("#chip-tour b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.partir);
  punch(t.partir, 0.06);

  /* ───────────── « Il te reste quatre petits moteurs. » ───────────── */
  // back down on the nose (leaving at once: the turn of the move is the breath after « partir »); the four motors
  // light one by one on the four clicks, in the breath after « moteurs »
  const atMotors = t.moteurs - 0.1;
  shot(down, atMotors - down, MOTORS, glide(1.4, 0.3));
  shot(atMotors, t.moteurs + 0.18 - atMotors, { d: MOTORS.d * 0.95 }, glide(0.6, 0));
  st(down, atMotors - down, L_MOTORS, "sine.inOut");
  st(t.moteurs + 0.01, 0.34, { litMotors: 4 }, "none");

  /* ───────────── « Et ce qui la fait lâcher… » ───────────── */
  // the camera dives down the rocket (by ratio) to D's nose, frozen where it bounced: the part is in there. It leaves
  // as the last motors light, and the rocket's glass dims while it streams past (fine lines going by fast shimmer)
  const dive = t.moteurs + 0.18;
  const atDive = t.topad - 0.04;
  shot(dive, atDive - dive, DIVE, "sine.inOut", MOTORS.d);
  st(dive, atDive - dive, L_DIVE, "sine.inOut");
  st(dive + 0.1, 0.5, { shell: 0.25 }, "sine.inOut");
  st(atDive - 0.55, 0.5, { shell: 1 }, "sine.inOut");

  /* ═════════════ THE PAD ═════════════ */
  /* ───────────── « …était là avant le décollage. » ───────────── */
  // a cut on the same part at the same place of the picture: Baïkonour, before the launch, at night — D whole in its
  // socket, the tower on the nose. On « décollage » the part glows, bent. Then the camera pulls straight back from
  // it, faster and faster, into the cut
  cut(t.topad, SET.SCENE, VIEW.fault, { ...GROUNDED, era: 1, clock: FIRST.clock, fault: 0, flown: 0, ...L_FAULT });
  const back = t.before + 0.3;
  shot(t.topad, back - t.topad, { d: VIEW.fault.d * 0.92 }, "sine.out");
  st(t.before, 0.35, { fault: 1 }, "power2.out");
  shot(back, t.toscene - back, OUT, "sine.in");
  st(back, t.toscene - back, { fs: 900 }, "sine.in");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── « À cinquante kilomètres du sol, » ───────────── */
  // a cut: the same pose, 50 km up — the rocket at the same place of the picture, the boosters on and burning, the
  // part still glowing on D's nose. The pull-back goes on at the same speed (glide 0.24 matches the speed it had)
  // and lands on the whole rocket over the limb; the part goes dark. T−1,2 s
  const scene0 = t.toscene;
  const atWide = t.sol - 0.04;
  cut(scene0, SET.SCENE, OUT, { ...STAGED, clock: -1.2, sep: 0, bad: 0, boost: 1, fault: 1, flown: 400, fx: FAULT[0], fy: FAULT[1], fz: FAULT[2], fs: 900 });
  shot(scene0, atWide - scene0, WIDE, glide(0.24, 0));
  st(scene0, atWide - scene0, L_ROCKET, "sine.inOut");
  st(scene0 + 0.25, 0.8, { fault: 0 }, "sine.inOut");
  // the story's clock, second by second, slowed down: T−1,2 → T+0,0 on « frappe » → T+1,2 s, then it stops
  st(scene0, t.frappe - scene0, { clock: 0 }, "none");
  st(t.frappe, t.above - t.frappe, { clock: 1.2 }, "none");
  st(scene0, t.above - scene0, { flown: 400 + 160 * (t.above - scene0) }, "none");

  /* ───────────── « un propulseur se détache mal. » ───────────── */
  // the camera swoops on the junction (the swish, after « sol »): the four boosters' jets die — the separation —,
  // the cross opens, and on « détache » D swings in instead of out
  shot(t.sol + 0.02, t.hit - (t.sol + 0.02), STRIKE, "sine.inOut", WIDE.d);
  st(t.sol + 0.02, t.hit - (t.sol + 0.02), L_STRIKE, "sine.inOut");
  st(t.booster, 0.55, { boost: 0 }, "sine.inOut");
  st(t.booster + 0.15, t.hit - (t.booster + 0.15), { sep: 0.4 }, "sine.inOut");
  st(t.badly, t.frappe - 0.1 - t.badly, { bad: 0.9 }, "sine.inOut");

  /* ───────────── « Il frappe ta fusée. » ───────────── */
  // contact on « frappe »: D's nose against the core, the light, the sparks, the word that hits; D bounces off at once
  st(t.frappe - 0.1, 0.1, { bad: 1 }, "power2.in");
  st(t.frappe, 0.08, { impact: 1 }, "power2.out");
  st(t.frappe + 0.08, 0.6, { impact: 0.35 }, "sine.out");
  st(t.frappe, 0.06, { gel: 0.15 }, "power2.out");
  st(t.frappe + 0.06, 0.4, { gel: 0 }, "power2.out");
  punch(t.frappe, 0.06);
  const knock = t.fusee + 0.02; // the impact the bed plays, in the breath after « fusée »
  shot(t.hit, knock - t.hit, { d: STRIKE.d * 0.93 }, "sine.out");
  st(t.frappe, t.above - t.frappe, { bad: 2 }, "none"); // it rebounds, tumbles and falls (gone at 1.97)
  st(t.frappe, knock - t.frappe, { tilt: 2 }, "sine.out");

  /* ───────────── « Ça secoue, de gauche à droite. » ───────────── */
  // on the knock: CUT to the head and the top of the rocket filling the picture, the knock on the camera — and the
  // rocket shakes: thrown left on « gauche », right on « droite », and back (a whip of ± 150 cm), turning on; the
  // three good boosters and D fall away below, out of the picture
  cut(knock, SET.SCENE, SHAKE, { ...L_SHAKE });
  jolt(knock, 0.45, 0.5);
  shot(knock, t.droite - 0.1 - knock, { d: SHAKE.d * 0.96, az: SHAKE.az - 3 }, "sine.inOut");
  st(knock, t.above - knock, { sep: 1 }, "sine.in");
  st(knock, t.above - knock, { tilt: 6 }, "sine.inOut");
  // « secoue »: one wobble first (80 cm, nine frames each way), then the whip. (Four jolts of 0.12 s made a stray
  // frame at 15.00 s: a reversal every 3.6 frames leaves one frame standing apart from its two neighbours)
  const wobble = t.swayL - 0.14 - 0.62;
  st(wobble, 0.31, { sway: 80 }, "sine.inOut");
  st(wobble + 0.31, 0.31, { sway: 0 }, "sine.inOut");
  st(t.swayL - 0.14, 0.28, { sway: -150 }, "sine.inOut");
  st(t.swayR - 0.12, 0.32, { sway: 150 }, "sine.inOut");
  st(t.droite - 0.02, 0.4, { sway: 0 }, "sine.inOut");

  /* ───────────── « Au-dessus de toi, plus de tour… » ───────────── */
  // time stops again. The camera goes into the head (by ratio), the fairing solid while it flies in, glass once it is
  // there (see-through glass streaming by is what shimmered): you, lying in your seat, on « toi »
  const intoHead = t.droite - 0.1;
  const atYou = t.toi + 0.04;
  shot(intoHead, atYou - intoHead, INSIDE, "sine.inOut", SHAKE.d * 0.96);
  st(intoHead, atYou - intoHead, L_CREW, "sine.inOut");
  st(t.toi - 0.26, 0.28, { skin: 0.15 }, "sine.inOut");
  st(t.toi - 0.3, 0.4, { litYou: 0.55 }, "sine.out"); // (at 0.4 the rim light's signal turned you pink)
  // …then a cut on « plus de tour »: the same head, a storey higher, the fairing solid again — and a slow rise onto
  // its top, empty, the black above it, landing at the end of « tour », in the silence the bed leaves there (the
  // climb through all that glass was the jerkiest move of the film)
  const plus = t.tour - 0.3;
  const atTop = t.justcoiffe - 0.06;
  shot(atYou, plus - atYou, { d: INSIDE.d * 0.96 }, "sine.out");
  cut(plus, SET.SCENE, { ...TOP, ty: TOP.ty - 70, d: TOP.d * 1.05 }, { skin: 1, litYou: 0, ...L_HEAD });
  shot(plus, atTop - plus, TOP, "sine.out");

  /* ───────────── « …juste la coiffe. » ───────────── */
  // the camera steps back: the whole nose, its four motors faintly lit on « coiffe »; it flows on into the settle
  const settle = t.tosystem - 0.2;
  shot(atTop, settle - atTop, COIFFE, glide(0.3, 0.6));
  st(t.coiffe - 0.1, 0.4, { litMotors: 4 }, "none");
  st(t.justcoiffe, settle - t.justcoiffe, L_MOTORS, "sine.inOut");

  /* ───────────── (the silence before « Alors… ») ───────────── */
  // the rocket fades, the head stands up straight: the camera settles on VIEW.system, the head alone — act 2 cuts
  // to the bench from there, in place (tilt and sway at 0)
  shot(settle, t.tobench - 0.04 - settle, VIEW.system, glide(0.6, 0));
  st(settle, t.tobench - 0.06 - settle, { shell: 0.25, tilt: 0, sway: 0, ...L_SYSTEM }, "sine.inOut");
}
