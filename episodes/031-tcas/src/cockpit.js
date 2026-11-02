// DOSSIER 031 — the flight deck, the planes' lights and the waves between the two planes.
//
//   buildCockpit({ other })  → { root, A, update(P, time, px) }   ONE plane's flight deck like an X-ray, in that
//                               plane's frame (023's: nose −x, up +y, left +z — root at the plane's origin, all from
//                               plan.js DECK and BAY). Mounted twice: in your plane (other false) and in his (true).
//     builds: the glare shield and the panel (the screens are tcas.js's, mounted by world.js on the panel), the
//     consoles, the pedestal, the two seats, the two pilots of glass (kit figure, seated, real hands: the captain's
//     left hand holds his side stick), the two side sticks (SOLID), the avionics bay under the floor with the
//     processor and the transponder (small solids), the coax up to the crown antenna, and the processor's veille
//     CORE (a sprite: a bright heart and a long tail, sized in the world but never under a few pixels — it reads
//     from 200 m). The plane's lights: two landing lights in the wing roots and the nose one (ink, aimed forward:
//     they dazzle head-on, a thin horizontal flare, never a disc), the beacon on the crown and the belly (signal, a
//     slow breath, one a second).
//     P = { shell, crew, pull, cores, lights }
//     A = { cpu, xpdr, stick, hand, eyeL, eyeR, panelL, panelR, beacon, landing }   (anchors, plane frame)
//   buildOndes()             → { group, update(P, time, px) }      the waves, in the WORLD frame (your plane's)
//     ping   one interrogation a second: a RING flies from your crown antenna to his, opening as it goes (2.5 m → 30 m
//            whatever the gap: it closes round him like a lasso), two paler echoes behind it; his reply flies back.
//     coord  a veille head and its trail from your processor to his (« je monte ») · answer: the way back.
//     link   a fine veille line between the processors, breathing slowly, two slow heads crossing on it (the fall).
//     atc    the controller's « descends »: a signal ring rising from the ground (atcFrom) to your plane (0 → 1),
//            then opening and fading on you (1 → 2).
//     P = { ping, coord, answer, link, atc, mood, a, b, ca, cb, atcFrom }
//         a, b: THREE.Vector3 — your crown antenna, his · ca, cb: your processor, his · atcFrom: where the ground's
//         wave starts (world.js fills them every frame; never kept, nothing allocated in update)
// Nothing here is written, no logo, no company. Lines and glows draw under render order 9: they show through glass.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, anchor, box, edgesOf, fatLine } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { DECK, BAY, OTHER, WAVES, ANT } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);
/** Where in its second the interrogation is at time 0: the first frame already shows a ring on its way (0.6 of its flight). */
const PHASE = 0.3;
const cycle = (time) => (((time / WAVES.period + PHASE) % 1) + 1) % 1;

/* ─────────────────────────────────────────────────────────── a light that has a place
   A quad that always faces the eye. Its size is in the world (`world`, cm: the halo's radius) but clamped in PIXELS
   (`min`, `max`) — far off it stays a readable point, close it grows, never past `max`. A gaussian heart (`core`, a
   fraction of the radius), a long tail, an optional thin horizontal flare (`streak`, `aspect` its length in radii).
   `dir` > 0: aimed along `axis` (the object's frame) — full facing it, 1 − dir from behind. Additive, unfogged. */
