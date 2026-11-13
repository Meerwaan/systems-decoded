// DOSSIER 047 — the chute, what the film still owes, the three calls to action, the loop (toverdict → the end).
//   chute        a cut to the hook's own picture, the dish clean now: the arm turns gently, its jets soft — « il ne mise
//                pas sur la force » (struck on « force ») — then the programme's clock races to 3 h 30 while the water
//                empties and fills again (the phases), and on « la même eau » the round closes once: the same water
//                only DURING a wash, never one volume for the whole cycle.
//   commentaire  a cut to the sink, the kitchen lit (the « avant »): you, the tap, on « rinçage » the plate under it ·
//                « deux cents foyers » the Bonn chip · « gaspille » the water runs to waste, signal · the duel (encore /
//                jamais), each answer on its word, the caret waiting — the film never answers for the viewer
//   like         a cut to the machine in the lit kitchen, its door ajar, shutting slowly: nobody rinsed
//   abonnement   the same shot goes on: the light goes out, the camera comes down toward the kitchen floor under the
//                next file — nothing of the subject comes back after it
//   boucle       « Et juste au-dessus, chez toi… »: a cut under the floor, looking up — the camera rises through the grid
//                into the machine, under the basket: the first frame (D.loop brings every number back)
// One shot per place, each a slow move (no frame sits still); a title or a panel has left before the cut that follows.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0 } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* ── the poses (scene coordinates, plan.js) ── */
// chute: the hook's picture (POSE0), the dish clean — and a slow orbit round it while the clock races
const CHUTE_END = { ...POSE0, az: POSE0.az - 9, d: POSE0.d * 0.94 };
// the sink: acte1's frame (VIEW.sink from further and more to the left: you at the right, the plate and the J of the
// waste under the bowl in the picture) — a slow orbit over the ten seconds of the comment
// (retouche: from further and aimed higher — your head stays under the Bonn chip, never in the header)
const SINK0 = { ...P, ...VIEW.sink, tx: -160, ty: 118, tz: 20, d: 640, az: -54, el: 10, shift: 40 };
const SINK1 = { ...SINK0, d: 580, az: -42, el: 8 };
// the machine in the lit kitchen (VIEW.door from further: the machine ≈ half the width, low under the panels) — the
// same shot carries the like and the next file, and comes down toward the floor
const DOOR0 = { ...P, ...VIEW.door, d: 430, shift: -120, side: -50 };
const FLOOR_END = { ...DOOR0, ty: 30, d: 400, az: -24, el: 3, shift: -140 };
// under the floor, looking up through its grid
const BELOW = { ...P, ...VIEW.below };

/* ── the state of every shot (complete: nothing inherited across a cut) ── */
const SCENE = {
  ...STAGED, night: 1, tap: 0, drain: 0, you: 0, rinse: 0, litres: 0, hand: 0, door: 0, eco: 1, dish: 1, crust: 0, crack: 0,
  ghosts: 0, thrust: 0, inlet: 0, water: 0.6, pump: 1, loop: 0, heat: 0, trap: 1, tab: 1, jets: 0,
  litValve: 0, litSump: 0, litPump: 0, litArm: 0, litTrap: 0, solo: 0, mood: 0, gel: 0, sinner: 0, temp: 50,
};

