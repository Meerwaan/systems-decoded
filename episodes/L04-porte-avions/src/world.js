// DOSSIER L04 — Le pont d'envol du Charles de Gaulle (format long, 16:9) : the world. This file is the CONTRACT between
// the sets and the chapters:
//   · plan.js   where everything stands (read by every set; no import there)
//   · SET       the two places, one shown at a time: the PONT (the Charles de Gaulle at sea, day → night) and the BENCH
//   · FIRST     the state of the world on the first frame — THE CLOSED LIST of numbers the chapters may move
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · AT        complete states, one per place: a chapter that cuts to a place writes { ...AT.deck, …what differs }
//   · HAND      the seams between two chapter files: the move each one hands to the next (D.match, `only`)
//   · apply     what each number does to the world, every frame (depends on S and time only)
//   · ride      the camera can RIDE your aircraft (`ride` 1): see FIRST
//
// THE SETS (one file each, built at the same time against plan.js):
//   navire.js  the ship like an X-ray — hull, a deck that is nothing but its paint, island, hangar and its two lifts,
//              the anti-heel masses on their rails, the nuclear steam plant and its main, the fuel holds, the fire
//              detectors and the hangar's curtain, the stabiliser fins — and around it the sea and the sky, day → night
//   model.js   the SOLID systems we open: the two steam catapults (cylinders, pistons, shuttle and its hook, the slot,
//              the water brake), the HOLDBACK BAR and its calibrated piece (the hero: "la pièce"), the launch valve and
//              its dial, the steam receiver, the control cabin, the jet blast deflector, the three wires and their
//              brake, the landing mirror (its ball, its datum and wave-off lights), the laser, the glide guides; on the
//              bench, a steam cylinder beside an electromagnetic launcher, Ely's ropes and sandbags (1911)
//   bord.js    who lives on the deck: your Rafale M (from 015's, glass with its solid wheels, hook, nozzles, launch
//              bar, you in the seat, the head-up display), the next aircraft, the parked ones, the hangar's, the tanker;
//              the people of glass (your yellow dog — his vest, the only solid thing on him —, the deck crew, the cabin's
//              engineer and operator, the landing officer and his paddles); Pedro the helicopter and its diver; on the
//              bench, the deck-plan table and its little aircraft, and the Forrestal's (1967), its rocket, its fire
//
// THREE COLOURS, and what they mean in THIS film: signal is THE THREAT — the heat of the engines at full power, the
// sea at the end of the deck, the fire (1967, the fuel holds), the ball too low, the wave-off lights. veille is WHAT
// LAUNCHES AND CATCHES YOU — the steam (receiver, valve, cylinders), the holdback that holds then gives, the wire that
// takes the hook, the masses that keep the deck flat, the mirror's datum, the yellow dog's vest. ink is the structure.
// The calibrated piece: ink at rest, veille while it HOLDS under load, a white light that has a place when it breaks.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { BRAND } from "@kit/brand.js";
import { ROLL, CAT, onCat, onAngled, TOUCH, HOLDBACK, TANK, VALVE, CABIN, ISLAND, LIFTS, MASSES, PLANT, MIRROR, LSO, BRINS, ENGINE, PEDRO, CREW, RAFALE, BENCH, jetAt } from "./plan.js";
import { buildNavire } from "./navire.js";
import { buildModel } from "./model.js";
import { buildBord } from "./bord.js";
import { dressMer, dressPont } from "./habillage.js"; // the decorator: the life of the places

const DEG = Math.PI / 180;

export const SET = { PONT: 0, BENCH: 1 };
/** ≈ the radius of the hero holdback bar on the bench: sizes the bench, its pool, its shadows (the stage's `scale`). */
export const SIZE = BENCH.size;
export const FAR = 600000;

/** The header: the step of the day on the deck (ÉTAPE 03 / 10 · Le catapultage). 0 = "Pont d'envol". */
export const STEPS = ["La catapulte", "Les gestes", "Le catapultage", "Le réacteur", "La stabilité", "Le feu", "Le miroir", "L'officier", "Les brins", "L'appontage"];
/** The chapter that sets each step (its first beat). The chapter files `now` `etape` on their card; CARD.sub reads it. */
export const CHAP_STEP = { ouvre: 1, bravo: 2, avance: 3, fonce: 4, gite: 5, r2menace: 6, tombee: 7, lso: 8, ely: 9, approche: 10 };
/** The chapter cards: their small line, and the line under the rule. Never "série" (Merwan, 20/10). */
export const CARD = {
  kicker: () => "Dossier L04 · Pont d'envol",
  sub: (c) => (CHAP_STEP[c.id] ? `Étape ${String(CHAP_STEP[c.id]).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}` : ""),
};
/** The header's readout, "Ton Rafale": `kmh` in km/h (signal above 0, ink at 0), −1 "En vol" (veille), −2 "Arrêté" (veille). */
export const LINE_HUD = {
  word: "Étape",
  off: "Pont d'envol",
  fmt: (v) => (v <= -1.5 ? "Arrêté" : v < 0 ? "En vol" : `${Math.round(v)} km/h`),
  tone: (v) => (v < 0 ? BRAND.veille : v >= 1 ? BRAND.signal : BRAND.ink),
};

/* ───────────────────────────── the first frame ───────────────────────────── */

// THE FIRST FRAME is the hook: "Tes moteurs sont à fond. Et ton Rafale ne bouge pas." Your Rafale on the bow catapult at
// dawn, engines at full power (the two cores white-hot, the blast streaming back into the raised deflector, the whole
// airframe trembling), the holdback bar taut behind the nose gear, the slot running away to the bow and the signal sea
// beyond it. The film loops: the last sentence ("Et demain matin, sur cette catapulte…") lands here, and the LAST 15 s
// leave the right half of the frame to YouTube's end screen — the subject stands in the LEFT half (`side` > 0).
// CANDIDATES (VIEW.hook1 … hook3): the orchestrator picks one on a board before the chapters, and pastes it here.
const NG = CAT[0].from; // the nose-gear tow point at launch
export const POSE0 = { tx: NG[0], ty: 190, tz: NG[2] + 400, d: 1700, az: -8, el: 9, fov: 46, shift: 60, side: 200, roll: 0, drift: 0.3, dof: 0 }; // = hook3, chosen on the board of six (23/10): the two cores white-hot, the deck running to the signal horizon

