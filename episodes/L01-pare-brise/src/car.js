// DOSSIER L01 — the CAR and the ROAD: 011's car and 014's street, IMPORTED as they are (no copy), wrapped.
//
//   buildCars() → { crash, road, screen, roadScreen, sideMount, A, update(p, time, px) }
//     crash        { group } — 011's buildCar(): the car seen like an X-ray, the wall ahead, the crash (`crush`: the
//                  world comes to the car, the nose folds), its airbags (kept at 0 here: this film is the windshield's,
//                  and the hook is a head that reaches the glass). 011's own driver is kept hidden, and its belt:
//                  YOU are drawn here (a figure of glass of our own, which can lunge), and the belt does not exist
//                  in this film — the windshield is the subject
//     road         { group } — 014's buildStreet(): the same body at the same place (CAR is the same in 011 and 014),
//                  the road scrolling under it, 014's own driver at the wheel; its truck and its rain are kept at 0
//     screen       an Object3D in the CRASH car, in the windshield's PANE FRAME (verre.js: x toward the passenger, y up
//                  the slant, z toward the inside), at the chord's centre between plan.js · MOUNT.foot and MOUNT.top —
//                  world.js parents the hero windshield (and casse's "plain" pane) to it
//     roadScreen   the same, in the ROAD car
//     sideMount    the driver's side window's PANE FRAME in the driver's door (plan.js · SIDE: x toward the car's front,
//                  y up, leaning in at the top, z toward the inside) — in the crash car; world.js parents the side window to it
//     A            anchors: head (yours — it follows the lunge), wheel, door, roadHead, tip (the window-breaker's point)
//   p = { which (0 crash · 1 road), shell, wall, crash, lunge, you, tool, kmh, drive, sideOn, plain }
//     lunge   0 seated, hands on the wheel → 1 your head against the windshield's inner face, exactly at IMPACT.head:
//             the hips rise off the seat, the trunk pitches over the wheel, the neck bends — a pose SOLVED at build
//             time against the rim of 011's steering wheel (the trunk never goes through it, the head clears it)
//     you     0 nobody · 1 you, a body of glass from the head to the hands (from close, nothing of you is solid)
//     tool    0 your left hand on the wheel · → 0.3 it rises toward the side window, empty · 0.3 → 0.45 the
//             window-breaker is in it · 0.5 raised, wound back · → 1 its point strikes the side window at IMPACT.side
//     sideOn  0.5+: the side window is ours (verre.js): the door's own pane is cut away under it
//
// The car's own panes are cut away where ours stand: the windshield always (the hero, or casse's plain pane, takes
// its place), the driver's side window when `sideOn` > 0.5 — the shaders of 011's and 014's bodies are patched on
// their instances (their files are not touched): what was a pane there is discarded, its frame lines stay.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glass, asShell, box, cyl, makePart, addMesh, setPartOpacity, anchor } from "@kit/build3d.js";
import { buildCar } from "../../011-fusible-pyro/src/car.js";
import { buildStreet } from "../../014-abs/src/street.js";
import { MOUNT, SIDE, WS, IMPACT, YOU } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────── the panes of 011 / 014 that ours replace ───────────────────────── */

// The body glass of 011 and 014 knows its panes by `vUV` (z along the car, the row of its section). The windshield
// is the front of the roof's glass (z < −13.5: the bar between it and the glass roof stands at −17 … −10); the
// driver's side window is the side glass on −x ahead of the B-pillar (z < 43).
const PANE_CUT = /* glsl */ `
        float cutScreen = topPane * (1.0 - smoothstep(-15.0, -12.5, z)) * uCutScreen;
        float cutSide = sidePane * step(vP.x, 0.0) * (1.0 - smoothstep(41.0, 43.5, z)) * uCutSide;
        if (max(cutScreen, cutSide) > 0.5) discard;`;
function cutPanes(group, uniforms) {
  const done = new Set();
  group.traverse((o) => {
    const mats = o.material ? [o.material].flat() : [];
    for (const m of mats) {
      if (done.has(m) || !m.isShaderMaterial || !m.fragmentShader.includes("float pane = max(sidePane, topPane);")) continue;
      done.add(m);
      m.fragmentShader = m.fragmentShader
        .replace("uniform vec3 uColor", "uniform float uCutScreen, uCutSide; uniform vec3 uColor")
        .replace("float pane = max(sidePane, topPane);", `float pane = max(sidePane, topPane);${PANE_CUT}`);
      m.uniforms.uCutScreen = uniforms.screen;
      m.uniforms.uCutSide = uniforms.side;
      m.needsUpdate = true;
    }
  });
  return done.size;
}

