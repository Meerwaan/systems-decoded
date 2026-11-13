# CR03 · acte2c.js — journal de l'acte (t6 → issue, `tot6` 71,89 → `todefaut` 97,84)

Agent `acte`, 13/11. Lu : recette-agents, recette-actes, regles-image, recette-compte-a-rebours, CR03-actes-maj, CR03-actes (haut + ma section + voisines), world.js, main.js, plan.js (constantes), index.html (étiquettes), journaux concorde / piste / état, API direct.js (cut, path, punch) et feutre.

## Ce qui est monté (quatre coupes, un `path` chacune ; l'avion VOLE tout l'acte)
- **Le vol** : `run` = 21 500 à `tot6` + 484 unités/s (≈ 97 m/s ≈ 200 kt, la vitesse du BEA) ; il passe l'abscisse de l'hôtel juste après la coupe d'`issue`. Caméra et lumière (`fx fy fz`) le suivent : clés de `path` calculées à l'instant de chaque clé (`onPlane`), lumière en `st` linéaire. `aimW` = un décalage MONDE depuis l'origine de l'avion (les visées en local basculent avec le tangage).
- **1 · t6, 16:43:56** — le train gauche, de devant et dessous, sur le ciel noir (d 260 → 225, az −52 → −38) ; « rentrer » : `gear` 1 → 0,94, retombe sur « Il » ; « ne rentre pas » : `culprit` 5, `fault` 1, cercle `feutre-train` sur `A.gearLeft`, punch « pas ». « Ton Concorde reste à 60 mètres » : recul SANS coupe jusqu'au profil gauche (d 1 900, az 6, el 2), l'avion plat au-dessus des champs, le train rouge sorti ; `chip-alt`.
- **2 · t7, 16:44:00** — de haut derrière (d 5 200, el 32) : l'avion petit et son OMBRE sur les champs (l'altitude se lit), son sillage ambre `traj` tracé de la piste jusque sous lui puis qui le suit ; « alarme » : la caméra descend (d 3 000 → 1 500, el 19 → 9) jusqu'au ras des toits de Gonesse ; « Le Bourget, Le Bourget » : az 106 → 112, les feux de Le Bourget droit devant, `bourget` 1 puis pulsation 1,25 ; punch `bourget1`.
- **3 · t8, 16:44:29** — trois quarts arrière (d 1 150 → 1 020, az 60 → 43), les toits sous lui ; `effondre` : `n3`, `n4`, `n1` → 0 à 0,2 s d'écart (BEA : 3 et 4 normaux jusqu'à 14:44:29,5 TU), punch ; « commandes » : `bank` 10 → 25 ; « penche » : → 100 ; « tombe » : `alt` 280 → 60 et `pitch` −20 en 0,55 s, punch ; la dernière clé lève les yeux (+170) : il sort PAR LE BAS ≈ 30 m au-dessus des toits, le sol sous lui jamais dans le cadre (calcul : centre hors cadre vers 91,0 s, coupe à 91,37). Aucune image du crash.
- **4 · issue, 16:44:31** — la piste vide (`VIEW.vide`), lumière recentrée sur la lamelle (`fs` 70, 40 devant elle : sinon le premier plan est noir), `soot` 0 → 1 en 2,2 s ; `chip-bilan` ; punch « 113 » ; « Deux minutes pile après le top » : la caméra baisse les yeux sur la lamelle (d 26 → 21, `dof`), rouge sur « top » (`culprit` 1, `fault` 1).

## Couture rendue
Piste vide, `alt` −100, `soot` 1, `culprit` 1, `fault` 1, lumière sur la lamelle (`fs` 22) ; acte3 coupe sur la baie, tout à 0.

## Planches (`.cache/planches/CR03/acte2c/`, 26 images lues : b1 8, b2 8, b3 8, b4 2)
- b1 : train trop près (fouillis aile + feu), profil trop haut sous `chip-alt`, carte de 26 000 illisible (champs ambre plats, l'avion 9 px), « Le Bourget » avion coupé au bord droit. Tout refait.
- b2/b3 : profil d 1 900 bon (avion sous l'étiquette, sol, traînée de feu) ; t7 refait en plongée derrière l'avion (son ombre lit l'altitude) ; chute trop serrée (aile hors cadre) → d × 1,3 ; piste vide trop sombre.
- b4 : chute d 1 040 : tout l'avion, incliné, le feu, les toits — bon. Piste vide relit : bitume ambre, la lamelle au premier plan.

## Un cran en dessous (dit franchement)
- **72–75,5 (t6, le train)** : lisible (jambes, roues, cercle rouge), mais chargé : l'intrados et ses traits d'élevons en diagonale, la traînée de feu rouge derrière. Dernier réglage (d 260) non revu.
- **79–81 (t7)** : pas de vraie « carte » (la vue de 26 000 ne se lisait pas) ; « trop près du sol » se lit par la descente et l'ombre, pas plus. Le Bourget allumé ne fait qu'un trait clair sur l'horizon ; dernière clé (az 112, d 1 700) non revue.
- **91,0–91,37** : le ciel vide ne dure que ≈ 0,3 s (la voix ne laisse que 0,87 s entre « tombe » et la coupe) ; sortie par le bas calculée, pas vue.
- **92–96 (piste vide)** : la suie ne se lit pas (bande noire sur bitume sombre, vue rasante). La lamelle rouge sur « top » se lit bien.
- Les moteurs qui s'éteignent (« s'effondre ») : les tuyères sont cachées par la traînée de feu dans ce cadre arrière.

## La coupe des deux moteurs (`cutaway`)
Pas montée ici : elle est dans acte2b (t5). Mon acte coupe à `cutaway` 0.

## Sons (pour le monteur-son ; je n'en écris aucun)
- 71,89 coupe sur le train (vent, moteur au loin) · 74,4 le train qui retombe (claquement sourd, juste avant « Il ») · 75,46 cercle rouge / punch « pas ».
- 78,94 coupe vers le haut (souffle) · 80,5 → 82 la descente au ras des toits (montée de souffle) · 83,30 et 83,99 les feux de Le Bourget qui s'allument (sur des mots : à décaler dans le souffle).
- 84,62 coupe arrière · 86,29 → 86,9 trois moteurs qui s'éteignent l'un après l'autre (chute de régime) · 89,26 → 90,46 le roulis · 90,50 la chute (sifflement qui s'éteint) puis 91,37 coupe sur un silence (piste vide).
- 94,72 « 113 » (étiquette) · 97,12 la lamelle qui rougit.

## À changer ailleurs
Rien.
