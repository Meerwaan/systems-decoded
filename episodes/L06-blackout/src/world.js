// DOSSIER L06 — Blackout (format long, affaire réelle, 16:9) : the world. This file is the CONTRACT between the sets
// and the chapters:
//   · plan.js   where everything stands, the day's times (DAY), the frequency's values (FREQ) — no import there
//   · SET       the four places, one shown at a time: CARTE (the maquette of Europe — the centrepiece), TERRAIN (the
//               Ems, the 380 kV line and the plain at true scale), QUARTIER (your street in France at true scale),
//               BENCH (the solid systems, one `spot` at a time)
//   · FIRST     the state of the first frame — THE CLOSED LIST of numbers the chapters may move
//   · CLOCK     the header's clock tied to the words that say a time (main.js reads it)
//   · POSE0     the camera of the first frame (the film loops: also the last one); VIEW: poses that frame each place
//   · AT        complete states, one per place: a chapter that cuts writes { ...AT.carte, …what differs }
//   · HAND      the seams between two chapter files; span / seam / cardAt / onFrame
//   · apply     what each number does to the world, every frame (depends on S and time only)
//
// THE SETS (one file each, built at the same time against plan.js):
//   europe.js    the maquette of continental Europe on a table in the dark: three SOLID dark plates with engraved
//                borders, the 380 kV grid floating over them as lines of light, the plants, the postes, the homes;
//                it opens in four layers (« on l'ouvre »), and at 22:10:28 it BREAKS IN THREE along the split
//   terrain.js   the two places at true scale, like X-rays, at night: buildEms (the river, the double line on its two
//                84 m towers, the corridor, Meyer Werft's hall and the ship of glass, the wind farm) and
//                buildQuartier (your street, your room, the lift, the poste source, the feeders, the hospital)
//   model.js     the SOLID systems: three turbo-alternators and their strobe marks, the frequency dial, the line
//                Landesbergen–Wehrendorf with its two relays, THE HERO (the frequency relay and its four steps of
//                HTA cells), the coupling device, the report
//   pieces.js    the PIÈCES DU DOSSIER (2D, in the page): the real documents with their number and their source
//
// THREE COLOURS, and what they mean in THIS film: signal is THE THREAT — a line over its limit, the cascade, the
// crack, a frequency out of its band, what disconnects when it should hold. veille is WHAT HOLDS THE GRID — the
// alternators in step, the reserves, the relay that watches, and above all THE CUT IT DECIDES (the load shed at
// 49 Hz is veille: it is the system working), the recoupling. ink is the structure: the plates, a line carrying its
// normal load, a home with its lights on.
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { PLACE, EMS, HALL, QUARTIER, BENCH, ROTOR, DIAL, DIAL_AT, LW, HERO, hms } from "./plan.js";
import { buildEurope } from "./europe.js";
import { buildEms, buildQuartier } from "./terrain.js";
import { buildModel } from "./model.js";

export const SET = { CARTE: 0, TERRAIN: 1, QUARTIER: 2, BENCH: 3 };
export const SPOT = { ALT: 0, LW: 1, HERO: 2, REPORT: 3 };
export const SIZE = 300; // ≈ the radius of what the light stands around (cm); world.apply sets it per place (`fs`)
export const FAR = 1200000; // 12 km: the corridor and the wind farm on the plain

/* ───────────────────────────── the header (main.js) ───────────────────────────── */
/** `era` (integer, `now` only): the left of the header — the date, and where we are. */
export const ERAS = [
  { date: "4 nov. 2006", where: "Réseau européen" }, //      0 the night
  { date: "Automne 2006", where: "Papenburg · l'Ems" }, //   1 the request (18/09 → 3/11): the clock hidden
  { date: "2003", where: "Italie" }, //                      2 « trois ans plus tôt »
  { date: "Janv. 2007", where: "Rapport UCTE" }, //          3 the inquiry
  { date: "Depuis 2006", where: "Ce qui a changé" }, //      4
  { date: "28 avril 2025", where: "Espagne · Portugal" }, // 5
];
/**
 * THE CLOCK — [cue, "hh:mm:ss"]: at each word that says a time, the header says it too; linear in between (two
 * anchors close together make a jump, the same time twice a hold: where the story's time flows — the 31 minutes,
 * the cascade, the 11 seconds of the fall — the clock RUNS). Hidden whenever `clockOn` is 0 (the chapters decide):
 * no time is shown that the voice has not said or is not about to say. Every time comes from the UCTE report.
 */
