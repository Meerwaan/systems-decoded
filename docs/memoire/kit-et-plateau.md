# Le kit, le plateau et les pièges techniques

> Recopié tel quel de l'ancien `CLAUDE.md` le 2026-10-27, quand il a été resserré (copie intégrale : `CLAUDE-complet-2026-10-27.md`). Les règles en vigueur sont dans `CLAUDE.md` ; ce fichier garde le détail, les mesures et l'histoire. Les dates et les « aujourd'hui » sont ceux du texte d'origine.

Pour : un agent de décor ou d'acte qui découvre `kit/` (stage, build3d, overlay, options `dof` / `finish` / `air`) ou qui bute sur GSAP, `cut()`, ffmpeg.

---

### L'image

- `kit/` = le moteur partagé : `brand.css` (tokens, HUD, sous-titres, cartes d'accroche, callouts et dispositifs récurrents — bloc STORY OVERLAYS), `lib/stage.js` (le plateau), `lib/build3d.js` (matières, arêtes, pièces, vue éclatée), `lib/atmo.js` (sol, halo, particules), `lib/overlay.js` (`buildHook`, `buildCaptions`, callouts, les trois CTA : `rail`, `likeNet`, `typeAnswer`, et `brandHud`), `lib/timing.js` + `lib/ref.mjs` (repères).
- `episodes/NNN-slug/` = `episode.json`, `index.html` (overlays de l'épisode), `src/model.js` (le système, en centimètres), `src/main.js` (la mise en scène). `gen/` est reconstruit à chaque build. Un second décor a son fichier : `src/road.js` (002, la route), `src/shaft.js` (003, la gaine), `src/room.js` (004, la pièce et le tableau), `src/reactor.js`, `src/pile.js` et `src/chain.js` (005 : la cuve, Chicago 1942, les noyaux de la réaction en chaîne), `src/hall.js` et `src/heart.js` (006 : le hall de gare et ses trois personnages, le cœur). Le même modèle sert dans les deux décors — le parachute du 003 est boulonné sous la cabine **et** posé sur l'établi : la coupe de l'un à l'autre raccorde sur le même objet, même place à l'écran, même lueur.
- Dans `main.js` : `T.at("beat:mot")` pour l'heure d'un moment ; `shot(at, durée, pose)` pour un mouvement de caméra (une plongée ou un long recul : `shot(at, durée, pose, ease, fromD)`, voir « Net et fluide »), `cut(at, décor, pose)` pour une coupe franche ; `st(at, durée, {…})` pour l'état du monde `S` ; `tl` pour la page.

**Le plateau (`createStage`)** fait le travail d'un studio : environnement de boîtes à lumière (reflets), lumière clé avec ombres douces, obturateur (chaque image est la moyenne de 16 instants : flou de mouvement et lissage), bloom, puis **étalonnage** (`stage.grade` : contraste, ombres froides, hautes lumières chaudes, saturation, vignette, et `gel` pour teinter une scène). `stage.cut(t)` garde les coupes nettes, `stage.focus` dit aux lumières et aux ombres ce qu'on filme. Les fonctions passées à `stage.onUpdate` sont appelées plusieurs fois par image : elles ne dépendent que du temps.

**Les options du plateau** (21/10, `docs/scale/2-rendu-decors.md`) — éteintes dans le kit, une ligne dans `world.js` (`LOOK`, que le modèle porte désormais : `{ dof: 8, air: 0, finish: 1 }`) : `dof`, l'optique (profondeur de champ par accumulation sur les 16 instants de l'obturateur, sans passe de plus), **donnée aux seuls gros plans** (`...CLOSE` dans leurs poses ; jamais un plan large, un éclaté, une chute, ni l'accroche si elle n'y gagne pas ; toute autre pose dit `dof: 0`, pour qu'une coupe n'hérite jamais du flou d'avant) ; `finish`, la matière des pièces pleines (grain d'usinage, traces de main, `kit/lib/finish.js`), visible en plein écran ; `air`, la lumière qui reste dans l'air derrière le sujet, pour un vrai contre-jour seulement (essayé sur le 025 : aucun gain, éteint ; sur l'établi il grise le vert). Merwan, 21/10 : « la version là est déjà très bien » — une option n'entre que si la planche avant / après (`SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look` pour l'avant) montre un gain net à 270 px. Coût mesuré : ≈ +10 à +20 % par image. `cover`, `social` et `annonce` posent `dof: 0` d'office.

Pièges techniques déjà rencontrés :

- GSAP ne sait pas revenir à un texte **vide** : ne jamais `tl.set(el, { textContent })` en partant de `""` (révéler par largeur ou opacité).
- Deux tweens sur la même propriété ne doivent pas se chevaucher ; `immediateRender: false` sur un `fromTo` qui rejoue un élément déjà animé.
- `lint` ne voit `window.__timelines` que dans le HTML : garder le petit script en bas d'`index.html`.
- Tout ce qui bouge dépend du temps HyperFrames (`hf-seek`), jamais d'une horloge ; l'aléatoire est semé (`kit/lib/rng.js`).
- Une pose de `cut()` doit être complète (`tx, ty, tz, d, az, el, shift`) : rien n'est hérité du plan précédent.
- Pour modifier du code par script, écrire le script avec l'outil d'écriture de fichier : un heredoc bash avale les antislashs des expressions régulières et casse sur les apostrophes.
- Le rendu a besoin de `ffmpeg` + `ffprobe` : s'ils ne sont pas dans le PATH, `scripts/lib/ffmpeg.mjs` les cherche dans les `node_modules` des projets voisins, ou dans `FFMPEG_DIR`. Sans eux, pas de traitement de la voix (le film joue alors les prises brutes).
- L'habillage sonore est synthétisé (`scripts/sfx.mjs`) pour un haut-parleur de téléphone. Depuis le 008 il sait faire un tonnerre (`thunder` : le claquement que le téléphone joue, puis le roulement), la pluie (`rain`, sous la voix) et une étincelle (`zap`). Personne ne l'a encore validé à l'oreille : baisser `bedVolume` ou retirer des éléments de `sfx` si Merwan le trouve envahissant.
