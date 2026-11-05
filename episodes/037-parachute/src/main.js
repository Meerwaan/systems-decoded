// DOSSIER 037 — Le parachute de secours. The film, assembled:
//   plan.js     where everything stands             world.js    the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js    the system: the reserve container, its box (processing unit, control unit, diode), the cutter and its
//               piston, the closing loop, the pin, the pilot chute and the bag (solid)
//   sauteur.js  you, a body of glass in free fall, the harness and its ripcord handle, the pilot chute in flight, the
//               reserve canopy, the second diver of the principle
//   ciel.js     the sky, the countryside in squares at `alt`, the air going by, the pressure layers, the window at 225 m
//   acte1.js    01 MENACE (0 → tobench)          acte2.js  02 AUTOPSIE: « on l'ouvre », the exploded view (→ toprincipe)
//   acte2b.js   the principle and the rest (toprincipe → tozero)
//   acte3.js    03 RÉPONSE (tozero → toverdict)  fin.js    chute, what is owed, like, next file, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE FALL. Its big readout is the ALTITUDE above the ground (`alt`, metres: 1 350 on the first frame,
// ≈ 250 when time stops on the bench, 225 crossed on « deux cent vingt-cinq »), signal under the window while you still
// fall faster than 35 m/s. Its second readout, « Chute », is the fall's speed in km/h (`vz` m/s × 3.6, rounded to ten:
// 200 — « deux cents kilomètres-heure »), signal above 35 m/s, veille under the canopy, ink at rest. Both are sourced
// (docs/faits/037-parachute.md: ≈ 55 m/s, 225 m, a jump from ≈ 4 000 m). The acts never write them: they move `alt`
// and `vz`, the header follows. Past the loop both read FIRST.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, kmh, ALT, SPEED } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const SIGNAL = "#ff5b2e";
const VEILLE = "#5cffb0";
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

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
  acte2b(ctx);
  acte3(ctx);
  fin(ctx);

  const toLoop = D.at("toloop");
  const clock = $("hud-clock");
  const count = $("hud-count-v");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const alt = Math.max(0, Math.round(W.alt));
    clock.style.color = alt <= ALT.gate && W.vz > SPEED.gate ? SIGNAL : INK;
    return `${thousands(alt)} m`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    count.style.color = W.vz > SPEED.gate ? SIGNAL : W.vz > 0.5 ? VEILLE : INK;
    return `${kmh(W.vz)} km/h`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
