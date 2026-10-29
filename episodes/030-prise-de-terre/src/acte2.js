// 02 · AUTOPSIE — from « …on l'ouvre » to the cut of act 3 (tobench → tozero).
//
// Act 1 leaves the lug inside the live casing (VIEW.system). On the cut the same lug stands on the bench at the same
// place of the picture (benchCut): only what was around it has changed — the stub of casing keeps its fault light.
// On « on » the chain unrolls downward under the stub (explode), the plug coming apart from its socket, and the camera
// pulls back by ratio to the whole column. Then ONE descent along the column, behind a veille head (`run`): the lug
// (« Sur la carcasse » : la masse), the green-and-yellow conductor lighting up on its word and the head starting down
// it, the plug going home onto the socket's earth pin on « broche », the head reaching the unit's main earthing
// terminal on « tableau », then the earthing conductor, the test link and the loop on « la terre, sous la maison ».
// « Autour des fondations » : a cut matched on the loop — the bench's turn of copper, the same junction at the same
// place of the picture, under the laundry's floor in the ideal house (chain whole, nothing live). The camera pulls
// back and glides along the loop round the corner of the footing (« autour »); « prise de terre » on « prise ». It
// rises through the slab: the machine spinning, normal (ink), the chain whole and still — « elle ne fait rien… tant
// que tout va bien ». « Mais ici » : our house — the casing goes live, the chain withdraws from the loop to the socket,
// the socket becomes a two-hole one again, and a head leaves the lug along the cord and dies on the plug: « n'arrive
// nulle part ». The threshold does not stop the film: the camera is already on its way from the socket to your hand
// above the lid, which rises as the voice says « on rejoue la scène » — act 3 cuts on that same frame.
import * as THREE from "three";
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { moved } from "@kit/direct.js";
import { SET, VIEW, BENCHED, STAGED, PLACE, BENCH, SIZE } from "./world.js";

/* ── on the bench (poses of model.js's journal, retuned on the planches) ── */
const STUB = { ...VIEW.bStub, d: 88 };
// the plug going home onto the pin, seen nearly square: the socket's earth pin at the top of its well
const PLUG_IN = { ...VIEW.bPlug, d: 86, az: -8, el: 34, shift: 20 };
const TAB = VIEW.bTab;
const EARTH = { ...VIEW.bEarth };
/* ── in place ── */
// the bench's last frame, carried onto the same junction of the loop under the laundry's floor
const MATCH = moved(EARTH, BENCH.join, PLACE.join);
// round the corner of the footing, the house above it: the loop leaves along the back wall and turns along the left one
const AROUND = { ...VIEW.under, tx: -200, ty: -40, tz: 100, d: 900, az: -40, el: 16, shift: 40 };
const AROUND2 = { ...AROUND, tx: -190, tz: 90, d: 860, az: -33, el: 15 };
// up through the slab: the machine above, normal, the chain whole from the socket down to the loop
const RISE = { ...VIEW.section, tx: -30, ty: 30, tz: 40, d: 600, az: -36, el: 18, fov: 34, shift: 40 };
// the socket, the cord and the machine: the head running from the lug to the plug
const SOCK_WIDE = { ...VIEW.socket, dof: 0, tx: -40, ty: 40, tz: 6, d: 260, az: -26, el: 8, shift: 80 };
// the machine live and you beside it, the way to your hand (the threshold)
const OVER = { ...VIEW.machine, tx: 20, ty: 70, tz: 40, d: 420, az: -40, el: 14 };
const SOCK_NEAR = { ...VIEW.socket, d: 110, dof: 4 };