const QUAD = new THREE.PlaneGeometry(2, 2);
function glowSprite({ color, k = 2, world = 100, min = 4, max = 200, core = 0.16, tail = 0.5, streak = 0, aspect = 1, dir = 0, axis = [0, 1, 0], depthTest = true, order = 4 }) {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) }, uK: { value: k }, uAmount: { value: 0 }, uWorld: { value: world },
      uMin: { value: min }, uMax: { value: max }, uFocal: { value: 1000 }, uCore: { value: core }, uTail: { value: tail },
      uStreak: { value: streak }, uAspect: { value: aspect }, uDir: { value: dir }, uAxis: { value: new THREE.Vector3(...axis).normalize() },
    },
    vertexShader: /* glsl */ `
      uniform float uWorld, uMin, uMax, uFocal, uAspect; uniform vec3 uAxis;
      varying vec2 vQ; varying float vFace; varying float vPx;
      void main() {
        vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float dist = max(1.0, -c.z);
        float focal = max(uFocal, 1.0);
        float rpx = clamp(uWorld * focal / dist, uMin, uMax);
        vPx = rpx;
        vec3 ax = normalMatrix * uAxis;
        vec3 toEye = -c.xyz;
        vFace = dot(ax / max(length(ax), 1e-4), toEye / max(length(toEye), 1e-3));
        vQ = vec2(position.x * uAspect, position.y);
        c.xy += vQ * rpx * dist / focal;
        gl_Position = projectionMatrix * c;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uK, uAmount, uCore, uTail, uStreak, uAspect, uDir;
      varying vec2 vQ; varying float vFace; varying float vPx;
      void main() {
        float r = length(vQ);
        float rr = r / max(uCore, 1e-3);
        float heart = exp(-rr * rr);
        float tail = exp(-r * 3.4) * (1.0 - smoothstep(0.5, 1.0, r));
        float st = 0.0;
        if (uStreak > 0.0) {
          float along = clamp(1.0 - abs(vQ.x) / max(uAspect, 1e-3), 0.0, 1.0);
          st = uStreak * exp(-abs(vQ.y) * vPx / 1.4) * along * along;
        }
        float face = mix(1.0 - uDir, 1.0, smoothstep(-0.1, 0.85, vFace));
        float light = (heart + tail * uTail + st) * uK * uAmount * face;
        if (light < 0.002) discard;
        gl_FragColor = vec4(uColor * light, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(QUAD, mat);
  mesh.frustumCulled = false; // its bounds are the quad's, not the halo's
  mesh.renderOrder = order;
  return mesh;
}
/** Light a sprite: how much (0 hides it), and the lens's focal length in pixels (stage.pixelScale()). */
function lightSprite(mesh, amount, px) {
  mesh.visible = amount > 0.002;
  mesh.material.uniforms.uAmount.value = amount;
  mesh.material.uniforms.uFocal.value = px;
}

/* ─────────────────────────────────────────────────────────── the deck */

// three greys: the hero part lightest
const G_HERO = 0xaeb4b8;
const G_MID = 0x737a80;
const G_DARK = 0x3f4549;
const grey = (v, o = {}) => solid(v, { rough: 0.55, metal: 0.25, ...o });

export function buildCockpit({ other = false } = {}) {
  const root = new THREE.Group();
  const A = {};
  const lineMats = []; // the deck's fine lines: they fade with the shell
  const edges = (geo, mesh, opacity = 0.32) => {
    const e = edgesOf(geo, { width: 1.8, opacity });
    e.position.copy(mesh.position);
    e.rotation.copy(mesh.rotation);
    lineMats.push(e.material);
    root.add(e);
    return e;
  };

  /* ── the furniture, like an X-ray: one shell (order 16 — inside the fuselage's 20, over the pilots' 10) ── */
  const shellMat = glass(BRAND.ink, { base: 0, rim: 0.16, power: 2.8, edge: 0.42, spec: 0.2, through: 0.2 });
  const furniture = [];
  const piece = (geo, x, y, z, { rz = 0, ry = 0, lines = 0.32 } = {}) => {
    const m = new THREE.Mesh(geo, shellMat);
    m.position.set(x, y, z);
    m.rotation.set(0, ry, rz);
    root.add(m);
    furniture.push(m);
    if (lines) edges(geo, m, lines);
    return m;
  };
  // the glare shield: a brow across the deck, its lip over the panel (side profile extruded along z)
  {
    const { x, y, w } = DECK.shield;
    const s = new THREE.Shape();
    const pts = [[-25, -2], [-25, 4], [8, 6], [22, 2], [22, -5], [8, -6], [-15, -8]];
    s.moveTo(x + pts[0][0], y + pts[0][1]);
    for (const [px, py] of pts.slice(1)) s.lineTo(x + px, y + py);
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    geo.translate(0, 0, -w / 2);
    geo.computeVertexNormals();
    piece(geo, 0, 0, 0, { lines: 0.42 });
    // the flight control unit on its face: a strip, nothing written
    piece(box(1.6, 6, 70, 0.4), x + 23.2, y - 1.5, 0, { lines: 0.28 });
  }
  // the main panel, leaning back like the screens (world.js puts them on its face: x = panel.x, faces +x)
  {
    const { x, y, tilt } = DECK.panel;
    const t = tilt * DEG;
    const back = 5.5; // its face 5.5 cm behind the screens' plane: their bezels have room
    piece(box(5, 50, 196, 1), x - back * Math.cos(t) - 2.5, y - back * Math.sin(t) + 2, 0, { rz: t, lines: 0.36 });
    // the knee panel under it, and the two centre displays (outlines only: not the system)
    piece(box(5, 40, 150, 1), x - 9, y - 46, 0, { lines: 0.22 });
    for (const yy of [y + 1, y - 21]) piece(box(1.4, 18, 19, 0.4), x - 2 + (yy - y) * Math.tan(t) * 0.5, yy, 0, { rz: t, lines: 0.3 });
  }
  // the pedestal between the seats, two thrust levers on it
  piece(box(120, 46, 34, 2), -2612, DECK.floor + 23, 0, { lines: 0.26 });
  for (const z of [-5, 5]) piece(box(2, 13, 2.4, 0.5), -2628, DECK.floor + 50, z, { rz: -18 * DEG, lines: 0.32 });
  // the side consoles (the sticks stand on them) and the seats
  const consoleTop = DECK.stick.y - 3;
  for (const s of [1, -1]) {
    const h = consoleTop - DECK.floor;
    piece(box(170, h, 26, 2), -2568, DECK.floor + h / 2, s * DECK.stick.z, { lines: 0.28 });
    // an armrest pad behind the stick
    piece(box(30, 4, 11, 1.4), DECK.stick.x + 32, consoleTop + 3, s * (DECK.stick.z - 2), { lines: 0.3 });
  }
  const SEAT = { x: DECK.seat.x - 8, z: DECK.seat.z + 3, hip: 12 }; // the pilot sits a hair aft and outboard: his hand reaches the stick
  for (const s of [1, -1]) {
    const z = s * SEAT.z;
    piece(box(46, 9, 46, 2.5), SEAT.x + 3, SEAT.hip - 12, z, { lines: 0.3 });
    piece(box(8, 64, 44, 2.5), SEAT.x + 26, SEAT.hip + 24, z, { rz: -12 * DEG, lines: 0.3 });
    piece(box(7, 17, 24, 2.5), SEAT.x + 34, SEAT.hip + 66, z, { rz: -12 * DEG, lines: 0.3 });
    piece(box(30, SEAT.hip - 16 - DECK.floor, 26, 2), SEAT.x + 6, (SEAT.hip - 16 + DECK.floor) / 2, z, { lines: 0.2 });
  }
  asShell(furniture, 16);
  // the deck's floor: its outline (an X-ray has no solid floor)
  {
    const y = DECK.floor;
    const f = fatLine([[-2690, y, -132], [-2470, y, -132], [-2470, y, 132], [-2690, y, 132], [-2690, y, -132]], { color: BRAND.ink, width: 1.8, opacity: 0.22 });
    lineMats.push(f.material);
    root.add(f);
  }

  /* ── the two side sticks: SOLID (the base, the boot, the grip — the grip the lightest) ── */
  const gripMat = grey(G_HERO, { rough: 0.5 });
  const bootMat = grey(G_DARK, { rough: 0.8, metal: 0.05 });
  const baseMat = grey(G_MID);
  gripMat.userData.finish = bootMat.userData.finish = false; // moulded: no machining grain (it read as a beehive)
  const lathe = (pts) => {
    const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 40);
    g.computeVertexNormals();
    return g;
  };
  const GRIP_TILT = 9 * DEG; // the grip leans forward
  const GRIP_AT = 10.5; //       where the hand's palm closes on it, along its axis
  const bootGeo = lathe([[0, 0], [5, 0], [4.6, 1.4], [3, 3.2], [1.4, 4.6], [0, 4.8]]);
  const gripGeo = lathe([[0, 4], [1.3, 4.2], [1.9, 6], [2.35, 9], [2.5, 12], [2.25, 15], [1.9, 16.6], [1.2, 17.4], [0, 17.6]]);
  const sticks = [1, -1].map((s) => {
    const base = new THREE.Mesh(box(13, 3, 13, 0.6), baseMat);
    base.position.set(DECK.stick.x, consoleTop + 1.5, s * DECK.stick.z);
    const be = edgesOf(base.geometry, { width: 1.8, opacity: 0.5 });
    be.position.copy(base.position);
    root.add(base, be);
    const pivot = new THREE.Group();
    pivot.position.set(DECK.stick.x, DECK.stick.y, s * DECK.stick.z);
    const lean = new THREE.Group();
    lean.rotation.z = GRIP_TILT;
    const boot = new THREE.Mesh(bootGeo, bootMat);
    const grip = new THREE.Mesh(gripGeo, gripMat);
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.6, 20), baseMat);
    button.position.set(-0.4, 17.5, 0);
    // the trigger under the fingers, on the front
    const trigger = new THREE.Mesh(box(1.2, 3, 1.6, 0.4), baseMat);
    trigger.position.set(-2.3, 11, 0);
    pivot.add(boot); // the boot stays upright: the grip tilts out of it
    lean.add(grip, button, trigger);
    pivot.add(lean);
    root.add(pivot);
    return { pivot, lean };
  });

  /* ── the bay under the floor: the processor (the heart, lightest) and the transponder, on a shelf of glass ── */
  const cpuMat = grey(G_HERO, { rough: 0.5, metal: 0.3 });
  const xpdrMat = grey(G_MID, { rough: 0.55, metal: 0.3 });
  const cpu = new THREE.Mesh(box(40, 19, 26, 1), cpuMat);
  cpu.position.set(...BAY.cpu);
  const xpdr = new THREE.Mesh(box(36, 15, 18, 1), xpdrMat);
  xpdr.position.set(BAY.xpdr[0], BAY.xpdr[1] - 2, BAY.xpdr[2]);
  root.add(cpu, xpdr);
  for (const m of [cpu, xpdr]) {
    const e = edgesOf(m.geometry, { width: 1.8, opacity: 0.55 });
    e.position.copy(m.position);
    root.add(e);
  }
  // the processor's handles, on its aft face
  for (const z of [-8, 8]) {
    const h = new THREE.Mesh(box(2.4, 12, 2.4, 0.5), xpdrMat);
    h.position.set(BAY.cpu[0] + 21, BAY.cpu[1], BAY.cpu[2] + z);
    root.add(h);
  }
  {
    const [x, y, z] = BAY.cpu;
    const shelf = new THREE.Mesh(box(52, 1.6, 84, 0.4), shellMat);
    shelf.position.set(x, y - 11, z - 20);
    root.add(shelf);
    asShell([shelf], 16);
    const r = edgesOf(new THREE.BoxGeometry(56, 46, 90), { width: 1.8, opacity: 0.18 });
    r.position.set(x, y + 11, z - 20);
    lineMats.push(r.material);
    root.add(r);
  }
  // the coax: from the processor aft under the floor, up the left wall to the crown antenna; and down to the belly's
  const toCrown = [[BAY.cpu[0] + 20, BAY.cpu[1] + 4, 6], [-2230, -168, 40], [-2190, -150, 190]];
  for (let i = 0; i <= 10; i++) {
    const a = (-30 + (120 * i) / 10) * DEG;
    toCrown.push([-2172 + i * 1.6, 262 * Math.sin(a), 262 * Math.cos(a)]);
  }
  toCrown.push([ANT.top[0], ANT.top[1] - 6, 0]);
  const toBelly = [[BAY.cpu[0] + 20, BAY.cpu[1] - 6, -4], [-2120, -240, -4], [ANT.bottom[0], ANT.bottom[1] + 6, 0]];
  for (const path of [toCrown, toBelly]) {
    const c = fatLine(path, { color: BRAND.ink, width: 2, opacity: 0.4 });
    lineMats.push(c.material);
    root.add(c);
  }
  // the head that runs down it once a reply has come in (only while the core is lit)
  const coax = toCrown.slice().reverse().map((p) => V(...p));
  const coaxLen = [0];
  for (let i = 1; i < coax.length; i++) coaxLen.push(coaxLen[i - 1] + coax[i].distanceTo(coax[i - 1]));
  const coaxHead = glowSprite({ color: BRAND.veille, k: 2, world: 22, min: 3.5, max: 26, core: 0.22, tail: 0.5 });
  root.add(coaxHead);
  // the core: what reads from 200 m (two green points in two planes). Seen through everything: it is the system.
  const core = glowSprite({ color: BRAND.veille, k: 2.2, world: 260, min: 5.5, max: 110, core: 0.13, tail: 0.85, depthTest: false });
  core.position.set(BAY.cpu[0], BAY.cpu[1] + 4, BAY.cpu[2]);
  root.add(core);

  /* ── the two pilots of glass, seated, real hands; the captain holds his stick, the first officer rests ── */
  const crew = [1, -1].map((s) => {
    const fig = makeFigure({ shell: true, hands: "real", order: 10, glassK: 1.25, through: 0.18, skin: BRAND.ink });
    fig.ghost(true);
    fig.group.rotation.y = -Math.PI / 2; // it looks toward −x; its left (+x) toward +z
    fig.group.position.set(SEAT.x, SEAT.hip - fig.HIP, s * SEAT.z);
    root.add(fig.group);
    const out = s > 0 ? "L" : "R"; // the outer hand: on the stick
    const inn = s > 0 ? "R" : "L";
    const sx = s > 0 ? 1 : -1; //       the figure's +x is the world's +z: outward is +x for the captain, −x for the F/O
    fig.lean(4, 6 * sx, 0);
    const ank = V(0, DECK.floor + 8 - (SEAT.hip - fig.HIP), 34);
    fig.leg("L", ank.set(9, ank.y, 34), V(0, 1, 0.5));
    fig.leg("R", ank.set(-9, ank.y, 34), V(0, 1, 0.5));
    fig.reach(inn, V(-10 * sx, 101, 22), V(-0.4 * sx, -1, 0), { dir: V(0, -0.3, 1), palm: V(0, -1, 0) });
    fig.grip(inn, 0.3);
    return { fig, out, s };
  });
  // the stick's grip point and axis, the figure's frame (it is turned a quarter: local = (z, y, −x) about its seat)
  const gp = V();
  const ga = V();
  let lastPull = NaN;
  const holdSticks = (pull) => {
    for (let i = 0; i < 2; i++) {
      const { fig, out, s } = crew[i];
      const phi = GRIP_TILT + (i === 0 ? -0.36 * pull : 0); // pulled back: the top goes aft (+x)
      const dx = -Math.sin(phi);
      const dy = Math.cos(phi);
      const px = DECK.stick.x + dx * GRIP_AT;
      const py = DECK.stick.y + dy * GRIP_AT;
      const pz = s * DECK.stick.z;
      gp.set(pz - fig.group.position.z, py - fig.group.position.y, -(px - fig.group.position.x));
      ga.set(0, dy, -dx);
      fig.hold(out, gp, ga, { k: 0.9, bar: 2.4 });
    }
  };
  holdSticks(0);

  /* ── the plane's lights (the other's, in practice: `lights`) ── */
  const landing = OTHER.landing.map((at, i) => {
    const m = glowSprite({ color: BRAND.ink, k: 1.9, world: 760, min: 24, max: 480, core: 0.11, tail: 0.6, streak: i === 0 ? 0.5 : 0.3, aspect: 3.4, dir: 0.88, axis: [-1, 0, i === 0 ? 0 : Math.sign(at[2]) * 0.12] });
    m.position.set(...at);
    root.add(m);
    return m;
  });
  const beacons = OTHER.beacon.map((at) => {
    const m = glowSprite({ color: BRAND.signal, k: 2.4, world: 540, min: 11, max: 200, core: 0.15, tail: 0.65 });
    m.position.set(...at);
    root.add(m);
    return m;
  });

  /* ── anchors ── */
  A.cpu = anchor(root, ...BAY.cpu);
  A.xpdr = anchor(root, ...BAY.xpdr);
  A.stick = anchor(sticks[0].lean, 0, 17.6, 0);
  A.hand = anchor(crew[0].fig.arms[crew[0].out].hand, 0, 0, 0);
  A.eyeL = anchor(crew[0].fig.head, 0, 2, 8);
  A.eyeR = anchor(crew[1].fig.head, 0, 2, 8);
  A.panelL = anchor(root, DECK.panel.x, DECK.panel.y, 54);
  A.panelR = anchor(root, DECK.panel.x, DECK.panel.y, -54);
  A.beacon = anchor(root, ...OTHER.beacon[0]);
  A.landing = anchor(root, ...OTHER.landing[0]);

  return {
    root, A,
    update(P = {}, time = 0, px = 1000) {
      const sh = clamp01(P.shell ?? 1);
      shellMat.uniforms.uAmount.value = sh;
      for (const m of lineMats) m.opacity = m.userData.base * sh;
      const cr = clamp01(P.crew ?? 1) * sh;
      for (const { fig } of crew) {
        fig.body.uniforms.uAmount.value = cr;
        fig.group.visible = cr > 0.003;
      }
      const pull = clamp01(P.pull ?? 0);
      sticks[0].lean.rotation.z = GRIP_TILT - 0.36 * pull;
      if (pull !== lastPull) {
        lastPull = pull;
        holdSticks(pull);
      }
      // the core, and a head down the coax in the first 0.4 s of each second (the reply has just come in)
      const co = clamp01(P.cores ?? 0);
      lightSprite(core, co * (0.88 + 0.12 * Math.sin(time * Math.PI * 2 * 0.5)), px);
      const u = cycle(time);
      if (co > 0.002 && u < 0.4) {
        const want = (u / 0.4) * coaxLen[coaxLen.length - 1];
        let i = 1;
        while (i < coax.length - 1 && coaxLen[i] < want) i++;
        const f = clamp01((want - coaxLen[i - 1]) / Math.max(1e-3, coaxLen[i] - coaxLen[i - 1]));
        coaxHead.position.lerpVectors(coax[i - 1], coax[i], f);
        lightSprite(coaxHead, co * smooth(0, 0.05, u) * (1 - smooth(0.33, 0.4, u)), px);
      } else lightSprite(coaxHead, 0, px);
      // the lights: steady landing lights, a beacon that breathes once a second
      const l = clamp01(P.lights ?? 0);
      for (const m of landing) lightSprite(m, l, px);
      const breath = 0.5 + 0.5 * Math.cos(time * Math.PI * 2); // at its brightest on the first frame
      for (const m of beacons) lightSprite(m, l * (0.18 + 0.82 * breath * breath), px);
    },
  };
}

/* ─────────────────────────────────────────────────────────── the waves */

const Z = new THREE.Vector3(0, 0, 1);
const CIRCLE = Array.from({ length: 97 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a), 0];
});
/** A ring of light, unit radius in its xy plane: a bright core (2.6 px, HDR) in a soft band (8 px). */
function makeRing(color, { hdr = 2, halo = 0.2 } = {}) {
  const core = fatLine(CIRCLE, { color, width: 2.6, additive: true, hdr });
  const band = fatLine(CIRCLE, { color, width: 8, additive: true, opacity: halo });
  core.renderOrder = band.renderOrder = 4;
  const g = new THREE.Group();
  g.add(band, core);
  g.visible = false;
  return {
    g,
    set(center, q, r, amount) {
      if (amount < 0.003 || r < 1) {
        g.visible = false;
        return;
      }
      g.visible = true;
      g.position.copy(center);
      g.quaternion.copy(q);
      g.scale.setScalar(r);
      core.material.opacity = amount;
      band.material.opacity = halo * amount;
    },
  };
}
/** A unit line along +z (0 → 1), `n` segments, brighter toward its head (vertex colours): placed, turned, stretched. */
function makeTrail(color, { width = 3.5, hdr = 1.6, n = 16, fade = 2 } = {}) {
  const pts = Array.from({ length: n + 1 }, (_, i) => [0, 0, i / n]);
  const line = fatLine(pts, { color, width, additive: true, vertexColors: true, hdr });
  const cols = [];
  for (let i = 0; i <= n; i++) {
    const f = Math.pow(i / n, fade);
    cols.push(f, f, f);
  }
  line.geometry.setColors(cols);
  line.renderOrder = 4;
  line.visible = false;
  return line;
}

export function buildOndes() {
  const group = new THREE.Group();
  const echoes = [1, 0.3];
  const LAG = 0.1;
  const pings = echoes.map(() => makeRing(BRAND.veille, { hdr: 2 }));
  const replies = echoes.map(() => makeRing(BRAND.veille, { hdr: 1.2, halo: 0.14 }));
  const atcs = echoes.map(() => makeRing(BRAND.signal, { hdr: 2, halo: 0.22 }));
  for (const r of [...pings, ...replies, ...atcs]) group.add(r.g);
  // the coordination: a head and its trail, each way
  const head = (k = 2.2) => glowSprite({ color: BRAND.veille, k, world: 380, min: 8, max: 80, core: 0.2, tail: 0.6, depthTest: false });
  const coordHead = head();
  const coordTrail = makeTrail(BRAND.veille);
  const backHead = head();
  const backTrail = makeTrail(BRAND.veille);
  // the link: a fine line that breathes, and two slow heads crossing on it
  const linkCore = makeTrail(BRAND.veille, { width: 2.2, hdr: 1.4, n: 1, fade: 0 });
  const linkBand = fatLine([[0, 0, 0], [0, 0, 1]], { color: BRAND.veille, width: 7, additive: true, opacity: 0.12 });
  linkBand.renderOrder = 4;
  const linkHeads = [head(1.6), head(1.6)];
  group.add(coordHead, coordTrail, backHead, backTrail, linkCore, linkBand, ...linkHeads);

  const dir = new THREE.Vector3();
  const at = new THREE.Vector3();
  const tail = new THREE.Vector3();
  const q = new THREE.Quaternion();

  /** Rings flying p0 → p1 at s (0–1, may run past 1 when `stay`), opening r0 → r1; the echoes lag behind. */
  function fly(rings, p0, p1, s, r0, r1, amount, { endFade = true, past = 0 } = {}) {
    dir.subVectors(p1, p0);
    const len = dir.length();
    if (len < 1 || amount < 0.003) {
      for (const r of rings) r.g.visible = false;
      return;
    }
    dir.multiplyScalar(1 / len);
    q.setFromUnitVectors(Z, dir);
    for (let i = 0; i < rings.length; i++) {
      let si = s - i * LAG;
      if (si <= 0 || (endFade && si > 1)) {
        rings[i].g.visible = false;
        continue;
      }
      si = Math.min(si, 1);
      at.copy(p0).addScaledVector(dir, len * si);
      const fade = smooth(0, 0.1, si) * (endFade ? 1 - smooth(0.82, 1, si) : 1);
      rings[i].set(at, q, (r0 + (r1 - r0) * si) * (1 + 0.6 * past), amount * echoes[i] * fade);
    }
  }
  /** A head of light on the segment p0 → p1 at c (0–1) and its trail behind it. */
  function travel(spr, trail, p0, p1, c, px) {
    const on = c > 0.001 && c < 0.999;
    if (!on) {
      lightSprite(spr, 0, px);
      trail.visible = false;
      return;
    }
    const amount = smooth(0, 0.04, c) * (1 - smooth(0.95, 1, c));
    spr.position.lerpVectors(p0, p1, c);
    lightSprite(spr, amount, px);
    tail.lerpVectors(p0, p1, Math.max(0, c - 0.28));
    dir.subVectors(spr.position, tail);
    const len = dir.length();
    trail.visible = len > 1;
    if (!trail.visible) return;
    trail.position.copy(tail);
    trail.quaternion.setFromUnitVectors(Z, dir.multiplyScalar(1 / len));
    trail.scale.set(1, 1, len);
    trail.material.opacity = amount;
  }

  return {
    group,
    update(P = {}, time = 0, px = 1000) {
      const { a, b, ca, cb, atcFrom } = P;
      if (!a) return;
      // the interrogation and its reply: half a second each way, once a second
      const ping = clamp01(P.ping ?? 0);
      const u = cycle(time);
      fly(pings, a, b, u * 2, 250, 3000, ping);
      fly(replies, b, a, u * 2 - 1, 250, 2600, ping * 0.85);
      // the coordination, each way
      travel(coordHead, coordTrail, ca, cb, clamp01(P.coord ?? 0), px);
      travel(backHead, backTrail, cb, ca, clamp01(P.answer ?? 0), px);
      // the link
      const k = clamp01(P.link ?? 0);
      dir.subVectors(cb, ca);
      const len = dir.length();
      const showLink = k > 0.003 && len > 1;
      linkCore.visible = linkBand.visible = showLink;
      if (showLink) {
        q.setFromUnitVectors(Z, dir.multiplyScalar(1 / len));
        const breath = 0.55 + 0.45 * (0.5 - 0.5 * Math.cos(time * Math.PI * 2 * 0.5));
        for (const l of [linkCore, linkBand]) {
          l.position.copy(ca);
          l.quaternion.copy(q);
          l.scale.set(1, 1, len);
        }
        linkCore.material.opacity = k * breath;
        linkBand.material.opacity = 0.12 * k * breath;
      }
      for (let i = 0; i < 2; i++) {
        const ph = (((time / 2.4 + i * 0.5) % 1) + 1) % 1;
        if (!showLink) {
          lightSprite(linkHeads[i], 0, px);
          continue;
        }
        if (i === 0) linkHeads[i].position.lerpVectors(ca, cb, ph);
        else linkHeads[i].position.lerpVectors(cb, ca, ph);
        lightSprite(linkHeads[i], k * 0.7 * Math.sin(Math.PI * ph), px);
      }
      // the controller's wave: up from the ground to you (0 → 1), then opening and fading on you (1 → 2)
      const w = Math.max(0, P.atc ?? 0);
      const past = clamp01(w - 1);
      fly(atcs, atcFrom, a, Math.min(w, 1) + (w > 1 ? 0.14 * past : 0), 400, 4500, (w > 0.001 ? 1 : 0) * (1 - past), { endFade: false, past });
    },
  };
}
