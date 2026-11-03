# L05 · carte.js — journal

Agent décor, 2026-11-02. La maquette de New York au 1 : 2 000 et le bassin d'essais.

## Lu
recette-agents, regles-image, L05-decors (haut + § carte.js), recette-long-image § 3, plan.js, world.js (FIRST, AT, VIEW, apply), bouchon carte.js, kit build3d (solid/glass/asShell/lineMat/fatLine/plate/lathe/box), atmo (makeSurface), L04 bord.js (table, jetons), L02 ligne.js (buildMap).

## Choix
- Table pleine (terre gris sombre), eau en creux plus sombre (rubans le long des axes GEO, berges en traits), Manhattan en blocs de verre sur la trame des avenues (Central Park en creux), quartiers bas et clairsemés, LGA/TEB (champs + pistes en traits), pont GW plein (tours, tablier, câbles).
- Glyphe : silhouette d'A320 pleine et claire, ombre portée juste dessous + fil vertical ; **taille d'écran tenue** (×1 à ×2,6 selon la distance caméra) pour rester ≥ 3 % de la largeur en plan large.
- Lignes à largeur d'écran (≥ 4,5 px à 1920) ; tracés révélés sans allocation (écriture directe dans les tampons de LineSegments2).

## Fait (quatre planches de 8 + mesures)
- p1 : glyphe minuscule (capture de caméra trop tard), passes en boucles (poursuite qui rate son point d'approche), courant du fleuve en « marquage routier », quartiers en confettis, bateaux trop petits.
- p2/p3 : glyphe ajusté **au moment où la table se dessine** (`onBeforeRender` de la table, `renderOrder −1`, avec la caméra qui dessine : aucune image de retard) — ≈ 10 % de la hauteur d'image, ×1,4 à ×3,6. Passes : virage du côté le plus court (à gauche depuis l'impact), puis droit sur le seuil, coins arrondis (Chaikin), rééchantillonnées. Courant en traînées douces (0,085). Quartiers en tissu régulier (une trame par quartier). Bateaux ×2,4. Radio : cassure plus courte, la partie lointaine reste lisible.
- p4 : bassin — une **tache de bloom** sur toute la droite : le reflet de la lumière de contour (veille) sur l'eau lisse ; et le couvercle de la cuve (face du haut, rasante) qui s'allumait. Corrigé : eau mate, cuve ouverte (quatre parois). Vérifié sans relire d'image (moyenne de luminance de la moitié droite : 180 → 17–52).
- Gerbe du toucher dur : 300 gouttes (vérifiée à 170 sur p4 ; la version à 300 n'a pas été regardée).

## Poses (prêtes à coller dans VIEW, toutes vues sur planche sauf mention)
- mapWide: { ...P, tx: 200, ty: 0, tz: -230, d: 1650, az: -6, el: 52, ...SHARP } — toute la maquette, trace piste 4 → Hudson.
- mapPlan: { ...P, tx: 220, ty: 0, tz: -200, d: 1750, az: 8, el: 46, ...SHARP } — avec `charlotte` 1 : la route prévue part au sud-ouest.
- mapStrike: { ...P, tx: 435, ty: 30, tz: -420, d: 700, az: 20, el: 35, ...SHARP } — inchangée (glyphe, radio vers l'est et sa cassure, Charlotte).
- mapLGA / mapTEB / mapRiver / mapFerries : inchangées (lues sur p2).
- mapSims: { ...P, tx: 420, ty: 0, tz: -280, d: 1000, az: -10, el: 58, ...SHARP } — l'éventail : LGA en bas à droite, TEB à gauche, la passe en retard en haut.
- basin: { ...P, tx: 2975, ty: 3, tz: 0, d: 250, az: -28, el: 11, ...CLOSE } — la maquette d'avion à ≈ 25 % de la largeur, la gerbe dans le cadre.

## États utiles
- `track` en CARTE : l'heure du glyphe (−1 suit l'horloge). Options : opt 1 à `track` 1685, opt 2 à 1711, opt 3 à 1761, opt 4 à 1790 (+ `riverLit` 1). Passes : `route` 1631, `glyph` 0. Bateaux : `track` ≥ 2100 (le glyphe a dérivé), `boatsMap` 0 → 1 (le premier part à 0, le dernier arrive à 0,92).
- Bassin : `dropK` 0 → 1 (touche à 0,6) ; puis `dropFast` 0 → 1 (touche à 0,55), `dropK` laissé à 1 garde la trajectoire douce en pâle sous la raide.

## À changer ailleurs
world.js, dans VIEW (remplacer ces lignes) :
  mapWide: { ...P, tx: 200, ty: 0, tz: -230, d: 1650, az: -6, el: 52, ...SHARP },
  mapSims: { ...P, tx: 420, ty: 0, tz: -280, d: 1000, az: -10, el: 58, ...SHARP },
  basin: { ...P, tx: 2975, ty: 3, tz: 0, d: 250, az: -28, el: 11, ...CLOSE },
et ajouter :
  mapPlan: { ...P, tx: 220, ty: 0, tz: -200, d: 1750, az: 8, el: 46, ...SHARP }, // the route planned to Charlotte (charlotte 1)

## Pas encore au niveau
- La table reste sombre et un peu plate en plan large (la terre, un seul gris) ; Manhattan se lit, les autres quartiers sont une texture.
- Les 15 passes forment un faisceau serré au départ (normal : un seul point d'impact) ; lisible à 405 px mais dense.
- Gerbe du toucher dur : des gouttes rondes, pas encore une vraie nappe d'eau.
- Images lues : 32 (budget 30 dépassé de 2 : p1 à p4) ; la correction du bassin vérifiée par mesure, pas à l'œil.
