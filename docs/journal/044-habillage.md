# 044 · habillage.js — journal du décorateur (la rue de cité, la nuit d'émeute)

Décorateur, 08/11. Fichier : `episodes/044-gilet-pare-balles/src/habillage.js` ; décor habillé : `src/rue.js` seulement (rien sur `gilet.js`). Planches : `.cache/planches/044/habillage/`.

## Lu
recette-decorateur, recette-agents (cadre, première image, économie), regles-image, 044-actes (haut, plans, candidates), journal 044-rue, plan.js (STREET, RIOT, WALK), world.js (POSE0, VIEW), en-tête de details.js et build3d (glass, lineMat, mergeGeometries).

## Planche avant (8 images, `avant.jpg`)
Instants où la rue se voit : 0,02 POSE0 · 9,5 night · 11,5 shot · 13 track · 15 ahead · 40 rest · 42,6 faceRue · 61,5 home. Le vide : la chaussée, noire sous tous les plans de rue (moitié basse de night, shot, track, ahead, home) ; le plan qui suit la balle n'a derrière elle qu'un mur rouge plat ; le ciel au bout de la rue est noir derrière la foule.

## Les touches (trois)
- **Pierres et pavés sur la chaussée** (`shell`) — « Tu crois à une pierre » : la nuit en a jeté des centaines. au plus 92 tirages, ≈ 70 posés après les exclusions : des pierres de 5 à 10 cm et ≈ 15 pavés de 14 cm, verre facetté (icosaèdres / dodécaèdres aplatis) et arêtes fines pour les pavés ; plus denses vers les feux, quelques-uns devant la poubelle qui brûle (derrière lui dans les plans serrés), quelques-uns vers chez lui. Aucun à moins de 2,6 m de lui, sur les trottoirs, sous un feu ou sur son chemin du retour (`WALK`).
- **L'abribus à la vitre étoilée** (`shell`), trottoir d'en face (z −505 → −628), x −1 550 → −1 150 : cadre, toit, banc, vitres de verre, une étoile de fissures sur la vitre de l'amont. Il est derrière la balle quand la caméra file à côté d'elle (12 → 15 s), là où il n'y avait qu'un mur rouge ; l'étoile se voit au bord droit du plan `shot` (11,5 s).
- **La lueur au bout de la rue** (`riot`, signal : c'est la menace) — le ciel éclairé d'en bas par des feux hors champ : l'émeute est plus grande que cette rue. Un halo calculé dans son shader, 42 × 15 m, posé sur l'horizon à x −8 000 : le point de fuite rougeoie derrière la foule, qui s'y découpe en silhouettes sombres. Ne se voit qu'en regardant vers le haut de la rue : jamais dans POSE0, jamais sur l'établi, jamais dans l'en-tête (vérifié avec les zones).

## Déroulé
- Planche après v1 (8) : le halo du ciel trop haut et trop large (un voile en haut à gauche de `night`, jusque dans l'en-tête) ; les pierres en verre fin lues comme des anneaux ; les montants intérieurs de l'abribus passaient derrière la balle.
- v2 : halo 42 × 15 m centré à 1,8 m de haut (sur l'horizon), pierres plus grosses et plus pleines de verre (base 0,015, bord 0,16), montants intérieurs retirés, lignes plus sombres (cadre 0,28, pavés 0,2). Planche de 4 à 540 px : l'image 0 est la même (deux cailloux aux coins bas, sous y 1 600) ; `night` gagne une vraie profondeur (le bout de la rue brûle, la foule en ombres) ; `track` a un lieu derrière la balle ; `ahead` a un sol.
- Planche avec zones (4) : rien dans l'en-tête ; l'étoile de l'abribus de `shot` est au bord droit, juste au-dessus des boutons.
- `npm run check -- 044` passe. **24 images lues.** `apres.jpg` (8, 270 px, mêmes instants qu'`avant.jpg`) retirée après la v2, non relue (budget atteint).

## Les trois lignes dans rue.js
- l. 41 `import { dressRue } from "./habillage.js";`
- l. 898 `const dress = dressRue(); group.add(dress.group);`
- l. 1502 `dress.update(p);` (dans `update`, avant `/* him */`)

## Pas au niveau
- Depuis le haut (`home`, 61,5 s) les pierres se devinent à peine.
- Dans `track`, les montants d'angle de l'abribus (deux paires) glissent derrière la balle une fois chacun : traits sombres et fins, mais à surveiller au brouillon.
- Le mur rouge plat de `ahead` / `gilet` (15 s) reste : c'est la nappe de la poubelle sur la façade, dans rue.js.

## À changer ailleurs
- (rue.js, à essayer sur planche, non testé) la nappe de la poubelle proche sur la façade d'en face, pour qu'elle ait un endroit au lieu d'un mur plat derrière « Devant elle, ton gilet » : dans la boucle des feux, `axes: [[950 * s, 0, 0], [0, hgt / 2, 0]]` → `axes: [[(f.i === 0 ? 520 : 950) * s, 0, 0], [0, hgt / 2, 0]]`.

## Pour le catalogue
Deux briques qui resserviront (une rue après une émeute, une route après un séisme, un horizon qui brûle) : `rubble({ min, max, n, r, paver })` et une `glow` à couleur et taille elliptique (`{ color, size: [w, h] }`), toutes deux écrites dans `habillage.js` du 044.
