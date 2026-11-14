// CR04 — acte1.js · 01 L'HEURE — accroche → seuil (0 → tot1). Starts from POSE0 and FIRST (no cut); hands over at `tot1`: the
// whole train on its slope, the two arrows up, the column shown empty with its « 66 t » line (acte2 cuts and resets all of it).
//   accroche  POSE0 (low along the left flank, the rail running down to the town's lights): the parked train starts rolling on its
//             own from frame 1 (≈ 1 mph), the camera rides with it a little slower (the wheel creeps ahead in the frame);
//             « démarre »: punch, the couplers behind begin to stretch. Cut before « Ses »: the hand brake wheel, still rolling (the
//             camera rides with the locomotive, the ground slides behind), red, its chain taut
//   promesse  cut before « 59 »: the lead parked, engine running, low front-left three-quarter; « coupé »: the engine stops, the
//             smoke dies, the fuel cut-off is thrown (punch « locomotive »); « Alors »: the camera swings to the left flank: BOTH
//             CAMPS on one locomotive, the cylinder low, the hand brake wheel above; #mano in (60 psi); « l'air » the air side lights
//             green, « freins » the camera rises to the hand brake wheel — the question stays open
//   principe  cut to the lead alone, opened (solo, cutaway): ONE move along the machine — « serrent » the cylinder fills (psi 0 →
//             70, the piston pushes the shoe on the wheel), « compresseur » it starts turning, green; « Coupe » it slows and stops;
//             « fuit » the puffs, the air side red, the rod creeps back; the camera rises along the hood to the hand brake wheel:
//             « tient » it turns in, the chain pulls straight; « assez »: a quick pull-back, one small wheel on the long locomotive
//   seuil     cut: the whole train on its slope; « dix mille » the red arrow down the slope, « il faut » the green one up it and
//             #colonne empty, « soixante-six » its 66 t line (punch); « Retiens » it pulses, the camera slides toward the head
import { FIRST, VIEW, STAGED, SET, POSE0, onLoco, lit, lookFrom } from "./world.js";
import { PSI, PARTS, CULPRIT } from "./plan.js";
import { moved } from "@kit/direct.js";

const V = 2.2; // the departure: run per second (retouche: 1.4 read still on the first half-second — the wheel turns ≈ 50°/s)
const runAt = (time) => V * time;
const S0 = { run: 0, slack: 0 };
const L = (local) => onLoco(0, S0, local); // a point of the lead, parked
const LR = (time, local) => onLoco(0, { run: runAt(time), slack: 0 }, local); // …of the lead rolling away (accroche)

