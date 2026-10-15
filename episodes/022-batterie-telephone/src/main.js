// DOSSIER 022 — Batterie de téléphone. The film, assembled:
//   plan.js     where everything stands           world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   chambre.js  the bedroom at night, like an X-ray: you asleep, the pillow, the cable — and the ranks of the recalled model
//   model.js    the system: the phone, its battery, its layers (copper, the film, aluminium), its protection board
//   pores.js    the film between its two electrodes at the scale of its pores: a maquette (world.js mounts it on the system)
//   acte1.js    01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS A THERMOMETER. The header's big readout is the battery at its hottest point (`temp`): ink
// while it is cool, signal once it is warm. Only « vers 130 degrés » is sourced — every other value is illustrative,
// hence the « ≈ », always. Its second readout says what still flows: « Charge : en cours / coupée » (`charge`, the
// protection circuit), then, at the scale of the pores (`meter` 1), « Courant : passe / bloqué » (`pores`, the film).
// « Bloqué » in veille under « ≈ 130 °C » in signal is the whole film in one glance: the current has stopped, the
// heat has not.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
/** From this temperature up the thermometer reads as a threat (illustrative: a little above your own). */
const WARM = 38;

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 30000, keySize: 2.5 });
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
    const t = Math.round(D.W.temp);
    clock.style.color = t >= WARM ? SIGNAL : INK;
    return `≈ ${t} °C`;
  });
  D.readout("hud-count-l", () => (D.W.meter > 0.5 ? "Courant" : "Charge"));
  D.readout("hud-count-v", () => {
    if (D.W.meter > 0.5) {
      const open = D.W.pores > 0.5;
      count.style.color = open ? INK : VEILLE;
      return open ? "Passe" : "Bloqué";
    }
    const on = D.W.charge > 0.5;
    count.style.color = on ? INK : VEILLE;
    return on ? "En cours" : "Coupée";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
