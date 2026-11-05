# 038 · `src/acte2b.js` — journal (le principe et le repos, `toprincipe` 30,21 → `tozero` 45,99)

## Plan monté (v1, remplacé — voir v2 plus bas)
- 30,21 coupe sur l'établi, même ballast avant bâbord plus près (`TANK` : VIEW.tank d 1900), `heart` 1, `crush` 0, `valves`/`flowF` 1 (raccord acte 2).
- 31,33 → 32,82 recul par rapport jusqu'au bateau entier sur l'établi (`WHOLE_B`), `heart` → 0 ; `chip-archimede` ; `weight` 0,6 sur « pèse », `lift` 0,6 sur « déplace ».
- 34,55 → 35,35 plongée par rapport sur le mètre cube (`VIEW.cube`), `heart` 1 ; `cube` 0 → 0,5 de « cube » à « l'air », → 1 sur « 1 000 » ; `chip-tonne` ; punch « kilos ».
- 38,47 coupe dans la mer (`REST`, cadré sur les bouteilles), `crush` 1, `mood` 0 ; `litBank` sur « attend ».
- 40,30 recul au bateau entier : `litTank` sur « mer ».
- 41,90 approche de la commande (`CMD_P`) : `litCmd` sur « lâche ».
- 43,32 coupe ballast arrière (`VIEW.aft`), `mood` → 1 sur « Mais » ; `chip-intact` de « chasse » à tozero−0,25.
- 44,77 coupe ballast avant déchiré (`VIEW.torn`) sur « réservoir » (pas sur « intact » : le punch n'est jamais sur une coupe) ; punch « intact ».

Mots (voix réelle) : Pourquoi 30,33 · remonte 30,68 · Archimède 31,48 · pèse 32,92 · déplace 34,12 · Un 35,00 · cube 35,40 · l'air 36,52 · mille 37,36 · kilos 37,64 · moins 38,04 · attend 38,92 · bouteilles 39,52 · mer 40,60 · ballasts 41,32 · geste 42,12 · lâche 42,60 · Mais 43,52 · chasse 44,00 · réservoir 44,92 · intact 45,32.

## Planches
- p1 (8, le film v1) : le ballast à d 1900 = un grand cylindre pâle, rien ne se lit ; le bateau entier sur l'établi sort du cadre et la flèche « déplace » n'apparaît pas ; bouteilles (az 52, d 10 500) lisibles ; commande lisible (une boîte derrière le verre, un cran en dessous) ; cube : un cube vert, le ballast autour n'est qu'une bande sombre.
- p2 (8, variantes) : `VIEW.tank` d 2700 et `VIEW.aft` d 2300 = tout en coque (grand tambour pâle coupé). **La flèche `lift` est cachée par le sol de l'établi** (y −2600 sous le plancher à −543) : Archimède ne peut pas se montrer sur l'établi. Bateau entier lisible de **trois quarts arrière haut** (az 68–70, el 26–28) : diagonale dans le cadre vertical, les quatre ballasts aux deux bouts.
- p3 (8, variantes) : dans la mer (roche 0, `crush` 0, mood 0) le bateau entier az 68 el 26 d 20 000 avec `weight`/`lift` 0,8 = les deux flèches égales, nettes — retenu. Ballast avant dans l'eau d 5000 (anneau autour du cône de proue, sa fenêtre) — retenu pour « Pourquoi ». `aft` d 5500 et `torn` d 5000 lisibles (le tambour arrière fermé ; la proue pliée, les déchirures signal).
- p4 (2, le film v2) : cube 0,45 puis 1 + `chip-tonne` : le cube vert lisible, le bloc d'eau tombe sous le cadre.

## Plan monté (v2, livré)
- 30,21 **coupe dans la mer** sur le même ballast avant (`TANK` : d 5000 → 4500, az 32, el 16), bateau intact, roche 0, mood 0, `heart` 0,6 — raccord d'objet avec la fin de l'acte 2 (établi). Pourquoi la mer : sur l'établi le sol cache la flèche qui pousse.
- 31,33 → 32,82 recul par rapport au bateau entier (`WHOLE_B` : tx −300, d 20 000, az 68, el 26) ; `chip-archimede` 31,48 → 34,50 ; `weight` 0,8 sur « pèse », `lift` 0,8 sur « déplace ».
- 34,60 → 35,35 plongée par rapport sur le mètre cube (`VIEW.cube` d 1500, el 12), `heart` 1, flèches éteintes ; `cube` → 0,5 de « cube » à « l'air », → 1 de « mille » à la coupe ; `chip-tonne` ; punch « kilos ».
- 38,47 coupe sur le bateau blessé (`REST`, roche, `crush` 1, mood 0) ; `litBank` sur « attend ». 40,30 recul au bateau entier (`WHOLE_S` : d 26 000, az 70, el 28) : `litTank` sur « mer ». 41,90 approche de la commande (`CMD_P`) : `litCmd` sur « lâche ».
- 43,32 coupe ballast arrière fermé (`AFT`), mood → 1 sur « Mais » ; `chip-intact` de « chasse » à tozero−0,25. 44,77 coupe ballast avant déchiré (`TORN`) sur « réservoir » ; punch « intact » (0,55 s après la coupe).

## Rendu à l'acte 3
La mer, pose `TORN` poussée à d 4600 (`{ tx −4600, ty −200, tz 260, d 4600, az 30, el −4, fov 32, shift 80, dof 0 }`), `crush` 1, `mood` 1, `cmd` 0, `valves` 0, `bank` 1, airs 0, `leak` 0, rien d'allumé.

## Un cran en dessous
- 35,4–38,4 le cube : lisible, mais le ballast autour n'est qu'une bande sombre (on ne voit pas « dans le réservoir »).
- 41,9–43,3 la commande : une boîte derrière le verre, `litCmd` faible.
- 30,21 la coupe établi → mer : le ballast éclaté de l'acte 2 revient en place (même azimut) ; raccord d'objet, pas de forme.
- Non vus : le recul 31,3–32,8 et la plongée 34,6–35,35 (calculés : < 60°/s, la caméra reste hors des ballasts).

## À changer ailleurs
- `src/world.js`, `VIEW` (acte 3 s'en sert : `aft` à « derrière2 », `torn` à « réponse ») — à d 2300 ce ne sont que des coques :
  - `aft: { ...P, tx: TANKA[0], ty: TANKA[1], tz: TANKA[2], d: 5500, az: 40, el: 12, fov: 32, shift: 80 },`
  - `torn: { ...P, tx: MBT.fwd.x0 + 150, ty: -200, tz: 260, d: 5000, az: 30, el: -4, fov: 32, shift: 80 },`
- `src/sousmarin.js` (note) : `LIFT.bottom` −2600 est sous le sol de l'établi (−543) : la flèche qui pousse ne se voit que dans la mer.

Images lues : 26 (p1 8, p2 8, p3 8, p4 2). `npm run check -- 038` : passe.

## Retouche du 04/11/2026 (qa du brouillon : heurté 34,8 · 41,1 · 42,7 ; commande illisible 41,9–43,3)
- Plongée sur le cube (34,6 → 35,35, ×12 en 0,75 s, heurté 23,4) → **coupe** à « Un » − 0,12 (34,88) sur `CUBE_P` d 1650, poussée lente à d 1350 jusqu'à « mille » ; la coupe pose `heart` 1, flèches 0, `L_CUBE` et `cube` 0,15 (les arêtes du cube déjà tracées : sans ça la coupe tombait sur un cadre noir). La dérive sur le bateau entier va jusqu'à la coupe. Vérifié à 34,85 · 34,92 · 34,953 · 35,40 (continues).
- Recul au bateau entier (heurté 17,1 à 41,1) → part plus tôt (`mer` − 0,75, à la fin de « bouteilles ») et va moins loin (`REST` dérive à d 10 000, `WHOLE_S` d 24 000) : 2,15 s au lieu de 1,72. Vérifié à 41,10 · 41,133 (continues), 41,97 (bateau entier dans le cadre).
- Approche de la commande (×11 en 1,3 s, heurté 27,5 à 42,7) → **coupe** à « geste » − 0,12 (42,00) sur `CMD_P` d 2700, poussée à d 2300 ; la coupe éteint `litTank`/`litBank`, pose `L_CMD`, **verre aminci** (`hull` 0,35, `inner` 0,4, comme le plan de l'équipage de l'acte 1) et une **première lueur** `litCmd` 0,35 ; `litCmd` 1 sur « lâche » inchangé. La coupe de « Mais » (43,32, `STAGED`) remet le verre. Vérifié à 42,06 et 42,90 : le boîtier clair se lit, l'officier devant.
- Coutures inchangées (entrée 30,21, sortie `TORN` d 4600). `npm run check -- 038` : passe. Images lues : 3 planches.
- Reste à voir sur le brouillon : le score de fluidité du recul 39,9–42,0 (adouci, pas coupé) ; le rythme des coupes 38,35 · 42,00 · 43,32 · 44,77.
