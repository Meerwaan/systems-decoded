// DOSSIER L05 — Hudson (format long, affaire réelle, 16:9) : the world. This file is the CONTRACT between the sets and
// the chapters:
//   · plan.js   where everything stands, the day's times (DAY), the plane's track (PATH, pathAt) — no import there
//   · SET       the three places, one shown at a time: VOL (the A320 at true scale over / on the Hudson, New York
//               around it), CARTE (the maquette of New York at 1 : 2 000, and the certification basin), BENCH
//   · FIRST     the state of the first frame — THE CLOSED LIST of numbers the chapters may move
//   · CLOCK     the header's clock tied to the words that say a time (main.js reads it; `track` −1 follows it)
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · AT        complete states, one per place: a chapter that cuts writes { ...AT.vol, …what differs }
//   · HAND      the seams between two chapter files; span / seam / cardAt / onFrame
//   · apply     what each number does to the world, every frame (depends on S and time only); `lock` bolts the
//               camera to the plane (the plane level, the world takes its pitch and bank) for the shots inside it
//
// THE SETS (one file each, built at the same time against plan.js):
//   avion.js     the A320 like an X-ray (glass airframe, solid nacelles, flaps, doors and their slide-rafts, the
//                overwing exits, the passengers as a crowd of glass, the aft hull that takes the blow, the spray, the
//                safety card in a seat pocket) and the Canada geese flying into it
//   systemes.js  the SOLID systems we open, mounted at their true place in the plane: the left CFM56 (opens in place:
//                fan, compressor, core and its fire, turbine, the generator on its gearbox; the goose in the core),
//                the APU in the tail cone, the cockpit (two pilots of glass, the sidesticks, the computers under the
//                floor, the overhead and its ditching button, the screens), the "loi normale" limit; on the bench the
//                check-list binder (QRH, three parts), the engine's test stand and its bird gun, the lineup
//   hudson.js    New York at TRUE scale under the plane: the Hudson (its water, its current, its cold), Manhattan and
//                the boroughs as X-ray blocks, LaGuardia and Teterboro, the George Washington Bridge, the helicopter,
//                the ferries, the fireboat and the Coast Guard, the winter sky and its low sun, the cloud deck far below
//                when the plane is "high"
//   carte.js     the maquette: the same New York at 1 : 2 000 on a table in the dark, the plane's glyph on its track,
//                the options (LaGuardia 13 and 31, Teterboro 1, the Hudson), the radio, the fifteen simulator passes, the
//                ferries converging; the certification basin and its model airliner
//   pieces.js    the PIÈCES DU DOSSIER (2D, in the page): the real documents with their number and their source
//
// THREE COLOURS, and what they mean in THIS film: signal is THE THREAT — the geese and what they do in the cores, the
// ground that comes up, the alarms, the cold water, a refused runway, the simulator pass that fails. veille is WHAT
// SAVES THEM — the APU and its current, the computers in "loi normale" and their limit, the river once it is chosen,
// the slide-rafts, the ferries. ink is the structure (and the check-list: a plan, neither threat nor rescue).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { A320, DAY, COUNT, DEG, pathAt, SPOTS, BENCH, hms } from "./plan.js";
import { buildAvion, makeRaft } from "./avion.js";
import { buildSystemes } from "./systemes.js";
import { buildHudson, makeFerry } from "./hudson.js";
import { buildCarte } from "./carte.js";

export const SET = { VOL: 0, CARTE: 1, BENCH: 2 };
export const SIZE = 2000; // ≈ the radius of what the light stands around (cm): the A320; world.apply narrows it per place (`fs`)
export const FAR = 1700000; // 17 km: Manhattan seen from the plane at 900 m
const HIGH = 550000; //       `high` 1 lifts the plane 5.5 km (≈ 6 400 m: "une panne à plus de 6 000 mètres")

/* ───────────────────────────── the header (main.js) ───────────────────────────── */
/** `era` (integer, `now` only): the left of the header — the date, and where we are. */
export const ERAS = [
  { date: "15 janv. 2009", where: "New York · vol 1549" },
  { date: "Avril 2009", where: "Toulouse · simulateur" },
  { date: "Mai 2010", where: "Rapport NTSB" },
  { date: "Depuis 2009", where: "Ce qui a changé" },
];
/**
 * THE CLOCK — [cue, "hh:mm:ss"]: at each word that says a time, the header says it too; linear in between (two
 * anchors close together make a jump, the same time twice a hold). Hidden whenever `clockOn` is 0 (the chapters
 * decide): the A320 and the check-list (≈ 28 → 174 s) and the inquiry are out of the day. `track` −1 makes the
 * plane follow this clock: the plane is where the header says it is.
 */
