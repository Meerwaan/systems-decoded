# 041 · habillage.js — journal (décorateur)

## Lu
recette-decorateur, regles-image, recette-agents (cadre, première image, économie), 041-actes (haut, plans, candidates), 041-actes-maj, plan.js, world.js, journal 041-station, details.js (tête, exports, `done`/`update`), sky.js du 026 (dôme : la Terre de studio, `KAPPA`, ce que fait `flown` — rien sur la Terre), station.js (tête, `update`, racks).

## Constat sur la planche avant (`.cache/planches/041/habillage/avant.jpg`, 8 images)
- La Terre (dôme du 026) est un disque gris sombre, ses bandes de nuages fixes en azimut : **rien n'y bouge avec `flown`** (dans le 026, `flown` ne pilote que les traînées d'air). Elle tient 30 à 45 % du cadre dans `whole`, `front`, la fin vue de l'arrière, et le bas de `cabin` (sous toi, à travers le verre).
- L'image 0 (`POSE0`) regarde vers le haut : la Terre n'y est pas. Le labo sous toi est un vide de verre et d'anneaux.

## Touches posées (`src/habillage.js`, `dressStation()`)
1. **Les villes la nuit** (suit `flown`, km) : un second dôme à l'infini juste après celui du 026 (ordre −49, additif), même géométrie de studio (limbe, `KAPPA`) ; chaque rayon retombe sur le sol (km depuis le point sous la station, le long de son azimut), décalé de `flown` vers −x : le sol glisse vers +x, la station vole vers −x. Trois niveaux (villes 95 km, villages 24 km, hameaux 7 km), des terres et des mers (bruit à l'échelle d'une côte), des villages groupés. Une lumière garde sa vraie empreinte (écrasée vers le limbe) tant qu'elle tient 1,3 px de rayon, sinon un point rond de 1,3 px de même énergie ; chaque niveau part avant que ses cellules passent sous 6 px ; l'air du limbe les avale. Cœur ≤ 0,8 × ink.
2. **Les nuages de la nuit** (suit `flown`) : fbm à 700 km, ses octaves fines partent avant de grouiller ; 0,032 × ink, ils éteignent aux trois quarts les lumières dessous.
3. **La gourde** que tu as bue avant de dormir (10 × 16 cm, sa paille), sous ta tête, plus loin dans le labo que toi.
4. **Un sac de cargo** déballé ce soir (50 × 25 × 42 cm, sa fermeture, sa poignée), sous tes pieds.
5. **Le classeur des procédures**, ouvert, trois feuilles en éventail, plus loin.
Les trois objets : verre et traits fins (`glass` sans `asShell` : un shell découpait leur forme dans le verre du labo derrière eux → des carrés sombres ; dessinés tôt, additifs, ils ne font qu'ajouter leur liseré), ink, une dérive de 2 cm et 3 à 5° sur 11 à 14 s, rien ne tourne. Ils suivent `shell` (le labo s'efface, eux aussi), `dodge` (ils vont où va la station), `bench` (cachés), et **s'effacent quand la caméra passe à moins de 40–130 cm** (le plongeon de 43,28 et l'entrée dans la cabine traversent le labo).

## Planches
- `apres.jpg` (8) : lumières trop rares et trop faibles, nuages en grain sale ; les objets en carrés sombres (shell).
- `apres2.jpg` (6, 405 px, zones) : objets lisibles mais le sac et le classeur au bord de la colonne des boutons → déplacés à gauche ; les lumières en traits horizontaux (taille mini prise sur la pire direction) → empreinte vraie ou point rond (jacobien) ; `flown` 2 → 32 : le sol a bien glissé.
- `apres3.jpg` (2, 405 px) : image 0 — rien devant toi ni devant la tôle, la traînée de la bille dégagée, les trois objets en bas à droite et à gauche, plus pâles que toi : au moins aussi forte. `whole` : la Terre de nuit piquée de lumières, écrasées vers le limbe.
- `npm run check -- 041` : passe (1 ⚠ de contraste sur l'en-tête à 5,16 s, déjà là avant l'habillage : pose des squelettes).

## Positions (repère du labo, cm) et où elles tombent
- gourde [10, −88, −92] · sac [135, −95, −110] · classeur [225, −45, −200].
- Image 0 (vignette 270) : gourde (55, 318), sac (167, 329), classeur (189, 289) — sous toi, hors du trajet de la bille (de la tôle (93, 193) vers le haut à droite), hors de la colonne des boutons. Dans `cabin`, seule la gourde, tout en bas (sous 1600).

## À changer ailleurs
- `src/acte2b.js` : `st(t.repos, t.tozero - t.repos, { flown: 50 }, "none");` (au lieu de 30 : 7,66 km/s, la vraie vitesse de l'ISS, sur les 6,6 s du repos).
- `src/fin.js` (le plan de la station, de `toverdict` à la coupe du like) : `st(t.toverdict, t.like - 0.12 - t.toverdict, { flown: 175 }, "none");` — sans elle, la Terre est figée pendant toute la chute et le commentaire.
- Acte 1 et acte 3 (temps ralenti, µs) : `flown` ne bouge pas, c'est juste.

## Ce qui n'est pas au niveau
- Les lumières vers le limbe sont des tirets (empreinte vraie, rasante) : juste, mais à 270 px elles se lisent « des lumières sur une planète » plus que « des villes ». Pas d'ambre : ink seul.
- Le défilement n'est vu que sur deux images fixes (2 → 32 km) : le brouillon et `qa` diront s'il reste une image parasite quand `flown` court (les points ne passent jamais sous 1,3 px, les niveaux partent avant de grouiller).
- Coût : le dôme de nuit refait 27 cellules et 6 bruits par pixel de Terre ; `look` sur GPU : 13 → 23 ms par image (médiane). À surveiller si le rendu tourne en logiciel.

## Catalogue
- `041/habillage.js` — la Terre de nuit vue d'orbite posée sur le dôme du 026 (villes, villages, mers, nuages, qui glissent avec `flown`) et trois objets qui flottent dans un labo (gourde, sac de cargo, classeur ouvert). `import { dressStation } from "../../041-bouclier-iss/src/habillage.js";` — `nightMat()` peut monter dans `kit/lib/details.js` au prochain dossier en orbite.

Images lues : 24 (8 + 8 + 6 + 2). Appels : ≈ 25.
