// DOSSIER 023 — 01 MENACE (0 → tosystem). One move, two cuts.
//
// THE HOOK, in one move and a cut. The first frame (POSE0 / FIRST) is the A330 of glass at night seen from below on its left:
// the whole wing, BOTH engines dead (their lips signal), the fuselage and its lit windows, the black sea far below.
// It moves from frame 1: the sea comes (`ahead`, straight), the altimeter loses its hundreds, the camera glides
// toward your window.
//   « …n'a plus un seul moteur »          both dead engines still in the frame
//   « Tu te poseras, vivant… »            a dive (by ratio) under the belly, to the RAT's bay
//   « …vient de sortir »                  the door opens, the spring throws the arm out, the propeller starts to turn
//   « Reste un problème : tes freins. »   a cut to the main gear in its bay: the brakes go hot
// THE SCENE. Cut 1, the flash-back: the whole plane, both engines alive, the tanks full; the camera rises over it and
// the 306 light up row after row; wider, toward the far wing, the leak and the tanks running dry (from above: seen
// from below or the side, neither the heads nor the tanks read); then down under the belly, the engines die one
// after the other (the header counts), then the three circuits, then the surfaces. Cut 2: the plane small over the
// sea, the island and its runway ahead, and the camera pushes in from behind; act 2 cuts on « Alors… » to the RAT's bay
// alone in the glass (VIEW.system) and opens it.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, FIRST, POSE0, BAY, GEAR } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [BX, BY, BZ] = BAY.at;

/* ── the poses (checked with `look`) ── */
// the hook, a little later: the same picture, nearer your window (both engines still in it)
const HOOK1 = { ...POSE0, tx: -760, ty: -150, tz: 420, d: 5000, az: -45, el: -20 };
// the bay, the RAT out under the belly: more from the front than VIEW.bay — the near engine leaves the frame, the
// propeller and its disc stand clear above the hook's cards
const BAYP = { ...P, tx: BX - 20, ty: BY - 132, tz: BZ, d: 1200, az: -62, el: -8, shift: 170 };
// the main gear in its bay, from below and in front: the wheels and the brakes, the belly above (« tes freins »)
const GEARP = { ...P, tx: GEAR.main[0] - 60, ty: -430, tz: 330, d: 1500, az: -22, el: -36, fov: 34, shift: 130 };
// the flash-back: the whole plane (VIEW.plane), then the camera rises over it: through the glass roof, the rows of
// the 306 and the tanks full in both wings
const PLANE = VIEW.plane;
const PAXP = { ...P, tx: -700, ty: 0, tz: 0, d: 6400, az: -32, el: 44, fov: 38, shift: 100 };
// still above, wider: both wings whole, their tanks running dry from the tips (at d 8400 the tips left the frame,
// and the draining with them)
const TANKS = { ...P, tx: -200, ty: -100, tz: 0, d: 12500, az: -30, el: 36, fov: 34, shift: 120 };
// down under the belly: both engines, the three circuits, the wings and the tail
const CIRC = { ...VIEW.circuits, tx: 700, d: 11000 };
// the large: the plane small over the sea, the island and its runway ahead (VIEW.wide)
const WIDE = VIEW.wide;
// …pushed in from behind (by ratio, the aim held between them): the plane grows, the island stays far ahead
const WIDE1 = { ...VIEW.wide, d: 30000, az: 85, el: 12.5 };

