// 03 · RÉPONSE — the blow (tozero → toverdict). « Le chef de quart lâche la chasse. » to « …un qui ne reviendra pas. »
// In moves that never stop (plan-séquence, 2026-11-05) and a few cuts on the breath; every cut is laid a few frames before its sentence (on the sound the script already
// lays there), its pose is complete and so is its state (built on DEEP / HIGH from STAGED): nothing is inherited.
//
// What the picture says, and in what order (the voice's, no other):
//   · at the station: the hood comes up on « Le chef de quart », the handle drops on « lâche », the two valves turn —
//     the two green fronts leave the manifold together;
//   · the camera pulls back by ratio with them to the whole boat: the forward front reaches its tanks on « Devant »,
//     the aft one (a longer pipe) on « derrière »;
//   · the torn forward tanks: their signal lips, a little green that does not stay — and on « s'échappe » the sheaves
//     of bubbles pour out of the tears;
//   · the aft tank, closed, whole: the green grows, the water goes down;
//   · the whole boat lifts off the rock and climbs, slowly: the rock sinks away, the snow falls past, the surface
//     comes down from the top of the frame — the header's depth runs down (illustrative figures: the voice says none);
//   · « La surface. »: at the waterline, the hull breaks it WITHOUT LEAVING THE WATER (never a leap) — the release:
//     `mood` goes to 0 on « surface »;
//   · « 98 blessés, dont un qui ne reviendra pas »: the boat still under the low sky, a very slow pull-back. No text,
//     no sound, no punch: the man who died is never a dramatic device.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, DEPTH, MBT, CMD } from "./world.js";

/* ── the poses ── */
const TANKF = [MBT.fwd.x0 + 150, -200, 260];
const TANKA = [(MBT.aft.x0 + MBT.aft.x1) / 2, 0, 280];
// the station: command, bank, valves, the two pipes leaving fore and aft
// the command, close, over the chief's shoulder — the frame act 1 left it on (« Un geste lâche tout »): the same hand,
// now it throws it. From there ONE pull-back, by ratio, follows the air out to the whole boat
const PZ = { side: 0, roll: 0, drift: 0.3, dof: 0, fov: 34 };
const BLOW0 = { ...VIEW.cmd };
// (the orbit to az 62 while the hood lifts: at az 18 the hood, passing 32°, mirrors the key straight into the lens — a
// one-frame white flash at 46,47; from 45° on, the glint is ~5× weaker and the panel stays three-quarter)
const BLOW1 = { ...VIEW.cmd, d: 560, az: 62 }; // a touch back: the handle, thrown, stays in the frame
// the whole boat, three-quarter from aft, the rock behind the bow
// (three-quarter from aft: the bow and its rock beyond, away on the left; the aft tanks nearest)
const CLIMB = { ...PZ, tx: -500, ty: 0, tz: 0, d: 27000, az: 66, el: 6, shift: 60 };
// the torn forward tanks, the aft tank
// (the crushed bow from port, a little below: the tears, and the column of bubbles rising out of them)
const TORN0 = { ...PZ, tx: -4400, ty: 0, tz: 300, d: 6500, az: 20, el: -4, shift: -80 };
// (the aft port tank from forward, its window: the fins beyond it)
const AFT0 = { ...PZ, tx: 3250, ty: 0, tz: 300, d: 6500, az: -30, el: 10, shift: 60 };
// the surface, then floating
// (« La surface »: the lens AT the waterline, level — the water plane is one clean line, not a field of swell strokes;
// it rises a hair under the camera as the boat comes up, and the sail breaks through it, the hull just under it)
const SURF = { ...VIEW.surface, ty: 440, el: 0, shift: 160 };
const FLOAT = { ...VIEW.float };

/* ── the light: what it stands around, how wide ── */
const L_CMD = { fx: CMD.at[0], fy: CMD.at[1], fz: CMD.at[2], fs: 300 };
const L_WIDE = { fx: -1500, fy: 0, fz: 0, fs: 12000 };
const L_TORN = { fx: TANKF[0], fy: TANKF[1], fz: TANKF[2], fs: 900 };
const L_AFT = { fx: TANKA[0], fy: TANKA[1], fz: TANKA[2], fs: 900 };

