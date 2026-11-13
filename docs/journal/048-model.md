# 048 · model.js — le tunnelier (journal)

Agent décor, 13/11. Fichier : `episodes/048-tunnelier/src/model.js`. Planches : `.cache/planches/048/model/`.

## Fait
- Lu : recette-agents, regles-image, 048-decors (haut + model.js), plan.js, world.js, bouchon, build3d, finish.js.
- Décisions avant d'écrire :
  - Manomètre : sa console au bouchon tombait devant les vérins (planche p1 de l'architecte) et son cadran (x 288 → 372) aurait traversé la cloison (x 240 → 300). Déplacé sur une console à l'arrière de la cloison, côté +z, sur un panneau sombre qui masque ce qui est derrière lui : centre du cadran [372, AY + 230, 344]. model.js lit sa propre constante `GAUGE` ; plan.js doit suivre pour que `VIEW.gauge` / `gaugeBench` visent juste (voir « À changer ailleurs »).
  - Cadran clair sans aucun chiffre, graduations muettes, bande veille au sommet, aiguille sombre (lisible sur le clair) ; le verdict se lit sur la couronne du cadran : veille dans la bande, signal dehors.
  - Cote : à côté de la roue (z = +600, côté caméra), avec ses lignes de rappel depuis la jante — un trait clair en travers de la roue claire ne se lirait pas.
  - Flèches de pression à z = +500 (devant la roue, côté caméra) : sinon cachées dans la roue entière. Rouges et vertes de 240 cm, pointes sur x = 0 à `hold` 1 ; au-delà, les vertes passent la face et repoussent les rouges d'autant.
  - Terre de la chambre : un shader (niveau + dômes sous la voûte, grain), moitié proche à part pour `cutaway`.

## À changer ailleurs
- `episodes/048-tunnelier/src/plan.js`, ligne `bulkhead:` →
  `  bulkhead: { x0: 240, x1: 300, sensors: 5, gauge: [372, -1591 + 230, 344], gaugeR: 42 },`

## Construit
Roue (jante, 6 rayons, 6 tôles à fente radiale, moyeu à nez, 111 molettes sur 18 lignes en spirale avec leurs logements, 26 racleurs, arbre central et deux bras malaxeurs) ; terre de la chambre (shader : niveau, dômes sous la voûte, grain qui s'efface au pixel ; moitié proche à part) ; cloison (flasque, entraînement principal, 7 moteurs, sas, 5 capteurs à tête veille, console + manomètre) ; vis (carter à fenêtre +z et lèvres claires, spire hélicoïdale, mottes de terre qui montent d'un pas par tour, goulotte et moteur) ; bouclier (deux moitiés tournées, joint d'articulation, bride, liseré encre sur la tranche de la coupe) ; 28 vérins (corps qui suivent le bouclier, tiges qui s'allongent, sabots fixes sur l'anneau) ; érecteur (couronne, bras, tête) ; anneau de 7 voussoirs (posés : radier, puis les côtés, les deux du haut en dernier) ; 5 flèches rouges + 5 vertes à z +500 ; cote à z +600 avec lignes de rappel et pointes.

## Poses (planches p1 à p4 ; coordonnées du plan, établi = point − BENCH_FROM)
- `whole` : `{ tx: -150, ty: 520, tz: 0, d: 4800, az: -48, el: 12, fov: 30, shift: 120 }`
- `exploded` : `{ tx: -50, ty: 620, tz: 0, d: 6400, az: -60, el: 15, fov: 30, shift: 120 }` (celle de VIEW, tx 250 d 7400, coupe la roue et rapetisse tout)
- `headBench` (explode 1, cote 1) : `{ tx: -1100, ty: 491, tz: 150, d: 3300, az: -62, el: 8, fov: 28, shift: 100 }` — à d 2400 la cote sort du cadre
- `gaugeBench` : `{ tx: -238, ty: 721, tz: 344, d: 420, az: -24, el: 8, shift: 130 }` (une fois GAUGE recopié dans plan.js, `BGX + 120` → `BGX`)
- `gauge` (coupe) : `{ tx: 372, ty: AY + 230, tz: 344, d: 380, az: -24, el: 8, shift: 120 }` ; variante de dos, la console sur la cloison : `{ tx: 150, ty: AY + 100, tz: 0, d: 2000, az: 22, el: 14, fov: 30, shift: 60 }`
- `profile` : `{ tx: 250, ty: AY - 40, tz: 0, d: 3300, az: -2, el: 5, fov: 30, shift: 100 }` — **az entre −4 et +4** : la roue et la cloison restent entières, de trois quarts elles cachent la chambre. La machine (12 m) ne tient pas en largeur dans un cadre vertical : ce cadre montre roue, chambre, cloison, manomètre, entrée de la vis, vérins.
- la chambre de près (niveau de la terre) : `{ tx: 150, ty: AY, tz: 0, d: 1900, az: -3, el: 4, fov: 30, shift: 60 }`
- `principle` : `{ tx: 20, ty: AY, tz: 300, d: 2600, az: -8, el: 4, fov: 30, shift: 100 }` — flèches rouges et vertes bien lisibles, pointes sur la jante proche
- `rear` : `{ tx: 950, ty: AY, tz: 0, d: 3400, az: 55, el: 12, fov: 32, shift: 100 }` — **az −140 de VIEW n'est pas l'arrière** (caméra à −x, −z : l'avant côté loin) ; l'arrière côté coupe, c'est az +40 à +60
- `face` (VIEW) et `POSE0` : bons tels quels, la roue claire se lit sous la voiture

## Planches
- p1 : manomètre parfait (cadran clair, aiguille sombre, bande et couronne veille / signal) ; profil de VIEW trop à droite (la roue hors cadre) ; principe de VIEW trop à gauche.
- p2 : la cloison et la roue entières cachent la chambre dès az −14 → poses de profil à az −2 ; flèches à `hold` 1 et 1,4 : nettes ; molettes trop brillantes (taches blanches) → rough 0,5, métal 0,3 ; cote trop fine → 8 cm.
- p3 : profil az −2 OK ; terre à 0,2 éclairée trop verte → `litChamber` 0,11 ; anneau allumé qui sature → 0,45.
- p4 : la coupe de la terre, dans l'ombre de la roue, était brun sombre sur sombre → la terre ne reçoit plus d'ombre et éclaircie (0x7d5a3e) — **non revérifié à l'image** (budget d'images dépassé : 32 lues).

## Pas encore au niveau
- La terre de la chambre en gros plan : correctif d'ombre posé sans planche de contrôle.
- Les deux bras malaxeurs et l'arbre central sont sombres dans la chambre (dans l'ombre de la roue) quand la terre baisse.
- La vis soulevée sur l'éclaté reste un tube fin à 270 px.
