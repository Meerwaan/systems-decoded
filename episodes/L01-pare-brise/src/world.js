// DOSSIER L01 — Ton pare-brise (format long, 16:9) : the world. This file is the CONTRACT between the sets and the
// chapters:
//   · plan.js   where everything stands (read by every set; no import there)
//   · SET       the five places, one shown at a time: the factory LINE, the CAR, the ROAD, the BENCH, the LAB of 1903
//   · FIRST     the state of the world on the first frame — THE CLOSED LIST of numbers the chapters may move
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · AT        complete states, one per place: a chapter that cuts to a place writes { ...AT.line, …what differs }
//   · apply     what each number does to the world, every frame (depends on S and time only)
//
// THE LINE is ONE continuous factory along +x (plan.js · ST): batch → furnace → tin bath → lehr → cutting → printing
// → bending → clean room → autoclave → sensors and inspection → the test hall; the tempering lane runs beside it
// (z = ST.temper.z). The camera can travel it station to station: a chapter never cuts between two stations it can
// fly between. The product advances with `pos` (the x of the windshield once cut); upstream of the cut the product
// IS the ribbon, and `flow` (cm, only ever growing) makes it and every roller move.
// Three colours. signal is HEAT (the melt, the ribbon, a glass above ≈ 450 °C — the header turns signal with it) and
// the THREAT (what strikes: the ball, the head, the gravel, the blades of ordinary glass). veille is THE FILM (PVB):
// what keeps you. ink is the rest: cold glass, the machines of glass, the documents.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { makeFurnace, makeVat, makeConveyor } from "@kit/usine.js";
import { makeGantry, makeCleanRoom, makeBlower, makeDropTower, makeHeadRig, makeOpticBench, makeStriker } from "@kit/postes.js";
import { LINE, ST, DROP, WS, BENCH, MOUNT, SIDE, PANE, LAB } from "./plan.js";
import { buildGlass } from "./verre.js";
import { buildCasse } from "./casse.js";
import { buildDossier } from "./dossier.js";
import { buildCars } from "./car.js";

export const SET = { BENCH: 0, CAR: 1, LINE: 2, LAB: 3, ROAD: 4 };
/** ≈ the radius of the windshield: sizes the bench, its pool, its shadows (the stage's `scale`). */
export const SIZE = BENCH.size;
export const FAR = 60000;

/** The steps of the line, as the header names them (ÉTAPE 01 / 08 …). 0 = off the line ("Hors chaîne"). */
export const STEPS = ["Le four", "Le bain d'étain", "L'étenderie", "La découpe", "Le bombage", "La salle blanche", "L'autoclave", "Le test"];
/** The chapter cards: their small line, and the line under the rule (the step of the line, when the chapter is one). */
const CHAP_STEP = { four: 1, etain: 2, etenderie: 3, forme: 4, bombage: 5, salle: 6, autoclave: 7, pret: 8 };
export const CARD = {
  kicker: () => "Fabriqué pour te sauver",
  sub: (c) => (CHAP_STEP[c.id] ? `Étape ${String(CHAP_STEP[c.id]).padStart(2, "0")} / 08` : "Hors chaîne"),
};

// The FIRST frame is the hook, IN THE CAR: 011's car seen like an X-ray, three quarters front, driver's side; your head
// of glass has just met the windshield — the one solid thing — and its web of cracks has begun around it. The film
// loops: the last sentence ("…le jour où…") lets the crash happen again and lands here. CANDIDATE: the orchestrator
// chooses it on a board of four (VIEW.hook1 … hook4) before the chapters are staged, and pastes the one kept here.
// The LAST 15 s leave the right half of the frame to YouTube's end screen, and the last frame IS this one: the subject
// stands in the LEFT half (side > 0 moves it left: side 300 → its centre near x = 660).
// Chosen on the sheet of candidates (15/10): the web pushing, outside, close — your glass head against the windshield,
// the subject on the left so the last frame (the loop) leaves the right half to YouTube's end screen.
export const POSE0 = { tx: -37, ty: 130, tz: -29, d: 120, az: -150, el: 12, fov: 32, shift: 0, side: 300, roll: 0, drift: 0.3 };

