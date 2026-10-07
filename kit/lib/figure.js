// "TOI", or anyone the story needs: a figure of glass — a head, a trunk, limbs cut to their own
// length — seen like an X-ray. Centimetres, 1.76 m tall, standing at the origin, looking toward +z
// (+x is its left). It is posed the way a puppet is: each hand and each foot is put somewhere and
// the elbow, the knee find their own place; the trunk leans from the hips. Lay the whole group
// down, lower it, keep its feet where they were: it kneels, it falls, it lies (see 006, hall.js).
// Seen from close, a ball at the end of an arm is a ball: `hands: "flat"` gives a mitten that
// follows the forearm, or lies the way it is told to (`reach(…, { dir, palm })`); `hands: "real"`
// gives a palm, four fingers and a thumb that close on a handle (`hold`, `grip`).
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { solid, glass, lathe, asShell, plate, chamfer } from "./build3d.js";
import { makeContact } from "./atmo.js";

const UP = new THREE.Vector3(0, 1, 0);
const FRONT = new THREE.Vector3(0, 0, 1);
const ARM = { upper: 30, fore: 27 };
const HIP = 90; // the height of the hips, standing: what the trunk leans from
const DEG = Math.PI / 180;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, u) => a + (b - a) * u;

/* ── two bones between a fixed joint and a point to reach: where does the middle joint go? ── */
const tmp = new THREE.Vector3();
const along = new THREE.Vector3();
const pole = new THREE.Vector3();
// `slack`: how far from fully straight the limb may get (a straight limb has no side to bend to)
function twoBones(from, target, a, b, lean, mid, end, slack = 0.6) {
  const d = Math.min(a + b - slack, Math.max(Math.abs(a - b) + 0.6, tmp.subVectors(target, from).length()));
  along.subVectors(target, from).normalize();
  const foot = (a * a - b * b + d * d) / (2 * d);
  const out = Math.sqrt(Math.max(0, a * a - foot * foot));
  pole.copy(lean).addScaledVector(along, -lean.dot(along));
  if (pole.lengthSq() < 1e-6) pole.set(along.z, 0, -along.x); // the lean is along the limb: any side will do
  pole.normalize();
  mid.copy(from).addScaledVector(along, foot).addScaledVector(pole, out);
  end.copy(from).addScaledVector(along, d);
}

/** A bone `len` long between two joints, `r` thick: a ball at each joint, never stretched. Returns what lays it between two points. */
function bone(parent, material, r, len, cap = 8, radial = 20, geometry = new THREE.CapsuleGeometry(r, len, cap, radial)) {
  const mesh = new THREE.Mesh(geometry, material);
  parent.add(mesh);
  const lay = (a, b) => {
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, tmp.subVectors(b, a).normalize());
  };
  lay.mesh = mesh;
  return lay;
}

/* ── a hand that closes (`hands: "real"`). Its own frame is the mitten's: the wrist at the origin,
   the fingers along +z, the palm toward −y. `t`: which side the thumb is on (±x). ── */
