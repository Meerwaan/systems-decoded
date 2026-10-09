// DOSSIER 015 — the chute, the three calls to action, the loop (toverdict → the end).
//   chute        ONE slow move on the deck, under the title. The aircraft STOPPED at the end of its run, from its port
//                quarter, low: nozzles still hard, nose down, legs squashed — "Tu freines" is struck on "freines" ·
//                "prêt à redécoller": it strains harder · the camera goes round behind it and up, and the wire's long V
//                comes out of the bottom of the picture to its hook: on "câble" the wire brightens — "On te retient"
//   like         from astern and above: the whole wire, its bight wound back across the strip ("remettent ce câble
//                en place") and, through the deck, the ram going home · a cut on "ici": the deck hands at the wire's
//                starboard end, the wire lit, ready — "un avion par minute"
//   abonnement   the bench, the system whole under the next file; the camera closes on it
//   commentaire  the hook's "ou s'il casse" is paid. The same move goes on, down to the valve's wheel: on "mal réglé"
//                it turns past its mark and goes signal · a cut on "le câble": the deck, no aircraft, the wire pulled
//                taut — it parts on "casse" (a light that has a place), its two ends whip back and the camera backs
//                away with them · "L'avion, lui…": the camera lifts to the end of the deck — a light climbs away over
//                the sea, and the question is asked over that picture
//   boucle       the next aircraft is coming: the first frame's own picture, from a little farther, the camera riding
//                with the aircraft while the deck runs in under it and the wire, lit, lies in place ahead. The last
//                frame IS the instant of the first: pos, alt and the clock run straight into it, at the speed and the
//                sink rate act 1 leaves with — no stop at the seam.
// (Poses placed by projection — against the title, the panels, the chevrons and the captions — then looked at.)
import { retitle, nextFile, commentCall } from "@kit/blocks.js";
import { likeNet, rail } from "@kit/overlay.js";
import { SET, BENCHED, STAGED, SYSTEM, RUNOUT } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const numbers = (state) => Object.fromEntries(Object.entries(state).filter(([k, v]) => typeof v === "number" && k !== "set"));

/* chute — the title's line ends at y ≈ 610, its shade at 840: everything that matters lies under it */
const Z = -100 * RUNOUT; // where the hook's tip is, stopped
// stopped: the story's last word on the header, the wire run out, the ram home
const STOPPED = { pos: RUNOUT, alt: 0, held: 1, pull: RUNOUT, ram: 1, sec: 2.9, kmh: 0, mood: 0 };
// from its port quarter, low: the two nozzles, the hook under them, the wing (aircraft x 71…876, y 718…1168)
const HELD_BACK = { ...P, tx: 0, ty: 150, tz: Z - 150, d: 3800, az: -24, el: 8, fov: 34, shift: -75 };
// from behind and above, inside the wire's V: its two legs run from the hook (y ≈ 1000) down to the bottom corners
// (aircraft x 233…774, y 724…1000)
const THE_WIRE = { ...P, tx: 0, ty: 60, tz: Z + 500, d: 5600, az: -5, el: 19, fov: 34, shift: -100 };

/* like — #net ends at y ≈ 761 */
// 1 · from astern and above, to port: the whole wire across the strip (x 127…907), its bight (apex y ≈ 815), the
//     two other wires and, through the deck, the brake it pulls (x 266…783, y 1098…1235: clear of the captions)
const REWOUND = { ...P, tx: 0, ty: -150, tz: -250, d: 8600, az: -20, el: 30, fov: 34, shift: -55, side: 40 };
const REWOUND_END = { d: 8200, az: -18 };
// 2 · from port, low, along the wire: its starboard sheave (x ≈ 250, y 1177), the deck hands standing behind it
//     (y 900…1090: they only hold from this far)
const HANDS = { ...P, tx: 1530, ty: 90, tz: 190, d: 3100, az: -80, el: 6, fov: 34, shift: -75 };
const HANDS_END = { d: 2950, az: -78 };
const BIGHT = 12; // metres of wire still out when the picture opens

