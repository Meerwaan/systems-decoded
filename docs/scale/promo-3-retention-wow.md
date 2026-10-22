# Promo · 3 · La rétention et l'effet « wow » des hors-séries (agent 3, 21/10)

Mission : qu'une promo de long se regarde jusqu'au bout comme une bande-annonce, frustre juste assez, et pousse vers le long. En cours de route, Merwan : « ils font des stats de merde sauf insta » — sur TikTok et Shorts, une promo est jugée comme n'importe quel court (complétion, satisfaction). Aucun chiffre de promo n'est encore dans `metrics/` : tout ce qui suit est mesuré sur les rendus. HS01 et HS02 ne sont ni modifiés, ni rendus à nouveau.

## Ce que Merwan tranche (oui / non)

1. **Le son des promos** — écouter `HS02-avant-0-25s.mp3` puis `HS02-apres-0-25s.mp3` (même voix, même niveau, −13,7 LUFS sur l'extrait). Oui : c'est la grille de la prochaine promo (HS03). Non : on garde l'ancien habillage.
2. **Le compteur qui bondit et la réponse coupée au noir** (planche `planche-HS02-avant-apres.jpg`) : à chaque fil, le chiffre grossit et brille, un « +1 » s'en échappe ; la coupure se ferme en deux volets jusqu'à une ligne, 0,6 s de noir avec « RÉPONSE · SUR YOUTUBE ». Oui / non.
3. **La forme de la prochaine promo** : un vrai morceau payé avant 25 s (une réponse secondaire du long, pas la grande), plus de phrase « notre nouveau grand format » entre 9 et 25 s, le noir limité à une respiration, l'appel au long en une phrase. Oui / non.

## 1. Le diagnostic

### Les chiffres (`npm run qa`, section « rythme », et la nouvelle section « promo »)

| | HS01 | HS02 | 015 (meilleur court) |
| --- | --- | --- | --- |
| Mouvement de la première demi-seconde | **0,4** | **0,2** | 9,8 (nos autres courts 1,3 à 3,7) |
| Plages lentes (≥ 2 s) avant 25 s | 8–11 s | **0–4 s**, 6,5–10,5 s, 22–24,5 s | aucune |
| Attaques qu'un téléphone joue, habillage seul, 0 → 25 s | **1** | **1** | 3 (010 : 18) |
| Sons posés sur un mot | 2 (riser sous « on l'ouvre », blip sous « chaîne ») | 2 (les mêmes) | — |
| Le film parle de lui-même | 11,7 s (18 %) | 8,9 s (15 %) | — |
| … dont dans la deuxième fuite (10–25 s) | « Jusqu'ici, on ouvrait… » **11,3–17,9 s** | « Notre nouveau grand format… » **11,1–15,6 s** | — |
| Fils ouverts (lus sur le compteur dans l'image) | 7 · un toutes les 6,3 s | 7 · un toutes les 6,1 s | — |
| Morceaux payés dans le film | 0 | 0 | — |
| Noir | 2,9 s, dont un bloc de 2,2 s à 51,6 s | 3,1 s (0,9 s à 47,1 puis 1,9 s à 49,4) | — |
| L'appel au long | à 54,3 s (84 %), dit en 5,1 s | à 51,5 s (85 %), dit en 4,3 s | — |
| Dernière image contre la première | 1,4 | **5,5** : la caméra n'est pas revenue, la boucle saute | 0 = parfaite |

Images lues : 10 (planches de 8 à 16 vignettes, extraites des rendus avec ffmpeg, dans le dossier temporaire).

### Où une promo cesse d'être un court qui tient seul

- **La première seconde.** Les deux promos ont la première demi-seconde la plus immobile jamais mesurée sur le compte (0,4 et 0,2). HS02 tient la même image du détecteur quatre secondes (0–4 s, mouvement sous 1) ; HS01 a une belle image (la tête dans la toile d'araignée), mais figée. Le son ne compense pas : un seul coup qu'un téléphone joue.
- **De 10 à 25 s, la promo parle d'elle.** C'est la fuite que montrent les courbes du 015 et du 012 (−16 et −21 points), et c'est là que les deux films placent leur phrase de lancement : 6,6 s (HS01) et 4,6 s (HS02) sur « notre grand format » au lieu de l'histoire. Juste avant, HS01 et HS02 ont chacun une plage immobile (8–11 s ; 6,5–10,5 s).
- **Rien n'est jamais payé.** Sept questions, aucune réponse : sur Instagram, des abonnés qui connaissent le compte cliquent sur le lien ; sur TikTok, un inconnu qui ne reçoit rien en une minute n'a aucune raison d'aller au bout, ni de partager. C'est la seule différence de fond avec nos courts, qui paient leur accroche.
- **Le compteur, signature des hors-séries, ne se voit pas.** « FILS OUVERTS 3 » : une étiquette de 20 px et un chiffre de 34 px dans l'en-tête, qui change en silence. Sur une vignette de 270 px de large, illisible ; on ne sent pas les questions s'empiler.
- **La fin demande de partir, sur du noir.** Le test coupé au noir (bien), puis « Alors… on l'ouvre » coupé au noir et « Pas ici » sur du noir : 2,6 à 2,2 s de noir dans les 15 dernières secondes. Puis 4 à 5 s d'appel à aller sur YouTube. Sur une plateforme où la complétion décide, c'est l'endroit exact où l'on perd ceux qui restaient.
- **Ce qui marche** : la frustration elle-même (sept fils, une image chacun, de la plus belle à la plus inquiétante), le gag « Pas ici » (la signature, demandée par Merwan), la boucle du texte. L'habillage de bande-annonce, lui, n'existe pas : un drone, quatre impacts, un riser, un blip pour une minute.

## 2. Les dispositifs (tous en option : sans eux, rien ne change à l'octet)

| Dispositif | Fichier | Une ligne |
| --- | --- | --- |
| **Le compteur qui bondit** : à chaque fil, le chiffre passe à N, grossit 2,6 fois, brille en signal, tient 0,14 s, revient ; un « +1 » s'échappe vers le haut | `kit/lib/direct.js` (`threads`), `kit/lib/overlay.js` (`threadPop`) | `D.threads()` (lit les repères `fil1`, `fil2`… du script) |
| **La réponse coupée au noir** : deux volets se ferment en 0,12 s jusqu'à une ligne, la ligne brille et meurt, 0,6 s de noir avec un tampon mono (« Réponse · sur YouTube ») ; au-dessus de l'image et de tout noir de la page, sous l'en-tête et les sous-titres | `direct.js` (`cliff`), `overlay.js` (`cliffCut`) | `D.cliff(D.breath("test$"), { stamp: "Réponse · sur YouTube" })` |
| **Le souffle d'un instant** : l'instant, déplacé au souffle qui suit s'il tombe sur un mot — l'image et le son tombent ensemble | `kit/lib/timing.js` (`breathAfter`, `T.breath`), copie dans `scripts/sfx.mjs` (le paquet est en CommonJS) | `D.breath("beat:mot")` |
| **Les fils qui sonnent** : un tic, un coup sourd, un ping qui monte d'un cran à chaque fil ; aucun ping dans le silence d'une coupure | `scripts/sfx.mjs` · `threads` | `{ "type": "threads" }` |
| **Le cuivre du rendez-vous** (« braam ») : accord de ré, dents de scie, filtre qui s'ouvre en 50 ms ; partiels jusqu'à 3 kHz pour le téléphone | `sfx.mjs` · `braam` | `{ "type": "braam", "at": "pasici$", "gain": -15, "dur": 2.2 }` |
| **La coupure qui tue le son** : l'habillage ralentit comme une bande qui s'arrête, se tait, revient ; un seul coup sonne dans le silence ; la voix n'est pas touchée | `sfx.mjs` · `cliff` | `{ "type": "cliff", "at": "test$", "dur": 0.6 }` |
| **La mesure d'une promo** : méta (et ce qui tombe dans 10–25 s), fils (repères `filN` ou lus sur le compteur dans l'image), morceaux payés (`"paye": true`), noir, appel au long, cinq dernières secondes (mouvement, attaques, écart de boucle) | `scripts/qa.mjs` · `rhythmPromo` | `npm run qa -- HSnn` (les séries `hors-serie` seulement) |

`braam`, `cliff` et `threads` se placent d'eux-mêmes dans un souffle ; `qa` les mesure là où ils tombent vraiment (les spans d'effets acceptent maintenant une liste, et le long reçoit le même traitement).

Pas faits, et pourquoi : rien sur les films publiés (règle) ; la rampe de l'image 1 (`glide` existe : elle se décide avec l'image 0, sur la planche des candidates) ; un « clip-path » sur la toile (le rendu d'essai ne le dessine pas : remplacé par des volets) ; un compteur plus gros (c'est `kit/brand.css`, agent 2 — voir § 4).

## 3. La preuve

**L'extrait** (dossier temporaire de l'agent 3, `…\scratchpad\promo3\extraits\`) : `HS02-avant-0-25s.mp3` (la piste du film publié) et `HS02-apres-0-25s.mp3` (la même voix, la grille ci-dessous, mixée comme le film : voix + habillage × 0,8, un gain pour le film entier à −14 LUFS, le même plafond). Contrôle de la méthode : l'ancien habillage remixé ainsi donne −13,67 LUFS sur l'extrait, exactement la piste publiée. Ce qui s'y entend, toujours dans un souffle : un coup et un souffle avant « Quatre cent mille volts » ; la ligne qui grésille (100 Hz et ses harmoniques) ; le clac du disjoncteur après « coupée… » ; le cuivre après « …te tuer » ; un coup après « …tue » ; le premier fil après « Le bon, » ; l'air quand la caméra arrive sur le poste ; le deuxième fil ; l'arc qui tient sous la chambre de coupure. Plus loin dans le film : les fils 3 à 6, un cran plus haut à chaque fois ; le court-circuit qui coupe tout (la bande qui s'arrête, le silence, un coup) ; la même coupure sur « Pas ici » ; le cuivre avant « Le film entier… ». Grille complète : `grid-hs02.json`.

| 0 → 25 s | Avant | Après |
| --- | --- | --- |
| Attaques qu'un téléphone joue (habillage seul) | 1 | **7** |
| Sons posés sur un mot (film entier) | 2 | **0** |
| Loudness de l'extrait | −13,67 LUFS | −13,65 LUFS |

**La planche** : `…\scratchpad\promo3\planche-HS02-avant-apres.jpg` — `look` sur une copie de HS02 hors du dépôt (la même copie, sans puis avec deux lignes dans son `main.js` : `D.threads([…])` et `D.cliff(D.at("noir"), { stamp: "Réponse · sur YouTube" })`) : le « 3 » qui bondit (26,45–26,62 s), les volets qui se ferment (47,07 s), la ligne (47,12 s), le tampon dans le noir (47,3–47,6 s) avec le « 7 » qui bondit ; 48,2 s et la première image inchangées.

**Rien ne change pour ce qui existe** :
- Les habillages de **025, L02, HS01 et HS02** rendus avec le nouveau `sfx.mjs` sont **identiques à l'octet** à ceux sur le disque (empreintes 41d9359f…, 26fb9df3…, 8a979f15…, d3af9b9d… ; rendus dans le dossier temporaire, jamais dans `episodes/`).
- `look --cpu` sur **025, L02 et HS01** (cinq instants chacun, de l'image 0 à la fin), avant puis après les changements de `direct.js`, `overlay.js` et `timing.js` : planches **identiques à l'octet** (1ab28b25…, 75537137…, ef543afc…). Entre les deux passes, l'agent 2 a modifié `kit/brand.css` et `kit/lib/blocks.js` : ces instants n'en ont pas bougé non plus.
- Aucun fichier d'`episodes/` ni de `renders/` n'a été écrit par moi ; les `look` et `qa` reconstruisent `gen/` et l'habillage de l'épisode, à l'identique — seule l'empreinte de `episodes/HS01-pare-brise/audio/bed.json` change (le code de `sfx.mjs` a changé ; `bed.wav` est le même à l'octet). Les essais d'image se sont faits sur une copie de HS02 dans le dossier temporaire, reliée au L02 par une jonction retirée ensuite.

## 4. À changer ailleurs (pas mes fichiers)

- **`kit/brand.css` (agent 2)** : les styles de `.thread-ghost` et `.cliff` (aujourd'hui en ligne dans `overlay.js`) ; et pour les hors-séries, **un compteur qui se lit** : `.hud__count b` de 34 à 44 px, l'étiquette de 20 à 24 px — c'est la signature des promos, illisible sur une vignette de 270 px.
- **`kit/lib/blocks.js` (agent 2)** : rien d'obligatoire ; `filmCall` pourrait écrire « 7 réponses » à partir du compteur.
- **Le `main.js` d'une promo** (modèle hors-série, agent `promo`) : l'en-tête écrit « 7 réponses · sur YouTube » au lieu de « Réponses · Sur YouTube » (le nombre reste : les fils deviennent des réponses qui attendent) ; les actes appellent `D.threads()` au lieu de `now(t.x, { fils: n })`, et `D.cliff(…)` au lieu de leur propre `#black`.
- **`.claude/agents/promo.md` et `docs/recette-promo.md` (orchestrateur, agent 1)** : renvoyer à `docs/recette-promo-retention.md` ; dans le script, les repères `fil1`… , `"paye": true` sur le beat qui paie, un souffle d'au moins 0,25 s après chaque question de fil (la voix turbo de HS02 n'en laissait que 0,06 à 0,15 s), la phrase de lancement hors de 9–25 s, l'appel en une phrase.
- **La boucle** : HS02 finit à 5,5 d'écart de sa première image ; la prochaine promo vise ≤ 2 (`qa` le mesure maintenant).

