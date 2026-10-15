// Chapters 7 · La salle blanche (and the lab of 1903) and 8 · L'autoclave — beats salle → yeux (docs/L01-actes.md · c4).
// The film (veille) enters the windshield, then its story: 80 seconds told in the middle of the factory, where the
// attention can drop — so every date and every name has its picture, and the camera never stops:
//   the clean room (the air, the top sheet lifted, the film slid in edge-on, the bubble it would make if wet)
//   → the LAB, 1903 (the table: chemist · the easel: painter · him at the shelf · the flask falls ON "tombe",
//   starred and whole ON "il ne s'est pas brisé", raised to the light, back on its shelf: the ad break)
//   → the BENCH (the patent of 1909 lands, its three layers lit as they are said; his name) → the tin bath again
//   (Pilkington) → the CAR (the 1930s: the windshield, then the other glass) → the BENCH (the film that ages, the bubble
//   that lifts it, the PVB that holds) → back to the factory: the milky sandwich, the autoclave, the bubble that must
//   not be, the eyes of the car, the inspection light.
import * as THREE from "three";
import { fact, chipEl } from "@kit/long.js";
import { SET, AT, VIEW, onLine, span, run } from "./world.js";
import { ST, LINE, BENCH, LAB } from "./plan.js";

const B = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }; // a complete pose starts from this

