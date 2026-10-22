// c4 · Séparer, Condamner et identifier (jusqu'au « seuil ») — HAND.c34 → HAND.c45.
// The poste, never left: the travel along your bay lands on your breaker (closed, its contacts hidden) and glides to
// the line disconnector; its arms turn apart and the air between the contacts reads; the camera follows the closing
// axis down to the box: padlock, sign; the attestation goes from one chargé to the other; the habilitation, B then H;
// a plunge over the row of identical gantries, yours lit; the neighbour beside it; the pole rises, its detector mute —
// and the camera is already turning toward the neighbour (HAND.c45). The plan: docs/L02-actes.md, c4.
import { fact } from "@kit/long.js";
import { SET, AT, HAND, span, seam } from "./world.js";

const P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 };

/* ── the poses (complete), in the order they come ── */
// your breaker pole (phase 1), closed and opaque: the travel of the seam lands on it and pushes in
const BRK = { ...P, tx: 1700, ty: 580, tz: 600, d: 920, az: -38, el: 10, side: -160 };
// the line disconnector of phase 1, then a slow orbit up over it (its arms turn toward +z: toward us)
const LS1 = { ...P, tx: 800, ty: 540, tz: 640, d: 1150, az: -24, el: 22, side: -120 };
const LS2 = { ...P, tx: 800, ty: 580, tz: 680, d: 1050, az: -20, el: 32, side: -80 };
// the gap, from above (the phases behind leave the frame): aimed between the two open contacts (575 / 1025,
// z ≈ 817), where the arms used to meet — closed a straight bar, open two prongs and the air between them
const GAP1 = { ...P, tx: 800, ty: 640, tz: 720, d: 950, az: -14, el: 48, side: 0 };
const GAP2 = { ...P, tx: 800, ty: 645, tz: 740, d: 820, az: -8, el: 52, side: 0 }; // at el 57 the open arms lie over their columns
// the reverse shot: low, 4.5 m behind you (camera ≈ 150, 40, 1 400), you whole in the foreground, the open
// disconnector above (2 m behind your helmet, you were only a helmet and the pole a bar across the frame)
const CC1 = { ...P, tx: 510, ty: 209, tz: 824, d: 700, az: -32, el: -14, fov: 50 };
const CC2 = { ...P, tx: 540, ty: 260, tz: 800, d: 640, az: -30, el: -17, fov: 48 };
// down along the column and its closing axis to the box at its foot; the padlock, the sign (it faces +z)
const BOX1 = { ...P, tx: 585, ty: 150, tz: 650, d: 420, az: -24, el: 12 };
const LK1 = { ...P, tx: 592, ty: 118, tz: 660, d: 235, az: -30, el: 12 };
const LK2 = { ...P, tx: 602, ty: 112, tz: 656, d: 190, az: -10, el: 8 };
// the two chargés (x 1 180 and 1 040, z 1 330), then their hands: the attestation
// (the sheet lies almost flat: it reads from above, el ≥ 25)
const CH1 = { ...P, tx: 1110, ty: 112, tz: 1325, d: 520, az: -22, el: 14 };
const CH2 = { ...P, tx: 1110, ty: 112, tz: 1322, d: 370, az: -16, el: 28 };
const CH3 = { ...P, tx: 1110, ty: 118, tz: 1322, d: 420, az: -30, el: 20 };
// you at your spot, the pole in your hands: a pan from the chargés, then a slow orbit
// (beyond az −35 at this distance your gantry's leg crosses the frame)
const Y1 = { ...P, tx: 300, ty: 125, tz: 980, d: 520, az: -4, el: 10, side: -100 };
const Y2 = { ...P, tx: 300, ty: 135, tz: 980, d: 450, az: -30, el: 14, side: -100 };
// the row of identical gantries from high, travelled slowly; then the plunge to yours, at beam height
const ID1 = { ...P, tx: 0, ty: 1600, tz: 1800, d: 9000, az: -12, el: 50, fov: 30 };
const ID2 = { ...P, tx: 0, ty: 1600, tz: -600, d: 8600, az: -14, el: 50, fov: 30 };
const GT1 = { ...P, tx: 0, ty: 1450, tz: -900, d: 3000, az: -32, el: 8 };
const GT2 = { ...P, tx: 0, ty: 1450, tz: -1900, d: 2700, az: -40, el: 6 };
const GT3 = { ...P, tx: 150, ty: 1300, tz: -300, d: 2500, az: -34, el: 7 };
// the head of the pole on your dropper (WORKAT[0]: 300, 1 056, 600), then HAND.c45.from[0]
// (close: at d 800 the head was lost among your bright droppers and the neighbour's)
const DR1 = { ...P, tx: 300, ty: 1045, tz: 600, d: 320, az: -22, el: -4 };
const DR2 = { ...P, tx: 300, ty: 1050, tz: 590, d: 280, az: -26, el: -3 };

