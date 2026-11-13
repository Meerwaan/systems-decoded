# 047 · cuisine.js — journal du décor

Consigne : cuisine du 009 importée telle quelle (enveloppe, comme 018/cuisine.js), plan de travail au-dessus du lave-vaisselle, robinet, évacuation, toi à l'évier, deux colonnes de volume. Contrat : `docs/047-decors.md` § cuisine.js.

## Lu
- recette-agents, regles-image, 047-decors (haut + ma section), plan.js, world.js, bouchon, 018/cuisine.js, 009/kitchen.js (buildKitchen, sol, traits, update), kit figure/build3d/atmo (API).

## Constats sur le 009 déplacé (KITCHEN.at = −292, 0, −30)
- Le 009 dessine le coin de sa pièce à x 300 (son repère) : ici x = 8, en plein milieu du lave-vaisselle (trait vertical de 236 cm et trait au sol le long de z). Son sol (plan 760 × 520) s'arrête aussi à x = 8 : les colonnes (x 48 et 68) seraient hors du sol.
  → enveloppe : je retire ces segments de la géométrie des traits « fine » à l'exécution (sans toucher au fichier du 009), je redessine le mur jusqu'à x 120 et le coin là, et j'élargis le sol (plan 900 × 560) ; le sol passe en double face pour `VIEW.below`.
- Le fondu en profondeur des traits du 009 est centré sur sa colonne de four : recentré sur le lave-vaisselle (repère 009 : 300, 90, 30 ; portée 320).
- Toi dans `VIEW.kitchen` (note de l'architecte) : `you` vaut 0 sur ce plan (047-actes.md l. 128) ; je te place quand même à droite de l'évier (x −152, z 47), tourné de trois quarts vers lui (18°) : sur `VIEW.sink` tu es décalé de ≈ 41 cm à droite de la cuve d'évier au lieu de la couvrir.

## Fait
- `src/cuisine.js` écrit (≈ 480 l.), API inchangée : `buildCuisine()` → `{ group, kitchen, A, update(P, time, px) }` (+ `you`, la figure, en plus). `A` : sink, tap, plate (l'objet qui porte l'assiette : bouge et s'incline avec elle), drain, waste, columnM, columnH.
- Cuisine du 009 enveloppée : coin et pied de mur à x 8 retirés de ses traits (géométrie refaite à l'exécution), mur prolongé et coin à x 120, carrelage continué au-dessus du lave-vaisselle, sol élargi et recentré (son `uCentre` est en coordonnées MONDE : le `floorAt` [292, 60] du plan tombait à 2,9 m à droite ; remis à (0, 30)), fondu des traits recentré sur le lave-vaisselle, niche du four garnie d'une boîte de verre.
- Plan de travail au-dessus de la machine (même verre plat, traits forts du 009) et un panneau de fin à x 31.
- Sol vu de dessous (`VIEW.below`) : une grille à moi, faces tournées vers le bas (celle du 009 ne se voit que d'en haut). Elle se lit, sobre.
- L'eau du robinet : colonne additive ink (bandes lentes qui descendent, frisson du rayon, < 1/9 de période par image), couronne de lumière où elle tombe, flaque dont les anneaux se referment sur la bonde (devient `signal` avec `drain`) ; avec l'assiette dessous, elle tombe sur l'assiette et repart de son bord avant dans la cuve.
- Évacuation : tube de verre (siphon en J jusqu'au mur), dedans des têtes `signal` avec leur traîne (38 cm/s, période 21 cm), qui s'effacent en entrant dans le mur ; bagues aux deux bouts.
- Toi : `makeFigure` (verre de la tête aux mains, `ghost`), x −152, z 45, tourné de 18° vers l'évier, penché 12° → 25° ; les deux mains (moufles) sous le bord de l'assiette ; `rinse` 0 : assiette tenue devant la poitrine (56°), 1 : sous le robinet (30°, bord arrière haut). Reposé seulement quand `rinse` change, sans allocation.
- Colonnes : verre r 8, machine 58 cm de haut avec un seul anneau `veille` à 50 (dix litres), main 103 cm sans rien ; eau additive (veille k 0,85 / ink k 0,6), surface claire, halo au sol ; invisibles à 0, verre en fondu sur les 6 premiers pour cent.
- `night` : le verre de la cuisine à 28 % (sol à 75 %), toi et l'assiette à 65 %.
- `npm run check -- 047` passe (les contrastes signalés sont à 45,6 s, sur l'établi, pas chez moi).

## Images lues (30/30)
p1 (8) : poses de l'architecte. `VIEW.kitchen` (az −62, fov 34) ne contient PAS l'évier : il est à 11° de l'axe pour 9,7° de demi-champ horizontal ; les colonnes se superposent au flanc du lave-vaisselle. `VIEW.sink` : tes bras couvrent le haut du cadre.
p2 (8) : regarder le long du plan de travail (az −78 à −84) empile les planches de verre du 009 en une bande blanche, et la caméra entre dans la colonne du four (x −323 → −261) : à éviter. Évier : az −40 de plus loin est le meilleur (toi à droite, penché, l'eau, le J signal).
p3 (8) : colonnes déplacées à z 42 (essai local) : elles se lisent À DROITE de la machine depuis az −68 ; évier S3' validé ; grille de dessous validée ; nuit validée.
p4 (4) + p5 (1) : eau de près, colonnes pleines, cuisine de nuit, trait des dix litres séparé du bord.

## Poses qui cadrent (à coller dans world.js)
- `kitchen: { ...P, tx: -10, ty: 58, tz: 18, d: 330, az: -68, el: 16, fov: 40, shift: 110 }` — la machine et les deux colonnes à sa droite (avec COLUMNS à z 42) ; l'évier n'y entre pas (impossible en vertical sans empiler la cuisine), toi entres par la gauche si `you` 1.
- `sink: { ...P, tx: -160, ty: 92, tz: 15, d: 300, az: -40, el: 12, fov: 28, shift: 150 }` — toi à droite, penché sur l'évier, robinet, assiette, flaque, J signal ; ta tête passe sous l'en-tête.
- `columns` : celle de world.js suit COLUMNS (tx 68, tz 42) et cadre bien.
- `door` (nuit) et `below` : celles de world.js conviennent pour ce fichier.

## À changer ailleurs
- `episodes/047-lave-vaisselle/src/plan.js` : `export const COLUMNS = { r: 8, machine: [58, 0, 42], hand: [78, 0, 42], h: 50 };` (à z 12 elles se superposent au flanc du lave-vaisselle depuis az −62/−68 ; à z 42 elles sont devant le panneau de fin, à droite de la machine, sur toutes les poses ; la porte ouverte ne les touche pas).
- `episodes/047-lave-vaisselle/src/world.js` : `kitchen: { ...P, tx: -10, ty: 58, tz: 18, d: 330, az: -68, el: 16, fov: 40, shift: 110 },`
- `episodes/047-lave-vaisselle/src/world.js` : `sink: { ...P, tx: -160, ty: 92, tz: 15, d: 300, az: -40, el: 12, fov: 28, shift: 150 },`
- `docs/047-actes.md` l. 29 : « l'évier devant » ne tient pas en vertical ; sur `VIEW.kitchen` l'évier est hors champ, il entre au glissé vers `VIEW.sink`.

## Pas encore au niveau
- L'eau ink de la colonne de la main, peu remplie, se lit un peu comme un cylindre de plâtre (surface très claire) ; pleine, elle se lit en eau.
- Les bras de verre en très gros plan sont des tubes épais (figure du kit) : ne pas aller plus près que `VIEW.sink`.
