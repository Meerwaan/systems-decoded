// DOSSIER 001 — Détecteur de fumée. One continuous shot, three acts:
//   01 MENACE (ceiling, clock, countdown) → 02 AUTOPSIE (exploded view, optical chamber)
//   → 03 RÉPONSE (smoke, scatter, alarm) → chute + appels à l'action → rebouclage.
// Every moment is read off the script (T.at), so a new voice take re-times the whole film.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { explode, setPartOpacity, setGlow, glow, fatLine } from "@kit/build3d.js";
import { buildCaptions, createCallouts, setAct, brandHud, pad2 } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildDetector } from "./model.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const fract = (x) => x - Math.floor(x);
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const mmss = (sec) => `${pad2(sec / 60)}:${pad2(sec % 60)}`;

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { scale: 9 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const surface = makeSurface();
  const pool = makePool();
  const motes = makeMotes();
  const det = buildDetector();
  const { parts, fx, A } = det;
  scene.add(surface.group, pool.mesh, motes.points, det.root);
  const partList = Object.values(parts);
  const lifts = Object.fromEntries(Object.entries(parts).map(([k, p]) => [k, p.userData.part.lift]));

  // signal path photodiode → board → sounder (exists only in the exploded state)
  const wirePts = fx.wire(lifts).map((p) => new THREE.Vector3(...p));
  const wire = fatLine(wirePts.map((p) => p.toArray()), { color: BRAND.signal, width: 2.2, dashed: true, dashSize: 0.16, gapSize: 0.12 });
  const wireLen = [0];
  for (let i = 1; i < wirePts.length; i++) wireLen.push(wireLen[i - 1] + wirePts[i].distanceTo(wirePts[i - 1]));
  const along = (u, out) => {
    const d = clamp01(u) * wireLen.at(-1);
    let i = 1;
    while (i < wirePts.length - 1 && wireLen[i] < d) i++;
    return out.lerpVectors(wirePts[i - 1], wirePts[i], (d - wireLen[i - 1]) / (wireLen[i] - wireLen[i - 1]));
  };
  const pulse = Array.from({ length: 7 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.2 - i * 0.02, 16, 12), glow(BRAND.signal, 7 - i * 0.8, { additive: true }));
    m.visible = false;
    det.root.add(m);
    return m;
  });
  det.root.add(wire);

  /* ───────────────────────────── state ───────────────────────────── */
  const S = {
    explode: 0, lidUp: 0,
    aCover: 1, aMesh: 1, aLid: 1, aRest: 1,
    beam: 0, view: 0, scatter: 0, pd: 0, alarm: 0, ring: 0, wire: 0, pulse: -0.2,
    smoke: -1, smokeAmt: 0, air: -1, airAmt: 0, day: 0, dayA: 0,
    haze: 0.12, fire: 0, pool: 0.22, grid: 0.16, led: 1, btn: 0, press: 0,
  };
  Object.assign(cam, { tx: 0, ty: 0, tz: 17, d: 150, az: 0, el: 80, shift: 0 });

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage, below)
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);

  // camera shots never overlap: each one is cut short by the next
  const shots = [];
  const shot = (at, dur, pose, ease = "power3.inOut") => shots.push({ at, dur, pose, ease });
  const commitShots = () => {
    shots.sort((a, b) => a.at - b.at);
    shots.forEach((s, i) => {
      const room = (shots[i + 1]?.at ?? END) - s.at;
      tw.to(cam, { ...s.pose, duration: Math.min(s.dur, Math.max(0.05, room)), ease: s.ease }, s.at);
    });
  };

  const flash = (at, k = 1) => {
    st(at, 0.06, { beam: k }, "power2.out");
    st(at + 0.06, 0.6, { beam: 0 }, "power2.out");
  };
  const scatter = (at, k, pdLevel) => {
    st(at + 0.02, 0.07, { scatter: k, pd: pdLevel }, "power2.out");
    st(at + 0.09, 0.56, { scatter: 0, pd: pdLevel * 0.3 }, "power2.out");
  };

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    dors: T.at("hook:dors"), nez: T.at("hook:nez"), aussi: T.at("hook:aussi$"),
    feu: T.at("feu"), feuWord: T.at("feu:feu"), countdown: T.at("countdown"), feuEnd: T.at("feu$"),
    boite: T.at("boite"), swoop: T.at("swoop"), jamais: T.at("boite:jamais"), boiteEnd: T.at("boite$"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    pile: T.at("eclate:pile"), circuit: T.at("eclate:circuit"), sirenePart: T.at("eclate:sirène"), centre: T.at("eclate:centre"), chambre: T.at("eclate:chambre"),
    dive: T.at("dive"), laby: T.at("laby"), air: T.at("laby:air"), lumiere: T.at("laby:lumière"), labyEnd: T.at("laby$"),
    led: T.at("led:LED"), ledEnd: T.at("led$"),
    capteur: T.at("capteur:capteur"), place: T.at("capteur:Placé"), capteurEnd: T.at("capteur$"),
    calme: T.at("calme"), bien: T.at("calme:tout"), calmeEnd: T.at("calme$"),
    fumee: T.at("fumee"), smoke: T.at("smoke"), ricochet: T.at("ricochet"), voit: T.at("flash6"),
    verif: T.at("verif"), alarm: T.at("alarm"),
    sirene: T.at("sirene"), droit: T.at("sirene:Droit"), sens: T.at("sirene:seul"), sireneEnd: T.at("sirene$"),
    reassemble: T.at("reassemble"), fumeeMot: T.at("chute:fumée"), cest: T.at("chute:C'est"), lumiereMot: T.at("chute:lumière"), xray: T.at("xray"), chuteEnd: T.at("chute$"),
    like: T.at("like"), likeMot: T.at("like:like"), likeEnd: T.at("like$"),
    test: T.at("test"), bouton: T.at("test:bouton"), commentaire: T.at("test:commentaire"), press: T.at("press"), typed: T.at("typed"), testEnd: T.at("test$"),
    abo: T.at("abo"), next: T.at("next"), trente: T.at("abo:30"), aboEnd: T.at("abo$"),
    boucle: T.at("boucle"), rewind: T.at("rewind"),
  };
  const flashes = ["flash1", "flash2", "flash3", "flash4", "flash5", "flash6", "flash7", "flash8"].map((c) => T.at(c));

  /* ════════════════════ 01 · MENACE ════════════════════ */
  setAct(tl, 1, 0);
  shot(0, t.feu, { d: 132, tz: 15 }, "sine.inOut");
  shot(t.feu, t.boite - t.feu, { d: 108, tz: 11.5, az: 6 }, "sine.inOut");
  st(t.feu, 1.4, { fire: 0.75, haze: 0.85 }, "power1.out"); // the fire next door reaches the ceiling
  tl.fromTo("#fireglow", { opacity: 0, y: 260 }, { opacity: 1, y: 0, duration: 2.2, ease: "power1.out" }, t.feu + 0.1);
  tl.to("#fireglow", { opacity: 0.45, duration: 1.6, ease: "sine.inOut" }, t.swoop);

  // the clock: giant for the first beat, then it becomes the HUD clock
  tl.fromTo("#hud-clock", { opacity: 0 }, { opacity: 1, duration: 0.3 }, t.dors + 0.25);
  tl.to("#bigclock", { scale: 0.21, x: 318, y: -752, opacity: 0, duration: 0.55, ease: "power3.in" }, t.dors - 0.12);

  // "ton nez dort aussi": the human, read like a system
  tl.fromTo("#senses", { opacity: 0, y: 338 }, { opacity: 1, y: 314, duration: 0.4, ease: "power3.out" }, t.dors + 0.2);
  tl.fromTo("#sense-vue", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.dors + 0.45);
  tl.fromTo("#sense-odorat", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.nez);
  tl.fromTo("#sense-ouie", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.aussi + 0.1);
  tl.to("#senses", { opacity: 0, y: 290, duration: 0.3, ease: "power2.in" }, t.countdown - 0.3);

  // "dans 3 minutes": the countdown that runs under everything else
  tl.fromTo("#bigcount", { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" }, t.countdown - 0.05);
  tl.to("#bigcount", { scale: 0.15, x: 356, y: -668, opacity: 0, duration: 0.55, ease: "power3.in" }, t.boite - 0.35);
  tl.fromTo("#hud-count", { opacity: 0 }, { opacity: 1, duration: 0.25 }, t.boite + 0.1);

  // "elle est au plafond": swoop from the ceiling view to the object
  shot(t.boite, t.swoop - t.boite, { d: 86, tz: 8, az: 2 }, "sine.inOut");
  shot(t.swoop, 2.3, { tx: 0, ty: 1.8, tz: 0, d: 60, az: -30, el: 29, shift: 110 });
  st(t.swoop, 2.0, { pool: 0.5, grid: 0.3, haze: 0.4 });
  const coDetector = createCallouts(stage, $("callouts"), $("leaders"));
  const cDet = coDetector.add({ title: "Détecteur de fumée", sub: "Obligatoire depuis 2015", x: 590, y: 520, align: "start", anchor: A.cover });
  cDet.show(tl, t.swoop + 1.5).hide(tl, t.explode - 0.1);

  /* ════════════════════ 02 · AUTOPSIE ════════════════════ */
  setAct(tl, 2, t.ouvre);
  st(t.explode, 2.3, { explode: 1 }, "none"); // staggered inside explode()
  st(t.explode, 1.2, { fire: 0.15, haze: 0.12, pool: 0.34 });
  shot(t.explode, 2.4, { ty: 7.5, d: 88, az: -12, el: 21, shift: 150 });
  shot(t.pile, t.chambre + 0.6 - t.pile, { az: 12, el: 23 }, "sine.inOut");
  tl.to("#fireglow", { opacity: 0, duration: 1.2 }, t.explode);

  const co = createCallouts(stage, $("callouts"), $("leaders"));
  const cPile = co.add({ title: "Pile", sub: "Jusqu'à 10 ans", x: 262, y: 925, align: "end", anchor: A.battery });
  const cCircuit = co.add({ title: "Circuit", sub: "Le juge", x: 786, y: 1150, align: "start", anchor: A.pcb });
  const cSirene = co.add({ title: "Sirène", sub: "85 dB", x: 812, y: 880, align: "start", anchor: A.buzzer });
  const cChambre = co.add({ title: "Chambre noire", x: 318, y: 668, align: "end", tone: "system", anchor: A.chamber });
  cPile.show(tl, t.pile);
  cCircuit.show(tl, t.circuit);
  cSirene.show(tl, t.sirenePart);
  cChambre.show(tl, t.chambre - 0.1);
  [cPile, cCircuit, cSirene].forEach((c) => c.hide(tl, t.chambre + 0.5));
  cChambre.hide(tl, t.dive + 0.1);
  st(t.chambre, 0.6, { aRest: 0.3, aCover: 0.3, aMesh: 0.5 }); // everything steps back but the chamber

  // dive into the chamber: lid off, we look inside
  shot(t.dive, 1.5, { tx: 0, ty: lifts.chamber + det.dims.BEAM_Y, tz: 0, d: 33, az: -4, el: 52, shift: 30 });
  st(t.dive, 0.9, { aCover: 0, aMesh: 0, aLid: 0, lidUp: 1, aRest: 0, grid: 0.07, pool: 0.1 });
  shot(t.laby + 0.9, t.calmeEnd - t.laby, { az: 6, d: 31 }, "sine.inOut");
  const cLaby = co.add({ title: "Labyrinthe", x: 286, y: 1176, align: "end", anchor: A.blade });
  cLaby.show(tl, t.laby).hide(tl, t.labyEnd + 0.3);
  st(t.air - 0.45, 0.3, { airAmt: 1 });
  tw.fromTo(S, { air: 0 }, { air: 7.5, duration: 7.5, ease: "none" }, t.air - 0.45);
  st(t.led, 0.6, { airAmt: 0 });
  st(t.lumiere - 0.1, 0.2, { dayA: 1 }, "none");
  st(t.lumiere - 0.1, 0.5, { day: 1 }, "power2.in"); // daylight rushes in… and dies on the blades
  st(t.labyEnd + 0.2, 0.5, { dayA: 0 });

  // the LED fires into the void; the sensor sits where the flash does not go
  const cLed = co.add({ title: "LED infrarouge", x: 336, y: 664, align: "end", tone: "system", anchor: A.led });
  const cPd = co.add({ title: "Capteur", sub: "Photodiode", x: 742, y: 664, align: "start", anchor: A.pd });
  cLed.show(tl, t.led - 0.1).hide(tl, t.fumee - 0.2);
  cPd.show(tl, t.capteur - 0.1).hide(tl, t.fumee - 0.2);
  st(t.place, 0.5, { view: 1 });
  flashes.slice(0, 4).forEach((at) => flash(at));

  // the scope: what the sensor receives, flash after flash
  tl.fromTo("#scope", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.ledEnd + 0.1);
  const plot = $("scope-plot");
  const levels = [0.07, 0.05, 0.08, 0.06, 0.4, 0.86, 0.9, 0.94];
  flashes.forEach((at, i) => {
    const bar = document.createElement("div");
    bar.className = `bar ${levels[i] > 0.62 ? "bar--hot" : ""}`;
    bar.style.left = `${24 + i * 112}px`;
    bar.style.height = `${Math.round(levels[i] * 100)}%`;
    plot.append(bar);
    tl.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 0.16, ease: "power3.out" }, at + 0.04);
    tl.set("#scope-n", { textContent: `Flash ${i + 1}` }, at);
  });
  tl.fromTo("#scope-s0", { opacity: 0 }, { opacity: 1, duration: 0.25 }, t.bien);
  tl.set("#scope-s1", { opacity: 0 }, 0);
  tl.set("#scope-s2", { opacity: 0 }, 0);

  /* ════════════════════ 03 · RÉPONSE ════════════════════ */
  setAct(tl, 3, t.fumee);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.22, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.fumee);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.7, ease: "power2.out" }, t.fumee + 0.12);
  st(t.smoke, 0.5, { smokeAmt: 1, fire: 0.7, haze: 0.7 });
  tw.fromTo(S, { smoke: -0.2 }, { smoke: 30, duration: 30.2, ease: "none" }, t.smoke);
  shot(t.fumee - 0.3, 1.6, { d: 38, el: 46, az: -8 });
  shot(t.ricochet, 3.2, { d: 29, el: 54, az: 4 }, "sine.inOut");
  st(t.fumee - 0.2, 0.4, { view: 0.35 });

  flash(flashes[4], 1);
  scatter(flashes[4], 0.45, 0.25);
  flash(flashes[5], 1.05);
  scatter(flashes[5], 1, 1); // "le capteur VOIT"
  tl.to("#flash", { opacity: 0.2, duration: 0.05 }, t.voit + 0.03);
  tl.to("#flash", { opacity: 0, duration: 0.5 }, t.voit + 0.08);
  shot(t.voit, 0.5, { d: 26 }, "power3.out");
  tl.to("#scope-s0", { opacity: 0, duration: 0.15 }, t.voit);
  tl.to("#scope-s1", { opacity: 1, duration: 0.15 }, t.voit + 0.1);
  [6, 7].forEach((i) => {
    flash(flashes[i], 1.05);
    scatter(flashes[i], 1, 1);
  });
  tl.set("#scope-n", { textContent: "Confirmé 3/3" }, flashes[7] + 0.3);

  // ALARM: the verdict runs down the board to the sounder — the camera follows it
  tl.to("#scope-s1", { opacity: 0, duration: 0.1 }, t.alarm);
  tl.to("#scope-s2", { opacity: 1, duration: 0.1 }, t.alarm + 0.05);
  tl.to("#flash", { opacity: 0.32, duration: 0.05 }, t.alarm);
  tl.to("#flash", { opacity: 0, duration: 0.6 }, t.alarm + 0.05);
  tl.to("#scope", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.alarm + 0.55);
  st(t.alarm, 0.15, { alarm: 1, pd: 1.3, view: 0 }, "power2.out");
  st(t.alarm, 0.5, { aRest: 1, wire: 1, fire: 1, grid: 0.16, pool: 0.3 });
  tw.fromTo(S, { pulse: 0 }, { pulse: 1.12, duration: 0.85, ease: "power1.inOut" }, t.alarm + 0.1);
  st(t.alarm + 0.8, 0.25, { ring: 1 }, "power2.out");
  shot(t.alarm + 0.05, 1.15, { tx: 2.55, ty: lifts.buzzer + 1.5, tz: 2.4, d: 38, az: -42, el: 33, shift: -120 });
  tl.fromTo("#tint", { opacity: 0 }, { opacity: 0.5, duration: 0.3 }, t.alarm + 0.75);

  // "85 décibels"
  tl.fromTo("#db", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.28, ease: "power4.out" }, t.sirene - 0.05);
  tl.to("#db", { opacity: 0, y: -30, duration: 0.3, ease: "power2.in" }, t.droit + 0.25);
  shot(t.sirene, t.sireneEnd - t.sirene, { d: 41, az: -34 }, "sine.inOut");
  // "le seul sens qui te reste": the panel from the first beat comes back, one line still alive
  tl.fromTo("#senses", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: false }, t.droit + 0.45);
  tl.to("#sense-ouie-s", { color: "#ff5b2e", duration: 0.12 }, t.sens);
  tl.set("#sense-ouie-t", { textContent: "Réveil" }, t.sens);
  tl.fromTo("#sense-ouie", { scale: 1 }, { scale: 1.1, duration: 0.14, ease: "power2.out", transformOrigin: "0 50%", immediateRender: false }, t.sens);
  tl.to("#sense-ouie", { scale: 1, duration: 0.4, ease: "power2.out" }, t.sens + 0.14);
  tl.to("#senses", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.reassemble);

  /* ════════════════════ chute ════════════════════ */
  st(t.reassemble, 1.7, { explode: 0 }, "none");
  st(t.reassemble, 0.7, { aCover: 1, aMesh: 1, aLid: 1, lidUp: 0, wire: 0 });
  st(t.reassemble, 1.2, { ring: 0.35, fire: 0.45, pool: 0.4 });
  tl.to("#tint", { opacity: 0.16, duration: 1 }, t.reassemble);
  shot(t.reassemble, 1.9, { tx: 0, ty: 1.9, tz: 0, d: 62, az: -22, el: 27, shift: -10 });
  shot(t.reassemble + 1.9, t.like - t.reassemble, { az: -6, el: 30 }, "sine.inOut");

  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.reassemble + 0.25);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.fumeeMot + 0.1);
  tl.to("#retitle-k", { opacity: 0, duration: 0.15 }, t.cest - 0.05);
  tl.set("#retitle-k", { textContent: "C'est un", color: "#5cffb0" }, t.cest + 0.1);
  tl.to("#retitle-k", { opacity: 1, duration: 0.15 }, t.cest + 0.1);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.lumiereMot - 0.12);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.lumiereMot + 0.02);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.chuteEnd + 0.3);
  // the dossier header corrects itself
  tl.set("#hud-title", { textContent: "Détecteur de lumière" }, t.lumiereMot + 0.05);
  tl.fromTo("#hud-title", { color: "#5cffb0" }, { color: "#e9e4d8", duration: 1.2, ease: "power1.in", immediateRender: false }, t.lumiereMot + 0.05);
  // "enfermé dans le noir": the shell turns to glass, the chamber is still at work inside
  st(t.xray, 0.6, { aCover: 0.13, aLid: 0, aMesh: 0.25, ring: 0, alarm: 0, pd: 0, fire: 0.1, haze: 0.1, smokeAmt: 0.25 });
  tl.to("#tint", { opacity: 0, duration: 0.6 }, t.xray);
  flash(t.xray + 0.75, 1.1);
  flash(t.chuteEnd + 0.75, 1.1);
  // the countdown pays off: the alarm bought you two minutes
  tl.fromTo("#co-count", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.chuteEnd + 0.65);
  tl.to("#hud-count", { color: "#5cffb0", duration: 0.3 }, t.chuteEnd + 0.5);
  tl.set("#hud-count-l", { textContent: "Pour sortir" }, t.chuteEnd + 0.5);
  tl.to("#co-count", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.likeMot - 0.5);

  /* ════════════════════ appels à l'action ════════════════════ */
  const rail = (id, from, to) => {
    const arrows = $(id).querySelectorAll("i");
    tl.fromTo($(id), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, from);
    const beats = Math.max(1, Math.floor((to - from - 0.3) / 0.6));
    arrows.forEach((arrow, i) => {
      tl.fromTo(arrow, { opacity: 0.25 }, { opacity: 1, duration: 0.3, ease: "sine.inOut", repeat: beats * 2 - 1, yoyo: true }, from + 0.1 + i * 0.1);
    });
    tl.to($(id), { opacity: 0, duration: 0.25 }, to);
  };

  // LIKE — motivated by the story: someone out there sleeps without one.
  // Twelve ceilings; yours is equipped. Each like carries the film to another one.
  st(t.like, 0.8, { aCover: 1, aMesh: 1, aLid: 1, smokeAmt: 0, led: 2.2 });
  shot(t.like, t.test - t.like, { az: 14, el: 27, d: 62, shift: -30 }, "sine.inOut");
  const grid = $("net-grid");
  const tiles = Array.from({ length: 12 }, (_, i) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.innerHTML = '<i class="tile__on"></i><i class="tile__dot"></i>' + (i === 0 ? '<span class="tile__you">TOI</span>' : "");
    grid.append(tile);
    return tile;
  });
  tl.fromTo("#net", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.likeMot - 0.15);
  tiles.slice(1).forEach((tile) => tl.set(tile.querySelectorAll(".tile__on, .tile__dot"), { opacity: 0 }, 0));
  tl.fromTo("#net-wave", { scale: 1, opacity: 0 }, { scale: 6, opacity: 0, duration: 1.1, ease: "power2.out", keyframes: { opacity: [0.9, 0.5, 0] } }, t.likeMot + 0.1);
  [[7, T.at("like:remontera")], [4, T.at("like:quelqu'un")], [10, T.at("like:dort")], [2, T.at("like:détecteur")]].forEach(([i, at], n) => {
    const tile = tiles[i];
    tl.to(tile.querySelector(".tile__on"), { opacity: 1, duration: 0.15 }, at);
    tl.fromTo(tile.querySelector(".tile__dot"), { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, at);
    tl.fromTo(tile, { scale: 1 }, { scale: 1.16, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, at);
    tl.set("#net-n", { textContent: `Plafonds équipés ${n + 2}/12` }, at);
  });
  rail("rail-like", t.likeMot, t.likeEnd + 0.15);
  tl.to("#net", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, t.likeEnd + 0.15);

  // COMMENTAIRE — the test button, then the question it raises
  shot(t.test - 0.2, 1.7, { el: 63, az: 0, d: 70, ty: 2.6, shift: -30 });
  st(t.bouton - 0.1, 0.35, { btn: 1, led: 1 });
  const cBtn = co.add({ title: "Bouton test", sub: "1 fois par mois", x: 318, y: 468, align: "end", tone: "system", anchor: A.button });
  cBtn.show(tl, t.bouton).hide(tl, t.commentaire - 0.1);
  tl.fromTo("#cta-field", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.commentaire);
  const caretBlinks = Math.max(1, Math.floor((t.typed - t.commentaire) / 0.5));
  tl.fromTo("#cta-caret", { opacity: 1 }, { opacity: 0, duration: 0.25, ease: "steps(1)", repeat: caretBlinks * 2 - 1, yoyo: true }, t.commentaire + 0.3);
  rail("rail-comment", t.commentaire, t.testEnd + 0.15);
  st(t.press, 0.09, { press: 1 }, "power2.in");
  st(t.press + 0.09, 0.3, { press: 0 }, "back.out(3)");
  st(t.press + 0.05, 0.1, { alarm: 0.9, ring: 0.9 }, "power2.out"); // the test chirp
  st(t.press + 0.5, 0.5, { alarm: 0, ring: 0 });
  for (let i = 1; i <= 6; i++) tl.set("#cta-typed", { width: `${i}ch` }, t.typed + (i - 1) * 0.055);
  tl.set("#cta-caret", { opacity: 1 }, t.typed);
  tl.to("#cta-field", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, t.testEnd + 0.15);
  st(t.testEnd, 0.4, { btn: 0 });

  // ABONNEMENT — the next file, classified; one number as bait
  shot(t.abo - 0.15, 1.6, { el: 30, az: -18, d: 80, ty: 1.9, shift: -110 });
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.abo + 0.15);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.next);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.trente - 0.05);
  rail("rail-follow", t.abo + 0.1, t.aboEnd + 0.2);
  tl.to("#next", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.boucle + 0.1);

  /* ════════════════════ rebouclage ════════════════════
     "Avant qu'il soit…" → the film rewinds to its first frame, where the voice says "Trois heures sept". */
  const back = Math.min(1.25, END - t.rewind - 0.04);
  shot(t.boucle, t.rewind - t.boucle, { el: 44, az: -8, d: 84, shift: -40 }, "sine.inOut");
  shot(t.rewind, back, { tx: 0, ty: 0, tz: 17, d: 150, az: 0, el: 80, shift: 0 }, "power3.inOut");
  st(t.rewind, back, { haze: 0.12, fire: 0, pool: 0.22, grid: 0.16, led: 1 });
  setAct(tl, 1, t.rewind + 0.2);
  tl.set("#hud-title", { textContent: "Détecteur de fumée" }, t.rewind + 0.3);
  tl.to("#hud-clock", { opacity: 0, duration: 0.25 }, t.rewind + back - 0.5);
  tl.to("#hud-count", { opacity: 0, duration: 0.25 }, t.rewind + back - 0.5);
  tl.fromTo("#bigclock", { scale: 0.21, x: 318, y: -752, opacity: 0 }, { scale: 1, x: 0, y: 0, opacity: 1, duration: back - 0.2, ease: "power3.out", immediateRender: false }, t.rewind + 0.2);

  brandHud(tl, { decodedAt: t.lumiereMot + 0.25, resetAt: t.rewind + 0.2 });

  /* ───────────────────────── captions, commit ───────────────────────── */
  buildCaptions($("captions"), EP, tl);
  commitShots();

  /* ───────────────────────── per-frame: state → world ───────────────────────── */
  const clock0 = 3 * 3600 + 8 * 60 - T.at("clock308"); // so the HUD reads 03:08:00 when the voice says it
  const tmp = new THREE.Vector3();
  const mix = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgFire = new THREE.Color(0x150b07);
  const buttonY = fx.button.position.y;

  stage.onUpdate((time) => {
    tw.time(time);
    const px = stage.pixelScale();

    explode(partList, S.explode);
    parts.lid.position.y += S.lidUp * 7;
    setPartOpacity(parts.cover, S.aCover);
    setPartOpacity(parts.mesh, S.aMesh);
    setPartOpacity(parts.lid, S.aLid);
    for (const key of ["base", "pcb", "battery", "buzzer"]) setPartOpacity(parts[key], S.aRest);

    // optical chamber
    const inside = S.explode > 0.5 || S.aCover < 0.5 ? 1 : 0; // nothing glows through an opaque shell
    setGlow(fx.led, 0.25 + S.beam * 7);
    fx.beam.opacity = S.beam * 0.34 * inside;
    fx.beamCore.material.opacity = Math.min(1, S.beam) * inside;
    fx.view.opacity = S.view * 0.1;
    fx.viewLines.forEach((l) => (l.material.opacity = S.view * 0.75));
    mix.copy(VEILLE).lerp(SIGNAL, clamp01(S.alarm));
    setGlow(fx.pd, S.pd * 6.5 * inside, mix);
    setGlow(fx.pdHalo.material, 2.4, mix);
    fx.pdHalo.material.opacity = Math.min(1, S.pd * 0.55) * inside;
    fx.rays.forEach(({ ray, spark, phase }, i) => {
      const k = S.scatter * (0.6 + 0.4 * Math.sin(time * 37 + phase * 20 + i)) * inside;
      ray.material.opacity = k;
      spark.material.opacity = Math.min(1, k * 1.4);
      spark.visible = ray.visible = k > 0.01;
    });
    for (const flow of [fx.smoke, fx.puffs, fx.air]) {
      flow.uniforms.uTime.value = time;
      flow.uniforms.uScale.value = px;
      flow.uniforms.uBeam.value = S.beam;
    }
    fx.smoke.uniforms.uProgress.value = S.smoke;
    fx.smoke.uniforms.uAmount.value = S.smokeAmt * inside;
    fx.puffs.uniforms.uProgress.value = S.smoke;
    fx.puffs.uniforms.uAmount.value = S.smokeAmt * inside;
    fx.air.uniforms.uProgress.value = S.air;
    fx.air.uniforms.uAmount.value = S.airAmt;
    fx.daylight.forEach(({ line, stop, length }) => {
      line.material.dashSize = Math.max(0.001, length * S.day);
      line.material.opacity = S.dayA;
      stop.material.opacity = S.dayA * (S.day > 0.96 ? 1 : 0);
      line.visible = stop.visible = S.dayA > 0.01;
    });

    // alarm: sounder rings, signal path
    fx.rings.forEach((ring, i) => {
      const ph = fract(time * 1.55 + i / fx.rings.length);
      ring.scale.setScalar(1 + ph * 7.5);
      ring.material.opacity = Math.pow(1 - ph, 1.6) * S.ring;
      ring.visible = S.ring > 0.01;
    });
    setGlow(fx.buzzerCore, S.alarm * (4 + 2 * Math.sin(time * 42)));
    wire.material.opacity = S.wire * 0.55 * (S.explode > 0.98 ? 1 : 0);
    wire.visible = wire.material.opacity > 0.01;
    pulse.forEach((dot, i) => {
      const u = S.pulse - i * 0.028;
      dot.visible = S.explode > 0.98 && u > 0 && u < 1;
      if (dot.visible) dot.position.copy(along(u, tmp));
    });

    // status LED: a slow heartbeat while it stands by, frantic in alarm
    const beat = S.alarm > 0.3 ? (fract(time * 4) < 0.5 ? 1 : 0.15) : Math.pow(Math.max(0, Math.sin(time * 2.6)), 12);
    mix.copy(VEILLE).lerp(SIGNAL, S.alarm > 0.3 ? 1 : 0);
    setGlow(fx.statusLed, (0.4 + beat * 7) * S.led, mix);
    setGlow(fx.statusHalo.material, 2.5, mix);
    fx.statusHalo.material.opacity = beat * 0.7 * Math.min(1, S.led) * (S.aCover > 0.5 ? 1 : 0.3);

    // test button
    fx.button.position.y = buttonY - S.press * 0.07;
    fx.buttonRing.material.opacity = S.btn * (0.55 + 0.45 * Math.sin(time * 5));
    fx.buttonRing.scale.setScalar(1 + 0.06 * Math.sin(time * 5));
    fx.buttonRing.visible = S.btn > 0.01;

    // mood: mint when the system has the room, orange when the fire does
    mix.copy(VEILLE).lerp(SIGNAL, S.fire);
    lights.rim.color.copy(mix);
    lights.rim.intensity = 1.3 + S.fire * 1.5;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgFire, S.fire * 0.8);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = S.haze;
    motes.update(time, px);
  });

  /* ───────────────────────── per-frame: text that counts ───────────────────────── */
  const hudClock = $("hud-clock");
  const bigHm = $("bigclock-hm");
  const bigSec = $("bigclock-sec");
  const countBig = $("bigcount-v");
  const countHud = $("hud-count-v");
  const countOut = $("co-count-v");
  stage.onProject((time) => {
    // after the rewind the clock is back where the film starts
    const shown = time >= t.rewind + 0.2 ? clamp01((time - t.rewind - 0.2) / 0.5) : 0;
    const now = clock0 + (shown > 0 ? time * (1 - shown) : time);
    const s = Math.floor(now);
    const hms = `${pad2(s / 3600)}:${pad2((s % 3600) / 60)}:${pad2(s % 60)}`;
    hudClock.textContent = hms;
    bigHm.textContent = hms.slice(0, 5);
    bigSec.textContent = hms.slice(5);
    const left = Math.max(0, 180 - Math.max(0, time - t.countdown));
    const txt = mmss(Math.ceil(left));
    countBig.textContent = txt;
    countHud.textContent = txt;
    countOut.textContent = txt;
  });

  stage.start();
  return tl;
}

window.SD = { build };
