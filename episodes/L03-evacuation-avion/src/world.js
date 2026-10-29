// DOSSIER L03 — Évacuation d'un avion (format long, 16:9) : the world. This file is the CONTRACT between the sets and
// the chapters:
//   · plan.js   where everything stands (read by every set; no import there)
//   · SET       the three places, one shown at a time: the PISTE (the airliner seen from outside, three variants,
//               four sites), the CABINE (the inside at night), the BENCH (the systems, solid)
//   · FIRST     the state of the world on the first frame — THE CLOSED LIST of numbers the chapters may move
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · AT        complete states, one per place: a chapter that cuts to a place writes { ...AT.cabin, …what differs }
//   · HAND      the seams between two chapter files: the move each one hands to the next (D.match, `only`)
//   · apply     what each number does to the world, every frame (depends on S and time only)
//
// THE SETS (one file each, built at the same time against plan.js):
//   avion.js   the airliner like an X-ray from outside, true scale, in three variants (A350, A380, 737); its doors and
//              their SOLID slides; the runway, the hangar, the apron; the fire, the smoke that leaves the hull, the
//              engine still turning, the coast guard's Dash 8; the small figures that slide down
//   cabine.js  the inside at night (wide and narrow layouts): rows, passengers of glass, bags, bins, the floor line,
//              the emergency lights, the door seen from inside and its arming lever, the overwing hatch, THE SMOKE
//   model.js   the SOLID systems on the bench: the slide pack (case, bottle, aspirators and their flaps, girt bar) and
//              the inflating tube; the 16 g seat on its sled and its dummy; the cushion and the burner; the documents;
//              twenty figurines. The pack is re-parented into the door's bustle when the cabin is on.
//
// THREE COLOURS, and what they mean in this film: signal is THE THREAT (the fire, the smoke, a door that gives onto the
// fire, a door that jams, a bag carried out); veille is WHAT GETS YOU OUT (the floor line, the air the aspirators
// swallow, a door that opens, a slide that stands, the people safe on the grass, the chrono under 90 s); ink is the
// structure (and the bottle's gas, cold and white: it is NOT the secret).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { BRAND } from "@kit/brand.js";
import { PLANES, SITE, CAB, LAYOUT, YOU, BENCH, ITEM, PACK, DASH, APPROACH } from "./plan.js";
import { buildAvion } from "./avion.js";
import { buildCabine } from "./cabine.js";
import { buildModel } from "./model.js";
import { dressPiste, dressCabine } from "./habillage.js"; // the decorator: the life of the places

export const SET = { PISTE: 0, CABINE: 1, BENCH: 2 };
/** ≈ the radius of what the light stands around on the bench (the stage's `scale`). */
export const SIZE = BENCH.size;
export const FAR = 400000;

/** The header: the five things the film opens, in the order it opens them. 0 = "Évacuation" (the hook, Tokyo, the end). */
export const STEPS = ["Le toboggan", "La règle des 90 s", "La fumée", "Le balisage", "Le siège 16 g"];
const CHAP_STEP = { gonfle: 1, origine: 2, a380: 2, manch1: 3, lum1: 4, siege1: 5, p1: 2 };
/** The chapter cards: their small line, and the line under the rule (the step, when the chapter is one). */
export const CARD = {
  kicker: () => "Dossier L03 · Évacuation",
  sub: (c) => (CHAP_STEP[c.id] ? `Étape ${String(CHAP_STEP[c.id]).padStart(2, "0")} / 05` : ""),
};
/**
 * The header's readout, "Chrono": `chrono` in seconds. Running (≥ 0): ink. STOPPED: written negative (−78 = stopped at
 * 78 s) — veille at 90 s or less, signal above. ≥ 1 200 s reads "< 20 min" (Tokyo: the only figure the voice gives).
 * Values the voice says only (2 min, 90 s, 78 s, 25 s, 45 s, < 20 min); between them, a running chrono may be shown
 * compressed (the film's clock, not a measure): it lands on the said value on the word.
 */
export const CHRONO_HUD = {
  word: "Étape",
  off: "Évacuation",
  fmt: (v) => {
    const s = Math.round(Math.abs(v));
    if (s >= 1200) return "< 20 min";
    if (s >= 100) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")}`;
    return `${s} s`;
  },
  tone: (v) => (v >= 0 ? "#e9e4d8" : Math.abs(v) <= 90.5 ? "#5cffb0" : "#ff5b2e"),
};

/** The studio for a long seen on a big screen (kit/lib/stage.js, docs/recette-long-image.md). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  `dof` 5  the lens, on the close and medium shots only (the poses that spread CLOSE): the part in focus, the X-ray
 *           around it softens. Never above 6. Never on a wide shot, an exploded view, a document, the first frame,
 *           a chapter card: they read from edge to edge (SHARP).
 *  `air`    0: tried on L01 and L02 — no gain. The SMOKE is cabine.js's own, never `air`.
 *  `finish` 0: the bench's metal parts are small; only if a close-up of the bottle or the girt bar asks for it (then
 *           model.js marks its large smooth surfaces `material.userData.finish = false`).
 *  Every pose carries its lens (`...CLOSE` or `...SHARP`): a cut or a move never inherits the blur of the shot before. */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
export const CLOSE = { dof: LOOK.dof };
export const SHARP = { dof: 0 };

/* ───────────────────────────── where things are, for the poses ───────────────────────────── */

const A350 = PLANES.a350;
const A380 = PLANES.a380;
const B737 = PLANES.b737;
const doorX = (plane, id) => plane.doors.find((d) => d[0] === id)[1];
const W = CAB.wide;
const N = CAB.narrow;
/** Row i's seat-back x in the cabin (row 0 is the first behind the door). */
export const rowX = (layout, i) => (layout === LAYOUT.NARROW ? N : W).x0 + i * (layout === LAYOUT.NARROW ? N : W).pitch;
const YOU_X = rowX(LAYOUT.WIDE, YOU.row);
const HATCH_X = rowX(LAYOUT.NARROW, N.hatch.row);

