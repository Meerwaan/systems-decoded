# 038 · `src/sousmarin.js` — journal du décor

## Lu
recette-agents, regles-image, 038-decors (haut + ma section), plan.js, world.js (FIRST, VIEW, apply), bouchon, build3d (solid/glow/glass/asShell/lineMat/fatLine/makePart/addMesh/setPartOpacity), figure.js (makeFigure, reach, leg, ghost), finish.js (userData.finish).

## Choix de construction
- Coque légère : quatre peaux de verre (`skin` maison, une rangée par station) dans UNE coque `asShell` : la proue (0 → 11 m, déformable), l'avant en trois tuiles (haut bâbord, haut tribord, bas : ce sont les panneaux de l'éclaté), le reste. Membrures : anneaux `Line2` tous les 4,5 m ; quatre lignes longitudinales (dos, quille, deux flancs).
- Proue écrasée : déformation CPU de la peau de la proue (rayon seulement : l'avant reste au contact de la roche, `gap` 0 suffit), normales recalculées sans allocation, seulement quand `crush` change. Plis en accordéon (période 1,15 m) + bosses semées, face avant aplatie. Sept anneaux de plis signal qui naissent avec `crush`, inclinés au hasard (froissé).
- Ballasts : demi-coquilles pleines (paroi intérieure, paroi extérieure, fonds, joints haut/bas). Les deux bâbord (côté caméra) ont une **fenêtre** dans la paroi extérieure : dedans, l'eau (sombre) et l'air (vert) coupés au niveau par un `discard` (onBeforeCompile, `finish` éteint sur eux), la surface libre en trait veille.
- Air dans les tuyaux : un manchon (TubeGeometry) au shader propre, tirets larges en centimètres qui courent à 240 cm/s (période 90 cm : 8 cm par image, < 1/7), une tête claire au front. Dosé < 3.
- Bulles : InstancedMesh (3 gerbes × 40), shader de bord clair (une bulle, pas un disque), périodiques.

## Ce que font les nombres (chez moi)
- `bench` : l'équipage caché, l'éclaté permis ; `hull` : verre de la coque légère, du kiosque, des barres, de l'hélice, membrures et lignes ; `inner` : coque épaisse (et ses anneaux), poste (pont en traits, pupitres, sièges) ; `crew` / `jolt` : cinq hommes de verre, basculés vers la proue (10° assis, 24° debout, mains qui se rattrapent) ; `crush` : peau de la proue déformée (plis, face aplatie, nez qui pique de 45 cm), sept plis signal, méridiens et anneaux du nez qui s'effacent, sphère sonar qui se fend (fêlure signal), trois déchirures (trou sombre + lèvre signal) ; `press` : cinq anneaux de dix flèches signal qui se resserrent ; `weight` / `lift` : grandes flèches qui s'allongent ; `explode` (établi seul) : proue −6,5 m et +2,6 m, tuiles hautes de l'avant +7,6 m (bâbord +3,3 m z, tribord −4,2 m z), kiosque +10,5 m, ballasts ±3 m (avant) / ±2,5 m (arrière) et −0,4 m, les tés s'étirent avec eux, membrures et lignes s'effacent ; `cmd` : le capot se lève (0 → 0,45) puis la poignée bascule et verdit (0,45 → 1), la lampe et le fil de commande verdissent (0,6 → 1) ; `valves` : quart de tour, poignée verte ; `bank` : lueur verte des bouteilles ; `flowF` / `flowA` : le front d'air court du robinet au té, puis dans les deux branches, puis coule ; `airF` / `airA` : niveau de l'eau qui descend dans les fenêtres bâbord, le vert au-dessus ; `leak` : 3 × 40 bulles ; `cube` : traits (0 → 0,15), le cube vert pousse (0,25 → 0,5), l'eau descend et sort (0,4 → 1) ; `heart` : tout s'efface à 18 % sauf le ballast avant bâbord ; `speed` : hélice + 18 traînées d'eau ; `lit*` : émission veille faible.

## Planches (28 images lues)
- p1 : coque tenue par ses arêtes ; proue écrasée = soufflet trop régulier ; verts qui bavent (bouteilles, commande, air plat) ; éclaté illisible de `VIEW.exploded` (az 40 : le chemin de l'air couché en travers d'un cadre étroit).
- p2 : éclaté vu presque dans l'axe d'en haut (az 64, el 38) : le chemin bouteilles → tuyau → ballasts monte dans le cadre — lisible. Cœur lisible à d 2700 (fenêtre : eau sombre, air vert, trait de surface). Plancher du poste en verre = dalle blanche → remplacé par des traits.
- p3 : bouteilles lisibles d'en haut (six, collecteur, vannes) ; flèches de pression lisibles de loin ; commande lisible (capot levé, poignée verte, tête du chef en bas à gauche).
- p4 : climax : panache de bulles à l'avant + vert à l'arrière dans le même cadre ; cube : traits blancs, le cube vert pousse dessus ; équipage lisible seulement à d 1150.

## Poses qui cadrent (essayées)
- bottles : `{ ...P, ...CLOSE, tx: BANK.x, ty: BANK.y, tz: 0, d: 2300, az: 38, el: 26, fov: 34, shift: 60 }` (le sujet est haut à gauche : `shift` −60 à essayer)
- crew : `{ ...P, ...CLOSE, tx: -2800, ty: 40, tz: 0, d: 1150, az: 30, el: 12, fov: 36, shift: 60 }`
- exploded : `{ ...P, tx: -2600, ty: -250, tz: 0, d: 9800, az: 64, el: 38, fov: 32, shift: 0 }` (les bouteilles tombent vers y 1570 : `shift` 150 à essayer)
- tank : `VIEW.tank` avec `d: 2700, shift: 60` ; cube : `VIEW.cube` avec `d: 1300, el: 10`
- impact : `VIEW.impact` ou `az: 40, d: 3800` (les plis devant, la roche derrière) ; climb : `VIEW.climb` avec `d: 21000` ; mass, press, cmd : `VIEW` tel quel.

## Pas encore au niveau
- L'accroche vue de derrière (`underB`) : le dôme de verre vu de dos se lit comme l'embouchure d'un tube. Les candidates de flanc (`bowD`, `underA`) devraient mieux lire le nez — pas vérifié.
- La proue écrasée se lit « pliée, en accordéon » plus que « canette » : les plis sont des anneaux.
- L'équipage reste petit et de verre ; le `jolt` ne se lit qu'en plan serré.
- Pas regardé : `VIEW.aft`, `torn`, `blow`, `surface`, `float`, `weight` + `lift` ensemble.

## À changer ailleurs
- `episodes/038-sous-marin/src/world.js`, dans `VIEW` :
  - `bottles: { ...P, ...CLOSE, tx: BANK.x, ty: BANK.y, tz: 0, d: 2300, az: 38, el: 26, fov: 34, shift: 60 },`
  - `crew: { ...P, ...CLOSE, tx: -2800, ty: 40, tz: 0, d: 1150, az: 30, el: 12, fov: 36, shift: 60 },`
  - `exploded: { ...P, tx: -2600, ty: -250, tz: 0, d: 9800, az: 64, el: 38, fov: 32, shift: 150 },`
  - `tank: { ...P, ...CLOSE, tx: TANKF[0], ty: TANKF[1], tz: TANKF[2], d: 2700, az: 30, el: 14, fov: 32, shift: 60 },`
  - `cube: { ...P, ...CLOSE, tx: CUBE.at[0], ty: CUBE.at[1] - 60, tz: CUBE.at[2], d: 1300, az: 22, el: 10, fov: 32, shift: 140 },`
- `src/mer.js` (son agent) : un débris de roche en fil de fer tombe DANS le poste de conduite (plan `crew`) : aucun débris à moins de 7 m de l'axe du bateau.
- `episode.json` → `cover.cam` : prendre la pose `exploded` ci-dessus avec `el: 30`, `shift: -430` à revoir sur la couverture (l'ancienne couche le chemin de l'air en travers).
