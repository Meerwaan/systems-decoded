// DOSSIER L01 — the PIECES OF THE DOSSIER on the bench, and the LAB of 1903.
//
//   buildDossier() → { bench, lab, A, update(p, time, px) }
//     bench   a Group placed by world.js on the BENCH (origin = the bench's centre, y = 0 its top): the piece of the
//             dossier lying flat — 1 the patent (Brevet d'invention n° 405.881, 25 novembre 1909, É. Bénédictus:
//             "verre · celluloïd · verre"), 2 the page of UN Regulation No 43 (the marking: E, the country's number,
//             43R, the roman numerals I tempered · II laminated), 3 the stamp of a windshield's corner, enlarged
//             (an "E2" in its circle, "43R", an approval number, "II") — RECONSTRUCTIONS in our type, never a photo,
//             and each one says so in its corner ("RECONSTITUTION")
//     lab     a Group placed by world.js in the LAB place: Paris, November 1903 — a room 6 × 5 × 3.5 m seen like an
//             X-ray (walls, a high window and its cold light, shelves of flasks, his table and its retort, a
//             stepladder, an easel: he was a painter too), Édouard Bénédictus (kit/lib/figure.js, glass from head to
//             hands), and THE FLASK (≈ 1 litre, solid: the one solid thing of the room) on the top shelf
//     A       { flask, ben (his head), shelf, floor, doc, label } — anchors for chips and callouts
//   p = { place, doc, docIn, mark, flask, star, ben, labelOn }   (meanings: world.js · FIRST)
//     doc      which piece lies on the bench: 0 none · 1 patent · 2 R43 page · 3 the stamp (integer)
//     docIn    0 → 1 it slides in and lies down (its shadow tightens as it lands) · 1 → 2 its lines light up in
//              veille one after the other, as a highlighter would (patent: verre · celluloïd · verre; R43: the E and
//              the country · 43R and the approval number · the roman numerals)
//     mark     the stamp: 1 the circle and its E · 2 the "2" (France) · 3 "43R" · 4 "II" — the one named is lit, the rest ink
//     flask    0 on the top shelf · → 0.1 it tips off the edge · → 0.84 it falls 3.3 m, accelerating, tumbling over
//              more than a turn · → 1 one dull bounce, it lies on its side (it does not roll away)
//     star     0 → 1 white cracks spread from seven points over its whole wall — and it stays in one piece
//     ben      0 on the stepladder at the top shelf · → 0.55 down and turning · → 1 kneeling, his hand on the flask ·
//              → 1.45 up, the flask in his hand · → 2 standing, holding it up against the window's light
//     labelOn  his label on the flask: "Novembre 1903 · ce flacon est tombé de 3,5 mètres de haut" (his own words)
//
// The film of nitrocellulose inside the flask is a faint veille at its grazing edges: barely there, always — it was
// left by a solution dried long before; it is what holds the starred glass together.
import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { BRAND } from "@kit/brand.js";
import { rng } from "@kit/rng.js";
import { solid, lineMat, box, cyl, lathe, anchor } from "@kit/build3d.js";
import { makeFigure } from "@kit/figure.js";
import { makeContact, makeMotes } from "@kit/atmo.js";
import { xray } from "@kit/usine.js";
import { LAB, DOC } from "./plan.js";

const DEG = Math.PI / 180;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, u) => a + (b - a) * u;
const smooth = (a, b, x) => {
  const u = clamp01((x - a) / (b - a));
  return u * u * (3 - 2 * u);
};
const VEILLE = new THREE.Color(BRAND.veille);
const INK_HEX = "#e9e4d8";
const PRINT = "#16191c"; // printer's ink on paper
const FONT_D = "'Barlow Condensed', sans-serif";
const FONT_M = "'JetBrains Mono', monospace";

/* ═══════════════════════════════════ the pieces of the dossier ═══════════════════════════════════ */

const PX = 20; // canvas pixels per centimetre of paper

/** Text on a canvas: `size` in px; `track` letter spacing in px. */
function text(g, s, x, y, { font = FONT_D, size = 40, weight = 700, color = PRINT, align = "left", track = 0, base = "alphabetic" } = {}) {
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.textBaseline = base;
  g.letterSpacing = `${track}px`;
  g.fillText(s, x, y);
  const w = g.measureText(s).width;
  g.letterSpacing = "0px";
  return w;
}
/** Lines of "text" seen from afar: grey words of random lengths (nothing legible is made up). */
function filler(g, r, x, y, w, lines, { lh = 30, h = 9, color = "rgba(22,25,28,0.42)", last = 0.6 } = {}) {
  g.fillStyle = color;
  for (let i = 0; i < lines; i++) {
    const end = i === lines - 1 ? x + w * (last + 0.2 * r()) : x + w;
    let cx = x + (i === 0 ? 40 : 0);
    while (cx < end - 20) {
      const ww = Math.min(end - cx, 22 + r() * 90);
      g.beginPath();
      g.roundRect(cx, y + i * lh - h, ww, h, h / 2);
      g.fill();
      cx += ww + 9 + r() * 5;
    }
  }
}
/** Old paper: an ink tone, darker toward its edges, fibres, a few foxing spots. */
function paper(g, W, H, seed) {
  const r = rng(seed);
  g.fillStyle = "#ddd5c2";
  g.fillRect(0, 0, W, H);
  const v = g.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, "rgba(255,250,235,0.10)");
  v.addColorStop(1, "rgba(120,96,60,0.30)");
  g.fillStyle = v;
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {
    g.strokeStyle = `rgba(${90 + r() * 40},${80 + r() * 30},${60 + r() * 20},${0.035 + r() * 0.05})`;
    g.lineWidth = 1 + r();
    const x = r() * W;
    const y = r() * H;
    const a = r() * Math.PI;
    const l = 4 + r() * 16;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  for (let i = 0; i < 9; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 10 + r() * 50;
    const f = g.createRadialGradient(x, y, 0, x, y, rad);
    f.addColorStop(0, "rgba(140,100,55,0.10)");
    f.addColorStop(1, "rgba(140,100,55,0)");
    g.fillStyle = f;
    g.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }
  // the edge of the sheet, a little worn
  g.strokeStyle = "rgba(110,90,60,0.35)";
  g.lineWidth = 4;
  g.strokeRect(2, 2, W - 4, H - 4);
}
/** A highlight region on the mask: id (0–7) in red, coverage in green, the stroke's progress left → right in blue. */
function region(m, id, x, y, w, h) {
  const gr = m.createLinearGradient(x, 0, x + w, 0);
  const R = (id + 1) * 20;
  gr.addColorStop(0, `rgb(${R},255,0)`);
  gr.addColorStop(1, `rgb(${R},255,255)`);
  m.fillStyle = gr;
  m.beginPath();
  m.roundRect(x, y, w, h, h * 0.25);
  m.fill();
}
function corner(g, W, H, dark = false) {
  text(g, "RECONSTITUTION", W - 36, H - 32, { font: FONT_M, size: 22, weight: 500, color: dark ? "rgba(233,228,216,0.45)" : "rgba(22,25,28,0.5)", align: "right", track: 3 });
}

