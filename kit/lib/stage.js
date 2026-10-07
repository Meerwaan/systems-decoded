// The 3D stage: a small film studio in code.
//   · studio lighting: an environment of softboxes (reflections on plastic and metal) + a key light that casts soft shadows
//   · a shutter: every frame is the average of several instants (motion blur), each nudged by a
//     fraction of a pixel (so the same samples also antialias lines, grids and glints)
//   · bloom on what glows, tone mapping, then the grade: the contrast and colour of the film, set like
//     on a grading desk (stage.grade), and a faint dither so dark gradients never band
// Everything is driven only by HyperFrames time (hf-seek) — never by a clock.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { BRAND } from "./brand.js";
import { SOFTBOX } from "./build3d.js";

const DEG = Math.PI / 180;
const FPS = 30;
const KEY_DIR = new THREE.Vector3(-30, 52, 38).normalize();
const KEY_U = new THREE.Vector3().crossVectors(KEY_DIR, new THREE.Vector3(0, 1, 0)).normalize();
const KEY_V = new THREE.Vector3().crossVectors(KEY_U, KEY_DIR);
// points spread evenly over a disc (Vogel's spiral)
const disc = (n) => Array.from({ length: n }, (_, i) => [Math.sqrt((i + 0.5) / n) * Math.cos(i * 2.399963), Math.sqrt((i + 0.5) / n) * Math.sin(i * 2.399963)]);

const halton = (i, base) => {
  let f = 1;
  let r = 0;
  while (i > 0) {
    f /= base;
    r += f * (i % base);
    i = Math.floor(i / base);
  }
  return r;
};

/** What the objects reflect: a dark room with a large warm softbox, a cool strip behind, a faint ceiling. */
function studioEnvironment(renderer) {
  const room = new THREE.Scene();
  const panel = (w, h, color, power, pos) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  panel(SOFTBOX.w, SOFTBOX.h, 0xfff3e2, 9, SOFTBOX.pos);
  panel(1.6, 10, 0xdfeeff, 7, [8, 3, -7]);
  panel(12, 12, 0xffffff, 0.5, [0, 12, 0]);
  panel(14, 14, 0x0a0d10, 1, [0, -6, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(room, 0.03).texture;
  pmrem.dispose();
  return texture;
}

const QUAD_VERTEX = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
// One impossible pixel — a NaN or an infinity out of any shader — is spread by the bloom into a
// black slab the size of a quarter of the frame, for one frame: a flicker. None gets past here.
const QUAD_FRAGMENT = /* glsl */ `
  uniform sampler2D tMap; uniform float uWeight; varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tMap, vUv);
    if (any(isnan(c)) || any(isinf(c)) || c.r < 0.0 || c.g < 0.0 || c.b < 0.0) c = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragColor = min(c, vec4(64.0)) * uWeight;
  }`;

/** Renders the scene `samples` times across the shutter and hands the average to the next pass. */
class ShutterPass extends Pass {
  constructor(scene, camera, samples, advance) {
    super();
    this.needsSwap = false; // writes into the read buffer, like a RenderPass
    this.scene = scene;
    this.camera = camera;
    this.samples = samples;
    this.advance = advance;
    const { W, H } = BRAND;
    // with few samples there is no jitter to lean on: fall back to hardware antialiasing
    this.frame = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: samples >= 4 ? 0 : 4 });
    this.sum = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthBuffer: false });
    const quad = (blending) =>
      new FullScreenQuad(
        new THREE.ShaderMaterial({
          uniforms: { tMap: { value: null }, uWeight: { value: 1 } },
          vertexShader: QUAD_VERTEX,
          fragmentShader: QUAD_FRAGMENT,
          blending,
          blendSrc: THREE.OneFactor,
          blendDst: THREE.OneFactor,
          depthTest: false,
          depthWrite: false,
        }),
      );
    this.add = quad(THREE.CustomBlending);
    this.copy = quad(THREE.NoBlending);
    this.clear = new THREE.Color();
  }

  render(renderer, writeBuffer, readBuffer) {
    const autoClear = renderer.autoClear;
    const alpha = renderer.getClearAlpha();
    renderer.getClearColor(this.clear);

    renderer.setRenderTarget(this.sum);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    for (let k = 0; k < this.samples; k++) {
      this.advance(k);
      renderer.autoClear = true;
      renderer.setRenderTarget(this.frame);
      renderer.render(this.scene, this.camera);
      renderer.autoClear = false;
      this.add.material.uniforms.tMap.value = this.frame.texture;
      this.add.material.uniforms.uWeight.value = 1 / this.samples;
      renderer.setRenderTarget(this.sum);
      this.add.render(renderer);
    }
    this.copy.material.uniforms.tMap.value = this.sum.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    this.copy.render(renderer);

    renderer.setClearColor(this.clear, alpha);
    renderer.autoClear = autoClear;
  }
}

