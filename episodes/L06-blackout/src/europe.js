// DOSSIER L06 — Blackout : THE MAQUETTE OF EUROPE (the CARTE place) — the film's centrepiece.
// Brief: docs/L06-decors.md § europe.js. Numbers: world.js · FIRST (each one commented there). Journal: docs/journal/L06-europe.md.
//
//   buildEurope() → {
//     group,                 the CARTE place (world.js adds it to the scene): east +x, north −z, the plates' top at y = 0
//     A: {                   anchors (Object3D, world positions follow the plates when they drift)
//       dial,                where world.js stands model.js's frequency dial (plan.js · DIAL_AT), on the West's rim
//       you,                 your home in France (the veille dot)
//       paris, lisbonne, varsovie, bruxelles, madrid, rome,
//       papenburg, landesbergen, wehrendorf, bielefeld, elsen, bechterdissen, main, ernsthofen, mikulowa, tarifa,
//       (and every other key of plan.js · PLACE),
//       plant,               the power plant the camera dives into (« Au centre, les alternateurs… » → the bench)
//       crack,               the middle of the West | North-East split (Germany, south of the Main)
//       west, east, south,   the middle of each plate (they follow `apartE` / `apartS`)
//     },
//     update(S, time, px)    every frame, sixteen times per frame: depends on S and time only, no allocation
//   }
//
// What `update` reads in S (world.js · FIRST): land explode named net flow plants subs homes pays zones zoneLit scan
// scanAll pulse region emsCut works load alarm n1ok n1sim lw phone volt cascade crack apartE apartS weld turnW turnE turnS
// lost reserve pumps smallOut whatif relays shed relit hydro surplus windOut windBack poland crack2 maroc italy iberia
// bxl share thread you
//
// HOW IT IS BUILT
//   · THE LAND: every country is a ring of shared ARCS (a border is written once, both neighbours use it; an arc used
//     once is a coast or the grid's outer edge). The outlines are this file's (simplified, 12–40 points a country);
//     WHICH PLATE a country stands on is read in plan.js · PLATE and WHERE the plates part in plan.js · SPLIT: nothing
//     of that is written here. A country the split's drawn line touches is cut along it, geometrically (a country
//     PLATE gives whole keeps the part beyond the line's free ends); the others go whole to their plate.
//   · THREE SOLID PLATES (dark tops, lighter machined walls along the coasts and along the split), their borders
//     engraved as fine ink ribbons, over a table that is only a grid and a halo. Out of the synchronous grid: glass.
//   · THE 380 kV GRID: a schematic mesh (≈ 100 nodes, ≈ 175 links) of RIBBONS drawn in screen space (the idiom of
//     L02/ligne.js: as wide as written or 1.8 px, "the brightest wins"). A link that crosses the split is cut there,
//     each half on its plate: the cascade (`cascade`) and the split (`crack`) put them out, north to south.
//   · Everything else (homes, relays, wind farms, postes: points; plants: small solid rotors and their veille mark;
//     the split's light; the control areas, the sweeps: a layer of light on the plates' top) reads S and time.
import * as THREE from "three";
import { BRAND } from "@kit/brand.js";
import { solid, cyl } from "@kit/build3d.js";
import { makeSurface } from "@kit/atmo.js";
import { rng } from "@kit/rng.js";
import { MAP, PLACE, SPLIT, PLATE, MAIN_RIVER, DIAL_AT, ROTOR, geo as lonlat } from "./plan.js";

const INK = new THREE.Color(BRAND.ink);
const VEI = new THREE.Color(BRAND.veille);
const SIG = new THREE.Color(BRAND.signal);
const DEG = Math.PI / 180;

/* ───────────────────────────── the outlines (longitude °E, latitude °N) ───────────────────────────── */
// the points where three outlines meet (or a border meets the sea)
const J = {
  A1: [-8.87, 41.87], A2: [-7.4, 37.18], B1: [-1.78, 43.37], B2: [3.17, 42.43], C1: [2.55, 51.08], C2: [3.37, 51.37], C3: [6.02, 50.75], C4: [6.13, 50.13],
  C5: [7.1, 53.3], D1: [7.53, 43.78], D2: [7.04, 45.92], D3: [7.59, 47.59], D4: [6.37, 49.46], D5: [5.82, 49.55], E1: [8.65, 54.9], E2: [9.6, 54.85],
  E3: [14.22, 53.92], E4: [14.82, 50.87], E5: [13.83, 48.77], E6: [9.6, 47.53], F1: [19.8, 54.45], G1: [22.56, 49.09], G2: [23.1, 49.75], G3: [18.85, 49.52],
  H1: [16.95, 48.62], H2: [17.16, 48.01], H3: [22.15, 48.4], H4: [22.9, 47.95], H5: [24.95, 47.72], I1: [10.47, 46.87], I2: [13.7, 46.52], I3: [16.1, 46.87],
  I4: [16.57, 46.47], J1: [13.72, 45.6], J2: [13.6, 45.47], K1: [18.9, 45.92], K2: [19.02, 44.86], K4: [18.5, 42.45], L1: [19.37, 41.85], L2: [19.22, 43.52],
  L3: [20.07, 42.56], M1: [20.26, 46.12], M2: [22.67, 44.22], M3: [22.36, 42.32], M4: [20.59, 41.88], N1: [20.0, 39.69], N2: [20.98, 40.85], N3: [22.93, 41.34],
  N4: [26.36, 41.71], N5: [26.05, 40.73], O1: [28.58, 43.74], O2: [28.03, 41.98], O3: [28.2, 45.47],
};
const ARC_LL = {
  // Iberia
  ptes: [J.A1, [-8.2, 42.05], [-6.6, 41.95], [-6.2, 41.58], [-6.9, 40.95], [-6.95, 39.95], [-7.5, 39.65], [-7.0, 39.1], [-7.0, 38.2], J.A2],
  ptc: [J.A2, [-7.9, 37.0], [-8.95, 37.02], [-8.8, 38.4], [-9.5, 38.75], [-9.35, 39.4], [-8.85, 40.2], [-8.65, 41.15], J.A1],
  esn: [J.A1, [-8.9, 42.6], [-9.25, 43.0], [-8.3, 43.5], [-7.7, 43.75], [-5.85, 43.65], [-3.8, 43.45], J.B1],
  fres: [J.B1, [-0.7, 42.9], [0.7, 42.7], [1.75, 42.5], J.B2],
  esm: [J.B2, [3.2, 41.9], [2.2, 41.35], [1.2, 41.1], [0.85, 40.7], [-0.3, 39.45], [0.2, 38.75], [-0.5, 38.35], [-0.7, 37.63], [-2.2, 36.73], [-4.4, 36.72], [-5.35, 36.1], [-5.6, 35.96], [-6.3, 36.5], [-6.95, 37.2], J.A2],
  // France
  fratl: [J.B1, [-1.2, 44.65], [-1.1, 45.6], [-1.2, 46.2], [-2.2, 47.25], [-2.8, 47.5], [-4.35, 47.8], [-4.75, 48.4], [-3.0, 48.85], [-2.0, 48.65], [-1.55, 48.65], [-1.9, 49.7], [-1.25, 49.7], [-1.1, 49.35], [0.1, 49.5], [1.1, 49.95], [1.6, 50.8], J.C1],
  frmed: [J.B2, [3.05, 43.0], [3.5, 43.3], [4.6, 43.4], [5.35, 43.3], [6.2, 43.05], [6.9, 43.45], J.D1],
  frit: [J.D1, [7.0, 44.25], [6.65, 45.1], J.D2],
  frch: [J.D2, [6.8, 46.4], [5.97, 46.2], [6.15, 46.6], [6.95, 47.3], J.D3],
  frde: [J.D3, [7.6, 48.3], [8.23, 48.97], [7.4, 49.15], J.D4],
  frlu: [J.D4, J.D5],
  frbe: [J.D5, [4.85, 50.15], [4.15, 49.98], [3.25, 50.55], J.C1],
  // Benelux
  bec: [J.C1, J.C2],
  benl: [J.C2, [4.25, 51.37], [5.05, 51.47], [5.85, 51.15], [5.7, 50.8], J.C3],
  bede: [J.C3, [6.35, 50.35], J.C4],
  belu: [J.C4, [5.75, 49.85], J.D5],
  lude: [J.C4, [6.52, 49.8], J.D4],
  nlc: [J.C2, [3.6, 51.6], [4.0, 52.0], [4.55, 52.45], [4.75, 52.95], [5.9, 53.4], [6.9, 53.45], J.C5],
  nlde: [J.C5, [7.2, 53.0], [7.05, 52.65], [6.7, 52.5], [7.05, 52.25], [6.75, 51.9], [5.95, 51.8], [6.2, 51.35], [6.0, 51.1], J.C3],
  // Germany, Jutland
  den: [J.C5, [7.05, 53.6], [8.0, 53.72], [8.25, 53.45], [8.55, 53.6], [8.65, 53.87], [9.0, 53.88], [8.85, 54.13], [8.6, 54.35], [8.9, 54.5], J.E1],
  dedk: [J.E1, J.E2],
  deb: [J.E2, [10.05, 54.5], [10.9, 54.4], [10.85, 53.95], [11.6, 54.1], [12.4, 54.4], [13.4, 54.65], [13.75, 54.25], J.E3],
  depl: [J.E3, [14.4, 53.25], [14.15, 52.85], [14.6, 52.5], [14.75, 52.05], [14.6, 51.75], [15.03, 51.25], J.E4],
  decz: [J.E4, [14.25, 51.0], [13.2, 50.55], [12.1, 50.3], [12.5, 49.75], [13.0, 49.3], J.E5],
  deat: [J.E5, [13.45, 48.57], [13.0, 48.25], [12.75, 47.95], [13.05, 47.5], [12.2, 47.6], [11.1, 47.4], [10.45, 47.57], [10.2, 47.3], J.E6],
  dech: [J.E6, [9.2, 47.66], [8.6, 47.8], [8.2, 47.6], J.D3],
  dkc: [J.E1, [8.1, 55.55], [8.15, 56.55], [8.6, 57.1], [9.95, 57.6], [10.6, 57.74], [10.5, 57.2], [10.3, 56.95], [10.95, 56.45], [10.25, 56.1], [9.75, 55.5], J.E2],
  // Poland, Czech Republic, Slovakia, the west of Ukraine
  plc: [J.E3, [16.2, 54.3], [17.0, 54.7], [18.3, 54.83], [18.65, 54.4], J.F1],
  ple: [J.G2, [24.1, 50.6], [23.6, 51.5], [23.65, 52.1], [23.2, 52.3], [23.9, 52.9], [23.5, 54.0], [22.8, 54.36], J.F1],
  plua: [J.G1, J.G2],
  plsk: [J.G1, [21.5, 49.4], [20.1, 49.2], [19.5, 49.6], J.G3],
  plcz: [J.G3, [18.55, 49.92], [17.7, 50.3], [16.9, 50.45], [16.35, 50.35], [16.2, 50.65], J.E4],
  czat: [J.E5, [14.7, 48.6], [15.0, 49.0], [16.1, 48.75], J.H1],
  czsk: [J.H1, [17.2, 48.87], [17.9, 49.0], [18.2, 49.3], J.G3],
  skat: [J.H1, [16.85, 48.35], J.H2],
  skhu: [J.H2, [17.85, 47.75], [18.8, 47.82], [19.0, 48.07], [19.65, 48.25], [20.5, 48.5], [21.7, 48.35], J.H3],
  skua: [J.H3, J.G1],
  uahu: [J.H3, J.H4],
  uaro: [J.H4, [23.2, 48.08], [24.2, 47.92], J.H5],
  uae: [J.H5, [25.3, 48.5], [24.9, 49.3], [24.0, 49.75], J.G2],
  // the Alps
  atch: [J.E6, [9.6, 47.05], [10.1, 46.85], J.I1],
  atit: [J.I1, [11.0, 46.77], [11.5, 47.0], [12.2, 47.08], [12.4, 46.7], J.I2],
  atsi: [J.I2, [14.55, 46.4], [15.05, 46.65], [15.65, 46.7], [16.0, 46.68], J.I3],
  athu: [J.I3, [16.5, 47.05], [16.45, 47.4], [16.7, 47.7], [17.1, 47.7], J.H2],
  chit: [J.D2, [7.9, 45.93], [8.45, 46.4], [9.0, 45.83], [9.3, 46.45], [10.1, 46.25], J.I1],
  // Italy
  itsi: [J.I2, [13.4, 46.2], [13.6, 45.95], [13.9, 45.65], J.J1],
  itc: [J.J1, [13.1, 45.65], [12.35, 45.35], [12.55, 44.95], [12.3, 44.3], [13.55, 43.6], [14.2, 42.45], [15.15, 41.92], [16.2, 41.9], [15.95, 41.5], [16.9, 41.13], [18.0, 40.65], [18.52, 40.15], [18.37, 39.8], [17.95, 40.05], [17.2, 40.45], [16.6, 40.1], [16.55, 39.7], [17.15, 39.0], [16.55, 38.7], [16.1, 37.92], [15.65, 38.0], [15.85, 38.65], [16.1, 38.9], [16.05, 39.5], [15.65, 40.05], [14.95, 40.25], [14.45, 40.6], [14.05, 40.8], [13.0, 41.25], [12.25, 41.75], [11.1, 42.4], [10.5, 42.95], [10.25, 43.55], [9.85, 44.05], [8.9, 44.4], [8.15, 43.95], J.D1],
  // Slovenia, Croatia, Hungary
  sic: [J.J1, J.J2],
  sihr: [J.J2, [14.55, 45.63], [15.3, 45.47], [15.7, 45.85], [15.65, 46.2], [16.3, 46.4], J.I4],
  sihu: [J.I4, [16.4, 46.65], J.I3],
  hrhu: [J.I4, [16.88, 46.3], [17.3, 45.97], [18.2, 45.78], J.K1],
  hrrs: [J.K1, [19.1, 45.5], [19.4, 45.2], J.K2],
  hrba: [J.K2, [18.0, 45.1], [17.0, 45.2], [16.45, 45.15], [16.1, 44.9], [16.2, 44.2], [17.0, 43.55], [17.65, 43.05], J.K4],
  hrc: [J.J2, [13.55, 45.1], [13.9, 44.8], [14.2, 45.15], [14.45, 45.33], [14.9, 45.0], [15.2, 44.2], [15.9, 43.7], [16.45, 43.5], [17.4, 43.05], [18.1, 42.65], J.K4],
  // the Balkans
  mec: [J.K4, [18.85, 42.3], J.L1],
  meba: [J.K4, [18.55, 43.0], J.L2],
  mers: [J.L2, [20.3, 42.85], J.L3],
  meal: [J.L3, [19.6, 42.55], J.L1],
  bars: [J.K2, [19.35, 44.9], [19.1, 44.3], [19.5, 43.95], J.L2],
  rshu: [J.K1, [19.6, 46.15], J.M1],
  rsro: [J.M1, [20.8, 45.75], [21.5, 45.2], [21.55, 44.75], [22.45, 44.7], J.M2],
  rsbg: [J.M2, [22.4, 43.7], [23.0, 43.2], [22.5, 42.85], J.M3],
  rsmk: [J.M3, [21.6, 42.25], J.M4],
  rsal: [J.M4, [20.5, 42.2], J.L3],
  alc: [J.L1, [19.45, 41.3], [19.3, 40.65], [19.85, 40.05], J.N1],
  algr: [J.N1, [20.4, 39.9], [20.65, 40.1], [20.8, 40.45], J.N2],
  almk: [J.N2, [20.7, 41.1], [20.5, 41.55], J.M4],
  mkgr: [J.N2, [21.75, 40.92], [22.4, 41.12], J.N3],
  mkbg: [J.N3, [23.0, 41.75], J.M3],
  grbg: [J.N3, [24.1, 41.5], [25.3, 41.25], J.N4],
  gre: [J.N4, J.N5],
  grc: [J.N5, [25.1, 40.95], [24.4, 40.93], [23.9, 40.75], [24.3, 40.2], [23.8, 39.95], [23.35, 40.2], [22.9, 40.45], [22.6, 40.3], [22.65, 39.9], [23.3, 39.2], [22.9, 38.9], [23.6, 38.6], [24.05, 38.2], [24.05, 37.65], [23.55, 37.95], [23.0, 37.9], [23.5, 37.4], [22.75, 37.55], [23.2, 36.45], [22.5, 36.4], [21.7, 36.8], [21.3, 37.65], [21.75, 38.3], [21.1, 38.3], [20.75, 38.95], [20.2, 39.5], J.N1],
  bgro: [J.M2, [22.9, 43.85], [24.3, 43.7], [25.6, 43.65], [27.0, 44.13], J.O1],
  bgc: [J.O1, [27.9, 43.2], [27.9, 42.7], [27.5, 42.5], J.O2],
  bge: [J.O2, [27.0, 42.05], J.N4],
  rohu: [J.M1, [21.2, 46.4], [21.65, 47.0], [22.2, 47.6], J.H4],
  roe: [J.H5, [26.2, 48.0], [26.63, 48.26], [27.2, 47.8], [28.1, 46.9], J.O3],
  roc: [J.O3, [29.65, 45.2], [28.65, 44.2], J.O1],
};
/** A country = the arcs around it, in order (their direction is found by itself). */
const RINGS = {
  PT: ["ptes", "ptc"],
  ES: ["esn", "fres", "esm", "ptes"],
  FR: ["fratl", "frbe", "frlu", "frde", "frch", "frit", "frmed", "fres"],
  BE: ["bec", "benl", "bede", "belu", "frbe"],
  NL: ["nlc", "nlde", "benl"],
  LU: ["belu", "frlu", "lude"],
  CH: ["frch", "dech", "atch", "chit"],
  DE: ["den", "dedk", "deb", "depl", "decz", "deat", "dech", "frde", "lude", "bede", "nlde"],
  DK: ["dkc", "dedk"],
  PL: ["plc", "ple", "plua", "plsk", "plcz", "depl"],
  CZ: ["decz", "czat", "czsk", "plcz"],
  SK: ["czsk", "plsk", "skua", "skhu", "skat"],
  UA: ["skua", "plua", "uae", "uaro", "uahu"],
  AT: ["deat", "atch", "atit", "atsi", "athu", "skat", "czat"],
  IT: ["frit", "chit", "atit", "itsi", "itc"],
  SI: ["itsi", "sic", "sihr", "sihu", "atsi"],
  HR: ["sihr", "hrhu", "hrrs", "hrba", "hrc"],
  HU: ["athu", "skhu", "uahu", "rohu", "rshu", "hrhu", "sihu"],
  BA: ["hrba", "meba", "bars"],
  ME: ["mec", "meal", "mers", "meba"],
  RS: ["rshu", "rsro", "rsbg", "rsmk", "rsal", "mers", "bars", "hrrs"],
  AL: ["alc", "algr", "almk", "rsal", "meal"],
  MK: ["almk", "rsmk", "mkbg", "mkgr"],
  GR: ["algr", "mkgr", "grbg", "gre", "grc"],
  BG: ["rsbg", "mkbg", "grbg", "bge", "bgc", "bgro"],
  RO: ["rohu", "uaro", "roe", "roc", "bgro", "rsro"],
};
/** Islands that are part of the synchronous grid (a ring of their own, all coast). */
const ISLES = { IT: [[[15.65, 38.25], [15.1, 37.5], [15.3, 37.05], [15.1, 36.67], [14.3, 37.0], [12.9, 37.58], [12.45, 37.8], [12.6, 38.1], [13.35, 38.2], [14.4, 38.02]]] };
/** Out of the synchronous grid: pale glass outlines, never lit (closed rings). */
const GLASS = [
  [[-5.7, 50.05], [-5.2, 49.95], [-3.65, 50.22], [-2.45, 50.52], [-1.3, 50.58], [0.25, 50.75], [1.4, 51.15], [0.7, 51.5], [1.75, 52.48], [1.3, 52.93], [0.2, 52.9], [0.12, 53.58], [-0.08, 54.12], [-1.2, 54.6], [-2.0, 55.77], [-3.0, 56.0], [-2.07, 57.15], [-1.8, 57.6], [-3.9, 57.6], [-3.1, 58.2], [-5.0, 58.2], [-5.7, 57.4], [-6.2, 56.7], [-5.6, 56.3], [-5.75, 55.3], [-4.85, 55.0], [-5.1, 54.65], [-3.4, 54.9], [-3.6, 54.45], [-3.05, 53.8], [-3.05, 53.3], [-4.6, 53.35], [-4.3, 52.8], [-4.1, 52.3], [-5.3, 51.85], [-3.15, 51.45], [-2.7, 51.55], [-4.5, 51.02]], // Great Britain
  [[-6.35, 52.17], [-8.25, 51.8], [-9.8, 51.45], [-10.4, 52.1], [-9.6, 52.6], [-10.15, 53.4], [-9.95, 54.28], [-8.6, 54.3], [-8.35, 55.1], [-7.35, 55.38], [-6.15, 55.22], [-5.45, 54.45], [-6.2, 54.0], [-6.05, 53.3]], // Ireland
  [[11.4, 58.2], [11.9, 57.7], [12.2, 57.1], [12.5, 56.3], [13.0, 55.6], [13.15, 55.36], [13.8, 55.42], [14.35, 55.55], [15.6, 56.15], [16.35, 56.65], [16.65, 57.75], [16.8, 58.2]], // the south of Sweden
  [[6.6, 58.2], [7.05, 57.98], [8.0, 58.1], [8.4, 58.2]], // Norway's tip
  [[11.2, 55.2], [12.0, 54.95], [12.45, 55.25], [12.6, 55.7], [12.5, 56.08], [11.7, 55.95], [11.1, 55.7]], // Zealand
  [[9.8, 55.45], [10.5, 55.6], [10.75, 55.3], [10.7, 55.05], [10.1, 55.05]], // Funen
  [[9.4, 43.0], [9.55, 42.1], [9.25, 41.4], [8.6, 41.9], [8.55, 42.4], [9.0, 42.7]], // Corsica
  [[9.2, 41.25], [9.8, 40.5], [9.6, 39.2], [8.85, 38.9], [8.4, 39.3], [8.45, 40.3], [8.2, 40.95]], // Sardinia
  [[-6.3, 35.1], [-6.03, 35.47], [-5.9, 35.8], [-5.3, 35.92], [-5.25, 35.55], [-4.3, 35.2], [-3.0, 35.3], [-2.2, 35.1]], // Morocco's tip
];

