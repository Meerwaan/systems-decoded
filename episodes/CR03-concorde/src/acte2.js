// CR03 — acte2.js · reservoir → t2 (toreservoir → tot3): the wing tanks, « 4 kilos par seconde »; 16:42:31 the top, the strip;
// 16:43:03 V1. Three places, each ONE move (D.path, launched at both ends), each opened by a cut a few frames before its sentence:
//   A  toreservoir → tot1   cut (the aircraft seen from above → seen from below): in the air, an explanation shot. A slow orbit
//                           under the left wing, « ailes » the tanks green, « roues » tank 5 circled; « Six fois » the dive toward
//                           tank 5 (one move, the angle turning all along), « percé » it turns red and a thread of kerosene drips
//                           (leak 0.08, the 1979 case), « pire » the flow gauge, « 4 » the needle, « seconde » the mark; « Retiens »
//                           the camera keeps closing on the drip.
//   B  tot1 → tot2          cut (the aircraft from below → the aircraft at the threshold, ahead of it): « Top » the four nozzles
//                           light, it rolls; the camera turns round it to its rear (the nozzles), then the run down the runway:
//                           it rises, aims at the strip 8 000 further, and dives onto it — « lamelle » it is there, « titane » red
//                           and circled, « 43 » the rule unrolls to its length.
//   C  tot2 → tot3          cut (the strip on the ground → the V1 line on the ground), from behind it: the green stopping bar runs
//                           to the end of the runway; its nose gear on the line ON « V1 », the bar turns red by itself;
//                           « non-retour » the camera rises behind it: the whole red bar down the runway.
// Hands over at tot3 (acte2b cuts to tyre 2): piste, run ≈ 6 700, v1 1, stop 1, ruler 1, culprit 0.
import { feutre } from "@kit/reconstitution.js";
import { STAGED, SET, VIEW, onPlane, lit } from "./world.js";
import { STRIP } from "./plan.js";

/** The aircraft under the wing (an explanation, not the story): high enough that the camera below stays above the ground. */
const DESS = { run: 16000, alt: 1400, pitch: 6, bank: 0 };
const aim = ([tx, ty, tz]) => ({ tx, ty, tz });
/** What every cut to the runway says (nothing inherited from the act before). */
const CLEAN = {
  culprit: 0, fault: 0, ok: 0, depuis: 0, gauge: 0, debit: 0, mark: 0,
  burst: 0, chunk: 0, surge: 0, cutaway: 0, tear: 0, leak: 0, fire: 0,
  stop: 0, v1: 0, ruler: 0, found: 0, soot: 0, traj: 0, bourget: 0, inspect: 0,
};

