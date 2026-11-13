// DOSSIER 047 — Lave-vaisselle : THE SYSTEM — the water circuit, solid, at its true places (plan.js).
// What the film is about: a little water at the bottom, warmed, pumped, thrown by an arm that has NO MOTOR — the
// reaction of its own tip jets turns it — and the same water going round. So the two things that carry the film are
// built with the most care: the arm (an open bore at its hub, nothing under it but the tube; nozzles you can see
// inclined; a jet at each tip aimed backwards) and the round of the water (one veille line, comets running on it).
//
//   buildSystem() → { root, parts, A, update(P, time, px) }
//   root     what world.js re-parents: in the scene at the origin (plan.js coordinates), on the bench at −BENCH_FROM
//   parts    valve, sump, micro, fine, coarse, pump, tube, heater, arm, dispenser, trap, tablet — each fades on its own
//   A        anchors (Object3D, world positions follow the part): valve, port, sump, filters, pump, tube, arm, hub, tip
//            (the arm's +x tip: it turns with it), heater, dispenser, trap, tablet
//   P        explode turn jets thrust inlet water pump passes loop heat trap tab door bench
//            litValve litSump litPump litArm litTrap solo   (plain numbers, world.js FIRST)
//
// Sense of turn: spin.rotation.y = −turn·2π. Seen from above the arm turns clockwise: its +x tip moves toward +z.
// Its tip jets point the other way (−z at the +x tip): it turns AWAY from its jets, the thrust arrows point along
// the motion. The top nozzles lean the same way (backwards), as on real lower arms.
//
// Light: the jets, the water, the stream, the round are additive shaders (they fade to nothing, never to a black
// hole); every one of them is bounded before pow. Nothing is allocated in update (it runs sixteen times a frame).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { makePart, addMesh, solid, glow, setGlow, setPartOpacity, explode, box, cyl, lathe, plate, anchor, fatLine } from "@kit/build3d.js";
import { SUMP, FILTERS, PUMP, TUBE, ARM, HEATER, VALVE, DISPENSER, DISH, DOOR, LOOP } from "./plan.js";

const DEG = Math.PI / 180;
const V = (p) => new THREE.Vector3(...p);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const UP = new THREE.Vector3(0, 1, 0);

// a mesh that belongs to `part` (its materials fade with it) but hangs on an inner group (a pivot)
const addOn = (part, group, ...args) => {
  const mesh = addMesh(part, ...args);
  group.add(mesh);
  return mesh;
};
const tubeAlong = (pts, r, seg = 64, closed = false, radial = 16) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(V), closed, "centripetal"), seg, r, radial, closed);
// a ring (washer, collar, rim) turned about y: inner radius a, outer b, from y0 to y1
const ring = (a, b, y0, y1, bevel = 0.08) => lathe([[a, y1], [a, y0], [b, y0], [b, y1], [a, y1]], 64, { bevel, round: 1 });
// geometry built along y, laid along x / along z
const alongX = (g) => g.rotateZ(-Math.PI / 2);
const alongZ = (g) => g.rotateX(Math.PI / 2);

/* ───────────── the surfaces of the filters: tiny repeated patterns, mip-mapped, so they melt into a grey as soon
   as they would pass under the pixel (no shimmer) ───────────── */
function pattern(kind) {
  const N = 32;
  const data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      let v = 255;
      if (kind === "holes") {
        const d = Math.hypot(x - 15.5, y - 15.5);
        v = Math.round(255 - 150 * clamp01((9.5 - d) / 2)); // a round perforation, soft-edged
      } else {
        const wire = Math.min(Math.abs(x - 15.5), Math.abs(y - 15.5));
        v = Math.round(60 + 195 * clamp01((4 - wire) / 2)); // a woven mesh: bright wires, dark openings
      }
      data.set([v, v, v, 255], (y * N + x) * 4);
    }
  const tex = new THREE.DataTexture(data, N, N);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/* ───────────── the light of water: one additive shader, four uses ─────────────
   kind "jet"     a cone along +y (0 → 1, scaled to its length): a bright core, a spray that thins, slow pulses going
                  up; free, it dies between uFade and uLen; on the crust (uHit) it ends bright
   kind "stream"  a tube along its uv.x: shown up to uHead (the water arriving), pulses running along
   kind "water"   a flat surface (local xz around the sump): slow rings, brighter at its rim
   kind "blob"    a soft round glow on a plane (a splash, the bore, the dissolving tablet) */
