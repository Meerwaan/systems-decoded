// The chapters, in order. Each file stages one GROUP of chapters: `export default function ({ D, world, co }) {…}`.
// Each owns the time `span(D, "cN")` — from the seam it starts on to the seam it ends on (world.js · HAND, SEAMS) — and
// starts with its half of that seam: a cut to a COMPLETE state (c1 starts from FIRST and POSE0, without a cut). They
// are staged at the same time, by different hands, and do not depend on each other. The plan: docs/L02-actes.md.
import c1 from "./c1-ouverture.js";
import c2 from "./c2-terre-disjoncteur.js";
import c3 from "./c3-gaz-helico.js";
import c4 from "./c4-separer-verifier.js";
import c5 from "./c5-terre-incident.js";
import c6 from "./c6-retenir-fin.js";

export default [c1, c2, c3, c4, c5, c6];