/**
 * THE FIRST FRAME is the hook: "Ton avion brûle. La fumée descend du plafond… et les haut-parleurs se taisent." The six
 * points (CLAUDE.md): an event already under way (the smoke rolls down, now), a LOW perspective, the threat behind the
 * subject (the fire's glow through the windows), a shape known in a third of a second seen from where nobody sees it
 * (the aisle, from the floor), the system already there small but readable (the floor line), moving on frame 1 BY ITS
 * SUBJECT (the smoke). The film loops: the last sentence ("Un système qui attend… le jour où…") lands here — the system
 * that waits IS the line at your feet. The LAST 15 s leave the right half to YouTube's end screen, and the last frame
 * IS this one: the subject stands in the LEFT half (side > 0).
 * CANDIDATES: VIEW.hook1 … hook6 (board scratchpad/L03/candidates.jpg, 22/10) — the orchestrator picks one before the
 * chapters. CHOSEN: C3 (hook2), reframed by c1 (22/10): OUTSIDE at Haneda, the camera ≈ 20 cm above the runway by the
 * nose, the A350 of glass burning, slide 1L dropping and unrolling (doorA 0.52 → 0.86 in the first 1.5 s: the subject
 * moves on frame 1), the fire under the belly behind it; nose and fire in the left 60 %. FIRST = AT.haneda + what differs.
 */
export const POSE0 = { tx: -2700, ty: 420, tz: 300, d: 2300, az: -68, el: -10, fov: 36, shift: 0, side: 200, roll: 0, drift: 0.3, ...SHARP };

export const FIRST = {
  set: SET.PISTE, // the first frame (c1): Haneda, the A350 burning, slide 1L unrolling
  /* ── the header (main.js reads them) ── */
  step: 0, //     the step on screen: 1 … 5 (STEPS), 0 = "Évacuation". Integer: `now`, never `st`
  chrono: 0, //   "Chrono" in seconds (see CHRONO_HUD): running ≥ 0, stopped < 0. `st` for a running clock, `now` to stop it
  chronoOn: 0, // 1 shows the readout, 0 shows "—" (`now`)
  /* ── the plane, outside (avion.js) ── */
  variant: 0, //  which airliner: 0 A350 · 1 A380 · 2 737 (plan.js · VARIANT). Integer: `now` (on a cut)
  site: 0, //     where it stands: 0 Haneda's runway at night · 1 the trial hangar · 2 Manchester's runway, morning ·
  //              3 an apron at night (plan.js · SITE, OPEN). Integer: `now` (on a cut)
  plane: 1, //    the X-ray of the plane (0–1): lower it to let a solid thing read (a slide, the fire)
  run: 0, //      the runway slides under the plane by `run` cm (toward +x: the plane rolls toward −x when it grows); the
  //              Dash 8 stands at x = DASH.x + run − 2·DASH.hit (ahead of the nose until run = DASH.hit, where its tail
  //              touches the nose — `runAt` lands that ON « percutent »). Never tween it into a cut
  alt: 0, //      the plane's height above the ground (cm): 0 on its wheels; APPROACH.alt on the approach
  doorA: 0.52, // the site's first group of doors (OPEN[site].A): 0 shut → 0.3 swung out → 1 its slide dropped, unrolled
  doorB: 0, //    and standing (avion.js draws the pack falling between 0.3 and 0.45). B and C: the site's later groups
  doorC: 0, //    (Haneda: B = 4L · Manchester: B = the overwing hatch, C = 1R, the one that jams: between 0.05 and 0.3 it
  //              is drawn JAMMED — ajar, its pack stuck in the sill, a signal outline; ≥ 0.3 it finally opens)
  shut: 1, //     the doors that stay SHUT (OPEN[site].shut), marked: 0 → 1 (Haneda: signal, the fire behind them;
  //              the hangar: condemned, dark ink and crossed)
  evac: 0, //     the evacuation: 0 nobody on the slides → 1 everybody out (small figures slide down the open slides at
  //              a steady rate, and gather — Haneda: on the grass at GATHER). It only grows within a shot
  bags: 0, //     0 → 1 the share of sliding figures that carry a bag (a SOLID bag, signal): Dubai, Denver
  spin: 0, //     the RIGHT engine still turning (0–1): its fan a blur, a signal threat on the right side (Tokyo)
  thump: 0, //    Manchester: the left engine fails — a light that has a place at the engine (0 → 1 → 0)
  dash: 0, //     the coast guard's Dash 8: 0 none · 1 standing on the runway ahead · 1 → 2 hit: a wreck, dim, burning low
  bridge: 0, //   the jet bridge at door 1L (site 3, the apron): 0 → 1
  gulp: 0, //     the slides swallowing the night's air: veille wisps drawn into each inflating slide's head (0–1)
  pilots: 0, //   the two pilots in the cockpit, lit (0–1): "même les pilotes n'ont pas le droit d'aider"
  hurt: 0, //     a figure at a slide's foot turns signal (0–1): the trials' injured. Never a body that falls
  mark: 0, //     one door lit veille, a ring around it: 1 + 2 × (its index in PLANES[variant].doors) + (0 left · 1 right)
  //              — A350: 1L = 1, 1R = 2, 2L = 3 … 4L = 7, 4R = 8; 0 none. Integer: `now`
  /* ── shared by the outside and the inside ── */
  lights: 0, //   the cabin lights (0 off → 1 on): through the X-ray windows outside, the ceiling inside
  emerg: 1, //    the emergency lights (0–1): small lamps high on the bins and at the exits
  smoke: 0.8, //  THE SMOKE in the cabin: 0 none → 1 its lower edge down to 1,20 m (SMOKE.line) → 1.5 down to 60 cm. Inside:
  //              soft rolling sheets from the ceiling, signal-dark; outside: the X-ray cabin darkens from the top
  fire: 0.7, //   the fire OUTSIDE (0–1): flames and a smoke plume where the site burns (Haneda: under the fuselage and the
  //              left wing; Manchester: the left wing). Inside, its glow behind the windows of that side
  breach: 0, //   the fire ENTERS the cabin (0–1): through the floor and the wall (Manchester), the empty cabin (Tokyo, after)
  pax: 1, //      the people aboard (0–1): outside small heads behind the windows; inside the passengers of glass, seated
  /* ── the inside (cabine.js) ── */
  layout: 0, //   0 wide-body (A350, two aisles) · 1 narrow-body (737, one aisle, the overwing hatch). Integer: `now`
  floor: 0, //    the floor line (veille), along the aisle(s) to the exits: 0 off → 1 lit
  glow: 0, //     the photoluminescent strip: it shines on its own while `emerg` and `lights` are 0 (0–1)
  signs: 0, //    the EXIT signs and the ceiling lamps high (0–1): the smoke drowns them first
  crowd: 0, //    the passengers: 0 seated → 0.15 standing → 1 everyone walked to the open exit (forward) and gone
  you: 0, //      you, a figure of glass at YOU: 0 → 1 there, seated · 1 → 2 you stand up and step into the aisle
  bag: 0, //      YOUR bag (SOLID): 0 under the seat in front → 1 in your hand, at the aisle
  bins: 0, //     the overhead bins open, passengers reaching up for bags (0–1): Dubai
  obstacles: 0, // the trial's obstacles laid in the aisles: bags, blankets, pillows, one after the other (0–1)
  dolls: 0, //    three dolls in volunteers' arms (0–1)
  crew: 0, //     a crew member at the front door: 0 → 1 there (a hand on the arming lever while `arm` moves) · 1 → 2 the
  //              megaphone raised, shouting (no sound is drawn: the arm and the megaphone say it)
  pa: 0, //       the public-address speakers in the ceiling alive (1: a slow glow) → 0 dead, cold
  door: 0, //     the front left door from inside: 0 shut → 1 open (it moves out and swings forward); the pack goes with it
  arm: 1, //      the arming lever: 0 disarmed (the girt bar in the door) → 1 armed (the bar hooked to the floor brackets)
  hatch: 0, //    narrow: the overwing hatch: 0 in place → 0.5 pulled in (22 kg in the arms) → 1 thrown out, the hole open
  wider: 0, //    narrow: the seat beside the hatch removed after Manchester (0 → 1): the 27 cm passage widens
  panels: 0, //   narrow: the cabin's wall and ceiling panels lit veille, "qui brûlent moins" (0–1)
  extinguisher: 0, // narrow: extinguishers on the bulkhead (0 → 1, one then two)
  cut: 0, //      the cabin in section: the forward bulkhead and what is in front of the camera removed (0–1): 1,20 m read
  /* ── the solid systems (model.js) ── */
  item: 0, //     what stands on the bench: 0 the slide pack · 1 the seat on its sled · 2 the cushion and the burner · 3 a
  //              document · 4 twenty figurines (plan.js · ITEM). Integer: `now`
  explode: 0, //  "on l'ouvre": the pack comes apart (0 → 1): the case opens, the folded slide, the bottle, the aspirators,
  //              the girt bar each in its lane · 1 → 2 the parts come together as the WORKING RIG: the case gone, the
  //              bottle's hose to the two aspirators, the aspirators on the slide's head tube (flat: `tube` 0) — what
  //              the inflation is shown on (`gas`, `jet`, `see`, `valve`, `air`, `tube`, `leak`)
  named: 0, //    the part the voice names, lit (`now`): 0 none · 1 the folded slide · 2 the bottle · 3 the aspirators ·
  //              4 the girt bar · 5 the flaps (inside an aspirator)
  pulled: 0, //   the door opens and pulls the pack out of the bustle (0 → 1); `drop` 0 → 1 it falls outside, hanging by
  drop: 0, //     its girt bar from the sill (read in the cabin)
  gas: 0, //      the bottle's valve opens, its gas leaves (0–1, ink: cold, white)
  jet: 0, //      the gas jet through an aspirator's nozzle, drawn (0–1); `see` 0 → 1 the aspirator cut open (the jet, the
  see: 0, //      low pressure behind it, the flaps — readable in profile)
  valve: 0, //    the aspirators' flaps: 0 shut → 1 open
  air: 0, //      the outside air swallowed through the open flaps: veille heads of light streaming in (0–1)
  tube: 0, //     the slide's head tube behind the aspirator: 0 flat fabric → 1 round, full
  leak: 0, //     a debris props a flap open again: 0 → 1 the air streams OUT (signal), the tube sags
  press: 0, //    the static 9 g test: a plate pushes on the seat (0–1)
  sled: 0, //     the 16 g test: 0 the sled at the start → 1 launched, at speed → 2 stopped dead (the dummy thrown forward,
  //              held by its belt; it settles back). `st` 0 → 1 slowly, 1 → 2 in ≈ 0.25 s
  sensors: 0, //  the dummy's sensors read (veille points in its head, chest, pelvis) (0–1)
  burner: 0, //   the kerosene burner's flame on the cushion (0–1, signal); the fire-blocking layer holds (veille edge)
  doc: 0, //     which document lies on the bench (plan.js · DOCS, 1-based; 0 none). Integer: `now`
  docIn: 0, //    the document slides onto the bench and lies down (0 → 1)
  hl: 0, //       its lines highlighted in order, veille (0 → 1 sweeps them all)
  twenty: 0, //   twenty small figurines standing in a row (0–1); `oneIn` 0 → 1 one of them turns signal
  oneIn: 0,
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal on the rim (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); `hot` warms the background (0–1);
  // the bench's pool and grid
  fx: -2700, fy: 300, fz: 300, fs: 1800, mood: 1, gel: 0, hot: 0.12, pool: 0.25, grid: 0.16,
};