export const FIRST = {
  set: SET.CAR,
  /* ── the header (main.js reads them) ── */
  step: 0, //    the step of the line on screen: 1 … 8 (STEPS), 0 off the line ("Hors chaîne"). Integer: `now`, never `st`
  temp: 20, //   the temperature of the glass on screen, °C — sourced values only (see docs/L01-actes.md)
  tempOn: 0, //  1 shows `temp` in the header, 0 shows "—" (off the line, on the bench, in the car)
  /* ── the car and the road (car.js: 011's car, 014's street) ── */
  shell: 1, //   the car's X-ray body (0–1)
  wall: 0, //    the wall ahead of the car (0–1): only where the crash needs a cause
  crash: 0.6, // the crash: 0 intact → 1 the nose folded against the wall (the world comes to the car)
  lunge: 1, //   you: 0 seated → 1 your head against the windshield, at IMPACT.head
  you: 1, //     0 nobody at the wheel · 1 you, a body of glass
  tool: 0, //    a window-breaker in your hand at the side window: 0 none · 0.5 raised · 1 struck (the AAA end)
  kmh: 0, //     ROAD: the car's speed (the road's lines run under it)
  drive: 0, //   ROAD: metres driven, only ever growing (feeds 014's scroll; keep it ≈ kmh / 3.6 per second)
  sideOn: 0, //  the hero SIDE WINDOW in the driver's door, solid (0 the door's own glass · 1 ours, its stamp readable)
  /* ── the windshield, the hero (verre.js): ONE object, re-parented by place (bench, line, car, road) ── */
  hero: 1, //    shown (0–1). On the LINE it only shows once cut (`cut` > 0)
  pos: 5000, //  LINE: the x of the windshield on the line (ST.*.at for each station); ignored elsewhere
  cut: 1, //     0 still the ribbon → 1 two blanks cut to the windshield's shape (the edges ground)
  print: 1, //   the black band, printed: 0 → 1 it sweeps along the edges, then its dots, then the stamp
  bend: 1, //    0 flat → 1 curved (it sags on the mould, by its own weight)
  open: 0, //    the top sheet lifted off the bottom one (0 → 1, ≈ 30 cm): the film slides in between
  film: 1, //    the PVB film between the two glasses: 0 none → 1 in place (it slides in from the side) — veille
  milk: 0, //    the sandwich milky (1, air still trapped) → 0 perfectly clear
  explode: 0, // BENCH: 0 assembled → 1 its three layers apart along their normal (glass · film · glass)
  sensors: 1, // the rain sensor and the camera mount on the inner face (0–1)
  glow: 0, //    the windshield's heat, drawn: 0 cold (ink, clear) → 1 glowing signal. Follow `temp`: 450 °C ≈ 0.1, 600 ≈ 0.5, ≥ 700 = 1
  queue: 0, //   LINE: the other windshields ahead and behind on the line (0–1), in the same state as the hero
  litGlass: 0, litFilm: 0, litBand: 0, litStamp: 0, // the layer the voice names glows a little (0–1, one at a time)
  /* ── the glass of the line upstream of the cut, and the other panes (verre.js) ── */
  flow: 0, //    cm the ribbon has travelled — ONLY GROWS (≈ 40 cm/s on screen); every roller and the ribbon read it
  batch: 0, //   the raw materials on their platform, named one by one: 0 none … 5 sand, soda, limestone, dolomite, cullet
  charge: 0, //  0 on the platform → 1 they have fallen through the hopper into the furnace
  melt: 1, //    the melt in the furnace, glowing (0–1)
  ribbon: 1, //  the ribbon, throat → cut (0–1)
  pull: 0, //    the ribbon drawn faster → thinner: 0 as it is · 1 thin (its edge's section shows it; its edge rolls spin faster)
  silver: 0, //  PRINT: the silver lines of a rear screen, printed (0 → 1) on the small rear-screen sample (plan.js · SILVER)
  mould: 0, //   the bending mould on its cart, under the windshield (0–1)
  sidePos: 6000, // TEMPER lane: the x of the side window (ST.temper: furnace 6000–6800, blower 7000–7500)
  sideGlow: 0, // the side window's heat (as `glow`)
  sideFilm: 0, // the side window is LAMINATED (two glasses and a film, veille) instead of tempered (0/1)
  stress: 0, //  the side window's section, drawn: 0 none · 1 the skins squeezed (ink arrows in), the core pulling (signal arrows out)
  //             · 2 a scratch on the surface, held shut · 3 the scratch reaches the core
  sample: 0, //  TEST: the 30 cm laminated sample on the tower's plate (0–1)
  witness: 0, // TEST: the tempered witness pane on its stand (0–1)
  /* ── the factory (kit: usine.js, postes.js) ── */
  line: 1, //    the X-ray of the machines (0–1): lower it to let the glass read
  knife: 0, //   CUT: the scoring head across the ribbon 0 → 1; 1 → 2 the snap (the blanks leave)
  squeegee: 0, // PRINT: the screen's squeegee across the glass 0 → 1
  air: 0, //     CLEAN: the filtered air, drawn (0–1)
  door: 1, //    AUTOCLAVE: its door 0 open → 1 shut
  press: 0, //   AUTOCLAVE: heat and pressure inside, drawn (0–1)
  scan: 0, //    EYES: the inspection light sweeping across 0 → 1
  optic: 0, //   TEST: the optical bench — 0 none · 1 its grid seen through the windshield, straight · 2 bent (what a bad
  //             glass would do) · 3 doubled (the secondary image)
  ball: 0, //    TEST: the 2.26 kg ball — 0 held at 4 m → 1 on the sample (→ 1.2 it rests on the film)
  small: 0, //   TEST: the 227 g ball — 0 held at ≈ 9 m → 1 on the sample
  chamber: 0, // TEST: the climatic box around the sample: 0 none · 1 hot (+40 °C, signal) · −1 cold (−20 °C, ink)
  drop: 0, //    TEST: the 10 kg head — 0 held at 1.5 m → 1 on the windshield (→ 1.15 it has sunk into the film)
  strike: 0, //  TEST: the punch on the witness pane 0 → 1
  count: 0, //   TEST: the 5 cm counting square laid on the struck witness (0–1): "ses grains comptés" (R43: ≥ 40)
  jets: 0, //    TEMPER: the blower's jets of air (0–1)
  /* ── the fractures (casse.js) ── */
  web: 0.35, //  the spider's web around the impact (0 → 1): on the sample if `sample` > 0.5 · on the side window if it is
  //             laminated and shown (`sideFilm`, `sideOn` > 0.5) · else on the windshield
  rings: 0.2, // its rings around the impact (0 → 1: "des cercles de fissures tout autour de la tête")
  stick: 0, //   the shards shown held by the film (0–1: veille shows where the film holds)
  grains: 0, //  tempered glass gone to grains (0 → 1): on the witness if `witness` > 0.5 · else on the side window if it is
  //             shown (LINE, or `sideOn` > 0.5) · else ON THE WINDSHIELD (the what-if of a tempered windshield: "tu perds la route")
  chip: 0, //    the gravel: 0 → 0.5 it flies in (solid, signal) · 0.5 it hits · → 1 the small star settles (ink)
  creep: 0, //   the crack running from it (0 → 1)
  resin: 0, //   the resin filling it (0 → 1)
  bubble: 0, //  a bubble in the film (0 → 1), and the film lifting from the glass around it
  nickel: 0, //  the grain of nickel sulfide in the side window: 0 → 0.5 it shows → 1 it gives (then `grains` runs)
  plain: 0, //   the ORDINARY pane of before, in place of the windshield (0–1): one sheet, no film
  blades: 0, //  it breaks into blades (0 → 1) — in the car toward your face, on the line at the cut end
  /* ── the dossier and the lab (dossier.js) ── */
  doc: 0, //     the piece on the bench: 0 none · 1 the patent of 1909 · 2 the R43 page · 3 the stamp, enlarged. Integer: `now`
  docIn: 0, //   the piece comes in (0 → 1) and is read: its lines light up as the voice says them (0 → 1 → 2)
  mark: 0, //    the enlarged stamp: 0 nothing lit · 1 the E and its circle · 2 the number (2 = France) · 3 "43" · 4 the roman numeral
  flask: 0, //   LAB: the flask — 0 on the top shelf · 1 on the floor (it falls in between, turning)
  star: 0, //    LAB: the flask starred all over (0 → 1) — and whole
  ben: 0, //     LAB: Bénédictus — 0 tidying at the shelf · 1 kneeling, picking it up · 2 standing, holding it to the light
  labelOn: 0, // LAB: his label on the flask, "Novembre 1903" (0–1)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal on the rim (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); `hot` warms the background (0–1);
  // the bench's pool and grid
  fx: -37, fy: 120, fz: -50, fs: 240, mood: 1, gel: 0, hot: 0, pool: 0.2, grid: 0.16,
};

