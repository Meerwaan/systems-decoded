// 01 · MENACE — from the first frame to « Alors… » (docs/046-actes.md → « acte1.js », docs/046-actes-maj.md).
// ONE move for the hook and the promise (POSE0 → a push to the tip → a pull-back by ratio down the stack to the
// columns, where the middle one bursts as a ghost on « exploser »), then two cuts: the tip close (« sa plus petite
// flamme… s'éteint »: the pilot falters) and the scene « a few seconds before » — the compressor stops on « coupe »,
// the camera rises to the columns that fill with pressure, the ghost cloud on « libre », and the header followed to
// the stack's foot on « la torche », where act 2 opens the bench in place. Every instant is read off the script.
import { setAct } from "@kit/overlay.js";
import { SET, POSE0, VIEW, STAGED, TIP, COMPRESSOR } from "./world.js";

export default function acte1({ D, world }) {
  const { tl, st, now, shot, cut, chip, punch } = D;
  const t = D.times({
    choc: "choc", elle: "accroche:Elle", ce: "promesse:Ce", exploser: "promesse:exploser", sauf: "promesse:Sauf",
    eteint: "promesse:s'éteint", toscene: "toscene", elec: "scene:électrique", fault: "fault", ton: "scene:Ton",
    pression: "scene:pression", libre: "libre", flamber: "scene:flamber", il: "scene:Il", torche: "torch",
    alors: "ouvre", tobench: "tobench",
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the hook: « Ta raffinerie crache une flamme géante. Elle le fait exprès. » ──
     The flare swells from frame 1 (the subject moves, not only the camera) but stays under 0.8 while the camera is
     this close: above it the flame reaches the header. The camera closes slowly on the tip and turns a little round
     it: the green pilots grow beside the plume — nothing looks like an accident. */
  st(0, t.choc + 0.3, { flare: 0.8, smoke: 1 }, "power2.out");
  st(t.choc + 0.3, t.ce - t.choc - 0.3, { flare: 0.92 }, "sine.inOut");
  const nearTip = { ...POSE0, tx: -650, ty: 2060, d: 2850, az: 93, el: -24, shift: -190 };
  shot(0, t.ce - 0.1, nearTip, "sine.inOut", POSE0.d);
  punch(t.choc, 0.06);

  /* ── « Ce feu, c'est ce qui l'empêche d'exploser. » ──
     A pull-back by ratio down the stack, turning toward the columns (az up, they come out from behind the stack): the
     flame may grow to full now that the camera is far. On « exploser » the middle column bursts as a ghost. */
  const plant = { ...POSE0, tx: -1050, ty: 1350, d: 5600, az: 114, el: -14, shift: -60, side: 110 };
  shot(t.ce - 0.1, t.sauf - t.ce - 0.02, plant, "sine.inOut", nearTip.d);
  st(t.ce, t.exploser - t.ce + 0.4, { flare: 1 }, "sine.inOut");
  st(t.ce, 1.2, { fx: -900, fy: 1200, fs: 3000 }, "sine.inOut");
  st(t.exploser, 0.9, { blast: 1 }, "power1.out");
  punch(t.exploser, 0.05);

  /* ── « Sauf le jour où sa plus petite flamme… s'éteint. » ── cut 1 (a match: we climb back to the tip)
     The tip close, beside the root of the giant plume: the green pilot. On « s'éteint » it falters — and stays low
     (never under 0.5: the header still reads it lit) until the cut. */
  const tip = { ...VIEW.tip, d: 1000 };
  cut(t.sauf - 0.12, null, tip, { fx: 0, fy: TIP.y1, fz: 0, fs: 220 });
  shot(t.sauf - 0.12, t.toscene - t.sauf + 0.12, { ...tip, d: 760, az: tip.az - 7, el: tip.el + 2 }, "sine.inOut", tip.d);
  st(t.eteint, 0.22, { pilot: 0.5 }, "power2.out");
  st(t.eteint + 0.22, 0.2, { pilot: 0.68 }, "sine.inOut");
  st(t.eteint + 0.42, 0.3, { pilot: 0.5 }, "power2.out"); // no punch here: the flame shrinking IS the hit, the frame holds still

  /* ── « Un défaut électrique coupe un compresseur. » ── cut 2: the scene, a few seconds before (the header's clock goes
     back to 16:29:59). The plant runs, the flare at its tiny flame. A spark on the motor on « électrique »; on
     « coupe » the rotor slows and stops (it left at the speed it had: 2.2 turns/s), its hum dies. */
  const RPS = 2.2, SPIN = 1.15;
  const [cx, , cz] = COMPRESSOR.at;
  const comp = { ...VIEW.compressor, tx: VIEW.compressor.tx - 150, d: 2500 }; // the motor and its spark well inside the frame
  cut(t.toscene, SET.SCENE, comp, {
    ...STAGED, press: 0.2, flare: 0.08, smoke: 0, rotor: 0, fx: cx - 150, fy: 250, fz: cz, fs: 900,
  });
  shot(t.toscene, t.ton - t.toscene, { ...comp, d: 2300, az: 22 }, "sine.inOut", comp.d);
  st(t.toscene, t.fault - t.toscene, { rotor: RPS * (t.fault - t.toscene) }, "none");
  st(t.fault, SPIN, { rotor: RPS * (t.fault - t.toscene) + (RPS * SPIN) / 2 }, "power2.out");
  st(t.fault, SPIN * 0.9, { hum: 0 }, "power1.out");
  st(t.elec, 0.1, { spark: 1 }, "power2.out");
  st(t.elec + 0.1, 0.55, { spark: 0 }, "power2.in");
  chip("chip-arret", null, 96, 470, t.fault + 0.1, t.pression - 0.3);

  /* ── « Ton usine doit vider son gaz sous pression. » ── the camera rises from the compressor to the three columns;
     they fill with signal from the bottom, full on « pression ». */
  shot(t.ton - 0.05, t.pression - t.ton + 0.3, VIEW.columns, "sine.inOut");
  st(t.ton, t.pression - t.ton + 0.1, { press: 1 }, "sine.in");
  st(t.ton, t.pression - t.ton, { fx: -2150, fy: 700, fz: 0, fs: 1600 }, "sine.inOut");

  /* ── « À l'air libre ? Un nuage prêt à flamber. » ── the ghost cloud spills round the columns at ground level on
     « libre », holds on « flamber », and goes. The camera keeps turning slowly round the columns (no still frame). */
  shot(t.pression + 0.25, t.il - t.pression - 0.45, { ...VIEW.columns, d: 3500, az: -50, el: 10 }, "sine.inOut");
  st(t.libre, 1.3, { cloud: 1 }, "sine.out");
  st(t.flamber + 0.35, t.il - t.flamber - 0.2, { cloud: 0 }, "sine.in");

  /* ── « Il reste une sortie… la torche. » ── ONE move along the header, from the columns to the stack (the camera stays
     on the same side, far from the columns: nothing brushes it), landing on « torche » on the stack's foot seen whole —
     the seal, the foot, the stack climbing out of frame. Then, in the breath, it closes on the foot (VIEW.foot). */
  const footWide = { ...VIEW.foot, ty: 700, d: 2600, el: 14, dof: 0 };
  shot(t.il - 0.25, t.torche - t.il + 0.25, footWide, "sine.inOut");
  st(t.il, t.torche - t.il, { fx: -300, fy: 600, fz: 0, fs: 700 }, "sine.inOut");
  punch(t.torche + 0.05, 0.05);

  /* ── « Alors… » ── everything freezes (the clock too: main.js); the camera settles on VIEW.foot and barely creeps.
     Act 2 cuts in place on VIEW.foot at `tobench`: the last frame IS VIEW.foot. */
  shot(t.torche + 0.06, t.alors - t.torche - 0.06, { ...VIEW.foot, d: VIEW.foot.d * 1.04 }, "sine.inOut", footWide.d);
  st(t.torche + 0.06, t.alors - t.torche, { fy: 300, fs: 450 }, "sine.inOut");
  shot(t.alors, t.tobench - t.alors, VIEW.foot, "sine.out");
  now(t.alors, { cloud: 0, spark: 0, hum: 0 });
}
