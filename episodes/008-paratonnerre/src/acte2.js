// 02 · AUTOPSIE — "Alors… on l'ouvre." The top of the rod, alone on the house while the storm fades round it; the
// same rod on the bench, at the same place of the picture (benchCut); the kit opens into a row and each part has
// its shot on its word. Then back on the house, at the foot of the stake: the ground charges, and the camera
// climbs the conductor with that charge, in one move, to the top of the rod — where the field gathers. It is the
// way the current will take down in act 3.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, BENCHED, STAGED, ROD, KIT } from "./world.js";

// where the rod stands on the house, counted from where it stands on the bench
const HOME = ROD.tip.map((v, i) => v - KIT.tip[i]);
// the bench's light, stood round the rod on the house: the metal is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
/* ── on the house ── */
const TIP = { ...P, tx: ROD.tip[0], ty: ROD.tip[1] - 40, tz: ROD.tip[2], d: 420, az: -40, el: 4, shift: 120 }; // the cut to the bench leaves from here
const TIP_FAR = { ...TIP, d: 520 };
const FOOT = { ...P, tx: -300, ty: 60, tz: 380, d: 2500, az: -38, el: 8, shift: 150 }; // the corner of the house from the lawn: you at the window, the conductor down the wall, the stake under the grass
const EARTH = { ...P, tx: -400, ty: -150, tz: 420, d: 1900, az: -40, el: 13, shift: 110 }; // the stake in the ground, from above the lawn
const TOP = { ...P, tx: ROD.tip[0], ty: ROD.tip[1], tz: ROD.tip[2], d: 900, az: -44, el: -8, shift: 30 }; // the top of the rod, low in the picture: the field comes down on it
// from under the top of the rod, looking up: over it, a millisecond away, the head of the leader (the hook's own picture, at 6 s)
const UNDER = { ...P, tx: ROD.tip[0], ty: ROD.tip[1] + 20, tz: ROD.tip[2], d: 760, az: -52, el: -45, fov: 36, shift: -10, side: 40 };
/* ── on the bench ── */
const ROW = { ...P, tx: KIT.open[0], ty: 40, tz: KIT.open[2], d: 448, az: -40, el: 10, shift: 160 }; // the three parts, side by side
const ROD_PART = { ...P, tx: KIT.openTip[0], ty: KIT.openTip[1] - 36, tz: KIT.openTip[2], d: 370, az: -40, el: 8, shift: 132 };
// aimed 3 cm to the right of the wire, and no wider: the rod, on its left, stays out of the picture (it would climb behind the header)
const WIRE_PART = { ...P, tx: -13, ty: 45, tz: -6.4, d: 205, az: -40, el: 8, shift: 140 };
const WIRE_NEAR = { ...WIRE_PART, d: 186 }; // no nearer: the part would leave the subject's zone
const STAKE_PART = { ...P, tx: 0, ty: 19, tz: 2.95, d: 205, az: -40, el: 10, shift: 140 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({ ouvre: "ouvre", totip: "totip", tobench: "tobench", explode: "explode", p1: "p1", p2: "p2", p3: "p3", whole: "whole", toground: "toground", ground: "ground", climb: "climb", top: "top" });
  setAct(tl, 2, t.ouvre);

  /* ── "Alors…" — the top of the rod, on the house. Time is stopped; the storm and the house fade round it ── */
  cut(t.totip, SET.STORM, TIP_FAR, { ...STAGED, ...LIT });
  shot(t.totip + 0.02, t.tobench - t.totip - 0.02, TIP, "sine.inOut", TIP_FAR.d);
  st(t.totip + 0.08, 0.56, { shell: 0, inside: 0, sky: 0, cloud: 0, rain: 0, charge: 0 }, "sine.inOut");
  st(t.totip + 0.08, 0.45, { mood: 0 }, "sine.inOut");

  /* ── "…on l'ouvre." — the same rod on the bench, at the same place of the picture; then the kit opens into a row ── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: TIP, origin: HOME, state: { ...BENCHED, pool: 0, grid: 0 } });
  // the picture holds through the cut; then the camera follows the rod down — after it, or its top would pass behind the header
  st(t.explode, 1.05, { explode: 1 }, "none");
  shot(t.explode + 0.27, 1, ROW, "sine.inOut", bench.d);

  /* ── "Une tige." ── */
  shot(t.p1 - 0.17, 0.55, ROD_PART, "sine.inOut", ROW.d);
  st(t.p1, 0.3, { litRod: 1 }, "sine.out");
  const cRod = co.add({ title: "Tige", sub: "Capture", x: 400, y: 600, align: "end", tone: "system", anchor: world.kit.A.tip });
  cRod.show(tl, t.p1 + 0.05);
  cRod.hide(tl, t.p2 - 0.36);

  /* ── "Un fil de cuivre, gros comme un crayon." — and the camera closes in: its thickness is the subject ── */
  shot(t.p2 - 0.1, 0.65, WIRE_PART, "sine.inOut", ROD_PART.d);
  st(t.p2 - 0.05, 0.3, { litRod: 0 }, "sine.inOut");
  st(t.p2 + 0.05, 0.3, { litWire: 1 }, "sine.out");
  const cWire = co.add({ title: "Fil de cuivre", sub: "Ø 8 mm", x: 360, y: 600, align: "end", tone: "system", anchor: world.kit.A.wire });
  cWire.show(tl, t.p2 + 0.2);
  cWire.hide(tl, t.p3 - 0.36);
  shot(t.p2 + 0.75, t.p3 - t.p2 - 0.9, WIRE_NEAR, "sine.inOut", WIRE_PART.d);

  /* ── "Un piquet dans la terre." ── */
  shot(t.p3 - 0.1, 0.65, STAKE_PART, "sine.inOut", WIRE_NEAR.d);
  st(t.p3 - 0.05, 0.3, { litWire: 0 }, "sine.inOut");
  st(t.p3 + 0.05, 0.3, { litStake: 1 }, "sine.out");
  const cStake = co.add({ title: "Piquet de terre", sub: "2,5 m dans le sol", x: 650, y: 600, align: "start", tone: "system", anchor: world.kit.A.stake });
  cStake.show(tl, t.p3 + 0.25);
  cStake.hide(tl, t.whole - 0.36);

  /* ── "C'est tout." — the whole row, bare: nothing lit, nothing written, nothing moves ── */
  st(t.whole - 0.05, 0.35, { litStake: 0 }, "sine.inOut");
  shot(t.whole - 0.05, 0.8, ROW, "sine.inOut", STAKE_PART.d);

  /* ── "Sous l'orage, le sol se charge…" — back on the house, at the foot of the stake ── */
  // the three parts just named, at their place: the cut lands on the corner of the house, and the camera sinks to the stake
  cut(t.toground, SET.STORM, FOOT, { ...STAGED, charge: 0, climb: 0, explode: 0, fx: -320, fy: 40, fz: 400, fs: 420 });
  shot(t.toground + 0.02, 1.45, EARTH, "sine.inOut", FOOT.d);
  st(t.toground + 0.02, 1.45, { fx: -400, fy: -120, fz: 420, fs: 340 }, "sine.inOut");
  st(t.ground, 1.1, { earth: 0.22 }, "sine.out"); // the ground lights up round the stake, and the stake with it (0.22: the widest ring still holds in the picture)
  st(t.toground + 0.45, 1.1, { shell: 0.28, inside: 0.1 }, "sine.inOut"); // once seen, the house steps back (it rises behind the header): from here on the light is what the eye follows
  st(t.ground + 0.4, 0.9, { charge: 0.7 }, "sine.inOut"); // (`climb` is 0: only the stake is lit — the charge has not left the earth yet)

  /* ── "…et cette charge grimpe jusqu'au sommet de la tige." — one move, from the ground to the top ── */
  const rise = t.climb - 0.52;
  const LIFT = 2.15;
  shot(rise, LIFT, TOP, "sine.inOut", EARTH.d);
  st(rise + 0.05, 0.7, { earth: 0 }, "sine.in"); // the rings close back on the stake as the camera leaves: what the ground gathered goes up
  st(t.climb - 0.1, 1.3, { charge: 1 }, "sine.inOut");
  st(rise + 0.12, LIFT - 0.3, { climb: 1 }, "sine.inOut"); // its front climbs the wire, and the camera climbs with it
  // (the house goes out for the climb: grazed at this speed, its roof was a grey smear across the picture — the eye has one thing to follow, the light)
  st(rise, 0.45, { shell: 0.05, inside: 0 }, "sine.inOut");
  st(rise, LIFT * 0.5, { fy: 500, fz: 200, fs: 700 }, "sine.in");
  st(rise + LIFT * 0.5, LIFT * 0.5, { fy: ROD.tip[1] - 40, fz: 0, fs: 110 }, "sine.out");
  // (the day the conductor's dashes can melt into a plain line — a `dash` number in world.js — they do while the camera runs along them)
  if ("dash" in D.S) {
    st(rise + 0.2, 0.4, { dash: 0 }, "sine.inOut");
    st(rise + LIFT - 0.7, 0.6, { dash: 1 }, "sine.inOut");
  }
  st(t.top, 1.3, { field: 1 }, "sine.inOut");

  /* ── the threshold — "Abonne-toi : ce millième de seconde, on te le montre en entier." ── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: from the top of the rod the
  // camera tips up to what hangs over it — the head of the leader, the millisecond of the hook — and the header's
  // clock answers the word. Act 3 cuts to the sky from there.
  const s = D.times({ seuil: "seuil", ms: "ms", end: "seuil$", tozero: "tozero" });
  followCall(tl, { from: s.seuil, to: Math.min(s.end + 0.15, s.tozero - 0.1) });
  shot(s.seuil - 0.2, s.tozero - s.seuil + 0.15, UNDER, "sine.inOut");
  st(s.seuil - 0.2, 1.1, { field: 0.3 }, "sine.inOut"); // the field's lines thin out: what the eye must find now is the head above
  st(s.seuil - 0.2, 1.4, { fy: ROD.tip[1] + 60, fs: 200 }, "sine.inOut");
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, color: "#5cffb0", duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%" }, s.ms);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.5, ease: "power2.out" }, s.ms + 0.9);
}
