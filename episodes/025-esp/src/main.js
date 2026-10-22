// DOSSIER 025 — ESP. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   route.js   the wet country road at night, the boar, 014's car aux rayons X, you at the wheel
//   model.js   the system: the four brakes and their wheel sensors, the steering angle sensor, the yaw sensor,
//              the ESP unit and its computer (the comparator)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE ESP'S QUESTION. Its big readout is the car's speed, `kmh` (80 km/h, illustrative: never said;
// it drops a little when the ESP cuts the power and brakes). Its second readout, « Écart », is how far — in
// degrees, measured in the scene — the car points from where the steering wheel asks: |yaw − aim|. Veille while it
// is under 3° (« elle va là où tu braques ? » — oui), signal above (non); the speed turns signal with it.
// During 1997 (`archive` 1) no speed is shown — none is sourced: « Oct. 1997 », and « — ».
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, ecartOf } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const LIMIT = 3; // degrees: under it, the car goes where you steer

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 90000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  const toLoop = D.at("toloop");
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    if (W.archive > 0.5) {
      clock.style.color = INK;
      return "Oct. 1997";
    }
    clock.style.color = ecartOf(W) >= LIMIT ? SIGNAL : INK;
    return `${Math.round(Math.max(0, W.kmh))} km/h`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    if (W.archive > 0.5) {
      count.style.color = INK;
      return "—";
    }
    const e = ecartOf(W);
    count.style.color = e >= LIMIT ? SIGNAL : VEILLE;
    return `${Math.round(e)}°`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
