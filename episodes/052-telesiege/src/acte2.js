// 02 · AUTOPSIE — from « on l'ouvre » (tobench) to the cut of act 3 (torepos).
//
// Act 1 ends close on your grip, open under the running cable (VIEW.grip). The same grip stands on the bench at the
// same place of the picture (benchCut, origin = the grip's axis in the station): on « on » it comes apart while the
// camera swings round to the front and pulls back over the exploded view. Then each part the voice names has its
// gesture: the parts come home and the came lights (« une came »), it pushes down on the roller, the lever swings
// (« pousse un levier et son galet ») — a cut to the jaws from the front, closed, that open on « ouvre » (the lever's
// work), the mobile one swings again on its word — then down to the spring, the heart, lit, that closes them on
// « serre ». The principle is back in the station, on your chair: at the quay its arrow is a fifth of the cable's;
// the tyres launch it (a tracking shot that rides the chair's own ease); at equal speed a cut close on the jaws,
// riding with them: the cable stands still between them (`track`: the cable's speed on screen is the slip).
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, ROPE_V, AT_S, BENCH_AT, SIZE } from "./world.js";
import { CABLE_Y, FREE, SIDE } from "./plan.js";

const [, BY] = BENCH_AT;
const GY = CABLE_Y - FREE; // the open grip's axis in the station
const sAt = (x) => AT_S.launch + x; // the hero chair's abscissa when its grip stands at departure-side x
const CLOSE = { dof: VIEW.grip.dof };

/* ── on the bench (the grip's cable axis at BENCH_AT) ── */
// act 1's last picture, as acte1.js really leaves it: its GRIP pose (az −40, el 10, d 112, dof 8, shift 150) on a chair
// at AT_S.board + 300 + 56 cm/s × (tobench − reset), reset = « Avant » − 0.18 — carried onto the bench by benchCut
const ACT1_V = 56; // acte1.js `V`
const act1Chair = (t) => AT_S.board + 300 + ACT1_V * (t.tobench - (t.avant - 0.18));
const gripStation = (xE) => ({ ...VIEW.grip, tx: xE, d: 112, az: -40, el: 10, shift: 150 });
const origin = (xE) => [xE, GY - BY, SIDE]; // the grip's axis in the station minus BENCH_AT
// the exploded view, from the front-outside (az +30 reads the jaws; the ear and lever hide them from the rear)
const EXPL = { ...VIEW.exploded, az: 22, el: 22, d: 330, shift: 60 };
// the came over its roller, the lever: from the outer rear (only side where the roller and lever show)
const CAMEB = { ...VIEW.cameBench, az: -48, el: 20, d: 200, shift: 160 };
const CAMEB2 = { ...CAMEB, az: -38, el: 15, d: 180 };
// the jaws close, from the front: the C of the fixed jaw, the cable in it, the hook of the mobile one
const JAWS = { fov: 28, side: 0, roll: 0, drift: 0.3, ...CLOSE, tx: 16, ty: BY, tz: 2, d: 165, az: 68, el: 14, shift: 110 };
const JAWS2 = { ...JAWS, az: 56, el: 12, d: 150 };
// the spring, the heart: from the outer front, under the jaws
const SPRING = { ...VIEW.spring, ty: BY - 9, az: 24, el: 10, d: 175, shift: 140 };
const SPRING2 = { ...SPRING, az: 12, el: 12, d: 158 };

// the light on the bench
const L_GRIP = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: SIZE };
const L_WIDE = { ...L_GRIP, fs: SIZE * 1.8 };
const L_CAME = { fx: -30, fy: BY + 12, fz: 12, fs: SIZE * 0.8 };
const L_JAWS = { fx: 8, fy: BY, fz: 2, fs: SIZE * 0.7 };
const L_SPRING = { fx: 14, fy: BY - 16, fz: 12, fs: SIZE * 0.7 };

/* ── back in the station: the principle, on your chair ── */
// three quarters outside, a little low: the grip, its two arrows over the cable, the tyres under it (tx follows the chair)
const PRIN = (x, o = {}) => ({ ...VIEW.principle, tx: x, d: 600, shift: 80, ...o });
// close on the jaws at equal speed, riding with the grip, from the outer front (az + : the jaws, not the ear)
const STILL = (x, o = {}) => ({ ...VIEW.still, tx: x + 10, ty: GY + 2, tz: SIDE, d: 175, az: 68, el: 12, shift: 110, ...o });
const LIT_S = (x, fs) => ({ fx: x, fy: GY, fz: SIDE, fs });

// the chair's x on the departure side, by phase (the quay at a fifth of the cable, the launch, equal speed)
const X_QUAY = -394; //   at the cut: it reaches the tyres (x 0) on « Les pneus », at 100 cm/s
const V_Q = ROPE_V * 0.2;

