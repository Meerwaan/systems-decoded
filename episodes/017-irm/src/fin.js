// DOSSIER 017 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        the bench: the scanner opened, after the quench — no field (0,0 T), no current, and its helium still
//                leaving: the level sinks through "L'éteindre d'un coup, c'est la vider…" and the camera comes down with
//                it, in one long move. "Est éteinte" is struck on "pas éteinte", "Tire encore" lands on "vider".
//   like         another day: the hook's own picture from behind the door's wall, lower — the scanner at field, you in
//                the doorway, your hands empty · a cut after "salle…": the trolley's top, close — on "clés" the keys
//                lift, turn to the magnet and leave
//   abonnement   the bench, the scanner whole; the camera closes in under the next file
//   commentaire  a cut in, on the same axis, to the box on its post: the hood over the magnet stop lifts on "personnel"
//                and falls back after "danger" (nobody presses it: it is not for you) · a cut to the door: you, hands
//                empty, the line on the floor in front of you — on "poches vides" the field reaches you and takes nothing
//   boucle       the scanner through the door's wall, its field drawn in full: "tire encore" · on "même" the camera backs
//                away to the first frame — you come in on the right, the cylinder in your arms. D.loop brings every
//                number back.
// (Poses placed by projection — against the title, the panels, the chevrons and the captions — then looked at.)
import { retitle, nextFile, commentCall } from "@kit/blocks.js";
import { likeNet, rail } from "@kit/overlay.js";
import { SET, BENCHED, STAGED, BOX } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — the title's line ends at y ≈ 632, its shade at 840: the drum stands under it (y 686 … 1172), what matters
   — the level — lower still (y 880 → 1100) */
const EMPTY = { ...P, tx: 6, ty: 104, tz: 5, d: 1950, az: -40, el: 15, shift: 30, side: 60 };
const EMPTY_LOW = { ...P, tx: 6, ty: 104, tz: 5, d: 1600, az: -40, el: 8, shift: 57, side: 60 }; // (the drum: x 125 … 796, y 622 … 1183)
// the scanner once its magnet has been stopped: opened, no field, no current, the machine off (the header: 0,0 T · Arrêtée)
const QUENCHED = { cover: 0, xray: 1, tesla: 0, power: 0, spin: 0, seen: 0 };
const LEVEL = { cut: 0.72, slow: 0.6, low: 0.15, last: 0.12 }; // the helium: still leaving at the cut, nearly gone on "vider"

/* like — #net ends at y ≈ 764 */
// the hook's picture, lower and further (the scanner x 115 … 482, y 776 … 1131 · you x 680 … 774, y 870 … 1208)
const PAIR = { ...P, tx: 75, ty: 110, tz: 220, d: 1600, az: -10.8, el: 5, fov: 38, shift: -10, side: 70 };
// the trolley's top from above, close (≈ 11 px a centimetre): the keys lie at x ≈ 318, y ≈ 1073, hover at (390, 916) and
// leave to the right, toward the magnet — VIEW.trolley shows the whole scene, and the keys are 60 px in it
const TROLLEY = { ...P, tx: -272, ty: 98, tz: 174, d: 235, az: -6, el: 33, fov: 40, shift: 30, side: 150 };
const L_TROLLEY = { fx: -272, fy: 95, fz: 170, fs: 110 };

/* abonnement — #next ends at y ≈ 860: the scanner under it (x 219 … 632, y 875 … 1222; its table out to x 765). The stub
   of its pipe runs up behind the panel: lower, the table's foot is in the captions */
const ABO = { ...P, tx: 28, ty: 105, tz: 24, d: 2950, az: -40, el: 9, shift: -112, side: 60 };
const ABO_END = { ...ABO, d: 2600, shift: -90 };

