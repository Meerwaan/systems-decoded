# 042 · char.js — journal du décor

08/11. Le char aux rayons X la nuit, son équipage de quatre, le sol en grille, l'autre tourelle (« une machine »). Contrat : `docs/042-decors.md` § char.js, bouchon de l'architecte (API gardée : `buildChar() → { group, A, update(P, time, px, eye) }`).

## Lu
recette-agents, regles-image, 042-decors (haut + § char.js + § feu.js pour la lueur au sol), plan.js, world.js, le bouchon, 041/station.js l. 893–963 (idiome du petit char), build3d (glass, asShell, lineMat, edgesOf), figure.js (makeFigure, reach, leg, lean, ghost), atmo.js, gridMaterial de 028/foyer.js.

## Choix
- **Coque** : lofts (deux polygones, bas et haut, faces planes) pour la tourelle et la nuque, extrusions de profil (x, y) pour la caisse, les garde-boue, les chenilles (une boucle avec son trou : la bande se lit), jupes en un seul plan. Un seul `asShell` (ordre 20). La tourelle n'a pas de face arrière ni de fond (la caisse et la nuque les portent) : pas de deux vitres confondues sur la cloison du caisson. La nuque n'a pas de toit : son bord dessine l'ouverture du panneau (quand il s'envole, il reste un trou, pas une vitre).
- **Canon** : un tour (lathe) au profil étagé (manchon, tube, évacuateur, tube, bouche), verre à lèvre vive (`edge` 0,6) et reflet long (`spec` 0,35) : les anneaux aux marches donnent ses arêtes.
- **`heat`** : chaque sommet de trait porte sa proximité au caisson dans sa couleur de sommet ; trois tracés additifs des mêmes segments (encre loin · encre près qui baisse avec `heat` · signal près qui monte) : couleurs franches, pas de pêche, et aucun segment coupé (les bouts ronds de LineMaterial feraient des perles aux jointures) ; la vitre de la nuque passe d'encre à signal. Au sol, les lignes de la grille se réchauffent sous la tourelle (la flaque, elle, est à `feu.js`).
- **Équipage** : `makeFigure({ shell: true })`, têtes et mains en verre (`ghost`), verre teinté veille avec un fond léger (une silhouette verte pleine, bord vif), ordre 14 (vus à travers la coque).

- **Lignes** (après p4) : trois jeux (milieu, flanc +z, flanc −z), le flanc loin de l'œil à moitié (`eye.z`) : la profondeur se lit, le flanc droit ne fait plus spaghetti derrière l'équipage. Le train de roulement (chenilles en une seule face, galets, barbotin, poulie, jupes) à moitié : il ne vole plus l'œil à la tourelle.
- **Verre** (après p1) : les faces planes à lèvre (`edge`) et à reflet (`spec`) s'allumaient en entier en rasant (dalles grises sur le pont, le flanc de tourelle). Faces planes : `base` 0,014, `rim` 0,09, ni lèvre ni reflet ; seul le canon (rond) garde lèvre 0,6 et reflet 0,35. `thin` : la vitre baisse à 0,35 quand l'œil entre dans la tourelle.
- **L'autre tourelle** : coin plus aigu, nuque plus longue (jusqu'à x 172), panier de tourelle ouvert dessous (une tourelle sortie de sa caisse), ombre de contact au sol ; chargeur automatique plein : râtelier de 28 obus couchés en travers (deux rangs, deux côtés), bras gris clair mat (0xa3a9ae, rough 0,72, metal 0,12 : à 0,4 de métal il brillait comme un laser), berceau, l'obus porté le long du bras. `arm` 0 : le bras vers le râtelier (110°) ; 1 : vers −x, l'obus pointe vers la culasse. Son équipage à 0,55 : présent, mais la machine est le sujet.

## Planches (36 vignettes lues : au-delà des 30, dit franchement)
- p1 (8) la liste fermée : char lisible d'emblée, équipage vert ; dalles grises de verre → p2.
- p2 (8) verre corrigé, chaleur en signal sur la nuque ; bras de l'autre tourelle trop brillant.
- p3 (4) duo : l'autre tourelle chevauche la nôtre à d 3 200, une boîte.
- p4 (4) avec l'en-tête : accroche, 2,6 s, crewWide, columnWide — le train de roulement trop présent.
- p5 (4) lignes par flanc : POSE0, rear, crewWide, zero (heat 1) bons.
- p6 (4) duo à d 2 100 : bon récit, râtelier au bord droit.
- p7 (4) le chargeur reach 0,25 / 0,75 / 1 : il se tourne, fait son pas, les mains sur le culot.

## Poses qui cadrent bien
- `POSE0`, `crewWide`, `columnWide`, `zero` (heat 1) : telles quelles.
- `VIEW.rear` (az +40) : le canon part à **gauche** de l'image (le commentaire de `plan.js` dit droite : c'est faux, vérifié p5).
- `duo` testé : `{ ...P, tx: 40, ty: -20, tz: 250, d: 2100, az: -40, el: 14, fov: 34 }` — le chargeur qui saisit son obus à gauche, l'autre tourelle et son bras au centre-droit ; mais le râtelier tombe vers x ≈ 990 (zone des boutons TikTok). À d 3 200 (la pose de l'architecte) l'autre tourelle n'est qu'une boîte.
- L'autre tourelle de près : `{ ...P, tx: 120, ty: -10, tz: 470, d: 1100, az: -40, el: 22 }` (râtelier, bras, obus lisibles).
- `loader` (tx −120) : bon de reach 0,6 à 1 ; à reach 0–0,3 le chargeur est au bord gauche. Calculé, pas vu : `tx: -150` le recentre sur tout le geste.

## À changer ailleurs
1. `world.js`, dans `apply()` — les mains du chargeur suivent l'obus que tire `caisson.js` (sans elle, elles suivent `reach`, juste seulement si l'acte tient `grab` = lissé de `reach` 0,5 → 1) :
   `tank.update({ shell: S.shell, crew: S.crew, you: S.you, reach: S.reach, grab: S.grab, other: S.other, arm: S.arm, heat: S.heat, bench: b }, time, px, eye);`
2. `world.js`, `VIEW.duo` (testé p6) : `duo: { ...P, tx: 40, ty: -20, tz: 250, d: 2100, az: -40, el: 14 }, //            « un homme… ou une machine ? »`
3. Proposé, **non vu** : `plan.js` `OTHER.heading: 180` — l'autre tourelle tourne le dos : sa nuque (le bras) vient au centre de l'image, près de notre chargeur, et son canon sort à droite ; le râtelier quitte la zone des boutons. À juger sur une planche avant de l'appliquer.
4. `world.js`, `VIEW.loader` (calculé, non vu) : `tx: -150` au lieu de −120.
5. `plan.js`, commentaire des conventions : « at az +40 … its gun goes away to the right » → « … to the left ».
6. Pour `feu.js` (info) : la coque du char écrit sa profondeur à l'ordre 19 ; une colonne dessinée après est coupée par la vitre de la tourelle devant elle (le char se découpe sur le feu). Pour voir le feu à travers le verre, la dessiner avant l'ordre 18.

## Catalogue
`042/char.js` — un char de combat générique aux rayons X, la nuit (caisse, chenilles, tourelle à nuque en surplomb, canon à évacuateur), quatre figures d'équipage vertes posées (chargeur debout qui se retourne et saisit un obus), sol en grille qui se réchauffe sous la tourelle, et une tourelle d'exposition à chargeur automatique ; état `shell crew you reach (grab) other arm heat bench`.
