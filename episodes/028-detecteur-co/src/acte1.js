// 01 · MENACE — from the first frame to « Alors… » (0 → tosystem → tobench). One move, two cuts (sauf, toscene).
//
// THE HOOK. The first frame (POSE0 / FIRST) is you asleep low in the foreground, the boiler glowing behind your head
// through the glass back wall, its gas ribbons already flowing through the door toward you, the detector's green
// small on the wall (upper left). It moves on frame 1: the camera rushes in and down to the bed's height (glide:
// 3.4 times its mean speed over 1 s — the motion of the first half-second measures 5.45 on snapped frames, qa's
// own sum), the bed and you sliding across the boiler (parallax), while the gas flows.
//   « Ta chaudière t'empoisonne. »     the push, toward you and the gas over your head            punch on « empoisonne »
//   « Et ton détecteur… ne dit rien. »  the camera dives to the wall: the detector takes its place, the boiler behind
//                                       it through the glass; on « rien » nothing lights                punch on « rien »
//   « Normal : … attendre une heure. »  close on its face: the motes of gas sucked into its grille; « heure »: a
//                                       segment of its ring (dose 0.12 → 0.16)
//   « Sauf si ce détecteur… »           CUT 1 (from the box on the wall to the disc on the ceiling: two detectors):
//   « …n'a jamais su voir ce gaz. »     the white smoke detector, from below, the haze going round it; it stays dark.
//                                       Nothing says which one is yours: the C stays open.
// THE SCENE (10 → 25 s: a change every 2 to 3 s, no slow stretch). Reworked after the draft's qa (22/10): every
// move that turned more than a quarter turn in a second, or went through the glass wall, is now a CUT laid a few
// frames before its sentence, on a frame boundary, followed by a slow push:
//   « Le monoxyde sort de ta chaudière, » CUT 2: the boiler, low, the flame, the gas born under its casing; a push
//   « …sans odeur. »                   CUT 3: your sleeping face, the boiler behind your head; the chip « Sans odeur »
//   « Dans ton sang, … l'oxygène. »    CUT 4: your chest, the flat already a ghost; a dive by ratio into the maquette
//                                       of the blood; on « place »: the CO beads take the oxygen's    punch on « l'oxygène »
//   « Mal de tête… tu te rendors. »    CUT 5: a tight frame on your head, a slow push: the ache throbs, then fades
//   « Au mur, le boîtier compte. »     CUT 6: the detector, the boiler behind it; a push by ratio to VIEW.system; on
//                                       « compte »: its ring fills a little more (dose → 0.2)         punch on « compte »
//   (souffle, « Alors… »)              the camera holds on VIEW.system: the motes and the current stop,
//                                       only the light breathes. Act 2 cuts to the bench from there (benchCut).
// Hands over: VIEW.system, the flat (STAGED, mood 1), dose 0.2, sniff 0, current 0, smoke 0, micro 0, ache 0.2.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, POSE0, VIEW, DETECTOR, BOILER, SMOKE, YOU, BLOOD } from "./world.js";

