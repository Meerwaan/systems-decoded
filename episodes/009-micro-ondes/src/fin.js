// DOSSIER 009 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        the bench, the door in layers, seen from its FREE edge (the only side its hooks show from): ONE move
//                down the stack, each layer lit on its word — the glass ("pas la vitre": struck, it goes out), the plate
//                from close enough to count its holes ("des trous"), then along the stack to a hook, which lifts on
//                "saboter": the gesture that opens the switches
//                (every pose was placed by projection — the layers' corners against the title and the captions — then looked at)
//   like         the layers close back into one door, which turns slowly under the panel
//   abonnement   the camera backs away and comes down, the door squares up under the next file, classified
//   commentaire  what the hook left open ("sauf si ta porte ferme mal"): the frame of act 1 again, the door ajar, a
//                front getting through; hinge, seal; "on arrête de s'en servir" — the oven is switched off on the
//                word, you step back, and the camera comes round to the door for the question
//   boucle       the kitchen, whole: a sound oven, running; you come back to its glass · back to the first frame
// The door is 40 × 34: under a panel it holds half the width of the picture only if it is seen almost square on.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, FIRST, BENCHED, STAGED, VIEW } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* chute — the stack from the free edge's side, under the title (it ends at y ≈ 634) */
const STACK = { ...P, tx: 4, ty: 21, tz: 0, d: 290, az: 62, el: 18, shift: 5 };
const STACK_NEAR = { d: 275, az: 57, shift: -5 };
// the plate's lower corner, from a hand's width: its holes, its folded edge, and the dark bench under the captions
const PLATE = { ...P, tx: 12, ty: 10.3, tz: 0, d: 38, az: 44, el: 6, shift: 40 };
const PLATE_ON = { d: 35, az: 48 };
// the upper hook, almost in profile, from the same side: the camera slides to it, it never has to turn round the layers
// (round to az 105 the hook is as clean, but on the way the film and the inner frame are seen at a grazing angle from
// 40 cm: a pale slab over a third of the picture for half a second)
const HOOK = { ...P, tx: 19, ty: 29.5, tz: -20, d: 62, az: 58, el: 6, shift: 0 };
const HOOK_NEAR = { d: 54, az: 66 };

/* like · abonnement — the door, whole, under a panel (#net ends at y 761, #next at 835) */
const WHOLE = { ...P, tx: 0, ty: 21, tz: 0, d: 245, az: -32, el: 8, shift: -80, side: 45 };
const WHOLE_LIKE = { az: -20 };
const WHOLE_ABO = { d: 277, az: -13, el: 4, shift: -124 };
const WHOLE_ABO_END = { az: -8 };

/* commentaire — the profile of act 1 ("ferme mal"), then the door from three quarters under the question (#cta-field ends at y 614) */
const AJAR = { ...P, tx: -8, ty: 160.5, tz: 61, d: 160, az: -90, el: 0, fov: 30, shift: 150 };
const AJAR_NEAR = { d: 150 };
const ASK = { ...P, tx: -8, ty: 161, tz: 57.3, d: 216, az: -42, el: 6, shift: 5 };
const ASK_NEAR = { d: 208, az: -39 };

/* boucle — the whole kitchen */
const KITCHEN = { ...VIEW.kitchen };

