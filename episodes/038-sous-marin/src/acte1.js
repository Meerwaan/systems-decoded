// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). Two cuts (the shock, the control room), the rest
// in moves, all on the real times of the voice (cues of episode.json).
//
// THE HOOK. POSE0 / FIRST: under the hull, low, from behind its port flank — the bow rushing left, the sail, the rock
// wall filling the left and the bottom. It moves on frame 1 by its subject: the gap closes from 120 m to 0 on the real
// time of the shock (`gap`, "none"), the snow streaks along the hull, and the camera pushes toward the bow.
//   « montagne »   the punch (the wall is already there, behind the bow)
//   « carte »      the chart in the top slot: the route, and ahead of the boat, an empty circle — where the rock stands
//   « air »        the camera runs along the hull to the bank of bottles; they glow on the word
//   « 7 000 »      a long pull-back (by ratio) to the whole boat; the signal arrow presses down on it, the chip
//   « montagne… l'ignore ? »  on to the bow, in profile, the wall a few metres off; the chart again, the empty circle
// THE SCENE. Cut 1 in the breath before « Le choc »: the bow against the wall — first contact on the cut, and the bow
// folds up on « canette ». Cut 2, the same jolt from inside: the control room, the crew thrown toward the bow (never
// in close-up, nobody hurt, no punch on that sentence). Then a long pull-back to the whole boat: « 160 mètres » the
// depth beats in the header, « 17 fois » the pressure beats, « la pression » the rings of arrows squeeze the hull.
// A dive (by ratio) into the control room onto the emergency blow command: it glows on « geste », the chip on
// « chasse », the punch on « urgence ». « Alors… »: the camera leaves the command, follows its line to the valves and
// pulls back to VIEW.system — where act 2 cuts to the bench, the same pose.
// Hands over: VIEW.system, crush 1, depth 160, gap 0, speed 0, jolt 0, cmd 0, litCmd 1, sea 0.4, mood 1.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, VIEW, BANK, CMD, SUB, SYSTEM } from "./world.js";

const P = { side: 0, roll: 0, drift: 0.3, dof: 0 };
// the hook pushes in toward the bow (same line of sight, closer)
// (retouche 2: closer, round the bow and lower — qa: first half-second 1.0; the rock wall sweeps across the frame
// from frame 1, the bow grows)
const PUSH = { ...POSE0, tx: -5000, d: 6000, az: 74, el: -15, fov: 40 };
// the whole boat, a little closer on the cut before « Contre », then a slow pull to VIEW.mass
const MASS_IN = { ...VIEW.mass, d: 19000 };
// the whole boat squeezed: cut before « À 160 mètres » on its forward half, a frank pull (and a swing) to VIEW.press
// that runs until the dive (retouche 2: qa slow 14.5–17.0)
const PRESS_IN = { ...VIEW.press, d: 12000, az: 46 };
// the command, a little farther on the cut before « Il reste », slow push to VIEW.cmd
const CMD_OUT = { ...VIEW.cmd, d: 720 };
// the bank of bottles through the glass, from above (the decor's pose)
const BOTTLES = { ...VIEW.bottles };
// the shock: closer and lower than the shot before (a frank change of scale), the whole folded bow left of centre
// against the wall's lines — and a slow push. (az 40 from the decor's journal and az 10 tried: the bow on the edge.)
const IMPACT = { ...P, tx: -5500, ty: 0, tz: 0, d: 3000, az: 20, el: -14, fov: 40, shift: 60 };
const IMPACT_IN = { ...IMPACT, d: 2700 };
// the control room, and a little closer while the crew is thrown
const CREW = { ...VIEW.crew, tx: -3050, d: 950 };
const CREW_IN = { ...CREW, d: 880 };
// the bow AND the wall a few metres ahead of it, in profile (VIEW.near aimed at the wall left the bow on the edge)
const NEAR = { ...VIEW.near, tx: -5500, d: 5600 };
// the whole system, a little closer on the cut after « d'urgence », slow pull to VIEW.system (retouche: the cut to the
// valves and the move from there crossed the hull's glass in a blur)
const SYS_IN = { ...VIEW.system, d: 4900 };

