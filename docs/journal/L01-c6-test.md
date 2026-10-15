# L01 · `c6-test.js` — journal (11 Le test, 400,2 → 468,1 s)

Fichier : `episodes/L01-pare-brise/src/c6-test.js`. Build OK, `npm run check -- L01` passe (0 erreur, 31/31 contrastes). 26 images lues (3 planches de 8 + 2), toutes dans le dossier temporaire.

## Ce qui est monté (un plan par souffle, tout bouge)

- **Carte « 11 Le test »** (400,17) : coupe sur la halle vue de haut (az 34, el 50, d 1500), fouet `power3.out` 0,85 s vers le gabarit, puis approche lente. Le pare-brise est DÉJÀ sur le gabarit (`pos` 11 850) : le faire glisser de 11 700 le faisait traverser un montant du gabarit (vu à 401,4).
- **« détruire »** : la caméra descend à hauteur de la tête suspendue (el 1, d 440) : la tête, sa lampe, les graduations, le pare-brise dessous.
- **Banc optique** (coupe 405,1, `pos` 11 050, `optic` 1) : vu d'en haut, orbite az −14 → −32 ; « tordre » `optic` 2, « dédoubler » 3 (push à d 270), « Devant tes yeux » `optic` 1 et montée à el 62 (d 230). Faits : « ≥ 70 % » (70 %), puis « DÉFORMATION TOLÉRÉE / 3 × MOINS / DEVANT TES YEUX » (le chiffre sur « trois »). À az −52 le verre faisait une tache blanche sur la table lumineuse : écarté.
- **« On le frappe »** (`tozero`) : la tour en plan d'échelle qui monte jusqu'à la bille ; `mood` 1 sur « frappe ». « Une bille… deux kilos » : la bille de près (d 115 → 105) ; fait « 2,26 KG », « LÂCHÉE DE 4 M » sur « quatre ».
- **« Lâchée »** : `ball` 0 → 1 de « Lâchée » à « frappe » (k² dans le décor), la caméra tombe avec elle (`power2.in`) ; coupe sur l'éprouvette 0,16 s avant le contact ; « frappe » : l'étoile écrasée (`web` 0,12) + secousse ; « casse » `web` 0,8 / `rings` 0,7 ; « Le film tient » `stick` 1 ; « Elle ne doit pas passer » : coupe en plongée serrée, `ball` → 1,2, la bille posée dans la toile (le dessous de l'éprouvette tombait sur une grande dalle grise du bâti : écarté) ; « Et pas une fois » : recul en orbite ; fait « 11 SUR 12 » (veille).
- **Petite bille** (coupe 430,3, éprouvette neuve) : la bille de 227 g au sommet du mât (d 85 → 70) ; fait « 227 G », « LÂCHÉE D'ENVIRON 9 M » sur « neuf » ; « Lâchée » : `small` 0 → 1 jusqu'à « détache » et la caméra passe au-dessus d'elle en plongée sur le mât ; coupe sur la boîte : « plus quarante » `chamber` 1, `temp` 40 (orange franc) ; « moins vingt » `chamber` −1, `temp` −20 (givre) ; impact sur « détache » (`web` 0,3), plongée ; fait « CE QUI SE DÉTACHE / ≤ 25 G » (le chiffre sur « vingt-cinq »).
- **La tête** (coupe 441,0, `chamber` 0, `temp` 20, éprouvette retirée) : le gabarit entier → push sur la tête (« Une tête factice ») → descente le long des 1,5 m (« lâchée d'un mètre cinquante ») ; fait « 10 KG », « LÂCHÉE D'1,5 M » sur « mètre ». Coupe au ras 0,22 s avant `trigger` (cadre haut : la tête entre par le haut vers k 0,33) ; `drop` 0 → 1 en 0,55 s à `trigger`.
- **Le contact** : `web` 0,55 + secousse ; « pour réussir l'essai » : coupe de trois quarts sur la toile ; « casser » `web` 1 ; « cercles » `rings` 1 ; « Les plus proches » : montée en plongée (el 72) ; fait « < 8 CM » (veille).
- **« dissipent »** : orbite lente en plongée ; « Et chaque éclat » : coupe serrée sur les éclats, « collé » `stick` 1, `drop` 1,15 ; « Rien ne vole » : coupe dessous le pare-brise, la toile veille, la tête retenue par le film ; `mood` 0 sur « passe ».
- **Le témoin** : coupe à mi-chemin puis travelling vers le témoin (`witness` 1 dès la première coupe : il attend sur son support) ; « coup » `strike` 0 → 1, contact sur « sec », `grains` 0 → 1 + secousse ; « On compte » : le pointeau remonte (`strike` 0), plongée sur le carré (d 46 → 38, az 20 → 36 : moins de reflet qu'à az −18) ; « carré » `count` 1 ; faits « UN CARRÉ DE 5 × 5 CM » puis « PAS MOINS DE 40 GRAINS ».

## Les plans un cran en dessous

- La tour en plan d'échelle (417,1 → 419,4) : treillis fin sur noir, comme annoncé par les décors.
- La chute de la bille (421,6 → 422,9) : la caméra tombe avec elle, mais le bâti de verre derrière la rend confuse (on ne sait pas tout de suite qu'elle est au-dessus de l'éprouvette).
- La petite bille frappe à 8 cm de l'axe de la grande (`smallAt` [8, 5]) alors que la toile se dessine à `IMPACT.test` : l'étoile n'est pas sous la bille (petite en plan moyen). Et « quelques éclats tombent sous la plaque » n'a pas d'image : aucun nombre pour ça.
- La plongée au sommet du mât après « Lâchée » (433,1 → 434,5) et la plongée serrée sur la bille posée (425,7 → 427,2) n'ont pas été revues après réglage.
- Les grains du témoin, de près : très clairs (blanchiment), le carré se lit mais ses grains ne « s'allument pas un à un » (pas de nombre pour ça).

## À changer ailleurs

- `casse.js` (facultatif) : centrer l'étoile de la petite bille sur `smallAt` de `postes.js` ([8, 5]) quand `small` > 0,5 — aujourd'hui elle est à `IMPACT.test`.
- `postes.js` · `makeStriker` (facultatif) : surligner les grains un à un dans le carré (`square` 0,5 → 1) pour « on compte les grains ».

## Reprise après relecture (cadres vides) — 10 images de plus

- « détruire » (404,7) : d 440 → 340, ty 190 : la tête et le pare-brise tiennent la hauteur du cadre.
- La petite bille : le mât n'est plus filmé. Bille au sommet de près (d 52 → 40), puis la caméra TOMBE avec elle (d 46, `power2.in`, la courbe en k² de la tour) jusqu'à la coupe sur la boîte, resserrée (d 185 → 160).
- La tête (443,1) : coupe à d 420, push à d 105 sur la tête en 1,2 s (au lieu de 1,8 s), ty 252 ; la dernière image (avant ce réglage) la montrait encore haute et petite : ce réglage-là n'a pas été revu.
- Le témoin (462,3) : la coupe se pose à 70 cm du témoin (d 280) et le travelling finit à d 165 : le témoin occupe la moitié du cadre.
- La petite bille sur l'étoile : pas simple depuis ce fichier (l'étoile est à `IMPACT.test`, la bille à `smallAt` [8, 5] de `postes.js`) — laissé, voir « À changer ailleurs ».
