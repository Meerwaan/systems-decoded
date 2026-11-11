// DOSSIER 042 — the chute, what the film owes, the like, the next file last, the loop (toverdict → end).
// Plan-séquence: one path per place, az DECREASING in each, every key a few degrees further round; the calm end is an
// orbit that never stops. Cuts: toverdict (invisible, on act 3's last pose) · tocta · tolike · toabo · toloop.
// The loop: a cut on POSE0 turned 12° on the way the film turns, then D.loop WITHOUT fromD (041's trap: a black MP4
// from 91 to 92.4 s) glides the camera onto POSE0 and every number back to FIRST — the panel starts lifting again.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, LIGHT } from "./world.js";

/* the chute: from the column over the whole tank down to the open roof, along the rod, to the cam, to the locked door */
const WIDE = { ...VIEW.columnWide, az: -30 }; //                                  act 3's last pose (the seam is invisible)
const HOLE = { tx: -20, ty: 30, tz: 0, d: 900, az: -34, el: 24, fov: 34, shift: 0, dof: 0 }; // « il cède au bon endroit »: the open roof, ringed veille
const ROD_TOP = { tx: -84, ty: 16, tz: 0, d: 560, az: -36, el: 12, fov: 32 }; //  coming down the rod
const LOCKED = { ...VIEW.doorLocked, tz: 30, az: -44 }; //                         « ta porte »: plated, its seal green
/* the comment: the loader and his door, three-quarter (the bulkhead reads from az −30 on, never edge-on) */
// (from el 18 up: lower, the caisson's roof panel catches a white glare at az −30 to −42)
const LOADER = { ...VIEW.loader, az: -22, el: 16 };
const AT_DOOR = { tx: -130, ty: -20, tz: 50, d: 560, az: -38, el: 20 }; //         « le temps de saisir un obus »
const OTHER_ARM = { tx: 150, ty: -10, tz: 450, d: 700, az: -47, el: 16, fov: 34, shift: 120 }; // « une machine »: its rack and arm
/* the loop — the first frame, 12° further round on the way the whole film turns (az decreasing), a touch further back */
const BACK = { ...POSE0, d: POSE0.d * 1.05, az: POSE0.az + 12 };

