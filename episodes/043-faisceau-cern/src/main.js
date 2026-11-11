// DOSSIER 043 — Le faisceau du CERN. The film, assembled:
//   plan.js     where everything stands (a maquette at the scale of the subject)
//   world.js    the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   anneau.js   around, X-ray, and the train: the tunnel, the arc magnets, the pipe, the 2 496 bunches, the grain, its
//               shower, the struck coil, the 3 600 loss monitors, the alert, the comment's grains; the 044 teaser far away
//   sortie.js   the system, solid: point 6 — kickers, septa, the line, the dilution magnets, the block, its « e »
//   acte1.js    01 MENACE (accroche, promesse, scene)                 0 → toopen
//   acte2.js    02 AUTOPSIE (« on l'ouvre », the exploded view, the principle, the kickers at rest)   toopen → tozero
//   acte3.js    02 → 03 (back to the grain, the threshold, the alert, the gap, the train out, the « e »)   tozero → toverdict
//   fin.js      chute, what the film owes, like, the next file, the loop                             toverdict → end
// Each act only writes st / shot / path / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER. Its big readout is the story's clock in MICROSECONDS around the instant the kickers fire (T+0, « quinze
// aimants s'allument »). Sourced: one turn = 89 µs (the extraction, « tout est dedans » at T+89), the gap = 3 µs (the
// kickers rise in it: T−3 on « Le trou passe »), a UFO loss lasts about ten turns (IPAC2012) — the hook starts ≈ ten
// turns before the dump. Everything between is a reconstitution of that order of magnitude (`sources` says so); no
// delay from the detection to the dump is published as a figure, and none is said. The hook runs T−900 → T−880; the
// scene (« même seconde ») goes back to T−900 and runs to T−860; the autopsy holds it (ink, dimmed: time stopped);
// act 3 resumes at T−300 (« Retour au grain »), T−210 on « seuil », T−200 on « part », T−8 on « le trou », T−3 on
// « passe », T+0 on « s'allument », T+89 on « dedans » (veille from there), held to the end; past the loop, the first
// frame's.
// The second readout counts the train: « Paquets ≈ 2 500 » (Run 3: about 2 500 per beam, HB2023), which empties with
// `dump` to 0 at « dedans » (veille); from `tocta` it counts the dumps the grains forced, « Arrêts · grains », 0 → 37
// with `grains` (IPAC2012: 37 between July 2010 and early 2012).
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
const NB = " "; // the narrow no-break space of French numbers

/** µs → « T−860 µs » / « T+89 µs » (whole microseconds). */
const stamp = (us) => {
  const v = Math.round(Math.abs(us));
  return `T${us < -0.4 ? "−" : "+"}${v} µs`;
};
const thousands = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);

function build() {
  const stage = createStage($("stage"), { scale: SIZE, far: 100000, keySize: 2.5, ...LOOK }); // LOOK (world.js): the lens, the air, the surface
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
    promesse: "promesse", scene: "scene", sceneEnd: "scene$", toOpen: "toopen", toZero: "tozero",
    seuil: "zero:seuil", part: "zero:part", trou: "zero:trou", passe: "reponse:passe", fire: "trigger",
    dedans: "reponse:dedans", toCta: "tocta", toLike: "tolike", toLoop: "toloop",
  });
  const HOOK = [[0, -900], [T.scene, -880]];
  const SCENE = [[T.scene, -900], [T.sceneEnd, -860]];
  const ACT3 = [[T.toZero, -300], [T.seuil, -210], [T.part, -200], [T.trou, -8], [T.passe, -3], [T.fire, 0], [T.dedans, 89]];
  const clock = $("hud-clock");
  const count = $("hud-count");
  const paint = (el, color, opacity = 1) => {
    el.style.color = color;
    el.style.opacity = opacity;
  };
  D.readout("hud-clock", (time) => {
    if (time >= T.toLoop || time < T.scene) {
      paint(clock, SIGNAL);
      return stamp(along(HOOK, time >= T.toLoop ? 0 : time));
    }
    if (time < T.toOpen) {
      paint(clock, SIGNAL);
      return stamp(along(SCENE, time));
    }
    if (time < T.toZero) {
      paint(clock, INK, 0.55); // the autopsy: time stopped
      return stamp(-860);
    }
    paint(clock, time >= T.dedans ? VEILLE : SIGNAL, time >= T.toCta ? 0.55 : 1);
    return stamp(along(ACT3, Math.min(time, T.dedans)));
  });
  D.readout("hud-count-l", (time) => (time >= T.toCta && time < T.toLoop ? "Arrêts · grains" : "Paquets"));
  D.readout("hud-count-v", (time) => {
    const W = time >= T.toLoop ? FIRST : D.W;
    if (time >= T.toCta && time < T.toLoop) {
      paint(count, SIGNAL);
      // the tally is counted in the comment's shot; from the like on it holds at 37 (the like's train is a new picture)
      return time >= T.toLike ? "37" : String(Math.round(Math.min(37, Math.max(0, W.grains))));
    }
    if (W.dump >= 0.999) {
      paint(count, VEILLE);
      return "0";
    }
    paint(count, INK, W.beam < 0.5 ? 0.55 : 1);
    return W.dump > 0.001 ? thousands(2500 * (1 - W.dump)) : `≈${NB}2${NB}500`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
