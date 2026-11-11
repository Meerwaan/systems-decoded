// DOSSIER 042 — 01 MENACE (accroche, promesse, scène): 0 → ouvre − 0.12.
//
// PLAN-SÉQUENCE, two places, one cut:
//   the tank   from POSE0 (front-left, at ground level, under the gun, the panel already lifting on its flames) ONE
//              path, az decreasing −36 → −62: on « saute » the panel tears off and the column bursts behind the turret,
//              the camera lifts its gaze with it; « Exprès » the four light up, intact; the camera climbs to the roof
//              (« on l'a mis là »: the green ring round the opening), then glides forward past the turret's rear and
//              comes down to the loader with his door behind him — on « ouverte » it slides a notch, a signal slit.
//   « même seconde »  a cut on `toscene`: the caisson in section in the glass turret, nothing burning yet, a second
//              path az +10 → −20: one case lights on « flambe »; pull back to the four in front of the bulkhead
//              (« Toi » picked out); back in to the caisson while the arrows are born face by face; the big arrow to
//              the roof on « toit », the one to the door and to him on « toi »; it lands at speed on VIEW.closeIn,
//              where acte2 goes on without a cut.
// Hand-over at 17.54: STAGED + crew 1, you 1, burn 0.3, press 1, arrowRoof 1, arrowDoor 1, heat 0.3, LIGHT.caisson;
// nothing tweens past 17.54 but the camera.
import { setAct } from "@kit/overlay.js";
import { SET, POSE0, VIEW, STAGED, LIGHT } from "./world.js";

/* ── the poses (VIEW's, moved where the planche asked) ── */
// the roof at az −43 (not VIEW.roof's −50): the path must end the door shot at az −50, and az only decreases
const ROOF = { ...VIEW.roof, az: -43 };
// the loader and his door side by side: at az −62 (VIEW.doorSlit) he stands in the axis of the door and hides the
// slit; at −50 the slit opens 50 cm to the right of his shoulder
const DOOR = { ...VIEW.doorSlit, tx: -125, ty: -8, tz: 40, d: 720, az: -50, el: 9 };
// the caisson in section, centred (VIEW.section put it against the buttons' edge)
const SECTION = { ...VIEW.section, tx: 40, d: 1050 };
// the four AND the caisson whole (VIEW.crewWide cut the caisson at the right edge)
const CREW_WIDE = { ...VIEW.crewWide, tx: -150, d: 1900 };

