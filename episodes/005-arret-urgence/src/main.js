// DOSSIER 005 — Arrêt d'urgence. Three sets:
//   the REACTOR (a pressure vessel seen like an X-ray: the core alight, 57 clusters of rods hanging
//   over it, and on the head the crown of coils that hold them),
//   the BENCH (the gripper of one mechanism: a notched rod, three latches, a coil — taken apart, then at work),
//   and CHICAGO, 1942 (the first pile, a rod on a rope, a man with an axe).
//   01 MENACE is one move down the vessel: the whole reactor → the crown and its feed → into the
//   core, down to a few nuclei (the chain reaction, src/chain.js) → the rods above it → up to the
//   one coil that holds one of them: the others go dark, and the film cuts to the bench on its light.
//   02 AUTOPSIE on the bench, part by part: the coil comes off, the rod, the latches open and bite,
//   the coil comes back, its field. 03 RÉPONSE: two seconds, in slow motion — the current drops, the
//   latches open, the rod falls; then the reactor, 1 368 rods at once: green goes down, orange goes out.
//   Then the chute, 1942, the appels à l'action, and the film is back on its first frame.
// The story clock: T+0,0 s when the current drops, T+2,0 s when the rods are at the bottom.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { createStage } from "@kit/stage.js";
import { makeSurface, makePool, makeMotes } from "@kit/atmo.js";
import { explode, setPartOpacity } from "@kit/build3d.js";
import { buildCaptions, buildHook, createCallouts, setAct, brandHud, rail, likeNet, typeAnswer } from "@kit/overlay.js";
import { makeTiming } from "@kit/timing.js";
import { buildGripper } from "./model.js";
import { buildReactor, REACTOR, CHAIN } from "./reactor.js";
import { buildPile, PILE } from "./pile.js";

const EP = window.__EPISODE;
const T = makeTiming(EP);
const $ = (id) => document.getElementById(id);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);
const INK = new THREE.Color(BRAND.ink);
const comma = (x, digits) => x.toFixed(digits).replace(".", ",");
const BENCH = 0;
const IN_REACTOR = 1;
const IN_CHICAGO = 2;
const X = REACTOR.x;
const PX = PILE.x;
const DEG = Math.PI / 180;

