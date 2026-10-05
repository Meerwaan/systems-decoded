// DOSSIER __ID__ — __TITLE__.
// Squelette d'épisode : un plan continu, trois actes, tout calé sur le script (T.at).
// Remplace le modèle de démonstration par le vrai système (voir episodes/001-detecteur-fumee/src/model.js).
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { makePart, addMesh, solid, glow, setGlow, explode } from "@kit/build3d.js";
import { buildCaptions, createCallouts, setAct, brandHud, pad2 } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);

/** Modèle de démonstration : trois pièces empilées. Unités = centimètres, Y vers le haut. */
function buildModel() {
  const root = new THREE.Group();
  const base = makePart("base", { lift: 0 });
  addMesh(base, new THREE.CylinderGeometry(5, 5, 1, 96), solid(BRAND.plastic), { pos: [0, 0.5, 0] });
  const core = makePart("core", { lift: 4, delay: 0.15 });
  addMesh(core, new THREE.CylinderGeometry(2.2, 2.2, 1.2, 64), solid(BRAND.black), { pos: [0, 1.6, 0] });
  const heart = glow(BRAND.veille, 0.3);
  addMesh(core, new THREE.SphereGeometry(0.5, 32, 16), heart, { pos: [0, 2.5, 0], edges: false });
  const cover = makePart("cover", { lift: 8, delay: 0 });
  addMesh(cover, new THREE.CylinderGeometry(5.2, 5.2, 1.4, 96), solid(BRAND.plastic), { pos: [0, 2.9, 0] });
  const anchor = new THREE.Object3D();
  anchor.position.set(1.6, 2.4, 1.6);
  core.add(anchor);
  root.add(base, core, cover);
  return { root, parts: { base, core, cover }, heart, anchor };
}

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"));
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera
  const surface = makeSurface();
  const pool = makePool();
  const motes = makeMotes();
  const model = buildModel();
  scene.add(surface.group, pool.mesh, motes.points, model.root);
  const partList = Object.values(model.parts);

  // S = l'état du monde. On n'anime que ces nombres ; la boucle par image les applique.
  const S = { explode: 0, heart: 0.3, fire: 0, haze: 0.12, pool: 0.22 };
  Object.assign(cam, { tx: 0, ty: 1.8, tz: 0, d: 64, az: -28, el: 28, shift: 60 });

  const tl = gsap.timeline({ paused: true }); // la page (enregistrée auprès de HyperFrames)
  const tw = gsap.timeline({ paused: true }); // le monde (calé par la scène, plus bas)
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const shots = [];
  const shot = (at, dur, pose, ease = "power3.inOut") => shots.push({ at, dur, pose, ease });

  const t = {
    explode: T.at("explode"),
    coeur: T.at("autopsie:cœur"),
    trigger: T.at("trigger"),
    chute: T.at("chute"),
    like: T.at("like"),
    rewind: T.at("rewind"),
  };

  /* 01 · MENACE */
  setAct(tl, 1, 0);
  st(T.at("menace"), 1.2, { fire: 0.7, haze: 0.7 });
  shot(0, T.at("boite"), { az: -18, d: 60 }, "sine.inOut");

  /* 02 · AUTOPSIE */
  setAct(tl, 2, T.at("ouvre"));
  st(t.explode, 2.0, { explode: 1 }, "none");
  st(t.explode, 1.2, { fire: 0.1, haze: 0.12 });
  shot(t.explode, 2.2, { ty: 6, d: 80, az: 6, el: 22, shift: 140 });
  const co = createCallouts(stage, $("callouts"), $("leaders"));
  co.add({ title: "Le cœur", x: 760, y: 700, align: "start", tone: "system", anchor: model.anchor })
    .show(tl, t.coeur)
    .hide(tl, t.trigger - 0.3);

  /* 03 · RÉPONSE */
  setAct(tl, 3, T.at("reponse"));
  st(t.trigger, 0.12, { heart: 8, fire: 1 }, "power2.out");
  st(t.trigger + 0.12, 1.2, { heart: 2 });
  tl.to("#flash", { opacity: 0.3, duration: 0.05 }, t.trigger);
  tl.to("#flash", { opacity: 0, duration: 0.5 }, t.trigger + 0.05);

  /* chute + appels à l'action */
  st(t.chute, 1.6, { explode: 0, fire: 0.1 }, "none");
  shot(t.chute, 1.8, { ty: 1.8, d: 62, az: -20, el: 27, shift: -10 });
  tl.fromTo("#reveal", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.chute + 0.2);
  tl.to("#reveal", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.like - 0.2);

  /* rebouclage : la dernière image redevient la première */
  const back = Math.min(1.1, END - t.rewind - 0.04);
  shot(t.rewind, back, { tx: 0, ty: 1.8, tz: 0, d: 64, az: -28, el: 28, shift: 60 }, "power3.inOut");
  st(t.rewind, back, { fire: 0, haze: 0.12, heart: 0.3 });
  setAct(tl, 1, t.rewind + 0.2);

  brandHud(tl, { decodedAt: t.chute + 0.6, resetAt: t.rewind + 0.2 });
  buildCaptions($("captions"), EP, tl);
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => {
    const room = (shots[i + 1]?.at ?? END) - s.at;
    tw.to(cam, { ...s.pose, duration: Math.min(s.dur, Math.max(0.05, room)), ease: s.ease }, s.at);
  });

  const veille = new THREE.Color(BRAND.veille);
  const signal = new THREE.Color(BRAND.signal);
  const mix = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgFire = new THREE.Color(0x150b07);
  stage.onUpdate((time) => {
    tw.time(time);
    explode(partList, S.explode);
    setGlow(model.heart, S.heart);
    mix.copy(veille).lerp(signal, S.fire);
    lights.rim.color.copy(mix);
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    scene.background.copy(bg0).lerp(bgFire, S.fire * 0.8);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = S.haze;
    motes.update(time, stage.pixelScale());
  });
  const clock = $("hud-clock");
  stage.onProject((time) => {
    const s = Math.floor(3 * 3600 + 7 * 60 + time);
    clock.textContent = `${pad2(s / 3600)}:${pad2((s % 3600) / 60)}:${pad2(s % 60)}`;
  });

  stage.start();
  return tl;
}

window.SD = { build };
