# 037 · model.js — journal du décor (le système plein)

Agent décor, 04/11. Contrat : `docs/037-decors.md` § model.js ; plan.js, world.js intouchés. `npm run check -- 037` passe.

## Construit

- **Conteneur** : plaque dorsale, bac principal (boîte arrondie, son rabat de fermeture, son cache-goupille), bac de secours (quatre parois d'une pièce, bord roulé en ruban de bordure, coutures fines non pointillées : le sac tourne à l'acte 1). Chaque toile a son double en verre (`glass` + `asShell`, ordre 21) : `fabric` 1 → 0 fond l'une dans l'autre, les arêtes restent (30 %).
- **Quatre rabats** (bas, haut, gauche, droite, empilés dans l'ordre de fermeture), chacun sur sa charnière, avec son œillet (seul le dernier se voit de dehors). `flaps` les ouvre de 100° vers l'extérieur, le dernier fermé d'abord (droite 0–0,52, gauche 0,09–0,62, haut 0,2–0,74, bas 0,3–0,84), avec un petit dépassement de ressort.
- **Unité de contrôle** sur le rabat du haut (sur un support) : écran sombre, rétroéclairage faible, huit segments en cadre (aucun chiffre), bouton, **diode** (lentille + cœur + halo). Câble contrôle → boîtier : sur le rabat, passe la charnière **sur l'axe** (il plie, ne s'étire pas), descend la paroi, s'enroule au plancher (spirale), entre au bout du boîtier.
- **Extracteur** : disque, ressort conique (6 spires), chapeau ; il monte quand les rabats s'ouvrent (`flaps` 0,15 → 0,9), parti à `deploy` > 0,05. **Sac** : posé au-dessus du coupe-boucle, décalé en x pour laisser la poche du boîtier ; parti à `deploy` > 0,25.
- **Boîtier** (gris moyen, `finish`) : bande de joint, **orifice** (bague, bouche noire) sur le flanc −x, **jauge** sur le même flanc (barre pression veille ; barre vitesse veille → signal au-delà du repère encre à 0,62 ≈ 35/55,6), deux presse-étoupes. Poche = une bande élastique entre l'orifice et la jauge.
- **Coupe-boucle** (le plus clair) : tube tourné avec alésage et fond fermé à +x, **trou en travers** (bouches noires + lèvre claire), bouchon où entre le câble, **piston-ciseau** qui traverse le trou (`piston`), charge sombre derrière. `section` : un quart du tube (celui qui regarde la caméra de `VIEW.cutter`) s'efface, les deux faces de coupe apparaissent.
- **Boucle** : deux brins (une vraie boucle), du plancher à travers le trou, le sac, l'extracteur, les œillets, son œil autour de la goupille. `loop` : les bouts du haut s'écartent (±30°) et remontent (1,6 cm, plus la course du ressort si les rabats s'ouvrent), les moignons du bas s'écartent (±18°).
- **Câble boîtier → coupe-boucle** : un tube re-formé sur place (seulement quand l'éclaté bouge), avec par-dessus la **tête de lumière** (shader additif : un cœur, une courte traîne derrière) et un halo qui la suit.
- **Halos** : une texture radiale (cœur brillant, longue traîne), en sprites additifs ; diode, orifice, coupe-boucle, boucle (halo allongé), tête du câble.

## Les nombres de l'état, chez moi

- `bench` : seulement la taille du halo de la diode (×1,5 sur ton dos, vu de 4 m).
- `explode` : un chemin, pas une colonne. Les quatre rabats montent (+28 à +50, celui du haut le plus haut avec l'unité de contrôle), s'écartent de 4 cm vers leur côté et **tournent de 34° vers la caméra** (az ≈ −42) autour de leur milieu : à plat, vus de 26°, c'étaient des éclats. L'extracteur +20 (ressort ×1,6), le sac +10. Le boîtier sort de sa poche (−8, +9, +13), **le coupe-boucle, la boucle debout et la goupille avancent ensemble devant le bac** (+2, +3, +13), le câble se tend entre les deux. Le bac et le principal passent au verre (85 %) pendant la sortie. Le câble contrôle → boîtier s'efface (il ne sert pas au plan).
- `section` éteint aussi tout ce qui entoure le coupe-boucle (sac, extracteur, parois, rabats…) : à `VIEW.cutter` (d 16), la caméra est **dans la paroi du bac**, le sac plein lui bouche la vue. **Ne jamais filmer `VIEW.cutter` sans `section` > 0 ou `heart` 1.**
- `heart` : boucle veille (émissif 0,85, halo allongé), coupe-boucle intact, le boîtier et le conteneur à 6 %, l'extracteur et le sac à 0.
- `solo` : le boîtier seul, tout le reste à 0 (câbles compris).
- `power`, `wake`, `test` : diode qui respire (≈ 3 s, jamais éteinte), franche avec un halo plus large ; pendant le test (0 → 0,75) deux tours de segments et diode noire, puis tous les segments et la diode franche (0,74 → 0,8).
- `press`, `rate` : les deux barres de la jauge (la seconde passe signal au-delà de 0,62).
- `fabric`, `litFlap` (émissif 0,22 des quatre rabats), `litUnit` (0,3), `litSensor` (anneau veille + halo), `litCutter` (émissif + petit halo), `litLoop` (émissif + halo faible), `litCable` (tête de lumière 0 → 1, éteinte à 0 et au-delà de 1,06).
- `deploy` : extracteur et haut de la boucle partis à 0,05, sac à 0,25.

## Poses vérifiées (planches dans `.cache/planches/037/model/`)

- `VIEW.back`, `VIEW.whole`, `VIEW.rig` (fabric 0), `VIEW.unit` (solo), `VIEW.heart` : bonnes telles quelles.
- `VIEW.exploded` de world.js cadre bien maintenant ; un peu plus serré : `{ ...P, tx: -2, ty: 28, tz: 14, d: 190, az: -42, el: 26, fov: 30, shift: 0 }`.
- `VIEW.cutter` avec `section` 1 : piston 0 / 1, puis `loop` 1 (+ `litLoop` 1 pour la couper en veille) : lisible.
- Coupe-boucle sans coupe, sur le cœur : `{ ...P, ...CLOSE, tx: -0.6, ty: 3, tz: 16, d: 30, az: -35, el: 30, fov: 28, shift: 0 }` avec `heart` 1, `litCutter` 1.
- Unité de contrôle : `{ ...P, ...CLOSE, tx: 11, ty: 19.2, tz: 23.5, d: 24, az: -30, el: 52, fov: 28, shift: 0 }` (power 0 / 1 / test 0,4 / wake 1 : les quatre lisibles).
- Climax de profil sur ton dos : `{ ...P, tx: 0, ty: 14, tz: 16, d: 190, az: -90, el: 28, fov: 30, shift: 0 }` — haut et bas s'ouvrent de profil ; le rabat droit (le plus proche) se lève face caméra et cache le sac : c'est lui qu'on voit partir le premier.

## Pas encore au niveau

- La diode sur la première image (d 400) : halo ≈ 3,6 cm sur ton dos, non vérifié à la loupe (budget d'images dépassé).
- Le coupe-boucle dans l'éclaté reste petit (≈ 20 px à 270 px) : le désigner par `litCutter` / `litLoop` ou un plan serré.
- Le verre du bac (`fabric` 0) reste un peu laiteux autour du centre (le halo du plateau à travers) : les pleins se lisent, mais c'est le point à reprendre si une planche le trouve chargé (`GLASS` en tête du fichier).
- Sur une planche, `explode` 0,6 a donné la même image que 1 : à revérifier sur un vrai fil d'acte.

## Décisions

- La boucle traverse le trou à x = −0,6 (là où `A.hole` la vise), son œil à x 0 sur la goupille.
- La jauge est sur le **même flanc que l'orifice** (−x) : `VIEW.unit` (az −62) ne voit jamais le flanc +x.
- Rabats empilés (bas 16,9 · haut 17,15 · gauche 17,4 · droite 17,65, 0,8 d'épaisseur) ; l'unité de contrôle sur un support sur le rabat du haut (dessus à 19,425 comme `CONTROL`) ; gauche et droite échancrés pour ne pas la couvrir.
- `parts` : `tray, main, flaps, flapBottom, flapTop, flapLeft, flapRight, control, pilot, bag, unit, cutter, loop, pin, cable` ; `update` règle lui-même les fondus à chaque image (ne pas appeler `setPartOpacity` dessus).

## À changer ailleurs

- `episodes/037-parachute/src/world.js`, `VIEW.exploded` (facultatif, plus serré) : `exploded: { ...P, tx: -2, ty: 28, tz: 14, d: 190, az: -42, el: 26, fov: 30, shift: 0 },`
- `docs/037-actes.md` (pour les actes) : `VIEW.cutter` seulement avec `section` > 0 ou `heart` 1 (la caméra est dans la paroi du bac).
