// 02 · AUTOPSIE, second half — the principle and the rest (toprincipe → tozero).
//
// Act 2 leaves the forward port tank alone on the bench, in section, full of dark water (VIEW.tank, heart 1). The
// principle cuts on the same tank back in open water — the boat intact, no rock, veille (« Pourquoi ça remonte ? »;
// on the bench, its floor would hide the arrow that pushes up) — then pulls back, by ratio, to the whole boat: on
// « pèse » a signal arrow presses down, on « déplace » a veille arrow pushes up, as long — the balance.
// « Un mètre cube d'eau… » dives back into the tank, onto the cubic metre at its bottom: its lines are drawn, the green
// air pushes in from below (« remplacé par de l'air »), and on « 1 000 » the water block drops out — « kilos » hits.
// The rest cuts to the sea, the boat wounded and calm against the rock: « L'air attend dans ses bouteilles » (the bank
// glows, framed near), « La mer remplit les ballasts » (pull-back to the whole boat: the four tanks glow, full of
// water), « Un geste lâche tout » (the camera closes on the command, which glows). « Mais » cuts to the aft tank,
// closed, the picture turns signal; on « réservoir » a cut to the forward tanks, torn: « intact » hits on the tears.
import { SET, VIEW, STAGED, MBT, CMD, BANK, CUBE } from "./world.js";

const TANKF = [(MBT.fwd.x0 + MBT.fwd.x1) / 2, 0, 300];
const TANKA = [(MBT.aft.x0 + MBT.aft.x1) / 2, 0, 280];

/* ── the principle: the boat in open water, intact, nothing threatening (the bench's floor would hide the lift arrow) ── */
// the same tank as act 2's last frame, back in the water: a ring of dark water around the hull, its window
const TANK = { ...VIEW.tank, tx: TANKF[0], ty: TANKF[1], tz: TANKF[2], d: 5000, az: 32, el: 16, shift: 60, dof: 0 };
// the whole boat, diagonal in the frame: the signal arrow above its middle, the veille arrow under it
const WHOLE_B = { ...VIEW.whole, tx: -300, ty: 0, d: 20000, az: 68, el: 26, shift: 60 };
// the cubic metre at the bottom of that tank
const CUBE_P = { ...VIEW.cube, d: 1500, el: 12 };

/* ── in the sea ── */
// the boat wounded and still, framed on its middle: the bank of bottles under the control room reads
const REST = { ...VIEW.whole, tx: BANK.x - 400, ty: -150, d: 10500, az: 52, el: 16, shift: 60 };
// the whole boat: the four tanks, fore and aft
const WHOLE_S = { ...VIEW.whole, tx: -500, ty: 0, d: 26000, az: 70, el: 28, shift: 60 };
// the command through the glass, from port
const CMD_P = { ...VIEW.cmd, d: 2300, az: 30, el: 12, shift: 110 };
// the aft tank, closed, whole: a drum around the stern's cone (VIEW.aft, d 2300, is all hull)
const AFT = { ...VIEW.aft, tx: TANKA[0], ty: 0, tz: TANKA[2], d: 5500, az: 40, el: 12, shift: 80, dof: 0 };
// the forward tanks, torn, under the crushed bow (VIEW.torn, d 2300, is all hull)
const TORN = { ...VIEW.torn, tx: MBT.fwd.x0 + 150, ty: -200, tz: 260, d: 5000, az: 30, el: -4, shift: 80, dof: 0 };

// the light: what it stands around, and how wide
const L_TANK = { fx: TANKF[0], fy: TANKF[1], fz: TANKF[2], fs: 2000 };
const L_CUBE = { fx: CUBE.at[0], fy: CUBE.at[1], fz: CUBE.at[2], fs: 600 };
const L_WHOLE_B = { fx: -300, fy: 0, fz: 0, fs: 10000 };
const L_REST = { fx: BANK.x, fy: 0, fz: 0, fs: 6000 };
const L_WHOLE_S = { fx: -1000, fy: 0, fz: 0, fs: 12000 };
const L_CMD = { fx: CMD.at[0], fy: CMD.at[1], fz: CMD.at[2], fs: 400 };
const L_AFT = { fx: TANKA[0], fy: TANKA[1], fz: TANKA[2], fs: 1200 };
const L_TORN = { fx: MBT.fwd.x0 + 150, fy: -200, fz: 260, fs: 1400 };

