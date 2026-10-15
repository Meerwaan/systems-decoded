// 01 · MENACE — from the first frame to « Alors… » (0 → tobench). One continuous move from the room into the maquette
// of the pores — the ONE dive of the act — then ONE cut (the ranks of 2016), and the act lands on the bench at
// VIEW.whole, in BENCHED: act 2's cut does not show.
//
// THE HOOK.
//   A  « Ton téléphone charge, sous ton oreiller. Dedans, sa batterie chauffe. » From the first frame the camera
//      closes in on the warm light under the pillow; the heat rises, butts under it and stays. « oreiller » : the
//      pillow is only an outline, the phone under it · « Dedans » : the battery in the glass · « chauffe » : 38, the
//      header turns signal on the word.
//   B  « Son dernier rempart : un film de plastique, plus fin qu'un cheveu. » The dive: on through the battery, into
//      the maquette (the change of scale hides in the dive — world.js fades the room and the phone with `micro`),
//      down onto the face of the film, lit veille on « film » ; then a pull-back that brings the hair in on « cheveu ».
//   C  « Et ton oreiller… travaille contre lui. » The pillow is not drawn at this scale: the hair goes, the camera
//      steps back from the film, alone between its electrodes in the dark, and on « contre » the heat closes in —
//      a signal gel over everything, 41 in the header. (The pillow holding the heat was the first picture.)
// THE SCENE, in the same maquette, without a cut. « deux électrodes » lit one after the other · « presque rien » :
// the film between them · « liquide » · « si elles se touchent » : a move down to the profile — the only view where
// `touch` reads — and the heat calls the heat. The header does not move: it is a hypothesis.
// THE RECALL. A cut to the bench: our phone in front, tepid; « modèle entier » : its twins, row after row; « rappelé » :
// their embers die from the far end toward us; « interdit » : the plane. Then they go, and the camera comes down on
// the one that is left.
import { setAct } from "@kit/overlay.js";
import { SET, BENCHED, VIEW, SIZE, MICRO, inRoom, phoneSpot } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
const [MX, MY, MZ] = MICRO.at;
const [RX, RY, RZ] = phoneSpot(0); // the phone, under the pillow

/* ── the poses ── */
// in the room (room coordinates): under the outline of the pillow, the phone (docs/journal/022-chambre.md)
const UNDER = { ...P, tx: -18, ty: 56, tz: -76, d: 120, az: -50, el: 20, shift: 170 };
// the maquette of the pores, where it stands in the room (docs/journal/022-pores.md): the face of the film, very
// close (where the dive lands) · the film close, the hair in front · the whole maquette, a step back · the whole ·
// the profile, low
const CLOSE = inRoom({ ...P, tx: MX + 1, ty: MY, tz: MZ + 1.6, d: 46, az: -32, el: 32, shift: 70 });
const FILM = inRoom({ ...P, tx: MX + 1, ty: MY, tz: MZ + 1.6, d: 72, az: -32, el: 32, shift: 100 });
const WIDE = inRoom({ ...P, tx: MX, ty: MY, tz: MZ, d: 108, az: -38, el: 24, shift: 185 });
const REPOS = inRoom({ ...P, tx: MX, ty: MY, tz: MZ, d: 86, az: -36, el: 24, shift: 185 });
const TOUCH = inRoom({ ...P, tx: MX + 2.6, ty: MY - 0.3, tz: MZ + 0.5, d: 50, az: -24, el: 9, shift: 100 });
// on the bench: the ranks, a little closer as they come · the phone whole, where act 2 opens it
const RANKS = VIEW.ranks;
const RANKS_IN = { ...RANKS, d: 370 };
const WHOLE = VIEW.whole;

/* ── the light: what it stands around, and how wide ── */
const L_PHONE = { fx: RX + 1, fy: RY + 0.5, fz: RZ, fs: 30 };
const L_MICRO = { fx: RX + MX, fy: RY + MY, fz: RZ + MZ, fs: SIZE };
const L_BENCH = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };

/** An ease that leaves at `s0` times its mean speed and lands at `s1` times it: moves chained without a stop. */
const glide = (s0, s1) => (u) => s0 * u + (3 - 2 * s0 - s1) * u * u + (s0 + s1 - 2) * u * u * u;

export default function acte1({ D }) {
  const { tl, st, now, shot, cut, chip } = D;
  const t = D.times({
    under: "under", inside: "inside", heats: "heats",
    dive: "dive", film: "film", hairy: "hairy", back: "back", against: "against",
    toscene: "toscene", electrodes: "electrodes", nothing: "nothing", fluid: "fluid", contact: "contact", calls: "calls",
    to2016: "to2016", model: "model", recalled: "recalled", banned: "banned", sceneEnd: "scene$", alone: "alone",
    alors: "ouvre",
  });
  setAct(tl, 1, 0);
  const TOP = [96, 470]; // a fixed place in the top slot, for a label while the camera travels

  /* ═════════════ THE HOOK ═════════════ */
  /* ── A · « Ton téléphone charge, sous ton oreiller. Dedans, sa batterie chauffe. » ── */
  // the camera closes in on the light under the pillow from the first frame — fastest at the start
  shot(0, t.dive, UNDER, glide(1.5, 0.5));
  st(0, t.dive, L_PHONE, "sine.inOut");
  st(0, t.under, { trapped: 0.5 }, "sine.out"); // the heat rises, butts under the pillow and stays
  st(t.under - 0.05, 0.6, { cloth: 0.2 }, "sine.inOut"); // « oreiller » : only its outline, the phone under it
  st(t.inside - 0.05, 0.7, { xray: 1 }, "sine.inOut"); // « Dedans » : the battery in the glass
  st(t.heats - 0.05, 0.5, { heat: 1 }, "sine.out"); // « chauffe »
  st(t.heats - 0.1, 0.3, { temp: 38 }, "none"); // …the header turns signal on the word

  /* ── B · « Son dernier rempart : un film de plastique, plus fin qu'un cheveu. » ── */
  // the one dive: on through the battery, into the maquette, down onto the face of the film
  const dive = t.film - 0.12 - t.dive;
  shot(t.dive, dive, CLOSE, "sine.inOut", UNDER.d);
  st(t.dive, dive, L_MICRO, "sine.inOut");
  // the change of scale, inside the dive. It leaves from 0.02, not 0: below ≈ 0.019 world.js already shows the
  // maquette while pores.js does not update it yet (smooth(micro) < 0.001) — one frame of it drawn solid.
  D.tw.fromTo(D.S, { micro: 0.02 }, { micro: 1, duration: 0.35, ease: "sine.inOut", immediateRender: false }, t.dive + 0.58 * dive);
  st(t.film - 0.05, 0.45, { litFilm: 1 }, "sine.out"); // « film »
  chip("chip-film", null, ...TOP, t.film + 0.05, t.hairy - 0.15);
  // « plus fin qu'un cheveu » : a step back, and the hair lies across the front of the maquette
  shot(t.film + 0.3, t.hairy + 0.5 - t.film - 0.3, FILM, "sine.inOut", CLOSE.d);
  st(t.hairy - 0.1, 0.5, { hair: 1 }, "sine.out");
  chip("chip-cheveu", null, ...TOP, t.hairy + 0.05, t.back - 0.15);

  /* ── C · « Et ton oreiller… travaille contre lui. » ── */
  // the film alone between its electrodes, in the dark — and on « contre » the heat closes in on it
  shot(t.back - 0.1, t.against + 0.6 - t.back, WIDE, "sine.inOut", FILM.d);
  st(t.back - 0.05, 0.4, { hair: 0 }, "sine.in");
  st(t.back, 0.6, { litFilm: 0.6 }, "sine.inOut");
  // « contre » : the heat gains, the film loses its veille
  st(t.against - 0.05, 0.8, { gel: 0.28 }, "sine.out");
  st(t.against - 0.05, 0.9, { litFilm: 0 }, "sine.inOut");
  st(t.against - 0.05, 0.4, { temp: 41 }, "none");

  /* ═════════════ THE SCENE ═════════════ */
  /* ── « Dans une batterie : deux électrodes, séparées par presque rien, dans un liquide inflammable. » ── */
  shot(t.toscene, t.electrodes + 0.4 - t.toscene, REPOS, "sine.inOut");
  st(t.toscene, 0.5, { gel: 0 }, "sine.inOut");
  st(t.electrodes - 0.05, 0.35, { litAlu: 1 }, "sine.out"); // « deux électrodes » : the upper one…
  st(t.electrodes + 0.35, 0.35, { litCopper: 1 }, "sine.out"); // …the lower one
  // « presque rien » : the film between them
  shot(t.nothing - 0.2, t.fluid - t.nothing, FILM, "sine.inOut");
  st(t.nothing - 0.1, 0.4, { litAlu: 0, litCopper: 0 }, "sine.inOut");
  st(t.nothing - 0.05, 0.45, { litFilm: 1 }, "sine.out");
  // « liquide inflammable »
  st(t.fluid - 0.05, 0.8, { liquid: 1 }, "sine.out");
  st(t.fluid, 0.6, { litFilm: 0.4 }, "sine.inOut");
  chip("chip-liquide", null, ...TOP, t.fluid + 0.1, t.contact - 0.15);
  shot(t.fluid - 0.2, t.contact - t.fluid - 0.3, { ...FILM, d: 64, shift: 85 }, "sine.inOut"); // (it never stands still)

  /* ── « Si elles se touchent : la chaleur appelle la chaleur. » — a hypothesis: the header does not move ── */
  shot(t.contact - 0.5, 1.3, TOUCH, "sine.inOut"); // down to the profile: the only view where `touch` reads
  shot(t.contact + 0.8, t.to2016 - t.contact - 0.8, { ...TOUCH, d: 44 }, "sine.inOut");
  st(t.contact, 0.6, { touch: 1 }, "power2.in");
  st(t.calls - 0.05, t.to2016 - 0.2 - t.calls, { chain: 1 }, "none");

  /* ═════════════ THE RECALL ═════════════ */
  /* ── « En 2016, un modèle entier a été rappelé… et interdit d'avion, aux États-Unis. » ── */
  cut(t.to2016, SET.BENCH, RANKS, { ...BENCHED, ranks: 0.15, heat: 0.55, temp: 34, mood: 1, pool: 0, fz: -60, fs: 160 });
  const down = t.sceneEnd - 0.55; // the camera leaves for the one that is left
  shot(t.to2016, down - t.to2016, RANKS_IN, "sine.inOut");
  st(t.model - 0.05, t.recalled - t.model, { ranks: 1 }, "sine.inOut"); // « modèle entier » : row after row
  chip("chip-2016", null, 56, TOP[1], t.model + 0.1, t.banned - 0.15); // (the widest label: it starts further left)
  st(t.recalled - 0.05, down - t.recalled, { recall: 1 }, "sine.inOut"); // « rappelé » : their embers die, far end first
  chip("chip-avion", null, ...TOP, t.banned + 0.05, t.alone - 0.15);

  /* ── (silence, then « Alors… ») : only ours is left, and the camera comes down on it ── */
  const land = t.alors + 0.15;
  shot(down, land - down, WHOLE, "sine.inOut", RANKS_IN.d);
  st(down, 0.9, { ranks: 0 }, "sine.in");
  now(down + 1.0, { recall: 0 }); // (they are gone: nothing to see)
  st(down, land - down, { heat: 0, pool: BENCHED.pool, ...L_BENCH }, "sine.inOut");
  st(down + 0.1, 1.0, { temp: BENCHED.temp }, "none");
  st(t.alors - 0.05, 0.3, { mood: 0 }, "sine.inOut"); // the autopsy is veille
}
