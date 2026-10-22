// DOSSIER L02 — Poste haute tension (format long, 16:9) : the world. This file is the CONTRACT between the sets and
// the chapters:
//   · plan.js   where everything stands (read by every set; no import there)
//   · SET       the four places, one shown at a time: the POSTE (the substation at night), the BENCH, the LIGNE
//               (the line in the country: the helicopter of 2025, Virginia 1987), the MAP of France
//   · FIRST     the state of the world on the first frame — THE CLOSED LIST of numbers the chapters may move
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · AT        complete states, one per place: a chapter that cuts to a place writes { ...AT.poste, …what differs }
//   · HAND      the seams between two chapter files: the move each one hands to the next (D.match, `only`)
//   · apply     what each number does to the world, every frame (depends on S and time only)
//
// THE SETS (one file each, built at the same time against plan.js):
//   poste.js  the substation seen like an X-ray, you (a figure of glass), the ground in section, the air that gives way
//   model.js  the SOLID things: your bay's breakers and disconnectors, the padlock and the sign, the pole and its
//             detector, the earthing sets (clamps, copper cables) — and the hero breaker pole that goes to the bench
//   ligne.js  the pylons and their conductors (also the corridor that leaves the poste), the helicopter, Virginia, the map
//
// THREE COLOURS, and what they mean in this film: signal is WHAT IS LIVE (a conductor under tension, the arc, the
// induced voltage, the fault) and the threat; veille is WHAT PROTECTS (the earth: the mesh, the clamps, the zone where
// everything is at the same potential; the SF6 that blows the arc out; what is locked open); ink is the structure.
// YOUR line: signal while live → dark ink once cut → veille once earthed. THE NEIGHBOUR: signal, all film long.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { BRAND } from "@kit/brand.js";
import { BAY, PH, GANTRY, LSECT, WORK, EARTH, POLE, PYLON, CORRIDOR, BENCH, V87, LINE } from "./plan.js";
import { buildPoste } from "./poste.js";
import { buildModel } from "./model.js";
import { buildLigne, buildMap, makeCorridor } from "./ligne.js";
import { dressPoste, dressLigne } from "./habillage.js"; // the decorator: the life of the places

export const SET = { POSTE: 0, BENCH: 1, LIGNE: 2, MAP: 3 };
/** ≈ the radius of the hero breaker pole: sizes the bench, its pool, its shadows (the stage's `scale`). */
export const SIZE = BENCH.size;
export const FAR = 400000;

/** The header: the five gestures of the consignation (GESTE 03 / 05 · Identifier). 0 = "Consignation". */
export const STEPS = ["Séparer", "Condamner", "Identifier", "Vérifier", "Mettre à la terre"];
const CHAP_GESTE = { sec1: 1, cad1: 2, vat1: 4, induit1: 5 };
/** The chapter cards: their small line, and the line under the rule (the gesture, when the chapter is one). */
export const CARD = {
  kicker: () => "Dossier L02 · Consignation",
  sub: (c) => (CHAP_GESTE[c.id] ? `Geste ${String(CHAP_GESTE[c.id]).padStart(2, "0")} / 05` : c.id === "cad1" ? "Gestes 02 et 03 / 05" : ""),
};
/** The header's readout, "Ta ligne": `kv` in kV while live (signal), "Coupée" at 0 (ink), "À la terre" (veille). */
export const LINE_HUD = {
  word: "Geste",
  off: "Consignation",
  fmt: (v) => (v < 0 ? "À la terre" : v >= 1 ? `${String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} 000 V` : "Coupée"),
  tone: (v) => (v < 0 ? "#5cffb0" : v >= 1 ? "#ff5b2e" : "#e9e4d8"),
};

/** The work point on each phase's dropper (station side, x = WORK.x) and on the line side (WORK.lineX), in the poste. */
const dropY = (x) => GANTRY.attach - (GANTRY.attach - LSECT.top) * (x / (LSECT.x - LSECT.gap / 2));
export const WORKAT = PH.map((z) => [WORK.x, dropY(WORK.x), BAY.mine + z]);
export const LINEAT = PH.map((z) => [WORK.lineX, GANTRY.attach + 180, BAY.mine + z]); // ≈ on the span, just outside the gantry

// The FIRST frame is the hook: a 400 kV conductor up close, the head of the detector against it, mute; behind, the
// neighbour glows signal. The film loops: the last sentence ("…il reste…") lands here. The LAST 15 s leave the
// right half of the frame to YouTube's end screen, and the last frame IS this one: the subject stands in the LEFT
// half (side 300). CANDIDATES: VIEW.hook1 … hook4 — the orchestrator picks one on a board before the chapters.
// Chosen by the architect on the board of six (scratchpad/L02/candidates.jpg, 20/10): hook5, the head in macro, its hook on
// your conductor, the neighbour burning behind — the orchestrator confirms or picks another.
export const POSE0 = { tx: WORKAT[0][0], ty: WORKAT[0][1] - 7, tz: WORKAT[0][2], d: 150, az: 22, el: 2, fov: 34, shift: 0, side: 280, roll: 0, drift: 0.3 };

