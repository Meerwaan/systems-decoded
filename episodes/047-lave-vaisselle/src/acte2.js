// 02 · AUTOPSIE (bench) — from « Alors… » to torepos: « …on l'ouvre », the exploded view along the water, the principle.
//
// On « Alors… » the tub and the kitchen melt around the circuit (act 1's last shot, close on the arm under the dish).
// Cut at tobench: the same circuit, at the same place of the picture, alone on its pool of light, dry. On « on » it
// comes apart and the camera pulls back to the whole column. Then the camera follows the water, part by part, each on
// its word: the valve opens and its stream arcs out (« électrovanne »); it falls into the sump, which fills a little
// (« puisard ») — never more than the sump — through its three filters (« filtres »); the pump wakes and the round
// starts from the sump to the tube (« pompe »); the camera climbs to the top of the column, the arm alone, its jets
// up, turning (« le bras d'aspersion »). « Pourquoi ça lave ? »: the circuit closes up, the camera pulls back under
// the Sinner panel; each lever lights its part on its word (the heater, the clock, the trap, the jets) and on « baisse »
// the heat pales while the time arc grows — the circle stays full. The panel has left before torepos (act 2b cuts).
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, BENCH_FROM, LOOK } from "./world.js";

/* ── poses, bench coordinates (plan point p at p − BENCH_FROM) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const EXPL = { ...VIEW.exploded, ty: 34, d: 290, shift: 70 };//                                                       the whole column, every part apart
const EXPL1 = { ...VIEW.exploded, ty: 35, d: 240, shift: -95, side: 45 }; // retouche: the column ≈ 55 % of the height, arm under the header, sump above 1600
const SUMP2 = { ...P, tx: -3, ty: 11, tz: 4, d: 110, az: -55, el: 24, shift: -30 }; //  retouche: the sump whole and big, the stream falling in
const SUMP3 = { ...SUMP2, d: 102 }; //                                                   …a slow push
const VALVE = { ...P, tx: -24, ty: 9, tz: -10, d: 110, az: -40, el: 18, shift: 0, side: 60 }; //   the valve, its port, the stream
const FILT = { ...P, tx: 1, ty: 38, tz: 7, d: 150, az: -32, el: 8, shift: -90 }; //         the column of the three filters
const PUMPV = { ...P, tx: 17, ty: 9, tz: 6, d: 120, az: -26, el: 20, shift: 0 }; //       the pump, its motor, the tube
// retouche: the whole arm, three-quarter from above, sharp (dof 0), its jets under the chip, its tips above the captions
const ARMA = { ...P, tx: VIEW.arm.tx, ty: VIEW.arm.ty + 2.5, tz: VIEW.arm.tz, d: 210, az: -36, el: 36, shift: -28 };
const ARMV = { ...ARMA, d: 198, el: 38 }; //                                              …a slow push to the heart
const PRIN = { ...VIEW.principle, d: 185, el: 38, shift: 130 };//                                                        the circuit whole, under the panel
const PRIN2 = { ...PRIN, az: -30, el: 34, d: 194 }; //                                 …a slow orbit while the levers light

/* ── the light: what it stands around ── */
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_TALL = { fx: 0, fy: 36, fz: 0, fs: 60 }; // the exploded column

