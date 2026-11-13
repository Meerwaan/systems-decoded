// DOSSIER 047 — Lave-vaisselle. The film, assembled:
//   plan.js    where everything stands         world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js   the system (the water circuit)  cuve.js    the dishwasher around it, the dish, the crust (X-ray)
//   cuisine.js 009's kitchen, the sink, you, the two columns of water
//   acte1.js   01 MENACE (hook, scene)         acte2.js   02 AUTOPSIE (bench: « on l'ouvre », exploded view, principle)
//   acte2b.js  02 AUTOPSIE (scene: the system at rest — the tablet, the arm with no motor, the crust)
//   acte3.js   03 RÉPONSE (the main wash)      fin.js     chute, the three calls to action, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json):
// they do not depend on each other, only on world.js.
//
// THE HEADER. The clock is the eco programme's own: « 0 h 08 » — minutes into the cycle (`cycle`), illustrative until
// the main wash, then stretched by the chute to ≈ 3 h 30 (210 min, inside the reference 195–222 min of the eco
// programme, EU regulation 2019/2022 annex V: `sources`). The count is the water's temperature (`temp`, °C): it climbs
// « vers cinquante degrés » and never shows more (Bosch FR: eco at 50 °C at most). Past the loop, the first frame's.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, sinnerShares } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte2b from "./acte2b.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";
import { dressScene } from "./habillage.js";

const $ = (id) => document.getElementById(id);

/** « 0 h 08 » from minutes. */
const cycleStamp = (min) => {
  const m = Math.max(0, Math.round(min));
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const dress = dressScene(stage); world.set.add(dress.group); // habillage.js: the life of the place, around the machine
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  acte1(ctx);
  acte2(ctx);
  acte2b(ctx);
  acte3(ctx);
  fin(ctx);

  // the header: the programme's clock and the water's temperature, read off the state; past the loop, the first frame's
  const toLoop = D.at("toloop");
  D.readout("hud-clock", (time) => cycleStamp(time >= toLoop ? FIRST.cycle : D.W.cycle));
  D.readout("hud-count-v", (time) => `${Math.round(Math.min(50, time >= toLoop ? FIRST.temp : D.W.temp))} °C`);
  // the passes counter of the climax (#passes-v, index.html)
  D.readout("passes-v", () => String(Math.floor(D.W.passes)));

  // the Sinner panel (#sinner): four arcs of one ring, their lengths from sHeat (the circle stays full)
  const arcs = ["sinner-heat", "sinner-time", "sinner-chem", "sinner-force"].map($);
  const RING = 2 * Math.PI * 90; // the arcs' circle (r 90 in the panel's viewBox)
  const GAP = 6;
  const drawSinner = (W) => {
    const panel = $("sinner");
    if (panel) panel.style.opacity = String(W.sinner);
    if (W.sinner <= 0.001) return;
    let from = 0;
    sinnerShares(W.sHeat).forEach((share, i) => {
      const len = Math.max(0.1, share * RING - GAP);
      const arc = arcs[i];
      if (arc) {
        arc.setAttribute("stroke-dasharray", `${len.toFixed(1)} ${RING.toFixed(1)}`);
        arc.setAttribute("stroke-dashoffset", (-from * RING).toFixed(1));
      }
      from += share;
    });
  };

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => {
    world.apply(D.W, time);
    dress.update(D.W, time, stage.pixelScale());
    drawSinner(D.W);
  });
  stage.start();
  return D.tl;
}

window.SD = { build };
