// DOSSIER L05 — Hudson (format long, affaire réelle, 16:9). The film, assembled:
//   plan.js      the numbers every set reads (no import: the sets are built at the same time against it)
//   world.js     the sets, the state (FIRST), the clock (CLOCK), the camera (POSE0, VIEW, HAND), apply()
//   pieces.js    the pièces du dossier (real documents, framed, with their source)
//   chapters.js  the chapter files in order — each one only writes st / shot / cut / tl calls on times read
//                off the script (D.at), and starts with its half of a seam: they do not depend on each other
// The page carries no captions: chapter cards, keywords and the header; the words go in the .srt (npm run srt).
//
// THE HEADER OF AN AFFAIRE (docs/recette-long-affaire.md): the date and the place of the day (`era`), the REAL time
// of New York as the voice says it (world.js · CLOCK, `clockOn`), and a second counter from the report: the time
// left before the river, 3:32 at the strike (`countOn`, signal). The line under it: one tick per chapter.
import "@kit/landscape.js"; // first: the 16:9 frame, before anything reads BRAND.W / BRAND.H
import { createStage } from "@kit/stage.js";
import { createDirector } from "@kit/direct.js";
import { createCallouts } from "@kit/overlay.js";
import { chaptersOf } from "@kit/long.js";
import { BRAND } from "@kit/brand.js";
import { buildWorld, makeClock, fmtClock, fmtCount, ERAS, FIRST, POSE0, SIZE, FAR, CARD, KEYWORDS_SKIP, LOOK } from "./world.js";
import CHAPTERS from "./chapters.js";

const $ = (id) => document.getElementById(id);

function affaireHud(stage, D, clock) {
  const n = $("hud-step-n");
  const w = $("hud-step-t");
  const v = $("hud-temp-v");
  const box = $("hud-count");
  const c = $("hud-count-v");
  const chaps = chaptersOf(window.__EPISODE);
  const ticks = chaps.map(() => $("hud-line").appendChild(document.createElement("i")));
  let lastE = -1;
  let lastK = -1;
  let lastV = "";
  let lastC = "";
  let lastOn = -1;
  stage.onProject((time) => {
    const W = D.W;
    const e = Math.max(0, Math.min(ERAS.length - 1, Math.round(W.era)));
    if (e !== lastE) {
      lastE = e;
      n.textContent = ERAS[e].date;
      w.textContent = ERAS[e].where;
    }
    let k = 0;
    chaps.forEach((ch, i) => (time >= ch.at ? (k = i) : 0));
    if (k !== lastK) {
      lastK = k;
      ticks.forEach((i, j) => (i.className = j === k ? "is-on" : j < k ? "is-done" : ""));
    }
    const t = clock(time);
    const text = W.clockOn > 0.5 ? fmtClock(t) : "—";
    if (text !== lastV) v.textContent = lastV = text;
    const on = W.countOn > 0.5 ? 1 : 0;
    if (on !== lastOn) box.style.opacity = lastOn = on;
    const ct = fmtCount(t);
    if (ct !== lastC) {
      c.textContent = lastC = ct;
      c.style.color = ct === "0:00" ? BRAND.ink : BRAND.signal;
    }
  });
}

function build() {
  // LOOK (world.js): the air and the surface for the whole film; the lens is a pose number (CLOSE / SHARP), never the film's
  const stage = createStage($("stage"), { scale: SIZE, far: FAR, keySize: 2.5, air: LOOK.air, finish: LOOK.finish });
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera
  const world = buildWorld(stage);
  const D = createDirector({ stage, first: FIRST, pose0: POSE0 });
  window.SD.S = D.S; // for the trial frames
  const clock = makeClock(D);
  world.setClock(clock);
  const co = createCallouts(stage, $("callouts"), $("leaders"));

  const ctx = { D, world, co };
  for (const chapter of CHAPTERS) chapter(ctx);

  affaireHud(stage, D, clock);

  // a chapter that shows something better than a keyword says so: D.quiet(from, to)
  D.commit({ long: { chapters: CARD, keywords: { skip: KEYWORDS_SKIP } } });
  stage.onUpdate((time) => world.apply(D.W, time));
  stage.start();
  return D.tl;
}

window.SD = { build };
