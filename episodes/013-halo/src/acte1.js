// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). The hook tells the whole crash in ten seconds,
// then the film winds back and tells it again from the first touch.
//
// THE HOOK, one move: the first frame (POSE0 / FIRST: the cell half-way through the steel) is already moving — the
// barrier slides back over the car, the camera pushes to the cockpit and is there when the top beam reaches the
// ring ("traverse": the white-hot line) → the car lodges, the fire is born behind the cockpit ("et prend feu") →
// back, by ratio, to the whole wreck: you stand up in front of the fire ("Tu en sors vivant") and go over the beam
// → down again to the empty cockpit, where the ring lights up, whole, in front of the fire ("un arceau…") and
// HOLDS the picture to the end of the sentence.
// THE REWIND (the silence): everything runs backwards to the first frame — and one cut takes us further back.
// THE SCENE, one move again: your right-rear wheel and the other car's ("Une roue touche la tienne") → round the
// car to its front while the barrier arrives, and time slows as it reaches the car ("Tu frappes le rail…") → down
// to the nose in the beams ("67 g": the one fast stretch of `ahead`, in a wide frame) → along the back of the
// barrier to the cockpit, in profile: your helmet shows through the opening as the beams give way, and the ring
// lights up between it and the top beam ("il n'y a qu'une chose"). Act 2 cuts at `tosystem`.
//
// The camera stays BEHIND the barrier from the front of the car on (it flies over it once, while it arrives).
// In profile the cockpit is hidden by the intact beams while `ahead` > ≈ 1.6: it is 1.6 on "casque".
import { setAct } from "@kit/overlay.js";
import { SET, STAGED } from "./world.js";

