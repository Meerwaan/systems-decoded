// 02 · AUTOPSIE — from the cut to the bench to the cut of act 3 (tobench → tozero).
//
// Act 1 holds VIEW.lane, the world frozen (`freeze`), through « Alors… ». Just before « on » the mountain, the road and
// the truck go out: the same lane stands on its bench, in place (benchCut, origin benchOrigin(RUN.freeze)). On « on » it
// comes apart (explode) while the camera settles behind the sign, the whole row climbing the frame. Then each part the
// voice names has its frame, its light (veille, on the word) and its label; its click is in the breath after (sfx):
//   « Un panneau, bien avant » — a push to the sign, its chequers alight ;
//   « Puis la voie quitte la route » — up over the access, the wedge leaving the road's ribbon ;
//   « une fosse de gravier, une glissière de béton… » — high on the left: the gravel slab over its empty pit, the
//   barrier lifted beyond it ; « et au bout, une butte de terre » — the camera turns to the end of the row.
// At eclate$ every part glows together (the cover). « Dans la fosse » — the gravel drops back into its pit while the
// camera dives to the bed's head; « des grains ronds » — a cut-in, the round grains one by one. « Exprès : » — a cut
// to the comparison from behind the bed's head: the right half turns crushed, two wheels; on « arrêtent » they roll,
// the round one stops on « court », the crushed one runs on to « concassés ». « Ronds, ils roulent sous la roue… » —
// the dive to the hero wheel, the cut-away opens, the grains roll under it; « qui s'enfonce » — it sinks.
// « Et ton camion arrive à quatre-vingt-dix » — a cut matched on the wheel: the same pose about the hub, from the bench
// to the truck, and time runs again (s → RUN.zero). The threshold does not stop the film: the camera is already
// swinging round behind the front wheel, looking down the road where the lane comes (VIEW.entry): « regarde-les
// s'enfoncer ». Act 3 cuts from there.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED, RUN, KMH, SIZE, TILT, HUB_FL, benchOrigin, benchPoint, frame } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
/** A pose on the bench from where the camera stands and where it looks, both in the lane's own frame. */
const onBench = (cam, aim, rest) => frame(benchPoint(...cam), benchPoint(...aim), { ...P, ...rest });
/** The light over a point of the lane on the bench, `fs` wide. */
const lit = (x, y, z, fs) => {
  const [fx, fy, fz] = benchPoint(x, y, z);
  return { fx, fy, fz, fs };
};

/* ── the frames (seen on planches, docs/journal/027-acte2.md) ── */
// behind the sign, high: the exploded row climbing the frame (road ribbon, access, pit and its slab, the barrier)
const ROW = onBench([-1500, 2600, 9800], [-150, 300, 2000], { fov: 36, shift: 110 });
// the sign, lifted, its chequers alight (« Un panneau, bien avant »)
const SIGN = onBench([-900, 1300, 7000], [-140, 600, 5200], { fov: 30, shift: 110 });
// over the access: the wedge that leaves the road's ribbon
const ACCESSV = onBench([-1800, 2300, 5200], [-150, 230, 1200], { fov: 34, shift: 110 });
// high on the left: the gravel slab over its empty pit, the barrier lifted beyond (« une fosse… une glissière… »)
const PIT = onBench([-7000, 6000, 2500], [0, 300, -1200], { fov: 34, shift: 110 });
// the same place, turned to the end of the row: the berm (« et au bout, une butte de terre »)
const END = onBench([-6500, 6000, -2500], [0, 500, -6000], { fov: 34, shift: 110 });
// diving to the bed's head, where the macro is (« Dans la fosse »)
const INTO = onBench([-700, 900, 800], [-110, 0, -400], { fov: 30, shift: 80 });
const GRAINS = VIEW.grains;
const DEMO = VIEW.demo;
const SECTION = VIEW.section;
// the hero wheel on the bench at the end of the act (benchS 8.4, sink 1) and the same wheel on the truck (its hub,
// tilted with the truck, around the truck as it stands on the first frame: [r])
const BENCH_WHEEL = benchPoint(-110, 53 - 35, -840);
const HUB = [HUB_FL[0], HUB_FL[1] * Math.cos(TILT) - HUB_FL[2] * Math.sin(TILT), HUB_FL[1] * Math.sin(TILT) + HUB_FL[2] * Math.cos(TILT)];
const WHEEL_R = moved(SECTION, BENCH_WHEEL, HUB);

