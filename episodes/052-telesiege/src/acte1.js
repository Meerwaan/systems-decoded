// 01 · MENACE — from the first frame to "Alors…" (0 → tobench). Two cuts: the quay (1,86) and back to your grip (16,5).
//
// THE HOOK (« Ton siège lâche le câble. »). The first frame is POSE0 / FIRST: low, three quarters front, on the hero
// grip coming in on the arrival side, its spring lit signal (`weak` 1: the threat). It moves from frame 1 BY ITS
// SUBJECT: the chair comes on toward the lens (s 200 → 560, slowing on the tyres), the grip drops off the cable that
// runs on (`free` 0.6 → 1 on « lâche… câble »); the camera backs off and follows it at three quarters of its pace.
// THE QUAY (« Et tu t'assois dessus. »). A cut in the breath, grip on grip: your grip at the quay; the camera pulls
// back from it to you, standing at the edge, who sit down on « dessus » as the chair comes under you.
// THE PROMISE. Up the running cable to the bullwheel (« ne s'arrête jamais »), down it again to your open grip
// (« le rattraper… et le serrer »), the open jaws close, the cable running between them (« assez fort, c'est combien ? »).
// THE SCENE. Three quarters rear, your chair at walking pace (« au pas »); the camera runs ahead of it to the launching
// tyres (« des pneus vont te lancer »), on to the mouth (« la gare finit ») and out over the hollow (« la pente »).
// A cut back to your grip, open under the cable (« ta pince doit mordre le câble »); the light closes on it and the
// camera creeps in. Act 2 cuts to the bench at `tobench`.
//
// The chair cheats its pace (≈ 56 cm/s instead of 100): at 100 it would be on the launching tyres by « au pas ».
// Nobody reads a pace off a glass chair; the header says 3,6 km/h, the cable 18 — the ratio is the point.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, VIEW, ROPE_V, AT_S } from "./world.js";
import { CABLE_Y, FREE, SIDE } from "./plan.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: 8 };
const GY = CABLE_Y - FREE; // the open grip's axis in the station
const xDep = (s) => s - AT_S.launch; // departure-side x of an abscissa
const xArr = (s) => 1500 - s; // arrival-side x of an abscissa (the mouth at 1500)

const V = 56; // the hero chair's pace at the quay in this act (cm/s)

