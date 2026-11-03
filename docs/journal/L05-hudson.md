# L05 · hudson.js — journal du décor

New York à l'échelle vraie sous l'avion (Hudson, Manhattan, arrondissements, LaGuardia, Teterboro, pont George-Washington, hélicoptère, bateaux, ciel d'hiver, mer de nuages).

## Fait
- (en cours) lecture : recette-agents, regles-image, L05-decors § hudson.js, plan.js (GEO, PATH, pathAt), world.js (apply : `geo` tourné et glissé, ctx), build3d, 026/sky (dôme), L04/navire (mer).

## Choix
- Dôme à l'infini (vertex `position*1000`, profondeur au fond) dans `group` ; il lit la direction et l'œil dans le repère géographique par `uToGeo` (inverse de `group.matrixWorld`, posé dans update) : ciel, soleil 228° / 12° (calculé : 15 h 30 EST, 15/01, 40,7° N), sol en grille (pas de sol plein), masse de la ville lointaine (texture de densité tirée des blocs), mer de nuages (`high`).
- Ville : blocs instanciés, verre maison (remplissage par face + arêtes au shader, largeur en pixels, effacées sous ~8 px ; étages tous les 3,8 m effacés avant le scintillement) ; une passe de profondeur d'abord (comme `asShell`) : seule la face la plus proche s'allume.
- Eau : rubans opaques (Hudson prolongé par la baie, East River, Harlem), vagues au shader (effacées par `fwidth`), reflet du ciel, scintillement du soleil, berges en trait, courant en tirets qui filent au sud, `riverLit` front veille du nord au sud, buée `cold` en rasant.

## Fait (suite)
- Planches b1 → b7 (`.cache/planches/L05/hudson/`). Ce qui a raté et pourquoi :
  - b1 : l'eau invisible (rubans vus de dessous, culled) → `DoubleSide` ; ciel et grille trop faibles (×2,5) ; les arrondissements en carreaux épars → îlots de maisons mitoyennes (deux ou trois rangées par îlot, un km² sur huit vide, 7 % de barres de 25–60 m, grappes de tours Jersey City / Long Island City / Downtown Brooklyn).
  - b2–b3 : le courant en tirets réguliers se lisait comme l'axe d'une piste → traînées d'écume éparses, de longueurs variées, qui dérivent au sud ; reflet du soleil en tache blanche → resserré ; la mer de nuages ressemblait à une mer → grandes boules (6,5 km, 2,6 km, 0,9 km) éclairées par le soleil bas ; `riverLit` teintait toute la surface → berges veille + lueur le long des berges seulement.
  - b4 : vagues rasantes en rayures → chaque train de vagues va et vient (bruit), pentes longues baissées.
  - b6–b7 : la silhouette de Manhattan se perdait dans la bande claire de l'horizon → le dôme est dessiné APRÈS la passe de profondeur des blocs (renderOrder 11) : les tours se découpent sombres sur le halo, arêtes allumées (plus fortes sur les tours > 40 m, moins mangées par le brouillard).
  - Transition `high` 1 → 0,6 → 0,3 → 0 (b4) : la mer de nuages s'éteint, la grille puis la ville reviennent ; rien ne traverse l'avion (le plafond reste 3,8 km sous lui).
- Images lues : 48 vignettes (7 planches) — au-delà du budget de 30 (je comptais une planche pour une) ; rien de plus après b7.

## Nombres lus
- `city` blocs + pont (× (1 − la montée de `high`)) · `river` les rubans d'eau · `riverLit` front veille du nord (pont) jusqu'à la baie, sur l'Hudson seul · `airports` pistes LGA 4/22 et 13/31, TEB 1/19 (asphalte, marques, feux) · `lgaSig` pistes et feux de LGA en signal + une lueur et un anneau signal au-dessus du terrain (toujours devant : ce sont des repères) · `boats` 0→9 : chaque bateau i arrive de 450 m, proue la première, quand `boats` passe de i à i+1 (sillage tant qu'il court, anneau d'eau ensuite) ; 0 le premier ferry nez contre le bord d'attaque de l'aile gauche ; 7 le bateau-pompe, 8 les garde-côtes ; placés autour de l'avion à `pathAt(ctx.t)` · `heli` l'hélicoptère (rive ouest, 330 m, cap nord sur le fleuve à 25 m/s, part de (3,55 ; −7,6) km à 15:28:36) et son anneau signal · `cold` buée sur l'eau en rasant + brume au pied de l'horizon · `flow` traînées d'écume au sud · `high` mer de nuages (0,35→0,85) et sol qui s'efface (0,2→0,75) · `haze` la bande de l'horizon (le brouillard reste à world.js).

## Poses (repère de l'avion, prêtes à coller ; toutes `...SHARP`)
- over860 (track 1631) : `{ ...P, tx: 0, ty: -1500, tz: 6000, d: 16000, az: 178, el: 6, fov: 40, ...SHARP }` — le Bronx en rangées, la Harlem et l'Hudson qui brillent vers le soleil bas, le soleil en haut du cadre.
- descent (track 1745, NOUVELLE) : `{ ...P, tx: -3000, ty: -1500, tz: 0, d: 16000, az: 82, el: 7, fov: 38, ...SHARP }` — l'avion qui descend l'Hudson, Manhattan à gauche, sa silhouette devant. La meilleure image « New York ».
- lookBack (track 1660, lgaSig 1) : `{ ...P, tx: 4000, ty: -1200, tz: 1500, d: 8000, az: -114, el: 7, fov: 38, ...SHARP }` — l'anneau signal de LaGuardia juste sous l'avion, loin derrière.
- runway (track 1494, gearDown 1, airports 1) : `{ ...P, tx: 600, ty: -300, tz: 0, d: 7000, az: -129, el: 3, fov: 34, ...SHARP }` — le seuil (bandes), les feux, la tour de LGA, la silhouette de Manhattan au fond.
- heli (track 1730, heli 1) : `{ ...P, tx: -4600, ty: -10800, tz: -3000, d: 30000, az: 70, el: 26, fov: 34, ...SHARP }` — l'hélicoptère 216 m sous l'avion, 92 m devant, cerclé (à 1716 il est 1,7 km devant, 300 m sous).
- toWater (track 1830) : `{ ...P, tx: -500, ty: -200, tz: -1500, d: 9000, az: -112, el: -3, fov: 38, ...SHARP }` — de devant, au ras : le pont au fond à gauche, Manhattan à DROITE (le pont est au nord : de devant, Manhattan est forcément à droite ; « Manhattan à gauche » = de derrière, sans le pont).
- water (track 1860, boats 1) : `{ ...P, tx: -300, ty: -120, tz: 0, d: 9000, az: -150, el: 3, fov: 34, ...SHARP }` — à flot, le mur de tours de Midtown derrière, le premier ferry.
- ferries (boats 9) : celle de l'architecte tient : `{ ...P, tx: 0, ty: -120, tz: 0, d: 14000, az: -30, el: 30, fov: 36, ...SHARP }`.
- skyHigh (high 1) : `{ ...P, tx: -500, ty: -600, tz: 0, d: 7000, az: 60, el: 12, fov: 36, ...SHARP }` — la mer de nuages ; la même pose à `high` 0 (track 1700) montre le pont George-Washington en bas à gauche.

## Pas encore au niveau
- Vue de haut (over860), la ville n'est « que » des îlots en verre : Manhattan ne se distingue que de côté (silhouette sur l'horizon) ou depuis l'eau ; de haut, pas de signature (Central Park est un vide, peu lisible à 860 m).
- La piste : le bas du cadre reste noir (pas de baie de Flushing modélisée) ; `cold` ne se voit pas sur la piste.
- Le scintillement en mouvement (image 8) n'a pas été vérifié en vidéo : tout ce qui est fin s'efface par `fwidth` (arêtes < 8 px, étages, vagues < 10 px, grille), mais à confirmer sur le brouillon (`qa`).