export default function fin({ D }) {
  const { tl, st, path, cut, punch } = D;
  const t = D.times({
    toverdict: "toverdict", pas: "verdict", cede: "chute:cède", endroit: "chute:endroit", feu: "chute:feu",
    verrouille: "chute:verrouille", porte: "chute:porte",
    tocta: "tocta", taporte: "comment:porte", open: "opendoor", saisir: "comment:saisir", shut: "shutdoor",
    chars: "comment:chars", machine: "comment:machine", commentaire: "comment:commentaire", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", croit: "like:croit", solide: "like:solide", sur: "like:sûr",
    toabo: "toabo", abo: "abo", prochain: "abo:prochain", faisceau: "abo:faisceau", train: "abo:train", bloc: "abo:bloc",
    avaler: "abo:avaler", aboEnd: "abo$", toloop: "toloop",
  });
  const SHORT = { hold: 0.12, down: 0.3 }; // a punch with a cut close behind it

  /* ───────────── CHUTE « Ton char ne te sauve pas en résistant. Il cède au bon endroit… et c'est le feu qui
     verrouille ta porte. » — the column dies back into the roof; the camera follows the chain backwards: the open
     roof, the rod, the cam, the door. ───────────── */
  cut(t.toverdict, SET.TANK, WIDE, { ...STAGED, burn: 0.7, blow: 0.9, lock: 1, seal: 1, column: 1, mood: 0, ...LIGHT.column });
  st(t.toverdict + 0.2, t.feu - t.toverdict - 0.2, { fall: 1, burn: 0.2 }, "sine.inOut");
  retitle(tl, { showAt: t.toverdict + 0.2, strikeAt: t.pas, swapAt: t.cede - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.pas);
  punch(t.pas, 0.06);
  st(t.cede, 0.5, { weak: 1 }, "power2.out"); //                       « au bon endroit »: the weak point, ringed veille
  st(t.endroit + 0.5, 0.6, { weak: 0 }, "sine.inOut");
  st(t.cede + 0.2, t.feu - t.cede - 0.2, { shell: 0.08, ...LIGHT.lock }, "sine.inOut"); // the turret's glass steps back (its roof, grazed, is a white band)
  st(t.verrouille - 0.1, 0.4, { litCam: 0.8 }, "power2.out"); //       the cam that locked it
  st(t.porte - 0.12, 0.3, { litDoors: 0.8, litCam: 0.3 }, "power2.out"); // « ta porte »
  punch(t.porte, 0.06, SHORT);
  // (retouche) the dive from 32 m to the door in one move ran at 60–82 °/s: a slow push while the column dies back,
  // then a cut-in on the roof three frames before « Il cède », and a descent spread to tocta (d by even ratios)
  const incut = t.cede - 0.24;
  path([
    [t.toverdict, WIDE],
    [incut - 0.01, { ...WIDE, tx: -160, ty: 140, d: 2500, az: -33, el: 2, fov: 38 }],
  ]);
  path([
    [incut, HOLE],
    [t.endroit + 0.45, { ...ROD_TOP, d: 640, el: 14 }],
    [t.feu, { ...VIEW.mech, d: 520, el: 8, az: -38 }],
    [t.porte, { ...LOCKED, d: 400 }],
    [t.tocta, { ...LOCKED, d: 350, az: -48 }],
  ]);

  /* ───────────── COMMENTAIRE « Et si ta porte est ouverte ? Elle ne s'ouvre que le temps de saisir un obus. D'autres
     chars confient ce geste à une machine. En commentaire : un homme… ou une machine ? » ───────────── */
  cut(t.tocta, SET.TANK, LOADER, { ...STAGED, ...LIGHT.tank, mood: 0 }); // the ordinary day: nothing burns, door shut
  st(t.taporte - 0.1, 0.4, { litDoors: 0.7 }, "power2.out"); //       « ta porte »
  st(t.open, 0.5, { door: 1, litDoors: 0 }, "power2.out"); //         opendoor: it slides open (the clock counts)
  st(t.open + 0.1, 0.9, { reach: 1 }, "sine.inOut"); //              he turns round and steps to it
  st(t.saisir - 0.15, 0.55, { grab: 1 }, "sine.inOut"); //            « saisir »: the round comes out into his hands
  st(t.shut - 0.58, 0.58, { door: 0 }, "sine.inOut"); //              shutdoor: shut again, once the round is in his hands (grab done 67.58)
  st(t.chars - 0.3, 0.8, { other: 1 }, "sine.inOut"); //              « d'autres chars »: the other turret
  st(t.machine - 0.32, 0.8, { arm: 1 }, "sine.inOut"); //            « une machine »: its arm swings a round
  duelCall(tl, { from: t.commentaire - 0.3, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.34, toneA: null, toneB: null });
  punch(t.commentaire, 0.06);
  st(t.duelA - 0.15, 0.4, { you: 0.8 }, "power2.out"); //              « un homme »: ours, picked out
  st(t.duelB - 0.15, 0.5, { you: 0.25 }, "sine.inOut"); //             « une machine »: the eye goes to the arm
  path([
    [t.tocta, LOADER],
    [t.open, { ...AT_DOOR, d: 600, az: -30 }],
    [t.saisir, AT_DOOR],
    [t.shut, { ...AT_DOOR, tx: -95, tz: 95, d: 640, az: -42 }], //    already drifting across (no stop-then-go at 68.2)
    [t.machine, OTHER_ARM], //                                         the camera tracks across to the other turret
    [t.duelA, { ...VIEW.duo, tx: 0, tz: 205, d: 1600, shift: 0, az: -50 }], // and pulls back on both, the man first
    [t.tolike, { ...VIEW.duo, tx: 20, tz: 228, d: 1800, shift: 0, az: -53 }],
  ]);

  /* ───────────── LIKE « Like : pour celui qui croit que solide veut dire sûr. » — the bench: the caisson that gives
     at its roof, the closed block that swells and splits everywhere ───────────── */
  cut(t.tolike, SET.BENCH, { ...VIEW.like, az: -20 }, { ...BENCHED, block: 1, section: 1, fx: 185, fy: 0, fz: 0, fs: 300 }); // the light leans to the block (it read dark on dark)
  st(t.like, 1.2, { burn: 0.6 }, "sine.inOut"); //                    both burn
  st(t.croit, 0.4, { press: 0.8 }, "power2.out"); //                  the push inside the caisson
  st(t.solide - 0.1, t.sur - t.solide + 0.06, { crack: 1 }, "sine.inOut"); // « solide »: the block swells and splits
  st(t.solide + 0.25, 0.5, { blow: 0.12, vent: 1 }, "power2.out"); // the caisson only opens its roof
  likeCall(tl, { from: t.like, to: t.toabo - 0.33, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });
  punch(t.sur, 0.06, SHORT);
  path([[t.tolike, { ...VIEW.like, az: -20 }], [t.solide, VIEW.like], [t.toabo, { az: -36 }]]);

  /* ───────────── PROCHAIN DOSSIER — the 043, last: nothing of the tank after « Abonne-toi » ───────────── */
  cut(t.toabo, SET.TANK, { ...VIEW.teaser, az: -40 }, { ...STAGED, shell: 0, crew: 0, section: 0, seal: 0, mood: 0, teaser: 0.02 });
  st(t.faisceau - 0.25, 0.7, { teaser: 0.4 }, "sine.inOut"); //            « faisceau »: the beam runs
  st(t.train - 0.2, 0.7, { teaser: 0.7 }, "sine.inOut"); //                « train »: a train's worth of energy over it
  st(t.bloc - 0.1, t.avaler + 0.3 - t.bloc + 0.1, { teaser: 1 }, "sine.inOut"); // « bloc… l'avaler »: swallowed
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.faisceau - 0.05, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });
  punch(t.avaler, 0.06, SHORT);
  path([[t.toabo, { ...VIEW.teaser, az: -40 }], [t.train, VIEW.teaser], [t.toloop, { az: -56 }]]);

  /* ───────────── BOUCLE « Comme ce toit, quand… » — the panel seated again, the camera 12° round; D.loop glides onto
     POSE0 and every number back to FIRST (blow 0.08, column 0.45): it starts lifting, as on the first frame ───────── */
  cut(t.toloop, SET.TANK, BACK, { ...STAGED, ...FIRST, blow: 0, column: 0.02 });
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.04, ease: "none" });
}
