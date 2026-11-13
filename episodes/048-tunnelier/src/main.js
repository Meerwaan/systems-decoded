// DOSSIER 048 — Tunnelier. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js   the system: the front of the EPB tunnel boring machine (cutterhead, chamber, bulkhead and manometer,
//              screw, thrust rams, the last ring of seven segments) — solid
//   sol.js     the ground X-ray: the soil, the water table, the lined tunnel, the face, the column that loosens
//   rue.js     the street X-ray: the road in section, the six-storey building, 011's car, the settlement gauge, the town, the sky
//   acte1.js   01 MENACE (hook, scene)       acte2.js   02 AUTOPSIE (bench: « on l'ouvre », exploded view, principle)
//   acte3.js   02 → 03 (section: the machine at rest, the drop, the answer)     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE STREET'S. Its big readout is the settlement the voice counts, in millimetres (`settle`: « deux
// millimètres. Cinq. Sept. … Huit ») — signal from 1 mm. When the road heaves (settle < 0, « ta rue monte ») it
// shows no figure (none is sourced): « Monte ». Its second readout, « Pression », is a WORD, never a figure (no
// pressure at the face is sourced): Équilibre (veille) · En chute · Trop forte (signal), from `press`.
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, pressWord } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 400000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
    const mm = (time >= toLoop ? FIRST : D.W).settle;
    if (mm < -0.3) {
      clock.style.color = SIGNAL;
      return "Monte";
    }
    const n = Math.max(0, Math.round(mm));
    clock.style.color = n >= 1 ? SIGNAL : INK;
    return `${n} mm`;
  });
  D.readout("hud-count-v", (time) => {
    const p = (time >= toLoop ? FIRST : D.W).press;
    count.style.color = Math.abs(p - 1) < 0.08 ? VEILLE : SIGNAL;
    return pressWord(p);
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
