// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One move, and one cut (to the hole, for the foam).
//
// The first frame (POSE0 / FIRST) is the cooker of glass on its fire: the water boiling, the underside of its lid
// pushed by a signal haze, the jet of its valve, your arm coming in from the right. It is already moving:
//   the gap     "Ta cocotte-minute siffle. Sous le couvercle…" — the camera closes in and comes down level with the
//               rim: the gap between the water and the lid, in profile. The haze breathes in on "sous le couvercle"
//               and surges on "pousse" ; on "350" the header answers. The cooker stays whole above the hook's words.
//   the valve   "Ce sifflement te protège." — up to the weight that dances and its jet; on "tait" the weight drops
//               on its hole, the jet dies, the header says « Muette » and the lid reddens under it. It holds.
//   the gap     it was only a glimpse of that day: the whistle comes back, and the camera comes down to the gap,
//               outside, in profile ("Dedans, la vapeur est prisonnière"): the haze breathes and presses on the lid
//   the water   "l'eau ne bout plus à cent degrés…" — the same profile, closing in: the water that boils under it
//   you         "Tout cuit plus vite. Mais ce soir, tu l'as trop remplie" — down to the lentils, then one slow
//               pull-back by ratio to the whole vessel and you at the hob: the level, far above the middle
//   the foam    "La mousse monte… vers la soupape." — a cut to the hole, from above: the foam climbs to the chimney
//   alone       the silence, « Alors… »: back to VIEW.system, the cooker solid again, no jet, the kitchen going out
// The header never leaves « +350 kg » in this act; its second readout says « Muette » once, for the length of a hold.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, BENCHED, HOME, LID, INSIDE } from "./world.js";

const [HX, HY, HZ] = HOME;
const AXIS = { tx: HX, tz: HZ };
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const TOP = HY + LID.top; // the lid's flat crown, the foot of the chimney
const WATER = HY + INSIDE.floor + 0.8 * (INSIDE.top - INSIDE.floor); // tonight's level (`fill` 0.8)

/* ── the poses (arithmetic on the plan's landmarks, checked with `look`) ── */
// level with the rim, in profile: the gap between the water and the lid. The cooker whole, its base above the
// hook's words (y ≈ 1175), its valve and the root of the jet under the header — framed by the shift, not by a tilt
const GAP = { ...AXIS, ty: HY + 14.3, d: 88, az: -68, el: 0, fov: 40, shift: 214, side: 40, roll: 0, drift: 0.2 };
// the working valve and its jet; the dome of the lid under it, the surface of the water just above the hook's words
// (not too close: the move up from the gap was the hardest of the act — it now zooms half as much, over 2 s)
const VALVE0 = { ...P, ...AXIS, ty: TOP, d: 72, az: -60, el: 4, shift: 150 };
const VALVE1 = { d: 67 };
// OUTSIDE, in profile, level with the gap between the water and the lid: the haze held prisoner there, the water
// that boils under it, the lentils. Everything after the valve is shot at fov 28: no change of lens on a move
const GAP_IN = { ...P, ...AXIS, ty: HY + 13.5, d: 85, az: -66, el: -1, shift: 60 };
const LENTILS = { ty: WATER - 1.5, d: 79 };
// the whole vessel of glass and you at the hob — your arm passes on the right of the cooker (az −64)
const LEVEL = { tx: HX + 5, ty: HY + 13.8, tz: HZ + 12, d: 179, az: -64, el: 6, fov: 28, shift: 100, side: 60, roll: 0, drift: 0.3 };
// « le trou qui se bouche » (the decor's journal): from above, three quarters, the chimney's tube of glass and its
// mouth under the dome — the foam comes up to it. Reached by a CUT (26° and ×2.5 in under two seconds was the
// second hardest move of the film); at az −38 your hand would stand in front of the cooker: `you` 0 on the cut
const HOLE = { ...P, ...AXIS, ty: HY + 16.3, d: 70, az: -38, el: 12, shift: 150 };

