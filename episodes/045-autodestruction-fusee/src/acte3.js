// The chain at rest, the CNES watching, then 03 · RÉPONSE — torepos (39,22) → toverdict (63,61).
// Two places, two moves (docs/045-actes.md § acte3.js, docs/045-actes-maj.md), az DECREASING in both:
//   · the pad, ONE path: the chain armed in the bay of the rocket standing on its pad → the rocket whole → down and back
//     to the CNES booth behind its console (the screens low, the pad through the glass, the lift-off at H0+7) → a crane
//     up and out over the base as the corridor lights → under the rocket as it tips (« bascule »);
//   · cut `tozero`, ONE path: the bay at H0+36 (the two SRI alive) → down the rocket to its nozzles → back on the whole
//     rocket as it turns crossways → the boosters tearing away → the charge going off IN the frame (no cut on it: the
//     camera takes the knock) → the hull opening → a long pull-back on the rain of pieces near the pad.
// The rocket keeps flying: in the climax `climb` runs 0.95 → 1 to « s'arrachent » (H0+36 → H0+39), and every key aims
// at where the rocket IS at its instant (`onRocket` with the climb and the incidence of that instant).
// The order of the physics, never another: guide → gimbal → incid → tear/links → pulse → charge/blast → rip → debris.
import { setAct } from "@kit/overlay.js";
import { VIEW, ONPAD, STAGED, SET, LIGHT, DEG, CENTER, onRocket, ringPoint } from "./world.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
/** Where a pose's camera stands. */
const eyeOf = (p) => {
  const a = p.az * DEG;
  const e = p.el * DEG;
  return [p.tx + p.d * Math.sin(a) * Math.cos(e), p.ty + p.d * Math.sin(e), p.tz + p.d * Math.cos(a) * Math.cos(e)];
};
/** The pose of a camera standing at `C` and aiming at `T` (what a move's middle key is built from: the camera on a
 *  straight line between two poses, so that the move never swoops toward the subject and back). */
const aim = (C, T, o = {}) => {
  const dx = C[0] - T[0];
  const dy = C[1] - T[1];
  const dz = C[2] - T[2];
  const d = Math.hypot(dx, dy, dz);
  return { tx: T[0], ty: T[1], tz: T[2], d, az: Math.atan2(dx, dz) / DEG, el: Math.asin(dy / d) / DEG, ...o };
};
const target = (p) => ({ tx: p[0], ty: p[1], tz: p[2] });

/** The same eye, the same view, aimed `dist` away along it: the picture does not change, but a move from or to it no
 *  longer pumps (the path travels the distance by ratio: a near aim followed by a far one swoops toward the subject). */
const far = (p, dist, o = {}) => {
  const E = eyeOf(p);
  return aim(E, [E[0] + ((p.tx - E[0]) / p.d) * dist, E[1] + ((p.ty - E[1]) / p.d) * dist, E[2] + ((p.tz - E[2]) / p.d) * dist], { ...o });
};

