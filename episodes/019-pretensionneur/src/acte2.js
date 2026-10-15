// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero). The plan: docs/019-actes.md (and -maj.md).
//
// "Alors…": the retractor alone in a ghost of its pillar, everything else gone; the calm, a slow push. "…on l'ouvre.":
// the same retractor on the bench, at the same place of the picture (benchCut), and it comes apart on the word while
// the camera pulls back to the whole exploded view. Each part the voice names lights up in that ONE frame, with its
// legend: the frame, the spool (it pays out a little and winds back: that is what it does), the gas generator, the
// turbine. "Et au centre…": the row closes, the spool turns to glass and the camera dives to the bar inside it.
// The everyday lock, cut to its side: the strap goes out and back, free; on "freines fort" the pendulum tips and its
// pawl rises into the teeth; on "bloque" the strap pulls and the wheel stops dead. Close on the pendulum in its cup.
// "Mais bloquer ne reprend pas le mou": pull back to the whole retractor — held, its strap still sagging. "Pour ça,
// ici…": a dive to the gas generator, which lights up on "explosion" — nothing fires yet, that is the promise.
// The threshold does not stop the film: the camera leaves the generator and climbs the strap toward its end, where
// your shoulder is; the bench turns signal on "regarde". Act 3 cuts from there.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, HOME, VIEW, BENCHED, STAGED } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [HX, HY, HZ] = HOME;

/* ── in the car: the retractor in the foot of its pillar (act 1 hands over near it) ── */
const SYS = VIEW.system;
const SYS_IN = { ...SYS, d: 100 }; // the slow push of "Alors…": the bench cut matches on it

/* ── on the bench: the builder's poses (docs/journal/019-model.md), seen ── */
// (the journal's d 146 spread the row edge to edge, the turbine under TikTok's buttons: farther, higher, to the left)
const EXPLODED = { ...P, tx: 0, ty: 12, tz: 5.5, d: 178, az: -76, el: 12, shift: 110, side: 64 };
const BAR = { ...P, tx: 0, ty: 6.6, tz: 0.6, d: 44, az: -60, el: 2, shift: 160 };
// (the journal's shift 160 put the wheel's top teeth behind the header)
const LOCK_SIDE = { ...P, tx: -0.6, ty: 3.6, tz: -5.2, d: 50, az: -150, el: 6, shift: 70 };
const PENDULUM = { ...LOCK_SIDE, ty: 2.4, d: 38, shift: 40 };
// the whole retractor seen from the lock's end: the strap's belly in profile (from the front, az −70, it is flat)
const STRAP_SIDE = { ...P, tx: -1, ty: 15, tz: 0, d: 150, az: -165, el: 8, shift: 190 };
const CHARGE = { ...P, tx: 0, ty: 9, tz: 5, d: 46, az: -52, el: 14, shift: 160 };
const CHARGE_FAR = { ...CHARGE, d: 120, shift: 200 };
// the threshold climbs the strap toward its end (where your shoulder is): the whole strap, the retractor at its foot
const TOP = { ...P, tx: -1, ty: 18, tz: 0, d: 150, az: -68, el: 2, shift: 240 };

