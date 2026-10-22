# L02 · `ligne.js` — journal de l'agent de décor

## 2026-10-20 — départ

Lu : recette des agents, `L02-decors.md` (Pour tous, Les lieux, `ligne.js`), `plan.js`, `world.js`, le bouchon, `L02-images.md`, `007/jet.js` (fond de ciel), `figure.js`, en-tête de `details.js`.

Choix de construction :
- conducteurs : un shader de ruban (quads en espace écran, largeur = max(rayon vrai, 1,1 px) + halo), mélange MAX (« le plus clair gagne », pas de perle aux raccords) ; faisceaux de 4 sous-conducteurs à 45 cm qui se fondent d'eux-mêmes en un fil au loin ;
- pylônes : treillis en `LineSegments2` (montants et consoles ≥ 2 px, croisillons 1,8 px qui s'effacent quand un panneau passe sous ~8 px), chaînes d'isolateurs en verre, jupes qui s'effacent avec la distance ;
- ciel et sol du lieu LIGNE : un dôme à l'infini (idiome du 007) — grille de parcelles, horizon, crépuscule bas et chaud (`day`), pas de bleu ;
- entretoises : cadres carrés fusionnés, fondus sous ~8 px ; l'entretoise héros (vieille sombre / neuve claire) à part, pleine.

## Fait (quatre planches, 30 images lues)

- **Pylône** double circuit (`makePylon`) : treillis en lignes (montants, ceintures aux consoles, pointe du câble de garde ≥ 2,1 px ; croisillons 1,8 px fondus quand un panneau passe sous ~10 px), trois consoles en treillis de chaque côté, chaînes d'isolateurs (une ligne toujours + verre de près, jupes fondues avec la distance), quatre semelles de verre. Ancres = centre du faisceau, 4,10 m sous la console. Interface inchangée ; en plus : `state` (`amount`, `px`), `structure`, `bracing`.
- **Couloir** (`makeCorridor`) : faisceaux de 4 sous-conducteurs (carré de 45 cm) en rubans écran (mélange MAX : au loin le faisceau devient un fil, aucune perle aux raccords), câble de garde, entretoises tous les 60 m (cadres sombres fondus sous ~10 px), lignes de champ (`couple`) tous les 25 m, défaut lointain (lueur cœur blanc / traîne signal, ≥ 64 px, respiration, étincelles lentes). Options en plus : `spacers` (pas), `skip(x, key, i)`.
- **LIGNE** : dôme à l'infini (grille de parcelles, horizon, crépuscule chaud très bas côté −z) ; hélicoptère de verre (bulle, capot, poutre, dérive, patins, pilote de verre, rotor en disque flou, anticouple en disque), élingue, nacelle pleine (cage, plancher, plinthes, crochets posés sur le sous-conducteur haut), deux techniciens de verre casque et gants pleins ; l'entretoise vieille (sombre) / neuve (claire) ; 1987 : l'apprenti et son collègue de verre, deux pas vers le bout libre puis la main dessus, choc = verre signal + lumière à la main + lueur au pied.
- **Carte** : contour réel (≈ 135 points + Corse, ligne 2,4 px), 2 900 postes semés (denses Paris, Lyon, Nord, Lorraine, Alsace…) qui s'allument du poste vers l'extérieur, ≈ 4 200 liaisons aux plus proches voisins tracées depuis le bout le plus proche du poste, point du poste veille + anneau qui respire.

## Les nombres de l'état chez moi

- `amount` (S.span / S.poste) : pylônes et câble de garde 0 → 1 ; conducteurs 0,3 → 1.
- `live` : TES faisceaux encre sombre → signal (cœur clair, halo serré). `earthed` : → veille (si pas `live`). `induced` 0 → 1 vie signal faible qui rampe ; 1 → 2 la surtension (vive, rapide).
- `voisine` : ses faisceaux encre → signal. `couple` : arcs de champ signal, une lumière lente de la voisine vers toi. `current` : rien chez moi (model.js).
- `defect` : la lueur et les étincelles du dernier pylône du couloir, côté voisine, chaîne du bas (au poste ET au lieu LIGNE).
- `day` : nuit → crépuscule (une bande chaude très basse côté −z ; le ciel au-dessus et le sol ne changent pas).
- `heli` : hélico, élingue, nacelle, techniciens (verre fondu, visibles > 0,004). `fly` : x de l'hélico et de la nacelle. `basket` 0 : nacelle 13,5 m au-dessus du faisceau, qui se balance → 1 : posée contre le faisceau haut, crochets dessus. `spacer` 0 → 0,45 : A retire la vieille et la garde à la taille ; 0,5 → 1 : B pose la neuve (claire, visible dès `basket` > 0,5).
- `v87` > 1 : l'équipe (fondu 1 → 2). `wrong` : rien chez moi (model.js). `grab` 0 → 0,55 : deux pas vers le bout libre ; 0,4 → 1 : la main droite dessus. `shock` : verre signal, lumière à la main, lueur au pied — jamais de chute.
- Carte : `dots`, `links` (tracés), `here`.

## Les poses qui cadrent bien (complètes, vérifiées sur planche sauf mention)

- **lineWide** (trois pylônes, la ligne jusqu'à l'horizon) : `{ tx: 70000, ty: 2600, tz: 0, d: 70000, az: -30, el: 3, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ set: 2, live: 1, day: 1, heli: 1, fly: 60000, basket: 0.5 }`.
- **heliWide** (l'hélico, l'élingue de 18 m, la nacelle pendue, les faisceaux dessous) : `{ tx: 60000, ty: 5250, tz: 900, d: 7800, az: -36, el: -2, fov: 30, shift: 0, side: -300, roll: 0, drift: 0.3 }` — l'hélico y est petit ; plus serré (non vérifié) : `d: 6200, ty: 5300`.
- **heliClose** : `{ tx: 60000, ty: 6450, tz: 900, d: 2600, az: -30, el: -6, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }` (vérifié à ty 6150 : l'hélico en haut à gauche ; 6450 le recentre, non vérifié).
- **vertigo** (de haut : la nacelle pendue, les six faisceaux, le sol 37 m dessous) : `{ tx: 60000, ty: 4200, tz: 900, d: 2800, az: -24, el: 46, fov: 42, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `basket: 0.5`.
- **basket / thumb3** (deux techniciens, casques, la neuve posée) : `{ tx: 60010, ty: 3700, tz: 880, d: 560, az: -40, el: 10, fov: 28, shift: 0, side: -120, roll: 0, drift: 0.3 }` + `{ basket: 1, spacer: 0.75 }` ; de face : `{ tx: 60000, ty: 3680, tz: 870, d: 620, az: -22, el: 14, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }`.
- **pair** : `VIEW.pair` tel quel (vérifié avec `live 0, couple 1, induced 1` et `induced 2`).
- **v87tower** : `VIEW.v87tower` tel quel (vérifié : voisine signal, la tienne veille, les pinces de model.js).
- **couloir vu du poste** (le défaut au bout) : `{ tx: -60000, ty: 2500, tz: -1200, d: 60000, az: 82, el: 2, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ set: 0, defect: 1 }`.
- **map** : `{ tx: 0, ty: 0, tz: -300, d: 40000, az: 0, el: 72, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }` ; **mapHere** : `VIEW.mapHere` tel quel.

## Un cran en dessous (dit franchement)

- L'hélicoptère est juste : une bulle de verre lisible, pas encore « studio » (pas de cadres de vitres, pas de détail de rotor) ; dans les plans larges il est petit.
- Le geste des techniciens se lit moyennement : la vieille entretoise, sombre, dans les mains de A ne se voit presque pas ; la neuve (claire) se lit.
- 1987 : le pied du pylône à `VIEW.v87` est mangé par les jambes et les semelles ; l'apprenti n'a été vu que petit ; la lumière à la main n'a pas été vue de près.
- Le défaut lointain n'a pas été vu sur planche (agrandi à ≥ 64 px après la dernière) : à confirmer par les metteurs en scène.
- La bande chaude de l'horizon reste un trait net : à juger dans le film.

## À changer ailleurs

- `world.js` · `VIEW.map` : `map: { ...P, tx: 0, ty: 0, tz: -300, d: 40000, az: 0, el: 72, fov: 30 },` (à d 32000 le Nord et la Corse sortent du cadre 16:9).
- `world.js` · `VIEW.lineWide` : `lineWide: { ...P, tx: 70000, ty: 2600, tz: 0, d: 70000, az: -30, el: 3, fov: 30 },` (à d 30000 un seul pylône dans le cadre).
- `world.js` · `VIEW.heliWide` : `heliWide: { ...P, tx: 60000, ty: 5250, tz: 900, d: 7800, az: -36, el: -2, fov: 30, side: -300 },` (l'ancienne coupait l'hélico).
- `world.js` · `VIEW.basket` : `basket: { ...P, tx: 60010, ty: 3700, tz: 880, d: 560, az: -40, el: 10, side: -120 },`.
- `world.js` · `VIEW.v87` (non vérifiée, proposée) : `v87: { ...P, tx: 40100, ty: 150, tz: 1450, d: 900, az: -15, el: 6, side: -150 },`.
- La portée du dernier pylône (`PYLON.at`) au portique est à `poste.js` : mon couloir part de `PYLON.at` vers −x seulement.
- `A.phases(x)` rend le sous-conducteur bas côté caméra (+z) de chaque faisceau (un vrai fil, pas le centre vide du carré) ; `A.centreY(x, i)` donne le centre si besoin.
