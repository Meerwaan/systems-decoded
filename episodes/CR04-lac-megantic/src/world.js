// CR04 — Lac-Mégantic : the world. This file is the contract between the acts:
//   · the maquettes (plan.js): THE LOCOMOTIVES (locomotive.js: the lead MMA 5017, plein, and four closed ones), the rest of the train,
//     the track and the road at Nantes (convoi.js), Lac-Mégantic and rue Frontenac (ville.js) — ONE place, one inclined plane, the
//     studio floor tilted onto it (plan.js GROUND)
//   · FIRST   the state of the world on the first frame — the CLOSED list of numbers the acts may move
//   · POSE0   the camera of the first frame, and VIEW: the poses the acts start from (PROVISIONAL: set on grey stubs)
//   · STAGED  the light of the place · BENCHED: the seven hand brakes as they failed, at the start of `depuis`
//   · apply   what each number does to the world, every frame (it places the five locomotives on the track, tilts the floor,
//             writes the three instruments of the page: #mano, #colonne, #vitesse)
// The acts (acte1, acte2, acte2b, acte2c, acte3, fin) only write st / shot / path / cut / chip / tl calls against it.
//
// LE NOIR CHAUD (kit/lib/reconstitution.js): satin clay maquettes, the studio's softbox and an amber spot, the part in fault in red
// (`culprit` picks it — plan.js CULPRIT —, `fault` lights it), green = what works (`ok`), `depuis` 0 → 1 the correction. Never call
// blocks.js's setMood: recon.setMood(S.depuis) after stage.focus, every frame.
import * as THREE from "three";
import { setupReconstitution, setOk } from "@kit/reconstitution.js";
import { CONSIST, RUN, PARTS, FORCE, HB_T, PSI, CULPRIT, FRONTENAC, GROUND_TILT, groundY, trackFrame, vehicleU } from "./plan.js";
import { buildLocomotive } from "./locomotive.js";
import { buildConvoi } from "./convoi.js";
import { buildVille } from "./ville.js";

export const SET = { PENTE: 0 }; // one place: the acts pass SET.PENTE (or null) to cut
/** ≈ the radius of the subjects: sizes the light, the shadows (createStage scale). The locomotive is 102 long, the wheel 5. */
export const SIZE = 60;

/** The studio options (docs/recette-agents.md). `dof` on the close-ups only (poses that spread CLOSE); `finish` off: clay has no machining. */
export const LOOK = { dof: 6, air: 0, finish: 0, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };
const CLOSE = { dof: LOOK.dof };
const P = { side: 0, roll: 0, drift: 0.25, dof: 0, shift: 0 };

/* ── WHERE THINGS ARE (pure: the same law apply uses) ── */
/** A point given in a vehicle's local frame at track position u, in the world. */
export function onTrack(u, [lx, ly, lz]) {
  const { p, ax, ay, az } = trackFrame(u);
  return [p[0] + ax[0] * lx + ay[0] * ly + az[0] * lz, p[1] + ax[1] * lx + ay[1] * ly + az[1] * lz, p[2] + ax[2] * lx + ay[2] * ly + az[2] * lz];
}
/** A point of vehicle i (0 = the lead locomotive; plan.js CONSIST) for the train at { run, slack }, in the world. */
export const onLoco = (i, { run = 0, slack = 0 } = {}, local = [0, 0, 0]) => onTrack(vehicleU(i, run, slack), local);
/** The light around a point (fx fy fz: the subject, fs: its size). */
export const lit = ([fx, fy, fz], fs) => ({ fx, fy, fz, fs });
/** A complete pose from a camera point and the point it looks at (world). */
export function lookFrom(cam, target, o = {}) {
  const dx = cam[0] - target[0], dy = cam[1] - target[1], dz = cam[2] - target[2];
  const d = Math.hypot(dx, dy, dz);
  const r = (v) => Math.round(v * 100) / 100;
  return { ...P, fov: 30, tx: r(target[0]), ty: r(target[1]), tz: r(target[2]), d: r(d), az: r((Math.atan2(dx, dz) * 180) / Math.PI), el: r((Math.asin(dy / d) * 180) / Math.PI), ...o };
}
/** Is a pose's camera above the ground (≥ 0.6)? For checking poses an act writes by hand. */
export function aboveGround(p) {
  const DEG = Math.PI / 180, ce = Math.cos(p.el * DEG);
  const cx = p.tx + p.d * Math.sin(p.az * DEG) * ce, cy = p.ty + p.d * Math.sin(p.el * DEG);
  return cy - groundY(cx) >= 0.6;
}

