// CR03 — fin.js · 03 DEPUIS → the end (todepuis → end). Cuts in at `todepuis` on tank 5 as it failed; hands the film back to
// its first frame (POSE0, FIRST) on the last frame.
//   depuis    cut on « En 2001 »: tank 5 torn, red (BENCHED) — the light whitens, grid and halo go green, the red panel turns
//             green (`depuis` 0 → 1). Cut on « réservoirs »: the same tank whole, in the white light; « Kevlar »: the lining
//             settles (punch, the chip); « pneus »: the chip's second line — and the SAME hit comes in: the wall dents, the
//             front crosses the kerosene, the panel barely bulges… the wall holds (no tear)
//             cut on « Et à Roissy » (green to green): the whole runway from above, white light; « inspections »: the van
//             sweeps it, the runway and its edge lights wash green behind it; « 3 »: the third tick lights green (punch)
//   comment   cut on « Pour le BEA »: back on the day (`depuis` 0) — the aircraft on fire past the strip, the V1 line behind it;
//             « aucune manœuvre »: its stopping bar grows ahead of it and turns red past the runway's end ON « aucune » (punch)
//             — the camera rises behind it to show the bar run off the runway. « Toi, en commentaire »: the duel
//             cut on « Concorde qui revole »: the same aircraft, clean, in the white light of 2001, its wing tanks green (`ok`);
//             it lifts off on « revole » and climbs away, the camera rides along it from ahead-left to behind-left
//   abo       the same ride: the gear comes up (it did not, that day); the next file over it, then the loop
//   boucle    cut on « Tout s'est joué »: the runway, FIRST, the aircraft 580 units short of its first-frame place, rolling at
//             the first frame's speed; the camera on the same line, a little farther back — both land on POSE0 / FIRST
// The aircraft moves: every camera aim and the light are worked out from its state at the key's instant (onPlane), the same
// piecewise-linear law the tweens follow.
import { duelCall, nextFile } from "@kit/blocks.js";
import { BENCHED, STAGED, SET, VIEW, POSE0, FIRST, AT, onPlane, lit } from "./world.js";

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
/** Lay the aircraft's keys as linear tweens, the light riding with it. */
const fly = (st, keys, local = [0, 20, 0], fs = 160) => {
  for (let i = 1; i < keys.length; i++) {
    const [t0] = keys[i - 1], [t1, s] = keys[i];
    st(t0, t1 - t0, { ...s, ...lit(onPlane(s, local), fs) }, "none");
  }
};

// every number the runway and the aircraft read, clean (a cut to the runway says all of them)
const CLEAN = {
  set: SET.PISTE, culprit: 0, fault: 0, ok: 0, gauge: 0, debit: 0, mark: 0,
  alt: 0, pitch: 0, bank: 0, n1: 1, n2: 1, n3: 1, n4: 1, gear: 1, burst: 0, chunk: 0, surge: 0, cutaway: 0, tear: 0, leak: 0, fire: 0,
  stop: 0, v1: 0, ruler: 0, found: 0, soot: 0, traj: 0, bourget: 0, inspect: 0,
};
// tank 5 whole (the cut inside the tank, `depuis`)
const WHOLE = { hit: 0, dent: 0, wave: 0, bulge: 0, tear: 0, gush: 0, kevlar: 0, kero: 1 };

