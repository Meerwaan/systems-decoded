// 01 · MENACE — from the first frame to "Alors…" (0 → totip). Time is stopped one millisecond before the stroke.
//
// The hook A · B is ONE move, each stage landing on its word: the leader's head ("Un millième de seconde") →
// down its road to the roof ("…touche ton toit") → you at the window ("Tu ne sentiras rien") → up the wire along
// the front wall to the top of the rod ("là-haut, une tige de métal"), whose glow swells on "appeler" with the
// leader's head hanging right above it. C is a cut: you, outside, alone under the sky, and the filament that
// rises from your head on "c'est toi". Then the house WITHOUT its rod: the stroke comes in by the chimney and
// looks for the earth through the roof frame, the wires, the pipes — the camera rushes with it to you and the
// socket — and the film winds back.
//
// The hook's cards lie over y 1186–1542, the captions over 1248–1488: what a sentence shows stands above them.
import { setAct } from "@kit/overlay.js";
import { SET, STAGED, LEADER } from "./world.js";

/* ── the poses (found with `look`; the leader's head, once the hook's bound is made, hangs at ≈ [514, 2503, −526]) ── */
// the head of the leader, from the lawn: a tilt up and a longer lens — the camera never leaves the grass
const LEAD = { tx: 514, ty: 2503, tz: -526, d: 4864, az: -42, el: -30.5, fov: 40, shift: 110, side: 0, drift: 0.3 };
// the roof it is coming for: the ridge, the rod at its end, the antenna, the chimney
const ROOF = { tx: -150, ty: 820, tz: 0, d: 2800, az: -38, el: -15, fov: 40, shift: 130, side: 0 };
// you, behind the window — and on the left the wire that comes down the wall: the next move climbs it
const INSIDE = { tx: -200, ty: 170, tz: 300, d: 1300, az: -36, el: -6, fov: 30, shift: 330, side: 0 };
// from under the top of the rod, looking up: its tip at the bottom of the picture, the leader's head above it
const TIP = { tx: -400, ty: 1240, tz: 0, d: 800, az: -52, el: -45, fov: 36, shift: -10, side: 40 };
// you, outside: the whole of you alone on the lawn, then closer and lower — nothing behind you but the sky
const OUT_WIDE = { tx: 900, ty: 200, tz: 520, d: 760, az: -100, el: -12, fov: 50, shift: 360, side: 0, roll: 0, drift: 0.3 };
const OUT_NEAR = { tx: 900, ty: 175, tz: 520, d: 470, az: -100, el: -18, fov: 55, shift: 150, side: 0 };
// the house without its rod, whole (the roof clear of the label in the top slot); then you and the socket beside you
const SANS = { tx: 0, ty: 430, tz: 0, d: 3950, az: -36, el: -8, fov: 38, shift: 65, side: 40, roll: 0, drift: 0.3 };
const SANS_IN = { d: 3500, shift: 80 };
const SOCKET = { tx: -20, ty: 100, tz: 200, d: 896, az: -58, el: 3, fov: 30, shift: 140, side: 0 };

