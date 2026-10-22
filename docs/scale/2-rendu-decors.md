# Agent 2 — rendu, design et décors (2026-10-21)

Demande de Merwan : « scale un max » sur TikTok. Ma part : faire monter l'image d'un cran vers « un vrai studio d'animation », dès la première image, sans ralentir la fabrication. Puis, en cours de route (consignes de celui qui orchestre) : la preuve se fait sur le **025 (ESP)**, prochain à sortir ; « la version là est déjà très bien » — **un changement n'entre que s'il est un gain net à l'œil, dans le doute rien**.

## En bref

- Trois options du plateau dans le kit, **éteintes par défaut** (un film qui ne les demande pas est dessiné à l'octet près comme avant — prouvé sur le 015) : **l'optique** (profondeur de champ par accumulation), **l'air** (la lumière qui reste dans l'air derrière le sujet), **la matière** (grain d'usinage et traces sur les pièces pleines). Chacune s'éteint d'une ligne.
- Sur le 025 : **l'optique sur les seuls gros plans** et **la matière** ; l'accroche, la route, la toupie, l'éclaté et la chute **inchangés** (l'image 0 : PSNR 67,7 dB contre l'avant, identique à l'œil). L'air a été essayé (phares sous la pluie, établi) et **n'est pas gardé** : aucun gain net à 270 px, et il grise le vert de l'établi.
- Une **règle de la première image**, tirée des courbes du 015 et du 012, écrite dans `docs/recette-agents.md` : six points, la planche des quatre candidates se note dessus.
- `npm run check -- 025` passe (0 erreur, 65/65 contrastes). Le brouillon, `qa` et le rendu sont faits par celui qui orchestre.

## 1. Le diagnostic (009, 015, 022, 023 : accroche, éclaté, climax — 12 images)

Ce qui fait encore « 3D » plutôt que « studio », sur les quatre :

1. **Tout est net partout.** Les traits du décor au premier plan, la grille jusqu'à l'horizon, la voiture au fond : même netteté que le sujet. Aucune optique — c'est la signature d'une image de synthèse. C'est le premier levier, et il est gratuit avec notre obturateur à seize instants.
2. **L'air n'a pas d'épaisseur.** Des moitiés d'image d'un noir plat (le bas de l'accroche du 015, le ciel du 023). Le brouillard existant ne fait qu'assombrir ; aucune lumière ne reste dans l'air. Le plan le plus « cher » des quatre est le climax du 022 : un fond chaud dégradé derrière le sujet.
3. **Les pièces pleines sont des dégradés lisses.** Le piston du 015, le moyeu du 023, le boîtier du 025 : un reflet parfait sur une surface parfaite — le plastique d'un rendu, pas le métal d'une pièce usinée.
4. **Ce qui tient déjà** : les ombres de contact (clé en boîte à lumière, `keySize` 2,5, dans tous les films depuis le 007 ; `makeContact` pour le verre), la direction de la lumière (clé haut gauche, contre-jour veille), l'étalonnage (contraste ferme, ombres froides, vignette). Je n'y ai pas touché.

## 2. La première image (les courbes du 015 et du 012)

TikTok écrit pour les deux « la plupart ont cessé de regarder à 0:01 » ; le 015 garde 59 % à 0:07 (≈ 40 % vers 0:23), le 012 52 % à 0:09 (≈ 27 %). Ce que l'image 0 du 015 a et celle du 012 n'a pas — la règle complète est dans `docs/recette-agents.md`, « La première image » :

1. un événement déjà en cours (l'avion touche le pont dans une gerbe d'étincelles), pas un état (la mousse posée) ;
2. une perspective basse qui tire l'œil vers un point de fuite proche du sujet, pas un trois-quarts haut de fiche produit ;
3. la menace **derrière** le sujet, qui s'y découpe (l'horizon signal), pas cachée dessous ;
4. une forme reconnue en un tiers de seconde, vue d'où on ne la voit jamais, sur 40 % de la largeur au moins ;
5. le système déjà là, petit mais lisible (le brin vert en travers) ;
6. elle bouge dès l'image 1 **par son sujet** : « rythme » de la première demi-seconde 9,8 au 015, 3,3–3,7 aux 010/013/014, 1,4 au 025.

Ce que j'en tire pour mon travail : **les options du plateau ne rattrapent pas une composition.** Sur l'accroche du 025, l'optique (le sanglier net, la voiture fondue) et l'air (le halo des phares dans la pluie) donnent une image plus « cinéma » en grand, mais pas plus forte à 270 px ; la voiture aux rayons X y perd ses traits. Je les ai retirés de l'accroche.

## 3. Ce qui change dans le kit

