// 02 · AUTOPSIE — from the cut to the bench to the cut of act 3 (tobench → tozero).
//
// Act 1 holds VIEW.system through the silence and « Alors… » (tosystem → tobench, its last row). Just before « on »
// the sky goes out around the head and the same head stands on its pool, IN PLACE (benchCut, origin [0, 0, 0]). On
// « on » it opens like a clam — the two halves of the fairing part and turn out, the nose and its four motors rise,
// the orbital module rises, the sensors step out of the glass section — while the camera pulls straight back to the
// whole exploded view (the three clicks of the sound land on those three arrivals). Then one part per sentence, each
// with its gesture, on its word:
//   « Tout en haut : quatre petits moteurs à poudre » — the camera rises under the raised nose: the four throats
//     light one per word (« quatre », « petits », « moteurs », « poudre »), the fourth seen through the gap between
//     the nose and the orbital module; the four clicks of the sound echo them;
//   « Juste dessous : ton vaisseau, ton équipier, toi » — down into the opened fairing, over the descent module: the
//     ship lights, then your crewmate, then you (the brightest, and the lens closes on « toi »);
//   « Et plus bas, sur la fusée, des capteurs… » — one fast move down the glass section to the sensor: it lights,
//     its wire with it; « …qui la sentent tourner » — the camera pulls back: the column turns on its foot and the
//     order runs up the wire to the module.
// THE WINDOW. The head closes, the tower comes back on its nose (a memory: ink, glass). « fenêtre » — the frise of the
// top slot (#window); « la tour qui part » — the tower leaves upward and the bar starts to fill; « la coiffe qui
// tombe » — the fairing tips out and falls, the bar is full; « Quarante secondes, environ » — the figure; then, back
// inside the window (the fairing comes back up, the tower stays gone), « ta fusée lâche » — the strike's mark falls on
// the bar at 10 %; « pile » — the four motors light: ready.
// The threshold does not stop the film: the panel leaves, the camera is already on its way to the nose; after
// « moteurs… » it whips in to the front motor's nozzle — on « regarde-les » we are in front of it, the glow deep in
// its throat. Act 3 cuts from there to booster D's nose (a cone on a cone).
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, HEAD, LOOK, TOWER_GONE } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: LOOK.dof };
const INK = "#e9e4d8";

/* ── the frames (the head stands at the origin: a point of it is where it stands in the sky) ── */
// the whole exploded view, under the header (docs/journal/026-model.md)
const OPEN = { ...VIEW.exploded };
// under the raised nose (explode 1: the motors' centres at y 830), looking up: the four throats face the camera —
// the back one through the gap between the nose (from 760) and the orbital module (up to 617)
const MOTORS = { ...P, ...CLOSE, tx: 0, ty: 800, tz: 0, d: 1400, az: -40, el: -20, fov: 30, shift: -40 };
const MOTORS_IN = { ...MOTORS, d: 1260 };
// the vessel: the descent module from above, the orbital module over it, between the opened halves — held ABOVE the
// captions (shift: at shift 20 its lower half lay under them)
const SHIP = { ...P, ...CLOSE, tx: -20, ty: 110, tz: -10, d: 1300, az: -30, el: 32, fov: 30, shift: 140 };
// you and your crewmate, from above (VIEW.shipBench, a little further and pushed up: the couches out of the captions)
const CREW = { ...VIEW.shipBench, d: 820, el: 50, shift: 300 };
// sensor A, its gyroscope ring and its lamp, stepped out of the glass section (docs/journal/026-model.md)
const SENSOR = { ...VIEW.sensorsBench };
// the column turns: sensor A low in the frame, its wire up to the junction under the descent module (at d 3000 the
// box was 40 px at the foot of a dark column: here it reads, and the lean of the glass section with it)
const TURN = { ...P, tx: -40, ty: -250, tz: 50, d: 2200, az: -40, el: 6, fov: 30, shift: 120 };
const TURN_IN = { ...TURN, d: 2100 };
// the window: the head closed, the tower on its nose, under the panel of the top slot (436 → ≈ 672): the nose at
// y ≈ 900, the motors ≈ 1030, the tower's top behind the panel (its foot and its jets, the part that leaves, show)
const WIN = { ...P, tx: 0, ty: 600, tz: 0, d: 4300, az: -30, el: 6, fov: 30, shift: -100 };
const WIN_IN = { ...WIN, d: 4000, az: -25 };
// the threshold: the nose and its lit motors, then the front motor's nozzle (VIEW.nozzle: the glow deep in its throat)
const APPROACH = { ...P, tx: -60, ty: 610, tz: 60, d: 1600, az: -40, el: 0, fov: 30, shift: 20 };
const NOZZLE = { ...VIEW.nozzle };
const NOZZLE_IN = { ...VIEW.nozzle, d: 370 };

