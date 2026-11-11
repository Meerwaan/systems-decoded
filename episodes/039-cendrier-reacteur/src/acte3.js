// 03 · RÉPONSE — from « La porte fusible cède. » to « Et le recouvre. » (tozero → toverdict). The climax.
// PLAN-SÉQUENCE (06/11, validated by Merwan for this film): three cuts left (the channel, « minutes », « Et le
// recouvre »); between them the camera never stops (D.path, keys 6 to 15° apart). The trigger breaking is no longer
// cut on: the camera that rose over the sea dives on to it and the contact comes into the frame.
// Formerly: in cuts, one shot per breath; every cut is laid a few frames before its sentence, its pose is complete and so is its
// state (built on STAGED): nothing is inherited from the act before, nothing from the shot before.
//
// The story, in the voice's order and no other (a reconstitution: it never happened on an EPR):
//   · the pit, from outside through the cut wedge of its wall: the full bath, the stream still falling from the red
//     belly, the plug the hot ring at its centre — on « cède » it sags (`plug` → 1) and the bath starts to swirl down;
//   · cut in the direction of the flow: the channel from above, the tongue comes out from under the pit at the top of
//     the frame on « s'engouffre » and runs down at us; the camera follows it out over the chamber's mouth (« chambre »);
//   · the same move goes on, by ratio, up over the whole chamber while the orange sea spreads toward us (« s'étale »,
//     « en quelques dizaines de secondes »); everything stops on « mince » (the header: T+00:30);
//   · cut: a valve and its trigger in one frame, from the chamber's side — the sheet's edge reaches the trigger, it
//     breaks, the lever lifts on « s'ouvrent »; « seules » in the top slot;
//   · cut: the pool and the chamber in one frame — minutes pass (the crust darkens, the header runs to the minutes),
//     then the camera goes down with the water (« descend », « sans pompe ») to the chamber, and on « recouvre » the
//     water closes over it: the light turns veille, the system's rim lights, the header reads « Sous l'eau ».
import { setAct } from "@kit/overlay.js";
import { SET, STAGED } from "./world.js";

