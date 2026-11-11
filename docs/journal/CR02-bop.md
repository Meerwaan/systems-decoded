# CR02 · Deepwater Horizon — journal du décor `bop.js` (le système, en coupe)

2026-11-06. Bouchon remplacé en entier ; API inchangée (`buildBop()` → `{ group, A, haloR: 34, update(S, time) }`, toutes les ancres du bouchon). `npm run check -- CR02` passe (0 erreur). 30 images lues sur 30 (planches `.cache/planches/CR02/bop/p1…p4.jpg`).

## Ce qui est construit (de bas en haut, ordre du CSB)
- Tête de puits et connecteur (demi-révolutions, faces coupées en x = 0), châssis sombre (poteaux, traverses), quatre bouteilles d'accumulateurs derrière.
- Bas d'empilement : plaques à alésage demi-rond, cinq cavités, chaque mâchoire dans son **bonnet creux** avec tige et piston vus en coupe. 3 VBR (encoche autour du tube, garniture de caoutchouc ; seule la HAUTE bouge et verdit), CSR (grise, ouverte, jamais nommée), **BSR** : la mâchoire de −z porte la lame HAUTE, celle de +z la lame BASSE, elles se croisent de 4 cm au-delà de l'axe (le plan de cisaillement à y = 77).
- LMRP : connecteur, annulaire bas (caoutchouc fixe) et **annulaire HAUT** (cloche + anneau de caoutchouc qui gonfle vers le tube, géométrie réécrite), joint flexible, riser (coupé en 196 pour la fuite ; tout ce qui monte se fond dans le noir entre y 168 et 232). Châssis du LMRP, **deux boîtiers** (panneau avant charnière côté extérieur) : −z batterie 27 V + jauge ambre + deux boîtiers électroniques ; +z électrovanne, **deux bobines et deux flèches de champ opposées**, pile 9 V reliée par un fil ; un voyant par boîtier. Deux câbles de commande (impulsions claires qui descendent) et deux flexibles le long du riser.
- **Le tube de forage** : demi-tube (son âme se voit), le plus clair (argile 1 + un peu de lumière propre), réécrit quand un nombre change. Là où passe une lame, le tube recule : centré, il est mangé des deux côtés et se sépare (le morceau du haut remonte de 2,5 cm avec `shear`) ; décentré, il est **pincé** en S entre les deux lames (taille de 1,9 cm), jamais séparé, **percé** là où mord la lame haute (point rouge à cœur clair + jet par l'interstice, × `pass`).
- Le gaz : un plan dans la coupe qui sait où est le tube (anneau rouge peu opaque + traînées qui montent, un front brillant ; rouge dans l'âme du tube, pulsation lente) ; la fuite : panache rouge qui sort du riser rompu et dérive vers +z.
- `depuis` : le LMRP se soulève de 13 cm et un **second module BSR** glisse depuis l'arrière (`rams2`) — RAMS2.bsr2 tombe donc à y ≈ 94,5 et non 92 ; la **bague de centrage** (y 67,7–71,3, sous la BSR) se referme et redresse le tube.

## Les nombres
`annular` gonfle l'annulaire haut (laisse 0,5 cm de jeu quand il est coupable) · `vbr` ferme la VBR haute (verte × ok) · `bsr` ferme les lames (verte × ok, sauf sur un tube décentré) · `flow` = hauteur du front rouge (0 au fond → 1 en haut du riser) · `pass` = intensité au-dessus de l'élément fermé le plus bas (VBR, puis BSR, puis annulaire) et du jet par le trou · `inside` = rouge dans l'âme du tube · `buckle` = décentrage (× (1 − `ring`)) · `amf` voyants verts · `link` impulsions des câbles · `podOpen` panneaux · `charge` jauge ambre · `coils` flèches opposées · `plume` riser rompu + panache · `rams2` LMRP soulevé + second module (vert × max(ok, depuis)) · `ring` bague (verte) et redressement · `shear` coupe nette forcée · `culprit`/`fault` une pièce rouge (1 annulaire, 2 tube, 3 batterie, 4 électrovanne + bobines, 5 pile) · le tube guérit par `heal(depuis × ring)` (pas `depuis` seul : au `comment`, `depuis` 1 et tube plié doit rester rouge) · `ok` et `depuis` donnent le vert des joints.

## Poses qui cadrent (vues sur planches)
- `bop` : `{ tx: -5000, ty: 88, tz: 0, d: 600, az: -50, el: 10, shift: 60, fov: 30 }` (az −58 marche aussi ; −50 donne un peu plus de volume).
- `master` : l'actuelle `{ ty: 84, d: 340, az: -72, el: 4, shift: 40 }` — le S rouge se lit, les deux boîtiers encadrent.
- gros plan des lames (pincé / coupe nette) : `{ tx: -5000, ty: 80, tz: 0, d: 170, az: -62, el: 6, shift: 0, dof: 6 }` — meilleur que `VIEW.bsr` (d 200, az −68) pour le pincement.
- `vbr` : `{ ty: 52, d: 200, az: -55, el: 6, dof: 6 }` · `annular` : actuelle (d 230, az −66) · `podBattery` / `podValve` : actuelles (d 120, az −72) — excellentes.
- `plume` : actuelle (d 820, az −56) lisible ; le BOP y est petit (essayer `ty: 170, d: 700`).
- BENCHED / `depuis` : `{ ty: 88, d: 420, az: -58, el: 8, shift: 40 }`.

## Ce qui n'est pas au niveau (franchement)
- **Le pincement au gros plan** se lit comme « le tube passe entre les lames, du rouge s'échappe au-dessus » ; la taille écrasée du tube reste discrète à 270 px. Le point clair du trou a été ajouté après la dernière planche : **non vérifié à l'image**.
- L'empilement reste « une étagère de blocs » vu de près de face : c'est la coupe d'un BOP, mais az −50 aide.
- Non vus sur planche : `link` 1 → 0 (uniforme simple), `rams2` à 1 complet, `charge` en mouvement.
- Dernière modification non regardée : la BSR ne verdit plus quand elle serre un tube décentré (BENCHED montrait des lames vertes à mi-course).

## À changer ailleurs
- `episodes/CR02-deepwater/src/world.js` `VIEW.bsr` : `bsr: pose("bop", [0, 80, 0], { d: 170, az: -62, el: 6, ...CLOSE }),`
- `episodes/CR02-deepwater/src/world.js` `VIEW.bop` : `bop: pose("bop", [0, 88, 0], { d: 600, az: -50, el: 10, shift: 60 }),`
- `episodes/CR02-deepwater/src/world.js` `VIEW.vbr` : `vbr: pose("bop", [0, 52, 0], { d: 200, az: -55, el: 6, ...CLOSE }),`
- `docs/CR02-actes.md` (note pour les actes) : `flow` est la HAUTEUR du front rouge (l'animer 0 → 1 fait monter le gaz du puits) ; `pass` agit sur ce qui est au-dessus de l'élément fermé le plus bas ; le tube ne guérit qu'avec `ring` (`depuis` seul le laisse rouge).
