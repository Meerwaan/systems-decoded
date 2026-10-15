// Chapters 4 · L'étenderie, 5 · Découpe et bande noire, 6 · Le bombage, and the threshold — beats etenderie → seuil.
// The ribbon cools in the lehr, is cut into blanks; the windshield is born at the cutting gantry, printed (band, dots,
// silver lines, stamp), then laid on its mould and bent. The threshold asks for the subscription while the camera is
// already travelling toward the clean room. Plan, sentence by sentence: docs/L01-actes.md · c3. Journal:
// docs/journal/L01-c3-plat-bombage.md.
import { SET, AT, VIEW, onLine, span, run, FLOW } from "./world.js";
import { ST } from "./plan.js";
import { fact } from "@kit/long.js";

export default function ({ D }) {
  const [from, to] = span(D, "etenderie", "salle");
  run(D, from, to);
  const { st, shot, cut } = D;
  const t = D.times({
    refroidir: "etenderie:refroidir", trop: "etenderie:trop",
    alors: "tunnel", tunnelW: "tunnel:tunnel", bout: "tunnel:bout", machines: "tunnel:machines",
    km: "km", seize: "km:seize", six: "km:six", kmEnd: "km$",
    plie: "plie", plate: "plie:plate", pour: "plie:pour", decouper: "plie:découper", imprimer: "plie:imprimer",
    five: "forme", ici: "forme:ici", deux: "forme:deux", forme: "forme:forme", adoucit: "forme:adoucit", lave: "forme:lave",
    imprime: "bande:imprime", deco: "bande:déco", colle: "bande:collé", cache: "bande:cache", protege: "bande:protège",
    argent: "argent", fils: "argent:fils",
    tampon: "tampon", tamponW: "tampon:tampon", un: "tampon:un", e2: "tampon:e2", romain: "tampon:romain",
    six6: "bombage", pose: "bombage:pose", autre: "bombage:autre", chauffe: "bombage:chauffe", c600: "bombage:600",
    ramollit: "gravite:ramollit", affaisse: "gravite:affaisse",
    ensemble: "ensemble", entre: "ensemble:qu'entre",
    seuil: "seuil", prendre: "seuil:prendre", heure: "seuil:heure", abonne: "seuil:abonne", seuilEnd: "seuil$",
  });
  const LINE0 = { ...AT.line, tempOn: 1 };
  // postes.js · makeGantry: `travel` 0 → 1 carries the wheel from −0.45 to +0.45 of the span, across the line (z)
  const knifeZ = (k) => (k * 0.9 - 0.45) * 2 * 260;

  /* ───────────── 04 · L'étenderie ───────────── */
  // the whip under the card: from the side of the lehr's mouth, a quick turn onto the ribbon going into the tunnel
  cut(from, SET.LINE, onLine(2950, { ty: 160, d: 1150, az: -74, el: 28, side: -140 }), { ...LINE0, step: 3, temp: 600, cut: 0, pos: 5300, queue: 0 });
  shot(from + 0.1, 0.75, onLine(3150, { ty: 112, d: 820, az: -22, el: 13, side: -140 }), "expo.out");
  // "refroidir": into the tunnel, along with the ribbon; the header cools as the ribbon does (600 → 20 at the cut)
  shot(from + 0.95, t.trop - from - 0.85, onLine(3060, { ty: 125, d: 320, az: -82, el: 6, fov: 40, side: 0 }));
  st(t.refroidir - 0.2, t.machines + 0.6 - t.refroidir, { temp: 20 }, "sine.inOut");
  // "Trop vite…": the camera dashes ahead, then slows ("lentement") and rises a little inside the tunnel
  shot(t.trop + 0.1, t.alors - t.trop - 0.15, onLine(3700, { ty: 128, d: 320, az: -80, el: 8, fov: 40, side: 0 }), "power1.inOut");
  shot(t.alors, t.bout - t.alors - 0.3, onLine(4300, { ty: 130, d: 330, az: -76, el: 9, fov: 40, side: 0 }));
  shot(t.bout - 0.25, 0.65, onLine(4520, { ty: 128, d: 320, az: -78, el: 8, fov: 40, side: 0 }), "power1.in");
  // "le découpent": the wheel bites across the ribbon, then lifts (the snap)
  // (the camera rides with the wheel across the ribbon, so that it stays in the frame while it bites)
  // seen from downstream, tight: the ribbon's clear end and edges, the wheel and its spark (the machines dimmed)
  cut(t.machines - 0.12, SET.LINE, onLine(ST.cut.at, { ty: 96, tz: knifeZ(0.55), d: 150, az: 40, el: 14, fov: 30, side: -60 }), { ...LINE0, step: 3, temp: 20, cut: 0, pos: 5300, queue: 0, knife: 0.55, line: 0.5 });
  shot(t.machines - 0.1, 0.95, onLine(ST.cut.at, { ty: 96, tz: knifeZ(0.85), d: 130, az: 34, el: 13, fov: 30, side: -60 }), "none");
  st(t.machines - 0.12, 0.97, { knife: 0.85 }, "none");
  st(t.machines + 0.85, 0.2, { knife: 1 }, "power1.in");
  st(t.machines + 1.05, 0.2, { knife: 2 }, "power2.in");
  shot(t.machines + 0.86, t.km - t.machines - 0.9, onLine(ST.cut.at, { ty: 104, tz: knifeZ(0.85), d: 170, az: 26, el: 20, fov: 30, side: -60 }), "power2.out");
  fact(D.tl, { id: "c3-tunnel", v: "≈ 100 M", s: "DE TUNNEL", from: t.tunnelW, to: t.machines - 0.15 });
  // "seize kilomètres": the blanks follow one another, rolling with the rollers; a fast travel past them, then a pull-back
  const pos0 = 5300;
  const posAt = (x) => pos0 + FLOW * (x - (t.km - 0.06));
  cut(t.km - 0.06, SET.LINE, onLine(5020, { ty: 100, d: 480, az: -14, el: 30, side: 0 }), { ...LINE0, step: 3, temp: 20, cut: 1, queue: 1, pos: pos0, knife: 0, line: 0.45, litGlass: 0.5 });
  st(t.km - 0.06, D.at("forme") - 0.9 - (t.km - 0.06), { pos: posAt(D.at("forme") - 0.9) }, "none");
  shot(t.km, t.six - t.km - 0.05, onLine(6180, { ty: 100, d: 480, az: -14, el: 30, side: 0 }));
  shot(t.six - 0.05, t.kmEnd + 1.2 - t.six, onLine(5750, { ty: 200, d: 2400, az: -24, el: 24, side: 0 }), "sine.inOut", 480);
  st(t.six, 2.0, { line: 0.8 }, "sine.inOut");
  fact(D.tl, { id: "c3-km", v: "≈ 16 KM", s: "DE VERRE PAR JOUR", from: t.seize - 0.05, to: t.six - 0.06 });
  fact(D.tl, { id: "c3-an", k: "PAR AN", v: "6 000 KM", s: "AUTANT QUE PARIS–NEW YORK", from: t.six, to: t.plie + 0.4 });
  // "une vitre. Plate.": a dive by ratio onto the last blank, low and raking: a thin flat line
  const back = (x) => posAt(x) - 420; // the queue's blank behind the hero, the nearest to the cutting gantry
  shot(t.plie - 0.05, t.plate - t.plie, onLine(back(t.plate), { ty: 96, d: 270, az: -12, el: 9, fov: 32, side: -100 }), "sine.inOut", 2400);
  st(t.plie, 1.4, { line: 0.3, litGlass: 0.7 }, "sine.inOut");
  st(t.pour, 1.2, { line: 1, litGlass: 0 }, "sine.inOut");
  // "la découper… l'imprimer… et la plier": one travel downstream, a stop on each verb
  shot(t.pour - 0.05, t.decouper - t.pour - 0.1, onLine(ST.cut.at + 60, { ty: 170, d: 1300, az: -26, el: 26, side: -60 }));
  // (no fast hop along the rollers: a striped floor crossed at ~10 m/s strobes — `qa` found it. A cut on each verb,
  // each shot drifting downstream slower than a seventh of the rollers' pitch per frame)
  shot(t.decouper - 0.1, t.imprimer - t.decouper, onLine(ST.cut.at + 160, { ty: 168, d: 1300, az: -24, el: 26, side: -60 }), "none");
  cut(t.imprimer - 0.08, SET.LINE, onLine(ST.print.at + 40, { ty: 160, d: 1150, az: -28, el: 24, side: -60 }), { ...LINE0, step: 3, temp: 20, cut: 1, queue: 1, pos: posAt(t.imprimer - 0.08), knife: 0 });
  shot(t.imprimer - 0.06, D.at("forme") - 0.9 - t.imprimer + 0.06, onLine(ST.print.at + 150, { ty: 165, d: 1180, az: -25, el: 24, side: -60 }), "none");

  /* ───────────── 05 · Découpe et bande noire ───────────── */
  const c5 = t.five - 0.9;
  // the whip: from downstream, high, onto the wheel that bites — "Ton pare-brise commence ici"
  // tight on the wheel as it runs to the ribbon's near edge (it reaches it on "ici"); the machines dimmed
  cut(c5, SET.LINE, onLine(5160, { ty: 150, d: 640, az: 24, el: 30, side: -160 }), { ...LINE0, step: 4, temp: 20, cut: 0, pos: 5300, queue: 0, knife: 0.4, line: 0.5 });
  shot(c5 + 0.1, 0.8, onLine(ST.cut.at, { ty: 95, tz: knifeZ(0.6), d: 125, az: -58, el: 12, fov: 30, side: -280 }), "expo.out");
  st(c5 + 0.1, 0.8, { knife: 0.6 }, "power2.out");
  shot(c5 + 0.9, t.ici + 0.2 - c5 - 0.9, onLine(ST.cut.at, { ty: 95, tz: knifeZ(0.88), d: 110, az: -52, el: 12, fov: 30, side: -240 }), "none");
  st(c5 + 0.9, t.ici + 0.2 - c5 - 0.9, { knife: 0.88 }, "none");
  st(t.ici + 0.2, 0.3, { knife: 0.95 }, "sine.out");
  // (the shot that followed here had a NEGATIVE duration and overlapped the next one: 23 parasite frames in the draft)
  // "deux feuilles découpées à sa forme": downstream to the blank, the score runs round its outline, the trim goes
  // (the blank lit, the machines dimmed: the outline traces in light on a clear sheet)
  shot(t.ici + 0.22, t.deux - t.ici - 0.5, onLine(ST.cut.at, { ty: 98, tz: knifeZ(0.95), d: 130, az: -48, el: 14, fov: 30, side: -240 }));
  // a cut, not a travel across the rollers (a striped floor crossed fast strobes)
  cut(t.deux - 0.25, SET.LINE, onLine(5300, { ty: 92, d: 300, az: -22, el: 46, fov: 30, side: 0 }), { ...LINE0, step: 4, temp: 20, cut: 0, pos: 5300, queue: 0, knife: 2, line: 0.4, litGlass: 0.5 });
  shot(t.deux - 0.23, t.forme - t.deux + 0.53, onLine(5300, { ty: 92, d: 260, az: -14, el: 48, fov: 30, side: 0 }));
  st(t.deux + 0.1, t.forme - t.deux - 0.15, { cut: 0.4 }, "power1.inOut");

  st(t.forme - 0.05, 0.6, { cut: 0.75 }, "power2.out");
  // "On adoucit les bords": close on the near edge, ground from bright to matt
  shot(t.forme + 0.35, t.adoucit + 0.6 - t.forme - 0.35, onLine(5300, { ty: 92, tz: 62, d: 150, az: -36, el: 20, fov: 30, side: 0 }));
  st(t.adoucit, 0.9, { cut: 1 }, "sine.inOut");
  // "On lave. On sèche.": the blank glides on to the printing gantry, the camera with it
  // low, the blank slides past under the printing gantry's beam; the camera swings, its reflection sweeps across it
  shot(t.lave - 0.3, 1.45, onLine(5560, { ty: 97, d: 210, az: -64, el: 9, fov: 30, side: -60 }));
  shot(t.lave + 1.15, t.imprime - t.lave - 1.05, VIEW.print);
  st(t.lave - 0.3, t.imprime - t.lave + 0.1, { pos: ST.print.at }, "sine.inOut");
  st(t.lave + 1.0, 1.0, { line: 1, litGlass: 0 }, "sine.inOut");
  // "on imprime la bande noire": the squeegee sweeps, the band lands under it
  st(t.imprime, 1.7, { squeegee: 1, print: 0.45 }, "sine.inOut");
  shot(t.imprime - 0.15, t.deco - t.imprime - 0.4, onLine(ST.print.at + 30, { ty: 98, d: 200, az: -32, el: 26, side: -80 }));
  // "pas de la déco": up, the band seen all round the glass
  shot(t.deco - 0.5, t.colle - t.deco + 0.3, onLine(ST.print.at, { ty: 96, d: 320, az: -18, el: 60, side: -80 }));
  // "collé à ta voiture": the windshield in place, its lower edge from outside; the band lights where the bead of glue is
  cut(t.colle - 0.14, SET.CAR, { tx: -46, ty: 106, tz: -88, d: 170, az: -150, el: 22, fov: 30, side: -140 }, { ...AT.car });
  shot(t.colle - 0.12, t.protege - t.colle, { tx: -8, ty: 108, tz: -90, d: 150, az: -162, el: 26, fov: 30, side: -140 });
  st(t.colle + 0.1, 0.7, { litBand: 1 }, "sine.inOut");
  // "et la protège du soleil": a warm light rakes across it, the camera rises
  shot(t.protege - 0.1, D.at("argent") - t.protege, { tx: 0, ty: 112, tz: -84, d: 175, az: -170, el: 36, fov: 30, side: -140 });
  st(t.protege - 0.1, 0.6, { gel: 0.22 }, "sine.inOut");
  // "Même procédé pour les fils de dégivrage": the second sweep prints the dots on the windshield and the silver lines
  // on the rear-screen sample beside it
  cut(D.at("argent") - 0.08, SET.LINE, onLine(ST.print.at, { ty: 94, tz: 80, d: 300, az: -24, el: 50, side: -80 }), { ...LINE0, step: 4, temp: 20, cut: 1, pos: ST.print.at, print: 0.45, squeegee: 0 });
  shot(D.at("argent"), t.tampon - D.at("argent") - 0.1, onLine(ST.print.at + 10, { ty: 94, tz: 112, d: 220, az: -10, el: 46, side: -80 }));
  st(t.fils - 0.4, 2.6, { squeegee: 1, print: 0.8, silver: 1 }, "sine.inOut");
  // "Et le tampon du coin ?": the finished windshield's corner on the bench, its stamp lighting up (on the line it lies
  // outer face down: seen from above, its stamp reads mirrored)
  cut(t.tampon - 0.06, SET.BENCH, { ...VIEW.stamp, d: 92, az: -16 }, { ...AT.bench, litStamp: 0 });
  shot(t.tampon - 0.04, t.un - t.tampon - 0.02, { ...VIEW.stamp, d: 70, az: -8 });
  st(t.tamponW, 0.6, { litStamp: 1 }, "sine.inOut");
  // "Un E et un chiffre…": the enlarged stamp on the bench, a piece of the dossier, read element by element
  cut(t.un - 0.06, SET.BENCH, { ...VIEW.doc, d: 185, az: -10 }, { ...AT.doc, doc: 3, docIn: 0, mark: 0 });
  st(t.un - 0.06, 0.9, { docIn: 1 }, "power2.out");
  shot(t.un, t.e2 - t.un + 0.4, { ...VIEW.doc, d: 158, az: -2, el: 64 });
  shot(t.e2 + 0.45, D.at("bombage") - 0.9 - t.e2 - 0.45, { ...VIEW.doc, d: 142, az: 8, el: 58 });
  st(t.un + 0.2, 0.4, { mark: 1 }, "sine.inOut");
  st(t.e2 - 0.05, 0.35, { mark: 2 }, "sine.inOut");
  st(t.romain, 0.4, { mark: 4 }, "sine.inOut");
  fact(D.tl, { id: "c3-e2", v: "E2 = FRANCE", s: "LE PAYS QUI L'A HOMOLOGUÉ", from: t.e2 - 0.05, to: t.romain - 0.1 });
  fact(D.tl, { id: "c3-ii", k: "I = TREMPÉ", v: "II = FEUILLETÉ", from: t.romain, to: D.at("bombage") - 0.95 });

  /* ───────────── 06 · Le bombage ───────────── */
  const c6 = t.six6 - 0.9;
  const mouldX = ST.bend.x0 - 120; // in front of the bending furnace's door
  // the whip: from high downstream onto the mould, the top sheet held over the bottom one
  cut(c6, SET.LINE, onLine(mouldX - 160, { ty: 175, d: 720, az: 30, el: 30, side: -160 }), { ...LINE0, step: 5, temp: 20, cut: 1, print: 1, mould: 1, pos: mouldX, open: 0.6, glow: 0 });
  shot(c6 + 0.1, 0.8, onLine(mouldX, { ty: 104, d: 380, az: -30, el: 20, fov: 30, side: -150 }), "expo.out");
  // "l'une sur l'autre": low, almost edge-on, the gap closes
  shot(c6 + 0.95, t.pose - c6 - 0.75, onLine(mouldX, { ty: 104, d: 225, az: -14, el: 14, fov: 32, side: -60 }));
  st(t.pose, t.autre - t.pose + 0.15, { open: 0 }, "power2.inOut");
  st(c6 + 0.95, 1.0, { line: 0.55 }, "sine.inOut"); // the rollers in front dim: the two sheets read
  st(t.chauffe - 0.3, 1.2, { line: 1 }, "sine.inOut");
  shot(t.pose + 0.25, t.chauffe - t.pose - 0.55, onLine(mouldX, { ty: 102, d: 240, az: -32, el: 14, fov: 32, side: -60 }));
  // "Et on chauffe à plus de 600 °C": the cart rolls into the furnace, the elements redden, the glass glows
  shot(t.chauffe - 0.3, 2.3, onLine(ST.bend.at, { ty: 110, d: 620, az: -26, el: 18, side: -160 }));
  st(t.chauffe - 0.3, 2.3, { pos: ST.bend.at }, "sine.inOut");
  st(t.chauffe + 0.1, t.c600 - t.chauffe + 0.1, { temp: 600 }, "power1.out");
  st(t.chauffe + 0.1, 1.9, { glow: 0.6 }, "sine.inOut");
  fact(D.tl, { id: "c3-600", v: "PLUS DE 600 °C", tone: "signal", from: t.c600 - 0.1, to: t.affaisse + 0.6 });
  // "Le verre ramollit. Et il s'affaisse": the camera comes down and in; the centre sinks into the mould
  shot(t.chauffe + 2.05, t.ensemble - t.chauffe - 2.25, onLine(ST.bend.at, { ty: 102, d: 285, az: -22, el: 14, fov: 30, side: -100 }));
  st(t.ramollit, 0.9, { glow: 0.85 }, "sine.inOut");
  st(t.affaisse - 0.1, 2.1, { bend: 1 }, "sine.inOut");
  // "Courbées ensemble…": it cools; seen along the line, the two curves are one
  st(t.ensemble + 0.1, 2.8, { glow: 0, temp: 20 }, "power1.inOut");
  shot(t.ensemble - 0.2, 2.6, onLine(ST.bend.at, { ty: 104, d: 280, az: -86, el: 4, fov: 32, side: -100 }));
  // "qu'entre elles… il faut glisser quelque chose": the top sheet lifts a little, a dark day between them
  st(t.entre, 0.9, { open: 0.3 }, "power2.inOut");
  shot(t.ensemble + 2.45, t.prendre - t.ensemble - 2.7, onLine(ST.bend.at, { ty: 103, d: 205, az: -74, el: 5, fov: 32, side: -100 }));

  /* ───────────── the threshold ───────────── */
  // "prendre le choc": a 0.8 s flash on the test hall, the head held over the frame (the hook's image, coming back)
  const flash = t.prendre - 0.15;
  cut(flash, SET.LINE, onLine(ST.test.frame, { ty: 175, d: 560, az: -26, el: 16, side: -160 }), { ...LINE0, step: 5, temp: 20, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, pos: ST.test.frame, drop: 0 });
  shot(flash + 0.02, 0.78, onLine(ST.test.frame, { ty: 170, d: 500, az: -22, el: 15, side: -160 }), "sine.out");
  // "Si tu veux voir ça… abonne-toi": the film does not stop — the camera already follows the bent windshield out of
  // the furnace, toward the clean room, whose air comes on; the account's name lights in the header
  const back6 = flash + 0.8;
  cut(back6, SET.LINE, onLine(6780, { ty: 112, d: 520, az: -14, el: 14, side: -40 }), { ...LINE0, step: 5, temp: 20, cut: 1, print: 1, bend: 1, mould: 1, open: 0.3, pos: 6720 });
  st(back6, to - back6, { pos: 7260 }, "sine.inOut");
  shot(back6 + 0.02, to - back6 - 0.02, onLine(7300, { ty: 122, d: 640, az: -24, el: 16, side: 0 }));
  st(t.heure, 2.4, { air: 0.7 }, "sine.inOut");
  D.tl.to(".hud__brand", { color: "#5cffb0", duration: 0.2 }, t.abonne - 0.05);
  D.tl.to(".hud__brand", { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, Math.min(t.seuilEnd, to - 0.35));
}