/* abonnement · commentaire, on the bench (the system stands at SYSTEM.bench) — #next ends at y ≈ 840 */
const [BX, BY, BZ] = SYSTEM.bench;
// the system whole, broadside: the wire on top, the brake under it (x 60…820, y 890…1230; the chevrons stand right of it)
const WHOLE = { ...P, tx: BX, ty: BY - 290, tz: BZ, d: 11800, az: -30, el: 12, shift: -90, side: 80 };
const WHOLE_END = { ...WHOLE, d: 10400 };
// the valve's wheel (the model's own framing of it)
const WHEEL = [BX - 258, BY - 364, BZ + 58];
// (seen from higher, el 40, a run of the tackle crosses in front of the valve: el 22 is the model's own framing)
const DIAL = { ...P, tx: WHEEL[0], ty: WHEEL[1], tz: WHEEL[2], d: 640, az: -38, el: 22, shift: 30 };

/* commentaire, on the deck */
// the wire pulled taut by an aircraft that is not shown (2016 was neither this aircraft nor this ship): its bight,
// from astern (bight x 529, y 902; its legs come down toward the bottom corners)
const TAUT = { ...P, tx: 0, ty: 60, tz: -560, d: 2300, az: -10, el: 13, shift: 120 };
// the same, from a little farther: the two ends whipping back, in the picture until they come to rest at its edges
const PARTED = { ...TAUT, d: 3300 };
// from where PARTED stands, the camera lifted to the end of the deck: the horizon at y ≈ 1044, the deck's edge at 1264,
// the light climbing from (618, 1103) to (515, 700)
const GONE = { ...P, tx: -534.5, ty: 926, tz: -691, d: 3300, az: -0.41, el: -2.15, shift: 60 };

/* boucle */
// metres of deck a second on the first frame: act 1 opens on a rush that dies (acte1.js: RUSH / TAU + SLOW — if act 1
// changes them, change this: it is the one number of the seam that cannot be read by name)
const SPEED = 5.8;
const WIDER = 1.3; // the picture opens this many times farther than the first frame, on the same line of sight

/* the header: stopped, the clock is the system's verdict (act 3 turns it veille on "arrêté", ink again for the bolter) */
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";

