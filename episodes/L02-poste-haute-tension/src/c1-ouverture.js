// c1 · Introduction, « Alors… on l'ouvre », Le poste (jusqu'à « distance ») — 0 → HAND.c12 (88,44 s).
//
// The hook in macro: the head of the detector hooked ON your cut conductor (clear ink), the neighbour burning behind;
// the camera moves from the first frame and closes on the mute head while a faint life creeps into your conductor.
// Down the pole to you, standing at the foot of the bay; the five gestures light in the header; at your feet the
// earthing set, lit — it keeps you alive. The same clamp, at the same place of the picture, in Virginia 1987: its
// earth end comes undone, a pulse runs down the hanging cable, the camera rises along it… and the rise goes on in the
// poste, up the gantry leg with you. The beam, your strings, a pan to the neighbour's strings. The pan turns back into
// a pull-back (the account name lights: "Abonne-toi") that whips under the card onto your bay in three quarters —
// "Alors… on l'ouvre": the bay comes apart ON "on". Each part named lights; the camera dives to the mesh, then rises
// (the bay closes, your line comes alive) to the whole poste, and higher, until the poste is the point on the map of
// France; the stations light, the lines trace; a dive back onto the point lands in the poste, in front of you under
// your live line: the field rises from the ground. Up to the conductor → a cut on your hand on the beam: the air gives
// way, the arc reaches for it and dies short. A pull-back from the hand: the envelope of forbidden air hugs the
// conductors, and the camera starts sinking toward the ground — the seam with c2.
import { fact } from "@kit/long.js";
import { SET, AT, POSE0, WORKAT, HAND, seam } from "./world.js";
import { EARTH, V87 } from "./plan.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };
const W0 = WORKAT[0];
/** A cut lands ON a frame (30 fps): a cut a few ms after a frame makes the `mix` fade keep an older frame — the picture jumps back. */
const onFrame = (t) => Math.round(t * 30) / 30;

/* ── the hook: the head hooked ON your conductor, seen from +x so that the conductor leaves the head's body (the
      orchestrator pastes it as POSE0; until then this file cuts to it on frame 0) ── */
const HOOK = { tx: W0[0], ty: W0[1] - 7, tz: W0[2], d: 150, az: 22, el: 2, fov: 34, shift: 0, side: 280, roll: 0, drift: 0.3 };
const HOOK_IN = { ...HOOK, d: 108, az: 11, el: 0 }; //                                       d × 0.7, a turn onto the head

/* ── the poste: you, the earthing set at your feet ── */
const YOU_FULL = { ...P, tx: 320, ty: 105, tz: 980, d: 760, az: -16, el: 8, side: -40 }; //   you standing, the pole up
const AT_CLAMP = { ...P, tx: 295, ty: 35, tz: 1235, d: 270, az: -24, el: 14 }; //               the earth end at your feet

/* ── Virginia 1987: the same clamp at the same place of the picture, then up its cable ── */
const T87 = [V87.towers[0], 0, 1200]; // the earth terminal of the first tower's set (world.js · v87)
const moved = (pose, from, to) => ({ ...pose, tx: pose.tx - from[0] + to[0], ty: pose.ty - from[1] + to[1], tz: pose.tz - from[2] + to[2] });
const C87 = moved(AT_CLAMP, EARTH.a, T87);
// the hanging earth end, framed tight, the tower's foot (its lattice) behind (seen: c1-f, V4 recentred)
const C87_PRE = { ...P, tx: V87.towers[0] + 140, ty: 125, tz: 1325, d: 300, az: -6, el: -6 };
const C87_DRIFT = { ...C87_PRE, d: 265, az: -3 };
const C87_UP = { ...P, tx: V87.towers[0] + 300, ty: 1500, tz: 1250, d: 1600, az: -30, el: 4 }; //  rising along the cable

