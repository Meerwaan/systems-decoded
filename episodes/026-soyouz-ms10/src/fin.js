// DOSSIER 026 — the chute, what the film still owes, the like, the next file, the loop (toverdict → the end).
//   chute        a cut IN PLACE from the module act 3 has just landed to the same module on the bench, in its glass head;
//                the camera backs away from you while the fairing closes round you, and the tower stands on the nose under
//                « Ton sauvetage / Sur la tour ». On « va » the tower leaves; the camera stays with what stays and closes
//                in on the fairing; « pas » strikes the title; on « reste… » the four motors light one by one; « Sur la
//                coiffe » lands on « coiffe » and the account name lights up (D.verdict)
//   commentaire  what the film owes (the C of the hook): a cut in place, the same head on its rocket, on the pad at Baïkonour
//                the night before the launch; the camera backs away to the whole rocket · cut in on the top of booster D,
//                from behind its shoulder: « une pièce faussée » lights, bent, before the sound ones of its neighbours (the
//                hit of « lâcher ? » is the cut) · five months later (MS-12), a short dissolve:
//                you and your crewmate in your seats · « vous repartez »: ignition, the pad drops away, the camera backs away
//                to the whole rocket climbing in the night — the duel above it, each answer lit on its word: the film
//                never answers for the viewer
//   like         the highest point of the film: the module alone at the top of its arc, the curve of the Earth under it
//   prochain     the module on the steppe at night; far away a truck's headlamps come down a slope, then the exit lights
//                up. The LAST thing the film says; the voice does not ask to subscribe, the panel does
//   boucle       « Pour quand tout lâche. Comme… » — 50 km up, the whole rocket from below, its boosters still on and
//                burning; on « lâche » they let go: the cross opens, D swings in, the camera swings round into the first
//                frame along the line act 1 leaves it on — the last frame IS the first
// A title or a panel has finished leaving BEFORE the cut that follows it.
import { retitle, likeCall, nextFile, duelCall, benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, GROUNDED, FIRST, POSE0, MOTORS_AT, TOWER_GONE } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const FPS = 30;
const onFrame = (t) => Math.round(t * FPS) / FPS; // a cut that melts must fall on a frame

/* ── chute (the bench) — the title ends at y ≈ 606, its shade at 840 ── */
// act 3's last frame: the module landed (VIEW.ground) — the cut keeps it, in place, on the bench
const LANDED = VIEW.ground;
// the head whole, its tower standing on the nose just under the title (tower top y ≈ 655, nose ≈ 970, motors ≈ 1060)
const TOWERED = { ...P, tx: 0, ty: 700, tz: 0, d: 6500, az: -34, el: 4, fov: 30, shift: -60 };
// what stays: the fairing and its four motors, big (nose y ≈ 775, motors ≈ 1000, x 360 … 720)
const COIFFE = { ...P, tx: 0, ty: 640, tz: 0, d: 2600, az: -38, el: 8, fov: 30, shift: -20 };
const COIFFE_END = { ...COIFFE, d: 2450, az: -34 };
const L_DM = { fx: 0, fy: 110, fz: 0, fs: 260 };
const L_HEAD = { fx: 0, fy: 560, fz: 0, fs: 620 };
const L_COIFFE = { fx: 0, fy: 640, fz: 0, fs: 340 };

