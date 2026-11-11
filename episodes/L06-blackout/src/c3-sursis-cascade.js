// c3 · « 21 h 38 » de « Le courant qui passait par là », « 31 minutes de sursis », « Les 17 secondes » jusqu'à « …Pas pour sauver l'Europe »
// HAND.c23 (≈ 228,86) → HAND.c34 (main − 0,15 ≈ 334,82). The plan, phrase by phrase: docs/L06-actes.md § c3 (the common top first). Journal: docs/journal/L06-c3.md.
// Every instant is read off the script (D.at). A cut gives what changes, never a number a running tween carries.
// The header: era 0, clockOn 1, hzOn 1 (West 50,0 Hz) from end to end — every cut below says it again (a cut is a complete state).
// THE WOW of this group (the architect's sfx): drop then boom on « La ligne saute » (316,66) — the breaker, the jolt.
import { SET, AT, VIEW, SPOT, SHARP, CLOSE, span, seam, onFrame } from "./world.js";
import { fact } from "@kit/long.js";
import { threadCall } from "@kit/blocks.js";

const HDR = { clockOn: 1, hzOn: 1, era: 0 };
/** The map after 21:39: the line over the Ems dead, its load on the neighbours. */
const MAP = { ...AT.region, ...HDR, emsCut: 2, load: 1, alarm: 1 };
/** The bench, Landesbergen–Wehrendorf: the busbars dark until « on y entre ». */
const LWB = { ...AT.lw, ...HDR, bars: 0, couple: 0, lwTrip: 0, markRwe: 0, lwNamed: 0 };

