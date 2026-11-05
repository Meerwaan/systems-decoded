// 02 · AUTOPSIE (2/2) — the principle, then the system at rest (toprincipe → tozero).
//
// Act 2 leaves the exploded view open on the chamber. We cut IN PLACE to the assembled slab on the bench, low over it
// (the heat arrows only read from low: from above the melt hides them): « Pourquoi l'étaler ? » a heap of melt lands
// on the slab; « chauffe » its heat goes down into the floor, red arrows through the slab's black edge; « Épais » the
// heap thickens and the arrows lengthen right through the slab — « il perce le sol ». « Étalé » the same mass spreads
// and the camera rises to see its 170 m²; then the SAME low frame as at the start, cut: the thin sheet, the arrows
// short and sparse — « sa chaleur se partage » reads as a before / after in one place.
// « Il n'a jamais servi » : the plant at rest, cold, grazing the empty slab, the vessel behind; a slow push. « une
// piscine attend » : the camera rises right to the pool's cut face (its water stands above the slab: gravity, said
// without a word), and on to a shut valve and its trigger on the slab — « Vannes fermées ». It holds, closing in
// slowly, until act 3 cuts (« La porte fusible cède »).
import { SET, VIEW, BENCHED, STAGED, HEAP, TRIGGERS } from "./world.js";

