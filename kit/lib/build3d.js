// Modelling helpers for the house look: dark solids, fine light edges, glowing accents,
// and "parts" that know how to come apart (exploded view).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { BRAND } from "./brand.js";

export { mergeGeometries };

function track(mat, opacity = 1) {
  mat.opacity = opacity;
  mat.userData.base = opacity;
  mat.userData.transparent = mat.transparent;
  mat.userData.depthWrite = mat.depthWrite;
  return mat;
}

/**
 * Lit solid, pushed back a hair in depth so edge lines always win.
 * `rough` / `metal` as usual; `coat` (0–1) adds a clear varnish — moulded plastic, lacquered metal;
 * `env` scales how much of the studio it reflects.
 */
export function solid(color, o = {}) {
  const common = {
    color,
    roughness: o.rough ?? 0.7,
    metalness: o.metal ?? 0,
    envMapIntensity: o.env ?? 1,
    side: o.double ? THREE.DoubleSide : THREE.FrontSide,
    transparent: (o.opacity ?? 1) < 1,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  };
  const mat = o.coat ? new THREE.MeshPhysicalMaterial({ ...common, clearcoat: o.coat, clearcoatRoughness: o.coatRough ?? 0.3 }) : new THREE.MeshStandardMaterial(common);
  return track(mat, o.opacity ?? 1);
}

/** Unlit, HDR: `k` > 1 pushes it past the bloom threshold. */
export function glow(color, k = 3, o = {}) {
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(k),
    transparent: !!o.additive || (o.opacity ?? 1) < 1,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: !o.additive,
    side: o.double ? THREE.DoubleSide : THREE.FrontSide,
    fog: false,
  });
  mat.userData.hue = new THREE.Color(color);
  return track(mat, o.opacity ?? 1);
}

/**
 * Glass that only shows where it turns away from the eye: the shell of an X-ray. What surrounds
 * the system (a car, a lift shaft, a building) is drawn with it and with fine edge lines, so that
 * the few solid things inside are all the eye finds. `uniforms.uAmount` fades the whole shell.
 */
