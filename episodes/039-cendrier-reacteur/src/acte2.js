// 02 · AUTOPSIE (1/2) — from « …on l'ouvre. » to the cut of the principle (tobench → toprincipe).
//
// Act 1 ends on the plunge over the plug, the pit full of melt. On « on » the picture cuts IN PLACE to the bench:
// the same plug at the same place of the frame, cold, its ring faint veille — the building, the vessel's heat and
// the melt are gone. The system comes apart and the camera pulls back with it (it leads: the lifting pit never comes
// at the lens) to the whole exploded view: the vessel lifted in pale glass, the pit, the plug, the channel, the
// chamber, the pool — on the halo. Then it follows the melt's way, piece by piece, each on its word:
//   « La fosse, en béton sacrificiel » the lining lights up · « fait pour être mangé » its face recedes and crumbles
//   « Au centre, la porte fusible »    the camera goes down to the plug, its ring lights up
//   « Puis un canal »                  it runs along the channel, the way the melt will flow
//   « Et au bout… la chambre »         it comes out over the chamber, which lights up
//   « À sec. »                         it pulls back: the chamber empty and, apart, up there, the water in its pool.
// Hands over at `toprincipe` with the view still exploded over the chamber; act 2b cuts to the chamber assembled.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED } from "./world.js";

const P = { fov: 34, side: 0, roll: 0, drift: 0.3, dof: 0 };
const CLOSE = { dof: VIEW.plugTop.dof };
// the cut to the bench: the plug at the same place of the frame as act 1's plunge (same aim, same shift), but from
// further and lower, sharp: the cold pit on the halo, its ring — not its floor filling the lens (retouche 05/11)
const OPEN = { ...P, tx: 0, ty: 0, tz: 0, d: 2400, az: VIEW.plugTop.az, el: 40, shift: VIEW.plugTop.shift };
// the whole exploded view, kept out of the captions and of the buttons on the right (retouche 05/11)
const EXPL = { ...VIEW.exploded, d: 10400, el: 22, shift: 320, side: 20 };

/* ── where the parts stand at explode 1 (model.js SPREAD, batiment.js LIFT) ── */
// the pit (lifted 480): its lining seen through the cut wedge, from a little above
const PIT_IN = { ...P, tx: 0, ty: 680, tz: 0, d: 3700, az: -28, el: 18, shift: 60 };
const PIT_NEAR = { ...PIT_IN, ty: 640, d: 2600, el: 22 };
// the plug (lifted 160), out under the pit's floor: a close-up
const PLUG_EX = { ...P, ...CLOSE, tx: 0, ty: 120, tz: 0, d: 1150, az: -30, el: 26, shift: 40 };
// the channel (moved 60 toward the chamber), along it in the melt's way
const CHAN_A = { ...P, tx: 0, ty: -270, tz: 220, d: 1700, az: -36, el: 34, shift: 0 };
const CHAN_B = { ...P, tx: 0, ty: -310, tz: 700, d: 1900, az: -32, el: 38, shift: 0 };
// the chamber (moved 380 forward), from above at its far end
const CHAMBER_EX = { ...P, tx: 0, ty: -330, tz: 1980, d: 3600, az: -22, el: 44, fov: 36, shift: 80 };
// « À sec » : the chamber, and the pool apart, up there, in the same frame
// (retouche 05/11: from higher, the water's surface seen, the pool's top clear of the header)
const DRY = { ...P, tx: 500, ty: 0, tz: 1500, d: 8000, az: -24, el: 52, fov: 34, shift: -290, side: 30 };

/* ── the light: what it stands around, how wide ── */
const L_PLUG0 = { fx: 0, fy: 0, fz: 0, fs: 300 };
const L_WIDE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: 1800 };
const L_PIT = { fx: 0, fy: 690, fz: 0, fs: 700 };
const L_PLUG = { fx: 0, fy: 115, fz: 0, fs: 220 };
const L_CHAN = { fx: 0, fy: -295, fz: 435, fs: 600 };
const L_CHAMBER = { fx: 0, fy: -330, fz: 1980, fs: 1500 };
const L_DRY = { fx: 300, fy: 200, fz: 1000, fs: 2600 };