/** Everything at rest: what a cut to any place starts from (then AT.* says what that place needs). */
const REST = {
  variant: 0, site: 0, plane: 1, run: 0, alt: 0, doorA: 0, doorB: 0, doorC: 0, shut: 0, evac: 0, bags: 0, spin: 0, thump: 0, dash: 0, bridge: 0, gulp: 0, pilots: 0, hurt: 0, mark: 0,
  lights: 0, emerg: 0, smoke: 0, fire: 0, breach: 0, pax: 0,
  layout: 0, floor: 0, glow: 0, signs: 0, crowd: 0, you: 0, bag: 0, bins: 0, obstacles: 0, dolls: 0, crew: 0, pa: 0, door: 0, arm: 1, hatch: 0, wider: 0, panels: 0, extinguisher: 0, cut: 0,
  item: 0, explode: 0, named: 0, pulled: 0, drop: 0, gas: 0, jet: 0, see: 0, valve: 0, air: 0, tube: 0, leak: 0, press: 0, sled: 0, sensors: 0, burner: 0, doc: 0, docIn: 0, hl: 0, twenty: 0, oneIn: 0,
  mood: 0, gel: 0, hot: 0, pool: 0.25, grid: 0.16,
};
/**
 * Complete states, one per place. AT does NOT say the header (`step`, `chrono`, `chronoOn`): the chapter does, on every
 * cut. The light (fx…fs) is written around what each place frames most; a chapter moves it with its subject.
 */
