// 02 · AUTOPSIE — from "Alors…" to the cut of act 3 (tosystem → tozero).
//
// Act 1 leaves the scanner alone in what is left of its room (VIEW.system). The walls go out on "Alors…", and the
// same machine stands on the bench at the same place of the picture (benchCut). On "on" it comes apart — its two
// half-covers lift off, the tunnel and the gradient sleeve slide out of the vessel — and the camera pulls back to
// the whole exploded view. Then it closes on the two parts the voice names, telescoped, in ONE frame: the tunnel
// lights up on its word, then the sleeve — and it knocks, three bursts on three words.
// (The half-covers leave as the camera closes in.) "Et autour" : the two slide home INTO the vessel — the picture
// says "around" — and the vessel is glass: the rings of wire, then their bath of helium. The frame holds, and closes in slowly: the current starts
// its round on "tourne"; on "sans prise" the machine's lights go out, the header says « Arrêtée » — and the round
// goes on, the field has not moved. The covers come back on "Silencieuse…" (its lights with them), the camera pulls
// far back, and the lines of the field come up around the mute machine on "ne veut pas dire éteinte".
// The threshold does not stop the film: one long dive from there to the box with the two buttons, on its post
// beside the magnet; the lines leave the camera's way, the buttons light up on "l'éteint". Act 3 cuts from there.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, BENCHED, STAGED, BOX } from "./world.js";

/* ── on the bench ── */
// the two parts pulled out of the vessel, telescoped: the gradient sleeve (left) and the tunnel coming out of its
// mouth toward the eye — the sleeve's saddles show on its flank, the tunnel shows its hole
const PAIR = { ...VIEW.exploded, tx: -214, ty: 110, tz: -56, d: 1000, az: -34, el: 12, shift: 170 };
// opened (cover 0, xray 1), the vessel low enough to leave the top slot to a label…
const OPEN = { ...VIEW.open, shift: 100 };
// …and as near as the vessel goes between the header and the captions
const NEAR = { ...VIEW.open, d: 1080, shift: 150 };
// the mute machine and the lines of its field
const FIELD = VIEW.field;
// the box with the two buttons, on its post: where the threshold's dive ends
const BOX_END = { ...VIEW.boxBench, d: 200 };

