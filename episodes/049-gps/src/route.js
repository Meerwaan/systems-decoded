// DOSSIER 049 — GPS : THE ROAD. An ENVELOPE of 025's country road at night (imported as it is, never modified: 025 is
// online), plus what 049 needs (docs/049-decors.md › route.js).
//
//   buildRoad() → { group, road, frame, A, update(p, time, px) }
//     group   add it to the scene (the car's frame: the car never moves, the road scrolls under it)
//     road    025's buildRoute() result (its car of glass, you at the wheel, the road, its paint, the verges, the ditches)
//     frame   the JUNCTION's frame, inside 025's scrolling `slide`: its origin is the junction's near edge on your
//             lane's axis (x along the crossing road, −z beyond it); everything fixed to the junction lives in it
//     A       holder (world.js mounts the phone there), sign, junction, fieldFix, streakHead
//   p = { shell, gap, yaw, lane, steer, rolled, you, branchL, branchR, ditch, sign, streak, holder }
//
// THE T. 025's road is one shader plane, infinite ahead. Its fragment shader is patched on OUR instance (the string,
// before it ever compiles: 025's file is untouched) to stop at the junction's near edge (s < NOSE: in the road's
// coordinates the junction's near edge always sits at s = NOSE) and past your right ditch (the field replaces it).
// Beyond, ONE ground of our own, in the junction's frame, drawn in a shader like 025's (the same grid, the same beams,
// the same paint, aligned on the same s): the crossing road (two lanes, edge lines, dashed centre, the mouth of your
// road and its give-way line), the far verge, a hedge of glass, the dark ploughed field beyond it and on your right
// (furrows ALONG your road: what scrolls never crosses a fine line), the ditch marked signal, the two branches that
// light in turn (a head of ink running out along the lane you would take: left = the far lane, right = the near one).
// 025's roadside posts beyond the junction are hidden; its wood is hidden (open country: the field must read).
// The sign: two arrow-shaped panels on two posts, on the far verge, facing you, white in your beams; no text.
// The holder: a clamp of glass on the dashboard (025's car is X-ray: so is it). The streak: « onze kilomètres de
// lumière », a veille stroke unrolling over the road into the night, a bright head, a trail that thins with distance.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, box, cyl, placed, anchor, edgesOf, mergeGeometries } from "@kit/build3d.js";
import { buildRoute } from "../../025-esp/src/route.js";
import { CAR, PHONE, JUNCTION, FIELD, DITCH, STREAK, ROAD, FIELD_FIX } from "./plan.js";
import { dressRoad } from "./habillage.js"; // the decorator: farms, a village, trees in the hedge, sunglasses on the dash

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const NOSE = CAR.nose;
const ED = ROAD.edge; //            your lane's edge line (x 175)
const MID = (ROAD.edge + ROAD.otherEdge) / 2; // the centre line (x −175)
const OTHER = ROAD.otherEdge; //    the other lane's edge (x −525)
const JW = JUNCTION.w; //           the crossing road: z 0 → −600
const MOUTH = [OTHER - ROAD.verge, ED + ROAD.verge]; // where your road (and its verges) opens into it
const FX0 = FIELD.x0; //            the field on your right starts past the ditch (x 435)
const HEDGE = JUNCTION.hedge; //    z −900
const f1 = (x) => x.toFixed(1);
/** The stroke runs just above the road, at the lamps' reach (plan.js says 9 m: from behind the car that is a laser
 *  into the sky). Asked in docs/journal/049-route.md › « À changer ailleurs »: STREAK.y 450, from −600. */
const STROKE = { ...STREAK, y: 450, from: -600 };

/** How much of the headlamps reaches a point of the car's frame (025's beams). */
const beamAt = (x, z, widen = 1, reach = 2000) => {
  const ahead = NOSE - z;
  if (ahead < -10) return 0;
  const w = (62 + 0.2 * Math.max(ahead, 0)) * widen;
  const bl = (x - 60) / w;
  const br = (x + 60) / w;
  return 0.5 * (Math.exp(-bl * bl) + Math.exp(-br * br)) * smooth(-10, 240, ahead) * Math.exp(-Math.max(ahead, 0) / reach);
};

