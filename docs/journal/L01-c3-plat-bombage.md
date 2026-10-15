# L01 · `c3-plat-bombage.js` — journal (2026-10-15, nuit)

04 L'étenderie + 05 Découpe et bande noire + 06 Le bombage + le seuil (133,52 → 215,55 s). Un fichier, aucun sous-agent. `npm run check -- L01` passe (0 erreur ; les avertissements de shaders et de bord de canvas ne viennent pas de ce fichier). Tous les repères vérifiés contre la vraie voix (script `scratchpad/c3/refs.mjs` : chaque `beat:mot` tombe sur le bon mot).

## Ce qui est monté

- **04** — coupe sous la carte sur le flanc de l'étenderie, fouet `expo.out` vers la bouche du tunnel ; on ENTRE dans le tunnel sur « refroidir » et on file avec le ruban, qui passe de l'orange au gris pendant que l'en-tête descend de 600 à 20 °C (arrivé à 20 à la découpe) ; « Trop vite » : la caméra accélère, « lentement » : elle ralentit. Sortie claire du tunnel, coupe sur la molette : la caméra roule AVEC la molette à travers le ruban (`knifeZ`, sinon elle traverse le cadre en 0,3 s), puis la tête se lève. « Seize kilomètres » : coupe, les ébauches se suivent (`queue` 1, `pos` avance à la vitesse des rouleaux, 40 cm/s), machines baissées (`line` 0,45) et verre allumé (`litGlass` 0,5) pour qu'on les lise ; travelling latéral, puis grand recul par rapport (« Paris–New York »). « Plate » : plongée par rapport sur une ébauche seule, rasante. Puis un travelling vers l'aval, trois arrêts : découpe, sérigraphie, four de bombage.
- **05** — fouet vers la molette (sujet poussé à droite : la carte « Découpe et bande noire » est longue), la molette mord sur « commence ici » ; « à sa forme » : vers l'aval, le trait court le long du contour (`cut` 0 → 0,4), la chute part sur « forme » (0,75) ; « adoucit les bords » : gros plan du bord (`cut` → 1) ; « On lave. On sèche. » : l'ébauche glisse jusqu'à la sérigraphie, la caméra avec elle, arrivée sur « imprime ». La raclette passe, la bande se pose (`squeegee` 0 → 1, `print` 0 → 0,45) ; « pas de la déco » : on monte, la bande vue tout autour. « Collé » : coupe dans la voiture, le bord bas du pare-brise vu de dehors, la bande s'allume (`litBand`) ; « soleil » : `gel` 0,22. « Même procédé » : retour à la sérigraphie, second passage : les points (`print` → 0,8) et les fils d'argent de l'échantillon (`silver` → 1) dans le même balayage. « Le tampon du coin ? » : coupe sur l'établi, le coin du pare-brise fini (`VIEW.stamp`), le tampon s'allume (`litStamp`). « Un E et un chiffre » : la plaque du tampon agrandi glisse (`doc` 3, `docIn`), E, puis E2 (« France »), puis II, chacun sur son mot ; faits E2 = FRANCE puis I = TREMPÉ / II = FEUILLETÉ.
- **06** — fouet vers le moule devant la porte du four ; « l'une sur l'autre » : la feuille du dessus descend (`open` 0,6 → 0) ; « on chauffe » : le chariot entre dans le four, la caméra le suit, les résistances rougissent, `temp` 600 sur « 600 », fait PLUS DE 600 °C ; « s'affaisse » : la selle orange descend (`bend` 0 → 1) ; « Courbées ensemble » : il refroidit (`glow` 0, 20 °C), vu dans l'axe de la ligne les deux courbes n'en font qu'une ; « qu'entre elles » : elles s'écartent (`open` 0,3).
- **Le seuil** — « prendre le choc » : 0,8 s sur la halle d'essai, la tête tenue au-dessus du gabarit ; puis la caméra suit déjà le pare-brise bombé hors du four vers la salle blanche (dont l'air s'allume, `air` 0,7) ; le nom du compte passe au vert de « abonne-toi » à la fin de la phrase. Rien ne s'arrête.
- Les deux étiquettes du plan (« TROP VITE : DES TENSIONS », « COLLÉ ICI ») ne sont pas posées : le mot-clé automatique (TENSIONS, COLLÉ) dit la même chose au même instant — une seule information écrite à la fois.