/* ── the state ── */
// 160 m down, the bow crushed on the rock, still; nothing thrown yet (each cut below completes it)
const DEEP = { ...STAGED, hull: 1, inner: 1, depth: 160, gap: 0, speed: 0, rush: 0, pitch: 0, crush: 1, jolt: 0, mood: 1,
  cmd: 0, valves: 0, bank: 1, flowF: 0, flowA: 0, airF: 0, airA: 0, leak: 0 };
// the blow thrown: the air is in the pipes
const BLOWN = { cmd: 1, valves: 1, bank: 0.4, flowF: 1, flowA: 1 };

const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, cut, path, chip, punch } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", chef: "chef", lache: "lacheZ", chasse: "chasse2",
    air: "zero:l'air", fonce: "fonce", devant: "devant1", derriere: "derriere1",
    reponse: "reponse", eventres: "eventres", airR: "reponse:l'air", echappe: "echappe",
    derriere2: "derriere2", ils: "reponse:ils", trigger: "trigger",
    lentement: "lentement", monte: "monte", la: "reponse:la", surface: "surface",
    blesses: "blesses", toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  // the cuts: each on the sound the script lays in the breath before its sentence
  const toTorn = t.reponse - 0.1;
  const toAft = t.derriere2 - 0.36;
  const toClimb = t.lentement - 0.32;
  const toSurf = t.la - 0.2;

  /* ───────────── « Le chef de quart lâche la +chasse+. » ───────────── */
  // the station, the same instant as the scene: the hood comes up while « Le chef de quart » is said, the handle drops
  // on « lâche », the two valves turn their quarter just after — the fronts leave on « chasse »
  cut(t.tozero, SET.SCENE, BLOW0, { ...DEEP, hull: 0.5, inner: 0.45, litCmd: 0, ...L_CMD });
  // PLAN-SÉQUENCE (2026-11-05): from the hand on the command, ONE move that never stops — the orbit while the hood
  // lifts, out through the glass with the air to the whole boat, an orbit while the green comes in, and a dive onto the
  // torn bow on « Devant » (it used to be a held wide shot and a cut). It slides on aft along the tears.
  path([
    [t.tozero, BLOW0],
    [t.lache + 0.1, BLOW1],
    [t.devant - 0.15, CLIMB],
    [t.derriere + 0.25, { d: 24500, az: 58, el: 7 }],
    [t.eventres, TORN0],
    [toAft, { tx: TORN0.tx + 450, d: 5900, az: 30 }],
  ], { from: "go", to: "go" }); // "go": past 45° before the hood lifts (at 18–40° it mirrors the key: a white frame at 46,6)
  st(t.chef + 0.2, span(t.chef + 0.2, t.lache), { cmd: 0.45 }, "sine.inOut"); // once the orbit is mostly done
  st(t.lache, 0.26, { cmd: 1 }, "power2.out");
  st(t.lache + 0.2, 0.3, { valves: 1 }, "power2.out");
  punch(t.chasse, 0.05);

  /* ───────────── « L'air comprimé fonce dans les ballasts. » ───────────── */
  // the two green fronts run down their pipes, the bottles empty; the camera pulls back by ratio with them to the
  // whole boat. The forward pipe is the short one: its front reaches the tanks on « Devant », the aft one on « derrière »
  st(t.chasse, span(t.chasse, t.devant), { flowF: 1 }, "sine.inOut");
  st(t.chasse, span(t.chasse, t.derriere), { flowA: 1 }, "sine.inOut");
  st(t.air, span(t.air, t.derriere), { bank: 0.4 }, "sine.inOut");
  st(t.lache + 0.1, span(t.lache, t.devant), { ...L_WIDE }, "sine.in");
  // the camera goes out through the two glass shells (≈ 47,8): they are gone while it crosses (at grazing they veil the
  // whole frame white), and come back once it is outside
  st(t.lache + 0.36, 0.35, { hull: 0, inner: 0 }, "sine.inOut");
  st(t.lache + 1.3, span(t.lache + 1.3, t.devant - 0.4), { hull: 1, inner: 1 }, "sine.inOut");

  /* ───────────── « Devant… et *derrière*. » ───────────── */
  // the whole boat: green comes into the forward tanks on « Devant », into the aft ones on « derrière »
  st(t.devant, 0.4, { airF: 0.15 }, "power2.out");
  st(t.derriere, 0.4, { airA: 0.12 }, "power2.out");
  punch(t.derriere, 0.06);

  /* ───────────── « Devant, les ballasts sont éventrés. » ───────────── */
  // the torn forward tanks, close: their signal lips; the green that comes in does not stay
  // (no cut any more: the dive brings the light with it)
  st(t.derriere + 0.25, span(t.derriere + 0.25, t.eventres), { ...L_TORN }, "sine.inOut");
  st(toTorn, 0.5, { airF: 0.08 }, "sine.inOut");
  st(t.eventres, 0.5, { airF: 0.1, leak: 0.15 }, "power2.out");
  chip("chip-eventres", null, 96, 470, t.eventres, toAft - 0.2);

  /* ───────────── « L'air *s'échappe*. » ───────────── */
  // the sheaves pour out of the tears, and the little green in the window goes with them
  st(t.airR, span(t.airR, t.echappe + 0.15), { leak: 1 }, "power2.out");
  st(t.echappe, 0.6, { airF: 0.04 }, "sine.inOut");
  punch(t.echappe, 0.06, { hold: 0.1, down: 0.35 }); // let go before the cut to the aft tank

  /* ───────────── « Derrière, ils se remplissent d'air. » ───────────── */
  // the aft tank, closed, whole: the green grows, the water goes down
  // a cut on the contrast « Devant / Derrière », MATCHED ON THE MOVE: the torn bow slid right, the aft tank goes on
  // sliding right at the same pace — the eye reads one travelling shot along the boat
  cut(toAft, SET.SCENE, AFT0, { ...DEEP, ...BLOWN, airF: 0.04, airA: 0.12, leak: 1, ...L_AFT });
  path([[toAft, AFT0], [toClimb, { tx: AFT0.tx + 600, d: 5700, az: -20 }]]);
  chip("chip-arriere", null, 96, 470, t.derriere2, toClimb - 0.2);
  st(t.ils, span(t.ils, toClimb), { airA: 0.85 }, "sine.inOut");

  /* ───────────── « Lentement, le bateau +monte+. » ───────────── */
  // the whole boat lifts off the rock: the rock sinks away, the snow falls past it, the surface comes down from the top
  cut(toClimb, SET.SCENE, CLIMB, { ...DEEP, ...BLOWN, airF: 0.04, airA: 0.85, leak: 1, ...L_WIDE });
  path([[toClimb, CLIMB], [toSurf, { d: 22000, az: 55, el: 10 }]]); // the boat climbs, the camera rises round it
  st(toClimb, 0.6, { airA: 1 }, "sine.out");
  st(t.lentement, span(t.lentement, toSurf), { depth: 40 }, "sine.in");
  st(t.lentement, span(t.lentement, toSurf), { gap: 3, pitch: 6, rush: 1 }, "sine.inOut");
  punch(t.monte, 0.06, { hold: 0.1, down: 0.3 }); // let go before the cut to the surface

  /* ───────────── « La surface. » ───────────── */
  // at the waterline: the hull breaks the plane WITHOUT LEAVING THE WATER — the release lands on « surface »
  cut(toSurf, SET.SCENE, SURF, {
    ...DEEP, ...BLOWN, depth: 12, gap: 400, rock: 0, sky: 1, rush: 0.4, pitch: 4,
    airF: 0.04, airA: 1, leak: 0, ...L_WIDE, // no bubble above the water
  });
  st(toSurf, 0.4, { rush: 0 }, "sine.out");
  st(t.surface - 0.1, span(t.surface, t.blesses), { depth: DEPTH.float, pitch: 0 }, "power2.out");
  st(t.surface, 0.3, { mood: 0 }, "power2.inOut");

  /* ───────────── « 98 blessés, dont un qui ne reviendra pas. » ───────────── */
  // the boat still under the low sky; one very slow pull-back from the surface to the float, nothing else
  // one slow move that never stops: along the waterline, then up to the float (no drama: slow, but never frozen)
  path([[toSurf, SURF], [t.blesses, { d: 15000, az: 66 }], [t.toverdict, { ...FLOAT, az: 72 }]]);
}
