// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier
// (toverdict → the end). Every instant is a cue of the script; the order of the end (from 018): chute → what is owed
// and the comment → like → the next file → the loop.
//
//   CHUTE        on the bench, the bar alone on its pool: « une barre anti-panique » — it lights; « ton calme » struck
//                (retitle) → « la panique »: a hand of glass hits the bar at three places, « tu pousses, n'importe
//                où » — each time the bolt draws back (the header says « Libre »)
//   CE QUI EST DÛ  the hook's C, answered: the empty hall of today, a ghost leaf swings toward you (signal) ·
//                Sunderland, from above: the leaf's arc into the stairs, the children press it into its frame ·
//                the same door from above, today (a match on the door): the crowd, and the arc toward the exit (veille)
//                · the duel « barre, ou poignée ? » (the film never answers for the viewer)
//   LIKE         the door ready, its bar lights on « ouvre »
//   PROCHAIN     L03's cabin, door 1L: the hand on its lever strains on « vol … personne », nothing moves. No arrow,
//                no figure (that is 033's fall). The voice does not ask again: the panel carries « S'abonner »
//   BOUCLE       back outside the door, the crowd pushing you on the glass: the camera closes in to the first frame
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, PAST, FLIGHT, FIRST, POSE0, onBench, SYSTEM } from "./world.js";

const [BX, BY, BZ] = onBench(SYSTEM.centre);

/* ── the poses ── */
// the bench, the whole system on its slab (VIEW.whole), and the slow turn under the title
const WHOLE = { ...VIEW.whole, side: -50 }; // (the box was on the frame's left edge)
const WHOLE2 = { ...WHOLE, d: 270, az: -38, el: 16 };
// the bar in full length, three quarters: the hand hits it at three places without the camera chasing it
const HANDS = { ...VIEW.whole, tx: BX + 6, ty: BY + 4, tz: BZ + 6, d: 205, az: -40, el: 14, shift: 110, dof: 0 };
// the empty hall: the door wide from the room, the ghost leaf toward you
const DOOR = { ...VIEW.door, shift: 20, side: -60 };
// the door high, from the side (its leaf in profile, its arc on the floor) — 1883 and today framed alike: the cut
// back to today is a match on the door (VIEW.above1883, from the stairs, had the children over the door)
const ABOVE = { ...VIEW.above1883, tx: 0, ty: 30, tz: 10, d: 560, az: -75, el: 48, shift: 140 };
// the slow way down to the door at rest under its sign (comment, like): the door under the duel's panel
const LOWER = { ...VIEW.door, d: 470, az: -32, el: 24, shift: -120, side: -150 };
const READY = { ...VIEW.door, tx: 0, ty: 90, tz: 30, d: 380, az: -36, el: 14, shift: -100, side: -80 };
// the next file: L03's cabin, door 1L from down the aisle — the crew member at the door, the exit sign over it, the
// hand on the lever (VIEW.plane, close, read as a lever and a sleeve; a wider frame reads as « a door »)
const PLANE = { ...VIEW.plane, d: 580, az: 140, el: 8, shift: -60, dof: 0 };
// the loop: outside, a little farther than the first frame, the same aim — it closes in onto POSE0
const BACK = { ...POSE0, d: 470 };

/* ── the light ── */
const L_HALL = { fx: 0, fy: 60, fz: 80, fs: 600 };
const L_ABOVE = { fx: 0, fy: 30, fz: 70, fs: 650 };
const L_DOORNEAR = { fx: 0, fy: 95, fz: 30, fs: 420 };