/* ── commentaire (the pad) ── */
// the whole rocket on its pad at night (tower top y ≈ 360, nose ≈ 500, D's top ≈ 1200, the deck ≈ 1580)
const PAD_WIDE = { ...P, tx: -88, ty: -1960, tz: 88, d: 13000, az: -45, el: 5, fov: 34, shift: -200 };
// the top of booster D, close, from behind its shoulder: its bent part in front (x ≈ 560, y ≈ 990), the sound ones of
// B and V just behind it through the glass of the core (x ≈ 650 and 245, y ≈ 850)
const PAIR = { ...P, tx: -150, ty: -1960, tz: -40, d: 800, az: -125, el: 10, fov: 32, shift: -30, side: 180 };
const PAIR_END = { ...PAIR, d: 740, az: -120 };
const L_PAIR = { fx: -150, fy: -1960, fz: -40, fs: 300 };
const L_ROCKET = { fx: 0, fy: -1700, fz: 0, fs: 2600 };
// inside, five months later: you and your crewmate in your seats, through the glass (VIEW.inside, pushed right: your
// head off the left edge — x ≈ 210, your crewmate's ≈ 420, your knees ≈ 950 at y ≈ 815, above the buttons' column)
const INSIDE = { ...VIEW.inside, side: -110 };
const INSIDE_END = { ...INSIDE, d: 400, az: -66 };
const L_CREW = { fx: -24, fy: 100, fz: -8, fs: 250 };
// the foot of the rocket on its pad: the arms (y ≈ 620), the deck (≈ 1160), the pit — the flame above the captions
const LIFTOFF = { ...P, tx: 0, ty: -2500, tz: 0, d: 8200, az: -32, el: -3, fov: 34, shift: 260 };
// the whole rocket climbing in the night, under the duel (tower top y ≈ 690, the boosters' feet ≈ 1550)
const CLIMB = { ...P, tx: 0, ty: -1250, tz: 0, d: 19000, az: -32, el: 2, fov: 34, shift: -160 };
const CLIMB_END = { ...CLIMB, d: 17600, az: -26 };
const L_BASE = { fx: 0, fy: -3000, fz: 0, fs: 1800 };

/* ── like: the module alone at 93 km, under the like panel (#net ends at y ≈ 761) ── */
const APOGEE = { ...VIEW.apogee, shift: -30 };
const APOGEE_END = { ...APOGEE, d: 1420, az: -24 };
const L_MODULE = { fx: 0, fy: 110, fz: 0, fs: 300 };

/* ── prochain dossier: the steppe at night, the module on the right, the road far away on the left (#next ends at
   y ≈ 851) — the steppe's tufts are culled for VIEW.night: the camera barely moves ── */
const NIGHT = VIEW.night;
const NIGHT_END = { ...VIEW.night, d: 1150 };

/* ── boucle: 50 km up, the first frame's own picture seen from a little further round (nose y ≈ 440, the boosters'
   tops ≈ 1250). Act 1 leaves POSE0 swinging round toward D and backing away (acte1.js: SINK, az −28 → −40, d 6400 →
   7400): the loop comes INTO POSE0 along that same line, so the move carries on across the seam instead of bouncing ── */
const AWAY = { ...POSE0, ty: -1180, d: 5900, az: -8, el: -30 };
const onLine = (u) => Object.fromEntries(Object.keys(POSE0).map((k) => [k, AWAY[k] + (POSE0[k] - AWAY[k]) * u]));
const CLIMB_RATE = 120; // m of `flown` per film second, as act 1 starts the film (acte1.js: sine.out, ≈ 180 m/s at first)

