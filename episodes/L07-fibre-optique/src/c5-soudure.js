// c5 — « La soudure : deux fils de verre » · « Une fibre pour trente-deux foyers » — from HAND.c45 to HAND.c56 (the card « Étape 12 · Chez toi »).
// STAND-IN by the architect. The plan: docs/L07-actes.md · c5-soudure.js.
import { SET, ITEM, AT, VIEW, seam } from "./world.js";

export default function ({ D }) {
  seam(D, "c45", "in", { set: SET.BANC, state: { ...AT.banc(ITEM.SPLICE), etape: 10 } });
  D.st(D.at("soudeuse"), 4, { align: 1 });
  D.st(D.at("arc"), 0.4, { arc: 1, fused: 1 });
  D.st(D.at("arc") + 0.4, 0.4, { arc: 0 });
  D.cut(D.at("coupleur"), SET.BANC, VIEW.coupler, { ...AT.banc(ITEM.COUPLER), etape: 11, pulse: 1, split: 0 });
  D.st(D.at("coupleur"), 6, { split: 1 });
  D.cut(D.at("tous"), SET.TERRE, VIEW.homes, { ...AT.terre, etape: 11, homes: 1 });
  seam(D, "c56", "out");
}