export default function fin({ D }) {
  const { tl, st, shot, cut, punch, chip } = D;
  const t = D.times({
    toverdict: "toverdict", chute: "chute", barre: "chute:barre", calme: "calme", verdict: "verdict",
    pousses: "pousses", nimporte: "nimporte", ou: "chute:où",
    tocta: "tocta", vers: "verstoi2", sunder: "sunder2", interieur: "interieur", contre: "contre",
    france: "france", n50: "n50", sortie: "sortie", commentaire: "commentaire", duelA: "duelA", duelB: "duelB",
    like: "like", ouvre: "like:ouvre", likeEnd: "like$", toabo: "toabo", dossier: "dossier", vol: "vol",
    personne: "personne", ouvrir: "abo:l'ouvrir", aboEnd: "abo$", toloop: "toloop", rewind: "rewind",
  });

  /* ═════════════ CHUTE — on the bench ═════════════ */
  /* ── « Voilà le secret : une barre anti-panique ne te demande pas ton calme. » ── */
  cut(t.toverdict, SET.BENCH, WHOLE, { ...BENCHED });
  shot(t.toverdict, t.calme + 0.3 - t.toverdict, WHOLE2, "sine.inOut");
  st(t.barre - 0.1, 0.6, { litBar: 1 }, "sine.inOut"); // « barre anti-panique »: the bar it names lights
  retitle(tl, { showAt: t.chute + 0.1, strikeAt: t.calme, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  punch(t.calme, 0.05);

  /* ── « Elle est faite pour la panique : tu pousses, n'importe où. » ── */
  // the camera settles on the bar in full length; a hand of glass comes onto it, and hits it at three places: each
  // time the bar goes in and the bolt draws back (« Libre »), and between two hits the bar springs half back
  const settle = t.calme + 0.3;
  shot(settle, t.verdict - 0.1 - settle, HANDS, "sine.inOut", WHOLE2.d);
  st(t.verdict - 0.5, 0.4, { hand: 1, tapAt: -0.6, litBar: 0.5 }, "sine.inOut");
  D.verdict(t.verdict);
  punch(t.verdict, 0.05);
  const taps = [[t.pousses, -0.6], [t.nimporte, 0.1], [t.ou, 0.75]];
  taps.forEach(([at, x], i) => {
    if (i > 0) st(at - 0.2, 0.16, { tapAt: x }, "sine.inOut");
    st(at - 0.03, 0.09, { push: 1, pene: 1 }, "power2.out");
    st(at + 0.14, 0.2, { push: 0.3, pene: 0.6 }, "sine.inOut");
  });
  shot(t.verdict - 0.1, t.tocta - (t.verdict - 0.1), { ...HANDS, d: HANDS.d * 0.95 }, "sine.inOut");
  st(t.tocta - 0.42, 0.3, { hand: 0, push: 0, pene: 0 }, "sine.inOut");

  /* ═════════════ CE QUI EST DÛ ═════════════ */
  /* ── « Et si elle s'ouvre vers toi ? » ── */
  // the empty hall of today; on « vers » the ghost leaf swings toward you, signal — as in the hook
  cut(t.tocta, SET.SALLE, DOOR, { ...STAGED, crowd: 0, you: 0, press: 0, mood: 0, ...L_HALL });
  shot(t.tocta, t.sunder - 0.12 - t.tocta, { ...DOOR, d: DOOR.d * 0.93 }, "sine.inOut");
  st(t.vers - 0.08, 0.6, { arcIn: 1 }, "sine.inOut");

  /* ── « À Sunderland, elle s'ouvrait vers l'intérieur. Contre la foule. » ── */
  // 1883 from above: the leaf shut, the children on the stairs; on « l'intérieur » its arc swings into them; on
  // « Contre » they press it into its frame
  const at1883 = t.sunder - 0.12;
  cut(at1883, SET.SALLE, ABOVE, { ...PAST, swing: 0, press: 0.6, ...L_ABOVE });
  shot(at1883, t.france - 0.42 - at1883, { ...ABOVE, d: ABOVE.d * 0.94 }, "sine.inOut");
  st(t.interieur - 0.08, 0.6, { arcIn: 1 }, "sine.inOut");
  st(t.contre - 0.1, 0.35, { press: 1 }, "power2.out");

  /* ── « En France, au-delà de 50 personnes : vers la sortie. » ── */
  // the same door from above, today (a match on the door): « 50 personnes » — the crowd stands in the hall, loose;
  // on « sortie » the arc swings out, veille
  const atToday = t.france - 0.42;
  cut(atToday, SET.SALLE, ABOVE, { ...STAGED, crowd: 0, you: 0, press: 0, mood: 0, ...L_ABOVE });
  shot(atToday, t.sortie + 0.3 - atToday, { ...ABOVE, d: ABOVE.d * 0.95 }, "sine.inOut");
  st(t.n50 - 0.1, 0.5, { crowd: 1 }, "sine.inOut");
  chip("chip-50", null, 96, 470, t.n50 - 0.05, t.sortie + 0.24);
  st(t.sortie - 0.08, 0.6, { arcOut: 1 }, "sine.inOut");
  punch(t.sortie, 0.05);

  /* ── « En commentaire : celle de ton boulot, ton lycée… barre, ou poignée ? » ── */
  // the hall empties, the camera comes down slowly to the door at rest under its sign
  const down = t.sortie + 0.3;
  st(down, 0.7, { crowd: 0, arcOut: 0 }, "sine.inOut");
  shot(down, t.like - 0.1 - down, LOWER, "sine.inOut");
  st(down, 1.2, L_HALL, "sine.inOut");
  duelCall(tl, { from: t.commentaire - 0.5, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.3, toneA: null, toneB: null });

  /* ═════════════ LIKE ═════════════ */
  /* ── « Like : pour quelqu'un qui ouvre une salle au public. » ── */
  // on to the door, ready: its bar lights on « ouvre »
  shot(t.like - 0.1, t.toabo - (t.like - 0.1), READY, "sine.inOut", LOWER.d);
  st(t.like - 0.1, 1.5, L_DOORNEAR, "sine.inOut");
  st(t.ouvre - 0.08, 0.5, { litBar: 1 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personnes` });

  /* ═════════════ PROCHAIN DOSSIER — the last thing said ═════════════ */
  /* ── « Prochain dossier : la porte d'avion. En plein vol, personne ne peut l'ouvrir. » ── */
  // a cut matched door on door: L03's cabin, door 1L; on « vol … personne » the hand pulls on the lever, nothing moves
  cut(t.toabo, SET.AVION, PLANE, { ...FLIGHT });
  shot(t.toabo, t.toloop - t.toabo, { ...PLANE, d: PLANE.d * 0.9 }, "sine.inOut");
  st(t.vol, t.personne - t.vol, { tug: 1 }, "sine.inOut");
  punch(t.ouvrir, 0.04);
  nextFile(tl, { showAt: t.dossier - 0.3, factAt: t.dossier + 0.7, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.2, railTo: t.aboEnd + 0.15 });

  /* ═════════════ BOUCLE — « Pas comme la tienne, le jour où… » ═════════════ */
  // back outside the door, the crowd pushing you on the glass (every number of FIRST, put back by the cut); the
  // camera closes in and arrives on the first frame still moving — the hook's push takes it on
  cut(t.toloop, SET.SALLE, BACK, { ...FIRST });
  D.loop({ at: t.toloop, rewindAt: t.toloop, fromD: BACK.d, ease: "power1.in" });
}