| fichier | quoi |
| --- | --- |
| `kit/lib/stage.js` | `createStage(…, { dof, focus, air, finish })` ; `cam.dof` / `cam.focus` (nombres de pose) ; l'objectif (chaque instant de l'obturateur voit la scène d'un autre point d'un disque, le cadre glisse d'autant : le plan net reste en place) ; l'air (la passe d'accumulation lit la profondeur de chaque instant : de la lumière seulement derrière le plan net, un halo serré autour du sujet ou d'une source du monde, `stage.air.source`) ; `stage.finish`. `window.__SD_KIT` (donné par `look` et `cover`) l'emporte sur les options du film. |
| `kit/lib/finish.js` (nouveau) | la matière des pièces pleines (`solid()`, jamais un sol, un verre, une lueur) : taches de main sur la rugosité, anneaux d'usinage le long de l'axe de la pièce (3 au cm) qui inclinent la normale de quelques degrés ; tout s'efface avant 4 px (rien qui grouille). `material.userData.finish = false` garde une pièce nue. |
| `scripts/look.mjs` | `"kit": { dof, focus, air, airColor, airSpread…, finish, grade }` par image dans `essais.json` (remis comme avant après l'image) ; `SD_KIT='{…}'` pour toute la page ; le coût d'une image (médiane, ms) en fin de planche. |
| `scripts/cover.mjs` | option `out` (une couverture d'essai hors de `renders/`), `SD_KIT` comme `look`, et **`dof: 0` par défaut** : une couverture se lit d'un bord à l'autre, même prise pendant un gros plan. |
| `docs/recette-agents.md` | « La première image » et « L'image d'un studio : les options du plateau ». |
| `docs/recette-decorateur.md` | la première image passe avant l'habillage ; l'air autour d'une vraie lampe, proposé par le décorateur avec sa planche ; pas de matière sur l'habillage. |

**Rien n'a changé pour les films existants** : `look` du 015 sur le `stage.js` du dernier commit, puis sur ce même fichier avec mes seuls changements, options éteintes → planches identiques octet pour octet. (À noter, sans rapport avec moi : la copie de travail de `stage.js` contenait déjà, avant moi, les fondus de coupe du L02 non commités ; avec eux, le 015 diffère du dernier commit de PSNR 59 dB — invisible, mais ce n'est pas l'identité.)

Exigences du moteur : déterministe (des disques de points fixes, permutés autrement que ceux de la clé : rien ne grouille d'une image à l'autre), bornes avant division dans le shader de l'air (profondeur bornée, `max(…, 1e-6)`), le filtre des pixels impossibles gardé sur la nouvelle passe. **Aucune passe de rendu ajoutée.**

## 4. Le 025

Fichiers : `src/world.js` et `src/main.js` (rien dans les actes, `index.html`, `episode.json`).

- **L'interrupteur, une ligne** (`world.js`) : `export const LOOK = { dof: 8, air: 0, finish: 1, ...(window.__SD_KIT) }`. `{ dof: 0, air: 0, finish: 0 }` rend le film d'avant. `main.js` : `createStage(…, { …, ...LOOK })`.
- **L'optique sur les gros plans seulement** : `P` (la base des poses) a `dof: 0`, `POSE0` aussi ; `const CLOSE = { dof: LOOK.dof }` est étalé dans `hands`, `engine`, `unit`, `cornerFR`, `wheelBench`, `yawBench`, `ecuBench`, `frBench`. Chaque pose dit son optique : une coupe n'hérite pas du flou d'avant, la boucle revient nette. Ce que ça donne : sur « Puis il freine » (le climax), le bloc ESP net, le disque et l'étrier du premier plan fondus, les traits du fond adoucis ; sur « Qui compare », le calculateur seul net sur l'établi.
- **La matière** sur toutes les pièces pleines du système (bloc, calculateur, étriers…) : visible en plein écran sur les gros plans, invisible sur une vignette.
- **Essayé, pas gardé** : l'optique sur l'accroche (dof 8 à 20 ; au-dessus de 10, les copies se voient sur la voiture) ; l'air sur la route (halo des phares, de 1,2 à 5) et sur l'établi (il grise le vert) ; l'optique sur l'éclaté et la chute (les roues du fond s'adoucissent : illisible = interdit).
- **Planches** (dossier temporaire de la session, `…\scratchpad\scale2\`) : `025-avant-apres.jpg` (8 instants — image 0, braques, toupie, éclaté, calculateur, climax, redresse, chute — rangées avant / après alternées), `025-planche-avant.jpg`, `025-planche-apres.jpg`, `finish-test.jpg` (gros plans en pleine résolution, matière éteinte / allumée), `hook-final.jpg` (l'accroche : avant, optique, deux réglages d'air — pour mémoire). Écart mesuré avant / après : image 0 67,7 dB, braques 64, toupie 63, éclaté 60, redresse 48, chute 57 (identiques à l'œil) ; calculateur 38,9 et climax 38,4 (changés).
- `npm run check -- 025` : passe.
- **acte1.js et la première seconde** : je n'y ai pas touché. Une poussée de caméra seule ne fait pas monter le « rythme » (l'agent 3 l'a mesuré) ; ce qui le ferait, c'est un premier plan qui traverse le cadre (des gouttes tout près de l'objectif, un piquet de bord de route qui défile) — c'est `route.js`, non essayé, à garder pour le prochain film de route, pas à improviser sur le 025.

## 5. Le coût

Mesuré dans `look` sur 36 images du 025 (carte graphique partagée avec les autres agents, donc bruité) : options éteintes 46–58 ms par image, allumées 54–78 ms — **≈ +10 à +20 %**, sous les 30 %. Aucune passe de plus : l'objectif ne coûte rien (les seize instants existaient), l'air n'est qu'une lecture de profondeur dans la passe d'accumulation (et n'est pas allumé dans le 025), la matière ajoute du calcul sur les pièces pleines. À confirmer sur la durée du brouillon de celui qui orchestre. Côté fabrication : une ligne dans `world.js`, `...CLOSE` dans les poses de gros plan — aucune minute de décor en plus.

## 6. Ce que Merwan tranche (oui / non)

1. **L'optique sur les gros plans du 025** (le bloc net, le premier plan fondu) — oui / non.
2. **La matière des pièces pleines** (grain d'usinage, traces) — oui / non. Si `qa` trouve une image parasite sur une pièce qui bouge, elle s'éteint d'abord (`finish: 0`).
3. **Pour les dossiers suivants** : les poses de gros plan reçoivent l'optique d'office (`...CLOSE`), le reste reste net — oui / non.

## 7. La ligne pour le modèle (`kit/template/`, aux agents 1 et 3)

```js
// src/world.js — après les imports
export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) }; // { dof: 0, air: 0, finish: 0 } : sans
const CLOSE = { dof: LOOK.dof }; // à étaler dans les seules poses de gros plan : { ...P, ...CLOSE, … }
// et dof: 0 dans POSE0 et dans P (la base des poses de VIEW)

// src/main.js
const stage = createStage($("stage"), { scale: SIZE, far: 6000, keySize: 2.5, ...LOOK });
```

## 8. À changer ailleurs (pas mes fichiers)

- `scripts/social.mjs` (l. 192 et 227) et `scripts/annonce.mjs` (l. 108) posent la caméra sans optique : dans un film qui en a, une image prise pendant un gros plan hériterait de son flou. Écrire `stage.pose = { dof: 0, ...cam, drift: 0 }` (comme `cover.mjs`).
- `CLAUDE.md` : le texte ci-dessous.

## 9. Pour `CLAUDE.md` (à intégrer par celui qui orchestre)

Dans « L'accroche, c'est 99 % du travail », après « La première image est la plus forte du film » :

> **La première image se note sur six points** (courbes du 015 et du 012, 21/10 : les deux perdent la moitié du public à 0:01, le 015 tient 59 % à 0:07 contre 52 % à 0:09) : un événement déjà en cours, pas un état ; une perspective basse qui tire l'œil ; la menace derrière le sujet, qui s'y découpe ; une forme reconnue en un tiers de seconde, vue d'où on ne la voit jamais, sur 40 % de la largeur ; le système déjà là, petit mais lisible ; et elle bouge dès l'image 1 par son sujet, pas par la seule caméra (« rythme » de `qa` : 9,8 au 015, 1,4 au 025). Détail : `docs/recette-agents.md`.

Dans « L'image », après le paragraphe du plateau :

> **Les options du plateau** (21/10, `docs/scale/2-rendu-decors.md`) — éteintes par défaut, une ligne dans `world.js` (`LOOK`) : `dof`, l'optique (profondeur de champ par accumulation, gratuite), **donnée aux seuls gros plans** (`...CLOSE` dans leurs poses ; jamais un plan large, un éclaté, une chute, ni l'accroche si elle n'y gagne pas ; jamais au-dessus de 10) ; `finish`, la matière des pièces pleines (grain d'usinage, traces), visible en plein écran ; `air`, la lumière qui reste dans l'air derrière le sujet, pour un vrai contre-jour seulement (essayé sur le 025 : pas de gain, éteint ; sur l'établi il grise le vert). Merwan, 21/10 : « la version là est déjà très bien » — une option n'entre que si la planche avant / après (`SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look` pour l'avant) montre un gain net à 270 px. Coût mesuré : ≈ +10 à +20 % par image, aucune passe de plus.

## 10. Pas fait, et pourquoi

- **La couverture** : passée après le 025 (consigne). `cover` sait maintenant écrire un essai hors de `renders/` et reste nette par défaut ; mes options n'apportent rien à une vue éclatée réduite à une case de grille (l'optique la rendrait moins lisible, la matière ne se voit pas à cette taille). Une meilleure grille se gagnera sur la composition, avec la règle de la première image.
- **Occlusion ambiante** : une passe de normales à chaque instant de l'obturateur (×16) pour un manque que les planches du 025 ne montrent pas — les ombres de contact y sont déjà.
- **Étalonnage par acte** : `setMood` le fait déjà (veille / signal, franc) ; rien vu qu'un étalonnage corrigerait sans risque.
- Images lues : 20 lectures sur 40 (dont les deux captures de courbes et une image ratée) — mais ce sont des planches : compté en vignettes, ≈ 100. Temps : ≈ 1 h 15.
