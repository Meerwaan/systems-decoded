// c1 · « Moteurs à fond », « Comment marche la catapulte », « Sans radio » jusqu'à « la radio est interdite »
// — 0 → HAND.c12 (103,37 s). The plan, phrase by phrase: docs/L04-actes.md, « c1 »; journal: docs/journal/L04-c1.md.
//
// The hook from behind your tail (POSE0): the two cores white-hot, the deck running to the signal horizon, everything
// streaming — and your Rafale does not move. The camera glides along its port flank, out of the wing's way, and under
// the nose to the holdback bar (« une seule pièce »). « cède »: a whip back and up to the whole stroke, a head of light
// runs the slot to the bow (« en 75 mètres »). The night preview: a slow swing over the sea toward the angled runway
// while the sky goes black (the runway, the three wires, the lights). A dip back to the dawn: over your shoulder, your
// yellow dog; a cut on him. The bar again (the same frame as at 3.5 s); the deck goes glass, your aircraft fades, the
// cylinders under your wheels. Under the card, a whip into « Alors… on l'ouvre »: the catapult comes apart ON « on »;
// each part named; the push onto the hook; it closes as the camera lands at deck level in the slot's axis. A pull-back
// to the whole ship (the two catapults), a dive to the bar under your aircraft → the same bar on the bench (a melt);
// the bar couched → the receiver couched (a melt), the steam; below the hangar floor to the valve, up toward the cabin
// … and, under the card « Sans radio », a cut matched on the rising whip to the deck half an hour earlier: your
// aircraft rewinds to its parking. Up to the ship seen from above → the deck-plan table seen from above (a melt), the
// little aircraft, green and red; a red one → the real aircraft at the same place (a melt), the living deck, and the
// slow descent toward your dog that the seam c12 carries on.
import { fact } from "@kit/long.js";
import { glide } from "@kit/direct.js";
import { SET, AT, POSE0, VIEW, CLOSE, SHARP, HAND, seam, onFrame } from "./world.js";
import { CAT, CREW, TANK, VALVE, CABIN, PARK, onCat } from "./plan.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const NG = CAT[0].from; //                       your nose gear on the bow catapult
const NECK = [NG[0], 20, NG[2] + 163]; //       the calibrated piece's neck, in place (held, taut: model.js · holdbackHome)
const DOG = CREW.dog;
const KC = 290 / 26150; //                      the deck-plan table's scale (bord.js · KC): 290 cm of table for 261.5 m of ship

/** A pose aimed at `t` from the point `e` (the camera's place), the rest from `o`. */
const from = (e, t, o) => {
  const v = [e[0] - t[0], e[1] - t[1], e[2] - t[2]];
  const d = Math.hypot(v[0], v[1], v[2]);
  return { ...P, tx: t[0], ty: t[1], tz: t[2], d, az: (Math.atan2(v[0], v[2]) * 180) / Math.PI, el: (Math.asin(v[1] / d) * 180) / Math.PI, ...o };
};

