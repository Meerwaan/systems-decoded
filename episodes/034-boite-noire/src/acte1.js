// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). Three shots, two cuts (docs/034-actes.md).
//
// THE HOOK (POSE0 / FIRST, no cut). Under the water at night, from below: the orange recorder sinks toward the lens
// and turns (`spin` 20 → 60, `tilt` 18 → 0, both easing out: they stop while the box is out of the picture), the snow
// streaks up past it (`rush` 1), a ring leaves its beacon, the tail of glass sinks behind it. The lens pushes in from
// frame 1 (glide). « Une boîte noire *coule* » : punch. On « chercher » the camera swings over the box and looks DOWN
// into the black it is falling toward (the box leaves by the top) — « presque deux ans », « au fond de
// l'Atlantique » — then comes back up onto its beacon, close (VIEW.beacon turned by the spin it stopped at): one ring
// a second; on « jours » the header's « J−30 » pulses.
// CUT 1 (toplane): « Et dans ton avion… » — the same box in its plane: the A330 of glass at night, three quarters rear,
// then a cut to its tail, the skin lowered (`plane` 0.45): the orange box through the glass. « deux +heures+ » : the
// track of voice (#track) keeps only its end.
// CUT 2 (toscene): « Elle descend dans le noir » — riding down with it, from a little below; the camera comes level as
// the bottom arrives on « mètres » (it must be above the bottom when it lands). « L'eau réveille sa balise » : the
// camera glides onto the beacon on the bottom, the ping grows. « Il porte à quelques kilomètres » : a pull-back BY
// RATIO to the whole column (the reach drawn, « Portée »), then the ocean (« au mieux » : a small bubble in the black).
// « Trouve-la… » : held. Then a cut onto the box on the bottom; « *taise* » : the countdown turns signal.
// « Alors… » : almost nothing moves, the camera comes a little closer. Act 2 cuts to the bench in place.
//
// No sound here: episode.json → sfx. The header (days, alarm, depth) is moved, never written.
import * as THREE from "three";
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, VIEW, STAGED, FLOWN, POSE0, REC, DEEP, PING } from "./world.js";

const DEG = Math.PI / 180;

/** A DEEP pose written for the box at rest (spin 0), turned with the box when it lies at `spin` degrees. */
const turned = (pose, spin) => {
  const a = spin * DEG;
  const [cx, , cz] = REC.centre;
  const px = pose.tx - cx;
  const pz = pose.tz - cz;
  return { ...pose, tx: cx + px * Math.cos(a) + pz * Math.sin(a), tz: cz - px * Math.sin(a) + pz * Math.cos(a), az: pose.az + spin };
};

/* ── the poses ── */
const SPIN_STOP = 60; // where the hook's spin comes to rest: the beacon then faces the key light, three quarters
// the hook, pushed in a little from frame 1
const PUSH = { ...POSE0, d: 104, el: -49 };
// over the box, looking DOWN into the black it falls toward: the box has left by the top
// (aimed at the box all the way — it never leaves the picture while the camera turns — looking 45° down, the
// picture pushed up: the box at the top, the black it falls into under it)
const ABYSS = { ...POSE0, tx: 0, ty: 12.5, tz: 0, d: 150, az: -60, el: 45, fov: 44, shift: 430 }; // retouche: az −60 (−14 swung through the white-pink sheen at 2.6 s)
const ABYSS2 = { ...ABYSS, d: 185, az: -30, el: 48, shift: 400 }; // …the box drawing away, under the header (at shift 480 it went behind it: contrast ✗ at 4.98 s)
// the beacon side of the box, the whole box on its halo (≈ 45 % of the width, from above el 20: lower, the paint
// burns white-pink), at rest at SPIN_STOP (VIEW.beacon turned) — retouche: at d 48 the box filled 95 % of the frame
const BOXVIEW = { ...VIEW.beacon, tx: -6, ty: 12, d: 240, el: 22, dof: 0 };
const BEACON_HOOK = turned(BOXVIEW, SPIN_STOP);
const BEACON_HOOK2 = { ...BEACON_HOOK, d: 220 };
// AIR
// (023 flies its plane nose up by 1.5°: the tail, 24.5 m behind its centre, hangs 64 cm lower than REC.inPlane says)
const SAG = -REC.inPlane[0] * Math.sin(1.5 * DEG);
const TAILBOX = { ...VIEW.tailBox, ty: VIEW.tailBox.ty + SAG };
// VIEW.plane (the whole A330, three quarters rear) re-aimed at the box in its tail, the picture slid to keep the
// plane where VIEW.plane has it (its centre 13.7 m left of the box and 2.8 m above it on screen, at 0.21 px/cm):
// the dive into the tail then keeps the box where it is and the picture closes on it — it never wanders off the
// edge mid-move (it did, aimed at the plane's centre: the box at the right edge at 8.0 s)
const TAILWIDE = { ...TAILBOX, d: 1200, az: 34, el: 20, dof: 0 }; // the tail of glass, the box lit in it (retouche, 8.2 s)
const PLANE = { ...VIEW.plane, tx: TAILBOX.tx, ty: TAILBOX.ty, tz: TAILBOX.tz, side: -290, shift: 60 };
// riding down, then level with the box as the bottom comes
const SINK = VIEW.sink;
const LAND = { ...VIEW.sink, ty: 11, d: 220, az: -42, el: 22, fov: 36, shift: 130 }; // retouche: el 9 burnt the paint (12.3 s)
// the beacon on the bottom (spin 0)
const BEACON = BOXVIEW;
const BEACON2 = { ...BOXVIEW, d: 215 };
// the column, the ocean
const RANGE = VIEW.range;
const RANGE_IN = { ...VIEW.range, d: 850000 }; // retouche: a cut, no longer a pull-back from the beacon (its frame at 16.17 s crossed a veille haze)
const OCEAN = VIEW.ocean;
const OCEAN2 = { ...VIEW.ocean, d: 3600000 };
// the box on the bottom, and a little closer for « Alors… »
const FLOOR_IN = { ...VIEW.floor, d: 330 };
const FLOOR2 = { ...VIEW.floor, d: 200 }; // act 2 cuts to the bench in place from THIS pose (docs/034-actes.md)

