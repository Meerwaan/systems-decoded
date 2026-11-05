// DOSSIER 038 — Sous-marin. The film, assembled:
//   plan.js       where everything stands             world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   sousmarin.js  the boat: its two hulls and sail aux rayons X, its crew of glass; SOLID inside, the system — the
//                 main ballast tanks fore and aft, the bank of bottles, the valves, the pipes, the emergency blow command
//   mer.js        the sea (034's fond.js, wrapped: marine snow, the surface from below), the rock wall, the seamount,
//                 the surface from the side and the low sky
//   acte1.js      01 MENACE (0 → tobench)               acte2.js   02 AUTOPSIE: « on l'ouvre », the exploded view (→ toprincipe)
//   acte2b.js     the principle and the rest (toprincipe → tozero)
//   acte3.js      03 RÉPONSE (tozero → toverdict)       fin.js     chute, what is owed, like, next file, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE DEPTH AND ITS PRESSURE (no clock: the voice gives no time, and no hour, no knot, no time of ascent
// is ever shown). Its big readout is the boat's depth in metres (`depth`: 160 m, 525 ft [S]; while it climbs, the
// figures in between are illustrative), « Profondeur » before it. Its second readout, « Pression », is how many times
// the surface's pressure the hull bears at that depth (pressureAt: ×17 at 160 m — the contre-vérification's figure),
// signal while deep, ink near the surface. The acts never write them: they move `depth`. Past the loop both read FIRST.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, pressureAt, DEPTH } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 2500000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte2b(ctx);
  acte3(ctx);
  fin(ctx);

  const toLoop = D.at("toloop");
  const count = $("hud-count-v");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    return W.depth <= DEPTH.float + 0.5 ? "Surface" : `${Math.round(W.depth)} m`; // floating: the boat is at the surface
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const x = pressureAt(W.depth);
    count.style.color = x >= 5 ? SIGNAL : INK;
    return `×${Math.round(x)}`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
