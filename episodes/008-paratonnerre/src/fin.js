// DOSSIER 008 — the chute, the three calls to action, the loop (59.05 → the end).
//   chute        the whole house after the storm, the rod still lit: the camera rises towards it while the received
//                idea is struck ("pas") and corrected ("où" — the rod and its conductor answer with a pulse)
//   like · abo   the bench, the kit in a row, turning slowly under the panel of the top slot
//   commentaire  what the hook left open ("le jour où la tige, c'est toi"): you, outside, time stopped again; your hair
//                on the word, your own answer climbing while the camera backs away with it; "Cours" — it leaves you
//                for the window of the house; the question
//   boucle       the house (the answer types itself) · the tree alone and its answer · back to the first frame
// Every pose was placed by projection (the top of the rod under the title, your head, the window…), then looked at.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, BENCHED, STAGED, LEADER, KIT } from "./world.js";

const rest = { roll: 0, drift: 0.3 };

/* the storm is over: rain falls, the light is veille, the channel is a ghost, the rod's path still glows */
const AFTER = { ...STAGED, fall: 1, drop: 2500, mood: 0, gel: 0.16, leader: 1, up: 1, strike: 1, hot: 0.12, cloud: 0.25, charge: 0.6, flow: 1, flowOn: 0.35, earth: 1 };
const RAIN = 800; // cm fallen per second of film, once time runs

/* chute — from the lawn (the first frame's side of the house), then up towards the rod: its top stays under the title */
const HOUSE = { tx: -220, ty: 1300, tz: 0, d: 4300, az: -38, el: -17, fov: 62, shift: 247, side: 46, ...rest };
const ROOF = { tx: -330, ty: 1150, tz: 60, d: 2300, az: -44, el: -16, fov: 62, shift: 173, side: 6 };

/* like · abonnement — the row under a panel (#net ends at y ≈ 752, #next at 771): the kit holds between y ≈ 780 and 1220 */
const ROW = { tx: KIT.open[0], ty: 41, tz: KIT.open[2], d: 540, az: -56, el: 9, fov: 28, shift: -110, side: 30, ...rest }; // (closer than first staged: under the panels the kit was 440 px wide, the weakest picture of the film)
const ROW_LIKE = { d: 530, az: -44 };
const ROW_ABO = { d: 610, az: -26, el: 15, shift: -120 };

/* commentaire — you on the lawn, from below, alone against the sky: a long lens from this side keeps the gable (left) and
   the tree (right) out of the frame. Then your answer, whole, on a wide one: the gable comes in on the left, the tree on
   the right, their tops just under the header — you stand between the shelter and the trap */
const YOU_OUT = [900, 110, 520];
const OUT = { tx: 900, ty: 150, tz: 520, d: 1055, az: 8, el: -7, fov: 30, shift: 166, side: 20, ...rest };
const OUT_NEAR = { tx: 900, ty: 170, tz: 520, d: 760, az: 6, el: -9, shift: 73 };
const OUT_ANSWER = { tx: 900, ty: 300, tz: 520, d: 1150, az: 10, el: -14, fov: 60, shift: 139 };
/* …and the shelter: the window you stood at through the whole film. It frames the picture edge to edge: from any further,
   the sill of the upper window (325 cm) crosses the header; from any closer, the line of the upper floor (270 cm) leaves
   the back of the question's panel and does the same */
const SHELTER = { tx: -80, ty: 165, tz: 350, d: 480, az: 12, el: -2, fov: 50, shift: 76, side: 40 };
const SHELTER_NEAR = { d: 465, az: 7, shift: 77, side: 35 };

/* boucle — the house, whole (the first frame's angle, a little further); the tree alone, on the first frame's line of sight */
const HOME = { tx: -220, ty: 1300, tz: 0, d: 3900, az: -40, el: -18, fov: 62, shift: 322, side: 41, ...rest };
const HOME_END = { d: 3700, az: -35, shift: 330, side: 44 };
const TREE = { tx: 1350, ty: 900, tz: -250, d: 1900, az: -38, el: -24, fov: 44, shift: 72, side: 40, ...rest };
const TREE_END = { d: 1800 };