// its outline, seen from the back of the hand: [across (toward the thumb), along]
const PALM = { thick: 2.7, len: 9.0, outline: [[-3.0, -0.3], [3.2, -0.3], [4.3, 5.6], [3.9, 8.5], [1.0, 9.0], [-1.2, 8.8], [-3.9, 7.8], [-4.1, 5.0]] };
const KNUCKLE_Y = 0.4; // the fingers leave from the back of the hand: on a fist, the knuckles stand out
const WRIST = 1; // how far past the end of the forearm a real hand begins: clear of the round end of its glass
/** A capsule that narrows: `r0` thick at its first joint, `r1` at the other — a forearm down to its wrist. A hand at the end of a sleeve 8 cm wide is a hand in a muff. */
function taper(r0, r1, len) {
  const arc = (r, y, from) => Array.from({ length: 9 }, (_, i) => [Math.max(0.001, r * Math.cos((from + i * 11.25) * DEG)), y + r * Math.sin((from + i * 11.25) * DEG)]);
  return lathe([...arc(r0, -len / 2, -90), ...arc(r1, len / 2, 0)], 20);
}
// across the palm (toward the thumb), where the knuckle is, the three bones, how thick, how far it fans out when open (degrees)
const FINGERS = [
  { x: 3.0, z: 8.9, bones: [3.9, 2.4, 2.0], r: 0.92, fan: 5 },
  { x: 1.0, z: 9.3, bones: [4.3, 2.7, 2.1], r: 0.95, fan: 1 },
  { x: -1.0, z: 9.0, bones: [4.0, 2.5, 2.0], r: 0.9, fan: -3 },
  { x: -2.95, z: 8.2, bones: [3.1, 1.9, 1.8], r: 0.8, fan: -8 },
];
const REST = [0.16, 0.22, 0.14]; // an open hand at rest is never flat: each joint a little bent (radians)
const THUMB = { bones: [3.7, 3.0, 2.5], r: [1.22, 1.06, 0.96] };
/** Where the axis of a bar of radius `bar` lies in a hand closed on it: against the palm, just behind the knuckles. */
const barIn = (bar) => ({ y: -(PALM.thick / 2 + 0.2 + bar), z: 9 - 0.68 * bar });

function makeHand(t, material) {
  const group = new THREE.Group();
  const meshes = [];
  const add = (mesh) => (group.add(mesh), meshes.push(mesh), mesh);

  // the palm, cut like a hand's: narrow at the wrist, the knuckles on a slant, every corner and every edge rounded (a box is a boxing pad)
  const loop = PALM.outline.map(([x, z]) => [t * x, z]);
  const palmGeo = plate(chamfer([loop.at(-1), ...loop, loop[0]], 1.5, 4).slice(1, -1), PALM.thick, { bevel: 1.2, round: 3 })
    .rotateX(Math.PI / 2)
    .translate(0, PALM.thick / 2, 0);
  const at = palmGeo.attributes.position;
  for (let i = 0; i < at.count; i++) at.setY(i, at.getY(i) * (1 - 0.2 * Math.min(1, Math.max(0, at.getZ(i) / PALM.len)))); // thinner toward the fingers
  add(new THREE.Mesh(palmGeo, material));
  const ball = add(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), material)); // the ball of the thumb
  ball.scale.set(2.3, 1.6, 3.2);
  ball.position.set(t * 2.6, -1.0, 3.7);

  const fingers = FINGERS.map((f) => ({ ...f, lay: f.bones.map((len, i) => bone(group, material, f.r * (1 - 0.08 * i), len, 5, 12)) }));
  const thumb = THUMB.bones.map((len, i) => bone(group, material, THUMB.r[i], len, 5, 12));
  for (const f of fingers) for (const lay of f.lay) meshes.push(lay.mesh);
  for (const lay of thumb) meshes.push(lay.mesh);

  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const root = V(t * 3.4, -1.3, 3.2); // where the thumb leaves the palm
  const knuckle = new THREE.Vector3();
  const tip = new THREE.Vector3();
  const side = V(t, -0.4, -0.3);
  const open = { at: V(t * 7.56, -2.94, 8.05), dir: V(t * 0.4, -0.15, 0.9).normalize() };
  const shut = { at: new THREE.Vector3(), dir: new THREE.Vector3() };
  /** `k`: 0 open, at rest → 1 closed on a bar of radius `bar` (cm) lying across the palm. */
  function pose(k, bar = 1.4) {
    const c = barIn(bar);
    for (const f of fingers) {
      // closed, each bone lies against the bar: its axis is tangent to the circle of radius bar + finger around the bar's own
      const rho = bar + f.r;
      const dy = c.y - KNUCKLE_Y;
      const dz = c.z - f.z;
      const D = Math.hypot(dy, dz);
      const free = Math.sqrt(Math.max(0, D * D - rho * rho)); // from the knuckle to where the first bone touches
      const t1 = Math.max(0.3, f.bones[0] - free);
      const t2 = Math.max(0.2, f.bones[1] - t1);
      const closed = [Math.atan2(-dy, dz) - Math.asin(Math.min(1, rho / D)), 2 * Math.atan(t1 / rho), 2 * Math.atan(t2 / rho)];
      const fan = f.fan * DEG * t * (1 - k);
      let bent = 0;
      a.set(t * f.x, KNUCKLE_Y, f.z);
      for (let i = 0; i < 3; i++) {
        bent += mix(REST[i], closed[i], k);
        dir.set(Math.sin(fan) * Math.cos(bent), -Math.sin(bent), Math.cos(fan) * Math.cos(bent));
        b.copy(a).addScaledVector(dir, f.bones[i]);
        f.lay[i](a, b);
        a.copy(b);
      }
    }
    // the thumb closes the ring from the other side: under the bar, beside the forefinger
    const rt = bar + 1.1;
    shut.at.set(t * 4.9, c.y - rt * Math.sin(70 * DEG), c.z - rt * Math.cos(70 * DEG));
    shut.dir.set(t * 4.5, c.y - rt * Math.sin(130 * DEG), c.z - rt * Math.cos(130 * DEG)).sub(shut.at).normalize();
    twoBones(root, a.copy(open.at).lerp(shut.at, k), THUMB.bones[0], THUMB.bones[1], side, knuckle, tip, 0.15);
    thumb[0](root, knuckle);
    thumb[1](knuckle, tip);
    thumb[2](tip, b.copy(open.dir).lerp(shut.dir, k).normalize().multiplyScalar(THUMB.bones[2]).add(tip));
  }
  pose(0);
  return { group, meshes, pose };
}

