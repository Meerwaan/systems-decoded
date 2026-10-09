// DOSSIER 013 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        ONE move on the bench, under the title. The system whole, you in it: the cell lights up ("ta coque") ·
//                a dive over the cockpit, from above: your harness lights up · the camera comes down to your head under
//                the ring — "Absorbe le choc" is struck on "amortir" · "la place de ta tête": the veille volume blooms
//                round your helmet, under the ring; "Garde ta place"; the account name lights up
//   like         the system whole, nobody in it, turning slowly under the panel; the halo lights up on "le trouve"
//   abonnement   the camera backs away and comes down to a long low profile under the next file's panel
//   commentaire  the hook's promise is paid in three pictures and three labels at the same place of the top slot:
//                the wreck, the empty cockpit, the ring intact in front of the dying fire — the pilot's name ·
//                the bench in signal light, the halo lifted off, alone: the thing he was AGAINST ·
//                the track again, after the fire: the ring and the place it kept in the empty cockpit, the bent steel,
//                and you beyond it, standing: FOR — then the camera goes in to the ring, and the question is asked over it
//   boucle       from behind the barrier, far down the track: the whole car comes at us, at speed. The camera sinks
//                behind the steel as it arrives; the nose reaches the beams on "basculé", and the film slows down
//                into its first frame. The camera stands (almost) still by the barrier: in the car's frame it travels
//                with `ahead`, on the same ease — which is why the loop is ONE move from the cut.
// (Poses placed by projection — against the title, the panels, the chevrons and the captions — then looked at.)
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, FIRST, POSE0, BENCHED, STAGED, LODGED, RAIL } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const DEG = Math.PI / 180;

/* chute — the title's line ends at y 620, its shade at 840: everything that matters lies under it */
// the system whole, the cockpit on the left, the nose on the right (x 94…878, y 712…1074)
const WHOLE = { ...P, tx: 0, ty: 40, tz: 0, d: 1240, az: -55, el: 12, shift: 50, side: 60 };
// over the cockpit, from above (the harness only reads from el ≥ 30): your shoulders, the straps, the ring round them
// (your helmet's top 45 px under the title's line, the straps between y 960 and 1170)
const BELTS = { ...P, tx: 0, ty: 58, tz: -50, d: 400, az: -28, el: 34, shift: -20, side: 20 };
const BELTS_END = { d: 380, az: -25 };
// your head under the ring (ring x 94…878, y 763…1005 · helmet y 839…1088)
const HEAD = { ...P, tx: 0, ty: 70, tz: -57, d: 400, az: -32, el: 12, shift: 10, side: 30 };
const HEAD_NEAR = { d: 372, az: -28 };
const COCKPIT_LIGHT = { fx: 0, fy: 66, fz: -62, fs: 64 };

/* like · abonnement — the system whole under a panel (#net ends at y 761, #next at y ≈ 835) */
// (x 128…726 → 101…751 as it turns, y 844…1127: its nose stays 80 px left of the chevrons)
const LIKE = { ...P, tx: 0, ty: 40, tz: 0, d: 1550, az: -50, el: 10, shift: -40, side: 115 };
const LIKE_END = { az: -60 };
const ABO = { ...P, tx: 0, ty: 40, tz: 0, d: 1650, az: -72, el: 5, shift: -80, side: 80 };
const ABO_END = { az: -76, d: 1700 };

/* commentaire — three pictures under one label of the top slot (y 470…536) */
// the wreck: the empty cockpit, the ring in front of the fire (the frame the hook ends on)
// (ring x 177…814, y 804…1010; the top beam crosses the picture behind it, y ≈ 540…710: just under the label)
const RING = { ...P, tx: 0, ty: 74, tz: 4, d: 440, az: -22, el: 10, shift: -5, side: 25 };
const RING_NEAR = { d: 410, az: -18 };
// the bench: the halo lifted off the cell, alone in the light, seen level (lifted ring x 133…821, y 633…933; the
// cell it came off lies under the captions)
const UGLY = { ...P, tx: 0, ty: 146, tz: -54, d: 480, az: -40, el: 2, shift: 240, side: 20 };
const UGLY_END = { d: 450, az: -34, el: 3 };
// after the fire: the ring and the place it kept in the empty cockpit, the steel, and you beyond it, standing
// (ring y 952…1074 · your helmet, out, x 777…866, y 559…674: right of the label, under the header)
const AFTER = { ...P, tx: 5, ty: 112, tz: 20, d: 820, az: -35, el: 8, shift: 85, side: 10 };
const AFTER_END = { d: 790, az: -32 };
// the question is asked over the halo itself: in to the ring (x 280…845, y 846…1027), you leave by the right
const ASK = { ...P, tx: 0, ty: 86, tz: 6, d: 520, az: -24, el: 9, shift: 60, side: -50 };
const ASK_END = { d: 500, az: -21 };

