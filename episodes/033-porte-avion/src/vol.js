// DOSSIER 033 — Porte d'avion : THE FLIGHT — 023's A330 of glass at night, L03's cabin of glass set inside it, the
// people of glass at door 1L, and the recorder (034's bait). An ENVELOPE: nothing of 023 or L03 is modified — what
// does not belong here is hidden or recoloured from the outside, at build and after each of their updates.
//
//   buildVol({ handle }) → { group, A, update(p, time, px) }
//     handle  the model's A.handle (Object3D at the handle's grip; its local +y runs along the bar): where the
//             neighbour's hands go (and the Korea passenger's left hand), read every frame
//   p = { alt, ahead, pitch, bank, wind, shell, runway, made, gear, cabin, lights, emerg, pax,
//         voisin, pull, seated, you, grip, recorder, mood }        (their meaning: FIRST in world.js)
//   A = { door      Object3D at DOOR_AT in the plane's PITCHED frame: world.js parents the model's root there
//         voisin    the neighbour's head        you   your head        seated   the Korea passenger's head
//         recorder  the recorder's centre (moves with it)          floor  the cabin floor under the door (plunge)
//         aisle     the left aisle's floor, 6 m aft of the door (the threshold's run) }
//
// WHAT THE ENVELOPE DOES TO 023 (docs/journal/033-vol.md):
//   · its colours that say nothing here are neutralised after each of its updates: the control surfaces (dim signal
//     dead → no glow, ink edges), the empty tanks' outline (signal → ink); the three hydraulic circuits and its own
//     seat backs are hidden (L03's cabin has its rows); its passengers and its « you » stay at 0.
// WHAT IT DOES TO L03: its 1L panel (glass, pack, lever) is hidden — our door takes its place; the first row's left
//   block and the seats behind it are emptied (their passengers taken out of the crowd's mesh, once): you sit there
//   alone, readable; the neighbour's seat is the empty aisle one. Smoke, fire, slide: 0, always.
//
// THE PEOPLE (glass bodies, @kit/figure.js): only what the story is about stays solid —
//   · the NEIGHBOUR: his two hands (real, shut on the handle). Standing at the door, he leans back from it with his
//     whole weight (`pull`), arms straight, heels braced at the foot of the door, and HEAVES — a jerk every 1.15 s,
//     from frame 1 (time-driven, regular: a heave, then he settles back). His stance is solved from the handle every
//     frame: wherever model.js puts it, both hands are on it and the arms reach.
//   · YOU: your head (the one you find first, as L03) and your right hand, shut on the armrest (`grip` 1) → open (0);
//     you look at the door while you grip.
//   · KOREA: a passenger on a seat right by the door (an exit-row seat of glass, his own): 1 seated, still; 1 → 2 he
//     turns, leans, his left hand goes to the handle and stays on it (the handle lifts with model.js's `handle`).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, glass, asShell, box, cyl, makePart, addMesh, anchor } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { buildAvion } from "../../023-eolienne-de-secours/src/avion.js";
import { FUSE, GEAR, ALT, ISLAND, BAY } from "../../023-eolienne-de-secours/src/plan.js";
import { buildCabine } from "../../L03-evacuation-avion/src/cabine.js";
import { dressCabine } from "../../L03-evacuation-avion/src/habillage.js";
import { CABIN_AT, CABIN, DOOR_AT, DOOR, PEOPLE, RECORDER, PLANE } from "./plan.js";

const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const INK = new THREE.Color(BRAND.ink);
const BLACK = new THREE.Color(0, 0, 0);

/** 023's world: the ground under the wheels and the runway's threshold, from `alt` (true m) and `ahead`. */
export const groundOf = (alt) => -(FUSE.r + GEAR.h) - (ALT.depth * Math.max(0, alt)) / ALT.cruise;
export const thresholdOf = (ahead) => -ISLAND.far * ahead;
/** Where the recorder comes to rest: RECORDER.depth under the sea (023 draws the sea ISLAND.h under the ground). */
const seabedOf = (alt) => groundOf(alt) - ISLAND.h - RECORDER.depth;

