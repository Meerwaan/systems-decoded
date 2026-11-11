// CR02 — Deepwater Horizon : the world. This file is the contract between the acts:
//   · the three maquettes (plan.js), built once, each at its ORIGIN — only the one `S.set` names is shown
//   · FIRST   the state of the world on the first frame — the CLOSED list of numbers the acts may move
//   · POSE0   the camera of the first frame, and VIEW: the poses the acts start from (PROVISIONAL: set on grey stubs)
//   · STAGED  what a cut to each maquette sets (which set, its light) · BENCHED: the BOP at the start of `depuis`
//   · apply   what each number does to the world, every frame
// The acts (acte1.js, acte2.js, acte2b.js, acte3.js) only write st / shot / cut / tl calls against it.
//
// LE NOIR CHAUD (kit/lib/reconstitution.js): satin clay maquettes, the studio's softbox and an amber spot, the part in fault in red
// (`culprit` picks it, `fault` lights it), green = what works (`ok` and each decor's own seals), `depuis` 0 → 1 the correction.
// Never call blocks.js's setMood: recon.setMood(S.depuis) after stage.focus, every frame.
import * as THREE from "three";
import { setupReconstitution, setOk } from "@kit/reconstitution.js";
import { ORIGIN } from "./plan.js";
import { buildPlateforme } from "./plateforme.js";
import { buildPuits } from "./puits.js";
import { buildBop } from "./bop.js";

export const SET = { PLATEFORME: 0, PUITS: 1, BOP: 2 };
const NAMES = ["plateforme", "puits", "bop"];
/** ≈ the radius of the subjects: sizes the light, the shadows (createStage scale). */
export const SIZE = 110;

/** The studio options (docs/recette-agents.md). `dof` on the close-ups only (poses that spread CLOSE); `finish` off: clay has no machining. */
export const LOOK = { dof: 6, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };
const CLOSE = { dof: LOOK.dof };
const P = { side: 0, roll: 0, drift: 0.25, dof: 0 };

/** A point of a maquette, in the world: W("bop", [0, 80, 0]). */
export const W = (name, [x, y, z]) => [ORIGIN[name][0] + x, ORIGIN[name][1] + y, ORIGIN[name][2] + z];
const aim = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};
/** The light around a point of a maquette (fx fy fz: the subject, fs: its size). */
export const lit = (name, local, fs) => {
  const [fx, fy, fz] = W(name, local);
  return { fx, fy, fz, fs };
};

/** What a cut to each maquette sets: which set, and the light around it. The acts move fx fy fz fs with the subject. */
export const STAGED = {
  plateforme: { set: SET.PLATEFORME, ...lit("plateforme", [0, 520, 0], 150) },
  puits: { set: SET.PUITS, ...lit("puits", [0, 300, 0], 200) },
  bop: { set: SET.BOP, ...lit("bop", [0, 80, 0], 110) },
};