export const AT = {
  /* the cabin */
  // Tokyo, the A350 at night: the cabin lights dead, the emergency lights on, the people seated, the fire outside on the left
  tokyo: { ...REST, layout: 0, emerg: 1, signs: 1, pax: 1, fire: 0.6, smoke: 0.3, mood: 1, hot: 0.12, fx: 600, fy: 110, fz: 0, fs: 700 },
  // the cabin at rest, lit (the slide explained, the arming lever): nobody in danger
  cabin: { ...REST, layout: 0, lights: 1, signs: 1, pax: 1, crowd: 0, mood: 0, fx: 300, fy: 110, fz: 123, fs: 600 },
  // the trial's cabin: lights off, emergency lights only, volunteers seated, no fire, no smoke
  trial: { ...REST, layout: 0, emerg: 1, signs: 1, pax: 1, mood: 0, fx: 600, fy: 100, fz: 0, fs: 700 },
  // Manchester's 737 inside: morning, the left side on fire
  narrow: { ...REST, layout: 1, lights: 1, signs: 1, pax: 1, fire: 0.6, mood: 1, hot: 0.1, fx: HATCH_X, fy: 90, fz: -120, fs: 400 },
  /* the outside */
  haneda: { ...REST, variant: 0, site: SITE.HANEDA, pax: 1, emerg: 1, mood: 1, hot: 0.12, fx: 0, fy: 450, fz: 0, fs: 3500 },
  hangar: { ...REST, variant: 0, site: SITE.HANGAR, pax: 1, emerg: 1, mood: 0, fx: 0, fy: 500, fz: 0, fs: 3500 },
  manchester: { ...REST, variant: 2, site: SITE.MANCHESTER, pax: 1, lights: 1, mood: 1, hot: 0.08, fx: -300, fy: 260, fz: 0, fs: 1800 },
  apron: { ...REST, variant: 0, site: SITE.APRON, pax: 0, lights: 1, mood: 0, fx: doorX(A350, "1"), fy: 400, fz: 300, fs: 1500 },
  /* the bench (the light around the item: `benchLight(item)` says it) */
  bench: { ...REST, item: ITEM.PACK, fx: 0, fy: PACK.y + PACK.h / 2, fz: 0, fs: SIZE, pool: 0.3 },
};
/** The light around each item on the bench: { item, fx, fy, fz, fs, pool } — spread it into a cut's state. */
export const benchLight = (item) =>
  [
    { item, fx: 0, fy: PACK.y + PACK.h / 2, fz: 0, fs: SIZE, pool: 0.3 }, //   the pack (and its exploded view)
    { item, fx: 0, fy: 70, fz: 25, fs: 150, pool: 0.4 }, //                      the seat on its sled
    { item, fx: 0, fy: 30, fz: 0, fs: 70, pool: 0.3 }, //                        the cushion and the burner
    { item, fx: 0, fy: 4, fz: 0, fs: 60, pool: 0.35 }, //                        a document
    { item, fx: 0, fy: 10, fz: 0, fs: 120, pool: 0.3 }, //                       twenty figurines
  ][item];

