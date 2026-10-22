// DOSSIER 024 — 03 RÉPONSE. From « Le fil touche la carcasse. » to « Et toi… tu respires toujours. » (tozero → toverdict).
// In cuts: the voice is chopped, one shot per breath, each one read in half a second. Every cut is laid a few frames
// before its sentence (the `to…` cues already lead their words), its pose is complete and so is its state
// ({ ...STAGED, … }): nothing is inherited from act 2, nothing from the shot before.
//
// WE REPLAY THE INSTANT: the wire touches the casing — and this time we follow what the system does. NOTHING GOES
// OUT: `dark` 0, `lamp` 1, `vent` 1, `current` 1 through the whole act (the what-if of the scene stays in act 1).
//
// WHAT IS SHOWN IS WHAT HAPPENS IN AN IT NETWORK (docs/faits/024-*.md): at the first fault no fault current is drawn
// — only the capacitive leakage, almost nothing — so no loop, no signal head runs anywhere (`leak` 0, `double` 0);
// nothing trips (`trip` 0); the circuit's current keeps flowing. The insulation monitor keeps sending its measuring
// pulses into the two conductors (`cpi` 1), its gauge falls (`ins` 1 → 0) on « isolé », it warns (`alarm`): its LED
// in the cabinet and the repeater on the back wall. It never cuts. The fault is looked for (`seek`), then repaired.
//
// THE HEADER: `faults` 0 at the first cut (we replay it), 1 on « Premier », 0 on « réparé ». The clock (main.js)
// replays from the hook's fault and turns veille at `trigger`. `mood` stays 1 (signal) until « respires »: the
// release falls on the sentence where the system has won, not before.
//
// TACT: you are asleep, nothing happens to you; the surgeon's hands work above the drape, never in close-up.
import { setAct } from "@kit/overlay.js";
import { moved } from "@kit/direct.js";
import { SET, POSE0, VIEW, STAGED, FAULT, RESP, LAMP, MOUNT, SYSTEM, CPI, REPEATER, BENCHAT, YOU } from "./world.js";

