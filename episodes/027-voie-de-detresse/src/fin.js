// La chute, ce que le film doit encore, les appels à l'action — et le prochain dossier en tout dernier (toverdict → end).
//   chute        « Voilà le secret : cette voie n'a aucun frein. » — from high above the stopped truck (the same pit as
//                act 3's last shot, from higher): its ruts from the bed's head, the berm untouched. « Freine » struck on
//                « aucun », « Fait payer » on « payer » (retitle), the account name lights up (D.verdict); on « chacun
//                de tes tours de roue… jusqu'au dernier » the camera comes down along the hero wheel's rut to the wheel,
//                stopped, its wave of gravel in front of it
//   ce qui est dû « Et ton pied ? » — your foot, above the pedal, in the bed (the C of the hook). « Il freinait sans
//                arrêt depuis le haut du col » — back up the col (a flashback: the header reads 50 km/h, pedal 70 %,
//                signal): the truck coming down from the crest, its drums warming up. « En descente, on garde… le
//                rapport de la montée » — from behind and above, veille: the brake lights go out, the drums cool;
//                « par à-coups »: the brake lights blink twice, with the two breaths of air of the sfx
//   commentaire  « toi, en descente… frein, ou moteur ? » — you at the wheel, in the cab, still coming down; the
//                question in two answers (duelCall), each lit on its word: the film never answers for the viewer
//   like         the col at night, from high above: a truck coming down
//   prochain     the valley far below: a window lights up (« chez toi »). The LAST thing the film says: nothing of
//                the lane comes back after it; the voice does not ask to subscribe, the panel does
//   boucle       « Lui aussi attend… le jour où… » — the truck coming down again, from behind, low: `s` runs in a
//                straight line to 0 on the last frame, the camera rides with it and closes in on POSE0
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall } from "@kit/blocks.js";
import { SET, VIEW, STAGED, FIRST, POSE0, RUN, HUB_FL, YOU, rate, frame, road } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: VIEW.sinkL.dof ?? 0 }; // the lens of world.js's close-ups (LOOK.dof)
const [HX, HY, HZ] = HUB_FL;
const [PX, PY, PZ] = YOU.pedal;
const [SX, SY, SZ] = YOU.seat;

/* ── the frames, all [r] (around the truck as it stands on the first frame) unless said ── */
// the chute: high above the stopped truck, behind-left (s = STOP)
const TOP0 = { ...VIEW.top };
const TOP1 = { ...TOP0, d: TOP0.d * 0.95 };
// down around the cab to the hero wheel, stopped in the gravel, from ahead-left: its wave in front (« jusqu'au dernier »)
const RUT = frame([HX - 520, 260, HZ - 520], [HX, 30, HZ + 60], { ...P, ...CLOSE, fov: 30, shift: 60 });
// your foot on the pedal, from outside your door (act 1's frame: the pad clear of the captions) — up the col, pressing
const PEDAL0 = { ...VIEW.pedal, fov: 32, shift: 430 };
const PEDAL1 = { ...PEDAL0, d: PEDAL0.d * 0.93 };
// the top of the col: from the right verge, down the road, looking back up at the truck coming down from the crest
const CREST0 = { ...VIEW.colTop, d: VIEW.colTop.d * 0.72 };
const CREST1 = { ...CREST0, d: CREST0.d * 0.9 };
// from behind and above: the brake lights (they go out, then blink twice), the descent ahead
const REAR0 = frame(road(-200, 900, 4200), road(0, 120, 300), { ...P, fov: 34, shift: 110 });
const REAR1 = { ...REAR0, d: REAR0.d * 0.92 };
// you at the wheel, from the left, through your door: the cab, the wheel, your foot — under the duel panel
const CAB0 = frame([SX - 720, 300, SZ + 260], [SX + 10, 175, SZ - 30], { ...P, fov: 30, shift: -60 });
const CAB1 = { ...CAB0, d: CAB0.d * 0.93 };
// the col at night from high above, a truck coming down (« ça remontera chez un chauffeur qui descend un col »)
// (VIEW.map put the truck under the captions, 8 px high: the same camera, aimed at the truck, closer)
const MAP0 = frame(road(-1500, 5500, 11000), road(0, 150, 600), { ...P, fov: 34, shift: 0 });
const MAP1 = { ...MAP0, d: MAP0.d * 0.95 };
// [0] the valley far below, the house of the next file
const VALLEY0 = { ...VIEW.valley };
const VALLEY1 = { ...VALLEY0, d: VALLEY0.d * 0.94 };