export default function acte1({ D, world }) {
  const { st, path, cut, chip, punch } = D;
  const t = D.times({
    brulent: "accroche:brûlent", saute: "accroche:saute", expres: "accroche:exprès",
    point: "promesse:point", la: "promesse:là", toiP: "promesse:toi", sauf: "promesse:sauf", porte: "promesse:porte",
    dos: "promesse:dos", ouverte: "promesse:ouverte",
    toscene: "toscene", tourelle: "scene:tourelle", flambe: "scene:flambe", toi: "scene:toi", devant: "scene:devant",
    pression: "scene:pression", monte: "scene:monte", chemin: "scene:chemin", toit: "scene:toit", sceneEnd: "scene$",
    ouvre: "ouvre",
  });
  const out = t.ouvre - 0.12; // 17.54: acte2 picks up here, no cut
  const ouToi = t.sceneEnd - 0.24; // « …ou toi » (scene:toi catches « Toi » at 11.34)
  setAct(D.tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* ── the tank: « Tes obus brûlent. Le toit de ton char saute. Exprès. » ── */
  // from frame 1 the panel bangs on its flames (FIRST: blow 0.08, column 0.45): it jolts up and drops back twice, the
  // flames burst out by its edge each time; then it lifts while the jet sinks under it (lift 10 → 35 cm, jet 3 → 5,6 m)
  const t0 = t.saute - 0.06, tb = t.brulent;
  // (above ≈ 0.45 the jet only grows under the HUD, where the column is black: the motion that shows is the jet
  // choking to 1,5 m when the panel slams back, and bursting again)
  st(0, 0.18, { blow: 0.135 }, "power2.out");
  st(0.18, 0.32, { blow: 0.09 }, "power2.in");
  st(tb - 0.12, 0.2, { blow: 0.14 }, "power2.out");
  st(tb + 0.08, 0.46, { blow: 0.1 }, "power2.in");
  st(tb + 0.58, t0 - tb - 0.58, { blow: 0.14 }, "sine.in");
  st(0, 0.18, { column: 0.6 }, "power2.out");
  st(0.18, 0.37, { column: 0.2 }, "power2.in");
  st(tb - 0.12, 0.3, { column: 0.62 }, "power2.out");
  st(tb + 0.18, 0.46, { column: 0.25 }, "power2.in");
  st(tb + 0.64, t0 - tb - 0.64, { column: 0.15 }, "sine.inOut");
  // « saute »: it tears off and climbs (the chrono is in ms: slow motion), seen whole ABOVE the 1,1 m licks from
  // ≈ +0,5 s and under the header (≈ 2,6 m above the roof here) until ≈ +1,05 s; only then the column bursts
  // behind it — it catches it where the column is already black (under the HUD), never below
  st(t0, 4.2, { blow: 1 }, "none");
  st(t0, 0.9, { heat: 0.95 }, "power2.out");
  st(t.saute + 1.1, 0.45, { column: 1 }, "power2.out");
  // « Exprès »: the four light up, intact, in front of the fire
  st(t.expres - 0.1, 0.4, { crew: 1 }, "power2.out");
  punch(t.brulent, 0.06);
  punch(t.expres, 0.06);

  /* « Son point faible, on l'a mis là, pour toi. » — the roof: the column comes down to let it read, the green ring */
  // it dies back into the opening (a 35 cm lick stays): no orange veil over the top of the close shots
  st(t.saute + 1.6, 1.0, { column: 0.6 }, "sine.inOut");
  st(t.point - 0.1, 1.1, { fall: 0.88 }, "sine.inOut");
  st(t.la - 0.08, 0.4, { weak: 1 }, "power2.out");
  chip("chip-faible", null, 96, 470, t.la - 0.05, t.sauf - 0.12);
  st(t.toiP - 0.08, 0.35, { you: 1 }, "power2.out");
  punch(t.toiP, 0.06);
  /* « Sauf si la porte dans ton dos… est ouverte. » — the loader, his door behind him: on « ouverte » it slides */
  st(t.sauf, 0.5, { weak: 0 }, "sine.inOut");
  st(t.sauf, 0.6, { fall: 1 }, "sine.inOut"); // the last lick dies: low and close, it veiled the top of the door shot
  st(t.ouverte - 0.15, 0.45, { door: 0.9 }, "power2.out"); // wide: the leaf overlaps 4 cm, the 12 cm wall hides 10 cm at az −50 — 0.9 shows ≈ 50 cm of signal light
  punch(t.ouverte, 0.05, { hold: 0.12, down: 0.3 });

  path([
    [0, POSE0],
    [0.7, { tx: -215, ty: -40, d: 1800, az: -37, el: 0 }], //                    the first second pushes in on the fire (the loop glides in too)
    [t.saute, { tx: -185, ty: 10, d: 1700, az: -38, el: 1 }], //               the gaze lifts with the panel
    [t.expres, { tx: -170, ty: 20, d: 1650, az: -40, el: 5, fov: 40 }], //     the four, lit, in front of the fire
    [t.la, ROOF], //                                                           the roof, the ring
    [t.sauf, { tx: -70, ty: 15, tz: 30, d: 1320, az: -46, el: 20, shift: 430 }], // back a step: the roof AND him, above the captions
    [t.dos, { tx: -110, ty: 0, tz: 42, d: 800, az: -48, el: 13, shift: 150 }], // …down to him
    [t.toscene, { ...DOOR, shift: 60 }], //                                     his door behind him, beside him
  ]);

  /* ── « même seconde », back to the powder (a cut, a few frames before the sentence) ── */
  /* « À l'arrière de la tourelle, la poudre flambe. » */
  cut(t.toscene, SET.TANK, SECTION, { ...STAGED, ...LIGHT.caisson, crew: 0.35 });
  st(t.flambe - 0.15, 0.6, { burn: 0.3 }, "power2.out");
  st(t.flambe, 1.4, { heat: 0.3 }, "sine.inOut");
  /* « Toi et trois autres, devant. » */
  st(t.toi - 0.12, 0.45, { crew: 1, you: 1 }, "power2.out");
  chip("chip-toi", world.tank.A.you, -40, -120, t.toi - 0.05, t.pression - 0.15);
  /* « La pression monte. » — the arrows are born face by face, then full */
  st(t.pression - 0.05, 1.15, { press: 1 }, "sine.inOut");
  /* « Le feu va choisir son chemin : le toit… ou toi. » */
  st(t.toit - 0.08, 0.4, { arrowRoof: 1 }, "power2.out");
  st(ouToi - 0.08, 0.4, { arrowDoor: 1 }, "power2.out");
  punch(ouToi, 0.06);

  path([
    [t.toscene, SECTION], //                                               the caisson in section, the turret's rear
    [t.flambe, { az: 4, d: 960, el: 13 }], //                                   one case lights
    [t.devant, CREW_WIDE], //                                                   the four in front of the bulkhead
    [t.monte, { tx: -30, ty: -5, tz: 5, d: 1050, az: -8, el: 14 }], //         back to the caisson: the pressure
    [t.toit, { ...VIEW.closeIn, az: -14, d: 900 }], //                          the roof…
    [out, VIEW.closeIn], //                                                     …or you: what we will open
  ]);
}
