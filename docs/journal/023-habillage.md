# 023 · habillage.js — journal du décorateur

Propriétaire : `episodes/023-eolienne-de-secours/src/habillage.js` (+ 3 lignes dans `avion.js` : l'import, `dressAvion({ plane, island, group })` après `A.island`, `dress.update(P, time, px)` à la fin d'`update`). Rien dans `model.js`, `world.js`, les actes, `episode.json`, `audio/`. Budget : 30 images.

## Planche avant (8 vignettes : P1, P2, P3, large, « vise une île », approche à l'aube, « aucun mort », toi)

- Moitié basse des cadres de nuit (P1–P4) : un noir sans profondeur, la mer à peine lisible.
- Large et approche : une île sans vie (un plateau, sa grille, sa piste) ; une mer vide.
- Ciel : noir, pas une étoile.
- Cabine (toi) : des têtes qui flottent (`pax`), pas un siège.

## Touches posées (toutes en encre, aux rayons X, loin ou dans le verre)

| touche | raison | suit |
| --- | --- | --- |
| Les étoiles : ≈ 1 100 points à l'infini (≥ 2,4 px, fixes, voilés près de l'horizon) | nuit sans lune au-dessus de l'océan (nouvelle lune le 19/08/2001 : le croissant était couché bien avant 6 h) | `dawn` (s'effacent entre 0,05 et 0,75) |
| Une couche de nuages en traînées, ≈ 6 000 m vrais sur l'échelle de l'altimètre : des voiles allongés, doux, striés dans leur longueur, **sans contour** | donne sa profondeur à la moitié basse des plans de nuit ; dans l'accroche, des traînées basses vers l'horizon | `alt` (partis entre 9 600 et 6 400 m : l'avion ne les traverse jamais), `dawn` (×1,7, leurs sommets prennent la première lumière) |
| Terceira habitée : des villages en grappes le long de la route côtière, deux villes (Praia, à côté du seuil ; Angra, de l'autre côté) | « l'île a des lumières » — elle est vivante, on y attend l'avion | `dawn` (pâlissent de 40 %) |
| Les rangées de sièges : un dossier derrière chaque tête (38 rangées × 8) | « la cabine a ses rangées » ; les têtes ne flottent plus | `shell` ; visibles seulement de près (< 15–32 m) et à hauteur de cabine : de dessous (ventre, soute, accroche) ils n'existent pas — rien derrière la RAT |

Aucun nuage dans deux fois le rayon de l'île ni le long de la route de l'avion vers elle (|z| < 260 m, x de −300 à 1 500 m dans le repère de l'île) : les plans larges regardent l'île à travers la couche à cet endroit. Les lumières ne touchent ni la piste (|z| > 0,8 × sa largeur + 7 m) ni son approche.

## Essais et reprises

- 1er jet : nuages trop rares (4 % de la mer couverte) et trop loin dans l'accroche (pont à 1 800 m vrais : 24 km dessous, le cadre ne les voit qu'au ras du bas) → 620 voiles, pont à 6 000 m.
- Nuages à contour vus de haut : on lisait **d'autres îles** dans le plan large → contour retiré, corps doux strié, couloir dégagé devant l'île.
- Sièges trop clairs (dalles blanches qui couvraient la cabine) → divisés par ≈ 3.
- Un navire au loin (feux + sillage) : posé deux fois, jamais vu dans un plan → retiré (« ce qu'on habille doit être vu »).

## Où ça se voit

- **P2** (puis P1) : les traînées sous l'avion, basses vers l'horizon — la mer a enfin une profondeur. C'est la candidate de la première image qui en profite le plus.
- « Vise une île », approche à l'aube : les lumières de Praia près du seuil, les villages sur les côtes ; des traînées de part et d'autre à l'horizon.
- Toi (`VIEW.you`) : les rangées de dossiers autour de toi.
- Étoiles : discrètes (un point par-ci par-là en vignette) — voulu.

## À dire aux actes (pas d'« À changer ailleurs »)

- Plans de toi en cabine : `pax` ≥ 0,4, sinon les sièges sont vides autour de toi.
- La couche de nuages part pendant la longue phrase du plané (`alt` 9 600 → 6 400) : un fondu d'une à deux secondes, à regarder au brouillon.

## Pas au niveau

- Étoiles presque invisibles en vignette de 270 px (assumé : « s'y devine »).
- Angra, de l'autre côté de l'île, se voit peu : le bord du plateau la cache dans les plans de derrière.
- Rien de l'habillage n'a été vu en mouvement (pas de brouillon) : à `qa` de dire s'il reste une image parasite (aucun élément fin qui tourne, aucune lueur qui clignote).

## Contrôle

`npm run check -- 023` passe (0 erreur, contrastes 59/59 ; l'avertissement « canvas au bord » est celui du modèle).

## Images lues

7 / 30 (planche avant, quatre planches après, une planche de 4 en 540 px avec les zones).
