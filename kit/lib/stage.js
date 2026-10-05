// The 3D stage: renderer, bloom, lights, an orbit camera rig, and a frame pipeline
// driven only by HyperFrames time (hf-seek) — never by a clock.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { BRAND } from "./brand.js";

const DEG = Math.PI / 180;

export function createStage(canvas, { bloom = [0.6, 0.7, 1.0], fog = 0.0032 } = {}) {
  const { W, H } = BRAND;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BRAND.bg);
  scene.fog = new THREE.FogExp2(BRAND.bg, fog);

  const camera = new THREE.PerspectiveCamera(28, W / H, 0.5, 900);
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 }));
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), bloom[0], bloom[1], bloom[2]);
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  const lights = {
    hemi: new THREE.HemisphereLight(0xa9bccb, 0x06080a, 0.55),
    key: new THREE.DirectionalLight(0xfff1e0, 2.6),
    rim: new THREE.DirectionalLight(BRAND.veille, 1.3),
    fill: new THREE.DirectionalLight(0x8fa6ff, 0.3),
  };
  lights.key.position.set(-30, 52, 38);
  lights.rim.position.set(36, 16, -42);
  lights.fill.position.set(24, 10, 30);
  scene.add(lights.hemi, lights.key, lights.rim, lights.fill);

  // Orbit rig: tween these numbers, never the camera itself.
  //   t*: look-at point · d: distance · az/el: degrees · shift: px the picture is pushed up
  const cam = { tx: 0, ty: 0, tz: 0, d: 60, az: 0, el: 30, fov: 28, roll: 0, shift: 0, drift: 1 };

  function applyCamera(t) {
    // a slow, deterministic breath so nothing ever sits perfectly still
    const az = (cam.az + cam.drift * (Math.sin(t * 0.41) * 0.9 + Math.sin(t * 0.73 + 1.1) * 0.4)) * DEG;
    const el = (cam.el + cam.drift * Math.sin(t * 0.37 + 0.7) * 0.5) * DEG;
    const ce = Math.cos(el);
    camera.position.set(cam.tx + cam.d * Math.sin(az) * ce, cam.ty + cam.d * Math.sin(el), cam.tz + cam.d * Math.cos(az) * ce);
    camera.up.set(0, 1, 0);
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    if (cam.roll) camera.rotateZ(cam.roll * DEG);
    camera.fov = cam.fov;
    if (cam.shift) camera.setViewOffset(W, H, 0, cam.shift, W, H);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }

  const before = [];
  const after = [];
  const v = new THREE.Vector3();

  const stage = {
    renderer, scene, camera, composer, bloomPass, lights, cam,
    /** fn(t): move the world (runs before the camera is placed). */
    onUpdate: (fn) => before.push(fn),
    /** fn(t): read the world (runs after matrices are final — project labels here). */
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
      for (const fn of before) fn(t);
      applyCamera(t);
      scene.updateMatrixWorld(true);
      for (const fn of after) fn(t);
      composer.render();
    },
    start() {
      window.addEventListener("hf-seek", (e) => stage.renderAt(e.detail.time));
      stage.renderAt(window.__hfThreeTime || 0);
    },
  };
  return stage;
}