/** Everything at rest: what a cut to any place starts from (then AT.* says what that place needs). */
const OFF = { step: 0, temp: 20, tempOn: 0 }; // the header off the line
const REST = {
  shell: 1, wall: 0, crash: 0, lunge: 0, you: 1, tool: 0, kmh: 0, sideOn: 0,
  hero: 1, cut: 1, print: 1, bend: 1, open: 0, film: 1, milk: 0, explode: 0, sensors: 1, glow: 0, queue: 0,
  litGlass: 0, litFilm: 0, litBand: 0, litStamp: 0,
  batch: 0, charge: 0, melt: 1, ribbon: 1, pull: 0, silver: 0, mould: 0, sideGlow: 0, sideFilm: 0, stress: 0, sample: 0, witness: 0,
  line: 1, knife: 0, squeegee: 0, air: 0, door: 1, press: 0, scan: 0, optic: 0, ball: 0, small: 0, chamber: 0, drop: 0, strike: 0, count: 0, jets: 0,
  web: 0, rings: 0, stick: 0, grains: 0, chip: 0, creep: 0, resin: 0, bubble: 0, nickel: 0, plain: 0, blades: 0,
  doc: 0, docIn: 0, mark: 0, flask: 0, star: 0, ben: 0, labelOn: 0,
  mood: 0, gel: 0, hot: 0, pool: 0.2, grid: 0.16,
};
/**
 * Complete states, one per place. The places off the line (bench, car, road, lab) put the header off ("Hors chaîne",
 * "—"); AT.line does NOT say `step`, `temp`, `tempOn`, `pos`, `sidePos`: the chapter does, on every cut to the line
 * ({ ...AT.line, step: 5, temp: 600, tempOn: 1, pos: ST.bend.at, … }). `flow` and `drive` belong to run().
 */
export const AT = {
  // the finished windshield on the bench, whole, at rest; the pool veille
  bench: { ...REST, ...OFF, fx: 0, fy: 55, fz: 0, fs: SIZE },
  // the pieces of the dossier on the bench (`doc` > 0): the hero away, a small pool (dossier.js: 0.2 greens the highlighter)
  doc: { ...REST, ...OFF, hero: 0, pool: 0.05, fx: 0, fy: 0, fz: 0, fs: SIZE },
  // the car: intact, you at the wheel, the windshield in place
  car: { ...REST, ...OFF, fx: -20, fy: 110, fz: -40, fs: 260 },
  // the road: the same car driving (give it `kmh` and let `drive` grow)
  road: { ...REST, ...OFF, kmh: 90, fx: 0, fy: 110, fz: -40, fs: 280 },
  // the factory, the line running; the windshield only shows once cut (cut 0 here: say `cut`, `pos` for the station)
  line: { ...REST, cut: 0, print: 0, bend: 0, film: 0, sensors: 0, mood: 1, hot: 0.25, fx: 1800, fy: 90, fz: 0, fs: 900 },
  // the lab, 1903: the flask on its shelf, Bénédictus tidying
  lab: { ...REST, ...OFF, hero: 0, you: 0, fx: 0, fy: 150, fz: -100, fs: 320 },
};

