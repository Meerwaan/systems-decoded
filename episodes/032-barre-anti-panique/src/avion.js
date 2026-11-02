// DOSSIER 032 — the next file's teaser (« Prochain dossier : la porte d'avion. En plein vol, personne ne peut
// l'ouvrir. ») : L03's cabin, IMPORTED as it is (never modified), seen from inside at door 1L, in cruise: the cabin
// lit, the passengers seated, no smoke, no fire — and a crew member's hand on the door's lever, which does not move.
// No pressure arrow, no tonnage on screen: that is 033's own fall (docs/032-actes.md, « fin.js »).
//
//   buildAvion() → { group, A, update(P, time, px) }
//   A   door   the 1L door's lever pivot (L03 cabine: A.lever) · door: the door panel's middle (for the camera)
//   P   { tug }   0 → 1: the hand on the lever strains (a tremor of a degree): nothing opens
import * as THREE from "three";
import { buildCabine } from "../../L03-evacuation-avion/src/cabine.js";
import { dressCabine } from "../../L03-evacuation-avion/src/habillage.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** The cabin in cruise (L03's FIRST numbers, cabine.js): lit, seated, calm. The crew member stands at 1L
 *  (`crew` 1) with a hand on the arming lever: L03 draws that hand only while the lever is between its two
 *  ends, so the lever is held at mid-travel (`arm` 0.5) — and held there. */
const CRUISE = {
  lights: 1, emerg: 0, smoke: 0, fire: 0, breach: 0, pax: 1, mood: 0,
  layout: 0, floor: 0, glow: 0, signs: 0.25, crowd: 0, you: 0, bag: 0, bins: 0, obstacles: 0, dolls: 0,
  crew: 1, pa: 1, door: 0, arm: 0.5, hatch: 0, wider: 0, panels: 0, extinguisher: 0, cut: 0,
};

export function buildAvion() {
  const group = new THREE.Group();
  group.name = "avion";
  const cabine = buildCabine();
  const dress = dressCabine();
  group.add(cabine.group, dress.group);
  const p = { ...CRUISE };
  const A = { lever: cabine.A.lever, door: cabine.A.lever };
  return {
    group, A,
    update(P, time, px) {
      // the strain: the hand pulls, the lever answers by a hair and comes back — nothing opens
      const tug = clamp01(P.tug ?? 0);
      p.arm = CRUISE.arm + 0.012 * tug * Math.sin(time * 9.5) * Math.sin(time * 2.1);
      cabine.set(p, time, px);
      dress.update({ layout: 0, lights: p.lights, smoke: 0, cut: 0 }, time, px);
    },
  };
}