/* ── the poses (found with `look`, docs/journal/024-acte3.md) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the appliance, close: its casing of glass, the wire, the contact on the side facing us (the push of act 2, picked up)
const DEV0 = { ...P, ...VIEW.device, d: 270 };
const DEV1 = { ...DEV0, d: 236 };
// the ventilator's bellows in their glass column (the bloc journal's pose: a step back, a little more from the side)
const RESP0 = { ...P, ...VIEW.resp, d: 205 };
const RESP1 = { ...RESP0, ty: RESP0.ty + 8, d: 192 }; // the bellows rise, we rise: toward the lamp
// the lamp from below and the side, its lit face, its pool on you
const LAMP0 = { ...P, tx: LAMP.head[0], ty: LAMP.head[1] - 55, tz: LAMP.head[2], d: 350, az: -30, el: 6, fov: 34, shift: -60 };
const LAMP1 = { ...LAMP0, d: 330 };
// the whole room, wide: the surgeon at work, you breathing, the tiny signal point in the appliance far away
const ROOM0 = { ...P, ...VIEW.room };
const ROOM1 = { ...ROOM0, d: 790 };
// the cabinet through the back wall, the system standing in it — then in toward its rail, where the monitor is
const SYS0 = { ...P, ...VIEW.system };
const SYS1 = { ...SYS0, tx: MOUNT[0] + 16, ty: MOUNT[1] + 50, tz: MOUNT[2] + 4, d: 236 };
// the monitor, close, on its rail in the cabinet: its gauge, its LED
const CPI0 = { ...P, ...moved(VIEW.cpi, BENCHAT, MOUNT), d: 78 };
const CPI1 = { ...CPI0, d: 70 };
// the alarm repeater on the back wall: its LED and its rings
const REP0 = { ...P, ...VIEW.repeater };
const REP1 = { ...REP0, d: 140 };
// the first frame again, a little closer: everything lit, everything running — then on to the surgeon
const HOOK0 = { ...P, ...POSE0, d: 520, shift: -110, drift: 0.3 }; // lower than POSE0: the ringing repeater clears the header
// (VIEW.surgeon put the lamp's lit face behind the header; from a little further and higher it sits just under it)
const SURG = { ...P, tx: 10, ty: 130, tz: -40, d: 340, az: -16, el: 22, fov: 34, shift: -90 };
// the back wall wide: the conduits from the cabinet to the sockets, the repeater ringing
const WALLS0 = { ...P, ...VIEW.walls };
const WALLS1 = { ...WALLS0, d: 735 };
// you asleep: the drape rising on your chest, the lamp's pool on you (from the side, not into your face)
const YOU0 = { ...P, tx: -50, ty: 112, tz: -10, d: 380, az: -48, el: 24, fov: 34, shift: 20 };
const YOU1 = { ...YOU0, d: 360 };

/* ── the light: what it stands around, and how wide ── */
const L_DEV = { fx: FAULT[0], fy: FAULT[1], fz: FAULT[2], fs: 60 };
const L_RESP = { fx: RESP.bellows[0], fy: RESP.bellows[1], fz: RESP.bellows[2], fs: 120 };
const L_LAMP = { fx: LAMP.head[0], fy: LAMP.head[1] - 40, fz: LAMP.head[2], fs: 160 };
const L_ROOM = { fx: 20, fy: 110, fz: -60, fs: 600 };
const L_SYS = { fx: MOUNT[0] + SYSTEM.centre[0], fy: MOUNT[1] + SYSTEM.centre[1], fz: MOUNT[2], fs: 120 };
const L_CPI = { fx: MOUNT[0] + CPI.at[0], fy: MOUNT[1] + CPI.at[1], fz: MOUNT[2] + CPI.at[2], fs: 25 };
const L_REP = { fx: REPEATER.at[0], fy: REPEATER.at[1], fz: REPEATER.at[2], fs: 80 };
const L_HOOK = { fx: 20, fy: 110, fz: -30, fs: 450 };
const L_SURG = { fx: 10, fy: 130, fz: -40, fs: 250 };
const L_WALLS = { fx: 120, fy: 160, fz: -255, fs: 500 };
const L_YOU = { fx: YOU.chest[0], fy: YOU.chest[1], fz: YOU.chest[2], fs: 200 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, chip, jolt } = D;
  const t = D.times({
    tozero: "tozero", carcasse: "carcasse", premier: "premier",
    toresp: "toresp", tourne: "tourne", tolamp: "tolamp", eclaire: "eclaire",
    personne: "personne", vu: "vu", tomais: "tomais", isole: "isole",
    toreponse: "toreponse", mesure: "mesure", trigger: "trigger", tosalle: "tosalle",
    tocoupe: "tocoupe", tochir: "tochir", todefaut: "todefaut", cherche: "cherche", repare: "repare",
    totoi: "totoi", respire: "respire", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the « Défauts » readout. */
  const beat = (at, k = 1.22) => {
    tl.fromTo("#hud-count", { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to("#hud-count", { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  // the bloc as this act finds it: the operation going on, everything lit and running, the monitor watching
  const HERE = { ...STAGED, faults: 0, work: 0.5, cabinet: 0, cpi: 1, ins: 1 };
  // …once the wire is on the metal: one fault, nothing else has changed
  const FAULTED = { ...HERE, fault: 1, faults: 1 };
  // …once the monitor has seen it: its gauge low, the alarm on (in the cabinet and on the back wall)
  const WARNED = { ...FAULTED, ins: 0, alarm: 1, litCpi: 0 };

  /* ───────────── « Le fil touche la carcasse. Premier défaut. » ───────────── */
  // the push into the appliance of act 2, picked up close: on « carcasse » the wire bends onto the metal, the light
  // where it touches; on « Premier » the header counts one fault, a light knock
  cut(t.tozero, SET.BLOC, DEV0, { ...HERE, ...L_DEV });
  shot(t.tozero, span(t.tozero, t.toresp), DEV1, "sine.out", DEV0.d);
  st(t.carcasse, 0.25, { fault: 1 }, "power2.out");
  now(t.premier, { faults: 1 });
  beat(t.premier + 0.02);
  jolt(t.premier + 0.02, 0.35, 0.4);

  /* ───────────── « Le respirateur tourne. » ───────────── */
  // from the appliance's cord to the cart beside you: the bellows rise and fall, the screen's curves run
  cut(t.toresp, SET.BLOC, RESP0, { ...FAULTED, ...L_RESP });
  shot(t.toresp, span(t.toresp, t.tolamp), RESP1, "sine.inOut", RESP0.d);

  /* ───────────── « La lampe éclaire. » ───────────── */
  // the bellows rise, we rise: the lamp lit, its face, its pool on the table
  cut(t.tolamp, SET.BLOC, LAMP0, { ...FAULTED, ...L_LAMP });
  shot(t.tolamp, span(t.tolamp, t.personne), LAMP1, "sine.inOut", LAMP0.d);

  /* ───────────── « Personne n'a rien vu. » ───────────── */
  // the room, wide: the surgeon at work, you breathing — and far away in the appliance, the small signal point
  cut(t.personne, SET.BLOC, ROOM0, { ...FAULTED, work: 1, ...L_ROOM });
  shot(t.personne, span(t.personne, t.tomais), ROOM1, "sine.inOut", ROOM0.d);

  /* ───────────── « Mais le circuit, lui… n'est plus isolé. » ───────────── */
  // from the fault's point at the back of the frame to the cabinet behind the back wall: the system standing in it,
  // the monitor's pulses in the two conductors; in toward its rail, and on « isolé » the gauge falls, signal
  cut(t.tomais, SET.BLOC, SYS0, { ...FAULTED, cabinet: 0.3, ...L_SYS });
  shot(t.tomais, span(t.tomais, t.toreponse), SYS1, "sine.inOut", SYS0.d);
  st(t.isole, 0.4, { ins: 0 }, "power2.out");
  chip("chip-isole", null, 96, 470, t.isole - 0.1, t.toreponse - 0.15);

  /* ───────────── « Le contrôleur l'a mesuré. Une alarme. » ───────────── */
  // the monitor, close: its gauge low; on « mesuré » it lights; on « alarme » its LED, veille
  cut(t.toreponse, SET.BLOC, CPI0, { ...FAULTED, ins: 0, cabinet: 0.3, ...L_CPI });
  shot(t.toreponse, span(t.toreponse, t.tosalle), CPI1, "sine.inOut", CPI0.d);
  st(t.mesure, 0.25, { litCpi: 0.6 }, "power2.out");
  st(t.trigger, 0.2, { alarm: 1 }, "power2.out");

  /* ───────────── « Dans la salle. » ───────────── */
  // from the monitor's LED to the LED on the wall: the alarm repeater, its rings
  cut(t.tosalle, SET.BLOC, REP0, { ...WARNED, ...L_REP });
  shot(t.tosalle, span(t.tosalle, t.tocoupe), REP1, "sine.inOut", REP0.d);
  chip("chip-alarme", null, 96, 470, t.tosalle + 0.05, t.tocoupe - 0.12);

  /* ───────────── « Rien ne coupe. » ───────────── */
  // the frame of the first picture: everything lit, everything running — the sentence reads on the hook's picture
  cut(t.tocoupe, SET.BLOC, HOOK0, { ...WARNED, work: 1, ...L_HOOK });

  /* ───────────── « Le chirurgien continue. » ───────────── */
  // the camera slides to the surgeon: his hands at work above the drape
  shot(t.tochir - 0.1, span(t.tochir - 0.1, t.todefaut), SURG, "sine.inOut");
  st(t.tochir - 0.1, span(t.tochir - 0.1, t.todefaut), L_SURG, "sine.inOut");

  /* ───────────── « Le défaut sera cherché. Puis réparé. » ───────────── */
  // the back wall: on « cherché » a veille head leaves the cabinet, runs the conduit, stops on the appliance's socket
  // (the repeater still ringing); a few frames before « réparé », the appliance: the wire leaves the metal, the light
  // dies, the header counts zero, the gauge is high again, the alarm stops
  cut(t.todefaut, SET.BLOC, WALLS0, { ...WARNED, ...L_WALLS });
  const toFix = t.repare - 0.15;
  shot(t.todefaut, span(t.todefaut, toFix), WALLS1, "sine.inOut", WALLS0.d);
  st(t.cherche - 0.05, span(t.cherche - 0.05, toFix), { seek: 0.97 }, "sine.inOut");
  chip("chip-repare", null, 96, 470, t.todefaut + 0.15, toFix - 0.12);
  cut(toFix, SET.BLOC, DEV1, { ...WARNED, ...L_DEV });
  shot(toFix, span(toFix, t.totoi), { ...DEV1, d: 226 }, "sine.inOut", DEV1.d);
  st(t.repare, 0.4, { fault: 0 }, "power2.inOut");
  now(t.repare, { faults: 0 });
  beat(t.repare + 0.02, 1.14);
  st(t.repare + 0.1, 0.4, { ins: 1, alarm: 0, litCpi: 0 }, "power2.out");

  /* ───────────── « Et toi… tu respires toujours. » ───────────── */
  // you, asleep: the drape rising on your chest under the lamp's pool. On « respires » the film lets go: mood → veille
  cut(t.totoi, SET.BLOC, YOU0, { ...HERE, ...L_YOU });
  shot(t.totoi, span(t.totoi, t.toverdict), YOU1, "sine.inOut", YOU0.d);
  st(t.respire - 0.04, 0.38, { mood: 0 }, "sine.inOut");
}
