// 01 · L'HEURE — accroche → piege (0 → tot1). Starts from POSE0 and FIRST (no cut); hands over at `tot1`, moving.
// PLAN-SÉQUENCE (docs/recette-actes.md): one D.path per place, launched, the azimuth always turning the same way on screen
// (az decreasing: the camera swings round to its right in every shot); every path ends "go" into the next cut.
//   accroche  the drill floor, low: the mud jet already rising up the derrick (it pulses, the rain falls back); the camera
//             climbs the lattice; « crache »: the jet surges, punch
//   promesse  cut to the rig whole (« C'est Deepwater Horizon »), a slow swing, then the plunge under the sea along the
//             riser (« Au fond »), the small BOP growing; cut on « fermer » to the BOP: the jaws and the blades close slowly
//             and the red rises through them anyway (« sans sceller », punch)
//   principe  cut to the well in section: down the long tube (« un long tube »), the mud lights green (« boue lourde »), at
//             the bottom the two arrows fight — the weight grows (« poids »), the gas pushes back (« gaz d'en bas »), the
//             weight wins (« rien ne remonte », punch)
//   bop       cut to the BOP whole, all open, green: punch on « BOP »; the camera dives to the jaws, which close on
//             « serrent », then to the blades, which close and cut clean on « coupent »
//   piege     cut to the flow dial: the needle climbs from « venues » to « dix » (green zone), the chip, punch; « Retiens »
//             the mark 10 lights and stays, the camera pulls back to the dial at the foot of the column
import { STAGED, SET, lit, W, POSE0, LOOK } from "./world.js";

// a point of a maquette as a camera aim
const A = (name, local) => {
  const [tx, ty, tz] = W(name, local);
  return { tx, ty, tz };
};
const P = { side: 0, roll: 0, drift: 0.25, dof: 0 };

// what a cut to each place must say (everything that maquette reads)
const PUITS0 = {
  ...STAGED.puits, culprit: 0, fault: 0, ok: 0, depuis: 0, sea: 0, gas: 0, gasBase: 0, balance: -1, debit: 0, mark: 0,
  dialTube: 0, dialLine: 0, eds: 0, signal: 0, link: 1, annular: 0, vbr: 0, bsr: 0,
};
const BOP0 = {
  ...STAGED.bop, culprit: 0, fault: 0, ok: 0, depuis: 0, flow: 0, pass: 0, annular: 0, vbr: 0, bsr: 0, buckle: 0, inside: 0,
  amf: 0, link: 1, podOpen: 0, charge: 1, coils: 0, plume: 0, rams2: 0, ring: 0, shear: 0,
};

