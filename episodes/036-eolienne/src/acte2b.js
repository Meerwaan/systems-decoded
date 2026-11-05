// 02 · AUTOPSIE (suite) — the principle and the rest (toprincipe → tozero).
//
// Act 2 leaves blade A's battery alone on the bench (VIEW.battery, heart 1). « Pourquoi ça marche ? » cuts to blade A
// itself, out in the scene, the rotor still and blade A level (rotor 0.25): its cross-section in the middle of the
// frame (seen dim from the cut), the hub far behind, out of focus; blade A's glass is faded (`blades` 0.4: its outer
// half passes in front of the section). « c'est une aile » — the section lights, the wind's filets curve round it;
// « de biais au vent » — the dial: the profile set across the wind, its needle at 0; « elle tire le rotor » — the
// pull's arrow grows and the rotor starts again: the section slides along the arrow and the camera goes with it.
// « En drapeau » — the profile turns 90° by « quatre-vingt-dix » (the header 0° → 90°), the needle with it: the
// arrow shrinks to nothing, the filets go straight; « l'aile ne porte plus » — the rotor stops pulling, the
// section stops sliding. « Une seule suffit à tout ralentir » cuts to the whole rotor from below: blade A a line by
// its edge, B and C still face on, and the rotor slows down at sight (the blur and the tips' trails die).
// The rest: « Par vent fort » cuts to the storm from far back on the road (the gusts, the rain) — the speed holds in
// the header while « Pales » steps by small touches on « pivotent ». « Ses batteries, elles, attendent » cuts to the
// top, on the bench (in the scene it was dark on dark): the three cabinets, dim, still. « Et quand le courant saute… » — the
// three pitch motors' bands go dark at once; « il ne reste qu'elles » — the three cabinets light, veille. Act 3 cuts
// from there, on the road.
import { SET, VIEW, STAGED, BENCHED, turnsOver, top, HUB, BLADE, SECTION } from "./world.js";

const TAU = Math.PI * 2;
/** The section's radius from the rotor axis (2390: the flange at 4100 − len, the section SECTION.y along the blade). */
const RS = 4100 - BLADE.len + SECTION.y;
/** Where blade A's section stands in the world for a rotor angle (blade A level at 0.25, going down as it turns). */
const sectionAt = (rotor) => {
  const f = TAU * (rotor - 0.25);
  return top(RS * Math.cos(f), HUB.at[1] - RS * Math.sin(f), HUB.at[2]);
};
const S0 = sectionAt(0.25);
/** The camera follows the sliding section most of the way: it is seen to slide (a little), it never leaves. */
const FOLLOW = 0.82;
const aimAt = (rotor) => {
  const p = sectionAt(rotor);
  return { tx: S0[0] + (p[0] - S0[0]) * FOLLOW, ty: S0[1] + (p[1] - S0[1]) * FOLLOW, tz: S0[2] + (p[2] - S0[2]) * FOLLOW };
};
const lightAt = (rotor) => {
  const p = sectionAt(rotor);
  return { fx: p[0], fy: p[1], fz: p[2] };
};

/* ── the poses ── */
const SEC = { ...VIEW.section, d: 1350, shift: 230 }; // along blade A from beyond its tip, its section in the middle (dof: the hub melts)
const SEC_IN = { ...SEC, d: 1200 }; // the slow push of « Pourquoi ça marche ? … de biais au vent »
const ROTOR = { ...VIEW.rotor };
const ROTOR_IN = { ...ROTOR, d: 12200 };
const ROAD = { ...VIEW.road, shift: -200 };
const ROAD_IN = { ...ROAD, ty: ROAD.ty + 1200, d: 11400, el: -20, side: 140 };
// the hub three-quarter front, the rotor turned a sixth: no root points at the lens, the three cabinets in sight
const TOP = { ...VIEW.system, d: 2150, az: VIEW.system.az + 15, el: 22, shift: 40 };
const TOP_IN = { ...TOP, d: 1900 };

