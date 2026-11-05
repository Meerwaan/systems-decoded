// DOSSIER 036 — the fall, what the film still owes, the like, the next file, the loop (toverdict → the end).
//   chute        at the top, after the storm (rpm 3, the three blades feathered, mood 0): « pas un frein » — the brake's
//                caliper lights ink, cold · « Ni la batterie » — the three cabinets, their green dies down · « C'est le
//                vent qu'elle lâche » — VIEW.feather: the wind's filets slide past the feathered blades (slip). retitle:
//                « Un frein » struck on « pas », « Le vent lâché » on « vent »; the account name lights on « pas »
//   commentaire  « Et si la batterie a vieilli ? » — blade A's cabinet, its gauge falls to a third, signal · Formerie,
//                a reconstitution (gel, mood 1): the tower in profile, the blades left producing, the rotor running up ·
//                « Le mât a plié en deux » — the upper half folds away from the road · the question, as a duel: the
//                turbine at rest in the storm, under the panel — the film never answers
//   like         another day, inside the tower: the technician climbs the ladder toward the green cabinets
//   abonnement   the turbine at rest, wide, under the next file (nothing of the parachute in 3D)
//   boucle       a cut to the first frame, the lens a little wider: it leans in at the speed the hook leans in, and the
//                rotor turns at 11 tr/min the whole way — the last frame IS the first (D.loop, ease "none")
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, POSE0, turnsOver } from "./world.js";

/* ── the light: what it stands around, and its size ── */
const L = (p, fs) => ({ fx: p.tx, fy: p.ty, fz: p.tz, fs });

/* ── the poses ── */
// the nacelle through its cleared cover, between the hub and the brake: the shaft, the hub, the green cabinets — the
// brake's caliper (VIEW.brake alone reads as a dark mass at 270 px) and the batteries in ONE frame, two negations
const BRAKE = VIEW.brake;
const SYS = VIEW.system;
const NACELLE = { ...SYS, tx: (SYS.tx + BRAKE.tx) / 2, ty: (SYS.ty + BRAKE.ty) / 2, tz: (SYS.tz + BRAKE.tz) / 2, d: 2600, az: SYS.az + 10, el: 25, fov: 28, shift: -40 };
const NACELLE_IN = { ...NACELLE, d: 2300, az: NACELLE.az + 8 };
// the fall: the rotor feathered, close enough for the filets that slide past the blades
const FEATHER = { ...VIEW.feather, d: 7000, shift: -60 };
const FEATHER_IN = { ...FEATHER, d: 6500 };
const CELL = VIEW.battery;
const CELL_IN = { ...CELL, d: CELL.d * 0.92 };
// Formerie: the whole turbine from the field — FOLD.toward is 60, so from VIEW.wide (az −30) the fold is seen in profile
// (VIEW.fold, az 60, has it falling at the camera); further back and lower, the rotor clear of the header and the chips
const FOLDV = { ...VIEW.wide, d: 30000, shift: -150 };
const FOLD_IN = { ...FOLDV, d: 28500 };
// the question: the rotor at rest in the storm, big, its three blades edge-on, under the duel panel
const ASK = { ...VIEW.rotor, d: 16000, shift: -170 };
const ASK_IN = { ...ASK, d: 15200 };
// the like: inside the tower, the camera rides with the technician (VIEW.ladder: ty = 12 + tech × 7298 + 330)
const CLIMB = (tech) => ({ ...VIEW.ladder, ty: 12 + tech * 7298 + 330 });
// the next file: the turbine at rest, under the panel
const REST = { ...VIEW.wide, az: -40, shift: -400 };
const REST_IN = { ...REST, d: REST.d * 0.93, az: -34 };

// the rotor's angle grows with rpm: a ramp of rpm is a quadratic angle (u: 0 → 1 of the move)
const spin = (r0, r1) => (u) => (r0 * u + 0.5 * (r1 - r0) * u * u) / (0.5 * (r0 + r1));