export const FIRST = {
  set: SET.POSTE,
  /* ── the header (main.js reads them) ── */
  geste: 0, //   the gesture on screen: 1 … 5 (STEPS), 0 = "Consignation". Integer: `now`, never `st`
  kv: 0, //      "Ta ligne": kV while live (400), 0 = "Coupée", −1 = "À la terre". Values the voice says only. `now`
  kvOn: 0, //    1 shows the readout, 0 shows "—"
  /* ── the lines (read by poste.js AND ligne.js: the same meaning in every place) ── */
  live: 0, //    YOUR circuit under tension, drawn: 0 cut (dark ink) → 1 live (signal)
  voisine: 1, // THE NEIGHBOUR under tension: 0 → 1 (signal). It stays at 1 all film, but for the incident's cut
  earthed: 0, // YOUR circuit at the earth: 0 → 1 its conductors turn veille (and the zone, see `zone`)
  couple: 0, //  the neighbour acting on yours through the air: 0 none → 1 thin field lines from its conductors to yours (signal)
  induced: 0, // what that makes in YOUR circuit: 0 nothing → 1 a faint signal life in your cut conductors (the voltage the
  //             detector does not see) → 2 the fault: it surges (bright, fast) — `st` only through 0 → 1 → 2
  current: 0, // a current FLOWING down the earthing sets into the ground: 0 → 1 (bright dashes along the clamps' cables,
  //             the mesh lights under them). Its dashes run at a fixed speed: never tween it fast
  defect: 0, //  the fault on the neighbour, far away (the corridor in the poste, or the line): 0 → 1 an arc at one of its
  //             insulators (a light that has a place), then 1 → 0 it dies when its breaker cuts
  /* ── the poste (poste.js) ── */
  poste: 1, //   the X-ray of the substation (0–1): lower it to let a solid thing read
  bays: 1, //    the other bays and their gantries (0–1); `mark` 0 → 1: YOUR bay's gantry lit veille, a marker on it
  mark: 0,
  efield: 0, //  the electric field under the conductors, drawn: 0 → 1 field lines rising from the ground to them
  airArc: 0, //  the air that gives way: 0 → 0.5 the air tenses (a faint signal glow between conductor and hand) → 1 the arc
  envelope: 0, // the forbidden distance: 0 → 1 an envelope of glass hugging the conductors, a few metres thick
  cutaway: 0, // the ground in section under your bay: 0 closed (the gravel's surface) → 1 cut open (gravel, soil, mesh)
  mesh: 0, //    the earth mesh lit (veille, 0–1)
  fault: 0, //   a fault sends current into the ground: 0 → 1 rings of potential spreading from it (signal, uneven)
  bond: 0, //    0 the rings uneven (a step voltage between your feet) → 1 the mesh ties it all: everything rises together
  gravel: 0, //  the gravel's resistance under your feet, drawn: 0 → 1 (a thin glowing layer, the current choked in it)
  explode: 0, // "on l'ouvre": the bay comes apart (0 → 1): gantry up, strings and insulators apart, apparatus apart
  //             (model.js), the mesh down out of the ground. Read by poste.js AND model.js
  named: 0, //   the part the voice names, lit — in the exploded bay or in place (`now`): 0 none · 1 gantry · 2 insulators ·
  //             3 breaker · 4 disconnector · 5 mesh (poste.js: 1, 2, 5) · 6 padlock and sign · 7 the pole's detector ·
  //             8 the earthing sets (model.js: 3, 4, 6, 7, 8). The recap lights 4, 6, 1 (with `mark`), 7, 8 in turn
  zone: 0, //    the equipotential zone between the two earthing sets: 0 → 1 a veille volume of glass, you inside
  you: 1, //     you, a figure of glass (0–1)
  walk: 0.8, //  where you are on the ground: 0 the gate → 0.8 your work spot (WORK.stand) → 1 the foot of the gantry leg
  climb: 0, //   0 on the ground → 1 up the leg, on the beam, at your work (WORK.climb.top)
  arms: 1, //    0 arms down · 1 both hands on the pole, raised toward the conductor · 2 one hand reaching forward
  //             (with `climb` 1: toward the conductor, the air arc · with `climb` 0: on the gantry leg, the touch voltage)
  chief: 0, //   TWO more figures of glass (0–1): the chargé de consignation and the chargé de travaux (your team's chief);
  paper: 0, //   `paper` the attestation: 0 in the first one's hand → 1 in the second one's (a small solid sheet, ink)
  /* ── the solid things (model.js) ── */
  open: 0, //    the hero breaker's contacts: 0 closed → 1 apart (all three poles in the poste; the hero on the bench)
  arc: 0, //     the arc between them (0–1): a white-hot core, a sheath, a halo — a light that has a place
  heat: 0, //    the arc's core drawn hotter (0–1: "vingt mille degrés")
  gas: 0, //     the SF6 blowing on the arc (0–1, veille): it flows in on each zero
  wave: 0, //    the alternating current, drawn as a sine beside the chamber (0–1); `cycle`: half-waves shown (only grows)
  cycle: 0,
  see: 0, //     the chamber's housing: 0 closed, opaque (the contacts hidden) → 1 cut open (the inside readable)
  parts: 0, //   the chamber's own exploded view (0–1: contacts, nozzle, piston apart along its axis)
  era: 0, //     BENCH: the 1956 breaker beside the hero: 0 none → 1 there → 2 its six chambers in series lit one by one
  cloud: 0, //   the gas leaves the chamber as a rising cloud (0–1)
  vacuum: 0, //  the gas withdraws, a vacuum bottle takes its place in the chamber (0–1)
  sopen: 0, //   your line disconnector: 0 closed → 1 open (the arms turned apart, air between the contacts)
  lock: 0, //    its padlock: 0 none → 0.5 on, open → 1 locked; `sign` 0 → 1 the sign hung (CONDAMNÉ · DÉFENSE DE MANŒUVRER)
  sign: 0,
  threat: 0, //  a signal pulse on what could CLOSE AGAIN (0–1): the breaker poles' operating mechanism while the line
  //             disconnector is closed (`sopen` < 0.5: "un disjoncteur… ça se referme"), the disconnector's closing
  //             axis once it is open ("un sectionneur… ça se referme", "il doit le rester quoi qu'il arrive")
  perche: 1, //  the insulating pole: 0 lowered, in your hands → 1 raised, its head against the conductor
  probe: 0, //   which conductor its head is on: 0 phase 1 → 1 phase 2 → 2 phase 3 (`st` between: it moves across)
  tool: 0, //    what the pole carries: 0 the detector · 1 an earth clamp (`now`)
  beep: 0, //    the detector's lamps (0–1): they stay OFF all film (this is the point) — for a what-if only
  clamps: 0, //  the earthing sets (both sides of the work, and the ones of 1987): 0 none · 0 → 1 the earth end clamped
  //             on its terminal · 1 → 2 the line ends rise to the conductors, phase after phase · 2 all on.
  //             Taken off: 2 → 1 the line ends first, 1 → 0 the earth end last
  /* ── the line in the country (ligne.js) ── */
  span: 1, //    the X-ray of the pylons (0–1)
  day: 0, //     the sky: 0 night → 1 dusk (the helicopter's July evening)
  heli: 0, //    the helicopter and its basket (0–1); `fly` its x along the line (cm); `basket` 0 hanging under it,
  fly: 60000, // high → 1 docked on the conductors at the spacer; `spacer` 0 the old one → 1 the new one fitted
  basket: 0,
  spacer: 0,
  v87: 0, //     Virginia 1987: 0 nothing · 0 → 1 its night, the earthing sets on both towers · 1 → 2 the crew there too
  //             (the apprentice at the foot of the first tower, his mate a few metres away)
  wrong: 0, //   1987: the earth end undone FIRST (0 → 1): the cable hangs from the conductor, its end free near the ground
  grab: 0, //    1987: the apprentice's hand on that free end (0 → 1); `shock` 0 → 1 the induced current through him (signal)
  shock: 0,
  /* ── the map (ligne.js · buildMap) ── */
  dots: 0, //    the substations of France, lit one by one (0–1 of ≈ 2 900); `links` the lines between them (0–1)
  links: 0,
  here: 0, //    this poste's point on the map (0–1): it is the poste, seen from very high
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal on the rim (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); `hot` warms the background (0–1);
  // the bench's pool and grid
  fx: WORKAT[0][0], fy: WORKAT[0][1], fz: WORKAT[0][2], fs: 600, mood: 1, gel: 0, hot: 0.15, pool: 0.2, grid: 0.16,
};

