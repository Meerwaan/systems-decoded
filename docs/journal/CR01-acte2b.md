# CR01 · acte2b.js — journal (agent acte, 05/11)

Lu : recette-agents, recette-actes, regles-image, CR01-actes (haut + § acte2b), CR01-actes-maj (V3), world.js, main.js, index.html (étiquettes), direct.js (API), journaux salle / centrale / canal / coeur / da-v3 / etat, tête d'acte3.js et son journal. Planches : `.cache/planches/CR01/acte2b/p1…p4.jpg` (essais `p*.json`).

## Monté (tot4 60,31 → tocanal 86,54), sur les vrais instants (repères + `beat:mot`)
1. **tot4, le tableau** : coupe serrée sur le disque, caméra DEVANT l'équipe (d 250, fov 58 : à d 560 la tête d'une silhouette masquait le centre). `rodsIn` = 8/72 → exactement **8 cadrans allumés** (salle.js : cadran i allumé si 29·i mod 72 < n), verts (`ok` 1). `chip-barres` sur « huit » ; sur « quinze » les 8 barres passent au rouge (`viol` 1) et « Minimum : 15 » entre dans l'étiquette (`#chip-barres i`). Lisible à 270 px (8 tirets rouges).
2. **toprot, les clés** (`VIEW.keys`) : les voyants s'éteignent un à un de « protections » à « coupées ». **Coupe** à « Et » − 0,12 sur la salle entière (`VIEW.salle`, poussée lente) : l'équipe, le pupitre (AZ-5 vert), le tableau rouge derrière — « lancé quand même ». (Le recul par rapport depuis les clés frôlait la tête d'une silhouette au premier plan : remplacé par une coupe.)
3. **tot5, la turbine** (`VIEW.turbineClose`, damier plein cadre) : « commence » `spin` → 0,78 (la vapeur de la ligne s'éteint), « ralentit » → 0,35 (sine.out) et recul par rapport jusqu'au cadre turbine + 4 pompes ; « les pompes aussi » `flow` → 0,5.
4. **tofuel5, le crayon** (`VIEW.fuel` serré, d 350 → 305) : « bout » `steam` → 0,8 ; « vapeur… puissance » lueur 0,15 → 0,45, neutrons plus nombreux ; `punch` court sur « puissance » (relâché avant la coupe).
5. **tot6, AZ-5** (`VIEW.az5`, d 104 → 92) : bouton **vert** (`ok` 1, `fault` 0 : V3, la sécurité en qui on a confiance) ; il s'enfonce seul sur « AZ-5 » + `punch`.
6. **tobarres, le cœur** (`ok` 1 : barres et bas en vert, `fault` 0, p 0,38) : `scram` 0 → 0,08 en linéaire jusqu'à `tocanal` ; la caméra se rapproche de la barre du milieu et descend avec elle ; `chip-20s` de « près » + 0,14 à « Sauf » + 0,5 ; `setAct(2)` à `defaut` ; plongée par rapport jusqu'au pied clair de la barre (az −64, el 6, shift 120, comme le FOOT d'acte3).

## Rendu à acte3 (tocanal)
cœur, pied de la barre du milieu au centre du cadre, `ok` 1, `fault` 0, p 0,38, `scram` 0,08 ; caméra `{ coeur [0.75, tip(0.08)+4, 0], d 104, az −64, el 6, shift 120, dof }`. acte3 coupe sur le pied du déplaceur (canal) au même angle.

## Un cran en dessous (franchement)
- 73,5 → 77,6 (crayon) : la vapeur se lit peu (anneau sombre + bulles) ; « plus de puissance » = neutrons plus nombreux, la lueur des pastilles change peu à 270 px.
- 81,8 → 86,5 (cœur) : `ok` 1 peint tout le bas en vert saturé + canaux blancs — dense, « rayures » ; la barre suivie se lit, le raccord de forme avec le pied du déplaceur d'acte3 est un raccord d'axe plus que de forme.
- 65,2 → 67,1 (clés) : image claire et un peu plate.
- Le 8ᵉ cadran rouge tombe près du haut des sous-titres (≈ 1230 px).

## À changer ailleurs
- Rien d'obligatoire. (Si l'on veut les barres du tableau plus grosses : `salle.js`, `const DIAL = { r: 9.4, face: 7.6, bar: 12.6, w: 5.2 };` — non nécessaire, elles se lisent.)

## Couverture (proposition, non tirée)
repère `t5:commence` − 0,5 (≈ 70,2), pose `VIEW.turbineClose` (el 46), état `{ ...STAGED.centrale, ok: 1, spin: 1, flow: 1, feed: 1, mains: 1, fault: 0 }` : le damier, les aubes, les têtes vertes de la boucle.

## Images lues
28 (p1 8, p2 8, p3 8, p4 4) : **2 au-dessus du budget de 26**. `npm run check -- CR01` passe (0 erreur).

## Retouche du 05/11 (agent retoucheur)
- **Heurté 83,4 / 85,4 (cœur)** → les deux plongées enchaînées (d 520 → 230 → 104 en 4,6 s, deux `sine.inOut`) remplacées par : poussée lente sur la barre du milieu (`ROD` d 340, side 70, dof 0, tobarres + 0,1 → Sauf − 0,1), **coupe** à Sauf − 0,1 (`FOOT_FROM`, d 150, même axe), poussée linéaire jusqu'à `FOOT` (inchangé : la pose de passage à acte3 et l'état n'ont pas bougé). Vérifié à 83,4, 84,5667 / 84,6 / 84,6333 (une seule coupe, nette), 85,4, 86,45, 86,5.
- **Crayon 73,5–77,6** → « vapeur » − 0,06 : `viol` 1 + `steam` 0,9 en 0,3 s (la vapeur rouge, l'eau blanche lisible) ; « puissance » − 0,06 : `pLow`/`pHigh` 0,15 → 0,95 en 0,55 s `power2.out` (pastilles blanches). Vérifié à 76,25 et 77,4.
- **Cœur 81,8–86,5, `noOk`** → rien à changer : barres vertes, bas brun sombre, canaux blancs ; se lit à 270 px. Vérifié à 82,4, 83,4, 84,54.
- **8ᵉ cadran à y ≈ 1230** → `BOARD.shift` −40 → 20 (cadre remonté de 60 px) : les 8 cadrans rouges entre ≈ 450 et ≈ 1140, aucun sous le chip perdu. Vérifié à 64,6.
- `npm run check -- CR01` passe. Planches : `.cache/planches/CR01/acte2b-retouche/r1.jpg`, `r2.jpg` (2 images lues).