/** Where the train stands in the shots the poses are set for (the acts move run / slack and re-aim). */
export const AT = {
  park: { run: RUN.park, slack: 0 }, // 22:49 → 0:58: parked at Nantes, couplers bunched — and the first frame
  depart: { run: RUN.park, slack: 1 }, // 0:58:21: the couplers stretched one by one
  town: { run: RUN.frontenac - 500, slack: 1 }, // t7: 1:15, coming down on rue Frontenac
};
const L = (local) => onLoco(0, AT.park, local); // a point of the LEAD locomotive, parked

/** What a cut to the place sets: the light around the lead locomotive. The acts move fx fy fz fs with the subject. */
export const STAGED = {
  tete: { set: SET.PENTE, ...lit(L([-20, 9, 0]), 70) },
  roue: { set: SET.PENTE, ...lit(L(PARTS.wheel), 14) },
  ville: { set: SET.PENTE, ...lit(onTrack(FRONTENAC.u, [0, 10, 0]), 700) },
};

export const FIRST = {
  // the place (one), and the light: what it stands around (fx fy fz) and its size (fs)
  ...STAGED.roue,
  // the part in fault: `culprit` names it (plan.js CULPRIT: 1 the engine and its turbo · 2 the compressor · 3 the air (cylinder,
  // piston, fittings) · 4 THE SEVEN HAND BRAKES; 0 none), `fault` 0 → 1 lights it red · `ok` 0 → 1 what works in green (compressor,
  // reservoir, the air that holds: setOk) · `depuis` 0 → 1 the correction (light, grid and halo to green; the hand brakes red → green)
  culprit: CULPRIT.handbrakes, fault: 0.55, ok: 0, depuis: 0,
  // THE TRAIN (convoi.js + the five locomotives; world places the locomotives, convoi its own cars, both from the same law):
  // `run` the head's u (plan.js RUN: park 0 · arrive −260 · town 21 800 · frontenac 23 700 · derail 24 050) — the wheels turn with it ·
  // `slack` the couplers 0 bunched → 1 stretched, a wave from the head to the tail · `brakes` how many hand brakes are applied, from
  // the head (0 … 7 = the five locomotives, the VB, the buffer car; > 7 the tank cars' own, for `comment` and `depuis`) — their
  // wheels turn, their chains tighten, they light · `auto` the train's automatic air brake, applied (1) → released (0): the handle on
  // the stand, the cars' cylinders in green · `psi` the locomotives' brake cylinder (plan.js PSI: 70 full · 60 held · 27 the
  // departure · 0): its piston, its shoe on the wheel, the needle of #mano, the air of #colonne · `leak` the puffs of air out of the
  // fittings · `derail` the cars leaving the rails in the curve and folding over (0 → 1), the locomotives carry on
  run: RUN.park, slack: 0, brakes: 7, auto: 0, psi: PSI.depart, leak: 0.4, derail: 0,
  // THE LEAD LOCOMOTIVE (locomotive.js): `engine` the diesel running (1: the compressor turns, the turbo spins, the body hums) ·
  // `smoke` from the stack · `fire` flames out of the stack and the turbo glowing (t3) · `cutaway` its left hood doors lifted off
  // (the engine, the turbo, the compressor, the reservoir seen) · `cab` the cab's left wall and roof lifted off (the stand, the
  // seats) · `crew` helmets on the seats (0 … 2: `depuis`) · `cutoff` the emergency fuel cut-off thrown (0 → 1) · `solo` everything
  // but the lead locomotive gone (the maquette alone on its halo: principe, depuis)
  engine: 0, smoke: 0, fire: 0, cutaway: 0, cab: 0, crew: 0, cutoff: 1, solo: 0,
  // THE PAGE'S INSTRUMENTS (index.html, written by apply — zone haute, one at a time, never with a chip): `mano` the cylinder's
  // manometer shown (its needle reads psi) · `col` the braking column shown (the air AIR_T·psi + the hand brakes Σ HB_T, against
  // the need, 66 t; green while it holds, red under it) · `mark` the « 66 » line lit and kept · `speedo` the speed shown, `kmh`
  // its value (0 … 110; red past the « 16 » of rue Frontenac)
  mano: 0, col: 0, mark: 0, speedo: 0, kmh: 0,
  // THE SLOPE (convoi.js): `pull` the red arrow down the slope (the weight) · `hold` the green arrow up it (the brakes) — on the
  // train's middle, `seuil` · `road` the cars' headlights driving away up route 161 (0 at the head → 1 gone, ≈ 0:44)
  pull: 0, hold: 0, road: 0,
  // LAC-MÉGANTIC (ville.js): `town` its windows and street lights lit (the lights at the bottom of the slope) · `glow` the red glow
  // behind the roofs (issue) · `cross` the crossing's lights at rue Frontenac flashing
  town: 1, glow: 0, cross: 0,
};

