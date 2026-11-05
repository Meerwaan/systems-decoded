# CR01 · acte2.js — journal (agent acte, 05/11)

`tot1` 28,95 → `tot4` 60,31. Lu : recette-agents, recette-actes, regles-image, CR01-actes (haut + § acte2 + coutures), CR01-actes-maj (DA V3), world.js, main.js, index.html (étiquettes), journaux centrale / cœur / canal / da-v3, l'API de direct.js, `feutre()`.

## Monté (un plan par ligne, tous les instants lus dans le script)
1. `tot1` coupe : la centrale entière (`VIEW.centrale`), `ok` 1 (sécurité verte), tout tourne ; poussée lente par rapport (d 1150 → 940).
2. `courant` −0,1 coupe : la ligne et ses trois pylônes vus d'en haut (`[70,35,−110]` d 560 az −78 el 28) ; têtes vertes qui courent, éteintes sur « coupé » (`mains` → 0).
3. `diesels` −0,1 coupe : `VIEW.diesels`, `diesel` 0 → 0,45 (ils tremblent, fument, ne démarrent pas : câble jamais allumé) ; `chip-diesel` de « environ » à `turbine2` −0,3.
4. `turbine2` −0,1 coupe : `VIEW.turbine` → `turbineClose`, `spin` 1 → 0,6 sur « ralentissant » (le damier ralentit).
5. `pompes1` −0,3 : recul par rapport vers un cadre alternateur → tableau → pompes (`[0,18,10]` d 660 az −40 el 42) ; `feed` → 1 sur « pompes » ; la question reste ouverte.
6. `toreport` coupe : la vanne (`[−75,18,95]` d 240 az −30 el 12, dof ; VIEW.eccs faisait un reflet blanc sur le dôme des réservoirs) ; « coupe » : `fault` → 1 (rouge) et `ok` → 0 (le vert du secours s'éteint) ; cercle `feutre-vanne` (400 × 340) sur « refroidissement », levé 0,35 s avant la coupe.
7. `reseau` −0,1 coupe : la même ligne (raccord), `mains` 0,15 → 1 sur « réclame » (têtes papier : `ok` 0) ; de « repoussé » à `tot2`, la caméra monte le long de la ligne et la lumière la suit hors de la table (`fs` 40 en bout de ligne) : la nuit tombe sur la centrale.
8. `tot2` coupe : le cœur (`VIEW.coeur`, `ok` 0 : le bas vert masquait la puissance), p 0,5 → 0,03 sur « s'effondre » ; `chip-1pct` sur « à peine ».
9. `toxenon` coupe : le combustible de près (`VIEW.fuel` d 330 → 290, `ok` 0), `xenon` → 1 sur « xénon » ; p 0,25 → 0,4 (veut remonter) puis → 0,08 sur « freine ».
10. `tot3` coupe : les barres dans la face coupée (`[0,98,0]` d 440 az −58 el 16), `ok` 1 (barres vertes) ; `rodsIn` 0,8 → 0,6 « retire », → 0,45 « Encore », → 0,3 « et encore ».
11. `remonte` → `tot4` : plongée par rapport sur les barres qui restent (`[1,94,0]` d 230, dof 6) ; p → 0,15 sur « six », `chip-6pct` (sorti à `tot4` −0,35) ; `rodsIn` → 0,25 sur « peu ».

Sortie : cœur, `rodsIn` 0,25, p 0,15, `ok` 1, `fault` 0 — l'acte 2b coupe sur la salle.

## Planches (.cache/planches/CR01/acte2/) — 32 images lues (budget 26 DÉPASSÉ de 6)
- p1 (timeline v1) : ligne trop près (pylônes géants), cercle de la vanne invisible, cœur en `ok` 1 = bas tout vert qui cache la chute de puissance.
- p2 : ligne vue d'en haut lisible (vert → éteint) ; cadre pompes ; `ok` 0 sur le cœur rend la puissance lisible ; xénon trop loin.
- p3 : cercle visible une fois agrandi (210 px était dessiné SUR la vanne rouge) ; vanne el 12 sans reflet ; nuit, 1 %, xénon de près.
- p4 : turbine, recul, barres (53–60 s), couverture.
- Non revu à l'œil : la vanne en pose finale (`el` 12, fs 170 — variante b de p3, lue), le relèvement de 6 cm des cadres barres (`ty` 92 → 98, 88 → 94, pour descendre le bloc vert sous les sous-titres).

## Un cran en dessous (dit franchement)
- `toxenon` (49,6–53,1) : les grains de xénon se lisent, les neutrons « avalés » à peine (2 ou 3 traînées à 270 px).
- `tot3` → `tot4` : le bas du cœur est un bloc vert (`alarm` en vert sous `ok` 1) qui prend le tiers bas du cadre et dispute la vedette aux barres.
- `tot2` (« à peine un pour cent ») : la chute se lit par contraste avec la coupe (p 0,5), le cœur reste petit (`VIEW.coeur`, ≈ 45 %).
- `pompes1` : les pompes en bas à gauche du cadre, un peu floues pendant le recul.

## Couverture proposée
Repère `tobarres` (81,84), pose `{ tx 0, ty 85, tz 0, d 700, az −58, el 30, fov 30, shift 110, dof 0 }`, état `set 0, fx 0, fy 80, fz 0, fs 110, fault 1, ok 1, pLow 0,85, pHigh 0,3, rodsIn 0,25, scram 0,12, blast/slab/blast2/fire 0, depuis 0` : barres vertes en haut, bas rouge qui luit (vu sur p4).

## À changer ailleurs
- `episodes/CR01-tchernobyl/src/centrale.js`, `const A = {` : `fault: valve,` → `fault: anchor(...PLANT.eccs.valve),` (le groupe `valve` est à l'origine de la table : le halo rouge du monde et tout cercle ancré sur `A.fault` tombent au centre de la table, pas sous la vanne ; mon acte s'ancre sur un `Vector3` en attendant).
- `episodes/CR01-tchernobyl/src/coeur.js` (suggestion) : la moitié basse (`alarm`) ne devrait pas passer au vert avec `ok` — seules les barres ; sinon tout plan du cœur en `ok` 1 a un bloc vert au bas.

`npm run check -- CR01` passe (0 erreur ; avertissements connus).

## Retouche du 05/11 (retoucheur)
- Images parasites 38,47 / 38,67 (bords de la pause entre la poussée turbine `fromD` et le recul `fromD` vers les pompes) → plus de pause ni de rapport : la poussée turbine (simple) court jusqu'à `pompes1` −0,3, où une COUPE pose `FEED_IN` (FEED d 560) avec `L.pumps`, puis recul lent simple → FEED (d 660) jusqu'à `toreport`. Pompes nettes. Vérifié en `look` à 38,63 / 38,67 / 39,5 ; la continuité du rotor ne se juge que sur le brouillon.
- Xénon 49,6–53,1 : `xenon` 0 → 0,3 sur « xénon » (les grains paraissent, les neutrons courent), 0,3 → 1 de « avale » −0,1 en 1,1 s (ils meurent dans les grains) ; plan plus serré (`fuel` d 270 → 225, dof 6). Vérifié à 50,0 / 51,4 : moins de traînées à 51,4, grains lisibles ; l'effet se juge en mouvement.
- Cœur 53–60 s : bas sans bloc vert (`noOk`), barres vertes qui remontent lisibles — vérifié à 55,3 / 59,8, rien changé.
- Cercle de la vanne ancré sur `world.centrale.A.fault` (import THREE retiré) — vérifié à 42,2 : cercle centré sur la vanne rouge.
`npm run check -- CR01` passe. 3 images lues (brouillon ×2, look ×2 → 4).
