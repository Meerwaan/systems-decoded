// (02 · L'HUDSON) — test : « Trente mètres » → « Et il flotte. », played WHOLE (the L05's c4, re-framed 9:16; no black,
// no cliff: the long keeps the why). The header's clock runs at the true speed from 15:30:36 and the countdown reaches
// 0:00 on the impact, in the breath after « fleuve » (world.js · PROMO_CLOCK; the boom: episode.json, splash + 0.45).
//   « Trente mètres. »             from ahead, low over the river: the plane coming down, Manhattan on the right
//   « Il tire sur le manche. »     the captain's sidestick, pulled (0.4)
//   « Quinze mètres : il tire plus fort. »  level with the water, the plane over its reflection, the nose a little up
//   « 230 kilomètres-heure… l'avion frappe le fleuve. »  the whole plane over its reflection: it touches, the spray
//   « Et il flotte. »              it slides, slows, rests
// NEVER here: the angle-of-attack limit (`limit`, `aoa`) — it is the long's why.
import { VIEW } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame

export default function acte3({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    test: "test", il: "test:il", quinze: "test:quinze", fort: "test:fort", vitesse: "test:230", fleuve: "test:fleuve",
    flotte: "test:flotte", comment: "comment",
  });
  const hit = t.fleuve + 0.39; // the impact: the clock reaches 15:30:43 here (world.js), the boom follows by a frame

  /* « Trente mètres. » */
  const tAt = F(t.test - 0.12);
  cut(tAt, null, VIEW.toWater, { lock: 0, track: -1, riverLit: 0.5, pitch: 0, fs: 2000 });
  const sAt = F(t.il - 0.12);
  shot(tAt, sAt - tAt, { ...VIEW.toWater, d: 4300, az: -110 }, "sine.inOut");

  /* « Il tire sur le manche. » */
  cut(sAt, null, { ...VIEW.stick, d: 124 }, { lock: 1, pf: 1, stick: 0, fs: 150 });
  st(sAt + 0.3, 0.6, { stick: 0.4 }, "sine.inOut");
  const qAt = F(t.quinze - 0.12);
  shot(sAt, qAt - sAt, VIEW.stick, "sine.inOut", 124);

  /* « Quinze mètres : il tire plus fort. » */
  cut(qAt, null, VIEW.low, { lock: 0, fs: 2000 });
  st(t.fort - 0.05, 0.3, { stick: 0.8 }, "power2.out");
  st(t.fort - 0.05, 1.1, { pitch: 2 }, "sine.inOut");
  const vAt = F(t.vitesse - 0.12);
  shot(qAt, vAt - qAt, { ...VIEW.low, d: 4100, az: -2 }, "sine.inOut");

  /* « 230 kilomètres-heure… l'avion frappe le fleuve. Et il flotte. » */
  cut(vAt, null, VIEW.splash, { riverLit: 0.3, cold: 0.6 });
  st(hit - 0.9, 0.9, { pitch: 0 }, "sine.inOut");
  st(hit - 0.04, 2.8, { spray: 1 }, "none"); //   the sheets of water rise and fall
  st(hit - 0.02, 0.45, { damage: 1 }, "power2.out"); // the aft belly takes the blow
  D.punch(hit + 0.03, 0.06);
  now(hit + 0.05, { track: 1843 }); //            from here the plane leaves the clock: it slides on the river
  st(hit + 0.1, F(t.comment - 0.12) - hit - 0.1, { track: 1851 }, "power2.out"); // « et il flotte » : it slides, slows, rests
  const cAt = F(t.comment - 0.12);
  shot(vAt, hit - vAt, { ...VIEW.splash, d: 6000, az: -56 }, "sine.inOut");
  shot(hit, cAt - hit, { ...VIEW.splash, d: 6700, az: -64, el: 9 }, "sine.out");
  now(t.flotte + 0.6, { countOn: 0 }); // the countdown has said 0:00
}
