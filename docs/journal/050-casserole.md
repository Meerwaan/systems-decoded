# 050 · casserole.js — journal du décor

## Construit

`buildCasserole() → { root, A, update(p, time, px) }`, API du bouchon gardée (exports, signature, nombres, ancres).

- **Corps** inox brossé clair (`0xcdd2d7`, `metal` 0,36, sans grain d'usinage : à 270 px ses anneaux faisaient des lignes de balayage), un seul profil tourné : fond, congé de 1,2, paroi évasée 20 → 21,2, bord roulé. Tourné en **deux moitiés** (arrière z < 0, avant z > 0) à matières propres : `cut` n'a qu'à effacer l'avant. Arêtes fines du tout (s'effacent avec `cut`) et de la moitié arrière (apparaissent).
- **Fond à capsule** 5 mm, plus étroit que la paroi (Ø 18,3), bord arrondi ; dessous, trois cercles d'usinage (fatLine 1,8 px). En coupe : trois couches — tôle ferritique sombre (0–1,6 mm, là où tournent les courants), cœur aluminium clair, inox moyen — et deux lignes claires entre elles.
- **Manche** long effilé (plaque extrudée, trou de suspension), col conique, platine rivetée (deux têtes de rivet dedans), monté 9° vers le haut, vers l'avant droit. Part avec la moitié avant sur `cut`.
- **Eau** : surface éclairée (normales par différences finies) en *miroir sombre* (mélange normal, alpha ≈ 0,6) : des dômes qui gonflent là où monte une grosse bulle puis éclatent en anneau clair (9 cellules re-semées à chaque cycle) ; 64 grosses bulles en anneaux qui montent du fond et grossissent ; volume d'eau faible (vu en `xray` ou en coupe) ; en coupe, une feuille d'eau sous la ligne de surface qui bouge avec les dômes.
- **Vapeur** : 84 bouffées depuis toute la surface, faibles au ras de l'eau (la surface se lit d'en haut), montent ≈ 27 cm, s'élargissent, dérivent, s'éteignent ; effacées à moins de 16–36 cm de la caméra.
- **Courants induits** `eddy` : 5 anneaux dans la tôle magnétique (y 0,08), corps faible + têtes claires qui tournent (deux trains : lent 0,2 tr/s, rapide 0,42 tr/s qui prend le relais quand `eddy` monte — jamais de vitesse dérivée de l'état, sinon la phase saute). Dessinés **sans test de profondeur** : c'est la radio du fond, ils se voient à travers l'acier.
- **Chaleur** `panHeat` : teinte `signal` émissive faible (0,26 au plus) sur l'acier de la capsule, sa part sur chaque couche en coupe (0,2 au plus, la tôle d'abord) ; quelques filets chauds (14, couleur signal mêlée d'encre, 0,13) qui montent dans l'eau. Jamais d'incandescence.
- `litPan` : veille émissive faible (0,12) sur la capsule, un peu plus sur la tôle en coupe. `xray` : la paroi passe au verre (`glass` + `asShell`), l'eau, les bulles, les filets apparaissent ; le fond reste plein.
- Rien d'alloué dans `update` (uniformes partagés, `Color.lerpColors` / `setRGB` sur des objets créés une fois).

## Ce que les planches ont appris

- p1 : acier `0xa9…` metal 0,5 = trou sombre dans la cuisine → éclairci, metal 0,36. Chaleur 0,55 sur la capsule et 0,6 sur les couches = bande rouge vif qui se lit « plaque chauffée au rouge » → 0,26 / 0,2. `litPan` 0,32 = disque vert fluo → 0,12. Filets chauds = bâtonnets rouges → plus larges, plus doux, moins nombreux.
- p2-p3 : d'en haut (`VIEW.boil`), l'eau additive + la vapeur faisaient une soupe blanche → surface en miroir sombre + vapeur nulle au ras de l'eau : les dômes, anneaux et bulles se lisent.
- p4 : en coupe, l'intérieur clair de la moitié arrière noyait tout en blanc → l'acier arrière s'assombrit avec `cut` (75 %), volume d'eau 0,35 en coupe.
- p4 : à `el` 6 les anneaux s'écrasent en une bande verte ; à `el` 14 ce sont des arcs concentriques nets, têtes visibles.
- p5 : la face de coupe (paroi en U, capsule) existe et se lit en gros plan, mais les trois couches se distinguaient mal → couleurs contrastées (sombre / très clair / moyen) **après la dernière planche : non revérifié à l'image** (budget de 30 images atteint).

## Poses qui cadrent

- Coupe, meilleure que `VIEW.section` : `{ tx: 14, ty: B + 1.5, tz: 8, d: 36, az: -14, el: 14, fov: 30, shift: 140, dof: 8 }` (les anneaux s'ouvrent en arcs).
- Cuisine trois quarts, la casserole seule bien lisible : `{ tx: 195, ty: 96, tz: 39, d: 70, az: -45, el: 14, fov: 30, shift: 120, dof: 0 }`.
- `VIEW.boil` (`at` 0,5 ou 1,3) tient tel quel ; `VIEW.hook` aussi (corps gris clair sur le noir, vapeur, bande chaude à la base).

## Pas encore au niveau

- La face de coupe du fond fait 5 mm : sur `VIEW.section` elle fait ≈ 50 px et les anneaux verts la recouvrent en partie ; les couches ne se lisent vraiment qu'en gros plan (d ≈ 14–18). Couleurs des couches changées sans planche de contrôle.
- `VIEW.heart` (el −8) : le dessous n'est qu'une ellipse mince, verte surtout par le reflet de la flaque `veille` du banc ; `el` −16 à −20 l'ouvrirait.
- Les bulles en coupe, l'eau étant très pâle, ressemblent un peu à des bulles de savon dans l'air.
- Les courants tournent dans un seul sens pendant que le champ (model.js) s'inverse ≈ 2 fois par seconde : choix de lisibilité (un sens, des têtes qui courent).
- `VIEW.panLow` avec `panHeat` 1 : le dessous levé est teinté orange ; si la phrase est « les bulles retombent », baisser `panHeat` avec `boil`.

## À changer ailleurs

- `world.js`, `VIEW.section` : `section: { ...P, tx: ZONES.pan.x, ty: B + 1.5, tz: ZONES.pan.z, d: 36, az: -14, el: 14, shift: 140, ...CLOSE },`
- `world.js`, `VIEW.heart` : `el: -8` → `el: -18` (à vérifier sur planche par l'acte).
- Hors de mon fichier, vu sur le banc (`whole`, d 120, tout froid, `glassHeat` 0) : une grosse lueur rose-blanche au milieu de la plaque — pas la casserole (elle persiste à `panHeat` 0, `boil` 0, `steam` 0) : à regarder côté `model.js` / `makeBench` (flaque, `mood`, `gel`).

Images lues : 30 (p1 8, p2 8, p3 8, p4 4, p5 2). Planches : `.cache/planches/050/casserole/`.

## Retouche du 14/11/2026

- **Voile blanc de la moitié arrière en coupe** (acte2 28,54 → 38,31) → l'acier arrière part plus sombre (`SHADE` 0x111417, 95 %), reflets × 0,1, rugosité 0,76, et surtout **s'amincit en fantôme** (opacité × 0,25 à `cut` 1) : la teinte seule ne suffisait pas (vérifié en masquant la moitié : c'était bien elle). Vérifié à 30,0 · 37,9 · 38,25 · 64,6 : le haut du cadre est sombre, le contour `edgesBack` tient la forme.
- **Trois couches illisibles** → 2,0 / 2,0 / 2,2 mm (tôle 0–0,2, alu 0,2–0,4, inox 0,4 → le plancher : la couche d'inox continue dans la tôle du corps, `sheet` à z 0,004 devant `wallCap`) ; couleurs : tôle 0x2e3338, alu 0xeef0f2, inox 0x5a524b ; parts de chaleur 1 / 0,3 / 0,25 (la tôle rougit, l'alu reste clair). Vérifié à 37,9 et 64,6 (recadré ×4) : rouge en bas, alu clair, inox sombre — mais chaque couche ne fait que 4 à 5 px à 270 px sur `VIEW.section` : c'est le plafond de 6,2 mm réels.
- **Chaleur trop faible en coupe** → `panHeat` monte à 0,5 de lumière propre en coupe (0,26 + 0,24 × `cut`), couches 0,2 + 0,3 × `cut`. Vérifié à 37,9 · 38,25 · 64,6 · 64,9 : bande orange-rouge nette dans le fond.

À changer ailleurs : les anneaux `eddy` (sans test de profondeur) passent devant la face de coupe et masquent en partie les couches à 37,9 ; si les couches doivent se lire, l'acte baisse `eddy` (≈ 0,3) pendant « elle naît dans le fond », ou un gros plan d ≈ 18 sur le fond.

Images lues : 10 (dont 3 recadrages). Planches : `.cache/planches/050/casserole-retouche/`.
