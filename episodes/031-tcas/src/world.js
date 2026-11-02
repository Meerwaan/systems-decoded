// DOSSIER 031 — Anti-collision (TCAS) : the world. This file is the contract between the sets and the acts:
//   · plan.js  where everything stands (shared by tcas.js, cockpit.js and this file)
//   · FIRST    the state of the world on the first frame — the closed list of numbers the acts may move
//   · POSE0    the camera of the first frame, and VIEW: the poses one act hands to the next
//   · apply    what each number does to the world, every frame
//
// Two sets.
// The SKY: night, cruise, over a deck of cloud — 023's A330 like an X-ray (episodes/023-eolienne-de-secours/src/
// avion.js and its dressing, reused AS THEY ARE: never edited there), and a SECOND instance of it, the other
// airliner, head-on at your level. In each: the flight deck like an X-ray, its pilots of glass, its two screens
// (cockpit.js + tcas.js's screens), the TCAS antenna on the crown and the processor in its bay (lit from afar by a
// veille core); its lights (the other's: two landing lights in ink, its red beacon in signal). Between them, the
// waves (cockpit.js, buildOndes): the interrogation rings, the replies, the coordination pulse, and the
// controller's « descends » rising from the ground in signal.
// The BENCH: the TCAS alone on its pool of light (tcas.js) — the processor (the heart), the two directional
// antennas, the Mode S transponder, the two screens and the speaker; and, far at the left of the pool, THE OTHER
// PLANE'S transponder: the one asked, the one that answers.
//
// Three colours. signal: the threat — the other plane's beacon, the intruder's symbol at TA and RA, the red arc of
// the vertical speed scale, the controller's wave. veille: the system alive — the rings, the coordination, the
// processors' cores, the green arc, your needle once in it. ink: the rest (the planes, the decks, the landing lights).
//
// THE FRAME IS YOUR PLANE'S (plan.js): it stands still at the origin, nose −x; when you climb the world goes down.
// A model at the scale of the subject: no length is written on any of it (plan.js, `sources`).
import * as THREE from "three";
import { makeBench, setMood } from "@kit/blocks.js";
import { buildAvion } from "../../023-eolienne-de-secours/src/avion.js";
import { PLANE, SLEEPER, DECK, SCREENS, ANT, BAY, OTHER, WAVES, SYSTEM, RIG, BENCHAT, TCAS } from "./plan.js";
import { buildTcas, buildScreens, buildAntenna } from "./tcas.js";
import { buildCockpit, buildOndes } from "./cockpit.js";

const DEG = Math.PI / 180;
export const SET = { BENCH: 0, SKY: 1 };
/** ≈ the radius of the system on the bench: sizes the bench, its light, its shadows. */
export const SIZE = SYSTEM.size;
/** 023's ground under the plane at cruise, on its altimeter's scale (023 world.js groundOf: −(r + gear) − depth). */
const GROUND0 = -(282 + 300) - 30000;

/** The studio (kit/lib/stage.js, docs/recette-agents.md « Les options du plateau »). ONE line switches it off.
 *  `dof` on the CLOSE-UPS only (the poses that spread CLOSE): the screens, the side stick, a part on the bench.
 *  `air` off (a night sky: nothing to gain at 270 px until a planche shows otherwise) · `finish` the solids' grain. */
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look: the film without them
const CLOSE = { dof: LOOK.dof };

// The first frame is the hook, « Un avion fonce droit sur toi. » — PROVISIONAL (set on the bouchons): the planche of
// the six candidates in docs/031-actes.md chooses it, and it is pasted here before the acts are staged.
// Low under your nose, looking ahead and up: your nose of glass over the frame, the other plane's lights rushing at
// the camera out of the night, its red beacon; in your deck, small, the screen with the red square.
export const POSE0 = { tx: -30000, ty: 0, tz: 0, d: 37000, az: 90, el: 1.4, fov: 34, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };

export const FIRST = {
  set: SET.SKY,
  /* ── the sky (avion.js ×2, cockpit.js) ── */
  shell: 1, //    the X-ray of both planes and both decks: glass, fine lines (0–1)
  gap: 250, //    metres (drawn, a maquette) between the two noses; the other plane comes in as it drops; negative once passed
  up: 0, //       metres (drawn) you have climbed: the world goes down by as much (sea, clouds, the other plane, the ground's wave)
  down: 0, //     metres (drawn) the other plane has dived
  nose: 0, //     your pitch, degrees (+ nose up)
  nose2: 0, //    its pitch, degrees (+ nose DOWN)
  lights: 1, //   its lights in the night: two landing lights (ink) and its beacon (signal) (0–1)
  ping: 1, //     the interrogations: one ring a second out of your antenna toward the other, its reply back (0–1: how much
  //              shows). The same number drives the rings between the antenna and the peer on the bench
  coord: 0, //    « je monte »: a veille pulse from your processor to its own — 0 → 1 its head travels (0 or 1: nothing shows)
  answer: 0, //   its answer, from its processor back to yours — 0 → 1, the same way
  link: 0, //     the coordination line between the two processors, pulsing veille, slow (the fall) (0–1)
  atc: 0, //      the controller's « descends »: a signal wave rising from the ground — 0 → 1 it reaches your plane (it fades past 1, up to 2)
  cores: 1, //    the two processors lit in their bays, a veille core and its halo: what reads from afar (0–1)
  crew: 1, //     the pilots, glass, in both decks (0–1)
  pull: 0, //     your hand on the side stick: 0 neutral → 1 pulled back (« tu tires sur le manche »)
  sleeper: 0, //  023's passenger of glass at a left window, asleep, and the cabin's heads (the like) (0–1)
  /* ── the system: your screens, the other's, the bench (tcas.js) ── */
  tau: 35, //     seconds before the closest point: the processor's measure — the header's big readout, the bench's gauge
  level: 0, //    your intruder's symbol: 0 hollow diamond · 1 filled diamond · 2 the TA circle (signal) · 3 the RA square (signal)
  //              — integers only: the acts set it on the word (st with no duration)
  ra: 0, //       your order on the vertical speed scale: 0 none · +1 climb (green arc up, red below) · −1 descend (−1…1: the arcs fade)
  vs: 0, //       your vertical speed, ft/min (the needle; the scale reads −6000 … +6000)
  level2: 0, ra2: 0, vs2: 0, // the same, on the other plane's screens
  talk: 0, //     the speaker speaks: its cone moves, rings of sound (0–1)
  obey: -1, //    seconds left of the five to answer the order: the header's second readout (−1: not shown, « — »)
  explode: 0, //  on the bench: 0 gathered → 1 its parts apart, in ONE vertical frame
  beam: 0, //     the directional antenna's sector toward the other lit (« il écoute l'autre machine ») (0–1)
  litAnt: 0, litXpdr: 0, litCpu: 0, litPeer: 0, litScreen: 0, // the part the voice is naming glows faintly veille (bench)
  /* ── the light ── */
  // what it stands around (`fx, fy, fz`) and `fs` its size; `mood` 0 veille → 1 signal (held frank: 0 or 1);
  // `gel` a signal light over the whole scene (it multiplies: black stays black); the bench's pool and grid
  fx: PLANE.cockpit, fy: 60, fz: 0, fs: 1400, mood: 1, gel: 0, pool: 0.2, grid: 0.16,
};

/** The poses one act hands to the next (complete: nothing is inherited across a cut). PROVISIONAL, set on BOUCHONS
 *  (plain grey volumes): the builders give better ones in their journals (docs/journal/031-tcas.md, 031-cockpit.md).
 *  Sky poses are written in your plane's frame (it never moves); `profile` and `chase` assume the gap of their
 *  comment — an act that frames the pair at another gap moves `tx` with it (otherPos below gives the other's centre). */
