// 03 · RÉPONSE — from « Zéro. » to « Et on la lit. » (tozero → toverdict). In cuts, one shot per breath.
// Every cut is laid a few frames before its sentence; its pose is complete and so is its state ({ ...STAGED, … },
// { ...BENCHED, … }): nothing is inherited from the act before, nothing from the shot before.
//
// THE HEADER CARRIES THE TIME. J−2 (the threshold) → J−1 on the cut → J−0 on « Zéro » (signal); then, once the
// steel has held, the months on the bottom: « +1 mois », « +12 mois », « +23 mois », each on its word. The depth
// reads 3 900 m until the memory comes up (3 900 → 3 600 as it rises), then 0 in the laboratory.
//
// Where the camera stands, and why:
//   · « Zéro… personne » : the box small and alone on the bottom (from above the key light's side: el ≥ 18, the
//     orange paint loses its pink-white sheen below 15), its beacon's last ring; then the camera lifts its eyes to
//     the black water — nothing answers;
//   · « Elle attend… sous 3 900 m » : a cut back to the box, and ONE pull-back by ratio up the whole column (the
//     frame of act 1's « quelques kilomètres », now dead: the box an ink point, no reach drawn);
//   · « L'eau pèse. L'acier tient. » : the module through the glass chassis, the sea's arrows on it; the steel
//     lights veille on « tient » and the whole sea turns veille with it (`mood` 0);
//   · « Un mois. Un an. Presque deux ans. » : three cuts on the same axis, each further back — the snow settling;
//   · « Avril 2011 » : the wreck under the light that comes down — the light reaches it on « l'épave »;
//   · « En mai » : the module rising in the beam, the bottom and the dead chassis falling away under it;
//   · « Et on la lit » : the laboratory — the module open in section, as act 2 showed it; its memory lights and
//     its data rise.
import { setAct } from "@kit/overlay.js";
import { SET, VIEW, STAGED, BENCHED } from "./world.js";

/* ── the poses (found with `look`) ── */
// the box alone on the bottom, a little higher than VIEW.alone (el 9 put the sheen on the paint)
// (retouche b : d 1100 → 360, la boîte ≈ 15 % de la largeur au lieu de 5 %, toujours seule sur son halo)
const ALONE = { ...VIEW.alone, ty: 28, d: 360, el: 22, shift: 40 };
// …and the camera sinks back from it, lower: the black water takes the frame, the box lonelier in it
const LOOKUP = { ...ALONE, ty: 40, d: 440, el: 15, shift: 60 };
// « Elle attend » : back on the box from its other side, then the whole column (VIEW.range, no reach drawn)
const WAIT0 = { ...VIEW.alone, ty: 20, d: 330, az: -46, el: 24, shift: 60 };
const WAIT1 = { ...WAIT0, ty: 120, d: 1400, shift: 20 };
// (retouche b : el 10 → 26 — les cercles du fond et de la surface s'ouvrent en ellipses, le point de la boîte au centre du fond)
const COLUMN = { ...VIEW.range, el: 26, shift: 150 };
// the module through the glass chassis, the pressure on it
const CRUSH = { ...VIEW.crushed, d: 150, el: 18 };
const CRUSH_BACK = { ...CRUSH, d: 200 };
// the months: three frames on the same axis, further back each time
const MONTH1 = { ...VIEW.floor, d: 420, el: 24, shift: 120, dof: 0 };
const MONTH2 = { ...VIEW.floor, d: 1300, el: 30, shift: 90, dof: 0 };
// the wreck field under the light that comes down; the module rising in the beam
const WRECK = { ...VIEW.wreck };
const RISE = { ...VIEW.rise };
const RISE_BACK = { ...RISE, d: 240 };
// …then from under it, looking up: it rises toward the lamp, the bottom gone (retouche b)
const RISE_UP = { ...VIEW.rise, d: 165, az: -36, el: -24, shift: 60 };
// the laboratory: the module open in section, as act 2 framed it
const READ = { ...VIEW.section, d: 86, shift: 80 };

