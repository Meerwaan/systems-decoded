// DOSSIER 016 — the room, seen like an X-ray. A wall of glass (the plane z = 0, the room on the +z side, the
// wall's own thickness behind it); inside it, in fine lines, its studs, its rails and the conduit of ONE circuit;
// and in that conduit the two wires the film is about — the phase, which it follows, and its neutral — from the
// consumer unit down to a socket. On that socket: a power strip, a kettle on a low sideboard, a heater with
// three bars. You, a body of glass, a hand going to the kettle. On the wall to the left, the consumer unit: its
// box of glass, its rail, the differential switch (slots 0–1), the breakers of slots 3 … 8 — NOT slot 2: that
// one is the film's breaker, model.js.
// Solid: only what the story needs — the wires, the socket, the strip and its plugs, the leads, what glows in the
// kettle and in the heater, the devices of the row. Everything else is glass and lines.
// Three colours. signal: the wire's heat, the short circuit, what the overload feeds (the kettle's element, the
// heater's bars). veille: the differential, when the film names it. ink: the rest, the ordinary current included.
// Centimetres, y up, the floor is y = 0. Everything is a function of the state and of `time`.
//
// Shell orders (see `asShell`): you 10 · the kettle, the heater 14 · the sideboard 16 · the unit's box 18 ·
// what is inside the wall 24 · the wall 30. The wall is drawn LAST: from behind it (the first frame of the film)
// everything in the room still shows through.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { makeSurface, makePool } from "@kit/atmo.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, glass, asShell, box, cyl, lathe, plate, placed, anchor, lineMat, makePart, addMesh, setPartOpacity, mergeGeometries } from "@kit/build3d.js";
import { WALL, BOARD, MODULE, ROW, HOME, SOCKET, STRIP, KETTLE, HEATER, YOU, WIRE, FAULT } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const HOT = new THREE.Color(1, 0.62, 0.38);
const WHITE = new THREE.Color(1, 0.9, 0.78);
const WARM = new THREE.Color(1, 0.62, 0.42); // glass that stands in the glow of the heater
const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const ORDER = { you: 10, things: 14, sideboard: 16, board: 18, inwall: 24, wall: 30 };
const LINE = { strong: { w: 2.2, a: 0.7 }, fine: { w: 1.8, a: 0.42 }, faint: { w: 1.8, a: 0.2 } };
const [HX, HY, HZ] = HOME;
const GAP = 1.6; // the neutral runs this far beside the phase
const WIRE_R = 0.5; // a wire and its insulation (thicker than life: it is the film's subject, and it is seen from the far side of a room)
/** The dashes of the current: one every PERIOD cm. They never run faster than a seventh of that per frame. */
const PERIOD = 7;
const RUN = { normal: 10, short: 30 }; // cm per second: two regimes at a FIXED speed (see `update`)
const FLOOR = 0.36; // how hot the far ends of the run are, FAULT being 1

/* ───────────────────────────────────────────────────────────── paths and tubes */

/** A polyline whose corners are rounded (`radii[i]` for corner i): points never further apart than `step` — `dense.step` within `dense.within` of `dense.at`. */
function roundPath(pts, radii, step = 2, dense = null) {
  const P = pts.map((p) => V(...p));
  const out = [];
  const push = (v) => {
    if (!out.length || out[out.length - 1].distanceToSquared(v) > 1e-8) out.push(v.clone());
  };
  const straight = (a, b) => {
    const len = a.distanceTo(b);
    push(a);
    let t = 0;
    while (t < len - 1e-6) {
      const here = a.clone().lerp(b, t / len);
      t = Math.min(len, t + (dense && here.distanceTo(dense.at) < dense.within ? dense.step : step));
      push(a.clone().lerp(b, t / len));
    }
  };
  let from = P[0];
  for (let i = 1; i < P.length - 1; i++) {
    const u = P[i - 1].clone().sub(P[i]);
    const v = P[i + 1].clone().sub(P[i]);
    const k = Math.min(radii[i - 1] ?? 3, u.length() / 2.2, v.length() / 2.2);
    const a = P[i].clone().addScaledVector(u.normalize(), k);
    const b = P[i].clone().addScaledVector(v.normalize(), k);
    straight(from, a);
    for (let j = 1; j <= 10; j++) {
      const t = j / 10;
      push(a.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(P[i], 2 * t * (1 - t)).addScaledVector(b, t * t));
    }
    from = b;
  }
  straight(from, P[P.length - 1]);
  return out;
}

/** How far along `path` its point nearest to `p` is. */
function along(path, p) {
  let best = 0;
  let bestD = Infinity;
  let s = 0;
  for (let i = 0; i < path.length; i++) {
    if (i) s += path[i].distanceTo(path[i - 1]);
    const d = path[i].distanceToSquared(p);
    if (d < bestD) [bestD, best] = [d, s];
  }
  return best;
}
/** The point `s` cm along `path`. */
function pointAt(path, s) {
  for (let i = 1; i < path.length; i++) {
    const d = path[i].distanceTo(path[i - 1]);
    if (s <= d) return path[i - 1].clone().lerp(path[i], s / d);
    s -= d;
  }
  return path[path.length - 1].clone();
}

