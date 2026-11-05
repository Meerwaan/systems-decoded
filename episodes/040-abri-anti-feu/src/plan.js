// DOSSIER 040 — L'abri anti-feu : where everything stands. No import: crete.js, feu.js, model.js and world.js read it.
// Centimetres, Y up. Camera azimuth (kit/lib/stage.js, camera at t + d·(sin az · cos el, sin el, cos az · cos el)):
//   az 0 the camera stands on the +z side, looking toward −z (it looks at the FIRE over your head end)
//   az −90 on the −x side · az 90 on the +x side · az ±180 on the −z side (inside the fire, looking back at you)
//
// THE PLACE (docs/faits/040-abri-anti-feu.md § 2): the Butte Fire, Salmon River canyon (Idaho), 29/08/1985. A ridge
// top scraped by bulldozers, 73 firefighters under their shelters on cleared pads spread ALONG the crest (never a ring
// of fire closed on them: contre-vérification). The front climbs the canyon flank from −z, pushed by the wind, and
// crosses the crest toward +z. The image reconstitutes it: no picture of the day is used, the sizes of the canyon and
// of the flames are a maquette at the scale of the story (nothing is displayed of them).
//
//   x   along the crest (the ridge runs on both ways, its ends open into the dark)
//   y   up — the crest's scraped top is y 0 at z 0
//   z   across the crest: −z the canyon flank where the fire comes from (the wind blows toward +z), +z the far flank

export const DEG = Math.PI / 180;

/* ── the system: the M-2002 shelter, deployed (docs/faits § 3–4) ── */
/** Deployed ≈ 218 long × 79 wide × 39 high (Scientific American, Wikipédia). Long axis along z: your FEET at −z,
 *  toward the fire (the picture shows it, the voice does not say it), your HEAD at +z. */
export const SHELTER = {
  len: 218, w: 79, h: 39,
  feet: -109, head: 109, // the two ends, z
  skirt: 9, //             the hem that lies flat on the ground all round: your hands and feet hold it down
  // the four layers, from outside in (§ 4). Their real thickness is a fraction of a millimetre: in the CUT and the
  // exploded view they are drawn at `draw` cm, and the air gap at `gap` cm, so that each reads (a maquette: `sources`).
  layers: [
    { name: "foil", draw: 0.5, note: "feuille d'aluminium, tournée vers l'extérieur — le miroir" },
    { name: "silica", draw: 0.9, note: "toile de silice tissée, collée sous la feuille" },
    { name: "gap", draw: 3.0, note: "la lame d'air — rien, un vide clair entre deux couches" },
    { name: "fibre", draw: 0.9, note: "fibre de verre tissée" },
    { name: "inner", draw: 0.5, note: "seconde feuille d'aluminium, tournée vers toi" },
  ],
  /** The exploded view: each layer lifts like a page from the one under it (cm above its place, inner stays). */
  lift: { foil: 96, silica: 72, gap: 0, fibre: 30, inner: 0 },
  handles: [[-26, 34, 0], [26, 34, 0]], // the two shake handles, on the outer foil near the top, inside (x, y, z)
  straps: { hands: [[-36, 2, 62], [36, 2, 62]], feet: [[-30, 2, -96], [30, 2, -96]] }, // hold-down straps at the hem
  glue: [33, 4, 104], // the corner of the hem where the glue lets go first (the repos close-up, the chute's hole)
};
/** Folded on your pack: « un pain de mie », ≈ 2 kg (4.3 lb, Scientific American). Its case, and the line pack. */
export const PACK = { l: 24, w: 14, h: 11, case: 0.8 };
export const BAG = { w: 34, h: 42, d: 18 }; // the firefighter's line pack (sac), on the bench only (repos)

/* ── the firefighter inside (you): @kit/figure.js, prone ── */
/** Lying face down along +z, hips at z −10, the crown of the head at z +88, the boots at z −92. */
export const YOU = { hips: [0, 10, -10], head: [0, 12, 80], mouth: [0, 4, 84], lift: 14 /* « lève la tête »: cm up */ };
/** The air under the dome (§ 4, « pourquoi ça marche »): the cool, clean layer a few inches over the ground, the hot
 *  gas higher. Heights inside the shelter, cm. */
export const AIR = { cool: [0, 8], hot: [18, 37] };