export const FIRST = {
  set: SET.PONT,
  /* ── the header (main.js reads them) ── */
  etape: 0, //    the step on screen: 1 … 10 (STEPS), 0 = "Pont d'envol". Integer: `now`, never `st`
  kmh: 0, //      "Ton Rafale": km/h (values the voice says: 0, 240 — a ramp between them during the launch only), −1 "En vol", −2 "Arrêté". `now` (or one `st` 0 → 240)
  kmhOn: 1, //    1 shows the readout, 0 "—"
  /* ── the camera ── */
  ride: 0, //     1: every shot is written around where YOUR aircraft stands at run 0 of its track, and the camera rides
  //              with it (track 1: the shuttle's start CAT[0].from; 3: the touchdown point onAngled(TOUCH.s); 2: the
  //              bow). `now` ON A CUT ONLY (switched mid-shot, the picture jumps). 0 with any heel
  /* ── the ship and the sea (navire.js) ── */
  ship: 1, //     the X-ray of the ship: hull, island, the deck's paint (0–1). Lower it to let a solid thing read
  sea: 1, //      the sea and the sky (0–1)
  night: 0, //    0 dawn/day (the horizon a signal glow ahead: the sea you fall into) → 1 night (black, the ship a handful of lights)
  lights: 0, //   the ship's own night lights: deck edge, runway centreline, drop lights at the stern (0–1)
  taxi: 0, //     the coloured taxi lights the aviation bridge switches on along your way to the catapult (0–1: veille ahead, signal stop bars)
  speed: 0.4, //  the ship's way through the water: the sea going by, the bow wave, the wake (0–1; 1 = flat out, 27 knots)
  wind: 0.4, //   the wind over the deck, drawn as long streaks running aft (0–1)
  under: 0, //    how much the deck lets one see under it, around the catapults and the brakes (0 a deck · 1 clear glass, the trough lit)
  angled: 0, //   the angled runway's paint lit veille (0–1): "une piste en biais"
  cutaway: 0, //  the hull cut across at the masses' forward rows (0 whole · 1 sectioned: we look into it from ahead, az ≈ 180)
  heel: 0, //     degrees the WHOLE SHIP heels (positive: starboard down). The sea and the sky stay level
  masses: 0, //   where the anti-heel masses are on their rails: −1 port … 0 middle … 1 starboard
  massGlow: 0, // the masses lit veille (0–1): "quelque chose se met en marche"
  fins: 0, //     the stabiliser fins and the rudder lit veille and working (0–1)
  lift: 0, //     the forward lift's platform: 0 at the deck → 1 down at the hangar floor (it carries two aircraft: bord.js)
  hangar: 0, //   the hangar lit from inside, its aircraft asleep in it (0–1)
  curtain: 0, //  the hangar's fire curtain: 0 up → 1 down, cutting it in two (veille)
  detectors: 0, // the fire detectors, ≈ a thousand points of veille through the hull (0–1)
  plant: 0, //    the nuclear steam plant lit (0–1): the two reactors low amidships
  feed: 0, //     steam running from the plant up the main to the receiver (0–1: veille dashes that run at a FIXED speed — never tween it in < 0.4 s)
  fuel: 0, //     the aviation fuel holds lit signal (0–1)
  coast: 0, //    a coastline far on the horizon ("te poser à terre", 0–1)
  swell: 0.2, //  the sea's swell (0 calm → 1 "mer forte": long heavy rollers — the deck stays flat over them)
  windAxis: 0, // the wind streaks run along the keel (0) or along the angled runway's axis (1: "le vent dans l'axe de cette piste")
  mist: 0, //     a night mist over the sea and the deck (0–1): far lights blur into halos and fade ("si la visibilité le permet")
  /* ── the catapults and the wires (model.js) ── */
  explode: 0, //  "on l'ouvre", IN PLACE: the bow catapult comes apart out of its trough — the deck strip over it lifts, the
  //              two cylinders part sideways, the pistons slide out, the shuttle rises, the holdback lifts, the valve and
  //              the receiver step out below (0 → 1)
  trace: 0, //    a veille head of light running the bow catapult's slot from the shuttle to the bow (0 → 1: the 75 m, drawn; it stays lit at 1; brought back to 0, the head RUNS BACK: never do that on screen)
  traceOut: 0, // the trace fades where it stands, without running back (0 → 1). To clear it: `traceOut` → 1, then (off screen
  //              or on a cut) `trace` 0 and `traceOut` 0 together
  named: 0, //    the part the voice names, lit veille (`now`, integer): 0 none · 1 cylinders · 2 pistons · 3 shuttle and its
  //              hook · 4 the slot · 5 the holdback and its piece · 6 the receiver · 7 the launch valve · 8 the cabin ·
  //              9 the oblique catapult · 10 the mirror · 11 the wires (with `wireName`) · 12 a brake
  shuttle: 0, //  metres the bow catapult's shuttle (and its pistons) has travelled: 0 → 75 (the water brake). ≈ 0.15 when tensioned
  hooked: 1, //   your nose gear's launch bar in the shuttle's hook (0–1). While hooked, YOUR aircraft rides the shuttle:
  //              its run is max(run, shuttle) — after the release, `run` goes on alone past 75
  held: 1, //     the holdback bar fixed to the deck fitting (0–1). At 0 (and `hooked` 0) the bar lies on the deck at its fitting, waiting
  strain: 1, //   the load on the holdback: 0 slack · 1 taut, the calibrated piece glows veille, trembling with the aircraft
  broken: 0, //   the calibrated piece parts (0 → 1): a white light at the neck (two frames up, dies small), the two halves apart
  press: 0.3, //  steam pressure behind the pistons (0–1): the cylinders glow veille from aft to fore as it builds
  valve: 0, //    the launch valve open (0–1): steam runs from the receiver into the cylinders
  dial: 0.5, //   the valve's setting, a graduated wheel on its side (0–1): it turns as the cabin sets the shot
  tank: 0.6, //   the receiver full of steam, drawn (0–1)
  jbd: 1, //      the jet blast deflector raised behind your nozzles (0–1)
  cabin: 0, //    the control cabin lit (its glazing veille, its screens) (0–1)
  shuttle2: 0, // the oblique catapult's shuttle, metres (it waits at 0); its slot and shuttle lit veille with `named` 9
  wires: 0.3, //  the three wires lit veille, taut across the runway (0–1)
  wireName: 0, // which wire is named (`now`): 0 none · 1 Athéna · 2 Aphrodite · 3 Andromède (lit brighter, a label anchor)
  caught: 0, //   your hook has Andromède: its bight follows the hook (0–1)
  pull: 0, //     metres Andromède has run out (0 → ≈ 90)
  brake: 0, //    Andromède's brake under the deck at work: the ram travels, the oil heats (0–1)
  mirror: 0, //   the landing mirror lit (0–1): the datum arms veille
  ball: 0, //     the meatball: −1 low … 0 on the datum … 1 high (it turns signal below ≈ −0.3)
  waveoff: 0, //  the mirror's wave-off lights, signal (0–1; a steady light, a slow breath — never a blink)
  laser: 0, //    the laser that picks you up early: a thin veille beam from the ship to your aircraft (0–1)
  guides: 0, //   three thin veille guides in the night, in turn: 0 → 1/3 the glide slope · → 2/3 your aircraft's angle (a bracket at its nose) · → 1 the runway's centreline extended
  bdial: 0.5, //  the setting wheel on Andromède's brake (0–1): it turns as the brake is set "pour l'avion qui arrive"
  /* ── the bench ── */
  coils: 0, //    bench item 2: the electromagnetic launcher's coils light in a wave along it (0 → 1)
  item: 0, //     what stands on the bench (`now`): 0 the holdback bar (the hero, re-parented) · 1 the deck-plan table ·
  //              2 steam cylinder beside an electromagnetic launcher · 3 the Forrestal's table (1967) · 4 Ely's ropes (1911)
  /* ── your aircraft (bord.js) ── */
  jet: 1, //      your Rafale shown (0–1)
  track: 1, //    where it is (`now`, integer — see plan.js · jetAt): 1 the bow catapult · 2 in the air ahead · 3 the angled runway
  run: 0, //      metres along its track (see jetAt): 1 from the shuttle's start, 3 from the touchdown point (negative: on the glide slope)
  alt: 0, //      metres above where the track puts it (the climb-out, a go-around)
  bank: 0, //     degrees of roll (a turn: the go-around's circuit)
  gas: 1, //      the throttle and what the nozzles answer: 0.5 idle · 1 full power (no afterburner flame: a hard, bright core)
  tremble: 1, // the airframe trembling under full power (0–1: a shiver AT THE FRAME RATE — a stable blur — on a slow sway)
  hook: 0, //     the arrestor hook: 0 up against the tail · 1 down
  you: 1, //      you in the seat (0–1)
  hud: 0, //      the head-up display lit veille in front of your eyes (0–1)
  next: 0, //     the next aircraft (0–1), on the bow catapult's track at `nextRun` metres (negative: taxiing up)
  nextRun: -30,
  parked: 0.6, // the aircraft parked on deck (0–1); `running`: their engines at idle: two signal cores each (0–1)
  running: 0,
  fleet: 0, //    the aircraft asleep in the hangar (0–1; two of them ride the forward lift)
  tanker: 0, //   a tanker Rafale beside you in the air, its hose and basket out (0–1)
  /* ── the people (bord.js) — all of glass ── */
  dog: 1, //      your yellow dog, ahead of your nose on the bow catapult (0–1)
  sig: 3, //      his gesture (`now`): 0 at rest · 1 "come forward" (both arms beckoning) · 2 "tension" (one hand raised, flat) ·
  //              3 "full power" (two fingers circling over his head) · 4 "launch" (he kneels, his arm points to the bow) ·
  //              5 "stop" (arms crossed over his head) · 6 "wave off" (both arms waving over his head)
  vest: 0.35, //  his vest, veille: 0.35 worn · 1 lit ("Le jaune, c'est son gilet")
  crew: 0.6, //   the other deck hands, standing clear (0–1)
  cabinCrew: 0, // the engineer and the operator in the cabin (0–1)
  lso: 0, //      the landing officer and his team on their platform (0–1); `lsoArm` 0 handset down → 1 raised (wave off)
  lsoArm: 0,
  paddles: 0, //  the landing officer of before the 1960s: two coloured paddles in his raised hands (0–1)
  pedro: 0, //    Pedro, the rescue helicopter, abeam to port, its diver at the door (0–1)
  /* ── the tables (bord.js, on the bench) ── */
  zones: 0, //    the deck plan's six zones drawn (0–1)
  tokens: 0, //   the little aircraft set on it (0–1)
  green: 0, //    their discs: available, veille (0–1) · `red` grounded, signal (0–1)
  red: 0,
  rocket: 0, //   1967: the rocket's run from one aircraft to another (0 → 1)
  fire: 0, //     1967: the fire on the Forrestal's table, spreading from token to token (0 → 1: a light that has a place, never a wall)
  burnt: 0, //    1967: the burnt tokens go dark (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal on the rim (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); `hot` warms the background (0–1); the bench's pool and grid
  fx: NG[0], fy: 150, fz: NG[2] + 400, fs: 900, mood: 1, gel: 0, hot: 0.12, pool: 0.2, grid: 0.16,
};

