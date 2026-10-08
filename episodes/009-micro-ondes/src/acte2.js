// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (todoor → tozero).
//
// The door, closed on its oven, while everything round it fades; the same door on the bench, at the same place of the
// picture (benchCut); it opens into its layers and each part is named on its word, in one gliding move — the glass,
// the plate (and the camera goes down to its holes on "percée de trous") — then a cut to the door's free edge, seen
// from behind: the two hooks.
// Then the heart of the film, back in the kitchen: ONE wave of the oven laid against the plate, from inside the
// cavity — twelve centimetres across the picture, and the hole it would have to go through, a dot; a cut to the
// other side of the plate and a dive to that one hole; a thread of light goes through it, at ease, and the camera
// turns round the hole to see it from the side. "Tu vois ton plat" is a cut on that thread (same height, same way
// across the picture) to the profile of act 1: where the wave bounced, the light now runs from your dish to your
// eyes. From there ONE move to the end of the act: the threshold does not stop the film — the camera closes on the
// handle, your hand comes up to it, the field swells again behind the door. Act 3 cuts from there.
//
// The plate's lattice makes bands when it fills the picture at a slant with holes of 6 to 13 px (d 40–90 at 28 mm):
// it is only ever crossed by a dive by ratio (a few blurred frames) or by a cut. The pull-back from the hole to
// your eye was tried: a pale striped slab over the whole picture for half a second — hence the cut.
// Legends are written where the picture is black (measured): on the pale plate they cannot be read.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, BENCHED, STAGED, DOOR } from "./world.js";

// where the door hangs in the kitchen, counted from where it stands on the bench
const HOME = DOOR.home.map((v, i) => v - DOOR.bench[i]);
// the bench's light, stood round the door on its oven: the door is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
/* ── in the kitchen: the door, alone ── */
const SHUT = { ...P, tx: -8, ty: 161, tz: 57.3, d: 185, az: -40, el: 6, shift: 160 }; // the cut to the bench leaves from here
const SHUT_FAR = { ...SHUT, d: 212 };
/* ── on the bench ── */
// the five layers apart (lower than VIEW.exploded: the push to the glass that follows is then one straight move, not a crane)
const LAYERS = { ...P, tx: 0, ty: 21, tz: 5, d: 275, az: -50, el: 14, shift: 130, side: 50 };
// the stack from lower and closer: every layer is a sheet, the one that is lit is the one that is named — and over the
// stack the picture is black: that is where the legends are written
const GLASS = { ...P, tx: -2, ty: 22, tz: 8, d: 190, az: -52, el: 6, shift: 55 };
const MESH = { ...P, tx: -6, ty: 22, tz: 2, d: 190, az: -46, el: 6, shift: 55 };
// the bottom left corner of the perforated field, from beside the layers that stand in front of the plate (the camera
// is to the left of the glass and of the frame: neither crosses the picture). Under the plate, the dark bench: the captions
const HOLES = { ...P, tx: -12.5, ty: 11.2, tz: 0, d: 28, az: -46, el: 8, shift: 160, drift: 0 };
const HOLES_NEAR = { ...HOLES, d: 22 };
// the door's free edge from BEHIND, almost in profile (the hooks cannot be seen from its front): they stick out of its
// back, on black. The picture is pushed to the left (`side`): its right is empty, and the legend is written there
const EDGE = { ...P, tx: 19, ty: 21, tz: -9, d: 132, az: 112, el: 7, shift: 160, side: 250 };
const HOOKS = { ...P, tx: 19, ty: 21, tz: -11, d: 102, az: 106, el: 6, shift: 160, side: 350 };
/* ── in the kitchen: the wave, the hole, the light ── */
// ONE wave against the plate, from inside the cavity. The marked hole is the centre of the picture, 170 px above its
// middle: the wave's right end stays above TikTok's buttons — and the hole is at the same place after the cut
const RULER = { ...P, tx: -7.7, ty: 161.2, tz: 56.7, d: 30, az: 166, el: 5, fov: 50, shift: 170 };
const RULER_FAR = { ...RULER, d: 32.5 };
// the same hole from the room: the plate at 30 cm, then ONE hole, 170 px across
const PLATE = { ...P, tx: -8, ty: 161, tz: 57, d: 30, az: -18, el: 6, fov: 30, shift: 170, drift: 0 };
const HOLE = { ...PLATE, d: 3.2 };
// round the hole, to see from the side what goes through it: the thread leaves for the right of the picture, level
const THREAD = { ...PLATE, d: 5.5, az: -56, el: 4 };
// the profile of act 1 ("presque rien ne sort"): the dish, the plate edge-on, the gap, your eyes — the thread through
// the marked hole lies where the macro left it (y ≈ 790, from the middle of the picture to its right)
// (aimed 3 cm inside the oven: the dish is whole in the picture for as long as "tu vois ton plat" is being said)
const SIGHT = { ...P, tx: -8, ty: 160.5, tz: 55.5, d: 180, az: -86, el: 0, fov: 30, shift: 150, drift: 0 };
// the handle, in the gap between the door and your face
const HANDLE = { ...P, tx: 0, ty: 158, tz: 64, d: 118, az: -80, el: -6, fov: 30, shift: 110 };

