// DOSSIER L07 — La fibre optique (format long, 16:9) : the world. This file is the CONTRACT between the sets and the
// chapters:
//   · plan.js   where everything stands (read by every set; no import there)
//   · SET       the four places, one shown at a time: BANC (the systems, solid), USINE (the factory), MER, TERRE
//   · ITEM      what stands on the bench (one at a time)
//   · FIRST     the state of the first frame — THE CLOSED LIST of numbers the chapters may move
//   · AT        complete states, one per place: a chapter that cuts writes { ...AT.usine, …what differs }
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · HAND      the seams between two chapter files (D.match, `only`): each file lays its own half
//   · apply     what each number does to the world, every frame (depends on S and time only)
//
// THE SETS (one file each, built at the same time against plan.js; each exports build…() → { group, A, update(S, time, px), fog? }):
//   fibre.js     the SOLID systems on the bench: the indoor cable and its exploded view, the fibre (glass, two coatings,
//                its core) and the light that runs in it, the principle (core and cladding, the ray that ricochets, the
//                bend that lets it out), the 1960s glass rod, the two documents (Kao 1966, Corning 1970), the subsea
//                cable in section, the cable being assembled, the splice (cleaver, splicer, arc, sleeve), the coupler
//                1 → 32, the wall socket, the green connector and its 8° end, the optical box
//   fabrique.js  the factory, X-ray, its glass solid: the liquid and its still, the burner and the white soot, the
//                lathe (the soot building on a turning rod, core then cladding), the furnace (chlorine, then the
//                white turning clear), the preform, THE DRAW TOWER (the centrepiece: the drop, the fibre, the laser
//                gauge, the two coatings, the UV lamps, the capstan, the spool), the proof test and its wheels, the echo
//   voyage.js    the journey, X-ray: MER (the cable ship and its tanks, the cable paying out to the bottom, the
//                plough, the repeater, the anchor, the grapnel, the loop) and TERRE (the duct under the beach, the old
//                ducts of the street, the blowing, the crushed duct, the cabinet, the 32 homes, your landing, your
//                room, your box behind the furniture)
//
// THREE COLOURS, and what they mean in THIS film: veille is THE LIGHT — what runs in the fibre (the pulses, the core
// that carries them, the coupler's shares, the amplifier that relaunches it), what the system does right (the laser
// gauge on target, the wheels that hold, the green connector — the only object that IS green); signal is THE THREAT
// and THE HEAT — the furnace and the drop (> 450 °C only), the impurities, the water, the bubble, the dust, the
// microcrack, the anchor, the crushed duct, the light that LEAVES the fibre in the bend; ink is the structure.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { BRAND } from "@kit/brand.js";
import { BENCH, FIBER, CABLE, PRINCIPE, HIST, SUBSEA, MULTI, SPLICE, COUPLER, PLUG, STILL, LATHE, SINTER, TOWER, PROOF, SEA, SHIP, LAND } from "./plan.js";
import { buildFibre } from "./fibre.js";
import { buildFabrique } from "./fabrique.js";
import { buildVoyage } from "./voyage.js";

export const SET = { BANC: 0, USINE: 1, MER: 2, TERRE: 3 };
/** What stands on the bench (S.item), one at a time. */
export const ITEM = { CABLE: 0, FIBRE: 1, PRINCIPE: 2, HIST: 3, DOCS: 4, SUBSEA: 5, MULTI: 6, SPLICE: 7, COUPLER: 8, PLUG: 9 };
/** ≈ the radius of what the light stands around on the bench (cm): sizes the bench, its pool, its shadows. */
export const SIZE = BENCH.size;
export const FAR = 300000;

/** The header: the step of the fibre's journey (ÉTAPE 04 / 12 · La tour de fibrage). 0 = "Hors chaîne".
 *  The voice counts the first five ("Première étape" … "cinquième étape"): the header's numbers match it. */
export const STEPS = ["Le liquide", "La préforme", "Le four", "La tour de fibrage", "L'armure", "Le test", "Le câble", "L'océan", "La rue", "La soudure", "Le partage", "Chez toi"];
/** The chapter that sets each step (its first beat): the chapter files `now` `etape` on their card; CARD.sub reads it. */
export const CHAP_STEP = { etape1: 1, preforme: 2, frittage: 3, tour: 4, armure: 5, test: 6, cable: 7, mer: 8, plage: 9, soudure: 10, partage: 11, chez: 12 };
/** The chapter cards: their small line, and the line under the rule. Never "série" (Merwan, 20/10). */
export const CARD = {
  kicker: () => "Dossier L07 · Le fil de verre",
  sub: (c) => (CHAP_STEP[c.id] ? `Étape ${String(CHAP_STEP[c.id]).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}` : ""),
};

