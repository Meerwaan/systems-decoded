// 02 → 03 · REPOS then ZÉRO and RÉPONSE — from « Ton siège roule seul » (torepos) to « On l'isole, pour contrôle »
// (toverdict). Every cut is laid a few frames before its sentence, its pose complete and its state complete
// ({ ...HERE, … }, built on STAGED): nothing is inherited from act 2, nothing from the shot before.
//
// THE CHAIR'S MOTION IS WRITTEN ONCE (chairX below) and every pose that rides the hero grip reads it: at the quay
// your chair rolls at a walking pace (≈ 1 m/s, 3,6 km/h in the header); on « accélèrent » its plate meets the
// launching tyres and it gathers speed (a ramp that leaves at the quay's speed and arrives near the cable's) until it
// reaches the end of the came. From there THE FILM GOES INTO SLOW MOTION, on a cut: the cable, the chair, the tyres,
// the other chairs all run at a tenth of their speed while the came lets go, the spring closes the grip — badly —
// and the weighing reads it. The header keeps the true speeds (18 km/h): slow motion is the film's, not the cable's.
// The wide shot is back at full speed (the bullwheel turns, the line's chairs run) — and on « s'arrête » everything
// stops. Your chair, closed on the cable, is held at the end of the quay; it never reaches the mouth.
//
// Where the camera stands, and why:
//   · at the quay, outside and a little behind, low: you seated, the grip under the cable, the cable over it; then a
//     dive onto the roller lying on the came (only the outer rear shows the roller and the lever);
//   · along the came (a move carried across the cut, toward +x) to the weighing at the end of the quay: the gauge
//     hanging from the roof, a chair ahead of yours crossing it — its mark goes up, out of the red: the weighing
//     works on a good grip, before it reads yours;
//   · low and outside on the launching tyres, then behind the launched chair (the quay streaming past, the mouth and
//     the night ahead);
//   · close on the roller at the end of the came (rear-outside), then the grip from the FRONT-outside (az +30: from
//     the rear the ear and the lever hide the jaws): it closes on the cable, and on « mal » its spring's edge turns
//     signal (the 2 mm gap does not read at 270 px; the edge does);
//   · the weighing again, closer: the mark falls into the red band (never a green verdict: a gauge that says
//     « too weak », nothing more);
//   · the whole station from behind the bullwheel: everything runs, then stops;
//   · behind your chair, looking out of the mouth at the drop it will not take (mood back to veille: the system won);
//   · from above, the side track: your chair lets go of the cable and the rail bends it aside.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, VIEW, STAGED, ROPE_V, AT_S, WEIGH } from "./world.js";
import { CABLE_Y, FREE, SIDE } from "./plan.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: VIEW.grip.dof };
const sAt = (x) => AT_S.launch + x; // the hero chair's abscissa when its grip stands at departure-side x
const GY = CABLE_Y - FREE; // the open grip's axis in the station
const WX = (WEIGH.x0 + WEIGH.x1) / 2; // the middle of the weighing (x)
const span = (a, b) => Math.max(0.05, b - a);

/* ── the hero chair's travel (departure-side x of its grip, as a function of the film's time) ── */
// Set on the voice: the plate meets the launching tyres on « accélèrent » (x −40: the plate is 72 cm long, the first
// tyre at x 0); the slow motion starts on the cut to the came's end, the chair at x 1015 on the came's last ramp.
// At 1 m/s the chair three ahead of yours (ligne.js places the others in time, 2,4 s apart) crosses the weighing
// while the camera looks at it (hero x −292 → −252 ≈ 44,3 → 44,7 s).
const QUAY_V = 100; // cm/s: 0.2 of the cable's
const SLOW_V = 41.5; // cm/s of the chair in slow motion (≈ a tenth of its speed)
const ROPE_SLOW = 45; // cm/s of the cable in slow motion: the open grip still lags it, the closed one slips a hair