export default function ({ D, world, co }) {
  const { at, st, now, shot, cut, path, punch, jolt, quiet, tl } = D;
  const F = (ref, dt = 0) => onFrame(at(ref) + dt); // a cut ON a frame
  const [t0, tEnd] = span(D, "c3");
  const LA = world.europe.A;
  const LWA = world.model.lw.A;
  /** A place label: one at a time, never during a fast move; the keywords keep quiet meanwhile. */
  const label = (anchor, title, sub, from, to, x = 1260, y = 300) => {
    co.add({ title, sub, x, y, anchor }).show(tl, from).hide(tl, to - 0.24);
    quiet(from, to);
  };
  /** A figure in the left column; the keywords keep quiet meanwhile. */
  const fig = (o) => {
    fact(tl, o);
    quiet(o.from, o.to);
  };

  /* ═════════ 228,86 → 245,2 · the map: the load pours, N-1 is gone, « une seule ligne » ═════════ */
  // the seam: a cut (fade) onto the dead line over the Ems, its neighbours around it (VIEW.emsMap, CLOSE)
  seam(D, "c23", "in", { state: { ...AT.region, ...HDR } });
  // three shots on the same mesh (retouche: a new view every 5–6 s, each cut a raccord on the same lines)
  // 1 · the pull-back: the Ems → the region (the load, the alarms)
  const tN1 = F("viole", -0.12); //   « Plus tard, les enquêteurs… »
  const tAlso = F("suivent", -0.12); // « Autrement dit… »
  const tSursis = onFrame(at("suivent$") + 0.6); // after the ad's breath: the line under the card
  path(
    [
      [onFrame(t0), VIEW.emsMap],
      ["jette", { tx: -36, tz: -132, d: 52 }],
      ["alarmes", { tx: -28, tz: -124, d: 78, el: 34, dof: 0 }],
      [tN1, { tx: -22, tz: -118, d: 96, az: -20, el: 37 }], //   the region, whole (≈ 70 %)
    ],
    { from: "rest", to: "go" },
  );
  // 2 · cut (form: the same lines, lower, from the west): the mesh the computation sweeps
  const N1A = { ...VIEW.n1, dof: 0, tx: -21, tz: -117, d: 84, az: -38, el: 29 };
  cut(tN1, null, N1A, {});
  path(
    [
      [tN1, N1A],
      [tAlso, { ...VIEW.n1, dof: 0, d: 66, az: -28, el: 33 }], //  « N−1 plus tenue » : a slow push onto the mesh
    ],
    { from: "go", to: "go" },
  );
  // 3 · cut (form: the same mesh, from high, the other side): « une seule ligne tombe… les autres suivent »
  const N1B = { ...VIEW.n1, dof: 0, tx: -19, tz: -112, d: 90, az: -4, el: 46 };
  cut(tAlso, null, N1B, {});
  path(
    [
      [tAlso, N1B],
      ["uneSeule", { ...N1B, d: 84, az: -7, el: 44 }],
      [tSursis, { ...N1B, tx: -20, tz: -110, d: 94, az: -10, el: 45 }], //  the breath before the ad: a slow drift goes on
    ],
    { from: "go", to: "go" },
  );
  st(at("jette") - 0.18, 2.2, { load: 1 }); //                « se jette sur les lignes voisines »
  st(at("alarmes"), 0.8, { alarm: 1 }, "power2.out"); //     « les alarmes … s'allument »
  st(at("enqueteurs") - 0.14, 2.2, { n1sim: 1 }); //          the investigators' computation: one line drops, the next go signal
  fig({ id: "c3-n1", k: "DÈS 21 H 40", v: "N−1", s: "PLUS TENUE", tone: "signal", from: at("plusTenue") - 1.2, to: at("viole$") + 0.3 });
  st(at("suivent") + 0.05, 0.9, { n1sim: 0 }, "sine.inOut"); //    « Autrement dit… » the ghost resets…
  st(at("uneSeule") - 0.05, 1.9, { n1sim: 1 }, "sine.inOut"); // …« une seule ligne tombe… pour que les autres suivent »

  /* ═════════ 245,2 → 254,5 · « 31 minutes de sursis » : RWE warns E.ON, the relay's limit ═════════ */
  const tCard = at("sursis") - 0.9; // the chapter card (2,6 s): SHARP under it, nothing new begins
  const lwMapA = { ...VIEW.lwMap, ...SHARP, d: 60, az: -14, el: 38 };
  // retouche: no whip any more — a cut as the card comes in (form: « une seule ligne » → that line), then one slow push
  cut(tSursis, null, lwMapA, {});
  threadCall(tl, { from: tCard + 0.15, to: tCard + 2.55, text: "L'aiguille ? Toujours à cinquante." });
  st(tCard + 0.3, 1.4, { n1sim: 0 }, "sine.inOut"); //               the ghost leaves (the card hides it)
  shot(tSursis, F("limite1795", -0.5) - tSursis, { ...lwMapA, d: 50, az: -8, el: 35 }, "sine.inOut"); // slow push on the line
  st(at("sursis") + 2.3, 0.6, { phone: 1 }, "power1.out"); //        « RWE prévient E.ON »
  label(LA.wehrendorf, "Wehrendorf", "RWE", at("sursis") + 3.0, at("sursis") + 5.3);
  // the cut: the line's end — Wehrendorf's relay on the bench (form: the line → its end)
  const tRwe = F("limite1795", -0.4);
  cut(tRwe, SET.BENCH, VIEW.relayRwe, { ...LWB, amps: 1500 }, { fade: 0.2 });
  shot(tRwe, F("appels", -0.1) - tRwe, { ...VIEW.relayRwe, d: 165, az: -26 }, "sine.out");
  st(tRwe + 0.2, 2.4, { amps: 1750 }); //                            the needle climbs toward the limit
  fig({ id: "c3-limite", k: "LIMITE RWE", v: "1 795", s: "AMPÈRES", from: tRwe + 0.6, to: at("sursis$") });

  /* ═════════ 254,6 → 260,2 · the calls between the two dispatch points ═════════ */
  const tCalls = F("appels", -0.08);
  const CALLS = { ...VIEW.zonesDE, tx: -24, tz: -106, d: 125, az: -12, el: 30 };
  cut(tCalls, SET.CARTE, CALLS, { ...MAP, phone: 0, lw: 0 }, { fade: 0.2 });
  shot(tCalls, F("salon", -0.15) - tCalls, { ...CALLS, tx: -22, tz: -110, d: 98, az: -16, el: 32 }, "sine.inOut");
  const calls = [at("appels") + 0.92, at("appels") + 2.32, at("appels") + 3.72]; // 255,6 · 257,0 · 258,4
  calls.forEach((c, i) => st(c, 0.5, { phone: i + 1 }, "power1.out")); // three calls in six minutes
  st(at("tendue") - 0.05, 0.6, { lw: 1 }, "power2.out"); //   « jugée… tendue » : the line lit signal

  /* ═════════ 260,3 → 270,1 · your street, your window, the lift, your room, the switch ═════════ */
  const QS = { ...AT.quartier, ...HDR, lift: 0.2 };
  const tStreet = F("salon", -0.15);
  cut(tStreet, SET.QUARTIER, VIEW.street, QS, { fade: 0.2 });
  shot(tStreet, F("tele", -0.25) - tStreet, { ...VIEW.street, d: 5600, az: -33 }, "sine.inOut");
  const tWin = F("tele", -0.25);
  const WIN = { ...VIEW.windowC, d: 1300, az: -28, el: 2 }; //         your window, you inside (closer, the glass is a white slab)
  cut(tWin, null, WIN, {}); //                                        the same lit rectangles, closer: your window (the TV)
  shot(tWin, F("ascenseur", -0.25) - tWin, { ...WIN, d: 1180, az: -24 }, "sine.inOut");
  const tLift = F("ascenseur", -0.25);
  // retouche: tighter on the shaft's upper half — the cabin rises into the frame and stops at its centre (≈ 25 % of the height)
  const LIFT = { ...VIEW.liftB, tz: -220, ty: 1300, d: 1150, el: -4 };
  cut(tLift, null, LIFT, {}); //                                the lit cabin in its glass shaft
  st(tLift, F("salon2", -0.18) - tLift - 0.05, { lift: 0.8 }, "sine.inOut"); // « un ascenseur qui monte »
  shot(tLift, F("salon2", -0.18) - tLift, { ...LIFT, ty: 1450, d: 1100 }, "sine.inOut"); // a slow tilt with the cabin (the windows are a stripe: never fast)
  const tRoom = F("salon2", -0.18);
  cut(tRoom, null, VIEW.room, { lights: 1 }); //                      your room: the lamp
  shot(tRoom, F("interrupteur", -0.38) - tRoom, { ...VIEW.room, d: 300, az: 160 }, "sine.inOut");
  const tSw = F("interrupteur", -0.38);
  cut(tSw, null, { ...VIEW.switchC, d: 36 }, { lights: 0.3 }); //                   the switch, intact: nobody touches it
  shot(tSw, F("cent", -0.17) - tSw, { ...VIEW.switchC, d: 30, az: 50 }, "sine.inOut");

  /* ═════════ 270,1 → 287,0 · back on the bench: + 100 MW, over the limit, « Tout de suite », into Landesbergen ═════════ */
  const tCent = F("cent", -0.17);
  cut(tCent, SET.BENCH, VIEW.lwWide, { ...LWB, amps: 1750 }, { fade: 0.2 }); // form: the switch's wire → the line
  shot(tCent, F("urgent") - tCent, { ...VIEW.lwWide, d: 420, az: -18 }, "sine.inOut");
  st(at("mw100") - 0.15, 2.0, { amps: 1790 }); //               « cent mégawatts de plus »
  st(at("depasse") - 0.12, 1.3, { amps: 1900 }, "power1.out"); // « Elle dépasse la limite » : the line turns signal
  punch(at("depasse"), 0.06); //                                 the chapter's word
  now(at("urgent"), { lwNamed: 2 }); //                               RWE's end
  shot(F("urgent"), at("urgent$") - 0.05 - F("urgent"), VIEW.relayRwe, "sine.inOut"); // push onto Wehrendorf's dial
  st(at("urgent") + 0.2, 5.4, { amps: 2000 }, "none");
  // « Si tu veux voir comment on la recolle… abonne-toi, on y entre » : ONE glide along the line to Landesbergen, between
  // its two busbars — then, under the card, a slow orbit; the busbars named, the coupler named; it stops for the clack
  const BARS = { ...VIEW.bars, ...SHARP, tx: 200, ty: 64, tz: -10, d: 200, az: 38, el: 16 };
  now(at("seuil"), { lwNamed: 0 });
  // retouche: three shots instead of one 18-s glide — the line, a cut ON « on y entre » (the E.ON cabinet left out of
  // the frame: az ≥ 48), a cut-in on the coupler on « On couple deux jeux de barres »
  const tIn = F("entre", -0.15);
  const tCouple = F("barres", -0.12);
  path(
    [
      [at("seuil"), VIEW.relayRwe],
      [at("seuil") + 2.6, { ...VIEW.lwWide, tx: 0, d: 400, az: -6, el: 10, dof: 0 }],
      [tIn, { ...VIEW.lwWide, tx: 90, d: 360, az: 4, el: 11, dof: 0 }], //   along the line toward Landesbergen
    ],
    { from: "rest", to: "go" },
  );
  const INB = { ...BARS, d: 175, az: 60, el: 12, tz: -20 }; //              between the two sets of bars (form: the line → its busbars)
  cut(tIn, null, INB, {});
  path(
    [
      [tIn, INB],
      [at("manoeuvre") + 1.7, { ...BARS, d: 190, az: 63, el: 14, tz: -22 }], //  under the card: a slow orbit
      [tCouple, { ...BARS, d: 200, az: 66, el: 16, tz: -24 }],
    ],
    { from: "go", to: "go" },
  );
  const CPL = { ...BARS, d: 140, az: 72, el: 21, tz: -30 }; //              the coupler, from above (object: the busbars → their coupler)
  cut(tCouple, null, CPL, {});
  path(
    [
      [tCouple, CPL],
      [at("barres$") + 0.02, { ...BARS, d: 165, az: 44, el: 15, tz: -30 }], // the pose the clack and the way back leave from
    ],
    { from: "go", to: "rest" },
  );
  st(at("entre"), 0.8, { bars: 1 }, "power2.out");
  st(at("manoeuvre") - 1.2, 2.2, { amps: 2053 }, "none"); //        22:10:11 — under the card, the needle creeps
  label(LWA.bars, "Landesbergen", "E.ON Netz", at("manoeuvre") + 1.75, at("soulager") + 0.4);
  now(at("coupleW"), { lwNamed: 3 }); //                       the busbars
  now(at("separes"), { lwNamed: 4 }); //                       the coupler
  st(at("barres$") + 0.05, 0.2, { couple: 1 }, "power2.in"); //      the coupler closes (the clack is in the sfx): the camera holds
  // back along the line to Wehrendorf; « devait baisser » : the dial comes in
  now(at("sanscalcul") + 0.2, { lwNamed: 0 });
  path(
    [
      [at("sanscalcul") + 0.1, { ...BARS, d: 165, az: 44, el: 15, tz: -30 }],
      [at("simulation") + 0.4, { ...VIEW.lwWide, tx: 60, d: 380, az: 4, el: 11, dof: 0 }],
      ["devaitBaisser", { ...VIEW.relayRwe, d: 230, az: -22 }],
      [F("trip", -0.12), { ...VIEW.relayRwe, d: 180, az: -32 }],
    ],
    { from: "rest", to: "go" },
  );

  /* ═════════ 305,3 → 317,3 · + 67 A, 2 120 A, « 2 100 », « La ligne saute » ═════════ */
  st(at("monteW") - 0.02, 1.2, { amps: 2120 }, "power2.out"); // « Il monte »
  fig({ id: "c3-bump", v: "+ 67", s: "AMPÈRES", tone: "signal", from: at("a67") - 0.6, to: at("monte$") - 0.1 });
  // a cut-in on the same dial (object): « À Wehrendorf, le relais mesure… »
  const DIALC = { ...VIEW.relayRwe, ...CLOSE, tx: VIEW.relayRwe.tx - 4, ty: 56, d: 120, az: -26, el: 4 };
  const tTrip = F("trip", -0.12);
  cut(tTrip, null, DIALC, {});
  shot(tTrip, F("seuilrwe", -0.12) - tTrip, { ...DIALC, d: 104, az: -21 }, "sine.inOut");
  fig({ id: "c3-2120", k: "MESURÉ À WEHRENDORF", v: "2 120", s: "AMPÈRES", tone: "signal", from: at("a2120") - 2.0, to: at("trip$") });
  // « Son seuil, côté RWE : 2 100 » — the figure lights under the dial, the needle already past it
  const MARK = { ...DIALC, ty: 40, d: 150, az: -32, el: 8 }; // low enough for « 2 100 » under the dial
  const tMark = F("seuilrwe", -0.12);
  cut(tMark, null, MARK, {});
  shot(tMark, F("saute", -0.12) - tMark, { ...MARK, d: 138, az: -28 }, "sine.inOut");
  st(at("seuil2100"), 0.7, { markRwe: 1 }, "power2.out");
  // « La ligne saute » : the breaker in profile, the camera still; the claque, the knock (drop + boom: sfx)
  const tBrk = F("saute", -0.12);
  cut(tBrk, null, VIEW.breakerRwe, {});
  shot(tBrk, at("lineTrip") - tBrk - 0.02, { ...VIEW.breakerRwe, d: 116 }, "sine.out");
  st(at("lineTrip"), 0.15, { lwTrip: 1 }, "power2.out");
  jolt(at("lineTrip"), 0.3, 0.45);
  // the camera holds through the claque until the cut (no move while it opens, none restarting before the cut)

  /* ═════════ 317,3 → 334,82 · the cascade on the map, sliding south; the seam carries on ═════════ */
  const tMap = F("cascade", -0.12);
  // the camera swings from the west-south-west to the seam's az while it slides south with the front (≈ 1,5 °/s, never still)
  const MAP0 = { ...VIEW.lwMap, ...SHARP, d: 60, az: -36, el: 30 };
  cut(tMap, SET.CARTE, MAP0, { ...MAP, lw: 2, phone: 0, n1sim: 0, cascade: 0, volt: 1 }, { fade: 0.15 });
  // retouche: three shots on the front instead of one 17-s slide — each cut keeps the front's track (tx, tz)
  const tBiel = F("bielefeldW", -0.15); //  « Bielefeld » : lower, from the south-east, the front coming at us
  const tVolt = F("tensionW", -0.2); //     « La tension s'effondre » : back high, the whole south, to the seam's frame
  path(
    [
      [tMap, MAP0],
      ["jette2", { tx: -20, tz: -120, d: 66, az: -32, el: 31 }],
      [tBiel, { tx: -21, tz: -114, d: 75, az: -28, el: 32 }],
    ],
    { from: "go", to: "go" },
  );
  const FRONT = { ...MAP0, tx: -21, tz: -112, d: 60, az: 0, el: 27 };
  cut(tBiel, null, FRONT, {});
  path(
    [
      [tBiel, FRONT],
      ["bechter", { ...FRONT, tx: -20, tz: -109, d: 64, az: -3, el: 28 }],
      [tVolt, { ...FRONT, tx: -19, tz: -105, d: 70, az: -6, el: 29 }],
    ],
    { from: "go", to: "go" },
  );
  const SOUTH = { ...MAP0, tx: -19, tz: -105, d: 90, az: -24, el: 37 };
  cut(tVolt, null, SOUTH, {});
  path(
    [
      [tVolt, SOUTH],
      ["courtCircuit", { tx: -18, tz: -106, d: 98, az: -18, el: 38 }],
      [tEnd - 1.0, VIEW.cascade], //                                            the seam's move leaves from here
    ],
    { from: "go", to: "rest" },
  );
  st(at("cascade") + 1.4, 1.6, { cascade: 0.12 }, "sine.inOut"); //  « Qui saturent. Et sautent à leur tour. »
  st(at("bielefeldW") - 0.15, 0.4, { cascade: 0.15 }, "sine.out");
  st(at("elsenW") - 0.15, 0.5, { cascade: 0.25 }, "sine.out");
  st(at("bechter") - 0.1, 0.4, { cascade: 0.32 }, "sine.out");
  st(at("bechter") + 0.6, at("versSud") + 0.15 - at("bechter") - 0.6, { cascade: 0.5 }, "sine.inOut");
  st(at("elsenW") - 0.1, 1.2, { alarm: 0 }, "sine.inOut"); // the alarmed lines have tripped
  st(at("tensionW") - 0.02, 1.8, { volt: 0.5 }); //          « La tension s'effondre »
  st(at("courtCircuit") - 0.1, 1.0, { cascade: 0.7 }, "power1.out"); // several lines at once
  label(LA.bielefeld, "Bielefeld", "22:10:15", at("bielefeldW") - 0.15, at("elsenW") + 0.25);
  label(LA.elsen, "Elsen", "Bechterdissen", at("elsenW") + 0.3, at("versSud") + 0.4);
  seam(D, "c34", "out");
}
