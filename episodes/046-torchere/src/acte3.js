// 03 · RÉPONSE — from « Les vannes s'ouvrent. » to « Rien n'a explosé. » (tozero → toverdict). The climax.
// In cuts: the voice comes in short breaths, one shot per breath, each readable in half a second, each laid a few frames
// before its sentence. Every shot MOVES (a push, a pull-back, a few degrees of turn): nothing sits still.
//
// The gas is the thread: one head of signal light runs the whole path, and every cut picks it up where the voice is —
//   · the valves, from the +x side (in front of the columns, which are full of red: the valves dark on that halo);
//     their discs lift on « s'ouvrent », three heads leave them;
//   · the header on its rack: the head RUSHES (the flow accelerates, the camera runs with it);
//   · the drum in section: the head goes through, the liquid falls out;
//   · the seal in section: the head goes down the dip pipe, the gas bubbles (signal);
//   · ONE move up the stack with the head, from the foot to the tip, where the camera arrives first and waits: the head
//     comes up into the frame and the pilot lights it — the strong moment is seen whole, no cut on « l'allume »;
//   · « La torche enfle »: the cut to the low angle of the first frame (the rhyme), the flare swells to full, it roars;
//   · the columns: the red goes down on « retombe » — `mood` 0 there, not before: the system has won;
//   · half an hour later, the compressor restarts; the whole plant, intact, under the flame.
// Hands over on VIEW.flare: flare 1, smoke 1, press 0, mood 0, hum 1, the rotor running.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, FLOWAT, LOOK, KO, SEAL, COMPRESSOR, TIP } from "./world.js";

const RPS = 2.2; // the rotor's running speed, in turns per second (the one act 1 shows before the fault)
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };

/* ── the poses (found with `look`) ── */
// the middle valve from the +z side, dark on its column full of red; the next one behind it, in depth
const VALVES0 = { ...P, tx: -1930, ty: 1330, tz: 120, d: 1450, az: 24, el: 5, fov: 30, shift: 0 };
const VALVES1 = { ...VALVES0, d: 1300, az: 19 };
// the header on its rack, the camera running with the head toward the drum
// (from the +z side, looking down on the rack: the columns stay out of the frame, the head runs to the right)
const HEAD0 = { ...P, tx: -1700, ty: 600, tz: 0, d: 1700, az: 16, el: 22, fov: 32, shift: 60 };
const HEAD1 = { ...HEAD0, tx: -1250, az: 10 };
// the drum in section, whole
const DRUM0 = { ...P, ...CLOSE, tx: -1150, ty: 300, tz: 0, d: 3000, az: -38, el: 18, shift: 120 };
const DRUM1 = { ...DRUM0, tx: -950, d: 2800, az: -32 };
// the seal in section, the dip pipe and the water
const SEAL0 = { ...VIEW.seal };
const SEAL1 = { ...SEAL0, d: 1200, az: -28, ty: 270 };
// up the stack, the whole of it: the head races up the dark tube
const STACK0 = { ...P, tx: 0, ty: 800, tz: 0, d: 3300, az: -40, el: 2, fov: 34, shift: 40 };
const STACK1 = { ...STACK0, ty: 1350, d: 3100, az: -34, el: -4 };
// the tip, where the camera waits for the head
const TIP0 = { ...P, ...CLOSE, tx: -40, ty: 1880, tz: 30, d: 1000, az: -40, el: -10, fov: 32, shift: 60 };
const TIP1 = { ...TIP0, d: 930, az: -35 };
const TIPBACK = { ...TIP0, d: 1400, el: -16, shift: 0 };
// the low angle of the first frame, further back: the whole flame under the header
const LOW0 = { ...P, tx: -650, ty: 2650, tz: 0, d: 3900, az: 100, el: -18, fov: 50, shift: -90 };
const LOW1 = { ...LOW0, d: 4300, az: 105 };
// the columns, their red going down
const COLS0 = { ...VIEW.columns };
const COLS1 = { ...COLS0, d: 3600, az: -36 };
// the compressor
const COMP0 = { ...VIEW.compressor, d: 1650, ty: 230 };
const COMP1 = { ...COMP0, d: 1500, az: 31 };
// the whole plant under the flame, from the first frame's side (into the dusk: the columns, glass, on the sky)
const FLARE0 = { ...P, tx: -1200, ty: 1500, tz: 0, d: 7200, az: 96, el: 3, fov: 40, shift: 40 };
const FLARE1 = { ...FLARE0, d: 6800, az: 100 };