export default function acte2b({ D }) {
  const { st, cut, path, chip, punch } = D;
  const t = D.times({
    toprincipe: "toprincipe", archimede: "archimede", pese: "pese", deplace: "deplace", un: "principe:Un",
    cube: "cube", air: "air3", mille: "mille1", kilos: "kilos",
    repos: "repos", attend: "attend", mer: "mer", ballasts: "repos:ballasts", geste: "geste2", lache: "lache1",
    mais: "mais", chasse: "repos:chasse", reservoir: "repos:réservoir", intact: "intact",
    tozero: "tozero",
  });

  /* ───────────── « Pourquoi ça remonte ? » — the same tank, back in the water ───────────── */
  cut(t.toprincipe, SET.SCENE, TANK, {
    ...STAGED, depth: 160, gap: 0, speed: 0, rush: 0, pitch: 0, rock: 0, crush: 0, jolt: 0, mood: 0, heart: 0.6,
    cmd: 0, valves: 0, bank: 1, flowF: 0, flowA: 0, airF: 0, airA: 0, leak: 0, ...L_TANK,
  });
  // PLAN-SÉQUENCE (2026-11-05): from the tank out to the whole boat and on round it, without a stop, to the cut into
  // the cube (it used to be a push, a stop, a pull-back, a stop)
  const back = t.archimede - 0.15;
  const dive = t.un - 0.12; // retouche: the dive (×12 in 0,75 s, heurté at 34,8) is a cut, a few frames before « Un »
  path([
    [t.toprincipe, TANK],
    [back, { d: 4500, az: 36 }],
    [t.pese - 0.1, WHOLE_B],
    [dive, { d: 17500, az: 76, el: 22 }],
  ]);

  /* ───────────── « Archimède : ton bateau pèse autant que l'eau qu'il déplace. » — the whole boat, two equal arrows ───────────── */
  const backDur = t.pese - 0.1 - back;
  st(back, backDur * 0.6, { heart: 0 }, "sine.inOut");
  st(back, backDur, L_WHOLE_B, "sine.inOut");
  chip("chip-archimede", null, 96, 470, t.archimede, t.un - 0.5);
  st(t.pese, 0.55, { weight: 0.8 }, "power2.out");
  st(t.deplace, 0.55, { lift: 0.8 }, "power2.out");

  /* ───────────── « Un mètre cube d'eau remplacé par de l'air… » — cut into the tank, onto the cubic metre ───────────── */
  cut(dive, null, { ...CUBE_P, d: 1650 }, { heart: 1, weight: 0, lift: 0, cube: 0.15, ...L_CUBE }); // the cube's lines already drawn
  st(t.cube, t.air - t.cube, { cube: 0.5 }, "sine.inOut");
  path([[dive, { ...CUBE_P, d: 1650 }], [t.mille, { d: 1350, az: CUBE_P.az + 8 }], [t.repos - 0.12, { d: 1250, az: CUBE_P.az + 13 }]]);

  /* ───────────── « …c'est 1 000 kilos en moins. » — the water block drops out ───────────── */
  st(t.mille, t.repos - 0.25 - t.mille, { cube: 1 }, "sine.in");
  chip("chip-tonne", null, 96, 470, t.mille, t.repos - 0.3);
  punch(t.kilos, 0.06);

  /* ───────────── « L'air attend dans ses bouteilles. » — the sea: the boat wounded, calm; the bank glows ───────────── */
  const rest = t.repos - 0.12;
  cut(rest, SET.SCENE, REST, {
    ...STAGED, depth: 160, gap: 0, speed: 0, rush: 0, pitch: 0, crush: 1, jolt: 0, mood: 0,
    cmd: 0, valves: 0, bank: 1, flowF: 0, flowA: 0, airF: 0, airA: 0, leak: 0, ...L_REST,
  });
  // retouche: the pull-back (heurté at 41,1) leaves earlier, as « bouteilles » ends, and travels a little less far
  const wide = t.mer - 0.75;
  const close = t.geste - 0.12; // retouche: the approach (×11 in 1,3 s, heurté at 42,7) is now a cut before « geste »
  path([[rest, REST], [wide, { d: 9800, az: 56 }], [close, { ...WHOLE_S, d: 24000 }]]); // out to the whole boat, no stop
  st(t.attend, 0.5, { litBank: 1 }, "sine.out");

  /* ───────────── « La mer remplit les ballasts. » — pull back to the whole boat: the four tanks glow ───────────── */
  st(wide, close - wide, L_WHOLE_S, "sine.inOut");
  st(t.mer, 0.5, { litBank: 0.3, litTank: 1 }, "sine.out");

  /* ───────────── « Un geste lâche tout. » — cut to the command, which glows ───────────── */
  // the glass in front of it thinned (as in act 1's crew shot) and a first glow: it reads before « lâche » lights it
  cut(close, null, { ...CMD_P, d: 2700 }, { litTank: 0, litBank: 0, litCmd: 0.35, hull: 0.35, inner: 0.4, rock: 0, ...L_CMD }); // chef: no boulder inside the control-room shot
  path([[close, { ...CMD_P, d: 2700 }], [t.mais - 0.2, { ...CMD_P, az: CMD_P.az + 8 }]]);
  st(t.lache, 0.4, { litCmd: 1 }, "sine.out");

  /* ───────────── « Mais l'air ne chasse l'eau… » — the aft tank, closed, intact; the picture turns signal ───────────── */
  const aft = t.mais - 0.2;
  cut(aft, SET.SCENE, AFT, {
    ...STAGED, depth: 160, gap: 0, speed: 0, rush: 0, pitch: 0, crush: 1, jolt: 0, mood: 0,
    cmd: 0, valves: 0, bank: 1, flowF: 0, flowA: 0, airF: 0, airA: 0, leak: 0, litTank: 0.6, ...L_AFT,
  });
  st(t.mais, 0.3, { mood: 1 }, "sine.inOut");
  path([[aft, AFT], [t.reservoir - 0.15, { d: 4900, az: 33 }]]);
  chip("chip-intact", null, 96, 470, t.chasse, t.tozero - 0.25);

  /* ───────────── « …que d'un réservoir intact. » — the forward tanks, torn ───────────── */
  const torn = t.reservoir - 0.15;
  cut(torn, SET.SCENE, TORN, {
    ...STAGED, depth: 160, gap: 0, speed: 0, rush: 0, pitch: 0, crush: 1, jolt: 0, mood: 1,
    cmd: 0, valves: 0, bank: 1, flowF: 0, flowA: 0, airF: 0, airA: 0, leak: 0, ...L_TORN,
  });
  path([[torn, TORN], [t.tozero, { d: 4500, az: 37 }]]);
  punch(t.intact, 0.06);
}
