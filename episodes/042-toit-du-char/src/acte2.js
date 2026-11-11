// DOSSIER 042 — 02 AUTOPSIE (« Alors… on l'ouvre », the exploded view, the principle): ouvre − 0.12 → torest.
//
// « Alors… » : act 1's camera lands at speed on VIEW.closeIn; time stops — the fire holds, the tank fades round the
// caisson, the light turns veille, and the camera keeps turning (az −20 → −30).
// « …on l'ouvre. » : cut IN PLACE to the bench (`tobench`), the caisson alone on its pool, three-quarter; it comes apart
// ON « on » (`explode`): panel up, rounds back, doors and the lock toward us — the camera, already moving, backs off to
// hold the whole spread. Then ONE travelling on the bench, az always decreasing (−40 → −68), el rising and falling at
// each key for depth: each part lights veille on its word, its callout with it, and makes its gesture (the panel hops
// on its bolts on « lâcher », the door slides a notch on « coulissantes », on « reliée au panneau… » the panel and the
// rod light and move together: the panel lifts, the rod rises, the cam turns a notch); a cut IN on « une came », three
// frames early, onto the egg, then a slow push to « forme » (the rod's head kept under the header).
// « Pourquoi le toit ? » : cut on `toprincipe` to the caisson whole, in section; the ring of the weak point; the powder
// flames, the six arrows are born face by face, then the camera sinks low (the bow of the panel reads from below only)
// while the panel bows on « sort… moins », and lets go on « cède »: every arrow swings up and leaves by the roof.
// The path hands over at speed at `torest`, where acte3 cuts.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED } from "./world.js";