export default function acte1({ D, world }) {
  const { tl, st, shot, cut, chip, blip } = D;
  const t = D.times({
    toroof: "toroof", toit: "accroche:toit", torod: "torod", tige: "promesse:tige", glow: "glow", toout: "toout", hair0: "hair0",
    tosans: "tosans", hit: "hit", wires: "wires", pipes: "pipes", reach: "reach", back: "back", totip: "totip",
  });
  const W = world.house.T; // `whatif` when the stroke gets there
  const A = world.house.A;
  setAct(tl, 1, 0);

  /* ───────────── A · "Un millième de seconde. Et la foudre touche ton toit." ───────────── */
  // the first frame is POSE0 / FIRST. The camera moves from frame 1 — slowly: the picture has to be read — and at
  // 0.12 s the leader makes one more bound: that is what stops the thumb. Time then stands still (STAGED) until act 3.
  st(0.1, 0.14, { leader: LEADER.held }, "none");
  // (sine.inOut that is already under way on the first frame: a whip from frame 1 would hide the bound)
  shot(0, 1.5, LEAD, (u) => 0.5 - 0.5 * Math.cos(Math.PI * u) + 0.25 * u * (1 - u) * (1 - u));
  // while the camera is on the leader's head the house passes under the hook's first card: it dims, the words stay clean…
  st(0.3, 0.6, { shell: 0.4, inside: 0.3 }, "sine.inOut");
  // …and comes back as the camera goes down the road the leader has left to make, to the roof — there on "toit"
  st(t.toroof, 0.8, { shell: 1, inside: 0.6 }, "sine.inOut");
  shot(t.toroof, t.toit + 0.06 - t.toroof, ROOF, "sine.inOut", LEAD.d);

  /* ───────────── B · "Tu ne sentiras rien : là-haut, une tige de métal va l'appeler." ───────────── */
  // …and under that roof, you
  const toYou = t.toit + 0.1;
  const climb = t.torod - 0.23; // "rien" is said: the camera leaves you just before "là-haut"
  // (1.25 s, not 0.95: on the draft this push was the roughest move of the film — and it is in the hook)
  shot(toYou, 1.25, INSIDE, "sine.inOut", ROOF.d);
  st(toYou, 1.25, { fx: -150, fy: 150, fz: 250, fs: 300 }, "sine.inOut");
  chip("chip-toi", A.youHead, 56, -44, toYou + 0.95, climb - 0.06);
  // "là-haut": up the wire, along the wall and over the edge of the roof, to the top of the rod. The house dims
  // as the camera leaves you (its roof, grazed from so close, would smear into a white slab): the wire is what stays lit
  shot(climb, t.glow - 0.04 - climb, TIP, "sine.inOut", INSIDE.d);
  st(climb, t.glow - 0.04 - climb, { fx: -400, fy: 1100, fz: 0, fs: 160 }, "sine.inOut");
  st(climb, 0.7, { shell: 0.18, inside: 0.15 }, "sine.inOut");
  chip("chip-rod", null, 96, 470, t.tige - 0.1, t.toout - 0.17);
  // "appeler": the charge the earth sends up swells on the tip, and the camera leans in
  st(t.glow, 0.6, { charge: 0.9 }, "sine.out");
  shot(t.glow, t.toout - t.glow - 0.02, { d: 720 }, "sine.inOut", TIP.d);

  /* ───────────── C · "Sauf le jour où la tige… c'est toi." ───────────── */
  // (no house, no tree: nothing stands around you)
  cut(t.toout, SET.STORM, OUT_WIDE, { ...STAGED, shell: 0, inside: 0, you: 0, out: 1, fx: 900, fy: 150, fz: 520, fs: 320 });
  shot(t.toout, t.tosans - 0.05 - t.toout, OUT_NEAR, "sine.inOut", OUT_WIDE.d);
  chip("chip-out", A.outHead, 62, -24, t.toout + 0.25, t.tosans - 0.16);
  // "c'est toi": your hair stands up, and a pale filament climbs from your head
  st(t.hair0, 0.6, { hair: 1 }, "power2.out");

  /* ───────────── "Sans elle, la foudre cherche la terre à travers ta maison : tes fils, tes tuyaux… toi." ───────────── */
  cut(t.tosans, SET.STORM, SANS, { ...STAGED, rod: 0, charge: 0, leader: 0, shell: 0.7, inside: 1, cloud: 0.9, fx: -100, fy: 450, fz: 100, fs: 700 });
  chip("chip-sans", null, 96, 448, t.tosans + 0.1, t.wires - 0.05);
  const dive = t.wires + 0.2; // "tes fils" starts from afar, then the camera goes with the stroke
  // "la foudre": it comes in by the chimney — the cloud and the lawn take its light, the camera takes the blow
  // (a short push, no shake: the picture is wide and full of level lines), embers fall from the roof
  st(t.hit, 0.04, { hit: 1.5 }, "none"); // the stroke comes down on the chimney: white-hot, then the colour of the threat while its current runs through the house
  st(t.hit + 0.04, 1.2, { hit: 0.45 }, "power2.out");
  st(t.hit, 0.3, { fire: 1 }, "power2.out");
  blip("#flash", t.hit, 0.06, 0.05, 0.4);
  shot(t.tosans, t.hit - t.tosans, { d: SANS.d * 0.985 }, "sine.inOut");
  shot(t.hit, 0.3, { d: SANS.d * 0.955 }, "power2.out");
  shot(t.hit + 0.3, dive - t.hit - 0.3, SANS_IN, "sine.inOut");
  // its way to the earth, on the words: [instant, whatif] — straight from one to the next
  const way = [
    [t.hit, 0],
    [t.hit + 0.22, W.roof], //             "la foudre": down the chimney, into the roof
    [t.wires - 0.24, W.lamp2 + 0.01], //   "cherche la terre à travers ta maison": the whole roof frame lights up, a lamp bursts upstairs
    [t.wires + 0.06, W.pipeTop + 0.03], // it jumps to the wires of the attic, and to the pipe of the shower
    [t.pipes - 0.03, W.unit + 0.01], //    "tes fils": down the back wall to the fuse box
    [t.reach, W.socket], //                "tes tuyaux…": the pipe takes it to the ground; the lamp behind you bursts, and it runs along the skirting board to the socket beside you
    [t.reach + 0.12, W.you + 0.01], //     "toi": the arc reaches for your hand
    [t.back, 1], //                        everything it went through burns
  ];
  for (let i = 1; i < way.length; i++) st(way[i - 1][0], way[i][0] - way[i - 1][0], { whatif: way[i][1] }, "none");
  // the camera rushes to you with it — the stroke comes round the room along the floor as the camera gets there
  shot(dive, t.reach + 0.14 - dive, SOCKET, "sine.inOut", SANS_IN.d);
  st(dive, t.reach + 0.14 - dive, { shell: 0.5, fx: -20, fy: 110, fz: 200, fs: 260 }, "sine.inOut");

  // …and the film winds back: none of this happens (act 2 cuts at totip)
  st(t.back, 0.4, { whatif: 0, fire: 0, hit: 0 }, "power2.inOut");
  shot(t.back, t.totip - 0.03 - t.back, { d: 1100 }, "sine.inOut", SOCKET.d);
}
