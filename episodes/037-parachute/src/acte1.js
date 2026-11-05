// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One movement, two cuts. IN REAL TIME: `alt` falls
// at the fall's speed the whole act (1 350 → ≈ 240 m), the header reads it.
//
// THE HOOK. POSE0 / FIRST (candidate a): from above and behind your right shoulder, you, limp, spinning over the
// countryside, the rig solid on your back. It moves on frame 1 by its subject: the body turns (1/3 turn a second) and
// the air rushes up. « Ton sac, lui, est réveillé » : the camera glides down onto the rig while the spin dies out
// (it lands on a whole turn: the rig then sits where every pose aimed at it expects it), the diode lights frank on
// « réveillé ». « Dedans… » : the cloth turns to glass, the 200 grams of the box glow on « grammes ». « À quatre
// secondes du sol » : the camera springs up and back, straight above you — the countryside below, its roads going
// signal. « Sauf si, ce matin… » : it dives onto the control unit; on « oublié » the screen and the diode die.
// THE SCENE. Cut 1, from your side: the spin is back (one whole turn, « tu tournes »), the header's 200 km/h swells on
// « deux cents ». « Le sol monte » : the camera goes down past your level — the horizon climbs up the picture — and on
// under your chest, where the hand floats by the ripcord handle without taking it. Cut 2, from high above your back:
// the box glows through the cloth on « boîtier », the camera settles on VIEW.back; the spin lands on a whole turn.
// Hands over at tobench: VIEW.back, spin 2, tilt 0, hang 0, fabric 1, power 1, alt ≈ 240, vz SPEED.fall.
//
// Exactness: the box never « opens » anything here; no opening time anywhere; the header shows altitude and km/h only.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, STAGED, VIEW, LOOK, fallen, FIRST } from "./world.js";

/* ── the poses (checked with `look`, docs/journal/037-acte1.md) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
// the rig through its cloth, the box (« 200 grammes ») mid-picture, the control unit and its diode above it
const RIG = { ...P, ...CLOSE, tx: -2, ty: 8, tz: 12, d: 230, az: -45, el: 52, fov: 30, shift: 120 };
// straight above you, far: your body over the countryside, its roads going signal (« à quatre secondes du sol »)
const PLUNGE = { ...P, tx: 0, ty: -60, tz: -10, d: 420, az: -25, el: 74, fov: 58, shift: 0 };
// the control unit, its screen and diode, left of the buttons' column (« tu as oublié de l'allumer »)
const UNIT = { ...P, ...CLOSE, tx: 10, ty: 19.2, tz: 22, d: 40, az: -30, el: 50, fov: 28, shift: 40, side: 150 };
// from your side, a little above: you across the picture, the countryside under you (« tu tournes »)
const SIDE = { ...P, tx: 0, ty: -12, tz: -20, d: 420, az: -70, el: 24, fov: 42, shift: 40 };
// beside your chest, a little above: the hand floating by the handle, the countryside and its horizon behind
// you (« ta poignée ? ») — retouche 04/11: from under the chest (el −68) the body sat on black and the move to it jolted
const HANDLE = { ...P, tx: 6, ty: -24, tz: 14, d: 290, az: -55, el: 16, fov: 38, shift: 60 };
// high above your back: the rig, the arms around it (« il ne reste que ce boîtier »)
const HIGH = { ...P, tx: 0, ty: 14, tz: 16, d: 340, az: -40, el: 64, fov: 34, shift: 40 };

/** Spin from rate r0 to r1 (turns/s, linear) over [a, b]: the tween's target and its ease (no jolt in the rate). */
const spinEase = (r0, r1) => (r0 + r1 < 1e-6 ? (u) => u : (u) => (2 * r0 * u + (r1 - r0) * u * u) / (r0 + r1));

