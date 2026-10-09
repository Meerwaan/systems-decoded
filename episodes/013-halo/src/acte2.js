// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Time stops where act 1 left it: the cell in the barrier. The steel, the track and the body of the car dissolve —
// what was hidden behind the top beam stays alone: the system. The same object on the bench, at the same place of
// the picture (benchCut); it opens — the halo lifts off the cell, its three fixings between them — and the voice
// names its parts in ONE travelling: the ring, high and alone ("Un arceau de titane") → the halo comes part of the way
// down again while you appear in the seat, and its foot stands in front of your visor ("Un pied, devant tes yeux")
// → back along the ring to the two stacks behind your head: shoe, plate and studs, seat ("Deux ancrages") → out and
// down to the whole tub, which the halo comes back to ("Et dessous… ta coque de carbone"): opened, then shut.
// Then the bench TESTS it: a ram comes down on the front of the ring while the voice says so, touches it on
// "écrase", loads it on "cent kilonewtons" (the ring glows; the ram is black before it reaches the header), the
// camera goes slowly round it; on "Il n'a pas le droit de céder" you are back under the ring, the space of your head
// whole, and the ram lets go.
// The threshold does not stop the film: a cut to the track, from behind your left shoulder — the whole car of glass
// heading for the barrier, the picture of the hook coming back —, and ONE dive over your shoulder while the steel
// grows: your helmet, the ring, the barrier, in that order. The ring lights up on "entre lui et toi": it is between.
// Act 3 cuts from there to the other side of the steel.
//
// What the header forbids (measured on the ring's outline, then seen): close on the lifted halo, the far arm of the
// ring climbs behind it as soon as the camera looks down from near — hence FOOT's distance and low `shift`, MOUNTS'
// `el` 18 (on the way from one to the other the ring's upper edge comes within twenty pixels of it: not closer).
// Over your shoulder the barrier is a wall across the top of the picture: SHOULDER keeps its upper lip under it.
// What the buttons forbid: your helmet right of x 905 under y 880 (MOUNTS is not pushed aside for its label).
// What the ram forbids: a label wider than 500 px in the top slot — it comes down through it at x ≈ 610…800.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, SYSTEM } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// where the system stands on the track, counted from where it stands on the bench
const HOME = SYSTEM.bench.map((v) => -v);
// the bench's light, stood round the system in the car: it is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

/* ── on the track: the system, alone ── */
const ALONE = VIEW.system; // the cut to the bench leaves from here
const ALONE_FAR = { ...ALONE, d: 950 };
const A_LEFT = 1.4; // metres: where act 1 left the barrier

/* ── on the bench: the halo lifted off, and its parts ── */
const OPEN = { ...VIEW.exploded, side: 80 }; // (the front bulkhead out of the buttons' column)
// the ring, 70 cm above the tub (explode 1)
const RING = { ...P, tx: 0, ty: 142, tz: -50, d: 520, az: -40, el: 14, shift: 240, side: 40 };
// the halo a little lower (HALF): the foot, and your visor just behind its base. (Closer, or looking down from
// higher, the far arm of the ring climbs behind the header: seen at d 340, shift 20.)
const FOOT = { ...P, tx: 0, ty: 90, tz: -30, d: 380, az: -32, el: 17, shift: -5, side: -17 };
// the two stacks behind your head — shoe · plate and studs · seat — the near one large, the far one past your headrest
const MOUNTS = { ...P, tx: 0, ty: 80, tz: -88, d: 400, az: -52, el: 18, shift: 70, side: 0 };
// the whole tub, the halo over it
const TUB = { ...P, tx: 0, ty: 36, tz: 10, d: 1100, az: -46, el: 16, shift: 120, side: 50 };
// `explode` while the camera visits the parts. It is eased part by part: at 0.5 the halo is still ≈ 48 cm up (70 at 1)
// and its fixings have just left their seats — the three levels of a stack then fit in one close frame.
const HALF = 0.5;
/* ── on the bench: the test ── */
const PRESS = { ...VIEW.pressPart, shift: 160 };
const PRESS_FAR = { ...PRESS, d: 540, az: -30 };
const PRESS_ROUND = { ...PRESS, az: -50 };
/* ── on the track: the threshold, from the track side, behind your left shoulder ── */
const BEHIND = { ...P, tx: 0, ty: 40, tz: 150, d: 1700, az: 150, el: 22, fov: 30, shift: 40, side: 120 };
const SHOULDER = { ...P, tx: 0, ty: 76, tz: 30, d: 520, az: 140, el: 14, shift: 10, side: 60 };
const A_FAR = 9; //    the barrier, five metres ahead of the nose
const A_NEAR = 5.7; // …and about to touch (act 3 cuts at STAGED: 5.6)

