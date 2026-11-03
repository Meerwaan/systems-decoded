// 03 · RÉPONSE — from « Le phare du train grossit. » to « …un train peut en cacher un autre. » (tozero → toverdict).
// In cuts: one shot per breath, each laid a few frames before its sentence, its pose complete and its state complete
// ({ ...STAGED, … }): nothing is inherited from act 2, nothing from the shot before.
//
// THE CLOCK RUNS AGAIN. `clock` goes on from 8.8 in real time (the header: « Feux +8 s » → « +25 s »); the TGV's nose
// (`train`, metres up voie 2) runs at the story's speed and reaches the road ON « passe » — one linear tween each,
// laid once over the whole act: no cut touches them.
//
// THE CAR. Poses are in the car's frame: the car stays put, the crossing slides under it (`gap`). Stuck at −3 its rear
// wheels sit on voie 2; the nose meets the boom at −4.15; the rear wheels are over voie 2's last rail at −4.25; the
// tail is clear of the train at −5.9; out at −6.8. The voice drives it, not a kinematics nobody can check:
//   « Tu avances » it creeps to the boom (−3 → −4.15, touch on « pousse ») · « pousse la lisse » the boom BENDS (give
//   0 → 0.3, the car barely moves) · « Elle cède » it swings away (0.3 → 1, model.js: no break, no splinter) · « Tes
//   roues quittent les rails » the wheels roll off the rail ON « rails » (the shot overlaps the action by 0.2 m: a
//   different angle, nobody sees it) · « le train passe » the car out, the TGV across the whole frame behind it.
// The cède is filmed from above, three quarters front (docs/035-actes-maj.md § 3): never from the side, where inB's
// boom lines up with ours and reads as a broken piece.
// `mood` drops to 0 on « rails »: the system has won — the TGV still has to pass, but no longer through you.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, STORY, GAP_STUCK, GAP_OUT } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };

/* ── the poses (car's frame) ── */
// low on voie 2 at the road, up the track at the headlamps — a slow push along the rails (never > 3 m/s this low)
const RAIL0 = { ...VIEW.rail };
const RAIL1 = { ...VIEW.rail, d: 3150 };
// the car's face, low, three quarters front: its headlamps on the boom, the dashboard alive behind the glass
// (ty 115, retouche: at ty 80 the R24 brushed the header's foot, ≈ 456 px; now under the top slot's edge)
const FACE0 = { ...P, tx: 30, ty: 115, tz: -280, d: 860, az: 145, el: 7, fov: 36, shift: 40 };
const FACE1 = { ...FACE0, d: 790 };
// from above, in front of the car (decor journal: the bend then the swing read cleanly from up here): the boom across
// the frame, the hood above it; it swings toward the camera. inB's boom, in line with ours, stays out on the left
const HIGH0 = { ...P, tx: 30, ty: 40, tz: -240, d: 1200, az: 172, el: 62, fov: 36, shift: 0 };
const HIGH1 = { ...HIGH0, d: 1120 };
// behind the car's left rear wheel, low and close (retouche: from above, the glass interior took the frame): the
// wheel big, voie 2's rail across the frame under it, sliding out toward the camera; you hidden for this shot
const WHEELS = { ...P, tx: -85, ty: 25, tz: 180, d: 330, az: -25, el: 10, fov: 40, shift: 0 };
// down the line on the −x side, low, looking back up voie 2 at the crossing (retouche: VIEW.pass saw the TGV side-on,
// a white streak): the TGV comes through the road nose first, three quarters, the car out on the left by the hero mast
const PASS0 = { ...P, tx: 0, ty: 180, tz: 430, d: 3820, az: -94.2, el: 4.1, fov: 34, shift: 0 };
const PASS1 = { ...PASS0, d: 3500 };
// the hero's R24 big (its −z face), the TGV streaming 4 m behind it — held to the end of the act. NOT down the
// tracks toward the second train: any view along voie 2 with the TGV in it stacks its glass end-on into a white blot
// over half the frame (tried: .cache/planches/035/acte3/p1, 56.9 s); turned away from it, the night is black
const FEU0 = { ...P, tx: 200, ty: 215, tz: 60, d: 560, az: 165, el: 3, fov: 34, shift: 40 };
const FEU1 = { ...FEU0, d: 470 };
// the insert (retouche): beyond voie 1 on the far verge, a long lens down voie 1 toward −x — the second train's
// headlamps coming out of the night, the TGV out of frame (only its light on voie 2's rails): no glass end-on
// (aimed straight at the lamps at 600 m: they sit mid-frame, between the chip and the captions)
const OTHER = { ...P, tx: -6000, ty: 279, tz: 1889, d: 6001, az: 88.94, el: 0.2, fov: 5, shift: 0, drift: 0 };
/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);
/** The car `m` metres past where it was stuck: gap, and how far its wheels have rolled. */
const at = (gap) => ({ gap, rolled: GAP_STUCK - gap });