/** A tube round `path`: besides position and normal, `aS` (cm along the path) and `aTh` (the angle round it) — its shader draws with them. */
function sweep(path, radius, radial = 14) {
  const n = path.length;
  const ring = radial + 1;
  const pos = new Float32Array(n * ring * 3);
  const nor = new Float32Array(n * ring * 3);
  const aS = new Float32Array(n * ring);
  const aTh = new Float32Array(n * ring);
  const t = V();
  const N = V();
  const B = V();
  let s = 0;
  for (let i = 0; i < n; i++) {
    t.subVectors(path[Math.min(n - 1, i + 1)], path[Math.max(0, i - 1)]).normalize();
    if (i === 0) N.crossVectors(t, Math.abs(t.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)).normalize();
    else N.addScaledVector(t, -N.dot(t)).normalize(); // carried along: the tube never twists
    B.crossVectors(t, N);
    if (i) s += path[i].distanceTo(path[i - 1]);
    for (let j = 0; j < ring; j++) {
      const th = (j / radial) * Math.PI * 2;
      const dx = N.x * Math.cos(th) + B.x * Math.sin(th);
      const dy = N.y * Math.cos(th) + B.y * Math.sin(th);
      const dz = N.z * Math.cos(th) + B.z * Math.sin(th);
      const k = (i * ring + j) * 3;
      pos.set([path[i].x + dx * radius, path[i].y + dy * radius, path[i].z + dz * radius], k);
      nor.set([dx, dy, dz], k);
      aS[i * ring + j] = s;
      aTh[i * ring + j] = th;
    }
  }
  const index = [];
  for (let i = 0; i < n - 1; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * ring + j;
      index.push(a, a + ring, a + 1, a + 1, a + ring, a + ring + 1);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
  geo.setAttribute("aTh", new THREE.BufferAttribute(aTh, 1));
  geo.setIndex(index);
  geo.userData.length = s;
  return geo;
}

/* ───────────────────────────────────────────────────────────── the wire */

// how hot the wire is, `ds` cm from FAULT: the whole run is warm, the place that will give is the hottest; a short
// circuit is white there. (The same law in the wire and in its halo: they must agree to the centimetre.)
const HEAT = /* glsl */ `
  uniform float uHeat, uFloor, uFault, uTime;
  float heatAt(float s, float ds) {
    float breath = 0.94 + 0.06 * sin(uTime * 1.7 + s * 0.11);
    return clamp(uHeat * (uFloor + (1.0 - uFloor) * exp(-ds * ds / 4200.0)) * breath + uFault * exp(-ds * ds / 60.0), 0.0, 1.3);
  }`;

/**
 * A wire: a dark conductor in its sleeve, the current as light dashes running along it, and its heat — from an
 * ink thread to signal, to white where it is hottest. At FAULT (`uSf` cm along it) the sleeve cooks (`uChar`: it
 * darkens, blisters, glows in its cracks) and the wire leans toward its neighbour (`uPinch`, cm: the short circuit).
 */
function wireMaterial({ sf, floor, dash }) {
  return new THREE.ShaderMaterial({
    transparent: true, // it only ever fades with the room: at 1 it is drawn like a solid, and writes its depth
    uniforms: {
      uInk: { value: INK }, uSignal: { value: SIGNAL }, uHot: { value: HOT }, uWhite: { value: WHITE },
      uSf: { value: sf }, uHeat: { value: 0 }, uFloor: { value: floor }, uFault: { value: 0 }, uChar: { value: 0 }, uPinch: { value: 0 }, uTime: { value: 0 },
      uLive: { value: 1 }, uAlpha: { value: 1 }, uPeriod: { value: PERIOD },
      uFlowN: { value: 0 }, uFlowS: { value: 0 }, uWN: { value: 1 }, uWS: { value: 0 }, uFracN: { value: 0.57 }, uGainN: { value: 1 }, uDash: { value: dash },
    },
    vertexShader: /* glsl */ `
      attribute float aS; attribute float aTh;
      uniform float uSf, uChar, uPinch;
      varying float vS; varying float vLump; varying vec3 vN; varying vec3 vP;
      // blisters: slow lumps along and round the sleeve (0–1)
      float lumps(float s, float th) {
        float a = sin(s * 1.9 + 0.7) * sin(th * 2.0 + s * 0.6 + 1.1);
        float b = sin(s * 3.7 - 1.3) * sin(th * 3.0 - s * 1.1 + 0.4);
        float c = sin(s * 0.9 + 2.2) * sin(th + 0.9);
        return clamp(0.5 + 0.5 * (0.5 * a + 0.3 * b + 0.35 * c), 0.0, 1.0);
      }
      void main() {
        float ds = aS - uSf;
        float cooked = uChar * exp(-ds * ds / 40.5);
        float l = lumps(aS, aTh);
        vec3 p = position + normal * (cooked * (0.06 + 0.42 * l * l));
        p.x += uPinch * exp(-ds * ds / 20.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vS = aS; vLump = l; vN = normalize(normalMatrix * normal); vP = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk, uSignal, uHot, uWhite;
      uniform float uSf, uChar, uLive, uAlpha, uPeriod, uFlowN, uFlowS, uWN, uWS, uFracN, uGainN, uDash;
      varying float vS; varying float vLump; varying vec3 vN; varying vec3 vP;
      ${HEAT}
      // one dash per unit of q, 'frac' of it lit; too far to tell them apart, they melt into their mean
      float dash(float q, float frac) {
        float w = clamp(fwidth(q), 1e-4, 1.0);
        float d = abs(fract(q) - 0.5);
        float lit = 1.0 - smoothstep(0.5 * frac - w, 0.5 * frac + w, d);
        return mix(lit, frac, smoothstep(0.3, 0.65, w));
      }
      // from a dull red to signal, to a yellow heart; white is the short circuit's alone
      vec3 ramp(float h) {
        vec3 c = uSignal * 0.8 * smoothstep(0.02, 0.1, h);
        c = mix(c, uSignal * 2.2, smoothstep(0.08, 0.25, h));
        c = mix(c, uHot * 2.0, smoothstep(0.25, 0.5, h)); // (pushed past 2.5, a colour has no colour left: every channel clips, and the wire is white)
        c = mix(c, uHot * 2.3, smoothstep(0.55, 1.0, h));
        return mix(c, uWhite * 3.2, smoothstep(1.02, 1.25, h));
      }
      void main() {
        if (uAlpha < 0.003) discard;
        float ds = vS - uSf;
        vec3 n = normalize(vN);
        float facing = clamp(dot(n, normalize(-vP)), 0.0, 1.0);
        float h = heatAt(vS, ds);
        // the sleeve: an ink thread, round under the light
        float warm = smoothstep(0.03, 0.2, h);
        vec3 col = uInk * (0.085 + 0.27 * pow(facing, 1.5)) * (1.0 - warm);
        // the current: ordinary in ink, a short circuit in signal. On a wire that glows, white dashes would make a
        // candy cane of it: there the current is a brighter beat of the wire's own light
        float dn = dash((vS - uFlowN) / uPeriod, uFracN) * uWN;
        float dk = dash((vS - uFlowS) / uPeriod, 0.62) * uWS;
        col += (uInk * 1.45 * dn * uGainN * uDash + mix(uSignal, uHot, 0.6) * 2.4 * dk) * uLive * (0.6 + 0.4 * facing) * (1.0 - warm);
        col += ramp(h) * (0.72 + 0.28 * facing) * (1.0 + 0.32 * max(dn, dk) * uLive * warm);
        // the cooked length: a black crust on the blisters, the heat in the cracks between them
        vec3 fn = normalize(cross(dFdx(vP), dFdy(vP)));
        fn = fn.z < 0.0 ? -fn : fn;
        float cooked = uChar * exp(-ds * ds / 40.5);
        float lit = clamp(dot(fn, normalize(vec3(-0.45, 0.6, 0.66))), 0.0, 1.0);
        vec3 crust = uInk * (0.01 + 0.15 * lit * lit);
        float crack = 1.0 - smoothstep(0.12, 0.34, vLump); // only the deepest folds between two blisters
        vec3 ember = (uSignal * 1.7 + uHot * 1.3 * crack) * crack;
        col = mix(col, crust + ember, smoothstep(0.06, 0.36, cooked));
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
}

/** The wire's light, round it: a tube that is brightest where it faces the eye and nothing at its rim. Two of them: a heart, a long tail. */
function haloMaterial({ sf, floor, power, gain }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: SIGNAL }, uSf: { value: sf }, uHeat: { value: 0 }, uFloor: { value: floor }, uFault: { value: 0 }, uChar: { value: 0 }, uTime: { value: 0 }, uPower: { value: power }, uGain: { value: gain }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vS = aS; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSf, uPower, uGain, uAmount, uChar; varying float vS; varying vec3 vN; varying vec3 vV;
      ${HEAT}
      void main() {
        float ds = vS - uSf;
        float h = heatAt(vS, ds);
        float k = clamp((h - 0.04) / 0.34, 0.0, 1.15) * (1.0 - 0.5 * uChar * exp(-ds * ds / 40.5));
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * (uGain * k * f * uAmount), 1.0);
      }`,
  });
}

/** The conduit: a ringed tube of glass round the two wires, cut away round FAULT so that they show. */
function conduitMaterial(sf) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK }, uSf: { value: sf }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aS; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vS = aS; vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uSf, uAmount; varying float vS; varying vec3 vN; varying vec3 vV;
      void main() {
        if (uAmount < 0.003) discard;
        float g = clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float q = vS / 0.9; // a ring every 9 mm; under the pixel they melt into their mean
        float ring = mix(0.5 + 0.5 * cos(6.28318 * q), 0.5, smoothstep(0.22, 0.55, clamp(fwidth(q), 0.0, 1.0)));
        float shown = smoothstep(15.0, 27.0, abs(vS - uSf));
        gl_FragColor = vec4(uColor * ((0.006 + 0.2 * pow(g, 2.4) + 0.05 * ring * (0.35 + 0.65 * g)) * shown * uAmount), 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── light that has a place */

/** A ball of light with no edge: brightest where it faces the eye, nothing at its rim (004, room.js). */
const softGlow = (power = 2.2) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(0, 0, 0) }, uPower: { value: power } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * f, 1.0);
      }`,
  });

/** The short circuit: a ball of light always facing the eye — a small white heart, a body, a long signal tail, four short rays. `uSize`: its radius, cm. */
function makeFlare(at) {
  const uniforms = { uView: { value: new THREE.Vector2(BRAND.W, BRAND.H) }, uCenter: { value: at.clone() }, uWhite: { value: WHITE }, uHot: { value: HOT }, uSignal: { value: SIGNAL }, uSize: { value: 10 }, uAmount: { value: 0 } };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform vec3 uCenter; uniform float uSize, uAmount; uniform vec2 uView; varying vec2 vUv;
        void main() {
          vUv = position.xy;
          vec4 c = projectionMatrix * viewMatrix * modelMatrix * vec4(uCenter, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 1.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, 26.0, 420.0);
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uWhite, uHot, uSignal; uniform float uAmount; varying vec2 vUv;
        void main() {
          float r2 = dot(vUv, vUv);
          float edge = 1.0 - smoothstep(0.5, 1.0, sqrt(r2));
          float core = exp(-r2 / 0.006);
          float body = exp(-r2 / 0.045);
          float tail = 1.0 / (1.0 + r2 / 0.014) * edge;
          vec2 q = abs(vUv);
          float rays = (exp(-q.y * q.y / 0.0009 - q.x * 3.4) + exp(-q.x * q.x / 0.0009 - q.y * 3.4)) * edge;
          gl_FragColor = vec4((uWhite * (2.8 * core + 0.6 * rays) + uHot * 0.45 * body + uSignal * (0.6 * body + 0.5 * tail)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 41;
  return { mesh, uniforms };
}

/** Sparks leaving a point, slowly (the film is in slow motion): each is born again every period — a pure function of time. */
function makeSparks(at, { count = 28, seed = 5 } = {}) {
  const rand = rng(seed);
  const seeds = new Float32Array(count * 4); // phase, period (s), size (cm), heading
  const tilt = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seeds.set([rand(), 1.1 + rand() * 1.3, 0.35 + Math.pow(rand(), 2) * 0.75, rand() * Math.PI * 2], i * 4);
    tilt[i] = -0.5 + rand() * 1.6;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
  geo.setAttribute("aTilt", new THREE.BufferAttribute(tilt, 1));
  const uniforms = { uT: { value: 0 }, uScale: { value: 1 }, uAmount: { value: 0 }, uOrigin: { value: at.clone() }, uHot: { value: WHITE.clone().multiplyScalar(3.4) }, uCool: { value: SIGNAL.clone().multiplyScalar(2.4) } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uT, uScale; uniform vec3 uOrigin; attribute vec4 aSeed; attribute float aTilt; varying float vAge;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          vAge = age;
          float away = 2.5 + 15.0 * age;
          vec3 p = uOrigin + vec3(cos(aSeed.w) * away, aTilt * 9.0 * age - 15.0 * age * age, sin(aSeed.w) * away * 0.5);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = max(2.0, aSeed.z * uScale / max(0.5, -mv.z));
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; uniform float uAmount; varying float vAge;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float a = pow(max(0.0, 1.0 - d), 1.6) * sin(3.14159 * clamp(vAge, 0.0, 1.0)) * uAmount;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.0, 0.6, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 40;
  return { points, uniforms };
}

/** Wisps (steam, smoke): a tall panel that turns to face the camera round its own height, a few slow threads drawn in it — they rise, widen, thin out (012, hob.js). `c0` at its foot, `c1` above. */
function wisps({ seed, base, size, rise = 0.3, lean = 0, c0 = INK, c1 = INK }) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uSeed: { value: seed }, uRise: { value: rise }, uLean: { value: lean }, uC0: { value: c0.clone() }, uC1: { value: c1.clone() }, uBase: { value: V(...base) }, uSize: { value: new THREE.Vector2(...size) } },
    vertexShader: /* glsl */ `
      uniform vec3 uBase; uniform vec2 uSize; varying vec2 vUv;
      void main() {
        vUv = vec2(position.x * 2.0, position.y); // (the panel is twice as wide as what is drawn in it: a thread that drifts aside never meets its edge)
        vec3 base = (modelMatrix * vec4(uBase, 1.0)).xyz;
        vec2 toCam = cameraPosition.xz - base.xz;
        float len = max(length(toCam), 1e-3);
        vec3 right = vec3(toCam.y, 0.0, -toCam.x) / len;
        gl_Position = projectionMatrix * viewMatrix * vec4(base + right * (vUv.x * uSize.x) + vec3(0.0, position.y * uSize.y, 0.0), 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime, uAmount, uSeed, uRise, uLean; uniform vec3 uC0, uC1; varying vec2 vUv;
      float wisp(float x, float y, float f, float sp, float ph, float amp, float w0) {
        float c = amp * (0.3 + y) * sin(y * f - uTime * sp + ph) + 0.4 * amp * y * sin(y * f * 2.3 - uTime * sp * 1.6 + ph * 1.7);
        float d = (x - c) / (w0 * (0.55 + 1.7 * y));
        return exp(-d * d) * (0.62 + 0.38 * sin(y * 6.0 - uTime * sp * 1.1 + ph * 3.1));
      }
      void main() {
        if (uAmount < 0.003) discard;
        float y = vUv.y; float x = vUv.x - uLean * sqrt(clamp(y, 0.0, 1.0)); // (it leaves to one side, at once: on the wire, its glow would hide it)
        float env = smoothstep(0.0, uRise, y) * pow(clamp(1.0 - y, 0.0, 1.0), 2.0) * (1.0 - smoothstep(0.55, 1.0, abs(x)));
        float a = wisp(x, y, 4.2, 0.9, 0.3 + uSeed, 0.3, 0.12) + 0.8 * wisp(x + 0.44, y, 3.1, 0.7, 2.1 + uSeed * 1.3, 0.34, 0.14) + 0.7 * wisp(x - 0.48, y, 5.3, 1.1, 4.4 + uSeed * 0.7, 0.26, 0.1);
        gl_FragColor = vec4(mix(uC0, uC1, smoothstep(0.0, 0.4, y)) * (a * env * uAmount), 1.0);
      }`,
  });
}

/* ───────────────────────────────────────────────────────────── a head (012's, hob.js) */

const SKULL = [
  { c: [0, 2.2, -1.5], r: [7.6, 8.5, 9.7] }, // the cranium
  { c: [0, -3.8, 2.0], r: [6.5, 7.4, 6.5], k: 1.8 }, // the face, down to the jaw
  { c: [0, -8.4, 4.4], r: [2.8, 2.1, 2.3], k: 2.2 }, // the chin
  { c: [0, 2.6, 6.3], r: [5.9, 1.4, 2.4], k: 1.0 }, // the brow
  { c: [4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 }, // the cheekbones
  { c: [-4.8, -1.6, 3.3], r: [2.0, 1.8, 2.6], k: 2.4 },
  { c: [0, 0.2, 7.3], r: [0.95, 3.0, 1.55], k: 0.8 }, // the bridge of the nose
  { c: [0, -2.7, 8.1], r: [1.3, 1.35, 2.3], k: 1.0 }, // its tip
  { c: [0, -6.5, 6.5], r: [2.6, 1.1, 1.7], k: 1.8 }, // the lips: barely
];
function headGeometry() {
  // where a ray from the centre along `d` leaves an ellipsoid (0: it misses it)
  const far = (d, c, r) => {
    const ax = d.x / r[0], ay = d.y / r[1], az = d.z / r[2];
    const bx = c[0] / r[0], by = c[1] / r[1], bz = c[2] / r[2];
    const a = ax * ax + ay * ay + az * az;
    const b = ax * bx + ay * by + az * bz;
    const disc = b * b - a * (bx * bx + by * by + bz * bz - 1);
    return disc > 0 ? Math.max(0, (b + Math.sqrt(disc)) / a) : 0;
  };
  const smax = (a, b, k) => {
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.max(a, b) + h * h * k * 0.25;
  };
  const ico = new THREE.IcosahedronGeometry(1, 20);
  ico.deleteAttribute("uv");
  ico.deleteAttribute("normal");
  const g = mergeVertices(ico, 1e-5);
  const at = g.attributes.position;
  const d = V();
  for (let i = 0; i < at.count; i++) {
    d.fromBufferAttribute(at, i).normalize();
    let r = far(d, SKULL[0].c, SKULL[0].r);
    for (let j = 1; j < SKULL.length; j++) r = smax(r, far(d, SKULL[j].c, SKULL[j].r), SKULL[j].k);
    at.setXYZ(i, d.x * r, d.y * r, d.z * r);
  }
  g.computeVertexNormals();
  return g;
}

/* ───────────────────────────────────────────────────────────── glass and lines, baked where they stand */

/** Position and normal only, not indexed: what every piece of glass is reduced to before the pieces of one material are merged. */
function bare(g) {
  const n = g.index ? g.toNonIndexed() : g;
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", n.getAttribute("position"));
  o.setAttribute("normal", n.getAttribute("normal"));
  return o;
}

/** A set of glass pieces and of lines: one mesh per glass — all of them ONE shell — and one per family of lines (012, hob.js). */
function makeSet() {
  const L = { strong: [], fine: [], faint: [] };
  const buckets = new Map();
  const seg = (list, a, b) => list.push(a[0], a[1], a[2], b[0], b[1], b[2]);
  const run = (list, pts, closed = false) => {
    for (let i = 0; i < pts.length - 1; i++) seg(list, pts[i], pts[i + 1]);
    if (closed) seg(list, pts[pts.length - 1], pts[0]);
  };
  /** A circle of radius `r` round (cx, cy, cz), in the plane whose normal is `axis` ("x", "y" or "z"). */
  const ring = (list, cx, cy, cz, r, axis = "y", n = 40) =>
    run(
      list,
      Array.from({ length: n }, (_, i) => {
        const c = r * Math.cos((i / n) * 6.2832);
        const s = r * Math.sin((i / n) * 6.2832);
        return axis === "y" ? [cx + c, cy, cz + s] : axis === "z" ? [cx + c, cy + s, cz] : [cx, cy + c, cz + s];
      }),
      true,
    );
  const rect = (list, x0, y0, x1, y1, z) => run(list, [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], true);
  const edgesInto = (list, geometry) => {
    const e = new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, 28).attributes.position;
    for (let i = 0; i < e.count; i += 2) seg(list, [e.getX(i), e.getY(i), e.getZ(i)], [e.getX(i + 1), e.getY(i + 1), e.getZ(i + 1)]);
  };
  /** A piece of glass; `lines`: its own edges drawn in that family. */
  const piece = (material, geometry, { pos, rotX, rotY, rotZ, lines = false } = {}) => {
    const g = placed(geometry, { pos, rotX, rotY, rotZ });
    if (lines) edgesInto(L[lines], g);
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material).push(bare(g));
  };
  /** A board of glass between two corners. */
  const slab = (material, xa, xb, ya, yb, za, zb, { r = 0.25, lines = false } = {}) => piece(material, box(xb - xa, yb - ya, zb - za, r), { pos: [(xa + xb) / 2, (ya + yb) / 2, (za + zb) / 2], lines });
  /** Into the scene: `glasses` and `lines` collect what the room's fade drives. */
  const build = (parent, order, glasses, lines) => {
    const panes = [];
    for (const [material, list] of buckets) {
      const mesh = new THREE.Mesh(list.length > 1 ? mergeGeometries(list) : list[0], material);
      parent.add(mesh);
      panes.push(mesh);
      glasses.push(material);
    }
    asShell(panes, order);
    for (const name of Object.keys(L)) {
      if (!L[name].length) continue;
      const mesh = new LineSegments2(new LineSegmentsGeometry().setPositions(L[name]), lineMat(BRAND.ink, LINE[name].w, { opacity: LINE[name].a }));
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;
      parent.add(mesh);
      lines.push(mesh.material);
    }
  };
  return { L, seg, run, ring, rect, piece, slab, build };
}

/** A lead: a tube through a few points. */
const lead = (pts, r = 0.42) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, "centripetal"), pts.length * 14, r, 8);

/* ───────────────────────────────────────────────────────────── the room */

export function buildWall() {
  const group = new THREE.Group();
  group.name = "wall";
  const fx = {};
  const A = {};
  const glasses = []; // every glass the room's fade drives
  const lines = []; // …and every family of lines

  /* ═════════════ 1 · THE FLOOR: a grid, nothing under it ═════════════ */

  fx.floor = makeSurface({ radius: 640, cell: 20, fade: 240, lift: 4 });
  fx.floor.group.children[0].visible = false; // an X-ray has no solid floor: seen from above it is a grey band across the picture
  fx.floor.group.children[2].visible = false;
  fx.floor.group.position.set(40, 0, 60);
  group.add(fx.floor.group);

  /* ═════════════ 2 · THE WALL: a slab of glass, its outline; inside it, studs and rails ═════════════ */

  const { x0, x1, h, thick } = WALL;
  const wall = makeSet();
  wall.slab(glass(BRAND.ink, { base: 0, rim: 0.07, power: 4, through: 0.3 }), x0, x1, 0, h, -thick, 0, { r: 0.1 });
  wall.rect(wall.L.strong, x0, 0, x1, h, 0); // its face on the room's side
  wall.rect(wall.L.fine, x0, 0, x1, h, -thick); // …and its back
  for (const [x, y] of [[x0, 0], [x1, 0], [x1, h], [x0, h]]) wall.seg(wall.L.fine, [x, y, 0], [x, y, -thick]);
  wall.seg(wall.L.faint, [x0, 8, 0.3], [x1, 8, 0.3]); // the skirting board
  // the corner of the room, on the right: where the floor and the ceiling leave the wall
  wall.seg(wall.L.fine, [x1, 0, 0], [x1, 0, 240]);
  wall.seg(wall.L.faint, [x1, h, 0], [x1, h, 240]);
  wall.build(group, ORDER.wall, glasses, lines);

  const inwall = makeSet();
  const studGlass = glass(BRAND.ink, { base: 0.003, rim: 0.3, power: 2.4, through: 0.2 });
  // (no lines on them: eight studs are thirty-two verticals, and the wall becomes a cage.) One of them stands 12 cm
  // beside the wire's drop, on the side away from you — a cable is run along a stud — and it catches the wire's glow:
  // from behind the wall, it is what says "inside a wall"
  fx.stud = glass(BRAND.ink, { base: 0.004, rim: 0.34, power: 2.2, through: 0.2 });
  const STUD_X = SOCKET.at[0] - 12;
  for (let x = STUD_X - 360; x < x1 - 4; x += 60) inwall.slab(x === STUD_X ? fx.stud : studGlass, x - 1.8, x + 1.8, 3.6, h - 3.6, -thick + 0.7, -0.7, { r: 0.15 });
  inwall.slab(studGlass, x0 + 0.5, x1 - 0.5, 0.1, 3.6, -thick + 0.6, -0.6, { r: 0.15 }); // the rails
  inwall.slab(studGlass, x0 + 0.5, x1 - 0.5, h - 3.6, h - 0.1, -thick + 0.6, -0.6, { r: 0.15 });
  // the socket's box, sunk in the wall
  inwall.piece(studGlass, cyl(3.5, 4.6, 0.3, 32), { pos: [SOCKET.at[0], SOCKET.at[1], -2.4], rotX: Math.PI / 2 });
  inwall.ring(inwall.L.fine, SOCKET.at[0], SOCKET.at[1], -4.6, 3.5, "z");
  inwall.build(group, ORDER.inwall, glasses, lines);

  /* ═════════════ 3 · THE CIRCUIT: phase and neutral, in their conduit ═════════════ */

  const FAULT_V = V(...FAULT);
  const dense = { at: FAULT_V, within: 20, step: 0.3 };
  const Y_RUN = WIRE[1][1]; // the height the circuit runs at
  const X_DROP = SOCKET.at[0];
  // the phase leaves the breaker's lower terminal, turns back into the wall, climbs behind the unit, runs along, comes down to the socket
  const phasePath = roundPath(
    [[HX, HY + 0.9, HZ + 2.1], [HX, HY - 4.2, HZ + 2.1], [HX, HY - 4.2, -3], [HX, Y_RUN, -3], [X_DROP, Y_RUN, -3], [X_DROP, SOCKET.at[1] + 2.5, -3]],
    [1.4, 1.4, 5, 5],
    2,
    dense,
  );
  // the neutral leaves the neutral bar at the foot of the unit, and keeps to the outside of every turn
  const NBAR = { x: HX - GAP, y: BOARD.at[1] - BOARD.h / 2 + 3.2, z: HZ + 2.1 };
  const neutralPath = roundPath(
    [[NBAR.x, NBAR.y, NBAR.z], [NBAR.x, NBAR.y, -3], [NBAR.x, Y_RUN + GAP, -3], [X_DROP + GAP, Y_RUN + GAP, -3], [X_DROP + GAP, SOCKET.at[1] + 2.5, -3]],
    [1.4, 5 + GAP, 5 + GAP],
    2,
    { ...dense, at: V(FAULT[0] + GAP, FAULT[1], FAULT[2]) },
  );
  const conduitPath = roundPath([[HX - GAP / 2, HY - 3.4, -3], [HX - GAP / 2, Y_RUN + GAP / 2, -3], [X_DROP + GAP / 2, Y_RUN + GAP / 2, -3], [X_DROP + GAP / 2, SOCKET.at[1] + 3.3, -3]], [5 + GAP / 2, 5 + GAP / 2], 1.5);
  const haloPath = roundPath([[HX, HY - 4.2, -3], [HX, Y_RUN, -3], [X_DROP, Y_RUN, -3], [X_DROP, SOCKET.at[1] + 2.5, -3]], [5, 5], 3, { ...dense, step: 1 });
  const sfPhase = along(phasePath, FAULT_V);
  const sfNeutral = along(neutralPath, V(FAULT[0] + GAP, FAULT[1], FAULT[2]));
  const TOUCH = (GAP - 2 * WIRE_R) / 2 + 0.07; // how far each wire leans for the two to meet

  fx.phase = wireMaterial({ sf: sfPhase, floor: FLOOR, dash: 1 });
  fx.neutral = wireMaterial({ sf: sfNeutral, floor: FLOOR, dash: 0.36 }); // a quiet companion: the film follows the other one
  const phaseGeo = sweep(phasePath, WIRE_R);
  for (const [path, mat] of [[phasePath, fx.phase], [neutralPath, fx.neutral]]) {
    const mesh = new THREE.Mesh(path === phasePath ? phaseGeo : sweep(path, WIRE_R), mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    group.add(mesh);
  }
  fx.halos = [
    { mat: haloMaterial({ sf: along(haloPath, FAULT_V), floor: FLOOR, power: 2.0, gain: 1.0 }), r: 2.8 },
    { mat: haloMaterial({ sf: along(haloPath, FAULT_V), floor: FLOOR, power: 2.6, gain: 0.5 }), r: 10 },
  ];
  for (const halo of fx.halos) {
    const mesh = new THREE.Mesh(sweep(haloPath, halo.r, 18), halo.mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 4;
    group.add(mesh);
  }
  fx.conduit = conduitMaterial(along(conduitPath, V(FAULT[0] + GAP / 2, FAULT[1], FAULT[2])));
  const conduit = new THREE.Mesh(sweep(conduitPath, 2.05, 20), fx.conduit);
  conduit.frustumCulled = false;
  conduit.renderOrder = 5;
  group.add(conduit);

  // at FAULT: the smoke of the sleeve that cooks; the short circuit's light and its sparks
  const MEET = V(FAULT[0] + GAP / 2, FAULT[1], FAULT[2]);
  const panel = new THREE.PlaneGeometry(2, 1).translate(0, 0.5, 0);
  fx.smoke = wisps({ seed: 2, base: [MEET.x, MEET.y + 1.5, MEET.z], size: [6.5, 58], rise: 0.06, lean: 0.95, c0: INK.clone().multiplyScalar(0.28), c1: INK.clone().multiplyScalar(0.42) }); // grey from its foot: tinted signal, a thread of smoke is a tongue of flame
  const smoke = new THREE.Mesh(panel, fx.smoke);
  smoke.frustumCulled = false;
  smoke.renderOrder = 6;
  fx.flare = makeFlare(MEET);
  fx.sparks = makeSparks(MEET, { seed: 16 });
  group.add(smoke, fx.flare.mesh, fx.sparks.points);

  A.wire = anchor(group, ...pointAt(phasePath, geoLength(phaseGeo) / 2).toArray());
  A.corner = anchor(group, X_DROP, Y_RUN, -3);
  A.fault = anchor(group, ...FAULT);

  /* ═════════════ 4 · THE CONSUMER UNIT: a box of glass, its rail, its row ═════════════ */

  const [BX, BY] = BOARD.at;
  const board = makeSet();
  const boardGlass = glass(BRAND.ink, { base: 0.005, rim: 0.34, power: 2.6, edge: 0.25, through: 0.25 });
  board.slab(boardGlass, BX - BOARD.w / 2, BX + BOARD.w / 2, BY - BOARD.h / 2, BY + BOARD.h / 2, 0, BOARD.d, { r: 0.8, lines: "strong" });
  // its cover, and the window the faces of the row show through
  const ROW_X0 = ROW.x0 - MODULE.w / 2;
  const ROW_X1 = ROW.x0 + ROW.last * MODULE.w + MODULE.w / 2;
  board.rect(board.L.fine, BX - BOARD.w / 2 + 1.6, BY - BOARD.h / 2 + 1.6, BX + BOARD.w / 2 - 1.6, BY + BOARD.h / 2 - 1.6, BOARD.front);
  board.rect(board.L.fine, ROW_X0 - 0.5, HY + 1.8, ROW_X1 + 0.5, HY + 6.7, BOARD.front);
  board.build(group, ORDER.board, glasses, lines);

  // what is solid in the room and belongs to no number of its own: it fades with the room
  const fittings = makePart("fittings");
  const metal = solid(0x5a626a, { rough: 0.5, metal: 0.4 });
  addMesh(fittings, box(BOARD.w - 3, 3.5, 0.5, 0.08), metal, { pos: [BX, BOARD.rowY, 0.25], edgeOpacity: 0.5 }); // the rail
  addMesh(fittings, box(15, 1.3, 1.3, 0.15), solid(0x767e85, { rough: 0.45, metal: 0.45 }), { pos: [NBAR.x + 4.5, NBAR.y, NBAR.z], edgeOpacity: 0.6 }); // the neutral bar
  group.add(fittings);

  // a modular device, seen from its side: the body, and the nose its handle stands on
  const PROFILE = [[0, 0], [4.3, 0], [4.3, 1.5], [5, 2.05], [7, 2.05], [7, 6.45], [5, 6.45], [4.3, 7], [4.3, 8.5], [0, 8.5]];
  const moduleGeo = (w) => plate(PROFILE, w - 0.06, { bevel: 0.07, round: 1 }).rotateY(-Math.PI / 2).translate(w / 2 - 0.03, 0, 0);
  const slotX = (slot) => ROW.x0 + slot * MODULE.w;
  const FACE = HZ + MODULE.d; // the plane of the faces

  // the breakers of slots 3 … 8: solid, dark, a light handle up — they dissolve together
  const others = makePart("others");
  const slots = [];
  for (let slot = ROW.hero + 1; slot <= ROW.last; slot++) slots.push(slot);
  const dark = solid(0x2b3136, { rough: 0.6, metal: 0.1 });
  addMesh(others, mergeGeometries(slots.map((slot) => placed(moduleGeo(MODULE.w), { pos: [slotX(slot), HY, HZ] }))), dark, { edgeOpacity: 0.62, edgeWidth: 1.8 });
  addMesh(others, mergeGeometries(slots.map((slot) => placed(box(MODULE.w - 0.5, 0.85, 0.12, 0.04), { pos: [slotX(slot), HY + 5.7, FACE + 0.03] }))), solid(0x4b5259, { rough: 0.7 }), { edges: false });
  addMesh(others, mergeGeometries(slots.map((slot) => placed(box(0.95, 1.5, 1.3, 0.14), { pos: [slotX(slot), HY + 4.45, FACE + 0.5] }))), solid(0xb3afa3, { rough: 0.55 }), { edgeOpacity: 0.5 });
  // the comb that feeds them, along their upper terminals
  addMesh(others, box(slots.length * MODULE.w - 0.3, 0.5, 1.1, 0.08), solid(0x767e85, { rough: 0.45, metal: 0.45 }), { pos: [(slotX(slots[0]) + slotX(ROW.last)) / 2, HY + MODULE.h + 0.1, HZ + 2.4], edges: false });
  group.add(others);

  // the differential switch: two modules wide, a broad handle, its test button. In ink — and veille when the film names it
  const diff = makePart("diff");
  const DX = (slotX(ROW.diff[0]) + slotX(ROW.diff[1])) / 2;
  fx.diffBody = solid(0x2f353a, { rough: 0.6, metal: 0.1 });
  fx.diffHandle = solid(0xb3afa3, { rough: 0.55 });
  fx.diffTest = glow(BRAND.ink, 0.5);
  fx.diffMark = glow(BRAND.ink, 0.32);
  const diffBody = addMesh(diff, moduleGeo(2 * MODULE.w), fx.diffBody, { pos: [DX, HY, HZ], edgeOpacity: 0.7, edgeWidth: 2 });
  fx.diffEdges = diffBody.children[0].material;
  addMesh(diff, box(1.9, 1.5, 1.3, 0.16), fx.diffHandle, { pos: [DX - 0.45, HY + 4.45, FACE + 0.5], edgeOpacity: 0.5 });
  addMesh(diff, box(0.78, 0.78, 0.3, 0.1), fx.diffTest, { pos: [DX + 1.05, HY + 5.55, FACE + 0.12], edges: false }); // the test button
  addMesh(diff, box(2 * MODULE.w - 0.6, 0.16, 0.06, 0.02), fx.diffMark, { pos: [DX, HY + 2.85, FACE + 0.02], edges: false }); // a rule under the handle: it lights with it
  group.add(diff);
  fx.diffHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), softGlow(2.4));
  fx.diffHalo.scale.set(5.2, 7.4, 4.6);
  fx.diffHalo.position.set(DX, HY + MODULE.h / 2, FACE - 1.5);
  fx.diffHalo.renderOrder = 4;
  group.add(fx.diffHalo);

  A.board = anchor(group, BX, BY + BOARD.h / 2, BOARD.d);
  A.diff = anchor(group, DX, HY + MODULE.h / 2, FACE + 0.2);
  A.hero = anchor(group, HX, HY + MODULE.h / 2, FACE + 0.2);
  A.row = anchor(group, (slotX(slots[0]) + slotX(ROW.last)) / 2, HY + MODULE.h / 2, FACE + 0.2);

  /* ═════════════ 5 · THE SOCKET, THE STRIP, THE LEADS ═════════════ */

  const [SX, SY] = SOCKET.at;
  const pale = solid(0xb4b0a5, { rough: 0.72 });
  const plugMat = solid(0x262b30, { rough: 0.55 });
  const leadMat = solid(0x858d93, { rough: 0.6 });
  addMesh(fittings, box(8.4, 8.4, 1, 0.5), pale, { pos: [SX, SY, 0.5], edgeOpacity: 0.55 }); // the socket's plate
  addMesh(fittings, cyl(2.05, 3.0, 0.25, 28), plugMat, { pos: [SX, SY, 2.4], rot: [Math.PI / 2, 0, 0], edgeOpacity: 0.7 }); // the strip's plug, in it
  // the strip, on the floor, along the wall: a switch and three outlets, two of them taken
  const [TX, , TZ] = STRIP.at;
  const TOP = 4.3;
  addMesh(fittings, box(STRIP.len, TOP - 0.2, 5.8, 0.7), pale, { pos: [TX, 0.2 + (TOP - 0.2) / 2, TZ], edgeOpacity: 0.55 });
  const OUTLETS = [TX - 3.6, TX + 2.4, TX + 8.4]; // the heater's, an empty one, the kettle's
  addMesh(fittings, mergeGeometries(OUTLETS.map((x) => placed(cyl(2.0, 0.16, 0.04, 28), { pos: [x, TOP + 0.05, TZ] }))), solid(0x33393f, { rough: 0.6 }), { edges: false });
  addMesh(fittings, mergeGeometries([OUTLETS[0], OUTLETS[2]].map((x) => placed(cyl(1.9, 2.6, 0.3, 28), { pos: [x, TOP + 1.4, TZ] }))), plugMat, { edgeOpacity: 0.7 });
  fx.lamp = glow(BRAND.signal, 0);
  addMesh(fittings, box(1.5, 0.5, 2.6, 0.12), fx.lamp, { pos: [TX - 9.6, TOP + 0.2, TZ], edges: false }); // its switch: lit while the circuit is
  // the leads: the strip's to the socket, the heater's, the kettle's (it comes down the side of the sideboard)
  const [KX, KY, KZ] = KETTLE.at;
  const [RX, , RZ] = HEATER.at;
  const SIDE = { x0: KX - 22, x1: KX + 42, z0: 4, z1: KZ + 6, top: KETTLE.table }; // the sideboard
  addMesh(fittings, lead([[SX, SY, 3.9], [SX, SY - 4, 7.5], [SX - 0.6, 13, 9.5], [SX - 5, 1.2, 14], [TX - 20, 0.8, 24], [TX - 21, 0.9, TZ - 3], [TX - 17, 1.9, TZ - 0.2], [TX - STRIP.len / 2, 2.2, TZ]]), leadMat, { edges: false });
  addMesh(fittings, lead([[OUTLETS[0], TOP + 2.6, TZ], [OUTLETS[0] - 0.6, TOP + 5, TZ + 1], [OUTLETS[0] - 6, 4, TZ + 9], [RX + 26, 0.7, RZ - 8], [RX + 17, 0.8, RZ - 2], [RX + 12.6, 2.4, RZ - 1]]), leadMat, { edges: false });
  addMesh(fittings, lead([[OUTLETS[2], TOP + 2.6, TZ], [OUTLETS[2] + 0.5, TOP + 5.5, TZ - 0.6], [OUTLETS[2] + 5, 3.6, TZ - 5], [SIDE.x0 - 3.2, 0.9, TZ - 9], [SIDE.x0 - 1.2, 30, TZ - 8], [SIDE.x0 - 1.0, SIDE.top - 6, TZ - 5], [SIDE.x0 + 1.2, SIDE.top + 0.9, TZ - 1], [KX - 12, SIDE.top + 0.6, KZ + 1.5], [KX - 7.6, SIDE.top + 0.8, KZ + 1]]), leadMat, { edges: false });
  A.socket = anchor(group, SX, SY, 1.6);
  A.strip = anchor(group, TX, TOP + 2, TZ);

  /* ═════════════ 6 · THE SIDEBOARD AND THE KETTLE ═════════════ */

  const side = makeSet();
  const woodGlass = glass(BRAND.ink, { base: 0.004, rim: 0.3, power: 2.6, edge: 0.2, through: 0.25 });
  side.slab(woodGlass, SIDE.x0, SIDE.x1, 8, SIDE.top - 3, SIDE.z0, SIDE.z1 - 1, { r: 0.6, lines: "fine" });
  side.slab(woodGlass, SIDE.x0 - 1.2, SIDE.x1 + 1.2, SIDE.top - 3, SIDE.top, SIDE.z0 - 0.5, SIDE.z1, { r: 0.5, lines: "fine" }); // its top
  for (const x of [SIDE.x0 + 3, SIDE.x1 - 3]) for (const z of [SIDE.z0 + 3, SIDE.z1 - 4]) side.slab(woodGlass, x - 1.6, x + 1.6, 0, 8, z - 1.6, z + 1.6, { r: 0.3, lines: "faint" }); // its legs
  side.seg(side.L.faint, [(SIDE.x0 + SIDE.x1) / 2, 11, SIDE.z1 - 0.9], [(SIDE.x0 + SIDE.x1) / 2, SIDE.top - 6, SIDE.z1 - 0.9]); // two doors
  for (const sx of [-1, 1]) side.seg(side.L.fine, [(SIDE.x0 + SIDE.x1) / 2 + sx * 3, 52, SIDE.z1 - 0.8], [(SIDE.x0 + SIDE.x1) / 2 + sx * 3, 62, SIDE.z1 - 0.8]);
  side.build(group, ORDER.sideboard, glasses, lines);

  // the kettle, in its own frame: its axis, y = 0 its bottom; +z is where its handle is — toward you
  const kettle = new THREE.Group();
  kettle.position.set(KX, KY, KZ);
  const toYou = Math.atan2(YOU.x - KX, YOU.z - KZ);
  kettle.rotation.y = toYou;
  group.add(kettle);
  const jug = makeSet();
  const jugGlass = glass(BRAND.ink, { base: 0.008, rim: 0.5, power: 2.4, edge: 0.4, spec: 0.7, through: 0.2 });
  const KR = KETTLE.r;
  const KH = KETTLE.h;
  jug.piece(jugGlass, lathe([[0.1, 0], [KR - 0.5, 0], [KR, 0.9], [KR - 0.1, 3], [KR - 1.2, KH - 3], [KR - 1.5, KH - 1], [KR - 2, KH], [0.1, KH]], 48));
  // the handle: half a ring, standing, on the +z side
  jug.piece(jugGlass, new THREE.TorusGeometry(5.2, 0.85, 12, 28, Math.PI).applyMatrix4(new THREE.Matrix4().makeBasis(V(0, 1, 0), V(0, 0, 1), V(1, 0, 0))), { pos: [0, KH / 2 + 0.6, KR - 1.6] });
  jug.piece(jugGlass, new THREE.CylinderGeometry(0.9, 2.1, 4.6, 16, 1, true), { pos: [0, KH - 2.6, -(KR - 0.6)], rotX: -52 * DEG }); // the spout
  jug.piece(jugGlass, new THREE.SphereGeometry(1.15, 16, 12), { pos: [0, KH + 0.9, 0] }); // the lid's knob
  jug.ring(jug.L.fine, 0, KH - 0.9, 0, KR - 1.5);
  jug.ring(jug.L.fine, 0, 0.5, 0, KR - 0.15);
  jug.ring(jug.L.faint, 0, KH * 0.66, 0, KR - 0.95); // the water's level
  jug.build(kettle, ORDER.things, glasses, lines);
  // its base, solid; and what glows in it: the element, two rings at its bottom
  addMesh(fittings, cyl(KR + 0.6, KY - SIDE.top, 0.3, 40), plugMat, { pos: [KX, (KY + SIDE.top) / 2, KZ], edgeOpacity: 0.7 });
  fx.element = glow(BRAND.signal, 0);
  const elementGeo = mergeGeometries([new THREE.TorusGeometry(5.3, 0.55, 10, 44), new THREE.TorusGeometry(2.9, 0.5, 10, 32)].map((g) => placed(g, { pos: [KX, KY + 1.5, KZ], rotX: Math.PI / 2 })));
  addMesh(fittings, elementGeo, fx.element, { edges: false });
  fx.elementHalo = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), softGlow(2.1));
  fx.elementHalo.scale.set(KR + 1.5, 4.2, KR + 1.5);
  fx.elementHalo.position.set(KX, KY + 2.4, KZ);
  fx.elementHalo.renderOrder = 4;
  fx.kettlePool = makePool({ radius: 20, color: BRAND.signal });
  fx.kettlePool.mesh.position.set(KX, SIDE.top + 0.15, KZ);
  fx.steam = [
    wisps({ seed: 0, base: [KX, KY + KH - 1, KZ], size: [10, 34], rise: 0.25 }),
    wisps({ seed: 3.3, base: [KX + 1.5, KY + KH, KZ - 2], size: [8, 26], rise: 0.25 }),
  ];
  group.add(fx.elementHalo, fx.kettlePool.mesh);
  for (const mat of fx.steam) {
    const mesh = new THREE.Mesh(panel, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 6;
    group.add(mesh);
  }
  A.kettle = anchor(group, KX, KY + KH + 2, KZ);

  /* ═════════════ 7 · THE HEATER: a case of glass, three bars ═════════════ */

  const heater = new THREE.Group();
  heater.position.set(RX, 0, RZ);
  heater.rotation.y = 15 * DEG; // its face to the room, a little toward you: from behind the wall, its bars are seen full length through its back
  group.add(heater);
  const { w: HW, h: HH, d: HD } = HEATER;
  const stove = makeSet();
  const caseGlass = glass(BRAND.ink, { base: 0.006, rim: 0.42, power: 2.4, edge: 0.3, spec: 0.4, through: 0.25 });
  stove.slab(caseGlass, -HW / 2, HW / 2, 2.4, HH, -HD / 2, HD / 2, { r: 2.2, lines: "fine" });
  for (const sx of [-1, 1]) stove.slab(caseGlass, sx * (HW / 2 - 4.5) - 2.6, sx * (HW / 2 - 4.5) + 2.6, 0, 2.4, -HD / 2 - 1, HD / 2 + 1, { r: 0.5, lines: "faint" }); // its feet
  for (let y = 8; y <= HH - 6; y += 4.4) stove.seg(stove.L.faint, [-HW / 2 + 2.6, y, HD / 2 + 0.05], [HW / 2 - 2.6, y, HD / 2 + 0.05]); // its grille
  stove.ring(stove.L.faint, 0, HH / 2 + 1, -HD / 2 + 2.2, 8.5, "z"); // the fan, behind
  stove.ring(stove.L.fine, HW / 2 - 4, HH + 0.05, 0, 1.7); // its knob
  stove.build(heater, ORDER.things, glasses, lines);
  const BARS = [12.5, 21.5, 30.5];
  fx.bars = glow(BRAND.signal, 0);
  const bars = new THREE.Mesh(mergeGeometries(BARS.map((y) => placed(cyl(0.78, HW - 6.5, 0.2, 20), { pos: [0, y, 1.6], rotZ: Math.PI / 2 }))), fx.bars);
  const holders = new THREE.Mesh(mergeGeometries([-1, 1].map((sx) => placed(box(0.9, BARS[2] - BARS[0] + 4.5, 2.4, 0.2), { pos: [sx * (HW / 2 - 2.9), (BARS[0] + BARS[2]) / 2, 1.6] }))), solid(0x4b5259, { rough: 0.6, metal: 0.3 }));
  fittings.userData.part.mats.add(fx.bars).add(holders.material); // they fade with the room's solids, like everything that is not glass
  heater.add(bars, holders);
  fx.barHalos = BARS.map((y) => {
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), softGlow(2.0));
    halo.scale.set(HW / 2 - 1, 2.9, 2.9);
    halo.position.set(0, y, 1.6);
    halo.renderOrder = 4;
    heater.add(halo);
    return halo.material;
  });
  fx.heaterPool = makePool({ radius: 54, color: BRAND.signal });
  fx.heaterPool.mesh.position.set(0, 0.25, HD / 2 + 30);
  heater.add(fx.heaterPool.mesh);
  A.heater = anchor(group, RX, HH + 2, RZ);

  /* ═════════════ 8 · YOU ═════════════ */

  const you = makeFigure({ shell: true, hands: "flat", order: ORDER.you, glassK: 1.25, through: 0.2, skin: BRAND.ink });
  you.group.name = "wall-you";
  group.add(you.group);
  you.ghost(true); // glass from head to hands: nothing of you is the subject
  you.shadow.visible = true;
  const HEADY = 76.5; // the head's centre, in the trunk's frame
  fx.head = glass(BRAND.ink, { base: 0.006, rim: 0.6, power: 2.4, edge: 0.5, spec: 0.8, through: 0.06 });
  you.head.geometry = headGeometry();
  you.head.material = fx.head;
  you.head.position.set(0, HEADY, 2);
  asShell(you.head, ORDER.you);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, 9, 24, 1, true), you.body); // (a tube, open: the round end of a capsule shows through the head like a second ball)
  neck.position.set(0, HEADY - 12.5, 0.7);
  neck.rotation.x = 10 * DEG;
  neck.scale.z = 0.92;
  you.torso.add(neck);
  asShell(neck, ORDER.you);
  // you stand a step nearer the kettle than plan.js says (an arm is 57 cm long), turned toward it: your right hand goes to its handle.
  // (The right one: from the room it is the arm drawn against the dark, and from behind the wall on the +x side too.)
  const GRIP = V(KX + Math.sin(toYou) * (KR + 3.2), KY + KH / 2 + 0.6, KZ + Math.cos(toYou) * (KR + 3.2)); // the middle of the handle
  const STAND = { x: YOU.x + 5, z: YOU.z - 6 };
  STAND.yaw = Math.atan2(GRIP.x - STAND.x, GRIP.z - STAND.z);
  you.group.position.set(STAND.x, YOU.y, STAND.z);
  you.group.rotation.y = STAND.yaw;
  /** A point of the room, in your own frame. */
  const mine = (p) => {
    const dx = p.x - STAND.x;
    const dz = p.z - STAND.z;
    const c = Math.cos(STAND.yaw);
    const s = Math.sin(STAND.yaw);
    return V(dx * c - dz * s, p.y - YOU.y, dx * s + dz * c);
  };
  you.leg("L", V(9.5, 8, 6));
  you.leg("R", V(-9.5, 8, -3));
  you.head.rotation.set(13 * DEG, 0, 0); // the eyes on the kettle
  you.reach("L", V(23, 87, 2), V(0.2, -0.2, -1));
  const wrist = mine(GRIP);
  wrist.z -= 11; // the wrist stops short: the hand goes on to the handle
  wrist.y += 1;
  you.reach("R", wrist, null, { dir: V(0.05, -0.12, 1).normalize(), palm: V(1, 0, 0) });
  you.lean(9, 0, 8);
  A.head = anchor(you.head, 0, 12.5, 0);
  A.hand = anchor(you.arms.R.hand, 0, 0, 5);
  A.you = anchor(you.group, 0, 120, 0);

  /* ═════════════ every frame ═════════════ */

  const lineBase = lines.map((mat) => mat.opacity);
  const WIRES = [fx.phase, fx.neutral];
  const hue = new THREE.Color();
  const hue2 = new THREE.Color();
  const DIFF_INK = new THREE.Color(BRAND.ink);
  const OFF = INK.clone().multiplyScalar(0.11); // what glows, once it is off: dull metal

  /**
   * shell    the X-ray of the room: the wall, what is in it, the unit's box, the furniture, the grid (0–1). The room's
   *          solids (socket, strip, leads, rail, the differential) and the two wires are whole from 0.4 up, gone at 0
   * you      0 nobody · 1 you
   * kettle   the kettle is on: its element glows, steam, its light on the sideboard (0–1)
   * heater   the heater is on: its three bars glow, their light on the floor (0–1)
   * hotwire  the phase's heat: an ink thread (0) → signal with a heart and a halo, hottest at FAULT (1)
   * char     the sleeve cooks at FAULT: it darkens, blisters, glows in its cracks, a thread of smoke (0–1)
   * fault    the short circuit: the two wires lean and touch at FAULT, a white light, a few slow sparks (0–1)
   * dark     the circuit is off (1): no current in the wires, the kettle, the heater and the strip's lamp out
   * others   the breakers of slots 3 … 8 (0–1)
   * diff     the differential switch lights up veille (0–1)
   * load     the current over the breaker's rating: how long and bright the dashes are; above ≈ 2, the short circuit's own
   */
  function update(P, time, px) {
    const shell = P.shell;
    const body = smooth(0, 0.4, shell);
    const live = 1 - clamp01(P.dark);

    // the glass, the lines, the grid
    for (let i = 0; i < glasses.length; i++) glasses[i].uniforms.uAmount.value = shell;
    for (let i = 0; i < lines.length; i++) lines[i].opacity = lineBase[i] * shell;
    fx.floor.grid.uAmount.value = 0.2 * shell;
    fx.conduit.uniforms.uAmount.value = shell;
    const lit = smooth(0, 0.9, clamp01(P.hotwire));
    fx.stud.uniforms.uColor.value.copy(INK).lerp(SIGNAL, 0.8 * lit);
    fx.stud.uniforms.uAmount.value = shell * (1 + 0.45 * lit);
    setPartOpacity(fittings, body);
    // the differential stands between the camera and the film's breaker: it leaves as soon as the others fade (gone under 0.5) — unless the film names it (`diff`)
    setPartOpacity(diff, body * Math.max(clamp01((P.others - 0.5) / 0.3), clamp01(P.diff)));
    setPartOpacity(others, body * clamp01(P.others));

    // the wires. The dashes run at a FIXED speed in each regime (their place is time × speed: a speed that followed
    // `load` would send them racing whenever `load` moves); `load` sets how long and how bright they are, and
    // fades the ordinary current into the short circuit's between 1.7 and 2.5
    const wS = smooth(1.7, 2.5, P.load);
    const wN = smooth(0, 0.15, P.load) * (1 - wS);
    const frac = Math.min(0.8, 0.35 + 0.22 * P.load);
    const gain = 0.7 + 0.3 * Math.min(1.6, P.load);
    const hot = clamp01(P.hotwire);
    const charred = clamp01(P.char);
    const fault = clamp01(P.fault);
    for (let i = 0; i < 2; i++) {
      const u = WIRES[i].uniforms;
      const back = i ? -1 : 1; // what comes back runs the other way
      u.uTime.value = time;
      u.uAlpha.value = body;
      u.uLive.value = live;
      u.uFlowN.value = back * time * RUN.normal;
      u.uFlowS.value = back * time * RUN.short;
      u.uWN.value = wN;
      u.uWS.value = wS;
      u.uFracN.value = frac;
      u.uGainN.value = gain;
      u.uFault.value = fault;
      u.uPinch.value = back * TOUCH * fault;
    }
    fx.phase.uniforms.uHeat.value = hot;
    fx.phase.uniforms.uChar.value = charred;
    fx.neutral.uniforms.uHeat.value = hot * NEUTRAL_HEAT;
    fx.neutral.uniforms.uChar.value = charred * 0.55;
    for (let i = 0; i < fx.halos.length; i++) {
      const u = fx.halos[i].mat.uniforms;
      u.uTime.value = time;
      u.uHeat.value = hot;
      u.uFault.value = fault;
      u.uChar.value = charred;
      u.uAmount.value = body;
    }

    // at FAULT
    fx.smoke.uniforms.uTime.value = time;
    fx.smoke.uniforms.uAmount.value = 0.6 * smooth(0.1, 1, charred) * body;
    const pulse = 0.9 + 0.1 * Math.sin(time * 2.3);
    fx.flare.uniforms.uAmount.value = fault * pulse * body;
    fx.flare.uniforms.uSize.value = 5 + 7 * fault;
    fx.flare.mesh.visible = fault > 0.002;
    fx.sparks.uniforms.uT.value = time;
    fx.sparks.uniforms.uScale.value = px;
    fx.sparks.uniforms.uAmount.value = fault * body;
    fx.sparks.points.visible = fault > 0.002;

    // the kettle
    const k = clamp01(P.kettle) * live;
    fx.element.color.copy(OFF).lerp(hue.copy(SIGNAL).lerp(HOT, 0.35).multiplyScalar(2.7), k);
    fx.elementHalo.material.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(0.55 * k * body);
    fx.elementHalo.visible = k > 0.002;
    fx.kettlePool.uniforms.uAmount.value = 0.2 * k * body;
    for (let i = 0; i < fx.steam.length; i++) {
      fx.steam[i].uniforms.uTime.value = time;
      fx.steam[i].uniforms.uAmount.value = (i ? 0.08 : 0.11) * k * body;
    }
    // the heater
    const r = clamp01(P.heater) * live;
    fx.bars.color.copy(OFF).lerp(hue.copy(SIGNAL).lerp(HOT, 0.3).multiplyScalar(2.6), r);
    for (let i = 0; i < fx.barHalos.length; i++) fx.barHalos[i].uniforms.uColor.value.copy(SIGNAL).multiplyScalar(0.5 * r * body);
    fx.heaterPool.uniforms.uAmount.value = 0.24 * r * body;
    fx.lamp.color.copy(OFF).lerp(hue.copy(SIGNAL).multiplyScalar(2.2), live);

    // you: glass, a little warm while the heater and the kettle glow
    const here = clamp01(P.you);
    you.group.visible = here > 0.01;
    hue.copy(INK).lerp(WARM, 0.2 * Math.max(k, r));
    you.body.uniforms.uColor.value.copy(hue);
    fx.head.uniforms.uColor.value.copy(hue);
    you.body.uniforms.uAmount.value = here;
    fx.head.uniforms.uAmount.value = here;
    you.shadow.material.uniforms.uAmount.value = 0.5 * here;

    // the differential: ink, and veille when the film names it
    const d = clamp01(P.diff);
    fx.diffEdges.color.copy(hue.copy(DIFF_INK).lerp(VEILLE, d)).multiplyScalar(1 + 1.3 * d);
    fx.diffBody.emissive.copy(VEILLE).multiplyScalar(0.1 * d);
    fx.diffHandle.emissive.copy(VEILLE).multiplyScalar(0.55 * d);
    fx.diffTest.color.copy(hue.copy(INK).multiplyScalar(0.5)).lerp(hue2.copy(VEILLE).multiplyScalar(3), d);
    fx.diffMark.color.copy(hue.copy(INK).multiplyScalar(0.32)).lerp(hue2.copy(VEILLE).multiplyScalar(2.4), d);
    fx.diffHalo.material.uniforms.uColor.value.copy(VEILLE).multiplyScalar(0.2 * d * body);
    fx.diffHalo.visible = d > 0.002;
  }

  return { group, update, A, fx, you };
}

/** How much of the phase's heat its neutral shows. None: the same current runs in both, but the film follows ONE wire, and two wires that glow are a cable, not "a wire" (a simplification: see the journal). */
const NEUTRAL_HEAT = 0;
const geoLength = (geo) => geo.userData.length;