export default function acte1({ D }) {
  const { st, cut, path, chip, punch } = D;
  const t = D.times({
    choc: "choc", promesse: "promesse", neuf: "neuf", fond: "promesse:fond", fermer: "fermer", sceller: "sceller",
    toprincipe: "toprincipe", long: "principe:long", boue1: "boue1", pese: "pese", gaz1: "gaz1", remonte: "remonte",
    tobop: "tobop", bop: "bop", machoires1: "machoires1", serrent: "bop:serrent", lames1: "lames1", coupent: "bop:coupent",
    topiege: "topiege", venues: "piege:venues", dix1: "dix1", retiens: "retiens", tot1: "tot1",
    sans: "promesse:sans", puitsP: "promesse:puits", pourquoi: "promesse:pourquoi", puitsW: "principe:puits",
    pression: "principe:pression", bas: "principe:bas", rien: "principe:rien", barriere: "barriere",
  });
  D.captionStyle({ hit: 0.25 });

  /* ── « 21 h 40. Ton derrick crache de la boue. » — the jet already rising, the camera climbing the lattice ── */
  st(0, t.choc - 0.05, { jet: 0.72, spill: 0.28 }, "none");
  st(t.choc, 0.25, { jet: 0.88 }, "power2.out");
  st(t.choc + 0.25, t.promesse - t.choc, { spill: 0.4 }, "sine.out");
  path([
    [0, POSE0],
    [t.choc, { ...A("plateforme", [0, 540, 0]), az: -64, el: -37 }],
    [t.promesse - 0.12, { ...A("plateforme", [0, 556, 0]), d: 98, az: -68, el: -34 }],
  ]);
  punch(t.choc, 0.06);

  /* ── « C'est Deepwater Horizon. Il te reste neuf minutes. Au fond, la sécurité va se fermer… » ──
     the rig whole, a slow swing, then the plunge under the sea down the riser to the small BOP */
  const cRig = t.promesse - 0.12;
  const RIG = { ...P, ...A("plateforme", [0, 500, 0]), d: 1080, az: -54, el: 4, fov: 30, shift: 150 };
  cut(cRig, SET.PLATEFORME, RIG, { ...STAGED.plateforme, ...lit("plateforme", [0, 470, 0], 260), jet: 0.86, spill: 0.4 });
  st(t.neuf, t.fermer - t.neuf - 0.2, { ...lit("plateforme", [0, 40, 0], 120) }, "sine.inOut");
  path([
    [cRig, RIG],
    [t.neuf - 0.3, { ...A("plateforme", [0, 460, 0]), d: 1100, az: -58, el: 2, shift: 100 }],
    [t.fond, { ...A("plateforme", [0, 40, 0]), d: 400, az: -63, el: -1, fov: 36, shift: 80 }],
    [t.fermer - 0.12, { ...A("plateforme", [0, 12, 0]), d: 230, az: -67, el: 5, fov: 32, shift: 120 }],
  ]);

  /* ── « …sans sceller le puits. Pourquoi ? » — the BOP: the jaws and blades close slowly, the red passes anyway ── */
  const cBop = t.fermer - 0.12;
  const BOPA = { ...P, ...A("bop", [0, 88, 0]), d: 700, az: -54, el: 9, fov: 30, shift: 150 };
  // the red rises under the closing jaws (pass 0), then bursts through them on « sans sceller », then fills the pipe
  cut(cBop, SET.BOP, BOPA, { ...BOP0, flow: 0.5, pass: 0 });
  st(cBop + 0.1, t.sans - cBop - 0.1, { flow: 1 }, "sine.inOut");
  st(t.fermer, 0.5, { annular: 0.8 }, "power2.inOut");
  st(t.fermer + 0.25, 0.55, { vbr: 0.8 }, "power2.inOut");
  st(t.sans - 0.05, 0.6, { pass: 1 }, "power2.out");
  st(t.sceller - 0.1, 0.7, { bsr: 0.6 }, "power2.inOut");
  st(t.puitsP, 0.45, { inside: 1 }, "power2.out");
  path([
    [cBop, BOPA],
    [t.sceller, { d: 610, az: -58, el: 8 }],
    [t.pourquoi, { d: 540, az: -61, el: 8 }],
    [t.toprincipe, { ...A("bop", [0, 86, 0]), d: 450, az: -64, el: 7, shift: 130 }],
  ]);
  punch(t.sceller, 0.06);

  /* ── « D'abord, comment ça marche. Un puits, c'est un long tube plein de boue lourde. Tant que son poids bat la
     pression du gaz d'en bas… rien ne remonte. » — down the column; at the bottom, the two arrows fight ── */
  const cWell = t.toprincipe;
  // the column big and lit from the cut; the mud starts to glow on « un puits », full green on « boue »
  const WELL = { ...P, ...A("puits", [0, 215, 0]), d: 400, az: -58, el: 5, fov: 30, shift: 20 };
  cut(cWell, SET.PUITS, WELL, { ...PUITS0, balance: 0, ...lit("puits", [0, 210, 0], 190) });
  st(t.long - 0.2, t.pese - t.long, { ...lit("puits", [0, 110, 0], 160) }, "sine.inOut");
  st(cWell + 0.1, t.puitsW + 0.3 - cWell - 0.1, { ok: 0.45 }, "sine.inOut");
  st(t.boue1, 0.4, { ok: 1 }, "power2.out");
  st(t.pese, 0.5, { balance: -0.7 }, "power2.out");
  st(t.pression, 0.4, { gas: 0.03 }, "power2.out");
  st(t.gaz1, 0.45, { balance: -0.15, gas: 0.05 }, "power2.out");
  st(t.bas + 0.06, 0.4,{ balance: -0.45, gas: 0.035 }, "power2.inOut");
  st(t.rien, 0.45, { balance: -1, gas: 0.008 }, "power2.out");
  path([
    [cWell, WELL],
    [t.long - 0.2, { ...A("puits", [0, 190, 0]), d: 420, az: -61, el: 4 }],
    [t.boue1, { ...A("puits", [0, 160, 0]), d: 470, az: -63 }],
    [t.pese, { ...A("puits", [0, 92, 0]), d: 430, az: -66, el: 6, shift: 40 }],
    [t.gaz1 + 0.4, { ...A("puits", [0, 84, 0]), d: 400, az: -69, el: 5 }],
    [t.tobop, { ...A("puits", [0, 88, 0]), d: 375, az: -72, el: 6 }],
  ]);
  punch(t.remonte, 0.06);

  /* ── « Sinon, reste une dernière barrière, au fond : le BOP. Des mâchoires qui serrent le tube… et des lames qui le
     coupent pour fermer le puits. » — the BOP whole, open, green; down to the jaws, then the blades ── */
  const cStack = t.tobop;
  const STACK = { ...P, ...A("bop", [0, 96, 0]), d: 680, az: -46, el: 12, fov: 30, shift: 60 };
  cut(cStack, SET.BOP, STACK, { ...BOP0, ok: 1 });
  // « Sinon… » the red climbs the open bore, in two surges (« barrière »); the jaws then stop it in green
  st(cStack + 0.12, 1.0, { flow: 0.55 }, "power2.out");
  st(t.barriere, 0.9, { flow: 1 }, "sine.inOut");
  st(t.machoires1, t.serrent + 0.25 - t.machoires1, { vbr: 1 }, "power2.inOut");
  st(t.coupent - 0.12, 0.45, { bsr: 1 }, "power2.in");
  st(t.coupent + 0.3, 0.3, { shear: 1 }, "power2.out");
  path([
    [cStack, STACK],
    [t.barriere, { d: 640, az: -48, el: 11 }],
    [t.bop,{ ...A("bop", [0, 90, 0]), d: 580, az: -50, el: 10 }],
    [t.serrent, { ...A("bop", [0, 60, 0]), d: 300, az: -54, el: 7, shift: 30 }],
    [t.coupent, { ...A("bop", [0, 78, 0]), d: 215, az: -58, el: 6, shift: 10 }],
    [t.topiege, { ...A("bop", [0, 80, 0]), d: 178, az: -62, el: 6, shift: 0, dof: LOOK.dof }],
  ]);
  punch(t.bop, 0.06);

  /* ── « Mais d'habitude, on referme des venues de l'ordre de dix barils par minute. Retiens bien ce chiffre. » ── */
  const cDial = t.topiege;
  const DIAL = { ...P, ...A("puits", [-3, 76, 52]), d: 230, az: -64, el: 10, fov: 30, shift: 40, dof: LOOK.dof };
  cut(cDial, SET.PUITS, DIAL, { ...PUITS0, ...lit("puits", [-3, 74, 52], 70) });
  st(t.venues, t.dix1 - t.venues, { debit: 9.4 }, "power2.out");
  st(t.dix1, 0.9, { debit: 10 }, "sine.inOut");
  st(t.retiens, 0.3, { mark: 1 }, "power2.out");
  st(t.retiens, t.tot1 - t.retiens, { ...lit("puits", [-3, 84, 40], 120) }, "sine.inOut");
  path([
    [cDial, DIAL],
    [t.dix1, { d: 245, az: -68, el: 9 }],
    [t.retiens, { d: 275, az: -71, el: 8 }],
    [t.tot1, { ...A("puits", [-3, 92, 40]), d: 380, az: -75, el: 7, dof: 0 }],
  ]);
  punch(t.dix1, 0.06);
  chip("chip-10", null, 96, 470, t.dix1 - 0.1, t.tot1 - 0.3);
}