/* ── the poses (found with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the cockpit from close: your helmet under the ring, the top beam on it
const COCKPIT = { ...P, tx: 0, ty: 74, tz: 4, d: 340, az: -30, el: 13, shift: 150, side: 30 };
// a little further: the fire fills the frame behind the helmet and the ring
const FLAME = { ...P, tx: 0, ty: 76, tz: 0, d: 400, az: -32, el: 11, fov: 30, shift: 150, side: 30 };
// the whole wreck in the barrier, the fire behind it: you, standing, keep your head under the header
const WRECK = { ...P, tx: 0, ty: 80, tz: -20, d: 760, az: -40, el: 10, fov: 34, shift: 115 };
// the empty cockpit: the ring, whole, in front of the fire (fin.js comes back to this frame)
export const RING = { ...P, tx: 0, ty: 78, tz: 6, d: 345, az: -28, el: 10, shift: 150, side: -10 };
// your right-rear wheel and the other car's, from behind and low: from higher the body of the car climbs behind the
// header and under the label of the top slot
const CONTACT = { ...P, tx: -105, ty: 40, tz: -165, d: 640, az: -140, el: 7, shift: 55, side: 40 };
// the whole car from its front right, over the barrier that has just reached it
const COMING = { ...P, tx: 0, ty: 40, tz: 60, d: 1350, az: -26, el: 18, fov: 30, shift: 90, side: 70 };
// the nose in the beams, from behind the barrier
const IMPACT = { ...P, tx: 0, ty: 50, tz: 245, d: 700, az: -30, el: 16, fov: 34, shift: 140, side: -30 };
// the cockpit in profile, through the opening: the top beam at the height of your helmet, the ring between them
// (aimed at z 12: the whole ring is in the frame, your helmet left of the centre)
const PROFILE = { ...P, tx: 0, ty: 74, tz: 12, d: 420, az: -88, el: 3, shift: 150 };

// the light: what it stands around, and how wide
const L_COCKPIT = { fx: 0, fy: 74, fz: 4, fs: 60 };
const L_FLAME = { fx: 0, fy: 74, fz: 4, fs: 80 };
const L_WRECK = { fx: 0, fy: 72, fz: -20, fs: 300 };
const L_RING = { fx: 0, fy: 78, fz: 10, fs: 60 };
const L_WHEEL = { fx: -90, fy: 45, fz: -150, fs: 220 };
const L_CAR = { fx: 0, fy: 50, fz: 60, fs: 600 };
const L_RAIL = { fx: 0, fy: 60, fz: 300, fs: 300 };
const L_HEAD = { fx: 0, fy: 74, fz: 20, fs: 80 };

// `ahead` (metres), on the words
const A_RING = 0.9; //    the top beam is at the front of the ring
const A_TOUCH = 5.6; //   the barrier has reached the car: nothing has touched yet (the right endplate does at 5.5)
const A_NOSE = 3.75; //   the tip of the nose
const A_CRUSH = 2.05; //   the nose is gone: the front bulkhead of the cell is in the beams
const A_SEEN = 1.6; //    in profile, your helmet shows through the opening
const A_LEFT = 1.4; //    where act 2 stops time

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, jolt } = D;
  const t = D.times({
    traverse: "accroche:traverse", fire0: "fire0", feu: "accroche:feu",
    tu: "promesse", alive: "alive", vivant: "promesse:vivant", vivantEnd: "promesse:vivant$", hoop: "hoop", arceau: "promesse:arceau",
    said: "promesse$", toscene: "toscene", touche: "scene:touche", hit: "hit", rail: "scene:rail", v192: "v192",
    n67: "scene:67", between: "between", casque: "scene:casque", chose: "scene:chose", tosystem: "tosystem",
  });
  const F = D.first;
  setAct(tl, 1, 0);

  /* ───────────── A · "Premier tour. Ta Formule 1 traverse un rail d'acier…" ───────────── */
  // the first frame is POSE0 / FIRST, and it moves from frame 1: the barrier slides back over the car (a slow, even
  // travel: the frame is close) and the camera pushes to the cockpit — a move already under way. On "traverse" the
  // top beam is at the front of the ring…
  const atCockpit = t.traverse + 0.3;
  shot(0, atCockpit, COCKPIT, (u) => u * (0.7 + 0.3 * u));
  st(0, atCockpit, L_COCKPIT, "sine.inOut");
  st(0, t.traverse, { ahead: A_RING }, "none");
  // …the rear end has started to tear off (it must have left 0 before `ahead` 1.0)…
  st(0, t.traverse, { split: 0.3 }, "power1.in");
  st(t.traverse, t.fire0 - t.traverse, { split: 1 }, "sine.inOut");
  // …and the ring bears the steel: the white-hot line, while the beam goes over it (0.9 → 0.4), then it eases
  st(t.traverse - 0.12, 0.3, { stress: 1 }, "power2.out");
  const passed = t.traverse + 0.375 * (t.feu - t.traverse); // `ahead` 0.4 on the travel below
  st(passed, t.feu - passed, { stress: 0.15 }, "sine.inOut");
  // the car comes to rest in the barrier, lodged on "feu"
  st(t.traverse, t.feu - t.traverse, { ahead: 0 }, "sine.out");
  st(0, t.fire0, { kmh: 30 }, "none");
  st(t.fire0, t.feu + 0.1 - t.fire0, { kmh: 0 }, "power1.out");

  /* ───────────── "…et prend feu." ───────────── */
  // the camera breathes out while the beam passes over the helmet; the first flames as the car lodges, and on the
  // word the fire is there, behind the cockpit: the helmet and the ring stand out in front of it
  shot(atCockpit, t.feu + 0.2 - atCockpit, FLAME);
  st(atCockpit, t.feu - atCockpit, L_FLAME, "sine.inOut");
  st(t.feu - 0.45, 0.4, { fire: 0.12 }, "sine.in");
  st(t.feu - 0.05, 0.55, { fire: 0.6 }, "power2.out");

  /* ───────────── B · "Tu en sors vivant." ───────────── */
  // back, by ratio, to the whole wreck: you stand up in the cockpit, in front of the fire (the header's clock runs:
  // about 28 seconds, condensed) — then over the bent beam, to the track side, as the camera starts down again
  const pull = t.feu + 0.2;
  const atWreck = t.vivant + 0.3;
  shot(pull, atWreck - pull, WRECK, "sine.inOut", FLAME.d);
  st(pull, atWreck - pull, L_WRECK, "sine.inOut");
  st(pull, 0.5, { stress: 0 }, "sine.out");
  st(t.tu - 0.05, t.vivant + 0.15 - (t.tu - 0.05), { out: 0.5 }, "sine.inOut");
  const leave = Math.max(t.vivantEnd + 0.05, t.vivant + 0.2);
  st(leave, Math.max(0.3, t.hoop - 0.1 - leave), { out: 1 }, "sine.inOut");
  st(t.alive, t.hoop - t.alive, { sec: 28 }, "none");
  shot(atWreck, leave - atWreck, { d: WRECK.d * 1.03 });

  /* ───────────── "Grâce à un arceau… dont tu ne voulais pas." ───────────── */
  // down to the empty cockpit: the ring lights up on its word, while it is still small in the picture — the eye is
  // on it when the camera lands. Then it HOLDS: whole, in front of the fire, to the end of the sentence
  const atRing = t.arceau + 0.45;
  shot(leave, atRing - leave, RING, "sine.inOut", WRECK.d * 1.03);
  st(leave, atRing - leave, L_RING, "sine.inOut");
  st(t.arceau - 0.1, 0.45, { litHalo: 1 }, "sine.out");
  const rew = t.said + 0.08;
  shot(atRing, rew - atRing, { d: RING.d * 0.95, az: RING.az + 3 }, "power1.inOut");

  /* ───────────── the rewind (the silence before the scene) ───────────── */
  // the film winds back to its first frame — the fire dies, the rear end comes back, you sit down, the barrier
  // closes over the cockpit, the clock and the speed run backwards — and the cut takes us further back still
  const back = t.toscene - 0.02 - rew;
  shot(rew, back, D.pose0, "power2.in", RING.d * 0.95);
  st(rew, back, { fire: 0, split: 0, out: 0, litHalo: 0, sec: 0, ahead: F.ahead, kmh: F.kmh, fx: F.fx, fy: F.fy, fz: F.fz, fs: F.fs }, "power2.in");

  /* ───────────── "Une roue touche la tienne." ───────────── */
  // the cut: far from the barrier, 241 km/h — your right-rear wheel from behind, and the other car's wheel closing
  // on it. They touch on the word
  cut(t.toscene, SET.TRACK, { ...CONTACT, d: CONTACT.d * 1.1 }, { ...STAGED, ahead: 60, kmh: 241, rival: 0.5, sec: 0, ...L_WHEEL });
  shot(t.toscene, t.touche + 0.1 - t.toscene, { d: CONTACT.d * 0.97 }, "sine.out");
  st(t.toscene, t.touche - t.toscene, { rival: 1 }, "power2.in");
  jolt(t.touche, 0.5, 0.4);
  chip("chip-contact", null, 96, 452, t.touche + 0.08, t.hit - 0.05);
  st(t.touche + 0.75, 0.45, { rival: 0 }, "sine.in"); // the other car drops back, out of the picture

  /* ───────────── "Tu frappes le rail à 192 kilomètres-heure :" ───────────── */
  // round the car to its front, rising — and the barrier arrives from ahead, under the camera: sixty metres in the
  // time of three words, then time slows as it reaches the car (on "rail"), and it keeps coming, slowly: the right
  // endplate, the right-front wheel… The speed falls to the one the voice says
  const orbit = t.touche + 0.5;
  const atFront = t.rail + 0.35;
  shot(orbit, atFront - orbit, COMING, "sine.inOut", CONTACT.d * 0.97);
  st(orbit, atFront - orbit, L_CAR, "sine.inOut");
  const u1 = (t.rail + 0.1 - t.hit) / (t.n67 - t.hit);
  const p1 = (60 - A_TOUCH) / (60 - A_NOSE);
  const slow = (1 - p1) / (1 - u1); // the slope of the slow stretch
  const arrive = (u) => {
    if (u >= u1) return p1 + (u - u1) * slow;
    const v = 1 - u / u1;
    return p1 - slow * u1 * v - (p1 - slow * u1) * v * v * v;
  };
  st(t.hit, t.n67 - t.hit, { ahead: A_NOSE }, arrive);
  st(t.hit, t.v192 + 0.1 - t.hit, { kmh: 192 }, "none");

  /* ───────────── "67 g." ───────────── */
  // down toward the nose and the beams — and on the number the nose goes in: the only fast stretch of the barrier in
  // a frame this close, the time of the word
  shot(atFront, t.n67 - atFront, IMPACT, "sine.inOut", COMING.d);
  st(atFront, t.n67 - atFront, L_RAIL, "sine.inOut");
  st(t.n67, 0.5, { ahead: A_CRUSH }, "power3.out");
  jolt(t.n67, 0.5, 0.45);
  chip("chip-impact", null, 96, 470, t.n67 + 0.1, t.between - 0.05);

  /* ───────────── "Entre ton casque et l'acier… il n'y a qu'une chose." ───────────── */
  // along the back of the barrier to the cockpit, in profile, while the beams give way: your helmet shows through
  // the opening on its word, the top beam at its height — and it keeps coming, very slowly. On "chose" the ring
  // lights up: it is the one thing between them
  const glide = t.n67 + 0.45;
  const crushed = t.n67 + 0.5;
  // (whatever the voice does with its pause, the barrier keeps its half-second to open and the camera its second to turn)
  const seen = Math.max(t.casque - 0.1, crushed + 0.5);
  const atProfile = Math.max(t.casque + 0.25, glide + 1);
  shot(glide, atProfile - glide, PROFILE, "sine.inOut", IMPACT.d);
  st(glide, atProfile - glide, L_HEAD, "sine.inOut");
  st(crushed, seen - crushed, { ahead: A_SEEN }, "sine.inOut");
  st(seen, t.tosystem - seen, { ahead: A_LEFT }, "sine.out");
  st(t.chose - 0.05, 0.4, { litHalo: 1 }, "sine.out");
  // (act 2 cuts at tosystem, with `ahead` A_LEFT and the ring lit)
  shot(atProfile, t.tosystem - 0.02 - atProfile, { d: PROFILE.d * 0.93 }, "sine.out");
}