## 5. Limites, et ce que les courbes trancheront

- **Je mesure, je n'entends pas** : la grille sonore n'a pas été validée à l'oreille ; c'est l'écoute de Merwan, sur un téléphone, qui tranche. Le niveau du `braam` et du grésillement est le premier réglage à revoir.
- Les seuils de la recette viennent des courbes de deux courts (015, 012) et de la mesure de deux promos, pas d'une courbe de promo. Dès que les captures arrivent (TikTok, Shorts, Instagram pour HS01 et HS02) : la tenue à 3 s contre le mouvement de 0,2 et 0,4 ; la pente de 10 à 25 s sur la phrase de lancement ; la courbe au « Pas ici » et à l'appel ; la part qui finit, à comparer à nos courts du même jour.
- Le morceau payé est une hypothèse de structure (la réponse de la question posée par Merwan) : elle se juge sur HS03, avec sa courbe à l'instant du paiement.
- Appris en chemin : (1) une coupure faite d'un `clip-path` sur la toile ne se voit pas dans `look`, et des volets en `transform: scaleY(0)` animés par GSAP non plus — des volets animés **en hauteur** se dessinent ; (2) la voix turbo enchaîne ses phrases à 0,06–0,15 s : un son « dans le souffle » doit pouvoir se contenter de 80 ms (`breathAfter` essaie 0,08, puis 0,04, puis 0,03 s, sans jamais aller chercher plus loin que 0,8 s), et c'est le script qui doit laisser respirer chaque fil ; (3) le compteur de l'en-tête se lit dans l'image (pixels rouges du chiffre qui changent) : `qa` retrouve les sept fils de HS01 et HS02 à la seconde près, sans rien déclarer.

