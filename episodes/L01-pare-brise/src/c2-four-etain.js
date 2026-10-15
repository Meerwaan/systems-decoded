// Chapters 2 · Le four and 3 · Le bain d'étain — beats four → lames (docs/L01-actes.md · c2).
// The glass is born hot: everything here is signal on dark. The orange ribbon on the tin is the film's showpiece:
// the melt that pours over the lip, the tongue that spreads and goes flat, the camera that rides along it.
// Every instant is read off the script; the camera never stops (a new picture every 5–10 s).
import { fact } from "@kit/long.js";
import { SET, AT, onLine, span, run } from "./world.js";

// THE WHITE PLATE: a flat hot glass mirrors the studio's cool strip (stage.js · studioEnvironment, [8, 3, -7]) as a
// white rectangle whenever the camera looks toward +x/−z (az ≈ −30 … −70 at low elevation). Every pose over the
// ribbon here keeps away from it: az ≥ −15 (or ≈ −80 and beyond, looking straight down the line). And the
// photographer's strip (verre.js · envView) shows as a white band on the flat ribbon at el ≈ 22–32: avoided too.
export default function ({ D }) {
  const [from, to] = span(D, "four", "etenderie");
  run(D, from, to);
  const t = (ref) => D.at(ref);
  const { st, now, shot, cut } = D;

  /* ── 02 · LE FOUR ─────────────────────────────────────────────────────────────────────────────────────── */
  // Under the card: low over the empty platform, seen from upstream; the whip slides sideways onto the heaps.
  const heaps0 = onLine(-560, { ty: 66, d: 540, az: -58, el: 11, side: -150 });
  cut(from, SET.LINE, onLine(-930, { ty: 62, d: 380, az: -108, el: 5, side: -200 }), {
    ...AT.line, step: 1, temp: 20, tempOn: 0, pos: 5000, batch: 0, charge: 0, melt: 0.6,
    fx: -450, fy: 60, fz: 0, fs: 520,
  });
  shot(from + 0.04, 0.85, heaps0, "expo.out");
  // the heaps, one per word, the furnace glowing at the end of the row; a slow lateral travel along them
  shot(from + 0.9, t("calcin:calcin") - (from + 0.9), onLine(-360, { ty: 70, d: 560, az: -66, el: 12, side: -150 }));
  st(t("four:sable") - 0.1, 0.5, { batch: 1 }, "power2.out");
  st(t("four:soude") - 0.1, 0.5, { batch: 2 }, "power2.out");
  st(t("four:calcaire") - 0.1, 0.5, { batch: 3 }, "power2.out");
  st(t("four:dolomie") - 0.1, 0.5, { batch: 4 }, "power2.out");
  st(t("calcin:calcin") - 0.1, 0.5, { batch: 5 }, "power2.out");

  // "Tout tombe": the camera rises with the fall, looking up at the hopper (contre-plongée)…
  const tombe = t("calcin:tombe");
  shot(t("calcin:calcin") + 0.3, tombe + 0.5 - (t("calcin:calcin") + 0.3), onLine(-60, { ty: 330, d: 820, az: -34, el: -4, side: -160 }));
  st(tombe, t("calcin$") + 0.3 - tombe, { charge: 1 }, "power1.in");
  st(tombe - 0.4, 2.2, { fx: 400, fy: 130, fs: 900 });
  // …"1 500 °C": the header turns signal, the vault flares, and the camera tips over into the furnace
  const c1500 = t("calcin:1500");
  now(c1500, { temp: 1500, tempOn: 1 });
  st(c1500, 0.8, { melt: 1 }, "power2.out");
  shot(c1500 + 0.05, t("fusion:four") - c1500, onLine(500, { ty: 150, d: 1100, az: -24, el: 22, side: -150 }));

  // "1 200 tonnes": a slow dolly along the vault, over the paste…
  shot(t("fusion:four"), t("fusion:pâte") - t("fusion:four"), onLine(760, { ty: 140, d: 900, az: -19, el: 26, side: -150 }));
  fact(D.tl, { id: "c2-tonnes", k: "Dans un seul four", v: "Plus de 1 200 T", s: "de verre en fusion", tone: "signal", from: t("fusion:1200"), to: t("fusion:orange") - 0.08 });
  // …"qui ne s'arrête jamais de couler": downstream to the throat, the tongue pouring over the lip
  shot(t("fusion:pâte") - 0.2, t("fusion$") - t("fusion:pâte"), onLine(1030, { ty: 100, d: 600, az: -6, el: 18, side: -150 }));

  // "parfaitement plate": down to a raking glide over the tongue as it leaves the throat (the light slides on it)
  shot(t("plat") + 0.1, t("plat:plate") - t("plat"), onLine(1250, { ty: 94, d: 820, az: 16, el: 10, side: -120 }));
  // "on coulait… on le polissait": along its edge, at the level of the glass
  shot(t("plat:pendant"), t("plat:polissait") - t("plat:pendant"), onLine(1480, { ty: 92, tz: 120, d: 600, az: 4, el: 4, side: -150 }));
  // "Des deux côtés": an S — down to the edge (its thickness, side on), then up over the top face
  shot(t("plat:polissait") + 0.1, 0.9, onLine(1560, { ty: 90, tz: 170, d: 450, az: -6, el: 1, side: -120 }));
  shot(t("plat:des") - 0.15, t("etain") - 0.9 - (t("plat:des") - 0.15), onLine(1650, { ty: 90, tz: 0, d: 1100, az: -14, el: 42, side: -120 }));

  /* ── 03 · LE BAIN D'ÉTAIN ─────────────────────────────────────────────────────────────────────────────── */
  const e0 = t("etain") - 0.9; // the card
  cut(e0, SET.LINE, onLine(1250, { ty: 90, d: 2700, az: -78, el: 60, side: -100 }), {
    ...AT.line, step: 2, temp: 1100, tempOn: 1, pos: 5000, batch: 5, charge: 1, melt: 1,
    fx: 1800, fy: 90, fz: 0, fs: 1000,
  });
  // the whip, diving onto the whole bath: the ribbon, its edge rolls, the glass hood
  const bathWide = onLine(1700, { ty: 90, d: 2300, az: 28, el: 30, side: -120 });
  shot(e0 + 0.04, 0.85, bathWide, "expo.out");
  // 1952 … "verser le verre": a slow descent toward the lip where the tongue drops onto the tin
  shot(e0 + 0.95, t("etain:verser") - (e0 + 0.95), onLine(1080, { ty: 98, d: 850, az: 24, el: 18, side: -150 }));
  fact(D.tl, { id: "c2-1952", k: "L'idée", v: "1952", s: "Alastair Pilkington", from: t("etain:alastair") - 0.3, to: t("etain:verser") - 0.05 });
  // "sur du métal liquide": down to the level of the tin's mirror, the ribbon on it
  const ras = onLine(1500, { ty: 92, tz: 130, d: 700, az: 12, el: 12, side: -160 });
  shot(t("etain:métal") - 0.45, 1.8, ras);
  // "des années d'essais … 1960": a slow lateral travel along the ribbon, held by the edge rolls, past the hood
  shot(t("essais") - 0.2, t("essais$") - t("essais") + 0.2, onLine(2480, { ty: 92, tz: 130, d: 760, az: 4, el: 11, side: -160 }));
  fact(D.tl, { id: "c2-1960", k: "Le procédé", v: "1960", s: "enfin rentable", from: t("essais:1960"), to: t("flotte") - 0.2 });

  // "Alors le verre flotte": cut to the profile, level with the tin — the ribbon lying on its mirror
  const fl = t("flotte:alors") - 0.2;
  cut(fl, SET.LINE, onLine(1490, { ty: 90, tz: 180, d: 330, az: -14, el: 4, side: -120 }), {
    ...AT.line, step: 2, temp: 1100, tempOn: 1, pos: 5000, batch: 5, charge: 1, melt: 1,
    fx: 1500, fy: 90, fz: 0, fs: 800,
  });
  shot(fl + 0.02, t("flotte:s'étale") - fl, onLine(1490, { ty: 90, tz: 180, d: 260, az: -4, el: 3, side: -120 }));
  // "Il s'étale": up and back toward the throat, the tongue widening
  shot(t("flotte:s'étale") - 0.1, t("flotte:plane") - t("flotte:s'étale"), onLine(1180, { ty: 95, d: 900, az: 20, el: 34, side: -120 }));
  // "plane… sans que personne n'y touche": a low raking glide across the whole width, no machine in it
  shot(t("flotte:plane") - 0.15, t("pourquoi") - t("flotte:plane"), onLine(1450, { ty: 94, d: 1000, az: 64, el: 10, side: -100 }));

  // "toute la plage": one long travel from one end of the bath to the other, the ribbon going from bright to dark red
  shot(t("pourquoi") + 0.1, t("pourquoi:bout") - 0.2 - (t("pourquoi") + 0.1), onLine(2550, { ty: 95, d: 900, az: 18, el: 16, side: -100 }));
  st(t("pourquoi"), t("pourquoi:bout") - t("pourquoi"), { fx: 2400 });
  // "il ne bout pas": a slow push onto the calm tin at the exit
  shot(t("pourquoi:bout") - 0.2, t("ruban") - t("pourquoi:bout"), onLine(2460, { ty: 92, tz: 120, d: 820, az: 8, el: 14, side: -100 }));

  // "trois à quatre mètres": across, from above, the ribbon running away from us — then back to its entry…
  const rb = t("ruban") - 0.15;
  cut(rb, SET.LINE, onLine(1700, { ty: 90, d: 1120, az: -80, el: 32, side: -40 }), {
    ...AT.line, step: 2, temp: 1100, tempOn: 1, pos: 5000, batch: 5, charge: 1, melt: 1,
    fx: 1700, fy: 90, fz: 0, fs: 1000,
  });
  shot(rb + 0.02, t("ruban:entre") - rb, onLine(1320, { ty: 90, d: 1000, az: -80, el: 30, side: -40 }));
  fact(D.tl, { id: "c2-large", k: "Le ruban", v: "3 à 4 m", s: "de large", from: t("ruban:trois"), to: t("ruban:entre") - 0.05 });
  // …"entre vers 1 100 … ressort vers 600 … rouler": the camera rides it to the exit, the header falling with it
  shot(t("ruban:entre"), t("ruban:rouler") + 0.2 - t("ruban:entre"), onLine(2780, { ty: 92, d: 1000, az: -86, el: 37, side: -40 }));
  st(t("ruban:1100"), t("ruban:600") + 0.2 - t("ruban:1100"), { temp: 600 }, "sine.inOut");
  st(t("ruban:entre"), t("ruban:rouler") - t("ruban:entre"), { fx: 2700, fs: 800 });

  // "Au-dessus, un gaz…": up into the hood, its pale breath over the tin
  const az0 = t("azote") - 0.3;
  shot(az0, t("azote:l'épaisseur") - az0, onLine(2250, { ty: 200, d: 1100, az: 20, el: 42, side: -100 }));
  // "l'épaisseur ? C'est la vitesse": down to the edge, in profile, level with the tin — the edge rolls grip it and
  // spin faster as it is drawn thinner (`pull`), then slow again ("…à deux centimètres et demi")
  const ep = t("azote:l'épaisseur") - 0.15;
  shot(ep, t("azote:vitesse") - ep, onLine(2050, { ty: 90, tz: 180, d: 330, az: -12, el: 3, side: -120 }));
  shot(t("azote:vitesse"), t("lignes") - t("azote:vitesse"), onLine(2080, { ty: 90, tz: 180, d: 270, az: -2, el: 3, side: -120 }));
  st(ep, 1.2, { fx: 2050, fz: 150, fs: 500 });
  st(t("azote:vitesse"), t("azote:fin") + 0.15 - t("azote:vitesse"), { pull: 1 }, "sine.inOut");
  st(t("azote:demi-millimètre") + 0.8, t("azote:centimètres") + 0.5 - (t("azote:demi-millimètre") + 0.8), { pull: 0 }, "sine.inOut");
  fact(D.tl, { id: "c2-epais", k: "Épaisseur", v: "0,5 mm → 2,5 cm", s: "selon la vitesse", from: t("azote:demi-millimètre") - 0.3, to: t("lignes") - 0.1 });

  // "le verre flotté … 370 lignes": a long pull-back from the section until furnace, bath and lehr show at once
  const wide = onLine(2500, { ty: 90, d: 7200, az: -10, el: 24, side: 0 });
  shot(t("lignes") - 0.05, t("lignes:monde") - t("lignes") + 0.2, wide, "sine.inOut", 270);
  st(t("lignes"), 3, { fx: 2500, fz: 0, fs: 2600 });
  fact(D.tl, { id: "c2-lignes", k: "Dans le monde", v: "≈ 370 lignes", s: "de verre flotté", from: t("lignes:370"), to: t("lames") - 0.1 });

  // "ne protège encore de rien. S'il casse… des lames": a dive to the cut end, the plain sheet bursts into blades
  // that fall back onto the rollers; through the ad break the camera keeps circling them
  const lm = t("lames") - 0.25;
  now(lm, { plain: 1 });
  st(lm, t("lames:casse") - lm, { temp: 20 }, "sine.inOut"); // over the lehr: 600 → the air of the hall
  shot(lm, t("lames:casse") - 0.2 - lm, onLine(5120, { ty: 100, d: 420, az: -22, el: 30, side: -160 }), "sine.inOut", 7200);
  st(lm, 2.4, { fx: 5120, fy: 100, fz: 0, fs: 420 });
  const casse = t("lames:casse");
  st(casse - 0.05, 0.3, { blades: 0.12 }, "power2.out");
  st(casse + 0.35, t("lames$") + 0.5 - (casse + 0.35), { blades: 1 }, "power1.out");
  shot(casse - 0.2, to - (casse - 0.2), onLine(5120, { ty: 98, d: 380, az: -4, el: 34, side: -160 }));
}
