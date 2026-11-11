# 041 · whipple.js — le système (journal du décor)

Agent `decor`, 08/11. Fichier : `episodes/041-bouclier-iss/src/whipple.js`. Planches : `.cache/planches/041/whipple/`.

## Ce qui est construit (premier jet écrit d'un trait)

- **Le coupon courbe** (rayon depuis l'axe du labo, `onCurve(u, v, r)` : `u` le long de x, `v` l'arc mesuré sur la face extérieure de la tôle) : chaque couche est une dalle à **tranches nettes sur les mêmes plans radiaux**, chanfreinées (grille polaire autour du point d'impact, 96 × 22, plus dense près du trou). Tôle 2 mm (gris le plus clair, trou de 1,3 cm de rayon avec bouchon qui disparaît à `burst` 0,06, lèvre déchirée en 9 pétales vers le vide, chaleur signal qui s'éteint de 0,1 à 0,6, anneau de choc et tache de la bille qui approche dans son shader) ; matelas = céramique (gris clair mat, brûlure de cratère 0,7 → 0,85) sur kevlar (gris sombre, tissage au shader, effacé par `fwidth`) ; coque 4,8 mm (gris moyen, isogrille côté cabine, bombement ≈ 1,2 mm de 0,85 à 1, liseré veille à 0,94 → 1).
- **Arêtes** : lignes de crête (Line2, 2 px, ink 0,72) sur les chanfreins avant / arrière de chaque couche ; `lit*` les passe en veille (2,9 px) avec une lueur veille de 5 % sur les faces.
- **Le vide** (`litGap`) : un volume de lumière veille intégré au shader (24 pas) entre les deux faces courbes exactes, bords adoucis ; il suit l'éclaté.
- **La bille** : boule chauffée à blanc (vraie sphère, cœur ink, bord signal) + halo jamais sous 13 px, tiré vers l'œil de son rayon (une plaque qu'elle approche ne la coupe jamais) + traînée effilée en pixels d'écran (≥ 5,5 px à la tête), longueur `trail × 0,34 × distance à l'œil` (≈ 4 m vue de 1 150 cm). La tôle rougit là où elle va frapper (`dist` < 30).
- **La grosse** (7,4 cm, bloc facetté signal sombre, liseré signal en verre), **la balle fantôme** (lathe de 7,62, verre ink), **les jauges** (LineSegments2 ink 2,4 px ; la règle de 10 cm court radialement d'une face à l'autre, graduée au cm, sans chiffre), **le balayage** (bande ink qui glisse le long du chemin).
- **L'impact** : éclair (halo blanc qui gonfle à 0,025 et meurt à 0,11), lueur de naissance du nuage, **96 éclats + 192 débris + 64 points de pluie** en traînées instanciées (une seule fonction de `burst`, semée : `rng(4101)`), `molten` → jusqu'à 60 % de gouttes (tête ronde orange-blanc).
- **Le miroir** : plaque plate 6,8 mm avec trou bouché ; 0,4 contact (éclair), 0,4 → 0,8 cratère (cuvette chaude + couronne devant, dôme chaud derrière), 0,8 → 1 trou traversant, pétales arrière, bouchon qui part, jet serré de 40 éclats (cône 5°).

## Planche 1 (8 vignettes) — ce qui a raté

- Le grain d'usinage du kit (`finish`) strie la tôle en vaguelettes (contact : on dirait de la tôle ondulée) → `userData.finish = false` sur tout le coupon.
- La tôle plus sombre que la céramique : couleurs reprises (tôle 0xd3d8dd métal 0,3 ; céramique 0x868480 ; kevlar 0x4c4d51 ; coque 0x737980).
- `litGap` : un mur vert qui bave → amplitude 0,34.
- **Vue d'az −80, la face avant de la tôle, vue à 10°, couvre ≈ 7 cm du vide à l'écran et cache la naissance du nuage** (et reflète la boîte à lumière en bande blanche). On ne voit dans une fente de 10 cm, profonde de 40, qu'en la regardant **dans son plan** : az −88 à −92. → poses `cone`, `gap`, `pair` à reprendre (ci-dessous).
- La bille du crochet (POSE0, d 1 150) : un point de 7 px, illisible à 270 px → halo ≥ 13 px, traînée ≥ 5,5 px.
- `GAUGE10.y` −18,5 : hors cadre dans toutes les vues serrées (d 56 : ±15 cm). Voir « À changer ailleurs ».
- `profile` (d 52) : le cadre fait 16 cm de large, la bille à `dist` 30 est hors champ.
- `billeClose` : à `dist` 26 la balle (z ≈ 39) est hors cadre — elle ne se voit à côté de la bille que vers `dist` 40 (`BULLET.ref`).

## Planche 2 — le nuage était une coquille

- Vitesses des éclats entre 82 et 100 % du front : à `burst` 0,55, un rideau mince, pas un cône. → vitesses de 35 à 100 % (le front, sur l'axe, le plus clair : luminosité ∝ s⁴), traînée = où l'éclat était 0,22 unité plus tôt : à la naissance, chaque traînée part du trou → **un cône de rayons chauds**. Les plus lents n'atteignent pas le matelas avant que la coque ait tenu : ils s'éteignent avec le reste (0,93 → 1).
- En orbite, de profil à 44 cm, **le verre du labo (station.js), vu rasant, voile tout le cadre de blanc** : mon système se juge `shell` 0 (voir « À changer ailleurs »).
- Jet du miroir trop discret de loin → 60 éclats, cône 4°, traînées 0,3 ; bouchon plus chaud. Points de pluie plus gros, marque qui reste plus claire.

## Planche 3 — de profil, c'est un couloir (et c'est bien)

- À d 44 – 52, az −90, la caméra n'est pas dans le plan des couches : on voit en perspective la face interne de la tôle (droite) et la face du matelas (gauche) — un couloir de 10 cm, et le cône le traverse. **Lisible à 270 px : 0,4 (cône qui naît du trou chaud), 0,62 (cône plein, gouttes), 0,8 (le front écrasé sur le matelas, débris qui rejaillissent), 1 (pluie de points sur la coque).**
- Contact (az −48, 0,15) : tôle claire sans stries, anneau de choc signal, trou au bord chaud, lueur derrière ✓.
- Paire (d 190, az −89) : en haut une pointe serrée qui traverse la plaque, en bas un cône arrêté par le matelas — « une pluie… pas une balle » se lit, petit mais net.
- `litGap` restait un mur vert uniforme → lumière centrée sur l'axe de la bille (exp(−r²/110)), amplitude 0,3. **Non revu après cette baisse** (budget d'images épuisé).
- La coque qui tient : liseré veille trop discret de profil → à `burst` ≥ 0,94, ses faces de coupe prennent 25 % de veille en plus des arêtes. **Non revu.**

## Planche 4 (6 vignettes, 30/30)

- Crochet (POSE0) : la bille est un point blanc à longue traîne signal, lisible ✓ (petite : c'est la pose qui décidera).
- En biais devant la tôle (az −34, d 62, `dist` 16) : boule blanche, halo, traînée orange nettement devant la tôle ✓ — la lueur « là où elle va frapper » faisait une grosse tache floue détachée de la bille → resserrée, allumée sous 10 cm seulement (non revu).
- Établi : tôle la plus claire, céramique moyenne, coque sombre ✓. Éclaté + `litBlanket` ✓.
- Bille + balle à `dist` 40 : bille, jauge d'un centimètre, balle de verre au-dessus, balayage qui passe à côté ✓.

## Les poses qui cadrent (vérifiées sur planche sauf mention)

- **cone** (la suite 0,3 → 1, plan-séquence depuis `contact`) : `{ ...P, ...CLOSE, tx: 0, ty: 0, tz: -6, d: 50, az: -90, el: 8, fov: 32, shift: 0 }` — vu à d 44 tz −5,5 ; à d 50 la coque entre aussi dans le cadre (calcul). **Jamais au-delà de az −86 vers −62 : la tôle cache le vide.** De `contact` (−48) à `cone` (−90) : 42°, à faire en ≥ 0,6 s.
- **contact** : celle de `world.js` est bonne (az −48, d 40) pour `burst` 0 → 0,15.
- **gap** : `{ ...P, ...CLOSE, tx: 0, ty: -5, tz: -5.5, d: 52, az: -90, el: 8, fov: 30, shift: 0 }` avec `GAUGE10.y` −8 (calcul : le vide vers 615 px, la règle vers 1 170 px).
- **pair** : `{ ...P, tx: 0, ty: 25, tz: -4, d: 190, az: -89, el: 8, fov: 30, shift: 0 }`.
- **billeClose** (bille + jauge + balle + balayage) : `{ ...P, ...CLOSE, tx: -1.6, ty: 1, tz: 41, d: 22, az: -92, el: 8, fov: 30, shift: 0 }` avec `dist` 40 ; à `dist` 26 la balle (z ≈ 39) est hors cadre.
- **profile** : à d 52 le cadre fait 16 cm, la bille n'y entre que sous `dist` 6. Vu à az −86, d 140, tz 9 : bille + jauge au bord droit, couches en bandes. Pour une tôle « en trait », la caméra doit être dans son plan : `tz: 0, az: -90` (calcul, non vu).
- **system / exploded** (établi) : celles de `world.js` sont bonnes.

## À changer ailleurs

1. `plan.js` : `export const GAUGE10 = { y: -8, x: 0, z: [-0.2, -10.2] }; // inside the gap, under the bille's axis, clear of the cloud (±4.5 cm at the blanket)` — à −18,5 elle sort de toutes les vues serrées.
2. `world.js`, `VIEW` : `cone: { ...P, ...CLOSE, tx: 0, ty: 0, tz: -6, d: 50, az: -90, el: 8, fov: 32, shift: 0 },`
3. `world.js`, `VIEW` : `gap: { ...P, ...CLOSE, tx: 0, ty: -5, tz: -5.5, d: 52, az: -90, el: 8, fov: 30, shift: 0 },`
4. `world.js`, `VIEW` : `pair: { ...P, tx: 0, ty: 25, tz: -4, d: 190, az: -89, el: 8, fov: 30, shift: 0 },`
5. `world.js`, `VIEW` : `billeClose: { ...P, ...CLOSE, tx: -1.6, ty: 1, tz: 41, d: 22, az: -92, el: 8, fov: 30, shift: 0 },` (et `docs/041-actes.md` : la bille y est à `dist` 40, pas 26).
6. Pour les actes / station.js : de profil près du coupon (az −80 à −92, d < 150) le verre du labo, vu rasant, blanchit tout le cadre — `shell` ≤ 0,2 dans ces plans, ou station.js efface sa coque à moins de ≈ 60 cm du coupon.
7. `docs/041-actes.md` : `burst` se lit ainsi chez moi — éclair 0 → 0,11 (pic 0,025), bille effacée à 0,06, trou + lèvre chaude dès 0,06 (froide à 0,6), front sur le matelas à 0,7, écrasement 0,7 → 0,9, pluie 0,86 → 0,95, bombement 0,85 → 1, liseré veille 0,94 → 1, nuage éteint 0,93 → 1. `molten` 1 = 60 % de gouttes. `pierce` : contact 0,4, cratère 0,4 → 0,8, percé 0,8 → 1.

## Pour le catalogue

`041/whipple` — coupon de bouclier Whipple courbe, plein (tôle, vide, matelas céramique + kevlar tissé, coque isogrille), et ce qui le frappe : bille chauffée à blanc (halo ≥ 13 px, traînée en pixels d'écran), impact `burst` (trou, cône d'éclats et de gouttes instanciés, écrasement, pluie), plaque-miroir percée `pierce` ; réutilisables seuls : `slab()` (dalle courbe ou plate chanfreinée à trou), `makeShards()` (éclats en traînées, horloge unique), `makeHalo()`, `makeTrail()`.
