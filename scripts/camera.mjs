// How much of the film the picture sits still — read off the camera itself, before any render (2026-11-05).
// Merwan: « là c'est souvent des enchaînements de plans fixes… que la caméra glisse comme un plan-séquence ». The film's
// page is played frame by frame WITHOUT drawing it (≈ 20 s for a short); at each frame, how fast the picture moves as
// the eye feels it, in degrees per second: the turn of the view, the travel of the eye seen from what it aims at, the zoom.
//   npm run camera -- 038
// Measured on 015, 037 and 038 before the plan-séquence (sine.inOut shots that stop on every pose, cuts followed by a
// 10 % push): the picture under 4 °/s 36 % of the film, up to 20 s of still stretches. 038 rewritten with D.path: 3 %, none.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { launchChrome } from "./lib/chrome.mjs";
import { build } from "./build.mjs";

export const STILL = 4; // °/s: under this, the picture reads as a fixed shot
const CUT = 400; // °/s: over this on one frame, a cut

export async function camera(dir) {
  await build(dir, { quiet: true });
  const GPU = ["--use-gl=angle", ...(process.platform === "win32" ? ["--use-angle=d3d11"] : []), "--enable-gpu", "--ignore-gpu-blocklist", "--enable-webgl"];
  const browser = await launchChrome([...GPU, "--allow-file-access-from-files"]);
  let rows;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 270, height: 480, deviceScaleFactor: 1 });
    await page.evaluateOnNewDocument(() => { window.__timelines = {}; });
    await page.goto(pathToFileURL(path.join(dir, "index.html")).href, { waitUntil: "load" });
    rows = await page.evaluate(() => {
      const { stage } = window.SD;
      stage.composer.render = () => {}; // the world and the camera move, nothing is drawn
      const tl = window.__timelines.main;
      const out = [];
      const f = stage.camera.position.clone();
      for (let i = 0; i <= Math.floor(tl.duration() * 30); i++) {
        const t = i / 30;
        tl.time(t);
        stage.renderAt(t);
        const c = stage.camera;
        c.getWorldDirection(f);
        out.push([t, c.position.x, c.position.y, c.position.z, f.x, f.y, f.z, c.fov, stage.cam.d]);
      }
      return out;
    });
  } finally {
    await browser.close();
  }
  const sp = [];
  for (let i = 1; i < rows.length; i++) {
    const [t, x, y, z, a, b, c, fov, d] = rows[i];
    const p = rows[i - 1];
    const turn = Math.acos(Math.min(1, a * p[4] + b * p[5] + c * p[6])) * 57.3;
    const travel = (Math.hypot(x - p[1], y - p[2], z - p[3]) / Math.max(1e-6, d)) * 57.3;
    const zoom = Math.abs(Math.log(fov / p[7])) * 57.3 + Math.abs(Math.log(d / p[8])) * 28.6;
    sp.push({ t, v: (turn + travel + zoom) * 30 });
  }
  const END = rows.at(-1)[0];
  const cuts = sp.filter((s) => s.v > CUT).map((s) => s.t);
  const moving = sp.filter((s) => s.v <= CUT);
  const still = moving.filter((s) => s.v < STILL).length / Math.max(1, moving.length);
  const runs = [];
  let a = null;
  for (const s of sp) {
    const st = s.v < STILL;
    if (st && a == null) a = s.t;
    if ((!st || s === sp.at(-1)) && a != null) {
      if (s.t - a >= 1) runs.push([a, s.t]);
      a = null;
    }
  }
  const v = moving.map((s) => s.v).sort((x, y) => x - y);
  const q = (k) => v[Math.floor(k * (v.length - 1))] ?? 0;
  const per = [];
  for (let s = 0; s < Math.ceil(END); s++) {
    const w = moving.filter((r) => r.t >= s && r.t < s + 1);
    per.push(w.length ? w.reduce((u, r) => u + r.v, 0) / w.length : 0);
  }
  const mark = still > 0.12 || runs.length ? "·" : "✓"; // information while the pilot (038) is judged, not a verdict
  console.log(`  ${path.basename(dir)} · ${END.toFixed(1)} s · la caméra (plan-séquence : docs/recette-actes.md)`);
  console.log(`  ${mark} image quasi fixe (< ${STILL} °/s) : ${(still * 100).toFixed(0)} % du film   (pilote 038 : 3 % · 015, 037, 038 avant le 05/11 : 36 à 37 %)`);
  console.log(`    plages fixes ≥ 1 s : ${runs.length ? runs.map(([x, y]) => `${x.toFixed(1)}–${y.toFixed(1)} s`).join(", ") : "aucune"}`);
  console.log(`    coupes : ${cuts.length} (un plan toutes les ${(END / (cuts.length + 1)).toFixed(1)} s) · vitesse médiane ${q(0.5).toFixed(0)} °/s (25 % : ${q(0.25).toFixed(0)})`);
  console.log(`    par seconde : ${per.map((x, i) => `${i}:${x.toFixed(0)}`).join(" ")}`);
  return { still, runs, cuts, per };
}
