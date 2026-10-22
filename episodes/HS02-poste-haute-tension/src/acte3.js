// (02 · LE POSTE) — sanscouper → test (32,3 → 48,8 s).
//   sanscouper  the line at dusk, live: the basket on the conductors, its sling out of the top of the frame — the
//               helicopter is never in frame. « Mais toi… tu coupes »: your breaker pole, your line goes dark
//   detecteur   you, the pole up; its head on the conductor, its lamps off, the neighbour burning behind
//   test        you climb; the neighbour's strings; far away, on the neighbour, the fault — BLACK on « court-circuit »
import { SET, AT, VIEW, L02_AT, BREAKER, PH } from "./world.js";

export default function acte3({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    sans: "sanscouper", courant: "sanscouper:courant", mais: "sanscouper:Mais", coupes: "sanscouper:coupes",
    det: "detecteur", detecteur: "detecteur:détecteur", reagit: "detecteur:réagit", mort: "detecteur:mort", crois: "detecteur:crois",
    test: "test", voisine: "test:voisine", km: "test:kilomètres", court: "test:court", noir: "noir",
  });

  /* sanscouper — the basket on a live line at dusk */
  const sAt = t.sans - 0.12;
  cut(sAt, SET.LIGNE, VIEW.basket, { ...AT.ligne, day: 1, heli: 1, fly: 60000, basket: 1, spacer: 0.75, l02: L02_AT.sanscouper, fx: 60000, fy: 3700, fz: 880, fs: 900 });
  shot(sAt, t.mais - 0.12 - sAt, { ...VIEW.basket, d: 470, az: -34 }, "sine.inOut");
  now(t.courant, { fils: 5 });
  // « Mais toi, aujourd'hui, tu coupes »: your breaker pole, your line still live — it goes dark on « coupes »
  const pAt = t.mais - 0.12;
  cut(pAt, SET.POSTE, VIEW.pole, { ...AT.poste, live: 1, you: 0, l02: L02_AT.coupe, fx: BREAKER.x, fy: 750, fz: PH[0], fs: 900 });
  shot(pAt, t.det - 0.12 - pAt, { ...VIEW.pole, d: 560, az: -30 }, "sine.inOut");
  st(t.coupes, 0.5, { live: 0 }, "power2.in");

  /* detecteur — you, the pole up; then its mute head */
  const dAt = t.det - 0.12;
  const CONS = { ...AT.poste, open: 1, sopen: 1, lock: 1, sign: 1, perche: 1, arms: 1, probe: 0, tool: 0, walk: 0.8 };
  cut(dAt, SET.POSTE, VIEW.youVat, { ...CONS, l02: L02_AT.detecteur, fx: 320, fy: 500, fz: 960, fs: 1300 });
  shot(dAt, t.detecteur - 0.2 - dAt, { ...VIEW.youVat, d: 500, az: 18 }, "sine.inOut");
  // « Ton détecteur »: a CUT up the pole to its head (the move along the pole near the lens: parasite frames, qa 52,8)
  const hAt = t.detecteur - 0.1;
  cut(hAt, null, { ...VIEW.mute, d: 230, az: 26 }, { fx: 300, fy: 1046, fz: 0, fs: 700 });
  shot(hAt, t.reagit + 0.3 - hAt, VIEW.mute, "sine.inOut");
  now(t.mort, { l02: L02_AT.mort });
  shot(t.reagit + 0.3, t.test - 0.12 - (t.reagit + 0.3), { ...VIEW.mute, d: 150, az: 17 }, "sine.inOut");
  now(t.crois, { fils: 6 });

  /* test — you climb; the neighbour; far away, the fault — black */
  const cAt = t.test - 0.12;
  cut(cAt, SET.POSTE, VIEW.climbLow, { ...CONS, perche: 0, arms: 0, walk: 1, climb: 0.4, l02: L02_AT.test, fx: 0, fy: 900, fz: 1130, fs: 1600 });
  st(cAt, t.voisine - 0.15 - cAt, { climb: 0.7 }, "sine.inOut");
  shot(cAt, t.voisine - 0.15 - cAt, VIEW.climbMid, "sine.inOut");
  // « sa voisine »: a CUT to the hook's lines, wider (a pan through the gantry passed black frames): your grey
  // conductor, the neighbour's three signal lines burning
  const nAt = t.voisine - 0.15;
  cut(nAt, null, VIEW.neigh, { climb: 1, fx: 300, fy: 1046, fz: 0, fs: 1500 });
  shot(nAt, t.km - 0.12 - nAt, { ...VIEW.neigh, d: 540, az: 24 }, "sine.inOut");
  // « à des kilomètres… » — the line in the country, the neighbour's string; « court-circuit »: the arc, then black
  const kAt = t.km - 0.12;
  cut(kAt, SET.LIGNE, VIEW.fault, { ...AT.ligne, live: 0, voisine: 1, defect: 0.35, l02: L02_AT.orage, fx: 200000, fy: 3400, fz: -800, fs: 4000 });
  shot(kAt, t.noir - kAt, { ...VIEW.fault, d: 1900, az: 66 }, "sine.inOut");
  st(t.court - 0.05, 0.15, { defect: 1 }, "power2.out");
  now(t.court, { fils: 7 });
  tl.set("#black", { opacity: 1 }, t.noir);
}
