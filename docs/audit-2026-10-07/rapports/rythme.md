# Audit « rythme » — films 002 à 006

Mesures : `mesure.mjs` (image réduite, différence moyenne image à image « MAD » sur 0–255, luminance, pixels presque noirs) puis `analyse.mjs` ; tableau complet et courbes dans `resultats.md`, données dans `resultats.json`. Seuils de lecture : « calme » = MAD lissée < 0,35 ; « temps fort » = MAD lissée ≥ 3. Coupes : les `cut()` du code, vérifiées contre les pics.

Limites à garder en tête : (a) aucun chiffre TikTok n'est disponible, donc les seuils ci-dessous viennent de la comparaison entre nos cinq films, pas de la rétention ; (b) la MAD compte toute l'image, sous-titres compris ; (c) les lignes de code citées ont été repérées par recherche, pas relues en entier : les valeurs proposées sont des points de départ à régler avec `look`.

## 1. Propositions, de la plus rentable à la moins rentable

### P1 — 005 : l'accroche est une image fixe pendant 4,5 s (gratuit, S/M)

- Preuve : plage calme 0,00 → 4,47 s (MAD 0,11), 0,1 % de pixels changés par image sur 0–1 s et 0–3 s, premier temps fort à 4,87 s. `frames/005/hook_01.jpg` : dix vignettes identiques, seul le mot allumé change. Références : 004 = 4,9 % de pixels changés, 006 = 5,9 %.
- Cause : `episodes/005-arret-urgence/src/main.js:157` — `shot(0, t.promesse - 0.35, { az: 23 }, "sine.inOut")` : quelques degrés d'azimut en quatre secondes, rien d'autre.
- Correctif (la première image reste POSE0, la boucle n'est pas touchée) :
  1. Sur « Panne » (≈ 0,25 s) : la couronne verte tombe une fois (`gPower` 1 → 0,15 en 0,10 s, retour en 0,35 s), le « 100 % » du HUD passe en signal le même temps. Une seule chute de lumière, pas un clignotement.
  2. Caméra : remplacer la ligne 157 par une avancée réelle, par exemple `shot(0, t.promesse - 0.35, { d: POSE0.d * 0.82, az: POSE0.az + 14 }, "sine.inOut")`.
  3. Sur « réacteur nucléaire » (≈ 3,3 s) : une bouffée du cœur orange (`glow` +40 % sur 0,4 s).
- Cible : MAD 0–1 s ≥ 1,5, au moins un temps fort avant 1,0 s et un second avant 4 s.

### P2 — 005 : le film est trop sombre, surtout après la chute (gratuit, M)

- Preuve : luminance moyenne 22,7 (les autres : 29,9 à 38,6) ; 70 % de pixels presque noirs ; 40 % du film sous Y 18 ; 22 s de plages sombres dont 53,6 → 62,6 s (9 s, Y 15,5) et 63,1 → 69,8 s (6,7 s, 11 % de la zone sujet éclairée). De la chute à la fin : Y 16,3 ; CTA : 14 % de la zone sujet éclairée (004 : 77 %).
- Images : `frames/005/film_08.jpg` (56–63,5 s) — Chicago en fil gris sur noir, la pile occupe un sixième de l'image ; `film_07.jpg` (48–55,5 s) — la cuve petite, seule sur un fond noir ; `film_09.jpg` et `film_10.jpg` — la bobine verte sur l'établi, étroite, le reste noir.
- Correctifs :
  - Chicago (`main.js:307-312`) : entrer plus près (`d: 7000` → ≈ 4800) et donner un halo au sol sous la pile (même `pool` que l'établi, ≈ 0,3, teinte encre). Vérifier que la grille seule reste le sol (règle « pas de sol plein »).
  - CTA sur l'établi (`main.js:322`) : `d: 420` → ≈ 300 et halo `pool` 0,26 → ≈ 0,40 ; le sujet remplit alors la zone 440–1160.
  - Chute (`main.js:295-299`) : la cuve mise de côté peut être 25 % plus grande, sa lueur verte dosée plus haut (sans dépasser 3).
- Cible : luminance moyenne ≥ 28, zone sujet éclairée ≥ 40 % en moyenne, aucune plage sombre ≥ 3 s hors effet voulu.

### P3 — 005 et 006 : le tunnel des CTA (gratuit, M)

- Preuve : plus long trou sans temps fort = 14,7 s dans le 006 (65,8 → 80,5 s) et 10,6 s + 8,6 s dans le 005 (73,4 → 84,0 et 64,7 → 73,3). Énergie de l'acte CTA : 0,38 (005) et 0,46 (006), contre 1,05 dans le 003 qui y place 7 temps forts. Part calme : 59 % et 54 %.
- Images : `frames/006/film_09.jpg` et `film_10.jpg` (64–79,5 s) — le boîtier fermé, même taille, même place, pendant quinze secondes ; seuls les panneaux de la zone haute changent. `frames/005/film_09.jpg` et `film_10.jpg` : idem avec la bobine. C'est l'endroit du film où l'on demande le plus au spectateur et où l'image donne le moins.
- Correctifs, un geste du mécanisme par CTA (chaque phrase garde sa démonstration) :
  - 006 like (`main.js:390-391`) : à « il y a un témoin », le couvercle s'ouvre et les électrodes sortent (`explode` 0 → 0,5 en 0,6 s) ; refermé avant « En commentaire ».
  - 006 commentaire (`main.js:401`) : à « elle est où ? », coupe franche vers le hall, la boîte verte au mur (pose `BOXCLOSE`, déjà utilisée ligne 421), l'étiquette « LE 15 TE DIT OÙ » à côté d'elle ; retour à l'établi sur « Abonne-toi ».
  - 006 abonnement (`main.js:409`) : sur « une fusée sous le siège », un éclair localisé couleur signal sous le panneau (boule `softGlow`, deux images), le chiffre « 0,5 s » arrive en frappe.
  - 005 like (`main.js:322-323`) : les cliquets s'écartent puis pincent (le geste de l'acte 2) sur « gros bouton rouge ».
  - 005 commentaire (`main.js:333`) : à « il chauffe encore », l'orange du cœur revient une seconde dans la tige (ou coupe sur la cuve, cœur vert, braise orange au fond).
  - 005 abonnement (`main.js:339`) : à « accroché à un mur », la boîte verte du 006 apparaît en silhouette dans le panneau à la place de la barre blanche vide.
- Cible : au moins un temps fort par CTA, aucun trou > 6 s.

### P4 — 006 : une image parasite à 10,73 s (gratuit, S)

- Preuve : pic d'une image, MAD 8,3, 23 % des pixels. `img/006_reaim.jpg` : sur la deuxième vignette, les personnages et le chemin vert sont doublés (deux images superposées), puis l'image reprend.
- Cause probable : `episodes/006-defibrillateur/src/main.js:194` — la coupe technique `reaim(WHERE, 900)` à `t.tremble - 1.0` ne donne pas exactement la même image, et l'obturateur moyenne les deux poses. `qa` ne l'a pas comptée.
- Correctif : appeler `stage.cut(t)` à cet instant (obturateur fermé sur la bascule) et vérifier que `reaim` reproduit le `shift` et le `fov` ; sinon déplacer la bascule dans une image où la caméra est déjà en mouvement rapide. À vérifier avec `snap` sur trois images consécutives autour de 10,70 s.

### P5 — 006 : la première image est la plus sombre des cinq (gratuit, S/M)

- Preuve : première image Y 18,8, zone sujet éclairée 18 % (002 : 87 %, 004 : 57 %). `frames/006/hook_01.jpg` : le personnage occupe un cinquième de la hauteur, le sol rouge est un dégradé sombre, le hall est en traits fins.
- Le mouvement, lui, est bon (MAD 0–1 s 2,38, temps fort à 0,47 s) : ne pas y toucher.
- Correctif : resserrer POSE0 d'environ 20 % (le personnage vers 25–30 % de la hauteur), monter la flaque signal au sol (`ground`) et l'opacité du verre de la victime. La dernière image suit automatiquement (`main.js:423-424`).
- Cible : première image Y ≥ 28, zone sujet éclairée ≥ 35 %.

### P6 — 005 : huit secondes presque immobiles autour de la chute (gratuit, M)

- Preuve : calme 53,93 → 57,47 s (« un réacteur. On dépense… pour l'empêcher de s'arrêter ») puis 57,97 → 62,10 s (« Chicago 1942. Le dernier secours… »), séparés par une coupe. Trou sans temps fort 51,4 → 57,6 s.
- Images : `film_07.jpg` ligne 2 — la cuve posée à droite, « RIEN » à gauche, rien ne bouge sur quatre vignettes ; `film_08.jpg` — la pile de Chicago identique sur dix vignettes, la caméra ne part qu'à 62 s.
- Correctifs :
  - Sur « pour l'empêcher de s'arrêter » (`main.js:299`) : la couronne de bobines se rallume en vert et les barres remontent d'un cran — la phrase a sa démonstration ; la caméra monte vers la couronne au lieu de tourner de quelques degrés.
  - Chicago (`main.js:308`) : `d: 7000 → 6600` est un mouvement de 6 % ; partir de la corde et de la barre en gros plan et reculer (ou avancer franchement, `d` → 4800), la date arrive pendant le mouvement.

### P7 — kit : les lignes de sous-titres trop brèves (gratuit, S)

- Preuve : 8 à 15 lignes par film restent moins de 0,45 s (005 : 12, mini 0,24 s sur « premier » à 60,89 s ; 006 : 11, mini 0,32 s). Simulation d'un découpage rééquilibré (`analyse.mjs`, fonction `phrasesOf`) : 9 et 7 lignes restantes.
- Correctif dans `buildCaptions` (`kit/lib/overlay.js`, emplacement à repérer) : après le découpage, fusionner toute ligne de moins de 0,45 s avec sa voisine la plus courte de la même phrase tant que le total reste ≤ 4 mots et ≤ 20 caractères ; sinon prolonger la ligne jusqu'au début de la suivante.
- Cible : aucune ligne < 0,40 s, au plus 4 lignes < 0,45 s par film.

### P8 — pipeline : faire entrer ces mesures dans `npm run qa` (gratuit, M)

- `mesure.mjs` + `analyse.mjs` tournent en moins d'une minute sur un MP4. Les porter dans `scripts/` et afficher, avec seuils : énergie 0–1 s, premier temps fort, plages calmes ≥ 2,5 s avec la phrase dite, trous sans temps fort, luminance moyenne et de la première image, plages sombres, pics d'une image hors coupes (le 10,73 s du 006 aurait été vu).
- En avertissement, pas en échec : un calme voulu (un `hold`) reste possible, mais il est nommé.

### P9 — méthode : l'accroche s'allonge d'épisode en épisode (reprise voix pour le 006, sinon règle pour le 007)

- Preuve : fin du C à 6,4 s (003), 9,0 (002), 9,3 (004), 9,6 (005), 10,6 s (006) ; 23 → 33 mots. La règle du projet dit « avant la 10ᵉ seconde » : le 006 la dépasse.
- 006 : seul un texte plus court règle cela, donc une reprise de voix (à joindre à la reprise d'accroche déjà annoncée à 68 crédits, si Merwan la décide). Exemple, premiers mots conservés pour la boucle : « Quelqu'un s'effondre. Son cœur ne pompe plus. / Au mur, une boîte verte peut le sauver : c'est elle qui décide. Encore faut-il… savoir où elle est. » (≈ 26 mots).
- 007 et suivants : A ≤ 4 s, C terminé ≤ 9 s, 27 mots au plus.

### P10 — méthode : le dernier tiers tourne au quart de l'énergie

- Preuve : énergie après / avant la chute = 0,62 (002), 0,39, 0,34, 0,25 (005), 0,28 (006). La chute tombe à 61–65 % du film dans les cinq ; il reste 30 à 33 s, dont 18 à 21 s de CTA.
- Règle proposée : chute → fin ≤ 28 s, rapport d'énergie ≥ 0,45, et un fait nouveau à l'image dans la coda (le 006 le fait avec « elle refuse » : chute + coda à 0 % de calme, c'est le modèle).

### P11 — mesure : la première coupe recule, est-ce un problème ?

- Première coupe à 9,6 s (004), 16,0 (002), 19,9 (003), 22,4 (006), 23,5 s (005). Le plan-séquence du 006 reste vif (acte 1 : énergie 2,75, 6 % de calme) ; celui du 005 l'est moins (36 % de calme).
- Nos mesures ne tranchent pas. Demander à Merwan les courbes de rétention des 003 et 004 sur 0–25 s : le 004 coupe à 9,6 s, le 003 tient un seul plan.

### P12 — 005 : deux trous secondaires (gratuit, S)

- 32,1 → 38,9 s (6,7 s, « Tant que le courant passe… Zéro. Le courant tombe ») : `main.js:247-254`, un seul glissement lent. Ajouter sur « Zéro » la coupure nette de la lueur de la bobine (lumière localisée, deux images).
- Acte 3 : 43 % de calme, Y 20,9 — le plus mou des cinq (004 et 006 : 0 % et 6 %). `film_07.jpg` ligne 1 : la cuve immobile pendant « au fond. La réaction en chaîne est arrêtée ». Tenir le mouvement de `main.js:290` jusqu'à « arrêtée » (durée 1,6 s → ≈ 3 s).

## 2. Tableau comparatif (extrait ; complet dans `resultats.md`)

| | 002 | 003 | 004 | 005 | 006 |
| --- | --- | --- | --- | --- | --- |
| Durée (s) | 94,1 | 82,2 | 85,7 | 84,8 | 85,5 |
| Énergie image, médiane | 0,35 | 0,46 | 0,61 | 0,29 | 0,94 |
| Part du film calme | 40 % | 33 % | 26 % | 45 % | 16 % |
| Plages calmes ≥ 2,5 s (nombre / total) | 4 / 13,3 s | 3 / 10,8 s | 4 / 15,0 s | 5 / 18,6 s | 2 / 7,8 s |
| Coupes franches | 5 | 10 | 10 | 5 | 13 |
| Écart médian entre coupes (s) | 24,7 | 5,3 | 6,6 | 18,1 | 3,8 |
| Temps forts par 10 s | 2,6 | 3,7 | 3,2 | 2,9 | 4,2 |
| Plus long trou sans temps fort (s) | 11,4 | 7,1 | 10,2 | 10,6 | 14,7 |
| Luminance moyenne | 31,4 | 29,9 | 38,6 | 22,7 | 31,9 |
| Pixels presque noirs | 49 % | 53 % | 44 % | 70 % | 52 % |
| Zone sujet éclairée (Y ≥ 32) | 51 % | 48 % | 63 % | 30 % | 46 % |
| Part du film à luminance < 18 | 2 % | 25 % | 8 % | 40 % | 11 % |
| 1re image : luminance / sujet éclairé | 51,8 / 87 % | 20,5 / 35 % | 35,1 / 57 % | 21,3 / 30 % | 18,8 / 18 % |
| Énergie 0–1 s / 0–3 s | 0,34 / 0,38 | 0,29 / 0,93 | 1,75 / 1,90 | 0,09 / 0,11 | 2,38 / 1,96 |
| Fin du C (s) · mots de l'accroche | 9,0 · 25 | 6,4 · 23 | 9,3 · 27 | 9,6 · 28 | 10,6 · 33 |
| Actes 1 / 2 / 3 (% du film) | 29 / 19 / 16 | 24 / 20 / 17 | 29 / 15 / 20 | 28 / 15 / 18 | 28 / 15 / 22 |
| Chute (s · %) | 61,0 · 65 % | 50,7 · 62 % | 55,0 · 64 % | 51,4 · 61 % | 55,7 · 65 % |
| Chute → fin (s) | 33,1 | 31,5 | 30,7 | 33,4 | 29,8 |
| Énergie après / avant la chute | 0,62 | 0,39 | 0,34 | 0,25 | 0,28 |
| Mots / s (film · pendant la voix) | 2,65 · 3,06 | 2,81 · 3,40 | 2,71 · 3,16 | 2,71 · 3,22 | 2,68 · 3,19 |
| Sous-titres < 0,45 s | 10 | 8 | 15 | 12 | 11 |

## 3. Ce qui a progressé, ce qui a reculé

Progrès du 002 au 006 :
- Le 006 est le film le plus vivant : médiane d'énergie 0,94 (002 : 0,35), 16 % de calme (002 : 40 %), 4,2 temps forts par 10 s, 13 coupes dont 5 dans l'acte 3.
- L'ouverture bouge enfin : énergie 0–1 s de 0,34 (002) à 2,38 (006).
- L'acte 2 du 006 n'a plus aucun calme (002 : 43 %, 004 : 41 %) : une pièce par mot, ça se mesure.
- Chute et coda du 006 : 0 % de calme, Y 43,7, 76 % de la zone sujet éclairée — le meilleur passage de la série.
- Le débit de mots est stable (2,65 à 2,81 mots/s) : la densité de texte n'est pas le levier.

Reculs :
- Le 005 recule sur presque tout par rapport au 004 : médiane 0,29, 45 % de calme, luminance 22,7, accroche figée, 5 coupes seulement.
- La première image s'assombrit : zone sujet éclairée 87 % (002) → 18 % (006).
- L'accroche s'allonge : fin du C de 6,4 s (003) à 10,6 s (006).
- Le dernier tiers s'éteint : rapport d'énergie 0,62 → 0,28 ; le plus long trou de toute la série est dans le 006 (14,7 s, pendant les CTA).
- Sous-titres brefs : pas de progrès (8 à 15 lignes sous 0,45 s).

## 4. Trous de rythme, situés

005 :
| Instant | Durée | Phrase | À l'image |
| --- | --- | --- | --- |
| 0,0 → 4,5 | 4,5 s calme | « Panne de courant. Et c'est toi qui es aux commandes d'un réacteur nucléaire » | cuve immobile, seules les cartes s'allument (`hook_01.jpg`) |
| 32,1 → 38,9 | 6,7 s sans temps fort | « Tant que le courant passe… Zéro. Le courant tombe » | glissement lent sur l'électroaimant |
| 49,5 → 52,4 | sombre (Y 16) | « Deux secondes. Elles sont au fond… arrêtée » | cuve fixe, cœur vert (`film_07.jpg`) |
| 53,9 → 57,5 | 3,5 s calme | « On dépense… pour l'empêcher de s'arrêter » | cuve à droite, « RIEN » à gauche, immobile |
| 58,0 → 62,1 | 4,1 s calme, Y 14,7 | « Chicago 1942. Le dernier secours du tout premier réacteur ? » | pile en fil gris, plan fixe (`film_08.jpg`) |
| 64,7 → 73,3 | 8,6 s sans temps fort | like, début du commentaire | bobine sur l'établi, orbite lente (`film_09.jpg`) |
| 70,1 → 73,0 | 2,9 s calme | « il chauffe encore combien de temps ? » | idem |
| 73,4 → 84,0 | 10,6 s sans temps fort, 3,6 s calme | abonnement, « en attendant » | bobine plus petite, panneau « prochain dossier » (`film_10.jpg`) |

006 :
| Instant | Durée | Phrase | À l'image |
| --- | --- | --- | --- |
| 10,73 | 1 image | fin de « savoir où elle est » | image doublée (`img/006_reaim.jpg`) |
| 17,4 → 22,4 | 4,9 s sans temps fort | « −10 %… Les secours ? 15 min. Un témoin appelle le 15 et masse » | mouvement continu, sans accent |
| 32,5 → 36,9 | 4,4 s sans temps fort | « elle se teste toute seule. Voyant vert : prête » | établi |
| 65,8 → 80,5 | 14,7 s sans temps fort | les trois CTA | boîtier fermé sur l'établi (`film_09.jpg`, `film_10.jpg`) |
| 70,5 → 75,3 | 4,9 s calme | « elle est où ? Tu ne sais pas ? Le 15, lui, le sait. Abonne-toi » | idem, l'étiquette « LE 15 TE DIT OÙ » seule bouge |
| 77,2 → 80,2 | 3,0 s calme | « d'un avion en une demi-seconde. Avec une fusée sous le siège » | panneau fixe « 0,5 s » |

## 5. Seuils proposés pour le 007 et les suivants

| Mesure | Seuil | D'où il vient |
| --- | --- | --- |
| Énergie image 0–1 s | ≥ 1,5 | 004 (1,75) et 006 (2,38) le tiennent ; 002, 003, 005 sont sous 0,35 |
| Premier temps fort | avant 1,0 s, puis un par 2,5 s jusqu'à 10 s | 006 : 0,47 s et 5 avant 10 s ; 005 : 4,87 s et 2 |
| Première image | Y ≥ 28, zone sujet éclairée ≥ 35 % | 003 (35 %) est le plancher lisible ; 006 (18 %) est en dessous |
| Luminance moyenne du film | ≥ 28 | quatre films entre 29,9 et 38,6 ; le 005 à 22,7 est l'exception |
| Zone sujet éclairée, moyenne | ≥ 45 % | 002, 003, 004, 006 : 46 à 63 % |
| Plage sombre (Y < 18) | ≤ 3 s d'affilée, ≤ 10 % du film | 002 et 006 : aucune ; 005 : 22 s |
| Part du film calme | ≤ 25 % | 006 : 16 %, 004 : 26 % |
| Plage calme | ≤ 3 s, et seulement sur un `hold` voulu | les plus longues font 4,2 à 4,9 s, toutes hors `hold` |
| Trou sans temps fort | ≤ 6 s, CTA compris | 003 : 7,1 s au pire ; 006 : 14,7 s |
| Temps forts | ≥ 3,5 par 10 s | 003 : 3,7 ; 006 : 4,2 |
| Chaque CTA | ≥ 1 temps fort, ≥ 1 geste du mécanisme | 003 : 7 temps forts dans les CTA ; 005 et 006 : 2 |
| Énergie après / avant la chute | ≥ 0,45 | 002 : 0,62 ; 005 et 006 : 0,25 et 0,28 |
| Chute → fin | ≤ 28 s | 29,8 à 33,4 s aujourd'hui |
| Accroche | C terminé ≤ 9 s, ≤ 27 mots | 002 à 005 : 6,4 à 9,6 s |
| Sous-titres | aucune ligne < 0,40 s | mini mesuré 0,24 s |
| Pics d'une image hors coupes | chacun justifié par un évènement | 006 : 10,73 s ne l'est pas |

Ces seuils sont des garde-fous internes. Ils deviennent des règles quand les courbes de rétention des 003 et 004 auront dit si les trous mesurés ici correspondent à des départs.

## 6. À ne pas casser

- L'ouverture en mouvement du 006 (chute du personnage dès 0,2 s).
- L'acte 2 pièce par pièce des 005 et 006 (0 à 22 % de calme).
- L'acte 3 en coupes rapprochées du 006 (5 coupes, 12 temps forts en 18,6 s).
- La chute du 006 sur le cadre du choc devenu vert, puis « elle refuse ».
- Le débit de voix (≈ 3,2 mots/s pendant la voix) et les silences de 0,8 à 1,1 s après les phrases clés.
- La structure en actes, stable à deux points près d'un film à l'autre.

## 7. Non vérifié

- L'emplacement exact du découpage des lignes dans `kit/lib/overlay.js`.
- La cause précise de l'image doublée à 10,73 s (hypothèse : obturateur à cheval sur la bascule `reaim`).
- Les noms exacts des paramètres d'état proposés (`gPower`, `pool`, `ground`, `explode`) dans chaque `main.js` : repris des appels `cut()` lus, à confirmer à l'implémentation.
- L'effet des corrections de luminance sur le contrôle de contraste de `npm run check`.
