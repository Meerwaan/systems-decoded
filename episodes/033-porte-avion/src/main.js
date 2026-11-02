// DOSSIER 033 — Porte d'avion. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   vol.js     the flight: 023's A330 of glass at night, L03's cabin inside it, the neighbour, you, the recorder
//   model.js   the system: the plug door — its frame, its stops, its hooks and handle — and the air on it
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE DOOR'S STORY. Its big readout is the ALTITUDE, `alt` (true metres: « plus de dix kilomètres » —
// FL370 ≈ 11 300 m —, « au sol », « environ deux cents mètres »), the story's clock: the voice never gives a time, it
// gives a height. Its second readout, « Sur la porte », is the force the cabin's air puts on the door, computed from
// `alt` (world.js · tonnesOf: ≈ 8 t at cruise, said « environ huit tonnes » ; ≈ 0 on the ground and at 200 m): veille
// while the air holds the door (≥ 1 t), ink below. An act never writes them: it moves `alt`.
// Past the loop both read the first frame's values.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, tonnesOf } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const metres = (h) => `${Math.round(Math.max(0, h) / 100) * 100}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " m";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 180000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
  const count = $("hud-count");
  D.readout("hud-clock", (time) => metres((time >= toLoop ? FIRST : D.W).alt));
  D.readout("hud-count-v", (time) => {
    const t = tonnesOf((time >= toLoop ? FIRST : D.W).alt);
    count.style.color = t >= 1 ? VEILLE : INK;
    return `≈ ${Math.round(t)} t`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
