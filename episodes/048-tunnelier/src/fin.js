// DOSSIER 048 — the chute, what the film still owes, the calls to action, the loop (toverdict → the end).
//   chute        back in the section, the hook's own picture pulled back: the street stopped at 8 mm, the cutterhead
//                turning. The camera comes down to the face: on "Il passe" the soil's red arrows push on it, on
//                "retenir" the chamber's green ones grow to meet them (the title: « Il creuse » struck, « Il retient »).
//                Then it rises to the street that holds, the car crossing over the trough (« et ta rue au-dessus »).
//   comment      the principle in profile: on "trop fort" the green arrows overshoot, the face is pushed back (header:
//                Trop forte) · a cut to the gauge on the kerb: the index climbs above zero on "monte" (header: Monte —
//                no figure) · a cut to the town from above: the tunnel's trace draws itself under it; the question in two
//                answers (duelCall), each lit on its word, nothing answered for the viewer.
//   like         the bedroom window, someone asleep; on "au-dessus d'un tunnelier" one long pull-back, by ratio, down
//                through the street and the soil to the machine far below, which advances a little (rams).
//   abonnement   the night sky from the street, the satellite crossing it under the next file: nothing of the tunnel.
//   boucle       above POSE0 with FIRST, and D.loop brings the camera down to it: the last frame is the first.
// The street's settlement is a HYPOTHESIS from "Et si…" on: the header leaves 8 mm for 0 on that cut (it would
// otherwise count 7, 6, 5… down to "Monte", figures the voice never says).
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, TBM } from "./world.js";