export default function fin({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", pas: "verdict", frein: "frein", batt: "chute:batterie",
    cest: "chute:C'est", ventlache: "ventlache",
    tocta: "tocta", vieilli: "vieilli2", formerie: "formerie", tiers: "tiers", plie: "plie", plieDeux: "plieDeux",
    commentaire: "commentaire", panne: "panne", securite: "securite",
    tolike: "tolike", like: "like", likeEnd: "likeEnd", toabo: "toabo", abo: "abo", prochain: "prochain", boitier: "boitier",
    aboEnd: "aboEnd", toloop: "toloop", rewind: "rewind",
  });
  const tovent = t.cest - 0.12;
  const toform = t.formerie - 0.15;
  const toask = t.commentaire - 0.3;

  let R = 0; // the rotor, in turns: it carries on across the cuts
  const turn = (at, dur, rpm0, rpm1 = rpm0) => {
    R += turnsOver(rpm0, rpm1, dur);
    st(at, dur, { rotor: R }, rpm0 === rpm1 ? "none" : spin(rpm0, rpm1));
    if (rpm0 !== rpm1) st(at, dur, { rpm: rpm1 }, "none");
  };
  // after the storm: the three blades feathered, the rotor at a few turns a minute, the grid still down
  const AFTER = { ...STAGED, rpm: 3, pitchA: 90, pitchB: 90, pitchC: 90, mains: 0, motors: 0, batt: 0, charge: 1, mood: 0 };

  /* ══ CHUTE ══ */
  /* « Voilà le secret : ce n'est *pas* un frein qui la ralentit. » — the brake, cold */
  cut(t.toverdict, SET.SCENE, NACELLE, { ...AFTER, ...L(NACELLE, 1500), cover: 0.3, batt: 1, motors: 1, rotor: R });
  shot(t.toverdict, tovent - t.toverdict, NACELLE_IN, "sine.inOut");
  turn(t.toverdict, tovent - t.toverdict, 3);
  st(t.frein - 0.08, 0.3, { litBrake: 1 }, "power2.out");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.pas, swapAt: t.ventlache - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  punch(t.pas, 0.06);

  /* « Ni la batterie. » — the same frame: the cabinets' green dies down, their effort is over */
  st(t.batt - 0.05, 0.45, { batt: 0.2, motors: 0 }, "power2.inOut");

  /* « C'est le +vent+ qu'elle lâche. » — the filets slide past the feathered blades and push nothing */
  cut(tovent, SET.SCENE, FEATHER, { ...AFTER, batt: 0.2, rotor: R, ...L(VIEW.rotor, 6000) });
  shot(tovent, t.tocta - tovent, FEATHER_IN, "sine.inOut");
  turn(tovent, t.tocta - tovent, 3);
  st(t.ventlache - 0.12, 0.7, { slip: 1 }, "power2.out");

  /* ══ CE QUI EST DÛ ══ */
  /* « Et si la batterie a vieilli ? » — blade A's cabinet: its gauge falls to a third, signal */
  // (the pose is blade A's cabinet at rotor 0: the hub turns through it, at 3 tr/min, the cabinet framed on « vieilli »)
  const half = turnsOver(3, 3, toform - t.tocta) / 2;
  cut(t.tocta, SET.SCENE, CELL, { ...AFTER, ...L(CELL, 400), cover: 0.3, storm: 0.6, batt: 1, rotor: -half });
  shot(t.tocta, toform - t.tocta, CELL_IN, "sine.inOut");
  st(t.tocta, toform - t.tocta, { rotor: half }, "none");
  st(t.vieilli - 0.05, 0.5, { charge: 0.33 }, "power2.inOut");

  /* « Formerie, deux mille dix-neuf : batteries au tiers de leur capacité. » — a reconstitution: the blades left
     producing, the rotor running up · « Le mât a plié en *deux*. » — the upper half folds, away from the road */
  cut(toform, SET.SCENE, FOLDV, { ...STAGED, rotor: R, rpm: 11, pitchA: 0, pitchB: 0, pitchC: 0, mains: 0, motors: 0, batt: 0, charge: 0.33, mood: 1, gel: 0.25 });
  shot(toform, toask - toform, FOLD_IN, "sine.inOut");
  turn(toform, t.tiers - toform, 11, 14);
  turn(t.tiers, toask - t.tiers, 14);
  chip("chip-aria", null, 96, 470, t.formerie, t.tiers - 0.25);
  chip("chip-tiers", null, 96, 470, t.tiers, toask - 0.2);
  st(t.plie - 0.05, t.plieDeux + 0.05 - (t.plie - 0.05), { fold: 1 }, "power2.in");
  punch(t.plieDeux, 0.06, { hold: 0.08, down: 0.25 });

  /* « En commentaire : une éolienne à l'arrêt par grand vent… panne, ou sécurité ? » — the turbine at rest in the storm */
  cut(toask, SET.SCENE, ASK, { ...AFTER, rotor: R, batt: 0, gel: 0, fold: 0 });
  shot(toask, t.tolike - toask, ASK_IN, "sine.inOut");
  turn(toask, t.tolike - toask, 3);
  duelCall(tl, { from: toask + 0.1, word: t.commentaire, aAt: t.panne, bAt: t.securite, to: t.tolike - 0.32, toneA: "signal", toneB: "veille" });

  /* ══ LIKE ══ « +Like+ : pour ceux qui grimpent là-haut tester ces batteries. » — inside the tower, the climb */
  const up0 = 0.45, up1 = 0.55;
  cut(t.tolike, SET.SCENE, CLIMB(up0), { ...AFTER, ...L(CLIMB(0.5), 2000), rotor: R, mains: 1, storm: 0.3, batt: 1, tech: up0 });
  shot(t.tolike, t.toabo - t.tolike, CLIMB(up1), "none");
  st(t.tolike, t.toabo - t.tolike, { tech: up1 }, "none");
  turn(t.tolike, t.toabo - t.tolike, 3);
  likeCall(tl, { from: t.like, to: Math.min(t.likeEnd + 0.12, t.toabo - 0.3), count: 5, label: (n) => `${n} personnes` });

  /* ══ ABONNEMENT ══ « +Abonne-toi+ : prochain dossier, un boîtier qui déclenche ton parachute à ta place… » */
  cut(t.toabo, SET.SCENE, REST, { ...AFTER, rotor: R, mains: 1, storm: 0.3 });
  shot(t.toabo, t.toloop - t.toabo, REST_IN, "sine.inOut");
  turn(t.toabo, t.toloop - t.toabo, 3);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.boitier - 0.1, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ══ BOUCLE ══ « Seul, comme une éolienne en pleine… » — the first frame, the lens a little wider: it leans in at the
     speed the hook leans in (acte1: fov 82 → 78, shift 120 → 170 in sine.out over its first move) and never stops */
  const tEnd = D.tEnd;
  const lean = (dt) => ({ ...POSE0, fov: POSE0.fov + 1.07 * dt, shift: POSE0.shift - 13.3 * dt });
  const first = Object.fromEntries(Object.entries(D.first).filter(([k, v]) => typeof v === "number" && k !== "set"));
  // the rotor at 11 tr/min the whole way, landing on FIRST.rotor on the last frame
  cut(t.toloop, D.first.set, lean(tEnd - t.toloop), { ...first, rotor: D.first.rotor - turnsOver(11, 11, tEnd - t.toloop) });
  shot(t.toloop, t.rewind - t.toloop, lean(tEnd - t.rewind), "none");
  st(t.toloop, t.rewind - t.toloop, { rotor: D.first.rotor - turnsOver(11, 11, tEnd - t.rewind) }, "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, ease: "none" });
}
