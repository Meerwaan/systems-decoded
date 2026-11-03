// 03 · RENDEZ-VOUS — comment → boucle.
//   comment  the maquette of New York (the L05's carte.js): the plane's glyph where the geese hit it, its track behind;
//            « demi-tour vers l'aéroport » draws LaGuardia's option (opt 1) — never refused, never the simulator passes:
//            the film never answers. #duel « Oui » / « Non », each lit on its word
//   youtube  the miniature's plane, the geese streaming in: the long's name in the top slot (filmTitle), the account's name
//            lights up on « chaîne » (D.verdict), the header says where the answer is (`yt`)
//   boucle   « Et là-haut, tes deux moteurs… » — back under the left intake, gliding to POSE0 / FIRST
import { setAct } from "@kit/overlay.js";
import { duelCall, filmTitle } from "@kit/blocks.js";
import { SET, AT, VIEW, FIRST, POSE0 } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame
const STRIKE = { n1L: 82, n1R: 82, flame: 0.5, burn: 1, goose: 1, gen: 1, geese: 1 }; // the instant of the first frame

export default function fin({ D }) {
  const { tl, st, now, shot, cut } = D;
  const t = D.times({
    comment: "comment", demi: "comment:demi-tour", oui: "comment:oui", non: "comment:non", commentaire: "comment:commentaire",
    youtube: "youtube", verdict: "verdict", toloop: "toloop", rewind: "rewind",
  });
  const cAt = F(t.comment - 0.12);
  setAct(tl, 3, cAt);

  /* comment — the maquette, the glyph where the geese hit; LaGuardia offered on « demi-tour » */
  cut(cAt, SET.CARTE, VIEW.map, { ...AT.carte, track: 1631, route: -1, glyph: 1, opt: 0, optNo: 0, riverLit: 0, clockOn: 0, countOn: 0, lgaSig: 0 }, { fade: 0.15 });
  const yAt = F(t.youtube - 0.12);
  shot(cAt, yAt - cAt, { ...VIEW.map, d: 980, az: 6 }, "sine.inOut");
  now(t.demi, { opt: 1 });
  duelCall(tl, { from: t.comment + 0.1, aAt: t.oui, bAt: t.non, to: yAt - 0.3, word: t.commentaire });

  /* youtube — the miniature's plane, at the strike; the long's name over it */
  cut(yAt, SET.VOL, VIEW.thumb, { ...AT.vol, ...STRIKE, lock: 0, track: 1631, opt: 0, clockOn: 1, countOn: 1, yt: 1, fs: 2000 }, { fade: 0.15 });
  shot(yAt, t.toloop - yAt, { ...VIEW.thumb, d: 1850, az: -36 }, "sine.inOut");
  filmTitle(tl, { showAt: t.youtube + 0.2, hideAt: t.toloop - 0.35 });
  D.verdict(t.verdict);

  /* the loop: back under the left intake; between rewind and the end everything glides to FIRST */
  const back = { ...POSE0, d: 1650, el: -12 };
  cut(t.toloop, SET.VOL, back, { ...FIRST });
  D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: back.d });
  void st;
}
