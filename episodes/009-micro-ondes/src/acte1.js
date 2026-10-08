// 01 · MENACE — from the first frame to "Alors…" (0 → todoor). The oven is heating, your face is at its glass.
//
// The hook A · B is ONE move, each stage landing on its word: the cavity full of waves behind the plate ("Mille
// watts de micro-ondes") → your profile and the gap ("À dix centimètres de ton visage") → the same profile from
// the oven's side, where the plate throws the wave back ("Presque rien ne sort") → the door from three quarters,
// its glass lit ("la vitre les laisse passer") → a dive to the holes ("ce sont ses trous qui les arrêtent") →
// back out to the profile, where the door gapes and a front gets through ("Sauf si ta porte… ferme mal").
// "Sans elle ?" is not a cut: in that same profile the door dissolves, and the wave walks out to your face. Then
// two cuts: the researchers' hand in the open cavity and its five seconds; your eyes. And the film winds back.
//
// Your head is ten centimetres from the glass: every dive to the plate passes beside your cheek. The dive goes
// from az −50 to −36 (your head has left the picture before the camera is level with it, 40 cm away) and the
// camera leaves the plate by the side it came from, backing away before it turns.
// The hook's cards lie over y 1186–1542: until "ferme mal" is said, what stands under them is dark (measured).
import { setAct } from "@kit/overlay.js";
import { ramp } from "@kit/direct.js";
import { SET, STAGED } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the plate and, behind it, the lobes of the field
const CLOSE = { ...P, tx: -8, ty: 161, tz: 58, d: 150, az: -52, el: 5, fov: 40, shift: 120 };
// your profile, the gap, the door — and at the left edge the first lobes
const GAP = { ...P, tx: -8, ty: 162, tz: 64.5, d: 118, az: -90, el: 1, shift: 110 };
// the same profile from the oven's side: the lobes, the plate edge-on, what it throws back, the dark gap, your face
const BOUNCE = { ...P, tx: -8, ty: 160.5, tz: 58.5, d: 172, az: -90, el: 0, fov: 30, shift: 150 };
// the door from three quarters, over your shoulder
const DOOR = { ...P, tx: -8, ty: 161, tz: 57.3, d: 185, az: -50, el: 6, shift: 160 };
// the last rows of holes at the bottom of the window: the wall of light behind them, the dark rail under the cards
const HOLES = { ...P, tx: -8, ty: 150.4, tz: 57, d: 12, az: -36, el: 6, shift: 160, drift: 0 };
// the profile again: the door gapes, the wave gets through
const AJAR = { ...P, tx: -8, ty: 160.5, tz: 61, d: 160, az: -90, el: 0, fov: 30, shift: 150 };
// …and WITHOUT the door, a little closer: the open mouth, the wave, your face
const SANS = { ...P, tx: -8, ty: 161, tz: 63, d: 140, az: -90, el: 0, fov: 30, shift: 140 };
// the open cavity and the hand that reaches in; then its fingertips. NOT from az −40 / el 15: that is where the glass
// turntable mirrors the rim light (it comes from [36, 16, −42]) — a white slab under the hand, whatever the lamp does
const TEST = { ...P, tx: -7, ty: 157.5, tz: 45, d: 92, az: -28, el: 25, fov: 30, shift: 220 };
const PAIN = { ...P, tx: -7.3, ty: 158.5, tz: 41, d: 78, az: -28, el: 25, fov: 30, shift: 300 };
// your face, from beside the column
const EYES = { ...P, tx: -8, ty: 163, tz: 70, d: 125, az: -122, el: 2, fov: 30, shift: 120 };

const comma = (x, n) => x.toFixed(n).replace(".", ",");