/* ── the poste: up the gantry leg, the beam, the neighbour ── */
const CLIMB_LOW = { ...P, tx: 0, ty: 600, tz: 1180, d: 700, az: -38, el: -6, side: -60 };
const CLIMB_MID = { ...P, tx: 0, ty: 1450, tz: 1180, d: 900, az: -44, el: -4, side: -60 };
const BEAM = { ...P, tx: -100, ty: 1650, tz: 650, d: 1150, az: -58, el: 4, side: -100 }; //    your strings, under the beam
const NEIGH = { ...P, tx: -80, ty: 1600, tz: -2400, d: 3100, az: -26, el: 6 }; //               the neighbour's strings (a pan)
const BACK = { ...P, tx: 700, ty: 1000, tz: 0, d: 2900, az: -36, el: 10, side: -120 }; //      pulling back toward your bay
const BAY = { ...P, tx: 1400, ty: 600, tz: 0, d: 4200, az: -40, el: 14, side: -150 }; //       your bay in three quarters
const BAY_OPEN = { ...BAY, d: 5400, az: -42, el: 16 }; //                                        the pull-back as it comes apart
const BAY_ORBIT = { ...BAY, ty: 500, d: 5200, az: -18, el: 28 }; //                               the orbit (high: above the +z bays)
const DIVE = { ...P, tx: 1600, ty: -330, tz: 200, d: 3600, az: -20, el: 40, side: -120 }; //   down to the mesh
const WIDE = { ...P, tx: 1500, ty: 300, tz: -1200, d: 11000, az: -35, el: 24 }; //              the whole poste
const HIGH = { ...P, tx: 1500, ty: 0, tz: -1200, d: 26000, az: -30, el: 64, fov: 30 }; //     so high it is a point

/* ── the map ── */
const MAP_HERE = { ...P, tx: 2600, ty: 0, tz: -5200, d: 3000, az: 0, el: 72, fov: 30 };
const MAP = { ...P, tx: 0, ty: 0, tz: -300, d: 40000, az: 0, el: 72, fov: 30 };
const MAP_HOLD = { ...MAP, tx: 500, tz: -1300, d: 36000 };
const MAP_DIVE = { ...MAP_HERE, d: 7000 };

/* ── the poste: you under your live line, the field; the hand on the beam, the arc; the envelope ── */
const FALL = { ...P, tx: 400, ty: 300, tz: 900, d: 5200, az: -66, el: 42, side: -100 }; //     the dive lands in the poste
const FIELD = { ...P, tx: 300, ty: 320, tz: 920, d: 1100, az: -72, el: -8, side: -60 }; //      the field, in profile
const FIELD_2 = { ...P, tx: 300, ty: 300, tz: 940, d: 1020, az: -64, el: -6, side: -60 };
const RISE = { ...P, tx: 250, ty: 1100, tz: 650, d: 1300, az: -70, el: -10, side: -100 }; //    up to the conductors
const AIR = { ...P, tx: -120, ty: 1800, tz: 680, d: 1050, az: -58, el: 2, side: -100 }; //       the hand, the span, the gap
const AIR_IN = { ...AIR, d: 980, az: -54 };
const AIR_OUT = { ...AIR, tx: -140, ty: 1780, d: 1020, az: -50 };
const ENV = { ...P, tx: 0, ty: 1250, tz: 100, d: 2700, az: -48, el: 8, side: -60 }; //          the envelope around the three phases

