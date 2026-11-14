// DOSSIER 052 — Télésiège débrayable. The film, assembled:
//   plan.js    where everything stands (the chair's path, the speeds)   world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js   the system: the detachable grip (roller, lever, fixed and mobile jaws, clamping spring) — solid
//   gare.js    the station X-ray: housing, quay; solid: the cable round the bullwheel, the came, the tyre rows, the weighing
//   ligne.js   the chairs of glass (the hero's, you on it, the others), the line, the towers, the ground, the sky
//   acte1.js   01 MENACE (hook, scene)       acte2.js   02 AUTOPSIE (bench: « on l'ouvre », exploded view; the principle)
//   acte3.js   02 → 03 (station: the chair at rest on the came, the launch, the bad closing, the weighing, the stop)
//   fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE CHAIR'S SPEED. Its big readout is your chair's speed in km/h (`kmh`): 18 when it comes in off the
// line, 3,6 at the quay (« au pas », « cinq fois moins vite »), 18 again when the tyres have launched it (« dix-huit
// kilomètres-heure »), 0 when everything stops. Its second readout, « Câble », is the cable's (`cableKmh`): 18 all
// film long — the cable never stops — until « … s'arrête » (0, signal), and 18 again for the like.
// Speeds are the sources' orders of size (≈ 5 m/s and ≈ 1 m/s), said by the voice; `sources` says so.
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const kmhText = (v) => (v < 9.95 ? v.toFixed(1).replace(".", ",") : String(Math.round(v))) + " km/h";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 600000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
    const v = Math.max(0, (time >= toLoop ? FIRST : D.W).kmh);
    clock.style.color = v < 0.05 ? SIGNAL : INK;
    return kmhText(v);
  });
  D.readout("hud-count-v", (time) => {
    const v = Math.max(0, (time >= toLoop ? FIRST : D.W).cableKmh);
    count.style.color = v < 0.05 ? SIGNAL : VEILLE;
    return kmhText(v);
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