/* ── the cabin's seats (L03 · CAB.wide): rowX is a seat BACK, the passenger sits 24 cm forward of it ── */
const ROW = (i) => CABIN.x0 + i * CABIN.pitch;
const COLS_L = [175, 218, 261]; // the left block, aisle → window (L03 · YOU.z + k · 43)
/** The seats emptied in the crowd: row 0's left block (the neighbour's, the middle one, yours) and row 1's left block
 *  (right behind you: from the aft cameras, their heads stood on yours). */
const FREE = [[0, 175], [0, 218], [0, 261], [1, 175], [1, 218], [1, 261]];
/** You: row 0, the window seat, left (cabin frame x is aft of door 1L). Hips height seated: L03 · PAX.hipSeated. */
const YOU_AT = [PLANE.door1L + ROW(0) - 24, PLANE.floor, 261];
const HIP_SEATED = 47;
/** The armrest on your right (between you and the empty middle seat): its front end, its height. */
const ARMREST = { z: 261 - 21.5, y: 64, ahead: 16 };
/** Korea: an exit-row seat of glass right by the door's aft edge (PEOPLE.seated is too far aft to reach the handle). */
const KOREA_AT = [PLANE.door1L + 74, PLANE.floor, 222];
/** The door's lining, seen from the cabin (the neighbour's toes stop short of it). */
const LINING_Z = DOOR_AT[2] - 49;