/** A PANE FRAME at the windshield's place in a car group. */
function screenFrame(parent) {
  const o = new THREE.Object3D();
  const foot = V(...MOUNT.foot);
  const top = V(...MOUNT.top);
  o.position.copy(foot).add(top).multiplyScalar(0.5);
  const y = top.clone().sub(foot).normalize();
  const x = V(1, 0, 0);
  const z = V().crossVectors(x, y).normalize(); // toward the inside (down and back)
  o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  parent.add(o);
  o.updateMatrix();
  return o;
}

/** A point of the bent windshield (verre.js' mid-plane, offset `off` along its normal toward the inside), in the car. */
let SURF = null; // verre.js · glass.hero.onSurface, handed by world.js (buildCars({ surface })): the very bend the glass is drawn with
function onScreen(frame, x, y, off, out, outN) {
  const u = (2 * x) / WS.w;
  const v = (2 * y) / WS.h;
  const n = V((-WS.sag * 4 * x) / (WS.w * WS.w), (-WS.sagV * 4 * y) / (WS.h * WS.h), 1).normalize();
  if (SURF) SURF(x, y, out, n).addScaledVector(n, off).applyMatrix4(frame.matrix);
  else out.set(x, y, -(WS.sag * (1 - u * u) + WS.sagV * (1 - v * v))).addScaledVector(n, off).applyMatrix4(frame.matrix);
  if (outN) outN.copy(n).applyQuaternion(frame.quaternion);
  return out;
}

/* ───────────────────────── the lunge, solved against the steering wheel ───────────────────────── */

// 011's steering wheel (its car.js: WHEEL, TILT 22°, rim 18.5, tube 1.6) and your seat (hips reclined 24°)
const HUB = V(-37, 98, -34);
const TILT = 22 * DEG;
const AXIS = V(0, Math.sin(TILT), Math.cos(TILT)); // its column, toward you
const RIM = { r: 18.5, e1: V(1, 0, 0), e2: V().crossVectors(AXIS, V(1, 0, 0)) };
const SEAT = V(YOU.head[0], 48, YOU.head[2] - 31); // your hips, at rest
const REST = { hy: SEAT.y, hz: SEAT.z, th: -24, ph: 0 };
// the figure's trunk (kit/lib/figure.js · TRUNK, its radius by height; squeezed to 0.62 front to back) and its head
const TRUNK = [[0.1, 86], [11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5], [4.8, 155.5], [0.1, 155.5]];
const HEAD_R = 10.4;
const NECK = 61.5; // the neck's base above the hips, in the trunk; the head's centre stands 15 above it (and 1 forward)
function trunkR(Y) {
  if (Y < 86 || Y > 155.5) return 0;
  for (let i = 1; i < TRUNK.length; i++) {
    const [r0, y0] = TRUNK[i - 1];
    const [r1, y1] = TRUNK[i];
    if (Y <= y1 && y1 > y0) return r0 + ((r1 - r0) * (Y - y0)) / (y1 - y0);
  }
  return 0;
}
/** The head's centre in the trunk's frame (above the hips), its neck bent forward by `ph` degrees. */
const headIn = (ph, out) => out.set(0, NECK + 15 * Math.cos(ph * DEG) - Math.sin(ph * DEG), 15 * Math.sin(ph * DEG) + Math.cos(ph * DEG));

