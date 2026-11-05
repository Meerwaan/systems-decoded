// « La reconstitution » — the look of the Compte à rebours shorts (CRnn), an option of the kit. Spec: docs/recette-compte-a-rebours.md
// « L'image » ; the rules and the settings tried: docs/reconstitution.md. The dossiers keep their X-ray look: nothing here touches them.
//   RECON                     the format's colours (Merwan, 05/11: « vert quand c'est bon, rouge quand c'est l'incident ») :
//                             veille = what works, the safe system · alarme = the incident · ambre = the time and the mood · papier = text
//   setupReconstitution(stage, o)   V3 (05/11) « le noir chaud » : the SAME studio 3D as the dossiers (the stage's softbox key, soft
//                             shadows, reflections, rim), turned warm — amber key, a warm spot that pools on the floor, a near-black
//                             WARM ground with a fine AMBER grid (the dossiers' grid is cold), an amber halo under the subject, a red
//                             halo for the faulty part, a film grain keyed on film time. Follows stage.focus.
//                             Returns { key, floor, grid, pool, halo, grain, setMood(k), aim() }: setMood(0 → 1) is `depuis` (the only green).
//   clay(o) / clayEdges(geo, o)     the maquette's matter: matte grey clay (`tone` −1 … 1 tells two neighbours apart) and its fine light edges
//   alarm(o) / setAlarm(mat, k)     the faulty part: clay that turns red and glows (k 0 → 1). One at a time in the picture.
//   safe(mat) / setOk(k)      the safe system in green: setOk(k) (world.apply, every frame, BEFORE the sets' update) lights every
//                             material marked safe() AND every alarm() part that is not at fault in veille green — the same part
//                             goes from green to red on screen the moment it becomes the incident.
//   feutre(D, o)              a red felt-pen circle / arrow / underline around the faulty part, drawn as the voice names it
//   heal(mat, k)              that same part corrected: red → veille green (through dark, never khaki), on its halo
//   crHud(D, { clock, remain, tag, depuis })   drives the CR header: the real time, huge, that JUMPS at each key (an amber burst),
//                             the time left under it (« T−40 s », « T−11 h 23 min »), the tag; at `depuis` the page switches to
//                             data-phase="depuis" (captions' +mot+ turn green) and the account name lights up (D.verdict).
//   formatRemain(s)           the « T−… » text, for a panel that would show it elsewhere
// Everything depends on film time only (hf-seek): no Math.random, no wall clock.
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { solid, edgesOf } from "./build3d.js";
import { makePool, makeSurface } from "./atmo.js";
import { along } from "./direct.js";

export const RECON = {
  papier: 0xefeae0,
  ambre: 0xffb23e,
  alarme: 0xff2d2d,
  veille: BRAND.veille,
  bg: 0x0b0705, // warm black (the dossiers' is cold): the first signature of the format
  clay: 0x8b8986, // the mid value of the clay; `tone` moves it towards CLAY_DARK / CLAY_LIGHT
};
const CLAY_DARK = new THREE.Color(0x4c4b49);
const CLAY_MID = new THREE.Color(RECON.clay);
const CLAY_LIGHT = new THREE.Color(0xc2bfb9);
const RED_BODY = new THREE.Color(0x5c1714); // the faulty part's own colour once it is lit
const GREEN_BODY = new THREE.Color(0x173a2a);
const ALARM = new THREE.Color(RECON.alarme);
const VEILLE = new THREE.Color(RECON.veille);

// the night (mood 0) and `depuis` (mood 1): what the light is on either side of the correction
const C = (x) => new THREE.Color(x);
const NIGHT = { key: C(0xffdcba), keyK: 2.6, spot: C(0xffa648), spotK: 1.25, env: 0.34, hemi: 0.1, rim: C(0xffd7a3), rimK: 0.95, fill: C(0xff9b55), fillK: 0.12, bg: C(RECON.bg), grid: C(RECON.ambre), gridK: 0.2, pool: C(RECON.ambre), poolK: 0.3 };
const AFTER = { key: C(0xf3f5f2), keyK: 2.4, spot: C(0xe6f4ec), spotK: 1.5, env: 0.42, hemi: 0.16, rim: C(0x9fe8c4), rimK: 0.9, fill: C(0x9fb4c8), fillK: 0.15, bg: C(0x07090a), grid: C(RECON.veille), gridK: 0.16, pool: C(RECON.veille), poolK: 0.2 };