## Ce qui est un cran en dessous (dit franchement)

- **145,1 et 160,3 — la molette** : elle se voit (tête et pointe rouge), mais elle mord dans du vide : le ruban froid est invisible et l'étincelle ne se voit pas.
- **146,3 → 149,6 — les ébauches qui se suivent** : travelling rapide, flou, les ébauches coupées par les bords du cadre.
- **157,7 → 159,35 — « découper… imprimer… plier »** : deux bonds de 7 et 9 m en 0,8 s (flou) ; le four n'est vu que ≈ 0,4 s avant la carte du chapitre 5, et « plier » (159,62) tombe sous cette carte, sur la molette.
- **165,3 — « On lave. On sèche. »** : pas d'image du lavage, seulement l'ébauche qui glisse.
- **142,9 — fin du tunnel** : le ruban refroidi est une dalle grise.
- **193,6 — « l'une sur l'autre »** : la feuille du dessus flotte, rien ne la tient (aucune machine au poste de bombage).
- **208,2 — « entre elles »** : le jour noir entre les deux verres se lit mal de profil.
- **214,3 — vers la salle blanche** : le pare-brise sur son chariot est petit et sombre.
- **Pas revus après correction** (budget atteint) : la molette du chapitre 4 (même recette que celle du 5, vue), le moule à 193,6 (`el` 14, `line` 0,55), le coin du tampon sur l'établi (181 s), la fin du recul (153,3), le retour du flash (211,75).

## À changer ailleurs

Rien d'obligatoire. Constaté : sur la ligne, le pare-brise est couché face extérieure en bas, donc son tampon vu d'en haut se lit en miroir (b2, 181,6) — c'est physiquement juste ; le chapitre 05 le montre donc sur l'établi (`VIEW.stamp`), pas sur la ligne.

## Images lues : 26 / 26

Planches `b1` (8), `b2` (8), `b3` (8), `b4` (2), dans `scratchpad/c3/` — aucune dans `renders/`.

## Reprise (relecture du film entier) — 10 images lues (r1 : 6, r2 : 4)

- **145 s, la molette (04)** : vue serrée depuis l'aval (d 150 → 130, az 40), machines baissées (`line` 0,5) : le bout clair du ruban, ses bords, la molette et son étincelle ; la caméra suit toujours la molette.
- **160 s, la molette (05)** : serrée de côté (d 125 → 110), elle court jusqu'au bord proche du ruban et l'atteint sur « ici » ; sujet à droite de la carte.
- **162–164 s, le contour** : l'ébauche allumée (`litGlass` 0,5), machines à 0,4, cadre serré (d 260, el 48) : le trait court sur une feuille claire qui tient la moitié du cadre. Le mouvement part 0,6 s plus tôt (à 163,0, la feuille était encore au bord du cadre : corrigé sans être revu).
- **165 s, « On lave. On sèche. »** : caméra basse sous la poutre de la sérigraphie, l'ébauche file devant elle, le reflet balaie le verre pendant que la caméra tourne ; puis la raclette.
- **193,5 / 203,1** : chariot du bombage resserré (d 225, `side` −60) ; la selle orange, d 285 au lieu de 340. Pas revus.
- Toujours un cran en dessous : un reflet vertical très clair au centre de la molette du 05 (161 s) ; la carte « Découpe et bande noire » frôle la molette.

## Images parasites du brouillon (qa) — 7 images lues

- **161,37–163,57 s (23 images)** : un plan à durée NÉGATIVE (`t.deux - t.ici - 0.81`) se chevauchait avec le mouvement avancé du contour : la caméra sautait d'une pose à l'autre. Retiré ; la molette finit sa course plus lentement (0,88 → 0,95 en 0,3 s), puis une COUPE à 161,66 s sur le contour (le long travelling au-dessus des rouleaux, un sol rayé traversé vite, aurait clignoté lui aussi). Tous les plans du fichier vérifiés : durées positives, aucun chevauchement.
- **157,80–158,30 s (2 images)** : bond de 7 m en 0,8 s au-dessus des rouleaux (rayures stroboscopiques). Remplacé par une dérive lente sur la découpe et une coupe sur « imprimer », chaque dérive sous un septième du pas des rouleaux par image.
- Pas de nouveau brouillon : à confirmer par `qa`.
