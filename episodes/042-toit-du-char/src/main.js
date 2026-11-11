// DOSSIER 042 — Le toit du char. The film, assembled:
//   plan.js     where everything stands          world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   caisson.js  the system, solid: the ammunition compartment, its rounds, the roof panel, the doors, the rod, the cam
//   char.js     around, X-ray: the tank at night, its crew of four, the ground, the comment's other turret
//   feu.js      the column of fire out of the roof, the glow on the ground; far away the 043 teaser
//   acte1.js    01 MENACE (accroche, promesse, scene)            acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded view, the principle)
//   acte3.js    02 → 03 (the doors at rest, the panel lets go, the lock, the column)
//   fin.js      chute, what the film owes, like, the next file, the loop
// Each act only writes st / shot / path / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its big readout is the story's clock in milliseconds around the instant the roof lets go (T+0): the
// order of magnitude « quelques millisecondes » is US 4,864,913's; no delay is published for this tank, the values are
// a reconstitution (`sources` says so). The hook runs T−0,6 → T+0 on « saute » → T+2,4; the scene (« même seconde »)
// goes back to the powder, T−3,0 on « flambe », and is held at T−1,2 — dimmed on the bench — until the principle runs
// its own few milliseconds (T−3,0 on « poudre » → T+0 on « cède »); held at T−3,0 through the doors at rest; act 3 runs
// T−3,0 on « flambe » → T+0 on « lâche » → T+2,0 on « plaque » (veille from « Verrouillées ») → T+120 ms, held through
// the chute. In the comment it counts the seconds the loader's door stays open in the picture (« only opened for a
// couple of seconds », Wikipédia « Autoloader »): the act opens it at `opendoor` and shuts it at `shutdoor`.
// The second readout, « Ta porte », is the state the picture shows, read off the state: Fermée (ink), Ouverte (signal,
// `door`), Joint ouvert (signal, `leak`), Verrouillée (veille, `lock`). Past the loop both read the first frame's.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, SET } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

/** ms → « T−2,4 ms » (one decimal under 10 ms, whole above; French decimal comma). */
const stamp = (ms) => {
  const a = Math.abs(ms);
  const v = a < 10 ? a.toFixed(1).replace(".", ",") : String(Math.round(a));
  return `T${ms < -0.04 ? "−" : "+"}${v} ms`;
};

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 60000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte3(ctx);
  fin(ctx);

  const T = D.times({
    saute: "accroche:saute", toScene: "toscene", flambe: "scene:flambe", monte: "scene:monte", sceneEnd: "scene$",
    toBench: "tobench", poudre: "principe:poudre", cede: "principe:cède", toRest: "torest",
    toZero: "tozero", zFlambe: "zero:flambe", cogne: "zero:cogne", lache: "zero:lâche", plaque: "trigger",
    verrou: "reponse:verrouillées", colonne: "reponse:colonne", toVerdict: "toverdict",
    toCta: "tocta", open: "opendoor", shut: "shutdoor", toLoop: "toloop",
  });
  const HOOK = [[0, -0.6], [T.saute, 0], [T.toScene, 2.4]];
  const SCENE = [[T.toScene, -3.2], [T.flambe, -3.0], [T.monte, -2.0], [T.sceneEnd, -1.2]];
  const PRINCIPLE = [[T.poudre, -3.0], [T.cede, 0], [T.toRest, 0.6]];
  const ACT3 = [[T.toZero, -3.2], [T.zFlambe, -3.0], [T.cogne, -1.5], [T.lache, 0], [T.plaque, 2.0], [T.verrou, 2.6], [T.colonne, 40], [T.toVerdict, 120]];
  const clock = $("hud-clock");
  const count = $("hud-count");
  const paint = (color, opacity = 1) => {
    clock.style.color = color;
    clock.style.opacity = opacity;
  };
  D.readout("hud-clock", (time) => {
    if (time >= T.toLoop || time < T.toScene) {
      paint(SIGNAL);
      return stamp(along(HOOK, time >= T.toLoop ? 0 : time));
    }
    if (time < T.toBench) {
      paint(SIGNAL);
      return stamp(along(SCENE, time));
    }
    if (time < T.poudre) {
      paint(SIGNAL, 0.55); // on the bench the voice has stopped time: held, dimmed
      return stamp(-1.2);
    }
    if (time < T.toRest) {
      paint(SIGNAL, 0.8); // the principle runs its own few milliseconds
      return stamp(along(PRINCIPLE, time));
    }
    if (time < T.toZero) {
      paint(INK, 0.55); // the doors at rest: before the fire
      return stamp(-3.0);
    }
    if (time < T.toCta) {
      paint(time >= T.verrou ? VEILLE : SIGNAL);
      return stamp(along(ACT3, Math.min(time, T.toVerdict)));
    }
    // the comment: the seconds the loader's door stays open, in the picture
    const open = Math.min(Math.max(0, time - T.open), T.shut - T.open);
    paint(time >= T.open && time < T.shut ? SIGNAL : INK, time < T.open ? 0.55 : 1);
    return `${open.toFixed(1).replace(".", ",")} s`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= T.toLoop ? FIRST : D.W;
    count.style.opacity = W.set === SET.BENCH ? 0.55 : 1;
    if (W.set !== SET.BENCH && W.door > 0.06) {
      count.style.color = SIGNAL;
      return "Ouverte";
    }
    if (W.set !== SET.BENCH && W.leak > 0.5) {
      count.style.color = SIGNAL;
      return "Joint ouvert";
    }
    if (W.lock > 0.9) {
      count.style.color = VEILLE;
      return "Verrouillée";
    }
    count.style.color = INK;
    return "Fermée";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