/** Everything at rest: what a cut to any place starts from (then AT.* says what that place needs). */
const REST = {
  live: 0, voisine: 1, earthed: 0, couple: 0, induced: 0, current: 0, defect: 0,
  poste: 1, bays: 1, mark: 0, efield: 0, airArc: 0, envelope: 0, cutaway: 0, mesh: 0, fault: 0, bond: 0, gravel: 0, explode: 0, named: 0, zone: 0,
  you: 1, walk: 0.8, climb: 0, arms: 0, chief: 0, paper: 0,
  open: 0, arc: 0, heat: 0, gas: 0, wave: 0, see: 0, parts: 0, era: 0, cloud: 0, vacuum: 0,
  sopen: 0, lock: 0, sign: 0, threat: 0, perche: 0, probe: 0, tool: 0, beep: 0, clamps: 0,
  span: 1, day: 0, heli: 0, basket: 0, spacer: 0, v87: 0, wrong: 0, grab: 0, shock: 0,
  dots: 0, links: 0, here: 0,
  mood: 0, gel: 0, hot: 0, pool: 0.2, grid: 0.16,
};
/**
 * Complete states, one per place. AT does NOT say the header (`geste`, `kv`, `kvOn`), nor the numbers that only grow
 * (`cycle`), nor `fly`: the chapter does, on every cut. Before the consignation (chapters "Le poste", "Le disjoncteur",
 * "Sans couper") your line is LIVE: { ...AT.poste, live: 1 }. AT.poste is the consignation's starting point (cut).
 */