/* ── the light ── */
const L_SEC = { ...lightAt(0.25), fs: 700 };
const L_ROTOR = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: STAGED.fs };

export default function acte2b({ D }) {
  const { st, shot, cut, chip, punch } = D;
  const t = D.times({
    toprincipe: "toprincipe", aile: "aile", biais: "biais", tire: "tire",
    drapeau: "drapeau", deg90a: "deg90a", porte: "porte", seule: "seule", ralentir: "ralentir",
    torepos: "torepos", pivotent: "pivotent", vitesse: "vitesse", batteries: "repos:batteries",
    saute2: "saute2", qelles: "qelles", tozero: "tozero",
  });

  // the calm of the principle and of the rest: the turbine producing, the grid alive, the motors fed, the batteries
  // waiting (dim), nothing threatens (mood 0)
  const calm = { ...STAGED, mood: 0, mains: 1, motors: 1, batt: 0.4, charge: 1 };

  /* ───────────── « Pourquoi ça marche ? » — blade A itself, level, the rotor still ───────────── */
  cut(t.toprincipe, SET.SCENE, SEC, {
    ...calm, storm: 0.3, blades: 0.4, rotor: 0.25, rpm: 0, pitchA: 0, pitchB: 0, pitchC: 0, flow: 0.25, lift: 0, gauge: 0, ...L_SEC,
  });
  shot(t.toprincipe, t.tire - t.toprincipe, SEC_IN, "sine.inOut");

  /* « Une pale, c'est une aile : » — the section (seen dim from the cut) lights, the filets come round it */
  st(t.aile - 0.06, 0.4, { flow: 1 }, "sine.out");
  /* « de biais au vent, » — the dial: the profile set across the wind, its needle at 0 */
  st(t.biais - 0.06, 0.35, { gauge: 1 }, "sine.out");

  /* « elle tire le rotor. » — the pull, and the rotor starts again: the section slides, the camera goes with it */
  st(t.tire - 0.04, 0.45, { lift: 1 }, "power2.out");
  const RPM = 0.8; // a slow start, the header ≈ 10 km/h
  const r0 = 0.25;
  const spin = 0.9; // seconds to reach RPM
  const r1 = r0 + turnsOver(0, RPM, spin);
  const tHold = t.tire + spin;
  const tCutSeule = t.seule - 0.3; // the cut sits in the breath before « Une seule »
  // the rotor eases off from « drapeau » (the pull dies as the profile turns): the section and the camera slow down
  // through the turn instead of sliding on at full speed, then stopping hard on « porte »
  const r2 = r1 + turnsOver(RPM, RPM, t.drapeau - tHold);
  const r3 = r2 + turnsOver(RPM, 0, tCutSeule - t.drapeau);
  st(t.tire, spin, { rpm: RPM }, "none");
  st(t.tire, spin, { rotor: r1, ...lightAt(r1) }, "power1.in");
  shot(t.tire, spin, { ...SEC_IN, ...aimAt(r1) }, "power1.in");
  st(tHold, t.drapeau - tHold, { rotor: r2, ...lightAt(r2) }, "none");
  shot(tHold, t.drapeau - tHold, { ...SEC_IN, ...aimAt(r2) }, "none");

  /* « En drapeau, tournée de quatre-vingt-dix degrés, » — the profile turns by its edge to the wind, the needle with it */
  // a slow turn (≈ 80°/s at most): from just before « drapeau » to the end of « quatre-vingt-dix », before the click (+0.66)
  const tFeather = t.drapeau - 0.2;
  st(tFeather, t.deg90a + 0.5 - tFeather, { pitchA: 90 }, "sine.inOut");

  /* « l'aile ne porte plus. » — no pull: the rotor stops, the section stops sliding */
  st(t.drapeau, tCutSeule - t.drapeau, { rpm: 0 }, "none");
  st(t.drapeau, tCutSeule - t.drapeau, { rotor: r3, ...lightAt(r3) }, "power1.out");
  shot(t.drapeau, tCutSeule - t.drapeau, { ...SEC_IN, ...aimAt(r3) }, "power1.out");

  /* ───────────── « Une seule suffit à tout ralentir. » — the whole rotor: A by its edge, and it slows down ───────────── */
  const q0 = 0.02; // blade A just past the top: a line, B and C face on
  const FAST = 12; // ≈ 185 km/h at the tips: ink (the calm scene never reaches signal)
  const SLOW = 4; // ≈ 60 km/h: the blur and the trails die
  const tSlowEnd = t.ralentir + 0.5;
  const q1 = q0 + turnsOver(FAST, FAST, t.seule - tCutSeule);
  const q2 = q1 + turnsOver(FAST, SLOW, tSlowEnd - t.seule);
  const q3 = q2 + turnsOver(SLOW, SLOW, t.torepos - tSlowEnd);
  cut(tCutSeule, SET.SCENE, ROTOR, {
    ...calm, storm: 0.3, rotor: q0, rpm: FAST, pitchA: 90, pitchB: 0, pitchC: 0, ...L_ROTOR,
  });
  shot(tCutSeule, t.torepos - tCutSeule, ROTOR_IN, "sine.inOut", ROTOR.d);
  st(tCutSeule, t.seule - tCutSeule, { rotor: q1 }, "none");
  st(t.seule, tSlowEnd - t.seule, { rpm: SLOW }, "none");
  st(t.seule, tSlowEnd - t.seule, { rotor: q2 }, "power1.out");
  st(tSlowEnd, t.torepos - tSlowEnd, { rotor: q3 }, "none");
  chip("chip-seule", null, 96, 470, t.seule + 0.05, t.torepos - 0.14);
  punch(t.ralentir, 0.06);

  /* ───────────── « Par vent fort, ses pales pivotent juste assez pour garder leur vitesse. » ───────────── */
  // the storm from far back on the road: the speed holds in the header, « Pales » steps by small touches
  const tCutTop = t.batteries - 0.3;
  const NOM = 12;
  const w0 = 0.11;
  const w1 = w0 + turnsOver(NOM, NOM, tCutTop - t.torepos);
  cut(t.torepos, SET.SCENE, ROAD, {
    ...calm, storm: 1, rotor: w0, rpm: NOM, pitchA: 4, pitchB: 4, pitchC: 4, ...L_ROTOR,
  });
  shot(t.torepos, tCutTop - t.torepos, ROAD_IN, "sine.inOut", ROAD.d);
  st(t.torepos, tCutTop - t.torepos, { rotor: w1 }, "none");
  const touch = (at, p) => st(at, 0.45, { pitchA: p, pitchB: p, pitchC: p }, "sine.inOut");
  touch(t.pivotent - 0.05, 10);
  touch(t.pivotent + 0.75, 7);
  touch(t.vitesse - 0.25, 12);

  /* ───────────── « Ses batteries, elles, attendent. » — the top on the bench: the three cabinets, dim, still ───────────── */
  // (in the scene the full blades of glass and the dark halo made it dark on dark: the bench's pool reads it; the
  // header keeps the story's speed, as on the rest of the bench)
  cut(tCutTop, SET.BENCH, TOP, {
    ...BENCHED, cover: 0.3, rotor: 1 / 6, rpm: NOM, pitchA: 12, pitchB: 12, pitchC: 12, mains: 1, motors: 1, batt: 0.4, charge: 1,
  });
  shot(tCutTop, t.tozero - tCutTop, TOP_IN, "sine.inOut", TOP.d);

  /* « Et quand le courant saute… » — the motors' bands go dark at once */
  st(t.saute2, 0.12, { motors: 0.2 }, "power2.out");
  /* « …il ne reste qu'elles. » — the three cabinets light */
  st(t.qelles - 0.05, 0.3, { batt: 1 }, "sine.out");
}
