# 041 · station.js — journal (décor)

## Lu
recette-agents, regles-image, 041-decors (haut + § station.js), plan.js, world.js, bouchon station.js, build3d (solid/glass/asShell/lineMat), figure.js (makeFigure, reach, leg, lean, ghost), atmo (makeContact, makePool), 026 sky.js (makeGlow), 025 route.js (makeSprites), 023 avion.js (idiome des traits LineSegments2).

## Plan de construction
- Coques de verre (`glass` + `asShell` ordre 20) de tous les modules en une géométrie (le labo percé de sa fenêtre ±20 cm autour de l'origine) ; capsules à part (même ordre) pour `capsules`.
- Traits : anneaux et lisses en LineSegments2 (≥ 1,8 px) ; poutre en treillis ; ailes en shader (remplissage + cellules qui fondent avec `fwidth`).
- Bouclier : coque de tôle à +11,4 cm (verre ordre 22) + panneaux en trois groupes (avant/flancs, milieu, nadir) : `ram` épaissit l'avant, pâlit le nadir.
- Toi : `makeFigure` (ordre 10) bras flottants, sac de verre dense (ordre 14), respiration 4,2 s ; l'air : volume analytique (rayon-cylindre) plus dense côté +z, ordre 16 (la silhouette du dormeur se découpe dessus).
- Équipage : six figures pâles (`ghost`), chemins par les écoutilles vers Dragon (4) et Soyouz (3).
- Esquive : deux jets ink à l'arrière du Progress ; débris de passage en tête lumineuse + traîne (shader de traînées instancié) ; Kosmos : satellite, éclair, 1 500 traînées.
- Char du 042 : coque, chenilles, tourelle, canon en verre et traits, trois scellés ink, le toit de la tourelle en veille, une plaque de sol.

## Journal
### Planche 1 (8 images, `.cache/planches/041/station/p1.jpg`)
- ✓ `whole` : l'ISS se reconnaît (poutre en treillis, quatre paires d'ailes à cellules, modules verts) sur le limbe. ✓ Kosmos depuis l'arrière : la gerbe de traînées signal se lit (mais dans la zone de l'en-tête : cadrer plus bas). ✓ char : roues, scellés, toit veille.
- ✗ `POSE0` / `lab` : Columbus (côté +z dans plan.js) est à 1–1,5 m de la caméra → de grands tubes en avant-plan ; le dormeur, vu par la tête (az −62, corps le long de x), est raccourci et illisible.
- ✗ bouclier à 1 : une cage verte (anneaux tous les 1,1 m, 12 lisses, trop brillants). ✗ l'air : un voile gris sur toute la cabine. ✗ débris de passage et jets : invisibles à 270 px. ✗ `shelter` (d 7200, az −34) : la caméra est dans les ailes et la poutre +z.
- Décision : chaque module latéral, chaque paire d'ailes, chaque jeu de radiateurs et la poutre extérieure **s'effacent seuls quand la caméra s'en approche** (matières par partie, distance œil–axe) ; bouclier allégé (anneaux 1,6 m, 8 lisses) ; air concentré contre la paroi +z ; débris ≥ 14 px et traîne de 8 px ; jets plus longs (6,2 m).
### Planches 2 à 4 (22 images ; `p2.jpg`, `p3.jpg`, `p4.jpg`)
- Les parties qui s'effacent seules marchent : Columbus ne bouche plus `POSE0`/`lab` ; les ailes et la poutre +z sortent de `shelter`.
- Le dormeur **couché sur le dos, la face vers +y, le flanc droit contre la paroi +z**, bras flottants vers le haut : vu de profil du dehors comme de la cabine (de face par la tête à az −62 il était illisible). Mains en verre, tête pleine (la vie que le bouclier protège). Verre du dormeur `glassK` 1,25.
- L'air : un halo autour du dormeur (gaussienne centrée sur le milieu de `SLEEPER`, rayons 170/110/95 cm) + 6 % partout ; le dormeur s'y découpe en sombre. Dosé 0,18.
- Bouclier : coutures fines qui passent à veille, la tôle du labo (verre, ordre 22) porte la couleur ; `ram` : avant/flancs 2 → 3,4 px et plus brillants, nadir à 30 %.
- Abri : pendant que les sept flottent (`shelter` 0,02 → 0,88) le verre de la station recule de 55 % (pas les capsules) : les silhouettes se lisent ; écoutilles veille à `shelter` ≥ 0,88. Équipage : têtes et mains pleines (des gens, de loin), verre `glassK` 1, plus clair pendant le trajet.
- Kosmos : satellite qui tourne lentement (petit mais lisible), éclair signal à 0,3 (cœur ≤ 2,9), nuage de 1 500 traînées en gerbe.
- `npm run check -- 041` : passe (2 ⚠ de contraste sur l'en-tête à 5,16 s : ce qui est derrière le HUD à cet instant — pose de l'acte 1).