/* the three pieces: each draws its face and its mask; ids of the mask = the order they light up in */
function drawPatent(g, m, W, H) {
  paper(g, W, H, 1909);
  const r = rng(405);
  text(g, "RÉPUBLIQUE FRANÇAISE", W / 2, 92, { font: FONT_M, size: 26, weight: 500, align: "center", track: 6 });
  text(g, "OFFICE NATIONAL DE LA PROPRIÉTÉ INDUSTRIELLE", W / 2, 132, { font: FONT_M, size: 20, weight: 400, align: "center", track: 3, color: "rgba(22,25,28,0.75)" });
  text(g, "BREVET D'INVENTION", W / 2, 268, { size: 128, weight: 800, align: "center", track: 2 });
  g.fillStyle = PRINT;
  g.fillRect(90, 302, W - 180, 5);
  text(g, "N° 405.881", 90, 400, { font: FONT_M, size: 66, weight: 700 });
  text(g, "25 NOVEMBRE 1909", W - 90, 398, { size: 64, weight: 700, align: "right", track: 1 });
  text(g, "ÉDOUARD BÉNÉDICTUS", 90, 492, { size: 72, weight: 700, track: 1 });
  filler(g, r, 90, 566, W - 180, 3, { lh: 34 });
  // the drawing: a section of the glass — verre · celluloïd · verre
  const fx = 140;
  const fw = 500;
  const y0 = 790;
  g.strokeStyle = "rgba(22,25,28,0.6)";
  g.lineWidth = 3;
  g.strokeRect(100, 690, W - 200, 470);
  text(g, "FIG. 1", 130, 736, { font: FONT_M, size: 26, weight: 500, track: 3 });
  const layer = (y, h, fill, hatch) => {
    g.fillStyle = fill;
    g.fillRect(fx, y, fw, h);
    g.strokeStyle = PRINT;
    g.lineWidth = 4;
    g.strokeRect(fx, y, fw, h);
    if (hatch) {
      g.save();
      g.beginPath();
      g.rect(fx, y, fw, h);
      g.clip();
      g.lineWidth = 2;
      g.strokeStyle = "rgba(22,25,28,0.55)";
      for (let x = fx - h; x < fx + fw; x += 16) {
        g.beginPath();
        g.moveTo(x, y + h);
        g.lineTo(x + h, y);
        g.stroke();
      }
      g.restore();
    }
  };
  const GL = 92;
  const GAP = 30;
  const CE = 46;
  layer(y0, GL, "#cfc7b3", true);
  layer(y0 + GL + GAP, CE, "#3fbf86", false); // the celluloid: veille, printed
  layer(y0 + GL + GAP + CE + GAP, GL, "#cfc7b3", true);
  // the labels and their leaders
  const labels = [["verre", y0 + GL / 2], ["celluloïd", y0 + GL + GAP + CE / 2], ["verre", y0 + GL + GAP + CE + GAP + GL / 2]];
  labels.forEach(([s, y], i) => {
    g.strokeStyle = PRINT;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(fx + fw + 6, y);
    g.lineTo(fx + fw + 70, y);
    g.stroke();
    const w = text(g, s, fx + fw + 86, y + 28, { size: 84, weight: 700 });
    region(m, i, fx - 14, y - (i === 1 ? 40 : 58), fw + 86 + w + 28 + 14, i === 1 ? 80 : 116);
  });
  filler(g, r, 90, 1240, W - 180, 9, { lh: 34 });
  text(g, "— 1 —", W / 2, H - 70, { font: FONT_M, size: 22, weight: 500, align: "center", color: "rgba(22,25,28,0.6)" });
  corner(g, W, H);
}

function drawR43(g, m, W, H) {
  paper(g, W, H, 43);
  const r = rng(4343);
  text(g, "NATIONS UNIES · ACCORD DE 1958", 90, 100, { font: FONT_M, size: 24, weight: 500, track: 3 });
  text(g, "RÈGLEMENT ONU N° 43", 90, 222, { size: 112, weight: 800, track: 1 });
  text(g, "Prescriptions uniformes relatives à l'homologation", 90, 284, { size: 42, weight: 500, color: "rgba(22,25,28,0.85)" });
  text(g, "des vitrages de sécurité", 90, 332, { size: 42, weight: 500, color: "rgba(22,25,28,0.85)" });
  g.fillStyle = PRINT;
  g.fillRect(90, 368, W - 180, 4);
  filler(g, r, 90, 436, W - 180, 4, { lh: 32 });
  text(g, "5.  MARQUAGE", 90, 640, { size: 72, weight: 700, track: 1 });
  // 5.4: the circle, its E, the country
  let y = 800;
  text(g, "5.4", 90, y, { font: FONT_M, size: 34, weight: 700 });
  g.strokeStyle = PRINT;
  g.lineWidth = 6;
  g.beginPath();
  g.arc(256, y - 22, 50, 0, 2 * Math.PI);
  g.stroke();
  text(g, "E2", 256, y, { size: 64, weight: 800, align: "center" });
  let w = text(g, "un cercle, la lettre E et le", 330, y - 36, { size: 56, weight: 600 });
  w = Math.max(w, text(g, "numéro du pays qui homologue", 330, y + 26, { size: 56, weight: 600 }));
  region(m, 0, 192, y - 96, w + 160, 150);
  // 5.5: 43R and the approval number
  y = 1000;
  text(g, "5.5", 90, y, { font: FONT_M, size: 34, weight: 700 });
  w = text(g, "43R", 200, y + 4, { size: 92, weight: 800 });
  const w2 = text(g, "+ numéro d'homologation", 200 + w + 26, y, { size: 56, weight: 600 });
  region(m, 1, 186, y - 82, w + w2 + 64, 112);
  // the symbols
  y = 1170;
  text(g, "5.5.1", 90, y, { font: FONT_M, size: 34, weight: 700 });
  const symbols = [["I", "trempé"], ["II", "feuilleté"]];
  let x = 250;
  const x0 = x;
  for (const [n, s] of symbols) {
    x += text(g, n, x, y + 4, { size: 92, weight: 800 }) + 18;
    x += text(g, s, x, y, { size: 60, weight: 600 }) + 60;
  }
  region(m, 2, x0 - 18, y - 84, x - x0 - 24, 112);
  filler(g, r, 90, 1300, W - 180, 7, { lh: 32 });
  text(g, "E/ECE/TRANS/505 · R43", 90, H - 70, { font: FONT_M, size: 20, weight: 500, color: "rgba(22,25,28,0.55)", track: 2 });
  corner(g, W, H);
}

