// DOSSIER 026 — Soyouz MS-10. The film, assembled:
//   plan.js      where everything stands          world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   model.js     the system: the escape head (the fairing and its four small solid motors, the orbital and descent
//                modules, you and your crewmate, the console), the tower, the two sensors on the rocket
//   launcher.js  the Soyuz-FG seen like an X-ray: stages, Korolev's cross, booster D, the jets, the trail, the pad
//   sky.js       the sky and the Earth from `alt`, the air going by, the fall, the parachute, the steppe, the teaser
//   acte1.js     01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE STORY'S CLOCK AND ITS HEIGHT. The big readout, `clock`, counts the seconds from booster D's strike
// as the voice tells them: T−0,8 s while the boosters separate, T+0,0 s on the strike, T+3,0 s when the four motors
// fire (« Trois secondes ») — ink before the strike, signal from it, veille from the moment they fire (the acts hold
// it there). No time of the flight is ever shown (the sources differ by up to four seconds on the failure), no time
// after the motors either. On the pad: the date, « 11 oct. 2018 » (era 1) or « 14 mars 2019 » (era 2, Soyuz MS-12 —
// the title follows). The second readout, « Altitude », is `alt` in km: 50 at the failure (Borisov), 93 at the top
// (Wikipedia, RussianSpaceWeb), 0 on the steppe — and veille once you are down, alive.
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
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
const stamp = (s) => `T${s < -0.05 ? "−" : "+"}${Math.abs(s).toFixed(1).replace(".", ",")} s`;

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 160000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
  D.readout("hud-title", (time) => ((time >= toLoop ? FIRST : D.W).era > 1.5 ? "Soyouz MS-12" : "Soyouz MS-10"));
  D.readout("hud-clock", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    if (W.era > 1.5) {
      clock.style.color = VEILLE;
      return "14 mars 2019";
    }
    if (W.era > 0.5) {
      clock.style.color = INK;
      return "11 oct. 2018";
    }
    clock.style.color = W.fire > 0.5 || W.clock > 2.95 ? VEILLE : W.clock >= -0.05 ? SIGNAL : INK;
    return stamp(W.clock);
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= toLoop ? FIRST : D.W;
    count.style.color = W.era < 0.5 && W.alt < 0.001 ? VEILLE : INK;
    return `${Math.round(Math.max(0, W.alt))} km`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
