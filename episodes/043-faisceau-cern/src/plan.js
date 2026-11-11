// DOSSIER 043 — Le faisceau du CERN : where everything stands. No import: numbers and pure helpers only, shared by
// anneau.js (the ring, its tunnel, the train, the grain), sortie.js (point 6: the kickers, the septa, the line, the
// dilution magnets, the block) and world.js.
//
// UNITS AND AXES. Centimetres, y up. The beam axis lies in the plane y = 0.
// A MAQUETTE AT THE SCALE OF THE SUBJECT (docs/memoire/regles-image.md, the 008 rule): the real ring is 26.7 km round,
// a bunch 7.5 m from the next, the line 700 m long, the block 8.5 m — nothing of that holds in one vertical frame with
// the bunches visible. So: the ring is 283 m round (×≈ 94 shorter), the bunches 9.6 cm apart (×≈ 80 closer), the line
// 20 m (×≈ 35 shorter); the block, the kickers, the dilution magnets keep shapes of their real proportions. NO length,
// size or distance is ever displayed on this set; the voice gives the true orders of magnitude; `sources` says so.
//
// THE RING. Centre RING.centre, radius RING.r, in the plane y = 0. The grain falls at the ORIGIN, G = (0, 0, 0), where
// the beam runs toward −x (the « front » of kit/lib/stage.js: az −90 looks at it from −x, the beam comes at the lens).
// Outside the ring is +z at G, inside is −z. Arc coordinate `s` (cm) is measured ALONG THE BEAM from G (s > 0 downstream,
// toward −x at G; the ring is C cm round, s is taken modulo C). ringAt(s) gives the point, the beam's direction, the
// outward normal.
//
// THE CAMERA (kit/lib/stage.js, checked by 042): camera = target + d·(sin az·cos el, sin el, cos az·cos el); the
// picture's right = (cos az, 0, −sin az). So az 0 looks at the +z flank (from outside the ring, at G), az −90 looks
// from −x along the beam (the train comes at the lens), az ±180 from inside the ring. A portrait frame sees a width of
// ≈ 0.34·d at fov 34 (0.30·d at fov 30, 0.45·d at fov 44).

export const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

/** The ring maquette. C ≈ 28 274 cm. */
export const RING = { centre: [0, 0, -4500], r: 4500 };
export const C = TAU * RING.r;

/** Arc coordinate s → { p: point, t: the beam's direction (unit), n: outward normal (unit), th: angle }. Pure. */
export function ringAt(s, out = { p: [0, 0, 0], t: [0, 0, 0], n: [0, 0, 0], th: 0 }) {
  const th = s / RING.r; // downstream = increasing s = turning toward −x at G
  const sn = Math.sin(th), cs = Math.cos(th);
  out.p[0] = RING.centre[0] - RING.r * sn; out.p[1] = 0; out.p[2] = RING.centre[2] + RING.r * cs;
  out.t[0] = -cs; out.t[1] = 0; out.t[2] = -sn;
  out.n[0] = -sn; out.n[1] = 0; out.n[2] = cs;
  out.th = th;
  return out;
}
/** s wrapped into [0, C). */
export const wrap = (s) => ((s % C) + C) % C;

/** The beam pipe and the arc magnets, aux rayons X (the struck magnet's coil is the only thing that turns solid-hot).
 *  Real: cold bore Ø 5 cm, coil ≈ 2.8–6 cm, yoke Ø 55 cm, cryostat Ø 91 cm, dipole 15 m; two apertures 19.4 cm apart.
 *  Maquette: pipe and coil ×1.8 (so the bunches read), yoke and cryostat true, the dipole 590 cm in a 628 cm period. */
export const PIPE = { r: 4.5 };
export const MAGNET = {
  count: 45, // 45 × 628.3 = C: one every 628.3 cm, all round, except where point 6 stands (see INSERTION)
  period: C / 45,
  length: 590,
  coil: { rIn: 5.5, rOut: 10 }, // two half-shells round the pipe
  yoke: { r: 28 },
  cryo: { r: 46 },
  twin: 19.4, // the other beam's aperture, toward the ring's inside (−n): empty, fine lines only
  firstAt: 19, // magnet 0 starts 19 cm downstream of G: the grain falls in the interconnect gap (s −19 … +19)
};
/** The tunnel round the magnets, aux rayons X: real Ø 3.8 m. Its axis stands `inward` toward the ring's inside and
 *  `up` above the beam; its floor (a grid, never a solid floor) at y = floor. */
export const TUNNEL = { r: 190, inward: 60, up: 45, floor: -105 };

/** The beam: 52 « wagons » of 48 bunches (2 496 ≈ the 2 500 of Run 3) with 7 empty places between wagons, and the
 *  abort gap (3 µs out of the 88.9 µs of one turn = 3.37 % of the ring) — real filling schemes do group the bunches
 *  in trains; drawn here so the train reads as a TRAIN in motion (the inner rhythm blurs, the wagons run).
 *  slot = the spacing of the places; bunch: a capsule `len` long, radius `r`. */
export const BEAM = (() => {
  const wagons = 52, perWagon = 48, between = 7;
  const gap = C * (3 / 88.9);
  const places = wagons * perWagon + (wagons - 1) * between; // 2 853 places
  const slot = (C - gap) / places;
  return { wagons, perWagon, between, n: wagons * perWagon, places, gap, slot, len: 5, r: 1.1, turnUs: 88.9, gapUs: 3 };
})();

/** The grain (a « UFO »: micrometre dust; drawn as a signal bead, huge for the eye) falls from the top of the beam
 *  pipe (y = +PIPE.r − 0.4) to the beam's axis, at G. */
