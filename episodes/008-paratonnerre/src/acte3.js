// 03 · RÉPONSE — the millisecond, stretched: the leader's last bounds, everything that sticks out answering it,
// the rod's own answer meeting it, the stroke, and where its current goes. In cuts: each one is laid a few
// frames before its sentence (the one on "Contact" falls ON the word), its pose is complete and its state
// too ({ ...STAGED, … }). The lightning follows the VOICE, word by word; time itself stays stopped (drops
// hanging) until "Tu as sursauté".
//
// Where the camera stands, and why:
//   · the bounds are filmed from close and high (az −40, 12 m up): from the lawn the last four come straight at
//     the lens and a bound is 25 px. The house is out of the picture — the sky is a model (plan.js).
//   · the rod's answer is filmed almost from the front (az −8 … −5): the leader's last bound then reads as a
//     diagonal, from the right, as in the shots before it.
//   · "Contact" is the first frame's own place on the lawn: the promise of the hook, kept in its picture.
//   · two shots FOLLOW something: the front of the return stroke up the channel, the head of the current down
//     the conductor. The camera reads its pose off the same numbers the world is drawn with (`ride`).
import { setAct } from "@kit/overlay.js";
import { clamp01, lerp, ramp, smooth } from "@kit/direct.js";
import { SET, STAGED, ROD, LEADER } from "./world.js";

const sineIO = (u) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(u)); // GSAP's sine.inOut
const at3 = (p) => ({ tx: p[0], ty: p[1], tz: p[2] });
const off = (p, dx, dy, dz) => ({ tx: p[0] + dx, ty: p[1] + dy, tz: p[2] + dz });
const FLAT = { side: 0, roll: 0, drift: 0.3 };

