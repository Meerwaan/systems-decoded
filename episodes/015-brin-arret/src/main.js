// DOSSIER 015 — Brin d'arrêt. The film, assembled:
//   plan.js     where everything stands           world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   carrier.js  the ship like an X-ray: the deck, the hull, the island, the sea
//   rafale.js   the Rafale of glass, its wheels, its hook, you at the throttle
//   model.js    the system: the wire across the deck and, under it, the brake it pulls
//   acte1.js    01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER READS TWO NUMBERS OF THE STATE, moved by the acts: `sec`, the story's clock — seconds from the instant
// the hook takes the wire — and `kmh`, the aircraft's speed over the deck.
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
  const stage = createStage($("stage"), { scale: SIZE, far: 400000, keySize: 2.5 });
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

  const stamp = (s) => `T${s < -0.04 ? "−" : "+"}${Math.abs(s).toFixed(1).replace(".", ",")} s`;
  D.readout("hud-clock", () => stamp(D.W.sec));
  const count = $("hud-count");
  D.readout("hud-count-v", () => {
    const kmh = Math.max(0, Math.round(D.W.kmh));
    count.style.color = kmh > 0 ? "#ff5b2e" : "#5cffb0"; // the speed is the threat; stopped, it is the system's verdict
    return `${kmh} km/h`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
