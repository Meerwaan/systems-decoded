// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier.
// (toverdict → the end). The order of the end, from this file on, is not negotiable:
//   chute        the bench: the cooker whole, calm, its seal leaking veille on its side — « Explose » struck on
//                « pas », « Fuit » on « fuit », the account name lights up · a cut to the pin in its stop, under
//                pressure: on « ouvert » the lid tries, and stops dead on it (the spark). Nothing bursts, ever.
//   what is owed « Et si la tienne se tait ? » — the hook's own picture, gone mute (« +350 kg · Muette »): on
//                « Coupe le feu » your fingers push the knob and the crown dies; on « retomber » the pressure goes
//                down and keeps going down — the header counts — · a cut to the pin, still up: on « force » the lid
//                stops dead on it; then it comes down by itself, the pressure gone (« 0 kg », veille) · a cut to the
//                working valve, in steel: on « nettoie » the weight lifts off its chimney — the hole in view — and
//                goes back. Two labels, no more: the gestures carry the rest.
//   comment      right after, nothing in between: the picture of « Et si la tienne se tait ? » again, the danger
//                gone — the fire out, the cooker cold, your hand on the knob — and a slow step back
//   like         the vessel of glass: on « ras bord » it fills to the brim; on « jamais » it comes back to the half,
//                and on « moitié » the half-way line rings it, veille
//   next file    LAST: the bench, the cooker whole and sober, closing in under the panel. Nothing of the cooker's
//                story comes back after it; the voice does not ask to subscribe again — the panel does
//   loop         the kitchen, tonight: the cooker of glass whistling on its fire; the camera pushes in to the
//                first frame (D.loop brings every number back to FIRST)
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, HOME, PIN, VALVE } from "./world.js";

const [HX, HY, HZ] = HOME;
const [PX, PY, PZ] = PIN.at;
const TOP = VALVE.at[1] + VALVE.chimney.h; // the mouth of the chimney

/* ── the poses ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

// chute · the bench: the cooker whole under the title (it ends at y ≈ 632), its leak going off to the left
const CHUTE0 = { ...P, tx: 0, ty: 10.5, tz: 0, d: 172, az: -40, el: 14, shift: 40 };
const CHUTE1 = { ...CHUTE0, d: 158 };
// chute · the pin up in its stop, along the lid's edge (the pose act 2 used for « impossible de l'ouvrir »)
const PIN_B = { ...VIEW.pinPart };
// what is owed · the hook's picture, a step further: the cooker on its fire, your arm of glass, your fingers on the knob
const MUTE0 = { ...P, tx: HX, ty: HY + 13, tz: HZ + 4, d: 140, az: -64, el: 5, fov: 40, shift: 90, side: 60 };
const MUTE1 = { ...MUTE0, ty: HY + 12, tz: HZ, d: 110, side: 30 };
// what is owed · the pin, in the kitchen (act 3's pose for « tient toujours »)
const PIN_K = { ...P, tx: HX + PX, ty: HY + PY + 1, tz: HZ + PZ, d: 22, az: -62, el: 10, shift: 60 };
// what is owed · the working valve through the glass of the lid: the chimney's bore, the weight above it
// (in steel: close, the lid's glass is a bright plain across the picture from every side but the far one — and from
// there the handles change sides)
const CLEAN = { ...P, tx: HX, ty: HY + TOP, tz: HZ, d: 46, az: -60, el: 26, shift: -40 };
// comment · the picture of « Et si la tienne se tait ? » again, the danger gone: the fire out, the cooker cold, your
// hand on the knob (under #cta-field, which ends at y ≈ 615)
const ASK0 = { ...MUTE0 };
const ASK1 = { ...MUTE0, d: 152 };
// like · the vessel of glass, under #net (it ends at y ≈ 764) and over the captions
const LEVEL0 = { ...P, tx: HX, ty: HY + 11, tz: HZ, d: 172, az: -50, el: 8, shift: -70 };
const LEVEL1 = { ...LEVEL0, d: 160 };
// next file · the bench, the cooker whole under #next (it ends at y ≈ 860)
const ABO0 = { ...P, tx: 0, ty: 11, tz: 0, d: 232, az: -40, el: 14, shift: -100 };
const ABO1 = { ...ABO0, d: 212, shift: -95 };
// loop · the hook's picture from a step back: the way back is a push-in, like the first second of the film
const AWAY = (pose0) => ({ ...pose0, d: pose0.d * 1.2 });

/* ── the state ── */
// the chute is told under pressure, the valve gone mute: « +350 kg · Muette » — what the film has been about. It
// leaks; it does not burst. (On the bench, in steel: nothing of the pressure is drawn, the header says it)
const HELD = { bar: 1, whistle: 0 };

