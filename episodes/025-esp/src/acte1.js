// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem → tobench). One move, three cuts (the hands, back, and the system before "Alors…").
//
// THE HOOK. The first frame (POSE0 / FIRST) is the boar across your lane, low on the wet road, your two headlamps
// rushing at it behind. It moves on frame 1: the road comes (`gap` at the slowed speed) and the camera pushes in
// faster than the boar goes away from it.
//   "Tu braques d'un coup…"     the wheel jerks left, the car's nose follows (the écart stays under 3°: veille), and
//                               the camera rises in front of the car — the boar goes under it, toward your nose
//   "…et l'arrière décroche."   the rear goes (yaw runs past aim), the trails are signal, the header's écart too
//   "Elle se rattrape seule :"  time stops, the boar a metre from your nose (it is never touched: the gap is held),
//                               and the camera orbits the frozen car, over its front-right corner…
//   "elle freine une roue."     …which bites (veille), nearest the lens — "Pas les quatre." the four light, three go out
//   "…à un élan."               on round the right flank, looking across the car at the left verge, where the beams
//                               sweep: a moose of glass, in the edge of the light (no label: the C is paid in the comment)
// THE SCENE, from above: the ink arrow where the wheel asks, the car's arrow running past it; a pull-back to the wide
// frame as the spin starts; a CUT to your hands counter-steering; a CUT back to the wide frame — nothing answers,
// then the rear whips the other way and time stops on HANDOFF. In the silence before "Alors…", the car's frame,
// on a cut to VIEW.system, then a very slow push: act 2 cuts to the bench from there.
//
// THE BOAR IS NEVER PASSED in this act: it stands across your lane (1.4 m wide), and with the rear swinging out the
// car could not go by it without touching it. `gap` stays above 0.6 m — every corner of the spinning car clears it
// (worked out for yaw 14 → 85 → −24 and lane 0.8 → 2.4; see docs/journal/025-acte1.md).
//
// RETENTION (2026-10-21, the two leaks of the TikTok curves: 0 → 1 s, and the end of the hook → 25 s). The picture
// of the hook is the one Merwan liked; what changed is its sound (episode.json → sfx: a phone plays it, in the
// breaths between the words) and two words that HIT (D.punch, with a "hit" in the breath after them): « décroche »,
// « fort ». Tried and NOT kept: a speed ramp on frame 1 (the camera at 3.4 times its mean speed, the road at 3): the
// motion of the first half-second went from 1.35 to 2.86, but the boar slid out of the frame at 0.7 s; with the
// camera riding the road's ramp instead, the boar held but the motion stayed at 1.45 — no gain, so no change.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, POSE0, VIEW, HANDOFF, MPS, SLOWMO, FIRST, SYSTEM, STEERING } from "./world.js";

const V = MPS / SLOWMO; // metres of road per film second
const zBoar = (gap) => -235 - 100 * gap; // the boar's z on the road (CAR.nose − 100·gap), the car at the origin

