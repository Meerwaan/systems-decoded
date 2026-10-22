// DOSSIER 024 — the chute, what the film still owes, like, the next file — and the loop (toverdict → the end).
//   chute        the bench, the system whole, turning slowly under the title « Au bloc, la sécurité : Couper » —
//                struck on "couper", « Tenir » on "tenir" (the account name lights up there); on "prévenir" the
//                monitor's LED lights. "la panne": the circuit goes dim (what a cut would be); "le défaut": it lives
//                again, and a small signal light sits in casing A — between the two, the system has chosen the fault
//   commentaire  « Qu'une fois ? » is paid: the rail and the two casings in one frame, the first fault on, the monitor
//                warning. "deuxième": casing B, on the other conductor; "coupe": the loop closes, the breakers trip,
//                the circuit goes dark (chip « Deuxième défaut · Ça coupe »). "D'où l'alarme": back before it, the LED
//                beats; "répare": the fault goes out, the gauge is high again — the circuit holds. Then a cut to the
//                back wall of the bloc, the cabinet and the conduits: the field asks the electricians, « À VOUS »
//   like         the same wall: the camera runs along the conduit from the cabinet; on "câblent" a veille head runs
//                the wiring down to the socket
//   prochain     the bloc from far and high, a model in the night, the operation going on. The panel carries the
//                subscription; nothing of the subject is lit (no fault, no alarm)
//   boucle       the bloc, a little further than the first frame: the cut puts every number back to FIRST, and
//                D.loop brings the camera back to POSE0 by ratio — « …tu dors, sur la table d'opération »
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, CABINET, CONDUIT } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — the title ends at y ≈ 760: the system stands under it (shift negative pushes the picture down) */
const WHOLE = { ...VIEW.whole, d: 450, az: -40, shift: -150 };
const WHOLE_MID = { d: 430, az: -28 };
// from "la panne" the camera closes in on the two casings, where the choice is shown (under the title's shade)
const CHOICE = { tx: 58, ty: 32, tz: 3, d: 185, az: -22, el: 12 };

/* commentaire — the two casings close: A with its fault, B on the other conductor (the title has left: up a little) */
const CASES_END = { d: 160, az: -18, shift: -50 };
// "ça coupe": the rail (breakers, monitor) and the two casings in one frame — the loop, the trip
const DOUBLE = { ...P, tx: 34, ty: 38, tz: 0, d: 345, az: -14, el: 14, shift: -60 };
const DOUBLE_END = { d: 330, az: -20 };
// the back wall of the bloc: the cabinet, the conduits (the comment field ends at y ≈ 640)
const WALLS = { ...VIEW.walls, tx: 205, ty: 165, d: 620, az: -14, shift: -60 };
const WALLS_END = { d: 590 };
// like: along the conduit, from the cabinet toward the sockets (the like panel ends at y ≈ 760)
const RUN = { tx: CABINET.at[0] - 80, ty: CONDUIT.run - 55, tz: CONDUIT.z + 7, d: 820, az: -16, el: 8, shift: -110 };
const RUN_END = { tx: 150, d: 800, az: -12 };

/* prochain — far and high, the next file over it */
const FAR = { ...VIEW.far, shift: -200 };
const FAR_END = { d: 1800, az: -34 };

/* boucle — from POSE0's side, a little further */
const AWAY = { ...POSE0, d: 680, az: -40 };

