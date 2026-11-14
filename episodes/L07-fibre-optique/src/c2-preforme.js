// c2 — « Étape 1 : un verre né d'une flamme » · « Étape 2 : couche après couche » · « Étape 3 : du blanc au transparent »
// — from HAND.c12 to HAND.c23 (the card « Étape 04 », after the midroll of seuil).
// STAND-IN by the architect. The plan: docs/L07-actes.md · c2-preforme.js.
import { SET, AT, VIEW, seam } from "./world.js";

export default function ({ D }) {
  seam(D, "c12", "in", { set: SET.USINE, state: { ...AT.usine, etape: 1, boil: 1, vapour: 1 } });
  D.cut(D.at("preforme"), SET.USINE, VIEW.lathe, { ...AT.usine, etape: 2, flame: 1, soot: 1, spin: 1, deposit: 0.2 });
  D.st(D.at("preforme"), 40, { deposit: 1 }, "none");
  D.cut(D.at("frittage"), SET.USINE, VIEW.sinter, { ...AT.usine, etape: 3, sink: 0, sinter: 0 });
  D.st(D.at("frittage"), 20, { sink: 1, sinter: 1 });
  seam(D, "c23", "out");
}
