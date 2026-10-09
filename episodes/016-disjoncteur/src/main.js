// DOSSIER 016 — Disjoncteur. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   wall.js    the room like an X-ray: the wire in the wall, the consumer unit, the kettle, the heater, you
//   model.js   the system: one modular breaker — handle, spring, contacts, the bimetal blade, the coil, the arc chamber
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THIS FILM'S CLOCK IS AN AMMETER. The header's big readout is the current (`amps`): it turns signal above the
// breaker's rating. Its second readout is how long that current has lasted (`secs`): hundredths of a second for a
// short circuit, minutes for an overload — the two traps of the breaker are the two scales of that number.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, RATING } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5 });
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
  const lasted = (s) => (s < 1 ? `${s.toFixed(2).replace(".", ",")} s` : s < 90 ? `${Math.round(s)} s` : `${Math.round(s / 60)} min`);
  D.readout("hud-clock", () => {
    const a = Math.max(0, D.W.amps);
    clock.style.color = a > RATING + 0.5 ? "#ff5b2e" : "#e9e4d8";
    return a >= 1000 ? `${Math.round(a / 1000)} 000 A` : `${Math.round(a)} A`; // no "kA": the header is in capitals
  });
  D.readout("hud-count-v", () => lasted(Math.max(0, D.W.secs)));

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