export default function fin({ D }) {
  const { st, now, cut, path, shot, punch, chip, tl } = D;
  const t = D.times({
    todepuis: "todepuis", reservoirs: "depuis:réservoirs", kev: "kevlar", pneus: "depuis:pneus", et: "depuis:Et",
    insp: "inspections", trois: "depuis:3", jour: "depuis:jour",
    tocta: "tocta", touche: "comment:touché", aucune: "comment:aucune", empecher: "comment:empêcher",
    commentaire: "comment:commentaire", concorde: "comment:Concorde", revole: "comment:revole", remontes: "remontes", duelB: "duelB",
    toabo: "toabo", prochain: "abo:prochain", locomotive: "locomotive", toloop: "toloop", rewind: "rewind",
  });

  /* ── « En 2001… » — tank 5 as it failed; the light of 2001 heals it ── */
  const c1 = t.reservoirs - 0.1; // cut inside the tank: whole again
  const BAY = { ...VIEW.bay, d: 600, el: 8, shift: 250 }; // the tank AND its panel lying under it (at d 470 the panel sits at y ≈ 1 600)
  cut(t.todepuis, SET.RESERVOIR, BAY, { ...BENCHED, depuis: 0, ok: 0 });
  st(t.todepuis + 0.08, 0.9, { depuis: 1 }, "sine.inOut");
  path([
    [t.todepuis, BAY],
    [c1, { d: 560, az: -56, el: 10, shift: 240 }],
  ]);

  /* ── « …six de ses réservoirs sont doublés de Kevlar, ses pneus changent. » — the same tank, whole; the lining; the same hit ── */
  const IN = { ...VIEW.cede, az: -64, el: 6, shift: -130 }; // low in the frame: the chip takes the top slot
  cut(c1, SET.RESERVOIR, IN, { ...BENCHED, ...WHOLE, depuis: 1 });
  path([
    [c1, IN],
    [t.kev, { d: 360, az: -58, el: 5, shift: -120 }],
    [t.et - 0.12, { d: 400, az: -50, el: 4, shift: -110 }],
  ]);
  st(t.kev - 0.12, 0.45, { kevlar: 1 }, "power2.out");
  punch(t.kev, 0.06);
  chip("chip-kevlar", null, 96, 470, t.kev - 0.1, t.et - 0.3);
  tl.fromTo("#chip-kevlar i", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out", immediateRender: false }, t.pneus);
  tl.set("#chip-kevlar i", { opacity: 0 }, 0);
  st(t.pneus - 0.34, 0.34, { hit: 1 }, "power2.in"); // the tyre piece reaches the intrados on « pneus »
  st(t.pneus, 0.22, { dent: 1 }, "power2.out");
  st(t.pneus + 0.05, t.et - 0.25 - t.pneus, { wave: 1 }, "sine.inOut");
  st(t.pneus + 0.45, 0.3, { bulge: 0.2 }, "power2.out"); // …and the wall holds

  /* ── « Et à Roissy, les inspections de piste passent à 3 par jour. » — the runway from above, washed green by the van ── */
  const c2 = t.et - 0.12;
  const RUNWAY_MID = [-10500, 0, 0];
  const INS = { tx: -8000, ty: 0, tz: 0, d: 11000, az: 70, el: 50, fov: 30, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };
  cut(c2, SET.PISTE, INS, { ...CLEAN, alt: -100, run: 0, depuis: 0, ...lit(RUNWAY_MID, 4200) }); // depuis 0 here: in the green mood the wash is lost
  path([
    [c2, INS],
    [t.insp, { tx: -8800, d: 12200, az: 74, el: 54 }],
    [t.trois, { tx: -10000, d: 14000, az: 79, el: 59 }],
    [t.tocta - 0.02, { tx: -10500, d: 14600, az: 81, el: 61 }],
  ]);
  st(t.insp - 0.2, t.jour + 0.25 - (t.insp - 0.2), { inspect: 1 }, "sine.inOut");
  chip("chip-inspect", null, 96, 470, t.insp - 0.1, t.tocta - 0.3);
  tl.set(["#tick-1", "#tick-2", "#tick-3"], { color: "rgba(239, 234, 224, 0.58)", scale: 1 }, 0);
  tl.fromTo("#tick-3", { color: "rgba(239, 234, 224, 0.58)", scale: 1 }, { color: "#5cffb0", scale: 1.25, duration: 0.14, ease: "power2.out", immediateRender: false }, t.trois);
  tl.to("#tick-3", { scale: 1, duration: 0.3, ease: "power3.out" }, t.trois + 0.14);
  punch(t.trois, 0.06);

  /* ── « Pour le BEA, dès l'avion touché, aucune manœuvre… » — the day again: on fire, past the strip; braking ends past the runway ── */
  const BK = [
    [t.tocta, { run: 9300, alt: 0, pitch: 0 }],
    [t.concorde - 0.14, { run: 9300 + (t.concorde - 0.14 - t.tocta) * 260, alt: 0, pitch: 0 }],
  ];
  const bAt = (time) => planeAt(BK, time);
  cut(t.tocta, SET.PISTE, { ...aim(onPlane(bAt(t.tocta), [40, 20, 0])), d: 1000, az: 52, el: 7, fov: 30, shift: 40, side: 0, roll: 0, drift: 0, dof: 0 },
    { ...CLEAN, ...BK[0][1], ...lit(onPlane(BK[0][1], [0, 20, 0]), 160), depuis: 0, v1: 1,
      n2: 0.7, burst: 1, chunk: 1, surge: 0.3, tear: 1, leak: 1, fire: 1 });
  fly(st, BK);
  // the stopping bar: it grows ahead of the aircraft, turns red as its end passes the runway's end — on « aucune »
  const sRed = (time) => { const r = bAt(time).run; return (21075 - r) / (2.4 * r); };
  const g0 = t.aucune - 0.7, g1 = t.aucune + 0.5;
  st(g0, t.aucune - g0, { stop: sRed(t.aucune) }, "power1.in"); // its end reaches the runway's end ON « aucune »…
  st(t.aucune, g1 - t.aucune, { stop: 1 }, "power2.out"); // …and runs on past it, red
  path([
    [t.tocta, { ...aim(onPlane(bAt(t.tocta), [40, 20, 0])), d: 1000, az: 52, el: 7, fov: 30, shift: 40 }],
    [t.touche, { ...aim(onPlane(bAt(t.touche), [0, 20, 0])), d: 1150, az: 60, el: 10 }],
    [t.aucune, { ...aim(onPlane(bAt(t.aucune), [-300, 10, 0])), d: 1700, az: 82, el: 9, shift: -40 }],
    [t.commentaire, { ...aim(onPlane(bAt(t.commentaire), [-380, 10, 0])), d: 1850, az: 86, el: 10, shift: -40 }],
    [t.concorde - 0.16, { ...aim(onPlane(bAt(t.concorde - 0.16), [-420, 10, 0])), d: 1900, az: 88, el: 10, shift: -40 }],
  ]);
  punch(t.aucune, 0.06);
  duelCall(tl, { from: t.commentaire - 0.5, word: t.commentaire, aAt: t.remontes, bAt: t.duelB, to: t.toabo - 0.32, toneA: null, toneB: null });

  /* ── « …le Concorde qui revole en 2001… » → abo — clean, in the white light; it lifts off on « revole » and climbs away ── */
  const c3 = t.concorde - 0.14;
  const end = t.toloop - 0.02;
  const lift = t.revole;
  const FK = [
    [c3, { run: 11600, alt: 0, pitch: 7 }],
    [lift, { run: 11600 + (lift - c3) * 300, alt: 0, pitch: 9 }],
    [lift + 2, { run: 11600 + (lift + 2 - c3) * 300, alt: 40, pitch: 11 }],
    [end, { run: 11600 + (end - c3) * 300, alt: 40 + (end - lift - 2) * 24, pitch: 12 }],
  ];
  const fAt = (time) => planeAt(FK, time);
  // where the camera stands, relative to the aircraft (world axes: −x ahead, +z its left), and how high above the ground
  const ride = (time, [ox, oz], h) => {
    const s = fAt(time);
    const P = onPlane(s, [0, 0, 0]);
    return toward([P[0] + ox, Math.max(3, h), P[2] + oz], onPlane(s, [10, 12, 0]), { fov: 30, shift: -130, side: 0, roll: 0, drift: 0, dof: 0 });
  };
  const RK = [
    [c3, ride(c3, [-1150, 740], 9)],
    [lift + 0.9, ride(lift + 0.9, [-460, 1000], 14)],
    [t.toabo, ride(t.toabo, [180, 1080], fAt(t.toabo).alt - 25)],
    [t.locomotive, ride(t.locomotive, [700, 1120], fAt(t.locomotive).alt - 50)],
    [end, ride(end, [1100, 1180], fAt(end).alt - 65)],
  ];
  cut(c3, SET.PISTE, RK[0][1], { ...CLEAN, ...FK[0][1], ...lit(onPlane(FK[0][1], [0, 20, 0]), 160), depuis: 1, ok: 1 });
  fly(st, FK);
  path(RK);
  st(t.toabo + 0.6, 1.4, { gear: 0 }, "sine.inOut"); // the gear comes up — it did not, that day
  nextFile(tl, { showAt: t.toabo + 0.2, factAt: t.locomotive, hideAt: t.toloop - 0.38, railFrom: t.toabo + 0.1, railTo: t.toloop - 0.3 });

  /* ── « Tout s'est joué à la seconde… » — the runway, FIRST: it rolls into its first-frame place, the camera with it ── */
  const tEnd = D.tEnd;
  const V = 290; // the aircraft's speed on the first frames (acte1: 10 300 → 10 700 by « feu »)
  const runAt = (time) => AT.first.run - V * (tEnd - time);
  const camAt = (time) => {
    const k = tEnd - time;
    const s = { ...AT.first, run: runAt(time) };
    return { ...POSE0, ...aim(onPlane(s, [60 + 0.05 * (s.run - AT.first.run), 25, 0])), d: POSE0.d + 29 * k, az: POSE0.az + 2.2 * k, el: POSE0.el + 0.29 * k };
  };
  const s0 = { ...AT.first, run: runAt(t.toloop) }, s1 = { ...AT.first, run: runAt(t.rewind) };
  cut(t.toloop, SET.PISTE, camAt(t.toloop), { ...FIRST, run: s0.run, ...lit(onPlane(s0, [0, 20, 0]), 160) });
  st(t.toloop, t.rewind - t.toloop, { run: s1.run, ...lit(onPlane(s1, [0, 20, 0]), 160) }, "none");
  shot(t.toloop, t.rewind - t.toloop, camAt(t.rewind), "none");
  D.loop({ at: t.toloop, rewindAt: t.rewind, ease: "none" });
  void now; void STAGED;
}
