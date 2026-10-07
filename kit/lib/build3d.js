// Modelling helpers for the house look: dark solids, fine light edges, glowing accents,
// and "parts" that know how to come apart (exploded view).
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { mergeGeometries, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { BRAND } from "./brand.js";

export { mergeGeometries };

const DEG = Math.PI / 180;

/** The studio's large softbox (stage.js builds it from these numbers): where it stands, its width and height. Glass shows its reflection. */
export const SOFTBOX = { pos: [-7, 8, 6], w: 9, h: 6 };
const BOX = (() => {
  const c = new THREE.Vector3(...SOFTBOX.pos);
  const d = c.length();
  c.normalize();
  const u = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), c).normalize();
  return { c, u, v: new THREE.Vector3().crossVectors(c, u), d };
})();

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
 *
 * Left at that, it is a haze: every face, front and back, of every piece adds its veil. To make it
 * read as glass, ask for what glass does —
 *   `edge`  its lip: a crisp bright line where the surface turns away (0.3–0.7), on top of the soft `rim`
 *   `spec`  the studio's softbox mirrored in it, with soft borders (0.4–0.9): a window on a canopy,
 *           a long streak down a tube or a limb. Keep it for what is seen from close
 * — and hand its meshes to `asShell`: only the nearest surface lights up. Then `base` can go to 0.
 */