/* ───────────────────────────── the state ───────────────────────────── */

/**
 * THE STATE — the closed list of numbers the chapters move (st / now / cut). Every one is read by exactly one place
 * (or by world.js). No name is a GSAP property (no x, y, scale, rotation, delay, ease, repeat, snap, stagger…).
 */
const REST = {
  /* world.js */
  set: SET.BANC, item: ITEM.CABLE,
  etape: 0, //      the header's step (0 "Hors chaîne", 1 … 12)
  tempOn: 0, temp: 20, // the header's readout as a TEMPERATURE (°C, sourced values only: chapter plans say which)
  lumOn: 0, lum: 100, lumBad: 0, // …or as the LIGHT LEFT (%; < 1 shows "< 1 %"); lumBad 1 paints it signal (the old glass)
  mood: 0, hot: 0, //  the rim light veille 0 → signal 1 (franc: 0 or 1, never held between), the background warmed
  pool: 0.25, grid: 0.16, // the bench's pool and grid (BANC only)
  fx: 0, fy: 30, fz: 0, fs: SIZE, // where the lights stand around (the shadows' box): AT gives a sane one per place

  /* shared by the three sets: THE LIGHT in whatever fibre is on screen */
  pulse: 0, //      0 → 1 the pulses are there (dashes of light running along the core: veille)
  flow: 1, //       their speed, × the one each set finds readable (0 = frozen; never so fast a dash jumps half its period)
  explode: 0, //    the exploded view of the item on screen (CABLE telescopes; SUBSEA opens its layers)
  named: 0, //      the part being named (0 none; CABLE: 1 jacket, 2 yarns, 3 resin, 4 glass, 5 core · SUBSEA: 1 tube, 2 wires, 3 copper, 4 jacket)

  /* fibre.js — the bench */
  core: 0, //       the core lit (veille) inside the glass: 0 dark, 1 the light carried by it
  ray: 0, //        PRINCIPE: how far the ray has travelled (0 → 1 the whole length), ricocheting
  steep: 0, //      PRINCIPE: 0 the ray at the grazing angle (caught), 1 at the steep angle (it crosses and is lost)
  bend: 0, //       PRINCIPE / FIBRE: 0 straight → 1 the tight bend (du2)
  leak: 0, //       the light that LEAVES the core in the bend (signal), 0 → 1
  dim: 0, //        HIST: the light dying along the 1960s rod (0 no light sent → 1 the light sent and fading by halves)
  clear: 0, //      HIST: 0 the 1960s glass → 1 today's (the same rod lets the light through)
  impure: 0, //     HIST: the impurities seen in the glass (signal motes: iron, copper, water), 0 → 1
  doc: 0, //        DOCS: 0 none, 1 Kao & Hockham 1966, 2 Corning August 1970 (one page in the light)
  docIn: 0, //      DOCS: the page comes in (0 → 1)
  layers: 0, //     SUBSEA: the layers built from the centre out (0 the fibres alone → 4 the thick plastic)
  assemble: 0, //   MULTI: 0 loose marked fibres → 1 in their tubes → 2 strength member → 3 the jacket: "Voilà un câble"
  cleave: 0, //     SPLICE: 0 the bare end → 1 tensioned → 2 scored → 3 broken clean
  skew: 0, //       SPLICE: the cleave's tilt (0 straight; 1 "à peine de travers": the splicer refuses)
  align: 0, //      SPLICE: the two cores brought face to face (0 off by a few core widths → 1 aligned)
  arc: 0, //        SPLICE: the arc between the electrodes (0 → 1 at its brightest; a short flash)
  fused: 0, //      SPLICE: 0 two ends → 1 one fibre
  sleeve: 0, //     SPLICE: 0 parked → 1 over the joint → 2 shrunk
  split: 0, //      COUPLER: the light that comes in (0) spread to the 32 outputs (1)
  upstream: 0, //   COUPLER: the light going UP (ink — another infrared), 0 → 1
  turns: 0, //      COUPLER: the homes speaking in turn (0 off; > 0 one output at a time lights, walking round)
  plug: 0, //       PLUG: the green connector 0 away → 1 home in the socket
  bevel: 0, //      PLUG: the ferrule's end in cut-away (0 → 1): the 8° face, the reflection that goes off to the side
  ont: 0, //        PLUG: the optical box reads the flashes (0 → 1)

  /* fabrique.js — the factory */
  boil: 0, //       STILL: the liquid boils (0 → 1); the metals stay at the bottom (signal dregs)
  vapour: 0, //     STILL: the vapour rises and runs to the burner
  flame: 0, //      the burner's flame (lathe)
  soot: 0, //       the white glass smoke out of the flame
  spin: 0, //       LATHE: the rod's turn (speed; 0 still)
  deposit: 0, //    LATHE: the soot body built (0 the bare rod → 1 its full size); below LATHE.coreBody: the core layers
  doped: 0, //      LATHE: the core layers shown (veille tint) against the cladding's
  dust: 0, //       LATHE: a dust caught between two layers (signal)
  sinter: 0, //     SINTER: 0 the white porous body → 1 clear and shrunk
  sink: 0, //       SINTER: the body lowered into the furnace (0 above → 1 in)
  chlorine: 0, //   SINTER: the chlorine running through the pores (ink streaks)
  water: 0, //      SINTER: the water left in the pores (signal motes)
  bubble: 0, //     SINTER: a bubble left in the glass (signal)
  section: 0, //    the preform cut away at its end: the core and the cladding seen in it ("la fibre existe déjà… en énorme")
  draw: 0, //       TOWER: 0 cold → 1 drawing (the fibre runs from the drop to the spool)
  drop: 0, //       TOWER: the drop forming, stretching, falling (0 → 1) — it pulls the first fibre down
  heat: 0, //       TOWER: the furnace's glow (signal, 0 → 1)
  feed: 0, //       TOWER: how far the preform has gone down into the furnace (0 → 1)
  gauge: 0, //      TOWER: the laser gauge on (veille beam across the fibre)
  diam: 0, //       TOWER: the diameter's drift (−1 too thin … 0 on target … +1 too thick; |diam| > 0.5 reads signal)
  coat: 0, //       TOWER / PROOF: the coatings on (0 bare glass → 1 the soft → 2 the hard)
  uv: 0, //         TOWER: the UV lamps on
  wind: 0, //       TOWER / PROOF: the spool turning (speed)
  tension: 0, //    PROOF: the load on the fibre between the wheels (0 → 1)
  flaw: 0, //       PROOF: the hidden microcrack shown (signal glint)
  claque: 0, //     PROOF: the fibre breaks at the flaw (0 → 1: the two ends spring apart)
  echo: 0, //       PROOF: the echo — a pulse sent along the spooled fibre and coming back (0 → 1 → 2)

  /* voyage.js — MER */
  ship: 0, //       the cable ship there (0 → 1)
  sail: 0, //       its way along SHIP.path (0 → 1)
  pay: 0, //        the cable paid out behind it, down to the bottom (0 → 1)
  plough: 0, //     the plough on the bottom, ploughing (0 → 1) — the trench closes behind it
  amp: 0, //        the repeater relaunching the light (veille, 0 → 1)
  anchor: 0, //     an anchor dragging toward the cable (signal, 0 → 1: it hooks it)
  fault: 0, //      the cable broken by it (signal; the light stops there)
  grapnel: 0, //    the grapnel dragged on the bottom (0 → 1 it hooks the cable → 2 hauled up to the ship)
  mend: 0, //       the new length spliced in (0 → 1)
  loop: 0, //       the repaired cable laid back in a wide loop, flat on the bottom (0 → 1)

  /* voyage.js — TERRE */
  beach: 0, //      the duct under the beach cut away (0 → 1): the cable comes up out of the sea inside it
  ducts: 0, //      the street's ground cut away: the old copper telephone ducts (0 → 1)
  blow: 0, //       the cable blown along a duct (0 → 1: its head's way from the pit)
  crushed: 0, //    the crushed duct (signal) — the cable's head stops against it
  homes: 0, //      the 32 homes along the street lit by their share (0 → 1)
  talk: 0, //       the homes answer in turn (0 off; > 0 one at a time, walking round)
  landing: 0, //    your building cut away: the box on the landing, the last fine cable up to your flat (0 → 1)
  room: 0, //       your room: the wall, the socket, the box behind the furniture (0 → 1)
  pinch: 0, //      the cable behind your box bent / under the furniture's foot (0 easy curve → 1 a fold)
};