// every pose says its lens (0, a pinhole; the close-ups spread CLOSE): a cut never inherits the blur of the shot before
const P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 };
const [NDX, NDY] = [DECK.panel.x, DECK.panel.y];
export const VIEW = {
  hook: POSE0,
  /* ── the sky ── */
  // over the captain's shoulder: the windscreen, the other's lights in it, the glare shield, the two screens below
  shoulder: { ...P, tx: -2700, ty: 45, tz: 50, d: 266, az: 94, el: 12, fov: 50, shift: 0 },
  // the ND, close: your plane's symbol, the intruder's (the diamond → the red square)
  nd: { ...P, ...CLOSE, tx: NDX, ty: NDY, tz: SCREENS.nd.z, d: 62, az: 78, el: 14, shift: 120 },
  // the captain's side stick and the hand of glass on it (« tu tires sur le manche »)
  stick: { ...P, ...CLOSE, tx: DECK.stick.x, ty: DECK.stick.y + 10, tz: DECK.stick.z, d: 80, az: 20, el: 18, shift: 80 },
  // HIS ND through his windscreen, close — written for gap 0: always place it with atHim(VIEW.hisNd, S)
  hisNd: { ...P, ...CLOSE, tx: OTHER.x0 - DECK.panel.x, ty: DECK.panel.y, tz: -SCREENS.nd.z, d: 62, az: -102, el: 14, shift: 120 },
  // the PFD's vertical speed scale, close: the arcs, the needle
  vsi: { ...P, ...CLOSE, tx: NDX, ty: NDY, tz: SCREENS.pfd.z + 7, d: 46, az: 72, el: 12, shift: 120 },
  // your forward fuselage like an X-ray, from above, three quarters: the deck, the antenna on the crown, the bay — the
  // system lit in it, all else dim. Act 2 cuts to the bench from it, at the same azimuth (whole).
  fuselage: { ...P, tx: -2300, ty: 50, tz: 0, d: 3000, az: -40, el: 25, fov: 30, shift: 120 },
  // the pair from the side, three quarters, wide: both planes, nose to nose (written for gap ≈ 100: the frame is
  // 17° wide at fov 30 — a wider gap needs a longer d, a smaller plane)
  profile: { ...P, tx: -7900, ty: -300, tz: 0, d: 80000, az: -12, el: 3, fov: 30, shift: 60 },
  // behind your tail, over the fin: your fuselage and fin in the foreground, the other plane ahead beyond your nose (gap ≈ 300)
  chase: { ...P, tx: -30000, ty: 0, tz: 0, d: 37000, az: 90, el: 2.3, fov: 34, shift: 0 },
  // the fall: both planes stacked at the crossing, the two cores and the line between them (gap ≈ −60, up 30, down 30)
  pair: { ...P, tx: 0, ty: -3000, tz: 0, d: 20000, az: -25, el: 4, fov: 30, shift: 40 },
  // the like: your cabin, the sleeper at the left window, the crown above him
  cabin: { ...P, tx: SLEEPER.at[0], ty: 40, tz: 150, d: 900, az: -20, el: 14, fov: 34, shift: 100 },
  /* ── on the bench (the processor at the origin) ── */
  whole: { ...P, tx: 6.5, ty: -2, tz: 5.5, d: 450, az: -40, el: 16, fov: 30, shift: 160 },
  // the exploded view, in ONE vertical frame, the peer at the left edge
  exploded: { ...P, tx: -16.1, ty: 4, tz: -13.5, d: 590, az: -40, el: 16, fov: 30, shift: 140 },
  cpuBench: { ...P, ...CLOSE, tx: -10, ty: 1, tz: 2, d: 150, az: -58, el: 12, shift: 100 },
  antBench: { ...P, ...CLOSE, tx: 0, ty: 30, tz: 0, d: 120, az: -40, el: 30, shift: 0 },
  ndBench: { ...P, ...CLOSE, tx: 15.2, ty: -19, tz: 44.1, d: 72, az: -40, el: 16, shift: 80 },
  vsiBench: { ...P, ...CLOSE, tx: -4.1, ty: -19, tz: 27.9, d: 50, az: -40, el: 16, shift: 80 },
  speakerBench: { ...P, ...CLOSE, tx: 22, ty: 15, tz: 42, d: 80, az: -40, el: 14, shift: 60 },
  peerBench: { ...P, ...CLOSE, tx: -57.9, ty: 46, tz: -61.7, d: 140, az: -30, el: 12, shift: 100 },
};
/** The other plane's centre for a state (your frame): where an act aims the pair. */
export const otherPos = (S) => [OTHER.x0 - S.gap * 100, -(S.up + S.down) * 100, 0];
/** A pose written around the other plane at gap 0 (VIEW.hisNd), moved to where it stands in state S. */
export const atHim = (pose, S) => {
  const [x, y] = otherPos(S);
  return { ...pose, tx: pose.tx + x - OTHER.x0, ty: pose.ty + y };
};

/** What a cut to the bench sets, whatever came before: the system alone, nothing of the sky. `tau`, `level`, `ra`,
 *  `vs`, `obey` keep their story values (the header and the screens go on reading the moment). */
