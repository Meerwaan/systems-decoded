// DOSSIER 019 — Prétensionneur : the cabin. 011's car (its glass body, wheels, seats, steering wheel, wall, road,
// shards, airbags) taken as it is, by import — and, added here, what this film is about:
//   · YOU at the wheel, of glass from head to hands, posed by this film's own numbers (`lunge`, `lean`, `coat`)
//   · THE STRAP, solid: from the guide ring at the top of your door pillar, over your left shoulder, across your
//     chest to the buckle, then the lap strap to its anchor. It is the brightest, plainest thing in the picture:
//     loose (`slack` 1: it stands off your chest and sags under the ring), it pulls itself tight (its weave runs
//     toward the ring), your body goes into it (`lunge`), it bears on you (`load`), it pays out again (`give`)
//   · the order: the airbag control unit on the tunnel, its wire to the pillar's foot, a head of veille light
//   · someone on the back seat who has not buckled up
// The retractor is NOT here: world.js stands model.js in the pillar's foot; its strap ends where ours begins.
//
//   buildCabine() → { group, A, update(p, time, px) }
//   group    the set, in the car's frame (the wall comes to the car)
//   A        anchors: head, chest, shoulder, ring, buckle, wheel, ecu, pillarFoot, nose, wallFace, rearHead
//   update   every frame, sixteen times: p is plain numbers (see world.js → FIRST and apply)
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { solid, glow, setGlow, glass, asShell, lineMat, fatLine, box, cyl, lathe, anchor, makePart, addMesh, setPartOpacity } from "@kit/build3d.js";
import { buildCar } from "../../011-fusible-pyro/src/car.js";
import { YOU, BELT, TRAVEL, SLACK, ECU, WIRE, RETRACTOR, REAR, REEL, LIMIT } from "./plan.js";
import * as MODEL from "./model.js";

const DEG = Math.PI / 180;
const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/* ───────────────────────── the strap: its cloth ─────────────────────────
   The webbing: pale, matt, lit like any solid — plus, in its shader, the weave that makes its travel READ. It is
   ONE webbing from the spool to the buckle: the weave is model.js's (its WEAVE, its weaveMark — chevrons every
   `period` cm, melting into their mean under the pixel), counted here in centimetres of strap from the ring and
   run by the same length (REEL.take reeled in, REEL.out paid out). Added here: a signal glow where it bears on you
   (`uBear`: from, to — cm of strap — and how much), a veille glow while it reels in, and a floor of light (`fill`). */
const WEAVE = MODEL.WEAVE ?? { color: 0xbdb9ad, period: 2.2, chevron: 1.1, duty: 0.42, dark: 0.5, selvedge: 0.72 };
export const WEB = { thick: 0.34, fill: [0.55, 0.45] };
function webbing() {
  const mat = solid(WEAVE.color, { rough: 0.86, double: true });
  const uniforms = { uRun: { value: 0 }, uBear: { value: new THREE.Vector4(0, 1, 0, 0) }, uSignal: { value: SIGNAL.clone() }, uVeille: { value: VEILLE.clone() } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute vec2 aSt;\nvarying vec2 vSt;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSt = aSt;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec2 vSt; uniform float uRun; uniform vec4 uBear; uniform vec3 uSignal; uniform vec3 uVeille;
        // model.js's chevron weave: s cm along the strap, side 0 on its middle → 1 on its edge, w the width of a pixel in periods
        float weaveMark(float s, float side, float w) {
          float c = (s + side * ${WEAVE.chevron.toFixed(2)}) / ${WEAVE.period.toFixed(2)};
          float f = fract(c);
          float e = w * 1.2 + 0.02;
          float band = smoothstep(0.0, e, f) * (1.0 - smoothstep(${WEAVE.duty.toFixed(2)}, ${WEAVE.duty.toFixed(2)} + e, f));
          return mix(${WEAVE.duty.toFixed(2)}, band, 1.0 - smoothstep(0.22, 0.55, w));
        }`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        float webSide = abs(vSt.x - 0.5) * 2.0;
        float webMark = weaveMark(vSt.y + uRun, webSide, fwidth(vSt.y) / ${WEAVE.period.toFixed(2)});
        diffuseColor.rgb *= mix(1.0, ${WEAVE.dark.toFixed(2)}, webMark) * mix(1.0, ${WEAVE.selvedge.toFixed(2)}, smoothstep(0.8, 0.87, webSide));`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        float webBear = smoothstep(uBear.x - 8.0, uBear.x + 3.0, vSt.y) * (1.0 - smoothstep(uBear.y - 4.0, uBear.y + 8.0, vSt.y));
        totalEmissiveRadiance += uSignal * (uBear.z * webBear) + uVeille * (uBear.w * (0.25 + 0.75 * (1.0 - webMark)));`,
      )
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        // the key light comes from behind you: your chest is its dark side. The strap is the subject — it is never
        // darker than a soft light from the camera would make it (brightest where it faces the eye: its twist still reads)
        float webFill = ${WEB.fill[0].toFixed(2)} + ${WEB.fill[1].toFixed(2)} * abs(dot(normal, normalize(vViewPosition)));
        outgoingLight = max(outgoingLight, diffuseColor.rgb * webFill + totalEmissiveRadiance);
        #include <opaque_fragment>`,
      );
  };
  mat.customProgramCacheKey = () => "webbing019c";
  mat.userData.u = uniforms;
  return mat;
}

