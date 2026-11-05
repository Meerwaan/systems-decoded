// 02 · AUTOPSIE — « Alors… on l'ouvre. » and the exploded view (tobench → toprincipe).
//
// Act 1 pulls back from the valves to the forward half of the boat (VIEW.system), in the sea. In the breath after
// « Alors… » the sea goes black and the same boat stands on the bench, IN PLACE, intact (the bench shows the system as
// it is built): the cut matches on it. On « l'ouvre » it comes apart — the bow forward, the upper tiles and the sail
// off, the tanks apart — and the camera pulls back with it, by ratio, to the air's path climbing the frame.
// « Au départ, des bouteilles d'air comprimé » dives onto the bank (it glows). « Une commande ouvre leurs vannes » :
// one frame holds the command and the valves — the command is thrown on its word, the valves turn on theirs.
// « L'air file vers les ballasts » : the green front runs down the forward pipe and the camera follows it to the
// forward tanks. « des réservoirs autour de la coque… » : the tanks glow and close back AROUND the hull (the exploded
// view folds up), the pressure hull lights on « coque ». « pleins d'eau » : the forward port tank alone, its window
// full of dark water — the heart. Act 2b cuts from there to the same tank, in the water.
// Hands over: the bench, the forward port tank (TANKP), heart 1, explode 0, cmd 1, valves 1, flowF 1, airF 0, mood 0.
import * as THREE from "three";
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, BENCHED, MBT, BANK, VALVE, CMD, SYSTEM } from "./world.js";

const TANKF = [(MBT.fwd.x0 + MBT.fwd.x1) / 2, 0, 300];
const [CX, CY, CZ] = SYSTEM.centre;

/* ── the poses (seen on planches: .cache/planches/038/acte2/) ── */
const P = { fov: 32, side: 0, roll: 0, drift: 0.3, dof: 0 };
// act 1's last pose: the cut to the bench keeps it
const SYS = VIEW.system;
// the exploded view: the two forward tanks apart (upper left), the pipe, the bank (lower right) — the air's path climbs
const EXPL = { ...VIEW.exploded, d: 11000, shift: 0 };
// the bank of bottles, the valves at its head
const BANKW = { ...P, tx: BANK.x - 300, ty: -250, tz: 0, d: 2600, az: 60, el: 24, shift: 0 };
// ONE frame for « Une commande ouvre leurs vannes » : the command (up, in the control room) and the valves (down)
const CV = { ...P, tx: (CMD.at[0] + VALVE.x) / 2, ty: (CMD.at[1] + VALVE.y) / 2, tz: -100, d: 3000, az: 60, el: 12, shift: 200 };
// …closing on the valves as they turn
const VALVEP = { ...P, tx: VALVE.x, ty: VALVE.y, tz: 0, d: 900, az: 60, el: 22, shift: 0 };
// the forward tanks, apart, and the pipe that reaches them (the green front arrives)
const FWD = { ...P, tx: TANKF[0] + 200, ty: -200, tz: 300, d: 5000, az: 50, el: 26, shift: 0 };
// the tanks closing back around the hull
const AROUND = { ...P, tx: TANKF[0] + 100, ty: -100, tz: 300, d: 4800, az: 42, el: 22, shift: 0 };
// THE HEART: the forward port tank alone, full of dark water (act 2b cuts to the same tank in the water, d 5000)
const TANKP = { ...P, tx: TANKF[0], ty: TANKF[1], tz: TANKF[2], d: 4500, az: 30, el: 16, shift: 60 };