function drawStamp(g, m, W, H) {
  // the corner of a windshield, enlarged: dark glass, the black band's dots fading along its top, the marking in ink
  g.fillStyle = "#1a1f23";
  g.fillRect(0, 0, W, H);
  const gl = g.createLinearGradient(0, 0, W, H);
  gl.addColorStop(0, "rgba(233,228,216,0.05)");
  gl.addColorStop(0.5, "rgba(233,228,216,0)");
  gl.addColorStop(1, "rgba(233,228,216,0.03)");
  g.fillStyle = gl;
  g.fillRect(0, 0, W, H);
  // the black enamel band along the top and its dots, smaller and smaller toward the clear glass
  g.fillStyle = "#07090b";
  g.fillRect(0, 0, W, 120);
  const pitch = 34;
  for (let row = 0; row < 5; row++) {
    const rr = (pitch / 2) * (1 - row / 5) * 0.95;
    for (let x = (row % 2) * pitch * 0.5; x < W + pitch; x += pitch) {
      g.beginPath();
      g.arc(x, 120 + pitch * 0.5 + row * pitch * 0.86, Math.max(1.5, rr), 0, 2 * Math.PI);
      g.fill();
    }
  }
  const C = INK_HEX;
  // 1 the circle and its E · 2 the "2"
  const cx = 280;
  const cy = 520;
  g.strokeStyle = C;
  g.lineWidth = 16;
  g.beginPath();
  g.arc(cx, cy, 170, 0, 2 * Math.PI);
  g.stroke();
  text(g, "E", cx - 50, cy + 82, { size: 250, weight: 800, color: C, align: "center" });
  region(m, 0, cx - 196, cy - 196, 300, 392);
  text(g, "2", cx + 74, cy + 82, { size: 250, weight: 800, color: C, align: "center" });
  region(m, 1, cx + 6, cy - 120, 140, 240);
  // 3 "43R" · its approval number (ink, never lit)
  const w = text(g, "43R", 500, 590, { size: 230, weight: 800, color: C });
  region(m, 2, 486, 400, w + 30, 220);
  text(g, "– 001234", 506, 690, { font: FONT_M, size: 74, weight: 700, color: C, track: 2 });
  // 4 the roman numeral
  text(g, "II", 300, 1010, { size: 300, weight: 800, color: C, align: "center" });
  region(m, 3, 190, 760, 220, 290);
  text(g, "FEUILLETÉ", 470, 940, { size: 96, weight: 700, color: "rgba(233,228,216,0.82)", track: 3 });
  corner(g, W, H, true);
}

