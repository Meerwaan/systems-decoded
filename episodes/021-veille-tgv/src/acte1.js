// 01 · MENACE — from the first frame to "Alors…" (0 → tosystem). One movement, two cuts (the plan's two).
//
// THE HOOK. The first frame (POSE0 / FIRST) is taken at rail level, by the nose: the glass nose rushing at us, its
// cab lit, the seat EMPTY behind the windscreen. It is already moving — the world streams past (`run`), the camera
// rises to the windscreen ("Ton TGV file à 255 kilomètres-heure."), goes through it and lands on the empty seat on
// "personne". From the seat it dives to the knee space under the desk: the pedal, the box behind the glass face —
// on "l'arrête" its dial lights up and counts down, signal: it runs out with nobody there; the camera closes in on
// the dial and on "angle" its blind spot comes into the ring.
// THE SCENE. Cut 1 (the same cab, from outside): the cab's lit window, empty, the night streaming behind the glass.
// The date; "le conducteur tombe du train" is told on THAT window and nothing else — the camera only draws back.
// Then it rises and flies back along the power car, over the first trailer, turned forward: on "passagers" the rows
// light up front to back; "Aucun ne le voit": between them and the lit cab, the dark power car. Cut 2 (we keep
// going forward, and down): rail level by the front bogie, the masts streaking — one crosses the middle on
// "seconde" — and the camera climbs up through the glass to the system under the desk. Act 2 cuts from VIEW.system.
//
// TACT: nobody is in the cab, ever. Nothing opens, nothing falls; the door at the back stays shut.
// The header never moves in this act: 255 km/h — the train runs on.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, MPS } from "./world.js";

/* ── the poses (from the sets' journals, checked with `look`) ── */
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// still outside, higher: the windscreen ahead, the hood under it, the empty seat lit behind the glass
const APPROACH = { ...P, tx: -850, ty: 290, tz: 0, d: 560, az: -64, el: 6, fov: 42, shift: 80, drift: 0.2 };
// inside, from the windscreen: the EMPTY seat, the closed door behind it
const CAB = { ...VIEW.cab, drift: 0.2 };
// the knee space under the desk: the pedal, and through the glass face the box and its dial (from a little more to
// the side than VIEW.system: the dial whole at the top left, the pedal and its spring in the middle, no flare)
const KNEES = { ...P, tx: -825, ty: 178, tz: 5, d: 260, az: -20, el: 24, shift: 40 };
// …and VIEW.system, where act 2 opens it
const SYS = { ...VIEW.system };
// the dial, close, through the desk's glass side
const DIAL = { ...VIEW.dialCab };
// outside, the cab's left side: the lit window, empty
const SIDE = { ...VIEW.side, d: 900 };
// halfway: high and wide over the power car (closer, its transformer fills the picture as the camera flies over it)
const OVER = { ...P, tx: 400, ty: 300, tz: 0, d: 2600, az: 35, el: 30, fov: 34, shift: 100 };
// over the first trailer, turned forward to the power car and its lit cab
const PAX = { ...VIEW.pax };
// rail level by the front bogie
const RAIL = { ...VIEW.rail };