export default function acte2({ D, world, co }) {
  const { tl, st, cut, path, punch } = D;
  const A = world.system.A;
  const t = D.times({
    tobench: "tobench", explode: "explode",
    fosse: "fosse", beton: "eclate:béton", mange: "mange",
    centre: "eclate:centre", porte: "eclate:porte", fusible: "fusible",
    puis: "eclate:Puis", canal: "canal", bout: "eclate:bout", chambre: "chambre", sec: "sec",
    toprincipe: "toprincipe",
  });
  setAct(tl, 2, t.tobench);

  /* ───────────── « …on l'ouvre. » — the same plug, on the bench, at the same place; it all comes apart ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: OPEN,
    state: { ...BENCHED, litPlug: 0.6, ...L_PLUG0 }, pool: BENCHED.pool, grid: BENCHED.grid,
  });
  // the camera leads: the pull-back starts on the cut, the parts leave on « l'ouvre » and the pit only rises once the
  // camera is ≈ 15 m away (from the plunge, the rising pit floor would otherwise fill the lens: a beige wall)
  const lift = t.explode + 0.16;
  st(lift, 0.95, { explode: 1 }, "sine.inOut");
  const wideAt = t.tobench + 0.03;
  const wideEnd = t.fosse - 0.36;
  st(wideAt, wideEnd - wideAt, L_WIDE, "sine.inOut");
  st(lift, 0.6, { litPlug: 0 }, "sine.inOut");

  // PLAN-SÉQUENCE (retouche 06/11) : ONE move from the cut on the bench to the cut before « À sec », through every
  // part on its word, never braking on a pose (it was seven shots in sine.inOut, each stopping on its pose). Each key
  // turns round the parts (6 to 17° of az or el from the one before): the parallax, not a picture that grows.
  const dryAt = t.sec - 0.3;
  path([
    [t.tobench, bench], //                                       the cut: the plug at the same place of the frame
    [wideEnd, EXPL], //                                          the whole exploded view (az −18), the pit risen
    [t.beton + 0.1, { ...PIT_IN, az: -23 }], //                  « béton » : the lining, through the cut wedge
    [t.mange, { ...PIT_NEAR, az: -31, el: 25 }], //              « mangé » : closer and round it, the face eaten
    [t.centre + 0.1, { tx: 0, ty: 250, d: 2300, az: -34, el: 32, shift: 50, dof: 0 }], // « centre » : over the hole
    [t.porte + 0.2, { ...PLUG_EX, az: -37 }], //                 « porte fusible » : down to the plug, close
    [t.canal, CHAN_A], //                                        « canal » : along it, from higher
    [t.bout, { ...CHAN_B, az: -29 }], //                         « au bout » : the melt's way, toward the chamber
    [t.chambre + 0.05, CHAMBER_EX], //                           « chambre » : out over it
    [dryAt, { ...CHAMBER_EX, d: 3450, az: -14, el: 49 }], //    on round it, still moving into the cut
  ]);

  /* ───────────── « La fosse, en béton sacrificiel : fait pour être mangé. » ───────────── */
  const pitAt = wideEnd + 0.12;
  st(pitAt, 1.0, L_PIT, "sine.inOut");
  st(t.fosse, 0.4, { litPit: 1 }, "sine.out");
  const cPit = co.add({ title: "Béton sacrificiel", x: 96, y: 480, align: "start", tone: "system", anchor: A.pit });
  cPit.show(tl, t.beton - 0.3);
  st(t.mange - 0.1, 0.8, { eaten: 0.7 }, "sine.out");
  cPit.hide(tl, t.centre - 0.3);

  /* ───────────── « Au centre, la porte fusible. » — down to the plug ───────────── */
  const plugAt = t.centre - 0.25;
  st(plugAt, t.porte + 0.25 - plugAt, L_PLUG, "sine.inOut");
  st(plugAt, 0.4, { litPit: 0 }, "sine.inOut");
  st(t.porte - 0.05, 0.35, { litPlug: 1 }, "sine.out");
  const cPlug = co.add({ title: "Porte fusible", x: 96, y: 480, align: "start", tone: "system", anchor: A.plug });
  cPlug.show(tl, t.porte - 0.3);
  cPlug.hide(tl, t.puis - 0.4); // gone before the plug leaves the top of the frame

  /* ───────────── « Puis un canal. » — along it, the way the melt will run ───────────── */
  const chanAt = t.puis - 0.15;
  st(chanAt, t.canal - chanAt, L_CHAN, "sine.inOut");
  st(t.puis - 0.1, 0.4, { litPlug: 0 }, "sine.inOut");
  st(t.canal - 0.12, 0.35, { litChannel: 1 }, "sine.out");
  const cChan = co.add({ title: "Canal", x: 96, y: 480, align: "start", tone: "system", anchor: A.channel });
  cChan.show(tl, t.canal - 0.3);
  cChan.hide(tl, t.bout - 0.05);

  /* ───────────── « Et au bout… la chambre d'étalement. » — out over the chamber ───────────── */
  const chamberAt = t.bout - 0.1;
  st(chamberAt, t.chambre - chamberAt, L_CHAMBER, "sine.inOut");
  st(t.bout + 0.1, 0.5, { litChannel: 0 }, "sine.inOut");
  st(t.chambre - 0.08, 0.4, { litChamber: 1 }, "sine.out");
  const cChamber = co.add({ title: "Chambre d'étalement", x: 96, y: 480, align: "start", tone: "system", anchor: A.chamber });
  cChamber.show(tl, t.chambre - 0.3);
  cChamber.hide(tl, t.sec - 0.65);

  /* ───────────── « À sec. » — the chamber empty and, apart, the water in its pool ───────────── */
  // a cut a few frames before « À » (a pull-back from the chamber swept the pool through the header); on both sides
  // the camera turns the same way (az rising), so the eye reads one travelling through the cut
  st(t.chambre + 0.1, dryAt - (t.chambre + 0.1), L_DRY, "sine.inOut");
  const DRY_IN = { ...DRY, d: 8800, az: -27, el: 46 };
  cut(dryAt, SET.BENCH, DRY_IN);
  path([[dryAt, DRY_IN], [t.toprincipe, DRY]]);
  st(t.sec - 0.05, 0.4, { litPool: 0.8 }, "sine.out");
  punch(t.sec, 0.06, { hold: 0.2, down: 0.45 });
}