const P = { fov: 32, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [HX, HY, HZ] = HEAP.at;

/* ── the principle, on the bench ── */
// low over the slab (journal 039-corium: the heap above, the arrows on the slab's black edge), a slow push in
const HEAP_LOW = { ...VIEW.heap, d: 2300, el: 8, shift: 40 };
const HEAP_IN = { ...HEAP_LOW, d: 2050 };
// the sheet from above: its 170 m² (the whole chamber, the same aim as the heap's)
const SHEET = { ...VIEW.sheet, d: 4800, shift: 220 };
// the same low frame as the start, a little further back: the thin sheet runs out of it on both sides
const THIN = HEAP_IN;
const THIN_OUT = { ...HEAP_LOW, d: 1850 };

/* ── at rest, in the plant ── */
// the empty chamber in front, the pit and its vessel behind (journal 039-batiment, chamberLow B): the first frame's place, asleep
// retouche 05/11: chamberLow left the chamber under the frame — aimed lower and higher up, the dry slab IS the picture
const GRAZE = { ...VIEW.chamberLow, ty: 100, tz: 1000, d: 3600, el: 20, shift: 0 };
const GRAZE_IN = { ...GRAZE, d: 3300 };
// the pool beside the dry slab: its tall inner wall, the two valves low on it, the water above (VIEW.pool hides it)
// retouche 05/11: from above the wall, the still water (model.js: dark veille) fills the frame; cut in, a slow push
const POOLWIDE = { ...P, tx: 850, ty: -60, tz: 2000, d: 3000, az: -40, el: 45, fov: 34, shift: 0 };
const POOL_IN = { ...POOLWIDE, d: 2800 };
// a valve and its trigger, held lower and left than VIEW.valve: the lever stays clear of the header and the buttons
const VALVE = { ...VIEW.valve, d: 1250, shift: -50, side: 80 };
const VALVE_IN = { ...VALVE, d: 1120 };

// the light: what it stands around, and how wide
const L_HEAP = { fx: HX, fy: HY, fz: HZ, fs: 600 };
const L_SHEET = { fx: HX, fy: HY, fz: HZ, fs: 1500 };
const L_REST = { fx: 0, fy: 0, fz: 800, fs: 2500 };
const L_POOL = { fx: 650, fy: -60, fz: 1900, fs: 1500 };
const L_VALVE = { fx: 600, fy: -200, fz: TRIGGERS[1][2], fs: 420 };

export default function acte2b({ D }) {
  const { st, shot, cut, chip, punch } = D;
  const t = D.times({
    toprincipe: "toprincipe", principe: "principe", chauffe: "chauffe", epais: "epais", perce: "principe:perce",
    etale: "etale", m170: "m170", mincep: "mincep", sa: "principe:sa", partage: "partage",
    torepos: "torepos", dort: "dort", dans: "repos:Dans", piscine: "piscine", vannes: "repos:Vannes", fermees: "fermees",
    tozero: "tozero",
  });

  /* ───────────── « Pourquoi l'étaler ? » — a heap lands on the slab ───────────── */
  cut(t.toprincipe, SET.BENCH, HEAP_LOW, { ...BENCHED, litChamber: 0.4, ...L_HEAP });
  shot(t.toprincipe + 0.02, t.etale - 0.1 - t.toprincipe, HEAP_IN, "sine.inOut");
  st(t.principe, 0.6, { mass: 0.22 }, "sine.out");

  /* ───────────── « Le cœur fondu chauffe dans toute son épaisseur. » — its heat goes down ───────────── */
  st(t.chauffe - 0.05, 0.5, { arrows: 1 }, "sine.out");

  /* ───────────── « Épais, il perce le sol. » — thicker: the arrows go right through ───────────── */
  st(t.epais, t.perce + 0.1 - t.epais, { mass: 1 }, "sine.inOut");
  punch(t.perce, 0.06);

  /* ───────────── « Étalé sur 170 mètres carrés, il devient mince : » — it spreads, we rise to see it ───────────── */
  st(t.etale, 0.5, { arrows: 0 }, "sine.inOut");
  st(t.etale, t.mincep - t.etale, { spread: 1 }, "sine.inOut");
  shot(t.etale - 0.1, t.mincep + 0.1 - t.etale, SHEET, "sine.inOut", HEAP_IN.d);
  st(t.etale - 0.1, t.mincep + 0.1 - t.etale, { ...L_SHEET }, "sine.inOut");
  chip("chip-170", null, 96, 470, t.m170, t.sa - 0.3);

  /* ───────────── « sa chaleur se partage. » — the same low frame as the heap: short, sparse arrows ───────────── */
  const thin = t.sa - 0.13;
  cut(thin, SET.BENCH, THIN, { ...BENCHED, litChamber: 0.4, mass: 1, spread: 1, arrows: 0, ...L_HEAP });
  st(thin + 0.05, 0.35, { arrows: 1 }, "sine.out");
  shot(thin + 0.02, t.torepos - 0.02 - thin, THIN_OUT, "sine.inOut");
  punch(t.partage, 0.06);

  /* ───────────── « Il n'a jamais servi. Il dort, à sec, à côté de la cuve. » — the plant at rest ───────────── */
  cut(t.torepos, SET.PLANT, GRAZE, { ...STAGED, belly: 0, core: 0.3, mood: 0, ...L_REST });
  shot(t.torepos + 0.02, t.dans - 0.2 - t.torepos, GRAZE_IN, "sine.inOut");
  chip("chip-jamais", null, 96, 470, t.torepos + 0.14, t.dort - 0.2);
  punch(t.dort, 0.06);

  /* ───────────── « Dans le bâtiment, une piscine attend. » — up to the pool's cut face ───────────── */
  // retouche 05/11: the climb from the slab to the pool was a jerk (qa 45,5 s) → a clean cut a few frames before « Dans »
  const up = t.dans - 0.12;
  cut(up, SET.PLANT, POOLWIDE, { ...L_POOL });
  shot(up + 0.02, t.piscine + 0.3 - up - 0.02, POOL_IN, "sine.inOut");
  st(t.piscine - 0.1, 0.5, { litPool: 0.6 }, "sine.out");

  /* ───────────── « Vannes fermées. Et personne ne viendra les ouvrir. » — a shut valve, its trigger on the slab ───────────── */
  const down = t.piscine + 0.3;
  shot(down, t.vannes + 0.25 - down, VALVE, "sine.inOut");
  st(down, t.vannes + 0.25 - down, { ...L_VALVE }, "sine.inOut");
  st(t.vannes - 0.05, 0.4, { litValves: 0.6 }, "sine.out");
  shot(t.vannes + 0.25, t.tozero - 0.05 - (t.vannes + 0.25), VALVE_IN, "sine.inOut");
}
