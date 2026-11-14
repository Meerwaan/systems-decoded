// CR04 — Lac-Mégantic : the plan. Centimetres of MAQUETTE (1:20), y up. No import here: locomotive.js, convoi.js, ville.js and
// world.js all read it — it is what lets them be built at the same time. Pure numbers and pure functions only.
//
// « LE NOIR CHAUD » (kit/lib/reconstitution.js, docs/reconstitution.md): the studio 3D of the dossiers, turned warm. Every piece is a
// maquette in satin clay (clay({ tone }), clayEdges()), under the stage's softbox key and an amber spot that follows stage.focus.
// Colour code (Merwan, 05/11): veille GREEN = what works (the compressor that runs, the air that holds, the hand brakes of `depuis`) ·
// alarme RED = the incident (the fire, the compressor that stops, the air that leaks, THE SEVEN HAND BRAKES — the part in fault) ·
// AMBER = the time (header) and the mood. One red PART at a time (alarm() + setAlarm(mat, k), chosen by S.culprit, see CULPRIT).
//
// ONE PLACE. The whole film stands on ONE inclined plane — the slope from Nantes down to Lac-Mégantic — with the track on it, the
// train on the track, the road beside the parked train, the town at the bottom. THE GROUND IS THE STUDIO FLOOR: world.js tilts the
// warm floor of setupReconstitution (its amber grid, its halo) onto the plane GROUND every frame, under the focus; no decor builds a
// ground of its own (only the ballast, the road, the streets, the plots). So everything that stands on the ground stands on
// y = groundY(x), and stays VERTICAL (houses, signs, poles); only what rides the track tilts with it (trackFrame).
//
// AXES: the train runs DOWNHILL toward −x (toward the town); x positive is uphill (toward Nantes, behind the parked train).
// Every vehicle's LOCAL FRAME: origin on the rail top, at mid-length, on the track's axis; its FRONT toward −x, its LEFT flank toward
// +z, y up. The lead locomotive's cab end is its front. AZIMUTH (kit/lib/stage.js l. 381: the camera stands at
// t + d·(sin az · cos el, sin el, cos az · cos el)): az 0 stands at +z and sees the LEFT flank (+z) · az −90 stands at −x and sees
// the FRONT (the cab, the town behind the camera) · az +90 stands at +x, behind the train, looking downhill (toward the town) ·
// az −30 … −70 the front-left three-quarter. On the curve in town add the track's heading (world.js poseOn does it). el < 0 looks
// up. `shift` positive moves the picture up. A mechanism is never filmed face on. The camera never goes under the ground:
// cam y ≥ groundY(cam x) + 0.6 (world.js aboveGround checks the poses).
//
// SCALE: the vehicles at 1:20 (GE C30-7: 20.5 m → 102.5; wheel Ø 40 in → r 2.54; gauge 1 435 mm → 7.18). DISTANCES ARE
// COMPRESSED (Nantes → Lac-Mégantic 11.6 km would be 58 000: here 23 700, ≈ 2.4×) and THE SLOPE IS ACCENTUATED (0.92 % → 3.5 %,
// so that it reads): `sources` says the picture reconstitutes. NO size is ever written on screen except in the chips the voice says.

/** The inclined plane every ground thing stands on: y = groundY(x). Uphill toward +x. */
export const GROUND = { g: 0.035 };
export const groundY = (x) => GROUND.g * x;
/** The tilt of that plane about z (rad): world.js turns the studio floor by it. */
export const GROUND_TILT = Math.atan(GROUND.g);

/* ───────────── THE TRACK (convoi.js builds it, everyone reads it) ─────────────
   u = the distance ALONG the track (arc length, units), increasing DOWNHILL. u 0 = where the head of the parked train stands (its
   front coupler face). Straight along −x until CURVE.u0, then a circular arc to the LEFT (+z) of radius CURVE.r through the town,
   then straight again. The rail top stands RAIL.top above the ground. */
export const TRACK = { from: -8200, to: 27500 };
export const RAIL = { top: 3.0, gauge: 7.18, head: 0.9, tie: 13, ballast: 1.6 }; // rail top above ground · gauge · rail height · tie length · ballast thickness
export const CURVE = { u0: 23200, r: 2600, phiMax: 0.9 }; // the curve in Lac-Mégantic (to the left, +z)

/** The track's axis at u: [x, z] and its heading phi (rad, 0 = toward −x, + turns toward +z). */
export function trackXZ(u) {
  const { u0, r, phiMax } = CURVE;
  if (u <= u0) return { x: -u, z: 0, phi: 0 };
  const s = u - u0;
  const sMax = r * phiMax;
  if (s <= sMax) {
    const phi = s / r;
    return { x: -u0 - r * Math.sin(phi), z: r * (1 - Math.cos(phi)), phi };
  }
  const xe = -u0 - r * Math.sin(phiMax), ze = r * (1 - Math.cos(phiMax)), k = s - sMax;
  return { x: xe - k * Math.cos(phiMax), z: ze + k * Math.sin(phiMax), phi: phiMax };
}
/** The rail top at u (world point). */
export function trackPoint(u) {
  const { x, z } = trackXZ(u);
  return [x, groundY(x) + RAIL.top, z];
}
/** A vehicle's frame at u: its origin p (rail top), and its local axes in the world — ax (local +x: BACKWARD, uphill along the track),
    ay (local up, square to the slope), az (local +z: its LEFT). Build a THREE.Matrix4 with makeBasis(ax, ay, az) + setPosition(p). */