// the safe system: every material marked safe() and every alarm() part, painted from the shared OK level
const SAFE = new Set();
const SAFE_BASE = new WeakMap();
let OK = 0;
/** Marks a material (MeshStandard) as part of the system that works: it glows veille green by setOk(k). Returns the material. */
export function safe(mat, gain = 0.6) {
  SAFE_BASE.set(mat, { color: mat.color.clone(), emissive: mat.emissive?.clone() ?? new THREE.Color(0), ei: mat.emissiveIntensity ?? 0, gain });
  SAFE.add(mat);
  paintSafe(mat);
  return mat;
}
/** 0 → 1: the safe system lights green (its parts at fault stay red). Call it every frame, before the sets' update. */
export function setOk(k = 0) {
  const v = Math.max(0, Math.min(1, k));
  if (v === OK) return;
  OK = v;
  for (const m of SAFE) (m.userData.alarm ? paint(m) : paintSafe(m));
}
function paintSafe(mat) {
  const b = SAFE_BASE.get(mat);
  if (!b) return;
  if (OK <= 0.001) {
    mat.color.copy(b.color);
    mat.emissive.copy(b.emissive);
    mat.emissiveIntensity = b.ei;
    return;
  }
  mat.color.copy(b.color).lerp(GREEN_BODY, 0.5 * OK);
  mat.emissive.copy(VEILLE);
  mat.emissiveIntensity = b.gain * OK;
}

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * The investigators' table, set on the existing stage.
 *   floor      y of the ground the maquette stands on (null: no floor)   floorRadius  its fading disc, in focus.scale (cone × 2.6), under the focus
 *   dir        where the hard light comes from, seen from the focus ([-1, 0.36, 0.3]: from the side, ≈ 19° high — long shadows)
 *   reach      its distance, in focus.scale (10)     cone  the radius it lights at the focus, in focus.scale (2.8)
 *   grain      the film grain's strength (0.16; 0 = off)     finish  stage.finish for the solid parts (0: clay is not machined)
 * Call setMood(k) every frame from world.apply, AFTER writing stage.focus (it re-aims the light).
 */
