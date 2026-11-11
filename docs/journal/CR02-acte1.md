# CR02 · acte1.js — journal

Agent acte, 06/11. Fichier : `episodes/CR02-deepwater/src/acte1.js` (0 → `tot1` 30,47). Planches : `.cache/planches/CR02/acte1/`.

## Écriture 1
- Plan-séquence : six `D.path`, un par lieu (plancher · plateforme + plongée · BOP · puits · BOP · compteur), az toujours décroissant, tous `to: "go"`.
- Coupes : `promesse` − 0,12 (plateforme entière) · `fermer` − 0,12 (BOP) · `toprincipe` (puits) · `tobop` (BOP) · `topiege` (compteur).
- Gestes : jet 0,6 → 0,72 (`none`) puis 0,88 sur « crache » ; BOP : `flow` 0,4 → 1, `vbr` → 0,8, `bsr` → 0,6, `pass` 1 ; puits : `ok` sur « boue », `balance` 0 → −0,7 (« poids ») → −0,25 + `gas` 0,02 (« gaz ») → −1 (« remonte ») ; BOP : `vbr` sur « mâchoires… serrent », `bsr` + `shear` sur « coupent » ; compteur : `debit` → 9,4 (« venues » → « dix ») → 10, `mark` sur « Retiens ».
- Punchs : choc, sceller, remonte, bop, dix1.

## Planches (26 images lues : b1 8, b2 8, b3 8, b4 2)
- b1 : accroche au niveau (jet rouge vif dans le treillis, la pluie bouge, pas de barre devant l'objectif). Plateforme entière : la couronne et le jet sous l'horloge → `d` 1080, `shift` 150. Plongée : le petit BOP sortait par le bas (zone des sous-titres).
- b2 : BOP plein + rouge qui passe = bon (mais trop bas, `shift` 150 ensuite) ; puits : 11,5 / 13,3 sombres (boue au repos brune) ; 14,6 / 16 (boue verte, flèches, compteur) bons.
- b3 : BOP ouvert (19), VBR verte (22,9), lames vertes (24,6), compteur (26,5 ; 29,8 avec `chip-10`) bons. 11,8 : le BOP simple et le riser, brun, peu lisible.
- b4 : fin de plongée : le petit BOP ≈ 30 % à 7,45 s mais sa base sous 1248 → `shift` 120 sur la dernière clé, 60 sur « fond » (**non revu**, plus d'images).
- `npm run camera` : aucune plage fixe ≥ 1 s entre 0 et 30,5 ; 4 à 7 °/s au plus lent (4, 11, 26 s) ; la plongée à 70–79 °/s (6–7 s), voulue.
- `check` passe (le contraste `#hud-remain` à 77 s n'est pas de l'acte 1).

## Rendu à l'acte 2 (à `tot1`, lancé)
Puits, compteur de débit, pose ≈ `{ A("puits", [-3, 92, 40]), d 380, az −75, el 7, fov 30, shift 40, dof 0 }`, état `PUITS0` + `debit` 10, `mark` 1, `ok` 0, `balance` −1, lumière `lit("puits", [-3, 84, 40], 120)`. `chip-10` sorti à `tot1` − 0,3 + 0,2.

## Un cran en dessous
- `toprincipe` → `long` (10,2 → 12,8) : le haut du puits (BOP simple, riser) brun sur brun, la boue au repos sombre ; se lit par la forme, pas par la matière.
- `fond` (6,56) : le petit BOP encore petit (≈ 10 %) sur « Au fond », il grandit jusqu'à 7,6.
- Le jet de la plateforme entière (3,4 → 5,5) est petit (≈ 5 %) sous l'horloge.

## À changer ailleurs
Rien.

## Retouche du 06/11
- Plages lentes 8–10 s (BOP, « sans sceller ») → `pass` 0 à la coupe, `annular` 0,8 sur « fermer », `vbr` 0,8 à +0,25, `pass` 0 → 1 sur « sans » (le rouge traverse), `bsr` 0,6, `inside` 1 sur « puits », clé de caméra sur « Pourquoi » (d 610 → 540 → 450). Vérifié à 8,3 / 9,0 / 9,8.
- 10,2 → 13 s brun sur brun + plage 10,5–12,5 → coupe sur la colonne (visée y 215, d 400, lumière `lit("puits", [0,210,0], 190)` dès la coupe) ; `ok` 0 → 0,45 de la coupe à « puits » + 0,3 (la boue verdit pendant « D'abord, comment ça marche »), 1 sur « boue » inchangé. Vérifié à 10,6 / 11,0 / 11,6 / 12,4.
- Plage 15,5–17,5 → le gaz entre sur « pression » (`gas` 0,03), pousse sur « gaz » (`balance` −0,15, `gas` 0,05), recule sur « bas » + 0,06 (−0,45), perd sur « rien » (−1, 0,008). Aucun tween du même nombre ne se chevauche. Vérifié à 15,6 / 16,4 / 17,0 / 17,6.
- Plage 18,5–21 → le rouge monte dans l'alésage ouvert en deux poussées (`flow` 0,55 à la coupe, 1 sur « barrière »), clé de caméra sur « barrière » ; la VBR verte l'arrête ensuite. Vérifié à 19,6 / 20,4 / 21,2.
- 6,56 petit BOP ≈ 10 % → clé `fond` : visée y 40, d 400, shift 80 (≈ 15 % à 6,56, ≈ 30 % à 7,5, base au-dessus des sous-titres : le `shift` 120 de la dernière clé revu, il tient).
- POSE0, l'image 0, la pose et l'état rendus à `tot1` inchangés. `npm run camera` : aucune plage fixe ≥ 1 s ; `check` passe. Planches : `.cache/planches/CR02/acte1-retouche/`.
- Reste à voir sur le brouillon : `qa` → rythme à 10,3–11 s (la colonne encore brune les 0,7 premières secondes) et à 8–10 s (le rouge déjà haut à 8,3 malgré `pass` 0).
