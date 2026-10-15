// DOSSIER 022 — the chute, what the film still owes and the comment, the like, the next file (last), the loop
// (toverdict → the end).
//   chute        the maquette of the pores, shut: the film glazed, the lithium stopped on it, the ember still under it
//                (the header: « Courant : Bloqué » under a thermometer still high). « Le courant » is struck, « La
//                chaleur » lands on its word with the ember swelling and the light turning signal; then the camera
//                closes in on the film for « …c'est un film qui fond ». ONE picture: the title never crosses a cut.
//   commentaire  what the film owes: the room, the pillow holding its heat (« Il garde cette chaleur ») · « pas
//                d'oreiller » the pillow folds off · « pas de couverture » the phone goes alone to the bedside table,
//                in the open, still charging — the camera follows it · « Batterie gonflée ? » it swells under the
//                glass · « débranches » the cable comes out · « éloignes » a cut to the room, wide: the phone goes alone
//                to the bare floor along its veille path; you sleep, no gesture · the question, typed.
//   like         the room as it began, from further: someone falls asleep on it tonight — the heat gathers on « dessus »
//   prochain     the bench, the phone whole and cool under the next file; nothing of the subject comes back after it
//   boucle       the room, a little further than the first frame, on its axis: the camera pushes in to POSE0 — the same
//                push the film opens with. Every number is FIRST's from the cut on.
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, commentCall } from "@kit/blocks.js";
import { SET, BENCHED, STAGED, PORED, POSE0, MICRO, SPOTS } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [MX, MY, MZ] = MICRO.at;
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — the title ends at y ≈ 640 (its shade at 840): the maquette stands under it, the film in the middle */
const CHUTE = { ...P, tx: MX + 1, ty: MY - 0.4, tz: MZ + 1.2, d: 108, az: -54, el: 40, shift: 30 };
const CHUTE_HOLD = { d: 100, az: -50 };
// « …c'est un film qui fond »: the film's face, close (the pores' journal: « le film de près »)
const FILM = { ...P, tx: MX + 1.6, ty: MY, tz: MZ + 1.4, d: 64, az: -44, el: 36, shift: 90, side: 30 };
// the maquette after the closure: every pore shut, the film glazed, the grains stopped on it, the ember under it
const SHUT = { charge: 0, dent: 1, melt: 1, pores: 0, ions: 0.4, spot: 0.7, litFilm: 0 };

/* commentaire — the room (chambre's journal: « la poche », « l'oreiller replié », « sur la table ») */
const POCKET = { ...P, tx: -22, ty: 57, tz: -76, d: 215, az: -63, el: 16, fov: 32, shift: 40, side: 30 };
const FOLDED = { tx: -22, ty: 60, tz: -76, d: 200, az: -60, el: 18, fov: 32, shift: 50, side: 30 };
const [TX, TY, TZ] = SPOTS[1];
// (the camera rides along with the phone as it is carried: it stays near the middle, its arc passes under the header)
const TABLE = { tx: TX, ty: TY + 0.6, tz: TZ, d: 170, az: -42, el: 22, fov: 30, shift: 170, side: 0 };
const TABLE_NEAR = { tx: TX, ty: TY + 0.6, tz: TZ, d: 68, az: -40, el: 26, shift: 160, side: -40 }; // (its port and the pulled cable in the picture)
const L_TABLE = { fx: TX, fy: TY + 1, fz: TZ, fs: 14 };
// « tu l'éloignes »: the room wide, the phone carried to the bare floor, the bed behind
const AWAY = { ...P, tx: -90, ty: 20, tz: 60, d: 900, az: -26, el: 22, fov: 36, shift: -10 };
const L_AWAY = { fx: -80, fy: 30, fz: 30, fs: 300 };

/* like — #net ends at y ≈ 764: you and the pillow under it */
const LIKE = { ...POSE0, d: 360, shift: -40, side: 100, drift: 0.3 };
const LIKE_END = { d: 320 };

/* prochain — #next ends at y ≈ 860: the phone under it, half the width, left of centre */
const ABO = { ...P, tx: 0, ty: 0.6, tz: 0, d: 150, az: -38, el: 24, shift: -60, side: 40 };
const ABO_END = { d: 118, shift: -70 };