export const FIRST = {
  // which maquette is shown (SET), and the light: what it stands around (fx fy fz) and its size (fs)
  ...STAGED.plateforme,
  // the part in fault: `culprit` names it (plan.js CULPRIT: puits 1 dial LIGNE · 2 EDS button; bop 1 annular · 2 pipe · 3 battery ·
  // 4 valve · 5 pile; 0 none), `fault` 0 → 1 lights it red · `ok` 0 → 1 the safe system in green (the mud that holds, setOk) ·
  // `depuis` 0 → 1 the correction (light, grid and halo to green; the pipe red → green)
  culprit: 0, fault: 0, ok: 0, depuis: 0,
  // PLATEFORME: the mud jet up the derrick (0 → 1 the crown), the mud over the drill floor, the explosion (a flash with a place),
  // the fire, the sinking (0 afloat → 1 under), the rig's lamps (1 on → 0 out)
  jet: 0.6, spill: 0.2, blast: 0, fire: 0, sink: 0, lamps: 1,
  // PUITS: the share of the column (from the top) where seawater replaced the mud · the balance of `principe` (−1 the mud wins,
  // +1 the gas wins) · the gas: its top (`gas`) and its bottom (`gasBase`), 0 the bottom of the bore → 1 the drill floor ·
  // the flow dial in barrels/min (0 … 30) and its mark at 10 lit (`mark`) · the two dials in psi (TUBE `dialTube`, LIGNE `dialLine`) ·
  // the EDS button pressed (`eds`), the signal down the control cable (`signal` 0 the panel → 1 the BOP)
  sea: 0, balance: -1, gas: 0, gasBase: 0, debit: 0, mark: 0, dialTube: 0, dialLine: 0, eds: 0, signal: 0,
  // BOP (and the simple BOP of puits: annular, vbr, bsr): each element 0 open → 1 closed · the red flux from the well (`flow`) and
  // how much of it passes the closed elements upward (`pass`) · the pipe's buckling (0 straight, centred → 1 bent, off-centre) and
  // the pressure inside it shown (`inside`) · the automatic last resort: the pods' lamps (`amf`), the lines from the surface (`link`
  // 1 alive → 0 cut) · the pods: front panels open (`podOpen`), the 27 V battery's charge (1 → 0), the valve's two opposed coils shown
  // (`coils`) · the leak after (`plume`) · `depuis`: the second shear ram (`rams2`), the centring ring (`ring`), the clean cut (`shear`)
  annular: 0, vbr: 0, bsr: 0, flow: 0, pass: 1, buckle: 0, inside: 0, amf: 0, link: 1,
  podOpen: 0, charge: 1, coils: 0, plume: 0, rams2: 0, ring: 0, shear: 0,
};

/** `depuis`: the BOP as it failed (the pipe bent, red, the blades half-closed on it), before the correction heals it. */
export const BENCHED = {
  ...STAGED.bop, culprit: 2, fault: 1, buckle: 1, bsr: 0.55, vbr: 1, annular: 0, flow: 0, pass: 0, plume: 0, inside: 0,
  amf: 0, link: 1, podOpen: 0, rams2: 0, ring: 0, shear: 0,
};

/* The camera. Each pose is complete (nothing is inherited across a cut). PROVISIONAL: set on grey stubs (docs/journal/CR02-architecte.md);
   the decor agents give the poses that frame best in their journals. Cameras sit between az −50 and −80: the cut faces and the key. */
