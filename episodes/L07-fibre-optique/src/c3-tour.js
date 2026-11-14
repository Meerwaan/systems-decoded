// c3 — « Étape 4 : la tour de fibrage » · « Étape 5 : une armure, en plein vol » · « Le test : on tire sur chaque mètre »
// — from HAND.c23 to HAND.c34 (the card « Étape 07 · Le câble »).
// STAND-IN by the architect. The plan: docs/L07-actes.md · c3-tour.js.
import { SET, AT, VIEW, seam } from "./world.js";

export default function ({ D }) {
  seam(D, "c23", "in", { set: SET.USINE, state: { ...AT.usine, etape: 4, heat: 1, tempOn: 1, temp: 1900 } });
  D.cut(D.at("goutte"), SET.USINE, VIEW.drop, { ...AT.usine, etape: 4, heat: 1, drop: 0 });
  D.st(D.at("goutte"), 6, { drop: 1, draw: 1 });
  D.cut(D.at("armure2"), SET.USINE, VIEW.coatCups, { ...AT.usine, etape: 5, heat: 1, draw: 1, coat: 2, uv: 1 });
  D.cut(D.at("test"), SET.USINE, VIEW.proof, { ...AT.usine, etape: 6, draw: 0, coat: 2, wind: 1, tension: 1 });
  seam(D, "c34", "out");
}