/** Everything at rest: what a cut to any place starts from (then AT.* says what that place needs). */
const REST = {
  ride: 0,
  ship: 1, sea: 1, night: 0, lights: 0, taxi: 0, speed: 0.4, wind: 0.4, under: 0, angled: 0, cutaway: 0, heel: 0, masses: 0, massGlow: 0, fins: 0,
  lift: 0, hangar: 0, curtain: 0, detectors: 0, plant: 0, feed: 0, fuel: 0, coast: 0, swell: 0.2, windAxis: 0, mist: 0,
  explode: 0, trace: 0, traceOut: 0, named: 0, shuttle: 0, hooked: 1, held: 1, strain: 0, broken: 0, press: 0, valve: 0, dial: 0.5, tank: 0.6, jbd: 0, cabin: 0, shuttle2: 0,
  wires: 0.3, wireName: 0, caught: 0, pull: 0, brake: 0, mirror: 0, ball: 0, waveoff: 0, laser: 0, guides: 0, bdial: 0.5,
  coils: 0, item: 0,
  jet: 1, track: 1, run: 0, alt: 0, bank: 0, gas: 0.5, tremble: 0, hook: 0, you: 1, hud: 0, next: 0, nextRun: -30, parked: 0.6, running: 0, fleet: 0, tanker: 0,
  dog: 1, sig: 0, vest: 0.35, crew: 0.6, cabinCrew: 0, lso: 0, lsoArm: 0, paddles: 0, pedro: 0,
  zones: 0, tokens: 0, green: 0, red: 0, rocket: 0, fire: 0, burnt: 0,
  mood: 0, gel: 0, hot: 0, pool: 0.2, grid: 0.16,
};
/**
 * Complete states, one per place. AT does NOT say the header (`etape`, `kmh`, `kmhOn`): the chapter does, on every cut.
 * Nor the light's place (`fx, fy, fz, fs`) when the chapter knows better — AT gives a sane one.
 */
