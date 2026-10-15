// 03 · RÉPONSE — from « Sous l'oreiller. » to « C'était son dernier geste. » (tozero → toverdict). The climax.
// In cuts. Every cut is laid a few frames before its sentence, its pose is complete and so is its state ({ ...STAGED, … }
// in the room, { ...BENCHED, ...PORED, … } at the scale of the pores): nothing is inherited from the act before, nothing
// from the shot before. The voice comes in short breaths: one shot per breath.
//
// THE THERMOMETER RUNS, IT STOPS ONCE. `temp` is one chain of straight segments, each ending on a cut where the next
// shot's state takes it up: 41 under the pillow → it climbs on « monte » → almost flat, but never still, on « coupe la
// charge » (a number held there would read as the circuit's threshold, which nobody publishes) → steep on « encore » →
// 118 at the cut to the pores → 130 on « trente », the only sourced value, and the only one it stops on → it barely
// moves after (131 at most) and creeps down while the film lies shut. It never goes back to ink: the heat has not gone.
//
// THE CLIMAX IS ONE FRAME. From « le film fond » to « Le courant s'arrête » nothing cuts: the film glazes from the hot
// point outward, its pores shut one by one in the order of their distance to it, the grains above them stop against
// it and pile up; the header turns to « Bloqué » on « passe »; and on « s'arrête » the light lets go (`mood` 0) — but
// the hot point under the film does not go out: the film is a last resort, the picture promises nothing more.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, BENCHED, PORED, inRoom, MICRO } from "./world.js";

const [MX, MY, MZ] = MICRO.at;
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };

/* ── the poses (found with `look`; the room's and the maquette's come from the sets' logs) ── */
// the pillow, and the pocket of heat under it (chambre.js log: « la poche »)
const POCKET0 = { ...P, tx: -18, ty: 57, tz: -76, d: 190, az: -52, el: 14, fov: 32, shift: 180 };
const POCKET1 = { ...POCKET0, d: 168 };
// under the bare outline of the pillow: the phone, the battery in its glass body (chambre.js log: « sous le contour »)
const UNDER0 = { ...P, tx: -21, ty: 53.5, tz: -77, d: 88, az: -50, el: 22, shift: 170 };
const UNDER1 = { ...UNDER0, d: 78 };
// the −x end of the phone: the protection board, its switch, the cable coming in (written around the system)
const BOARD0 = inRoom({ ...P, tx: -5.4, ty: 0.5, tz: 0.4, d: 30, az: -60, el: 22, shift: 170 });
// the battery, from close: the crease and the hot point born in it
const DENT0 = inRoom({ ...P, tx: 3.0, ty: 0.5, tz: 1.2, d: 30, az: -36, el: 42, shift: 170 });
const DENT1 = { ...DENT0, d: 26 };
// at the scale of the pores: the film between its electrodes, the hot point under it (pores.js log: « au repos »)
const REST = { ...P, tx: MX, ty: MY, tz: MZ, d: 86, az: -36, el: 24, shift: 185 };
const NEAR = { ...REST, d: 76 };
// the climax (pores.js log): the film's face, the pores one can count, the hot point under them
const CLIMAX0 = { ...P, tx: MX + 2.2, ty: MY, tz: MZ + 1.4, d: 60, az: -30, el: 36, shift: 60 };
const CLIMAX1 = { ...CLIMAX0, d: 57 };

/* ── the light: what it stands around (in the room, around the phone where it lies) ── */
const [SX, SY, SZ] = [-24, 52, -76]; // plan.js → SPOTS[0]: the phone under the pillow
const L_POCKET = { fx: -14, fy: 58, fz: -76, fs: 70 };
const L_PHONE = { fx: SX, fy: SY + 1, fz: SZ, fs: 18 };
const L_BOARD = { fx: SX - 5, fy: SY + 0.5, fz: SZ, fs: 12 };
const L_DENT = { fx: SX + 3, fy: SY + 0.5, fz: SZ + 1.5, fs: 12 };

/** A length of time between two cues, whatever the voice does to them. */
const span = (from, to) => Math.max(0.05, to - from);

