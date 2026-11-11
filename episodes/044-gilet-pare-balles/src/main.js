// DOSSIER 044 — Le gilet pare-balles. The film, assembled:
//   plan.js    where everything stands           world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   gilet.js   the system, solid: the vest on the body, the front panel (housse, 24 layers, seams), the bullet, the cone,
//              the mushroom; on the bench the exploded view, the heart yarn, the strength test
//   rue.js     around, X-ray: the street at night and its riot, the policeman and his torso, the walk home; on the bench
//              the clay block and its gauge, the ghost plate, the ghost blade, the 045 rocket
//   acte1.js   01 MENACE (accroche, promesse, scene)
//   acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded view, the principle, the panel at rest, the tip touches)
//   acte3.js   03 RÉPONSE (the yarns snap and pull, the cone, the mushroom, home)
//   fin.js     chute, what the film owes, like, the next file, the loop
// Each act only writes st / now / path / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its big readout is the story's clock in milliseconds around the instant the tip touches the first layer
// (T+0), read off the state: before contact T = −dist / SPEED (≈ 400 m/s, the order of magnitude of the norm's test
// rounds); from contact to the stop T = STOP · cone (≈ 0,2 ms, a reconstitution — `sources` says so). The hook runs
// T+0,10 → ≈ T+0,17 (the bullet already in the cone); the scene goes back to T−37,5 (15 m away) → T−0,10 (4 cm), held and
// dimmed on the bench; act 3 runs T+0 → T+0,20 ms on « champignon » (veille once stopped), held to the loop.
// The second readout says what the bullet does, read off the state: « Balle · ≈ 400 m/s » in flight (signal), « Freinée »
// in the panel (signal), « Arrêtée » once the cone and the mushroom are full (veille); from « La norme » it becomes
// « Creux » and counts the gauge to 44 mm (the norm's limit, said by the voice). Past the loop both read the first frame's.
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, SET } from "./world.js";
import { SPEED, STOP } from "./plan.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

/** ms → « T−37,5 ms » · « T+0,14 ms » (two decimals under 1 ms, one under 10, whole above; French decimal comma). */
const stamp = (ms) => {
  const a = Math.abs(ms);
  const v = a < 1 ? a.toFixed(2) : a < 10 ? a.toFixed(1) : String(Math.round(a));
  return `T${ms < -0.004 ? "−" : "+"}${v.replace(".", ",")} ms`;
};

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 30000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  const T = D.times({ toVerdict: "toverdict", norme: "comment:norme", hold: "comment:commentaire", toLoop: "toloop" });
  const clock = $("hud-clock");
  const count = $("hud-count");
  const label = $("hud-count-l");
  const paint = (el, color, opacity = 1) => {
    el.style.color = color;
    el.style.opacity = opacity;
  };
  const says = (txt) => {
    if (label.textContent !== txt) label.textContent = txt;
  };
  const isStopped = (W) => W.dist <= 0.01 && W.cone >= 0.98 && W.mushroom >= 0.98;
  const held = (time) => time >= T.toVerdict && time < T.toLoop; // from the chute the bullet IS stopped, whatever the picture replays

  D.readout("hud-clock", (time) => {
    const W = time >= T.toLoop ? FIRST : D.W;
    const ms = held(time) ? STOP : W.dist > 0.01 ? -W.dist / SPEED : STOP * Math.min(1, W.cone);
    paint(clock, held(time) || isStopped(W) ? VEILLE : SIGNAL, W.set === SET.BENCH ? 0.55 : 1);
    return stamp(ms);
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= T.toLoop ? FIRST : D.W;
    if (time >= T.norme && time < T.toLoop) {
      says("Creux");
      const g = time >= T.hold ? 1 : Math.min(1, W.gauge);
      paint(count, g >= 0.98 ? VEILLE : INK);
      return `${Math.round(44 * g)} mm`;
    }
    says("Balle");
    const dim = W.set === SET.BENCH ? 0.55 : 1;
    if (held(time) || isStopped(W)) {
      paint(count, VEILLE, dim);
      return "Arrêtée";
    }
    paint(count, SIGNAL, dim);
    return W.dist > 0.01 ? "En vol" : "Freinée";
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
