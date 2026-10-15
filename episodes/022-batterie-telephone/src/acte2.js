// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tobench → tozero).
//
// Act 1 ends on the bench, the phone whole at VIEW.whole, BENCHED: the cut on "on" says the whole state and is not
// seen. On "on" it comes apart — the back lifts, the battery rises out of the body — and the camera pulls back with
// it. On "feuilles" the battery opens on its layers: the tongue unrolls and the camera follows it out; the three
// names are said on the tongue, in ONE frame — what lights up says which word it is: the copper, the aluminium, both
// for "entre les deux", then the film between them, and the frame closes on it. "Enroulé" is the tongue rolling back
// into its pouch (the gesture says it), the camera diving with it onto the pouch's flank, where the turns glow on
// "couches". It slides along the pouch to the board at its end ("un petit circuit"), then pulls back to the pouch
// and its board: the level column for "trop chargée, trop vidée", the heat for "trop chaude" — the board pulses each
// time it sees one — and on "il coupe" the switch's blade lifts, veille, the header says « Coupée »: the frame holds,
// before and after. The thermometer runs through it (never held: no threshold is given to the circuit).
// Cut to the scale of the pores: the film between its two electrodes, at rest; the lithium goes down through it on
// "laisse passer", the frame closes on the pores; "Et il attend." holds. The threshold does not stop the film: the
// camera already glides toward the hot point; the hair of the hook comes back on "cheveu", and on "regarde" an
// ember is born under the film, the mood turns signal. Act 3 cuts from there.
import { setAct } from "@kit/overlay.js";
import { followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, PORED, MICRO, TEMP } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [MX, MY, MZ] = MICRO.at;

/* ── on the bench (poses seen by the builders: docs/journal/022-model.md, 022-pores.md) ── */
// the exploded view: a fan — the body, the battery risen out of it, the back
const EXPLODED = { ...P, tx: 0, ty: 4.4, tz: 0, d: 84, az: -38, el: 20, shift: 190 };
// the tongue unrolled: its three sheets fanned, side by side in one frame (copper · film · aluminium)
const TONGUE_V = { ...P, tx: 10.5, ty: 4.2, tz: 0.6, d: 62, az: -22, el: 27, shift: 110 };
// …and closer, on the film between them
const FILM_V = { ...P, tx: 10.5, ty: 4.1, tz: 0.6, d: 50, az: -22, el: 28, shift: 100 };
// the pouch's flank, its turns
const ROLL = { ...P, tx: 2.6, ty: 3.9, tz: 2.5, d: 15, az: -12, el: 5, shift: 90 };
// the board at its end
const BOARD_V = { ...P, tx: -4.5, ty: 4.7, tz: 0.6, d: 22, az: -40, el: 20, shift: 100 };
// the board and the near end of the pouch, for « il coupe »: the switch's blade, before and after (the level
// column runs on the pouch from this end; the charger's dashes reach the board here and stop)
const BATTERY = { ...P, tx: -2.5, ty: 4.6, tz: 0.6, d: 36, az: -26, el: 36, shift: 120 };
const BATTERY_IN = { ...BATTERY, d: 33 };

/* ── at the scale of the pores ── */
// at rest: the film whole between its two electrodes · the film close, its pores
const PORES_REST = { ...P, tx: MX, ty: MY, tz: MZ, d: 86, az: -36, el: 24, shift: 185 };
const FILM_NEAR = { ...P, tx: MX + 1, ty: MY, tz: MZ + 1.6, d: 72, az: -32, el: 32, shift: 120 };
// where the threshold's glide ends: toward the hot point, under the film
const TO_HOT = { ...P, tx: MX + MICRO.hot[0], ty: MY, tz: MZ + MICRO.hot[1], d: 56, az: -29, el: 34, shift: 70 };