export const AT = {
  // the deck by day, your Rafale waiting on the bow catapult (hooked, held, idle), your dog ahead of it
  deck: { ...REST, mood: 1, hot: 0.12, fx: NG[0], fy: 150, fz: NG[2] + 400, fs: 900 },
  // the same, at night: the ship a handful of lights, nobody on the catapult (the deck is cleared for the landing)
  night: { ...REST, night: 1, lights: 1, mood: 1, hot: 0.05, dog: 0, crew: 0, parked: 0.6, wires: 0.6, mirror: 1, jet: 1, track: 3, run: -900, hook: 1, gas: 0.8, fx: onAngled(TOUCH.s)[0], fy: 200, fz: onAngled(TOUCH.s)[2], fs: 2500 },
  // inside the hull (hangar, masses, plant): the ship's X-ray, the deck clear, nothing on the catapult in the way
  hull: { ...REST, under: 0.6, mood: 0, hot: 0, jet: 0, dog: 0, crew: 0, parked: 0.6, fx: 0, fy: -900, fz: 0, fs: 3500 },
  // the hull cut across (VIEW.section, from ahead: the camera stands INSIDE the bow, ahead of plan.js · CUT): navire.js
  // discards what is ahead of the cut, model.js and bord.js do not — so nothing of theirs is drawn there
  section: { ...REST, cutaway: 1, under: 0, explode: 0, press: 0, tank: 0, jbd: 0, mood: 0, hot: 0, jet: 0, next: 0, dog: 0, crew: 0, parked: 0, massGlow: 1, fx: 0, fy: -900, fz: -3500, fs: 3500 },
  // the bench: the holdback bar alone on its pool (the light around its calibrated piece)
  bench: { ...REST, jet: 0, dog: 0, crew: 0, parked: 0, item: 0, fx: 0, fy: 20, fz: 0, fs: SIZE, pool: 0.3 },
};

/* ───────────────────────────── the poses ───────────────────────────── */

/** The poses that frame each place (complete: nothing is inherited across a cut). POSED on stand-ins: the sets give better ones.
 *  Every pose says its lens: `...CLOSE` (close and medium shots: dof 5) or `...SHARP` (wide shots, exploded views, the
 *  bench's documents, the first frame, under a chapter card). */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
export const CLOSE = { dof: LOOK.dof };
export const SHARP = { dof: 0 };
const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const T0 = onAngled(TOUCH.s); //  the touchdown point
const HB = [NG[0], 30, NG[2] + HOLDBACK.len * HOLDBACK.piece]; // the calibrated piece, in place
const A3 = onAngled(BRINS.s[2]); // Andromède, in the middle of the runway
/** The cockpit, seen from just behind your helmet, looking where the aircraft goes: written around run 0 of track `track`
 *  (ride 1 carries it). `d` how far ahead it aims, `el` how much it looks down. */
/** `pitch`: the aircraft's nose-up (jetAt gives 5° on the approach, 0 on the deck): the eye rises with it around the
 *  main wheels — without it, on the approach the camera sits 40 cm low, behind the instrument panel (seen). */