/* ── the hook: from behind the tail, along the port flank (outside the wingspan), under the nose to the bar ── */
const FLANK = { ...P, tx: NG[0], ty: 110, tz: NG[2] + 200, d: 950, az: -62, el: 9, fov: 40, side: 140, ...SHARP }; // az and el on the way to BAR: no turn back
const BAR = { ...P, tx: NECK[0], ty: NECK[1], tz: NECK[2], d: 190, az: -60, el: 12, side: -100, ...CLOSE }; // = VIEW.holdback on the neck
const BAR_IN = { ...BAR, d: 165, az: -66, el: 10 };
/* ── the whole stroke, the head of light to the bow ── */
const STROKE = { ...VIEW.catLong };
const CEDE_MID = { ...P, tx: NECK[0], ty: 40, tz: NECK[2] - 260, d: 1300, az: -40, el: 10, side: -60, ...SHARP }; // the bar and the nose gear
const STROKE_2 = { ...STROKE, d: 6100, az: -31, el: 8 };
/* ── the night preview: a slow swing over the sea, from the bow catapult to the wires' zone ── */
const ZONE = { ...P, tx: -400, ty: 0, tz: 7600, d: 9000, az: -62, el: 26, ...SHARP };
const SWEEP_B = { ...P, tx: -330, ty: 0, tz: -3300, d: 7300, az: -41, el: 15, ...SHARP };
const ZONE_IN = { ...P, tx: -400, ty: 0, tz: 5800, d: 11500, az: -50, el: 22, ...SHARP }; // …and goes on, cut, over the wires' zone
/* ── back to the dawn: over your left shoulder (the helmet off frame, right), long lens on your dog ── */
// (seen: beside the canopy on the right, your helmet, the instrument panel and the head-up display in the foreground)
const COCK_DOG = from([NG[0] + 160, 330, NG[2] + 250], [DOG[0], 130, DOG[2]], { fov: 34, side: 0, ...SHARP });
const COCK_DOG_2 = { ...COCK_DOG, fov: 22 }; //  the lens closes on him: the cockpit slides out, he grows
const DOGP = { ...VIEW.dog, side: 0 }; //        his gesture, the dog ≈ 50 % of the height, at the same place of the picture
const DOGP_2 = { ...DOGP, d: 560, az: -36 };
/* ── under your wheels ── */
const TROUGH_MID = { ...P, tx: NG[0], ty: -30, tz: NG[2] - 150, d: 900, az: -62, el: 24, side: -60, ...CLOSE }; // the bar and the slot from above, the deck about to clear
const TROUGH = { ...VIEW.trough, d: 2300, az: -62, el: 18 }; // the bar's own angle: a pull-back, nothing swept past the lens
/* ── « Alors… on l'ouvre » ── */
const EXP_A = { ...VIEW.exploded, d: 2150, az: -30, el: 17 };
const EXP_Z = { ...VIEW.exploded, d: 2900, az: -52, el: 24 };
const HOOKP = { ...P, tx: NG[0], ty: 275, tz: NG[2], d: 560, az: -52, el: 12, side: -120, ...CLOSE }; // the shuttle and its hook, raised
const HOOKP_2 = { ...HOOKP, d: 520, az: -48 };
/* ── the slot, at deck level in its axis ── */
const SLOT = { ...P, ...((p) => ({ tx: p[0], ty: 10, tz: p[2] }))(onCat(0, 1000)), d: 1450, az: -8, el: 5, side: -60, ...CLOSE };
const SLOT_2 = { ...SLOT, tz: SLOT.tz - 150 };
/* ── the two catapults: the ship from above, then the dive back to the bar ── */
const TOP = { ...P, tx: -300, ty: 0, tz: -1500, d: 32000, az: -30, el: 45, ...SHARP };
const TOP_2 = { ...TOP, d: 30500, az: -35 };
const DECK_BAR = { ...P, tx: NECK[0], ty: NECK[1], tz: NECK[2], d: 420, az: -75, el: 8, side: -100, ...CLOSE };
const DECK_BAR_2 = { ...DECK_BAR, d: 400 };
/* ── the bench: the bar lying on it (its neck at (0, 9.8, 0), the gear end toward −z, as in the ship) ── */
const ON_BENCH = [NECK[0], NECK[1] - 9.8, NECK[2]];
const benchOf = (p) => ({ ...p, tx: p.tx - ON_BENCH[0], ty: p.ty - ON_BENCH[1], tz: p.tz - ON_BENCH[2] });
const B_GEAR = { ...P, tx: 0, ty: 10, tz: -45, d: 380, az: -72, el: 9, side: -100, ...CLOSE };
const B_NECK = { ...P, tx: 0, ty: 10, tz: 25, d: 300, az: -32, el: 6, side: -140, ...CLOSE }; // = the receiver's angle
/* ── the receiver, couched the same way, at the same place of the picture; the valve seen from under the hangar floor ── */
const RECV = { ...P, tx: TANK.at[0], ty: TANK.at[1], tz: TANK.at[2], d: 2000, az: -32, el: 6, side: -140, ...CLOSE };
const RECV_2 = { ...RECV, d: 1850, az: -29 };
const RECV_AFT = { ...P, tx: -180, ty: -1120, tz: -3300, d: 1950, az: -24, el: 9, side: -140, ...CLOSE }; // the main leaves aft… into the dark
const VALVEP = { ...P, tx: VALVE.at[0], ty: VALVE.at[1], tz: VALVE.at[2], d: 600, az: -38, el: -35, side: -120, ...CLOSE };
const VALVE_2 = { ...VALVEP, d: 560, az: -42 };
const CAB_LOOK = { ...P, tx: CABIN.at[0] - 220, ty: -150, tz: CABIN.at[2] + 150, d: 860, az: -45, el: -42, side: -60, ...CLOSE };
const CAB_UP = { ...CAB_LOOK, ty: -110, el: -38, d: 960 }; // still under the hangar floor (y −680): it is never crossed
/* ── half an hour earlier: the bow seen from aft-port, high ── */
const BRAVO_C = { ...P, tx: NG[0], ty: 0, tz: NG[2] + 2000, d: 4600, az: -36, el: 16, ...SHARP };
const BRAVO_D = { ...BRAVO_C, d: 5900, el: 24 };
const BRAVO_PUSH = { ...P, tx: NG[0], ty: 150, tz: NG[2] + 3900, d: 3300, az: -42, el: 20, ...SHARP };
const PARKED = { ...P, tx: NG[0], ty: 170, tz: NG[2] + 3800, d: 2100, az: -58, el: 7, ...SHARP }; //   « Bravo »: low, your aircraft at its parking
const PARKED_2 = { ...PARKED, d: 1850, az: -50, el: 9 };
/* ── the ship from above → the deck-plan table from above (bord.js: the same outline, scale KC, the bow up) ── */
const ABOVE = { ...P, tx: 0, ty: 0, tz: 0, d: 72000, az: 0, el: 85, ...SHARP };
const BOARD_TOP = { ...VIEW.boardTop, d: 72000 * KC, ty: 24 };
const BOARD = { ...VIEW.board };
const BOARD_C = { ...P, tx: 5, ty: 26, tz: -60, d: 300, az: -62, el: 32, ...SHARP }; //  « maquettes »: closer, the bow half
const BOARD_C2 = { ...BOARD_C, d: 255, az: -36, el: 28 };
/* ── a red token (PARK[4]) → the real aircraft at the same place ── */
const REDT = [PARK[4][0] * KC, 25.2, PARK[4][1] * KC]; // the table top is at 24.16 (bord.js · TABLE)
const RED_PUSH = { ...P, tx: REDT[0], ty: REDT[1], tz: REDT[2], d: 60, az: -40, el: 22, ...CLOSE }; // close: on the deck the parked jets fade past 45 m
const RED_DECK = { ...P, tx: PARK[4][0], ty: (REDT[1] - 24.16) / KC, tz: PARK[4][1], d: 58 / KC, az: -40, el: 22, ...SHARP };
const LIVE_B = { ...P, tx: 0, ty: 125, tz: -8400, d: 4200, az: -45, el: 22, ...SHARP }; // past the parked aircraft…
const LIVE_C = { ...P, tx: -700, ty: 140, tz: -7600, d: 3600, az: -58, el: 26, ...SHARP }; //   …cut, toward your dog