/** The poses that frame each place (complete: nothing is inherited across a cut). Starting points: the sets give better ones (their journals). */
const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
/** A pose on the LINE, aimed at x (on the conveyor) — `o` overrides (d, az, el, ty, tz, fov, side…). */
export const onLine = (x, o = {}) => ({ ...P, tx: x, ty: LINE.y + 10, tz: 0, d: 900, az: -20, el: 20, ...o });
// The poses the sets SAW on their boards (docs/journal/L01-*.md · « Les poses qui cadrent bien »), with the state they
// were seen in. A pose marked "posed" was set on a stand-in and never looked at: start from a "seen" one when you can.
export const VIEW = {
  hook: POSE0,
  /* ── the hook: four candidates for the first frame (the orchestrator picks one) — recalled for IMPACT.head [-37, 22] ── */
  hook1: POSE0, //                                                                          three quarters front, your face through the glass
  hook2: { ...P, tx: -37, ty: 132, tz: -24, d: 330, az: -95, el: 4, fov: 34, side: 280 }, // profile: the head into the raked glass, the web edge-on
  hook3: { ...P, tx: -30, ty: 128, tz: -39, d: 70, az: -8, el: -2, fov: 52, side: 240 }, //   your eyes: the web opening in front of you
  hook4: { ...P, tx: -10, ty: 110, tz: -60, d: 900, az: -150, el: 18, fov: 30, side: 320 }, // the whole car, the wall, the head in the glass
  /* ── the car (CAR) ── */
  // the web pushing, outside, close — casse.js's best image ({ web: 0.6, rings: 0.6 } → { web: 1, rings: 1, stick: 0.3 }); seen
  // with the head at [-37, 4], recalled here (+8 up, +16 back) like hook1–3
  web: { ...P, tx: -37, ty: 130, tz: -29, d: 120, az: -150, el: 12, fov: 32, side: 0 },
  lunge: { ...P, tx: -37, ty: 110, tz: -30, d: 260, az: -92, el: 4, fov: 32 }, //            seen: tight profile, the lunge over the wheel ({ lunge: 0 → 1 })
  tool: { ...P, tx: -86, ty: 120, tz: 4, d: 90, az: 100, el: 20, fov: 34 }, //               seen: the window-breaker from the passenger seat ({ sideOn: 1, tool: 0.5 → 1 })
  nickel: { ...P, tx: -88, ty: 120, tz: 20, d: 60, az: 75, el: 4, fov: 40 }, //              seen: { sideOn: 1, nickel: 0.5 } — a sharp signal dot in the dark pane
  bubble: { ...P, tx: 18, ty: 106, tz: -86, d: 45, az: 172, el: 30, fov: 32 }, //            seen: { bubble: 1 } (the air lens reads as a small grey cone: one notch below)
  carWide: { ...P, tx: 0, ty: 85, tz: -20, d: 1300, az: -140, el: 14, side: -200 }, //      seen (casse): { plain: 1, blades: 0.5, hero: 0 }
  carSide: { ...P, tx: 0, ty: 95, tz: 0, d: 1150, az: -90, el: 6, side: 0 }, //              posed
  screenOut: { ...P, tx: 0, ty: 121, tz: -57, d: 420, az: -165, el: 22, side: -180 }, //   posed: the windshield from outside, front
  screenIn: { ...P, tx: -30, ty: 123, tz: -52, d: 64, az: -7, el: 0, fov: 50 }, //          posed: from your eyes
  sideIn: { ...P, tx: SIDE.at[0], ty: SIDE.at[1], tz: SIDE.at[2], d: 150, az: 75, el: 4, fov: 40, side: -120 }, // seen: { sideOn: 1, sideFilm: 1 } · { sideOn: 1, grains: 0.3 → 0.7 }
  sideOut: { ...P, tx: SIDE.at[0], ty: SIDE.at[1], tz: SIDE.at[2], d: 300, az: -78, el: 8, side: -150 }, // posed
  /* ── the road (ROAD) ── */
  road: { ...P, tx: 0, ty: 100, tz: -60, d: 760, az: -158, el: 7, side: -180 }, //           posed: the car coming at us, low
  chip: { ...P, tx: 34, ty: 109, tz: -80, d: 58, az: 172, el: 32, fov: 32, side: -160 }, //  seen at d 120 (the star only ≈ 30 px): d 58 for "l'impact"
  chipRun: { ...P, tx: 34, ty: 109, tz: -80, d: 120, az: 172, el: 32, fov: 32, side: -160 }, // seen: "la fissure court" (≈ 30 cm of crack)
  /* ── the bench (BENCH) ── */
  bench: { ...P, tx: 0, ty: 58, tz: 0, d: 430, az: -18, el: 10, fov: 30, side: -180 }, //  posed
  benchClose: { ...P, tx: 0, ty: 60, tz: 0, d: 300, az: -28, el: 14, fov: 30, side: 0 }, // seen: the windshield in beauty (AT.bench)
  exploded: { ...P, tx: 0, ty: 62, tz: -10, d: 560, az: -38, el: 12, fov: 30, side: -180 }, // seen: { explode: 1, litFilm: 1 }
  stamp: { ...P, tx: 58, ty: 30, tz: 16, d: 75, az: -10, el: 14, fov: 30, side: -160 }, //  seen: E2 · II · 43R · 00 4127 readable
  doc: { ...P, tx: 0, ty: 0, tz: 4, d: 175, az: -6, el: 62, fov: 30, side: -200 }, //        seen: the pieces of the dossier (AT.doc: pool 0.05)
  /* ── the line (LINE): one or two poses per station — seen in { set: 2, line: 1, melt: 1, ribbon: 1 } + what is said ── */
  lineWide: onLine(6000, { d: 15000, az: -22, el: 26, fov: 30, side: 0 }), //               posed
  batch: onLine(-450, { ty: 70, d: 700, az: -18, el: 18, side: -160 }), //                  seen: { batch: 5 }
  hopper: onLine(ST.hopper.at[0], { ty: 360, d: 900, az: -30, el: -6, side: -160 }), //     contre-plongée, { charge: 0.5 } — seen at x −200, the hopper now at −60: NOT re-seen
  furnace: onLine(450, { ty: 150, d: 1800, az: -24, el: 20, side: -150 }), //               seen: the orange vault, the burners, the hopper on the left
  melt: onLine(700, { ty: 120, d: 460, az: -14, el: 32, fov: 32, side: -150 }), //          seen: through the vault, the orange paste
  throat: onLine(1030, { ty: 100, d: 520, az: -40, el: 16, side: -150 }), //                seen: the canal and its tweel top right
  bath: onLine(1850, { ty: 90, d: 2300, az: -18, el: 32, side: -100 }), //                  posed
  ribbon: onLine(1500, { ty: 92, tz: 130, d: 520, az: 12, el: 10, side: -160 }), //         seen: raking, the edge rolls (the tin's mirror NOT re-seen)
  lehr: onLine(3700, { ty: 100, d: 1700, az: -16, el: 14, side: -120 }), //                 seen (a little dull from outside)
  lehrIn: onLine(3100, { ty: 125, d: 320, az: -82, el: 6, fov: 40, side: 0 }), //           seen: inside the tunnel, the rollers running, the bright exit
  rollers: onLine(4950, { ty: 82, tz: 120, d: 260, az: -35, el: 14, side: -100 }), //       seen: tubes of glass, rail, legs
  cut: onLine(ST.cut.at, { ty: 105, d: 170, az: -38, el: 14, side: -60 }), //               seen: the wheel that bites ({ knife: 0.5 }); the old wide one lost beam and tool
  cutOut: onLine(5300, { ty: 95, d: 420, az: -22, el: 40, side: 0 }), //                    seen: the windshield cut out, 300 cm DOWNSTREAM of the gantry ({ cut: 0 → 1, pos: 5300 })
  bladesLine: onLine(5120, { ty: 100, d: 420, az: -22, el: 30, side: -160 }), //            seen: { plain: 1, blades: 0.6 } at the cut end
  print: onLine(ST.print.at, { ty: 100, d: 230, az: -40, el: 22, side: -80 }), //           seen: the squeegee ({ squeegee: 0.5, cut: 1, pos: 5700, print: 0.5 }) — the line's strongest machine
  screen: onLine(ST.print.at, { ty: 110, d: 300, az: -28, el: 30, side: -120 }), //         seen: the screen's frame ({ squeegee: 0.3 })
  bend: onLine(ST.bend.at, { ty: 110, d: 620, az: -26, el: 18, side: -160 }), //            seen: { glow: 0.6, mould: 1, bend: 0.5 } — the red elements over the mould
  bendHot: onLine(ST.bend.at, { ty: 100, d: 380, az: -30, el: 22, fov: 30, side: 0 }), //   seen: the orange saddle on its cart ({ mould: 1, bend: 0 → 1, glow: 1 })
  bendLow: onLine(ST.bend.at, { ty: 100, d: 360, az: -6, el: 2, fov: 32, side: -140 }), //  seen: in profile the glass is a thin line — prefer bendHot
  clean: onLine(ST.clean.at, { ty: 110, d: 900, az: -22, el: 22, side: -150 }), //          seen: the air ({ air: 1 }) — the placer is lost in it at this distance
  film: onLine(ST.clean.at, { ty: 98, d: 300, az: -55, el: 14, side: -150 }), //            edge-on: the film slides in (the lifted top sheet's reflection too wide: re-check)
  autoclave: onLine(ST.autoclave.at, { ty: ST.autoclave.axisY, d: 1350, az: -32, el: 12, side: -150 }), // seen: { door: 1, press: 1 }
  autoclaveDoor: onLine(8850, { ty: 195, d: 950, az: -42, el: 12, side: -100 }), //        seen: the door open ({ door: 0 }) — flange, bolts, claws, gauge
  milk: onLine(ST.autoclave.at, { ty: 100, d: 300, az: -25, el: 40, side: 0 }), //          seen: the veil leaving ({ film: 1, milk: 1 → 0, door: 0, pos: 9300 })
  eyes: onLine(ST.eyes.at, { ty: 100, d: 520, az: -16, el: 30, side: -160 }), //            posed
  scan: onLine(ST.eyes.at, { ty: 120, d: 320, az: -24, el: 26, side: -100 }), //            seen: the inspection light ({ scan: 0.5, sensors: 0.5 })
  tower: onLine(ST.test.tower, { ty: 300, d: 1150, az: -26, el: 6, side: -160 }), //        seen: the truss — a SCALE shot only (the sample and balls are dots)
  towerTop: onLine(ST.test.tower, { ty: ST.test.y + DROP.small, d: 600, az: -26, el: -10, side: -160 }), // posed (a low angle up the tower is weak: much black)
  plate: onLine(ST.test.tower, { ty: ST.test.y, d: 170, az: -24, el: 36, side: -160 }), //  seen: { sample: 1, ball: 1, web: 0.8, rings: 0.8 }
  chamber: onLine(ST.test.tower, { ty: 110, d: 220, az: -24, el: 24, side: -120 }), //      seen: the sample in the box ({ chamber: -1, sample: 1, ball: 0.98 }; hot: chamber 1)
  frame: onLine(ST.test.frame, { ty: 110, d: 460, az: -26, el: 32, side: -160 }), //        seen: the head in the glass ({ drop: 1.1, pos: 11850 })
  frameLow: onLine(ST.test.frame, { ty: 105, d: 260, az: -20, el: 6, fov: 32, side: -140 }), // seen: { drop: 0.9 } the head coming, the ticks on the left
  optics: onLine(ST.test.optics, { ty: 70, d: 380, az: -30, el: 40, side: -120 }), //       seen: { optic: 2 | 3, pos: 11050 } — the grid is UNDER the glass: look from above (the old el 5 missed it)
  opticsClose: onLine(ST.test.optics, { ty: 60, d: 300, az: -25, el: 55, side: -100 }), //  seen: tighter
  witness: onLine(ST.test.witness, { ty: 110, d: 220, az: -20, el: 42, side: -160 }), //    seen: the punch ({ witness: 1, strike: 0.6 → 1 })
  count: onLine(ST.test.witness, { ty: 101, d: 70, az: -20, el: 60, side: 0 }), //          seen: { witness: 1, grains: 1, strike: 1 } — the ≈ 1 cm grains can be counted (+ count: 1)
  temper: onLine(6400, { tz: ST.temper.z, d: 900, az: -20, el: 20, side: -160 }), //        seen: { sideGlow: 1, sidePos: 6400 }
  temperHot: onLine(6400, { ty: 95, tz: ST.temper.z, d: 260, az: -20, el: 35, side: 0 }), // seen: the side window hot (an even orange cushion)
  stress: onLine(7600, { ty: 92, tz: ST.temper.z, d: 150, az: -90, el: 70, side: 0 }), //   seen: the section, flat on screen ({ stress: 1 → 3, sidePos: 7600 })
  blower: onLine(7250, { ty: 95, tz: ST.temper.z, d: 360, az: -24, el: 16, side: -120 }), // seen: the jets close ({ jets: 1, sidePos: 7250, sideGlow: 0.6 })
  blowerSide: onLine(7250, { ty: 92, tz: ST.temper.z, d: 300, az: -12, el: 3, side: 0 }), // seen: both faces struck — busy (the round ducts end-on behind)
  /* ── the lab, 1903 (LAB) ── */
  lab: { ...P, tx: 0, ty: 150, tz: -60, d: 950, az: -24, el: 12, side: -120 }, //          seen: the whole room ({ ben: 0, flask: 0 })
  shelf: { ...P, tx: LAB.shelf[0], ty: LAB.shelf[1] - 10, tz: LAB.shelf[2], d: 320, az: -18, el: -12, side: -160 }, // seen: "il range" ({ star: 1, labelOn: 1 }) — his hand on the flask
  fall: { ...P, tx: -120, ty: 150, tz: -170, d: 420, az: -22, el: 2, side: -100 }, //      seen: the fall, level ({ flask: 0 → 1 }) — boards, stepladder, the flask passing
  kneel: { ...P, tx: -90, ty: 45, tz: -130, d: 330, az: -20, el: 14, side: -100 }, //      seen: "il le ramasse" ({ flask: 1, star: 1, ben: 1 }), kneeling, whole
  floor: { ...P, tx: LAB.floor[0], ty: 12, tz: LAB.floor[2], d: 130, az: -14, el: 34, side: -160 }, // seen: the starred flask ONLY (ben < 0.6: the hand there reads as four tubes)
  light: { ...P, tx: 30, ty: 175, tz: -70, d: 260, az: -20, el: 4, side: -120 }, //        seen: "à la lumière" ({ ben: 2, star: 1, labelOn: 1 }) — medium contrast; el −8 puts it on the sky (not seen)
};