## Ce qui n'est pas encore au niveau
- `POSE0` tel qu'écrit (d 1150, az −62) : le dormeur est petit et le coupon le cache en partie ; meilleur : `a2` ci-dessous (le sac horizontal, la tête à côté du coupon, la traîne de la bille à droite). La première image reste à choisir sur la planche des quatre (actes).
- Vue `cabin` : les bras levés sortent en bâtons sombres sur le halo (la silhouette coupe l'air) ; lisible, pas encore beau. Piste pour un retoucheur : bras moins levés (mains vers la poitrine) ou air dessiné avant la coque du dormeur (`air.renderOrder` 8 : plus de silhouette).
- `shelter` : un seul cadre ne tient pas Dragon ET Soyouz avec des personnages lisibles (36 m entre les deux) : deux poses (ci-dessous).
- Nuage de Kosmos : `KOSMOS.along` est presque dans l'axe de la caméra quand on regarde depuis l'arrière de la station → une gerbe radiale (lisible, spectaculaire) plutôt qu'une traînée « le long de l'orbite ».
- Esquive à `VIEW.whole` (d 26 000) : 5,2 m de `dodge` ne se voient pas ; la traîne du débris (≥ 15 px, 8 px de large) et les jets (6,2 m) se lisent.

## Poses qui cadrent (prêtes à coller)
- `a2` (première image, candidate a revue) : `{ tx: 80, ty: -20, tz: -40, d: 900, az: -34, el: -6, fov: 44, shift: -40, side: 0, roll: 0, drift: 0, dof: 0 }` (état `dist` 220, `trail` 1).
- `cabin` (tel quel) : `{ tx: 70, ty: -8, tz: -60, d: 330, az: -130, el: 14, fov: 40, shift: 0, … }`, `cabin` 1.
- `lab`, `front`, `whole`, `issLow` (avec `shift` −260) : tels que dans `world.js` — `shield` 1, `ram` 1 sur `lab` et `front`.
- `shelterDragon` : `{ tx: -1400, ty: -50, tz: -224.4, d: 2600, az: -40, el: -18, fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 }` (`crew` 1, `capsules` 1, `shelter` 0,3 → 0,9).
- `shelterSoyuz` : `{ tx: 1700, ty: -350, tz: -224.4, d: 2600, az: -40, el: -18, fov: 40, shift: 0, … }` (`shelter` 0,8 → 1 : les trois têtes dans la capsule, l'écoutille veille).
- `kosmos` (depuis l'arrière, la station au premier plan, le nuage hors de l'en-tête) : `{ tx: 2000, ty: 300, tz: -224.4, d: 9000, az: 112, el: 6, fov: 34, shift: -300, side: 0, roll: 0, drift: 0.3, dof: 0 }` — az 112 ne suit pas la règle « az décroît » : à y arriver par une coupe.
- `teaser` (tel quel) : le char, ses scellés, le toit veille.

## À changer ailleurs
- `src/world.js`, `VIEW.shelter` → `shelter: { ...P, tx: -1400, ty: -50, tz: HZ, d: 2600, az: -40, el: -18, fov: 40, shift: 0 },` et ajouter `shelterSoyuz: { ...P, tx: 1700, ty: -350, tz: HZ, d: 2600, az: -40, el: -18, fov: 40, shift: 0 },` (l'ancienne pose d 7200 met la caméra dans les ailes +z).
- `src/world.js`, ajouter `kosmos: { ...P, tx: 2000, ty: 300, tz: HZ, d: 9000, az: 112, el: 6, fov: 34, shift: -300 },`.
- (facultatif, à décider par l'architecte) `src/plan.js`, `KOSMOS.along: [0.3, 0, 1]` si l'on veut que le nuage s'étale EN TRAVERS du cadre vu de l'arrière (aujourd'hui il vient vers la caméra).

## Catalogue
- `041/station.js` — L'ISS aux rayons X à taille vraie (modules, poutre en treillis, ailes à cellules, radiateurs, Dragon, Soyouz, Progress), toi qui dors dans ton sac, l'air de la cabine, l'équipage qui gagne les capsules, le bouclier veille plus épais à l'avant, l'esquive, Kosmos 1408 et son nuage, un char sous scellés. Options : `shell you cabin shield ram crew shelter capsules burn dodge flyby kosmos teaser bench` ; les parties latérales s'effacent seules près de la caméra. `import { buildStation } from "../../041-bouclier-iss/src/station.js";` (dépend de `plan.js` du 041).

Images lues : 30 (4 planches : 8 + 8 + 8 + 6). Appels : ≈ 40.
