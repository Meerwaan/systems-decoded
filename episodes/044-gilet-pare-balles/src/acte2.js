// 02 · AUTOPSIE — `toopen` (18,10) → `tozero` (46,96). Camera paths that never stop, joined by cuts laid just before
// their words (retouche 08/11: « Ton gilet », « des fils », « Et ces fils », « Pourquoi », « À poids égal », `torepos`),
// then the cut `topointe` and one short path into act 3's first pose.
// « Alors… » time stops: the street, him, the vest and the bullet melt into the dark while the front panel slides out
// of its pocket onto the halo, 64 cm to his left — the camera pulls back with it. « …on l'ouvre. » : on « l'ouvre » the
// housse splits (the impact lands as its halves part). Each part the voice names has its gesture: the housse goes off
// and lights; « des dizaines de couches » the 24 pages fan out; « cousues » the seams light; « Chacune : des fils
// croisés » the weave comes up on every layer as the camera dives into the first one; « ces fils… » the heart yarn is
// drawn out of its top edge, the camera following it up: « Kevlar ». The principle on that layer alone, whole, 3/4:
// « touché » a cross, « tire ses voisins » it widens, « des centaines… ensemble » the star — the camera close on the
// point, then pulling back to see the whole layer pull. The strength test beside it: one block each « à poids égal »,
// the second snaps the steel (in the breath), the Kevlar takes five « 5 fois », the broken steel on « l'acier ».
// « Toute la nuit, il attend » : everything folds back, the panel slides home into its pocket, he stands in the quiet
// street (riot low: a calm night; the bench's fog keeps it hushed, time still stopped); « une face vers la rue / vers
// toi » the two arrows, the camera turning round his right flank. Cut `topointe`: the section close, the bullet moves
// again — the tip touches the first layer IN a frame that is already moving, and the path glides into VIEW.zero.
import { setAct } from "@kit/overlay.js";
import { VIEW, SET, LIGHT, STAGED, BENCH, TEST } from "./world.js";

const BX = BENCH.at[0], BZ = BENCH.at[2];
const L0 = BX - 29.9; // x of the first layer once the pages are fanned (EXPLODE.pitch · 11.5)

/* the light: what it stands around */
const L_WIDE = { ...LIGHT.bench, fs: 80 }; //                     the housse and the 24 pages
const L_ONE = { fx: L0, fy: 118, fz: BZ + 2, fs: 45 }; //          the first layer alone, its weave, its heart yarn

