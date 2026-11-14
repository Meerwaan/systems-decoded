// DOSSIER 049 — GPS. The film, assembled:
//   plan.js      where everything stands (no import)     world.js      the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   route.js     025's road at night + the T junction, the field, the phone's holder (an envelope: 025 is never modified)
//   model.js     THE PHONE (the system, solid)           satellite.js  THE SKY: satellites, rings, spheres, the dot; the bench's thread
//   acte1.js     01 MENACE (hook, scene)                 acte2.js      02 AUTOPSIE (« Alors… on l'ouvre », exploded view, principle, rest)
//   acte3.js     03 RÉPONSE (the junction)               fin.js        chute, comment (duel), like, next file, the loop
// Each act only writes st / shot / cut / tl calls on times read off the script (D.times, cues of episode.json).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { BRAND } from "@kit/brand.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const comma = (x, n) => x.toFixed(n).replace(".", ",");

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 90000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  // THE HEADER — the story's clock as the voice says it: seconds to the junction (« un carrefour, dans cinq
  // secondes »), `eta` (the acts move it; the road scrolls with it), signal under 1 s. Then the phone's own clock:
  // its lag in µs, `err` (« un millionième », the script's demonstration): signal while wrong, veille once solved.
  // Past the loop, both read FIRST (the last frame is the first).
  const toLoop = D.at("toloop");
  const clock = $("hud-clock");
  const count = $("hud-count");
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const s = Math.max(0, W.eta);
    clock.style.color = s < 1 ? BRAND.signal : BRAND.ink;
    return `T−${comma(s, 1)} s`;
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    const e = Math.min(1, Math.max(0, W.err));
    count.style.color = e > 0.02 ? BRAND.signal : BRAND.veille;
    // in seconds, never « µs »: the header is in capitals and « µ » turns into « Μ » (it read « 1 MS », a millisecond)
    const d = Math.round(e * 10);
    return d >= 10 ? "0,000 001 s" : d <= 0 ? "0 s" : `0,000 000 ${d} s`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