/* ── the light ── */
const L_PLANE = { fx: STAGED.fx, fy: STAGED.fy, fz: STAGED.fz, fs: STAGED.fs };
const L_BAY = { fx: BX, fy: BY - 110, fz: BZ, fs: 320 };
const L_GEAR = { fx: GEAR.main[0], fy: -420, fz: 330, fs: 420 };
const L_TANKS = { fx: -200, fy: -100, fz: 0, fs: 3500 };
const L_CIRC = { fx: 400, fy: -260, fz: 0, fs: 3000 };
const L_WIDE = { fx: WIDE.tx, fy: WIDE.ty, fz: 0, fs: 8000 };

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip } = D;
  const { A } = world.avion;
  const t = D.times({
    atlantic: "atlantic", nomotor: "nomotor", alive: "alive", out: "out", problem: "problem", brakes0: "brakes0",
    toscene: "toscene", airbus: "airbus", pax: "pax", leak: "leak", empty: "empty",
    nomore: "nomore", motors: "scene:moteurs", gens: "gens", pressure: "pressure", surfaces0: "surfaces0",
    runway0: "runway0", azores: "azores", tosystem: "tosystem",
  });
  setAct(tl, 1, 0);

  /* ── the altimeter loses its hundreds all through the act (the plane glides) ── */
  st(0, t.tosystem, { alt: 10300 }, "none");

  /* ═════════════ THE HOOK ═════════════ */
  /* « Au-dessus de l'Atlantique, ton avion n'a plus un seul moteur. » — the sea comes, the camera glides to your window */
  st(0, t.toscene, { ahead: FIRST.ahead - 0.03 }, "none");
  shot(0, t.alive - 0.2, HOOK1, glide(1.2, 0.4));
  chip("chip-toi", A.you, -40, -110, t.atlantic, t.nomotor - 0.2);

  /* « Tu te poseras, vivant : dehors, une petite hélice vient de sortir. » — the dive under the belly */
  const dive = t.alive - 0.2;
  const atBay = t.out - 0.15;
  shot(dive, atBay - dive, BAYP, "sine.inOut", HOOK1.d);
  st(dive, atBay - dive, L_BAY, "sine.inOut");
  // « sortir »: the door, then the arm thrown out by its spring; the propeller starts in the wind
  st(t.out - 0.3, 0.32, { door: 1 }, "power2.out");
  st(t.out - 0.05, 0.5, { arm: 1 }, "power2.inOut");
  st(t.out + 0.15, t.toscene - (t.out + 0.15), { turn: 2.6 }, "power1.in");
  st(t.out + 0.3, 0.6, { whirl: 1 }, "sine.in");
  const toGear = t.problem - 0.45; // a cut, a few frames before « Reste un problème »
  shot(atBay, toGear - atBay, { d: BAYP.d * 0.93 }, "sine.out");
  chip("chip-rat", null, 96, 470, t.out, toGear - 0.14);

  /* « Reste un problème : tes freins. » — a cut to the main gear (a slide along the belly crossed the hull too close:
     a blur of glass, and the roughest move of the film) */
  cut(toGear, SET.SKY, { ...GEARP, d: GEARP.d * 1.04 }, L_GEAR);
  shot(toGear, t.toscene - toGear, { d: GEARP.d * 0.95 }, "sine.inOut");
  st(t.brakes0, 0.4, { brakes: 1 }, "sine.out");
  chip("chip-freins", null, 96, 470, t.brakes0, t.toscene - 0.15);

  /* ═════════════ THE SCENE ═════════════ */
  /* cut 1 · « Vingt-quatre août 2001. Un Airbus, 306 personnes. » — the flash-back: both engines alive, tanks full */
  // (the world is earlier here: the island further away; it comes all through the scene)
  cut(t.toscene, SET.SKY, PLANE, { ...STAGED, engines: 2, lines: 1, fuel: 1, ahead: 1.06, ...L_PLANE });
  st(t.toscene, t.runway0 - 0.32 - t.toscene, { ahead: 1.0 }, "none");
  shot(t.toscene, t.airbus - 0.2 - t.toscene, { d: PLANE.d * 0.94 }, "sine.out");
  chip("chip-vol", null, 96, 470, t.airbus, t.leak - 0.2);
  // « …306 personnes »: the camera rises over the plane, the heads light up
  shot(t.airbus - 0.2, t.pax + 0.45 - (t.airbus - 0.2), PAXP, "sine.inOut", PLANE.d * 0.94);
  st(t.pax, 0.5, { pax: 1 }, "sine.out");

  /* « Une fuite de carburant a vidé les réservoirs. » — wider, toward the far wing: the leak, the tanks run dry */
  shot(t.pax + 0.45, t.empty + 0.8 - (t.pax + 0.45), TANKS, "sine.inOut", PAXP.d);
  st(t.pax + 0.45, t.empty - (t.pax + 0.45), { ...L_TANKS, pax: 0.3 }, "sine.inOut");
  st(t.leak, 0.6, { leak: 1 }, "sine.out");
  st(t.empty, 1.0, { fuel: 0 }, "sine.inOut");
  chip("chip-fuite", null, 96, 470, t.leak + 0.1, t.nomore - 0.25);

  /* « Plus de moteurs : plus de générateurs, plus de pression pour les gouvernes. » — down under the belly */
  const back = t.nomore - 0.15;
  shot(back, t.surfaces0 + 0.1 - back, CIRC, "sine.inOut", TANKS.d);
  st(back, t.surfaces0 - back, { ...L_CIRC, pax: 0 }, "sine.inOut");
  st(t.nomore, 0.4, { engines: 1 }, "sine.out");
  st(t.motors, 0.4, { engines: 0.3 }, "sine.out");
  st(t.gens, 0.6, { engines: 0 }, "sine.out");
  st(t.pressure, 0.6, { lines: 0 }, "sine.inOut");
  st(t.pressure + 0.3, 0.6, { leak: 0 }, "sine.inOut");

  /* cut 2 · « Et la piste visée, aux Açores, est à cent vingt kilomètres. » — the large */
  const toWide = t.runway0 - 0.32;
  cut(toWide, SET.SKY, WIDE, { ...STAGED, ...L_WIDE });
  st(toWide, t.tosystem - toWide, { ahead: 0.9 }, "none"); // (act 2 cuts on 0.9)
  st(t.runway0, 0.6, { runway: 1 }, "sine.out");
  shot(toWide, t.tosystem - toWide, WIDE1, "sine.inOut", WIDE.d);
  chip("chip-120", null, 96, 470, t.km120, t.tosystem - 0.25);

  // Act 2 cuts on « Alors… » to the RAT's bay alone in the glass (VIEW.system: shell 0.2, mood 0, ahead 0.9): the calm
  // falls on a cut. (A dive from here to the bay was tried: it swings 130° round the left flank and crosses the wing
  // edge-on half way — an empty picture for half a second.)
}
