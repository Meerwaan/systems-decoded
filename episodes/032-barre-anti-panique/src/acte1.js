// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One cut, two places of the same hall:
//
// THE HOOK, from OUTSIDE (POSE0, candidate b): the door seen from the exit, low, its leaf of glass on 64 % of the
// width; you crushed against it, the bar solid between you and us, the crowd paler behind you, and far in the back a
// signal glow (habillage.js). The crowd surges from frame 1 (`press` 0.8: the subject moves, not only the camera);
// the camera pushes in, fastest at the start (glide).
//   « …fermée. »            the crowd's load reaches the leaf (signal arrows toward us), the leaf trembles, the bolt
//                           warms: the header says « Fermée »
//   « …qui te sauve. »      a head of veille light runs the length of the bar
//   « Une barre doit la libérer… »   the bolt pulses: that is what must be freed
//   « …même avec la foule appuyée dessus. »   the load full, the crowd leaning on it
// « Sauf si elle s'ouvre vers toi » : the camera rises outside and looks into the hall through the glass: a ghost of
// the leaf, signal, swings away from us, toward you, its arc on the floor. THE CUT (toscene), matched on the crowd:
// the reverse angle, high behind it — « toute la salle pousse » ; and the camera dives along it onto you: your chest
// on the leaf, your arms caught, down to your hip, to the bar in full frame (« barre »). Then everything that is not
// the system leaves: the door and its bar alone on the dark, veille, for « Alors… » — act 2 cuts to the bench from
// VIEW.system, in place.
//
// Why « Sauf si » stays outside (the plan went to VIEW.door): from the hall the camera stands among the crowd, bodies
// of glass across the lens; from outside, risen, nothing stands between us and the door.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, VIEW, SYSTEM } from "./world.js";

const [SX, SY, SZ] = SYSTEM.centre;

/* ── the poses ── */
// outside: the push of the hook (same aim, a little closer and lower: the bar gains the middle)…
const OUT1 = { ...POSE0, ty: 110, d: 335, az: -142, el: -6 }; // (retouche: a 10° arc from POSE0 — the opening moves)
// …and slowly on toward the bar and the box, three quarters through the glass, the crowd leaning behind you
const OUT2 = { ...POSE0, tx: -8, ty: 104, tz: 22, d: 300, az: -145, el: -4, fov: 40, shift: 120 }; // (az −150: the back glow stays low left, off the box)
// outside, risen: over the door and into the hall through its glass — the ghost leaf swings away from us, into you
const OUTHI = { ...POSE0, tx: 10, ty: 60, tz: 50, d: 480, az: -160, el: 34, fov: 38, shift: 110 };
// the whole hall, the funnel of bodies to one small door
const CROWD = VIEW.crowd;
// your chest on the leaf, in profile from the latch corner (kept clear of the crowd): the leaf on the left, you
// against it, the crowd on the right (VIEW.chest, az −76, had the front row across the lens)
const CHEST = { ...VIEW.chest, tx: 0, ty: 135, tz: 22, d: 300, az: -84, el: 6, shift: 60 };
// along you: your arms caught between the leaf and the others
const ARMS = { ...CHEST, tx: 2, ty: 124, tz: 24, d: 290, az: -72, el: 4 };
// down past your hip to the bar in full frame (one descent: the HIP pose, d 170 az −68, was a stop that jolted)
const BAR = VIEW.hip;
// the door and its bar alone (act 2's cut to the bench is in place on it)
const ALONE = VIEW.system;

/* ── the light: what it stands around, and how wide ── */
const L_DOOR = { fx: 0, fy: 110, fz: 40, fs: 500 };
const L_BAR = { fx: -4, fy: 102, fz: 20, fs: 260 };
const L_ARC = { fx: 0, fy: 60, fz: 80, fs: 600 };
const L_HALL = { fx: 0, fy: 80, fz: 300, fs: 1200 };
const L_YOU = { fx: 6, fy: 120, fz: 22, fs: 250 };
const L_HIP = { fx: 0, fy: 98, fz: 16, fs: 120 };
const L_SYS = { fx: SX, fy: SY, fz: SZ, fs: 90 };