/** The poses that frame each place (complete: nothing is inherited across a cut). POSED on stand-ins: the sets give better ones. */
const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const D1 = doorX(A350, "1");
const D4 = doorX(A350, "4");
export const VIEW = {
  hook: POSE0,
  /* ── the hook: four candidates for the first frame (the orchestrator picks one on a board) ── */
  // CABINE, from the floor of the left aisle, looking forward: the smoke rolling down from the ceiling, the fire's glow in
  // the left windows, the floor line running from your feet to the door (the system, small but readable)
  hook1: POSE0,
  // PISTE (Haneda), low on the runway beside the nose: the A350 of glass, the fire under it behind, slide 1L bursting out
  hook2: { ...P, ...SHARP, tx: D1, ty: 300, tz: 300, d: 1800, az: -55, el: -4, fov: 36, side: 300 },
  // PISTE (Haneda), at the foot of slide 1L looking up it to the open door, the hull burning behind
  hook3: { ...P, ...SHARP, tx: D1, ty: 280, tz: 700, d: 1300, az: 18, el: -10, fov: 38, side: 300 },
  // CABINE, from the door looking aft, LOW (ty 40: higher, the camera is in the veil): the smoke ceiling coming down over the
  // heads, the lines at the floor + { smoke: 0.8, emerg: 1, pax: 1, fire: 0.8, floor: 1, signs: 1, crowd: 0.1 }
  hook4: { ...P, ...SHARP, tx: 700, ty: 40, tz: 0, d: 900, az: -80, el: 4, fov: 40, side: 300 },
  // CABINE, under the smoke looking up (thumbSmoke, moved left): the sheets rolling over the rows, an exit sign drowning
  // + { smoke: 0.6, emerg: 1, signs: 1, pax: 1, floor: 1, fire: 0.7, pa: 1 }
  hook5: { ...P, ...SHARP, tx: 500, ty: 150, tz: 115, d: 700, az: 86, el: -9, fov: 36, side: 250 },
  // CABINE, low by door 1L: the line turning into the door that swings open + { floor: 1, emerg: 1, smoke: 0.9, signs: 1,
  // pax: 1, fire: 0.6, door: 0.25, crowd: 0.2 } (the passengers' glass legs clutter it)
  hook6: { ...P, ...SHARP, tx: 20, ty: 10, tz: 200, d: 300, az: 120, el: 14, fov: 32, side: 300 },

  /* ── CABINE (wide unless said) ── */
  aisle: { ...P, ...SHARP, tx: 400, ty: 60, tz: 123, d: 1100, az: 85, el: 6, fov: 36 }, //               the left aisle forward to the door
  aisleLow: { ...P, ...CLOSE, tx: 300, ty: 4, tz: 140, d: 260, az: 88, el: 6, fov: 30 }, //           seen (cabine): the floor line close, + { floor: 1, smoke: 1.3, pax: 1, emerg: 1 } — or { glow: 1, floor: 0, emerg: 0 }
  ceiling: { ...P, ...SHARP, tx: 600, ty: 210, tz: 0, d: 700, az: 80, el: -10, fov: 34 }, //             the ceiling lamps, the smoke under them
  section: { ...P, ...SHARP, tx: 600, ty: 95, tz: 0, d: 1000, az: -90, el: 0, fov: 34 }, //             seen (cabine): + { cut: 1, smoke: 1, floor: 1, pax: 1, emerg: 1 } — the camera stays UNDER 1,20 m
  doorIn: { ...P, ...CLOSE, tx: 0, ty: 100, tz: 270, d: 380, az: 150, el: 6 }, //                        the door from inside, three quarters
  bustle: { ...P, ...CLOSE, tx: 0, ty: 45, tz: 255, d: 230, az: 150, el: 12, fov: 30 }, //               seen (cabine): + { lights: 1, arm: 1 }, the pack read through the glass
  lever: { ...P, ...CLOSE, tx: 28, ty: 105, tz: 252, d: 120, az: 150, el: 8, fov: 30 }, //                seen (cabine): the arming lever; the crew's hand on it: doorIn + { crew: 1, arm: 0.5 }
  sill: { ...P, ...CLOSE, tx: 0, ty: 4, tz: 236, d: 120, az: 150, el: 24, fov: 30 }, //                  seen (cabine): the two floor brackets, the girt bar in them ({ arm: 1 })
  doorOpen: { ...P, ...SHARP, tx: -40, ty: 100, tz: 250, d: 560, az: 125, el: 8, fov: 30 }, //            seen (cabine): + { door: 1, lights: 1, floor: 1, emerg: 1 }
  exit: { ...P, ...CLOSE, tx: 20, ty: 10, tz: 200, d: 300, az: 120, el: 14, fov: 32 }, //                 seen (cabine): the line into 1L, + { floor: 1, emerg: 1, smoke: 0.9, signs: 1, pax: 1, fire: 0.6 }
  you: { ...P, ...CLOSE, tx: 760, ty: 100, tz: 175, d: 170, az: 160, el: 25, fov: 32 }, //                seen (cabine): you seated, from above the aisle, + { you: 1, pax: 1, emerg: 1, smoke: 0.6 }
  bag: { ...P, ...CLOSE, tx: 694, ty: 12, tz: 170, d: 110, az: 140, el: 10, fov: 32 }, //                 seen (cabine): your bag under the seat (lying it reads like a crate: prefer thumbBag)
  thumbBag: { ...P, ...CLOSE, tx: 742, ty: 52, tz: 92, d: 200, az: -95, el: -4, fov: 30 }, //            the third thumbnail: the bag in your hand, ≈ 45 % of the height, + { you: 2, bag: 1, smoke: 0.9, emerg: 1, pax: 1, floor: 1, fire: 0.6 }
  thumbSmoke: { ...P, ...SHARP, tx: 500, ty: 150, tz: 115, d: 700, az: 86, el: -9, fov: 36 }, //         the second thumbnail: the smoke on the top half, + { smoke: 0.75, emerg: 1, signs: 1, pax: 1, floor: 1, fire: 0.7, pa: 1 }
  speaker: { ...P, ...CLOSE, tx: 839, ty: 243, tz: 118, d: 120, az: 70, el: -60, fov: 30 }, //          seen (cabine): a PA grille in the ceiling, + { pa: 1 } (anchor A.speaker)
  doll: { ...P, ...CLOSE, tx: 428, ty: 66, tz: 175, d: 120, az: -60, el: 24, fov: 30 }, //               seen (cabine): a doll in arms, + { dolls: 1, pax: 1, emerg: 1 } (drowned in the legs: keep it short)
  crowdOut: { ...P, ...SHARP, tx: 300, ty: 110, tz: 130, d: 700, az: 75, el: 14, fov: 36 }, //          seen (cabine): + { crowd: 0.4, pax: 1, emerg: 1, smoke: 0.7, floor: 1, door: 1, fire: 0.6 }
  fireIn: { ...P, ...SHARP, tx: 1100, ty: 60, tz: 200, d: 700, az: 110, el: 6, fov: 36 }, //             seen (cabine): + { breach: 0.6, fire: 1, smoke: 1.1, floor: 1, emerg: 1 }
  crewFront: { ...P, ...CLOSE, tx: -20, ty: 140, tz: 170, d: 380, az: 50, el: 4, fov: 30 }, //           seen (cabine): + { crew: 2, smoke: 0.7, emerg: 1, pax: 1, crowd: 0.15 }
  bins: { ...P, ...SHARP, tx: 700, ty: 150, tz: 60, d: 650, az: 110, el: 4 }, //                          the bins open, arms reaching up
  /* narrow (the 737) */
  hatch: { ...P, ...CLOSE, tx: 861, ty: 105, tz: -130, d: 300, az: 40, el: 22, fov: 32 }, //            seen (cabine): + { layout: 1, lights: 1, pax: 1, hatch: 0.5 }
  hatchHole: { ...P, ...SHARP, tx: 861, ty: 70, tz: -200, d: 380, az: 30, el: 24, fov: 34 }, //         seen (cabine): + { layout: 1, hatch: 1 }
  passage: { ...P, ...CLOSE, tx: 861, ty: 40, tz: -110, d: 190, az: 90, el: 62, fov: 34 }, //            seen (cabine): + { layout: 1, lights: 1, floor: 1, wider: 0 → 1 } — WITHOUT passengers (pax 0)
  narrowAisle: { ...P, ...SHARP, tx: 600, ty: 90, tz: 0, d: 900, az: 85, el: 4, fov: 34 }, //             the 737's aisle

  /* ── PISTE (the A350 unless said; Haneda or the apron) ── */
  planeWide: { ...P, ...SHARP, tx: 0, ty: 450, tz: 0, d: 9500, az: -35, el: 8 }, //                       the whole A350
  planeSide: { ...P, ...SHARP, tx: -200, ty: 450, tz: 300, d: 6500, az: -8, el: 4 }, //                   its left side, the four doors
  door1L: { ...P, ...CLOSE, tx: D1, ty: 450, tz: 350, d: 900, az: -20, el: 4 }, //                         door 1L from outside
  slide1L: { ...P, ...SHARP, tx: D1, ty: 250, tz: 900, d: 2000, az: -12, el: 4 }, //                       its slide, standing, to the ground
  thumbSlide: { ...P, ...SHARP, tx: -2650, ty: 230, tz: 850, d: 2600, az: -25, el: 2, fov: 32, side: 300 }, // the first thumbnail (85,4 s) + { site: 1, doorA: 1, shut: 1, mood: 0, fx: -2700, fy: 250, fz: 800, fs: 900 }
  slideProfile: { ...P, ...SHARP, tx: -2500, ty: 230, tz: 850, d: 1800, az: 30, el: 3, fov: 30, side: 120 }, // seen (avion): the slide in profile, foot left, door top right, + { site: 1, doorA: 1 }
  slideFoot: { ...P, ...CLOSE, tx: D1 - 50, ty: 120, tz: 1300, d: 1000, az: 25, el: 4 }, //               the foot of slide 1L, figures arriving
  door4L: { ...P, ...CLOSE, tx: D4, ty: 430, tz: 400, d: 1400, az: 20, el: 4 }, //                        the fourth door on the left, at the back
  engineR: { ...P, ...CLOSE, tx: A350.engines.x, ty: A350.engines.y, tz: -A350.engines.z[0], d: 1100, az: 160, el: 2 }, // the right engine, from the right side
  cockpit: { ...P, ...CLOSE, tx: A350.nose + 300, ty: 600, tz: 0, d: 700, az: -50, el: 8 }, //            the two pilots
  approach: { ...P, ...SHARP, tx: 0, ty: 600, tz: 0, d: 9000, az: -40, el: -4 }, //                       with { alt: APPROACH.alt }: the landing (the camera rides the plane)
  dash: { ...P, ...SHARP, tx: -14000, ty: 300, tz: 0, d: 9000, az: 60, el: 4 }, //                        seen (avion): the Dash 8 small on the runway ahead, + { dash: 1, run: -80000 }
  wreck: { ...P, ...SHARP, tx: -3600, ty: 250, tz: 0, d: 4500, az: -50, el: 5 }, //                       seen (avion): + { dash: 2, run: -56660, fire: 0.5 }
  gather: { ...P, ...SHARP, tx: -1500, ty: 100, tz: 4500, d: 6500, az: -15, el: 14 }, //                    the 379 on the grass, the A350 burning behind
  apronDoor: { ...P, ...SHARP, tx: D1, ty: 470, tz: 1200, d: 2200, az: -30, el: 6 }, //                    the apron: the jet bridge at door 1L
  /* the hangar (the trial; the A380) */
  hangarWide: { ...P, ...SHARP, tx: 0, ty: 600, tz: 0, d: 10000, az: -40, el: 18 }, //                     the A350 in the dark hangar
  a380Wide: { ...P, ...SHARP, tx: 0, ty: 650, tz: 0, d: 12500, az: -32, el: 10 }, //                       the A380, two decks
  a380Side: { ...P, ...SHARP, tx: -500, ty: 650, tz: 400, d: 5500, az: -12, el: 6 }, //                    its left side: 5 + 3 doors
  /* Manchester (the 737) */
  b737Roll: { ...P, ...SHARP, tx: -300, ty: 250, tz: 0, d: 4200, az: -40, el: 2 }, //                      the take-off roll, low
  b737Fire: { ...P, ...CLOSE, tx: B737.engines.x, ty: 200, tz: B737.engines.z[0], d: 1500, az: -30, el: 6 }, // the left engine, the fire
  b737Wide: { ...P, ...SHARP, tx: 0, ty: 250, tz: 0, d: 5200, az: -30, el: 8 }, //                        the whole 737
  b737Right: { ...P, ...CLOSE, tx: doorX(B737, "1"), ty: 230, tz: -B737.r, d: 700, az: 160, el: 6 }, //   door 1R from the right, jammed

  /* ── BENCH (one item at a time at the origin) ── */
  pack: { ...P, ...CLOSE, tx: 0, ty: PACK.y + PACK.h / 2, tz: 0, d: 260, az: -25, el: 14 }, //               the pack, its +z face
  exploded: { ...P, ...SHARP, tx: 0, ty: 57, tz: 8, d: 360, az: -28, el: 18 }, //                         seen (model): { explode: 1, fy: 50 }
  secret: { ...P, ...CLOSE, tx: 0, ty: 72, tz: 16, d: 210, az: -20, el: 20 }, //                           seen (model): the aspirators in the exploded view, { explode: 1, named: 5 }
  girt: { ...P, ...CLOSE, tx: 0, ty: 0, tz: 55, d: 220, az: -25, el: 16 }, //                              seen (model): { explode: 1, named: 4, fy: 20, fz: 30 }
  rig: { ...P, ...SHARP, tx: 20, ty: 40, tz: 0, d: 480, az: -22, el: 12 }, //                              seen (model): the working rig, { explode: 2, fy: 40, fs: 120 }
  bottle: { ...P, ...CLOSE, tx: 122, ty: 8, tz: 30, d: 130, az: -30, el: 18 }, //                          seen (model): { explode: 2, fx: 122, fy: 10, fz: 20, fs: 60 }
  asp: { ...P, ...CLOSE, tx: -23, ty: 84, tz: 0, d: 95, az: 0, el: 6 }, //                                 seen (model): in profile, cut open, { explode: 2, see: 1, fx: -23, fy: 80, fs: 60 } (d 80 ≈ 55 %)
  leak: { ...P, ...CLOSE, tx: -23, ty: 88, tz: 0, d: 115, az: 0, el: 6 }, //                               seen (model): { explode: 2, see: 1, leak: 1, tube: 0.7, mood: 1 }
  tube: { ...P, ...SHARP, tx: 0, ty: 52, tz: 0, d: 360, az: -22, el: 10 }, //                              seen (model): { explode: 2, tube: 0 → 1, fy: 50, fs: 100 }
  thumbAir: { ...P, ...SHARP, tx: 0, ty: 84, tz: 0, d: 150, az: -15, el: 22 }, //                         spare thumbnail: { explode: 2, air: 1, valve: 1, gas: 1, jet: 1, tube: 0.6, fy: 75, fs: 80 }
  seat: { ...P, ...CLOSE, tx: 0, ty: 60, tz: 0, d: 430, az: -40, el: 10 }, //                              the seat on its sled
  sled: { ...P, ...SHARP, tx: 0, ty: 60, tz: 0, d: 650, az: -20, el: 8 }, //                               seen (model): the sled runs toward −x (the seats face −x) — with grid: 0
  dummy: { ...P, ...CLOSE, tx: -10, ty: 110, tz: 50, d: 220, az: -50, el: 6 }, //                          seen (model): the dummy is in the +z seat, { sled: 1 → 2, sensors, fz: 50, fy: 90 }
  cushion: { ...P, ...CLOSE, tx: 0, ty: 30, tz: 0, d: 200, az: -30, el: 14 }, //                           the cushion, the burner's flame
  doc: { ...P, ...SHARP, tx: 0, ty: 4, tz: 0, d: 160, az: -8, el: 55 }, //                                  a document, read from above
  twenty: { ...P, ...SHARP, tx: 0, ty: 12, tz: 0, d: 270, az: -18, el: 18 }, //                            twenty figurines
};

