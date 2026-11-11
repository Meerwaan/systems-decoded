// 03 · RÉPONSE — `tozero` (46,96) → `toverdict` (62,57). The panel in section, from the tip that has just touched to
// the bullet lodged, then home. D.path moves (az always decreasing: +18 → −62), joined since the retouche of 08/11 by
// three cuts (« Vers », « Chaque », « Toi »): the act opens on an invisible cut to VIEW.zero, where acte2's move lands
// at speed, and runs on at speed into the cut of fin.js.
//
// The physical order, never another (docs/044-actes.md): contact → the first yarns snap (`breaks` 0 → 0.5: they spring
// out, signal; 0.5 → 1 they droop and dim · `pierce` 0.15) → the next ones pull tight (`tense`, veille) → the fold runs
// out, layer after layer (`ring`) → the cone (`cone`) → toward you (the belly, `wave`) → each layer takes its part
// (`share`) → the mushroom (`mushroom` 1 with `cone` 1: the header turns « T+0,20 ms · Arrêtée » veille) → lodged:
// `mood` falls to veille on « Elle reste plantée », not before → he turns round and walks home.
// `cone` only ever grows, from « cassent » to « champignon »: the header's clock (T = 0,2 ms × cone) never stalls.
// After contact the bullet's front sits at IMPACT x + pierce·1,2 + cone·4,05 cm: the aim follows it to the right.
import { setAct } from "@kit/overlay.js";
import { VIEW, STAGED, SET, LIGHT } from "./world.js";

// the move's keys (the first complete: VIEW.zero, where acte2 lands; the next ones only what changes)
const Z0 = VIEW.zero; //                                                                       tx −10.5 · d 30 · az 18
const SNAP = { tx: -10.6, ty: 106.4, d: 25, az: 12, el: 6, shift: 50 }; //                     « cassent »: in on the yarns
const TAUT = { tx: -10.2, ty: 106.8, d: 32, az: 4, el: 9, shift: 60 }; //                      « tendent »
const NEIGH = { tx: -9.8, ty: 107.6, d: 40, az: -4, el: 7, shift: 70, dof: 6 }; //            « voisins »: the fold leaves
const LAYERS = { tx: -9.3, ty: 108, d: 50, az: -10, el: 10, shift: 90, dof: 4 }; //           « couche après couche »
// retouche 08/11: the V tight, the subject of the frame (it was pale and thin at d 78, between the pocket and the ribs)
const CONE = { tx: -8.1, ty: 107.8, d: 54, az: -16, el: 7, fov: 32, shift: 120, dof: 0 }; //   « cône »: the V fills the frame
// « Vers toi »: a cut a few frames before « Vers » to the wide (the ribs, the blow), a slow push · a cut a few frames
// before « Chaque » back onto the V (retouche: the old pull-back d 78 → 135 → 55 in 2.7 s was the jerk at 55,7)
const TOWARD_IN = { tx: -7, ty: 118.5, d: 142, az: -20, el: 5 }; //                             the cut: the wide on the ribs
const TOWARD = { tx: -6.5, ty: 120, d: 130, az: -23 }; //                                        « vers toi »: the ribs, the blow
const SHARE_IN = { tx: -7.6, ty: 107.5, d: 64, az: -26, el: 8, fov: 32, dof: 4 }; //            the cut: back on the V
const SHARE = { tx: -7.6, ty: 107.5, d: 55, az: -28, el: 8, fov: 32, dof: 4 }; //             « chaque couche prend sa part »
const MUSH = { tx: -7.8, ty: 106.4, d: 34, az: -34, el: 6, dof: 8 }; //                         « …en champignon » (trigger)
// retouche: close on the lodged bullet (at d 70 it was ≈ 15 px in a dark frame), a slow turn round it to the cut
const PLANTED = { tx: -7.7, ty: 106.7, d: 37, az: -44, el: 10, fov: 32, dof: 0 }; //           « plantée dans le gilet »
// he turns round: a CUT a few frames before « Toi » (retouche: the pull-back d 70 → 320 and 48 cm across in 1,4 s was
// the jerk at 60,4, the head of glass through the header), seen head to knee, the head under the header (aim high,
// no shift), a slow pull-back · he walks away, 3/4 from behind, the far façade behind him (az −62: the street runs
// across the frame, not into a black void)
const TURN_IN = { tx: 25, ty: 140, tz: 8, d: 290, az: -48, el: 10, fov: 38, shift: 0, dof: 0 }; // the cut: him, turning
const TURN = { tx: 40, ty: 140, tz: 8, d: 320, az: -52, el: 10, fov: 38, shift: 0 }; //       « tu rentres »
const HOME = { tx: 200, ty: 100, tz: 11, d: 560, az: -62, el: 10, fov: 40, shift: 130 }; //    « …te coucher »

