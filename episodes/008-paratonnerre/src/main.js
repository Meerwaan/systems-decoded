// DOSSIER 008 — Paratonnerre. The film, assembled:
//   plan.js    where everything stands           world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   house.js   the house, you, the tree          bolt.js    the sky, the rain, the leaders, the return stroke
//   model.js   the rod on the house, the kit on the bench
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js   chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script: they depend on world.js alone.
//
// The story clock is in MILLISECONDS: the film opens 1.2 ms before the stroke, stops at T−1,00 ms once the hook's
// first sentence is said, and starts again with act 3 — one millisecond stretched over fourteen seconds, to
// "Contact" (T+0,00), then the third of a millisecond the current takes to drain into the earth. The second
// counter of the header is the current in the rod: nothing, then thirty thousand amperes, then nothing again.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 400000, fog: 0.000004, keySize: 2.5 });
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

  const t = D.times({ said: "accroche$", zero: "zero", contact: "trigger", amps: "amps", flow: "flow", earth: "earth", gone: "cuivre$", toloop: "toloop" });
  const CLOCK = [[0, -1.2], [t.said, -1], [t.zero, -1], [t.contact, 0], [t.flow, 0.03], [t.gone, 0.3]];
  const AMPS = [[t.contact, 0], [t.contact + 0.18, 30000], [t.flow, 30000], [t.earth, 9000], [t.gone + 0.4, 0]];
  const stamp = (ms) => `T${ms < -0.004 ? "−" : "+"}${Math.abs(ms).toFixed(2).replace(".", ",")} ms`;
  const amps = (a) => `${Math.round(a / 100) * 100}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " A";
  D.readout("hud-clock", (time) => stamp(time >= t.toloop ? CLOCK[0][1] + ((time - D.END) / t.said) * 0.2 : along(CLOCK, time)));
  D.readout("hud-count-v", (time) => amps(time >= t.toloop ? 0 : along(AMPS, time)));
  // (the figure alone turns signal: its small label, in signal over a sky lit white by the stroke, failed the contrast check)
  const count = $("hud-count-v");
  stage.onProject((time) => {
    const a = time >= t.toloop ? 0 : along(AMPS, time);
    count.style.color = a > 500 ? "#ff5b2e" : "#e9e4d8";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
