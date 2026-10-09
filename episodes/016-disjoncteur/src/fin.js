// DOSSIER 016 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        the room, off: you from behind, on the right, and in the wall on the left the wire, still hot — "Te
//                protège" is struck on "pas" · a cut in, on the same axis, to the wire: on "fil" it COOLS under "Protège
//                ton mur" (the wire only knows how to redden: what protects it is shown by the red leaving it) · a cut
//                after "Toi," to the consumer unit: the film's breaker, tripped, and on "voisin" the differential beside
//                it lights up veille while the rest of the row dims
//   like         the bench: the breaker closed, tripped, turning slowly under the panel — its case turns to glass on
//                "incendie"; the tiles light on "ça remontera"
//   abonnement   the same bench, the camera backs away and comes down; the next file over it
//   commentaire  the hook's "ne le relève pas deux fois" is paid. The room of act 1, everything off: kettle, heater,
//                strip · a cut up the wall to FAULT: on "brûlé" the insulation browns, embers in its folds ·
//                a cut to the breaker alone on its rail (act 1's picture of it): on "relèves" the handle goes up, on
//                "ressaute" it falls back · a cut to the whole row: the question is asked over it
//   boucle       behind the wall, far: through it the evening again — the kettle on, the heater comes on (18 A) — and
//                the camera dives to the wire, which starts to glow. D.loop brings every number back to the first frame.
// (Poses placed by projection — against the title, the panels, the chevrons and the captions — then looked at.)
import { retitle, nextFile, commentCall } from "@kit/blocks.js";
import { likeNet, rail } from "@kit/overlay.js";
import { SET, BENCHED, STAGED, HOME, FAULT, RATING } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [FX, FY, FZ] = FAULT;
const [HX, HY] = HOME;
const ROW_Y = HY + 4.25; // the middle of the row's height
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

// the wire just after the cut-off: still hot (pale at its heart); it goes through red on its way to ink
const HOT = 0.5;
// the circuit once the breaker has cut: nothing glows, the handle is down, the header keeps the story's last word
// (0 A; "Depuis" stays on the 0.02 s of the coil)
const OFF = { dark: 1, handle: 0, latch: 1, gap: 1, amps: 0, load: 0, secs: 0.02, hotwire: 0, mood: 0, gel: 0 };

/* chute — the title's line ends at y ≈ 606, its shade at 840: what matters lies under it */
// you from behind on the right (head y ≈ 830, x 540…740), the wire's drop in the wall on the left (x ≈ 370, FAULT y ≈ 985);
// at this scale (≈ 4.4 px a centimetre) the wire is a line: it is the cut-in that shows it
const TWO = { ...P, tx: FX + 15, ty: 128, tz: 25, d: 900, az: -46, el: 6, shift: -45, side: 40 };
// the wire alone (≈ 20 px a centimetre, x ≈ 440; you are out of the picture, on the right — aimed above FAULT: lower, the
// sideboard's top comes in as a grey slab)
const WIRE = { ...P, tx: FX + 0.8, ty: FY + 6, tz: FZ, d: 190, az: -48, el: 4, shift: -150, side: 100 };
const L_TWO = { fx: FX + 5, fy: 120, fz: 40, fs: 200 };
const L_WIRE = { fx: FX, fy: FY, fz: 0, fs: 120 };
// the differential, its face toward us, and the film's breaker against it (x ≈ 330…670, y ≈ 680…1175); from further to
// the left its flank is all there is
const NEIGHBOUR = { ...P, tx: HX - 1, ty: ROW_Y, tz: 4, d: 70, az: -14, el: 9, shift: 70, side: 0 };
const NEIGHBOUR_END = { d: 65, az: -10 };
const L_ROW = { fx: HX, fy: ROW_Y, fz: 4, fs: 30 };

/* like · abonnement — the breaker under a panel (#net ends at y ≈ 761, #next lower) */
const LIKE = { ...P, tx: 0, ty: 4.25, tz: 3.5, d: 84, az: -48, el: 14, shift: -42, side: 110 }; // (x 285…605, y 780…1230)
const LIKE_END = { az: -64 };
const ABO = { ...P, tx: 0, ty: 4.25, tz: 3.5, d: 92, az: -70, el: 5, shift: -85, side: 110 }; // (#next ends at y 835: x 278…604, y 862…1234)
const ABO_END = { ...ABO, d: 97, az: -76 };