// the light: what it stands around, and how wide
const L_BENCH = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_RING = { fx: 0, fy: 120, fz: -50, fs: 110 };
const L_FOOT = { fx: 0, fy: 85, fz: -30, fs: 80 };
const L_MOUNTS = { fx: 0, fy: 76, fz: -88, fs: 80 };
const L_PRESS = { fx: 0, fy: 70, fz: -40, fs: 120 };
const L_CAR = { fx: 0, fy: 50, fz: 200, fs: 600 };
const L_HEAD = { fx: 0, fy: 74, fz: 60, fs: 260 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip, jolt } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    p1: "p1", p2: "p2", devant: "eclate:devant", yeux: "eclate:yeux",
    p3: "p3", cotes: "eclate:côtés", dessous: "eclate:dessous", p4: "p4", carbone: "eclate:carbone",
    torepos: "torepos", crush: "crush", kn: "kn", kilo: "repos:kilonewtons", poids: "repos:poids", bus: "bus",
    il: "repos:Il", pas: "repos:pas", hold: "hold",
    toseuil: "toseuil", seuil: "seuil", rail: "seuil:rail", entre: "seuil:entre", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);
  /** The time between two instants of the script — never less than `min` (the voice is not recorded yet: a gap may shrink). */
  const span = (from, to, min = 0.25) => Math.max(min, to - from);

  /* ───────────── "Alors…" — time stops. The steel, the track, the car's body dissolve: the system stays alone ───────────── */
  cut(t.tosystem, SET.TRACK, ALONE_FAR, { ...STAGED, ahead: A_LEFT, litHalo: 1, sec: 0, ...LIT });
  const alone = t.tobench - t.tosystem;
  shot(t.tosystem + 0.02, alone - 0.02, ALONE, "sine.inOut", ALONE_FAR.d);
  // (you go with the rest: the bench takes the system, not its driver — you come back on "devant tes yeux")
  st(t.tosystem + 0.04, alone * 0.7, { shell: 0, you: 0, litHalo: 0 }, "sine.inOut");
  st(t.tosystem + 0.04, Math.min(0.45, alone * 0.6), { mood: 0 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same system on the bench, at the same place; the halo lifts off ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: ALONE, origin: HOME, state: { ...BENCHED, pool: 0, grid: 0 } });
  const opening = Math.min(1.3, span(t.explode, t.p1 - 0.15, 0.9));
  st(t.explode, opening, { explode: 1 }, "none");
  shot(t.explode + 0.05, opening, OPEN, "sine.inOut", bench.d);

  /* ───────────── "Un arceau de titane." — the ring, high and alone ───────────── */
  const toRing = span(t.p1, t.p2 - 0.3, 0.6);
  shot(t.p1 - 0.05, toRing, RING, "sine.inOut", OPEN.d);
  st(t.p1 - 0.05, toRing, L_RING, "sine.inOut");
  st(t.p1, 0.3, { litHalo: 1 }, "sine.out");
  const cHalo = co.add({ title: "Halo", sub: "Titane", x: 940, y: 520, align: "end", tone: "system", anchor: A.halo });
  cHalo.show(tl, t.p1 + 0.35);
  cHalo.hide(tl, t.p2 - 0.12);

  /* ───────────── "Un pied, devant tes yeux." — the halo comes half-way down, you appear: its foot is in front of your visor ───────────── */
  // (the camera and the halo come down together, on the same ease: the foot stays in the frame all the way)
  const toFoot = span(t.p2, t.yeux + 0.15, 0.7);
  shot(t.p2 - 0.05, toFoot, FOOT, "sine.inOut", RING.d);
  st(t.p2 - 0.05, toFoot, { explode: HALF, ...L_FOOT }, "sine.inOut");
  st(t.p2 - 0.12, 0.25, { litHalo: 0 }, "sine.inOut");
  st(t.p2, 0.3, { litFoot: 1 }, "sine.out");
  st(t.devant - 0.1, 0.45, { you: 1 }, "sine.out");
  const cFoot = co.add({ title: "Le pied", x: 810, y: 790, align: "start", tone: "system", anchor: A.foot });
  cFoot.show(tl, t.p2 + toFoot * 0.6);
  cFoot.hide(tl, t.p3 - 0.15);

  /* ───────────── "Deux ancrages, sur les côtés." — back along the ring, to the two stacks behind your head ───────────── */
  const toMounts = span(t.p3, t.cotes - 0.1, 0.7); // (it is there before "sur les côtés")
  shot(t.p3 - 0.1, toMounts, MOUNTS, "sine.inOut", FOOT.d);
  st(t.p3 - 0.1, toMounts, L_MOUNTS, "sine.inOut");
  st(t.p3 - 0.15, 0.25, { litFoot: 0 }, "sine.inOut");
  st(t.p3, 0.3, { litMounts: 1 }, "sine.out");
  // (the label stands over the near shoe, left of the tube that enters it; its leader comes up the left of the stack.
  // The far stack glows too, past your headrest)
  const cMount = co.add({ title: "Ancrages", sub: "× 2", x: 96, y: 490, align: "start", tone: "system", anchor: A.mountR, elbow: 8 });
  cMount.show(tl, t.p3 + toMounts * 0.55);
  cMount.hide(tl, t.dessous - 0.12);

  /* ───────────── "Et dessous… ta coque de carbone." — out and down to the whole tub; the halo comes back to it ───────────── */
  const toTub = span(t.dessous, t.carbone + 0.1, 0.8);
  shot(t.dessous - 0.1, toTub, TUB, "sine.inOut", MOUNTS.d);
  st(t.dessous - 0.1, toTub, L_BENCH, "sine.inOut");
  st(t.dessous - 0.15, 0.3, { litMounts: 0 }, "sine.inOut");
  st(t.p4, 0.4, { litCell: 0.8 }, "sine.out");
  st(t.p4 + 0.3, span(t.p4 + 0.3, t.torepos - 0.2, 0.4), { explode: 0 }, "sine.inOut");
  const cCell = co.add({ title: "Cellule de survie", sub: "Carbone", x: 600, y: 500, align: "start", tone: "system", anchor: A.cell });
  cCell.show(tl, t.p4 + 0.1);
  cCell.hide(tl, t.torepos - 0.3);

  /* ───────────── "Avant d'être autorisé en course, on l'écrase :" — the system whole, nobody in it; a ram comes down on the ring ───────────── */
  cut(t.torepos, SET.BENCH, PRESS_FAR, { ...BENCHED, ...L_PRESS });
  shot(t.torepos + 0.02, span(t.torepos, t.kn, 0.8), PRESS, "sine.inOut", PRESS_FAR.d);
  // it comes down at its own pace all through the sentence, and stops on the ring during "écrase"
  st(t.torepos + 0.05, span(t.torepos + 0.05, t.crush + 0.14, 0.5), { press: 0.3 }, "none");

  /* ───────────── "plus de cent kilonewtons." — full load: the ring glows, and does not move ───────────── */
  st(t.kn - 0.08, span(t.kn - 0.08, t.kilo + 0.1, 0.4), { press: 1 }, "sine.in");
  jolt(t.kilo + 0.1, 0.25, 0.45);

  /* ───────────── "À peu près le poids d'un bus à impériale." — slowly round the loaded ring; the figure in the top slot ───────────── */
  shot(t.kilo + 0.6, span(t.kilo + 0.6, t.hold + 0.2, 1), PRESS_ROUND, "sine.inOut");
  // (on one line this label is 700 px wide and lies across the ram: its two parts go one over the other — 414 px)
  tl.set("#chip-kn", { flexDirection: "column", alignItems: "flex-start", gap: 8 }, 0);
  chip("chip-kn", null, 96, 470, t.poids - 0.15, t.il - 0.28);

  /* ───────────── "Il n'a pas le droit de céder." — you, under the ring: the place of your head, whole. The ram lets go ───────────── */
  st(t.il - 0.05, 0.45, { you: 1 }, "sine.out");
  st(t.il, span(t.il, t.hold + 0.2, 0.5), { space: 0.7 }, "sine.inOut");
  chip("chip-tient", null, 96, 470, t.pas - 0.05, t.toseuil - 0.16);
  st(t.hold + 0.22, span(t.hold + 0.22, t.toseuil - 0.04), { press: 0 }, "sine.inOut");

  /* ───────────── the threshold — "Abonne-toi : ce rail d'acier, regarde ce qui se met entre lui et toi." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: back on the track, from the
  // track side and behind you — the whole car heading for the barrier, the picture of the hook coming back — and ONE
  // dive over your left shoulder while the steel comes (at its own steady pace: act 3 takes it over where it is):
  // your helmet, the ring, the barrier. The ring lights up on "entre lui et toi". The header's speed answers "rail".
  // (the chevrons and the lit name need a third of a second to leave: they are gone when act 3 cuts)
  cut(t.toseuil, SET.TRACK, BEHIND, { ...STAGED, ahead: A_FAR, sec: 0, ...L_CAR });
  const run = t.tozero - t.toseuil - 0.02;
  shot(t.toseuil + 0.02, run, SHOULDER, "sine.inOut", BEHIND.d);
  st(t.toseuil + 0.02, run, { ahead: A_NEAR }, "none");
  st(t.toseuil + 0.02, run, L_HEAD, "sine.inOut");
  st(Math.min(t.entre - 0.15, t.tozero - 0.6), 0.35, { litHalo: 1 }, "sine.out");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  const beat = Math.min(t.rail, t.tozero - 0.7);
  tl.fromTo("#hud-count", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, beat);
  tl.to("#hud-count", { scale: 1, duration: 0.36, ease: "power2.out" }, beat + 0.3);
}