export const AT = {
  // the poste at night, your line cut, the neighbour live, you at your work spot
  poste: { ...REST, mood: 1, hot: 0.12, fx: 600, fy: 600, fz: 0, fs: 1800 },
  // the hero pole on the bench, closed, its housing closed; the light stands around its CHAMBER (model.js's plans)
  bench: { ...REST, you: 0, fx: 0, fy: 750, fz: 0, fs: SIZE, pool: 0.3 },
  // …or around the WHOLE pole (≈ 9 m: VIEW.benchPole): a wide light, a strong pool — at fs 300 only its foot is lit
  benchTall: { ...REST, you: 0, fx: 0, fy: 420, fz: 0, fs: 700, pool: 0.55, grid: 0.2 },
  // the line in the country, both circuits live (`day` and `heli` for 2025, `v87` for 1987)
  ligne: { ...REST, you: 0, live: 1, mood: 1, hot: 0.1, fx: 60000, fy: 3500, fz: 0, fs: 6000 },
  // the map of France, the points not yet lit
  map: { ...REST, you: 0, mood: 0, fx: 0, fy: 0, fz: 0, fs: 8000 },
};

/** The poses that frame each place (complete: nothing is inherited across a cut). POSED on stand-ins: the sets give better ones. */
const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const W0 = WORKAT[0];
export const VIEW = {
  hook: POSE0,
  /* ── the hook: four candidates for the first frame (the orchestrator picks one) ── */
  // seen on the board of six (FIRST): 1 and 5 carry the neighbour's catenaries behind; 2, 4, 6 lose it
  hook1: { ...P, tx: W0[0], ty: W0[1], tz: W0[2], d: 300, az: -10, el: 6, fov: 32, side: 300 }, //   seen: the head small, the neighbour's catenaries behind, a signal flare on the left edge
  hook2: { ...P, tx: W0[0], ty: W0[1], tz: W0[2], d: 140, az: -70, el: -12, fov: 36, side: 300 }, // seen: the pole and its head against black — no neighbour
  hook3: { ...P, tx: 330, ty: 760, tz: 760, d: 900, az: -18, el: 12, fov: 32, side: 320 }, //       seen: the bay, the neighbour's catenaries high — the head is lost
  hook4: { ...P, tx: W0[0], ty: W0[1], tz: W0[2], d: 360, az: -8, el: 32, fov: 32, side: 300 }, //  seen: plunge on your apparatus — no neighbour glow, the head small
  hook5: POSE0, //                                                                                   seen: the head in macro, its hook on your conductor, the neighbour behind (chosen)
  hook6: { ...P, tx: W0[0], ty: W0[1], tz: W0[2], d: 230, az: -55, el: 14, fov: 34, side: 300 }, //  seen: the dropper in diagonal, the insulators — the neighbour barely there
  /* ── the poste ── */
  posteWide: { ...P, tx: 1500, ty: 300, tz: -1200, d: 11000, az: -35, el: 24, fov: 30 }, //          posed: the whole poste from high
  bay: { ...P, tx: 1400, ty: 600, tz: 0, d: 4200, az: -40, el: 14, side: -150 }, //                  posed: your bay in three quarters
  gantry: { ...P, tx: 0, ty: 1400, tz: -600, d: 3200, az: -32, el: 6 }, //                           posed: the arrival gantry, both bays' strings
  work: { ...P, tx: 300, ty: 1000, tz: 0, d: 1300, az: -72, el: 4 }, //                               seen (model): the three droppers from the side, { clamps: 2, earthed: 1, current: 1 } — at az −35 the cables of set A bar the frame
  field: { ...P, tx: 300, ty: 300, tz: 980, d: 900, az: -30, el: 4, side: -100 }, //                     seen (poste): you under your line, { live: 1, efield: 1 }
  zone: { ...P, tx: -100, ty: 900, tz: 400, d: 2600, az: -38, el: 10, side: -100 }, //                   seen (poste): { earthed: 1, zone: 1, clamps: 2 }
  clampEarth: { ...P, tx: 300, ty: 20, tz: 1250, d: 110, az: -35, el: 16 }, //                           seen (model): the earth clamp on its terminal ({ clamps: 0 → 1 })
  chiefs: { ...P, tx: 760, ty: 120, tz: 1150, d: 1100, az: -20, el: 6 }, //                               seen (poste): { chief: 1, paper: 0.5 } — a column of the +z bay crosses: lower `bays` or az −45
  touch: { ...P, tx: 150, ty: 40, tz: 1300, d: 1300, az: -22, el: 10, side: -100 }, //                   seen (poste): { walk: 1, arms: 2, cutaway: 1, mesh: 0.6, fault: 1 }
  you: { ...P, tx: WORK.stand[0], ty: 140, tz: WORK.stand[2], d: 650, az: -30, el: 8, side: -100 }, // posed: you at your spot, the pole
  climb: { ...P, tx: WORK.climb.leg[0], ty: 1100, tz: WORK.climb.leg[2], d: 900, az: -40, el: -8, side: -100 }, // seen (poste): { walk: 1, climb: 0.45 }
  beam: { ...P, tx: -120, ty: 1700, tz: 680, d: 1100, az: -60, el: 4, side: -100 }, //                      seen (poste): the air arc, { live: 1, climb: 1, arms: 2, airArc: 1 }
  // the camera stands in the +z bay (z ≈ 2 600): that bay only fades with `cutaway` > 0 — never this pose without the cut
  ground: { ...P, tx: 600, ty: -60, tz: 1300, d: 1700, az: -28, el: 22, side: -100 }, //                 seen (poste): { cutaway: 1, mesh: 0.6, fault: 0.7 }
  gravel: { ...P, tx: WORK.stand[0], ty: 0, tz: WORK.stand[2], d: 220, az: -20, el: 20 }, //          posed: your feet on the gravel
  pylon: { ...P, tx: PYLON.at[0], ty: 2600, tz: PYLON.at[2], d: 6500, az: -62, el: 6, side: -100 }, // posed: the last pylon, both circuits
  breaker: { ...P, tx: 1700, ty: 700, tz: PH[0], d: 760, az: -35, el: 8, side: -160 }, //             posed: your breaker pole (phase 1)
  lsect: { ...P, tx: LSECT.x, ty: 620, tz: PH[0], d: 700, az: -28, el: 12, side: -160 }, //          posed: your line disconnector (phase 1)
  lockup: { ...P, tx: LSECT.x - LSECT.gap / 2 + 15, ty: 118, tz: PH[0] + 60, d: 190, az: -26, el: 12 }, // seen (model): { sopen: 1, lock: 1, sign: 1, fx: 575, fy: 120, fz: 640, fs: 200 } — the sign hangs right of the box
  ident: { ...P, tx: 0, ty: 1800, tz: -1200, d: 9000, az: -12, el: 52, fov: 30 }, //                  posed: a plunge over the identical gantries
  /* ── the bench ── */
  benchPole: { ...P, tx: 0, ty: 480, tz: 0, d: 1500, az: -30, el: 8, side: -180 }, //                with AT.benchTall: the whole pole lit (model.js: dark and thin under AT.bench)
  chamber: { ...P, tx: 0, ty: 748, tz: 0, d: 300, az: -25, el: 6, side: -160 }, //                   seen (model): { see: 1, open: 1, arc: 1, heat: 0.6 } — also gas + wave (the sine on the left), vacuum. The cut faces az −25: keep az in −5 … −45
  parts: { ...P, tx: 0, ty: 750, tz: 0, d: 420, az: -25, el: 6, side: -160 }, //                     seen (model): { see: 1, parts: 1 }
  cloud: { ...P, tx: 0, ty: 1150, tz: 0, d: 1700, az: -28, el: 6, side: -160 }, //                   seen (model): { cloud: 0.8, fy: 800, fs: 600 }
  arcCore: { ...P, tx: 0, ty: 745, tz: 0, d: 90, az: -20, el: 4, fov: 32 }, //                        seen (model): the core, { heat: 1 } — the first thumbnail
  old: { ...P, tx: BENCH.old[0], ty: 300, tz: BENCH.old[2], d: 1300, az: -30, el: 10, side: -120 }, // seen (model): { era: 2, fx: 520, fy: 300, fz: -260, fs: 500 }
  /* ── the line ── */
  lineWide: { ...P, tx: 70000, ty: 2600, tz: 0, d: 70000, az: -30, el: 3, fov: 30 }, //                seen (ligne): three pylons, the line to the horizon ({ live: 1, day: 1, heli: 1, fly: 60000, basket: 0.5 })
  heliWide: { ...P, tx: 60000, ty: 5250, tz: 900, d: 7800, az: -36, el: -2, fov: 30, side: -300 }, // seen (ligne): helicopter, 18 m sling, basket, bundles (the helicopter is small)
  heliClose: { ...P, tx: 60000, ty: 6450, tz: 900, d: 2600, az: -30, el: -6, fov: 30 }, //            seen at ty 6150 (the helicopter top left); 6450 re-centres it, not seen
  vertigo: { ...P, tx: 60000, ty: 4200, tz: 900, d: 2800, az: -24, el: 46, fov: 42 }, //              seen (ligne): from high, the basket hanging, the six bundles, the ground 37 m below ({ basket: 0.5 })
  basket: { ...P, tx: 60010, ty: 3700, tz: 880, d: 560, az: -40, el: 10, side: -120 }, //             seen (ligne): two technicians, the new spacer ({ basket: 1, spacer: 0.75 }) — the third thumbnail
  basketFront: { ...P, tx: 60000, ty: 3680, tz: 870, d: 620, az: -22, el: 14 }, //                    seen (ligne): the same from the front
  pair: { ...P, tx: LINE.span, ty: 4000, tz: 0, d: 9000, az: -82, el: 4, fov: 30 }, //                posed: both circuits side by side, along the line
  v87: { ...P, tx: 40100, ty: 150, tz: 1450, d: 900, az: -15, el: 6, side: -150 }, //                  proposed (ligne), NOT seen: the foot of the tower, 1987 (at az −30 the tower's legs eat it)
  corridor: { ...P, tx: -60000, ty: 2500, tz: -1200, d: 60000, az: 82, el: 2 }, //                     seen (ligne), POSTE: the corridor seen from the poste, the far fault ({ defect: 1 })
  v87tower: { ...P, tx: V87.towers[0], ty: 3000, tz: 0, d: 7000, az: -40, el: 4 }, //               posed: the tower, the earths on it
  /* ── the map ── */
  map: { ...P, tx: 0, ty: 0, tz: -300, d: 40000, az: 0, el: 72, fov: 30 }, //                        seen (ligne): France whole (at d 32 000 the north and Corsica leave the frame)
  mapHere: { ...P, tx: 2600, ty: 0, tz: -5200, d: 2400, az: 0, el: 72, fov: 30 }, //                 posed: the poste's point
};

