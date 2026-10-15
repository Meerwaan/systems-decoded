# L01 · `c7-fin.js` — journal

Chapitre 12 (468,13 → 531,17 s) : récapitulatif, chute, ce qui est dû, commentaire, like, rendez-vous, boucle. 26 images lues (planches de 8, 8, 8, 2), dans le dossier temporaire. `check` passe (lint 0, contraste 31/31, aucun avertissement `[direct]`).

## Ce qui est monté

- **« Résumons »** : fouet sur les tas du mélange sous la carte, puis sept coupes quelques images avant chaque phrase, chacune en mouvement, `step` et `temp` à chaque coupe : four entier (1 500) · ruban sur l'étain en travelling (1 100 → 600) · tunnel de l'étenderie (600 → 20) · selle orange, `bend` 0 → 1 (600) · salle blanche, le film glisse (20) · autoclave fermé, `press` monte (140) · la tête de 10 kg tombe sur le pare-brise, la toile naît (`web`, `rings`).
- **Chute** (`toverdict`) : l'établi, le pare-brise cassé debout (`web`, `rings`, `stick` 1, `mood` 0), orbite lente, sujet à droite ; `retitle` sans `#title-shade` (en 16:9 il voilerait le haut de l'image) : TON PARE-BRISE / FAIT POUR TENIR barré sur « tenir » → FAIT POUR CASSER sur « casser » ; `D.verdict`.
- **Ce qui est dû** : depuis la place passager, ta main monte avec le brise-vitre, frappe sur « brise-vitre », la trempée part en grains ; « feuilletées » : la même vitre feuilletée vue de dehors. « 1 sur 3 » : la voiture entière à droite, le fait à gauche. « Six brise-vitres » : trois coupes, trois frappes, la toile grandit, la vitre tient, « 0 SUR 6 ». Trempée : le brise-vitre rebondit deux fois, « 2 SUR 6 ».
- **Le marquage** : plongée (par rapport) sur le tampon « I » de la vitre conducteur, glissement, puis coupe sur le tampon « II » du pare-brise, sur l'établi (`VIEW.stamp`, `litStamp`). **Commentaire** (`tocta`) : le tampon de ta vitre conducteur de près, l'étiquette TA VITRE CONDUCTEUR ? · I OU II à gauche.
- **Like** (moitié droite libre) : la voiture de profil à gauche, recul ; puis toi à la fenêtre, le brise-vitre levé, et la carrosserie qui s'éteint (`shell` 0,3) pour vider la droite.
- **Rendez-vous** : la ligne de nuit de loin, en fuite à gauche, les fours qui luisent, travelling ; en-tête « Hors chaîne ».
- **Boucle** (`toloop`) : la voiture intacte (`FIRST` sauf `crash`, `lunge`, `web`, `rings` à 0), vue comme POSE0 de plus loin, avancée par rapport jusqu'à POSE0 ; sur « jour » : le choc, la tête, la toile, la couronne, dans cet ordre. Tout est revenu à `FIRST` à `tEnd − 0,1` : la glissade de `D.loop` n'a plus rien à faire (elle aurait écrasé l'ordre). Première et dernière image tirées côte à côte : identiques.

## Choix à connaître

- `run(D, from, toloop)` et non jusqu'à `to` : le tapis tourne jusqu'au rendez-vous ; la coupe de la boucle remet `flow` et `drive` à 0 (ligne cachée).
- **Une seule chose écrite à la fois** : mon fichier enveloppe `D.commit` pour ajouter deux fenêtres `long.quiet` (pendant « 1 sur 3 », et de « Je suis curieux » à la fin du commentaire) : FEUILLETÉES sort à 494,3 s, COMMENTAIRE à 512,1 s, puis le fait et l'étiquette entrent. À remonter dans `main.js` si on préfère (voir « À changer ailleurs »).
- La toile sur la vitre de côté n'existe que si `sideFilm` > 0,5 : sur la trempée, `web` reste à 0 (sinon elle part sur le pare-brise).

## Un cran en dessous

- 488,6 : la main qui monte se lit tard (elle n'entre qu'à `tool` ≈ 0,3) ; 490,2 : la trempée qui éclate est d'abord un rectangle blanc qui bave avant que les grains tombent.
- 508,4 (glissement vers le tampon du pare-brise dans la voiture) : la caméra finissait dans le volant — remplacé par la coupe sur l'établi, **pas revue à l'image** ; le recul du like (516,6), `shell` 0,3 (520,5) et le four entier (470,6) non plus.
- 512,8 : le tampon se lit, mais derrière lui l'habitacle de verre est chargé.
- 528,8 : en approche de POSE0, la carrosserie remplit la moitié droite (c'est la composition de la première image, en plus large).
- « quelle vitre viser » : la vitre trempée ne s'allume pas (aucun nombre pour ça) ; la caméra s'en approche seulement.

## À changer ailleurs

- `world.js` (facultatif) : un nombre `sideLit: 0` (0–1) dans `FIRST` et `REST`, passé à `verre.js` comme `litGlass` pour la vitre de côté — « quelle vitre viser » l'allumerait en encre.
- `main.js` (si on retire l'enveloppe de `D.commit` de `c7-fin.js`) : `D.commit({ long: { chapters: CARD, keywords: { skip: KEYWORDS_SKIP }, quiet: QUIET } })` avec `export const QUIET = []` dans `world.js`, que chaque chapitre remplit.

## Reprise après `qa` (image parasite à 472,73 s) — 4 images lues

- Cause : sur « Refroidi lentement », la caméra (`lehrIn` visé à x 3 000, reculée de 320 cm) était encore SOUS LA HOTTE du bain d'étain (x < 2 700) ; elle en sortait à 472,73 s et le voile de la hotte disparaissait d'une image à l'autre (une dalle grise sur les rouleaux, puis les rouleaux).
- Correction : le plan reste dans l'étenderie de bout en bout — visée x 3 150 → 3 550, az −72 fixe (caméra x ≈ 2 850 → 3 250). Revu à 472,6 : les rouleaux, sans voile. Pas de nouveau rendu.
- Le mouvement heurté à 465,0 s est avant mon morceau (c6, qui finit à 468,13 s).