export function setupReconstitution(stage, o = {}) {
  const { scene, lights, grade } = stage;
  const { floor = 0, dir = [-1, 0.36, 0.3], reach = 10, cone = 2.8, grain = 0.12, finish = 0, penumbra = 0.85 } = o;

  scene.background = new THREE.Color(RECON.bg);
  if (scene.fog) scene.fog.color.set(RECON.bg);
  stage.finish = finish;
  // V3: the studio stays — its softbox key (stage keySize) casts the soft shadows, the rim cuts the silhouettes; only the colours warm
  lights.key.castShadow = true;
  lights.hemi.color.set(0xffd2a0);
  lights.hemi.groundColor.set(0x0b0705);
  Object.assign(grade, { contrast: 1.14, pivot: 0.3, saturation: 0.98, vignette: 0.36 });
  grade.shadows.setRGB(0.006, 0.002, -0.003);
  grade.highlights.setRGB(0.012, 0.004, -0.01);

  // a warm spot from the side, its cone melting into the black: it pools amber light on the subject and the floor (no shadow of its
  // own: the studio key casts them, soft)
  const key = new THREE.SpotLight(NIGHT.spot, NIGHT.spotK, 0, 0.3, penumbra, 0);
  key.castShadow = false;
  scene.add(key, key.target);
  const D = new THREE.Vector3(...dir).normalize();
  const aimed = { x: NaN, y: NaN, z: NaN, s: NaN };
  function aim() {
    const f = stage.focus;
    if (aimed.x === f.x && aimed.y === f.y && aimed.z === f.z && aimed.s === f.scale) return;
    Object.assign(aimed, { x: f.x, y: f.y, z: f.z, s: f.scale });
    const r = f.scale * reach;
    key.position.set(f.x + D.x * r, f.y + D.y * r, f.z + D.z * r);
    key.target.position.set(f.x, f.y, f.z);
    key.target.updateMatrixWorld();
    key.angle = Math.atan(cone / reach);
    if (surface) {
      // the floor, its grid and its amber halo follow the focus; the grid's lines stay where they are in the world
      surface.group.position.set(f.x, floor, f.z);
      surface.group.scale.setScalar(f.scale);
      surface.grid.uOffset.value.set(f.x / f.scale, -f.z / f.scale);
    }
  }

  // the ground: the dossiers' bench surface (atmo.js makeSurface: matt floor, fine grid, shadow catcher), built at unit size and
  // scaled to the focus — WARM: a brown-black floor and AMBER lines (the dossiers' are cold ink). Its amber pool is the subject's halo.
  let surface = null, floorPool = null;
  if (floor != null) {
    surface = makeSurface({ radius: 33, cell: o.cell ?? 0.28, fade: o.fade ?? 4.7, lift: 0.045 });
    const base = surface.group.children[0].material;
    base.color.set(0x0d0805);
    base.roughness = 1;
    base.envMapIntensity = 0.2;
    surface.grid.uColor.value.set(RECON.ambre);
    surface.grid.uAmount.value = NIGHT.gridK;
    floorPool = makePool({ radius: o.poolRadius ?? 1.5, color: RECON.ambre });
    floorPool.mesh.position.y = 0.025 * 0.045; // between the grid and the shadow catcher: the shadows darken the halo
    surface.group.add(floorPool.mesh);
    scene.add(surface.group);
  }
  const floorMesh = surface?.group ?? null;

  // the halo under the faulty part (additive, on the floor): red while it is at fault, veille once healed
  const pool = makePool({ radius: 1, color: RECON.alarme });
  pool.uniforms.uAmount.value = 0;
  pool.mesh.renderOrder = 1;
  scene.add(pool.mesh);
  const tint = new THREE.Color();
  const halo = ({ at = [0, floor ?? 0, 0], r = 20, amount = 0, k = 0 } = {}) => {
    pool.mesh.position.set(at[0], at[1] + 0.05, at[2]);
    pool.mesh.scale.setScalar(r);
    // through dark, never khaki: the red goes out, then the green comes up
    pool.uniforms.uColor.value.copy(k < 0.5 ? tint.copy(ALARM).multiplyScalar(1 - 2 * k) : tint.copy(VEILLE).multiplyScalar(2 * k - 1));
    pool.uniforms.uAmount.value = amount;
    pool.mesh.visible = amount > 0.001;
  };

  // the grain: one tile of noise over the whole frame (#grain, the last layer of #root), moved by a hash of the FRAME number
  const fps = (typeof window !== "undefined" && window.__EPISODE?.fps) || 30;
  let grainEl = typeof document !== "undefined" ? document.getElementById("grain") : null;
  if (!grainEl && typeof document !== "undefined") {
    grainEl = document.createElement("div");
    grainEl.id = "grain";
    grainEl.className = "layer";
    document.getElementById("root")?.append(grainEl);
  }
  const grainCtl = {
    el: grainEl,
    amount: grain,
    set(a) {
      grainCtl.amount = a;
      grainEl?.style.setProperty("--grain", String(a));
    },
  };
  grainCtl.set(grain);
  stage.onProject((t) => {
    if (!grainEl || !grainCtl.amount) return;
    const n = Math.round(t * fps);
    grainEl.style.backgroundPosition = `${Math.floor(hash(n) * 256)}px ${Math.floor(hash(n + 0.37) * 256)}px`;
  });

  const bg = new THREE.Color();
  const setMood = (k = 0) => {
    const m = Math.min(1, Math.max(0, k));
    const mix = (p) => NIGHT[p] + (AFTER[p] - NIGHT[p]) * m;
    lights.key.color.copy(NIGHT.key).lerp(AFTER.key, m);
    lights.key.intensity = mix("keyK");
    lights.fill.color.copy(NIGHT.fill).lerp(AFTER.fill, m);
    lights.fill.intensity = mix("fillK");
    key.color.copy(NIGHT.spot).lerp(AFTER.spot, m);
    key.intensity = mix("spotK");
    if (surface) {
      surface.grid.uColor.value.copy(NIGHT.grid).lerp(AFTER.grid, m);
      surface.grid.uAmount.value = mix("gridK");
      floorPool.uniforms.uColor.value.copy(NIGHT.pool).lerp(AFTER.pool, m);
      floorPool.uniforms.uAmount.value = mix("poolK");
    }
    scene.environmentIntensity = NIGHT.env + (AFTER.env - NIGHT.env) * m;
    lights.hemi.intensity = NIGHT.hemi + (AFTER.hemi - NIGHT.hemi) * m;
    lights.rim.color.copy(NIGHT.rim).lerp(AFTER.rim, m);
    lights.rim.intensity = NIGHT.rimK + (AFTER.rimK - NIGHT.rimK) * m;
    scene.background.copy(bg.copy(NIGHT.bg).lerp(AFTER.bg, m));
    if (scene.fog) scene.fog.color.copy(scene.background);
    aim();
  };
  // before world.apply (registered after us): the light stands right even if a film never calls setMood
  stage.onUpdate(() => aim());
  setMood(0);

  return { key, floor: floorMesh, grid: surface?.grid, pool: floorPool, halo, grain: grainCtl, setMood, aim };
}