/* commentaire */
const [BX, BY, BZ] = BOX.bench;
// the box on its post, the magnet stop under its hood on the right (the box: x 323 … 740, y 694 … 1121)
const BOX_NEAR = { ...P, tx: BX, ty: BY, tz: BZ, d: 220, az: -38, el: 8, shift: 60, side: 0 };
const BOX_END = { d: 205, az: -34 };
const L_BOX = { fx: BX, fy: BY, fz: BZ, fs: 60 };
// the door from behind its wall: you x 671 … 792, y 750 … 1175 · the line on the floor to your left, y 960 … 1125
// (from lower than VIEW.door — el 11, not 15: the scanner's top comes down to y ≈ 560, nearly out of #cta-field, which
// ends at y ≈ 615)
const DOOR = { ...P, tx: 110, ty: 105, tz: 330, d: 1250, az: -10.5, el: 11, fov: 36, shift: 65, side: 0 };
const DOOR_END = { d: 1180, shift: 75 };
const L_DOOR = { fx: 110, fy: 105, fz: 300, fs: 340 };

/* boucle — the scanner through the door's wall, on POSE0's side of it: the way back is a pull-back of three metres */
// (the drum: x 207 … 822, y 460 … 1069 — its top where POSE0 has it, under the header)
const AWAY = { roll: 0, drift: 0, tx: 0, ty: 110, tz: 90, d: 1020, az: -11, el: 10, fov: 38, shift: 180, side: 0 };

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", idea: "chute:une-0.06", notoff: "notoff", drain: "chute:L'éteindre-0.14", verdict: "verdict", last: "last",
    tocta: "tocta", like: "like", whom: "like:Pour", tokeys: "like:salle$+0.1", keys: "keys", likeEnd: "like$",
    toabo: "toabo", next: "next", whistle: "whistle", aboEnd: "abo$",
    tocomment: "tocomment", thatbutton: "thatbutton", notforyou: "comment:Il-0.05", staff: "staff", danger: "danger", todoor: "comment:toi#2-0.12",
    form: "form", pockets: "pockets", ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: "Voilà le secret : une IRM qui se tait n'est pas éteinte. L'éteindre d'un coup, c'est la vider…" ── */
  cut(t.toverdict, SET.BENCH, EMPTY, { ...BENCHED, ...QUENCHED, helium: LEVEL.cut, boil: 0.6 });
  // one long move: the camera closes in and comes down while the level sinks (fastest on "L'éteindre d'un coup")
  shot(t.toverdict, t.tocta - t.toverdict, EMPTY_LOW, "sine.inOut", EMPTY.d);
  st(t.toverdict, t.drain - t.toverdict, { helium: LEVEL.slow }, "none");
  const emptied = t.verdict + 0.3; // on "vider"
  st(t.drain, emptied - t.drain, { helium: LEVEL.low }, "sine.inOut");
  st(emptied, t.tocta - 0.05 - emptied, { helium: LEVEL.last, boil: 0.2 }, "sine.out");
  // the received idea, struck on "pas éteinte"; the truth lands on "vider", with the header's verdict
  const titleOut = t.last - 0.4;
  retitle(tl, { showAt: t.idea, strikeAt: t.notoff, swapAt: t.verdict, hideAt: titleOut });
  D.verdict(t.verdict);
  // "Le dernier recours." — once the title has left
  chip("chip-cout", null, 96, 470, t.last - 0.12, t.tocta - 0.2);

  /* ── LIKE 1: "Like. Pour celui qui entrera un jour dans cette salle…" — another day: the scanner at field, you at the door ── */
  // (the room's glass at half: its ceiling and the top of the door's wall pass behind the panel)
  cut(t.tocta, SET.SUITE, PAIR, { ...STAGED, carry: 0, seen: 0.7, shell: 0.5 });
  shot(t.tocta, t.tokeys - t.tocta, { d: PAIR.d * 0.95 }, "none");
  // the panel comes with the word, its tiles light on "Pour celui qui entrera…"; it has left before the cut
  likeNet(tl, { showAt: t.like - 0.1, hideAt: t.tokeys - 0.32, hits: Array.from({ length: 5 }, (_, i) => [i + 1, t.whom + 0.05 + i * 0.26]), label: (n) => `${n} personnes` });
  rail(tl, "rail-like", t.like, t.likeEnd + 0.12);

  /* ── LIKE 2: "…avec ses clés en poche." — the trolley by the wall: on "clés" they lift toward the magnet ── */
  // (the field's lines low: one of them sweeps the right of the picture, and passes behind the header)
  cut(t.tokeys, SET.SUITE, TROLLEY, { ...STAGED, carry: 0, seen: 0.4, ...L_TROLLEY });
  shot(t.tokeys, t.toabo - t.tokeys, { d: TROLLEY.d * 0.96 }, "none");
  // 0 → 0.2: the keys lift off the trolley and turn to the magnet (seen from here they are keys only until they turn: they
  // lie in the picture for half a second first) · → 0.44: they leave by the right, the scissors rise after them. The cut
  // to the bench takes them all away — brought back to 0 they would fly home.
  const lifted = t.keys + 0.44;
  st(t.keys - 0.06, lifted - t.keys + 0.06, { loose: 0.2 }, "power2.out");
  st(lifted, t.toabo - 0.05 - lifted, { loose: 0.44 }, "power1.in");

  /* ── ABONNEMENT: "Abonne-toi. Prochain dossier : ta cocotte-minute…" — the scanner whole, the next file over it ── */
  cut(t.toabo, SET.BENCH, ABO, { ...BENCHED });
  shot(t.toabo, t.tocomment - t.toabo, ABO_END, "sine.inOut", ABO.d);
  nextFile(tl, { showAt: t.next, factAt: t.whistle, hideAt: t.tocomment - 0.32, railFrom: t.toabo + 0.15, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE 1: "Et ce bouton ? Il n'est pas pour toi : le personnel le presse si quelqu'un est coincé, en danger." ── */
  cut(t.tocomment, SET.BENCH, BOX_NEAR, { ...BENCHED, ...L_BOX });
  shot(t.tocomment, t.todoor - t.tocomment, BOX_END);
  st(t.thatbutton, 0.3, { litButtons: 0.3 }, "power2.out"); // (at 1 the whole box turns veille: the magnet stop must stay the green thing)
  // "le personnel le presse" — the hood lifts; after "en danger" it falls back: nobody here presses it
  st(t.staff, 0.35, { flap: 1 }, "power2.out");
  st(t.danger + 0.3, 0.2, { flap: 0 }, "power2.in");
  // (the label comes whole, on "Il n'est pas pour toi": with its second line still to come it is a half-empty box)
  chip("chip-perso", null, 96, 470, t.notforyou, t.todoor - 0.2);

  /* ── COMMENTAIRE 2: "Toi, ta sécurité, c'est le questionnaire… et des poches vides. En commentaire : tu as déjà passé une IRM ?" ── */
  cut(t.todoor, SET.SUITE, DOOR, { ...STAGED, carry: 0, ...L_DOOR });
  shot(t.todoor, t.toloop - t.todoor, DOOR_END);
  // "…et des poches vides": the field reaches you, and takes nothing
  st(t.pockets, 0.9, { seen: 0.85 }, "sine.inOut");
  chip("chip-poches", null, 96, 470, t.form, t.ask - 0.15);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 3, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Parce que cet aimant tire encore, même quand…" — the scanner, its field drawn; back to the first frame ── */
  const first = numbers(D.first);
  cut(t.toloop, D.first.set, AWAY, { ...STAGED, ...first, seen: 0.85 });
  shot(t.toloop, t.rewind - t.toloop, { d: AWAY.d * 0.97 }, "none");
  // the pull-back, and every number that is not yet the first frame's (the field's lines) glides back with it
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: AWAY.d * 0.97 });
}
