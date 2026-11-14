// 02 · AUTOPSIE — SKELETON by the architect (it builds; the acte agent rewrites it whole: docs/049-actes.md › acte2.js).
// « Alors… » on the bench, cut at `tobench`; the phone opens ON « on »; the satellite above opens on « oscillateur ».
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, BENCHED } from "./world.js";

export default function acte2({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({ ouvre: "ouvre", tobench: "tobench", explode: "explode", oscillateur: "oscillateur", coeur: "coeur",
    pourquoi: "pourquoi", metres: "metres", trajet: "trajet", donne: "donne", audessus: "audessus", tozero: "tozero" });
  chip("chip-300", null, 96, 470, t.metres - 0.2, t.trajet - 0.15);
  chip("chip-trajet", null, 96, 470, t.trajet + 0.3, t.audessus - 0.2);
  setAct(tl, 2, t.ouvre);
  cut(t.tobench, SET.BENCH, VIEW.bench, { ...BENCHED });
  st(t.explode, 1.2, { explode: 1 }, "power2.out");
  shot(t.explode, 1.4, VIEW.exploded, "sine.inOut");
  shot(t.oscillateur - 0.4, 1.2, VIEW.satBench, "sine.inOut");
  st(t.oscillateur, 1, { satExplode: 1 }, "power2.out");
  st(t.coeur, 0.8, { core: 1 }, "sine.inOut");
  shot(t.pourquoi, t.audessus - t.pourquoi, VIEW.thread, "sine.inOut");
  st(t.pourquoi, 0.6, { ruler: 1, core: 0, satExplode: 0 }, "sine.inOut");
  st(t.pourquoi + 2, 6, { travel: 1 }, "none");
}