const GLSL_LINES = /* glsl */ `
  float lines(float x, float cell, float smear) {
    float q = x / cell;
    float f = fwidth(q);
    float w = max(f * 1.5, 1e-5);
    float d = abs(fract(q - 0.5) - 0.5);
    float reach = max(w, 0.5 * smear / cell);
    return (w / reach) * (1.0 - smoothstep(reach - w, reach, d)) * (1.0 - smoothstep(0.12, 0.4, f));
  }
  float band(float d, float halfW) {
    float w = max(fwidth(d), 1e-4);
    float h = max(halfW, 0.9 * w);
    return (halfW / h) * (1.0 - smoothstep(h - 0.6 * w, h + 0.6 * w, abs(d)));
  }
  float dash(float s, float period, float len, float smear) {
    float d = abs(mod(s - 0.5 * len + 0.5 * period, period) - 0.5 * period);
    float e = max(fwidth(s), 0.5 * smear) + 1e-3;
    return 1.0 - smoothstep(0.5 * len - e, 0.5 * len + e, d);
  }`;

/* ───────────────────────────────────────────── 025's road, cut at the junction and past your right ditch */

function cutRoad(road) {
  const slide = road.group.children[0].children[0]; // 025: group › pivot › slide
  const mesh = slide.children[0]; //                   slide.add(road.mesh, rain.mesh, wood.mesh)
  const mat = mesh.material;
  const a = "if (uAmount < 0.003) discard;";
  const b = "uniform vec3 uInk, uSignal;";
  if (!mat.isShaderMaterial || !mat.fragmentShader.includes(a) || !mat.fragmentShader.includes(b)) {
    console.warn("049 route.js: 025's road shader changed — the junction is drawn over an uncut road");
    return slide;
  }
  mat.uniforms.uCutX = { value: FX0 };
  mat.fragmentShader = mat.fragmentShader
    .replace(b, `uniform float uCutX; ${b}`)
    .replace(a, `if (uAmount < 0.003 || vP.y + uScroll < ${f1(NOSE)} || vP.x > uCutX) discard;`);
  return slide;
}

/* ───────────────────────────────────────────── the junction's ground: crossing road, field, ditch, branches */

