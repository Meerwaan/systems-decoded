// 03 · RÉPONSE — from « Tu braques à droite. » to « …s'arrêtent. » (tozero → toverdict). The climax, in cuts: one shot
// per breath, each read in half a second.
//   « Tu braques à droite. »                       your hands turn the wheel (the front wheel's circle → the steering
//                                                  wheel's: act 2 ends low at the front wheel); the pedal reads 0 %
//   « Tes roues avant quittent le bitume… »        low at the front wheels, the truck swinging through the S
//   « …et plongent dans le gravier. »              same shot: on « plongent » they drop into the bed (s = BED.s0)
//   « Les pneus s'enfoncent. »                     the hero wheel in the gravel, close: on the word it sinks (sink 1)
//   « Chaque tour de roue pousse le gravier… »     from ahead, low: the bow wave in front of the tyre
//   « Environ une demi-gravité de freinage. »      wide, the whole truck low in its bed; the speed falls (veille);
//                                                  « Le gravier freine · ≈ 0,5 g »
//   « Sans toucher la pédale. »                    your foot above the pedal, the pedal up
//   « Et tes quarante tonnes… s'arrêtent. »        behind and above, the camera standing still on the road: the truck
//                                                  creeps and halts, the berm ahead untouched; on « s'arrêtent » mood 0
//
// TWO KINDS OF NUMBERS (as in 025): the story's (s, kmh, pedal, steer, sink, heat, danger, mood) run in ONE chain on the
// words — the cuts never set them, except the first, which sets everything. The picture's (the light, what is lit) are
// set by each cut.
//
// THE RUN: s 220 at tozero → 252 (BED.s0) on « plongent », straight ("none", ≈ 10.9 m/s, the 90 km/h of the slowed
// film) → STOP (292) when « s'arrêtent » ends, at a constant deceleration (power1.out: the speed falls in a straight
// line to 0). `kmh` falls in a straight line on the same interval: the header says it, the wheel's tread and holes melt
// with it (model.js) — they come back only below ≈ 30 km/h, when no wheel is seen close any more.
import { setAct } from "@kit/overlay.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, STAGED, RUN, KMH, HUB_FL, YOU, frame, road, travel, truckAt } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: VIEW.sinkL.dof ?? 0 }; // the lens of world.js's close-ups (LOOK.dof)
const [HX, HY, HZ] = HUB_FL;
const [WX, WY, WZ] = YOU.wheel;
const [PX, PY, PZ] = YOU.pedal;

/* ── the frames, all [r] (around the truck as it stands on the first frame) unless said ── */
// your hands on the wheel (« Tu braques à droite »)
// from above your right shoulder: the wheel's rim and its three spokes turn in your hands (VIEW.hands, from the front,
// was all glass torso)
const HANDS0 = { ...VIEW.hands, d: 185, az: 47, el: 49, fov: 30, shift: 60 };
const HANDS1 = { ...HANDS0, d: HANDS0.d * 0.93 };
// low at the front wheels as they leave the bitumen (« Tes roues avant quittent le bitume… et plongent »)
const ENTRY0 = frame(road(-640, 70, 420), road(HX + 30, 45, -20), { ...P, fov: 36, shift: 140 }); // VIEW.entry, aimed on the wheel (it sat on the buttons)
const ENTRY1 = { ...ENTRY0, d: ENTRY0.d * 0.9 };
// the hero wheel in the gravel, from the left, low (« Les pneus s'enfoncent »)
const SINK0 = frame([HX - 380, 60, HZ + 60], [HX, 18, HZ - 10], { ...P, ...CLOSE, shift: 60 }); // the hub 35 cm down: sunk
const SINK1 = { ...SINK0, d: SINK0.d * 0.93 };
// from ahead-left, low, looking back at the tyre: the gravel it pushes in front of it (« pousse le gravier devant elle »)
const BOW0 = frame([HX - 300, 60, HZ - 330], [HX + 10, 22, HZ - 20], { ...P, ...CLOSE, shift: 120 });
const BOW1 = { ...BOW0, d: BOW0.d * 0.93 };
// wide, the whole truck low in its bed (« Environ une demi-gravité de freinage »)
const WIDE0 = { ...VIEW.bedWide, d: 5300, az: -35, el: 40 }; // from behind-left: the whole truck in its bed, clear of the buttons
const WIDE1 = { ...WIDE0, d: WIDE0.d * 0.95 };
// your foot above the pedal (« Sans toucher la pédale »)
const PEDAL0 = { ...VIEW.pedal, ty: VIEW.pedal.ty - 20, d: VIEW.pedal.d * 1.4, fov: 32, shift: 490 }; // wider and higher than act 1: the pad clear of the captions // act 1's « pied », the same frame: the foot that pressed, lifted
const PEDAL1 = { ...PEDAL0, d: PEDAL0.d * 0.93 };
// [0] behind and above the truck where it stops, the camera still on the road (« Et tes quarante tonnes… s'arrêtent »):
// the trailer, the cab, the bed ahead and the berm, untouched — lower than the chute's VIEW.top, which cuts after
const HALT_R = frame(road(-700, 1300, 3400), road(60, 120, -900), { ...P, fov: 34, shift: 110 });
const HALT0 = moved(HALT_R, [0, 0, 0], travel(RUN.stop));
const HALT0C = { ...HALT0, d: HALT0.d * 0.85 };
const HALT1 = { ...HALT0C, d: HALT0C.d * 0.96 };

