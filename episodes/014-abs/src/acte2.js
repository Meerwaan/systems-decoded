// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Time stops where act 1 left it: the car, a few metres from the truck. The body, the road, the rain and the truck
// dissolve — what was hidden in all that glass stays alone: the wheel and its brake, the unit, the pedal. The same
// object on the bench, at the same place of the picture (benchCut); it opens on two levels, and the voice names its
// parts on TWO close frames: the camera dives behind the wheel that has just been pulled aside ("Derrière chaque
// roue") to the toothed ring and its sensor, then climbs to the opened unit — the computer lifted, the two valves
// out, the pump down. In each frame it is what lights up that says which word is being said.
// Then the system at REST, whole again, a wheel of glass turning: your foot goes down and the fluid's light runs
// from the pedal through the open valve to the brake while the camera closes on the unit — nothing moves in it
// ("il ne touche à rien") ; it pulls back down the sensor's wire as the veille pulses come up it ("il surveille") ;
// the wheel slows at once, the pulses thin out, the header's wheel falls into signal and the computer lights up:
// it has seen it.
// The threshold does not stop the film: a cut to the street — the picture of the hook coming back, the pedal
// trembling — and ONE move round the wheel and INTO it while it turns to glass: the disc, the caliper. Its speed
// dips and comes back under the car's, once: what act 3 is about to take apart. Act 3 cuts from there to your foot.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, FIRST, BENCHED, STAGED, SYSTEM } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// where the system stands in the car, counted from where it stands on the bench
const HOME = SYSTEM.bench.map((v) => -v);
// the bench's light, stood round the system in the car: it is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

/* ── in the street: the system, alone ── */
const ALONE = VIEW.system; // the cut to the bench leaves from here
const ALONE_FAR = { ...ALONE, d: 760 };
const GAP_LEFT = 30; // metres: where act 1's rewind left the truck

/* ── on the bench: the two levels, and the parts ── */
const OPEN = VIEW.exploded;
// lower level: the toothed ring between the rim (left) and the disc (right), its sensor over the teeth
const RING = { ...VIEW.ringPart, d: 165 };
// upper level: the unit opened — the computer lifted, the two valves out of their wells, the pump and its motor down
// (solid, the aluminium block is the palest thing of the film: it stays above the captions — hence the distance)
const UNIT_TOP = { ...VIEW.unitOpen, ty: 89.5, d: 148 };
// the block turned to glass ("le circuit de tes freins"): close on the two valves, their needles over their wells
// (the coils are 2.5 cm across: nearer than this, the computer above them fills the top of the picture)
const UNIT_VALVES = { ...VIEW.unitOpen, ty: 92, d: 90 };
// back and down: the motor under the block. (The block stays under the header: glass or not, its edges would cross it)
const UNIT_PUMP = { ...VIEW.unitOpen, ty: 74, d: 150 };
/* ── on the bench: at rest ── */
const REST_WIDE = { ...VIEW.whole, side: 20 };
// (pushed right and down: the line that comes from your foot enters by the top right corner, clear of the account's name)
const REST_UNIT = { ...VIEW.unitPart, d: 104, shift: 120, side: -60 };
// the wheel of glass, the sensor's wire climbing from behind the disc to the computer
// (the glass tyre is wider than it looks: pushed right, it clears the left edge and the unit still holds on the right)
const WATCH = { ...P, tx: -8, ty: 48, tz: -30, d: 300, az: -42, el: 12, shift: 170, side: -90 };
const WATCH_NEAR = { ...WATCH, ty: 49, d: 292, side: -95 };
const V_BENCH = 0.28; // metres a second the wheel rolls on the bench (faster, the disc's vanes jump from one frame to the next)
const SLOW = 0.28; //    …and what is left of it once it has "slowed too fast" (80 km/h → 22)
/* ── in the street: the threshold, round the wheel and into it ── */
// (low and left in the picture: the hose and the sensor's wire climb to the unit under the header, not across it,
// and the disc — pale — stops above the captions)
const INWHEEL = { ...P, tx: -76, ty: 38, tz: -143, d: 232, az: -54, el: 8, shift: 70, side: 80 };
const V_ROAD = 0.85; // metres a second the road goes by (the film is in slow motion from the stamp on the brake)