export default function ({ D, world }) {
  const [from, to] = span(D, "salle", "route");
  run(D, from, to);
  const t = (ref) => D.at(ref);
  const { st, now, shot, cut } = D;
  const tl = D.tl;
  // points ON the windshield (verre.js · onSurface: the pane's mid-plane, its own frame), carried to where it lies
  const q = new THREE.Vector3();
  const pane = (x, y) => (world.glass.hero.onSurface(x, y, q), [q.x, q.y, q.z]);
  // on the line: lying, its top downstream (pane y → +x), its inner face up (pane z → +y), pane x → +z
  const onLineAt = (pos, [x, y, z]) => [pos + y, LINE.y + 1.5 + z, x];
  // on the bench: standing at BENCH.at, raked (pane x → −x, y → (0, cos, −sin), z → (0, −sin, −cos))
  const rk = (BENCH.rake * Math.PI) / 180;
  const onBenchAt = ([x, y, z]) => [BENCH.at[0] - x, BENCH.at[1] + y * Math.cos(rk) - z * Math.sin(rk), BENCH.at[2] - y * Math.sin(rk) - z * Math.cos(rk)];
  const BUBBLE = pane(18, -30); // IMPACT.bubble (casse.js · BUBBLE)
  const SENSOR = pane(0, 38); //   WS.sensor

  /* ── 07 · LA SALLE BLANCHE ─────────────────────────────────────────────────────────────────────────────── */
  // The windshield, bent, two glasses and nothing between them yet, rolls toward the clean room. Mood veille: this
  // chapter is the film's.
  const CLEAN = {
    ...AT.line, step: 6, temp: 20, tempOn: 1, cut: 1, print: 1, bend: 1, film: 0, open: 0, milk: 0, sensors: 0,
    air: 0, line: 0.62, litGlass: 0.35, mood: 0, hot: 0.1, fx: 7850, fy: 100, fz: 0, fs: 420,
  };
  const P0 = 7640;
  const PW = 7900; // under the placer
  // under the card: high and from downstream, turned 55° from where the chapter lands; the whip swings onto the glass
  cut(from, SET.LINE, onLine(P0 + 160, { ty: 150, d: 700, az: 34, el: 34, side: -150 }), { ...CLEAN, pos: P0 });
  shot(from + 0.04, 0.85, onLine(P0 + 30, { ty: 98, d: 420, az: -22, el: 30, side: -150 }), "expo.out");
  // "On entre": the camera goes through the room's glass wall WITH the windshield (it rolls under the placer)
  const tGlisse = t("salle:glisse");
  st(from + 0.3, tGlisse - 0.5 - (from + 0.3), { pos: PW }, "sine.inOut");
  shot(from + 0.95, tGlisse - 0.5 - (from + 0.95), onLine(PW, { ty: 98, d: 320, az: -36, el: 28, side: -150 }));
  // "Air filtré": the air of the ceiling comes down
  st(t("salle:air") - 0.15, 0.9, { air: 0.7 }, "power2.out");
  st(t("salle:entre") - 0.1, 0.5, { litGlass: 0.8 }, "power2.out");
  // "Entre les deux verres": the cups take the top sheet and lift it · "glisse le film": it slides in from our side
  st(t("salle:entre") - 0.05, 0.8, { open: 0.7 }, "power2.inOut");
  st(tGlisse - 0.05, 1.25, { film: 1, litFilm: 0.8, litGlass: 0 }, "power2.out");
  // …edge-on: the film between the two glasses, seen by its edge
  shot(tGlisse - 0.5, t("salle$") + 0.3 - (tGlisse - 0.5), onLine(PW, { ty: 96, tz: 24, d: 260, az: -56, el: 20, side: -150 }));
  // "qui colle au verre": the top sheet comes down onto it
  st(t("salle:colle") - 0.15, 0.7, { open: 0 }, "power2.inOut");
  chipEl("c4-pvb", { label: "Le film", value: "PVB", color: "veille" });
  D.chip("c4-pvb", new THREE.Vector3(PW, 95, 74), 24, -70, t("salle:pvb") - 0.1, t("salle$") + 0.2);

  // "Pourquoi sec ? … Humide, il ferait des bulles": down onto the film, raking — the bubble that would come
  const BUB = onLineAt(PW, BUBBLE);
  shot(t("humide") - 0.2, t("humide:bulles") + 0.5 - (t("humide") - 0.2), onLine(BUB[0], { ty: BUB[1], tz: BUB[2], d: 75, az: -30, el: 34, side: -220 }), "sine.inOut", 260);
  st(t("humide:bulles") - 0.45, 0.8, { bubble: 1 }, "power2.out");
  st(t("humide$") - 0.05, 0.75, { bubble: 0 }, "power2.inOut");
  // "Ce film": the camera slides along its edge, the film lit
  shot(t("humide:bulles") + 0.5, t("flacon:français") - 0.25 - (t("humide:bulles") + 0.5), onLine(PW + 40, { ty: 95, tz: 50, d: 130, az: -50, el: 14, side: -140 }));
  st(t("flacon:film") - 0.2, 0.6, { litFilm: 1 });

  /* ── 1903 · LE LABORATOIRE ─────────────────────────────────────────────────────────────────────────────── */
  // "un Français. Chimiste" — his table, its retort; "mais aussi peintre" — the easel
  const tLab = t("flacon:français") - 0.25;
  const LABST = { ...AT.lab, fx: 60, fy: 150, fz: -60, fs: 360 };
  cut(tLab, SET.LAB, { ...B, tx: 40, ty: 150, tz: -120, d: 560, az: -6, el: 8, side: -40 }, LABST);
  shot(tLab + 0.04, t("flacon:peintre") - 0.75 - (tLab + 0.04), { tx: 80, ty: 135, tz: -105, d: 470, az: -4, el: 8 });
  shot(t("flacon:peintre") - 0.75, 1.45, { tx: 170, ty: 135, tz: -40, d: 470, az: 2, el: 7 });
  // "Novembre 1903": the whole room, and the camera flies to him at the top of his stepladder ("range son laboratoire")
  const tNov = t("flacon:novembre") - 0.18;
  cut(tNov, SET.LAB, { ...B, tx: 40, ty: 170, tz: -80, d: 1000, az: -8, el: 12, side: -140 }, { ...LABST, fx: -100, fy: 220, fz: -180, fs: 360 });
  shot(tNov + 0.04, t("flacon:range") + 0.3 - (tNov + 0.04), { tx: -160, ty: 265, tz: -205, d: 520, az: -24, el: 5 }, "sine.inOut", 1000);
  fact(tl, { id: "c4-f1903", k: "Paris", v: "Novembre 1903", s: "Édouard Bénédictus", from: t("flacon:novembre") - 0.05, to: t("flacon:flacon") - 0.25 });
  // "Un flacon lui échappe…": closer, level with the top shelf — it tips over the plank's edge…
  const tTombe = t("flacon:tombe");
  const toward = new THREE.Vector2(LAB.floor[0] - LAB.shelf[0], LAB.floor[2] - LAB.shelf[2]).normalize();
  const EDGE = [LAB.shelf[0] + 8 * toward.x, LAB.shelf[1] + 10.5, LAB.shelf[2] + 8 * toward.y]; // the flask tipping at the plank's edge
  const LIE = [LAB.floor[0] + 4 * toward.x, 6.5, LAB.floor[2] + 4 * toward.y]; //                     where it lands
  shot(t("flacon:range") + 0.3, tTombe - (t("flacon:range") + 0.3), { tx: (EDGE[0] + LIE[0]) / 2, ty: 192, tz: (EDGE[2] + LIE[2]) / 2, d: 560, az: -24, el: 3, fov: 44 });
  st(t("flacon:échappe") - 0.1, 0.6, { flask: 0.1 }, "power2.inOut");
  // "…et tombe": it falls ON the word (3.5 m, free fall), the camera drops with it
  const FALL = 0.98;
  st(tTombe - 0.02, FALL, { flask: 1 }, "none");
  // the camera holds the whole height (shelf → floor) and only creeps in: a fast sweep down the striped shelves made
  // parasite frames (qa, draft) — the flask crosses a still frame instead
  shot(tTombe - 0.02, FALL + 0.1, { ty: 186, d: 530, el: 4 });

  // "Il le ramasse": down on one knee, whole (a cut: he never slides down the stepladder on screen)
  const tKneel = tTombe + FALL + 0.08;
  cut(tKneel, SET.LAB, { ...VIEW.kneel, d: 340, az: -26 }, { ...LABST, flask: 1, ben: 0.55, fx: -90, fy: 60, fz: -130, fs: 260 });
  st(tKneel, 0.85, { ben: 1 }, "power2.out");
  shot(tKneel + 0.04, t("etoile:mais") - 0.1 - (tKneel + 0.04), { tx: -88, ty: 26, tz: -124, d: 230, az: -14, el: 20 });
  // "étoilé de partout…": the cracks spread over its whole wall
  st(t("etoile:étoilé") - 0.25, 0.9, { star: 1 }, "power2.out");
  // "…mais il ne s'est pas brisé. Il tient d'un seul morceau.": standing, it in his hand, and he raises it to the light;
  // the camera turns around it
  const tUp = t("etoile:mais") - 0.1;
  cut(tUp, SET.LAB, { ...B, tx: -16, ty: 128, tz: -108, d: 300, az: -46, el: 8, side: -120 }, { ...LABST, flask: 1, star: 1, ben: 1.45, fx: 0, fy: 160, fz: -90, fs: 260 });
  st(t("etoile:tient") - 0.35, 1.15, { ben: 2 }, "power2.inOut");
  const FL2 = [28, 184, -76]; // the flask held up against the window (dossier.js · HELD at ben 2, in the room)
  shot(tUp + 0.04, t("nitro") - 0.1 - (tUp + 0.04), { tx: FL2[0], ty: FL2[1], tz: FL2[2], d: 230, az: -24, el: -2 });
  // "nitrocellulose… un film sur la paroi… ce film tenait les éclats": the macro, the flask against the grey sky
  shot(t("nitro") - 0.1, t("oubli:étiquette") - 0.05 - (t("nitro") - 0.1), { tx: FL2[0], ty: FL2[1], tz: FL2[2], d: 72, az: -42, el: -6 }, "sine.inOut", 230);
  // "Il colle une étiquette dessus": on the cut, the label is there
  const tLabel = t("oubli:étiquette") - 0.05;
  cut(tLabel, SET.LAB, { ...B, tx: FL2[0], ty: FL2[1] - 4, tz: FL2[2], d: 130, az: -30, el: 9, side: -140 }, { ...LABST, flask: 1, star: 1, ben: 2, labelOn: 1, fx: 28, fy: 184, fz: -76, fs: 200 });
  shot(tLabel + 0.04, t("oubli:range") - 0.25 - (tLabel + 0.04), { d: 108, az: -40, el: 6 });
  // "Le range. Et n'y prête plus attention… pendant six ans.": back on its shelf, starred and whole, and the camera
  // pulls back slowly, the dust in the window's light — through the hold (the ad break): the question stays open
  const tShelf = t("oubli:range") - 0.25;
  cut(tShelf, SET.LAB, VIEW.shelf, { ...LABST, flask: 0, star: 1, ben: 0, labelOn: 1, fx: -150, fy: 300, fz: -220, fs: 320 });
  shot(tShelf + 0.04, 0.9, { d: 290, az: -12 });
  shot(t("oubli:prête") - 0.2, t("brevet") - 0.2 - (t("oubli:prête") - 0.2), { tx: -90, ty: 230, tz: -170, d: 900, az: -6, el: 4, side: -100 }, "sine.inOut", 290);

  /* ── 1909 · LE BREVET (l'établi) ───────────────────────────────────────────────────────────────────────── */
  const tPat = t("brevet") - 0.2;
  const DOC1 = { ...AT.doc, doc: 1, docIn: 0 };
  cut(tPat, SET.BENCH, { ...B, tx: 12, ty: 0, tz: -12, d: 270, az: -50, el: 46, side: -200 }, DOC1);
  // "En 1909, il dépose son brevet": the sheet lands, the camera dives onto its head (N° 405.881 · 25 novembre 1909)
  st(tPat + 0.05, t("brevet:brevet") - 0.1 - (tPat + 0.05), { docIn: 1 }, "power2.out");
  shot(tPat + 0.04, t("brevet:dépose") - (tPat + 0.04), { tx: 0, ty: 0, tz: -21, d: 118, az: -12, el: 56 }, "power3.out", 270);
  fact(tl, { id: "c4-f1909", k: "Brevet n° 405.881", v: "1909", from: t("brevet:1909") - 0.05, to: t("brevet:deux") - 0.15 });
  // "du verre, du celluloïd, du verre": down the sheet to the figure, its three layers lit as they are said
  shot(t("brevet:dépose"), t("brevet:verre") - t("brevet:dépose"), { tx: -4, ty: 0, tz: 4, d: 96, az: -8, el: 60 });
  st(t("brevet:verre") - 0.12, 0.45, { docIn: 1 + 1 / 3 }, "power2.out");
  st(t("brevet:celluloïd") - 0.12, 0.45, { docIn: 1 + 2 / 3 }, "power2.out");
  st(t("brevet:verre#2") - 0.12, 0.45, { docIn: 2 }, "power2.out");
  shot(t("brevet:verre"), t("brevet:deux") - 0.1 - t("brevet:verre"), { tx: 2, tz: 6, d: 84, az: 6, el: 62 });
  // "Deux ans plus tard naît la Société du Verre Triplex": the camera rises off the sheet and turns
  shot(t("brevet:deux") - 0.1, t("premier") - (t("brevet:deux") - 0.1), { tx: 0, tz: 0, d: 220, az: -30, el: 52 }, "sine.inOut", 84);
  fact(tl, { id: "c4-f1911", k: "Deux ans plus tard", v: "1911", s: "Société du Verre Triplex", from: t("brevet:deux") - 0.05, to: t("premier") - 0.1 });
  // "Il n'est pas le premier…": the lines go out, the sheet seen from further and lower · "1902"
  shot(t("premier"), t("premier:mais") - 0.2 - t("premier"), { tx: -2, ty: 0, tz: 6, d: 135, az: -34, el: 48 }, "sine.inOut", 220);
  fact(tl, { id: "c4-f1902", k: "Un brevet français", v: "1902", s: "Du celluloïd sur du verre", from: t("premier:1902") - 0.05, to: t("premier:mais") + 1.5 });
  // "Mais c'est son Triplex qui va s'imposer": back onto his name
  shot(t("premier:mais") - 0.2, t("premier$") + 0.1 - (t("premier:mais") - 0.2), { tx: -8, ty: 0, tz: -17, d: 88, az: -14, el: 50 }, "sine.inOut", 135);
  // "Les Anglais s'y mettent l'année suivante : English Triplex": the camera slides up the sheet to its title, turning
  const tPil = t("anglais:pilkington") - 0.3;
  shot(t("premier$") + 0.1, tPil - (t("premier$") + 0.1), { tx: 4, ty: 0, tz: -27, d: 128, az: 22, el: 38 });
  fact(tl, { id: "c4-f1912", k: "Les Anglais", v: "1912", s: "English Triplex", from: t("anglais:english") - 0.4, to: tPil - 0.05 });

  /* ── PILKINGTON : le bain d'étain revient ──────────────────────────────────────────────────────────────── */
  // "Plus tard, elle s'allie… à Pilkington. Le même nom que le bain d'étain.": the ribbon on the tin, raking, travelling
  cut(tPil, SET.LINE, VIEW.ribbon, { ...AT.line, step: 0, temp: 20, tempOn: 0, cut: 0, pos: 5000, fx: 1600, fy: 90, fz: 0, fs: 700 });
  shot(tPil + 0.04, t("loi") - 0.15 - (tPil + 0.04), onLine(2050, { ty: 92, tz: 130, d: 470, az: 18, el: 8, side: -160 }));

  /* ── LES ANNÉES TRENTE : la voiture ────────────────────────────────────────────────────────────────────── */
  // "l'Angleterre impose un verre de sécurité devant le conducteur": the windshield from outside, you behind it, closer
  const tCar = t("loi") - 0.15;
  cut(tCar, SET.CAR, VIEW.screenOut, { ...AT.car, sideOn: 1 });
  shot(tCar + 0.04, t("loi:france") - 0.6 - (tCar + 0.04), { tx: -30, ty: 124, tz: -52, d: 290, az: -156, el: 14, side: -180 });
  fact(tl, { id: "c4-f1930", k: "Angleterre", v: "Années 1930", s: "Devant le conducteur", from: t("loi:trente") - 0.35, to: t("loi:france") - 0.1 });
  // "Saint-Gobain mise d'abord… sur l'autre verre de ce film": the camera glides round to the side window
  shot(t("loi:france") - 0.6, t("loi:autre") + 0.3 - (t("loi:france") - 0.6), { tx: -88, ty: 118, tz: 12, d: 320, az: -80, el: 8, side: -150 });
  shot(t("loi:autre") + 0.3, t("pvb") - 0.15 - (t("loi:autre") + 0.3), { d: 270, az: -70 });

  /* ── LE PVB (l'établi) ─────────────────────────────────────────────────────────────────────────────────── */
  // "Le celluloïd vieillit mal. L'acétate… jaunit et se décolle": the windshield on the bench, the light yellowing
  // over it; the camera dives onto the place where the film lifts — the bubble
  const tPvb = t("pvb") - 0.15;
  const BB = onBenchAt(BUBBLE);
  cut(tPvb, SET.BENCH, { ...VIEW.benchClose, az: -40, side: -120 }, { ...AT.bench });
  shot(tPvb + 0.04, t("pvb:décolle") - 0.15 - (tPvb + 0.04), { tx: BB[0], ty: BB[1], tz: BB[2], d: 80, az: -22, el: 30 }, "sine.inOut", 300);
  st(t("pvb:vieillit") - 0.15, t("pvb:jaunit") + 0.3 - (t("pvb:vieillit") - 0.15), { gel: 0.12 }, "sine.inOut");
  st(t("pvb:décolle") - 0.2, 0.8, { bubble: 1 }, "power2.out");
  // "Il faut attendre les années trente et quarante pour le PVB… celui de ton pare-brise": the yellow and the bubble
  // go, the camera pulls back, the windshield opens on its film — veille, full — and closes on it
  shot(t("pvb:attendre") - 0.3, t("pvb:celui") - (t("pvb:attendre") - 0.3), { tx: 0, ty: 62, tz: -10, d: 420, az: -42, el: 12, side: -180 }, "sine.inOut", 80);
  st(t("pvb:attendre") - 0.3, 1.0, { gel: 0, bubble: 0 }, "power2.inOut");
  st(t("pvb:pvb") - 0.3, 0.7, { explode: 0.6, litFilm: 1 }, "power2.out");
  st(t("pvb:celui") - 0.05, 0.9, { explode: 0 }, "power2.inOut");
  shot(t("pvb:celui"), 1.4, { az: -28, d: 390 });
  fact(tl, { id: "c4-f1940", k: "Le PVB", v: "1930-1940", from: t("pvb:trente") - 0.3, to: t("autoclave") - 1.0 });

  /* ── 08 · L'AUTOCLAVE ──────────────────────────────────────────────────────────────────────────────────── */
  const [a0] = span(D, "autoclave");
  const AUTO = {
    ...AT.line, step: 7, temp: 20, tempOn: 1, cut: 1, print: 1, bend: 1, film: 1, milk: 1, open: 0, sensors: 0,
    air: 1, door: 1, press: 0, mood: 0, hot: 0, fx: 8700, fy: 110, fz: 0, fs: 520,
  };
  // under the card: out of the clean room, high, turned; the whip falls onto the milky sandwich on the rollers
  const PA = 8470;
  cut(a0, SET.LINE, onLine(PA + 160, { ty: 150, d: 760, az: 34, el: 36, side: -100 }), { ...AUTO, pos: PA });
  shot(a0 + 0.04, 0.85, onLine(PA + 20, { ty: 100, d: 330, az: -24, el: 40, side: -100 }), "expo.out");
  st(a0, t("autoclave:chasse") - a0, { pos: PA + 100 }, "none");
  // "Le sandwich est encore laiteux": closer on the veil
  shot(a0 + 0.9, t("autoclave:laiteux") + 0.6 - (a0 + 0.9), onLine(PA + 80, { ty: 96, d: 200, az: -18, el: 36, side: -100 }));
  // "il reste de l'air entre les couches. On le chasse.": raking, along the rollers — the veil starts to leave
  shot(t("autoclave:laiteux") + 0.6, t("autoclave:puis") - (t("autoclave:laiteux") + 0.6), onLine(PA + 110, { ty: 94, d: 175, az: -6, el: 12, side: -100 }));
  st(t("autoclave:chasse") - 0.1, 0.9, { milk: 0.6 }, "power2.out");
  // "Puis tout part en autoclave": back to the open door; it rolls in, the door shuts; "vers 140 °C"
  const tIn = t("autoclave:autoclave");
  shot(t("autoclave:puis"), tIn + 1.4 - t("autoclave:puis"), VIEW.autoclaveDoor, "sine.inOut", 175);
  st(tIn - 0.55, 0.8, { door: 0 }, "power2.inOut");
  st(tIn + 0.25, 1.65, { pos: 9300 }, "sine.inOut");
  st(tIn + 1.95, 0.6, { door: 1 }, "power2.inOut");
  st(t("autoclave:140") - 0.2, 0.7, { temp: 140 }, "power2.out");
  st(t("autoclave:140") - 0.1, 1.0, { press: 0.35 }, "power2.out");
  shot(tIn + 1.4, t("transparent") - 0.12 - (tIn + 1.4), onLine(9200, { ty: ST.autoclave.axisY, d: 1250, az: -30, el: 12, side: -150 }));
  fact(tl, { id: "c4-fpress", k: "Autoclave", v: "Sous pression", from: t("autoclave:pression") - 0.25, to: t("transparent") - 0.15 });

  // "Le film colle au verre pour de bon": through the drum's glass, the veil clears
  const tThru = t("transparent") - 0.12;
  cut(tThru, SET.LINE, onLine(9300, { ty: 130, d: 620, az: -16, el: 26, side: -120 }), { ...AUTO, pos: 9300, temp: 140, press: 0.05, hot: 0, milk: 0.6, fx: 9300, fy: 120, fs: 520 });
  shot(tThru + 0.04, t("transparent:ressort") - 0.15 - (tThru + 0.04), { d: 520, az: -30, el: 30 });
  st(t("transparent:colle") - 0.1, 1.5, { milk: 0 }, "power2.inOut");
  // "Et le pare-brise ressort… parfaitement transparent": on the line again, downstream, it rolls out clear
  const tOut = t("transparent:ressort") - 0.15;
  const PO = 10040;
  cut(tOut, SET.LINE, onLine(PO + 60, { ty: 112, d: 400, az: 28, el: 26, side: -140 }), { ...AUTO, pos: PO, temp: 140, press: 0, milk: 0, air: 0, fx: 10100, fy: 100, fs: 420 });
  st(tOut + 0.05, t("bulle") - 0.2 - (tOut + 0.05), { pos: PO + 80 }, "sine.out");
  shot(tOut + 0.04, t("bulle") - 0.2 - (tOut + 0.04), onLine(PO + 100, { ty: 98, d: 300, az: -12, el: 36, side: -140 }));
  // "Une bulle oubliée, et le film pourrait se décoller du verre.": down onto the film — the what-if, then it goes
  const BO = onLineAt(PO + 80, BUBBLE);
  shot(t("bulle") - 0.2, t("bulle:décoller") - (t("bulle") - 0.2), onLine(BO[0], { ty: BO[1], tz: BO[2], d: 80, az: -22, el: 30, side: -220 }), "sine.inOut", 300);
  shot(t("bulle:décoller"), t("bulle:encaisser") - 0.15 - t("bulle:décoller"), { d: 66, az: -4, el: 36 });
  st(t("bulle:bulle") - 0.1, t("bulle:décoller") + 0.3 - (t("bulle:bulle") - 0.1), { bubble: 1 }, "power1.out");
  st(t("bulle:test") - 0.3, 0.9, { bubble: 0 }, "power2.inOut");
  // "Or, au test, c'est lui qui va tout encaisser.": a flash of the test hall — the 10 kg head held over the windshield
  const tFlash = t("bulle:encaisser") - 0.15;
  cut(tFlash, SET.LINE, { ...VIEW.frame, d: 430 }, { ...AUTO, pos: 11850, milk: 0, sensors: 1, air: 0, drop: 0, mood: 1, fx: 11850, fy: 160, fs: 420 });
  shot(tFlash + 0.04, 0.8, { d: 360, el: 28 });

  // "Dernière touche : capteur de pluie, support de caméra.": the glue nozzle comes down, the box of the eyes is set
  const tEyes = tFlash + 0.85;
  const SEN = onLineAt(10300, SENSOR);
  cut(tEyes, SET.LINE, onLine(10300, { ty: 130, d: 620, az: -42, el: 34, side: -140 }), { ...AUTO, pos: 10300, milk: 0, air: 0, sensors: 0, scan: 0, fx: 10300, fy: 110, fs: 400 });
  shot(tEyes + 0.04, t("yeux:ton") - 0.2 - (tEyes + 0.04), onLine(SEN[0], { ty: SEN[1], tz: SEN[2], d: 210, az: -22, el: 30, side: -140 }), "sine.inOut", 620);
  st(t("yeux:capteur") - 0.2, 1.6, { sensors: 1 }, "power2.inOut");
  // "Ton pare-brise porte les yeux de ta voiture": close round the box
  shot(t("yeux:ton") - 0.2, t("yeux:chaque") - 0.35 - (t("yeux:ton") - 0.2), onLine(SEN[0], { ty: SEN[1], tz: SEN[2], d: 108, az: 12, el: 26, side: -140 }));
  // "Et chaque vitrage est inspecté.": the light sweeps across it, the camera pulls back under it
  shot(t("yeux:chaque") - 0.35, to - (t("yeux:chaque") - 0.35), onLine(10300, { ty: 120, d: 330, az: -24, el: 26, side: -100 }), "sine.inOut", 140);
  st(t("yeux:chaque") - 0.1, to - 0.15 - (t("yeux:chaque") - 0.1), { scan: 1 }, "sine.inOut");
}
