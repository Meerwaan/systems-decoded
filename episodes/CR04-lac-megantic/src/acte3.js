// CR04 — acte3.js · t7 → issue (tot7 → todepuis): 1:15, no one on board, the train enters Lac-Mégantic at 105 km/h; at the
// crossing of rue Frontenac the limit is 16. It derails in the centre; the oil burns; 47 dead; the inquiry lists 18 factors.
// docs/CR04-actes.md « acte3.js », docs/CR04-actes-maj.md § 3. Four cuts, the camera never still:
//   1. tot7, RIDING the lead in town, ahead-left of its nose, the cab's wall lifted off: « sans personne à bord » — the two empty
//      seats, dark; then the camera lets go of it and climbs away ahead (by ratio), the train coming down between the lit shops:
//      « entre dans Lac-Mégantic » — #vitesse counts to 105 on « cent cinq » (punch).
//   2. t7:Au, the « 16 » sign, low, close (the plate big, in front): the train streams past behind it, the crossing's lights
//      flashing; punch on « seize »; #vitesse red, far beyond 16.
//   3. toissue, the curve, far and high over the lake: on « déraille » the cars fold over in the curve (derail 0 → 1) while the
//      locomotives carry on out of the pile (run 24 050 → 26 100, maj § 3); « s'embrase » the red glow behind the roofs (≤ 0.55);
//      « 47 morts » chip-bilan. The camera backs away slowly.
//   4. issue:L'enquête, the slope at Nantes, EMPTY: the rail where the first image stood, running down to the town's lights and the
//      glow at its vanishing point; the camera rises slowly away; chip-facteurs on « dix-huit ». (raccord: fin cuts back to this
//      very place, the train parked again.)
// The header (01:15, held through the issue) is main.js's. No sound written here (journal → « sons »).
import { FIRST, SET, onLoco, onTrack, lit, lookFrom } from "./world.js";
import { RUN, FRONTENAC } from "./plan.js";

const RUN_FAR = 26100; // maj § 3: where the head ends while the cars pile (else the VB goes through the fifth locomotive)