// the light: what it stands around, and how wide
const Lb = (p, fs) => ({ fx: p[0], fy: p[1], fz: p[2], fs });
const L_WHOLE = Lb([0, 34, 0], SIZE);
const L_STUB = Lb(BENCH.cosse, 18);
const L_PLUG = Lb(BENCH.plug, 18);
const L_TAB = Lb([0, 29, 1], 24);
const L_EARTH = Lb([4, 8, 1], 34);
const L_UNDER = Lb([-170, -80, -6], 140);
const L_AROUND = Lb([-200, -40, 60], 450);
const L_RISE = Lb([-90, 50, 10], 700);
const L_SOCK = Lb([-40, 36, 10], 130);

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tobench: "tobench", explode: "explode", ouvreEnd: "ouvre$",
    sur: "eclate", carc2: "carc2", carcEnd: "eclate:carcasse$", vj: "vj", conducteur: "conducteur", protection: "protection",
    par: "eclate:Par", broche: "broche", prise: "prise", rejoint: "eclate:rejoint", tableau: "tableau", puis: "puis",
    terre: "terre", maison: "maison", eclateEnd: "eclate$",
    torepos: "torepos", fondations: "fondations", cuivre: "cuivre", pdt: "pdt", pdtEnd: "repos:terre$",
    elle: "repos:Elle", rien2: "rien2", bien: "bien", mais: "mais", ici: "ici", fil: "fil", nulle: "nulle", part: "part",
    seuil: "seuil", rejoue: "rejoue1", scene2: "scene2", avecce: "avecce", seuilEnd: "seuil$", tozero: "tozero",
  });
  setAct(tl, 2, t.tobench);

  /* ───────────── « …on l'ouvre. » — the same lug on the bench, at the same place; the chain unrolls under it ───────────── */
  const origin = PLACE.cosse.map((v, i) => v - BENCH.cosse[i]);
  const bench = benchCut(D, {
    at: t.tobench, set: SET.BENCH, view: VIEW.system, origin,
    state: { ...BENCHED, live: 1, fault: 1, mood: 0, ...L_STUB },
  });
  // the chain pays out downward from under the stub, the plug coming apart from its socket (an exploded view)
  st(t.explode, 1.55, { explode: 1 }, "sine.inOut");
  st(t.explode + 0.2, 0.9, { plug: 0 }, "sine.inOut");
  const back = t.sur + 0.02 - (t.explode + 0.02);
  shot(t.explode + 0.02, back, VIEW.exploded, "sine.inOut", bench.d);
  st(t.explode + 0.02, back, L_WHOLE, "sine.inOut");

  /* ───────────── « Sur la carcasse, » — the lug: la masse ───────────── */
  const dive = t.carcEnd - t.sur;
  shot(t.sur + 0.02, dive, STUB, "sine.inOut", VIEW.exploded.d);
  st(t.sur + 0.02, dive, L_STUB, "sine.inOut");
  st(t.carc2, 0.3, { litCosse: 1 }, "sine.out");
  const cMasse = co.add({ title: "La masse", x: 150, y: 500, align: "start", tone: "system", anchor: A.cosse });
  cMasse.show(tl, t.carc2 - 0.05);
  cMasse.hide(tl, t.vj - 0.12);

  /* ───────────── « un fil vert-jaune : le conducteur de protection. » — it lights up, a head leaves down it ───────────── */
  st(t.vj - 0.05, 0.35, { pe: 0.75, litPe: 0.6 }, "sine.out");
  st(t.vj + 0.3, 0.4, { litCosse: 0 }, "sine.inOut");
  D.punch(t.vj, 0.05);
  st(t.vj + 0.1, t.broche - (t.vj + 0.1), { run: 0.235 }, "sine.inOut"); // down the PE and the cord, to the plug
  // (A.pe is half-way down the cord, out of the frame here: a point of the striped wire just under the lug)
  const peTag = new THREE.Object3D();
  peTag.position.set(-2.5, -5.5, 1.6); // in the stub's frame: the lug is at (-3, -2), the wire leaves it downward
  world.system.parts.stub.add(peTag);
  const cPe = co.add({ title: "Conducteur de protection", x: 150, y: 500, align: "start", tone: "system", anchor: peTag });
  cPe.show(tl, t.conducteur - 0.05);
  cPe.hide(tl, t.par - 0.15);
  const down = t.broche - 0.15 - (t.vj + 0.35);
  shot(t.vj + 0.35, down, PLUG_IN, "sine.inOut");
  st(t.vj + 0.35, down, L_PLUG, "sine.inOut");

  /* ───────────── « Par la broche de ta prise, » — the plug goes home onto the socket's earth pin ───────────── */
  st(t.broche, t.prise + 0.1 - t.broche, { plug: 1 }, "sine.inOut");
  st(t.broche + 0.1, t.prise + 0.12 - (t.broche + 0.1), { run: 0.28 }, "sine.inOut");
  st(t.prise - 0.05, 0.3, { litPrise: 1 }, "sine.out");
  st(t.vj + 0.6, 0.5, { litPe: 0 }, "sine.inOut");
  const cPin = co.add({ title: "Broche de terre", x: 150, y: 500, align: "start", tone: "system", anchor: A.pin });
  cPin.show(tl, t.broche - 0.05);
  cPin.hide(tl, t.rejoint - 0.1);

  /* ───────────── « il rejoint le tableau… » — the head reaches the main earthing terminal ───────────── */
  const toTab = t.tableau + 0.25 - (t.prise + 0.15);
  shot(t.prise + 0.15, toTab, TAB, "sine.inOut");
  st(t.prise + 0.15, toTab, L_TAB, "sine.inOut");
  st(t.prise + 0.15, t.tableau + 0.1 - (t.prise + 0.15), { run: 0.52 }, "sine.inOut");
  st(t.tableau, 0.3, { litBorne: 1 }, "sine.out");
  st(t.tableau + 0.4, 0.4, { litPrise: 0 }, "sine.inOut");
  const cBorne = co.add({ title: "Borne principale de terre", x: 150, y: 500, align: "start", tone: "system", anchor: A.borne });
  cBorne.show(tl, t.tableau - 0.05);
  cBorne.hide(tl, t.puis + 0.05);

  /* ───────────── « puis la terre, sous la maison. » — the earthing conductor, the test link, the loop ───────────── */
  const toEarth = t.maison + 0.1 - (t.puis - 0.1);
  shot(t.puis - 0.1, toEarth, EARTH, "sine.inOut");
  st(t.puis - 0.1, toEarth, L_EARTH, "sine.inOut");
  st(t.puis, t.maison + 0.15 - t.puis, { run: 0.84 }, "sine.inOut");
  st(t.terre, 0.3, { litTerre: 1 }, "sine.out");
  st(t.maison - 0.05, 0.3, { litBoucle: 1 }, "sine.out");
  st(t.terre + 0.3, 0.4, { litBorne: 0 }, "sine.inOut");
  D.punch(t.terre, 0.05);
  const cTerre = co.add({ title: "Conducteur de terre", x: 150, y: 500, align: "start", tone: "system", anchor: A.terre });
  cTerre.show(tl, t.terre - 0.05);
  cTerre.hide(tl, t.torepos - 0.25);

  /* ───────────── « Autour des fondations, un câble de cuivre nu : la prise de terre. » — the same loop, in place ───────────── */
  // the ideal house: the chain whole, the floor cut away, nothing live
  cut(t.torepos, SET.SCENE, MATCH, {
    ...STAGED, under: 1, chain: 1, pin: 1, plug: 1, live: 0, fault: 0, mood: 0, pe: 0.35, run: 0, litBoucle: 1, ...L_UNDER,
  });
  const out = t.cuivre - (t.torepos + 0.04);
  shot(t.torepos + 0.04, out, AROUND, "sine.inOut", MATCH.d);
  st(t.torepos + 0.04, out, L_AROUND, "sine.inOut");
  shot(t.cuivre, t.elle - 0.2 - t.cuivre, AROUND2, "sine.inOut"); // a slow glide round the corner
  st(t.cuivre + 0.3, 0.5, { litBoucle: 0 }, "sine.inOut");
  st(t.pdt - 0.05, 0.3, { litBoucle: 1 }, "sine.out");
  D.punch(t.pdt, 0.05);
  const cLoop = co.add({ title: "Prise de terre", x: 150, y: 500, align: "start", tone: "system", anchor: A.loop });
  cLoop.show(tl, t.pdt - 0.05);
  cLoop.hide(tl, t.elle - 0.1);

  /* ───────────── « Elle ne fait rien… tant que tout va bien. » — up through the slab: the machine, normal ───────────── */
  const up = t.bien - (t.elle - 0.2);
  shot(t.elle - 0.2, up, RISE, "sine.inOut", AROUND2.d);
  st(t.elle - 0.2, up, L_RISE, "sine.inOut");
  st(t.elle, 0.6, { litBoucle: 0 }, "sine.inOut");

  /* ───────────── « Mais ici, ce fil… n'arrive nulle part. » — our house: no earth beyond the plug ───────────── */
  st(t.ici, 0.25, { live: 1, fault: 1, mood: 1 }, "power2.out");
  const wide = t.fil - (t.mais - 0.05);
  shot(t.mais - 0.05, wide, SOCK_WIDE, "sine.inOut");
  st(t.mais - 0.05, wide, L_SOCK, "sine.inOut");
  st(t.fil, t.nulle - 0.15 - t.fil, { chain: 0 }, "sine.inOut"); // the chain withdraws from the loop to the socket
  st(t.fil + 0.2, 0.3, { pin: 0 }, "sine.inOut"); // the socket is a two-hole one again
  st(t.nulle - 0.3, 0.4, { under: 0 }, "sine.inOut");
  st(t.fil + 0.1, t.part + 0.1 - (t.fil + 0.1), { run: 1 }, "none"); // a head from the lug along the cord, dies on the plug
  const near = t.part + 0.15 - (t.nulle - 0.6);
  shot(t.nulle - 0.6, near, SOCK_NEAR, "sine.inOut");
  D.punch(t.nulle, 0.06);
  chip("chip-nulle", null, 96, 470, t.nulle, t.seuil + 0.4);

  /* ───────────── the threshold — « Abonne-toi : on rejoue la scène… avec ce fil. » ───────────── */
  // The film does not stop for it: from the socket the camera is already on its way to your hand above the lid,
  // which rises again as the voice says « on rejoue la scène » — act 3 cuts on this same frame.
  // (the head has died on the plug: the cord stays faintly lit — « ce fil » — until act 3 cuts)
  // (round the machine, not through it: first back to the machine whole, then in to your arm)
  const wideAt = t.part + 0.25;
  const inAt = t.scene2;
  shot(wideAt, inAt - wideAt, OVER, "sine.inOut");
  st(wideAt, inAt - wideAt, { fx: 10, fy: 60, fz: 40, fs: 200 }, "sine.inOut");
  shot(inAt, t.tozero - 0.06 - inAt, VIEW.reach, "sine.inOut");
  st(inAt, t.tozero - 0.06 - inAt, { fx: 30, fy: 92, fz: 46, fs: 90 }, "sine.inOut");
  st(t.rejoue, t.avecce - t.rejoue, { reach: 1 }, "sine.inOut");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.15, t.tozero - 0.1) });
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.rejoue);
  tl.to("#hud-clock", { scale: 1, duration: 0.36, ease: "power2.out" }, t.rejoue + 0.3);
}