export default function acte3({ D }) {
  const { tl, st, shot, cut, jolt, punch } = D;
  const t = D.times({
    zero: "zero", tozero: "tozero", ouvrent: "zero:ouvrent",
    gaz: "zero:le#2", traverse: "zero:il", bulle0: "zero:il#2", bulle: "bulle", climb: "zero:il#3",
    bout: "reponse:au", trigger: "trigger", torche: "reponse:la#2", enfle: "enfle", gronde0: "reponse:elle", gronde: "roar",
    usine: "reponse:dans", retombe: "falls", later: "reponse:une", repart: "restart", rien: "reponse:rien", toverdict: "toverdict",
  });
  const lead = 0.12; // a cut lands a few frames before its sentence
  const toHead = t.gaz - lead, toDrum = t.traverse - lead, toSeal = t.bulle0 - lead, toClimb = t.climb - lead;
  const toLow = t.torche - lead, toCols = t.usine - lead, toComp = t.later - lead, toFlare = t.rien - lead;
  setAct(tl, 3, t.zero);

  /* « Les vannes s'ouvrent. » — the valves in front of their red columns; the discs lift on the word */
  cut(t.tozero, SET.SCENE, VALVES0, {
    ...STAGED, press: 1, hum: 0, rotor: 0, mood: 1, flare: 0.08, smoke: 0,
    fx: -1950, fy: 1150, fz: 0, fs: 1500,
  });
  shot(t.tozero, toHead - t.tozero, VALVES1, "sine.out");
  st(t.ouvrent - 0.1, 0.45, { relief: 1 }, "power2.out");
  punch(t.ouvrent, 0.06);
  st(t.ouvrent + 0.05, toHead + 0.1 - (t.ouvrent + 0.05), { flow: FLOWAT.header }, "none"); // three heads leave the valves

  /* « Le gaz se rue dans le collecteur. » — the head rushes along the rack, the camera with it */
  cut(toHead, null, HEAD0, { fx: -1550, fy: 600, fz: 0, fs: 800 });
  shot(toHead, toDrum - toHead, HEAD1, "sine.in");
  st(toHead + 0.15, toDrum - toHead - 0.15, { flow: 0.34 }, "power2.in");

  /* « Il traverse le ballon. » — the drum in section: the head goes through, the liquid falls out */
  cut(toDrum, null, DRUM0, { section: 0.6, fx: KO.at[0], fy: KO.at[1], fz: 0, fs: 800 });
  shot(toDrum, toSeal - toDrum, DRUM1, "sine.inOut");
  st(toDrum, toSeal - toDrum, { flow: 0.48 }, "none");
  st(t.traverse + 0.1, 1.0, { liquid: 0.5 }, "power1.out");

  /* « Il bulle dans la garde. » — the seal in section: down the dip pipe, and the gas bubbles */
  cut(toSeal, null, SEAL0, { section: 0.8, fx: SEAL.at[0], fy: 250, fz: SEAL.at[1], fs: 400 });
  shot(toSeal, toClimb - toSeal, SEAL1, "sine.inOut");
  st(toSeal, t.bulle - toSeal, { flow: FLOWAT.seal }, "power1.in");
  st(t.bulle, toClimb - t.bulle, { flow: FLOWAT.sealOut }, "none");

  /* « Il monte. » — the whole stack, the head races up it (the stack closed: its gas reads on the dark tube) */
  cut(toClimb, null, STACK0, { section: 0, fx: 0, fy: 900, fz: 0, fs: 1000 });
  shot(toClimb, t.bout - lead - toClimb, STACK1, "sine.inOut");
  st(toClimb, t.bout - lead - toClimb, { flow: 0.9 }, "power1.inOut");

  /* « Au bout, la petite flamme l'allume. » — the tip: the head comes up into the frame, the pilot lights it — seen
     whole, no cut on « l'allume » */
  cut(t.bout - lead, null, TIP0, { fx: 0, fy: TIP.y1, fz: 0, fs: 150 });
  shot(t.bout - lead, t.trigger - t.bout + lead, TIP1, "sine.inOut");
  st(t.bout - lead, t.trigger - t.bout + lead, { flow: FLOWAT.tip }, "power1.out");
  st(t.trigger, 0.3, { flare: 0.5 }, "power2.out");
  st(t.trigger, 1.4, { smoke: 0.6 }, "power1.out");
  jolt(t.trigger, 0.45, 0.5);
  shot(t.trigger + 0.05, toLow - t.trigger - 0.05, TIPBACK, "sine.out");

  /* « La torche enfle. » « Elle gronde. » — the low angle of the first frame: the flare to full, it roars */
  cut(toLow, null, LOW0, { fx: 0, fy: 2400, fz: 0, fs: 1500 });
  shot(toLow, toCols - toLow, LOW1, "sine.inOut");
  st(toLow, 1.2, { flare: 1 }, "power2.out");
  st(toLow, 2.0, { smoke: 1 }, "sine.inOut");
  punch(t.enfle, 0.06);
  jolt(t.gronde, 0.35, 0.6);

  /* « Dans l'usine, la pression retombe. » — the columns: the red goes down; the system has won, mood 0 on the word */
  cut(toCols, null, COLS0, { fx: -2150, fy: 700, fz: 0, fs: 1500 });
  shot(toCols, toComp - toCols, COLS1, "sine.inOut");
  st(t.retombe - 0.35, 1.5, { press: 0 }, "sine.inOut");
  st(t.retombe, 0.3, { mood: 0 }, "sine.inOut");
  st(t.retombe + 0.4, 0.8, { relief: 0 }, "sine.inOut");
  punch(t.retombe, 0.06);

  /* « Une demi-heure plus tard, le compresseur repart. » — the header jumps to 17:00:00 (main.js); the rotor restarts */
  cut(toComp, null, COMP0, { hum: 0, rotor: 0, fx: COMPRESSOR.at[0] - 150, fy: 200, fz: COMPRESSOR.at[2], fs: 800 });
  shot(toComp, toFlare - toComp, COMP1, "sine.inOut");
  const SPIN = 1.6; // the spin-up
  st(t.repart, SPIN, { rotor: (RPS * SPIN) / 2 }, "power2.in");
  st(t.repart + SPIN, t.toverdict - (t.repart + SPIN), { rotor: (RPS * SPIN) / 2 + RPS * (t.toverdict - (t.repart + SPIN)) }, "none");
  st(t.repart, 0.8, { hum: 1 }, "power1.out");

  /* « Rien n'a explosé. » — the whole plant, intact, under the flame */
  cut(toFlare, null, FLARE0, { fx: -1000, fy: 1000, fz: 0, fs: 3000 });
  shot(toFlare, t.toverdict - toFlare, FLARE1, "sine.inOut");
}
