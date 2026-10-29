// (02 · LA CATAPULTE) — tient → test (39,4 → 51,9 s): the launch, CUT TO BLACK before the piece breaks.
//   tient  « Ton avion tire » the cores · « La catapulte tire » the shuttle, 15 cm · « Et la pièce… tient » the neck
//   test   « Paré pont » your dog kneels · « Paré partout » the cabin · « Paré feu » the dog, his vest · « La vanne
//          s'ouvre » · « La vapeur se jette dans les cylindres » · « La pression monte… monte… » the neck, the load
//          climbing — and black (D.cliff, « Réponse · sur YouTube »). The piece never breaks here (`broken` 0).
// Also: the open threads, for the whole film (D.threads): curiosite, vapeur, test.
import { SET, AT, VIEW, L04_AT, NG, NECK, DOG, CABIN, VALVE } from "./world.js";

const F = (t) => Math.round(t * 30) / 30;

export default function acte3({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    tient: "tient", catapulte: "tient:catapulte", piece: "tient:pièce", tientW: "tient:tient",
    test: "test", partout: "test:partout", feu: "test:feu", vanne: "test:vanne", vapeur: "test:vapeur", pression: "test:pression",
  });

  /* the threads: the counter steps and pops (1 · 2 · then paid in acte2 · 2 again on the test) */
  const [f1, f2, f3] = D.threads(["curiosite$", "vapeur$", "test$"], { set: false });
  now(f1, { fils: 1 });
  now(f2, { fils: 2 });
  now(f3, { fils: 2 });

  /* tient — back on the deck, the aircraft whole again, at full power */
  const deck = { ...AT.deck, gas: 1, tremble: 1, jbd: 1, strain: 1, hooked: 1, held: 1, dog: 1, crew: 0.6, parked: 0.6, sig: 3, mood: 1, hot: 0.12 };
  const tAt = F(t.tient - 0.12);
  cut(tAt, SET.PONT, VIEW.tail, { ...deck, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200 });
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

  /* « La vanne s'ouvre. La vapeur se jette dans les cylindres. La pression monte… monte… » */
  cut(valveAt, null, VIEW.valve, { under: 1, ship: 0.6, named: 7, press: 0.3, vest: 0.6, valve: 0, fx: VALVE.at[0], fy: VALVE.at[1], fz: VALVE.at[2], fs: 400 });
  now(t.vanne, { l04: L04_AT.souffle });
  st(t.vanne + 0.3, 0.4, { valve: 1 }, "power2.out");
  const cylAt = F(t.vapeur - 0.1);
  shot(valveAt, cylAt - valveAt, { ...VIEW.valve, d: 310, az: -36 });
  cut(cylAt, null, VIEW.cyl, { named: 0, fx: NG[0], fy: -95, fz: NG[2], fs: 600 });
  const rise = t.pression - 0.15;
  shot(cylAt, rise - cylAt, { ...VIEW.cyl, d: 820, az: -24 });
  st(t.pression, 1.4, { press: 1 }, "sine.inOut");
  const black = D.breath("test$");
  shot(rise, black - rise, { ...VIEW.neck, d: 120, az: -58 }, "sine.inOut", VIEW.cyl.d);
  st(rise + 0.3, 1.4, { fx: NECK[0], fy: 30, fz: NECK[2], fs: 300 });
  now(rise + 0.6, { named: 5 });
  D.cliff(black, { stamp: "Réponse · sur YouTube" });
}
