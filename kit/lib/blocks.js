// The blocks every film brings back: the bench and its pool of light, the cut from the set to the
// bench on the same object, the received idea struck and corrected, the three calls to action, the
// next file. A film gives the times and a few numbers; the markup is in kit/template/index.html
// (same ids), the look in kit/brand.css (STORY OVERLAYS).
import * as THREE from "three";
import { BRAND } from "./brand.js";
import { makeSurface, makePool } from "./atmo.js";
import { rail, likeNet, typeAnswer } from "./overlay.js";
import { moved } from "./direct.js";

const VEILLE = new THREE.Color(BRAND.veille);
const SIGNAL = new THREE.Color(BRAND.signal);

/**
 * The bench: a matt floor, its grid, a pool of light under the system. `size` ≈ the radius of what
 * stands on it, in scene units (the 007 seat: 90 cm).
 *   bench.set({ pool, grid, mood })   every frame — `mood` 0 veille → 1 signal (held frank: 0 or 1)
 *   bench.fog(d)                      the fog that suits a camera at distance `d`
 */
export function makeBench(size = 10) {
  const surface = makeSurface({ radius: size * 33, cell: size * 0.28, fade: size * 4.7, lift: size * 0.045 });
  // seen at a grazing angle, a floor with any gloss mirrors the rim light: a slab across the picture
  surface.group.children[0].material.roughness = 1;
  const pool = makePool({ radius: size * 1.4 });
  const group = new THREE.Group();
  group.add(surface.group, pool.mesh);
  const mix = new THREE.Color();
  return {
    group, surface, pool, size,
    set({ pool: amount = 0.2, grid = 0.16, mood = 0 } = {}) {
      pool.uniforms.uColor.value.copy(mix.copy(VEILLE).lerp(SIGNAL, mood));
      pool.uniforms.uAmount.value = amount;
      surface.grid.uAmount.value = grid;
    },
    fog: (d) => 0.28 / Math.max(size * 1.3, d),
  };
}

const INK = new THREE.Color(BRAND.ink);
const BG = new THREE.Color(BRAND.bg);
const BG_HOT = new THREE.Color(0x120a07);
const rimMix = new THREE.Color();
/**
 * The colour of the scene, every frame: `mood` 0 veille → 1 signal on the rim light, and `hot` (0–1)
 * warms the background of a set under threat (0 on the bench). The fog takes the background's colour.
 */
export function setMood(stage, mood, hot = 0) {
  rimMix.copy(VEILLE).lerp(SIGNAL, mood).lerp(INK, 0.5);
  stage.lights.rim.color.copy(rimMix);
  stage.lights.rim.intensity = 1.1 + mood * 0.5;
  stage.scene.background.copy(BG).lerp(BG_HOT, hot);
  stage.scene.fog.color.copy(stage.scene.background);
}

/**
 * The cut from the set to the bench, on the same object at the same place of the picture: only what
 * stood around it changes on the cut, the bench comes up under it just after.
 *   at      the instant (a few frames before "on l'ouvre")
 *   set     the bench's number
 *   view    the pose the last shot of the set ends on — complete
 *   origin  where the object stands in the set ([x, y, z]); on the bench it stands at the origin
 *   state   what else changes on the cut (the light: fx, fy, fz, fs written around the origin)
 * Returns the bench's pose: the pull-back that follows leaves from it (shot(…, fromD = pose.d)).
 */
export function benchCut(D, { at, set, view, origin = [0, 0, 0], state = {}, pool = 0.2, grid = 0.16 }) {
  const pose = moved(view, origin);
  D.cut(at, set, pose, { pool: 0, grid: 0, ...state });
  D.st(at + 0.02, 0.6, { pool, grid }, "sine.out");
  return pose;
}

/**
 * The chute: the received idea (#retitle-a), struck, then corrected (#retitle-b). `#title-shade`
 * carries the title when it lies over a bright subject.
 *   showAt  the title comes (with the words that state the idea, not before)
 *   strikeAt the voice denies it   ·   swapAt the truth takes its place   ·   hideAt before the next cut
 */
export function retitle(tl, { showAt, strikeAt, swapAt, hideAt, shade = true }) {
  if (shade) {
    tl.fromTo("#title-shade", { opacity: 0 }, { opacity: 1, duration: 0.35 }, showAt - 0.1);
    tl.to("#title-shade", { opacity: 0, duration: 0.22 }, hideAt);
  }
  tl.fromTo("#retitle", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, showAt);
  tl.fromTo("#retitle-strike", { scaleX: 0 }, { scaleX: 1, duration: 0.22, ease: "power3.out" }, strikeAt);
  tl.to("#retitle-a", { opacity: 0, y: -40, duration: 0.2, ease: "power2.in" }, swapAt - 0.2);
  tl.fromTo("#retitle-b", { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.28, ease: "back.out(2)" }, swapAt);
  tl.to("#retitle", { opacity: 0, y: -24, duration: 0.22, ease: "power2.in" }, hideAt);
}

/**
 * SUBSCRIBE: the next file, classified (#next) — its title redacted, one fact as bait (no figure that
 * is not sourced yet), and the chevrons on TikTok's follow button.
 */
export function nextFile(tl, { showAt, factAt, hideAt, railFrom = showAt, railTo = hideAt }) {
  tl.fromTo("#next", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, showAt);
  tl.fromTo("#next-redact", { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: "power3.inOut" }, showAt + 0.35);
  tl.fromTo("#next-fact", { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, factAt);
  rail(tl, "rail-follow", railFrom, Math.min(railTo, hideAt + 0.08));
  tl.to("#next", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, hideAt);
}

/**
 * THE THRESHOLD — the subscribe call that is heard. On the first curve the account got (003), one viewer in
 * ten was still there for the "Abonne-toi" of the end; at the door of act 3 (≈ 25–32 s) they are three to four
 * times as many, and they have just been given something. So the call is ONE sentence, said there, three seconds
 * at most: two words of asking, then the promise of what act 3 is about to show, in the episode's own words
 * ("Abonne-toi : ce millième de seconde, on te le montre en entier."). It never stops the film — no panel, no
 * silence after it: for the length of the sentence the account name lights up in the header and the chevrons
 * (#rail-seuil) point at TikTok's follow button, while the camera is already on its way to the climax (the act
 * writes that move). The end of the film keeps the next file as its bait.
 */
export function followCall(tl, { from, to }) {
  const brand = document.querySelectorAll(".hud__brand");
  tl.to(brand, { color: "#5cffb0", duration: 0.2, ease: "power2.out" }, from);
  tl.to(brand, { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, to);
  rail(tl, "rail-seuil", from, to);
}

/**
 * LIKE: the film reaches other people (#net) — `count` tiles light up one after the other from
 * `from`, `label(n)` is the counter once n are lit; chevrons on the like button from `word`.
 */
export function likeCall(tl, { from, word = from, to, count = 5, every = 0.26, label }) {
  likeNet(tl, { showAt: from - 0.1, hideAt: to, hits: Array.from({ length: count }, (_, i) => [i + 1, from + 0.1 + i * every]), label });
  rail(tl, "rail-like", word, to);
}

/**
 * COMMENT: the question of the hook comes back (#cta-field, its text in the markup) and an answer
 * types itself (`chars` letters of #cta-typed); chevrons on the comment button from `word`.
 */
export function commentCall(tl, { from, word = from, typedAt, chars, to }) {
  typeAnswer(tl, { showAt: from, typedAt, chars, hideAt: to });
  rail(tl, "rail-comment", word, to);
}
