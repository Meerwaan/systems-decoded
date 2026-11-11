// DOSSIER 045 — L'autodestruction de la fusée : THE ROCKET. Ariane 5 G (flight 501) at true size, rounded from public
// drawings (no length is ever written on screen), seen like an X-ray: a shell of glass (the very material of 044's teaser
// rocket, `rue.js` rocketMat: the two films rhyme), its rings and a few stringers in fine lines, its tanks drawn inside so
// that a 30 m cylinder never reads empty — and SOLID only what the film names: the nozzles (always: they catch the eye in
// every wide shot), and with `inside` the equipment bay and its two inertial reference systems (SRI), the nozzles'
// actuators, the booster/core struts and the electric links across the forward junctions. Along the hull, the linear
// charges (veille): a line down the core from the bay, one along each booster (generic: `sources` says the image
// reconstitutes).
//
// THE HULL IS CUT IN CHUNKS, each with its own materials, so that it can come apart: the core's lower and upper rest, ten
// flaps on both sides of the core's charge line (`rip` opens them row after row from the bay down, « comme une fermeture
// éclair »), the bay ring, the fairing, each booster in two. Before the breakup a chunk sits at home; `tear` swings the
// boosters about their aft attachment and throws them away; `debris` takes every chunk from where it is to the ground east
// of the pad (FALL) along a fall that is a pure function of the state — the reconstitution plays it backwards.
//
// CLOSE UP. The shell is OPEN glass (no end discs, no bevels: seen edge-on from inside the bay, a disc is a white band) and
// everything fades where it comes near the lens, IN THE SHADER: the glass by its depth (its depth-only layer drops those
// fragments too, so the far wall still shows), the lines (LineMaterial patched), the charges. Lines are in pixels: they
// never fatten.
//
// buildFusee() → { group, free, A, update(p, time, px, eye) }
//   group  the rocket in ITS OWN frame (plan.js: origin = the core's aft skirt, y up the axis, boosters at ±z):
//          world.js places it on its path and turns it (rocketAt: position, rotation.z = −tilt)
//   free   the WORLD's frame: the smoke trail along the flown path (it keeps its place when the rocket turns), the breakup's
//          fire and the smoke it leaves in the sky, the falling pieces' flames and smoke trails, the angle against the route
//   A      anchors: seat (the system's mount, local +x down the axis, +y inward, +z along the skin), bay, sri0, sri1, links
//          (the +z booster's), nozzle, center, top, boosterN, boosterS
//   p      { rocket, inside, climb, incid, gimbal, guide, burn, trail, tear, links, pulse, charge, blast, rip, debris, arc }
//
// THE FIRES ARE DRIVEN BY GAPS between numbers, so that the reconstitution (tear, rip, debris going back to 0 together)
// relights nothing: the junction fire reads `tear − 1.5·debris`, the breakup fire `rip − debris`, the detonation flash dies
// as soon as `rip` has begun. Particles are reborn on their own period (a pure function of `time`), faded in and out:
// none is ever skipped by a count.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, glow, glass, asShell, lineMat, edgesOf, anchor, box } from "@kit/build3d.js";
import { DEG, ROCKET, BOOSTER, ATTACH, LINKS, SRI, SEAT, CHARGES, CENTER, FALL, PAD, ALT, DOWN, ringPoint } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const VIEWPORT = new THREE.Vector2(BRAND.W, BRAND.H);
const TAU = Math.PI * 2;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const AX = V(1, 0, 0);
const AY = V(0, 1, 0);

const FOCAL = { value: 2400 }; //                  px of the lens (stage.pixelScale): what keeps a fine tube ≥ uMinW px wide
const NEAR_GLASS = new THREE.Vector2(80, 420); //   view depth (cm) where the glass fades in: nothing of it right at the lens
const NEAR_LINE = new THREE.Vector2(50, 240); //    the same for the hull's lines
const NEAR_TUBE = new THREE.Vector2(30, 160); //    and the charges
const NEAR_FIRE = new THREE.Vector2(350, 1400); //  fire seen from close is a wall: it thins out under 14 m
/** 044 `rue.js` rocketMat: the same glass, so that the teaser rocket of 044 and this one rhyme. */
const GLASS = { base: 0.03, rim: 0.8, power: 1.8, edge: 0.85, spec: 0.9, through: 0.15 };
const R0 = 0.1; //                                  the tubes' built radius (the shader sets the true one)

/* ───────────────────────────────────────────────────────────── materials */

/** The kit's glass, which fades where it comes near the lens. Its depth-only layer (asShell) discards those fragments too. */
function nearGlass() {
  const m = glass(BRAND.ink, GLASS);
  m.uniforms.uNear = { value: NEAR_GLASS };
  m.uniforms.uClose = { value: 0.14 }; // up close the glass dims: its rim and its softbox grow with the size on screen
  m.vertexShader = m.vertexShader
    .replace("varying vec3 vN; varying vec3 vV;", "varying vec3 vN; varying vec3 vV; varying float vD;")
    .replace("vec4 mv = modelViewMatrix * vec4(position, 1.0);", "vec4 mv = modelViewMatrix * vec4(position, 1.0);\n        vD = -mv.z;");
  m.fragmentShader = m.fragmentShader
    .replace("varying vec3 vN; varying vec3 vV;", "varying vec3 vN; varying vec3 vV; varying float vD; uniform vec2 uNear; uniform float uClose;")
    .replace("if (uAmount < 0.003) discard;", "float nearK = smoothstep(uNear.x, uNear.y, vD);\n        if (uAmount * nearK < 0.003) discard;")
    // the lip: a line of constant pixel width where the surface turns away (fwidth), not a band that grows with the size on
    // screen; the broad rim and the softbox dim as the piece grows on screen (uClose), so a hull seen from close stays glass
    .replace(
      "float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);",
      "float sizeK = mix(uClose, 1.0, smoothstep(1500.0, 16000.0, vD));\n        float lip = 1.0 - smoothstep(0.0, 1.7 * fwidth(facing) + 1e-4, abs(facing));\n        float light = uBase + uRim * pow(g, uPower) * sizeK + uEdge * lip;",
    )
    .replace("light += uSpec *", "light += sizeK * uSpec *")
    .replace("gl_FragColor = vec4(uColor * light * uAmount * uGain, 1.0);", "gl_FragColor = vec4(uColor * light * uAmount * uGain * nearK, 1.0);");
  return m;
}

/** A LineMaterial (pixel width) that fades where its segments come near the lens. */
function nearLine(width, opacity, color = BRAND.ink) {
  const m = lineMat(color, width, { opacity });
  m.uniforms.uNear = { value: NEAR_LINE };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uNear = m.uniforms.uNear;
    sh.vertexShader = sh.vertexShader
      .replace("void main() {", "varying float vNearD;\nvoid main() {")
      .replace("vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );", "vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\n\t\t\tvNearD = -( position.y < 0.5 ? start.z : end.z );");
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "uniform vec2 uNear;\nvarying float vNearD;\nvoid main() {")
      .replace("gl_FragColor = vec4( diffuseColor.rgb, alpha );", "gl_FragColor = vec4( diffuseColor.rgb, alpha * smoothstep( uNear.x, uNear.y, vNearD ) );");
  };
  m.customProgramCacheKey = () => "sd045-nearline";
  return m;
}

/**
 * The charges (and, with `pulse`, the signal from the torn links): tubes never thinner than uMinW pixels, their true
 * radius from close. `aS` is the distance along the route from the bay (cm). `uHead` (cm) runs the light: behind it the
 * line is lit, ahead of it a faint veille (`uDim`, « un trait sourd »). `uFront` (cm) runs the detonation: a white-veille
 * front, the line burnt bright behind it and cooling. The pulse is a head with a short tail, nothing else.
 */
function tubeMat({ pulse = false } = {}) {
  return new THREE.ShaderMaterial({
    defines: pulse ? { PULSE: 1 } : {},
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: VEILLE.clone() }, uWhite: { value: new THREE.Color(0xe6fff2) }, uAmount: { value: 0 }, uDim: { value: 0.34 },
      uHead: { value: -1 }, uFront: { value: -1 }, uLen: { value: 1 }, uR: { value: pulse ? 3.5 : 2.6 }, uMinW: { value: pulse ? 4 : 3 },
      uFocal: FOCAL, uNear: { value: NEAR_TUBE },
    },
    vertexShader: /* glsl */ `
      attribute float aS;
      uniform float uR, uMinW, uFocal;
      varying float vS; varying float vD; varying float vThin;
      void main() {
        vec3 c = position - normal * ${R0.toFixed(2)};
        vec4 mvc = modelViewMatrix * vec4(c, 1.0);
        float r = max(uR, 0.5 * uMinW * max(1.0, -mvc.z) / max(uFocal, 1.0));
        vThin = uR / r; vS = aS; vD = -mvc.z;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(c + normal * r, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uWhite; uniform float uAmount, uDim, uHead, uFront, uLen; uniform vec2 uNear;
      varying float vS; varying float vD; varying float vThin;
      void main() {
        float a = uAmount * smoothstep(uNear.x, uNear.y, vD) * (0.5 + 0.5 * vThin);
        #ifdef PULSE
          float dh = vS - uHead;
          float head = exp(-dh * dh / 1600.0);
          float tail = smoothstep(uHead - 420.0, uHead, vS) * (1.0 - step(uHead, vS));
          vec3 col = uWhite * head * 1.3 + uColor * (head + tail * 0.9);
          a *= smoothstep(0.5, 80.0, uHead) * (1.0 - smoothstep(uLen, uLen + 420.0, uHead));
        #else
          float lit = 1.0 - smoothstep(uHead - 40.0, uHead + 40.0, vS);
          float dh = (vS - uHead) / 110.0;
          float head = exp(-dh * dh) * step(1.0, uHead) * (1.0 - step(uLen, uHead));
          vec3 col = uColor * (uDim + (1.2 - uDim) * lit) + uWhite * head * 1.1;
          if (uFront > 0.0) {
            float df = (vS - uFront) / 160.0;
            float front = exp(-df * df) * (1.0 - step(uLen + 300.0, uFront));
            float behind = 1.0 - smoothstep(uFront - 30.0, uFront + 30.0, vS);
            float cool = exp(-max(uFront - vS, 0.0) / 1100.0);
            col = mix(col, uColor * (0.55 + 1.0 * cool), behind) + uWhite * front * 1.4;
          }
        #endif
        if (a < 0.002) discard;
        gl_FragColor = vec4(col * a, 1.0);
      }`,
  });
}