/* ───────────────────────────── the grid: nodes and links (schematic) ───────────────────────────── */
/** id: [lon, lat, how big a town (0–3: the dust of homes around it), a plant (0 / 1)]. */
const NODE_LL = {
  por: [-8.4, 41.2, 2, 1], sin: [-8.55, 38.0, 0, 1], bcn: [2.0, 41.55, 3, 1], vlc: [-0.6, 39.5, 2, 1], sev: [-5.95, 37.4, 2, 0], bil: [-2.9, 43.2, 2, 0], zar: [-0.9, 41.65, 1, 1], cor: [-8.3, 43.3, 1, 1], vll: [-4.7, 41.65, 1, 0],
  lyo: [4.85, 45.75, 3, 1], mrs: [5.4, 43.5, 2, 0], bod: [-0.6, 44.85, 2, 1], tls: [1.45, 43.6, 2, 0], nte: [-1.55, 47.25, 2, 1], ren: [-1.7, 48.1, 1, 0], lil: [3.05, 50.6, 2, 1], ncy: [6.2, 48.7, 1, 1], ctr: [2.2, 47.3, 0, 1],
  rtm: [4.4, 51.95, 3, 1], grn: [6.6, 53.2, 0, 1],
  ruh: [7.2, 51.5, 3, 1], ffm: [8.65, 50.1, 2, 0], stg: [9.2, 48.8, 2, 1], muc: [11.55, 48.15, 2, 1], ham: [10.0, 53.55, 3, 1], lpz: [12.4, 51.35, 1, 1], ros: [12.1, 53.95, 0, 0], drs: [13.75, 51.05, 1, 0],
  jut: [9.4, 56.0, 1, 1],
  poz: [16.9, 52.4, 1, 0], gda: [18.5, 54.2, 1, 0], kra: [19.95, 50.05, 2, 1], szc: [14.55, 53.4, 1, 1], bel: [19.3, 51.27, 0, 1],
  prg: [14.45, 50.08, 2, 1], brn: [16.6, 49.2, 1, 1], bts: [17.3, 48.2, 1, 1], kos: [21.25, 48.7, 1, 0], muk: [22.7, 48.45, 0, 1],
  inn: [11.4, 47.27, 1, 0], szb: [13.05, 47.75, 1, 0], kap: [12.75, 47.2, 0, 0], klg: [14.3, 46.63, 0, 0],
  zrh: [8.3, 47.45, 2, 1], gva: [6.45, 46.45, 1, 0], got: [8.6, 46.6, 0, 0],
  mil: [9.2, 45.47, 3, 1], tur: [7.7, 45.07, 2, 0], ven: [12.0, 45.55, 1, 1], bol: [11.3, 44.4, 1, 0], nap: [14.25, 40.9, 3, 0], bar: [16.7, 40.95, 1, 1], cal: [16.55, 39.05, 0, 0], sic: [14.3, 37.6, 1, 1],
  lju: [14.5, 46.05, 1, 1], zag: [15.98, 45.8, 2, 0], rij: [14.5, 45.45, 0, 1], osi: [18.65, 45.5, 1, 0], spl: [16.55, 43.65, 1, 1],
  bud: [19.05, 47.5, 3, 1], gyo: [17.65, 47.68, 0, 0], sze: [20.15, 46.25, 1, 0], deb: [21.6, 47.5, 0, 1],
  sar: [18.4, 43.85, 1, 1], beg: [20.45, 44.8, 2, 1], nis: [21.9, 43.3, 1, 0], pod: [19.25, 42.45, 0, 0], sko: [21.45, 42.0, 1, 0], tir: [19.8, 41.33, 1, 0],
  the: [22.95, 40.65, 2, 0], ath: [23.7, 38.0, 3, 1], pto: [21.7, 40.5, 0, 1], meg: [22.1, 37.4, 0, 1],
  sof: [23.3, 42.7, 2, 0], var: [27.6, 43.2, 1, 0], mar: [25.9, 42.2, 0, 1], buc: [26.1, 44.43, 3, 1], tim: [21.25, 45.75, 1, 0], clu: [23.6, 46.75, 1, 0], iro: [22.8, 44.75, 0, 1], cer: [28.05, 44.33, 0, 1],
};
/** The keys of plan.js · PLACE that are also nodes get their town and plant here (default: none). */
const PLACE_W = { paris: [3, 0], lisbonne: [2, 0], varsovie: [3, 0], bruxelles: [2, 1], madrid: [3, 0], rome: [3, 1], berlin: [3, 0], vienne: [2, 0], bielefeld: [1, 0], grafenrheinfeld: [0, 1], dispatchEon: [1, 0], dispatchRwe: [2, 0], dispatchTennet: [1, 0] };
const NOT_NODES = ["you", "papenburg", "fardioua"];
/** Links, "a-b" + marks: `!` a main axis (the dashes of `flow` run on it, east → west) · `~` out for works (`works`) ·
 *  `%` the line the N-1 demonstration drops (`n1ok`) · `+` its neighbours (they take its load inside their outline) ·
 *  `?` the ghost of `n1sim` · `^` the lines `n1sim` turns signal. */