export default function acte1({ D }) {
  const { st, shot, cut, tl, chip, punch } = D;
  const t = D.times({
    choc: "choc", reveille: "accroche:réveillé", dedans: "promesse:dedans", grammes: "promesse:grammes",
    place: "promesse:place", quatre: "promesse:quatre", sauf: "promesse:sauf", oublie: "promesse:oublié",
    scene: "scene", deux: "scene:deux", sol: "scene:sol", monte: "monte1", poignee: "poignee", personne: "scene:personne",
    il: "scene:il", boitier: "boitier1", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the fall, in real time, the whole act ── */
  st(0, t.tobench, { alt: fallen(FIRST.alt, t.tobench) }, "none");

  /* ── the spin: 1/3 turn a second on frame 1, dying out onto a whole turn as the camera reaches the rig; back for
     « tu tournes » (one turn), slowing down to land on the next whole turn at tobench ── */
  const a1 = t.choc + 0.9; //            (2.0) the camera starts down onto the rig
  const a2 = t.dedans - 0.1; //          (4.0) the spin has died on a whole turn: spin 1
  const R1 = 1 / (a1 + (a2 - a1) / 2); // ≈ 1/3 turn a second
  st(0, a1, { spin: R1 * a1 }, "none");
  st(a1, a2 - a1, { spin: 1 }, spinEase(R1, 0));
  const cut1 = t.scene - 0.06; //        2 frames before « Tu tournes »
  const b1 = cut1 + 0.57;
  const b2 = t.monte - 0.04;
  const b3 = t.poignee;
  const Rf = 0.035;
  const R2 = (1 - Rf * ((b3 - b2) / 2 + (t.tobench - b3) / 2)) / ((b1 - cut1) / 2 + (b2 - b1) + (b3 - b2) / 2);
  const k1 = 1 + (R2 * (b1 - cut1)) / 2;
  const k2 = k1 + R2 * (b2 - b1);
  const k3 = k2 + ((R2 + Rf) * (b3 - b2)) / 2;
  st(cut1, b1 - cut1, { spin: k1 }, spinEase(0, R2));
  st(b1, b2 - b1, { spin: k2 }, "none");
  st(b2, b3 - b2, { spin: k3 }, spinEase(R2, Rf));
  st(b3, t.tobench - b3, { spin: Math.round(k3 + (Rf * (t.tobench - b3)) / 2) }, spinEase(Rf, 0));

  /* ═════════════ THE HOOK ═════════════ */
  /* « Tu tombes, inconscient. » — POSE0, the body turning; « inconscient » hits */
  punch(t.choc, 0.06);
  /* « Ton sac, lui, est réveillé. » — down onto the rig; the diode lit frank on « réveillé » */
  const land = t.dedans + 0.5; //        the approach lands after « Dedans »: slower, it rushes on frame 1 (no peak at 2 s)
  shot(0, land, RIG, glide(1.2, 0.3), VIEW.hook.d);
  st(t.reveille, 0.25, { wake: 1 }, "power2.out");
  chip("chip-allume", null, 96, 470, t.reveille + 0.06, t.place + 0.02);
  /* « Dedans, environ 200 grammes vont agir à ta place. » — the cloth turns to glass, the box glows on « grammes » */
  st(t.dedans, 0.8, { fabric: 0 }, "sine.inOut");
  st(t.dedans - 0.05, 0.7, { shell: 0.4 }, "sine.inOut"); // your glass dims: the rig is the subject, not the limbs
  st(t.grammes - 0.05, 0.3, { litUnit: 1 }, "power2.out");
  const cutA = t.quatre - 0.22; //       3 frames before « À »
  shot(land, cutA - land, { ...RIG, d: 222 }, "sine.inOut");
  /* « À quatre secondes du sol. » — a cut, straight above you: the countryside, its roads going signal */
  const cutB = t.sauf - 0.1; //          3 frames before « Sauf »
  cut(cutA, null, { ...PLUNGE, d: 445 }, { shell: 1, fabric: 1, litUnit: 0 });
  shot(cutA, cutB - cutA, PLUNGE, "sine.out");
  st(t.quatre, 0.9, { threat: 0.9 }, "sine.inOut");
  /* « Sauf si, ce matin, tu as oublié de l'allumer. » — the dive onto the control unit; on « oublié » it dies */
  cut(cutB, null, { ...UNIT, d: 46 }); // a cut onto the control unit (the dive from PLUNGE jolted)
  shot(cutB, cut1 - cutB, { ...UNIT, d: 36 }, "sine.inOut");
  st(t.oublie, 0.15, { power: 0, wake: 0 }, "power2.in");
  punch(t.oublie, 0.06);
  chip("chip-eteint", null, 96, 470, t.oublie + 0.03, cut1 - 0.13);

  /* ═════════════ THE SCENE ═════════════ */
  /* « Tu tournes, à 200 kilomètres-heure. » — cut 1, from your side: the spin is back; the header swells on « deux » */
  cut(cut1, SET.SCENE, SIDE, { ...STAGED, power: 1, threat: 0.6, hand: 0, fabric: 1, tilt: 0, hang: 0, land: 0, deploy: 0, flaps: 0, loop: 0, piston: 0 });
  shot(cut1, t.sol - 0.15 - cut1, { ...SIDE, d: 380 }, "sine.out");
  tl.fromTo("#hud-count", { scale: 1 }, { scale: 1.18, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, t.deux);
  /* « Le sol monte. » — the camera goes down past your level: the horizon climbs the picture; on under your chest */
  const dn0 = t.sol - 0.15;
  const dn1 = t.poignee + 0.95;
  shot(dn0, dn1 - dn0, HANDLE, "sine.inOut");
  st(t.sol - 0.1, 0.7, { threat: 1 }, "sine.inOut");
  punch(t.monte, 0.06);
  /* « Ta poignée ? Personne ne la tirera. » — the hand drifts by the handle and does not take it */
  st(t.poignee, 1.0, { hand: 1 }, "sine.inOut");
  shot(dn1, t.il - 0.06 - dn1, { ...HANDLE, d: 280 }, "sine.out");
  chip("chip-poignee", null, 96, 470, t.personne, t.il - 0.2);

  /* « Il ne reste que ce boîtier, dans ton dos. » — cut 2, from high above your back; the box glows through the
     cloth on « boîtier »; the camera settles on VIEW.back, the picture calms down for « Alors… » */
  const cut2 = t.il - 0.06;
  cut(cut2, SET.SCENE, HIGH, { ...STAGED, power: 1, threat: 1, hand: 0, fabric: 1, tilt: 0, hang: 0, land: 0, deploy: 0, flaps: 0, loop: 0, piston: 0 });
  shot(cut2, t.tobench - 0.66 - cut2, VIEW.back, "sine.inOut", HIGH.d);
  st(t.boitier - 0.1, 0.4, { fabric: 0.35, litUnit: 0.6, shell: 0.4 }, "sine.out");
  st(t.boitier + 1.0, 0.7, { fabric: 1, litUnit: 0, shell: 1 }, "sine.inOut");
}
