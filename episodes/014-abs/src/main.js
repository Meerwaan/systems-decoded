// DOSSIER 014 — ABS. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   street.js  the wet road, the truck, the car like an X-ray, you
//   model.js   the system: the front-left wheel and its brake, the ring and its sensor, the ABS unit, the pedal
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS A SPEEDOMETER. The header's big readout is the car's speed (`kmh`), its second one the
// front-left wheel's (`wkmh`): two numbers of the state, moved by the acts. A car at 70 with a wheel at 0 is the
// whole danger in one glance — the second readout turns signal when the wheel falls far behind the car.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 60000, keySize: 2.5 });
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

  const count = $("hud-count");
  D.readout("hud-clock", () => `${Math.max(0, Math.round(D.W.kmh))} km/h`);
  D.readout("hud-count-v", () => {
    const car = Math.max(0, D.W.kmh), wheel = Math.max(0, D.W.wkmh);
    count.style.color = car > 5 && wheel < car * 0.5 ? "#ff5b2e" : "#5cffb0";
    return `${Math.round(wheel)} km/h`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