function solveLunge(target) {
  const rim = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * 2 * Math.PI;
    return HUB.clone().addScaledVector(RIM.e1, RIM.r * Math.cos(a)).addScaledVector(RIM.e2, RIM.r * Math.sin(a));
  });
  const h = V();
  const q = { hy: 0, hz: 0, th: 0, ph: 0 };
  const lerpQ = (a, b, k, o) => ((o.hy = mix(a.hy, b.hy, k)), (o.hz = mix(a.hz, b.hz, k)), (o.th = mix(a.th, b.th, k)), (o.ph = mix(a.ph, b.ph, k)), o);
  const headCar = (s, out) => {
    headIn(s.ph, h);
    const c = Math.cos(s.th * DEG);
    const n = Math.sin(s.th * DEG);
    return out.set(SEAT.x, s.hy + h.y * c - h.z * n, s.hz - (h.y * n + h.z * c));
  };
  // how far the rim gets into the trunk (cm; > 0 inside)
  const into = (s) => {
    let worst = -99;
    const c = Math.cos(s.th * DEG);
    const n = Math.sin(s.th * DEG);
    for (const p of rim) {
      const fx = -(p.x - SEAT.x);
      const fy = p.y - s.hy;
      const fz = -(p.z - s.hz);
      const ty = c * fy + n * fz;
      const tz = -n * fy + c * fz;
      const r = trunkR(ty + 90);
      if (r <= 0) continue;
      worst = Math.max(worst, (1 - Math.hypot(fx / r, tz / (0.62 * r))) * 0.62 * r + 1.6);
    }
    return worst;
  };
  const m = { hy: 0, hz: 0, th: 0, ph: 0 };
  const hc = V();
  let best = null;
  for (let th = -24; th <= 40; th += 1) {
    for (let ph = 0; ph <= 50; ph += 2) {
      headIn(ph, h);
      const c = Math.cos(th * DEG);
      const n = Math.sin(th * DEG);
      q.hy = target.y - (h.y * c - h.z * n);
      q.hz = target.z + (h.y * n + h.z * c);
      q.th = th;
      q.ph = ph;
      if (q.hy < 46 || q.hy > 72 || q.hz > -8 || q.hz < -40) continue;
      let pen = 0;
      let head = 0;
      for (let k = 0; k <= 1.0001; k += 0.05) {
        lerpQ(REST, q, k, m);
        pen = Math.max(pen, into(m));
        headCar(m, hc);
        for (const p of rim) head = Math.max(head, HEAD_R + 1.6 - hc.distanceTo(p));
      }
      const cost = 10 * Math.max(0, pen) + 10 * Math.max(0, head) + 0.5 * Math.hypot(q.hy - REST.hy, q.hz - REST.hz) + 0.15 * ph;
      if (!best || cost < best.cost) best = { cost, ...q, pen, head };
    }
  }
  return best;
}

/* ───────────────────────── the window-breaker ───────────────────────── */

// Its own frame: the grip at the origin, the handle along +y (12 long), the steel head across at the top, its point at +x.
const BREAKER = { handle: 12, head: 7.5, tip: V(5.2, 7.5, 0) };
function makeBreaker() {
  const part = makePart("breaker");
  const body = solid(BRAND.signal, { rough: 0.5 }); // moulded plastic: what strikes is signal
  const steel = solid(0xb9bcbd, { rough: 0.32, metal: 0.45 });
  addMesh(part, cyl(1.45, BREAKER.handle, 0.4, 28), body, { pos: [0, 0, 0], edgeOpacity: 0.55, edgeWidth: 1.8 });
  addMesh(part, box(9, 3.2, 2.8, 0.5), body, { pos: [0, BREAKER.head, 0], edgeOpacity: 0.55, edgeWidth: 1.8 });
  // the two steel points
  for (const s of [1, -1]) {
    const tip = new THREE.ConeGeometry(1.05, 1.9, 20).rotateZ((-s * Math.PI) / 2);
    addMesh(part, tip, steel, { pos: [s * 5.4, BREAKER.head, 0], edges: false });
  }
  return part;
}

