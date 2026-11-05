# 037 · habillage.js — journal du décorateur

Décorateur, 04/11. Décor habillé : `ciel.js` (ciel de chute, campagne en damier, champ). Le sauteur et le système, pas touchés.

## Ce qui est posé
- `src/habillage.js` → `dressSky()` → `{ group, update(p) }`. Deux touches, **toutes deux ÉTEINTES** (`ENABLED = { puffs: false, shadows: false }`) :
  1. **Une couche de cumulus de beau temps** à 950–1 150 m du sol (70 nuages, 60–150 m, dans 1 km autour de l'axe de chute). Raison : vrai ciel et vraie vitesse : on la voit sous soi à l'accroche, on la traverse vers 6,3 s (alt ≈ 1 000), elle devient le ciel dans `under`. Suit `alt` (plan du sol), `sky`, `strata` (s'efface pour les nappes du principe), `hang` (le cône dégagé s'élargit à la voile). Rien ne suit l'horloge : la dernière image reste la première.
  2. **Leurs ombres sur la campagne**, décalées par le soleil (az 210°, él 55°), éteintes sous 30 à 150 m d'altitude (rien sur l'herbe du champ). Raison : le sol est un vrai sol, un kilomètre plus bas (parallaxe nuage / ombre).
  - Les deux s'effacent dans un **cône œil → ton corps** (`clearOf`, rayon 100 cm ; 480 cm autour de la voile quand tu pends) et se dessinent avant toi (`renderOrder` −30 et −40) : jamais devant ni derrière ta silhouette.
- `ciel.js` : 3 lignes (import ; `const dress = dressSky(); group.add(dress.group);` ; `dress.update(p, time);` à la fin de `update`).

## Planches (24 images lues : le plafond)
- avant (8 : 0 dive, 4, 7,2 plongée, 12,3 under, 30 side, 40 ground, 45 gateWide, 76 landed) : le damier tient l'image 0 ; fond noir et sans profondeur dans `under` ; rien qui dise « ciel » ni « on traverse ». Attention : les instants 30/40/45 étaient noirs sans `"sky":1` dans l'état (les actes sont des bouchons).
- après 1 (8) : rien de visible : le cône dégagé (atan(170/d)·1,6) couvrait tout le cadre.
- après 2 (4) : cône resserré, plus d'opacité → des **ellipses grises pleines** : un disque, interdit.
- après 3 (4) : contour fin + contour intérieur + fond léger, plus de nuages plus petits → des **galets plats** ; à l'accroche, un seul nuage dans le cadre, tout en haut, sous l'en-tête. Image 0 pas plus forte qu'avant → éteint (règle de la recette).

## Pour la reprise (si quelqu'un la relance)
- La forme : remplacer la **somme** des gaussiennes par leur **max** (union de cercles → bord en chou-fleur), 12 à 16 bosses de rayon 0,08–0,16, base plate gardée. La somme lisse tout en lentille.
- À l'accroche, rien entre y 236 et 410 (l'en-tête) : poser à la main 2 ou 3 nuages qui tombent sur les bords du cadre `dive` (x 60–300 et 780–1020, y 500–1500), le reste semé.
- Vus de dessous (`under`), les nuages en lentille font des soucoupes : y montrer une base plate large, ou les éteindre quand ils sont au-dessus de la caméra.
- Les ombres n'ont pas été jugées seules : à tirer sur `dive` à 0,48 d'opacité avant de les rallumer.
- Manche à air au champ : écartée — dans `landed` (d 1 900, él 18) elle tombe soit sous l'en-tête (un mât de 4 m à 20 m derrière la voile monte jusqu'à y ≈ 250), soit collée au sac. À poser seulement si l'acte reprend la pose `el: 26, d: 1500` que proposait `037-ciel.md`.

## À changer ailleurs
- Rien d'obligatoire. Si l'habillage reste éteint au montage, les 3 lignes de `ciel.js` peuvent rester (aucun appel de dessin : `visible` faux).
- Au passage (`check`) : contraste du `nav > span:nth-of-type(2)` à 82,26 s, 3,28:1 dans `index.html` (pas à moi).
