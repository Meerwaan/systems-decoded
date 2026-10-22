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
 * HORS-SÉRIE — the long the promo sends to (#film): a cartouche in the top zone, the bar fills like a video
 * that starts, the account name lights up in the header. The word YouTube, never its logo. One call only.
 * (Its option « titre », without the box: filmTitle below, called in its place.)
 */
export function filmCall(tl, { showAt, hideAt, barFrom = showAt + 0.3, barTo = hideAt - 0.3 }) {
  tl.fromTo("#film", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, showAt);
  tl.fromTo("#film-bar i", { scaleX: 0 }, { scaleX: 1, duration: Math.max(0.3, barTo - barFrom), ease: "none" }, barFrom);
  const brand = document.querySelectorAll(".hud__brand");
  tl.to(brand, { color: "#5cffb0", duration: 0.2, ease: "power2.out" }, showAt);
  tl.to("#film", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, hideAt);
  tl.to(brand, { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, hideAt);
}

/**
 * HORS-SÉRIE, OPTION « TITRE » (2026-10-21) — filmCall without the box, called IN ITS PLACE with the same instants (one
 * line in fin.js: `filmTitle(tl, { showAt, hideAt })`); the markup is filmCall's (#film), the look `#film.is-titre`
 * (brand.css). The long's title as the end title of a trailer, over the scene that keeps playing (#title-shade carries
 * it): it rises out of a mask, a rule draws itself under it (the bar, 0.6 s), then « Sur YouTube · Lien en bio ».
 * Why: a box with a progress bar and « Lien en bio » is the grammar of an ad's end card, the one TikTok swipes
 * (docs/recette-promo-image.md). Sizes from the title's length, never measured (the fonts may not be loaded yet):
 * 140 px up to 15 letters, 124 up to 22, 112 beyond — two lines at most in the top slot (436 → 790).
 */
export function filmTitle(tl, { showAt, hideAt }) {
  const film = document.getElementById("film");
  const title = document.getElementById("film-title");
  if (!film || !title) return;
  film.classList.add("is-titre");
  const n = title.textContent.trim().length;
  title.style.fontSize = `${n <= 15 ? 140 : n <= 22 ? 124 : 112}px`;
  const shade = document.getElementById("title-shade");
  if (shade) {
    tl.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, showAt - 0.1);
    tl.to(shade, { opacity: 0, duration: 0.3 }, hideAt);
  }
  tl.fromTo(film, { opacity: 0, y: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, showAt);
  tl.fromTo("#film .panel__h", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, showAt);
  tl.fromTo(title, { clipPath: "inset(0% 0% 100% 0%)", y: 70 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 0.55, ease: "power3.out" }, showAt + 0.12);
  tl.fromTo("#film-bar i", { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, showAt + 0.55);
  tl.fromTo("#film-where", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, showAt + 0.95);
  const brand = document.querySelectorAll(".hud__brand");
  tl.to(brand, { color: "#5cffb0", duration: 0.2, ease: "power2.out" }, showAt);
  tl.to(film, { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, hideAt);
  tl.to(brand, { color: "rgba(233, 228, 216, 0.62)", duration: 0.3 }, hideAt);
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
 * COMMENT, AS A CHOICE: the question of the comment asked in two answers (#duel, its texts in the markup) — taking
 * sides is what makes people write (on TikTok the account gets 0.5 comment per 1,000 views; what did a little better
 * made them check at home or take a side: 004 « 30 mA… ou rien ? », 013 « pour ou contre ? »). Each answer lights up
 * when the voice says it (`aAt`, `bAt`: cues on its word), in its colour (`toneA`, `toneB`: "veille" | "signal" |
 * null for ink), and both stay lit: the film never answers for the viewer (a field that typed the answer killed the
 * comment, 022). The caret waits under « À toi » until `to`; chevrons on the comment button from `word`.
 * Our dossier look, never TikTok's poll sticker.
 */
export function duelCall(tl, { from, aAt, bAt, to, word = from, toneA = null, toneB = "veille" }) {
  const COL = { veille: "#5cffb0", signal: "#ff5b2e" };
  const INK = "#e9e4d8";
  const DIM = "rgba(233, 228, 216, 0.62)";
  const FAINT = "rgba(233, 228, 216, 0.22)";
  tl.fromTo("#duel", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "power3.out" }, from);
  for (const [sel, at, tone] of [["#duel-a", aAt, toneA], ["#duel-b", bAt, toneB]]) {
    tl.fromTo(sel, { color: DIM, borderColor: FAINT, scale: 1 }, { color: COL[tone] ?? INK, borderColor: COL[tone] ?? INK, scale: 1.07, duration: 0.14, ease: "power2.out", immediateRender: false }, at);
    tl.to(sel, { scale: 1, duration: 0.3, ease: "power3.out" }, at + 0.14);
  }
  const blinks = Math.max(1, Math.floor((to - bAt - 0.3) / 0.5));
  tl.fromTo("#duel-caret", { opacity: 1 }, { opacity: 0, duration: 0.25, ease: "steps(1)", repeat: blinks * 2 - 1, yoyo: true, immediateRender: false }, bAt + 0.3);
  rail(tl, "rail-comment", word, to);
  tl.to("#duel", { opacity: 0, y: -24, duration: 0.28, ease: "power2.in" }, to);
}

/**
 * COMMENT: the question of the hook comes back (#cta-field, its text in the markup) and an answer
 * types itself (`chars` letters of #cta-typed); chevrons on the comment button from `word`.
 * A question put to the viewer is never answered by the field (it types « À VOUS », or use duelCall).
 */
export function commentCall(tl, { from, word = from, typedAt, chars, to }) {
  typeAnswer(tl, { showAt: from, typedAt, chars, hideAt: to });
  rail(tl, "rail-comment", word, to);
}

/**
 * THE LONG FORMAT — THE OPEN THREAD (2026-10-21): the question a chapter leaves hanging, written once, small, under a
 * chapter card — above all the card that follows a mid-roll: the viewer who comes back from the ad finds what was
 * left open (« Et la voisine ? Toujours sous tension. ») instead of a bare title. A kicker (« Fil ouvert »), the
 * question in the display face, from `from` to `to` (≤ the card's 2.6 s); it never speaks over a keyword (the cards
 * are quiet windows). Created by script (no markup): `x`, `y` in px, under the card's column. `tone`: "signal" (a
 * threat still running) | "veille". On a short, nothing calls it: nothing changes.
 */
export function threadCall(tl, { from, to, text, kicker = "Fil ouvert", tone = "signal", x = 132, y = 846 }) {
  const node = document.createElement("div");
  node.className = `thread${tone === "veille" ? " is-veille" : ""}`;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  const k = document.createElement("div");
  k.className = "thread__k";
  k.append(document.createElement("i"), Object.assign(document.createElement("span"), { textContent: kicker }));
  const t = document.createElement("div");
  t.className = "thread__t";
  t.textContent = text;
  node.append(k, t);
  // above the card (its dark band would dim it): in #chapters when the page has it
  (document.getElementById("chapters") ?? document.getElementById("facts") ?? document.getElementById("root")).append(node);
  tl.fromTo(node, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out", immediateRender: false }, from);
  tl.fromTo(t, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.55, ease: "power2.out", immediateRender: false }, from + 0.12);
  tl.to(node, { opacity: 0, duration: 0.22, ease: "power2.in" }, to - 0.22);
  return node;
}
