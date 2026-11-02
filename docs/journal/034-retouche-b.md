# 034 · Boîte noire — retouche b (`src/acte3.js`, `src/fin.js`)

## Retouche du 2026-10-30
Agent `retoucheur`. Planches : `.cache/planches/034/rb-1.jpg` (8), `rb-2.jpg` (4) = **12 images lues**.

### acte3
1. **44 s / 46,5 s, boîte ≈ 5 %** → `ALONE` d 1100 → 360 (ty 28), poussée vers d 330 ; `LOOKUP` d 1500 → 440 (ty 40) ; `pool` 0,25 → 0,5 dans `HERE` (le halo). Vérifié à 44,0 (≈ 20 % de la largeur, sur son halo, seule) et 46,5 (≈ 13 %).
2. **49,3 s, colonne noire** → `COLUMN` el 10 → 26 (les cercles du fond et de la surface s'ouvrent en ellipses), shift 150. Vérifié à 49,3 avec shift 0 (rb-1 : les deux ellipses se lisent, le point juste au-dessus des sous-titres) et shift 300 (rb-2 : ellipse haute sous l'en-tête) ; **shift 150 non revu** (entre les deux). Le point de la boîte reste minuscule et pâle : il est dessiné par `fond.js` (encre × 0,8 × 0,6), voir « À changer ailleurs ».
3. **58,9–59,5 s, traînées et châssis sous y 1600** → plus de remontée de 200 m en `expo.in` dans le même plan : le module se soulève de 25 cm (`depth` 3 899,75, `sine.inOut`) au-dessus du châssis de verre, puis **coupe** à `remonte` − 0,12 sur `RISE_UP` (d 165 → 190, el −24 : vu d'en dessous, le fond déjà loin), `depth` 3 860 → 3 700 (`sine.in`), `rush` −0,7 → −1, `shell` 0,45. Vérifié à 59,0 (châssis sous le module, au-dessus de y 1330), 59,5 et 59,9 (le module monte dans la neige, 3 860 → 3 790 m).
4. **Heurté 58,8 s** → cause : l'`expo.in` de `depth` (la séparation module / fond accélérait de ×300) et la poussée `sine.out` dès la coupe ; remplacés par `sine.inOut`. À confirmer au `qa` du prochain brouillon.

### fin
5. **Chute, module ≈ 12 %** → `VERDICT` visé sur le module (ty 19), d 560 → 200, el 20, shift 20 ; montée vers d 175, el 24 ; lumière `fy 0, fs 90`. Vérifié à 64,5 et 67,3 : module ≈ 38–42 % de la largeur sous le titre, allumé veille à 67,3 ; les débris sortis par le bas, seules les lignes du fond passent sous les sous-titres.
6. **Arrêt du spin à `rewind`** → un seul mouvement linéaire de `toloop` à la fin : `spin`, `depth` et `d` (par rapport) calculés à la fraction `k` de `rewind`, puis `D.loop({ ease: "none" })` prolonge à la même vitesse (≈ 7,6 °/s). Pas d'arrêt possible par construction ; non visible sur une planche.
7. **Boucle et contraste** → 89,5 = 0,04 (même cadre, J−30, 40 m, 01 MENACE ; seul l'anneau du ping diffère, phase de l'horloge, comme avant). `npm run check -- 034` : passe, contraste 66/66, aucun avertissement de boucle.

## À changer ailleurs
- `src/fond.js` (le point de la boîte, ≈ l. 834) : `du.uAmount.value = Math.max(range, 0.6);` → `du.uAmount.value = Math.max(range, 1.4);` — le point encre de la boîte morte se lirait à 270 px dans le plan de la colonne (49,3 s). À vérifier aussi sur l'acte 1 (« quelques kilomètres », point veille).
