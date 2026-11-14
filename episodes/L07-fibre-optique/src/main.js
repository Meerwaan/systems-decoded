// DOSSIER L07 — La fibre optique (format long, 16:9). The film, assembled:
//   plan.js      the numbers every set reads (no import: the sets are built at the same time against it)
//   world.js     the sets, the state (FIRST), the camera (POSE0, VIEW, HAND), the steps of the journey (STEPS), apply()
//   chapters.js  the chapter files in order — each one only writes st / shot / cut / tl calls on times read
//                off the script (D.at), and starts with its half of a seam: they do not depend on each other
// The page carries no captions: chapter cards, keywords and the header; the words go in the .srt (npm run srt).
//
// THE HEADER: the step of the fibre's journey (« Étape 04 / 12 · La tour de fibrage »), and ONE readout that is
// either the TEMPERATURE OF THE GLASS (tempOn: the factory's furnaces, sourced values only) or THE LIGHT LEFT
// (lumOn: the 1960s glass, Corning 1970, today's kilometre, the coupler's share, the budget) — its label changes with it.
import "@kit/landscape.js"; // first: the 16:9 frame, before anything reads BRAND.W / BRAND.H
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { lineHud, fmtTemp, tempTone } from "@kit/long.js";
import { buildWorld, FIRST, POSE0, SIZE, FAR, STEPS, CARD, KEYWORDS_SKIP, LOOK } from "./world.js";
import CHAPTERS from "./chapters.js";

const $ = (id) => document.getElementById(id);

/** The light left, as the header shows it: "50 %", "2 %", "< 1 %". Encoded as −1 − % (a temperature is ≥ 0). */
// (CSS colours: the header is HTML — signal #ff5b2e, veille #5cffb0)
const fmtLum = (p) => (p < 1 ? "< 1 %" : `${Math.round(p)} %`);

function build() {
  // LOOK (world.js): the air and the surface for the whole film; the lens is a pose number (CLOSE / SHARP), never the film's
  const stage = createStage($("stage"), { scale: SIZE, far: FAR, keySize: 2.5, air: LOOK.air, finish: LOOK.finish });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  for (const chapter of CHAPTERS) chapter(ctx);

  const W = D.W;
  lineHud(stage, {
    steps: STEPS,
    step: () => Math.round(W.etape),
    temp: () => (W.lumOn > 0.5 ? -1 - W.lum : W.tempOn > 0.5 ? W.temp : null),
    off: "Hors chaîne",
    fmt: (v) => (v < 0 ? fmtLum(-1 - v) : fmtTemp(v)),
    tone: (v) => (v < 0 ? (W.lumBad > 0.5 ? "#ff5b2e" : "#5cffb0") : tempTone(v)),
  });
  // the readout's label follows what it reads
  const label = document.querySelector(".hud__temp-l");
  let lastLabel = null;
  stage.onProject(() => {
    const t = W.lumOn > 0.5 ? "Lumière restante" : "Température du verre";
    if (t !== lastLabel) label.textContent = lastLabel = t;
  });

  // a chapter that shows something better than a keyword says so: D.quiet(from, to)
  D.commit({ long: { chapters: CARD, keywords: { skip: KEYWORDS_SKIP } } });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