/* boucle — the first frame, from a little further on its own axis */
const LOOP = { ...POSE0, d: 300 };

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", notcurrent: "notcurrent", denied: "chute:batterie", verdict: "verdict", holds: "holds", film: "chute:film-0.1", melts: "melts",
    tocta: "tocta", keeps: "keeps", rules: "rules", nopillow: "nopillow", nocover: "nocover",
    toswollen: "toswollen", swollen: "swollen", unplug: "unplug", away: "away", ask: "ask", commentaire: "comment:commentaire", answer: "answer",
    tolike: "tolike", like: "like", onit: "onit",
    toabo: "toabo", engines: "engines",
    toloop: "toloop",
  });

  /* ── CHUTE: « Voilà son secret : ce n'est pas d'abord le courant qui menace ta batterie. C'est la chaleur. » ── */
  cut(t.toverdict, SET.BENCH, CHUTE, { ...BENCHED, ...PORED, ...SHUT, temp: 122, mood: 0 });
  shot(t.toverdict, t.holds - t.toverdict, CHUTE_HOLD, "sine.inOut", CHUTE.d);
  // the thermometer comes down, slowly, and never stops on a figure: the heat has not gone
  st(t.toverdict, t.tocta - t.toverdict, { temp: 108 }, "none");
  retitle(tl, { showAt: t.notcurrent - 0.2, strikeAt: t.denied, swapAt: t.verdict, hideAt: t.holds - 0.3 });
  D.verdict(t.verdict);
  // « C'est la chaleur »: the ember under the film swells, the light turns signal
  st(t.verdict - 0.05, 0.5, { spot: 1 }, "power2.out");
  st(t.verdict - 0.05, 0.35, { mood: 1 }, "power2.out");

  /* « Et ce qui la retient, à la fin… c'est un film qui fond. » — closer, the film's face; it lights on its word */
  shot(t.holds, t.tocta - t.holds, FILM, "sine.inOut", CHUTE_HOLD.d);
  st(t.film, 0.4, { litFilm: 1 }, "power2.out");
  chip("chip-dernier", null, 96, 470, t.holds + 0.3, t.tocta - 0.2);

  /* ── « Et ton oreiller ? Il garde cette chaleur. » — the room: the pocket under the pillow, you asleep ── */
  cut(t.tocta, SET.ROOM, POCKET, { ...STAGED, temp: 41, trapped: 0.55, heat: 0.7 });
  shot(t.tocta, t.nopillow - t.tocta, { d: 172 }, "sine.inOut", POCKET.d);
  st(t.keeps, 0.9, { trapped: 1, heat: 0.85 }, "sine.inOut");
  st(t.tocta, t.nocover - t.tocta, { temp: 44 }, "none");

  /* « Les consignes sont claires : pas d'oreiller, pas de couverture, pendant la charge. » */
  // « pas d'oreiller »: it folds off the phone — the heat rises free
  st(t.nopillow, 0.8, { pillow: 1, cloth: 0.3 }, "sine.inOut");
  st(t.nopillow + 0.2, 0.8, { trapped: 0.2 }, "sine.out");
  shot(t.nopillow, t.nocover - t.nopillow, FOLDED, "sine.inOut");
  // « pas de couverture »: the phone goes alone to the bedside table, in the open, still charging; the camera follows
  const carried = t.nocover + 1.4;
  st(t.nocover, carried - t.nocover, { place: 1, ...L_TABLE }, "sine.inOut");
  shot(t.nocover - 0.05, carried - t.nocover + 0.2, TABLE, "sine.inOut");
  st(t.nocover, 0.35, { mood: 0 }, "power2.inOut");
  st(t.nocover, t.toswollen - t.nocover, { temp: 33, heat: 0.3 }, "sine.out");
  chip("chip-rien", null, 96, 470, t.nocover + 0.9, t.toswollen - 0.15); // (once the phone, carried high, has passed under it)

  /* « Batterie gonflée ? Tu débranches, et tu l'éloignes. » */
  // closer, through the glass: on « gonflée » it swells, on « débranches » the cable comes out
  shot(t.toswollen, t.away - t.toswollen, TABLE_NEAR, "sine.inOut", TABLE.d);
  st(t.toswollen, 0.5, { xray: 0.45 }, "sine.inOut");
  st(t.swollen, 0.7, { swell: 1 }, "power2.out");
  chip("chip-gonflee", null, 96, 470, t.swollen, t.away - 0.15);
  st(t.unplug, 0.45, { plug: 0, charge: 0 }, "power2.inOut");
  // « éloignes »: the room wide — the phone goes alone to the bare floor, its veille path on the ground; you sleep
  cut(t.away, SET.ROOM, AWAY, {
    ...STAGED, pillow: 1, cloth: 0.3, trapped: 0.2, plug: 0, charge: 0, place: 1, temp: 33, heat: 0.3, xray: 0, swell: 1, mood: 0, ...L_AWAY,
  });
  st(t.away + 0.1, 1.6, { place: 2 }, "sine.inOut");
  shot(t.away, t.tolike - t.away, { d: 860 }, "sine.inOut", AWAY.d);

  /* « En commentaire : tu le charges où, la nuit ? » — the same picture, calm */
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer, chars: 13, to: t.tolike - 0.3 });

  /* ── LIKE: « Like : quelqu'un, ce soir, va s'endormir dessus. » — the room as it began ── */
  cut(t.tolike, SET.ROOM, LIKE, { ...STAGED, fs: 200 });
  shot(t.tolike, t.toabo - t.tolike, LIKE_END, "sine.inOut", LIKE.d);
  st(t.onit, 0.9, { trapped: 0.8 }, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.toabo - 0.3, count: 5, label: (n) => (n > 1 ? `${n} personnes` : "1 personne") });

  /* ── PROCHAIN DOSSIER: the bench, the phone whole and cool; the camera closes in under the panel ── */
  cut(t.toabo, SET.BENCH, ABO, { ...BENCHED });
  shot(t.toabo, t.toloop - t.toabo, ABO_END, "sine.inOut", ABO.d);
  nextFile(tl, { showAt: t.toabo + 0.05, factAt: t.engines, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1 });

  /* ── BOUCLE: « Et pendant ce temps, cette nuit… » — the first frame, pushed into ── */
  cut(t.toloop, SET.ROOM, LOOP, { ...STAGED, ...numbers(D.first) });
  D.loop({ at: t.toloop, rewindAt: t.toloop + 0.02, fromD: LOOP.d });
}