export const CLOCK = [
  [0, "22:10:13"], //                the hook: the line trips (held)
  ["promesse", "22:10:13"],
  ["coupee3", "22:10:28"], //        « Quinze secondes plus tard, l'Europe est coupée en trois »
  ["paquebot-0.05", "22:10:28"], //  held through « exprès » and the challenge
  ["paquebot", "21:38:00"], //       « Une demi-heure plus tôt, on avait coupé une ligne » (hidden from `curiosite` on)
  ["dixneuf-0.05", "21:38:00"],
  ["dixneuf", "19:00:00"], //        « À 19 h. Trois heures avant. » (shown for this sentence only)
  ["calcul-0.05", "19:00:00"],
  ["calcul", "21:29:00"], //         « 21 h 29. Dernier calcul »
  ["premier-0.05", "21:29:00"],
  ["premier", "21:38:00"], //        « 21 h 38 : premier circuit coupé »
  ["second", "21:39:00"], //         « 21 h 39 : le second »
  ["h2140-0.05", "21:39:00"],
  ["h2140", "21:40:00"], //          « Dès 21 h 40 »
  ["sursis-0.05", "21:40:00"],
  ["sursis", "21:41:00"], //         « 21 h 41. RWE prévient E.ON » — from here the 31 minutes RUN
  ["appels", "21:46:00"], //         three calls: 21:46, 21:50, 21:52
  ["appels$", "21:52:00"],
  ["cent", "22:05:00"], //           « Vers 22 h 05 » (the clock runs through « Chez toi, personne ne sait rien »)
  ["urgent", "22:08:00"], //         « 22 h 08. RWE rappelle. »
  ["seuil$", "22:10:00"],
  ["manoeuvre", "22:10:11"], //      « 22 h 10 min 11 s »
  ["monte", "22:10:11"],
  ["trip", "22:10:13"], //           « 22:10:13. À Wehrendorf… »
  ["bielefeld-0.05", "22:10:13"],
  ["bielefeld", "22:10:15"], //      « 22:10:15. Bielefeld. » — the cascade runs south
  ["main", "22:10:27"], //           « 22:10:27. Au sud du Main… »
  ["dechire", "22:10:28"], //        « 22:10:28 et sept dixièmes »
  ["maroc-0.05", "22:10:28"],
  ["maroc", "22:10:32"],
  ["delestage-0.05", "22:10:32"],
  ["delestage", "22:10:28"], //      back to the split: the West's eleven seconds, in slow motion (1 s every ≈ 7 s)
  ["tient", "22:10:39"], //          « 22:10:39. L'aiguille s'arrête. »
  ["nordest-0.05", "22:10:39"],
  ["nordest", "22:10:28"], //        the North-East, from the split
  ["pologne", "22:13:00"], //        « 22 h 13. La fréquence remonte. »
  ["recolle", "22:13:00"],
  ["pouls", "22:24:00"], //          « 22 h 24. Cinquante hertz. »
  ["moities", "22:30:00"], //        « à 22 h 30 »
  ["dixMin", "22:40:00"], //         « puis dix minutes plus tard »
  ["recouple", "22:47:00"], //       « 22 h 47 »
  ["sudest", "22:49:00"], //         « 22 h 49. Le Sud-Est revient. »
  ["rallume2$", "23:10:00"], //      « vers 23 h 10 » (hidden from `bilan` on)
  ["toloop-0.04", "23:10:00"],
  ["toloop", "22:10:13"],
];
/** The clock as a function of the film's time, once D exists (main.js). Seconds after midnight. */
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
const p2 = (n) => String(n).padStart(2, "0");
/** "22:10:13" from seconds after midnight. */
export const fmtClock = (t) => {
  const s = Math.max(0, Math.floor(t + 1e-6));
  return `${p2(Math.floor(s / 3600))}:${p2(Math.floor(s / 60) % 60)}:${p2(s % 60)}`;
};
/** "49,0 Hz": ONE decimal (the report's curves give no more). */
export const fmtHz = (hz) => `${hz.toFixed(1).replace(".", ",")} Hz`;
/** The second counter's label, by `zone`. */
export const ZONES = ["Fréquence · Ouest", "Fréquence · Nord-Est"];

/** The chapter cards: their small line, and the line under the rule. Never "série". */
export const CARD = { kicker: () => "Dossier L06 · 4 novembre 2006", sub: () => "" };
/** Beats whose marked words stay off the picture (a chapter shows them better). */
export const KEYWORDS_SKIP = ["chute", "trois", "tendue"];

/* ───────────────────────────── the studio ───────────────────────────── */
/** docs/recette-long-image.md: `dof` 5 on close and medium shots only (`...CLOSE`), never on a wide shot, a map, an
 *  exploded view, a document, the first frame or under a card (`...SHARP`). Every pose says its lens. */