export default function acte3({ D }) {
  const { tl, st, shot, cut, chip } = D;
  const t = D.times({
    tozero: "tozero", kept: "kept", stays: "stays",
    torise: "torise", climbs: "climbs",
    tocutoff: "tocutoff", cutoff: "cutoff",
    but: "but", damaged: "damaged", point: "point", still: "still",
    toreponse: "toreponse", deg130: "deg130",
    tomelt: "reponse:le-0.12", trigger: "trigger", shut: "shut", shutEnd: "reponse:ferment$",
    blocked: "blocked", stops: "stops", last: "last",
    toverdict: "toverdict",
  });
  setAct(tl, 3, t.tozero);

  /** The header answers a word: a beat on the thermometer (#hud-clock) or on what still flows (#hud-count). */
  const beat = (sel, at, k = 1.16) => {
    tl.fromTo(sel, { scale: 1 }, { scale: k, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.36, ease: "power2.out" }, at + 0.16);
  };

  /* the thermometer's keys, each on a cut (the state of the shot that starts there takes it up) */
  const TEMP = { zero: 41, rise: 44, cutoff: 52, but: 56, reponse: 116 };
  /** One straight segment of the thermometer, from one cut to the next. */
  const run = (from, to, value, ease = "none") => st(from, span(from, to), { temp: value }, ease);

  /* ══════════ THE NIGHT GOES ON ══════════ */

  /* ───────────── « Sous l'oreiller. La chaleur ne sort plus. » ───────────── */
  // the room again, the pillow, the pocket of heat under it — the picture of the hook, closer. On « chaleur » the
  // grains rise from the phone, butt against the pillow and stay; the frame closes on them, slowly
  cut(t.tozero, SET.ROOM, POCKET0, { ...STAGED, temp: TEMP.zero, ...L_POCKET });
  shot(t.tozero, span(t.tozero, t.torise), POCKET1, "sine.out", POCKET0.d);
  st(t.kept, span(t.kept, t.stays + 0.3), { trapped: 1 }, "sine.inOut");
  run(t.tozero, t.torise, TEMP.rise);
  chip("chip-piege", null, 96, 470, t.stays - 0.25, t.torise - 0.15);

  /* ───────────── « La batterie monte. » ───────────── */
  // under the pillow, now a bare outline: the phone, its body of glass, the battery in it. On « monte » the battery
  // warms — its heart glows, its pouch reddens — and the thermometer climbs
  cut(t.torise, SET.ROOM, UNDER0, { ...STAGED, temp: TEMP.rise, cloth: 0.2, xray: 1, trapped: 0.6, ...L_PHONE });
  shot(t.torise, span(t.torise, t.tocutoff), UNDER1, "sine.out", UNDER0.d);
  st(t.climbs, span(t.climbs, t.tocutoff), { heat: 1 }, "sine.out");
  run(t.torise, t.tocutoff, TEMP.cutoff);

  /* ───────────── « Le circuit coupe la charge. » ───────────── */
  // the −x end of the phone: the cable coming in, its dashes running, the protection board lit. On « coupe » its
  // switch lifts (veille), the dashes stop, the header says « Coupée » — and the frame holds on the before and after
  cut(t.tocutoff, SET.ROOM, BOARD0, { ...STAGED, temp: TEMP.cutoff, cloth: 0.2, xray: 1, trapped: 0.3, heat: 0.6, litBoard: 1, ...L_BOARD });
  st(t.cutoff + 0.06, 0.25, { charge: 0 }, "power2.out");
  st(t.cutoff + 0.3, span(t.cutoff + 0.3, t.but), { heat: 0.4 }, "sine.inOut");
  beat("#hud-count", t.cutoff + 0.2, 1.2);
  run(t.tocutoff, t.but, TEMP.but);
  chip("chip-coupe", null, 96, 470, t.cutoff + 0.1, t.but - 0.15);

  /* ───────────── « Mais si la batterie est abîmée, un point chauffe… encore. » ───────────── */
  // the battery, from close, in its glass body. On « abîmée » a crease shows on the pouch; the battery's own glow
  // ebbs (the charge is cut) while, on « point », a point is born in the crease — and on « encore » it grows, and the
  // thermometer, which had almost stopped, starts again: steep. The picture holds
  cut(t.but, SET.ROOM, DENT0, { ...STAGED, temp: TEMP.but, cloth: 0, xray: 0.55, trapped: 0, heat: 0.4, charge: 0, ...L_DENT });
  shot(t.but, span(t.but, t.toreponse), DENT1, "sine.inOut", DENT0.d);
  st(t.but + 0.2, span(t.but + 0.2, t.point), { heat: 0.2 }, "sine.inOut");
  st(t.damaged, 0.45, { dent: 1 }, "power2.out");
  st(t.point, 0.5, { spot: 0.5 }, "sine.out");
  st(t.still, span(t.still, t.toreponse), { spot: 0.75 }, "sine.in");
  run(t.but, t.point, 58);
  run(t.point, t.still, 66);
  run(t.still, t.toreponse, TEMP.reponse, "power2.in");
  chip("chip-abime", null, 96, 470, t.damaged + 0.1, t.toreponse - 0.15);

  /* ══════════ THE LAST RESORT ══════════ */

  /* ───────────── « Vers cent trente degrés. » ───────────── */
  // the scale of the pores: the film between its two electrodes, the lithium still going through it — and under it,
  // on the lower electrode, the hot point, its glow coming up through the film. The thermometer lands on 130 on
  // « trente », and stops there: the only number of the film that holds
  const PORES = { ...BENCHED, ...PORED, charge: 0, dent: 1, heat: 0, ions: 0.8, mood: 1 };
  cut(t.toreponse, SET.BENCH, REST, { ...PORES, spot: 0.6, temp: TEMP.reponse });
  shot(t.toreponse, span(t.toreponse, t.tomelt), NEAR, "sine.out", REST.d);
  st(t.toreponse + 0.1, span(t.toreponse + 0.1, t.tomelt), { spot: 0.75 }, "sine.inOut");
  st(t.toreponse + 0.05, span(t.toreponse + 0.05, t.deg130 + 0.35), { temp: 130 }, "power2.out");
  beat("#hud-clock", t.deg130 + 0.3, 1.2);

  /* ───────────── « Le film fond. Ses pores se ferment. Le lithium ne passe plus. Le courant s'arrête. » ───────────── */
  // ONE frame, the film's face from above: on « fond » it glazes from the hot point outward and turns veille; on
  // « ferment » its pores shut one by one, nearest the hot point first — the grains above them stop and pile up;
  // on « passe » the last ones shut and the header turns to « Bloqué »; on « s'arrête » the light lets go. The hot
  // point stops growing; it does not go out. The camera barely closes in
  cut(t.tomelt, SET.BENCH, CLIMAX0, { ...PORES, spot: 0.75, temp: 130 });
  shot(t.tomelt, span(t.tomelt, t.last - 0.3), CLIMAX1, "sine.inOut", CLIMAX0.d);
  st(t.trigger, span(t.trigger, t.shutEnd), { melt: 1 }, "sine.inOut");
  st(t.trigger, 0.4, { litFilm: 1 }, "sine.out");
  st(t.trigger, span(t.trigger, t.shut), { spot: 1 }, "sine.out");
  st(t.trigger, span(t.trigger, t.blocked), { temp: 131 }, "sine.inOut");
  chip("chip-130", null, 96, 470, t.trigger - 0.1, t.shut - 0.3);
  st(t.shut, span(t.shut, t.shutEnd + 0.2), { pores: 0.55 }, "sine.inOut");
  st(t.blocked, 0.9, { pores: 0 }, "sine.inOut");
  st(t.blocked + 0.2, 0.9, { ions: 0.4 }, "sine.inOut");
  beat("#hud-count", t.blocked + 0.3, 1.2);
  chip("chip-ferme", null, 96, 470, t.blocked + 0.25, t.last - 0.12);
  st(t.stops + 0.05, 0.35, { mood: 0 }, "sine.inOut");
  st(t.stops, 0.8, { spot: 0.7 }, "sine.inOut");

  /* ───────────── « C'était son dernier geste. » ───────────── */
  // a slow step back: the film shut, glazed, veille, between its two electrodes — and the hot point still under it.
  // The thermometer creeps down; it stays signal. Nothing promises the film will open again
  const back = t.last - 0.3;
  shot(back, span(back, t.toverdict), REST, "sine.inOut", CLIMAX1.d);
  st(back, span(back, t.toverdict), { temp: 127 }, "sine.inOut");
}
