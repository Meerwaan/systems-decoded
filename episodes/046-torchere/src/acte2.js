// 02 · AUTOPSIE — from « Alors… » to the cut of act 3 (tobench → tozero).
//
// Act 1 leaves the stack's foot and its seal, close (VIEW.foot). On « on » the plant is gone and the same network
// stands on the bench in place (benchCut): the valves and the tip lift, the drum, the seal and the stack open in
// section, and the camera pulls back to the whole network. Then the gas path, part by part, on its words: the three
// valves from the plant's side (+x: in front of their columns), the heads converging into ONE pipe; the camera
// follows the header and the head reaches the drum on « ballon »; the liquid falls out in the open drum; « sinon il
// pleuvrait du feu »: wide, the flame swells over the tip and rains; then the dive to the end of the path, the water
// seal, the heart. The principle: up the open stack to the tip; « sans air »: the air's arrows come down at the tip;
// « un filet de gaz monte »: from the foot, the camera climbs WITH the purge; « l'air reste dehors »: the arrows are
// pushed back and gone. The rest: the network closes, the plant comes back round it, asleep at dusk; the dive to its
// tiny flame; « ta raffinerie… »: the whole plant; « perd un compresseur »: the compressor, its rotor stops dead.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, FLOWAT, KO, SEAL } from "./world.js";


/* ── on the bench (in place) ── */
const EXPL = VIEW.exploded;
// the three valves in a receding row (from +z: no pose holds the three big — they stand 15 m apart), the manifold
// under them, the columns faint glass beside; the drum out of the way to the right
const VALV = { ...VIEW.valves, tx: -1900, ty: 1300, tz: 0, d: 4000, az: -14, el: 14, fov: 30, shift: 40 };
// the header leaving the manifold toward the drum, followed on to the drum without a cut (the head of gas runs in it)
const COLL = { ...VIEW.valves, tx: -1500, ty: 600, tz: 0, d: 2700, az: -22, el: 15, fov: 30, shift: 120, dof: 0 };
const DRUM = VIEW.drum;
const DRUM_IN = { ...DRUM, d: DRUM.d * 0.88, az: DRUM.az + 6 };
// the network and the flame over its lifted tip in one frame: the rain of fire (flamme.js journal)
const RAIN = { ...EXPL, ty: 1500, shift: 20, az: -28 };
// the seal from further round (az −60): from VIEW.seal's side the purge at the stack's foot glares behind it
const SEALV = { ...VIEW.seal, d: 1450, az: -60 };
const SEAL_IN = { ...SEALV, d: SEALV.d * 0.95, az: SEALV.az - 5 };
// the tip, wide enough for the air's arrows (they come down from 3 m over it) under the header; the network is
// closed again by then (explode 0: the flames are not lifted with the tip, model.js)
const TIPB = { tx: -40, ty: 2050, tz: 30, d: 1700, az: -50, el: -4, fov: 32, shift: 220, side: 0, roll: 0, drift: 0.3, dof: 0 };
const TIPB2 = { ...TIPB, az: -58, d: 1600 };
// half-way up the open stack: the climb passes here at speed (the purge inside it)
const STACKMID = { tx: 0, ty: 1150, tz: 0, d: 1300, az: -40, el: 2, fov: 32, shift: 140, side: 0, roll: 0, drift: 0.3, dof: 0 };
// the stack's foot, looking up the open stack (the purge rises from here)
const FOOTUP = { tx: 0, ty: 520, tz: 0, d: 1150, az: -48, el: 2, fov: 32, shift: 160, side: 0, roll: 0, drift: 0.3, dof: 0 };
const TIPB3 = { ...TIPB, az: -64, el: -2, d: 1650 };
// the whole plant under the stack (VIEW.flare): the bench pulls back to it, and the scene comes back round it in place
const WHOLEB = VIEW.flare;

/* ── back in the scene, at rest ── */
const WHOLE_S = { ...VIEW.flare, d: VIEW.flare.d * 0.95, az: VIEW.flare.az + 4 };
const TIPS = { ...VIEW.tip, d: 900, az: -55, el: -8 };
// « ta raffinerie… »: its columns and the plant behind them, calm
const PLANT = VIEW.columns;
const COMP = VIEW.compressor;
const COMP_IN = { ...COMP, d: COMP.d * 0.92, az: COMP.az - 4 };

// the light: what it stands around, and how wide
const L = {
  all: { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs },
  valves: { fx: -1900, fy: 1000, fz: 0, fs: 1100 },
  drum: { fx: KO.at[0], fy: KO.at[1], fz: 0, fs: 800 },
  seal: { fx: SEAL.at[0], fy: 250, fz: SEAL.at[1], fs: 420 },
  tip: { fx: 0, fy: 1950, fz: 0, fs: 260 },
  stack: { fx: 0, fy: 1100, fz: 0, fs: 700 },
  plant: { fx: -1000, fy: 800, fz: 0, fs: 3200 },
  tipS: { fx: 0, fy: 1950, fz: 0, fs: 200 },
  comp: { fx: -1650, fy: 260, fz: 1250, fs: 1500 },
};

