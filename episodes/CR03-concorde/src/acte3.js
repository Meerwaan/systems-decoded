// CR03 — acte3.js · 02 LE DÉFAUT — defaut → preuve (todefaut → todepuis): tank 5 in section, the wave, the panel from inside; the proof
// on the runway. docs/CR03-actes.md « acte3.js », docs/CR03-actes-maj.md (vague 2: close-ups on tank 5 rather than the small `bay`).
//   1. the tank in section, ONE move (D.path) from the whole bay down to the impact, up into the kerosene, back to the bay, along the
//      front, and down onto the panel — the hit, the dent, the front, the bulge, the tear are each seen whole, never under a cut:
//      « frappe »: the tyre piece lands on the intrados (dent 0.4), « plein »: the kerosene lights up, « s'enfonce »: dent 1,
//      « repoussé »: the red front sweeps the liquid toward the panel, « cède »: the panel domes (red), « ailleurs »: its rivets jump,
//      it drops and the kerosene gushes out; the red circle round the hole on « l'intérieur ».
//   2. the runway (raccord: the panel that falls → the same panel lying on the asphalt): the panel close, a slow orbit; « bombé »: the
//      camera goes low for its dome; « trace »: high over its smooth face. « Le titane… »: a cut (raccord: one flat piece lying on the
//      asphalt → another, at the same place of the frame) to the strip in the foreground, the tyre piece behind it, the panel far
//      behind, through a long lens; the strip red, the arrow from the strip to the tyre piece (it only touched the tyre); punch
//      « jamais ». « Et ça, personne ne l'avait prévu »: the camera rises and pulls back over the three pieces and the long runway.
// Starts with a complete cut at `todefaut`; hands over at `todepuis` (fin.js cuts to the tank). Never writes the header (main.js).
// No sound written here (journal → « sons »).
import * as THREE from "three";
import { feutre } from "@kit/reconstitution.js";
import { FIRST, STAGED, SET, LOOK, W, lit } from "./world.js";
import { FOUND, STRIP } from "./plan.js";

