// DOSSIER 023 — the chute, what the film still owes, the like, the next file, the loop (toverdict → the end).
//   chute        ONE shot: the whole plane from the side over the sea at dawn, the RAT out and spinning, the green circuit
//                lit — gliding (`alt` counts down in the header). "Tombe" struck on "ne tombe pas", "Plane" on "Il plane";
//                on "vent de sa descente" the streaks flow and turn veille through the RAT's disc, the camera closes in;
//                on "piloter" the control surfaces answer
//   commentaire  what is owed — the brakes: the gear's bay, the brakes hot (signal) · the approach low over the runway,
//                "370 kilomètres-heure" · the wheels on the runway: the tyres let go, a few slow sparks, it stops ·
//                the plane stopped at dawn, "Aucun mort" · you at your window, the question
//   like         you, closer: your hand on the armrest
//   prochain     the bench, the RAT whole and turning slowly, under the next file — the last thing the film announces
//   boucle       the night, the plane a little further than the first frame: D.loop brings every number back
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, POSE0, GEAR, YOU } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — the title (kicker + one line) ends at y ≈ 660: the plane under it */
const GLIDE = { ...P, tx: -300, ty: -200, tz: 0, d: 14000, az: -20, el: 12, fov: 42, shift: 20 };
// "le vent de sa descente": in, by ratio, under the belly to the RAT — its disc, the streaks through it, the live line
const GLIDE_END = { ...P, tx: -850, ty: -360, tz: 150, d: 2000, az: -60, el: -10, fov: 42, shift: 40 };
// "piloter": a cut to the near wing's outer half, from behind and outside — its aileron (veille) answers the stick
const AILERON = { ...P, tx: 1000, ty: 40, tz: 2300, d: 2300, az: 52, el: 16, fov: 34, shift: -40 };
const AILERON_END = { d: 2150, az: 48 };
// the RAT out, spinning, the green circuit holding the surfaces (the state of the end of act 3, in the air)
const RESCUED = { door: 1, arm: 1, whirl: 1, press: 1, flow: 1, surf: 1, lines: 0, engines: 0 };

/* commentaire */
// the main gear from behind on the left (from the front, the near engine hides it)
const GEARV = { ...P, tx: GEAR.main[0], ty: -430, tz: GEAR.main[1], d: 1900, az: 55, el: 6, fov: 30, shift: 80 };
const GEARV_END = { d: 1750, az: 50 };
// low over the runway, from the front on the left: the whole plane, the runway's lights under it
const FLARE = { ...P, tx: -300, ty: -350, tz: 0, d: 10500, az: -58, el: 2, fov: 36, shift: -80 };
const FLARE_END = { d: 9800, az: -52 };
// the wheels on the runway, from the side and low
const WHEELS = { ...P, tx: GEAR.main[0], ty: -500, tz: GEAR.main[1], d: 1100, az: 70, el: 4, fov: 34, shift: 120 };
const WHEELS_END = { d: 1020, az: 66 };
// stopped on the runway at dawn, from high behind on the left
const STOPPED = { ...P, tx: -300, ty: -582, tz: 0, d: 15000, az: 62, el: 28, fov: 36, shift: 80 };
const STOPPED_END = { d: 14300 };
// you at your window, from outside (VIEW.you, under the comment's field)
const WINDOW = { ...P, tx: YOU.at[0], ty: YOU.at[1], tz: YOU.at[2], d: 950, az: 20, el: 6, fov: 32, shift: 40 };
const WINDOW_END = { d: 900 };

/* like — you, closer (never a very close shot: a body of glass) */
const SEAT = { ...VIEW.you, tx: YOU.at[0], ty: YOU.at[1] - 10, tz: YOU.at[2], d: 640, az: -14, el: 4, shift: -90 };
const SEAT_END = { d: 600 };

/* prochain — the RAT whole on the bench, under #next (it ends at y ≈ 860) */
const NEXT = { ...VIEW.whole, ty: 157, d: 3000, shift: -90, side: 80 };
const NEXT_END = { d: 2600, az: -34, shift: -100 };

/* boucle — the night, from POSE0's side, a little further */
const AWAY = { ...POSE0, d: 6000, az: -50 };
const AWAY_MID = { d: 5900 };

/** The plane once it is down: gear out, made (veille), the dawn. */
const DOWN = { alt: 0, gear: 1, runway: 1, made: 1, dawn: 0.9 };