/** A sheet lying flat: its face (canvas), its highlight mask, a gentle curl, its shadow. */
function makePiece(wcm, hcm, draw, { dark = false, thick = 0 } = {}) {
  const W = Math.round(wcm * PX);
  const H = Math.round(hcm * PX);
  const face = document.createElement("canvas");
  face.width = W;
  face.height = H;
  const mask = document.createElement("canvas");
  mask.width = W;
  mask.height = H;
  const tex = new THREE.CanvasTexture(face);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mtex = new THREE.CanvasTexture(mask);
  mtex.generateMipmaps = false;
  mtex.minFilter = THREE.LinearFilter;
  const paint = () => {
    const g = face.getContext("2d");
    const m = mask.getContext("2d");
    g.clearRect(0, 0, W, H);
    m.fillStyle = "#000";
    m.fillRect(0, 0, W, H);
    draw(g, m, W, H);
    tex.needsUpdate = true;
    mtex.needsUpdate = true;
  };
  paint();

  const U = { uMask: { value: mtex }, uF: { value: new Array(8).fill(0) }, uK: { value: new Array(8).fill(1) }, uVeille: { value: VEILLE.clone() }, uGlow: { value: dark ? 1.25 : 0.22 }, uTint: { value: dark ? 1 : 0 } };
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: dark ? 0.16 : 0.92, metalness: 0, envMapIntensity: dark ? 1.1 : 0.55, side: THREE.DoubleSide });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uMask; uniform float uF[8]; uniform float uK[8]; uniform vec3 uVeille; uniform float uGlow, uTint;")
      .replace(
        "#include <map_fragment>",
        /* glsl */ `#include <map_fragment>
        vec3 hiMask = texture2D(uMask, vMapUv).rgb;
        int hiId = int(floor(hiMask.r * 255.0 / 20.0 + 0.5)) - 1;
        float hiA = 0.0;
        if (hiId >= 0 && hiId < 8) {
          float f = uF[hiId];
          hiA = clamp((f * 1.12 - hiMask.b) * 22.0 + 0.5, 0.0, 1.0) * clamp(hiMask.g, 0.0, 1.0) * step(0.001, f) * uK[hiId];
        }
        float hiL = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
        // on paper: a highlighter (the paper turns veille, the ink stays black) · on the dark plate: the printed ink turns veille
        vec3 hiTo = mix(diffuseColor.rgb * vec3(0.42, 1.0, 0.70), uVeille * hiL * 1.15, uTint);
        diffuseColor.rgb = mix(diffuseColor.rgb, hiTo, hiA);`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        totalEmissiveRadiance += uVeille * hiA * uGlow * hiL;`,
      );
  };
  // the sheet, bent a little: the corners lift, a soft wave across
  const geo = new THREE.PlaneGeometry(wcm, hcm, 30, 42).rotateX(-Math.PI / 2);
  if (!thick) {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = (2 * p.getX(i)) / wcm;
      const v = (2 * p.getZ(i)) / hcm;
      const c = 0.5 * (u ** 4 + v ** 4);
      p.setY(i, 0.9 * c ** 1.5 + 0.22 * Math.sin(v * 2.6 + 0.8) * (1 - 0.6 * u * u) + 0.12 * Math.sin(u * 3.1));
    }
    geo.computeVertexNormals();
  }
  const sheet = new THREE.Mesh(geo, mat);
  sheet.castShadow = true;
  sheet.receiveShadow = true;
  const group = new THREE.Group();
  group.add(sheet);
  if (thick) {
    // a plate of glass: a body with broken edges, its face printed on top
    const body = solid(0x0d1114, { rough: 0.12, env: 1.2, coat: 1 });
    const slab = new THREE.Mesh(box(wcm, thick, hcm, 0.35), body);
    slab.position.y = -thick / 2;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);
    const edges = new LineSegments2(new LineSegmentsGeometry().fromEdgesGeometry(new THREE.EdgesGeometry(slab.geometry.userData.edges ?? slab.geometry, 28)), lineMat(BRAND.ink, 1.8, { opacity: 0.45 }));
    edges.renderOrder = 2;
    slab.add(edges);
    sheet.position.y = 0.04;
    group.userData.mats = [mat, body, edges.material];
  }
  const shadow = makeContact({ amount: 0 });
  shadow.scale.set(wcm * 1.18, hcm * 1.14, 1);
  shadow.position.y = 0.05;
  return { group, sheet, mat, U, shadow, paint, w: wcm, h: hcm, n: 0 };
}

/* ═══════════════════════════════════ the lab, 1903 ═══════════════════════════════════ */

const PROP = { rim: 0.16, edge: 0.3, width: 1.8, opacity: 0.38 };

/** Segments on the floor: a grid of 50 cm (an X-ray room has no solid floor). */
function floorGrid(half, depth, cell, opacity) {
  const pts = [];
  for (let x = -half; x <= half + 0.1; x += cell) pts.push(x, 0.3, -depth, x, 0.3, depth);
  for (let z = -depth; z <= depth + 0.1; z += cell) pts.push(-half, 0.3, z, half, 0.3, z);
  const g = new LineSegmentsGeometry();
  g.setPositions(pts);
  const l = new LineSegments2(g, lineMat(BRAND.ink, 1.8, { opacity }));
  l.renderOrder = 2;
  return l;
}
function lines(segs, width = 1.9, opacity = 0.7) {
  const g = new LineSegmentsGeometry();
  g.setPositions(segs.flat(2));
  const l = new LineSegments2(g, lineMat(BRAND.ink, width, { opacity }));
  l.renderOrder = 2;
  return l;
}

// bottles, in X-ray: profiles [radius, height] around their axis
const BOTTLES = [
  [[0.1, 0], [5, 0], [5.4, 0.6], [5.4, 13], [4.2, 15.5], [1.8, 17], [1.8, 20], [2.2, 20.5], [2.2, 21.5], [0.1, 21.5]], // a bottle
  [[0.1, 0], [7.5, 0], [7.8, 1], [3.4, 14], [1.6, 15], [1.6, 21], [2, 21.6], [0.1, 21.6]], // a conical flask
  [[0.1, 0], [4.6, 0], [4.8, 0.6], [4.8, 10], [4.2, 11], [4.4, 11.5], [4.4, 13], [0.1, 13]], // a jar
  [[0.1, 0], [3, 0.4], [6.5, 3.5], [7.4, 8], [6.5, 12.5], [2, 15.5], [1.6, 16], [1.6, 23], [2, 23.5], [0.1, 23.5]], // a round flask
  [[0.1, 0], [3.2, 0], [3.4, 0.4], [3.4, 15], [2.4, 17], [1.2, 18], [1.2, 21], [0.1, 21]], // a phial
];
// THE flask: ≈ 1 litre, a round-shouldered bottle (plan.js · LAB.flask: r 6.5, h 21)
const FL = LAB.flask;
const FLASK = [[0.01, 0], [FL.r - 1, 0], [FL.r - 0.2, 0.5], [FL.r, 1.6], [FL.r, 12.6], [FL.r - 0.6, 14.4], [FL.r - 2.4, 16.4], [2.3, 17.4], [2.1, 19], [2.6, 19.4], [2.7, 20.4], [2.4, FL.h], [1.7, FL.h], [1.7, 19.8], [0.01, 19.8]];
const MID = FL.h / 2; // the flask turns around its middle

/** The flask's glass: lit and solid, with its starred cracks (white, drawn in the wall) and the faint veille of its film. */
function flaskGlass() {
  const mat = solid(0x9aa3a1, { rough: 0.06, metal: 0.1, env: 2, coat: 1, coatRough: 0.04 });
  // seven stars over the wall: [arc length around (cm), height, reach (cm), seed]
  const stars = [[2, 7, 9, 0.1], [13, 4, 7, 0.7], [-10, 10, 8.5, 0.35], [24, 9, 7.5, 0.9], [-21, 3.5, 6.5, 0.55], [6, 13.2, 6, 0.25], [-3, 1.8, 5, 0.8]];
  const U = { uStar: { value: 0 }, uFilm: { value: 1 }, uVeille: { value: VEILLE.clone() }, uStars: { value: stars.map((s) => new THREE.Vector4(...s)) } };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vObj;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvObj = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObj; uniform float uStar, uFilm; uniform vec3 uVeille; uniform vec4 uStars[7];")
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        {

          const float CIRC = ${(2 * Math.PI * FL.r).toFixed(3)};
          float s = atan(vObj.z, vObj.x) / PI2 * CIRC;
          vec2 q = vec2(s, vObj.y);
          float crack = 0.0;
          for (int i = 0; i < 7; i++) {
            vec4 st = uStars[i];
            vec2 d = vec2(mod(q.x - st.x + 0.5 * CIRC, CIRC) - 0.5 * CIRC, q.y - st.y);
            float r = length(d);
            float reach = st.z * smoothstep(0.0, 1.0, clamp(uStar * 1.25 - st.w * 0.25, 0.0, 1.0));
            if (r > reach + 0.3 || reach < 0.05) continue;
            float a = atan(d.y, d.x) / PI2 * 9.0 + st.w * 7.0 + 0.12 * sin(r * 1.9 + st.w * 20.0);
            float spoke = abs(fract(a) - 0.5);
            float dist = (0.5 - spoke) * (PI2 / 9.0) * r; // across the nearest spoke, cm
            float fw = max(fwidth(dist), 1e-4);
            float w = max(0.05, 0.9 * fw);
            float line = 1.0 - smoothstep(w - fw, w + fw, dist);
            // some spokes are short: the star is not a wheel
            float k = fract(sin(floor(a) * 12.9898 + st.w * 78.233) * 43758.5453);
            line *= 1.0 - smoothstep(reach * (0.45 + 0.55 * k) - 0.3, reach * (0.45 + 0.55 * k), r);
            // two rings, broken between spokes
            for (int j = 1; j <= 2; j++) {
              float rr = reach * (0.32 + 0.3 * float(j));
              float dr = abs(r - rr);
              float fr = max(fwidth(dr), 1e-4);
              float wr = max(0.04, 0.9 * fr);
              float ring = (1.0 - smoothstep(wr - fr, wr + fr, dr)) * step(0.45, fract(k * 7.0 + float(j) * 0.37 + a * 0.5));
              line = max(line, ring * step(rr, reach));
            }
            crack = max(crack, line);
          }
          crack *= smoothstep(0.0, 0.08, uStar);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.85), crack * 0.6);
          totalEmissiveRadiance += vec3(0.92, 0.9, 0.85) * crack * 0.9;
          // the film inside: barely, at the grazing edges
          vec3 nv = normalize(vViewPosition);
          float fres = pow(clamp(1.0 - abs(dot(normal, nv)), 0.0, 1.0), 3.0);
          totalEmissiveRadiance += uVeille * fres * 0.07 * uFilm;
        }`,
      );
  };
  mat.userData.U = U;
  return mat;
}

