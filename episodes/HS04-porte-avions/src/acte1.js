// 01 · MENACE — accroche → scene (0 → ouvre), ON THE DECK at dawn (FIRST: the L04's first frame — your Rafale on the
// bow catapult at full power, the holdback taut). v2 (27/10, docs/HS04-v2-montage.md points 1–4).
//   A  POSE0: behind the tail, in its axis — the two cores white-hot, the signal horizon; a push from frame 1 (unchanged)
//   B  « Zéro à 240… en 75 mètres » — the whole stroke, a head of light runs the slot to the bow
//   C  « Ce soir, tu reviens. De nuit. Trois câbles » — the L04's night preview (c1), re-framed 9:16: the sky goes black,
//      the camera swings over the sea into the angled runway's axis (your approach), the runway lit, then its three wires
//      stacked across the frame; a dip back to the dawn for the scene
//   scene: the cores (« hurlent »), the whole aircraft in profile (« tremble »), the calibrated piece taut (« une seule
//   pièce… faite pour casser »), and a pull-back down through the deck to the cylinders (« sous tes roues »)
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, VIEW, P, SHARP, L04_AT, NG, NECK } from "./world.js";
import { onAngled, BRINS } from "../../L04-porte-avions/src/plan.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame

/* the L04's instants these shots live in (the header « FILM · mm:ss »): the stroke (c1 8,4 s), the night preview (c1 11,46 s) */
const L04_STROKE = 8.4;
const L04_NIGHT = 11.5;

/* ── C: the night preview, portrait — the whole ship from astern, high (its length runs up the frame), then down into the
   angled runway's axis: your approach, the three wires stacked across the runway ── */
const W2 = onAngled((BRINS.s[0] + BRINS.s[1]) / 2); //                                 between Athéna and Aphrodite: the three wires low in the frame
const NIGHT_A = { ...P, tx: 0, ty: 0, tz: 1500, d: 30000, az: -6, el: 28, fov: 34, shift: 60, ...SHARP }; //          the whole ship at sea, from astern: the sky going black
const NIGHT_B = { ...P, tx: W2[0], ty: 0, tz: W2[2], d: 5200, az: 8.5, el: 12, fov: 40, shift: 80, ...SHARP };     // in the runway's axis, from astern: the three wires stacked across it