/**
 * A strap `width` wide and `thick` thick through moving points: `lay(points, normals, from)` — Vector3s; it lies flat
 * against each normal. A flat tube (two faces, two edges), so that seen edge-on it is still there. `aSt`: across
 * (0–1) and along, in centimetres of strap from its first point — the weave never stretches. `lens[i]`: the length
 * at station i; `at(k)`: at control point k.
 */
function makeRibbon(count, width, thick, material) {
  const n = count + 1;
  const pos = new Float32Array(n * 24);
  const nor = new Float32Array(n * 24);
  const st = new Float32Array(n * 16);
  const lens = new Float32Array(n);
  const index = [];
  for (let i = 0; i < count; i++) {
    for (let f = 0; f < 4; f++) {
      const a = i * 8 + f * 2;
      index.push(a, a + 1, a + 8, a + 1, a + 9, a + 8);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("aSt", new THREE.BufferAttribute(st, 2));
  geo.setIndex(index);
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.castShadow = false; // nothing laid on glass throws a shadow: it would fall through the body, onto the floor
  mesh.receiveShadow = false;
  const p = V();
  const q = V();
  const t = V();
  const w = V();
  const nn = V();
  const prev = V();
  const hw = width / 2;
  const h = thick / 2;
  let spans = 1;
  // a Catmull-Rom arc between b and c
  const cr = (a, b, c, d, u, u2, u3) => 0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (3 * b - a - 3 * c + d) * u3);
  const arc = (a, b, c, d, u, out) => {
    const u2 = u * u;
    const u3 = u2 * u;
    return out.set(cr(a.x, b.x, c.x, d.x, u, u2, u3), cr(a.y, b.y, c.y, d.y, u, u2, u3), cr(a.z, b.z, c.z, d.z, u, u2, u3));
  };
  // one vertex: at p + sw·w·hw + sn·n·h, its normal (nx, ny, nz), across `across`
  const put = (v, sw, sn, nx, ny, nz, across, along) => {
    const o = v * 3;
    pos[o] = p.x + sw * w.x * hw + sn * nn.x * h;
    pos[o + 1] = p.y + sw * w.y * hw + sn * nn.y * h;
    pos[o + 2] = p.z + sw * w.z * hw + sn * nn.z * h;
    nor[o] = nx; nor[o + 1] = ny; nor[o + 2] = nz;
    st[v * 2] = across; st[v * 2 + 1] = along;
  };
  return {
    mesh, lens,
    at: (k) => lens[Math.round((k / spans) * count)],
    lay(pts, normals, from = 0) {
      const m = pts.length - 1;
      spans = m;
      let len = from;
      for (let i = 0; i < n; i++) {
        const s = Math.min(m - 1e-4, (i / count) * m);
        const k = Math.floor(s);
        const u = s - k;
        const a = pts[Math.max(0, k - 1)];
        const d = pts[Math.min(m, k + 2)];
        arc(a, pts[k], pts[k + 1], d, u, p);
        arc(a, pts[k], pts[k + 1], d, u + 0.02, q);
        t.subVectors(q, p).normalize();
        nn.copy(normals[k]).lerp(normals[k + 1], u);
        w.crossVectors(t, nn).normalize();
        nn.crossVectors(w, t).normalize();
        if (i) len += p.distanceTo(prev);
        prev.copy(p);
        lens[i] = len;
        const v = i * 8;
        put(v, -1, 1, nn.x, nn.y, nn.z, 0, len); // the face
        put(v + 1, 1, 1, nn.x, nn.y, nn.z, 1, len);
        put(v + 2, 1, -1, -nn.x, -nn.y, -nn.z, 1, len); // its back
        put(v + 3, -1, -1, -nn.x, -nn.y, -nn.z, 0, len);
        put(v + 4, 1, 1, w.x, w.y, w.z, 1, len); // the two edges
        put(v + 5, 1, -1, w.x, w.y, w.z, 1, len);
        put(v + 6, -1, -1, -w.x, -w.y, -w.z, 0, len);
        put(v + 7, -1, 1, -w.x, -w.y, -w.z, 0, len);
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.normal.needsUpdate = true;
      geo.attributes.aSt.needsUpdate = true;
      return len;
    },
  };
}

/** A few lights that have a place: a bright heart and a long tail (011's). `put(i, x, y, z, colour, k, across)`, then `flush()`. */
function makeSprites(count) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  const uniforms = { uScale: { value: 1600 } };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uScale; attribute vec3 aColor; attribute float aSize; varying vec3 vColor;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vColor = aColor;
          gl_Position = aSize > 0.0 ? projectionMatrix * mv : vec4(2.0, 2.0, 2.0, 1.0);
          gl_PointSize = clamp(aSize * uScale / max(1.0, -mv.z), 8.0, 300.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        void main() {
          float n = clamp(1.0 - length(gl_PointCoord - 0.5) * 2.0, 0.0, 1.0);
          gl_FragColor = vec4(vColor * (0.78 * pow(n, 6.0) + 0.22 * n * n), 1.0);
        }`,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 7;
  return {
    points, uniforms,
    put(i, x, y, z, colour, k, across) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = colour.r * k; col[i * 3 + 1] = colour.g * k; col[i * 3 + 2] = colour.b * k;
      size[i] = k > 0.004 ? across : 0;
    },
    flush() {
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aColor.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    },
  };
}

/* ───────────────────────── the figure's trunk, as figure.js turns it (to lay things ON it) ───────────────────────── */
const TRUNK = [[11, 86], [12.2, 96], [11.2, 110], [14.2, 127], [17.4, 141], [16.6, 147], [7, 151.5]];
const TRUNK_DEEP = 0.62;
const HIP = 90;
/** Its radius at height y (the figure's own centimetres, standing). */
function trunkR(y) {
  if (y <= TRUNK[0][1]) return TRUNK[0][0];
  for (let i = 1; i < TRUNK.length; i++) if (y <= TRUNK[i][1]) return mix(TRUNK[i - 1][0], TRUNK[i][0], (y - TRUNK[i - 1][1]) / (TRUNK[i][1] - TRUNK[i - 1][1]));
  return TRUNK.at(-1)[0];
}
/** A point of its front, in the trunk's own frame (the hips are its origin): at x across, y above the hips. */
const onFront = (x, y) => V(x, y, TRUNK_DEEP * Math.sqrt(Math.max(0, trunkR(y + HIP) ** 2 - x * x)));

/** A padded tube `len` long around a limb `r` thick: `bands` rolls of down. Along y, centred. */
function sleeve(r, len, bands, puff = 1.9, quilt = 0.9, to = 1) {
  const pts = [[0.1, -len / 2 - 2.2]];
  const N = bands * 8;
  for (let i = 0; i <= N; i++) pts.push([r + puff + quilt * Math.abs(Math.sin((Math.PI * bands * i) / N)), -len / 2 + (len * to * i) / N]);
  pts.push([0.1, -len / 2 + len * to + 1.6]);
  return lathe(pts, 28);
}

export function buildCabine() {
  const car = buildCar();
  const { group } = car;
  const road = car.A.wallFace.parent; // 011's `slide`: the road and the wall, which come to the car — its z is ours to push back by `gap`
  car.fx.belt.visible = false; // 011's own belt is glass-grey and tied to its own you: ours replaces it
  // the airbags are never the subject: a pale cloth the head shows through
  Object.assign(car.fx.cloth, { transparent: true, opacity: 0.35, depthWrite: false });
  car.fx.cloth.userData.base = 0.35;

  const mine = new THREE.Group(); // everything this film adds, in the car's frame
  group.add(mine);

  /* ═════════════ 1 · YOU, AT THE WHEEL ═════════════ */

  const you = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.8, through: 0.2 });
  you.ghost(true); // of glass from head to hands: the strap is the only solid thing on you
  you.group.rotation.y = Math.PI; // you look toward the nose (−z): your left is the door (−x)
  mine.add(you.group);
  const SEAT = V(...YOU.hips);
  const REST = 24; // degrees: how far the seat back leans
  const CHEST_H = 44; // the middle of your chest, above your hips: `lunge` is counted there
  const LEAN = 9; // cm your chest comes forward at `lean` 1
  const TILT = 22 * DEG; // 011's steering wheel leans back
  const AXIS = V(0, Math.sin(TILT), Math.cos(TILT));
  const HUB = V(...YOU.wheel);
  const RIM = { r: 18.5, e1: V(1, 0, 0), e2: V().crossVectors(AXIS, V(1, 0, 0)) };
  const RIM_AXIS = V(-RIM.e2.x, RIM.e2.y, -RIM.e2.z); // in your own frame (x and z turned round)
  const OVER_RIM = V(AXIS.x, -AXIS.y, AXIS.z);
  const PALMS = { L: V(-1, 0, 0), R: V(1, 0, 0) };
  const KNEE = V(0, 1, 0.3);
  const TOE = V(0, 0.55, 0.85);
  const v1 = V();
  const v2 = V();
  const v3 = V();
  let gx = 0;
  let gy = 0;
  let gz = 0;
  const toMine = (x, y, z, out) => out.set(-(x - gx), y - gy, -(z - gz));
  /** A point of your trunk (its own frame), in the car. */
  const onTrunk = (p, out) => {
    out.copy(p).applyMatrix4(you.torso.matrix);
    return out.set(gx - out.x, gy + out.y, gz - out.z);
  };
  /** A direction of your trunk, in the car. */
  const dirTrunk = (d, out) => {
    out.copy(d).transformDirection(you.torso.matrix);
    return out.set(-out.x, out.y, -out.z);
  };

  /* ── your winter coat: a padded shell of glass over your trunk and your arms, UNDER the strap ── */
  const COAT = { from: 89, to: 147, bands: 8, puff: 2.5, quilt: 1.1, deep: 0.69 };
  const coatGlass = glass(BRAND.ink, { base: 0.008, rim: 0.5, power: 2.1, edge: 0.5, spec: 0.55, through: 0.12 });
  coatGlass.uniforms.uAmount.value = 0;
  const coatPanes = [];
  {
    const pts = [[0.1, COAT.from - 2.5], [trunkR(COAT.from) + COAT.puff * 0.7, COAT.from - 2.2]];
    const N = COAT.bands * 8;
    for (let i = 0; i <= N; i++) {
      const y = mix(COAT.from, COAT.to, i / N);
      pts.push([trunkR(y) + COAT.puff + COAT.quilt * Math.abs(Math.sin((Math.PI * COAT.bands * i) / N)), y]);
    }
    pts.push([14.6, 150.2], [10.6, 152.6], [10.4, 155.2], [9.6, 157.6], [7.6, 158.2], [0.1, 158.2]); // the shoulders close on a collar
    const body = new THREE.Mesh(lathe(pts, 56), coatGlass);
    body.scale.z = COAT.deep;
    body.position.y = -HIP;
    you.torso.add(body);
    coatPanes.push(body);
  }
  // its seams: one fine ring in each valley between two rolls of down
  const seamMat = lineMat(BRAND.ink, 1.8, { opacity: 0.34 });
  {
    const seg = [];
    for (let k = 0; k <= COAT.bands; k++) {
      const y = mix(COAT.from, COAT.to, k / COAT.bands);
      const r = trunkR(y) + COAT.puff + 0.1;
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const b = ((i + 1) / 48) * Math.PI * 2;
        seg.push(r * Math.cos(a), y - HIP, r * COAT.deep * Math.sin(a), r * Math.cos(b), y - HIP, r * COAT.deep * Math.sin(b));
      }
    }
    const seams = new LineSegments2(new LineSegmentsGeometry().setPositions(seg), seamMat);
    seams.renderOrder = 3;
    seams.frustumCulled = false;
    you.torso.add(seams);
  }
  seamMat.opacity = 0;
  const sleeves = {};
  for (const s of ["L", "R"]) {
    const upper = new THREE.Mesh(sleeve(4.7, 30, 4), coatGlass);
    const fore = new THREE.Mesh(sleeve(3.5, 27, 3, 1.7, 0.8, 0.84), coatGlass); // it stops at a cuff: the hand is bare
    const cap = new THREE.Mesh(new THREE.SphereGeometry(8.4, 24, 16), coatGlass);
    you.group.add(upper, fore, cap);
    coatPanes.push(upper, fore, cap);
    sleeves[s] = { upper, fore, cap };
  }
  asShell(coatPanes, 12);
  const laySleeve = (mesh, a, b) => {
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, v3.subVectors(b, a).normalize());
  };

  /* ═════════════ 2 · THE STRAP ═════════════ */

  // where it begins: where model.js's strap ends, in the pillar (RETRACTOR.top, seen from the car) — no step between the two
  const TURN = RETRACTOR.turn * DEG;
  const RING = V(
    RETRACTOR.home[0] + RETRACTOR.top[0] * Math.cos(TURN) + RETRACTOR.top[2] * Math.sin(TURN),
    RETRACTOR.home[1] + RETRACTOR.top[1],
    RETRACTOR.home[2] - RETRACTOR.top[0] * Math.sin(TURN) + RETRACTOR.top[2] * Math.cos(TURN),
  );
  const BUCKLE = V(...BELT.buckle);
  const ANCHOR = V(...BELT.anchor);
  const strapMat = webbing();
  const lapMat = webbing();
  const strap = makeRibbon(60, BELT.width, WEB.thick, strapMat);
  const lap = makeRibbon(28, BELT.width, WEB.thick, lapMat);
  // what it shows when it is loose: where it OUGHT to lie on you, a faint band of signal light on your chest
  const markMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uLen: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute vec2 aSt; varying vec2 vSt;
      void main() { vSt = aSt; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount, uLen; varying vec2 vSt;
      void main() {
        if (uAmount < 0.003) discard;
        float across = smoothstep(0.0, 0.8, 1.0 - abs(vSt.x * 2.0 - 1.0));
        float along = smoothstep(0.0, 7.0, vSt.y) * (1.0 - smoothstep(uLen - 8.0, uLen, vSt.y));
        gl_FragColor = vec4(uColor * (uAmount * across * along), 1.0);
      }`,
  });
  const MARK = 0.13; // (0: no band)
  const mark = makeRibbon(30, BELT.width * 0.9, 0.04, markMat);
  mark.mesh.renderOrder = 6;
  const belt = new THREE.Group();
  belt.add(strap.mesh, lap.mesh, mark.mesh);
  mine.add(belt);

  // the points of your trunk it runs over (the trunk's own frame: +x your left, +z your front) and the way it faces there
  const ON = [
    { p: V(12.3, 58.8, 2.0), n: V(0.1, 0.9, 0.42).normalize(), loose: 0.35, lean: 5.5 }, // the top of your left shoulder
    { p: onFront(8.5, 48), n: V(0.14, 0.42, 0.9).normalize(), loose: 0.95, lean: 3.4 },
    { p: onFront(1, 32), n: V(0, 0.1, 1).normalize(), loose: 1, lean: 1.2 }, // your sternum
    { p: onFront(-8.5, 16), n: V(-0.28, 0, 0.96).normalize(), loose: 0.85, lean: 0.3 },
  ];
  const ON_LAP = [
    { p: V(-12.5, 7.6, 8), n: V(-0.2, 0.75, 0.62).normalize() },
    { p: V(0, 5.5, 8.9), n: V(0, 0.7, 0.7).normalize() },
    { p: V(12.5, 7.6, 8), n: V(0.2, 0.75, 0.62).normalize() },
  ];
  const SAG = 10; // cm the loose strap hangs under the straight line from the ring to your shoulder
  const strapPts = Array.from({ length: 7 }, () => V());
  const strapNor = Array.from({ length: 7 }, () => V());
  const lapPts = Array.from({ length: 5 }, () => V());
  const lapNor = Array.from({ length: 5 }, () => V());
  const markPts = Array.from({ length: 4 }, () => V());
  const markNor = Array.from({ length: 4 }, () => V());
  const AT_RING = V(-0.31, 0.79, -0.54).normalize(); // over the ring's bar, rolled toward the door: from ahead of it the strap shows its face, not its edge

  /* ── the ring, the buckle, the anchor: solid, small, plain ── */
  const hard = makePart("belt-hardware");
  const steel = solid(0x8f9499, { rough: 0.5, metal: 0.35 });
  const dark = solid(0x3d4349, { rough: 0.7 });
  const q4 = new THREE.Quaternion();
  /** A piece built around the origin, turned by `quat`, moved to `at`. */
  const set = (geometry, quat, at) => geometry.applyQuaternion(quat).translate(at.x, at.y, at.z);
  {
    // the guide ring: a slotted loop hung from a bolt on the pillar; the strap turns over its lower bar, which lies across the way it leaves
    const leave = V(SEAT.x - 12 - RING.x, 0, SEAT.z + 24 - RING.z).normalize(); // toward your shoulder, on the flat
    q4.setFromAxisAngle(UP, Math.atan2(leave.x, leave.z)); // its face (local +z) looks the way the strap leaves
    const loop = new THREE.TorusGeometry(2.0, 0.5, 12, 40).scale(1.9, 1, 1).translate(0, 1.4, 0);
    addMesh(hard, set(loop, q4, RING), steel, { edges: false });
    addMesh(hard, set(box(4.6, 5.4, 0.6, 0.25).translate(0, 5.9, -0.3), q4, RING), steel, { edgeOpacity: 0.5, edgeWidth: 1.8 });
    addMesh(hard, set(cyl(1.3, 0.9, 0.2, 24).rotateX(Math.PI / 2).translate(0, 6.9, 0.3), q4, RING), dark, { edgeOpacity: 0.5, edgeWidth: 1.8 });
  }
  {
    // the buckle on its stalk, by your right hip; the tongue the strap is sewn through
    q4.setFromUnitVectors(UP, V(-0.3, 1, -0.22).normalize());
    addMesh(hard, set(box(5.6, 6.6, 2.6, 0.6).translate(0, -4.2, 0), q4, BUCKLE), dark, { edgeOpacity: 0.6, edgeWidth: 1.8 });
    addMesh(hard, set(box(4.8, 3.2, 0.5, 0.2).translate(0, 0.4, 0), q4, BUCKLE), steel, { edgeOpacity: 0.5, edgeWidth: 1.8 });
    addMesh(hard, set(box(2.8, 11, 0.8, 0.3).translate(0, -12.6, 0), q4, BUCKLE), dark, { edges: false });
  }
  {
    // the lap strap's anchor, bolted at the foot of the pillar
    q4.setFromUnitVectors(UP, V(0.75, 0.25, -0.1).normalize());
    addMesh(hard, set(box(3.6, 0.6, 5, 0.2), q4, ANCHOR), steel, { edgeOpacity: 0.5, edgeWidth: 1.8 });
    addMesh(hard, set(cyl(1.2, 0.9, 0.2, 20).translate(0, 0.5, 0), q4, ANCHOR), dark, { edges: false });
  }

  /* ═════════════ 3 · THE ORDER ═════════════ */

  // the airbag control unit, on the tunnel; its lamp; its wire to the pillar's foot
  addMesh(hard, box(13, 4.2, 9.5, 0.6), dark, { pos: [ECU[0], ECU[1], ECU[2]], edgeOpacity: 0.7, edgeWidth: 1.8 });
  addMesh(hard, box(4.2, 2.6, 3, 0.4), steel, { pos: [ECU[0] - 6.6, ECU[1] - 0.6, ECU[2] + 2], edgeOpacity: 0.5, edgeWidth: 1.8 });
  const lamp = glow(BRAND.veille, 0);
  addMesh(hard, new THREE.PlaneGeometry(8.4, 3.4).rotateX(-Math.PI / 2), lamp, { pos: [ECU[0] + 1, ECU[1] + 2.16, ECU[2]], edges: false });
  // (the wire, cut into short lengths: the lit part grows behind the head of light)
  const WAY = [];
  {
    const STEPS = 56;
    const lens = [0];
    for (let i = 1; i < WIRE.length; i++) lens.push(lens[i - 1] + Math.hypot(WIRE[i][0] - WIRE[i - 1][0], WIRE[i][1] - WIRE[i - 1][1], WIRE[i][2] - WIRE[i - 1][2]));
    for (let i = 0; i <= STEPS; i++) {
      const d = (i / STEPS) * lens.at(-1);
      let j = 1;
      while (j < WIRE.length - 1 && lens[j] < d) j++;
      const u = (d - lens[j - 1]) / (lens[j] - lens[j - 1]);
      WAY.push([mix(WIRE[j - 1][0], WIRE[j][0], u), mix(WIRE[j - 1][1], WIRE[j][1], u), mix(WIRE[j - 1][2], WIRE[j][2], u)]);
    }
  }
  const wire = fatLine(WAY, { width: 2.2, opacity: 0.42 });
  const wireLit = fatLine(WAY, { color: BRAND.veille, width: 3.2, hdr: 1.5, additive: true });
  wireLit.renderOrder = 4;
  wireLit.frustumCulled = false;
  hard.userData.part.mats.add(wire.material);
  hard.userData.part.mats.add(wireLit.material);
  hard.add(wire, wireLit);
  mine.add(hard);

  /* ═════════════ 4 · THE ONE ON THE BACK SEAT ═════════════ */

  const back = new THREE.Group();
  back.visible = false;
  mine.add(back);
  const him = makeFigure({ shell: true, hands: "flat", order: 11, glassK: 1.5, through: 0.2 });
  him.ghost(true);
  him.group.rotation.y = Math.PI;
  him.group.position.set(REAR.hips[0], REAR.hips[1] - him.HIP, REAR.hips[2]);
  him.leg("L", V(9.5, 79, 72), KNEE, TOE); // his feet under your seat
  him.leg("R", V(-9.5, 79, 69), KNEE, TOE);
  him.reach("L", V(12, 99, 33), null, { dir: V(0, -0.15, 1).normalize(), palm: V(0, -1, 0) }); // his hands on his knees
  him.reach("R", V(-12, 99, 31), null, { dir: V(0, -0.15, 1).normalize(), palm: V(0, -1, 0) });
  him.lean(-20, 0, 0);
  back.add(him.group);
  // his belt: hanging from its ring along the pillar, its tongue at the end — never pulled across him
  {
    const hangMat = webbing();
    const hang = makeRibbon(16, BELT.width, WEB.thick, hangMat);
    const R = V(...REAR.ring);
    const pts = [R.clone(), V(R.x - 0.4, R.y - 16, R.z - 0.6), V(R.x - 0.2, R.y - 33, R.z - 1.4), V(R.x + 0.6, R.y - 48, R.z - 1.8)];
    const nors = pts.map(() => V(1, 0.05, -0.25).normalize());
    hang.lay(pts, nors);
    const fit = makePart("rear-belt");
    q4.setFromUnitVectors(V(0, 0, 1), nors[0]);
    addMesh(fit, set(new THREE.TorusGeometry(2.0, 0.5, 12, 40).scale(1.9, 1, 1).translate(0, 1.4, 0), q4, R), steel, { edges: false });
    addMesh(fit, set(box(4.6, 5.4, 0.6, 0.25).translate(0, 5.9, -0.3), q4, R), steel, { edgeOpacity: 0.5, edgeWidth: 1.8 });
    addMesh(fit, set(box(4.8, 5.6, 0.5, 0.2).translate(0, -2.2, 0), q4, pts[3]), steel, { edgeOpacity: 0.5, edgeWidth: 1.8 }); // the tongue
    back.add(hang.mesh, fit);
  }

  /* ═════════════ 5 · LIGHTS THAT HAVE A PLACE ═════════════ */

  const sprites = makeSprites(4); // 0: the head of the order on its wire · 1: the control unit · 2: the strap on your sternum · 3: on your shoulder
  mine.add(sprites.points);
  const HEAD = VEILLE.clone().multiplyScalar(2.2);
  const UNIT = VEILLE.clone().multiplyScalar(1.3);
  const BEAR = SIGNAL.clone().multiplyScalar(1.5);

  const A = {
    head: anchor(you.head, 0, 0, 0),
    chest: anchor(mine, ...YOU.chest),
    shoulder: anchor(mine, YOU.x - 15, 100, 7),
    ring: anchor(mine, RING.x, RING.y, RING.z),
    buckle: anchor(mine, ...BELT.buckle),
    wheel: anchor(mine, ...YOU.wheel),
    ecu: anchor(mine, ...ECU),
    pillarFoot: anchor(mine, ...RETRACTOR.home),
    nose: car.A.nose,
    wallFace: car.A.wallFace,
    rearHead: anchor(him.head, 0, 0, 0),
  };

  /**
   * You and your strap. `l` lunge · `ln` lean · `s` slack · `g` give · `c` coat · `f` load (0–1).
   * Your chest goes forward by `adv` cm; a loose strap stays where it hangs until your chest has come to it.
   */
  function pose(l, ln, s, g, c, f) {
    const e = l * l * (3 - 2 * l);
    const adv = e * (TRAVEL.taut + s * TRAVEL.slack + g * TRAVEL.give);
    gx = SEAT.x;
    gy = SEAT.y - you.HIP;
    gz = SEAT.z - 0.4 * adv; // your hips slide under the lap strap…
    you.group.position.set(gx, gy, gz);
    you.leg("L", toMine(-48, 40, -90, v1), KNEE, TOE);
    you.leg("R", toMine(-29, 41, -95, v1), KNEE, TOE);
    // (capped where all the slack and all the give leave it WITHOUT `lean`: whatever the numbers, your head stops short of the rim)
    const pitch = Math.asin(Math.min(-0.08, -Math.sin(REST * DEG) + (0.6 * adv + LEAN * ln) / CHEST_H)) / DEG;
    you.lean(pitch, 0, 0); // …your trunk tips forward from them…
    const hk = clamp01(adv / 22);
    you.head.position.set(0, 76.5 - 1.3 * hk, 1 + 5 * hk); // …and your head goes on
    for (let i = 0; i < 2; i++) {
      const side = i ? "R" : "L";
      const sx = i ? 1 : -1; // in the car, your left hand is on the −x side
      v1.copy(HUB).addScaledVector(RIM.e1, sx * RIM.r * 0.985).addScaledVector(RIM.e2, RIM.r * 0.17); // a quarter past nine: your hands stay there
      you.hold(side, toMine(v1.x, v1.y, v1.z, v2), RIM_AXIS, { palm: PALMS[side], dir: OVER_RIM, k: 0.92, bar: 1.6 });
      const arm = you.arms[side];
      laySleeve(sleeves[side].upper, arm.sh, arm.elbow);
      laySleeve(sleeves[side].fore, arm.elbow, arm.at);
      sleeves[side].cap.position.copy(arm.sh);
    }

    // the strap. What stands it off you: the coat under it (the load digs into it), and its slack — until your chest has taken it up
    const free = clamp01(1 - adv / SLACK.off);
    const pad = 0.5 + c * (COAT.puff + COAT.quilt * 0.6) * (1 - 0.55 * f);
    strapPts[0].copy(RING);
    strapNor[0].copy(AT_RING);
    for (let i = 0; i < 4; i++) {
      const o = ON[i];
      const off = pad * (i ? 1 : 0.8) + free * (s * SLACK.off * o.loose + ln * o.lean);
      onTrunk(v1.copy(o.p).addScaledVector(o.n, off), strapPts[i + 2]);
      dirTrunk(o.n, strapNor[i + 2]);
      onTrunk(v1.copy(o.p).addScaledVector(o.n, 0.25 + c * (COAT.puff + 0.4)), markPts[i]);
      markNor[i].copy(strapNor[i + 2]);
    }
    // between the ring and your shoulder: straight when taut, a belly when loose
    strapPts[1].copy(RING).lerp(strapPts[2], 0.52);
    strapPts[1].y -= SAG * s * free;
    strapNor[1].copy(AT_RING).lerp(strapNor[2], 0.5).normalize();
    strapPts[6].copy(BUCKLE);
    strapNor[6].copy(strapNor[5]);
    strap.lay(strapPts, strapNor);
    markMat.uniforms.uLen.value = mark.lay(markPts, markNor);

    lapPts[0].copy(BUCKLE);
    for (let i = 0; i < 3; i++) {
      const o = ON_LAP[i];
      onTrunk(v1.copy(o.p).addScaledVector(o.n, 0.5 + c * 2.2), lapPts[i + 1]);
      dirTrunk(o.n, lapNor[i + 1]);
    }
    lapPts[4].copy(ANCHOR);
    lapNor[0].copy(lapNor[1]);
    lapNor[4].copy(lapNor[3]);
    lap.lay(lapPts, lapNor);

    onTrunk(ON[2].p, A.chest.position);
    onTrunk(ON[0].p, A.shoulder.position);
    return free;
  }

  const last = { l: -1, ln: -1, s: -1, g: -1, c: -1, f: -1, free: 1 };
  pose(0, 0, 1, 0, 0, 0);

  return {
    group, A, car,
    /**
     * shell   the X-ray of the car (0–1)                wall    the wall and the road (0–1)
     * gap     metres between your bumper and the wall    crush   the nose folding (it does not move you)
     * debris  what the crash throws (0–1)               bags    011's airbags, pale (0–1)
     * you     0 nobody · 1 you and your strap           coat    your winter coat, drawn (0–1)
     * lean    0 back against the seat · 1 a little forward: the strap leaves your shoulder
     * lunge   your body thrown forward (0–1): your chest travels TRAVEL.taut + slack·TRAVEL.slack + give·TRAVEL.give
     * slack   1 the strap loose (off your chest, a belly under the ring) → 0 taut; in between its weave runs to the ring
     * give    the strap paid out again by the bar (0–1): the weave runs the other way
     * load    the strap's force on you (0 … LIMIT): a signal glow where it bears
     * order   0 → 0.15 the control unit lit → 1 the head of light at the pillar's foot
     * rear    0 nobody · 1 the one on the back seat, his belt hanging
     */
    update({ shell = 1, wall = 1, gap = 0, crush = 0, debris = 0, you: showYou = 1, coat = 0, lean = 0, lunge = 0, slack = 1, give = 0, load = 0, bags = 0, order = 0, rear = 0 } = {}, time = 0, px = 1600) {
      car.update({ shell, wall, you: 0, crush, debris, bags }, time, px);
      road.position.z -= gap * 100;
      const sh = clamp01(shell);
      const here = showYou > 0.5;
      const s = clamp01(slack);
      const g = clamp01(give);
      const c = clamp01(coat);
      const f = clamp01(load / LIMIT);
      const l = clamp01(lunge);
      const ln = clamp01(lean);

      you.group.visible = here;
      belt.visible = here;
      if (here && (l !== last.l || ln !== last.ln || s !== last.s || g !== last.g || c !== last.c || f !== last.f)) {
        last.free = pose(l, ln, s, g, c, f);
        last.l = l; last.ln = ln; last.s = s; last.g = g; last.c = c; last.f = f;
      }
      coatGlass.uniforms.uAmount.value = here ? c : 0;
      seamMat.opacity = here ? 0.34 * c : 0;
      seamMat.visible = here && c > 0.01;

      // the weave: reeled in by the charge (toward the ring), paid out again by the bar
      strapMat.userData.u.uRun.value = REEL.take * (1 - s) - REEL.out * g;
      lapMat.userData.u.uRun.value = 0.25 * (REEL.take * (1 - s) - REEL.out * g);
      strapMat.userData.u.uBear.value.set(strap.at(2), strap.at(4) + 4, 1.15 * f, 0.55 * 4 * s * (1 - s));
      markMat.uniforms.uAmount.value = MARK * Math.max(s, 0.6 * ln) * last.free * (1 - f);

      // the fittings, the control unit, its wire: they fade with the car
      const fit = smooth(0.3, 0.8, sh); // (at shell 0.25 — the cut to the bench — nothing of them is left: only the retractor and its strap)
      setPartOpacity(hard, fit);
      const o = clamp01(order);
      const lit = smooth(0.08, 0.15, o);
      const run = clamp01((o - 0.15) / 0.85);
      setGlow(lamp, 1.5 * lit * fit);
      wireLit.visible = run > 0.004 && fit > 0.004;
      wireLit.geometry.instanceCount = Math.max(1, Math.round(run * (WAY.length - 1)));
      const at = run * (WAY.length - 1);
      const j = Math.min(WAY.length - 2, Math.floor(at));
      const u = at - j;
      const breath = 1 + 0.06 * Math.sin(time * 1.3);
      sprites.uniforms.uScale.value = px;
      sprites.put(0, mix(WAY[j][0], WAY[j + 1][0], u), mix(WAY[j][1], WAY[j + 1][1], u), mix(WAY[j][2], WAY[j + 1][2], u), HEAD, lit * fit * (run > 0.985 ? 1.25 : 1), 46);
      sprites.put(1, ECU[0] + 1, ECU[1] + 2.4, ECU[2], UNIT, lit * breath * fit, 58);
      sprites.put(2, A.chest.position.x, A.chest.position.y, A.chest.position.z, BEAR, here ? 0.7 * f : 0, 74);
      sprites.put(3, A.shoulder.position.x, A.shoulder.position.y, A.shoulder.position.z, BEAR, here ? 0.45 * f : 0, 52);
      sprites.flush();

      back.visible = rear > 0.5;
    },
  };
}
