// 03 · RÉPONSE — from « Sans ce fil, ta main touche le capot » to « Il coupe… avant ta main » (tozero → toverdict).
// In cuts, one shot per breath. The same scene twice: WITHOUT the wire, then replayed WITH it.
// Every cut is laid a few frames before its sentence; its pose is complete and so is its state ({ ...STAGED, … }):
// nothing is inherited from the act before, nothing from the shot before.
//
// THE PHYSICS, for an audience of electricians:
//   · without the earth, the casing is at 230 volts and NO current flows until a body is the path. The instant your
//     palm lands, the current runs through you (`body`), the differential sees it and trips — AFTER you. When it trips
//     the current stops at once (body drops to its dotted trace, the casing goes dead, the machine winds down);
//   · with the earth, the fault itself makes the current leave by the PE the instant it appears: the fault comes
//     (`fault`, `live`), and with it the veille head runs the whole chain to the loop (`leak`) — nobody has to touch.
//     The differential sees the difference and trips on THAT current: the casing is dead before your hand arrives.
//     The current does not vanish: it goes into the ground (rings under the floor). When it trips, it stops at once.
// The header follows the state (main.js): « 230 VOLTS » → « 0 VOLT » at the first trip; in the replay « 0 VOLT » →
// « VERS LA TERRE » with the fault → « 0 VOLT » at the second trip. The release (`mood` 1 → 0) is on « avant ».
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, SOCKET, TABLEAU, PLACE } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* ── the poses (VIEW, as the sets' journals saw them; what lies between is arithmetic) ── */
// your arm going to the lid: the lid, the hand, the arm, your shoulder — the frame act 2 ends on
const REACH0 = { ...VIEW.reach };
// …which backs off a little and turns toward the front: the lid, the hand, the arm — less of your trunk
const REACH1 = { ...P, tx: 22, ty: 92, tz: 44, d: 330, az: -40, el: 11, shift: 70 };
// the hand at the end, from the front-left: the lid dead, the drum winding down, your hand still above the lid
const HAND0 = { ...P, tx: 18, ty: 95, tz: 44, d: 300, az: -30, el: 4, shift: 60 }; // low: the gap under the palm shows
const HAND1 = { ...HAND0, d: 312 };
// you whole by the machine: the machine, you, the puddle
const YOU0 = { ...VIEW.you };
const YOU1 = { ...YOU0, d: 395 };
// your feet in the puddle, the machine's foot: the rings leave your soles
const FEET0 = { ...VIEW.feet };
const FEET1 = { ...FEET0, d: 160 };
// the consumer unit, close: the differential, its handle
const TAB0 = { ...P, tx: -182, ty: 158, tz: 4, d: 95, az: -22, el: 4, shift: 0, dof: VIEW.tableau.dof };
const TAB1 = { ...TAB0, d: 88 };
// the same unit in the replay: the green-and-yellow now comes down past the differential to its terminal — sharp, so
// that it reads as a wire arriving and not as a blur across the picture
const TAB2 = { ...TAB0, dof: 0 };
const TAB3 = { ...TAB1, dof: 0 };
// after you: the same place as « par toi », a step back — the machine winding down, your body's trace
const AFTER0 = { ...VIEW.you, d: 400 };
const AFTER1 = { ...VIEW.you, d: 430 };
// the replay: the socket and its pin, close — then back, by ratio, as the chain grows up the wall to the unit
const [SX, SY] = SOCKET.at;
const SOCK0 = { ...P, tx: SX + 4, ty: SY + 8, tz: 2, d: 150, az: -26, el: 8, shift: 120 };
// the whole run in one frame: the unit, the green-and-yellow up the wall and along under the ceiling, the socket, the
// earthing conductor down to the floor, the machine at the right with you
const WALL = { ...P, tx: -80, ty: 105, tz: 0, d: 900, az: -18, el: 5, fov: 34, shift: 120 };
const WALL1 = { ...WALL, d: 870 };
// under the floor: the earthing conductor coming down the footing into the loop, the ground around it
const [JX, JY, JZ] = PLACE.join;
const UNDER0 = { ...P, tx: JX - 20, ty: JY + 30, tz: JZ + 20, d: 380, az: -42, el: 10, shift: 60 };
const UNDER1 = { ...UNDER0, d: 360 };

/* ── the light: what it stands around, and how wide ── */
const L = (x, y, z, fs) => ({ fx: x, fy: y, fz: z, fs });
const L_REACH = L(30, 90, 44, 90);
const L_YOU = L(40, 88, 48, 250);
const L_FEET = L(64, 16, 54, 90);
const L_TAB = L(PLACE.diff[0], PLACE.diff[1] - 2, PLACE.diff[2], 40);
const L_SOCK = L(SX, SY, 4, 60);
const L_WALL = L(-100, 110, 0, 450);
const L_UNDER = L(JX, JY + 20, JZ, 140);

// the replay's house: STAGED without your hand — one tween carries it from the rewind to « main », across the cuts
const { reach: _reach, ...REPLAY } = STAGED;

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    tozero: "tozero", ztouche: "ztouche", zcapotEnd: "zero:capot$", zcourant: "zcourant", zpar: "zpar",
    jusqu: "zero:jusqu'au", zsol: "zsol", todiff: "todiff", coupe1: "coupe1", coupe1End: "reponse:coupe$", apres: "apres",
    trigger: "trigger", rejoue: "reponse:rejoue", avecfil: "avecfil", fileLe: "reponse:courant", file: "file",
    dans: "reponse:dans", rterre: "rterre", rterreEnd: "reponse:terre$", rtableau: "rtableau", voit: "voit",
    coupe2: "coupe2", coupe2End: "reponse:coupe#2$", avant: "avant", rmain: "rmain", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the clock or on « Carcasse ». */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* ══════════ WITHOUT THE WIRE ══════════ */

  /* ───────────── « Sans ce fil, ta main touche le capot. » ───────────── */
  // the frame act 2 leaves: your hand above the live lid. On « touche » the palm lands — and in the same instant the
  // current runs through you (no head ran before: without the earth, nothing flows until a body is the path)
  cut(t.tozero, SET.SCENE, REACH0, { ...STAGED, reach: 1, ...L_REACH });
  shot(t.tozero, span(t.tozero, t.zcourant), REACH1, "sine.out", REACH0.d);
  st(t.ztouche, 0.15, { touch: 1 }, "power2.in");
  st(t.ztouche + 0.13, 0.2, { body: 1 }, "power2.out");

  /* ───────────── « Le courant passe par toi… jusqu'au sol. » ───────────── */
  // you whole: the heads run from your hand down your arm, your trunk, your legs. Then your feet: the rings leave
  // your soles into the puddle
  const toYou = t.zcapotEnd + 0.22;
  cut(toYou, SET.SCENE, YOU0, { ...STAGED, reach: 1, touch: 1, body: 1, ...L_YOU });
  shot(toYou, span(toYou, t.jusqu - 0.12), YOU1, "sine.inOut", YOU0.d);
  D.punch(t.zpar, 0.05);
  const toFeet = t.jusqu - 0.12;
  cut(toFeet, SET.SCENE, FEET0, { ...STAGED, reach: 1, touch: 1, body: 1, ...L_FEET });
  shot(toFeet, span(toFeet, t.todiff), FEET1, "sine.out", FEET0.d);

  /* ───────────── « Ton différentiel coupe. » ───────────── */
  // the unit: the differential sees the current that left by you — it lights; on « coupe » its handle falls. The
  // current stops at once: what ran through you is only a trace now, the casing is dead, the machine winds down
  cut(t.todiff, SET.SCENE, TAB0, { ...STAGED, reach: 1, touch: 1, body: 1, ddr: 0.6, ...L_TAB });
  shot(t.todiff, span(t.todiff, t.apres), TAB1, "sine.out", TAB0.d);
  st(t.todiff + 0.1, 0.3, { ddr: 1 }, "sine.out");
  st(t.coupe1, 0.12, { trip: 1 }, "power2.in");
  now(t.coupe1 + 0.1, { body: 0.28, live: 0, fault: 0 });
  st(t.coupe1 + 0.2, span(t.coupe1 + 0.2, t.trigger - 0.06), { spin: 0 }, "sine.inOut"); // ends before the replay's cut
  beat("#hud-count", t.coupe1 + 0.12, 1.18);

  /* ───────────── « Après toi. » ───────────── */
  // you again, a step back: the casing dark, the machine winding down — and in your body, the trace of where the
  // current went. It came AFTER you
  const toAfter = t.coupe1End + 0.14;
  cut(toAfter, SET.SCENE, AFTER0, { ...STAGED, reach: 1, touch: 1, body: 0.28, live: 0, fault: 0, ddr: 1, trip: 1, ...L_YOU });
  shot(toAfter, span(toAfter, t.trigger), AFTER1, "sine.out", AFTER0.d);
  D.punch(t.apres, 0.05);

  /* ══════════ WITH THE WIRE ══════════ */

  /* ───────────── « On rejoue, avec le fil. » ───────────── */
  // the clock rewinds (main.js). The same evening, a second before your hand: the machine spinning, nothing live yet —
  // and this time the socket has its pin. From it the chain grows up the wall to the unit and down to the earth; the
  // camera backs away with it
  cut(t.trigger, SET.SCENE, SOCK0, { ...STAGED, live: 0, fault: 0, chain: 0, pin: 1, reach: 0.4, pe: 0.35, ...L_SOCK }, { fade: 0.2, kind: "dip" });
  const back = span(t.trigger + 0.1, t.fileLe);
  shot(t.trigger + 0.1, back, WALL, "sine.inOut", SOCK0.d);
  st(t.trigger + 0.1, back, L_WALL, "sine.inOut");
  st(t.rejoue, span(t.rejoue, t.avecfil + 0.3), { chain: 1 }, "sine.inOut");
  st(t.avecfil - 0.05, 0.4, { pe: 0.6 }, "sine.out"); // lit, but below the leak's heads, which must stand out
  st(t.trigger + 0.02, span(t.trigger + 0.02, t.rmain), { reach: 0.66 }, "sine.inOut"); // your hand is still on its way: well above the lid at « main »

  /* ───────────── « Le courant file dans la terre. » ───────────── */
  // the fault comes: the casing goes live — and the current already leaves by the green-and-yellow conductor, the
  // wall, the terminal, the earthing conductor. Under the floor: into the loop, and the rings leave it into the ground
  shot(t.fileLe, span(t.fileLe, t.dans), WALL1, "sine.inOut");
  st(t.fileLe - 0.04, 0.2, { fault: 1 }, "power2.out");
  st(t.fileLe - 0.04, 0.55, { live: 1 }, "sine.in");
  st(t.fileLe - 0.02, span(t.fileLe - 0.02, t.dans + 0.06), { leak: 0.66 }, "power1.out");
  const toUnder = t.dans + 0.06;
  cut(toUnder, SET.SCENE, UNDER0, { ...REPLAY, under: 1, chain: 1, pin: 1, live: 1, fault: 1, leak: 0.66, pe: 0.6, ...L_UNDER });
  shot(toUnder, span(toUnder, t.rtableau), UNDER1, "sine.out", UNDER0.d);
  st(toUnder, span(toUnder, t.rterre + 0.12), { leak: 1 }, "sine.out");

  /* ───────────── « Le tableau le voit. » ───────────── */
  // the unit: the differential sees the difference — it lights on « voit »
  const toTab = t.rterreEnd + 0.22;
  cut(toTab, SET.SCENE, TAB2, { ...REPLAY, chain: 1, pin: 1, live: 1, fault: 1, leak: 1, pe: 0.6, ddr: 0, ...L_TAB });
  shot(toTab, span(toTab, t.avant - 0.16), TAB3, "sine.out", TAB2.d);
  st(t.voit, 0.3, { ddr: 1 }, "sine.out");

  /* ───────────── « Il coupe… avant ta main. » ───────────── */
  // on « coupe » the handle falls; the current stops at once, the casing is dead. Your hand: still above the lid,
  // it never touched. The release is on « avant »
  st(t.coupe2, 0.12, { trip: 1 }, "power2.in");
  now(t.coupe2 + 0.1, { leak: 0, live: 0, fault: 0 });
  beat("#hud-count", t.coupe2 + 0.12, 1.18);
  const toHand = t.avant - 0.16;
  cut(toHand, SET.SCENE, HAND0, { ...REPLAY, chain: 1, pin: 1, live: 0, fault: 0, leak: 0, pe: 0.6, ddr: 1, trip: 1, ...L_REACH });
  shot(toHand, span(toHand, t.toverdict), HAND1, "sine.inOut", HAND0.d);
  st(toHand + 0.02, span(toHand + 0.02, t.toverdict), { spin: 0 }, "sine.inOut"); // the machine winds down (never close on the drum)
  st(t.avant, 0.35, { mood: 0 }, "sine.inOut");
  D.punch(t.avant, 0.05);
  beat("#hud-clock", t.avant + 0.05, 1.16);
}