/* ───────────────────────────── the world ───────────────────────────── */

const UP = new THREE.Vector3(0, 1, 0);
const ramp = (x, a, b, k) => Math.max(0, Math.min(1, (x - a) / k, (b - x) / k)); // 0 → 1 → 0, never a jump
const basis = new THREE.Matrix4();
const ax = new THREE.Vector3();
const ay = new THREE.Vector3();
const az = new THREE.Vector3();
/** Sets `obj`'s orientation from where its local x and y should point (z follows: x × y). */
function orient(obj, x, y) {
  ax.copy(x).normalize();
  ay.copy(y).normalize();
  az.crossVectors(ax, ay).normalize();
  ay.crossVectors(az, ax);
  basis.makeBasis(ax, ay, az);
  obj.quaternion.setFromRotationMatrix(basis);
}

export function buildWorld(stage) {
  const { scene } = stage;
  stage.grade.gel.set(0xff5b2e);

  /* the five places: one group each, one shown at a time */
  const places = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];
  for (const g of places) scene.add(g);

  /* BENCH */
  const bench = makeBench(SIZE);
  places[SET.BENCH].add(bench.group);

  /* the glass (verre.js), built first: the car seats your head on the very surface the windshield is drawn with */
  const glass = buildGlass();

  /* CAR and ROAD (011's car, 014's street: same frame) */
  const cars = buildCars({ surface: glass.hero.onSurface });
  places[SET.CAR].add(cars.crash.group);
  places[SET.ROAD].add(cars.road.group);

  /* LINE — the factory, assembled from the kit at the stations of plan.js */
  const lineG = places[SET.LINE];
  const furnace = makeFurnace({ length: ST.furnace.x1 - ST.furnace.x0, half: ST.furnace.half, height: ST.furnace.h, melt: ST.furnace.melt, spout: ST.furnace.canal.x1 - ST.furnace.x1, canal: ST.furnace.canal.half, hopper: { x: ST.hopper.at[0] - ST.furnace.x0, top: ST.hopper.top, mouth: ST.hopper.mouth } });
  furnace.group.position.set(ST.furnace.x0, 0, 0);
  const bath = makeVat({ shape: "flat", length: ST.bath.x1 - ST.bath.x0, half: ST.bath.half, level: ST.bath.y, hood: ST.bath.hood, exitBox: ST.lift.x1 - ST.lift.x0 });
  bath.group.position.set(ST.bath.x0, 0, 0);
  const lehr = makeFurnace({ length: ST.lehr.x1 - ST.lehr.x0, half: ST.lehr.half, height: ST.lehr.h, tunnel: true });
  lehr.group.position.set(ST.lehr.x0, 0, 0);
  const rollers = makeConveyor({ from: ST.lift.x0, to: LINE.x1 - 200, half: 200, y: LINE.y, warm: [[ST.lift.x0, ST.lehr.x0 + 900, 1]], gaps: [[ST.bend.x0, ST.bend.x1], [ST.autoclave.x0, ST.autoclave.x1], [ST.test.x0 - 100, LINE.x1]] });
  const cutter = makeGantry({ span: 2 * 260, height: ST.cut.h, tool: "knife", legs: "a" });
  cutter.group.position.set(ST.cut.at, 0, 0);
  const printer = makeGantry({ span: 2 * 220, height: ST.print.h, tool: "screen", style: "bridge", rails: 260, screen: { w: WS.w + 26, h: WS.h + 22 } });
  printer.group.position.set(ST.print.at, 0, 0);
  const bender = makeFurnace({ length: ST.bend.x1 - ST.bend.x0, half: ST.bend.half, height: ST.bend.h, kind: "oven", elements: 9, zones: 2, windows: 3, stack: { x: 0.5, h: 70, r: 16, z: 0 } });
  bender.group.position.set(ST.bend.x0, 0, 0);
  const clean = makeCleanRoom({ length: ST.clean.x1 - ST.clean.x0, half: ST.clean.half, height: ST.clean.h });
  clean.group.position.set(ST.clean.x0, 0, 0);
  const placer = makeGantry({ span: 2 * 220, height: 240, tool: "arm", style: "column" });
  placer.group.position.set(ST.clean.at, 0, 0);
  const autoclave = makeVat({ shape: "cylinder", length: ST.autoclave.x1 - ST.autoclave.x0, radius: ST.autoclave.r, axisY: ST.autoclave.axisY });
  autoclave.group.position.set(ST.autoclave.x0, 0, 0);
  const eyes = makeGantry({ span: 2 * 220, height: ST.eyes.h, tool: "nozzle", axes: 2 });
  eyes.group.position.set(ST.eyes.at, 0, 0);
  const tower = makeDropTower({ height: DROP.ball, mast: DROP.small, plate: ST.test.y, sample: DROP.sample });
  tower.group.position.set(ST.test.tower, 0, 0);
  const rig = makeHeadRig({ drop: DROP.head, frame: ST.test.y, w: WS.w, h: WS.h, wTop: WS.wTop, rest: LINE.y + 1.5, sag: WS.sag, sagV: WS.sagV });
  rig.group.position.set(ST.test.frame, 0, 0);
  const optics = makeOpticBench({ y: ST.test.y, rest: LINE.y + 1.5, w: WS.w, h: WS.h, sag: WS.sag + WS.sagV });
  optics.group.position.set(ST.test.optics, 0, 0);
  const striker = makeStriker({ y: ST.test.y, size: PANE.witness });
  striker.group.position.set(ST.test.witness, 0, 0);
  const temperOven = makeFurnace({ length: ST.temper.furnace[1] - ST.temper.furnace[0], half: 160, height: 200, kind: "oven", elements: 18, zones: 4, windows: 2, slot: { y0: 60, y1: 130 }, stack: false });
  temperOven.group.position.set(ST.temper.furnace[0], 0, ST.temper.z);
  const blower = makeBlower({ length: ST.temper.blower[1] - ST.temper.blower[0], half: 140, y: ST.temper.y, angle: 12, oscillate: 10 });
  blower.group.position.set(ST.temper.blower[0], 0, ST.temper.z);
  const temperRoll = makeConveyor({ from: ST.temper.x0, to: ST.temper.x1, half: 120, y: ST.temper.y, warm: [[ST.temper.furnace[0], ST.temper.furnace[1] + 250, 1]] });
  temperRoll.group.position.z = ST.temper.z;
  const machines = [furnace, bath, lehr, rollers, cutter, printer, bender, clean, placer, autoclave, eyes, tower, rig, optics, striker, temperOven, blower, temperRoll];
  for (const m of machines) lineG.add(m.group);
  // the hall's floor: a grid only (an X-ray place has no solid floor)
  const hall = makeBench(900);
  hall.group.position.set((LINE.x0 + LINE.x1) / 2, 0, 0);
  lineG.add(hall.group);

  /* the glass (verre.js): the line's glass lives in the LINE place; the hero, the side window, the sample, the witness are re-parented */
  lineG.add(glass.line);

  /* the fractures (casse.js): mounted on the panes they break */
  const casse = buildCasse();
  casse.mount("hero", glass.hero.root, glass.hero.onSurface);
  casse.mount("side", glass.side.root, glass.side.onSurface);
  casse.mount("sample", glass.sample.root, glass.sample.onSurface);
  casse.mount("witness", glass.witness.root, glass.witness.onSurface);
  casse.mount("plain", cars.screen, null); //   the ordinary pane of before, in the car (in the windshield's frame)
  casse.mount("plainLine", glass.cutEnd, null); // …and on the line, the sheet at the cut end

  /* the dossier and the lab (dossier.js) */
  const dossier = buildDossier();
  places[SET.BENCH].add(dossier.bench);
  places[SET.LAB].add(dossier.lab);

  /* where the hero stands, by place */
  const mountBench = new THREE.Group();
  mountBench.position.set(...BENCH.at);
  const r = (BENCH.rake * Math.PI) / 180;
  orient(mountBench, new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, Math.cos(r), -Math.sin(r)));
  places[SET.BENCH].add(mountBench);
  const mountLine = new THREE.Group(); // lying on the line: its top downstream (+x), its inner face up
  orient(mountLine, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
  lineG.add(mountLine);
  const mountTemper = new THREE.Group();
  orient(mountTemper, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
  lineG.add(mountTemper);
  const mountSample = new THREE.Group();
  mountSample.position.set(ST.test.tower, ST.test.y + 1, 0);
  orient(mountSample, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
  lineG.add(mountSample);
  const mountWitness = new THREE.Group();
  mountWitness.position.set(ST.test.witness, ST.test.y + 1, 0);
  orient(mountWitness, new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0));
  lineG.add(mountWitness);
  mountSample.add(glass.sample.root);
  mountWitness.add(glass.witness.root);

  const home = (obj, parent) => {
    if (obj.parent !== parent) parent.add(obj);
  };

  return {
    places, bench, cars, glass, casse, dossier, machines,
    furnace, bath, lehr, rollers, cutter, printer, bender, clean, placer, autoclave, eyes, tower, rig, optics, striker, temperOven, blower, temperRoll,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const set = Math.round(S.set);
      places.forEach((g, i) => (g.visible = i === set));

      /* the hero windshield: where it stands */
      if (set === SET.BENCH) home(glass.hero.root, mountBench);
      else if (set === SET.CAR) home(glass.hero.root, cars.screen);
      else if (set === SET.ROAD) home(glass.hero.root, cars.roadScreen);
      else if (set === SET.LINE) {
        home(glass.hero.root, mountLine);
        // lying on the conveyor; on the bending mould it rides a little higher; on the test frame, on the frame
        const onMould = S.mould > 0.5 ? 14 : 0;
        mountLine.position.set(S.pos, LINE.y + 1.5 + onMould, 0);
      }
      // the side window: in the door (CAR, ROAD) or on the tempering lane (LINE)
      if (set === SET.LINE) {
        home(glass.side.root, mountTemper);
        mountTemper.position.set(S.sidePos, ST.temper.y + 1.5, ST.temper.z);
      } else home(glass.side.root, cars.sideMount);

      const sideShown = set === SET.LINE || S.sideOn > 0.5;
      glass.update(
        {
          place: set, hero: S.hero, cut: S.cut, print: S.print, bend: S.bend, open: S.open, film: S.film, milk: S.milk, explode: S.explode, sensors: S.sensors, glow: S.glow, queue: S.queue, pos: S.pos,
          litGlass: S.litGlass, litFilm: S.litFilm, litBand: S.litBand, litStamp: S.litStamp,
          flow: S.flow, batch: S.batch, charge: S.charge, melt: S.melt, ribbon: S.ribbon, pull: S.pull, silver: S.silver, mould: S.mould,
          side: sideShown ? 1 : 0, sideGlow: S.sideGlow, sideFilm: S.sideFilm, stress: S.stress, sample: S.sample, witness: S.witness,
        },
        time, px,
      );
      casse.update(
        {
          web: S.web, rings: S.rings, stick: S.stick, webAt: set === SET.LINE ? "test" : "head", webOn: S.sample > 0.5 ? "sample" : S.sideFilm > 0.5 && sideShown ? "side" : "hero",
          grains: S.grains, grainsOn: S.witness > 0.5 ? "witness" : sideShown ? "side" : "hero",
          chip: S.chip, creep: S.creep, resin: S.resin, bubble: S.bubble, nickel: S.nickel,
          plain: S.plain, blades: S.blades, plainOn: set === SET.LINE ? "plainLine" : "plain",
        },
        time, px,
      );

      if (set === SET.CAR || set === SET.ROAD) {
        cars.update({ which: set === SET.ROAD ? 1 : 0, shell: S.shell, wall: S.wall, crash: S.crash, lunge: S.lunge, you: S.you, tool: S.tool, kmh: S.kmh, drive: S.drive, sideOn: S.sideOn, plain: S.plain }, time, px);
      }
      if (set === SET.LINE) {
        const a = S.line;
        furnace.set({ amount: a, glow: S.melt, batch: S.charge, time });
        bath.set({ amount: a, shine: 1, heat: S.ribbon });
        lehr.set({ amount: a, glow: 0.25 * S.ribbon, time });
        rollers.set({ amount: a, roll: S.flow, heat: S.ribbon });
        cutter.set({ amount: a, travel: Math.min(1, S.knife), down: ramp(S.knife, 0, 2, 0.06), time });
        printer.set({ amount: a, travel: S.squeegee, down: ramp(S.squeegee, 0, 1, 0.06), time });
        bender.set({ amount: a, glow: S.glow, time });
        clean.set({ amount: a, air: S.air, time });
        // the placer's cups take the TOP sheet and lift it (`open`, ≈ 30 cm): it stays over the glass, it does not travel
        placer.set({ amount: a, travel: 0.5, down: Math.max(0, Math.min(1, S.open / 0.05)), lift: S.open, time });
        autoclave.set({ amount: a, door: S.door, pressure: S.press });
        eyes.set({ amount: a, travel: S.scan, down: ramp(S.sensors, 0, 1, 0.08), time });
        tower.set({ amount: a, ball: S.ball, small: S.small, chamber: S.chamber, time });
        rig.set({ amount: a, drop: S.drop, time });
        optics.set({ amount: a, look: S.optic });
        striker.set({ amount: a, strike: S.strike, square: S.count });
        temperOven.set({ amount: a, glow: S.sideGlow, time });
        blower.set({ amount: a, jets: S.jets, time });
        temperRoll.set({ amount: a, roll: S.flow, heat: S.sideGlow });
        hall.set({ pool: 0, grid: 0.12, mood: 0 });
      }
      if (set === SET.BENCH) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      }
      dossier.update({ place: set, doc: S.doc, docIn: S.docIn, mark: S.mark, flask: S.flask, star: S.star, ben: S.ben, labelOn: S.labelOn }, time, px);

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, S.hot);
      const d = stage.cam.d;
      scene.fog.density = set === SET.BENCH ? bench.fog(d) : set === SET.LINE ? 0.06 / Math.max(800, d) : 0.0002;
    },
  };
}

