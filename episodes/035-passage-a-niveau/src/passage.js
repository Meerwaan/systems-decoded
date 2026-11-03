// DOSSIER 035 — Passage à niveau : THE CROSSING at night, seen like an X-ray. A WRAPPER (docs/catalogue.md,
// « réutiliser sans casser un film publié »): 025's country road and its car (014/011's body, you at the wheel,
// its dressing) IMPORTED as they are; 021's TGV Duplex imported as it is, its own line hidden, set on OUR track;
// 011's car as the last of the queue; and around them what a French automatic level crossing has: two tracks across
// the road (solid rails with a bright head; sleepers and ballast in ONE ground shader, antialiased: nothing fine hops
// when the camera runs along the track), the deck over them (rubber panels drawn as joints, never a grey slab), the
// catenary's masts and wires, the « passage à niveau avec barrières » sign (A7), the four masts' feet (world.js hangs
// the four G2 signals, model.js, on `mounts`), the queue stopped ahead, the alert phone and the signboard, the people
// who get out, the 800 m ruler. Nothing of 025's dressing that does not belong here: its wood is cleared 15 m around
// the tracks (a patch of its shader, made here at build time), its « passage d'animaux » sign is hidden.
//
//   buildPassage() → { group, pn, mounts, route, train, A, update(P, time, px) }
//   group   the CAR's frame (add it to the scene): route.group, the crossing `pn`, the car's extras (dashboard)
//   pn      the CROSSING's frame (plan.js): stands at z = −100·gap in the car's frame
//   mounts  { outA, inA, inB, outB }: empty groups in `pn`, at SIGNALS[k].at, turned by SIGNALS[k].turn
//   A       anchors: trainNose, lamps (the TGV's headlamps), other (the second train's), rulerHead (the ruler's end),
//           ruler800 (the 800 m tick), fileCar (the queue's last car, its tail), phone, board, you, pax (the people's
//           heads), deck (voie 2 under our lane), a7 (the warning sign)
//   P = { shell, gap, kmh, rolled, wet, you, car, alive, people, train, beam, other, ruler, file, phone }
//     shell   the X-ray of everything here (road, car, train, crossing): 0–1
//     gap     metres from the car's centre to the crossing's centre (ahead +, behind −): the road scrolls with it
//     kmh     the car's speed (its wheels, the road's smear) · rolled: metres its wheels have rolled
//     wet     the road's wetness (025's reflections). The film: ≈ 0.25 — and NO rain falls (025's rain is hidden)
//     you     you at the wheel (025's glass figure) 0/1 · car: our car seen (0 hides it: the top-view maquette)
//     alive   the car alive: 1 the dashboard lit and the engine driving (025's `gas` heads) → 0 dead. Between,
//             the dashboard flickers (driven by the value, not a clock): « sauf si ta voiture ne roule plus »
//     people  0 everybody in the car → 1 you and a passenger out, walking round the car's tail to the verge by the
//             phone, behind the entry barrier (nobody is ever on a track while a train is in the frame: the acts)
//     train   metres from our lane's line (x = 0) to the TGV's nose along voie 2: + coming (from +x), − gone past
//     beam    the TGV's headlamps: 0 off → 1 on — a bright core, a long tail, the rails they light ahead of the
//             train; never fogged out (seen from 800 m); its glass keeps its outline far away (gain with distance)
//     other   « un train peut en cacher un autre »: 0 nothing → 1 a second pair of headlamps on VOIE 1, from −x
//     ruler   the stopping distance unrolls along voie 2 from the road toward the train: 0 → 1 = 800 m, a tick
//             every 100 m, signal, its head a small lamp (« il lui faut huit cents mètres pour s'arrêter »)
//     file    the queue ahead: 0 none → 1 there (011's car), its stop lights and the further ones on (signal)
//     phone   the alert phone and the signboard light up veille when the voice names them: 0–1
//
// What is reconstituted (docs/faits, « à ne pas dire »): the phone and the signboard stand side by side (in reality
// one or the other); the signboard's number is a few bars, never digits (no number is sourced).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, lineMat, box, cyl, anchor } from "@kit/build3d.js";
import { buildRoute } from "../../025-esp/src/route.js";
import { buildTrain } from "../../021-veille-tgv/src/train.js";
import { POWER } from "../../021-veille-tgv/src/plan.js";
import { buildCar } from "../../011-fusible-pyro/src/car.js";
import { CAR, ROAD, TRACKS, DECK, BARRIER, SIGNALS, FILE, TRAIN, OTHER, RULER, PHONE, SIGNBOARD, PEOPLE, DASH } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const WHITE = new THREE.Color(1, 0.97, 0.92); // a headlamp's core: ink pushed to white
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

