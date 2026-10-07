# Journal — lot ep-006

## 0 · voix/V1 + critique A7 — minutage
- episode.json : hold eclate 0,3 → 0,1 ; repos 0,3 → 0,1 ; repart 0,8 → 0,6 ; refuse 0,4 → 0,15 ; comment 0,5 → 0,2 (promesse, ouvre, choc, eteint, chute gardés : version du contre-vérificateur).
- Vérifié : `node scripts/sd.mjs script 006` → « 84.367s · timing voix réelle » (85,5 → 84,37 s, −1,13 s).
- Tout ce qui suit eclate est décalé de −0,2 à −1,15 s : les instants des planches d'origine après 31 s ne sont plus les mêmes.

## 1 · image-006/image-006-01 — le cœur à l'endroit pendant le climax
- main.js : READ az −96 → 84 (el 68, tz −3,4), sa glissade → az 94 ; le choc et la chute partagent HEARTFRAME (az 88, el 62, d 180, shift −60, side −70) ; glissade du choc → d 150, az 80 ; INSIDE az −86 → 84 ; recul de « repart » az −74 → 94.
- Vérifié : planche c1.jpg (12 instants de « elle lit » à « de lui-même ») : pointe en bas, vaisseaux en haut partout ; chip-ms (zone haute) et « 150 J » sur le torse sombre ; side −70 pour que « PLUS DE 1 000 V » et « VOILÀ LE SECRET » ne touchent plus l'électrode du flanc (c2.jpg).

## 2 · enchainements/E9 — la chute = le cadre du choc
- main.js : la coupe de la chute devient un recul depuis le cœur (shot fromD 84, 1,0 s) jusqu'à HEARTFRAME, le cadre exact du choc ; halo/ground en st(), ecg coupé par now() ; la poussée lente part à chute+0,88.
- Vérifié : c2.jpg, « cadre du choc » (chute+0,9) et « choc (cut) » : mêmes places à l'écran (électrodes, cœur), orange → vert.

## 3 · rythme/R4 — image doublée à la bascule reaim
- main.js : stage.cut(t.tremble − 1.0) ajouté ; cause du décalage : la respiration de la caméra (drift) tourne autour du point visé, donc reaim changeait la position ; WHERE passe à drift 0, HEART remet drift 1.
- Vérifié : c3.jpg, images à 10,66 / 10,70 / 10,73 s identiques (personnages et chemin non doublés). À confirmer par qa sur le brouillon.

## 4 · critique/CRIT-02 — compteur CHANCES à deux pentes
- main.js : sPush = secAt(t.masse) ; chancesAt = −10 %/min jusqu'à sPush, puis −3,5 %/min ; commentaire de tête mis à jour. episode.json → sources (ligne « Simplifications assumées ») réécrite.
- Vérifié : c5.jpg — 92 % à T+0:49 (juste après « masse »), 85 % au choc (T+2:50) ; `sd script 006` → timing voix réelle.

## 5 · critique/CRIT-05 — la victime hors de la carte d'accroche
- main.js : la chute en deux mouvements — la caméra suit la chute (0 → 1,1 s : ty 32, el 8,5, shift 108, side 140), puis pousse lentement (→ tx X−30, ty 28, d 340, az −69, el 8, fov 46, shift 110, side 170). POSE0 et FIRST inchangés.
- Vérifié : c6b.jpg (0,04 / 0,5 / 0,8 / 1,2 / 2,5 / 3,8 s) : corps entre y ≈ 875 et 1105, jamais sous la carte ; la boîte verte reste dans l'image (x ≈ 805, y ≈ 445). Essais écartés : c5b/c5c (caméra à az −60 : boîte derrière l'en-tête).

