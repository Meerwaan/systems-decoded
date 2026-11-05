# CR01 · salle.js — journal

## Construit (1er jet)
- Pupitre : six modules droits sur un arc concave vers les opérateurs (centre de l'arc côté −x), profil extrudé (façade, plan incliné de ≈ 10°, rehausse de cadrans). Un module centré sur AZ-5, le suivant sur les clés.
- AZ-5 : seul sur son module, sur une platine claire, collerette sombre, capot clair relevé derrière (fond clair pour le rouge), plaque d'étiquette vierge.
- Clés de protection : 5 barillets + poignées qui tournent d'un quart à la coupure, voyants papier qui s'éteignent un à un, de gauche à droite.
- Tableau : disque de 72 cadrans (grille carrée dans le disque), barre papier par cadran = profondeur de la barre (lecture de coeur.js : dedans à mi-hauteur, `scram` les pousse toutes).
- Trois silhouettes d'argile sombre (makeFigure, matières remplacées par clay), de dos, sans visage ; celle près du bouton a les mains dans le dos.
- Armoires de part et d'autre du tableau, mur, plaque de base de maquette.

## Planches (28 images lues : 8 + 8 + 8 + 4, `.cache/planches/CR01/salle/p1…p4.jpg`)
- p1 : bouton, tableau, clés lisibles. Ratés : la silhouette de droite (z 80) était DANS la caméra des clés (`VIEW.keys` tombe derrière son épaule) ; la caméra de la candidate c (architecte) est dans le dos de la silhouette 0 ; voyants trop forts (1,35 : boules de bloom).
- p2 : silhouettes déplacées (`CREW` dans salle.js, voir plus bas), voyants et barres à 1,0. Clés propres. Tableau : la tête d'une silhouette en amorce, au premier plan (bon : on regarde le tableau par-dessus une épaule).
- p3 (avec en-tête et zones) : sur un plan large plus bas (az −70), le rouge du bouton tombait **contre la main** de la silhouette du milieu → interdit (aucune main près du bouton). Correction : les deux silhouettes les plus proches ont **les mains jointes dans le dos**, celle du milieu décalée en z 28.
- p4 : les trois plans larges : le bouton dégagé, loin de toute main, à 270 px. Haut du disque juste sous l'en-tête (≈ 430 px).

## Ce que fait chaque nombre
- `az5` 0 → 1 : le bouton s'enfonce de 1,9 cm dans sa collerette (personne ne le touche).
- `fault` : le bouton passe de l'argile au rouge (`setAlarm`) ; seule pièce rouge de la salle.
- `prot` 1 → 0 : les 5 voyants papier s'éteignent un à un de gauche à droite (vu de −x), chaque clé tourne d'un quart en même temps (palier de 0,45 / 5 par voyant).
- `crew` : les trois silhouettes (visibles au-dessus de 0,5).
- `rodsIn`, `scram` : 72 cadrans ; la barre papier de chacun descend avec la profondeur de sa barre — même lecture que coeur.js (dedans : mi-hauteur ; `scram` pousse tout vers le fond). `rodsIn` 0,25 + `scram` 0 : 18 cadrans allumés à mi-course (« peu »).

## Poses qui cadrent (coordonnées locales de la salle, forme `pose()` de world.js)
- salle (large, bouton à gauche, équipe au centre, tableau) : `pose("salle", [200, 150, 0], { d: 860, az: -70, el: 10, fov: 34, shift: 20 })` — `VIEW.salle` actuel marche aussi (bouton entre les silhouettes 0 et 1).
- bouton (capot clair derrière le rouge) : `pose("salle", [136, 97, -46], { d: 95, az: -62, el: 22, shift: 40, ...CLOSE })` — meilleur que `VIEW.az5` (qui marche aussi). C'est aussi la candidate c que je propose pour la première image (`az5` 0,6, `fault` 1) : celle de l'architecte (d 120, el 8) est mangée par une ombre de silhouette et le bouton y est petit.
- tableau : `pose("salle", [330, 185, 0], { d: 820, az: -62, el: 6, shift: 40 })` — le disque entier sous l'en-tête, une silhouette de dos en amorce. `VIEW.board` (d 520) coupe le haut du disque sous l'en-tête.
- clés : `pose("salle", [136, 96, 34], { d: 125, az: -70, el: 34, shift: 40, ...CLOSE })`.

## Pas encore au niveau (franchement)
- Les silhouettes sont des mannequins articulés (makeFigure en argile) : lisibles, sans visage, mais un peu « mannequin de dessin » de près. On ne les filme jamais de près (aucune pose ne les cadre à moins de 5 m).
- L'ombre d'une silhouette traverse le pupitre à droite du bouton en gros plan : dramatique, ne touche pas le bouton ; à surveiller si un acte trouve qu'elle « pointe » vers lui.
- Le halo de la reconstitution sous le bouton tombe au sol sous le pupitre : à peu près invisible (normal, le bouton est sur le plateau).

## À changer ailleurs
- `plan.js`, pour que le plan dise vrai (salle.js n'en dépend pas) : `crew: [[62, 0, -88], [50, 0, 28], [70, 0, 124]], // three silhouettes, backs to the camera (moved so no hand reads near the button and the close cameras stand between them)`
- `world.js`, `VIEW` :
  - `salle: pose("salle", [200, 150, 0], { d: 860, az: -70, el: 10, fov: 34, shift: 20 }),`
  - `az5: pose("salle", [136, 97, -46], { d: 95, az: -62, el: 22, shift: 40, ...CLOSE }),`
  - `board: pose("salle", [330, 185, 0], { d: 820, az: -62, el: 6, shift: 40 }),`
  - `keys: pose("salle", [136, 96, 34], { d: 125, az: -70, el: 34, shift: 40, ...CLOSE }),`

`npm run check -- CR01` : passe (0 erreur).
