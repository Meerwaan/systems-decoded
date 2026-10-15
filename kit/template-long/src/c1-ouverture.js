// c1 — a placeholder: it shows the header's line moving, so a fresh long builds and plays. The architect replaces the
// chapter files (one per group of chapters, each starting with a cut to a complete state: docs/recette-long.md).
export default function ({ D }) {
  const { now, st, shot } = D;
  now(D.at("etape1"), { step: 1, tempOn: 1, temp: 1500 });
  st(D.at("etape2"), 6, { temp: 600 });
  now(D.at("etape2"), { step: 2 });
  shot(0, 12, { az: 20, d: 300 });
}
