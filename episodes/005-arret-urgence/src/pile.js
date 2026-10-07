// Chicago, 2 December 1942: the first reactor, a mound of graphite bricks under the stands of a
// stadium — and its last resort. A rod hangs over the pile from a rope tied to the balcony rail;
// a man stands by the rope with an axe. Seen like an X-ray: the pile and the balcony in fine
// lines; solid, only the rod, the rope, the man and his axe. Centimetres; the floor is y = 0.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { makeFigure } from "@kit/figure.js";
import { makeSurface } from "@kit/atmo.js";
import { solid, glow, glass, lineMat, edgesOf, anchor } from "@kit/build3d.js";

const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);

export const PILE = { x: 60000 }; // far from the other sets
const LAYERS = 12;
const LAYER = 48; // 12 layers of 48 cm: 5.8 m of graphite
const TOP = LAYERS * LAYER;
const BALCONY = { x0: 430, x1: 800, y: 500, half: 150, rail: 105 };
const ROPE_X = 500; // where the rope comes down to the rail
const PULLEY = 1060;

/** A ball of light: bright where it faces the camera, nothing at its edge. */
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

export function buildPile() {
  const group = new THREE.Group();
  group.position.set(PILE.x, 0, 0);
  const fx = {};
  const A = {};

  fx.floor = makeSurface({ radius: 3000, cell: 60, fade: 520, lift: 12 });
  fx.floor.group.children[0].visible = false; // no slab: seen from a balcony, a floor is a grey band across the picture. The grid alone says where the ground is
  group.add(fx.floor.group);

  /* ── the pile: layers of bricks, wider in the middle, flattened on top ── */
  fx.shell = glass(BRAND.ink, { base: 0.004, rim: 0.085, power: 2.4 }); // a body of glass: lines alone are a drawing. Twelve layers add up: a third of the vessel's values
  fx.edges = [];
  for (let k = 0; k < LAYERS; k++) {
    const t = k / (LAYERS - 1);
    const half = 380 * (t < 0.45 ? 1 : Math.sqrt(Math.max(0.05, 1 - Math.pow((t - 0.45) / 0.62, 2))));
    const geo = new THREE.BoxGeometry(half * 2, LAYER - 3, half * 1.8);
    const layer = new THREE.Mesh(geo, fx.shell);
    layer.position.y = k * LAYER + LAYER / 2;
    const e = edgesOf(geo, { color: BRAND.ink, width: 1.9, opacity: 0.22 });
    fx.edges.push(e.material);
    layer.add(e);
    group.add(layer);
  }
  A.pile = anchor(group, -330, 260, 300);
  // it is running: a light in the heart of the graphite (a gradient — a plain additive sphere reads as a disc)
  const heart = softGlow(3.2); // a bright centre, a long tail
  heart.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.4);
  const core = new THREE.Mesh(new THREE.SphereGeometry(215, 40, 24), heart);
  core.position.set(0, TOP * 0.45, 0);
  group.add(core);
  // the well the rod would fall into: a channel down through the bricks
  const wellGeo = new THREE.BoxGeometry(34, 320, 34);
  const well = new THREE.Mesh(wellGeo, glass(BRAND.ink, { base: 0.03, rim: 0.3, power: 2.4 }));
  well.position.set(0, TOP - 160, 0);
  well.add(edgesOf(wellGeo, { color: BRAND.ink, width: 1.9, opacity: 0.5 }));
  group.add(well);

  /* ── the rod, over the pile; its rope, up over two pulleys and down to the balcony rail ── */
  const bright = solid(0xb9c0c4, { rough: 0.4, metal: 0.4, env: 1.3 });
  const rodLen = 250;
  const rodY = TOP + 46;
  // veille: it is the system — the ancestor of the green rods the film has just watched fall
  const rod = new THREE.Mesh(new THREE.BoxGeometry(22, rodLen, 22), glow(BRAND.veille, 1.25));
  rod.position.set(0, rodY + rodLen / 2, 0);
  const rodEdges = edgesOf(rod.geometry, { color: BRAND.veille, width: 1.9, opacity: 0.8 });
  rod.add(rodEdges);
  group.add(rod);
  A.rod = anchor(group, -11, rodY + rodLen * 0.5, 0);
  const tie = BALCONY.y + BALCONY.rail;
  fx.rope = lineMat(BRAND.ink, 3.2, { opacity: 0.95 });
  const rope = new Line2(new LineGeometry(), fx.rope);
  rope.geometry.setPositions([0, rodY + rodLen, 0, 0, PULLEY, 0, ROPE_X, PULLEY, 0, ROPE_X, tie, 0]);
  rope.frustumCulled = false;
  group.add(rope);
  for (const x of [0, ROPE_X]) {
    const p = new THREE.Mesh(new THREE.TorusGeometry(11, 3, 10, 28), bright);
    p.position.set(x, PULLEY + 4, 0);
    group.add(p);
  }
  // where the axe would fall: a point on the rope, just above the rail
  const CUT = tie + 70;
  fx.hot = new THREE.Mesh(new THREE.SphereGeometry(4.4, 20, 14), glow(BRAND.signal, 0, { additive: true }));
  fx.hot.position.set(ROPE_X, CUT, 0);
  group.add(fx.hot);
  A.rope = anchor(group, ROPE_X, CUT, 0);
  A.span = anchor(group, ROPE_X / 2, PULLEY, 0);

  /* ── the balcony: a slab, a rail ── */
  const seg = [];
  const line = (a, b) => seg.push(...a, ...b);
  const { x0, x1, y, half, rail } = BALCONY;
  for (const yy of [y - 22, y]) {
    line([x0, yy, -half], [x1, yy, -half]);
    line([x1, yy, -half], [x1, yy, half]);
    line([x1, yy, half], [x0, yy, half]);
    line([x0, yy, half], [x0, yy, -half]);
  }
  line([x0, y + rail, -half], [x0, y + rail, half]); // the rail, on the side of the pile
  line([x0, y + rail * 0.5, -half], [x0, y + rail * 0.5, half]);
  for (let z = -half; z <= half; z += 60) line([x0, y, z], [x0, y + rail, z]);
  for (const z of [-half, half]) line([x0, 0, z], [x0, y - 22, z]); // what holds it up
  for (const z of [-half, half]) line([x1, 0, z], [x1, y - 22, z]);
  const linesGeo = new LineSegmentsGeometry();
  linesGeo.setPositions(seg);
  fx.lines = lineMat(BRAND.ink, 1.9, { opacity: 0.45 });
  const lines = new LineSegments2(linesGeo, fx.lines);
  lines.frustumCulled = false;
  group.add(lines);
  // the knot on the rail
  const knot = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), bright);
  knot.position.set(ROPE_X, tie, 0);
  group.add(knot);

  /* ── the man, facing the rope, the axe raised ── */
  const man = makeFigure();
  man.group.position.set(ROPE_X + 78, y, 14);
  man.group.rotation.y = -Math.PI / 2; // he looks toward the pile (−x)
  group.add(man.group);
  // both hands on the handle, above his right shoulder
  const V = (a, b, c) => new THREE.Vector3(a, b, c);
  const top = man.reach("R", V(-13, 171, 21), V(-0.9, -0.3, -0.3));
  const low = man.reach("L", V(-1, 152, 27), V(0.8, -0.6, -0.2));
  const axe = new THREE.Group();
  const dir = V(-0.34, 0.83, 0.44).normalize(); // the handle: up, a little back over the shoulder… and toward the rope
  axe.position.copy(low);
  axe.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(3.4, 92, 3.4), solid(0x8a949b, { rough: 0.6 }));
  handle.position.y = 30;
  handle.castShadow = true;
  fx.blade = glow(BRAND.ink, 1);
  // an axe head: narrow at the handle, flaring to a curved edge (a square plate reads as a sign)
  const head = new THREE.Shape();
  head.moveTo(0, -5);
  head.lineTo(8, -6);
  head.quadraticCurveTo(20, -9, 27, -15);
  head.quadraticCurveTo(31, 0, 27, 15);
  head.quadraticCurveTo(20, 9, 8, 6);
  head.lineTo(0, 5);
  head.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(head, { depth: 3.2, bevelEnabled: false }).translate(0, 0, -1.6).rotateY(-Math.PI / 2), fx.blade);
  blade.position.set(0, 70, -1);
  axe.add(handle, blade);
  man.group.add(axe);
  // the hand on top slides to where the handle really is
  man.reach("R", low.clone().addScaledVector(dir, 24), V(-0.9, -0.3, -0.3));
  void top;
  A.man = anchor(man.group, 0, 184, 0);
  A.axe = anchor(axe, 0, 74, 14);
  fx.man = man;

  const hue = new THREE.Color();
  /**
   * hot     0 → 1: the point on the rope where the axe would fall
   * axe     0 → 1: the blade lights up (signal)
   * lines   0 → 1: the fine lines
   * heart   0 → 1: the light inside the pile
   */
  function update(S, time) {
    const beat = 0.82 + 0.18 * Math.sin(time * 7.5);
    fx.hot.material.color.copy(SIGNAL).multiplyScalar(6 * S.hot * beat);
    fx.hot.visible = S.hot > 0.01;
    hue.copy(INK).lerp(SIGNAL, S.axe);
    fx.blade.color.copy(hue).multiplyScalar(1 + 2.6 * S.axe);
    heart.uniforms.uColor.value.copy(SIGNAL).multiplyScalar(1.4 * S.heart);
    fx.lines.opacity = 0.45 * S.lines;
    for (const m of fx.edges) m.opacity = 0.22 * S.lines;
    fx.shell.uniforms.uAmount.value = S.lines * (0.3 + 0.7 * S.heart); // the graphite steps back with its light: the rod is then the subject
    fx.floor.grid.uAmount.value = 0.16 * S.lines;
  }

  return { group, fx, A, update };
}