/* boucle — where the car is when the last sentence starts, so that its nose reaches the beams on `rewind` */
const loopStart = (u) => {
  const ahead = Math.min(30, Math.max(12, FIRST.ahead + (RAIL.first - FIRST.ahead) / Math.pow(1 - u, 2)));
  // the camera: on the first frame's own azimuth, behind the barrier (≈ 3.5 m at the cut, never nearer than 2 m: it
  // closes on the car a little slower than the barrier does) and 1.9 m up, a long lens on the car (≈ 2.2 px per cm)
  const d = 100 * ahead - 20;
  return {
    ahead,
    pose: { ...POSE0, tx: 0, ty: 50, tz: 50, d, el: Math.asin(140 / d) / DEG, fov: (2 * Math.atan(960 / (2.2 * d))) / DEG, side: 40, drift: 0 },
  };
};

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", idea: "idea", harness: "harness", hoop: "chute:arceau-0.14", strike: "strike", verdict: "verdict", tocta: "tocta",
    like: "like", ugly: "like:trouve-0.1", likeEnd: "like$",
    toabo: "toabo", abo: "abo", next: "next", brakes: "brakes", aboEnd: "abo$",
    tocomment: "tocomment", unwanted: "comment:arceau-0.1", pilot: "pilot", before: "before", after: "after", without: "comment:sans-0.1", ask: "ask",
    commentaire: "comment:commentaire", pour: "comment:pour#3", toloop: "toloop", rewind: "rewind",
  });
  // on the bench the header keeps the story's last word: stopped, 28 seconds after the impact
  const DONE = { ahead: 0, kmh: 0, sec: 28 };

  /* ── CHUTE: "67 g : c'est ta coque," — the system whole, you in it; the cell lights up on its name ── */
  cut(t.toverdict, SET.BENCH, WHOLE, { ...BENCHED, ...DONE, you: 1 });
  const dive = t.idea + 0.3;
  shot(t.toverdict, dive - t.toverdict, { d: WHOLE.d * 0.95 });
  st(t.idea, 0.45, { litCell: 0.7 }, "power2.out");
  retitle(tl, { showAt: t.toverdict + 0.06, strikeAt: t.strike + 0.1, swapAt: t.verdict, hideAt: t.tocta - 0.27 });

  // "ton siège et ton harnais qui les ont pris." — the dive over the cockpit; the straps light up on "harnais"
  const over = t.harness + 0.4;
  shot(dive, over - dive, BELTS, "sine.inOut", WHOLE.d * 0.95);
  st(dive, over - dive, { ...COCKPIT_LIGHT }, "sine.inOut");
  st(t.harness, 0.4, { harness: 1 }, "power2.out");
  shot(over, t.hoop - over, BELTS_END);

  // "L'arceau, lui, n'est pas là pour amortir." — down to your head under the ring; the cell and the straps let go
  const atHead = t.strike + 0.15;
  shot(t.hoop, atHead - t.hoop, HEAD);
  st(t.hoop, 0.5, { litCell: 0, harness: 0.3 }, "sine.inOut");
  st(t.hoop + 0.1, 0.45, { litHalo: 1 }, "power2.out");

  // "Il garde une seule chose… la place de ta tête." — the space it keeps, on the word: the file's verdict
  shot(atHead, t.tocta - atHead, HEAD_NEAR);
  st(t.verdict - 0.05, 0.6, { space: 1 }, "power2.out");
  D.verdict(t.verdict);

  /* ── LIKE: the system whole, nobody in it; the camera turns slowly round it ── */
  cut(t.tocta, SET.BENCH, LIKE, { ...BENCHED, ...DONE });
  const toAbo = t.toabo - 0.05;
  shot(t.tocta, toAbo - t.tocta, LIKE_END);
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });
  // "…quelqu'un qui le trouve encore trop laid." — it: the halo
  st(t.ugly, 0.4, { litHalo: 1 }, "power2.out");

  /* ── ABONNEMENT: the camera backs away and comes down; the next file's panel over it ── */
  shot(toAbo, t.next + 0.6 - toAbo, ABO);
  shot(t.next + 0.6, t.tocomment - t.next - 0.6, ABO_END);
  st(toAbo, 0.6, { litHalo: 0 }, "sine.inOut");
  nextFile(tl, { showAt: t.next, factAt: t.brakes, hideAt: t.tocomment - 0.32, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE 1: "Et l'arceau dont tu ne voulais pas ? Ce pilote, c'est Romain Grosjean." — the wreck ── */
  cut(t.tocomment, SET.TRACK, RING, { ...STAGED, ...LODGED, sec: 28, fire: 0.45, out: 1, fx: 0, fy: 74, fz: 4, fs: 60 });
  shot(t.tocomment, t.before - t.tocomment, RING_NEAR);
  st(t.unwanted, 0.4, { litHalo: 1 }, "power2.out");
  st(t.tocomment, t.before - t.tocomment, { fire: 0.3 }, "sine.inOut");
  chip("chip-pilote", null, 96, 470, t.pilot, t.before - 0.16);

  /* ── COMMENTAIRE 2: "Avant, il disait : un triste jour pour la Formule 1." — the thing he was against ── */
  // (signal on the bench, for once: the rim, the pool, and a gel over the whole picture — kept under 0.3)
  cut(t.before, SET.BENCH, UGLY, { ...BENCHED, ...DONE, explode: 1, mood: 1, gel: 0.26, fx: 0, fy: 146, fz: -54, fs: 64 });
  shot(t.before, t.after - t.before, UGLY_END);
  chip("chip-avant", null, 96, 470, t.before + 0.12, t.after - 0.16);

  /* ── COMMENTAIRE 3: "Après le feu : sans lui, je ne pourrais pas vous parler." — then the question ── */
  // (you are out from the cut, standing: half-way over the beam you are a glass figure in the air — never shown)
  cut(t.after, SET.TRACK, AFTER, { ...STAGED, ...LODGED, sec: 28, fire: 0.22, out: 1, litHalo: 1, space: 0.6, fx: 0, fy: 90, fz: 10, fs: 110 });
  const toAsk = t.ask - 0.1;
  shot(t.after, toAsk - t.after, AFTER_END);
  st(t.after, t.toloop - t.after, { fire: 0.06 }, "sine.inOut"); // the fire dies
  st(t.without, 0.5, { space: 1 }, "power2.out"); // "sans lui": the place it kept
  // "En commentaire : le Halo, pour… ou contre ?"
  shot(toAsk, t.pour - toAsk, ASK);
  st(toAsk, t.pour - toAsk, { fx: 0, fy: 80, fz: 6, fs: 70 }, "sine.inOut");
  shot(t.pour, t.toloop - t.pour, ASK_END);
  chip("chip-apres", null, 96, 470, t.after + 0.12, t.ask - 0.16);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.pour, chars: 4, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Parce que ce jour-là, tout a basculé au…" — the car comes at the barrier, and enters it ── */
  const start = loopStart((t.rewind - t.toloop) / (D.tEnd - t.toloop));
  cut(t.toloop, SET.TRACK, start.pose, { ...STAGED, ahead: start.ahead, kmh: 241, sec: 0, fx: 0, fy: 50, fz: 60, fs: 600 });
  // one move, one ease for the camera and for the world: fast at the cut, at rest on the first frame
  D.loop({ at: t.toloop, rewindAt: t.toloop, ease: "power1.out" });
}
