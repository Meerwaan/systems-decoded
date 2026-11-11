// 02 · AUTOPSIE — tobench (18,24) → torepos (39,22): « Alors… on l'ouvre », the exploded chain, the principle. All on the bench.
//
// The cut lands in the breath before « Alors… », on the chain whole on its halo, safe (its witness disc across): the
// time stands still (hush) and the camera turns slowly round it. On « on » the row opens across the bench and the
// camera draws back to the whole of it (« Sur une fusée »), then leans toward its near end, the antenna.
// The row only fits a vertical frame seen along its diagonal (az ≤ −56), the close-ups only from its long side
// (az −20 → −40): so the camera goes back by ONE clean cut, matched on the piece the voice names — the antenna,
// centred on both sides. A second cut, in the breath before « Un verrou », jumps the receiver (unnamed): the move
// before it and the move after it run the same way on the screen (+x along the row), one travelling.
// From the lock on, ONE path to the end of the act, az always decreasing (−28 → −82): the lock arms (the disc turns
// a quarter, « sécurité-armement »), the detonator; the detonator fires and a head of light runs down the cord — the
// camera follows it (« qui file le long de la coque… ») — and parks at the charge's foot (« au bout »); the rest of the
// chain goes, the charge alone (« linéaire »). The dive onto its end, which opens (« Pourquoi ça tranche ? »): the V
// (its outline lights), the copper (its inner face lights). « Elle détone » — the white front runs out of the cut face
// to the far end, the camera running with it; the steel plate rises under the charge; the jet (« jet »), and on
// « coupe » it goes through the 2 cm plate, which opens. Act 3 cuts from there.
import { setAct } from "@kit/overlay.js";
import { VIEW, BENCHED, SET, ROW, LOOK } from "./world.js";

const CLOSE = { dof: LOOK.dof };
const OPEN = { dof: 0 };
/* ── the whole chain, then the row: seen along its diagonal ── */
const WHOLE = { ...VIEW.benchIn, d: 400, az: -56 }; //                                   the cut: the chain whole, safe, on its halo
const TURN = { az: -60, d: 412, el: 23 }; //                                     « on » — the row starts to open
const ROWV = { tx: -20, ty: 6, d: 470, az: -66, el: 22, shift: 40 }; //         the row open, whole: the camera went with it
const LEAN = { tx: -50, d: 400, az: -68, el: 21, shift: 30 }; //                « Sur une fusée » — already gliding to its near end
const NEAR = { tx: -92, ty: 6, d: 300, az: -70, el: 20, shift: 20 }; //          leaning to its near end: the antenna
/* ── the close-ups, from the row's long side ── */
const ANT = { ...VIEW.antenna, d: 94, az: -18, el: 14 }; //                       cut back, on the antenna (centred, as before)
const ANT2 = { tx: ROW.antenna + 6, d: 86, az: -26, el: 13 }; //                 « écoute le sol » — drifting +x
const LOCK = { ...VIEW.lock, tx: ROW.lock - 3, d: 90, az: -32 }; //              cut, on the lock: the move goes on +x
const LOCK2 = { tx: ROW.lock + 2, d: 80, az: -37 }; //                           the disc turns a quarter
const DET = { ...VIEW.detView, az: -42 }; //                                     « Un détonateur »
const CORD0 = { ...OPEN, tx: ROW.cord[0] + 6, ty: 2.4, d: 72, az: -45, el: 14 }; // the head of light enters the cord
const CORD1 = { tx: ROW.cord[1] - 6, az: -50 }; //                               …and runs along it
/* ── the charge, and the principle ── */
const chargeMid = (ROW.charge[0] + ROW.charge[1]) / 2;
const CHARGE = { ...OPEN, tx: chargeMid, ty: 3, d: 165, az: -56, el: 16, shift: 40 }; // « …la charge linéaire »
const DIVE = { tx: ROW.cut + 4, ty: 3.5, d: 72, az: -60, el: 15, shift: 0 }; //  « Pourquoi ça tranche ? »
const SECTION = { ...VIEW.section, ...CLOSE, az: -64 }; //                        « Pliée en V, doublée de cuivre »
const SECTION2 = { d: 31, az: -67 };
const BLAST = { ...OPEN, tx: ROW.cut + 10, ty: 3, d: 96, az: -70, el: 14 }; //  « elle détone » — the front leaves the cut face
const BLAST2 = { tx: ROW.cut + 20, d: 92, az: -72 }; //                         …running to the far end
const JET = { ...VIEW.jetView, az: -75 }; //                                     « un jet de métal »
const PLATE = { ...VIEW.plateView, d: 56, az: -78, el: 12 }; //                  « qui coupe… »
const PLATE2 = { tx: 63, d: 64, az: -82, el: 14 }; //                            « …deux centimètres d'acier »

