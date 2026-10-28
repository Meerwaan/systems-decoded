// DOSSIER 028 — Détecteur de CO. The film, assembled:
//   plan.js    where everything stands            world.js   the sets, the state (FIRST), the camera (POSE0, VIEW), apply()
//   foyer.js   the flat around 022's bedroom: the corridor, the boiler that leaks, the gas, the children's room, the window, outside
//   model.js   the system: the CO detector (grille, membrane, electrode, chip, buzzer, battery) — and the maquette of the blood
//   acte1.js   01 MENACE     acte2.js   02 AUTOPSIE     acte3.js   03 RÉPONSE     fin.js     chute, calls to action, loop
// Each act only writes st / shot / cut / tl calls on times read off the script (cues of episode.json).
//
// THE HEADER IS THE NIGHT. Its big readout is the clock, `clock` (minutes after midnight): 01:48 on the first frame,
// it barely moves while the voice tells the scene and the autopsy; « Une heure passe » sends it to 02:50; « Dix
// minutes. Vingt. » to 03:00, 03:10 — the alarm; then it holds. Illustrative (a scenario: `sources`).
// Its second readout, « CO · air », is `ppm`, the gas in the bedroom's air, « ≈ 50 ppm » → « ≈ 100 ppm » on « Le gaz
// monte encore »: ONLY those two figures are ever held (the zones of EN 50291-1 as its makers publish them); between
// them it runs, rounded to ten. Signal while there is gas (≥ 25), « — » once the air has cleared (< 5).
// The gauge (#gauge, brought in by an act) reads `dose` against the threshold (« Il sonne »), and the minutes counted
// since 01:48 — the chip's sum, « minute après minute ».
// Past the loop both read the first frame's values (D.loop slides the state back).
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { buildWorld, FIRST, POSE0, SIZE, LOOK, STORY } from "./world.js";
import acte1 from "./acte1.js";
import acte2 from "./acte2.js";
import acte3 from "./acte3.js";
import fin from "./fin.js";

const $ = (id) => document.getElementById(id);
const INK = "#e9e4d8";
const VEILLE = "#5cffb0";
const SIGNAL = "#ff5b2e";
/** Where the threshold stands on the gauge's track (index.html: #gauge-th { left: 72% }): dose 1 fills to it. */
const GAUGE_TH = 0.72;

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

  const toLoop = D.at("toloop");
  const hhmm = (m) => {
    const t = Math.floor(Math.max(0, m)) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  };
  D.readout("hud-clock", (time) => hhmm((time >= toLoop ? FIRST : D.W).clock));
  const count = $("hud-count");
  D.readout("hud-count-v", (time) => {
    const v = (time >= toLoop ? FIRST : D.W).ppm;
    count.style.color = v >= 25 ? SIGNAL : INK;
    if (v < 5) return "—";
    return `≈ ${Math.round(v / 10) * 10} ppm`;
  });

  // the gauge: the chip's sum against its threshold, and the minutes it has counted
  const fill = $("gauge-fill");
  D.readout("gauge-v", () => {
    const k = Math.min(1 / GAUGE_TH, Math.max(0, D.W.dose));
    fill.style.transform = `scaleX(${(k * GAUGE_TH).toFixed(4)})`;
    fill.style.backgroundColor = D.W.dose >= 1 ? VEILLE : SIGNAL;
    return `${Math.round(Math.max(0, D.W.clock - STORY.start))} min`;
  });

  D.commit({ hook: ["accroche", "promesse"] });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
