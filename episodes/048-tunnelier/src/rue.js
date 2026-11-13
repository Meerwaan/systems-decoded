// DOSSIER 048 — Tunnelier : the STREET, seen like an X-ray — a Paris street at night above the machine: the road
// in section (asphalt and base, y 0 → −60), the two sidewalks and their granite kerbs, the six-storey building on the
// far side (its lit windows, its balcony, its mansard and chimneys, its cellar, the bedroom of the one who sleeps),
// 011's car of glass in the near lane, the settlement gauge on the near kerb, the settlement trough read on the road,
// the neighbourhood from above and the tunnel's trace under it, the night sky and the satellite. plan.js coordinates.
//
//   buildStreet() → { group, A, car, update(p, time, px) }
//   A       anchors (Object3D): car · carRoof · ruler · rulerIndex · trough · building · roof · bedroom · window · town · sat
//   update  p = { street, carX, settle, ruler, lights, sleeper, town, trace, sat }
//     street   the X-ray of the street, the building and the car (0–1)
//     carX     where the car's centre stands along x (cm); it drives toward −x (the acts tween it, ease "none");
//              its wheels turn with it (011's `fx.wheels`, nothing changed in 011)
//     settle   the settlement at the trough's deepest point, in MILLIMETRES (the header reads it): 0 → 8 it sinks,
//              < 0 the road heaves (« ta rue monte »). TRUE scale on the road (the trough's surface moves by
//              settle × 0.1 cm: invisible) — what reads is the trough's signal glow (a heart, a long tail, three
//              fine level lines) on the road, on the section of the near sidewalk and on the kerb, and the gauge
//     ruler    the settlement gauge on the near kerb (0–1): a staff magnified ×50 (1 mm = 5 cm), 0 → 12, red from 10;
//              its index (ink → signal at 10) rides on a rod nailed into the road
//     lights   the building's windows at night (0–1)
//     sleeper  the bedroom on the 2nd floor (022's chambre, you asleep, breathing), its window's frame brighter (0–1)
//     town     the neighbourhood from above: Haussmann blocks of glass round their courtyards, lit windows, street
//              lamps out to the dark (0–1)
//     trace    the tunnel's trace, dashed veille 16 m under the town, drawn from the machine back along its way to
//              its launch shaft, a head of light running ahead of it (0–1)
//     sat      the night sky (still stars) and the satellite crossing it from SKY.from to SKY.to, a bright heart and
//              a long fine trail (0 hidden)
// Three colours: ink (the street, the town, the stars), signal (the trough, the gauge's red), veille (the trace).
// Everything depends on the state and `time`; `update` allocates nothing.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { glass, asShell, glow, setGlow, solid, lineMat, anchor, box, cyl, plate, mergeGeometries } from "@kit/build3d.js";
import { buildCar } from "../../011-fusible-pyro/src/car.js";
import { buildChambre } from "../../022-batterie-telephone/src/chambre.js";
import { ROOM } from "../../022-batterie-telephone/src/plan.js";
import { STREET, BUILDING, BEDROOM, CAR, TROUGH, RULER, TOWN, SKY, TBM } from "./plan.js";
import { dressStreet } from "./habillage.js";

const INK = new THREE.Color(BRAND.ink);
const SIGNAL = new THREE.Color(BRAND.signal);
const VEILLE = new THREE.Color(BRAND.veille);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const WHEEL_R = 34; // 011's tyre radius (its CAR.wheel)
const ORDER = { street: 32, building: 34, town: 36 }; // after the soil (30): a shell only hides what is drawn after it

/* ─────────────────────────── line families: gathered at build time, one draw each ─────────────────────────── */
function lines() {
  const P = [];
  const api = {
    P,
    seg(x0, y0, z0, x1, y1, z1) {
      P.push(x0, y0, z0, x1, y1, z1);
      return api;
    },
    poly(pts, closed = false) {
      const n = pts.length - (closed ? 0 : 1);
      for (let i = 0; i < n; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        P.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      }
      return api;
    },
    rz: (x0, x1, y0, y1, z) => api.poly([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], true), // in the plane z
    rx: (z0, z1, y0, y1, x) => api.poly([[x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0]], true), // in the plane x
    ry: (x0, x1, z0, z1, y) => api.poly([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], true), // in the plane y
    cube(x0, x1, y0, y1, z0, z1) {
      api.ry(x0, x1, z0, z1, y0).ry(x0, x1, z0, z1, y1);
      for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) api.seg(x, y0, z, x, y1, z);
      return api;
    },
  };
  return api;
}
function bake(set, width, opacity, color = BRAND.ink, o = {}) {
  const obj = new LineSegments2(new LineSegmentsGeometry().setPositions(set.P), lineMat(color, width, { opacity, ...o }));
  obj.renderOrder = 2;
  return obj;
}

/** Quads of light (lit windows, road paint): one mesh, a colour per corner (top / bottom), additive. */
function quads() {
  const pos = [];
  const col = [];
  const put = (a, b, c, d, kt, kb) => {
    // a b on the bottom, c d on the top
    for (const [p, k] of [[a, kb], [b, kb], [c, kt], [a, kb], [c, kt], [d, kt]]) {
      pos.push(p[0], p[1], p[2]);
      col.push(INK.r * k, INK.g * k, INK.b * k);
    }
  };
  return {
    z: (x0, x1, y0, y1, z, kt, kb = kt) => put([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], kt, kb),
    x: (z0, z1, y0, y1, x, kt, kb = kt) => put([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], kt, kb),
    y: (x0, x1, z0, z1, y, k) => put([x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], k, k),
    bake(order = 4) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const mat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = order;
      return { mesh, mat };
    },
  };
}

/** A soft round spot (a heart of light with its falloff), for sprites. */
function spotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.12, "rgba(255,255,255,0.85)");
  r.addColorStop(0.35, "rgba(255,255,255,0.22)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function spot(tex, color, k, size) {
  const mat = new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(color).multiplyScalar(k), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const s = new THREE.Sprite(mat);
  s.scale.setScalar(size);
  s.renderOrder = 6;
  return s;
}