export function cockpitPose(track = 3, { d = 600, el = 4, fov = 46, pitch = 0 } = {}) {
  const J = jetAt(track, 0, 0, [0, 0, 0, 0, 0]);
  const yaw = J[3];
  // the eye over your right shoulder (bord.js, seen): (20, 300, cockpit + 40) in the aircraft's frame — the helmet on the
  // left edge, the head-up display readable, the deck ahead
  const lx = 20;
  const lz = RAFALE.cockpit[2] + 40;
  const eye = [J[0] + lx * Math.cos(yaw) + lz * Math.sin(yaw), J[1] + 300 + (RAFALE.mains - lz) * Math.sin(pitch * DEG), J[2] - lx * Math.sin(yaw) + lz * Math.cos(yaw)];
  const az = yaw / DEG; // the camera behind the eye along the heading
  const ce = Math.cos(el * DEG);
  return { ...P, tx: eye[0] - d * Math.sin(az * DEG) * ce, ty: eye[1] - d * Math.sin(el * DEG), tz: eye[2] - d * Math.cos(az * DEG) * ce, d, az, el, fov, ...SHARP };
}
export const VIEW = {
  hook: POSE0,
  /* ── the hook: three candidates for the first frame (the orchestrator picks one on a board before the chapters) ── */
  // 1 the whole Rafale in profile, low from port: the blast streaming back into the raised deflector, the holdback taut to
  //   the deck, the bow and the signal sea ahead on the left — "ne bouge pas" reads by everything streaming past it
  hook1: { tx: NG[0], ty: 210, tz: NG[2] + 500, d: 2300, az: -90, el: -2, fov: 34, shift: 0, side: 260, roll: 0, drift: 0.3, dof: 0 },
  // 2 at the nose gear, low, from ahead and to port: the launch bar in the shuttle's hook, the holdback bar taut behind
  //   the wheel, the intakes and the canopy above, the nozzles' glow at the far end — the system already there, big
  hook2: { ...P, tx: NG[0], ty: 70, tz: NG[2] + 60, d: 520, az: -150, el: 5, fov: 40, side: 260, ...SHARP },
  // 3 behind the tail, just over the raised deflector (015's DNA, from a little higher): its top edge low in the frame, the
  //   two cores white-hot, the blast hitting the panel, the slot running to the bow between the wheels, the signal horizon
  hook3: { ...P, tx: NG[0], ty: 190, tz: NG[2] + 400, d: 1700, az: -8, el: 9, fov: 46, shift: 60, side: 200, ...SHARP }, // above the raised deflector (at el < 6 it hides everything)
  // 4 three-quarter rear from port, at deck level: the nozzles' heat near the camera, the whole aircraft, a deck hand of glass in the foreground
  hook4: { ...P, tx: NG[0], ty: 180, tz: NG[2] + 300, d: 1800, az: -40, el: 1, fov: 40, side: 250, ...SHARP },
  // 5 under the wing, low: the main wheels and the nose gear with its holdback, the dawn beyond the bow
  hook5: { ...P, tx: NG[0], ty: 120, tz: NG[2] + 200, d: 1100, az: -35, el: -1, fov: 44, side: 200, ...SHARP },
  // 6 from your yellow dog, ahead: the aircraft facing the camera, its heat behind it (the aircraft small: ≈ 15 % of the width)
  hook6: { ...P, tx: NG[0] - 100, ty: 200, tz: NG[2] - 100, d: 1800, az: -165, el: 2, fov: 38, side: 280, ...SHARP },
  /* ── the bow catapult ── */
  catLong: { ...P, ...((p) => ({ tx: p[0], ty: 0, tz: p[2] }))(onCat(0, 3000)), d: 6500, az: -28, el: 7, ...SHARP }, //  posed: the whole stroke from aft-port, the slot to the bow
  trough: { ...P, ...((p) => ({ tx: p[0], ty: -95, tz: p[2] }))(onCat(0, 1500)), d: 2400, az: -42, el: 12, ...SHARP }, // posed: under the deck (`under` 1), the two cylinders running away
  exploded: { ...P, tx: -500, ty: -150, tz: -5300, d: 2700, az: -40, el: 22, side: -80, ...SHARP }, //               seen (model): { explode: 1, under: 1, jet: 0, dog: 0, crew: 0, parked: 0 } — named 1, 2, 3, 7 read on it
  shuttle: { ...P, tx: NG[0], ty: 20, tz: NG[2] - 30, d: 420, az: -55, el: 14, side: -120, ...CLOSE }, //          posed: the shuttle, its hook in the launch bar
  holdback: { ...P, tx: HB[0], ty: HB[1], tz: HB[2], d: 190, az: -60, el: 12, side: -100, ...CLOSE }, //           posed: the calibrated piece, in place under the aircraft
  valve: { ...P, tx: VALVE.at[0], ty: VALVE.at[1], tz: VALVE.at[2], d: 420, az: -38, el: 8, side: -120, ...CLOSE }, // posed (`under` 1)
  tank: { ...P, tx: TANK.at[0], ty: TANK.at[1], tz: TANK.at[2], d: 1700, az: -32, el: 10, side: -140, ...SHARP }, //   posed (`under` 1)
  cabin: { ...P, tx: CABIN.at[0], ty: 40, tz: CABIN.at[2], d: 720, az: -38, el: 18, side: -100, ...CLOSE }, //        posed: the cabin's glazing at deck level, the catapult beside it
  dog: { ...P, tx: CREW.dog[0], ty: 140, tz: CREW.dog[2], d: 650, az: -40, el: 6, side: -120, ...CLOSE }, //         posed: your dog, his signal, your nose behind him
  noseFront: { ...P, tx: NG[0], ty: 160, tz: NG[2], d: 1800, az: 160, el: 4, side: -100, ...SHARP }, //               posed: your Rafale from ahead, low (backlit: the nozzles' glow behind)
  /* ── the ship ── */
  shipWide: { ...P, tx: 0, ty: -400, tz: 0, d: 30000, az: -42, el: 16, ...SHARP }, //                               posed: the whole ship from its port quarter
  shipLow: { ...P, tx: -500, ty: -800, tz: -9000, d: 16000, az: -62, el: 2, fov: 32, ...SHARP }, //                 posed: the bow wave, low on the sea ("il fonce")
  shipLine: { ...P, tx: 0, ty: 0, tz: 0, d: 260000, az: -20, el: 9, fov: 30, ...SHARP }, //                          posed: so far it is a line on the sea
  island: { ...P, tx: ISLAND.x[0], ty: 800, tz: (ISLAND.z[0] + ISLAND.z[1]) / 2, d: 6000, az: -55, el: 10, ...SHARP }, // posed
  lift: { ...P, tx: (LIFTS[0].x[0] + LIFTS[0].x[1]) / 2, ty: -300, tz: (LIFTS[0].z[0] + LIFTS[0].z[1]) / 2, d: 3800, az: 50, el: 12, ...SHARP }, // posed: from starboard, the lift and the hangar's mouth
  hangar: { ...P, tx: 0, ty: -380, tz: 600, d: 5200, az: -58, el: 8, ...SHARP }, //                                  posed: into the hangar through the hull's glass
  section: { ...P, tx: 0, ty: -900, tz: MASSES.rows[0], d: 6200, az: 180, el: 4, fov: 30, ...SHARP }, //              posed: the hull cut across (`cutaway` 1), from ahead — heel and masses read square
  masses: { ...P, tx: 0, ty: MASSES.y, tz: -3000, d: 1500, az: -40, el: 14, side: -100, ...CLOSE }, //                 the blocks on their rails, from port-aft (the old az −150 went through the receiver): with `tank` 0
  fuelHolds: { ...P, tx: 0, ty: -1500, tz: -1000, d: 22000, az: -40, el: 22, ...SHARP }, //                         seen (navire): { fuel: 0.7, ship: 0.6 }
  bowWave: { ...P, tx: 0, ty: -1500, tz: -9000, d: 9000, az: 120, el: 16, fov: 30, ...SHARP }, //                   seen (navire): from starboard { speed: 1, swell: 0.3 } — shipLow hides the bow wave under the port overhang
  approachFar: { ...P, tx: -202.6, ty: 0, tz: 9437.3, d: 130268, az: 8.5, el: 3.7, fov: 30, ...SHARP }, //           seen (navire): 1.3 km behind the approach, the ship a cluster of lights { night: 1, lights: 1 }
  plant: { ...P, tx: 0, ty: PLANT.reactors[0][1], tz: PLANT.reactors[0][2], d: 3600, az: -50, el: 10, ...SHARP }, //  posed: the two reactors, the main rising forward
  fins: { ...P, tx: 0, ty: -2300, tz: -3500, d: 4200, az: -70, el: -10, fov: 32, ...SHARP }, //                       posed: under the hull, the fins
  /* ── the night ── */
  runway: { ...P, tx: A3[0], ty: 0, tz: A3[2], d: 5200, az: -20, el: 6, ...SHARP }, //                              posed: along the angled runway from aft-port, the three wires
  wires: { ...P, tx: onAngled(BRINS.s[1])[0], ty: 0, tz: onAngled(BRINS.s[1])[2], d: 2600, az: -60, el: 14, ...SHARP }, // posed
  andromede: { ...P, tx: A3[0], ty: 10, tz: A3[2], d: 420, az: -70, el: 10, side: -120, ...CLOSE }, //               posed: the third wire on its sheave
  brake: { ...P, tx: A3[0], ty: ENGINE.y, tz: A3[2], d: 1600, az: -40, el: 8, ...SHARP }, //                         posed: under the deck (`under` 1)
  mirror: { ...P, tx: MIRROR.at[0], ty: 150, tz: MIRROR.at[2], d: 900, az: 20, el: 4, side: -120, ...CLOSE }, //    posed: the mirror from the approach side
  lso: { ...P, tx: LSO.at[0], ty: 120, tz: LSO.at[2], d: 800, az: -20, el: 6, side: -140, ...CLOSE }, //             seen (bord): the landing officer from the FRONT
  lsoBack: { ...P, tx: LSO.at[0], ty: 120, tz: LSO.at[2], d: 800, az: 165, el: 10, side: 120, ...CLOSE }, //         seen (bord): from behind him, the approach beyond
  tanker: { ...P, tx: -23600, ty: 40150, tz: -213400, d: 3600, az: -25, el: 10, ...SHARP }, //                       seen (bord): { track: 2, run: 2000, alt: 400, tanker: 1 }, three-quarter rear — the two aircraft, hose and basket
  thumb1: { ...P, tx: -200, ty: 220, tz: -5000, d: 2500, az: -90, el: 3, fov: 30, ...SHARP }, //                     seen (bord): miniature 1 « IL NE BOUGE PAS », FIRST — profile, ≈ 40 % of the height
  thumb3: { ...P, tx: -747, ty: 150, tz: 6300, d: 2400, az: -35, el: 10, ...SHARP }, //                              seen (bord): miniature 3, { night: 1, lights: 1, track: 3, run: 36.86, hook: 1, caught: 1, pull: 3, wires: 1, gas: 0.8, jbd: 0, hooked: 0, held: 0, strain: 0, mirror: 1 }
  approach: { ...P, tx: T0[0], ty: 300, tz: T0[2], d: 2600, az: 12, el: 4, side: 0, ...SHARP }, //                  posed: behind your aircraft on the glide slope (ride 1, track 3)
  cockpit: cockpitPose(3, { pitch: 5, el: 3.5 }), //                                                                                       posed: from behind your helmet, the deck ahead (ride 1, track 3)
  pedro: { ...P, tx: PEDRO.at[0], ty: PEDRO.at[1], tz: PEDRO.at[2], d: 2400, az: -70, el: 4, side: -100, ...CLOSE }, // posed
  /* ── the bench ── */
  benchHoldback: { ...P, tx: 0, ty: 20, tz: 0, d: 300, az: -30, el: 14, side: -140, ...CLOSE }, //                   posed: the holdback bar (`item` 0)
  benchPiece: { ...P, tx: 0, ty: 20, tz: 0, d: 120, az: -24, el: 10, side: -100, ...CLOSE }, //                      posed: its calibrated neck
  board: { ...P, tx: 0, ty: 30, tz: 0, d: 520, az: -24, el: 42, ...SHARP }, //                                      seen (bord): the deck-plan table (`item` 1)
  boardTop: { ...P, tx: 0, ty: 24, tz: 0, d: 820, az: 0, el: 85, ...SHARP }, //                                     seen (bord): from above, the bow up — the match with the ship seen from above
  emals: { ...P, tx: 0, ty: 40, tz: 0, d: 600, az: -30, el: 16, ...SHARP }, //                                      posed (`item` 2)
  forrestal: { ...P, tx: 0, ty: 30, tz: 0, d: 560, az: -20, el: 38, ...SHARP }, //                                  seen (bord) (`item` 3)
  forrestalFire: { ...P, tx: -5, ty: 28, tz: 115, d: 190, az: -60, el: 24, ...CLOSE }, //                          seen (bord): the fire close ({ rocket: 1, fire: 0.8 })
  ely: { ...P, tx: 0, ty: 30, tz: 0, d: 560, az: -32, el: 22, ...SHARP }, //                                        posed (`item` 4)
};