export default function acte2({ D, world, co }) {
  const { tl, st, now, cut, path, chip, punch } = D;
  const A = world.sys.A;
  const t = D.times({
    tobench: "tobench", on: "explode", sur: "eclate", antenne: "eclate:antenne", ecoute: "eclate:écoute",
    verrou: "eclate:verrou", securite: "eclate:sécurité", securiteEnd: "eclate:sécurité$",
    detonateur: "eclate:détonateur", detonateurEnd: "eclate:détonateur$", cordeau: "eclate:cordeau",
    bout: "eclate:bout", charge: "eclate:charge", lineaire: "eclate:linéaire",
    pourquoi: "principe", trancheEnd: "principe:tranche$", pliee: "principe:Pliée", V: "principe:V", cuivre: "principe:cuivre",
    elle: "principe:elle", detone: "principe:détone", seconde: "principe:seconde$",
    jet: "principe:jet", coupe: "principe:coupe", acier: "principe:d'acier", torepos: "torepos",
  });
  setAct(tl, 2, t.tobench);
  const cutAnt = t.antenne - 0.3; //  in « Sur une fusée, | une antenne »
  const cutLock = t.verrou - 0.26; // in the breath before « Un verrou »

  /* ───────────── « Alors… on l'ouvre. » — the chain whole, safe, then the row ───────────── */
  cut(t.tobench, SET.BENCH, WHOLE, { ...BENCHED, arm: 0 });
  st(t.on, 1.4, { explode: 1 }, "power2.out");
  path([
    [t.tobench, WHOLE],
    [t.on, TURN],
    [t.on + 0.8, ROWV], //   the row has opened (no stop on it: the path never brakes)
    [t.sur + 0.2, LEAN],
    [cutAnt - 0.02, NEAR],
  ]);

  /* ───────────── « …une antenne écoute le sol. » ───────────── */
  cut(cutAnt, SET.BENCH, ANT);
  path([
    [cutAnt, ANT],
    [cutLock - 0.02, ANT2],
  ]);
  st(t.antenne, 0.3, { litAnt: 1 });
  st(t.ecoute, 0.4, { listen: 1 }, "sine.out");
  const cAnt = co.add({ title: "Antenne", x: 600, y: 590, align: "start", tone: "system", anchor: A.antenna });
  cAnt.show(tl, t.antenne + 0.04).hide(tl, cutLock - 0.28);

  /* ───────────── « Un verrou, la sécurité-armement. » ───────────── */
  // the cut lands on the lock; from here ONE move to the end of the act
  cut(cutLock, SET.BENCH, LOCK);
  now(cutLock, { litAnt: 0, listen: 0 });
  st(t.verrou, 0.3, { litLock: 1 });
  st(t.securite, t.securiteEnd - 0.1 - t.securite, { arm: 1 }, "power2.inOut");
  const cLock = co.add({ title: "Sécurité-armement", x: 520, y: 590, align: "start", tone: "system", anchor: A.lock });
  cLock.show(tl, t.securite).hide(tl, t.detonateur - 0.3);

  /* ───────────── « Un détonateur. » — it lights, then fires ───────────── */
  st(t.detonateur, 0.3, { litLock: 0, litDet: 1 });
  const cDet = co.add({ title: "Détonateur", x: 600, y: 590, align: "start", tone: "system", anchor: A.det });
  cDet.show(tl, t.detonateur + 0.04).hide(tl, t.cordeau - 0.3);
  // in the breath after its word: the detonator fires. `fire` jumps past the decor's full flash (0.04 → 0.16): the flash
  // starts at about half and fades in ≈ 0.3 s as the head leaves along the cord — the cylinder stays readable
  now(t.cordeau - 0.25, { fire: 0.22 });

  /* ───────────── « Un cordeau qui file le long de la coque… et au bout… » — the camera follows the head ───────────── */
  st(t.cordeau, 0.3, { litDet: 0, litCord: 1 });
  st(t.cordeau - 0.24, t.bout - (t.cordeau - 0.24), { fire: 0.6 }, "none");
  const cCord = co.add({ title: "Cordeau", x: 600, y: 590, align: "start", tone: "system", anchor: A.cord });
  cCord.show(tl, t.cordeau + 0.04).hide(tl, t.charge - 0.3);

  /* ───────────── « …la charge +linéaire+. » — alone ───────────── */
  st(t.charge, 0.3, { litCord: 0, litCharge: 1 });
  st(t.charge - 0.2, 0.7, { solo: 1 }, "sine.inOut");
  const cCharge = co.add({ title: "Charge linéaire", x: 540, y: 590, align: "start", tone: "system", anchor: A.charge });
  cCharge.show(tl, t.charge + 0.04).hide(tl, t.pourquoi - 0.1);
  punch(t.lineaire, 0.06);

  /* ───────────── « Pourquoi ça tranche ? » — its end opens ───────────── */
  st(t.pourquoi + 0.3, 0.6, { litCharge: 0.4 }, "sine.inOut");
  // the back half goes at once, on the swish of the dive (a reveal on the move): never a ghost of it
  now(t.trancheEnd + 0.09, { section: 1 });

  /* ───────────── « Pliée en V, doublée de cuivre, » ───────────── */
  st(t.V - 0.04, 0.16, { litCharge: 1 }, "power2.out"); //   the V: its outline lights…
  st(t.V + 0.4, 0.4, { litCharge: 0.4 }, "sine.inOut"); //    …and settles
  st(t.cuivre - 0.04, 0.4, { jet: 0.14 }, "sine.out"); //   the copper: its inner face lights
  const cCu = co.add({ title: "Cuivre", x: 600, y: 590, align: "start", tone: "system", anchor: A.section });
  cCu.show(tl, t.cuivre + 0.04).hide(tl, t.detone + 0.3);

  /* ───────────── « elle détone à plus de 7 000 mètres par seconde… » — the front runs out of the cut face ───────────── */
  now(t.elle, { fire: 0.79 }); //  the front's way through the hidden half (x < cut): not seen
  st(t.detone, t.seconde - 0.5 - t.detone, { fire: 1 }, "none");

  /* ───────────── « …et lance un jet de métal qui coupe jusqu'à deux centimètres d'+acier+. » ───────────── */
  st(t.seconde - 0.3, 0.9, { plate: 1 }, "sine.inOut"); //   the plate rises under the charge (at 1 before jet 0.5)
  st(t.jet - 0.08, 0.5, { jet: 0.5 }, "sine.in"); //        the jet forms, quickly
  st(t.coupe, 1.3, { jet: 1 }, "sine.out"); //               …and goes through: the plate opens
  chip("chip-acier", null, 96, 470, t.coupe + 0.5, t.torepos - 0.22);
  punch(t.acier, 0.06, { hold: 0.12, down: 0.3 });

  path([
    [cutLock, LOCK],
    [t.securiteEnd - 0.25, LOCK2],
    [t.detonateur + 0.35, DET],
    [t.cordeau + 0.15, CORD0],
    [t.bout - 0.3, CORD1],
    [t.lineaire + 0.05, CHARGE],
    [t.pourquoi + 0.45, DIVE],
    [t.V + 0.15, SECTION],
    [t.elle - 0.05, SECTION2],
    [t.detone + 0.6, BLAST],
    [t.seconde - 0.2, BLAST2],
    [t.jet + 0.15, JET],
    [t.coupe + 0.5, PLATE],
    [t.torepos, PLATE2],
  ]);
}
