// CR03 — acte2c.js · t6 → issue (tot6 → todefaut): 16:43:56 the gear stays down; 16:44:00 Le Bourget; 16:44:29 the fall; 16:44:31 the
// empty runway. docs/CR03-actes.md « acte2c.js », docs/CR03-actes-maj.md. Four cuts, one move each (D.path), the aircraft FLYING all act:
//   1. t6, the left gear — close, from ahead and below, against the black sky; « rentrer »: the legs twitch up and fall back on « Il »;
//      « ne rentre pas »: red, the red circle, punch on « pas ». « Ton Concorde reste à 60 mètres »: the camera pulls back WITHOUT a cut
//      to its left profile over the fields, level, the gear still down (chip-alt).
//   2. t7, from high behind — the map: its amber wake traced from the runway to where it flies; « alarme »: the camera drops toward it,
//      low over the roofs (« trop près du sol »); « Le Bourget, Le Bourget »: the field lights up ahead (two pulses).
//   3. t8, three-quarter rear — « s'effondre »: engines 3, 4, 1 die one after the other (their reheat goes out); « commandes »: it
//      starts to roll left; « penche… et tombe »: the left wing goes down, the nose drops, it falls out of the frame BY THE BOTTOM and
//      the camera does not follow it down (it keeps its line: an empty sky). No image of the crash.
//   4. issue, the empty runway — the first image without the aircraft: the soot trail grows away; « 113 morts » (chip-bilan); « Deux
//      minutes pile après le top »: the camera lowers its eyes onto the strip in the foreground, red on « top ».
// The aircraft flies at ≈ 200 kt (≈ 97 m/s at 1:20 = 484 units/s), from just past the runway's end at `tot6` — it reaches the hotel's
// x right after the issue cut: the camera and the light follow its `run`. Starts with a complete cut at `tot6`; hands over at
// `todefaut` (acte3 cuts to the tank). Never writes the header (main.js). No sound written here (journal → « sons »).
import { feutre } from "@kit/reconstitution.js";
import { SET, VIEW, LOOK, onPlane, lit } from "./world.js";
import { RUN, STRIP, TRAJ } from "./plan.js";

// every number the runway set reads, so that each cut says the whole state (nothing inherited from the act before)
const AIR = {
  culprit: 0, fault: 0, ok: 0, depuis: 0, gauge: 0, debit: 0, mark: 0,
  n1: 0.2, n2: 0, n3: 1, n4: 1, gear: 1, burst: 1, chunk: 1, surge: 0, cutaway: 0, tear: 1, leak: 1, fire: 1,
  stop: 0, v1: 0, ruler: 0, found: 0, soot: 0, traj: 0, bourget: 0, inspect: 0,
};
const SPEED = 484; // units per second (1 unit = 0.2 m): ≈ 200 kt, the BEA's speed at the fire alarm, kept to the end
const TR = (run) => (run - RUN.strip) / (TRAJ.end - RUN.strip); // `traj` whose head stands under the aircraft at `run`