/* ── the pad ── */
const P = { fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the rocket standing on its pad, its boosters' noses either side of the bay, the bay lit veille through the glass
// (retouche 08/11: at d 600 the chain was a green column in the glass, and the 15× pull to padOut in 1,4 s knocked)
const PAD_BAY = { ...VIEW.padBay, d: 4800, az: -24, el: -10, fov: 40, shift: 260, dof: 0 };
const PAD_OUT = { ...VIEW.padOut }; //                            the rocket whole on its pad
const PAD_OUT2 = { ...VIEW.padOut, d: 10200, az: -46 }; //       still pulling back as the Vulcain lights, into the cut
// behind the console: the two screens low, the pad through the glass — aimed far down the same ray (no pump)
const BOOTH = far(VIEW.booth, 11000, { fov: VIEW.booth.fov, shift: VIEW.booth.shift, side: 0, roll: 0, drift: 0.3, dof: 0 });
const BOOTH_EYE = eyeOf(VIEW.booth);
// a step back in the booth, the view tilting up a degree after the rocket: the screens stay in the frame to « seconde »
const BOOTH2 = (() => {
  const az = -61.5 * DEG;
  const el = 3.6 * DEG;
  const E = [BOOTH_EYE[0] - 45, BOOTH_EYE[1] + 15, BOOTH_EYE[2] + 30];
  return aim(E, [E[0] - 11000 * Math.sin(az) * Math.cos(el), E[1] - 11000 * Math.sin(el), E[2] - 11000 * Math.cos(az) * Math.cos(el)], { fov: 45, shift: -110 });
})();
const CORR = { ...VIEW.corridorView, az: -64 }; //          over the base: the band, the rocket climbing in it

/* ── the light ── */
const at = (climb, incid, p) => onRocket(climb, incid, p);
const lightOn = (p, fs) => ({ fx: p[0], fy: p[1], fz: p[2], fs });

export default function acte3({ D }) {
  const { tl, st, cut, path, punch, jolt, chip } = D;
  const t = D.times({
    torepos: "torepos", armee: "repos:Armée", attend: "repos:attend", kourou: "repos:Kourou", sauvegarde: "repos:sauvegarde",
    seconde: "repos:seconde$", regle: "repos:règle", couloir: "repos:couloir", bascule: "repos:bascule",
    tozero: "tozero", secondes: "zero:secondes", ses: "zero:Ses", lachent: "zero:lâchent", braquent: "zero:braquent",
    fond: "zero:fond$", travers: "zero:travers", plus: "zero:plus", vingt: "zero:vingt", degres: "zero:degrés$",
    tuyeres: "zero:tuyères", les: "reponse:Les", arrachent: "reponse:s'arrachent", charge: "reponse:charge", trigger: "trigger",
    coque: "reponse:coque", ouvre: "reponse:s'ouvre$", tout: "reponse:Tout", mangrove: "reponse:mangrove",
    savane: "reponse:savane", fin: "reponse$", toverdict: "toverdict",
  });

  /* ═══════════ the pad: « Armée avant l'allumage… » → « …ta fusée bascule » ═══════════ */
  cut(t.torepos, SET.SCENE, PAD_BAY, { ...ONPAD, corridor: 0, track: 0, arm: 0.6, salle: 0, alarm: 0 });
  // « Armée » : the rotor settles; the chain breathes veille (ONPAD: watch 1)
  st(t.armee, 0.5, { arm: 1 }, "power2.out");
  // the booth comes in while the camera is far from it (behind the camera at padOut); the insides go once the bay is a dot
  st(t.attend, 1.2, { salle: 1 });
  st(t.attend + 0.3, 0.6, { inside: 0, watch: 0 });
  // H0 on « Kourou » : the Vulcain lights on the table; H0+7 the boosters, and it leaves the pad (Lions: ≈ 30 s before H0+36,7)
  const lift = t.kourou + (7 / 32) * (t.bascule - t.kourou);
  st(t.kourou, 0.5, { burn: 0.3 }, "power1.out");
  st(lift, 0.35, { burn: 1 }, "power2.out");
  st(lift, 0.8, { trail: 1 }, "power1.out");
  const c1 = t.couloir + 0.8; // ≈ 46,5
  st(lift, c1 - lift, { climb: 0.6 }, "power1.in");
  st(c1, t.bascule - c1, { climb: 0.9 }, "none");
  st(t.bascule, t.tozero - t.bascule, { climb: 0.915 }, "power1.out");
  // « Sa règle : jamais hors du couloir » : the band lights on its word, the planned path drawn in the air
  st(t.couloir - 0.25, 0.9, { corridor: 1 }, "power2.out");
  st(t.couloir - 0.1, 1.0, { track: 1 }, "power1.out");
  // « bascule » : the rocket leaves its path, the screen loses it, the colour turns
  st(t.bascule, 0.6, { incid: 6 }, "power2.out");
  st(t.bascule, 0.4, { alarm: 1 });
  st(t.bascule, 0.25, { mood: 1 }, "power1.out");
  // the light: the pad → the console (on its cut) → the base (on its cut) → the rocket in the sky
  const ROCKET_TIP = at(0.9, 6, [0, CENTER, 0]);
  st(t.couloir + 0.3, 1.4, lightOn(ROCKET_TIP, 8000));

  // three shots, two cuts (retouche 08/11: the one path flew 2,7 km from the pad into the booth in 1,4 s — knock at
  // 41,8 — then out of it to the crane — knock at 44,0): the booth cut lands after « Kourou », the crane cut before « Sa »
  const cutB = t.sauvegarde - 0.15; // ≈ 41,89
  const cutC = t.regle - 0.255; //     ≈ 43,985 (between two frames)
  chip("chip-cnes", null, 96, 470, t.sauvegarde - 0.04, Math.min(t.seconde + 0.1, cutC - 0.04));
  chip("chip-couloir", null, 96, 470, t.couloir - 0.02, t.couloir + 1.18);
  punch(t.couloir, 0.06);
  punch(t.bascule, 0.06, { hold: 0.12, down: 0.3 });

  const TIP = { ...P, ...target(ROCKET_TIP), d: 22000, az: -70, el: -8, fov: 40, shift: 40 };
  // the crane: behind and above the booth, on its axis, looking up at the rocket where it is at the cut
  const u = clamp01((cutC - lift) / (c1 - lift));
  const CRANE = aim([-12800, 3100, 8000], at(0.6 * u * u, 0, [0, CENTER - 400, 0]), { ...P, fov: 44, shift: -60 });
  path([
    [t.torepos, PAD_BAY],
    [t.attend, PAD_OUT],
    [cutB, PAD_OUT2],
  ]);
  cut(cutB, null, BOOTH, { ...LIGHT.booth });
  path([
    [cutB, BOOTH],
    [cutC, BOOTH2],
  ]);
  cut(cutC, null, CRANE, { ...LIGHT.wide });
  path([
    [cutC, CRANE],
    [t.couloir, CORR],
    [t.bascule, TIP],
    [t.tozero, { ...target(at(0.915, 6, [0, CENTER, 0])), d: 19500, az: -75, el: -9 }],
  ]);

  /* ═══════════ 03 · RÉPONSE: H0+36 → the rain of pieces ═══════════ */
  setAct(tl, 3, t.tozero);
  // the rocket keeps flying: H0+36 → H0+39 (« s'arrachent »), then held at the breakup point (the end starts from there)
  const C0 = 0.95;
  const climbAt = (time) => lerp(C0, 1, clamp01((time - t.tozero) / (t.arrachent - t.tozero)));
  const BAY_P = ringPoint(-42.5, 163, 3130); //          the bay, midway between its two SRI (plan.js: az −80 and −5, r 205)
  const bayAt = (time, incid = 0) => at(climbAt(time), incid, BAY_P);
  const centreAt = (time, incid) => at(climbAt(time), incid, [0, CENTER, 0]);
  const BAY0 = bayAt(t.tozero);
  // retouche 08/11: from az −18…−30 the two SRI sat 250 cm apart ACROSS the view, at the frame's edges; from az −104…−112
  // their line runs half into the depth: both big (≈ 165 and 245 px), in the middle (x ≈ 400 and 630), no booster nose in front;
  // the near one shows its veille face, the far one its veille edges (its face looks outward, away from the lens).
  // The charges are off in the bay (their veille line crossed it and took the eye): back on the nozzle cut.
  const BAYV = { ...VIEW.bay, ...target(BAY0), az: -118, el: 12, d: 700 };
  cut(t.tozero, SET.SCENE, BAYV, {
    ...STAGED, climb: C0, incid: 0, gimbal: 0, guide: 1, tear: 0, links: 1, burn: 1, trail: 1, inside: 1, charge: 0,
    corridor: 1, track: 0, mood: 1, ...lightOn(BAY0, 1400),
  });
  st(t.tozero, t.arrachent - t.tozero, { climb: 1 }, "none");
  // « lâchent » : the two SRI die (veille → a dull signal)
  st(t.lachent, 0.3, { guide: 0 }, "power2.in");
  // « braquent à fond » : the nozzles go hard over
  st(t.braquent - 0.04, 0.6, { gimbal: 1 }, "power2.out");
  // « en travers : plus de vingt degrés » : over 20,5 between « plus » and « vingt »; the boosters' noses start to lift
  st(t.travers - 0.3, t.plus + 0.1 - (t.travers - 0.3), { incid: 20 }, "power2.inOut");
  st(t.plus + 0.1, t.vingt + 0.3 - (t.plus + 0.1), { incid: 24 }, "sine.out");
  st(t.plus - 0.1, 0.4, { arc: 1 }, "power2.out");
  st(t.travers + 0.2, t.les - t.travers - 0.2, { tear: 0.25 }, "sine.inOut"); // ends before the tearing tween starts
  // « Les boosters s'arrachent » : torn away, their links cut; the rocket turns on
  st(t.les + 0.1, 1.3, { tear: 1 }, "sine.inOut"); // they peel off ACROSS the word (56,4 → 57,2), still in the frame
  st(t.les + 0.1, 1.4, { incid: 32 }, "sine.out");
  st(t.les + 0.05, 0.3, { arc: 0 });
  st(t.arrachent - 0.06, 0.12, { links: 0 }, "none");
  // the signal runs from the torn links to the bay — « Et là, la charge… » — lights the charges, « …détone »
  st(t.arrachent + 0.25, 1.0, { pulse: 1 }, "power1.inOut");
  st(t.charge - 0.05, 0.25, { charge: 1 }, "power2.out");
  // « détone » (retouche 08/11): the front no longer strolls (0,3 s linear read as « a light that runs »): it leaves the
  // bay on the flash (fusee.js: the flash lives on blast 0,02–0,3 → 3 frames here, its peak at ≈ 58,20, the knock on it)
  // and whips down the line, faster and faster, in 0,2 s
  st(t.trigger, 0.2, { blast: 1 }, "power3.in");
  st(t.trigger + 0.04, 0.12, { inside: 0 }); // under the flash: the chain stays on its seat, never rides the debris (actes-maj §4)
  jolt(t.trigger + 0.06, 0.9);
  punch(t.trigger + 0.06, 0.08, { up: 0.05, hold: 0.08, down: 0.5 }); // the hit on « détone », with the flash and the knock
  // « La coque s'ouvre » : the zip, the pieces part, the jets lost in them (never out at once)
  st(t.coque - 0.15, t.ouvre - t.coque + 0.15, { rip: 1 }, "power1.inOut");
  st(t.ouvre - 0.5, 0.7, { debris: 0.1 }, "power1.in");
  st(t.coque, 1.0, { burn: 0.2 }, "sine.inOut");
  // « Tout retombe… » : the system has won — the colour turns on « Tout »; the pieces fall east of the pad, the mangrove
  // glows on « mangrove », the savanna on « savane » (kourou.js: 0,50–0,72 then 0,72–0,84)
  st(t.tout, 0.3, { mood: 0 }, "power1.out");
  st(t.tout, t.mangrove + 0.1 - t.tout, { debris: 0.6 }, "power1.in");
  st(t.mangrove + 0.1, t.savane - t.mangrove, { debris: 0.78 }, "none");
  st(t.savane + 0.1, t.toverdict - 0.12 - (t.savane + 0.1), { debris: 1 }, "power1.out");
  st(t.tout + 0.2, 1.8, { burn: 0 }, "sine.inOut");
  // the light: the bay → the rocket → the base
  st(t.fond, 1.4, lightOn(centreAt(t.plus, 18), 6000));
  st(t.ouvre + 0.2, 3.0, { ...LIGHT.wide });

  // « Les tuyères » : a cut, a few frames before the phrase (retouche 08/11: the 33 m dive in 0,8 s knocked at 52,3)
  const cutN = t.tuyeres - 0.255; // ≈ 51,785 (between two frames)
  chip("chip-sri", null, 96, 470, t.ses + 0.2, cutN - 0.04);
  punch(t.lachent, 0.06, { hold: 0.1, down: 0.28 }); // let go before the cut
  punch(t.arrachent, 0.06);

  const NOZ_P = at(climbAt(t.braquent), 0, [0, -160, 0]);
  const NOZ = { ...VIEW.nozzles, ...target(NOZ_P) };
  // the pull-back starts on the cut (d 2000 → 2800 → 15000, one way): a push-in to NOZ then a pull out of it stopped the
  // camera on « braquent » and made the move to WHOLE race (96 °/s at 53 s)
  const NOZ0 = { ...NOZ, ...target(at(climbAt(cutN), 0, [0, -160, 0])), az: -30, d: 2000 };
  const WHOLE = { ...VIEW.whole, ...target(centreAt(t.plus, 18)), az: -41 };
  const TEAR = { ...VIEW.tearView, ...target(centreAt(t.arrachent, 27)), az: -47, shift: 200 };
  // closer on the core and its charge line for « détone » (the line is a few pixels wide: at 105 m it was lost)
  const BLAST = { ...VIEW.blastView, ...target(at(1, 32, [0, 1900, 0])), az: -51, el: -5, d: 6800, shift: 150 };
  const OPEN = { ...BLAST, ...target(at(1, 32, [0, 2100, 0])), az: -55, d: 9500, el: -3, shift: 140 };
  path([
    [t.tozero, BAYV],
    [t.secondes, { ...target(bayAt(t.secondes)), az: -119, el: 12, d: 680 }],
    [t.lachent, { ...target(bayAt(t.lachent)), az: -123, el: 11, d: 620 }],
    [cutN, { ...target(bayAt(cutN)), az: -125, el: 10, d: 600 }],
  ]);
  cut(cutN, null, NOZ0, { charge: 0.25, ...lightOn(NOZ_P, 2600) });
  path([
    [cutN, NOZ0],
    [t.braquent, NOZ],
    [t.plus, WHOLE],
    [t.arrachent, TEAR],
    [t.trigger, BLAST],
    [t.ouvre, OPEN],
    [t.mangrove, { ...target([3200, 9000, 0]), d: 28000, az: -57, el: 1, fov: 42, shift: 80 }],
    [t.toverdict, VIEW.rain],
  ]);
}