export default function acte3({ D }) {
  const { tl, st, now, shot, cut, path, punch, chip } = D;
  const t = D.times({
    torepos: "torepos",
    pince: "repos:Sa", came: "repos:came", bout: "repos:Au", pese1: "repos:pèse", et: "repos:Et", accel: "repos:accélèrent",
    tozero: "tozero", dix: "zero:Dix", lance: "zero:lancé", lacame: "zero:came-0.12", ressort: "zero:Le#2", mal: "zero:mal",
    capteur: "reponse:Le", pese: "reponse:pèse", trop: "reponse:Trop", cable: "reponse:Et", cablew: "reponse:câble", stop: "reponse:s'arrête#2",
    ton: "reponse:Ton", isole: "reponse:On", controle: "reponse:contrôle",
    toverdict: "toverdict",
  });

  /* ── the chair's x, the cable's run ── */
  const tLaunch = t.accel; // the plate meets the tyres
  const xLaunch = -40;
  const tSlow = t.lacame - 0.1; // the cut into slow motion
  const xSlow = 1015;
  const tWide = t.cablew - 0.1; // back to full speed (retouche: on « câble », not « Et »: « Trop faible » stays on the gauge)
  const vEnd = 467; // cm/s at the end of the launch (≈ 17 km/h: the tyres hand it to the cable)
  const launchMean = (xSlow - xLaunch) / (tSlow - tLaunch);
  const LAUNCH = glide(QUAY_V / launchMean, vEnd / launchMean);
  const xWide = xSlow + SLOW_V * (tWide - tSlow); // ≈ 1265, on the weighing's far half
  const xHeld = 1425; // where it stops: the end of the quay, on the side track's switch, short of the mouth (1500)
  const tHeld = t.stop + 1.0;
  const chairX = (time) => {
    // at the quay: 1 m/s; held back to 0.4 m/s while the camera looks at the weighing (the others, placed in time
    // around yours, cross it then at 0.4 of their speed: the chair three ahead takes ≈ 0,9 s over it), then caught up
    if (time <= tLaunch - 2.8) return xLaunch - 260 + QUAY_V * (time - tLaunch + 2.8);
    if (time <= tLaunch - 1.8) return xLaunch - 260 + 40 * (time - tLaunch + 1.8);
    if (time <= tLaunch) return xLaunch + (220 / 1.8) * (time - tLaunch);
    if (time <= tSlow) return xLaunch + (xSlow - xLaunch) * LAUNCH((time - tLaunch) / (tSlow - tLaunch));
    if (time <= tWide) return xSlow + SLOW_V * (time - tSlow);
    const u = Math.min(1, (time - tWide) / (tHeld - tWide));
    return xWide + (xHeld - xWide) * (1 - (1 - u) * (1 - u)); // power2.out
  };
  const x0 = chairX(t.torepos);
  const rope = (time) => ROPE_V * time; // the cable, at full speed, until slow motion
  const ropeSlow0 = rope(tSlow);
  const ropeWide = ropeSlow0 + ROPE_SLOW * (tWide - tSlow);

  // the world as this act finds it: night, the X-ray of the station (the ground's glass dimmed inside it), you seated
  const HERE = { ...STAGED, line: 0.3, rider: 1, sit: 1, others: 1, cableKmh: 18 };

  /* ── where the poses stand (they ride the hero grip: tx follows chairX) ── */
  // the grip's axis at x, open (free 1) or closed (free 0)
  const grip = (x, free = 1) => ({ tx: x, ty: CABLE_Y - FREE * free, tz: SIDE });
  // the quay, outside and a little behind, low: you, the chair, its grip and the cable over it
  const QUAY = (x) => ({ ...P, tx: x + 10, ty: 125, tz: SIDE + 40, d: 1400, az: -36, el: 6, fov: 34, shift: 0 });
  // the roller lying on the came, from the outer rear (the roller at grip x −34, y +12,5, z +14)
  // (low: from above, the came's top face mirrors the key light into a blaze)
const ROLLER = (x, free = 1) => ({ ...P, ...CLOSE, tx: x - 30, ty: CABLE_Y - FREE * free + 8, tz: SIDE + 14, d: 200, az: -42, el: 3, shift: 40 });
// the same, wider and further ahead: the came's last ramp and its end in the frame
const ROLLEND = (x, free = 0) => ({ ...ROLLER(x, free), tx: x - 4, d: 250, az: -38 });
  // the weighing and its gauge
  // (from the front-outside: from az −30 the gauge stood on the right edge, under TikTok's buttons)
const WEIGH0 = { ...P, tx: WX - 15, ty: 365, tz: 330, d: 560, az: 6, el: 6, fov: 30, shift: 40 };
  // the launching tyres under your chair, low and outside, a little ahead of it
  const TYRES = (x) => ({ ...P, tx: x + 110, ty: 262, tz: SIDE, d: 640, az: -30, el: 6, fov: 32, shift: 40 });
  // the launched chair from behind and outside, low: the quay streams past, the mouth ahead
  const RUN = (x) => ({ ...P, tx: x + 80, ty: 125, tz: SIDE, d: 1300, az: -46, el: 3, fov: 34, shift: 0 });
  // the grip from the front-outside (az +30), close: the jaws, the cable in them, the spring under them
  // (low, el −6: higher, the camera stood inside the weighing's gauge hanging from the roof)
const FRONT = (x) => ({ ...P, ...CLOSE, ...grip(x + 4, 0), ty: CABLE_Y - 10, d: 200, az: 35, el: -6, shift: 120 });
  // the whole station from behind the bullwheel
  const WIDE = { ...P, ...VIEW.wide, d: 5600, el: 42, shift: 260 };
  // behind your chair at the end of the quay, looking out of the mouth at the drop
  // (from behind the chair, the camera stood among its glass; from outside with the ground lit, the grid ate the frame:
// the quay's own framing, the one that reads — your chair, still now, the mouth just past it)
const OUT = (x) => ({ ...QUAY(x), az: -30 });
  // the side track from above
  // (from above, el 42, the glass chair was a few faint lines: low and outside, it swings toward the camera)
const GARAGE0 = { ...P, tx: 1400, ty: 200, tz: SIDE + 170, d: 1000, az: 12, el: 16, fov: 32, shift: 0 };

  /* the light: what it stands around */
  const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });

  /* ══════════ REPOS (still act 2: calm, veille) ══════════ */

  /* ───────────── « Ton siège roule seul. » ───────────── */
  // the quay: your chair rolls on alone, at a walking pace, its grip open under the cable that runs on over it
  cut(t.torepos, SET.STATION, QUAY(x0), {
    ...HERE, chair: sAt(x0), rope: rope(t.torepos), free: 1, open: 1, weak: 0, kmh: 3.6, mood: 0, ...L(x0, 200, SIDE, 600),
  });
  // the chair: at a walking pace until the tyres, then the launch (ONE ramp), then slow motion
  st(t.torepos, span(t.torepos, tLaunch - 2.8), { chair: sAt(chairX(tLaunch - 2.8)) }, "none");
  st(tLaunch - 2.8, 1, { chair: sAt(chairX(tLaunch - 1.8)) }, "none");
  st(tLaunch - 1.8, 1.8, { chair: sAt(xLaunch) }, "none");
  st(tLaunch, span(tLaunch, tSlow), { chair: sAt(xSlow) }, LAUNCH);
  st(t.torepos, span(t.torepos, tSlow), { rope: rope(tSlow) }, "none");

  /* ───────────── « Sa pince attend, ouverte sur la came. » ───────────── */
  // one move, riding the chair: the camera comes down from you onto the roller lying on the came; on « came » it
  // lights, faintly — and the move goes on along it, toward the end of the quay
  const tAlong = t.bout - 0.12; // the cut to the weighing
  const xa = chairX(tAlong);
  // (retouche: the dive d 1400 → 200 in 2,9 s read as a jolt at 41,7 — now the quay holds, a slow push, and a CUT
  // onto the roller a few frames before « Sa pince attend »; the roller shot drifts along the came until the weighing)
  const tRoll = t.pince - 0.1;
  path([
    [t.torepos, QUAY(x0)],
    [tRoll, { ...QUAY(chairX(tRoll)), az: -40, el: 7, d: 1250 }],
  ]);
  cut(tRoll, SET.STATION, ROLLER(chairX(tRoll)));
  path([
    [tRoll, ROLLER(chairX(tRoll))],
    [tAlong, { ...ROLLER(xa), tx: xa + 20, az: -50 }],
  ]);
  st(t.pince, span(t.pince, t.came), L(chairX(t.came), GY + 10, SIDE, 220), "sine.inOut");
  st(t.came - 0.1, 0.4, { litCame: 1 }, "sine.out");

  /* ───────────── « Au bout du quai, un capteur pèse chaque pince. » ───────────── */
  // carried along the came (the same way on the screen), to the weighing and its gauge hanging from the roof. The
  // chair three ahead of yours crosses it: the mark goes up, out of the red band — nothing turns green
  const W1 = { ...WEIGH0, tx: WEIGH0.tx - 80, d: 700 };
  const W2 = { ...WEIGH0, d: 600, az: 4 };
  const W3 = { ...W2, d: 540, az: 0, el: 7 };
  cut(tAlong, SET.STATION, W1, { litWeigh: 0, weigh: 0, force: 0.05, ...L(WX, 330, SIDE + 60, 520) });
  shot(tAlong, 0.9, W2, "sine.out", W1.d);
  shot(tAlong + 0.9, span(tAlong + 0.9, t.et - 0.12), W3, "sine.inOut", W2.d);
  st(t.bout + 0.1, 0.5, { litWeigh: 1 }, "sine.out");
  // the other grip on the weighing (≈ 44,3 → 44,7 s): the mark rises on its passage, the gauge lights after it has
  // left the red band (the band glows harder only under WEIGH.ok: lit while the mark crossed it, it would flash)
  const cross = tLaunch - 2.8 + (-292 - chairX(tLaunch - 2.8)) / 40; // the instant chairX puts the hero at x −292 (≈ 44,2 s)
  st(cross, 0.25, { force: 0.9 }, "power2.out");
  st(cross + 0.11, 0.35, { weigh: 1 }, "sine.out");
  chip("chip-pesage", null, 96, 470, t.pese1 - 0.1, t.et - 0.28);

  /* ───────────── « Et là… les pneus accélèrent. » ───────────── */
  // low on the launching tyres, your chair entering them: on « accélèrent » its plate meets the first tyre, the
  // tyres spin faster down the row, the quay begins to stream past
  const tTyres = t.et - 0.12;
  cut(tTyres, SET.STATION, TYRES(chairX(tTyres)), {
    litCame: 0, litWeigh: 0, weigh: 0, force: 0.9, litTyres: 0, ...L(chairX(tTyres), 260, SIDE, 500),
  });
  path([
    [tTyres, TYRES(chairX(tTyres))],
    [t.accel, { ...TYRES(chairX(t.accel)), az: -34, d: 610 }],
    [t.tozero, { ...TYRES(chairX(t.tozero)), az: -40, d: 590 }],
  ]);
  st(tTyres + 0.15, 0.4, { litTyres: 1 }, "sine.out");
  st(t.accel, span(t.accel, t.tozero), L(chairX(t.tozero), 260, SIDE, 500), "none");
  st(t.accel, span(t.accel, t.lance - 0.6), { kmh: 18 }, "sine.inOut");
  punch(t.accel, 0.06, { hold: 0.18, down: 0.45 }); // let go before the cut (tozero)

  /* ══════════ 03 · RÉPONSE ══════════ */
  setAct(tl, 3, t.tozero);

  /* ───────────── « Le quai finit. » « Dix-huit kilomètres-heure, un vélo lancé. » ───────────── */
  // behind the launched chair, low: the quay streams past, the mouth and the night ahead; the header climbs to 18.
  // At the end of it, on the came's last ramp, the grip rises onto the cable (free → 0), still open
  cut(t.tozero, SET.STATION, RUN(chairX(t.tozero)), { litTyres: 0, mood: 1, ...L(chairX(t.tozero), 250, SIDE, 500) });
  const runKeys = [t.tozero, t.dix - 0.2, t.lance - 0.3, tSlow];
  path(runKeys.map((k, i) => [k, { ...RUN(chairX(k)), az: -46 + 6 * i, el: 3 + i, d: 1300 - 60 * i }]));
  st(t.tozero, span(t.tozero, tSlow), L(chairX(tSlow), 250, SIDE, 500), "none");
  st(tSlow - 0.35, 0.35, { free: 0.21 }, "sine.in");

  /* ═══ SLOW MOTION ═══ */
  // the cable, the chair, the tyres, the other chairs at a tenth of their speed
  now(tSlow, { rope: ropeSlow0 });
  st(tSlow, span(tSlow, tWide), { rope: ropeWide }, "none");
  st(tSlow, span(tSlow, tWide), { chair: sAt(xWide) }, "none");

  /* ───────────── « La came s'arrête. » ───────────── */
  // close on the roller at the end of the came: the came's last ramp rises away from it (the roller, at grip x −34,
  // leaves its end at chair x CAME.stopX + 34), the grip has risen onto the cable; the lever lifts on « ressort »
  const tFront = t.ressort - 0.12;
  cut(tSlow, SET.STATION, ROLLEND(xSlow, 0.21), { ...L(xSlow, CABLE_Y, SIDE, 200) });
  shot(tSlow, span(tSlow, tFront), { ...ROLLEND(chairX(tFront)), az: -34, d: 235 }, "none");
  st(tSlow, 0.7, { free: 0 }, "sine.out");
  st(tSlow, span(tSlow, tFront), L(chairX(tFront), CABLE_Y, SIDE, 200), "none");
  st(t.ressort, span(t.ressort, t.mal - 0.55), { open: 0 }, "sine.inOut");

  /* ───────────── « Le ressort referme ta pince… » « mal. » ───────────── */
  // the grip from the front: the mobile jaw closes on the cable, the spring stretches out under them — and on
  // « mal » its edge turns signal: the spring closes, too weakly
  cut(tFront, SET.STATION, FRONT(chairX(tFront)), { ...L(chairX(tFront), CABLE_Y - 8, SIDE, 200) });
  const tWeigh = t.capteur - 0.1;
  shot(tFront, span(tFront, tWeigh), { ...FRONT(chairX(tWeigh)), az: 28, el: -4, d: 185 }, "none");
  st(tFront, span(tFront, tWeigh), L(chairX(tWeigh), CABLE_Y - 8, SIDE, 200), "none");
  st(t.mal, 0.25, { weak: 1 }, "power2.out");
  punch(t.mal + 0.02, 0.06);

  /* ───────────── « Le capteur la pèse. » « Trop faible. » ───────────── */
  // the weighing again, your grip on it, its spring signal: the weighing bends a hair under the roller and on
  // « pèse » the mark falls into the red band. « Trop faible »: the band glows — and that is all the gauge says
  // (the gauge and your grip both in 440–1160, left of TikTok's buttons)
  // (retouche: from the front the gauge hid your grip under it; from the outer rear, like the first weighing)
  const WA = { ...WEIGH0, tx: WX + 5, ty: 365, d: 900, az: -24, el: 5, shift: 160 };
  const WB = { ...WEIGH0, tx: WX + 15, ty: 365, d: 820, az: -20, el: 6, shift: 160 };
  cut(tWeigh, SET.STATION, WA, { weigh: 0.4, force: 0.9, litWeigh: 1, ...L(WX, 330, SIDE + 60, 500) });
  shot(tWeigh, span(tWeigh, tWide), WB, "sine.inOut", WA.d);
  st(tWeigh, 0.4, { weigh: 1 }, "sine.out");
  st(t.pese - 0.1, 0.65, { force: 0.4 }, "sine.inOut");
  punch(t.trop, 0.06);
  chip("chip-faible", null, 96, 470, t.trop + 0.02, tWide - 0.14);

  /* ═══ FULL SPEED ═══ */
  /* ───────────── « Et le câble qui ne s'arrête jamais… » « s'arrête. » ───────────── */
  // the whole station from behind the bullwheel, the camera backing away: the wheel turns, the tyres, the line's
  // chairs run — your chair held at the end of the quay. On « s'arrête » it all stops in a second: the wheel, the
  // tyres, the cable; both readouts fall to zero; every chair swings on its grip
  cut(tWide, SET.STATION, WIDE, { litWeigh: 0, weigh: 0, ...L(200, 300, 0, 2600) });
  shot(tWide, span(tWide, t.ton - 0.1), { ...WIDE, d: 6200, az: -96, el: 44 }, "sine.inOut", WIDE.d);
  st(tWide, span(tWide, t.stop), { rope: ropeWide + ROPE_V * (t.stop - tWide) }, "none");
  // (the rope where it stops is the one before the retouche: computed on the old cut, « Et » − 0,1)
  const tWide0 = t.cable - 0.1;
  st(t.stop, 1.0, { rope: ropeSlow0 + ROPE_SLOW * (tWide0 - tSlow) + ROPE_V * (t.stop - tWide0) + 250 }, "power2.out");
  st(tWide, span(tWide, tHeld), { chair: sAt(xHeld) }, "power2.out");
  st(t.stop, 0.9, { cableKmh: 0, kmh: 0 }, "power2.out");
  st(t.stop + 0.15, 0.5, { sway: 1 }, "power2.out");

  /* ───────────── « Ton siège ne quittera pas la gare. » ───────────── */
  // behind your chair, at the end of the quay: the mouth, and past it the drop it will not take. The system has won:
  // the light turns veille on « Ton »
  const tOut = t.ton - 0.1;
  cut(tOut, SET.STATION, OUT(xHeld), { chair: sAt(xHeld), ...L(xHeld, 200, SIDE, 600) });
  shot(tOut, span(tOut, t.isole - 0.1), { ...OUT(xHeld), az: -22, d: 1300 }, "sine.inOut", OUT(xHeld).d);
  st(t.ton, 0.4, { mood: 0 }, "sine.inOut");

  /* ───────────── « On l'isole, pour contrôle. » ───────────── */
  // from above, the side track: your grip lets go of the cable, the rail bends your chair aside onto the side track
  const tIso = t.isole - 0.1;
  cut(tIso, SET.STATION, GARAGE0, { line: 0.3, mood: 0, ...L(1300, 250, SIDE + 150, 900) });
  shot(tIso, span(tIso, t.toverdict), { ...GARAGE0, d: 920, az: 4, el: 18 }, "sine.inOut", GARAGE0.d);
  st(t.isole, 0.45, { open: 1 }, "sine.inOut");
  st(t.isole + 0.2, 0.45, { free: 1 }, "sine.inOut");
  st(t.isole + 0.3, span(t.isole + 0.3, t.controle + 0.25), { iso: 1 }, "sine.inOut");
  st(t.isole, span(t.isole, t.toverdict - 0.15), { sway: 0 }, "sine.inOut");
  chip("chip-isole", null, 96, 470, t.isole + 0.3, t.toverdict - 0.15);
}
