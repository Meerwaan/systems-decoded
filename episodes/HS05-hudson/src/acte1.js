// 01 · MENACE — accroche → scene (0 → « Alors… »), over the Bronx at 15:27:11, the L05's world re-framed 9:16.
//   A  POSE0: under the left intake, looking up — the geese streaming into the fan (frame 1 already moving: a push)
//   B  « Tu es à 860 mètres » — above and behind the plane, the city far below
//   C  « Ta check-list est écrite pour plus de 6 000 » — the check-list binder on its bench, open on its first part
//   D  « L'aéroport est derrière toi : demi-tour… ou fleuve ? » — over the plane, back toward LaGuardia (signal)
//   scene: the left engine winds down (35 %), the two exhausts from behind (15 %), the cabin from above (155), pulled
//   back over New York, then the dive to the left engine: something has gone in (goose 0 → 0.5 at the fan)
// The clock runs at the true speed through this act (world.js · PROMO_CLOCK): the plane is where the header says.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, AT, VIEW, POSE0 } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame
const AFTER = { n1L: 35, n1R: 15, burn: 0.35, gen: 0, flame: 0 }; // what the engines are once the scene has said it

export default function acte1({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    oies: "accroche:oies", promesse: "promesse", check: "promesse:check-list", curiosite: "curiosite", aeroport: "curiosite:l'aéroport",
    demi: "curiosite:demi-tour", fleuve: "curiosite:fleuve", scene: "scene", p35: "scene:35", droit: "scene:le", p15: "scene:15",
    pax: "scene:155", ny: "scene:new", et: "scene:et", entrer: "scene:d'entrer", moteurs: "scene:moteurs", ouvre: "ouvre",
  });
  // act 1 lit on the very first frame (a zero-length tween at 0 is not drawn by a seek to 0)
  document.querySelectorAll(".hud__acts span").forEach((span, i) => {
    span.style.opacity = i === 0 ? "1" : "0.4";
    span.style.color = i === 0 ? "#e9e4d8" : "rgba(233, 228, 216, 0.62)";
  });
  setAct(tl, 1, 0);
  D.captionStyle({ hit: 0.25 });

  /* A — « Tes deux moteurs viennent d'avaler des oies. » : the geese into the intake; a push from frame 1 */
  const bAt = F(t.promesse - 0.1);
  // (qa 03/11: 1,2 at the first half-second with a gentle push) — a rush up into the intake from frame 1, turning
  // (not closer than ≈ 700: below it a goose crosses the lens for a frame, qa 1,13 s)
  // (and no swing round: at az −64 the geese's stream passes by the lens, qa 1,07 s)
  shot(0, 0.8, { ...POSE0, d: 780, el: -16 }, glide(3, 0.25), POSE0.d);
  shot(0.8, bAt - 0.8, { ...POSE0, d: 720, el: -17 }, "sine.out", 780);
  D.jolt(0.1, 0.4, 0.45); // the first goose into the fan: the whole engine shudders
  D.punch(t.oies, 0.04, { up: 0.08, hold: 0.12, down: 0.3 }); // over before the cut

  /* B — « Tu es à 860 mètres. » : the camera goes on backing away, up: the plane over the city, 860 m of air under it */
  cut(bAt, null, { ...VIEW.over, d: 10400, az: 134 }, { lock: 0, geese: 0 });
  const cAt = F(t.check - 0.12);
  shot(bAt, cAt - bAt, { ...VIEW.over, d: 7800, az: 114 }, "sine.out", 10400);

  /* C — « Ta check-list est écrite pour plus de 6 000. » : the binder, open on its first part */
  cut(cAt, SET.BENCH, { ...VIEW.qrh, d: 74, az: -6 }, { ...AT.bench, page: 0.45, named: 0, clockOn: 1, countOn: 1 }, { fade: 0.15 });
  const dAt = F(t.curiosite - 0.12);
  shot(cAt, dAt - cAt, { ...VIEW.qrh, d: 54, az: -28, el: 50 }, "sine.inOut", 74);
  st(cAt + 0.1, 1.3, { page: 1 }, "sine.inOut"); // the binder opens on its first part (qa: 4–6 s was still)

  /* D — « L'aéroport est derrière toi : demi-tour… ou fleuve ? » : over the plane, back toward LaGuardia */
  cut(dAt, SET.VOL, VIEW.back, { ...AT.vol, lock: 0, geese: 0, clockOn: 1, countOn: 1, track: 1660 }, { fade: 0.15 });
  st(t.aeroport + 0.1, 0.8, { lgaSig: 1 }, "sine.out");
  const sAt = F(t.scene - 0.12);
  shot(dAt, sAt - dAt, { ...VIEW.back, d: 7300, az: -111 }, "sine.inOut");

  /* scene — « Ton moteur gauche retombe à 35 pour cent. » : the left engine, its fan slowing */
  cut(sAt, null, VIEW.engineL, { lgaSig: 0, track: -1, lock: 1, fs: 700, n1L: 82, n1R: 82, flame: 0.5, burn: 1, gen: 1, goose: 0 });
  const e2 = F(t.droit - 0.12);
  shot(sAt, e2 - sAt, { ...VIEW.engineL, d: 580, az: -42 }, "sine.inOut");
  st(t.p35 - 0.35, 1.2, { n1L: 35, flame: 0.15, burn: 0.35 }, "power2.out");
  D.punch(t.p35, 0.04, { up: 0.08, hold: 0.14, down: 0.4 });

  /* « Le droit, à 15. » : the right engine, mirrored — its fan slowing more */
  cut(e2, null, VIEW.engineR, {});
  const e3 = F(t.pax - 0.15);
  shot(e2, e3 - e2, { ...VIEW.engineR, d: 620, az: -128 }, "sine.inOut");
  st(t.p15 - 0.45, 0.7, { n1R: 15, flame: 0 }, "power2.out"); // (qa: the fan's swirl jumped at 12,85 while slowing — over by 12,7)

  /* « 155 personnes à bord, » : the cabin from above, full; « New York sous toi. » : pulled back, the city under it */
  cut(e3, null, VIEW.cabin, { lock: 0, pax: 1, cabin: 0.6 });
  const e4 = F(t.ny - 0.12);
  shot(e3, e4 - e3, { ...VIEW.cabin, d: 2300 }, "sine.out");
  cut(e4, null, VIEW.city, {});
  const e5 = F(t.et - 0.12);
  shot(e4, e5 - e4, { ...VIEW.city, d: 9800 }, "sine.out");

  /* « Et ce qui vient d'entrer… est dans tes moteurs. » : the dive onto the left engine — something at the fan */
  cut(e5, null, { ...VIEW.engine, d: 820 }, { lock: 1, pax: 0, cabin: 0.35, fs: 600, ...AFTER, goose: 0 });
  const land = t.ouvre - 0.2;
  shot(e5, land - e5, VIEW.engine, "sine.inOut", 820);
  st(t.entrer - 0.2, 1.0, { shell: 0.45 }, "sine.inOut");
  st(t.entrer + 0.1, t.moteurs - t.entrer, { goose: 0.5 }, "sine.inOut"); // the goose arrives at the fan on « moteurs »
  now(t.ouvre - 0.05, {});
}
