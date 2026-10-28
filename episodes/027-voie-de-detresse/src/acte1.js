// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One move, two cuts (to the hero drum, and to your
// foot on the pedal). The camera rides with the truck all along (`ride` 1): every pose below is written
// around the truck as it stands on the first frame, and holds while it runs down the col.
//
// THE HOOK. The first frame (POSE0 / FIRST): square behind the trailer at 42 cm, its two brake lights, the ten drums
// glowing and their embers, the road filing under it. It moves on frame 1 by its subject (the road, the paint, the
// embers) while the camera rises (42 cm → 2.3 m), born of that frame: over the drums, through the glass trailer, the
// lane shows far down the road, small and veille (« le système déjà là »).
//   « Ils ne sont pas cassés : »  CUT 1 — the matching glow: from the trailer's drums to the hero drum (front left),
//                                 close, from above: on « cassés » the drum opens (`cutaway`): the shoes are whole
//   « ils sont trop chauds. »     on « chauds » the linings and the drum go red (`heat` 1) — the word hits
//   « Ce qui va t'arrêter ? »     the camera leaves the wheel by ratio, up behind the cab (the hot wheel below), and
//                                 its head comes up to the road…
//   « Des cailloux. »             …the lane, far ahead on the right of the bend's chevrons: it lights (`laneLit`), the
//                                 lens closes on it — the promise, without a label
//   « Et ce qui les a fait        the lane dims, the long lens sinks back toward the truck — CUT 2 on « c'est », in
//     chauffer… c'est ton propre  the breath: your foot on the pedal, from outside your door — « pied » hits
//     pied. »
// THE SCENE. « Tu appuies : la pédale s'enfonce, » — the pedal 60 → 80 → 100 % (the header's « Pédale »). Then out of
// the cab: a pull-back by ratio, up and back along the truck's left side, to the whole truck from behind-left and
// above, its brake lights burning, its drums red — « le camion non » (it hits): the speed creeps up. « Quatre-vingts.
// Quatre-vingt-dix. » the header on the words, the camera rises behind the truck; « En bas, un virage… et le
// ravin. » the descent, the chevrons flare (`danger`) — it hits; « À droite, une voie de gravier. » the camera slides
// right: the sign, the access, the pit, lit on « gravier »; « Tu as deux secondes. » it pulls back and up behind the
// truck — and on « secondes » time stops (`s` held: nothing runs, the embers hang). In the silence before « Alors… »
// a slow push lands EXACTLY on VIEW.lane at `tobench`: act 2 cuts to the bench from there (benchOrigin(RUN.freeze)).
//
// NOTHING FLICKERS (Merwan, 22/10): the camera never runs along the balises or the paint close to the road (it is low
// only on the first frame, square behind, where the lines run away from it); no move turns a quarter turn in a second;
// the long moves change their distance by ratio. No sound is added or moved here.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, FIRST, VIEW, RUN, KMH, KMH0, HUB_FL, YOU, LOOK, BED, rate, road, frame } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const [HX, HY, HZ] = HUB_FL;
const [PX, PY, PZ] = YOU.pedal;
/** A pose seen from `cam` toward `far`, aimed at a point `dist` cm along that line (a pose aimed far away sends the
 *  camera out of the set while it turns; the same picture aimed near keeps the move local). */
