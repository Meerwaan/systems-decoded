// (02 · LA CATAPULTE) — tient → tir (40,5 → 55,3 s): the launch, PLAYED WHOLE (v2, docs/HS04-v2-montage.md § 6-7).
//   tient  « Ton avion tire » the cores · « La catapulte tire » the shuttle, 15 cm · « Et la pièce… tient » the neck
//   test   « Paré pont » your dog kneels · « Paré partout » the cabin · « Paré feu » the dog, his vest · « La vanne
//          s'ouvre » · « La vapeur se jette dans les cylindres » the cylinders light, aft to fore
//   tir    « Et la pièce casse » the neck breaks (broken 1) · « Le chariot t'arrache vers l'avant » nose gear + shuttle,
//          tracked · « Deux secondes environ… » tracked from behind-port, high, the bow comes · « le pont s'arrête sous
//          toi. Tu voles. » tracked from port-ahead: the bow slides back under you, the sea, the climb — and black
//          (D.cliff, « Réponse · sur YouTube »). The header « Ton Rafale » 0 → 240 km/h → « En vol » (kmhOn, kmh).
//   The locks of world.js (broken 0, shuttle ≤ 0.15, run 0) fall for `tir` only: put back under the black.
// No `ride` here: every tracked shot moves its aim (tz) with your aircraft by the launch's own law (launchZ), a
// translation along the deck — the camera never turns.
// Also: the open threads, for the whole film (D.threads): curiosite (1), scene (2), vapeur (3, paid in acte2), and the
// scene's « faite pour casser », paid on « casse » (→ 1: the three wires stay open, for YouTube).
import { SET, AT, VIEW, L04_AT, NG, NECK, DOG, CABIN, VALVE, SHUTTLE_STOP, BOW_EDGE } from "./world.js";

const F = (t) => Math.round(t * 30) / 30;