export default function acte1({ D }) {
  const { tl, st, shot, cut, punch, jolt } = D;
  const t = D.times({
    choc: "choc", sauve: "sauve", libere: "libere", appuyee: "appuyee", dessus: "dessus1",
    sauf: "sauf", vers: "verstoi", toi: "promesse:toi", toscene: "toscene", scene: "scene",
    pousse: "pousse1", poitrine: "poitrine", bras: "bras", bloques: "bloques", hanche: "hanche1", barre: "barre1",
    sceneEnd: "scene$", alors: "alors", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ═════════════ THE HOOK, from outside ═════════════ */
  /* ── « La foule t'écrase contre une porte… fermée. » ── */
  // the crowd surges from frame 1 (press 0.8, FIRST); the camera pushes in, fastest at the start
  const pushed = t.sauve - 0.3;
  shot(0, pushed, OUT1, glide(3, 0.4));
  st(0, pushed, L_DOOR, "sine.inOut");
  // (retouche 30/10) the subject moves from frame 1: the crowd packs at once (press 0.8 → 1) and its load strikes
  // the leaf — the signal arrows hit, ebb, hit again; on « Et c'est… » (≈ 2.8) the crowd breathes back and shoves
  // again. t = 0 stays POSE0 + FIRST (fin.js loops on it): every tween starts from the first frame's values
  st(0, 0.35, { press: 1 }, "power2.out");
  st(0, 0.25, { load: 0.6 }, "power2.out");
  st(0.4, 0.5, { load: 0.3 }, "sine.inOut");
  st(1.0, 0.4, { load: 0.55 }, "power2.out");
  const reshove = t.sauve - 1.05;
  st(reshove - 0.45, 0.4, { press: 0.8, load: 0.5 }, "sine.inOut");
  st(reshove, 0.3, { press: 1, load: 1 }, "power2.out");
  st(reshove + 0.4, 0.5, { load: 0.7 }, "sine.inOut");
  // « fermée »: the load reaches the leaf, the crowd packs, the bolt that holds it warms
  st(t.choc - 0.1, 0.5, { load: 0.7, press: 1 }, "power2.out");
  st(t.choc, 0.4, { litPene: 0.6 }, "sine.out");
  punch(t.choc, 0.06);

  /* ── « Et c'est cette porte qui te sauve. » ── */
  // a head of veille light runs the length of the bar; the camera goes on toward it
  st(t.sauve - 0.12, 0.85, { litBar: 1 }, "sine.inOut");
  punch(t.sauve, 0.05);
  shot(pushed, t.dessus - pushed, OUT2, "sine.inOut");
  st(pushed, 1.2, L_BAR, "sine.inOut");

  /* ── « Une barre doit la libérer… même avec la foule appuyée dessus. » ── */
  // « libérer »: the bolt pulses once — that is what must be freed
  st(t.libere - 0.05, 0.18, { litPene: 1 }, "power2.out");
  st(t.libere + 0.2, 0.6, { litPene: 0.6 }, "sine.inOut");
  // « appuyée »: the whole load on the leaf, toward the exit — toward us
  st(t.appuyee - 0.1, 0.45, { load: 1 }, "power2.out");
  punch(t.dessus, 0.06);

  /* ── « Sauf si elle s'ouvre vers toi. » ── */
  // the camera rises over the door and looks into the hall through its glass; on « vers » a ghost of the leaf,
  // signal, swings away from us — into the hall, toward you — its arc on the floor
  const rise = t.dessus + 0.1;
  const risen = t.vers - 0.05;
  shot(rise, risen - rise, OUTHI, "sine.inOut", OUT2.d);
  shot(risen, t.toscene - 0.02 - risen, { ...OUTHI, d: OUTHI.d * 0.96 }, "sine.out");
  st(rise, risen - rise, L_ARC, "sine.inOut");
  st(t.sauf - 0.2, 0.5, { load: 0.4, litPene: 0 }, "sine.inOut"); // (the arrows step back: the ghost is the picture)
  st(t.vers - 0.05, 0.6, { arcIn: 1 }, "sine.inOut");
  punch(t.toi, 0.05, { hold: 0.12, down: 0.32 });

  /* ═════════════ THE SCENE ═════════════ */
  /* ── « Derrière toi, toute la salle pousse. » ── */
  // a cut, matched on the crowd: the reverse angle, high behind it — the funnel of bodies to one small door. On
  // « pousse » it packs again
  cut(t.toscene, null, CROWD, { arcIn: 0, load: 0, litPene: 0, litBar: 0, press: 0.85, ...L_HALL }); // (the bar goes dark on the cut: it lights again on « barre »)
  const atHall = t.toscene;
  st(t.pousse - 0.2, 0.35, { press: 1 }, "power2.out");

  /* ── « Ta poitrine est collée au métal. » ── */
  // a cut onto you, a few frames before the sentence: your chest on the leaf, your head to the side (retouche 30/10:
  // the dive from the wide, 56° and four times closer in 1.3 s, was the jolt qa found at 11.3 s)
  const atChest = t.poitrine - 0.2;
  shot(atHall, atChest - atHall, { ...CROWD, d: CROWD.d * 0.93 }, "sine.out");
  cut(atChest, null, CHEST, { ...L_YOU, crowd: 0.6 }); // (close on you: the crowd paler, you the most legible)
  shot(atChest, t.bras - 0.25 - atChest, { ...CHEST, d: CHEST.d * 0.94 }, "sine.out");

  /* ── « Tes bras sont bloqués. » ── */
  // along you: your arms caught; on « bloqués » a shove from behind
  shot(t.bras - 0.25, t.bloques + 0.2 - (t.bras - 0.25), ARMS, "sine.inOut");
  jolt(t.bloques, 0.16, 0.45);

  /* ── « Il te reste ta hanche… contre une barre. » ── */
  // down to your hip on the bar (« hanche »), then the bar in full frame (« barre »): it lights up
  // one descent, arms → hip → bar, with no stop on « hanche » (retouche 30/10: two moves back to back, the second in
  // 0.8 s, was the jolt qa found at 15.7 s); on « hanche » it frames the hip on the bar, on « barre » the bar
  const toHip = t.bloques + 0.2; // (the end of the ARMS shot)
  shot(toHip, t.barre - 0.05 - toHip, BAR, "sine.inOut");
  st(toHip, t.hanche - toHip, L_HIP, "sine.inOut");
  st(t.barre - 0.1, 0.7, { litBar: 1 }, "sine.inOut");
  punch(t.barre, 0.06);

  /* ── « Alors… » ── */
  // everything that is not the system leaves: the crowd, you, the place; the door and its bar alone on the dark,
  // veille. Nothing moves but the camera, slowly, onto VIEW.system (act 2 cuts to the bench from it, in place)
  const fade = t.sceneEnd + 0.15;
  st(fade, 0.75, { crowd: 0, you: 0, shell: 0.2, load: 0, sign: 0, press: 0 }, "sine.inOut");
  st(fade + 0.3, 0.4, { mood: 0 }, "none");
  // (the bar stays lit, veille, to the cut: running its light back would move in the silence — act 2 takes it lit)
  shot(fade - 0.1, t.tobench - 0.03 - (fade - 0.1), ALONE, "sine.inOut");
  st(fade, 0.8, L_SYS, "sine.inOut");
}
