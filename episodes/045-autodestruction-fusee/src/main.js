// DOSSIER 045 — L'autodestruction de la fusée. The film, assembled:
//   plan.js        where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   kourou.js      around, X-ray: the base (026's dome, savanna, mangrove, the pad, the corridor, the booth, the 046 flare)
//   fusee.js       around, X-ray: Ariane 5 (its bay and SRI, nozzles, junctions and links, the charges along the hull, the breakup)
//   sauvegarde.js  the system, solid: the destruction chain, and the principle's section (the V, the copper, the jet, the plate)
//   acte1.js   01 MENACE (accroche, promesse, scene)            → tobench
//   acte2.js   02 AUTOPSIE (« on l'ouvre », the exploded chain, the principle)  → torepos
//   acte3.js   the chain at rest, the CNES watching, then 03 RÉPONSE (the guidance fails, the veer, the tearing, the charge)
//   fin.js     chute, what the film owes, like, the next file, the loop
// Each act only writes st / now / path / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. The big readout is the story's clock, « H0+… s » from the Vulcain's ignition (Lions §1.1), as the voice
// says it: the hook and the scene ≈ H0+38,8 → 39,0 (the tearing, « vers H0+39 s »), held and dimmed on the bench; at rest
// on the pad « H0 » (armed, waiting); from « Kourou » it runs (« suit chaque seconde ») to ≈ H0+32 on « bascule », 36,0 on
// « Trente-six », 36,7 on « lâchent », 39,0 on « s'arrachent », and holds; veille once the charge has done its work (« Tout
// retombe »). The second readout is the incidence (Lions §2.1: « more than 20° »), read off `incid`: whole degrees up to 20,
// then « > 20° » — never a figure the report does not give. Past the loop both read the first frame's.
import { createStage } from "@kit/stage.js";
import { createDirector, along } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, SET } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";

/** seconds after H0 → « H0+36,7 s » (null: « H0 », the instant it waits for). */
const stamp = (s) => (s == null ? "H0" : `H0+${s.toFixed(1).replace(".", ",")} s`);
/** the incidence in degrees → « 14° » · « > 20° » */
const angle = (deg) => (deg > 20.5 ? "> 20°" : `${Math.max(0, Math.round(deg))}°`);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 400000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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

  const T = D.times({
    tobench: "tobench", torepos: "torepos", kourou: "repos:Kourou", bascule: "repos:bascule", trente: "zero",
    lachent: "zero:lâchent", arrachent: "reponse:s'arrachent", tout: "reponse:Tout", toLoop: "toloop",
  });
  const RUN = [[T.kourou, 0], [T.bascule, 32], [T.trente, 36], [T.lachent, 36.7], [T.arrachent, 39]];
  const OPEN = [[0, 38.8], [T.tobench, 39]];
  const clockAt = (time) => {
    if (time >= T.toLoop) return OPEN[0][1];
    if (time < T.torepos) return along(OPEN, time);
    if (time < T.kourou) return null;
    return along(RUN, time);
  };
  const clock = $("hud-clock");
  const count = $("hud-count");
  const paint = (el, color, opacity = 1) => {
    el.style.color = color;
    el.style.opacity = opacity;
  };

  D.readout("hud-clock", (time) => {
    const W = time >= T.toLoop ? FIRST : D.W;
    const s = clockAt(time);
    const done = time >= T.tout && time < T.toLoop; // the charge has done its work: the debris fall near the pad
    paint(clock, done ? VEILLE : s == null ? INK : SIGNAL, W.set === SET.BENCH ? 0.55 : 1);
    return stamp(s);
  });
  D.readout("hud-count-v", (time) => {
    const W = time >= T.toLoop ? FIRST : D.W;
    paint(count, W.incid > 20.5 ? SIGNAL : INK, W.set === SET.BENCH ? 0.55 : 1);
    return angle(W.incid);
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
