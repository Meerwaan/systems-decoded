// c6 — « Chez toi : les derniers mètres » · « Le geste qui éteint ta fibre » · the CTA · the loop — from HAND.c56 to the end.
// STAND-IN by the architect. The plan: docs/L07-actes.md · c6-chez-toi.js.
import { SET, ITEM, AT, VIEW, POSE0, FIRST, seam } from "./world.js";

export default function ({ D }) {
  seam(D, "c56", "in", { set: SET.TERRE, state: { ...AT.terre, etape: 12, homes: 1, landing: 1 } });
  D.cut(D.at("vert"), SET.BANC, VIEW.plug, { ...AT.banc(ITEM.PLUG), etape: 12, plug: 0 });
  D.st(D.at("vert"), 3, { plug: 1 });
  D.cut(D.at("du"), SET.BANC, VIEW.bendWide, { ...AT.banc(ITEM.PRINCIPE), etape: 12, ray: 0, bend: 1 });
  D.st(D.at("du2"), 6, { ray: 1, steep: 1, leak: 1 });
  // the loop: back on the first frame (FIRST + POSE0)
  D.cut(D.at("toloop"), null, POSE0, { ...FIRST });
}
