# 050 — ce que les décors ont changé (à lire avant d'écrire un acte)

- Première image : candidate (a) « au ras du verre », `POSE0` gardé tel quel (d 72). La main à plat se lit mais est vue de profil ; ne pas la cadrer plus bas.
- `world.js` VIEW recalés : `twoZones` (d 140, main droite au manche dans le cadre), `emptyZone` (el 36, le « 9 » entre), `panLow` = « casserole levée » depuis la droite (az −15 : depuis la gauche ton bras passe devant), `top` (d 160, la main d'enfant entre), `board` (az −120 : à −40 la bobine cache la carte), `heart` (el −18), `section` (az −14, el 14 : anneaux en arcs nets).
- Coupe (`section`) : `explode: 0` ; aligner la coupe de la casserole (`cut` de casserole.js) sur celle de la plaque (`cut` de model.js) au même instant ; la tranche du fond ne fait que ≈ 50 px : rapprocher si l'on veut lire les trois couches.
- Baisser `panHeat` en même temps que `boil` quand la casserole est levée (sinon le dessous reste orangé).
- Le champ alterne (deux fois par seconde) mais ne se lit qu'en mouvement ; les courants induits (`eddy`) tournent dans un seul sens, choix de lisibilité.
- Un chiffre à plat sur le verre est écrasé sous `el` 26 : filmer les afficheurs à `el` ≥ 32.
- Cuisine : toi en verre atténué ; l'enfant n'apparaît que si `you` = 0 (avant-bras + main seulement). Ancres `A.palm`, `A.fingers`, `A.grip`, `A.child` (lire par `getWorldPosition`).
- À surveiller : une colonne verte verticale sur l'établi vers x ≈ 0 (éclaté) ; d'origine inconnue, la signaler si elle gêne un plan.