export default function acte1({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    pas: "accroche:pas", promesse: "promesse", zero: "promesse:zéro", heure: "promesse:240", metres: "promesse:mètres",
    curiosite: "curiosite", soir: "curiosite:soir", reviens: "curiosite:reviens", nuit: "curiosite:nuit", trois: "curiosite:trois",
    scene: "scene", tout: "scene:tout", tremble: "scene:tremble", une: "scene:une", casser: "scene:casser", roues: "scene:roues",
    ouvre: "ouvre",
  });
  // act 1 lit on the very first frame (a zero-length tween at 0 is not drawn by a seek to 0: the loop's last frame had it, the first not)
  document.querySelectorAll(".hud__acts span").forEach((span, i) => {
    span.style.opacity = i === 0 ? "1" : "0.4";
    span.style.color = i === 0 ? "#e9e4d8" : "rgba(233, 228, 216, 0.62)";
  });
  setAct(D.tl, 1, 0);
  now(0, { l04: L04_AT.accroche });

  /* A — moving from frame 1: a push in the tail's axis, between the two cores (unchanged) */
  const bAt = F(t.promesse - 0.1);
  // a rush onto the two cores — a zoom from the same place (closer, the camera would enter the tail), then it settles
  shot(0, 0.9, { ...POSE0, d: 1400, fov: 31, el: 7 }, glide(3, 0.2), POSE0.d);
  shot(0.9, bAt - 0.9, { ...POSE0, d: 1380, fov: 30, el: 7 }, "sine.out", 1400);
  D.punch(t.pas, 0.04, { up: 0.12, hold: 0.2, down: 0.5 });

  /* B — « Zéro à 240 kilomètres-heure, en 75 mètres » : the whole stroke, the head of light to the bow */
  cut(bAt, null, VIEW.stroke, { named: 0, trace: 0, traceOut: 0, fx: NG[0], fy: 150, fz: NG[2] - 3000, fs: 4500 });
  now(t.promesse, { l04: L04_STROKE });
  const cAt = F(t.curiosite - 0.1);
  shot(bAt, cAt - bAt, { ...VIEW.stroke, d: 1700, el: 17 }, "sine.inOut", VIEW.stroke.d);
  st(t.zero + 0.1, t.metres + 0.4 - t.zero - 0.1, { trace: 1 }, "sine.in"); // the head runs from « zéro » to the bow on « mètres »
  D.punch(t.heure, 0.05);

  /* C — « Ce soir, tu reviens. De nuit. Trois câbles : lequel va t'attraper ? » — the night preview */
  cut(cAt, null, NIGHT_A, { trace: 0, traceOut: 0, fx: 0, fy: 0, fz: 1500, fs: 16000 });
  now(t.curiosite, { l04: L04_NIGHT });
  const sAt = F(t.scene - 0.1);
  // one slow descent (a turn of ≈ 15°, the distance by ratio) into your approach: the runway's axis, from astern
  shot(cAt, F(t.trois + 0.5) - cAt, NIGHT_B, "sine.inOut", NIGHT_A.d);
  shot(F(t.trois + 0.5), sAt - F(t.trois + 0.5), { ...NIGHT_B, d: 4800, el: 11 }, "sine.out"); // the wires settle, a slow push
  st(t.soir, t.nuit - 0.1 - t.soir, { night: 0.85 }, "sine.in");
  st(t.reviens, 0.6, { angled: 1 }, "sine.out"); //   « tu reviens » : the runway where you will land
  st(t.nuit, 0.4, { lights: 1 }, "sine.out"); //       « De nuit » : the ship's night lights
  st(t.trois, 0.6, { wires: 1 }, "sine.out"); //       « Trois câbles »
  st(t.soir, 2.5, { fx: W2[0], fy: 0, fz: W2[2], fs: 7000 }, "sine.inOut");
  D.punch(t.nuit, 0.05);

  /* scene — « Tes moteurs hurlent » : a dip back to the dawn, the cores, close behind the tail */
  cut(sAt, null, VIEW.hurl, { night: 0, lights: 0, angled: 0, wires: 0.3, gas: 1, tremble: 1, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200 }, { fade: 0.2, kind: "dip" });
  now(t.scene, { l04: L04_AT.tremble });
  const tremAt = F(t.tout - 0.12); // in the breath after « hurlent »
  shot(sAt, tremAt - sAt, { ...VIEW.hurl, d: 1120, az: 14 });
  // « Tout ton avion tremble, retenu au pont » : the whole aircraft, in profile, shivering
  const WHOLE = { ...VIEW.hook3, d: 3000, az: -118, el: 8 }; // three-quarter front, port: nose to tail in the frame
  cut(tremAt, null, WHOLE, { fx: NG[0], fy: 150, fz: NG[2] + 500, fs: 2200 });
  const pieceAt = F(t.une - 0.12);
  shot(tremAt, pieceAt - tremAt, { ...WHOLE, d: 2750, az: -114 });
  D.punch(t.tremble, 0.05);
  // « …par une seule pièce. Elle est faite pour casser. » : the calibrated piece, in place, taut
  cut(pieceAt, null, VIEW.bar, { named: 5, fx: NECK[0], fy: 60, fz: NECK[2], fs: 500 });
  now(pieceAt, { l04: L04_AT.promesse });
  const downAt = F(t.casser + 0.35); // in the breath after « casser »
  shot(pieceAt, downAt - pieceAt, { ...VIEW.bar, d: 190, az: -66, el: 10 });
  D.punch(t.casser, 0.05);
  // « Et sous tes roues… » : a pull-back down through the glass deck, the cylinders under your wheels (acte 2 whips from there)
  now(downAt, { l04: L04_AT.dessous });
  shot(downAt, t.roues + 0.05 - downAt, VIEW.cyl, "sine.inOut", 190);
  st(downAt, 1.4, { under: 1, jet: 0, press: 0.55 }, "sine.inOut");
  now(downAt + 0.6, { named: 0 });
  st(downAt, 1.6, { fx: -200, fy: -95, fz: -6500, fs: 2500 }, "sine.inOut");
}