## 6 · image-006/image-006-03 + accroches/ACC-06 — la boîte en gros plan
- main.js : BOXCLOSE d 210 → 290, shift 40 → 310 (armoire y ≈ 480–1140, au-dessus des cartes) ; « la boîte » : d 340 → 280 ; établi : d 285, shift 145, side 60 (raccord même taille, même place) ; rebouclage : d 520, shift 84, recul → 660 (enseigne sous l'en-tête, armoire au-dessus du sous-titre). hall.js:107 : pilastres décalés de 150 (plus de trait à travers la boîte). Porte non touchée (le moins urgent).
- Vérifié : c6b.jpg (image 1, B à 6,95/7,99, C à 8,88/9,22, « la boîte » 23,61, raccord 24,87/24,95, rebouclage 80,07/82,66) : cartes et sous-titres sur fond sombre.

## 7 · image-006/image-006-07 — étiquettes hors des zones TikTok
- main.js : chip-flow ancre du cœur, dx 60 → −150 ; chip-call dx −330 → −250 ; chip-charge et chip-ready dx 40 → −70 ; légendes x 300/300/330/300 → 372/330/352/356 ; chip-samu y 668 → 812 (sort de la zone haute, où le champ de réponse reste seul).
- Vérifié : c7.jpg — « 0 L/MIN » x ≈ 390–800, « LE 15 EN LIGNE » x ≥ 105, légendes x ≥ 92, « 150 J » x ≈ 405–806, « VERROUILLÉ » x ≈ 432–840, « LE 15 TE DIT OÙ » y ≈ 816.

## 8 · image-006/image-006-05 (lot S) + moteur3d/A3 — le cœur
- main.js : éclair de l'extinction 1 → 0,6 ; nouvel état S.cold (0 dans FIRST) : à tDark l'ambiance va vers une encre faible (rim, fond, gel 0, ground 0), mood passe à 0 sous le froid, cold → 0 au premier battement. heart.js : matière (reflet large exposant 34, liseré d'état, sillon interventriculaire, attribut cuit `crease` entre oreillettes et ventricules), taches de fibrillation en bruit déformé (plus de produit de sinus), éclair ×1,6 centré sur les faces vues, veille au repos 0,1 → 0,26, carrés écrits x*x (plus de pow à base négative).
- Vérifié : c8.jpg / c8b.jpg — relief lisible à 42,2 / 47,7 / 49,5 / 56,1 s ; à 49,32 s plus de voile blanc (silhouette et vaisseaux visibles) ; « silence » gris froid sur noir ; le vert de « repart » sort du noir. Tubes du courant (lot M) non faits : pas dans la liste.

## 9 · image-006/image-006-02 (version sans risque) — la première image
- main.js : FIRST beacon 1,4 → 2, far 1 → 1,6 (la boîte plus présente ; beacon revient à 1,4 sur le B) ; hall.js : victim.flesh ×0,62 (tête moins claire que le cœur). Autre pose de chute : non essayée (décision de Merwan, économie).
- Vérifié : final.jpg — 0,04 s et 84,33 s identiques ; halo vert visible, cœur plus lumineux que la tête.

## 10 · emballage/E2 + critique/CRIT-09 — post et panneau
- episode.json → post : légende qui commence par « Défibrillateur : » (287 car.), épinglé 146 car., `replies` (132 et 125 car.) ; hashtags inchangés. index.html : « 0,5 s » retiré du panneau #next (« Pour quitter l'avion. Tout de suite. », 44 px mono).
- Vérifié : longueurs comptées par node ; `sd script 006` → 84.367s · timing voix réelle ; final.jpg à abo:avion+0,8.

## Fin — contrôles
- `sd check 006` : 0 erreur, contraste 66/66, « Check passed ».
- 1er brouillon : qa → 1 image parasite à 7,20 s (la tête d'un figurant frôlée pendant le vol vers la boîte, visible depuis que l'image est poussée plus haut). hall.js : figurant (2360, 60) → (3350, 150). 2e brouillon : voix calée 0 ms, −14,09 LUFS, aucune image parasite.
- Bascule reaim mesurée sur le brouillon (différence d'une image à la suivante, 10,53 → 10,90 s) : 0,02–0,08 puis 1,6 / 4,1 / 5,2 : aucun pic.
- Des commits ont été faits par un autre processus à 19:19 (0e20705, 9cc7ae1) : ils contiennent une partie de ce lot ; le reste est dans l'arbre de travail, non commité.
