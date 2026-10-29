// (02 · LA PORTE) — test: back to Tokyo (the L03's c5). « Ce soir, il n'en reste même pas la moitié. » — the flank,
// the shut doors signal · « À l'arrière, une seule porte. » — the 4L opens, its slide drops · « Et à droite, un moteur
// tourne encore… » — the right engine spins up — and the picture shuts to black (D.cliff, « Réponse · sur YouTube »):
// who goes out by that door, the long tells it.
import { SET, AT, VIEW, SHARP, L03_AT } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut ON a frame

export default function acte3({ D }) {
  const { st, now, shot, cut, punch } = D;
  const t = D.times({
    test: "test", moitie: "test:moitié", arriere: "test:arrière", seule: "test:seule", droite: "test:droite",
    tourne: "test:tourne", noir: "noir", comment: "comment",
  });

  /* « Ce soir, il n'en reste même pas la moitié. » — the flank at Haneda, the doors on the fire */
  const tT = F(t.test - 0.12);
  const FL = { ...VIEW.flank, tx: -200, d: 2300 };
  cut(tT, SET.PISTE, FL, { ...AT.haneda, fire: 1, smoke: 0.9, shut: 0, doorA: 1, pax: 1, spin: 0, fx: 600, fy: 450, fz: 0, fs: 3000 }, { fade: 0.15 });
  now(tT, { l03: L03_AT.quatre });
  st(t.moitie - 0.05, 0.5, { shut: 1 }, "power2.out");
  shot(tT, F(t.arriere - 0.12) - tT, { ...FL, tx: 400, d: 2100 }, "sine.inOut");

  /* « À l'arrière, une seule porte. » — the 4L opens, its slide drops, a veille ring around it */
  const t4 = F(t.arriere - 0.12);
  const D4 = { ...VIEW.door4L };
  cut(t4, SET.PISTE, D4, { ...AT.haneda, fire: 1, smoke: 1, doorA: 1, shut: 1, pax: 1, spin: 0, doorB: 0, fx: D4.tx, fy: 430, fz: 400, fs: 1500 }, { fade: 0.15 });
  st(t.seule, 1.2, { doorB: 1 }, "power2.out");
  now(t.seule, { mark: 7 });
  shot(t4, F(t.droite - 0.12) - t4, { ...D4, d: 1450, el: 5 }, "sine.inOut");

  /* « Et à droite, un moteur tourne encore… » — the right engine; it spins up on « tourne »; black on the breath */
  const tE = F(t.droite - 0.12);
  const ENG = { ...VIEW.engine };
  cut(tE, SET.PISTE, ENG, { mark: 0, spin: 0.3, fx: -1300, fy: 330, fz: -1040, fs: 1200 });
  now(tE, { l03: L03_AT.moteur });
  st(t.tourne - 0.1, 0.6, { spin: 1 }, "power2.out");
  punch(t.tourne, 0.05);
  const black = D.breath("noir");
  shot(tE, black + 0.5 - tE, { ...ENG, d: 980, az: -126 }, "sine.inOut");

  D.cliff(black, { dur: 0.5, stamp: "Réponse · sur YouTube" });
}