/**
 * `skin`: the colour of the head and the hands (the only solid parts). `glassK`: how bright the
 * glass is (1 = the usual). `hands`: "ball" (the default), "flat" or "real".
 * `shell`: the body is ONE shell of glass with a bright lip and the softbox mirrored in it, not a
 * heap of capsules whose every face adds up; nothing of it casts a shadow (three orphan ovals under
 * a head and two hands) — `shadow`, a soft patch, sits it on its floor instead. `order`: see
 * `asShell` (two figures with the same order hide each other like solids; the lower order is seen
 * through the higher). `spec`: the softbox in the glass (by default only on a figure bright enough to be near).
 * `through`: how much of its own far side shows through the shell (0: none — see `glass`).
 * Returns, besides what poses it: `grip`, `hold` (real hands), `ghost` (head and hands of glass),
 * `shadow`, and `skin`, the solid meshes (to let them cast a shadow after all, hang a helmet on `head`…).
 */
export function makeFigure({ skin = 0xb4ada0, glassK = 1, hands = "ball", shell = false, order = 20, spec, through = 0.15 } = {}) {
  const laid = hands !== "ball"; // a hand with a direction and a palm
  const real = hands === "real";
  const group = new THREE.Group();
  const body = shell
    ? glass(BRAND.ink, { base: 0.004 * glassK, rim: 0.42 * glassK, power: 2.4, edge: 0.35 * glassK, spec: spec ?? (glassK > 0.5 ? 0.8 : 0), through })
    : glass(BRAND.ink, { base: 0.014 * glassK, rim: 0.34 * glassK, power: 2.3 });
  const flesh = solid(skin, { rough: 0.62, env: 0.6 });
  const panes = []; // every mesh of glass
  const skinned = []; // every solid one: the head, the hands

  // the trunk and the head turn together around the line of the hips
  const torso = new THREE.Group();
  torso.position.set(0, HIP, 0);
  const TRUNK = [[0.1, 86], [11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5], [4.8, 155.5], [0.1, 155.5]];
  // a shell mirrors the softbox: its profile is drawn through the same points as a curve, or each of its nine bands would mirror it apart
  const smooth = () => new THREE.CatmullRomCurve3(TRUNK.map(([r, y]) => V(r, y, 0)), false, "centripetal").getPoints(54).map((p) => [Math.max(0.1, p.x), p.y]);
  const trunk = new THREE.Mesh(lathe(shell ? smooth() : TRUNK, 56), body);
  trunk.scale.z = 0.62; // shoulders, not a skittle
  trunk.position.y = -HIP;
  const head = new THREE.Mesh(new THREE.SphereGeometry(10.4, 40, 26), flesh);
  head.position.set(0, 166.5 - HIP, 1);
  torso.add(trunk, head);
  group.add(torso);
  panes.push(trunk);
  skinned.push(head);

  /** A limb `len` long: never stretched (a stretched capsule has pointed ends). Returns what lays it between two points. */
  const limb = (r, len, thin) => {
    const straight = Math.max(0.1, len - r * 1.1);
    const lay = bone(group, body, r, straight, 8, 20, thin ? taper(r, thin, straight) : undefined);
    panes.push(lay.mesh);
    return lay;
  };
  const J = { hipL: V(8, HIP, 0), kneeL: V(8.6, 48, 1.5), ankleL: V(8.6, 8, 0), hipR: V(-8, HIP, 0), kneeR: V(-8.6, 48, 1.5), ankleR: V(-8.6, 8, 0), shL: V(19.5, 144, 0), shR: V(-19.5, 144, 0) };
  const shoulder = { L: V(19.5, 144 - HIP, 0), R: V(-19.5, 144 - HIP, 0) }; // in the trunk's own frame

  /* ── the legs ── */
  const legs = {};
  const quat = new THREE.Quaternion();
  for (const s of ["L", "R"]) {
    const thighLen = J[`hip${s}`].distanceTo(J[`knee${s}`]);
    const shinLen = J[`knee${s}`].distanceTo(J[`ankle${s}`]);
    const foot = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), body);
    foot.scale.set(4.8, 3.4, 11.5);
    group.add(foot);
    panes.push(foot);
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
    let hand;
    let fingers = null;
    if (real) {
      fingers = makeHand(-side, flesh); // palm toward the body, fingers down: the thumb is in front
      hand = fingers.group;
      skinned.push(...fingers.meshes);
    } else {
      hand = new THREE.Mesh(new THREE.SphereGeometry(4.4, 24, 16), flesh);
      if (laid) hand.scale.set(1, 0.46, 1.5); // 8.8 wide, 4 thick, 13 long: the fingers along z, the palm toward −y
      skinned.push(hand);
    }
    group.add(hand);
    arms[s] = { upper: limb(4.7, ARM.upper), fore: limb(4, ARM.fore, real ? 2.9 : 0), hand, fingers, grip: 0, elbow: V(0, 0, 0), at: V(0, 0, 0), sh: J[`sh${s}`], side, target: V(0, 0, 0), bend: null, dir: null, palm: null };
  }
  for (const mesh of skinned) mesh.castShadow = !shell;
  const hang = new THREE.Vector3();
  const hx = new THREE.Vector3();
  const hy = new THREE.Vector3();
  const hz = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  /** The hand, at the end of its arm: a ball on the wrist — or laid, the fingers straight on from the forearm, the palm toward the body. */
  const layHand = (arm) => {
    if (!laid) return arm.hand.position.copy(arm.at);
    hz.copy(arm.dir ?? tmp.subVectors(arm.at, arm.elbow)).normalize();
    hy.copy(arm.palm ?? tmp.set(-arm.side, 0, 0)).multiplyScalar(-1); // the back of the hand
    hy.addScaledVector(hz, -hy.dot(hz));
    if (hy.lengthSq() < 1e-6) hy.set(0, 1, 0).addScaledVector(hz, -hz.y);
    hy.normalize();
    hx.crossVectors(hy, hz);
    arm.hand.quaternion.setFromRotationMatrix(basis.makeBasis(hx, hy, hz));
    // the wrist is where the arm ends: the hand goes on from it (the mitten is centred, the real hand starts at its wrist)
    return arm.hand.position.copy(arm.at).addScaledVector(hz, real ? WRIST : 5);
  };
  /**
   * Put a hand somewhere (in the figure's own frame). `bend`: where the elbow leans — by default
   * down and a little outward. `lay` (flat and real hands): `dir`, where the fingers point, and `palm`,
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

  /** Real hands: close one (`k` 0 open → 1 shut) on a bar of radius `bar` cm lying across its palm. */
  function grip(s, k, bar = 1.4) {
    const arm = arms[s];
    arm.grip = k;
    arm.fingers?.pose(Math.min(1, Math.max(0, k)), bar);
  }
  const gx = new THREE.Vector3();
  const gy = new THREE.Vector3();
  const gz = new THREE.Vector3();
  const wrist = new THREE.Vector3();
  /**
   * Real hands: take hold of a bar. `point`: a point of its axis (the figure's own frame), `axis`:
   * its direction, `bar`: its radius. The wrist goes where a hand closed on it would have it —
   * `palm`: what the palm faces (by default the bar, seen from the shoulder: an overhand grip),
   * `dir`: roughly where the fingers point across it (by default forward, away from the body).
   * `k`: 0 the open hand lies on the bar → 1 it is shut on it. Returns where the wrist is.
   */
  function hold(s, point, axis, { palm, dir, k = 1, bar = 1.4, bend } = {}) {
    const arm = arms[s];
    const c = barIn(bar);
    gx.copy(axis).normalize();
    gy.copy(palm ?? tmp.subVectors(point, arm.sh)).multiplyScalar(-1); // the back of the hand
    gy.addScaledVector(gx, -gy.dot(gx));
    if (gy.lengthSq() < 1e-6) gy.set(0, 1, 0).addScaledVector(gx, -gx.y);
    gy.normalize();
    gz.crossVectors(gx, gy); // across the bar, one way or the other
    // which way across the bar? As told, or forward and a little inward, where a forearm coming from its elbow points.
    // (Never "whichever wrist is nearer the shoulder": with the palm facing the bar both are exactly as near, and the hand flips on rounding.)
    const sign = gz.dot(dir ?? tmp.set(-arm.side * 0.3, 0.2, 1)) < 0 ? -1 : 1;
    wrist.copy(point).addScaledVector(gy, -c.y).addScaledVector(gz, -sign * (c.z + WRIST));
    grip(s, k, bar);
    return reach(s, wrist, bend, { dir: gz.multiplyScalar(sign), palm: gy.multiplyScalar(-1) });
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

  /**
   * Head and hands of glass like the rest (true), or solid again (false). From close, a figure is
   * glass from head to hands: only what the sentence is about stays solid. Switch it on a cut.
   */
  let ghosted = false;
  function ghost(on = true) {
    if (on === ghosted) return;
    ghosted = on;
    for (const mesh of skinned) {
      mesh.material = on ? body : flesh;
      mesh.castShadow = !on && !shell;
      if (shell) asShell(mesh, on ? order : false);
    }
  }

  // what sits it on a floor: hidden until the set wants it (standing: as it is; lying: scale.set(200, 64, 1) under the back)
  const shadow = makeContact();
  shadow.scale.set(46, 34, 1);
  shadow.position.set(0, 0.3, 3);
  shadow.visible = false;
  group.add(shadow);

  if (shell) asShell(panes, order);

  // at rest: standing, both arms hanging
  leg("L", V(8.6, 8, 0));
  leg("R", V(-8.6, 8, 0));
  reach("L", V(20.5, 92, 3));
  reach("R", V(-20.5, 92, 3));

  return { group, torso, head, body, flesh, J, arms, legs, reach, leg, lean, grip, hold, ghost, shadow, skin: skinned, HIP };
}
