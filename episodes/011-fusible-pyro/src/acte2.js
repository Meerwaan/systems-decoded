// 02 · AUTOPSIE — "Alors… on l'ouvre." The fuse at its place in the open junction box, time stopped at T+0, while
// the car and the battery fade round it; the same fuse on the bench, at the same place of the picture (benchCut).
// Its housing, the size of a pack of cards; the housing lifts off — the column — and each part has its shot on
// its word: the copper bar and the whole current of the battery running through it, the piston hanging over it
// and, behind the piston, the charge (one frame for the two: "derrière lui"). Then how it waits: the fuse closed
// again without its housing, the current runs, an ordinary fuse counts its seconds in the top slot — and in ours
// nothing moves: it waits for an order, not for heat. The threshold: the camera closes in on the charge, which
// breathes — act 3 sets it off.
import { setAct } from "@kit/overlay.js";
import { ramp } from "@kit/direct.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, HOME, STAGED, BENCHED } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the bench's light, stood round the fuse in the car: it is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };
const UNLIT = { litCase: 0, litBar: 0, litPiston: 0, litCharge: 0 };

/* ── in the car ── */
const IN_CAR = VIEW.fuse; // the cut to the bench leaves from here
const IN_CAR_FAR = { ...IN_CAR, d: 56 };