// the light
const L_WHOLE = { ...lit(0, 0, -1000, SIZE) };
const L_SIGN = lit(-140, 600, 5200, 600);
const L_ACCESS = lit(-150, 230, 1500, 1500);
const L_GRAINS = lit(-110, 0, -400, 40);
const L_DEMO = lit(0, 0, -1100, 900);
const L_WHEEL = lit(-110, 18, -840, 150);
const L_HUB = { fx: HUB[0], fy: HUB[1], fz: HUB[2], fs: 150 };
const L_FRONT = { fx: -60, fy: 110, fz: -100, fs: 700 };

export default function acte2({ D, co, world }) {
  const { tl, st, shot, cut, punch } = D;
  const A = world.lane.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    panneau: "panneau", access: "access", fosse: "fosse", gravier2: "gravier2", glissiere: "glissiere",
    bout: "bout", butte: "butte", eclateEnd: "eclate$",
    torepos: "torepos", ronds: "ronds", expres: "expres", arretent: "arretent", court: "court", concasses: "concasses",
    ronds2: "ronds2", roulent: "roulent", enfonce2: "enfonce2",
    toarrive: "toarrive", seuil: "seuil", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);
  const label = (title, anchor, from, to, tone = "system", x = 96, y = 480, align = "start") => {
    const c = co.add({ title, x, y, align, tone, anchor });
    c.show(tl, from);
    c.hide(tl, to);
  };

  /* ───────────── « …on l'ouvre. » — the same lane on the bench, in place; on « on » it comes apart ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.lane, origin: benchOrigin(RUN.freeze), state: { ...BENCHED, ...L_WHOLE } });
  st(t.explode, 0.9, { explode: 1 }, "power2.out");
  const toRow = t.panneau - 0.25;
  shot(t.tobench + 0.02, toRow - (t.tobench + 0.02), ROW, "sine.inOut", bench.d);

  /* ───────────── « Un panneau, bien avant. » ───────────── */
  shot(toRow, t.access - 0.1 - toRow, SIGN, "sine.inOut", ROW.d);
  st(toRow, 0.9, L_SIGN, "sine.inOut");
  st(t.panneau + 0.05, 0.3, { litPanel: 1 }, "sine.out");
  label("Panneau", A.panel, t.panneau + 0.1, t.access - 0.05);

  /* ───────────── « Puis la voie quitte la route : » ───────────── */
  const toAccess = t.access - 0.1;
  shot(toAccess, t.fosse - 0.2 - toAccess, ACCESSV, "sine.inOut", SIGN.d);
  st(toAccess, 1, L_ACCESS, "sine.inOut");
  st(t.access + 0.1, 0.4, { litPanel: 0.3 }, "sine.inOut");
  st(t.access + 0.3, 0.3, { litAccess: 1 }, "sine.out");
  label("Accès", A.access, t.access + 0.42, t.fosse - 0.42);

  /* ───────────── « une fosse de gravier, une glissière de béton… » ───────────── */
  const toPit = t.fosse - 0.4;
  shot(toPit, t.glissiere - toPit, PIT, "sine.inOut", ACCESSV.d);
  st(toPit, 1, L_WHOLE, "sine.inOut");
  st(t.fosse, 0.4, { litAccess: 0.3 }, "sine.inOut");
  st(t.gravier2 - 0.05, 0.3, { litGravel: 1 }, "sine.out");
  label("Fosse de gravier", A.gravel, t.gravier2, t.glissiere - 0.05);
  st(t.glissiere + 0.05, 0.3, { litRail: 1 }, "sine.out");
  st(t.glissiere + 0.1, 0.4, { litGravel: 0.4 }, "sine.inOut");
  label("Glissière béton", A.rail, t.glissiere + 0.16, t.bout - 0.1);

  /* ───────────── « et au bout, une butte de terre. » — then every part together (the cover: eclate$) ───────────── */
  // the camera already turns along the barrier toward the end of the row (a slow pan: the bench's grid never
  // slides more than a tenth of a cell per frame)
  const toEnd = t.glissiere + 0.1;
  shot(toEnd, t.butte - 0.05 - toEnd, END, "sine.inOut", PIT.d);
  st(t.bout, 0.4, { litRail: 0.3 }, "sine.inOut");
  st(t.butte - 0.05, 0.3, { litBerm: 1 }, "sine.out");
  label("Butte de terre", A.berm, t.butte + 0.02, t.eclateEnd + 0.04);
  st(t.eclateEnd - 0.4, 0.4, { litPanel: 1, litAccess: 1, litGravel: 1, litRail: 1 }, "sine.inOut");

  /* ───────────── « Dans la fosse, » — the gravel drops back; the dive to the bed's head ───────────── */
  const dive = t.eclateEnd + 0.05;
  const toGrains = t.ronds - 0.35; // the cut-in, on « grains »
  shot(dive, toGrains - dive, INTO, "sine.inOut", END.d);
  st(dive, toGrains - dive, L_DEMO, "sine.inOut");
  st(t.torepos, 0.9, { explode: 0 }, "sine.inOut");
  st(t.torepos, 0.5, { litPanel: 0, litAccess: 0, litRail: 0, litBerm: 0 }, "sine.inOut");

  /* ───────────── « des grains ronds. » — the round grains, one by one ───────────── */
  cut(toGrains, SET.BENCH, GRAINS, { ...L_GRAINS, litGravel: 1 });
  const toDemo = t.expres - 0.1;
  shot(toGrains, toDemo - toGrains, { ...GRAINS, d: GRAINS.d * 0.86 }, "sine.inOut");
  punch(t.ronds + 0.1, 0.06, { hold: 0.12, down: 0.26 }); // « ronds » — it has let go before the cut

  /* ───────────── « Exprès : ils arrêtent plus court que des grains concassés. » ───────────── */
  cut(toDemo, SET.BENCH, DEMO, { ...L_DEMO, wheelIn: 1, crushed: 0, benchS: 0, twinS: 0, sink: 0, litGravel: 0 });
  st(toDemo + 0.03, 0.75, { crushed: 1 }, "power2.out");
  shot(toDemo, t.ronds2 - 0.15 - toDemo, { ...DEMO, d: DEMO.d * 0.9 }, "sine.inOut");
  const go = t.arretent + 0.06;
  st(go, t.court + 0.32 - go, { benchS: 8 }, "power1.out"); //   the round one stops on « court »
  st(go, t.concasses + 0.62 - go, { twinS: 20 }, "power1.out"); // the crushed one runs on to « concassés »
  st(go, 0.7, { sink: 0.5 }, "sine.out");
  label("Ronds", A.benchWheel, t.court + 0.05, t.ronds2 - 0.2, "system", 96, 900);
  label("Concassés", A.twin, t.concasses + 0.1, t.ronds2 - 0.2, null, 984, 640, "end");

  /* ───────────── « Ronds, ils roulent sous la roue… qui s'enfonce. » — the cut-away ───────────── */
  const toSection = t.ronds2 - 0.15;
  // 78° of turn in 1.6 s: under a quarter of a turn per second at its fastest
  const atSection = t.roulent + 0.8;
  // 22/10, after the draft's qa (17.5 at 36.1 s): at its fastest the turn ran ≈ 77°/s — now a cut on « Ronds », on the
  // same wheel, and a slow push in
  cut(toSection, SET.BENCH, { ...SECTION, d: SECTION.d * 1.1 }, { ...L_WHEEL });
  shot(toSection, atSection - toSection, SECTION, "sine.inOut");
  st(t.ronds2 + 0.1, 0.8, { section: 1 }, "sine.inOut");
  st(t.roulent, t.enfonce2 - t.roulent, { benchS: 8.4 }, "sine.inOut");
  st(t.enfonce2 + 0.08, 0.45, { sink: 1 }, "power2.out");
  punch(t.enfonce2 + 0.1, 0.06, { hold: 0.16, down: 0.4 }); // « s'enfonce » — let go before toarrive

  /* ───────────── « Et ton camion arrive à quatre-vingt-dix. » — matched on the wheel, time runs again ───────────── */
  cut(t.toarrive, SET.SCENE, WHEEL_R, { ...STAGED, s: RUN.freeze, kmh: KMH, pedal: 1, heat: 1, sink: 0, steer: 0, ...L_HUB });
  st(t.toarrive, t.tozero - t.toarrive, { s: RUN.zero }, "none");
  // the camera swings round behind the front wheel, low, looking down the road where the lane comes — through the
  // threshold: the film does not stop for it (« regarde-les s'enfoncer »)
  const swing = t.toarrive + 0.12;
  shot(swing, t.tozero - 0.05 - swing, VIEW.entry, "sine.inOut", WHEEL_R.d);
  st(swing, 2.2, L_FRONT, "sine.inOut");

  /* ───────────── the threshold — « Abonne-toi : tes quarante tonnes… regarde-les s'enfoncer. » ───────────── */
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
}
