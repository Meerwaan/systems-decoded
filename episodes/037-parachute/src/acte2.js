// 02 · AUTOPSIE — « Alors… on l'ouvre. », the exploded view (tobench → toprincipe).
//
// Act 1 leaves the rig on your back, close (VIEW.back), the spin landed on a whole turn. On « Alors… » nothing moves
// but the light, which turns from signal to veille in the near-silence. On « on » the same rig stands on the bench at
// the same place of the picture (benchCut: the sky goes, the pool comes); on « l'ouvre » it comes apart and the camera
// pulls back to the whole exploded view in ONE vertical frame. Then it follows what the voice names, part to part,
// along ONE path: the flaps lift and glow (« sous le rabat »), the camera dives to the box out of its pocket and its
// pressure port (« le boîtier et son capteur de pression »), pulls back to see the cable in diagonal while a head of
// light runs along it to the cutter (« un câble file au coupe-boucle »), dives into the cutter as its casing is cut
// away (« dans son trou passe… »), and on « la boucle » everything fades but the loop, standing veille through the hole.
// The exploded view moves the parts (model.js: the box by UNIT_OUT, the cutter, the loop and the pin by CORE_OUT):
// the close poses of VIEW are aimed at the parts at rest, so they are carried to where the parts stand, `moved()`.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, BENCHED, FIRST, SPEED, UNIT, CUTTER, LOOP, fallen } from "./world.js";

// where the exploded view carries the parts (model.js: UNIT_OUT, CORE_OUT)
const UNIT_OUT = [-8, 9, 13];
const CORE_OUT = [2, 3, 13];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const UNIT_X = add(UNIT.at, UNIT_OUT); // the box, out of its pocket
const CORE_X = add(CUTTER.at, CORE_OUT); // the cutter, out in front of the tray
const LOOP_MID = add([LOOP.base[0], (LOOP.base[1] + LOOP.top[1]) / 2, LOOP.base[2]], CORE_OUT);

/* ── the poses ── */
// the whole exploded view, sharp: VIEW.exploded pulled back until the lifted flaps clear the header (d 190 cut them)
const WIDE = { ...VIEW.exploded, d: 290, shift: -40 };
const WIDE_IN = { ...WIDE, d: 276 }; // the same, a little closer (the flaps glow)
const BOX = { ...moved(VIEW.unit, [0, 0, 0], UNIT_OUT), d: 58 }; // the box and its pressure port, on its flank −x
const BOX_IN = { ...BOX, d: 52 };
// the box and the cutter in one frame, the cable in diagonal between them
const MIDX = (UNIT_X[0] + CORE_X[0]) / 2;
const CABLE = { ...VIEW.exploded, tx: CORE_X[0] - 8.5, ty: (UNIT_X[1] + CORE_X[1]) / 2, tz: (UNIT_X[2] + CORE_X[2]) / 2, d: 95, az: -38, el: 34, fov: 30, shift: 30, dof: 0 };
// into the cutter: its hole, the loop through it (section > 0). Retouche 04/11: the camera leans (roll) so the two
// strands leave by the side of the frame, not up through the header (26,95 s)
const TILT = 52;
const CUT = { ...moved(VIEW.cutter, [0, 0, 0], CORE_OUT), d: 21, roll: TILT, side: -80, shift: 0 }; // the hole right and low: the strands leave by the right edge, under the header
// the loop alone, standing through the cutter. Retouche 04/11: the pull-back stops a third of the way to the whole
// loop (d 66 left it a thin line at 270 px): it stays as thick as at 28,0, still leaning
const HEART_FAR = { ...moved(VIEW.heart, [0, 0, 0], CORE_OUT), ty: LOOP_MID[1] - 1.5, d: 66, el: 34, shift: 60 };
const lerp = (a, b, k) => Object.fromEntries(Object.keys(b).map((key) => [key, typeof a[key] === "number" && typeof b[key] === "number" ? a[key] + (b[key] - a[key]) * k : b[key]]));
const HEART = { ...lerp(CUT, HEART_FAR, 0.33), d: 31, roll: TILT };

/* ── the light: what it stands around, and how wide ── */
const L_WIDE = { fx: BENCHED.fx, fy: 20, fz: 12, fs: 46 };
const L_BOX = { fx: UNIT_X[0], fy: UNIT_X[1], fz: UNIT_X[2], fs: 14 };
const L_CABLE = { fx: MIDX, fy: 9, fz: 28.5, fs: 26 };
const L_CORE = { fx: CORE_X[0], fy: LOOP_MID[1], fz: CORE_X[2], fs: 16 };