export const CLOCK = [
  [0, "15:27:11"], //             the hook: the strike, held (the voice: "Il te reste 3 min 32")
  ["normal-0.05", "15:27:11"], // held through the A320 and the check-list (the plane frozen in the sky at the strike)
  ["normal", "15:24:54"], //      back to the runway (the clock hidden: the date only)
  ["decolle", "15:24:54"], //     "15 h 24 min 54 s, décollage autorisé"
  ["monte", "15:27:07"], //       "15 h 27 min 07 s" — the takeoff and the climb in fast motion (133 s in 4.4 s)
  ["unmot", "15:27:10"], //       "Trois secondes plus tard"
  ["birds", "15:27:10"],
  ["impact", "15:27:11"], //      "15 h 27 min 11 s. Les impacts."
  ["seuil$", "15:27:11"], //      held through the rupture (the plan, out of time) and the threshold
  ["impro", "15:27:19"], //       "15 h 27 min 19 s. Allumage."
  ["prend", "15:27:23"], //       "15 h 27 min 23 s. Il prend les commandes."
  ["lga", "15:28:05"],
  ["gauche", "15:28:25"],
  ["lga31", "15:28:31"], //       "Six secondes plus tard"
  ["brace", "15:29:11"],
  ["teter2", "15:29:21"], //      "Dix secondes plus tard"
  ["hudson", "15:29:28"],
  ["descente", "15:29:28"], //    "1 min 15. C'est ce qui reste." (held)
  ["volets", "15:29:44"],
  ["alarme", "15:30:24"],
  ["trente$", "15:30:36"],
  ["contact$", "15:30:43"], //    the river (the countdown at 0:00)
  ["aile", "15:30:58"], //        "Quinze secondes après"
  ["ferry", "15:34:40"],
  ["recupere$", "15:50:00"], //   "en une vingtaine de minutes" (the clock is hidden from `renforts`: no time shown that the voice does not say)
  ["toloop-0.04", "15:50:00"],
  ["toloop", "15:27:11"],
];
/** The clock as a function of the film's time, once D exists (main.js: world.setClock(makeClock(D))). */
export function makeClock(D) {
  const keys = CLOCK.map(([cue, s]) => [typeof cue === "number" ? cue : D.at(cue), hms(s)]);
  return (time) => {
    if (time <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [a, va] = keys[i];
      const [b, vb] = keys[i + 1];
      if (time <= b) return b - a < 1e-3 ? vb : va + ((vb - va) * (time - a)) / (b - a);
    }
    return keys[keys.length - 1][1];
  };
}
/** "15:27:11" from seconds after 15:00 · "3:32" from seconds. */
export const fmtClock = (t) => {
  const s = Math.max(0, Math.floor(t + 1e-6));
  return `15:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
export const fmtCount = (t) => {
  const s = Math.max(0, Math.ceil(COUNT.to - t - 1e-6));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** The chapter cards: their small line, and the line under the rule. Never "série" (Merwan, 20/10). */
export const CARD = { kicker: () => "Dossier L05 · Hudson", sub: () => "" };
/** Beats whose marked words stay off the picture (a chapter shows them better). */
export const KEYWORDS_SKIP = ["chute", "liste"];

/* ───────────────────────────── the studio ───────────────────────────── */
/** docs/recette-long-image.md: `dof` 5 on close and medium shots only (`...CLOSE`), never on a wide shot, a map, an
 *  exploded view, a document, the first frame or under a card (`...SHARP`). Every pose says its lens. */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
export const CLOSE = { dof: LOOK.dof };
export const SHARP = { dof: 0 };
const P = { fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3 };

/* ───────────────────────────── the first frame ───────────────────────────── */
// "15 h 27. Tes deux moteurs viennent d'avaler des oies." The geese going into the LEFT engine, its fire spitting, the
// Bronx 860 m below, LaGuardia far behind. The film loops: the last sentence ("…il sera de nouveau…") lands here,
// and the LAST 15 s leave the right half to YouTube's end screen — the subject stands in the LEFT half (`side` > 0).
// SIX CANDIDATES (VIEW.hook1 … hook6, docs/L05-actes.md § La première image): the orchestrator picks one on a board,
// after the sets, before the chapters, and pastes it here. PROVISIONAL (set on the stubs): = hook1.
export const POSE0 = { ...P, tx: A320.engine.x + 260, ty: A320.engine.y + 15, tz: A320.engine.z + 10, d: 420, az: 28, el: 14, fov: 40, ...SHARP }; // chosen 02/11 on the planche: inside the glass nacelle, the core on fire, the Bronx below (= hook4, lock 1)

export const FIRST = {
  set: SET.VOL,
  /* ── the header (main.js) ── */
  era: 0, //       ERAS: 0 the day · 1 Toulouse · 2 the report · 3 since. Integer: `now` (on a card or a cut)
  clockOn: 1, //   1 the clock (CLOCK) in the header, 0 "—". `now`
  countOn: 1, //   1 the countdown "Avant l'eau 3:32" (signal), 0 hidden. `now`
  /* ── the plane in the world (world.js) ── */
  track: -1, //    where the plane is on its PATH: −1 follows the header's clock (CLOCK); ≥ 0 a time of the day in seconds
  //               after 15:00 (hms("15:31:00") afloat…) — `now` on a cut, or `st` slowly (the city slides by at 80 m/s)
  high: 0, //      0 → 1 lifts the plane 5.5 km over a cloud deck ("à plus de 6 000 mètres"); back to 0 the ground comes up
  pitch: 0, //     degrees ADDED to the track's pitch (nose up +): "l'ordinateur ne lèvera pas le nez au-delà de la limite"
  bank: 0, //      degrees ADDED to the track's bank (right wing down +)
  lock: 1, //      (FIRST: 1, the first frame is the engine close-up) 0 the plane pitches and banks in the scene (the shots from outside: "il lève le nez", "il plonge") ·
  //               1 the camera is BOLTED to the plane: the plane stays level, the world (river, city, sky) takes its
  //               pitch and bank — for every shot inside or close to it (cockpit, engine, APU, doors, the cabin): a
  //               pose written in the plane's frame then holds whatever the plane does. `now` on a cut (or `st` over ≥ 2 s)
  haze: 1, //      the air's depth (× the fog of the true-scale world): 0.6 clearer far shots, 1.4 thicker
  fs: SIZE, //     the light's radius around what it stands around (cm): 2000 the whole plane, 600 an engine, 150 a hand
  spot: 0, //      CARTE: 0 the maquette · 1 the basin — BENCH: 0 the check-list · 1 the engine stand · 2 the lineup. `now`
  /* ── the bench's mood ── */
  mood: 0, //      0 veille · 1 signal (franc: never between for more than half a second)
  pool: 0.3, //    the bench's halo
  grid: 0.16, //   the bench's grid
  /* ── the A320 (avion.js) ── */
  shell: 1, //     the glass airframe (0–1): lower it to let a solid thing read
  cabin: 0.35, //  the cabin's lights through the windows (0–1)
  pax: 0, //       the passengers of glass in their seats (0–1)
  brace: 0, //     the passengers bent in the brace position (0–1): "préparez-vous à l'impact"
  flaps: 0, //     the flaps (0 in → 1 out)
  gearDown: 0, //  the gear down (only on LaGuardia's runway; 0 in flight)
  nacL: 0, //      the CLOSED left nacelle of avion.js (0 while systemes.js's engine stands in its place)
  nacR: 1, //      the closed right nacelle
  geese: 1, //     the Canada geese: 0 none · 0.3 a dark scatter far ahead · 0.6 the flock filling the windshield · 1 the
  //               impacts (birds crossing the nose, two into each intake, feathers) — periodic at 1 (the first frame moves)
  flame: 0.5, //   the flames the hit engines spit, flickers at the exhaust (0–1)
  packs: 0, //     the slide-rafts folded in the front doors, outlined veille (0–1): "un détail que personne ne remarque"
  doors: 0, //     the front doors L1 and R1 open (0–1)
  rafts: 0, //     the front slide-rafts inflate (0 → 1, after `doors`): they ARE rafts, veille. The aft ones never
  wingExits: 0, // the overwing exits open (0–1)
  evac: 0, //      the passengers out: 0 inside · 0.3 the first ones on the left wing · 1 everyone on the wings and rafts
  saved: 0, //     the ferries take them in (0–1): the wings and rafts empty
  sink: 0, //      the tail settles in the river (0–1: the tail 2.2 m lower; world.js adds the pitch)
  damage: 0, //    the aft belly takes the blow: deformed, a signal glow under the aft cabin (0 → 1, never back on screen)
  spray: 0, //     the spray of the touchdown (0 → 1 once: the sheets of water rise and fall)
  seal: 0, //     the openings under the waterline: 0 nothing · 0 → 0.25 they are marked ink (open) · 0.45 → 0.85 their doors shut · 1 shut (the marks stay, faint)
  safety: 0, //    the safety card in a seat's back pocket, lit (0–1)
  feed: 0, //      the current, veille dashes running from what makes it (generators, APU) to the cockpit (0–1: they run at
  //               a FIXED speed — never tween in < 0.4 s)
  /* ── the systems (systemes.js) ── */
  explode: 0, //   "on l'ouvre", IN PLACE: the left engine comes apart along its axis — cowls, fan, compressor, core, turbine,
  //               nozzle; the generator steps out under it (0 → 1)
  named: 0, //     the part the voice names, lit veille (integer, `now`): 0 none · 1 fan · 2 compressor · 3 core (the fire) ·
  //               4 turbine and exhaust · 5 the generator (IDG) · 6 the APU · 7 the sidestick · 8 the computers · 9 the
  //               ditching button (an ink ring: NEVER lit, never pressed) · 10 the QRH's first part · 11 second · 12 third
  n1L: 82, //      the left engine's fan speed, % (the voice: 35 after the strike, "remonte un peu" at 15:28:25)
  n1R: 82, //      the right engine's, % (15 after the strike). Never 0: no engine is shown "off"
  burn: 1, //      the fire in the left core (0–1)
  goose: 1, //     a goose in the left core: 0 none · 0 → 1 it goes in · 1 inside, signal (and the core darkened)
  ign: 0, //       the igniters' sparks in the core, veille (0–1): "Allumage"
  gen: 1, //       the engine's generator gives current, veille (0–1): "elle se tait" → 0
  apu: 0, //       the APU: 0 asleep · 0 → 1 it starts (spins up, its exhaust warms, its generator veille) — "l'APU"
  law: 1, //       the flight computers in "loi normale", veille (0–1); a signal flicker below 0.3
  stick: 0, //     the captain's sidestick pulled aft (0 → 1 = against its stop, "en butée")
  limit: 0, //     the angle-of-attack limit drawn beside the nose: a veille arc and its stop (0–1)
  aoa: 0, //       the needle on that arc (0–1; 1 = AT the limit: "il ne lèvera pas le nez au-delà")
  pilots: 1, //    the two pilots of glass (0–1)
  pf: 0, //        who flies: 0 the first officer (right seat) · 1 the captain (left seat, from 15:27:23) — the hand on the stick
  masters: 0, //   the engine master switches: 0 on · 1 off ("couper les moteurs… pour les relancer": 0 → 1 → 0)
  ecam: 0, //      the screens' warnings, signal (0–1)
  alarm: 0, //     "terrain, remontez": the glareshield pulses signal (0–1; a slow pulse, never a strobe)
  qrh: 0, //       the check-list binder in the first officer's hands (VOL; on the BENCH it is always there)
  page: 0, //      the binder: 0 closed · 1 → 3 its three parts open in turn (continuous: the pages turn) · 4 the separate
  //               ditching check-list
  done: 0, //      how far the crew got: a veille marker down the pages (0 → 1; "environ un tiers" = 0.33)
  apuMark: 0, //   the APU's line far down in the check-list, lit veille (0–1): "l'APU ne vient que bien plus loin"
  gap: 0, //       the hole in the ditching part: a signal outline where no line tells to silence the ground alarm (0–1)
  gun: 0, //       the bird gun fires (0 → 1: the bird flies into the engine)
  aimCore: 0, //   where the gun aims: 0 the fan's blades (the old tests) · 1 the core (the 2023 test)
  birdCmp: 0, //   the test's 1.8 kg bird beside a 3.6 kg goose, on the stand (0–1)
  listK: 0, //     the lineup lit one by one (0 → 4: the APU · the sidestick and its computers · a slide-raft · a ferry)
  /* ── New York (hudson.js) ── */
  city: 1, //      the city of X-ray blocks (0–1)
  river: 1, //     the river's surface (0–1)
  riverLit: 0, //  the Hudson lit veille along its length: chosen (0–1) — also on the maquette
  airports: 0.4, // the runways of LaGuardia and Teterboro drawn (0–1)
  lgaSig: 0, //    LaGuardia behind you, signal (0–1): "l'aéroport… est derrière toi"
  boats: 0, //     the boats: 0 none · 0 → 1 the first ferry comes alongside · up to 9: seven ferries, the fireboat, the Coast Guard
  heli: 0, //      the helicopter of the TCAS alarm, ringed signal (0–1)
  cold: 0.3, //    the cold: breath of vapour off the river, frost on the wings (0–1)
  flow: 0, //      the current drawn on the water, running south (0–1)
  /* ── the maquette (carte.js) ── */
  route: -1, //    the track drawn up to a time (s after 15:00); −1: up to where the plane is (`track`)
  glyph: 1, //     the plane's glyph on the maquette (0–1)
  opt: 0, //       the option offered (integer, `now`): 0 none · 1 LaGuardia 13 · 2 LaGuardia 31 · 3 Teterboro 1 · 4 the Hudson
  optNo: 0, //     the option refused: its line goes signal and is struck (0–1)
  radio: 0, //     the radio between the plane and the controller (0–1)
  jam: 0, //       "mayday ne passe même pas": the radio's line breaks, signal (0–1)
  charlotte: 0, // the route planned to Charlotte, over the land, off the maquette's south-west edge (0–1)
  sims: 0, //      the 15 simulator passes drawn from the strike (0 → 1; the 8 that reach a runway end veille)
  simLate: 0, //   the pass with 35 s of delay toward LaGuardia 13, falling short, signal (0 → 1)
  boatsMap: 0, //  the boats converging on the maquette (0 → 1: the first at 15:34:40, seven ferries, the fireboat, the Coast Guard)
  dropK: 0, //     the basin: the model airliner touches still water nearly flat, sinking at barely any speed (0 → 1)
  dropFast: 0, //  the basin: the same model with the real touchdown's sink (0 → 1) — no ratio drawn
};

/** Neutral values: what a cut to a place starts from (+ what differs). */
const REST = { ...FIRST, lock: 0, geese: 0, flame: 0, goose: 0, burn: 1, n1L: 82, n1R: 82, gen: 1, clockOn: 1, countOn: 0 };
const AFTER = { n1L: 35, n1R: 15, goose: 1, burn: 0.35, gen: 0, flame: 0 }; // after the strike: what the engines are
export const AT = {
  vol: { ...REST, set: SET.VOL },
  hit: { ...REST, set: SET.VOL, ...AFTER, countOn: 1 }, //                       in flight after the strike
  water: { ...REST, set: SET.VOL, ...AFTER, n1L: 0, n1R: 0, burn: 0, track: hms("15:31:00"), geese: 0, countOn: 0, cold: 0.6 }, // afloat (fans still: the engines took the water)
  carte: { ...REST, set: SET.CARTE, spot: 0, fs: 900, countOn: 0 },
  basin: { ...REST, set: SET.CARTE, spot: 1, fs: 300, clockOn: 0, countOn: 0 },
  bench: { ...REST, set: SET.BENCH, spot: 0, fs: 70, clockOn: 0, countOn: 0, pool: 0.3, grid: 0.16 },
  stand: { ...REST, set: SET.BENCH, spot: 1, fs: 260, clockOn: 0, countOn: 0, explode: 0, goose: 0, n1L: 0, burn: 0 },
  lineup: { ...REST, set: SET.BENCH, spot: 2, fs: 320, clockOn: 0, countOn: 0 },
};

/* ───────────────────────────── the poses (PROVISIONAL: set on the stubs) ───────────────────────────── */
// VOL: around the plane, which stands at the origin (nose −x, left +z). Close-ups in and on the plane take `lock` 1.
// CARTE: the maquette's origin is the ditching point; 1 km = 50 cm (the strike at ≈ (435, 43, −420), LaGuardia ≈ (540, 0, −40)).
const E = A320.engine;
const C = A320.cockpit;
export const VIEW = {
  // the six candidates of the first frame (docs/L05-actes.md § La première image)
  hook1: { ...P, tx: -560, ty: -250, tz: 575, d: 1400, az: 58, el: -16, fov: 42, side: 260, ...SHARP }, //                                                                                   under the left wing, behind the engine: the geese into the intake
  hook2: { ...P, tx: -700, ty: -250, tz: 575, d: 1600, az: -55, el: -10, fov: 44, side: 200, ...SHARP }, // ahead-left, low: the geese streaming into the left engine, its flame behind
  hook3: { ...P, tx: 0, ty: -150, tz: 0, d: 5600, az: 4, el: -6, fov: 34, side: 260, ...SHARP }, //    the left profile, low: the Bronx below
  hook4: { ...P, tx: E.x + 260, ty: E.y + 15, tz: E.z + 10, d: 420, az: 28, el: 14, fov: 40, ...SHARP }, // lock 1, goose 0.85 → 1, burn 1 (also thumb2)
  hook5: { ...P, tx: C.windX + 10, ty: 50, tz: 0, d: 220, az: 90, el: 10, fov: 60, ...SHARP }, // lock 1 (over the shoulders)
  hook6: { ...P, tx: -2600, ty: -300, tz: 0, d: 7200, az: 70, el: 12, fov: 40, side: 300, ...SHARP }, // above, behind: the city, the Hudson ahead
  // VOL
  wide: { ...P, tx: -200, ty: 0, tz: 0, d: 7000, az: -28, el: 8, ...SHARP },
  profile: { ...P, tx: 0, ty: 0, tz: 0, d: 5200, az: 0, el: 2, ...SHARP },
  over860: { ...P, tx: 0, ty: -1500, tz: 6000, d: 16000, az: 178, el: 6, fov: 40, ...SHARP }, // track 1631
  chase: { ...P, tx: -800, ty: 50, tz: 0, d: 5200, az: 88, el: 9, fov: 36, ...SHARP },
  lookBack: { ...P, tx: 4000, ty: -1200, tz: 1500, d: 8000, az: -114, el: 7, fov: 38, ...SHARP }, // track 1660, lgaSig 1
  cabin: { ...P, tx: 0, ty: 0, tz: 0, d: 3000, az: 20, el: 38, fov: 36, ...SHARP }, //                the X-ray cabin from above, its rows
  engine: { ...P, tx: E.x, ty: E.y + 20, tz: E.z, d: 700, az: -48, el: 8, ...CLOSE }, // lock 1, goose 0 → 0.5
  exploded: { ...P, tx: E.x + 310, ty: E.y - 25, tz: E.z, d: 1000, az: -24, el: 9, ...SHARP }, // lock 1, explode 1
  fan: { ...P, tx: E.x, ty: E.y, tz: E.z, d: 520, az: -55, el: 6, ...CLOSE },
  core: { ...P, tx: E.x + 340, ty: E.y, tz: E.z, d: 380, az: -20, el: 12, ...CLOSE },
  idg: { ...P, tx: E.x + 160, ty: E.y - 80, tz: E.z + 25, d: 300, az: -10, el: -10, ...CLOSE },
  cockpit: { ...P, tx: C.windX + 10, ty: 50, tz: 0, d: 220, az: 90, el: 10, fov: 60, ...CLOSE }, // lock 1
  stick: { ...P, tx: C.floorX - 46, ty: C.floorY + 70, tz: C.seatZ + 42, d: 120, az: -30, el: 22, fov: 36, ...CLOSE }, // lock 1, pf 1, stick 0 → 1
  overhead: { ...P, tx: C.floorX - 19, ty: C.floorY + 204, tz: -11, d: 95, az: 75, el: -38, fov: 44, ...CLOSE }, // lock 1, named 9
  computers: { ...P, tx: A320.avionics.x, ty: A320.avionics.y + 25, tz: -10, d: 210, az: -20, el: 14, ...CLOSE }, // lock 1
  apu: { ...P, tx: A320.apu.x - 10, ty: A320.apu.y, tz: 0, d: 380, az: 55, el: 14, ...CLOSE }, // lock 1, apu 1
  tail: { ...P, tx: 1700, ty: 200, tz: 0, d: 2400, az: 35, el: 10, ...SHARP },
  doors: { ...P, tx: A320.doors.L1[0], ty: -20, tz: 198, d: 900, az: -20, el: 8, ...CLOSE }, //        lock 1
  wing: { ...P, tx: -500, ty: -100, tz: 500, d: 2800, az: 40, el: 26, ...SHARP }, // the overwing exits, the people on both wings, the two front rafts
  belly: { ...P, tx: 1000, ty: -200, tz: 0, d: 1800, az: 20, el: -8, ...CLOSE }, //                    the aft hull that takes the blow
  safety: { ...P, tx: A320.card[0], ty: A320.card[1] + 2, tz: A320.card[2], d: 95, az: 75, el: 18, ...CLOSE }, // pax 0
  water: { ...P, tx: -300, ty: -120, tz: 0, d: 9000, az: -150, el: 3, ...SHARP }, // track 1860: afloat, Midtown behind
  ferries: { ...P, tx: 0, ty: -120, tz: 0, d: 14000, az: -30, el: 30, fov: 36, ...SHARP },
  toWater: { ...P, tx: -500, ty: -200, tz: -1500, d: 9000, az: -112, el: -3, fov: 38, ...SHARP }, // track 1830: bridge far left, Manhattan right
  skyHigh: { ...P, tx: -500, ty: -600, tz: 0, d: 7000, az: 60, el: 12, fov: 36, ...SHARP }, // high 1
  runway: { ...P, tx: 600, ty: -300, tz: 0, d: 7000, az: -129, el: 3, fov: 34, ...SHARP }, // track 1494
  heli: { ...P, tx: -4600, ty: -10800, tz: -3000, d: 30000, az: 70, el: 26, fov: 34, ...SHARP }, // track 1730
  // CARTE (spot 0: the maquette · spot 1: the basin)
  mapWide: { ...P, tx: 200, ty: 0, tz: -230, d: 1650, az: -6, el: 52, ...SHARP },
  mapStrike: { ...P, tx: 435, ty: 30, tz: -420, d: 700, az: 20, el: 35, ...SHARP },
  mapLGA: { ...P, tx: 480, ty: 0, tz: -250, d: 900, az: 30, el: 40, ...SHARP },
  mapTEB: { ...P, tx: 50, ty: 0, tz: -400, d: 1000, az: -20, el: 40, ...SHARP },
  mapRiver: { ...P, tx: 100, ty: 0, tz: -250, d: 1000, az: 10, el: 35, ...SHARP },
  mapSims: { ...P, tx: 420, ty: 0, tz: -280, d: 1000, az: -10, el: 58, ...SHARP },
  mapFerries: { ...P, tx: 0, ty: 0, tz: 0, d: 450, az: -30, el: 40, ...SHARP },
  basin: { ...P, tx: 2975, ty: 3, tz: 0, d: 250, az: -28, el: 11, ...CLOSE },
  // BENCH (spot 0: the QRH · 1: the engine stand · 2: the lineup)
  qrh: { ...P, tx: 0, ty: 0, tz: 1, d: 62, az: -15, el: 55, ...CLOSE },
  stand: { ...P, tx: -100, ty: 130, tz: 0, d: 1000, az: -50, el: 12, ...SHARP },
  gun: { ...P, tx: -160, ty: 150, tz: 0, d: 650, az: -62, el: 10, ...CLOSE }, // gun 0 → 1 (impact at 0.55)
  lineup: { ...P, tx: -30, ty: 60, tz: 0, d: 1100, az: -12, el: 12, ...SHARP }, // listK 0 → 4
  hook7: { ...P, tx: -640, ty: -230, tz: 575, d: 1000, az: -72, el: -14, fov: 48, side: 120, ...SHARP }, // under the left intake, looking up
  limitSide: { ...P, tx: -900, ty: 100, tz: 0, d: 4200, az: 0, el: 2, ...SHARP }, // limit 1, aoa 0 → 1: the R 8 m arc ahead of the nose
  splash: { ...P, tx: 600, ty: -150, tz: 0, d: 4200, az: -25, el: 4, ...SHARP }, // the touchdown's spray (track 1843)
  thumb: { ...P, tx: -500, ty: -120, tz: 300, d: 2300, az: -40, el: -8, fov: 34, ...SHARP },
  thumb3: { ...P, tx: -1310, ty: -110, tz: 420, d: 900, az: -40, el: 14, fov: 36, ...SHARP }, // lock 1
  descent: { ...P, tx: -3000, ty: -1500, tz: 0, d: 16000, az: 82, el: 7, fov: 38, ...SHARP }, // track 1745: down the Hudson, Manhattan ahead left
  mapPlan: { ...P, tx: 220, ty: 0, tz: -200, d: 1750, az: 8, el: 46, ...SHARP }, // charlotte 1
};

/* ───────────────────────────── the seams between the chapter files ───────────────────────────── */
// Two kinds. A MOVE (`from` [a, b], `to`): D.match — the camera keeps its way across the seam (inside one place).
// A CUT (`set`, `to`, `fade`): the file that ends has finished its last shot by `at`; the file that starts cuts there
// to a COMPLETE state. All PROVISIONAL (set on the stubs): recheck on the real sets before the chapters.
export const HAND = {
  // c1 → c2, "Mais certifié pour toucher l'eau comment ?…" (the basin) → "Il y a même un bouton dans le cockpit"
  c12: { at: "bouton-0.15", set: SET.VOL, to: VIEW.overhead, state: { lock: 1, fs: 150 }, fade: 0.2 },
  // c2 → c3, "…trois choses que cet avion n'a pas." (the binder) → "De l'altitude, d'abord" (the plane low over the city)
  c23: { at: "altitude-0.15", set: SET.VOL, to: { ...P, tx: -1500, ty: 0, tz: 0, d: 9000, az: 50, el: 40, fov: 40, ...SHARP }, fade: 0.2 },
  // c3 → c4, the helicopter ("dans les parages") → "le commandant regarde de l'autre côté du fleuve": the camera keeps
  // turning, from the helicopter below toward the plane's right (west: New Jersey, Teterboro)
  c34: {
    at: "teterboro-0.2",
    from: [{ ...P, tx: 0, ty: -500, tz: 0, d: 8000, az: 60, el: 20, ...SHARP }, { ...P, tx: 0, ty: -400, tz: -300, d: 7600, az: 100, el: 16, ...SHARP }],
    to: { ...P, tx: -400, ty: -300, tz: -1500, d: 7600, az: 140, el: 12, ...SHARP },
    opt: { before: 1.2, after: 1.4 },
  },
  // c4 → c5, the slide-rafts ("…personne n'exigeait sur ce vol.") → "Dehors, moins sept degrés": the camera pulls back
  // from the front door to the whole plane afloat, people on the wings and the rafts
  c45: {
    at: "froid-0.2",
    from: [{ ...P, tx: A320.doors.L1[0], ty: -60, tz: 260, d: 1400, az: -25, el: 10, ...CLOSE }, { ...P, tx: -900, ty: -80, tz: 200, d: 2600, az: -22, el: 13, ...SHARP }],
    to: { ...P, tx: -300, ty: -100, tz: 0, d: 4800, az: -20, el: 17, ...SHARP },
    opt: { before: 1.0, after: 1.6 },
  },
  // c5 → c6, "…aucune pour une panne aussi basse." (the binder) → "Mais il y a un geste…" (the tail, the APU)
  c56: { at: "geste-0.15", set: SET.VOL, to: VIEW.apu, state: { lock: 1, fs: 500 }, fade: 0.2 },
};
/** The chapter files and their seams. */
export const SEAMS = { c1: [null, "c12"], c2: ["c12", "c23"], c3: ["c23", "c34"], c4: ["c34", "c45"], c5: ["c45", "c56"], c6: ["c56", null] };
/** The time a chapter FILE owns (`span(D, "c3")`): from the seam it starts on to the seam it ends on. */
export const span = (D, file) => {
  const [a, b] = SEAMS[file];
  return [a ? D.at(HAND[a].at) : 0, b ? D.at(HAND[b].at) : D.END];
};
/** The chapter cards come in this long before their chapter's first word (long.js · chaptersOf). */
export const CARD_LEAD = 0.9;
export const cardAt = (D, beat) => D.at(beat) - CARD_LEAD;
/** A cut lands ON a frame (30 fps). */
export const onFrame = (t) => Math.round(t * 30) / 30;
/**
 * Lays a file's half of a seam: `seam(D, "c34", "out")` at the end of c3; at the start of c4,
 * `seam(D, "c34", "in", { set: SET.VOL, state: { ...AT.hit, … } })`. A CUT seam has no "out" half (returns null).
 * Returns the pose the camera reaches after the seam.
 */
export const seam = (D, name, only, extra = {}) => {
  const h = HAND[name];
  const at = onFrame(D.at(h.at));
  const state = { ...(extra.state ?? {}), ...(h.state ?? {}) }; // the seam's own numbers (lock…) win: its pose depends on them
  if (h.from) return D.match(at, h.from, h.to, { ...h.opt, ...extra, state, only });
  if (only === "out") return null;
  D.cut(at, extra.set ?? h.set, h.to, state, { fade: extra.fade ?? h.fade });
  return h.to;
};

/* ───────────────────────────── the world ───────────────────────────── */
const PA = new Float64Array(7); // pathAt's output, reused
const eul = new THREE.Euler(0, 0, 0, "ZYX");

export function buildWorld(stage) {
  const scene = stage.scene;
  let clock = () => COUNT.from;

  /* VOL: the plane at the origin, New York under it */
  const vol = new THREE.Group();
  const plane = new THREE.Group(); // the plane's frame: pitched and banked about the origin
  const geo = new THREE.Group(); //   the geographic frame: rotated and slid so that the plane stands at the origin
  const tilt = new THREE.Group(); //  `lock` 1: the world takes the plane's pitch and bank (inverse), the plane stays level
  tilt.add(geo);
  vol.add(tilt, plane);
  scene.add(vol);
  const avion = buildAvion();
  plane.add(avion.group);
  const hudson = buildHudson();
  geo.add(hudson.group);
  const sys = buildSystemes();

  /* CARTE */
  const carte = buildCarte();
  scene.add(carte.group);

  /* BENCH: three spots, one shown at a time (`spot`), each on its own bench at the origin (its halo at its size) */
  const benches = BENCH.sizes.map((size) => makeBench(size));
  const benchRoot = new THREE.Group();
  benches.forEach((b) => benchRoot.add(b.group));
  scene.add(benchRoot);
  const [spotQ, spotS, spotL] = benches.map((b) => b.group);
  spotS.add(sys.stand.group);
  spotL.add(sys.lineup.group);
  const raft = makeRaft();
  const ferry = makeFerry();
  sys.lineup.A.slot3.add(raft.group);
  sys.lineup.A.slot4.add(ferry.group);

  /* the systems' homes: in the plane (VOL) or on the bench */
  const home = (obj, parent, pos = null) => {
    if (obj.parent !== parent) parent.add(obj);
    if (pos) obj.position.set(pos[0], pos[1], pos[2]);
  };
  let placed = -1;
  const place = (set) => {
    if (set === placed) return;
    placed = set;
    home(sys.cockpit.group, plane, [C.floorX, C.floorY, 0]);
    home(sys.apu.group, plane, [A320.apu.x, A320.apu.y, 0]);
    if (set === SET.BENCH) {
      home(sys.engine.group, sys.stand.A.mount, [0, 0, 0]);
      home(sys.qrh.group, spotQ, [0, 0, 0]);
    } else {
      home(sys.engine.group, plane, [E.x, E.y, E.z]);
      home(sys.qrh.group, sys.cockpit.A.lap, [0, 0, 0]);
    }
  };

  /** The plane's attitude and place at `time` (no allocation): fills PA, returns nothing. */
  const attitude = (S, time) => {
    pathAt(S.track >= 0 ? S.track : clock(time), PA);
    PA[4] += S.pitch + S.sink * 6;
    PA[5] += S.bank;
  };

  return {
    avion, sys, hudson, carte, benches, plane, geo,
    setClock(fn) {
      clock = fn;
    },
    apply(S, time) {
      const set = Math.round(S.set);
      const px = stage.pixelScale();
      vol.visible = set === SET.VOL;
      carte.group.visible = set === SET.CARTE;
      benchRoot.visible = set === SET.BENCH;
      place(set);
      const spot = Math.round(S.spot);
      const track = S.track >= 0 ? S.track : clock(time);
      let fx = 0, fy = 0, fz = 0;

      if (set === SET.VOL) {
        attitude(S, time);
        // the plane: pitch about z (nose −x up = −), bank about x (right wing, −z, down = −) — all of it on the plane
        // (`lock` 0) or all of it, inverted, on the world (`lock` 1): the same picture of the two, a different camera
        const lk = Math.min(1, Math.max(0, S.lock));
        plane.rotation.set(-PA[5] * DEG * (1 - lk), 0, -PA[4] * DEG * (1 - lk), "ZYX");
        eul.set(-PA[5] * DEG * lk, 0, -PA[4] * DEG * lk, "ZYX");
        tilt.quaternion.setFromEuler(eul).invert();
        // the world: R_y(ψ) · T(−P), ψ so that the plane's way (compass PA[3]) points to −x
        const dx = Math.sin(PA[3]);
        const dz = -Math.cos(PA[3]);
        const psi = Math.atan2(dz, dx) + Math.PI;
        const c = Math.cos(psi);
        const s = Math.sin(psi);
        const alt = PA[1] + S.high * HIGH;
        geo.rotation.set(0, psi, 0);
        geo.position.set(-(PA[0] * c + PA[2] * s), -alt, -(-PA[0] * s + PA[2] * c));
        const ctx = { t: track, camera: stage.camera, alt, speed: PA[6], high: S.high };
        avion.update(S, time, px, ctx);
        sys.update(S, time, px, ctx);
        hudson.update(S, time, px, ctx);
        fx = stage.cam.tx; // the light stands around what the camera looks at
        fy = stage.cam.ty;
        fz = stage.cam.tz;
      } else if (set === SET.CARTE) {
        carte.update(S, time, px, { t: track });
        [fx, fy, fz] = SPOTS.carte[Math.min(spot, 1)];
      } else {
        const b = Math.min(spot, 2);
        benches.forEach((bb, i) => (bb.group.visible = i === b));
        sys.update(S, time, px, { t: track, bench: true });
        benches[b].set({ pool: S.pool * 0.5, /* the bench is wide: its halo halved (relecture 02/11, too green) */ grid: S.grid, mood: S.mood });
        [fx, fy, fz] = SPOTS.bench[b];
      }

      Object.assign(stage.focus, { x: fx, y: fy, z: fz, scale: S.fs });
      setMood(stage, S.mood, 0);
      const d = stage.cam.d;
      scene.fog.density = set === SET.BENCH ? benches[Math.min(spot, 2)].fog(d) : set === SET.CARTE ? 0.02 / Math.max(800, d) : (0.012 * S.haze) / Math.max(8000, d);
    },
  };
}