## Texte proposé pour CLAUDE.md

> **La rétention des promos (21/10, après « ils font des stats de merde sauf insta »).** Sur TikTok et Shorts, une promo est jugée comme un court : HS01 et HS02 ont la première demi-seconde la plus immobile du compte (0,4 et 0,2 ; 015 : 9,8), parlent d'eux-mêmes en pleine deuxième fuite (« notre grand format », 11–18 s), ne paient rien, ouvrent sept fils en silence (un chiffre de 34 px), finissent sur 2 à 3 s de noir et un départ vers YouTube ; HS02 boucle mal (écart 5,5). La grille d'une promo et ses dispositifs : `docs/recette-promo-retention.md` — un morceau du long payé avant 25 s (la grande réponse reste au long), rien de « méta » entre 9 et 25 s, des fils qui se voient et s'entendent (`D.threads()` sur les repères `fil1`… ; son `threads`), la réponse coupée au noir une respiration (`D.cliff` + son `cliff`, tampon « Réponse · sur YouTube »), le cuivre du rendez-vous (`braam`), l'appel en une phrase, la boucle exacte. `npm run qa -- HSnn` a une section « promo ». Tout est en option : 025, L02, HS01 et HS02 rendent à l'identique. Extrait avant / après et planche : `docs/scale/promo-3-retention-wow.md`.
