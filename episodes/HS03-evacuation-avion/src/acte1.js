// 01 · MENACE — accroche → scene (0 → « Alors… »), at Haneda and in the cabin of the A350 that burns (the L03's c1).
//   A  POSE0 / FIRST: low by the nose, slide 1L unrolling IN FRONT OF the fire — it moves by its subject from frame 1
//   B  « Cinq portes sur huit restent fermées » — a cut onto the flank over the wing: the doors turn signal
//   C  « Il en reste trois… pour 379 personnes » — inside, the people seated, the aisle to the door
//   D  « Presque personne ne prend son sac. Et toi… » — your bag in your hand (the third thumbnail of the long)
//   E  « Les haut-parleurs se taisent » — a PA grille dies · « La fumée descend du plafond » — the smoke rolls down
//   F  « Devant, une porte s'ouvre… » — outside, door 1L swings out · « …dans cette porte, plié serré, dort… » — the
//      bustle from inside, a slow push: acte2 cuts to the bench ON the same pack (benchFromCabin)
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, AT, VIEW, POSE0, CLOSE, SHARP, L03_AT } from "./world.js";

export const BUSTLE_END = { ...VIEW.bustle, d: 320 }; // farther: the folded pleats filling the frame flickered (qa, 21,3 s) // the last pose of the act: acte2 raccords on it

const F = (t) => Math.round(t * 30) / 30; // a cut ON a frame

export default function acte1({ D }) {
  const { st, now, shot, cut, punch } = D;
  const t = D.times({
    brule: "accroche:brûle", cinq: "accroche:cinq", fermees: "accroche:fermées", promesse: "promesse",
    trois: "promesse:trois", pour: "promesse:pour", curio: "curiosite", sac: "curiosite:sac", toi: "curiosite:toi",
    scene: "scene", taisent: "scene:taisent", fumee: "scene:fumée", plafond: "scene:plafond", devant: "scene:devant",
    dans: "scene:dans", plie: "scene:plié", sortir: "scene:sortir", tobench: "tobench",
  });
  setAct(D.tl, 1, 0);
  now(0, { l03: L03_AT.accroche });

  /* A → B · one move: the slide unrolls (the subject moves on frame 1), the fire swells on « brûle », then the glide
     turns along the flank and the shut doors turn signal on « fermées » */
  st(0, 1.2, { doorA: 0.88 }, "power3.out"); // front-loaded: the slide drops hardest in the first half-second (qa: 3,4 with power1)
  st(t.brule - 0.06, 0.6, { fire: 1 }, "power2.out");
  const A1 = { ...POSE0, d: 1380, az: -66, el: -5 };
  const tB = F(t.cinq - 0.12);
  shot(0, tB, A1, glide(4, 0.6));
  // a CUT on « Cinq » (the glide that turned 50° onto the flank was the jerkiest move of the draft, 2,3 s)
  const FLANK = { ...VIEW.flank };
  cut(tB, SET.PISTE, FLANK, { fire: 1 });
  shot(tB, F(t.promesse - 0.12) - tB, { ...FLANK, tx: 0, d: 2150 }, "sine.inOut");
  now(tB, { l03: L03_AT.flanc });
  st(t.fermees, 0.5, { shut: 1 }, "power2.out");
  punch(t.fermees, 0.05);

  /* C · « Il en reste trois… pour 379 personnes » — inside: the aisle to the open door, the people seated */
  const tC = F(t.promesse - 0.12);
  const AISLE = { ...VIEW.section };
  cut(tC, SET.CABINE, AISLE, { ...AT.tokyo, cut: 1, smoke: 0.45, fire: 0.7, floor: 1, signs: 1, pa: 1, fx: 600, fy: 95, fz: 0, fs: 800 });
  now(tC, { l03: L03_AT.defi });
  shot(tC, F(t.curio - 0.12) - tC, { ...AISLE, d: 680, el: 3 }, "sine.inOut");
  st(tC, F(t.curio - 0.12) - tC - 0.05, { smoke: 0.8 }, "sine.inOut"); // the smoke comes down over the rows
  st(t.pour, 1.2, { crowd: 0.15 }, "sine.inOut"); //                         « 379 personnes »: they stand up

  /* D · « Presque personne ne prend son sac. Et toi… tu le prends ? » — your bag in your hand */
  const tD = F(t.curio - 0.12);
  cut(tD, SET.CABINE, { ...VIEW.bag, d: 230 }, { ...AT.tokyo, you: 2, bag: 1, smoke: 0.9, floor: 1, fire: 0.6, fx: 742, fy: 60, fz: 110, fs: 250 });
  now(tD, { l03: L03_AT.sac });
  shot(tD, F(t.scene - 0.12) - tD, { ...VIEW.bag, d: 165, az: -88 }, "sine.inOut");
  st(tD, F(t.scene - 0.12) - tD - 0.05, { smoke: 1.1 }, "sine.inOut");
  st(t.toi, 0.6, { bag: 0.94 }, "sine.inOut"); // « Toi… »: the hand hesitates
  st(t.toi + 0.6, 0.8, { bag: 1 }, "sine.inOut");

  /* E · « Les haut-parleurs se taisent. La fumée descend du plafond. » — down the aisle, one move: the speakers die,
     the look rises into the smoke that comes down, the exit signs drown (a lone grille in the dark read as black, 11 s) */
  const tE = F(t.scene - 0.12);
  const CEIL = { ...VIEW.ceil };
  cut(tE, SET.CABINE, CEIL, { ...AT.tokyo, smoke: 0.4, fire: 0.7, floor: 1, pa: 1, signs: 1, pax: 1, fx: 560, fy: 140, fz: 123, fs: 700 });
  now(tE, { l03: L03_AT.haut });
  st(t.taisent, 0.3, { pa: 0 }, "power2.out");
  now(t.fumee, { l03: L03_AT.fumee });
  st(tE + 0.2, F(t.devant - 0.12) - tE - 0.25, { smoke: 0.95 }, "sine.inOut");
  st(t.plafond - 0.1, 0.6, { signs: 0.4 }, "power1.inOut");
  shot(tE, F(t.devant - 0.12) - tE, { ...CEIL, d: 600, el: -10 }, "sine.inOut");

  /* F · « Devant, une porte s'ouvre… » — outside, door 1L swings out over the night */
  const tF = F(t.devant - 0.12);
  const D1L = { ...VIEW.doorOpen };
  cut(tF, SET.CABINE, D1L, { ...AT.tokyo, arm: 1, floor: 1, smoke: 0.8, fire: 0.6, signs: 0.6, door: 0, fx: 0, fy: 60, fz: 240, fs: 300 });
  now(tF, { l03: L03_AT.porte });
  st(t.devant + 0.3, 1.0, { door: 0.35 }, "power2.inOut");
  shot(tF, F(t.dans - 0.12) - tF, { ...D1L, d: 430 }, "sine.inOut");

  /* F' · « …et dans cette porte, plié serré, dort ce qui va te sortir de là. » — the bustle from inside, a slow push */
  const tF2 = F(t.dans - 0.12);
  const DOOR0 = { ...VIEW.doorIn };
  cut(tF2, SET.CABINE, DOOR0, { ...AT.tokyo, arm: 1, floor: 1, smoke: 0.8, fire: 0.6, signs: 0.6, fx: 0, fy: 40, fz: 240, fs: 200 });
  now(tF2, { l03: L03_AT.porte });
  shot(tF2, t.tobench - tF2, BUSTLE_END, "sine.inOut");
}
