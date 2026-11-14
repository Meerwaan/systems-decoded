// DOSSIER L07 — voyage.js : THE JOURNEY, X-ray (docs/L07-decors.md · voyage.js). Two places in one file:
//
//   buildVoyage() → { mer: { group, A, update(S, time, px), fog(d) }, terre: { group, A, update(S, time, px), fog(d) } }
//   mer.group    the MER place: the surface at y = 0, the coast at x = 0, the open sea toward −x, the cable on z = 0
//   mer.A        shipStern, cableTouch, plough, repeater, anchor, fault, grapnel, loop (Object3D, moved by update)
//   mer.update   reads: ship, sail, pay, plough, amp, anchor, fault, grapnel, mend, loop, pulse, flow, mood
//   terre.group  the TERRE place: the ground at y = 0, the beach from x = 0, the street along +x
//   terre.A      beachDuct, landing, central, pit, blowHead, crushed, cabinet, homes[32], building, box, socket, pinch
//   terre.update reads: beach, ducts, blow, crushed, homes, talk, landing, room, pinch, pulse, flow, mood
//
// THE CABLE IS ALWAYS THE SUBJECT: a dark full tube with light edges, the light of its pulses running in its core
// (veille: a bright head, a long trail). It is drawn as a RIBBON that faces the eye (its true width, never under
// 3 px — a 20 cm cable seen from 130 m is still a line you can follow), shaded like a tube, recomputed on the CPU only
// when its shape changes (a few hundred points; update() is called sixteen times per frame and allocates nothing).
// Everything around it is glass and lines:
//   MER    034's Atlantic (034-boite-noire/src/fond.js, imported as it is, never edited — as 038/mer.js does): its
//          marine snow (masked above the surface by one line patched into ITS copy of the shader) and its surface seen
//          from below. Its wreck, its flat floors, its water column, its beam are taken out once built. Ours: the
//          bottom (a grid of lines draped on the profile `bottomAt`, contours on the slope, a few boulders of glass),
//          the surface seen from above (fine swell lines), the cable ship (a glass hull lofted by sections, its two
//          tanks with the cable coiled in them, solid, the stern sheave, the bridge forward), the cable paid out in a
//          catenary to the bottom, the plough (it lifts the cable into the trench it opens, the lips close behind),
//          the repeaters (solid bulges; `amp`: the light arrives weak and leaves full), the anchor (signal, its chain;
//          it hooks the cable and drags it into a V; `fault`: it breaks, the light stops there), the grapnel (dragged
//          across, it hooks, hauls one end up to the bow; `mend` the new length spliced in at the top; `loop`: the
//          bight goes back down and lies flat in a wide loop).
//   TERRE  the ground grid (sand stippled on the beach, swell lines on the water, the seabed in lines), the drilled
//          duct under the beach and the landing chamber, the central office, the street (kerbs, pavements), under it
//          the bundle of OLD telephone ducts (one holds an old copper cable), the pulling pit and its blower with
//          its drum, the head of the new cable blown along a duct (air streaks overtaking it), the crushed duct
//          (signal) it butts against, the street cabinet with its doors open and its cassettes, the 32 homes (houses
//          and small blocks of flats of glass, a window per home, a drop cable per home under the pavement), your
//          building (its glass fades; the box on the landing, the riser, the last fine cable up to your flat), your
//          room (the wall, the socket and its green connector, the cupboard of glass on its solid feet, your box —
//          solid, three greys, seen from behind: its ports, the green connector — and the fine cord between them:
//          `pinch` 0 a gentle curve beside the foot, 1 folded under it, a signal glow at the fold).
// No size is drawn anywhere (plan.js: models). Three colours: veille the light, signal the threat, ink the structure.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glass, asShell, lineMat, edgesOf, box, cyl, lathe } from "@kit/build3d.js";
import { xray } from "@kit/usine.js";
import { buildFond } from "../../034-boite-noire/src/fond.js"; // 034's Atlantic at night (imported as it is, never edited)
import { SEA, SHIP, LAND } from "./plan.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const ease = (u) => {
  const v = clamp01(u);
  return v * v * (3 - 2 * v);
};

/** The bottom's height at x (MER). Exported by the architect's stand-in: kept as it is (the chapters may read it). */
export function bottomAt(x) {
  if (x >= SEA.coastFoot) return lerp(SEA.shelf, 0, Math.min(1, (x - SEA.coastFoot) / -SEA.coastFoot));
  if (x >= SEA.shelfEdge) return SEA.shelf;
  if (x >= SEA.abyss) return lerp(SEA.deep, SEA.shelf, (x - SEA.abyss) / (SEA.shelfEdge - SEA.abyss));
  return SEA.deep;
}
/** The same profile, smoothed at its corners (what the cable and the grid are draped on). */
function floorAt(x) {
  const k = 260;
  return (bottomAt(x - k) + 2 * bottomAt(x) + bottomAt(x + k)) / 4;
}

/* ═════════════════════════════ shared pieces ═════════════════════════════ */

const VIEW = new THREE.Vector2(1920, 1080); // set from BRAND in buildVoyage (landscape.js sets it at import)

/** Many segments ([x,y,z, x,y,z] pairs, flat) as one fat-line object. */
function segs(arr, color, width, opacity, o = {}) {
  const g = new LineSegmentsGeometry();
  g.setPositions(arr);
  const m = lineMat(color, width, { opacity, ...o });
  const l = new LineSegments2(g, m);
  l.renderOrder = o.order ?? 2;
  l.frustumCulled = false;
  return l;
}
/** A polyline pushed as segments into `arr`. */
function run(arr, pts, closed = false) {
  for (let i = 0; i < pts.length - 1; i++) arr.push(...pts[i], ...pts[i + 1]);
  if (closed) arr.push(...pts[pts.length - 1], ...pts[0]);
}
/** A straight fat line whose two ends move (no allocation: a unit segment placed, turned and stretched). */
function wire(color, width, opacity, o = {}) {
  const l = segs([0, 0, 0, 1, 0, 0], color, width, opacity, o);
  const X = new THREE.Vector3(1, 0, 0);
  const d = new THREE.Vector3();
  return {
    obj: l,
    set(ax, ay, az, bx, by, bz) {
      d.set(bx - ax, by - ay, bz - az);
      const len = d.length();
      l.position.set(ax, ay, az);
      l.scale.setScalar(Math.max(1e-3, len));
      if (len > 1e-6) l.quaternion.setFromUnitVectors(X, d.multiplyScalar(1 / len));
    },
  };
}