export function glass(color = BRAND.ink, { base = 0.006, rim = 0.2, power = 3.2 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uBase, uRim, uPower, uAmount; varying vec3 vN; varying vec3 vV;
      void main() {
        // clamp before pow: facing the eye exactly, the dot product can read 1.0000001, and pow() of a negative is not a number
        float f = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * (uBase + uRim * f) * uAmount, 1.0);
      }`,
  });
}

/** Re-light a glow material: intensity, optionally a new hue. */
export function setGlow(mat, k, hue) {
  if (hue) mat.userData.hue.copy(hue);
  mat.color.copy(mat.userData.hue).multiplyScalar(k);
}

export function lineMat(color, width = 2, o = {}) {
  const mat = new LineMaterial({
    color,
    linewidth: width,
    transparent: true,
    depthWrite: false,
    dashed: !!o.dashed,
    dashSize: o.dashSize ?? 0.2,
    gapSize: o.gapSize ?? 0.14,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexColors: !!o.vertexColors, // a colour per end of each segment (geometry.setColors)
  });
  mat.fog = !!o.fog; // lines ignore the fog unless asked: far ones then sink into the dark, which is depth
  if (o.hdr) mat.color.multiplyScalar(o.hdr);
  mat.resolution.set(BRAND.W, BRAND.H);
  return track(mat, o.opacity ?? 1);
}

export function edgesOf(geometry, o = {}) {
  const lines = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry, o.threshold ?? 28));
  const obj = new LineSegments2(lines, lineMat(o.color ?? BRAND.ink, o.width ?? 2, { opacity: o.opacity ?? 0.85 }));
  obj.renderOrder = 2;
  return obj;
}

/** Polyline through [x,y,z] points, drawn in screen-space pixels. */
export function fatLine(points, o = {}) {
  const geo = new LineGeometry();
  geo.setPositions(points.flat());
  const line = new Line2(geo, lineMat(o.color ?? BRAND.ink, o.width ?? 2, o));
  if (o.dashed) line.computeLineDistances();
  line.renderOrder = 3;
  return line;
}

/** A copy of `geometry` moved and turned — the way to bake many small pieces before `mergeGeometries`. */
export function placed(geometry, { pos = [0, 0, 0], rotX = 0, rotY = 0, rotZ = 0 } = {}) {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ, "YXZ")),
    new THREE.Vector3(1, 1, 1),
  );
  return geometry.clone().applyMatrix4(m);
}

/** An empty point attached to a part: what a callout's leader line follows. */
export function anchor(parent, x, y, z) {
  const o = new THREE.Object3D();
  o.position.set(x, y, z);
  parent.add(o);
  return o;
}

export const lathe = (profile, segments = 96) =>
  new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);

/* ─────────────────────────────────────────────────────────── parts */

/** A part of the system. `lift` = how far it rises in the exploded view; `delay`/`span` stagger it. */
export function makePart(name, { lift = 0, delay = 0, span = 0.6 } = {}) {
  const group = new THREE.Group();
  group.name = name;
  group.userData.part = { lift, delay, span, twist: 0, mats: new Set(), meshes: [], opacity: 1 };
  return group;
}

const luminance = (c) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

/** Add a mesh to a part. Edges are drawn unless `edges: false`; dark on light plastic, light on dark. */
export function addMesh(part, geometry, material, o = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  if (o.pos) mesh.position.set(...o.pos);
  if (o.rot) mesh.rotation.set(...o.rot);
  const mats = part.userData.part.mats;
  mats.add(material);
  // lit, opaque things take part in the shadows; glows and veils do not
  const lit = !material.isMeshBasicMaterial;
  mesh.castShadow = lit && material.userData.base >= 0.5;
  mesh.receiveShadow = lit;
  if (mesh.castShadow) part.userData.part.meshes.push(mesh);
  if (o.edges !== false) {
    const light = luminance(material.color) > 0.3;
    const lines = edgesOf(geometry, {
      color: o.edgeColor ?? (light ? 0x1d2226 : BRAND.ink),
      width: o.edgeWidth ?? (light ? 1.8 : 2),
      opacity: o.edgeOpacity ?? (light ? 0.9 : 0.8),
      threshold: o.threshold,
    });
    mats.add(lines.material);
    mesh.add(lines);
  }
  part.add(mesh);
  return mesh;
}

/** Fade a whole part (0 hides it). */
export function setPartOpacity(part, a) {
  const p = part.userData.part;
  if (p.opacity === a) return;
  p.opacity = a;
  part.visible = a > 0.004;
  for (const mesh of p.meshes) mesh.castShadow = a > 0.6; // a ghost casts no shadow
  for (const mat of p.mats) {
    mat.opacity = mat.userData.base * a;
    const transparent = mat.userData.transparent || a < 0.999;
    if (mat.transparent !== transparent) {
      mat.transparent = transparent;
      mat.needsUpdate = true;
    }
    mat.depthWrite = mat.userData.depthWrite && a > 0.55;
  }
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

// leaves fast, arrives with a slight overshoot and settles: parts have weight
const settle = (u) => {
  const e = easeInOut(u);
  return e + Math.sin(Math.PI * u) * Math.sin(Math.PI * u) * 0.055 * (u > 0.5 ? 1 : 0.25);
};

/**
 * k = 0 assembled → 1 fully exploded; each part moves in its own window.
 * A part with `userData.part.twist` (radians) turns on itself on the way and is straight at both ends.
 */
export function explode(parts, k) {
  for (const part of parts) {
    const p = part.userData.part;
    const u = clamp01((k - p.delay) / p.span);
    part.position.y = p.lift * settle(u);
    if (p.twist) part.rotation.y = p.twist * Math.sin(Math.PI * u) * (1 - u);
  }
}
