// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One movement, two cuts.
//
// THE HOOK. The first frame is POSE0 / FIRST: from behind your car, low, in the rain, the three blades sweeping the
// storm at 11 tr/min (the header: the speed at the TIPS of the blades, never the wind's). The blades move from frame 1;
// the camera only leans toward the rotor. « …les pales *s'emballent* » hits (punch). « Et chacune n'a plus qu'une
// +batterie+ » : three veille points wake on the hub. « Le réseau a sauté » : the grid's cable dies at the tower's foot
// and the station's lamp with it (Réseau · Coupé) — then the camera climbs to the hub (by ratio) on « c'est elle qui
// doit +sauver+ ce géant » : the cover clears, the three cabinets turn with the rotor. « Si elle n'a pas *vieilli* » :
// the camera closes in, the gauges fall to a third and turn signal.
// THE SCENE. Cut 1 (toscene), from the hub to the whole rotor, from below: « Le rotor accélère » — THE RUNAWAY IS AN
// INSTANT: 11 → 12.6 tr/min over « accélère » (the header still ink, 195), then over « deux cents » 12.6 → 13.4: the
// header passes 200 and turns signal ON the word, the tips' trails turn signal with it. « Une pale peut *lâcher* » :
// blade A shudders (punch). Cut 2 (tovoiture), down to the road: your car from above and behind, the signal arc falling
// from the tips' path onto it (Ta voiture · À portée). « Il faut les faire pivoter » : a cut to the hub, from the
// road's side, and one slow push to the hand-off. « Sans *courant* » : the hub racing, its pitch motors black.
// « Alors… » : the wind falls, the rotor runs down to a stop with blade A at the top while the push goes on, calm —
// act 2 cuts to the bench from that picture. (rpm 0 at the hand-off: the plan's freeze before « on l'ouvre ».)
//
// THE ROTOR IN REAL TIME: `rpm` is laid as keys, `rotor` follows it exactly (spin(): the angle of a linear ramp), and
// jumps on cut 2 by what makes it land on a multiple of 1/3 at the stop (three identical blades: A at the top).
import { setAct } from "@kit/overlay.js";
import { POSE0, VIEW, STAGED, SET, HUBW } from "./world.js";

const [HX, HY, HZ] = HUBW;
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* ── the poses ── */
// the hook leans toward the rotor — the lens only, the camera stays behind your car: the car and the tower's foot
// (the grid's cable) stay in the picture, a little higher, clear of the hook's words
const LEAN = { ...POSE0, fov: 78, shift: 170 };
// the hub on the climb's arrival: through the cleared cover, from the cabinets' side (−x of each col, upwind)
const HUB = { ...P, tx: HX, ty: HY, tz: HZ, d: 3600, az: -80, el: 16, fov: 32, shift: 120 };
// « Si elle n'a pas vieilli » : closer, the gauges big
const HUB_IN = { ...HUB, d: 2700 };
// cut 1: the whole rotor from below (VIEW.rotor), and a slow push through the scene
const ROTOR = VIEW.rotor;
const ROTOR_IN = { ...VIEW.rotor, d: 11900 };
// cut 2: your car from above and behind, the road and the tower's foot beyond, the arc falling onto the car
const CAR = { ...P, tx: -3450, ty: 150, tz: 9300, d: 1800, az: -22, el: 10, fov: 60, shift: 60 };
const CAR_IN = { ...CAR, d: 1650 };
// the crane's arrival: the hub from the road's side (no turn from CAR), its pitch motors facing us
const HUB_R = { ...P, tx: HX, ty: HY, tz: HZ, d: 3400, az: -25, el: 8, fov: 32, shift: 100 };
// retouche: the cut opens a little wide, the push ends a little in (by ratio), still from the road's side
const HUB_RW = { ...HUB_R, d: 3700 };
const HUB_RIN = { ...HUB_R, d: 2900 };

/* ── the light: what it stands around, and how wide ── */
const L_HUB = { fx: HX, fy: HY, fz: HZ, fs: 1500 };
const L_CAR = { fx: -3500, fy: 100, fz: 9500, fs: 1400 };
const L_ROOT = { fx: HX, fy: HY + 250, fz: HZ, fs: 900 };

/** The angle a rotor gains while its speed ramps linearly r0 → r1, as an ease (u: 0 → 1 of the turns). */
const spin = (r0, r1) => (r0 + r1 < 1e-6 ? (u) => u : (u) => (2 * r0 * u + (r1 - r0) * u * u) / (r0 + r1));

