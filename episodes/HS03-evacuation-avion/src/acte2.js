// 02 · LA PORTE — ouvre → regle. « Alors… on l'ouvre. » opens FOR REAL (the L03's c1 → c2): the pack on the bench,
// at the same place of the picture as in the door (benchFromCabin), opens ON « on »; then the piece the promo pays —
// the bottle does not inflate the slide alone: its gas through the aspirators makes a void, a flap opens, the outside
// air rushes in, and the slide swells by SWALLOWING THE AIR (outside, the veille wisps on « avalant ») — then the
// line that tightens again (a debris reopens a flap: it deflates), and the rule (the trial hangar: 90 s, half the doors).
import { setAct } from "@kit/overlay.js";
import { SET, AT, VIEW, CLOSE, SHARP, ITEM, L03_AT, benchLight, benchFromCabin, PACK_IN_DOOR, P } from "./world.js";
import { BUSTLE_END } from "./acte1.js";

const F = (t) => Math.round(t * 30) / 30; // a cut ON a frame

export default function acte2({ D }) {
  const { st, now, shot, cut, punch } = D;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", on: "explode",
    eclate: "eclate", toboggan: "eclate:toboggan", bouteille: "eclate:bouteille", mais: "eclate:mais", toute: "eclate:toute",
    jet: "jet", file: "jet:file", vide: "jet:vide", clapet: "jet:clapet", dehors: "jet:dehors",
    aspire: "aspire", gonfle: "aspire:gonfle", avalant: "aspire:avalant",
    fuite: "fuite", debris: "fuite:débris", degonfler: "fuite:dégonfler",
    regle: "regle", voler: "regle:voler", secondes: "regle:secondes", moitie: "regle:moitié", test: "test",
  });
  setAct(D.tl, 2, t.ouvre);
  const RIG = { ...AT.bench, ...benchLight(ITEM.PACK), explode: 2, gas: 1 }; // the working rig on the bench
  const ASPL = { fx: -23, fy: 80, fz: 0, fs: 60 }; //                           the light on the aspirator

  /* « Alors… on l'ouvre. » — the same pack at the same place, on the bench; it opens ON « on » */
  cut(t.tobench, SET.BENCH, benchFromCabin(BUSTLE_END, PACK_IN_DOOR), { ...AT.bench, ...benchLight(ITEM.PACK), explode: 0, named: 0 });
  now(t.tobench, { l03: L03_AT.ouvre });
  const OPEN = { ...VIEW.exploded };
  st(t.on, 2.8, { explode: 1, fy: 50 }, "sine.inOut"); // a soft start: the lid swung through its bright angle in two frames (qa, 21,3 s)
  shot(t.on, F(t.mais - 0.12) - t.on, OPEN, "sine.inOut", BUSTLE_END.d);

  /* « Un toboggan, et sa bouteille de gaz. » — each part lit on its word */
  now(t.toboggan, { named: 1, l03: L03_AT.eclate });
  now(t.bouteille, { named: 2 });

  /* « Mais ce n'est pas elle qui le gonfle. Pas toute seule. » — the rig: the bottle opens, the tube hardly moves */
  const tRig = F(t.mais - 0.12);
  const RIGP = { ...VIEW.rig };
  cut(tRig, SET.BENCH, RIGP, { ...RIG, gas: 0, tube: 0, named: 2, fx: 20, fy: 40, fz: 0, fs: 120 }, { fade: 0.2 });
  now(tRig, { l03: L03_AT.bouteille });
  st(tRig + 0.1, 0.9, { gas: 1 }, "power1.out");
  st(t.toute - 0.1, 0.6, { tube: 0.12 }, "sine.inOut");
  shot(tRig, F(t.jet - 0.12) - tRig, { ...RIGP, d: 290, az: -24 }, "sine.inOut");

  /* « Son gaz file dans ces bouches. Ce jet crée un vide… un clapet s'ouvre, et l'air du dehors s'engouffre. » */
  const tAsp = F(t.jet - 0.12);
  const ASP = { ...VIEW.asp };
  cut(tAsp, SET.BENCH, { ...ASP, d: 82 }, { ...RIG, ...ASPL, see: 1, tube: 0.12, named: 3 }, { fade: 0.2 });
  now(tAsp, { l03: L03_AT.jet });
  shot(tAsp, F(t.aspire - 0.12) - tAsp, { ...ASP, d: 66, az: -2 }, "sine.inOut");
  st(t.file, 0.8, { jet: 0.6 });
  st(t.vide, 0.5, { jet: 1 });
  punch(t.vide, 0.06);
  st(t.clapet, 0.4, { valve: 1 }, "power2.out");
  now(t.clapet, { named: 5 });
  st(t.dehors, 0.9, { air: 1 });

  /* « Ton toboggan se gonfle… » — the tube rounds behind the aspirator; « …en avalant l'air. » — outside, the slide
     of 1L swells and swallows the night's air (the veille wisps): the piece is paid */
  const tTube = F(t.aspire - 0.12);
  const TUBE = { ...VIEW.tube };
  cut(tTube, SET.BENCH, TUBE, { ...RIG, see: 1, jet: 1, valve: 1, air: 1, tube: 0.2, named: 0, fx: -10, fy: 60, fz: 0, fs: 100 });
  now(tTube, { l03: L03_AT.aspire });
  st(tTube, F(t.avalant - 0.12) - tTube - 0.05, { tube: 0.9 }, "sine.inOut");
  shot(tTube, F(t.avalant - 0.12) - tTube, { ...TUBE, d: 250 }, "sine.inOut");
  const tOut = F(t.avalant - 0.12);
  const SL = { ...VIEW.slide1L };
  cut(tOut, SET.PISTE, SL, { ...AT.apron, doorA: 0.45, fx: SL.tx, fy: 300, fz: 600, fs: 1500 }, { fade: 0.15 });
  st(tOut + 0.05, 1.3, { doorA: 0.95 }, "power2.out");
  st(t.avalant, 0.35, { gulp: 1 }, "sine.out");
  st(F(t.fuite - 0.12) - 0.45, 0.35, { gulp: 0 }, "sine.in");
  shot(tOut, F(t.fuite - 0.12) - tOut, { ...SL, d: 1180 }, "sine.out");

  /* « Mais qu'un débris rouvre un clapet… et il peut se dégonfler. » — the flap propped open, the air streams out */
  const tClap = F(t.fuite - 0.12);
  const CLAP = { ...VIEW.leak };
  cut(tClap, SET.BENCH, CLAP, { ...RIG, ...ASPL, see: 1, tube: 1, named: 5 }, { fade: 0.15 });
  now(tClap, { l03: L03_AT.fuite });
  st(t.debris, 0.6, { leak: 1 });
  now(t.debris, { named: 0, mood: 1 });
  shot(tClap, F(t.degonfler - 0.25) - tClap, { ...CLAP, d: 72, az: 0 }, "sine.inOut");
  const tSag = F(t.degonfler - 0.25);
  shot(tSag, F(t.regle - 0.12) - tSag, { ...VIEW.tube, d: 240 }, "sine.inOut", CLAP.d);
  st(tSag, 1.2, { fx: 0, fy: 50, fs: 100 });
  st(t.degonfler - 0.1, 0.65, { tube: 0.65 });

  /* « Pour avoir le droit de voler… on le vide en 90 secondes. Par la moitié de ses portes. » — the trial hangar */
  const tHang = F(t.regle - 0.12);
  const HS = { ...VIEW.hangarSlide };
  cut(tHang, SET.PISTE, HS, { ...AT.hangar, lights: 1, doorA: 0, shut: 0, fx: -2700, fy: 250, fz: 800, fs: 1200 }, { fade: 0.2 });
  now(tHang, { l03: L03_AT.essai });
  st(t.voler + 0.2, 1.4, { doorA: 1 }, "power2.out");
  st(t.secondes, 0.3, { lights: 0 }, "power2.out");
  st(t.moitie, 0.5, { shut: 1 }, "power2.out");
  shot(tHang, F(t.test - 0.12) - tHang, { ...HS, d: 1550, az: -20 }, "sine.inOut");
}