export default function acte3({ D }) {
  const { tl, st, path, cut, jolt, punch } = D;
  const t = D.times({
    tozero: "tozero", zero: "zero", cassent: "zero:cassent", cassentEnd: "zero:cassent$", tendent: "zero:tendent",
    tirent: "zero:tirent", voisinsEnd: "zero:voisins$", couche2: "zero:couche#2", zeroEnd: "zero$",
    reponse: "reponse", cone: "reponse:cône", coneEnd: "reponse:cône$", vers: "reponse:vers",
    chaque: "reponse:chaque", partEnd: "reponse:part$", ecrase: "reponse:écrase", ecraseEnd: "reponse:écrase$",
    champignon: "reponse:champignon", trigger: "trigger", elle: "reponse:elle", gilet: "reponse:gilet",
    towalk: "towalk", toi2: "reponse:toi#2", rentres: "reponse:rentres", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  // the street dimmed, him standing, the panel in section, the tip on the first layer: nothing broken yet
  cut(t.tozero, SET.SCENE, Z0, { ...STAGED, shell: 0.5, riot: 0.5, dist: 0, trail: 0.5, ...LIGHT.panel });

  /* « Les premiers fils cassent. » — on the word: the front yarns snap and spring out, the first layers tear */
  st(t.cassent - 0.03, 0.2, { breaks: 0.5, pierce: 0.15 }, "power2.out");
  st(t.cassentEnd + 0.1, 2.3, { breaks: 0.75 }, "sine.inOut"); // they droop, still signal while the strain spreads
  st(t.cassent - 0.03, t.reponse - t.cassent, { cone: 0.3 }, "none"); // the hollow starts: the clock leaves T+0,00
  st(t.cassent, t.cone - t.cassent, { trail: 0.3 }, "none");
  punch(t.cassent, 0.06);

  /* « Les suivants se tendent. » — the yarns behind the tear pull tight along the shot, veille */
  st(t.tendent - 0.1, 0.6, { tense: 1 }, "sine.out");

  /* « Et tirent leurs voisins. Couche après couche. » — the fold runs out from the tip, each layer a little later */
  st(t.tirent, t.zeroEnd + 0.26 - t.tirent, { ring: 1 }, "none"); // its front still travelling on « couche après couche »
  st(t.tirent, t.zeroEnd - t.tirent, { pierce: 0.22 }, "sine.inOut");

  /* « Le tissu se creuse en cône. » — the whole panel in section, the hollow deepens toward the body */
  st(t.reponse, t.coneEnd - t.reponse, { cone: 0.8 }, "sine.inOut");
  st(t.reponse, t.coneEnd - t.reponse, { breaks: 1 }, "sine.inOut"); // the snapped ends droop out of the story
  punch(t.cone, 0.06, { down: 0.26 }); // let go before the cut of « Vers » (54,22)

  /* « Vers toi. » — the apex pushes the belly in behind the panel, the blow runs out over the ribs */
  st(t.vers, t.partEnd - t.vers, { cone: 0.9 }, "sine.inOut");
  st(t.vers - 0.05, t.chaque - t.vers + 0.3, { wave: 0.6 }, "none"); // the ribs light as it passes, in the frame
  st(t.chaque + 0.25, 0.8, { wave: 1 }, "sine.out");

  /* « Chaque couche prend sa part. » — the band of light crosses the thickness, strike face to wear face */
  st(t.chaque + 0.15, t.partEnd - t.chaque, { share: 1 }, "none");

  /* « La balle s'écrase… en champignon. » — it flattens on « s'écrase », opens into the mushroom on « champignon » */
  st(t.ecrase - 0.1, t.ecraseEnd - t.ecrase + 0.1, { mushroom: 0.7, cone: 0.96, pierce: 0.3 }, "sine.inOut");
  st(t.champignon - 0.12, 0.3, { mushroom: 1, cone: 1, pierce: 0.35 }, "power2.out"); // T+0,20 ms · Arrêtée (veille)
  jolt(t.trigger, 0.9);

  /* « Elle reste plantée dans le gilet. » — the system has won: veille, on « Elle », not before */
  st(t.elle - 0.02, 0.4, { mood: 0 }, "sine.inOut");
  st(t.elle, 0.7, { trail: 0, tense: 0.3 }, "sine.out");

  /* « Toi, tu rentres te coucher. » — the cut closes, he turns round by his left and walks home, the night calmer */
  st(t.towalk, 0.8, { section: 0, xray: 0 }, "sine.inOut");
  st(t.towalk, t.toverdict - t.towalk, { riot: 0.3, shell: 1, fx: 100, fy: 115, fz: 10, fs: 160 }, "sine.inOut");
  st(t.toi2 - 0.06, 0.75, { walk: 0.12 }, "sine.inOut"); // the turn
  st(t.toi2 + 0.69, t.toverdict - t.toi2 - 0.69, { walk: 0.19 }, "none"); // ≈ 2 m at a walk

  // the camera: four moves joined by three cuts (retouche 08/11), each cut a few frames before its word; a cut sets
  // no number (state {}): every tween runs on across it
  const toToward = t.vers - 0.1; //  54,22
  const toShare = t.chaque - 0.1; // 55,06
  const toTurn = t.toi2 - 0.2; //    60,36
  const p1 = path([
    [t.tozero, Z0],
    [t.cassentEnd, SNAP],
    [t.tendent, TAUT],
    [t.voisinsEnd, NEIGH],
    [t.couche2, LAYERS],
    [toToward, CONE],
  ]);
  const towardIn = { ...p1, ...TOWARD_IN };
  cut(toToward, null, towardIn);
  const p2 = path([[toToward, towardIn], [toShare, TOWARD]]);
  const shareIn = { ...p2, ...SHARE_IN };
  cut(toShare, null, shareIn);
  const p3 = path([[toShare, shareIn], [t.partEnd, SHARE], [t.trigger, MUSH], [toTurn, PLANTED]]);
  const turnIn = { ...p3, ...TURN_IN };
  cut(toTurn, null, turnIn);
  path([[toTurn, turnIn], [t.rentres, TURN], [t.toverdict, HOME]]);
}
