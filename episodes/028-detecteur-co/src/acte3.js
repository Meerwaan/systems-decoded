// 03 · RÉPONSE — from « Une heure passe. » to « Et tes enfants… respirent. » (tozero → toverdict). The climax, in cuts:
// one shot per breath of the voice, each cut laid a few frames before its sentence, its pose complete and its state
// complete ({ ...STAGED, …NIGHT }): nothing is inherited from the act before, nothing from the shot before.
//
// THE NIGHT IN THE HEADER. The clock runs an hour on « passe » (01:50 → 02:50), then ten minutes on « Dix », ten
// more on « Vingt » (03:10); the gauge (#gauge, back on « passe ») and the ring on the detector's face fill by steps
// on the words that count; on « seuil » the last segment: the fill turns veille, « Seuil atteint — il sonne ».
//   « Une heure passe. »               CUT (a frank change of scale): the flat seen from high, everyone asleep
//   « Le gaz monte encore. »           CUT: round the children asleep, the gas between their beds — DENSER (co 1), not higher
//   « Ton sang se charge… »            CUT: the blood, under the gauge; on « charge » more cells give up their oxygen
//   « …et le boîtier compte toujours. » CUT: the detector on its wall, the camera pushes; « compte »: the ring fills
//   « Dix minutes. Vingt. »            the same push goes on: the clock jumps twice, the ring and the gauge follow
//   « La dose atteint son seuil. »     CUT close on the face: the ring completes on « seuil »; the gauge leaves
//   « Le boîtier hurle. »              CUT a step back: on « hurle » the alarm — slow rings, the light on the wall
//   « Tu ouvres les yeux. »            CUT (the light of the wall → you it lights): you sit up, the box sounding on
//                                      its wall, named by its chip
//   « La fenêtre. »                    CUT: you at the window, your hand on its handle; it opens, the air comes in low
//   « Dehors. »                        CUT: outside, the three of you, the flat behind; the camera nears the children
//   « Et tes enfants… respirent. »     on « respirent »: their breath in veille, the air clear (« — »), mood 1 → 0
// The alarm's sound (sfx « beeps ») plays only in the gaps between « hurle », « yeux » and « fenêtre »: no picture here
// moves a sound.
// Hands over (toverdict): OUT1 (outside, close to the children), the flat (mood 0), breath 1, ppm 0, dose 1, clock
// 03:10, alarm 1, window 1, air 0.6, me 1 (mePose 2), kidsOut 1, you 0. fin.js cuts to the bench from there.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, LOOK, STAGED, BLOODED, STORY, DETECTOR, OUTSIDE } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const [DX, DY, DZ] = DETECTOR.at;

/* ── the poses ── */
// the flat from high (VIEW.house), and a slow push into it while the hour passes
const HOUSE0 = { ...P, ...VIEW.house };
const HOUSE1 = { ...HOUSE0, d: HOUSE0.d * 0.9 };
// the children asleep in their room, the gas between their beds (VIEW.kids): it thickens round them
const KIDS0 = { ...P, ...VIEW.kids };
const KIDS1 = { ...KIDS0, d: KIDS0.d * 0.93 };
// the blood under the gauge (act 2's « comme ton sang », shift −40)
const BLOOD0 = { ...P, ...VIEW.blood, shift: -40 };
const BLOOD1 = { ...BLOOD0, d: BLOOD0.d * 0.88 };
// the detector on its wall, under the gauge: a long push while it counts, ten minutes, twenty
const WALL0 = { ...P, ...CLOSE, tx: DX, ty: DY, tz: DZ + 3, d: 110, az: -30, el: 4, fov: 30, shift: -60 };
const WALL1 = { ...WALL0, d: 82 };
// close on its face: the ring completes
const FACE0 = { ...P, ...CLOSE, tx: DX, ty: DY, tz: DZ + 2.5, d: 56, az: -24, el: 6, fov: 28, shift: -140 };
const FACE1 = { ...FACE0, d: 50 };
// a step back: the rings of the alarm and the light on the wall (the gauge has left: the box rises to the middle)
const ALARM0 = { ...P, tx: DX, ty: DY, tz: DZ + 3, d: 150, az: -28, el: 4, fov: 30, shift: 90 };
const ALARM1 = { ...ALARM0, d: 138 };
// you sit up in bed, the box sounding on its wall (found on a planche of four)
const EYES0 = { ...P, tx: -50, ty: 125, tz: -75, d: 430, az: -58, el: 6, fov: 34, shift: -10 };
const EYES1 = { ...EYES0, d: 405 };
// your window from OUTSIDE, in the night: the frame, the sash swinging inward, you behind the glass wall at its
// handle (right), the gas of the bedroom behind you, the fresh air going in. (Seen from inside — VIEW.window — the
// sash of glass did not read and you stood on the edge of the frame.) It matches the next cut: « Dehors ».
const WIN0 = { ...P, tx: 170, ty: 140, tz: -40, d: 300, az: 75, el: 2, fov: 36, shift: 40 };
const WIN1 = { ...WIN0, d: 280 };
// outside: the three of you, the flat behind — then nearer the children
const OUT0 = { ...P, ...VIEW.outside };
const OUT1 = { ...OUT0, tx: (OUTSIDE.kids[0][0] + OUTSIDE.kids[1][0]) / 2 - 10, ty: 95, tz: (OUTSIDE.kids[0][2] + OUTSIDE.kids[1][2]) / 2, d: 350, shift: 40 };

