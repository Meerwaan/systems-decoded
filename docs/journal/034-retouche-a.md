# 034 · retouche A — `src/acte1.js` et `src/acte2.js` (2026-10-30, agent `retoucheur`)

Journaux d'origine : `docs/journal/034-acte1.md`, `docs/journal/034-acte2.md`. Couture d'entrée et de sortie inchangées (POSE0, FIRST, `FLOOR2` d 200 à `tobench`, `ACT1_END`, coupe `toseuil` → `tozero`). Planches : `.cache/planches/034/ra-1.jpg` (8), `ra-2.jpg` (1), `ra/diag-crop.jpg` (3) ; le reste mesuré au pixel (scripts sharp, aucune image lue).

## Retouche du 30/10
| défaut | correction | vérifié à |
| --- | --- | --- |
| 1 · image parasite 16,17 s | le recul par rapport balise → colonne (×25 000 en 0,84 s) traversait un voile veille à 16,167 (lum. 14 → 20 → 12) : COUPE à `porte` − 0,1 sur `RANGE_IN` (d 850 000, `L_RANGE`, `litBeacon` 0) puis recul doux vers `RANGE` | 16,067 → 16,30 par 1/30 : lum. 14,9 · 14,9 · 15,2 · 15,6 · 13,1 · 14,2 · 15,6 · 15,2, écarts réguliers ✓ |
| 2 · 5,0 et 15 s boîte à 95 % | `BOXVIEW` = `VIEW.beacon` visé sur la boîte (tx −6, ty 12), d 240, el 22, dof 0 ; accroche `turned(BOXVIEW, 60)` d 240 → 220 ; fond d 240 → 215 ; halo fs 60 | ra-1 : 5,0 ≈ 30 %, 15,0 ≈ 45 %, entières, sous-titre dessous ✓ |
| 3 · reflet 2,6 et 12,3 s | `ABYSS` az −14 → −60 (la bascule passe à az ≈ −40 : reflet mesuré 2 875 px → 69 px), `ABYSS2` az −30 ; `LAND` el 9 → 22, d 150 → 220 | ra-1 2,6 et 12,3 ✓ |
| 4 · 8,2 s boîte minuscule dans le noir | plongée ×43 remplacée par une COUPE à `ecoute` − 0,12 sur `TAILWIDE` (TAILBOX d 1200, az 34, el 20, `plane` 0,85 → 0,4), poussée par rapport jusqu'à TAILBOX × 0,9 | ra-2 : la boîte orange dans la queue de verre (fuselage, dérive) — lisible, sans plus |
| 5 · 18,3 s presque noir | plongée ×14 000 remplacée par une COUPE à `avant` − 0,15 sur `FLOOR_IN` (floor d 330, `range` 0, `L_BOX`), puis une seule poussée `power1.out` jusqu'à `FLOOR2` à `tobench` | ra-1 18,3 : la boîte sur le fond, son anneau ✓ |
| 6 · heurtés 7,9 · 13,0 · 5,0 | 7,9 : la coupe du 4 ; 13,0 : LAND → balise n'est plus qu'un petit glissement (d 220 → 240, plus de lumière recentrée) ; 5,0 : remontée sur 1,05 s au lieu de 0,9, écart el 48 → 22 au lieu de 48 → 8 | à revoir au `qa` du brouillon |
| 7 · 37,7 s flèches hors zone | recul vers `SECTION` d 230 dès `degres` (fini à `sixmille` + 0,15, AVANT que les flèches arrivent de loin), puis d 240 ; `crush` 0,6 → 0,4 | rouges mesurés 37,3 → 38,25 : y 559 → 1 205 au plus, rien sous 440 ni au-dessus de 1 540 (1 à 4 px isolés à 1 692, présents aussi avec `crush` 0) ✓ |
| 8 · heurtés 22,6 et 38,8 | deux COUPES sur `BEACON_IN` (d 112) à `devant` − 0,1 et `mais` − 0,12 (section, xray, crush, flex remis à 0 dans la coupe ; le tween `flex` 0,12 fini avant) puis poussée `sine.out` vers `BEACON` | à revoir au `qa` |
| 9 · 29,3 module au bord gauche | le plan du boîtier dérive sa visée vers le module (tx −1, ty 21, tz 5, d 160) : le tour garde le module dans le cadre | ra-1 29,3 : module entier ✓ |

`npm run check -- 034` passe (1 ⚠ de mise en page « canvas au bord », déjà là).

## Reste à voir sur le prochain brouillon
- `qa` → heurtés 5,0 · 13,0 · 22,6 · 38,8 ; les coupes neuves 7,95 · 15,52 · 18,14 · 22,29 · 38,28.
- 8,2 s : un contour vert (empennage) traverse le sous-titre ; la boîte ≈ 10 % de la largeur.
- 37,7 s : le module plus petit (d 230), les flèches lisibles ?