export default function acte1({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", batterie1: "batterie1", saute1: "saute1", sauver: "sauver", geant: "geant", si: "promesse:Si",
    vieilli1: "vieilli1", toscene: "toscene", accelere: "accelere", kmh200: "kmh200", lacher: "lacher",
    tovoiture: "tovoiture", voiture: "voiture", portee: "portee", il: "scene:Il", pivoter: "pivoter",
    sans: "scene:Sans", courant1: "courant1", sceneEnd: "scene$", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ═════════════ the rotor: rpm keys, the angle follows ═════════════ */
  const stop0 = t.sceneEnd + 0.06; // « Alors… » : the wind falls, the rotor runs down
  const stop1 = t.tobench - 0.3; //   …and stands still, blade A at the top, before the bench
  const keys = [
    [0, 11], [t.accelere, 11], [t.accelere + 0.95, 12.6], // « Le rotor accélère » : an instant
    [t.kmh200, 12.6], [t.kmh200 + 0.3, 13.4], //            « deux cents » : the header passes 200, signal
    [t.tovoiture, 13.4], [stop0, 13.4], [stop1, 0],
  ];
  const turns = [0];
  for (let i = 1; i < keys.length; i++) turns.push(turns[i - 1] + ((keys[i - 1][1] + keys[i][1]) / 2 / 60) * (keys[i][0] - keys[i - 1][0]));
  const total = turns[turns.length - 1];
  const jump = Math.ceil(total * 3 - 1e-9) / 3 - total; // laid on cut 2: the stop lands on a multiple of 1/3
  const jumpAt = keys.findIndex(([k]) => k === t.tovoiture);
  for (let i = 1; i < keys.length; i++) {
    const [a, r0] = keys[i - 1];
    const [b, r1] = keys[i];
    const off = i > jumpAt ? jump : 0;
    const a1 = i === jumpAt + 1 ? a + 0.001 : a; // (the cut's jump is set first, this segment leaves from it)
    st(a1, b - a1, { rotor: turns[i] + off }, spin(r0, r1));
    if (r0 !== r1) st(a, b - a, { rpm: r1 }, "none");
  }
  const rotorAt = turns[jumpAt] + jump;

  /* ═════════════ THE HOOK ═════════════ */
  /* « Tempête. Au-dessus de toi, les pales s'emballent. » — the blades race from frame 1, the camera leans in */
  const climb0 = t.saute1 + 0.3;
  shot(0, climb0, LEAN, "sine.out");
  punch(t.choc, 0.06);
  /* « Et chacune n'a plus qu'une +batterie+. » — three veille points wake on the hub */
  st(t.batterie1 - 0.04, 0.35, { batt: 1 }, "power2.out");
  /* « Le réseau a sauté : » — the cable dies at the tower's foot, the station's lamp with it */
  st(t.saute1, 0.3, { mains: 0 }, "power2.out");
  chip("chip-reseau", null, 96, 470, t.saute1 + 0.02, t.geant + 0.15);
  /* « c'est elle qui doit +sauver+ ce géant. » — the camera climbs to the hub (by ratio), the cover clears */
  const arrive = t.si - 0.2;
  shot(climb0, arrive - climb0, HUB, "sine.inOut", LEAN.d);
  st(climb0, arrive - climb0, { ...L_HUB }, "sine.inOut");
  st(climb0 + 0.6, arrive - climb0 - 0.6, { cover: 0.4 }, "sine.inOut");
  /* « Si elle n'a pas *vieilli*. » — closer: the gauges fall to a third, signal */
  shot(arrive, t.toscene - arrive, HUB_IN, "sine.inOut");
  st(t.vieilli1 - 0.02, 0.35, { charge: 0.33 }, "power2.out");
  punch(t.vieilli1, 0.06, { hold: 0.18, down: 0.45 });

  /* ═════════════ THE SCENE ═════════════ */
  /* cut 1 — « Le rotor accélère. » : the whole rotor from below; the charge comes back off-screen */
  cut(t.toscene, SET.SCENE, ROTOR, { ...STAGED, mains: 0, batt: 1, charge: 1, motors: 0, cover: 1 });
  shot(t.toscene, t.tovoiture - 0.02 - t.toscene, ROTOR_IN, "sine.inOut");
  /* « Une pale peut *lâcher*… » — blade A shudders (released before cut 2) */
  st(t.lacher - 0.04, 0.25, { shake: 1 }, "power2.out");
  punch(t.lacher, 0.06, { hold: 0.12, down: 0.34 });

  /* cut 2 — « ta voiture est à portée. » : your car, the arc falling onto it */
  cut(t.tovoiture, SET.SCENE, CAR, { ...STAGED, mains: 0, batt: 1, charge: 1, motors: 0, cover: 1, shake: 1, rotor: rotorAt, ...L_CAR });
  shot(t.tovoiture, Math.min(t.portee + 0.2, t.il - 0.1) - t.tovoiture, CAR_IN, "sine.inOut");
  st(t.voiture - 0.08, t.portee + 0.06 - (t.voiture - 0.08), { reach: 1 }, "power1.inOut");
  st(t.voiture, 0.7, { shake: 0 }, "sine.inOut");
  /* « Il faut les faire pivoter. » — a cut a few frames before the sentence (retouche: the 120 m crane in 1.3 s was
     jerky): the hub from the road's side, cover cleared, and ONE slow push to the hand-off */
  const crane0 = t.il - 0.1;
  chip("chip-portee", null, 96, 470, t.portee - 0.05, crane0);
  cut(crane0, SET.SCENE, HUB_RW, { ...STAGED, mains: 0, batt: 1, charge: 1, motors: 0, cover: 0.4, ...L_HUB });
  shot(crane0, t.tobench - 0.08 - crane0, HUB_RIN, "sine.inOut", HUB_RW.d);
  /* « Sans *courant*. » — the hub racing, its pitch motors black */
  punch(t.courant1, 0.05, { hold: 0.18, down: 0.4 });

  /* « Alors… » — the wind falls, the rotor runs down to a stop, A at the top; the push goes on, calm (no turn) */
  const turn0 = t.courant1 + 0.1;
  st(turn0, t.tobench - 0.08 - turn0, { ...L_ROOT }, "sine.inOut");
  st(stop0, t.tobench - stop0, { storm: 0.3 }, "sine.inOut");
}