export function trackFrame(u) {
  const { x, z, phi } = trackXZ(u);
  const p = [x, groundY(x) + RAIL.top, z];
  // backward direction on the ground plane: (cos phi, ·, −sin phi), with the slope's rise
  const bx = Math.cos(phi), bz = -Math.sin(phi), by = GROUND.g * bx;
  const n = Math.hypot(bx, by, bz);
  const ax = [bx / n, by / n, bz / n];
  // up: the plane's normal (−g, 1, 0) normalised, made square to ax
  let ux = -GROUND.g, uy = 1, uz = 0;
  const dot = ux * ax[0] + uy * ax[1] + uz * ax[2];
  ux -= dot * ax[0]; uy -= dot * ax[1]; uz -= dot * ax[2];
  const m = Math.hypot(ux, uy, uz);
  const ay = [ux / m, uy / m, uz / m];
  const az = [ax[1] * ay[2] - ax[2] * ay[1], ax[2] * ay[0] - ax[0] * ay[2], ax[0] * ay[1] - ax[1] * ay[0]];
  return { p, ax, ay, az, phi };
}

/* ───────────── THE TRAIN MMA-002 (BST R13D0054 § 1.1) ─────────────
   From the head: 5 locomotives (the lead, MMA 5017, a GE C30-7: the only one running), the « VB car » (a special-purpose car), the
   buffer car (wagon tampon, a box car), 72 DOT-111 tank cars of crude. Lengths over couplers at 1:20. ≈ 10 290 t, 4 700 ft. */
export const LEN = { loco: 102.5, vb: 76, tampon: 80, citerne: 90 };
export const CONSIST = [
  ...Array.from({ length: 5 }, (_, i) => ({ kind: "loco", len: LEN.loco, lead: i === 0 })),
  { kind: "vb", len: LEN.vb },
  { kind: "tampon", len: LEN.tampon },
  ...Array.from({ length: 72 }, () => ({ kind: "citerne", len: LEN.citerne })),
];
/** The couplers' play, stretched: S.slack 0 = every gap closed (the train bunched, parked) → 1 = every gap open, the wave running
    from the head to the tail (vehicle i's gap opens while slack·N goes from i to i + 1). */
export const SLACK = { max: 1.4 };
/** u of vehicle i's MIDDLE for the head at u = run (S.run) and the couplers at S.slack. */
export function vehicleU(i, run, slack = 0) {
  const N = CONSIST.length;
  let u = run;
  for (let j = 0; j < i; j++) {
    u -= CONSIST[j].len;
    u -= SLACK.max * Math.max(0, Math.min(1, slack * N - j));
  }
  return u - CONSIST[i].len / 2;
}

/** S.run: the head's u. 0 = parked at Nantes (22:49 → 0:58); the acts read these. */
export const RUN = {
  park: 0, // the parked train (and the first frame: the wheel starts to turn from here)
  arrive: -260, // t1: rolling in, it stops at park
  town: 21800, // t7: the head enters Lac-Mégantic (the first houses)
  frontenac: 23700, // the level crossing of rue Frontenac (the 10 mph limit, « seize »)
  derail: 24050, // issue: the cars leave the rails in the curve; the locomotives, uncoupled, carry on
};
/** The level crossing (ville.js): its u, and the road's half-width. The « 16 » limit sign stands RUN.frontenac − 380 on the left. */
export const FRONTENAC = { u: RUN.frontenac, half: 52, signU: RUN.frontenac - 380 };
/** Where the cars pile (convoi.js, S.derail 0 → 1): the cars that reach u ≥ PILE.u leave the rails and fold over, PILE.spread wide. */
export const PILE = { u: RUN.derail, len: 1300, spread: 520 };

/* ───────────── THE LEAD LOCOMOTIVE, GE C30-7 MMA 5017 (locomotive.js) ─────────────
   Local frame as above (origin rail top, mid-length; front −x; left +z). Values ≈ from the published C30-7 diagram (67 ft 3 in,
   10 ft 3 in, 15 ft 4 in; FB-2 C-C trucks, 13 ft 7 in wheelbase, 40 in wheels): the decor agent recalibrates the shape on a public
   photo / diagram, and KEEPS THE ANCHORS where these numbers put them (world.js and the acts aim at them). */