export const GRAIN = { at: [0, 0, 0], r: 0.6, top: PIPE.r - 0.4 };
/** The magnet the shower strikes: magnet 0, just downstream of G (x ≈ −19 … −609). The hit point on its coil. */
export const STRUCK = { magnet: 0, hitS: 140, hitAngle: 200 * DEG /* round the pipe, from +n toward +y */ };

/** The loss monitors (BLM): 3 600, as many as there are, in 600 groups of 6 on the cryostats' outer flank (+n, a bit
 *  above the axis). Close up only the group by the grain reads (`GRAIN_GROUP`); far away they draw the ring dotted. */
export const BLM = { count: 3600, groups: 600, perGroup: 6, size: [10, 3, 3] /* along, up, across */, offset: [0, 24, 41] /* along, up, out from the beam: on the cryostat (r 46), upper outer flank */ };
export const GRAIN_GROUP = 0; // the group at s ≈ 0 … 47 cm (just downstream of the grain): the one whose bar rises

/** POINT 6, the way out. The kickers' centre stands a quarter-ring UPSTREAM of the grain. */
export const S6 = wrap(-RING.r * Math.PI / 2); // ≈ 21 206 cm downstream of G = 7 069 cm upstream
/** No arc magnets between these arc positions (the insertion: the pipe runs bare through the kickers). */
export const INSERTION = { from: S6 - 420, to: S6 + 1000 };
/** The extraction line: a straight line from K = ringAt(S6).p, along the beam's direction there turned LINE.angle
 *  outward (the maquette exaggerates the real fraction of a milliradian, so the branch reads). u = cm along it. */
export const LINE = { angle: 3 * DEG, length: 2960 /* K → the block's face */, pipe: { r0: 6, r1: 22 /* widens toward the block */ }, tunnel: { r: 130, floor: -110 } };
/** u → point on the extraction line. Pure. */
export function lineAt(u, out = [0, 0, 0]) {
  const k = ringAt(S6);
  const a = LINE.angle;
  const dx = k.t[0] * Math.cos(a) + k.n[0] * Math.sin(a);
  const dz = k.t[2] * Math.cos(a) + k.n[2] * Math.sin(a);
  out[0] = k.p[0] + dx * u; out[1] = 0; out[2] = k.p[2] + dz * u;
  return out;
}
/** The line's direction (unit), constant. */
export const LINE_DIR = (() => {
  const k = ringAt(S6);
  return [k.t[0] * Math.cos(LINE.angle) + k.n[0] * Math.sin(LINE.angle), 0, k.t[2] * Math.cos(LINE.angle) + k.n[2] * Math.sin(LINE.angle)];
})();

/** The 15 extraction kickers (MKD), on the ring pipe, centred on S6 (arc positions). Real: C-core ferrite magnets in
 *  vacuum tanks, ≈ 1.4 m each; drawn: tanks `r`, `len` long, one every `period`. SOLID: they are the system. */
export const KICKERS = { count: 15, period: 30, len: 26, r: 13 };
/** The 15 septa (MSD) — what really bends the beam out (the voice counts the kickers only; never show « 15 » on
 *  these). Along the LINE, u from `from` to `from + count·period`. Box section `w` × `h`, `len` long. SOLID. */
export const SEPTA = { count: 15, from: 420, period: 36, len: 32, w: 22, h: 26 };
/** The branch: where the line's own pipe leaves the ring's (u at the septa's end). */
export const BRANCH = { u: SEPTA.from + SEPTA.count * SEPTA.period }; // 960
/** The 10 dilution magnets (MKB): 4 horizontal then 6 vertical, along the line (u). SOLID. */
export const DILUTION = { h: 4, v: 6, from: BRANCH.u + 150, period: 50, len: 40, w: 30, hgt: 30 };
/** The block (TDE): a steel vessel round a graphite core, its entrance face at u = LINE.length. Real: 8.52 m long,
 *  Ø 0.722 m, ≈ 6 t (6.2 t), graphite. Kept at its true size: the hero. The vessel X-ray (« coque d'acier aux rayons X »),
 *  the core SOLID. The « e » is painted on the core's entrance face: a 1.2 m trace curled inside a 0.70 m disc. */
export const BLOCK = { u: LINE.length, len: 852, r: 36.1, core: 35, wall: 1.1, floor: -120 };
/** The « e » on the face, in the face's own frame (cm from the face's centre; x right when looking downstream, y up):
 *  an open loop of radius `loop` and its bar. Its total length ≈ `trace` (the source's 1.2 m). Never wider than the face. */
export const ETRACE = { trace: 120, loop: 15, bar: 30 };
/** The cavern round the block, aux rayons X, and the shielding blocks that close it (iron, concrete). */
export const CAVERN = { w: 420, h: 320, len: 1400, floor: -120 };
/** The block's halo: a veille pool on the cavern floor (the system « sur son halo »). */
export const HALO = { r: 260 };

/** The 044 teaser (fin.js, « Prochain dossier »): its own dark floor, far from the ring (nothing of it in any shot of
 *  the ring). A glass vest under seals, a stone that turns into a flattened bullet. */
export const TEASER = { at: [-30000, 0, 30000] };

/** Where things are, for the light's stand-points and the poses (world.js). */
export const PLACES = {
  grain: [0, 0, 0],
  kick: ringAt(S6).p.slice(),
  branch: lineAt(BRANCH.u),
  dilution: lineAt(DILUTION.from + 4.5 * DILUTION.period),
  face: lineAt(BLOCK.u),
  block: lineAt(BLOCK.u + BLOCK.len / 2),
  ring: RING.centre.slice(),
};