/**
 * The SEAMS between two chapter files (docs/L02-actes.md). Each file lays its own half with the same arguments:
 *   D.match(D.at(HAND.c12.at), HAND.c12.from, HAND.c12.to, { ...HAND.c12.opt, only: "out" })   // the file that ends
 *   D.match(D.at(HAND.c12.at), HAND.c12.from, HAND.c12.to, { ...HAND.c12.opt, only: "in" })    // the file that starts
 * A seam inside a place keeps `to` = the last pose of `from` (the move simply goes on: no visible cut). These poses
 * are the orchestrator's: a chapter never changes them (write "À changer ailleurs").
 */
export const HAND = {
  // c1 → c2, inside "Le poste" ("…d'air interdit" → "Et le maillage enterré sous tes pieds ?"): the camera sinks from
  // the envelope around the droppers toward the ground in front of your bay — and goes on sinking
  c12: {
    at: "sol-0.3",
    from: [{ ...P, tx: W0[0], ty: 1000, tz: 300, d: 1700, az: -34, el: 6 }, { ...P, tx: W0[0] + 100, ty: 420, tz: 900, d: 1300, az: -30, el: 0 }],
    to: { ...P, tx: W0[0] + 100, ty: 420, tz: 900, d: 1300, az: -30, el: 0 },
    opt: { before: 1.2, after: 1.0 },
  },
  // c2 → c3, inside "Le disjoncteur" (the arc is out → "Ce combat contre l'arc dure depuis 1956"): on the bench, a slow
  // pull-back from the dead chamber that goes on
  c23: {
    at: "histoire-0.2",
    from: [{ ...P, tx: 0, ty: 750, tz: 0, d: 300, az: -24, el: 6, side: -120 }, { ...P, tx: 0, ty: 720, tz: 0, d: 420, az: -28, el: 7, side: -140 }],
    to: { ...P, tx: 0, ty: 720, tz: 0, d: 420, az: -28, el: 7, side: -140 },
    opt: { before: 1.4, after: 1.2 },
  },
  // c3 → c4, under the card "Séparer": the poste, a lateral travel along your bay toward the breaker (+x) — it goes on
  // through the card and the next file lands on the breaker
  c34: {
    at: "sec1-0.9",
    from: [{ ...P, tx: 700, ty: 500, tz: 600, d: 1400, az: -40, el: 8 }, { ...P, tx: 1100, ty: 560, tz: 600, d: 1250, az: -38, el: 8 }],
    to: { ...P, tx: 1100, ty: 560, tz: 600, d: 1250, az: -38, el: 8 },
    opt: { before: 0.9, after: 1.1 },
  },
  // c4 → c5, under the card "Vérifier": the camera turns from your mute detector toward the neighbour that glows (−z)
  c45: {
    at: "vat1-0.9",
    from: [{ ...P, tx: W0[0], ty: W0[1], tz: 300, d: 900, az: -36, el: 6 }, { ...P, tx: W0[0], ty: W0[1], tz: -400, d: 1000, az: -56, el: 6 }],
    to: { ...P, tx: W0[0], ty: W0[1], tz: -400, d: 1000, az: -56, el: 6 },
    opt: { before: 1.0, after: 1.0 },
  },
  // c5 → c6, under the card "L'incident": you have climbed; the camera rises with you and pulls back into the night
  c56: {
    at: "orage-0.9",
    from: [{ ...P, tx: 0, ty: 1500, tz: 900, d: 1000, az: -40, el: 2 }, { ...P, tx: 0, ty: 1750, tz: 700, d: 1300, az: -42, el: 5 }],
    to: { ...P, tx: 0, ty: 1750, tz: 700, d: 1300, az: -42, el: 5 },
    opt: { before: 1.0, after: 1.2 },
  },
};

