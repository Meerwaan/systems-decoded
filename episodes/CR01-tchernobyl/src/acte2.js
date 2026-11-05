// t1 → t3 (tot1 → tot4): the day before, the test is prepared; the report to the night; the power that falls; the rods pulled out.
// Starts with a complete cut on the plant at `tot1`, hands over at `tot4` (acte2b cuts to the salle).
//
// The plant (centrale), every number on its word: the whole table running, green while all is well (`ok`) → « le courant est
// coupé »: the line to the network goes dark → the diesels shake and smoke, slow to start (« environ une minute ») → the turbine
// slows on its own momentum → pull back: the current runs from the generator to the pumps (« peut-elle faire tourner les
// pompes ? ») → « on coupe le refroidissement de secours »: the valve turns red, the green of the safety goes out, circled →
// « le réseau réclame du courant »: the same line pulls again, and the camera follows it into the dark (« à la nuit »).
// The core (coeur), 00 h 28: the glow collapses (« un pour cent ») → the fuel (canal): the xenon grains eat the neutrons, the glow
// that wanted to climb falls back → the core, 01 h 00: the green rods come out on « retire », « encore », « et encore »; « six pour
// cent » the glow climbs a little; « très peu de barres » the camera dives onto the two that are left.
import { STAGED, VIEW, SET, W } from "./world.js";
import { feutre } from "@kit/reconstitution.js";
/** ∫ of a speed ramping linearly r0 → r1, as an ease (05/11: the turbine angle `rotorT`, seek-safe). */
const ramp = (r0, r1) => (u) => (2 * r0 * u + (r1 - r0) * u * u) / (r0 + r1);


/** A pose aimed at a point of a maquette (local cm), complete. */
const aimAt = (name, local, o) => {
  const [tx, ty, tz] = W(name, local);
  return { side: 0, roll: 0, drift: 0.25, dof: 0, fov: 30, shift: 140, tx, ty, tz, ...o };
};
/** The light around a point of a maquette (fx fy fz) and its size (fs). */
const lit = (name, local, fs) => {
  const [fx, fy, fz] = W(name, local);
  return { fx, fy, fz, fs };
};

// THE PLANT
const WIDE = VIEW.centrale;
const WIDE_IN = { ...VIEW.centrale, d: 940 };
const LINE = aimAt("centrale", [70, 35, -110], { d: 560, az: -78, el: 28, shift: 60 }); // the three pylons, the line on the table
const LINE_IN = { ...LINE, d: 500 };
const NIGHT = aimAt("centrale", [190, 40, -125], { d: 560, az: -84, el: 36, shift: 40 }); // up, along the line, into the dark
const DIESELS = VIEW.diesels;
const DIESELS_IN = { ...VIEW.diesels, d: 290 };
const TURB = VIEW.turbine;
const TURB_CLOSE = VIEW.turbineClose;
const FEED = aimAt("centrale", [0, 18, 10], { d: 660, az: -40, el: 42, shift: 90 }); // generator → board → pumps, one frame
const FEED_IN = { ...FEED, d: 560 }; // retouche 05/11: a clean cut, then a slow pull (the ratio pull-back made two stray frames)
const ECCS = aimAt("centrale", [-75, 18, 95], { d: 240, az: -30, el: 12, shift: 110, dof: 6 }); // lower than VIEW.eccs: no glare on the tank tops
const ECCS_IN = { ...ECCS, d: 215 };
// THE CORE
const CORE_A = VIEW.coeur; // 00 h 28: the whole core, its glow
const CORE_A_IN = { ...VIEW.coeur, d: 620 };
const CORE_B = aimAt("coeur", [0, 98, 0], { d: 440, az: -58, el: 16, shift: 70 }); // 01 h 00: the rods in the cut face
const RODS_FEW = aimAt("coeur", [1, 94, 0], { d: 230, az: -60, el: 10, shift: 40, dof: 6 }); // the two that are left
// THE FUEL
const FUEL = { ...VIEW.fuel, d: 270, dof: 6 }; // the fuel channel close: the xenon grains, the neutrons they swallow
const FUEL_IN = { ...VIEW.fuel, d: 225, dof: 6 };

const L = {
  turbine: lit("centrale", [72, 30, -10], 100),
  pumps: lit("centrale", [0, 18, 10], 170),
  diesels: lit("centrale", [80, 20, 95], 100),
  eccs: lit("centrale", [-75, 18, 95], 170),
  mains: lit("centrale", [60, 40, -125], 190),
  dark: lit("centrale", [240, 40, -125], 40), // the light leaves the table along the line: the night falls on the plant
  fuel: lit("canal", [0, 120, -44], 70),
};