/** `depuis`: the seven hand brakes as they failed (red), the train parked again, alone (the solo), before the correction heals them. */
export const BENCHED = {
  ...STAGED.tete, culprit: CULPRIT.handbrakes, fault: 1, run: RUN.park, slack: 0, brakes: 7, psi: 0, auto: 0, leak: 0, derail: 0,
  engine: 0, smoke: 0, fire: 0, cutaway: 0, cab: 0, crew: 0, cutoff: 0, solo: 0, mano: 0, col: 0, mark: 0, speedo: 0, kmh: 0, glow: 0,
};

/* The camera. Each pose is complete (nothing is inherited across a cut). PROVISIONAL: set on grey stubs (docs/journal/CR04-architecte.md);
   the decor agents give the poses that frame best in their journals. Built from a camera point and a target (lookFrom), in the lead
   locomotive's local frame parked (L) or on the track (onTrack). The camera never goes under the ground (aboveGround). */
const T = (u, local) => onTrack(u, local);
export const VIEW = {
  // THE FIRST IMAGE, four candidates (docs/CR04-actes.md « Les candidates »)
  // (a) « descente »: under the frame, between the front and middle wheels, outside the left side frame, at the hub's height: THE
  // wheel fills the left of the frame, its shoe on it; beyond the nose, the rail runs down the slope to the town's lights
  roue: lookFrom(L([-37.4, 1.6, 7.0]), L([-77.4, 2.2, -3.6]), { fov: 54, shift: 0 }),
  // (b) « le train qui file »: low ahead-left of the lead, looking back up the slope: the wheel and its shoe big, the locomotive
  // above, the five locomotives and the tank cars receding uphill into the dark
  file: lookFrom(L([-62, 2.2, 13]), L([-38, 5.5, 2]), { fov: 44, shift: 120 }),
  // (c) « profil bas »: its left flank, very low, the wheel at the left third, the train running off to the right
  profilBas: lookFrom(L([-32, 1.4, 26]), L([-22, 6.5, 0]), { fov: 42, shift: 60 }),
  // (d) « face »: on the track ahead of it, a little to the left: the nose coming down at you, the wheel low on the left
  face: lookFrom(L([-104, 2.0, 6]), L([-40, 7.5, 1]), { fov: 34, shift: 80 }),

  // principe — the lead locomotive alone (solo), front-left three-quarter, higher: its hood opened (cutaway)
  coupe: lookFrom(L([-120, 55, 85]), L([-14, 8, 3]), { fov: 30, shift: 20 }),
  compresseur: lookFrom(L([-36, 24, 26]), L(PARTS.compressor), { fov: 30, shift: 20, ...CLOSE }),
  cylindre: lookFrom(L([-30, 4.5, 20]), L([-39.2, 3.6, 4.5]), { fov: 30, shift: 20, ...CLOSE }),
  volant: lookFrom(L([-17, 17, 21]), L([-27.5, 11.5, 6.6]), { fov: 30, shift: 40, ...CLOSE }),
  // seuil — the whole train on its slope, from downhill-left and above: it recedes up the frame (the arrows on its middle)
  pente: lookFrom(L([-150, 260, 420]), L([2000, 0, 0]), { fov: 30, shift: -60 }),
  // t1 — rolling in, high three-quarter · the slope down to the town · back on the head: five locomotives, one smokes
  arrivee: lookFrom(L([-420, 260, 430]), L([160, 0, 0]), { fov: 30, shift: 0 }),
  vallee: lookFrom(T(2600, [0, 1500, 1700]), T(23300, [0, 0, 0]), { fov: 30, shift: 0 }),
  tete: lookFrom(L([-270, 120, 260]), L([210, 8, 0]), { fov: 30, shift: 20 }),
  // t2 — the control stand, close (cab lifted off) · the train that does not move (wide, low)
  pupitre: lookFrom(L([-35, 18, 13]), L([-39.5, 12.8, -3.6]), { fov: 30, shift: 20, ...CLOSE }),
  immobile: lookFrom(L([-160, 8, 150]), L([200, 9, 0]), { fov: 30, shift: 40 }),
  // t3 — low, front-left three-quarter, looking up at the stack (smoke, then flames) · t4 the fuel cut-off on the left sill
  cheminee: lookFrom(L([-80, 6, 55]), L([-16, 20, 0]), { fov: 30, shift: 60 }),
  coupecircuit: lookFrom(L([15, 6.8, 19]), L([6, 6.6, 7.9]), { fov: 30, shift: 30, ...CLOSE }),
  // t5 — under the frame, the fittings that puff · the road with the headlights leaving · the train alone in the dark
  raccords: lookFrom(L([-8, 1.6, 22]), L([-24, 5.0, 7.0]), { fov: 30, shift: 20, ...CLOSE }),
  route: lookFrom(L([-320, 46, -330]), L([240, 4, -190]), { fov: 30, shift: 20 }),
  seul: lookFrom(L([-760, 14, -270]), L([800, 10, 0]), { fov: 30, shift: 40 }),
  // t6 — low along the left flank, long lens, back up the train: the couplers that stretch one by one
  attelages: lookFrom(L([-30, 5, 30]), L([900, 8, 3]), { fov: 18, shift: 40 }),
  // defaut — the train taking the slope (follow it: re-aim with onLoco as run grows), front-left, low
  prend: lookFrom(L([-130, 14, 62]), L([10, 9, 0]), { fov: 30, shift: 40 }),
  // t7 — Lac-Mégantic: low on the track beyond rue Frontenac, looking up at the train that comes (heading of the curve included) ·
  // the « 16 » sign among the first houses
  frontenac: lookFrom(T(FRONTENAC.u + 400, [0, 160, 120]), T(FRONTENAC.u - 450, [0, 10, 0]), { fov: 34, shift: 0 }),
  panneau: lookFrom(T(FRONTENAC.signU - 70, [0, 4.5, 64]), T(FRONTENAC.signU, [0, 9, 20]), { fov: 30, shift: 40 }),
  // issue — far and high, beyond the town's outer side: the curve, the cars folding, the glow behind the roofs
  courbe: lookFrom(T(24500, [0, 520, -1400]), T(24700, [0, 0, 0]), { fov: 30 }),
  // depuis — the cab (two seats, two helmets) · the row of tank cars' hand brakes, low along the flank
  cabine: lookFrom(L([-31, 19, 13]), L([-36.5, 11, 0]), { fov: 30, shift: 20, ...CLOSE }),
  rangee: lookFrom(L([600, 14, 95]), L([1150, 13, 0]), { fov: 26, shift: 30 }),
  couverture: lookFrom(L([-62, 2.2, 13]), L([-38, 5.5, 2]), { fov: 44, shift: 160 }),
};
/** The first frame: candidate (b) « file » until the board of four on the real decors (.cache/planches/CR04/premiere-image/). Sharp. */
export const POSE0 = { ...VIEW.roue, d: 60, ty: VIEW.roue.ty + 3, drift: 0 }; // image 0 chosen by the chef (a60 ty+3: low, along the rail to the town lights, the red hand-brake chain)

