// 02 · L'HUDSON — ouvre → hudson. The left engine opens IN PLACE (the L05's c1), the goose paid against the bird of
// the tests (the L05's c2 and c6, on the bench), the check-list's 300 knots, the choice.
//   ouvre    the engine comes apart along its axis on « on » (explode), the camera backs off to the exploded view
//   eclate   the fan (« soufflante », named 1), a slide along the axis to the core (« cœur », named 3), its fire (« feu »)
//   coeur    close on the core: the goose goes in (« oie », goose 1); « on l'avait testé contre quoi ? » — the engine on its
//            test stand, the gun aimed (fil 2; a breath)
//   certif   the gun fires (the bird into the blades), then the two birds side by side: 1,8 kg against 3,6 (« La moitié. »)
//   relance  the binder (« 300 nœuds »), then the plane gliding (« jamais plus de 214 »)
//   hudson   the cockpit, the captain's hand (« Le commandant, lui, a choisi. »), then down the Hudson, lit veille on its
//            name (the header jumps to 15:29:28: « On va être dans l'Hudson »)
// The clock is held through the autopsy (world.js · PROMO_CLOCK): `track` is given where the plane must move.
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { SET, AT, VIEW } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame
const HIT = { n1L: 35, n1R: 15, burn: 0.35, gen: 0, flame: 0, geese: 0, clockOn: 1, countOn: 1 }; // in flight, after the strike

export default function acte2({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    ouvre: "ouvre", explode: "explode", eclate: "eclate", soufflante: "eclate:soufflante", au: "eclate:au", coeur: "eclate:cœur",
    feu: "eclate:feu", coeurB: "coeur", oie: "coeur:oie", et: "coeur:et", certif: "certif", certification: "certif:certification",
    pesait: "certif:pesait", moitie: "certif:moitié", relance: "relance", ton: "relance:ton", hudson: "hudson", il: "hudson:il",
    nomH: "hudson:l'hudson", test: "test",
  });
  setAct(tl, 2, t.ouvre);

  /* ouvre — « Alors… on l'ouvre. » : the engine comes apart in place, the camera backs off (acte1 landed on VIEW.engine) */
  const land = t.ouvre - 0.2;
  const eAt = F(t.eclate - 0.12);
  st(t.explode, 1.5, { explode: 1 }, "power1.out"); // (qa: heurté 19,6 with 1,3 s power2)
  shot(land, eAt - land, VIEW.exploded, glide(0.8, 1.0));

  /* eclate — « Sous l'aile, une grande soufflante aspire l'air. » : the fan; « Au centre, le cœur… » : along the axis */
  cut(eAt, null, { ...VIEW.fan, d: 760, az: -34, el: 11 }, { shell: 0.45, fs: 600 });
  // (qa 03/11: the slide fan → core passed the spinning compressor — heurté 23,8 and flicker 24,2–24,6: a CUT on « Au »)
  const coreAt = F(t.au - 0.12);
  shot(eAt, coreAt - eAt, VIEW.fan, "sine.inOut", 760);
  const kAt = F(t.coeurB - 0.12);
  cut(coreAt, null, { ...VIEW.core, d: 420, az: -26 }, {});
  shot(coreAt, kAt - coreAt, { ...VIEW.core, d: 310, az: -16 }, "sine.inOut", 420);
  now(t.soufflante, { named: 1 });
  now(t.coeur, { named: 3 });
  st(t.feu - 0.15, 0.6, { burn: 1 }, "sine.out");

  /* coeur — « Dans chacun des deux cœurs, une oie d'environ 3,6 kilos est entrée. » : close on the fire, the goose in */
  cut(kAt, null, { ...VIEW.coreB, d: 300 }, { named: 3 });
  const qAt = F(t.et - 0.12);
  shot(kAt, qAt - kAt, VIEW.coreB, "sine.out", 300);
  st(t.oie - 0.4, 0.9, { goose: 1 }, "sine.inOut");
  D.punch(t.oie + 0.05, 0.04, { up: 0.08, hold: 0.14, down: 0.4 });

  /* « Et ce moteur, on l'avait testé contre quoi ? » : the same engine on its test stand, the gun aimed — then a breath */
  cut(qAt, SET.BENCH, VIEW.stand, { ...AT.stand, gun: 0, aimCore: 0, birdCmp: 0, clockOn: 1, countOn: 1 }, { fade: 0.15 });
  const gAt = F(t.certif - 0.12);
  shot(qAt, gAt - qAt, { ...VIEW.stand, d: 820, az: -54 }, "sine.inOut");

  /* certif — « Le gros oiseau de ses essais de certification… » : the gun fires, the bird into the blades */
  cut(gAt, null, VIEW.gun, { gun: 0 });
  const cmpAt = F(t.pesait - 0.12);
  shot(gAt, cmpAt - gAt, { ...VIEW.gun, d: 600, az: -58, el: 10 }, "sine.inOut");
  st(t.certification + 0.1 - 0.55 * 1.4, 1.4, { gun: 1 }, "none"); // the bird hits the blades on « certification »
  /* « …pesait 1,8 kilo. La moitié. » : the two birds side by side, the engine behind them */
  cut(cmpAt, null, VIEW.cmp, { gun: 0, birdCmp: 1 });
  const rAt = F(t.relance - 0.12);
  shot(cmpAt, rAt - cmpAt, { ...VIEW.cmp, d: 380, az: -34, el: 12 }, "sine.out");
  D.punch(t.moitie, 0.06, { up: 0.08, hold: 0.14, down: 0.32 });

  /* relance — « Pour le rallumer, ta check-list demande 300 nœuds. » : the binder, its second part */
  cut(rAt, null, { ...VIEW.qrh, d: 60, az: -10, el: 56 }, { ...AT.bench, page: 2, named: 0, clockOn: 1, countOn: 1 });
  const pAt = F(t.ton - 0.12);
  shot(rAt, pAt - rAt, { ...VIEW.qrh, d: 52, az: -20, el: 52 }, "sine.out");
  /* « Ton avion n'en atteindra jamais plus de 214. » : the plane gliding, the city sliding under it */
  cut(pAt, SET.VOL, VIEW.glide, { ...AT.hit, ...HIT, lock: 1, track: 1680, fs: 2000 }, { fade: 0.15 });
  const hAt = F(t.hudson - 0.12);
  shot(pAt, hAt - pAt, { ...VIEW.glide, d: 4000, az: 64 }, "sine.inOut");
  st(pAt, hAt - pAt, { track: 1686 }, "none");

  /* hudson — « Le commandant, lui, a choisi. » : behind the plane, it rolls out of its turn, the river ahead (the
     header: 15:29:28); « Il dit au contrôleur : « On va être dans l'Hudson. » » : the river lit veille on its name */
  cut(hAt, null, { ...VIEW.descent, d: 7800 }, { lock: 0, track: -1, bank: -14, fs: 2000 });
  st(hAt + 0.2, t.il - hAt, { bank: 0 }, "sine.inOut");
  const tAt = F(t.test - 0.12);
  shot(hAt, tAt - hAt, { ...VIEW.descent, d: 6600, el: 13 }, "sine.inOut", 7800);
  st(t.nomH - 0.1, 0.7, { riverLit: 1 }, "sine.out");
}