function makeGround() {
  const uniforms = {
    uInk: { value: new THREE.Color(BRAND.ink) }, uSignal: { value: new THREE.Color(BRAND.signal) },
    uAmount: { value: 1 }, uSmear: { value: 0 }, uDitch: { value: 0 }, uBrL: { value: 0 }, uBrR: { value: 0 }, uTime: { value: 0 },
  };
  const geo = new THREE.PlaneGeometry(64000, 60000).rotateX(-Math.PI / 2).translate(0, 0.6, -2000); // z −32000 … +28000
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vP; varying vec3 vW;
        void main() {
          vP = position.xz;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vW = w.xyz; // the car's frame (049's road set stands at the scene's origin)
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk, uSignal; uniform float uAmount, uSmear, uDitch, uBrL, uBrR, uTime;
        varying vec2 vP; varying vec3 vW;
        ${GLSL_LINES}
        // a turn: straight up your lane (x 0) to the junction, a quarter circle, then out along the branch's lane.
        // Returns (distance to the path, how far along it). side −1 left (far lane, z −450), +1 right (near lane, z −150)
        vec2 path(vec2 p, float side, float r) {
          if (p.y >= 0.0) return vec2(abs(p.x), 300.0 - p.y);
          vec2 c = vec2(side * r, 0.0);
          if (side * (p.x - c.x) < 0.0) {
            vec2 v = p - c;
            float a = atan(-v.y, -side * v.x);
            return vec2(abs(length(v) - r), 300.0 + r * clamp(a, 0.0, 1.5708));
          }
          return vec2(abs(p.y + r), 300.0 + 1.5708 * r + side * (p.x - c.x));
        }
        float branch(vec2 p, float side, float r, float k, float phase) {
          if (k < 0.003) return 0.0;
          vec2 q = path(p, side, r);
          float u = fract(uTime / 1.7 + phase);
          float head = 200.0 + u * 5200.0; // the head runs out 52 m in 1.7 s, then again
          float behind = head - q.y;
          float run = smoothstep(0.0, 0.12, u) * (1.0 - smoothstep(0.75, 1.0, u));
          float trail = behind > 0.0 ? exp(-behind / 900.0) : exp(-behind * behind / 1600.0);
          float lane = exp(-q.x * q.x / 2200.0); //            the lane's width of light (≈ 50 cm)
          float core = band(q.x, 9.0); //                       its thread
          float steady = 0.22 * exp(-max(q.y - 300.0, 0.0) / 4000.0) * smoothstep(-200.0, 400.0, q.y + 300.0);
          float hot = exp(-behind * behind / 9000.0) * run;
          return k * ((core * 0.9 + lane * 0.35) * (steady + 0.9 * trail * run) + 1.4 * hot * lane);
        }
        void main() {
          if (uAmount < 0.003) discard;
          float x = vP.x; float zf = vP.y;
          float s = zf + ${f1(NOSE)}; // 025's coordinate along the road: the grids line up
          vec2 pc = vW.xz;
          float near = length(pc - vec2(0.0, -60.0));
          float far = exp(-near / 3600.0);
          float ahead = ${f1(NOSE)} - pc.y;
          float wB = 62.0 + 0.2 * max(ahead, 0.0);
          float bl = (pc.x - 60.0) / wB; float br = (pc.x + 60.0) / wB;
          float beam = 0.5 * (exp(-bl * bl) + exp(-br * br)) * smoothstep(-10.0, 240.0, ahead) * exp(-max(ahead, 0.0) / 2000.0);
          float lit = 0.22 * exp(-near / 700.0) + 0.04 * far + 0.26 * beam;
          float litPaint = 0.3 * exp(-near / 3000.0) + 0.06 * far + 0.05 + 0.7 * beam;
          float before = step(0.0, zf); //                       this side of the junction
          float right = before * step(${f1(FX0)}, x); //         the field on your right
          float junction = (1.0 - before) * step(${f1(HEDGE)}, zf); // the crossing road and its far verge
          float beyond = step(zf, ${f1(HEDGE)}); //              past the hedge: the far field
          float field = right * smoothstep(250.0, 420.0, zf) + beyond;
          float ink = 0.0;
          // the grid (the crossing road, its verges: there is no floor)
          float g = max(lines(x, 50.0, 0.0), lines(s, 50.0, uSmear)) * 0.38 + max(lines(x, 250.0, 0.0), lines(s, 250.0, uSmear));
          ink += g * lit * (junction + right * (1.0 - smoothstep(250.0, 420.0, zf)));
          // the crossing road's paint: its near edge (open where your road comes in), its far edge, its dashed centre
          float outside = 1.0 - step(${f1(MOUTH[0])}, x) * step(x, ${f1(MOUTH[1])});
          float paint = band(zf + 15.0, 7.5) * outside + band(zf + ${f1(JW - 15)}, 7.5) + band(zf + ${f1(JW / 2)}, 6.5) * dash(x, 1300.0, 300.0, 0.0);
          // your give-way line, across your lane, just before the crossing road
          paint += band(zf - 30.0, 13.0) * dash(x, 100.0, 50.0, 0.0) * step(${f1(MID)}, x) * step(x, ${f1(ED)});
          ink += paint * litPaint * (1.0 - step(zf, ${f1(-JW - 10)})) * step(zf, 50.0);
          // seen from far, the T must read before the beams reach it: its far edge and the hedge's foot keep a little light
          ink += (band(zf + ${f1(JW - 15)}, 9.0) * step(${f1(MOUTH[0] - 3000)}, x) * step(x, ${f1(MOUTH[1] + 3000)})) * 0.22 * (1.0 - far);
          // the field: furrows along your road (90 cm), a faint headland every 2.5 m across
          float rows = lines(x, ${f1(FIELD.rows)}, 0.0) + 0.22 * lines(s, 250.0, uSmear);
          ink += field * rows * (0.4 * exp(-near / 1100.0) + 0.09 * far + 0.02 + 0.8 * beam);
          // where the field meets the crossing road's verge, and the foot of the hedge
          ink += (right * band(zf - 420.0, 4.0) + band(zf - ${f1(HEDGE)}, 4.0)) * (0.2 * far + 0.06 + 0.5 * beam);
          vec3 col = uInk * ink;
          // the ditch marked signal: its outer lip (the field's edge) bright, its inner one fainter, and a little light
          float lips = band(x - ${f1(DITCH[1])}, 6.0) + 0.5 * band(x - ${f1(DITCH[0])}, 4.5);
          float spill = exp(-pow((x - ${f1(DITCH[1])}) / 45.0, 2.0));
          col += uSignal * uDitch * before * (lips * (0.75 + 0.5 * exp(-near / 5000.0)) + 0.14 * spill * (0.4 + far));
          // the two branches, in turn
          vec2 p = vec2(x, zf);
          col += uInk * (branch(p, -1.0, 450.0, uBrL, 0.0) + branch(p, 1.0, 150.0, uBrR, 0.37));
          gl_FragColor = vec4(col * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────── a hedge of glass beyond the crossing road */

function makeHedge() {
  const rand = rng(49);
  const parts = [];
  const blob = new THREE.IcosahedronGeometry(1, 1);
  // a long mass with a ragged top, not a row of domes: big low blobs that overlap, smaller ones riding on them
  for (let x = -16000; x <= 16000; x += 70 + rand() * 40) {
    const h = 70 + rand() * 50;
    const w = 110 + rand() * 70;
    parts.push(placed(blob.clone().scale(w, h, 70 + rand() * 20), { pos: [x, h * 0.75, HEDGE - 70 - rand() * 30], rotY: rand() * 3 }));
    if (rand() < 0.55) {
      const h2 = 40 + rand() * 45;
      parts.push(placed(blob.clone().scale(40 + rand() * 40, h2, 45), { pos: [x + (rand() - 0.5) * 80, 120 + rand() * 50, HEDGE - 80 - rand() * 30], rotY: rand() * 3 }));
    }
  }
  const mat = glass(BRAND.ink, { base: 0.003, rim: 0.09, power: 2.2 });
  const mesh = new THREE.Mesh(mergeGeometries(parts), mat);
  mesh.frustumCulled = false;
  asShell(mesh, 14);
  return { mesh, mat };
}

/* ───────────────────────────────────────────── the direction sign: two arrow panels, white in the beams, no text */

function makeSign() {
  const g = new THREE.Group();
  const W = 150; // a panel's length
  const H = 34; //  its height
  const P = 22; //  its point
  const panelShape = (dir) => {
    // the panel points to `dir` (−1 left, +1 right); x from −W/2 to +W/2, its point included
    const s = new THREE.Shape();
    const tip = dir * (W / 2);
    const back = -dir * (W / 2);
    const neck = tip - dir * P;
    s.moveTo(back, -H / 2);
    s.lineTo(neck, -H / 2);
    s.lineTo(tip, 0);
    s.lineTo(neck, H / 2);
    s.lineTo(back, H / 2);
    s.closePath();
    return s;
  };
  const arrowShape = (dir) => {
    // a bold arrow inside the panel, toward its point
    const s = new THREE.Shape();
    const L = 74;
    const t = 4.5;
    const hw = 11;
    const x0 = -dir * (L / 2) - dir * 8;
    const x1 = dir * (L / 2) - dir * 8;
    const xn = x1 - dir * 15;
    s.moveTo(x0, -t);
    s.lineTo(xn, -t);
    s.lineTo(xn, -hw);
    s.lineTo(x1, 0);
    s.lineTo(xn, hw);
    s.lineTo(xn, t);
    s.lineTo(x0, t);
    s.closePath();
    return s;
  };
  const faceMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(BRAND.ink), transparent: true, opacity: 0, depthWrite: false, fog: false });
  const inkMat = new THREE.MeshBasicMaterial({ color: 0x0c0e10, transparent: true, opacity: 0, fog: false });
  const backMat = new THREE.MeshBasicMaterial({ color: 0x15181b, transparent: true, opacity: 0, side: THREE.BackSide, fog: false });
  const lines = [];
  const rows = [[-1, 196], [1, 154]]; // the left panel above, the right one below
  for (const [dir, y] of rows) {
    const face = new THREE.Mesh(new THREE.ShapeGeometry(panelShape(dir)), faceMat);
    face.position.set(0, y, 0);
    face.renderOrder = 4;
    const back = new THREE.Mesh(new THREE.ShapeGeometry(panelShape(dir)), backMat);
    back.position.set(0, y, -0.6);
    const arrow = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape(dir)), inkMat);
    arrow.position.set(0, y, 0.4);
    arrow.renderOrder = 5;
    g.add(face, back, arrow);
    const outline = new THREE.Mesh(new THREE.ExtrudeGeometry(panelShape(dir), { depth: 2, bevelEnabled: false }));
    const e = edgesOf(outline.geometry, { width: 2, opacity: 0.8 });
    e.position.set(0, y, -2.2);
    lines.push(e);
    g.add(e);
  }
  // two posts
  for (const x of [-48, 48]) {
    const post = edgesOf(box(6, 214, 6, 1), { width: 2, opacity: 0.8 });
    post.position.set(x, 107, -4);
    lines.push(post);
    g.add(post);
  }
  return { group: g, faceMat, inkMat, backMat, lines };
}

