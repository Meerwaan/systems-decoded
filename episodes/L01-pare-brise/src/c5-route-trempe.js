// Chapters 9 · Sur la route and 10 · Le verre trempé — beats route → nickel (docs/L01-actes.md · c5).
// 09: the windshield lives — the gravel flies in and hits, the star settles, the crack creeps by jolts (sun, cold,
//     de-icing), another small one is filled with resin, and we pull back to the whole car.
// 10: the OTHER glass — the side window in its door, then on the tempering lane: hot in the furnace (620 °C), out
//     under the jets, cold in a second; its section (`stress`): the skins squeezed, the core pulling, the scratch held
//     shut, then deep enough… it bursts into grains that rain on the rollers. A tempered windshield would leave you
//     blind (ROAD, from your eyes). And sometimes it bursts by itself: the grain of nickel sulfide — the image ends on
//     it, its halo rising (the mid-roll falls right after "nickel": a question left open).
import * as THREE from "three";
import { fact, chipEl } from "@kit/long.js";
import { SET, AT, VIEW, span, run } from "./world.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
// the side window on the tempering lane, where its section is read (plan.js · ST.temper; verre.js: stressG lies in the
// pane, the pane's x along world +z, its y along world +x, 1.4 cm above it)
const SEC = { x: 7600, y: 92.9, z: -1100 };
// the gravel's impact on the windshield, in the car (plan.js · IMPACT.chip [34, −26] on the bent glass, MOUNT's frame)
const CHIP = { x: 34, y: 117.7, z: -84.7 };