/* ── the light ── */
const L_WHOLE = { fx: 0, fy: 11, fz: 0, fs: 26 };
const L_PIN_B = { fx: PX, fy: 16.5, fz: PZ, fs: 12 };
const L_POT = { fx: HX, fy: HY + 11, fz: HZ, fs: 40 };
const L_PIN_K = { fx: HX + PX, fy: HY + PY + 0.5, fz: HZ + PZ, fs: 12 };
const L_VALVE = { fx: HX, fy: HY + TOP, fz: HZ, fs: 13 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", noblast: "noblast", pas: "chute:pas", verdict: "verdict",
    burns: "burns", tolid: "chute:couvercle-0.14", opened: "opened",
    tocta: "tocta", yours: "yours", fireoff: "fireoff", letfall: "letfall", toforce: "comment:Ne-0.14", noforce: "noforce",
    toclean: "comment:Puis-0.14", clean: "clean", ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    tolike: "tolike", like: "like", brim: "brim", foamy: "foamy", never: "like:jamais", half: "half",
    toabo: "toabo", next: "next", charge: "charge", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });

  /** The header answers a word: a beat on the push (#hud-clock). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ══════════ CHUTE ══════════ */

  /* ── « Voilà son secret : une cocotte aux normes n'explose pas. Elle fuit. » ── */
  // the bench, the cooker whole and calm, its seal already bulging out at the window. « Explose » comes with the words
  // that state it, is struck on « pas »; on « fuit » the seal gives and the steam leaves sideways, veille — « Fuit »
  cut(t.toverdict, SET.BENCH, CHUTE0, { ...BENCHED, ...HELD, leak: 0.5, plume: 1, ...L_WHOLE });
  shot(t.toverdict, span(t.toverdict, t.tolid), CHUTE1, "sine.inOut", CHUTE0.d);
  st(t.verdict - 0.05, 0.35, { leak: 1 }, "power2.out");
  st(t.verdict, 0.4, { litSeal: 0.6 }, "sine.out");
  retitle(tl, { showAt: t.secret + 0.25, strikeAt: t.pas, swapAt: t.verdict, hideAt: t.tolid - 0.3 });
  D.verdict(t.verdict);

  /* ── « Ce qui brûle, c'est un couvercle… ouvert sous pression. » ── */
  // the pin, up in its stop — there is pressure (« +350 kg »). On « ouvert » the lid tries to turn: a hair, and it
  // stops dead on the pin. Nobody, nothing thrown
  cut(t.tolid, SET.BENCH, PIN_B, { ...BENCHED, ...HELD, plume: 0.3, litPin: 0.5, ...L_PIN_B });
  st(t.opened + 0.1, 0.12, { twist: 1 }, "power3.out");
  st(t.tocta - 0.45, 0.3, { twist: 0 }, "sine.inOut");
  chip("chip-brule", null, 96, 470, t.opened + 0.12, t.tocta - 0.2);

  /* ══════════ WHAT IS OWED ══════════ */

  /* ── « Et si la tienne se tait ? Coupe le feu. Laisse la pression retomber. » ── */
  // the hook's own picture, gone mute: the foam against the lid, the weight still, « +350 kg · Muette ». On « Coupe »
  // your fingers push the knob down and the crown of flame dies; on « retomber » the pressure starts down — and keeps
  // going down until « nettoie » (the header counts, never holds a figure)
  const zero = t.toclean - 0.08; // the pressure is gone
  cut(t.tocta, SET.KITCHEN, MUTE0, { ...STAGED, xray: 1, seen: 0.8, foam: 1, clog: 1, whistle: 0, bar: 1.4, plume: 0.4, ...L_POT });
  shot(t.tocta, span(t.tocta, t.toforce), MUTE1, "sine.inOut", MUTE0.d);
  st(t.fireoff + 0.05, 0.22, { press: 1 }, "power2.out");
  st(t.fireoff + 0.22, 0.5, { flame: 0 }, "sine.in");
  st(t.fireoff + 0.9, 0.35, { press: 0 }, "sine.inOut");
  st(t.letfall + 0.1, span(t.letfall + 0.1, zero), { bar: 0 }, "none");
  st(t.letfall + 0.1, span(t.letfall + 0.1, t.toforce), { seen: 0.3, boil: 0 }, "sine.inOut");

  /* ── « Ne force jamais le couvercle. » ── */
  // the pin, still up: on « force » the lid stops dead on it. Then, the pressure gone, it comes down by itself
  cut(t.toforce, SET.KITCHEN, PIN_K, { ...STAGED, you: 0, flame: 0, boil: 0, foam: 1, clog: 1, whistle: 0, plume: 0.3, litPin: 0.5, ...L_PIN_K });
  st(t.noforce + 0.1, 0.12, { twist: 1 }, "power3.out");
  st(t.noforce + 0.8, 0.3, { twist: 0 }, "sine.inOut");
  chip("chip-force", null, 96, 470, t.noforce + 0.15, t.toclean - 0.14);
  st(zero - 0.3, 0.3, { mood: 0, litPin: 0 }, "sine.inOut");
  beat("#hud-clock", zero, 1.2);

  /* ── « Puis nettoie la soupape. » ── */
  // the working valve, in steel, from above. On « nettoie » the weight lifts off its chimney — the hole in view, the
  // plug gone from its bore (`clog`, not drawn in steel) — and goes back on it
  const COLD = { ...STAGED, flame: 0, boil: 0, bar: 0, foam: 0, whistle: 0, seen: 0, mood: 0 };
  cut(t.toclean, SET.KITCHEN, CLEAN, { ...COLD, you: 0, clog: 1, xray: 0, ...L_VALVE });
  st(t.clean + 0.1, 0.3, { off: 0.4 }, "power2.out");
  st(t.clean + 0.4, 0.5, { clog: 0 }, "sine.inOut");
  const back = Math.min(t.clean + 1.0, t.ask - 0.35);
  st(back, 0.3, { off: 0 }, "power2.inOut");
  chip("chip-nettoie", null, 96, 470, t.clean + 0.12, t.ask - 0.15);

  /* ══════════ COMMENT ══════════ */
  // « En commentaire : elle te fait peur, ta cocotte ? » — at once: the picture of « Et si la tienne se tait ? »
  // again, the danger gone — the fire out, the cooker of glass cold, your hand on the knob — and a slow step back
  cut(t.ask, SET.KITCHEN, ASK0, { ...COLD, xray: 1, ...L_POT });
  shot(t.ask, span(t.ask, t.tolike), ASK1, "sine.inOut", ASK0.d);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 6, to: t.tolike - 0.3 });

  /* ══════════ LIKE ══════════ */
  // « Like : quelqu'un, ce soir, va la remplir à ras bord. Ce qui mousse : jamais plus de la moitié. »
  cut(t.tolike, SET.KITCHEN, LEVEL0, { ...STAGED, you: 0, flame: 0, bar: 0, whistle: 0, boil: 0, xray: 1, seen: 0, fill: 0.5, mood: 0, ...L_POT });
  shot(t.tolike, span(t.tolike, t.toabo), LEVEL1, "sine.inOut", LEVEL0.d);
  st(t.brim + 0.05, 0.7, { fill: 1 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.foamy - 0.3, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });
  st(t.never, 0.6, { fill: 0.5 }, "sine.inOut");
  st(t.half + 0.05, 0.4, { mark: 1 }, "power2.out");
  chip("chip-moitie", null, 96, 470, t.foamy + 0.05, t.toabo - 0.15);

  /* ══════════ NEXT FILE — LAST ══════════ */
  // the bench, the cooker whole and sober, closing in under the panel. Nothing else moves
  cut(t.toabo, SET.BENCH, ABO0, { ...BENCHED, ...L_WHOLE });
  shot(t.toabo, span(t.toabo, t.toloop), ABO1, "sine.inOut", ABO0.d);
  nextFile(tl, { showAt: t.next, factAt: t.charge, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ══════════ LOOP ══════════ */
  // « Tout le contraire de… » → « Ta cocotte-minute siffle. » — tonight again: the cooker of glass whistling on its fire
  const first = numbers(D.first);
  const from = AWAY(D.pose0);
  cut(t.toloop, D.first.set, from, { ...STAGED, ...first });
  shot(t.toloop, span(t.toloop, t.rewind), { d: from.d * 0.97 }, "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: from.d * 0.97 });
}
