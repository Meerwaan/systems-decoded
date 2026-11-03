# L05 · habillage.js — journal du décorateur

Agent décorateur, 2026-11-02. Fichier : `episodes/L05-hudson/src/habillage.js`, accroché à `hudson.js` (3 lignes : l'import, `const dress = dressHudson({ list, boats }); group.add(dress.group);` après les bateaux, `dress.update(p, time, px, ctx)` à la fin de `update`). `avion.js` et `systemes.js` : non touchés.

## Lu
recette-decorateur, recette-agents (cadre, première image, économie), regles-image, L05-actes (haut + liste des plans), world.js (FIRST, POSE0, VIEW, apply), plan.js (GEO, PATH), journaux hudson et avion, details.js (tête), hudson.js (tête, `buildHudson`).

## Planche avant (8 : hook1, over860, descent, toWater, water, wing à flot, ferries, runway)
Le lieu est juste mais sans air : la ville en rangées plates, le fleuve vide, le mur de Midtown sans vie, les ferries posés comme des jouets. Ni froid ni hiver à l'image hors de la buée `cold`.

## Touches posées (raison → nombre suivi)
1. **La vapeur sur les toits** (−7 °C : chaque chaufferie, chaque tour fume ; panaches qui montent, se couchent vers le sud-est sous le vent de nord-ouest, se défont) : 34 grands panaches sur les toits des tours (> 90 m) et 520 petits sur les toits de 14 à 40 m, tirés de la vraie liste des blocs (`list`) : jamais un panache qui flotte. Ruban tourné vers la caméra autour de son axe courbé, cœur doux, nuages qui montent lentement (bruit à grande maille : rien ne scintille), ≥ 3 px de large, brouillard du monde. Suit `city` (et le sol qui s'efface sous `high`), un peu plus fort avec `cold`. renderOrder 13 : après la passe de profondeur des blocs, une tour cache le panache derrière elle.
2. **L'échappement des ferries** (un catamaran diesel dans le froid : un souffle blanc court à l'arrière ; ils sont arrivés à pleine puissance) : un panache par bateau, enfant du bateau, au sommet de sa superstructure côté poupe, le vent recalculé dans le repère du bateau. Suit l'arrivée du bateau (`boats`, via l'opacité de son sillage `uAmt`).
3. Essayé puis **retiré** : la circulation (West Side Highway, FDR, tablier du pont George-Washington) en petites lumières qui avancent — invisible dans tous les plans essayés (première passe dessinée sous le dôme ; corrigée, toujours rien de lisible à 270 px). Un coût sans image : sorti.

## Réglages qui ont raté
- r1 : panaches trop fins et trop courbés → crochets blancs nets sur le mur de Midtown et au-dessus des ferries ; trop peu nombreux pour se voir de haut. → plus larges, courbure 0,3–0,65, cœur plus doux, bruit au carré ; ferries : 11–13,5 m, courbure 0,7, k 0,26.
- r2 : ferries et Midtown justes (souffles doux) ; over860 et descent : rien. → 520 petits panaches au lieu de 90.
- r3 : toWater : les panaches se découpent sur la silhouette de Manhattan, à droite — gagné. over860, descent : toujours rien de lisible (les rangées du Bronx sont plus basses que 14 m : le filtre `low` ne les prend pas ; et à 2–10 km un panache de 60 m reste un frottis). Pas de reprise à l'aveugle (budget d'images atteint).

## Image 0
`hook1` identique à 270 px avant / après (le sol est noir sous l'aile, rien n'y entre) : au moins aussi forte. Rien devant les oies ni le moteur.

## Ce qui n'est pas au niveau
- La vapeur ne se voit pas dans les plans hauts (over860, descent, et donc le Bronx de l'accroche) : elle paie dans water, toWater, ferries (et runway, où Manhattan est au fond — non vérifié). Pour over860 : prendre aussi les rangées basses (`b[4] + b[6] > 700`) avec des panaches de 15–30 m, à juger sur planche.
- Le brouillon `qa` n'a pas été vu : le bruit monte à 0,11 maille/s, les panaches des ferries suivent le roulis (≤ 1,2°) : à confirmer sans image parasite.

## Planches (`.cache/planches/L05/habillage/`)
`avant.jpg` · `apres.jpg` (r1) · `r2.jpg` · `r3.jpg` · `apres-final.jpg` (l'état rendu, mêmes 8 instants, non relue : budget). Images lues : 24.

## À changer ailleurs
Rien d'obligatoire. (Les trois lignes dans `hudson.js` sont posées.)

## Pour docs/catalogue.md
- **Vapeur de toits et d'échappement** `L05/habillage.js` — `plumeGeo(src)` + `plumeMat(k)` : panaches de vapeur en rubans tournés vers la caméra autour d'un axe courbé par le vent, bruit qui monte lentement, ≥ 3 px, brouillard du monde ; posés sur de vrais toits (liste de blocs) ou à l'arrière d'un bateau. Resservira pour toute ville en hiver ou tout navire (à monter dans `details.js` au deuxième usage).