/* ── the ridge (crete.js) ── */
/** The scraped crest is flat for |z| < 600; the flanks drop ≈ 32° to the canyon floors (−z: the river side, deeper). */
export const RIDGE = { len: 32000, flat: 600, slope: 0.62, floorMinus: -16000, floorPlus: -9000, zMinus: -26000, zPlus: 16000 };
/** Height of the ground (cm) at (x, z): a pure function, the same in every file. */
export function ridgeY(x, z) {
  const a = Math.abs(z) - RIDGE.flat;
  const floor = z < 0 ? RIDGE.floorMinus : RIDGE.floorPlus;
  const drop = a <= 0 ? 0 : Math.max(floor, -RIDGE.slope * a - (a * a) / 90000);
  const along = -0.012 * Math.max(0, Math.abs(x) - 9000); // the ridge goes down slowly past the crews, both ways
  const wobble = 60 * Math.sin(x / 2300) + 40 * Math.sin(x / 870 + 1.2) * Math.min(1, Math.max(0, a / 2000));
  return drop + along + wobble * (a > 0 ? 1 : 0.15);
}
/** A pad (« emplacement aplani au bulldozer »): at least 1.2 × 2.4 m of fuel removed (§ 4) — drawn 4 × 5 m. */
export const PAD = { w: 400, l: 500 };

/** The 73 shelters (§ 2: 73 deployed on the crest): index 0 is yours, at the origin. Spread along the crest in crews
 *  (five clusters), each feet toward the fire (−z) ± a little; none within 9 m of yours, none on your −x side within 24 m (the hook and the close shots look from there).
 *  Deterministic (a small LCG): every file gets the same list. [x, z, yaw (deg, around y; 0 = feet at −z)] */
export const CREW = (() => {
  let s = 4040;
  const r = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  const list = [[0, 0, 0]];
  const clusters = [[-6800, 13], [-3600, 16], [1700, 14], [4300, 17], [7200, 12]];
  for (const [cx, n] of clusters)
    for (let i = 0; i < n; i++) {
      let x, z;
      do {
        x = cx + (r() - 0.5) * 2400;
        z = (r() - 0.5) * 900;
      } while (Math.hypot(x, z) < 900 || (x < 0 && x > -2400));
      list.push([Math.round(x), Math.round(z), Math.round((r() - 0.5) * 40)]);
    }
  return list; // 1 + 72 = 73
})();

/** Your shovel, lying on the scraped ground beside the shelter (« les manches de pelle se consument », Wildfire Today:
 *  « handles on shovels next to the firefighters »). Handle ≈ 120 cm of wood, the blade of steel. */
export const SHOVEL = { at: [-115, 1.5, -20], yaw: 12, handle: 120, blade: [22, 28] };

/** The comment's question (comment beat): two firefighters lying side by side on a pad of their own, the front below
 *  on the −z flank — one with his FEET toward it, the other with his HEAD toward it. The film never says which. */
export const DUO = { at: [1500, 0, 60], gap: 110 };

/* ── the fire (feu.js) ── */
/** The front: a wall of flame across the whole crest (x), its foot at z = `front` metres × 100 (0: at your feet; the
 *  canyon floor ≈ −200 m; it crosses the crest and goes on down past +40 m). Flames ≈ 15–25 m, laid toward +z by the
 *  wind (`lean`). Wildfire flames ≈ 870 to 1 100 °C+ (§ 4) — never a number on screen. The far flank's own line of
 *  fire, far below at +z: never joined to the main front around the crews (no closed ring). */
export const FIRE = { width: 36000, height: 2000, depth: 1400, flankZ: 11000, flankY: -6500 };
/** The radiation rays (principe, reponse, chute): TEN lines from the front to the dome, in the shelter's frame. */
export const RAYS = { n: 10, from: [0, 260, -900], spread: 160 };

/* ── the next file's teaser (abo): a spark that crosses the black sky in one stroke ── */
export const DEBRIS = { from: [-9000, 9000, -16000], to: [9000, 5000, -12000] };

/* ── the bench ── */
/** ≈ the radius of the shelter: sizes the bench, its light and shadows. On the bench the shelter stands on the origin
 *  exactly as on its pad: a point of it is at the same place in both (the cut matches on it). */
export const SIZE = 115;
export const SYSTEM = { centre: [0, 20, 0], size: SIZE };