/* what a cut to the kitchen sets, whatever came before (STAGED, and what STAGED leaves alone) */
const HOME = { ...STAGED, litGlass: 0, litMesh: 0, litHooks: 0, pool: FIRST.pool, grid: FIRST.grid };
const TURN = 0.1; // the turntable: turns per second while the oven runs

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", pas: "verdict", vitre: "chute:vitre", truth: "truth", et: "chute:et", sabot: "sabot", tocta: "tocta",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:Prochain", et2: "abo:et", aboEnd: "abo$",
    tocomment: "tocomment", hinge: "comment:Charnière", seal: "comment:joint", la: "comment:là", stop: "comment:arrête",
    ask: "ask", commentaire: "comment:commentaire", il: "comment:il", toloop: "toloop", rewind: "rewind",
  });

  /* ── chute: "Ce qui te protège, ce n'est PAS la vitre. Ce sont des trous… et un four prêt à se saboter." ── */
  cut(t.toverdict, SET.BENCH, STACK, { ...BENCHED, explode: 1, litGlass: 1, power: 0 });
  const dive = t.vitre + 0.1;
  const atPlate = t.truth - 0.17;
  shot(t.toverdict, dive - t.toverdict, STACK_NEAR);
  retitle(tl, { showAt: t.toverdict + 0.25, strikeAt: t.pas, swapAt: t.truth, hideAt: t.tocta - 0.27 });
  D.verdict(t.pas);
  // "pas": the glass goes out as its name is struck
  st(t.pas, 0.35, { litGlass: 0.25 }, "power2.out");
  st(dive, 0.4, { litGlass: 0 }, "sine.inOut");
  // "Ce sont des trous": down to the plate, close enough to count them
  shot(dive, atPlate - dive, PLATE, "sine.inOut", STACK_NEAR.d);
  st(dive, atPlate - dive, { fx: PLATE.tx, fy: PLATE.ty, fz: PLATE.tz, fs: 10 }, "sine.inOut");
  st(atPlate - 0.3, 0.45, { litMesh: 1 }, "sine.out");
  const toHook = t.et - 0.14;
  const atHook = t.sabot - 0.03;
  shot(atPlate, toHook - atPlate, PLATE_ON);
  // "…et un four prêt à se saboter": along the stack to a hook — lit on the word, and it lifts: what opens the switches
  shot(toHook, atHook - toHook, HOOK, "sine.inOut", PLATE_ON.d);
  st(toHook, atHook - toHook, { fx: HOOK.tx, fy: HOOK.ty, fz: HOOK.tz, fs: 12 }, "sine.inOut");
  st(toHook + 0.15, 0.6, { litMesh: 0.3 }, "sine.inOut");
  st(t.sabot - 0.12, 0.3, { litHooks: 1 }, "power2.out");
  st(t.sabot + 0.06, 0.4, { latch: 1 }, "back.out(2)");
  shot(atHook, t.tocta - atHook, HOOK_NEAR);

  /* ── LIKE: the layers close back into one door; it turns slowly under the panel ── */
  cut(t.tocta, SET.BENCH, WHOLE, { ...BENCHED, explode: 1, power: 0 });
  st(t.tocta + 0.04, 0.9, { explode: 0 }, "power2.inOut");
  shot(t.tocta, t.abo - 0.15 - t.tocta, WHOLE_LIKE);
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: the camera backs away and comes down ("Abonne-toi."), then the next file, classified ── */
  const atAbo = t.prochain - 0.12;
  shot(t.abo - 0.15, atAbo - t.abo + 0.15, WHOLE_ABO);
  shot(atAbo, t.tocomment - atAbo, WHOLE_ABO_END);
  // (the one fact comes in on "…et qui se sacrifie": its first half has just been said, its second is being said)
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.et2 - 0.05, hideAt: t.tocomment - 0.32, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE: "Et si ta porte ferme mal ?" — the frame of act 1: the door gapes, a front gets through ── */
  cut(t.tocomment, SET.KITCHEN, AJAR, { ...HOME, open: 0.06, leak: 0.35, spin: 0 });
  const off = t.stop - 0.08; // "on arrête": the oven is switched off
  const ran = TURN * (off - t.tocomment);
  st(t.tocomment, off - t.tocomment, { spin: ran }, "none");
  st(t.tocomment, t.hinge - t.tocomment, { leak: 0.5 }, "none");
  shot(t.tocomment, t.la - t.tocomment, AJAR_NEAR);
  // "Charnière tordue": the door has play — it gapes a little more, and comes back
  chip("chip-hinge", null, 96, 446, t.hinge - 0.05, t.seal - 0.14);
  st(t.hinge + 0.08, 0.3, { open: 0.1 }, "sine.inOut");
  st(t.hinge + 0.42, 0.5, { open: 0.06 }, "sine.inOut");
  // "joint usé": a little more gets through (never as far as your face: at 0.7 the front touches it)
  chip("chip-seal", null, 96, 446, t.seal, t.la + 0.1);
  st(t.seal + 0.05, 0.6, { leak: 0.6 }, "sine.inOut");
  // "là, on arrête de s'en servir": the field dies on the word, the plate coasts to a stop, you step back…
  st(off, 0.2, { power: 0, leak: 0, mood: 0, light: 0, lamp: 0.3 }, "power2.out");
  st(off, 1.2, { spin: ran + 0.05 }, "power2.out");
  st(off + 0.1, t.ask - off - 0.1, { near: 0 }, "sine.inOut");
  // …and the camera comes round to the door: the question (its answer is typed before the cut: no panel straddles it)
  const toAsk = t.la + 0.15;
  shot(toAsk, t.ask + 0.2 - toAsk, ASK, "sine.inOut", AJAR_NEAR.d);
  shot(t.ask + 0.2, t.toloop - t.ask - 0.2, ASK_NEAR);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.il - 0.05, chars: 6, to: t.toloop - 0.32 });

  /* ── BOUCLE: "Vieux ou neuf, derrière sa porte, il y a toujours…" — a sound oven, running; you come back to its glass ── */
  const turned = 0.3; // the plate's way back to where the film found it
  cut(t.toloop, SET.KITCHEN, KITCHEN, { ...HOME, near: 0, spin: turned - TURN * (t.rewind - t.toloop) });
  st(t.toloop, t.rewind - t.toloop, { spin: turned }, "none");
  shot(t.toloop, t.rewind - t.toloop, { d: KITCHEN.d * 0.95 });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: KITCHEN.d * 0.95 });
}