const toward = (cam, far, dist, rest) => {
  const v = far.map((x, i) => x - cam[i]);
  const n = Math.hypot(...v);
  return frame(cam, cam.map((x, i) => x + (dist * v[i]) / n), rest);
};

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, punch } = D;
  const t = D.times({
    choc: "choc", intact: "intact", casses: "accroche:cassés", chauds: "chauds", chaudsEnd: "accroche:chauds$", question: "promesse:t'arrêter$",
    cailloux: "cailloux", chauffer: "chauffer", chaufferEnd: "promesse:chauffer$", pied: "pied",
    appuies: "appuies", enfonce: "enfonce", enfonceEnd: "scene:s'enfonce$", non: "non", v80: "v80", v90: "v90",
    bas: "bas", ravin: "ravin", droite: "droite", gravier: "gravier1", gravierEnd: "scene:gravier$",
    secondes: "secondes", freeze: "freeze", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  // the key words land on the captions too (the scene; the hook has its own cards)
  D.captionStyle({ hit: 0.25 });

  /* ── the run: rate(kmh) metres per film second, in straight runs, until time stops on « secondes » ── */
  const s80 = rate(KMH0) * t.v80;
  const s90 = s80 + rate(80) * (t.v80 === t.v90 ? 0 : t.v90 - t.v80);
  const late = (RUN.freeze - s90) / (t.freeze - t.v90);
  /** Where the truck is (s, m) at a film instant of this act. */
  const sAt = (x) => (x <= t.v80 ? rate(KMH0) * x : x <= t.v90 ? s80 + rate(80) * (x - t.v80) : Math.min(RUN.freeze, s90 + late * (x - t.v90)));
  st(0, t.v80, { s: s80 }, "none");
  st(t.v80, t.v90 - t.v80, { s: s90 }, "none");
  st(t.v90, t.freeze - t.v90, { s: RUN.freeze }, "none");
  /** A point of the lane (its head, `ahead` m further down the bed) seen from the truck at instant x. */
  const lane = (x, ahead = 0) => road(BED.x, 0, -100 * (BED.s0 + ahead - sAt(x)));

  /* ── the poses ── */
  // the first frame rises (42 cm → 2.3 m): over the drums, through the glass trailer, the lane shows far down the road
  const DRIFT = frame(road(60, 230, 2250), road(20, 175, 600), { ...POSE0 });
  // the hero drum, close, from above-left (it shows inside the opened quarter) — and a little closer
  const DRUM = frame([HX - 140, HY + 75, HZ + 110], [HX + 12, HY + 6, HZ + 4], { ...P, ...CLOSE, shift: 60 });
  const DRUM_IN = { ...DRUM, d: DRUM.d * 0.86 };
  // over the back of the cab, looking down the road at the lane (the bend's chevrons on its left): the cab's roof low
  // in the picture; then the lens closes on the lane (« la caméra pousse vers elle »)
  const LOOK_AT = lane(t.cailloux, 8);
  const HIGH = road(-420, 650, 450);
  const DRUM_OUT = frame(HIGH, [HX, 150, HZ - 120], { ...P, fov: 30, shift: 160 }); // the cab and the hot wheel from above
  const AHEAD_LANE = toward(HIGH, LOOK_AT, 1500, { ...P, fov: 30, shift: 260 });
  const LANE_TELE = { ...AHEAD_LANE, fov: 14, shift: 120 };
  // …and back down toward the cab before the cut (the move the cut goes on with)
  const LANE_SINK = { ...LANE_TELE, el: LANE_TELE.el + 4, fov: 22, shift: 60 };
  // your foot on the pedal, from outside your door, through its glass — and a little closer while it sinks
  const PEDAL = { ...VIEW.pedal, fov: 32, shift: 430 }; // the pad up in the subject's band, clear of the captions
  const PEDAL_IN = { ...PEDAL, d: PEDAL.d * 0.94 };
  // the whole truck from behind-left, above the other lane: its brake lights burning, its drums red, the descent
  const WHOLE = frame(road(-320, 1050, 3500), road(0, 190, 850), { ...P, fov: 36, shift: 110 });
  const WHOLE_ON = frame(road(-280, 1150, 3250), road(0, 190, 650), { ...P, fov: 36, shift: 110 });
  // risen behind the truck: the descent, the bend and its chevrons at the bottom, the ravine beyond
  const AHEAD = frame(road(200, 1000, 2100), road(-150, 0, -9000), { ...P, fov: 34, shift: 100 });
  // slid right: over the truck's right shoulder, the sign, the access, the pit of gravel
  const RIGHT = toward(road(520, 1250, 2300), lane(t.gravier, 4), 3000, { ...P, fov: 32, shift: 110 });
  // pulled back and up behind the truck — then the slow push of the silence lands on VIEW.lane, where act 2 cuts
  const LANE_WIDE = { ...VIEW.lane, d: VIEW.lane.d * 1.07 };

  /* ── the light: what it stands around (around the truck: the camera rides), and how wide ── */
  const L_DRUM = { fx: HX, fy: HY, fz: HZ, fs: 90 };
  const L_ROAD = { fx: 0, fy: 150, fz: -2500, fs: 2500 };
  const L_PEDAL = { fx: PX, fy: PY + 10, fz: PZ, fs: 80 };
  const L_TRUCK = { fx: 0, fy: 150, fz: 600, fs: 1100 };

  /* ═════════════ THE HOOK ═════════════ */
  /* ───── « Ton camion n'a plus de freins. » ───── */
  shot(0, t.intact, DRIFT, glide(1.5, 0.6));
  st(0.4, t.intact - 0.6, { laneLit: 0.55 }, "sine.inOut"); // the lane, where the gap opens: readable, not a sign
  punch(t.choc + 0.1, 0.06, { hold: 0.18, down: 0.45 }); // « freins » — released long before the cut

  /* ───── « Ils ne sont pas cassés : » — CUT 1, on the same glow ───── */
  cut(t.intact, null, DRUM, { laneLit: FIRST.laneLit, ...L_DRUM });
  shot(t.intact, t.chaudsEnd - t.intact, DRUM_IN, "sine.inOut");
  st(t.casses + 0.02, 0.35, { cutaway: 1 }, "power2.out"); // the quarter comes away: the shoes, whole

  /* ───── « …ils sont trop chauds. » ───── */
  st(t.chauds, 0.3, { heat: 1 }, "power2.out");
  punch(t.chauds + 0.1, 0.06);

  /* ───── « Ce qui va t'arrêter ? Des cailloux. » ───── */
  // out of the wheel (by ratio: ×5): up behind the cab, the hot wheel below — then the head comes up to the road
  st(t.chaudsEnd + 0.02, 0.45, { cutaway: 0 }, "sine.inOut");
  // 22/10, after the draft's qa (24.2 at 4.5 s): out of the wheel and up to the road was a quarter turn in a second —
  // now a cut on the question, in the direction of the look: the road ahead, the lane far down, a slow push toward it
  cut(t.question, null, { ...AHEAD_LANE, d: AHEAD_LANE.d * 1.45 }, {}); // the push carries 5 → 6.5 s (qa: no slow stretch)
  shot(t.question, t.cailloux - t.question + 0.06, AHEAD_LANE, "sine.inOut");
  st(t.chaudsEnd + 0.02, t.cailloux - t.chaudsEnd, L_ROAD, "sine.inOut");
  // « cailloux »: the lane lights, and the lens closes on it
  st(t.cailloux + 0.1, 0.4, { laneLit: 1 }, "power2.out");
  punch(t.cailloux + 0.1, 0.07); // « cailloux » — 22/10: the stretch 5 → 7 s read slow in qa
  shot(t.cailloux + 0.04, t.chauffer - t.cailloux, LANE_TELE, "sine.inOut");

  /* ───── « Et ce qui les a fait chauffer… c'est ton propre pied. » ───── */
  // the lane dims; the long lens sinks back toward the truck (the move the cut goes on with) — CUT 2 on « c'est »,
  // in the breath: your foot on the pedal, from outside your door
  st(t.chauffer, 0.6, { laneLit: FIRST.laneLit }, "sine.inOut");
  shot(t.chauffer, t.chaufferEnd - t.chauffer, LANE_SINK, "sine.in");
  const cut2 = t.chaufferEnd + 0.03;
  cut(cut2, null, PEDAL, { ...L_PEDAL });
  shot(cut2, t.enfonceEnd - cut2, PEDAL_IN, "sine.inOut");
  punch(t.pied + 0.1, 0.06);

  /* ═════════════ THE SCENE ═════════════ */
  /* ───── « Tu appuies : la pédale s'enfonce, » ───── */
  st(t.appuies + 0.1, 0.3, { pedal: 0.8 }, "power2.out");
  st(t.enfonce + 0.1, 0.4, { pedal: 1 }, "power2.in");

  /* ───── « …le camion non. » — out of the cab: the whole truck, nothing slows ───── */
  // a pull-back by ratio (×20), up and back along the truck's left side: the mirrors stay ahead of the lens
  // 22/10, after the draft's qa (25.5 at 11.4 s): ×20 in 1.4 s was the jerkiest move of the film — a cut out of the
  // cab in the breath after « s'enfonce », then the pull-back goes on slowly
  cut(t.enfonceEnd, null, { ...WHOLE, d: WHOLE.d * 0.82 }, { ...L_TRUCK });
  shot(t.enfonceEnd, t.v80 - t.enfonceEnd, WHOLE, "sine.inOut");
  shot(t.v80, t.v90 - t.v80, WHOLE_ON, "sine.inOut");
  st(t.enfonce + 0.4, t.v80 + 0.05 - t.enfonce - 0.4, { kmh: 76 }, "sine.inOut"); // ends before « 80 » takes over
  punch(t.non + 0.1, 0.06);

  /* ───── « Quatre-vingts. Quatre-vingt-dix. » ───── */
  st(t.v80 + 0.06, 0.3, { kmh: 80 }, "power2.out");
  st(t.v90 + 0.06, 0.3, { kmh: KMH }, "power2.out");
  // the camera rises behind the truck, to the descent (by ratio: ×4)
  shot(t.v90, t.droite - t.v90, AHEAD, "sine.inOut", WHOLE_ON.d);
  st(t.v90, t.bas - t.v90, L_ROAD, "sine.inOut");

  /* ───── « En bas, un virage… et le ravin. » ───── */
  st(t.ravin + 0.1, 0.4, { danger: 1 }, "power2.out");
  punch(t.ravin + 0.1, 0.06);

  /* ───── « À droite, une voie de gravier. » ───── */
  shot(t.droite, t.gravierEnd + 0.3 - t.droite, RIGHT, "sine.inOut", AHEAD.d);
  st(t.gravier + 0.1, 0.4, { laneLit: 1 }, "power2.out");

  /* ───── « Tu as deux secondes. » — and time stops ───── */
  const back = t.gravierEnd + 0.3;
  shot(back, t.freeze + 0.3 - back, LANE_WIDE, "sine.inOut", RIGHT.d);
  shot(t.freeze + 0.3, t.tobench - t.freeze - 0.3, VIEW.lane, "sine.inOut");
  st(back, t.freeze + 0.3 - back, { fx: 300, fy: 0, fz: -4300, fs: 2500 }, "sine.inOut");
  now(t.freeze, { s: RUN.freeze }); // held: the embers hang, the wheels stop
}