/* ── the light: what it stands around, and how wide ── */
const L_SYS = { fx: HX, fy: HY + 8, fz: HZ, fs: 30 };
const L_ROW = { fx: 0, fy: 10, fz: 4, fs: 26 };
const L_BAR = { fx: 0, fy: 6.5, fz: 0.5, fs: 14 };
const L_LOCK = { fx: 0, fy: 4, fz: -5, fs: 12 };
const L_STRAP = { fx: 0, fy: 14, fz: 0, fs: 22 };
const L_CHARGE = { fx: 0, fy: 9, fz: 5, fs: 12 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    p1: "p1", p2: "p2", p3: "p3", gen: "gen", p4: "p4", centre: "centre", p5: "p5",
    torepos: "torepos", brakes: "brakes", locks: "locks", noboom: "noboom", pendule: "pendule",
    mais: "repos:Mais", butlock: "butlock", nottaken: "nottaken", pour: "repos:Pour", here: "here", boom: "boom",
    toseuil: "toseuil", seuil: "seuil", watch: "watch", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── "Alors…" — the retractor alone in a ghost of its pillar: the calm, a slow push ───────────── */
  cut(t.tosystem, SET.CABIN, SYS, { ...STAGED, shell: 0.25, you: 0, wall: 0, mood: 0, ...L_SYS });
  shot(t.tosystem + 0.02, t.tobench - (t.tosystem + 0.02), SYS_IN, "sine.inOut", SYS.d);
  st(t.tosystem + 0.04, (t.tobench - t.tosystem) * 0.85, { shell: 0.1 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same retractor on the bench, at the same place; it comes apart on the word ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: SYS_IN, origin: HOME, state: { ...BENCHED, fx: 0, fy: 8, fz: 0, fs: 30 } });
  const open = t.explode + 0.08;
  st(open, t.p1 - 0.25 - open, { explode: 1 }, "sine.inOut");
  const wide = t.p1 - 0.1 - (t.tobench + 0.03);
  shot(t.tobench + 0.03, wide, EXPLODED, "sine.inOut", bench.d);
  st(t.tobench + 0.03, wide, L_ROW, "sine.inOut");

  /* ───────────── "Un enrouleur." — the frame lights up ───────────── */
  st(t.p1 + 0.05, 0.3, { litFrame: 1 }, "sine.out");
  const cFrame = co.add({ title: "Enrouleur", x: 470, y: 500, align: "end", tone: "system", anchor: A.frame });
  cFrame.show(tl, t.p1 - 0.1);
  cFrame.hide(tl, t.p2 - 0.3);

  /* ───────────── "Sa bobine." — it lights up, pays out a little and winds it back: that is what it does ───────────── */
  st(t.p2 - 0.12, 0.25, { litFrame: 0 }, "sine.inOut");
  st(t.p2 + 0.05, 0.3, { litSpool: 1 }, "sine.out");
  const half = (t.p3 - 0.15 - (t.p2 + 0.1)) / 2;
  st(t.p2 + 0.1, half, { tug: 0.3 }, "sine.inOut");
  st(t.p2 + 0.1 + half, half, { tug: 0 }, "sine.inOut");
  const cSpool = co.add({ title: "Bobine", x: 470, y: 500, align: "end", tone: "system", anchor: A.spool });
  cSpool.show(tl, t.p2 - 0.1);
  cSpool.hide(tl, t.p3 - 0.3);

  /* ───────────── "Une charge : le générateur de gaz." — over the turbine, it lights up ───────────── */
  st(t.p3 - 0.12, 0.25, { litSpool: 0 }, "sine.inOut");
  st(t.p3 + 0.05, 0.3, { litCharge: 1 }, "sine.out");
  const cCharge = co.add({ title: "Générateur de gaz", sub: "Une charge", x: 560, y: 500, align: "end", tone: "system", anchor: A.charge });
  cCharge.show(tl, t.p3 - 0.1);
  cCharge.hide(tl, t.p4 - 0.3);

  /* ───────────── "Une turbine." — under it, the wheel the gas will drive ───────────── */
  st(t.p4 - 0.12, 0.25, { litCharge: 0 }, "sine.inOut");
  st(t.p4 + 0.05, 0.3, { litTurbine: 1 }, "sine.out");
  const cTurb = co.add({ title: "Turbine", x: 560, y: 500, align: "end", tone: "system", anchor: A.turbine });
  cTurb.show(tl, t.p4 - 0.1);
  cTurb.hide(tl, t.centre - 0.2);

  /* ───────────── "Et au centre… une barre de torsion." — the row closes, the spool turns to glass: the bar inside it ───────────── */
  st(t.centre - 0.1, 0.25, { litTurbine: 0 }, "sine.inOut");
  const dive = t.p5 + 0.15 - t.centre;
  st(t.centre, dive, { explode: 0 }, "sine.inOut");
  st(t.centre + 0.15, dive, { xray: 1 }, "sine.inOut");
  shot(t.centre, dive, BAR, "sine.inOut", EXPLODED.d);
  st(t.centre, dive, L_BAR, "sine.inOut");
  st(t.p5 + 0.05, 0.3, { litBar: 1 }, "sine.out");
  const cBar = co.add({ title: "Barre de torsion", x: 470, y: 540, align: "end", tone: "system", anchor: A.bar });
  cBar.show(tl, t.p5 - 0.05);
  cBar.hide(tl, t.torepos - 0.3);

  /* ───────────── "Au quotidien, tu freines fort : elle se bloque." — the lock's side ───────────── */
  // (a quarter turn from the bar: a cut) the strap goes out and back, free — the wheel turns with it; on "freines
  // fort" the pendulum tips and the pawl rises into the teeth; on "bloque" the strap pulls: a nudge, then nothing.
  cut(t.torepos, SET.BENCH, LOCK_SIDE, { explode: 0, xray: 0.3, litBar: 0, tug: 0, lock: 0, ...L_LOCK });
  const free = (t.brakes - 0.05 - (t.torepos + 0.15)) / 2;
  st(t.torepos + 0.15, free, { tug: 0.3 }, "sine.inOut");
  st(t.torepos + 0.15 + free, free, { tug: 0 }, "sine.inOut");
  st(t.brakes + 0.05, t.locks - (t.brakes + 0.05), { lock: 1 }, "sine.inOut");
  st(t.locks + 0.05, 0.5, { tug: 1 }, "power2.out");

  /* ───────────── "Aucun explosif : un simple pendule." — close on the pendulum in its cup ───────────── */
  shot(t.noboom - 0.1, t.pendule + 0.2 - (t.noboom - 0.1), PENDULUM, "sine.inOut", LOCK_SIDE.d);
  st(t.pendule, 0.3, { litPendulum: 1 }, "sine.out");
  chip("chip-pendule", null, 96, 470, t.noboom, t.mais - 0.3);

  /* ───────────── "Mais bloquer ne reprend pas le mou." — pull back from the pendulum, without letting go: ───────────── */
  // the whole retractor from the lock's end — held, and its strap's belly seen in profile: the slack is still there
  const back = t.nottaken + 0.3 - (t.mais - 0.1);
  shot(t.mais - 0.1, back, STRAP_SIDE, "sine.inOut", PENDULUM.d);
  st(t.mais - 0.1, back, { ...L_STRAP, xray: 0 }, "sine.inOut");
  st(t.mais - 0.1, 0.3, { litPendulum: 0 }, "sine.inOut");
  chip("chip-bloque", null, 96, 470, t.nottaken - 0.1, t.pour - 0.25);

  /* ───────────── "Pour ça, ici… une explosion." — a cut to the generator's side, and the dive; it lights up on the word, nothing fires ───────────── */
  // (on the cut the lock lets go — the strap pulled back first: unlocking a strap still pulled would pay it out)
  cut(t.pour - 0.12, SET.BENCH, CHARGE_FAR, { explode: 0, xray: 0, tug: 0, lock: 0, slack: 1, litPendulum: 0, ...L_STRAP });
  const toCharge = t.boom + 0.1 - (t.pour - 0.1);
  shot(t.pour - 0.1, toCharge, CHARGE, "sine.inOut", CHARGE_FAR.d);
  st(t.pour - 0.1, toCharge, L_CHARGE, "sine.inOut");
  st(t.boom, 0.35, { litCharge: 1 }, "sine.out");

  /* ───────────── the threshold — "Abonne-toi : cette ceinture qui se resserre seule, regarde-la faire." ───────────── */
  // The film does not stop: the camera leaves the generator and climbs the strap toward its end — where your
  // shoulder is; the bench turns signal on "regarde", the threat is coming. Act 3 cuts on "Zéro".
  const climb = t.tozero - 0.04 - (t.toseuil + 0.05);
  shot(t.toseuil + 0.05, climb, TOP, "sine.inOut", CHARGE.d);
  st(t.toseuil + 0.05, climb, L_STRAP, "sine.inOut");
  st(t.toseuil + 0.4, 0.5, { litCharge: 0 }, "sine.inOut");
  st(t.watch, 0.3, { mood: 1 }, "sine.inOut");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
}