export default function acte3({ D, world }) {
  const { tl, st, shot, cut, jolt, chip, blip } = D;
  const { storm, rod, house } = world;
  const N = LEADER.bounds;
  const TIP = ROD.tip;
  const t = D.times({
    zero: "zero", tozero: "tozero", b1: "b1", b2: "b2", b3: "b3", b4: "b4",
    wide: "wide", answer: "reponse:répond", a1: "a1", a2: "a2", a3: "a3",
    torodup: "torodup", rise: "rise", last: "tige:sienne", join: "join",
    trigger: "trigger", heat: "heat", again: "contact:cinq",
    toreplay: "toreplay", up2: "up2", third: "remonte:tiers",
    todown: "todown", flow: "flow", wire: "wire", stake: "stake", earth: "earth",
    toyou: "toyou", jump: "jump", toverdict: "toverdict",
  });
  setAct(tl, 3, t.zero);

  /* ───────────── where things stand (read off the sets once, at build time) ───────────── */
  const xyz = (a) => [a.position.x, a.position.y, a.position.z];
  /** The leader's head once bound k has landed. */
  const headAt = (k) => {
    storm.update({ leader: k / N });
    return xyz(storm.A.leaderTip);
  };
  const H10 = headAt(10);
  const H12 = headAt(12);
  // the return stroke's front along `strike`, and the same line without its zigzag: what a camera can aim at
  const FRONT = Array.from({ length: 51 }, (_, i) => {
    storm.update({ leader: 1, up: 1, strike: i / 50 });
    return xyz(storm.A.front);
  });
  const frontAt = (s) => {
    const c = clamp01(s) * 50;
    const p = [0, 0, 0];
    let w = 0;
    for (let i = 0; i <= 50; i++) {
      const k = Math.max(0, 1 - Math.abs(i - c) / 4);
      if (!k) continue;
      for (let j = 0; j < 3; j++) p[j] += FRONT[i][j] * k;
      w += k;
    }
    return p.map((v) => v / w);
  };
  // the conductor, corner by corner: [share of its length, where] — `flow` is linear in length of wire (model.js)
  const X = TIP[0];
  const corners = [TIP, [X, 846, 5], ROD.run[1], ROD.run[2], [X, -8, ROD.run[3][2]], ROD.run[4], ROD.run[5]];
  const ruler = corners.map((p, i) => (i ? Math.hypot(p[0] - corners[i - 1][0], p[1] - corners[i - 1][1], p[2] - corners[i - 1][2]) : 0));
  for (let i = 1; i < ruler.length; i++) ruler[i] += ruler[i - 1];
  const share = ruler.map((r) => r / ruler.at(-1));
  const STAKE_HEAD = share[5];
  const wireAt = (f) => {
    for (let i = 1; i < corners.length; i++) {
      if (f <= share[i]) return corners[i].map((v, j) => lerp(corners[i - 1][j], v, clamp01((f - share[i - 1]) / (share[i] - share[i - 1]))));
    }
    return corners.at(-1);
  };

  /**
   * The camera rides `fn(time)` from a to b: a straight shot per frame, so it turns the corners of what it
   * follows on the same instant (`knots`), and never lags a number that is eased.
   */
  const ride = (a, b, fn, knots = []) => {
    const ts = [a, b, ...knots.filter((k) => k > a + 0.01 && k < b - 0.01)];
    for (let x = a + 1 / 30; x < b - 0.02; x += 1 / 30) if (!knots.some((k) => Math.abs(k - x) < 0.012)) ts.push(x);
    ts.sort((p, q) => p - q);
    for (let i = 1; i < ts.length; i++) shot(ts[i - 1], ts[i] - ts[i - 1], fn(ts[i]), "none");
  };
  /** A bound of the leader: it leaps in the last third of this tween, and lands on `at`. */
  const bound = (at, k, dur = 0.3) => st(at - dur, dur, { leader: k / N }, "none");
  const has = (id) => !!document.getElementById(id);

  /* ══════════ « L'éclair descend par bonds de cinquante mètres, à l'aveugle : il ne vise rien. » ══════════ */
  // the sky and the leader alone, from close: the camera comes down with the head, one bound on "descend", one on "bonds"
  const SKY = { d: 3000, az: -40, el: -26, fov: 40, ...FLAT };
  cut(t.tozero, SET.STORM, { ...SKY, ...off(H10, -88, 10, 28), shift: 250 }, { ...STAGED, charge: 1 });
  shot(t.tozero, t.b3 - 0.06 - t.tozero, { ...off(H12, 38, 64, -32), shift: 200 }, "sine.inOut");
  bound(t.b1, 11);
  bound(t.b2, 12);
  // "à l'aveugle": not a bound. Between two bounds the head only dims; on the word it flares again where it
  // stands, and goes nowhere — the camera has stopped with it, then closes in while it hesitates
  st(t.b2 + 0.05, t.b3 - t.b2 - 0.1, { leader: 12.5 / N }, "none");
  st(t.b3 - 0.03, 0.06, { leader: 12 / N }, "none");
  st(t.b3 + 0.1, 1.6, { leader: 12.45 / N }, "none");
  shot(t.b3 - 0.06, t.wide - t.b3 + 0.06, { ...off(H12, 20, 0, -20), d: 2600, az: -35 }, "sine.inOut");

  /* ══════════ « À quelques dizaines de mètres, tout ce qui dépasse lui répond : l'arbre, la cheminée, l'antenne. » ══════════ */
  bound(t.b4, 13, 0.25); // "dizaines": one more, still in the sky — the cut is what shows how near it now is
  // at the height of the roof, wide: the rod, the antenna, the chimney, the tree apart, the leader's head over them
  // (the house is dimmed: its lines are as pale as the answers, and there are a thousand of them)
  const ROOF = { tx: 330, ty: 1150, tz: 0, d: 4450, az: -22, el: -14, fov: 46, shift: -40, side: 55, roll: 0, drift: 0.3 };
  cut(t.wide, SET.STORM, ROOF, { ...STAGED, leader: 13 / N, charge: 1, shell: 0.8, inside: 0.3 });
  shot(t.wide, t.torodup - t.wide, { d: 4250 }, "sine.out");
  // "répond": a point of light on each of them; then each one's answer rises on its own word
  st(t.answer, 0.25, { upTree: 0.13, upChimney: 0.13, upAntenna: 0.13 }, "power2.out");
  st(t.a1, 0.55, { upTree: 1 }, "power2.out");
  st(t.a2, 0.55, { upChimney: 1 }, "power2.out");
  st(t.a3, 0.55, { upAntenna: 1 }, "power2.out");
  // "it has been filmed": the file's stamp, top slot, on the side the leader does not come from; gone before the cut
  if (has("stamp")) {
    const el = document.getElementById("stamp");
    el.style.left = "auto";
    el.style.right = "88px";
    const s0 = t.wide + 0.14;
    tl.fromTo("#stamp", { opacity: 0 }, { opacity: 1, duration: 0.14 }, s0);
    tl.fromTo("#stamp-main", { scale: 1.35, rotation: 0 }, { scale: 1, rotation: -3, duration: 0.2, ease: "power3.in" }, s0);
    ["#stamp-1", "#stamp-2", "#stamp-3"].forEach((sel, i) => tl.fromTo(sel, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.22, ease: "power2.out" }, s0 + 0.42 + 0.28 * i));
    tl.to("#stamp-main, #stamp .stamp__l", { opacity: 0.5, duration: 0.3 }, t.a1 - 0.18); // read: its ink steps back (the plate stays, and hides the channel behind it) — the answers are the picture now
    tl.to("#stamp", { opacity: 0, duration: 0.2 }, t.torodup - 0.32);
  }

  /* ══════════ « La tige aussi. Elle dépasse tout le reste : c'est la sienne qui le rejoint. » ══════════ */
  // almost from the front, looking up: the rod, its answer leaving the tip, the head above; the antenna's and the
  // chimney's own weak answers stay in the corner of the picture — far below
  const RISE = { tx: -180, ty: 1400, tz: 0, d: 4700, az: -8, el: -16, fov: 28, shift: 60, ...FLAT };
  const NEAR = { tx: -250, ty: 1470, tz: 10, d: 3600, az: -7, el: -15, shift: 80 };
  const GAP = { tx: -372, ty: 1618, tz: 38, d: 1100, az: -5, el: -14, shift: 120 }; // the two heads, a breath apart
  cut(t.torodup, SET.STORM, RISE, { ...STAGED, leader: 13 / N, charge: 1, upTree: 1, upChimney: 1, upAntenna: 1, fx: TIP[0], fy: TIP[1] - 80, fz: 0, fs: 320 });
  shot(t.torodup, t.last - 0.05 - t.torodup, NEAR, "sine.inOut");
  st(t.rise, t.join + 0.1 - t.rise, { up: 0.9 }, "sine.out"); // it leaves on "aussi" and never stops
  st(t.join + 0.1, t.trigger - t.join - 0.1, { up: 0.955 }, "none");
  bound(t.last, N); // "la sienne": the leader's last bound, toward it
  shot(t.last - 0.05, 1.0, GAP, "sine.inOut", NEAR.d); // …and the camera closes on what is left between them
  // (the label says "Première" in index.html: no source says which answer leaves first — it comes on only once reworded)
  if (has("chip-rep") && !/premi/i.test(document.getElementById("chip-rep").textContent)) chip("chip-rep", null, 96, 470, t.rise + 0.5, t.last - 0.3);

  /* ══════════ « Contact. Trente mille ampères. Près de trente mille degrés : cinq fois la surface du Soleil. » ══════════ */
  // ON the word. From the lawn, where the film opened: the house, the rod, the whole channel up to the cloud.
  const LAWN = { tx: -260, ty: 1500, tz: 0, d: 3600, az: -38, el: -24, fov: 62, shift: 130, side: 100, roll: 0, drift: 0.3 };
  cut(t.trigger, SET.STORM, LAWN, { ...STAGED, leader: 1, up: 1, charge: 0, cloud: 1, mood: 0 });
  shot(t.trigger, t.toreplay - t.trigger, { tx: -290, ty: 1470, d: 3050 }, "sine.inOut", LAWN.d);
  // the return stroke: its front climbs the rod's leader, then the channel, in half a second; behind it everything is white
  st(t.trigger, 0.5, { strike: 1 }, "power1.out");
  st(t.trigger, 0.07, { hot: 1.5 }, "power2.out");
  st(t.trigger + 0.55, t.again - t.trigger - 0.6, { hot: 0.72 }, "sine.out");
  // "cinq fois…": a second stroke down the same channel — one, clearly apart (a flicker would read as a fault)
  st(t.again - 0.04, 0.06, { hot: 1.35 }, "power2.out");
  st(t.again + 0.04, t.toreplay - t.again - 0.04, { hot: 0.55 }, "sine.out");
  blip("#flash", t.trigger, 0.07, 0.03, 0.4);
  if (has("chip-temp")) chip("chip-temp", storm.A.junction, 74, -6, t.heat, t.toreplay - 0.28);

  /* ══════════ « Et l'éclair que tu vois ne tombe pas : il remonte, au tiers de la vitesse de la lumière. » ══════════ */
  // played again, slower. The instant of contact: the leader down, the rod's answer up, joined. On "il remonte"
  // the white front leaves the tip of the rod and climbs to the cloud — the camera goes up with it.
  const CLIMB = 1.6;
  const strikeAt = (time) => sineIO((time - t.up2) / CLIMB);
  /** What the camera aims at for a front at s: it waits for it halfway up the rod's leader, then stays on it — `strike` is eased, the camera stops with it. */
  const lead = (s) => lerp(0.107, s, smooth(ramp(s, 0, 0.214)));
  const climb = (s) => ({ ...at3(frontAt(lead(s))), d: 1900 * Math.pow(4200 / 1900, s), az: -38, el: -24 - 10 * smooth(s), fov: 40, shift: 60 + 90 * smooth(s), ...FLAT });
  cut(t.toreplay, SET.STORM, { ...climb(0), d: 2300 }, { ...STAGED, leader: 1, up: 1, charge: 1, cloud: 0.8, mood: 0, hot: 0.3 });
  shot(t.toreplay, t.up2 - t.toreplay, climb(0), "sine.out");
  st(t.up2, CLIMB, { strike: 1 }, "sine.inOut");
  st(t.up2, 0.25, { hot: 0.95 }, "power2.out");
  // (the drops hang in the air: flown past at fifty metres a second, the shutter turns each of them into a dotted line)
  st(t.up2 - 0.1, 0.4, { rain: 0 }, "sine.out");
  // (and close under the cloud its lit heart is a white veil over the top half of the picture, the header in it: the sky steps back)
  st(t.up2 + 0.1, 0.7, { sky: 0.55 }, "sine.inOut");
  ride(t.up2, t.up2 + CLIMB, (time) => climb(strikeAt(time)));
  shot(t.up2 + CLIMB, t.todown - t.up2 - CLIMB, { d: 4400 }, "sine.out");
  st(t.up2 + CLIMB - 0.2, t.todown - t.up2 - CLIMB + 0.2, { hot: 0.5 }, "sine.out"); // the cloud flares as the front enters it, and settles
  if (has("chip-speed")) chip("chip-speed", null, 96, 470, t.third - 0.1, t.todown - 0.25);

  /* ══════════ « Le courant, lui, descend : le fil, le piquet… la terre. » ══════════ */
  // the top of the rod, the channel coming in from above. On "descend" the current leaves the tip, and the camera
  // goes down the conductor with its head: the mast, the roof, the edge, the wall — past you, at your window —
  // the ground, the stake. One move; the way the charge climbed in act 2, the other way round.
  // (wide enough to see where on the house the head is, and the head leads: it goes down the picture first, the
  // camera catches up, and the frame widens slowly all the way. Tried and dropped: the head pinned in the middle of
  // a close frame — the wall went by at 100 px a frame; a start close on the tip — the roof shrank by a fifth in 0.1 s)
  const GO = t.flow - 0.33; // it has left the tip and is on its way when the voice says "descend"…
  const DOWN = t.stake + 0.05 - GO; // …and its head reaches the stake on "piquet"
  const flowAt = (time) => STAKE_HEAD * sineIO((time - GO) / DOWN);
  const down = (f) => {
    const u = ramp(f, 0, STAKE_HEAD);
    return {
      ...at3(wireAt(f)), d: 2100 * Math.pow(3300 / 2100, smooth(ramp(f, 0.06, 0.8))), az: -48 + 6 * smooth(u), el: -4 + 10 * smooth(u),
      fov: 28, shift: lerp(440, -20, 1 - (1 - u) * (1 - u)), side: 120, roll: 0, drift: 0.3,
    };
  };
  const EARTH = { tx: -370, ty: -150, tz: 420, d: 1700, az: -40, el: 13, shift: 130, side: 60 }; // the stake and the ground around it
  cut(t.todown, SET.STORM, { ...down(0), d: 2200 }, { ...STAGED, leader: 1, up: 1, strike: 1, hot: 0.5, charge: 0, mood: 0, shell: 0.8, inside: 0.35, fx: TIP[0], fy: 1040, fz: 40, fs: 260 });
  shot(t.todown, GO - t.todown, down(0), "sine.out");
  st(t.todown, t.earth - t.todown, { hot: 0.25 }, "sine.out");
  st(GO, 0.1, { flowOn: 1.5 }, "power2.out");
  st(GO, DOWN, { flow: STAKE_HEAD }, "sine.inOut");
  ride(GO, GO + DOWN, (time) => down(flowAt(time)), share.slice(1, 5).map((f) => GO + (DOWN * Math.acos(1 - (2 * f) / STAKE_HEAD)) / Math.PI));
  st(GO, DOWN, { fy: 120, fz: 330, fs: 500 }, "sine.inOut");
  // "…la terre": down the stake, and out into the ground — the camera closes on it
  st(GO + DOWN, t.earth + 0.1 - GO - DOWN, { flow: 1 }, "sine.inOut");
  shot(GO + DOWN, 1.0, EARTH, "sine.inOut", down(STAKE_HEAD).d);
  st(GO + DOWN, 0.9, { fy: -80, fz: 420, fs: 300 }, "sine.inOut");
  st(t.earth, t.toyou - t.earth, { earth: 0.8 }, "sine.out");
  if (has("chip-cuivre")) chip("chip-cuivre", null, 96, 470, t.wire - 0.05, t.stake + 0.3);
  if (has("chip-terre")) chip("chip-terre", rod.A.stakeFoot, 70, -150, t.earth - 0.02, t.toyou - 0.13);

  /* ══════════ « Et toi ? Tu as sursauté. C'est tout. » ══════════ */
  // you, at your window, untouched. The light turns veille; on "sursauté" time runs again: the thunder, and the
  // drops that were hanging since the first sentence fall.
  const YOU = { tx: -95, ty: 130, tz: 215, d: 860, az: -14, el: 5, fov: 28, shift: 250, ...FLAT };
  cut(t.toyou, SET.STORM, YOU, { ...STAGED, leader: 1, up: 1, strike: 1, hot: 0.2, charge: 0, flow: 1, earth: 1, mood: 0, fx: -80, fy: 130, fz: 220, fs: 220 });
  shot(t.toyou, t.jump - t.toyou, { d: 790 }, "sine.out");
  shot(t.jump, t.toverdict - t.jump, { d: 1500, ty: 150, shift: 200 }, "sine.inOut", 790);
  st(t.toyou, 0.9, { gel: 0.16 }, "sine.inOut");
  jolt(t.jump, 0.45, 0.5);
  st(t.jump, 0.5, { fall: 1, rain: 3 }, "power1.in"); // (the drops are lit by `hot`: at 0.2 they need three times the amount to be seen falling)
  st(t.jump, 0.5, { drop: 200 }, "power1.in"); // (it ends at the speed the next one holds: 800 cm a second)
  st(t.jump + 0.5, t.toverdict - t.jump - 0.5, { drop: 200 + 800 * (t.toverdict - t.jump - 0.5) }, "none");
  if (has("chip-safe")) chip("chip-safe", house.A.youHead, 80, -30, t.jump + 0.4, t.toverdict - 0.16);
}