export default function ({ D }) {
  const { st, now, shot, cut } = D;
  const at = D.at;

  /* ═════════ accroche — 400 000 V, coupée, le détecteur dit rien… elle peut encore te tuer ═════════ */
  if (POSE0.az !== HOOK.az || POSE0.d !== HOOK.d) cut(0, null, HOOK); // gone once world.js · POSE0 = HOOK
  shot(0, at("promesse") - 0.3, HOOK_IN); // moving from frame 1: closer, turning onto the mute head
  fact(D.tl, { id: "c1-kv", k: "Ta ligne", v: "400 000 V", tone: "signal", from: 0.3, to: at("accroche:rien") - 0.2 });
  // "si tu la touches": a faint life creeps into your dark conductor — what the detector does not see
  st(at("accroche:touches"), 1.0, { induced: 0.35 });
  st(at("accroche:touches") + 1.0, 0.7, { induced: 0.15 });

  /* ═════════ promesse — cinq gestes… le dernier te garde en vie ═════════ */
  // down the pole, from the head to your hands: you, whole, at the foot of the bay (one move)
  shot(at("promesse"), 4.0, YOU_FULL);
  st(at("promesse"), 4.0, { fx: 300, fy: 300, fz: 1050, fs: 1300 });
  st(at("promesse") + 0.4, 1.5, { induced: 0 });
  const g = at("promesse:cinq");
  [1, 2, 3, 4, 5].forEach((k, i) => now(g + i * 0.35, { geste: k }));
  now(at("promesse:dernier") + 0.5, { geste: 0 });
  // "le dernier": at your feet the earthing set comes down onto its terminal; "te garde en vie": it lights
  shot(at("promesse") + 4.0, at("curiosite:1987") - 0.15 - (at("promesse") + 4.0), AT_CLAMP);
  st(at("promesse:dernier"), 1.3, { clamps: 0.3, fx: 290, fy: 60, fz: 1240, fs: 700 });
  now(at("promesse:garde"), { named: 8 });

  /* ═════════ curiosite — un soir de 1987… une pince de terre défaite dans le mauvais ordre ═════════ */
  // the same clamp at the same place of the picture: Virginia, night, the earthing sets on, NO ONE there
  const t87 = onFrame(at("curiosite:1987") - 0.15);
  cut(t87, SET.LIGNE, C87, { ...AT.ligne, live: 0, earthed: 1, v87: 1, clamps: 2, geste: 0, kv: 0, kvOn: 0, fx: T87[0] + 200, fy: 900, fz: 1200, fs: 2600 }, { fade: 0.3, kind: "dip" });
  fact(D.tl, { id: "c1-87", k: "Un soir de", v: "1987", from: at("curiosite:1987"), to: at("curiosite:défaite") - 0.2 });
  st(at("curiosite:défaite") - 0.1, 0.9, { wrong: 1 }); //                the earth end undone first: it hangs
  st(at("curiosite:mauvais"), 0.35, { shock: 0.4 }, "power2.out"); //   a pulse down the hanging cable
  st(at("curiosite:mauvais") + 0.35, 0.9, { shock: 0 });
  // "le bon ordre… tu l'auras à la fin": the camera rises along the cable, without answering — the rise goes on in the poste
  const t87up = at("curiosite:bon") - 0.1; // 21.1
  const t87hang = at("curiosite:mauvais") + 0.3; // the clamp has finished rising to hang
  shot(t87 + 0.05, t87hang - t87 - 0.05, C87_PRE);
  shot(t87hang, t87up - t87hang, C87_DRIFT);
  const tClimb = onFrame(at("defi") - 0.2); // 23.3
  D.match(tClimb, [C87_DRIFT, C87_UP], [CLIMB_LOW, CLIMB_MID], {
    set: SET.POSTE,
    state: { ...AT.poste, you: 1, walk: 1, climb: 0.1, arms: 0, perche: 0, geste: 0, kv: 0, kvOn: 0, fx: 0, fy: 900, fz: 1130, fs: 1400 },
    before: tClimb - t87up,
    after: 2.5,
    fade: 0.2,
  });

  /* ═════════ defi — c'est toi qui montes… tout en haut… sa voisine reste sous tension ═════════ */
  st(tClimb, 5.0, { climb: 0.9 }, "none");
  shot(tClimb + 2.5, at("defi:juste") - (tClimb + 2.5), BEAM); // "tout en haut": the beam, your strings
  now(at("defi:tout"), { named: 2 });
  st(at("defi:tout"), 2.0, { fx: -100, fy: 1650, fz: 600, fs: 1600 });
  // "sa voisine": the camera pans toward −z, onto the neighbour's strings, burning, one bay away
  const tPan = at("defi:juste");
  const tBack = at("abohook") - 0.3;
  shot(tPan, tBack - tPan, NEIGH, "sine.inOut", BEAM.d); // by ratio, 3.6 s: no whip
  now(tBack, { named: 0 }); // off once the pan has left your strings

  /* ═════════ abohook — entre elle et toi… Abonne-toi : the pan turns into a pull-back, already on its way ═════════ */
  const tWhip = at("ouvre") - 0.9; // 36.6: the card comes in, the pull-back whips under it
  shot(tBack, tWhip - tBack, BACK, "sine.in");
  shot(tWhip, at("ouvre:on") - 0.1 - tWhip, BAY, "power2.out");
  st(at("abohook"), 1.6, { you: 0, fx: 1400, fy: 600, fz: 0, fs: 2600 });
  now(at("abohook") + 1.7, { climb: 0, walk: 0.8 }); // unseen: you are gone
  D.tl.to(".hud__brand", { color: "#5cffb0", duration: 0.2 }, at("abohook:abonne"));
  D.tl.to(".hud__brand", { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, at("abohook:voir") + 0.1);

  /* ═════════ ouvre — « Alors… on l'ouvre. » : the bay comes apart ON "on", alone in its plan ═════════ */
  st(at("explode"), 2.2, { explode: 1 }, "power2.out");
  shot(at("explode"), at("couches") - at("explode"), BAY_OPEN, "sine.out", BAY.d);

  /* ═════════ couches — portique, isolateurs, disjoncteur, sectionneur… et sous tes pieds, le maillage ═════════ */
  shot(at("couches"), at("couches:sectionneur") - at("couches"), BAY_ORBIT); // a slow orbit, rising above the bays
  now(at("couches:portique"), { named: 1 });
  now(at("couches:isolateurs"), { named: 2 });
  now(at("couches:disjoncteur"), { named: 3 });
  now(at("couches:sectionneur"), { named: 4 });
  shot(at("couches:sectionneur"), at("lieu") - 0.95 - at("couches:sectionneur"), DIVE, "sine.inOut", BAY_ORBIT.d); // "sous tes pieds": the camera dives
  // the mesh lights by a ramp, not on one frame (named 5 would switch it on at once)
  now(at("couches:maillage") - 0.1, { named: 0 });
  st(at("couches:maillage") - 0.1, 0.8, { mesh: 0.7 });
  st(at("couches:sous"), 2.2, { fx: 1400, fy: -300, fz: 200, fs: 2600 });
  st(at("couches:pourquoi") - 0.5, 0.5, { mesh: 1 }); // "pourquoi": it breathes
  st(at("couches:pourquoi"), 1.4, { mesh: 0 });

  /* ═════════ lieu — un poste électrique, le carrefour… (card « Le poste ») ═════════ */
  // the dive turns into a rise under the card: the bay closes, your line comes alive
  const tCard = at("lieu") - 0.9; // 48.08
  st(tCard, 1.5, { explode: 0 });
  now(tCard + 0.4, { named: 0 });
  st(tCard, 0.8, { live: 1 });
  now(tCard, { kvOn: 1, kv: 400 });
  st(tCard, 2.5, { fx: 1500, fy: 300, fz: -1200, fs: 9000 });
  shot(tCard, at("lieu:carrefour") - tCard, WIDE, "sine.inOut", DIVE.d); // the whole poste on "carrefour"
  st(at("lieu:croisent") - 0.2, 0.9, { poste: 0.6 }); //                   the lines that come in stand out
  // higher and higher, until the poste is a point → the point of the map (a match on the shape and the move)
  const tMap = onFrame(at("reseau") + 0.1); // 54.4
  D.match(tMap, [WIDE, HIGH], MAP_HERE, {
    set: SET.MAP,
    state: { ...AT.map, here: 1, geste: 0, kv: 0, kvOn: 0 },
    before: tMap - at("lieu:carrefour"),
    after: 0.9,
    fade: 0.3,
  });

  /* ═════════ reseau — près de 2 900, presque cent mille kilomètres… et celui-ci ═════════ */
  const mapOut = { ...MAP_HERE, d: MAP_HERE.d * Math.pow(HIGH.d / WIDE.d, 0.9 / (tMap - at("lieu:carrefour"))) };
  shot(tMap + 0.9, at("reseau:reliés") + 1.5 - (tMap + 0.9), MAP, "sine.inOut", mapOut.d); // back to the whole of France
  st(at("reseau:près"), 1.4, { dots: 1 }, "power1.inOut");
  st(at("reseau:reliés"), 2.2, { links: 1 }, "power1.inOut");
  fact(D.tl, { id: "c1-postes", k: "En France", v: "≈ 2 900", s: "postes électriques", from: at("reseau:2900"), to: at("reseau:presque") + 0.6 });
  fact(D.tl, { id: "c1-km", k: "Reliés par", v: "≈ 100 000 km", s: "de lignes aériennes", from: at("reseau:presque") + 0.6, to: at("reseau:celui") - 0.1 });
  const tDive = at("reseau:celui") - 0.05; // 61.1
  shot(at("reseau:reliés") + 1.5, tDive - (at("reseau:reliés") + 1.5), MAP_HOLD);
  // "celui-ci": the dive back onto the point lands in the poste, in front of you
  const tField = onFrame(at("champ") - 0.05); // 62.6
  D.match(tField, [MAP_HOLD, MAP_DIVE], FALL, {
    set: SET.POSTE,
    state: { ...AT.poste, live: 1, you: 1, walk: 0.8, arms: 0, perche: 0, geste: 0, kv: 400, kvOn: 1, fx: 300, fy: 400, fz: 800, fs: 1500 },
    before: tField - tDive,
    after: 0.9,
    fade: 0.3,
  });

  /* ═════════ champ — tu baignes dans un champ électrique… environ 5 000 V par mètre… tu ne sens rien ═════════ */
  shot(tField + 0.9, 2.1, FIELD); //                           it settles in front of you, in profile
  st(at("champ:champ") - 0.1, 1.6, { efield: 1 });
  shot(tField + 3.0, at("champ:sens") - 0.3 - (tField + 3.0), FIELD_2); // a slow drift along the field
  fact(D.tl, { id: "c1-field", k: "Au niveau du sol", v: "≈ 5 000 V / m", s: "sous une ligne de 400 000 V", tone: "signal", from: at("champ:cinq"), to: at("champ$") - 0.1 });
  const tAir = onFrame(at("air") - 0.08); // 71.47
  shot(at("champ:sens") - 0.3, tAir - (at("champ:sens") - 0.3), RISE, "sine.in"); // "tu ne sens rien": up to the conductors

  /* ═════════ air — trop près d'un conducteur, il cède… et l'arc vient te chercher ═════════ */
  // a cut on the same conductor, up close: your hand on the beam
  cut(tAir, null, AIR, { ...AT.poste, live: 1, you: 1, walk: 1, climb: 1, arms: 2, perche: 0, efield: 0, geste: 0, kv: 400, kvOn: 1, fx: -170, fy: 1600, fz: 600, fs: 600 });
  shot(tAir, at("arcair") - tAir, AIR_IN); //                 a slow push toward the gap
  st(at("air:trop"), 0.7, { airArc: 0.5 }); //               the air tenses
  st(at("arcair"), 0.15, { airArc: 1 }, "power2.out"); //    "cède": the arc reaches for your hand, and stops short of it
  st(at("air:sans") - 0.1, 0.5, { airArc: 0 }); //           "sans que tu aies touché": it dies
  st(at("air:sans") + 0.2, 1.0, { arms: 0 }); //              the hand draws back
  shot(at("arcair"), at("distance") - at("arcair"), AIR_OUT);

  /* ═════════ distance — des distances qu'on ne franchit pas… des mètres entiers d'air interdit ═════════ */
  const tSink = D.at(HAND.c12.at) - HAND.c12.opt.before; // 87.24: on HAND.c12.from[0]
  shot(at("distance"), at("distance:autour") + 1.8 - at("distance"), ENV, "sine.inOut", AIR_OUT.d); // a pull-back from the hand
  st(at("distance"), 0.9, { you: 0, fx: 0, fy: 1300, fz: 100, fs: 2400 });
  now(at("distance") + 1.0, { climb: 0, walk: 0.8, arms: 0 });
  st(at("distance:autour"), 2.0, { envelope: 1 }); //          the envelope hugs the three droppers
  shot(at("distance:autour") + 1.8, tSink - (at("distance:autour") + 1.8), HAND.c12.from[0]);
  st(at("distance:mètres"), 0.3, { envelope: 0.7 }); //        "des mètres entiers": it breathes
  st(at("distance:mètres") + 0.3, 0.35, { envelope: 1 });
  st(tSink + 0.06, 1.1, { envelope: 0 });

  /* the seam with c2: the camera sinks toward the ground and goes on sinking */
  seam(D, "c12", "out");
}