export default function acte3({ D }) {
  const { st, now, cut, path, punch, chip } = D;
  const t = D.times({
    tot7: "tot7", personne: "personne", entre: "entre", cent: "centcinq", au: "t7:Au", seize: "seize",
    toissue: "toissue", deraille: "deraille", embrase: "embrase", morts: "morts", enquete: "enquete", facteurs: "facteurs",
    todepuis: "todepuis",
  });

  /* the head's run in town: ≈ 120 → 200 units/s, the sign passed just after the cut on t7:Au, the crossing at the end of t7 */
  const T0 = t.tot7, T1 = t.toissue, V0 = 120, ACC = 10;
  const R0 = FRONTENAC.signU - (V0 * (t.au + 0.4 - T0) + 0.5 * ACC * (t.au + 0.4 - T0) ** 2);
  const R = (at) => {
    const s = Math.max(0, Math.min(T1, at) - T0);
    return R0 + V0 * s + 0.5 * ACC * s * s;
  };
  const span = R(T1) - R0;
  const runEase = (p) => (V0 * (T1 - T0) * p + 0.5 * ACC * ((T1 - T0) * p) ** 2) / span; // the same law, as a GSAP ease
  const Lr = (at, local) => onLoco(0, { run: R(at), slack: 1 }, local);
  const T = (u, local) => onTrack(u, local);

  // every number the place reads (nothing inherited from acte2c)
  const TOWN = {
    ...FIRST, culprit: 0, fault: 0, ok: 0, depuis: 0, run: R0, slack: 1, brakes: 7, auto: 0, psi: 0, leak: 0, derail: 0,
    engine: 0, smoke: 0, fire: 0, cutaway: 0, cab: 0, crew: 0, cutoff: 1, solo: 0, mano: 0, col: 0, mark: 0, speedo: 0, kmh: 0,
    pull: 0, hold: 0, road: 1, town: 1, glow: 0, cross: 1,
  };

  const mix = (a, b, u) => a + (b - a) * u;
  const ss = (a, b, x) => {
    const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  };

  /* ── 1 · tot7 — riding the lead: the empty cab; then the camera lets go and climbs away ahead, the town all round ── */
  const LET = t.personne + 0.75; // after « à bord »: the camera stops riding
  const keys1 = [];
  {
    const a0 = T0, a1 = t.au - 0.12, n = Math.round((a1 - a0) / 0.2);
    for (let k = 0; k <= n; k++) {
      const at = a0 + ((a1 - a0) * k) / n;
      const w = ss(LET, a1, at); // 0 riding → 1 let go (the pose by ratio: d grows geometrically)
      const r = ss(a0, LET, at); // the ride: a slow turn round the open cab
      const wa = ss(LET, LET + 1.4, at); // the turn ahead comes first: the camera stays over the track, never over the roofs
      const tgtL = [mix(-38, 30, w), mix(11, 9, w), 0];
      const d = mix(140, 125, r) * Math.pow(620 / 125, w);
      const az = mix(-41, -48, r) + mix(0, -24, wa);
      // retouche 14/11: 95.5–96.1 the camera went through a facade by the track (beige frames): it climbs over the roofs first
      const el = mix(24, 21, r) + mix(0, -6, w) + 16 * ss(LET - 1.1, LET - 0.3, at) * (1 - w);
      const [tx, ty, tz] = Lr(at, tgtL);
      keys1.push([at, { side: 0, roll: 0, drift: 0.2, dof: 0, tx, ty, tz, d, az, el, fov: 34, shift: mix(-70, 30, w) }]);
      if (k > 0) {
        const p = keys1[k - 1][0];
        st(p, at - p, lit(Lr(at, [mix(-38, 40, w), 11, 0]), mix(80, 300, w)), "none");
      }
    }
  }
  cut(T0, SET.PENTE, keys1[0][1], { ...TOWN, ...lit(Lr(T0, [-37, 11, 0]), 70), cab: 1 });
  path(keys1);
  st(T0, T1 - T0, { run: R(T1) }, runEase);
  st(T0 + 0.1, 0.3, { speedo: 1 }, "power2.out");
  now(T0, { kmh: 62 });
  st(T0 + 0.2, t.entre - T0 - 0.2, { kmh: 84 }, "sine.inOut");
  st(t.entre, t.cent + 0.3 - t.entre, { kmh: 105 }, "power2.out");
  punch(t.cent, 0.06);

  /* ── 2 · t7:Au — the « 16 », low and close, the train streaming past behind it, the crossing's lights flashing ── */
  const S = FRONTENAC.signU;
  const cut2 = t.au - 0.12;
  // the plate on the right (clear of #vitesse), the train streaming behind it, the ground lit below
  const P2a = lookFrom(T(S - 125, [0, 10, 82]), T(S + 30, [0, 13, 2]), { fov: 30, side: -150, shift: -120, drift: 0.2 });
  const P2b = lookFrom(T(S - 100, [0, 8, 74]), T(S + 30, [0, 13.5, 2]), { fov: 30, side: -150, shift: -120, drift: 0.2 });
  cut(cut2, SET.PENTE, P2a, { ...TOWN, run: R(cut2), ...lit(T(S + 30, [0, 12, 8]), 120), speedo: 1, kmh: 105 });
  path([[cut2, P2a], [T1 - 0.02, { ...P2b, az: P2b.az - 4 }]]);
  punch(t.seize, 0.06);
  st(T1 - 0.3, 0.2, { speedo: 0 }, "power1.in");

  /* ── 3 · toissue — the curve, far and high over the lake: the cars fold over, the locomotives carry on; the glow ── */
  // retouche 14/11: closer, from uphill along the curve (the cars fold AWAY from the lens, the locomotives recede: no streak
  // across the frame), the light on the pile
  const C = lookFrom(T(23820, [0, 300, -320]), T(24380, [0, 0, 20]), { fov: 32, shift: -40, drift: 0.2 });
  const cut4 = t.enquete - 0.14;
  cut(T1, SET.PENTE, C, { ...TOWN, ...lit(T(24350, [0, 0, 0]), 520), run: RUN.derail - 40, cross: 0, speedo: 0, kmh: 0 });
  path([[T1, C], [t.embrase, { d: C.d * 1.04, az: C.az + 3, el: C.el + 1 }], [cut4, { d: C.d * 1.12, az: C.az + 7, el: C.el + 2 }]]);
  st(T1, t.deraille - T1, { run: RUN.derail }, "none");
  // the pile takes « Il déraille… s'embrase… morts » up to the cut (≈ 3.7 s, linear: ≈ 550 u/s at most, not 1 240 — the cars
  // fold readably instead of a motion-blur streak)
  st(t.deraille, cut4 - 0.2 - t.deraille, { derail: 1, run: RUN_FAR }, "none");
  st(t.embrase, 0.9, { glow: 0.55 }, "power2.out");
  chip("chip-bilan", null, 96, 470, t.morts - 0.2, cut4 - 0.2);

  /* ── 4 · issue:L'enquête — the slope at Nantes, empty: the rail down to the town's lights; the camera rises away ── */
  const N = (local) => onTrack(0, local); // the parked place (the train is long gone)
  const P4a = lookFrom(N([-18, 4.2, 9.5]), N([-330, 1.5, -6]), { fov: 40, shift: 0, drift: 0.2 });
  const P4b = lookFrom(N([4, 13, 15]), N([-330, 1.5, -8]), { fov: 40, shift: 30, drift: 0.2 });
  cut(cut4, SET.PENTE, P4a, { ...TOWN, ...lit(N([-40, 2, 0]), 45), run: RUN_FAR, derail: 1, glow: 0.55, cross: 0, cab: 0 });
  path([[cut4, P4a], [t.todepuis - 0.02, P4b]]);
  chip("chip-facteurs", null, 96, 470, t.facteurs - 0.35, t.todepuis - 0.2);
}