export default function acte1({ D, world }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    dix: "accroche:dix", visage: "accroche:visage",
    promesse: "promesse", rien: "promesse:rien", sort: "promesse:sort$", glass: "glass", ce: "promesse:ce", holes: "holes", stop: "promesse:arrêtent",
    bad: "bad", ferme: "promesse:ferme", mal: "promesse:mal",
    tosans: "tosans", totest: "scene:Des-0.12", y: "scene:y", hand: "hand", secu: "scene:sécurités-0.1", pain: "pain",
    toeyes: "scene:Tes-0.12", eyes: "eyes", back: "back", todoor: "todoor",
  });
  const K = world.kitchen.A;
  setAct(tl, 1, 0);

  // the film winds back just before act 2 cuts (the rewind needs its third of a second)
  const rew = Math.min(t.back, t.todoor - 0.37);
  // the oven runs: the plate turns a tenth of a turn per second
  st(0, rew, { spin: 0.1 * rew }, "none");

  /* ───────────── A · "Mille watts de micro-ondes. À dix centimètres de ton visage." ───────────── */
  // the first frame is POSE0 / FIRST. The camera pushes toward the door from frame 1 (a sine.inOut that is already
  // under way), and at 0.1 s the field swells: that is what stops the thumb.
  st(0.1, 0.3, { power: 1 }, "sine.out");
  const toGap = t.dix - 0.45;
  shot(0, toGap, CLOSE, (u) => 0.5 - 0.5 * Math.cos(Math.PI * u) + 0.4 * u * (1 - u) * (1 - u));
  // "À dix centimètres": round to your profile — the door, the gap, your face
  const atGap = t.visage + 0.1;
  const toBounce = t.promesse - 0.2;
  shot(toGap, atGap - toGap, GAP);
  // the label sits IN the gap, at the height of your forehead (above the threads of light that go to your eyes)
  chip("chip-10", { x: -8, y: 168.5, z: 64.3 }, -182, -35, t.dix + 0.1, t.promesse - 0.25);
  // …and it never stands still: it leans on the gap until the next sentence takes it away
  shot(atGap, toBounce - atGap, { d: GAP.d * 0.95 }, "sine.inOut");

  /* ───────────── B · "Presque rien ne sort : la vitre les laisse passer, ce sont ses trous qui les arrêtent." ───────────── */
  // the camera slides to the oven's side: what the plate throws back goes home, nothing crosses the gap
  shot(toBounce, t.sort - toBounce, BOUNCE);
  chip("chip-renvoi", null, 96, 446, t.rien, t.glass - 0.25);
  // "la vitre": round to the door, over your shoulder — its glass lights up
  const toGlass = t.glass - 0.2;
  const dive = t.ce - 0.1;
  shot(toGlass, dive - toGlass, DOOR);
  st(t.glass + 0.1, 0.5, { litGlass: 1 }, "sine.out");
  st(dive - 0.2, 0.5, { litGlass: 0 }, "sine.inOut");
  // "ce sont ses trous": the dive — the holes come out of the plate, and behind them the wall of light
  const atHoles = t.stop + 0.1;
  shot(dive, atHoles - dive, HOLES, "sine.inOut", DOOR.d);
  st(dive, atHoles - dive, { fx: -8, fy: 152, fz: 57, fs: 20 }, "sine.inOut");
  st(t.holes, 0.4, { litMesh: 0.5 }, "sine.out");
  shot(atHoles, t.bad - atHoles, { d: HOLES.d * 0.9 }, "sine.inOut");

  /* ───────────── C · "Sauf si ta porte… ferme mal." ───────────── */
  // back out by the side the camera came from, to the profile: the same picture as "presque rien ne sort"…
  const atAjar = t.ferme - 0.1;
  // (the camera backs away first and only then turns: seen from close, the plate is never at a grazing angle)
  // (a cut, not a pull-back: backing away from the plate the camera crossed it at a grazing angle — a pale striped slab
  // across the picture for a whole second, on the sentence that plants the hook's question)
  cut(t.bad, SET.KITCHEN, { ...AJAR, d: AJAR.d * 1.07, roll: 0, side: 0, drift: 0 }, { fx: -8, fy: 150, fz: 70, fs: 110, litMesh: 0 });
  shot(t.bad, atAjar - t.bad, AJAR, "sine.inOut");
  // …but the door gapes (it swings toward the camera: its glass comes into view), and a front gets through
  st(t.ferme - 0.05, 0.45, { open: 0.06 }, "back.out(2.5)");
  st(t.mal - 0.1, t.tosans - t.mal + 0.1, { leak: 0.5 }, "none");
  shot(atAjar, t.tosans - atAjar, { d: AJAR.d * 0.94 }, "sine.inOut");

  /* ───────────── "Sans elle ?" ───────────── */
  // no cut: the door dissolves where it stands, in the picture that has just shown what it holds back — and the
  // fronts that were getting through one by one now walk out of the open mouth, to your face
  st(t.tosans, 0.25, { door: 0, light: 0 }, "power2.out");
  now(t.tosans + 0.26, { open: 0 });
  st(t.tosans, t.totest - t.tosans, { leak: 0.95 }, "none");
  shot(t.tosans, t.totest - t.tosans, SANS, "sine.inOut");
  chip("chip-sans", null, 96, 470, t.tosans + 0.12, t.totest - 0.16);

  const off = { ...STAGED, door: 0, light: 0 };
  /* ───────────── "Des chercheurs y ont mis la main, sécurités contournées : cinq secondes, et la douleur arrive." ───────────── */
  // (the cavity's lamp is turned down a little: with no door in front of it the dish is as bright as the hand)
  cut(t.totest, SET.KITCHEN, TEST, { ...off, you: 0, leak: 0, lamp: 0.4, fx: -6, fy: 158, fz: 46, fs: 60 });
  // "y ont mis la main": the forearm reaches in, to the middle of the cavity
  st(t.y - 0.1, t.hand + 0.3 - t.y + 0.1, { hand: 1 }, "sine.inOut");
  shot(t.totest, t.pain - t.totest, { d: TEST.d * 0.9 }, "sine.inOut", TEST.d);
  // "sécurités contournées": the clock of the test, which reaches its five seconds on "douleur"
  chip("chip-test", null, 96, 446, t.secu, t.toeyes - 0.16);
  D.readout("test-v", (time) => `${comma(5 * ramp(time, t.secu, t.pain), 1)} s`);
  // "la douleur arrive": the camera goes to the fingertips, the field makes room (`seen`), the heat is in them now
  st(t.pain, 0.6, { pain: 1 }, "power2.out");
  st(t.pain - 0.1, 0.7, { seen: 0.35 }, "sine.inOut");
  shot(t.pain - 0.1, t.toeyes - t.pain + 0.1, PAIN, "power2.out", TEST.d * 0.9);

  /* ───────────── "Tes yeux, eux, évacuent mal la chaleur." ───────────── */
  cut(t.toeyes, SET.KITCHEN, EYES, { ...off, leak: 0.6, fx: -8, fy: 160, fz: 72, fs: 60 });
  st(t.toeyes + 0.03, rew - t.toeyes - 0.03, { leak: 0.85 }, "none");
  st(t.eyes, 0.5, { eyes: 0.5 }, "sine.out");
  st(t.eyes + 0.5, rew - 0.1 - t.eyes - 0.5, { eyes: 1 }, "sine.inOut");
  shot(t.toeyes, rew - t.toeyes, { d: EYES.d * 0.86 }, "sine.inOut");
  chip("chip-eyes", K.youEyes, -420, -330, t.eyes + 0.1, rew - 0.1);

  // …and the film winds back: none of this happens (act 2 cuts at todoor)
  st(rew, 0.35, { leak: 0, eyes: 0 }, "power2.inOut");
  st(rew, t.todoor - rew, { spin: 0.1 * rew - 0.12 }, "power2.inOut");
  shot(rew, t.todoor - 0.02 - rew, { d: EYES.d }, "power2.inOut");
}