export default function acte3({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    tozero: "tozero", grossit: "grossit", kmh90: "kmh90", m800: "m800",
    toface: "zero:Ta-0.14", encore: "encore",
    tohigh: "reponse:Tu-0.12", avances: "avances", pousse: "pousse", trigger: "trigger", cede: "reponse:cède",
    towheels: "reponse:Tes-0.12", rails: "reponse:rails",
    topass: "reponse:Et-0.12", passe: "passe",
    tofeu: "reponse:feu-0.2",
    toother: "reponse:encore$+0.1", autre: "autre",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero + 0.12);

  /* ── the story's time, over the whole act ── */
  const clock0 = 8.8;
  const HERE = { ...STAGED, kmh: 0, ...at(GAP_STUCK), give: 0, beam: 1 };

  /* ───────────── « Le phare du train grossit. » ───────────── */
  // at the road, on voie 2's ballast: the two headlamps at the end of the rails, 500 m away; the camera creeps up
  // the track toward them all through the next sentence
  cut(t.tozero, SET.ROAD, RAIL0, { ...HERE, clock: clock0, train: (t.passe - t.tozero) * STORY.mps });
  st(t.tozero, span(t.tozero, t.toverdict), { clock: clock0 + (t.toverdict - t.tozero), train: (t.passe - t.toverdict) * STORY.mps }, "none");
  shot(t.tozero, span(t.tozero, t.toface), RAIL1, "sine.inOut", RAIL0.d);
  punch(t.grossit, 0.07);

  /* ───────────── « Même à 90 km/h, il lui faut 800 mètres pour s'arrêter. » ───────────── */
  // the same frame: the 800 m ruler unrolls up voie 2 from the road — past the train: even braking now, it stops
  // hundreds of metres beyond you
  st(t.kmh90 + 0.4, span(t.kmh90 + 0.4, t.m800 + 0.75), { ruler: 1 }, "sine.inOut");
  chip("chip-800", null, 96, 470, t.kmh90 + 0.05, t.toface - 0.2);

  /* ───────────── « Ta voiture, elle, roule encore. » ───────────── */
  // the car's face, low: it is alive — dashboard lit, engine running — its headlamps on the boom a metre ahead
  cut(t.toface, SET.ROAD, FACE0, { ...HERE, ruler: 0 });
  shot(t.toface, span(t.toface, t.tohigh), FACE1, "sine.out", FACE0.d);
  punch(t.encore, 0.06, { hold: 0.14, down: 0.4 }); // let go before the cut

  /* ───────────── « Tu avances. Ton capot pousse la lisse. Elle cède. » ───────────── */
  // from above, three quarters front: the hood creeps to the boom (touch on « pousse »), the boom bends under it,
  // then on « cède » it swings away and fades — one frame for the three, the gesture is continuous
  cut(t.tohigh, SET.ROAD, HIGH0, { ...HERE });
  shot(t.tohigh, span(t.tohigh, t.towheels), HIGH1, "sine.inOut", HIGH0.d);
  st(t.avances, span(t.avances, t.pousse), { ...at(-4.15), kmh: 3 }, "sine.inOut");
  st(t.pousse, span(t.pousse, t.trigger), { ...at(-4.22), give: 0.3, kmh: 1 }, "sine.inOut");
  st(t.trigger, 0.6, { give: 1 }, "sine.inOut");
  st(t.trigger, span(t.trigger, t.towheels), { ...at(-4.42), kmh: 3 }, "sine.in");
  punch(t.cede, 0.06, { hold: 0.12, down: 0.24 }); // let go before the cut

  /* ───────────── « Tes roues quittent les rails. » ───────────── */
  // low at the car's left: the rear wheel on voie 2's last rail, rolling off it — clear on « rails ». The ambience
  // turns veille there: the system has won
  cut(t.towheels, SET.ROAD, WHEELS, { ...HERE, ...at(-4.2), give: 1, kmh: 4, you: 0 });
  st(t.towheels, span(t.towheels, t.topass), { ...at(-4.9) }, "sine.in");
  st(t.rails + 0.05, 0.35, { mood: 0 }, "sine.inOut");

  /* ───────────── « Et derrière toi… le train passe. » ───────────── */
  // ahead of the car, looking back at it: it rolls out and stops; the headlamps light the rails from the side, and
  // on « passe » the TGV crosses the whole frame behind it
  cut(t.topass, SET.ROAD, PASS0, { ...HERE, ...at(-5.7), give: 1, kmh: 3, mood: 0, beam: 0.3 }); // beam low: a nose, not a flare
  shot(t.topass, span(t.topass, t.tofeu), PASS1, "sine.out", PASS0.d);
  st(t.topass, 1.2, { ...at(GAP_OUT), kmh: 0 }, "sine.out");
  punch(t.passe, 0.06, { hold: 0.14, down: 0.38 }); // let go before the cut

  /* ───────────── « Le feu clignote encore : un train peut en cacher un autre. » ───────────── */
  // the R24 big, still beating, the TGV streaming behind it: the train that hides. The second one comes on voie 1
  // (`other`, 600 m and more up the line: out of this frame — fin opens on it), the chip names it, « autre » hits
  // the R24 on « Le feu clignote encore »; an insert down voie 1 on « un train peut en cacher » (the second train's
  // lamps come, 1.5 km → 600 m); back on the R24, the same push picked up, on « un autre » — the act ends on FEU1
  const tIns = t.toother - 0.05, tBack = t.autre - 0.3;
  const OUTS = { ...HERE, ...at(GAP_OUT), give: 1, mood: 0 };
  cut(t.tofeu, SET.ROAD, FEU0, OUTS);
  shot(t.tofeu, span(t.tofeu, tIns), { ...FEU0, d: 525 }, "sine.in", FEU0.d);
  cut(tIns, SET.ROAD, OTHER, { ...OUTS, other: 0.06 }); // the lamps faint from the insert's first frame
  st(tIns + 0.04, span(tIns + 0.04, tBack), { other: 1 }, "sine.out");
  cut(tBack, SET.ROAD, { ...FEU0, d: 505 }, { ...OUTS, other: 1 });
  shot(tBack, span(tBack, t.toverdict), FEU1, "sine.out", 505);
  chip("chip-autre", null, 96, 470, t.toother + 0.1, t.toverdict - 0.22);
  punch(t.autre, 0.06, { hold: 0.14, down: 0.4 }); // let go before the act ends
}