const FAR = TRACKS.far; //                    the tracks run 1.2 km each way
const HALF_G = TRACKS.gauge / 2; //           a rail's axis from its track's axis
const V2 = TRACKS.z[TRAIN.track]; //          voie 2 (the TGV's)
const V1 = TRACKS.z[OTHER.track]; //          voie 1 (the second train's)
const DECK_X = [ROAD.otherEdge - 130, ROAD.edge + 130]; // the deck, across the whole road and its verges
const CLEAR = [1700, 2300]; //                the wood is cleared within ±17 m of the crossing's centre (±15 m of each track), faded to 23 m
const LIT_REACH = 6000; //                    how far ahead of a train its lamps light the rails (cm, an exponential)
const BED_Y = -17.5; //                       the sleepers' top (the rail heads are flush with the road, y = 0)
const RULER_Z = V2 + 112; //                  the ruler on the ballast, just inside voie 2 (toward voie 1)

/* ───────────────────────────────────────────────────────────── shared uniforms: the fog, the lens, the lamps */
// Read once per frame (the bed's onBeforeRender): the scene's fog density, so that what is drawn here sinks into the
// night more slowly than the road (the rails must lead the eye to the train), and the lens (px per cm at 1 cm).
const FOG = { value: 0.00011 };
const FOCAL = { value: 1600 };
// the TGV's light on the rails ahead of it (x of its nose, beam, the track's z, reach) — and the second train's
const LIT_A = { value: new THREE.Vector4(1e9, 0, V2, LIT_REACH) };
const LIT_B = { value: new THREE.Vector4(-1e9, 0, V1, LIT_REACH) };

const FOG_GLSL = /* glsl */ `
  float gentleFog(vec3 w, float k) {
    float f = length(w - cameraPosition) * uFogD * k;
    return exp(-f * f);
  }`;
const LIT_GLSL = /* glsl */ `
  // a train's lamps on the track ahead of its nose: A comes from +x (lights x < its nose), B from −x (x > its nose)
  float litBy(vec3 l) {
    float onA = 1.0 - smoothstep(95.0, 150.0, abs(l.z - uLitA.z));
    float aA = uLitA.x - l.x;
    float onB = 1.0 - smoothstep(95.0, 150.0, abs(l.z - uLitB.z));
    float aB = l.x - uLitB.x;
    return uLitA.y * onA * step(0.0, aA) * exp(-max(aA, 0.0) / uLitA.w) * smoothstep(-10.0, 120.0, aA)
         + uLitB.y * onB * step(0.0, aB) * exp(-max(aB, 0.0) / uLitB.w) * smoothstep(-10.0, 120.0, aB);
  }`;

/**
 * A line that never goes under `minPx` pixels: a ribbon through `points`, turned toward the eye in the vertex shader,
 * `half` cm wide close up, widened far away. The rail heads, the ruler and its ticks. `clip`: what lies beyond local
 * x = uClip is not drawn (the ruler unrolling). Additive: dark is nothing.
 */