// the light: what it stands around, and how wide
const L_WHOLE = { fx: BENCHED.fx, fy: BENCHED.fy, fz: BENCHED.fz, fs: BENCHED.fs };
const L_WIDE = { ...L_WHOLE, fs: 420 }; // the exploded view, the field
const L_PAIR = { fx: -219, fy: 108, fz: -60, fs: 190 };
const L_BOX = { fx: BOX.bench[0], fy: BOX.bench[1], fz: BOX.bench[2], fs: 60 };

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut, chip } = D;
  const A = world.system.A;
  const t = D.times({
    tosystem: "tosystem", tobench: "tobench", explode: "explode",
    p1: "p1", p2: "p2", knocks: "eclate:cognent", noise: "noise", them: "eclate:elles", themEnd: "eclate:elles$",
    around: "eclate:Et", p3: "p3", p4: "p4", helium: "helium",
    torepos: "torepos", cold: "cold", thiswire: "repos:fil", current: "repos:courant", turns: "repos:tourne",
    noplug: "noplug", quiet: "quiet", not: "repos:veut-0.12", means: "repos:veut", noff: "noff",
    toseuil: "toseuil", seuil: "seuil", always: "seuil:toujours", lit: "seuil:allumé$", look: "seuil:regarde", off: "seuil:l'éteint", seuilEnd: "seuil$",
    tozero: "tozero",
  });
  setAct(tl, 2, t.tosystem);

  /* ───────────── "Alors…" — the scanner alone: what is left of its room goes out ───────────── */
  // (the same picture as act 1's last one: this cut only says the whole state, and stands the bench's light round it)
  cut(t.tosystem, SET.SUITE, VIEW.system, { ...STAGED, shell: 0.25, you: 0, carry: 0, line: 0, seen: 0, mood: 0, ...L_WHOLE });
  st(t.tosystem + 0.04, (t.tobench - t.tosystem) * 0.8, { shell: 0 }, "sine.inOut");

  /* ───────────── "…on l'ouvre." — the same machine on the bench, at the same place; it comes apart ───────────── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, state: { ...BENCHED, pool: 0, grid: 0 } });
  // its half-covers lift off, the tunnel and the sleeve slide out: the camera pulls back with them to the whole row
  // (the camera leads, from the cut: the lifting covers then never climb behind the header on their way up)
  const lift = t.explode + 0.1; // on "l'ouvre"
  st(lift, t.p1 - 0.2 - lift, { explode: 1 }, "sine.inOut");
  const wide = t.p1 - 0.12 - (t.tobench + 0.03);
  shot(t.tobench + 0.03, wide, VIEW.exploded, "sine.inOut", bench.d);
  st(t.tobench + 0.03, wide, L_WIDE, "sine.inOut");

  /* ───────────── "Un tunnel." — it lights up in the row, and the camera closes on it and on the sleeve it came out of ───────────── */
  const closing = t.p2 + 0.2 - t.p1;
  shot(t.p1, closing, PAIR, "sine.inOut", VIEW.exploded.d);
  st(t.p1, closing, L_PAIR, "sine.inOut");
  st(t.p1 + 0.08, 0.25, { litBore: 1 }, "sine.out");
  // (the half-covers have been seen: they go out up there — the rear one would stand, a ghost, behind the header)
  st(t.p1, 0.5, { cover: 0 }, "sine.inOut");

  /* ───────────── "Des bobines qui cognent : le bruit, c'est elles." — the same frame: the sleeve lights up, and knocks ───────────── */
  st(t.p2 - 0.1, 0.25, { litBore: 0 }, "sine.inOut");
  st(t.p2 + 0.15, 0.25, { litGradients: 1 }, "sine.out");
  // three bursts, each on its word (an exam knocks in series): "cognent", "bruit", "elles"
  const burst = (from, to) => {
    st(from, 0.1, { knock: 1 }, "power2.out");
    st(to, 0.18, { knock: 0.15 }, "sine.inOut");
  };
  burst(t.knocks - 0.06, t.knocks + 0.4);
  burst(t.noise + 0.04, t.noise + 0.42);
  burst(t.them - 0.06, t.themEnd);
  st(t.themEnd + 0.18, 0.15, { knock: 0 }, "sine.inOut");
  chip("chip-bruit", null, 96, 470, t.noise, t.around - 0.15);

  /* ───────────── "Et autour, le vrai aimant : du fil," — the two slide home into the vessel; covers gone, it is glass: the rings ───────────── */
  const home = t.around - 0.1;
  st(home - 0.12, 0.25, { litGradients: 0 }, "sine.inOut");
  st(home, 0.35, { xray: 1 }, "sine.inOut"); // (the vessel is glass already: it stays so as the row closes)
  st(home + 0.1, t.p3 - 0.05 - (home + 0.1), { explode: 0 }, "sine.inOut");
  shot(home + 0.1, t.p3 + 0.1 - (home + 0.1), OPEN, "sine.inOut", PAIR.d);
  st(home + 0.1, t.p3 + 0.1 - (home + 0.1), L_WHOLE, "sine.inOut");
  st(t.p3 + 0.05, 0.3, { litMagnet: 1 }, "sine.out");
  const cWire = co.add({ title: "Fil supraconducteur", x: 470, y: 480, align: "end", tone: "system", anchor: A.coils });
  cWire.show(tl, t.p4 - 0.12); // (its dot and its leader first: the words come with "fil")
  cWire.hide(tl, t.torepos - 0.3);

  /* ───────────── "noyé dans l'hélium liquide." — the same frame: the rings go back to metal, their bath lights up ───────────── */
  st(t.helium - 0.2, 0.3, { litMagnet: 0 }, "sine.inOut");
  st(t.helium + 0.05, 0.35, { litHelium: 1 }, "sine.out");

  /* ───────────── "À moins 269 degrés, ce fil n'a plus de résistance :" — the bath, then the wire in it ───────────── */
  chip("chip-269", null, 96, 470, t.cold - 0.1, t.thiswire + 0.25);
  st(t.thiswire - 0.4, 0.3, { litHelium: 0 }, "sine.inOut");
  st(t.thiswire - 0.08, 0.3, { litMagnet: 1 }, "sine.out");
  // …and the frame closes in on the rings, once the label has left the top slot
  const near = t.thiswire + 0.35;
  shot(near, t.current + 0.1 - near, NEAR, "sine.inOut", OPEN.d);
  st(t.current - 0.35, 0.3, { litMagnet: 0 }, "sine.inOut");

  /* ───────────── "le courant y tourne tout seul," — a light starts its round in every ring ───────────── */
  st(t.turns - 0.1, 0.45, { spin: 1 }, "sine.out");

  /* ───────────── "sans prise." — the machine's lights go out, the header says « Arrêtée » : the round goes on, 1,5 T ───────────── */
  st(t.noplug + 0.06, 0.12, { power: 0 }, "power2.out");
  tl.fromTo("#hud-count", { scale: 1 }, { scale: 1.16, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.noplug + 0.1);
  tl.to("#hud-count", { scale: 1, duration: 0.36, ease: "power2.out" }, t.noplug + 0.34);

  /* ───────────── "Silencieuse… ne veut pas dire éteinte." — its covers come back, its lights with them; far back: the lines of its field ───────────── */
  st(t.quiet, 0.8, { cover: 1 }, "sine.inOut");
  st(t.quiet + 0.25, 0.7, { xray: 0 }, "sine.inOut");
  st(t.quiet + 0.45, 0.15, { power: 1 }, "sine.out");
  st(t.quiet + 1.0, 0.2, { spin: 0 }, "sine.inOut"); // (drawn no more: the vessel has closed over it)
  const back = t.noff - 0.1 - t.quiet;
  shot(t.quiet, back, FIELD, "sine.inOut", NEAR.d);
  st(t.quiet, back, L_WIDE, "sine.inOut");
  st(t.not, t.noff + 0.25 - t.not, { seen: 0.6 }, "sine.out");
  chip("chip-silence", null, 96, 470, t.means, t.toseuil);

  /* ───────────── the threshold — "Abonne-toi : cet aimant toujours allumé, regarde comment on l'éteint." ───────────── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: one long dive from the far
  // frame to the box with the two buttons, on its post beside the magnet. The field's lines stay for "toujours
  // allumé" — the header answers the word — then leave the camera's way; the buttons light up on "l'éteint".
  // (in centimetres, not by ratio: the box stays in the frame all the way, and the last metre takes half a second)
  const dive = t.tozero - 0.04 - t.toseuil;
  shot(t.toseuil, dive, BOX_END, "sine.inOut");
  st(t.look - 0.2, t.tozero - 0.04 - (t.look - 0.2), L_BOX, "sine.inOut");
  st(t.lit, 0.4, { seen: 0 }, "sine.inOut");
  st(t.off - 0.25, 0.4, { litButtons: 1 }, "sine.out");
  followCall(tl, { from: t.seuil, to: Math.min(t.seuilEnd + 0.1, t.tozero - 0.32) });
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.14, duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%", immediateRender: false }, t.always);
  tl.to("#hud-clock", { scale: 1, duration: 0.36, ease: "power2.out" }, t.always + 0.3);
}
