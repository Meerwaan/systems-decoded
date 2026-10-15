// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). Two moves, one cut. The plan, sentence by sentence:
// docs/019-actes.md (and 019-actes-maj.md, which prevails).
//
// THE HOOK, in one move. The first frame (POSE0 / FIRST) is the instant of the crash, T+00 ms: the bumper on the wall,
// you upright at the wheel, and across your chest the strap, loose — the brightest thing in the picture; behind your
// shoulder the pillar, and in its foot the retractor. It moves on frame 1:
//   the charge   a white flash in the pillar's foot (the charge goes off at T+0: what the voice explains next), its gas
//                glowing on in the case — slowly, the film is in slow motion
//   the strap    it starts pulling itself in on frame 1, its weave running up to the ring; on "resserre" it slams flat
//                on your chest — the header goes "Du mou" → "Tendue", the clock reaches T+20 ms on "seule"
//   you          nothing: everything moves but you ("Tu n'as pas encore bougé"); the nose folds, the shards fly
//   the camera   closes in on your chest, follows the strap up to the ring, down the pillar to the retractor on
//                "partir" — the gas still glows in the case, then dies ("vient de partir") — and onto the generator,
//                spent, dark: "qu'une fois" holds on it
// THE SCENE — what if nothing pulled the strap in. A cut: the same car, before the crash, in profile, wide; the wall
// comes, the car stops against it on "mur", the nose folds. "Toi, non" : your body goes on into a strap that has NOT
// been pulled in; the camera dives to you, three quarters front — the strap standing off your chest ("du mou"),
// your coat, your posture; on "trop" the strap bites, late. The label "Si rien ne la retend" says it all along.
// The header's second readout says "Du mou" there and nothing else (no load in this act: 019-actes-maj.md).
// Act 2 cuts at `tosystem` with its own state.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, HOME } from "./world.js";