// The grade works on the finished picture (display values, 0–1), the way a colourist would:
//   contrast   an S-curve around `pivot`: deeper blacks, brighter lights, the middle stays put
//   shadows / highlights   a colour pushed into the dark end and into the bright end (cool / warm)
//   saturation
//   gel + gelAmount   a coloured light over the whole scene. It multiplies, so black stays black —
//                     a coloured veil laid over the picture would lift the blacks and flatten everything
//   vignette   the frame falls off toward its edges, the eye stays on the subject
const GRADE = {
  uniforms: {
    tDiffuse: { value: null },
    uContrast: { value: 1 },
    uPivot: { value: 0.4 },
    uSaturation: { value: 1 },
    uShadows: { value: new THREE.Color(0, 0, 0) },
    uHighlights: { value: new THREE.Color(0, 0, 0) },
    uGel: { value: new THREE.Color(1, 1, 1) },
    uGelAmount: { value: 0 },
    uVignette: { value: 0 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; varying vec2 vUv;
    uniform float uContrast, uPivot, uSaturation, uGelAmount, uVignette;
    uniform vec3 uShadows, uHighlights, uGel;
    float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
    float curve(float x) {
      x = clamp(x, 0.0, 1.0);
      return x < uPivot ? uPivot * pow(x / uPivot, uContrast) : 1.0 - (1.0 - uPivot) * pow((1.0 - x) / (1.0 - uPivot), uContrast);
    }
    void main() {
      vec4 px = texture2D(tDiffuse, vUv);
      vec3 c = px.rgb;
      // gel: tint by multiplication, re-exposed so the scene does not simply get darker
      vec3 gel = uGel / max(max(uGel.r, uGel.g), max(uGel.b, 1e-3));
      c *= mix(vec3(1.0), gel * 1.25, uGelAmount);
      // contrast on luminance, so colours keep their hue
      float l = luma(c);
      c *= curve(l) / max(l, 1e-4);
      l = luma(c);
      c += uShadows * (1.0 - smoothstep(0.0, 0.45, l)) * (0.25 + l) + uHighlights * smoothstep(0.45, 1.0, l);
      c = mix(vec3(luma(c)), c, uSaturation);
      vec2 d = (vUv - 0.5) * vec2(0.86, 1.0);
      c *= 1.0 - uVignette * smoothstep(0.28, 0.82, length(d));
      // ±1.5/255 of triangular noise, fixed in screen space: invisible, but it breaks the steps of dark gradients
      float n = hash(gl_FragCoord.xy) + hash(gl_FragCoord.xy * 1.37 + 19.19) - 1.0;
      gl_FragColor = vec4(max(c, 0.0) + n * (1.5 / 255.0), px.a);
    }`,
};

/**
 * `scale`   the size of the subject in scene units (≈ its radius): frames the shadows.
 * `samples` instants averaged per frame (16: a fast move stays one smooth smear, not a row of ghosts; 1 = off, for a fast draft).
 * `shutter` fraction of a frame the shutter stays open (0.5 = the classic 180°).
 * `far`     how far the camera sees, in scene units.
 * `keySize` the key light as a softbox: its half-angle seen from the subject, in degrees (0 = a point,
 *           shadows cut with a razor; 2–3 = crisp where a part touches, soft a hand's width away).
 *           Free: each instant of the shutter sees the key from another point of the box. Also `stage.keySize`.
 */
export function createStage(canvas, { bloom = [0.6, 0.7, 1.0], fog = 0.0032, scale = 10, samples = 16, shutter = 0.5, far = 900, keySize = 0 } = {}) {
  const { W, H } = BRAND;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BRAND.bg);
  scene.fog = new THREE.FogExp2(BRAND.bg, fog);
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(28, W / H, 0.5, far);

  const lights = {
    hemi: new THREE.HemisphereLight(0xa9bccb, 0x06080a, 0.22),
    key: new THREE.DirectionalLight(0xfff1e0, 2.5),
    rim: new THREE.DirectionalLight(BRAND.veille, 1.3),
    fill: new THREE.DirectionalLight(0x8fa6ff, 0.2),
  };
  lights.key.castShadow = true;
  lights.key.shadow.mapSize.set(4096, 4096);
  lights.key.shadow.bias = -0.0004;
  scene.add(lights.hemi, lights.key, lights.key.target, lights.rim, lights.rim.target, lights.fill, lights.fill.target);

  // What is being filmed, and how big it is: the lights stand around it and the shadows frame it.
  // A film with several sets moves this from one to the other (stage.focus.x = …, stage.focus.scale = …).
  const focus = { x: 0, y: 0, z: 0, scale };
  const aimed = { x: NaN, y: NaN, z: NaN, scale: NaN };
  const RIM_DIR = new THREE.Vector3(36, 16, -42);
  const FILL_DIR = new THREE.Vector3(24, 10, 30);
  function aimLights() {
    if (aimed.x === focus.x && aimed.y === focus.y && aimed.z === focus.z && aimed.scale === focus.scale) return;
    Object.assign(aimed, focus);
    const k = focus.scale;
    const place = (light, dir, reach) => {
      light.target.position.set(focus.x, focus.y, focus.z);
      light.position.set(focus.x + dir.x * reach, focus.y + dir.y * reach, focus.z + dir.z * reach);
      light.target.updateMatrixWorld();
    };
    place(lights.key, KEY_DIR, k * 8);
    place(lights.rim, RIM_DIR, k / 10);
    place(lights.fill, FILL_DIR, k / 10);
    Object.assign(lights.key.shadow.camera, { left: -k * 2.6, right: k * 2.6, top: k * 2.6, bottom: -k * 2.6, near: k, far: k * 16 });
    lights.key.shadow.camera.updateProjectionMatrix();
    lights.key.shadow.normalBias = k * 0.004;
  }
  aimLights();

  // The same points of the box at every frame, in an order that owes nothing to time: nothing crawls.
  const box = disc(samples);
  let spread = false;
  function spreadKey(k) {
    const size = samples >= 4 ? stage.keySize : 0;
    if (!size) {
      if (spread) {
        aimed.x = NaN; // back to a point
        aimLights();
      }
      spread = false;
      return;
    }
    spread = true;
    const reach = focus.scale * 8;
    const r = reach * Math.tan(size * DEG);
    const [u, v] = box[(k * 7) % samples];
    lights.key.position.set(
      focus.x + KEY_DIR.x * reach + (KEY_U.x * u + KEY_V.x * v) * r,
      focus.y + KEY_DIR.y * reach + (KEY_U.y * u + KEY_V.y * v) * r,
      focus.z + KEY_DIR.z * reach + (KEY_U.z * u + KEY_V.z * v) * r,
    );
  }

  // Orbit rig: tween these numbers, never the camera itself.
  //   t*: look-at point · d: distance · az/el: degrees · shift: px the picture is pushed up · side: px it is pushed left
  const cam = { tx: 0, ty: 0, tz: 0, d: 60, az: 0, el: 30, fov: 28, roll: 0, shift: 0, side: 0, drift: 1 };

  function applyCamera(t, jx = 0, jy = 0) {
    const p = stage.pose ? { ...cam, ...stage.pose } : cam;
    // a slow, deterministic breath so nothing ever sits perfectly still
    const az = (p.az + p.drift * (Math.sin(t * 0.41) * 0.9 + Math.sin(t * 0.73 + 1.1) * 0.4)) * DEG;
    const el = (p.el + p.drift * Math.sin(t * 0.37 + 0.7) * 0.5) * DEG;
    const ce = Math.cos(el);
    camera.position.set(p.tx + p.d * Math.sin(az) * ce, p.ty + p.d * Math.sin(el), p.tz + p.d * Math.cos(az) * ce);
    camera.up.set(0, 1, 0);
    camera.lookAt(p.tx, p.ty, p.tz);
    if (p.roll) camera.rotateZ(p.roll * DEG);
    camera.fov = p.fov;
    // the closest the camera needs to see grows with its distance: depth stays precise far away (no fighting surfaces)
    camera.near = Math.min(60, Math.max(0.5, p.d * 0.012));
    if (p.shift || p.side || jx || jy) camera.setViewOffset(W, H, (p.side ?? 0) + jx, p.shift + jy, W, H);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }

  const before = [];
  const after = [];
  const v = new THREE.Vector3();
  let frameTime = 0;

  // sample k of the shutter: the last one is the frame's own instant
  const cuts = []; // instants where the film cuts: the shutter never straddles one (no ghost of the previous shot)
  function advance(k) {
    const open = samples > 1 ? (shutter / FPS) * (1 - k / (samples - 1)) : 0;
    let t = frameTime - open;
    // just after the cut, never on it: at the very instant, the timeline may still hold the previous shot
    for (const c of cuts) if (c <= frameTime + 1e-6 && t < c + 1e-3) t = Math.max(t, Math.min(frameTime, c + 1e-3));
    for (const fn of before) fn(t);
    aimLights();
    spreadKey(k);
    applyCamera(t, samples > 1 ? halton(k + 1, 2) - 0.5 : 0, samples > 1 ? halton(k + 1, 3) - 0.5 : 0);
  }

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }));
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new ShutterPass(scene, camera, samples, advance));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), bloom[0], bloom[1], bloom[2]);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());
  const gradePass = new ShaderPass(GRADE);
  composer.addPass(gradePass);

  // The look of the house, as numbers a film can tween: firm contrast, cool shadows, warm lights.
  const grade = {
    contrast: 1.16, pivot: 0.36, saturation: 1.06,
    shadows: new THREE.Color(-0.006, 0.002, 0.012), highlights: new THREE.Color(0.014, 0.004, -0.014),
    gel: new THREE.Color(1, 1, 1), gelAmount: 0, vignette: 0.22,
  };
  function applyGrade() {
    const u = gradePass.uniforms;
    u.uContrast.value = grade.contrast;
    u.uPivot.value = grade.pivot;
    u.uSaturation.value = grade.saturation;
    u.uShadows.value.copy(grade.shadows);
    u.uHighlights.value.copy(grade.highlights);
    u.uGel.value.copy(grade.gel);
    u.uGelAmount.value = grade.gelAmount;
    u.uVignette.value = grade.vignette;
  }

  const stage = {
    renderer, scene, camera, composer, bloomPass, lights, cam, grade, focus, keySize,
    /** Declare a cut at `t`: the frames around it stay clean (the motion blur never mixes two shots). */
    cut: (t) => cuts.push(t),
    /** Set to a partial pose to hold the camera there whatever the timeline says (the cover exporter does). */
    pose: null,
    /** fn(t): move the world. Called once per shutter sample — it must depend on `t` only. */
    onUpdate: (fn) => before.push(fn),
    /** fn(t): read the world, once per frame, after the picture is made — project labels, write counters. */
    onProject: (fn) => after.push(fn),
    /** World size → pixels at distance 1. Point sprites need it. */
    pixelScale: () => H / (2 * Math.tan((cam.fov * DEG) / 2)),
    /** Object3D or Vector3 → canvas pixels. */
    project(obj) {
      if (obj.isObject3D) obj.getWorldPosition(v);
      else v.copy(obj);
      v.project(camera);
      return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, behind: v.z > 1 };
    },
    renderAt(t) {
      frameTime = t;
      for (const fn of before) fn(t); // the grade is read at the frame's own instant
      applyGrade();
      composer.render();
      applyCamera(t); // the unjittered camera of this instant, for the labels
      scene.updateMatrixWorld(true);
      for (const fn of after) fn(t);
    },
    start() {
      window.addEventListener("hf-seek", (e) => stage.renderAt(e.detail.time));
      stage.renderAt(window.__hfThreeTime || 0);
    },
  };
  return stage;
}