/* ── the light: what it stands around, and how wide ── */
const L_HEAD = { fx: HEAD.centre[0], fy: HEAD.centre[1], fz: HEAD.centre[2], fs: HEAD.size };
const L_OPEN = { fx: 0, fy: 480, fz: 0, fs: 650 };
const L_MOTORS = { fx: 0, fy: 830, fz: 0, fs: 220 };
const L_SHIP = { fx: -20, fy: 120, fz: -10, fs: 260 };
const L_SENSOR = { fx: -88, fy: -395, fz: 126, fs: 160 };
const L_TURN = { fx: 0, fy: -250, fz: 0, fs: 700 };
const L_WIN = { fx: 0, fy: 600, fz: 0, fs: 700 };
const L_APPROACH = { fx: -60, fy: 610, fz: 60, fs: 300 };
const L_NOZZLE = { fx: -100, fy: 600, fz: 100, fs: 200 };

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", on: "explode", top: "top",
    quatre: "eclate:quatre", petits: "eclate:petits", moteurs: "eclate:moteurs", poudre: "eclate:poudre",
    juste: "eclate:Juste", vaisseau: "eclate:vaisseau", equipier: "eclate:équipier", toi: "eclate:toi", toiEnd: "eclate:toi$",
    lower: "lower", capteurs: "eclate:capteurs", capteursEnd: "eclate:capteurs$", tourner: "eclate:tourner",
    torepos: "torepos", fenetre: "repos:fenêtre", part: "repos:part", tombe: "repos:tombe", quarante: "repos:Quarante",
    environEnd: "repos:environ$", lache: "repos:lâche", pile: "repos:pile", fenetre2: "repos:fenêtre#2",
    toseuil: "toseuil", seuilMotorsEnd: "seuil:moteurs$", regarde: "seuil:regarde-les", tirer: "seuil:tirer", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── « …on l'ouvre. » — the same head on the bench, in place; on « on » it opens ───────────── */
  // (the four motors keep the faint glow act 1 left them: nothing jumps on the cut)
  benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: [0, 0, 0], state: { ...BENCHED, pool: 0, grid: 0, litMotors: 4, ...L_HEAD } });
  // (power1.out: it bursts on the word, and its three arrivals — the nose 20,77, the orbital module 20,98, the sensors
  // 21,26 — fall on the three clicks of the sound)
  st(t.on, 0.9, { explode: 1 }, "power1.out");
  st(t.on, 0.3, { litMotors: 0 }, "sine.inOut");
  // the camera pulls straight back WITH the opening, in cm, leaving fast: from VIEW.system (d 2900, shift 0) the rising
  // nose's tip peaks at y ≈ 419, under the header (computed with the stage's camera; power2.out let it reach 375)
  const rise = t.top - 0.36;
  shot(t.on - 0.08, rise - (t.on - 0.08), OPEN, "power3.out");
  st(t.on, rise - t.on, L_OPEN, "sine.inOut");

  /* ───────────── « Tout en haut : quatre petits moteurs à poudre. » — under the nose: one throat per word ───────────── */
  shot(rise, t.quatre - 0.1 - rise, MOTORS, "sine.inOut", OPEN.d);
  st(rise, t.quatre - 0.1 - rise, L_MOTORS, "sine.inOut");
  // the order is the model's (MOTORS.az: front, right, back, left): the back one is hidden behind the nose from any
  // camera that sees the throats — it lights in the same breath as the left one, so that every word lights one we see
  st(t.quatre, 0.14, { litMotors: 1 }, "sine.out");
  st(t.petits, 0.14, { litMotors: 2 }, "sine.out");
  st(t.moteurs - 0.04, 0.22, { litMotors: 4 }, "sine.out");
  const down = t.juste - 0.2;
  shot(t.quatre - 0.1, down - (t.quatre - 0.1), MOTORS_IN, "sine.inOut"); // (it never stops: a slow push while they light)
  const cMotors = co.add({ title: "Moteurs à poudre", x: 96, y: 480, align: "start", tone: "system", anchor: A.motor });
  cMotors.show(tl, t.moteurs + 0.04); // (its words come with « à poudre »)
  cMotors.hide(tl, down);

  /* ───────────── « Juste dessous : ton vaisseau, ton équipier, toi. » — over the descent module: three lights, one frame ───────────── */
  shot(down, t.vaisseau - 0.06 - down, SHIP, "sine.inOut", MOTORS_IN.d);
  st(down, t.vaisseau - down, L_SHIP, "sine.inOut");
  st(t.vaisseau, 0.35, { litShip: 1 }, "sine.out");
  const near = t.vaisseau + 0.1;
  shot(near, t.toi + 0.12 - near, CREW, "sine.inOut", SHIP.d);
  // each new light takes the eye: the bell steps back for the crew (a veille figure in a veille bell does not read)
  st(t.equipier, 0.35, { litShip: 0.15, litMate: 0.6 }, "sine.out");
  st(t.toi, 0.3, { litYou: 1, litShip: 0, litMate: 0.3 }, "sine.out");
  D.punch(t.toi, 0.06, { hold: 0.12, down: 0.35 });

  /* ───────────── « Et plus bas, sur la fusée, des capteurs… » — one fast move down the glass section ───────────── */
  // (it leaves on the swish, toi$ + 0.14, and settles on the box)
  const leave = t.toiEnd + 0.1;
  shot(leave, t.capteurs - 0.1 - leave, SENSOR, "power2.out");
  st(leave, t.capteurs - leave, L_SENSOR, "sine.inOut");
  st(t.lower, 0.45, { litShip: 0, litMate: 0, litYou: 0 }, "sine.inOut");
  st(t.capteurs, 0.35, { litSensors: 1, sense: 0.4 }, "sine.out");
  const cSensors = co.add({ title: "Capteurs", x: 96, y: 480, align: "start", tone: "system", anchor: A.sensorA });
  cSensors.show(tl, t.capteurs - 0.04);
  cSensors.hide(tl, t.tourner - 0.22);

  /* ───────────── « …qui la sentent tourner. » — the camera pulls back; on « tourner » the column turns on its foot ───────────── */
  const back = t.capteursEnd - 0.07;
  shot(back, t.tourner - back, TURN, "sine.inOut", SENSOR.d);
  st(back, t.tourner - back, L_TURN, "sine.inOut");
  st(t.tourner, 0.6, { tilt: 7 }, "sine.inOut");
  st(t.tourner - 0.02, 0.35, { sense: 1 }, "sine.out"); // the lamp flares, the pulses run up the wire: the order
  D.punch(t.tourner, 0.06);
  shot(t.tourner, t.torepos - 0.05 - t.tourner, TURN_IN, "sine.inOut");

  /* ───────────── « Pour te sauver, ces moteurs n'ont qu'une fenêtre : » — the head closes, its tower back on its nose ───────────── */
  st(t.torepos, 1.1, { explode: 0 }, "sine.inOut");
  st(t.torepos, 0.8, { tilt: 0 }, "sine.inOut");
  st(t.torepos, 0.5, { sense: 0, litSensors: 0, litMotors: 0 }, "sine.inOut");
  now(t.torepos + 0.04, { tower: 0 }); // (the nose is out of the frame: the tower is simply there when it comes in)
  const up = t.torepos - 0.05;
  shot(up, t.fenetre - 0.15 - up, WIN, "sine.inOut", TURN_IN.d);
  st(up, t.fenetre - up, L_WIN, "sine.inOut");
  D.panel("#window", t.fenetre - 0.04, t.toseuil - 0.15);
  shot(t.fenetre - 0.15, t.toseuil - 0.12 - (t.fenetre - 0.15), WIN_IN, "sine.inOut"); // (a slow push all through the window)

  /* ───────────── « de la tour qui part à la coiffe qui tombe. » — the two ends of the window ───────────── */
  st(t.part, 0.85, { tower: 30 }, "power2.in");
  tl.fromTo("#window-a", { opacity: 0, x: -14, color: INK }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, t.part);
  tl.fromTo("#window-fill", { scaleX: 0 }, { scaleX: 1, duration: t.tombe - t.part, ease: "none" }, t.part);
  now(t.tombe - 0.02, { tower: TOWER_GONE }); // (long out of the frame: its trail goes with it)
  st(t.tombe, 0.85, { shed: 1 }, "none");
  tl.fromTo("#window-b", { opacity: 0, x: 14, color: INK }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, t.tombe);

  /* ───────────── « Quarante secondes, environ. » — the figure; then back inside the window ───────────── */
  tl.fromTo("#window-span", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, t.quarante);
  st(t.environEnd + 0.04, 0.5, { shed: 0 }, "sine.inOut"); // (on the blip: the fairing comes back up, the tower stays gone)

  /* ───────────── « Et ta fusée lâche… pile dans cette fenêtre. » — the strike's mark; the motors, ready ───────────── */
  tl.fromTo("#window-hit", { opacity: 0, y: -46 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2.2)" }, t.lache);
  st(t.pile, 0.45, { litMotors: 4 }, "none");
  D.punch(t.fenetre2, 0.05);

  /* ───────────── the threshold — « Abonne-toi : ces quatre petits moteurs… regarde-les tirer. » ───────────── */
  // The film does not stop for it: the panel leaves, the camera is already on its way to the nose; on the swish
  // (seuil:moteurs$) it whips in to the nozzle, and creeps on until act 3 cuts.
  const go = t.toseuil - 0.12;
  shot(go, t.seuilMotorsEnd - go, APPROACH, "sine.inOut", WIN_IN.d);
  st(go, t.seuilMotorsEnd - go, L_APPROACH, "sine.inOut");
  shot(t.seuilMotorsEnd, t.regarde - 0.02 - t.seuilMotorsEnd, NOZZLE, "power2.out");
  st(t.seuilMotorsEnd, 0.4, L_NOZZLE, "sine.inOut");
  shot(t.regarde - 0.02, t.tozero - (t.regarde - 0.02), NOZZLE_IN, "sine.inOut");
  followCall(tl, { from: t.toseuil, to: Math.min(t.seuilEnd + 0.05, t.tozero - 0.3) }); // (the chevrons have left before act 3 cuts)
  // the story's clock answers « tirer »: T+1,2 s, they fire at T+3,0
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.12, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.tirer);
  tl.to("#hud-clock", { scale: 1, duration: 0.32, ease: "power2.out" }, t.tirer + 0.18);
}