export default function ({ D }) {
  const { st, now, shot, cut, tl } = D;
  const at = D.at;
  const [from] = span(D, "c4");
  const t0 = from + HAND.c34.opt.after; // the seam's move has landed

  /* ── Séparer · sec1: the travel lands on your breaker, closed — its contacts, you don't see them ── */
  seam(D, "c34", "in", { set: SET.POSTE, state: { ...AT.poste, open: 1, arms: 0, perche: 0, geste: 1, kv: 0, kvOn: 1 } });
  const tGlide = at("sec1:alors") - 0.14;
  shot(t0, tGlide - t0, BRK);
  st(from + 0.3, 2.6, { fx: 1700, fy: 600, fz: 600, fs: 900, poste: 0.6 });
  st(at("sec1:vois") - 0.3, 0.5, { threat: 0.4 });
  // "Alors il faut ouvrir l'air": the camera glides toward −x, to the line disconnector
  st(at("sec1:ouvrir") - 0.1, 0.6, { threat: 0 });
  const tLs = tGlide + 3.0;
  shot(tGlide, tLs - tGlide, LS1);
  st(tGlide, 3.0, { fx: 800, fy: 640, fz: 600, fs: 800 });

  /* ── sec2: "Voici le sectionneur" — the poste dims, it is named; "quand il s'ouvre": its arms start to turn ── */
  st(at("sec2:sectionneur") - 0.4, 1.2, { poste: 0.4 });
  now(at("sec2:sectionneur"), { named: 4 }); // named, then back to its greys before it opens
  now(at("sec2:coupure") + 0.6, { named: 0 });
  const tFollow = at("sec2:s'ouvre") - 0.18;
  shot(tLs, tFollow - tLs, LS2);
  st(at("sec2:s'ouvre"), 3.2, { sopen: 1 }, "sine.inOut");

  /* ── sec3: the camera follows the turning arm to the gap; "de l'air"; the reverse shot from behind you ── */
  const tAir = at("sec3:air") - 0.1;
  shot(tFollow, tAir - tFollow, GAP1);
  const tCc = at("sec3:propres") - 0.55;
  shot(tAir, tCc - tAir, GAP2);
  const HERE = { ...AT.poste, open: 1, sopen: 1, poste: 0.4, named: 0, arms: 0, perche: 0 };
  cut(tCc, null, CC1, { ...HERE, fx: 600, fy: 360, fz: 850, fs: 1200 });
  const tDown = at("sec3:referme") - 0.9;
  shot(tCc, tDown - tCc, CC2);
  // "Mais un sectionneur… ça se referme": the closing axis breathes signal
  st(at("sec3:referme") - 0.2, 0.5, { threat: 0.6 });

  /* ── Condamner · cad1: down along the column and its axis to the box; "quoi qu'il arrive": it beats harder ── */
  now(at("cad1"), { geste: 2 });
  const tBox = at("cad1:ouvert") - 0.5;
  shot(tDown, tBox - tDown, BOX1);
  st(tDown + 0.2, 4.6, { fx: 580, fy: 125, fz: 645, fs: 240 });
  st(at("cad1:quoi") - 0.1, 0.4, { threat: 1 });
  const tLock = at("cad2:serrure") - 0.25;
  shot(tBox, tLock - tBox, LK1);

  /* ── cad2: the padlock on, its shackle snaps; the sign hangs and reads; a slow orbit to face it ── */
  st(at("cad2:serrure") - 0.2, 0.6, { lock: 0.5 });
  st(at("cad2:cadenas") - 0.2, 0.25, { lock: 1 }, "power2.in");
  now(at("cad2:cadenas"), { named: 6 });
  st(at("cad2:cadenas") + 0.05, 0.3, { threat: 0 });
  st(at("cad2:pancarte") - 0.1, 2.0, { sign: 1 }, "sine.out");
  const tBack = at("cad3") - 0.5;
  shot(tLock, tBack - tLock, LK2);

  /* ── cad3: a pull-back from the sign to the two chargés; "remet": the attestation passes, framed tight ── */
  now(tBack, { named: 0 });
  st(tBack, 1.6, { poste: 1, bays: 0.25 });
  st(tBack, 3.2, { fx: 1110, fy: 110, fz: 1330, fs: 450 });
  st(at("cad3") - 0.2, 0.8, { chief: 1 });
  const tHands = at("cad3:remet") - 1.1;
  shot(tBack, tHands - tBack, CH1);
  const tDrift = at("cad3:papier") + 0.9;
  shot(tHands, tDrift - tHands, CH2);
  st(at("cad3:remet") - 0.35, 1.6, { paper: 1 });
  const tPan = at("habil") - 0.35;
  shot(tDrift, tPan - tDrift, CH3);

  /* ── habil: a pan from the chargés to you, then a slow orbit round you; B, then H ── */
  const tOrbit = tPan + 3.3;
  shot(tPan, tOrbit - tPan, Y1);
  st(tPan, 3.2, { fx: 300, fy: 120, fz: 980, fs: 450 });
  st(tPan + 1.0, 0.8, { chief: 0 });
  const tRise = at("ident") - 0.2;
  shot(tOrbit, tRise - tOrbit, Y2);
  st(tOrbit + 1.5, 2.5, { bays: 1 });
  fact(tl, { id: "c4-b", k: "Habilitation", v: "B", s: "Basse tension", from: at("habil:b"), to: at("habil:h#2") - 0.08 });
  fact(tl, { id: "c4-h", k: "Habilitation", v: "H", s: "Haute tension", tone: "signal", from: at("habil:h#2"), to: at("habil$") + 0.25 });

  /* ── Identifier · ident: a rising pull-back to the row of identical gantries, travelled slowly; yours lights ── */
  now(at("ident"), { geste: 3 });
  const tRow = tRise + 4.7;
  shot(tRise, tRow - tRise, ID1, "sine.inOut", Y2.d);
  st(tRise, 4.7, { fx: 0, fy: 900, fz: 0, fs: 4000 });
  const tPlunge = at("ident:pied") - 0.2;
  shot(tRow, tPlunge - tRow, ID2);
  st(at("ident:pied") - 0.1, 1.0, { mark: 1 });

  /* ── ident2: the plunge stops at beam height, between the two bays; it drifts to the neighbour, and back ── */
  const tSide = at("ident2") + 0.3;
  shot(tPlunge, tSide - tPlunge, GT1, "sine.inOut", ID2.d);
  st(tPlunge, 2.8, { fx: 0, fy: 1400, fz: -1000, fs: 2600 });
  const tBackToYours = at("ident2:suffit") - 0.6;
  shot(tSide, tBackToYours - tSide, GT2);
  const tSeuil = at("seuil") - 0.1;
  shot(tBackToYours, tSeuil - tBackToYours, GT3);

  /* ── seuil: down to your dropper, the pole rises, its head on the conductor, mute; "Abonne-toi": the name lights,
        the camera already turning toward the neighbour (HAND.c45.from[0] at the seam − before) ── */
  const tPush = at("seuil:oui") - 0.25;
  shot(tSeuil, tPush - tSeuil, DR1, "sine.inOut", GT3.d);
  st(tSeuil, 1.2, { mark: 0 });
  st(tSeuil, 3.0, { fx: 300, fy: 1000, fz: 600, fs: 900 });
  st(at("seuil:maintenant") + 0.3, 2.4, { perche: 1, arms: 1 });
  const tTurn = at("seuil:abonne") - 0.2;
  shot(tPush, tTurn - tPush, DR2);
  const tOut = D.at(HAND.c45.at) - HAND.c45.opt.before;
  shot(tTurn, tOut - tTurn, HAND.c45.from[0], "sine.inOut", DR2.d); // a pull-back by ratio that turns
  st(tTurn, 2.3, { fx: 600, fy: 600, fz: 0, fs: 1800 }); // back to AT.poste's light before the seam
  tl.to(".hud__brand", { color: "#5cffb0", duration: 0.2 }, at("seuil:abonne"));
  tl.to(".hud__brand", { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, at("seuil$") - 0.1);
  seam(D, "c45", "out");
}
