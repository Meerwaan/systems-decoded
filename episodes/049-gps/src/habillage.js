// DOSSIER 049 — GPS : the dressing of the night road and of the cab (the decorator's file — docs/recette-decorateur.md).
// Nothing here is the system: nothing on the phone, the satellite, the dot, nor in front of them. All `ink`, X-ray glass,
// lights that have a place. 025's own dressing (its delineators, its sign, its borne, its far countryside) comes with
// its road and is kept. What the junction did not have — « de nuit, route inconnue »:
//   · TWO FARMS BEYOND THE JUNCTION, one each side (a yard lamp, a window or two): somebody lives out there, nobody to
//     ask the way. Near the road's axis (5–8°): the chase and the sign shots look down it — never behind the sign.
//   · A VILLAGE UP A HILLSIDE, FAR TO THE LEFT (≈ 800 m — the camera sees 900 m — 32° left of the car's axis): a place
//     you do not know. The hook looks 22° left: the village sits left of the phone, above the sunglasses, never behind
//     the phone. No glow on the clouds (at 270 px it read as a disc next to the phone).
//   · IN THE CAB: a pair of sunglasses folded on the dashboard, left of the holder — it is night, they are off.
// No mist over the field: the blue dot lies there, and it must stay the only thing that glows in it.
//
//   dressRoad() → { far, cab, update({ shell }, time, px) }
//   far: in route.js's junction frame (`frame`: z 0 the crossing road's near edge, scrolls with `gap`) · cab: the car's frame
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeDresser } from "@kit/details.js";
import { glass, asShell, box, cyl, edgesOf } from "@kit/build3d.js";
import { JUNCTION, PHONE } from "./plan.js";

const DEG = Math.PI / 180;

/** Sunglasses folded on the dashboard (cm, the car's frame): two lenses leaning back, the bridge, the arms folded flat. */
function makeGlasses() {
  const g = new THREE.Group();
  g.position.set(PHONE.at[0] - 22, 98.2, PHONE.at[2] - 18);
  g.rotation.set(0, 18 * DEG, 0);
  const mat = glass(BRAND.ink, { base: 0.02, rim: 0.22, power: 2.2, spec: 0.2 });
  const lines = [];
  const meshes = [];
  const piece = (geometry, pos, rot) => {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(...pos);
    m.rotation.set(...rot, "YXZ");
    const e = edgesOf(geometry, { width: 1.8, opacity: 0.35 });
    e.position.copy(m.position);
    e.rotation.copy(m.rotation);
    g.add(m, e);
    meshes.push(m);
    lines.push(e);
  };
  for (const s of [-1, 1]) {
    const lens = cyl(2.5, 0.35, 0.12, 28);
    lens.scale(1.18, 1, 1);
    lens.userData.edges?.scale(1.18, 1, 1);
    piece(lens, [s * 3.3, 2.1, 0], [-62 * DEG, 0, 0]); //                       the lens, leaning back
    piece(box(0.5, 0.45, 12.5, 0.15), [s * 4.6, 0.3, -6.6], [0, s * -4 * DEG, 0]); // its arm, folded flat behind
  }
  piece(box(1.6, 0.5, 0.5, 0.15), [0, 3.1, -0.4], [0, 0, 0]); //                 the bridge
  asShell(meshes, 22);
  return { group: g, mat, lines };
}

export function dressRoad() {
  const far = new THREE.Group();
  far.name = "habillage-049";
  const cab = new THREE.Group();

  const d = makeDresser({ order: 12, tone: 0.85, seed: 49 });
  // the farm on the right, 300 m past the junction, 52 m right of your axis (out of the sign shot: never behind the sign): a yard lamp on its pole, two windows
  d.glow({ at: [5200, 520, -30000], size: 700, k: 1.6, kind: "far" });
  d.glow({ at: [4850, 260, -29700], size: 170, k: 0.7, kind: "far" });
  d.glow({ at: [4550, 260, -29700], size: 150, k: 0.5, kind: "far" });
  // the farm on the left, twice as far: one lamp, one window
  d.glow({ at: [-6500, 480, -60000], size: 1000, k: 1.5, kind: "far" });
  d.glow({ at: [-6150, 250, -59700], size: 260, k: 0.5, kind: "far" });
  // the village on its slope, far to the left: its lights draw the hill (no line is drawn)
  const rand = rng(490);
  for (let i = 0; i < 9; i++) {
    const u = i / 8;
    d.glow({
      at: [-46000 + u * 9000 + (rand() - 0.5) * 1500, 3200 + u * 2800 + rand() * 400, -56000 + (rand() - 0.5) * 5000],
      size: 600 + rand() * 450, k: 0.55 + rand() * 0.35, kind: "far",
    });
  }
  d.done();
  far.add(d.group);

  const specs = makeGlasses();
  cab.add(specs.group);

  return {
    far, cab,
    update({ shell = 1 } = {}, time = 0, px = 1) {
      const a = Math.min(1, Math.max(0, shell));
      d.update({ amount: a }, time, px);
      specs.group.visible = a > 0.003;
      specs.mat.uniforms.uAmount.value = a;
      for (const l of specs.lines) l.material.opacity = 0.35 * a;
    },
  };
}
