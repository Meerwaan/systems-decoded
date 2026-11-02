// DOSSIER 032 — Barre anti-panique. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   salle.js   the hall seen like an X-ray, its emergency door, the crowd, you — and the same door in 1883 (era 1)
//   model.js   the system: the panic bar, its arms, the box, the bolt (pêne), the strike (gâche), the return spring
//   avion.js   L03's cabin, imported: door 1L for the next file's announcement
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its big readout is the story's clock, T+ seconds since the crowd started pushing (ILLUSTRATIVE: the
// voice gives no time — `sources` says so): it runs through act 1, is held during the autopsy, runs again in act 3
// and STOPS when the door swings out (« La porte bascule dehors »). In 1883 (`era` 1) it reads the date, « 16 juin
// 1883 » (sourced; the voice says the year). Its second readout, « Porte », is the door's state, read in the scene —
// never written by an act: « Fermée » (signal) while the bolt is thrown and the leaf shut · « Libre » (veille) once the
// bolt is drawn back (`pene` ≥ 0.5) · « Ouverte » (veille) once the leaf moves (`swing` ≥ 0.08) · « Verrou » (signal)
// in 1883. On the bench it reads the bench's bolt (« Le pêne reste sorti : la porte tient » → Fermée). Past the loop
// both read the first frame's values.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 9000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  // the story clock (illustrative): runs in act 1, held during the autopsy, runs again from « On rejoue », stops on « dehors »
  const toLoop = D.at("toloop");
  const CLOCK = [[0, 0], [D.at("tobench"), 6.4], [D.at("torejoue"), 6.4], [D.at("dehors"), 9.8]];
  const stamp = (s) => `T+${Math.max(0, s).toFixed(1).replace(".", ",")} s`;
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    clock.style.color = INK;
    if (W.era > 0.5) return "16 juin 1883";
    return stamp(time >= toLoop ? 0 : along(CLOCK, time));
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    let text = "Fermée";
    let color = SIGNAL;
    if (W.era > 0.5) text = "Verrou";
    else if (W.swing >= 0.08) [text, color] = ["Ouverte", VEILLE];
    else if (W.pene >= 0.5) [text, color] = ["Libre", VEILLE];
    count.style.color = color;
    return text;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
