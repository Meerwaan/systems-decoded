// DOSSIER 029 — Airbag d'avalanche. The film, assembled:
//   plan.js    where everything stands, the two frames      world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   pente.js   the slab slope aux rayons X, the crack, the flow and its blocks, you of glass, the valley far below
//   model.js   the system: the pack, its harness, the handle, the cable, the cartridge, the venturi, the balloon
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its clock is the story's, `sec`: the seconds since the crack (T+0:00 on frame 0, the crack already
// running), « T+m:ss ». The acts drive it: real time while you are carried, held while the film opens the pack; in
// act 1's vision (« Enseveli, tu as une dizaine de minutes ») it runs fast toward ten minutes — an order of magnitude,
// the voice's « une dizaine » (CMAJ 2011, JAMA 2024: `sources`) — and comes back. Signal while you are under the snow
// (`bury` > 0.5), veille once the balloon is full and you are near the surface, ink otherwise.
// Its count is « Ballon », in litres: `bag` × 150 — the norm's minimum, the only volume the voice gives (« au moins
// cent cinquante litres »). 0 while it is folded (ink), veille as it fills.
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, BAG } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const DIM = "rgba(233, 228, 216, 0.62)";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 150000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const s = Math.max(0, Math.floor(W.sec));
    clock.style.color = W.bury > 0.5 ? SIGNAL : W.bag > 0.95 && W.bury < 0.3 ? VEILLE : INK;
    return `T+${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    count.style.color = W.bag > 0.02 ? VEILLE : DIM;
    return `${Math.round(BAG.litres * Math.min(1, Math.max(0, W.bag)))} L`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