// what none of these shots shows: off, whatever the act before left
const night = { fault: 0, viol: 0, depuis: 0, flux: 0, split: 0, xenon: 0, newRod: 0, solo: 0, rep: 0, blast: 0, slab: 0, blast2: 0, fire: 0, az5: 0 };

export default function acte2({ D, world }) {
  const { cut, shot, st, chip } = D;
  const t = D.times({
    tot1: "tot1", courant: "courant", coupe: "t1:coupé", diesels: "diesels", minute: "minute1", demarrer: "t1:démarrer",
    turbine2: "turbine2", ralentissant: "ralentissant", pompes1: "pompes1", pompes: "t1:pompes",
    toreport: "toreport", coupe2: "coupe", refroid: "refroid", reseau: "reseau", reclame: "report:réclame", repousse: "repousse", nuit: "nuit",
    tot2: "tot2", effondre: "effondre", peine: "peine", toxenon: "toxenon", xenon: "xenonW", avale: "t2:avale", freine: "freine2",
    tot3: "tot3", retire: "retire", encore1: "encore1", etEncore: "etEncore", remonte: "remonte", six: "six", peu: "peu", tot4: "tot4",
  });

  /* ── « La veille, 14 h 00. On prépare un essai de sécurité. » — the plant whole, running, green ── */
  cut(t.tot1, SET.CENTRALE, WIDE, { ...STAGED.centrale, ...night, ok: 1, spin: 1, flow: 1, mains: 1, diesel: 0, feed: 0 });
  shot(t.tot1, t.courant - 0.1 - t.tot1, WIDE_IN, "sine.inOut", WIDE.d);

  /* ── « Si le courant est coupé, » — the line to the network: its current dies on « coupé » ── */
  cut(t.courant - 0.1, SET.CENTRALE, LINE, { ...L.mains });
  shot(t.courant - 0.1, t.diesels - t.courant, LINE_IN, "sine.inOut", LINE.d);
  st(t.coupe, 0.3, { mains: 0 }, "power2.in");

  /* ── « les diesels de secours mettent environ une minute à démarrer. » — they shake, smoke, slowly ── */
  cut(t.diesels - 0.1, SET.CENTRALE, DIESELS, { ...L.diesels });
  shot(t.diesels - 0.1, t.turbine2 - t.diesels, DIESELS_IN, "sine.inOut", DIESELS.d);
  st(t.diesels + 0.25, t.demarrer + 0.5 - t.diesels, { diesel: 0.45 }, "sine.in");
  chip("chip-diesel", null, 96, 470, t.minute - 0.35, t.turbine2 - 0.3);

  /* ── « La turbine, en ralentissant, » — the checkered drum slows ── */
  cut(t.turbine2 - 0.1, SET.CENTRALE, TURB, { ...L.turbine, spin: 1, feed: 0, rotorT: t.turbine2 - 0.1 });
  shot(t.turbine2 - 0.1, t.pompes1 - 0.3 - (t.turbine2 - 0.1), TURB_CLOSE, "sine.inOut"); // ends on the cut: no held gap
  st(t.ralentissant, 1.4, { spin: 0.6 }, "sine.out");
  { // the drum's angle follows the same slowing, seek-safe (rotorT: seconds at full speed)
    const a = t.ralentissant, e = t.pompes1 - 0.3, r = Math.min(1.4, e - a);
    st(t.turbine2 - 0.1, a - (t.turbine2 - 0.1), { rotorT: a }, "none");
    st(a, r, { rotorT: a + r * 0.8 }, ramp(1, 0.6));
    if (e > a + r) st(a + r, e - a - r, { rotorT: a + r * 0.8 + 0.6 * (e - a - r) }, "none");
  }

  /* ── « peut-elle faire tourner les pompes pendant cette minute ? » — cut wide: generator → board → pumps, a slow pull ── */
  cut(t.pompes1 - 0.3, SET.CENTRALE, FEED_IN, { ...L.pumps, rotorT: -1 });
  shot(t.pompes1 - 0.3, t.toreport - (t.pompes1 - 0.3), FEED, "sine.inOut");
  st(t.pompes - 0.1, 0.6, { feed: 1 }, "power2.out");

  /* ── « Pour l'essai, on coupe le refroidissement de secours. » — the valve: green → red, the safety's green goes out ── */
  cut(t.toreport, SET.CENTRALE, ECCS, { ...L.eccs, ok: 1, fault: 0, spin: 1, flow: 1, mains: 1, diesel: 0, feed: 0 });
  shot(t.toreport, t.reseau - 0.1 - t.toreport, ECCS_IN, "sine.inOut", ECCS.d);
  st(t.coupe2, 0.2, { fault: 1 }, "power2.out");
  st(t.coupe2, 0.4, { ok: 0 }, "power2.out");
  feutre(D, { id: "feutre-vanne", anchor: world.centrale.A.fault, kind: "circle", w: 400, h: 340, dx: 0, dy: -10, from: t.refroid + 0.05, to: t.reseau - 0.35, draw: 0.42, seed: 3 });

  /* ── « Puis le réseau réclame du courant : tout est repoussé… à la nuit. » — the same line pulls; we follow it into the dark ── */
  cut(t.reseau - 0.1, SET.CENTRALE, LINE, { ...L.mains, ok: 0, fault: 0, mains: 0.15 });
  st(t.reclame, 0.4, { mains: 1 }, "power2.out");
  shot(t.repousse - 0.25, t.tot2 - (t.repousse - 0.25), NIGHT, "sine.inOut");
  st(t.repousse - 0.25, t.tot2 - (t.repousse - 0.25), { ...L.dark }, "sine.in");

  /* ── « 00 h 28. La puissance s'effondre : à peine un pour cent. » ── */
  cut(t.tot2, SET.COEUR, CORE_A, { ...STAGED.coeur, ...night, ok: 0, pLow: 0.5, pHigh: 0.5, rodsIn: 0.8, scram: 0 });
  shot(t.tot2, t.toxenon - t.tot2, CORE_A_IN, "sine.inOut", CORE_A.d);
  st(t.effondre, 0.6, { pLow: 0.03, pHigh: 0.03 }, "power2.in");
  chip("chip-1pct", null, 96, 470, t.peine - 0.1, t.toxenon - 0.3);

  /* ── « Le xénon, un gaz qui avale les neutrons, freine sa remontée. » — the fuel: grey grains eat the neutrons ── */
  cut(t.toxenon, SET.CANAL, FUEL, { ...STAGED.canal, ...L.fuel, ...night, ok: 0, flux: 1, rod: 0, steam: 0.2, pLow: 0.25, pHigh: 0.25 });
  shot(t.toxenon, t.tot3 - t.toxenon, FUEL_IN, "sine.inOut", FUEL.d);
  st(t.xenon, 0.4, { xenon: 0.3 }, "power2.out"); // the grains appear: the neutrons still run…
  st(t.avale - 0.1, 1.1, { xenon: 1 }, "sine.inOut"); // …« avale »: one by one they die in the grains
  st(t.xenon + 0.5, t.freine - t.xenon - 0.5, { pLow: 0.4, pHigh: 0.4 }, "sine.inOut"); // it wants to climb…
  st(t.freine, 0.5, { pLow: 0.08, pHigh: 0.08 }, "power2.in"); // …and falls back

  /* ── « 01 h 00. Pour le relancer, on retire des barres. Encore, et encore. » — the green rods come out, one gesture per word ── */
  cut(t.tot3, SET.COEUR, CORE_B, { ...STAGED.coeur, ...night, ok: 1, pLow: 0.03, pHigh: 0.03, rodsIn: 0.8, scram: 0 });
  shot(t.tot3, t.remonte - t.tot3, { ...CORE_B, d: 400 }, "sine.inOut", CORE_B.d);
  st(t.retire, 0.7, { rodsIn: 0.6 }, "power2.inOut");
  st(t.encore1, 0.4, { rodsIn: 0.45 }, "power2.inOut");
  st(t.etEncore + 0.08, 0.4, { rodsIn: 0.3 }, "power2.inOut");

  /* ── « Il remonte à six pour cent… avec très peu de barres dedans. » — the glow climbs; the dive onto the rods left ── */
  st(t.six - 0.1, 0.6, { pLow: 0.15, pHigh: 0.15 }, "power2.out");
  chip("chip-6pct", null, 96, 470, t.six - 0.1, t.tot4 - 0.35);
  shot(t.remonte, t.tot4 - t.remonte, RODS_FEW, "sine.inOut", 400);
  st(t.peu, 0.5, { rodsIn: 0.25 }, "power2.inOut");
}