/* ── the light: what it stands around, and how wide ── */
const L_BOX = { fx: 0, fy: 12.5, fz: 0, fs: 60 };
const L_ALONE = { fx: 0, fy: 12.5, fz: 0, fs: 3000 };
const L_COLUMN = { fx: 0, fy: 175000, fz: 0, fs: 400000 };
const L_CRUSH = { fx: 2, fy: 19, fz: 0, fs: 40 };
const L_MONTH = { fx: 0, fy: 12.5, fz: 0, fs: 200 };
const L_WRECK = { fx: -2200, fy: 300, fz: -3800, fs: 9000 };
const L_RISE = { fx: 0, fy: 19, fz: 0, fs: 80 };
const L_READ = { fx: -4, fy: 27, fz: 12, fs: 16 };

/** A length of time between two instants, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, punch, chip } = D;
  const t = D.times({
    tozero: "tozero", zero: "zeroword", passes: "passes", personne: "personne", entendue: "entendue",
    toattend: "zero:Elle-0.12", attend: "attend", sous: "sous", zeroEnd: "zero$",
    toreponse: "reponse-0.12", pese: "pese", tient: "tient",
    un1: "reponse:Un", mois: "mois", un2: "reponse:Un#2", unan: "unan", presque: "presque", deuxans: "deuxans",
    avril: "avril", epave: "epave", tomai: "reponse:En-0.12", mai: "mai", remonte: "remonte", onla: "onla", lit: "lit",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /* ───────────── « *Zéro*. Les trente jours sont passés. » ───────────── */
  // the box alone on the bottom, J−1 → J−0 on « Zéro »: its beacon's last strong ring, then it dies with the battery
  const HERE = { ...STAGED, days: 1, alarm: 1, ping: 0.6, charge: 0.1, pool: 0.5 };
  cut(t.tozero, SET.DEEP, ALONE, { ...HERE, ...L_ALONE });
  shot(t.tozero, span(t.tozero, t.personne - 0.1), { ...ALONE, d: 330 }, "sine.out", ALONE.d);
  st(t.zero - 0.04, 0.08, { days: 0 }, "none");
  st(t.zero, 0.1, { ping: 1 }, "power2.out");
  st(t.zero + 0.2, span(t.zero + 0.2, t.passes + 0.3), { ping: 0, charge: 0 }, "sine.in");

  /* ───────────── « Personne ne l'a entendue. » ───────────── */
  // the camera sinks back and lower: the black water takes the frame, nothing comes back
  shot(t.personne - 0.1, span(t.personne - 0.1, t.toattend), LOOKUP, "sine.inOut");

  /* ───────────── « Elle attend, dans le noir, sous trois mille neuf cents mètres d'eau. » ───────────── */
  // back on the box, closer, from its other side: it lies there in the dark, and the frame steps back from it…
  cut(t.toattend, SET.DEEP, WAIT0, { ...STAGED, days: 0, alarm: 1, ping: 0, charge: 0, ...L_BOX });
  shot(t.toattend, span(t.toattend, t.sous - 0.12), WAIT1, "sine.inOut", WAIT0.d);
  st(t.toattend, span(t.toattend, t.sous - 0.12), L_ALONE, "sine.in");
  // …« sous trois mille neuf cents mètres d'eau » : the whole column, the surface 3.9 km above the ink point
  cut(t.sous - 0.12, SET.DEEP, COLUMN, { ...STAGED, days: 0, alarm: 1, ping: 0, charge: 0, ...L_COLUMN });
  shot(t.sous - 0.12, span(t.sous - 0.12, t.toreponse), { ...COLUMN, d: COLUMN.d * 1.12 }, "sine.inOut", COLUMN.d);

  /* ───────────── « L'eau pèse. L'acier *tient*. » ───────────── */
  // the module through the glass chassis: the sea's arrows close in on « pèse », the steel gives — and on « tient »
  // it lights veille, springs back, and the whole sea turns veille with it
  cut(t.toreponse, SET.DEEP, CRUSH, { ...STAGED, days: 0, alarm: 1, xray: 1, ...L_CRUSH });
  shot(t.toreponse, span(t.toreponse, t.tient), { ...CRUSH, d: 135 }, "sine.inOut", CRUSH.d);
  st(t.pese - 0.1, span(t.pese - 0.1, t.tient - 0.15), { crush: 1, flex: 0.8 }, "power2.in");
  st(t.tient - 0.04, 0.3, { hold: 1, flex: 0.25, mood: 0 }, "power2.out");
  punch(t.tient, 0.06, { up: 0.08, hold: 0.14, down: 0.28 });

  /* ───────────── « Un mois. Un an. Presque deux ans. » ───────────── */
  // one month: the frame steps back from the module, the pressure eases; then two cuts further back each time,
  // the snow settling on the box — and the header counts the months
  shot(t.un1 - 0.1, span(t.un1 - 0.1, t.un2 - 0.12), CRUSH_BACK, "sine.inOut", 135);
  st(t.un1 - 0.1, 0.9, { crush: 0.3, flex: 0.1 }, "sine.inOut");
  st(t.mois, 0.2, { months: 1 }, "none");

  const MONTHS = { ...STAGED, days: 0, alarm: 1, mood: 0, xray: 1, hold: 1, crush: 0, rush: -0.35 };
  cut(t.un2 - 0.12, SET.DEEP, MONTH1, { ...MONTHS, months: 1, ...L_MONTH });
  shot(t.un2 - 0.12, span(t.un2 - 0.12, t.presque - 0.12), { ...MONTH1, d: 460 }, "sine.inOut");
  st(t.unan, 0.2, { months: 12 }, "none");

  cut(t.presque - 0.12, SET.DEEP, MONTH2, { ...MONTHS, months: 12, ...L_MONTH });
  shot(t.presque - 0.12, span(t.presque - 0.12, t.avril - 0.12), { ...MONTH2, d: 1450 }, "sine.inOut");
  st(t.deuxans, 0.2, { months: 23 }, "none");

  /* ───────────── « Avril deux mille onze : on retrouve l'*épave* du Rio-Paris. » ───────────── */
  // the wreck field in the dark; the light comes down and reaches it on « l'épave »
  cut(t.avril - 0.12, SET.DEEP, WRECK, { ...STAGED, days: 0, months: 23, alarm: 1, mood: 0, xray: 1, ...L_WRECK });
  shot(t.avril - 0.12, span(t.avril - 0.12, t.tomai), { ...WRECK, d: 8800 }, "sine.inOut");
  st(t.avril, span(t.avril, t.epave + 0.3), { beam: 1 }, "sine.inOut");
  chip("chip-2011", null, 96, 470, t.avril, t.mai - 0.4);
  punch(t.epave, 0.05, { up: 0.08, hold: 0.16, down: 0.4 });

  /* ───────────── « En mai, sa mémoire remonte. » ───────────── */
  // the module leaves the glass chassis and rises in the beam; the bottom and the dead chassis fall away under it
  // (retouche b) the module lifts 25 cm off the broken chassis, slowly — no more 200 m in an expo.in that dragged the
  // glass chassis and the bottom across the frame in streaks; then a CUT on « remonte », from under it, looking up:
  // it rises toward the lamp, the bottom already far (the header counts 3 860 → 3 700)
  const RISE_S = { ...STAGED, days: 0, months: 23, alarm: 1, mood: 0, xray: 1, free: 1, beam: 1, ...L_RISE };
  const upAt = t.remonte - 0.12;
  cut(t.tomai, SET.DEEP, RISE, RISE_S);
  st(t.mai - 0.08, span(t.mai - 0.08, upAt), { depth: 3899.75, rush: -0.3 }, "sine.inOut");
  shot(t.tomai, span(t.tomai, upAt), RISE_BACK, "sine.inOut", RISE.d);
  cut(upAt, SET.DEEP, RISE_UP, { ...RISE_S, depth: 3860, rush: -0.7, shell: 0.45 });
  st(upAt, span(upAt, t.onla - 0.12), { depth: 3700, rush: -1 }, "sine.in");
  shot(upAt, span(upAt, t.onla - 0.12), { ...RISE_UP, d: 190 }, "sine.inOut", RISE_UP.d);

  /* ───────────── « Et on la +lit+. » ───────────── */
  // the laboratory: the module open in section, as act 2 showed it; on « lit » its memory lights and its data rise
  cut(t.onla - 0.12, SET.BENCH, READ, {
    ...BENCHED, days: 0, months: 23, alarm: 1, depth: 0, explode: 1, section: 1, xray: 1, ...L_READ,
  });
  shot(t.onla - 0.12, span(t.onla - 0.12, t.toverdict), { ...READ, d: 76 }, "sine.inOut", READ.d);
  st(t.lit - 0.04, 0.5, { read: 1 }, "power2.out");
}