export default function acte1({ D }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({
    choc: "choc", chocEnd: "accroche:empoisonne$", detecteur: "detecteur", rien: "rien", rienEnd: "accroche:rien$",
    normal: "normal", heure1: "heure1", sauf: "sauf", cegaz: "cegaz",
    toscene: "toscene", chaudiere: "chaudiere", sans: "scene:sans", odeur: "odeur", sang: "sang", place: "place",
    oxygene: "oxygene", oxyEnd: "scene:l'oxygène$", tete: "tete", rendors: "rendors", rendorsEnd: "scene:rendors$", mur: "mur", compte1: "compte1",
    compteEnd: "scene:compte$", tosystem: "tosystem", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  const [DX, DY, DZ] = DETECTOR.at;
  const [BX, BY, BZ] = BOILER.burner;
  const [HX, HY, HZ] = YOU.head;
  const [MX, MY, MZ] = BLOOD.at;


  /* ── the poses (complete; checked with a projection of the set, then on the planches) ── */
  const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
  // a cut lands on a frame boundary (the shutter averages 16 instants: a cut inside a frame would blend two shots)
  const F = (x) => Math.round(x * 30) / 30;
  // the push of the hook: closer, a little round to the left — you slide across the boiler; the detector stays in
  const PUSH = { ...POSE0, tx: 30, ty: 104, tz: -160, d: 370, az: -21, el: -2, shift: 180 };
  const PUSH2 = { ...PUSH, d: 362, az: -20.5, el: -2.2, shift: 182 };
  // « ne dit rien »: the detector upper left, big enough to read; the boiler behind it through the glass, right
  const DET = { ...P, tx: DX + 12, ty: DY - 4, tz: DZ - 3, d: 105, az: -40, el: -2, fov: 38, shift: 250 };
  // « Normal… une heure »: ONE slow move from DET in to its face and round it (VIEW.wall on the way), the motes
  // going into the grille — it never stops before the cut (qa 21/10: 5.0–7.5 s was a held frame)
  const WALL2 = { ...VIEW.wall, d: 50, az: -14, el: 20, shift: 110 }; // az held ≤ −14: three-quarters, never its face
  // « Et ton détecteur »: a CUT to the detector after the push of the hook (the dive from 362 cm was 1.7 s, 14), then
  // a push by ratio to DET, landing still on « rien »
  const DET0 = { ...DET, d: 165, az: -45, el: -4, fov: 39, shift: 270 }; // every number moves the way the next shot carries on (no turn back)
  // « Sauf si ce détecteur… »: the smoke detector from below, then a slow orbit round it (the haze turns round the disc)
  // (d ≥ 200: the haze is not drawn within ≈ 110 cm of the eye — closer, the disc floats in black)
  const SMOKE1 = { ...VIEW.smoke, d: 240, shift: 60 };
  // …then ONE move round and away from it, lower, until the cut: the room's lines turn round the disc (a slow orbit
  // alone moved nothing — a disc in an even haze, qa 8.0–11.0 s under 1)
  const SMOKE2 = { ...VIEW.smoke, d: 420, az: -115, el: -12, shift: 140 };
  // « Le monoxyde sort de ta chaudière »: the boiler from the corridor, low (VIEW.boiler), a push
  const BOIL = VIEW.boiler;
  const BOIL2 = { ...VIEW.boiler, d: 255, az: -53, el: -10 };
  // « …sans odeur »: your face, the gas ribbon arriving over your head, the boiler behind (same heading as BOIL)
  // — a CUT now (the pull-back through the glass wall lit one frame at 12.27 s: the camera went through the boiler's light)
  const FACE = { ...P, tx: 40, ty: 95, tz: -130, d: 270, az: -42, el: 3, fov: 38, shift: 200 };
  const FACE1 = { ...FACE, d: 285 };
  const FACE2 = { ...FACE, d: 255, az: -40 };
  // « Dans ton sang »: a CUT to your chest on the heading of the maquette, then a dive by ratio into it
  const CHEST = { ...VIEW.blood, d: 170 };
  const BLOOD1 = VIEW.blood;
  const BLOOD2 = { ...VIEW.blood, d: 108, az: -18 };
  // « Mal de tête… tu te rendors »: a CUT to a tight frame on your head (not a very close-up: you are glass), a slow push
  // (az −75: your face, the ache at your temple, your hand on the pillow; at −52 your raised arm hid it)
  const HEAD = { ...P, tx: HX, ty: HY + 6, tz: HZ, d: 185, az: -76, el: 10, fov: 34, shift: 200 };
  const HEAD2 = { ...HEAD, d: 158, az: -70 };
  // « Au mur »: a CUT to the detector (the boiler behind it), then the push by ratio to VIEW.system
  const SYS0 = { ...VIEW.system, d: 112, az: -40, el: -6, fov: 30, shift: 170, dof: 0 };
  const SYS = VIEW.system;
  const c = { det: F(t.detecteur - 0.26), face: F(t.sans - 0.17), chest: F(t.sang - 0.42), head: F(t.tete - 0.05), wall: F(t.mur - 0.14) };

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── « Ta chaudière t'empoisonne. » ───────────── */
  // frame 1 already rushes (glide: three times its mean speed), and settles before the dive (frames 0 → 1 s untouched)
  shot(0, 1.0, PUSH, glide(3.4, 0.4));
  shot(1.0, c.det - 1.0, PUSH2, glide(0.6, 1));
  st(0, t.detecteur, { fx: 60, fy: 105, fz: -160, fs: 420 }, "sine.inOut");
  D.punch(t.chocEnd + 0.01, 0.06, { hold: 0.1, down: 0.2 }); // stamped in the breath (sfx hit, empoisonne$+0.06) — let go before the cut

  /* ───────────── « Et ton détecteur… ne dit rien. » ───────────── */
  // CUT a few frames before « Et »; a push by ratio: the detector grows to its place; it lands STILL on « rien »
  // (sine), so the turn that follows does not jerk back (the stray frame at 3.43 s: az and shift reversed at speed)
  cut(c.det, null, DET0);
  shot(c.det, t.rien - c.det, DET, "sine.inOut", DET0.d);
  st(t.detecteur, t.rien - t.detecteur, { fx: DX, fy: DY, fz: DZ + 10, fs: 60 }, "sine.inOut");
  D.punch(t.rienEnd + 0.04, 0.06, { hold: 0.18, down: 0.45 }); // (sfx hit, accroche$+0.12)

  /* ───────────── « Normal : à faible concentration, il a le droit d'attendre une heure. » ───────────── */
  // close on its face, still moving: the motes sucked into its grille (sniff up), the header says ≈ 50 ppm
  // (in centimetres, not by ratio; sine: it leaves still from DET and is at its fastest in the middle of the sentence,
  // where qa found a held frame 5.0–7.5 s)
  shot(t.rien, t.sauf - t.rien, WALL2, "sine.inOut");
  st(t.rien + 0.2, 0.9, { sniff: 1 }, "sine.inOut");
  st(t.normal, 1.0, { fx: DX, fy: DY, fz: DZ + 3, fs: 30 }, "sine.inOut");
  // « heure »: a segment of its ring fills (sfx click, heure$+0.08)
  st(t.heure1 + 0.14, 0.4, { dose: 0.16 }, "sine.out");

  /* ───────────── « Sauf si ce détecteur… n'a jamais su voir ce gaz. » ───────────── */
  // CUT 1: the white disc on the ceiling, the haze round it; on « gaz » its outline is lit, the gas goes round it
  // (the haze held denser here, co 1, or it does not read round the disc: the header stays at ≈ 50 ppm; the cut back to the boiler sets it back)
  cut(t.sauf, SET.FLAT, SMOKE1, { smoke: 0.6, co: 1, sniff: 0.5, fx: SMOKE.at[0], fy: SMOKE.at[1] - 10, fz: SMOKE.at[2], fs: 90 });
  shot(t.sauf, t.toscene - t.sauf, SMOKE2, glide(0.9, 1.1));
  st(t.cegaz, 0.5, { smoke: 1 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── « Le monoxyde sort de ta chaudière, » ───────────── */
  // CUT 2: the boiler, low, its flame, the gas born under its casing; the current of the detector, unseen, ebbs
  cut(t.toscene, SET.FLAT, BOIL, { smoke: 0, co: 0.5, current: 0.2, fx: BX, fy: BY, fz: BZ, fs: 160 });
  shot(t.toscene, c.face - t.toscene, BOIL2, glide(0.8, 1.1));

  /* ───────────── « …sans odeur. » ───────────── */
  // CUT 3: your sleeping face, the gas over your head, the boiler behind it (same heading); a slow push
  cut(c.face, null, FACE1, { fx: HX, fy: HY + 15, fz: HZ - 20, fs: 300 });
  shot(c.face, c.chest - c.face, FACE2, glide(1, 1));
  D.chip("chip-co", null, 360, 715, t.sans - 0.05, c.chest - 0.25); // gone before the cut to the chest

  /* ───────────── « Dans ton sang, il prend la place de l'oxygène. » ───────────── */
  // CUT 4: your chest on the heading of the maquette, the flat already a ghost (micro 0.75: at 0.35 your glass arms
  // filled the frame), gone in 0.35 s while the camera dives by ratio
  cut(c.chest, null, CHEST, { micro: 0.75, fx: MX, fy: MY, fz: MZ, fs: 60 });
  st(c.chest, 0.35, { micro: 1 }, "sine.out");
  shot(c.chest, t.place - c.chest, BLOOD1, "sine.inOut", CHEST.d);
  shot(t.place, c.head - t.place, BLOOD2, glide(0.3, 1));
  // « place… l'oxygène »: the CO beads take the oxygen's
  st(t.place, t.oxyEnd + 0.2 - t.place, { swap: 0.6 }, "sine.inOut");
  D.punch(t.oxyEnd + 0.02, 0.06, { up: 0.08, hold: 0.06, down: 0.16 }); // (sfx hit, l'oxygène$+0.08) — let go before the cut

  /* ───────────── « Mal de tête… tu te rendors. » ───────────── */
  // CUT 5: your head, the flat back (the move out of the chest was a quarter turn in one second: qa 16.8 s, 20)
  cut(c.head, null, HEAD, { micro: 0, fx: HX, fy: HY + 6, fz: HZ, fs: 150 });
  shot(c.head, c.wall - c.head, HEAD2, glide(1, 1));
  st(t.tete + 0.25, 0.5, { ache: 1 }, "sine.out");
  st(t.rendors + 0.1, 0.7, { ache: 0.2 }, "sine.inOut");

  /* ───────────── « Au mur, le boîtier compte. » ───────────── */
  // CUT 6: the detector on the wall (the pan and rise from your head were 18.4 s, 23.6), then the push by ratio:
  // it lands still on VIEW.system at tosystem, before « Alors… »
  cut(c.wall, null, SYS0, { fx: DX, fy: DY, fz: DZ + 3, fs: 30 });
  shot(c.wall, t.tosystem - c.wall, SYS, "sine.inOut", SYS0.d);
  // « compte »: its ring fills a little more, the head of current leaves the electrode
  st(t.compte1 + 0.1, 0.5, { dose: 0.2, current: 0.6 }, "sine.out");
  D.punch(t.compteEnd + 0.01, 0.06, { hold: 0.16, down: 0.4 }); // (sfx tick, scene$+0.04)

  /* ───────────── the breath before « Alors… » ───────────── */
  // the motes and the current stop (as the breath does, sfx suck): only the light breathes. Act 2 cuts from here.
  st(t.tosystem + 0.05, 0.45, { sniff: 0, current: 0 }, "sine.inOut");

  // (the first frame is FIRST / POSE0: fin.js slides the state back to it, D.loop)
}
