// CR01 — Tchernobyl : the world. This file is the contract between the acts:
//   · the four maquettes (plan.js), built once, each at its ORIGIN — only the one `S.set` names is shown
//   · FIRST   the state of the world on the first frame — the CLOSED list of numbers the acts may move
//   · POSE0   the camera of the first frame, and VIEW: the poses the acts start from (provisional: set on stubs)
//   · STAGED  what a cut to each maquette sets (its light) · BENCHED: the corrected rod alone (`depuis`)
//   · apply   what each number does to the world, every frame
// The acts (acte1.js, acte2.js, acte2b.js, acte3.js, fin.js) only write st / shot / cut / tl calls against it.
//
// LA RECONSTITUTION (kit/lib/reconstitution.js): matte clay maquettes, one hard light from −x, the part in fault in red (`fault`),
// no green before `depuis`. Never call blocks.js's setMood: recon.setMood(S.depuis) after stage.focus, every frame.
import * as THREE from "three";
import { setupReconstitution, setOk } from "@kit/reconstitution.js";
import { ORIGIN, CORE, SLICE, PLANT, ROOM } from "./plan.js";
import { buildCoeur } from "./coeur.js";
import { buildCanal } from "./canal.js";
import { buildCentrale } from "./centrale.js";
import { buildSalle } from "./salle.js";

export const SET = { COEUR: 0, CANAL: 1, CENTRALE: 2, SALLE: 3 };
const NAMES = ["coeur", "canal", "centrale", "salle"];
/** ≈ the radius of the subjects: sizes the light, the shadows (createStage scale). */
export const SIZE = 90;

/** The studio options (docs/recette-agents.md). `dof` on the close-ups only (poses that spread CLOSE); `finish` off: clay has no machining. */
export const LOOK = { dof: 6, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };
const CLOSE = { dof: LOOK.dof };
const P = { side: 0, roll: 0, drift: 0.25, dof: 0 };

/** A point of a maquette, in the world: W("canal", [0, 120, 0]). */
export const W = (name, [x, y, z]) => [ORIGIN[name][0] + x, ORIGIN[name][1] + y, ORIGIN[name][2] + z];
const aim = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};

/** What a cut to each maquette sets: which set, and the light around it (fx fy fz: the subject, fs: its size). */
const light = (name, local, fs) => {
  const [fx, fy, fz] = W(name, local);
  return { fx, fy, fz, fs };
};
export const STAGED = {
  coeur: { set: SET.COEUR, ...light("coeur", [0, 80, 0], 110) },
  canal: { set: SET.CANAL, ...light("canal", [0, 120, 0], 120) },
  centrale: { set: SET.CENTRALE, ...light("centrale", [0, 30, 0], 190) },
  salle: { set: SET.SALLE, ...light("salle", [200, 110, 0], 220) },
};
/** `depuis`: the corrected rod alone on its halo (canal.js `solo`), neutrons off. Then `depuis` 0 → 1 heals it (red → green). */
export const BENCHED = { ...STAGED.canal, solo: 1, flux: 0, split: 0, xenon: 0, rep: 0, rod: 0 };

export const FIRST = {
  // which maquette is shown (SET), and the light: what it stands around (fx fy fz) and its size (fs)
  ...STAGED.coeur,
  // la reconstitution: `fault` lights THE part in fault of the shown maquette in red (coeur: the lower half of the stack · canal: the
  // graphite displacer · centrale: the emergency-cooling valve · salle: the AZ-5 button) · `depuis` 0 → 1 the correction (light, red → green)
  fault: 1, depuis: 0,
  // the colour code (05/11): `ok` 0 → 1 lights the system that works in green (the rods, the absorber, the parts not at fault) ·
  // `viol` 0 → 1 the margin violated: the salle's board bars (the rods inside, « 8 contre 15 ») turn red
  ok: 0, viol: 0,
  // the power, low and high halves of the core (coeur and canal), 0 … 1 (1 = « en flèche ») · the rods (coeur, salle's board):
  // `rodsIn` the share of rods inside the core, `scram` the travel of all of them toward the bottom (AZ-5)
  pLow: 0.85, pHigh: 0.3, rodsIn: 0.25, scram: 0.12,
  // the night's end (coeur): tubes burst and steam (blast), the slab lifts (slab), the second explosion (blast2), the graphite burns (fire)
  blast: 0, slab: 0, blast2: 0, fire: 0,
  // the canal: its rod (0 withdrawn → 1 inserted), the vapour in the fuel channels, the neutrons shown, the chain of `principe`,
  // the xenon, the redesigned rod, the rod alone (graphite gone), the French reactor (graphite gone, rod gone)
  rod: 0, steam: 0.3, flux: 0, split: 0, xenon: 0, newRod: 0, solo: 0, rep: 0,
  // the centrale: turbine speed, pump flow, diesels starting, current to the network, current from the generator to the pumps
  spin: 1, flow: 1, diesel: 0, mains: 1, feed: 0,
  // `rotorT` ≥ 0: the turbine's angle as seconds at full speed (∫ spin dt), tweened by the acts across a speed ramp so the render is
  // seek-safe (time × spin spins backwards while spin ramps) · −1: the angle is time × spin (spin constant)
  rotorT: -1,
  // the salle: the AZ-5 press, the protections (1 on → 0 cut), the silhouettes
  az5: 0, prot: 1, crew: 1,
};