export default function acte2c({ D, world }) {
  const { st, now, cut, path, punch, chip } = D;
  const t = D.times({
    tot6: "tot6", rentrer: "t6:rentrer", rentrepas: "rentrepas", pas: "t6:pas", ton: "t6:Ton", monte: "t6:monte",
    tot7: "tot7", alarme: "t7:alarme", sol: "t7:sol", ton7: "t7:Ton", bourget1: "bourget1", bourget2: "t7:Bourget#2",
    tot8: "tot8", effondre: "effondre", commandes: "t8:commandes", penche: "t8:penche", tombe: "tombe",
    toissue: "toissue", morts: "issue:113", deux: "issue:Deux", top: "issue:top", todefaut: "todefaut",
  });

  // the aircraft's flight: `run` grows at SPEED from just past the runway's end; level at ≈ 60 m (alt 300), nose up, not climbing
  const R = (at) => 21500 + SPEED * (at - t.tot6);
  const fly = (at, o = {}) => ({ run: R(at), alt: 300, pitch: 10, bank: 0, ...o });
  const aim = (at, local, o) => {
    const [tx, ty, tz] = onPlane(fly(at, o), local);
    return { tx, ty, tz };
  };
  const light = (at, fs, o) => lit(onPlane(fly(at, o), [0, 20, 0]), fs);
  // a point at a WORLD offset from the aircraft's origin (the main gear): aims that do not tilt with its pitch
  const aimW = (at, [dx, dy, dz], o) => {
    const [x, y, z] = onPlane(fly(at, o), [0, 0, 0]);
    return { tx: x + dx, ty: y + dy, tz: z + dz };
  };
  const base = { side: 0, roll: 0, drift: 0.25, fov: 30, shift: 40, dof: 0 };

  /* ── 1 · t6, 16:43:56 — the left gear (raccord: engine 2 → the leg right beside it), then the profile at 60 m ── */
  const LEG = [0, 8, 19]; // the left leg, mid-height (concorde.A.gearLeft)
  const A0 = { ...base, ...aim(t.tot6, LEG), d: 260, az: -52, el: -10, shift: 0, dof: LOOK.dof };
  cut(t.tot6, SET.PISTE, A0, { ...AIR, ...fly(t.tot6), ...light(t.tot6, 160) });
  st(t.tot6, t.tot7 - t.tot6, { run: R(t.tot7) }, "none");
  st(t.tot6, t.ton - t.tot6, light(t.ton, 160), "none");
  st(t.ton, t.tot7 - t.ton, light(t.tot7, 420), "none");
  path([
    [t.tot6, A0],
    [t.rentrer, { ...aim(t.rentrer, LEG), d: 240, az: -45, el: -9 }],
    [t.pas, { ...aim(t.pas, LEG), d: 225, az: -38, el: -8 }],
    [t.ton + 1.25, { ...aimW(t.ton + 1.25, [0, -10, 10]), d: 950, az: -8, el: 0, dof: 0 }],
    [t.tot7 - 0.02, { ...aimW(t.tot7 - 0.02, [0, -100, 0]), d: 1900, az: 6, el: 2 }],
  ]);
  // « rentrer »: the legs start up… and fall back on « Il » (no reason shown: the BEA does not give one)
  st(t.rentrer, 0.3, { gear: 0.94 }, "power2.out");
  st(t.rentrepas - 0.3, 0.32, { gear: 1 }, "power2.in");
  // « Il ne rentre pas »: the gear in red, the circle round the left leg
  now(t.rentrepas, { culprit: 5 });
  st(t.rentrepas, 0.2, { fault: 1 }, "power2.out");
  feutre(D, { id: "feutre-train", anchor: world.concorde.A.gearLeft, w: 190, h: 260, from: t.rentrepas + 0.05, to: t.ton + 0.9, seed: 5 });
  punch(t.pas, 0.06);
  chip("chip-alt", null, 96, 470, t.ton - 0.1, t.tot7 - 0.1);

  /* ── 2 · t7, 16:44:00 — from high behind: its wake on the map, the roofs, Le Bourget (raccord: the profile → its track seen from above) ── */
  const fly7 = { bank: 2 };
  const C0 = { ...base, ...aimW(t.tot7, [-250, -220, 80], fly7), d: 5200, az: 100, el: 32, fov: 32, shift: 0 };
  cut(t.tot7, SET.PISTE, C0, { ...AIR, ...fly(t.tot7, fly7), ...light(t.tot7, 4500, fly7), traj: 0 });
  st(t.tot7, t.tot8 - t.tot7, { run: R(t.tot8) }, "none");
  // the wake: traced from the runway up to the aircraft, then it stays under it
  st(t.tot7 + 0.1, t.alarme - t.tot7 - 0.1, { traj: TR(R(t.alarme)) }, "power2.out");
  st(t.alarme, t.tot8 - t.alarme, { traj: TR(R(t.tot8)) }, "none");
  // the light follows the camera down onto the aircraft
  st(t.tot7, t.ton7 - t.tot7, { ...light(t.ton7, 1500, fly7) }, "none");
  st(t.ton7, t.tot8 - t.ton7, { ...light(t.tot8, 1500, fly7) }, "none");
  // (retouche 13/11) the drop reaches the roofs ON « trop… sol »: low behind it, the aircraft large, Gonesse's roofs ahead under it
  path([
    [t.tot7, C0],
    [t.alarme, { ...aimW(t.alarme, [-233, -133, 67], fly7), d: 2000, az: 103, el: 17 }],
    [t.sol, { ...aimW(t.sol, [-200, -100, 67], fly7), d: 1000, az: 106, el: 9, fov: 30 }],
    [t.tot8 - 0.02, { ...aimW(t.tot8 - 0.02, [-270, -82, 108], fly7), d: 1150, az: 112, el: 5 }],
  ]);
  // « Le Bourget, Le Bourget »: the field ahead lights up, a second pulse on the second
  st(t.bourget1, 0.3, { bourget: 1 }, "power2.out");
  st(t.bourget2, 0.12, { bourget: 1.25 }, "power2.out");
  st(t.bourget2 + 0.12, 0.45, { bourget: 1 }, "sine.inOut");
  punch(t.bourget1, 0.06);

  /* ── 3 · t8, 16:44:29 — three-quarter rear: thrust collapses, it rolls left and drops out of the frame (raccord: the aircraft, closer) ── */
  const fly8 = { alt: 280, pitch: 12, bank: 10 };
  const TAIL = [40, 20, 0];
  const D0 = { ...base, ...aim(t.tot8, TAIL, fly8), d: 1150, az: 60, el: 4 };
  cut(t.tot8, SET.PISTE, D0, { ...AIR, ...fly(t.tot8, fly8), ...light(t.tot8, 420, fly8), bourget: 1 });
  st(t.tot8, t.toissue - t.tot8, { run: R(t.toissue), ...light(t.toissue, 420, fly8) }, "none");
  // the camera keeps flying at its speed and its height: when the aircraft drops, the camera does not go down with it
  path([
    [t.tot8, D0],
    [t.effondre, { ...aim(t.effondre, TAIL, fly8), d: 1110, az: 55, el: 4 }],
    [t.commandes, { ...aim(t.commandes, TAIL, fly8), d: 1070, az: 50, el: 5 }],
    [t.penche, { ...aim(t.penche, TAIL, fly8), d: 1040, az: 46, el: 5 }],
    // (retouche 13/11) the lift of the eyes starts on « tombe », spread to the cut (it was all in the last 0.85 s: judder at 90.7)
    [t.tombe, { ...aimW(t.tombe, [40, 70, 0], fly8), d: 1020, az: 44, el: 5, shift: 25 }],
    // « tombe »: the camera lifts its eyes as it drops: it leaves by the bottom above the roofs, the ground under it never in frame
    [t.toissue - 0.02, { ...aimW(t.toissue - 0.02, [40, 200, 0], fly8), d: 1020, az: 43, el: 3, shift: 0 }],
  ]);
  // « La poussée s'effondre »: engines 3, 4, then 1 lose their thrust (BEA: 3 and 4 normal until 16:44:29)
  st(t.effondre, 0.5, { n3: 0 }, "power2.out");
  st(t.effondre + 0.2, 0.5, { n4: 0 }, "power2.out");
  st(t.effondre + 0.4, 0.5, { n1: 0 }, "power2.out");
  punch(t.effondre, 0.06);
  // « Une partie des commandes est détruite »: the roll to the left begins
  st(t.commandes, 1.2, { bank: 25 }, "sine.inOut");
  // « penche à gauche… et tombe »: the left wing goes down, then the nose, and it drops out of the frame
  // (retouche 13/11) roll eased in AND out, drop spread to the cut (power2.in on 0.55 s peaked at ≈ 1 200 units/s: judder at 90.7)
  st(t.penche, t.tombe + 0.3 - t.penche, { bank: 100 }, "sine.inOut");
  st(t.tombe - 0.1, t.toissue - t.tombe + 0.08, { alt: 40, pitch: -20 }, "power1.in");
  punch(t.tombe, 0.06);

  /* ── 4 · issue, 16:44:31 — the empty runway, the strip in the foreground, the soot away (raccord: the first image, without it) ── */
  const STRIPAT = { tx: STRIP.at[0], ty: 0.1, tz: STRIP.at[2] };
  const E0 = { ...VIEW.vide, drift: 0.2 };
  cut(t.toissue, SET.PISTE, E0, {
    ...AIR, run: 0, alt: -100, pitch: 0, bank: 0, n1: 0, n3: 0, n4: 0, fire: 0, leak: 0, ...lit([STRIP.at[0] - 40, 0, STRIP.at[2]], 70),
  });
  st(t.toissue + 0.1, 2.2, { soot: 1 }, "sine.inOut");
  st(t.deux, t.top - t.deux, lit([STRIP.at[0], 0, STRIP.at[2]], 22), "sine.inOut");
  path([
    [t.toissue, E0],
    [t.deux, { ...E0, fov: 22.5 }],
    [t.top - 0.05, { ...STRIPAT, d: 26, az: 84, el: 7, fov: 26, shift: 60, dof: LOOK.dof }],
    [t.todefaut - 0.02, { ...STRIPAT, d: 21, az: 80, el: 9, fov: 26, shift: 60 }],
  ]);
  chip("chip-bilan", null, 96, 470, t.morts - 0.1, t.todefaut - 0.1);
  punch(t.morts, 0.05);
  // « le top »: the strip, red, one instant (it is where the two minutes started)
  now(t.top - 0.02, { culprit: 1 });
  st(t.top, 0.2, { fault: 1 }, "power2.out");
}