/* ── THE PAGE'S INSTRUMENTS (index.html), written only when they change ── */
function writers() {
  const $ = (id) => (typeof document !== "undefined" ? document.getElementById(id) : null);
  const mano = $("mano"), needle = $("mano-needle"), manoVal = $("mano-val");
  const col = $("colonne"), colAir = $("col-air"), colHb = $("col-hb"), colVal = $("col-val"), colMark = $("col-mark");
  const speed = $("vitesse"), speedVal = $("vitesse-val"), speedBar = $("vitesse-bar");
  const last = {};
  const set = (k, v, fn) => {
    if (last[k] === v) return;
    last[k] = v;
    fn(v);
  };
  const r2 = (v) => Math.round(v * 100) / 100;
  return (S, air, hb) => {
    if (mano) {
      set("mo", r2(S.mano), (v) => (mano.style.opacity = String(v)));
      const p = Math.round(Math.max(0, Math.min(100, S.psi)) * 10) / 10;
      set("mp", p, (v) => {
        needle.style.transform = `rotate(${-90 + (180 * v) / 100}deg)`;
        manoVal.textContent = String(Math.round(v));
      });
      set("mz", S.engine > 0.5 ? "ok" : "rouge", (v) => (mano.dataset.zone = v));
    }
    if (col) {
      set("co", r2(S.col), (v) => (col.style.opacity = String(v)));
      const a = Math.round(air * 10) / 10, h = Math.round(hb * 10) / 10;
      set("ca", a, (v) => (colAir.style.height = `${(100 * v) / FORCE.max}%`));
      set("ch", h, (v) => (colHb.style.height = `${(100 * v) / FORCE.max}%`));
      set("cv", Math.round(a + h), (v) => (colVal.textContent = String(v)));
      set("cz", a + h >= FORCE.need ? "ok" : "rouge", (v) => (col.dataset.zone = v));
      set("cm", r2(S.mark), (v) => (colMark.style.opacity = String(v)));
      set("cn", Math.max(0, Math.min(7, Math.floor(S.brakes + 1e-4))), (v) => (col.dataset.brakes = String(v)));
    }
    if (speed) {
      set("so", r2(S.speedo), (v) => (speed.style.opacity = String(v)));
      const k = Math.round(Math.max(0, Math.min(110, S.kmh)));
      set("sv", k, (v) => {
        speedVal.textContent = String(v);
        speedBar.style.width = `${(100 * v) / 110}%`;
        speed.dataset.zone = v > 16 ? "rouge" : "ok";
      });
    }
  };
}