/* ───────────────────────────── shared by the chapters ───────────────────────────── */

/** Beats whose marked words stay OFF the picture (main.js hands it to commit): the chute has its own title (retitle). */
export const KEYWORDS_SKIP = ["chute"];
/** The chapter cards come in this long before their chapter's first word (long.js · chaptersOf). */
export const CARD_LEAD = 0.9;
/**
 * The time a chapter file owns: from its card in (its first beat's first word − CARD_LEAD) to the next chapter's card
 * in (or the end). A chapter's first cut lands at its `from`, under its card.
 */
export const span = (D, first, next = null) => [D.at(first) - CARD_LEAD, next ? D.at(next) - CARD_LEAD : D.END];
/** The line runs at FLOW cm per second of film, everywhere, always: `flow` is the same function of time in every chapter. */
export const FLOW = 40;
/** The road runs at `drive` = DRIVE metres per second of film (≈ 90 km/h). */
export const DRIVE = 25;
/** Keeps `flow` (and `drive`) running between t0 and t1, continuous from one chapter to the next. Call it once per chapter. */
export function run(D, t0, t1) {
  D.now(t0, { flow: FLOW * t0, drive: DRIVE * t0 });
  D.st(t0, t1 - t0, { flow: FLOW * t1, drive: DRIVE * t1 }, "none");
}