/* ── the poses (from the set's journal, docs/journal/019-cabine.md and 019-model.md, checked with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = HOME;
// closer on your chest: the strap at its biggest, the ring and the retractor out of the picture
const CHEST = { ...P, tx: -41, ty: 92, tz: 5, d: 240, az: -122, el: 8, fov: 37, shift: 150, side: 90, drift: 0 };
// the pillar from your door: you, the strap over your shoulder, the ring, the strap down to the retractor (VIEW.pillar)
const PILLAR = { ...P, tx: -80, ty: 72, tz: 40, d: 360, az: -80, el: 6, fov: 34, shift: 120 };
// the retractor in the pillar's foot, from behind the door (model.js' `climax`, moved by HOME): strap, case, generator
const REEL = { ...P, tx: HX, ty: HY + 11, tz: HZ + 1.5, d: 96, az: -54, el: 10, shift: 160 };
// the generator, close (model.js' `charge`, moved by HOME)
const CHARGE = { ...P, tx: HX, ty: HY + 9, tz: HZ + 5, d: 50, az: -52, el: 14, shift: 160 };
// the crash in profile, wide: the wall at the left, the nose, you at the right
const WIDE = { ...P, tx: -30, ty: 80, tz: -170, d: 900, az: -90, el: 5, fov: 42, shift: 150, drift: 0 };
// you and the strap across you, three quarters front — the hook's own angle: the strap standing off your chest, its
// belly under the ring. (In profile, az −108, your left arm hides the strap across your chest: nothing reads.)
const LOOSE = { ...P, tx: -41, ty: 92, tz: 4, d: 255, az: -121, el: 7, fov: 37, shift: 150, side: 70 };

// the light: what it stands around, and how wide
const L_CHEST = { fx: -44, fy: 92, fz: 6, fs: 150 };
const L_PILLAR = { fx: -70, fy: 80, fz: 28, fs: 150 };
const L_REEL = { fx: HX, fy: HY + 10, fz: HZ + 2, fs: 30 };
const L_CAR = { fx: -30, fy: 80, fz: -150, fs: 330 };
const L_YOU = { fx: -37, fy: 92, fz: 0, fs: 150 };

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    still: "still", tight: "tight", alone: "alone", blast: "blast", partir: "promesse:partir", retend: "retend",
    butonce: "butonce", once: "once",
    toscene: "toscene", stops: "stops", mur: "mur", goeson: "goeson", loose: "loose", manteau: "manteau",
    posture: "posture", fewcm: "fewcm", toomuch: "toomuch", back: "back", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── "Choc frontal. Tu n'as pas encore bougé…" ───────────── */
  // frame 1: the charge goes off in the pillar's foot (a white flash that has a place, ≈ 0.15), its gas glows on;
  // the strap starts pulling itself in — the camera closes in on your chest, fastest at the start
  st(0, 0.5, { fire: 0.2 }, "none");
  st(0.5, t.partir - 0.5, { fire: 0.8 }, "none");
  st(0, t.tight, { slack: 0.72 }, "sine.out");
  st(0, t.alone, { ms: 20 }, "none");
  st(0, t.alone + 0.6, { crush: 0.25 }, "sine.out"); // the nose folds — everything moves but you
  st(t.still - 0.6, 1.4, { debris: 0.25 }, "sine.out");
  shot(0, t.tight, CHEST, glide(1.4, 0.7));

  /* ───────────── "…et ta ceinture se resserre, seule." ───────────── */
  // on "resserre" it slams flat on your chest: "Du mou" → "Tendue" in the header, T+20 ms on "seule". The camera
  // swings out to the door to follow it: your shoulder, the ring, the strap down the pillar
  st(t.tight, t.alone - t.tight, { slack: 0 }, "power2.in");
  shot(t.tight, t.blast - t.tight, PILLAR, glide(0.7, 0.9));
  st(t.tight, t.blast - t.tight, L_PILLAR, "sine.inOut");

  /* ───────────── "Une charge explosive vient de partir, pour la retendre." ───────────── */
  // down the pillar to the retractor, there on "partir": the gas still glows in the case, then dies; the frame turns
  // to glass, the light closes on it
  shot(t.blast, t.partir - t.blast, REEL, "sine.out", PILLAR.d);
  st(t.blast, t.partir - t.blast, { ...L_REEL, xray: 0.5 }, "sine.inOut");
  st(t.partir, t.butonce - t.partir, { fire: 1 }, "sine.inOut");
  shot(t.partir, t.butonce - t.partir, { d: REEL.d * 0.9 }, "sine.out");
  chip("chip-charge", null, 96, 470, t.partir + 0.1, t.once - 0.1);

  /* ───────────── "Mais ça, elle ne le fera… qu'une fois." ───────────── */
  // close on the generator, spent: dark, burnt. The picture holds
  shot(t.butonce, t.once - t.butonce, CHARGE, "sine.inOut");
  shot(t.once, t.toscene - 0.02 - t.once, { d: CHARGE.d * 0.96 }, "sine.out");

  /* ═════════════ THE SCENE: if nothing pulled the strap in ═════════════ */
  /* ───────────── "Ta voiture s'arrête contre le mur." ───────────── */
  // a cut: the same car, before the crash, in profile — the wall comes (1 m ≈ 60 ms), the car stops against it on
  // "mur", the nose folds, the shards fly
  const gap0 = 0.7;
  cut(t.toscene, SET.CABIN, WIDE, { ...STAGED, gap: gap0, ms: -60 * gap0, crush: 0, ...L_CAR });
  st(t.toscene, t.mur - t.toscene, { gap: 0, ms: 0 }, "none");
  st(t.mur, t.goeson - t.mur, { crush: 0.8 }, "sine.out");
  st(t.mur, 1.2, { debris: 0.5 }, "power2.out");
  shot(t.toscene, t.mur + 0.4 - t.toscene, { d: WIDE.d * 0.97 }, "none");
  chip("chip-sans", null, 96, 470, t.stops, t.loose - 0.3);

  /* ───────────── "Toi, non : ton corps continue." ───────────── */
  // your body goes on, into a strap that has NOT been pulled in (slack 1, fire 0); the camera dives to you. (It only
  // starts: past lunge ≈ 0.3 the chest has taken up the slack, and "du mou" would have no daylight left to show)
  st(t.mur, t.fewcm - t.mur, { ms: 30 }, "none");
  st(t.goeson, t.loose - t.goeson, { lunge: 0.12 }, "sine.inOut");
  shot(t.mur + 0.4, t.loose - (t.mur + 0.4), LOOSE, "sine.inOut", WIDE.d * 0.97);
  st(t.mur + 0.4, t.loose - (t.mur + 0.4), L_YOU, "sine.inOut");

  /* ───────────── "Et ta ceinture a toujours un peu de mou. Ton manteau. Ta position." ───────────── */
  // close: the strap standing off your chest, its belly under the ring; the coat lights up under the strap on
  // "manteau", your back leaves the seat on "position". The body creeps on, slowly
  chip("chip-mou", null, 96, 470, t.loose + 0.05, t.back - 0.05);
  st(t.loose, t.fewcm - t.loose, { lunge: 0.18 }, "none");
  st(t.manteau, 0.8, { coat: 1 }, "sine.inOut");
  st(t.posture, 0.9, { lean: 1 }, "sine.inOut");
  shot(t.loose, t.fewcm - t.loose, { d: LOOSE.d * 0.94 }, "sine.inOut");

  /* ───────────── "Quelques centimètres… c'est déjà trop." ───────────── */
  // the body goes on — farther than it should — and the strap bites, late, on "trop": a breath of signal light.
  // Your head stops well short of the wheel
  st(t.fewcm, t.toomuch - t.fewcm, { lunge: 1, ms: 40 }, "power1.in");
  shot(t.fewcm, t.toomuch - t.fewcm, { tz: -2, d: 236, az: -118 }, "sine.inOut");
  st(t.toomuch, 0.06, { gel: 0.14 }, "power2.out");
  st(t.toomuch + 0.06, 0.45, { gel: 0 }, "power2.out");

  /* ───────────── the silence before "Alors…" ───────────── */
  // the label goes; the camera starts climbing the strap toward your shoulder — act 2 cuts
  shot(t.toomuch + 0.1, t.tosystem - (t.toomuch + 0.1), { ty: 100, tz: 2, d: 226, el: 8 }, "sine.in");
}