export default function acte1({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    swerve: "swerve", lets: "lets", catch: "catch", onewheel: "onewheel", notfour: "notfour", four: "four",
    reflex: "reflex", moose1: "moose1", toscene: "toscene", left: "left", pivot: "pivot", toupie: "toupie",
    counter: "counter", late: "late", strong: "strong", tosystem: "tosystem", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  const [CX, CY, CZ] = SYSTEM.centre;

  /* ── the poses ── */
  // The camera never leaves the car's front-right half until the scene: from the boar's side it rises in front of
  // the car, then — while time is stopped — it ORBITS the frozen car the long way, over its front-right corner (the
  // wheel that bites, nearest the lens), on round its right flank (looking across it at the left verge, where the
  // beams sweep: the moose), to the map behind it. Azimuths are written unwrapped (−163 → −215 → −295 → −385): the
  // camera turns one way only. (Through the left flank it would go the short way, but the moose would be behind it.)
  const gapSwerve = FIRST.gap - V * t.swerve;
  // the push of the hook: the same angle, aimed where the boar is on "braques", closer
  const PUSH = { ...POSE0, tz: zBoar(gapSwerve), d: 760, el: 4 };
  // risen in front of the car: the boar under the lens, the car swerving, its rear letting go
  const RISE = { ...VIEW.top, tx: -10, ty: 30, tz: -150, d: 2200, az: -163, el: 44, fov: 38, shift: -60 };
  // over the front-right corner, time stopped: the four corners read, the front-right one nearest
  const CORNER = { ...VIEW.top, tx: -40, ty: 30, tz: -80, d: 1900, az: -215, el: 50, fov: 38, shift: 20 };
  // across the car's right flank: the car low in the frame, the moose at the far verge above it
  const MOOSE = { ...VIEW.top, tx: -380, ty: 70, tz: -260, d: 2400, az: -300, el: 32, fov: 38, shift: 110 };
  // the map (VIEW.top, the car left of the buttons), and the wide frame — unwrapped once round
  const TOP = { ...VIEW.top, tx: 120, az: VIEW.top.az - 360 };
  const WIDE = { ...VIEW.wide, tx: 0 };
  const WIDE_T = { ...WIDE, az: WIDE.az - 360 };
  const HANDS = VIEW.hands;

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── "Un sanglier." ───────────── */
  // the road comes at the slowed speed until time stops on "rattrape"; the camera pushes in faster than the boar
  st(0, t.catch, { gap: FIRST.gap - V * t.catch, rolled: V * t.catch }, "none");
  shot(0, t.swerve, PUSH, glide(1.25, 0.9));
  // the key words land on the captions too (in the scene and after: the hook has its own cards)
  D.captionStyle({ hit: 0.25 });

  /* ───────────── "Tu braques d'un coup…" ───────────── */
  // the wheel jerks left; the nose follows the wheel (écart under 3°); the car moves toward the other lane
  st(t.swerve, 0.3, { steer: 0.75 }, "power2.out");
  st(t.swerve, t.lets - t.swerve, { aim: 14 }, "sine.out");
  st(t.swerve + 0.12, t.lets - t.swerve, { yaw: 14 }, "sine.out");
  st(t.swerve, t.catch - t.swerve, { lane: 0.8 }, "sine.inOut");
  // the camera rises in front of the car: the boar goes under it, toward your nose
  shot(t.swerve, t.catch - t.swerve, RISE, glide(0.8, 0.4)); // (straight, not by ratio: the aim reaches the car early)
  st(t.swerve, t.catch - t.swerve, { fx: 0, fy: 0, fz: -300, fs: 1500 }, "sine.inOut");

  /* ───────────── "…et l'arrière de ta voiture décroche." ───────────── */
  // on "décroche": the rear goes right — yaw runs past aim; the trails, the écart, the answer: signal
  st(t.lets + 0.1, t.catch - t.lets, { yaw: 34 }, "power2.in");
  st(t.lets + 0.1, 0.5, { slide: 1 }, "sine.out");
  now(t.lets + 0.25, { alarm: 1 });
  D.punch(t.lets + 0.48, 0.06, { up: 0.1 }); // « …décroche. » — stamped in the breath (sfx hit, lets+0.53)

  /* ───────────── "Elle se rattrape seule : elle freine une roue. Pas les quatre." ───────────── */
  // time stops (nothing scrolls, nothing turns); the camera orbits the frozen car to its front-right corner
  shot(t.catch, t.reflex - t.catch, CORNER, glide(0.4, 0.9));
  st(t.catch, t.reflex - t.catch, { fx: 0, fy: 30, fz: -150, fs: 900 }, "sine.inOut");
  // "roue": the front-right corner bites — the pressure, the pads, the disc and the rim go veille
  st(t.onewheel, 0.4, { bFR: 1, litFR: 1 }, "power2.out");
  // "Pas": the four corners light; "quatre": three go out, the front-right stays
  st(t.notfour + 0.08, 0.15, { litCorners: 1 }, "power2.out");
  st(t.four + 0.3, 0.35, { litCorners: 0 }, "sine.inOut");

  /* ───────────── "Et ce réflexe, elle le doit… à un élan." ───────────── */
  // on round the right flank, looking across the car at the left verge, where the beams sweep: on "élan" the moose
  st(t.reflex, 0.4, { bFR: 0, litFR: 0 }, "sine.inOut");
  shot(t.reflex, t.toscene - t.reflex, MOOSE, glide(0.9, 0.5));
  st(t.reflex, t.moose1 - t.reflex, { fx: -350, fy: 60, fz: -300, fs: 1600 }, "sine.inOut");
  now(t.reflex, { mooseAt: 1 });
  st(t.moose1 + 0.1, 0.45, { moose: 1 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "Ton volant dit : à gauche." ───────────── */
  // the moose goes; time starts again (barely: the car is sliding sideways — the boar must not be reached);
  // back to the map, and on "gauche" the ink arrow, where the wheel asks
  st(t.toscene, 0.35, { moose: 0 }, "sine.in");
  // (slow, over the whole sentence and on to "toupie": the moving camera must stay calm — qa)
  shot(t.toscene, t.toupie - t.toscene, TOP, "sine.inOut");
  st(t.toscene, t.pivot - t.toscene, { fx: 0, fy: 0, fz: -200, fs: 1500 }, "sine.inOut");
  st(t.toscene, t.tosystem - t.toscene, { gap: 0.65, rolled: V * t.catch + 4 }, "sine.inOut");
  st(t.left + 0.08, 0.35, { arrows: 1 }, "sine.out");

  /* ───────────── "Ta voiture, elle, pivote trop." ───────────── */
  // on "pivote": the car's arrow runs past the ink one
  st(t.pivot + 0.1, t.toupie - t.pivot, { yaw: 55 }, "sine.inOut");

  /* ───────────── "Elle commence une toupie." ───────────── */
  // a pull-back to the wide frame: the car across the road slides toward the left ditch
  shot(t.toupie, t.counter - t.toupie + 0.4, WIDE_T, "sine.inOut", TOP.d);
  st(t.toupie, t.counter - t.toupie, { yaw: 75, lane: 2.2 }, "sine.in");
  st(t.toupie, t.counter - t.toupie, { fx: -100, fy: 0, fz: -250, fs: 4000 }, "sine.inOut");

  /* ───────────── "Contre-braquer ?" ───────────── */
  // CUT 1 (from the car across the road to the wheel you turn): your hands, the wheel, its sensor (the car's frame)
  cut(t.counter, SET.ROAD, HANDS, { onboard: 1, yaw: 75, fx: STEERING.x, fy: STEERING.y, fz: STEERING.z, fs: 220 });
  // (a close gesture: turned over the whole phrase, and the road does not turn behind it)
  st(t.counter + 0.05, t.late - t.counter - 0.1, { steer: -0.8, aim: HANDOFF.aim }, "sine.inOut");
  shot(t.counter, t.late - t.counter, { d: HANDS.d * 0.93 }, "sine.out");

  /* ───────────── "Trop tard… ou trop fort." ───────────── */
  // CUT 2 (back to the wide frame, the road's): nothing answers — the car goes on turning, the arrows part
  cut(t.late, SET.ROAD, { ...WIDE, d: WIDE.d * 1.03 }, { onboard: 0, fx: -100, fy: 0, fz: -250, fs: 4000 });
  st(t.late, t.strong - t.late, { yaw: 85 }, "sine.out");
  shot(t.late, t.tosystem - t.late, WIDE, "sine.inOut");
  // "fort": the rear whips the other way — the car thrown toward the other ditch; then time stops on HANDOFF
  st(t.strong + 0.05, 0.6, { yaw: HANDOFF.yaw, steer: HANDOFF.steer, lane: HANDOFF.lane }, "power2.inOut");
  // « fort » stamped (sfx hit, strong+0.36) — short: it has let go before the cut to the system
  D.punch(t.strong + 0.31, 0.06, { up: 0.1, hold: 0.08, down: 0.3 });

  /* ───────────── the silence before "Alors…" ───────────── */
  // a CUT (the signature line needs a calm, readable picture): the system in the glass car, then a very slow push
  // (it lands exactly on VIEW.system, the pose act 2's benchCut starts from)
  cut(t.tosystem, SET.ROAD, { ...VIEW.system, d: VIEW.system.d * 1.04 }, { onboard: 1, shell: 0.4, slide: 0, arrows: 0, fx: CX, fy: CY, fz: CZ, fs: 600 });
  shot(t.tosystem, t.tobench - t.tosystem, VIEW.system, "sine.out");
}
