// 02 · AUTOPSIE — from « Alors… on l'ouvre » to the cut of act 3 (tosystem → tozero).
//
// Act 1 leaves the bloc in the dark of the what-if, the IT cabinet glowing veille behind the back wall (VIEW.system).
// On « Alors… » a clean cut to that same picture, still and calm: the cabinet, the system standing in it. A few
// frames before « on » the same system stands on the bench at the same place of the picture (benchCut: MOUNT →
// BENCHAT), and on « on » it comes apart in ONE vertical frame while the camera pulls back to the whole exploded view.
// Each part the voice names gets its frame and its gesture: the transformer lights; the two windings — close — draw
// apart on « touchent » and the gap between them lights veille; the mains cable on the left lights; the secondary
// on the right lights and the camera follows its two conductors up to the rail and out to the casings; on « terre »
// the earth bar lights — and the two conductors do not touch it (the casings' protective conductors do).
// « Chez toi… » : the system closes; the bench says « home » (a link from the secondary to the earth, a ghost
// differential): the wire touches casing A and a whole loop of signal heads runs back through the earth bar; on
// « voit » the ghost differential lights. « Ici… » : the link and the ghost dissolve, the loop breaks; only a
// trickle is left through the three small marks — the camera closes on them. « Et un boîtier veille » : up to the
// monitor on the rail; its veille pulses leave into the two conductors, its gauge high.
// The threshold does not stop the film: a cut back to the bloc, lit (the match: from the casing on the bench to the
// casing of the appliance), a little wider than VIEW.device, the camera already on its way to the appliance; on
// « métal » the wire quivers toward the metal (no contact: act 3 shows it); on « regarde » the camera pushes in.
// Neither the clock (main.js holds it on the bench) nor `faults` (1) is touched here.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, MOUNT, BENCHAT, SYSTEM, FAULT, CPI, CAPS } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [MX, MY, MZ] = MOUNT;
const [CX, CY, CZ] = SYSTEM.centre;
const [FX, FY, FZ] = FAULT;

/* ── in the bloc ── */
// « Alors… » : the cabinet through the back wall, the system in it, held still (a breath closer at the end)
const SYS0 = { ...VIEW.system, drift: 0.15 };
const SYS1 = { ...SYS0, d: 326 };
// the threshold: the appliance, a little wider than VIEW.device, then on its way in
const DEV_W = { ...VIEW.device, d: 330, shift: 90, drift: 0.3 };
const DEV_M = { ...VIEW.device, d: 270, shift: 104 };
const DEV_IN = { ...VIEW.device, d: 205, shift: 112 };

/* ── on the bench (the root at BENCHAT; once opened, the rail +56, the coils +27 — model.js OPEN) ── */
const EXP = { ...P, ...VIEW.exploded };
// the transformer, whole, in the exploded view: its U, its two windings lifted, its yoke above
const XFO_W = { ...P, tx: -16, ty: 52, tz: 0, d: 300, az: -30, el: 12, shift: 0 };
// the two windings close (they are lifted 27 cm in the exploded view)
const COILS = { ...P, ...VIEW.xfo };
// the mains cable coming in from the left to the primary
const MAINS_X = { ...P, tx: -34, ty: 28, tz: 0, d: 260, az: -32, el: 12, shift: 120 };
// the secondary, close (the right leg)
const SEC_X = { ...P, tx: -4, ty: 50, tz: 0, d: 210, az: -28, el: 12, shift: 20 };
// the circuit whole: the secondary, its two conductors up to the rail, out to the casings, the earth bar below
// down to the earth bar: the casings, their protective conductors on the bar, the circuit's conductors above it
const TERRE_X = { ...P, tx: 32, ty: 20, tz: 0, d: 300, az: -26, el: 16, shift: 100 };
// assembled: the casings, the earth bar, the marks — the fault path
// (VIEW.path set lower: the earth bar above the captions, casing A under the top slot)
const PATH = { ...P, ...VIEW.path, ty: 25, d: 280, shift: 80 };
// on « voit »: a little wider and lower, the ghost differential on the rail out of the top slot
const PATH2 = { ...PATH, ty: 32, d: 320, az: -22, shift: 60 };
// « ton différentiel le voit »: up to the rail, the ghost differential lit, the loop still running below it
const GHOST_X = { ...P, tx: 34, ty: 44, tz: 4, d: 230, az: -24, el: 12, shift: 60 };
// the three small marks between the conductors' run and the earth bar
const MARKS = { ...P, tx: 42, ty: CAPS.y0 + 0.5 * (CAPS.y1 - CAPS.y0), tz: 4, d: 150, az: -22, el: 12, shift: 30 };
// the monitor on its rail, close: its gauge, its LED
// (not closer: the veille pulses in the rows above it would zebra the frame)
const CPI_X = { ...P, tx: CPI.at[0] - 2, ty: CPI.at[1] - 4, tz: CPI.at[2] + 2, d: 150, az: -22, el: 20, shift: 20 };
const CPI_Y = { ...CPI_X, d: 134 };