// the light: what it stands around, and how wide
const L_CAB = { fx: -700, fy: 240, fz: 0, fs: 250 };
const L_SYS = { fx: -820, fy: 185, fz: 15, fs: 120 };
const L_DIAL = { fx: -850, fy: 195, fz: 7, fs: 70 };
const L_SIDE = { fx: -790, fy: 290, fz: 0, fs: 600 };
const L_PAX = { fx: 1000, fy: 300, fz: 0, fs: 2500 };
const L_RAIL = { fx: -700, fy: 70, fz: 0, fs: 700 };

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    n255: "accroche:255", cabine: "cabine", personne: "personne", word: "accroche:personne",
    promesse: "promesse", seul: "seul", stops: "stops", angle: "angle", angleW: "promesse:angle",
    toscene: "toscene", date: "date", driver: "driver", behind: "behind", passengers: "passengers",
    nobody: "nobody", toride: "toride", persec: "persec", second: "scene:seconde", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);
  /** The header's speed answers a word (it never changes in this act). */
  const pulse = (at) => tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, at);

  /* ── the world comes to the train: ≈ 70.8 m every film second, in a straight line, all act long ── */
  // (one straight line to `tosystem`: act 2 cuts there on run = MPS × tosystem, so the masts do not hop)
  st(0, t.tosystem, { run: MPS * t.tosystem }, "none");

  /* ═════════════ THE HOOK ═════════════ */
  /* ───────────── "Ton TGV file à 255 kilomètres-heure." ───────────── */
  // moving from the first frame (fastest at the start), rising toward the windscreen; it does not slow down
  shot(0, t.cabine, APPROACH, glide(1.3, 1.5));
  st(0, t.cabine, { fx: -760, fy: 260, fs: 700 }, "sine.inOut");
  pulse(t.n255);

  /* ───────────── "Dans la cabine… plus personne." ───────────── */
  // through the windscreen (glass), landing on the empty seat on "personne"
  const onSeat = t.word + 0.06;
  shot(t.cabine, onSeat - t.cabine, CAB, glide(0.7, 0));
  st(t.cabine, onSeat - t.cabine, { ...L_CAB }, "sine.inOut");
  const toDive = t.promesse + 0.02;
  shot(onSeat, toDive - onSeat, { d: CAB.d * 0.95 }, "sine.out");

  /* ───────────── "Il va s'arrêter tout seul. Mais ce qui l'arrête… a un angle mort." ───────────── */
  // from the seat, down to the knee space under the desk; on "l'arrête" the dial lights and counts, signal
  const atSys = t.stops - 0.05;
  shot(toDive, atSys - toDive, KNEES, "sine.inOut");
  st(toDive, atSys - toDive, { ...L_SYS, shell: 0.6 }, "sine.inOut");
  now(t.stops, { danger: 1 });
  st(t.stops, 0.35, { litBox: 0.6 }, "sine.out");
  st(t.stops, t.toscene - 0.04 - t.stops, { count: 0.6 }, "none");
  // …closer on the dial; on "angle" its blind spot comes into the ring
  // (leaves as soon as it lands on the knees, and closes in by ratio over 1.4 s: in centimetres over 0.9 s it jerked)
  const atDial = t.angleW + 0.3;
  shot(atSys, atDial - atSys, DIAL, "sine.inOut", KNEES.d);
  st(atSys, atDial - atSys, { ...L_DIAL }, "sine.inOut");
  st(t.angleW, 0.4, { blind: 1 }, "sine.out");
  shot(atDial, t.toscene - 0.02 - atDial, { d: DIAL.d * 0.94 }, "sine.out");

  /* ═════════════ THE SCENE ═════════════ */
  /* ───────────── "Ce n'est pas un scénario. Vingt-quatre décembre 2024 : le conducteur tombe du train." ───────────── */
  // cut 1 — the same cab, from outside: its lit window, empty, the night streaming behind the glass. The camera
  // only draws back, slowly. Nothing opens, nobody appears.
  cut(t.toscene, SET.LINE, SIDE, { ...STAGED, count: 1, danger: 0, ...L_SIDE });
  shot(t.toscene, t.behind - 0.02 - t.toscene, { d: 1300 }, "sine.inOut", SIDE.d);
  chip("chip-date", null, 96, 470, t.date, t.behind - 0.2);

  /* ───────────── "Derrière lui, 393 passagers. Aucun ne le voit." ───────────── */
  // it rises and flies back along the power car, over the first trailer, turned forward; on "passagers" the rows
  // light up front to back
  // (a half turn of azimuth: it takes until "Aucun", 2.6 s, and leaves from rest — in 1.8 s it was the jerkiest move)
  const atPax = t.nobody - 0.04;
  const over = t.behind + 0.45 * (atPax - t.behind);
  shot(t.behind, over - t.behind, OVER, glide(0, 1.5));
  shot(over, atPax - over, PAX, glide(1.4, 0.1));
  st(t.behind, atPax - t.behind, { ...L_PAX }, "sine.inOut");
  st(t.passengers + 0.1, 0.9, { pax: 1 }, "sine.out");
  chip("chip-393", null, 96, 470, t.passengers, t.toride - 0.25);
  shot(atPax, t.toride - 0.02 - atPax, { d: PAX.d * 0.9 }, "sine.out");

  /* ───────────── "Et le train avale soixante-dix mètres par seconde." ───────────── */
  // cut 2 — on forward, and down: rail level by the front bogie, the masts streaking (one crosses the middle on
  // "seconde"); then up through the glass to the system under the desk, where act 2 opens it
  cut(t.toride, SET.LINE, RAIL, { ...STAGED, count: 1, danger: 0, ...L_RAIL });
  // (the climb leaves on "mètres": 1.8 s, not 1.3 — the end on VIEW.system at tosystem is act 2's cut)
  const climb = t.persec - 0.5;
  shot(t.toride, climb - t.toride, { d: RAIL.d * 0.95 }, "sine.out");
  chip("chip-70", null, 96, 470, t.persec - 0.2, t.tosystem - 0.15);
  shot(climb, t.tosystem - climb, SYS, "sine.inOut", RAIL.d * 0.95);
  st(climb, t.tosystem - climb, { ...L_SYS, shell: 0.4 }, "sine.inOut");
}