/* ── the light: what it stands around, and how wide ── */
const L_HOUSE = { fx: -110, fy: 60, fz: -90, fs: 1500 };
const L_KIDS = { fx: -330, fy: 50, fz: -30, fs: 450 };
const L_WALL = { fx: DX, fy: DY, fz: DZ, fs: 30 };
const L_ALARM = { fx: DX, fy: DY, fz: DZ, fs: 60 };
const L_EYES = { fx: -55, fy: 110, fz: -60, fs: 320 };
const L_WIN = { fx: 165, fy: 130, fz: -30, fs: 300 };
const L_OUT = { fx: OUTSIDE.me[0], fy: 90, fz: OUTSIDE.me[2] + 20, fs: 420 };

const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D, world }) {
  const { tl, st, shot, cut } = D;
  const A = world.system.A;
  const t = D.times({
    zero: "zero", tozero: "tozero", passe: "passe",
    toGaz: "zero:gaz-0.22", monteW: "zero:monte",
    toSang: "zero:Ton-0.12", chargeW: "zero:charge",
    toWall: "zero:et-0.12", compteW: "zero:compte",
    dixW: "reponse:Dix", vingtW: "reponse:Vingt",
    toSeuil: "reponse:La-0.12", seuilW: "reponse:seuil",
    toHurle: "reponse:Le-0.12", hurleW: "reponse:hurle",
    yeux: "yeux", fenetre: "fenetre", fenetreW: "reponse:fenêtre",
    dehors: "dehors", enfantsW: "reponse:enfants", respirentW: "reponse:respirent",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  // what act 2 hands over (the story's numbers, as the timeline holds them just before the cut)
  D.tw.time(t.tozero - 1e-3);
  const H = { clock: D.S.clock, ppm: D.S.ppm, dose: D.S.dose, co: D.S.co, swap: D.S.swap };
  D.tw.time(0);
  const NIGHT = { clock: H.clock, ppm: H.ppm, dose: H.dose, co: H.co, swap: H.swap };

  /** The header answers a word: the clock knocks. */
  const knock = (at, k = 1.14) => {
    tl.fromTo("#hud-clock", { scale: 1 }, { scale: k, duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to("#hud-clock", { scale: 1, duration: 0.35, ease: "power2.inOut" }, at + 0.12);
  };

  /* ───────────── « Une heure passe. » — the flat from high; the clock runs an hour ───────────── */
  cut(t.tozero, SET.FLAT, HOUSE0, { ...STAGED, ...NIGHT, ...L_HOUSE });
  shot(t.tozero, span(t.tozero, t.toGaz), HOUSE1, "sine.inOut");
  D.panel("#gauge", t.passe - 0.15, t.seuilW + 0.55);
  st(t.passe + 0.06, 1.0, { clock: STORY.hour, dose: 0.5 }, "sine.inOut");
  knock(t.passe + 1.06);

  /* ───────────── « Le gaz monte encore. » — round the children asleep; the haze denser, not higher ───────────── */
  cut(t.toGaz, SET.FLAT, KIDS0, { ...STAGED, ...NIGHT, clock: STORY.hour, dose: 0.5, ...L_KIDS });
  shot(t.toGaz, span(t.toGaz, t.toSang), KIDS1, "sine.inOut");
  st(t.monteW, 1.0, { co: 1, ppm: STORY.ppmHigh }, "sine.inOut");

  /* ───────────── « Ton sang se charge… » — the blood, under the gauge ───────────── */
  cut(t.toSang, SET.FLAT, BLOOD0, { ...STAGED, ...BLOODED, ...NIGHT, clock: STORY.hour, dose: 0.5, co: 1, ppm: STORY.ppmHigh });
  shot(t.toSang, span(t.toSang, t.toWall), BLOOD1, "sine.inOut");
  st(t.chargeW, 0.45, { swap: 0.85 }, "sine.out");
  D.punch(t.chargeW, 0.06, { hold: 0.14, down: 0.3 });

  /* ───────────── « …et le boîtier compte toujours. » « Dix minutes. Vingt. » — the detector counts ───────────── */
  const COUNT = { ...STAGED, ...NIGHT, clock: STORY.hour, dose: 0.5, co: 1, ppm: STORY.ppmHigh, swap: 0.85, ...L_WALL };
  cut(t.toWall, SET.FLAT, WALL0, COUNT);
  shot(t.toWall, span(t.toWall, t.toSeuil), WALL1, "sine.inOut");
  st(t.compteW, 0.3, { dose: 0.75 }, "sine.out");
  st(t.dixW, 0.35, { clock: STORY.hour + 10, dose: 0.88 }, "sine.out");
  knock(t.dixW + 0.35);
  st(t.vingtW, 0.35, { clock: STORY.alarm, dose: 0.96 }, "sine.out");
  knock(t.vingtW + 0.35);

  /* ───────────── « La dose atteint son seuil. » — close on the face: the ring completes ───────────── */
  const SEUIL = { ...COUNT, clock: STORY.alarm, dose: 0.96 };
  cut(t.toSeuil, SET.FLAT, FACE0, SEUIL);
  shot(t.toSeuil, span(t.toSeuil, t.toHurle), FACE1, "sine.inOut");
  st(t.seuilW, 0.2, { dose: 1 }, "power2.out");
  tl.to("#gauge-s0", { opacity: 0, duration: 0.12 }, t.seuilW + 0.04);
  tl.to("#gauge-s1", { opacity: 1, duration: 0.15 }, t.seuilW + 0.08);

  /* ───────────── « Le boîtier hurle. » — a step back; on « hurle » the alarm ───────────── */
  const SOUND = { ...SEUIL, dose: 1, ...L_ALARM };
  cut(t.toHurle, SET.FLAT, ALARM0, SOUND);
  shot(t.toHurle, span(t.toHurle, t.yeux), ALARM1, "sine.inOut");
  st(t.hurleW, 0.25, { alarm: 1 }, "power2.out");
  D.punch(t.hurleW, 0.06, { hold: 0.12, down: 0.3 });

  /* ───────────── « Tu ouvres les yeux. » — you sit up, the box sounding on its wall ───────────── */
  const AWAKE = { ...SOUND, alarm: 1, you: 0, me: 1, mePose: 0, ...L_EYES };
  cut(t.yeux, SET.FLAT, EYES0, AWAKE);
  shot(t.yeux, span(t.yeux, t.fenetre), EYES1, "sine.inOut");
  D.chip("chip-sonne", A.face, 40, -150, t.yeux + 0.1, t.fenetre - 0.16);

  /* ───────────── « La fenêtre. » — your hand on the handle; it opens, the air comes in low ───────────── */
  cut(t.fenetre, SET.FLAT, WIN0, { ...AWAKE, mePose: 1, ...L_WIN });
  shot(t.fenetre, span(t.fenetre, t.dehors), WIN1, "sine.inOut");
  st(t.fenetreW - 0.04, 0.66, { window: 1 }, "sine.inOut");
  st(t.fenetreW + 0.1, 0.5, { air: 0.3 }, "sine.inOut");
  st(t.fenetreW + 0.1, span(t.fenetreW + 0.1, t.respirentW - 0.15), { ppm: 0 }, "sine.inOut");

  /* ───────────── « Dehors. » « Et tes enfants… respirent. » — outside; the relief ───────────── */
  // (no ppm in this state: it is still falling, from « fenêtre » to just before « respirent »)
  const { ppm: _ppm, ...OUTSIDE_NIGHT } = AWAKE;
  cut(t.dehors, SET.FLAT, OUT0, { ...OUTSIDE_NIGHT, mePose: 2, kidsOut: 1, window: 1, air: 0.6, co: 0.8, ...L_OUT });
  shot(t.dehors + 0.02, span(t.dehors + 0.02, t.toverdict), OUT1, "sine.inOut", OUT0.d);
  // the breaths (one puff every 3.4 s per mouth, foyer.js): from « enfants » a child's breath is at its height, yours
  // on « respirent », the other child's just after
  st(t.enfantsW - 0.1, 0.4, { breath: 1 }, "sine.out");
  st(t.respirentW, 0.3, { mood: 0 }, "sine.inOut");
  // the relief: the gas of the flat behind you thins out of the picture (the window open, the air in): only the night
  st(t.respirentW, 0.7, { co: 0.08, leak: 0.3, air: 1 }, "sine.inOut");
}