const pose = (name, local, o) => ({ ...P, fov: 30, shift: 0, ...aim(name, local), ...o });
export const VIEW = {
  // PLATEFORME — (a) the first image: low on the drill floor, looking UP the derrick, the mud jet rising at you
  floorLow: pose("plateforme", [0, 528, 0], { d: 92, az: -60, el: -40, fov: 58, shift: 0 }),
  // the rig whole, three-quarter from just above the sea (promesse « C'est Deepwater Horizon », t4 wide, t7 the explosion, abo)
  rig: pose("plateforme", [0, 500, 0], { d: 980, az: -58, el: 3, shift: 200 }),
  // (b) under the sea, at the aquarium edge, looking up the riser: the small BOP below, the rig and its jet on top
  under: pose("plateforme", [0, 290, 0], { d: 1400, az: -66, el: -3, fov: 40, shift: -40 }),
  // (c) the waterline: the rig above the surface, the riser and the BOP under it, one frame (the diorama)
  line: pose("plateforme", [0, 330, 0], { d: 1500, az: -62, el: 1, shift: 0 }),
  // (d) close on the rotary table: the mud bursting out of the hole
  table: pose("plateforme", [0, 478, 0], { d: 110, az: -64, el: 26, shift: 60, ...CLOSE }),
  // down along the riser to the seabed (promesse « Au fond »: the end of the plunge)
  seabed: pose("plateforme", [0, 40, 0], { d: 260, az: -62, el: 8, shift: 40 }),
  // the sinking (issue)
  sink: pose("plateforme", [0, 420, 0], { d: 1100, az: -50, el: 6, shift: 40 }),
  // PUITS — the whole column (t1 « on remplace sa boue », a pull-back)
  puits: pose("puits", [0, 300, 0], { d: 1500, az: -66, el: 3, shift: 0 }),
  // the bottom: the reservoir, the gas against the mud, the balance (principe « gaz d'en bas », t2 « par le fond »)
  bottom: pose("puits", [0, 92, 0], { d: 430, az: -64, el: 6, shift: 40 }),
  // the column's middle: the fluids climbing (principe « un long tube », t3)
  middle: pose("puits", [0, 170, 0], { d: 560, az: -64, el: 4, shift: 30 }),
  // the top of the column under the drill floor (t1: the seawater from the top)
  top: pose("puits", [0, 520, 0], { d: 420, az: -62, el: 6, shift: 20 }),
  // the console: both dials (t1 « deux cadrans », lecture, comment)
  dials: pose("puits", [10, 588, -64], { d: 240, az: -70, el: 8, shift: 40, ...CLOSE }),
  // close on the LIGNE dial (lecture « Zéro »)
  dialLine: pose("puits", [10, 588, -47], { d: 200, az: -72, el: 6, shift: 40, ...CLOSE }),
  // the flow dial (piege, t3)
  flowDial: pose("puits", [-3, 74, 52], { d: 260, az: -72, el: 8, shift: 40, ...CLOSE }),
  // the simple BOP and the riser above it (t6 the pocket above, t8 the signal arrives)
  bopSmall: pose("puits", [0, 300, 0], { d: 380, az: -64, el: 6, shift: 40 }),
  // the EDS panel and its button (t8)
  eds: pose("puits", [10, 578, 66], { d: 100, az: -70, el: 12, shift: 40, ...CLOSE }),
  // BOP — the stack whole, three-quarter (bop beat, t5, t9, issue)
  bop: pose("bop", [0, 88, 0], { d: 600, az: -50, el: 10, shift: 60 }),
  // close on the upper annular (t5)
  annular: pose("bop", [0, 122, 0], { d: 230, az: -66, el: 6, ...CLOSE }),
  // close on the upper VBR (bop « mâchoires », t6)
  vbr: pose("bop", [0, 52, 0], { d: 200, az: -55, el: 6, ...CLOSE }),
  // close on the blades (bop « lames », t8, t9)
  bsr: pose("bop", [0, 80, 0], { d: 170, az: -62, el: 6, ...CLOSE }),
  // the master shot of `defaut`: the blades and the buckled pipe in section, between the VBR and the annular
  master: pose("bop", [0, 84, 0], { d: 340, az: -72, el: 4, shift: 40 }),
  // both pods, side by side along the LMRP (pire)
  pods: pose("bop", [10, 112, 0], { d: 520, az: -74, el: 8, shift: 40 }),
  podBattery: pose("bop", [10, 112, -46], { d: 120, az: -72, el: 8, shift: 30, ...CLOSE }),
  podValve: pose("bop", [10, 112, 46], { d: 120, az: -72, el: 8, shift: 30, ...CLOSE }),
  // the leak after (issue): the stack and the plume over it
  plume: pose("bop", [0, 150, 0], { d: 820, az: -56, el: 12, shift: 40 }),
};
/** The first frame (candidate a, provisional until the board of four: docs/CR02-actes.md « La première image »). Sharp. */
export const POSE0 = { ...VIEW.floorLow, drift: 0 };

export function buildWorld(stage) {
  const { scene } = stage;
  const recon = setupReconstitution(stage, { floor: 0 });
  const sets = [buildPlateforme(), buildPuits(), buildBop()];
  sets.forEach((s, i) => {
    s.group.position.set(...ORIGIN[NAMES[i]]);
    scene.add(s.group);
  });
  const faultAt = new THREE.Vector3();

  return {
    sets,
    plateforme: sets[0], puits: sets[1], bop: sets[2],
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
      // the halo under the part in fault (the decor moves A.fault onto its culprit); green under the BOP from `depuis`
      const set = sets[shown];
      set.A.fault.getWorldPosition(faultAt);
      const heal = shown === SET.BOP ? S.depuis : 0;
      const k = Math.round(S.culprit) > 0 ? S.fault : 0;
      recon.halo({ at: [faultAt.x, set.haloY ?? 0, faultAt.z], r: set.haloR ?? 40, amount: 0.5 * Math.max(k, heal), k: heal });
      recon.setMood(S.depuis); // after stage.focus: the light re-aims
      if (scene.fog) scene.fog.density = 0.00012;
    },
  };
}