export default function acte2({ D, world, co }) {
  const { tl, st, now, path, cut, chip, punch } = D;
  const A = world.gilet.A;
  const t = D.times({
    toopen: "toopen", ouvre: "ouvre", on: "ouvre:on", lOuvre: "ouvre:l'ouvre",
    souple: "eclate:souple", housse: "eclate:housse", dedans: "eclate:dedans", dizaines: "eclate:dizaines",
    cousues: "eclate:cousues", ensemble: "eclate:ensemble", chacune: "eclate:chacune", fils: "eclate:fils",
    croises: "eclate:croisés", serres: "eclate:serrés", ces: "eclate:ces", cest: "eclate:c'est", kevlar: "eclate:kevlar",
    eclateEnd: "eclate$", principe: "principe", tient: "principe:tient", touched: "principe:touché", tire: "principe:tire",
    voisins: "principe:voisins", centaines: "principe:centaines", together: "principe:ensemble", poids: "principe:poids",
    egal: "principe:égal", fois: "principe:fois", acier: "principe:l'acier", principeEnd: "principe$",
    torepos: "torepos", attend: "repos:attend", panneau: "repos:panneau", sens: "repos:sens", rue: "repos:rue",
    toi: "repos:toi", topointe: "topointe", pointe: "repos:pointe", touche: "repos:touche", couche: "repos:couche",
    tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  // the same picture as act 1's last one (VIEW.tip, the tip 4 cm away): this cut only says the whole state
  cut(t.toopen, SET.SCENE, VIEW.tip, { ...STAGED, dist: 4, ...LIGHT.panel });

  /* ───────────── « Alors… » — time stops: everything melts but the panel, which slides out onto the halo ───────────── */
  // (the bullet hangs, frozen, as long as « Alors… » lasts; the panel leaves it in the breath)
  st(t.toopen, 0.5, { mood: 0 }, "sine.inOut");
  st(t.toopen, 0.6, { shell: 0, riot: 0, you: 0, xray: 0, vest: 0 }, "sine.inOut");
  const slide = t.ouvre + 0.32; //                                            the end of « Alors… »
  st(slide, t.on + 0.04 - slide, { out: 1, ...LIGHT.bench }, "sine.inOut");
  st(slide - 0.06, 0.45, { bullet: 0, trail: 0 }, "sine.inOut");
  st(slide - 0.06, 0.6, { section: 0 }, "sine.inOut");
  st(slide, 0.7, { pool: 0.25, grid: 0.16 }, "sine.out");
  now(slide + 0.4, { set: SET.BENCH }); // mid-move: the street, him and the bullet are gone, only the fog changes

  /* ───────────── « …on l'ouvre. » — the housse splits on its word ───────────── */
  st(t.lOuvre - 0.02, t.ouvre + 1.42 - t.lOuvre, { housse: 0.45, explode: 0.1 }, "power2.out"); // lands with the impact (ouvre$+0.06)
  // (retouche 08/11) the breath before « Ton gilet souple »: the halves keep parting, slowly — the shot never sits still
  st(t.ouvre + 1.42, t.souple + 0.03 - (t.ouvre + 1.42), { housse: 0.56 }, "sine.inOut");

  /* ───────────── « Ton gilet souple : d'abord, une housse. » ───────────── */
  st(t.souple + 0.05, 0.3, { housse: 0.62 }, "sine.out"); //                                   (click souple+0.34)
  st(t.housse - 0.04, 0.4, { housse: 1, litHousse: 1, ...L_WIDE }, "power2.out"); //          (click housse+0.38)
  punch(t.housse, 0.06);
  const cHousse = co.add({ title: "Housse", x: 380, y: 520, align: "end", anchor: A.housse });
  cHousse.show(tl, t.housse - 0.4); // (its words are up as the voice says it)
  cHousse.hide(tl, t.dedans + 0.3);

  /* ───────────── « Dedans, des dizaines de couches, cousues ensemble. » ───────────── */
  st(t.dedans, 0.4, { litHousse: 0 }, "sine.inOut");
  st(t.dizaines - 0.25, t.ensemble + 0.42 - (t.dizaines - 0.25), { explode: 1 }, "sine.inOut"); // settles on the click (ensemble+0.46)
  st(t.cousues - 0.08, 0.35, { litSeams: 1 }, "sine.out");
  const cLayers = co.add({ title: "Couches cousues", x: 110, y: 520, align: "start", anchor: A.layers });
  cLayers.show(tl, t.cousues - 0.45);
  cLayers.hide(tl, t.ensemble + 0.36); // (before the dive swings its leader)

  /* ───────────── « Chacune : des fils croisés, serrés. » — the weave on every layer, the dive into the first ───────────── */
  st(t.chacune + 0.1, 0.35, { litSeams: 0, litWeave: 1 }, "sine.out"); //                       (click chacune+0.42)
  st(t.chacune, 0.9, { ...L_ONE }, "sine.inOut");
  // (retouche 08/11) three cuts instead of the dive ×9, the climb after the yarn and the pull-back to one layer
  // (qa: heurté 26,5 · 28,3 · 30,3, and two stray frames at 27,90 on the full-frame weave): each lands before its words
  const cutW = t.fils - 0.18; //  « des fils croisés » — the weave, close
  const cutK = t.ces - 0.2; //    « Et ces fils… » — the top edge, where the heart yarn comes out
  const cutS = t.principe - 0.1; // « Pourquoi ça tient ? » — the whole stack, then the first layer alone
  const cutT = t.poids - 0.2; //    « À poids égal » — the test (swinging off the weave fast shimmered at 35,07)
  const cWeave = co.add({ title: "Fils croisés", x: 110, y: 520, align: "start", anchor: A.first });
  cWeave.show(tl, cutW + 0.04);
  cWeave.hide(tl, cutK - 0.25);

  /* ───────────── « Et ces fils… c'est souvent du Kevlar. » — the heart yarn drawn out, the camera after it ───────────── */
  st(t.ces + 0.4, t.kevlar + 0.1 - (t.ces + 0.4), { fiber: 1 }, "sine.inOut"); //                (click ces+0.46)
  punch(t.kevlar, 0.06);
  const cKevlar = co.add({ title: "Kevlar", x: 110, y: 520, align: "start", tone: "system", anchor: A.fiber });
  cKevlar.show(tl, t.kevlar - 0.4);
  cKevlar.hide(tl, cutS - 0.25);

  /* ───────────── « Pourquoi ça tient ? » — the first layer alone ───────────── */
  st(t.principe - 0.2, 0.7, { fiber: 0, litWeave: 0.35 }, "sine.inOut");
  st(t.principe - 0.05, 0.55, { solo: 1 }, "sine.inOut");
  // (retouche 08/11) no punch on « tient »: a 6 % zoom over the full-frame weave shimmered (qa: 31,47 → 31,97); the cut marks it

  /* ───────────── « Chaque fil touché tire ses voisins : des centaines se tendent ensemble. » ───────────── */
  st(t.touched - 0.26, 0.38, { spread: 0.3 }, "power2.out"); //  the struck yarns: a cross, and the point (up on « fil touché »)
  st(t.tire, t.voisins + 0.36 - t.tire, { spread: 0.55 }, "sine.inOut"); // (click voisins+0.38)
  st(t.centaines - 0.1, t.together + 0.22 - (t.centaines - 0.1), { spread: 1 }, "sine.inOut"); // the star (blip ensemble+0.26)

  /* ───────────── « À poids égal, ce fil est 5 fois plus résistant que l'acier. » — the strength test ───────────── */
  st(t.poids - 0.45, 0.45, { test: 1, ...LIGHT.test }, "sine.out");
  st(t.poids - 0.1, t.egal + 0.22 - (t.poids - 0.1), { load: 0.2 }, "sine.inOut"); //   one block each
  st(t.egal + 0.22, 0.42, { load: 0.64 }, "sine.inOut"); //   the second on each: the steel snaps (≈ égal+0.42, in the breath), its blocks fall
  st(t.egal + 0.66, t.fois + 0.14 - (t.egal + 0.66), { load: 1 }, "none"); //           the Kevlar takes five: the fifth on « fois »
  chip("chip-cinq", null, 96, 470, t.poids - 0.1, t.principeEnd + 0.12);
  punch(t.acier, 0.06, { down: 0.3 }); // (let go before the cut `torepos`)

  /* ───────────── « Toute la nuit, il attend. » — it all folds back; the panel goes home; the quiet street ───────────── */
  // (retouche 08/11) a CUT on `torepos` (qa: heurté 38,8) to him, 3/4 FRONT (az −100 showed his back: « a robot holding
  // a board »): the vest worn, the panel sliding home into its pocket, the street calm behind. The test, the star and
  // the solo layer go with the cut; the fanned pages fold back off to his side.
  // his head under the header; aimed 8 cm to the screen's right of him so he stands centred, clear of the buttons
  const REST = { ...VIEW.rest, tx: -7.4, ty: 140, tz: -1.6, d: 240, az: 55, el: 6, fov: 34, shift: 40 };
  cut(t.torepos, null, REST, { test: 0, load: 0, solo: 0, spread: 0, litWeave: 0, you: 0.45, vest: 0.45, shell: 0.22, riot: 0.06 });
  st(t.torepos + 0.02, 0.7, { explode: 0, housse: 0 }, "sine.inOut");
  const home = t.torepos + 0.04;
  st(home, t.attend + 0.38 - home, { out: 0 }, "power1.out"); // nearly home on « il attend » (≈ 6 cm at 40,0), seated on the click (attend+0.38)
  st(home, t.attend + 0.38 - home, { ...LIGHT.panel }, "sine.inOut");
  st(home, 0.7, { you: 1, vest: 1, shell: 0.5, riot: 0.15 }, "sine.inOut");
  st(home, 0.8, { pool: 0, grid: 0 }, "sine.inOut");

  /* ───────────── « Son panneau a un sens : une face vers la rue, une face vers toi. » ───────────── */
  st(t.panneau - 0.1, 0.5, { vest: 0.45, you: 0.35 }, "sine.inOut"); // the carrier thins (its panel shows), he fades: the arrows read on the dark
  st(t.rue - 0.55, 0.55, { faces: 0.5 }, "sine.out"); //       (click rue+0.22)
  st(t.toi - 0.5, 0.52, { faces: 1 }, "sine.out"); //          (click toi+0.22)
  chip("chip-rue", null, 96, 470, t.rue - 0.55, t.rue + 0.36);
  chip("chip-toi", null, 96, 470, t.toi - 0.52, t.topointe - 0.18);

  // (retouche 08/11) 19,5 → 22 s read as still (qa: 0,7 to 1,2): a cut before « Ton gilet souple » lands closer on the
  // parting housse, and the shot pulls back to both halves while it orbits (az −32 → −50)
  const cutG = t.souple - 0.52; // 0,08 s before « Ton »
  path([
    [t.toopen, VIEW.tip],
    [t.ouvre + 0.4, { d: 48, az: -32, el: 8, tx: -13.5, ty: 107, dof: 4 }], //                    « Alors… » the bullet frozen
    [t.lOuvre + 0.1, { ...VIEW.benchIn, d: 175, az: -36, el: 16 }], //                         « …on l'ouvre »
    [cutG, { d: 190, az: -39, el: 15 }],
  ]);
  const G = { ...VIEW.benchIn, tx: BX - 6, ty: 116, tz: BZ - 6, d: 150, az: -32, el: 10 };
  cut(cutG, null, G);
  path([
    [cutG, G],
    [t.souple + 0.3, { d: 185, az: -40, el: 12 }],
    [t.housse, { tx: BX - 9, ty: 116, tz: BZ - 20, d: 300, az: -50, el: 17, shift: 60 }], //     « housse »: both halves
    [t.dizaines + 0.3, { tx: BX + 2, ty: 117, tz: BZ, d: 295, az: -53, el: 21 }], //            the pages fan
    [t.ensemble + 0.16, { d: 280, az: -56, el: 16 }], //                                         « Chacune » the weave lights on every page
    [cutW, { d: 270, az: -58, el: 15 }],
  ]);
  /* cut — « des fils croisés, serrés » : the weave, close; a slow push, never through the pattern fast */
  const W = { ...VIEW.weave, ty: 124, tz: BZ + 6, d: 34, az: -57, el: 9 };
  cut(cutW, null, W);
  path([
    [cutW, W],
    [cutK, { d: 27.5, az: -59, el: 12 }],
  ]);
  /* cut — « Et ces fils… c'est souvent du Kevlar. » : the top edge, the heart yarn drawn out, the camera after it */
  // aimed ABOVE the top edge (136): the weave stays in the lower part of the frame (ty 133 shimmered: 20 stray frames)
  const K = { ...VIEW.weave, tx: L0 - 2, ty: 141, tz: BZ + 9, d: 50, az: -60, el: 5, shift: 0 };
  cut(cutK, null, K);
  path([
    [cutK, K],
    [t.cest + 0.1, { d: 49, az: -61, el: 6 }], //                                                 the yarn comes out
    [t.eclateEnd + 0.1, { d: 47, az: -63, el: 10 }], //                                          « Kevlar »
    [cutS, { d: 46, az: -64, el: 11 }],
  ]);
  /* cut — « Pourquoi ça tient ? » : the stack 3/4, the others go, one layer stays; the principle on it; the test */
  // the weave filling the frame with nothing else moving shimmers (qa, 31,5 → 31,9 at d 100–114): the stack is held at
  // d ≈ 130 until « Chaque », then the camera closes in quickly while the cross comes up (as the original dive, clean)
  const S = { ...VIEW.solo, d: 132, az: -63, el: 12, shift: 30 };
  cut(cutS, null, S);
  path([
    [cutS, S],
    [t.tient, { d: 128, az: -65 }], //                                                          « Pourquoi ça tient ? »
    [t.touched - 0.5, { d: 124, az: -66 }], //                                                 « Chaque »
    // the struck point: near enough for the cross, far enough that the layer sits on the dark (not a flat wall)
    [t.touched + 0.1, { tx: L0 - 1, ty: 110, tz: BZ + 2, d: 98, az: -67, el: 12, shift: 30, fov: 30 }],
    [t.voisins + 0.3, { d: 101, az: -69, el: 14 }], //                                           « tire ses voisins »
    [t.together, { tx: L0, ty: 114, tz: BZ + 2, d: 106, az: -71, el: 20, shift: 40 }], //         the star, the whole layer
    [cutT, { d: 107, az: -72, el: 20 }],
  ]);
  /* cut — « À poids égal… » : the test; both strands (the steel wire reads at d ≤ 110), the blocks above the captions */
  const T = { ...VIEW.test, ty: 124, d: 100, az: -95, el: 5, shift: 0 };
  cut(cutT, null, T);
  path([
    [cutT, T],
    [t.egal + 0.1, { ty: 123, d: 102, az: -97 }], //                                            « à poids égal »
    [t.fois + 0.05, { ty: 118, d: 112, az: -101, el: 8 }], //                                    « 5 fois »: the five blocks
    [t.acier + 0.05, { ty: 119, d: 110, az: -105, el: 10 }], //                                  « l'acier »
    [t.torepos, { d: 108, az: -107, el: 11 }],
  ]);
  /* cut `torepos` — « Toute la nuit, il attend » : him 3/4 front; then round to his side for the two faces */
  path([
    [t.torepos, REST],
    [t.attend + 0.1, { d: 226, az: 47, el: 7 }], //                                             « Toute la nuit, il attend »
    [t.sens, { tx: -11, ty: 104, tz: 0, d: 150, az: 30, el: 10, fov: 34, shift: 60 }], //        « son panneau a un sens »
    [t.rue - 0.05, { ty: 99, d: 120, az: 14, el: 14, shift: 80 }], //                            « une face vers la rue »: the arrows above the captions
    [t.toi + 0.05, { d: 115, az: 2, el: 12 }], //                                                « une face vers toi »
    [t.topointe, { d: 112, az: -2 }],
  ]);

  /* ───────────── cut `topointe` — « Puis une pointe touche… la première couche. » ───────────── */
  cut(t.topointe, SET.SCENE, VIEW.touch, { ...STAGED, shell: 0.5, riot: 0.5, dist: 4, trail: 0.6, ...LIGHT.panel });
  const go = t.topointe + 0.06;
  st(go, t.touche + 0.42 - go, { dist: 0 }, "power1.in"); //            the tip touches in the breath after « touche… » (crack +0.46)
  st(t.touche + 0.45, t.tozero - 0.1 - (t.touche + 0.45), { trail: 0.5 }, "sine.inOut");
  punch(t.couche, 0.05, { hold: 0.12, down: 0.3 });
  path([
    [t.topointe, VIEW.touch],
    [t.touche + 0.42, { tx: -11.6, d: 32, az: 24, shift: 60 }],
    [t.tozero, VIEW.zero],
  ]);
}