/* commentaire */
// act 1's own picture of the room (kettle up on the right, heater down on the left, the strip and its two plugs), now off
const ROOM_OFF = { ...P, tx: 115, ty: 60, tz: 40, d: 360, az: 36, el: 30, fov: 36, shift: 120, side: -30 };
// up the wall to FAULT, close (≈ 30 px a centimetre: at 10 the crust is a dot) — the wire at x ≈ 510, FAULT at y ≈ 890
const SMELL = { ...P, tx: FX + 0.8, ty: FY + 2, tz: FZ, d: 128, az: 28, el: 8, shift: 40, side: 40 };
const L_ROOM = { fx: 110, fy: 50, fz: 40, fs: 160 };
// act 1's own picture of the handle — the breaker alone on its rail, three quarters (the hook's "ne le relève pas deux
// fois" was shown here): in the row, a dark lever among pale handles, the move does not read
const HANDLE = { ...P, tx: HX, ty: HY + 4.2, tz: 4, d: 54, az: -60, el: 10, fov: 30, shift: 60, side: 60 };
const HANDLE_END = { d: 51, az: -56 };
const L_HANDLE = { fx: HX, fy: HY + 4.2, fz: 4, fs: 16 };
// the row under the question: the film's breaker left of centre (x 260…492, y 717…1236), the differential on its left
const ROW_ASK = { ...P, tx: HX + 2.1, ty: ROW_Y, tz: 4, d: 70, az: -22, el: 7, shift: 0, side: 60 };
const ROW_ASK_END = { d: 67, az: -25 };

/* boucle — behind the wall, far, on POSE0's side of it (az 164): the dive to the first frame turns by a few degrees only */
const AWAY = { roll: 0, drift: 0, tx: 121.9, ty: 132.4, tz: -1.4, d: 300, az: 156, el: -4, fov: 64, shift: 290, side: -100 };