/** A straight or curved tube for tubeMat: `aS` runs s0 → s1 (cm along the route). */
function routeTube(pts, s0, s1, n = 48) {
  const curve = pts.length === 2 ? new THREE.LineCurve3(pts[0], pts[1]) : new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const g = new THREE.TubeGeometry(curve, n, R0, 6, false);
  const s = new Float32Array(g.attributes.position.count);
  for (let i = 0; i <= n; i++) for (let j = 0; j <= 6; j++) s[i * 7 + j] = s0 + ((s1 - s0) * i) / n;
  g.setAttribute("aS", new THREE.BufferAttribute(s, 1));
  g.deleteAttribute("uv");
  return g;
}

/* ───────────────────────────────────────────────────────────── fire and smoke (026 launcher.js idiom) */

function jetGeometry(profile, segments = 40) {
  const geo = new THREE.LatheGeometry(profile.map(([r, d]) => new THREE.Vector2(Math.max(r, 0.5), -d)), segments);
  const L = profile.at(-1)[1];
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setY(i, clamp01(-pos.getY(i) / L));
  return geo;
}

/** What burns behind a nozzle (026): brightest along its axis, a hot heart near the nozzle that cools down the jet, no edge. */
const jetMat = ({ power = 2.6, hot = 2.2, cool = 0.75, hotLen = 0.22, ripple = 0.08 } = {}) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uAmount: { value: 0 }, uHot: { value: INK.clone().multiplyScalar(hot) }, uCool: { value: INK.clone().multiplyScalar(cool) },
      uPower: { value: power }, uHotLen: { value: hotLen }, uRipple: { value: ripple }, uFlow: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV; varying float vT; varying float vD;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        vT = uv.y;
        vD = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uHot, uCool; uniform float uAmount, uPower, uHotLen, uRipple, uFlow;
      varying vec3 vN; varying vec3 vV; varying float vT; varying float vD;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float body = pow(f, uPower) * mix(0.5, 1.0, smoothstep(1500.0, 12000.0, vD)); // from close a jet is a wall of light: it dims
        float along = clamp(1.0 - vT, 0.0, 1.0);
        float lip = smoothstep(0.0, 0.035, vT);
        float hot = 1.0 - smoothstep(0.0, uHotLen, vT);
        float rip = 1.0 - uRipple + uRipple * sin(vT * 38.0 - uFlow);
        vec3 col = mix(uCool, uHot, hot * body);
        gl_FragColor = vec4(col * body * along * along * lip * rip * uAmount, 1.0);
      }`,
  });

/**
 * Streaks: each particle is a short quad stretched in screen space between where it is and where it was `uLag` s before
 * (« des points qui filent : en traînées »), at least its own width in pixels. Reborn on its period, faded in and out.
 * Two origins (`aSide`), each with its amount; a drift `uFlow` (the slipstream) and a gravity `uGrav`, in the frame it lives in.
 */
function makeStreaks({ count, seed, dir, speed, period, width, lag, hot, cool }) {
  const rand = rng(seed);
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const aDir = new Float32Array(count * 3);
  const aSeed = new Float32Array(count * 4);
  const aSide = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const side = i % 2;
    const d = V(...dir(side, rand)).normalize();
    aDir.set([d.x, d.y, d.z], i * 3);
    aSeed.set([rand(), lerp(period[0], period[1], rand()), lerp(speed[0], speed[1], rand()), lerp(width[0], width[1], rand())], i * 4);
    aSide[i] = side;
  }
  geo.setAttribute("aDir", new THREE.InstancedBufferAttribute(aDir, 3));
  geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 4));
  geo.setAttribute("aSide", new THREE.InstancedBufferAttribute(aSide, 1));
  geo.instanceCount = count;
  const uniforms = {
    uT: { value: 0 }, uLag: { value: lag }, uAmt0: { value: 0 }, uAmt1: { value: 0 }, uO0: { value: V() }, uO1: { value: V() },
    uFlow: { value: V() }, uGrav: { value: V() }, uView: { value: VIEWPORT }, uHot: { value: hot }, uCool: { value: cool },
  };
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aDir; attribute vec4 aSeed; attribute float aSide;
        uniform float uT, uLag, uAmt0, uAmt1; uniform vec3 uO0, uO1, uFlow, uGrav; uniform vec2 uView;
        varying float vAge; varying float vU; varying float vY; varying float vA;
        vec3 at(vec3 o, float t) { return o + (aDir * aSeed.z + uFlow) * t + 0.5 * uGrav * t * t; }
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          float t = age * aSeed.y;
          vec3 o = aSide > 0.5 ? uO1 : uO0;
          vA = aSide > 0.5 ? uAmt1 : uAmt0;
          vAge = age; vU = position.x; vY = position.y;
          vec4 ch = projectionMatrix * modelViewMatrix * vec4(at(o, t), 1.0);
          vec4 ct = projectionMatrix * modelViewMatrix * vec4(at(o, max(t - uLag, 0.0)), 1.0);
          if (vA < 0.002 || ch.w < 1.0 || ct.w < 1.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
          vec2 sh = ch.xy / ch.w * uView * 0.5;
          vec2 st = ct.xy / ct.w * uView * 0.5;
          vec2 d = sh - st;
          float L = length(d);
          vec2 u = L > 0.001 ? d / L : vec2(1.0, 0.0);
          vec2 n = vec2(-u.y, u.x);
          float w = aSeed.w;
          vec2 p = mix(st - u * w * 0.5, sh + u * w * 0.5, position.x) + n * position.y * w * 0.5;
          vec4 c = position.x > 0.5 ? ch : ct;
          gl_Position = vec4(p / (uView * 0.5) * c.w, c.z, c.w);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool; varying float vAge; varying float vU; varying float vY; varying float vA;
        void main() {
          float a = (1.0 - vY * vY) * (0.25 + 0.75 * vU) * smoothstep(0.0, 0.05, vAge) * pow(1.0 - vAge, 1.2) * vA;
          gl_FragColor = vec4(mix(uHot, uCool, smoothstep(0.05, 0.5, vAge)) * a, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  return { mesh, uniforms };
}

/** Fire tongues: soft puffs born at a junction, flung out and swept back by the slipstream, hot signal cooling to smoke. */
function makeTongues({ count = 40, seed = 31 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const aDir = new Float32Array(count * 3);
  const aSeed = new Float32Array(count * 4);
  const aSide = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const side = i % 2;
    const s = side ? 1 : -1;
    const d = V((rand() - 0.5) * 1.4, (rand() - 0.3) * 0.8, s * (0.6 + rand() * 0.8)).normalize();
    aDir.set([d.x, d.y, d.z], i * 3);
    aSeed.set([rand(), 0.8 + rand() * 0.9, 150 + rand() * 380, 180 + rand() * 300], i * 4);
    aSide[i] = side;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDir", new THREE.BufferAttribute(aDir, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 4));
  geo.setAttribute("aSide", new THREE.BufferAttribute(aSide, 1));
  const uniforms = {
    uT: { value: 0 }, uFocal: FOCAL, uAmt0: { value: 0 }, uAmt1: { value: 0 }, uO0: { value: V() }, uO1: { value: V() }, uFlow: { value: V() },
    uHot: { value: SIGNAL.clone().multiplyScalar(0.9) }, uSmoke: { value: INK.clone().multiplyScalar(0.035) }, uNear: { value: NEAR_FIRE },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aDir; attribute vec4 aSeed; attribute float aSide;
        uniform float uT, uFocal, uAmt0, uAmt1; uniform vec3 uO0, uO1, uFlow; uniform vec2 uNear;
        varying float vAge; varying float vA;
        void main() {
          float age = fract(uT / aSeed.y + aSeed.x);
          float t = age * aSeed.y;
          vec3 o = aSide > 0.5 ? uO1 : uO0;
          vec3 p = o + aDir * aSeed.z * (1.0 - exp(-t * 2.4)) + uFlow * t;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          vA = (aSide > 0.5 ? uAmt1 : uAmt0) * smoothstep(uNear.x, uNear.y, -mv.z);
          gl_PointSize = vA < 0.002 ? 0.0 : clamp(aSeed.w * (0.45 + 1.3 * sqrt(age)) * uFocal / max(1.0, -mv.z), 1.5, 180.0);
          vAge = age;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uSmoke; varying float vAge; varying float vA;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          float a = exp(-r2 * 3.0) * (1.0 - r2) * sin(3.14159 * vAge) * vA;
          gl_FragColor = vec4(mix(uHot, uSmoke, smoothstep(0.12, 0.7, vAge)) * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/** A cloud held by the STATE (it rewinds): puffs spread over a radius `uR` around `uC`, hot → smoke by `uMix`, a slow billow. */
function makeCloud({ count = 44, seed = 41, hot, cool } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  const aDir = new Float32Array(count * 3);
  const aSeed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const th = rand() * TAU;
    const ph = Math.acos(2 * rand() - 1);
    aDir.set([Math.sin(ph) * Math.cos(th), Math.cos(ph) * 0.7, Math.sin(ph) * Math.sin(th)], i * 3);
    aSeed.set([rand(), rand(), Math.pow(rand(), 1.3), rand()], i * 4);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDir", new THREE.BufferAttribute(aDir, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 4));
  const uniforms = {
    uC: { value: V() }, uR: { value: 1000 }, uSize: { value: 1500 }, uRise: { value: 0 }, uT: { value: 0 }, uFocal: FOCAL, uAmt: { value: 0 },
    uMix: { value: 0 }, uHot: { value: hot }, uCool: { value: cool }, uCore: { value: INK.clone().multiplyScalar(0.7) }, uCoreAmt: { value: 0 },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aDir; attribute vec4 aSeed;
        uniform vec3 uC; uniform float uR, uSize, uRise, uT, uFocal, uAmt;
        varying float vA; varying float vK;
        void main() {
          vec3 p = uC + aDir * uR * (0.25 + 0.75 * aSeed.z) + vec3(0.0, uRise * aSeed.y, 0.0)
                 + aDir.zxy * uR * 0.07 * sin(uT * 0.35 + aSeed.x * 6.2831);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uAmt < 0.002 ? 0.0 : clamp(uSize * (0.55 + aSeed.w) * uFocal / max(1.0, -mv.z), 2.0, 240.0);
          vA = uAmt; vK = aSeed.z;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHot, uCool, uCore; uniform float uMix, uCoreAmt; varying float vA; varying float vK;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(q, q);
          if (r2 > 1.0) discard;
          float a = exp(-r2 * 2.6) * (1.0 - r2) * vA * 0.75;
          vec3 col = mix(uHot, uCool, smoothstep(0.35, 1.0, uMix + 0.6 * vK));
          col = mix(col, uCore, uCoreAmt * (1.0 - smoothstep(0.0, 0.35, vK)));
          gl_FragColor = vec4(col * a, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 6;
  return { points, uniforms };
}

/**
 * Lights that have a place (008 `makeHead`, 026 `makeFlash`), as points: a white heart of a few pixels, a sheath, a halo,
 * sized in cm and kept between uMin and uMax pixels. Positions and amounts are written every frame (world frame).
 */
function makeGlows(n) {
  const pos = new Float32Array(n * 3);
  const amt = new Float32Array(n);
  const size = new Float32Array(n);
  const hue = new Float32Array(n);
  const heart = new Float32Array(n);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aAmt", new THREE.BufferAttribute(amt, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aHue", new THREE.BufferAttribute(hue, 1));
  geo.setAttribute("aHeart", new THREE.BufferAttribute(heart, 1));
  const uniforms = { uFocal: FOCAL, uMin: { value: 4 }, uMax: { value: 200 }, uSignal: { value: SIGNAL.clone() }, uVeille: { value: VEILLE.clone() }, uInk: { value: INK.clone() }, uNear: { value: NEAR_FIRE } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute float aAmt; attribute float aSize; attribute float aHue; attribute float aHeart;
        uniform float uFocal, uMin, uMax; uniform vec2 uNear;
        varying float vA; varying float vPx; varying float vHue; varying float vHeart;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float px = clamp(aSize * uFocal / max(1.0, -mv.z), uMin, uMax);
          vA = aAmt * smoothstep(uNear.x * 0.5, uNear.y * 0.5, -mv.z);
          gl_PointSize = vA > 0.002 ? px : 0.0;
          vPx = px; vHue = aHue; vHeart = aHeart;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSignal, uVeille, uInk; varying float vA; varying float vPx; varying float vHue; varying float vHeart;
        void main() {
          vec2 q = gl_PointCoord * 2.0 - 1.0;
          float r = length(q);
          if (r > 1.0) discard;
          float p = r * vPx * 0.5;
          float heart = exp(-p * p / 6.0) * vHeart;
          float sheath = exp(-r * r * 9.0);
          float halo = 0.2 / (1.0 + r * r / 0.025) * (1.0 - smoothstep(0.55, 1.0, r));
          vec3 hue = mix(uSignal, uVeille, vHue);
          gl_FragColor = vec4((uInk * heart * 2.0 + hue * (sheath * 0.95 + halo)) * vA, 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 8;
  return { points, pos, amt, size, hue, heart, geo };
}

/** The breakup's heart, a light that has a place and no pixel limit (026 `makeFlash`), always facing the eye. */
function makeFlash() {
  const uniforms = {
    uView: { value: VIEWPORT }, uSize: { value: 3000 }, uMin: { value: 30 }, uMax: { value: 300 }, uAmount: { value: 0 }, uHeart: { value: 0 },
    uSheath: { value: 16 }, uHalo: { value: 0.18 }, uHue: { value: SIGNAL.clone() }, uInk: { value: INK.clone() },
  };
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uSize, uMin, uMax, uAmount; uniform vec2 uView; varying vec2 vUv; varying float vPx;
        void main() {
          vUv = position.xy;
          vPx = 1.0;
          vec4 c = projectionMatrix * modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
          if (uAmount > 0.001 && c.w > 1.0) {
            float s = clamp(uSize * 0.5 * uView.y * projectionMatrix[1][1] / c.w, uMin, uMax);
            vPx = s;
            gl_Position = vec4(c.xy / c.w + position.xy * s / (uView * 0.5), c.z / c.w, 1.0);
          }
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uHue, uInk; uniform float uAmount, uHeart, uSheath, uHalo; varying vec2 vUv; varying float vPx;
        void main() {
          float r = length(vUv);
          float p = r * vPx;
          float heart = exp(-p * p / 30.0) * uHeart;
          float sheath = exp(-p * p / (2.0 * uSheath * uSheath));
          float halo = uHalo / (1.0 + r * r / 0.03) * (1.0 - smoothstep(0.55, 1.0, r));
          gl_FragColor = vec4((uInk * heart * 2.2 + uHue * (sheath * 0.9 + halo)) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 6;
  return { mesh, uniforms };
}

/** The smoke trail (026's idea, on a parabola): its centre line is computed in the vertex shader — the planned path from
 *  the pad up to the rocket, bent near it into the rocket's axis (it leaves the nozzles, then the sky has it). */
function makeTrail() {
  const NS = 90;
  const NA = 20;
  const pos = [];
  const along = [];
  const index = [];
  for (let i = 0; i < NS; i++) {
    const s = 1 - Math.pow(1 - i / (NS - 1), 2); // dense near the rocket, where it bends
    for (let j = 0; j < NA; j++) {
      const a = (TAU * j) / NA;
      pos.push(Math.cos(a), 0, Math.sin(a));
      along.push(s);
    }
  }
  for (let i = 0; i < NS - 1; i++) {
    for (let j = 0; j < NA; j++) {
      const a = i * NA + j;
      const b = i * NA + ((j + 1) % NA);
      index.push(a, b, b + NA, a, b + NA, a + NA);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aS", new THREE.Float32BufferAttribute(along, 1));
  geo.setIndex(index);
  const uniforms = {
    uCl: { value: 1 }, uRise: { value: ALT - PAD.base }, uDown: { value: DOWN }, uY0: { value: PAD.base }, uBase: { value: V() }, uAxis: { value: V(0, 1, 0) },
    uBend: { value: 2600 }, uR0: { value: 360 }, uGrow: { value: 0.045 }, uAmount: { value: 0 }, uT: { value: 0 },
    uColor: { value: INK.clone().multiplyScalar(0.17) }, uWarm: { value: SIGNAL.clone().multiplyScalar(0.55) }, uWarmAmt: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uCl, uRise, uDown, uY0, uBend, uR0, uGrow;
      uniform vec3 uBase, uAxis;
      attribute float aS;
      varying vec3 vN; varying vec3 vV; varying float vDist; varying float vS;
      vec3 path(float u) { return vec3(uDown * u * u, uY0 + uRise * u, 0.0); }
      vec3 centre(float s, out float dist) {
        vec3 p = path(s * uCl);
        dist = distance(p, path(uCl));
        vec3 ax = uBase - uAxis * (dist + 380.0);
        return mix(p, ax, exp(-dist / uBend));
      }
      void main() {
        float dist; float d1; float d2;
        vec3 c = centre(aS, dist);
        vec3 c2 = centre(min(aS + 0.003, 1.0), d1);
        vec3 c1 = centre(max(aS - 0.003, 0.0), d2);
        vec3 T = normalize(c2 - c1 + vec3(0.0, 1e-3, 0.0));
        vec3 N = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
        vec3 B = vec3(0.0, 0.0, 1.0);
        float r = uR0 + uGrow * dist;
        vec3 dir = N * position.x + B * position.z;
        vec4 mv = modelViewMatrix * vec4(c + dir * r, 1.0);
        vN = normalize(normalMatrix * dir);
        vV = normalize(-mv.xyz);
        vDist = dist; vS = aS;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uWarm; uniform float uAmount, uWarmAmt, uT;
      varying vec3 vN; varying vec3 vV; varying float vDist; varying float vS;
      void main() {
        float f = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
        float body = pow(f, 1.5);
        float root = smoothstep(900.0, 3400.0, vDist);
        float ground = smoothstep(0.0, 0.06, vS);
        float puff = 0.72 + 0.28 * sin(vDist / 520.0 + 1.3 + uT * 0.12) * sin(vDist / 233.0 + 0.4);
        vec3 col = mix(uColor, uWarm, uWarmAmt * exp(-vDist / 5200.0));
        gl_FragColor = vec4(col * body * root * ground * puff * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 4;
  return { mesh, uniforms };
}

/** Segments written every frame (no allocation): an InstancedInterleavedBuffer updated in place. */
function dynSegments(n, mat) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(new Float32Array(n * 6));
  const line = new LineSegments2(geo, mat);
  line.frustumCulled = false;
  line.renderOrder = 3;
  const buf = geo.attributes.instanceStart.data;
  return { line, geo, arr: buf.array, buf };
}

/* ───────────────────────────────────────────────────────────── the rocket */

const RC = ROCKET.core.r;
const ROWS = 5;
const Y0 = CHARGES.core.y0; //               the flaps' bottom (the core charge's foot)
const YT = ROCKET.core.y1; //                the core's top (the bay sits on it)
const rowY = (i) => Y0 + ((YT - Y0) * i) / ROWS;
const SEAM = CHARGES.core.az; //             the core charge line: the flaps open on both sides of it
const FLAP = 50; //                          each flap's width, degrees
const SPLIT = rowY(3); //                    the core's lower and upper chunks
const B_ROUTE0 = CHARGES.core.y1 - ATTACH.fwd + 200; // where the light reaches the boosters' lines, cm along the route
const C_LEN = B_ROUTE0 + (CHARGES.booster.y1 - CHARGES.booster.y0); // the longest route (a booster's foot)
const FAIRING = [[RC, ROCKET.fairing.y0], [RC, ROCKET.fairing.y1], [262, 4500], [238, 4700], [198, 4880], [140, 5020], [70, 5110], [0, ROCKET.fairing.tip]];
const B_LOW = [[178, BOOSTER.y0], [BOOSTER.r, 170], [BOOSTER.r, 1360]];
const B_UP = [[BOOSTER.r, 1360], [BOOSTER.r, BOOSTER.y1], [140, 2800], [110, 2950], [60, 3090], [0, BOOSTER.nose]];
const VUL_BELL = [[30, 40], [44, 18], [40, 0], [34, -28], [56, -70], [74, -140], [90, -220], [ROCKET.vulcain.r1, ROCKET.vulcain.y1 - ROCKET.vulcain.y0]];
const EAP_BELL = [[100, 30], [118, 0], [96, -40], [104, -90], [122, -170], [138, -250], [BOOSTER.exit, BOOSTER.nozzle]];
const LINK_A = [-32, LINKS.y, RC + 11]; //         the link's plug on the core (side +z; mirrored for −z)
const LINK_B = [32, LINKS.y + 15, BOOSTER.side - BOOSTER.r - 11]; // its plug on the booster's inner face
const BAY_C = [0, (ROCKET.bay.y0 + ROCKET.bay.y1) / 2, 0];
const SEAM_X = (RC + 4) * Math.sin(CHARGES.core.az * DEG); // the core charge line (its x, z)
const SEAM_Z = (RC + 4) * Math.cos(CHARGES.core.az * DEG);
const CORE_RUN = CHARGES.core.y1 - CHARGES.core.y0; //        its length, cm along the route
const B_CX = (BOOSTER.r + 4) * Math.sin(CHARGES.booster.az * DEG); // a booster charge line, about the booster axis
const B_CZ = (BOOSTER.r + 4) * Math.cos(CHARGES.booster.az * DEG);

const latheGeo = (profile, a0 = 0, span = 360, seg = 56) =>
  new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 0.01), y)), Math.max(4, Math.round((seg * span) / 360)), a0 * DEG, span * DEG);
const shifted = (p, dz) => [p[0], p[1], p[2] + dz];
const arcPairs = (r, y, a0, a1, n, dz = 0, out = []) => {
  for (let i = 0; i < n; i++) out.push([shifted(ringPoint(a0 + ((a1 - a0) * i) / n, r, y), dz), shifted(ringPoint(a0 + ((a1 - a0) * (i + 1)) / n, r, y), dz)]);
  return out;
};
const profilePairs = (profile, a, dz = 0, out = []) => {
  for (let i = 1; i < profile.length; i++) out.push([shifted(ringPoint(a, profile[i - 1][0], profile[i - 1][1]), dz), shifted(ringPoint(a, profile[i][0], profile[i][1]), dz)]);
  return out;
};
/** A tank dome in fine lines: three latitude rings and six meridians (dir −1: it bulges downward). */
const domePairs = (yb, r, h, dir, out = []) => {
  for (const th of [30, 56, 76]) arcPairs(r * Math.cos(th * DEG), yb + dir * h * Math.sin(th * DEG), 0, 360, 28, 0, out);
  for (let k = 0; k < 6; k++) {
    const a = k * 60 + 15;
    for (let j = 0; j < 6; j++) {
      const t0 = (90 * j) / 6;
      const t1 = (90 * (j + 1)) / 6;
      out.push([ringPoint(a, r * Math.cos(t0 * DEG), yb + dir * h * Math.sin(t0 * DEG)), ringPoint(a, r * Math.cos(t1 * DEG), yb + dir * h * Math.sin(t1 * DEG))]);
    }
  }
  return out;
};

export function buildFusee() {
  const group = new THREE.Group();
  group.name = "fusee";
  const free = new THREE.Group();
  free.name = "fusee-free";
  const A = {};
  const rand = rng(45);

  /* ── chunks: each a Group at its centroid, its own glass, its own lines, its own solids ── */
  const chunks = [];
  const shellMeshes = [];
  const chunk = (name, C) => {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(...C);
    group.add(g);
    const k = { name, g, C: V(...C), P: V(...C), Q: new THREE.Quaternion(), glass: nearGlass(), line: nearLine(2.2, 0.72), fine: nearLine(1.8, 0.3), solids: [] };
    chunks.push(k);
    return k;
  };
  const hull = (k, geo) => {
    geo.translate(-k.C.x, -k.C.y, -k.C.z);
    const m = new THREE.Mesh(geo, k.glass);
    k.g.add(m);
    shellMeshes.push(m);
    return m;
  };
  const lines = (k, pairs, fine = false, mat = null) => {
    const arr = new Float32Array(pairs.length * 6);
    pairs.forEach(([a, b], i) => arr.set([a[0] - k.C.x, a[1] - k.C.y, a[2] - k.C.z, b[0] - k.C.x, b[1] - k.C.y, b[2] - k.C.z], i * 6));
    const geo = new LineSegmentsGeometry();
    geo.setPositions(arr);
    const l = new LineSegments2(geo, mat ?? (fine ? k.fine : k.line));
    l.renderOrder = 2;
    k.g.add(l);
    return l;
  };
  /** A solid in a chunk, at a rocket-frame point; `inside` ones show with p.inside, the others with the rocket. */
  const solidIn = (k, geo, mat, at, { inside = true, edges = 0, parent = null, rot = null } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(at[0] - k.C.x, at[1] - k.C.y, at[2] - k.C.z);
    if (rot) m.rotation.set(...rot);
    (parent ?? k.g).add(m);
    let edge = null;
    if (edges) {
      edge = edgesOf(geo, { opacity: edges, width: 2, threshold: 24 });
      m.add(edge);
    }
    const s = { mesh: m, mat, edge, eo: edges, inside };
    k.solids.push(s);
    return s;
  };

  /* the core: its lower and upper rest (all but the 100° around the charge line), ten flaps along the line */
  const restA0 = SEAM + FLAP;
  const restSpan = 360 - 2 * FLAP;
  const coreLow = chunk("core-low", [0, 1000, 0]);
  hull(coreLow, latheGeo([[RC, 0], [RC, Y0]]));
  hull(coreLow, latheGeo([[RC, Y0], [RC, SPLIT]], restA0, restSpan));
  {
    const l = [];
    arcPairs(RC, 0, 0, 360, 48, 0, l);
    arcPairs(RC, 130, 0, 360, 48, 0, l);
    for (const i of [0, 1, 2]) arcPairs(RC, rowY(i), restA0, restA0 + restSpan, 34, 0, l);
    for (const a of [100, 190]) l.push([ringPoint(a, RC, 0), ringPoint(a, RC, SPLIT)]);
    lines(coreLow, l);
    const f = domePairs(600, RC - 8, 330, -1);
    for (let k = 0; k < 6; k++) f.push([ringPoint(k * 60 + 15, RC - 8, 0), ringPoint(k * 60 + 15, 70, -38)]); // the thrust frame
    lines(coreLow, f, true);
  }
  const coreUp = chunk("core-up", [0, 2500, 0]);
  hull(coreUp, latheGeo([[RC, SPLIT], [RC, YT]], restA0, restSpan));
  {
    const l = [];
    for (const i of [3, 4, 5]) arcPairs(RC, rowY(i), restA0, restA0 + restSpan, 34, 0, l);
    for (const a of [100, 190]) l.push([ringPoint(a, RC, SPLIT), ringPoint(a, RC, YT)]);
    lines(coreUp, l);
    lines(coreUp, [...domePairs(2250, RC - 8, 250, -1), ...domePairs(2800, RC - 8, 230, 1)], true); // common bulkhead, LOX dome
  }
  const flaps = [];
  for (let r = 0; r < ROWS; r++) {
    for (const col of [-1, 1]) {
      const a0 = col < 0 ? SEAM - FLAP : SEAM;
      const hingeAz = col < 0 ? SEAM - FLAP : SEAM + FLAP;
      const yA = rowY(r);
      const yB = rowY(r + 1);
      const mid = a0 + FLAP / 2;
      const k = chunk(`flap-${r}-${col}`, ringPoint(mid, RC, (yA + yB) / 2));
      hull(k, latheGeo([[RC, yA], [RC, yB]], a0, FLAP, 64));
      const l = arcPairs(RC, yA, a0, a0 + FLAP, 8);
      if (r === ROWS - 1) arcPairs(RC, yB, a0, a0 + FLAP, 8, 0, l);
      l.push([ringPoint(hingeAz, RC, yA), ringPoint(hingeAz, RC, yB)]);
      lines(k, l);
      const cutMat = nearLine(4, 0, BRAND.veille); // the cut edge, lit by the detonation as the flap opens
      cutMat.color.multiplyScalar(1.6);
      lines(k, [[ringPoint(SEAM, RC + 1, yA), ringPoint(SEAM, RC + 1, yB)]], false, cutMat);
      const H = V(...ringPoint(hingeAz, RC, (yA + yB) / 2));
      const rad = V(Math.sin(mid * DEG), 0, Math.cos(mid * DEG));
      const vx = k.C.x - H.x;
      const vz = k.C.z - H.z;
      flaps.push({ k, H, rad, cutMat, r0: (ROWS - 1 - r) * 0.13, sign: Math.sign(vz * rad.x - vx * rad.z) || 1 });
    }
  }

  /* the bay (VEB) and what the film names in it: the two SRI; the platform and the other boxes, dark */
  const bay = chunk("bay", BAY_C);
  hull(bay, latheGeo([[RC, ROCKET.bay.y0], [RC, ROCKET.bay.y1]]));
  {
    lines(bay, arcPairs(RC, ROCKET.bay.y1, 0, 360, 48));
    const ribs = [];
    for (let k = 0; k < 12; k++) ribs.push([ringPoint(k * 30 + 5, RC - 2, ROCKET.bay.y0), ringPoint(k * 30 + 5, RC - 2, ROCKET.bay.y1)]);
    lines(bay, ribs, true);
  }
  const platMat = solid(0x272b2f, { rough: 0.6, metal: 0.25 });
  // a shelf along the skin, open where the chain is mounted (az −62 → −18)
  solidIn(bay, latheGeo([[228, 3105], [266, 3105], [266, 3117], [228, 3117], [228, 3105]], -18, 316, 64), platMat, [0, 0, 0], { edges: 0.5 });
  const sriGlow = [];
  const sriEdges = [];
  SRI.forEach((s, i) => {
    const mat = solid(0xb2b8be, { rough: 0.42, metal: 0.3 });
    const geo = box(s.size[0], s.size[1], s.size[2], 1.6);
    const at = ringPoint(s.az, s.r, s.y);
    const sd = solidIn(bay, geo, mat, at, { edges: 0.85, rot: [0, s.az * DEG, 0] });
    sriEdges.push(sd.edge);
    const face = glow(BRAND.veille, 1.6);
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(s.size[0] * 0.5, 4.5), face);
    fm.position.set(0, s.size[1] * 0.18, s.size[2] / 2 + 0.3);
    sd.mesh.add(fm);
    sriGlow.push({ mesh: fm, mat: face });
    A[`sri${i}`] = anchor(bay.g, at[0] - bay.C.x, at[1] - bay.C.y, at[2] - bay.C.z);
  });
  for (const [az, w, h, d] of [[60, 36, 22, 30], [150, 36, 22, 30], [-150, 30, 18, 26]]) {
    const at = ringPoint(az, 215, 3117 + h / 2);
    solidIn(bay, box(w, h, d, 1.4), solid(0x4a5056, { rough: 0.55, metal: 0.25 }), at, { edges: 0.55, rot: [0, az * DEG, 0] });
  }

  /* the fairing and the upper stage inside it (fine lines) */
  const nose = chunk("fairing", [0, 4000, 0]);
  hull(nose, latheGeo(FAIRING));
  {
    const l = [];
    for (const [r, y] of [[RC, 3480], [RC, ROCKET.fairing.y1], [238, 4700], [140, 5020]]) arcPairs(r, y, 0, 360, 48, 0, l);
    for (const a of [90, -90]) profilePairs(FAIRING, a, 0, l); // the two halves' seam
    lines(nose, l);
    const f = [];
    for (const y of [ROCKET.upper.y0 + 190, ROCKET.upper.y1]) arcPairs(ROCKET.upper.r, y, 0, 360, 36, 0, f);
    for (let k = 0; k < 4; k++) f.push([ringPoint(k * 90 + 45, ROCKET.upper.r, ROCKET.upper.y0 + 190), ringPoint(k * 90 + 45, ROCKET.upper.r, ROCKET.upper.y1)]);
    for (let k = 0; k < 6; k++) f.push([ringPoint(k * 60, ROCKET.upper.r, ROCKET.upper.y1), ringPoint(k * 60, 60, ROCKET.upper.y1 + 260)]);
    lines(nose, f, true);
  }

  /* the nozzles: solid always (they catch the eye in every wide shot); their actuators with `inside` */
  const bellMat = () => solid(0x6d737a, { rough: 0.42, metal: 0.45, double: true });
  const actMat = () => solid(0x9ba1a7, { rough: 0.4, metal: 0.4 });
  const actGeo = new THREE.CylinderGeometry(6, 6, 1, 12);
  const nozzles = []; // { pivot (Group in a chunk), acts: [{ mesh, S (chunk-local), N (pivot-local) }] }
  const makeNozzle = (k, at, profile, jet, actR) => {
    const pivot = new THREE.Group();
    pivot.position.set(at[0] - k.C.x, at[1] - k.C.y, at[2] - k.C.z);
    k.g.add(pivot);
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 56);
    const mat = bellMat();
    const bell = new THREE.Mesh(geo, mat);
    pivot.add(bell);
    const edge = edgesOf(geo, { opacity: 0.8, width: 2, threshold: 30 });
    bell.add(edge);
    k.solids.push({ mesh: bell, mat, edge, eo: 0.8, inside: false });
    jet.mesh.position.y = profile.at(-1)[1];
    pivot.add(jet.mesh);
    const acts = [];
    const am = actMat();
    for (const a of [-40, 50]) {
      const mesh = new THREE.Mesh(actGeo, am);
      k.g.add(mesh);
      acts.push({ mesh, S: V(pivot.position.x + actR[1] * Math.sin(a * DEG), pivot.position.y + 70, pivot.position.z + actR[1] * Math.cos(a * DEG)), N: V(actR[0] * Math.sin(a * DEG), -70, actR[0] * Math.cos(a * DEG)) });
      k.solids.push({ mesh, mat: am, edge: null, eo: 0, inside: true });
    }
    const n = { pivot, acts };
    nozzles.push(n);
    return n;
  };
  const eapJetMat = jetMat({ power: 2.5, hot: 2.0, cool: 0.8, hotLen: 0.2 });
  const vulJetMat = jetMat({ power: 3, hot: 1.8, cool: 0.5, hotLen: 0.25 });
  const eapJetGeo = jetGeometry([[145, 0], [172, 160], [206, 600], [236, 1300], [246, 2100], [216, 2900], [150, 3400], [50, 3800]]);
  const vulJetGeo = jetGeometry([[100, 0], [112, 250], [122, 800], [112, 1400], [60, 1900], [20, 2100]]);
  const jets = [];
  const vulJet = { mesh: new THREE.Mesh(vulJetGeo, vulJetMat) };
  jets.push(vulJet.mesh);
  makeNozzle(coreLow, [0, ROCKET.vulcain.y0, 0], VUL_BELL, vulJet, [58, 130]);
  A.nozzle = anchor(group, 0, ROCKET.vulcain.y1, 0);

  /* the boosters: each in two chunks that tear away together about the aft attachment, then part as debris */
  const boosters = [];
  const strutMat = () => solid(0x80868c, { rough: 0.45, metal: 0.35 });
  const strutGeo = new THREE.CylinderGeometry(8, 8, 26, 12);
  strutGeo.rotateX(Math.PI / 2);
  const plugGeo = box(16, 10, 12, 1.2);
  const plugMat = () => solid(0x8c9298, { rough: 0.45, metal: 0.3 });
  for (const side of [1, -1]) {
    const bz = side * BOOSTER.side;
    const low = chunk(`booster-low-${side}`, [0, 650, bz]);
    const up = chunk(`booster-up-${side}`, [0, 2150, bz]);
    hull(low, latheGeo(B_LOW).translate(0, 0, bz));
    hull(up, latheGeo(B_UP).translate(0, 0, bz));
    // (latheGeo is translated before hull() takes the centroid off: the order of translations is additive)
    const ll = [];
    arcPairs(178, BOOSTER.y0, 0, 360, 36, bz, ll);
    arcPairs(BOOSTER.r, 170, 0, 360, 36, bz, ll);
    arcPairs(BOOSTER.r, 680, 0, 360, 36, bz, ll);
    for (const a of [30, 150]) ll.push([shifted(ringPoint(a, BOOSTER.r, 170), bz), shifted(ringPoint(a, BOOSTER.r, 1360), bz)]);
    lines(low, ll);
    const lu = [];
    for (const [r, y] of [[BOOSTER.r, 1360], [BOOSTER.r, 2040], [BOOSTER.r, BOOSTER.y1], [110, 2950]]) arcPairs(r, y, 0, 360, 36, bz, lu);
    for (const a of [30, 150]) profilePairs(B_UP, a, bz, lu);
    lines(up, lu);
    const eapJet = { mesh: new THREE.Mesh(eapJetGeo, eapJetMat) };
    jets.push(eapJet.mesh);
    makeNozzle(low, [0, BOOSTER.y0, bz], EAP_BELL, eapJet, [112, 150]);
    // the struts: forward (one) and aft (two), each broken in a core half and a booster half
    const sm = strutMat();
    solidIn(coreUp, strutGeo, sm, [0, ATTACH.fwd, side * (RC + 9)]);
    solidIn(up, strutGeo, strutMat(), [0, ATTACH.fwd, side * (RC + 24)]);
    const sa = strutMat();
    const sb = strutMat();
    for (const x of [-45, 45]) {
      solidIn(coreLow, strutGeo, sa, [x, ATTACH.aft, side * (RC + 9)]);
      solidIn(low, strutGeo, sb, [x, ATTACH.aft, side * (RC + 24)]);
    }
    // the electric links' two plugs
    const pa = [LINK_A[0], LINK_A[1], side * LINK_A[2]];
    const pb = [LINK_B[0], LINK_B[1], side * LINK_B[2]];
    solidIn(coreUp, plugGeo, plugMat(), [pa[0], pa[1], side * (LINK_A[2] - 6)], { edges: 0.6 });
    solidIn(up, plugGeo, plugMat(), [pb[0], pb[1], side * (LINK_B[2] + 6)], { edges: 0.6 });
    const b = { side, low, up, parts: [low, up], H: V(0, ATTACH.aft, bz), plugA: V(...pa), plugB: V(...pb), jet: eapJet.mesh };
    boosters.push(b);
  }
  A.boosterN = anchor(boosters[0].up.g, 0, CENTER - boosters[0].up.C.y, 0);
  A.boosterS = anchor(boosters[1].up.g, 0, CENTER - boosters[1].up.C.y, 0);
  asShell(shellMeshes, 20);

  /* the linear charges along the hull (veille): down the core from the bay, along each booster from its forward end */
  const chargeMat = tubeMat();
  chargeMat.uniforms.uLen.value = C_LEN;
  const coreCharge = new THREE.Mesh(
    routeTube([V(...ringPoint(SEAM, RC + 4, CHARGES.core.y1)), V(...ringPoint(SEAM, RC + 4, CHARGES.core.y0))], 0, CHARGES.core.y1 - CHARGES.core.y0, 64),
    chargeMat,
  );
  coreCharge.frustumCulled = false;
  coreCharge.renderOrder = 8;
  group.add(coreCharge);
  for (const b of boosters) {
    const P = (y) => V(...shifted(ringPoint(CHARGES.booster.az, BOOSTER.r + 4, y), b.side * BOOSTER.side));
    const yMid = 1360;
    for (const [k, y0, y1] of [[b.up, CHARGES.booster.y1, yMid], [b.low, yMid, CHARGES.booster.y0]]) {
      const g = routeTube([P(y0), P(y1)], B_ROUTE0 + (CHARGES.booster.y1 - y0), B_ROUTE0 + (CHARGES.booster.y1 - y1), 40);
      g.translate(-k.C.x, -k.C.y, -k.C.z);
      const m = new THREE.Mesh(g, chargeMat);
      m.frustumCulled = false;
      m.renderOrder = 8;
      k.g.add(m);
    }
  }

  /* the electric links across each forward junction: a harness that sags when slack, tears in two (`links`) */
  const cables = boosters.map((b) => {
    const NS = 14;
    const NA = 6;
    const pos = [];
    const aS = [];
    const aA = [];
    const aHalf = [];
    const index = [];
    let base = 0;
    for (const half of [0, 1]) {
      for (let i = 0; i <= NS; i++) {
        for (let j = 0; j < NA; j++) {
          pos.push(0, 0, 0);
          aS.push(half * 0.5 + (0.5 * i) / NS);
          aA.push((TAU * j) / NA);
          aHalf.push(half);
        }
      }
      for (let i = 0; i < NS; i++) {
        for (let j = 0; j < NA; j++) {
          const a = base + i * NA + j;
          const c = base + i * NA + ((j + 1) % NA);
          index.push(a, c, c + NA, a, c + NA, a + NA);
        }
      }
      base += (NS + 1) * NA;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("aS", new THREE.Float32BufferAttribute(aS, 1));
    geo.setAttribute("aA", new THREE.Float32BufferAttribute(aA, 1));
    geo.setAttribute("aHalf", new THREE.Float32BufferAttribute(aHalf, 1));
    geo.setIndex(index);
    const uniforms = {
      uA: { value: V() }, uB: { value: V() }, uSag: { value: V() }, uDroop: { value: V(-25, -70, 0) }, uBreak: { value: 0 },
      uR: { value: 3.2 }, uMinW: { value: 2.4 }, uFocal: FOCAL, uColor: { value: INK.clone().multiplyScalar(0.6) },
      uHot: { value: SIGNAL.clone().multiplyScalar(1.7) }, uAmount: { value: 0 },
    };
    const mesh = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        vertexShader: /* glsl */ `
          attribute float aS; attribute float aA; attribute float aHalf;
          uniform vec3 uA, uB, uSag, uDroop; uniform float uBreak, uR, uMinW, uFocal;
          varying float vK; varying float vF;
          vec3 cable(float s) {
            vec3 p = mix(uA, uB, s) + uSag * sin(3.14159265 * s);
            vec3 e = aHalf > 0.5 ? uB : uA;
            float k = aHalf > 0.5 ? (1.0 - s) * 2.0 : s * 2.0;
            return e + (p - e) * (1.0 - 0.5 * uBreak) + uDroop * (uBreak * k * k);
          }
          void main() {
            vec3 c = cable(aS);
            vec3 T = normalize(cable(aS + 0.01) - cable(aS - 0.01) + vec3(1e-4, 0.0, 0.0));
            vec3 ref = abs(T.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
            vec3 N = normalize(cross(T, ref));
            vec3 B = cross(T, N);
            vec3 n = N * cos(aA) + B * sin(aA);
            vec4 mvc = modelViewMatrix * vec4(c, 1.0);
            float r = max(uR, 0.5 * uMinW * max(1.0, -mvc.z) / max(uFocal, 1.0));
            vec4 mv = modelViewMatrix * vec4(c + n * r, 1.0);
            vF = clamp(abs(dot(normalize(normalMatrix * n), normalize(-mv.xyz))), 0.0, 1.0);
            vK = aHalf > 0.5 ? (1.0 - aS) * 2.0 : aS * 2.0;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor, uHot; uniform float uBreak, uAmount;
          varying float vK; varying float vF;
          void main() {
            float end = smoothstep(0.8, 1.0, vK) * uBreak * (1.0 - 0.6 * uBreak);
            gl_FragColor = vec4(uColor * (0.35 + 0.65 * vF) + uHot * end, uAmount);
          }`,
      }),
    );
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    group.add(mesh);
    return { b, mesh, uniforms };
  });
  A.links = anchor(group, 0, LINKS.y, (RC + BOOSTER.side - BOOSTER.r) / 2);

  /* the signal from the torn links (+z) up the skin to the bay, veille */
  const pulseMat = tubeMat({ pulse: true });
  const pulsePts = [ringPoint(-7, RC + 5, LINKS.y), ringPoint(-7, RC + 5, 2920), ringPoint(-16, RC + 5, 3030), ringPoint(-30, RC + 5, 3095), ringPoint(SEAT.az, RC + 2, 3140), ringPoint(SEAT.az, SEAT.r, SEAT.y - 12)].map((p) => V(...p));
  const pulseLen = new THREE.CatmullRomCurve3(pulsePts, false, "centripetal").getLength();
  pulseMat.uniforms.uLen.value = pulseLen;
  const pulseTube = new THREE.Mesh(routeTube(pulsePts, 0, pulseLen, 60), pulseMat);
  pulseTube.frustumCulled = false;
  pulseTube.renderOrder = 8;
  group.add(pulseTube);

  /* the seat: the system's mount — local +x down the axis, +y inward, +z along the skin */
  const seatPos = V(...ringPoint(SEAT.az, SEAT.r, SEAT.y));
  const seat = new THREE.Group();
  seat.name = "seat";
  seat.position.copy(seatPos);
  const a = SEAT.az * DEG;
  const X = V(0, -1, 0);
  const Y = V(-Math.sin(a), 0, -Math.cos(a));
  const Z = new THREE.Vector3().crossVectors(X, Y);
  seat.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
  group.add(seat);
  A.seat = seat;
  A.bay = anchor(group, ...BAY_C);
  A.center = anchor(group, 0, CENTER, 0);
  A.top = anchor(group, 0, ROCKET.top, 0);

  /* fire at the junctions (rocket frame): tongues swept back, embers that fall, sparks; sparks at the torn links */
  const tongues = makeTongues();
  group.add(tongues.points);
  const embers = makeStreaks({
    count: 64, seed: 12, speed: [120, 520], period: [1.5, 2.8], width: [3, 4.5], lag: 0.07,
    dir: (side, r) => [(r() - 0.5) * 1.6, (r() - 0.2) * 1.2, (side ? 1 : -1) * (0.4 + r())],
    hot: SIGNAL.clone().multiplyScalar(2.0), cool: SIGNAL.clone().multiplyScalar(0.55),
  });
  const sparks = makeStreaks({
    count: 48, seed: 13, speed: [700, 1700], period: [0.7, 1.25], width: [2.4, 3.2], lag: 0.04,
    dir: (side, r) => [(r() - 0.5) * 2, (r() - 0.35) * 1.6, (side ? 1 : -1) * (0.3 + r() * 1.2)],
    hot: INK.clone().multiplyScalar(2.3), cool: SIGNAL.clone().multiplyScalar(1.4),
  });
  const linkSparks = makeStreaks({
    count: 22, seed: 14, speed: [90, 320], period: [0.45, 0.9], width: [2.0, 2.4], lag: 0.03,
    dir: (side, r) => [-0.4 - r(), (r() - 0.5) * 1.4, (r() - 0.5) * 1.4],
    hot: INK.clone().multiplyScalar(2.2), cool: SIGNAL.clone().multiplyScalar(1.3),
  });
  group.add(embers.mesh, sparks.mesh, linkSparks.mesh);
  const junctionStreaks = [embers, sparks];

  /* FREE (world frame): the trail, the breakup's fire and smoke, the falling pieces, the angle */
  const trail = makeTrail();
  free.add(trail.mesh);
  const fire = makeCloud({ count: 72, seed: 51, hot: SIGNAL.clone().multiplyScalar(0.55), cool: INK.clone().multiplyScalar(0.03) });
  const smoke = makeCloud({ count: 48, seed: 52, hot: INK.clone().multiplyScalar(0.035), cool: INK.clone().multiplyScalar(0.022) });
  const flash = makeFlash();
  free.add(smoke.points, fire.points, flash.mesh);
  const NG = 6 + chunks.length; // 0, 1 the junctions' fire · 2 the detonation at the bay · 3–5 the light running down each charge line · then one per falling chunk
  const glows = makeGlows(NG);
  glows.size.fill(260);
  glows.size[0] = glows.size[1] = 520;
  glows.size[2] = 1260;
  glows.hue[2] = 1;
  for (const i of [3, 4, 5]) {
    glows.size[i] = 190;
    glows.hue[i] = 1;
    glows.heart[i] = 1;
  }
  glows.heart.fill(0.6);
  glows.heart[2] = 1;
  free.add(glows.points);

  // debris: where each chunk lands (east of the pad), how it parts, how it turns
  for (const k of chunks) {
    const lateral = V(k.C.x, 0, k.C.z);
    const axial = k.name.startsWith("fairing") ? 0.8 : k.name.startsWith("core-low") ? -0.6 : k.name.startsWith("bay") ? 0.4 : 0;
    k.out = (lateral.lengthSq() > 1 ? lateral.normalize() : V()).add(V((rand() - 0.5) * 0.8, axial + (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.8)).normalize();
    k.sepD = 300 + rand() * 900;
    k.land = V(lerp(FALL.x0, FALL.x1, rand()), 60 + rand() * 60, (rand() * 2 - 1) * FALL.half * 0.9);
    k.rise = rand() * 500;
    k.spinAx = V(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    k.spin = 2 + rand() * 5;
    k.W0 = V();
    k.S = V();
    k.Wn = V();
  }
  const NSEG = 10;
  const smokeLine = dynSegments(chunks.length * NSEG, lineMat(0xffffff, 2.6, { vertexColors: true, opacity: 0 }));
  {
    const col = new Float32Array(chunks.length * NSEG * 6);
    for (let i = 0; i < chunks.length; i++) {
      for (let j = 0; j < NSEG; j++) {
        for (const [e, u] of [[0, j / NSEG], [1, (j + 1) / NSEG]]) {
          const c = new THREE.Color().copy(INK).multiplyScalar(0.06 + 0.3 * u * u).lerp(SIGNAL.clone().multiplyScalar(0.8), Math.pow(u, 6) * 0.8);
          col.set([c.r, c.g, c.b], (i * NSEG + j) * 6 + e * 3);
        }
      }
    }
    smokeLine.geo.setColors(col);
  }
  free.add(smokeLine.line);

  // the angle against the route: the axis, the route in dashes, the arc between them (veille)
  const ARC_DASH = 10;
  const ARC_SEG = 16;
  const arcLine = dynSegments(1 + ARC_DASH + ARC_SEG, lineMat(BRAND.veille, 3, { opacity: 0 }));
  free.add(arcLine.line);

  /* ═════════════ every frame ═════════════ */
  // the rocket's placement this call (world.js does the same with rocketAt): no allocation in update
  let PX = 0;
  let PY = 0;
  let PZ = 0;
  let TC = 1;
  let TS = 0;
  const toWorld = (v, out) => out.set(PX + v.x * TC + v.y * TS, PY - v.x * TS + v.y * TC, PZ + v.z);
  const toLocal = (w, out) => {
    const dx = w.x - PX;
    const dy = w.y - PY;
    return out.set(dx * TC - dy * TS, dx * TS + dy * TC, w.z - PZ);
  };
  const fallAt = (k, d, out) => {
    if (d <= 0.1) {
      const u = 1 - d / 0.1;
      return out.lerpVectors(k.W0, k.S, 1 - u * u);
    }
    const v = (d - 0.1) / 0.9;
    return out.set(lerp(k.S.x, k.land.x, v), k.S.y + (k.land.y - k.S.y) * Math.pow(v, 1.7) + k.rise * v * (1 - v), lerp(k.S.z, k.land.z, v));
  };
  const qA = new THREE.Quaternion();
  const qB = new THREE.Quaternion();
  const qT = new THREE.Quaternion();
  const tv = V();
  const tw = V();
  const tn = V();
  const jL = [V(), V()]; //  the junctions' fire, rocket frame
  const brk = V();
  const BRK_L = V(0, CENTER, 0);
  const BAY_L = V(...BAY_C);
  const UP = V(0, 1, 0);
  const SAG_DIR = V(-1, -0.35, 0).normalize();
  const CORE_FWD = boosters.map((b) => V(0, ATTACH.fwd, b.side * RC));
  const BST_FWD = boosters.map((b) => V(0, ATTACH.fwd, b.side * (BOOSTER.side - BOOSTER.r)));
  const chunkPoint = (k, home, out) => out.copy(home).sub(k.C).applyQuaternion(k.Q).add(k.P); // a home point of a chunk, where it is now

  return {
    group, free, A,
    /** p = { rocket, inside, climb, incid, gimbal, guide, burn, trail, tear, links, pulse, charge, blast, rip, debris, arc } — 16 times a frame, nothing allocated. */
    update(p, time = 0, px = 0) {
      if (px) FOCAL.value = px;
      const shown = clamp01(p.rocket ?? 1);
      const ins = clamp01(p.inside ?? 0) * shown;
      const cl = clamp01(p.climb ?? 0);
      const inc = p.incid ?? 0;
      const t = clamp01(p.tear ?? 0);
      const rip = clamp01(p.rip ?? 0);
      const dk = clamp01(p.debris ?? 0);
      const bl = clamp01(p.blast ?? 0);
      const lk = clamp01(p.links ?? 1);

      // where world.js has put the rocket (plan.js flightAt / rocketAt, inline)
      const rise = ALT - PAD.base;
      PX = DOWN * cl * cl;
      PY = PAD.base + rise * cl;
      PZ = 0;
      const pitch = Math.atan2(2 * DOWN * cl, rise);
      const tilt = pitch + inc * DEG;
      TC = Math.cos(tilt);
      TS = Math.sin(tilt);

      /* the chunks before the breakup: home, the flaps that open, the boosters that tear away */
      for (const k of chunks) {
        k.P.copy(k.C);
        k.Q.identity();
      }
      for (const f of flaps) {
        const o = smooth(f.r0, f.r0 + 0.38, rip);
        qA.setFromAxisAngle(AY, f.sign * 100 * o * DEG); // a door flung open about its far edge, pushed out by the blast
        f.k.P.copy(f.k.C).sub(f.H).applyQuaternion(qA).add(f.H).addScaledVector(f.rad, 110 * o);
        f.k.Q.copy(qA);
        f.cutMat.opacity = smooth(0, 0.1, o) * (1 - 0.4 * smooth(0.6, 1, o)) * shown * (1 - smooth(0.06, 0.3, dk));
      }
      const u = clamp01((t - 0.45) / 0.55);
      const flutter = 0.4 * Math.sin(time * 4.7) * smooth(0.08, 0.3, t) * (1 - u);
      const fall = 2000 * u * u;
      for (const b of boosters) {
        const th = 14 * Math.pow(Math.min(t, 0.45) / 0.45, 1.6) + 75 * Math.pow(u, 1.3) + flutter * b.side;
        qA.setFromAxisAngle(AX, b.side * th * DEG);
        qB.setFromAxisAngle(AY, b.side * 50 * u * DEG);
        qT.multiplyQuaternions(qA, qB);
        for (const k of b.parts) {
          k.P.copy(k.C).sub(b.H).applyQuaternion(qT).add(b.H);
          k.P.x += TS * fall;
          k.P.y += -1200 * u - TC * fall;
          k.P.z += b.side * 1800 * u;
          k.Q.copy(qT);
        }
      }

      /* debris: from where each chunk is to the ground east of the pad (a pure function of the state: it rewinds) */
      const hot = smooth(0.06, 0.3, dk);
      for (let i = 0; i < chunks.length; i++) {
        const k = chunks[i];
        if (dk > 0.0005) {
          toWorld(k.P, k.W0);
          tn.set(k.out.x * TC + k.out.y * TS, -k.out.x * TS + k.out.y * TC, k.out.z);
          k.S.copy(k.W0).addScaledVector(tn, k.sepD);
          fallAt(k, dk, k.Wn);
          toLocal(k.Wn, k.g.position);
          qA.setFromAxisAngle(k.spinAx, k.spin * dk);
          k.g.quaternion.multiplyQuaternions(qA, k.Q);
        } else {
          k.g.position.copy(k.P);
          k.g.quaternion.copy(k.Q);
          toWorld(k.P, k.Wn);
        }
        k.g.visible = shown > 0.003;
        k.glass.uniforms.uAmount.value = shown;
        k.glass.uniforms.uColor.value.lerpColors(INK, SIGNAL, 0.85 * hot);
        k.line.opacity = 0.72 * shown;
        k.line.color.lerpColors(INK, SIGNAL, hot);
        k.fine.opacity = 0.3 * shown * (1 - hot);
        for (const s of k.solids) {
          const v = s.inside ? ins : shown;
          s.mesh.visible = v > 0.003;
          s.mat.opacity = v;
          s.mat.transparent = v < 0.995;
          if (s.edge) s.edge.material.opacity = s.eo * v;
        }
        // its flame while it falls, a smoulder once down
        const fl = smooth(0.1, 0.16, dk) * (1 - 0.72 * smooth(0.9, 1, dk)) * shown;
        glows.amt[6 + i] = fl * (0.85 + 0.15 * Math.sin(time * 2.3 + i * 1.7));
        glows.pos[(6 + i) * 3] = k.Wn.x;
        glows.pos[(6 + i) * 3 + 1] = k.Wn.y;
        glows.pos[(6 + i) * 3 + 2] = k.Wn.z;
        // its smoke trail, back along its own fall
        const k0 = Math.max(0.1, dk - 0.45);
        for (let j = 0; j < NSEG; j++) {
          const o = (i * NSEG + j) * 6;
          fallAt(k, k0 + ((dk - k0) * j) / NSEG, tw);
          smokeLine.arr[o] = tw.x;
          smokeLine.arr[o + 1] = tw.y;
          smokeLine.arr[o + 2] = tw.z;
          fallAt(k, k0 + ((dk - k0) * (j + 1)) / NSEG, tw);
          smokeLine.arr[o + 3] = tw.x;
          smokeLine.arr[o + 4] = tw.y;
          smokeLine.arr[o + 5] = tw.z;
        }
      }
      smokeLine.buf.needsUpdate = true;
      smokeLine.geo.instanceCount = dk > 0.105 ? chunks.length * NSEG : 0;
      smokeLine.line.material.opacity = smooth(0.1, 0.2, dk) * (1 - 0.5 * smooth(0.95, 1, dk));

      /* the bay: the two SRI, alive (veille) or dead (signal, dim) — the colour switches through black, never kaki */
      const g = clamp01(p.guide ?? 0);
      const alive = smooth(0.5, 1, g);
      const dead = smooth(0.5, 0, g) * 0.5;
      for (const s of sriGlow) {
        s.mesh.visible = ins > 0.003;
        s.mat.color.copy(alive > 0 ? VEILLE : SIGNAL).multiplyScalar(1.6 * (alive > 0 ? alive : dead) * ins);
      }
      for (const e of sriEdges) {
        e.material.color.copy(alive > 0 ? VEILLE : INK);
        e.material.opacity = (alive > 0 ? 0.95 * alive : 0.5) * ins;
      }

      /* the nozzles: hard over (`gimbal`), their actuators follow; the jets (`burn`: 0 is out, at once) */
      const gm = clamp01(p.gimbal ?? 0) * 7 * DEG;
      const gc = Math.cos(gm);
      const gs = Math.sin(gm);
      for (const n of nozzles) {
        n.pivot.rotation.z = gm;
        for (const ac of n.acts) {
          tw.set(n.pivot.position.x + ac.N.x * gc - ac.N.y * gs, n.pivot.position.y + ac.N.x * gs + ac.N.y * gc, n.pivot.position.z + ac.N.z);
          tv.subVectors(tw, ac.S);
          const len = tv.length();
          ac.mesh.position.addVectors(tw, ac.S).multiplyScalar(0.5);
          ac.mesh.quaternion.setFromUnitVectors(UP, tv.multiplyScalar(1 / Math.max(len, 1e-3)));
          ac.mesh.scale.set(1, len, 1);
        }
      }
      const burn = clamp01(p.burn ?? 0) * shown;
      eapJetMat.uniforms.uAmount.value = burn * (1 - 0.65 * smooth(0.25, 1, dk));
      vulJetMat.uniforms.uAmount.value = burn * (1 - smooth(0.05, 0.6, rip)) * 0.75;
      eapJetMat.uniforms.uFlow.value = vulJetMat.uniforms.uFlow.value = time * 9;
      for (const j of jets) j.visible = j.material.uniforms.uAmount.value > 0.003;

      /* the charges: the light that runs from the bay, the detonation front */
      const c = clamp01(p.charge ?? 0);
      chargeMat.uniforms.uAmount.value = shown * Math.min(1, c / 0.25) * (1 - smooth(0.08, 0.2, dk));
      chargeMat.uniforms.uHead.value = c <= 0.25 ? -400 : ((c - 0.25) / 0.75) * (C_LEN + 80);
      chargeMat.uniforms.uFront.value = bl > 0.001 ? bl * (C_LEN + 400) : -1;
      coreCharge.visible = chargeMat.uniforms.uAmount.value > 0.002;
      // a light that has a place runs with the head (« la lumière court ») and with the detonation front, on every line
      const runS = bl > 0.001 && bl < 0.999 ? bl * (C_LEN + 400) : c > 0.25 && c < 0.999 ? ((c - 0.25) / 0.75) * (C_LEN + 80) : -1;
      const runA = (bl > 0.001 && bl < 0.999 ? 1 : 0.6) * chargeMat.uniforms.uAmount.value;
      for (let i = 0; i < 3; i++) {
        let a = 0;
        if (runS >= 0) {
          if (i === 0) {
            a = smooth(-40, 40, runS) * (1 - smooth(CORE_RUN - 60, CORE_RUN, runS));
            tv.set(SEAM_X, CHARGES.core.y1 - Math.min(runS, CORE_RUN), SEAM_Z);
          } else {
            const b = boosters[i - 1];
            const y = CHARGES.booster.y1 - clamp01((runS - B_ROUTE0) / (C_LEN - B_ROUTE0)) * (CHARGES.booster.y1 - CHARGES.booster.y0);
            a = smooth(B_ROUTE0 - 40, B_ROUTE0 + 40, runS) * (1 - smooth(C_LEN - 60, C_LEN, runS));
            tn.set(B_CX, y, b.side * BOOSTER.side + B_CZ);
            chunkPoint(y > 1360 ? b.up : b.low, tn, tv);
          }
          toWorld(tv, tw);
          glows.pos[(3 + i) * 3] = tw.x;
          glows.pos[(3 + i) * 3 + 1] = tw.y;
          glows.pos[(3 + i) * 3 + 2] = tw.z;
        }
        glows.amt[3 + i] = a * runA;
      }

      /* the links: stretched between their plugs, torn (`links` 0); the pulse runs to the bay */
      for (const cb of cables) {
        const b = cb.b;
        const k = b.up;
        cb.uniforms.uA.value.copy(b.plugA);
        chunkPoint(k, b.plugB, cb.uniforms.uB.value);
        const dist = cb.uniforms.uA.value.distanceTo(cb.uniforms.uB.value);
        cb.uniforms.uSag.value.copy(SAG_DIR).multiplyScalar(Math.max(0, LINKS.len - dist) * 0.55);
        cb.uniforms.uBreak.value = 1 - lk;
        cb.uniforms.uAmount.value = ins * (1 - smooth(0.05, 0.12, dk));
        cb.mesh.visible = cb.uniforms.uAmount.value > 0.003;
      }
      const pu = clamp01(p.pulse ?? 0);
      pulseMat.uniforms.uHead.value = pu * (pulseLen + 420);
      pulseMat.uniforms.uAmount.value = shown * (pu > 0.001 ? 1 : 0);
      pulseTube.visible = pulseMat.uniforms.uAmount.value > 0;
      // live ends spark once torn (+z cable)
      const c0 = cables[0];
      linkSparks.uniforms.uT.value = time;
      linkSparks.uniforms.uO0.value.copy(c0.uniforms.uA.value).lerp(c0.uniforms.uB.value, 0.25);
      linkSparks.uniforms.uO1.value.copy(c0.uniforms.uB.value).lerp(c0.uniforms.uA.value, 0.25);
      linkSparks.uniforms.uAmt0.value = linkSparks.uniforms.uAmt1.value = (1 - lk) * ins * (1 - smooth(0.05, 0.12, dk));
      linkSparks.uniforms.uGrav.value.set(TS * 500, -TC * 500, 0);

      /* the fire at the junctions: where the boosters' noses leave the core (driven by tear − 1.5·debris: it never relights backwards) */
      const jf = smooth(0.1, 0.3, t - 1.5 * dk) * (1 - smooth(0.7, 1, t)) * shown;
      for (let i = 0; i < 2; i++) {
        const b = boosters[i];
        chunkPoint(b.up, BST_FWD[i], jL[i]).add(CORE_FWD[i]).multiplyScalar(0.5);
        toWorld(jL[i], tw);
        glows.pos[i * 3] = tw.x;
        glows.pos[i * 3 + 1] = tw.y;
        glows.pos[i * 3 + 2] = tw.z;
        glows.amt[i] = jf * (0.86 + 0.14 * Math.sin(time * 3.1 + i * 2.1));
      }
      tongues.uniforms.uT.value = time;
      tongues.uniforms.uO0.value.copy(jL[1]); // aSide 0 is the −z side
      tongues.uniforms.uO1.value.copy(jL[0]);
      tongues.uniforms.uAmt0.value = tongues.uniforms.uAmt1.value = jf;
      tongues.uniforms.uFlow.value.set(0, -2600, 0);
      for (const s of junctionStreaks) {
        s.uniforms.uT.value = time;
        s.uniforms.uO0.value.copy(jL[1]);
        s.uniforms.uO1.value.copy(jL[0]);
        s.uniforms.uAmt0.value = s.uniforms.uAmt1.value = jf;
      }
      embers.uniforms.uFlow.value.set(0, -1300, 0);
      embers.uniforms.uGrav.value.set(TS * 900, -TC * 900, 0);
      sparks.uniforms.uFlow.value.set(0, -900, 0);
      sparks.uniforms.uGrav.value.set(TS * 500, -TC * 500, 0);

      /* the detonation's flash at the bay (it dies as soon as the hull opens), the breakup's fire (rip − debris) and its smoke */
      toWorld(BAY_L, tw);
      glows.pos[6] = tw.x;
      glows.pos[7] = tw.y;
      glows.pos[8] = tw.z;
      glows.amt[2] = smooth(0, 0.04, bl) * (1 - smooth(0.05, 0.4, bl)) * (1 - smooth(0.005, 0.03, rip)) * shown;
      glows.geo.attributes.position.needsUpdate = true;
      glows.geo.attributes.aAmt.needsUpdate = true;
      BRK_L.set(0, lerp(ROCKET.bay.y0, CENTER - 300, smooth(0, 1, rip)), 0);
      toWorld(BRK_L, brk);
      const fg = smooth(0.15, 0.6, rip - dk) * smooth(0.3, 0.85, rip); // small while the hull unzips, then it takes
      fire.uniforms.uC.value.copy(brk);
      fire.uniforms.uR.value = 300 + 2000 * smooth(0.45, 1, rip) + 1600 * dk;
      fire.uniforms.uSize.value = 360 + 420 * rip;
      fire.uniforms.uRise.value = 600 * dk;
      fire.uniforms.uMix.value = 0.1 + 0.6 * smooth(0.1, 0.7, dk);
      fire.uniforms.uAmt.value = fg;
      fire.uniforms.uCoreAmt.value = 1 - smooth(0.3, 0.9, rip + dk);
      fire.uniforms.uT.value = smoke.uniforms.uT.value = time;
      smoke.uniforms.uC.value.copy(brk);
      smoke.uniforms.uR.value = 1200 + 2600 * rip + 2600 * dk;
      smoke.uniforms.uSize.value = 1000 + 1100 * dk;
      smoke.uniforms.uRise.value = 1200 * dk;
      smoke.uniforms.uAmt.value = smooth(0.4, 0.9, rip) * (0.45 + 0.55 * dk);
      flash.mesh.position.copy(brk);
      flash.uniforms.uAmount.value = fg * (0.9 + 0.1 * Math.sin(time * 1.9));
      flash.uniforms.uHeart.value = 1 - smooth(0.2, 0.8, rip - 0.3 + dk);
      flash.uniforms.uSize.value = 1300 + 900 * rip;

      /* the smoke trail along the flown path, warmed by the fire near the rocket */
      trail.uniforms.uCl.value = Math.max(cl, 1e-4);
      trail.uniforms.uBase.value.set(PX, PY, PZ);
      trail.uniforms.uAxis.value.set(TS, TC, 0);
      trail.uniforms.uAmount.value = clamp01(p.trail ?? 0) * smooth(0.003, 0.03, cl);
      trail.uniforms.uWarmAmt.value = Math.min(1, 0.6 * jf + 0.9 * fg);
      trail.uniforms.uT.value = time;
      trail.mesh.visible = trail.uniforms.uAmount.value > 0.002;

      /* the angle against its route: the axis, the route in dashes, the arc between them */
      const ar = clamp01(p.arc ?? 0);
      const L = 4200;
      const R = 3000;
      const ax = arcLine.arr;
      const bx = brk.x;
      const by = brk.y;
      const bz = brk.z;
      ax[0] = bx - 0.18 * L * TS;
      ax[1] = by - 0.18 * L * TC;
      ax[2] = bz;
      ax[3] = bx + L * TS;
      ax[4] = by + L * TC;
      ax[5] = bz;
      const ps = Math.sin(pitch);
      const pc = Math.cos(pitch);
      const dashes = ARC_DASH * smooth(0, 0.4, ar); // the route draws itself on, dash after dash, each one growing
      for (let i = 0; i < ARC_DASH; i++) {
        const o = (1 + i) * 6;
        const s0 = (L * i) / ARC_DASH;
        const s1 = s0 + (L / ARC_DASH) * 0.6 * clamp01(dashes - i);
        ax[o] = bx + s0 * ps;
        ax[o + 1] = by + s0 * pc;
        ax[o + 2] = bz;
        ax[o + 3] = bx + s1 * ps;
        ax[o + 4] = by + s1 * pc;
        ax[o + 5] = bz;
      }
      const sweep = smooth(0.35, 1, ar);
      for (let i = 0; i < ARC_SEG; i++) {
        const o = (1 + ARC_DASH + i) * 6;
        const a0 = pitch + (tilt - pitch) * sweep * (i / ARC_SEG);
        const a1 = pitch + (tilt - pitch) * sweep * ((i + 1) / ARC_SEG);
        ax[o] = bx + R * Math.sin(a0);
        ax[o + 1] = by + R * Math.cos(a0);
        ax[o + 2] = bz;
        ax[o + 3] = bx + R * Math.sin(a1);
        ax[o + 4] = by + R * Math.cos(a1);
        ax[o + 5] = bz;
      }
      arcLine.buf.needsUpdate = true;
      arcLine.geo.instanceCount = 1 + Math.ceil(dashes) + (sweep > 0.01 ? ARC_SEG : 0);
      arcLine.line.material.opacity = ar;
      arcLine.line.visible = ar > 0.003;
    },
  };
}