/** The maquette's clay: matte, no metal, little of the studio in it. `tone` −1 (dark) … 0 … 1 (light): two neighbours, two values. */
export function clay(o = {}) {
  const tone = Math.max(-1, Math.min(1, o.tone ?? 0));
  const color = CLAY_MID.clone().lerp(tone < 0 ? CLAY_DARK : CLAY_LIGHT, Math.abs(tone));
  const mat = solid(color, { rough: o.rough ?? 0.6, metal: 0, env: o.env ?? 0.7, opacity: o.opacity, double: o.double }); // V3: satin, it catches the studio
  mat.userData.finish = false; // clay is not machined: no handling marks
  mat.userData.clay = true;
  return mat;
}

/** Fine light edges on a clay volume (never under 1.8 px: thinner, they flicker). */
export function clayEdges(geometry, o = {}) {
  return edgesOf(geometry, { color: o.color ?? RECON.papier, width: o.width ?? 1.8, opacity: o.opacity ?? 0.36, threshold: o.threshold });
}

/** The faulty part: clay at k = 0, red and glowing at k = 1 (`peak`: its glow — past ≈ 1.3 the tone mapping turns the red pink). Drive it with setAlarm. */
export function alarm(o = {}) {
  const base = CLAY_MID.clone().lerp(o.tone < 0 ? CLAY_DARK : CLAY_LIGHT, Math.abs(o.tone ?? 0));
  const mat = solid(base.clone(), { rough: o.rough ?? 0.45, metal: 0, env: 0.6 }); // painted, glossy: the fault shines
  mat.emissive = ALARM.clone();
  mat.emissiveIntensity = 0;
  mat.userData.finish = false;
  Object.assign(mat.userData, { alarm: true, clayBase: base, peak: o.peak ?? 1.15, healPeak: o.healPeak ?? 1.0, okPeak: o.okPeak ?? 0.7, noOk: !!o.noOk, k: 0, heal: 0 });
  SAFE.add(mat);
  return mat;
}

/** k 0 → 1: the part lights up red (after a heal, k still scales its glow). */
export function setAlarm(mat, k) {
  const u = mat.userData;
  u.k = Math.max(0, Math.min(1, k));
  paint(mat);
}

/** k 0 → 1: the corrected part goes from red to veille green — the red goes out, then the green comes up (never a khaki mid-way). */
export function heal(mat, k) {
  mat.userData.heal = Math.max(0, Math.min(1, k));
  paint(mat);
}