const AY = TBM.axisY;
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* chute — the title (#retitle + its shade) holds y 442 … 840: the face and the street stand under it */
const CHUTE_IN = { ...POSE0, d: POSE0.d * 1.12, drift: 0.3 };
const CHUTE_FACE = { ...P, tx: -60, ty: AY + 150, tz: 250, d: 3400, az: -22, el: 20, fov: 40, shift: -140 };
const CHUTE_STREET = { ...P, tx: -250, ty: -250, tz: 0, d: 2800, az: -28, el: 50, fov: 44, shift: -160 }; // high: seen low, the trough's strips make a red wall at settle 8
const L_SECTION = { fx: 0, fy: AY + 300, fz: 0, fs: 1600 };

/* comment — the principle in profile (docs/journal/048-model.md « principle »), the gauge, the town */
const PRINCIPLE = { ...P, tx: 20, ty: AY, tz: 300, d: 3300, az: -8, el: 4, fov: 30, shift: 40 };
const PRINCIPLE_END = { ...PRINCIPLE, d: 3050, az: -5 };
const KERB_END = { ...VIEW.kerb, d: 400, az: -33 };
const TOWN = { ...VIEW.town, tx: 2500, ty: -800, tz: -1000, d: 30000, dof: 0 }; // (048-rue.md: more of the trace)
const TOWN_END = { ...TOWN, az: -41, el: 55 };

/* like — the window, then down to the machine far below */
const BED_IN = { ...VIEW.bedroom, d: 660 }; // (retouche 13/11) closer: the sleeper reads at 270 px
const WIDE = { ...P, tx: -150, ty: -550, tz: 0, d: 6200, az: -14, el: 6, fov: 34, shift: 0 }; // the section on the way: room, street, soil
const DEEP = { ...P, tx: 200, ty: AY + 250, tz: 0, d: 5600, az: -12, el: 7, fov: 34, shift: -40 };

/* abonnement — the sky; the next file holds the top slot.
   (retouche 13/11) A long lens from the street (camera ≈ (-900, 170, 1500), VIEW.sky's) on the satellite at the start
   of its way: SAT_A → SAT_B is 0.012 → 0.025 of `sat`, so rue.js's fade (smooth 0 → 0.05) keeps its glow and trail low
   enough for the bus and the wings to read; the aim is fixed at 0.019, the satellite drifts across it, the lens pushes. */
const SAT_A = 0.012;
const SAT_B = 0.025;
const SKY = { ...P, tx: -28860, ty: 60000, tz: -40000, d: 78000, az: 33.97, el: -50.09, fov: 9, shift: -150, drift: 0 };
const SKY_END = { ...SKY, fov: 6.5 };

/* boucle — above the first frame, on its azimuth */
const LOOP_D = POSE0.d * 1.3;

export default function fin({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    toverdict: "toverdict", creuse: "chute:creuse", passe: "chute:passe", retenir: "chute:retenir", terre: "chute:La",
    rue: "chute:rue", tocta: "tocta", fort: "comment:fort", soulève: "comment:soulève", monte: "comment:monte",
    en: "comment:En", commentaire: "comment:commentaire", duelA: "duelA", duelB: "duelB",
    tolike: "tolike", like: "like", dort: "like:dort", above: "like:au-dessus", tunnelier: "like:tunnelier",
    toabo: "toabo", abo: "abo", prochain: "abo:prochain", sans: "abo:Sans", aboEnd: "abo$",
    toloop: "toloop",
  });
  const toKerb = t.soulève - 0.65; // in the breath after "fort ?" (71.98 → 72.60)

  /* ── CHUTE: "Voilà son secret : tu crois qu'un tunnelier creuse. Il passe son temps à retenir." ── */
  cut(t.toverdict, SET.SECTION, CHUTE_IN, {
    ...STAGED, ...L_SECTION, settle: 8, press: 1, earth: 1, face: 0.2, loose: 0, rams: 0.3, arrows: 0, hold: 0,
    mood: 0, carX: -40, wheel: 20, screw: 40,
  });
  shot(t.toverdict, t.terre - t.toverdict, CHUTE_FACE, "sine.inOut");
  st(t.toverdict, t.tocta - t.toverdict, { wheel: 20 + 0.06 * (t.tocta - t.toverdict), screw: 40 + 0.15 * (t.tocta - t.toverdict), carX: -420 }, "none");
  // "Il passe son temps…": the soil pushes on the face · "…à retenir": the chamber pushes back, to meet it
  st(t.passe - 0.1, 0.45, { arrows: 1 }, "power2.out");
  st(t.retenir - 0.05, 0.6, { hold: 1, litChamber: 0.5 }, "power2.out");
  punch(t.retenir, 0.06);
  retitle(tl, { showAt: t.creuse - 0.1, strikeAt: t.passe, swapAt: t.retenir, hideAt: t.tocta - 0.42 });
  D.verdict(t.retenir);
  // "La terre devant lui… et ta rue au-dessus.": up from the face to the street that holds, the car over the trough
  shot(t.terre, t.tocta - 0.05 - t.terre, CHUTE_STREET, "sine.inOut");
  st(t.rue, 0.5, { litChamber: 0 }, "sine.inOut");

  /* ── COMMENT 1: "Et si cette terre pousse trop fort ?" — the principle in profile; the green arrows overshoot ── */
  cut(t.tocta, SET.SECTION, PRINCIPLE, {
    ...STAGED, ...L_SECTION, settle: 0, press: 1, earth: 1, face: 0, loose: 0, rams: 0.3, arrows: 1, hold: 1,
    mood: 0, carX: -1600, wheel: 30, screw: 60,
  });
  shot(t.tocta, toKerb - t.tocta, PRINCIPLE_END, "sine.inOut");
  st(t.tocta, toKerb - t.tocta, { wheel: 30 + 0.06 * (toKerb - t.tocta), screw: 60 + 0.15 * (toKerb - t.tocta) }, "none");
  st(t.fort - 0.45, 0.6, { hold: 1.4, press: 1.4 }, "power2.out");
  st(t.fort - 0.1, 0.7, { face: -0.6 }, "sine.inOut");
  st(t.fort, 0.25, { mood: 1 }, "power2.out");

  /* ── COMMENT 2: "Le sol se soulève : ta rue monte." — the gauge on the kerb: the index climbs above zero ── */
  cut(toKerb, SET.SECTION, VIEW.kerb, {
    ...STAGED, ...L_SECTION, settle: 0, press: 1.4, earth: 1, face: -0.6, arrows: 0, hold: 0, mood: 1, carX: 250,
  });
  shot(toKerb, t.en - 0.25 - toKerb, KERB_END, "sine.inOut");
  st(toKerb, t.en - 0.25 - toKerb, { carX: -700 }, "none");
  st(t.soulève - 0.05, t.monte + 0.1 - t.soulève, { settle: -1.2 }, "sine.inOut");
  chip("chip-souleve", null, 96, 470, t.soulève, t.en - 0.38);
  punch(t.monte, 0.06, { hold: 0.12, down: 0.3 });

  /* ── COMMENT 3: "En commentaire : sous chez toi, il passe un tunnel… oui, ou non ?" — the town, the trace under it ── */
  const toTown = t.en - 0.22;
  cut(toTown, SET.SECTION, TOWN, {
    ...STAGED, settle: 0, press: 1, face: 0, arrows: 0, hold: 0, mood: 0, town: 1, trace: 0, carX: -1600, fs: 9000,
  });
  shot(toTown, t.tolike - toTown, TOWN_END, "sine.inOut");
  st(t.commentaire, t.duelA - 0.5 - t.commentaire, { trace: 1 }, "sine.inOut");
  duelCall(tl, { from: t.en, word: t.commentaire, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.3, toneA: "signal", toneB: "veille" });

  /* ── LIKE: "Like : pour celui qui dort au-dessus d'un tunnelier, sans le savoir." ── */
  cut(t.tolike, SET.SECTION, VIEW.bedroom, {
    ...STAGED, settle: 0, press: 1, face: 0, arrows: 0, hold: 0, mood: 0, sleeper: 1, carX: 1600, rams: 0.3,
    wheel: 40, screw: 80, fx: VIEW.bedroom.tx, fy: VIEW.bedroom.ty, fz: VIEW.bedroom.tz, fs: 700,
  });
  // (retouche 13/11) the bedroom holds to "au-dessus"; a clean cut a few frames before it to the section (the long
  // pull-back crossed half a second of the dark street front), then down to the machine far below
  const down = t.above - 0.12;
  shot(t.tolike, down - t.tolike, BED_IN, "sine.inOut");
  cut(down, null, WIDE, { fy: AY + 300, fx: 0, fz: 0, fs: 1600 });
  shot(down, t.toabo - 0.06 - down, DEEP, "sine.inOut");
  st(t.tolike, t.toabo - t.tolike, { wheel: 40 + 0.06 * (t.toabo - t.tolike), screw: 80 + 0.15 * (t.toabo - t.tolike) }, "none");
  st(t.tunnelier, t.toabo - 0.1 - t.tunnelier, { rams: 0.5 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.toabo - 0.3, count: 5, label: (n) => `${n} personnes` });

  /* ── ABONNEMENT: "Abonne-toi : prochain dossier, ton GPS. Sans réglage…" — the sky, a satellite; nothing of the tunnel ── */
  cut(t.toabo, SET.SECTION, SKY, { ...STAGED, settle: 0, press: 1, face: 0, mood: 0, sat: SAT_A, carX: 1600 });
  shot(t.toabo, t.toloop - t.toabo, SKY_END, "sine.inOut");
  st(t.toabo, t.toloop - t.toabo, { sat: SAT_B }, "none");
  nextFile(tl, { showAt: t.prochain - 0.15, factAt: t.sans - 0.05, hideAt: t.toloop - 0.38, railFrom: t.abo + 0.1, railTo: t.toloop - 0.3 });

  /* ── BOUCLE: "Et pendant ce temps…" — above the first frame; the camera comes down to it, the car and the wheel run on ── */
  cut(t.toloop, SET.SECTION, { ...POSE0, d: LOOP_D }, { ...STAGED, ...FIRST, wheel: FIRST.wheel - 0.1, screw: FIRST.screw - 0.25, carX: FIRST.carX + 150 });
  D.loop({ at: t.toloop, rewindAt: t.toloop, fromD: LOOP_D });
}