export default function ({ D }) {
  const { st, now, shot, cut } = D;
  const at = D.at;
  const t = D.times({
    pas: "accroche:pas", piece: "promesse:pièce", casser: "promesse:casser", cede: "promesse:cède", zero: "promesse:zéro", metres: "promesse:mètres",
    soir: "defi:soir", poser: "defi:poser", tennis: "defi:tennis", nuit: "defi:nuit",
    gestes: "curiosite:gestes", chien: "curiosite:chien", jaune: "curiosite:jaune", pourquoi: "curiosite:pourquoi",
    cette: "dessous:cette", briser: "dessous:briser", roues: "dessous:roues",
    cyl: "eclate:cylindres", piston: "eclate:piston", chariot: "eclate:chariot", croc: "eclate:croc",
    fente: "fente", slot: "fente:fente", crocF: "fente:croc",
    deux: "paire:deux", tonnes: "paire:20", barre: "retenue:barre", relie: "retenue:relie", cedeR: "retenue:cède",
    ballon: "ballon", vapeur: "ballon:rempli", bars: "ballon:30", retiens: "ballon:retiens", vient: "ballon:d'où",
    vanne: "vanne:vanne", toi: "vanne:toi", qui: "vanne:alors",
    bravo: "bravo:bravo", remonte: "bravo:remonte", moins: "bravo:bravo#2", pret: "bravo:prêt",
    pont: "maquette:pont", zones: "maquette:zones", table: "maquette:table", maquettes: "maquette:maquettes",
    vert: "pastille:vert", rouge: "pastille:rouge", bruit: "bruit", marins: "bruit:marins", avions: "bruit:quarantaine",
  });
  const CARD1 = at("ouvre") - 0.9; //  « Comment marche la catapulte »
  const CARD2 = at("bravo:pour") - 0.9; //  « Sans radio » (at("bravo") is the cue on the word « Bravo », not the beat)

  /* ═════════ accroche · « Tes moteurs sont à fond. Et ton Rafale ne bouge pas. » ═════════ */
  // POSE0 and FIRST: the cores white-hot, the blast in the deflector, the airframe trembling. The camera leaves at
  // three times its mean speed — along the flank, out of the wingspan — then under the nose to the bar
  shot(0, 2.2, FLANK, glide(3, 0.6));
  // under the nose: the distance shrinks by ratio (a steady zoom into the bar, never a rush at the end)
  shot(2.2, t.piece - 0.05 - 2.2, BAR, "sine.out", FLANK.d);
  st(1.2, t.piece - 1.2, { fx: NECK[0], fy: 60, fz: NECK[2], fs: 500 }, "sine.inOut"); // the light follows the camera to the bar
  D.punch(t.pas, 0.03, { up: 0.15, hold: 0.2, down: 0.6 });

  /* ═════════ promesse · « Une seule pièce… faite pour casser. Et quand elle cède… en 75 mètres. » ═════════ */
  now(t.piece, { named: 5 }); // its neck brighter
  shot(t.piece, t.cede - 0.05 - t.piece, BAR_IN); // a slow push on the neck while it holds
  D.punch(t.casser, 0.05);
  // « cède »: a whip back and up, off the bar, to the whole stroke (a pull-back by ratio)
  // « cède »: a cut ON the word, a step back on the nose gear, then the pull-back to the whole stroke (no whip)
  const onCede = onFrame(t.cede - 0.05);
  cut(onCede, null, CEDE_MID);
  shot(onCede, 2.0, STROKE, "sine.inOut", CEDE_MID.d);
  now(t.cede + 0.4, { named: 0 });
  st(t.cede, 1.6, { fx: NG[0], fy: 150, fz: NG[2] - 3000, fs: 4500 }, "sine.inOut");
  shot(onCede + 2.0, at("defi") - 0.1 - onCede - 2.0, STROKE_2); // the head of light runs: the camera drifts with it
  st(t.zero + 0.48, t.metres - t.zero - 0.48, { trace: 1 }, "sine.in"); // 8.4 → 10.76: zero to 240, to the bow
  fact(D.tl, { id: "c1-f240", k: "Lancé", v: "0 → 240 km/h", s: "en 75 mètres", tone: "signal", from: t.zero + 0.73, to: at("promesse$") - 0.1 });

  /* ═════════ defi · « Et ce soir… de nuit. » — the night preview ═════════ */
  const swing = onFrame(t.poser - 0.25); // a cut matched on the swing, a few frames before « Te poser »
  D.match(swing, [STROKE_2, SWEEP_B], ZONE_IN, { before: swing - at("defi") + 0.1 }); // accelerates from rest into the cut
  shot(swing + 0.9, t.nuit + 0.2 - swing - 0.9, ZONE);
  st(t.soir, t.nuit - 0.1 - t.soir, { night: 0.85 }, "sine.in");
  st(t.soir + 0.3, 2.0, { traceOut: 1 }, "sine.inOut"); // the trace fades where it stands
  now(t.soir + 2.4, { trace: 0, traceOut: 0 });
  st(t.soir, 2.5, { fx: -400, fy: 0, fz: 7000, fs: 9000 }, "sine.inOut");
  st(t.poser, 0.6, { angled: 1 }, "sine.out");
  st(t.tennis, 0.6, { wires: 1 }, "sine.out");
  st(t.nuit, 0.4, { lights: 1 }, "sine.out");

  /* ═════════ curiosite · « Devant toi, un marin en gilet jaune… Pourquoi « chien » ? » ═════════ */
  // a dip to black: back to the present, the dawn; over your shoulder, your dog ahead of your nose (long lens)
  const dip = onFrame(at("curiosite") - 0.03);
  cut(dip, SET.PONT, COCK_DOG, { night: 0, lights: 0, angled: 0, wires: 0.3, hud: 1, fx: NG[0], fy: 150, fz: NG[2] - 900, fs: 1600 }, { fade: 0.2, kind: "dip" });
  const onDog = onFrame(t.chien - 0.1);
  shot(dip, onDog - dip, COCK_DOG_2);
  now(t.gestes, { sig: 2 });
  now(t.gestes + 0.6, { sig: 3 });
  // « le chien jaune »: a cut on him, closer — at the same place of the picture
  cut(onDog, null, DOGP, { hud: 0, fx: DOG[0], fy: 120, fz: DOG[2], fs: 700 });
  shot(onDog, at("curiosite$") - onDog + 0.2, DOGP_2);
  st(t.jaune, 0.35, { vest: 1 }, "sine.out");
  st(t.pourquoi, 0.6, { vest: 0.5 }, "sine.inOut");

  /* ═════════ dessous · « Mais d'abord, cette pièce… se cache juste sous tes roues. » ═════════ */
  const onBar = onFrame(t.cette - 0.12);
  cut(onBar, null, BAR, { vest: 0.35, fx: NECK[0], fy: 60, fz: NECK[2], fs: 500 }); // the same frame as at 3.8 s
  const onBrise = onFrame(t.briser - 0.1); // a cut a few frames before « briser »: the deck around the bar, from further
  shot(onBar, onBrise - onBar, BAR_IN);
  cut(onBrise, null, TROUGH_MID);
  // « ce qui va la briser »: the deck goes glass, your aircraft fades, the camera pulls back down to the two cylinders
  shot(onBrise, t.roues + 0.05 - onBrise, TROUGH, "sine.inOut", TROUGH_MID.d);
  st(t.briser, 1.5, { under: 1, jet: 0, press: 0.55 }, "sine.inOut");
  st(t.briser, 1.6, { fx: -200, fy: -95, fz: -6500, fs: 2500 }, "sine.inOut");
  now(CARD1, { etape: 1, kmhOn: 0 });

  /* ═════════ ouvre · « Alors… on l'ouvre. » — under the card, a whip; the catapult comes apart ON « on » ═════════ */
  const whip = t.roues + 0.05;
  shot(whip, at("ouvre") - whip, EXP_A, "power2.out");
  st(whip, 0.6, { dog: 0, crew: 0, parked: 0 }, "sine.inOut"); // off the picture before the parts come out
  // a slow pull-back that goes on through « on » and the whole naming: nothing of the system moves on « Alors… »
  shot(at("ouvre"), t.piston + 0.3 - at("ouvre"), EXP_Z, "sine.inOut", EXP_A.d);
  st(at("explode"), 2.2, { explode: 1 }, "power2.out");
  st(at("ouvre"), 2.0, { fx: -500, fy: -150, fz: -5300, fs: 3200 }, "sine.inOut");

  /* ═════════ eclate · « Sous le pont, sur 75 mètres, deux longs cylindres… un croc accroché à ton avion. » ═════════ */
  fact(D.tl, { id: "c1-f75", k: "Sous le pont", v: "75 mètres", s: "de course", from: at("eclate") + 0.9, to: t.cyl + 0.7 });
  now(t.cyl, { named: 1 });
  now(t.piston, { named: 2 });
  st(t.piston + 0.1, 1.2, { shuttle: 1 }, "sine.inOut"); // the pistons slide a metre
  now(t.chariot, { named: 3 });
  // « croc »: a push onto the shuttle, raised, its hook empty
  shot(t.piston + 0.3, t.croc + 0.3 - t.piston - 0.3, HOOKP, "sine.inOut", EXP_Z.d); // 3.3 s: never a jerk
  shot(t.croc + 0.3, at("eclate$") + 0.1 - t.croc - 0.3, HOOKP_2);

  /* ═════════ fente · « Du pont, tu n'en vois presque rien : une longue fente… et le croc qui en dépasse. » ═════════ */
  // it closes; the camera comes down to deck level in the slot's axis; the paint comes back
  shot(at("eclate$") + 0.1, t.slot - 0.2 - at("eclate$"), SLOT, "sine.inOut", HOOKP_2.d);
  st(at("fente"), 1.2, { explode: 0, shuttle: 0 }, "sine.inOut");
  st(at("fente") + 0.4, 1.2, { under: 0, press: 0.3 }, "sine.inOut");
  st(at("fente"), 1.4, { fx: NG[0], fy: 20, fz: NG[2] - 800, fs: 1600 }, "sine.inOut");
  now(t.slot, { named: 4 });
  shot(t.slot - 0.1, at("paire") - t.slot + 0.1, SLOT_2); // glides SLOWLY toward the bow, along the lines
  now(t.crocF, { named: 3 });

  /* ═════════ paire · « Le Charles de Gaulle en a deux… plus de 20 tonnes. » ═════════ */
  shot(at("paire"), 4.2, TOP, "sine.inOut", SLOT_2.d); // up to the whole ship from above
  st(at("paire"), 2.5, { fx: -300, fy: 0, fz: 0, fs: 26000 }, "sine.inOut");
  now(t.deux, { named: 9 }); //                   the angled one (its slot and shuttle)
  st(t.deux, 0.9, { trace: 1 }, "sine.in"); //    the bow one: its head of light to the bow
  st(at("paire") + 4.0, 0.8, { dog: 1, crew: 0.6, parked: 0.6 }, "sine.inOut");
  shot(at("paire") + 4.2, 1.6, TOP_2);
  // down toward the bow catapult, where your Rafale comes back, to the bar under it
  const dive = at("paire") + 5.8;
  now(dive, { named: 0 });
  st(dive + 0.1, 1.8, { traceOut: 1 }, "sine.inOut");
  now(dive + 2.0, { trace: 0, traceOut: 0 });
  st(dive + 0.3, 1.5, { jet: 1 }, "sine.inOut");
  st(dive + 1.5, 2.6, { fx: NECK[0], fy: 60, fz: NECK[2], fs: 600 }, "sine.inOut");
  const benchAt = onFrame(t.barre - 0.15);
  shot(dive, benchAt - 0.3 - dive, DECK_BAR, "sine.inOut", TOP_2.d);
  shot(benchAt - 0.3, 0.3, DECK_BAR_2);
  fact(D.tl, { id: "c1-f20", k: "Ils lancent", v: "+ de 20 tonnes", from: t.tonnes, to: t.tonnes + 2.2 });

  /* ═════════ retenue · « Et derrière ta roue avant… la barre de retenue. Elle te relie au pont… jusqu'à ce qu'elle cède. » ═════════ */
  // the bar under your aircraft → the same bar on the bench, at the same place of the picture (a melt)
  cut(benchAt, SET.BENCH, benchOf(DECK_BAR_2), { ...AT.bench, item: 0, strain: 0, pool: 0, grid: 0, etape: 1, kmhOn: 0, kmh: 0 }, { fade: 0.2 });
  st(benchAt + 0.02, 0.6, { pool: 0.3, grid: 0.16 }, "sine.out");
  shot(benchAt, t.relie - benchAt, B_GEAR);
  shot(t.relie, at("retenue$") + 0.15 - t.relie, B_NECK); // along the bar, from the gear end to the deck end, round to its neck
  st(t.cedeR, 0.25, { strain: 1 }, "power2.out");
  st(t.cedeR + 0.25, 0.2, { strain: 0.6 }, "sine.inOut");

  /* ═════════ ballon · « Et quelque part dans le navire, un grand ballon… tu sauras d'où elle vient. » ═════════ */
  // the bar couched → the receiver couched the same way, at the same place (a melt)
  const recvAt = onFrame(at("ballon") - 0.1);
  cut(recvAt, SET.PONT, RECV, {
    ...AT.hull, under: 1, ship: 0.5, jet: 0, dog: 0, crew: 0, parked: 0, tank: 0.2, press: 0.3, named: 0,
    hooked: 1, held: 1, strain: 0.6, gas: 0.5, tremble: 0, jbd: 0, mood: 0, hot: 0,
    fx: TANK.at[0], fy: TANK.at[1], fz: TANK.at[2], fs: 1600, etape: 1, kmhOn: 0, kmh: 0,
  }, { fade: 0.2 });
  shot(recvAt, t.retiens - recvAt, RECV_2);
  now(at("tank"), { named: 6 });
  st(t.vapeur - 0.4, 1.4, { tank: 1 }, "sine.inOut");
  fact(D.tl, { id: "c1-f30", k: "Vapeur tenue à", v: "30 bars", tone: "veille", from: t.bars, to: t.bars + 2.4 });
  // « retiens-la »: it rises a little; « d'où elle vient »: along the main that leaves aft… to the edge of the dark
  shot(t.retiens, at("vanne") + 0.05 - t.retiens, RECV_AFT);

  /* ═════════ vanne · « Entre lui et les cylindres, une seule porte… Alors… qui ? » ═════════ */
  // from the receiver to the valve, under the hangar floor; seen from below, its wheel on its port flank
  shot(at("vanne") + 0.05, t.vanne - 0.1 - at("vanne"), VALVEP);
  st(at("vanne") + 0.3, 1.8, { fx: VALVE.at[0], fy: VALVE.at[1], fz: VALVE.at[2], fs: 900 }, "sine.inOut");
  now(t.vanne, { named: 7 });
  const rise = onFrame(CARD2 + 0.3); // the matched cut, under the card
  shot(t.vanne - 0.05, t.toi + 0.4 - t.vanne, VALVE_2);
  st(t.toi + 0.1, 0.5, { dial: 0.55 }, "sine.inOut"); // its wheel turns a notch on its own: someone else
  // « Alors… qui ? »: a slow climb toward the cabin's glazing, without reaching it (the hold)
  shot(t.toi + 0.35, rise - 0.5 - t.toi - 0.35, CAB_LOOK);
  now(t.qui, { named: 8 });

  /* ═════════ bravo · « Pour le savoir, remonte d'une demi-heure… ton avion doit être prêt. » ═════════ */
  // the climb becomes a whip upward, matched on the move: the deck half an hour earlier, high from aft-port
  const BRAVO = {
    ...AT.deck, etape: 2, kmhOn: 0, kmh: 0, jet: 1, track: 1, run: 0, hooked: 1, held: 1, strain: 0.6, gas: 0.5, tremble: 0, jbd: 0,
    dog: 1, sig: 0, crew: 1, parked: 1, night: 0, fx: NG[0], fy: 150, fz: NG[2] + 2000, fs: 5000,
  };
  D.match(rise, [CAB_LOOK, CAB_UP], [BRAVO_C, BRAVO_D], { set: SET.PONT, state: BRAVO, before: 0.5, after: 1.3 });
  now(CARD2, { etape: 2 });
  // « remonte d'une demi-heure »: your aircraft rewinds along its way, from the catapult to its parking
  st(t.remonte - 0.25, 0.25, { hooked: 0 }, "sine.inOut");
  st(t.remonte - 0.25, 0.6, { held: 0, strain: 0 }, "sine.inOut");
  st(t.remonte + 0.05, 1.3, { run: -40 }, "power2.inOut");
  st(t.remonte, 1.2, { night: 0.15 }, "sine.inOut");
  st(t.remonte, 1.6, { fx: NG[0], fy: 150, fz: NG[2] + 4000, fs: 3000 }, "sine.inOut");
  shot(rise + 1.3, t.bravo - 0.12 - rise - 1.3, BRAVO_PUSH); // a slow push onto your aircraft at its parking
  // « Bravo »: a cut on it, low, the same aircraft at the same place
  const onPark = onFrame(t.bravo - 0.12);
  cut(onPark, null, PARKED);
  shot(onPark, t.pret - 0.3 - onPark, PARKED_2);
  D.quiet(t.bravo - 0.2, t.pret + 0.4);
  const fb = fact(D.tl, { id: "c1-fbravo", k: "Ton départ", v: "Bravo", s: "ton avion prêt à", tone: "veille", from: t.bravo, to: t.pret + 0.35 });
  D.tl.set(fb.querySelector(".fact__v"), { textContent: "Bravo − 30 minutes" }, t.moins);

  /* ═════════ maquette, pastille · « Pour suivre tout le pont… En rouge… ceux qui ne voleront pas de sitôt. » ═════════ */
  // up over the whole ship, the bow at the top → the deck-plan table seen from above: the same outline (a melt)
  const boardAt = onFrame(t.zones + 0.35);
  shot(t.pret - 0.3, boardAt - 0.25 - t.pret + 0.3, ABOVE, "sine.inOut", PARKED_2.d);
  shot(boardAt - 0.25, 0.25, { ...ABOVE, d: 71000 });
  cut(boardAt, SET.BENCH, { ...BOARD_TOP, d: 71000 * KC }, { ...AT.bench, item: 1, zones: 0, tokens: 0, green: 0, red: 0, pool: 0.3, etape: 2, kmhOn: 0, kmh: 0 }, { fade: 0.2 });
  st(boardAt + 0.05, 0.8, { zones: 1 }, "sine.out");
  fact(D.tl, { id: "c1-fzones", k: "Le pont", v: "6 zones", from: boardAt + 0.2, to: t.maquettes - 0.15 });
  // « une table, un plan à plat »: the camera tips from above to the table seen at 40°
  shot(t.table - 0.1, t.maquettes - t.table, BOARD);
  st(t.maquettes, 1.6, { tokens: 1 }, "sine.inOut");
  // « maquettes »: a cut closer on the bow half, an orbit while they are set and lit
  const onTokens = onFrame(t.maquettes - 0.1);
  cut(onTokens, null, BOARD_C);
  shot(onTokens, t.rouge + 0.1 - onTokens, BOARD_C2);
  st(t.vert, 0.5, { green: 1 }, "sine.out");
  st(t.rouge, 0.5, { red: 1 }, "sine.out");
  const redAt = onFrame(at("bruit") - 0.15);
  shot(t.rouge + 0.1, redAt - 0.2 - t.rouge - 0.1, RED_PUSH, "sine.inOut", BOARD_C2.d); // onto a red one
  shot(redAt - 0.2, 0.2, { ...RED_PUSH, d: 58 });

  /* ═════════ bruit · « Sur ce navire, près de deux mille marins… la radio est interdite. » ═════════ */
  // the red token → the real aircraft at the same place: the living deck at dawn (a melt) — the state c2 starts from
  const SEAM = { ...AT.deck, etape: 2, kmhOn: 0, kmh: 0, hooked: 0, held: 0, track: 1, run: -40, gas: 0.5, dog: 1, sig: 0, crew: 1, parked: 1, night: 0.15 };
  cut(redAt, SET.PONT, RED_DECK, SEAM, { fade: 0.2 });
  const [h0] = HAND.c12.from;
  const handAt = D.at(HAND.c12.at) - HAND.c12.opt.before;
  const onLive = onFrame(at("bruit:pont") - 0.4); // « Et sur le pont… »: a cut matched on the glide
  D.match(onLive, [RED_DECK, LIVE_B], LIVE_C, { before: onLive - redAt }); // the glide starts from rest and runs into the cut
  shot(onLive + 0.9, handAt - onLive - 0.9, h0); // down toward your dog: the seam goes on
  fact(D.tl, { id: "c1-fmarins", k: "À bord", v: "≈ 2 000 marins", from: t.marins - 0.4, to: t.avions - 0.15 });
  fact(D.tl, { id: "c1-favions", k: "Et", v: "≈ 40 avions", s: "et hélicoptères", from: t.avions, to: onLive - 0.15 });

  // the seam: the descent toward your dog goes on in c2
  seam(D, "c12", "out");
}