export default function fin({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", idea: "chute:ton-0.08", denied: "chute:pas", towire: "chute:Il-0.1", verdict: "verdict",
    toboard: "chute:c'est-0.2", neighbour: "neighbour", diff: "diff", tocta: "tocta",
    like: "like", fires: "fires", carries: "like:ça", likeEnd: "like$",
    toabo: "toabo", next: "next", magnet: "magnet", aboEnd: "abo$",
    tocomment: "tocomment", tosmell: "comment:Ça-0.1", smell: "smell", leave: "leave", once: "once", again: "again", sparky: "sparky",
    ask: "ask", commentaire: "comment:commentaire", answer: "answer", toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE 1: "Voilà le secret : ton disjoncteur ne te protège pas, toi." — you, and the wire in the wall ── */
  cut(t.toverdict, SET.ROOM, TWO, { ...STAGED, ...OFF, hotwire: HOT, ...L_TWO });
  shot(t.toverdict, t.towire - t.toverdict, { d: TWO.d * 0.93 }, "none");
  // the title holds over the cut-in: struck over you, corrected over the wire, on "fil" — with the header's verdict
  retitle(tl, { showAt: t.idea, strikeAt: t.denied, swapAt: t.verdict, hideAt: t.toboard - 0.26 });

  // "Il protège le fil, dans ton mur." — a cut in, on the same axis, to the wire; on "fil" the red leaves it: the file's
  // verdict. (A dive brought you into the picture half-way, close and blurred: a cut.)
  cut(t.towire, SET.ROOM, WIRE, { ...STAGED, ...OFF, hotwire: HOT, ...L_WIRE });
  shot(t.towire, t.toboard - t.towire, { d: WIRE.d * 0.92 }, "none");
  st(t.verdict + 0.1, t.toboard - 0.15 - (t.verdict + 0.1), { hotwire: 0 }, "sine.inOut");
  D.verdict(t.verdict);

  /* ── CHUTE 2: "Toi, | c'est son voisin : le différentiel." — the row: the breaker, tripped, and its neighbour ── */
  cut(t.toboard, SET.ROOM, NEIGHBOUR, { ...STAGED, ...OFF, ...L_ROW });
  shot(t.toboard, t.tocta - t.toboard, NEIGHBOUR_END);
  // the differential lights first, then the others dim (it would fade with them otherwise)
  st(t.neighbour, 0.3, { diff: 0.85 }, "power2.out"); // (at 1 its halo spills)
  st(t.neighbour + 0.25, 0.6, { others: 0.3 }, "sine.inOut");
  chip("chip-diff", null, 96, 470, t.neighbour + 0.05, t.tocta - 0.2);
  tl.fromTo("#chip-diff b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.diff);

  /* ── LIKE: "Like. Entre un incendie de logement sur cinq et un sur trois…" — the breaker, closed, turning slowly ── */
  const BENCH_OFF = { ...BENCHED, cover: 1, handle: 0, latch: 1, gap: 1, amps: 0, secs: OFF.secs };
  cut(t.tocta, SET.BENCH, LIKE, BENCH_OFF);
  const toAbo = t.toabo - 0.05;
  shot(t.tocta, toAbo - t.tocta, LIKE_END);
  // the panel comes with the word; its tiles light on "ça remontera chez quelqu'un"
  const likeOut = t.likeEnd + 0.12;
  likeNet(tl, { showAt: t.like - 0.1, hideAt: likeOut, hits: Array.from({ length: 5 }, (_, i) => [i + 1, t.carries + 0.05 + i * 0.16]), label: (n) => `${n} personnes` });
  rail(tl, "rail-like", t.like, likeOut);
  // "…un incendie de logement": its case turns to glass — what it holds, tripped, shows through (and stays so under the next file)
  st(t.fires, 1.4, { xray: 1 }, "sine.inOut");

  /* ── ABONNEMENT: "Abonne-toi. Prochain dossier : l'IRM…" — the camera backs away and comes down, the next file over it ── */
  shot(toAbo, t.next + 0.6 - toAbo, ABO);
  shot(t.next + 0.6, t.tocomment - t.next - 0.6, ABO_END);
  nextFile(tl, { showAt: t.next, factAt: t.magnet, hideAt: t.tocomment - 0.32, railFrom: t.toabo + 0.15, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE 1: "Et s'il saute ? Tu débranches. Ça sent le brûlé : tu laisses coupé." — the room, off ── */
  // (the wire keeps a dull red: it is what leads the eye from the socket up to the place that cooked)
  cut(t.tocomment, SET.ROOM, ROOM_OFF, { ...STAGED, ...OFF, you: 0, kettle: 0, heater: 0, hotwire: 0.22, ...L_ROOM });
  shot(t.tocomment, t.tosmell - t.tocomment, { d: ROOM_OFF.d * 0.94 }, "none");
  // "Ça sent le brûlé" — a cut up the wall, to the place where the insulation cooked (a rise took the kettle through the
  // picture, close and blurred)
  const toRow = t.once - 0.28; // on "Sinon"
  cut(t.tosmell, SET.ROOM, SMELL, { ...STAGED, ...OFF, you: 0, kettle: 0, heater: 0, hotwire: 0.22, ...L_WIRE });
  shot(t.tosmell, toRow - t.tosmell, { d: SMELL.d * 0.92 }, "none");
  // (at 0.6 the crust is thin; the embers in its folds are what reads — never a flame)
  st(t.smell, 0.9, { char: 0.85 }, "sine.out");
  chip("chip-brule", null, 96, 470, t.smell, toRow - 0.18);
  tl.fromTo("#chip-brule b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.leave);

  /* ── COMMENTAIRE 2: "Sinon tu le relèves, une fois. Il ressaute ? Tu n'insistes pas : électricien." — the breaker alone ── */
  const toAsk = t.ask + 0.08;
  cut(toRow, SET.ROOM, HANDLE, { ...STAGED, ...OFF, you: 0, kettle: 0, heater: 0, others: 0, shell: 0.45, ...L_HANDLE });
  shot(toRow, toAsk - toRow, HANDLE_END);
  // "…tu le relèves": the handle goes up
  now(t.once + 0.05, { latch: 0, gap: 0 });
  st(t.once + 0.05, 0.22, { handle: 1 }, "power2.out");
  now(t.once + 0.2, { dark: 0 });
  // "Il ressaute ?": it falls back at once, and stays down
  now(t.again + 0.08, { latch: 1, gap: 1, dark: 1 });
  st(t.again + 0.08, 0.07, { handle: 0 }, "power2.in");
  chip("chip-elec", null, 96, 470, t.again + 0.14, toAsk - 0.16);
  tl.fromTo("#chip-elec b", { opacity: 0 }, { opacity: 1, duration: 0.15 }, t.sparky);
  // "En commentaire : le tien, il saute sur quoi ?" — a cut to the whole row, yours: the question is asked over it
  cut(toAsk, SET.ROOM, ROW_ASK, { ...STAGED, ...OFF, you: 0, kettle: 0, heater: 0, ...L_ROW });
  shot(toAsk, t.toloop - toAsk, ROW_ASK_END);
  commentCall(tl, { from: toAsk + 0.1, word: t.commentaire, typedAt: t.answer - 0.22, chars: 7, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Parce que ce soir, peut-être…" — the evening again, from behind the wall; down to the wire ── */
  const first = numbers(D.first);
  const one = first.amps / 2; // one of the two appliances alone: under the rating
  cut(t.toloop, D.first.set, AWAY, { ...STAGED, ...first, heater: 0.15, amps: one, load: one / RATING, mood: 0, hotwire: 0.1, gel: 0 });
  shot(t.toloop, t.rewind - t.toloop, { d: AWAY.d * 0.97 }, "none");
  // the heater comes on: 18 A — all of it is back to the first frame's own numbers before the dive starts
  const on = t.toloop + 0.1;
  st(on, 0.3, { heater: first.heater }, "power2.out");
  now(on + 0.05, { amps: first.amps, load: first.load });
  st(on + 0.05, 0.25, { mood: first.mood }, "power2.out");
  // the dive, and every number that is not yet the first frame's (the wire's heat, the gel) glides back with it
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: AWAY.d * 0.97 });
}