/* ───────────────────────────── the world ───────────────────────────── */

const Y = new THREE.Vector3(0, 1, 0);
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const vC = new THREE.Vector3();
const qPole = new THREE.Quaternion();
const lerp = (a, b, u) => a + (b - a) * u;

export function buildWorld(stage) {
  const { scene } = stage;
  stage.grade.gel.set(BRAND.signal);

  /* the four places: one group each, one shown at a time */
  const places = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];
  for (const g of places) scene.add(g);

  /* POSTE — the substation (poste.js), and the corridor that leaves it toward −x (ligne.js, from the last pylon) */
  const poste = buildPoste();
  places[SET.POSTE].add(poste.group);
  const corridor = makeCorridor({ from: PYLON.at, dir: -1, span: CORRIDOR.span, n: CORRIDOR.n, sag: CORRIDOR.sag, pylon: { h: PYLON.h, arms: PYLON.arms, reach: PYLON.reach, earthWire: PYLON.earthWire }, first: true });
  places[SET.POSTE].add(corridor.group);
  const dress = { poste: dressPoste(), ligne: dressLigne() }; places[SET.POSTE].add(dress.poste.group); places[SET.LIGNE].add(dress.ligne.group);

  /* the solid things (model.js): your bay's apparatus in the poste; the hero pole re-parented to the bench */
  const model = buildModel();
  const bayMount = new THREE.Group();
  bayMount.position.set(0, 0, BAY.mine);
  bayMount.add(model.bay);
  places[SET.POSTE].add(bayMount);
  places[SET.POSTE].add(model.pole.group);
  // the two earthing sets of the poste: station side (WORK.x) and line side (WORK.lineX)
  const earthA = model.makeEarthSet({ ground: EARTH.a, points: WORKAT });
  const earthB = model.makeEarthSet({ ground: EARTH.b, points: LINEAT });
  places[SET.POSTE].add(earthA.group, earthB.group);

  /* BENCH */
  const bench = makeBench(SIZE);
  places[SET.BENCH].add(bench.group);
  const benchMount = new THREE.Group();
  benchMount.position.set(...BENCH.at);
  places[SET.BENCH].add(benchMount, model.old);

  /* LIGNE — the line in the country (ligne.js); the earthing sets of 1987 on its two towers (model.js) */
  const ligne = buildLigne();
  places[SET.LIGNE].add(ligne.group);
  const v87 = V87.towers.map((x, i) =>
    model.makeEarthSet({ ground: [x, 0, 1200], points: ligne.A.phases(x + (i ? -1 : 1) * 600), free: i === 0 ? [V87.at[0] + 120, 110, V87.at[2] - 200] : null }),
  );
  for (const e of v87) places[SET.LIGNE].add(e.group);

  /* MAP */
  const map = buildMap();
  places[SET.MAP].add(map.group);

  const home = (obj, parent) => {
    if (obj.parent !== parent) parent.add(obj);
  };

  return {
    places, poste, corridor, model, earthA, earthB, bench, ligne, v87, map,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      const px = stage.pixelScale();
      const set = Math.round(S.set);
      places.forEach((g, i) => (g.visible = i === set));

      /* the hero breaker pole: in your bay, or on the bench */
      if (set === SET.BENCH) home(model.hero, benchMount);
      else home(model.hero, model.heroHome);

      const lines = { live: S.live, voisine: S.voisine, earthed: S.earthed, couple: S.couple, induced: S.induced, current: S.current, defect: S.defect };

      if (set === SET.POSTE) {
        poste.set(
          {
            amount: S.poste, ...lines, bays: S.bays, mark: S.mark, efield: S.efield, airArc: S.airArc, envelope: S.envelope, cutaway: S.cutaway,
            mesh: S.mesh, fault: S.fault, bond: S.bond, gravel: S.gravel, explode: S.explode, named: S.named, zone: S.zone,
            you: S.you, walk: S.walk, climb: S.climb, arms: S.arms, chief: S.chief, paper: S.paper, probe: S.probe, perche: S.perche, clamps: S.clamps, tool: S.tool,
          },
          time, px,
        );
        corridor.set({ amount: S.poste, ...lines }, time, px);
        dress.poste.update({ amount: S.poste }, time, px);
        earthA.set({ clamps: S.clamps, current: S.current, earthed: S.earthed }, time, px);
        earthB.set({ clamps: S.clamps, current: S.current, earthed: S.earthed }, time, px);

        /* the pole: from your hands to the conductor its head is on (WORKAT, `probe` across), `perche` raises it */
        const hands = poste.you.A.hands;
        hands.getWorldPosition(vA);
        const k = Math.max(0, Math.min(2, S.probe));
        const i0 = Math.min(1, Math.floor(k));
        const u = k - i0;
        vB.set(lerp(WORKAT[i0][0], WORKAT[i0 + 1][0], u), lerp(WORKAT[i0][1], WORKAT[i0 + 1][1], u), lerp(WORKAT[i0][2], WORKAT[i0 + 1][2], u));
        if (S.tool > 0.5 && S.clamps > 1 && S.clamps < 2) earthA.A.head.getWorldPosition(vB); // the pole carries the rising clamp
        vC.set(vA.x + 120, vA.y + 260, vA.z + 120); // lowered: leaning on your shoulder
        vB.lerp(vC, 1 - S.perche);
        model.pole.group.position.copy(vA);
        vC.subVectors(vB, vA);
        model.pole.fit?.(vC.length());
        qPole.setFromUnitVectors(Y, vC.normalize());
        model.pole.group.quaternion.copy(qPole);
        model.pole.group.visible = S.you > 0.01;
      }

      model.set(
        {
          place: set, live: S.live, earthed: S.earthed, explode: S.explode, named: S.named,
          open: S.open, arc: S.arc, heat: S.heat, gas: S.gas, wave: S.wave, cycle: S.cycle, see: S.see, parts: S.parts,
          era: S.era, cloud: S.cloud, vacuum: S.vacuum, sopen: S.sopen, lock: S.lock, sign: S.sign, threat: S.threat,
          head: S.tool > 0.5 ? 1 : 0, beep: S.beep,
        },
        time, px,
      );

      if (set === SET.LIGNE) {
        ligne.set({ amount: S.span, ...lines, day: S.day, heli: S.heli, fly: S.fly, basket: S.basket, spacer: S.spacer, v87: S.v87, wrong: S.wrong, grab: S.grab, shock: S.shock }, time, px);
        dress.ligne.update({ amount: S.span, day: S.day, crew: S.v87 - 1 }, time, px);
        for (const e of v87) {
          e.group.visible = S.v87 > 0.01 && S.clamps + S.wrong > 0.01;
          e.set({ clamps: S.clamps, current: S.current, earthed: S.earthed, wrong: S.wrong, shock: S.shock }, time, px);
        }
      }
      if (set === SET.MAP) map.set({ dots: S.dots, links: S.links, here: S.here }, time, px);
      if (set === SET.BENCH) bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });

      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, S.hot);
      const d = stage.cam.d;
      scene.fog.density = set === SET.BENCH ? bench.fog(d) : set === SET.POSTE ? 0.05 / Math.max(1500, d) : set === SET.LIGNE ? 0.04 / Math.max(6000, d) : 0;
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
/** When a chapter's card comes in, inside a file: its first beat's first word − CARD_LEAD (`cardAt(D, "disj1")`). */
export const cardAt = (D, beat) => D.at(beat) - CARD_LEAD;
/**
 * Lays a file's half of a seam: `seam(D, "c12", "out")` at the end of c1; at the start of c2,
 * `seam(D, "c12", "in", { set: SET.POSTE, state: { ...AT.poste, live: 1, … } })` — the file that starts gives the
 * COMPLETE state on the cut (it depends on no other file). Returns the pose the camera reaches after the seam.
 */
export const seam = (D, name, only, extra = {}) => {
  const h = HAND[name];
  return D.match(D.at(h.at), h.from, h.to, { ...h.opt, ...extra, only });
};