export default function ({ D, world }) {
  const [from, to] = span(D, "route", "pret");
  run(D, from, to);
  const t = D.times({
    gravel: "route:gravillon",
    impact: "impact:impact",
    soleil: "impact:soleil",
    froid: "impact:froid",
    degiv: "impact:dégivrage",
    inegale: "impact:inégale",
    avancer: "impact:avancer",
    resine: "resine",
    comble: "resine:comble",
    sinon: "resine:sinon",
    trempe: "trempe",
    autrement: "trempe:autrement",
    chauffe: "trempe:chauffé",
    refroidi: "trempe:refroidi",
    coup1: "trempe:coup",
    compression: "compression",
    comprimee: "compression:comprimée",
    quatre: "compression:quatre",
    trempeW: "compression:trempé",
    fissure: "fissure",
    rayure: "fissure:rayure",
    fermee: "fissure:fermée",
    coeur: "coeur",
    centre: "coeur:centre",
    enfermee: "coeur:enfermée",
    profonde: "coeur:profonde",
    grains: "grains",
    coup: "grains:coup",
    eclate: "grains:éclate",
    lames: "grains:lames",
    piege: "piege",
    pb: "piege:pare-brise",
    eclatePb: "piege:éclaté",
    perds: "piege:perds",
    nickel: "nickel",
    eclateN: "nickel:éclate",
    faute: "nickel:faute",
    grain: "nickel:grain",
    sulfure: "nickel:sulfure",
  });
  const card10 = t.trempe - 0.9;

  /* ───────────── 09 · Sur la route ───────────── */
  // under the card: low on the road, from the side; the whip turns to the car coming at us
  D.cut(from, SET.ROAD, { ...P, tx: 0, ty: 100, tz: -60, d: 940, az: -102, el: 3, side: -200 }, { ...AT.road, kmh: 90 });
  D.shot(from + 0.05, 0.85, { d: 760, az: -158, el: 7, side: -180 }, "expo.out");
  // it drives: a push that swings round to the passenger side, where the gravel will strike (by ratio)
  const CH = { tx: CHIP.x, ty: CHIP.y, tz: CHIP.z }; // the impact, on the windshield (IMPACT.chip, in the car)
  D.shot(from + 1.0, t.gravel - 0.5 - (from + 1.0), { tx: CHIP.x, ty: CHIP.y + 22, tz: CHIP.z - 11, d: 150, az: -248, el: 22, side: -120 }, "sine.inOut", 760);
  D.shot(t.gravel - 0.5, 1.0, { d: 140, az: -244, el: 23 }, "sine.inOut");
  // "gravillon": it flies in (a signal pebble, its trail), hits just after the word
  const hit = t.gravel + 0.55;
  D.st(hit - 1.05, 1.05, { chip: 0.5 }, "power1.in");
  D.st(hit, 1.4, { chip: 1 }, "power2.out");
  // the dive onto the impact (by ratio): "Un impact" — the star settles
  D.shot(hit + 0.02, t.impact + 0.7 - hit, { ...CH, d: 24, az: -192, el: 34, fov: 32, side: -160 }, "power2.inOut", 140);
  // the macro turns slowly around the star
  D.shot(t.impact + 0.75, t.soleil - (t.impact + 0.75), { az: -199, el: 36, d: 22 }, "sine.inOut");
  // sun, cold, de-icing: the light warms and cools; the crack jumps on each word, then runs on "avancer"
  D.st(t.soleil - 0.05, 0.35, { gel: 0.25 }, "power2.out");
  D.st(t.froid - 0.05, 0.35, { gel: 0 }, "power2.out");
  D.st(t.degiv - 0.05, 0.3, { gel: 0.14 }, "power2.out");
  D.st(t.degiv + 0.9, 0.6, { gel: 0 }, "sine.inOut");
  D.st(t.soleil, 0.3, { creep: 0.2 }, "power2.out");
  D.st(t.froid, 0.3, { creep: 0.38 }, "power2.out");
  D.st(t.degiv, 0.3, { creep: 0.55 }, "power2.out");
  D.st(t.inegale, 0.3, { creep: 0.72 }, "power2.out");
  D.st(t.avancer, 0.5, { creep: 1 }, "power2.out");
  // …and the camera pulls back along the crack (by ratio), turning the other way
  D.shot(t.soleil, t.resine - 0.2 - t.soleil, { tx: CHIP.x + 10, ty: CHIP.y - 4.6, tz: CHIP.z - 5.5, d: 52, az: -178, el: 30 }, "sine.inOut", 22);

  // another one, small: a cut (no crack), the resin fills it on "comble", it cures
  const cRes = t.resine - 0.15;
  D.cut(cRes, SET.ROAD, { ...P, ...CH, d: 30, az: -207, el: 24, fov: 32, side: -160 }, { ...AT.road, kmh: 90, chip: 1, creep: 0, resin: 0 });
  D.shot(cRes + 0.02, t.comble - cRes, { az: -198, el: 28, d: 25 }, "sine.inOut");
  D.st(t.comble, 0.7, { resin: 0.35 }, "power2.out");
  D.st(t.comble + 0.8, 0.9, { resin: 1 }, "sine.inOut");
  D.shot(t.comble + 0.02, t.sinon - 0.1 - t.comble, { az: -192, el: 30, d: 22 }, "sine.inOut");
  // "Sinon, c'est tout le pare-brise qu'on change": the pull-back to the whole car (by ratio)
  D.shot(t.sinon - 0.1, card10 - 0.08 - (t.sinon - 0.1), { tx: 0, ty: 102, tz: -50, d: 720, az: -164, el: 13, side: -170 }, "sine.inOut", 22);

  /* ───────────── 10 · Le verre trempé ───────────── */
  // under the card: the CAR, from inside — the driver's window (ours, solid, "celle du début"); the whip comes round to it
  D.cut(card10, SET.CAR, { ...VIEW.sideIn, d: 235, az: 28, el: 12 }, { ...AT.car, sideOn: 1 });
  D.shot(card10 + 0.05, 0.85, { d: 150, az: 75, el: 4 }, "expo.out");
  D.shot(card10 + 1.0, t.autrement - 0.15 - (card10 + 1.0), { d: 122, az: 84, el: 7 }, "sine.inOut");

  // "autrement": the tempering lane — the window in its furnace, 620 °C (the header turns signal)
  const cT = t.autrement - 0.15;
  D.cut(cT, SET.LINE, { ...P, tx: 6300, ty: 95, tz: -1100, d: 390, az: -42, el: 48, side: -60 }, { ...AT.line, step: 0, temp: 620, tempOn: 1, pos: 5000, sideGlow: 1, sidePos: 6400, jets: 0, stress: 0, grains: 0 });
  // the camera only drifts over the furnace (a travel through its rods and the blower's ducts flickered: qa, draft 1)
  const cB = t.refroidi - 0.15;
  D.shot(cT + 0.02, cB - cT, { tx: 6460, d: 300, az: -22, el: 56, side: 0 }, "sine.inOut");
  // it starts to leave the furnace; "refroidi": a CUT to the blower, the window sliding in under it (no travel)
  const go = t.chauffe + 0.6;
  const under = t.coup1 - 0.1;
  D.st(go, cB - 0.03 - go, { sidePos: 6560 }, "power1.in");
  D.cut(cB, SET.LINE, { ...P, tx: 7250, ty: 95, tz: -1100, d: 360, az: -26, el: 17, side: -120 }, { ...AT.line, step: 0, temp: 620, tempOn: 1, pos: 5000, sideGlow: 1, sidePos: 6980, jets: 0, stress: 0, grains: 0 });
  D.st(cB + 0.02, under - cB - 0.02, { sidePos: 7250 }, "power2.out");
  D.shot(cB + 0.02, under - cB, { d: 340, az: -22, el: 16 }, "sine.inOut");
  // "d'un coup, par des jets d'air": the jets, the glow gone, 620 → 20 in a second
  D.st(under - 0.15, 0.25, { jets: 1 }, "power2.out");
  D.st(under, 1.0, { sideGlow: 0, temp: 20 }, "power2.out");
  D.shot(under + 0.02, t.compression - 0.3 - under, { az: -12, el: 12, d: 310 }, "sine.inOut");

  // "La surface se fige… et reste comprimée": the window slides out to where its section is read; the camera rises over
  // it (az −90: the section reads flat) — the skins squeezed, the core pulling, on "comprimée"
  const rise = t.compression - 0.3;
  D.st(rise, t.comprimee - 0.1 - rise, { sidePos: SEC.x }, "sine.inOut");
  D.st(rise + 0.2, 0.6, { jets: 0 }, "sine.inOut");
  D.shot(rise, t.comprimee - 0.1 - rise, { tx: SEC.x, ty: 92, tz: SEC.z, d: 165, az: -96, el: 64, side: 0 }, "sine.inOut", 310);
  D.st(t.comprimee - 0.1, 0.6, { stress: 1 }, "power2.out");
  D.shot(t.comprimee - 0.05, t.fissure - (t.comprimee - 0.05), { tx: SEC.x - 3, d: 150, az: -84, el: 70 }, "sine.inOut");
  const skin = new THREE.Vector3(SEC.x + 7.5, SEC.y, SEC.z - 20);
  chipEl("c5-skin", { label: "SURFACE", value: "COMPRIMÉE", color: "ink" });
  D.chip("c5-skin", skin, -90, -96, t.comprimee + 0.1, t.quatre - 0.3);
  fact(D.tl, { id: "c5-x4", v: "≈ 4 ×", s: "PLUS RÉSISTANT", from: t.quatre - 0.1, to: t.trempeW - 0.15 });

  // "une rayure qu'on tire… la surface est serrée : la rayure reste fermée"
  const scratch = new THREE.Vector3(SEC.x + 10, SEC.y, SEC.z + 11);
  D.shot(t.fissure, t.rayure - 0.1 - t.fissure, { tx: SEC.x + 7, tz: SEC.z + 7, d: 96, az: -80, el: 62 }, "sine.inOut");
  D.st(t.rayure - 0.1, 0.6, { stress: 2 }, "power2.out");
  chipEl("c5-scratch", { label: "RAYURE", value: "FERMÉE", color: "ink" });
  D.chip("c5-scratch", scratch, 20, -110, t.rayure + 0.15, t.coeur - 0.25);
  D.shot(t.rayure - 0.05, t.coeur - 0.1 - (t.rayure - 0.05), { tx: SEC.x + 8, tz: SEC.z + 10, d: 86, az: -74, el: 66 }, "sine.inOut");

  // "Mais au centre, le verre tire dans l'autre sens" — pull back to the core; "assez profonde": the scratch reaches it
  const core = new THREE.Vector3(SEC.x, SEC.y, SEC.z - 8);
  D.shot(t.coeur - 0.1, t.enfermee - (t.coeur - 0.1), { tx: SEC.x + 1, tz: SEC.z - 2, d: 128, az: -98, el: 68 }, "sine.inOut");
  chipEl("c5-core", { label: "CŒUR", value: "TIRE", color: "signal" });
  D.chip("c5-core", core, -150, 70, t.centre + 0.05, t.enfermee - 0.1);
  D.shot(t.enfermee, t.grains - 0.15 - t.enfermee, { tx: SEC.x + 5, tz: SEC.z + 6, d: 104, az: -90, el: 70 }, "sine.inOut");
  D.st(t.profonde - 0.25, 0.6, { stress: 3 }, "power2.out");

  // "Mais quand il casse, toute cette tension part d'un coup": the pull-back reveals the whole window holding it…
  const back = t.grains - 0.15;
  D.shot(back, t.coup - 0.05 - back, { tx: SEC.x, ty: 95, tz: SEC.z, d: 300, az: -32, el: 32, side: 0 }, "sine.inOut", 104);
  // …and on "coup" it bursts: the front from its point, the glass goes white; the camera kicks in
  D.st(t.coup - 0.02, 0.12, { stress: 0 }, "power2.out");
  D.st(t.coup - 0.02, 0.3, { grains: 0.42 }, "power2.out");
  D.shot(t.coup - 0.03, 0.8, { d: 245, el: 30 }, "expo.out");
  // "Il éclate en milliers de petits grains… pas des lames": the grains rain down on the rollers, the camera goes with them
  D.st(t.eclate, 0.15, { grains: 0.5 }, "none");
  D.st(t.eclate + 0.15, t.pb - 0.5 - (t.eclate + 0.15), { grains: 1 }, "power1.out");
  D.shot(t.eclate, t.lames + 0.3 - t.eclate, { tx: SEC.x + 10, ty: 78, d: 250, az: -42, el: 14 }, "sine.inOut");
  D.shot(t.lames + 0.3, t.pb - 0.35 - (t.lames + 0.3), { tx: SEC.x + 40, ty: 74, d: 230, az: -52, el: 9 }, "sine.inOut");

  // "Pour un pare-brise, c'est un piège": ROAD, from your eyes; the windshield goes to grains (white): you lose the road
  const cR = t.pb - 0.35;
  D.cut(cR, SET.ROAD, { ...P, tx: -30, ty: 123, tz: -52, d: 64, az: -7, el: 0, fov: 50, side: 0 }, { ...AT.road, kmh: 90, sideOn: 0, witness: 0, grains: 0, chip: 0, creep: 0, resin: 0 });
  D.shot(cR + 0.02, t.eclatePb - cR, { d: 58, az: -3, el: 1 }, "sine.inOut");
  D.st(t.eclatePb - 0.05, 0.4, { grains: 0.45 }, "power2.out");
  D.shot(t.eclatePb, t.nickel - 0.17 - t.eclatePb, { d: 42, az: 3, el: -1, roll: 3 }, "sine.inOut");

  // "Et parfois, une vitre trempée éclate… toute seule": CAR, at rest, the side window from inside; it bursts by itself
  const cN = t.nickel - 0.15;
  D.cut(cN, SET.CAR, { ...VIEW.sideIn, d: 165, az: 68 }, { ...AT.car, sideOn: 1, grains: 0, nickel: 0 });
  D.shot(cN + 0.02, t.eclateN - cN, { d: 140, az: 74, el: 6 }, "sine.inOut");
  D.st(t.eclateN - 0.03, 0.3, { grains: 0.42 }, "power2.out");
  D.st(t.eclateN + 0.4, 0.15, { grains: 0.5 }, "none");
  D.st(t.eclateN + 0.55, t.faute - 0.3 - (t.eclateN + 0.55), { grains: 0.95 }, "power1.out");
  D.shot(t.eclateN, t.faute - 0.15 - t.eclateN, { ty: 108, d: 175, az: 80, el: 10 }, "sine.inOut");

  // "La faute à un grain minuscule… du sulfure de nickel, resté dans le verre": an intact window, in macro, the grain
  // shows; its halo keeps rising through the hold (the mid-roll: the question stays open), the camera closes in on it
  const cM = t.faute - 0.15;
  D.cut(cM, SET.CAR, { ...VIEW.nickel, d: 115, az: 56, el: 10, side: -80 }, { ...AT.car, sideOn: 1, grains: 0, nickel: 0 });
  D.st(t.grain - 0.1, 0.5, { nickel: 0.5 }, "power2.out");
  D.st(t.sulfure, to - 0.05 - t.sulfure, { nickel: 0.8 }, "sine.in");
  D.shot(cM + 0.02, to - cM, { d: 58, az: 72, el: 6, side: -40 }, "sine.inOut", 115);
  const grainAt = new THREE.Vector3(8, 2, 0.7).applyMatrix4(world.cars.sideMount.matrix);
  chipEl("c5-nickel", { label: "SULFURE", value: "DE NICKEL", color: "signal" });
  D.chip("c5-nickel", grainAt, -330, -150, t.sulfure + 0.05, to - 0.3);
}
