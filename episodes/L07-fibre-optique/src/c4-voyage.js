// c4 — « Du fil au câble » · « Au fond de l'océan » · « De la plage à ta rue » — from HAND.c34 to HAND.c45 (the card « Étape 10 · La soudure »).
// STAND-IN by the architect. The plan: docs/L07-actes.md · c4-voyage.js.
import { SET, ITEM, AT, VIEW, seam } from "./world.js";

export default function ({ D }) {
  seam(D, "c34", "in", { set: SET.BANC, state: { ...AT.banc(ITEM.MULTI), etape: 7, assemble: 0 } });
  D.st(D.at("cable"), 8, { assemble: 3 });
  D.cut(D.at("mer"), SET.BANC, VIEW.subsea, { ...AT.banc(ITEM.SUBSEA), etape: 8, layers: 0 });
  D.st(D.at("mer"), 10, { layers: 4 });
  D.cut(D.at("navire"), SET.MER, VIEW.shipStern, { ...AT.mer, etape: 8, sail: 0.5 });
  D.cut(D.at("plage"), SET.TERRE, VIEW.beach, { ...AT.terre, etape: 9, beach: 1 });
  D.cut(D.at("souffle"), SET.TERRE, VIEW.pit, { ...AT.terre, etape: 9, ducts: 1, blow: 0 });
  D.st(D.at("souffle"), 12, { blow: 1, crushed: 1 });
  seam(D, "c45", "out");
}
