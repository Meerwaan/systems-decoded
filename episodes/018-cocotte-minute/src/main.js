// DOSSIER 018 — Cocotte-minute. The film, assembled:
//   plan.js     where everything stands           world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   cuisine.js  the kitchen of 009, the gas hob and the fire of 012, you at the hob
//   model.js    the system: the pressure cooker — vessel, bayonet lid, seal, working valve, safety valve, locking pin — and what is inside
//   acte1.js    01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, what is owed, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS THE PUSH UNDER THE LID. The header's big readout follows the pressure (`bar`) and says it the
// way the hook does: « +350 kg » — plus de 350 kilos, the State's own figure for a cooker at work — signal as long
// as there is any; it counts down and turns veille when the pressure falls. Above cooking pressure it does NOT
// climb: no figure is sourced up there (the picture and the gauge of act 3 carry the climb, without a number).
// Its second readout is the working valve: « Siffle » (veille) / « Muette » (signal). « Muette » under « +350 kg »
// is the whole film in one glance.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, PUSH } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5 });
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

  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", () => {
    const bar = Math.max(0, D.W.bar);
    clock.style.color = bar > 0.03 ? "#ff5b2e" : "#5cffb0";
    if (bar >= 0.985) return `+${PUSH} kg`; // « plus de 350 kilos »: at cooking pressure, and above it
    return `${Math.round((PUSH * bar) / 10) * 10} kg`;
  });
  D.readout("hud-count-v", () => {
    const sings = D.W.whistle * (1 - D.W.clog) > 0.08;
    const mute = !sings && D.W.bar > 0.12;
    count.style.color = sings ? "#5cffb0" : mute ? "#ff5b2e" : "#e9e4d8";
    return sings ? "Siffle" : mute ? "Muette" : "Au repos";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
