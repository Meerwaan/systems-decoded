// DOSSIER 041 — 02 AUTOPSIE, « Alors… on l'ouvre » and the exploded view (ouvre → principe − 0.12).
//
// « Alors… » : act 1's camera is still gliding over the bumper; time stops — the bille's streak dies, it hangs where it
// is, the station fades out around the coupon and the light turns veille (the shot is act 1's, the state is ours).
// « …on l'ouvre. » : cut IN PLACE to the bench (the coupon does not move), the coupon alone on its pool, three-quarter;
// on « ouvre » it comes apart toward where the bille came from (+z, screen right): the bumper flies 30 cm out, the
// blanket 12, the wall stays — and the camera, already moving, backs off to hold the whole row.
// Then ONE travelling along the row, from the bumper (right) to the wall (left), az always decreasing (−62 → −90) and
// el rising and falling at each key for depth: each layer lights veille on its word and its callout comes with it.
// « Et le cœur… » : the layers fly home and shut (the click), the camera turns into the plane of the layers (the gap
// reads in profile only, az −86 → −90); « 10 » the ten-centimetre gauge in the gap; « vide » the gap lights up (punch).
// The path hands over at speed at principe − 0.12, where acte2b cuts to the pair.
import { setAct } from "@kit/overlay.js";
import { benchCut } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, LIGHT } from "./world.js";

/* ── the light: the row once it is open (z −12 → 30), the coupon once it is shut ── */
const L_ROW = { fx: 0, fy: 0, fz: 8, fs: 60 };
/* ── the bench poses: the plates are 40 cm tall — held far enough to stay between the header and the captions ── */
const SYS = { ...VIEW.system, d: 215, el: 20, shift: 130 }; // the coupon whole, on its pool, three-quarter

export default function acte2({ D, world, co }) {
  const { tl, st, path, chip, punch } = D;
  const sys = world.system;
  const t = D.times({
    ouvre: "ouvre", ouvreW: "ouvre:l'ouvre", tobench: "tobench",
    tole: "eclate:tôle", alu: "alu",
    matelas: "matelas", kevlar: "kevlar",
    coque: "coque", mm: "eclate:millimètres", mmEnd: "eclate:millimètres$",
    coeur: "coeur", coeurEnd: "eclate:cœur$", dix: "eclate:10", vide: "vide",
    principe: "principe",
  });
  const end = t.principe - 0.12; // acte2b cuts here
  setAct(tl, 2, t.ouvre);

  /* ═════════ « Alors… » — time stops (act 1's camera, our state) ═════════ */
  st(t.ouvre, 0.25, { trail: 0 }, "power2.out"); // the streak dies: the bille hangs, frozen
  st(t.ouvre, 0.45, { mood: 0 }, "sine.inOut"); // frank: signal → veille in under half a second
  st(t.ouvre, 0.3, { shell: 0, you: 0, cabin: 0 }, "sine.out"); // the lab's glass, seen grazing, would veil the frame

  /* ═════════ « …on l'ouvre. » — the bench, in place; it comes apart on « ouvre » ═════════ */
  const pose = benchCut(D, { at: t.tobench, set: SET.BENCH, view: SYS, state: { ...BENCHED, litBumper: 0.6, pool: 0, grid: 0 }, pool: 0.25 });
  // the bumper keeps act 1's veille glow across the cut (the match is on the same light), and lets it go as it opens
  st(t.ouvreW, 1.2, { explode: 1 }, "power2.out");
  st(t.ouvreW, 1.0, L_ROW, "sine.inOut");
  st(t.ouvreW, 0.5, { litBumper: 0 }, "sine.inOut");

  /* ═════════ the three layers, each on its word ═════════ */
  st(t.tole - 0.06, 0.3, { litBumper: 1 }, "power2.out");
  st(t.matelas - 0.06, 0.3, { litBumper: 0, litBlanket: 1 }, "power2.out");
  st(t.coque - 0.06, 0.3, { litBlanket: 0, litWall: 1 }, "power2.out");

  /* ═════════ « Et le cœur… 10 centimètres de vide. » ═════════ */
  // the layers fly home during « Et le cœur… » and shut in the pause after it (the click, in the breath: never on a
  // word); the wall goes dark, the light closes on the coupon
  const shut = t.coeurEnd + 0.17;
  st(t.mmEnd + 0.15, shut - t.mmEnd - 0.15, { explode: 0 }, "power2.in");
  st(t.mmEnd, 0.4, { litWall: 0 }, "sine.inOut");
  st(t.mmEnd, 0.8, LIGHT.coupon, "sine.inOut");
  st(t.dix - 0.05, 0.3, { gauge10: 1 }, "power2.out");
  st(t.vide - 0.06, 0.35, { litGap: 0.8 }, "power2.out");
  punch(t.vide, 0.06, { hold: 0.14, down: 0.45 }); // let go by 31.29: the cut is at 31.41

  /* ═════════ the camera: ONE travelling on the bench, az always decreasing ═════════ */
  path([
    [t.tobench, pose], //                                                          the coupon whole (−62)
    [t.ouvreW + 1.0, { tz: 9, d: 245, az: -66, el: 24, shift: 140 }], //          the whole row, open
    [t.alu, { tz: 22, d: 180, az: -70, el: 15, shift: 120 }], //                    the bumper (right)
    [t.kevlar, { tz: 2, d: 170, az: -74, el: 25, shift: 130 }], //                 the blanket, its two greys
    [t.mm, { tz: -7, d: 175, az: -77, el: 14, shift: 120 }], //                    the wall (left)
    [t.coeur, { tz: -4, d: 180, az: -81, el: 19, shift: 110 }], //                 the layers flying home
    [t.dix, { ty: -3, tz: -5, d: 110, az: -88, el: 14, shift: 40 }], //            into the plane of the layers (no face seen grazing)
    [end, { ...VIEW.gap, dof: 5 }], //                                             the gap, in profile (a softer lens: passed at speed)
  ]);

  /* ═════════ the callouts, one at a time, out before the next ═════════ */
  const parts = [
    [{ title: "Tôle d'aluminium", x: 560, y: 520, align: "end", anchor: sys.parts.bumper }, t.tole, t.matelas - 0.24],
    [{ title: "Céramique et kevlar", x: 640, y: 520, align: "end", anchor: sys.A.blanket }, t.matelas, t.coque - 0.24],
    [{ title: "Ta coque", x: 400, y: 520, align: "start", anchor: sys.A.wall }, t.coque, t.mmEnd - 0.1],
  ];
  for (const [opt, from, to] of parts) {
    const c = co.add({ ...opt, tone: "system" });
    c.show(tl, from);
    c.hide(tl, to);
  }
  chip("chip-vide", null, 96, 470, t.vide - 0.1, end - 0.2);
}