/* The camera. Each pose is complete (nothing is inherited across a cut). PROVISIONAL: set on grey stubs (docs/journal/CR01-architecte.md);
   the decor agents give the poses that frame best in their journals. Cameras sit between az −50 and −80: the cut faces and the key. */
const pose = (name, local, o) => ({ ...P, fov: 30, shift: 140, ...aim(name, local), ...o });
export const VIEW = {
  // COEUR — low, under the stack's lower edge, looking up: the rods come down at you, the bottom burns (the first image, candidate a)
  coeurLow: pose("coeur", [0, 80, -10], { d: 275, az: -50, el: -14, fov: 56, shift: 140, side: 160 }), // 05/11 V3: side 160 keeps the core out of TikTok's button column
  // the core whole, three-quarter from above (candidate e; t2, t3, t6)
  coeur: pose("coeur", [0, 85, 0], { d: 700, az: -58, el: 22, shift: 110 }),
  // close on the lower half (t7: « le cœur surchauffe »)
  coeurBottom: pose("coeur", [-6, 58, 0], { d: 260, az: -70, el: 6, ...CLOSE }),
  // wide and higher: the slab's flight and the fire (t8, issue)
  slab: pose("coeur", [10, 195, 0], { d: 900, az: -58, el: 10, shift: 0 }),
  // CANAL — the master shot: the whole slice, three channels, the rod's channel in the middle (defaut; candidate b)
  canal: pose("canal", [0, 125, 0], { d: 1100, az: -62, el: 6, shift: 230 }),
  // close on the bottom of the rod channel: the displacer's foot, the bottom water (defaut, « du bas du cœur »)
  canalLow: pose("canal", [0, 60, 0], { d: 430, az: -66, el: 6, ...CLOSE }),
  // close on the top: the absorber that enters (principe « des barres », defaut « la partie qui freine »)
  canalTop: pose("canal", [0, 195, 0], { d: 430, az: -60, el: 4, ...CLOSE }),
  // close on the left fuel channel: atoms, neutrons, water, vapour (principe, piege)
  fuel: pose("canal", [0, 120, -44], { d: 520, az: -72, el: 4, ...CLOSE }),
  // the rod alone (solo), the corrected piece on its halo (depuis)
  rodSolo: pose("canal", [0, 130, 0], { d: 1050, az: -48, el: 14, shift: 230 }),
  // CENTRALE — the table whole (t1, report)
  centrale: pose("centrale", [-15, 25, 0], { d: 1150, az: -46, el: 32, shift: 170, side: 80 }),
  turbine: pose("centrale", [72, 30, -10], { d: 330, az: -40, el: 50, shift: 30, ...CLOSE }),
  turbineClose: pose("centrale", [66, 30, -10], { d: 240, az: -44, el: 46, shift: 20, ...CLOSE }),
  diesels: pose("centrale", [80, 24, 95], { d: 330, az: -60, el: 22, shift: -40, ...CLOSE }),
  pumps: pose("centrale", [-35, 16, 0], { d: 300, az: -30, el: 34, shift: 110, ...CLOSE }),
  eccs: pose("centrale", [-75, 20, 95], { d: 230, az: -28, el: 22, shift: 130, ...CLOSE }),
  mains: pose("centrale", [60, 40, -125], { d: 360, az: -100, el: 8, shift: 80 }),
  // SALLE — from behind the silhouettes: the desk, the board (t4, t6; candidate d is az5)
  salle: pose("salle", [200, 150, 0], { d: 860, az: -70, el: 10, fov: 34, shift: 20 }),
  az5: pose("salle", [136, 97, -46], { d: 95, az: -62, el: 22, shift: 40, ...CLOSE }),
  board: pose("salle", [330, 185, 0], { d: 820, az: -62, el: 6, shift: 40 }),
  keys: pose("salle", [136, 96, 34], { d: 125, az: -70, el: 34, shift: 40, ...CLOSE }),
};
/** The first frame (candidate a, provisional until the board of four: docs/CR01-actes.md « La première image »). Sharp. */
export const POSE0 = { ...VIEW.coeurLow, drift: 0 };

export function buildWorld(stage) {
  const { scene } = stage;
  const recon = setupReconstitution(stage, { floor: 0 });
  const sets = [buildCoeur(), buildCanal(), buildCentrale(), buildSalle()];
  sets.forEach((s, i) => {
    s.group.position.set(...ORIGIN[NAMES[i]]);
    scene.add(s.group);
  });
  const faultAt = new THREE.Vector3();
  void CORE, SLICE;

  return {
    sets,
    coeur: sets[0], canal: sets[1], centrale: sets[2], salle: sets[3],
    /** Every frame (and several times per frame: it depends on S and `time` only — no allocation). */
    apply(S, time) {
      const px = stage.pixelScale();
      const shown = Math.round(S.set);
      setOk(S.ok ?? 0); // before the sets' update: their setAlarm reads it
      for (let i = 0; i < sets.length; i++) {
        sets[i].group.visible = i === shown;
        if (i === shown) sets[i].update(S, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      // the halo under the part in fault (or under the corrected rod, from `depuis`)
      const set = sets[shown];
      set.A.fault.getWorldPosition(faultAt);
      const heal = shown === SET.CANAL ? S.depuis : 0;
      recon.halo({ at: [faultAt.x, 0, faultAt.z], r: set.haloR ?? 40, amount: 0.5 * Math.max(S.fault, heal), k: heal });
      recon.setMood(S.depuis); // after stage.focus: the light re-aims
      if (scene.fog) scene.fog.density = 0.00015;
    },
  };
}