export default function acte2({ D }) {
  const { tl, st, now, shot, chip, punch } = D;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    enters: "eclate:entre", valve: "eclate:électrovanne", falls: "eclate:tombe", sump: "eclate:puisard",
    filters: "eclate:filtres", pump: "eclate:pompe", sends: "eclate:renvoie", end: "eclate:et", arm: "eclate:bras",
    principe: "principe", circle: "principe:cercle", sinner: "principe:Sinner",
    heat: "principe:chaleur", time: "principe:temps", product: "principe:produit", force: "principe:force",
    drops: "principe:baisse", make: "principe:compensent", torepos: "torepos",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── « Alors… » — the tub and the kitchen melt around the circuit (act 1's shot goes on) ───────────── */
  st(t.ouvre - 0.05, t.tobench - t.ouvre + 0.05, { shell: 0, room: 0 }, "sine.inOut");

  /* ───────────── « …on l'ouvre. » — the same circuit on the bench, dry; it comes apart on « on » ───────────── */
  const T0 = 20.31; // the arm's angle on the bench (cumulative: it only turns from « bras »); reads the same every half turn
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCH_FROM,
    state: { ...BENCHED, turn: T0, water: 0, pump: 0, passes: 0, trap: 0, tab: 0, door: 0, sinner: 0, sHeat: 1, cycle: 1, ...L_WHOLE },
  });
  st(t.explode, 1.2, { explode: 1 }, "sine.inOut");
  shot(t.tobench + 0.02, t.enters - 0.3 - t.tobench, EXPL1, "sine.inOut", bench.d);
  st(t.tobench + 0.02, 1.2, L_TALL, "sine.inOut");

  /* ───────────── « L'eau entre par une électrovanne. » ───────────── */
  shot(t.enters - 0.3, t.valve + 0.5 - (t.enters - 0.3), VALVE, "sine.inOut", EXPL1.d);
  st(t.enters, 0.25, { litValve: 1 }, "sine.out");
  st(t.enters + 0.05, 1.3, { inlet: 1 }, "sine.out");
  chip("chip-vanne", null, 96, 470, t.valve - 0.1, t.falls - 0.42); // (gone before the cut onto the sump)

  /* ───────────── « Elle tombe au fond, dans le puisard, à travers ses filtres. » ───────────── */
  st(t.falls - 0.2, 0.3, { litValve: 0 }, "sine.inOut");
  // retouche: a cut a few frames before « Elle » onto the sump, whole, then a slow push (was a glide through an empty frame)
  D.cut(t.falls - 0.3, null, SUMP2);
  shot(t.falls - 0.28, t.sump + 0.2 - (t.falls - 0.28), SUMP3, "sine.inOut");
  st(t.falls, 1.4, { water: 0.6 }, "sine.out");
  st(t.sump - 0.05, 0.25, { litSump: 1 }, "sine.out");
  chip("chip-puisard", null, 96, 470, t.sump - 0.05, t.filters - 0.18);
  shot(t.sump + 0.2, t.pump - 0.2 - (t.sump + 0.2), FILT, "sine.inOut");
  chip("chip-filtres", null, 96, 470, t.filters - 0.04, t.pump - 0.15);
  punch(t.filters, 0.06);

  /* ───────────── « Une pompe l'aspire, la renvoie… » — the round starts from the sump ───────────── */
  st(t.pump - 0.2, 0.4, { litSump: 0, inlet: 0 }, "sine.inOut");
  shot(t.pump - 0.2, t.sends + 0.4 - (t.pump - 0.2), PUMPV, "sine.inOut");
  st(t.pump, 0.3, { pump: 1, litPump: 1 }, "sine.out");
  st(t.pump + 0.2, 0.5, { loop: 0.5 }, "sine.out");
  st(t.pump + 0.2, t.principe - (t.pump + 0.2), { passes: 0.4 * (t.principe - t.pump - 0.2) }, "none"); // ≤ 1/7 head gap per frame
  chip("chip-pompe", null, 96, 470, t.pump, t.end - 0.3); // (gone before the cut onto the arm)

  /* ───────────── « …et au bout, le bras d'aspersion. » — up the column to the heart ───────────── */
  // retouche: a cut before « et » onto the arm alone (the climb was a jerk), then a slow push; jets softer, the arm slower
  D.cut(t.end - 0.15, null, ARMA, { litPump: 0, loop: 0, solo: 1 });
  shot(t.end - 0.13, t.principe - 0.08 - (t.end - 0.13), ARMV, "sine.inOut", ARMA.d);
  st(t.arm - 0.15, 0.3, { litArm: 1, jets: 0.55 }, "sine.out");
  st(t.end - 0.1, t.arm - (t.end - 0.1), { turn: T0 + 0.125 }, "sine.in"); // from rest; three-quarter on « bras »
  st(t.arm, t.principe - 0.08 - t.arm, { turn: T0 + 0.125 + 0.23 * (t.principe - 0.08 - t.arm) }, "none"); // ≈ 0.23 turn per second
  st(t.principe - 0.08, 1.3, { turn: T0 + 0.7 }, "sine.out"); // (after the cut: the arm coasts down as the circuit closes up)
  chip("chip-coeur", null, 96, 470, t.arm - 0.05, t.principe - 0.24);

  /* ───────────── « Pourquoi ça lave ? » — cut back to the whole column; it closes up, the camera comes down under the panel ───────────── */
  // (a change of scale on the new question: the arm comes home in a frame that holds every part, never out of it)
  const close = t.principe - 0.08;
  D.cut(close, null, EXPL, { litArm: 0, solo: 0, jets: 0.3 });
  st(close + 0.02, 0.95, { explode: 0, jets: 0, ...L_WHOLE }, "sine.inOut");
  shot(close + 0.02, t.circle - 0.2 - (close + 0.02), PRIN, "sine.inOut", EXPL.d);
  shot(t.circle - 0.2, t.torepos - t.circle + 0.2, PRIN2, "sine.inOut");

  /* ───────────── « …le cercle de Sinner : quatre leviers. » ───────────── */
  st(t.circle - 0.1, 0.45, { sinner: 1 }, "sine.out");
  punch(t.sinner, 0.06);

  /* ───────────── « La chaleur, le temps, le produit, la force des jets. » — each lever lights its part ───────────── */
  // each word: its arc thickens and its name swells on the panel, while its part lights below
  // (the lever that speaks stands out: the three others step back to 0.3 until the four have been named)
  const ARCS = ["#sinner-heat", "#sinner-time", "#sinner-chem", "#sinner-force"];
  const lever = (arc, label, at) => {
    tl.to(ARCS.filter((a) => a !== arc), { opacity: 0.3, duration: 0.15, ease: "sine.out" }, at - 0.05);
    tl.to(arc, { opacity: 1, duration: 0.15, ease: "sine.out" }, at - 0.05);
    tl.fromTo(arc, { strokeWidth: 34 }, { strokeWidth: 50, duration: 0.14, ease: "power2.out", immediateRender: false }, at);
    tl.to(arc, { strokeWidth: 34, duration: 0.5, ease: "power2.out" }, at + 0.3);
    tl.fromTo(label, { scale: 1 }, { scale: 1.22, duration: 0.14, ease: "power2.out", immediateRender: false }, at);
    tl.to(label, { scale: 1, duration: 0.5, ease: "power2.out" }, at + 0.3);
  };
  lever("#sinner-heat", "#sinner-l-heat", t.heat);
  lever("#sinner-time", "#sinner-l-time", t.time);
  lever("#sinner-chem", "#sinner-l-chem", t.product);
  lever("#sinner-force", "#sinner-l-force", t.force);
  tl.to(ARCS, { opacity: 0.9, duration: 0.3, ease: "sine.inOut" }, t.force + 0.75); // the four together again: the circle
  st(t.heat - 0.05, 0.35, { heat: 1 }, "sine.out");
  // the time: the programme's clock jumps a minute, and pulses
  st(t.time, 0.2, { cycle: 2 }, "power2.out");
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.time);
  tl.to("#hud-clock", { scale: 1, duration: 0.36, ease: "power2.out" }, t.time + 0.3);
  st(t.product - 0.05, 0.3, { litTrap: 1 }, "sine.out");
  st(t.force - 0.1, 0.35, { jets: 0.75, litArm: 0.6 }, "sine.out");
  st(t.force - 0.2, 0.8, { turn: T0 + 0.9 }, "power1.in");
  st(t.force + 0.6, t.torepos - t.force - 0.6, { turn: T0 + 0.9 + 0.5 * (t.torepos - t.force - 0.6) }, "none");

  /* ───────────── « Si l'un baisse, les autres compensent. » — the heat pales, the time arc grows, the circle stays full ───────────── */
  st(t.drops - 0.05, 0.7, { sHeat: 0.4, heat: 0.08 }, "sine.inOut");
  lever("#sinner-time", "#sinner-l-time", t.drops + 0.3); // the time takes what the heat gives
  punch(t.make, 0.06);
  st(t.torepos - 0.62, 0.3, { sinner: 0 }, "sine.in");
}
