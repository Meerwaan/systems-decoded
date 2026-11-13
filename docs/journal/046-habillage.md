# 046 · `src/habillage.js` — journal du décorateur

2026-11-13. Habille `raffinerie.js` (la raffinerie au crépuscule). Rien sur le réseau de torche ni devant lui, rien sur le lave-vaisselle du 047, rien de neuf dans le ciel ni d'usine en plus.

## Lu
recette-decorateur, recette-agents (cadre, première image, économie), regles-image, 046-actes (haut, tables, candidates), 046-actes-maj, world.js (POSE0, FIRST, VIEW, STAGED), plan.js (positions), journal de raffinerie.js, raffinerie.js (usine du fond, `update`), details.js (en-tête, `glow`, `done`, `update`).

## Les touches (trois)
1. **Les lampes de l'usine** : 13 points de lumière encre fixes (`glow` « far », 240 cm, k 1,5) sur les plateformes des colonnes du fond, le haut des sphères, les blocs, l'aéroréfrigérant et le long rack (x −2630 → −4200). À 16:30 en hiver l'usine tourne, ses lampes sont allumées : un lieu où l'on travaille, sans personne à l'image. Se voit sur `VIEW.columns` (entre les pieds des colonnes), l'usine au repos, `VIEW.flare`.
2. **La route du site** : cinq lampadaires tous les 25 m le long de z −5200, de x −1500 à +8500 (mât en trait encre 0,22, crosse, lumière 280 cm k 1,6). L'échelle (un lampadaire fait 10 m) et une profondeur dans le noir en haut à gauche des plans larges. Limitée à cinq : au-delà de x 8500 la rangée passait derrière la flamme sur `VIEW.flare` (essai 2).
3. **La manche à air** : un mât de 14 m à (+1400, +400), 14 m au-delà de la cheminée, côté opposé au réseau ; une manche de verre (3,8 m, six bagues en trait) qui pend vers −x, comme le vent de `flamme.js` (WIND −1) couche la fumée sur l'usine : elle dit où irait le gaz. Se balance lentement (≈ 0,06 Hz, jamais de battement). Trait sombre sous le trait encre (silhouette sur un halo). Vue sur `VIEW.flare`, à droite de la cheminée.

Toutes suivent `shell` (0 sur l'établi) et `time` ; aucune n'est dans POSE0, la fenêtre du like, le compresseur.

## Accroche dans le décor (3 lignes, faites)
`raffinerie.js` : l'import de `dressRaffinerie`, `const dress = dressRaffinerie(); group.add(dress.group);` après le ciel et le sol, `dress.update({ amount: sh }, time);` après `plant.visible`.

## Planches (`.cache/planches/046/habillage/`)
- `avant.jpg` / `apres.jpg` : 8 instants (image 0 à 0,04 et 0,7 ; compresseur ; colonnes ; collecteur ; usine au repos ; « rien n'a explosé » ; fenêtre), mêmes poses. Image 0 : **identique** (colonnes rouges derrière le pied, bout et pilotes intacts).
- `apres1.jpg` : trop discret, route qui file vers la flamme sur `VIEW.flare` → route déplacée sur z −5200, lumières grossies.
- `grand.jpg`, `grand2.jpg` (540 px) : manche flottante au bord du cadre de l'usine au repos, son mât perdu dans le halo → trait sombre ajouté, puis déplacée en (+1400, +400) (hors usine au repos, hors fenêtre).

## Pas au niveau
- L'habillage est discret à 270 px : il se devine (des lumières, une profondeur) sur les colonnes et les plans larges, il ne change rien aux plans serrés. C'est voulu, mais il ne « fait » pas le lieu à lui seul.
- La manche à air est petite sur `VIEW.flare` (≈ 15 px de long à 270 px) : un détail pour l'œil qui reste, pas une lecture.
- Images lues : 40 (au-delà des 24 : trois planches de 8 et deux de 4 de trop).

## À changer ailleurs
- Rien d'obligatoire. Facultatif : `docs/catalogue.md` / `details.js` — une brique `windsock({ at, h, toward })` pourrait resservir (aéroport, port, plateforme).