/* ── the light: what it stands around, and how wide ── */
const L_SYS = { fx: CX, fy: CY, fz: CZ, fs: 1300 };
const L_EXPL = { fx: -2600, fy: -150, fz: 0, fs: 1700 };
const L_BANK = { fx: BANK.x - 300, fy: BANK.y, fz: 0, fs: 600 };
const L_CV = { fx: CV.tx, fy: CV.ty, fz: CV.tz, fs: 600 };
const L_VALVE = { fx: VALVE.x, fy: VALVE.y, fz: 0, fs: 300 };
const L_FWD = { fx: TANKF[0], fy: -150, fz: 300, fs: 900 };
const L_TANK = { fx: TANKF[0], fy: TANKF[1], fz: TANKF[2], fs: 600 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.sub.A;
  const t = D.times({
    tobench: "tobench", explode: "explode", au: "eclate:au", bouteilles: "bouteilles", une: "eclate:une",
    commande: "commande", vannes: "vannes", air: "air2", ballasts: "ballasts1", reservoirs: "reservoirs",
    coque: "coque", pleins: "pleins", eau: "eau1", toprincipe: "toprincipe",
  });
  setAct(tl, 2, t.tobench);

  /* ───────────── (breath) — the same boat, the same pose: on the bench, intact ───────────── */
  cut(t.tobench, SET.BENCH, SYS, {
    ...BENCHED, depth: 160, gap: 0, crush: 0, cmd: 0, valves: 0, bank: 1, flowF: 0, flowA: 0, airF: 0, airA: 0, ...L_SYS,
  });

  /* ───────────── « …on l'ouvre. » — it comes apart; the camera pulls back with it ───────────── */
  st(t.explode, 1.2, { explode: 1 }, "power2.out");
  st(t.explode, 0.8, { hull: 0.2, inner: 0.2 }, "sine.inOut");
  // retouche: the pull-back leaves at speed right after the cut (1 s, not 1.35 s eased in) — the whole system is in
  // frame from ≈ 21.4, then held, drifting in a little, until the cut to the bank (≥ 1.5 s)
  shot(t.tobench + 0.03, 1.0, EXPL, "power2.out", SYS.d);
  st(t.tobench + 0.03, 1.0, L_EXPL, "power2.out");
  const toBank = t.bouteilles - 0.12; // the cut to the bank: a few frames before its word
  shot(t.tobench + 1.03, toBank - (t.tobench + 1.03), { ...EXPL, d: 10400 }, "sine.inOut", EXPL.d);

  /* ───────────── « Au départ, des bouteilles d'air comprimé. » — a cut onto the bank (lower right of the exploded view) ───────────── */
  cut(toBank, null, BANKW, { ...L_BANK });
  shot(toBank, t.une - 0.4 - toBank, { ...BANKW, d: 2250 }, "sine.inOut", BANKW.d);
  st(t.bouteilles - 0.05, 0.4, { litBank: 1 }, "sine.out");
  const cBank = co.add({ title: "Bouteilles d'air", x: 150, y: 520, align: "start", tone: "system", anchor: A.bank });
  cBank.show(tl, toBank + 0.02); // its text arrives with the cut, on the word
  cBank.hide(tl, t.une - 0.1);

  /* ───────────── « Une commande ouvre leurs vannes. » — one frame: the command thrown, the valves turn ───────────── */
  const toCv = t.commande - 0.02 - (t.une - 0.4);
  shot(t.une - 0.4, toCv, CV, "sine.inOut", 2250);
  st(t.une - 0.4, toCv, L_CV, "sine.inOut");
  st(t.une, 0.3, { litBank: 0.35 }, "sine.inOut");
  st(t.commande - 0.05, 0.6, { cmd: 1, litCmd: 1 }, "power2.out");
  const cCmd = co.add({ title: "Commande", x: 150, y: 520, align: "start", tone: "system", anchor: A.cmd });
  cCmd.show(tl, t.commande - 0.25);
  cCmd.hide(tl, t.vannes - 0.1);
  const inV = t.vannes + 0.25 - (t.commande + 0.35);
  shot(t.commande - 0.02, 0.37, { ...CV, d: 2800 }, "sine.out", CV.d);
  shot(t.commande + 0.35, inV, VALVEP, "sine.inOut", 2800);
  st(t.commande + 0.35, inV, L_VALVE, "sine.inOut");
  // retouche: the camera goes through the hull's glass to reach the valves (veil at 25.57) — the glass is gone first
  st(t.commande + 0.35, 0.25, { hull: 0, inner: 0 }, "sine.inOut");
  st(t.vannes - 0.05, 0.5, { valves: 1, litValve: 1 }, "power2.inOut");
  st(t.vannes, 0.5, { litCmd: 0.3 }, "sine.inOut");
  const cValve = co.add({ title: "Vanne", x: 150, y: 520, align: "start", tone: "system", anchor: A.valve });
  cValve.show(tl, t.vannes - 0.1);
  cValve.hide(tl, t.air + 0.1);

  /* ───────────── « L'air file vers les ballasts : » — the green front, followed to the forward tanks ───────────── */
  st(t.air, t.ballasts + 0.3 - t.air, { flowF: 1, litPipe: 1 }, "none");
  st(t.air + 0.3, 0.5, { litValve: 0.3 }, "sine.inOut");
  const follow = t.ballasts + 0.35 - (t.air - 0.1);
  shot(t.air - 0.1, follow, FWD, "sine.inOut", VALVEP.d);
  st(t.air - 0.1, follow, L_FWD, "sine.inOut");
  st(t.air + 0.75, 0.4, { hull: 0.2, inner: 0.2 }, "sine.inOut"); // retouche: the glass back, the camera out again

  /* ───────────── « des réservoirs autour de la coque… » — they glow, and close back around the hull ───────────── */
  const fold = t.coque + 0.2 - (t.reservoirs + 0.1);
  shot(t.ballasts + 0.35, t.pleins - 0.35 - (t.ballasts + 0.35), AROUND, "sine.inOut");
  st(t.reservoirs - 0.05, 0.4, { litTank: 1 }, "sine.out");
  st(t.reservoirs + 0.1, fold, { explode: 0, hull: 0.35, inner: 0.3 }, "sine.inOut");
  st(t.coque - 0.05, 0.4, { litHull: 1 }, "sine.out");
  const hullTag = new THREE.Object3D(); // a point on the pressure hull's port shoulder, just aft of the forward tanks
  hullTag.position.set(-3700, 235, 407);
  world.sub.root.add(hullTag);
  const cHull = co.add({ title: "Coque épaisse", x: 150, y: 520, align: "start", tone: "system", anchor: hullTag });
  cHull.show(tl, t.coque - 0.3);
  cHull.hide(tl, t.pleins - 0.05); // gone before the chip comes into the same place

  /* ───────────── « pleins d'eau. » — the forward port tank alone: the heart ───────────── */
  const close = t.pleins + 0.2 - (t.pleins - 0.35);
  shot(t.pleins - 0.35, close, TANKP, "sine.inOut");
  st(t.pleins - 0.35, close, L_TANK, "sine.inOut");
  st(t.pleins - 0.1, 0.5, { heart: 1, litHull: 0, litPipe: 0.4, litTank: 0.6 }, "sine.inOut");
  shot(t.pleins + 0.2, t.toprincipe - (t.pleins + 0.2), { ...TANKP, d: 4300 }, "sine.inOut", TANKP.d);
  chip("chip-coeur", null, 96, 470, t.pleins + 0.15, t.toprincipe - 0.15);
  D.punch(t.eau, 0.05, { hold: 0.15, down: 0.4 });
}