export function buildWorld(stage) {
  const { scene } = stage;
  const recon = setupReconstitution(stage, { floor: 0 });
  const locos = CONSIST.filter((c) => c.kind === "loco").map((c) => buildLocomotive({ lead: c.lead }));
  const convoi = buildConvoi();
  const ville = buildVille();
  for (const l of locos) {
    l.group.matrixAutoUpdate = false;
    scene.add(l.group);
  }
  scene.add(convoi.group, ville.group);
  const lead = locos[0];
  /** The seven hand brakes as one (for the red circle and the halo of culprit 4): placed every frame at their middle. */
  const seven = new THREE.Object3D();
  scene.add(seven);
  const m = new THREE.Matrix4(), vx = new THREE.Vector3(), vy = new THREE.Vector3(), vz = new THREE.Vector3();
  const faultAt = new THREE.Vector3();
  const write = writers();

  return {
    locos, lead, convoi, ville,
    A: { seven },
    /** Every frame (and several times per frame: it depends on S and `time` only — no allocation). */
    apply(S, time) {
      const px = stage.pixelScale();
      setOk(S.ok ?? 0); // before the sets' update: their setAlarm reads it
      // the five locomotives on the track (vehicles 0 … 4)
      for (let i = 0; i < locos.length; i++) {
        const f = trackFrame(vehicleU(i, S.run, S.slack));
        vx.set(...f.ax); vy.set(...f.ay); vz.set(...f.az);
        m.makeBasis(vx, vy, vz).setPosition(f.p[0], f.p[1], f.p[2]);
        locos[i].group.matrix.copy(m);
        locos[i].group.matrixWorldNeedsUpdate = true;
        locos[i].group.visible = i === 0 || S.solo < 0.5;
        locos[i].update(S, time, px, i);
      }
      convoi.update(S, time, px);
      ville.update(S, time, px);
      const s0 = onLoco(0, S, [0, 13, 7]), s6 = onLoco(6, S, [0, 13, 7]);
      seven.position.set((s0[0] + s6[0]) / 2, (s0[1] + s6[1]) / 2, (s0[2] + s6[2]) / 2);
      seven.updateMatrixWorld();
      Object.assign(stage.focus, { x: S.fx, y: S.fy, z: S.fz, scale: S.fs });
      // the halo under the part in fault (on the ground under it): the lead's anchors for 1 … 3, the seven together for 4
      const c = Math.round(S.culprit);
      const owner = c === CULPRIT.handbrakes ? seven : c === CULPRIT.engine ? lead.A.turbo : c === CULPRIT.compressor ? lead.A.compressor : lead.A.cylinder;
      owner.getWorldPosition(faultAt);
      const heal = c === CULPRIT.handbrakes ? S.depuis : 0;
      const k = c > 0 ? S.fault : 0;
      const r = c === CULPRIT.handbrakes ? 330 : 40;
      recon.halo({ at: [faultAt.x, groundY(faultAt.x) + 0.8, faultAt.z], r, amount: 0.5 * Math.max(k, heal), k: heal });
      recon.setMood(S.depuis); // after stage.focus: the light re-aims
      // THE FLOOR IS THE SLOPE: the warm floor (its grid, its amber pool, the shadow catcher) tilted onto plan.js GROUND, under the focus
      if (recon.floor) {
        recon.floor.position.y = groundY(recon.floor.position.x) + 0.02;
        recon.floor.rotation.z = GROUND_TILT;
      }
      if (scene.fog) scene.fog.density = S.fs > 400 ? 0.000018 : 0.00006;
      // the instruments: the air of the locomotives' cylinders and the applied hand brakes, in tonnes-force (plan.js FORCE)
      const air = FORCE.airPerPsi * Math.max(0, S.psi);
      let hb = 0;
      for (let i = 0; i < 40; i++) hb += HB_T(i) * Math.max(0, Math.min(1, S.brakes - i));
      write(S, air, hb);
    },
  };
}
