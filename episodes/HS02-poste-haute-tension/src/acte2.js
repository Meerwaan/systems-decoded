// 02 · LE POSTE — lancement → gravier (11,0 → 32,2 s).
//   lancement  from the clamps, a pull-back by ratio up and out: your bay, then the whole poste at night
//   champ      you under your line (live), the field rising from the ground — no word, no number on screen
//   arc        the bench: the chamber cut open, the contacts part, the arc is born, its white core — CUT before the gas
//   gravier    down to your feet: the gravel, the mesh barely there, nothing drawn about what it does
import { setAct } from "@kit/overlay.js";
import { SET, AT, VIEW, L02_AT } from "./world.js";

export default function acte2({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    lancement: "lancement", premier: "lancement:poste", champ: "champ", baignes: "champ:baignes", sens: "champ:sens",
    arc: "arc", eteindre: "arc:éteindre", eclair: "arc:éclair", vingt: "arc:vingt", precis: "arc:précis",
    gravier: "gravier", propre: "gravier:propre", end: "sanscouper",
  });
  const from = t.lancement - 0.12;
  setAct(D.tl, 2, from);

  /* lancement — the clamps pull back, up and out: the poste at night */
  const near = { ...VIEW.clampHead, d: 240 };
  cut(from, SET.POSTE, near, { ...AT.poste, clamps: 2, l02: L02_AT.lancement, fx: 300, fy: 1046, fz: 600, fs: 900 });
  st(t.lancement + 1.5, 1.5, { fx: 600, fy: 600, fz: 0, fs: 1800 }, "sine.inOut");
  st(t.lancement + 2.5, 1.5, { clamps: 0 }, "sine.inOut"); //                      gone before they are too small to matter
  shot(from, t.premier - from, VIEW.bay, "sine.inOut", near.d);
  shot(t.premier, t.champ - 0.12 - t.premier, VIEW.wide, "sine.inOut", VIEW.bay.d);
  st(t.premier, 2.0, { fs: 6000, fx: 1500, fy: 300, fz: -1200 }, "sine.inOut");

  /* champ — you under your line, the field rising */
  const fAt = t.champ - 0.12;
  cut(fAt, SET.POSTE, VIEW.field, { ...AT.poste, live: 1, efield: 0, walk: 0.8, arms: 0, perche: 0, l02: L02_AT.champ, fx: 300, fy: 300, fz: 980, fs: 1300 });
  st(t.baignes - 0.1, 1.4, { efield: 1 }, "sine.inOut");
  shot(fAt, t.sens - 0.2 - fAt, { ...VIEW.field, d: 820, az: -34 }, "sine.inOut");
  shot(t.sens - 0.2, t.arc - 0.12 - (t.sens - 0.2), VIEW.rise, "sine.inOut", VIEW.field.d);
  now(t.arc - 0.3, { fils: 2 });

  /* arc — the chamber; the contacts part, the arc, its core; cut before anything blows on it */
  const aAt = t.arc - 0.12;
  cut(aAt, SET.BENCH, VIEW.chamber, { ...AT.bench, see: 1, open: 0, arc: 0, heat: 0, gas: 0, wave: 0, l02: L02_AT.arc, fx: 0, fy: 750, fz: 0, fs: 300 });
  st(t.eteindre, 0.6, { open: 1 }, "power2.inOut");
  st(t.eclair - 0.05, 0.25, { arc: 1 }, "power3.out");
  shot(aAt, t.vingt - aAt, { ...VIEW.chamber, d: 250, az: -22 }, "sine.inOut");
  st(t.vingt, 0.8, { heat: 0.75 }, "power2.out");
  shot(t.vingt, t.gravier - 0.12 - t.vingt, VIEW.core, "sine.inOut", 250);
  now(t.precis, { fils: 3 });

  /* gravier — down to your feet */
  const gAt = t.gravier - 0.12;
  cut(gAt, SET.POSTE, VIEW.gravel, { ...AT.poste, walk: 0.8, arms: 0, perche: 0, cutaway: 0.4, mesh: 0.25, l02: L02_AT.gravier, fx: 300, fy: 0, fz: 1000, fs: 500 });
  shot(gAt, t.end - 0.12 - gAt, { ...VIEW.gravel, d: 380, az: -26 }, "sine.inOut");
  now(t.propre, { fils: 4 });
}