/* ─────────────────────────── the gauge's face: drawn on a canvas, figures by hand (no font to wait for) ─────────────────────────── */
const STAFF = { w: 14, t: 2.5, zero: 62, cm: 18.3 }; // the staff (cm), where its zero stands above its foot, canvas px per cm
function staffTexture() {
  const W = Math.round(STAFF.w * STAFF.cm);
  const H = Math.round(RULER.height * STAFF.cm);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const yOf = (mm) => (RULER.height - (STAFF.zero - (RULER.gain / 10) * mm)) * STAFF.cm; // canvas y of a reading
  g.fillStyle = "#1e2327";
  g.fillRect(0, 0, W, H);
  // the red band, from 10 mm to the foot
  g.fillStyle = "#ff5b2e";
  g.fillRect(W * 0.46, yOf(RULER.red), W * 0.54, H - yOf(RULER.red));
  const ink = "#e9e4d8";
  for (let k = 0; k <= 2 * RULER.max; k++) {
    const mm = k / 2;
    const y = yOf(mm);
    const major = mm % 5 === 0;
    const whole = Number.isInteger(mm);
    g.fillStyle = mm >= RULER.red ? "#1e2327" : ink;
    const x0 = major ? W * 0.4 : whole ? W * 0.6 : W * 0.78;
    const th = major ? 9 : whole ? 6 : 4;
    g.fillRect(x0, y - th / 2, W - x0, th);
  }
  // the figures 0, 5, 10: strokes in a 0.6 × 1 box
  const glyph = {
    0: (p) => p.ellipse(0.3, 0.5, 0.27, 0.47, 0, 0, Math.PI * 2),
    1: (p) => {
      p.moveTo(0.12, 0.2);
      p.lineTo(0.34, 0.02);
      p.lineTo(0.34, 0.98);
    },
    5: (p) => {
      p.moveTo(0.56, 0.03);
      p.lineTo(0.12, 0.03);
      p.lineTo(0.08, 0.46);
      p.bezierCurveTo(0.28, 0.34, 0.6, 0.4, 0.58, 0.7);
      p.bezierCurveTo(0.56, 1.0, 0.16, 1.02, 0.04, 0.84);
    },
  };
  const figure = (text, y, color) => {
    const h = 4.4 * STAFF.cm;
    const s = h;
    let x = W * 0.05;
    g.save();
    g.strokeStyle = color;
    g.lineWidth = 0.15 * s;
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const ch of text) {
      g.save();
      g.translate(x, y - h / 2);
      g.scale(s, s);
      g.lineWidth = 0.15;
      g.beginPath();
      glyph[ch](g);
      g.stroke();
      g.restore();
      x += 0.62 * s;
    }
    g.restore();
  };
  figure("0", yOf(0), ink);
  figure("5", yOf(5), ink);
  figure("10", yOf(10), "#ff5b2e");
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/* ─────────────────────────── the trough's light: a Gaussian on the road — a small heart, a faint tail, level lines ───────────────────────────
   The true trough is wider than the street (ix 7 m, iz 8.5 m): drawn as it is, it is a flat slab of light. What reads
   as a bowl is a topographic map of it: a heart (g^8) where it is deepest, rings where it reaches 50, 70, 85, 95 %.
   Seen grazing, a lit plane packs its light into a stripe: every piece fades with how much it faces the eye. */
const FACING = /* glsl */ `
      varying float vFace;
      float facingOf(vec3 p) {
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        return abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
      }`;
