// DOSSIER 027 — Voie de détresse. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   col.js     the mountain road at night: the descent, the bend, the ravine, the valley (X-ray)
//   camion.js  the 40-tonne truck of glass, its hot drums, you at the wheel
//   model.js   the system: the escape lane (sign, access, pit of round gravel, barrier, berm) and the hero wheel, its drum
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE TRUCK'S DASHBOARD. Its big readout is the speed, `kmh` — 72 on the first frame, 80 and 90 on the
// words that say them, 0 when the forty tonnes stop (illustrative: the scene is a scenario, `sources`). Its second
// readout, « Pédale », is where your foot is: 0 % lifted … 100 % floored. Together they tell the film: on the road the
// pedal is down and the speed climbs (both signal: the brakes are cooked); in the gravel the pedal is at 0 % and the
// speed falls (both veille: the lane brakes, « sans toucher la pédale »). Ink otherwise. Nothing else is written there:
// no temperature (none is sourced as a threshold), no distance (none is said).
// The camera rides with the truck (world.js `ride`): the director adds its travel to every shot and to the light.
// Past the loop both readouts show the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, rideOf } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const IN_GRAVEL = 0.2; // `sink` above which the lane is the one braking

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 800000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0, ride: rideOf });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte3(ctx);
  fin(ctx);

  const toLoop = D.at("toloop");
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    clock.style.color = W.sink > IN_GRAVEL ? VEILLE : W.pedal >= 0.5 && W.mood > 0.5 ? SIGNAL : INK;
    return `${Math.round(Math.max(0, W.kmh))} km/h`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    count.style.color = W.pedal >= 0.5 ? SIGNAL : W.sink > IN_GRAVEL && W.pedal < 0.05 ? VEILLE : INK;
    return `${Math.round(100 * Math.min(1, Math.max(0, W.pedal)))} %`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time, D.riding));
  stage.start();
  return D.tl;
}

window.SD = { build };