function build() {
  const END = EP.duration;
  const stage = createStage($("stage"), { fog: 0.0016, scale: 30, far: 40000 });
  const { scene, cam, lights } = stage;
  window.SD.stage = stage; // lets the cover exporter pose the camera

  /* ───────────────────────────── world ───────────────────────────── */
  const surface = makeSurface({ radius: 700, cell: 6, fade: 120 });
  const pool = makePool({ radius: 62 });
  const motes = makeMotes({ count: 260, seed: 5, min: [-90, 2, -90], size: [180, 110, 180], psize: [0.4, 1.4], drift: [0.4, -0.7, 0.2] });
  const grip = buildGripper();
  const bench = new THREE.Group();
  bench.add(surface.group, pool.mesh, motes.points, grip.root);
  const reactor = buildReactor();
  const pile = buildPile();
  scene.add(bench, reactor.group, pile.group);
  const partList = Object.values(grip.parts);

  /* ───────────────────────────── state ───────────────────────────── */
  // The first frame is the hook: the reactor at full power — the core alight, the rods hanging over
  // it, the crown of coils that hold them.
  const POSE0 = { tx: X, ty: 170, tz: 0, d: 5050, az: 30, el: 30, fov: 28, shift: 150, side: 0, roll: 0 };
  const FIRST = {
    set: IN_REACTOR, power: 1, falls: 1, neutrons: 0.5, shell: 1, heat: 0.6, glow: 3.2, mood: 1, gel: 0,
    feed: 1, others: 1, sealed: 0.8, chain: 0,
    explode: 0, coilA: 1, ringA: 1, gPower: 1, ring: 0, open: 0, drop: 0, aura: 0, shellA: 0, field: 0, pulse: 0, bands: 1, pool: 0.24, grid: 0.16,
    hot: 0, axe: 0, lines: 1,
  };
  const S = { ...FIRST, shake: 0 };
  Object.assign(cam, POSE0);
  window.SD.S = S; // for the trial frames

  const tl = gsap.timeline({ paused: true }); // the page (registered with HyperFrames)
  const tw = gsap.timeline({ paused: true }); // the world (seeked by the stage, below)
  const st = (at, dur, props, ease = "power2.inOut") => tw.to(S, { ...props, duration: dur, ease }, at);
  const now = (at, props) => tw.set(S, props, at);
  const shots = [];
  const shot = (at, dur, pose, ease = "power2.inOut") => shots.push({ at, dur, pose, ease });
  /** A cut: the picture jumps to another set (or another angle) on one frame. `pose` must be complete. */
  const cut = (at, set, pose, state = {}) => {
    stage.cut(at);
    now(at, { set, ...state });
    shots.push({ at, cut: true, pose: { roll: 0, side: 0, fov: 28, ...pose } });
  };
  const blip = (el, at, peak, up = 0.05, down = 0.5) => {
    tl.to(el, { opacity: peak, duration: up }, at);
    tl.to(el, { opacity: 0, duration: down }, at + up);
  };
  const jolt = (at, k, dur = 0.5) => {
    st(at, 0.04, { shake: k }, "power2.out");
    st(at + 0.04, dur, { shake: 0 }, "power2.out");
  };
  /** A slow beat on a state value: up and down `n` times, back to 0. */
  const beat = (key, at, n = 2, half = 0.45) => tw.fromTo(S, { [key]: 0 }, { [key]: 1, duration: half, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1, immediateRender: false }, at);
  const show = (sel, at, dur = 0.3) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: dur }, at);
  const hide = (sel, at, dur = 0.2) => tl.to(sel, { opacity: 0, duration: dur }, at);

  /* ───────────────────────────── times ───────────────────────────── */
  const t = {
    toi: T.at("accroche:toi"), reacteur: T.at("accroche:réacteur"),
    promesse: T.at("promesse"), rien: T.at("promesse:rien"), seul: T.at("promesse:seul"), et: T.at("promesse:Et"), panne: T.at("promesse:panne"),
    coeur: T.at("coeur"), mw: T.at("coeur:3"), atome: T.at("coeur:atome"), brise: T.at("coeur:brise"), neutrons: T.at("coeur:neutrons"), brisent: T.at("coeur:brisent"), autres: T.at("coeur:d'autres"),
    barres: T.at("barres"), avaler: T.at("barres:avaler"), attendent: T.at("barres:attendent"),
    boite: T.at("boite"), retient: T.at("boite:retient"),
    ouvre: T.at("ouvre"), explode: T.at("explode"),
    tige: T.at("eclate:tige"), cliquets: T.at("eclate:cliquets"), pincent: T.at("eclate:pincent"), autour: T.at("eclate:autour"), bobine: T.at("eclate:bobine"), eclateEnd: T.at("eclate$"),
    repos: T.at("repos"), aimantMot: T.at("repos:électroaimant"), tant: T.at("repos:Tant"), serre: T.at("repos:serre"), barreMot: T.at("repos:barre"), air: T.at("repos:l'air"),
    zero: T.at("zero"), tombe: T.at("zero:tombe"),
    lache: T.at("lache"), lacheMot: T.at("lache:lâche"), ecartent: T.at("lache:s'écartent"), barreTombe: T.at("lache:tombe"),
    mille: T.at("mille"), tiges: T.at("mille:tiges"), pousse: T.at("mille:pousse"), poids: T.at("mille:poids"),
    deux: T.at("deux"), fond: T.at("deux:fond"), arretee: T.at("deux:arrêtée"),
    chute: T.at("chute"), rienMot: T.at("chute:rien"), depense2: T.at("chute:dépense#2"), empecher: T.at("chute:l'empêcher"),
    hache: T.at("hache"), secours: T.at("hache:secours"), barre: T.at("hache:barre"), corde: T.at("hache:corde"), homme: T.at("hache:homme"), hacheMot: T.at("hache:hache"), hacheEnd: T.at("hache$"),
    like: T.at("like"), likeMot: T.at("like:Like"), likeEnd: T.at("like$"),
    comment: T.at("comment"), commentaire: T.at("comment:commentaire"), combien: T.at("comment:combien"), epinglee: T.at("comment:épinglée"), commentEnd: T.at("comment$"),
    abo: T.at("abo"), mur: T.at("abo:mur"), jamais: T.at("abo:jamais"), aboEnd: T.at("abo$"),
    boucle: T.at("boucle"), rewind: T.at("rewind"),
  };
  // the cuts
  const toBench = t.ouvre - 0.14;
  const toFall = t.mille - 0.14;
  const toChicago = t.hache - 0.14;
  const toCta = t.like - 0.12;
  const back = Math.min(1.2, END - t.rewind - 0.04);
  const toHook = t.rewind + back * 0.45;

  // The story clock: two seconds, stretched from "Zéro" to "Deux secondes".
  //   0 → 0,15 s  the current is gone, the latches open
  //   → 2,0 s     the rods fall, by their own weight, and are braked at the bottom
  const keys = [[t.zero, 0], [t.barreTombe, 0.15], [t.deux, 2]];
  const secAt = (time) => {
    if (time <= keys[0][0] || time >= toHook) return 0; // before anything happens — and again once the film is back on its first frame
    for (let i = 1; i < keys.length; i++) {
      if (time < keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (time - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
    }
    return 2;
  };
  const fallOf = (s) => smooth(0.15, 2, s); // slow to leave, braked at the end
  const reactionOf = (fall) => 1 - smooth(0.04, 0.86, fall); // it dies as the rods go in
  const storyOf = (time) => {
    const s = secAt(time);
    const fall = fallOf(s);
    return { s, fall, reaction: reactionOf(fall) };
  };

  const co = createCallouts(stage, $("callouts"), $("leaders"));
  const chips = []; // [element, anchor, dx, dy]: placed every frame on a point of the scene
  const follow = (id, anchor, dx, dy) => chips.push([$(id), anchor, dx, dy]);

  /* ════════════════════ 01 · MENACE — one move down the vessel ════════════════════ */
  setAct(tl, 1, 0);
  // A — "panne de courant. et c'est toi qui es aux commandes d'un réacteur nucléaire"
  // The camera is on its way from the first frame: it rises over the vessel while it closes in, and the
  // crown opens into a ring of coils. Nothing else moves: the crown and its feed stay lit until "la panne"
  shot(0, t.promesse - 0.35, { d: 4700, az: 44, el: 44, shift: 200 }, "sine.out");
  // B — "ne touche à rien : il s'arrête tout seul, en deux secondes" — you, read as a system: nothing to do.
  // The panel is a narrow column on the left; the vessel makes room for it
  shot(t.promesse - 0.35, 1.1, { d: 5200, az: 40, side: -165 });
  shot(t.promesse + 0.75, t.et - t.promesse - 0.95, { d: 5100, az: 37 }, "sine.inOut");
  tl.fromTo("#senses", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.promesse + 0.3);
  tl.fromTo("#sense-bouton", { opacity: 0.2 }, { opacity: 1, duration: 0.2 }, t.seul - 0.1);
  tl.fromTo("#sense-delai", { opacity: 0.2 }, { opacity: 1, duration: 0.2 }, t.et - 0.9);
  tl.to("#senses", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.et - 0.1);
  // C — "et ce qui l'arrête… c'est la panne": up to the crown, and the line that feeds it. On "la panne", its light falters
  const CROWN = { tx: X + 40, ty: 640, tz: 0, d: 2500, az: 34, el: 22, fov: 28, shift: 60, side: 0, roll: 0 };
  shot(t.et - 0.2, 1.5, CROWN);
  st(t.et, 0.8, { heat: 0.1 });
  follow("chip-feed", null, 96, 470);
  follow("chip-feed-off", null, 96, 470);
  show("#chip-feed", t.et + 0.25);
  hide("#chip-feed", t.panne - 0.04, 0.1);
  // "la panne": what it does to them, for an instant — the hook is a "what if"; the film then goes back to explain
  show("#chip-feed-off", t.panne + 0.06, 0.12);
  hide("#chip-feed-off", t.coeur - 0.15);
  st(t.panne - 0.04, 0.25, { power: 0.12 }, "power2.in");
  st(t.coeur + 1.0, 0.4, { power: 1 }); // back on once the crown has left the picture

  // "dans la cuve : près de trois mille mégawatts."
  const CORE_IN = { tx: X, ty: -170, tz: 0, d: 1500, az: 18, el: 12, fov: 28, shift: 150, side: 0 };
  st(t.coeur - 0.3, 0.25, { feed: 0 }); // the camera is about to travel past the feed line: it would smear across the picture
  shot(t.coeur - 0.2, 1.7, CORE_IN);
  st(t.coeur, 0.8, { heat: 0, neutrons: 1, glow: 1.5 });
  follow("chip-power", null, 96, 470); // the picture is the core itself: the chip has no point to follow, it takes the top slot
  show("#chip-power", t.mw - 0.15);
  hide("#chip-power", t.atome - 0.5);
  // "chaque atome qui se brise lâche des neutrons… qui en brisent d'autres." — from very close: a few nuclei, and the tree that doubles
  const CASCADE = { tx: X + Math.sin(CHAIN.az * DEG) * CHAIN.r, ty: CHAIN.y, tz: Math.cos(CHAIN.az * DEG) * CHAIN.r, d: 500, az: CHAIN.az, el: 4, fov: 28, shift: 160, side: 0 };
  reactor.fx.chain.schedule([t.brise, t.neutrons + 0.06, t.brisent - 0.16, t.autres, t.autres + 0.4], 0.5);
  shot(t.atome - 0.7, 1.5, CASCADE);
  st(t.atome - 0.7, 1.2, { glow: 0.14, neutrons: 0, shell: 0.2 }); // the fuel steps back into the dark, and the fine lines with it: the nuclei are the picture
  st(t.atome - 0.5, 0.7, { chain: 1 });
  shot(t.atome + 0.85, t.barres - t.atome - 1.05, { d: 455, az: CHAIN.az - 4 }, "sine.inOut");

  // "des barres savent avaler ces neutrons. elles attendent, suspendues juste au-dessus."
  const BARS = { tx: X, ty: 150, tz: 0, d: 2500, az: 22, el: 9, fov: 28, shift: 150, side: 0 };
  shot(t.barres - 0.2, 1.6, BARS);
  st(t.barres - 0.2, 0.5, { chain: 0 });
  st(t.barres - 0.2, 0.9, { neutrons: 0.5, glow: 2.4, shell: 1 });
  shot(t.barres + 1.45, t.boite - t.barres - 2.0, { d: 2350, az: 16 }, "sine.inOut");
  follow("chip-rods", null, 96, 470); // the top slot again: the rods fill the picture
  show("#chip-rods", t.attendent - 0.1);
  hide("#chip-rods", t.boite - 0.5);

  // "toute la question, c'est ce qui les retient" — up their drive rods, to the crown, to one coil: the others go dark
  const ONE = { tx: X + reactor.hero.x, ty: reactor.hero.y, tz: reactor.hero.z, d: 190, az: 24, el: 10, fov: 28, shift: 150, side: 0 };
  shot(t.boite - 0.55, toBench - t.boite + 0.55, ONE, "sine.inOut");
  st(t.boite + 0.4, 1.3, { others: 0.1, heat: 0.15 });

  /* ════════════════════ 02 · AUTOPSIE (sur l'établi) ════════════════════ */
  setAct(tl, 2, t.ouvre);
  // that coil, on the bench: the same light, the same place on the screen — then the light goes, and it is an object
  cut(toBench, BENCH, { tx: 0, ty: 32, tz: 0, d: 190, az: 24, el: 10, shift: 150 }, { shellA: 1, pool: 0.26, grid: 0.18, mood: 0, gel: 0 });
  st(toBench + 0.12, 0.65, { shellA: 0 }, "power2.out");
  // "alors… on l'ouvre": the coil comes off
  st(t.explode, 1.3, { explode: 1 }, "none");
  st(t.explode, 0.5, { gPower: 0.4 }); // off its latches it holds nothing: its light goes down, and comes back when it is named
  shot(t.explode - 0.2, 1.5, { tx: 0, ty: 42, tz: 0, d: 250, az: 16, el: 12, shift: 150 });
  // "une tige crantée."
  shot(t.tige - 0.25, 1.2, { tx: 0, ty: 23, tz: 0, d: 150, az: 8, el: 6, shift: 150 });
  const cRod = co.add({ title: "Tige", sub: "Crantée", x: 300, y: 700, align: "end", anchor: grip.A.rod });
  cRod.show(tl, t.tige - 0.05);
  cRod.hide(tl, t.cliquets - 0.35);
  // "des cliquets, qui la pincent." — they open, to be seen… and close on their notch
  shot(t.cliquets - 0.3, 1.1, { tx: 0.5, ty: 35.5, tz: 0, d: 105, az: 2, el: 6, shift: 150 });
  st(t.cliquets - 0.2, 0.2, { ring: 1 }, "power2.in");
  st(t.cliquets, 0.35, { open: 1 }, "back.out(2)");
  st(t.pincent - 0.05, 0.16, { open: 0 }, "power2.in");
  st(t.pincent + 0.13, 0.2, { ring: 0 }, "power2.out");
  jolt(t.pincent + 0.11, 0.2, 0.3);
  tw.fromTo(S, { pulse: 0 }, { pulse: 1, duration: 0.1, ease: "power2.out", immediateRender: false }, t.pincent + 0.11);
  st(t.pincent + 0.21, 0.5, { pulse: 0 }, "power2.out");
  const cLatch = co.add({ title: "Cliquets", x: 300, y: 620, align: "end", tone: "system", anchor: grip.A.latchL });
  cLatch.show(tl, t.cliquets);
  cLatch.hide(tl, t.autour - 0.35);
  // "et autour… une bobine." — it comes back down around them, and lights up
  shot(t.autour - 0.3, 1.3, { tx: 0, ty: 34, tz: 0, d: 210, az: 14, el: 10, shift: 150 });
  st(t.autour, t.bobine - t.autour + 0.05, { explode: 0 }, "none");
  st(t.bobine - 0.05, 0.4, { gPower: 1 }, "power2.out");
  const cCoil = co.add({ title: "Bobine", x: 300, y: 620, align: "end", anchor: grip.A.coilL });
  cCoil.show(tl, t.bobine - 0.05);
  cCoil.hide(tl, t.repos - 0.1);

  // "c'est un électroaimant. tant que le courant passe, il serre les cliquets : la barre reste en l'air."
  const HOLD = { tx: 1.5, ty: 33, tz: 0, d: 125, az: 3, el: 5, shift: -120, side: 0 };
  shot(t.repos - 0.1, 1.5, HOLD);
  st(t.aimantMot - 0.05, 0.5, { field: 1 });
  st(t.tant - 0.3, 0.6, { coilA: 0.1, ringA: 0.18, bands: 0.62 }); // the coil turns to glass, and the ring inside it: the teeth in their notch are the subject
  tl.fromTo("#top-fade", { opacity: 0 }, { opacity: 1, duration: 0.5 }, t.repos - 0.1); // from here to the fall the rod climbs behind the header: it goes into the dark first
  tl.set("#top-fade", { opacity: 0 }, toFall);
  tl.fromTo("#gauge", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.tant - 0.2);
  tl.set("#gauge-s1", { opacity: 0 }, 0);
  tw.fromTo(S, { pulse: 0 }, { pulse: 1, duration: 0.25, ease: "sine.out", immediateRender: false }, t.serre - 0.05);
  st(t.serre + 0.2, 0.7, { pulse: 0 }, "sine.inOut");
  // "la barre reste en l'air": back, down to its free end — it hangs over the stand, daylight under it
  shot(t.barreMot - 0.3, t.zero - t.barreMot + 0.1, { ty: 24, d: 205, az: -8, el: 6, shift: 40 }, "sine.inOut");

  /* ════════════════════ 03 · RÉPONSE ════════════════════ */
  setAct(tl, 3, t.zero);
  // T+0,0 — "zéro. le courant tombe." — it falls while it is said (the film is in slow motion): fast, then
  // slower, the way a coil lets go of its current. Its field goes with it, the camera closes in, and the
  // gauge goes under its threshold as the magnet lets go
  const decay = (u) => (1 - Math.exp(-1.9 * u)) / (1 - Math.exp(-1.9));
  const fading = t.lacheMot - 0.05 - t.zero;
  const lets = t.zero + 0.93 * fading; // under 18 %
  st(t.zero, fading, { gPower: 0.16, field: 0.16 }, decay);
  st(t.lacheMot - 0.05, 0.25, { gPower: 0, field: 0 }, "power2.out"); // no current, no field
  now(t.zero, { power: 0 }); // …and on the vessel head too, for when the film goes back there
  st(t.zero, 0.3, { mood: 1, gel: 0.12 });
  tl.to("#gauge-fill", { backgroundColor: "#ff5b2e", duration: 0.12 }, lets);
  tl.to("#gauge-s0", { opacity: 0, duration: 0.1 }, lets);
  tl.to("#gauge-s1", { opacity: 1, duration: 0.1 }, lets + 0.1);
  shot(t.zero + 0.05, t.lache - 0.25 - t.zero, { ty: 31, d: 140, az: -2, el: 5, shift: -60 }, "sine.inOut");
  jolt(t.zero, 0.3, 0.4);
  tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.2, color: "#ff5b2e", duration: 0.12, ease: "power2.out", transformOrigin: "100% 50%" }, t.zero);
  tl.to("#hud-clock", { scale: 1, color: "#e9e4d8", duration: 0.6, ease: "power2.out" }, t.zero + 0.12);
  show("#hud-count", t.zero, 0.15);
  tl.to("#gauge", { opacity: 0, duration: 0.2 }, t.lacheMot + 0.2); // it has said what it had to: under the threshold

  // "l'aimant lâche. les cliquets s'écartent… et la barre tombe."
  shot(t.lache - 0.2, 1.0, { tx: 1.5, ty: 38, tz: 0, d: 112, az: 4, el: 4, shift: 60 });
  st(t.lacheMot - 0.3, 0.2, { ringA: 1 }); // an object again
  st(t.lacheMot - 0.05, 0.22, { ring: 1 }, "power2.in"); // the ring is no longer held: it drops
  jolt(t.lacheMot + 0.17, 0.25, 0.3);
  st(t.ecartent - 0.05, 0.3, { open: 1 }, "back.out(2)");
  st(t.barreTombe - 0.12, toFall - t.barreTombe + 0.12, { drop: 34 }, "power1.in"); // it is on its way as the word is said, and leaves the latches: the film cuts to the reactor while it falls
  shot(t.barreTombe - 0.1, toFall - t.barreTombe + 0.1, { ty: 36, d: 122 }, "sine.inOut");

  // "plus de mille tiges plongent dans le cœur. rien ne les pousse : leur poids suffit." — all of them at
  // once, and the camera goes in with them: the core stays above the captions
  const FALL = { tx: X, ty: 110, tz: 0, d: 4700, az: -26, el: 24, fov: 28, shift: 150, side: 0 };
  cut(toFall, IN_REACTOR, FALL, { heat: 0, glow: 3.2, neutrons: 1, mood: 1, gel: 0.1, feed: 0, others: 1, chain: 0, sealed: 0.8 });
  shot(toFall, t.pousse - toFall - 0.2, { ty: 0, d: 3200, az: -18, el: 18, shift: 210 }, "sine.inOut");
  follow("chip-count", null, 96, 470); // the top slot: the camera travels
  show("#chip-count", t.tiges - 0.2);
  hide("#chip-count", t.pousse - 0.2);
  shot(t.pousse - 0.2, 1.5, { tx: X, ty: -60, tz: 0, d: 2300, az: -10, el: 10, shift: 150 });

  // T+2,0 — "deux secondes. elles sont au fond. la réaction en chaîne est arrêtée."
  shot(t.deux - 0.15, 1.6, { tx: X, ty: 100, tz: 0, d: 4700, az: 6, el: 20, shift: 150 });
  st(t.deux, 0.8, { mood: 0, gel: 0 });
  st(t.fond - 0.25, 0.9, { sealed: 1 }); // "elles sont au fond": the bars, seen through the dead fuel, at their brightest
  tl.to("#hud-count", { color: "#5cffb0", duration: 0.3 }, t.arretee - 0.1);
  const ASIDE = { tx: X, ty: 100, tz: 0, d: 4400, az: 16, el: 24, fov: 28, shift: 110, side: -165 };
  shot(t.arretee + 0.15, t.chute + 0.75 - t.arretee - 0.15, ASIDE); // the vessel steps aside before the words of the chute take the top of the picture

  /* ════════════════════ chute ════════════════════ */
  // "on ne dépense rien pour arrêter un réacteur." — the title turns over
  const toCrown = t.depense2 - 0.15;
  shot(t.chute + 0.75, toCrown - t.chute - 0.75, { az: 28, el: 30 }, "sine.inOut");
  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, t.chute + 0.9);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, t.rienMot - 0.1);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, t.rienMot + 0.25);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, t.rienMot + 0.4);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.depense2 + 0.15);
  // "on dépense… pour l'empêcher de s'arrêter." — back up to what the current was paying for: the crown,
  // in the frame where it faltered on "la panne". It is dark, and stays dark
  shot(toCrown, 1.5, CROWN);
  shot(toCrown + 1.5, toChicago - toCrown - 1.5, { d: 2400, az: 30 }, "sine.inOut");
  tl.fromTo("#chip-feed-off", { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, t.empecher - 0.2); // the title has left the top slot
  hide("#chip-feed-off", toChicago - 0.15, 0.12);

  // "chicago, 1942. le dernier secours du tout premier réacteur ? une barre pendue à une corde… et un homme avec une hache."
  cut(toChicago, IN_CHICAGO, { tx: PX + 170, ty: 560, tz: 0, d: 7000, az: -22, el: 10, shift: 60 }, { mood: 0, gel: 0, hot: 0, axe: 0 });
  shot(toChicago, t.barre - toChicago - 0.2, { d: 6600, az: -14 }, "sine.inOut");
  follow("chip-1942", null, 96, 470); // the top slot: the camera travels, the date does not
  show("#chip-1942", t.hache + 0.2);
  shot(t.barre - 0.2, 1.3, { tx: PX + 250, ty: 860, tz: 0, d: 3300, az: -12, el: 6, shift: 150 }); // the rod, its rope
  shot(t.homme - 0.35, 1.3, { tx: PX + 545, ty: 640, tz: 0, d: 1500, az: -34, el: 5, shift: 150 }); // the man
  hide("#chip-1942", t.barre - 0.3);
  st(t.homme, 0.4, { hot: 1 });
  st(t.hacheMot - 0.1, 0.3, { axe: 1 }, "power2.out");
  follow("chip-never", pile.A.axe, 20, -96);
  show("#chip-never", t.hacheEnd + 0.05);
  hide("#chip-never", toCta - 0.12, 0.12);

  /* ════════════════════ appels à l'action (sur l'établi) ════════════════════ */
  // LIKE — for the one who still pictures a big red button
  cut(toCta, BENCH, { tx: 0, ty: 30, tz: 0, d: 420, az: 24, el: 14, shift: -90, side: 20 }, { coilA: 1, ringA: 1, gPower: 1, ring: 0, open: 0, drop: 0, explode: 0, field: 0, shellA: 0, pulse: 0, bands: 1, pool: 0.28, grid: 0.16, mood: 0, gel: 0 });
  shot(toCta, t.comment - toCta - 0.15, { az: 10, d: 400 }, "sine.inOut");
  likeNet(tl, {
    showAt: t.likeMot - 0.15,
    hideAt: t.likeEnd + 0.12,
    hits: [[7, T.at("like:celui")], [4, T.at("like:imagine")], [10, T.at("like:gros")], [2, T.at("like:rouge")]],
    label: (n) => `Boutons rouges oubliés ${n}/12`,
  });
  rail(tl, "rail-like", t.likeMot, t.likeEnd + 0.12);

  // COMMENTAIRE — how long does it keep heating? the answer is pinned
  shot(t.comment - 0.15, 1.5, { tx: 0, ty: 32, tz: 0, d: 300, az: -6, el: 8, shift: -90, side: 0 });
  typeAnswer(tl, { showAt: t.commentaire, typedAt: t.combien, chars: 9, hideAt: t.commentEnd + 0.12 });
  rail(tl, "rail-comment", t.commentaire, t.commentEnd + 0.12);
  blip("#flash", t.epinglee, 0.05, 0.04, 0.3);

  // ABONNEMENT — the next file, classified
  shot(t.abo - 0.15, 1.6, { tx: 0, ty: 30, tz: 0, d: 440, az: 20, el: 14, shift: -210, side: 20 });
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, t.abo + 0.3);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, t.mur - 0.6);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, t.jamais - 0.4);
  rail(tl, "rail-follow", t.abo + 0.1, t.aboEnd + 0.15);
  tl.to("#next", { opacity: 0, y: -24, duration: 0.3, ease: "power2.in" }, t.boucle + 0.1);

  /* ════════════════════ rebouclage ════════════════════
     "…pour arrêter un réacteur, il suffit d'une…" → the reactor at full power: "Panne de courant." */
  shot(t.boucle, t.rewind - t.boucle, { tx: 0, ty: 32, d: 330, az: 8, el: 10, shift: -40, side: 0 }, "sine.inOut");
  shot(t.rewind, toHook - t.rewind, { d: 520, el: 16 }, "power3.in");
  // it comes in along the path of the hook, at the speed the hook starts with: the loop does not stop
  cut(toHook, IN_REACTOR, { ...POSE0, d: POSE0.d + 100, az: POSE0.az - 4, el: POSE0.el - 4, shift: POSE0.shift - 14 }, { ...FIRST });
  shot(toHook, END - toHook, POSE0, "none");
  blip("#flash", toHook, 0.05, 0.03, 0.3);
  setAct(tl, 1, toHook);
  tl.to("#hud-count", { opacity: 0, duration: 0.15 }, toHook - 0.15);
  tl.set("#hud-count", { color: "#ff5b2e" }, toHook);

  brandHud(tl, { decodedAt: t.rienMot + 0.4, resetAt: toHook });

  /* ───────────────────────── text on screen, commit ───────────────────────── */
  const HOOK = ["accroche", "promesse"];
  const handOver = END - 0.34; // the last caption leaves, the first card of the hook is back
  buildHook($("hook"), EP, tl, { beats: HOOK, loopAt: handOver });
  buildCaptions($("captions"), EP, tl, { skip: HOOK, lastEnd: handOver });
  shots.sort((a, b) => a.at - b.at);
  shots.forEach((s, i) => {
    if (s.cut) return tw.set(cam, s.pose, s.at);
    const room = (shots[i + 1]?.at ?? END) - s.at;
    tw.to(cam, { ...s.pose, duration: Math.min(s.dur, Math.max(0.05, room)), ease: s.ease }, s.at);
  });

  /* ───────────────────────── per-frame: state → world ───────────────────────── */
  const mix = new THREE.Color();
  const rim = new THREE.Color();
  const bg0 = new THREE.Color(BRAND.bg);
  const bgHot = new THREE.Color(0x150b07);
  stage.grade.gel.copy(SIGNAL);
  const FOCUS = [
    { x: 0, y: 0, z: 0, scale: 30 },
    { x: X, y: 150, z: 0, scale: 520 },
    { x: PX + 250, y: 500, z: 0, scale: 520 },
  ];

  stage.onUpdate((time) => {
    tw.time(time);
    const px = stage.pixelScale();
    bench.visible = S.set === BENCH;
    reactor.group.visible = S.set === IN_REACTOR;
    pile.group.visible = S.set === IN_CHICAGO;
    scene.fog.density = S.set === BENCH ? 0.0016 : 0.00003;
    Object.assign(stage.focus, FOCUS[S.set]);
    stage.grade.gelAmount = S.gel;
    mix.copy(VEILLE).lerp(SIGNAL, S.mood);
    const cur = storyOf(time);

    if (S.set === IN_REACTOR) {
      reactor.update({ power: S.power, fall: cur.fall * S.falls, reaction: cur.reaction, neutrons: S.neutrons, shell: S.shell, heat: S.heat, glow: S.glow, feed: S.feed, others: S.others, sealed: S.sealed, chain: S.chain }, time, px);
    } else if (S.set === IN_CHICAGO) {
      pile.update({ hot: S.hot, axe: S.axe, lines: S.lines }, time);
    }

    // the bench: taken apart, or at work
    explode(partList, S.explode);
    setPartOpacity(grip.parts.coil, S.coilA);
    setPartOpacity(grip.parts.ring, S.ringA);
    grip.pose({ power: S.gPower, ring: S.ring, open: S.open, drop: S.drop, aura: S.aura, shell: S.shellA, field: S.field, pulse: S.pulse, bands: S.bands });

    cam.roll = S.shake * Math.sin(time * 30) * 1.1;
    // in the reactor the light of the scene is the core's own; on the bench the rim is mostly ink
    rim.copy(mix).lerp(INK, S.set === BENCH ? 0.5 : 0.2);
    lights.rim.color.copy(rim);
    lights.rim.intensity = 1.1 + S.mood * 0.9;
    pool.uniforms.uColor.value.copy(mix);
    pool.uniforms.uAmount.value = S.pool;
    surface.grid.uAmount.value = S.grid;
    scene.background.copy(bg0).lerp(bgHot, S.mood * 0.6);
    scene.fog.color.copy(scene.background);
    motes.uniforms.uAmount.value = 0.1;
    motes.update(time, px);
  });

  /* ───────────────────────── per-frame: the chrono, the gauge, the chips ───────────────────────── */
  const hudClock = $("hud-clock-v");
  const hudClockL = $("hud-clock-l");
  const hudCount = $("hud-count-v");
  const gaugeV = $("gauge-v");
  const gaugeFill = $("gauge-fill");
  $("gauge-th").style.left = "18%";
  stage.onProject((time) => {
    const cur = storyOf(time);
    const before = time < t.zero || time >= toHook;
    hudClock.textContent = before ? "100 %" : `T+${comma(cur.s, 1)} s`;
    hudClockL.style.display = before ? "" : "none"; // "Réaction 100 %" until the clock starts: the label then goes down to the counter
    hudCount.textContent = `${Math.round(cur.reaction * 100)} %`;
    gaugeV.textContent = `${Math.round(S.gPower * 100)} %`;
    gaugeFill.style.transform = `scaleX(${clamp01(S.gPower).toFixed(4)})`;
    for (const [el, anchor, dx, dy] of chips) {
      const p = anchor ? stage.project(anchor) : { x: 0, y: 0 };
      el.style.transform = `translate(${(p.x + dx).toFixed(1)}px, ${(p.y + dy).toFixed(1)}px)`;
    }
  });

  stage.start();
  return tl;
}

window.SD = { build };