/** Complete states, one per place. AT does NOT say the header (etape, temp…, lum…): the chapter does, on every cut. */
export const AT = {
  banc: (item, more = {}) => ({ ...REST, set: SET.BANC, item, pool: 0.3, grid: 0.16, fx: 0, fy: 30, fz: 0, fs: SIZE * 2, ...more }),
  usine: { ...REST, set: SET.USINE, mood: 0, hot: 0, fx: TOWER.x, fy: 900, fz: 0, fs: 2200 },
  mer: { ...REST, set: SET.MER, ship: 1, pay: 0, amp: 1, pulse: 1, fx: SEA.repeater, fy: -1500, fz: 0, fs: 6000 },
  terre: { ...REST, set: SET.TERRE, pulse: 1, fx: LAND.cabinet[0], fy: 0, fz: 0, fs: 4000 },
};
/** THE FIRST FRAME's state — PROVISIONAL (= the state of candidate hook1, behind your box): the orchestrator pastes the
 *  state of the candidate chosen on the board of six (docs/L07-actes.md · « Les candidates »). The loop cuts back to it. */
export const FIRST = { ...AT.terre, room: 1, landing: 0, homes: 0, pulse: 1, flow: 1, pinch: 0.25, fx: LAND.room[0], fy: LAND.room[1] + 30, fz: LAND.room[2], fs: 300 };

