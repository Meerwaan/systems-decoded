// The chapters, in order. Each file stages one group of chapters: `export default function ({ D, world, co }) {…}`.
// Each owns the time from its first card in to the next one's (world.js · span) and starts with a cut to a complete
// state (c1 starts from FIRST and POSE0): they are staged at the same time, by different hands, and do not depend on
// each other. The plan, sentence by sentence: docs/L01-actes.md.
import c1 from "./c1-ouverture.js";
import c2 from "./c2-four-etain.js";
import c3 from "./c3-plat-bombage.js";
import c4 from "./c4-salle-autoclave.js";
import c5 from "./c5-route-trempe.js";
import c6 from "./c6-test.js";
import c7 from "./c7-fin.js";

export default [c1, c2, c3, c4, c5, c6, c7];