/* ── on the bench (the fuse's housing is centred on y = 7; its bar lies at y = 6.24, along x) ── */
const WHOLE = { ...VIEW.whole, d: 60, az: -30 };
const WHOLE_ROUND = { ...WHOLE, az: -38, el: 16 }; // a quarter of the way round it while the voice sizes it
const COLUMN = VIEW.exploded; // the housing lifted off: the whole column under the header
// the bar from end to end, lying across the picture, its top face wide: the current runs up it, from the near end
const FLOW = { ...P, tx: -1, ty: 6.4, tz: 0, d: 48, az: -47, el: 28, shift: 100 }; // (both bolts in the picture: 163 and 948 px)
const FLOW_ON = { ...FLOW, tx: -0.8, d: 50, az: -43 }; // …and the camera goes a little way with it (both ends stay in)
// one frame for the piston AND the charge behind it: the bar at the foot of the picture (above the captions), the
// lifted housing hidden behind the header. (From closer — VIEW.pistonPart, VIEW.chargePart — the charge went
// behind the header and the bright bar behind the captions.)
const PISTON = { ...P, tx: 0, ty: 8.9, tz: 0, d: 38, az: -27, el: 12, shift: 90 }; // (az −27: from −34 the rim light glints on the charge's header — it looks lit before its word)
const CHARGE = { ...P, tx: 0, ty: 11.2, tz: 0, d: 36, az: -23, el: 10, shift: 300 };
const CHARGE_ROUND = { ...CHARGE, az: -20 };
// closed again, without its housing: the bar, the piston's wedge over it, the charge on the piston's back
const REPOS = { ...P, tx: 0, ty: 7.7, tz: 0, d: 38, az: -22, el: 11, shift: 65 };
const REPOS_NEAR = { ...REPOS, d: 35, az: -25, shift: 50 };
const ORDER = { ...P, tx: 0, ty: 9.5, tz: 0, d: 33, az: -27, el: 10, shift: 200 }; // up to the charge and its plug
const ARMED = { ...P, tx: 0, ty: 9.5, tz: 0, d: 25.5, az: -34, el: 8, shift: 255 }; // the threshold ends here: the charge, the piston's crown under it

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot, cut } = D;
  const A = world.fuse.A;
  const t = D.times({
    tofuse: "tofuse", tobench: "tobench", explode: "explode", p0: "p0", cartes: "eclate:cartes$", p1: "p1", tout: "eclate:tout", flow: "flow",
    p2: "p2", piston: "eclate:piston$", derriere: "eclate:derrière", p3: "p3",
    torepos: "torepos", fusible: "repos:fusible", heat: "heat", minutes: "repos:minutes$", lui: "repos:lui", order0: "order0",
    toseuil: "toseuil", seuil: "seuil", explosion: "seuil:explosion", entier: "seuil:entier", end: "seuil$", tozero: "tozero",
  });
  const light = (at, dur, [fx, fy, fz], fs) => st(at, dur, { fx, fy, fz, fs }, "sine.inOut");
  const span = (from, to) => Math.max(0.1, to - from); // every length is a gap between two moments of the script: the day the voice comes, they all follow
  // A part's name, drawn on it; its small line in full ink (dimmed, over a lit part, it falls under the contrast the check asks for)
  const label = (opts) => {
    const c = co.add({ tone: "system", ...opts });
    const sub = document.querySelector("#callouts > .co:last-child .co__s");
    if (sub) sub.style.color = "var(--ink)";
    return c;
  };
  setAct(tl, 2, t.tofuse);

  /* ── "Alors…" — the fuse in the open junction box, at T+0. The car, the battery, the current fade: it stands alone ── */
  const under = t.tobench - t.tofuse;
  const fade = Math.max(0.2, under - 0.16);
  cut(t.tofuse, SET.ROAD, IN_CAR_FAR, { ...STAGED, box: 0, ...UNLIT, ...LIT });
  shot(t.tofuse + 0.02, under - 0.02, IN_CAR, "sine.inOut", IN_CAR_FAR.d);
  st(t.tofuse + 0.06, fade, { shell: 0, wall: 0, pack: 0, hv: 0, flow: 0 }, "sine.inOut");
  st(t.tofuse + 0.06, Math.min(0.45, fade), { mood: 0 }, "sine.inOut");

  /* ── "…on l'ouvre." — the same fuse on the bench; the camera steps back: there is the whole of it ── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: IN_CAR, origin: HOME, state: { ...BENCHED } });
  const pullAt = t.explode + 0.08;
  shot(pullAt, span(pullAt, t.p0), WHOLE, "sine.inOut", bench.d);

  /* ── "Un boîtier, grand comme un jeu de cartes." — the housing lights up; the camera goes a little way round it ── */
  const OPEN = 0.9;
  const openAt = Math.max(t.cartes + 0.05, t.p1 - 0.45);
  st(t.p0 + 0.1, 0.3, { litCase: 0.7 }, "sine.out");
  shot(t.p0, span(t.p0, openAt), WHOLE_ROUND, "sine.inOut");
  const cCase = label({ title: "Boîtier", sub: "≈ 7 × 5 × 4 cm", x: 340, y: 690, align: "end", anchor: A.fuse });
  cCase.show(tl, t.p0 + 0.05);
  cCase.hide(tl, openAt - 0.3);
  st(openAt - 0.2, 0.25, { litCase: 0 }, "sine.inOut");

  /* ── "Une barre de cuivre :" — the housing lifts off, the charge and the piston after it: the column. The camera rises with them ── */
  st(openAt, OPEN, { explode: 1 }, "none");
  shot(openAt, OPEN, COLUMN, "sine.inOut", WHOLE_ROUND.d);
  light(openAt, OPEN, [0, 10, 0], 11);
  st(t.p1 + 0.1, 0.3, { litBar: 1 }, "sine.out");

  /* ── "…tout le courant de la batterie y passe." — down to the bar; the dashes run from one end of it to the other ── */
  const diveAt = Math.max(openAt + OPEN + 0.1, t.tout - 0.4);
  const diveLen = Math.max(0.5, t.flow + 0.2 - diveAt);
  shot(diveAt, diveLen, FLOW, "sine.inOut", COLUMN.d);
  light(diveAt, diveLen, [0, 6.5, 0], 8);
  st(t.flow - 0.3, 0.25, { litBar: 0 }, "sine.inOut"); // (litBar OR flow, never both: mint under orange dashes)
  st(t.flow, 0.45, { flow: 1 }, "sine.out");
  const cBar = label({ title: "Barre de cuivre", sub: "Tout le courant", x: 142, y: 520, align: "start", anchor: A.bar });
  cBar.show(tl, t.flow - 0.05);
  cBar.hide(tl, t.p2 - 0.42);
  const upAt = t.p2 - 0.12;
  shot(diveAt + diveLen, span(diveAt + diveLen, upAt), FLOW_ON, "sine.inOut"); // (slower than the dashes: they still run ahead of it)

  /* ── "Un piston." — up from the bar to what hangs over its middle ── */
  const upLen = span(upAt, t.piston);
  shot(upAt, upLen, PISTON, "sine.inOut", FLOW_ON.d);
  light(upAt, upLen, [0, 9, 0], 7);
  st(upAt, 0.4, { flow: 0.6 }, "sine.inOut"); // (from close, full dashes on the bright bar are a stick of rock; lower still, they wash out to pink)
  st(t.p2 + 0.1, 0.3, { litPiston: 1 }, "sine.out");
  const cPiston = label({ title: "Piston", sub: "En plastique", x: 340, y: 800, align: "end", anchor: A.piston });
  cPiston.show(tl, t.p2 + 0.15);
  cPiston.hide(tl, t.p3 - 0.4);

  /* ── "Et derrière lui… une charge." — the camera climbs the piston's back; the charge lights up on its word ── */
  const climbLen = span(t.derriere, t.p3 + 0.1);
  shot(t.derriere, climbLen, CHARGE, "sine.inOut");
  light(t.derriere, climbLen, [0, 10.5, 0], 7);
  st(t.p3 + 0.1, 0.3, { litPiston: 0 }, "sine.inOut");
  st(t.p3 + 0.2, 0.3, { litCharge: 1 }, "sine.out");
  const cCharge = label({ title: "Charge", sub: "Pyrotechnique", x: 700, y: 640, align: "start", anchor: A.charge });
  cCharge.show(tl, t.p3 - 0.1); // (drawn on "une": its name is up as the voice says it)
  cCharge.hide(tl, t.torepos + 0.1);
  shot(t.derriere + climbLen, span(t.derriere + climbLen, t.torepos), CHARGE_ROUND, "sine.inOut");

  /* ── "Un fusible ordinaire attend que ça chauffe :" — ours closes again, without its housing; the current runs ── */
  // (the housing goes while it is still behind the header; the charge and the piston come down, the camera with them)
  const closeLen = span(t.torepos, t.fusible + 0.4);
  st(t.torepos, 0.22, { lid: 0 }, "sine.inOut");
  st(t.torepos + 0.12, 0.25, { litCharge: 0 }, "sine.inOut");
  st(t.torepos + 0.12, Math.max(0.3, closeLen - 0.12), { explode: 0 }, "none");
  shot(t.torepos, closeLen + 0.15, REPOS, "sine.inOut");
  light(t.torepos, closeLen, [0, 7.5, 0], 8);
  // …and the ordinary fuse counts in the top slot: its seconds run away on "trois minutes" — in ours, nothing moves.
  // 200 s (Mersen's example), written as the voice says it: 3:20. (The chip is set in capitals: "200 S" read as "2005".)
  D.chip("chip-normal", null, 96, 470, t.fusible, t.order0 - 0.16);
  D.readout("normal-v", (time) => {
    const s = Math.round(200 * Math.pow(ramp(time, t.heat, t.minutes), 2));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  });
  shot(t.torepos + closeLen + 0.15, span(t.torepos + closeLen + 0.15, t.lui - 0.1), REPOS_NEAR, "sine.inOut");

  /* ── "Lui n'attend qu'un ordre." — up to the charge and its plug: they light up on the word ── */
  const riseLen = span(t.lui - 0.1, t.toseuil); // (it lands as the threshold starts: the camera never rests)
  shot(t.lui - 0.1, riseLen, ORDER, "sine.inOut");
  light(t.lui - 0.1, riseLen, [0, 9, 0], 7);
  st(t.order0, 0.3, { litCharge: 0.7 }, "sine.out");
  D.chip("chip-ordre", null, 96, 470, t.order0, t.explosion - 0.15);

  /* ── the threshold — "Abonne-toi : l'explosion sous ton plancher, on te la montre en entier." ── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: the camera keeps closing in on
  // the charge, behind the piston, and the charge breathes — slowly: in, out, in again, up to the cut. On "entier" the
  // header's clock answers; in the last frames a light swells under the can: act 3 cuts on it.
  followCall(tl, { from: t.seuil, to: Math.min(t.end + 0.15, t.tozero - 0.1) });
  const last = span(t.toseuil, t.tozero - 0.03);
  shot(t.toseuil, last, ARMED, "sine.inOut", ORDER.d);
  [1, 0.55, 1].forEach((litCharge, i) => st(t.toseuil + (last * i) / 3, last / 3, { litCharge }, "sine.inOut"));
  const swell = Math.min(0.45, last / 3);
  st(t.tozero - 0.03 - swell, swell, { fire: 0.3 }, "power2.in"); // (STAGED puts it out on act 3's cut)
  const beat = Math.min(0.4, Math.max(0.1, t.tozero - t.entier - 0.34));
  tl.to("#hud-clock", { scale: 1.16, color: "#5cffb0", duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%" }, t.entier);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: beat, ease: "power2.out" }, t.entier + 0.2);
  // what act 3's cut does not set (STAGED has no lit*): the fuse goes back into the car with nothing lit
  now(t.tozero, { ...UNLIT });
}
