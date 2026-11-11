# 043 · sortie.js — journal du décor (le système : point 6, la sortie de secours)

## Fait
- Lu : recette-agents, regles-image, 043-decors (haut + § sortie.js), plan.js, world.js (FIRST, VIEW, BENCHED, apply), bouchon, build3d, atmo (makePool, makeSurface), makeBall (022/model).
- Choix : un repère « ligne » (groupe à K, axes gauche/haut/aval) porte tout ce qui est le long de la ligne ; les aimants d'éjection suivent l'anneau (un support par cuve). Le chemin du faisceau (`pathAt`) glisse de l'anneau à la ligne entre u 0 et 420 (les septa) : sinon la ligne droite à 3° sort des cuves dès la dixième.
- Le flot : les paquets extraits (q < dump) sont posés le long du chemin à u = (dump·(1+lag) − q)·P (P = C − trou, lag = L/P) : même vitesse et même pas que dans l'anneau, le dernier paquet touche la face quand dump = 1, la tête du « e » est exactement dump. Après les dilueurs, chaque paquet s'écarte en ligne droite vers SON point du « e ».
- Le « e » et la chaleur : un disque-shader sur la face, distance analytique à la barre et à l'arc (tronqués à la progression), âge de la trace → orange chaud puis orange signal ; plafonné bien sous le blanc.

- Construit : 15 cuves MKD pleines (brides claires, soufflets, piquage, traversée HT en céramique = le gris le plus clair, pied, poutre et jambes), 15 septa en C (la ligne dans leur fente, ouverts côté anneau, bobine claire), 10 dilueurs en cadre (4 entrefers larges, 6 hauts, pôles clairs face à face, un point veille qui balaie chaque entrefer : en travers chez les 4, de haut en bas chez les 6), noyau de graphite en 8 tronçons (entrée et fond plus clairs, tronçons alternés). Rayons X : tube de branche (suit `pathAt`), tube de ligne (r0 jusqu'à u 1650 puis cône vers r1), son tunnel (dès u 1000, avant les septa sont dans le tunnel de l'anneau), cuve d'acier (brides, fond bombé, fenêtre d'entrée), berceaux, caverne et blindages (fer, béton) en TRAITS (verre presque nul : une face plane rasante fait une dalle grise). Halo `makePool` allongé sous le bloc (0,22·pool), contact doux.
- Œil : chaque coque s'efface quand l'œil y entre ou la frôle (tube, tunnel, cuve, caverne) ; et le tube et la cuve baissent de 65 % quand on regarde DANS l'axe de la ligne (sinon les parois rasantes s'empilent en une tache blanche au bout : planche p3).
- Planches lues : p1 (8, poses bouchon : trop près ou de profil), p2 (8), p3 (8), p4 (6) = 30 images.