/**
 * THE RACCORD door → bench ("Alors… on l'ouvre"): the same pack at the same place of the picture. In the cabin the
 * bustle faces −z (into the cabin), on the bench the pack faces +z: the pose turns by 180° around the pack. `pose`:
 * the cabin pose the last shot ends on (complete); `at`: where the pack's origin stands in the cabin (world.packAt()).
 */
export const benchFromCabin = (pose, at) => ({ ...pose, tx: -(pose.tx - at[0]), ty: pose.ty - at[1] + PACK.y, tz: -(pose.tz - at[2]), az: pose.az - 180 });
/** The pack's origin in the cabin, when the door is shut (cabine.js · A.bustle): use it for benchFromCabin. */
export const PACK_IN_DOOR = [0, 15, W.w / 2 - 18];

/**
 * The SEAMS between two chapter files (docs/L03-actes.md). Each file lays its own half with the same arguments:
 *   seam(D, "c12", "out")                                   // the file that ends
 *   seam(D, "c12", "in", { set: SET.CABINE, state: { … } })  // the file that starts: the COMPLETE state on the cut
 * A seam inside a place keeps `to` = the last pose of `from` (the move simply goes on: no visible cut). These poses are
 * the orchestrator's: a chapter never changes them (write "À changer ailleurs").
 */
