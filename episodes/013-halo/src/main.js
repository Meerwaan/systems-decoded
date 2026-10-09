// DOSSIER 013 — Halo. The film, assembled:
//   plan.js   where everything stands             world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js  the system: the survival cell, the halo, you       f1.js   the rest of the car, like an X-ray
//   rail.js   the track, the triple steel barrier, the fire
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// The header's two readouts are numbers of the state, moved by the acts like any other: `sec`, the seconds since
// the impact (the fire lasts about 28 of them), and `kmh`, the speed (192 against the barrier).
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

  // The clock: whole seconds since the impact. The counter: the speed.
  D.readout("hud-clock", () => `T+0:${String(Math.max(0, Math.floor(D.W.sec + 1e-6))).padStart(2, "0")}`);
  D.readout("hud-count-v", () => `${Math.max(0, Math.round(D.W.kmh))} km/h`);

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