export const BENCHED = {
  shell: 0, ping: 0, coord: 0, answer: 0, link: 0, atc: 0, cores: 0, crew: 0, pull: 0, sleeper: 0, lights: 0,
  talk: 0, explode: 0, beam: 0, litAnt: 0, litXpdr: 0, litCpu: 0, litPeer: 0, litScreen: 0,
  mood: 0, gel: 0, pool: 0.2, grid: 0.16, fx: RIG.cpu[0], fy: RIG.cpu[1], fz: RIG.cpu[2], fs: SIZE,
};
/** What a cut to the sky sets: night, both planes level and head-on, their lights on, the pilots in their seats,
 *  nothing between them. `gap`, `up`, `down`, `tau` and the screens are the act's. */
export const STAGED = {
  shell: 1, nose: 0, nose2: 0, lights: 1, ping: 0, coord: 0, answer: 0, link: 0, atc: 0, cores: 0, crew: 1, pull: 0,
  sleeper: 0, talk: 0, explode: 0, beam: 0, litAnt: 0, litXpdr: 0, litCpu: 0, litPeer: 0, litScreen: 0,
  mood: 1, gel: 0, fx: PLANE.cockpit, fy: 60, fz: 0, fs: 1400,
};

/** 023 paints its control surfaces veille (alive) or signal (dead): neither means anything here. Found once by their
 *  colour after an update with surf 1, they are put back to plain ink after each update (023's file is not touched). */
function quieten(avion) {
  avion.update({ surf: 1, engines: 2, fuel: 1, lines: 1 });
  const emiss = new THREE.Color(0x5cffb0).multiplyScalar(0.3);
  const edge = new THREE.Color(0x5cffb0).multiplyScalar(1.15);
  const near = (c, k) => Math.abs(c.r - k.r) + Math.abs(c.g - k.g) + Math.abs(c.b - k.b) < 0.02;
  const mats = [];
  const lines = [];
  avion.group.traverse((o) => {
    for (const m of [].concat(o.material || [])) {
      if (m.emissive && near(m.emissive, emiss)) mats.push(m);
      else if (m.isLineMaterial && m.color && near(m.color, edge)) lines.push(m);
    }
  });
  const INKDIM = new THREE.Color(0xe9e4d8).multiplyScalar(0.55);
  return () => {
    for (const m of mats) m.emissive.setRGB(0, 0, 0);
    for (const m of lines) m.color.copy(INKDIM);
  };
}

/** One A330 of 023 dressed for this film: its deck, its screens, its antenna, mounted on the plane (they pitch with it). */
function rig(avion, { other }) {
  const plane = avion.A.nose.parent; // 023's `plane` group: pitch and bank turn it
  const deck = buildCockpit({ other });
  plane.add(deck.root);
  const side = [1, -1].map((s) => {
    const sc = buildScreens({ side: s });
    sc.root.position.set(DECK.panel.x, DECK.panel.y, SCREENS.nd.z * s);
    sc.root.rotation.z = DECK.panel.tilt * DEG;
    plane.add(sc.root);
    return sc;
  });
  const ant = buildAntenna();
  ant.root.position.set(...ANT.top);
  plane.add(ant.root);
  const antLow = buildAntenna();
  antLow.root.position.set(...ANT.bottom);
  antLow.root.rotation.x = Math.PI; // under the belly, upside down
  plane.add(antLow.root);
  return { plane, deck, screens: side, ant, antLow };
}