/** The label he stuck on it (his own words, in our type). */
function makeLabel() {
  const c = document.createElement("canvas");
  c.width = 640;
  c.height = 300;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const paint = () => {
    const g = c.getContext("2d");
    paper(g, c.width, c.height, 1903);
    text(g, "Novembre 1903", c.width / 2, 120, { size: 96, weight: 700, align: "center" });
    text(g, "ce flacon est tombé", c.width / 2, 196, { size: 54, weight: 500, align: "center", color: "rgba(22,25,28,0.88)" });
    text(g, "de 3,5 mètres de haut", c.width / 2, 254, { size: 54, weight: 500, align: "center", color: "rgba(22,25,28,0.88)" });
    tex.needsUpdate = true;
  };
  paint();
  const span = 118 * DEG;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, transparent: true, opacity: 0, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(FL.r + 0.06, FL.r + 0.06, 5.6, 32, 1, true, -span / 2, span), mat);
  mesh.position.y = 7.2;
  return { mesh, mat, paint };
}

/* Bénédictus' poses: keys along `ben` (0 → 2). In each: where he stands (pos, yaw: 0 faces +z), how low (drop:
   kneeling), how far he leans; his feet (in his own frame), his left hand (WORLD), his right hand: a bar it holds
   (WORLD: point, axis, closure, radius) — or "flask": it holds the flask, wherever the flask is. */
const SHELF_TOP = LAB.shelf[1];
const LADDER = { x: LAB.shelf[0] - 55, z: LAB.shelf[2] + 33, top: 160 };
const FLOOR_AT = V(LAB.floor[0], 0, LAB.floor[2]);
const KEYS = [
  {
    at: 0, pos: [LADDER.x, LADDER.top, LADDER.z], yaw: 180, drop: 0, lean: 7, turn: -14,
    feet: [[8.6, 8, 0], [-8.6, 8, 0]],
    left: [LAB.shelf[0] - 92, SHELF_TOP - 22, LAB.shelf[2] + 14],
    right: { pt: [LAB.shelf[0] - 7, SHELF_TOP + 9, LAB.shelf[2] + 7], axis: [0, 1, 0], k: 0.4, bar: 4.5 },
  },
  {
    at: 0.55, pos: [LADDER.x + 25, 0, LADDER.z + 45], yaw: 150, drop: 0, lean: 2, turn: 0, walk: 2,
    feet: [[8.6, 8, 0], [-8.6, 8, 0]],
    left: "hang", right: "hang",
  },
  {
    at: 1, pos: [FLOOR_AT.x + 12, 0, FLOOR_AT.z - 47], yaw: 0, drop: 47, lean: 58, turn: 0, walk: 2,
    feet: [[9.5, 52, -38], [-9.5, 52, -40]],
    left: "knee", right: "flask",
  },
  {
    at: 1.45, pos: [FLOOR_AT.x + 40, 0, FLOOR_AT.z + 15], yaw: 120, drop: 0, lean: 3, turn: 0,
    feet: [[8.6, 8, 2], [-8.6, 8, -2]],
    left: "hang", right: "flask",
  },
  {
    at: 2, pos: [LAB.ben[0], 0, LAB.ben[2]], yaw: 180, drop: 0, lean: -5, turn: 0, walk: 2,
    feet: [[9, 8, 3], [-9, 8, -3]],
    left: "hang", right: "flask",
  },
];
// where the flask is held, in his frame (at the keys that hold it): ben 1.45 at his chest, ben 2 up against the light
const HELD = { 1.45: { at: [-12, 122, 30], axis: [0, 1, 0] }, 2: { at: [-8, 184, 36], axis: [0.1, 1, 0.12] } };