/* ── the light: what it stands around, and how wide ([r] unless said) ── */
const L_HANDS = { fx: WX, fy: WY - 10, fz: WZ, fs: 120 };
const L_ENTRY = { fx: HX, fy: 50, fz: -100, fs: 400 };
const L_WHEEL = { fx: HX, fy: HY - 20, fz: HZ, fs: 150 };
const L_TRUCK = { fx: 0, fy: 150, fz: 600, fs: 1100 };
const L_PEDAL = { fx: PX, fy: PY + 10, fz: PZ, fs: 60 };
const [SX, SY, SZ] = travel(RUN.stop);
const L_HALT = { fx: SX, fy: SY + 150, fz: SZ + 400, fs: 1600 };

/** The truck's heading at `s` (rad, + to the right): in the S it turns up to 16° while a riding camera only follows its
 *  travel — a close-up inside the cab would swing. */
const AT = { x: 0, y: 0, z: 0, yaw: 0 };
const yawAt = (s) => truckAt(s, AT).yaw;
/** A pose [r] turned with the truck at `s` (about its front axle, the origin): the cab holds still in the frame. */
const yawed = (pose, s) => {
  const a = -yawAt(s);
  const c = Math.cos(a);
  const n = Math.sin(a);
  return { ...pose, tx: pose.tx * c + pose.tz * n, tz: -pose.tx * n + pose.tz * c, az: pose.az + (a * 180) / Math.PI };
};
/** The ease of a move that keeps up with the truck's turn while `s` runs straight from s0 to s1. */
const yawEase = (s0, s1) => {
  const y0 = yawAt(s0);
  const dy = yawAt(s1) - y0;
  return Math.abs(dy) < 1e-6 ? "none" : (u) => (yawAt(s0 + (s1 - s0) * u) - y0) / dy;
};

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", braques: "braques", roues: "roues", plongent: "plongent",
    trigger: "trigger", enfoncent: "enfoncent", tour: "tour", pousse: "pousse",
    environ: "environ", gravite: "gravite", sans: "sans", pedale: "pedale2",
    tonnes: "tonnes2", stop: "stop", end: "reponse$", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);
  const W = 0.1; // the cues of words fall 0.1 s before the word

  // « Tu braques à droite. » — the complete cut, FIRST: on a jump of the timeline, children starting at the same
  // instant render in the order they were written — the run below must start from the s this cut sets
  cut(t.tozero, SET.SCENE, yawed(HANDS0, RUN.zero), { ...STAGED, s: RUN.zero, kmh: KMH, pedal: 1, heat: 1, sink: 0, steer: 0, laneLit: 1, ...L_HANDS });

  /* ══════════ THE STORY: one chain, on the words ══════════ */
  const dive = t.plongent + W; // the front wheels reach the bed
  const halt = t.end; // the end of « s'arrêtent »
  st(t.tozero, span(t.tozero, dive), { s: RUN.entry }, "none");
  st(dive, span(dive, halt), { s: RUN.stop }, "power1.out");
  st(dive, span(dive, halt), { kmh: 0 }, "none");
  // « Tu braques à droite. » — the wheel turns right, the foot leaves the pedal
  st(t.braques + W - 0.05, 0.75, { steer: 0.5 }, "sine.inOut"); // a turn of the hands, not a jerk: close up, the spokes would smear
  st(t.braques + W + 0.05, 0.35, { pedal: 0 }, "power2.out");
  // the S: right until s 237 (≈ 44.75), then back left, straight in the bed
  const mid = t.tozero + (span(t.tozero, dive) * (237 - RUN.zero)) / (RUN.entry - RUN.zero);
  st(mid - 0.2, 0.9, { steer: -0.2 }, "sine.inOut");
  st(dive - 0.4, 0.6, { steer: 0 }, "sine.inOut");
  // « …et plongent dans le gravier. » — the nose drops in · « Les pneus s'enfoncent. » — down to the hubs' depth
  st(dive - 0.05, 0.7, { sink: 0.4 }, "sine.out");
  st(t.enfoncent + W, 0.6, { sink: 1 }, "sine.out");
  // « …s'arrêtent. » — the release: the light turns veille, the threat and the drums calm down
  st(t.stop + W + 0.05, 0.35, { mood: 0 }, "sine.inOut");
  st(t.stop + W + 0.1, 0.8, { danger: 0.3, heat: 0.7 }, "sine.inOut");

  /* ══════════ THE PICTURE: one shot per breath ══════════ */
  // « Tu braques à droite. » — the cut above set everything
  const toEntry = t.roues - 0.08;
  // the camera turns with the cab as the truck enters the S (s runs straight here: RUN.zero → RUN.entry)
  const sOf = (time) => RUN.zero + ((RUN.entry - RUN.zero) * (time - t.tozero)) / span(t.tozero, dive);
  shot(t.tozero, span(t.tozero, toEntry), yawed(HANDS1, sOf(toEntry)), yawEase(RUN.zero, sOf(toEntry)));

  // « Tes roues avant quittent le bitume… et plongent dans le gravier. »
  cut(toEntry, SET.SCENE, ENTRY0, L_ENTRY);
  const toSink = t.trigger - 0.06;
  shot(toEntry, span(toEntry, toSink), ENTRY1, "sine.inOut");

  // « Les pneus s'enfoncent. »
  cut(toSink, SET.SCENE, SINK0, L_WHEEL);
  const toBow = t.tour - 0.08;
  shot(toSink, span(toSink, toBow), SINK1, "sine.inOut");
  punch(t.enfoncent + W + 0.02, 0.06, { up: 0.12 }); // « s'enfoncent » — a softer attack (the wheel fills the frame); let go long before the cut

  // « Chaque tour de roue pousse le gravier devant elle. »
  cut(toBow, SET.SCENE, BOW0, L_WHEEL);
  const toWide = t.environ - 0.06;
  shot(toBow, span(toBow, toWide), BOW1, "sine.inOut");

  // « Environ une demi-gravité de freinage. »
  cut(toWide, SET.SCENE, WIDE0, L_TRUCK);
  const toPedal = t.sans - 0.08;
  shot(toWide, span(toWide, toPedal), WIDE1, "sine.inOut");
  chip("chip-g", null, 96, 470, t.gravite, toPedal - 0.15);

  // « Sans toucher la pédale. »
  cut(toPedal, SET.SCENE, PEDAL0, L_PEDAL);
  const toHalt = t.tonnes - 0.06;
  shot(toPedal, span(toPedal, toHalt), PEDAL1, "sine.inOut");
  punch(t.pedale + W + 0.02, 0.06, { hold: 0.18, down: 0.45 }); // « pédale »

  // « Et tes quarante tonnes… s'arrêtent. » — the camera stands on the road: the truck halts in a still picture
  cut(toHalt, SET.SCENE, HALT0C, { ride: 0, ...L_HALT });
  shot(toHalt, span(toHalt, t.toverdict), HALT1, "sine.inOut");
}
