// DOSSIER 034 — Boîte noire. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js   the system: the flight recorder — its beacon and battery, chassis and boards, the protected memory module
//   fond.js    the Atlantic at night, surface to 3 900 m: the wreck of glass, the rings, the reach, the light that comes down
//   (023/src/avion.js, imported untouched: the A330 of glass at night — « ton avion »)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE BEACON'S CLOCK. Its big readout counts the days the beacon has left, as the voice says them:
// « J−30 » (`days`, 30 at the time of AF447) down to « J−0 » on « Zéro » — ink, signal from « taise » (`alarm`).
// Once the beacon is silent it counts the months on the bottom: « +1 mois », « +12 mois », « +23 mois » (`months`,
// ≈ 23 months from June 2009 to May 2011, BEA — « presque deux ans »). Its second readout is the box's depth,
// « Profondeur », in true metres (`depth`: 3 900 m, BEA) — « — » in the plane (no altitude is said).
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, SET } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const SIGNAL = "#ff5b2e";
const thousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 10000000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    clock.style.color = W.alarm >= 0.5 ? SIGNAL : INK;
    if (W.months >= 0.5) return `+${Math.round(W.months)} mois`;
    return `J−${Math.max(0, Math.round(W.days))}`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    if (W.set === SET.AIR) return "—";
    return `${thousands(Math.round(Math.max(0, W.depth) / 10) * 10)} m`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