function waterMat(kind, color = BRAND.veille) {
  const uniforms = {
    uColor: { value: new THREE.Color(color) }, uK: { value: 0 }, uTime: { value: 0 },
    uLen: { value: 1 }, uFade: { value: 1 }, uHit: { value: 0 }, uHead: { value: 1 }, uSeed: { value: 0 }, uR: { value: 1 },
  };
  const vs = {
    jet: `varying float vA; varying float vF;
      void main() { vA = position.y; vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vF = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }`,
    stream: `varying float vA; varying float vF;
      void main() { vA = uv.x; vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vF = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }`,
    water: `varying vec2 vP;
      void main() { vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    blob: `varying vec2 vP;
      void main() { vP = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  }[kind];
  const head = `uniform vec3 uColor; uniform float uK, uTime, uLen, uFade, uHit, uHead, uSeed, uR;`;
  const fs = {
    jet: `${head} varying float vA; varying float vF;
      void main() {
        if (uK < 0.002) discard;
        float s = vA * uLen;
        float core = pow(clamp(vF, 0.0, 1.0), 3.0);
        float halo = 0.18 * pow(clamp(vF, 0.0, 1.0), 0.8);
        float along = mix(1.0, 0.5, clamp(vA, 0.0, 1.0));
        float keep = mix(1.0 - smoothstep(uFade, max(uLen, uFade + 0.01), s), 1.0, uHit);
        float pulse = 0.84 + 0.16 * sin((s - uTime * 11.0) * 2.4 + uSeed);
        float born = smoothstep(0.0, 0.5, s);
        float end = uHit * smoothstep(uLen - 1.6, uLen, s) * 0.7;
        gl_FragColor = vec4(uColor * uK * ((core * pulse + halo) * along * keep * born + core * end), 1.0);
      }`,
    stream: `${head} varying float vA; varying float vF;
      void main() {
        if (uK < 0.002) discard;
        float shown = 1.0 - smoothstep(uHead - 0.08, uHead, vA);
        float core = pow(clamp(vF, 0.0, 1.0), 1.6);
        float pulse = 0.8 + 0.2 * sin((vA * uLen - uTime * 9.0) * 1.8);
        gl_FragColor = vec4(uColor * uK * (core * pulse + 0.15) * shown, 1.0);
      }`,
    water: `${head} varying vec2 vP;
      void main() {
        if (uK < 0.002) discard;
        float r = length(vP);
        float rip = 0.5 + 0.5 * sin(r * 2.6 - uTime * 2.2 + uSeed);
        float rim = smoothstep(uR - 1.4, uR, r) * (1.0 - smoothstep(uR, uR + 0.3, r));
        float thin = 1.0 - 0.75 * smoothstep(uFade, uLen, r);
        gl_FragColor = vec4(uColor * uK * (0.42 + 0.3 * rip + 0.55 * rim) * thin, 1.0);
      }`,
    blob: `${head} varying vec2 vP;
      void main() {
        if (uK < 0.002) discard;
        float r = length(vP);
        float a = pow(clamp(1.0 - r, 0.0, 1.0), 1.7);
        gl_FragColor = vec4(uColor * uK * a, 1.0);
      }`,
  }[kind];
  return new THREE.ShaderMaterial({
    uniforms, vertexShader: vs, fragmentShader: fs,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: kind === "jet" ? THREE.FrontSide : THREE.DoubleSide, fog: false,
  });
}

export function buildSystem() {
  const root = new THREE.Group();
  root.name = "system";
  // three greys (and the hero lighter than all): dark structure, mid, light; metal stays low, it must shade
  const dark = (c = 0x3b4147) => solid(c, { rough: 0.62, metal: 0.3 });
  const mid = (c = 0x6c7279) => solid(c, { rough: 0.5, metal: 0.32 });
  const light = (c = 0x9ba1a7) => solid(c, { rough: 0.48, metal: 0.25 });
  const hero = () => solid(0xb4babf, { rough: 0.56, metal: 0.2, env: 0.6 }); // rough enough not to mirror the softbox into a bloom
  const hole = () => solid(0x0d1013, { rough: 0.9, metal: 0 });
  const mesh = (p, g, m, o) => addMesh(p, g, m, o);
  const T = DISPENSER.trap;

  /* ───────────── THE INLET VALVE, its pipe, the port in the tub wall, the stream ───────────── */
  const valve = makePart("valve");
  mesh(valve, alongZ(cyl(2.1, 6.2, 0.25, 40)), dark(), { pos: VALVE.body });
  const coilMat = light(0x8d939a);
  mesh(valve, box(4.6, 4.4, 4.6, 0.45), coilMat, { pos: VALVE.coil });
  mesh(valve, box(1.6, 2.2, 3.2, 0.25), dark(0x2c3136), { pos: [VALVE.coil[0] + 3, VALVE.coil[1] + 0.4, VALVE.coil[2]] }); // its connector
  for (const dz of [-0.8, 0.8]) mesh(valve, alongX(cyl(0.22, 1.2, 0.05, 12)), mid(0x9aa0a6), { pos: [VALVE.coil[0] + 4.3, VALVE.coil[1] + 0.4, VALVE.coil[2] + dz], edges: false });
  // the threaded nipple out of the back (the hose screws on it)
  mesh(valve, alongZ(lathe([[0, -2.2], [1.1, -2.2], [1.1, -1.4], [0.9, -1.2], [1.1, -1.0], [0.9, -0.8], [1.1, -0.6], [0.9, -0.4], [1.1, -0.2], [1.1, 3.4], [0, 3.4]], 40, { bevel: 0.05 })), mid(), { pos: VALVE.nipple });
  mesh(valve, tubeAlong(VALVE.pipe, 0.8, 48), dark(0x4a5157), { edges: false });
  // the port: a short spout on the tub's left wall, aimed +x, its dark mouth
  const port = V(VALVE.port);
  mesh(valve, alongX(cyl(1.25, 1.6, 0.2, 32, 1.0)), mid(), { pos: [port.x + 0.8, port.y, port.z] });
  mesh(valve, alongX(cyl(0.6, 0.1, 0, 20)), hole(), { pos: [port.x + 1.62, port.y, port.z], edges: false });
  // the stream: an arc out of the port onto the floor, then a flat ribbon over the micro filter into the sump
  const streamArc = waterMat("stream");
  const streamRun = waterMat("stream");
  const arcPts = [[port.x + 1.6, port.y, port.z], [port.x + 4, port.y + 0.1, port.z], [port.x + 7, port.y - 1.2, port.z], [port.x + 9.3, 15.8, port.z]];
  const runPts = [[port.x + 9.3, 15.8, port.z], [-13, 15.8, port.z], [-8.5, 15.85, port.z], [-6.6, 15.5, port.z], [-5.4, 14.2, port.z]];
  const arcGeo = tubeAlong(arcPts, 0.42, 40, false, 12);
  const runGeo = tubeAlong(runPts, 0.55, 40, false, 12).translate(0, -15.8, 0).scale(1, 0.32, 1).translate(0, 15.8, 0);
  streamArc.uniforms.uLen.value = 10;
  streamRun.uniforms.uLen.value = 16;
  const arcMesh = new THREE.Mesh(arcGeo, streamArc);
  const runMesh = new THREE.Mesh(runGeo, streamRun);
  arcMesh.renderOrder = runMesh.renderOrder = 4;
  valve.add(arcMesh, runMesh);

  /* ───────────── THE SUMP, its water, the three filters ───────────── */
  const sump = makePart("sump");
  const S = SUMP;
  // a cup sunk in the floor: its wall, its bottom, a flange at the floor; an outlet toward the pump
  mesh(sump, lathe([[0, S.y0], [S.r, S.y0], [S.r, S.y1 - 0.5], [S.r + 1.6, S.y1 - 0.5], [S.r + 1.6, S.y1], [S.r - 0.45, S.y1], [S.r - 0.45, S.y0 + 0.45], [0, S.y0 + 0.45]], 72, { bevel: 0.12 }), dark(), { pos: [S.x, 0, S.z] });
  mesh(sump, alongX(cyl(2.1, 3.2, 0.15, 32)), dark(0x454b51), { pos: [S.x + S.r + 0.9, PUMP.volute[1] + 0.8, S.z] });
  const pool = waterMat("water");
  pool.uniforms.uR.value = S.r - 0.5;
  pool.uniforms.uFade.value = 50;
  pool.uniforms.uLen.value = 60;
  const poolMesh = new THREE.Mesh(new THREE.CircleGeometry(S.r - 0.5, 64).rotateX(-Math.PI / 2), pool);
  poolMesh.position.set(S.x, S.y0 + 1, S.z);
  poolMesh.renderOrder = 4;
  sump.add(poolMesh);

  // microfine: a flat perforated plate on the floor, with the sump's hole
  const micro = makePart("micro", { lift: 15, delay: 0.12, span: 0.5 });
  const MF = FILTERS.micro;
  const plateShape = (inset = 0) => {
    const sh = new THREE.Shape();
    const r = 1.6;
    const [x0, x1, s0, s1] = [MF.x0 + inset, MF.x1 - inset, -MF.z1 + inset, -MF.z0 - inset]; // shape y = −z
    sh.moveTo(x0 + r, s0); sh.lineTo(x1 - r, s0); sh.quadraticCurveTo(x1, s0, x1, s0 + r); sh.lineTo(x1, s1 - r); sh.quadraticCurveTo(x1, s1, x1 - r, s1);
    sh.lineTo(x0 + r, s1); sh.quadraticCurveTo(x0, s1, x0, s1 - r); sh.lineTo(x0, s0 + r); sh.quadraticCurveTo(x0, s0, x0 + r, s0);
    const h = new THREE.Path();
    h.absarc(S.x, -S.z, MF.hole + inset * 0.2, 0, Math.PI * 2, true);
    sh.holes.push(h);
    return sh;
  };
  const microTex = pattern("holes");
  const microMat = solid(0x7b8187, { rough: 0.55, metal: 0.3 });
  microMat.map = microTex;
  microMat.userData.finish = false; // its perforation is its surface
  const microGeo = plate(plateShape(), 0.5, { bevel: 0.12 }).rotateX(-Math.PI / 2);
  // the plate's top face carries ExtrudeGeometry's uvs in centimetres: the repeat must be per cm
  microTex.repeat.set(2.2, 2.2);
  mesh(micro, microGeo, microMat, { pos: [0, MF.y - 0.25, 0], edgeOpacity: 0.6 });
  // the water's film on it (water near 1): the same outline, a hair above
  const film = waterMat("water");
  film.uniforms.uR.value = 40;
  film.uniforms.uFade.value = 7;
  film.uniforms.uLen.value = 17;
  const filmGeo = new THREE.ShapeGeometry(plateShape(0.6), 24).rotateX(-Math.PI / 2).translate(-S.x, 0, -S.z);
  const filmMesh = new THREE.Mesh(filmGeo, film);
  filmMesh.position.set(S.x, MF.y + 0.32, S.z);
  filmMesh.renderOrder = 4;
  micro.add(filmMesh);

  // fine: a cylinder of woven mesh between two rims
  const fine = makePart("fine", { lift: 27, delay: 0.22, span: 0.5 });
  const FF = FILTERS.fine;
  const fineTex = pattern("mesh");
  fineTex.repeat.set(150, 26);
  const fineMat = solid(0x5f656c, { rough: 0.5, metal: 0.4, double: true });
  fineMat.map = fineTex;
  fineMat.userData.finish = false;
  mesh(fine, lathe([[FF.r, FF.y0 + 0.5], [FF.r, FF.y1 - 0.5]], 72), fineMat, { pos: [S.x, 0, S.z], edges: false });
  mesh(fine, ring(FF.r - 0.5, FF.r + 0.25, FF.y0, FF.y0 + 0.7), mid(0x5a6066), { pos: [S.x, 0, S.z] });
  mesh(fine, ring(FF.r - 0.5, FF.r + 0.25, FF.y1 - 0.7, FF.y1), mid(0x5a6066), { pos: [S.x, 0, S.z] });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    mesh(fine, box(0.6, FF.y1 - FF.y0 - 1, 0.6, 0.15), mid(0x5a6066), { pos: [S.x + Math.cos(a) * FF.r, (FF.y0 + FF.y1) / 2, S.z + Math.sin(a) * FF.r], edges: false });
  }

  // coarse: a cup with a cage of slots and a handle sticking out of the floor — the lightest of the three
  const coarse = makePart("coarse", { lift: 40, delay: 0.3, span: 0.5 });
  // plan.js has its rim at 18 and its grip at 20: the arm (its underside at 17) sweeps over it, so both stay under it
  const CF = { ...FILTERS.coarse, y1: Math.min(FILTERS.coarse.y1, ARM.hub[1] - 1.4), handle: Math.min(FILTERS.coarse.handle, ARM.hub[1] - 0.5) };
  const coarseMat = light();
  mesh(coarse, lathe([[0, CF.y0], [CF.r - 0.3, CF.y0], [CF.r, CF.y0 + 0.4], [CF.r, CF.y1 - 0.8], [CF.r + 1.0, CF.y1 - 0.6], [CF.r + 1.0, CF.y1], [CF.r - 0.4, CF.y1], [CF.r - 0.4, CF.y0 + 0.5], [0, CF.y0 + 0.5]], 64, { bevel: 0.1 }), coarseMat, { pos: [S.x, 0, S.z], edgeOpacity: 0.7 });
  const slotMat = hole();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const slot = mesh(coarse, box(0.12, CF.y1 - CF.y0 - 3.2, 1.1, 0.04), slotMat, { pos: [S.x + Math.cos(a) * (CF.r + 0.02), (CF.y0 + CF.y1) / 2 - 0.6, S.z + Math.sin(a) * (CF.r + 0.02)], edges: false });
    slot.rotation.y = -a;
  }
  mesh(coarse, box(1.2, CF.handle - CF.y1 + 0.6, 6.2, 0.35), light(0xa9afb5), { pos: [S.x, (CF.y1 + CF.handle) / 2 - 0.3, S.z] }); // the grip
  mesh(coarse, box(1.6, 0.9, 6.6, 0.3), light(0xa9afb5), { pos: [S.x, CF.handle - 0.2, S.z] });

  /* ───────────── THE CIRCULATION PUMP and THE TUBE to the hub ───────────── */
  const pump = makePart("pump");
  const VO = PUMP.volute;
  const M = PUMP.motor;
  const voluteMat = dark(0x434950);
  mesh(pump, alongX(cyl(PUMP.vr, 4, 0.35, 48)), voluteMat, { pos: VO });
  mesh(pump, alongX(cyl(1.9, 1.2, 0.12, 32)), voluteMat, { pos: [VO[0] - 2.5, VO[1] + 0.8, VO[2]] }); // its eye, fed from the sump
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    mesh(pump, alongX(cyl(0.35, 0.5, 0.05, 12)), mid(0x8a9096), { pos: [VO[0] + 2.1, VO[1] + Math.cos(a) * 3.3, VO[2] + Math.sin(a) * 3.3], edges: false });
  }
  mesh(pump, alongX(cyl(2.6, M.x0 - VO[0] - 2 + 0.2, 0.15, 32)), mid(0x5a6066), { pos: [(VO[0] + 2 + M.x0) / 2, M.y, M.z] }); // the neck
  const motorMat = mid(0x737980);
  mesh(pump, alongX(lathe([[0, 0], [M.r - 0.6, 0], [M.r, 0.6], ...Array.from({ length: 9 }, (_, i) => [[M.r, 1.4 + i * 1.1], [M.r - 0.35, 1.7 + i * 1.1], [M.r, 2.0 + i * 1.1]]).flat(), [M.r, M.x1 - M.x0 - 1], [M.r - 1.2, M.x1 - M.x0], [0, M.x1 - M.x0]], 64, { bevel: 0.08 })), motorMat, { pos: [M.x0, M.y, M.z], edgeOpacity: 0.45 });
  mesh(pump, box(3.2, 1.8, 3.6, 0.3), dark(0x2c3136), { pos: [(M.x0 + M.x1) / 2 + 1, M.y + M.r + 0.5, M.z] }); // its terminal box
  const tube = makePart("tube");
  const tubeMat = dark(0x50565c);
  tubeMat.side = THREE.DoubleSide;
  mesh(tube, tubeAlong(TUBE.path, TUBE.r, 64), tubeMat, { edges: false });
  mesh(tube, ring(TUBE.r - 0.1, TUBE.r + 0.5, -0.7, 0.7), mid(0x5a6066), { pos: TUBE.path[0] });

  /* ───────────── THE HEATING ELEMENT ───────────── */
  const heater = makePart("heater", { lift: 9, delay: 0.06, span: 0.5 });
  const heatMat = solid(0x7d8186, { rough: 0.45, metal: 0.4 });
  mesh(heater, tubeAlong(HEATER.path, HEATER.r, 160, false, 14), heatMat, { edges: false });
  for (const p of [HEATER.path[0], HEATER.path[HEATER.path.length - 1]]) {
    mesh(heater, cyl(HEATER.r, p[1] - 10, 0, 16), heatMat, { pos: [p[0], (p[1] + 10) / 2, p[2]], edges: false }); // its legs through the floor
    mesh(heater, ring(HEATER.r, HEATER.r + 0.9, 14.6, 15.2), mid(0x5a6066), { pos: [p[0], 0, p[2]] });
    mesh(heater, box(2.2, 1.8, 2.2, 0.3), dark(0x2c3136), { pos: [p[0], 9.4, p[2]] });
  }

  /* ───────────── THE ARM — the heart ───────────── */
  const arm = makePart("arm", { lift: 52, delay: 0.4, span: 0.55 });
  const spin = new THREE.Group();
  spin.position.set(...ARM.hub);
  arm.add(spin);
  const armMat = hero();
  const half = ARM.len / 2;
  // its plan: a swollen hub, two blades tapering to round tips; a bore through the hub (where the water comes up)
  const hw = (x) => {
    const ax = Math.abs(x);
    const taper = 2.05 - 0.55 * (ax / half);
    const bulge = Math.sqrt(Math.max(0, 3.7 * 3.7 - x * x));
    const tipR = 1.5;
    const tip = ax > half - tipR ? Math.sqrt(Math.max(0, tipR * tipR - (ax - (half - tipR)) ** 2)) : taper;
    return Math.max(ax > half - tipR ? tip : taper, bulge);
  };
  const outline = new THREE.Shape();
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const x = -half + (ARM.len * i) / N;
    i === 0 ? outline.moveTo(x, 0) : outline.lineTo(x, hw(x));
  }
  for (let i = N - 1; i >= 1; i--) {
    const x = -half + (ARM.len * i) / N;
    outline.lineTo(x, -hw(x));
  }
  const bore = new THREE.Path();
  bore.absarc(0, 0, 1.4, 0, Math.PI * 2, false);
  outline.holes.push(bore);
  addOn(arm, spin, plate(outline, ARM.h, { bevel: 0.32, round: 2 }).rotateX(-Math.PI / 2), armMat, { edgeOpacity: 0.55 });
  // the hub's collar on top: a ring, open — you look down into the bore
  const collarMat = hero();
  addOn(arm, spin, ring(1.4, 2.7, ARM.h - 0.1, ARM.h + 0.8, 0.12), collarMat, {});
  addOn(arm, spin, ring(1.15, 1.4, -0.2, ARM.h + 0.7, 0.04), hole(), { edges: false }); // the bore's dark wall
  // under the hub: a sleeve on the floor around the tube's mouth — and nothing else (no motor)
  mesh(arm, ring(1.7, 2.5, 15.2, ARM.hub[1] - 0.15, 0.1), mid(0x5a6066), {});
  // the water coming up the bore when it runs
  const boreMat = waterMat("blob");
  const boreGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2), boreMat);
  boreGlow.position.y = ARM.h + 0.2;
  boreGlow.renderOrder = 5;
  spin.add(boreGlow);

  // the nozzles: five per side on top, leaning BACKWARDS (opposite the motion), a little fanned; one at each tip,
  // on its trailing face, aimed sideways and back: that one pushes
  const jets = []; // { mesh, mat, ox, oy, oz, dx, dy, dz, free, fade }
  const jetGeo = new THREE.CylinderGeometry(0.8, 0.22, 1, 16, 8, true).translate(0, 0.5, 0);
  const nozzleMat = solid(0xb4b9bf, { rough: 0.4, metal: 0.35 });
  const nozzleGeo = cyl(0.62, 1.0, 0.14, 24, 0.5);
  const mouthGeo = cyl(0.34, 0.06, 0, 16);
  const q = new THREE.Quaternion();
  const dir = new THREE.Vector3();
  const nozzle = (x, y, z, d, len, fade, seed) => {
    dir.copy(d).normalize();
    q.setFromUnitVectors(UP, dir);
    const boss = addOn(arm, spin, nozzleGeo, nozzleMat, { pos: [x + dir.x * 0.3, y + dir.y * 0.3, z + dir.z * 0.3], edgeOpacity: 0.6 });
    boss.quaternion.copy(q);
    const mouth = addOn(arm, spin, mouthGeo, hole(), { pos: [x + dir.x * 0.82, y + dir.y * 0.82, z + dir.z * 0.82], edges: false });
    mouth.quaternion.copy(q);
    const mat = waterMat("jet");
    mat.uniforms.uSeed.value = seed;
    const jm = new THREE.Mesh(jetGeo, mat);
    const o = [x + dir.x * 0.85, y + dir.y * 0.85, z + dir.z * 0.85];
    jm.position.set(...o);
    jm.quaternion.copy(q);
    jm.renderOrder = 5;
    jm.frustumCulled = false;
    spin.add(jm);
    jets.push({ mesh: jm, mat, ox: o[0], oy: o[1], oz: o[2], dx: dir.x, dy: dir.y, dz: dir.z, free: len, fade });
  };
  for (const s of [1, -1])
    for (let i = 0; i < ARM.jets; i++) {
      const x = s * (4.4 + i * 3.9);
      const lean = (14 + i * 3) * DEG;
      const fan = (i % 2 ? 7 : -5) * DEG * s;
      nozzle(x, ARM.h, 0, new THREE.Vector3(Math.sin(fan), Math.cos(lean), -s * Math.sin(lean)), 16, 9, i * 1.7 + (s > 0 ? 0 : 3.1));
    }
  const tips = [];
  for (const s of [1, -1]) {
    const x = s * (half - 1.0);
    tips.push(jets.length);
    nozzle(x, ARM.h * 0.55, -s * hw(x), new THREE.Vector3(0, 0.3, -s), 10, 4, s > 0 ? 0.6 : 2.2);
  }
  // the thrust: at each tip an arrow along the motion — the jet goes back, the arm goes forward
  const thrustMat = glow(BRAND.veille, 0, { additive: true });
  const arrows = [];
  for (const s of [1, -1]) {
    const g = new THREE.Group();
    g.position.set(s * (half - 1.0), ARM.h + 2.2, s * 1.8);
    g.rotation.y = s > 0 ? 0 : Math.PI;
    const shaft = new THREE.Mesh(alongZ(new THREE.CylinderGeometry(0.42, 0.42, 4.6, 16)).translate(0, 0, 2.3), thrustMat);
    const tip = new THREE.Mesh(alongZ(new THREE.ConeGeometry(1.15, 2.4, 20)).translate(0, 0, 5.8), thrustMat);
    shaft.renderOrder = tip.renderOrder = 6;
    g.add(shaft, tip);
    spin.add(g);
    arrows.push(g);
  }
  arm.userData.part.mats.add(thrustMat);
  // where the jets hit the crust: a soft splash on its plane (scene only)
  const tilt = DISH.tilt * DEG;
  const splashes = [];
  for (let i = 0; i < ARM.jets * 2; i++) {
    const m = waterMat("blob");
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2).rotateX(-Math.PI / 2 + tilt), m);
    sp.renderOrder = 5;
    sp.visible = false;
    root.add(sp);
    splashes.push({ mesh: sp, mat: m });
  }

  /* ───────────── THE DISPENSER on the door's inner face (it goes with the door), its trap, the tablet ───────────── */
  const doorPivot = new THREE.Group();
  doorPivot.position.set(0, DOOR.hinge[0], DOOR.hinge[1]);
  root.add(doorPivot);
  const inDoor = (p) => [p[0], p[1] - DOOR.hinge[0], p[2] - DOOR.hinge[1]];
  const dispenser = makePart("dispenser");
  const D = DISPENSER;
  const dx0 = D.centre[0] - D.w / 2;
  const dx1 = D.centre[0] + D.w / 2;
  const dy0 = D.centre[1] - D.h / 2;
  const dy1 = D.centre[1] + D.h / 2;
  const zb = D.centre[2] + D.d / 2; // against the door
  const zf = D.centre[2] - D.d / 2; // its face toward the tub
  const tx0 = T.centre[0] - T.w / 2;
  const tx1 = T.centre[0] + T.w / 2;
  const ty1 = T.hingeY + T.h;
  const dispMat = dark(0x484e54);
  const block = (x0, x1, y0, y1, z0, z1, mat = dispMat, edges = true) =>
    mesh(dispenser, box(x1 - x0, y1 - y0, z1 - z0, 0.3), mat, { pos: inDoor([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]), edges });
  block(dx0, dx1, dy0, dy1, zb - 0.6, zb); // its back plate
  block(dx0, tx0, dy0, dy1, zf, zb - 0.6); // the rinse-aid side
  block(tx1, dx1, dy0, dy1, zf, zb - 0.6);
  block(tx0, tx1, ty1, dy1, zf, zb - 0.6);
  block(tx0, tx1, dy0, T.hingeY, zf, zb - 0.6);
  block(tx0 + 0.1, tx1 - 0.1, T.hingeY + 0.1, ty1 - 0.1, zb - 0.9, zb - 0.55, hole(), false); // the chamber's dark back
  // the rinse-aid cap: a round knob on the left of it
  mesh(dispenser, alongZ(lathe([[0, 0], [2.0, 0], [2.0, 0.5], [1.6, 0.8], [0, 0.8]], 48, { bevel: 0.1 })), mid(0x7b8187), { pos: inDoor([dx0 + 3.2, D.centre[1], zf + 0.05]), rot: [Math.PI, 0, 0] });
  mesh(dispenser, box(2.6, 0.5, 0.5, 0.2), mid(0x7b8187), { pos: inDoor([dx0 + 3.2, D.centre[1], zf - 0.7]) });
  const trap = makePart("trap");
  const trapHinge = new THREE.Group();
  trapHinge.position.set(...inDoor([T.centre[0], T.hingeY, T.centre[2]]));
  trap.add(trapHinge);
  const trapMat = light(0xa6acb2);
  addOn(trap, trapHinge, box(T.w, T.h, 0.5, 0.18), trapMat, { pos: [0, T.h / 2, 0] });
  addOn(trap, trapHinge, box(2.2, 0.8, 0.5, 0.18), trapMat, { pos: [0, T.h - 0.2, -0.45] }); // its latch
  addOn(trap, trapHinge, alongX(cyl(0.35, T.w - 0.4, 0.05, 16)), mid(0x5a6066), { pos: [0, 0, 0.1], edges: false }); // its hinge pin
  doorPivot.add(dispenser, trap);
  const tablet = makePart("tablet");
  const tabG = new THREE.Group();
  tablet.add(tabG);
  const [TW, TH, TD] = D.tablet;
  addOn(tablet, tabG, box(TW, TH * 0.62, TD, 0.3), solid(0xdcd8ce, { rough: 0.85, metal: 0 }), { pos: [0, TH * 0.19, 0], edgeOpacity: 0.5 });
  addOn(tablet, tabG, box(TW, TH * 0.38, TD, 0.3), solid(0x8f959b, { rough: 0.8, metal: 0 }), { pos: [0, -TH * 0.31, 0], edgeOpacity: 0.5 });
  const cloudMat = waterMat("blob", BRAND.ink);
  const cloud = new THREE.Mesh(new THREE.PlaneGeometry(2, 2).rotateX(-Math.PI / 2), cloudMat);
  cloud.renderOrder = 5;
  cloud.visible = false;
  root.add(cloud);

  /* ───────────── THE ROUND OF THE WATER: one line, comets on it (its colours rewritten in place) ───────────── */
  const SEG = 240;
  const loopCurve = new THREE.CatmullRomCurve3(LOOP.slice(0, -1).map(V), true, "centripetal");
  const loopPts = loopCurve.getSpacedPoints(SEG);
  const flat = loopPts.map((p) => [p.x, p.y, p.z]);
  const zeros = new Float32Array((SEG + 1) * 3);
  const loopCore = fatLine(flat, { color: 0xffffff, width: 7, vertexColors: true, additive: true });
  const loopHalo = fatLine(flat, { color: 0xffffff, width: 18, vertexColors: true, additive: true });
  for (const l of [loopCore, loopHalo]) {
    l.geometry.setColors(zeros);
    l.material.depthTest = false;
    l.renderOrder = 30;
    l.visible = false;
    l.frustumCulled = false;
    root.add(l);
  }
  const coreCol = loopCore.geometry.attributes.instanceColorStart.data;
  const haloCol = loopHalo.geometry.attributes.instanceColorStart.data;
  const HEADS = 5;
  const TAIL = 0.045; // of the whole round: a comet ≈ 3 cm long on a round of ≈ 70 cm

  root.add(valve, sump, micro, fine, coarse, pump, tube, heater, arm, tablet);

  const parts = { valve, sump, micro, fine, coarse, pump, tube, heater, arm, dispenser, trap, tablet };
  const list = Object.values(parts);
  // « la pièce que la voix nomme » : its solids take a faint veille, its edges turn veille
  const litOf = (...ps) => {
    const mats = ps.flatMap((p) => [...p.userData.part.mats]);
    const solids = mats.filter((m) => m.isMeshStandardMaterial);
    const lines = mats.filter((m) => m.isLineMaterial).map((m) => ({ m, base: m.color.clone() }));
    return { solids, lines, k: -1 };
  };
  const LIT = {
    valve: litOf(valve), sump: litOf(sump, micro, fine, coarse), pump: litOf(pump), arm: litOf(arm), trap: litOf(trap),
  };
  const setLit = (L, k, extra = 0) => {
    const key = k + extra * 7.13;
    if (L.k === key) return;
    L.k = key;
    for (const m of L.solids) m.emissive.copy(VEILLE).multiplyScalar(0.16 * k);
    for (const { m, base } of L.lines) m.color.copy(base).lerp(VEILLE, Math.min(1, k * 1.2));
  };

  const A = {
    valve: anchor(valve, ...VALVE.coil), port: anchor(valve, ...VALVE.port),
    sump: anchor(sump, S.x, S.y1, S.z), filters: anchor(coarse, S.x, CF.y1, S.z),
    pump: anchor(pump, ...PUMP.volute), tube: anchor(tube, ...TUBE.path[2]),
    arm: anchor(arm, ARM.hub[0], ARM.hub[1] + 2, ARM.hub[2]), hub: anchor(arm, ...ARM.hub), tip: anchor(spin, half, ARM.h / 2, 0),
    heater: anchor(heater, ...HEATER.path[2]), dispenser: anchor(dispenser, ...inDoor(D.centre)),
    trap: anchor(trapHinge, 0, T.h / 2, 0), tablet: anchor(tabG, 0, 0, 0),
  };

  // the crust's plane under the dish (cuve.js tilts the dish about x, its front edge lower)
  const crustK = Math.tan(tilt);
  const cx0 = DISH.centre[0] - DISH.w / 2 + DISH.wall + 0.6;
  const cx1 = DISH.centre[0] + DISH.w / 2 - DISH.wall - 0.6;
  const cz0 = DISH.centre[2] - (DISH.d / 2 - DISH.wall - 0.6) * Math.cos(tilt);
  const cz1 = DISH.centre[2] + (DISH.d / 2 - DISH.wall - 0.6) * Math.cos(tilt);
  const chamber = inDoor([T.centre[0], T.hingeY + T.h / 2, zb - 0.9 - TD / 2]); // the tablet's place, door frame
  const sumpTop = [S.x, MF.y + 0.5, S.z];

  return {
    root, parts, A,
    update(P = {}, time = 0, px = 1) {
      const { explode: k = 0, turn = 0, jets: jetsOn = 0, thrust = 0, inlet = 0, water = 0, pump: run = 0, passes = 0, loop = 0, heat = 0,
        trap: open = 0, tab: drop = 0, door = 0, bench = 0, litValve: lv = 0, litSump: ls = 0, litPump: lp = 0, litArm: la = 0, litTrap: lt = 0, solo = 0 } = P;
      void px;
      const fade = 1 - 0.75 * clamp01(solo);
      for (const part of list) if (part !== arm) setPartOpacity(part, fade);
      explode(list, k);
      const ke = ease(clamp01((k - 0.3) / 0.6));
      const theta = -turn * Math.PI * 2;
      spin.rotation.y = theta;
      const doorA = bench ? 0 : door * DOOR.open * DEG;
      doorPivot.rotation.x = doorA;
      doorPivot.position.z = DOOR.hinge[1] + 5 * ke; // on the bench, the dispenser steps out in the exploded view
      trapHinge.rotation.x = -clamp01(open) * 105 * DEG;

      /* the jets: each one ends on the crust if the dish is over it, else rises and dies */
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const liftArm = arm.position.y;
      const onDish = !bench && k < 0.01;
      // with the push shown, the tip jets lead and the top ones step back; with the round drawn, all step back for it
      const jk = 1.7 * clamp01(jetsOn) * (1 - 0.45 * clamp01(loop));
      const tipBoost = 1 + 0.6 * clamp01(thrust);
      const topDim = 1 - 0.6 * clamp01(thrust);
      for (let i = 0; i < jets.length; i++) {
        const J = jets[i];
        const show = jk > 0.01;
        J.mesh.visible = show;
        const sp = splashes[i];
        if (!show) {
          if (sp) sp.mesh.visible = false;
          continue;
        }
        let len = J.free;
        let hit = 0;
        if (sp && onDish) {
          // to the root frame: the hub + the turned offset (the arm is not lifted in the scene)
          const ox = ARM.hub[0] + J.ox * c + J.oz * s;
          const oy = ARM.hub[1] + J.oy + liftArm;
          const oz = ARM.hub[2] - J.ox * s + J.oz * c;
          const dx = J.dx * c + J.dz * s;
          const dy = J.dy;
          const dz = -J.dx * s + J.dz * c;
          const den = dy + crustK * dz;
          const t = den > 0.05 ? (DISH.crust - oy - (oz - DISH.centre[2]) * crustK) / den : -1;
          if (t > 0) {
            const hx = ox + dx * t;
            const hz = oz + dz * t;
            if (hx > cx0 && hx < cx1 && hz > cz0 && hz < cz1) {
              len = t;
              hit = 1;
              sp.mesh.position.set(hx, oy + dy * t - 0.15, hz);
            }
          }
        }
        J.mesh.scale.y = len;
        J.mat.uniforms.uLen.value = len;
        J.mat.uniforms.uFade.value = J.fade;
        J.mat.uniforms.uHit.value = hit;
        J.mat.uniforms.uK.value = jk * (i === tips[0] || i === tips[1] ? tipBoost : topDim);
        J.mat.uniforms.uTime.value = time;
        if (sp) {
          sp.mesh.visible = hit > 0;
          sp.mat.uniforms.uK.value = 1.1 * clamp01(jetsOn) * (0.85 + 0.15 * Math.sin(time * 1.7 + i));
        }
      }
      // the push: arrows along the motion at the tips
      const tk = clamp01(thrust);
      setGlow(thrustMat, 1.9 * tk);
      for (const g of arrows) {
        g.visible = tk > 0.01;
        g.scale.set(0.8 + 0.2 * tk, 0.8 + 0.2 * tk, 0.55 + 0.45 * tk);
      }
      boreMat.uniforms.uK.value = 1.2 * clamp01(jetsOn) * clamp01(run + 0.3);
      boreGlow.visible = boreMat.uniforms.uK.value > 0.01;

      /* the water at the bottom: the sump fills (never more than to the brim and a film on the micro filter) */
      const w = clamp01(water);
      const serving = 0.45 + 0.55 * Math.max(clamp01(run), clamp01(inlet));
      poolMesh.position.y = S.y0 + 0.6 + (S.y1 - 0.35 - S.y0 - 0.6) * w;
      pool.uniforms.uK.value = w > 0.01 ? 0.75 * serving : 0;
      pool.uniforms.uTime.value = time;
      poolMesh.visible = w > 0.01;
      const fk = smooth(0.8, 1, w);
      film.uniforms.uK.value = 0.38 * fk * serving;
      film.uniforms.uTime.value = time;
      filmMesh.visible = fk > 0.01;

      /* the stream from the port (the water arriving: its head runs out along it) */
      const ik = clamp01(inlet);
      streamArc.uniforms.uHead.value = clamp01(ik * 2.2) * 1.1;
      streamRun.uniforms.uHead.value = clamp01(ik * 2.2 - 1) * 1.1;
      streamArc.uniforms.uK.value = streamRun.uniforms.uK.value = 1.0 * smooth(0, 0.08, ik);
      streamArc.uniforms.uTime.value = streamRun.uniforms.uTime.value = time;
      arcMesh.visible = ik > 0.01;
      runMesh.visible = ik > 0.46;

      /* the heater reddens (signal ≤ 3): a lamp with a place */
      heatMat.emissive.copy(SIGNAL).multiplyScalar(1.6 * clamp01(heat));

      /* the parts the voice names */
      setLit(LIT.valve, clamp01(lv));
      coilMat.emissive.copy(VEILLE).multiplyScalar(0.16 * clamp01(lv) + 0.45 * ik);
      setLit(LIT.sump, clamp01(ls));
      setLit(LIT.pump, clamp01(lp));
      motorMat.emissive.copy(VEILLE).multiplyScalar(0.16 * clamp01(lp) + 0.07 * clamp01(run) * (0.6 + 0.4 * Math.sin(time * 2.2)));
      setLit(LIT.arm, clamp01(la));
      setLit(LIT.trap, clamp01(lt));

      /* the round of the water */
      const lk = clamp01(loop);
      loopCore.visible = loopHalo.visible = lk > 0.01;
      if (lk > 0.01) {
        const a = coreCol.array;
        const b = haloCol.array;
        const ph = passes - Math.floor(passes);
        for (let i = 0; i < SEG; i++) {
          for (let e = 0; e < 2; e++) {
            const u = (i + e) / SEG;
            const dlt = ((((ph - u) * HEADS) % 1) + 1) % 1 / HEADS; // how far behind the nearest head ahead
            const head = Math.exp(-dlt / TAIL) * (1 - smooth(0.17, 0.2, dlt));
            const vC = lk * (0.32 + 2.1 * head);
            const vH = lk * 0.55 * head;
            const o = i * 6 + e * 3;
            a[o] = VEILLE.r * vC; a[o + 1] = VEILLE.g * vC; a[o + 2] = VEILLE.b * vC;
            b[o] = VEILLE.r * vH; b[o + 1] = VEILLE.g * vH; b[o + 2] = VEILLE.b * vH;
          }
        }
        coreCol.needsUpdate = true;
        haloCol.needsUpdate = true;
      }

      /* the tablet: in its chamber (with the door) · 0.3 → 0.55 out over the open trap and down to the floor ·
         → 1 it melts into a pale cloud that spreads toward the sump, then nothing */
      const dt = clamp01(drop);
      const cA = Math.cos(doorA);
      const sA = Math.sin(doorA);
      const zOff = 5 * ke;
      const qx = chamber[0];
      const qy = DOOR.hinge[0] + chamber[1] * cA - chamber[2] * sA;
      const qz = DOOR.hinge[1] + zOff + chamber[1] * sA + chamber[2] * cA;
      const u = clamp01((dt - 0.3) / 0.25);
      const out = smooth(0, 0.25, u); // first it slides out of the chamber
      const fall = clamp01((u - 0.15) / 0.85);
      const L = D.lands;
      tabG.position.set(qx + (L[0] - qx) * fall, qy + (L[1] - qy) * fall * fall, qz - 2.6 * out + (L[2] - (qz - 2.6)) * fall);
      tabG.rotation.set(doorA * (1 - u) + fall * 1.5 * Math.PI, fall * 0.5, 0);
      const melt = smooth(0.55, 0.85, dt);
      tabG.scale.setScalar(Math.max(0.001, 1 - melt));
      tablet.visible = dt < 0.85 && fade > 0.004;
      const ck = Math.sin(Math.PI * clamp01((dt - 0.55) / 0.45));
      cloud.visible = !bench && ck > 0.01;
      if (cloud.visible) {
        const v = smooth(0.58, 1, dt);
        cloud.position.set(L[0] + (sumpTop[0] - L[0]) * v, sumpTop[1] + 0.2, L[2] + (sumpTop[2] - L[2]) * v);
        cloud.scale.setScalar(2.2 + 5 * v);
        cloudMat.uniforms.uK.value = 1.0 * ck;
      }
    },
  };
}