/** A light with a place: a white-ish heart and a long soft tail, facing the eye, never under `minPx`. */
function softGlow(color, { size = 40, minPx = 14, k = 1.6 } = {}) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmount: { value: 0 }, uSize: { value: size }, uMinPx: { value: minPx }, uK: { value: k }, uView: { value: VIEW } },
    vertexShader: /* glsl */ `
      uniform float uSize, uMinPx; uniform vec2 uView; varying vec2 vQ;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float pxPerCm = projectionMatrix[1][1] * 0.5 * uView.y / max(-mv.z, 1.0);
        float s = max(uSize, uMinPx / max(pxPerCm, 1e-4));
        mv.xy += position.xy * s * 2.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uK; varying vec2 vQ;
      void main() {
        float r2 = clamp(dot(vQ, vQ), 0.0, 1.0);
        float r = sqrt(r2);
        float a = (1.4 * exp(-r2 * 30.0) + 0.45 * exp(-r * 5.0)) * (1.0 - r2);
        vec3 c = mix(uColor, vec3(1.0), 0.35 * exp(-r2 * 60.0));
        gl_FragColor = vec4(c * a * uAmount * uK, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.frustumCulled = false;
  m.renderOrder = 8;
  m.visible = false;
  return {
    mesh: m,
    set(a) {
      mat.uniforms.uAmount.value = a;
      m.visible = a > 0.004;
    },
  };
}

/* ── THE RIBBON: the cable, a tube drawn as a strip facing the eye ── */
const RIBBON_VS = /* glsl */ `
  uniform vec2 uView; uniform float uR, uMinPx; uniform float uLit[33]; uniform float uUp[33];
  attribute vec3 aPrev; attribute vec3 aNext; attribute float aSide; attribute float aS; attribute vec4 aInfo;
  varying float vA; varying float vS; varying float vDim; varying float vCut; varying float vMark; varying float vLit; varying float vUp; varying float vPx; varying float vDepth;
  void main() {
    mat4 pm = projectionMatrix * modelViewMatrix;
    vec4 c = pm * vec4(position, 1.0);
    vec4 n = pm * vec4(aNext, 1.0);
    vec4 p = pm * vec4(aPrev, 1.0);
    vec2 sn = n.xy / max(n.w, 1e-3), sp = p.xy / max(p.w, 1e-3);
    vec2 dir = (sn - sp) * uView;
    dir = length(dir) > 1e-5 ? normalize(dir) : vec2(1.0, 0.0);
    vec2 nrm = vec2(-dir.y, dir.x);
    float pxPerCm = projectionMatrix[1][1] * 0.5 * uView.y / max(c.w, 1e-3);
    float rpx = max(uR * pxPerCm, 0.5 * uMinPx);
    vPx = rpx;
    c.xy += nrm * aSide * rpx * 2.0 / uView * c.w;
    gl_Position = c.w > 1.0 ? c : vec4(2.0, 2.0, 2.0, 1.0);
    vA = aSide; vS = aS; vDim = aInfo.x; vCut = aInfo.y; vMark = aInfo.z;
    int h = int(aInfo.w + 0.5);
    vLit = uLit[h]; vUp = uUp[h];
    vDepth = c.w;
  }`;
const RIBBON_FS = /* glsl */ `
  uniform vec3 uBody, uVei, uInk; uniform float uTime, uSpeed, uPeriod, uPulse, uIdle, uEdge, uCore, uFar, uAmount, uUpSpeed;
  varying float vA; varying float vS; varying float vDim; varying float vCut; varying float vMark; varying float vLit; varying float vUp; varying float vPx; varying float vDepth;
  void main() {
    if (vCut > 0.5 || uAmount < 0.003) discard;
    float a = clamp(abs(vA), 0.0, 1.0);
    float t = sqrt(clamp(1.0 - a * a, 0.0, 1.0));
    // a tube: lit from above-left, a soft highlight, the far side in shadow; light edges (the house's fine arêtes)
    float shade = 0.42 + 0.58 * t + 0.35 * pow(t, 12.0) * step(0.0, -vA);
    vec3 col = uBody * (1.0 + 0.9 * vMark) * shade;
    float px = max(vPx, 1.0);
    float edge = smoothstep(1.0 - 1.6 / px, 1.0 - 0.5 / px, a);
    col += uInk * uEdge * edge;
    // the light in its core: a bright head, a long trail behind it, a faint steady glow between them
    float coreW = max(uCore, 0.9 / px);
    float core = 1.0 - smoothstep(coreW - 0.6 / px, coreW + 0.6 / px, a);
    float ph = fract((vS - uTime * uSpeed) / uPeriod);
    float head = pow(ph, 7.0) * (1.0 - smoothstep(0.93, 1.0, ph));
    float L = vDim * uPulse * vLit;
    col += uVei * core * L * (uIdle + 2.3 * head) + mix(uVei, vec3(1.0), 0.3) * core * L * 0.9 * pow(ph, 30.0);
    col += uVei * (1.0 - core) * L * 0.28 * head * t;
    // the light that goes back up (a home that answers): ink, the other way
    if (vUp > 0.003) {
      float pu = fract((vS + uTime * uUpSpeed) / uPeriod);
      float hu = pow(pu, 7.0) * (1.0 - smoothstep(0.93, 1.0, pu));
      col += uInk * core * vUp * (0.15 + 1.6 * hu);
    }
    gl_FragColor = vec4(col * uAmount * exp(-vDepth / uFar), 1.0);
  }`;

function ribbonMat({ r = 10, minPx = 3, body = 0.16, edge = 0.55, core = 0.36, period = 1400, speed = 900, idle = 0.2, far = 1e9 } = {}) {
  const lit = new Float32Array(33).fill(1);
  const up = new Float32Array(33);
  return new THREE.ShaderMaterial({
    uniforms: {
      uView: { value: VIEW }, uR: { value: r }, uMinPx: { value: minPx }, uLit: { value: lit }, uUp: { value: up },
      uBody: { value: new THREE.Color(body, body * 1.02, body * 1.05) }, uVei: { value: VEILLE.clone() }, uInk: { value: INK.clone() },
      uTime: { value: 0 }, uSpeed: { value: speed }, uPeriod: { value: period }, uPulse: { value: 1 }, uIdle: { value: idle },
      uEdge: { value: edge }, uCore: { value: core }, uFar: { value: far }, uAmount: { value: 1 }, uUpSpeed: { value: speed },
    },
    vertexShader: RIBBON_VS,
    fragmentShader: RIBBON_FS,
    side: THREE.DoubleSide,
  });
}

/**
 * A ribbon of `cap` points in `strips` (static: polylines given once; dynamic: one strip whose points are rewritten).
 * P: centreline (x,y,z) · I: per point (light 0–1, cut 0/1, mark −1…1 body darker/lighter, home 0–32).
 */
function makeRibbon(cap, opts = {}) {
  const geo = new THREE.BufferGeometry();
  const V = cap * 2;
  const pos = new Float32Array(V * 3), prev = new Float32Array(V * 3), next = new Float32Array(V * 3);
  const side = new Float32Array(V), sAt = new Float32Array(V), info = new Float32Array(V * 4);
  for (let i = 0; i < cap; i++) {
    side[2 * i] = -1;
    side[2 * i + 1] = 1;
  }
  const attr = (a, k) => new THREE.BufferAttribute(a, k).setUsage(THREE.DynamicDrawUsage);
  const A = { position: attr(pos, 3), aPrev: attr(prev, 3), aNext: attr(next, 3), aSide: new THREE.BufferAttribute(side, 1), aS: attr(sAt, 1), aInfo: attr(info, 4) };
  for (const k in A) geo.setAttribute(k, A[k]);
  const index = new Uint32Array((cap - 1) * 6);
  geo.setIndex(new THREE.BufferAttribute(index, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = ribbonMat(opts);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = opts.order ?? 3;
  const P = new Float32Array(cap * 3);
  const I = new Float32Array(cap * 4);
  for (let i = 0; i < cap; i++) I[i * 4 + 3] = 32;
  let nIdx = 0;
  const api = {
    mesh, mat, P, I, cap,
    /** Write the vertices of points [from, to) as one strip, its length counted from s0; returns the end's s. */
    strip(from, to, s0 = 0) {
      let s = s0;
      for (let i = from; i < to; i++) {
        const ip = Math.max(from, i - 1), inx = Math.min(to - 1, i + 1);
        if (i > from) {
          const dx = P[i * 3] - P[ip * 3], dy = P[i * 3 + 1] - P[ip * 3 + 1], dz = P[i * 3 + 2] - P[ip * 3 + 2];
          s += Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        for (let k = 0; k < 2; k++) {
          const v = 2 * i + k;
          for (let c = 0; c < 3; c++) {
            pos[v * 3 + c] = P[i * 3 + c];
            prev[v * 3 + c] = P[ip * 3 + c];
            next[v * 3 + c] = P[inx * 3 + c];
          }
          sAt[v] = s;
          for (let c = 0; c < 4; c++) info[v * 4 + c] = I[i * 4 + c];
        }
        if (i < to - 1) {
          const a = 2 * i;
          index[nIdx++] = a; index[nIdx++] = a + 1; index[nIdx++] = a + 2;
          index[nIdx++] = a + 1; index[nIdx++] = a + 3; index[nIdx++] = a + 2;
        }
      }
      return s;
    },
    begin() {
      nIdx = 0;
    },
    end() {
      geo.setDrawRange(0, nIdx);
      for (const k in A) A[k].needsUpdate = true;
      geo.index.needsUpdate = true;
    },
    set(i, x, y, z, light = 1, cut = 0, mark = 0) {
      P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = z;
      I[i * 4] = light; I[i * 4 + 1] = cut; I[i * 4 + 2] = mark;
    },
    tick(time, S, flow = 1) {
      const u = mat.uniforms;
      u.uTime.value = time * flow;
      u.uPulse.value = clamp01(S.pulse);
    },
  };
  return api;
}
/** A static ribbon from polylines (each [[x,y,z]…], with an optional home index and light). */
function staticRibbon(lines, opts = {}) {
  const cap = lines.reduce((n, l) => n + l.pts.length, 0);
  const rb = makeRibbon(cap, opts);
  let i = 0;
  rb.begin();
  for (const l of lines) {
    const from = i;
    for (const p of l.pts) {
      rb.set(i, p[0], p[1], p[2], l.light ?? 1, 0, l.mark ?? 0);
      rb.I[i * 4 + 3] = l.home ?? 32;
      i++;
    }
    rb.strip(from, i, l.s0 ?? 0);
  }
  rb.end();
  return rb;
}
/** A smooth polyline through control points (Catmull–Rom), `per` samples per span. */
function smoothPath(ctrl, per = 8) {
  const out = [];
  const c = (i) => ctrl[Math.max(0, Math.min(ctrl.length - 1, i))];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = c(i - 1), p1 = c(i), p2 = c(i + 1), p3 = c(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0, 1, 2].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  out.push([...ctrl[ctrl.length - 1]]);
  return out;
}

/** A floor of lines: a grid draped on y(x) (the sea bottom) or flat (the land), contours on the slope, faded far. */
function gridFloor({ x0, x1, z0, z1, nx, nz, yAt, step = 500, major = 2500, contour = 0, k = 0.3, kind = 0 }) {
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, yAt(p.getX(i)));
  geo.computeVertexNormals();
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uInk: { value: INK.clone() }, uSig: { value: SIGNAL.clone() }, uAmount: { value: 1 }, uSee: { value: 9000 }, uK: { value: k },
      uStep: { value: step }, uMajor: { value: major }, uContour: { value: contour }, uZ: { value: new THREE.Vector2(z0, z1) },
      uPl: { value: new THREE.Vector3(0, 0, 0) }, uKind: { value: kind }, uTime: { value: 0 }, uHole: { value: new THREE.Vector4(0, 0, 0, 0) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSig; uniform float uAmount, uSee, uK, uStep, uMajor, uContour, uKind, uTime; uniform vec2 uZ; uniform vec3 uPl; uniform vec4 uHole;
      varying vec3 vW;
      float line(float c, float s) {
        float fw = max(fwidth(c), 1e-4);
        float d = abs(fract(c / s - 0.5) - 0.5) * s / fw;
        return (1.0 - smoothstep(0.55, 1.35, d)) * (1.0 - smoothstep(0.07, 0.16, fw / s));
      }
      void main() {
        if (uAmount < 0.003) discard;
        vec3 w = vW;
        float g = max(line(w.x, uStep), line(w.z, uStep)) * 0.42 + max(line(w.x, uMajor), line(w.z, uMajor)) * 0.5;
        if (uContour > 0.0) g = max(g, line(w.y, uContour) * 0.75);
        float k = 1.0;
        vec3 col = uInk;
        if (uKind > 0.5) {
          // TERRE: the water (x < 0) in swell lines running to the shore, the sand stippled, the street in its grid
          if (w.x < 0.0) {
            float c = w.x + 60.0 * sin(w.z / 420.0 + uTime * 0.35) - uTime * 22.0;
            g = line(c, 260.0) * 0.8 * smoothstep(-2600.0, -300.0, w.x) + line(w.x, uMajor) * 0.2;
          } else if (w.x < ${LAND.beach.toFixed(1)}) {
            vec2 q = w.xz / 46.0;
            vec2 f = fract(q + 0.37 * sin(floor(q.yx) * 1.7)) - 0.5;
            float dotk = 1.0 - smoothstep(0.08, 0.2, length(f));
            float fw = max(fwidth(q.x), 1e-4);
            g = dotk * 0.45 * (1.0 - smoothstep(0.08, 0.25, fw)) + g * 0.35;
          }
          // the cut-away over a hole in the ground (a pit, a chamber): no grid there
          if (uHole.w > 0.0 && abs(w.x - uHole.x) < uHole.z && abs(w.z - uHole.y) < uHole.z) g *= 0.15;
        } else {
          // MER: the trench of the plough (uPl: from x, the plough's x, how much)
          if (uPl.z > 0.001 && w.x > uPl.x && w.x < uPl.y) {
            float back = uPl.y - w.x;
            float open = 1.0 - smoothstep(0.0, 650.0, back);
            float wd = 18.0 + 60.0 * open;
            float lips = (1.0 - smoothstep(0.0, 10.0, abs(abs(w.z) - wd))) * (0.35 + 0.65 * open);
            float spoil = (1.0 - smoothstep(0.0, 14.0, abs(abs(w.z) - wd - 46.0))) * 0.45 * open;
            float scar = (1.0 - smoothstep(0.0, 6.0, abs(w.z))) * 0.5 * (1.0 - open);
            g = max(g, (lips + spoil + scar) * uPl.z);
          }
        }
        float edge = smoothstep(uZ.x, uZ.x + 1600.0, w.z) * smoothstep(uZ.y, uZ.y - 1600.0, w.z);
        float dist = length(cameraPosition - w);
        k = exp(-dist / uSee) * edge;
        gl_FragColor = vec4(col * g * k * uK * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return mesh;
}

/* ═════════════════════════════ MER ═════════════════════════════ */

const RC = 10; //           the subsea cable's radius in the model (a pipe you can follow from the surface)
const X0 = -32000, X1 = -260; // the cable on the bottom, from the far ocean to the foot of the beach
const DX = 40;
const NMER = Math.round((X1 - X0) / DX) + 1;
const REPS = [-21000, SEA.repeater, -11000, -8800]; // the repeaters (SEA.repeater the one the chapters frame)
const DECAY = 5200; //      how fast the light fades between two of them (it arrives at ≈ 38 %)

/** The light left at x: from the far end, fading, relaunched by each repeater as much as `amp` says. */
function lightAt(x, amp) {
  let lev = 1, prev = -26000;
  for (let i = 0; i < REPS.length; i++) {
    const r = REPS[i];
    if (x <= r) break;
    lev *= Math.exp(-(r - prev) / DECAY);
    lev = lerp(lev, 1, amp);
    prev = r;
  }
  return lev * Math.exp(-Math.max(0, x - prev) / DECAY);
}

/** The hull of the cable ship, lofted by sections: its glass, its lines (deck edge, keel, waterline, frames). */
function buildShip() {
  const g = new THREE.Group();
  const HL = SHIP.len / 2, B = SHIP.beam / 2;
  const N = 36, M = 9;
  const deckAt = (x) => 90 + 45 * smooth(300, HL, x) + 12 * smooth(-HL + 200, -HL, x);
  const keelAt = (x) => -70 + 55 * smooth(380, HL, x) + 20 * smooth(-HL + 160, -HL, x);
  const beamAt = (x) => B * Math.pow(Math.max(0, 1 - Math.pow(Math.max(0, x + 50) / (HL + 50), 2.0)), 0.75) * (1 - 0.1 * smooth(-HL + 300, -HL, x));
  const pos = [];
  const sec = (x) => {
    const b = Math.max(2, beamAt(x)), d = deckAt(x), kl = keelAt(x);
    const out = [];
    for (let j = -M; j <= M; j++) {
      const phi = (Math.abs(j) / M) * (Math.PI / 2);
      const z = Math.sign(j || 1) * b * Math.pow(Math.cos(phi), 0.5) * (j === 0 ? 0 : 1);
      const y = d - (d - kl) * Math.pow(Math.sin(phi), 0.5);
      out.push([x, Math.abs(j) === M ? y : y, j === 0 ? 0 : z]);
    }
    // the section runs deck (port) → keel → deck (starboard): reorder so that j = −M is port deck
    return out.map((p, k) => {
      const j = k - M;
      const phi = ((M - Math.abs(j)) / M) * (Math.PI / 2);
      return [x, d - (d - kl) * Math.pow(Math.sin(phi), 0.5) * 1, (j < 0 ? -1 : 1) * b * Math.pow(Math.cos(phi), 0.5) * (j === 0 ? 0 : 1)];
    });
  };
  const rows = [];
  for (let i = 0; i <= N; i++) rows.push(sec(-HL + (i / N) * SHIP.len));
  const idx = [];
  const W = 2 * M + 1;
  for (const r of rows) for (const p of r) pos.push(...p);
  for (let i = 0; i < N; i++) for (let j = 0; j < W - 1; j++) {
    const a = i * W + j, b2 = a + W;
    idx.push(a, b2, a + 1, a + 1, b2, b2 + 1);
  }
  // the transom (the flat stern)
  const t0 = pos.length / 3;
  pos.push(-HL, deckAt(-HL) - 4, 0);
  for (let j = 0; j < W - 1; j++) idx.push(t0, j, j + 1);
  const hullGeo = new THREE.BufferGeometry();
  hullGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  hullGeo.setIndex(idx);
  hullGeo.computeVertexNormals();
  const hullMat = glass(BRAND.ink, { base: 0.003, rim: 0.2, power: 2.6, edge: 0.45, spec: 0.25, through: 0.25 });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  // the bridge, forward (cable ships carry it at the bow), and its windows' band
  const bridgeGeo = box(250, 150, 170, 6).translate(470, 90 + 75 + 30, 0);
  const bridgeMat = glass(BRAND.ink, { base: 0.003, rim: 0.2, power: 2.6, edge: 0.45 });
  const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
  asShell([hull, bridge], 20);
  g.add(hull, bridge);
  const L = [];
  const deckL = [], deckR = [], keel = [], wl = [];
  for (const r of rows) {
    deckL.push(r[0]);
    deckR.push(r[W - 1]);
    keel.push(r[M]);
    // the waterline: where the section crosses y = 0
    for (let j = 0; j < M; j++) {
      const a = r[j], b2 = r[j + 1];
      if ((a[1] - 0) * (b2[1] - 0) <= 0 && a[1] !== b2[1]) {
        const u = a[1] / (a[1] - b2[1]);
        wl.push([a[0], 0, lerp(a[2], b2[2], u)]);
        break;
      }
    }
  }
  run(L, deckL);
  run(L, deckR);
  run(L, keel);
  run(L, [deckL[0], deckR[0]]);
  const wlR = wl.map((p) => [p[0], 0, -p[2]]);
  run(L, wl);
  run(L, wlR);
  const F = [];
  for (let i = 3; i < N; i += 4) run(F, rows[i]);
  g.add(segs(L, BRAND.ink, 1.9, 0.75), segs(F, BRAND.ink, 1.8, 0.22));
  const be = edgesOf(bridgeGeo, { width: 1.8, opacity: 0.55 });
  g.add(be);
  // the bridge's windows: a band of ink across its front
  const WIN = [];
  for (let k = -3; k <= 3; k++) run(WIN, [[595, 215, k * 22 - 8], [595, 215, k * 22 + 8]]);
  g.add(segs(WIN, BRAND.ink, 2.4, 0.6));
  // the A-frame over the stern and its sheave (solid: the cable leaves over it)
  const AF = [];
  run(AF, [[-HL + 40, deckAt(-HL), -70], [-HL - 20, 230, -50], [-HL - 20, 230, 50], [-HL + 40, deckAt(-HL), 70]]);
  g.add(segs(AF, BRAND.ink, 2.2, 0.7));
  const sheaveMat = solid(0x8a9095, { rough: 0.45, metal: 0.4 });
  const sheave = new THREE.Mesh(cyl(26, 14, 1.5, 48), sheaveMat);
  sheave.rotation.x = Math.PI / 2;
  sheave.position.set(-HL - 12, 200, 0);
  const se = edgesOf(sheave.geometry, { width: 1.8, opacity: 0.7, color: 0x1d2226 });
  sheave.add(se);
  g.add(sheave);
  // the two tanks in the hull, the cable coiled in each (solid, dark: what the hull carries)
  const tankMat = glass(BRAND.ink, { base: 0.004, rim: 0.24, power: 2.4, edge: 0.55 });
  const tanks = [];
  const coilMat = solid(0x5d6368, { rough: 0.5, metal: 0.2 });
  const coilTop = solid(0x9aa0a4, { rough: 0.45, metal: 0.2 });
  for (const [tx, tz] of SHIP.tanks) {
    const tg = new THREE.Mesh(new THREE.CylinderGeometry(88, 88, 140, 48, 1, true), tankMat);
    tg.position.set(tx, 15, tz);
    tanks.push(tg);
    g.add(tg);
    const rim = [];
    for (const y of [-55, 85]) {
      const ring = [];
      for (let k = 0; k <= 48; k++) ring.push([tx + 88 * Math.cos((k / 48) * 2 * Math.PI), y, tz + 88 * Math.sin((k / 48) * 2 * Math.PI)]);
      run(rim, ring);
    }
    g.add(segs(rim, BRAND.ink, 1.9, 0.6));
    // the coil: flat spirals stacked, the top one lighter (the eye finds the turns)
    for (let layer = 0; layer < 6; layer++) {
      const pts = [];
      const turns = 7;
      for (let k = 0; k <= turns * 40; k++) {
        const u = k / (turns * 40);
        const r = lerp(30, 80, layer % 2 ? 1 - u : u);
        const a = u * turns * 2 * Math.PI + layer * 0.7;
        pts.push(new THREE.Vector3(tx + r * Math.cos(a), -48 + layer * 9.5, tz + r * Math.sin(a)));
      }
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 560, 4.4, 6, false);
      const m = new THREE.Mesh(geo, layer === 5 ? coilTop : coilMat);
      g.add(m);
    }
  }
  asShell(tanks, 12);
  const A = { stern: new THREE.Object3D(), bow: new THREE.Object3D(), tank: new THREE.Object3D() };
  A.stern.position.set(-HL - 12, 200 - 26, 0);
  A.bow.position.set(HL - 30, deckAt(HL) - 10, 0);
  A.tank.position.set(SHIP.tanks[0][0], 50, 0);
  g.add(A.stern, A.bow, A.tank);
  // the cable on deck: out of the aft tank, over the deck, onto the sheave
  const deckCable = staticRibbon([{ pts: smoothPath([[SHIP.tanks[0][0], -0, 0], [SHIP.tanks[0][0] - 20, 105, 0], [-300, 112, 0], [-560, 125, 0], [-HL - 12, 226, 0], [-HL - 38, 200, 0]], 10) }], { r: 4.5, minPx: 3, body: 0.2, period: 400, speed: 300 });
  deckCable.mat.uniforms.uIdle.value = 0;
  g.add(deckCable.mesh);
  const mats = { hullMat, bridgeMat, tankMat };
  return { group: g, A, mats, deckCable };
}

/** The plough: a sled of glass (two skids, a frame), its share, the depressor that leads the cable down. */
function buildPlough() {
  const g = new THREE.Group();
  const parts = [];
  const add = (geo, x, y, z, o = {}) => {
    const m = xray(geo.translate(x, y, z), { rim: 0.26, edge: 0.5, width: 1.9, opacity: 0.8, ...o });
    parts.push(m);
    g.add(m);
  };
  add(box(260, 14, 22, 3), 0, 8, -70);
  add(box(260, 14, 22, 3), 0, 8, 70);
  add(box(220, 50, 150, 6), 10, 60, 0);
  add(box(40, 120, 18, 3), -60, 30, 0); // the share, cutting down into the bottom
  add(box(110, 24, 40, 4), 120, 95, 0); // the depressor, where the cable goes in
  asShell(parts, 18);
  return { group: g, parts };
}

/** The anchor (signal): a shank, a crown, two flukes; and its chain up into the dark. */
function buildAnchor() {
  const g = new THREE.Group();
  const parts = [];
  const add = (geo) => {
    const m = xray(geo, { color: BRAND.signal, rim: 0.3, edge: 0.6, width: 2, opacity: 0.85 });
    parts.push(m);
    g.add(m);
  };
  add(box(26, 260, 26, 4).translate(0, 150, 0));
  add(box(70, 40, 40, 6).translate(0, 20, 0));
  const fluke = (s) => {
    const shape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(26, 0), new THREE.Vector2(70, 110), new THREE.Vector2(40, 130), new THREE.Vector2(0, 50)]);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 22, bevelEnabled: false }).translate(18, 0, -11);
    if (s < 0) geo.scale(-1, 1, 1);
    add(geo);
  };
  fluke(1);
  fluke(-1);
  asShell(parts, 18);
  g.scale.setScalar(2.4); // a model: an anchor you can read from across the bottom
  const ring = new THREE.Object3D();
  ring.position.set(0, 285, 0);
  g.add(ring);
  return { group: g, parts, ring };
}

/** The grapnel (ink): a shank, five curved tines. */
function buildGrapnel() {
  const g = new THREE.Group();
  const parts = [];
  const sh = xray(box(14, 150, 14, 3).translate(0, 75, 0), { rim: 0.3, edge: 0.6, width: 2, opacity: 0.85 });
  parts.push(sh);
  g.add(sh);
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * 2 * Math.PI;
    const pts = [];
    for (let j = 0; j <= 8; j++) {
      const u = j / 8;
      const r = 70 * Math.sin(u * 0.75 * Math.PI);
      pts.push(new THREE.Vector3(r * Math.cos(a), 10 + 70 * u - 50 * u * u, r * Math.sin(a)));
    }
    const m = xray(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 5, 6), { rim: 0.3, edge: 0.5, width: 1.8, opacity: 0.0 });
    parts.push(m);
    g.add(m);
  }
  asShell(parts, 18);
  g.scale.setScalar(2.4);
  const top = new THREE.Object3D();
  top.position.set(0, 150, 0);
  g.add(top);
  return { group: g, parts, top };
}

/** A repeater: a solid bulge on the cable (three greys), the band that lights veille when it relaunches. */
function buildRepeater() {
  const g = new THREE.Group();
  const prof = [[0, -150], [RC + 1, -150], [RC + 4, -128], [24, -86], [33, -40], [34, 0], [33, 40], [24, 86], [RC + 4, 128], [RC + 1, 150], [0, 150]];
  const bodyMat = solid(0x5d6368, { rough: 0.48, metal: 0.35 });
  const geo = lathe(prof, 64, { bevel: 1.5, round: 2 });
  const body = new THREE.Mesh(geo, bodyMat);
  body.add(edgesOf(geo, { width: 1.8, opacity: 0.5, color: BRAND.ink }));
  const bandMat = solid(0x9ba1a5, { rough: 0.4, metal: 0.3 });
  for (const y of [-62, 62]) {
    const b = new THREE.Mesh(cyl(30.5, 8, 1, 64), bandMat);
    b.position.y = y;
    body.add(b);
  }
  const ringMat = new THREE.MeshBasicMaterial({ color: VEILLE.clone(), toneMapped: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(34.5, 2.6, 10, 64), ringMat);
  ring.rotation.x = Math.PI / 2;
  body.add(ring);
  body.rotation.z = -Math.PI / 2; // its axis along x
  g.add(body);
  return { group: g, ringMat, ring };
}

function buildMer() {
  const group = new THREE.Group();
  const A = {};
  const anchorObj = (name) => {
    const o = new THREE.Object3D();
    group.add(o);
    A[name] = o;
    return o;
  };

  /* 034's Atlantic: its snow and its surface seen from below; the rest is not ours */
  const fond = buildFond();
  const fsea = fond.group.children[0];
  fond.group.remove(fsea); // its floors, its debris, its lamp, its drum
  for (const c of [...fond.group.children]) {
    const keep = c === fond.A.surface || (c.isPoints && c.material.uniforms?.uDir);
    if (!keep) fond.group.remove(c);
  }
  if (fond.A.tail.parent) fond.A.tail.parent.remove(fond.A.tail);
  const fondSnow = fond.group.children.filter((c) => c.isPoints);
  for (const s of fondSnow) {
    // OUR copy of its shader: no snow above the surface (the camera may stand above the sea: the model is cut away)
    s.material.vertexShader = s.material.vertexShader.replace("vA = aSeed.w", "vA = (1.0 - smoothstep(-60.0, -10.0, p.y)) * aSeed.w");
    s.material.uniforms.uCube.value = 700;
    s.material.needsUpdate = true;
  }
  const DEPTH_M = 34; // 034 counts in metres from its surface: placed so that its surface lands on our y = 0
  fond.group.position.y = -DEPTH_M * 100;
  group.add(fond.group);

  /* the bottom: a grid draped on the profile, contours on the slope */
  const floor = gridFloor({ x0: -34000, x1: 1800, z0: -7000, z1: 7000, nx: 180, nz: 28, yAt: (x) => (x < 0 ? floorAt(x) : Math.min(150, x * 0.12)), step: 500, major: 2500, contour: 220, k: 0.34 });
  group.add(floor);
  const FU = floor.material.uniforms;
  // a few boulders of glass near the cable
  {
    const R = rng(7031);
    const rocks = [];
    for (let i = 0; i < 16; i++) {
      const x = lerp(-31000, -1800, R());
      const z = (R() < 0.5 ? -1 : 1) * lerp(1100, 3800, Math.pow(R(), 1.2));
      const s = lerp(50, 130, R());
      const geo = new THREE.IcosahedronGeometry(s, 0);
      geo.scale(1, lerp(0.3, 0.5, R()), lerp(0.7, 1.2, R()));
      geo.rotateY(R() * 6.28);
      geo.translate(x, floorAt(x) + s * 0.08, z);
      const m = xray(geo, { rim: 0.14, edge: 0.2, width: 1.8, opacity: 0.22 });
      rocks.push(m);
      group.add(m);
    }
    asShell(rocks, 16);
  }

  /* the surface seen from above: fine swell lines (034's net takes over from below) */
  const surfMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uInk: { value: INK.clone() }, uTime: { value: 0 }, uSee: { value: 9000 }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `varying vec3 vW; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uTime, uSee, uAmount; varying vec3 vW;
      void main() {
        float below = step(cameraPosition.y, 0.0);
        float c = vW.x * 0.6 + vW.z * 0.8 + 90.0 * sin(vW.x / 900.0 + uTime * 0.25) + 50.0 * sin(vW.z / 520.0 - uTime * 0.2);
        float fw = max(fwidth(c), 1e-4);
        float d = abs(fract(c / 420.0 - 0.5) - 0.5) * 420.0 / fw;
        float l = (1.0 - smoothstep(0.55, 1.35, d)) * (1.0 - smoothstep(0.06, 0.15, fw / 420.0));
        float edge = smoothstep(7000.0, 5200.0, abs(vW.z)) * smoothstep(-34000.0, -31000.0, vW.x) * smoothstep(400.0, -200.0, vW.x);
        float k = exp(-length(cameraPosition - vW) / uSee);
        gl_FragColor = vec4(uInk * (0.16 * l + 0.012) * k * edge * uAmount * (1.0 - 0.6 * below), 1.0);
      }`,
  });
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(36000, 14000, 1, 1).rotateX(-Math.PI / 2).translate(-16000, 0, 0), surfMat);
  surf.frustumCulled = false;
  surf.renderOrder = 1;
  group.add(surf);
  // the cut-away's edges: the coast line at the waterline, the section of the water at its two ends (faint)
  {
    const L = [];
    run(L, [[0, 0, -7000], [0, 0, 7000]]);
    run(L, [[-34000, 0, -7000], [0, 0, -7000]]);
    run(L, [[-34000, 0, 7000], [0, 0, 7000]]);
    const prof = [];
    for (let x = -34000; x <= 0; x += 400) prof.push([x, floorAt(x), -7000]);
    run(L, prof);
    group.add(segs(L, BRAND.ink, 1.8, 0.18));
  }

  /* the cable on the bottom */
  const cable = makeRibbon(NMER + 80, { r: RC, minPx: 3.2, body: 0.17, edge: 0.6, core: 0.34, period: 1400, speed: 900, idle: 0.22 });
  group.add(cable.mesh);
  // the cable paid out from the stern sheave down to the bottom (the same light: it continues the bottom's)
  const NPAY = 72;
  const payout = makeRibbon(NPAY, { r: RC, minPx: 3.2, body: 0.17, edge: 0.6, core: 0.34, period: 1400, speed: 900, idle: 0.22 });
  group.add(payout.mesh);

  /* the ship */
  const ship = buildShip();
  group.add(ship.group);

  /* the plough and its tow wire */
  const plough = buildPlough();
  group.add(plough.group);
  const tow = wire(BRAND.ink, 1.9, 0.55);
  group.add(tow.obj);

  /* the repeaters */
  const reps = REPS.map((x) => {
    const r = buildRepeater();
    r.group.position.set(x, floorAt(x) + RC, 0);
    group.add(r.group);
    return r;
  });
  const repGlow = REPS.map((x) => {
    const gl = softGlow(BRAND.veille, { size: 30, minPx: 10, k: 1.2 });
    gl.mesh.position.set(x + 170, floorAt(x) + RC, 0);
    group.add(gl.mesh);
    return gl;
  });

  /* the anchor, its chain */
  const anc = buildAnchor();
  group.add(anc.group);
  const chain = wire(BRAND.signal, 2.2, 0.55);
  group.add(chain.obj);
  const furrow = segs([0, 0, 0, 0, 0, 1], BRAND.signal, 2, 0.35);
  group.add(furrow);
  const breakGlow = [softGlow(BRAND.signal, { size: 26, minPx: 12, k: 1.4 }), softGlow(BRAND.signal, { size: 26, minPx: 12, k: 1.4 })];
  for (const b of breakGlow) group.add(b.mesh);

  /* the grapnel, its rope */
  const grp = buildGrapnel();
  group.add(grp.group);
  const rope = wire(BRAND.ink, 1.9, 0.6);
  group.add(rope.obj);
  const mendGlow = [softGlow(BRAND.veille, { size: 18, minPx: 8, k: 1.0 }), softGlow(BRAND.veille, { size: 18, minPx: 8, k: 1.0 })];
  for (const b of mendGlow) group.add(b.mesh);

  for (const n of ["shipStern", "cableTouch", "plough", "repeater", "anchor", "fault", "grapnel", "loop"]) anchorObj(n);
  A.repeater.position.set(SEA.repeater, floorAt(SEA.repeater) + RC, 0);
  A.fault.position.set(SEA.anchor, floorAt(SEA.anchor) + RC, 0);
  A.loop.position.set(SEA.repair, floorAt(SEA.repair), SEA.loop / 2);

  /* the shape of the cable: a pure function of the state (ms), filled once per change */
  const ms = { pl: 0, plX: 0, hook: 0, g: 0, h: 0, mend: 0, loop: 0, Hx: 0, Hy: 0, lay: false, tdX: 0, amp: 0, cut: NaN };
  const P = new THREE.Vector3();
  const Q = new THREE.Vector3();
  const xr = SEA.repair;
  const yr = floorAt(xr) + RC;
  // the lying cable (on the bottom, in its trench, hooked by the anchor), the repair's three shapes on top of it
  function lying(x, o) {
    let y = floorAt(x) + RC, z = 0;
    if (ms.pl > 0.001) {
      const inZone = smooth(SEA.plough[0] - 200, SEA.plough[0], x);
      const behind = smooth(ms.plX + 60, ms.plX - 240, x) * inZone;
      y -= behind * 52; // in the trench
      const lift = Math.exp(-Math.pow((x - ms.plX - 90) / 70, 2)) * inZone * (1 - smooth(SEA.plough[1] - 40, SEA.plough[1] + 200, ms.plX));
      y += lift * 70; // through the plough's depressor
    }
    if (ms.hook > 0.001) {
      const k = Math.max(0, 1 - Math.abs(x - SEA.anchor) / 700);
      const kk = k * k * (3 - 2 * k);
      z += 190 * ms.hook * kk;
      y += 70 * ms.hook * kk;
    }
    return o.set(x, y, z);
  }
  function lifted(x, o) {
    // grapnel 1 → 2: the end beyond the cut (x > xr) hauled up to the bow, the rest sagging back to the bottom
    const e = ease(ms.h);
    const Hx = lerp(xr + 300, ms.Hx, e), Hy = lerp(yr, ms.Hy, e);
    if (x >= xr + 300) {
      const t = (xr + 3200 - x) / 2900;
      if (t <= 0) return lying(x, o);
      const bx = xr + 3200, by = floorAt(bx) + RC;
      const cx = lerp(bx, Hx, 0.4), cy = by;
      const u = 1 - t;
      return o.set(u * u * bx + 2 * u * t * cx + t * t * Hx, u * u * by + 2 * u * t * cy + t * t * Hy, 0);
    }
    if (x >= xr) {
      const t2 = (xr + 300 - x) / 300;
      return o.set(Hx - 30 * t2, Hy - 280 * t2 * smooth(0, 0.4, ms.h), 0);
    }
    return lying(x, o);
  }
  function bight(x, o) {
    // mend: both ends at the bow, spliced: the cable hangs from the ship in one bight
    const W = 2600;
    const t = (x - (xr - W)) / (2 * W);
    if (t <= 0 || t >= 1) return lying(x, o);
    const s = Math.pow(Math.sin(Math.PI * t), 1.3);
    const by = floorAt(x) + RC;
    return o.set(x + (ms.Hx - xr) * s, lerp(by, ms.Hy, s), 0);
  }
  function flatLoop(x, o) {
    // the repaired cable laid back, too long: a wide loop flat on the bottom (Ω, toward +z)
    const W = 1500, R = SEA.loop / 1.89;
    const u = (x - (xr - W)) / (2 * W);
    if (u <= 0 || u >= 1) return lying(x, o);
    let px, pz;
    if (u < 0.2) {
      px = lerp(xr - W, xr - 0.454 * R, u / 0.2);
      pz = 0;
    } else if (u > 0.8) {
      px = lerp(xr + 0.454 * R, xr + W, (u - 0.8) / 0.2);
      pz = 0;
    } else {
      const th = lerp(-0.35 * Math.PI, 1.35 * Math.PI, (u - 0.2) / 0.6);
      px = xr - R * Math.cos(th);
      pz = 0.891 * R + R * Math.sin(th);
    }
    return o.set(px, floorAt(px) + RC, pz);
  }
  function cableAt(x, o) {
    lying(x, o);
    if (ms.g > 1.001) lifted(x, o);
    if (ms.mend > 0.001) {
      bight(x, Q);
      o.lerp(Q, ease(ms.mend));
    }
    if (ms.loop > 0.001) {
      flatLoop(x, Q);
      o.lerp(Q, ease(ms.loop));
    }
    return o;
  }

  const key = new Float64Array(12).fill(NaN);
  let changed = false;
  const chk = (i, v) => {
    if (!(v === key[i] || (Number.isNaN(v) && Number.isNaN(key[i])))) {
      changed = true;
      key[i] = v;
    }
  };
  const shipPos = new THREE.Vector3();
  const sternW = new THREE.Vector3(), bowW = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  return {
    group, A,
    fog(d) {
      const k = fond.fog(d); // 034's: the snow fades from the wide shots
      FU.uSee.value = Math.max(5000, d * 2.2);
      surfMat.uniforms.uSee.value = Math.max(5000, d * 2.0);
      cable.mat.uniforms.uFar.value = payout.mat.uniforms.uFar.value = Math.max(9000, d * 4);
      return k * 0.8;
    },
    update(S, time, px) {
      const flow = Math.max(0, S.flow);
      fond.update({ depth: DEPTH_M, rush: 0, wreck: 0, ping: 0, range: 0, beam: 0, shell: 1, pool: 0, mood: 0 }, time, px);
      FU.uTime.value = time;
      surfMat.uniforms.uTime.value = time;

      /* the ship on its way, heaving a little */
      const shipOn = clamp01(S.ship);
      const sx = lerp(SHIP.path[0], SHIP.path[1], clamp01(S.sail));
      ship.group.visible = shipOn > 0.01;
      ship.group.position.set(sx, 0, 0);
      ship.group.rotation.x = 0.012 * Math.sin(time * 0.55); // a slow roll (the stern sheave, on the axis, stays put)
      for (const m of [ship.mats.hullMat, ship.mats.bridgeMat, ship.mats.tankMat]) m.uniforms.uAmount.value = shipOn;
      ship.group.updateMatrixWorld();
      ship.A.stern.getWorldPosition(sternW);
      ship.A.bow.getWorldPosition(bowW);
      A.shipStern.position.copy(sternW);
      ship.deckCable.tick(time, S, flow);

      /* the state of the cable's shape */
      ms.pl = clamp01(S.plough);
      ms.plX = lerp(SEA.plough[0], SEA.plough[1], ms.pl);
      ms.hook = smooth(0.72, 1, S.anchor);
      ms.g = Math.max(0, Math.min(2, S.grapnel));
      ms.h = clamp01(ms.g - 1);
      ms.mend = clamp01(S.mend);
      ms.loop = clamp01(S.loop);
      ms.amp = clamp01(S.amp);
      if (shipOn > 0.01) {
        ms.Hx = bowW.x;
        ms.Hy = bowW.y - 30;
      } else {
        ms.Hx = xr + 300;
        ms.Hy = -40;
      }
      ms.lay = shipOn > 0.01 && S.pay > 0.01 && ms.g < 0.001 && ms.loop < 0.001;
      // the touchdown: behind the stern by about the depth there (the cable comes down in a long curve)
      ms.tdX = sternW.x - 1.25 * Math.abs(floorAt(sternW.x));
      const fault = S.fault > 0.5;
      ms.cut = ms.g > 0.001 ? (ms.mend < 0.5 ? xr : NaN) : fault ? SEA.anchor : NaN;

      const up = ms.g > 1.001 || ms.mend > 0.001;
      changed = false;
      chk(0, ms.pl); chk(1, ms.hook); chk(2, ms.g); chk(3, ms.mend); chk(4, ms.loop); chk(5, ms.amp);
      chk(6, ms.lay ? Math.round(ms.tdX) : 1e9); chk(7, ms.lay ? S.pay : 0);
      chk(8, up ? Math.round(ms.Hx) : 0); chk(9, up ? Math.round(ms.Hy) : 0); chk(10, ms.cut); chk(11, ms.lay ? Math.round(sternW.y) : 0);
      let sTouch = 0;
      if (changed) {
        cable.begin();
        let n = 0;
        const xEnd = ms.lay ? Math.min(X1, ms.tdX) : X1;
        const pay = clamp01(S.pay);
        const showBottom = !ms.lay || pay > 0.999;
        if (showBottom) {
          for (let i = 0; i < NMER; i++) {
            const x = X0 + i * DX;
            if (x > xEnd) break;
            cableAt(x, P);
            const cut = Number.isFinite(ms.cut) && Math.abs(x - ms.cut) < 30 ? 1 : 0;
            const light = Number.isFinite(ms.cut) && x > ms.cut ? 0 : lightAt(x, ms.amp);
            const isNew = ms.mend > 0.001 && Math.abs(x - xr) < 340 ? 0.9 * ms.mend : 0;
            const buried = ms.pl > 0.001 && x > SEA.plough[0] && x < ms.plX - 150 ? -0.25 : 0;
            cable.set(n, P.x, P.y, P.z, light, cut, isNew + buried);
            n++;
          }
          sTouch = cable.strip(0, n, 0);
        }
        cable.end();
        cable.mesh.visible = n > 1;
        /* the payout: from the touchdown up to the sheave, in a curve tangent to the bottom */
        payout.begin();
        if (ms.lay) {
          const tx = ms.tdX, ty = floorAt(tx) + RC;
          const Sx = sternW.x, Sy = sternW.y;
          // drawn from the sheave down as far as `pay`, then turned so that it runs from the bottom up (the light's way)
          const m = Math.max(2, Math.round(NPAY * Math.max(0.02, pay)));
          for (let i = 0; i < m; i++) {
            const s = (1 - i / (m - 1)) * pay; // s 0 at the sheave, `pay` at the free end
            const x = lerp(Sx, tx, s);
            const y = ty + (Sy - ty) * (1 - s) * (1 - s);
            payout.set(i, x, Math.max(y, floorAt(x) + RC), 0, pay > 0.999 ? lightAt(tx, ms.amp) : 0, 0, 0);
          }
          payout.strip(0, m, sTouch);
          A.cableTouch.position.set(tx, ty, 0);
        }
        payout.end();
        payout.mesh.visible = ms.lay;
      }
      if (!ms.lay) A.cableTouch.position.set(sternW.x - 1.25 * Math.abs(floorAt(sternW.x)), floorAt(sternW.x - 1.25 * Math.abs(floorAt(sternW.x))) + RC, 0);
      cable.tick(time, S, flow);
      payout.tick(time, S, flow);

      /* the plough */
      plough.group.visible = ms.pl > 0.001 && ms.pl < 0.999 ? true : ms.pl > 0.001;
      plough.group.position.set(ms.plX, floorAt(ms.plX) - 10, 0);
      plough.group.rotation.z = Math.atan2(floorAt(ms.plX + 150) - floorAt(ms.plX - 150), 300);
      const plA = smooth(0, 0.04, ms.pl) * (1 - smooth(0.985, 1, ms.pl) * 0.0);
      for (const p of plough.parts) p.userData.fade(plA);
      FU.uPl.value.set(SEA.plough[0], ms.plX, ms.pl > 0.001 ? 1 : 0);
      A.plough.position.set(ms.plX, floorAt(ms.plX), 0);
      tow.obj.visible = plA > 0.01;
      if (plA > 0.01) {
        if (shipOn > 0.01 && sternW.x > ms.plX) tow.set(ms.plX + 130, floorAt(ms.plX) + 100, 0, sternW.x, sternW.y, 0);
        else tow.set(ms.plX + 130, floorAt(ms.plX) + 100, 0, ms.plX + 2600, 0, 0);
      }

      /* the repeaters: the light relaunched (its band glows, a breath of light leaves it) */
      for (let i = 0; i < reps.length; i++) {
        const x = REPS[i];
        const lit = ms.amp * clamp01(S.pulse);
        reps[i].ringMat.color.copy(VEILLE).multiplyScalar(0.25 + 1.6 * lit);
        repGlow[i].set(lit * (0.55 + 0.25 * Math.sin(time * 1.3 + i)));
        reps[i].group.position.y = cableAt(x, P).y;
      }

      /* the anchor: dragged across (−z → the cable), it hooks it and drags it into a V */
      const an = clamp01(S.anchor);
      anc.group.visible = an > 0.005;
      for (const p of anc.parts) p.userData.fade(smooth(0, 0.08, an));
      const az = lerp(-2200, -40, smooth(0, 0.75, an)) + 190 * ms.hook;
      const ax = SEA.anchor;
      const ay = floorAt(ax);
      anc.group.position.set(ax, ay - 8 + 70 * ms.hook, az);
      anc.group.rotation.set(-1.25, 0, 0.12); // lying on its shank, flukes down into the bottom, ring toward −z
      A.anchor.position.copy(anc.group.position);
      chain.obj.visible = an > 0.005;
      if (an > 0.005) {
        anc.ring.getWorldPosition(tmp);
        chain.set(tmp.x, tmp.y, tmp.z, ax - 600, 0, az - 4200);
      }
      furrow.visible = an > 0.02;
      if (furrow.visible) {
        furrow.position.set(ax, ay + 4, -2200);
        furrow.scale.set(1, 1, Math.max(1, az + 2200 - 120));
      }
      // the break: two ends apart, two glints of signal; the light stops there
      const fA = fault && ms.g < 0.001 ? smooth(0.5, 0.9, S.fault) : 0;
      for (let k = 0; k < 2; k++) {
        cableAt(SEA.anchor + (k ? 34 : -34), P);
        breakGlow[k].mesh.position.copy(P);
        breakGlow[k].set(fA * (0.85 + 0.15 * Math.sin(time * 2.1 + k)));
      }
      A.fault.position.set(SEA.anchor, P.y, P.z);

      /* the grapnel: dragged across, it hooks the cable, then rides up with the end it holds */
      const g = ms.g;
      grp.group.visible = g > 0.005;
      for (const p of grp.parts) p.userData.fade(smooth(0, 0.06, g));
      if (g <= 1) {
        grp.group.position.set(xr + 300, floorAt(xr + 300) - 6, lerp(-1800, 30, ease(g)));
        grp.group.rotation.set(-0.9, 0, 0);
      } else {
        const e = ease(ms.h);
        grp.group.position.set(lerp(xr + 300, ms.Hx, e), lerp(yr, ms.Hy, e) - 20, 0);
        grp.group.rotation.set(Math.PI, 0, 0);
      }
      A.grapnel.position.copy(grp.group.position);
      rope.obj.visible = g > 0.005 && ms.mend < 0.999;
      if (rope.obj.visible) {
        grp.top.getWorldPosition(tmp);
        rope.set(tmp.x, tmp.y, tmp.z, ms.Hx, ms.Hy + 30, 0);
      }
      const mg = ms.mend * (1 - 0.6 * ms.loop) * clamp01(S.pulse);
      for (let k = 0; k < 2; k++) {
        cableAt(xr + (k ? 340 : -340), P);
        mendGlow[k].mesh.position.copy(P);
        mendGlow[k].set(mg * 0.7);
      }
      A.loop.position.set(xr, floorAt(xr), SEA.loop / 2);
    },
  };
}

/* ═════════════════════════════ TERRE ═════════════════════════════ */

const RL = 7; //            the cables of the land (a model: you follow them from across the street)
const DY = LAND.duct; //     the ducts' centre (y)
const DUCTS = [[-15, DY + 14], [15, DY + 14], [-15, DY - 14], [15, DY - 14]]; // [z, y]: the old bundle (B = [1]: the one we blow into)
const DR = 11; //            a duct's radius

/** The 32 homes: two rows of houses and small blocks of flats, a window per home on the street side. */
function layoutHomes() {
  const rows = [
    { z: LAND.homeRows[0], face: 1, items: [["house", 6400], ["house", 6950], ["you", LAND.building[0]], ["house", 8250], ["flats", 8900], ["house", 9420]] },
    { z: LAND.homeRows[1], face: -1, items: [["flats", 6520], ["house", 7170], ["house", 7720], ["flats", 8360], ["house", 9000], ["house", 9480]] },
  ];
  const homes = [];
  const shapes = [];
  for (const row of rows) {
    for (const [kind, x] of row.items) {
      const w = kind === "house" ? 380 : kind === "you" ? 600 : 470;
      const d = kind === "house" ? 380 : 500;
      const floors = kind === "house" ? 1 : 3;
      const h = floors * LAND.floor;
      shapes.push({ kind, x, z: row.z, w, d, h, floors, face: row.face });
      const fz = row.z + row.face * (d / 2 + 0.5);
      if (kind === "house") homes.push({ x, y: 150, z: fz, face: row.face, building: shapes.length - 1 });
      else for (let f = 0; f < 3; f++) for (const dx of [-w / 4, w / 4]) homes.push({ x: x + dx, y: f * LAND.floor + 150, z: fz, face: row.face, building: shapes.length - 1, you: kind === "you" && f === 1 && dx < 0 });
    }
  }
  return { homes, shapes };
}

const WIN_VS = /* glsl */ `
  uniform float uLit[33]; uniform vec2 uYou; uniform float uYouK; attribute float aHome; varying vec2 vUv; varying float vLit; varying float vDepth; varying float vK;
  void main() {
    vUv = uv; vLit = uLit[int(aHome + 0.5)];
    vK = aHome > uYou.x - 0.5 && aHome < uYou.y + 0.5 ? uYouK : 1.0;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const WIN_FS = /* glsl */ `
  uniform vec3 uVei, uInk; uniform float uAmount, uFar; varying vec2 vUv; varying float vLit; varying float vDepth; varying float vK;
  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    vec2 e = 1.0 - smoothstep(vec2(0.78), vec2(1.0), abs(q));
    float frame = (1.0 - e.x * e.y) * step(abs(q.x), 1.0);
    float mull = 1.0 - 0.45 * (1.0 - smoothstep(0.03, 0.08, abs(q.x)));
    float glow = e.x * e.y * mull * (0.65 + 0.35 * (1.0 - vUv.y));
    vec3 c = uVei * glow * (0.02 + 1.25 * vLit) + uInk * frame * 0.18;
    gl_FragColor = vec4(c * uAmount * vK * exp(-vDepth / uFar), 1.0);
  }`;

function buildTerre() {
  const group = new THREE.Group();
  const A = {};
  const anchorAt = (name, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    group.add(o);
    A[name] = o;
    return o;
  };
  const glassOf = (o = {}) => glass(BRAND.ink, { base: 0.003, rim: 0.18, power: 2.6, edge: 0.4, through: 0.15, ...o });

  /* the ground: water, sand, street, all in lines */
  const ground = gridFloor({ x0: -3000, x1: 11000, z0: -2600, z1: 2600, nx: 1, nz: 1, yAt: () => 0, step: 100, major: 500, k: 0.26, kind: 1 });
  group.add(ground);
  const GU = ground.material.uniforms;
  {
    // the seabed off the beach, and the street's kerbs and pavements
    const L = [];
    for (const z of [-2400, -1200, 0, 1200, 2400]) {
      const p = [];
      for (let x = -3000; x <= 0; x += 150) p.push([x, -Math.min(600, Math.pow(-x / 3000, 0.8) * 600) - 4, z]);
      run(L, p);
    }
    for (let x = -2800; x <= 0; x += 400) run(L, [[x, -Math.min(600, Math.pow(-x / 3000, 0.8) * 600) - 4, -2400], [x, -Math.min(600, Math.pow(-x / 3000, 0.8) * 600) - 4, 2400]]);
    group.add(segs(L, BRAND.ink, 1.8, 0.16));
    const K = [];
    const [s0, s1] = LAND.street;
    for (const z of [-340, 340]) {
      run(K, [[s0, 0, z], [s1, 0, z]]);
      run(K, [[s0, 14, z + Math.sign(z) * 4], [s1, 14, z + Math.sign(z) * 4]]);
    }
    for (const z of [-640, 640]) run(K, [[s0, 14, z], [s1, 14, z]]);
    for (let x = s0; x <= s1; x += 700) for (const z of [-490, 490]) run(K, [[x, 14, z - 150], [x, 14, z + 150]]);
    group.add(segs(K, BRAND.ink, 2, 0.4));
  }

  /* the beach: the drilled duct from the seabed up under the sand into the landing chamber */
  const ductPath = smoothPath([[-2800, -520, 0], [-1800, -400, 0], [-600, -300, 0], [600, LAND.beachDuct, 0], [1500, -240, 0], [LAND.landing - 90, -150, 0]], 16);
  const beachDuctGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ductPath.map((p) => new THREE.Vector3(...p))), 120, 34, 20, false);
  const beachDuctMat = glassOf({ rim: 0.42, edge: 0.8, through: 0.3 });
  const beachDuct = new THREE.Mesh(beachDuctGeo, beachDuctMat);
  const chamberGeo = box(260, 220, 220, 4).translate(LAND.landing, -110, 0);
  const chamberMat = glassOf({ rim: 0.22, edge: 0.5 });
  const chamber = new THREE.Mesh(chamberGeo, chamberMat);
  const chamberE = edgesOf(chamberGeo, { width: 1.9, opacity: 0.7 });
  const lidE = segs([LAND.landing - 90, 1, -90, LAND.landing + 90, 1, -90, LAND.landing + 90, 1, -90, LAND.landing + 90, 1, 90, LAND.landing + 90, 1, 90, LAND.landing - 90, 1, 90, LAND.landing - 90, 1, 90, LAND.landing - 90, 1, -90], BRAND.ink, 2, 0.5);
  asShell([beachDuct, chamber], 20);
  group.add(beachDuct, chamber, chamberE, lidE);
  // the subsea cable inside it, lit from the sea, out of the chamber and on to the central office
  const seaLine = smoothPath([[-3000, -540, 0], ...ductPath.slice(1).map((p) => [p[0], p[1] - 6, p[2]]), [LAND.landing, -150, 0], [LAND.landing + 120, -150, 0], [LAND.landing + 160, DY, -40], [LAND.central - 80, DY, -40], [LAND.central - 80, DY, -560], [LAND.central - 80, 30, -600]], 4);
  const seaCable = staticRibbon([{ pts: seaLine }], { r: 12, minPx: 3, body: 0.17, period: 700, speed: 420, idle: 0.22 });
  group.add(seaCable.mesh);

  /* the central office: a low block of glass across the street from the beach end */
  const centralGeo = box(560, 420, 460, 6).translate(LAND.central, 210, -880);
  const centralMat = glassOf();
  const central = new THREE.Mesh(centralGeo, centralMat);
  asShell(central, 20);
  group.add(central, edgesOf(centralGeo, { width: 1.8, opacity: 0.45 }));

  /* the street: the old bundle of telephone ducts, the copper cable in one of them */
  const [s0, s1] = LAND.street;
  const ductMat = glassOf({ rim: 0.3, edge: 0.6, through: 0.1 });
  const crushMat = glass(BRAND.ink, { base: 0.003, rim: 0.3, power: 2.6, edge: 0.6 });
  const ducts = [];
  const tube = (x0, x1, z, y, mat) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(DR, DR, x1 - x0, 20, 1, true), mat);
    m.rotation.z = Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, z);
    return m;
  };
  for (let k = 0; k < DUCTS.length; k++) {
    const [z, y] = DUCTS[k];
    if (k === 1) {
      ducts.push(tube(s0, LAND.crushed - 70, z, y, ductMat), tube(LAND.crushed + 70, s1, z, y, ductMat));
    } else ducts.push(tube(s0, s1, z, y, ductMat));
  }
  // the crushed piece of duct B: flattened, its glass turns signal
  const crush = tube(LAND.crushed - 70, LAND.crushed + 70, DUCTS[1][0], DUCTS[1][1], crushMat);
  ducts.push(crush);
  asShell(ducts, 20);
  const ductLines = [];
  for (const [z, y] of DUCTS) for (const s of [-1, 1]) run(ductLines, [[s0, y + s * DR * 0.92, z + 6], [s1, y + s * DR * 0.92, z + 6]]);
  const ductL = segs(ductLines, BRAND.ink, 1.8, 0.35);
  // the trench they were laid in (a dashed outline in the cut)
  const trenchL = segs([s0, -2, 60, s1, -2, 60, s0, DY - 40, 60, s1, DY - 40, 60], BRAND.ink, 1.8, 0.22);
  const copperMat = solid(0x2b2f32, { rough: 0.75, metal: 0.1 });
  const copper = new THREE.Mesh(cyl(7.5, s1 - s0, 0.6, 18), copperMat);
  copper.rotation.z = Math.PI / 2;
  copper.position.set((s0 + s1) / 2, DUCTS[0][1] - 2, DUCTS[0][0]);
  copper.add(edgesOf(copper.geometry, { width: 1.8, opacity: 0.4 }));
  const underground = new THREE.Group();
  underground.add(...ducts, ductL, trenchL, copper);
  group.add(underground);
  const crushGlow = softGlow(BRAND.signal, { size: 22, minPx: 12, k: 1.3 });
  crushGlow.mesh.position.set(LAND.crushed - 66, DUCTS[1][1], DUCTS[1][0]);
  group.add(crushGlow.mesh);

  /* the pulling pit, the blower and its drum */
  const pitGeo = box(200, 180, 200, 4).translate(LAND.pit, -90, 0);
  const pitMat = glassOf({ rim: 0.24, edge: 0.55 });
  const pit = new THREE.Mesh(pitGeo, pitMat);
  asShell(pit, 19);
  const pitE = edgesOf(pitGeo, { width: 1.9, opacity: 0.6 });
  const blowerGeo = box(130, 90, 80, 5).translate(LAND.pit - 40, 45 + 14, -360);
  const blowerMat = glassOf({ rim: 0.24, edge: 0.55 });
  const blower = new THREE.Mesh(blowerGeo, blowerMat);
  asShell(blower, 19);
  const blowerE = edgesOf(blowerGeo, { width: 1.9, opacity: 0.6 });
  const drum = new THREE.Group();
  const drumMat = solid(0x8a9095, { rough: 0.5, metal: 0.25 });
  const coilM = solid(0x4b5155, { rough: 0.6 });
  for (const z of [-46, 46]) {
    const disc = new THREE.Mesh(cyl(62, 6, 1, 48), drumMat);
    disc.rotation.x = Math.PI / 2;
    disc.position.z = z;
    disc.add(edgesOf(disc.geometry, { width: 1.8, opacity: 0.55, color: 0x1d2226 }));
    drum.add(disc);
  }
  const wound = new THREE.Mesh(cyl(46, 86, 2, 48), coilM);
  wound.rotation.x = Math.PI / 2;
  drum.add(wound);
  drum.position.set(LAND.pit - 260, 76, -420);
  group.add(pit, pitE, blower, blowerE, drum);
  // the new cable: off the drum, through the blower, down into the pit and into duct B, as far as its head
  const NB = 160;
  const blown = makeRibbon(NB, { r: RL, minPx: 3, body: 0.24, edge: 0.65, period: 600, speed: 360 });
  blown.mat.uniforms.uIdle.value = 0;
  blown.mat.uniforms.uPulse.value = 0;
  group.add(blown.mesh);
  const feedPts = smoothPath([[LAND.pit - 260, 122, -420], [LAND.pit - 120, 70, -380], [LAND.pit - 40, 60, -360], [LAND.pit + 30, 40, -260], [LAND.pit + 10, -60, -80], [LAND.pit + 40, DUCTS[1][1], DUCTS[1][0]]], 6);
  const headGeo = lathe([[0, -14], [RL + 1.5, -14], [RL + 1.5, 4], [5, 14], [0, 18]], 24, { bevel: 0.8 });
  const headMat = solid(0xa8adb0, { rough: 0.4, metal: 0.3 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.rotation.z = -Math.PI / 2;
  head.add(edgesOf(headGeo, { width: 1.8, opacity: 0.6, color: 0x1d2226 }));
  group.add(head);
  // the air that pushes it: streaks in duct B, overtaking the head
  const airMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uInk: { value: INK.clone() }, uTime: { value: 0 }, uHead: { value: 0 }, uAmount: { value: 0 }, uStop: { value: 0 } },
    vertexShader: /* glsl */ `varying vec3 vW; varying vec2 vUv; void main() { vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk; uniform float uTime, uHead, uAmount, uStop; varying vec3 vW; varying vec2 vUv;
      void main() {
        if (uAmount < 0.003) discard;
        float ph = fract((vW.x - uTime * mix(380.0, 40.0, uStop)) / 140.0 + 0.37 * floor(vUv.x * 6.0));
        float streak = smoothstep(0.55, 0.95, ph) * (1.0 - smoothstep(0.95, 1.0, ph));
        float lane = 1.0 - smoothstep(0.2, 0.5, abs(fract(vUv.x * 6.0) - 0.5));
        float reach = smoothstep(uHead + 520.0, uHead + 60.0, vW.x) * smoothstep(${(LAND.pit + 60).toFixed(1)}, ${(LAND.pit + 200).toFixed(1)}, vW.x);
        gl_FragColor = vec4(uInk * streak * lane * reach * uAmount * 0.55, 1.0);
      }`,
  });
  const air = new THREE.Mesh(new THREE.CylinderGeometry(DR * 0.7, DR * 0.7, s1 - LAND.pit, 12, 1, true), airMat);
  air.rotation.z = Math.PI / 2;
  air.position.set((LAND.pit + s1) / 2, DUCTS[1][1], DUCTS[1][0]);
  air.renderOrder = 6;
  group.add(air);
  // the old cable that comes from the central office and ends in the pit, coiled (the two cables meet there)
  const oldIn = staticRibbon([{ pts: [[LAND.central + 60, 30, -600], [LAND.central + 60, DUCTS[1][1], -560], [LAND.central + 60, DUCTS[1][1], DUCTS[1][0]], [LAND.pit - 120, DUCTS[1][1], DUCTS[1][0]], ...smoothPath([[LAND.pit - 100, DUCTS[1][1], DUCTS[1][0]], [LAND.pit - 40, -120, 30], [LAND.pit + 20, -150, -20], [LAND.pit - 50, -160, -50], [LAND.pit - 60, -140, 40]], 6)] }], { r: RL, minPx: 3, body: 0.2, period: 600, speed: 360, idle: 0.22 });
  group.add(oldIn.mesh);

  /* the street cabinet (PM), its doors open, its cassettes; the feed into it */
  const [cx, , cz] = LAND.cabinet;
  const cab = new THREE.Group();
  cab.position.set(cx, 0, cz);
  group.add(cab);
  const cabGeo = box(100, 150, 46, 3).translate(0, 75 + 10, 0);
  const cabMat = glassOf({ rim: 0.26, edge: 0.6 });
  const cabShell = new THREE.Mesh(cabGeo, cabMat);
  const doorGeoL = box(50, 146, 3, 1).translate(25, 0, 0);
  const doorGeoR = box(50, 146, 3, 1).translate(-25, 0, 0);
  const doorMat = glassOf({ rim: 0.14, edge: 0.35 });
  const doorL = new THREE.Mesh(doorGeoL, doorMat);
  doorL.position.set(-50, 85, 24);
  doorL.rotation.y = -1.9;
  const doorR = new THREE.Mesh(doorGeoR, doorMat);
  doorR.position.set(50, 85, 24);
  doorR.rotation.y = 1.9;
  asShell([cabShell, doorL, doorR], 20);
  cab.add(cabShell, doorL, doorR, edgesOf(cabGeo, { width: 1.9, opacity: 0.7 }));
  doorL.add(edgesOf(doorGeoL, { width: 1.8, opacity: 0.55 }));
  doorR.add(edgesOf(doorGeoR, { width: 1.8, opacity: 0.55 }));
  const cassMat = solid(0x8c9296, { rough: 0.5, metal: 0.2 });
  const cassDark = solid(0x4a5054, { rough: 0.6, metal: 0.1 });
  for (let k = 0; k < 9; k++) {
    const geo = box(76, 4.5, 30, 0.8);
    const m = new THREE.Mesh(geo, k % 3 === 2 ? cassMat : cassDark);
    m.position.set(0, 46 + k * 9.5, -2);
    m.add(edgesOf(geo, { width: 1.8, opacity: 0.5, color: k % 3 === 2 ? 0x1d2226 : BRAND.ink }));
    cab.add(m);
  }
  const coupl = new THREE.Mesh(box(30, 10, 14, 1.5), solid(0xc9c6bb, { rough: 0.45 }));
  coupl.position.set(0, 140, 0);
  coupl.add(edgesOf(coupl.geometry, { width: 1.8, opacity: 0.6, color: 0x1d2226 }));
  cab.add(coupl);
  const feed = staticRibbon([{ pts: [[LAND.crushed + 200, DUCTS[1][1], DUCTS[1][0]], [cx - 30, DUCTS[1][1], DUCTS[1][0]], ...smoothPath([[cx - 30, DUCTS[1][1], DUCTS[1][0]], [cx - 10, -40, cz - 120], [cx - 10, 20, cz - 6], [cx - 10, 136, cz]], 6)] }], { r: RL, minPx: 3, body: 0.2, period: 600, speed: 360, idle: 0.22 });
  group.add(feed.mesh);

  /* the 32 homes, their windows, their drop cables under the pavement */
  const { homes, shapes } = layoutHomes();
  const townMat = glassOf({ rim: 0.14, edge: 0.3, through: 0.18 });
  const youMat = glassOf({ rim: 0.16, edge: 0.34, through: 0.18 });
  const townGeos = [];
  const townE = [];
  let youGeo = null;
  for (const s of shapes) {
    const geo = new THREE.BoxGeometry(s.w, s.h, s.d).translate(s.x, s.h / 2, s.z);
    if (s.kind === "you") youGeo = geo;
    else townGeos.push(geo);
    const x0 = s.x - s.w / 2, x1 = s.x + s.w / 2, z0 = s.z - s.d / 2, z1 = s.z + s.d / 2;
    for (let f = 1; f < s.floors; f++) run(townE, [[x0, f * LAND.floor, z0], [x1, f * LAND.floor, z0], [x1, f * LAND.floor, z1], [x0, f * LAND.floor, z1]], true);
    if (s.kind === "house") {
      // a gable roof in lines
      const r = s.h + 160;
      run(townE, [[x0, s.h, s.z], [x0, r, s.z]]);
      run(townE, [[x0, s.h, z0], [x0, r, s.z], [x0, s.h, z1]]);
      run(townE, [[x1, s.h, z0], [x1, r, s.z], [x1, s.h, z1]]);
      run(townE, [[x0, r, s.z], [x1, r, s.z]]);
    }
  }
  const town = new THREE.Mesh(mergeBoxes(townGeos), townMat);
  const you = new THREE.Mesh(youGeo, youMat);
  asShell([town, you], 20);
  const townEdges = new THREE.Group();
  for (const s of shapes) if (s.kind !== "you") townEdges.add(edgesOf(new THREE.BoxGeometry(s.w, s.h, s.d).translate(s.x, s.h / 2, s.z), { width: 1.8, opacity: 0.42 }));
  const youEdges = edgesOf(youGeo, { width: 1.9, opacity: 0.55 });
  const floorsL = segs(townE, BRAND.ink, 1.8, 0.24);
  group.add(town, you, townEdges, youEdges, floorsL);
  // windows: one instanced quad per home, lit by its share
  const litArr = new Float32Array(33);
  const upArr = new Float32Array(33);
  litArr[32] = 1;
  const winGeo = new THREE.PlaneGeometry(76, 96);
  const aHome = new Float32Array(32);
  for (let i = 0; i < 32; i++) aHome[i] = i;
  winGeo.setAttribute("aHome", new THREE.InstancedBufferAttribute(aHome, 1));
  const winMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uYou: { value: new THREE.Vector2(0, -1) }, uYouK: { value: 1 }, uLit: { value: litArr }, uVei: { value: VEILLE.clone() }, uInk: { value: INK.clone() }, uAmount: { value: 1 }, uFar: { value: 1e9 } },
    vertexShader: WIN_VS,
    fragmentShader: WIN_FS,
  });
  const wins = new THREE.InstancedMesh(winGeo, winMat, 32);
  const mm = new THREE.Matrix4();
  A.homes = [];
  homes.forEach((h, i) => {
    mm.makeRotationY(h.face > 0 ? 0 : Math.PI).setPosition(h.x, h.y, h.z + h.face * 1.5);
    wins.setMatrixAt(i, mm);
    const o = new THREE.Object3D();
    o.position.set(h.x, h.y, h.z);
    group.add(o);
    A.homes.push(o);
  });
  wins.frustumCulled = false;
  wins.renderOrder = 7;
  group.add(wins);
  const youHome = homes.findIndex((h) => h.you);
  {
    const yb = homes[youHome].building;
    const ids = homes.map((h, i) => (h.building === yb ? i : -1)).filter((i) => i >= 0);
    winMat.uniforms.uYou.value.set(Math.min(...ids), Math.max(...ids));
  }
  // the drops: from the cabinet, under the pavement, to the foot of each facade and up to its window
  const drops = homes.map((h, i) => {
    const zP = Math.sign(h.z) * 520;
    const zF = h.z;
    const lane = (i % 8) * 5 - 18;
    return {
      home: i,
      pts: [[cx + lane * 0.3, -30, cz - 10], [cx + lane * 0.3, -50 - (i % 4) * 4, cz - 10], [cx + lane * 0.3, -50 - (i % 4) * 4, zP + lane], [h.x + lane, -50 - (i % 4) * 4, zP + lane], [h.x + lane, -50 - (i % 4) * 4, zF - h.face * 6], [h.x + lane, h.y - 54, zF - h.face * 6]],
    };
  });
  const dropR = staticRibbon(drops, { r: 1.2, minPx: 2.0, body: 0.22, edge: 0.4, core: 0.5, period: 500, speed: 300, idle: 0.3 });
  dropR.mat.uniforms.uLit.value = litArr;
  dropR.mat.uniforms.uUp.value = upArr;
  group.add(dropR.mesh);

  /* your building: the riser, the box on the landing, the last fine cable to your flat */
  const [bx, , bz] = LAND.building;
  const RM = LAND.room;
  const coffret = new THREE.Group();
  const coffMat = solid(0xb9b6ab, { rough: 0.5 });
  const coffGeo = box(36, 46, 12, 1.5);
  const coffM = new THREE.Mesh(coffGeo, coffMat);
  coffM.add(edgesOf(coffGeo, { width: 1.8, opacity: 0.7, color: 0x1d2226 }));
  coffret.add(coffM);
  const LC = [bx + 230, LAND.floor + 150, bz + 236];
  coffret.position.set(...LC);
  group.add(coffret);
  const riserPts = [[cx + 10, -40, cz - 10], [cx + 10, -64, cz - 10], [cx + 10, -64, -560], [LC[0], -64, -560], [LC[0], -64, LC[2] - 10], [LC[0], LC[1] - 23, LC[2] - 10]];
  const finePts = smoothPath([[LC[0] - 10, LC[1] + 23, LC[2] - 6], [LC[0] - 10, LAND.floor + 270, LC[2] - 6], [RM[0] + RM[0] * 0 - 80 + 2, LAND.floor + 270, LC[2] - 6], [RM[0] - 78, LAND.floor + 270, RM[2] + 2], [RM[0] - 78, RM[1] + LAND.socket[1] + 6, RM[2] + 2]], 3);
  const riser = staticRibbon([{ pts: riserPts }], { r: 3.2, minPx: 2.6, body: 0.2, edge: 0.55, core: 0.45, period: 260, speed: 160, idle: 0.3 });
  const fine = staticRibbon([{ pts: finePts, s0: 2600 }], { r: 0.35, minPx: 2.4, body: 0.6, edge: 0.0, core: 0.5, period: 60, speed: 40, idle: 0.3 });
  fine.mat.uniforms.uBody.value.setRGB(0.55, 0.56, 0.54);
  group.add(riser.mesh, fine.mesh);

  /* your room: the wall, the socket and its green connector, the cupboard, the box, the cord */
  const room = new THREE.Group();
  room.position.set(...RM);
  group.add(room);
  const wallGeo = new THREE.PlaneGeometry(420, 300).translate(0, 150, 0);
  const wallMat = glass(BRAND.ink, { base: 0.012, rim: 0.0, power: 2, edge: 0 });
  const wall = new THREE.Mesh(wallGeo, wallMat); // (kept for its uniform; not drawn: the wall is its lines)
  const RL0 = [];
  run(RL0, [[-210, 0, 0], [210, 0, 0], [210, 300, 0], [-210, 300, 0]], true);
  run(RL0, [[-210, 0, 0], [-210, 0, 260]]);
  run(RL0, [[210, 0, 0], [210, 0, 260]]);
  run(RL0, [[-210, 9, 0.6], [210, 9, 0.6]]); // the skirting
  const roomLines = segs(RL0, BRAND.ink, 1.9, 0.5);
  room.add(roomLines);
  const roomFloor = gridFloor({ x0: RM[0] - 210, x1: RM[0] + 210, z0: RM[2], z1: RM[2] + 260, nx: 1, nz: 1, yAt: () => RM[1] + 0.2, step: 20, major: 100, k: 0.32, kind: 2 });
  roomFloor.material.uniforms.uZ.value.set(RM[2] - 2000, RM[2] + 2260);
  group.add(roomFloor);
  // the socket (PTO): a white plate, its green connector plugged in from below
  const white = solid(0xd9d5c9, { rough: 0.55 });
  const mid = solid(0x8d8e89, { rough: 0.6 });
  const dark = solid(0x1d2022, { rough: 0.8 });
  const greenM = solid(new THREE.Color(BRAND.veille).multiplyScalar(0.62), { rough: 0.45 });
  greenM.emissive = new THREE.Color(BRAND.veille);
  greenM.emissiveIntensity = 0.22;
  const [sxo, syo] = LAND.socket;
  const pto = new THREE.Mesh(box(9, 12, 3.2, 0.5), white);
  pto.position.set(sxo, syo, 1.6);
  pto.add(edgesOf(pto.geometry, { width: 1.8, opacity: 0.55, color: 0x1d2226 }));
  room.add(pto);
  const ptoPort = new THREE.Mesh(box(3, 2, 1, 0.3), mid);
  ptoPort.position.set(sxo, syo - 6.2, 2);
  room.add(ptoPort);
  const scGeo = box(1.3, 3.4, 1.3, 0.25);
  const scPto = new THREE.Mesh(scGeo, greenM);
  scPto.position.set(sxo, syo - 8, 2);
  scPto.add(edgesOf(scGeo, { width: 1.8, opacity: 0.5, color: 0x1d2226 }));
  room.add(scPto);
  // the cupboard: glass on four solid feet (the back-left one is the one that pinches)
  const [fx0, fy0, fz0] = LAND.furniture;
  const cupGeo = box(160, 62, 50, 1.5).translate(fx0, fy0 + 4, fz0);
  const cupMat = glass(BRAND.ink, { base: 0.003, rim: 0.2, power: 2.6, edge: 0.5, spec: 0.3, through: 0.2 });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  asShell(cup, 20);
  const cupE = edgesOf(cupGeo, { width: 1.9, opacity: 0.6 });
  room.add(cup, cupE);
  const footMat = solid(0x3a3f43, { rough: 0.6 });
  const feetE = [];
  const FOOT = [fx0 - 74, 0, fz0 - 19]; // the back-left foot
  for (const [dx, dz] of [[-74, -19], [74, -19], [-74, 19], [74, 19]]) {
    const geo = box(7, 8, 7, 1);
    const m = new THREE.Mesh(geo, footMat);
    m.position.set(fx0 + dx, 4 + 0.3, fz0 + dz);
    const e = edgesOf(geo, { width: 1.9, opacity: 0.7 });
    m.add(e);
    feetE.push(e);
    room.add(m);
  }
  const footEdge = feetE[0];
  // the box: solid, three greys, its back toward the wall: vents, two network ports, the power jack, the fibre port
  const boxG = new THREE.Group();
  const [bxo, byo, bzo] = LAND.box;
  boxG.position.set(bxo, byo, bzo);
  room.add(boxG);
  const caseMat = solid(0xb9b6ab, { rough: 0.5 }); // a light box on the dark (clair sur sombre)
  const backMat = solid(0x8d8e89, { rough: 0.55 });
  const lightMat = solid(0xd9d5c9, { rough: 0.45 });
  const caseGeo = box(40, 50, 14, 1.6);
  const caseM = new THREE.Mesh(caseGeo, caseMat);
  caseM.add(edgesOf(caseGeo, { width: 1.9, opacity: 0.8, color: 0x1d2226 }));
  boxG.add(caseM);
  const back = new THREE.Mesh(box(34, 38, 1, 0.4), backMat);
  back.position.set(0, -2, -7.1);
  boxG.add(back);
  for (let k = 0; k < 7; k++) {
    const v = new THREE.Mesh(box(22, 1.2, 1, 0.3), dark);
    v.position.set(-2, 14 - k * 3, -7.7);
    boxG.add(v);
  }
  const label = new THREE.Mesh(box(12, 7, 0.6, 0.2), lightMat);
  label.position.set(-9, -12, -7.6);
  boxG.add(label);
  for (const x of [-4, 3.5]) {
    const port = new THREE.Mesh(box(5.4, 4.6, 1.4, 0.3), dark);
    port.position.set(x, -18, -7.7);
    port.add(edgesOf(port.geometry, { width: 1.8, opacity: 0.4 }));
    boxG.add(port);
  }
  const jack = new THREE.Mesh(cyl(1.6, 1.6, 0.3, 24), dark);
  jack.rotation.x = Math.PI / 2;
  jack.position.set(-14, -18, -7.8);
  boxG.add(jack);
  const fport = new THREE.Mesh(box(4, 3, 1.2, 0.3), mid);
  fport.position.set(10, -12, -7.8);
  boxG.add(fport);
  const scBox = new THREE.Mesh(box(1.3, 1.3, 3.6, 0.25), greenM);
  scBox.position.set(10, -12, -9.6);
  scBox.add(edgesOf(scBox.geometry, { width: 1.8, opacity: 0.5, color: 0x1d2226 }));
  boxG.add(scBox);
  const led = softGlow(BRAND.veille, { size: 0.9, minPx: 7, k: 1.1 });
  led.mesh.position.set(14, 20, -7.9);
  boxG.add(led.mesh);
  // the cord: socket → down the wall → along the floor past the foot → back up to the box's fibre port
  const NC = 90;
  const cord = makeRibbon(NC, { r: 0.3, minPx: 3, body: 0.75, edge: 0.0, core: 0.42, period: 34, speed: 26, idle: 0.25 });
  cord.mat.uniforms.uBody.value.setRGB(0.62, 0.63, 0.6);
  room.add(cord.mesh);
  const pinchGlow = softGlow(BRAND.signal, { size: 3.2, minPx: 18, k: 1.6 });
  room.add(pinchGlow.mesh);
  // its control points at pinch 0 (beside the foot) and 1 (under it, folded), fixed arrays
  const C0 = [[sxo, syo - 9.8, 2], [sxo, syo - 22, 3.5], [sxo + 1, 1.6, 9], [-70, 0.3, 32], [FOOT[0] + 22, 0.3, FOOT[2] - 6], [FOOT[0] + 30, 0.3, FOOT[2] - 30], [-6, 0.3, 30], [bxo + 10, 1.5, bzo - 14], [bxo + 10, byo - 22, bzo - 12], [bxo + 10, byo - 12, bzo - 11.4]];
  const C1 = [[sxo, syo - 9.8, 2], [sxo, syo - 22, 3.5], [sxo + 1, 1.6, 9], [-74, 0.3, 40], [FOOT[0], 0.25, FOOT[2] + 1], [FOOT[0] + 4, 0.3, FOOT[2] - 9], [-6, 0.3, 30], [bxo + 10, 1.5, bzo - 14], [bxo + 10, byo - 22, bzo - 12], [bxo + 10, byo - 12, bzo - 11.4]];
  const CK = C0.map((p) => [...p]);
  const PER = 10;
  const sampleCord = (pinch) => {
    for (let i = 0; i < CK.length; i++) for (let j = 0; j < 3; j++) CK[i][j] = lerp(C0[i][j], C1[i][j], pinch);
    // under the foot the cord is pressed flat and folded: its two sides come close
    let n = 0;
    const last = CK.length - 1;
    for (let i = 0; i < last; i++) {
      const p0 = CK[Math.max(0, i - 1)], p1 = CK[i], p2 = CK[i + 1], p3 = CK[Math.min(last, i + 2)];
      for (let k = 0; k < PER; k++) {
        const t = k / PER, t2 = t * t, t3 = t2 * t;
        const tight = i === 4 ? pinch : 0; // the fold: no tangent smoothing at the foot
        const f = (j) => {
          const m1 = (1 - tight) * 0.5 * (p2[j] - p0[j]);
          const m2 = 0.5 * (p3[j] - p1[j]) * (i === 3 ? 1 - pinch : 1);
          return (2 * t3 - 3 * t2 + 1) * p1[j] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[j] + (t3 - t2) * m2;
        };
        const beyond = i >= 4 ? 1 - 0.85 * smooth(0.3, 1, pinch) : 1; // past the fold the light is mostly gone
        cord.set(n, f(0), f(1), f(2), beyond, 0, 0);
        n++;
      }
    }
    cord.set(n, CK[last][0], CK[last][1], CK[last][2], 1 - 0.85 * smooth(0.3, 1, pinch), 0, 0);
    n++;
    cord.begin();
    cord.strip(0, n, 0);
    cord.end();
  };
  let cordKey = NaN;

  /* anchors */
  anchorAt("beachDuct", 600, LAND.beachDuct, 0);
  anchorAt("landing", LAND.landing, -110, 0);
  anchorAt("central", LAND.central, 210, -880);
  anchorAt("pit", LAND.pit, DY, 0);
  const blowHead = anchorAt("blowHead", LAND.pit, DUCTS[1][1], DUCTS[1][0]);
  anchorAt("crushed", LAND.crushed, DUCTS[1][1], DUCTS[1][0]);
  anchorAt("cabinet", cx, 90, cz);
  anchorAt("building", bx, LAND.floor, bz);
  anchorAt("box", RM[0] + bxo, RM[1] + byo, RM[2] + bzo);
  anchorAt("socket", RM[0] + sxo, RM[1] + syo, RM[2] + LAND.socket[2]);
  const pinchA = anchorAt("pinch", RM[0] + FOOT[0], RM[1] + 1, RM[2] + FOOT[2]);

  let blowKey = NaN;
  const shells = { beach: [beachDuctMat, chamberMat], ducts: [ductMat], you: [youMat] };

  return {
    group, A,
    fog(d) {
      GU.uSee.value = Math.max(2500, d * 2.6);
      roomFloor.material.uniforms.uSee.value = Math.max(200, d * 3);
      const far = Math.max(4000, d * 4);
      for (const r of [seaCable, blown, oldIn, feed, dropR, riser, fine]) r.mat.uniforms.uFar.value = far;
      winMat.uniforms.uFar.value = far * 1.5;
      return 0.3 / Math.max(3000, d * 2.4);
    },
    update(S, time, px) {
      const flow = Math.max(0, S.flow);
      GU.uTime.value = time;
      const mood = clamp01(S.mood);
      /* the beach */
      const be = 0.35 + 0.65 * clamp01(S.beach);
      for (const m of shells.beach) m.uniforms.uAmount.value = be;
      chamberE.material.opacity = 0.7 * be;
      seaCable.tick(time, S, flow);
      seaCable.mat.uniforms.uAmount.value = 0.45 + 0.55 * clamp01(S.beach);
      /* the street, cut away */
      const du = clamp01(S.ducts);
      const ug = 0.18 + 0.82 * du;
      ductMat.uniforms.uAmount.value = ug;
      ductL.material.opacity = 0.35 * ug;
      trenchL.material.opacity = 0.22 * du;
      copper.visible = du > 0.02;
      copperMat.opacity = 1;
      GU.uHole.value.set(LAND.pit, 0, 100, 1);
      /* the blowing */
      const cr = clamp01(S.crushed);
      const hx = LAND.pit + clamp01(S.blow) * (LAND.crushed - 74 - LAND.pit) + 40 * (1 - Math.min(1, S.blow * 20));
      const bOn = S.blow > 0.005;
      blowHead.position.x = hx;
      head.visible = bOn;
      head.position.set(hx, DUCTS[1][1], DUCTS[1][0]);
      crush.scale.set(1, 1, 1);
      crush.scale.x = lerp(1, 0.45, cr); // radius in y once turned (the tube lies along x: its local x is world y)
      crush.scale.z = lerp(1, 1.35, cr);
      crushMat.uniforms.uColor.value.copy(INK).lerp(SIGNAL, cr);
      crushMat.uniforms.uAmount.value = Math.max(ug, cr);
      const butt = cr * smooth(0.9, 1, S.blow);
      crushGlow.set(cr * (0.35 + 0.65 * Math.max(butt, mood * cr)));
      airMat.uniforms.uTime.value = time;
      airMat.uniforms.uHead.value = hx;
      airMat.uniforms.uStop.value = butt;
      airMat.uniforms.uAmount.value = bOn ? (1 - 0.7 * butt) * ug : 0;
      air.visible = bOn;
      const bk = Math.round(hx);
      if (bk !== blowKey) {
        blowKey = bk;
        blown.begin();
        let n = 0;
        for (const p of feedPts) {
          blown.set(n, p[0], p[1], p[2], 0, 0, 0);
          n++;
        }
        const x0 = LAND.pit + 40;
        const steps = Math.max(1, Math.min(NB - n - 1, Math.ceil((hx - 14 - x0) / 40)));
        for (let k = 1; k <= steps; k++) {
          blown.set(n, lerp(x0, hx - 14, k / steps), DUCTS[1][1], DUCTS[1][0], 0, 0, 0);
          n++;
        }
        blown.strip(0, n, 0);
        blown.end();
      }
      blown.mesh.visible = bOn;
      oldIn.tick(time, S, flow);
      oldIn.mat.uniforms.uAmount.value = 0.4 + 0.6 * du;
      /* the cabinet, the homes */
      const ho = clamp01(S.homes);
      const talk = Math.max(0, S.talk);
      const at = time * 2.2;
      for (let i = 0; i < 32; i++) {
        let d = Math.abs(((i - (at % 32)) % 32 + 32) % 32);
        d = Math.min(d, 32 - d);
        const w = Math.exp(-d * d * 0.9) * Math.min(1, talk);
        litArr[i] = ho * 0.3 + w * 0.9;
        upArr[i] = w;
      }
      litArr[32] = 1;
      feed.tick(time, S, flow);
      feed.mat.uniforms.uAmount.value = 0.35 + 0.65 * Math.max(ho, du * 0.6);
      dropR.tick(time, S, flow);
      dropR.mat.uniforms.uUpSpeed.value = 300;
      dropR.mat.uniforms.uAmount.value = 0.25 + 0.75 * ho;
      /* your building */
      const la = clamp01(S.landing);
      const ro = clamp01(S.room);
      youMat.uniforms.uAmount.value = 1 - 0.75 * Math.max(la, ro);
      youEdges.material.opacity = 0.55 * (1 - 0.6 * Math.max(la, ro));
      coffret.visible = la > 0.02 || ro > 0.02;
      riser.tick(time, S, flow);
      riser.mat.uniforms.uAmount.value = Math.max(la, ro * 0.6, ho * 0.4);
      riser.mesh.visible = riser.mat.uniforms.uAmount.value > 0.01;
      fine.tick(time, S, flow);
      fine.mat.uniforms.uAmount.value = Math.max(la, ro);
      fine.mesh.visible = la > 0.01 || ro > 0.01;
      winMat.uniforms.uYouK.value = 1 - 0.92 * Math.max(la, ro);
      /* your room */
      const roOn = ro > 0.01;
      room.visible = roOn;
      roomFloor.visible = roOn;
      wallMat.uniforms.uAmount.value = ro;
      cupMat.uniforms.uAmount.value = ro;
      roomLines.material.opacity = 0.5 * ro;
      cupE.material.opacity = 0.6 * ro;
      roomFloor.material.uniforms.uAmount.value = ro;
      const pinch = clamp01(S.pinch);
      if (roOn && pinch !== cordKey) {
        cordKey = pinch;
        sampleCord(pinch);
      }
      cord.tick(time, S, flow);
      const pg = smooth(0.35, 1, pinch) * clamp01(S.pulse);
      pinchGlow.mesh.position.set(FOOT[0] + 2, 1.2, FOOT[2] - 3);
      pinchGlow.set(pg * (0.8 + 0.2 * Math.sin(time * 1.7)) * ro);
      footEdge.material.color.copy(INK).lerp(SIGNAL, Math.max(smooth(0.2, 0.8, pinch), mood));
      footEdge.material.opacity = 0.7 + 0.3 * pinch;
      led.set(0.9 * ro);
      pinchA.position.set(RM[0] + FOOT[0], RM[1] + 1, RM[2] + FOOT[2]);
    },
  };
}

/** Merge plain box geometries (no outlines needed: the edges are drawn per building). */
function mergeBoxes(geos) {
  const parts = geos.map((g) => g.toNonIndexed());
  const n = parts.reduce((k, g) => k + g.attributes.position.count, 0);
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  return geo;
}

export function buildVoyage() {
  VIEW.set(BRAND.W, BRAND.H);
  return { mer: buildMer(), terre: buildTerre() };
}
