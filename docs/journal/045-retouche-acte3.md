# 045 · acte3.js — retouche (retoucheur, 08/11)

Lu : journal 045-acte3, acte3.js, regles-image (« Net et fluide »), world.js (poses), plan.js (SRI, fusée, KM), fusee.js (SRI, charge, blast), direct.js (cut, path, punch). Planches : `.cache/planches/045/retouche-acte3/p1…p5.png` (5 images lues).

## Retouche du 08/11

| Défaut | Correction | Vérifié à |
| --- | --- | --- |
| 1 · 39,3–39,8 entrée `padBay` abstraite, heurt 39,6 | `PAD_BAY` d 4800, az −24, el −10, fov 40, shift 260, dof 0 : la fusée (coiffe, nez des deux boosters, corps) et la case veille dans le verre ; le recul vers `padOut` passe de ×15 à ×1,9 en 1,4 s, puis `PAD_OUT2` (d 10 200, az −46) jusqu'à la coupe | 39,23 · 39,6 · 40,2 · 41,87 |
| 2 · heurts 41,8 et 44,0 (cabine, grue) | le path unique est coupé en trois plans : coupe sur la cabine à `sauvegarde − 0,15` (41,89, après « Kourou »), coupe dans l'axe sur la grue à `règle − 0,255` (43,985, avant « Sa ») ; les lumières `LIGHT.booth` et `LIGHT.wide` passent dans l'état des coupes (plus de tween à cheval) ; `chip-cnes` finit avant la coupe | 41,87 / 41,90 · 43,97 / 44,00 · 45,0 |
| 3 · 51,3 SRI petites au bord, ligne de charge, heurt 52,3 | case vue de az −118 → −125, d 700 → 600, visée au milieu des deux SRI (`ringPoint(−42,5, 163, 3130)`) : SRI ≈ 245 et 165 px à x ≈ 400 et 630, sans nez de booster devant ; `charge` 0 dans la case, rendue à 0,25 sur la coupe des tuyères ; coupe à `tuyères − 0,255` (51,785) sur les tuyères (d 2000, recul continu 2000 → 2800 → 15 000), lumière posée sur elles ; punch de « lâchent » relâché avant la coupe, `chip-sri` aussi | 48,47 · 49,6 · 51,2 · 51,43 · 51,6 · 51,77 / 51,80 / 51,83 · 52,52 |
| 4 · 58,1–58,5 « détone » sans détonation | `blast` 0 → 1 en 0,2 s `power3.in` (au lieu de 0,3 s linéaire) : l'éclair de la case vit 3 images (58,17 · 58,20 · 58,23), le front file le long de la ligne en 4 images ; `jolt` et un punch 0,08 sur le pic (58,17) ; `inside` 0 sous l'éclair (0,12 s) | 58,10 → 58,33 image par image · 58,5 · 59,0 |
| 5 · 56,4 « s'arrachent » courbe non revue | revue, inchangée : nez levés à 56,1, feu aux jonctions à 56,4, boosters détachés dans le cadre à 56,8 | 56,1 · 56,4 · 56,8 |

`npm run camera` : plage fixe 41,9–44,0 (la cabine : la fusée décolle par la vitre, les écrans tracent — voulue) ; par seconde 44 : 71 °/s (grue → couloir, sans rien près de l'objectif), 52 : 55, 53 : 89. `check` passe.

## Reste à voir sur le prochain brouillon
- `qa` aux anciens heurts (39,6 · 41,8 · 44,0 · 52,3) et sur 44–45 (grue → couloir) et 53 (tuyères → fusée entière, recul rapide d'origine, non touché).
- 53,0 « à fond » : les tuyères glissent sous les sous-titres pendant le recul (déjà le cas avant ; un `shift` sur `NOZ` si ça se lit mal).
- La 2ᵉ SRI montre ses arêtes veille, pas sa face (sa face regarde vers l'extérieur, de l'autre côté) : elle « s'éteint » par ses arêtes.

## À changer ailleurs
- `src/fusee.js:1378` (`glows.amt[2]`, l'éclair de la détonation à la case) : à 6 800 cm il fait ≈ 30 px, un point veille, pas un éclair. Le faire blanc-veille et ≈ 3× plus grand pendant `blast` 0,02–0,3 (même fenêtre, donc toujours 3 images) ; rien à changer dans acte3.js.