const LINKS = `
lisbonne-por lisbonne-sin lisbonne-madrid! por-cor por-vll cor-bil vll-madrid vll-bil bil-zar madrid-zar zar-bcn madrid-vlc vlc-bcn madrid-sev sev-sin sev-tarifa sev-vlc madrid-bil! bil-bod! bcn-tls
bod-nte bod-tls bod-ctr! tls-mrs mrs-lyo lyo-ctr lyo-gva! ctr-paris! ctr-nte nte-ren ren-paris paris-lil! paris-ncy! lil-bruxelles! ncy-ffm! ncy-zrh lyo-tur bruxelles-ncy lyo-ncy
bruxelles-rtm bruxelles-dispatchTennet! rtm-dispatchTennet dispatchTennet-grn! grn-diele! dispatchTennet-dispatchRwe! dispatchTennet-ruh rtm-grn
dispatchRwe-ruh! ruh-wehrendorf! wehrendorf-diele ruh-spexard dispatchRwe-ffm ffm-stg stg-muc! stg-zrh! ffm-twistetal elsen-spexard wehrendorf-spexard^ ffm-raitersaich raitersaich-muc muc-szb! muc-inn stg-raitersaich ruh-twistetal~
ham-conneforde!+ conneforde-landesbergen% ham-dispatchEon+ dispatchEon-landesbergen!+ landesbergen-bechterdissen? bechterdissen-bielefeld dispatchEon-berlin! dispatchEon-lpz~ lpz-berlin lpz-drs! drs-mikulowa! berlin-szc! berlin-ros ros-ham ham-jut dispatchEon-dipperz lpz-dipperz dipperz-grafenrheinfeld grafenrheinfeld-schwandorf schwandorf-prg lpz-grafenrheinfeld! berlin-drs
dipperz-ffm dipperz-twistetal grafenrheinfeld-stg! schwandorf-raitersaich schwandorf-muc ernsthofen-szb! hessenberg-klg
vienne-ernsthofen! ernsthofen-hessenberg vienne-hessenberg klg-lju klg-kap szb-kap kap-inn inn-zrh vienne-brn vienne-gyo! vienne-bts zrh-gva! zrh-got got-mil gva-tur
szc-poz! poz-varsovie! czarna-poz czarna-kra! czarna-bel bel-varsovie bel-kra varsovie-gda gda-szc kra-brn kra-kos prg-brn prg-drs brn-bts bts-gyo bts-kos kos-muk muk-deb
gyo-bud! bud-deb bud-sze sze-tim sze-beg bud-zag muk-clu
zag-lju lju-ven zag-rij rij-lju zag-osi rij-spl osi-beg osi-sar spl-sar sar-pod sar-beg beg-nis beg-iro iro-tim tim-clu clu-buc iro-buc buc-cer cer-var iro-sof sof-nis sof-mar mar-var sof-the nis-sko sko-the pod-tir tir-pto pto-the the-ath pto-ath ath-meg sko-pod mar-buc
tur-mil mil-ven mil-bol ven-bol bol-rome rome-nap nap-bar nap-cal cal-sic bar-cal`;
/** The story's own lines (each has its material): [a, b] keys of PLACE. */
const STORY = { ems1: ["conneforde", "diele"], ems2: ["conneforde", "diele"], lw: ["wehrendorf", "landesbergen"], c1: ["bielefeld", "spexard"], c2: ["elsen", "twistetal"], c3: ["bechterdissen", "elsen"], pol: ["czarna", "mikulowa"], mar: ["tarifa", "fardioua"] };
/** `thread`: from Papenburg to your home, along the grid. `share`: the dispatch points linked together. */
const THREAD = ["papenburg", "diele", "wehrendorf", "ruh", "dispatchRwe", "dispatchTennet", "bruxelles", "lil", "paris", "ctr", "you"];
const DISPATCH = ["dispatchEon", "dispatchRwe", "dispatchTennet", "bruxelles", "paris", "berlin", "stg", "zrh", "vienne", "varsovie", "rome", "madrid", "prg", "bud", "lisbonne", "ath", "buc"];
/** The pumped-storage dams in the Alps (lon, lat). */
const DAMS = [[12.72, 47.18], [8.55, 46.62], [7.4, 46.1], [9.02, 46.85], [10.75, 47.02], [6.93, 46.07], [13.33, 47.08]];
/** The wind farms that trip in the North-East (lon / lat boxes, [lon0, lon1, lat0, lat1, how many]). */
const WIND = [[7.9, 14.2, 52.2, 54.8, 240], [15.9, 17.05, 47.7, 48.55, 40]];
/** How much of a country's homes the load shed can reach (CRE: 5 to 25 % by region in France; Portugal the most). */
const SHED = { PT: 0.42, ES: 0.26, FR: 0.2 };
const SHED_ELSE = 0.14;

/* ───────────────────────────── plane geometry (on the table: [x, z]) ───────────────────────────── */
const pip = (p, ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
};
/** Where a→b crosses c→d, as a fraction of a→b (−1: nowhere). */
const hit = (a, b, c, d) => {
  const rx = b[0] - a[0];
  const rz = b[1] - a[1];
  const sx = d[0] - c[0];
  const sz = d[1] - c[1];
  const den = rx * sz - rz * sx;
  if (Math.abs(den) < 1e-12) return -1;
  const t = ((c[0] - a[0]) * sz - (c[1] - a[1]) * sx) / den;
  const u = ((c[0] - a[0]) * rz - (c[1] - a[1]) * rx) / den;
  return t > 1e-9 && t < 1 - 1e-9 && u >= 0 && u <= 1 ? t : -1;
};
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Distance from p to the segment a→b. */
const distSeg = (p, a, b) => {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const l = dx * dx + dz * dz;
  const t = l > 0 ? Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l)) : 0;
  return Math.hypot(p[0] - a[0] - dx * t, p[1] - a[1] - dz * t);
};
const area2 = (ring) => ring.reduce((s, a, i) => s + a[0] * ring[(i + 1) % ring.length][1] - ring[(i + 1) % ring.length][0] * a[1], 0);
const triangles = (ring) => THREE.ShapeUtils.triangulateShape(ring.map((p) => new THREE.Vector2(p[0], p[1])), []).map((f) => f.map((i) => ring[i]));
/** A convex polygon cut by a triangle (Sutherland–Hodgman). */
const clipTri = (poly, tri) => {
  const flip = (tri[1][0] - tri[0][0]) * (tri[2][1] - tri[0][1]) - (tri[1][1] - tri[0][1]) * (tri[2][0] - tri[0][0]) < 0;
  const t = flip ? [tri[0], tri[2], tri[1]] : tri;
  let out = poly;
  for (let i = 0; i < 3 && out.length; i++) {
    const a = t[i];
    const b = t[(i + 1) % 3];
    const side = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    const inp = out;
    out = [];
    for (let k = 0; k < inp.length; k++) {
      const p = inp[k];
      const q = inp[(k + 1) % inp.length];
      const sp = side(p);
      const sq = side(q);
      if (sp >= 0) out.push(p);
      if (sp >= 0 !== sq >= 0) out.push(lerp2(p, q, sp / (sp - sq)));
    }
  }
  return out;
};
const bbox = (pts) => pts.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [1e9, 1e9, -1e9, -1e9]);
const apart = (a, b) => a[0] > b[2] || a[2] < b[0] || a[1] > b[3] || a[3] < b[1];
/** A smooth noise in [0, 1] (seeded by its arguments only). */
const hash = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (x, z) => {
  const i = Math.floor(x);
  const j = Math.floor(z);
  const u = x - i;
  const v = z - j;
  const su = u * u * (3 - 2 * u);
  const sv = v * v * (3 - 2 * v);
  return (hash(i, j) * (1 - su) + hash(i + 1, j) * su) * (1 - sv) + (hash(i, j + 1) * (1 - su) + hash(i + 1, j + 1) * su) * sv;
};

/* ───────────────────────────── the ribbon: a line of light drawn in screen space ───────────────────────────── */
// aA = (which end, which side, distance along the line in cm, radius in cm) ; aB and aC: what each kind of line needs.
const RIB_VS = /* glsl */ `
  uniform float uPx, uMinPx, uHaloPx, uBold, uLift, uGrow, uRail; uniform vec2 uView;
  attribute vec3 aOther; attribute vec4 aA; attribute vec4 aB; attribute vec4 aC;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth; varying vec4 vB; varying vec4 vC; varying vec2 vW;
  void main() {
    vec3 up = vec3(0.0, uLift, 0.0);
    vec4 a = modelViewMatrix * vec4(position + up, 1.0);
    vec4 b = modelViewMatrix * vec4(aOther + up, 1.0);
    const float NEAR = 2.0;
    vX = 0.0; vMax = 2.0; vDist = aA.z; vDepth = 1.0; vB = aB; vC = aC; vW = position.xz;
    if (a.z > -NEAR && b.z > -NEAR) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    if (a.z > -NEAR) a = mix(a, b, (a.z + NEAR) / (a.z - b.z));
    if (b.z > -NEAR) b = mix(b, a, (b.z + NEAR) / (b.z - a.z));
    vec4 ca = projectionMatrix * a;
    vec4 cb = projectionMatrix * b;
    vec2 run = (cb.xy / cb.w - ca.xy / ca.w) * uView * (aA.x > 0.5 ? -1.0 : 1.0);
    float l = length(run);
    vec2 n = l > 1e-4 ? vec2(-run.y, run.x) / l : vec2(0.0, 1.0);
    float depth = max(-a.z, NEAR);
    float room = step(2.5, aC.y) * step(aC.y, 3.5) * uRail;
    float core = max(aA.w * uBold * (1.0 + aC.z * uGrow + 2.2 * room) * uPx / depth, uMinPx);
    float total = core + uHaloPx;
    ca.xy += n * aA.y * total * 2.0 / uView * ca.w;
    gl_Position = ca;
    vX = aA.y * total / core;
    vMax = total / core;
    vDepth = depth;
  }`;
const RIB_HEAD = /* glsl */ `
  uniform vec3 uInk, uSig, uVei; uniform float uAmount, uTime, uPx;
  varying float vX; varying float vMax; varying float vDist; varying float vDepth; varying vec4 vB; varying vec4 vC; varying vec2 vW;
  float is(float v, float k) { return step(k - 0.5, v) * step(v, k + 0.5); }`;
// the grid. aB = (main axis, the cascade's threshold, the split's threshold, cm to the split) · aC = (1 Italy / 2 Iberia, role, load)
const NET_FS = /* glsl */ `${RIB_HEAD}
  uniform float uFlow, uVolt, uCascade, uCrack, uLost, uSurplus, uDark, uItaly, uIberia, uLoad, uWorks, uN1ok, uN1sim, uRail;
  uniform vec2 uRegC;
  void main() {
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float axis = vB.x, trip = vB.y, crackU = vB.z, stub = vB.w, mask = vC.x, role = vC.y, load = vC.z;
    float xing = step(crackU, 1.5);
    float dc = uCascade - trip;
    float flash = smoothstep(-0.015, 0.0, dc) * (1.0 - smoothstep(0.005, 0.05, dc));
    float dead = max(smoothstep(0.0, 0.03, dc), xing * smoothstep(crackU, crackU + 0.025, uCrack));
    // the power that runs: dashes on the main axes, melted into the line when they would be too small
    float ph = fract((vDist - uTime * 7.0) / 9.0);
    float dash = smoothstep(0.0, 0.1, ph) * (1.0 - smoothstep(0.4, 0.5, ph));
    float fine = smoothstep(5.0, 12.0, 9.0 * uPx / max(vDepth, 1.0));
    float lvl = 0.5 + axis * uFlow * mix(0.25, dash * 0.95 - 0.12, fine);
    vec3 col = mix(uInk, uSig, clamp(load * uLoad * 0.9 + is(role, 5.0) * uN1sim, 0.0, 1.0)) * lvl;
    // the voltage sinks around the story's region
    vec2 dr = vW - uRegC;
    col *= mix(1.0, uVolt, exp(-dot(dr, dr) / 2200.0));
    // ghosts: a line out for works, the line N-1 drops
    float ghost = clamp(uWorks * is(role, 1.0) + uN1ok * is(role, 2.0) * 1.6 + uN1sim * is(role, 4.0), 0.0, 1.0);
    col = mix(col, uInk * 0.2 * step(0.5, fract(vDist / 1.5)), ghost);
    // room: the neighbours' outline (what they may carry) and what they carry, inside it
    float r = is(role, 3.0) * uRail;
    float fillR = mix(1.0 / (1.0 + 2.2 * r), 0.72, smoothstep(0.35, 1.0, r));
    float body = max(smoothstep(0.76, 0.86, a) * 0.5, 1.0 - smoothstep(fillR - aa, fillR + aa, a));
    col *= mix(1.0, body, smoothstep(0.0, 0.3, r));
    // dark: the what-if, Italy 2003, Iberia 2025
    col *= 1.0 - 0.96 * max(uDark, max(is(mask, 1.0) * uItaly, is(mask, 2.0) * uIberia));
    col = mix(col, uInk * 0.03, dead);
    col = mix(col, uSig * 1.6, flash);
    // after the split: the West's stumps, the North-East's surplus piling up against it
    col += uSig * 1.3 * uLost * dead * xing * (1.0 - smoothstep(2.0, 6.5, stub));
    float p2 = fract((vDist - uTime * 1.6) / 3.2);
    float jam = smoothstep(0.0, 0.1, p2) * (1.0 - smoothstep(0.7, 0.8, p2));
    col = mix(col, uSig * (0.45 + 0.9 * jam), uSurplus * exp(-stub / 26.0) * max(axis, xing));
    gl_FragColor = vec4(col * inCore * uAmount, 1.0);
  }`;
// one of the story's lines. aB.x = 0 → 1 along it
const LINE_FS = /* glsl */ `${RIB_HEAD}
  uniform float uLevel, uSigK, uVeiK, uDie, uGhost, uRail, uFill;
  void main() {
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float alive = smoothstep(uDie * 1.06 - 0.06, uDie * 1.06, vB.x + 1e-4);
    vec3 base = mix(uInk * uLevel, uSig * 1.5, uSigK);
    base = mix(base, uVei * 1.2, uVeiK);
    float body = max(smoothstep(0.76, 0.86, a) * 0.5, 1.0 - smoothstep(uFill - aa, uFill + aa, a));
    vec3 col = base * mix(1.0, body, uRail) * alive + uInk * 0.035 * (1.0 - alive);
    col = mix(col, uInk * 0.22 * step(0.5, fract(vDist / 1.4)), uGhost);
    float h = clamp((a - 1.0) / max(vMax - 1.0, 1e-3), 0.0, 1.0);
    float halo = uSigK * alive * 0.45 * pow(1.0 - h, 2.2);
    gl_FragColor = vec4((col * inCore + uSig * halo * (1.0 - inCore)) * uAmount, 1.0);
  }`;
// any other path. aB = (0 → 1 along it, rank: lit when uPays passes it)
const PATH_FS = /* glsl */ `${RIB_HEAD}
  uniform vec3 uColor; uniform float uBase, uLit, uPays, uReveal, uHead, uHeadK, uHeadW, uDash, uDashV;
  void main() {
    float a = abs(vX);
    float aa = max(fwidth(vX), 1e-3);
    float inCore = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, a);
    float lvl = mix(uBase, uLit, smoothstep(vB.y, vB.y + 1.0, uPays));
    lvl *= 1.0 - smoothstep(uReveal - 0.012, uReveal, vB.x);
    float ph = fract((vDist - uTime * uDashV) / max(uDash, 1e-3));
    lvl *= mix(1.0, smoothstep(0.0, 0.1, ph) * (1.0 - smoothstep(0.5, 0.6, ph)), step(1e-3, uDash));
    float q = (vB.x - uHead) / max(uHeadW, 1e-3);
    lvl += uHeadK * exp(-q * q) * step(0.0, uHead);
    gl_FragColor = vec4(uColor * lvl * inCore * uAmount, 1.0);
  }`;

/* ───────────────────────────── points: homes, relays, small units, wind farms, postes ───────────────────────────── */
// homes: aD = (seed, shed rank or 2, the half that comes back, 1 Italy / 2 Iberia)
const HOME_VS = /* glsl */ `
  uniform float uPx, uSize, uMinPx; attribute vec4 aD; varying vec4 vD; varying float vK;
  void main() {
    vD = aD;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float r = uSize * (0.6 + 0.8 * aD.x) * uPx / max(-mv.z, 1.0);
    vK = clamp(r / uMinPx, 0.5, 1.0);
    gl_PointSize = 2.0 * max(r, uMinPx);
  }`;
