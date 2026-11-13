// 02 · AUTOPSIE (scene) — from torepos to tozero: the system at rest, back in the tub, in the pre-wash.
//
// The bench is gone: we are inside the machine again, behind the door, on its inner face. « Sa pastille attend,
// enfermée » — the dispenser shut, its trap faintly lit; the camera closes in slowly. « elle ne tombera pas au
// hasard » — it tilts down and pulls back: the trap stays shut while, far below, the arm's jets already work the
// dish (the pre-wash). Cut to the arm from above, still, dry: « Le bras n'a pas de moteur » — the empty hub, nothing
// under it but the tube. « ses propres jets le font tourner » — the tip jets come out, their arrows of push, and the
// arm starts the OTHER way, slowly, then faster. « Et ta croûte… » — the camera swings down in front of the door and
// looks up under the dish: the crust, intact, signal; « tient toujours ». Act 3 cuts from there.
import { SET, VIEW, STAGED, DISPENSER, ARM } from "./world.js";

/* ── the poses ── */
// the dispenser shut on the door's inner face, from inside the tub, three quarters (from the front it is a drawing)
const DISP = { ...VIEW.dispenser, ty: 54, d: 62, az: -122, el: 16, shift: 40 };
const DISP_IN = { ...DISP, d: 52, az: -134, el: 10 };
// the arm from the front, through the door's glass, still and dry: its hub and its bore (« pas de moteur »); the
// dish stays above the frame (behind the header it failed the contrast at 45.6 s)
// (retouche 13/11: az −15, d 68, side 180 — the arm runs down, left of the centre, out of the buttons' column x > 905)
const HUB_WIDE = { ...VIEW.hub, tx: -3, ty: 17, tz: 9, d: 68, az: -15, el: 33, shift: -225, side: 180 };
// closer on the tip that comes toward us: its jet, its arrow of push (« ses propres jets le font tourner »)
const HUB = { ...VIEW.hub, tx: -11.5, ty: 17.5, tz: 20, d: 50, az: -30, el: 30, shift: -225 };
// the crust from under it, intact
const CRUST = VIEW.crust;
const CRUST_IN = { ...CRUST, d: CRUST.d * 0.85 };

// the light: what it stands around
const L_DISP = { fx: DISPENSER.centre[0], fy: DISPENSER.centre[1] - 6, fz: DISPENSER.centre[2] - 4, fs: 36 };
const L_HUB = { fx: ARM.hub[0], fy: ARM.hub[1], fz: ARM.hub[2], fs: 34 };
const L_DISH = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: STAGED.fs };

// the arm's turn on the hub shot: the tip +x toward the camera, its jet and its arrow level on the screen (model journal)
const T_HUB = 0.27;

export default function acte2b({ D }) {
  const { st, shot, cut, chip, punch } = D;
  const t = D.times({
    torepos: "torepos", pastille: "repos:pastille", enfermee: "repos:enfermée", elle: "repos:elle", tombera: "repos:tombera", hasard: "repos:hasard",
    le: "repos:Le", moteur: "repos:moteur", ses: "repos:ses", jets: "repos:jets", tourner: "repos:tourner",
    et: "repos:Et", croute: "repos:croûte", tient: "repos:tient", fin: "repos$", tozero: "tozero",
  });

  /* ───────────── « Sa pastille attend, enfermée : » — the shut dispenser, its trap breathing ───────────── */
  cut(t.torepos, SET.SCENE, DISP, {
    ...STAGED, ...L_DISP, night: 1, eco: 1, door: 0, jets: 0.4, water: 0.4, heat: 0, temp: 22, trap: 0, tab: 0, crust: 1, crack: 0,
    ghosts: 0, thrust: 0, inlet: 0, loop: 0, pump: 1, mood: 0, cycle: 2, turn: 0, solo: 0, sinner: 0,
    litValve: 0, litSump: 0, litPump: 0, litArm: 0, litTrap: 0, tap: 0, drain: 0, you: 0, litres: 0, hand: 0,
  });
  // the pre-wash: the clock runs on, slowly, the arm turns with its low jets
  st(t.torepos, t.tozero - t.torepos, { cycle: 9 }, "none");
  st(t.torepos, t.le - 0.12 - t.torepos, { turn: 1.8 }, "none");
  // its trap glows on « pastille », breathes slowly
  st(t.pastille, 0.5, { litTrap: 0.7 }, "sine.out");
  st(t.pastille + 0.5, 0.9, { litTrap: 0.35 }, "sine.inOut");
  st(t.pastille + 1.4, 0.9, { litTrap: 0.7 }, "sine.inOut");
  // one slow orbit round the box over both sentences (12° of az, 6° of el: never a still frame)
  shot(t.torepos + 0.02, t.le - 0.14 - t.torepos, DISP_IN, "sine.inOut", DISP.d);
  chip("chip-pastille", null, 96, 470, t.enfermee, t.hasard + 0.3);

  /* ───────────── « elle ne tombera pas au hasard. » — the spray knocks on the trap; the latch holds ───────────── */
  const knock = (at, k) => {
    st(at, 0.07, { trap: k }, "power2.out");
    st(at + 0.07, 0.2, { trap: 0 }, "power2.in");
  };
  knock(t.tombera, 0.06);
  knock(t.hasard, 0.045);
  st(t.hasard + 0.3, 0.6, { litTrap: 0.45 }, "sine.inOut");

  /* ───────────── « Le bras n'a pas de moteur : » — cut: the empty hub, the arm still, dry ───────────── */
  cut(t.le - 0.12, SET.SCENE, HUB_WIDE, { ...L_HUB, jets: 0, thrust: 0, turn: T_HUB, litTrap: 0, litArm: 0 });
  shot(t.le - 0.1, t.ses - (t.le - 0.1), { ...HUB_WIDE, tx: -5, tz: 12, d: 62, az: -9, el: 33 }, "sine.inOut", HUB_WIDE.d);
  chip("chip-moteur", null, 96, 470, t.moteur, t.ses + 0.1);
  punch(t.moteur, 0.06);

  /* ───────────── « ses propres jets le font tourner. » — the tip jets, their push: it starts the other way ───────────── */
  shot(t.ses, t.et - 0.2 - t.ses, HUB, "sine.inOut", 56);
  // the jets come out ON « jets » (not before: the arm is still and dry until its word), their arrows with them
  st(t.jets - 0.06, 0.4, { jets: 0.5 }, "sine.out");
  st(t.jets - 0.06, 0.3, { thrust: 0.85, litArm: 0.4 }, "sine.out");
  // from rest, faster and faster: one long ramp to the end of the act (≈ 0.9 turn/s under the dish)
  st(t.jets + 0.04, t.tozero - (t.jets + 0.04), { turn: T_HUB + 1.5 }, "power2.in");

  /* ───────────── « Et ta croûte… tient toujours. » — down in front of the door, up under the dish ───────────── */
  // (retouche 13/11) a cut a few frames before « Et », on the jets that reach the dish, then one slow push: the
  // 54° rise in 0.8 s was the film's hardest move and smeared the arm and the dish
  cut(t.et - 0.12, SET.SCENE, CRUST, { ...L_DISH, thrust: 0, litArm: 0, jets: 1 });
  st(t.croute, 0.3, { mood: 1 }, "sine.inOut");
  shot(t.et - 0.1, t.tozero - (t.et - 0.1), CRUST_IN, "sine.inOut", CRUST.d);
  chip("chip-tient", null, 96, 470, t.tient, t.tozero - 0.2);
}