/* ── the light: what it stands around, and how wide ── */
const L_EXPL = { fx: 0, fy: 4.6, fz: 0, fs: 13 };
const L_TONGUE = { fx: 3, fy: 4.6, fz: 0, fs: 16 };
const L_ROLL = { fx: 2, fy: 4, fz: 2, fs: 9 };
const L_BOARD = { fx: -4.5, fy: 4.7, fz: 0, fs: 8 };
const L_CUT = { fx: -2.5, fy: 4.6, fz: 0.4, fs: 11 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.anchors;
  const t = D.times({
    ouvre: "ouvre", tobench: "tobench", explode: "explode",
    sheets: "sheets", coated: "coated", copper: "copper", alu: "alu",
    between: "between", thefilm: "thefilm", separator: "separator",
    rolled: "rolled", stacked: "stacked", layers: "layers", tip: "tip", board: "board",
    torepos: "torepos", watch: "watch", over: "over", empty: "empty", hot: "hot", cuts: "cuts",
    topores: "topores", passes: "passes", lithium: "lithium", holes: "holes", waits: "waits",
    toseuil: "toseuil", seuil: "seuil", hair2: "hair2", look: "look", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.ouvre);

  /* ───────────── "…on l'ouvre." — the same picture as act 1's last: the back lifts, the battery rises out ───────────── */
  cut(t.tobench, SET.BENCH, VIEW.whole, BENCHED);
  st(t.explode, t.sheets - 0.15 - t.explode, { explode: 1 }, "sine.inOut");
  shot(t.tobench + 0.03, t.sheets - 0.1 - (t.tobench + 0.03), EXPLODED, "sine.inOut", VIEW.whole.d);
  st(t.tobench + 0.03, t.sheets - 0.1 - (t.tobench + 0.03), L_EXPL, "sine.inOut");

  /* ───────────── "Deux feuilles de métal, enduites :" — the tongue unrolls, the camera follows it out ───────────── */
  st(t.sheets, t.copper - 0.2 - t.sheets, { unroll: 1 }, "sine.inOut");
  shot(t.sheets - 0.05, t.copper - 0.1 - (t.sheets - 0.05), TONGUE_V, "sine.inOut", EXPLODED.d);
  st(t.sheets - 0.05, t.copper - 0.1 - (t.sheets - 0.05), L_TONGUE, "sine.inOut");

  /* ───────────── "cuivre, aluminium." — the same frame: what lights up says which word ───────────── */
  // (one legend at a time, at the same place: the leader swings from one sheet to the other; the two words are
  // half a second apart, so each one's dot and leader come first and its words land on the word said)
  st(t.copper - 0.05, 0.2, { litCopper: 1 }, "sine.out");
  const cCopper = co.add({ title: "Cuivre · enduit", x: 480, y: 560, align: "end", tone: "system", anchor: A.copper });
  cCopper.show(tl, t.copper - 0.22);
  cCopper.hide(tl, t.alu - 0.06);
  st(t.alu - 0.1, 0.2, { litCopper: 0 }, "sine.inOut");
  st(t.alu - 0.05, 0.2, { litAlu: 1 }, "sine.out");
  const cAlu = co.add({ title: "Aluminium · enduit", x: 480, y: 560, align: "end", tone: "system", anchor: A.alu });
  cAlu.show(tl, t.alu - 0.06);
  cAlu.hide(tl, t.between - 0.1);

  /* ───────────── "Entre les deux… le film : le séparateur." — the two, then what is between them ───────────── */
  st(t.between, 0.3, { litCopper: 0.55, litAlu: 0.55 }, "sine.inOut");
  st(t.thefilm - 0.15, 0.3, { litCopper: 0, litAlu: 0 }, "sine.inOut");
  st(t.thefilm - 0.05, 0.3, { litFilm: 1 }, "sine.out");
  shot(t.thefilm - 0.1, t.rolled - 0.25 - (t.thefilm - 0.1), FILM_V, "sine.inOut", TONGUE_V.d);
  const cFilm = co.add({ title: "Le séparateur", x: 480, y: 560, align: "end", tone: "system", anchor: A.film });
  cFilm.show(tl, t.separator - 0.12);
  cFilm.hide(tl, t.rolled - 0.2);

  /* ───────────── "Le tout, enroulé ou empilé, en couches serrées." — it rolls back into its pouch; the turns ───────────── */
  st(t.rolled - 0.1, 0.3, { litFilm: 0 }, "sine.inOut");
  st(t.rolled - 0.05, t.layers - 0.15 - (t.rolled - 0.05), { unroll: 0 }, "sine.inOut");
  // (the pouch stays glass while the tongue goes home: the turns take over before it closes)
  st(t.stacked, t.layers - t.stacked, { litRoll: 0.45 }, "sine.inOut");
  st(t.layers - 0.08, 0.35, { litRoll: 1 }, "sine.out");
  shot(t.rolled, t.layers + 0.05 - t.rolled, ROLL, "sine.inOut", FILM_V.d);
  st(t.rolled, t.layers + 0.05 - t.rolled, L_ROLL, "sine.inOut");

  /* ───────────── "Et au bout, un petit circuit." — along the pouch to the board ───────────── */
  st(t.tip, 0.4, { litRoll: 0 }, "sine.inOut");
  shot(t.tip - 0.05, t.board + 0.1 - (t.tip - 0.05), BOARD_V, "sine.inOut");
  st(t.tip - 0.05, t.board + 0.1 - (t.tip - 0.05), L_BOARD, "sine.inOut");
  st(t.board - 0.05, 0.3, { litBoard: 1 }, "sine.out");
  const cBoard = co.add({ title: "Circuit de protection", x: 480, y: 560, align: "end", tone: "system", anchor: A.board });
  cBoard.show(tl, t.board - 0.1);
  cBoard.hide(tl, t.torepos - 0.22);

  /* ───────────── "Le circuit surveille tout : trop chargée, trop vidée, trop chaude… il coupe." ───────────── */
  // The pouch and its board in one frame, held (closing in slowly) from "surveille" to the cut: the level column on
  // the pouch says each case, the board pulses when it sees one; on "coupe" the blade lifts — before and after.
  shot(t.torepos - 0.05, t.watch + 0.15 - (t.torepos - 0.05), BATTERY, "sine.inOut", BOARD_V.d);
  st(t.torepos - 0.05, t.watch + 0.15 - (t.torepos - 0.05), L_CUT, "sine.inOut");
  shot(t.watch + 0.15, t.topores - 0.04 - (t.watch + 0.15), BATTERY_IN, "sine.inOut");
  st(t.torepos, 0.4, { litBoard: 0.35 }, "sine.inOut");
  st(t.watch - 0.05, 0.45, { levelSeen: 1 }, "sine.out");
  const pulse = (at) => {
    st(at, 0.12, { litBoard: 1 }, "power2.out");
    st(at + 0.2, 0.35, { litBoard: 0.35 }, "sine.inOut");
  };
  // trop chargée: the column fills to its top (its last tenth turns signal)
  st(t.over - 0.08, 0.35, { level: 1 }, "sine.inOut");
  pulse(t.over + 0.2);
  chip("chip-trop1", null, 96, 470, t.over - 0.05, t.empty - 0.14);
  // trop vidée: it drains to nothing
  st(t.empty - 0.08, 0.4, { level: 0.03 }, "sine.inOut");
  pulse(t.empty + 0.22);
  chip("chip-trop2", null, 96, 470, t.empty - 0.02, t.hot - 0.14);
  // trop chaude: back to its level, and the heat comes up in the pouch; the thermometer runs (never held)
  st(t.hot - 0.08, 0.35, { level: 0.6 }, "sine.inOut");
  st(t.hot - 0.05, 0.6, { heat: 1 }, "sine.inOut");
  const peak = t.cuts + 0.25;
  st(t.hot - 0.05, peak - (t.hot - 0.05), { temp: 42 }, "none");
  st(peak, t.topores - 0.02 - peak, { temp: 36 }, "none");
  pulse(t.hot + 0.25);
  chip("chip-trop3", null, 96, 470, t.hot - 0.02, t.topores - 0.16);
  // il coupe: the blade lifts, veille; the header says « Coupée »; the frame holds
  st(t.cuts + 0.02, 0.14, { charge: 0, litBoard: 1 }, "power2.out");
  st(t.cuts + 0.3, t.topores - 0.02 - (t.cuts + 0.3), { heat: 0.6 }, "sine.inOut");

  /* ───────────── "Le film, lui, laisse passer le lithium par des pores invisibles." — the scale of the pores ───────────── */
  cut(t.topores, SET.BENCH, PORES_REST, { ...BENCHED, ...PORED, ions: 0 });
  st(t.topores + 0.12, 0.35, { litFilm: 1 }, "sine.out");
  st(t.passes - 0.05, 0.7, { ions: 1 }, "sine.inOut");
  shot(t.holes - 0.1, t.waits - 0.2 - (t.holes - 0.1), FILM_NEAR, "sine.inOut", PORES_REST.d);
  chip("chip-pores", null, 96, 470, t.holes - 0.02, t.toseuil - 0.15);

  /* ───────────── "Et il attend." — the frame holds: the quiet stream, the film still ───────────── */
  st(t.waits - 0.05, 0.6, { litFilm: 0.3 }, "sine.inOut");

  /* ───────────── the threshold — "Abonne-toi : ce film plus fin qu'un cheveu… regarde." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: the camera already glides
  // toward the hot point; the hair of the hook comes back on "cheveu" (with its label, briefly); on "regarde" an
  // ember is born under the film and the mood turns signal; the thermometer starts to run.
  shot(t.toseuil, t.tozero - 0.04 - t.toseuil, TO_HOT, "sine.inOut", FILM_NEAR.d);
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  st(t.hair2 - 0.1, 0.3, { hair: 1 }, "sine.out");
  chip("chip-cheveu", null, 96, 470, t.hair2 - 0.02, t.look + 0.3);
  st(t.look + 0.3, Math.max(0.15, t.tozero - 0.12 - (t.look + 0.3)), { hair: 0 }, "sine.inOut");
  st(t.look - 0.05, 0.5, { spot: 0.2 }, "sine.out");
  st(t.look, 0.25, { mood: 1 }, "sine.inOut");
  st(t.look, t.tozero - t.look, { temp: TEMP.rest + 6 }, "none");
}