export function buildDossier() {
  /* ── the bench pieces ── */
  const bench = new THREE.Group();
  const pieces = [null, makePiece(DOC.w, DOC.h, drawPatent), makePiece(DOC.w, DOC.h, drawR43), makePiece(DOC.mark, DOC.mark, drawStamp, { dark: true, thick: 1.4 })];
  pieces[1].n = 3;
  pieces[2].n = 3;
  pieces[3].n = 4;
  const docRoot = new THREE.Group();
  docRoot.position.set(0, 0.6, 0);
  bench.add(docRoot);
  for (const pc of pieces) {
    if (!pc) continue;
    pc.group.visible = false;
    pc.shadow.visible = false;
    docRoot.add(pc.group, pc.shadow);
  }

  /* ── the lab, 1903 ── */
  const lab = new THREE.Group();
  const r = rng(1903);
  const { half: HX, depth: DZ, h: RH } = LAB;
  // the room: three walls of glass, a grid on the floor, the skirting
  // the room: its edges only (a wall of glass seen at a grazing angle is a white slab), a grid on the floor
  lab.add(
    lines(
      [
        [[-HX, 0, -DZ], [HX, 0, -DZ]], [[-HX, RH, -DZ], [HX, RH, -DZ]], [[-HX, 0, -DZ], [-HX, RH, -DZ]], [[HX, 0, -DZ], [HX, RH, -DZ]],
        [[-HX, RH, -DZ], [-HX, RH, DZ]], [[HX, RH, -DZ], [HX, RH, DZ]], [[-HX, 0, -DZ], [-HX, 0, DZ]], [[HX, 0, -DZ], [HX, 0, DZ]],
      ],
      2,
      0.55,
    ),
  );
  lab.add(floorGrid(HX, DZ, 50, 0.13));
  const WIN = { x0: 30, x1: 190, y0: 196, y1: 322 };
  lab.add(
    lines(
      [
        // skirting and the cornice
        [[-HX, 14, -DZ + 0.5], [HX, 14, -DZ + 0.5]], [[-HX + 0.5, 14, -DZ], [-HX + 0.5, 14, DZ]], [[HX - 0.5, 14, -DZ], [HX - 0.5, 14, DZ]],
        [[-HX, RH - 12, -DZ + 0.5], [HX, RH - 12, -DZ + 0.5]],
        // the door, on the left wall
        [[-HX + 0.5, 0, 60], [-HX + 0.5, 215, 60]], [[-HX + 0.5, 215, 60], [-HX + 0.5, 215, 150]], [[-HX + 0.5, 215, 150], [-HX + 0.5, 0, 150]], [[-HX + 1, 100, 136], [-HX + 1, 106, 136]],
      ],
      1.9,
      0.5,
    ),
  );
  // the high window: its frame, its small panes, the cold light of outside in them
  const winSegs = [];
  const wz = -DZ + 0.8;
  for (const x of [WIN.x0, (2 * WIN.x0 + WIN.x1) / 3, (WIN.x0 + 2 * WIN.x1) / 3, WIN.x1]) winSegs.push([[x, WIN.y0, wz], [x, WIN.y1, wz]]);
  for (const y of [WIN.y0, (WIN.y0 + WIN.y1) / 2, WIN.y1]) winSegs.push([[WIN.x0, y, wz], [WIN.x1, y, wz]]);
  winSegs.push([[WIN.x0 - 6, WIN.y0 - 4, wz + 6], [WIN.x1 + 6, WIN.y0 - 4, wz + 6]]); // the sill
  lab.add(lines(winSegs, 2.4, 0.85));
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uAmount: { value: 1 } },
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uAmount; varying vec2 vUv;
        void main() {
          // a grey winter sky: brighter high up, a soft border inside the frame
          float e = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x) * smoothstep(0.0, 0.08, vUv.y) * smoothstep(0.0, 0.08, 1.0 - vUv.y);
          float k = (0.32 + 0.3 * vUv.y) * e * uAmount;
          gl_FragColor = vec4(vec3(0.91, 0.89, 0.85) * k, 1.0);
        }`,
    }),
  );
  sky.position.set((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -DZ + 0.4);
  lab.add(sky);
  // its light, falling into the room: a long soft shaft, and a pool on the floor
  const shaftGeo = new THREE.BufferGeometry();
  {
    const dir = V(-0.32, -0.78, 1).normalize(); // down into the room, a little to the left
    const L = (WIN.y0 + 40) / -dir.y;
    const c = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
    const pos = [];
    const t = [];
    for (const [x, y] of c) {
      pos.push(x, y, -DZ + 1);
      t.push(0);
    }
    for (const [x, y] of c) {
      pos.push(x + dir.x * L, y + dir.y * L, -DZ + 1 + dir.z * L);
      t.push(1);
    }
    shaftGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    shaftGeo.setAttribute("aT", new THREE.Float32BufferAttribute(t, 1));
    shaftGeo.setIndex([0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7]);
    shaftGeo.computeVertexNormals();
  }
  const shaft = new THREE.Mesh(
    shaftGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      uniforms: { uAmount: { value: 1 } },
      vertexShader: /* glsl */ `attribute float aT; varying float vT; varying vec3 vN; varying vec3 vV;
        void main(){ vT = aT; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: /* glsl */ `
        uniform float uAmount; varying float vT; varying vec3 vN; varying vec3 vV;
        void main() {
          // brightest where it is seen through its depth (faces turned toward the eye), fading along its fall
          float face = clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0);
          float k = 0.05 * pow(clamp(1.0 - vT, 0.0, 1.0), 1.4) * (0.35 + 0.65 * face) * uAmount;
          gl_FragColor = vec4(vec3(0.9, 0.89, 0.86) * k, 1.0);
        }`,
    }),
  );
  lab.add(shaft);
  const sun = new THREE.DirectionalLight(0xe9e4d8, 1.3);
  sun.position.set((WIN.x0 + WIN.x1) / 2, WIN.y1, -DZ + 10);
  sun.target.position.set(-40, 0, 80);
  lab.add(sun, sun.target);
  const motes = makeMotes({ count: 220, seed: 31, min: [WIN.x0 - 120, 20, -DZ + 10], size: [260, 300, 260], psize: [0.25, 0.7], color: BRAND.ink, drift: [0.4, -0.6, 0.3] });
  motes.uniforms.uAmount.value = 0.35;
  lab.add(motes.points);

  // the shelves on the back wall, left of the window: two uprights, five planks, bottles
  const SH = { x0: -292, x1: -18, z: LAB.shelf[2], d: 30, ys: [62, 130, 198, 265, SHELF_TOP] };
  const props = [];
  const prop = (geo, pos, o = PROP) => {
    const m = xray(geo, o);
    m.position.set(...pos);
    lab.add(m);
    props.push(m);
    return m;
  };
  for (const x of [SH.x0, SH.x1]) prop(box(4, SHELF_TOP + 6, SH.d, 0.4), [x, (SHELF_TOP + 6) / 2, SH.z]);
  for (const y of SH.ys) prop(box(SH.x1 - SH.x0 + 4, 3, SH.d, 0.4), [(SH.x0 + SH.x1) / 2, y - 1.5, SH.z]);
  const bottleGeos = BOTTLES.map((p) => lathe(p, 28));
  for (const y of SH.ys) {
    let x = SH.x0 + 12;
    while (x < SH.x1 - 12) {
      const k = Math.floor(r() * BOTTLES.length);
      const s = 0.8 + 0.5 * r();
      const rad = Math.max(...BOTTLES[k].map((q) => q[0])) * s;
      x += rad;
      // leave the flask's place free, and a little air around it
      if (y === SHELF_TOP && Math.abs(x - LAB.shelf[0]) < FL.r + rad + 6) {
        x += FL.r + 2 * rad + 8;
        continue;
      }
      if (x > SH.x1 - 10) break;
      const b = prop(bottleGeos[k], [x, y, SH.z + (r() - 0.5) * 8]);
      b.scale.setScalar(s);
      x += rad + 9 + r() * 16;
    }
  }
  // the stepladder he stands on
  {
    const L = LADDER;
    const front = (y) => L.z + 4 + (1 - y / L.top) * 34; // the front leans out toward the room
    const back = (y) => L.z - 6 - (1 - y / L.top) * 26;
    const segs = [];
    for (const s of [-1, 1]) {
      const x = L.x + s * 22;
      segs.push([[x, 0, front(0)], [x, L.top, front(L.top)]], [[x, 0, back(0)], [x, L.top + 4, back(L.top)]]);
    }
    lab.add(lines(segs, 2.4, 0.75));
    for (const y of [40, 80, 120, L.top]) prop(box(46, 2.5, y === L.top ? 26 : 13, 0.4), [L.x, y - 1.25, y === L.top ? (front(y) + back(y)) / 2 : front(y) - 3]);
  }
  // his table, its retort and its burner, a rack of tubes, a stool
  {
    const [tx, , tz] = LAB.table;
    prop(box(160, 4, 70, 0.6), [tx, 88, tz]);
    for (const [dx, dz] of [[-74, -30], [74, -30], [-74, 30], [74, 30]]) prop(box(4, 86, 4, 0.4), [tx + dx, 43, tz + dz]);
    // the retort: a bulb and its long bent neck
    const bulb = prop(new THREE.SphereGeometry(10, 28, 18), [tx - 30, 90 + 16, tz - 8]);
    bulb.scale.set(1, 0.92, 1);
    const neck = new THREE.CatmullRomCurve3([V(tx - 30, 116, tz - 8), V(tx - 24, 128, tz - 8), V(tx - 6, 124, tz - 6), V(tx + 22, 108, tz - 4)]);
    prop(new THREE.TubeGeometry(neck, 32, 1.7, 12), [0, 0, 0]);
    prop(cyl(5, 9, 0.3, 24), [tx - 30, 90 + 4.5, tz - 8]); // its stand
    prop(cyl(2.4, 12, 0.2, 20), [tx + 26, 90 + 6, tz - 2]); // the flask that receives
    // the rack of tubes
    prop(box(30, 2, 8, 0.3), [tx + 50, 100, tz + 16]);
    for (let i = 0; i < 6; i++) prop(cyl(1.2, 14, 0.2, 14), [tx + 39 + i * 4.4, 98, tz + 16]);
    // the stool
    prop(cyl(16, 3, 0.4, 28), [tx - 10, 62, tz + 70]);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * 2 * Math.PI;
      const leg = prop(cyl(1.4, 62, 0.2, 10), [tx - 10 + Math.cos(a) * 10, 31, tz + 70 + Math.sin(a) * 10]);
      leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12);
    }
  }
  // the easel: he was a painter too
  {
    const ex = 232;
    const ez = 40;
    const segs = [
      [[ex - 26, 0, ez + 14], [ex - 4, 190, ez]], [[ex + 26, 0, ez + 14], [ex + 4, 190, ez]], [[ex, 0, ez - 34], [ex, 176, ez - 2]],
      [[ex - 30, 92, ez + 9], [ex + 30, 92, ez + 9]],
    ];
    lab.add(lines(segs, 2.2, 0.6));
    const canvasBoard = prop(box(64, 52, 2, 0.3), [ex, 122, ez + 8]);
    canvasBoard.rotation.x = -8 * DEG;
  }

  /* Bénédictus */
  const ben = makeFigure({ shell: true, hands: "real", order: 12, glassK: 1.7, through: 0.2 });
  ben.ghost(true); // from close, he is glass from the head to the hands
  lab.add(ben.group);
  const benShadow = makeContact({ amount: 0.45 });
  benShadow.scale.set(70, 50, 1);
  lab.add(benShadow);

  /* THE flask */
  const flaskMat = flaskGlass();
  const flaskG = new THREE.Group(); // at the flask's middle
  const flaskMesh = new THREE.Mesh(lathe(FLASK, 64), flaskMat);
  flaskMesh.position.y = -MID;
  flaskMesh.castShadow = true;
  flaskG.add(flaskMesh);
  const label = makeLabel();
  label.mesh.position.y = 7.2 - MID;
  flaskG.add(label.mesh);
  lab.add(flaskG);
  const flaskShadow = makeContact({ amount: 0 });
  flaskShadow.scale.set(26, 20, 1);
  lab.add(flaskShadow);

  // the flask's fall: from the shelf to where it lands, tumbling about one axis, lying on its side at the end
  const SHELF_C = V(LAB.shelf[0], SHELF_TOP + MID, LAB.shelf[2]);
  const toward = V(FLOOR_AT.x - SHELF_C.x, 0, FLOOR_AT.z - SHELF_C.z).normalize();
  const TILT = Math.asin((FL.r - 2.7) / (FL.h - 6)); // lying, its lip touches the floor: the axis dips toward the neck
  const lieDir = toward.clone().multiplyScalar(Math.cos(TILT)).setY(-Math.sin(TILT)).normalize();
  const FALL_AXIS = V().crossVectors(V(0, 1, 0), lieDir).normalize();
  const FALL_TURN = V(0, 1, 0).angleTo(lieDir) + 2 * Math.PI; // more than a turn on the way down
  const LIE_C = FLOOR_AT.clone().setY(FL.r * Math.cos(TILT) + 0.1).addScaledVector(toward, 4); // lying (where it settles after its bounce)
  const EDGE = SHELF_C.clone().addScaledVector(toward, 8); // tipping over the plank's edge
  const qT = new THREE.Quaternion();
  const qW = new THREE.Quaternion();
  const pF = V();
  /** The flask's pose for `flask` k (not held). */
  function fallPose(k, pos, quat) {
    if (k <= 0.1) {
      const u = smooth(0, 0.1, k);
      pos.lerpVectors(SHELF_C, EDGE, u);
      pos.y -= 2 * u * u;
      quat.setFromAxisAngle(FALL_AXIS, 34 * DEG * u * u);
    } else if (k <= 0.84) {
      const t = (k - 0.1) / 0.74;
      pos.lerpVectors(EDGE, LIE_C, t);
      pos.y = mix(EDGE.y - 2, LIE_C.y, t * t); // free fall: the height goes with the square of the time
      quat.setFromAxisAngle(FALL_AXIS, mix(34 * DEG, FALL_TURN, t));
    } else {
      const u = (k - 0.84) / 0.16;
      const hop = 2.8 * Math.sin(Math.PI * clamp01(u / 0.5)) * (u < 0.5 ? 1 : 0); // one dull bounce
      pos.copy(LIE_C);
      pos.y += hop;
      pos.addScaledVector(toward, -4 * (1 - smooth(0, 1, u)));
      const wob = 9 * DEG * Math.sin(u * 9) * Math.exp(-u * 4) * (1 - u);
      quat.setFromAxisAngle(FALL_AXIS, FALL_TURN + wob);
    }
    return pos;
  }

  /* his poses */
  const yawQ = new THREE.Quaternion();
  const UPV = V(0, 1, 0);
  const keyW = KEYS.map((K) => ({ ...K, w: null }));
  const tmpB = V();
  const local = (w, pos, yaw, drop, out) => {
    // world → his frame: undo his position (and how low he is), then his yaw
    out.set(w.x - pos.x, w.y - (pos.y - drop), w.z - pos.z);
    return out.applyAxisAngle(UPV, -yaw);
  };
  const world = (l, pos, yaw, drop, out) => out.copy(l).applyAxisAngle(UPV, yaw).add(tmpB.set(pos.x, pos.y - drop, pos.z));
  // each key's limbs, in the world (lerped between keys, then taken back to his frame)
  const HANG_L = V(20.5, 92, 3);
  const HANG_R = V(-20.5, 92, 3);
  const KNEE_HAND = V(15, 98, 32);
  for (const K of keyW) {
    const pos = V(...K.pos);
    const yaw = K.yaw * DEG;
    K.posV = pos;
    K.yawR = yaw;
    K.feetW = K.feet.map((f) => world(V(...f), pos, yaw, K.drop, V()));
    K.leftW = Array.isArray(K.left) ? V(...K.left) : world(K.left === "knee" ? KNEE_HAND : HANG_L, pos, yaw, K.drop, V());
  }
  // the flask in his hand: from the floor (ben 1) to his chest (1.45) to the light (2)
  const AT15 = world(V(...HELD[1.45].at), keyW[3].posV, keyW[3].yawR, 0, V());
  const AT2 = world(V(...HELD[2].at), keyW[4].posV, keyW[4].yawR, 0, V());
  const AX2 = V(...HELD[2].axis).normalize().applyAxisAngle(UPV, keyW[4].yawR);
  const Q2 = new THREE.Quaternion().setFromUnitVectors(UPV, AX2);
  const heldPose = (b, pos, quat) => {
    fallPose(1, pF, qW);
    if (b <= 1.45) {
      const u = smooth(1, 1.45, b);
      pos.lerpVectors(pF, AT15, u);
      quat.copy(qW).slerp(qT.identity(), u);
    } else {
      const u = smooth(1.45, 2, b);
      pos.lerpVectors(AT15, AT2, u);
      quat.identity().slerp(Q2, u);
    }
    return pos;
  };
  const flaskPos = V();
  const flaskQ = new THREE.Quaternion();
  const cur = { pos: V(), yaw: 0, drop: 0 };
  const v1 = V();
  const v2 = V();
  const v3 = V();
  const axL = V();
  const gP = V();
  const gX = V();
  const GRIP_FLASK = [1, FL.r];
  const GRIP_HANG = [0.3, 2];
  for (const K of keyW) if (K.right?.pt) K.right.kb = [K.right.k, K.right.bar];
  const legBend = V(0, 0, 1);
  function poseBen(b, kFlask) {
    // which keys
    let i = 0;
    while (i < keyW.length - 2 && b > keyW[i + 1].at) i++;
    const A = keyW[i];
    const B = keyW[i + 1];
    const u = smooth(A.at, B.at, b);
    cur.pos.lerpVectors(A.posV, B.posV, u);
    cur.yaw = mix(A.yawR, B.yawR, u);
    cur.drop = mix(A.drop, B.drop, u);
    ben.group.position.set(cur.pos.x, cur.pos.y - cur.drop, cur.pos.z);
    ben.group.rotation.y = cur.yaw;
    // feet: lerped in the world, a little lift as he walks
    const steps = B.walk ?? 0;
    for (let f = 0; f < 2; f++) {
      v1.lerpVectors(A.feetW[f], B.feetW[f], u);
      if (steps && B.drop < 1 && A.drop < 1) v1.y += 6 * Math.max(0, Math.sin(Math.PI * 2 * steps * u + f * Math.PI));
      local(v1, cur.pos, cur.yaw, cur.drop, v2);
      ben.leg(f ? "R" : "L", v2, legBend);
    }
    ben.lean(mix(A.lean, B.lean, u), 0, mix(A.turn, B.turn, u));
    // the left hand
    v1.lerpVectors(A.leftW, B.leftW, u);
    ben.reach("L", local(v1, cur.pos, cur.yaw, cur.drop, v2));
    // the right hand: on the flask (wherever it is), or on a bar of its own
    const grip = (K, outP, outAx) => {
      if (K.right === "flask") {
        outP.copy(flaskPos);
        outAx.set(0, 1, 0).applyQuaternion(flaskQ);
        return GRIP_FLASK;
      }
      if (K.right === "hang") {
        world(HANG_R, cur.pos, cur.yaw, cur.drop, outP);
        outAx.set(1, 0, 0).applyAxisAngle(UPV, cur.yaw);
        return GRIP_HANG;
      }
      outP.set(...K.right.pt);
      outAx.set(...K.right.axis);
      return K.right.kb;
    };
    const kA = grip(A, gP, gX);
    const kB = grip(B, v1, v3);
    v1.lerpVectors(gP, v1, u);
    axL.lerpVectors(gX, v3, u).normalize();
    local(v1, cur.pos, cur.yaw, cur.drop, v2);
    axL.applyAxisAngle(UPV, -cur.yaw);
    ben.hold("R", v2, axL, { k: mix(kA[0], kB[0], u), bar: mix(kA[1], kB[1], u) });
    // his shadow on the floor, when he is on it
    benShadow.visible = cur.pos.y < 2;
    benShadow.position.set(cur.pos.x, 0.12, cur.pos.z);
    return kFlask;
  }

  const A = {
    flask: flaskG,
    ben: anchor(ben.head, 0, 0, 0),
    shelf: anchor(lab, SHELF_C.x, SHELF_C.y, SHELF_C.z),
    floor: anchor(lab, LIE_C.x, LIE_C.y, LIE_C.z),
    label: anchor(flaskG, 0, 7.2 - MID, FL.r + 0.5),
    doc: anchor(docRoot, 0, 0, 0),
  };

  // the fonts: canvases drawn before the page's fonts were loaded are drawn again once they are
  let typeset = false;
  const FONTS = [`700 40px ${FONT_D}`, `500 40px ${FONT_M}`];
  try {
    for (const f of FONTS) document.fonts?.load(f);
  } catch {}
  const retype = () => {
    if (typeset) return;
    try {
      if (!FONTS.every((f) => document.fonts.check(f))) return;
    } catch {
      return;
    }
    typeset = true;
    for (const pc of pieces) pc?.paint();
    label.paint();
  };

  const last = { ben: -1, flask: -1 };
  return {
    bench, lab, A, ben, pieces,
    update(p, time, px) {
      retype();
      /* the bench pieces */
      const which = Math.round(p.doc);
      const din = Math.max(0, p.docIn);
      for (let i = 1; i < pieces.length; i++) {
        const pc = pieces[i];
        const on = which === i && din > 0.003;
        pc.group.visible = on;
        pc.shadow.visible = on;
        if (!on) continue;
        // it slides in from the far side of the bench, a few centimetres up, and lies down with a slight settle
        const a = clamp01(din);
        const e = 1 - (1 - a) ** 3;
        const land = smooth(0.62, 1, a);
        pc.group.position.set(9 * (1 - e), 5.5 * (1 - land) * smooth(0, 0.3, a) + 0.02, -48 * (1 - e));
        pc.group.rotation.set((1 - land) * -3 * DEG, (1 - e) * 11 * DEG, (1 - land) * 2 * DEG);
        pc.shadow.position.set(pc.group.position.x, 0.05, pc.group.position.z);
        pc.shadow.rotation.z = -pc.group.rotation.y;
        pc.shadow.material.uniforms.uAmount.value = 0.62 * smooth(0, 1, a) * (0.55 + 0.45 * land);
        // its lines light up (docIn 1 → 2), or the stamp's element named by `mark`
        const lit = clamp01(din - 1) * pc.n;
        for (let k = 0; k < 8; k++) {
          if (i === 3) {
            pc.U.uF.value[k] = 1;
            // the one named is lit; the E stays lit with its "2" (E2 is one word: France)
            const tri = (n) => clamp01(1 - Math.abs(p.mark - n));
            pc.U.uK.value[k] = k === 0 ? Math.max(tri(1), tri(2)) : tri(k + 1);
          } else {
            pc.U.uF.value[k] = clamp01(lit - k);
            pc.U.uK.value[k] = 1;
          }
        }
      }

      /* the lab */
      if (p.place !== 3) return;
      const b = Math.min(2, Math.max(0, p.ben));
      const k = clamp01(p.flask);
      if (b !== last.ben || k !== last.flask) {
        if (b >= 1) heldPose(b, flaskPos, flaskQ);
        else fallPose(k, flaskPos, flaskQ);
        flaskG.position.copy(flaskPos);
        flaskG.quaternion.copy(flaskQ);
        poseBen(b, k);
        last.ben = b;
        last.flask = k;
        // its contact shadow, as it comes down to the floor
        flaskShadow.position.set(flaskG.position.x, 0.14, flaskG.position.z);
        flaskShadow.material.uniforms.uAmount.value = 0.6 * (1 - smooth(8, 70, flaskG.position.y));
        flaskShadow.visible = flaskG.position.y < 70;
      }
      flaskMat.userData.U.uStar.value = clamp01(p.star);
      label.mat.opacity = clamp01(p.labelOn);
      label.mesh.visible = p.labelOn > 0.003;
      motes.update?.(time, px, 0);
    },
  };
}
