// 03 · RÉPONSE — from « Deux cent vingt-cinq mètres » to « tu n'as pas bougé » (tozero → toverdict). In cuts, one
// shot per breath, slow motion around the window: you cross the sheet at 225 m; the threshold; your hand that does
// not move; the ground four seconds away, from above your back; down into the cutter on your back (its casing cut
// away): the piston creeps across the hole… and the loop is cut; the flaps open and the pilot chute leaves; the
// canopy inflates over you and the light lets go (mood 1 → 0 on « gonfle »); you hang under it, limp.
// THE BOX CUTS A LOOP: it never « opens » anything on screen. No opening time is shown; 225 m is a mark.
// Close shots on the rig keep `spin` on a whole number (0): the poses aim in the diver's frame.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, ALT, SPEED, CUTTER } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
// high above your back: the rig, the arms around it, the countryside below (act 1's HIGH: « quatre secondes »)
const HIGH = { ...P, tx: 0, ty: 14, tz: 16, d: 340, az: -40, el: 64, fov: 34, shift: 40 };
// under you, the whole body on the lit sheet, the hand floating by the handle (act 1's HANDLE, turned toward the chest)
// retouche 04/11: d 300 and the glass at 0.45 (the limbs filled the frame), pushed up so the hand clears the captions
const HANDLE = { ...P, tx: 8, ty: -24, tz: 18, d: 300, az: -10, el: -50, fov: 36, shift: 160 };
// retouche 04/11: from below, the canopy over you and you under it, both in 440–1160 (LIMP showed only the lines)
const HUNG = { ...P, tx: 0, ty: 200, tz: 0, d: 1450, az: -35, el: -48, fov: 60, shift: 88 };
// the pilot chute leaving and the rig in one frame, then the pull back up the lines (« La voile se gonfle »)
const OPEN0 = { ...P, tx: 0, ty: 160, tz: 10, d: 820, az: -40, el: 0, fov: 44, shift: 190 };
// the rig on your back, three-quarter from the side: the flaps open toward the lens, the pilot chute leaves
const RIG = { ...P, tx: 0, ty: 18, tz: 14, d: 260, az: -70, el: 28, fov: 30, shift: 60 };