const DOOR_A = { ...P, ...CLOSE, tx: 0, ty: 100, tz: 270, d: 430, az: 146, el: 7 };
const DOOR_B = { ...P, ...CLOSE, tx: 10, ty: 102, tz: 270, d: 360, az: 150, el: 7 };
const FOOT_A = { ...P, ...SHARP, tx: D1 - 50, ty: 140, tz: 1300, d: 1300, az: 20, el: 5 };
const FOOT_B = { ...P, ...SHARP, tx: D1 - 50, ty: 220, tz: 1250, d: 1700, az: 17, el: 8 };
// c34: the camera down the middle of the left aisle (z 123), looking straight forward (az 90): the seated heads stay
// ≈ 65 cm aside instead of brushing the lens; CEIL_B under the smoke's edge (camera ≈ 1,05 m) for c4's smoke 0.9
// (c4, 23/10: half the tilt — el −8 → −4, the camera where it was — the seam measured 15 in qa, the film averages 2,6)
const CEIL_A = { ...P, ...SHARP, tx: 600, ty: 152, tz: 123, d: 740, az: 90, el: -4, fov: 34 };
const CEIL_B = { ...P, ...SHARP, tx: 560, ty: 105, tz: 123, d: 760, az: 90, el: 0, fov: 34 };
// (c5, 23/10: ty follows the plane — at alt APPROACH.alt a ty of 600 framed the runway, the plane 60 m above the frame)
const APP_A = { ...P, ...SHARP, tx: 0, ty: 600 + APPROACH.alt, tz: 0, d: 9500, az: -44, el: -3 };
const APP_B = { ...P, ...SHARP, tx: 0, ty: 600 + APPROACH.alt, tz: 0, d: 9000, az: -40, el: -4 };
const BURN_A = { ...P, ...SHARP, tx: 0, ty: 450, tz: 0, d: 7000, az: -36, el: 7 };
const BURN_B = { ...P, ...SHARP, tx: 0, ty: 450, tz: 0, d: 8000, az: -38, el: 9 };
export const HAND = {
  // c1 → c2, under the card "Comment se gonfle le toboggan": the cabin, the door seen from inside — a slow push toward the
  // lever that goes on ("Pendant le vol, chaque porte est armée. Un levier…")
  c12: { at: "gonfle-0.9", from: [DOOR_A, DOOR_B], to: DOOR_B, opt: { before: 1.2, after: 1.0 } },
  // c2 → c3, under the card "853 personnes dans le noir": the hangar, a pull-back and a rise from the foot of a slide;
  // the A350 becomes the A380 on the cut (a dip): the move goes on and reveals the two decks
  c23: { at: "a380-0.9", from: [FOOT_A, FOOT_B], to: { ...FOOT_B, tx: doorX(A380, "M1") - 50, ty: 260, tz: 1500, d: 2200 }, opt: { before: 1.2, after: 1.2, fade: 0.25, kind: "dip" } },
  // c3 → c4, under the card "Le balisage lumineux au sol" (after the second mid-roll): the Tokyo cabin, the ceiling lamps
  // drowned in smoke; the camera tilts DOWN toward the floor — and goes on tilting into c4, where the line lights
  c34: { at: "lum1-0.9", from: [CEIL_A, CEIL_B], to: CEIL_B, opt: { before: 1.2, after: 1.2 } },
  // c4 → c5, under the card "Tokyo, 2 janvier 2024": Haneda at night, the A350 on its approach, the camera riding with it
  c45: { at: "t1-0.9", from: [APP_A, APP_B], to: APP_B, opt: { before: 1.2, after: 1.2 } },
  // c5 → c6, under the card "Pourquoi pas 90 secondes ?" (after the third mid-roll): the burning empty A350, a slow
  // pull-back into the night that goes on
  c56: { at: "p1-0.9", from: [BURN_A, BURN_B], to: BURN_B, opt: { before: 1.2, after: 1.2 } },
};

/* ───────────────────────────── the world ───────────────────────────── */

const vA = new THREE.Vector3();
const mInv = new THREE.Matrix4();