export default function acte3({ D, world }) {
  const { st, now, cut, path, punch, jolt } = D;
  const t = D.times({
    todefaut: "todefaut", morceau: "defaut:morceau", frappe: "frappe2", derriere: "defaut:Derrière", plein: "defaut:plein",
    liquide: "defaut:liquide", comprime: "comprime", enfonce: "enfonce", trigger: "trigger", cede: "cede", ailleurs: "defaut:ailleurs",
    interieur: "defaut:l'intérieur",
    topreuve: "topreuve", panneau: "panneau", bombe: "bombe", trace: "preuve:trace", le: "preuve:Le", titane: "preuve:titane",
    jamais: "verdict", et: "preuve:Et", personne: "preuve:personne", todepuis: "todepuis",
  });
  const base = { side: 0, roll: 0, drift: 0.25, fov: 30, shift: 40, dof: 0 };
  const CLOSE = { dof: LOOK.dof };

  /* ── 1 · the tank in section (raccord: the red strip → the part it never touched) ── */
  const R = (local, o) => {
    const [tx, ty, tz] = W("reservoir", local);
    return { tx, ty, tz, ...o };
  };
  const T0 = { ...base, ...R([10, 72, 0], { d: 400, az: -66, el: 8 }) };
  cut(t.todefaut, SET.RESERVOIR, T0, {
    ...FIRST, ...STAGED.reservoir, culprit: 0, fault: 0, ok: 0, depuis: 0, gauge: 0, debit: 0, mark: 0,
    hit: 0, dent: 0, wave: 0, bulge: 0, tear: 0, gush: 0, kevlar: 0, kero: 0.5,
  });
  // « Alors ce réservoir ? » on the whole bay (a slow push), then a CUT in the breath before « Le morceau » (retouche 13/11: in the
  // wide shot the flying piece read as three bands and the section as an amber slab): the shock is seen close, the piece comes in
  // from low left onto the intrados
  const CHOC = t.morceau - 0.14; // 99.28, after « réservoir ? », before « Le morceau »
  path([
    [t.todefaut, T0],
    [CHOC - 0.02, { d: 375, az: -63, el: 7 }],
  ]);
  const M0 = { ...base, ...R([-6, 72, -44], { d: 170, az: -50, el: 2, shift: 0, ...CLOSE }) }; // a little wider and left: the piece enters early
  cut(CHOC, null, M0);
  path([
    [CHOC, M0],
    [t.frappe, R([-2, 70, -34], { d: 135, az: -50, el: 2, ...CLOSE })],
    [t.derriere, R([0, 76, -28], { d: 145, az: -56, el: 5 })],
    [t.plein, R([2, 84, -12], { d: 200, az: -64, el: 9, dof: 0 })],
    // « Et un liquide, ça ne se comprime presque pas » (retouche 13/11: the whole bay at d 330 was a thin band): the tank centred,
    // the cuvette at left, the kerosene full height, the panel at right — a slow push
    [t.liquide, R([2, 82, -2], { d: 235, az: -56, el: 7 })],
    [t.comprime + 0.6, R([2, 81, -4], { d: 222, az: -58, el: 6 })],
    [t.enfonce, R([4, 71, -14], { d: 265, az: -56, el: 4 })],
    [t.trigger, R([4, 71, -8], { d: 270, az: -59, el: 4 })],
    [t.cede, R([2, 69, 18], { d: 230, az: -64, el: 2 })],
    [t.interieur, R([-2, 64, 30], { d: 155, az: -68, el: -4, ...CLOSE })],
    [t.topreuve - 0.02, R([-16, 22, 30], { d: 180, az: -73, el: 4 })], // down with the falling panel: it lands, dome up
  ]);
  // « Le morceau de pneu frappe le dessous de l'aile »: it flies in from low left and lands flat on the intrados, the skin gives a little
  // hit < 0.17 until the cut: the piece is still far off the left of the wide frame (z < −104, projected > 100 from its centre)
  st(t.morceau - 0.3, t.frappe - t.morceau + 0.3, { hit: 1 }, "none");
  st(t.frappe - 0.05, 0.1, { dent: 0.4 }, "power2.out");
  punch(t.frappe, 0.06);
  jolt(t.frappe, 0.35, 0.4);
  // « …plein de kérosène »: the liquid lights up
  st(t.plein, 0.5, { kero: 1 }, "sine.inOut");
  // « la paroi s'enfonce »
  st(t.enfonce - 0.04, 0.3, { dent: 1 }, "power2.out");
  punch(t.enfonce, 0.05);
  // « le kérosène est repoussé… »: the front crosses the liquid, from the dent to the panel
  st(t.trigger, t.cede - t.trigger + 0.04, { wave: 1 }, "sine.inOut");
  // « …et la paroi cède »: the panel domes, red; « ailleurs »: its rivets jump, it drops and turns over, the kerosene gushes out
  now(t.cede - 0.02, { culprit: 2 });
  st(t.cede, 0.2, { fault: 1 }, "power2.out");
  st(t.cede, 0.25, { bulge: 1 }, "power2.out");
  punch(t.cede, 0.06);
  st(t.ailleurs, t.topreuve - t.ailleurs - 0.06, { tear: 1 }, "power1.in");
  st(t.ailleurs + 0.12, 0.35, { gush: 1 }, "power2.out");
  feutre(D, { id: "feutre-panneau", anchor: world.reservoir.A.panel, w: 300, h: 190, from: t.ailleurs + 0.3, to: t.topreuve - 0.5, seed: 7 });

  /* ── 2 · the proof on the runway (raccord: the panel that falls → the same panel lying on the asphalt) ── */
  const PANEL = { tx: FOUND.panel[0], ty: 0.3, tz: FOUND.panel[2] };
  const P0 = { ...base, ...PANEL, d: 10, az: -58, el: 30, ...CLOSE };
  const RUNWAY = {
    ...FIRST, alt: -100, run: 0, pitch: 0, bank: 0, n1: 0, n2: 0, n3: 0, n4: 0, fire: 0, leak: 0, surge: 0,
    culprit: 0, fault: 0, ok: 0, depuis: 0, gauge: 0, debit: 0, mark: 0,
    stop: 0, v1: 0, ruler: 0, found: 1, soot: 0, traj: 0, bourget: 0, inspect: 0,
  };
  cut(t.topreuve, SET.PISTE, P0, { ...RUNWAY, ...lit([FOUND.panel[0], 0, FOUND.panel[2]], 40) });
  path([
    [t.topreuve, P0],
    [t.panneau, { az: -44, el: 26, d: 9 }],
    // « bombé vers l'extérieur »: low, its dome in profile (camera ≥ 1.5 above the asphalt)
    [t.bombe, { ty: 0.2, az: -28, el: 12, d: 7.5 }],
    // « sans trace d'impact »: high over its smooth face
    [t.trace, { ty: 0.3, az: -14, el: 50, d: 9.5, shift: 150 }],
    [t.le - 0.14, { az: -6, el: 56, d: 9 }],
  ]);

  // « Le titane n'a jamais touché le réservoir » (raccord: one flat piece lying on the asphalt → another)
  // a long lens from behind the strip, down the runway: the strip lower left, the tyre piece upper right, 56 behind it
  const S = { tx: (STRIP.at[0] + FOUND.chunk[0]) / 2, ty: 0.3, tz: (STRIP.at[2] + FOUND.chunk[2]) / 2 };
  const S0 = { ...base, ...S, d: 228, az: 84, el: 6, fov: 5, shift: 180, side: -40 }; // side: the strip clear of the left crop
  cut(t.le - 0.12, SET.PISTE, S0, { ...RUNWAY, ...lit([S.tx, 0, S.tz], 45) });
  now(t.titane - 0.02, { culprit: 1 });
  st(t.titane, 0.2, { fault: 1 }, "power2.out");
  punch(t.jamais, 0.06);
  const strip = new THREE.Vector3(...W("piste", STRIP.at));
  feutre(D, { id: "feutre-titane", kind: "arrow", anchor: strip, w: 512, h: 558, dx: 296, dy: -309, from: t.titane + 0.15, to: t.et - 0.3, seed: 3 });
  path([
    [t.le - 0.12, S0],
    [t.et - 0.14, { d: 222, az: 84.8, el: 6.3 }],
  ]);
  // « Et ça, personne ne l'avait prévu »: back to the panel (raccord: the pieces on the asphalt → the one that came out of the tank), low,
  // its dome against the runway — what nobody had foreseen: a tank that opens from the inside (fin.js cuts from it to the tank)
  const Q0 = { ...base, ...PANEL, ty: 0.25, d: 9.5, az: 148, el: 13, ...CLOSE };
  cut(t.et - 0.12, SET.PISTE, Q0, { ...RUNWAY, ...lit([FOUND.panel[0], 0, FOUND.panel[2]], 40) });
  path([
    [t.et - 0.12, Q0],
    [t.todepuis - 0.02, { az: 166, el: 15, d: 11 }],
  ]);
}