/* ───────────────────────────── the poses ───────────────────────────── */

/** The studio for a long seen on a big screen (docs/recette-long-image.md). ONE line switches it off: { dof: 0, air: 0, finish: 0 }.
 *  dof 5 on close and medium shots only (...CLOSE), never above 6; never on a wide shot, an exploded view, a document,
 *  the first frame, under a chapter card (...SHARP). air 0, finish 0. Every pose says its lens. */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
export const CLOSE = { dof: LOOK.dof };
export const SHARP = { dof: 0 };
const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };

const FE = FIBER.at[0] + FIBER.len / 2; //  the fibre's cut end (x)
const RM = LAND.room;

/** The poses that frame each place (complete). POSED ON STAND-INS: the sets' journals give better ones — the chief of
 *  production pastes them here before the chapters. */
export const VIEW = {
  /* the six candidates of the first frame (docs/L07-actes.md · "Les candidates") */
  hook1: { ...P, tx: RM[0], ty: RM[1] + 28, tz: RM[2] + 42, d: 56, az: 122, el: -12, fov: 46, side: 120, ...SHARP },
  hook2: { ...P, tx: SEA.repeater + 900, ty: SEA.deep + 60, tz: 0, d: 900, az: -84, el: 4, fov: 46, side: 120, ...SHARP }, // on the ocean floor: the cable to the vanishing point, the ship far above
  hook3: { ...P, tx: TOWER.x, ty: 1370, tz: 0, d: 260, az: -30, el: -24, fov: 50, ...SHARP },
  hook4: { ...P, tx: FE - 40, ty: FIBER.at[1], tz: 0, d: 150, az: 74, el: 6, fov: 40, side: 200, ...SHARP }, // along the fibre, the pulses coming at the lens
  hook5: { ...P, tx: PROOF.x, ty: PROOF.y, tz: 0, d: 300, az: -12, el: 8, fov: 40, ...SHARP },
  hook6: { ...P, tx: PRINCIPE.at[0] - 120, ty: PRINCIPE.at[1], tz: 0, d: 260, az: -70, el: 3, fov: 44, ...SHARP }, // inside the core, the ray ricocheting toward the lens

  /* BANC */
  cableWide: { ...P, tx: 20, ty: CABLE.at[1], tz: 0, d: 430, az: -34, el: 14, ...SHARP },
  exploded: { ...P, tx: 85, ty: CABLE.at[1], tz: 0, d: 640, az: -26, el: 15, ...SHARP },
  glassEnd: { ...P, tx: FE, ty: FIBER.at[1], tz: 0, d: 70, az: 62, el: 10, ...CLOSE },
  coreEnd: { ...P, tx: FE, ty: FIBER.at[1], tz: 0, d: 26, az: 84, el: 4, ...CLOSE },
  fibreLong: { ...P, tx: 0, ty: FIBER.at[1], tz: 0, d: 380, az: -30, el: 10, ...CLOSE },
  principe: { ...P, tx: 0, ty: PRINCIPE.at[1], tz: 0, d: 560, az: -18, el: 8, ...SHARP },
  ricochet: { ...P, tx: -120, ty: PRINCIPE.at[1], tz: 0, d: 240, az: -10, el: 5, ...CLOSE },
  bendWide: { ...P, tx: 40, ty: PRINCIPE.at[1] + 110, tz: 0, d: 820, az: -6, el: 6, ...SHARP },
  hist: { ...P, tx: 380, ty: HIST.at[1], tz: 0, d: 820, az: -32, el: 12, ...SHARP },
  histFar: { ...P, tx: 1100, ty: HIST.at[1], tz: 0, d: 1900, az: -22, el: 10, ...SHARP },
  docs: { ...P, tx: 0, ty: 0, tz: 4, d: 125, az: -8, el: 70, ...SHARP },
  subsea: { ...P, tx: 20, ty: SUBSEA.at[1], tz: 0, d: 420, az: -42, el: 14, ...SHARP },
  subseaEnd: { ...P, tx: SUBSEA.len / 2, ty: SUBSEA.at[1], tz: 0, d: 200, az: 70, el: 10, ...CLOSE },
  multi: { ...P, tx: -20, ty: MULTI.at[1], tz: 0, d: 440, az: -34, el: 14, ...SHARP },
  splice: { ...P, tx: 0, ty: SPLICE.at[1] + 15, tz: -10, d: 250, az: -26, el: 24, ...CLOSE },
  spliceTight: { ...P, tx: 0, ty: SPLICE.at[1], tz: 0, d: 46, az: -20, el: 12, ...CLOSE },
  cleaver: { ...P, tx: SPLICE.cleaver[0], ty: SPLICE.at[1], tz: SPLICE.cleaver[2], d: 120, az: -30, el: 22, ...CLOSE },
  coupler: { ...P, tx: 0, ty: COUPLER.at[1], tz: 0, d: 230, az: -28, el: 32, ...SHARP },
  plug: { ...P, tx: 60, ty: PLUG.at[1] + 20, tz: 160, d: 640, az: -38, el: 12, ...SHARP },
  bevel: { ...P, tx: 0, ty: PLUG.at[1], tz: 30, d: 110, az: -86, el: 4, ...CLOSE },

  /* USINE */
  still: { ...P, tx: STILL.x + 120, ty: 230, tz: 0, d: 800, az: -28, el: 14, ...SHARP },
  lathe: { ...P, tx: LATHE.x, ty: LATHE.y, tz: 0, d: 520, az: -30, el: 14, ...CLOSE },
  sinter: { ...P, tx: SINTER.x, ty: 300, tz: 0, d: 760, az: -34, el: 8, ...SHARP },
  preformEnd: { ...P, tx: SINTER.x, ty: SINTER.top - SINTER.len / 2 + 5, tz: 0, d: 130, az: -30, el: -38, ...CLOSE },
  towerWide: { ...P, tx: TOWER.x + 60, ty: 950, tz: 0, d: 4300, az: -30, el: 6, ...SHARP },
  towerTop: { ...P, tx: TOWER.x, ty: 1560, tz: 0, d: 760, az: -34, el: 4, ...SHARP },
  drop: { ...P, tx: TOWER.x, ty: 1380, tz: 0, d: 260, az: -30, el: -6, ...CLOSE },
  gauge: { ...P, tx: TOWER.x, ty: TOWER.gauge, tz: 0, d: 260, az: -18, el: 12, ...CLOSE },
  coatCups: { ...P, tx: TOWER.x, ty: (TOWER.cup1 + TOWER.cup2) / 2, tz: 0, d: 420, az: -36, el: 4, ...CLOSE },
  uvLamps: { ...P, tx: TOWER.x, ty: (TOWER.uv[0] + TOWER.uv[1]) / 2, tz: 0, d: 640, az: -30, el: 4, ...SHARP },
  capstan: { ...P, tx: TOWER.x + 120, ty: TOWER.capstan + 40, tz: 0, d: 560, az: -30, el: 14, ...SHARP },
  proof: { ...P, tx: PROOF.x, ty: PROOF.y, tz: 0, d: 760, az: -24, el: 18, ...SHARP },
  proofBreak: { ...P, tx: PROOF.x + PROOF.breakAt, ty: PROOF.y, tz: 0, d: 120, az: -30, el: 8, ...CLOSE },

  /* MER */
  seaWide: { ...P, tx: -14600, ty: -1500, tz: 0, d: 7400, az: -38, el: 7, ...SHARP },
  shipStern: { ...P, tx: -12100, ty: -40, tz: 0, d: 2300, az: -35, el: 16, ...SHARP },
  plough: { ...P, tx: SEA.plough[0] + 3450, ty: SEA.shelf + 60, tz: 0, d: 1200, az: -40, el: 14, ...SHARP },
  repeater: { ...P, tx: SEA.repeater, ty: SEA.deep + 50, tz: 0, d: 520, az: -40, el: 12, ...CLOSE },
  anchor: { ...P, tx: SEA.anchor, ty: SEA.shelf + 60, tz: -200, d: 1500, az: -30, el: 34, ...SHARP },
  grapnel: { ...P, tx: SEA.repair + 400, ty: -1500, tz: 0, d: 7600, az: -50, el: 6, ...SHARP },
  loopTop: { ...P, tx: SEA.repair, ty: SEA.deep, tz: SEA.loop / 2, d: 1700, az: -20, el: 58, ...SHARP },

  /* TERRE */
  beach: { ...P, tx: 700, ty: -180, tz: 0, d: 3000, az: -18, el: 10, ...SHARP },
  street: { ...P, tx: 4600, ty: -60, tz: 0, d: 2600, az: -30, el: 18, ...SHARP },
  pit: { ...P, tx: LAND.pit, ty: -60, tz: 0, d: 800, az: -30, el: 16, ...SHARP },
  cabinet: { ...P, tx: LAND.cabinet[0], ty: 90, tz: LAND.cabinet[2], d: 600, az: -24, el: 12, ...CLOSE },
  homes: { ...P, tx: 7800, ty: 150, tz: 0, d: 4000, az: -20, el: 22, ...SHARP },
  landing: { ...P, tx: 7700, ty: 430, tz: -800, d: 800, az: -34, el: 8, ...CLOSE },
  room: { ...P, tx: RM[0] - 30, ty: RM[1] + 18, tz: RM[2] + 60, d: 230, az: -62, el: 16, ...CLOSE },
  fibreBend: { ...P, tx: 20, ty: FIBER.at[1] + 18, tz: 0, d: 380, az: -20, el: 8, ...SHARP },
  latheCut: { ...P, tx: LATHE.x + 20, ty: LATHE.y, tz: 0, d: 300, az: -30, el: 18, ...CLOSE },
  proportions: { ...P, tx: TOWER.x, ty: 1440, tz: 0, d: 300, az: -30, el: 2, ...CLOSE },
  echo: { ...P, tx: PROOF.x + PROOF.takeup[0], ty: PROOF.y - 33, tz: 0, d: 240, az: -70, el: 22, ...CLOSE },
  thumbDrop: { ...P, tx: TOWER.x, ty: 1392, tz: 0, d: 140, az: -28, el: -10, fov: 34, ...SHARP },
  crushed: { ...P, tx: LAND.crushed - 100, ty: LAND.duct + 14, tz: 0, d: 500, az: -30, el: 12, ...CLOSE },
};
export const POSE0 = { ...VIEW.hook1, drift: 0.3 }; // PROVISIONAL (= hook1): the orchestrator picks on the board of six and pastes it here