// the light: what it stands around, and how wide (a cut to the bench sets BENCHED's: the whole system)
const L_RING = { fx: 21, fy: 37, fz: 20, fs: 30 };
const L_UNIT = { fx: 10, fy: 80, fz: 10, fs: 34 };
const L_REST = { fx: 6, fy: 61, fz: -19, fs: 30 };
const L_WATCH = { fx: -8, fy: 48, fz: -30, fs: 50 };

/** An ease for a distance covered while the speed dips by `a` in the middle and comes back (1 → 1 − a → 1). */
const dipping = (a) => (u) => (u - a * (u / 2 - Math.sin(2 * Math.PI * u) / (4 * Math.PI))) / (1 - a / 2);
const DIP = 0.28; // the wheel's speed under the car's, at the worst of the threshold's cycle (80 km/h → 58)
/** An ease for a distance covered while the speed falls, straight, from 1 to `k`. */
const slowing = (k) => (u) => (u - ((1 - k) * u * u) / 2) / (1 - (1 - k) / 2);

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    eclate: "eclate", p1: "p1", p2: "p2", p3: "p3", et: "eclate:Et", circuit: "eclate:circuit", p4: "p4", p5: "p5",
    torepos: "torepos", touche: "repos:touche", idle: "idle", watch: "watch", four: "four",
    attend: "repos:attend", ralentisse: "repos:ralentisse", toofast: "toofast",
    toseuil: "toseuil", seuil: "seuil", regarde: "seuil:regarde", passe: "seuil:passe", roue: "seuil:roue", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);
  /** The time between two instants of the script — never less than `min` (the voice is not recorded yet: a gap may shrink). */
  const span = (from, to, min = 0.25) => Math.max(min, to - from);

  /* ───────────── "Alors…" — time stops. The body, the road, the rain, the truck dissolve: the system stays alone ───────────── */
  cut(t.tosystem, SET.STREET, ALONE_FAR, { ...STAGED, gap: GAP_LEFT, ...LIT });
  const alone = t.tobench - t.tosystem;
  shot(t.tosystem + 0.02, alone - 0.02, ALONE, "sine.inOut", ALONE_FAR.d);
  st(t.tosystem + 0.04, alone * 0.75, { shell: 0, you: 0, truck: 0, rain: 0, sense: 0 }, "sine.inOut");
  st(t.tosystem + 0.04, Math.min(0.4, alone * 0.55), { mood: 0 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same system on the bench, at the same place; it opens on two levels ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: ALONE, origin: HOME, state: { ...BENCHED, kmh: 80, wkmh: 80, rolled: 0 } });
  const opening = Math.min(1.4, span(t.explode, t.eclate - 0.1, 1.2));
  st(t.explode, opening, { explode: 1 }, "none");
  shot(t.explode + 0.05, opening, OPEN, "sine.inOut", bench.d);

  /* ───────────── "Derrière chaque roue : une couronne dentée," — a dive behind the wheel, to the ring ───────────── */
  const toRing = span(t.eclate + 0.1, t.p1 + 0.15, 0.8);
  shot(t.eclate + 0.1, toRing, RING, "sine.inOut", OPEN.d);
  st(t.eclate + 0.1, toRing, L_RING, "sine.inOut");
  st(t.p1, 0.3, { litRing: 1 }, "sine.out");
  const cRing = co.add({ title: "Couronne dentée", x: 470, y: 560, align: "end", tone: "system", anchor: A.ring });
  cRing.show(tl, t.p1 - 0.15);
  cRing.hide(tl, t.p2 - 0.3);

  /* ───────────── "un capteur." — the same frame: the ring goes out, the sensor over its teeth lights up ───────────── */
  st(t.p2 - 0.1, 0.25, { litRing: 0 }, "sine.inOut");
  st(t.p2, 0.3, { litSensor: 1 }, "sine.out");
  const cSensor = co.add({ title: "Capteur", sub: "Lit la vitesse", x: 480, y: 590, align: "end", tone: "system", anchor: A.sensor });
  cSensor.show(tl, t.p2 - 0.25); // (its dot and its leader first: the word comes with "capteur")
  cSensor.hide(tl, t.p3 - 0.4);

  /* ───────────── "Un calculateur." — up to the opened unit: its computer, lifted ───────────── */
  const toUnit = 0.7;
  shot(t.p3 - 0.36, toUnit, UNIT_TOP, "sine.inOut", RING.d);
  st(t.p3 - 0.36, toUnit, L_UNIT, "sine.inOut");
  st(t.p3 - 0.36, 0.25, { litSensor: 0 }, "sine.inOut");
  st(t.p3 + 0.05, 0.3, { litEcu: 1 }, "sine.out");
  const cEcu = co.add({ title: "Calculateur", x: 410, y: 670, align: "end", tone: "system", anchor: A.ecu });
  cEcu.show(tl, t.p3 + 0.05);
  cEcu.hide(tl, t.et + 0.2);

  /* ───────────── "Et sur le circuit de tes freins… deux vannes par roue," — the block turns to glass: the circuit, and the two valves on it ───────────── */
  st(t.et, 0.4, { litEcu: 0 }, "sine.inOut");
  st(t.circuit - 0.15, span(t.circuit - 0.15, t.p4 - 0.5, 0.5), { xray: 1 }, "sine.inOut");
  shot(t.et + 0.2, span(t.et + 0.2, t.p4 + 0.1, 0.8), UNIT_VALVES, "sine.inOut", UNIT_TOP.d);
  st(t.p4, 0.3, { litValves: 1 }, "sine.out");
  const cValves = co.add({ title: "Deux vannes", sub: "Par roue", x: 400, y: 740, align: "end", tone: "system", anchor: A.inlet });
  cValves.show(tl, t.p4 - 0.05);
  cValves.hide(tl, t.p5 - 0.5);

  /* ───────────── "et une pompe." — down the block: the valves go out, the pump and its motor light up ───────────── */
  shot(t.p5 - 0.45, 0.6, UNIT_PUMP, "sine.inOut", UNIT_VALVES.d);
  st(t.p5 - 0.45, 0.3, { litValves: 0 }, "sine.inOut");
  st(t.p5, 0.3, { litPump: 1 }, "sine.out");
  const cPump = co.add({ title: "Pompe", x: 400, y: 960, align: "end", tone: "system", anchor: A.pump });
  cPump.show(tl, t.p5 - 0.05);
  cPump.hide(tl, t.torepos - 0.28);

  /* ───────────── "Tant qu'aucune roue ne se bloque, il ne touche à rien." — whole again, a wheel of glass turning ───────────── */
  // Your foot goes down: the fluid's light comes down the line from the master cylinder, goes through the open valve
  // and on to the caliper, while the camera closes on the unit. In the block nothing moves.
  cut(t.torepos, SET.BENCH, REST_WIDE, { ...BENCHED, xray: 1, kmh: 80, wkmh: 80, rolled: 0 });
  shot(t.torepos + 0.02, span(t.torepos, t.idle - 0.1, 1.2), REST_UNIT, "sine.inOut", REST_WIDE.d);
  st(t.torepos + 0.02, span(t.torepos, t.idle - 0.1, 1.2), L_REST, "sine.inOut");
  st(t.torepos + 0.15, span(t.torepos + 0.15, t.touche - 0.3, 0.9), { brake: 0.6 }, "sine.inOut");
  st(t.torepos + 0.9, span(t.torepos + 0.9, t.four, 1.2), { grip: 0.6 }, "none");
  // the wheel turns at its steady pace all through the shot…
  const steady = t.ralentisse - t.torepos;
  st(t.torepos, steady, { rolled: V_BENCH * steady }, "none");

  /* ───────────── "Il surveille tes quatre roues…" — back down the sensor's wire: the veille pulses come up it ───────────── */
  const toWatch = span(t.watch - 0.15, t.four + 0.1, 0.7);
  shot(t.watch - 0.15, toWatch, WATCH, "sine.inOut", REST_UNIT.d);
  st(t.watch - 0.15, toWatch, L_WATCH, "sine.inOut");
  st(t.watch, 0.3, { sense: 1 }, "sine.out");
  chip("chip-veille", null, 96, 470, t.four - 0.05, t.ralentisse - 0.12);

  /* ───────────── "et attend qu'une seule ralentisse trop vite." — the wheel slows at once: the pulses thin out, it has seen it ───────────── */
  shot(t.attend, span(t.attend, t.toseuil - 0.05, 0.8), WATCH_NEAR, "sine.inOut");
  const falling = span(t.ralentisse, t.toofast + 0.1, 0.5);
  st(t.ralentisse, falling, { wkmh: 80 * SLOW }, "none");
  const fell = (V_BENCH * falling * (1 + SLOW)) / 2;
  st(t.ralentisse, falling, { rolled: V_BENCH * steady + fell }, slowing(SLOW));
  const after = span(t.ralentisse + falling, t.toseuil, 0.1);
  st(t.ralentisse + falling, after, { rolled: V_BENCH * steady + fell + V_BENCH * SLOW * after }, "none");
  st(t.toofast, 0.25, { litEcu: 1 }, "sine.out");

  /* ───────────── the threshold — "Abonne-toi : cette pédale qui tremble, regarde ce qui se passe dans ta roue." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: back in the street on the very
  // picture of the hook — the wheel in the rain, the truck's lights, the pedal trembling — and ONE move round the wheel
  // and into it while it turns to glass: the disc, the caliper. The header's wheel answers "roue": it dips under the
  // car's speed and comes back — one cycle, unexplained: act 3 takes it apart.
  // (the chevrons and the lit name need a third of a second to leave: they are gone when act 3 cuts)
  cut(t.toseuil, SET.STREET, VIEW.hook, { ...STAGED, ...FIRST, brake: 1, dive: 0.8, pulse: 1, pump: 1 });
  const run = t.tozero - t.toseuil - 0.02;
  shot(t.toseuil + 0.02, run, INWHEEL, "sine.inOut", VIEW.hook.d);
  st(t.toseuil + 0.02, run, { gap: FIRST.gap - V_ROAD * run }, "none");
  const seeIn = span(t.regarde - 0.2, t.passe, 0.6);
  st(t.regarde - 0.2, seeIn, { xray: 1 }, "sine.inOut");
  // the wheel rolls with the road, but for the dip: it bites, slows, is let go, and comes back
  const dipAt = Math.min(t.passe, t.tozero - 1.3);
  const dip = span(dipAt, t.roue, 0.4);
  const back = span(dipAt + dip, t.tozero - 0.05, 0.3);
  const rolledAt = (to) => V_ROAD * (to - t.toseuil - 0.02);
  st(t.toseuil + 0.02, dipAt - t.toseuil - 0.02, { rolled: rolledAt(dipAt) }, "none");
  st(dipAt, dip + back, { rolled: rolledAt(dipAt) + V_ROAD * (dip + back) * (1 - DIP / 2) }, dipping(DIP));
  st(dipAt, dip, { wkmh: 58, grip: 0.95 }, "sine.inOut");
  st(dipAt + dip, back, { wkmh: 77, grip: 0.4 }, "sine.inOut");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  const beat = Math.min(t.roue, t.tozero - 0.7);
  tl.fromTo("#hud-count", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, beat);
  tl.to("#hud-count", { scale: 1, duration: 0.36, ease: "power2.out" }, beat + 0.3);
}