const HOME_FS = /* glsl */ `
  uniform vec3 uInk, uVei; uniform float uAmount, uShed, uRelit, uDark, uItaly, uIberia; varying vec4 vD; varying float vK;
  float is(float v, float k) { return step(k - 0.5, v) * step(v, k + 0.5); }
  void main() {
    vec2 q = gl_PointCoord * 2.0 - 1.0;
    float disc = 1.0 - smoothstep(0.45, 1.0, dot(q, q));
    float off = smoothstep(vD.y - 0.03, vD.y, uShed) * step(vD.y, 1.5) * (1.0 - smoothstep(vD.z - 0.14, vD.z - 0.02, uRelit));
    vec3 col = uInk * (0.42 + 0.55 * vD.x) * (1.0 - 0.96 * off); // a shed home is DARK: the patch is a hole in the dust
    col *= 1.0 - 0.97 * max(uDark, max(is(vD.w, 1.0) * uItaly, is(vD.w, 2.0) * uIberia));
    gl_FragColor = vec4(col * disc * vK * uAmount, 1.0);
  }`;
// the others: aD = (size, rank, big when uBig, seed). A point goes from A to B when uT passes its rank, with a flash F.
const DOT_VS = /* glsl */ `
  uniform float uPx, uSize, uMinPx, uBig, uLift; attribute vec4 aD; varying vec4 vD; varying float vK; varying float vR;
  void main() {
    vD = aD;
    vec4 mv = modelViewMatrix * vec4(position + vec3(0.0, uLift, 0.0), 1.0);
    gl_Position = projectionMatrix * mv;
    float r = uSize * aD.x * (1.0 + aD.z * uBig) * uPx / max(-mv.z, 1.0);
    vK = clamp(r / uMinPx, 0.35, 1.0);
    vR = max(r, uMinPx);
    gl_PointSize = 2.0 * vR;
  }`;
const DOT_FS = /* glsl */ `
  uniform vec3 uColA, uColB, uColF; uniform float uAmount, uT, uTime, uBreath, uSquare; varying vec4 vD; varying float vK; varying float vR;
  void main() {
    vec2 q = gl_PointCoord * 2.0 - 1.0;
    float disc = 1.0 - smoothstep(0.45, 1.0, dot(q, q));
    float m = max(abs(q.x), abs(q.y));
    float sq = (1.0 - smoothstep(0.84, 0.98, m)) * mix(1.0, 0.25 + 0.75 * smoothstep(0.42, 0.56, m), smoothstep(4.0, 7.0, vR));
    float shape = mix(disc, sq, uSquare);
    float st = smoothstep(vD.y - 0.02, vD.y, uT);
    float fl = st * (1.0 - smoothstep(vD.y + 0.01, vD.y + 0.07, uT));
    vec3 col = mix(uColA, uColB, st) + uColF * fl;
    col *= 1.0 - uBreath * (0.5 + 0.5 * sin(uTime * 0.9 + vD.w * 6.283));
    gl_FragColor = vec4(col * shape * vK * uAmount, 1.0);
  }`;
// a light that has a place: a bright core, a long tail (your home)
const GLOW_FS = /* glsl */ `
  uniform vec3 uColA; uniform float uAmount, uTime; varying vec4 vD;
  void main() {
    vec2 q = gl_PointCoord * 2.0 - 1.0;
    float d = clamp(length(q), 0.0, 1.0);
    float k = 1.7 * exp(-d * d * 70.0) + 0.5 * pow(1.0 - d, 3.0);
    gl_FragColor = vec4(uColA * k * (0.9 + 0.1 * sin(uTime * 1.1)) * uAmount, 1.0);
  }`;

/* ───────────────────────────── flat layers of light ───────────────────────────── */
// a plant's mark: one instanced quad on each rotor (its half-side = 1.9 × the rotor's radius)
const MARK_VS = /* glsl */ `
  uniform float uPx; varying vec2 vQ; varying float vR;
  void main() {
    vQ = position.xz * 2.0;
    vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    vR = length(instanceMatrix[0].xyz) / 3.8 * uPx / max(-mv.z, 1.0);
  }`;
const MARK_FS = /* glsl */ `
  uniform vec3 uVei; uniform float uAngle, uAmount, uReserve, uTime; varying vec2 vQ; varying float vR;
  void main() {
    const float R = 0.526;
    float r = length(vQ);
    float aa = fwidth(r) + 1e-4;
    vec2 d = vec2(cos(uAngle), sin(uAngle));
    float along = clamp(dot(vQ, d), 0.16 * R, 0.9 * R);
    float bar = 1.0 - smoothstep(0.09 * R - aa, 0.09 * R + aa, length(vQ - d * along));
    float hub = 1.0 - smoothstep(0.14 * R - aa, 0.14 * R + aa, r);
    float big = smoothstep(3.0, 8.0, vR);
    float disc = 1.0 - smoothstep(R * 0.75, R, r);
    float ring = 1.0 - smoothstep(0.05, 0.05 + 2.0 * aa, abs(r - 0.84));
    vec3 col = uVei * (max(bar, hub) * 1.5 * big + disc * 0.6 * (1.0 - big)) * uAmount;
    col += uVei * ring * uReserve * (0.85 + 0.15 * sin(uTime * 1.3)) * max(big, 0.5);
    gl_FragColor = vec4(col, 1.0);
  }`;