// the light: what it stands around, and how wide
const L = (x, y, z, s) => ({ fx: x, fy: y, fz: z, fs: s });
const L_CAB = L(MX + CX, MY + CY, MZ, 120);
const L_WHOLE = L(CX, BENCHAT[1] + CY, CZ, SYSTEM.size);
const L_EXP = L(8, 58, 0, 62);
const L_XFO = L(-16, 50, 0, 34);
const L_MAINS = L(-36, 36, 0, 30);
const L_PATH = L(46, 30, 2, 40);
const L_MARKS = L(42, 30, 4, 28);
const L_CPI = L(CPI.at[0], CPI.at[1], CPI.at[2], 25);
const L_DEV = L(FX, FY, FZ, 60);
const LIT0 = { litXfo: 0, litPrim: 0, litSec: 0, litEarth: 0, litCpi: 0 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    xfo: "xfo", xfoW: "eclate:transformateur", enroul: "enroul", touchent: "touchent",
    reseau: "reseau", autre: "autre", circuit: "circuit", terre1: "terre1", eclateEnd: "eclate$",
    torepos: "torepos", fuit: "fuit", terre2: "terre2", voit: "voit",
    ici3: "ici3", minuscule: "minuscule", presque: "presque",
    boitier: "boitier", veille: "repos:veille", controleur: "controleur", isolement: "isolement", reposEnd: "repos$",
    toseuil: "toseuil", seuil: "seuil", metal2: "metal2", regarde: "regarde", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── « Alors… » — the cabinet in the dark, the one light left; still ───────────── */
  // the what-if is still on (act 1's dark), but nothing moves any more: no veil, the cabinet alone
  cut(t.tosystem, SET.BLOC, SYS0, {
    ...STAGED, dark: 1, lamp: 0, vent: 0, work: 0, cabinet: 1, fault: 0, gel: 0, ...L_CAB,
  });
  shot(t.tosystem + 0.02, t.tobench - t.tosystem - 0.02, SYS1, "sine.inOut");

  /* ───────────── « …on l'ouvre. » — the same system on the bench, at the same place; on « on » it comes apart ───────────── */
  const origin = [MX - BENCHAT[0], MY - BENCHAT[1], MZ - BENCHAT[2]];
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: SYS1, origin, state: { ...BENCHED, cpi: 0.3, ...L_WHOLE } });
  st(t.explode, 0.95, { explode: 1 }, "power2.out");
  shot(t.tobench + 0.03, t.xfo - 0.12 - (t.tobench + 0.03), EXP, "sine.inOut", bench.d);
  st(t.explode, 1.0, L_EXP, "sine.inOut");

  /* ───────────── « Un transformateur d'isolement. » — it lights; the camera closes on it ───────────── */
  shot(t.xfo - 0.12, t.enroul - 0.12 - (t.xfo - 0.12), XFO_W, "sine.inOut", EXP.d);
  st(t.xfo - 0.12, 0.9, L_XFO, "sine.inOut");
  st(t.xfo + 0.02, 0.3, { litXfo: 1 }, "sine.out");
  const cXfo = co.add({ title: "Transformateur d'isolement", x: 910, y: 560, align: "end", tone: "system", anchor: A.xfo });
  cXfo.show(tl, t.xfoW);
  cXfo.hide(tl, t.enroul - 0.15);

  /* ───────────── « Deux enroulements, qui ne se touchent pas. » — close on them; on « touchent » they draw apart ───────────── */
  st(t.enroul - 0.1, 0.35, { litXfo: 0, litPrim: 0.6, litSec: 0.6 }, "sine.inOut");
  shot(t.enroul - 0.12, t.reseau - 0.14 - (t.enroul - 0.12), COILS, "sine.inOut", XFO_W.d);
  st(t.touchent + 0.08, 0.55, { apart: 1 }, "power2.inOut");
  const cCoils = co.add({ title: "Deux enroulements", x: 910, y: 560, align: "end", tone: "system", anchor: A.secondary });
  cCoils.show(tl, t.enroul + 0.05);
  cCoils.hide(tl, t.reseau - 0.45); // gone before the cut

  /* ───────────── « D'un côté, le réseau. » — the primary and the mains cable on the left ───────────── */
  st(t.reseau - 0.1, 0.3, { litSec: 0, litPrim: 1 }, "sine.inOut");
  // a clean cut, a few frames before the word (a short move here was the film's most jerky one), then a slow drift
  cut(t.reseau - 0.12, SET.BENCH, MAINS_X, L_MAINS);
  shot(t.reseau - 0.1, t.autre - 0.08 - (t.reseau - 0.1), { ...MAINS_X, d: 248 }, "sine.inOut");
  const cMains = co.add({ title: "Réseau", x: 170, y: 560, align: "start", tone: "system", anchor: A.mains });
  cMains.show(tl, t.reseau + 0.06);
  cMains.hide(tl, t.autre - 0.4); // gone before the cut

  /* ───────────── « De l'autre… un circuit dont aucun fil n'est relié à la terre. » ───────────── */
  // the secondary on the right lights; the camera goes down from it along its conductors to the casings; on « terre »
  // the earth bar lights — the two conductors do not touch it, the casings' protective conductors do
  st(t.autre - 0.06, 0.3, { litPrim: 0, litSec: 1 }, "sine.inOut");
  // « De l'autre… » : a cut to the other side, then ONE slow move from the secondary down to the earth bar,
  // the whole sentence long (two short moves through the rail were jerky)
  cut(t.autre - 0.06, SET.BENCH, SEC_X, L_XFO);
  const down = t.circuit - 0.05;
  const cCirc = co.add({ title: "Circuit", x: 910, y: 520, align: "end", tone: "system", anchor: A.caseA });
  cCirc.show(tl, t.circuit + 0.06);
  cCirc.hide(tl, t.terre1 - 0.12);
  st(t.terre1 + 0.06, 0.3, { litEarth: 1 }, "sine.out");
  shot(down, t.terre1 + 0.25 - down, TERRE_X, "sine.inOut", SEC_X.d);
  st(down, 1.6, L(30, 16, 2, 40), "sine.inOut");
  const cEarth = co.add({ title: "Terre", x: 170, y: 640, align: "start", tone: "system", anchor: A.earth });
  cEarth.show(tl, t.terre1 + 0.06);
  cEarth.hide(tl, t.torepos - 0.05);

  /* ───────────── « Chez toi, le courant qui fuit repart par la terre : ton différentiel le voit. » ───────────── */
  // the system closes again while the camera goes to the fault path; the bench says « home »
  st(t.torepos, 1.05, { explode: 0, apart: 0, ...LIT0 }, "sine.inOut");
  shot(t.torepos, t.fuit - 0.05 - t.torepos, PATH, "sine.inOut", TERRE_X.d);
  st(t.torepos, 1.1, L_PATH, "sine.inOut");
  st(t.torepos + 0.2, 0.5, { home: 1 }, "sine.inOut");
  st(t.fuit + 0.04, 0.22, { fault: 1 }, "power2.out");
  st(t.fuit + 0.1, 0.6, { leak: 1 }, "sine.out");
  chip("chip-retour", null, 96, 470, t.fuit - 0.1, t.voit - 0.15); // gone before the ghost lights (it stands under the top slot)
  shot(t.fuit - 0.05, t.voit - 0.3 - (t.fuit - 0.05), PATH2, "sine.inOut");
  shot(t.voit - 0.35, t.ici3 + 0.3 - (t.voit - 0.35), GHOST_X, "sine.inOut", PATH2.d);
  st(t.voit + 0.04, 0.3, { ddr: 1 }, "sine.out");

  /* ───────────── « Ici, le chemin de retour est minuscule : il ne passe presque rien. » ───────────── */
  // the link and the ghost dissolve, the loop breaks: only a trickle through the three marks; closer on them
  st(t.ici3 + 0.04, 0.45, { home: 0, ddr: 0 }, "sine.inOut");
  shot(t.minuscule - 0.1, t.boitier - 0.1 - (t.minuscule - 0.1), MARKS, "sine.inOut", GHOST_X.d);
  st(t.minuscule - 0.1, 0.9, L_MARKS, "sine.inOut");
  chip("chip-ici", null, 96, 470, t.presque - 0.2, t.boitier - 0.2);

  /* ───────────── « Et un boîtier veille : le contrôleur permanent d'isolement. » ───────────── */
  // shown at rest: no fault; up to the rail; on « veille » its pulses leave into the two conductors
  // (the ink current dims while the camera is close on the rail: its dashes would zebra the monitor's veille pulses)
  st(t.boitier, 0.4, { fault: 0, leak: 0 }, "sine.inOut");
  st(t.boitier - 0.1, 0.8, { current: 0.35 }, "sine.inOut");
  cut(t.boitier - 0.12, SET.BENCH, CPI_X, L_CPI); // a clean cut on « boîtier » (the short climb from the marks was jerky)
  st(t.veille - 0.02, 0.35, { cpi: 1, litCpi: 1 }, "sine.out");
  shot(t.boitier - 0.1, t.toseuil - (t.boitier - 0.1), CPI_Y, "sine.inOut");
  const cCpi = co.add({ title: "Contrôleur permanent d'isolement", x: 910, y: 520, align: "end", tone: "system", anchor: A.cpi });
  cCpi.show(tl, t.controleur + 0.02);
  cCpi.hide(tl, t.toseuil - 0.14);

  /* ───────────── the threshold — « Abonne-toi : ce fil sur le métal… regarde ce qu'il déclenche. » ───────────── */
  // The film does not stop: a cut back to the bloc, lit (from the casing on the bench to the appliance's casing),
  // the camera already on its way to the appliance; on « métal » the wire quivers; on « regarde » it pushes in.
  cut(t.toseuil, SET.BLOC, DEV_W, { ...STAGED, ...L_DEV });
  shot(t.toseuil + 0.02, t.regarde - (t.toseuil + 0.02), DEV_M, "sine.inOut");
  st(t.metal2 + 0.06, 0.35, { fault: 0.25 }, "sine.out");
  shot(t.regarde, t.tozero - t.regarde, DEV_IN, "sine.inOut", DEV_M.d);
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