export default function acte2({ D, world }) {
  const { st, cut, path, punch, chip } = D;
  const t = D.times({
    toreservoir: "toreservoir", ailes: "reservoir:ailes", roues: "reservoir:roues", six: "reservoir:Six", perce: "reservoir:percé",
    pire: "reservoir:pire", quatre: "quatre1", seconde: "reservoir:seconde", retiens: "retiens",
    tot1: "tot1", top: "top", bord: "t1:109", sur: "t1:Sur", lamelle: "lamelle1", titane: "t1:titane", cm43: "t1:43",
    cm: "t1:centimètres", tot2: "tot2", vdeux: "vdeux", nonretour: "t2:non", tot3: "tot3",
  });

  /* ───────────── A · « Et ton kérosène ? » — under the left wing, in the air ───────────── */
  const MID = aim(onPlane(DESS, [20, 16, 6])); // the whole aircraft, its delta seen from below: the wing tanks and the gear
  const TANK = aim(onPlane(DESS, [-12, 6, 16])); // tank 5's panel in the upper third, the drip below it
  const WIDE = { ...VIEW.dessous, ...MID, d: 1200, az: 35, el: -55, fov: 32, shift: 0 };
  cut(t.toreservoir, SET.PISTE, WIDE, {
    ...STAGED.piste, ...lit(onPlane(DESS, [20, 16, 6]), 200), ...CLEAN, ...DESS, n1: 1, n2: 1, n3: 1, n4: 1, gear: 1,
  });
  path([
    [t.toreservoir, WIDE],
    [t.ailes - 0.12, { az: 29, el: -54, d: 1120 }],
  ]);
  // retouche 13/11: « ailes » a cut to the left wing (the 21.5–24 s stretch was still), then the move toward tank 5;
  // from « percé » the camera stops closing in (the slabs filled the frame) and the other tanks go dark: tank 5 alone
  const WING = { ...VIEW.dessous, ...aim(onPlane(DESS, [2, 10, 12])), d: 660, az: 18, el: -50, fov: 32, shift: 0, side: 70 };
  cut(t.ailes - 0.1, null, WING, {});
  path([
    [t.ailes - 0.1, WING],
    [t.six, { az: 8, el: -48, d: 580, side: 45 }],
    [t.six + 1.35, { ...TANK, az: -18, el: -42, d: 360, side: 0, shift: -70 }],
    [t.perce, { az: -34, el: -38, d: 270, shift: -130 }], // tank 5 below the gauge
    [t.quatre, { az: -42, el: -36, d: 250 }],
    [t.retiens, { az: -48, el: -35, d: 240 }],
    [t.tot1 - 0.02, { az: -52, el: -34, d: 236 }],
  ]);
  st(t.six + 0.6, 1.6, lit(onPlane(DESS, [-12, 4, 16]), 70), "sine.inOut"); // the light closes in with the camera
  // « ailes »: the wing tanks light green · « roues »: tank 5, right above the gear, circled
  st(t.ailes, 0.35, { ok: 1 }, "power2.out");
  feutre(D, { id: "feutre-a2-tank5", anchor: world.concorde.A.tank5, w: 230, h: 140, from: t.roues, to: t.six + 0.85, seed: 3 });
  chip("chip-six", null, 96, 470, t.six - 0.1, t.pire - 0.2);
  // « percé »: tank 5 red, a thin drip from a small hole (the 1979 case: not the 60 kg/s jet)
  st(t.perce, 0.12, { culprit: 2, fault: 1 }, "power2.out");
  st(t.perce, 0.3, { ok: 0 }, "power2.out"); // the green tanks go dark: one subject, tank 5
  st(t.perce, 0.9, { leak: 0.08 }, "power2.out");
  punch(t.perce, 0.06);
  // « Le pire cas : 4 kilos par seconde »: the gauge, the needle to 4, the mark 4 lit and kept
  st(t.pire - 0.05, 0.3, { gauge: 1 }, "power2.out");
  st(t.pire + 0.1, t.quatre - t.pire - 0.1, { debit: 4 }, "power2.out");
  punch(t.quatre, 0.06);
  st(t.seconde, 0.25, { mark: 1 }, "power2.out");
  st(t.tot1 - 0.12, 0.1, { gauge: 0 }, "power2.in");

  /* ───────────── B · 16:42:31 — the top, then the run down the runway to the strip ───────────── */
  const R0 = { run: 0, alt: 0, pitch: 0, bank: 0 };
  const R1 = { run: 600, alt: 0, pitch: 0, bank: 0 };
  const DEP = { ...VIEW.depart, ...aim(onPlane(R0, [55, 20, 0])), d: 620, az: 64, el: 9, side: 90 }; // rear-left three-quarter: the four nozzles, clear of the buttons
  cut(t.tot1, SET.PISTE, DEP, {
    ...STAGED.piste, ...lit(onPlane(R0, [0, 20, 0]), 170), ...CLEAN, ...R0, n1: 0.3, n2: 0.3, n3: 0.3, n4: 0.3, gear: 1,
  });
  // « Top »: full reheat, the four nozzles light; it starts rolling
  st(t.top, 0.45, { n1: 1, n2: 1, n3: 1, n4: 1 }, "power2.out");
  punch(t.top, 0.06);
  const SUR = t.sur - 0.1; // retouche 13/11: a cut onto the strip replaces the rise-and-dive (heurt 35,1 · stray frames 37,6–39)
  st(t.top, SUR - t.top, { run: R1.run, ...lit(onPlane(R1, [0, 20, 0]), 170) }, "power1.in");
  st(SUR, t.tot2 - SUR, { run: R1.run + 430 * (t.tot2 - SUR) }, "none"); // it keeps rolling, out of frame; ends before C sets it
  chip("chip-bord", null, 96, 470, t.bord - 0.1, t.sur - 0.1);
  path([
    [t.tot1, DEP],
    [t.top, { az: 68, el: 9, d: 610 }],
    [t.bord, { ...aim(onPlane({ ...R1, run: 210 }, [55, 20, 0])), az: 72, el: 9, d: 600 }],
    [SUR - 0.02, { ...aim(onPlane(R1, [60, 20, 0])), az: 75, el: 10, d: 585 }],
  ]);
  // the strip, from above (no far runway in frame: its stripes shimmered at a grazing angle), a slow push onto it
  const STR = aim([STRIP.at[0], 0.4, STRIP.at[2]]);
  const STRV = { ...STR, d: 34, az: 74, el: 52, fov: 30, shift: 40, side: 0, dof: 0 };
  cut(SUR, null, STRV, lit([STRIP.at[0], 0.4, STRIP.at[2]], 60));
  st(t.sur, t.lamelle - t.sur, lit([STRIP.at[0], 0.4, STRIP.at[2]], 22), "sine.inOut");
  path([
    [SUR, STRV],
    [t.lamelle, { az: 70, el: 50, d: 22 }],
    [t.cm, { az: 66, el: 49, d: 20 }],
    [t.tot2 - 0.02, { az: 64, el: 48, d: 20 }],
  ]);
  // « titane »: the strip red, circled · « 43 centimètres »: the rule unrolls to its length
  st(t.titane, 0.12, { culprit: 1, fault: 1 }, "power2.out");
  punch(t.titane, 0.06);
  feutre(D, { id: "feutre-a2-strip", anchor: world.piste.A.strip, w: 560, h: 300, from: t.titane, to: t.tot2 - 0.15, seed: 5 });
  st(t.cm43, t.cm - t.cm43 + 0.35, { ruler: 1 }, "power1.out");

  /* ───────────── C · 16:43:03 — V1: the nose gear on the line, the bar turns red ───────────── */
  // From behind it, on its left, the camera riding with it: the line across the runway ahead, and the stopping bar (green: it can
  // still stop) running from its main gear toward the far end. Its nose gear reaches the line ON « V1 » — and
  // by construction (plan.js STOP) the bar's tip passes the end of the runway at that very instant: it turns red by itself.
  // « non-retour »: the camera rises behind it, the whole red bar down the runway (the view of the rule, principe).
  const at = (run) => ({ run, alt: 0, pitch: 0, bank: 0 });
  const V = { ...VIEW.v1, ...aim(onPlane(at(5500), [-60, 12, 0])), d: 360, az: 50, el: 12, shift: 60, side: 0 };
  cut(t.tot2, SET.PISTE, V, {
    ...STAGED.piste, ...lit(onPlane(at(5500), [-60, 10, 0]), 240), ...CLEAN, run: 5500, alt: 0, pitch: 0, bank: 0,
    n1: 1, n2: 1, n3: 1, n4: 1, gear: 1, v1: 1, stop: 1, ruler: 1,
  });
  const vRate = 700 / (t.vdeux - t.tot2); // ≈ 270 per second, steady
  st(t.tot2, t.vdeux - t.tot2, { run: 6200 }, "none"); // the nose gear reaches the line ON « V1 »
  st(t.vdeux, t.tot3 - t.vdeux, { run: 6200 + vRate * (t.tot3 - t.vdeux) }, "none");
  punch(t.vdeux, 0.06);
  const AHEAD = at(6200 + vRate * (t.tot3 - t.vdeux));
  const NR = at(6200 + vRate * (t.nonretour - t.vdeux));
  // the camera rides with it (the light too), then lets it go down the red bar
  st(t.tot2, t.vdeux - t.tot2, lit(onPlane(at(6200), [-85, 8, 0]), 240), "none");
  st(t.vdeux + 0.1, t.tot3 - t.vdeux - 0.1, lit(onPlane(AHEAD, [-400, 0, 0]), 900), "sine.inOut");
  path([
    [t.tot2, V],
    [t.vdeux, { ...aim(onPlane(at(6200), [-85, 8, 0])), az: 44, el: 12, d: 380 }],
    [t.nonretour, { ...aim(onPlane(NR, [-150, 10, 0])), az: 52, el: 22, d: 1000 }],
    [t.tot3 - 0.02, { ...aim(onPlane(AHEAD, [-250, 10, 0])), az: 56, el: 26, d: 1400 }],
  ]);
}
