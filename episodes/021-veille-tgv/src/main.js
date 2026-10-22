// DOSSIER 021 — Veille du TGV. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   train.js   the TGV Duplex like an X-ray on the high-speed line at night: the empty cab, the passengers, the track
//   model.js   the system: the veille automatique — pedal, keys, countdown box and dial, bell, relay, emergency valve
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS A SPEEDOMETER. The header's big readout is `kmh`: 255 km/h (BEA-TT: the speed when the veille
// triggers) from the first frame to « freinage d'urgence », then 255 → 0 to « arrêté », 0 until the loop. Signal
// while the train runs with nobody in the cab (`kmh` > 0, the bench included), veille once it is stopped.
// The second readout is the braking distance, « Freinage »: « — » until the brakes bite, then 0 → 2 320 m (BEA-TT),
// read off the speed by the law of a constant deceleration (world.js, brakedOf): the two ends are sourced, the
// values in between are the law's. Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, brakedOf } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const fr = (n) => n.toLocaleString("fr-FR").replace(/\s/g, " ");

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 120000, keySize: 2.5 });
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
    clock.style.color = W.kmh > 0.5 ? SIGNAL : VEILLE; // the train runs with nobody in the cab: signal, on the bench too
    return `${Math.round(Math.max(0, W.kmh))} km/h`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const m = brakedOf(W.kmh);
    count.style.color = m < 1 ? INK : W.kmh > 0.5 ? SIGNAL : VEILLE;
    return m < 1 ? "—" : `${fr(Math.round(m / 10) * 10)} m`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