/* ── the poses (found with `look`, planches in .cache/planches/039/acte3/) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the pit from outside, through the wedge cut in its wall: the bath round, the stream from the belly above it
const PIT0 = { ...P, tx: 0, ty: 60, tz: 0, d: 1500, az: -40, el: 40, fov: 34, shift: 40 };
// the channel from above: the pit's floor hides its first 3.6 m — the tongue comes out at the top of the frame
const CH0 = { ...P, tx: 0, ty: -310, tz: 520, d: 800, az: -28, el: 58, fov: 40, shift: -60 };
// out over the chamber's mouth: the first fan of melt on the empty slab
const MOUTH = { ...P, tx: 0, ty: -330, tz: 1000, d: 1400, az: -22, el: 45, fov: 38, shift: 0 };
// the whole chamber from above at its far end: the sea comes at us
const SHEET = { ...P, tx: 0, ty: -330, tz: 1600, d: 3300, az: -22, el: 52, fov: 38, shift: 0 };
// a valve and its trigger in one frame: the trigger low on the left by the sheet's edge, the valve high in the middle
// (under the top slot's chip), its pipe going down
const VALVE0 = { ...P, tx: 650, ty: -220, tz: 1900, d: 1200, az: -24, el: 36, fov: 30, shift: -330, dof: 8 }; // the lever clears chip-vannes
// « il dort » again (act 2b's frame, grazing the slab), now under the orange sea: minutes pass, the crust darkens
const GRAZE0 = { ...P, tx: 0, ty: -330, tz: 1700, d: 2200, az: -24, el: 12, fov: 34, shift: 150 };
// the open valves' pipes going down, then under the chamber's far end: the heads run down them, into the central
// channel, then the ribs and the slots fill — the camera goes down with the heads (PIPE → PIPE1)
const PIPE = { ...P, tx: 420, ty: -250, tz: 2300, d: 1500, az: -30, el: 16, fov: 34, shift: -150 };
const PIPE1 = { ...PIPE, tx: 390, ty: -390, d: 1450, shift: 0 };
// down with the water, back over the chamber: the same frame as the spreading, a little closer
const COVER0 = { ...SHEET, d: 3000 };
const COVER1 = { ...SHEET, d: 2850 };

/* ── the light: what it stands around, and how wide ── */
const L_PIT = { fx: 0, fy: 60, fz: 0, fs: 600 };
const L_CH = { fx: 0, fy: -310, fz: 560, fs: 500 };
const L_SHEET = { fx: 0, fy: -330, fz: 1600, fs: 1500 };
const L_VALVE = { fx: 580, fy: -230, fz: 1900, fs: 400 };
const L_PIPE = { fx: 350, fy: -380, fz: 2250, fs: 900 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, cut, chip, punch, path, jolt } = D;
  const t = D.times({
    tozero: "tozero", cede: "cede",
    tochannel: "cede+0.47", engouffre: "engouffre", droit: "droit", chambre: "zero:chambre",
    etale2: "etale2", secondes: "secondes", mer: "mer", mince: "mince",
    tovalve: "trigger-0.15", trigger: "trigger", ouvrent: "trigger+0.33", seules: "seules",
    tominutes: "minutes-0.54", minutes: "minutes", todescend: "descend-0.32", descend: "descend", sans: "descend+0.6", pompe: "descend+0.76", tocover: "recouvre-0.28", et: "recouvre-0.2",
    recouvre: "recouvre", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /* ── « La porte fusible cède. » — the pit, full; the plug gives on the word ── */
  const MELT = { belly: 0.6, breach: 0.6, pour: 1, eaten: 0.9 };
  cut(t.tozero, SET.PLANT, PIT0, { ...STAGED, ...MELT, ...L_PIT, pit: 1, fume: 0.6, plug: 0.5, litPlug: 0.4, mood: 1 });
  path([[t.tozero, PIT0], [t.cede, { d: 1430, az: -46, el: 42 }], [t.tochannel, { d: 1370, az: -53, el: 45 }]]); // orbit while it gives
  punch(t.cede, 0.06);
  st(t.cede, 0.42, { plug: 1, litPlug: 0 }, "power2.in"); // it sags, melts, opens (the impact sound at cede + 0.42)
  st(t.cede + 0.22, span(t.cede + 0.22, t.tochannel), { flow: 0.2 }, "sine.in"); // the bath starts to swirl down
  st(t.cede + 0.3, 1.2, { pit: 0.85 }, "sine.inOut");

  /* ── « Le cœur fondu s'engouffre dans le canal. Droit vers la chambre. » — cut in the direction of the flow ── */
  cut(t.tochannel, SET.PLANT, CH0, { ...STAGED, ...MELT, ...L_CH, pit: 0.82, fume: 0.4, plug: 1, flow: 0.24, mood: 1 });
  st(t.tochannel, span(t.tochannel, t.engouffre), { flow: 0.52 }, "sine.in"); // still under the pit's floor
  st(t.engouffre, span(t.engouffre, t.chambre - 0.1), { flow: 1 }, "none"); // the tongue runs down at us, straight
  st(t.tochannel, span(t.tochannel, t.mince), { pit: 0.45 }, "sine.inOut"); // the pit empties into it
  // ONE move from here to « minutes »: down the channel with the head, out over the mouth, up over the whole sea as it
  // spreads, round it, then a dive on to the trigger at the sheet's edge — it breaks in the frame, the lever lifts
  path([
    [t.tochannel, CH0],
    [t.engouffre, { ty: -315, tz: 500, az: -36, el: 61 }], // looking back up the channel: the head comes out
    [t.droit, { ty: -325, tz: 740, d: 950, az: -29, el: 55 }],
    [t.chambre, { ...MOUTH, tz: 1000, d: 1350, az: -20, el: 47 }],
    [t.etale2, { tz: 1200, d: 1900, az: -14, el: 50 }],
    [t.secondes, { tz: 1500, d: 2900, az: -22, el: 55 }],
    [t.mer, { tz: 1600, d: 3200, az: -31, el: 51 }],
    [t.mince, { tx: 250, ty: -300, tz: 1720, d: 2300, az: -30, el: 45, fov: 34, shift: -150 }],
    // the break seen whole: the sheet's edge, the trigger and the valve in one frame, still closing in
    [t.trigger, { tx: 560, ty: -255, tz: 1825, d: 1300, az: -28, el: 40, fov: 31, shift: -250, dof: 4 }],
    [t.ouvrent, VALVE0], // the lever lifts, clear under chip-vannes
    [t.seules, { d: 1110, az: -19, el: 33 }],
    [t.tominutes, { d: 1070, az: -17, el: 29 }], // past az −16 the next valve's lever comes in at the bottom right
  ]);
  st(t.chambre - 0.05, 0.3, { litChamber: 0.5 }, "sine.out");
  st(t.chambre - 0.1, span(t.chambre - 0.1, t.etale2), { mass: 0.14, spread: 0.08 }, "sine.out"); // the first fan

  /* ── « Il s'étale. En quelques dizaines de secondes. Une mer orange, mince. » — up over the whole chamber ── */
  punch(t.etale2, 0.06);
  st(t.etale2, span(t.etale2, t.mince), { mass: 1, spread: 0.95 }, "sine.out"); // fast, then it stops on « mince »
  st(t.etale2 + 0.2, 0.8, { litChamber: 0 }, "sine.inOut");

  /* ── « Les vannes s'ouvrent… seules. » — cut: the sheet's edge on the trigger; the lever lifts ── */
  const SPREAD = { ...STAGED, ...MELT, pit: 0.45, fume: 0.3, plug: 1, flow: 1, mass: 1, mood: 1 };
  // (no cut any more: the dive brings the valve's light with it)
  st(t.mince, span(t.mince, t.tovalve), { ...L_VALVE, fume: 0.3, litValves: 0.5 }, "sine.inOut");
  st(t.tovalve + 0.04, span(t.tovalve + 0.04, t.trigger + 0.12), { spread: 1 }, "sine.out");
  st(t.trigger - 0.06, 0.32, { triggers: 1 }, "power2.out");
  jolt(t.trigger + 0.04, 0.5); // the camera takes the break
  st(t.ouvrent, 0.5, { valves: 1, litValves: 1 }, "power2.out");
  chip("chip-vannes", null, 96, 470, t.ouvrent, t.tominutes - 0.2);

  /* ── « Plusieurs minutes passent. » — cut: the slab of « il dort », under the sea; the header runs to the minutes ── */
  const OPEN = { ...SPREAD, spread: 1, triggers: 1, valves: 1 };
  cut(t.tominutes, SET.PLANT, GRAZE0, { ...OPEN, ...L_SHEET, fume: 0.15 });
  path([[t.tominutes, GRAZE0], [t.minutes, { az: -30, el: 13 }], [t.todescend, { d: 2050, az: -18, el: 15 }]]); // a glide along the sea
  st(t.tominutes, span(t.tominutes, t.todescend), { cool: 0.22 }, "sine.inOut");

  /* ── « L'eau descend, sans pompe. » — cut: the open valve's pipe, the water's heads run down; then down with it ── */
  cut(t.todescend, SET.PLANT, { ...PIPE, az: -38 }, { ...OPEN, ...L_PIPE, cool: 0.22, fume: 0.15, litValves: 0.6 });
  st(t.todescend, span(t.todescend, t.sans - 0.05), { water: 0.25 }, "sine.in"); // the heads, down to the channel's end
  st(t.sans - 0.05, span(t.sans - 0.05, t.tocover), { water: 0.8 }, "sine.inOut"); // the central channel, ribs, slots
  path([[t.todescend, { ...PIPE, az: -38 }], [t.sans, { tx: 400, ty: -330, d: 1470, az: -31, el: 15, shift: -60 }], [t.tocover, { ...PIPE1, az: -24, el: 14 }]]); // down with the heads
  chip("chip-pompe", null, 96, 470, t.pompe, t.recouvre + 0.3);
  // « Et le recouvre »: cut a few frames before « Et » to the whole chamber; the water closes over the sheet
  cut(t.tocover, SET.PLANT, { ...COVER0, d: 3150, az: -32, el: 57 }, { ...OPEN, ...L_SHEET, cool: 0.22, fume: 0.15, litValves: 0, water: 0.8 });
  path([[t.tocover, { ...COVER0, d: 3150, az: -32, el: 57 }], [t.toverdict, COVER1]]); // round the chamber, onto act 4's pose
  st(t.et, 0.5, { water: 1 }, "sine.inOut"); // ≥ 0.95 right after « recouvre »: the header reads « Sous l'eau »
  st(t.recouvre - 0.1, 0.5, { steam: 1 }, "sine.out");
  st(t.recouvre + 0.4, span(t.recouvre + 0.4, t.toverdict), { steam: 0.5 }, "sine.inOut");
  st(t.recouvre - 0.1, span(t.recouvre - 0.1, t.toverdict), { cool: 0.6 }, "sine.out");
  st(t.recouvre, 0.4, { mood: 0 }, "sine.inOut");
  st(t.recouvre, 0.5, { guard: 1 }, "sine.out");
  punch(t.recouvre, 0.06);
}