export default function acte2({ D }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    came: "eclate:came", pousse: "eclate:pousse", levier: "eclate:levier", galet: "eclate:galet", galetEnd: "eclate:galet$",
    ouvreM: "eclate:ouvre", mors: "eclate:mors", fixe: "eclate:fixe", mobile: "eclate:mobile", mobileEnd: "eclate:mobile$",
    bout: "eclate:bout", ressort: "eclate:ressort", serre: "eclate:serre", serreEnd: "eclate:serre$",
    avant: "scene:Avant", principe: "principe", rattrape: "principe:rattrape", fois: "principe:fois", cable1: "principe:câble$",
    pneus: "principe:pneus", vitesse: "principe:vitesse$", egal: "principe:vitesse#2", egale: "principe:égale$",
    pour: "principe:pour", immobile: "principe:immobile", immobileEnd: "principe:immobile$",
    torepos: "torepos",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── « … on l'ouvre. » — the same grip on the bench, at the same place; it comes apart ───────────── */
  const chair0 = act1Chair(t);
  const xE = chair0 - AT_S.launch;
  const B0 = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: gripStation(xE), origin: origin(xE),
    state: { ...BENCHED, ...L_GRIP, chair: chair0, rope: ROPE_V * t.tobench, kmh: 3.6, cableKmh: 18 },
  });
  // the cable runs through the open jaws (the slip grows) until the spring closes them on « serre »
  st(t.tobench, t.serre - t.tobench, { rope: ROPE_V * t.serre }, "none");
  st(t.explode, 1.2, { explode: 1 }, "sine.inOut");
  const wide = t.came - 0.75 - (t.tobench + 0.02);
  shot(t.tobench + 0.02, wide, EXPL, "sine.inOut", B0.d);
  st(t.tobench + 0.02, wide, L_WIDE, "sine.inOut");

  /* ───────────── « En gare, une came pousse un levier et son galet. » — home again; the came comes down ───────────── */
  // the parts come home (the came onto its roller) and the camera swings to the outer rear, onto the came and roller
  const home = t.came - 0.75;
  st(home, 0.9, { explode: 0, open: 0 }, "sine.inOut");
  shot(home, t.pousse + 0.1 - home, CAMEB, "sine.inOut", EXPL.d);
  st(home, 0.9, L_CAME, "sine.inOut");
  st(t.came, 0.25, { litCame: 1 }, "sine.out");
  // « pousse »: the came presses the roller down, the lever swings (open 0 → 1), and the camera keeps closing in
  st(t.pousse, t.galetEnd - t.pousse, { open: 1 }, "sine.inOut");
  shot(t.pousse + 0.1, t.galetEnd + 0.25 - (t.pousse + 0.1), CAMEB2, "sine.inOut");
  st(t.levier, 0.25, { litLever: 1, litCame: 0.4 }, "sine.out");
  st(t.galet, 0.25, { litRoller: 1 }, "sine.out");
  chip("chip-came", null, 96, 470, t.came, t.levier - 0.04);
  chip("chip-levier", null, 96, 470, t.levier + 0.04, t.galetEnd + 0.18);

  /* ───────────── « Le levier ouvre deux mors : un fixe, un mobile. » — a cut to the jaws, from the front ───────────── */
  const toJaws = t.galetEnd + 0.36; // a few frames before « Le levier »
  cut(toJaws, null, JAWS, { open: 0, explode: 0, litCame: 0, litLever: 0.3, litRoller: 0.3, litJaws: 0, ...L_JAWS });
  shot(toJaws + 0.02, t.bout - (toJaws + 0.02), JAWS2, "sine.inOut");
  st(t.ouvreM, 0.7, { open: 1 }, "sine.inOut");
  st(t.mors, 0.3, { litJaws: 1 }, "sine.out");
  // « un mobile »: the mobile one shows itself — it swings in and out again
  st(t.mobile, 0.22, { open: 0.55 }, "sine.inOut");
  st(t.mobile + 0.22, 0.36, { open: 1 }, "sine.inOut");
  chip("chip-mors", null, 96, 470, t.fixe - 0.12, t.bout - 0.15);

  /* ───────────── « Et au bout… le ressort qui les serre. » — down to the heart; it closes them ───────────── */
  shot(t.bout, t.ressort - t.bout, SPRING, "sine.inOut");
  st(t.bout, t.ressort - t.bout, { ...L_SPRING, litJaws: 0.35, litLever: 0, litRoller: 0 }, "sine.inOut");
  st(t.ressort, 0.3, { litSpring: 0.55 }, "sine.out");
  punch(t.ressort, 0.06);
  shot(t.ressort, t.principe - 0.11 - t.ressort, SPRING2, "sine.inOut");
  st(t.serre, 0.45, { open: 0 }, "sine.inOut");
  // closed: the grip holds the cable — they run together (the slip stops growing)
  st(t.serre, t.principe - 0.11 - t.serre, { rope: ROPE_V * (t.principe - 0.11), chair: chair0 + ROPE_V * (t.principe - 0.11 - t.serre) }, "none");
  chip("chip-ressort", null, 96, 470, t.ressort, t.principe - 0.3);

  /* ───────────── « Comment il le rattrape ? À quai, tu roules cinq fois moins vite que le câble. » ───────────── */
  const toSt = t.principe - 0.11;
  const xq0 = X_QUAY;
  const xq1 = X_QUAY + V_Q * (t.pneus - toSt); // ≈ 0: the tyres start
  cut(toSt, SET.STATION, PRIN(xq0, { az: -8, el: 12, d: 480, shift: 90 }), {
    ...STAGED, line: 0.3, mood: 0, rope: ROPE_V * toSt, chair: sAt(xq0), free: 1, open: 1, rider: 1, sit: 1,
    arrows: 0, vchair: 0.2, kmh: 3.6, cableKmh: 18, ...LIT_S(xq0, 320),
  });
  st(toSt, t.torepos - toSt, { rope: ROPE_V * t.torepos }, "none");
  st(toSt, t.pneus - toSt, { chair: sAt(xq1), fx: xq1 }, "none");
  shot(toSt + 0.01, t.pneus - toSt - 0.01, PRIN(xq1, { az: -24, el: 9, d: 490, shift: 100 }), "none");
  st(t.rattrape - 0.1, 0.6, { arrows: 1 }, "sine.out");
  chip("chip-cinq", null, 96, 470, t.fois - 0.1, t.pneus - 0.12);

  /* ───────────── « Les pneus te relancent à sa vitesse : » — the launch, the camera riding the chair ───────────── */
  // uniform acceleration from a fifth of the cable to its speed: distance ∝ (u + 2u²)/3
  const launchEnd = t.vitesse + 0.26;
  const T1 = launchEnd - t.pneus;
  const acc = (u) => (u + 2 * u * u) / 3;
  const xl1 = xq1 + ((V_Q + ROPE_V) / 2) * T1;
  st(t.pneus, T1, { chair: sAt(xl1), fx: xl1 }, acc);
  st(t.pneus, T1, { vchair: 1, kmh: 18 }, "none");
  st(t.pneus, 0.3, { litTyres: 1 }, "sine.out");
  shot(t.pneus, T1, PRIN(xl1, { az: -14, el: 13, d: 540, shift: 100 }), acc);
  st(t.pneus - 0.05, 0.3, { station: 0.08 }, "sine.out"); // the station's posts sweep past the lens on the launch: dimmed (qa 35,5 · 36,3)

  /* ───────────── « à vitesse égale, » — the two arrows equal; the camera closes on the grip ───────────── */
  const toStill = t.pour - 0.1;
  const xl2 = xl1 + ROPE_V * (toStill - launchEnd);
  st(launchEnd, toStill - launchEnd, { chair: sAt(xl2), fx: xl2, fs: 160 }, "none");
  shot(launchEnd, toStill - launchEnd, PRIN(xl2, { az: -4, el: 11, d: 500, shift: 100 }), "none");
  st(t.egal, 0.4, { litTyres: 0.3 }, "sine.inOut");

  /* ───────────── « pour ta pince, le câble est immobile. » — riding with the jaws: the strands stand still ───────────── */
  // a cut, close, from the front of the grip (the cut hides the place: the chair rides the last metres before the
  // came's end at the cable's speed exactly, so the slip is constant and the strands do not move between the jaws)
  const xs0 = -200;
  const xs1 = xs0 + ROPE_V * (t.torepos - toStill);
  cut(toStill, null, STILL(xs0), { chair: sAt(xs0), station: 1, arrows: 0, litTyres: 0, litJaws: 0, ...LIT_S(xs0, 110) });
  // world.js: `track` 1 = the camera rides with the hero grip, the cable's speed on screen is the slip (docs/journal/052-acte2.md)
  if ("track" in D.S) {
    now(toStill, { track: 1 });
    now(t.torepos - 0.02, { track: 0 });
  }
  st(toStill, t.torepos - toStill, { chair: sAt(xs1), fx: xs1 }, "none");
  shot(toStill + 0.01, t.torepos - toStill - 0.01, STILL(xs1, { az: 58, el: 10, d: 160 }), "none");
  st(t.pour + 0.2, 0.4, { litJaws: 0.7 }, "sine.out");
  punch(t.immobile, 0.06);
  chip("chip-egal", null, 96, 470, t.pour + 0.06, t.torepos - 0.2);
}
