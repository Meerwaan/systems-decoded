# CR04 · Lac-Mégantic — journal de `ville.js`

2026-11-14. Le centre-ville d'argile, rue Frontenac, le « 16 », les lumières, la lueur.

## Fait
- Lu : recette des agents, règles d'image, section `ville.js` de `docs/CR04-decors.md`, `plan.js`, `world.js` (FIRST, VIEW, apply), API `reconstitution.js`, `lightsMat` du `piste.js` du CR03 (repris et étendu).
- **Le repère de la ville** : (u, n) — u le long de la voie, n le décalage d'équerre (+ à gauche, l'intérieur de la courbe ; − à droite, vers le lac). Dans la courbe, u constant = un rayon : rue Frontenac traverse la voie d'équerre.
- **Rangées** à n = 92, 248, 410 (gauche, la 3ᵉ de 22 500 à 26 000) et −92, −248 (droite) ; **rues longues** à n ±165, ±328 ; **rues en travers** à u 21 980, 22 660, 23 180, Frontenac (23 700, demi-largeur 52), 24 440, 25 120, 25 780, 26 420. Commerces à toit plat (2 ou 3 étages, corniche, bandeau de vitrine) de Frontenac −1 100 à +1 000, maisons à deux pans (cheminées) ailleurs ; **l'église** (nef 220, clocher 168 + flèche 128) à u 24 700, n 600.
- **Le terrain du déraillement** (u 23 980 → 25 420) : aucun bâtiment à moins de 150 de l'axe (la rangée 1 y manque des deux côtés).
- **Le lac** à droite, rive à n ≈ −440 (ondulée), jusqu'à n −4 200 : aplat sombre lisse, un trait de rive fin.
- **Lumières** : chaque fenêtre est une vitre sur la façade (sombre, ou ambre si allumée), estompée au loin (1 600 → 3 600) ; chaque fenêtre allumée est AUSSI un point de lumière à taille minimale en pixels, qui apparaît au loin (1 500 → 3 200). Réverbères (mât, bras, tête ambre, point, flaque au sol) le long de Frontenac et des rues longues.
- **Le passage à niveau** : platelage en trois bandes entre et hors des rails (sous le champignon), deux mâts (croix de Saint-André claire, deux feux rouges dos à dos sous visière), feux A / B en alternance à 0,9 Hz avec `cross`.
- **Le « 16 »** : poteau, plaque claire 13 × 10,4, chiffres tracés au pinceau dans un canvas (pas de police à attendre), sur les deux faces.
- **La lueur** : trois panaches (billboards additifs, cœur bas caché par les toits, longue traîne qui s'amincit), qui montent avec `glow` et respirent lentement ; une lumière rouge ponctuelle (sans ombre) teinte les murs et les toits autour.
- Les arêtes s'effacent sur les plans lointains (7 000 → 13 000 de la caméra) et prennent le brouillard.

## Planches
1. `v1.jpg` (8) — lumières lisibles depuis la vallée (une ligne scintillante) ; ville trop clairsemée, rues invisibles (même valeur que le sol), lac couvert par la grille, la lueur = une bande rouge au ras des maisons (la lumière ponctuelle sur le sol), pas un panache. Corrigé : rues plus claires, rangées plus pleines, lac et rues relevés au-dessus de la grille, panaches plus hauts et plus étroits, lumière ponctuelle réduite.

2. `v2.jpg` (8) — rues lisibles, ville pleine, la lueur devenue un pilier rouge (trop étroit) ; le lac invisible (ruban tourné vers le bas : `DoubleSide`) ; `VIEW.panneau` tombait DANS une boutique de la rangée 1 (n 64) → un coin dégagé autour du « 16 » (`OPEN` : u signU −230 → +130, n 0 → 170).
3. `v3.jpg` (8) — « 16 » lisible de près et dans `panneau` ; `roue` tournée à gauche : les lumières au centre de l'horizon ; lueur trop large (un voile sur le haut du cadre) ; le poteau traversait la plaque (plaque épaissie à 2,2).
4. `v4.jpg` (8) — `frontenac haut` : le train entre les commerces, le « 16 », les mâts : le meilleur plan de la ville ; la lueur derrière les toits juste à `glow` 0,4–0,6, trop forte à 1 (réduite : uK 0,78, panaches 760/600/500 de large) ; les feux du passage à niveau ne se voyaient pas depuis la voie (ils regardent la route, et les points étaient dans les visières) → points sortis de 5,4 devant chaque visière.
**32 vignettes lues** (budget de 30 dépassé de 2) : les deux dernières corrections (lueur réduite, feux sortis des visières) n'ont PAS été revues à l'image.

## Poses qui cadrent (monde, prêtes à coller)
- **roue, les lumières au centre** (au lieu de `VIEW.roue`, qui les met au bord gauche) : `lookFrom(L([-37.4, 1.6, 7.0]), L([-77.4, 2.6, 5]), { fov: 54 })`.
- **frontenac, le train entre les commerces** (de trois quarts haut, en aval du passage à niveau) : `lookFrom(T(FRONTENAC.u + 400, [0, 160, 120]), T(FRONTENAC.u - 450, [0, 10, 0]), { fov: 34 })` = `{ tx: -23250.35, ty: -800.76, tz: 0.48, d: 848.99, az: -71.5, el: 8.28, fov: 34 }`, foyer `lit(T(FRONTENAC.u - 300, [0, 10, 0]), 260)`.
- **frontenac bas** (de face, au ras, à droite de la voie) : `lookFrom(T(FRONTENAC.u + 140, [0, 9, -22]), T(FRONTENAC.u - 380, [0, 16, 2]), { fov: 34, shift: 40 })` — la voie courbe, le « 16 », les mâts ; `VIEW.frontenac` (n +26) a le mât gauche en plein premier plan.
- **le « 16 » de près** : `lookFrom(T(FRONTENAC.signU - 34, [0, 26, 34]), T(FRONTENAC.signU, [0, 27, 20]))`, foyer `lit(T(FRONTENAC.signU, [0, 20, 20]), 40)`. `VIEW.panneau` marche (coin dégagé) mais coupe la plaque en haut : `shift` 0 ou cible à y 22.
- **haut** (la ville entière, la lueur derrière) : `{ tx: -23926.94, ty: -834.44, tz: 312.73, d: 1995.63, az: 47.49, el: 28.29, fov: 34 }`.
- **courbe** : `VIEW.courbe` tient (le lac noir au premier plan, les toits, la lueur au-dessus), le lac occupe la moitié basse : `shift` −200 environ, ou la caméra plus basse (y 380).

## À changer ailleurs
- `episodes/CR04-lac-megantic/src/world.js`, `VIEW.roue` (si la candidate (a) est gardée) : `roue: lookFrom(L([-37.4, 1.6, 7.0]), L([-77.4, 2.6, 5]), { fov: 54, shift: 0 }),`
- `episodes/CR04-lac-megantic/src/world.js`, `VIEW.frontenac` : `frontenac: lookFrom(T(FRONTENAC.u + 400, [0, 160, 120]), T(FRONTENAC.u - 450, [0, 10, 0]), { fov: 34, shift: 0 }),`
- `convoi.js` (pour son agent) : le terrain du déraillement est libre à moins de 150 de l'axe entre u 23 980 et 25 420 ; au-delà commencent les maisons de la rangée 2 (n ±248, profondeur jusqu'à 84) : les citernes couchées doivent tenir dans |n| < 200.