export default function acte2({ D, co, world }) {
  const { tl, st, shot, cut, chip, punch } = D;
  const A = world.system.A;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode", ouvreEnd: "ouvre$",
    sous: "eclate:Sous", rabat: "eclate:rabat", boitier: "eclate:boîtier", capteur: "eclate:capteur", pression: "eclate:pression",
    un: "eclate:Un", cable: "eclate:câble", coupe: "eclate:coupe", et: "eclate:Et#2", trou: "eclate:trou",
    boucle: "eclate:boucle#2", end: "eclate$", toprincipe: "toprincipe",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── « Alors… » — your back, still: only the light turns, signal → veille ───────────── */
  st(t.ouvre + 0.06, t.tobench - t.ouvre - 0.12, { mood: 0 }, "sine.inOut");

  /* ───────────── « …on l'ouvre. » — the same rig on the bench, at the same place; it comes apart ───────────── */
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.back, origin: [0, 0, 0],
    state: { ...BENCHED, alt: fallen(FIRST.alt, t.tobench), vz: SPEED.fall, power: 1 },
  });
  st(t.explode, t.sous - t.explode - 0.05, { explode: 1 }, "sine.inOut");
  const pull = t.sous - 0.1 - (t.tobench + 0.03);
  shot(t.tobench + 0.03, pull, WIDE, "sine.inOut", bench.d);
  st(t.tobench + 0.03, pull, L_WIDE, "sine.inOut");

  /* ───────────── « Sous le rabat, » — the four flaps, lifted, glow ───────────── */
  shot(t.sous - 0.1, t.boitier - t.sous, WIDE_IN, "sine.inOut");
  st(t.rabat - 0.06, 0.2, { litFlap: 1 }, "sine.out");

  /* ───────────── « le boîtier et son capteur de pression. » — the box out of its pocket, its port ───────────── */
  // Retouche 04/11: the dive d 276 → 58 in 0.8 s was jerky (qa 22,8 s): a cut three frames before « boîtier »
  const cBox = t.boitier - 0.1; // the WIDE_IN push ends here
  cut(cBox, null, BOX, { ...L_BOX, litFlap: 0 });
  st(t.boitier + 0.02, 0.25, { litUnit: 1 }, "sine.out");
  shot(cBox, t.un - cBox, BOX_IN, "sine.inOut"); // it keeps closing in, slowly, on the port
  st(t.capteur - 0.02, 0.25, { litSensor: 1 }, "sine.out");
  co.add({ title: "Capteur de pression", x: 96, y: 520, align: "start", tone: "system", anchor: A.sensor }).show(tl, t.capteur - 0.08).hide(tl, t.un - 0.2);

  /* ───────────── « Un câble file au coupe-boucle. » — a head of light runs to the cutter; the camera follows ───────────── */
  const follow = t.coupe + 0.25 - (t.un + 0.02);
  shot(t.un + 0.02, follow, CABLE, "sine.inOut", BOX_IN.d);
  st(t.un + 0.02, follow, L_CABLE, "sine.inOut");
  st(t.un, 0.3, { litSensor: 0, litUnit: 0.35 }, "sine.inOut");
  st(t.cable, t.coupe - t.cable, { litCable: 1 }, "none");
  st(t.coupe - 0.04, 0.22, { litCutter: 1 }, "sine.out");
  st(t.coupe + 0.3, 0.12, { litCable: 1.1 }, "none"); // the head has arrived: it goes out in the cutter
  st(t.coupe + 0.3, 0.4, { litUnit: 0 }, "sine.inOut");
  co.add({ title: "Coupe-boucle", x: 96, y: 520, align: "start", tone: "system", anchor: A.cutter }).show(tl, t.coupe - 0.06).hide(tl, t.et);

  /* ───────────── « Et dans son trou passe… » — into the tube: its casing cut away, the loop through the hole ───────────── */
  const into = t.trou + 0.45 - (t.coupe + 0.3);
  shot(t.coupe + 0.3, into, CUT, "sine.inOut", CABLE.d);
  st(t.coupe + 0.3, into, L_CORE, "sine.inOut");
  st(t.trou - 0.25, 0.55, { section: 1 }, "sine.inOut");
  st(t.trou, 0.4, { litCutter: 0 }, "sine.inOut");

  /* ───────────── « …la boucle qui le garde fermé. » — the heart: the loop alone, veille, on its halo ───────────── */
  st(t.boucle - 0.04, 0.35, { heart: 1, litLoop: 1 }, "sine.out");
  punch(t.boucle, 0.06);
  shot(t.boucle - 0.1, t.toprincipe - (t.boucle - 0.1), HEART, "sine.inOut", CUT.d);
  chip("chip-coeur", null, 96, 470, t.boucle + 0.08, t.toprincipe - 0.24);
}