export default function fin({ D, world }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", idea: "chute:sur-0.1", noland: "noland", again: "again", cable: "chute:câble-0.1", verdict: "verdict",
    tocta: "tocta", like: "like", crew: "crew", here: "like:ici-0.1", upto: "like:jusqu-0.05", likeEnd: "like$",
    toabo: "toabo", abo: "abo", next: "next", nocut: "abo:coupe-0.3", aboEnd: "abo$",
    tocomment: "tocomment", y2016: "y2016", onDial: "comment:frein-0.3", bad: "comment:mal-0.05", misset: "misset",
    tobreak: "comment:câble-0.14", parts: "parts", hurt: "hurt", plane: "comment:l'avion-0.1", him: "comment:lui-0.12", away: "away",
    ask: "ask", commentaire: "comment:commentaire", answer: "answer", toloop: "toloop", rewind: "rewind",
  });

  /* ── CHUTE: "Voilà le secret : sur un porte-avions, tu ne freines pas." — stopped, and still at full power ── */
  cut(t.toverdict, SET.DECK, HELD_BACK, { ...STAGED, ...STOPPED, nose: -0.6, squat: 0.45, gas: 1, tense: 0.6, heat: 0.8, fx: 0, fy: 150, fz: Z - 400, fs: 1000 });
  const round = t.verdict + 0.2 - t.toverdict;
  shot(t.toverdict, round, THE_WIRE);
  st(t.toverdict, round, { fs: 1500 }, "sine.inOut");
  retitle(tl, { showAt: t.idea, strikeAt: t.noland + 0.2, swapAt: t.verdict, hideAt: t.tocta - 0.27 });
  // "Tu es prêt à redécoller…" — it pulls on its wire: the nose goes down, the legs give
  st(t.again, 0.5, { nose: -1.8, squat: 0.8 }, "power2.out");
  // "…et c'est un câble qui te retient." — the wire, brighter on the word; the account name lights up
  st(t.cable, 0.3, { tense: 1 }, "power2.out");
  D.verdict(t.verdict);
  tl.set("#hud-clock", { color: VEILLE }, t.toverdict);

  /* ── LIKE 1: "Like. Pour ceux qui remettent ce câble en place :" — the bight wound back across the strip ── */
  const toHands = t.here - 0.02;
  cut(t.tocta, SET.DECK, REWOUND, { ...STAGED, jet: 0, you: 0, crew: 1, held: 1, pull: BIGHT, ram: BIGHT / RUNOUT, tense: 0.8, sec: 2.9, kmh: 0, mood: 0, fx: 0, fy: -100, fz: -200, fs: 2500 });
  shot(t.tocta, toHands - t.tocta, REWOUND_END);
  likeNet(tl, { showAt: t.like - 0.1, hideAt: toHands - 0.35, hits: Array.from({ length: 5 }, (_, i) => [i + 1, t.like + 0.1 + i * 0.26]), label: (n) => `${n} personnes` });
  rail(tl, "rail-like", t.like, toHands - 0.3);
  // "…qui remettent ce câble en place": the bight comes back to its place, the ram with it; home, the wire slackens
  const wound = 1.25;
  st(t.crew, wound, { pull: 0, ram: 0 }, "power2.inOut");
  st(t.crew + 0.6 * wound, 0.4 * wound, { tense: 0 }, "sine.inOut");
  st(t.crew + wound, 0.18, { held: 0 }, "sine.inOut");

  /* ── LIKE 2: "ici, il se pose jusqu'à un avion par minute." — the deck hands at the wire, ready again ── */
  cut(toHands, SET.DECK, HANDS, { ...STAGED, jet: 0, you: 0, crew: 1, tense: 0, litBrin: 0.3, sec: 2.9, kmh: 0, mood: 0, fx: 1500, fy: 60, fz: 100, fs: 800 });
  shot(toHands, t.toabo - 0.05 - toHands, HANDS_END);
  st(toHands, 0.5, { litBrin: 1 }, "power2.out");
  chip("chip-minute", null, 96, 470, t.upto, t.toabo - 0.15);

  /* ── ABONNEMENT: "Abonne-toi. Prochain dossier : ton disjoncteur…" — the bench, the system whole ── */
  cut(t.toabo, SET.BENCH, WHOLE, { ...BENCHED });
  shot(t.toabo, t.tocomment - t.toabo, WHOLE_END);
  nextFile(tl, { showAt: t.next, factAt: t.nocut, hideAt: t.tocomment - 0.32, railFrom: t.abo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── COMMENTAIRE 1: "Et s'il casse ? Mars 2016, un porte-avions américain : frein mal réglé," — down to the wheel ── */
  const dive = t.onDial - t.tocomment;
  shot(t.tocomment, dive, DIAL, "sine.inOut", WHOLE_END.d);
  st(t.tocomment, dive, { fx: WHEEL[0], fy: WHEEL[1], fz: WHEEL[2], fs: 400, pool: 0.05 }, "sine.inOut");
  st(t.tocomment + 0.4 * dive, 0.6 * dive, { litValve: 1 }, "sine.inOut");
  chip("chip-2016", null, 96, 470, t.y2016, t.tobreak - 0.16);
  // "…mal réglé": the wheel turns past its mark, and shows it
  st(t.bad, 0.38, { dial: 0.82 }, "power2.out");
  st(t.misset, 0.22, { wrong: 1 }, "power2.out");

  /* ── COMMENTAIRE 2: "le câble casse. Huit marins blessés." — the deck, no aircraft: the wire taut, then parted ── */
  const snap = t.parts + 0.06;
  cut(t.tobreak, SET.DECK, TAUT, { ...STAGED, jet: 0, you: 0, held: 1, pull: 5.5, ram: 0.06, tense: 1, dial: 0.82, wrong: 1, sec: 2.9, kmh: 0, mood: 1, fx: 0, fy: 30, fz: -500, fs: 500 });
  st(t.tobreak, snap - t.tobreak, { pull: 6 }, "none");
  // "casse": a ball of light where it lets go, and the two ends whip back toward their sheaves — in slow motion, like
  // the rest of the film: they are still in the air, and in the picture, through "Huit marins blessés" (parted ≈ 0.8
  // when the camera lifts) and come to rest out of it
  st(snap, 4.5, { parted: 1 }, "power2.out");
  st(snap, 0.3, { tense: 0 }, "power2.out");
  shot(snap + 0.05, 1.7, PARTED, "sine.inOut", TAUT.d);
  st(snap + 0.05, 1.7, { fs: 800 }, "sine.inOut");
  chip("chip-casse", null, 96, 470, t.hurt, t.him);

  /* ── COMMENTAIRE 3: "L'avion, lui… est reparti. En commentaire : toi, tu le tentes ?" — the end of the deck ── */
  shot(t.plane, t.away + 0.25 - t.plane, GONE);
  st(t.away, 0.15, { away: 0.06 }, "none");
  st(t.away + 0.15, t.toloop - t.away - 0.15, { away: 0.75 }, "none");
  st(t.away, 0.3, { mood: 0 }, "sine.inOut");
  // (it follows the light, under the question: the top slot is the question's)
  chip("chip-reparti", world.carrier.A.away, 44, -34, t.away + 0.25, t.toloop - 0.3);
  commentCall(tl, { from: t.ask, word: t.commentaire, typedAt: t.answer + 0.08, chars: 3, to: t.toloop - 0.29 });

  /* ── BOUCLE: "Le brin revient en place. Et déjà…" — the next one is coming ── */
  // Everything is written here, to the first frame's own numbers (D.first, D.pose0), and ends on D.tEnd. The picture
  // is the first frame's, carried back with the aircraft — wherever act 1 puts its camera, in front of it or behind
  // its tail — and from a little farther: the camera rides with the aircraft and closes in, the deck runs under them,
  // straight into the first frame (act 1 goes on from there: the same speed, the same sink rate, the same clock).
  const first = numbers(D.first);
  const p0 = D.pose0;
  const back = D.tEnd - t.toloop;
  const lead = SPEED * back; //                         metres astern of the first frame's place
  const high = (first.alt / D.at("touch")) * back; //   metres above it: it comes down at a steady rate, to "touchent"
  const early = (first.sec / first.pos) * lead; //      seconds of the story before it: the clock runs with the aircraft
  const COMING = { ...p0, d: p0.d * WIDER, ty: p0.ty + 100 * high, tz: p0.tz + 100 * lead };
  // (the hook's shoe is still in the air: no sparks until it reaches the deck, just before the first frame)
  cut(t.toloop, D.first.set, COMING, { ...STAGED, ...first, pos: first.pos - lead, alt: first.alt + high, sec: first.sec - early, fy: first.fy + 100 * high, fz: first.fz + 100 * lead, scrape: 0, litBrin: 1 });
  st(t.toloop, back, { pos: first.pos, alt: first.alt, sec: first.sec, fy: first.fy, fz: first.fz }, "none");
  shot(t.toloop, back, p0, "none");
  st(D.tEnd - 0.3, 0.3, { scrape: first.scrape }, "power2.out");
  // "…en place": the wire's light goes back to what the first frame shows
  st(t.rewind - 0.4, D.tEnd - t.rewind + 0.4, { litBrin: first.litBrin }, "sine.inOut");
  tl.set("#hud-clock", { color: INK }, t.toloop);
  D.loop({ at: t.toloop, rewindAt: D.tEnd });
}
