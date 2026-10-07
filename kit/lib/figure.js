// "TOI", or anyone the story needs: a figure of glass — a head, a trunk, limbs cut to their own
// length — seen like an X-ray. Centimetres, 1.76 m tall, standing at the origin, looking toward +z
// (+x is its left). It is posed the way a puppet is: each hand and each foot is put somewhere and
// the elbow, the knee find their own place; the trunk leans from the hips. Lay the whole group
// down, lower it, keep its feet where they were: it kneels, it falls, it lies (see 006, hall.js).
// Seen from close, a ball at the end of an arm is a ball: `hands: "flat"` gives a mitten that
// follows the forearm, or lies the way it is told to (`reach(…, { dir, palm })`).
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { solid, glass, lathe } from "./build3d.js";

const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);
const ARM = { upper: 30, fore: 27 };
const HIP = 90; // the height of the hips, standing: what the trunk leans from
const DEG = Math.PI / 180;

/**
 * `skin`: the colour of the head and the hands (the only solid parts). `glassK`: how bright the
 * glass is (1 = the usual). `hands`: "ball" (the default) or "flat".
 */
export function makeFigure({ skin = 0xb4ada0, glassK = 1, hands = "ball" } = {}) {
  const flat = hands === "flat";
  const group = new THREE.Group();
  const body = glass(BRAND.ink, { base: 0.014 * glassK, rim: 0.34 * glassK, power: 2.3 });
  const flesh = solid(skin, { rough: 0.62, env: 0.6 });
  const tmp = new THREE.Vector3();
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // the trunk and the head turn together around the line of the hips
  const torso = new THREE.Group();
  torso.position.set(0, HIP, 0);
  const trunk = new THREE.Mesh(lathe([[0.1, 86], [11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5], [4.8, 155.5], [0.1, 155.5]], 56), body);
  trunk.scale.z = 0.62; // shoulders, not a skittle
  trunk.position.y = -HIP;
  const head = new THREE.Mesh(new THREE.SphereGeometry(10.4, 40, 26), flesh);
  head.position.set(0, 166.5 - HIP, 1);
  head.castShadow = true;
  torso.add(trunk, head);
  group.add(torso);

  /** A limb `len` long: never stretched (a stretched capsule has pointed ends). Returns what lays it between two points. */
  const limb = (r, len) => {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.1, len - r * 1.1), 8, 20), body);
    group.add(mesh);
    return (a, b) => {
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.quaternion.setFromUnitVectors(UP, tmp.subVectors(b, a).normalize());
    };
  };
  const J = { hipL: V(8, HIP, 0), kneeL: V(8.6, 48, 1.5), ankleL: V(8.6, 8, 0), hipR: V(-8, HIP, 0), kneeR: V(-8.6, 48, 1.5), ankleR: V(-8.6, 8, 0), shL: V(19.5, 144, 0), shR: V(-19.5, 144, 0) };
  const shoulder = { L: V(19.5, 144 - HIP, 0), R: V(-19.5, 144 - HIP, 0) }; // in the trunk's own frame

  /* ── two bones between a fixed joint and a point to reach: where does the middle joint go? ── */
  const along = new THREE.Vector3();
  const pole = new THREE.Vector3();
  // `slack`: how far from fully straight the limb may get (a straight limb has no side to bend to)
  const twoBones = (from, target, a, b, lean, mid, end, slack = 0.6) => {
    const d = Math.min(a + b - slack, Math.max(Math.abs(a - b) + 0.6, tmp.subVectors(target, from).length()));
    along.subVectors(target, from).normalize();
    const foot = (a * a - b * b + d * d) / (2 * d);
    const out = Math.sqrt(Math.max(0, a * a - foot * foot));
    pole.copy(lean).addScaledVector(along, -lean.dot(along));
    if (pole.lengthSq() < 1e-6) pole.set(along.z, 0, -along.x); // the lean is along the limb: any side will do
    pole.normalize();
    mid.copy(from).addScaledVector(along, foot).addScaledVector(pole, out);
    end.copy(from).addScaledVector(along, d);
  };

  /* ── the legs ── */
  const legs = {};
  const quat = new THREE.Quaternion();
  for (const s of ["L", "R"]) {
    const thighLen = J[`hip${s}`].distanceTo(J[`knee${s}`]);
    const shinLen = J[`knee${s}`].distanceTo(J[`ankle${s}`]);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), body);
    foot.scale.set(4.8, 3.4, 11.5);
    group.add(foot);
    legs[s] = { thigh: limb(7, thighLen), shin: limb(5.2, shinLen), foot, thighLen, shinLen, hip: J[`hip${s}`], knee: J[`knee${s}`], ankle: J[`ankle${s}`] };
  }
  /**
   * Put a foot somewhere (the ankle, in the figure's own frame). `bend`: where the knee leans —
   * forward by default. `toe`: where the foot points. Returns where the ankle really is.
   */
  function leg(s, ankle, bend = FRONT, toe = FRONT) {
    const l = legs[s];
    twoBones(l.hip, ankle, l.thighLen, l.shinLen, bend, l.knee, l.ankle, 0.05);
    l.thigh(l.hip, l.knee);
    l.shin(l.knee, l.ankle);
    quat.setFromUnitVectors(FRONT, tmp.copy(toe).normalize());
    l.foot.quaternion.copy(quat);
    l.foot.position.copy(l.ankle).add(tmp.set(0, -4.6, 6).applyQuaternion(quat));
    return l.ankle;
  }

  /* ── the arms ── */
  const arms = {};
  for (const s of ["L", "R"]) {
    const side = s === "L" ? 1 : -1;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(4.4, 24, 16), flesh);
    if (flat) hand.scale.set(1, 0.46, 1.5); // 8.8 wide, 4 thick, 13 long: the fingers along z, the palm toward −y
    hand.castShadow = true;
    group.add(hand);
    arms[s] = { upper: limb(4.7, ARM.upper), fore: limb(4, ARM.fore), hand, elbow: V(0, 0, 0), at: V(0, 0, 0), sh: J[`sh${s}`], side, target: V(0, 0, 0), bend: null, dir: null, palm: null };
  }
  const hang = new THREE.Vector3();
  const hx = new THREE.Vector3();
  const hy = new THREE.Vector3();
  const hz = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  /** The hand, at the end of its arm: a ball on the wrist — or flat, the fingers straight on from the forearm, the palm toward the body. */
  const layHand = (arm) => {
    if (!flat) return arm.hand.position.copy(arm.at);
    hz.copy(arm.dir ?? tmp.subVectors(arm.at, arm.elbow)).normalize();
    hy.copy(arm.palm ?? tmp.set(-arm.side, 0, 0)).multiplyScalar(-1); // the back of the hand
    hy.addScaledVector(hz, -hy.dot(hz));
    if (hy.lengthSq() < 1e-6) hy.set(0, 1, 0).addScaledVector(hz, -hz.y);
    hy.normalize();
    hx.crossVectors(hy, hz);
    arm.hand.quaternion.setFromRotationMatrix(basis.makeBasis(hx, hy, hz));
    return arm.hand.position.copy(arm.at).addScaledVector(hz, 5); // the wrist is where the arm ends: the hand goes on from it
  };
  /**
   * Put a hand somewhere (in the figure's own frame). `bend`: where the elbow leans — by default
   * down and a little outward. `lay` (flat hands): `dir`, where the fingers point, and `palm`,
   * what the palm faces. Returns the point the wrist really reached (an arm is 57 cm long).
   */
  function reach(s, target, bend, lay) {
    const arm = arms[s];
    arm.target.copy(target);
    arm.bend = bend ? (arm.bend ?? V(0, 0, 0)).copy(bend) : null;
    arm.dir = lay?.dir ? (arm.dir ?? V(0, 0, 0)).copy(lay.dir) : null;
    arm.palm = lay?.palm ? (arm.palm ?? V(0, 0, 0)).copy(lay.palm) : null;
    twoBones(arm.sh, target, ARM.upper, ARM.fore, arm.bend ?? hang.set(arm.side * 0.35, -1, -0.1), arm.elbow, arm.at);
    arm.upper(arm.sh, arm.elbow);
    arm.fore(arm.elbow, arm.at);
    layHand(arm);
    return arm.at;
  }

  /**
   * Lean the trunk from the hips: `pitch` forward (degrees), `roll` toward its left, `turn` around
   * itself. The shoulders go with it; the hands stay where they were put, as far as the arms allow.
   */
  function lean(pitch = 0, roll = 0, turn = 0) {
    torso.rotation.set(pitch * DEG, turn * DEG, -roll * DEG, "YXZ");
    torso.updateMatrix();
    for (const s of ["L", "R"]) {
      arms[s].sh.copy(shoulder[s]).applyMatrix4(torso.matrix);
      reach(s, tmp2.copy(arms[s].target), arms[s].bend, arms[s]);
    }
  }
  const tmp2 = new THREE.Vector3();

  // at rest: standing, both arms hanging
  leg("L", V(8.6, 8, 0));
  leg("R", V(-8.6, 8, 0));
  reach("L", V(20.5, 92, 3));
  reach("R", V(-20.5, 92, 3));

  return { group, torso, head, body, flesh, J, arms, legs, reach, leg, lean, HIP };
}