export default function acte2({ D, world, co }) {
  const { tl, st, path, cut, punch } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    caisson: "eclate:caisson", panneau: "eclate:panneau", lacher: "eclate:lâcher", portes: "eclate:portes",
    coulissantes: "eclate:coulissantes", reliee: "eclate:reliée",
    panneau2: "eclate:reliée+0.4", // « panneau… », the second one (the ref « eclate:panneau » finds the first)
    came: "eclate:came", forme: "eclate:forme",
    toprincipe: "toprincipe", toit: "principe:toit", poudre: "principe:poudre", pousse: "principe:pousse",
    faces: "principe:faces", caisson2: "principe:caisson", sort: "principe:sort", moins: "principe:moins",
    cede: "principe:cède", premier: "principe:premier", torest: "torest",
  });
  const start = t.ouvre - 0.12; // acte1 hands over here, at speed on VIEW.closeIn
  setAct(tl, 2, start);

  /* ═════════ « Alors… » — time stops on the caisson (act 1's state, held; the tank fades round it) ═════════ */
  st(start, 0.5, { shell: 0.25, crew: 0, you: 0, heat: 0.3 }, "sine.inOut");
  st(start, 0.45, { mood: 0 }, "sine.inOut"); // frank: signal → veille in under half a second
  st(start, 0.4, { press: 0, arrowRoof: 0, arrowDoor: 0 }, "sine.out"); // the threat holds its breath: the caisson alone
  path([
    [start, VIEW.closeIn], //                                          −20, the caisson close
    [t.tobench, { ...VIEW.closeIn, az: -30, el: 20, d: 680 }], //     −30, still turning into the cut
  ]);

  /* ═════════ « …on l'ouvre. » — the bench, in place; it comes apart ON « on » ═════════ */
  const sys = benchCut(D, { at: t.tobench, set: SET.BENCH, view: { ...VIEW.system, d: 1300 }, state: BENCHED, pool: 0.25 });
  st(t.explode, 1.2, { explode: 1 }, "power2.out");

  /* ═════════ the four parts, each on its word, each with its gesture ═════════ */
  // « Derrière toi, un caisson d'obus. »
  st(t.caisson - 0.1, 0.35, { litBox: 1 }, "power2.out");
  // « Au-dessus, un panneau fait pour lâcher. » — on « lâcher » it hops on its bolts (they glint) and settles back
  st(t.panneau - 0.1, 0.35, { litBox: 0, litPanel: 1 }, "power2.out");
  st(t.lacher - 0.04, 0.16, { blow: 0.09 }, "power2.out");
  st(t.lacher + 0.12, 0.26, { blow: 0 }, "power2.in"); // back down in the breath (the sfx click at lâcher + 0.38)
  // « Vers toi, deux portes blindées coulissantes. » — on « coulissantes » the loader's door slides a notch, and home
  st(t.portes - 0.1, 0.35, { litPanel: 0, litDoors: 1 }, "power2.out");
  st(t.coulissantes - 0.04, 0.3, { door: 0.3 }, "power2.out");
  st(t.coulissantes + 0.3, 0.22, { door: 0 }, "power2.in"); // home on the click (coulissantes + 0.54)
  punch(t.coulissantes, 0.06);
  // « Et reliée au panneau… une came en forme d'œuf. » — the link is the PIECES': the panel lights on « reliée », the
  // rod and the cam on « panneau… », and they move together (the panel lifts a notch, the rod rises with it, the cam
  // turns a little), settled before the cut; then the cam takes the light
  st(t.reliee - 0.1, 0.35, { litDoors: 0, litPanel: 0.6 }, "power2.out");
  st(t.panneau2 - 0.1, 0.35, { litCam: 0.6 }, "power2.out");
  st(t.panneau2 - 0.04, 0.22, { blow: 0.07, lock: 0.35 }, "power2.out");
  st(t.panneau2 + 0.26, 0.32, { blow: 0, lock: 0 }, "sine.inOut"); // home by 27.30 (the cut: 27.37)
  st(t.came - 0.1, 0.35, { litPanel: 0, litCam: 1 }, "power2.out");
  punch(t.forme, 0.05, { hold: 0.18, down: 0.45 });

  /* ═════════ the camera: ONE travelling on the bench, az always decreasing; a cut IN on « une came » ═════════ */
  const tCam = Math.round((t.came - 0.34) * 30) / 30; // three frames before « une came », on a frame (27.367)
  path([
    [t.tobench, sys], //                                                               −40, the caisson whole
    [t.explode + 1.15, VIEW.exploded], //                                              −46, the whole spread
    [t.caisson, { tx: 20, ty: 10, tz: 0, d: 1380, az: -49, el: 12, shift: 50 }], //   the box and its rounds
    [t.panneau, { ...VIEW.panelUp, tx: -20, ty: 92, az: -52, el: 24, shift: 95 }], //     up to the panel (the caisson above the captions)
    [t.portes, { ...VIEW.doorsOut, tx: -105, ty: 25, az: -57, el: 14, shift: 110 }], //   down the bulkhead: a shorter swing
    [t.panneau2, { tx: -110, ty: 60, tz: 12, d: 900, az: -60, el: 22, fov: 32, shift: 0 }], // the panel AND the lock, one frame
    [tCam, { tx: -116, ty: 57, tz: 14, d: 865, az: -61, el: 21 }], //                   held while they move together
  ]);
  // « une came en forme d'œuf » : a cut IN along the axis onto the egg, then a slow push (d by ratio, not a dive)
  const CAMC = { ...VIEW.cam, d: 250, az: -62.5, el: 11, shift: -60 }; // the rod's head under the act row
  cut(tCam, null, CAMC);
  path([
    [tCam, CAMC], //                                                                    −62.5, the egg standing
    [t.forme, { d: 236, az: -64 }], //                                                  « forme »
    [t.toprincipe, { d: 226, az: -68, el: 12 }], //                                     still turning into the cut
  ]);

  /* ═════════ the callouts, one at a time, out before the next ═════════ */
  const parts = [
    [{ title: "Caisson d'obus", x: 560, y: 520, align: "end", anchor: A.caisson }, t.caisson, t.panneau - 0.26],
    [{ title: "Panneau de toit", x: 520, y: 462, align: "end", anchor: A.panel }, t.panneau, t.lacher + 0.3], // out before the panel rises to it
    [{ title: "Portes blindées", x: 600, y: 520, align: "start", anchor: A.doors }, t.portes, t.reliee - 0.12], // out before « reliée au panneau »
    [{ title: "Came", x: 600, y: 520, align: "start", anchor: A.cam }, t.came, t.toprincipe - 0.36],
  ];
  for (const [opt, from, to] of parts) {
    const c = co.add({ ...opt, tone: "system" });
    c.show(tl, from);
    c.hide(tl, to);
  }

  /* ═════════ « Pourquoi le toit ? Un feu de poudre pousse sur les six faces du caisson… et sort par celle qui résiste
     le moins. Le toit cède le premier. » — the caisson whole, in section, on its pool ═════════ */
  const SEC = { ...VIEW.secBench, d: 1120, az: -28, el: 22, shift: 50 };
  cut(t.toprincipe, SET.BENCH, SEC, { ...BENCHED, section: 1 });
  st(t.toit - 0.1, 0.4, { weak: 1, litPanel: 0.5 }, "power2.out"); // the ring of the weak point (act 1's « là »)
  st(t.poudre - 0.1, 0.6, { burn: 0.5 }, "power2.out");
  st(t.pousse, t.faces + 0.02 - t.pousse, { press: 0.6 }, "none"); // the six arrows, face by face: the sixth on « faces »
  st(t.caisson2, 0.5, { press: 1 }, "sine.inOut"); //                 then all equal
  st(t.sort - 0.1, 0.4, { arrowRoof: 1 }, "power2.out"); //           the push finds the roof
  st(t.sort - 0.1, t.moins - t.sort + 0.12, { bulge: 1 }, "sine.in"); // the thin face bows, fullest on « moins »
  punch(t.moins, 0.06);
  st(t.cede - 0.06, 0.12, { bulge: 0 }, "power2.out");
  st(t.cede - 0.06, 0.45, { blow: 0.12, weak: 0, litPanel: 0 }, "power2.out"); // it lets go
  st(t.cede + 0.02, 0.8, { vent: 1 }, "sine.inOut"); //                every arrow swings up and leaves by the roof
  punch(t.premier, 0.05, { hold: 0.12, down: 0.3 }); //                let go by 36.38: acte3 cuts at 36.39
  path([
    [t.toprincipe, SEC], //                                                     −28, el 22: the six faces at once
    [t.pousse, { d: 1020, az: -32, el: 15, shift: 60 }], //                     closing in as the arrows are born
    [t.caisson2, { ty: 5, d: 960, az: -35, el: 10, shift: 80 }], //            sinking: the roof's edge on the sky
    [t.moins, { ty: 12, d: 930, az: -38, el: 6, shift: 90 }], //               low: the bow reads in silhouette
    [t.cede, { ty: 24, d: 960, az: -40, el: 9, shift: 80 }], //                the panel lets go
    [t.torest, { ty: 36, d: 1030, az: -43, el: 13, shift: 70 }], //             the arrows leave by the roof (lancé)
  ]);
}
