// 02 · AUTOPSIE — from « Alors… on l'ouvre » to the cut of act 3 (tosystem → tozero).
//
// Act 1 leaves the system under the desk of the empty cab (VIEW.system), the train still running. On « Alors… »
// the same picture holds; a few frames before « on » the same system stands on the bench at the same place of the
// picture (benchCut), and on « on » it comes apart in ONE vertical frame while the camera pulls back to the whole
// exploded view. Each part the voice names gets its frame and its gesture: the pedal sinks and comes back up on its
// spring, the keys light up as under fingers, the dial — behind them — counts. Then it closes again: the glass boot
// comes and presses the pedal (« Appuyer ne suffit pas »), the ring empties in a straight line over « près d'une
// minute » and turns signal on « sonnerie »; the boot lifts, presses again, the ring refills veille; twice more,
// fast, « toute la journée ». « Pourquoi relâcher ? » — the camera closes on the boot, the dial at the edge of the
// frame, draining. « Un corps effondré… » : the boot goes heavy and dim, the pedal stays down — and the ring goes on
// emptying and turns signal near zero: pressing proves nothing. The threshold does not stop the film: a cut back
// to the empty cab (the same object: the pedal's cab), the empty seat centred on « vide », and on « regarde » the
// camera is already on its way down to the knee space under the desk. Act 3 cuts from there.
// The train runs all along in the story: `kmh` is never touched (the header goes on reading 255 km/h).
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FIRST, MPS, CAB_PEDAL, BENCHAT, SYSTEM } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [CX, CY, CZ] = SYSTEM.centre;

/* ── on the bench (the root at BENCHAT): where the parts stand once opened (model.js, OPEN, seen from az −40) ── */
const EXP = VIEW.exploded;
// the pedal at the foot of the exploded view, closer
const PEDAL_X = { ...P, tx: -28, ty: 98, tz: 7, d: 230, az: -40, el: 20, shift: 120 }; // the pedal low in the frame, the box and its dial above it in the top slot
// the keys, tilted toward the camera, above the box
const KEYS_X = { ...P, tx: -8, ty: 144, tz: 25, d: 340, az: -40, el: 22, shift: 120 };
// the box and its dial, square on (the box is turned −40° once opened: its dial faces the camera)
const DIAL_X = { ...P, tx: -33, ty: 117, tz: 21, d: 225, az: -40, el: 6, shift: 120 };
/* ── assembled ── */
// the boot, the pedal and the dial in one frame (and the bell above, on the desk's silhouette)
const PRESS = { ...P, tx: -35, ty: 112, tz: 15, d: 360, az: -24, el: 28, shift: 40 };
// close on the boot, the dial at the edge of the frame
const BOOTF = { ...P, tx: -28, ty: 92, tz: 5, d: 190, az: -32, el: 18, shift: 60 };
// the dead weight at the foot of the frame, the dial above it, whole
const BODY = { ...P, tx: -40, ty: 102, tz: 10, d: 280, az: -24, el: 26, shift: 0 };
/* ── on the line ── */
// the empty seat, from the windscreen (act 1's pose), then on its way down to the knee space under the desk
const CAB = VIEW.cab;
const DOWN = { ...VIEW.system, d: 280, shift: 60 };

