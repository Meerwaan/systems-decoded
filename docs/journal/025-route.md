# 025 · ESP — journal du décor `src/route.js`

2026-10-17. La route de campagne la nuit, le sanglier, l'élan, la voiture du 014 aux rayons X (quatre roues de verre), les flèches, les traces, l'arc du redressement, le moteur et ses arbres, 1997, la fusée.

## Fait
- `route.js` réécrit en entier à partir d'une COPIE de `014-abs/src/street.js` (le 014 n'est pas touché) : la peau de la voiture, ses lignes, la pluie, les gerbes, toi au volant, `pivot` / `slide` repris tels quels ; le camion, ses feux et le reflet de ses feux retirés ; le plongeon (`dive`) et la pédale retirés (tes deux pieds à plat : l'ESP freine sans toi).
- La route (un seul shader, repère de la route) : ta ligne de rive à droite (x 175), la ligne médiane discontinue (−175, 3 m tous les 13 m), la rive d'en face (−525) ; les bas-côtés (la grille seule) ; **les deux fossés** creusés dans la géométrie (auge de 1,40 m, 60 cm de fond) : leurs deux lèvres, des nervures EN TRAVERS de l’auge (elles suivent sa courbe), un filet d’eau au fond ; l'eau de la chaussée et les deux faisceaux (portée allongée : 20 m au lieu de 15).
- Les yeux des bêtes : deux points signal (sprites) qui ne s'allument que dans les faisceaux, et leur reflet en traînée sur l'eau (le reflet des feux du camion du 014, repris pour quatre yeux).
- La lisière : troncs de verre instanciés (deux à trois rangs de chaque côté, au-delà de `ROAD.trees`), qui défilent avec `gap` dans une fenêtre de 140 m et s'éteignent vers le haut ; les faisceaux les allument quand ils passent dessus.
- Le sanglier (verre sur un remplissage sombre qui écrit la profondeur : les phares derrière lui découpent une silhouette, la pluie et les reflets passent derrière) : poitrail haut, dos qui descend vers une petite croupe, tête en coin portée bas et tournée vers tes phares, crête de soies et défenses en traits encre. Sa face tournée vers les phares s'éclaire quand il est dans les faisceaux.
- L'élan : même construction (bosse, longues pattes, mufle lourd, bois palmés en traits encre), dans la voie (`mooseAt` 0) ou debout au bord du fossé de gauche (`mooseAt` 1), posé sur le terrain.
- Les quatre roues de verre (l'avant gauche ajoutée), les deux avant braquent ; un anneau veille sur la jante avant droite avec `bFR`.
- Le moteur (bloc, culasse, cloche de boîte, en verre) et les deux arbres de transmission : des têtes de lumière encre qui coulent vers les roues (18 cm de période, 60 cm/s : 2 cm par image, sous le septième), éteintes avec `gas` ; une lueur dans le bloc qui respire lentement.
- Les flèches (longueur 0,6 × `ARROW.len` = 5,4 m, pour que leurs pointes restent dans `VIEW.top`), l'encre tournée de `aim − yaw` (repère de la route), celle de la voiture veille → signal avec `alarm`. Les traces : deux arcs signal derrière les roues arrière, du trait qu'elles tenaient à leur place actuelle (courbure = l'écart), longueur 7 m + 22 cm par degré de lacet. L'arc du moment : anneau veille de 3 m de rayon, du coin avant droit vers la droite (contre la toupie), tête de lumière et pointe de flèche à son bout.
- 1997 : la voiture (roues, caisse, toi, moteur) bascule autour de la ligne de contact des pneus droits, 40° à `tip` 1 ; les gerbes s'éteignent.
- La fusée : traînée dessinée à l'écran (3,4 → 6 px) sur un chemin fixe à 170 m au-dessus du bois ; tête encre (→ 0,7), la traînée se rompt sous sa tête avec une lueur signal (0,7–0,8), un point veille s'en détache et redescend (0,8 → 1).
- Pluie vue d'en haut : seules les gouttes près du sol restent (sinon des barres en travers de l'image) ; troncs vus d'en haut : leurs pieds seulement (des traits courts en rangs). Aucune allocation dans `update` (vecteurs réservés).
- `npm run check -- 025` passe (0 erreur ; avertissements : un `isnan` d'un shader du plateau, « canvas à bord »).

## Planches (30 images lues sur 30)
1. Bouchon des candidates refait sur le vrai décor : (b) faisait un « mouton » gris, la tête hors cadre ; la pluie vue d'en haut faisait des barres ; les troncs, des traînées. → sanglier redessiné, verre plus net, pluie et troncs réglés pour les vues hautes.
2. (b) se lit : un sanglier, sa crête, la voiture et ses phares derrière, sur la route mouillée. (d) : l'écran du tableau de bord du 014 était une dalle grise au milieu du pare-brise → retiré.
3. Toupie, large, redressement, moteur, élan, 1997 : la toupie et le redressement se lisent sans légende ; les fossés ne se lisaient pas ; l'élan était hors cadre (le squelette de l'acte 1 fait bouger `gap` à 5 s : toujours donner `gap` dans un essai).
4. Fossés en nervures EN TRAVERS de l'auge (elles suivent sa courbe : le creux se lit en perspective), flèches raccourcies, arbres moteurs plus épais : tout se lit ; l'élan (bas-côté et dans la voie) se lit ; la fusée monte, rompt, le point veille redescend.
5. Avec l'en-tête : (b) tient dans les zones ; la toupie et le large lisent leurs fossés (bandes nervurées) ; 1997 sur deux roues se lit.

## Poses (prêtes à coller)
- **Première image, recommandée : (b) recadrée** — `POSE0 = { tx: 0, ty: 50, tz: -2035, d: 950, az: -172, el: 3, fov: 34, shift: 120, side: 0, roll: 0, drift: 0 }` (`tz` = CAR.nose − 100·FIRST.gap : la caméra est 9,5 m devant le sanglier, un peu à sa gauche). Le sanglier en silhouette de profil au centre-gauche (y ≈ 770–1040), ses soies, un œil signal, son reflet ; la voiture et ses deux phares en haut à droite. ATTENTION : le sanglier se tient à `gap` ; si l'acte 1 fait filer `gap`, il s'éloigne de la caméra vers la voiture — la caméra doit le suivre (tz = −235 − 100·gap) ou pousser plus vite que lui.
- (a) `{ tx: 10, ty: 70, tz: -1300, d: 1800, az: -3, el: 5, fov: 34, shift: 160, side: 0, roll: 0, drift: 0 }` : par-dessus ta tête, le sanglier petit au bout des faisceaux, toi au volant en bas. Lisible, moins fort.
- (c) `{ tx: 0, ty: 0, tz: -900, d: 3200, az: -20, el: 62, fov: 40, shift: 0, side: 0, roll: 0, drift: 0 }` : la carte ; le sanglier minuscule en haut à gauche. Faible en première image.
- (d) côté passager, `onboard` 1 : `{ tx: -20, ty: 95, tz: -700, d: 760, az: 6, el: 2, fov: 46, shift: 40, side: 0, roll: 0, drift: 0 }` : le sanglier par le pare-brise, mais le dossier de ton siège en verre encombre le bas. Faible.
- Toupie et redressement : `VIEW.top` tel quel (flèches, pointes, traces, arc, fossé de droite nervuré). Large : `VIEW.wide` tel quel (les deux fossés en bandes nervurées ; la voiture à droite du centre — `tx: 0` la recentre).
- L'élan au bas-côté : `VIEW.verge` tel quel, avec `gap: 18` dans l'état. L'élan dans la voie (la rime avec la première image) : la pose (a) avec `gap: 14, archive: 1, you: 0`.
- 1997 : `VIEW.tip` tel quel (sur deux roues, de l'avant gauche). Avec l'élan dans le même cadre : à trouver (az −140 le laisse hors champ).
- Moteur, `onboard` 1 : `{ tx: 0, ty: 45, tz: -165, d: 520, az: -160, el: 40, fov: 30, shift: 80, side: 0, roll: 0, drift: 0 }` : gas 1 → 0 se voit (les arbres et la lueur s'éteignent), mais le frein avant gauche de `model.js` occupe le premier plan.
- Fusée, voiture arrêtée (`kmh: 0, lane: -0.6, gap` fixe) : `{ tx: -400, ty: 2200, tz: -8000, d: 8850, az: 2.9, el: -13.3, fov: 40, shift: 0, side: 0, roll: 0, drift: 0 }` — toi et la voiture en bas, toute la trajectoire dans le cadre (à `el` −9, le haut de la traînée et la lueur de rupture sortent du cadre).

## Pas encore au niveau (dit franchement)
- (c) et (d) en première image : faibles. (b) est la seule forte.
- Plan du moteur encombré (le frein du système devant) ; le flux se lit, sans plus.
- L'anneau `bFR` sur la jante et la lueur de rupture de la fusée (0,7–0,8) : non vus sur planche (budget épuisé).
- La lisière : présente et lisible de près et à hauteur d'homme ; dans le plan de la fusée elle est pâle (le décorateur doit l'habiller).
- Le corps des bêtes éclairé par les phares tire vers un gris plein (l'élan surtout) : c'est ce qui les fait lire, mais c'est moins « verre » que le reste.

## Le ralenti (`SLOWMO` 6)
Pas de route figée dans ce décor : à ≈ 3,7 m par seconde de film, la ligne médiane avance de 12 cm par image (sa période est de 13 m), les troncs défilent, la pluie tombe à sa vitesse de film, les marques des roues sont étalées à la vitesse de l'histoire, et les lignes en travers (grille, nervures des fossés) sont étalées sur 37 cm par image (vitesse `kmh`) : aucun scintillement. Rien à changer de mon côté ; à confirmer en mouvement au brouillon.

## À changer ailleurs
- `world.js` : `POSE0` = la pose (b) ci-dessus (ou celle que choisit celui qui orchestre) ; `VIEW.engine` = la pose moteur ci-dessus ; `VIEW.shoulder` = la pose (d) ci-dessus.
- `plan.js` : rien d'obligatoire ; `ARROW.len` (9 m) est dessiné à 0,6 (5,4 m) dans `route.js`.
