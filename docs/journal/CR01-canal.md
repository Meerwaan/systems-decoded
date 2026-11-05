# CR01 · canal.js — journal (agent decor, 05/11)

Lu : recette-agents, regles-image, CR01-decors (haut + § canal), reconstitution.md, plan.js, world.js, le bouchon, CR01-actes (haut + lignes canal), 005/chain.js (idiome).

## Ce qui est construit
- Tranche coupée en x = 0 (garde x 0…22) : trois colonnes de graphite (6 blocs chacune, joints de 0,7), plaques basse 0–30 et haute 210–240 rainurées aux trois canaux, gaine du canal de barre 8,1–12 de 0 à 240, entraînement 240–400 qui se fond dans le noir (shader `fadeUp` 244 → 272, sans arêtes).
- **Trois gris posés à la main** (`G` en tête du fichier) : la plage de `clay({ tone })` (0x4c4b49 → 0xc2bfb9) est trop étroite sous la clé dure — eau, graphite et vapeur sortaient tous gris moyen (planches p1, p2). Graphite 0x625f5b, eau 0xe2ded5, absorbant et vapeur ≈ noir, plaques et tubes 0x3d3c3a / 0x363533. Toujours `clay()` (mat, sans métal), seule la couleur change.
- Canaux de combustible : tube, gaine, 24 pastilles chanfreinées (on voit la pile), anneau d'eau 5,6–10,5 coupé par un **front de vapeur** qui descend avec `steam` (front = 240 − 230·steam) : au-dessus, anneau quasi noir + bulles d'argile claire qui montent (64 instances). La lueur = l'émission des pastilles, hauteur par hauteur (`pLow` en bas, `pHigh` en haut, fondu 92 → 148) + deux PointLight papier faibles par canal.
- Canal de barre : absorbant (pointe 28 avec arêtes, corps sans arêtes, fondu en haut), tige de liaison, **déplaceur `alarm()` (gris graphite à `fault` 0)**, colonnes d'eau du milieu et du bas (eau claire, rayon de la gaine). À `rod` → 0,18 l'eau du bas se vide par la rainure de la plaque basse (petit débordement sous 30 + 6 gouttes qui tombent, `sin(π·push)`), nulle à 0,18.
- Neutrons : 220 traînées papier additives (instanciées, têtes larges 3 cm, traîne 0,22 s), nées dans le combustible au prorata de la puissance à leur hauteur, 64 % vers le canal de barre. Rapides dans combustible/eau (64 cm/s), lents dans le graphite (27). Destin (seuils doux : un changement d'état fond, ne saute pas) : xénon (72 %·xenon) → eau de l'anneau (50 % eau, 6 % vapeur) → canal de barre (absorbant 100 %, eau 55 %, déplaceur 0). Avalé = la traînée se replie dans un petit disque sombre à liseré clair (0,42 s).
- Loupe (`split`) : disque sombre cerclé, 5 noyaux d'argile claire (r 4,4), 12 neutrons de chaîne (1 → 3 → 2 + 2 → 4), cassure = deux moitiés plus sombres qui s'écartent + éclat papier bref. Ouverte de 0 à 0,05, **refermée de 0,9 à 1** : à `split` 1 elle a disparu et le canal plein de neutrons reste (« ça chauffe l'eau » joue dans le même plan).
- `solo` : graphite, plaques, canaux s'enfoncent sous la table (k², 270 cm ; l'entraînement disparaît d'emblée) ; la barre descend de 26 (posée sur son halo) et s'épaissit ×1,7 (pièce d'exposition, longueurs vraies). `newRod` : déplaceur allongé de 32 vers le bas, l'eau du bas résorbée. `heal(S.depuis)`. Course de `rod` réduite à 28 % en `solo` (rod 0,6 = pose sur la table, pas sous le sol).
- `rep` : graphite, barre, canal droit s'enfoncent ; un bloc d'eau monte autour du canal gauche (même front de vapeur) — aucun graphite.

## Planches (.cache/planches/CR01/canal/) — 32 vignettes lues (budget 30 dépassé de 2)
- p1 : lumière des PointLight (26) qui lave tout, graphite aussi clair que l'eau, neutrons en points. → p2 : lumière 6, tons clay plus écartés : toujours gris partout. → p3 : gris posés à la main : vapeur noire à bulles autour de la pile chaude (5b), eau du bas claire sous le pied rouge et gouttes (2a), absorbant qui entre (3). → p4 (avec en-tête) : xénon lisible, barre seule rouge puis verte sans eau dessous, crayon français dans son eau puis vapeur, couverture : la plaque haute juste sous l'en-tête.
- Corrigé après p4, non revu à l'œil : neutrons de la loupe qui partaient du centre des noyaux (cachés dedans) → partent de leur surface ; noyaux 3,6 → 4,4 ; lumière 4 → 2,5 ; émission max 0,85 → 0,75 ; barre seule ×1,7.

## Poses (sur le vrai décor)
- `VIEW.canal` tel quel : plaque haute à ≈ 420 px (sous l'en-tête), bas de la plaque basse ≈ 1200 px. La tranche fait ≈ 40 % de la largeur.
- `VIEW.fuel` : la loupe y fait ≈ 28 % de la largeur ; pour la regarder de près : `{ tx: 3983, ty: 128, tz: -44, d: 240, az: -72, el: 4, shift: 0, dof: 6 }` (4c de p4).
- `VIEW.rodSolo` : la barre (épaissie) tient debout sur son halo, l'absorbant se fond dans l'en-tête.
- `fs` : 120 la tranche, 60 un gros plan (fx fy fz sur le sujet).

## État final
- `npm run check -- CR01` passe (48/48 contraste ; avertissements X4122 / X4008 / X3577 = bruit connu du compilateur).
- Pas encore au niveau / non fait : l'eau ne « frémit » pas (surface immobile) ; à `pLow` 1 en gros plan (`canalLow`), la lueur du bas déborde en halo blanc sur le graphite voisin — à juger sur le brouillon ; les corrections d'après p4 (loupe, lumière, barre épaissie) n'ont pas été revues à l'œil (budget d'images épuisé).

## À changer ailleurs
- rien d'obligatoire. Suggestion aux actes : pendant `split` 0,9 → 1 la loupe se referme — tenir `split` 1 à la fin de « cassent d'autres atomes ».