/* ── the light ([r] unless said) ── */
const L_TOP = { fx: 0, fy: 150, fz: 500, fs: 1600 };
const L_RUT = { fx: HX, fy: HY - 20, fz: HZ, fs: 150 };
const L_PEDAL = { fx: PX, fy: PY + 10, fz: PZ, fs: 80 };
const L_TRUCK = { fx: 0, fy: 150, fz: 600, fs: 1100 };
const L_CAB = { fx: SX, fy: 175, fz: SZ, fs: 300 };
const L_MAP = { fx: 0, fy: 150, fz: 600, fs: 2500 };

const COL_KMH = 50; // the flashback's speed (illustrative, like every speed of the header)

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function fin({ D }) {
  const { tl, tw, st, shot, cut } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "secret", strike: "strike", verdict: "verdict", dernier: "dernier",
    tocta: "tocta", freinait: "freinait", descente: "descente", rapport: "rapport", acoups: "acoups", acoupsEnd: "comment:à-coups$",
    ask: "ask", choiceA: "choiceA", choiceB: "choiceB", tolike: "tolike", likeEnd: "like$",
    toabo: "toabo", cheztoi: "cheztoi", gaz: "gaz", aboEnd: "abo$", toloop: "toloop",
  });
  const tEnd = D.tEnd;
  const W = 0.1; // the cues of words fall 0.1 s before the word

  /* ══════════ CHUTE — the stopped truck from high above, then down along the rut to the wheel ══════════ */
  const BED_STATE = { ...STAGED, s: RUN.stop, kmh: 0, pedal: 0, steer: 0, sink: 1, heat: 0.7, danger: 0.3, laneLit: 0.6, mood: 0 };
  cut(t.toverdict, SET.SCENE, TOP0, { ...BED_STATE, ...L_TOP });
  const down = t.strike + 0.3; // once « Freine » is struck, the camera starts down (slowly: sine)
  shot(t.toverdict, span(t.toverdict, down), TOP1, "sine.inOut");
  shot(down, span(down, t.tocta), RUT, "sine.inOut", TOP1.d);
  st(down, span(down, t.tocta), L_RUT, "sine.inOut");
  retitle(tl, { showAt: t.secret + W, strikeAt: t.strike, swapAt: t.verdict, hideAt: t.tocta - 0.42 });
  D.verdict(t.verdict);

  /* ══════════ CE QUI EST DÛ — « Et ton pied ? » : the answer is already in the picture — back up the col, your foot
     pressing the pedal (the header: 50 km/h, pedal 70 %, signal). From here to the like the truck runs again ══════════ */
  const v = rate(COL_KMH);
  const COL_STATE = { ...STAGED, kmh: COL_KMH, steer: 0, sink: 0, laneLit: 0.35, danger: 0.6 };
  const sAt = (time) => RUN.top + v * (time - t.freinait); // at the crest (RUN.top) on « Il freinait »
  cut(t.tocta, SET.SCENE, PEDAL0, { ...COL_STATE, s: sAt(t.tocta), pedal: 0.7, heat: 0.3, mood: 1, ...L_PEDAL });
  st(t.tocta, span(t.tocta, t.tolike), { s: sAt(t.tolike) }, "none");
  shot(t.tocta, span(t.tocta, t.freinait), PEDAL1, "sine.inOut");

  // « Il freinait sans arrêt depuis le haut du col. » — the truck coming down from the crest, its drums warming up
  cut(t.freinait, SET.SCENE, CREST0, { ...L_TRUCK });
  shot(t.freinait, span(t.freinait, t.descente), CREST1, "sine.inOut");
  st(t.freinait + 0.15, span(t.freinait + 0.15, t.descente - 0.1), { heat: 0.9 }, "sine.inOut");

  // « En descente, on garde en général le rapport de la montée, » — from behind, veille: the brake lights go out
  cut(t.descente, SET.SCENE, REAR0, { mood: 0, ...L_TRUCK });
  shot(t.descente, span(t.descente, t.ask), REAR1, "sine.inOut");
  st(t.rapport, 0.25, { pedal: 0 }, "power2.out");
  st(t.rapport + 0.1, span(t.rapport + 0.1, t.acoups), { heat: 0.3 }, "sine.inOut");
  // « …et on freine par à-coups. » — two short blinks of the brake lights, with the two breaths of air (sfx hiss)
  const a1 = t.acoupsEnd + 0.03;
  const a2 = t.acoupsEnd + 0.25;
  st(a1, 0.05, { pedal: 0.7 }, "power2.out");
  st(a1 + 0.09, 0.06, { pedal: 0 }, "power2.in");
  st(a2, 0.05, { pedal: 0.7 }, "power2.out");
  st(a2 + 0.09, 0.06, { pedal: 0 }, "power2.in");

  /* ══════════ COMMENTAIRE — you at the wheel, coming down; the question in two answers ══════════ */
  cut(t.ask, SET.SCENE, CAB0, { pedal: 0, ...L_CAB });
  shot(t.ask, span(t.ask, t.tolike), CAB1, "sine.inOut");
  duelCall(tl, { from: t.ask, aAt: t.choiceA, bAt: t.choiceB, to: t.tolike - 0.3, toneA: "signal", toneB: "veille" });

  /* ══════════ LIKE — the col at night, from high above ══════════ */
  cut(t.tolike, SET.SCENE, MAP0, { ...COL_STATE, s: sAt(t.tolike), pedal: 0, heat: 0.3, mood: 0, ...L_MAP });
  st(t.tolike, span(t.tolike, t.toabo), { s: sAt(t.toabo) }, "none");
  shot(t.tolike, span(t.tolike, t.toabo), MAP1, "sine.inOut");
  likeCall(tl, { from: t.tolike + 0.12, to: t.likeEnd + 0.12, count: 5, label: (n) => `${n} chauffeur${n > 1 ? "s" : ""}` });

  /* ══════════ PROCHAIN DOSSIER — the valley far below, a window lights up ══════════ */
  const [HMX, HMY, HMZ] = [VALLEY0.tx, VALLEY0.ty, VALLEY0.tz];
  cut(t.toabo, SET.SCENE, VALLEY0, { ...COL_STATE, ride: 0, s: sAt(t.toabo), pedal: 0, heat: 0.3, mood: 0, home: 0, fx: HMX, fy: HMY, fz: HMZ, fs: 9000 });
  shot(t.toabo, span(t.toabo, t.toloop), VALLEY1, "sine.inOut", VALLEY0.d);
  st(t.cheztoi + W, 0.6, { home: 1 }, "power2.out");
  nextFile(tl, { showAt: t.toabo + 0.06, factAt: t.gaz, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ══════════ BOUCLE — « Lui aussi attend… le jour où… » : the truck coming down again; the last frame is the first ══════════ */
  // `s` keeps coming in a straight line at the first frame's speed until 0 on tEnd; the camera rides with the truck and
  // closes in on POSE0 in one move. D.loop glides every number left away back to FIRST from `rewindAt`: the second
  // straight run of `s` starts a millisecond after it, so it is drawn after it and wins (as in 025) — fromTo, so that a
  // jump in time cannot shift its start.
  const v0 = rate(FIRST.kmh);
  const sLoop = (time) => FIRST.s - v0 * (tEnd - time);
  const fromD = POSE0.d * 1.12;
  const rewindAt = t.toloop + 0.04;
  const r1 = rewindAt + 0.001;
  cut(t.toloop, SET.SCENE, { ...POSE0, d: fromD }, { ...FIRST, s: sLoop(t.toloop) });
  tw.fromTo(D.S, { s: sLoop(t.toloop) }, { s: sLoop(r1), duration: r1 - t.toloop, ease: "none", immediateRender: false }, t.toloop);
  tw.fromTo(D.S, { s: sLoop(r1) }, { s: FIRST.s, duration: tEnd - r1, ease: "none", immediateRender: false }, r1);
  D.loop({ at: t.toloop, rewindAt, fromD });
}
