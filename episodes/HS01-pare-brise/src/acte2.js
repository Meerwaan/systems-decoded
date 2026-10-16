// 02 · L'USINE — lancement → bande (11,2 → 29,2 s). See docs/HS01-actes.md (acte2) for the plan.
// One flight down the line, upstream, against the flow: the finished windshield → the whole line in depth → the orange
// river at the furnace's lip → riding the ribbon down to its edge on the dark mirror → the bench, the black band.
// LA règle: nothing is paid — no word "étain" on screen, the band shown, never explained, the stamp never in frame.
// Poses seen on boards (look, 22 images): see the comments on each.
import { setAct } from "@kit/overlay.js";
import { SET, AT, L01_AT, onLine, run } from "./world.js";

/** A portrait pose (complete: nothing inherited). */
const P = { fov: 30, shift: 120, side: 0, roll: 0, drift: 0.3 };
const line = (x, o) => onLine(x, { ...P, ...o });

// the finished windshield at the inspection station, three quarters, its shape and its green film readable (seen)
const WS = line(10300, { ty: 100, d: 380, az: -70, el: 28 });
const WS_IN = { ...WS, d: 340, az: -66, el: 36 }; // rises before the whip: the camera leaves above the machines
// the whole line in depth: the orange river near (bottom), the windshields far (top) — seen
const WIDE = line(4500, { ty: 100, d: 8000, az: -75, el: 24 });
// diving upstream onto the bath and the furnace: an orange field in its glass hood (seen)
const AMONT = line(1500, { ty: 100, d: 3000, az: -78, el: 22 });
// the lip: the orange tongue pouring over it and spreading (seen, strong)
const THROAT = line(1030, { ty: 100, d: 520, az: -40, el: 16 });
const THROAT_IN = line(1080, { ty: 98, d: 420, az: -28, el: 14 });
// the ribbon, raking, filling the frame, an edge roll above (seen)
const RIBBON = line(1450, { ty: 92, tz: 130, d: 420, az: 10, el: 10 });
// its edge, level with the bath: the orange slab on the dark mirror below, nothing written (seen)
const EDGE = line(1650, { ty: 90, tz: 190, d: 260, az: 4, el: 3 }); // (az −8 showed a white strip on the mirror)
// the bench: the windshield's corner (NOT the stamp's), the band and its dots on a diagonal edge — seen
const BAND = { ...P, tx: -58, ty: 30, tz: 16, d: 120, az: 45, el: 10 };
const BAND_IN = { ...BAND, d: 104, az: 36, el: 8 };

export default function acte2({ D }) {
  const { tl, now, st, shot, cut } = D;
  const t = D.times({
    lancement: "lancement", cette: "lancement:cette", pres: "lancement:près",
    four: "four", riviere: "four:rivière", fourEnd: "four$",
    flotte: "flotte", pas: "flotte:pas",
    bande: "bande", noire: "bande:noire", deco: "bande:déco",
    flacon: "flacon",
  });
  const from = t.lancement - 0.15;
  const to = t.flacon - 0.15;
  setAct(tl, 2, from);
  run(D, from, to);

  /* ── lancement: shape cut (the side window → a finished windshield, same place), then the whip back ── */
  cut(from, SET.LINE, WS, {
    ...AT.line, pos: 10300, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, queue: 1,
    fx: 10300, fy: 100, fz: 0, fs: 600,
  });
  now(from, { l01: L01_AT.lancement });
  shot(from + 0.04, t.cette - 0.25 - (from + 0.04), WS_IN);
  // "Cette fois, on a suivi ton pare-brise dans l'usine": the whip back until the whole line shows, in depth
  const whip = t.cette - 0.2;
  shot(whip, 1.7, WIDE, "power2.inOut", WS_IN.d);
  st(whip, 1.7, { fx: 5000, fy: 90, fs: 7000 });
  // what the whip brushes past is INVISIBLE, not just dim (qa: a parasite frame at 14,43 s in the machines of glass)
  st(whip - 0.3, 0.3, { line: 0 }, "power1.in");
  st(whip + 1.0, 0.7, { line: 1 }, "sine.inOut");
  // "Près de neuf minutes": the flight upstream starts — a dive onto the orange
  const go = t.pres - 0.1;
  shot(go, t.four + 0.2 - go, AMONT, "sine.inOut", WIDE.d);
  st(go, t.four - go, { fx: 1300, fy: 95, fs: 1600 });

  /* ── four: the end of the flight, at the lip — the river ── */
  now(t.four, { l01: L01_AT.four });
  shot(t.four + 0.2, t.riviere - 0.1 - (t.four + 0.2), THROAT, "sine.inOut", AMONT.d);
  st(t.four, t.riviere - t.four, { fx: 1100, fy: 95, fs: 700 });
  now(t.riviere, { l01: L01_AT.fusion });
  shot(t.riviere - 0.1, t.fourEnd + 0.1 - (t.riviere - 0.1), THROAT_IN);

  /* ── flotte: we follow the tongue downstream, onto the ribbon, then down to its edge on the dark mirror ── */
  const fl = t.fourEnd + 0.1;
  shot(fl, t.pas - 0.2 - fl, RIBBON);
  st(fl, t.pas - fl, { fx: 1450, fy: 90, fs: 800 });
  now(t.flotte, { l01: L01_AT.flotte });
  now(t.pas, { fils: 2, l01: L01_AT.ruban });
  shot(t.pas - 0.2, t.bande - 0.15 - (t.pas - 0.2), EDGE);
  st(t.pas - 0.2, 1.2, { fx: 1650, fz: 150, fs: 600 });

  /* ── bande: shape cut (the ribbon's edge → the windshield's edge, a diagonal), the band in close-up ── */
  const b0 = t.bande - 0.15;
  cut(b0, SET.BENCH, BAND, { ...AT.bench, litBand: 0 });
  now(b0, { l01: L01_AT.bande });
  st(t.noire - 0.1, 0.5, { litBand: 1 }, "power2.out");
  shot(b0 + 0.04, to - (b0 + 0.04), BAND_IN);
  now(t.deco, { fils: 3 });
}