export default function acte2({ D, co }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    ouvre: "ouvre", todoor: "todoor", tobench: "tobench", explode: "explode",
    p1: "p1", p2: "p2", percee: "eclate:percée", trous: "eclate:trous", milli: "eclate:millimètre",
    et: "eclate:sur-0.2", p3: "p3",
    towave: "towave", wave: "wave", douze: "repos:douze", x80: "repos:quatre", big: "big", trou: "repos:trou",
    light: "light", minus: "repos:minuscule", tu: "repos:tu",
    toseuil: "toseuil", seuil: "seuil", plein: "seuil:plein", chauffage: "seuil:chauffage", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── "Alors…" — the door, closed on its oven. Everything round it fades: it stays alone ───────────── */
  // (you are all or nothing: you have left on the cut. The lamp is a light of the kitchen: it goes out before the
  // cut to the bench, or the door would change light on it)
  cut(t.todoor, SET.KITCHEN, SHUT_FAR, { ...STAGED, ...LIT, you: 0, litGlass: 0, litMesh: 0, litHooks: 0, spin: 0.1 * t.todoor });
  const alone = t.tobench - t.todoor;
  st(t.todoor, alone, { spin: 0.1 * t.tobench }, "none");
  shot(t.todoor + 0.02, alone - 0.02, SHUT, "sine.inOut", SHUT_FAR.d);
  st(t.todoor + 0.06, alone * 0.75, { shell: 0, body: 0, seen: 0, light: 0, lamp: 0 }, "sine.inOut");
  st(t.todoor + 0.06, Math.min(0.45, alone * 0.6), { mood: 0 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same door on the bench, at the same place; then its layers come apart ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: SHUT, origin: HOME, state: { ...BENCHED, pool: 0, grid: 0 } });
  const toGlass = t.p1 - 0.3;
  st(t.explode, (t.p1 - t.explode) * 0.72, { explode: 1 }, "none");
  shot(t.explode + 0.1, toGlass - 0.15 - t.explode - 0.1, LAYERS, "sine.inOut", bench.d);

  /* ───────────── "Une vitre." ───────────── */
  shot(toGlass, 0.7, GLASS, "sine.inOut", LAYERS.d);
  st(t.p1, 0.3, { litGlass: 1 }, "sine.out");
  // (ink, not veille: the glass is not what protects you — the chute will say so)
  const cGlass = co.add({ title: "Vitre", sub: "Laisse passer les ondes", x: 470, y: 468, align: "end", anchor: { x: -15.6, y: 31.8, z: 11.4 } });
  cGlass.show(tl, t.p1 - 0.02);
  cGlass.hide(tl, t.p2 - 0.14);

  /* ───────────── "Une plaque de métal, percée de trous d'un millimètre et demi." ───────────── */
  shot(t.p2 - 0.1, 0.8, MESH, "sine.inOut");
  st(t.p2 - 0.05, 0.3, { litGlass: 0 }, "sine.inOut");
  st(t.p2 + 0.05, 0.3, { litMesh: 1 }, "sine.out");
  const cMesh = co.add({ title: "Plaque perforée", sub: "Arrête les ondes", x: 470, y: 468, align: "end", tone: "system", anchor: { x: -16.6, y: 32.6, z: 0.2 } });
  cMesh.show(tl, t.p2 + 0.15);
  cMesh.hide(tl, t.percee - 0.2);
  // "percée de trous": the camera goes down to them (fast: the lattice is crossed in a few blurred frames)…
  const atHoles = t.trous + 0.15;
  shot(t.percee - 0.1, atHoles - t.percee + 0.1, HOLES, "sine.inOut", MESH.d);
  st(t.percee, 0.4, { litMesh: 0.35 }, "sine.inOut"); // (from close the holes are the picture: the glow steps back)
  // …and on "un millimètre et demi" it leans on them: the size of ONE hole
  const tohooks = t.et - 0.12;
  shot(atHoles, tohooks - atHoles, HOLES_NEAR, "sine.inOut", HOLES.d);
  chip("chip-trou", null, 96, 470, t.milli, tohooks - 0.14);

  /* ───────────── "Et sur le bord… deux crochets." — the door's free edge, from behind ───────────── */
  // one slow push toward the edge for the whole sentence; the two hooks light up on "deux", and the legend comes on a
  // picture that has all but stopped (a closer shot of ONE hook was tried: no time left to read its legend)
  cut(tohooks, SET.BENCH, EDGE, { litMesh: 0 });
  shot(tohooks + 0.02, t.towave - 0.1 - tohooks, HOOKS, "sine.inOut", EDGE.d);
  // (`p3` is said on "deux": the sound's blip falls on it too)
  st(t.p3 - 0.1, 0.25, { litHooks: 1 }, "sine.out");
  const cHooks = co.add({ title: "Crochets", sub: "Tiennent 2 interrupteurs", x: 620, y: 560, align: "start", tone: "system", elbow: 30, anchor: { x: 19, y: 30.2, z: -20.4 } });
  cHooks.show(tl, t.p3);
  cHooks.hide(tl, t.towave - 0.3);

  /* ───────────── "L'onde du four mesure douze centimètres :" — ONE wave against the plate, from inside the cavity ───────────── */
  const heat = { ...STAGED, litGlass: 0, litMesh: 0, litHooks: 0, you: 0, light: 0, ruler: 0 };
  cut(t.towave, SET.KITCHEN, RULER_FAR, { ...heat, spin: 0.1 * t.towave, fx: -8, fy: 161, fz: 50, fs: 30 });
  st(t.towave, t.tozero - t.towave, { spin: 0.1 * t.tozero }, "none");
  shot(t.towave + 0.02, t.big - t.towave - 0.02, RULER, "sine.inOut", RULER_FAR.d);
  // "mesure": the field steps aside and the wave is drawn, from one end to the other; "douze centimètres": its ends
  const drawn = t.douze + 0.3;
  st(t.wave, drawn - t.wave, { ruler: 0.6 }, "sine.inOut");
  st(drawn, 0.4, { ruler: 0.78 }, "sine.out");
  chip("chip-onde", null, 96, 470, t.douze, t.x80 - 0.14);
  // "quatre-vingts fois trop": the mark on the hole it would have to go through — a dot on the wave
  st(t.x80, 0.4, { ruler: 1 }, "sine.out");
  chip("chip-x80", null, 96, 470, t.x80 + 0.05, t.big - 0.14);

  /* ───────────── "…grande pour le trou." — the other side of the plate, and a dive to that ONE hole ───────────── */
  cut(t.big, SET.KITCHEN, PLATE, { ruler: 0, fx: -8, fy: 161, fz: 57, fs: 20 });
  const atHole = t.trou + 0.12;
  shot(t.big + 0.02, atHole - t.big - 0.02, HOLE, "sine.inOut", PLATE.d);
  // (the same label as on the bench, at the same place: it only has to come and go again)
  tl.fromTo("#chip-trou", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t.trou - 0.05);
  tl.to("#chip-trou", { opacity: 0, duration: 0.12 }, t.minus - 0.2);

  /* ───────────── "La lumière, minuscule, passe :" — a thread of light through the hole, at ease ───────────── */
  st(t.light, 0.6, { light: 1 }, "sine.out");
  // the camera turns round the hole: the thread, seen from the side, goes through and off to your eye
  const tosight = t.tu - 0.12;
  shot(t.light - 0.1, tosight - t.light + 0.1, THREAD, "sine.inOut", HOLE.d);
  chip("chip-light", null, 96, 470, t.minus - 0.05, tosight - 0.14);

  /* ───────────── "…tu vois ton plat." — a cut on the thread, to the profile: your dish, the plate, your eyes ───────────── */
  // (the field makes room for the dish: `seen`; the oven heats all the same)
  cut(tosight, SET.KITCHEN, SIGHT, { you: 1, seen: 0.3, fx: -8, fy: 158, fz: 62, fs: 70 });

  /* ───────────── the threshold — "Abonne-toi : on ouvre cette porte en plein chauffage." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: ONE move from the profile to
  // the handle — slow while the dish is being seen, under way when the call is said —, your hand comes up to the bar,
  // the field swells again behind the door and the header's clock answers "chauffage".
  // (the chevrons and the lit name need a third of a second to leave: they are gone when act 3 cuts)
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  shot(tosight + 0.02, t.tozero - tosight - 0.02, HANDLE, "sine.inOut", SIGHT.d);
  st(t.toseuil, t.seuil + 0.3 - t.toseuil, { light: 0.25 }, "sine.inOut"); // the threads have said what they had to: they make room for the hand
  st(t.seuil + 0.3, t.plein - t.seuil - 0.3, { pull: 0.5 }, "sine.inOut");
  st(t.plein - 0.25, 0.6, { seen: 1 }, "sine.inOut");
  const beat = Math.min(t.chauffage, t.tozero - 0.7);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.16, color: "#ff5b2e", duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%" }, beat);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.36, ease: "power2.out" }, beat + 0.3);
}