## Ce que chaque nombre fait
- `explode` : cuves (46), septa (52), dilueurs (56) montent en cascade le long de la ligne (retard 0 → 0,4) ; la cuve du bloc glisse de 260 vers l'aval (0,3 → 1) ; blindages s'écartent (fer ±46, béton ±70, mur du fond +80).
- `arm` : souffle veille lent (3,4 s, une vague le long de la rangée) sur les brides. `kick` : cascade amont → aval, un éclair par cuve qui se pose clair (cuve i part à kick = 0,04·i). `sweep` > 0,01 : la même lumière en signal (vérifié : orange franc).
- `septa` : fente allumée + corps légèrement émissif. `dil` : vague qui tourne (1,6 s) + le point dans chaque entrefer.
- `route` : ligne veille 3,5 px tirée jusqu'à une tête de lumière (segment final coupé exactement à la tête : pas de saut) ; à 1 : 2,6 px, 0,8.
- `dump` : le flot (paquets blancs, wagons lisibles en tirets, s'élargissant, éventail vers le « e » après les dilueurs). Le « e » = max(paint, dump·(1+LAG) − LAG), LAG = 0,108 : le premier paquet touche la face à dump ≈ 0,098 ; à dump 0,6 le « e » est à 0,557 ; à 1, entier. `beam` : intensité du flot.
- `paint`, `heat` : shader de face (distance analytique au « e » tronqué), orange chaud derrière la tête puis orange signal, halo d'une seule couleur ; « e » entier → refroidit d'un bloc. Plafonné : jamais blanc (seule la tête, `makeBall` 1,05, est blanche).
- `point` : tache signal + fin faisceau signal translucide depuis la branche. `crack` : 9 fissures (+5 branches) en unités monde qui poussent par à-coups, signal puis sombres (0,55 → 1), tache sombre dessous. Aucun trou.
- `lit*` : cuves 0,06 émissif + brides ; septa ; tube teinté veille (couleur, pas intensité) ; dilueurs ; bloc : brides de la cuve en veille, verre à peine teinté, noyau 0,05.
- `cavern` : tunnel, caverne, blindages, supports, grilles (×) ; tube et cuve gardent ≥ 0,4.

## Poses qui cadrent (vérifiées sur planche, sauf mention)
- blockFar : `{ ...P, ...at(face, { tz: face[2] - 56 }), d: 2300, az: -146, el: 15 }` — le bloc dans sa caverne, la route qui arrive de la gauche (le tunnel de l'anneau entre en bas à gauche).
- exitLit : `{ ...P, ...at(lineAt(450)), d: 1700, az: -160, el: 30 }` — la rangée en diagonale, la route verte, les septa.
- exploded : `{ ...P, ...at(lineAt(380), { ty: 10 }), d: 1400, az: -150, el: 18 }` — cuves et septa levés ; lisible mais petit (40 m de système : on ne montre que l'embranchement).
- kickers : `{ ...P, ...at(kick, { ty: 20, tz: kick[2] + 20 }), d: 620, az: -152, el: 16 }` — les 15 cuves de trois quarts, céramiques claires ; les deux premières touchent le bord gauche : d 680 ou tz kick[2] − 10 (non vérifié).
- gapFind / fire : `{ ...P, ...at(kick, { tz: kick[2] + 30 }), d: 700, az: -132, el: 12 }` (sweep : signal, vérifié) ; fire `tz + 100, az -135, el 14` (cascade à kick 0,5 vérifiée).
- lineLong : `{ ...P, ...at(lineAt(2400)), d: 1700, az: -168, el: 10, fov: 36 }` — le tube vert file jusqu'au bloc.
- lineRush : `{ ...P, ...at(lineAt(1960)), d: 1100, az: -160, el: 8, fov: 36 }` — le flot en tirets blancs jusqu'à la face.
- blockHero : `{ ...P, ...at(lineAt(3500)), d: 1500, az: -150, el: 16 }` — noyau gris dans la cuve fine, brides veille, halo.
- dilution : `{ ...P, ...at(lineAt(1170), { ty: 5 }), d: 480, az: -160, el: 8 }` (explode 0) — l'entrefer large du premier, son point, la rangée qui file.
- faceClose, verdict, etrace : celles de `VIEW` marchent telles quelles (le « e » se lit à 270 px dans les trois).

## Pas encore au niveau
- `hook` : planche p3 lavée de blanc par le verre de l'anneau (bouchon) ; le bloc à 47 m n'a pas pu être jugé. À revoir une fois `anneau.js` fini.
- `exploded` : petit (le système fait 40 m) ; l'éclaté ne se lit qu'en plan d'embranchement.
- L'éventail du flot vers le « e » (≤ 15 cm) ne se voit qu'en gros plan.

## À changer ailleurs
- `world.js` → `VIEW` : remplacer `blockFar`, `exitLit`, `exploded`, `kickers`, `lineLong`, `blockHero`, `dilution`, `gapFind`, `fire`, `lineRush` par les poses ci-dessus (ajouter `lineAt` est déjà importé) ; `gapFind` actuel (az −100) filme les cuves de profil.
