// "TOI", or anyone the story needs: a figure of glass — a head, a trunk, limbs cut to their own
// length — seen like an X-ray. Centimetres, 1.76 m tall, standing at the origin, looking toward +z
// (+x is its left). Each arm is placed by where its hand should be: the elbow finds its own place.
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { solid, glass, lathe } from "./build3d.js";

const UP = new THREE.Vector3(0, 1, 0);
const ARM = { upper: 30, fore: 27 };

/** `skin`: the colour of the head and the hands (the only solid parts). */
export function makeFigure({ skin = 0xb4ada0 } = {}) {
  const group = new THREE.Group();
  const body = glass(BRAND.ink, { base: 0.014, rim: 0.34, power: 2.3 });
  const flesh = solid(skin, { rough: 0.62, env: 0.6 });
  const tmp = new THREE.Vector3();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const trunk = new THREE.Mesh(lathe([[0.1, 86], [11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5], [4.8, 155.5], [0.1, 155.5]], 56), body);
  trunk.scale.z = 0.62; // shoulders, not a skittle
  const head = new THREE.Mesh(new THREE.SphereGeometry(10.4, 40, 26), flesh);
  head.position.set(0, 166.5, 1);
  head.castShadow = true;
  group.add(trunk, head);

  /** A limb `len` long: never stretched (a stretched capsule has pointed ends). Returns what lays it between two points. */
  const limb = (r, len) => {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.1, len - r * 1.1), 8, 20), body);
    group.add(mesh);
    return (a, b) => {
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(UP, tmp.subVectors(b, a).normalize());
    };
  };
  const J = { hipL: V(8, 90, 0), kneeL: V(8.6, 48, 1.5), ankleL: V(8.6, 8, 0), hipR: V(-8, 90, 0), kneeR: V(-8.6, 48, 1.5), ankleR: V(-8.6, 8, 0), shL: V(19.5, 144, 0), shR: V(-19.5, 144, 0) };
  for (const s of ["L", "R"]) {
    limb(7, J[`hip${s}`].distanceTo(J[`knee${s}`]))(J[`hip${s}`], J[`knee${s}`]);
    limb(5.2, J[`knee${s}`].distanceTo(J[`ankle${s}`]))(J[`knee${s}`], J[`ankle${s}`]);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), body);
    foot.scale.set(4.8, 3.4, 11.5);
    foot.position.set(J[`ankle${s}`].x, 3.4, 6);
    group.add(foot);
  }

  const arms = {};
  for (const s of ["L", "R"]) {
    const side = s === "L" ? 1 : -1;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(4.4, 24, 16), flesh);
    hand.castShadow = true;
    group.add(hand);
    arms[s] = { upper: limb(4.7, ARM.upper), fore: limb(4, ARM.fore), hand, elbow: V(0, 0, 0), at: V(0, 0, 0), sh: J[`sh${s}`], side };
  }
  const along = new THREE.Vector3();
  const pole = new THREE.Vector3();
  /**
   * Put a hand somewhere (in the figure's own frame). `bend`: where the elbow leans — by default
   * down and a little outward. Returns the point the hand really reached (an arm is 57 cm long).
   */
  function reach(s, target, bend) {
    const arm = arms[s];
    const d = Math.min(ARM.upper + ARM.fore - 0.6, tmp.subVectors(target, arm.sh).length());
    along.subVectors(target, arm.sh).normalize();
    const mid = (ARM.upper * ARM.upper - ARM.fore * ARM.fore + d * d) / (2 * d);
    const out = Math.sqrt(Math.max(0, ARM.upper * ARM.upper - mid * mid));
    pole.copy(bend ?? tmp.set(arm.side * 0.35, -1, -0.1));
    pole.addScaledVector(along, -pole.dot(along)).normalize();
    arm.elbow.copy(arm.sh).addScaledVector(along, mid).addScaledVector(pole, out);
    arm.at.copy(arm.sh).addScaledVector(along, d);
    arm.upper(arm.sh, arm.elbow);
    arm.fore(arm.elbow, arm.at);
    arm.hand.position.copy(arm.at);
    return arm.at;
  }
  // at rest: both arms hanging
  reach("L", V(20.5, 92, 3));
  reach("R", V(-20.5, 92, 3));

  return { group, body, flesh, J, arms, reach };
}