export default function fin({ D }) {
  const { tl, shot, cut, st, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", force: "chute:force", lave: "chute:lave", longtemps: "chute:longtemps",
    verdict: "verdict", meme: "chute:même", eau: "chute:eau", tocta: "tocta",
    rincage: "comment:rinçage", etude: "comment:étude", inutile: "comment:inutile", gaspille: "comment:gaspille",
    commentaire: "comment:commentaire", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", pour: "like:pour", likeEnd: "like$", toabo: "toabo", abo: "abo",
    prochain: "abo:prochain", roue: "abo:roue", aboEnd: "abo$", toloop: "toloop",
  });
  const span = (a, b) => b - a;
  // the kit's title is set at 118 px: « LAVER PLUS LONGTEMPS » runs out of the frame at the right — this film's title
  // at 92 px (the slot and the strike follow), set once from here
  const sz = { "retitle-main": ["fontSize", "92px"], "retitle-slot": ["height", "92px"], "retitle-strike": ["top", "42px"] };
  for (const [id, [k, v]] of Object.entries(sz)) { const el = document.getElementById(id); if (el) el.style[k] = v; }

  /* ── CHUTE: « Voilà son secret : il ne mise pas sur la force. Il lave plus longtemps… avec la même eau. » ── */
  const turn0 = 80;
  cut(t.toverdict, SET.SCENE, POSE0, { ...SCENE, jets: 0.35, cycle: 80, turn: turn0 });
  shot(t.toverdict, span(t.toverdict, t.tocta), CHUTE_END, "sine.inOut");
  // the arm turns gently all along (0.35 turn/s: its jets are soft — not the force)
  st(t.toverdict, span(t.toverdict, t.tocta), { turn: turn0 + 0.35 * span(t.toverdict, t.tocta) }, "none");
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.force, swapAt: t.longtemps - 0.05, hideAt: t.tocta - 0.42 });
  punch(t.force, 0.05);
  D.verdict(t.longtemps);
  // « plus longtemps »: the clock races to 3 h 30 — and the water goes out and comes in again between the phases
  st(t.lave, span(t.lave, t.tocta - 0.12), { cycle: 210 }, "sine.inOut");
  const drain1 = t.longtemps - 0.1;
  st(drain1, 0.32, { water: 0, jets: 0.05 }, "sine.in");
  st(drain1 + 0.32, 0.36, { water: 0.6, jets: 0.35 }, "sine.out");
  // « …avec la même eau »: during that phase, the same water goes round — the round closes once, a breath
  st(t.meme - 0.12, 0.3, { loop: 1 }, "sine.out");
  st(t.eau + 0.12, 0.3, { loop: 0 }, "sine.in");
  // and out again (the last rinse), in again — the cut takes us to the sink
  const drain2 = t.eau + 0.42;
  st(drain2, span(drain2, t.tocta - 0.04), { water: 0.15, jets: 0.05 }, "sine.in");

  /* ── COMMENTAIRE: « Et ton rinçage, avant ? Une étude a suivi deux cents foyers… Il gaspille de l'eau. » ── */
  cut(t.tocta, SET.SCENE, SINK0, { ...SCENE, night: 0, you: 1, tap: 1, rinse: 0, cycle: 210, water: 0.6 });
  shot(t.tocta, span(t.tocta, t.tolike), SINK1, "sine.inOut");
  st(t.rincage - 0.08, 0.6, { rinse: 1 }, "sine.inOut"); // the plate goes under the tap, on its word
  chip("chip-bonn", null, 96, 470, t.etude - 0.05, t.inutile + 0.36);
  st(t.gaspille - 0.06, 0.5, { drain: 1 }, "sine.out"); // the water runs to waste, signal
  // « En commentaire : toi, tu rinces encore… ou plus jamais ? » — each answer on its word; nothing typed
  duelCall(tl, { from: t.commentaire - 0.08, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.3, toneA: "signal", toneB: "veille" });
  punch(t.duelB, 0.05);

  /* ── LIKE: « Like : pour celui qui rince chaque assiette… avant de la laver. » ── */
  cut(t.tolike, SET.SCENE, DOOR0, { ...SCENE, night: 0, door: 0.4, cycle: 210, turn: turn0 + 2 });
  shot(t.tolike, span(t.tolike, t.toloop), FLOOR_END, "sine.inOut");
  st(t.pour, span(t.pour, t.likeEnd), { door: 0 }, "sine.inOut"); // the door shuts slowly on dishes nobody rinsed
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: « Abonne-toi : prochain dossier, le tunnelier… » — the light goes, the camera comes down to the floor ── */
  st(t.abo + 0.42, 0.5, { night: 1 }, "sine.inOut");
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.roue - 0.08, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: « Et juste au-dessus, chez toi… » — under the floor; the camera rises into the machine: the first frame ── */
  // every number at the first frame's but the arm's turn: it starts from rest at the cut and arrives at the first
  // frame's speed (≈ 0.9 turn/s, acte1) — the loop's glide is "sine.in": π/2 × its mean speed at the end
  const rise = span(t.toloop + 0.04, D.tEnd);
  cut(t.toloop, SET.SCENE, BELOW, { ...numbers(FIRST), turn: FIRST.turn - (0.9 / (Math.PI / 2)) * rise });
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.04, fromD: BELOW.d, ease: "sine.in" });
  // the camera goes through the kitchen floor at speed (≈ 90.9 s): its grid lines, that close, sweep the picture as
  // broad bright bands — the kitchen is invisible while it passes, and back (sine.in: in the last frames) once above
  // (retouche: the kitchen goes from ≈ 89.85 s, before the rise speeds up — its lines, rushing past the camera, made
  // the move judder at 90.4 s)
  st(t.toloop + 0.55, 0.45, { room: 0 }, "sine.inOut");
  st(D.tEnd - 0.17, 0.16, { room: 1 }, "sine.in");
}