/* ───────────────────────────── the seams ───────────────────────────── */

const DOG = CREW.dog;
const PE = PEDRO.at;
const COCK = cockpitPose(3, { pitch: 5, el: 3.5 }); // on the approach (pitch 5)
/**
 * The SEAMS between two chapter files (docs/L04-actes.md). Each file lays its own half with the same arguments:
 *   seam(D, "c12", "out")                                          // the file that ends
 *   seam(D, "c12", "in", { set: SET.PONT, state: { ...AT.deck, … } })  // the file that starts: a COMPLETE state
 * Every seam here is INSIDE a place, with `to` = the last pose of `from`: the move simply goes on, no visible cut. These
 * poses are the orchestrator's: a chapter never changes them (write "À changer ailleurs"). Posed on stand-ins: the
 * orchestrator re-poses them once the sets are made, BEFORE the chapters start.
 */
export const HAND = {
  // c1 → c2, inside "Sans radio" ("…la radio est interdite." → "Alors on se parle avec les mains."): the camera sinks from
  // high over the bow toward your dog, ahead of your nose — and goes on sinking to his hands
  c12: {
    at: "gestes-0.2",
    from: [{ ...P, tx: DOG[0], ty: 160, tz: DOG[2], d: 2600, az: -40, el: 22, ...SHARP }, { ...P, tx: DOG[0], ty: 150, tz: DOG[2], d: 1700, az: -38, el: 15, ...SHARP }],
    to: { ...P, tx: DOG[0], ty: 150, tz: DOG[2], d: 1700, az: -38, el: 15, ...SHARP },
    opt: { before: 1.4, after: 1.2 },
  },
  // c2 → c3, under the card "Le réacteur…": from Pedro abeam ("…ce soir, à ton retour.") a slow lateral travel toward the
  // bow wave — it goes on, and c3 lands low on the sea at the bow ("Et sous toi, le navire fonce face au vent")
  c23: {
    at: "fonce-0.9",
    from: [{ ...P, tx: PE[0] + 1500, ty: 1500, tz: PE[2], d: 7000, az: -72, el: 6, ...SHARP }, { ...P, tx: PE[0] + 3500, ty: 900, tz: PE[2] - 2500, d: 8200, az: -66, el: 5, ...SHARP }],
    to: { ...P, tx: PE[0] + 3500, ty: 900, tz: PE[2] - 2500, d: 8200, az: -66, el: 5, ...SHARP },
    opt: { before: 1.0, after: 1.2 },
  },
  // c3 → c4, under the card "Le feu sur le pont": dusk; after "…abonne-toi : on y arrive" the camera travels forward over
  // the deck toward the aircraft parked aft — it goes on, and c4 finds their engines running ("…déjà à bord : le feu")
  c34: {
    at: "r2menace-0.9",
    from: [{ ...P, tx: 0, ty: 0, tz: 3000, d: 9000, az: -36, el: 18, ...SHARP }, { ...P, tx: 600, ty: 0, tz: 6000, d: 7400, az: -32, el: 15, ...SHARP }],
    to: { ...P, tx: 600, ty: 0, tz: 6000, d: 7400, az: -32, el: 15, ...SHARP },
    opt: { before: 1.0, after: 1.2 },
  },
  // c4 → c5, inside "De nuit" ("…Mais dehors… tout est noir." → "Devant toi, un repère…"): from behind your helmet on the
  // approach (ride 1, track 3), a slow push forward into the black — it goes on, and c5 lights the mirror ahead
  c45: {
    at: "miroir-0.2",
    from: [{ ...COCK, d: 650 }, { ...COCK, d: 560 }],
    to: { ...COCK, d: 560 },
    opt: { before: 1.2, after: 1.2 },
  },
  // c5 → c6, inside "Les trois brins" ("…pour l'avion qui arrive." → "Au moment de toucher…"): from Andromède's brake under
  // the deck the camera rises through the glass deck to the wire on it — it goes on rising
  c56: {
    at: "bolter:au-0.2",
    from: [{ ...P, tx: A3[0], ty: ENGINE.y, tz: A3[2], d: 1700, az: -40, el: 8, ...SHARP }, { ...P, tx: A3[0], ty: -150, tz: A3[2], d: 1800, az: -42, el: 12, ...SHARP }],
    to: { ...P, tx: A3[0], ty: -150, tz: A3[2], d: 1800, az: -42, el: 12, ...SHARP },
    opt: { before: 1.2, after: 1.2 },
  },
};

