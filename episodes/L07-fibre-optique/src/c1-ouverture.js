// c1 — « Ce que tu regardes passe par du verre » · « On l'ouvre » · « Pourquoi la lumière ne s'échappe pas » ·
// « Le verre qui éteignait la lumière » — from 0 to HAND.c12 (the card « Étape 01 », after the midroll of relance1).
// STAND-IN by the architect: the places, the seam. The `chapitre` agent writes the plan of docs/L07-actes.md · c1-ouverture.js.
import { SET, ITEM, AT, VIEW, seam } from "./world.js";

export default function ({ D }) {
  const { cut, now } = D;
  // 0 → the first frame is FIRST + POSE0 (no cut): the stand-in only shows the places the chapter will use
  now(0.01, { set: SET.TERRE, room: 1, pulse: 1 });
  cut(D.at("ouvre:on") - 0.14, SET.BANC, VIEW.cableWide, { ...AT.banc(ITEM.CABLE) });
  D.st(D.at("ouvre:on"), 0.9, { explode: 1 });
  cut(D.at("principe"), SET.BANC, VIEW.principe, { ...AT.banc(ITEM.PRINCIPE), ray: 0 });
  D.st(D.at("principe"), 30, { ray: 1 }, "none");
  cut(D.at("histoire"), SET.BANC, VIEW.hist, { ...AT.banc(ITEM.HIST), dim: 1 });
  seam(D, "c12", "out");
}