/**
 * The seams between two chapter files. Each one is a cut UNDER a chapter card (a match on a shape or a movement:
 * docs/L07-actes.md says which) or a move that simply goes on (same place). Both files call `seam(D, name, "out" | "in", …)`
 * with the same arguments; the file that starts gives the COMPLETE state on the cut. POSED ON STAND-INS.
 */
export const HAND = {
  // c1 → c2, under the card "Étape 01 · Le liquide" (midroll after relance1): the camera glides along the 1960s rod
  // toward its dark end; the cut lands on the still's liquid, the same glide, the surface where the rod was
  c12: {
    at: "etape1-0.9",
    from: [{ ...VIEW.hist, tx: 900, d: 900 }, { ...VIEW.hist, tx: 1300, d: 820 }],
    to: { ...VIEW.still, az: -32 },
    opt: { before: 1.6, after: 1.4, fade: 0.25, kind: "dip" },
  },
  // c2 → c3, under the card "Étape 04 · La tour de fibrage" (midroll after seuil): the camera rises along the clear
  // preform and does not stop — the same rise lands at the top of the tower, the preform hanging in its feed
  c23: {
    at: "tour-0.9",
    from: [{ ...VIEW.sinter, ty: 360, d: 900 }, { ...VIEW.sinter, ty: 620, d: 1000, el: 4 }],
    to: { ...VIEW.towerTop, ty: TOWER.furnace[0] - 80, d: 900 },
    opt: { before: 1.6, after: 1.6, fade: 0.25, kind: "dip" },
  },
  // c3 → c4, under the card "Étape 07 · Le câble": the fibre running onto the take-up spool (+x) → the marked fibres
  // running into their tubes on the bench, the same direction, the same speed
  c34: {
    at: "cable-0.9",
    from: [{ ...VIEW.proof, tx: PROOF.x + 120 }, { ...VIEW.proof, tx: PROOF.x + 260, d: 640 }],
    to: { ...VIEW.multi, tx: -60 },
    opt: { before: 1.2, after: 1.4, fade: 0.2 },
  },
  // c4 → c5, under the card "Étape 10 · La soudure": the two fibre ends in the joint box of the pit → the same two
  // ends on the splicer, the same place in the picture (a match on the shape)
  c45: {
    at: "soudure-0.9",
    from: [{ ...VIEW.pit, d: 600 }, { ...VIEW.pit, d: 420 }],
    to: { ...VIEW.splice, d: 260 },
    opt: { before: 1.4, after: 1.4, fade: 0.2 },
  },
  // c5 → c6, under the card "Étape 12 · Chez toi": over the street's homes, the camera keeps sinking toward your
  // building — same place, the move goes on
  c56: {
    at: "chez-0.9",
    from: [{ ...VIEW.homes, d: 4000 }, { ...VIEW.homes, tx: LAND.building[0], tz: LAND.building[2], d: 2600, el: 20 }],
    to: { ...VIEW.homes, tx: LAND.building[0], tz: LAND.building[2], d: 2600, el: 20 },
    opt: { before: 1.6, after: 1.6 },
  },
};