export function buildWorld(stage) {
  const { scene } = stage;
  stage.grade.gel.set(BRAND.signal);

  /* the three places: one group each, one shown at a time */
  const places = [new THREE.Group(), new THREE.Group(), new THREE.Group()];
  for (const g of places) scene.add(g);

  /* PISTE — the airliner from outside, its sites */
  const avion = buildAvion();
  places[SET.PISTE].add(avion.group);
  /* CABINE — the inside */
  const cabine = buildCabine();
  places[SET.CABINE].add(cabine.group);
  const dress = { piste: dressPiste(), cabine: dressCabine() };
  places[SET.PISTE].add(dress.piste.group);
  places[SET.CABINE].add(dress.cabine.group);

  /* BENCH — the solid systems; the pack is re-parented into the door's bustle when the cabin is on */
  const bench = makeBench(SIZE);
  places[SET.BENCH].add(bench.group);
  const model = buildModel();
  const benchMount = new THREE.Group();
  benchMount.position.set(0, PACK.y, 0);
  places[SET.BENCH].add(benchMount, model.items);
  const sill = new THREE.Vector3();

  const home = (obj, parent) => {
    if (obj.parent !== parent) parent.add(obj);
  };

  return {
    places, avion, cabine, model, bench, dress,
    /** Where the pack's origin stands in the cabin now (world coordinates of the bustle). */
    packAt: () => cabine.A.bustle.getWorldPosition(vA).toArray(),
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const set = Math.round(S.set);
      places.forEach((g, i) => (g.visible = i === set));
      const shared = { lights: S.lights, emerg: S.emerg, smoke: S.smoke, fire: S.fire, breach: S.breach, pax: S.pax, mood: S.mood };

      if (set === SET.PISTE) {
        avion.set(
          {
            ...shared, amount: S.plane, variant: Math.round(S.variant), site: Math.round(S.site), run: S.run, alt: S.alt,
            doorA: S.doorA, doorB: S.doorB, doorC: S.doorC, shut: S.shut, evac: S.evac, bags: S.bags, spin: S.spin, thump: S.thump,
            dash: S.dash, bridge: S.bridge, gulp: S.gulp, pilots: S.pilots, hurt: S.hurt, mark: Math.round(S.mark),
          },
          time, px,
        );
        dress.piste.update({ amount: S.plane, site: Math.round(S.site), fire: S.fire, run: S.run }, time, px);
      }

      if (set === SET.CABINE) {
        cabine.set(
          {
            ...shared, layout: Math.round(S.layout), floor: S.floor, glow: S.glow, signs: S.signs, crowd: S.crowd, you: S.you, bag: S.bag,
            bins: S.bins, obstacles: S.obstacles, dolls: S.dolls, crew: S.crew, pa: S.pa, door: S.door, arm: S.arm, hatch: S.hatch,
            wider: S.wider, panels: S.panels, extinguisher: S.extinguisher, cut: S.cut,
          },
          time, px,
        );
        dress.cabine.update({ layout: Math.round(S.layout), lights: S.lights, smoke: S.smoke, cut: S.cut }, time, px);
        // the pack lives in the door's bustle (the wide cabin's 1L door only)
        home(model.pack.group, cabine.A.bustle);
        model.pack.group.visible = Math.round(S.layout) === 0;
        // the floor brackets, in the pack's own frame: the girt bar reaches them when armed
        cabine.A.bustle.updateWorldMatrix(true, false);
        cabine.A.sill.getWorldPosition(sill);
        sill.applyMatrix4(mInv.copy(cabine.A.bustle.matrixWorld).invert());
      } else {
        home(model.pack.group, benchMount);
        model.pack.group.visible = set === SET.BENCH && Math.round(S.item) === 0;
      }

      model.set(
        {
          place: set, item: Math.round(S.item), sill: set === SET.CABINE ? sill : null, door: S.door, arm: S.arm,
          explode: S.explode, named: Math.round(S.named), pulled: S.pulled, drop: S.drop, gas: S.gas, jet: S.jet, see: S.see, valve: S.valve,
          air: S.air, tube: S.tube, leak: S.leak, press: S.press, sled: S.sled, sensors: S.sensors, burner: S.burner,
          doc: Math.round(S.doc), docIn: S.docIn, hl: S.hl, twenty: S.twenty, oneIn: S.oneIn, mood: S.mood,
        },
        time, px,
      );
      model.items.visible = set === SET.BENCH;
      if (set === SET.BENCH) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, S.hot);
      const d = stage.cam.d;
      scene.fog.density = set === SET.BENCH ? bench.fog(d) : set === SET.PISTE ? 0.05 / Math.max(3000, d) : 0.04 / Math.max(500, d);
    },
  };
}

/* ───────────────────────────── shared by the chapters ───────────────────────────── */

/** Beats whose marked words stay OFF the picture (main.js hands it to commit): the chute has its own title (retitle). */
export const KEYWORDS_SKIP = ["chute"];
/** The chapter cards come in this long before their chapter's first word (long.js · chaptersOf). */
export const CARD_LEAD = 0.9;
/** The seams, by file: c1 ends on HAND.c12 … c6 starts on HAND.c56. */
export const SEAMS = { c1: [null, "c12"], c2: ["c12", "c23"], c3: ["c23", "c34"], c4: ["c34", "c45"], c5: ["c45", "c56"], c6: ["c56", null] };
/** The time a chapter FILE owns (`span(D, "c3")`): from the seam it starts on to the seam it ends on (c1 from 0, c6 to the end). */
export const span = (D, file) => {
  const [a, b] = SEAMS[file];
  return [a ? D.at(HAND[a].at) : 0, b ? D.at(HAND[b].at) : D.END];
};
/** When a chapter's card comes in, inside a file: its first beat's first word − CARD_LEAD (`cardAt(D, "origine")`). */
export const cardAt = (D, beat) => D.at(beat) - CARD_LEAD;
/**
 * THE LANDING AT HANEDA (c4's last plan, c5): the plane runs at APPROACH.speed, and its nose reaches the Dash 8 ON
 * « percutent » (`collide`): `run` at time t, before the collision. Lay it as a straight line, never eased, and never
 * across a seam: `now(a, { run: runAt(D, a) }); st(a, b - a, { run: runAt(D, b) }, "none")`. After the collision the
 * plane slows down and stops on « s'arrêter » (`stop`): c5 eases it out from runAt(D, collide) = DASH.hit.
 */
export const runAt = (D, t) => DASH.hit + APPROACH.speed * (t - D.at("collide"));
/** A cut lands ON a frame (30 fps): a `mix` fade a few ms after a frame keeps an older frame — the picture jumps back. */
export const onFrame = (t) => Math.round(t * 30) / 30;
/**
 * Lays a file's half of a seam: `seam(D, "c12", "out")` at the end of c1; at the start of c2,
 * `seam(D, "c12", "in", { set: SET.CABINE, state: { ...AT.cabin, … } })` — the file that starts gives the COMPLETE state
 * on the cut (it depends on no other file). Returns the pose the camera reaches after the seam.
 */
export const seam = (D, name, only, extra = {}) => {
  const h = HAND[name];
  return D.match(onFrame(D.at(h.at)), h.from, h.to, { ...h.opt, ...extra, only });
};