// the light: what it stands around, and how wide
const L_BOX = { fx: 0, fy: 12.5, fz: 0, fs: 60 };
const L_BEACON_HOOK = { fx: BEACON_HOOK.tx, fy: BEACON_HOOK.ty, fz: BEACON_HOOK.tz, fs: 60 };
const L_PLANE = { fx: 400, fy: 0, fz: 0, fs: 3500 };
const L_TAILBOX = { fx: REC.inPlane[0], fy: REC.inPlane[1] + SAG + 12, fz: REC.inPlane[2], fs: 60 };
const L_RANGE = { fx: 0, fy: 175000, fz: 0, fs: 400000 };
const L_OCEAN = { fx: 0, fy: 300000, fz: 0, fs: 2000000 };

export default function acte1({ D, co }) {
  const { tl, st, shot, cut } = D;
  const t = D.times({
    choc: "choc", chercher: "accroche:chercher", ans: "ans", atlantique: "atlantique", balise: "promesse:balise",
    jours: "jours", toplane: "toplane", avion: "avion1", ecoute: "ecoute", heures: "heures", toscene: "toscene",
    noir: "noir", metres: "metres", wake: "wake", appel: "appel", seconde: "seconde", porte: "porte",
    kilometres: "kilometres", mieux: "mieux", trouve: "trouve", avant: "avant", taise: "taise", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });
  /** The header's clock answers a word (ink: it does not count yet). */
  const pulse = (at) => tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.18, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "100% 50%", immediateRender: false }, at);
  const set = (at, props) => st(at, 0, props, "none");

  /* ═════════════ THE HOOK — « Une boîte noire coule. Tu vas la chercher presque deux ans. » ═════════════ */
  // the box turns and straightens as it sinks; both ease out and stop while it is out of the picture (the beacon
  // close-up assumes it at rest)
  const swingAt = t.chercher - 0.15;
  const swingEnd = t.ans + 0.2;
  st(0, swingEnd, { spin: SPIN_STOP, tilt: 0 }, "power1.out");
  // it sinks: slowly while we see it, then the black opens under it (the bottom is far: the header counts)
  st(0, t.choc, { depth: DEEP.first + 6 }, "none");
  st(t.choc, swingAt - t.choc, { depth: DEEP.first + 20 }, "none");
  st(swingAt, swingEnd - swingAt, { depth: 220 }, "power2.in");
  st(swingEnd, t.toplane - swingEnd, { depth: 290 }, "none");
  // the lens pushes in from frame 1, then swings over the box and looks down into the black
  shot(0, swingAt, PUSH, glide(1.8, 0.7));
  D.punch(t.choc, 0.06);
  shot(swingAt, swingEnd - swingAt, ABYSS, "sine.inOut");
  // « Au fond de l'Atlantique » : the black, still going down
  const riseAt = t.balise - 0.9;
  shot(swingEnd, riseAt - swingEnd, ABYSS2, "sine.inOut");
  // « …sa balise » : back up onto the beacon, close (by ratio)
  shot(riseAt, t.balise + 0.15 - riseAt, BEACON_HOOK, "sine.inOut", ABYSS2.d);
  st(riseAt, 0.6, L_BEACON_HOOK, "sine.inOut");
  shot(t.balise + 0.15, t.toplane - t.balise - 0.15, BEACON_HOOK2, "sine.inOut");
  st(riseAt, t.balise - riseAt, { ping: 1 }, "sine.inOut");
  // « …ne tient que trente jours » : the header's J−30 answers
  pulse(t.jours);
  D.punch(t.jours, 0.05, { hold: 0.1, down: 0.3 }); // let go before the cut

  /* ═════════════ CUT 1 — « Et dans ton avion… elle n'écoute peut-être que deux heures. » ═════════════ */
  cut(t.toplane, SET.AIR, PLANE, { ...FLOWN, days: 30, alarm: 0, ...L_PLANE });
  st(t.toplane, t.toscene - t.toplane, { ahead: FLOWN.ahead - 0.012 }, "none"); // the plane flies
  // « Et dans ton avion… » : the whole plane, pushed in a little while « avion » is said…
  // retouche: the 43× dive into the tail (7.5 → 8.6) showed a tiny box in the black — now a CUT a few frames before
  // « elle n'écoute » onto the tail of glass with the box lit in it, then a slow push onto the box
  const tailAt = t.ecoute - 0.12;
  shot(t.toplane, tailAt - t.toplane, { ...PLANE, d: PLANE.d * 0.82 }, "sine.in");
  cut(tailAt, SET.AIR, TAILWIDE, { plane: 0.85, ...L_TAILBOX });
  st(tailAt + 0.45, 1, { plane: 0.4 }, "sine.inOut"); // the glass fades as the lens reaches the box
  // « elle n'écoute peut-être que deux heures » : the box in the tail
  shot(tailAt, t.toscene - tailAt, { ...TAILBOX, d: TAILBOX.d * 0.9 }, "sine.inOut", TAILWIDE.d);
  // the track of voice: all of it is the flight; only its last two hours stay
  D.chip("track", null, 96, 470, t.ecoute - 0.05, t.toscene - 0.15);
  tl.to("#track-old", { opacity: 0.08, duration: 0.35, ease: "power2.out" }, t.heures);
  D.punch(t.heures, 0.05, { hold: 0.16, down: 0.4 });

  /* ═════════════ CUT 2 — « Elle descend dans le noir : trois mille neuf cents mètres. » ═════════════ */
  cut(t.toscene, SET.DEEP, SINK, { ...STAGED, depth: 300, wreck: 0, rush: 1, ping: 0.6, spin: 0, tilt: 8, days: 30, alarm: 0, pool: 0, ...L_BOX });
  const land = t.metres;
  st(t.toscene, land - 0.3 - t.toscene, { depth: DEEP.floor - 25 }, "sine.in");
  st(land - 0.3, 0.3, { depth: DEEP.floor }, "power2.out");
  st(t.toscene, land - t.toscene, { tilt: 0 }, "sine.inOut");
  st(land - 0.05, 0.4, { rush: 0 }, "power2.out");
  st(land, 0.5, { pool: 0.25 }, "sine.out");
  // the camera comes level with the box before the bottom arrives
  shot(t.toscene, land - 0.12 - t.toscene, LAND, "sine.inOut");

  /* ── « L'eau réveille sa balise : un appel par seconde. » ── */
  shot(land + 0.15, t.wake + 0.45 - land - 0.15, BEACON, "sine.inOut", LAND.d);
  st(t.wake, 0.35, { ping: 1, litBeacon: 1 }, "power2.out");
  shot(t.wake + 0.45, t.porte - 0.1 - t.wake - 0.45, BEACON2, "sine.inOut");

  /* ── « Il porte à quelques kilomètres, au mieux. » ── */
  const outAt = t.porte - 0.1;
  const atRange = t.kilometres + 0.1;
  cut(outAt, SET.DEEP, RANGE_IN, { litBeacon: 0, ...L_RANGE });
  shot(outAt, atRange - outAt, RANGE, "sine.out", RANGE_IN.d);
  st(t.kilometres - 0.15, 0.55, { range: 1 }, "sine.out");
  // « Portée » : on the top of the dome
  const reach = new THREE.Vector3(0, PING.reach, 0); // the top of the dome
  const cReach = co.add({ title: "Portée", x: 150, y: 560, align: "start", tone: "system", anchor: reach });
  cReach.show(tl, t.kilometres - 0.05);
  cReach.hide(tl, t.mieux - 0.25); // (gone before the ocean pulls away from it)
  // « …au mieux » : further still — a small bubble in a black ocean
  const atOcean = t.mieux + 0.15;
  shot(atRange + 0.1, atOcean - atRange - 0.1, OCEAN, "sine.inOut", RANGE.d);
  st(atRange + 0.1, atOcean - atRange - 0.1, L_OCEAN, "sine.inOut");

  /* ── « Trouve-la… avant qu'elle se taise. » ── */
  // held (the task), then a dive by ratio onto the box on the bottom
  // retouche: the 14 000× dive (17.9 → 18.8) was black with a small dome — now a CUT a few frames before « avant »
  // onto the box on the bottom, on its halo, which then comes slowly closer through « Alors… »
  const floorAt = t.avant - 0.15;
  shot(atOcean, floorAt - atOcean, OCEAN2, "sine.inOut");
  set(t.trouve, { wreck: 1 }); // the tail lies in the field now (a few pixels at this distance)
  cut(floorAt, SET.DEEP, FLOOR_IN, { range: 0, ...L_BOX });
  // « …taise » : the countdown turns signal
  st(t.taise, 0.25, { alarm: 1 }, "power2.out");
  D.punch(t.taise, 0.06);

  /* ── « Alors… » : almost still, a little closer ── */
  shot(floorAt, t.tobench - floorAt, FLOOR2, "power1.out");
}
