// 02 · LA CATAPULTE — ouvre → reacteurs (19,7 → 39,8 s, voix v2 ; tout sur les repères du script). THE PIECE PAID IN THE PROMO: the steam.
//   ouvre    under the deck, a whip; the catapult comes apart ON « on » (the L04's own exploded view)
//   eclate   « deux longs cylindres » · « un piston » · « un même chariot » · « son croc » — each part named, a push onto the hook
//   vapeur   the receiver, filling; « d'où vient-elle ? » — along the main, aft, into the dark (the thread opens)
//   reacteurs « Des deux réacteurs nucléaires du navire » — the two vessels light deep in the hull; « va te lancer » — the
//            steam runs up the main to the receiver and the catapult above it (the thread is paid)
import { setAct } from "@kit/overlay.js";
import { SET, AT, VIEW, L04_AT, NG, TANK, PLANT } from "./world.js";

const F = (t) => Math.round(t * 30) / 30;

export default function acte2({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    roues: "scene:roues", ouvre: "ouvre", explode: "explode", eclate: "eclate",
    cyl: "eclate:cylindres", piston: "eclate:piston", chariot: "eclate:chariot", croc: "eclate:croc", eclateEnd: "eclate$",
    vapeur: "vapeur", vap: "vapeur:vapeur", bars: "vapeur:bars", vient: "vapeur:vient",
    reacteurs: "reacteurs", nucl: "reacteurs:nucléaires", avancer: "reacteurs:avancer", lancer: "reacteurs:lancer", end: "reacteurs$",
  });
  setAct(D.tl, 2, t.ouvre - 0.3);

  /* « Alors… on l'ouvre. » — a whip from under your wheels to the catapult; it comes apart ON « on » */
  const whip = t.roues + 0.05;
  shot(whip, t.ouvre - whip, VIEW.expA, "power2.out");
  st(whip, 0.6, { dog: 0, crew: 0, parked: 0 }, "sine.inOut");
  now(t.ouvre, { l04: L04_AT.ouvre });
  shot(t.ouvre, t.eclate - t.ouvre, VIEW.expZ, "sine.inOut", VIEW.expA.d);
  shot(t.eclate, t.cyl + 0.3 - t.eclate, { ...VIEW.expZ, d: 1100, az: 8, el: 24 }, "sine.inOut");
  shot(t.cyl + 0.3, t.piston + 0.3 - t.cyl - 0.3, { ...VIEW.expZ, d: 980, az: -6, el: 28 }, "sine.inOut");
  st(t.explode, 2.2, { explode: 1 }, "power2.out");
  st(t.ouvre, 2.0, { fx: -500, fy: -150, fz: -5300, fs: 3200 }, "sine.inOut");

  /* eclate — each part named */
  now(t.eclate, { l04: L04_AT.eclate });
  now(t.cyl, { named: 1 });
  now(t.piston, { named: 2 });
  st(t.piston + 0.1, 1.2, { shuttle: 1 }, "sine.inOut");
  now(t.chariot, { named: 3 });
  shot(t.piston + 0.3, F(t.chariot + 0.6) - t.piston - 0.3, { ...VIEW.expZ, d: 1250, az: 6 });
  // « …et son croc tient ton avion » : closed again, on the deck — the nose gear, the launch bar in the hook
  const noseAt = F(t.chariot + 0.6);
  cut(noseAt, null, VIEW.nose, { explode: 0, shuttle: 0, under: 0, jet: 1, dog: 1, crew: 0.6, parked: 0.6, named: 3, fx: NG[0], fy: 60, fz: NG[2], fs: 600 });
  const recvAt = F(t.vapeur - 0.12);
  shot(noseAt, recvAt - noseAt, { ...VIEW.nose, d: 400, az: -142 });

  /* vapeur — the receiver; « d'où vient-elle ? » along the main, aft, into the dark */
  cut(recvAt, SET.PONT, VIEW.recv, {
    ...AT.hull, under: 1, ship: 0.5, jet: 0, dog: 0, crew: 0, parked: 0, tank: 0.2, press: 0.3, named: 6,
    hooked: 1, held: 1, strain: 0.6, gas: 0.5, tremble: 0, jbd: 0, mood: 0, hot: 0,
    fx: TANK.at[0], fy: TANK.at[1], fz: TANK.at[2], fs: 1600,
  });
  now(t.vapeur, { l04: L04_AT.ballon });
  shot(recvAt, t.vient - 0.3 - recvAt, { ...VIEW.recv, d: 1200, az: -29 });
  st(t.vap - 0.2, 1.4, { tank: 1 }, "sine.inOut");
  shot(t.vient - 0.3, F(t.reacteurs - 0.12) - t.vient + 0.3, { ...VIEW.recv, d: 2400, az: -42, el: 14 }, "sine.inOut"); // « d'où vient-elle ? » : a step back, the main leaving it
  now(t.vient, { named: 0 });

  /* reacteurs — the two vessels light deep in the hull; the steam runs up the main to the catapult */
  const plantAt = F(t.reacteurs - 0.12);
  cut(plantAt, SET.PONT, VIEW.plant, { ...AT.hull, ship: 0.4, under: 0.6, plant: 0.6, tank: 1, press: 0.3, named: 0, fx: 0, fy: -2050, fz: 900, fs: 2600 });
  now(t.reacteurs, { l04: L04_AT.nucleaire });
  st(t.nucl - 0.3, 0.9, { plant: 1 }, "sine.out");
  const mainAt = t.lancer - 0.5;
  shot(plantAt, F(mainAt) - plantAt, { ...VIEW.plant, d: 4700, az: -8 });
  st(t.avancer - 0.2, 1.0, { speed: 1 }, "sine.inOut"); // « ce qui le fait avancer »
  now(mainAt, { l04: L04_AT.vapeur2 });
  st(mainAt, 1.4, { feed: 1 }, "sine.inOut"); // the front climbs the main (its dashes run at a fixed speed)
  cut(F(mainAt), null, { ...VIEW.main, d: 4700 }, {}); // a cut matched on the steam: up the main, to the receiver
  shot(F(mainAt), t.end + 0.5 - F(mainAt), VIEW.main, "sine.inOut");
  st(mainAt, 1.6, { fx: -100, fy: -1000, fz: -2400, fs: 3500 }, "sine.inOut");
  st(t.lancer + 0.1, 0.4, { valve: 1, press: 1 }, "power2.out");
  now(t.lancer + 0.25, { fils: 2 }); // the steam's thread, paid
}
