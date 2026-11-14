// CR03 — acte1.js · 01 L'HEURE — accroche → principe (0 → toreservoir). Starts from POSE0 and FIRST (no cut); hands over at
// `toreservoir`, the runway seen from above, the aircraft past V1 and rotating, the stopping bar red.
//   accroche  POSE0 (three-quarter rear, the fire trailing the whole length): the aircraft rolls away and pitches up, the camera
//             rides along it; « feu »: the fire swells (punch). Cut on « 16 » to the other side of the fire: ahead of it, low on its
//             left, it comes at you — a FIXED camera that pans as it passes (the profile, the trail behind it); « Trop »: it leaves
//             the ground; punch « freiner »
//   promesse  cut on « Il te reste »: close, ahead-left under the wing; the camera glides under the left wing (VIEW.aile on
//             « aile »): the state goes back an instant before the rupture; « réservoir »: tank 5 red; « ouvert »: the panel goes,
//             the kerosene pours, the fire takes; « l'intérieur »: the red circle on the tank (punch); « Comment ? » the jet beats
//   principe  cut to the runway from above and behind (fs ≈ 6 000), clean: the aircraft at the start of its roll, the green stopping
//             bar ahead of it; « V1 » the line draws across (punch); the bar grows, ends before the runway's end (« Avant elle »);
//             the nose gear crosses the line ON « Après »: the bar reaches the end and turns red (punch « non-retour »); « tu
//             décolles »: it rolls on, the camera turns to keep it and the red bar; « 150 »: the chip, a slow pull-back
// The aircraft moves: every camera aim and the light are worked out from its state at the key's instant (onPlane), the same
// piecewise-linear law the tweens follow — the subject stays where the frame puts it.
import { SET, VIEW, POSE0, onPlane, lit } from "./world.js";
import { feutre } from "@kit/reconstitution.js";

const R2D = 180 / Math.PI;
/** A pose from a camera point C looking at T (complete with `o`). */
const toward = (C, T, o = {}) => {
  const dx = C[0] - T[0], dy = C[1] - T[1], dz = C[2] - T[2];
  const d = Math.hypot(dx, dy, dz);
  return { tx: T[0], ty: T[1], tz: T[2], d, az: Math.atan2(dx, dz) * R2D, el: Math.asin(dy / d) * R2D, ...o };
};
const aim = (pt) => ({ tx: pt[0], ty: pt[1], tz: pt[2] });
/** The aircraft's state at `time` along piecewise-linear keys [[time, { run, alt, pitch }], …]. */
const planeAt = (keys, time) => {
  if (time <= keys[0][0]) return { bank: 0, ...keys[0][1] };
  for (let i = 1; i < keys.length; i++) {
    const [t1, b] = keys[i];
    if (time <= t1) {
      const [t0, a] = keys[i - 1];
      const u = (time - t0) / (t1 - t0);
      return { bank: 0, run: a.run + (b.run - a.run) * u, alt: a.alt + (b.alt - a.alt) * u, pitch: a.pitch + (b.pitch - a.pitch) * u };
    }
  }
  return { bank: 0, ...keys.at(-1)[1] };
};