export default function acte3({ D }) {
  const { tl, cut, st, shot, chip, punch, blip } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", metres: "zero:mètres", plus: "zero:Plus", sec1: "sec1",
    ta: "zero:Ta", main: "main1", quatre: "zero:Quatre", secondes: "zero:secondes", sec4: "sec4",
    reponse: "reponse", piston: "piston", avance: "reponse:avance", mm: "mm", trigger: "trigger", tranche: "tranche",
    ton: "reponse:Ton", souvre: "souvre", voile: "reponse:voile", gonfle: "gonfle", et: "reponse:Et", toi: "toi",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  // the cuts, a few frames before the breath they serve
  const cHand = t.ta - 0.08; //        « Ta main ne bouge pas. »
  const cHigh = t.quatre - 0.08; //    « Quatre secondes. »
  const cCut = t.reponse - 0.08; //    « Dans le coupe-boucle… »
  const cRig = t.ton - 0.08; //        « Ton secours s'ouvre. »
  const cOpen = t.voile - 0.2; //      « La voile se gonfle. »
  const cEt = t.et - 0.08; //          « Et toi… tu n'as pas bougé. »
  const closed = { tilt: 0, hang: 0, land: 0, deploy: 0, flaps: 0, loop: 0, piston: 0, power: 1, fabric: 1, gate: 1, threat: 1, mood: 1 };
  // slow motion: 225 m crossed on « deux cent vingt-cinq », a few metres more until the loop is cut
  const altAt = (time) => ALT.gate - 13 * Math.min(1, Math.max(0, (time - t.metres) / (t.tranche - t.metres)));

  /* ── « Deux cent vingt-cinq mètres. Plus de trente-cinq mètres par seconde. » — you cross the sheet ── */
  const s1 = { ...VIEW.cross, d: 450, az: -62, el: -8, fov: 46, shift: 60 };
  cut(t.tozero, SET.SCENE, s1, { ...STAGED, ...closed, alt: ALT.gate + 7, vz: SPEED.fall, spin: 0 });
  st(t.tozero, t.metres - t.tozero, { alt: ALT.gate }, "none");
  st(t.metres, cHand - t.metres, { alt: altAt(cHand) }, "none");
  st(t.tozero, cHand - t.tozero, { spin: 0.1 }, "none");
  chip("chip-seuil", null, 96, 470, t.plus + 0.2, cHand - 0.16);
  shot(t.tozero, cHand - t.tozero, { ...s1, d: 420, az: -74, el: -5 }, "sine.inOut");

  /* ── « Ta main ne bouge pas. » — the hand floats by the handle, still ── */
  cut(cHand, SET.SCENE, HANDLE, { ...STAGED, ...closed, alt: altAt(cHand), vz: SPEED.fall, spin: 0, hand: 1, shell: 0.45 });
  st(cHand, cHigh - cHand, { alt: altAt(cHigh) }, "none");
  shot(cHand, cHigh - cHand, { ...HANDLE, d: 285 }, "sine.inOut");

  /* ── « Quatre secondes. » — from high above your back, the ground below ── */
  cut(cHigh, SET.SCENE, HIGH, { ...STAGED, ...closed, alt: altAt(cHigh), vz: SPEED.fall, spin: 0 });
  st(cHigh, cCut - cHigh, { alt: altAt(cCut) }, "none");
  chip("chip-sol", null, 96, 470, t.quatre, cCut - 0.16);
  punch(t.secondes, 0.06, { up: 0.08, hold: 0.12, down: 0.35 });
  shot(cHigh, cCut - cHigh, { ...HIGH, d: 290 }, "sine.inOut");

  /* ── « Dans le coupe-boucle, un piston avance de cinq millimètres. La boucle est tranchée. » ── */
  // the hole from above: the piston creeps at the loop; rolled 65° so the loop's legs leave by the right edge, not the header
const s4 = { ...VIEW.cutter, d: 13, az: -25, el: 45, shift: 0, roll: 65 };
  cut(cCut, SET.SCENE, s4, {
    ...STAGED, ...closed, body: 0, alt: altAt(cCut), vz: SPEED.fall, spin: 0, fabric: 0, section: 1, litCutter: 1,
    fx: CUTTER.at[0], fy: CUTTER.at[1], fz: CUTTER.at[2], fs: 40,
  });
  st(cCut, t.tranche - cCut, { alt: altAt(t.tranche) }, "none");
  st(t.avance, t.mm + 0.4 - t.avance, { piston: 0.6 }, "sine.inOut"); // it creeps toward the loop
  st(t.trigger, 0.08, { piston: 1, loop: 1 }, "power2.out"); //            …and cuts through
  st(t.trigger, 0.25, { heart: 1, litLoop: 1 }, "power2.out");
  blip("#flash", t.trigger, 0.05, 0.04, 0.3);
  punch(t.tranche, 0.06, { up: 0.08, hold: 0.14, down: 0.4 });
  shot(cCut, cRig - cCut, { ...s4, d: 12 }, "sine.inOut");

  /* ── « Ton secours s'ouvre. » — the flaps open, the pilot chute leaves ── */
  cut(cRig, SET.SCENE, RIG, { ...STAGED, ...closed, alt: altAt(t.tranche), vz: SPEED.fall, spin: 0, loop: 1, piston: 1 });
  st(cRig, cOpen - cRig, { alt: altAt(t.tranche) - 3 }, "none");
  st(cRig + 0.2, t.souvre + 0.25 - cRig - 0.2, { flaps: 1 }, "power2.out");
  st(t.souvre - 0.1, cOpen - t.souvre + 0.1, { deploy: 0.2 }, "power1.in");
  shot(cRig, cOpen - cRig, { ...RIG, d: 420, ty: 40 }, "sine.out", RIG.d);

  /* ── « La voile se gonfle. » — the canopy inflates over you; the light lets go ── */
  const aOpen = altAt(t.tranche) - 3;
  cut(cOpen, SET.SCENE, OPEN0, {
    ...STAGED, ...closed, alt: aOpen, vz: SPEED.fall, spin: 0, loop: 1, piston: 1, flaps: 1, deploy: 0.25, gate: 0,
    fx: 0, fy: 200, fz: 0, fs: 450,
  });
  st(cOpen + 0.08, t.et - cOpen - 0.08, { deploy: 1 }, "sine.inOut");
  st(cOpen + 0.35, t.et + 0.1 - cOpen - 0.35, { hang: 1 }, "sine.inOut");
  st(t.gonfle, 1.3, { vz: SPEED.canopy }, "power2.out");
  st(t.gonfle, 0.25, { mood: 0, threat: 0.3 }, "power2.out");
  st(cOpen, t.toverdict - cOpen, { alt: 190 }, "power2.out");

  shot(cOpen, cEt - cOpen, { ...VIEW.open, d: 1500 }, "power2.out"); // up with the bag, back to the whole canopy

  /* ── « Et toi… tu n'as pas bougé. » — down the lines to you, hanging limp under it ── */
  cut(cEt, null, HUNG); // camera only: the tweens of the world carry on across it
  shot(cEt, t.toverdict - cEt, { ...HUNG, d: 1430 }, "sine.inOut");
}