export function buildCars({ surface = null } = {}) {
  SURF = surface;
  const crash = buildCar();
  const road = buildStreet();
  const screen = screenFrame(crash.group);
  const roadScreen = screenFrame(road.group);

  const sideMount = new THREE.Object3D();
  sideMount.position.set(...SIDE.at);
  const l = SIDE.lean * DEG;
  const sx = V(0, 0, -1); // toward the car's front
  const sy = V(Math.sin(l), Math.cos(l), 0); // up, leaning in
  const sz = V().crossVectors(sx, sy).normalize(); // toward the inside (+x)
  sideMount.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(sx, sy, sz));
  crash.group.add(sideMount);
  sideMount.updateMatrix();

  /* the panes ours replace */
  const cut = { screen: { value: 1 }, side: { value: 0 } };
  const roadCut = { screen: { value: 1 }, side: { value: 0 } };
  cutPanes(crash.group, cut);
  cutPanes(road.group, roadCut);
  // no belt in this film (it is 011's driver's, and the windshield is the subject)
  if (crash.fx?.belt) crash.fx.belt.visible = false;

  /* YOU: a figure of glass at 011's driver's place, which can lunge */
  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.8, through: 0.2 });
  you.ghost(true); // from close, a figure is glass from the head to the hands
  // the head: the same glass, a little crisper (it is what the first frame is about)
  you.head.material = glass(BRAND.ink, { base: 0.004, rim: 0.7, power: 2.3, edge: 0.62, spec: 0.9, through: 0.22 });
  asShell(you.head, 10);
  you.group.rotation.y = Math.PI; // you look toward the nose (−z): your left is the door (−x)
  crash.group.add(you.group);

  // where your head meets the glass: the windshield's inner face at IMPACT.head, your head's radius in from it
  const contact = V();
  const normal = V();
  onScreen(screen, IMPACT.head[0], IMPACT.head[1], WS.drawn.glass + WS.drawn.film / 2, contact, normal);
  const HEAD_AT = contact.clone().addScaledVector(normal, HEAD_R + 0.15);
  const LUNGE = solveLunge(HEAD_AT);
  const headRest = V(0, 76.5, 1);

  // the side window: where the breaker's point strikes (its inner face at IMPACT.side), and which way is "into the glass"
  const sideHit = V(IMPACT.side[0], IMPACT.side[1], 0.7).applyMatrix4(sideMount.matrix);
  const sideIn = V(0, 0, 1).applyQuaternion(sideMount.quaternion); // toward the inside of the car
  const breaker = makeBreaker();
  crash.group.add(breaker);
  const tipAnchor = anchor(breaker, BREAKER.tip.x, BREAKER.tip.y, BREAKER.tip.z);

  // in your own frame (x and z turned round), from the car's
  let gx = 0;
  let gy = 0;
  let gz = 0;
  const mine = (x, y, z, out) => out.set(-(x - gx), y - gy, -(z - gz));
  const mineDir = (d, out) => out.set(-d.x, d.y, -d.z);
  const RIM_AXIS = V(-RIM.e2.x, RIM.e2.y, -RIM.e2.z);
  const OVER_RIM = V(AXIS.x, -AXIS.y, AXIS.z);
  const PALMS = { L: V(-1, 0, 0), R: V(1, 0, 0) };
  const KNEE = V(0, 1, 0.3);
  const TOE = V(0, 0.55, 0.85);
  const v1 = V();
  const v2 = V();
  const v3 = V();
  const v4 = V();
  const bx = V();
  const by = V();
  const bz = V();
  const bm = new THREE.Matrix4();
  const tipOff = V();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  // the breaker's two poses: raised (tool 0.5), and struck (tool 1, its point on the glass)
  const BK = { raised: { pos: V(), q: new THREE.Quaternion() }, struck: { pos: V(), q: new THREE.Quaternion() } };
  {
    // struck: its point toward the glass (−x, along −sideIn), the handle up and a little toward you
    bx.copy(sideIn).negate();
    by.set(0, 1, 0.35).addScaledVector(bx, -by.dot(bx)).normalize();
    bz.crossVectors(bx, by);
    BK.struck.q.setFromRotationMatrix(bm.makeBasis(bx, by, bz));
    tipOff.copy(BREAKER.tip).applyQuaternion(BK.struck.q);
    BK.struck.pos.copy(sideHit).sub(tipOff);
    // raised: wound back 16 cm into the car, 7 up, 6 toward the back, tipped back 35°
    qa.setFromAxisAngle(bz, 35 * DEG);
    BK.raised.q.copy(qa).multiply(BK.struck.q);
    BK.raised.pos.copy(BK.struck.pos).addScaledVector(sideIn, 16).add(v1.set(0, 7, 6));
  }
  const bkPos = V();
  const bkQ = new THREE.Quaternion();

  function poseYou(lunge, tool) {
    const e = clamp01(lunge);
    const kHip = smooth(0, 0.7, e); // the hips leave the seat first…
    const kTrunk = smooth(0.05, 1, e); // …the trunk pitches over the wheel…
    const kNeck = smooth(0.45, 1, e); // …the neck gives last
    const hy = mix(REST.hy, LUNGE.hy, kHip);
    const hz = mix(REST.hz, LUNGE.hz, kHip);
    const th = mix(REST.th, LUNGE.th, kTrunk);
    const ph = mix(REST.ph, LUNGE.ph, kNeck);
    gx = SEAT.x;
    gy = hy - you.HIP;
    gz = hz;
    you.group.position.set(gx, gy, gz);
    you.leg("L", mine(-48, 40, -90, v1), KNEE, TOE);
    you.leg("R", mine(-29, 41, -95, v1), KNEE, TOE);
    you.lean(th, 0, 0);
    // the head: on its neck, bent by `ph` — at lunge 1 exactly at HEAD_AT
    headIn(ph, v1);
    you.head.position.set(0, v1.y, v1.z);
    if (e >= 0.999) {
      // land it exactly (the solver's grid is 1° / 2°): the last few millimetres, in the trunk's own frame
      you.torso.updateMatrix();
      mine(HEAD_AT.x, HEAD_AT.y, HEAD_AT.z, v2);
      v2.applyMatrix4(you.torso.matrix.clone().invert());
      you.head.position.copy(v2);
    }
    // the hands: a quarter past nine on the rim; as the trunk goes over the wheel they leave it, forward and apart
    const off = smooth(0.35, 0.9, e);
    for (let i = 0; i < 2; i++) {
      const s = i ? "R" : "L";
      if (s === "L" && tool > 0.001) continue;
      const sx = i ? 1 : -1;
      v1.copy(HUB).addScaledVector(RIM.e1, sx * RIM.r * 0.985).addScaledVector(RIM.e2, RIM.r * 0.17);
      v1.x += sx * 16 * off;
      v1.y += 4 * off;
      v1.z -= 14 * off;
      you.hold(s, mine(v1.x, v1.y, v1.z, v2), RIM_AXIS, { palm: PALMS[s], dir: OVER_RIM, k: mix(0.92, 0.3, off), bar: 1.6 });
    }
    // the left hand and the breaker
    breaker.visible = tool > 0.3;
    if (tool > 0.001) {
      // where the hand holds: from the rim (tool 0) up to the raised breaker (0.5), then the strike (→ 1, accelerating)
      if (tool <= 0.5) {
        bkPos.copy(BK.raised.pos);
        bkQ.copy(BK.raised.q);
      } else {
        const k = ((tool - 0.5) / 0.5) ** 2;
        bkPos.lerpVectors(BK.raised.pos, BK.struck.pos, k);
        bkQ.slerpQuaternions(BK.raised.q, BK.struck.q, k);
      }
      breaker.position.copy(bkPos);
      breaker.quaternion.copy(bkQ);
      setPartOpacity(breaker, smooth(0.3, 0.45, tool));
      by.set(0, 1, 0).applyQuaternion(bkQ); // the handle's axis
      const rise = smooth(0, 0.5, tool);
      v1.copy(HUB).addScaledVector(RIM.e1, -RIM.r * 0.985).addScaledVector(RIM.e2, RIM.r * 0.17); // the rim, a quarter past nine
      v3.copy(RIM.e2).lerp(by, rise).normalize();
      v1.lerp(bkPos, rise);
      mineDir(v3, v4);
      you.hold("L", mine(v1.x, v1.y, v1.z, v2), v4, { k: mix(0.92, 1, rise), bar: rise > 0.6 ? 1.45 : 1.6, dir: mineDir(sideIn.clone().negate(), v3), palm: undefined });
    }
  }
  let last = { l: -1, t: -1 };

  const A = { head: anchor(you.head, 0, 0, 0), wheel: crash.A.wheel, door: crash.A.doorHandle, roadHead: road.A.head, tip: tipAnchor, contact: anchor(crash.group, contact.x, contact.y, contact.z) };

  return {
    crash, road, screen, roadScreen, sideMount, A, you, lunge: LUNGE,
    update(p, time, px) {
      if (p.which === 1) {
        roadCut.side.value = p.sideOn > 0.5 ? 1 : 0;
        road.update({ shell: p.shell, gap: 5000 - p.drive, lane: 0, yaw: 0, steer: 0, dive: 0, rain: 0, truck: 0, skid: 0, you: p.you, kmh: p.kmh, rolled: (p.drive * 100) / 34, brake: 0, pulse: 0 }, time, px);
      } else {
        cut.side.value = p.sideOn > 0.5 ? 1 : 0;
        crash.update({ shell: p.shell, wall: p.wall, you: 0, crush: p.crash, debris: 0, bags: 0, rescuer: 0, reach: 0, live: 0 }, time, px);
        you.group.visible = p.you > 0.5;
        const t = clamp01(p.tool ?? 0);
        const lg = clamp01(p.lunge ?? 0);
        if (lg !== last.l || t !== last.t) {
          poseYou(lg, t);
          last.l = lg;
          last.t = t;
        }
        if (!(t > 0.001)) breaker.visible = false;
      }
    },
  };
}
