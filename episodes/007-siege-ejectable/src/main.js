// DOSSIER 007 — Siège éjectable. Two sets:
//   the SKY (a two-seat Rafale seen like an X-ray — src/jet.js — with, solid inside it, its two seats: the pilot's,
//   in front, never leaves; yours, behind, is the seat of the story) and the BENCH (that same seat, taken apart).
//   The seat of the story is ONE object (`hero`): bolted in the rear place, flying on its own once out (`free`),
//   or standing on the bench — the cut from the aircraft to the bench matches on the same thing at the same place.
// "Tu" is the passenger of the rear seat (Saint-Dizier, 20 March 2019).
//   01 MENACE: the take-off → your hand on the handle → two seconds later, under a parachute; the pilot still aboard
//   → back in time: 200 m, 520 km/h, the aircraft levels off, you come off the seat, you hold on. Time stops.
//   02 AUTOPSIE on the bench (and one look up at the canopy). 03 RÉPONSE from "Zéro": two seconds, slowed down.
// The story clock: T+0,0 s, held until "Zéro", then two seconds stretched over the third act. The second counter of
// the header is what the body weighs: +1 g, +3,8 g in the climb, −0,6 g when the aircraft levels off (that is why
// you come off the seat), 18 g when the gun fires, then nothing.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool } from "@kit/atmo.js";
import { setPartOpacity } from "@kit/build3d.js";
import { buildCaptions, buildHook, createCallouts, setAct, brandHud, rail, likeNet, typeAnswer } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildSeat, seatOccupant, SEAT } from "./model.js";
import { buildJet, JET } from "./jet.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const DEG = Math.PI / 180;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const BENCH = 0;
const SKY = 1;
const C30 = Math.cos(SEAT.tilt * DEG);
const S30 = Math.sin(SEAT.tilt * DEG);
/** A point of the aircraft (its own frame) → the set, once the nose is `pitch` degrees up. */
const inJet = ([x, y, z], pitch = 0) => {
  const c = Math.cos(pitch * DEG);
  const s = Math.sin(pitch * DEG);
  return { tx: x, ty: y * c + z * s, tz: -y * s + z * c };
};
/** A value along [time, value] keys, straight from one to the next. */
const along = (keys, time) => {
  if (time <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / Math.max(1e-6, keys[i][0] - keys[i - 1][0]));
  }
  return keys.at(-1)[1];
};

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { fog: 0.00002, scale: 170, far: 60000, keySize: 2.5 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets `look` and the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const jet = buildJet();
  const hero = buildSeat({ stand: true }); // the seat of the story: yours. Its trestle shows on the bench only
  const toi = seatOccupant();
  hero.sit(toi);
  const front = buildSeat(); // the pilot's: it never leaves
  const pilote = seatOccupant();
  front.sit(pilote);
  front.root.position.set(...JET.seatFront);
  jet.plane.add(front.root);
  front.pose({ bones: 0 }, 0);
  const rearBay = new THREE.Group(); // the rear place: it pitches with the aircraft
  rearBay.position.set(...JET.seatRear);
  jet.plane.add(rearBay);
  const air = new THREE.Group(); // the same place once the seat is `free`: it stays where the seat left (the aircraft must be level then)
  air.position.set(...JET.seatRear);
  jet.group.add(air);

  const surface = makeSurface({ radius: 3000, cell: 25, fade: 420, lift: 4 });
  surface.group.children[0].material.roughness = 1; // seen at a grazing angle, a floor with any gloss mirrors the rim light: a green slab
  const pool = makePool({ radius: 125 });
  const bench = new THREE.Group();
  bench.add(surface.group, pool.mesh);
  scene.add(jet.group, bench);
  // what leaves with the seat when it lets go of you (the harness, the pack and the main parachute stay with you)
  const BODY = ["gun", "back", "pan", "rocket", "handle", "headbox", "brain", "pipes", "legs", "drogue"].map((name) => hero.parts[name]);
  hero.fx.loop.emissive = SIGNAL.clone();
  hero.fx.loop.emissiveIntensity = 0;
  /** The part the voice is naming glows faintly veille (`alarm`, the handle's own glow, is signal). */
  const lightUp = (part, k) => {
    for (const mat of part.userData.part.mats) {
      if (!mat.isMeshStandardMaterial) continue;
      mat.emissive.copy(VEILLE);
      mat.emissiveIntensity = 0.2 * k;
    }
  };

  /* ───────────────────────────── state ───────────────────────────── */
  // The first frame is the hook: the Rafale has just left the runway, nose up, wheels still down, both nozzles alight —
  // and under the canopy, behind the pilot, TOI.
  const POSE0 = { tx: 0, ty: 322, tz: 350, d: 780, az: -60, el: 2, fov: 48, shift: 210, side: 0, roll: 0, drift: 0 };
  const FIRST = {
    set: SKY,
    // the aircraft (see jet.js) — `jetZ`: how far ahead of the set's origin it has flown (cm); `world`: the ground and the sky;
    // `glass`: the canopy's glass (−1: it follows `shell`); `frame`: its solid arches and sills; `cockpit`: the floor, the
    // panels, the bulkheads; `consoles`: the four side consoles alone; `cabin`: the pilot and his seat
    // (no solid frame on the first frame: the camera is about to fly through the canopy, and a tube sweeping across the
    // lens was the second roughest instant of the draft — the glass and its lines draw the canopy without it)
    // (`glass` at 1 is what −1 gives while `shell` is 1 — and a number that can be tweened from: on its way from −1 to
    // 0.12 the canopy jumped from "follows the shell" to nothing as it crossed zero)
    pitch: 13, roll: 0, alt: 260, gear: 1, thrust: 1, shell: 1, glass: 1, frame: 0, cockpit: 1, consoles: 1, cabin: 1, cord: 0, cut: 0, jetZ: 0, world: 1, streaks: 1,
    // the seat of the story (see model.js) — `hero`: is it there at all; `seat`: its body (0: only what stays with you);
    // `rider`: you; `free`: 1 once it has left its rails — then `sx, sy, sz` (cm, the set's axes) and `srx` (degrees) fly it
    hero: 1, seat: 1, rider: 1, free: 0, sx: 0, sy: 0, sz: 0, srx: 0,
    // `ride`: how much of the seat's own travel the camera and the light take with them (1: the seat keeps its place in
    // the picture, the aircraft leaves); `drop`: how far the seat has fallen once it has let go of you (cm);
    // `trail`, `hang`: how far the small and the large parachute stream toward the tail (degrees from the vertical)
    // `glow`: how bright the gas shows in its pipes; `gust`: 1 gathers the streaks of air around the seat;
    // `ghost`: 1 turns your head and hands to glass and takes the helmet away (set on a cut: only the spine is solid then)
    // `gel`: a veille light over the whole scene, once the parachute is open (it multiplies: black stays black)
    ride: 0, drop: 0, trail: 0, hang: 0, glow: 1, gust: 0, ghost: 0, gel: 0,
    explode: 0, handle: 0, gas: 0, harness: 0, gun: 0, burn: 0, drogue: 0, release: 0, chute: 0, brain: 0, timer: 0,
    float: 0, grip: 0, spine: 0, bones: 0, upright: 0, alarm: 0.7, litGun: 0, litRocket: 0, litPowder: 0, // (the handle glows from the first frame: it is the one thing in there that is waiting)
    // the light: what it stands around (`fx, fy, fz`, and `fs` its size), `mood` 0 veille → 1 signal, the bench's pool and grid
    fx: 0, fy: 300, fz: 280, fs: 170, mood: 1, pool: 0.2, grid: 0.16,
  };
  const S = { ...FIRST, shake: 0 };
  // What the shots move is `C`. The camera itself is C plus — when it rides (`ride`) — the seat's own travel: a shot
  // is then written once, around the seat where it sits in the aircraft, and holds while the seat flies.
  const C = { ...cam, ...POSE0 };
  Object.assign(cam, C);
  const STROKE = [SEAT.stroke * C30, -SEAT.stroke * S30]; // what the gun's full stroke adds to the seat: up, and toward the tail
  window.SD.S = S; // for the trial frames

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage, below)
  tl.to({}, { duration: END }, 0);
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const now = (at, props) => tw.set(S, props, at);
  const shots = [];
  /**
   * A move of the camera. `fromD`: for a dive or a long pull-back, the distance it leaves from — the distance then
   * changes by ratio, not by centimetres, and the point it aims at moves with the distance.
   */
  const shot = (at, dur, pose, ease = "power2.inOut", fromD = null) => shots.push({ at, dur, pose, ease, fromD });
  /** A cut: the picture jumps to another set (or another angle) on one frame. `pose` must be complete. */
  const cut = (at, set, pose, state = {}) => {
    stage.cut(at);
    now(at, { set, ...state });
    shots.push({ at, cut: true, pose: { roll: 0, side: 0, fov: 28, drift: 1, ...pose } });
  };
  const jolt = (at, k, dur = 0.5) => {
    st(at, 0.04, { shake: k }, "power2.out");
    st(at + 0.04, dur, { shake: 0 }, "power2.out");
  };
  const blip = (el, at, peak, up = 0.05, down = 0.5) => {
    tl.to(el, { opacity: peak, duration: up }, at);
    tl.to(el, { opacity: 0, duration: down }, at + up);
  };
  const show = (sel, at, dur = 0.3) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: dur }, at);
  const hide = (sel, at, dur = 0.2) => tl.to(sel, { opacity: 0, duration: dur }, at);
  /** The same picture from the same place, aimed at a nearer point of the same line of sight: where the next move should leave from. */
  const reaim = (pose, d) => {
    const az = pose.az * DEG;
    const el = pose.el * DEG;
    const k = pose.d - d;
    return { roll: 0, side: 0, ...pose, d, tx: pose.tx + k * Math.sin(az) * Math.cos(el), ty: pose.ty + k * Math.sin(el), tz: pose.tz + k * Math.cos(az) * Math.cos(el) };
  };
  const seen = new Set();
  /** A panel of the top slot, from `at` to `until`. */
  const panel = (sel, at, until) => {
    tl.fromTo(sel, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", immediateRender: !seen.has(sel) }, at);
    tl.to(sel, { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, until);
    seen.add(sel);
  };
  void reaim;

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    rafale: T.at("accroche:Rafale"), decollage: T.at("accroche:décollage"), main: T.at("accroche:main"), agrippe: T.at("accroche:agrippe"), poignee: T.at("accroche:poignée"), mauvaise: T.at("accroche:mauvaise"),
    promesse: T.at("promesse"), parachute: T.at("promesse:parachute"), ton: T.at("promesse:Ton"), pilote: T.at("promesse:pilote"), jamais: T.at("promesse:jamais"), promesseEnd: T.at("promesse$"),
    vrai: T.at("vrai"), mars: T.at("vrai:Mars"), dizier: T.at("vrai:Saint"), vraiEnd: T.at("vrai$"),
    scene: T.at("scene"), sol: T.at("scene:sol"), kmh: T.at("scene:500"), avion: T.at("scene:L'avion"), plat: T.at("scene:plat"), tu: T.at("scene:tu"), decolles: T.at("scene:décolles"), et: T.at("scene:et"), accroches: T.at("scene:t'accroches"), sceneEnd: T.at("scene$"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    eclate: T.at("eclate"), dos: T.at("eclate:dos"), canon: T.at("eclate:canon"), sous: T.at("eclate:Sous"), fusee: T.at("eclate:fusée"), auDessus: T.at("eclate:Et"), tete: T.at("eclate:tête"), verriere: T.at("eclate:verrière"), souvrira: T.at("eclate:s'ouvrira"), eclateEnd: T.at("eclate$"),
    cerveau: T.at("cerveau"), partir: T.at("cerveau:partir"), ordre: T.at("cerveau:l'ordre"), imagines: T.at("cerveau:Tu"), ordinateur: T.at("cerveau:ordinateur"), cerveauEnd: T.at("cerveau$"),
    zero: T.at("zero"), tire: T.at("zero:tire"),
    harnais: T.at("harnais"), cordon: T.at("harnais:cordon"),
    canonPart: T.at("canon:part"), g18: T.at("canon:18"), fois18: T.at("canon:18#2"),
    fusee2: T.at("fusee"), sousSiege: T.at("fusee:Sous"), fuseeMot: T.at("fusee:fusée"),
    dehors: T.at("dehors"), dehorsMot: T.at("dehors:dehors"), kmh2: T.at("dehors:500"),
    lache: T.at("lache"), redresse: T.at("lache:redresse"), lache15: T.at("lache:1,5"), lacheMot: T.at("lache:lâche"),
    deux: T.at("deux"), ouvert: T.at("deux:Parachute"), vivant: T.at("deux:vivant"),
    prix: T.at("prix"), jusqua: T.at("prix:jusqu'à"), vertebre: T.at("prix:vertèbre"),
    chute: T.at("chute"), sauve: T.at("chute:sauve"), na: T.at("chute:n'a"), pasOrdi: T.at("chute:pas"), gaz: T.at("chute:gaz"), poudre: T.at("chute:poudre"), minuteries: T.at("chute:minuteries"),
    like: T.at("like"), likeMot: T.at("like:Like"), likeEnd: T.at("like$"),
    abo: T.at("abo"), prochain: T.at("abo:prochain"), attend: T.at("abo:attend"), aboEnd: T.at("abo$"),
    comment: T.at("comment"), sonSiege: T.at("comment:Son"), ilAPose: T.at("comment:il"), commentaire: T.at("comment:commentaire"), tuYVas: T.at("comment:tu"),
    boucle: T.at("boucle"), rewind: T.at("rewind"),
  };
  // the cuts, and the instant the film starts running backwards: the sound reads the same cues (episode.json)
  const toChute = T.at("tochute");
  const toPilot = T.at("topilot");
  const tRew = T.at("back");
  const toSeat = T.at("toseat");
  const tFreeze = T.at("freeze");
  const toBench = t.explode - 0.14;
  const toCanopy = T.at("tocanopy");
  const toGas = T.at("togas");
  // 03 RÉPONSE and after
  const toZero = t.zero - 0.12;
  const tPull = T.at("pull");
  const toPlaque = T.at("toplaque");
  const tPlaque = T.at("plaque");
  const toCord = T.at("tocord");
  const tSlice = T.at("slice");
  const toGun = T.at("togun");
  const tFire = T.at("fire");
  const toRocket = T.at("torocket");
  const tBurn = T.at("burn");
  const toOut = T.at("toout");
  const toDrogue = T.at("todrogue");
  const tDrogue = T.at("drogue");
  const tLetGo = T.at("letgo");
  const toOpen = T.at("toopen");
  const tOpen = T.at("open");
  const toPrix = T.at("toprix");
  const toVerdict = T.at("toverdict");
  const toCta = T.at("tocta");
  const toLanding = T.at("tolanding");
  const tTouch = T.at("touch");
  const toLoop = T.at("toloop");
  const tEnd = END - 0.07; // everything is back to the first frame two frames before the end: the last picture is the first one

  /* ───────────────────────── the ground going by, the clock, the weight ─────────────────────────
     How fast the world goes by, in cm per second of FILM, key by key (straight from one to the next). Below zero:
     the film runs backwards. From `toLoop` on it runs again at the speed of the first frame, to the very place it left. */
  const VEL = [
    [0, 7200], [toChute - 0.01, 7200], [toChute, 160], [toPilot - 0.01, 160], [toPilot, 9500], [tRew, 9500],
    [tRew + 0.35, -14000], [tRew + 1.5, -14000], [tRew + 2.2, 11000], [t.sceneEnd - 0.2, 11000], [tFreeze, 0],
    // 03: time starts again, some forty times slower than life — then less and less slow. On "à 500 km/h" the air goes
    // by at its true speed (a thing whose speed is the subject is shown at the speed it has); the parachutes then brake it
    [t.zero, 0], [t.zero + 0.4, 320], [tBurn, 420], [toOut, 2400], [toOut + 1.3, 9000], [toDrogue, 9000], [t.lache15, 3200], [tOpen, 1200], [tOpen + 1.2, 160], [toLanding - 0.01, 160],
    // the pilot brings it back: short final, the wheels on the runway, the roll-out
    [toLanding, 6400], [tTouch, 6000], [toLoop - 0.01, 2800],
  ];
  const T0 = 60000; // the runway under the wheels at the first frame: 600 m of it behind, 1,5 km ahead
  // where the wheels come down, 180 m past the threshold: its keys go by under the aircraft as the shot opens, wide —
  // 120 m sooner, they were a grey band across the close shot of the cockpit
  const TOUCH = -11500;
  const cum = [0];
  for (let i = 1; i < VEL.length; i++) cum.push(cum[i - 1] + ((VEL[i][0] - VEL[i - 1][0]) * (VEL[i][1] + VEL[i - 1][1])) / 2);
  const velAt = (time) => (time >= toLoop ? VEL[0][1] : along(VEL, time));
  /** The ground covered from the first frame to `time`, as the table says. */
  const covered = (time) => {
    if (time <= 0) return time * VEL[0][1];
    let i = 1;
    while (i < VEL.length - 1 && VEL[i][0] <= time) i++;
    const from = VEL[i - 1];
    const u = Math.min(time, VEL[i][0]);
    return cum[i - 1] + ((u - from[0]) * (from[1] + along(VEL, u))) / 2;
  };
  const approach = TOUCH - covered(tTouch); // the landing is another place: the ground jumps there on the cut
  const travelAt = (time) => (time >= toLoop ? T0 + (time - END) * VEL[0][1] : time >= toLanding ? approach + covered(time) : T0 + covered(time));
  // the story clock (seconds since the handle was pulled) and what you weigh (g)
  const CLOCK = [[t.zero, 0], [t.fusee2, 0.2], [tBurn, 0.24], [t.dehors, 0.5], [t.lache15, 1.5], [t.deux, 2]];
  const WEIGHT = [[0, 1], [tRew + 1.4, 1], [t.scene - 0.1, 3.8], [t.avion - 0.1, 3.8], [t.plat + 0.25, -0.6], [t.canonPart, -0.6], [t.g18, 18]];
  const weightOff = t.fusee2 - 0.3; // after the gun, nothing: you are out
  const stamp = (s) => `T+${s.toFixed(1).replace(".", ",")} s`;
  const weigh = (g) => `${g < -0.04 ? "−" : "+"}${Math.abs(g) >= 9.95 ? Math.round(Math.abs(g)) : Math.abs(g).toFixed(1).replace(".", ",")} g`;

  const co = createCallouts(stage, $("callouts"), $("leaders"));
  const chips = []; // [element, anchor, dx, dy]: placed every frame on a point of the scene (or fixed, without an anchor)
  const follow = (id, anchor, dx, dy) => chips.push([$(id), anchor, dx, dy]);

  /* ════════════════════ 01 · MENACE ════════════════════ */
  setAct(tl, 1, 0);
  // A — "on t'offre un vol en Rafale. au décollage, ta main agrippe une poignée : la mauvaise."
  // one move from the very first frame: the camera flies to the rear place, through the glass, down to your hand
  st(0, 4.9, { alt: 2400 }, "sine.in");
  st(0, 2.6, { pitch: 15 }, "sine.out");
  st(1.5, 2.2, { gear: 0 });
  const HAND = { ...inJet([-2, 246, 389], 15), d: 150, az: -48, el: 36, fov: 34, shift: 230, side: 40, drift: 0 };
  shot(0, 3.25, HAND, "sine.inOut", POSE0.d);
  st(0.9, 2.3, { fx: HAND.tx, fy: HAND.ty, fz: HAND.tz, fs: 60 }, "sine.inOut");
  shot(3.25, toChute - 3.25, { d: 128, az: -42 }, "sine.inOut");
  // once through the glass, the aircraft steps back: a ghost around your hand, not a veil over it
  st(1.4, 1.2, { shell: 0.3, glass: 0.12 }, "sine.inOut");
  follow("chip-toi", toi.A.head, -44, -120);
  tl.set("#chip-toi", { opacity: 1 }, 0);
  hide("#chip-toi", 0.55, 0.2);
  st(t.agrippe - 0.2, 0.75, { grip: 1 }, "power2.inOut");
  st(T.at("wrong"), 0.25, { alarm: 1.1 }, "power2.out");
  follow("chip-handle", hero.A.handle, -420, -250);
  show("#chip-handle", t.mauvaise - 0.05, 0.15);
  hide("#chip-handle", toChute - 0.12, 0.1);

  // B — "deux secondes après, tu es sous un parachute." — a cut: you, hanging; the aircraft flies on
  const CHUTE = { tx: 0, ty: 1100, tz: 0, d: 4500, az: 172, el: 1, fov: 28, shift: 170, side: 0, drift: 0.3 };
  cut(toChute, SKY, CHUTE, {
    pitch: 0, alt: 20000, gear: 0, cut: 1, jetZ: 3200, mood: 0, shell: 1, glass: -1, frame: 1,
    seat: 0, free: 1, sy: 435, sz: -293, gun: 1, release: 1, chute: 1, upright: 1, harness: 1, grip: 0, alarm: 0,
    fx: 0, fy: 1000, fz: 0, fs: 420,
  });
  st(toChute, toPilot - toChute, { jetZ: 9500 }, "none");
  shot(toChute, toPilot - toChute, { d: 4150, az: 174 }, "sine.inOut");
  follow("chip-you", toi.A.head, 56, -34);
  show("#chip-you", toChute + 0.25, 0.2);
  hide("#chip-you", toPilot - 0.14, 0.1);

  // C — "ton pilote, lui… n'est jamais sorti." — the aircraft, its canopy cut open: the front seat is still there
  const PILOT = { tx: 0, ty: 285, tz: 410, d: 1000, az: -62, el: 20, fov: 28, shift: 160, side: 50, drift: 0.3 };
  cut(toPilot, SKY, PILOT, { jetZ: 0, hero: 0, mood: 1, shell: 0.5, fx: 0, fy: 250, fz: 430, fs: 170 });
  shot(toPilot, tRew + 0.55 - toPilot, { d: 860, az: -55, tz: 425 }, "sine.inOut");
  follow("chip-pilot", pilote.A.head, -430, -230);
  show("#chip-pilot", t.pilote + 0.1, 0.2);
  hide("#chip-pilot", tRew - 0.05, 0.15);

  // "c'est arrivé. mars 2019, à Saint-Dizier." — the film runs backwards: the seat comes back down its rails, the
  // shards find their pane again, the aircraft is whole — and climbing
  now(tRew, { hero: 1, seat: 1, rider: 1, free: 0, release: 0, chute: 0, upright: 0, sy: 900, sz: 0 });
  st(tRew, 0.45, { sy: 0 }, "power2.out");
  st(tRew + 0.4, 0.55, { gun: 0 }, "power2.out");
  st(tRew + 0.15, 0.6, { cut: 0 }, "none");
  st(tRew + 0.9, 0.4, { harness: 0 });
  // from behind and above: the delta, its two nozzles alight, the ground going by far below
  const WIDE = { tx: 0, ty: 230, tz: 60, d: 3800, az: -145, el: 24, fov: 40, shift: 215, side: 0, drift: 0.3 };
  // (it leaves while the seat is still coming down: the longer this swing around the aircraft lasts, the smoother it is)
  shot(tRew + 0.55, t.scene - 0.1 - tRew - 0.55, WIDE, "sine.inOut", 860);
  st(tRew + 0.55, 2.2, { pitch: 14, alt: 15000, shell: 1 }, "sine.inOut");
  tl.fromTo("#stamp", { opacity: 0 }, { opacity: 1, duration: 0.12 }, t.vrai - 0.04);
  // (it lands from the reader's side, growing down and to the right: never over the header)
  tl.fromTo("#stamp-main", { scale: 1.35, rotation: 0 }, { scale: 1, rotation: -3, duration: 0.2, ease: "power3.in" }, t.vrai - 0.04);
  [["#stamp-1", t.mars - 0.05], ["#stamp-2", t.mars + 0.45], ["#stamp-3", t.dizier - 0.05]].forEach(([sel, at]) => tl.fromTo(sel, { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.25, ease: "power3.out" }, at));
  tl.to("#stamp", { opacity: 0, y: -24, duration: 0.22, ease: "power2.in" }, t.scene - 0.34);

  // "200 m du sol, 500 km/h. l'avion se remet à plat…"
  st(t.scene - 0.3, 2.2, { alt: 20000 }, "sine.out");
  shot(t.scene - 0.05, toSeat - t.scene, { d: 3500, az: -134, el: 20 }, "sine.inOut");
  follow("chip-alt", null, 96, 470);
  follow("chip-speed", null, 450, 470);
  show("#chip-alt", t.scene - 0.05, 0.2);
  show("#chip-speed", t.kmh - 0.05, 0.2);
  hide("#chip-alt", toSeat - 0.14, 0.12);
  hide("#chip-speed", toSeat - 0.14, 0.12);
  st(t.avion - 0.1, 1.15, { pitch: -1.5 }, "sine.inOut");
  // "…tu décolles du siège… et tu t'accroches." — in the cockpit, from the side: your body leaves the pan, your hand comes down
  const FLOAT = { tx: -4, ty: 250, tz: 372, d: 420, az: -80, el: 6, fov: 28, shift: 160, side: 0, drift: 0.3 };
  // (of the aircraft, a ghost is left: its solid cockpit and the pilot's seat would be bars across this picture — and
  // the cut to the bench will have nothing to take away but that ghost)
  // (the light stands around the seat exactly as it will on the bench: 64 cm above the foot of the rails, same size)
  cut(toSeat, SKY, FLOAT, { pitch: 0, shell: 0.2, glass: 0.25, frame: 0, cockpit: 0, cabin: 0, fx: 0, fy: JET.seatRear[1] + 64, fz: JET.seatRear[2], fs: 90 });
  shot(toSeat, t.et - 0.3 - toSeat, { d: 400, az: -77 }, "sine.inOut");
  // …and closes on the handle as the hand comes down on it
  const GRIP = { tx: -4, ty: 246, tz: 384, d: 300, az: -66, el: 10 };
  shot(t.et - 0.3, tFreeze - t.et + 0.3, GRIP, "sine.inOut");
  st(t.decolles - 0.08, 0.75, { float: 1.8 }, "sine.out");
  follow("chip-g", null, 96, 470);
  show("#chip-g", t.decolles + 0.1, 0.2);
  hide("#chip-g", t.et - 0.1, 0.15);
  st(t.et - 0.1, 0.6, { grip: 1 }, "power2.inOut");
  st(t.accroches + 0.2, 0.2, { alarm: 1 }, "power2.out");

  /* ════════════════════ 02 · AUTOPSIE ════════════════════ */
  setAct(tl, 2, t.ouvre);
  // "alors…" — time has stopped. The camera hardly moves: the aircraft and you fade around the handle. "…on l'ouvre":
  // the same seat, on the bench, at the same place on the screen — and it is from there that the camera backs away, as
  // the seat comes apart. (A pull-back before the cut had to cover 4 m in half a second: `qa` called it the roughest
  // move of the film.)
  const SEATVIEW = { ...GRIP, d: 330, az: -60, fov: 28, shift: 160, side: 0, drift: 0.3 };
  shot(tFreeze, toBench - tFreeze, { d: SEATVIEW.d, az: SEATVIEW.az }, "sine.inOut");
  st(t.ouvre - 0.05, 0.55, { shell: 0, glass: 0, world: 0, rider: 0, alarm: 0, streaks: 0, mood: 0 }, "sine.inOut");
  const BENCH0 = { ...SEATVIEW, ty: SEATVIEW.ty - JET.seatRear[1], tz: SEATVIEW.tz - JET.seatRear[2] };
  // (the bench comes up under the seat after the cut: on the cut itself only what stood around the seat changes)
  cut(toBench, BENCH, BENCH0, { float: 0, grip: 0, mood: 0, pool: 0, grid: 0, fx: 0, fy: 64, fz: 0, fs: 90, pitch: 0 });
  st(toBench + 0.02, 0.6, { pool: 0.2, grid: 0.16 }, "sine.out");
  st(t.explode, 1.2, { explode: 1 }, "none");
  const EXPLODED = { tx: -8, ty: 92, tz: 8, d: 1060, az: -46, el: 13, shift: 165, drift: 0.3 };
  shot(toBench + 0.02, t.eclate - 0.02 - toBench, EXPLODED, "sine.inOut", SEATVIEW.d);

  // "dans ton dos, un canon." — the two tubes light up, the camera leans toward them
  shot(t.eclate, 1.1, { tx: -14, ty: 104, tz: -12, d: 720, az: -56, el: 12 }, "sine.inOut");
  st(t.dos - 0.1, 0.3, { litGun: 1 });
  st(t.sous - 0.3, 0.3, { litGun: 0 });
  // (no second line: "two tubes" is what the model shows, not a fact the sources give)
  const cGun = co.add({ title: "Canon", x: 984, y: 560, align: "end", tone: "system", anchor: hero.A.gun });
  cGun.show(tl, t.dos + 0.05);
  cGun.hide(tl, t.sous - 0.3);
  // "sous ton siège, une fusée." — a breath of fire, to say what it is
  // (pushed 110 px to the left: the gun's bright tubes then leave by the corner of the frame, not behind the header)
  shot(t.sous - 0.35, 1.15, { tx: -4, ty: 44, tz: 26, d: 560, az: -40, el: 6, side: 110 }, "sine.inOut");
  st(t.sous + 0.15, 0.3, { litRocket: 1 });
  st(t.fusee - 0.1, 0.2, { litRocket: 0 });
  const cRocket = co.add({ title: "Fusée", sub: "En appoint du canon", x: 984, y: 560, align: "end", tone: "system", anchor: hero.A.rocket });
  cRocket.show(tl, t.fusee - 0.45);
  cRocket.hide(tl, toCanopy - 0.3);
  st(t.fusee - 0.05, 0.22, { burn: 0.6 }, "power2.out");
  st(t.fusee + 0.19, 0.3, { burn: 0 }, "power2.in");

  // "et au-dessus de ta tête… une verrière qui ne s'ouvrira pas." — back to the aircraft, stopped in the air: over your
  // head the canopy, and laid on its glass the line that will cut it
  const CANOPY = { tx: 0, ty: 318, tz: 330, d: 560, az: -150, el: 30, fov: 32, shift: 170, side: 0, drift: 0.3 };
  cut(toCanopy, SKY, CANOPY, { explode: 0, burn: 0, litGun: 0, litRocket: 0, rider: 1, grip: 1, float: 1.8, shell: 0.5, glass: 1, frame: 1, cockpit: 1, cabin: 1, world: 1, cord: 0.15, mood: 1, fx: 0, fy: 290, fz: 340, fs: 110 });
  shot(toCanopy, toGas - toCanopy, { d: 500, az: -132 }, "sine.inOut");
  st(t.verriere - 0.2, 0.7, { cord: 0.65 }, "sine.inOut");
  follow("chip-canopy", null, 96, 470);
  show("#chip-canopy", t.verriere - 0.05, 0.2);
  hide("#chip-canopy", toGas - 0.14, 0.12);

  // "tout doit partir dans l'ordre." — on the bench: the order leaves the handle as gas — the gun, the rocket, the parachutes
  const GAS = { tx: -6, ty: 64, tz: 0, d: 760, az: -60, el: 12, fov: 28, shift: 190, side: 0, drift: 0.3 };
  cut(toGas, BENCH, GAS, { rider: 0, grip: 0, float: 0, cord: 0, mood: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 64, fz: 0, fs: 90 });
  shot(toGas, t.imagines - 0.1 - toGas, { az: -54, d: 720 }, "sine.inOut");
  st(toGas + 0.05, 0.22, { handle: 1 }, "power2.out");
  st(toGas + 0.2, t.imagines - toGas - 0.35, { gas: 1 }, "none");
  [["tag-1", hero.A.gun, -150, -30, 0.3], ["tag-2", hero.A.rocket, -190, 10, 0.55], ["tag-3", hero.A.headbox, -150, -50, 0.8]].forEach(([id, anchor, dx, dy, u]) => {
    follow(id, anchor, dx, dy);
    show(`#${id}`, lerp(toGas + 0.2, t.imagines - 0.15, u), 0.15);
    hide(`#${id}`, t.imagines - 0.08, 0.15);
  });
  // "tu imagines un ordinateur ?" — the box on the side of the back, closed
  shot(t.imagines - 0.1, 1.0, { tx: -24, ty: 58, tz: -14, d: 360, az: -70, el: 8 });
  follow("chip-brain", hero.A.brain, -300, -170);
  show("#chip-brain", t.ordinateur - 0.1, 0.2);
  hide("#chip-brain", t.zero - 0.2, 0.15);

  /* ════════════════════ 03 · RÉPONSE — two seconds, slowed down ════════════════════
     From "Zéro" on the top slot holds one thing: the frieze of the two seconds, whose marks light up as the voice
     reaches them. The camera stays on the aircraft's right, ahead of the wing — the side the key light falls on, and
     the side of the hand that pulls — and, once the seat moves, rides with it (`ride`). */
  setAct(tl, 3, t.zero);
  panel("#frise", t.zero - 0.1, toPrix - 0.3);
  // (a mark is named when the voice gets there, never before — like every text of the film: only "0 s" and "2 s" wait)
  [["#fr-1", t.fusee2], ["#fr-2", t.dehors], ["#fr-3", t.lache15], ["#fr-4", t.deux]].forEach(([sel, at]) => {
    tl.to(`${sel} i`, { backgroundColor: "#5cffb0", duration: 0.15 }, at);
    const named = sel === "#fr-4" ? `${sel} span` : `${sel} b, ${sel} span`;
    tl.fromTo(named, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, ease: "back.out(2)" }, at);
  });
  tl.to("#fr-4 b", { color: "#5cffb0", duration: 0.15 }, t.deux);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.zero);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.6, ease: "power2.out" }, t.zero + 0.12);

  // "zéro. ta main tire." — back in the rear seat at the very instant time had stopped: off the pan, the hand on the handle
  const SEATLIGHT = { fx: 0, fy: JET.seatRear[1] + 64, fz: JET.seatRear[2], fs: 90 };
  const PULL = { tx: -3, ty: 250, tz: 387, d: 215, az: -58, el: 14, fov: 28, shift: 110, side: 0, drift: 0.3 };
  cut(toZero, SKY, PULL, {
    explode: 0, gas: 0, glow: 1, handle: 0, brain: 0, rider: 1, grip: 1, float: 1.8, alarm: 1, mood: 1, streaks: 1,
    shell: 0.2, glass: 0.25, frame: 0, cockpit: 0, cabin: 0, world: 1, cord: 0, cut: 0, pitch: 0, ...SEATLIGHT,
  });
  shot(toZero, toPlaque - toZero, { d: 188, az: -52 }, "sine.inOut");
  jolt(t.zero, 0.3, 0.4);
  st(tPull, 0.16, { handle: 1 }, "power3.out");
  st(tPull, 0.1, { alarm: 1.7 }, "power2.out");
  st(tPull + 0.1, 0.6, { alarm: 1 }, "power2.out");
  jolt(tPull + 0.02, 0.55, 0.5);
  st(tPull + 0.12, 1.6, { gas: 1 }, "none"); // the order is given: the gas is on its way

  // "le harnais te plaque." — from the side, the whole of you: the reel hauls, your back hits the seat, your shins come in
  const PLAQUE = { tx: -4, ty: 262, tz: 360, d: 500, az: -76, el: 6, fov: 28, shift: 40, side: 0, drift: 0.3 };
  cut(toPlaque, SKY, PLAQUE, { glow: 0.6 });
  shot(toPlaque, toCord - toPlaque, { d: 470, az: -72 }, "sine.inOut");
  st(tPlaque, 0.22, { harness: 1, float: 0 }, "power3.out");
  jolt(tPlaque + 0.04, 0.4, 0.45);

  // "un cordon explosif découpe la verrière." — from outside: the line on the glass lights up, and the two panes leave in shards
  const CORD = { tx: 0, ty: 298, tz: 412, d: 900, az: -58, el: 22, fov: 28, shift: 70, side: 30, drift: 0.3 };
  cut(toCord, SKY, CORD, { shell: 0.5, glass: 1, frame: 1, cockpit: 1, cabin: 1, cord: 0.15, glow: 0.45, fx: 0, fy: 290, fz: 420, fs: 170 });
  shot(toCord, toGun - toCord, { d: 830, az: -52 }, "sine.inOut");
  st(t.cordon - 0.05, 0.7, { cord: 0.85 }, "power2.in");
  st(tSlice, 1.5, { cut: 1 }, "none");
  st(tSlice + 0.3, 0.9, { cord: 0.25 }, "power2.out");
  jolt(tSlice, 0.45, 0.5);
  blip("#flash", tSlice, 0.06, 0.03, 0.3);

  // "le canon part : jusqu'à 18 g." — the seat climbs its rails through the opening, the tubes draw out under it
  // (of the aircraft, only its ghost and the pilot's seat: yours goes up, his does not move — and the two tubes that
  // push yours light up as they draw out. The gun gives its speed at once: the seat leaves on the word)
  const GUNVIEW = { tx: -4, ty: 250, tz: 425, d: 1000, az: -72, el: 6, fov: 28, shift: -40, side: 0, drift: 0.3 };
  cut(toGun, SKY, GUNVIEW, { ride: 0.4, glow: 0.3, cockpit: 0, frame: 0, shell: 0.35, ...SEATLIGHT, fs: 150 });
  const toSpine = t.fois18 - 0.12;
  shot(toGun, toSpine - toGun, { d: 960, az: -68 }, "sine.inOut");
  st(tFire, toRocket - 0.03 - tFire, { gun: 1 }, "none");
  st(tFire - 0.05, 0.15, { litGun: 1.6 }, "power2.out");
  jolt(tFire, 0.6, 0.6);
  // "dix-huit fois ton poids." — a cut to your back, the camera going up with it: through the glass, the spine
  // (a move from the wide shot to here, while the seat is shooting up, was the roughest instant of the first draft)
  cut(toSpine, SKY, { tx: -2, ty: 262, tz: 354, d: 390, az: -82, el: 4, fov: 28, shift: 30, side: 0, drift: 0.3 }, { ride: 1, litGun: 0.7 });
  shot(toSpine, toRocket - toSpine, { d: 350, az: -88 }, "sine.inOut");
  st(toSpine + 0.05, 0.35, { bones: 1 });

  // "0,2 s. sous ton siège, la fusée s'allume." — the seat has left its rails (they stay, with the gun's drawn tubes);
  // the camera goes under the pan, and the rocket lights: a light that has a place, and embers
  const LEAVE = { tx: -2, ty: 240, tz: 372, d: 620, az: -60, el: 2, fov: 30, shift: 50, side: 0, drift: 0.3 };
  cut(toRocket, SKY, LEAVE, { gun: 1, free: 1, sx: 0, sy: 0, sz: 0, srx: 0, ride: 1, bones: 0, glow: 0, litGun: 0, cockpit: 1, frame: 1, shell: 0.5 });
  shot(toRocket, t.sousSiege - 0.3 - toRocket, { d: 580, az: -56 }, "sine.inOut");
  shot(t.sousSiege - 0.3, 1.1, { tx: -2, ty: 224, tz: 384, d: 400, az: -48, el: -10 }, "sine.inOut");
  st(toRocket, tBurn - toRocket, { sy: 110 }, "none"); // what speed the gun gave it: the rails and the drawn tubes sink out of the picture
  st(tBurn, 0.22, { burn: 1 }, "power2.out");
  jolt(tBurn, 0.5, 0.6);
  // the seat's way up, and the aircraft's way ahead: its fin goes by under you as the voice says "dehors"
  const tClear = toOut + 1.75;
  st(tBurn, tClear - tBurn, { sy: 560 }, "power1.in");
  st(tClear, 2.0, { sy: 800 }, "power1.out");
  st(tBurn + 0.2, toDrogue - tBurn - 0.2, { jetZ: 7000 }, "power2.in");
  st(toOut + 0.4, 0.7, { burn: 0 }, "power2.in"); // a rocket of a quarter of a second: it is out as you clear the tail
  st(toOut + 0.8, 1.6, { srx: -16 }, "sine.inOut"); // the wind takes the seat

  // "0,5 s, environ : tu es dehors. à 500 km/h." — wide: you above the aircraft, in the wind; it goes on without you
  // (seen from above and ahead, the way the seat leans: you, facing the lens; behind you the back of the aircraft, sliding
  // away; far below, the ground)
  const OUT = { tx: 0, ty: 250, tz: 365, d: 950, az: -24, el: 54, fov: 32, shift: 60, side: 0, drift: 0.3 };
  // (its two nozzles go by right under you: at full thrust they would wash the picture)
  cut(toOut, SKY, OUT, { shell: 1.5, streaks: 3.5, gust: 1, thrust: 0.4, fs: 170 });
  shot(toOut, toDrogue - toOut, { d: 1040, az: -16 }, "sine.inOut");

  // "un petit parachute redresse le siège." — it streams behind, and the seat comes upright under it
  const DROGUE = { tx: 0, ty: 300, tz: 330, d: 1600, az: -68, el: 5, fov: 30, shift: 10, side: -130, drift: 0.3 };
  cut(toDrogue, SKY, DROGUE, { trail: 72, streaks: 1.5, gust: 0.5, fs: 260 });
  shot(toDrogue, toOpen - toDrogue, { d: 1680, az: -60 }, "sine.inOut");
  st(tDrogue, 0.75, { drogue: 1 }, "power2.out");
  st(t.redresse - 0.05, 0.95, { upright: 1, srx: 0, trail: 68 }, "sine.inOut");
  // "1,5 s… il te lâche." — the seat falls away on its own; over your shoulders the main parachute starts to come out
  st(tLetGo, 0.55, { release: 1 }, "power1.in");
  st(tLetGo + 0.35, 1.5, { drop: 1500 }, "power1.in");
  now(tLetGo, { hang: 72 });
  st(tLetGo + 0.2, toOpen - tLetGo - 0.2, { chute: 0.16 }, "sine.out");

  // "2 s. parachute ouvert. tu es vivant." — it fills, you swing under it, and the light turns to the colour of what is alive
  const OPEN = { tx: 0, ty: 560, tz: 250, d: 4900, az: -38, el: 2, fov: 28, shift: 35, side: 0, drift: 0.3 };
  cut(toOpen, SKY, OPEN, { seat: 0, streaks: 1, gust: 0, fy: SEATLIGHT.fy + 300, fs: 420 });
  shot(toOpen, toPrix - toOpen, { d: 4500, az: -30 }, "sine.inOut");
  st(toOpen, 1.45, { chute: 1 }, "sine.inOut");
  st(toOpen, 2.0, { hang: 0 }, "sine.inOut");
  st(tOpen + 0.3, 0.3, { mood: 0 });
  st(tOpen + 0.3, 0.6, { gel: 0.16 }, "sine.out");

  // "le prix : jusqu'à un éjecté sur trois repart avec une vertèbre tassée." — under the risers, your back: one vertebra
  const SPINE = { tx: 0, ty: 276, tz: 364, d: 400, az: -104, el: 4, fov: 28, shift: 0, side: -70, drift: 0.3 };
  // (from close, you are glass from head to hands: all that is left solid is what the sentence is about)
  cut(toPrix, SKY, SPINE, { bones: 1, ghost: 1, fy: SEATLIGHT.fy, fs: 110 });
  shot(toPrix, t.jusqua + 0.3 - toPrix, { d: 380, az: -100 }, "sine.inOut");
  // …and the camera goes to the one that paid
  shot(t.jusqua + 0.3, t.vertebre + 0.5 - t.jusqua - 0.3, { ty: 258, d: 250, az: -92, side: -20 }, "sine.inOut");
  st(t.vertebre - 0.1, 0.35, { spine: 1 }, "power2.out");
  follow("chip-vert", null, 96, 470);
  show("#chip-vert", t.jusqua - 0.05, 0.2);
  hide("#chip-vert", toVerdict - 0.14, 0.12);

  /* ════════════════════ chute ════════════════════
     "dans l'avion le plus moderne de France, ce qui te sauve n'a pas d'ordinateur. du gaz, de la poudre… et des
     minuteries." — the bench, and the box the film left closed with a question: it opens. No chip: a capsule, a
     cartridge, a clockwork. */
  const BENCHED = {
    hero: 1, seat: 1, rider: 0, free: 0, ride: 0, sx: 0, sy: 0, sz: 0, srx: 0, drop: 0, gun: 0, release: 0, chute: 0, drogue: 0, upright: 0, harness: 0, burn: 0,
    bones: 0, spine: 0, ghost: 0, gel: 0, handle: 0, grip: 0, float: 0, alarm: 0, explode: 0, gas: 0, glow: 0.5, brain: 0, timer: 0, hang: 0, trail: 0, mood: 0, pool: 0.2, grid: 0.16, fx: 0, fy: 64, fz: 0, fs: 90,
  };
  const BOX = { tx: -30, ty: 61, tz: -22, d: 400, az: -66, el: 9, fov: 28, shift: 10, side: 0, drift: 0.3 };
  cut(toVerdict, BENCH, BOX, BENCHED);
  shot(toVerdict, t.pasOrdi - 0.2 - toVerdict, { d: 330, az: -72 }, "sine.inOut");
  // (the title lies over the top of the seat, and over a pipe that will light up: a shade carries it)
  // (it comes with "ce qui te sauve", not before: a second to read "un ordinateur", and the voice strikes it)
  tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.35 }, t.sauve - 0.55);
  tl.to("#title-shade", { opacity: 0, duration: 0.22 }, toCta - 0.42);
  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.sauve - 0.45);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.pasOrdi);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.poudre - 0.25);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.poudre - 0.05);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.22, ease: "power2.in" }, toCta - 0.42);
  st(t.pasOrdi - 0.05, 0.7, { brain: 1 }, "power2.inOut");
  shot(t.pasOrdi - 0.2, 1.3, { tx: -31, ty: 61, tz: -24, d: 215, az: -80, el: 12 }, "sine.inOut");
  // one by one: the gas in its pipe, the powder in its cartridge, the clockwork and its hand
  // (the gas stops a hand above the box: further up, its pipe runs behind the header)
  st(t.gaz - 0.1, 0.5, { gas: 0.66 }, "power1.out");
  st(t.poudre - 0.05, 0.3, { litPowder: 1 });
  st(t.minuteries - 0.1, toCta - t.minuteries + 0.1, { timer: 1 }, "none");
  [
    [{ title: "Gaz", x: 330, y: 700, align: "end", anchor: hero.A.gasOut }, t.gaz - 0.05],
    [{ title: "Poudre", x: 760, y: 1100, align: "start", anchor: hero.A.cartridge }, t.poudre - 0.05],
    [{ title: "Minuteries", x: 700, y: 770, align: "start", anchor: hero.A.dial }, t.minuteries - 0.05],
  ].forEach(([label, at]) => {
    const c = co.add({ ...label, tone: "system" });
    c.show(tl, at);
    c.hide(tl, toCta - 0.35);
  });

  /* ════════════════════ appels à l'action ════════════════════ */
  // LIKE — the seat, whole again, turning slowly on the bench. Six lives: you, and five more
  const WHOLE = { tx: -4, ty: 62, tz: 0, d: 1000, az: -46, el: 11, fov: 28, shift: 30, side: 0, drift: 0.3 };
  cut(toCta, BENCH, WHOLE, { brain: 0, gas: 0, timer: 0, litPowder: 0, pool: 0.22 });
  shot(toCta, t.abo - 0.2 - toCta, { az: -32 }, "sine.inOut");
  likeNet(tl, {
    showAt: t.like - 0.1,
    hideAt: t.likeEnd + 0.12,
    hits: [1, 2, 3, 4, 5].map((i) => [i, t.like + 0.1 + (i - 1) * 0.26]),
    label: (n) => `${n} vies sauvées`,
  });
  rail(tl, "rail-like", t.likeMot, t.likeEnd + 0.12);

  // ABONNEMENT — the next file, classified
  shot(t.abo - 0.2, toLanding - t.abo + 0.2, { d: 1350, az: -14, shift: -110 }, "sine.inOut");
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.prochain - 0.15);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.prochain + 0.2);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.attend - 0.05);
  rail(tl, "rail-follow", t.abo + 0.1, Math.min(t.aboEnd + 0.15, toLanding - 0.3));
  tl.to("#next", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, toLanding - 0.38);

  // COMMENTAIRE — "et ton pilote ?" — a cut: the same aircraft, minutes later, on short final. No canopy. In front, the
  // pilot; behind him, where you sat, two bare rails. "il a posé l'avion": the wheels come down on the runway
  const LANDED = {
    hero: 0, free: 1, rider: 0, seat: 1, ride: 0, sx: 0, sy: 0, sz: 0, srx: 0, drop: 0, gun: 0, release: 0, chute: 0, drogue: 0, upright: 0, harness: 0, burn: 0,
    bones: 0, spine: 0, handle: 0, grip: 0, float: 0, alarm: 0, explode: 0, brain: 0, hang: 0, trail: 0,
  };
  const FINAL = { ...inJet([0, 262, 330], 8), d: 1300, az: -52, el: 9, fov: 36, shift: 60, side: 0, drift: 0.3 };
  cut(toLanding, SKY, FINAL, {
    ...LANDED, pitch: 7, roll: 0, alt: 650, gear: 1, thrust: 0.3, shell: 0.7, glass: 1, frame: 1, cockpit: 1, consoles: 1, cabin: 1, cord: 0, cut: 1, jetZ: 0, world: 1, streaks: 0.7,
    mood: 0, fx: 0, fy: 290, fz: 400, fs: 170,
  });
  st(toLanding, tTouch - toLanding, { alt: 0 }, "sine.out");
  st(toLanding, tTouch - toLanding, { pitch: 9 }, "sine.inOut");
  // (no shake of the camera when the wheels touch: on this wide picture full of level lines, the first draft had it as
  // one frame that jumps and comes back — the nose coming down says it, and the sound)
  st(tTouch + 0.12, 1.3, { pitch: 0, thrust: 0.08 }, "sine.inOut");
  const toTouch = t.ilAPose - 0.12;
  shot(toLanding, t.sonSiege - 0.12 - toLanding, { d: 1180, az: -56 }, "sine.inOut");
  // "son siège n'est jamais parti" — a cut to the cockpit (a move from the wide shot, over the runway going by, was
  // among the roughest instants of the draft)
  cut(t.sonSiege - 0.12, SKY, { ...inJet([0, 288, 425], 8), d: 880, az: -60, el: 18, fov: 30, shift: 110, side: 40, drift: 0.3 });
  shot(t.sonSiege - 0.12, toTouch - t.sonSiege + 0.12, { d: 800, az: -54 }, "sine.inOut");
  follow("chip-aboard", pilote.A.head, -210, -235);
  follow("chip-empty", jet.A.headRear, -62, -150);
  show("#chip-aboard", t.sonSiege - 0.1, 0.2);
  show("#chip-empty", t.sonSiege + 0.5, 0.2);
  hide("#chip-aboard", toTouch - 0.14, 0.12);
  hide("#chip-empty", toTouch - 0.14, 0.12);
  const TOUCHDOWN = { tx: 0, ty: 205, tz: 260, d: 1250, az: -58, el: 3, fov: 46, shift: 120, side: 0, drift: 0.3 };
  cut(toTouch, SKY, TOUCHDOWN, { fy: 250 });
  shot(toTouch, toLoop - toTouch, { d: 900, az: -50, ty: 240, tz: 300 }, "sine.inOut");
  // (the question is on screen when the voice asks it; the chevrons point at the button from "en commentaire")
  typeAnswer(tl, { showAt: T.at("comment:ce") - 0.1, typedAt: t.tuYVas - 0.2, chars: 8, hideAt: toLoop - 0.3 });
  rail(tl, "rail-comment", t.commentaire, toLoop - 0.3);

  /* ════════════════════ rebouclage ════════════════════
     "si tu y vas : mains sur les genoux. surtout le jour où…" — the day of the flight, again: the aircraft is rolling,
     your hands on your knees, the handle between them. It lifts off as the camera backs out through the canopy, to
     the first frame: "On t'offre un vol en Rafale." */
  const KNEES = { ...inJet([0, 247, 396], 0), d: 205, az: -44, el: 36, fov: 34, shift: 170, side: 30, roll: 0, drift: 0 };
  cut(toLoop, SKY, KNEES, { ...FIRST, pitch: 0, alt: 0, shell: 0.3, glass: 0.12, fx: KNEES.tx, fy: KNEES.ty, fz: KNEES.tz, fs: 60 });
  shot(toLoop, t.rewind - toLoop, { d: 180, az: -40 }, "sine.inOut");
  shot(t.rewind, tEnd - t.rewind, POSE0, "sine.inOut", 180);
  st(t.rewind, tEnd - t.rewind, { pitch: FIRST.pitch, alt: FIRST.alt, shell: 1, glass: 1, fx: FIRST.fx, fy: FIRST.fy, fz: FIRST.fz, fs: FIRST.fs }, "sine.inOut");
  setAct(tl, 1, toLoop);
  tl.to("#chip-toi", { opacity: 1, duration: 0.25 }, tEnd - 0.3);

  brandHud(tl, { decodedAt: t.pasOrdi, resetAt: toLoop });

  /* ───────────────────────── text on screen, commit ───────────────────────── */
  const HOOK = ["accroche", "promesse"];
  const handOver = END - 0.34; // the last caption leaves, the first card of the hook is back
  buildHook($("hook"), EP, tl, { beats: HOOK, loopAt: handOver });
  buildCaptions($("captions"), EP, tl, { skip: HOOK, lastEnd: handOver });
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => {
    if (s.cut) return tw.set(C, s.pose, s.at);
    const room = (shots[i + 1]?.at ?? END) - s.at;
    const duration = Math.min(s.dur, Math.max(0.05, room));
    if (s.fromD == null) return tw.to(C, { ...s.pose, duration, ease: s.ease }, s.at);
    const { d, tx, ty, tz, ...turn } = s.pose;
    const aim = Object.fromEntries(Object.entries({ d, tx, ty, tz }).filter(([, v]) => v !== undefined));
    const r = d / s.fromD;
    tw.to(C, { ...turn, duration, ease: s.ease }, s.at);
    tw.to(C, { ...aim, duration, ease: (u) => (Math.pow(r, 0.5 - 0.5 * Math.cos(Math.PI * u)) - 1) / (r - 1) }, s.at);
  });

  /* ───────────────────────── per-frame: state → world ───────────────────────── */
  const mix = new THREE.Color();
  const rim = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgHot = new THREE.Color(0x120a07);

  stage.grade.gel.copy(VEILLE);
  const seatBody = hero.parts.back.parent; // what falls away when the seat lets go of you
  hero.fx.cartridge.emissive = VEILLE.clone();
  hero.fx.cartridge.emissiveIntensity = 0;

  stage.onUpdate((time) => {
    tw.time(time);
    const onBench = S.set === BENCH;
    const flown = onBench ? 0 : 1;
    // the camera: what the shots say and, when it rides, the seat's own travel on top (the aircraft is level then)
    const rideX = S.ride * flown * S.sx;
    const rideY = S.ride * flown * (S.sy + STROKE[0] * S.gun);
    const rideZ = S.ride * flown * (S.sz + STROKE[1] * S.gun);
    Object.assign(cam, C);
    cam.tx += rideX;
    cam.ty += rideY;
    cam.tz += rideZ;
    const px = stage.pixelScale();
    bench.visible = onBench;
    jet.group.visible = !onBench;
    scene.fog.density = onBench ? 0.28 / Math.max(120, cam.d) : 0.00002;
    Object.assign(stage.focus, { x: S.fx + rideX, y: S.fy + rideY, z: S.fz + rideZ, scale: S.fs });
    stage.grade.gelAmount = S.gel;
    mix.copy(VEILLE).lerp(SIGNAL, S.mood);

    // the aircraft and its world
    if (!onBench) {
      const v = velAt(time);
      jet.plane.position.z = S.jetZ;
      front.root.visible = S.cabin > 0.5;
      jet.update({
        gear: S.gear, pitch: S.pitch, roll: S.roll, alt: S.alt, thrust: S.thrust, shell: S.shell, canopy: S.glass < 0 ? undefined : S.glass, frame: S.frame, cockpit: S.cockpit, consoles: S.consoles, cord: S.cord, cut: S.cut,
        travel: travelAt(time), step: Math.abs(v) / 30, streaks: S.streaks * Math.min(1, Math.abs(v) / 9000), ground: S.world, sky: S.world, railsRear: S.free,
      }, time);
      // the air that streaks by is the air around whoever is filmed — and, around the seat alone, a tighter box of it
      jet.fx.air.mesh.position.set(rideX, rideY, rideZ);
      jet.fx.air.uniforms.uMin.value.set(lerp(-1600, -700, S.gust), lerp(-500, -320, S.gust), lerp(-3000, -1200, S.gust));
      jet.fx.air.uniforms.uSize.value.set(lerp(3200, 1400, S.gust), lerp(1900, 1400, S.gust), lerp(6000, 3000, S.gust));
    }

    // the seat of the story: in its place, in the air, or on the bench
    const home = onBench ? bench : S.free > 0.5 ? air : rearBay;
    if (hero.root.parent !== home) home.add(hero.root);
    hero.root.visible = S.hero > 0.5;
    hero.parts.stand.visible = onBench;
    const stays = onBench || S.free < 0.5 ? 1 : 0; // the rails and the gun's inner stages belong to the aircraft
    setPartOpacity(hero.parts.rails, stays);
    setPartOpacity(hero.parts.piston, stays);
    for (const part of BODY) setPartOpacity(part, S.seat);
    const r = S.rider;
    toi.group.visible = r > 0.01;
    toi.fig.body.uniforms.uAmount.value = r;
    // the head and the hands fade with the glass (a hand that vanished on one frame, in close-up on the handle, was a jump)
    const flesh = toi.fig.flesh;
    if (flesh.transparent !== r < 0.999) {
      flesh.transparent = r < 0.999;
      flesh.needsUpdate = true;
    }
    flesh.opacity = r;
    toi.fig.ghost(S.ghost > 0.5);
    toi.helmet.visible = r > 0.5 && S.ghost < 0.5;
    hero.fly.position.set(S.sx * flown, (S.sy * C30 - S.sz * S30) * flown, (S.sy * S30 + S.sz * C30) * flown);
    hero.fly.rotation.x = S.srx * DEG * flown;
    // where the parachutes stream is said against the world (degrees from the vertical, toward the tail): handed to
    // the seat in its own frame — it leans back on its rails, the wind tips it, it comes upright, and its body tips as it falls
    const lean = ((S.upright - 1) * SEAT.tilt + S.srx) * DEG;
    const tipped = lean - 0.45 * S.release * S.release;
    hero.trail.set(0, Math.cos(S.trail * DEG + tipped), -Math.sin(S.trail * DEG + tipped));
    hero.hang.set(0, Math.cos(S.hang * DEG + lean), -Math.sin(S.hang * DEG + lean));
    hero.pose({
      explode: S.explode, handle: S.handle, gas: S.gas, harness: S.harness, gun: S.gun, burn: S.burn, drogue: S.drogue, release: S.release, canopy: S.chute,
      brain: S.brain, timer: S.timer, float: S.float, grip: S.grip, spine: S.spine, bones: S.bones * r, upright: S.upright, seated: r,
    }, time);
    // once it has let go, the seat goes on falling (the model only takes it a metre and a half away)
    seatBody.position.y -= S.drop;
    seatBody.position.z -= 0.3 * S.drop;
    hero.fx.gas.uAmount.value *= S.glow;
    hero.fx.loop.emissiveIntensity = 1.4 * S.alarm;
    lightUp(hero.parts.gun, S.litGun);
    lightUp(hero.parts.piston, S.litGun);
    lightUp(hero.parts.rocket, S.litRocket);
    hero.fx.cartridge.emissiveIntensity = 0.7 * S.litPowder;
    hero.setPixelScale(px);

    cam.roll = S.shake * Math.sin(time * 30) * 1.1;
    rim.copy(mix).lerp(INK, 0.5);
    lights.rim.color.copy(rim);
    lights.rim.intensity = 1.1 + S.mood * 0.5;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgHot, onBench ? 0 : S.mood * 0.5);
    scene.fog.color.copy(scene.background);
  });

  /* ───────────────────────── per-frame: the clock, the weight, the chips ───────────────────────── */
  const hudClock = $("hud-clock");
  const hudCount = $("hud-count");
  const hudCountV = $("hud-count-v");
  const friseFill = $("frise-fill");
  stage.onProject((time) => {
    const looped = time >= toLoop;
    const clock = looped ? 0 : along(CLOCK, time);
    hudClock.textContent = stamp(clock);
    friseFill.style.transform = `scaleX(${(clock / 2).toFixed(4)})`;
    const g = looped ? 1 : along(WEIGHT, time);
    hudCountV.textContent = weigh(g);
    hudCount.style.color = g < -0.04 || g > 6 ? "#ff5b2e" : "#e9e4d8";
    hudCount.style.opacity = looped || time < weightOff ? 1 : 0;
    for (const [el, anchor, dx, dy] of chips) {
      const p = anchor ? stage.project(anchor) : { x: 0, y: 0 };
      el.style.transform = `translate(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px)`;
    }
  });

  stage.start();
  return tl;
}

window.SD = { build };