export default function acte3({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    tient: "tient", catapulte: "tient:catapulte", piece: "tient:pièce", tientW: "tient:tient",
    test: "test", partout: "test:partout", feu: "test:feu", vanne: "test:vanne", vapeur: "test:vapeur", jette: "test:jette",
    tir: "tir", casse: "tir:casse", chariot: "tir:chariot", deux: "tir:deux", le: "tir:le#2", arrete: "tir:arrête",
    tu: "tir:tu", voles: "tir:voles",
  });

  /* the threads: the counter steps and pops on the cues fil1-3 (the sound « threads » reads the same) */
  const [f1, f2, f3] = D.threads(["curiosite$", "scene$", "vapeur$"], { set: false });
  now(f1, { fils: 1 });
  now(f2, { fils: 2 });
  now(f3, { fils: 3 });

  /* tient — back on the deck, the aircraft whole again, at full power */
  const deck = { ...AT.deck, gas: 1, tremble: 1, jbd: 1, strain: 1, hooked: 1, held: 1, dog: 1, crew: 0.6, parked: 0.6, sig: 3, mood: 1, hot: 0.12 };
  const tAt = F(t.tient - 0.12);
  cut(tAt, SET.PONT, VIEW.tail, { ...deck, broken: 0, shuttle: 0, run: 0, alt: 0, kmhOn: 0, kmh: 0, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200 });
  now(t.tient, { l04: L04_AT.plein });
  const shutAt = F(t.catapulte - 0.1);
  shot(tAt, shutAt - tAt, { ...VIEW.tail, d: 1000, el: 8 });
  cut(shutAt, null, VIEW.shut, { fx: NG[0], fy: 40, fz: NG[2], fs: 400 });
  st(t.catapulte + 0.3, 0.8, { shuttle: 0.15 }); // « la catapulte tire » : 15 cm, the slack gone
  const neckAt = F(t.piece - 0.12);
  shot(shutAt, neckAt - shutAt, { ...VIEW.shut, d: 310 });
  cut(neckAt, null, VIEW.neck, { named: 5, fx: NECK[0], fy: 30, fz: NECK[2], fs: 300 });
  const testAt = F(t.test - 0.12);
  shot(neckAt, testAt - neckAt, { ...VIEW.neck, d: 128, az: -56 });
  D.punch(t.tientW, 0.05);

  /* test — « Paré pont. » « Paré partout. » « Paré feu. » */
  cut(testAt, null, VIEW.dogFar, { named: 0, sig: 4, fx: DOG[0], fy: 120, fz: DOG[2], fs: 800 });
  now(t.test, { l04: L04_AT.pare });
  const partAt = F(t.partout - 0.25);
  shot(testAt, partAt - testAt, { ...VIEW.dogFar, d: 760, az: -40 });
  cut(partAt, null, VIEW.cab, { cabin: 1, cabinCrew: 1, fx: CABIN.at[0], fy: 0, fz: CABIN.at[2], fs: 500 });
  const feuAt = F(t.feu - 0.25);
  shot(partAt, feuAt - partAt, { ...VIEW.cab, d: 520, az: -30 });
  cut(feuAt, null, VIEW.dog, { vest: 1, fx: DOG[0], fy: 150, fz: DOG[2], fs: 600 });
  const valveAt = F(t.vanne - 0.3);
  shot(feuAt, valveAt - feuAt, { ...VIEW.dog, d: 440, az: -40 });

  /* « La vanne s'ouvre. La vapeur se jette dans les cylindres. » */
  cut(valveAt, null, VIEW.valve, { under: 1, ship: 0.6, named: 7, press: 0.3, vest: 0.6, valve: 0, fx: VALVE.at[0], fy: VALVE.at[1], fz: VALVE.at[2], fs: 400 });
  now(t.vanne, { l04: L04_AT.souffle });
  st(t.vanne + 0.3, 0.4, { valve: 1 }, "power2.out");
  const cylAt = F(t.vapeur - 0.1);
  shot(valveAt, cylAt - valveAt, { ...VIEW.valve, d: 310, az: -36 });
  cut(cylAt, null, VIEW.cyl, { named: 0, fx: NG[0], fy: -95, fz: NG[2], fs: 600 });
  st(t.jette, 1.0, { press: 1 }, "sine.inOut"); //                    « se jette dans les cylindres » : they light aft to fore
  const neck2At = F(t.tir - 0.12);
  shot(cylAt, neck2At - cylAt, { ...VIEW.cyl, d: 820, az: -24 });

  /* ═════════ tir — the launch, played whole (L04 c2, « casse » 176,2 → « Tu voles » 185,9) ═════════ */
  // the law of the launch: the shuttle (and your nose gear in its hook) from 0.15 m to SHUTTLE_STOP, power1.in, from
  // « casse » to « s'arrête »; then your aircraft goes on alone at the shuttle's speed at the stop, and climbs.
  const tGo = t.casse + 0.03;
  const tEnd = t.arrete;
  const v = (2 * (SHUTTLE_STOP - 0.15)) / (tEnd - tGo); //          m per second of film at the stop
  const runAt = (x) => (x <= tGo ? 0.15 : x <= tEnd ? 0.15 + (SHUTTLE_STOP - 0.15) * ((x - tGo) / (tEnd - tGo)) ** 2 : SHUTTLE_STOP + v * (x - tEnd));
  const launchZ = (x) => NG[2] - 100 * runAt(x); //                   your nose gear's z
  /** The ease that keeps a tracked aim ON your aircraft between t1 and t2 (any part of the law). */
  const track = (t1, t2) => {
    const z1 = launchZ(t1), dz = launchZ(t2) - z1;
    return (u) => (launchZ(t1 + u * (t2 - t1)) - z1) / dz;
  };

  // « Et la pièce casse. » — the neck, close: the white light, the halves part
  cut(neck2At, null, VIEW.neck, { under: 1, ship: 0.6, named: 5, fx: NECK[0], fy: 30, fz: NECK[2], fs: 300 });
  now(t.tir, { l04: L04_AT.casse });
  const chAt = F(t.casse + 0.1); //                                   out on the flash: the dark halves are not a shot (sombre sur sombre)
  shot(neck2At, chAt - neck2At, { ...VIEW.neck, d: 110, az: -56 });
  st(t.casse - 0.03, 0.07, { broken: 0.3 }, "none"); //               up in two frames
  st(t.casse + 0.04, 0.8, { broken: 1 }, "power1.out"); //            it dies small, the halves part (seen hanging on the next shot)
  now(t.casse + 0.25, { fils: 1 }); //                                « faite pour casser » : paid
  now(t.casse, { kmhOn: 1, kmh: 0 }); //                              « Ton Rafale · 0 km/h »
  st(tGo, tEnd - tGo, { shuttle: SHUTTLE_STOP }, "power1.in");
  st(tGo, tEnd - tGo, { kmh: 240 }, "none"); //                       the speed grows linearly with time (power1.in)

  // « Le chariot t'arrache vers l'avant » — the nose gear in the shuttle's hook, from port, the aim rides with them
  cut(chAt, null, { ...VIEW.gearRun, tz: launchZ(chAt) + 200 }, { named: 0, dog: 0, crew: 0, parked: 0.3, cabin: 0, cabinCrew: 0, tremble: 0.5, l04: L04_AT.chariot });
  const deuxAt = F(t.deux - 0.12);
  shot(chAt, deuxAt - chAt, { ...VIEW.gearRun, tz: launchZ(deuxAt) + 200, d: 1650 }, track(chAt, deuxAt));

  // « Deux secondes environ… » — tracked from behind-port, high: the deck runs out ahead of you, the bow comes
  const flyAt = F(t.le - 0.12);
  cut(deuxAt, null, { ...VIEW.chase, tz: launchZ(deuxAt) + 400 }, { under: 0, ship: 1, l04: L04_AT.deux });
  shot(deuxAt, flyAt - deuxAt, { ...VIEW.chase, tz: launchZ(flyAt) + 400, d: 2300 }, track(deuxAt, flyAt));

  // « …le pont s'arrête sous toi. Tu voles. » — (retouche 27/10) two tracked shots that look FORWARD, into the dawn:
  //   A · low from aft-port, at deck height: the bow edge (its lights on) slides under your aircraft, big, on « s'arrête »
  //   B · « Tu voles » : below and behind, over the sea — your Rafale climbs against the signal horizon
  const black = D.breath("tir$");
  const climbY = (x) => Math.max(0, runAt(x) - BOW_EDGE) * 9; //    jetAt's own climb-out (cm)
  const LOW = { ...VIEW.chase, ty: 200, az: -52, el: 3, d: 2700, fov: 32 };
  const SKY = { ...VIEW.chase, az: -16, el: -6, d: 3000, fov: 32 };
  const skyAt = F(t.tu - 0.12);
  cut(flyAt, null, { ...LOW, tz: launchZ(flyAt) + 300 }, { l04: L04_AT.arrete, lights: 1 });
  shot(flyAt, skyAt - flyAt, { ...LOW, tz: launchZ(skyAt) + 300, ty: LOW.ty + climbY(skyAt) + 100, d: 2500 }, track(flyAt, skyAt));
  now(tEnd, { hooked: 0, run: SHUTTLE_STOP }); //                     the shuttle in its water brake, you go on alone
  st(tEnd, black - tEnd, { run: runAt(black) }, "none");
  st(t.tu - 0.2, black - (t.tu - 0.2), { alt: 4 }, "power1.in"); //   « Tu voles » : the climb steepens
  cut(skyAt, null, { ...SKY, tz: launchZ(skyAt) + 250, ty: 150 + climbY(skyAt) });
  shot(skyAt, black - skyAt, { ...SKY, tz: launchZ(black) + 250, ty: 150 + climbY(black) + 400, d: 2700, el: -8 }, track(skyAt, black));
  now(t.voles, { kmh: -1, l04: L04_AT.vol }); //                      « En vol »

  /* the black — then everything locked back, unseen */
  D.cliff(black, { stamp: "Réponse · sur YouTube" });
  now(black + 0.15, { broken: 0, shuttle: 0, run: 0, alt: 0, hooked: 1, held: 1, kmhOn: 0, kmh: 0, tremble: 1, dog: 1, crew: 0.6, parked: 0.6, lights: 0 });
}