const FLAT_VS = /* glsl */ `varying vec2 vQ; void main() { vQ = position.xz * 2.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// the pulse: a ring that breathes out of a city
const PULSE_FS = /* glsl */ `
  uniform vec3 uVei; uniform float uAmount, uBeat; varying vec2 vQ;
  void main() {
    float r = length(vQ);
    float q = (r - uBeat * 0.92) / 0.035;
    float ring = exp(-q * q) * (1.0 - uBeat) * (1.0 - uBeat) * smoothstep(0.0, 0.08, uBeat);
    gl_FragColor = vec4(uVei * (ring * 1.5 + 1.3 * exp(-r * r * 1600.0)) * uAmount, 1.0);
  }`;
// on the plates' top: the control areas, the sweeps that stop at a border or cross it, Brussels' ring
const OVER_VS = /* glsl */ `attribute float aZone; varying vec2 vP; varying float vZone; void main() { vP = position.xz; vZone = aZone; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const OVER_FS = /* glsl */ `
  uniform vec3 uInk, uVei; uniform float uZones, uZoneLit, uScan, uScanAll, uBxl; uniform vec2 uBxlC; uniform vec4 uGeo;
  varying vec2 vP; varying float vZone;
  float is(float v, float k) { return step(k - 0.5, v) * step(v, k + 0.5); }
  float edge(float e, float v) { float w = fwidth(v) * 1.2 + 1e-5; return smoothstep(e - w, e + w, v); }
  void main() {
    float lon = vP.x / uGeo.x + uGeo.z;
    float lat = uGeo.w - vP.y / uGeo.y;
    float de = is(vZone, 1.0), nl = is(vZone, 2.0);
    // Germany's four control areas, schematic: RWE in the west, E.ON Netz a band from north to south, Vattenfall in the east, EnBW in the south-west
    float south = 1.0 - edge(50.3, lat);
    float eon = edge(mix(9.0, 10.2, south), lon) * (1.0 - edge(mix(11.6, 15.5, south), lon));
    float vat = edge(11.6, lon) * (1.0 - south);
    float enbw = (1.0 - edge(10.2, lon)) * edge(7.4, lon) * (1.0 - edge(49.7, lat));
    float rwe = clamp(1.0 - eon - vat - enbw, 0.0, 1.0);
    float tint = de * (eon * 0.17 + rwe * 0.1 + vat * 0.06 + enbw * 0.135) + nl * 0.125;
    float lit = de * (eon * is(uZoneLit, 1.0) + rwe * is(uZoneLit, 2.0)) + nl * is(uZoneLit, 3.0) + (de + nl) * is(uZoneLit, 4.0);
    float seam = de * clamp((fwidth(eon) + fwidth(vat) + fwidth(enbw)) * 0.7, 0.0, 1.0); // the areas' borders, a fine line
    vec3 col = uInk * (tint * 0.75 + lit * 0.1 + seam * 0.5) * uZones;
    float x0 = is(uZoneLit, 1.0) * 8.6 + is(uZoneLit, 2.0) * 5.8 + (is(uZoneLit, 3.0) + is(uZoneLit, 4.0)) * 3.3;
    float x1 = is(uZoneLit, 1.0) * 14.0 + is(uZoneLit, 2.0) * 10.4 + is(uZoneLit, 3.0) * 7.3 + is(uZoneLit, 4.0) * 15.2;
    float pos = mix(x0, x1, uScan);
    float q = (lon - pos) / 0.1;
    col += uVei * (exp(-q * q) + 0.09 * (1.0 - edge(pos, lon))) * lit * step(1e-3, uScan);
    float pos2 = mix(-10.5, 30.5, uScanAll);
    float q2 = (lon - pos2) / 0.14;
    col += uVei * (0.9 * exp(-q2 * q2) + 0.07 * (1.0 - edge(pos2, lon))) * step(1e-3, uScanAll);
    float d = length(vP - uBxlC);
    float R = uBxl * 190.0;
    float q3 = (d - R) / 1.6;
    col += uVei * (0.9 * exp(-q3 * q3) + 0.05 * (1.0 - smoothstep(R - 1.0, R, d))) * step(1e-3, uBxl) * (1.0 - smoothstep(0.85, 1.0, uBxl));
    gl_FragColor = vec4(col, 1.0);
  }`;
// the split's light: a curtain rising from the joint, and its pool on the table between the plates. aU: when `crack` reaches it
const CRACK_VS = /* glsl */ `
  uniform float uW; attribute vec3 aN; attribute float aU; varying float vU; varying float vV;
  void main() { vU = aU; vV = aN.z; gl_Position = projectionMatrix * modelViewMatrix * vec4(position + vec3(aN.x, 0.0, aN.y) * uW, 1.0); }`;
const CRACK_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uCrack, uAll, uAmount, uTime, uFloor; varying float vU; varying float vV;
  void main() {
    float lit = max(uAll, 1.0 - smoothstep(uCrack - 0.015, uCrack, vU));
    float q = (vU - uCrack) / 0.03;
    float head = exp(-q * q) * (1.0 - smoothstep(0.92, 1.0, uCrack)) * (1.0 - uAll);
    float live = 0.85 + 0.15 * sin(vU * 40.0 - uTime * 0.8);
    float prof = mix(pow(clamp(1.0 - vV, 0.0, 1.0), 2.4), exp(-vV * vV * 3.5) * (1.0 - vV * vV), uFloor);
    gl_FragColor = vec4(uColor * (lit * live * 0.6 + head * 1.2) * prof * uAmount, 1.0);
  }`;
const HALO_FS = /* glsl */ `
  uniform vec3 uColor; uniform float uAmount; varying vec2 vQ;
  void main() { float d = clamp(length(vQ), 0.0, 1.0); gl_FragColor = vec4(uColor * pow(1.0 - d, 2.2) * uAmount, 1.0); }`;

const MAXB = { transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.MaxEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor };
const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
const Z4 = [0, 0, 0, 0];

/** Collects segments into one ribbon geometry. */
function ribbons() {
  const P = [];
  const O = [];
  const A = [];
  const B = [];
  const C = [];
  const index = [];
  let n = 0;
  const api = {
    /** a, b: [x, y, z] ; r: radius (cm) ; d0, d1: distance along the line at a and b ; bA, bB: aB at a and b ; c: aC */
    seg(a, b, r, d0, d1, bA = Z4, bB = bA, c = Z4) {
      for (const [end, side] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
        P.push(...(end ? b : a));
        O.push(...(end ? a : b));
        A.push(end, side, end ? d1 : d0, r);
        B.push(...(end ? bB : bA));
        C.push(...c);
      }
      index.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      n += 4;
    },
    /** A polyline of [x, y, z]: aB.x runs 0 → 1 along it (or from `u0` to `u1`), aB.y = `rank`. */
    line(pts, r, { rank = 0, u0 = 0, u1 = 1, c = Z4 } = {}) {
      let total = 0;
      for (let i = 0; i + 1 < pts.length; i++) total += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]);
      let d = 0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1], pts[i + 1][2] - pts[i][2]);
        const n0 = u0 + ((u1 - u0) * d) / Math.max(total, 1e-6);
        const n1 = u0 + ((u1 - u0) * (d + l)) / Math.max(total, 1e-6);
        api.seg(pts[i], pts[i + 1], r, d, d + l, [n0, rank, 0, 0], [n1, rank, 0, 0], c);
        d += l;
      }
    },
    geometry() {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
      g.setAttribute("aOther", new THREE.Float32BufferAttribute(O, 3));
      g.setAttribute("aA", new THREE.Float32BufferAttribute(A, 4));
      g.setAttribute("aB", new THREE.Float32BufferAttribute(B, 4));
      g.setAttribute("aC", new THREE.Float32BufferAttribute(C, 4));
      g.setIndex(index);
      return g;
    },
  };
  return api;
}
const ribbonMesh = (geometry, material, order = 5) => {
  const m = new THREE.Mesh(geometry, material);
  m.frustumCulled = false;
  m.renderOrder = order;
  return m;
};

const KEYS = ["west", "east", "south"];
const ZONE = { DE: 1, NL: 2 }; // the control areas the film tints (`zones`)
const DARK = { IT: 1, ES: 2, PT: 2 }; // `italy` (2003) and `iberia` (2025)

export function buildEurope() {
  const group = new THREE.Group();
  const VIEW = new THREE.Vector2(BRAND.W, BRAND.H);
  const SLAB = MAP.slab;
  const LY = MAP.layers;
  const xz = ([a, b]) => lonlat(a, b);
  const near = (p, q) => dist2(p, q) < 1e-6;
  const sm = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  const P2 = (id) => [PLACE[id][0], PLACE[id][2]];

  /* ── the split (plan.js · SPLIT): three chains from the point they share, and the three regions they part ── */
  const ends = [SPLIT.wne, SPLIT.wse, SPLIT.nese].map((c) => [c[0], c[c.length - 1]]);
  const Jp = ends[0].find((p) => ends[1].some((q) => near(p, q))) ?? ends[0][1];
  const fromJ = (c) => (near(c[0], Jp) ? c.slice() : c.slice().reverse());
  const wne = fromJ(SPLIT.wne).reverse(); // the North Sea → J
  const wse = fromJ(SPLIT.wse); //           J → the Adriatic
  const nese = fromJ(SPLIT.nese); //         J → the east
  const lenOf = (c) => c.reduce((s, p, i) => (i ? s + dist2(p, c[i - 1]) : 0), 0);
  // `crack` runs 0 → 0.9 from the North Sea to the Adriatic (wne then wse), 0.75 → 1 along nese
  const SEGS = [];
  {
    const Lw = lenOf(wne) + lenOf(wse);
    let s = 0;
    for (const [chain, c, k0, k1, L] of [["wne", wne, 0, 0.9, Lw], ["wse", wse, 0, 0.9, Lw], ["nese", nese, 0.75, 1, lenOf(nese)]]) {
      if (chain === "nese") s = 0;
      for (let i = 0; i + 1 < c.length; i++) {
        const l = dist2(c[i], c[i + 1]);
        SEGS.push({ a: c[i], b: c[i + 1], u0: k0 + ((k1 - k0) * s) / L, u1: k0 + ((k1 - k0) * (s + l)) / L, chain });
        s += l;
      }
    }
  }
  const FREE = [wne[0], wse[wse.length - 1], nese[nese.length - 1]];
  const toChain = (p) => SEGS.reduce((m, sg) => Math.min(m, distSeg(p, sg.a, sg.b)), 1e9);
  /** Beside the line as it is drawn (not beyond one of its free ends): there, the line decides. */
  const beside = (p) => toChain(p) < Math.min(...FREE.map((f) => dist2(p, f))) - 1e-6;
  const FARR = 4000;
  const ray = (p, q) => {
    const l = dist2(p, q) || 1;
    return [p[0] + ((p[0] - q[0]) / l) * FARR, p[1] + ((p[1] - q[1]) / l) * FARR];
  };
  const N0 = ray(wne[0], wne[1]);
  const A1 = ray(wse[wse.length - 1], wse[wse.length - 2]);
  const E1 = ray(nese[nese.length - 1], nese[nese.length - 2]);
  const ang = (p) => Math.atan2(p[1] - Jp[1], p[0] - Jp[0]);
  const arc = (t0, t1) =>
    Array.from({ length: 9 }, (_, i) => {
      const t = t0 + ((t1 - t0) * (i + 0.5)) / 9;
      return [Jp[0] + Math.cos(t) * FARR * 3, Jp[1] + Math.sin(t) * FARR * 3];
    });
  const tA = ang(A1);
  const tE = ang(E1);
  let tNw = ang(N0);
  while (tNw < tA) tNw += 2 * Math.PI; //  the West: from the Adriatic's ray round by the west to the North Sea's
  let tNe = ang(N0);
  while (tNe > tE) tNe -= 2 * Math.PI; //  the North-East: from the east's ray round by the north
  let tEs = tE;
  while (tEs > tA) tEs -= 2 * Math.PI; //  the South-East: from the Adriatic's ray round by the south to the east's
  const REG = {
    west: [N0, ...wne, ...wse.slice(1), A1, ...arc(tA, tNw)],
    east: [N0, ...wne, ...nese.slice(1), E1, ...arc(tE, tNe)],
    south: [...wse, A1, ...arc(tA, tEs), E1, ...nese.slice(1).reverse()],
  };
  const regionOf = (p) => (pip(p, REG.west) ? "west" : pip(p, REG.east) ? "east" : "south");
  const REGT = KEYS.map((k) => triangles(REG[k]).map((t) => ({ t, box: bbox(t) })));
  const cutsOf = (a, b) =>
    SEGS.map((sg) => ({ t: hit(a, b, sg.a, sg.b), sg }))
      .filter((c) => c.t >= 0)
      .sort((p, q) => p.t - q.t);

  /* ── which plate (plan.js · PLATE): a code listed twice is cut by the split ── */
  const own = {};
  for (const k of KEYS) for (const name of PLATE[k]) (own[name.slice(0, 2)] ??= []).push(k);
  const decide = (p, code) => {
    const g = regionOf(p);
    const o = own[code];
    return o.length > 1 || o[0] === g || beside(p) ? g : o[0];
  };

  /* ── the countries ── */
  const ARC = Object.fromEntries(Object.entries(ARC_LL).map(([k, v]) => [k, v.map(xz)]));
  const ringEdges = (names) => {
    const out = [];
    let end = null;
    names.forEach((n, i) => {
      let a = ARC[n];
      if (i === 0) {
        const nx = ARC[names[1]];
        if (!(near(a[a.length - 1], nx[0]) || near(a[a.length - 1], nx[nx.length - 1]))) a = a.slice().reverse();
      } else if (!near(a[0], end)) a = a.slice().reverse();
      for (let k = 0; k + 1 < a.length; k++) out.push({ a: a[k], b: a[k + 1], arc: n });
      end = a[a.length - 1];
    });
    return out;
  };
  const CODES = Object.keys(own).filter((c) => RINGS[c]);
  const users = {}; // arc → the countries on its two sides (one: a coast, or the grid's outer edge)
  const COUNTRY = {};
  for (const code of CODES) {
    RINGS[code].forEach((n) => (users[n] ??= []).push(code));
    const rings = [
      ringEdges(RINGS[code]),
      ...(ISLES[code] ?? []).map((isle) => {
        const p = isle.map(xz);
        return p.map((a, i) => ({ a, b: p[(i + 1) % p.length], arc: null }));
      }),
    ];
    COUNTRY[code] = rings.map((edges) => {
      const pts = edges.map((e) => e.a);
      return { edges, pts, box: bbox(pts), ccw: area2(pts) > 0, touched: edges.some((e) => SEGS.some((sg) => hit(e.a, e.b, sg.a, sg.b) >= 0)) };
    });
  }
  const ringAt = (p, code) => COUNTRY[code].find((r) => p[0] >= r.box[0] && p[0] <= r.box[2] && p[1] >= r.box[1] && p[1] <= r.box[3] && pip(p, r.pts));
  const codeAt = (p) => CODES.find((c) => ringAt(p, c));
  const wholeOf = (code, p) => (own[code].length > 1 ? regionOf(p) : own[code][0]);
  const plateAt = (p, code) => ((ringAt(p, code) ?? COUNTRY[code][0]).touched ? decide(p, code) : wholeOf(code, p));
  // « 23 pays » : the borders light up from your home outward
  const rankOf = {};
  CODES.map((c) => [c, dist2(centroid(COUNTRY[c][0].pts), P2("you"))])
    .sort((a, b) => a[1] - b[1])
    .forEach(([c], i) => (rankOf[c] = (i * 22) / Math.max(1, CODES.length - 1)));

  /* ── the three plates ── */
  const PL = Object.fromEntries(KEYS.map((k) => [k, { g: new THREE.Group(), top: [], zone: [], wall: [], wallN: [], cwall: [], cwallN: [], rim: ribbons(), border: ribbons(), lip: ribbons(), area: 0, cx: 0, cz: 0 }]));
  KEYS.forEach((k) => group.add(PL[k].g));
  const pushTop = (k, poly, zone) => {
    const T = PL[k];
    for (let i = 1; i + 1 < poly.length; i++) {
      const a = poly[0];
      let b = poly[i];
      let c = poly[i + 1];
      const cr = (b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]);
      if (Math.abs(cr) < 1e-7) continue;
      if (cr < 0) [b, c] = [c, b];
      T.top.push(a[0], 0, a[1], b[0], 0, b[1], c[0], 0, c[1]);
      T.zone.push(zone, zone, zone);
      const ar = Math.abs(cr) / 2;
      T.area += ar;
      T.cx += (ar * (a[0] + b[0] + c[0])) / 3;
      T.cz += (ar * (a[1] + b[1] + c[1])) / 3;
    }
  };
  for (const code of CODES)
    for (const ring of COUNTRY[code]) {
      const tris = triangles(ring.pts);
      const zone = ZONE[code] ?? 0;
      if (!ring.touched) {
        const k = wholeOf(code, centroid(ring.pts));
        tris.forEach((t) => pushTop(k, t, zone));
        continue;
      }
      for (const t of tris) {
        const tb = bbox(t);
        for (const reg of REGT)
          for (const rt of reg) {
            if (apart(tb, rt.box)) continue;
            const poly = clipTri(t, rt.t);
            if (poly.length >= 3) pushTop(decide(centroid(poly), code), poly, zone);
          }
      }
    }
  const addWall = (k, a, b, nx, nz, w = "wall") => {
    let p = a;
    let q = b;
    if ((q[1] - p[1]) * nx - (q[0] - p[0]) * nz < 0) [p, q] = [q, p];
    PL[k][w].push(p[0], 0, p[1], q[0], 0, q[1], q[0], -SLAB, q[1], p[0], 0, p[1], q[0], -SLAB, q[1], p[0], -SLAB, p[1]);
    for (let i = 0; i < 6; i++) PL[k][w + "N"].push(nx, 0, nz);
  };
  const Y_RIM = 0.03;
  // coasts (a wall, a rim) and borders (engraved once)
  for (const code of CODES)
    for (const ring of COUNTRY[code])
      for (const e of ring.edges) {
        const dx = e.b[0] - e.a[0];
        const dz = e.b[1] - e.a[1];
        const l = Math.hypot(dx, dz) || 1;
        const sgn = ring.ccw ? 1 : -1;
        const inx = (-dz / l) * sgn;
        const inz = (dx / l) * sgn;
        const us = e.arc ? users[e.arc] : [code];
        const coast = us.length < 2;
        if (!coast && us[0] !== code) continue;
        const rank = Math.min(...us.map((c) => rankOf[c]));
        const ts = [0, ...(ring.touched ? cutsOf(e.a, e.b).map((c) => c.t) : []), 1];
        for (let i = 0; i + 1 < ts.length; i++) {
          const p = lerp2(e.a, e.b, ts[i]);
          const q = lerp2(e.a, e.b, ts[i + 1]);
          const m = lerp2(p, q, 0.5);
          const k = ring.touched ? decide([m[0] + inx * 0.3, m[1] + inz * 0.3], code) : wholeOf(code, m);
          const bb = [0, rank, 0, 0];
          if (coast) {
            addWall(k, p, q, -inx, -inz);
            PL[k].rim.seg([p[0], Y_RIM, p[1]], [q[0], Y_RIM, q[1]], 0.1, 0, dist2(p, q), bb);
          } else PL[k].border.seg([p[0], Y_RIM, p[1]], [q[0], Y_RIM, q[1]], 0.07, 0, dist2(p, q), bb);
        }
      }
  // the split, where land stands on both sides: two walls face to face, and the place of its light
  const LAND = [];
  {
    const allEdges = CODES.flatMap((c) => COUNTRY[c].flatMap((r) => r.edges));
    for (const sg of SEGS) {
      const ts = [0, ...allEdges.map((e) => hit(sg.a, sg.b, e.a, e.b)).filter((t) => t >= 0).sort((x, y) => x - y), 1];
      const dx = sg.b[0] - sg.a[0];
      const dz = sg.b[1] - sg.a[1];
      const l = Math.hypot(dx, dz) || 1;
      const nx = -dz / l;
      const nz = dx / l;
      for (let i = 0; i + 1 < ts.length; i++) {
        if (ts[i + 1] - ts[i] < 1e-6) continue;
        const p = lerp2(sg.a, sg.b, ts[i]);
        const q = lerp2(sg.a, sg.b, ts[i + 1]);
        const m = lerp2(p, q, 0.5);
        if (!codeAt(m)) continue;
        const kl = regionOf([m[0] + nx * 0.05, m[1] + nz * 0.05]);
        const kr = regionOf([m[0] - nx * 0.05, m[1] - nz * 0.05]);
        if (kl === kr) continue;
        addWall(kl, p, q, -nx, -nz, "cwall");
        addWall(kr, p, q, nx, nz, "cwall");
        for (const k of [kl, kr]) PL[k].lip.seg([p[0], Y_RIM, p[1]], [q[0], Y_RIM, q[1]], 0.1, 0, dist2(p, q));
        LAND.push({ a: p, b: q, u0: sg.u0 + (sg.u1 - sg.u0) * ts[i], u1: sg.u0 + (sg.u1 - sg.u0) * ts[i + 1], chain: sg.chain, nx, nz });
      }
    }
  }

  /* ── materials ── */
  const ribMats = [];
  const wrap = (u) => Object.fromEntries(Object.entries(u).map(([k, v]) => [k, { value: v }]));
  const rib = (fs, u = {}) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { uPx: { value: 2000 }, uView: { value: VIEW }, uMinPx: { value: 0.9 }, uHaloPx: { value: 1.5 }, uBold: { value: 1 }, uLift: { value: 0 }, uGrow: { value: 0 }, uRail: { value: 0 }, uInk: { value: INK }, uSig: { value: SIG }, uVei: { value: VEI }, uAmount: { value: 1 }, uTime: { value: 0 }, ...wrap(u) },
      vertexShader: RIB_VS,
      fragmentShader: fs,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -8,
      ...MAXB,
    });
    ribMats.push(m);
    return m;
  };
  const path = (color, u = {}) => rib(PATH_FS, { uColor: new THREE.Color(color), uBase: 1, uLit: 1, uPays: 0, uReveal: 2, uHead: -1, uHeadK: 0, uHeadW: 0.05, uDash: 0, uDashV: 0, ...u });
  const dotMats = [];
  const points = (src, u = {}, fs = DOT_FS, vs = DOT_VS) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(src.pos, 3));
    g.setAttribute("aD", new THREE.Float32BufferAttribute(src.d, 4));
    const m = new THREE.ShaderMaterial({
      uniforms: { uPx: { value: 2000 }, uTime: { value: 0 }, uAmount: { value: 1 }, uSize: { value: 0.3 }, uMinPx: { value: 1 }, uBig: { value: 0 }, uLift: { value: 0 }, uT: { value: 0 }, uBreath: { value: 0 }, uSquare: { value: 0 }, uColA: { value: INK.clone() }, uColB: { value: new THREE.Color(0) }, uColF: { value: new THREE.Color(0) }, uInk: { value: INK }, uVei: { value: VEI }, uShed: { value: 0 }, uRelit: { value: 0 }, uDark: { value: 0 }, uItaly: { value: 0 }, uIberia: { value: 0 }, ...wrap(u) },
      vertexShader: vs,
      fragmentShader: fs,
      ...ADD,
    });
    const o = new THREE.Points(g, m);
    o.frustumCulled = false;
    o.renderOrder = 6;
    dotMats.push(m);
    return o;
  };
  const meshOf = (pos, attrs, material) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    for (const [name, [arr, size]] of Object.entries(attrs)) g.setAttribute(name, new THREE.Float32BufferAttribute(arr, size));
    return new THREE.Mesh(g, material);
  };
  const flat = (material, w, d, order = 4) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), material);
    m.scale.set(w, 1, d);
    m.renderOrder = order;
    m.frustumCulled = false;
    return m;
  };

  /* ── the plates' solids, their engraving, the layer of light on their top ── */
  // the top is MATT: seen at a grazing angle, any gloss mirrors the rim light in a pale slab across the map
  const topMat = solid(0x283036, { rough: 1, metal: 0, env: 0.1 });
  const wallMat = solid(0x5d676d, { rough: 0.5, metal: 0.3, double: true });
  const crackWallMat = solid(0x5d676d, { rough: 0.5, metal: 0.3, double: true }); // the split's two faces: the light from under paints them
  const overMat = new THREE.ShaderMaterial({
    uniforms: { uInk: { value: INK }, uVei: { value: VEI }, uZones: { value: 0 }, uZoneLit: { value: 0 }, uScan: { value: 0 }, uScanAll: { value: 0 }, uBxl: { value: 0 }, uBxlC: { value: new THREE.Vector2(...P2("bruxelles")) }, uGeo: { value: new THREE.Vector4(lonlat(1, 0)[0] - lonlat(0, 0)[0], lonlat(0, 0)[1] - lonlat(0, 1)[1], MAP.lon0, MAP.lat0) } },
    vertexShader: OVER_VS,
    fragmentShader: OVER_FS,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
    ...ADD,
  });
  const rimMat = path(BRAND.ink, { uBase: 0.5, uLit: 1.0 });
  const borderMat = path(BRAND.ink, { uBase: 0.2, uLit: 0.85 });
  const lipMat = path(BRAND.ink, { uBase: 0.6 });
  const contourMat = { subs: path(BRAND.ink, { uBase: 0.5 }), lines: path(BRAND.ink, { uBase: 0.5 }), plants: path(BRAND.ink, { uBase: 0.5 }) };
  // a lifted layer is a sheet of DARK glass: it dims what lies under it (drawn bottom to top: renderOrder 10, 20, 30)
  const sheetOf = () => new THREE.MeshBasicMaterial({ color: 0x0b1013, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const sheetMat = { subs: sheetOf(), lines: sheetOf(), plants: sheetOf() };
  const solids = [];
  const overs = [];
  const contours = [];
  for (const k of KEYS) {
    const T = PL[k];
    const up = [];
    for (let i = 0; i < T.top.length / 3; i++) up.push(0, 1, 0);
    const top = meshOf(T.top, { normal: [up, 3], aZone: [T.zone, 1] }, topMat);
    top.receiveShadow = true;
    top.castShadow = true;
    const wall = meshOf(T.wall, { normal: [T.wallN, 3] }, wallMat);
    wall.castShadow = true;
    const cwall = meshOf(T.cwall, { normal: [T.cwallN, 3] }, crackWallMat);
    T.g.add(cwall);
    solids.push(cwall);
    const over = new THREE.Mesh(top.geometry, overMat);
    over.renderOrder = 2;
    over.position.y = 0.01;
    const rimGeo = T.rim.geometry();
    T.g.add(top, wall, over, ribbonMesh(rimGeo, rimMat), ribbonMesh(T.border.geometry(), borderMat), ribbonMesh(T.lip.geometry(), lipMat));
    solids.push(top, wall);
    overs.push(over);
    for (const level of ["subs", "lines", "plants"]) {
      // the exploded view: each lifted layer is a sheet of glass in the shape of the land, with its outline
      const li = level === "subs" ? 1 : level === "lines" ? 2 : 3;
      const c = ribbonMesh(rimGeo, contourMat[level], 10 * li + 1);
      const sheet = new THREE.Mesh(top.geometry, sheetMat[level]);
      sheet.renderOrder = 10 * li;
      contours.push(c, sheet);
      T.g.add(c, sheet);
    }
    T.cx /= Math.max(T.area, 1e-6);
    T.cz /= Math.max(T.area, 1e-6);
  }

  /* ── the table: a grid and a halo (the sea is nothing) ; what stands out of the grid, in glass ── */
  const table = makeSurface({ radius: 1000, cell: 12, fade: 400, lift: 4 });
  table.group.position.set(MAP.centre[0], -SLAB, MAP.centre[2]);
  table.grid.uAmount.value = 0.07;
  // seen at a grazing angle, a floor with any gloss mirrors the rim light: a slab across the picture
  Object.assign(table.group.children[0].material, { roughness: 1, envMapIntensity: 0 });
  group.add(table.group);
  const haloMat = new THREE.ShaderMaterial({ uniforms: { uColor: { value: INK.clone() }, uAmount: { value: 0.12 } }, vertexShader: FLAT_VS, fragmentShader: HALO_FS, ...ADD });
  const halo = flat(haloMat, 1150, 950, 1);
  halo.position.set(MAP.centre[0], -SLAB + 0.3, MAP.centre[2]);
  group.add(halo);
  const glassMat = path(BRAND.ink, { uBase: 0.2 });
  const glassFill = new THREE.MeshBasicMaterial({ color: INK.clone().multiplyScalar(0.035), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  {
    const r = ribbons();
    const fill = [];
    for (const ring of GLASS) {
      const pts = ring.map(xz);
      r.line([...pts, pts[0]].map((p) => [p[0], 0, p[1]]), 0.08);
      for (const t of triangles(pts)) for (const p of t) fill.push(p[0], -0.02, p[1]);
    }
    const f = meshOf(fill, {}, glassFill);
    f.material.side = THREE.DoubleSide;
    group.add(ribbonMesh(r.geometry(), glassMat, 3), f);
  }
  const plinth = new THREE.Mesh(cyl(DIAL_AT.r * 0.45, SLAB, 0.25, 48), solid(0x5d676d, { rough: 0.5, metal: 0.3 }));
  plinth.position.set(DIAL_AT.at[0], -SLAB / 2, DIAL_AT.at[2]);
  plinth.castShadow = true;
  group.add(plinth);

  /* ── the grid's nodes ── */
  const NODE = {};
  const addNode = (id, p, w, plant) => {
    const code = codeAt(p);
    NODE[id] = { id, p, w, plant, code, plate: code ? plateAt(p, code) : "west" };
  };
  for (const [id, [lo, la, w, pl]] of Object.entries(NODE_LL)) addNode(id, lonlat(lo, la), w, pl);
  for (const id of Object.keys(PLACE)) {
    if (NOT_NODES.includes(id)) continue;
    const [w, pl] = PLACE_W[id] ?? [0, 0];
    addNode(id, P2(id), w, pl);
  }

  /* ── the 380 kV grid ── */
  const NETR = Object.fromEntries(KEYS.map((k) => [k, ribbons()]));
  const mainMid = centroid(MAIN_RIVER);
  const tripKeys = [[(PLACE.landesbergen[2] + PLACE.wehrendorf[2]) / 2, 0.02], [PLACE.bielefeld[2], 0.15], [PLACE.elsen[2], 0.3], [mainMid[1], 0.8], [PLACE.raitersaich[2], 0.87], [Jp[1], 1]].sort((a, b) => a[0] - b[0]);
  /** The cascade's threshold of a line that crosses the West | North-East split at z (world.js · FIRST · cascade). */
  const tripOf = (z) => {
    if (z <= tripKeys[0][0]) return tripKeys[0][1];
    for (let i = 0; i + 1 < tripKeys.length; i++) {
      const [z0, v0] = tripKeys[i];
      const [z1, v1] = tripKeys[i + 1];
      if (z <= z1) return v0 + ((v1 - v0) * (z - z0)) / Math.max(z1 - z0, 1e-6);
    }
    return 1;
  };
  const emsMid = lerp2(P2("conneforde"), P2("diele"), 0.5);
  const links = LINKS.trim()
    .split(/\s+/)
    .map((tok) => {
      const m = tok.match(/^([A-Za-z]+)-([A-Za-z]+)([!~%+?^]*)$/);
      return m && NODE[m[1]] && NODE[m[2]] ? { a: NODE[m[1]], b: NODE[m[2]], f: m[3] } : null;
    })
    .filter(Boolean);
  for (const L of links) {
    const [na, nb] = L.a.p[0] >= L.b.p[0] ? [L.a, L.b] : [L.b, L.a]; // east → west: the way the dashes run
    const a = na.p;
    const b = nb.p;
    const len = dist2(a, b);
    const cuts = cutsOf(a, b).map((c) => {
      const pt = lerp2(a, b, c.t);
      return { t: c.t, u: c.sg.u0 + ((c.sg.u1 - c.sg.u0) * dist2(pt, c.sg.a)) / Math.max(dist2(c.sg.a, c.sg.b), 1e-6), trip: c.sg.chain === "wne" ? tripOf(pt[1]) : 9 };
    });
    if (!cuts.length && na.plate !== nb.plate) cuts.push({ t: 0.5, u: 0.5, trip: 9 });
    const axis = L.f.includes("!") ? 1 : 0;
    const role = L.f.includes("~") ? 1 : L.f.includes("%") ? 2 : L.f.includes("+") ? 3 : L.f.includes("?") ? 4 : L.f.includes("^") ? 5 : 0;
    const load = Math.exp(-((dist2(lerp2(a, b, 0.5), emsMid) / 30) ** 2));
    const ma = DARK[na.code] ?? 0;
    const mask = ma === (DARK[nb.code] ?? 0) ? ma : 0;
    const ts = [0, ...cuts.map((c) => c.t), 1];
    for (let i = 0; i + 1 < ts.length; i++) {
      const p = lerp2(a, b, ts[i]);
      const q = lerp2(a, b, ts[i + 1]);
      const k = i === 0 ? na.plate : i === ts.length - 2 ? nb.plate : regionOf(lerp2(p, q, 0.5));
      const c0 = cuts[i - 1];
      const c1 = cuts[i];
      const xu = Math.min(c0 ? c0.u : 9, c1 ? c1.u : 9);
      const xt = Math.min(c0 ? c0.trip : 9, c1 ? c1.trip : 9);
      const l = dist2(p, q);
      const sp = c0 ? 0 : c1 ? l : toChain(p);
      const sq = c1 ? 0 : c0 ? l : toChain(q);
      NETR[k].seg([p[0], 0, p[1]], [q[0], 0, q[1]], axis ? 0.2 : 0.15, len * ts[i], len * ts[i + 1], [axis, xt, xu, sp], [axis, xt, xu, sq], [mask, role, load, 0]);
    }
  }

  /* ── the plants: small solid rotors, each beside its node ── */
  const PLANTS = Object.fromEntries(KEYS.map((k) => [k, []]));
  let hero = null;
  {
    const R = rng(380);
    for (const n of Object.values(NODE)) {
      if (!n.plant) continue;
      const s = n.id === "grafenrheinfeld" ? 1.7 : 1;
      const t = R() * Math.PI * 2;
      let p = [n.p[0] + Math.cos(t) * 2.8 * s, n.p[1] + Math.sin(t) * 2.8 * s];
      if (toChain(p) < toChain(n.p) || !codeAt(p)) p = [n.p[0] - Math.cos(t) * 2.8 * s, n.p[1] - Math.sin(t) * 2.8 * s];
      PLANTS[n.plate].push({ p, s });
      NETR[n.plate].seg([n.p[0], 0, n.p[1]], [p[0], 0, p[1]], 0.1, 0, 2.8 * s, [0, 9, 9, 99], [0, 9, 9, 99], [DARK[n.code] ?? 0, 0, 0, 0]);
      if (s > 1) hero = { p, s, plate: n.plate };
    }
  }
  const ROTOR_H = 1.4;
  const rotorGeo = cyl(1.5, ROTOR_H, 0.14, 40).translate(0, ROTOR_H / 2, 0);
  const rotorMat = solid(0x727b80, { rough: 0.6, metal: 0.2 }); // mid grey: the veille mark must read on its top
  const ROTOR_C = rotorMat.color.clone();
  const markGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const rotorMeshes = [];
  const markMats = {};
  {
    const M = new THREE.Matrix4();
    const Q = new THREE.Quaternion();
    for (const k of KEYS) {
      const list = PLANTS[k];
      const rot = new THREE.InstancedMesh(rotorGeo, rotorMat, Math.max(1, list.length));
      const mat = new THREE.ShaderMaterial({ uniforms: { uPx: { value: 2000 }, uVei: { value: VEI }, uAngle: { value: 0 }, uAmount: { value: 1 }, uReserve: { value: 0 }, uTime: { value: 0 } }, vertexShader: MARK_VS, fragmentShader: MARK_FS, ...ADD });
      const marks = new THREE.InstancedMesh(markGeo, mat, Math.max(1, list.length));
      list.forEach(({ p, s }, i) => {
        rot.setMatrixAt(i, M.compose(new THREE.Vector3(p[0], 0, p[1]), Q, new THREE.Vector3(s, s, s)));
        marks.setMatrixAt(i, M.compose(new THREE.Vector3(p[0], ROTOR_H * s + 0.05, p[1]), Q, new THREE.Vector3(5.7 * s, 1, 5.7 * s)));
      });
      rot.count = marks.count = list.length;
      rot.castShadow = true;
      rot.frustumCulled = marks.frustumCulled = false;
      marks.renderOrder = 32;
      PL[k].g.add(rot, marks);
      rotorMeshes.push(rot, marks);
      markMats[k] = mat;
    }
  }

  /* ── the story's own lines ── */
  const STORY_AT = { ...PLACE };
  const lineMats = {};
  for (const [id, [ka, kb]] of Object.entries(STORY)) {
    const a = P2(ka);
    const b = P2(kb);
    const l = dist2(a, b) || 1;
    const off = id === "ems1" ? 0.38 : id === "ems2" ? -0.38 : 0; // the double line over the Ems: two circuits side by side
    const ox = (-(b[1] - a[1]) / l) * off;
    const oz = ((b[0] - a[0]) / l) * off;
    const r = ribbons();
    r.line([[a[0] + ox, 0, a[1] + oz], [b[0] + ox, 0, b[1] + oz]], 0.2);
    lineMats[id] = rib(LINE_FS, { uLevel: 0.8, uSigK: 0, uVeiK: 0, uDie: 0, uGhost: 0, uFill: 1 });
    const pa = STORY_AT[ka] && codeAt(a) ? plateAt(a, codeAt(a)) : "west";
    const pb = codeAt(b) ? plateAt(b, codeAt(b)) : pa;
    PL[pa === pb ? pa : "west"].g.add(ribbonMesh(r.geometry(), lineMats[id], 22));
  }
  const regC = centroid(["landesbergen", "wehrendorf", "bielefeld", "elsen"].map(P2));
  const netMats = Object.fromEntries(
    KEYS.map((k) => {
      const m = rib(NET_FS, { uFlow: 1, uVolt: 1, uCascade: 0, uCrack: 0, uLost: 0, uSurplus: 0, uDark: 0, uItaly: 0, uIberia: 0, uLoad: 0, uWorks: 0, uN1ok: 0, uN1sim: 0, uRegC: new THREE.Vector2(regC[0], regC[1]) });
      PL[k].g.add(ribbonMesh(NETR[k].geometry(), m, 22));
      return [k, m];
    }),
  );

  /* ── the postes (squares at the nodes) ── */
  const subMats = [];
  for (const k of KEYS) {
    const src = { pos: [], d: [] };
    for (const n of Object.values(NODE)) {
      if (n.plate !== k) continue;
      const story = n.id in PLACE && (PLACE_W[n.id]?.[0] ?? 0) < 2 && !n.id.startsWith("dispatch");
      src.pos.push(n.p[0], 0, n.p[1]);
      src.d.push(n.w >= 2 ? 1.25 : 1, 2, story ? 1 : 0, 0);
    }
    const o = points(src, { uSize: 0.62, uMinPx: 1.5, uSquare: 1 });
    o.material.uniforms.uColA.value.copy(INK).multiplyScalar(0.95);
    o.renderOrder = 12;
    subMats.push(o.material);
    PL[k].g.add(o);
  }

  /* ── the homes (a dust of light, denser on the towns), the relays, the small units, the wind farms ── */
  const HOMES = Object.fromEntries(KEYS.map((k) => [k, { pos: [], d: [] }]));
  const RELAY = { pos: [], d: [] };
  const SMALL = { pos: [], d: [] };
  const WINDS = { pos: [], d: [] };
  {
    const R = rng(20061104);
    const gauss = () => Math.sqrt(-2 * Math.log(1 - R() * 0.9999)) * Math.cos(2 * Math.PI * R());
    let count = 0;
    const home = (p, code, town) => {
      const k = plateAt(p, code);
      let rank = 2;
      if (k === "west") {
        const v = 0.62 * noise(p[0] / 16 + 31.7, p[1] / 16 + 11.3) + 0.38 * R();
        const thr = 0.25 + 0.52 * (SHED[code] ?? SHED_ELSE);
        if (v < thr) rank = clamp01((v - 0.12) / (thr - 0.12)) * 0.94 + 0.03;
        count++;
        if (town && count % 5 === 0) {
          RELAY.pos.push(p[0] + gauss() * 0.5, 0.2, p[1] + gauss() * 0.5);
          RELAY.d.push(1, 2, 0, R());
        }
        if (!town && count % 3 === 0) {
          SMALL.pos.push(p[0] + gauss(), 0.16, p[1] + gauss());
          SMALL.d.push(1, R() * 0.92 + 0.02, 0, R());
        }
      }
      HOMES[k].pos.push(p[0], 0.12, p[1]);
      HOMES[k].d.push(R(), rank, R() < 0.5 ? 0.5 : 1, DARK[code] ?? 0);
    };
    for (const code of CODES)
      for (const ring of COUNTRY[code]) {
        const n = (Math.abs(area2(ring.pts)) / 2) * 0.055;
        const [x0, z0, x1, z1] = ring.box;
        for (let got = 0, tries = 0; got < n && tries < n * 40; tries++) {
          const p = [x0 + R() * (x1 - x0), z0 + R() * (z1 - z0)];
          if (!pip(p, ring.pts)) continue;
          home(p, code, false);
          got++;
        }
      }
    for (const n of Object.values(NODE)) {
      if (!n.w || !n.code) continue;
      const sd = 1.4 + 1.2 * n.w;
      for (let i = 0; i < 40 + 70 * n.w; i++) {
        const p = [n.p[0] + gauss() * sd, n.p[1] + gauss() * sd];
        const c = codeAt(p);
        if (c) home(p, c, true);
      }
    }
    for (const [lo0, lo1, la0, la1, n] of WIND)
      for (let got = 0, tries = 0; got < n && tries < n * 40; tries++) {
        const p = lonlat(lo0 + R() * (lo1 - lo0), la0 + R() * (la1 - la0));
        const c = codeAt(p);
        if (!c || plateAt(p, c) !== "east") continue;
        WINDS.pos.push(p[0], 0.3, p[1]);
        WINDS.d.push(1, R() * 0.9 + 0.03, 0, R());
        got++;
      }
  }
  const homeMats = {};
  for (const k of KEYS) {
    const o = points(HOMES[k], { uSize: 0.26, uMinPx: 1.15 }, HOME_FS, HOME_VS);
    homeMats[k] = o.material;
    PL[k].g.add(o);
  }
  const relays = points(RELAY, { uSize: 0.3, uMinPx: 1.3, uBreath: 0.45 });
  relays.material.uniforms.uColA.value.copy(VEI).multiplyScalar(0.95);
  const smalls = points(SMALL, { uSize: 0.22, uMinPx: 1.0 });
  smalls.material.uniforms.uColA.value.copy(INK).multiplyScalar(0.32);
  smalls.material.uniforms.uColF.value.copy(SIG).multiplyScalar(1.5);
  PL.west.g.add(relays, smalls);
  const winds = points(WINDS, { uSize: 0.34, uMinPx: 1.4 });
  PL.east.g.add(winds);
  const youAt = P2("you");
  const youPlate = PL[codeAt(youAt) ? plateAt(youAt, codeAt(youAt)) : "west"].g;
  const you = points({ pos: [youAt[0], 0.5, youAt[1]], d: [1, 2, 0, 0] }, { uSize: 3.2, uMinPx: 16 }, GLOW_FS);
  you.material.uniforms.uColA.value.copy(VEI);
  you.renderOrder = 9;
  youPlate.add(you);
  // Landesbergen–Wehrendorf over its limit: a light that has a place, seen from across the map (`lw` 1)
  const lwAt = lerp2(P2("landesbergen"), P2("wehrendorf"), 0.5);
  const lwGlow = points({ pos: [lwAt[0], 0, lwAt[1]], d: [1, 2, 0, 0] }, { uSize: 2.6, uMinPx: 22 }, GLOW_FS);
  lwGlow.material.uniforms.uColA.value.copy(SIG);
  lwGlow.renderOrder = 23;
  PL.west.g.add(lwGlow);

  /* ── the pulse on three cities ── */
  const pulses = ["lisbonne", "paris", "varsovie"].map((id) => {
    const n = NODE[id];
    const mat = new THREE.ShaderMaterial({ uniforms: { uVei: { value: VEI }, uAmount: { value: 0 }, uBeat: { value: 0 } }, vertexShader: FLAT_VS, fragmentShader: PULSE_FS, ...ADD });
    const m = flat(mat, 68, 68, 8);
    m.position.set(n.p[0], 0.4, n.p[1]);
    PL[n.plate].g.add(m);
    return { mat, m, plate: n.plate };
  });

  /* ── the split's light, chain by chain: a hairline on the joint, a curtain rising from it, a pool between the plates ── */
  const crackColor = new THREE.Color();
  const hairMat = path(BRAND.signal, { uBase: 1, uHeadK: 1.4, uHeadW: 0.03 });
  hairMat.uniforms.uColor.value = crackColor;
  hairMat.uniforms.uMinPx.value = 1.1;
  const crackMat = (floor) => new THREE.ShaderMaterial({ uniforms: { uColor: { value: crackColor }, uCrack: { value: 0 }, uAll: { value: 0 }, uAmount: { value: 0 }, uTime: { value: 0 }, uFloor: { value: floor }, uW: { value: 0 } }, vertexShader: CRACK_VS, fragmentShader: CRACK_FS, side: THREE.DoubleSide, ...MAXB });
  const curtainMat = crackMat(0);
  const CURTAIN = 9;
  const cracks = ["wne", "wse", "nese"].map((chain) => {
    const g = new THREE.Group();
    const cur = { pos: [], n: [], u: [] };
    const flo = { pos: [], n: [], u: [] };
    const hair = ribbons();
    const quad = (o, pts, ns, us) => {
      for (const i of [0, 1, 2, 0, 2, 3]) {
        o.pos.push(...pts[i]);
        o.n.push(...ns[i]);
        o.u.push(us[i]);
      }
    };
    for (const { a, b, u0, u1, nx, nz } of LAND.filter((s) => s.chain === chain)) {
      const y0 = -SLAB + 0.45; // over the table's shadow catcher
      quad(cur, [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], CURTAIN, b[1]], [a[0], CURTAIN, a[1]]], [[0, 0, 0], [0, 0, 0], [0, 0, 1], [0, 0, 1]], [u0, u1, u1, u0]);
      quad(flo, [[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y0, b[1]], [a[0], y0, a[1]]], [[-nx, -nz, -1], [-nx, -nz, -1], [nx, nz, 1], [nx, nz, 1]], [u0, u1, u1, u0]);
      hair.seg([a[0], 0.06, a[1]], [b[0], 0.06, b[1]], 0.2, 0, dist2(a, b), [u0, 0, 0, 0], [u1, 0, 0, 0]);
      // round joints: the chain zigzags, and a strip as wide as the gap leaves a dark wedge on the outside of every bend
      for (const [c0, u] of [[a, u0], [b, u1]])
        for (let i = 0; i < 12; i++) {
          const t0 = (i / 12) * Math.PI * 2;
          const t1 = ((i + 1) / 12) * Math.PI * 2;
          for (const n3 of [[0, 0, 0], [Math.cos(t0), Math.sin(t0), 1], [Math.cos(t1), Math.sin(t1), 1]]) {
            flo.pos.push(c0[0], y0, c0[1]);
            flo.n.push(...n3);
            flo.u.push(u);
          }
        }
    }
    const floorMat = crackMat(1);
    const c = meshOf(cur.pos, { aN: [cur.n, 3], aU: [cur.u, 1] }, curtainMat);
    const f = meshOf(flo.pos, { aN: [flo.n, 3], aU: [flo.u, 1] }, floorMat);
    c.renderOrder = f.renderOrder = 8;
    c.frustumCulled = f.frustumCulled = false;
    g.add(f, c, ribbonMesh(hair.geometry(), hairMat, 8));
    group.add(g);
    return { g, floorMat, chain };
  });

  /* ── the other paths ── */
  const WY = MAP.wire;
  const lift3 = (p, y) => [p[0], y, p[1]];
  // the second split the report feared: the borders of the country where Mikulowa stands, dashed
  const crack2Mat = path(BRAND.signal, { uBase: 1.3, uDash: 2.4, uDashV: 0.5 });
  {
    const code = codeAt(P2("mikulowa"));
    const r = ribbons();
    for (const [name, us] of Object.entries(users)) if (us.length === 2 && us.includes(code)) r.line(ARC[name].map((p) => lift3(p, 0.1)), 0.24);
    crack2Mat.uniforms.uMinPx.value = 1.2;
    PL.east.g.add(ribbonMesh(r.geometry(), crack2Mat, 7));
  }
  const mainMat = path(BRAND.ink, { uBase: 0.34 });
  {
    const r = ribbons();
    r.line(MAIN_RIVER.map((p) => lift3(p, 0.08)), 0.3);
    group.add(ribbonMesh(r.geometry(), mainMat, 4));
  }
  const at = (id) => (NODE[id] ? NODE[id].p : P2(id));
  const threadMat = path(BRAND.ink, { uBase: 0.55, uHeadK: 1.6, uHeadW: 0.025 });
  {
    const r = ribbons();
    r.line(THREAD.map((id) => lift3(at(id), WY + 0.4)), 0.16);
    threadMat.uniforms.uMinPx.value = 1.1;
    PL.west.g.add(ribbonMesh(r.geometry(), threadMat, 23));
  }
  const shareMat = path(BRAND.veille, { uBase: 0.9 });
  {
    const r = ribbons();
    const pts = DISPATCH.filter((id) => NODE[id]).map(at);
    const hub = at("bruxelles");
    const seen = new Set();
    pts.forEach((p, i) => {
      const nearest = pts
        .map((q, j) => [dist2(p, q), j])
        .filter(([, j]) => j !== i)
        .sort((x, y) => x[0] - y[0])
        .slice(0, 2)
        .map(([, j]) => j);
      for (const j of nearest) {
        const key = Math.min(i, j) + "-" + Math.max(i, j);
        if (seen.has(key)) continue;
        seen.add(key);
        r.line([lift3(p, WY + 0.7), lift3(pts[j], WY + 0.7)], 0.16);
      }
      if (dist2(p, hub) > 1) r.line([lift3(hub, WY + 0.7), lift3(p, WY + 0.7)], 0.12);
    });
    group.add(ribbonMesh(r.geometry(), shareMat, 7));
  }
  const phoneMat = path(BRAND.ink, { uBase: 0.16, uHeadK: 1.9, uHeadW: 0.07 });
  {
    const r = ribbons();
    r.line([lift3(at("dispatchRwe"), WY + 0.9), lift3(at("dispatchEon"), WY + 0.9)], 0.16);
    phoneMat.uniforms.uMinPx.value = 1.1;
    group.add(ribbonMesh(r.geometry(), phoneMat, 7));
  }

  /* ── the dams in the Alps: small solid works, their lake, the water that goes up (pumps) or comes down (hydro) ── */
  const lakeMat = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false });
  const pipeMat = path(BRAND.ink, { uBase: 1, uDash: 1.5, uDashV: 2 });
  {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 3.1, -1.15, 1.15, false);
    shape.absarc(0, 0, 2.5, 1.15, -1.15, true);
    const damGeo = new THREE.ExtrudeGeometry(shape, { depth: 1.8, bevelEnabled: false, curveSegments: 18 }).rotateX(-Math.PI / 2);
    const lakeGeo = new THREE.CircleGeometry(2.5, 28).rotateX(-Math.PI / 2);
    const damMat = solid(0x808a8f, { rough: 0.5, metal: 0.3 });
    const R = rng(7);
    const r = ribbons();
    for (const ll of DAMS) {
      const p = xz(ll);
      const code = codeAt(p);
      if (!code) continue;
      const g = PL[plateAt(p, code)].g;
      const yaw = R() * Math.PI * 2;
      const dam = new THREE.Mesh(damGeo, damMat);
      dam.position.set(p[0], 0, p[1]);
      dam.rotation.y = yaw;
      dam.castShadow = true;
      const lake = new THREE.Mesh(lakeGeo, lakeMat);
      lake.position.set(p[0], 1.25, p[1]);
      g.add(dam, lake);
      // the dam's wall faces local +x: the valley is that way
      const vx = Math.cos(yaw);
      const vz = -Math.sin(yaw);
      r.line([[p[0] + vx * 8.5, 0.12, p[1] + vz * 8.5], [p[0] + vx * 3.3, 0.6, p[1] + vz * 3.3], [p[0] + vx * 2.4, 1.3, p[1] + vz * 2.4]], 0.2);
    }
    pipeMat.uniforms.uMinPx.value = 1.1;
    PL.west.g.add(ribbonMesh(r.geometry(), pipeMat, 7));
  }

  /* ── anchors ── */
  const anc = (parent, x, y, z) => {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    return o;
  };
  const A = {};
  for (const id of Object.keys(PLACE)) {
    const p = P2(id);
    const code = codeAt(p);
    A[id] = anc(PL[code ? plateAt(p, code) : "west"].g, p[0], WY, p[1]);
  }
  A.dial = anc(PL.west.g, DIAL_AT.at[0], DIAL_AT.at[1], DIAL_AT.at[2]);
  A.dial.rotation.y = -Math.PI / 2; // the dial's face (+z local) toward −x
  A.main = anc(group, mainMid[0], WY, mainMid[1]);
  const crackAt = wne.reduce((m, p) => (dist2(p, mainMid) < dist2(m, mainMid) ? p : m), wne[0]);
  A.crack = anc(group, crackAt[0], 0, crackAt[1]);
  A.plant = hero ? anc(PL[hero.plate].g, hero.p[0], ROTOR_H * hero.s, hero.p[1]) : anc(group, 0, 0, 0);
  for (const k of KEYS) A[k] = anc(PL[k].g, PL[k].cx, 0, PL[k].cz);

  /* ── every frame ── */
  const dE = MAP.drift.east;
  const dS = MAP.drift.south;
  const gapE = Math.hypot(dE[0], dE[2]);
  const gapS = Math.hypot(dS[0], dS[2]);
  const flashOf = (x) => sm(-0.015, 0, x) * (1 - sm(0.005, 0.05, x));
  const turn = { west: 0, east: 0, south: 0 }; // each plate's offset from the common rhythm (degrees)
  const setLine = (id, amount, level, sig, die, bold, minPx = 0.9) => {
    const u = lineMats[id].uniforms;
    u.uAmount.value = amount;
    u.uLevel.value = level;
    u.uSigK.value = sig;
    u.uDie.value = die;
    u.uBold.value = bold;
    u.uMinPx.value = minPx + 0.8 * sig;
    u.uHaloPx.value = 1.5 + 5 * sig;
    return u;
  };

  return {
    group,
    A,
    update(S, time, px) {
      plinth.visible = S.dial > 0.01; // the dial's foot only under the dial (c4 retouch: a dark disc on westPlate / iberia)
      const e = S.explode;
      const named = Math.round(S.named);
      const f1 = named === 0 ? 1 : named === 1 ? 1.8 : 0.2; //  the plants
      const f2 = named === 0 ? 1 : named === 2 ? 1.8 : 0.2; //  the lines
      const f3 = named === 0 ? 1 : named === 3 ? 1.8 : 0.2; //  the postes
      const f4 = named === 0 ? 1 : named === 4 ? 1.25 : 0.25; // the homes
      const aE = S.apartE;
      const aS = S.apartS;
      const land = clamp01(S.land);
      turn.west = S.turnW;
      turn.east = S.turnE;
      turn.south = S.turnS;

      for (const m of ribMats) {
        m.uniforms.uPx.value = px;
        m.uniforms.uTime.value = time;
      }
      for (const m of dotMats) {
        m.uniforms.uPx.value = px;
        m.uniforms.uTime.value = time;
      }

      /* the plates */
      PL.east.g.position.set(dE[0] * aE, 0, dE[2] * aE);
      PL.south.g.position.set(dS[0] * aS, 0, dS[2] * aS);
      for (const s of solids) s.visible = land > 0.01;
      topMat.opacity = wallMat.opacity = crackWallMat.opacity = land;
      topMat.transparent = wallMat.transparent = crackWallMat.transparent = land < 0.999;
      rimMat.uniforms.uAmount.value = land;
      borderMat.uniforms.uAmount.value = land;
      rimMat.uniforms.uPays.value = borderMat.uniforms.uPays.value = S.pays;
      lipMat.uniforms.uAmount.value = land * sm(0, 0.12, Math.max(aE, aS));
      const eK = Math.min(1, e);
      for (let i = 0; i < contours.length; i++) {
        const level = (i >> 1) % 3;
        contours[i].visible = e > 0.01;
        contours[i].position.y = (level === 0 ? LY.subs : level === 1 ? LY.lines : LY.plants) * e - (i & 1 ? 0.4 : 0.35);
      }
      contourMat.subs.uniforms.uAmount.value = eK * f3;
      contourMat.lines.uniforms.uAmount.value = eK * f2;
      contourMat.plants.uniforms.uAmount.value = eK * f1;
      sheetMat.subs.opacity = sheetMat.lines.opacity = sheetMat.plants.opacity = 0.2 * eK;
      const ov = overMat.uniforms;
      ov.uZones.value = S.zones;
      ov.uZoneLit.value = Math.round(S.zoneLit);
      ov.uScan.value = S.scan;
      ov.uScanAll.value = S.scanAll;
      ov.uBxl.value = S.bxl;
      const overOn = S.zones > 0.001 || S.scanAll > 0.001 || S.bxl > 0.001;
      for (const o of overs) o.visible = overOn;

      /* the grid */
      const net = S.net * f2;
      const lineY = WY + LY.lines * e;
      for (const k of KEYS) {
        const u = netMats[k].uniforms;
        u.uAmount.value = net;
        u.uLift.value = lineY;
        u.uFlow.value = S.flow;
        u.uVolt.value = S.volt;
        u.uCascade.value = S.cascade;
        u.uCrack.value = S.crack;
        u.uLoad.value = S.load;
        u.uGrow.value = S.load * 1.3;
        u.uWorks.value = S.works;
        u.uN1ok.value = S.n1ok;
        u.uN1sim.value = S.n1sim;
        u.uRail.value = S.n1ok;
        u.uItaly.value = S.italy;
        u.uIberia.value = S.iberia;
      }
      netMats.west.uniforms.uLost.value = S.lost;
      netMats.west.uniforms.uDark.value = S.whatif;
      netMats.east.uniforms.uSurplus.value = S.surplus;

      /* the story's lines */
      const reg = S.region;
      const bold = 1 + 1.6 * reg;
      const volt = 0.8 * (0.45 + 0.55 * S.volt);
      const cas = S.cascade;
      const rail = S.n1ok;
      setLine("ems1", net, volt, 0, clamp01(S.emsCut), bold).uLift.value = lineY;
      setLine("ems2", net, volt, 0, clamp01(S.emsCut - 1), bold).uLift.value = lineY;
      const lw = setLine("lw", net, volt, Math.max(clamp01(S.lw), S.n1sim), clamp01(S.lw - 1), bold * (1 + 0.7 * S.load) * (1 + 2.2 * rail));
      lw.uLift.value = lineY;
      lw.uRail.value = sm(0, 0.3, rail);
      lw.uFill.value = rail > 0 ? 1 / (1 + 2.2 * rail) + (0.72 - 1 / (1 + 2.2 * rail)) * sm(0.35, 1, rail) : 1;
      const breath = 0.78 + 0.22 * Math.sin(time * 1.5);
      setLine("c1", net, volt, Math.max(flashOf(cas - 0.15), S.n1sim, 0.6 * S.load), sm(0.15, 0.18, cas), bold * (1 + 0.5 * S.load)).uLift.value = lineY;
      setLine("c2", net, volt, Math.max(flashOf(cas - 0.25), S.alarm * breath, 0.5 * S.load), sm(0.25, 0.28, cas), bold * (1 + 0.5 * S.load)).uLift.value = lineY;
      setLine("c3", net, volt, Math.max(flashOf(cas - 0.32), S.alarm * breath, S.n1sim, 0.5 * S.load), sm(0.32, 0.35, cas), bold * (1 + 0.5 * S.load)).uLift.value = lineY;
      setLine("pol", net, 0.8, S.poland, 0, 1 + 0.8 * S.poland).uLift.value = lineY;
      setLine("mar", net, 0.8, 0, 1 - clamp01(S.maroc), 1.2).uLift.value = lineY;
      mainMat.uniforms.uAmount.value = reg * land;

      /* the postes, the homes, the relays, the small units, the wind farms, your home */
      for (const m of subMats) {
        m.uniforms.uAmount.value = S.subs * f3;
        m.uniforms.uLift.value = WY + LY.subs * e;
        m.uniforms.uBig.value = reg * 1.5;
      }
      const homes = S.homes * f4;
      for (const k of KEYS) {
        const u = homeMats[k].uniforms;
        u.uAmount.value = homes;
        u.uItaly.value = S.italy;
        u.uIberia.value = S.iberia;
      }
      homeMats.west.uniforms.uShed.value = S.shed;
      homeMats.west.uniforms.uRelit.value = S.relit;
      homeMats.west.uniforms.uDark.value = S.whatif;
      relays.visible = S.relays > 0.005;
      relays.material.uniforms.uAmount.value = S.relays;
      smalls.material.uniforms.uAmount.value = homes * (1 - S.whatif);
      smalls.material.uniforms.uT.value = S.smallOut;
      const wu = winds.material.uniforms;
      winds.visible = S.surplus + S.windOut + S.windBack > 0.005;
      wu.uAmount.value = clamp01(S.surplus + S.windOut + S.windBack);
      if (S.windBack > 0.001) {
        wu.uColA.value.copy(VEI).multiplyScalar(0.12);
        wu.uColF.value.copy(SIG).multiplyScalar(1.4);
        wu.uColB.value.copy(SIG).multiplyScalar(0.75);
        wu.uT.value = S.windBack;
      } else {
        wu.uColA.value.copy(INK).multiplyScalar(0.55);
        wu.uColF.value.copy(VEI).multiplyScalar(1.4);
        wu.uColB.value.copy(VEI).multiplyScalar(0.12);
        wu.uT.value = S.windOut;
      }
      you.visible = S.you > 0.005;
      you.material.uniforms.uAmount.value = S.you;
      const lwHot = clamp01(S.lw) * clamp01(2 - S.lw) * net;
      lwGlow.visible = lwHot > 0.005;
      lwGlow.material.uniforms.uAmount.value = lwHot * 1.15;
      lwGlow.material.uniforms.uLift.value = lineY;

      /* the plants: every mark at the common rhythm, plus its plate's offset */
      const plantsOn = S.plants > 0.02;
      for (const r of rotorMeshes) {
        r.visible = plantsOn;
        r.position.y = LY.plants * e;
      }
      rotorMat.color.copy(ROTOR_C).multiplyScalar(0.3 + 0.7 * Math.min(1, f1));
      for (const k of KEYS) {
        const u = markMats[k].uniforms;
        u.uPx.value = px;
        u.uTime.value = time;
        u.uAngle.value = (ROTOR.spin * time + turn[k]) * DEG;
        u.uAmount.value = S.plants * f1 * (k === "west" ? 1 - 0.9 * S.whatif : 1);
        u.uReserve.value = k === "west" ? S.reserve : 0;
      }
      for (const p of pulses) {
        p.m.visible = S.pulse > 0.005;
        const beat = (ROTOR.spin * time + turn[p.plate]) / 360;
        p.mat.uniforms.uBeat.value = beat - Math.floor(beat);
        p.mat.uniforms.uAmount.value = S.pulse;
      }

      /* the split: signal light from under the joint; veille when the plates meet again */
      const crk = clamp01(S.crack);
      const weld = clamp01(S.weld);
      crackColor.setRGB(SIG.r * crk * 1.5 + VEI.r * weld * 1.3, SIG.g * crk * 1.5 + VEI.g * weld * 1.3, SIG.b * crk * 1.5 + VEI.b * weld * 1.3);
      const crackOn = crk + weld > 0.003;
      crackWallMat.emissive.setRGB(SIG.r * crk * 0.5 + VEI.r * weld * 0.4, SIG.g * crk * 0.5 + VEI.g * weld * 0.4, SIG.b * crk * 0.5 + VEI.b * weld * 0.4);
      hairMat.uniforms.uReveal.value = weld > 0.01 ? 2 : crk * 1.02;
      hairMat.uniforms.uHead.value = crk < 0.98 && weld < 0.01 ? crk : -1;
      hairMat.uniforms.uAmount.value = crackOn ? 1 : 0;
      for (const c of cracks) {
        c.g.visible = crackOn;
        const ox = c.chain === "wne" ? dE[0] * aE : c.chain === "wse" ? dS[0] * aS : dE[0] * aE + dS[0] * aS;
        const oz = c.chain === "wne" ? dE[2] * aE : c.chain === "wse" ? dS[2] * aS : dE[2] * aE + dS[2] * aS;
        c.g.position.set(ox / 2, 0, oz / 2);
        const u = c.floorMat.uniforms;
        u.uW.value = 0.5 + 0.5 * (c.chain === "wne" ? gapE * aE : c.chain === "wse" ? gapS * aS : Math.hypot(ox, oz));
        u.uCrack.value = crk;
        u.uAll.value = weld;
        u.uAmount.value = 1.7;
        u.uTime.value = time;
      }
      curtainMat.uniforms.uCrack.value = crk;
      curtainMat.uniforms.uAll.value = weld;
      curtainMat.uniforms.uAmount.value = 0.4;
      hairMat.uniforms.uLift.value = -(SLAB - 0.6) * sm(0, 0.2, Math.max(aE, aS)); // once the plates part, the core of the light is on the table
      curtainMat.uniforms.uTime.value = time;

      /* the other paths */
      crack2Mat.uniforms.uAmount.value = S.crack2;
      const th = clamp01(S.thread);
      threadMat.uniforms.uAmount.value = th > 0.002 ? 1 : 0;
      threadMat.uniforms.uReveal.value = th * 1.02;
      threadMat.uniforms.uHead.value = th < 0.995 ? th : -1;
      threadMat.uniforms.uLift.value = LY.lines * e;
      shareMat.uniforms.uAmount.value = S.share > 0.002 ? 1 : 0;
      shareMat.uniforms.uReveal.value = S.share * 1.02;
      const ph = S.phone;
      phoneMat.uniforms.uAmount.value = ph > 0.002 && ph < 2.998 ? 1 : 0;
      phoneMat.uniforms.uHead.value = ph - Math.floor(ph);
      const hy = clamp01(S.hydro);
      const pu = clamp01(S.pumps) * (1 - hy);
      pipeMat.uniforms.uAmount.value = Math.max(pu * 0.8, hy);
      pipeMat.uniforms.uColor.value.copy(INK).lerp(VEI, hy).multiplyScalar(1.1);
      pipeMat.uniforms.uDashV.value = hy > 0.5 ? -2 : 2;
      lakeMat.color.copy(INK).multiplyScalar(0.14).lerp(VEI, hy * 0.7);
    },
  };
}