export default function acte2({ D, world, co }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode", toutes: "eclate", soupapes: "soupapes", debouchent: "eclate:débouchent",
    collect: "collect", ballon: "ballon", retient: "eclate:retient", sinon: "eclate:sinon", pleuvrait: "eclate:pleuvrait",
    feu: "feu", et: "eclate:Et", coeur: "coeur", toprincipe: "toprincipe", sansair: "sansair", air: "principe:air", alors: "principe:Alors",
    filet: "filet", torche: "principe:torche", lair: "principe:reste", dehors: "dehors", torepos: "torepos", dort: "dort",
    presque: "repos:Presque", minuscule: "minuscule", puis: "repos:Puis", perd: "repos:perd", stop: "stop", tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── « …on l'ouvre. » — the same network on the bench, in place; it comes apart ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.foot, state: { ...BENCHED } });
  st(t.explode, 1.2, { explode: 1, section: 1 }, "power2.out");
  shot(t.tobench + 0.02, t.toutes - t.tobench - 0.75, EXPL, "sine.inOut", bench.d);
  shot(t.toutes - 0.73, 0.6, { ...EXPL, d: EXPL.d * 0.97, az: EXPL.az + 2 }, "sine.inOut");

  /* ───────────── « Toutes les soupapes débouchent dans un seul tuyau : » ───────────── */
  const cutV = t.toutes - 0.12;
  cut(cutV, SET.BENCH, VALV, { ...L.valves });
  shot(cutV, t.collect - cutV, { ...VALV, d: VALV.d * 0.9, az: VALV.az - 6 }, "sine.inOut");
  st(t.soupapes, 0.5, { relief: 1, litValves: 1 }, "power2.out");
  st(t.debouchent, t.collect - t.debouchent, { flow: FLOWAT.header }, "sine.inOut");
  const cV = co.add({ title: "Soupapes", x: 96, y: 520, align: "start", tone: "system", anchor: A.valve1 });
  cV.show(tl, t.soupapes + 0.05);
  cV.hide(tl, t.collect - 0.3);

  /* ───────────── « le collecteur. » — followed toward the drum, the head runs in it ───────────── */
  const cutD = t.ballon - 0.28; // the label leaves before « Un ballon »
  shot(t.collect - 0.3, 0.7, COLL, "sine.in");
  shot(t.collect + 0.4, t.ballon - t.collect - 0.4, DRUM, "sine.out");
  st(t.collect, 0.4, { litHeader: 1 }, "sine.out");
  st(t.collect, t.ballon - t.collect, { flow: FLOWAT.drum }, "none");
  st(t.collect - 0.3, t.ballon - t.collect + 0.3, { ...L.drum }, "sine.inOut");
  punch(t.collect, 0.06);
  const cC = co.add({ title: "Collecteur", x: 96, y: 520, align: "start", tone: "system", anchor: A.header });
  cC.show(tl, t.collect + 0.05);
  cC.hide(tl, cutD - 0.28);

  /* ───────────── « Un ballon y retient le liquide : » — the drum open, the liquid falls out ───────────── */
  shot(t.ballon, t.sinon - t.ballon, DRUM_IN, "sine.inOut");
  st(t.ballon, 0.4, { litDrum: 1 }, "sine.out");
  st(t.ballon, t.sinon - t.ballon, { flow: FLOWAT.drumOut }, "sine.out");
  st(t.retient - 0.1, 1.1, { liquid: 0.8 }, "sine.out");
  const cB = co.add({ title: "Ballon", x: 96, y: 520, align: "start", tone: "system", anchor: A.drum });
  cB.show(tl, t.ballon + 0.05);
  cB.hide(tl, t.sinon - 0.1);

  /* ───────────── « sinon, il pleuvrait du feu. » — wide: the flame over the tip, raining ───────────── */
  shot(t.sinon - 0.08, t.pleuvrait - t.sinon + 0.25, RAIN, "sine.inOut", DRUM_IN.d);
  st(t.sinon - 0.08, t.pleuvrait - t.sinon + 0.25, { ...L.all }, "sine.inOut");
  st(t.sinon + 0.1, t.pleuvrait - t.sinon, { flare: 0.7 }, "power2.out");
  st(t.pleuvrait, 0.3, { drip: 1 }, "sine.out");
  punch(t.feu, 0.06, { hold: 0.1, down: 0.3 });
  st(t.feu + 0.35, 0.5, { flare: 0.08 }, "sine.inOut");
  st(t.feu + 0.45, 0.5, { drip: 0 }, "sine.in");

  /* ───────────── « Et au bout… la garde hydraulique. » — the dive to the end of the path: the heart ───────────── */
  shot(t.et - 0.1, t.coeur - t.et + 0.1, SEALV, "sine.inOut", RAIN.d);
  st(t.et - 0.1, t.coeur - t.et + 0.1, { ...L.seal }, "sine.inOut");
  shot(t.coeur, t.toprincipe - t.coeur, SEAL_IN, "sine.inOut");
  st(t.et + 0.4, 0.8, { bubbles: 1 }, "sine.out");
  st(t.coeur, 0.4, { litSeal: 1 }, "sine.out");
  chip("chip-garde", null, 96, 470, t.coeur, t.toprincipe - 0.15);

  /* ───────────── « Pourquoi le feu ne redescend pas dans l'usine ? » — up the open stack ───────────── */
  const mid = (t.toprincipe + t.sansair) / 2;
  shot(t.toprincipe, mid - t.toprincipe, STACKMID, "sine.in", SEAL_IN.d);
  shot(mid, t.sansair - 0.05 - mid, TIPB, "sine.out", STACKMID.d);
  st(t.toprincipe, t.sansair - t.toprincipe, { ...L.tip }, "sine.inOut");
  st(t.toprincipe, 0.5, { litStack: 1, litSeal: 0, litValves: 0, litHeader: 0, litDrum: 0 }, "sine.inOut");
  st(t.toprincipe, 1.2, { explode: 0 }, "sine.inOut"); // the valves and the tip come home (out of frame): the flames sit on the tip again

  /* ───────────── « Sans air, le gaz ne brûle pas. » — the air comes down at the tip ───────────── */
  shot(t.sansair - 0.05, t.alors - t.sansair - 0.07, TIPB2, "sine.inOut");
  st(t.air - 0.1, 0.5, { air: 1 }, "sine.out");

  /* ───────────── « Alors, 24 h sur 24, un filet de gaz monte dans la torche : » — up WITH the purge ───────────── */
  const cutF = t.alors - 0.12;
  cut(cutF, SET.BENCH, FOOTUP, { ...L.stack, flow: 0, liquid: 0, relief: 0, bubbles: 0 });
  shot(cutF, t.lair - cutF - 0.1, TIPB3, "sine.inOut", FOOTUP.d);
  st(cutF, t.lair - cutF, { ...L.tip }, "sine.inOut");
  chip("chip-purge", null, 96, 470, t.filet, t.torepos - 0.15);

  /* ───────────── « l'air reste dehors. » — pushed back up, gone ───────────── */
  shot(t.lair - 0.1, t.torepos - t.lair, { ...TIPB3, d: TIPB3.d * 0.92, az: TIPB3.az + 4 }, "sine.inOut");
  punch(t.lair - 0.4, 0.05); // on « l'air » (0.4 s before « reste »)
  st(t.dehors, 0.6, { air: 0 }, "sine.in");

  /* ───────────── « Le reste du temps, elle dort. » — the network closes; the plant comes back round it ───────────── */
  st(t.torepos, 1.0, { section: 0, litStack: 0 }, "sine.inOut");
  const cutS = t.dort - 0.2;
  shot(t.torepos - 0.05, cutS - t.torepos + 0.05, WHOLEB, "sine.inOut", TIPB3.d);
  st(t.torepos, cutS - t.torepos, { ...L.all }, "sine.inOut");
  cut(cutS, SET.SCENE, WHOLEB, { ...STAGED, shell: 0, mood: 0, hum: 1, rotor: 0, ...L.plant });
  st(cutS + 0.02, 2.0, { shell: 1 }, "sine.inOut");
  st(cutS, t.stop - cutS, { rotor: 2 * (t.stop - cutS) }, "none");
  shot(cutS, t.presque - cutS, WHOLE_S, "sine.out");

  /* ───────────── « Presque rien ne brûle : ce filet de gaz, et une flamme minuscule. » ───────────── */
  shot(t.presque, t.minuscule - t.presque, TIPS, "sine.inOut", WHOLE_S.d);
  st(t.presque, t.minuscule - t.presque, { ...L.tipS }, "sine.inOut");
  const holdTip = t.puis - 0.3;
  shot(t.minuscule, holdTip - t.minuscule, { ...TIPS, d: TIPS.d * 0.93, az: TIPS.az - 4 }, "sine.inOut");

  /* ───────────── « Puis ta raffinerie… perd un compresseur. » ───────────── */
  const cutC = t.perd - 0.12;
  shot(holdTip, cutC - holdTip, PLANT, "sine.inOut", TIPS.d * 0.93);
  st(holdTip, cutC - holdTip, { ...L.plant }, "sine.inOut");
  cut(cutC, SET.SCENE, COMP, { ...L.comp });
  shot(cutC, t.tozero - cutC, COMP_IN, "sine.out");
  st(t.stop, 0.35, { rotor: 2 * (t.stop - cutS) + 0.25 }, "power2.out");
  st(t.stop, 0.3, { hum: 0 }, "power2.out");
  st(t.stop, 0.1, { spark: 1 }, "power2.out");
  st(t.stop + 0.1, 0.45, { spark: 0 }, "power2.in");
  st(t.stop, 0.2, { mood: 1 }, "sine.inOut");
  st(t.stop + 0.1, t.tozero - t.stop - 0.1, { press: 0.3 }, "sine.in");
  punch(t.stop, 0.06);
}