// the light: what it stands around, and how wide
const L_COOKER = { fx: HX, fy: HY + 11, fz: HZ, fs: 40 };
const L_VALVE = { fx: HX, fy: TOP + 1, fz: HZ, fs: 18 };
const L_YOU = { fx: HX, fy: HY + 11, fz: HZ, fs: 70 };
const L_ALONE = { fx: HX + BENCHED.fx, fy: HY + BENCHED.fy, fz: HZ + BENCHED.fz, fs: BENCHED.fs }; // (act 2 cuts to the bench under this light)

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: a hook moves before its first half second. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    under: "under", pushes: "pushes", kilos: "kilos", hookEnd: "accroche$",
    protects: "protects", silence: "silence",
    toscene: "toscene", prisoner: "prisoner", boils: "boils", hotter: "hotter", faster: "faster",
    tonight: "tonight", toofull: "toofull", foams: "foams", tovalve: "tovalve", back: "back", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  /** The header's push answers a word (it never changes in this act). */
  const pulse = (at) => tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, at);

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── A · "Ta cocotte-minute siffle. Sous le couvercle, la vapeur pousse : plus de 350 kilos." ───────────── */
  // from the first frame the camera closes in and comes down level with the rim — fastest at the start. The jet
  // is cut short as it grows in the picture: it stops under the header
  const atGap = t.pushes - 0.05;
  shot(0, atGap, GAP, glide(1.3, 0.4));
  st(0, t.under, { plume: 0.5 }, "sine.out");
  // "sous le couvercle": the haze breathes in… "pousse": it surges against the lid; "350": the header answers
  st(t.under, t.pushes - 0.1 - t.under, { seen: 0.5 }, "sine.inOut");
  st(t.pushes - 0.05, 0.3, { seen: 1, bar: 1.18 }, "power2.out");
  st(t.pushes + 0.3, t.kilos - (t.pushes + 0.3), { bar: 1 }, "sine.inOut");
  shot(atGap, t.hookEnd + 0.1 - atGap, { d: GAP.d * 0.95 }, "sine.out");
  pulse(t.kilos + 0.1);
  // (no chip-350: the hook's card already says the figure, and a chip in the top slot lay on the valve and its jet)

  /* ───────────── B · "Ce sifflement te protège." ───────────── */
  // up from the gap to the valve: the weight that dances, the jet — the haze steps back to let it read
  const up = t.hookEnd + 0.1;
  const atValve = t.protects + 0.75;
  shot(up, atValve - up, VALVE0, "sine.inOut");
  st(up, t.protects - up, { seen: 0.3, plume: 0.32, litValve: 0.6, ...L_VALVE }, "sine.inOut");

  /* ───────────── C · "Le danger… c'est le jour où elle se tait." ───────────── */
  // on "tait" the weight drops on its hole, the jet dies (two frames) — the header says « Muette »; under it the lid
  // reddens: it thickens in there. The picture holds
  shot(atValve, t.silence - atValve, VALVE1, "sine.inOut");
  st(t.silence, 0.07, { whistle: 0, litValve: 0 }, "none");
  st(t.silence + 0.05, 0.5, { seen: 1, bar: 1.25 }, "sine.out");
  shot(t.silence, t.toscene - t.silence, { d: VALVE1.d * 0.985 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "Dedans, la vapeur est prisonnière :" ───────────── */
  // that was a glimpse of that day: tonight it whistles. The camera comes down from the valve to the gap, outside,
  // in profile (by ratio); on "prisonnière" the haze under the lid breathes out… and presses back against it
  st(t.toscene, 0.25, { whistle: 1 }, "power2.out");
  st(t.toscene, 0.5, { bar: 1 }, "sine.inOut");
  const atGapIn = t.prisoner + 0.3;
  shot(t.toscene, atGapIn - t.toscene, GAP_IN, "sine.inOut", VALVE1.d * 0.985);
  st(t.toscene, t.prisoner - 0.5 - t.toscene, { plume: 0.3, ...L_COOKER }, "sine.inOut");
  st(t.prisoner - 0.5, 0.5, { seen: 0.55 }, "sine.inOut");
  st(t.prisoner, 0.35, { seen: 1, bar: 1.14 }, "power2.out");
  st(t.prisoner + 0.4, 0.7, { bar: 1 }, "sine.inOut");
  shot(atGapIn, t.faster - atGapIn, { d: GAP_IN.d * 0.95 }, "sine.inOut");

  /* ───────────── "l'eau ne bout plus à cent degrés, mais à plus de cent dix." ───────────── */
  // the same profile, closing in slowly: the water that boils under the haze. The jet is kept to its root: the
  // figure takes the top slot
  st(t.boils - 0.1, 0.6, { plume: 0.15 }, "sine.inOut");
  chip("chip-110", null, 96, 440, t.hotter, t.faster - 0.12);

  /* ───────────── "Tout cuit plus vite. Mais ce soir, tu l'as trop remplie : des lentilles." ───────────── */
  // down to the lentils that tumble, the haze thinning; then one slow pull-back by ratio — it leaves before
  // "Mais ce soir" and lands after "remplie" — to the whole vessel and you: the level, far above the middle
  const pull = t.faster + 0.85;
  const atLevel = t.toofull + 0.6;
  shot(t.faster, pull - t.faster, LENTILS, "sine.inOut");
  shot(pull, atLevel - pull, LEVEL, "sine.inOut", LENTILS.d);
  st(t.faster, pull - t.faster, { seen: 0.3 }, "sine.inOut");
  st(pull, atLevel - pull, { plume: 0.45, ...L_YOU }, "sine.inOut");
  shot(atLevel, t.foams - atLevel, { d: LEVEL.d * 0.97 }, "sine.out");
  chip("chip-trop", null, 96, 456, t.toofull, t.foams - 0.15);

  /* ───────────── "La mousse monte… vers la soupape." ───────────── */
  // a CUT to the hole, from above: the haze drawn low so that the foam reads, climbing for the whole sentence to
  // the mouth of the chimney — the valve above still whistling (`clog` stays 0: the plug is for act 3)
  cut(t.foams - 0.12, SET.KITCHEN, HOLE, { you: 0, seen: 0.15, plume: 0.4, foam: 0, ...L_COOKER });
  // (it stops a finger under the mouth: at 0.85 it fills the dome, and from above the dome turns milky)
  st(t.foams, t.back - 0.1 - t.foams, { foam: 0.72 }, "sine.inOut");
  shot(t.foams - 0.12, t.back - (t.foams - 0.12), { d: HOLE.d * 0.9 }, "sine.inOut");

  /* ───────────── the silence, « Alors… » ───────────── */
  // back to the cooker alone: solid again, no jet drawn, the kitchen going out, the light of the bench. Act 2 cuts
  // to the bench from VIEW.system, with its own state
  const alone = t.tobench - 0.03;
  shot(t.back, alone - t.back, VIEW.system, "sine.inOut", HOLE.d * 0.9);
  st(t.back, 0.4, { xray: 0 }, "sine.inOut");
  st(t.back, alone - 0.05 - t.back, { seen: 0, plume: 0, shell: 0.2, ...L_ALONE }, "sine.inOut");
  st(t.tobench - 0.22, 0.2, { mood: 0 }, "none");
  now(t.tobench - 0.01, { you: 0 }); // (already gone: said once more for whoever reads the hand-over)
}