export const LOCO = {
  len: 102.5, w: 15.6,
  deck: 7.6, // the walkway (running board) above the rail
  hoodTop: 20.4, cabTop: 23.4, // the long hood's top, the cab roof
  x: { nose: -51.25, shortHood: [-49, -43.5], cab: [-43.5, -30], longHood: [-30, 48], radiator: [30, 48], tail: 51.25 },
  trucks: [-33.2, 33.2], // the two trucks' centres (x); 3 axles each, at ±AXLE around the centre
  axle: 10.35,
  wheel: { r: 2.54, w: 0.7, z: 3.59 }, // radius, tread width, the tread's centre (z ±): on the rail
};
/** THE parts the film names (local frame of the LEAD loco). Each is an anchor `A.<name>` of locomotive.js. */
export const PARTS = {
  wheel: [-43.55, 2.54, 3.59], // « la roue de tête »: front truck, front axle, LEFT wheel — the first image
  shoe: [-41.0, 2.54, 3.59], // its brake shoe, on the tread, on the truck-centre side of the wheel
  cylinder: [-38.6, 4.6, 5.4], // the brake cylinder on the truck's left side frame, its axis along x; its piston pushes the shoe
  volant: [-27.5, 13.0, 6.9], // the hand brake wheel (r 1.4), vertical, on the long hood's left wall (z ≈ 6.5), facing +z, above the walkway — reconstituted
  chain: [-33.0, 4.0, 6.6], // where its chain reaches the front truck's rigging
  compressor: [-24.5, 11.0, 0], // the air compressor, behind the cab, driven by the engine (in the hood)
  reservoir: [2.0, 4.0, 3.6], // the main reservoir(s), under the frame between the trucks (two tanks at z ±3.6)
  engine: [2.0, 12.5, 0], // the diesel (GE FDL-16), in the long hood
  turbo: [-16.0, 16.0, 0], // its turbocharger, under the exhaust stack — the oil that overheated there smoked, then burned
  stack: [-16.0, 20.4, 0], // the exhaust stack on the hood top (smoke, then flames)
  cutoff: [6.0, 6.6, 7.9], // the emergency fuel cut-off on the left sill (what the firefighters used, 23:58)
  stand: [-38.5, 12.5, -4.4], // the control stand in the cab, engineer's side (RIGHT, −z): automatic + independent brake handles
  seats: [[-36.0, 10.0, -4.2], [-36.0, 10.0, 4.2]], // the two seats (engineer right, conductor left)
};
/** The other four locomotives reuse the lead's silhouette (closed hoods, their own hand brake wheel at PARTS.volant): reconstituted. */

/* ───────────── THE BRAKING FORCE (the column, index.html #colonne; BST § 1.14.2.3, 2.2) ─────────────
   tonnes-force. NEED ≈ 146 700 lb ≈ 66.5 t to hold the train on the slope (« soixante-six tonnes »). The locomotives' independent
   air brake: ≈ 1.62 t per psi of the cylinder (249 760 lb at ≈ 70 psi; 97 400 lb at 27 psi) — world.js: air = AIR_T · S.psi. The
   hand brakes: 7 gave ≈ 48 600 lb ≈ 22.0 t (5 locomotives ≈ 2.5 t each; the VB and the buffer car ≈ 4.75 t each); a tank car's
   ≈ 8 650 lb ≈ 3.9 t. world.js: hb = Σ HB_T[i] over the S.brakes first vehicles. At the departure (0:58:21, 27 psi): 43.7 + 22.0 =
   65.7 t, just under 66.5 (« quelques centaines de kilos »). Seven hand brakes alone: 22 / 66 = « à peine un tiers ». */
export const FORCE = { need: 66.5, max: 120, airPerPsi: 1.62 };
export const HB_T = (i) => (i < 5 ? 2.5 : i < 7 ? 4.75 : 3.9);
/** The cylinder pressure the acts move (S.psi): 70 full · 60 after the hand brakes (the QRB valve bled ≈ 15 %) · 27 at the departure. */
export const PSI = { full: 70, held: 60, depart: 27, perMin: 1 };

/** The part in fault (S.culprit), one table for all; 0 none. Red only while S.fault says so. */
export const CULPRIT = {
  engine: 1, // the engine and its turbo (t3: « mal réparé », the fire) — locomotive.js A.turbo
  compressor: 2, // the compressor that stops (t4) — locomotive.js A.compressor
  air: 3, // the air that leaks: the cylinder, its piston, the fittings (t5, defaut) — locomotive.js A.cylinder
  handbrakes: 4, // THE SEVEN HAND BRAKES (defaut; healed green in `depuis`) — the 5 locomotives' wheels + the VB's + the buffer car's
};

/* ───────────── NANTES (convoi.js) — the road beside the parked train ─────────────
   Route 161 runs along the track on its RIGHT (−z), from behind the tail to past the head; S.road 0 → 1: a few cars' headlights
   leave the head and drive away uphill (≈ 0:44, « tout le monde repart »). */
export const ROAD = { z: -190, half: 18, from: -8000, to: 2500 };

/* ───────────── LAC-MÉGANTIC (ville.js) — the downtown at the bottom of the slope ─────────────
   Houses and shops in clay along the curve, from RUN.town to the far end of the curve, on both sides; rue Frontenac crosses the
   track at FRONTENAC.u, square to it; the lake beyond (a dark flat on the right of the curve). */
export const TOWN = { from: 21300, to: 26800, depth: 1600 };