export default function acte1({ D }) {
  const { tl, st, shot, cut, punch } = D;
  const t = D.times({
    lache: "accroche:lâche", et: "accroche:Et", dessus: "accroche:dessus",
    promesse: "promesse", jamais: "promesse:jamais", ton: "promesse:Ton", serrer: "promesse:serrer", mais: "promesse:Mais",
    scene: "scene", devant: "scene:Devant", pneus: "scene:pneus", puis: "scene:Puis", sous: "scene:sous", pente: "scene:pente",
    avant: "scene:Avant", alors: "ouvre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  // the cable runs all act long (rope = ROPE_V × film time until « s'arrête »)
  st(0, t.tobench, { rope: ROPE_V * t.tobench }, "none");

  /* ───────────── « Ton siège lâche le câble. » ───────────── */
  const quayCut = t.et - 0.1; // in the breath after « câble »
  const S0 = AT_S.hook; // 200
  const S1 = S0 + 360; // where it has slowed to by the cut
  st(0, quayCut, { chair: S1, kmh: 6 }, "sine.out");
  st(0.04, t.lache + 0.55 - 0.04, { free: 1 }, "sine.inOut"); // it drops off the cable on « lâche… câble »
  shot(0, quayCut, { tx: xArr(S0 + 0.78 * (S1 - S0)), d: 470 }, "sine.out");

  /* ───────────── « Et tu t'assois dessus. » ───────────── */
  // the chair at the quay: it reaches AT.board (where you stand) as you sit, then goes on at V
  const sitAt = t.dessus + 0.15;
  const sAt = (time) => AT_S.board + V * (time - sitAt);
  const reset = t.avant - 0.18; // the second cut
  // retouche: the cuts of the promise, a few frames before their phrase
  const wheelCut = t.promesse - 0.12, gripCut = t.ton - 0.12, jawsCut = t.mais - 0.12, quayCut2 = t.scene - 0.12;
  const QUAY_GRIP = { ...P, tx: xDep(sAt(quayCut)) + 10, ty: 180, tz: SIDE + 70, d: 360, az: -62, el: 10, fov: 34, shift: 100 };
  cut(quayCut, SET.STATION, QUAY_GRIP, {
    ...STAGED, line: 0.3, weak: 1, rider: 1, sit: 0, sway: 0, chair: sAt(quayCut), kmh: 3.6,
    fx: xDep(sAt(quayCut)), fy: 200, fz: SIDE, fs: 600,
  });
  st(quayCut, reset - quayCut, { chair: sAt(reset) }, "none");
  st(t.dessus - 0.4, 0.75, { sit: 1 }, "sine.inOut");
  // retouche: one slow drift down to you (no pull-back), you large in the frame, the light pooled on you
  const SIT = { ...P, tx: xDep(sAt(t.promesse)) + 10, ty: 140, tz: SIDE + 70, d: 300, az: -58, el: 10, fov: 34, shift: 60 };
  shot(quayCut, wheelCut - quayCut, SIT, "sine.inOut");
  st(quayCut, 0.6, { fy: 140, fs: 380 }, "sine.out");

  /* ───────────── « Le câble, lui, ne s'arrête jamais. » ───────────── */
  // retouche: a cut (a few frames before the phrase) to the cable round the bullwheel, then a slow push
  cut(wheelCut, null, VIEW.wheel, { fx: -900, fy: 300, fz: 0, fs: 900 });
  shot(wheelCut, gripCut - 0.02 - wheelCut, { d: VIEW.wheel.d * 0.88 }, "sine.out");
  punch(t.jamais, 0.06);

  /* ───────────── « Ton siège doit le rattraper… et le serrer. » ───────────── */
  // retouche: a cut down to your open grip under the cable, the camera riding with the chair
  const GRIP_W = { ...P, tx: xDep(sAt(gripCut)), ty: GY, tz: SIDE, d: 260, az: -40, el: 3, shift: 150 }; // el 3: the cable reads as a cylinder, not a white streak
  cut(gripCut, null, GRIP_W, { fx: xDep(sAt(gripCut)), fy: 180, fz: SIDE, fs: 300 }); // light under the cable: no white streak
  shot(gripCut, jawsCut - 0.02 - gripCut, { tx: xDep(sAt(jawsCut)), d: 230 }, "sine.out");
  st(gripCut, jawsCut - gripCut, { fx: xDep(sAt(jawsCut)) }, "none");

  /* ───────────── « Mais assez fort, c'est combien ? » ───────────── */
  // retouche: a cut to the jaws from the front (az +95 is past a quarter turn from the grip: never a move)
  const JAWS = { ...P, ...CLOSE, tx: xDep(sAt(jawsCut)), ty: GY + 6, tz: SIDE, d: 180, az: 95, el: 4, shift: 120 };
  cut(jawsCut, null, JAWS, { fx: xDep(sAt(jawsCut)) });
  shot(jawsCut, quayCut2 - 0.02 - jawsCut, { tx: xDep(sAt(quayCut2)), d: 168 }, "none");
  st(jawsCut, quayCut2 - jawsCut, { fx: xDep(sAt(quayCut2)) }, "none");
  st(t.mais - 0.1, 0.5, { litJaws: 0.45 }, "sine.out");
  st(quayCut2 - 0.45, 0.4, { litJaws: 0 }, "sine.inOut");

  /* ───────────── « Tu avances au pas. » ───────────── */
  // retouche: a cut to three quarters rear, the camera riding with the chair at walking pace
  const QUAY = { ...VIEW.quay, tx: xDep(sAt(t.devant - 0.2)) };
  cut(quayCut2, null, { ...QUAY, tx: xDep(sAt(quayCut2)) }, { fx: xDep(sAt(quayCut2)), fy: 150, fz: SIDE, fs: 700 });
  shot(quayCut2, t.devant - 0.2 - quayCut2, QUAY, "none");
  st(quayCut2, t.devant - quayCut2, { fx: xDep(sAt(t.devant)) }, "none");

  /* ───────────── « Devant, des pneus vont te lancer. » ───────────── */
  // the camera runs ahead of the chair down the quay to the launching tyres
  const atTyres = t.puis - 0.2;
  shot(t.devant - 0.2, atTyres - (t.devant - 0.2), VIEW.tyres, "sine.inOut");
  st(t.devant - 0.2, atTyres - (t.devant - 0.2), { fx: 600, fy: 260, fz: SIDE, fs: 900 }, "sine.inOut");
  st(t.pneus - 0.05, 0.45, { litTyres: 0.6 }, "sine.out");

  /* ───────────── « Puis la gare finit, » ───────────── */
  // ONE move on from the tyres: the camera backs off sideways and travels past the mouth — the housing ends — until
  // the ground in profile drops away under the cable into the hollow (« et sous toi… la pente »)
  const SLOPE = { ...P, tx: 2300, ty: -150, tz: SIDE, d: 2800, az: -8, el: 4, fov: 40, shift: 40 };
  // retouche: no long transit any more — a cut (before « Puis ») to the profile, the housing's end on the left, and
  // a slow lateral drift past the mouth over the hollow
  const slopeCut = t.puis - 0.12;
  cut(slopeCut, null, { ...SLOPE, tx: 1700, ty: 150, d: 2400 }, { fx: 1800, fy: 0, fz: SIDE, fs: 1600, litTyres: 0 });
  shot(slopeCut, reset - 0.02 - slopeCut, { tx: SLOPE.tx, ty: SLOPE.ty, d: SLOPE.d * 0.95 }, "sine.inOut");
  st(slopeCut, 0.5, { line: 1 }, "sine.inOut"); // out of the mouth: the ground's X-ray full

  /* ───────────── « et sous toi… la pente. » ───────────── */
  punch(t.pente, 0.06, { hold: 0.18, down: 0.3 });

  /* ───────────── « Avant ça, ta pince doit mordre le câble. » ───────────── */
  // a cut back to your grip at the quay, open under the running cable; the light closes on it, the camera creeps in
  const sR = AT_S.board + 300; // the chair after the cut (still at the quay, at the same pace)
  const sE = sR + V * (t.tobench - reset);
  const GRIP = { ...P, ...CLOSE, tx: xDep(sR), ty: GY, tz: SIDE, d: 200, az: -40, el: 3, shift: 150 }; // el 3 (no white streak), back to 10 by tobench
  cut(reset, SET.STATION, GRIP, {
    ...STAGED, line: 0.3, weak: 1, rider: 1, sit: 1, sway: 0, chair: sR, kmh: 3.6,
    fx: xDep(sR), fy: 180, fz: SIDE, fs: 260, // light under the cable: no white streak (back to GY by « Alors »)
  });
  st(reset, t.tobench - reset, { chair: sE }, "none");
  st(reset + 0.1, t.alors - reset - 0.1, { fx: xDep(sE), fs: 160 }, "sine.inOut");
  st(t.alors - 0.9, 0.85, { fy: GY }, "sine.inOut");
  const mid = t.alors - 0.6;
  shot(reset, mid - reset, { tx: xDep(sR + V * (mid - reset)), d: 160 }, "sine.inOut");

  /* ───────────── (souffle) « Alors… » ───────────── */
  shot(mid, t.tobench - 0.02 - mid, { tx: xDep(sE), d: 112, el: 10 }, "sine.inOut");
}