/* ───────────────────────────── the world ───────────────────────────── */

export function buildWorld(stage) {
  const { scene } = stage;
  stage.grade.gel.set(BRAND.signal);

  /* the four places: one group each, one shown at a time */
  const places = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];
  for (const g of places) scene.add(g);

  const bench = makeBench(SIZE);
  places[SET.BANC].add(bench.group);
  const fibre = buildFibre();
  places[SET.BANC].add(fibre.group);
  const fabrique = buildFabrique();
  places[SET.USINE].add(fabrique.group);
  const voyage = buildVoyage();
  places[SET.MER].add(voyage.mer.group);
  places[SET.TERRE].add(voyage.terre.group);

  const sets = [fibre, fabrique, voyage.mer, voyage.terre];

  return {
    places, bench, fibre, fabrique, voyage,
    /** Every frame (and sixteen times per frame: it depends on S and `time` only — no allocation here). */
    apply(S, time) {
      const px = stage.pixelScale();
      const set = Math.round(S.set);
      for (let i = 0; i < places.length; i++) places[i].visible = i === set;
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      setMood(stage, S.mood, S.hot);
      sets[set].update(S, time, px);
      const d = stage.cam.d;
      if (set === SET.BANC) {
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
        scene.fog.density = bench.fog(Math.max(d, 400));
      } else {
        const s = sets[set];
        scene.fog.density = s.fog ? s.fog(d) : 0.03 / Math.max(4000, d);
      }
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
/** When a chapter's card comes in, inside a file: its first beat's first word − CARD_LEAD (`cardAt(D, "plage")`). */
export const cardAt = (D, beat) => D.at(beat) - CARD_LEAD;
/** A cut lands ON a frame (30 fps): a `mix` fade that starts between two frames keeps an older frame — the picture jumps back. */
export const onFrame = (t) => Math.round(t * 30) / 30;
/**
 * Lays a file's half of a seam: `seam(D, "c12", "out")` at the end of c1; at the start of c2,
 * `seam(D, "c12", "in", { set: SET.USINE, state: { ...AT.usine, etape: 1, … } })` — the file that starts gives the
 * COMPLETE state on the cut (it depends on no other file). Returns the pose the camera reaches after the seam.
 */
export const seam = (D, name, only, extra = {}) => {
  const h = HAND[name];
  return D.match(onFrame(D.at(h.at)), h.from, h.to, { ...h.opt, ...extra, only });
};