function paint(mat) {
  const { k, heal: h, clayBase, peak, healPeak, okPeak, noOk } = mat.userData;
  const lit = Math.max(k, h > 0 ? 1 : 0);
  const ok = h < 0.5 && !noOk ? OK * Math.max(0, 1 - 3 * k) : 0; // green while it works; it turns red the moment it becomes the incident
  if (h < 0.5 && ok > peak * k * (1 - 2 * h)) {
    mat.color.copy(clayBase).lerp(GREEN_BODY, Math.min(1, ok * 1.2));
    mat.emissive.copy(VEILLE);
    mat.emissiveIntensity = (okPeak ?? 0.7) * ok;
  } else if (h < 0.5) {
    mat.color.copy(clayBase).lerp(RED_BODY, Math.min(1, lit * 1.4));
    mat.emissive.copy(ALARM);
    mat.emissiveIntensity = peak * k * (1 - 2 * h);
  } else {
    mat.color.copy(clayBase).lerp(GREEN_BODY, 1);
    mat.emissive.copy(VEILLE);
    mat.emissiveIntensity = healPeak * (2 * h - 1);
  }
}

const pad = (n) => String(n).padStart(2, "0");
/** Seconds left → « T−40 s », « T−3 min 05 s », « T−11 h 23 min » ; past zero « T+3 s ». */
export function formatRemain(s) {
  const late = s < -1e-3;
  const a = late ? Math.floor(-s) : Math.ceil(s - 1e-6);
  const sign = late ? "+" : "−";
  if (a >= 3600) return `T${sign}${Math.floor(a / 3600)} h ${pad(Math.floor((a % 3600) / 60))} min`;
  if (a >= 60) return `T${sign}${Math.floor(a / 60)} min ${pad(a % 60)} s`;
  return `T${sign}${a} s`;
}

const stepAt = (keys, time) => {
  let v = keys[0][1];
  for (const [t, x] of keys) if (time >= t) v = x;
  return v;
};

/**
 * The CR header. `clock`: [[t, "01:23:40"], …] — the real time, held, jumping at each key (burst on #hud-burst, a pop of #hud-clock).
 * `remain`: [[t, seconds_left], …] — straight from one key to the next, or `{ keys, step: true }` to jump with the clock.
 * `tag`: the label on the left (default « Compte à rebours · NN » from the episode's id). `depuis`: the instant of the correction
 * (default: the beat `depuis`) — #root goes data-phase="depuis" and the account name lights up. Past `toloop`, the first frame's values.
 */
export function crHud(D, { clock, remain, tag, depuis, loopAt } = {}) {
  const $ = (id) => document.getElementById(id);
  const at = (ref) => {
    try {
      return D.at(ref);
    } catch {
      return null;
    }
  };
  const loop = loopAt ?? at("toloop") ?? Infinity;
  const tagEl = $("hud-tag");
  if (tagEl) tagEl.textContent = tag ?? `Compte à rebours · ${String(D.EP?.id ?? "").replace(/\D/g, "").padStart(2, "0")}`;

  if (clock?.length) {
    const keys = [...clock].sort((a, b) => a[0] - b[0]);
    D.readout("hud-clock", (time) => stepAt(keys, time >= loop ? 0 : time));
    for (const [t] of keys) {
      if (t <= 0.05 || t >= loop) continue;
      D.tl.fromTo("#hud-burst", { opacity: 0.9, scale: 0.75 }, { opacity: 0, scale: 1.3, duration: 0.5, ease: "power2.out", immediateRender: false }, t);
      D.tl.fromTo("#hud-clock", { scale: 1.08 }, { scale: 1, duration: 0.32, ease: "power3.out", immediateRender: false }, t);
    }
  }
  if (remain) {
    const { keys, step = false } = Array.isArray(remain) ? { keys: remain } : remain;
    const sorted = [...keys].sort((a, b) => a[0] - b[0]);
    const value = (time) => (step ? stepAt(sorted, time) : along(sorted, time));
    D.readout("hud-remain", (time) => formatRemain(value(time >= loop ? 0 : time)));
  }
  const healAt = depuis ?? at("depuis");
  if (healAt != null) {
    D.tl.set("#root", { attr: { "data-phase": "depuis" } }, healAt);
    if (loop < Infinity) D.tl.set("#root", { attr: { "data-phase": "nuit" } }, loop);
    D.verdict(healAt);
  }
}

