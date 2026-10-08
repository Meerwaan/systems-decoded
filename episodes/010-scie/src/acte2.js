// 02 · AUTOPSIE — "Alors… on l'ouvre." Under the table: the cartridge beside the teeth, while the saw fades round
// it; the same blade and the same cartridge on the bench, at the same place of the picture (benchCut); the camera
// sinks to the closed box, the box opens into a row and each part has its shot on its word — the block, the spring,
// and the wire that holds it all back. Then how it waits: back on the saw, the blade carries its signal, the board
// runs through it and nothing changes; your hand rides the board into the teeth, the film stops, the blade's glow
// falls and a thread of light climbs your arm — you are in the circuit. The threshold: the camera comes back down
// that arm to the finger on the teeth, the light runs back into the blade — act 3 plays it again, slowly.
import { setAct } from "@kit/overlay.js";
import { benchCut, followCall } from "@kit/blocks.js";
import { SET, VIEW, HOME, STAGED, BENCHED, BLADE, CARTRIDGE, TOUCH } from "./world.js";

const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
// the bench's light, stood round the blade in the saw: the metal is lit alike on both sides of the cut
const LIT = { fx: HOME[0] + BENCHED.fx, fy: HOME[1] + BENCHED.fy, fz: HOME[2] + BENCHED.fz, fs: BENCHED.fs };

/* ── under the table ── */
// where the block of aluminium faces the teeth: the point of the blade's rim nearest the cartridge
const B = [BLADE.x, BLADE.y, BLADE.z];
const C = CARTRIDGE.centre;
const REACH = Math.hypot(C[1] - B[1], C[2] - B[2]);
const MEET = [B[0], B[1] + ((C[1] - B[1]) / REACH) * BLADE.r, B[2] + ((C[2] - B[2]) / REACH) * BLADE.r];
const UNDER = { ...P, tx: MEET[0], ty: MEET[1], tz: MEET[2], d: 100, az: -58, el: 4, shift: 150 }; // the cut to the bench leaves from here
const UNDER_FAR = { ...UNDER, d: 116 };

/* ── on the bench ── */
const WHOLE = VIEW.whole;
// the closed box, its block against the teeth
const BOX = { ...P, tx: C[0] - HOME[0], ty: C[1] - HOME[1] + 1.2, tz: C[2] - HOME[2] + 1.5, d: 76, az: -58, el: 6, shift: 150 };
// the row: each part from close (the camera stands where the row was laid out for: az −58)
const BLOCK = { ...VIEW.blockPart, d: 62 };
const BLOCK_NEAR = { ...BLOCK, d: 56 };
const SPRING = { ...VIEW.springPart, d: 50 };
const SPRING_NEAR = { ...SPRING, d: 46 };
const WIRE = { ...VIEW.wirePart, d: 40 };
const WIRE_NEAR = { ...WIRE, d: 37 };

/* ── back on the saw ── */
const SAW_FAR = { ...P, tx: 0, ty: 85, tz: 5, d: 235, az: -66, el: 12, shift: 150, side: 60 }; // the blade in the board, your hand on it
const SAW = { ...P, tx: 0, ty: 84, tz: 4, d: 165, az: -64, el: 10, shift: 150, side: 60 }; // the blade whole: its dome over the board, its disc through the glass of the table
const KERF = { ...P, tx: -1, ty: 90.5, tz: 9, d: 105, az: -60, el: 24, shift: 150, side: 20 }; // from above the board: its grain running into the teeth, the hand riding it (from low down the board is a thin band: nothing is seen to move)
const TOUCHED = { ...P, tx: TOUCH[0] - 0.55, ty: TOUCH[1] + 0.5, tz: TOUCH[2] - 1.2, d: 68, az: -62, el: 12, shift: 150 }; // the finger AND the teeth
const CIRCUIT = { ...P, tx: -14, ty: 116, tz: 28, d: 383, az: -70, el: 10, shift: 5, side: 105 }; // you, from the blade to your chest — left of the centre: behind your back the picture is dark, the chevrons of the threshold come up there
// The hook's picture, come back: the fingertip on the teeth. Framed high (the fingertip at 500 × 700), so that your
// hand passes ABOVE the chevrons that point at the follow button (832–892 × 948–992): they fall on the edge of the
// board. And from low (el 9): the board is a band, the blade reads as ONE disc through it — its teeth stand against
// the dark, not against the wood behind them (seen from el 14 to 20 they were grey on brown).
const END = { ...P, tx: TOUCH[0], ty: TOUCH[1], tz: TOUCH[2], d: 138, az: -62, el: 9, shift: 320, side: 40 };
const END_NEAR = { ...END, d: 110 };