export default function acte1({ D }) {
  const { st, cut, path, punch } = D;
  const t = D.times({
    choc: "choc", ses: "accroche:Ses", serres0: "serres0", promesse: "promesse", recule: "recule", coupe0: "promesse:coupé",
    loco0: "locomotive0", alors: "promesse:Alors", campair: "campair", campmain: "campmain",
    toprincipe: "toprincipe", les: "principe:Les", serrent: "principe:serrent", recharge: "principe:rechargé",
    compresseur: "compresseur0", coupe: "coupe", fuit: "fuit0", doucement: "principe:doucement", tient: "tient", assez: "assez",
    toseuil: "toseuil", dixmille: "dixmille", il: "seuil:il", soixantesix: "soixantesix", retiens: "retiens", tot1: "tot1",
  });
  D.captionStyle({ hit: 0.25 });

  const c1 = t.ses - 0.14; // cut: the hand brake wheel (raccord: the same locomotive, higher)
  const c2 = t.promesse - 0.12; // cut: 59 minutes earlier, the lead parked, engine running
  const c3 = t.toprincipe; // cut: the lead alone, opened
  const c4 = t.toseuil; // cut: the train on its slope

  /* ── « 0 h 58. Ton train garé démarre. » — POSE0 / FIRST: the wheel turns from frame 1, the light rides on it ── */
  st(0, c2, { run: runAt(c2) }, "none");
  st(t.choc - 0.4, 0.8, { slack: 0.04 }, "sine.inOut");
  st(0, c1, { ...lit(LR(c1, PARTS.wheel), 14) }, "none");
  // the camera follows the train at 30 % of its speed: the wheel moves ahead in the frame from frame 1, the rail slides under it
  const ride = (time, o = {}) => ({ ...moved(POSE0, L([0, 0, 0]), onLoco(0, { run: 0.3 * runAt(time) }, [0, 0, 0])), ...o });
  path([
    [0, POSE0],
    [t.choc, ride(t.choc, { d: POSE0.d * 1.02 })],
    [c1, ride(c1, { d: POSE0.d * 1.04 })],
  ]);
  punch(t.choc, 0.06, { hold: 0.12, down: 0.3 }); // let go before the cut on « Ses »

  /* ── « Ses freins à main sont serrés. » — the hand brake wheel, still rolling: the camera rides with the locomotive ── */
  // the wheel ≈ 400 px wide, its centre at y ≈ 700 (under the header, above the captions); the chain runs down out of the frame
  const VOL = (time, o = {}) => lookFrom(LR(time, [-15, 18, 28]), LR(time, [-27.5, 12.6, 7]), { fov: 30, shift: 230, dof: VIEW.volant.dof, ...o });
  cut(c1, null, VOL(c1), { ...lit(LR(c1, [-27.5, 12, 7]), 18) });
  st(c1, c2 - c1, { ...lit(LR(c2, [-27.5, 12, 7]), 18) }, "none");
  path([
    [c1, VOL(c1)],
    [t.serres0, { ...VOL(t.serres0), d: VOL(t.serres0).d * 0.95, az: VOL(t.serres0).az + 4 }],
    [c2, { ...VOL(c2), d: VOL(c2).d * 0.9, az: VOL(c2).az + 8 }],
  ]);

  /* ── « 59 minutes plus tôt, on a coupé sa locomotive. » — the lead parked, engine running (23:58) ── */
  const CH = { ...VIEW.cheminee, d: VIEW.cheminee.d * 1.3 };
  cut(c2, SET.PENTE, CH, {
    ...FIRST, ...STAGED.tete, run: 0, slack: 0, engine: 1, smoke: 0.5, cutoff: 0, psi: PSI.held, brakes: 7, culprit: 0, fault: 0,
    ok: 0, leak: 0, auto: 0, mano: 0, col: 0, mark: 0,
  });
  st(t.coupe0, 0.2, { cutoff: 1 }, "power2.out");
  st(t.coupe0, 0.9, { engine: 0 }, "power2.out");
  st(t.coupe0, 1.3, { smoke: 0 }, "power1.out");
  punch(t.loco0, 0.06);

  /* ── « Alors, qui le tenait : l'air… ou ses freins à main ? » — the two camps on one locomotive ── */
  // both camps in one frame (≈ 70 px per unit): the hand brake wheel high, the cylinder and its pipe low, both above the captions
  const CAMP = (camY, aimY, o = {}) => lookFrom(L([-50, camY, 64]), L([-32, aimY, 6]), { fov: 30, shift: 220, ...o });
  path([
    [c2, CH],
    [t.coupe0, { ...CH, d: CH.d * 0.95, az: CH.az + 4 }],
    [t.alors, lookFrom(L([-66, 10, 46]), L([-28, 11, 3]), { fov: 30, shift: 30 })],
    [t.campair, CAMP(8, 8.2)], // low: the cylinder and its pipe
    [t.campmain, CAMP(13, 9.2)], // up: the hand brake wheel above it
    [c3, CAMP(15, 9.2, { d: 60 })],
  ]);
  st(t.campair - 0.15, 0.35, { mano: 1 }, "power2.out"); // on « l'air », once the 5017 has left its corner (retouche)
  st(t.campair, 0.3, { ok: 0.6 }, "power2.out");
  st(c3 - 0.3, 0.25, { mano: 0 }, "power2.in");

  /* ── « D'abord, comment ça marche. Les freins d'une locomotive serrent avec de l'air, rechargé par un compresseur. » ── */
  // retouche: the opening looks down into the opened hood from above (VIEW.coupe framed the closed flank, the lit ground an
  // ochre flat at 12.6), the light on the hood; then a clean cut to the cylinder before « serrent » (the swing was 87 °/s)
  const OPEN = lookFrom(L([0, 34, 46]), L([-24, 10, 0]), { fov: 30, shift: 150, dof: 0 });
  cut(c3, SET.PENTE, OPEN, {
    ...FIRST, ...STAGED.tete, ...lit(L([-24, 10, 0]), 40), run: 0, slack: 0, solo: 1, cutaway: 1, engine: 0, smoke: 0, ok: 0, psi: 0,
    brakes: 0, culprit: 0, fault: 0, leak: 0, cutoff: 0, auto: 0, mano: 0, col: 0, mark: 0,
  });
  // retouche: the one move along the machine jerked at 15.5 / 18.3 / 20.2 / 23.0 — now four shots joined by clean cuts, each
  // set a few frames before its word, each with a slow push: the cylinder (serrent), the compressor (rechargé), the fittings
  // (fuit), the hand brake wheel (Le frein à main), then a slow pull-back (assez) up to the cut on the slope
  const CYL = lookFrom(L([-24, 7, 30]), L([-40, 3.8, 4.5]), { fov: 30, shift: 150, dof: VIEW.cylindre.dof }); // cylinder, piston, shoe, wheel
  const COMP = lookFrom(L([-6, 26, 24]), L([-22, 11, 0]), { fov: 30, shift: 220, dof: VIEW.compresseur.dof });
  const FLANK = lookFrom(L([-12, 12, 50]), L([-33, 6, 6.5]), { fov: 30, shift: 140 }); // the cylinder and the fittings
  const VOLp = lookFrom(L([-15, 18, 28]), L([-27.5, 12.6, 7]), { fov: 30, shift: 230, dof: VIEW.volant.dof });
  const kComp = t.recharge - 0.12; // cut: the compressor, before « rechargé »
  const kFlank = t.fuit - 0.5; // cut: the fittings, in the breath after « moteur… »
  const kVol = t.tient - 1.15; // cut: the hand brake wheel, before « Le frein à main »
  const kCyl = t.serrent - 0.12; // cut: the cylinder, before « serrent »
  path([
    [c3, OPEN],
    [kCyl, { ...OPEN, d: OPEN.d * 0.9, az: OPEN.az - 4 }],
  ]);
  cut(kCyl, null, CYL);
  path([
    [kCyl, CYL],
    [kComp, { ...CYL, d: CYL.d * 0.95, az: CYL.az + 3 }],
  ]);
  cut(kComp, null, COMP);
  path([
    [kComp, COMP],
    [kFlank, { ...COMP, d: COMP.d * 0.92, az: COMP.az - 5 }],
  ]);
  cut(kFlank, null, FLANK);
  path([
    [kFlank, FLANK],
    [kVol, { ...FLANK, d: FLANK.d * 0.9, az: FLANK.az + 5 }],
  ]);
  cut(kVol, null, VOLp);
  path([
    [kVol, VOLp],
    [t.tient + 0.6, { ...VOLp, d: VOLp.d * 0.95, az: VOLp.az + 3 }],
    [c4, { ...VOLp, d: VOLp.d * 1.7, el: VOLp.el + 5, az: VOLp.az - 3, dof: 0 }],
  ]);
  // the light rides along: the cylinder, then snaps with each cut (the compressor, the flank, the wheel), then the locomotive
  st(kCyl, 0.05, { ...lit(L([-39, 4, 5]), 22) }, "none");
  st(kComp, 0.05, { ...lit(L([-22, 11, 0]), 26) }, "none");
  st(kFlank, 0.05, { ...lit(L([-30, 6, 6]), 40) }, "none");
  st(kVol, 0.05, { ...lit(L([-27.5, 12, 7]), 20) }, "none");
  st(t.assez - 0.15, c4 - t.assez + 0.1, { ...lit(L([-20, 9, 0]), 70) }, "sine.in");
  // « serrent »: the cylinder fills, the piston pushes the shoe on the wheel; the air lights green
  st(t.serrent, 0.55, { psi: PSI.full }, "power2.out");
  st(t.serrent, 0.4, { ok: 0.7 }, "power2.out");
  // « rechargé par un compresseur »: the engine starts, the compressor turns, bright green
  st(t.recharge, 0.6, { engine: 1 }, "power2.out");
  st(t.compresseur, 0.3, { ok: 1 }, "power2.out");
  // « Coupe le moteur… »: it slows and stops
  st(t.coupe, 1.0, { engine: 0 }, "power2.out");
  // « …et l'air fuit, doucement. »: the puffs, the air side red, the pressure creeps down
  st(t.fuit, 0.3, { leak: 1, culprit: CULPRIT.air, fault: 1, ok: 0 }, "power2.out");
  st(t.fuit, t.tient - t.fuit - 0.6, { psi: 62 }, "sine.inOut");
  // « Le frein à main, lui, tient sans air. »: the red leaves, the wheel turns in, the chain pulls straight
  st(t.tient - 1.0, 0.3, { fault: 0, leak: 0.3 }, "power2.in");
  st(t.tient - 0.7, 0.05, { culprit: 0 }, "none");
  st(t.tient, 1.1, { brakes: 1 }, "sine.inOut");
  // « S'il y en a assez. »: the quick pull-back (path above); punch, let go before the cut
  punch(t.assez, 0.06, { hold: 0.12, down: 0.3 });

  /* ── « Pour tenir ce train de dix mille tonnes sur sa pente, il faut l'équivalent d'environ 66 tonnes de freinage. » ── */
  const PE = VIEW.pente;
  cut(c4, SET.PENTE, PE, {
    ...FIRST, ...lit(L([2400, 10, 0]), 2400), run: 0, slack: 0, solo: 0, cutaway: 0, engine: 0, smoke: 0, ok: 0, psi: 0, brakes: 0,
    culprit: 0, fault: 0, leak: 0, cutoff: 1, auto: 0, mano: 0, col: 0, mark: 0, pull: 0, hold: 0,
  });
  // the convoi journal's pose shows both arrows (red down-left toward the head, green up the slope): the move stays close to it,
  // a slow push and a few degrees — at az + 6 and more the green arrow left the frame (board p4, 27.5 s)
  path([
    [c4, PE],
    [t.il, { d: PE.d * 0.97, el: PE.el + 1 }],
    [t.retiens, { d: PE.d * 0.94, az: PE.az + 2.5 }],
    [t.tot1, { d: PE.d * 0.92, az: PE.az + 4 }],
  ]);
  st(t.dixmille, 0.8, { pull: 1 }, "power2.out");
  st(t.il, 0.8, { hold: 1 }, "power2.out");
  st(t.il + 0.1, 0.3, { col: 1 }, "power2.out");
  st(t.soixantesix, 0.25, { mark: 1 }, "power2.out");
  punch(t.soixantesix, 0.06);
  // « Retiens ce chiffre. »: the line pulses once
  st(t.retiens, 0.15, { mark: 0.3 }, "power2.in");
  st(t.retiens + 0.15, 0.35, { mark: 1 }, "power2.out");
}