export default function acte1({ D, world }) {
  const { st, now, cut, path, punch, chip } = D;
  const t = D.times({
    choc: "choc", seize: "accroche:16", trop: "accroche:Trop", freiner: "accroche:freiner",
    promesse: "promesse", aile: "promesse:aile", reservoir: "promesse:réservoir", ouvert: "promesse:ouvert",
    interieur1: "interieur1", comment: "promesse:Comment",
    toprincipe: "toprincipe", vun: "vun", avant: "principe:Avant", apres: "apres", non: "principe:non",
    decolles: "principe:décolles", ce: "principe:Ce", cent: "principe:150", toreservoir: "toreservoir",
  });
  D.captionStyle({ hit: 0.12 });

  const c1 = t.seize - 0.1; // cut: the other side of the fire
  const c2 = t.promesse - 0.12; // cut: under the wing
  const c3 = t.toprincipe; // cut: the runway from above

  /* ── THE AIRCRAFT, 0 → toprincipe: ≈ 290 /s (rotation), lift-off on « Trop », then slower under the wing (an explanation) ── */
  const PK = [
    [0, { run: 10300, alt: 0, pitch: 2 }],
    [t.choc, { run: 10700, alt: 0, pitch: 5 }],
    [c1, { run: 10860, alt: 0, pitch: 6 }],
    [t.trop - 0.2, { run: 11200, alt: 0, pitch: 7.5 }],
    [t.trop + 0.6, { run: 11420, alt: 6, pitch: 8.5 }],
    [c2, { run: 11580, alt: 9, pitch: 9 }],
    [c3, { run: 11580 + (c3 - c2) * 130, alt: 20, pitch: 10 }],
  ];
  const at = (time) => planeAt(PK, time);
  for (let i = 1; i < PK.length; i++) {
    const [t0] = PK[i - 1], [t1, s] = PK[i];
    // the light rides with it: on the whole aircraft until c2, then on tank 5 under the wing
    const L = t1 <= c2 ? lit(onPlane(s, [0, 20, 0]), 160) : lit(onPlane(s, [-12, 12, 16]), 90);
    st(t0, t1 - t0, { ...s, ...L }, "none");
  }

  /* ── « Ton Concorde décolle en feu » — POSE0, the camera rides along (a little slower than it: it pulls ahead in the frame) ── */
  st(t.choc, 0.3, { fire: 1 }, "power2.out");
  const rear = (time, o) => {
    const s = at(time);
    return { ...aim(onPlane(s, [60 + 0.05 * (s.run - 10300), 25, 0])), ...o };
  };
  path([
    [0, POSE0],
    [t.choc, rear(t.choc, { d: 860, az: 45, el: 4.6 })],
    [c1, rear(c1, { d: 830, az: 42, el: 4.3 })],
  ]);
  punch(t.choc, 0.06, { hold: 0.12, down: 0.3 }); // let go before the cut at « 16 »

  /* ── « 16 h 43. Trop tard pour freiner. » — ahead of it, low on its left: it comes at you and lifts off; the camera stands
     (it creeps along with it) and pans as it passes, to its profile and the trail behind ── */
  // retouche 13/11: closer (≈ 1 350 → 940 instead of 1 700) and it really passes: the camera stands 1 000 ahead of it and 900 to
  // its left, low; it comes at you, swings by in three-quarter front → almost profile, the fire streaming behind it as a trail
  const P1 = onPlane(at(c1), [-30, 22, 0]);
  // the camera dollies TOWARD it (120 /s) while it charges: it grows from ≈ 65 % of the width, passes abreast and leaves on its
  // rear three-quarter, the fire a streak behind it (az −51 → −20 on « Trop » → +19)
  const panAt = (time, local, o) => toward([P1[0] - 800 + 120 * (time - c1), 30, P1[2] + 650], onPlane(at(time), local), o);
  const CH0 = panAt(c1, [-40, 22, 0], { fov: 30, shift: 60 });
  cut(c1, SET.PISTE, CH0, {});
  path([
    [c1, CH0],
    [t.trop, panAt(t.trop, [-10, 22, 0], { fov: 44, shift: 50 })],
    [c2, panAt(c2, [50, 22, 0], { fov: 50, shift: 40 })],
  ]);
  punch(t.freiner, 0.06, { hold: 0.12, down: 0.35 });

  /* ── « Il te reste 78 secondes. Et sous ton aile, le réservoir s'est ouvert… de l'intérieur. Comment ? » ──
     close under the left wing; the state an instant before the rupture, then the panel goes on « ouvert » */
  const WING = [-16, 12, 18]; // VIEW.aile's point: tank 5, the gear, the root of the trail
  const wingAt = (time, o) => ({ ...aim(onPlane(at(time), WING)), ...o });
  const UW0 = wingAt(c2, { d: 210, az: -26, el: -4, fov: 32, shift: 20 });
  // retouche 13/11: the fire low until the jet has been seen pale (it read as an orange glow), and the camera swings to the SIDE
  // after « ouvert » (az 22 → 2), so the jet streams back ACROSS the frame instead of toward the lens
  cut(c2, SET.PISTE, UW0, { tear: 0.25, leak: 0.2, fire: 0.02, culprit: 0, fault: 0 });
  path([
    [c2, UW0],
    [t.promesse + 0.9, wingAt(t.promesse + 0.9, { d: 150, az: -2, el: -5, fov: 33, shift: 10 })],
    [t.aile, wingAt(t.aile, { d: VIEW.aile.d, az: VIEW.aile.az, el: -12, fov: VIEW.aile.fov, shift: 0 })],
    [t.ouvert, wingAt(t.ouvert, { d: 105, az: 22, el: -12 })],
    // « ouvert »: the camera recoils to the side without letting go of the tank — the jet pours out and streams back, then takes fire
    [t.interieur1, wingAt(t.interieur1, { d: 190, az: 9, el: -8, side: 120 })],
    [t.comment, wingAt(t.comment, { d: 225, az: 5, el: -7, side: 150 })],
    [c3, wingAt(c3, { d: 240, az: 2, el: -7, side: 160 })],
  ]);
  now(t.reservoir, { culprit: 2 });
  st(t.reservoir, 0.15, { fault: 1 }, "power2.out");
  st(t.ouvert, 0.3, { tear: 1 }, "power2.in");
  st(t.ouvert + 0.1, 0.5, { leak: 1 }, "power2.out");
  st(t.interieur1 + 0.3, 1.0, { fire: 1 }, "sine.inOut");
  feutre(D, { id: "feutre-tank5", anchor: world.concorde.A.tank5, kind: "circle", w: 210, h: 150, from: t.interieur1, to: c3 - 0.15 });
  punch(t.interieur1, 0.06);

  /* ── « D'abord, une règle : V1. Une vitesse. Avant elle, tu peux encore freiner. Après, c'est le point de non-retour : tu
     décolles, quoi qu'il arrive. Ce jour-là, V1, c'est 150 nœuds. » — the runway from above and behind ── */
  // retouche 13/11: no longer the runway from very high (the aircraft ≈ 15 px): a CHASE from above, behind it on its left — the
  // Concorde ≈ 30 % of the width, the runway, the green bar and the V1 line ahead of it in perspective, the ground streaming by;
  // the camera slides round from three-quarter rear (az 66) toward its flank (az 42) as it rotates. Aims follow its roll (the
  // same piecewise-linear law as the `run` tweens below, the sine of the `pitch` tween).
  const RK = [[c3, 2500], [t.apres, 6200], [t.decolles + 0.9, 8900], [t.toreservoir, 11300]];
  const runAt = (time) => {
    if (time <= RK[0][0]) return RK[0][1];
    for (let i = 1; i < RK.length; i++) if (time <= RK[i][0]) return RK[i - 1][1] + (RK[i][1] - RK[i - 1][1]) * (time - RK[i - 1][0]) / (RK[i][0] - RK[i - 1][0]);
    return RK.at(-1)[1];
  };
  const p0 = t.ce + 0.6;
  const rollAt = (time) => ({ run: runAt(time), alt: 0, bank: 0, pitch: time <= p0 ? 0 : 3.5 * (1 - Math.cos(Math.PI * Math.min(1, (time - p0) / (t.toreservoir - p0)))) });
  const chase = (time, o) => ({ ...aim(onPlane(rollAt(time), [-40, 16, 0])), fov: 32, el: 14, ...o });
  const glow = (time) => lit(onPlane(rollAt(time), [-450, 0, 0]), 1600); // the light on it and the runway just ahead
  const RW = chase(c3, { d: 1350, az: 80, shift: -60 });
  cut(c3, SET.PISTE, RW, {
    ...glow(c3),
    run: 2500, alt: 0, pitch: 0, bank: 0, n1: 1, n2: 1, n3: 1, n4: 1, gear: 1,
    burst: 0, chunk: 0, surge: 0, cutaway: 0, tear: 0, leak: 0, fire: 0,
    stop: 1, v1: 0, ruler: 0, found: 0, soot: 0, traj: 0, bourget: 0, inspect: 0,
    culprit: 0, fault: 0, ok: 0, depuis: 0, gauge: 0, debit: 0, mark: 0,
  });
  // the roll: the nose gear on the V1 line exactly on « Après » (RUN.v1 6 200), then on, rotating at the end (« tu décolles »)
  st(c3, t.apres - c3, { run: 6200 }, "none");
  st(t.apres, t.decolles + 0.9 - t.apres, { run: 8900 }, "none");
  st(t.decolles + 0.9, t.toreservoir - t.decolles - 0.9, { run: 11300 }, "none");
  st(t.ce + 0.6, t.toreservoir - t.ce - 0.6, { pitch: 7 }, "sine.inOut");
  st(t.vun - 0.05, 0.5, { v1: 1 }, "power2.out");
  // the light rides with it (the same law as `run`)
  for (let i = 1; i < RK.length; i++) st(RK[i - 1][0], RK[i][0] - RK[i - 1][0], glow(RK[i][0]), "none");
  path([
    [c3, RW],
    [t.vun, chase(t.vun, { d: 1350, az: 78, shift: -60 })], // the V1 line far ahead, just under the header
    [t.avant, chase(t.avant, { d: 1350, az: 75, shift: -60 })],
    [t.apres, chase(t.apres, { d: 1300, az: 70, shift: -60 })], // the nose crosses the line, close
    // side: its tail out of TikTok's button column (x > 905)
    [t.decolles, chase(t.decolles, { d: 1350, az: 62, shift: -50, side: 50 })],
    [t.ce, chase(t.ce, { d: 1450, az: 55, shift: -40, side: 70 })],
    [t.toreservoir, chase(t.toreservoir, { d: 1600, az: 48, el: 15, shift: -30, side: 80 })], // the slow pull-back as it rotates
  ]);
  punch(t.vun, 0.06);
  punch(t.non, 0.06);
  punch(t.cent, 0.06, { hold: 0.15, down: 0.4 }); // let go before the cut of acte 2
  chip("chip-v1", null, 96, 470, t.cent - 0.1, t.toreservoir - 0.1);
}