/* ───────────────────────────────────────────── the phone's holder: a clamp of glass on the dashboard */

function makeHolder() {
  const holder = new THREE.Group(); // the phone's frame: centre origin, screen +z, top +y
  holder.position.set(...PHONE.at);
  holder.rotation.set(-PHONE.tilt * DEG, PHONE.turn * DEG, 0, "YXZ");
  const mount = new THREE.Group(); // the car's frame: the stem and the base on the dashboard
  const mat = glass(BRAND.ink, { base: 0.03, rim: 0.42, power: 2.2, spec: 0.3 });
  const meshes = [];
  const lines = [];
  const piece = (parent, geometry, pos, rot = [0, 0, 0]) => {
    const m = new THREE.Mesh(geometry, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    const e = edgesOf(geometry, { width: 1.8, opacity: 0.55 });
    e.position.copy(m.position);
    e.rotation.copy(m.rotation);
    parent.add(m, e);
    meshes.push(m);
    lines.push(e);
  };
  const { w, h } = PHONE;
  const back = -0.4 - 0.45; // behind the phone's back
  piece(holder, box(5.4, 6.4, 0.9, 0.3), [0, 0.6, back - 0.1]); //                 the cradle's back plate
  piece(holder, box(w + 2.2, 1.3, 0.8, 0.3), [0, 1.4, back]); //                   the arms across
  for (const s of [-1, 1]) {
    piece(holder, box(1.0, 4.6, 2.2, 0.3), [s * (w / 2 + 0.5), 1.4, -0.2]); //    the side jaws
    piece(holder, box(0.9, 4.6, 0.6, 0.25), [s * (w / 2 + 0.05), 1.4, 0.75]); //  their lips over the screen's edge
    piece(holder, box(1.5, 1.0, 2.2, 0.3), [s * 2.3, -h / 2 - 0.5, -0.2]); //      the feet
    piece(holder, box(1.5, 1.3, 0.6, 0.25), [s * 2.3, -h / 2 - 0.15, 0.75]); //     their lips
  }
  piece(holder, box(6.1, 0.9, 0.8, 0.3), [0, -h / 2 - 0.55, back]); //              the foot bar
  piece(holder, box(1.5, h / 2 - 2.0, 0.8, 0.3), [0, -h / 4 - 1.9, back]); //       the spine
  piece(holder, new THREE.SphereGeometry(1.15, 20, 14), [0, 0.6, back - 1.4]); //  the ball joint
  // the stem: from the ball joint down to the base on the dashboard (025's dash: its top ≈ y 97, z −93 … −67)
  holder.updateMatrix();
  const ball = new THREE.Vector3(0, 0.6, back - 1.4).applyMatrix4(holder.matrix);
  const foot = new THREE.Vector3(PHONE.at[0] - 1, 98.4, PHONE.at[2] - 9);
  const dir = new THREE.Vector3().subVectors(ball, foot);
  const len = dir.length();
  const stem = new THREE.Group();
  stem.position.copy(foot);
  stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  piece(stem, cyl(0.75, len, 0.2, 20), [0, len / 2, 0]);
  piece(stem, cyl(1.2, 2.2, 0.3, 24), [0, 1.1, 0]); //   the collar
  mount.add(stem);
  piece(mount, cyl(3.6, 1.2, 0.4, 40), [foot.x, foot.y - 0.5, foot.z], [-6 * DEG, 0, 0]); // the base on the dash
  asShell(meshes, 24);
  return { holder, mount, mat, lines };
}

/* ───────────────────────────────────────────── « onze kilomètres de lumière » */

function makeStreak() {
  const VEILLE = new THREE.Color(BRAND.veille);
  const u = {
    uColor: { value: VEILLE }, uAmount: { value: 0 }, uFrom: { value: STROKE.from }, uL: { value: 1 }, uY: { value: STROKE.y },
    uFocal: { value: 1600 }, uR: { value: 14 }, uMinPx: { value: 5 },
  };
  // a tube along −z: position.y (0 … 1) is how far along it, (x, z) the unit circle around it
  const geo = new THREE.CylinderGeometry(1, 1, 1, 12, 400, true).translate(0, 0.5, 0);
  const tube = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms: u,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      vertexShader: /* glsl */ `
        uniform float uFrom, uL, uY, uFocal, uR, uMinPx;
        varying float vAlong; varying float vFace; varying float vDist;
        void main() {
          float along = position.y;
          float a = pow(along, 2.2); // the segments crowd near the car, where the stroke is big on screen
          vec3 c = vec3(0.0, uY, uFrom - a * uL);
          vec4 cw = modelMatrix * vec4(c, 1.0);
          float dist = length(cameraPosition - cw.xyz);
          float r = max(uR, uMinPx * dist / uFocal); // never thinner than ≈ 2.6 px across
          vec3 p = c + vec3(position.x * r, position.z * r, 0.0);
          vec4 w = modelMatrix * vec4(p, 1.0);
          vec3 n = normalize(mat3(modelMatrix) * vec3(position.x, position.z, 0.0));
          // across the stroke as the eye sees it: the view direction stripped of its part along the axis (seen end-on
          // down the road, the plain facing would be zero everywhere)
          vec3 ax = normalize(mat3(modelMatrix) * vec3(0.0, 0.0, 1.0));
          vec3 v = cameraPosition - w.xyz;
          v -= ax * dot(v, ax);
          vFace = abs(dot(n, v / max(length(v), 1e-3)));
          vAlong = a;
          vDist = dist;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount, uL;
        varying float vAlong; varying float vFace; varying float vDist;
        void main() {
          float f = clamp(vFace, 0.0, 1.0);
          float core = 1.3 * pow(f, 14.0) + 0.22 * pow(f, 2.0); // a hot thread inside a soft sheath
          float toHead = (1.0 - vAlong) * uL;
          float k = 0.55 + 1.1 * exp(-toHead / 1800.0); // brighter toward its head
          k *= 0.35 + 0.65 * exp(-vDist / 90000.0); //      the trail sinks into the night
          k *= smoothstep(0.0, min(3200.0, 0.5 * uL), vAlong * uL); // it rises out of the dark ahead: nothing bright climbs over the camera into the header
          gl_FragColor = vec4(uColor * core * k * uAmount, 1.0);
        }`,
    }),
  );
  tube.frustumCulled = false;
  tube.renderOrder = 8;
  // its head: a light that has a place (a hot core, a soft halo), never smaller than a few pixels
  const hu = { uColor: { value: VEILLE }, uAmount: { value: 0 }, uFocal: { value: 1600 }, uR: { value: 90 }, uMinPx: { value: 34 } };
  const head = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: hu,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uFocal, uR, uMinPx; varying vec2 vQ;
        void main() {
          vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float dist = max(-mv.z, 1.0);
          float r = max(uR, uMinPx * dist / uFocal);
          mv.xy += position.xy * r;
          vQ = position.xy;
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
        void main() {
          float q = dot(vQ, vQ);
          float k = 2.2 * exp(-q * 30.0) + 0.45 * exp(-q * 5.0);
          gl_FragColor = vec4(uColor * k * uAmount * (1.0 - smoothstep(0.7, 1.0, q)), 1.0);
        }`,
    }),
  );
  head.frustumCulled = false;
  head.renderOrder = 9;
  return { tube, head, u, hu };
}
/** How far the stroke has unrolled at `k` (0 … 1): 4 m, 190 m at half, the whole 4 km at the end (it leaves fast). */
const unrolled = (k) => (STROKE.from - STROKE.to) * (Math.exp(6 * k) - 1) / (Math.exp(6) - 1);

/* ───────────────────────────────────────────── the envelope */

export function buildRoad() {
  const road = buildRoute();
  const group = new THREE.Group();
  group.add(road.group);
  // 025's wood: hidden (its instanced trees carry the `aTree` attribute)
  road.group.traverse((o) => { if (o.geometry?.attributes?.aTree) o.visible = false; });
  const slide = cutRoad(road);
  const wood = slide.children.find((o) => o.geometry?.attributes?.aTree); // 025 shows it again on every update
  const dress = slide.children.find((c) => c.name === "habillage"); // 025's posts, sign and borne: none past the junction
  const frame = new THREE.Group(); // the junction's near edge, on your lane's axis
  slide.add(frame);
  const A = {};

  const ground = makeGround();
  frame.add(ground.mesh);
  const hedge = makeHedge();
  frame.add(hedge.mesh);
  const sign = makeSign();
  sign.group.position.set(...JUNCTION.sign);
  frame.add(sign.group);
  A.sign = anchor(sign.group, 0, 175, 0);
  A.junction = anchor(frame, 0, 0, -JW / 2);
  A.fieldFix = anchor(group, ...FIELD_FIX);

  const hold = makeHolder();
  group.add(hold.holder, hold.mount);
  A.holder = hold.holder; // world.js mounts the phone here (the phone's own frame: screen +z, top +y)

  const streak = makeStreak();
  group.add(streak.tube, streak.head);
  A.streakHead = streak.head;
  const life = dressRoad(); frame.add(life.far); group.add(life.cab); // habillage.js

  return {
    group, road, frame, A,
    update({ shell = 1, gap = 97, yaw = 0, lane = 0, steer = 0, rolled = 0, you = 1, branchL = 0, branchR = 0, ditch: dk = 0, sign: sg = 0,
      streak: sk = 0, holder: hd = 1 } = {}, time = 0, px = 1600) {
      const sh = clamp01(shell);
      road.update({ shell: sh, gap, lane, yaw, aim: yaw, steer, kmh: 70, rolled, rain: 0, boar: 0, moose: 0, you, slide: 0, arrows: 0,
        alarm: 0, moment: 0, gas: 1, tip: 0, rocket: 0, bFR: 0 }, time, px);
      const zJ = NOSE - 100 * gap; // the junction's near edge, in the road's frame
      frame.position.z = zJ;
      if (wood) wood.visible = false;
      if (dress) for (const c of dress.children) c.visible = c.position.z > zJ + 40;

      const u = ground.uniforms;
      ground.mesh.visible = sh > 0.003;
      u.uAmount.value = sh;
      u.uSmear.value = (70 / 3.6) * 100 * (0.5 / 30); // 025's: what goes by while the shutter is open
      u.uDitch.value = clamp01(dk);
      u.uBrL.value = clamp01(branchL);
      u.uBrR.value = clamp01(branchR);
      u.uTime.value = time;
      hedge.mesh.visible = sh > 0.003;
      hedge.mat.uniforms.uAmount.value = sh;
      life.update({ shell: sh }, time, px); // habillage.js

      // the sign: in your beams it comes up white; otherwise a faint shape against the night
      const th = yaw * DEG;
      const co = Math.cos(th);
      const si = Math.sin(th);
      const qx = JUNCTION.sign[0] + lane * 100;
      const qz = zJ + JUNCTION.sign[2];
      const lit = beamAt(qx * co - qz * si, qx * si + qz * co, 1.6, 6000);
      const s = clamp01(sg) * sh;
      sign.group.visible = s > 0.003;
      sign.faceMat.opacity = s * (0.16 + 0.8 * Math.min(1, 2.2 * lit));
      sign.inkMat.opacity = s * 0.95;
      sign.backMat.opacity = s * 0.8;
      for (const l of sign.lines) l.material.opacity = s * 0.75;

      const h = clamp01(hd) * sh;
      hold.holder.visible = hold.mount.visible = h > 0.003;
      hold.mat.uniforms.uAmount.value = h;
      for (const l of hold.lines) l.material.opacity = 0.55 * h;

      const k = clamp01(sk);
      const L = Math.max(1, unrolled(k));
      streak.tube.visible = streak.head.visible = k > 0.001;
      streak.u.uAmount.value = smooth(0, 0.03, k);
      streak.u.uL.value = L;
      streak.u.uFocal.value = px;
      streak.hu.uAmount.value = smooth(0, 0.03, k) * (1 - 0.5 * smooth(0.9, 1, k));
      streak.hu.uFocal.value = px;
      streak.head.position.set(0, STROKE.y, STROKE.from - L);
    },
  };
}