## À changer ailleurs
world.js · VIEW, remplacer / ajouter ces lignes :
```
  over860: { ...P, tx: 0, ty: -1500, tz: 6000, d: 16000, az: 178, el: 6, fov: 40, ...SHARP }, //       track 1631: the Bronx in rows, the Harlem and the Hudson glinting toward the low sun
  descent: { ...P, tx: -3000, ty: -1500, tz: 0, d: 16000, az: 82, el: 7, fov: 38, ...SHARP }, //       track 1745: down the Hudson, Manhattan's skyline ahead on the left
  lookBack: { ...P, tx: 4000, ty: -1200, tz: 1500, d: 8000, az: -114, el: 7, fov: 38, ...SHARP }, //  track 1660, lgaSig 1: LaGuardia's ring under the plane, far behind
  runway: { ...P, tx: 600, ty: -300, tz: 0, d: 7000, az: -129, el: 3, fov: 34, ...SHARP }, //          track 1494: the threshold, LGA's tower, Manhattan far behind
  heli: { ...P, tx: -4600, ty: -10800, tz: -3000, d: 30000, az: 70, el: 26, fov: 34, ...SHARP }, //    track 1730: the helicopter 216 m under, ringed
  toWater: { ...P, tx: -500, ty: -200, tz: -1500, d: 9000, az: -112, el: -3, fov: 38, ...SHARP }, //   track 1830: from ahead, low: the bridge far left, Manhattan right
  water: { ...P, tx: -300, ty: -120, tz: 0, d: 9000, az: -150, el: 3, ...SHARP }, //                    track 1860: afloat, Midtown's wall of towers behind
  skyHigh: { ...P, tx: -500, ty: -600, tz: 0, d: 7000, az: 60, el: 12, fov: 36, ...SHARP }, //         high 1: the cloud deck far below
```
docs/catalogue.md (une ligne) :
- **New York à l'échelle vraie** `L05/hudson.js` — L'Hudson et l'East River (vagues, reflet du soleil bas, courant, `riverLit`), Manhattan et les arrondissements en ≈ 18 000 blocs de verre (silhouette sombre sur l'horizon), LaGuardia et Teterboro, le pont George-Washington, un hélicoptère cerclé, neuf bateaux pleins autour d'un point, ciel d'hiver, mer de nuages. Entrée `buildHudson()` (+ `makeFerry()`), état `city river riverLit airports lgaSig boats heli cold flow high haze`, lit ./plan (GEO, KM, DAY, pathAt) ; le décor ne bouge jamais son groupe (le monde le place).