export function buildWorld(stage) {
  const { scene } = stage;
  /* the sky: your plane (with its world: the sea, the cloud deck, the stars) and the other one (the plane alone) */
  const you = buildAvion();
  const him = buildAvion();
  // 023's island and its runway are not in this film: everything of the island's group but the cloud deck (023's
  // dressing, renderOrder 5) is hidden — the deck rides with it, and goes down with `up`
  const island = you.A.island.parent;
  for (const c of island.children) if (!(c.isMesh && c.renderOrder === 5)) c.visible = false;
  // the other plane: its own world (island, stars, dome, streaks) never shows — only its plane
  const hisPlane = him.A.nose.parent;
  for (const c of him.group.children) if (c !== hisPlane) c.visible = false;
  him.group.rotation.y = Math.PI; // head-on: its nose toward +x
  const quietYou = quieten(you);
  const quietHim = quieten(him);
  const mine = rig(you, { other: false });
  const his = rig(him, { other: true });
  const ondes = buildOndes();
  const sky = new THREE.Group();
  sky.add(you.group, him.group, ondes.group);

  /* the bench */
  const system = buildTcas();
  const bench = makeBench(SIZE);
  system.root.position.set(...BENCHAT);
  bench.group.add(system.root);
  scene.add(sky, bench.group);
  stage.grade.gel.set(0xff5b2e);

  // world positions the waves need, every frame (no allocation in apply)
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const ca = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const atcFrom = new THREE.Vector3();
  const W = {}; // what ondes.update receives (reused)
  // the ping ring and the red light beat once a second: on the loop cut the sky clock jumps by the film's
  // fractional second, so the last image shows them in the same phase as the first (the jump hides in the cut)
  const EPI = typeof window !== "undefined" ? window.__EPISODE : null;
  const LOOP = { at: 91.39, by: (Number(EPI?.duration) || 93.5) % 1 };

  return {
    you, him, mine, his, ondes, system, bench, sky,
    /** Every frame (and several times per frame: it depends on S and `time` only). */
    apply(S, time) {
      if (time >= LOOP.at) time -= LOOP.by;
      const onBench = S.set === SET.BENCH;
      const px = stage.pixelScale();
      bench.group.visible = onBench;
      sky.visible = !onBench;
      if (onBench) {
        system.update({
          explode: S.explode, tau: S.tau, level: S.level, ra: S.ra, vs: S.vs, talk: S.talk, ping: S.ping, beam: S.beam,
          litAnt: S.litAnt, litXpdr: S.litXpdr, litCpu: S.litCpu, litPeer: S.litPeer, litScreen: S.litScreen, mood: S.mood,
        }, time, px);
        bench.set({ pool: S.pool, grid: S.grid, mood: S.mood });
      } else {
        const ground = GROUND0 - S.up * 100;
        you.update({ ground, threshold: -80000, pitch: S.nose, shell: S.shell, engines: 2, fuel: 1, lines: 1, press: 0, surf: 1, you: S.sleeper, pax: S.sleeper, mood: S.mood }, time, px);
        him.update({ ground, threshold: -80000, pitch: -S.nose2, shell: S.shell, engines: 2, fuel: 1, lines: 1, press: 0, surf: 1, you: 0, pax: 0, mood: S.mood }, time, px);
        quietYou();
        quietHim();
        const [ox, oy, oz] = otherPos(S);
        him.group.position.set(ox, oy, oz);
        // the decks and their screens: yours, his
        mine.deck.update({ shell: S.shell, crew: S.crew, pull: S.pull, cores: S.cores, lights: 0 }, time, px);
        his.deck.update({ shell: S.shell, crew: S.crew, pull: 0, cores: S.cores, lights: S.lights }, time, px);
        for (const sc of mine.screens) sc.update({ level: S.level, ra: S.ra, vs: S.vs, tau: S.tau, shell: S.shell }, time, px);
        for (const sc of his.screens) sc.update({ level: S.level2, ra: S.ra2, vs: S.vs2, tau: S.tau, shell: S.shell }, time, px);
        mine.ant.update({ beam: S.beam, lit: 0 }, time, px);
        his.ant.update({ beam: 0, lit: 0 }, time, px);
        mine.antLow.update({ beam: 0, lit: 0 }, time, px);
        his.antLow.update({ beam: 0, lit: 0 }, time, px);
        // the waves: between the two crown antennas, the two processors; the ground's wave from far below
        mine.ant.root.getWorldPosition(a);
        his.ant.root.getWorldPosition(b);
        mine.deck.A.cpu.getWorldPosition(ca);
        his.deck.A.cpu.getWorldPosition(cb);
        atcFrom.set(WAVES.atc.from[0], WAVES.atc.from[1] - S.up * 100, WAVES.atc.from[2]);
        W.ping = S.ping; W.coord = S.coord; W.answer = S.answer; W.link = S.link; W.atc = S.atc; W.mood = S.mood; W.a = a; W.b = b; W.ca = ca; W.cb = cb; W.atcFrom = atcFrom;
        ondes.update(W, time, px);
      }
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      stage.grade.gelAmount = S.gel;
      setMood(stage, S.mood, onBench ? 0 : S.mood * 0.3);
      const d = stage.pose?.d ?? stage.cam.d;
      scene.fog.density = onBench ? bench.fog(d) : 0.45 / Math.max(60000, d * 2.4);
    },
  };
}

export { PLANE, SLEEPER, DECK, SCREENS, ANT, BAY, OTHER, WAVES, SYSTEM, RIG, BENCHAT, TCAS };