// the light: what it stands around, and how wide
const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });
const L_CAB_SYS = L(CAB_PEDAL[0] + CX, CAB_PEDAL[1] + CY, CAB_PEDAL[2] + CZ, 120);
const L_WHOLE = L(CX, BENCHAT[1] + CY, CZ, SYSTEM.size);
const L_PEDAL = L(-32, 84, 4, 45);
const L_KEYS = L(-8, 144, 25, 45);
const L_DIAL = L(-33, 117, 21, 40);
const L_BOOT = L(-25, 90, 4, 55);
const L_BODY = L(-35, 98, 4, 60);
const L_SEAT = L(-700, 240, 0, 250);

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", alors: "ouvre", tobench: "tobench", explode: "explode",
    pedale: "pedale", pedaleW: "eclate:pédale", touches: "touches", doigts: "doigts", derriere: "derriere", compte: "compte", eclateEnd: "eclate$",
    torepos: "torepos", press: "press", minute: "minute", ring1: "ring1", sonnerie: "repos:sonnerie",
    release: "release", relacher: "repos:relâcher", repress: "repress", reappuyer: "repos:réappuyer",
    day: "day", why: "why", body: "body", corps: "repos:corps", inert: "inert", encore: "repos:encore",
    toseuil: "toseuil", seuil: "seuil", empty: "empty", vide: "seuil:vide", watch: "watch", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── « Alors… » — the system under the desk of the empty cab, the train running ───────────── */
  // (act 1's last picture: this cut only says the whole state; the world keeps scrolling in a straight line)
  const run0 = FIRST.run + MPS * t.tosystem;
  cut(t.tosystem, SET.LINE, VIEW.system, { ...STAGED, shell: 0.4, cab: 1, run: run0, count: 1, danger: 0, litBox: 0, ...L_CAB_SYS });
  st(t.tosystem, t.tobench - t.tosystem, { run: run0 + MPS * (t.tobench - t.tosystem) }, "none");

  /* ───────────── « …on l'ouvre. » — the same system on the bench, at the same place; on « on » it comes apart ───────────── */
  const origin = [CAB_PEDAL[0] - BENCHAT[0], CAB_PEDAL[1] - BENCHAT[1], CAB_PEDAL[2] - BENCHAT[2]];
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin, state: { ...BENCHED, ...L_WHOLE } });
  st(t.explode, 1.05, { explode: 1 }, "power2.out");
  const back = t.pedale - 0.2 - (t.tobench + 0.03);
  shot(t.tobench + 0.03, back, EXP, "sine.inOut", bench.d);

  /* ───────────── « Une pédale. » — it lights, the camera goes down to it; it sinks and comes back on its spring ───────────── */
  const toPedal = t.pedale - 0.16;
  shot(toPedal, 0.6, PEDAL_X, "sine.inOut", EXP.d);
  st(toPedal, 0.6, L_PEDAL, "sine.inOut");
  st(t.pedale + 0.02, 0.25, { litPedal: 1 }, "sine.out");
  st(t.pedaleW + 0.04, 0.26, { pedal: 1 }, "power2.inOut");
  st(t.pedaleW + 0.42, 0.34, { pedal: 0 }, "back.out(2.2)"); // its spring brings it back
  const cPedal = co.add({ title: "Pédale", x: 170, y: 1190, align: "start", tone: "system", anchor: A.pedal });
  cPedal.show(tl, t.pedale);
  cPedal.hide(tl, t.touches - 0.1);

  /* ───────────── « Ou des touches, sous les doigts. » — up to the keys; they light up as under fingers ───────────── */
  st(t.touches - 0.12, 0.25, { litPedal: 0 }, "sine.inOut");
  shot(t.touches - 0.12, t.doigts - (t.touches - 0.12), KEYS_X, "sine.inOut");
  st(t.touches - 0.12, 0.55, L_KEYS, "sine.inOut");
  st(t.touches + 0.04, 0.25, { litKeys: 1 }, "sine.out");
  st(t.doigts + 0.06, 0.12, { keys: 1 }, "power2.out");
  st(t.doigts + 0.5, 0.4, { keys: 0.3 }, "sine.inOut");
  const cKeys = co.add({ title: "Touches", x: 910, y: 600, align: "end", tone: "system", anchor: A.keys });
  cKeys.show(tl, t.touches);
  cKeys.hide(tl, t.derriere - 0.05);

  /* ───────────── « Et derrière… un simple compte à rebours. » — behind the keys, the box and its dial: it counts ───────────── */
  st(t.derriere, 0.3, { litKeys: 0, keys: 0 }, "sine.inOut");
  shot(t.derriere, t.compte - 0.08 - t.derriere, DIAL_X, "sine.inOut", KEYS_X.d);
  st(t.derriere, 0.9, L_DIAL, "sine.inOut");
  st(t.compte - 0.25, 0.3, { litBox: 1 }, "sine.out");
  st(t.compte + 0.1, 0.5, { count: 0.75 }, "sine.out");
  shot(t.compte - 0.08, t.eclateEnd + 0.12 - (t.compte - 0.08), { ...DIAL_X, d: 205 }, "sine.inOut");
  const cBox = co.add({ title: "Compte à rebours", x: 910, y: 520, align: "end", tone: "system", anchor: A.dial });
  cBox.show(tl, t.compte - 0.04);
  cBox.hide(tl, t.eclateEnd + 0.1);

  /* ───────────── « Appuyer ne suffit pas. » — it closes again; the glass boot comes and presses the pedal ───────────── */
  const shut = t.eclateEnd + 0.12;
  st(shut, t.press + 0.16 - shut, { explode: 0 }, "sine.inOut");
  shot(shut, t.press + 0.5 - shut, PRESS, "sine.inOut", 205);
  st(shut, 0.9, L_WHOLE, "sine.inOut");
  st(shut, 0.4, { litBox: 0 }, "sine.inOut");
  st(t.press + 0.02, 0.42, { foot: 1 }, "power2.out");
  st(t.press + 0.36, 0.2, { pedal: 1 }, "power2.inOut");
  st(t.press + 0.4, 0.25, { count: 1 }, "sine.out"); // the gesture feeds it

  /* ───────────── « Près d'une minute sans lâcher : une sonnerie. » — the boot holds, the ring empties: signal, the bell ───────────── */
  st(t.minute, t.ring1 - t.minute, { count: 0 }, "none");
  chip("chip-minute", null, 96, 470, t.minute, t.sonnerie - 0.16);
  now(t.minute + 0.8 * (t.ring1 - t.minute), { danger: 1 }); // the last fifth of the ring runs out signal
  st(t.sonnerie - 0.02, 0.18, { bell: 1 }, "power2.out");

  /* ───────────── « Il faut relâcher. Puis réappuyer. » — the boot lifts, the pedal comes up; again: the ring refills ───────────── */
  st(t.relacher - 0.02, 0.3, { pedal: 0, foot: 0.6 }, "power2.out");
  st(t.relacher + 0.05, 0.3, { bell: 0 }, "sine.inOut");
  st(t.reappuyer - 0.04, 0.24, { foot: 1 }, "power2.in");
  st(t.reappuyer + 0.14, 0.16, { pedal: 1 }, "power2.out");
  now(t.reappuyer + 0.18, { danger: 0 });
  st(t.reappuyer + 0.18, 0.28, { count: 1 }, "sine.out");

  /* ───────────── « Toute la journée. » — twice more, fast; the frame widens a little ───────────── */
  const cycle = (at) => {
    st(at, 0.11, { pedal: 0, foot: 0.72, count: 0.86 }, "power2.out");
    st(at + 0.13, 0.1, { foot: 1, pedal: 1 }, "power2.in");
    st(at + 0.23, 0.1, { count: 1 }, "sine.out");
  };
  cycle(t.day - 0.08);
  cycle(t.day + 0.36);
  shot(t.day - 0.3, t.why + 0.1 - (t.day - 0.3), { ...PRESS, d: 370 }, "sine.inOut");
  chip("chip-relache", null, 96, 470, t.day - 0.3, t.why);

  /* ───────────── « Pourquoi relâcher ? » — the boot presses and holds; the camera closes on it, the dial draining ───────────── */
  const hold = t.day + 0.36 + 0.33; // the last press is home
  st(hold, t.encore + 0.6 - hold, { count: 0 }, "none"); // a minute, held: the ring empties all along
  shot(t.why + 0.1, t.body + 0.2 - (t.why + 0.1), BOOTF, "sine.inOut", 370);
  st(t.why + 0.1, 1.2, L_BOOT, "sine.inOut");

  /* ───────────── « Parce qu'un corps effondré… peut appuyer encore. » — a dead weight; the ring goes signal near zero ───────────── */
  st(t.corps, 0.8, { still: 0.7 }, "power2.inOut"); // (at 1 the boot fades as much as it sinks: it would read as leaving)
  shot(t.body + 0.4, t.encore + 0.1 - (t.body + 0.4), BODY, "sine.inOut", BOOTF.d); // up from the dead weight to the dial, which goes on emptying
  st(t.body + 0.4, 1.2, L_BODY, "sine.inOut");
  now(t.encore, { danger: 1 });

  /* ───────────── the threshold — « Abonne-toi : cette cabine vide, regarde ce qui s'y passe. » ───────────── */
  // The film does not stop: a cut back to the empty cab (the pedal's own cab), the seat centred on « vide »; on
  // « regarde » the camera is already on its way down to the knee space under the desk — act 3 cuts there, close.
  const run1 = FIRST.run + MPS * t.toseuil;
  cut(t.toseuil, SET.LINE, CAB, { ...STAGED, run: run1, count: 1, danger: 0, bell: 0, cut: 0, vent: 0, ...L_SEAT });
  st(t.toseuil, t.tozero - t.toseuil, { run: run1 + MPS * (t.tozero - t.toseuil) }, "none");
  const go = t.vide + 0.12;
  shot(t.toseuil, go - t.toseuil, { ...CAB, d: CAB.d - 14 }, "sine.inOut");
  shot(go, t.tozero - go, DOWN, "sine.inOut");
  st(go, t.tozero - go, { ...L_CAB_SYS, shell: 0.4 }, "sine.inOut");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.15) });
}