function stripMat({ color = INK, k = 1, half = 3.5, minPx = 1.8, fogK = 0.45, lit = 0, far = FAR } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide, // a ribbon turned toward the eye: either winding
    uniforms: {
      uColor: { value: color.clone().multiplyScalar(k) }, uAmount: { value: 1 }, uHalf: { value: half }, uMinPx: { value: minPx },
      uFocal: FOCAL, uFogD: FOG, uFogK: { value: fogK }, uFar: { value: far }, uClip: { value: 1e9 }, uLit: { value: lit },
      uLitA: LIT_A, uLitB: LIT_B,
    },
    vertexShader: /* glsl */ `
      attribute vec3 aT; attribute float aSide;
      uniform float uHalf, uMinPx, uFocal;
      varying vec3 vL; varying vec3 vW;
      void main() {
        vL = position;
        vW = (modelMatrix * vec4(position, 1.0)).xyz;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 t = (modelViewMatrix * vec4(aT, 0.0)).xyz;
        vec3 n = cross(t, mv.xyz);
        float ln = length(n);
        n = ln > 1e-6 ? n / ln : vec3(0.0, 1.0, 0.0);
        float depth = max(1.0, -mv.z);
        mv.xyz += n * aSide * max(uHalf, 0.5 * uMinPx * depth / max(uFocal, 1.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uFogD, uFogK, uFar, uClip, uLit; uniform vec4 uLitA, uLitB;
      varying vec3 vL; varying vec3 vW;
      ${FOG_GLSL}
      ${LIT_GLSL}
      void main() {
        if (uAmount < 0.003 || vL.x > uClip) discard;
        float ends = 1.0 - smoothstep(0.55 * uFar, uFar, abs(vL.x));
        float lit = uLit * litBy(vL);
        float near = mix(0.35, 1.0, smoothstep(300.0, 1500.0, length(vW - cameraPosition))); // close up, the solid rail speaks
        vec3 c = uColor * gentleFog(vW, uFogK) * ends * near + ${WHITE.toArray().map((v) => (1.15 * v).toFixed(3)).join(", ").replace(/^/, "vec3(")}) * lit * gentleFog(vW, 0.22);
        gl_FragColor = vec4(c * uAmount, 1.0);
      }`,
  });
}
/** The geometry of a ribbon through points (each [x, y, z]), its tangent `t` (a Vector3, the same for all). */
function stripGeo(points, t) {
  const n = points.length;
  const pos = new Float32Array(n * 6);
  const tan = new Float32Array(n * 6);
  const side = new Float32Array(n * 2);
  const index = [];
  for (let i = 0; i < n; i++) {
    for (let s = 0; s < 2; s++) {
      pos.set(points[i], (2 * i + s) * 3);
      tan.set([t.x, t.y, t.z], (2 * i + s) * 3);
      side[2 * i + s] = s ? 1 : -1;
    }
    if (i < n - 1) index.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aT", new THREE.BufferAttribute(tan, 3));
  geo.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geo.setIndex(index);
  return geo;
}
/** x samples from −far to +far, dense at the crossing, sparse far away (the ribbon widens per vertex). */
function spanX(far, n = 150) {
  const xs = [];
  for (let i = -n; i <= n; i++) xs.push(Math.sign(i) * far * (Math.abs(i) / n) ** 2);
  return xs;
}
const strip = (points, t, material, order = 4) => {
  const mesh = new THREE.Mesh(stripGeo(points, t), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = order;
  return mesh;
};

/**
 * A lamp seen from far: a bright core, a halo, a long faint tail — always facing the eye, never under `minPx` pixels
 * (radius), never fogged. `size`: its radius in cm close up. Additive, drawn before the glass shells (order 7).
 */
function lampMat(color, k, { size = 300, minPx = 60 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: color.clone().multiplyScalar(k) }, uAmount: { value: 0 }, uSize: { value: size }, uMinPx: { value: minPx }, uFocal: FOCAL },
    vertexShader: /* glsl */ `
      uniform float uSize, uMinPx, uFocal; varying vec2 vQ;
      void main() {
        vQ = position.xy;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float depth = max(1.0, -mv.z);
        mv.xy += position.xy * max(uSize, uMinPx * depth / max(uFocal, 1.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
      void main() {
        if (uAmount < 0.003) discard;
        float r = length(vQ);
        float a = 1.25 * exp(-r * r / 0.004) + 0.26 * exp(-r / 0.07) + 0.05 * exp(-r / 0.3);
        a *= 1.0 - smoothstep(0.7, 1.0, r);
        gl_FragColor = vec4(uColor * a * uAmount, 1.0);
      }`,
  });
}
const QUAD = new THREE.PlaneGeometry(2, 2);
function lampAt(parent, material, x, y, z) {
  const mesh = new THREE.Mesh(QUAD, material);
  mesh.position.set(x, y, z);
  mesh.frustumCulled = false;
  mesh.renderOrder = 7;
  parent.add(mesh);
  return mesh;
}

/** Fine ink lines (screen pixels), segments as a flat list [x0,y0,z0, x1,y1,z1, …]. */
function inkLines(segments, { width = 1.8, opacity = 0.4, fog = true, color = BRAND.ink } = {}) {
  const geo = new LineSegmentsGeometry().setPositions(segments);
  const mat = lineMat(color, width, { opacity, fog });
  mat.userData.base = opacity;
  const lines = new LineSegments2(geo, mat);
  lines.frustumCulled = false;
  lines.renderOrder = 2;
  return lines;
}