export default function fin({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", strike: "strike", verdict: "verdict", prevenir: "prevenir",
    panne: "panne", defaut3: "defaut3", tocta: "tocta",
    deuxieme: "deuxieme", coupe2: "coupe2", alarme2: "alarme2", repare2: "repare2",
    ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    tolike: "tolike", cablent: "cablent", likeEnd: "like$",
    toabo: "toabo", virage: "virage", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: "Voilà son secret : au bloc, la sécurité, c'est d'abord de ne pas couper. C'est de tenir… et de
     prévenir. Parce qu'ici, la panne est plus dangereuse que le défaut." ── */
  cut(t.toverdict, SET.BENCH, WHOLE, { ...BENCHED, current: 1 });
  shot(t.toverdict, t.panne - t.toverdict, WHOLE_MID, "sine.inOut");
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.strike, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);
  // "prévenir": the monitor's LED
  st(t.prevenir, 0.2, { alarm: 1, litCpi: 0.6 }, "power2.out");
  st(t.prevenir + 0.45, 0.6, { alarm: 0.3, litCpi: 0 }, "sine.inOut");
  // "la panne": the circuit goes dim — what a cut would be
  shot(t.panne, t.tocta - t.panne, CHOICE, "sine.inOut", WHOLE_MID.d);
  st(t.panne, 0.3, { current: 0.15, alarm: 0 }, "power2.out");
  // "le défaut": it lives again, and the first fault sits in casing A — a small light on a living circuit
  st(t.defaut3, 0.25, { current: 1 }, "power2.out");
  st(t.defaut3, 0.25, { fault: 1 }, "power2.out");
  now(t.defaut3 + 0.1, { faults: 1 });

  /* ── COMMENTAIRE 1: "Qu'une fois ? Oui : au deuxième défaut, là, ça coupe. D'où l'alarme : on répare avant." ── */
  // no cut: the casings the chute closed in on stay; the monitor now warns (off frame: the header counts)
  now(t.tocta, { fault: 1, ins: 0, alarm: 1, faults: 1, current: 1 });
  shot(t.tocta, t.coupe2 - 0.1 - t.tocta, CASES_END, "sine.inOut");
  // "deuxième": casing B, on the other conductor
  st(t.deuxieme, 0.25, { fault2: 1 }, "power2.out");
  now(t.deuxieme + 0.1, { faults: 2 });
  // "ça coupe": a cut back to the rail and both casings (the same object, wider) — the loop closes, then the
  // breakers trip and the circuit goes dark
  cut(t.coupe2 - 0.1, SET.BENCH, DOUBLE, { ...BENCHED, fault: 1, fault2: 1, ins: 0, alarm: 1, faults: 2 });
  shot(t.coupe2 - 0.1, t.ask - t.coupe2 + 0.1, DOUBLE_END, "sine.inOut");
  st(t.coupe2, 0.2, { double: 1 }, "power2.out");
  st(t.coupe2 + 0.22, 0.22, { trip: 1 }, "power2.in");
  st(t.coupe2 + 0.4, 0.3, { current: 0, double: 0 }, "power2.out");
  chip("chip-deux", null, 96, 470, t.deuxieme + 0.1, t.alarme2 - 0.15);
  // "D'où l'alarme": back to before it — one fault, the LED beats
  st(t.alarme2, 0.35, { trip: 0, double: 0, fault2: 0, current: 1 }, "sine.inOut");
  now(t.alarme2 + 0.1, { faults: 1 });
  st(t.alarme2 + 0.05, 0.15, { alarm: 0.35 }, "power2.out");
  st(t.alarme2 + 0.2, 0.2, { alarm: 1 }, "power2.out");
  // "on répare": the fault goes out, the gauge is high again — the circuit holds
  st(t.repare2, 0.4, { fault: 0, ins: 1, alarm: 0 }, "sine.inOut");
  now(t.repare2 + 0.1, { faults: 0 });

  /* ── COMMENTAIRE 2: "En commentaire : électriciens, dites-nous ce qu'on a simplifié." — what carries the system:
     the back wall of the bloc, the cabinet, the conduits where the current runs ── */
  cut(t.ask, SET.BLOC, WALLS, { ...STAGED, mood: 0, cabinet: 0.45, fx: 200, fy: 150, fz: -270, fs: 500 });
  shot(t.ask, t.tolike - 0.2 - t.ask, WALLS_END, "sine.inOut");
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 6, to: t.tolike - 0.3 });

  /* ── LIKE: "Like : pour celles et ceux qui câblent les hôpitaux." — along the conduit, the head runs the wiring ── */
  shot(t.tolike - 0.2, t.cablent - t.tolike + 0.2, RUN, "sine.inOut", WALLS_END.d);
  shot(t.cablent, t.toabo - t.cablent, RUN_END, "sine.inOut");
  st(t.cablent, t.toabo - 0.1 - t.cablent, { seek: 1 }, "sine.inOut");
  likeCall(tl, { from: t.tolike + 0.12, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });

  /* ── PROCHAIN DOSSIER: "Prochain dossier : dans un virage, ta voiture freine une roue… sans toi." — the bloc from far,
     a model in the night; the last thing the film announces ── */
  cut(t.toabo, SET.BLOC, FAR, { ...STAGED, mood: 0, fs: 900 });
  shot(t.toabo, t.toloop - t.toabo, FAR_END, "sine.inOut");
  nextFile(tl, { showAt: t.toabo + 0.06, factAt: t.virage - 0.1, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: "Elle veille même quand…" → « Tu dors, sur la table d'opération. » ── */
  cut(t.toloop, SET.BLOC, AWAY, { ...STAGED, ...numbers(FIRST) });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: AWAY.d });
}