export function glass(color = BRAND.ink, { base = 0.006, rim = 0.2, power = 3.2, edge = 0, spec = 0 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uBase: { value: base }, uRim: { value: rim }, uPower: { value: power }, uAmount: { value: 1 },
      uEdge: { value: edge }, uSpec: { value: spec },
      uBoxC: { value: BOX.c }, uBoxU: { value: BOX.u }, uBoxV: { value: BOX.v }, uBoxSize: { value: new THREE.Vector3(SOFTBOX.w / 2, SOFTBOX.h / 2, BOX.d) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uBoxC, uBoxU, uBoxV, uBoxSize; uniform float uBase, uRim, uPower, uAmount, uEdge, uSpec; varying vec3 vN; varying vec3 vV;
      void main() {
        if (uAmount < 0.003) discard; // faded out, a shell must not hide the ones behind it
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float facing = dot(n, v);
        // clamp before pow: facing the eye exactly, the dot product can read 1.0000001, and pow() of a negative is not a number
        float g = clamp(1.0 - abs(facing), 0.0, 1.0);
        float light = uBase + uRim * pow(g, uPower) + uEdge * smoothstep(0.6, 0.97, g);
        if (uSpec > 0.0) {
          // where does the eye's ray go once mirrored? (view space → world: the view matrix only turns, its transpose turns back)
          vec3 r = (vec4(reflect(-v, facing < 0.0 ? -n : n), 0.0) * viewMatrix).xyz;
          float toward = dot(r, uBoxC);
          vec3 p = r * (uBoxSize.z / max(toward, 1e-3));
          vec2 q = abs(vec2(dot(p, uBoxU), dot(p, uBoxV))) / uBoxSize.xy;
          // soft borders, wider than a pixel on anything curved: a hard-edged glint would crawl as the limb moves
          light += uSpec * smoothstep(0.0, 0.3, toward) * (1.0 - smoothstep(0.55, 1.3, q.x)) * (1.0 - smoothstep(0.55, 1.3, q.y));
        }
        gl_FragColor = vec4(uColor * light * uAmount, 1.0);
      }`,
  });
}

/**
 * Make ONE shell of several glass meshes (the limbs of a figure, the panels of a fuselage): each
 * first writes its depth without colour, then all are drawn, and only the surface nearest the eye
 * passes. No more discs where a limb enters the trunk, no veil of back faces over what is inside.
 * `order`: when it is drawn. A shell hides the glass drawn after it behind it, never the glass
 * drawn before: what is inside goes first (a pilot at 10, the canopy and the aircraft at 20).
 * Solids, edge lines and glows (render order under 9) always show through.
 */
export function asShell(meshes, order = 20) {
  for (const mesh of [meshes].flat()) {
    const mat = mesh.material;
    // the very same program as the glass: the two draws land on the same depth to the last bit
    const hold = (mat.userData.hold ??= Object.assign(mat.clone(), { uniforms: mat.uniforms, colorWrite: false, depthWrite: true, blending: THREE.NoBlending }));
    const twin = mesh.userData.hold ?? new THREE.Mesh(mesh.geometry, hold);
    twin.material = hold;
    twin.renderOrder = order - 1;
    twin.visible = true;
    mesh.renderOrder = order;
    mesh.userData.hold = twin;
    mesh.add(twin);
  }
  return meshes;
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
  // a piece with broken edges (box, cyl, plate, lathe with a bevel) brings the outline to draw: one line per edge, not one per facet of its bevel
  const lines = new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(geometry.userData.edges ?? geometry, o.threshold ?? 28));
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

/* ─────────────────────────────────────────────────────────── broken edges
   A sharp corner gives the light nothing to hold: the piece is a dark hole inside its edge lines.
   A bevel, even a millimetre wide, is a facet of its own that catches the key or the rim light —
   the bright fillet that says "machined". Every helper here keeps the outer size it is given and
   carries, in `userData.edges`, the outline `addMesh` draws: one line running in the middle of
   each bevel. On such a piece the line can step back (`edgeOpacity` 0.4–0.55): the light takes over. */

// each corner of an open polyline cut back by `r` and replaced by `steps` facets of an arc; `mid`: the same polyline through the middle of each cut
function breakCorners(points, r, steps = 1) {
  const cut = [];
  const mid = [];
  points.forEach((p, i) => {
    const a = points[i - 1];
    const b = points[i + 1];
    if (a && b) {
      const u = [a[0] - p[0], a[1] - p[1]];
      const v = [b[0] - p[0], b[1] - p[1]];
      const lu = Math.hypot(...u);
      const lv = Math.hypot(...v);
      const k = Math.min(r, lu / 2.4, lv / 2.4); // two bevels may share a short side
      const cos = lu && lv ? (u[0] * v[0] + u[1] * v[1]) / (lu * lv) : -1;
      if (cos > -0.94 && k > 1e-3) {
        const half = Math.acos(Math.min(1, Math.max(-1, cos))) / 2; // half the angle of the corner
        const bis = [u[0] / lu + v[0] / lv, u[1] / lu + v[1] / lv];
        const lb = Math.hypot(...bis);
        const centre = [p[0] + (bis[0] / lb) * (k / Math.cos(half)), p[1] + (bis[1] / lb) * (k / Math.cos(half))];
        const from = [p[0] + (u[0] / lu) * k - centre[0], p[1] + (u[1] / lu) * k - centre[1]];
        const to = [p[0] + (v[0] / lv) * k - centre[0], p[1] + (v[1] / lv) * k - centre[1]];
        const sweep = Math.atan2(from[0] * to[1] - from[1] * to[0], from[0] * to[0] + from[1] * to[1]);
        const on = (t) => [centre[0] + from[0] * Math.cos(sweep * t) - from[1] * Math.sin(sweep * t), centre[1] + from[0] * Math.sin(sweep * t) + from[1] * Math.cos(sweep * t)];
        for (let s = 0; s <= steps; s++) cut.push(on(s / steps));
        // one facet: the line runs on it; an arc: on its crest
        mid.push(steps > 1 ? on(0.5) : [(on(0)[0] + on(1)[0]) / 2, (on(0)[1] + on(1)[1]) / 2]);
        return;
      }
    }
    cut.push(p);
    mid.push(p);
  });
  return { cut, mid };
}

/** A profile ([r, y] or [x, y] points) with every sharp corner broken: by a flat of `r` cm, or by `steps` facets of a round. */
export const chamfer = (profile, r = 0.1, steps = 1) => breakCorners(profile, r, steps).cut;

/**
 * A profile ([radius, y] points) turned around the y axis. `bevel` (cm) breaks its corners —
 * `round`: with how many facets (1: a flat chamfer, 3: a fillet) — and the normals are then smooth
 * around the axis but sharp at the corners, so each land and each groove is its own band of light
 * (no `flatShading`, which would also facet the round). `crease` (degrees) alone does only that.
 */
export const lathe = (profile, segments = 96, { bevel = 0, round = 1, crease = bevel ? 40 : 0 } = {}) => {
  const turn = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  const broken = bevel ? breakCorners(profile, bevel, round) : null;
  const geo = turn(broken ? broken.cut : profile);
  if (!crease) return geo;
  const out = toCreasedNormals(geo, crease * DEG);
  out.userData.edges = turn(broken ? broken.mid : profile);
  return out;
};

/** A box w × h × d, centred like `BoxGeometry`, its edges rounded by `r` cm. */
export function box(w, h, d, r = 0.15, facets = 3) {
  const k = Math.max(0.001, Math.min(r, w / 2.01, h / 2.01, d / 2.01));
  const geo = new RoundedBoxGeometry(w, h, d, facets, k);
  const e = 2 * k * (1 - Math.SQRT1_2); // the line on the crest of the round
  geo.userData.edges = new THREE.BoxGeometry(w - e, h - e, d - e);
  return geo;
}

/** A cylinder of radius `r` and height `h`, centred like `CylinderGeometry`, its two rims broken by `bevel` cm. `top`: another radius up there (a cone). */
export const cyl = (r, h, bevel = 0.1, segments = 64, top = r) =>
  lathe([[0, -h / 2], [r, -h / 2], [top, h / 2], [0, h / 2]], segments, { bevel, round: 2 });

/**
 * A flat outline ([x, y] points, or a THREE.Shape with its holes) given a thickness: from z = 0 to
 * z = `depth`, the outline keeping its size — the bevel is taken from the piece, not added to it.
 */
export function plate(outline, depth, { bevel = 0.1, round = 2, curveSegments = 24 } = {}) {
  const shape = outline.isShape ? outline : new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  const b = Math.min(bevel, depth / 2.01);
  const cut = (inset, thickness, facets) =>
    new THREE.ExtrudeGeometry(shape, { depth: depth - 2 * inset, curveSegments, bevelEnabled: true, bevelThickness: thickness, bevelSize: thickness, bevelOffset: -inset, bevelSegments: facets }).translate(0, 0, inset);
  const geo = cut(b, b, round);
  geo.userData.edges = cut(b * (1 - Math.SQRT1_2), 0, 0); // the same outline, drawn in by a third of the bevel, with sharp corners
  return geo;
}

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