export function buildVol({ handle } = {}) {
  const group = new THREE.Group();

  /* ── the A330 of glass (023), its sky, sea, island and runway — and its own habillage (called inside) ── */
  const avion = buildAvion();
  group.add(avion.group);
  const inPlane = new THREE.Group(); // the plane's frame, pitched with it
  inPlane.position.set(-BAY.at[0], -BAY.at[1], -BAY.at[2]);
  avion.mount.add(inPlane);

  const P23 = {
    ground: 0, threshold: 0, ahead: 0.05, pitch: 0, bank: 0, dawn: 0, wind: 0.5, shell: 1, engines: 2, fuel: 0, leak: 0,
    lines: 1, press: 0, flow: 0, surf: 0, stick: 0, pax: 0, you: 0, grip: 0, brakes: 0, gear: 0, tires: 0, runway: 0,
    made: 0, mood: 1, whirl: 0,
  };
  avion.update(P23, 0, 1);
  // what 023 paints signal and that says nothing here (surfaces, empty tanks): found once, put back to ink every frame
  const isSignal = (c) => c && c.r > 0.004 && c.r > 1.8 * c.g && c.r > 2.4 * c.b;
  const isVeille = (c) => c && c.g > 0.004 && c.g > 1.5 * c.r && c.g > 1.2 * c.b;
  const neutral = [];
  const seen = new Set();
  avion.group.traverse((o) => {
    if (o.isLineSegments2 && o.material?.vertexColors) o.visible = false; // the hydraulic circuits
    if (o.isMesh && o.material?.uniforms?.uSeen) o.visible = false; //        023's seat backs (L03's rows are here)
    for (const m of [o.material].flat()) {
      if (!m || seen.has(m) || (m.isShaderMaterial && !m.isLineMaterial)) continue; // edges are LineMaterials
      seen.add(m);
      if (m.emissive && isSignal(m.emissive)) {
        // the control surfaces: a solid dark part in a plane of glass is a hole — they turn to faint glass
        neutral.push({ c: m.emissive, to: BLACK });
        Object.assign(m, { transparent: true, opacity: 0.12, depthWrite: false });
      }
      if (m.color && (isSignal(m.color) || isVeille(m.color))) neutral.push({ c: m.color, to: INK });
    }
  });
  const neutralise = () => {
    for (const n of neutral) n.c.copy(n.to);
  };

  /* ── L03's cabin at night, inside it, its door 1L on 023's door 1L ── */
  const cabine = buildCabine();
  const dress = dressCabine();
  const cabinRoot = new THREE.Group();
  cabinRoot.position.set(...CABIN_AT);
  cabinRoot.add(cabine.group, dress.group);
  inPlane.add(cabinRoot);
  const l03Panel = cabine.A.door.parent; // L03's own 1L panel (glass, its pack, its lever): OUR door takes its place
  l03Panel.visible = false;
  // empty the seats of FREE in the crowd's mesh (each passenger's vertices carry its seat: aHome = (rowX − 24, z))
  const freeKey = new Set(FREE.map(([r, z]) => `${Math.round(ROW(r) - 24)}|${z}`));
  cabine.group.traverse((o) => {
    const home = o.geometry?.attributes?.aHome;
    if (!o.isMesh || !home || !o.geometry.index) return;
    const I = o.geometry.index.array;
    const keep = [];
    for (let i = 0; i < I.length; i += 3) {
      const v = I[i];
      if (freeKey.has(`${Math.round(home.getX(v))}|${Math.round(home.getY(v))}`)) continue;
      keep.push(I[i], I[i + 1], I[i + 2]);
    }
    if (keep.length < I.length) o.geometry.setIndex(keep);
  });

  /* ── where the model's root goes ── */
  const door = new THREE.Group();
  door.position.set(...DOOR_AT);
  inPlane.add(door);

  /* ── the people of glass ── */
  const people = new THREE.Group();
  inPlane.add(people);
  /** A figure of glass whose solid parts are only `keep` (meshes of fig.skin): the rest of its skin turns glass. */
  const glassFigure = (o, keepSolid) => {
    const f = makeFigure({ shell: true, order: 10, spec: 0, ...o });
    f.ghost(true);
    for (const m of keepSolid(f)) {
      m.material = f.flesh;
      asShell(m, false);
      m.castShadow = false;
    }
    return f;
  };
  const handMeshes = (f, sides) => sides.flatMap((s) => (f.arms[s].fingers ? f.arms[s].fingers.meshes : [f.arms[s].hand]));

  // the neighbour: standing, facing the door (+z), both real hands solid
  const voisin = glassFigure({ hands: "real", glassK: 1.15, through: 0.12, skin: 0xa59f94 }, (f) => handMeshes(f, ["L", "R"]));
  people.add(voisin.group);
  // you: seated in row 0, window, facing forward (−x); your head and your right hand solid
  const you = glassFigure({ hands: "real", glassK: 1.1, through: 0.12, skin: 0x8d887f }, (f) => [f.head, ...handMeshes(f, ["R"])]);
  you.group.position.set(YOU_AT[0], YOU_AT[1] + HIP_SEATED - 90, YOU_AT[2]);
  you.group.rotation.y = -Math.PI / 2;
  people.add(you.group);
  // Korea: seated by the door, his own seat of glass; his left hand solid (the one that goes to the handle)
  const seated = glassFigure({ hands: "real", glassK: 0.95, through: 0.1, skin: 0x9a948a }, (f) => handMeshes(f, ["L"]));
  const koreaRoot = new THREE.Group();
  koreaRoot.position.set(KOREA_AT[0], KOREA_AT[1], KOREA_AT[2]);
  koreaRoot.add(seated.group);
  seated.group.position.y = HIP_SEATED - 90;
  people.add(koreaRoot);
  const seatMat = glass(BRAND.ink, { base: 0.006, rim: 0.26, power: 2.4, edge: 0.22 });
  const koreaSeat = new THREE.Group();
  {
    // in the seat's frame: facing −x, its back aft (+x), z across; the passenger's hips at the origin
    const parts = [
      [box(46, 11, 46, 3), [-2, 40, 0]], //       the cushion
      [box(9, 72, 46, 3), [26, 80, 0]], //        the back
      [box(40, 5, 6, 2), [-2, 62, 25]], //        the armrests
      [box(40, 5, 6, 2), [-2, 62, -25]],
      [box(6, 38, 6, 2), [-14, 18, 18]], //       the legs
      [box(6, 38, 6, 2), [-14, 18, -18]],
      [box(6, 38, 6, 2), [16, 18, 18]],
      [box(6, 38, 6, 2), [16, 18, -18]],
    ];
    for (const [geo, at] of parts) {
      const m = new THREE.Mesh(geo, seatMat);
      m.position.set(...at);
      koreaSeat.add(m);
      asShell(m, 20);
    }
  }
  koreaSeat.position.set(...KOREA_AT); // the seat stays put (facing −x) while he turns on it
  people.add(koreaSeat);

  /* ── the recorder (solid, three greys): its chassis, its crash-protected memory, its beacon; its halo far below ── */
  const recorder = new THREE.Group();
  const recPart = makePart("recorder");
  const [RL, RH, RW] = RECORDER.size;
  const chassis = solid(0x8f9397, { rough: 0.55, metal: 0.3 });
  addMesh(recPart, box(RL, RH * 0.55, RW, 1.2), chassis, { pos: [0, -RH * 0.22, 0] });
  const memory = solid(0xc4c7c9, { rough: 0.42, metal: 0.35 });
  addMesh(recPart, cyl(RW * 0.36, RL * 0.5, 0.8, 48).rotateZ(Math.PI / 2), memory, { pos: [-RL * 0.14, RH * 0.24, 0] });
  const beacon = solid(0x5c6165, { rough: 0.5, metal: 0.3 });
  addMesh(recPart, cyl(2.4, 11, 0.4, 32).rotateZ(Math.PI / 2), beacon, { pos: [-RL * 0.14 - RL * 0.25 - 5, RH * 0.24, 0] });
  addMesh(recPart, box(4, 6, RW * 0.7, 0.8), beacon, { pos: [RL * 0.3, RH * 0.24, 0] }); // the strap's buckle
  recorder.add(recPart);
  recorder.position.set(...RECORDER.at);
  inPlane.add(recorder);
  // the halo on the seabed: a bright heart and a long soft tail, and the beacon's slow rings (one a second)
  const haloU = { uAmount: { value: 0 }, uTime: { value: 0 }, uColor: { value: INK.clone() } };
  const haloMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: haloU,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount, uTime; uniform vec3 uColor; varying vec2 vUv;
      void main() {
        float r = clamp(length(vUv), 0.0, 1.0);
        float heart = exp(-r * r * 420.0) * 0.75;
        float tail = pow(clamp(1.0 - r, 0.0, 1.0), 4.0) * 0.11;
        float ring = 0.0;
        for (int k = 0; k < 2; k++) {
          float age = fract(uTime + float(k) * 0.5);
          float rr = 0.08 + age * 0.85;
          ring += exp(-pow((r - rr) / 0.018, 2.0)) * (1.0 - age) * (1.0 - age) * 0.22;
        }
        float a = (heart + tail + ring) * uAmount;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1800).rotateX(-Math.PI / 2), haloMat);
  halo.renderOrder = 4;
  halo.frustumCulled = false;
  inPlane.add(halo);

  const A = {
    door,
    voisin: voisin.head,
    you: you.head,
    seated: seated.head,
    recorder: anchor(recPart, 0, 0, 0),
    floor: anchor(inPlane, PLANE.door1L + 40, PLANE.floor, 200),
    aisle: anchor(inPlane, PLANE.door1L + 600, PLANE.floor, 123),
  };

  /* ── scratch (nothing is allocated in update: it runs sixteen times a frame) ── */
  const G = new THREE.Vector3(); //     the handle's grip, plane frame
  const AX = new THREE.Vector3(); //    the bar's axis, plane frame
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const loc = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const rest = new THREE.Vector3();
  const BEND_KNEE = new THREE.Vector3(0, 0.3, 1);
  const TOE = new THREE.Vector3(0, -0.1, 1);
  const SEAT_BEND = new THREE.Vector3(0, 1, 0.25);
  const SEAT_TOE = new THREE.Vector3(0, -0.15, 1);
  const ELBOW_OUT_L = new THREE.Vector3(0.6, -0.6, -0.3);
  const ELBOW_OUT_R = new THREE.Vector3(-0.6, -0.6, -0.3);
  const DOWN = new THREE.Vector3(0, -1, 0);
  const ALONG = new THREE.Vector3(0, 0, 1);
  const UPV = new THREE.Vector3(0, 1, 0);
  const AX0 = new THREE.Vector3(0, 1, 0);

  /** Where the handle is, in the plane's frame (after the plane has been pitched): G, and its bar's axis AX. */
  function readHandle() {
    if (!handle) {
      G.set(DOOR_AT[0] + 8, DOOR_AT[1] + 70, LINING_Z - 10);
      AX.copy(AX0);
      return;
    }
    inPlane.updateWorldMatrix(true, false);
    handle.getWorldPosition(G);
    inPlane.worldToLocal(G);
    handle.getWorldQuaternion(qa);
    inPlane.getWorldQuaternion(qb);
    AX.copy(AX0).applyQuaternion(qa).applyQuaternion(qb.invert()).normalize();
  }

  /** A seated figure at rest (as L03's poser): feet on the floor ahead, hands on the thighs. Its own frame. */
  function sitDown(f) {
    f.leg("L", tmp.set(9.5, 51, 44), SEAT_BEND, SEAT_TOE);
    f.leg("R", tmp.set(-9.5, 51, 44), SEAT_BEND, SEAT_TOE);
  }

  /** The neighbour: his stance solved from the grip G (plane frame). He faces +z, unrotated. */
  function poseVoisin(pull, time) {
    // a heave every 1.15 s: a sharp pull, then he settles back (phase set so frame 1 is already rising)
    const u = (time / (86.133 / 75) + 0.04) % 1;
    const heave = smooth(0, 0.1, u) * (1 - smooth(0.12, 0.8, u)) * pull;
    // the hips stay BEHIND the grip; the trunk leans back from them; the hips' height is what lets straight arms reach
    const L = 49 + 5 * pull; //                                   shoulder → wrist (straight at full pull)
    const back = 18 + 12 * (1 - pull) + 4 * heave; //               the hips, behind the grip
    let a = (6 + 24 * pull + 9 * heave) * DEG; //                   the trunk's lean back
    a = Math.min(a, Math.asin(clamp01((L * 0.96 - back) / 54)));
    const dz = back + 54 * Math.sin(a);
    const shY = G.y + Math.sqrt(Math.max(0, L * L - dz * dz));
    const H = Math.min(91, Math.max(42, shY - PLANE.floor - 54 * Math.cos(a)));
    const hipZ = G.z - back;
    const drop = 90 - H;
    voisin.group.position.set(G.x, PLANE.floor - drop, hipZ);
    voisin.lean(-a / DEG, 0, 0);
    // the feet: braced ahead toward the foot of the door, one before the other; the toes stop short of the lining
    const zMax = LINING_Z - hipZ - 20;
    const zA = Math.min(14 + 22 * pull, zMax);
    voisin.leg("L", tmp.set(11, drop + 8, zA), BEND_KNEE, TOE);
    voisin.leg("R", tmp.set(-11, drop + 8, zA - 16 * pull), BEND_KNEE, TOE);
    // both hands shut on the bar, one above the other along it
    loc.copy(G).sub(voisin.group.position);
    voisin.hold("L", tgt.copy(loc).addScaledVector(AX, 5), AX, { k: 1, bend: ELBOW_OUT_L });
    voisin.hold("R", tgt.copy(loc).addScaledVector(AX, -5), AX, { k: 1, bend: ELBOW_OUT_R });
  }

  /** You: seated, your right hand on the armrest — shut (grip 1) or open (0); you look at the door while you grip. */
  function poseYou(grip) {
    sitDown(you);
    you.lean(-3 + 4 * grip, 0, 16 * grip);
    // the armrest, in your own frame (facing +z, your left +x = the window): your right is −x
    tgt.set(-(YOU_AT[2] - ARMREST.z), ARMREST.y - (HIP_SEATED - 90), ARMREST.ahead);
    you.hold("R", tgt, ALONG, { k: lerp(0.15, 1, grip), palm: DOWN, bar: 2.2 });
    you.reach("L", tmp.set(11, 99, 26));
  }

  /** Korea: 1 seated, still → 2 he turns to the door, leans, his left hand goes to the handle and holds it. */
  function poseKorea(s) {
    const k = smooth(0, 1, clamp01(s - 1));
    koreaRoot.rotation.y = -Math.PI / 2 + k * 0.5; // facing −x → turned toward the door (+z)
    sitDown(seated);
    seated.lean(lerp(0, 30, k), lerp(0, 12, k), lerp(0, 20, k));
    seated.reach("R", tmp.set(-11, 99, 26));
    rest.set(11, 99, 26);
    if (k < 0.001) {
      seated.reach("L", rest);
      return;
    }
    // the grip in his own frame: hold it (sets the hand's lay), then bring the wrist in from his thigh
    koreaRoot.updateWorldMatrix(true, false);
    seated.group.updateWorldMatrix(false, false);
    loc.copy(G);
    inPlane.localToWorld(loc);
    seated.group.worldToLocal(loc);
    qb.copy(koreaRoot.quaternion).invert();
    tmp.copy(AX).applyQuaternion(qb);
    const wrist = seated.hold("L", loc, tmp, { k: smooth(0.75, 1, k) });
    if (k < 1) seated.reach("L", tgt.copy(rest).lerp(wrist, smooth(0, 0.85, k)), null, seated.arms.L);
  }

  function update(p = {}, time = 0, px = 1) {
    const alt = p.alt ?? 11300;
    P23.ground = groundOf(alt);
    P23.ahead = p.ahead ?? 0.05;
    P23.threshold = thresholdOf(P23.ahead);
    P23.pitch = p.pitch ?? 0;
    P23.bank = p.bank ?? 0;
    P23.wind = p.wind ?? 0.5;
    P23.shell = p.shell ?? 1;
    P23.gear = p.gear ?? 0;
    P23.runway = p.runway ?? 0;
    P23.made = p.made ?? 0;
    P23.mood = p.mood ?? 1;
    avion.update(P23, time, px);
    neutralise();

    const c = p.cabin ?? 1;
    cabinRoot.visible = c > 0.01;
    if (cabinRoot.visible) {
      cabine.set({
        layout: 0, lights: p.lights ?? 0.15, emerg: p.emerg ?? 0, smoke: 0, fire: 0, breach: 0, pax: p.pax ?? 1, floor: 0, glow: 0, signs: 0,
        crowd: 0, you: 0, bag: 0, bins: 0, obstacles: 0, dolls: 0, crew: 0, pa: 0, door: 0, arm: 1, hatch: 0, wider: 0, panels: 0,
        extinguisher: 0, cut: 0, mood: p.mood ?? 1,
      }, time, px);
      dress.update?.({ layout: 0, lights: p.lights ?? 0.15, smoke: 0, cut: 0 }, time, px);
    }
    l03Panel.visible = false;

    const vz = clamp01(p.voisin ?? 0);
    const yz = clamp01(p.you ?? 0);
    const sz = clamp01(p.seated ?? 0);
    voisin.group.visible = vz > 0.01;
    you.group.visible = yz > 0.01;
    koreaRoot.visible = sz > 0.01;
    koreaSeat.visible = koreaRoot.visible;
    if (voisin.group.visible || koreaRoot.visible) readHandle();
    if (voisin.group.visible) {
      voisin.body.uniforms.uAmount.value = vz;
      poseVoisin(clamp01(p.pull ?? 0), time);
    }
    if (you.group.visible) {
      you.body.uniforms.uAmount.value = yz;
      poseYou(clamp01(p.grip ?? 0));
    }
    if (koreaRoot.visible) {
      seated.body.uniforms.uAmount.value = sz;
      seatMat.uniforms.uAmount.value = sz;
      poseKorea(p.seated ?? 0);
    }

    /* the recorder: in the tail cone, then down into the dark — it falls behind the plane, tumbling slowly */
    const r = p.recorder ?? 0;
    recorder.visible = r > 0.01;
    const fall = clamp01(r - 1);
    const bed = seabedOf(alt);
    const f = fall * fall * (1.6 - 0.6 * fall); // starts slow, falls, eases onto the bed
    recorder.position.set(RECORDER.at[0] + 1400 * smooth(0, 0.6, fall), lerp(RECORDER.at[1], bed + RH / 2, f), RECORDER.at[2]);
    recorder.rotation.set(fall * 1.1 * Math.PI, 0, fall * 0.45 * Math.PI);
    if (fall > 0.97) recorder.rotation.set(0, 0.35, 0);
    halo.position.set(RECORDER.at[0] + 1400, bed + 1, RECORDER.at[2]);
    const lit = smooth(0.82, 1, fall);
    halo.visible = lit > 0.003;
    haloU.uAmount.value = lit;
    haloU.uTime.value = time;
  }
  update();

  return { group, A, update };
}