export default function fin({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", nofall: "nofall", verdict: "verdict", cwind: "cwind", cdesc: "cdesc", pilot: "pilot",
    tocta: "tocta", brakesQ: "brakesQ", reversers: "reversers", normal: "normal",
    arrives: "arrives", kmh: "kmh", emergency: "emergency", tires: "tires", stops: "stops",
    nodeath: "nodeath", ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    tolike: "tolike", armrest: "armrest", takeoff: "takeoff", likeEnd: "like$",
    toabo: "toabo", bloc: "bloc", aboEnd: "abo$",
    toloop: "toloop", rewind: "rewind",
  });
  const SPIN = 1.4; // the propeller's turns per second, in the air

  /* ── CHUTE: "Voilà le secret : un avion sans moteur ne tombe pas. Il plane. Et c'est le vent de sa descente… qui lui
     rend de quoi piloter." ── */
  cut(t.toverdict, SET.SKY, GLIDE, {
    ...STAGED, ...RESCUED, alt: 3400, ahead: 0.5, pitch: -3, dawn: 0.6, wind: 0.5, turn: 0, mood: 1,
    fx: -500, fy: -200, fz: 0, fs: 3500,
  });
  const chuteLen = t.tocta - t.toverdict;
  st(t.toverdict, chuteLen, { alt: 2600, ahead: 0.5 - 0.012 * chuteLen, turn: SPIN * chuteLen }, "none");
  
  // in by ratio, from "Il plane" to the RAT: its disc, the streaks through it; there before "rend de quoi piloter"
  const inAt = t.verdict + 0.45;
  const toWing = t.pilot - 0.35;
  shot(t.toverdict, inAt - t.toverdict, { d: 13300, az: -24, el: 9 }, "sine.inOut");
  st(inAt, toWing - inAt, { fx: -850, fy: -360, fz: 120, fs: 700 }, "sine.inOut");
  shot(inAt, toWing - 0.15 - inAt, GLIDE_END, "sine.inOut", 13300);
  shot(toWing - 0.15, 0.15, { d: 1960 }, "none");
  // "piloter": the wing, its aileron answering (the same glide goes on: alt, ahead, turn are untouched by the cut)
  cut(toWing, SET.SKY, AILERON);
  shot(toWing, t.tocta - toWing, AILERON_END, "sine.inOut");
  now(toWing, { fx: 1000, fy: 40, fz: 2300, fs: 900 });
  st(t.cwind, 0.9, { wind: 1 }, "sine.inOut");
  // "piloter": a small answer of the surfaces
  st(t.pilot - 0.12, 0.4, { stick: 1 }, "sine.inOut");
  st(t.pilot + 0.32, 0.46, { stick: -0.8 }, "sine.inOut");
  st(t.pilot + 0.82, 0.28, { stick: 0 }, "sine.inOut");
  retitle(tl, { showAt: t.secret + 0.1, strikeAt: t.nofall, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);
  st(t.verdict, 0.3, { mood: 0 }, "sine.inOut");

  /* ── COMMENTAIRE 1: "Et les freins ? Ni inverseurs, ni freinage normal." — the gear's bay, the brakes hot ── */
  cut(t.tocta, SET.SKY, GEARV, {
    ...STAGED, ...RESCUED, alt: 450, ahead: 0.035, pitch: 1, dawn: 0.8, gear: 1, brakes: 1, runway: 1, made: 1, turn: 0.3, mood: 1,
    fx: GEAR.main[0], fy: -480, fz: GEAR.main[1], fs: 500,
  });
  const ctaLen = t.arrives - t.tocta;
  st(t.tocta, ctaLen, { alt: 300, ahead: 0.02, turn: 0.3 + SPIN * ctaLen }, "none");
  shot(t.tocta, ctaLen, GEARV_END, "sine.inOut");

  /* ── COMMENTAIRE 2: "Il arrive sur la piste à près de 370 kilomètres-heure." — low over the runway ── */
  cut(t.arrives, SET.SKY, FLARE, {
    ...STAGED, ...RESCUED, alt: 300, ahead: 0.02, pitch: 2, dawn: 0.8, gear: 1, brakes: 0.4, runway: 1, made: 1, turn: 0.6, mood: 1,
    fx: -300, fy: -350, fz: 0, fs: 3500,
  });
  const flareLen = t.emergency - t.arrives;
  st(t.arrives, flareLen, { alt: 0, ahead: -0.05, turn: 0.6 + SPIN * flareLen }, "none");
  st(t.arrives, flareLen * 0.7, { pitch: 4 }, "sine.inOut");
  shot(t.arrives, flareLen, FLARE_END, "sine.inOut");
  chip("chip-370", null, 96, 470, t.kmh - 0.1, t.emergency - 0.15);

  /* ── COMMENTAIRE 3: "Freinage de secours. Les pneus lâchent… il s'arrête." — the wheels on the runway ── */
  cut(t.emergency, SET.SKY, WHEELS, {
    ...STAGED, ...RESCUED, ...DOWN, dawn: 0.85, ahead: -0.05, pitch: 0, brakes: 1, turn: 0, whirl: 0.6, mood: 1,
    fx: GEAR.main[0], fy: -520, fz: GEAR.main[1], fs: 450,
  });
  // rolling until the tyres let go (the sparks live while `ahead` > −0.17), then slowing to a stop on "s'arrête"
  st(t.emergency, t.tires - t.emergency, { ahead: -0.15 }, "none");
  st(t.tires, t.stops + 0.3 - t.tires, { ahead: -0.25 }, "power1.out");
  st(t.tires, 0.5, { tires: 1 }, "power2.out");
  shot(t.emergency, t.nodeath - t.emergency, WHEELS_END, "sine.inOut");

  /* ── COMMENTAIRE 4: "Aucun mort." — stopped on the runway, at dawn ── */
  cut(t.nodeath, SET.SKY, STOPPED, {
    ...STAGED, ...RESCUED, ...DOWN, ahead: -0.25, pitch: 0, brakes: 0.3, tires: 1, whirl: 0, turn: 0, mood: 0,
    fx: -300, fy: -582, fz: 0, fs: 4000,
  });
  shot(t.nodeath, t.ask - t.nodeath, STOPPED_END, "none");
  chip("chip-mort", null, 96, 470, t.nodeath + 0.05, t.ask - 0.14);

  /* ── COMMENTAIRE 5: "En commentaire : en avion, tu as peur ?" — you at your window, the dawn outside ── */
  cut(t.ask, SET.SKY, WINDOW, {
    ...STAGED, ...RESCUED, ...DOWN, ahead: -0.25, pitch: 0, tires: 1, whirl: 0, turn: 0, pax: 0.5, mood: 0,
    fx: YOU.at[0], fy: YOU.at[1], fz: YOU.at[2], fs: 500,
  });
  shot(t.ask, t.tolike - t.ask, WINDOW_END, "sine.inOut");
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 6, to: t.tolike - 0.3 });

  /* ── LIKE: "Like : pour celui qui serre l'accoudoir à chaque décollage." — you, closer, your hand ── */
  cut(t.tolike, SET.SKY, SEAT, {
    ...STAGED, ...RESCUED, ...DOWN, ahead: -0.25, pitch: 0, tires: 1, whirl: 0, turn: 0, pax: 0.6, grip: 0, mood: 0,
    fx: YOU.at[0], fy: YOU.at[1], fz: YOU.at[2], fs: 400,
  });
  shot(t.tolike, t.toabo - t.tolike, SEAT_END, "sine.inOut");
  st(t.armrest - 0.1, 0.45, { grip: 1 }, "power2.out");
  st(t.takeoff + 0.2, 0.5, { grip: 0.6 }, "sine.inOut");
  likeCall(tl, { from: t.tolike + 0.12, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} personne${n > 1 ? "s" : ""}` });

  /* ── PROCHAIN DOSSIER: "Prochain dossier : le bloc opératoire. Là, un premier défaut électrique… ne doit rien couper." ──
     the bench, the RAT whole, turning slowly — the voice does not ask to subscribe: the panel does */
  cut(t.toabo, SET.BENCH, NEXT, { ...BENCHED, litProp: 0.5, whirl: 0.4, turn: 0 });
  const nextLen = t.toloop - t.toabo;
  st(t.toabo, nextLen, { turn: 0.9 * nextLen }, "none");
  shot(t.toabo, nextLen, NEXT_END, "sine.inOut", NEXT.d);
  nextFile(tl, { showAt: t.toabo + 0.05, factAt: t.bloc, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE: "Et pas besoin, pour ça, d'être…" — the night, the plane; back to the first frame ── */
  const first = numbers(FIRST);
  cut(t.toloop, FIRST.set, AWAY, { ...first, ahead: FIRST.ahead + 0.02 });
  st(t.toloop, t.rewind - t.toloop, { ahead: FIRST.ahead + 0.016 }, "none");
  shot(t.toloop, t.rewind - t.toloop, AWAY_MID, "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: AWAY_MID.d });
}
