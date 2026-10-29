// 01 · MENACE — accroche → scene (0 → 19,4 s), ON THE DECK at dawn (FIRST: the L04's first frame — your Rafale on the
// bow catapult at full power, the holdback taut, your dog ahead).
//   A  POSE0: behind the tail, in its axis — the two cores white-hot, the signal horizon; a push from frame 1
//   B  « Une pièce le retient » — the calibrated piece, taut; « casse » → the whole stroke, a head of light to the bow
//   C  « le chien jaune » — your dog, his vest lit on « jaune »; the thread opens
//   scene: the cores (« hurlent »), the whole aircraft (« tremble »), the dog's hands (« que des gestes »), and down
//   under your wheels to the two cylinders (« sous tes roues »)
import { setAct } from "@kit/overlay.js";
import { glide } from "@kit/direct.js";
import { POSE0, VIEW, L04_AT, NG, NECK, DOG } from "./world.js";

const F = (t) => Math.round(t * 30) / 30; // a cut on a frame

export default function acte1({ D }) {
  const { st, now, shot, cut } = D;
  const t = D.times({
    pas: "accroche:pas", promesse: "promesse", casse: "promesse:casse", heure: "promesse:240", metres: "promesse:mètres",
    curiosite: "curiosite", jaune: "curiosite:jaune", pourquoi: "curiosite:pourquoi",
    scene: "scene", tremble: "scene:tremble", tout: "scene:tout", chien: "scene:chien", gestes: "scene:gestes", et: "scene:briser", roues: "scene:roues",
    ouvre: "ouvre",
  });
  // act 1 lit on the very first frame (a zero-length tween at 0 is not drawn by a seek to 0: the loop's last frame had it, the first not)
  document.querySelectorAll(".hud__acts span").forEach((span, i) => {
    span.style.opacity = i === 0 ? "1" : "0.4";
    span.style.color = i === 0 ? "#e9e4d8" : "rgba(233, 228, 216, 0.62)";
  });
  setAct(D.tl, 1, 0);
  now(0, { l04: L04_AT.accroche });

  /* A — moving from frame 1: a push in the tail's axis, between the two cores */
  const bAt = F(t.promesse - 0.1);
  // a rush onto the two cores — a zoom from the same place (closer, the camera would enter the tail), then it settles
  shot(0, 0.9, { ...POSE0, d: 1400, fov: 31, el: 7 }, glide(3, 0.2), POSE0.d);
  shot(0.9, bAt - 0.9, { ...POSE0, d: 1380, fov: 30, el: 7 }, "sine.out", 1400);
  D.punch(t.pas, 0.04, { up: 0.12, hold: 0.2, down: 0.5 });

  /* B — the piece that holds you; « casse » → the whole stroke, the head of light to the bow */
  cut(bAt, null, VIEW.bar, { named: 5, fx: NECK[0], fy: 60, fz: NECK[2], fs: 500 });
  now(t.promesse, { l04: L04_AT.promesse });
  const strokeAt = F(t.casse + 0.25);
  shot(bAt, strokeAt - bAt, { ...VIEW.bar, d: 190, az: -66, el: 10 });
  D.punch(t.casse, 0.05);
  cut(strokeAt, null, VIEW.stroke, { named: 0, fx: NG[0], fy: 150, fz: NG[2] - 3000, fs: 4500 });
  shot(strokeAt, F(t.curiosite - 0.1) - strokeAt, { ...VIEW.stroke, d: 1700, el: 17 }, "sine.inOut", VIEW.stroke.d);
  st(t.heure - 0.2, t.metres + 0.4 - t.heure, { trace: 1 }, "sine.in"); // « 240 à l'heure, en 75 mètres » : the head runs to the bow

  /* C — your yellow dog: « pourquoi chien ? » (the thread opens: D.threads in acte3) */
  const cAt = F(t.curiosite - 0.1);
  cut(cAt, null, VIEW.dog, { trace: 0, traceOut: 0, sig: 2, fx: DOG[0], fy: 120, fz: DOG[2], fs: 700 });
  now(t.curiosite, { l04: L04_AT.curiosite });
  shot(cAt, F(t.scene - 0.1) - cAt, { ...VIEW.dog, d: 430, az: -32 });
  now(t.curiosite + 0.5, { sig: 3 });
  st(t.jaune, 0.35, { vest: 1 }, "sine.out");
  st(t.pourquoi + 0.4, 0.8, { vest: 0.5 }, "sine.inOut");

  /* scene — « Tes moteurs hurlent » : the cores, close behind the tail */
  const sAt = F(t.scene - 0.1);
  cut(sAt, null, VIEW.hurl, { vest: 0.35, gas: 1, tremble: 1, fx: NG[0], fy: 150, fz: NG[2] + 900, fs: 1200 });
  now(t.scene, { l04: L04_AT.tremble });
  const tremAt = F(t.tout - 0.12); // in the breath after « hurlent »
  shot(sAt, tremAt - sAt, { ...VIEW.hurl, d: 1120, az: 14 });
  // « Tout ton avion tremble » : the whole aircraft, in profile, shivering
  cut(tremAt, null, VIEW.nose, { named: 5, fx: NG[0], fy: 60, fz: NG[2], fs: 600 });
  D.punch(t.tremble, 0.05);
  const dogAt = F(t.chien - 0.12);
  shot(tremAt, dogAt - tremAt, { ...VIEW.nose, d: 440, az: -146 });
  now(dogAt, { named: 0 });
  // « Ton chien jaune ne dit pas un mot : que des gestes » : from his front, his hands
  cut(dogAt, null, VIEW.dogFront, { sig: 1, vest: 0.6, fx: DOG[0], fy: 150, fz: DOG[2], fs: 600 });
  now(t.chien, { l04: L04_AT.gestes });
  now(t.gestes - 0.3, { sig: 2 });
  now(t.gestes + 0.4, { sig: 3 });
  const barAt = F(t.et - 0.5);
  shot(dogAt, barAt - dogAt, { ...VIEW.dogFront, d: 330, az: 26, el: 9 });
  // « Et ce qui va briser ta pièce… se cache sous tes roues » : the piece, then down through the deck to the cylinders
  cut(barAt, null, VIEW.troughMid, { vest: 0.35, sig: 3, named: 5, fx: NECK[0], fy: 60, fz: NECK[2], fs: 600 });
  now(barAt, { l04: L04_AT.dessous });
  shot(barAt, t.roues + 0.05 - barAt, { ...VIEW.cyl, d: 1000 }, "sine.inOut", VIEW.troughMid.d); // down through the glass deck: the cylinders under your wheels
  st(t.et, 1.5, { under: 1, jet: 0, press: 0.55 }, "sine.inOut");
  now(t.et + 0.8, { named: 0 });
  st(t.et, 1.6, { fx: -200, fy: -95, fz: -6500, fs: 2500 }, "sine.inOut");
}