/* ───────────────────────────────────────────────────────────── the track bed: sleepers and ballast, ONE shader */
function makeBed() {
  const uniforms = {
    uInk: { value: INK.clone() }, uAmount: { value: 1 }, uFogD: FOG, uFogK: { value: 0.5 }, uFar: { value: FAR },
    uDeck: { value: new THREE.Vector2(...DECK_X) }, uTracks: { value: new THREE.Vector2(TRACKS.z[0], TRACKS.z[1]) },
    uLitA: LIT_A, uLitB: LIT_B,
  };
  const geo = new THREE.PlaneGeometry(2 * FAR, 2 * (Math.abs(TRACKS.z[0]) + TRACKS.ballast + 60), 1, 1).rotateX(-Math.PI / 2);
  geo.translate(0, BED_Y, (TRACKS.z[0] + TRACKS.z[1]) / 2);
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec3 vL; varying vec3 vW;
        void main() {
          vL = position;
          vW = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uInk; uniform float uAmount, uFogD, uFogK, uFar; uniform vec2 uDeck, uTracks; uniform vec4 uLitA, uLitB;
        varying vec3 vL; varying vec3 vW;
        ${FOG_GLSL}
        ${LIT_GLSL}
        // bands w wide every p, antialiased; once they would go under a pixel, their average grey instead
        float bands(float x, float p, float w) {
          float fw = max(fwidth(x), 1e-4);
          float u = abs(fract(x / p) - 0.5) * p;
          float a = 1.0 - smoothstep(0.5 * w - fw, 0.5 * w + fw, u);
          return mix(a, w / p, smoothstep(0.18 * p, 0.5 * p, fw));
        }
        float edge(float d, float w) {
          float fw = max(fwidth(d), 1e-4);
          return 1.0 - smoothstep(w, w + 1.5 * fw, abs(d));
        }
        float track(float rel, float x) {
          float a = abs(rel);
          float sleepers = bands(x, ${TRACKS.sleeper.toFixed(1)}, 26.0) * (1.0 - smoothstep(${(TRACKS.sleeperLen / 2 - 6).toFixed(1)}, ${(TRACKS.sleeperLen / 2).toFixed(1)}, a));
          float stones = 1.0 - smoothstep(${(TRACKS.ballast - 20).toFixed(1)}, ${(TRACKS.ballast + 30).toFixed(1)}, a);
          float shoulder = edge(a - ${TRACKS.ballast.toFixed(1)}, 1.5);
          return 0.13 * sleepers + 0.028 * stones + 0.05 * shoulder;
        }
        void main() {
          if (uAmount < 0.003) discard;
          float off = smoothstep(uDeck.x - 40.0, uDeck.x, vL.x) * (1.0 - smoothstep(uDeck.y, uDeck.y + 40.0, vL.x)); // the deck covers it
          float ends = 1.0 - smoothstep(0.55 * uFar, uFar, abs(vL.x));
          float k = max(track(vL.z - uTracks.x, vL.x), track(vL.z - uTracks.y, vL.x));
          float lit = litBy(vL);
          float light = k * (gentleFog(vW, uFogK) * ends + 1.4 * lit * gentleFog(vW, 0.22));
          gl_FragColor = vec4(uInk * light * (1.0 - off) * uAmount, 1.0);
        }`,
    }),
  );
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  return { mesh, uniforms };
}

/* ───────────────────────────────────────────────────────────── the build */

export function buildPassage() {
  const group = new THREE.Group();
  const route = buildRoute();
  const pn = new THREE.Group();
  group.add(route.group, pn);
  const A = {};

  // three greys, little metal (the solids here: rails, the phone, the signboard)
  const steel = solid(0x8d959b, { rough: 0.42, metal: 0.4, env: 1.1 });
  const mid = solid(0x5d656c, { rough: 0.6, metal: 0.25 });
  const dark = solid(0x2c3237, { rough: 0.8, env: 0.5 });

  /* ── 025's road, as it is — less what does not belong at a crossing ── */
  const slide = route.group.children[0].children[0]; // route.js: group › pivot › slide (road, rain, wood, animals, dressing)
  const rainMesh = slide.children.find((m) => m.material?.uniforms?.uSpeed && m.material.uniforms.uBox); // no rain falls in this film
  const wood = slide.children.find((m) => m.geometry?.attributes?.aTree);
  if (wood) {
    // the edge of the wood is cleared around the tracks: the trunks within CLEAR of the crossing's centre fade out
    // (z + uScroll is how far a trunk stands from the crossing, in the car's frame). A patch of THIS build's copy of
    // the shader: 025's file is not touched.
    const m = wood.material;
    m.vertexShader = m.vertexShader.replace("vK = ends *", `vK = smoothstep(${CLEAR[0].toFixed(1)}, ${CLEAR[1].toFixed(1)}, abs(z + uScroll)) * ends *`);
    m.needsUpdate = true;
  }
  const dressing = slide.children.find((c) => c.name === "habillage");
  if (dressing) for (const node of dressing.children) if (node.children.length === 3) node.visible = false; // A15b « passage d'animaux » (posts: 2 children, the borne: 1)

  /* ── the tracks: solid rails, a bright head that never thins under a pixel, the bed in one shader ── */
  const bed = makeBed();
  pn.add(bed.mesh);
  const headMat = stripMat({ color: INK, k: 0.3, half: 3.4, minPx: 1.9, fogK: 0.42, lit: 1 });
  const xs = spanX(FAR);
  const alongX = V(1, 0, 0);
  for (const zt of TRACKS.z) {
    for (const s of [-1, 1]) {
      const z = zt + s * HALF_G;
      for (const [w, h, y] of [[7, 4.4, -2.2], [1.8, 9.4, -9.1], [15, 1.6, -14.6]]) {
        const piece = new THREE.Mesh(new THREE.BoxGeometry(2 * FAR, h, w), steel);
        piece.position.set(0, y, z);
        pn.add(piece);
      }
      pn.add(strip(xs.map((x) => [x, 0.4, z]), alongX, headMat));
    }
  }
  // the bed's hook, once per frame before the glass: the fog and the lens for everything drawn here, and the TGV's
  // glass, brighter the further it is (its outline must read at 140 m, where its fine lines sink into the night)
  const eye = V();
  const noseW = V();
  const hullMats = [];
  const trainLines = [];
  bed.mesh.onBeforeRender = (renderer, scene, camera) => {
    FOG.value = scene.fog?.density ?? 0;
    eye.setFromMatrixPosition(camera.matrixWorld);
    if (A.trainNose) {
      A.trainNose.getWorldPosition(noseW);
      const g = 1 + 3.6 * smooth(2500, 20000, eye.distanceTo(noseW));
      for (const m of hullMats) m.uniforms.uGain.value = g;
      const f = eye.distanceTo(noseW) * FOG.value * 0.3;
      const k = Math.exp(-f * f);
      for (const m of trainLines) m.opacity = (m.userData.o035 ?? m.opacity) * k;
    }
  };

  let deckLines, catLines, a7;
  /* ── the deck: the road laid over both tracks — rubber panels, drawn by their joints (X-ray: never a slab) ── */
  {
    const seg = [];
    const [x0, x1] = DECK_X;
    const y = 0.6;
    const lon = (z) => seg.push(x0, y, z, x1, y, z);
    for (const zt of TRACKS.z) {
      // the inner panel between the rails (its flangeways along each rail), the outer panels either side
      const bands = [[zt - HALF_G + 7, zt + HALF_G - 7], [zt + HALF_G + 6, zt + HALF_G + 66], [zt - HALF_G - 66, zt - HALF_G - 6]];
      for (const [za, zb] of bands) {
        lon(za);
        lon(zb);
        for (let x = x0; x <= x1 + 1; x += 120) seg.push(x, y, za, x, y, zb);
      }
    }
    const deck = inkLines(seg, { width: 1.8, opacity: 0.34 });
    pn.add(deck);
    A.deck = anchor(pn, 0, 0, V2);
    deckLines = deck;
  }

  /* ── the catenary: masts on the far side every 63 m, their arms over both tracks, the contact wires (fine, fogged) ── */
  {
    const seg = [];
    const zMast = V2 - 360;
    for (let x = -FAR + 2400; x < FAR; x += 6300) {
      if (x > DECK_X[0] - 1600 && x < DECK_X[1] + 1600) continue; // none on the road
      seg.push(x, BED_Y, zMast, x, 760, zMast); //          the mast
      seg.push(x, 690, zMast, x, 690, V1 + 110); //         its arm over both tracks
      seg.push(x, 690, V2, x, 560, V2, x, 690, V1, x, 560, V1); // the droppers to each wire
    }
    for (const zt of TRACKS.z) seg.push(-FAR, 560, zt, FAR, 560, zt); // the contact wires (over the road too: 5.6 m)
    const cat = inkLines(seg, { width: 1.8, opacity: 0.26 });
    pn.add(cat);
    catLines = cat;
  }

  /* ── the four mounts (world.js hangs the signals on them) ── */
  const mounts = {};
  for (const [k, s] of Object.entries(SIGNALS)) {
    const m = new THREE.Group();
    m.position.set(...s.at);
    m.rotation.y = s.turn;
    pn.add(m);
    mounts[k] = m;
  }

  /* ── the A7 sign « passage à niveau avec barrières », 50 m before the crossing on our verge: a triangle, a gate ── */
  {
    const T = 90;
    const H = (T * Math.sqrt(3)) / 2;
    const y0 = 120;
    const tri = (i) => [-T / 2 + i * 1.732, y0 + i, 0, T / 2 - i * 1.732, y0 + i, 0, T / 2 - i * 1.732, y0 + i, 0, 0, y0 + H - 2 * i, 0, 0, y0 + H - 2 * i, 0, -T / 2 + i * 1.732, y0 + i, 0];
    const gate = [-20, y0 + 22, 0, 20, y0 + 22, 0, -20, y0 + 34, 0, 20, y0 + 34, 0]; // the barrier: two rails…
    for (let x = -18; x <= 18; x += 9) gate.push(x, y0 + 17, 0, x, y0 + 39, 0); //       …and its pales
    const sign = new THREE.Group();
    sign.add(inkLines([-3, 0, 0, -3, y0, 0, 3, 0, 0, 3, y0, 0, ...tri(0), ...tri(10)], { width: 2, opacity: 0.5 }));
    sign.add(inkLines(gate, { width: 1.9, opacity: 0.5 }));
    sign.position.set(ROAD.edge + 110, 0, BARRIER.z + 4400);
    pn.add(sign);
    A.a7 = anchor(sign, 0, y0 + H / 2, 0);
    a7 = sign;
  }

  /* ── the TGV of 021: its own line hidden, its group slid along voie 2 ── */
  const train = buildTrain();
  const trainLine = train.group.children[1];
  trainLine.visible = false;
  pn.add(train.group);
  train.group.children[0].traverse((m) => {
    const u = m.material?.uniforms;
    if (u?.uGain && u.uEdge && !hullMats.includes(m.material)) hullMats.push(m.material);
    if (m.material?.isLineMaterial && m.material.fog && !trainLines.includes(m.material)) {
      // its fine lines: out of the scene's fog (it would drown them at 140 m), into our gentler one (the bed's hook)
      m.material.fog = false;
      m.material.needsUpdate = true;
      trainLines.push(m.material);
    }
  });
  // its glass drawn BEFORE the car's shell (025: orders 19–20), so that the car of glass in front of it does not hide
  // it (asShell: a shell hides the glass drawn after it). Its halos, current and lines (orders under 8) are untouched.
  train.group.children[0].traverse((o) => {
    if (o.renderOrder >= 8) o.renderOrder -= 12;
  });
  // its headlamps: two white cores with a long tail, low on its face, never fogged — read at 800 m
  const beamMat = lampMat(WHITE, 2.1, { size: 300, minPx: 30 });
  const lamps = new THREE.Group();
  lamps.position.set(POWER.nose - 14, 92, 0); // just ahead of its face
  train.group.add(lamps);
  for (const s of [-1, 1]) lampAt(lamps, beamMat, 0, 0, s * 72);
  A.lamps = lamps;
  A.trainNose = anchor(train.group, POWER.nose, 150, 0);

  // the second train: only its headlamps, on voie 1, coming from −x
  const otherMat = lampMat(WHITE, 1.7, { size: 330, minPx: 60 });
  const other = new THREE.Group();
  for (const s of [-1, 1]) lampAt(other, otherMat, 0, 92, s * 72);
  pn.add(other);
  A.other = anchor(other, 0, 92, 0);

  /* ── the ruler of the 800 m, on voie 2's ballast: a signal line, a tick every 100 m, its head a small lamp ── */
  const rulerMat = stripMat({ color: SIGNAL, k: 1.25, half: 2.6, minPx: 2.6, fogK: 0.12, lit: 0, far: 2 * FAR });
  const rulerXs = [];
  for (let i = 0; i <= 160; i++) rulerXs.push(RULER.len * (i / 160) ** 1.6);
  const rulerLine = strip(rulerXs.map((x) => [x, BED_Y + 1.5, RULER_Z]), alongX, rulerMat, 5);
  const ticks = new THREE.Group();
  for (let k = 0; k <= RULER.len / RULER.tick; k++) {
    const x = k * RULER.tick;
    const reach = k === RULER.len / RULER.tick ? 90 : 45;
    ticks.add(strip([[x, BED_Y + 1.5, RULER_Z - reach], [x, BED_Y + 1.5, RULER_Z], [x, BED_Y + 1.5, RULER_Z + reach]], V(0, 0, 1), rulerMat, 5));
  }
  const rulerHeadMat = lampMat(SIGNAL, 1.7, { size: 60, minPx: 12 });
  const rulerHead = lampAt(pn, rulerHeadMat, 0, BED_Y + 6, RULER_Z);
  pn.add(rulerLine, ticks);
  A.rulerHead = rulerHead;
  A.ruler800 = anchor(pn, RULER.len, 0, RULER_Z);

  /* ── the queue ahead: 011's car (no wall, nobody), its stop lights; further on, only stop lights in the night ── */
  const file = new THREE.Group();
  const fileCar = buildCar();
  fileCar.group.position.set(0, 0, FILE.car);
  file.add(fileCar.group);
  const stopMat = lampMat(SIGNAL, 1.6, { size: 40, minPx: 7 });
  const stopFar = lampMat(SIGNAL, 1.1, { size: 40, minPx: 5 });
  for (const s of [-1, 1]) lampAt(file, stopMat, s * 68, 90, FILE.car + CAR.tail + 3);
  for (const z of FILE.lights) for (const s of [-1, 1]) lampAt(file, stopFar, s * 68, 90, z + CAR.tail);
  pn.add(file);
  A.fileCar = anchor(file, 0, 90, FILE.car + CAR.tail);

  /* ── the alert phone and the signboard, on our verge behind the entry barrier, facing the road (−x) ── */
  const phoneLit = solid(0x9aa2a8, { rough: 0.5, metal: 0.1 });
  const boardLit = solid(0xaab1b6, { rough: 0.45, metal: 0.05 });
  const phone = new THREE.Group();
  phone.position.set(PHONE.at[0], 0, PHONE.at[2]);
  pn.add(phone);
  {
    const H = PHONE.h;
    const add = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      phone.add(m);
      return m;
    };
    add(cyl(4.5, H - 40, 1), mid, 0, (H - 40) / 2, 0); //                the post
    add(box(24, 50, 34, 2), mid, 0, H - 18, 0); //                        the box
    add(box(30, 4, 40, 1.5), dark, -2, H + 9, 0); //                      its hood
    add(box(2, 40, 26, 1), phoneLit, -12.5, H - 18, 0); //               its front: lights veille when named
    add(box(5, 7, 22, 2), dark, -15, H - 10, 0); //                       the handset on its hook…
    add(box(4, 5, 5, 1.5), dark, -15, H - 10, -12); //                    …its ear
    add(box(4, 5, 5, 1.5), dark, -15, H - 10, 12); //                     …its mouth
    add(box(1.4, 26, 20, 0.5), boardLit, -6, H - 70, 0); //               the notice on the post
    for (let i = 0; i < 4; i++) add(box(1, 1.6, 14 - 3 * (i % 2), 0.2), dark, -6.9, H - 62 - 5 * i, 0);
  }
  const board = new THREE.Group();
  board.position.set(SIGNBOARD.at[0], 0, SIGNBOARD.at[2]);
  pn.add(board);
  {
    const W = SIGNBOARD.w;
    const add = (geo, mat, x, y, z) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      board.add(m);
      return m;
    };
    for (const s of [-1, 1]) add(cyl(3, SIGNBOARD.h, 1), mid, 2, SIGNBOARD.h / 2, s * (W / 2 - 6));
    add(box(3, 44, W, 1.2), boardLit, -2, SIGNBOARD.h, 0); //            the plate
    add(box(1, 7, W - 12, 0.4), dark, -3.8, SIGNBOARD.h + 13, 0); //     its first line (a word)
    for (let i = 0; i < 6; i++) add(box(1, 9, 5.2, 0.4), dark, -3.8, SIGNBOARD.h - 6, -17 + i * 6.8); // the number: bars, no digits
    add(box(1, 3, W - 24, 0.4), dark, -3.8, SIGNBOARD.h - 17, -6); //     a last line
  }
  A.phone = anchor(phone, -16, PHONE.h - 12, 0);
  A.board = anchor(board, -3, SIGNBOARD.h, 0);

  /* ── the people who get out: you and a passenger, of glass, round the car's tail to the verge ── */
  const PATHS = PEOPLE.from.map(([fx, , fz], i) => {
    const s = fx < 0 ? -1 : 1;
    // out of the door, back past the tail (the car stuck: its tail at z ≈ −65 in the crossing's frame), then to the verge
    const pts = [[fx + s * 25, fz], [s * 135, 40], [PEOPLE.to[i][0], PEOPLE.to[i][2]]];
    const lens = [0];
    for (let k = 1; k < pts.length; k++) lens.push(lens[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    return { pts, lens, total: lens.at(-1) };
  });
  const people = PATHS.map((_, i) => {
    const f = makeFigure({ shell: true, glassK: i ? 0.8 : 1, order: 16 + i });
    f.group.visible = false;
    pn.add(f.group);
    return { f, last: -1 };
  });
  A.you = anchor(people[0].f.head, 0, 0, 0);
  A.pax = anchor(people[1].f.head, 0, 0, 0);
  const vL = V();
  const vR = V();
  const hL = V();
  const hR = V();
  const walk = (f, phase, moving) => {
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    f.leg("L", vL.set(8.6, 8 + 7 * moving * Math.max(0, c), 21 * moving * s));
    f.leg("R", vR.set(-8.6, 8 + 7 * moving * Math.max(0, -c), -21 * moving * s));
    f.reach("L", hL.set(20.5, 92, 3 - 16 * moving * s));
    f.reach("R", hR.set(-20.5, 92, 3 + 16 * moving * s));
  };

  /* ── the car's extras (car's frame): the dashboard behind the wheel, lit veille while the car is alive ── */
  const dashMat = glow(BRAND.veille, 0);
  const dialMat = glow(BRAND.veille, 0);
  const dash = new THREE.Group();
  dash.position.set(...DASH.at);
  dash.rotation.x = -0.4;
  const strip0 = new THREE.Mesh(new THREE.PlaneGeometry(DASH.w, 1.4), dashMat);
  strip0.position.y = -DASH.h / 2;
  dash.add(strip0);
  for (const x of [-11, 11]) {
    const dial = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.1, 32), dialMat);
    dial.position.set(x, 0.5, 0.2);
    dial.rotation.y = Math.PI;
    dash.add(dial);
  }
  for (const m of dash.children) m.material.side = THREE.DoubleSide;
  group.add(dash);

  const carGroup = route.A.nose.parent;

  return {
    group, pn, mounts, route, train, A,
    update({ shell = 1, gap = -3, kmh = 0, rolled = 0, wet = 0.25, you = 1, car = 1, alive = 1, people: out = 0, train: tr = 3000, beam = 0, other: ot = 0, ruler: ru = 0, file: fi = 0, phone: ph = 0 } = {}, time = 0, px = 1600) {
      const sh = clamp01(shell);
      FOCAL.value = px;

      // 025's road and car (you leave the wheel as soon as the people get out), no rain falling
      route.update({ shell: sh, gap, lane: 0, yaw: 0, aim: 0, steer: 0, kmh, rolled, rain: wet, boar: 0, moose: 0, mooseAt: 0, you: out > 0.01 ? 0 : you, slide: 0, arrows: 0, alarm: 0, moment: 0, gas: clamp01(alive), tip: 0, rocket: 0, bFR: 0 }, time, px);
      if (rainMesh) rainMesh.visible = false;
      carGroup.visible = carGroup.visible && car > 0.5;
      pn.position.z = -100 * gap;

      // the crossing's X-ray
      bed.uniforms.uAmount.value = sh;
      bed.mesh.visible = sh > 0.003;
      headMat.uniforms.uAmount.value = sh;
      deckLines.material.opacity = deckLines.material.userData.base * sh;
      catLines.material.opacity = catLines.material.userData.base * sh;
      for (const l of a7.children) if (l.material) l.material.opacity = l.material.userData.base * sh;

      // the TGV
      const trainOn = tr < 1500 && tr > -(TRAIN.length / 100 + 60);
      train.group.visible = trainOn;
      if (trainOn) {
        train.update({ run: 0, kmh: TRAIN.kmh, shell: sh, cab: 1, pax: 1, you: 0, phone: 0, traction: 1, brake: 0, radio: 0, display: 0, mood: 1 }, time, px);
        trainLine.visible = false;
        for (const m of trainLines) m.userData.o035 = m.opacity;
        train.group.position.set(100 * tr - POWER.nose, 0, V2);
      }
      const b = trainOn ? clamp01(beam) : 0;
      beamMat.uniforms.uAmount.value = b;
      lamps.visible = b > 0.003;
      LIT_A.value.set(100 * tr, b * sh, V2, LIT_REACH);

      // the second train's lamps: they appear far and come closer
      const o = clamp01(ot);
      other.visible = o > 0.003;
      other.position.set(-lerp(OTHER.from, OTHER.to, o), 0, V1);
      otherMat.uniforms.uAmount.value = smooth(0, 0.25, o);
      LIT_B.value.set(other.position.x, smooth(0, 0.25, o) * 0.8 * sh, V1, LIT_REACH);

      // the ruler unrolls toward the train
      const r = clamp01(ru);
      const len = RULER.len * r;
      rulerLine.visible = ticks.visible = rulerHead.visible = r > 0.002;
      rulerMat.uniforms.uClip.value = len;
      rulerMat.uniforms.uAmount.value = smooth(0, 0.02, r);
      rulerHead.position.x = len;
      rulerHeadMat.uniforms.uAmount.value = smooth(0, 0.02, r) * (1 - 0.35 * smooth(0.97, 1, r));

      // the queue
      const q = clamp01(fi);
      file.visible = q > 0.003;
      if (file.visible) fileCar.update({ shell: sh * smooth(0, 0.3, q), wall: 0, you: 0, crush: 0, debris: 0, bags: 0, rescuer: 0, reach: 0, live: 0 }, time, px);
      stopMat.uniforms.uAmount.value = q;
      stopFar.uniforms.uAmount.value = q;

      // the phone and the signboard: their faces light veille when the voice names them
      const p = clamp01(ph);
      phoneLit.emissive.copy(VEILLE).multiplyScalar(0.42 * p);
      boardLit.emissive.copy(VEILLE).multiplyScalar(0.34 * p);

      // the people
      const any = out > 0.01;
      for (let i = 0; i < people.length; i++) {
        const { f } = people[i];
        f.group.visible = any;
        if (!any) continue;
        const u = clamp01(out * 1.3 - 0.3 * i);
        if (u === people[i].last) continue;
        people[i].last = u;
        const path = PATHS[i];
        const s = u * path.total;
        let k = 1;
        while (k < path.lens.length - 1 && path.lens[k] < s) k++;
        const [ax, az] = path.pts[k - 1];
        const [bx, bz] = path.pts[k];
        const w = clamp01((s - path.lens[k - 1]) / Math.max(1, path.lens[k] - path.lens[k - 1]));
        f.group.position.set(lerp(ax, bx, w), 0, lerp(az, bz, w));
        const moving = smooth(0, 0.04, u) * (1 - smooth(0.93, 1, u));
        // facing the way they walk; once there, turned toward the crossing (−z)
        const heading = Math.atan2(bx - ax, bz - az);
        f.group.rotation.y = lerp(heading, Math.PI, smooth(0.9, 1, u));
        walk(f, (s / 140) * Math.PI * 2, moving);
      }

      // the dashboard: lit while the car lives, flickering as it dies (driven by the value, not a clock)
      const al = clamp01(alive);
      const flick = al >= 0.999 ? 1 : al <= 0.001 ? 0 : al * (0.55 + 0.45 * Math.sign(Math.sin(al * 41)));
      setGlow(dashMat, 0.9 * flick * sh);
      setGlow(dialMat, 1.5 * flick * sh);
      dash.visible = car > 0.5 && sh > 0.003 && flick > 0.003;
    },
  };
}