/**
 * An investigator's felt-pen mark on the picture, drawn as the voice gets there (the signature of the format): a circle around
 * the faulty part, an arrow toward it, or a line under it. Hand-drawn (a fixed wobble from `seed`, never Math.random), alarm red, glowing on the warm black (V3).
 *   feutre(D, { id, anchor, kind: "circle" | "arrow" | "underline", w, h, dx, dy, from, to, draw, seed, color })
 *   anchor   an Object3D or Vector3 of the scene (followed every frame, like a chip), or null for a fixed place (dx, dy)
 *   w, h     the size of the mark in px (the circle is an ellipse that fills it) · dx, dy: its centre, from the anchor
 *   from     the instant it starts to draw (draw: its duration, 0.45 s) · to: the instant it lifts off (0.15 s fade)
 * One mark at a time, on the part the voice names; never over the captions (1248–1488) nor the header.
 */
export function feutre(D, { id, anchor = null, kind = "circle", w = 240, h = 170, dx = 0, dy = 0, from, to, draw = 0.45, seed = 1, color = "var(--alarme, #ff2d2d)" } = {}) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.id = id;
  svg.classList.add("feutre");
  const m = 14; // room for the stroke and the wobble
  svg.setAttribute("width", String(w + 2 * m));
  svg.setAttribute("height", String(h + 2 * m));
  svg.setAttribute("viewBox", `${-m} ${-m} ${w + 2 * m} ${h + 2 * m}`);
  const r = (i) => hash(seed * 31.7 + i * 7.3) - 0.5; // −0.5 … 0.5, fixed
  const paths = [];
  if (kind === "circle") {
    // a loop and a bit more: the pen overshoots where it started, the radius breathes a little
    const pts = [];
    const turns = 1.14, n = 64, a0 = -2.2 + r(1) * 0.6;
    for (let i = 0; i <= n; i++) {
      const u = i / n, a = a0 + u * turns * Math.PI * 2;
      const k = 1 + 0.045 * Math.sin(a * 2 + r(2) * 6) + 0.05 * u * r(3) * 2;
      pts.push([w / 2 + Math.cos(a) * (w / 2) * k, h / 2 + Math.sin(a) * (h / 2) * k]);
    }
    paths.push("M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L"));
  } else if (kind === "arrow") {
    // from the lower left to the upper right, a slight bow, a two-stroke head
    const x0 = 0, y0 = h, x1 = w, y1 = 0, bx = w * (0.35 + r(4) * 0.1), by = h * (0.15 + r(5) * 0.1);
    paths.push(`M${x0} ${y0} Q${bx.toFixed(1)} ${by.toFixed(1)} ${x1} ${y1}`);
    const ang = Math.atan2(y1 - by, x1 - bx), L = Math.min(w, h) * 0.32 + 14;
    const head = (s) => `M${x1} ${y1} L${(x1 - Math.cos(ang + s) * L).toFixed(1)} ${(y1 - Math.sin(ang + s) * L).toFixed(1)}`;
    paths.push(head(0.5), head(-0.5));
  } else {
    // underline: one fast stroke, a little rising, its end hooked
    paths.push(`M0 ${(h * 0.6).toFixed(1)} C${(w * 0.3).toFixed(1)} ${(h * (0.45 + r(6) * 0.2)).toFixed(1)} ${(w * 0.7).toFixed(1)} ${(h * (0.55 + r(7) * 0.2)).toFixed(1)} ${w} ${(h * 0.35).toFixed(1)}`);
  }
  const els = paths.map((d) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("pathLength", "1");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", color);
    p.setAttribute("stroke-width", "11");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    p.style.strokeDasharray = "1 1";
    p.style.strokeDashoffset = "1";
    svg.append(p);
    return p;
  });
  const root = document.getElementById("root");
  root.insertBefore(svg, document.getElementById("hook") ?? null);
  D.follow(id, anchor, dx - w / 2 - m, dy - h / 2 - m);
  if (from == null) return svg;
  D.tl.set(svg, { opacity: 1 }, from);
  const share = kind === "arrow" ? [0.62, 0.19, 0.19] : [1];
  let t = from;
  els.forEach((p, i) => {
    const d = draw * (share[i] ?? 0.2);
    D.tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: "power1.inOut", immediateRender: false }, t);
    t += d;
  });
  if (to != null) {
    D.tl.to(svg, { opacity: 0, duration: 0.15, ease: "power1.in" }, to);
    D.tl.set(els, { strokeDashoffset: 1 }, to + 0.16);
  }
  return svg;
}