export default function fin({ D, world }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({
    toverdict: "toverdict", pas: "verdict", elle: "chute:Elle", where: "where", tocta: "tocta",
    like: "like", likeEnd: "like$", abo: "abo", prochain: "abo:Prochain", plaque: "abo:plaque", aboEnd: "abo$",
    toout2: "toout2", hair: "hair", corps: "comment:corps", run: "run", ask: "ask", commentaire: "comment:commentaire",
    toloop: "toloop", never: "never", rewind: "rewind",
  });

  /* ── chute: "n'éloigne PAS la foudre. Elle allait tomber : il a seulement choisi OÙ." ── */
  cut(t.toverdict, SET.STORM, HOUSE, AFTER);
  st(t.toverdict, t.tocta - t.toverdict, { drop: AFTER.drop + RAIN * (t.tocta - t.toverdict) }, "none");
  shot(t.toverdict, t.tocta - t.toverdict - 0.1, ROOF, "sine.inOut", HOUSE.d);
  retitle(tl, { showAt: t.toverdict + 0.25, strikeAt: t.pas, swapAt: t.where, hideAt: t.tocta - 0.27 });
  D.verdict(t.pas);
  // "Elle allait tomber": the channel it came down glows once more, slowly, above the rod
  st(t.elle - 0.05, 0.14, { hot: 0.42 }, "power2.out");
  st(t.elle + 0.09, 1.1, { hot: 0.13 }, "power2.out");
  // "où": here — the top of the rod and the whole of its conductor
  st(t.where - 0.04, 0.22, { flowOn: 1.25, charge: 1 }, "power2.out");
  st(t.where + 0.3, 0.9, { flowOn: 0.7 }, "sine.inOut");

  /* ── LIKE: the kit, in a row, turning slowly ── */
  cut(t.tocta, SET.BENCH, ROW, { ...BENCHED, explode: 1 });
  shot(t.tocta, t.abo - 0.15 - t.tocta, ROW_LIKE);
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: the camera backs away and rises; the next file, classified ── */
  shot(t.abo - 0.15, t.toout2 - t.abo + 0.15, ROW_ABO);
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.plaque - 0.12, hideAt: t.toout2 - 0.4, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE: "Et si la tige, c'est toi ?" — outside, time stopped again (the drops hang in the air) ── */
  // the house and the tree stand back (shell 0.6): you are the brightest thing of the picture until the camera runs to the shelter
  cut(t.toout2, SET.STORM, OUT, { ...STAGED, explode: 0, out: 1, shell: 0.6, fx: YOU_OUT[0], fy: YOU_OUT[1], fz: YOU_OUT[2], fs: 240 });
  shot(t.toout2, t.hair + 0.1 - t.toout2, OUT_NEAR);
  // "tes cheveux se dressent": they rise on the word, and a filament starts out of them…
  st(t.hair, 0.8, { hair: 0.32 }, "power2.out");
  // …"ton corps lui répond": it climbs, and the camera backs away with its head
  const answer = t.corps - 0.34;
  st(answer, 1.05, { hair: 1 }, "sine.inOut");
  shot(answer, 1.05, OUT_ANSWER, "sine.inOut", OUT_NEAR.d);
  // "Cours à l'abri": the camera leaves you and runs to the house — the window you stood at
  const arrive = 1.3;
  shot(t.run, arrive, SHELTER, "sine.inOut", OUT_ANSWER.d);
  st(t.run, arrive, { fx: -80, fy: 165, fz: 280, fs: 300 }, "sine.inOut");
  st(t.run + 0.55, 0.7, { shell: 1 }, "sine.inOut"); // the shelter lights up as the camera reaches it (and the gable it sweeps past stays dim under the header)
  shot(t.run + arrive, t.toloop - t.run - arrive, SHELTER_NEAR);
  // the question; its answer types itself on "Une voiture" (with the sound's ticks), over the next shot
  commentCall(tl, { from: t.ask + 0.2, word: t.commentaire, typedAt: t.toloop + 0.02, chars: 10, to: t.never - 0.37 });

  /* ── BOUCLE: "Une voiture, une maison." — the shelter, whole: nobody is left outside ── */
  const HELD = { ...STAGED, explode: 0, leader: LEADER.first };
  cut(t.toloop, SET.STORM, HOME, HELD);
  shot(t.toloop, t.never - t.toloop, HOME_END);
  /* "Jamais l'arbre." — the tree alone: it answers too */
  cut(t.never, SET.STORM, TREE, HELD);
  shot(t.never, t.rewind - t.never, TREE_END);
  st(t.never + 0.06, 0.9, { upTree: 1 }, "power2.out");
  D.chip("chip-arbre", world.house.A.treeTop, 70, -190, t.never + 0.14, t.rewind + 0.25);
  /* "Sous l'orage, tout se joue en…" — back to the first frame (the tree's answer goes back down by itself) */
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: TREE_END.d });
}