/**
 * YOUR APPROACH across the seam c45 (both files tween `run` with this one law, "none" ease, ride 1, track 3): at the
 * seam your aircraft is APPROACH.run metres from the touchdown point and closes at APPROACH.speed metres a second of
 * film (slowed: the voice explains, the picture keeps flying). `approachRun(D, t)` gives `run` at film time t.
 */
export const APPROACH = { run: -1300, speed: 25 };
export const approachRun = (D, t) => APPROACH.run + APPROACH.speed * (t - D.at(HAND.c45.at));

/* ───────────────────────────── the world ───────────────────────────── */

const V3 = () => new THREE.Vector3();
const vHook = V3();
const J = [0, 0, 0, 0, 0];
const JN = [0, 0, 0, 0, 0];
const R0 = [0, 0, 0, 0, 0];
const R1 = [0, 0, 0, 0, 0];
const RIDE = [0, 0, 0];

export function buildWorld(stage) {
  const { scene } = stage;
  stage.grade.gel.set(BRAND.signal);

  /* the two places: one group each, one shown at a time */
  const places = [new THREE.Group(), new THREE.Group()];
  for (const g of places) scene.add(g);

  /* PONT — the sea and the sky stay level; everything of the ship heels around ROLL */
  const navire = buildNavire();
  places[SET.PONT].add(navire.sky);
  const heelG = new THREE.Group();
  heelG.position.set(0, ROLL.y, ROLL.z);
  places[SET.PONT].add(heelG);
  const onShip = new THREE.Group(); // the ship's frame (plan.js), inside the heel
  onShip.position.set(0, -ROLL.y, -ROLL.z);
  heelG.add(onShip);
  onShip.add(navire.ship);
  const dress = { mer: dressMer(), pont: dressPont() }; places[SET.PONT].add(dress.mer.group); onShip.add(dress.pont.group);

  /* the solid systems (model.js), at their place in the ship; the holdback bar re-parented to the bench */
  const model = buildModel();
  for (const c of model.cats) onShip.add(c.group);
  onShip.add(model.brins.group, model.mirror.group, model.cabin.group, model.holdbackHome);

  /* who lives on the deck (bord.js) */
  const bord = buildBord();
  onShip.add(bord.rafale.group, bord.next.group, bord.parked, bord.fleet, bord.tanker.group, bord.crew.group, bord.pedro.group);

  /* BENCH */
  const bench = makeBench(SIZE);
  places[SET.BENCH].add(bench.group);
  const benchMount = new THREE.Group();
  places[SET.BENCH].add(benchMount);
  const benchItems = [null, bord.board, model.bench.emals, bord.forrestal, model.bench.ely];
  for (const g of benchItems) if (g) places[SET.BENCH].add(g);

  const home = (obj, parent) => {
    if (obj.parent !== parent) parent.add(obj);
  };
  /** Where your aircraft is, and its heading (the hooked aircraft rides the shuttle). */
  const runOf = (S) => (Math.round(S.track) === 1 && S.hooked > 0.5 ? Math.max(S.run, S.shuttle) : S.run);

  /** The camera's ride: your aircraft's travel from run 0 of its track (0 when `ride` is off). */
  const rideOf = (S) => {
    RIDE[0] = RIDE[1] = RIDE[2] = 0;
    if (S.ride < 0.5 || Math.round(S.set) !== SET.PONT) return RIDE;
    const tr = Math.round(S.track);
    jetAt(tr, runOf(S), S.alt, R1);
    jetAt(tr, 0, 0, R0);
    RIDE[0] = R1[0] - R0[0];
    RIDE[1] = R1[1] - R0[1];
    RIDE[2] = R1[2] - R0[2];
    return RIDE;
  };

  return {
    places, navire, model, bord, bench, onShip, heelG,
    /** main.js hands it to the director (createDirector({ ride })): the shots are then written around run 0. */
    ride: rideOf,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const set = Math.round(S.set);
      places.forEach((g, i) => (g.visible = i === set));
      const item = Math.round(S.item);
      const night = S.night;

      /* the holdback bar: under your aircraft, or on the bench */
      const onBench = set === SET.BENCH && item === 0;
      home(model.holdback.group, onBench ? benchMount : model.holdbackHome);
      for (let i = 1; i < benchItems.length; i++) benchItems[i].visible = set === SET.BENCH && item === i;

      if (set === SET.PONT) {
        heelG.rotation.z = -S.heel * DEG;
        navire.set(
          {
            amount: S.ship, sea: S.sea, night, lights: S.lights, taxi: S.taxi, speed: S.speed, wind: S.wind, under: S.under, angled: S.angled,
            cutaway: S.cutaway, heel: S.heel, masses: S.masses, massGlow: S.massGlow, fins: S.fins, lift: S.lift, hangar: S.hangar,
            curtain: S.curtain, detectors: S.detectors, plant: S.plant, feed: S.feed, fuel: S.fuel, coast: S.coast,
            swell: S.swell, windAxis: S.windAxis, mist: S.mist,
          },
          time, px,
        );
        dress.mer.update({ amount: S.sea, night, mist: S.mist }, time, px);
        dress.pont.update({ amount: S.ship, night, parked: S.parked, lso: S.lso, under: S.under, explode: S.explode, cutaway: S.cutaway, wind: S.wind, hangar: S.hangar, curtain: S.curtain, lift: S.lift, detectors: S.detectors }, time, px);

        /* your aircraft, the next one */
        const tr = Math.round(S.track);
        jetAt(tr, runOf(S), S.alt, J);
        bord.rafale.group.position.set(J[0], J[1], J[2]);
        bord.rafale.group.rotation.set(0, J[3], 0);
        bord.rafale.update({ jet: S.jet, pitch: J[4], bank: S.bank, gas: S.gas, tremble: S.tremble, hook: S.hook, bar: S.hooked, you: S.you, hud: S.hud, night, onDeck: J[1] < 5 ? 1 : 0, gear: tr === 2 ? 0 : 1 }, time, px);
        bord.next.group.visible = S.next > 0.01;
        if (bord.next.group.visible) {
          jetAt(1, S.nextRun, 0, JN);
          bord.next.group.position.set(JN[0], JN[1], JN[2]);
          bord.next.group.rotation.set(0, JN[3], 0);
          bord.next.update({ jet: S.next, gas: 0.5, night }, time, px);
        }

        /* the hook's tip in the ship's frame: Andromède's bight follows it once caught */
        bord.rafale.A.hook.getWorldPosition(vHook);
        onShip.worldToLocal(vHook);

        model.set(
          {
            place: set, explode: S.explode, trace: S.trace, traceOut: S.traceOut, named: S.named, under: S.under, shuttle: S.shuttle, hooked: S.hooked, held: S.held, strain: S.strain,
            broken: S.broken, press: S.press, valve: S.valve, dial: S.dial, tank: S.tank, jbd: S.jbd, cabin: S.cabin, shuttle2: S.shuttle2,
            wires: S.wires, wireName: S.wireName, caught: S.caught, pull: S.pull, hookAt: vHook, brake: S.brake,
            mirror: S.mirror, ball: S.ball, waveoff: S.waveoff, laser: S.laser, guides: S.guides, bdial: S.bdial, laserTo: J, tremble: S.tremble, night,
          },
          time, px,
        );
        model.cabin.group.visible = S.cutaway <= 0.5; // the catapult cabin stands ahead of the section cut: hidden in the section shot

        /* the lift carries two aircraft; the cabin's two people sit in it */
        home(bord.liftPair, navire.A.lifts[0]);
        bord.liftPair.visible = S.fleet > 0.01;
        home(bord.crew.cabin[0], model.cabin.A.seats[0]);
        home(bord.crew.cabin[1], model.cabin.A.seats[1]);
        bord.set(
          {
            place: set, night, next: S.next, parked: S.parked, running: S.running, fleet: S.fleet, tanker: S.tanker, dog: S.dog, sig: S.sig, vest: S.vest, crew: S.crew,
            cabinCrew: S.cabinCrew, lso: S.lso, lsoArm: S.lsoArm, paddles: S.paddles, pedro: S.pedro,
          },
          time, px,
        );
        // the tanker flies on your right, a little ahead and above (only in the air)
        bord.tanker.group.visible = S.tanker > 0.01;
        if (bord.tanker.group.visible) {
          bord.tanker.group.position.set(J[0] + 900, J[1] + 250, J[2] - 1400);
          bord.tanker.group.rotation.set(0, J[3], 0);
          bord.tanker.update({ jet: S.tanker, night }, time, px);
        }
      } else {
        model.set({ place: set, item, broken: S.broken, strain: S.strain, named: S.named, coils: S.coils, press: S.press, tremble: 0, night: 0 }, time, px);
        bord.set({ place: set, item, zones: S.zones, tokens: S.tokens, green: S.green, red: S.red, rocket: S.rocket, fire: S.fire, burnt: S.burnt }, time, px);
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      }

      const rd = rideOf(S); // the light rides with the camera
      Object.assign(stage.focus, { x: S.fx + rd[0], y: S.fy + rd[1], z: S.fz + rd[2], scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, S.hot);
      const d = stage.cam.d;
      scene.fog.density = set === SET.BENCH ? bench.fog(d) : 0.03 / Math.max(8000, d);
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
/** When a chapter's card comes in, inside a file: its first beat's first word − CARD_LEAD (`cardAt(D, "avance")`). */
export const cardAt = (D, beat) => D.at(beat) - CARD_LEAD;
/** A cut lands ON a frame (30 fps): a `mix` fade that starts between two frames keeps an older frame — the picture jumps back. */
export const onFrame = (t) => Math.round(t * 30) / 30;
/**
 * Lays a file's half of a seam: `seam(D, "c12", "out")` at the end of c1; at the start of c2,
 * `seam(D, "c12", "in", { set: SET.PONT, state: { ...AT.deck, etape: 2, … } })` — the file that starts gives the
 * COMPLETE state on the cut (it depends on no other file). Returns the pose the camera reaches after the seam.
 */
export const seam = (D, name, only, extra = {}) => {
  const h = HAND[name];
  return D.match(D.at(h.at), h.from, h.to, { ...h.opt, ...extra, only });
};