// shop.js's own law, turned round: how far short of the teeth the forefinger is (cm) → `slip`
const HAND = (cm) => (cm >= 4.21 ? 0.6 - (cm - 4.21) / 15.4 : 1 - 0.15 * Math.pow(Math.max(0, cm), 1 / 1.465));
const SLIP0 = 0.4;
const SHORT0 = 4.21 + 15.4 * (0.6 - SLIP0); // cm short of the teeth at SLIP0

export default function acte2({ D, world, co }) {
  const { tl, st, shot, cut } = D;
  const A = world.saw.A;
  const t = D.times({
    tounder: "tounder", tobench: "tobench", explode: "explode", sous: "eclate", p0: "p0", p1: "p1", p2: "p2", retenir: "eclate:retenir", simple: "eclate:simple", p3: "p3",
    tosignal: "tosignal", signal: "signal", wood: "wood", body: "body", touchant: "repos:touchant",
    toseuil: "toseuil", seuil: "seuil", lame: "seuil:lame", reprend: "seuil:reprend", ralenti: "seuil:ralenti", end: "seuil$", tozero: "tozero",
  });
  const light = (at, dur, [fx, fy, fz], fs) => st(at, dur, { fx, fy, fz, fs }, "sine.inOut");
  const aim = (pose) => [pose.tx, pose.ty, pose.tz];
  const span = (from, to) => Math.max(0.1, to - from); // every length is a gap between two moments of the script: the day the voice comes, they all follow
  // A part's name, drawn on it. On the bench the row lies in front of the blade: behind a label there is steel, not
  // night — its small line is written in full ink (dimmed, it fell under the contrast the check asks for).
  const label = (opts) => {
    const c = co.add({ tone: "system", ...opts });
    const sub = document.querySelector("#callouts > .co:last-child .co__s");
    if (sub) sub.style.color = "var(--ink)";
    return c;
  };
  setAct(tl, 2, t.tounder);

  /* ── "Alors…" — under the table: the cartridge beside the teeth. Every tooth stands still; the saw fades round them ── */
  const under = t.tobench - t.tounder;
  cut(t.tounder, SET.SHOP, UNDER_FAR, { ...STAGED, table: 0.15, blur: 0, dust: 0, you: 0, ...LIT });
  shot(t.tounder + 0.02, under - 0.02, UNDER, "sine.inOut", UNDER_FAR.d);
  st(t.tounder + 0.08, Math.max(0.2, under - 0.2), { shell: 0, table: 0, signal: 0 }, "sine.inOut");
  st(t.tounder + 0.08, Math.min(0.45, Math.max(0.2, under - 0.2)), { mood: 0 }, "sine.inOut");

  /* ── "…on l'ouvre." — the same blade, the same cartridge, on the bench; the camera steps back: there is the whole of it ── */
  const bench = benchCut(D, { at: t.tobench, set: SET.BENCH, view: UNDER, origin: HOME, state: { ...BENCHED, pool: 0, grid: 0 } });
  const pullAt = t.explode + 0.08;
  shot(pullAt, span(pullAt, t.sous - 0.12), WHOLE, "sine.inOut", bench.d);

  /* ── "Sous la table, tout près de la lame : une cartouche." — one dive to the closed box, its block against the teeth ── */
  const diveAt = t.sous - 0.1;
  const diveLen = span(diveAt, t.p0 + 0.25);
  shot(diveAt, diveLen, BOX, "sine.inOut", WHOLE.d);
  light(diveAt, diveLen, aim(BOX), 12);
  const cBox = label({ title: "Cartouche", sub: "Sous le plateau", x: 350, y: 500, align: "end", anchor: A.cartridge });

  /* ── "Un bloc d'aluminium." — the box lifts off and its parts come out in a row: the block lands before the camera on its word ── */
  const OPEN = 0.9;
  const openAt = Math.max(t.p0 + 0.3, t.p1 - 0.45);
  cBox.show(tl, t.p0 - 0.5); // (drawn while the camera lands: its name is up as the voice says it)
  cBox.hide(tl, openAt + 0.1); // the box lifts toward its label: the label has gone
  st(openAt, OPEN, { explode: 1 }, "none");
  shot(openAt, OPEN, BLOCK, "sine.inOut"); // (the camera hardly moves: the block comes to it)
  light(openAt, OPEN, aim(BLOCK), 10);
  st(t.p1 + 0.1, 0.3, { litBlock: 1 }, "sine.out");
  const cBlock = label({ title: "Bloc d'aluminium", sub: "Tout près des dents", x: 430, y: 540, align: "end", anchor: A.block });
  cBlock.show(tl, t.p1 - 0.1); // on the block as it lands
  cBlock.hide(tl, t.p2 - 0.36);
  shot(openAt + OPEN, span(openAt + OPEN, t.p2 - 0.12), BLOCK_NEAR, "sine.inOut", BLOCK.d);

  /* ── "Un ressort comprimé." — along the row ── */
  shot(t.p2 - 0.12, 0.6, SPRING, "sine.inOut", BLOCK_NEAR.d);
  light(t.p2 - 0.12, 0.6, aim(SPRING), 9);
  st(t.p2 - 0.1, 0.3, { litBlock: 0 }, "sine.inOut");
  st(t.p2 + 0.1, 0.3, { litSpring: 1 }, "sine.out");
  const cSpring = label({ title: "Ressort", sub: "Comprimé", x: 650, y: 540, align: "start", anchor: A.spring });
  cSpring.show(tl, t.p2 + 0.1);
  cSpring.hide(tl, t.retenir - 0.4);
  shot(t.p2 + 0.5, span(t.p2 + 0.5, t.retenir - 0.12), SPRING_NEAR, "sine.inOut", SPRING.d);

  /* ── "Et pour le retenir… un simple fil." — the camera slides to what holds it back, and it lights up on its word ── */
  const slideAt = t.retenir - 0.1;
  const slideLen = span(slideAt, t.simple + 0.1);
  shot(slideAt, slideLen, WIRE, "sine.inOut", SPRING_NEAR.d);
  light(slideAt, slideLen, aim(WIRE), 8);
  st(slideAt, 0.4, { litSpring: 0 }, "sine.inOut");
  st(t.p3 + 0.08, 0.25, { litWire: 1 }, "sine.out");
  const cWire = label({ title: "Fil", sub: "≈ 0,25 mm", x: 440, y: 560, align: "end", anchor: A.wire });
  cWire.show(tl, t.simple - 0.15); // (its name is readable as the voice says it)
  cWire.hide(tl, t.tosignal - 0.26);
  shot(slideAt + slideLen, span(slideAt + slideLen, t.tosignal), WIRE_NEAR, "sine.inOut", WIRE.d);

  /* ── "La lame, elle, porte un petit signal électrique." — back on the saw: it runs, you push the board, and the blade lights up ── */
  cut(t.tosignal, SET.SHOP, SAW_FAR, { ...STAGED, slip: SLIP0, feed: STAGED.feed - SHORT0, signal: 0, litBlock: 0, litSpring: 0, litWire: 0 });
  shot(t.tosignal + 0.02, span(t.tosignal, t.signal + 0.5), SAW, "sine.inOut", SAW_FAR.d);
  st(t.signal, 0.8, { signal: 0.9 }, "sine.out");
  D.chip("chip-signal", null, 96, 462, t.signal + 0.05, t.body - 0.2);

  // Your left hand holds the board down: it rides it. From the cut to the contact the board runs at one speed, and
  // the hand with it — `feed` ends on STAGED's own, the board does not jump on act 3's cut.
  const hit = t.touchant + 0.12;
  const ride = hit - t.tosignal;
  st(t.tosignal, ride, { feed: STAGED.feed }, "none");
  const STEPS = 24;
  for (let i = 0; i < STEPS; i++) st(t.tosignal + (ride * i) / STEPS, ride / STEPS, { slip: HAND(SHORT0 * (1 - (i + 1) / STEPS)) }, "none");

  /* ── "Le bois sec n'y change presque rien." — the teeth in the wood, the sawdust: the glow does not move ── */
  shot(t.wood - 0.1, span(t.wood, t.body), KERF, "sine.inOut", SAW.d);

  /* ── "Ton corps, si : en la touchant…" — the hand reaches the teeth: the film stops, the blade's glow falls ── */
  shot(t.body - 0.1, span(t.body, hit), TOUCHED, "sine.inOut", KERF.d);
  st(hit, 0.1, { blur: 0 }, "power2.out");
  st(hit, 0.08, { circuit: 0.12 }, "power2.out"); // a light that has a place: the fingertip
  D.jolt(hit, 0.25, 0.4); // light: the board and the table draw level lines across this picture
  st(hit + 0.05, 0.6, { signal: 0.15 }, "sine.out");

  /* ── "…tu entres dans le circuit." — the thread of light climbs your arm; the camera steps back ahead of it, the blade holding its place ── */
  // (in centimetres, not by ratio: the frame has to open before the light gets there — the thread is timed on the
  // camera, so that its head is always in the picture: the elbow is in when the light reaches it)
  const backAt = hit + 0.2;
  const backLen = span(backAt, t.toseuil - 0.15);
  shot(backAt, backLen, CIRCUIT, "sine.inOut");
  light(backAt, backLen, [-10, 108, 24], 120);
  st(backAt + 0.3 * backLen, 0.63 * backLen, { circuit: 1 }, "none");
  // (no label here: #chip-circuit said again, word for word, what the caption says 600 px below — the picture says it alone)

  /* ── the threshold — "Abonne-toi : ton doigt est sur la lame, et on reprend au ralenti." ── */
  // The subscribe call that is heard (kit: followCall). The film does not stop for it: it winds back. The camera
  // comes down your arm to the finger on the teeth — the hook's picture — and the light runs back down ahead of it
  // (what leaves by the top of the picture has already gone dark: nothing bright crosses the header). On "on
  // reprend" the last of it goes back into the blade: the instant of the contact again, what act 3 starts from.
  // The header's clock answers "ralenti".
  followCall(tl, { from: t.seuil, to: Math.min(t.end + 0.15, t.tozero - 0.1) });
  const downAt = t.toseuil - 0.1;
  const downLen = span(downAt, t.lame + 0.1);
  shot(downAt, downLen, END, "sine.inOut", CIRCUIT.d);
  light(downAt, downLen, [STAGED.fx, STAGED.fy, STAGED.fz], STAGED.fs);
  st(downAt + 0.02 * downLen, 0.48 * downLen, { circuit: 0.19 }, "none"); // back to the wrist by the middle of the way: the glass of your body is plain again under the chevrons
  st(downAt + 0.5 * downLen, 0.25 * downLen, { circuit: 0.12 }, "sine.out");
  shot(downAt + downLen, span(downAt + downLen, t.tozero), END_NEAR, "sine.inOut", END.d); // and it keeps closing in on the fingertip: the camera never stops
  st(t.reprend, 0.3, { circuit: 0 }, "power2.in");
  st(t.reprend + 0.1, 0.6, { signal: STAGED.signal }, "sine.inOut");
  const beat = Math.min(0.4, Math.max(0.1, t.tozero - t.ralenti - 0.34));
  tl.to("#hud-clock", { scale: 1.16, color: "#5cffb0", duration: 0.14, ease: "power2.out", transformOrigin: "100% 50%" }, t.ralenti);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: beat, ease: "power2.out" }, t.ralenti + 0.2);
}