export const LOOK = { dof: 5, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
export const CLOSE = { dof: LOOK.dof };
export const SHARP = { dof: 0 };
const P = { fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3 };

/* ───────────────────────────── the first frame ───────────────────────────── */
// « 22 h 10. Loin de toi, une ligne saute dans le nord de l'Allemagne. » Under the 380 kV corridor, at a man's
// height in the corridor's axis, 65 m before a tower, looking up and east along the conductors lit signal, the wind farm turning on the horizon; at the far end the
// trip's flash, and the dark that runs back along the wires toward us. The film loops: the last sentence (« Et ce
// relais attend… le soir où, à 22 h 10… ») lands here, and the LAST 15 s leave the right half to YouTube's end
// screen — the subject stands in the LEFT half (`side` > 0).
// SIX CANDIDATES (VIEW.hook1 … hook6, docs/L06-actes.md § La première image): the orchestrator picks one on a board,
// after the sets, before the chapters, and pastes it here (with its state in FIRST). CHOSEN 10/11 on the board of six: hook1.
export const POSE0 = { ...P, tx: EMS.hook[0] + 2522, ty: 2680, tz: 1449, d: 10000, az: -79, el: -14, fov: 46, side: 150, ...SHARP };

/* ───────────────────────────── the state: THE CLOSED LIST ───────────────────────────── */
// `now` = set on an instant (integers, switches); `st` = tweened. No name here is a GSAP property.
export const FIRST = {
  set: SET.TERRAIN,
  spot: 0, //        BENCH only: SPOT.ALT 0 · LW 1 · HERO 2 · REPORT 3 (integer, on a cut)
  /* ── the header (main.js) ── */
  era: 0, //         ERAS (integer, `now` on a card or a cut)
  clockOn: 1, //     1 the clock (CLOCK) in the header, 0 "—". `now`
  hzOn: 1, //        1 the second counter « Fréquence · Ouest 50,0 Hz », 0 hidden. `now`
  zone: 0, //        which frequency the header and the dial's main needle read: 0 the West (hzW) · 1 the North-East (hzE). `now`
  /* ── the three frequencies (header, dial, the maquette's pulse) — values: plan.js · FREQ, nothing else ── */
  hzW: 50, //        the West: 50 → 49.0 between the split and 22:10:39 (never below 49.0), back to 50 at 22:24
  hzE: 50, //        the North-East: 50 → 51.4 → 50.3
  hzS: 50, //        the South-East: 50 → 49.7 (a needle only: the voice gives no value, the header never shows it)
  // THE MARKS: every alternator's mark (model.js · rotors) and every plant's on the maquette (europe.js) turns by
  // itself at the common rhythm (plan.js · ROTOR.spin × time: « tous tournent… au même rythme »). These three numbers
  // are each area's OFFSET from that rhythm, in degrees: an area that slows falls behind (its number goes down while
  // it is under 50 Hz), one that races runs ahead (up). Equal numbers = in step. The chapters tween them ("none" or
  // "sine.in") for as long as an area is off 50; the sets never multiply time by a frequency.
  turnW: 0,
  turnE: 0,
  turnS: 0,
  /* ── CARTE: the maquette (europe.js) ── */
  land: 1, //        the plates and their engraved borders (0 → 1)
  explode: 0, //     « Alors… on l'ouvre » : the four layers lift apart (0 → 1), homes · postes · lines · plants
  named: 0, //       the layer the voice names: 0 none · 1 les centrales · 2 les lignes · 3 les postes · 4 les prises (integer)
  net: 1, //         the 380 kV grid, lines of light (0 → 1)
  flow: 1, //        the power running along the lines, east → west that night (dashes; 0 none → 1)
  plants: 1, //      the power plants: small solid rotors that turn together (0 → 1)
  subs: 0.5, //      the postes (0 → 1)
  homes: 1, //       the consumption: the lit dust of homes and towns on the plates (0 → 1)
  pays: 0, //        « 23 pays branchés ensemble » : the borders light up one after the other (0 → 23)
  zones: 0, //       the control areas tinted apart (Germany's four, the Netherlands) : « pas de chef » (0 → 1)
  zoneLit: 0, //     the area the voice names: 0 none · 1 E.ON Netz · 2 RWE · 3 TenneT · 4 every area (integer)
  scan: 0, //        a security computation sweeping INSIDE the lit area(s), stopping at their borders (0 → 1)
  scanAll: 0, //     the same sweep CROSSING the borders — what the report asks for, « depuis » (0 → 1)
  pulse: 0, //       the 50 Hz pulse shown on the cities: rings beating together (Lisbonne, Paris, Varsovie) (0 → 1)
  region: 0, //      north-west Germany's detail: the story's lines and nodes drawn thick (0 → 1)
  emsCut: 0, //      Conneforde–Diele, the double line over the Ems — ALSO the TERRAIN's two circuits: 0 both live ·
  //                 0 → 1 the first circuit's light dies along the span · 1 → 2 the second · 2 the line is dead
  works: 0, //       the lines already out for the week-end's works, drawn dark and dashed (0 → 1)
  load: 0, //        what the dead line carried pours onto its neighbours: they thicken, toward signal (0 → 1)
  alarm: 0, //       the high-load alarms on two of them (Elsen–Twistetal, Elsen–Bechterdissen), signal (0 → 1)
  n1ok: 0, //        the N-1 rule when it HOLDS, in the region's mesh: one line goes dark (a dashed ghost), what it
  //                 carried passes onto its neighbours, which thicken but stay ink inside their outline (their room) (0 → 1)
  n1sim: 0, //       the investigators' computation, a GHOST: one more line drops (dashed), the next ones go signal (0 → 1)
  lw: 0, //          Landesbergen–Wehrendorf on the map: 0 ink · 1 lit signal (over its limit) · 2 tripped, dark
  phone: 0, //       the calls between the two dispatch points: a pulse of ink per call (0 → 3)
  volt: 1, //        the voltage in the region: 1 → 0.5 the lines' light sinks (« la tension s'effondre ») — also the bench line
  cascade: 0, //     the cascade's front running south from Wehrendorf: 0.15 Bielefeld · 0.25 Elsen · 0.32 Bechterdissen ·
  //                 0.85 the lines south of the Main · 1 Bavaria and Austria. Lines trip (signal flash, then dark) as it passes
  crack: 0, //       the split: signal light pouring up through the plates' joint, from the North Sea to the Adriatic (0 → 1)
  apartE: 0, //      the North-East plate drifts away from the West (0 → 1: plan.js · MAP.drift) ; back to 0 at 22:47
  apartS: 0, //      the South-East plate drifts away (0 → 1) ; back to 0 at 22:49
  weld: 0, //        the joint glows veille as two plates come back together, then fades (0 → 1 → 0)
  lost: 0, //        the West after the split: the lines that brought power from the East end in signal stumps (0 → 1)
  reserve: 0, //     the first reserve answers in the West's plants: a veille ring on each rotor (0 → 1)
  pumps: 1, //       the pumped-storage plants in the Alps: 1 pumping (they are a load) → 0 stopped
  smallOut: 0, //    under 49.5 Hz, a multitude of small wind and CHP units go out across the West (0 → 1)
  whatif: 0, //      « Ce serait le noir » : the West plate, lines and homes, sinks to black (0 → 1) — a CONDITIONAL: never held more than the sentence
  relays: 0, //      the relays of the postes sources across the West: a dust of veille points, watching (0 → 1)
  shed: 0, //        THE LOAD SHED — on the CARTE: patches of homes go dark across the West, unevenly (never a whole
  //                 town; Portugal the most) · in the QUARTIER: feeder 1's windows go dark, street after street (0 → 1)
  relit: 0, //       France switched back on in two halves: 0 → 0.5 (22:30) → 1 (22:40) — CARTE and QUARTIER
  hydro: 0, //       the dams start in the West: veille (0 → 1)
  surplus: 0, //     the North-East: the power that left for the West piles up at the crack, signal (0 → 1)
  windOut: 0, //     north Germany's and Austria's wind farms trip — here it HELPS: veille (0 → 1)
  windBack: 0, //    they reconnect by themselves, signal (0 → 1)
  poland: 0, //      a line in Poland (Mikulowa–Czarna) over its limit, signal (0 → 1)
  crack2: 0, //      the second split the report feared, DASHED signal across the North-East (0 → 1) — a risk, never a crack
  maroc: 1, //       the Spain–Morocco link across the strait: 1 → 0 it trips
  italy: 0, //       2003: Italy goes dark (0 → 1) — with `era` 2
  iberia: 0, //      28/04/2025: Spain and Portugal go dark, entirely (0 → 1) — with `era` 5
  bxl: 0, //         Brussels: the coordination centre's sweep over several countries, one ring per « quinze minutes » (0 → 1)
  share: 0, //       every dispatch point linked to the others, veille (0 → 1)
  thread: 0, //      a thin line of light from Papenburg to your home in France: « ta lumière en dépend déjà » (0 → 1, a head that runs)
  you: 0, //         your home: the veille dot on the CARTE · the figure of glass at your window in the QUARTIER (0 → 1)
  /* ── TERRAIN: the Ems and the plain (terrain.js · buildEms) ── */
  shell: 1, //       the X-ray of the place (towers, hall, dikes) (0 → 1)
  hall: 1, //        Meyer Werft's hall (0 → 1)
  ship: 1, //        the ship of glass in the hall (0 → 1)
  pass: 0, //        the ship's GHOST OUTLINE glides down the river under the line (0 → 1; under the wires at 0.5): a
  //                 demonstration of the clearance, never the ship that night
  gap: 0, //         the clearance between the ghost's top and the lowest wires: a signal bracket, no number (0 → 1)
  raise: 0, //       the two towers: 84 m → 110 m (0 → 1, 2007)
  wind: 1, //        the wind farm turns (0 still → 1)
  lineLoad: 1, //    the corridor's conductors: 0 ink (normal load) → 1 signal (over the limit), dashes running west
  tripRun: 0.14, //  the trip seen from under the line: 0 → 0.2 the flash at the corridor's far east end (at 0.14 it is
  //                 full and can be HELD: a ball with a bright core that breathes — the first frame), then 0.2 → 1 the
  //                 dark runs along the wires toward the camera
  /* ── QUARTIER: your street (terrain.js · buildQuartier) ── */
  town: 1, //        the X-ray of the buildings (0 → 1)
  lights: 1, //      the lit windows (0 → 1); `shed` darkens feeder 1's, `relit` brings them back by halves
  tv: 1, //          the TV in your room, a slow glow (0 → 1)
  lift: 0, //        « un ascenseur qui monte » : the lit cabin in its glass shaft (0 ground → 1 top)
  feed: 0, //        the feeders under the street: heads of light running from the poste source to the blocks (0 → 1)
  poste: 1, //       the poste source: its X-ray hall, the transformer (0 → 1)
  room: 1, //        your room's inside: the lamp, the TV, the socket, the switch (0 → 1)
  socket: 0, //      « la machine sur laquelle ta prise est branchée » : the wire lights from your socket down the wall,
  //                 under the street, to the poste source (0 → 1, a head that runs)
  prio: 0, //        the priority feeder marked veille as far as the hospital: « une liste qu'on ne coupe pas » (0 → 1)
  /* ── BENCH: the solid systems (model.js) ── */
  rotors: 1, //      how many alternators stand on the bench: 1 · 2 (West and North-East: the recoupling) · 3 (integer, on a cut)
  altOpen: 0, //     the West's alternator opens: the stator's half lifts, the rotor shows, the turbine slides back (0 → 1)
  altNamed: 0, //    0 none · 1 la turbine · 2 le rotor · 3 le stator (integer)
  drive: 1, //       the turbine pushes (what is produced), veille (0 → 1)
  brake: 0, //       the load brakes the rotor (what is consumed beyond production), signal (0 → 1)
  gov: 0, //         the first reserve: the turbine's valve opens, veille (0 → 1)
  res: 0, //         the reserves in layers, lit one after the other: 0 → 3 (secondes · minutes · quart d'heure)
  dial: 1, //        the frequency dial (0 hidden → 1) — on the CARTE's rim, and on the bench (spot 0)
  needles: 1, //     1 one needle · 3 the three areas' needles apart (« Trois fréquences ») (integer)
  band: 0, //        the normal band, ± 0.18 Hz, a veille arc (0 → 1)
  marks: 0, //       the thresholds engraved under 50: 49.5 · 49 · 48.5 · 48 · 47.5 (the last one signal) (0 → 1)
  amps: 1500, //     the current on Landesbergen–Wehrendorf, in amperes: both relays' needles read it. Sourced values
  //                 only (plan.js · LW.amps): 1 795 the alarm · 2 053 → 2 120 the +67 A · 2 120 the trip. 1 500 is a rest value never shown close
  markRwe: 0, //     Wehrendorf's dial shows its threshold « 2 100 » (0 → 1) — NOT before `seuilrwe` (313 s)
  markEon: 0, //     Landesbergen's dial shows « 3 000 » (0 → 1) — NOT before `lebout` (573 s): it is the inquiry's reveal
  bars: 0, //        Landesbergen's two busbars lit, apart (0 → 1)
  couple: 0, //      the coupler closes between them (0 → 1) — 22:10:11
  lwTrip: 0, //      Wehrendorf's breaker opens, the line's light dies from that end (0 → 1) — 22:10:13
  lwNamed: 0, //     0 none · 1 the relay at Landesbergen (E.ON) · 2 the relay at Wehrendorf (RWE) · 3 the busbars · 4 the coupler (integer)
  hero: 1, //        the frequency relay watches: its veille light (0 → 1) — in the QUARTIER's poste and on the bench
  heroOpen: 0, //    the relay's cover off, the first cell's breaker shown (0 → 1)
  setpt: 0, //       its setting shown: a pointer on « 49 » (0 → 1)
  clac: 0, //        the first step's breaker opens (0 → 1, fast: ≤ 0.2 s) — « Quarante-neuf. Les relais ouvrent. »
  steps: 0, //       the four steps named: 0 none → 4 (49 · 48.5 · 48 · 47.5) ; only the FIRST ever opens
  dep: 0, //         the first step's ten feeders as ten flags: 8 drop, 2 stay (0 → 1) — the CRE's « huit sur dix »
  precision: 0, //   the relay's own band, ± 0.15 Hz, around its setting (0 → 1)
  sync: 0, //        the coupling device between the West's and the North-East's flanges: its ± 10° window, veille (0 → 1)
  tryK: 0, //        an attempt: the 45-second ring fills (0 → 1)
  fail: 0, //        the attempt fails: the device opens again, a signal blink (0 → 1 → 0)
  closed: 0, //      it closes for good: the two marks locked, veille (0 → 1)
  page: 0, //        the report: 0 closed · 1 open on its conclusions · 2 the table of the two settings
  /* ── the studio ── */
  mood: 0, //        0 veille · 1 signal (held frank: never half-way more than half a second)
  pool: 0.3, //      the bench's halo
  grid: 0.16, //     the bench's grid
  fs: 20000, //      the radius the light stands around (cm): AT gives each place its own
  haze: 1, //        the air of the true-scale places (0 clear → 1)
};

/** Neutral values: what a cut to a place starts from (+ what differs). */
const REST = { ...FIRST, tripRun: 0, lineLoad: 0, clockOn: 0, hzOn: 0, dial: 0, hero: 1 };
/** After 22:10:28 (the three plates apart, the cascade done). */
const SPLIT_STATE = { region: 0, emsCut: 2, load: 1, lw: 2, cascade: 1, crack: 1, apartE: 1, apartS: 1, lost: 1, needles: 3, maroc: 0 };
export const AT = {
  carte: { ...REST, set: SET.CARTE, fs: 320, dial: 1 }, //                          the maquette, whole, that evening before 21:38
  region: { ...REST, set: SET.CARTE, fs: 60, region: 1, dial: 0 }, //               north-west Germany, close
  split: { ...REST, set: SET.CARTE, fs: 320, dial: 1, ...SPLIT_STATE, clockOn: 1, hzOn: 1 },
  terrain: { ...REST, set: SET.TERRAIN, fs: 20000 }, //                             the Ems: both circuits live, ink
  quartier: { ...REST, set: SET.QUARTIER, fs: 1500, you: 1 },
  poste: { ...REST, set: SET.QUARTIER, fs: 260 }, //                                inside the poste source, on the hero
  alt: { ...REST, set: SET.BENCH, spot: SPOT.ALT, fs: BENCH.sizes[0], dial: 1, pool: 0.3 },
  lw: { ...REST, set: SET.BENCH, spot: SPOT.LW, fs: BENCH.sizes[1], bars: 1 },
  hero: { ...REST, set: SET.BENCH, spot: SPOT.HERO, fs: BENCH.sizes[2] },
  report: { ...REST, set: SET.BENCH, spot: SPOT.REPORT, fs: BENCH.sizes[3] },
};

/* ───────────────────────────── the poses (PROVISIONAL: set on the stubs) ───────────────────────────── */
const L = PLACE.landesbergen;
const W = PLACE.wehrendorf;
const Q = QUARTIER;
const C0 = Q.poste.cells; // the hero's local origin in the QUARTIER
const HX = HERO.cell.w * 0.5;
/** Where the hero's local origin stands on the bench (spot HERO): its row centred, its fronts toward +z. */
export const HERO_BENCH = [-HERO.cell.w * 2, 0, HERO.cell.d / 2];
export const VIEW = {
  // the six candidates of the first frame (docs/L06-actes.md § La première image)
  hook1: { ...P, tx: EMS.hook[0] + 2522, ty: 2680, tz: 1449, d: 10000, az: -79, el: -14, fov: 46, side: 150, ...SHARP }, // TERRAIN: under the corridor, looking east
  hook2: { ...P, tx: -60, ty: 2, tz: -60, d: 150, az: -34, el: 11, fov: 46, side: 220, ...SHARP }, // CARTE: low over France, toward Germany
  hook3: { ...P, tx: EMS.hook[0] + 9000, ty: 4500, tz: 900, d: 5200, az: -80, el: 6, fov: 56, side: 200, ...SHARP }, //      TERRAIN: at the wires' height, along the bundle
  hook4: { ...P, tx: -LW.half + 30, ty: 58, tz: 30, d: 190, az: -34, el: 5, fov: 40, side: 160, ...SHARP }, //               BENCH (spot LW): Wehrendorf's dial, the breaker, the line
  hook5: { ...P, tx: 10, ty: 0, tz: -40, d: 760, az: -16, el: 34, fov: 36, side: 200, ...SHARP }, //                         CARTE: all of Europe lit, the spark in the north
  hook6: { ...P, tx: 2600, ty: 700, tz: -400, d: 5200, az: -62, el: -2, fov: 44, side: 240, ...SHARP }, //                   QUARTIER: your lit window near, the line on the horizon
  // CARTE: the whole maquette
  mapWide: { ...P, tx: -20, ty: 0, tz: 0, d: 820, az: -18, el: 42, ...SHARP },
  mapTop: { ...P, tx: -20, ty: 0, tz: 0, d: 1000, az: -6, el: 62, ...SHARP },
  exploded: { ...P, tx: -20, ty: 100, tz: -10, d: 1150, az: -30, el: 22, ...SHARP }, // explode 1: the four layers from the side
  layer: { ...P, tx: -60, ty: 30, tz: -40, d: 330, az: -34, el: 12, ...SHARP }, //            along one layer (set ty to MAP.layers.*)
  zonesDE: { ...P, tx: -15, ty: 0, tz: -95, d: 250, az: -12, el: 52, ...SHARP }, //           Germany and the Netherlands: the control areas
  france: { ...P, tx: -110, ty: 0, tz: -5, d: 240, az: -25, el: 40, ...SHARP },
  youMap: { ...P, tx: PLACE.you[0], ty: 0, tz: PLACE.you[2], d: 70, az: -30, el: 28, ...CLOSE },
  westPlate: { ...P, tx: -150, ty: 0, tz: 20, d: 520, az: -30, el: 44, ...SHARP },
  eastPlate: { ...P, tx: 95, ty: 0, tz: -105, d: 330, az: 16, el: 42, ...SHARP },
  southPlate: { ...P, tx: 170, ty: 0, tz: 70, d: 300, az: 10, el: 42, ...SHARP },
  iberia: { ...P, tx: -230, ty: 0, tz: 140, d: 270, az: -30, el: 42, ...SHARP },
  strait: { ...P, tx: PLACE.tarifa[0], ty: 0, tz: PLACE.tarifa[2] + 2, d: 70, az: -40, el: 28, ...CLOSE }, //  the Spain–Morocco link
  italy: { ...P, tx: 30, ty: 0, tz: 100, d: 270, az: 12, el: 44, ...SHARP },
  alps: { ...P, tx: -30, ty: 0, tz: 15, d: 150, az: -25, el: 30, ...CLOSE }, //               the dams, the pumps
  polandC: { ...P, tx: 85, ty: 0, tz: -95, d: 120, az: 15, el: 36, ...CLOSE },
  bruxelles: { ...P, tx: PLACE.bruxelles[0], ty: 0, tz: PLACE.bruxelles[2], d: 210, az: -20, el: 45, ...SHARP },
  cities: { ...P, tx: -40, ty: 0, tz: 10, d: 760, az: -8, el: 30, ...SHARP }, //              Lisbonne, Paris, Varsovie in one frame
  dialMap: { ...P, tx: DIAL_AT.at[0], ty: DIAL.r + 6, tz: DIAL_AT.at[2], d: 150, az: -112, el: 5, ...CLOSE }, // the needle, Europe lit behind it
  dialWest: { ...P, tx: DIAL_AT.at[0] + 60, ty: 20, tz: DIAL_AT.at[2] - 20, d: 330, az: -100, el: 14, ...SHARP }, // the dial small on the left, the West plate behind
  // CARTE: north-west Germany (region 1)
  region: { ...P, tx: -22, ty: 0, tz: -118, d: 100, az: -20, el: 38, ...SHARP },
  emsMap: { ...P, tx: PLACE.papenburg[0] + 4, ty: 0, tz: PLACE.papenburg[2] - 2, d: 42, az: -30, el: 30, ...CLOSE }, // Conneforde–Diele, Papenburg
  lwMap: { ...P, tx: (L[0] + W[0]) / 2, ty: 0, tz: (L[2] + W[2]) / 2, d: 36, az: -10, el: 34, ...CLOSE }, //          Landesbergen–Wehrendorf
  n1: { ...P, tx: -18, ty: 0, tz: -112, d: 70, az: -26, el: 34, ...CLOSE }, //                 the N-1 demonstration's mesh
  cascade: { ...P, tx: -17, ty: 0, tz: -104, d: 110, az: -14, el: 40, ...SHARP },
  mainS: { ...P, tx: 4, ty: 0, tz: -62, d: 150, az: -8, el: 44, ...SHARP }, //                 south of the Main, Bavaria, Austria
  tear: { ...P, tx: 2, ty: 1, tz: -70, d: 150, az: 8, el: 9, fov: 40, ...SHARP }, // low, along the crack from the south
  three: { ...P, tx: 25, ty: 0, tz: -15, d: 640, az: -20, el: 48, ...SHARP }, // the three plates apart (thumb2)
  // TERRAIN
  crossing: { ...P, tx: 0, ty: 3000, tz: 0, d: 62000, az: 12, el: 5, ...SHARP }, //            from upstream: the two towers, the river flowing away
  crossingLow: { ...P, tx: 0, ty: 4300, tz: 0, d: 30000, az: 34, el: -6, fov: 44, ...SHARP }, // from the water, the wires overhead
  tower: { ...P, tx: -EMS.tower.x, ty: 5200, tz: 0, d: 21000, az: -40, el: 3, ...SHARP }, //    a tower of 84 m, three-quarters
  circuits: { ...P, tx: 0, ty: 6400, tz: 0, d: 42000, az: -25, el: 4, ...SHARP }, // along the span: the two circuits die
  under: { ...P, tx: 0, ty: 3000, tz: -1000, d: 52000, az: 145, el: 3, fov: 20, ...SHARP }, // the ghost under the wires (thumb)
  gapC: { ...P, tx: 0, ty: 6000, tz: 0, d: 9000, az: 58, el: 2, ...CLOSE }, //                  the gap between the ship's top and the wires
  hallW: { ...P, tx: HALL.at[0], ty: 3000, tz: HALL.at[2], d: 76000, az: -52, el: 9, ...SHARP },
  shipC: { ...P, tx: HALL.at[0], ty: 3400, tz: HALL.at[2] + 6000, d: 38000, az: -28, el: 6, ...SHARP },
  river: { ...P, tx: 0, ty: 0, tz: 60000, d: 120000, az: 8, el: 16, ...SHARP }, //              the Ems from the hall down to the line
  plain: { ...P, tx: 150000, ty: 6000, tz: 30000, d: 150000, az: -74, el: 4, fov: 40, ...SHARP }, // the wind farm, the corridor under it
  // QUARTIER
  street: { ...P, tx: 1500, ty: 700, tz: -300, d: 6500, az: -38, el: 3, fov: 40, ...SHARP },
  home: { ...P, tx: 0, ty: 800, tz: 0, d: 3200, az: -20, el: 2, ...SHARP },
  windowC: { ...P, tx: Q.window[0], ty: Q.window[1], tz: 0, d: 700, az: -15, el: 0, ...CLOSE },
  room: { ...P, tx: 330, ty: 730, tz: -60, d: 330, az: 165, el: 4, fov: 50, ...CLOSE }, //      from inside, over your shoulder, toward the street
  socketC: { ...P, tx: Q.socket[0], ty: Q.socket[1] - 3, tz: Q.socket[2], d: 48, az: 60, el: 6, ...CLOSE },
  switchC: { ...P, tx: Q.switchAt[0], ty: Q.switchAt[1], tz: Q.switchAt[2], d: 48, az: 55, el: 0, ...CLOSE },
  liftB: { ...P, tx: Q.lift.shaft[0], ty: 900, tz: 0, d: 3000, az: -25, el: 0, ...SHARP },
  feeders: { ...P, tx: 3500, ty: 0, tz: -200, d: 9000, az: -60, el: 28, ...SHARP }, //          the cables under the street, from above
  posteW: { ...P, tx: Q.poste.at[0], ty: 300, tz: Q.poste.at[2], d: 3200, az: -40, el: 8, ...SHARP },
  cellsQ: { ...P, tx: C0[0] + 110, ty: 110, tz: C0[2] + 20, d: 520, az: -28, el: 6, ...CLOSE }, // the hero's row in the poste
  relayQ: { ...P, tx: C0[0] + HX, ty: HERO.relay.at[1], tz: C0[2] + 14, d: 110, az: -25, el: 4, ...CLOSE },
  breakerQ: { ...P, tx: C0[0] + 22, ty: 62, tz: C0[2] + 33, d: 178, az: -72, el: 5, ...CLOSE }, // the first cell's breaker, in profile: « Les relais ouvrent. »
  hospital: { ...P, tx: Q.hospital.at[0], ty: 900, tz: Q.hospital.at[2], d: 5200, az: -30, el: 4, ...SHARP },
  roofs: { ...P, tx: 2000, ty: 1500, tz: -1500, d: 12000, az: -75, el: 12, ...SHARP }, //        over the roofs, toward the poste and its line
  // BENCH · spot ALT
  alt: { ...P, tx: 5, ty: ROTOR.axisY + 2, tz: 0, d: 400, az: -38, el: 11, ...SHARP },
  altOpen: { ...P, tx: 20, ty: ROTOR.axisY + 20, tz: 0, d: 520, az: -30, el: 13, ...SHARP },
  flange: { ...P, tx: ROTOR.flange.x, ty: ROTOR.axisY, tz: 0, d: 190, az: -68, el: 5, ...CLOSE }, //        the strobe mark
  altDial: { ...P, tx: -150, ty: ROTOR.axisY, tz: -30, d: 420, az: -64, el: 8, ...SHARP }, //               the flange and the dial in one frame
  dialC: { ...P, tx: DIAL.bench.at[0], ty: DIAL.r + 8, tz: DIAL.bench.at[2], d: 150, az: -52, el: 4, ...CLOSE }, // the dial on the bench
  threeRotors: { ...P, tx: ROTOR.flange.x - 13, ty: ROTOR.axisY - 2, tz: -10, d: 360, az: -72, el: 8, ...SHARP }, // the three marks side by side
  syncC: { ...P, tx: ROTOR.flange.x, ty: ROTOR.axisY, tz: ROTOR.row[1] / 2, d: 300, az: -76, el: 6, ...CLOSE }, // West and North-East, the device between them
  // BENCH · spot LW
  lwWide: { ...P, tx: 20, ty: 55, tz: 0, d: 470, az: -14, el: 12, ...SHARP },
  twoDials: { ...P, tx: 0, ty: 44, tz: 40, d: 375, az: -4, el: 6, ...SHARP }, // the two relays' dials, one frame
  relayRwe: { ...P, tx: -LW.half + 25, ty: 52, tz: 35, d: 190, az: -30, el: 6, ...CLOSE },
  relayEon: { ...P, tx: LW.half - 25, ty: 52, tz: 35, d: 190, az: 24, el: 6, ...CLOSE },
  breakerRwe: { ...P, tx: -102, ty: 56, tz: 0, d: 120, az: 15, el: 8, ...CLOSE },
  bars: { ...P, tx: LW.bars.x - 5, ty: LW.y - 2, tz: -18, d: 220, az: -40, el: 14, ...CLOSE },
  // BENCH · spot HERO
  // (on the bench the hero's row is centred on the origin: its local origin stands at HERO_BENCH)
  heroW: { ...P, tx: -10, ty: 100, tz: 20, d: 470, az: -34, el: 8, ...SHARP },
  heroRelay: { ...P, tx: HERO_BENCH[0] + HX, ty: HERO.relay.at[1], tz: HERO_BENCH[2] + 14, d: 72, az: -24, el: 4, ...CLOSE },
  heroSteps: { ...P, tx: 0, ty: 110, tz: HERO_BENCH[2], d: 470, az: -12, el: 6, ...SHARP },
  heroBreaker: { ...P, tx: HERO_BENCH[0] + 22, ty: 62, tz: HERO_BENCH[2] + 33, d: 178, az: -72, el: 5, ...CLOSE },
  heroFlags: { ...P, tx: HERO_BENCH[0] + HX, ty: 130, tz: HERO_BENCH[2] + 3, d: 150, az: -28, el: 2, ...CLOSE }, // the ten feeder flags
  // BENCH · spot REPORT
  report: { ...P, tx: 0, ty: 1, tz: 0, d: 88, az: -18, el: 52, ...CLOSE },
  reportOpen: { ...P, tx: -10, ty: 1, tz: 0, d: 100, az: -14, el: 56, ...SHARP }, // the report, open
};

/* ───────────────────────────── the seams between the chapter files ───────────────────────────── */
// Two kinds. A MOVE (`from` [a, b], `to`): D.match — the camera keeps its way across the seam (inside one place).
// A CUT (`set`, `to`, `fade`): the file that ends has finished its last shot by `at`; the file that starts cuts there
// to a COMPLETE state. All PROVISIONAL (set on the stubs): recheck on the real sets before the chapters.
export const HAND = {
  // c1 → c2, « …Elles doivent avoir la place de le prendre. » (the N-1 mesh, close) → « Ce n'est pas de la théorie :
  // … l'Italie s'est éteinte. » : the camera lifts off the mesh and flies south over the Alps to Italy
  c12: {
    at: "italie-0.15",
    from: [VIEW.n1, { ...VIEW.n1, tx: -10, tz: -95, d: 110, el: 38, ...SHARP }],
    to: VIEW.italy,
    opt: { before: 1.0, after: 1.5 },
  },
  // c2 → c3, « …l'aiguille est à cinquante. Elle ne bougera pas… » (the dial on the rim) → « Le courant qui passait
  // par là se jette sur les lignes voisines » : a cut onto the dead line over the Ems, its neighbours around it
  c23: { at: "report-0.15", set: SET.CARTE, to: VIEW.emsMap, state: { region: 1, fs: 60, emsCut: 2, dial: 0 }, fade: 0.15 },
  // c3 → c4, « …Pas pour sauver l'Europe. » (the cascade, sliding south) → « 22:10:27. Au sud du Main… » : the slide goes on
  c34: {
    at: "main-0.15",
    from: [VIEW.cascade, { ...VIEW.cascade, tx: -8, tz: -86, d: 125 }],
    to: VIEW.mainS,
    opt: { before: 1.0, after: 1.2 },
  },
  // c4 → c5, « Mais à l'autre bout de l'Europe… c'est exactement l'inverse » (the West plate) → « Au Nord-Est, il y a
  // trop d'électricité » : the camera crosses the crack toward the east
  c45: {
    at: "nordest-0.2",
    from: [VIEW.westPlate, { ...VIEW.westPlate, tx: -40, tz: -30, d: 460, az: -10 }],
    to: VIEW.eastPlate,
    opt: { before: 1.4, after: 1.4 },
  },
  // c5 → c6, « …chacun avait fait son calcul… sur son seul réseau. » (the areas on the map) → « Et le détail du
  // début ? Landesbergen–Wehrendorf. » : the bench, the line and its two relays
  c56: { at: "lebout-0.15", set: SET.BENCH, to: VIEW.lwWide, state: { spot: SPOT.LW, fs: BENCH.sizes[1] }, fade: 0.2 },
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
 * `seam(D, "c34", "in", { state: { ...AT.region, … } })`. A CUT seam has no "out" half (returns null).
 * Returns the pose the camera reaches after the seam.
 */
export const seam = (D, name, only, extra = {}) => {
  const h = HAND[name];
  const at = onFrame(D.at(h.at));
  const state = { ...(extra.state ?? {}), ...(h.state ?? {}) }; // the seam's own numbers win: its pose depends on them
  if (h.from) return D.match(at, h.from, h.to, { ...h.opt, ...extra, state, only });
  if (only === "out") return null;
  D.cut(at, extra.set ?? h.set, h.to, state, { fade: extra.fade ?? h.fade });
  return h.to;
};

/* ───────────────────────────── the world ───────────────────────────── */
export function buildWorld(stage) {
  const scene = stage.scene;
  const europe = buildEurope();
  const ems = buildEms();
  const quartier = buildQuartier();
  const model = buildModel();
  scene.add(europe.group, ems.group, quartier.group);

  /* BENCH: four spots, one shown at a time (`spot`), each on its own bench at the origin (its halo at its size) */
  const benches = BENCH.sizes.map((size) => makeBench(size));
  const benchRoot = new THREE.Group();
  benches.forEach((b) => benchRoot.add(b.group));
  scene.add(benchRoot);
  benches[SPOT.ALT].group.add(model.rotors.group, model.sync.group);
  benches[SPOT.LW].group.add(model.lw.group);
  benches[SPOT.REPORT].group.add(model.report.group);

  /* the two pieces that have two homes: the dial (the CARTE's rim, or the bench) and the hero (the poste source, or the bench) */
  const home = (obj, parent, pos, yaw = 0) => {
    if (obj.parent !== parent) parent.add(obj);
    obj.position.set(pos[0], pos[1], pos[2]);
    obj.rotation.set(0, yaw, 0);
  };
  let placed = -1;
  const place = (set) => {
    if (set === placed) return;
    placed = set;
    if (set === SET.BENCH) {
      home(model.dial.group, benches[SPOT.ALT].group, DIAL.bench.at, (DIAL.bench.yaw * Math.PI) / 180);
      home(model.hero.group, benches[SPOT.HERO].group, HERO_BENCH);
    } else {
      home(model.dial.group, europe.A.dial, [0, 0, 0]); // the anchor already faces −x
      home(model.hero.group, quartier.A.cells, [0, 0, 0]);
    }
  };
  const ctx = { set: 0, spot: 0 };

  return {
    europe, ems, quartier, model, benches,
    apply(S, time) {
      const set = Math.round(S.set);
      const spot = Math.min(3, Math.max(0, Math.round(S.spot)));
      const px = stage.pixelScale();
      europe.group.visible = set === SET.CARTE;
      ems.group.visible = set === SET.TERRAIN;
      quartier.group.visible = set === SET.QUARTIER;
      benchRoot.visible = set === SET.BENCH;
      place(set);
      ctx.set = set;
      ctx.spot = spot;
      let fx = stage.cam.tx; // the light stands around what the camera looks at
      let fy = stage.cam.ty;
      let fz = stage.cam.tz;
      const d = stage.cam.d;

      if (set === SET.CARTE) {
        europe.update(S, time, px);
        scene.fog.density = 0.016 / Math.max(300, d);
      } else if (set === SET.TERRAIN) {
        ems.update(S, time, px);
        scene.fog.density = (0.01 * S.haze) / Math.max(20000, d);
      } else if (set === SET.QUARTIER) {
        quartier.update(S, time, px);
        scene.fog.density = (0.016 * S.haze) / Math.max(1500, d);
      } else {
        benches.forEach((b, i) => (b.group.visible = i === spot));
        benches[spot].set({ pool: S.pool, grid: S.grid, mood: S.mood });
        [fx, fy, fz] = BENCH.focus[spot];
        scene.fog.density = benches[spot].fog(d);
      }
      model.update(S, time, px, ctx);

      Object.assign(stage.focus, { x: fx, y: fy, z: fz, scale: S.fs });
      setMood(stage, S.mood, 0);
    },
  };
}