export default function fin({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    toverdict: "toverdict", secret: "chute:secret$", va: "chute:va", deny: "chute:pas", reste: "chute:reste", resteEnd: "chute:reste$",
    verdict: "verdict", coiffe: "chute:coiffe", tocta: "tocta",
    lacher: "comment:lâcher$", faulty: "faulty", faussee: "comment:faussée", cinq: "comment:Cinq", vous: "comment:vous",
    repartez: "comment:repartez", ensemble: "comment:Ensemble", ask: "ask", upagain: "upagain", never: "never",
    tolike: "tolike", like: "like", toabo: "toabo", truck: "truck", road: "road", exit: "exit", aboEnd: "abo$",
    toloop: "toloop", lache: "boucle:lâche",
  });
  const tEnd = D.tEnd;

  /* ── CHUTE — « Voilà son secret : quand ta tour s'en va, ton sauvetage ne part pas avec elle. Il reste… sur la coiffe. » ── */
  // in place: the landed module is the module in its head on the bench — the fairing glass for a moment, you still lit
  benchCut(D, {
    at: t.toverdict, set: SET.BENCH, view: LANDED, origin: [0, 0, 0],
    // (pool and grid at 0 on the cut — BENCHED would light them at once: the bench comes up under the module just after)
    state: { ...BENCHED, pool: 0, grid: 0, clock: MOTORS_AT, era: 0, alt: 0, pitch: 0, airspeed: 0, tower: 0, skin: 0, litYou: 1, ...L_DM },
  });
  // the camera backs away from you; the fairing closes round you as it does; the tower stands on its nose
  shot(t.toverdict, t.va - 0.2 - t.toverdict, TOWERED, "sine.inOut", LANDED.d);
  st(t.toverdict + 0.1, 0.6, { litYou: 0 }, "sine.inOut");
  st(t.toverdict + 0.15, 0.95, { skin: 1 }, "sine.inOut");
  st(t.toverdict, t.va - 0.2 - t.toverdict, L_HEAD, "sine.inOut");
  retitle(tl, { showAt: t.secret + 0.03, strikeAt: t.deny, swapAt: t.verdict - 0.05, hideAt: t.tocta - 0.42 });
  // « quand ta tour s'en va » — it leaves the nose, out by the top
  st(t.va, 1.1, { tower: 30 }, "power2.in");
  // « ton sauvetage ne part pas avec elle » — the camera stays with what stays: the fairing and its motors
  shot(t.va + 0.3, t.reste - 0.1 - t.va - 0.3, COIFFE, "sine.inOut", TOWERED.d);
  st(t.va + 0.3, t.reste - 0.1 - t.va - 0.3, L_COIFFE, "sine.inOut");
  // « Il reste… » — the four motors light one by one; « sur la coiffe »: the verdict
  st(t.reste, t.resteEnd - t.reste, { litMotors: 4 }, "none");
  shot(t.reste - 0.1, t.tocta - t.reste + 0.1, COIFFE_END, "sine.inOut");
  D.verdict(t.verdict);
  D.punch(t.coiffe, 0.06);

  /* ── COMMENTAIRE 1 — « Et ce qui l'a fait lâcher ? Une pièce faussée, au montage. » ── */
  // in place: the same head, on its rocket, on the pad the night before the launch (the tower back on its nose)
  cut(t.tocta, SET.SCENE, COIFFE_END, { ...GROUNDED, era: 1, clock: MOTORS_AT, flown: 0, fault: 0, ...L_COIFFE });
  shot(t.tocta, t.lacher - t.tocta, PAD_WIDE, "sine.inOut", COIFFE_END.d);
  st(t.tocta, t.lacher - t.tocta, L_ROCKET, "sine.inOut");
  // cut in on the same object, on the hit of « lâcher ? »: the top of booster D from behind its shoulder, the tops of B
  // and V behind it — on « faussée » D's part lights, bent
  const cutIn = t.lacher + 0.02;
  cut(cutIn, SET.SCENE, PAIR, { ...L_PAIR });
  shot(cutIn, t.cinq - 0.12 - cutIn, PAIR_END, "sine.inOut");
  st(t.faussee, 0.3, { fault: 1 }, "power2.out");
  chip("chip-piece", null, 96, 470, t.faulty, t.cinq - 0.27);
  D.punch(t.faussee, 0.05);

  /* ── COMMENTAIRE 2 — « Cinq mois plus tard, ton équipier et toi… vous repartez. Ensemble. » ── */
  // five months later: the same pad, MS-12 — inside, through the glass (a short dissolve: time has passed)
  const later = onFrame(t.cinq - 0.12);
  cut(later, SET.SCENE, INSIDE, { ...GROUNDED, era: 2, clock: MOTORS_AT, flown: 0, fault: 0, skin: 0, litYou: 0.6, litMate: 0.6, mood: 0, ...L_CREW }, { fade: 0.2 });
  shot(later, t.vous - 0.14 - later, INSIDE_END, "sine.inOut");
  chip("chip-ms12", null, 96, 470, t.cinq, t.vous - 0.32);
  // « vous repartez » — the foot of the rocket: ignition, the arms, the pad drops away
  const go = t.vous - 0.14;
  cut(go, SET.SCENE, LIFTOFF, { ...GROUNDED, era: 2, clock: MOTORS_AT, flown: 0, fault: 0, mood: 0, ...L_BASE });
  st(t.repartez, 0.35, { burn: 1, boost: 1 }, "power2.out");
  st(t.repartez, t.tolike - t.repartez, { flown: 420 }, "power1.in");
  st(t.repartez + 0.25, t.tolike - t.repartez - 0.25, { alt: 0.32, airspeed: 0.35 }, "power2.in");
  // « Ensemble » — the camera backs away to the whole rocket climbing in the night (the pad lights and the stars go on
  // with `pad`, held at 1): the duel comes over it
  shot(t.ensemble - 0.15, t.ask + 0.5 - t.ensemble + 0.15, CLIMB, "sine.inOut", LIFTOFF.d);
  st(t.ensemble - 0.15, t.ask + 0.5 - t.ensemble + 0.15, L_ROCKET, "sine.inOut");
  shot(t.ask + 0.5, t.tolike - t.ask - 0.5, CLIMB_END, "sine.inOut");
  duelCall(tl, { from: t.ask, aAt: t.upagain, bAt: t.never, to: t.tolike - 0.3, toneA: "veille", toneB: "signal" });

  /* ── LIKE — « Like : envoie ce dossier plus haut que ta fusée. » — the highest point of the film ── */
  cut(t.tolike, SET.SCENE, APOGEE, {
    ...STAGED, era: 0, clock: MOTORS_AT, alt: 93, pitch: 0, flown: 0, airspeed: 0, burn: 0, boost: 0, trail: 0,
    free: 1, apart: 3000, tower: TOWER_GONE, litYou: 0.3, mood: 0, ...L_MODULE,
  });
  shot(t.tolike, t.toabo - t.tolike, APOGEE_END, "sine.inOut");
  likeCall(tl, { from: t.like, to: t.toabo - 0.3, count: 5, label: (n) => `${n} personnes` });

  /* ── PROCHAIN DOSSIER — « un poids lourd sans freins, en pleine descente. Et au bord de la route… une sortie. » ── */
  cut(t.toabo, SET.SCENE, NIGHT, {
    ...STAGED, era: 0, clock: MOTORS_AT, alt: 0, pitch: 0, flown: 0, airspeed: 0, burn: 0, boost: 0, trail: 0, chute: 0,
    free: 1, apart: 3000, tower: TOWER_GONE, litYou: 0.3, mood: 0, truck: 0.02, ...L_MODULE, fs: 420,
  });
  shot(t.toabo, t.toloop - t.toabo, NIGHT_END, "sine.inOut");
  st(t.toabo + 0.1, t.truck - t.toabo - 0.1, { truck: 0.06 }, "sine.out"); // the crest and the road come out of the night
  st(t.truck, t.road - t.truck, { truck: 0.8 }, "none"); // the two headlamps come down the slope
  st(t.exit - 0.04, 0.45, { truck: 1 }, "sine.out"); // « une sortie »: the spur lights up, veille
  nextFile(tl, { showAt: t.toabo + 0.06, factAt: t.truck, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.aboEnd + 0.15 });

  /* ── BOUCLE — « Pour quand tout lâche. Comme… » — the first frame, a breath before it ── */
  // the boosters still on and burning, the camera already swinging round, the streaks and the jets running: everything
  // at a constant pace from the cut to the last frame, so that nothing jerks on « lâche » — and no two tweens on one
  // number overlap (an overlap gives a value that depends on the direction of the seek)
  const along = (time) => (time - t.toloop) / (tEnd - t.toloop);
  const flownAt = (time) => FIRST.flown - CLIMB_RATE * (tEnd - time);
  cut(t.toloop, SET.SCENE, AWAY, {
    ...STAGED, clock: FIRST.clock, tower: FIRST.tower, sep: 0, bad: 0, boost: 1, flown: flownAt(t.toloop),
    airspeed: FIRST.airspeed, mood: FIRST.mood, fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs,
  });
  shot(t.toloop, t.lache - t.toloop, onLine(along(t.lache)), "none");
  st(t.toloop, t.lache - t.toloop, { flown: flownAt(t.lache) }, "none");
  // on « lâche » D.loop takes over, in straight lines too: the camera ends its swing on POSE0, `flown` keeps its pace,
  // and the boosters let go — their jets die, the cross opens, D swings in (at about the pace act 1 goes on with) — to
  // land on FIRST on the last frame
  D.loop({ at: t.toloop, rewindAt: t.lache, ease: "none" });
}