// the light: what it stands around, and how wide
const L_BOW = { fx: SUB.bow, fy: 0, fz: 0, fs: 4000 };
const L_BANK = { fx: BANK.x, fy: BANK.y, fz: 0, fs: 700 };
const L_BOAT = { fx: -1500, fy: 0, fz: 0, fs: 12000 };
const L_ROOM = { fx: -2800, fy: 40, fz: 0, fs: 900 };
const L_CMD = { fx: CMD.at[0], fy: CMD.at[1], fz: CMD.at[2], fs: 150 };
const L_SYS = { fx: SYSTEM.centre[0], fy: SYSTEM.centre[1], fz: SYSTEM.centre[2], fs: 2500 };

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip, panel, punch } = D;
  const t = D.times({
    choc: "choc", carte: "carte1", remonter: "remonter", air: "air1", contre: "promesse:Contre", mille7: "mille7",
    tonnes: "tonnes", et: "promesse:Et", montagne2: "montagne2", ignore: "ignore", crash: "crash", canette: "canette",
    des: "scene:Des", projetes: "projetes", metres: "metres", fois: "scene:fois", pression: "pression", geste: "geste",
    chasse: "chasse1", urgence: "urgence1", alors: "ouvre:Alors", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  const beat = (sel, at, k = 1.16) =>
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, at);

  /* ── « Ton sous-marin fonce dans une montagne. Elle n'est pas sur ta carte. » ── */
  st(0, t.crash, { gap: 0 }, glide(2.2, 0.6)); // the boat rushes at the rock (closing fastest on frame 1), on the real time of the shock
  shot(0, t.remonter - 0.15, PUSH, glide(3.6, 0.6), POSE0.d);
  punch(t.choc, 0.06);
  panel("#carte", t.carte - 0.1, t.air - 0.7); // out before the camera lands on the bottles

  /* ── « Pour remonter, tu n'as que de l'air. » — along the hull to the bottles ── */
  shot(t.remonter - 0.15, t.air - t.remonter + 0.15, BOTTLES, "sine.inOut", PUSH.d);
  st(t.remonter - 0.15, t.air - t.remonter + 0.15, L_BANK, "sine.inOut");
  st(t.air - 0.05, 0.35, { litBank: 1 }, "power2.out");

  /* ── « Contre 7 000 tonnes. » — the whole boat, the weight ── */
  cut(t.contre - 0.1, null, MASS_IN, { ...L_BOAT, litBank: 0 }); // a cut, not a 0.9 s pull-back (qa: heurté 5.9)
  shot(t.contre - 0.1, t.et - 0.1 - (t.contre - 0.1), VIEW.mass, "sine.out");
  st(t.mille7 - 0.05, 0.5, { weight: 1 }, "power2.out");
  chip("chip-tonnes", null, 96, 470, t.tonnes - 0.05, t.et - 0.2);

  /* ── « Et cette montagne… pourquoi ta carte l'ignore ? » — to the bow, the wall a few metres off ── */
  shot(t.et - 0.1, t.ignore - t.et + 0.3, NEAR, "sine.inOut", VIEW.mass.d);
  st(t.et - 0.1, 0.6, { weight: 0 }, "sine.inOut");
  st(t.et - 0.1, 1.2, L_BOW, "sine.inOut");
  panel("#carte", t.montagne2 - 0.1, t.crash - 0.35);
  punch(t.ignore, 0.06);

  /* ── CUT 1 « Le choc écrase ta proue comme une canette. » ── */
  cut(t.crash, null, IMPACT, { ...L_BOW });
  shot(t.crash, t.des - 0.1 - t.crash, IMPACT_IN, "sine.out");
  st(t.crash, 0.22, { crush: 0.35 }, "power3.out"); // the contact
  st(t.crash, 0.45, { speed: 0 }, "power2.out");
  st(t.canette - 0.42, 0.42, { crush: 1 }, "power2.in"); // the bow folds up ON « canette »
  punch(t.canette, 0.06);

  /* ── CUT 2 « Des marins sont projetés. » — the same jolt, from inside ── */
  cut(t.des - 0.1, null, CREW, { ...L_ROOM, hull: 0.4, inner: 0.5 }); // the glass in front of the room thinned: the crew reads
  shot(t.des - 0.1, t.metres - 0.8 - (t.des - 0.1), CREW_IN, "sine.inOut");
  st(t.projetes - 0.1, 0.3, { jolt: 1 }, "power3.out");

  /* ── « À 160 mètres : 17 fois la pression de surface. » — the whole boat squeezed ── */
  const back = t.metres - 0.66; // in the breath before « À » (qa: heurté 14.9 on the pull-back from the room)
  cut(back, null, PRESS_IN, { ...L_BOAT, jolt: 0, hull: 1, inner: 1 });
  shot(back, t.geste - 0.6 - back, VIEW.press, "none", PRESS_IN.d); // moving right up to the cut before « Il reste »
  beat("#hud-clock", t.metres - 0.42);
  beat("#hud-count", t.fois - 0.35);
  st(t.pression - 0.1, 1.0, { press: 1 }, "power2.out");

  /* ── « Il reste un geste… la chasse d'urgence. » — dive onto the command ── */
  const dive = t.geste - 0.6; // in the breath before « Il reste » (qa: heurté 17.6 on the 1 s dive)
  cut(dive, null, CMD_OUT, { ...L_CMD, press: 0 });
  shot(dive, t.chasse - dive, VIEW.cmd, "sine.out");
  st(t.geste, 0.4, { litCmd: 1 }, "power2.out");
  chip("chip-chasse", null, 96, 470, t.chasse, t.alors - 0.15);
  punch(t.urgence, 0.06);

  /* ── « Alors… » — from the command along its line to the valves, and back to the whole system ── */
  const leave = t.urgence + 0.54; // in the breath after « d'urgence » (qa: heurté 19.8 on cmd → valves → system in 1.4 s)
  cut(leave, null, SYS_IN, {});
  shot(leave, t.tobench - leave, VIEW.system, "sine.inOut");
  st(t.alors - 0.3, 0.4, { litValve: 1 }, "power2.out");
  st(leave, t.tobench - leave, { sea: 0.4, ...L_SYS }, "sine.inOut");
}
