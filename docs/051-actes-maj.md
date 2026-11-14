# 051 — ce que les décors ont changé (à lire avant docs/051-actes.md)

1. **POSE0** = (a6b) `{ tx: -3608, ty: 450, tz: -120095, d: 10050, az: -172.1, el: 6, fov: 40, shift: 150 }` : ton navire de verre à gauche, le brise-glace sur l'horizon à droite, lueur signal derrière. Le « se referme » vient de **`close` animé 0,55 → 0,85 de l'image 0 à « referme » (`choc`)** dans l'acte 1 : c'est le sujet qui bouge.
2. `FIRST` : `fx: -2000, fy: 300, fz: -90000, fs: 120000` ; nouveau `bowWater` (0/1) : fenêtre dans la mer autour de l'étrave, à mettre à 1 sur `bowSide` / `principle` pour voir la plaque plier sous l'eau.
3. `plan.js` : `SHOK.yaw` 50 ; `RIDGE.ahead` −5 750 (la crête est réellement touchée par l'éperonnage).
4. `VIEW` recalés : `principle` (tz −5150, d 4200, el 9), `whole` (d 27000, az −150), `exploded` (d 42000, az −140, shift −60), `tanks` (d 22000, el 40), `top` (d 2 400 000, el 75 : la ligne en diagonale), `deck`, `flank` (absolus, près de ton navire). `top`, `deck`, `flank` calculés, à vérifier sur votre planche.
5. `glace.js` : `crack` se tire sur 0,5 à 1 s (le trait blanc vit entre 0,02 et 0,45) ; remettre `crack`/`tumble` à 0 fait revenir la plaque d'un coup : seulement sur une coupe. `section` > 0,5 : plus de glace derrière la coupe ; `VIEW.section` demande d ≥ 12 000 pour voir les crêtes.
6. `model.js` : `pump` signé (> 0 bâbord → tribord, < 0 retour) ; `explode` sur l'établi seulement ; `prop` > 0,45 disque. La vue `tanks` reste dense : pas de plan long dessus.
7. `banquise.js` : œil à ≈ 8 m au moins pour lire les chenaux ; `close` > 0,8 = floes qui chevauchent + contact signal sur la coque.
