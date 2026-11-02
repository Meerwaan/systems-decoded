// DOSSIER 031 — Anti-collision (TCAS). The film, assembled:
//   plan.js     where everything stands           world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   tcas.js     the system: the processor, the two antennas, the transponder, the screens, the speaker (and the peer)
//   cockpit.js  the flight decks like an X-ray, the planes' lights, the waves between the two planes
//   (023's A330 ×2: episodes/023-eolienne-de-secours/src/avion.js, imported as it is)
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE TCAS'S MEASURE. Its big readout is `tau`: the seconds before the closest point, as the voice says
// them (« il te reste trente-cinq secondes ») — ink above 48 s, signal from the order (35 s) down, veille once the
// planes have passed (0,0 s). Its second readout, « Pour obéir », is `obey`: what is left of the five seconds the
// pilot has to answer an order ([P] FAA, BFU) — « — » while there is no order (obey < 0); signal while it runs, veille
// once you have answered (the act stops it on « tu tires »). Past the loop both read the first frame's values.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, TCAS } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
const secs = (s) => `${Math.max(0, s).toFixed(1).replace(".", ",")} s`;

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
  const clock = $("hud-clock");
  const count = $("hud-count");
  // when the order has been answered (`pull` past half), the five seconds stop and turn veille
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    clock.style.color = W.tau <= 0.05 ? VEILLE : W.tau <= TCAS.ra + 0.05 ? SIGNAL : INK;
    return secs(W.tau);
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    if (W.obey < 0) {
      count.style.color = INK;
      return "—";
    }
    count.style.color = W.pull > 0.5 ? VEILLE : SIGNAL;
    return secs(W.obey);
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