function troughSurface() {
  // the carriageway around the trough, x across ±3 ix, z ±350; true-scale sink in the vertex shader
  const geo = new THREE.PlaneGeometry(6 * TROUGH.ix, 2 * STREET.carriage, 120, 14).rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: SIGNAL.clone() }, uAmount: { value: 0 }, uSink: { value: 0 }, uI: { value: new THREE.Vector2(TROUGH.ix, TROUGH.iz) } },
    vertexShader: /* glsl */ `
      uniform float uSink; uniform vec2 uI; varying vec2 vQ;
      ${FACING}
      void main() {
        vec3 p = position;
        vQ = p.xz;
        vec2 q = p.xz / uI;
        p.y -= uSink * exp(-0.5 * dot(q, q));
        vFace = facingOf(p);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; uniform vec2 uI; varying vec2 vQ; varying float vFace;
      float ring(float g, float l) { float w = max(fwidth(g), 1e-5); return 1.0 - smoothstep(0.7 * w, 1.7 * w, abs(g - l)); }
      void main() {
        vec2 q = vQ / uI;
        float g = clamp(exp(-0.5 * dot(q, q)), 0.0, 1.0);
        float c = ring(g, 0.5) * 0.55 + ring(g, 0.7) * 0.7 + ring(g, 0.85) * 0.85 + ring(g, 0.95);
        float g2 = g * g; float g4 = g2 * g2;
        float edge = smoothstep(${STREET.carriage.toFixed(1)}, ${(STREET.carriage - 40).toFixed(1)}, abs(vQ.y));
        float view = mix(0.1, 1.0, smoothstep(0.15, 0.6, vFace));
        float light = (0.42 * g4 * g4 + 0.035 * g + 0.5 * c) * edge * view;
        gl_FragColor = vec4(uColor * light * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(TROUGH.x, 0.6, TROUGH.z);
  mesh.renderOrder = 5;
  return { mesh, mat };
}
/** A vertical strip of the trough's light (the near sidewalk's section, the kerb's face): Gaussian along x; it only
 *  shows when it faces the eye (the section's view), never as a stripe seen grazing (the plunge, the kerb's close-up). */
function troughStrip(z, y0, y1, spill, uniforms, k = 1) {
  const h = y1 - y0 + 2 * spill;
  const geo = new THREE.PlaneGeometry(6 * TROUGH.ix, h, 60, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: uniforms.uColor, uAmount: uniforms.uAmount, uI: uniforms.uI },
    vertexShader: /* glsl */ `
      varying vec2 vQ;
      ${FACING}
      void main() { vQ = position.xy; vFace = facingOf(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uAmount; uniform vec2 uI; varying vec2 vQ; varying float vFace;
      void main() {
        float g = clamp(exp(-0.5 * (vQ.x / uI.x) * (vQ.x / uI.x)), 0.0, 1.0);
        float g2 = g * g; float g4 = g2 * g2;
        float y = vQ.y;
        float band = smoothstep(${(-h / 2).toFixed(1)}, ${(-h / 2 + spill + 0.01).toFixed(1)}, y) * (1.0 - smoothstep(${(h / 2 - spill - 0.01).toFixed(1)}, ${(h / 2).toFixed(1)}, y));
        float view = smoothstep(0.4, 0.75, vFace);
        float light = (0.75 * g4 + 0.12 * g) * mix(0.25, 1.0, band) * view * ${k.toFixed(2)};
        gl_FragColor = vec4(uColor * light * uAmount, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(TROUGH.x, (y0 + y1) / 2, z);
  mesh.renderOrder = 5;
  return mesh;
}

/* ═══════════════════════════════════════════ the street ═══════════════════════════════════════════ */
export function buildStreet() {
  const group = new THREE.Group();
  const panes = []; //  glass materials faded with `street`: [material, k]
  const inks = []; //   line objects faded with `street`
  const shell = (geo, order, o) => {
    const mat = glass(BRAND.ink, o);
    const mesh = new THREE.Mesh(geo, mat);
    asShell([mesh], order);
    panes.push([mat, 1]);
    return mesh;
  };
  const S = STREET;
  const W = S.walk;
  const C = S.carriage;

  /* ── the road and its sidewalks: lines, and glass only on the sidewalks (low rim: seen grazing, no pale slab) ── */
  const road = lines();
  const fine = lines();
  const walks = [[S.x0, -2600], [-1500, 600], [1700, S.x1]]; // broken by the two cross streets either side of the block
  for (const side of [1, -1]) {
    for (const [x0, x1] of walks) {
      const zIn = side * C;
      const zOut = side * W;
      const geo = box(x1 - x0, 75, W - C, 2.5);
      const m = shell(geo, ORDER.street, { base: 0, rim: 0.05, power: 3.2, edge: 0, through: 0 });
      m.position.set((x0 + x1) / 2, 15 - 37.5, side * (W + C) / 2);
      group.add(m);
      // the kerb (granite, 15 cm, 30 deep), the sidewalk's edges, its section
      road.seg(x0, 15, zIn, x1, 15, zIn).seg(x0, 0, zIn, x1, 0, zIn);
      fine.seg(x0, 15, zIn + side * 30, x1, 15, zIn + side * 30);
      road.seg(x0, 15, zOut, x1, 15, zOut).seg(x0, -60, zOut, x1, -60, zOut);
      fine.seg(x0, -8 + 15, zOut, x1, -8 + 15, zOut);
      road.rx(zIn, zOut, -60, 15, x0).rx(zIn, zOut, -60, 15, x1);
      if (side > 0) for (let x = x0 + 100; x < x1; x += 100) fine.seg(x, 0, zIn, x, 15, zIn); // the kerb stones' joints
    }
  }
  // the gutter at the kerb's foot: the road's level of origin, kept by a fine ink line (it never moves)
  road.seg(S.x0, 0, C - 22, S.x1, 0, C - 22);
  road.seg(S.x0, 0, -(C - 22), S.x1, 0, -(C - 22));
  // the road's section at its two ends: asphalt (8 cm) over its base (to −60)
  for (const x of [S.x0, S.x1]) road.rx(-C, C, -60, 0, x).seg(x, -8, -C, x, -8, C);
  // across the cross streets: the road's edge goes on, the sidewalks' ends turn
  for (const [x0, x1] of [[-2600, -1500], [600, 1700]]) for (const side of [1, -1]) fine.seg(x0, 0, side * W, x1, 0, side * W);
  inks.push(bake(road, 2, 0.55), bake(fine, 1.8, 0.3));

  // the paint: one-way, two lanes — the lane dashes (3 m, every 13 m), a pedestrian crossing by the corner
  const paint = quads();
  for (let x = S.x0 + 200; x < S.x1 - 300; x += 1300) paint.y(x, x + 300, -6, 6, 0.4, 0.34);
  for (let k = -3; k <= 3; k++) paint.y(-2250, -1850, k * 100 - 25, k * 100 + 25, 0.4, 0.26);
  const paintQ = paint.bake(4);
  group.add(paintQ.mesh);

  // three lamp posts on the far sidewalk (the decorator gives them their pools of light)
  const lamps = new THREE.Group();
  const lampGlowMats = [];
  for (const x of [-2300, 1250, 3900]) {
    const z = -(C + 45);
    const post = shell(cyl(6, 420, 0.5, 20, 4.5), ORDER.street, { base: 0, rim: 0.5, power: 2.4, edge: 0.4 });
    post.position.set(x, 15 + 210, z);
    const foot = shell(cyl(13, 70, 1, 20, 9), ORDER.street, { base: 0, rim: 0.45, power: 2.4, edge: 0.4 });
    foot.position.set(x, 15 + 35, z);
    const lantern = shell(cyl(11, 46, 1, 6, 19), ORDER.street, { base: 0, rim: 0.55, power: 2, edge: 0.5 });
    lantern.position.set(x, 15 + 420 + 30, z);
    const capGeo = cyl(21, 14, 1, 6, 4);
    const cap = shell(capGeo, ORDER.street, { base: 0, rim: 0.5, power: 2, edge: 0.4 });
    cap.position.set(x, 15 + 420 + 60, z);
    const bulbMat = glow(BRAND.ink, 1.5);
    lampGlowMats.push(bulbMat);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 10), bulbMat);
    bulb.position.set(x, 15 + 420 + 30, z);
    lamps.add(post, foot, lantern, cap, bulb);
  }
  group.add(lamps);

  /* ── the building: glass, its floors in lines, its windows lit at night ── */
  const B = BUILDING;
  const FZ = B.zFront;
  const H = B.levels * B.floor; // 2100: the cornice
  const bx = (B.x0 + B.x1) / 2;
  const bz = (B.zFront + B.zBack) / 2;
  const bd = B.zFront - B.zBack;
  const body = shell(box(B.x1 - B.x0, H, bd, 12), ORDER.building, { base: 0, rim: 0.16, power: 3, edge: 0.24, through: 0.12 });
  body.position.set(bx, H / 2, bz);
  const cellar = shell(box(B.x1 - B.x0, -B.cellar, bd, 6), ORDER.building, { base: 0, rim: 0.07, power: 3, edge: 0.12 });
  cellar.position.set(bx, B.cellar / 2, bz);
  // the mansard: a steep zinc slope with its dormers, a flat terrasson, the chimney stacks
  const RISE = B.roof - H - 30;
  const mansardProfile = [[-FZ + 10, H], [-FZ + 150, H + RISE], [-B.zBack - 150, H + RISE], [-B.zBack - 10, H]];
  const mansard = shell(plate(mansardProfile, B.x1 - B.x0, { bevel: 6, round: 1 }).rotateY(Math.PI / 2).translate(B.x0, 0, 0), ORDER.building, { base: 0, rim: 0.2, power: 2.6, edge: 0.3, through: 0.15 });
  group.add(body, cellar, mansard);

  const facade = lines(); // the building's structure: floors, cornice, balcony, mansard
  const frames = lines(); //  every window's frame
  const lit = quads(); //     the lit windows
  // the floors: a perimeter at every level, the cornice, the 2nd floor's band
  for (let k = 1; k <= B.levels; k++) facade.ry(B.x0, B.x1, B.zBack, FZ, k * B.floor);
  facade.rz(B.x0 - 25, B.x1 + 25, H - 22, H, FZ + 35).seg(B.x0 - 25, H, FZ + 35, B.x0 - 25, H, FZ).seg(B.x1 + 25, H, FZ + 35, B.x1 + 25, H, FZ);
  facade.seg(B.x0, 2 * B.floor - 14, FZ + 8, B.x1, 2 * B.floor - 14, FZ + 8);
  // the 5th floor's balcony, running the whole front (balcon filant): its slab, its rails, a post every 75 cm
  const by = 5 * B.floor;
  facade.rz(B.x0 + 20, B.x1 - 20, by - 12, by, FZ + 70).seg(B.x0 + 20, by, FZ + 70, B.x0 + 20, by, FZ).seg(B.x1 - 20, by, FZ + 70, B.x1 - 20, by, FZ);
  facade.seg(B.x0 + 24, by + 100, FZ + 66, B.x1 - 24, by + 100, FZ + 66).seg(B.x0 + 24, by + 14, FZ + 66, B.x1 - 24, by + 14, FZ + 66);
  for (let x = B.x0 + 24; x <= B.x1 - 24; x += 75) fine.seg(x, by, FZ + 66, x, by + 100, FZ + 66);
  // the mansard's lines
  const [p0, p1, p2, p3] = mansardProfile.map(([u, y]) => [-u, y]); // back to z
  for (const [z, y] of [p0, p1, p2, p3]) facade.seg(B.x0, y, z, B.x1, y, z);
  for (const x of [B.x0, B.x1]) facade.poly([[x, p0[1], p0[0]], [x, p1[1], p1[0]], [x, p2[1], p2[0]], [x, p3[1], p3[0]]]);
  // chimney stacks on the ridge (souches), their pots
  for (const [x, z] of [[-1300, -1180], [-560, -1320], [380, -1180]]) {
    const st = shell(box(110, 170, 60, 4), ORDER.building, { base: 0, rim: 0.2, power: 2.6, edge: 0.3 });
    st.position.set(x, H + RISE + 85, z);
    group.add(st);
    for (let k = -1; k <= 1; k++) facade.rz(x + k * 32 - 9, x + k * 32 + 9, H + RISE + 170, H + RISE + 200, z);
  }

  // the windows: 7 bays, French windows (two leaves, a transom), ground floor shopfronts and a carriage door
  const R = rng(4811);
  const bays = [-1320, -1020, -720, -420, -120, 180, 480]; // BEDROOM.window on bay 3
  const winW = 130;
  const winH = 220;
  const winOf = (x, y0, z = FZ) => {
    const x0 = x - winW / 2;
    const x1 = x + winW / 2;
    frames.rz(x0, x1, y0, y0 + winH, z + 2).seg(x, y0, z + 2, x, y0 + winH, z + 2).seg(x0, y0 + 0.74 * winH, z + 2, x1, y0 + 0.74 * winH, z + 2);
    return [x0, x1];
  };
  const fill = (x0, x1, y0, y1, k, style, z = FZ + 1) => {
    const xm = (x0 + x1) / 2;
    if (style === 1) lit.z(x0 + 4, xm, y0 + 4, y1 - 4, z, k, 0.62 * k); //             one leaf: a curtain drawn over the other
    else if (style === 2) lit.z(xm, x1 - 4, y0 + 4, y1 - 4, z, k, 0.62 * k);
    else if (style === 3) lit.z(x0 + 4, x1 - 4, y0 + 4, y0 + 0.55 * (y1 - y0), z, 0.8 * k, 0.6 * k); // a roller shutter half down
    else lit.z(x0 + 4, x1 - 4, y0 + 4, y1 - 4, z, k, 0.62 * k);
  };
  for (let f = 1; f < B.levels; f++)
    for (let i = 0; i < bays.length; i++) {
      const y0 = f * B.floor + 40;
      const [x0, x1] = winOf(bays[i], y0);
      if (f === 2 && i === 3) continue; // the bedroom's window: drawn apart
      const on = R() < 0.56 && !(f === 2 && i >= 2 && i <= 4);
      const k = 0.3 + 0.32 * R();
      const style = Math.floor(R() * 4);
      if (on) fill(x0, x1, y0, y0 + winH, k, style);
      if (f === 3) frames.rz(x0 - 6, x1 + 6, y0 - 4, y0 + 94, FZ + 14); // a wrought-iron sill guard on the 3rd
    }
  // the side front on the cross street (x = B.x0): four bays
  for (const z of [-820, -1100, -1380, -1660]) {
    for (let f = 1; f < B.levels; f++) {
      const y0 = f * B.floor + 40;
      frames.rx(z - winW / 2, z + winW / 2, y0, y0 + winH, B.x0 - 2).seg(B.x0 - 2, y0, z, B.x0 - 2, y0 + winH, z);
      if (R() < 0.5) lit.x(z - winW / 2 + 4, z + winW / 2 - 4, y0 + 4, y0 + winH - 4, B.x0 - 1, 0.24 + 0.3 * R(), 0.16);
    }
  }
  // the ground floor: a carriage door (arched), shopfronts, their shutters down for the night
  {
    const x = bays[1];
    const arc = [];
    for (let k = 0; k <= 16; k++) {
      const a = Math.PI * (k / 16);
      arc.push([x + 125 * Math.cos(a), 210 + 70 * Math.sin(a), FZ + 2]);
    }
    frames.poly([[x + 125, 0, FZ + 2], ...arc, [x - 125, 0, FZ + 2]]).seg(x, 0, FZ + 2, x, 280, FZ + 2);
    lit.z(x - 116, x + 116, 4, 200, FZ + 1, 0.16, 0.1); // the hall's night light through the door's glass
    for (const i of [0, 2]) {
      const x0 = bays[i] - 135;
      const x1 = bays[i] + 135;
      frames.rz(x0, x1, 10, 250, FZ + 2);
      for (let y = 40; y < 250; y += 42) fine.seg(x0, y, FZ + 3, x1, y, FZ + 3); // the rolling shutter, down for the night
    }
    // a shop's long window on bays 3 → 6, dark, its glazing bars
    frames.rz(bays[3] - 135, bays[6] + 135, 10, 255, FZ + 2).seg(bays[3] - 135, 215, FZ + 2, bays[6] + 135, 215, FZ + 2);
    for (let i = 3; i < 6; i++) frames.seg((bays[i] + bays[i + 1]) / 2, 10, FZ + 2, (bays[i] + bays[i + 1]) / 2, 255, FZ + 2);
  }
  // the dormers on the mansard's slope, every bay
  for (let i = 0; i < bays.length; i++) {
    const x = bays[i];
    const z = FZ - 60;
    const y0 = H + 50;
    frames.rz(x - 55, x + 55, y0, y0 + 150, z).poly([[x - 70, y0 + 150, z + 6], [x, y0 + 210, z + 6], [x + 70, y0 + 150, z + 6]]);
    frames.seg(x - 55, y0, z, x - 55, y0, z - 90).seg(x + 55, y0, z, x + 55, y0, z - 90);
    if (R() < 0.42) lit.z(x - 45, x + 45, y0 + 8, y0 + 142, z - 1, 0.28 + 0.2 * R(), 0.18);
  }
  inks.push(bake(facade, 2, 0.5), bake(frames, 1.8, 0.42));
  const litQ = lit.bake(4);
  group.add(litQ.mesh);

  /* ── the bedroom on the 2nd floor: 022's chambre against the front, its window drawn brighter ── */
  const chambre = buildChambre();
  chambre.group.position.set(BEDROOM.at[0], BEDROOM.at[1], FZ - ROOM.z1 - 8);
  group.add(chambre.group);
  const bw = lines();
  {
    const [wx, wy] = BEDROOM.window;
    const y0 = wy - winH / 2;
    bw.rz(wx - winW / 2, wx + winW / 2, y0, y0 + winH, FZ + 3).seg(wx, y0, FZ + 3, wx, y0 + winH, FZ + 3).seg(wx - winW / 2, y0 + 0.74 * winH, FZ + 3, wx + winW / 2, y0 + 0.74 * winH, FZ + 3);
    bw.rz(wx - winW / 2 - 8, wx + winW / 2 + 8, y0 - 8, y0 + winH + 8, FZ + 5);
  }
  const bedFrame = bake(bw, 2.4, 1, BRAND.ink, { hdr: 1.5 });
  group.add(bedFrame);
  const bedLight = quads();
  bedLight.z(BEDROOM.window[0] - winW / 2 + 4, BEDROOM.window[0] + winW / 2 - 4, BEDROOM.window[1] - winH / 2 + 4, BEDROOM.window[1] + winH / 2 - 4, FZ + 1, 0.04, 0.07);
  const bedQ = bedLight.bake(4);
  group.add(bedQ.mesh);

  /* ── 011's car, nose toward −x, in the near lane; its wheels turn with carX ── */
  const car = buildCar();
  const carHolder = new THREE.Group();
  carHolder.rotation.y = Math.PI / 2;
  carHolder.add(car.group);
  const carAt = new THREE.Group();
  carAt.position.set(0, CAR.y, CAR.z);
  carAt.add(carHolder);
  group.add(carAt);
  const wheels = car.fx?.wheels ?? [];

  /* ── the settlement trough ── */
  const tr = troughSurface();
  group.add(tr.mesh);
  const strips = [troughStrip(W + 2, -60, 15, 12, tr.mat.uniforms, 0.8), troughStrip(C - 1, 0, 15, 3, tr.mat.uniforms, 0.35)];
  group.add(...strips);

  /* ── the settlement gauge: a staff on the near kerb, magnified ×50 ── */
  const ruler = new THREE.Group();
  ruler.position.set(...RULER.at);
  ruler.rotation.y = (-30 * Math.PI) / 180; // its face turned toward the camera's side (az −20 … −50)
  const rulerMats = [];
  const keep = (m) => (rulerMats.push(m), m);
  const tex = staffTexture();
  const face = keep(solid(0xffffff, { rough: 0.55 }));
  face.map = tex;
  face.emissive = new THREE.Color(0xffffff);
  face.emissiveMap = tex;
  face.emissiveIntensity = 0.55;
  face.userData.finish = false;
  const side = keep(solid(0x3a4046, { rough: 0.5, metal: 0.2 }));
  const staff = new THREE.Mesh(new THREE.BoxGeometry(STAFF.w, RULER.height, STAFF.t), [side, side, side, side, face, side]);
  staff.position.y = RULER.height / 2 + 3;
  const footMat = keep(solid(0x50565c, { rough: 0.6, metal: 0.3 }));
  const foot = new THREE.Mesh(box(26, 3, 18, 0.6), footMat);
  foot.position.y = 1.5;
  ruler.add(staff, foot);
  // the index: a carriage clamped on the staff's edges, a hairline across its face, a pointer; its arm and rod to the road
  const index = new THREE.Group();
  const clampMat = keep(solid(0x9a9fa4, { rough: 0.45, metal: 0.3 }));
  for (const sx of [-1, 1]) {
    const jaw = new THREE.Mesh(box(2.4, 3.2, STAFF.t + 2.4, 0.4), clampMat);
    jaw.position.set(sx * (STAFF.w / 2 + 1.2), 0, 0);
    index.add(jaw);
  }
  const hairMat = glow(BRAND.ink, 2.4);
  const hair = new THREE.Mesh(new THREE.BoxGeometry(STAFF.w + 1, 0.55, 0.3), hairMat);
  hair.position.z = STAFF.t / 2 + 0.25;
  const tipShape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(4.2, 2), new THREE.Vector2(4.2, -2)]);
  const tip = new THREE.Mesh(new THREE.ShapeGeometry(tipShape), hairMat);
  tip.position.set(STAFF.w / 2 + 2.5, 0, STAFF.t / 2 + 0.3);
  const ROD = { x: 12, z: -64.7 }; // behind and to the right: its foot lands on the road, just past the kerb
  const armLen = Math.hypot(ROD.x - STAFF.w / 2, ROD.z);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(armLen, 1.2, 1.2), clampMat);
  arm.position.set((STAFF.w / 2 + ROD.x) / 2, 0, ROD.z / 2);
  arm.rotation.y = Math.atan2(-ROD.z, ROD.x - STAFF.w / 2);
  index.add(hair, tip, arm);
  ruler.add(index);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1, 10).translate(0, 0.5, 0), clampMat);
  rod.position.set(ROD.x, -RULER.at[1], ROD.z);
  const nail = new THREE.Mesh(cyl(2.4, 1.2, 0.3, 16), clampMat);
  nail.position.set(ROD.x, -RULER.at[1] + 0.6, ROD.z);
  ruler.add(rod, nail);
  group.add(ruler);
  const indexY = (mm) => 3 + STAFF.zero - (RULER.gain / 10) * Math.max(-1.6, Math.min(RULER.max, mm));

  /* ── the town from above: Haussmann blocks round their courtyards, lit windows, street lamps ── */
  const town = new THREE.Group();
  const T = rng(4812);
  const XMAX = Math.max(16000, TOWN.x1 + 4000);
  const ZMIN = Math.min(-20000, TOWN.z0 - 11000);
  const ZMAX = TOWN.z1;
  const cols = [[B.x0, B.x1]]; // the home block's column is the building's
  for (let x = B.x1, first = true; x < XMAX; first = false) {
    const st = first ? 1100 : 900 + 400 * T();
    const w = 2200 + 1300 * T();
    cols.push([x + st, x + st + w]);
    x += st + w;
  }
  for (let x = B.x0, first = true; x > -XMAX; first = false) {
    const st = first ? 1100 : 900 + 400 * T();
    const w = 2200 + 1300 * T();
    cols.unshift([x - st - w, x - st]);
    x -= st + w;
  }
  const rows = [];
  for (let z = -W, first = true; z > ZMIN; first = false) {
    const d = first ? 2600 : 2200 + 1200 * T();
    rows.push([z - d, z, first ? -1 : 0]);
    z -= d + 900 + 400 * T();
  }
  for (let z = W, first = true; z < ZMAX; first = false) {
    const d = 2200 + 1200 * T();
    rows.push([z, z + d, first ? 1 : 0]);
    z += d + 900 + 400 * T();
  }
  const townGeos = [];
  const townLines = lines();
  const winPts = [];
  const winCol = [];
  const wing = (x0, x1, z0, z1, h) => {
    townGeos.push(new THREE.BoxGeometry(x1 - x0, h, z1 - z0).translate((x0 + x1) / 2, h / 2, (z0 + z1) / 2));
    townLines.ry(x0, x1, z0, z1, h);
    townLines.ry(x0 + 130, x1 - 130, z0 + 130, z1 - 130, h + 280); // the mansard's break, set back
    townLines.seg(x0, h, z1, x0 + 130, h + 280, z1 - 130).seg(x1, h, z1, x1 - 130, h + 280, z1 - 130).seg(x0, h, z0, x0 + 130, h + 280, z0 + 130).seg(x1, h, z0, x1 - 130, h + 280, z0 + 130);
    townLines.seg(x0, 0, z1, x0, h, z1).seg(x1, 0, z1, x1, h, z1).seg(x0, 0, z0, x0, h, z0);
    // the faces toward the camera's side (+z, −x): a few lit windows
    for (let y = 340; y < h - 150; y += 300) {
      for (let x = x0 + 150; x < x1 - 100; x += 300) if (T() < 0.26) {
        winPts.push(x, y, z1 + 3);
        const k = 0.5 + 0.4 * T();
        winCol.push(INK.r * k, INK.g * k, INK.b * k);
      }
      for (let z = z0 + 150; z < z1 - 100; z += 300) if (T() < 0.26) {
        winPts.push(x0 - 3, y, z);
        const k = 0.45 + 0.35 * T();
        winCol.push(INK.r * k, INK.g * k, INK.b * k);
      }
    }
  };
  const height = () => 1800 + 100 * Math.floor(7 * T());
  for (const [x0, x1] of cols)
    for (const [z0, z1, near] of rows) {
      const home = x0 === B.x0 && near === -1;
      const D = 1150; // a wing's depth
      const wide = x1 - x0 > 2 * D + 500 && z1 - z0 > 2 * D + 500;
      if (!wide) {
        wing(x0, x1, z0, z1, height());
        continue;
      }
      if (!home) wing(x0, x1, z1 - D, z1, height()); //       the front on the street (the home block's is the building)
      wing(x0, x1, z0, z0 + D, height()); //                   the back
      wing(x0, x0 + D, z0 + D, z1 - D, height()); //            the sides, round the courtyard
      wing(x1 - D, x1, z0 + D, z1 - D, height());
    }
  const townMesh = new THREE.Mesh(mergeGeometries(townGeos), glass(BRAND.ink, { base: 0.004, rim: 0.2, power: 2.4, edge: 0.3, through: 0.12 }));
  asShell([townMesh], ORDER.town);
  const townGlass = townMesh.material;
  const townInk = bake(townLines, 1.8, 0.45);
  const pointsOf = (p, c, size) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    const mat = new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    const pts = new THREE.Points(geo, mat);
    pts.renderOrder = 4;
    return pts;
  };
  const townWins = pointsOf(winPts, winCol, 3);
  // the street lamps along every street, out past the blocks into the dark
  const lampPts = [];
  const lampCol = [];
  const lampAt = (x, z, far) => {
    lampPts.push(x, 450, z);
    const k = 1.3 * Math.exp(-far / 30000);
    lampCol.push(INK.r * k, INK.g * k, INK.b * k);
  };
  for (let i = 0; i < cols.length - 1; i++) {
    const xs = (cols[i][1] + cols[i + 1][0]) / 2; // a cross street
    for (let z = ZMIN - 8000; z < ZMAX; z += 2400) if (Math.abs(z) > W + 200) lampAt(xs, z + 300 * T(), Math.hypot(xs, z));
  }
  for (let j = 0; j < rows.length; j++) {
    const [z0, z1] = rows[j];
    const zs = z0 < 0 ? z0 - 500 : z1 + 500; // the street beyond each row
    for (let x = -XMAX - 8000; x < XMAX + 8000; x += 2400) lampAt(x + 300 * T(), zs, Math.hypot(x, zs));
  }
  const townLamps = pointsOf(lampPts, lampCol, 3.8);
  town.add(townMesh, townInk, townWins, townLamps);
  town.visible = false;
  group.add(town);

  /* ── the tunnel's trace under the town: from the machine back along its way, to the launch shaft ── */
  const AY = TBM.axisY;
  const path = [];
  for (let x = 0; x <= 9000; x += 300) path.push([x, AY, 0]);
  const RC = 15000;
  for (let k = 1; k <= 20; k++) {
    const a = 0.45 * (k / 20);
    path.push([9000 + RC * Math.sin(a), AY, -RC + RC * Math.cos(a)]);
  }
  {
    const [ex, , ez] = path[path.length - 1];
    for (let k = 1; k <= 20; k++) path.push([ex + 6000 * (k / 20) * Math.cos(0.45), AY, ez - 6000 * (k / 20) * Math.sin(0.45)]);
  }
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2]));
  const total = cum[cum.length - 1];
  const traceGeo = new LineGeometry();
  traceGeo.setPositions(path.flat());
  const traceMat = lineMat(BRAND.veille, 6, { dashed: true, dashSize: 520, gapSize: 320, hdr: 1.4 });
  const trace = new Line2(traceGeo, traceMat);
  trace.computeLineDistances();
  trace.renderOrder = 3;
  trace.visible = false;
  const spotTex = spotTexture();
  const traceHead = spot(spotTex, BRAND.veille, 1.6, 1100);
  traceHead.visible = false;
  // the launch shaft at the trace's far end: a ring at the street, its walls down to the tunnel
  const shaft = lines();
  const [sx, , sz] = path[path.length - 1];
  const ring = [];
  for (let k = 0; k < 32; k++) ring.push([sx + 900 * Math.cos((k / 32) * Math.PI * 2), 0, sz + 900 * Math.sin((k / 32) * Math.PI * 2)]);
  shaft.poly(ring, true);
  shaft.poly(ring.map(([x, , z]) => [x, AY - 500, z]), true);
  for (let k = 0; k < 32; k += 8) shaft.seg(ring[k][0], 0, ring[k][2], ring[k][0], AY - 500, ring[k][2]);
  const shaftInk = bake(shaft, 2.2, 0.8, BRAND.veille);
  shaftInk.visible = false;
  group.add(trace, traceHead, shaftInk);

  /* ── the night sky: still stars, the satellite and its trail ── */
  const sky = new THREE.Group();
  const starPos = [];
  const starCol = [];
  {
    const r = rng(4813);
    for (let i = 0; i < 320; i++) {
      const az = r() * Math.PI * 2;
      const el = Math.asin(0.18 + 0.82 * r()); // more of them high up, none on the roofs
      const R2 = 200000;
      starPos.push(R2 * Math.cos(el) * Math.cos(az), R2 * Math.sin(el), R2 * Math.cos(el) * Math.sin(az) - 20000);
      const k = 0.45 + 0.9 * Math.pow(r(), 2.2);
      starCol.push(INK.r * k, INK.g * k, INK.b * k);
    }
  }
  const stars = pointsOf(starPos, starCol, 3.2);
  const sat = new THREE.Group();
  {
    const bus = new THREE.Mesh(box(200, 200, 240, 12), solid(0x9ea4aa, { rough: 0.45, metal: 0.35 }));
    const wingMat = solid(0x323a42, { rough: 0.35, metal: 0.3 });
    const wingGrid = lines();
    for (const s of [-1, 1]) {
      const panel = new THREE.Mesh(box(240, 6, 640, 2), wingMat);
      panel.position.set(0, 0, s * (120 + 60 + 320));
      const strut = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 60), solid(0x7a8086, { rough: 0.5, metal: 0.3 }));
      strut.position.set(0, 0, s * 150);
      sat.add(panel, strut);
      for (let k = 0; k <= 4; k++) wingGrid.seg(-120 + 60 * k, 4, s * 180, -120 + 60 * k, 4, s * 820);
      for (let k = 0; k <= 8; k++) wingGrid.seg(-120, 4, s * (180 + 80 * k), 120, 4, s * (180 + 80 * k));
    }
    const dish = new THREE.Mesh(cyl(70, 20, 2, 32, 30), solid(0xc8ccd0, { rough: 0.5, metal: 0.2 }));
    dish.position.set(0, -130, 0);
    sat.add(bus, dish, bake(wingGrid, 1.8, 0.4));
  }
  const satHeart = spot(spotTex, BRAND.ink, 2.2, 2600);
  sat.add(satHeart);
  // the trail: a ribbon along the way, lit behind the satellite and fading over a fifth of it
  const S0 = new THREE.Vector3(...SKY.from);
  const S1 = new THREE.Vector3(...SKY.to);
  const way = S0.distanceTo(S1);
  const trailMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uColor: { value: INK.clone().multiplyScalar(1.6) }, uHead: { value: 0 }, uAmount: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uHead, uAmount; varying vec2 vUv;
      void main() {
        float behind = uHead - vUv.x;
        float a = step(0.0, behind) * exp(-max(behind, 0.0) / 0.2) * smoothstep(0.0, 0.004, behind);
        float across = 1.0 - pow(abs(2.0 * vUv.y - 1.0), 2.0);
        gl_FragColor = vec4(uColor * a * across * uAmount, 1.0);
      }`,
  });
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(way, 300, 64, 1).rotateX(-Math.PI / 2), trailMat);
  trail.position.copy(S0).lerp(S1, 0.5);
  trail.rotation.y = -Math.atan2(S1.z - S0.z, S1.x - S0.x);
  trail.renderOrder = 5;
  sky.add(stars, trail, sat);
  sky.visible = false;
  group.add(sky);

  /* ── anchors ── */
  const A = {
    car: anchor(carAt, 0, 80, 0),
    carRoof: anchor(carAt, 0, 150, 0),
    ruler: anchor(ruler, 0, 3 + RULER.height / 2, 0),
    rulerIndex: index,
    trough: anchor(group, TROUGH.x, 0, TROUGH.z),
    building: anchor(group, bx, H * 0.5, FZ),
    roof: anchor(group, bx, B.roof, bz),
    bedroom: chambre.anchors?.head ?? anchor(chambre.group, 0, 80, 0),
    window: anchor(group, ...BEDROOM.window),
    town: anchor(group, 0, 0, 0),
    sat,
  };

  const lineBase = inks.map((o) => o.material.opacity);
  for (const o of inks) group.add(o);
  const room = { room: 1, fade: 0, shell: 1, you: 1, cloth: 1, pillow: 0, trapped: 0, plug: 0, charge: 0, place: 1, heat: 0, ranks: 0, recall: 0 };
  const carState = { shell: 1, wall: 0, you: 1 };
  const dress = dressStreet(); group.add(dress.group);

  return {
    group, A, car,
    update(p = {}, time = 0, px = 1) {
      const sh = clamp01(p.street ?? 1);
      for (let i = 0; i < panes.length; i++) panes[i][0].uniforms.uAmount.value = sh * panes[i][1];
      for (let i = 0; i < inks.length; i++) inks[i].material.opacity = lineBase[i] * sh;
      paintQ.mat.opacity = sh;
      for (let i = 0; i < lampGlowMats.length; i++) lampGlowMats[i].opacity = sh;
      lamps.visible = sh > 0.003;
      dress.update(p, time, px);

      // the car, its wheels rolling with it
      const cx = p.carX ?? 0;
      carAt.position.x = cx;
      carState.shell = sh;
      carState.you = sh > 0.5 ? 1 : 0;
      car.update(carState, time, px);
      for (let i = 0; i < wheels.length; i++) wheels[i].rotation.x = cx / WHEEL_R;

      // the trough: its light from the first millimetre, true-scale sink (or heave) of the road
      const mm = p.settle ?? 0;
      const amt = Math.pow(clamp01(Math.abs(mm) / 10), 0.6) * smooth(0, 0.3, Math.abs(mm)) * sh;
      tr.mat.uniforms.uAmount.value = amt;
      tr.mat.uniforms.uSink.value = 0.1 * mm;
      tr.mesh.visible = strips[0].visible = strips[1].visible = amt > 0.002;

      // the gauge
      const rv = clamp01(p.ruler ?? 0) * sh;
      ruler.visible = rv > 0.01;
      if (ruler.visible) {
        for (let i = 0; i < rulerMats.length; i++) {
          rulerMats[i].opacity = rv;
          rulerMats[i].transparent = rv < 0.999;
        }
        const iy = indexY(mm);
        index.position.y = iy;
        rod.scale.y = Math.max(0.01, iy + RULER.at[1]);
        setGlow(hairMat, mm >= RULER.red - 0.05 ? 3 : 2.4, mm >= RULER.red - 0.05 ? SIGNAL : INK);
        hairMat.opacity = rv;
        hairMat.transparent = rv < 0.999;
      }

      // the windows at night, the bedroom
      const lt = clamp01(p.lights ?? 1) * sh;
      litQ.mat.opacity = lt;
      litQ.mesh.visible = lt > 0.003;
      const sl = clamp01(p.sleeper ?? 0) * sh;
      room.fade = sl;
      chambre.update(room, time, px);
      bedFrame.material.opacity = 0.42 + 0.58 * sl;
      bedFrame.visible = sh > 0.003;
      bedQ.mat.opacity = sl;
      bedQ.mesh.visible = sl > 0.003;

      // the town
      const tw = clamp01(p.town ?? 0);
      town.visible = tw > 0.003;
      if (town.visible) {
        townGlass.uniforms.uAmount.value = tw;
        townInk.material.opacity = 0.45 * tw;
        townWins.material.opacity = tw;
        townLamps.material.opacity = tw;
      }

      // the trace, drawn from the machine back along its way; its head of light runs ahead
      const tc = clamp01(p.trace ?? 0);
      trace.visible = tc > 0.002;
      traceHead.visible = trace.visible && tc < 0.999;
      shaftInk.visible = tc > 0.97;
      if (trace.visible) {
        const L = tc * total;
        let i = 1;
        while (i < cum.length - 1 && cum[i] < L) i++;
        const f = clamp01((L - cum[i - 1]) / Math.max(1, cum[i] - cum[i - 1]));
        traceGeo.instanceCount = Math.max(1, i - 1 + (f > 0.5 ? 1 : 0));
        traceHead.position.set(path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f, AY, path[i - 1][2] + (path[i][2] - path[i - 1][2]) * f);
        traceMat.opacity = smooth(0, 0.04, tc);
        shaftInk.material.opacity = 0.8 * smooth(0.97, 1, tc);
      }

      // the sky
      const sv = p.sat ?? 0;
      sky.visible = sv > 0.001;
      if (sky.visible) {
        const fade = smooth(0, 0.05, sv);
        stars.material.opacity = fade;
        sat.position.lerpVectors(S0, S1, clamp01(sv));
        trailMat.uniforms.uHead.value = clamp01(sv);
        trailMat.uniforms.uAmount.value = fade;
        satHeart.material.opacity = fade * (0.9 + 0.1 * Math.sin(time * 0.7));
      }
    },
  };
}
