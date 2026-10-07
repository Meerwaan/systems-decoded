# Veille rétention — ce qui fait grandir un compte TikTok éducatif, confronté à Système Décodé

Audit du 2026-10-07. Lecture seule sur le dépôt. Dimension : « veille-retention ».
Dossier de travail : `scratchpad/audit/veille-retention/` (images extraites, mesures `ydif_*.txt`, script `activity.mjs`).

Limites à connaître avant de lire :

- Aucun chiffre TikTok du compte n'existe encore (001 à 004 en ligne depuis 1 à 2 jours, courbes non relevées). Tout ce qui suit est donc : des faits documentés sur la plateforme + des mesures faites sur les MP4 + des inférences. Les inférences sont signalées.
- Les pages officielles de TikTok sur les règles (« Community Guidelines », centre d'aide) ne se lisent pas avec l'outil de récupération (rendu JavaScript). Leur formulation est citée via des reprises ; à relire dans l'app avant de s'appuyer dessus mot pour mot.
- Le quota de recherche web a été atteint en fin de veille : deux vérifications sont restées en plan (annonce officielle de « Creator Search Insights », détail de l'indexation de la voix par la recherche TikTok). Elles sont notées « confiance 3 ».

---

## 1. Ce qui est documenté, et ce qui est du folklore

### 1.1 Les signaux — documenté

| Fait | Source | Solidité |
| --- | --- | --- |
| Le fil « Pour toi » classe selon les interactions (likes, partages, comptes suivis, commentaires), les informations de la vidéo (légende, son, hashtags) et les réglages de l'appareil. « Whether a user finishes watching a longer video from beginning to end » est cité comme signal **fort** ; le pays commun, comme signal faible. Le nombre d'abonnés et les succès passés ne sont pas des facteurs directs. | TikTok, 18 juin 2020 — https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you | Officiel, ancien mais jamais démenti |
| Document interne « TikTok Algo 101 », authentifié par TikTok : objectif = utilisateurs actifs, optimisé par deux mesures, « retention » (l'utilisateur revient) et « time spent ». Formule simplifiée : `Plike×Vlike + Pcomment×Vcomment + Eplaytime×Vplaytime + Pplay×Vplay`. Le système est ajusté pour **repérer et étouffer le « like bait »** — « videos designed to game the algorithm by explicitly asking people to like them ». | New York Times, 5 déc. 2021, copie syndiquée — https://www.boston.com/news/commentary/2021/12/06/how-tiktok-reads-your-mind ; résumé — https://www.deeplearning.ai/the-batch/what-makes-tiktok-tick | Document interne confirmé, 2021 |
| Expérience du Wall Street Journal avec des comptes robots : c'est le temps passé sur une vidéo (et le fait de la revoir), pas les likes ni les partages, qui suffit à TikTok pour cerner un utilisateur. | WSJ, juillet 2021 — https://www.infodocket.com/2021/07/22/wall-st-journal-video-investigation-how-tiktoks-algorithm-figures-out-your-deepest-desires/ ; https://daringfireball.net/linked/2021/07/27/wsj-tiktok | Enquête, 2021 |
| Programme de récompenses : vidéos **de plus d'une minute** ; formule sur quatre critères — originalité, durée de lecture, **valeur de recherche**, engagement. « The TikTok community now spends 50% of their time on TikTok watching videos longer than one minute. » Entrée : 10 000 abonnés, 100 000 vues sur 30 jours. | TikTok, 18 mars 2024 — https://newsroom.tiktok.com/introducing-the-new-creator-rewards-program?lang=en | Officiel |
| Règles d'éligibilité au fil « Pour toi » : le contenu qui « piège » l'engagement (promesses « like-for-like », fausses incitations) n'est pas recommandé ; depuis septembre 2025 la liste n'est plus centralisée, les résultats de recherche sont personnalisés, les commentaires triés selon réponses, likes et signalements. | https://www.tiktok.com/community-guidelines/en/fyf-standards (non lisible par l'outil) ; reprise — https://techcrunch.com/2025/08/15/tiktoks-new-guidelines-add-subtle-changes-for-live-creators-ai-content-and-more/ | Officiel, formulation à relire |
| Publicité (les seules consignes créatives chiffrées de TikTok) : « Prioritize your hook in the first 6 seconds », proposition dans les 3 premières secondes, texte à l'écran pour donner le contexte, son obligatoire, zones sûres. | https://ads.tiktok.com/help/article/creative-best-practices?lang=en | Officiel, côté pub |
| 88 % des utilisateurs disent que le son est essentiel à l'expérience TikTok. | Kantar pour TikTok — https://www.socialmediatoday.com/news/tiktok-shares-new-insights-into-the-importance-of-sound-for-marketing-promo/601569 | Étude commandée par TikTok |
| Les systèmes de recommandation de vidéo courte **normalisent** le temps de visionnage par la durée (quantiles par tranche de durée : D2Q, Kuaishou 2022 ; « watch time gain », WeChat 2022). Une vidéo longue n'est pas favorisée parce qu'elle est longue : elle est comparée aux vidéos de même longueur. | https://mlfrontiers.substack.com/p/how-long-is-long-duration-bias-in | Littérature de recherche (plateformes sœurs, pas TikTok nommément) |

### 1.2 Les repères chiffrés — études de plateformes d'outils

| Repère | Source | Remarque |
| --- | --- | --- |
| 1,1 million de vidéos : portée médiane 432 pour les vidéos de plus de 60 s contre 302 pour les 30–60 s (+43 %) ; **temps de visionnage médian 11,3 s** pour les plus de 60 s, 6,9 s pour les 10–30 s. Seules 12 % des vidéos dépassent la minute. | Buffer, 17 mars 2025 — https://buffer.com/resources/longer-tiktoks-get-more-views-data/ | Corrélation ; comptes clients de Buffer, surtout petits |
| 6 millions de vidéos, 600 000 comptes : durée moyenne d'une vidéo 41 s, **durée moyenne de visionnage 3,75 s en 2025** (4,7 s en 2024), 4 % des vidéos regardées en entier. | Metricool 2025, repris par https://gensdinternet.fr/?p=40404 (étude : https://metricool.com/fr/etude-reseaux-sociaux-2025/) | Lu via la reprise, pas dans le rapport d'origine |
| Marques (S1 2024, n = 1 150 comptes TikTok) : taux de complétion 25–30 %. | Dash Hudson via https://www.netinfluencer.com/tiktok-instagram-reels-neck-and-neck-in-reach-report/ | Vidéos de marques, surtout courtes |
| 11,4 millions de publications, 150 000 comptes, régression à effets fixes : 2–5 publications par semaine = +17 % de vues par publication par rapport à 1 ; 6–10 = +29 % ; 11+ = +34 %. La **médiane ne bouge pas** (489 → 506 → 487 → 459) : publier plus achète surtout des chances de sortir un gros coup. | Buffer, 8 oct. 2025 — https://buffer.com/resources/how-often-should-you-post-on-tiktok/ | Solide sur la méthode |
| 6 millions de publications, 72 000 comptes (janv.–août 2025) : l'essentiel des vues arrive dans les 1 à 5 premiers jours ; fenêtre d'ajustement = 72 h. | Socialinsider — https://www.socialinsider.io/blog/tiktok-virality-insights/ | Descriptif |
| 7,1 millions de publications : soirées (18–23 h) plus fortes, après-midi plus faibles ; meilleur créneau dimanche 9 h. Sprout Social conclut l'inverse sur le week-end. | Buffer — https://buffer.com/resources/best-time-to-post-on-tiktok/ | Effet faible, études contradictoires |
| ≈ 700 000 publications (janv.–mai 2025) : les carrousels photo font +3 % de portée, +81 % d'interactions, mais un tiers de partages **en moins** que les vidéos. | Fanpage Karma — https://www.fanpagekarma.com/insights/carousel-vs-video-performance-tiktok-instagram/ | Tous secteurs confondus |
| YouTube Shorts (5 400 Shorts, 33 chaînes, 3,3 milliards de vues) : les meilleurs sont entre 70 et 90 % de « vu plutôt que balayé » ; sous 60 %, mauvaise performance. | Paddy Galloway — https://www.digitalinformationworld.com/2023/04/paddy-galloway-decoded-youtube-shorts.html | Autre plateforme ; le seul repère public sérieux sur la tenue des premières secondes |
| Un quart des utilisateurs lance une recherche dans les 30 s après l'ouverture de l'app (TikTok) ; 41 % des Américains ont utilisé TikTok comme moteur de recherche en 2024, 49 % en 2026, 64 % de la génération Z. Pas de chiffre propre à la France. | https://www.adweek.com/media/tiktok-ai-powered-tools-woo-marketers-potential-ban/ ; https://siecledigital.fr/2026/03/03/tiktok-simpose-comme-moteur-de-recherche-aux-etats-unis/ ; https://metricool.com/fr/recherches-tiktok/ | Déclaratif |
| Vision : c'est le **démarrage** d'un mouvement qui capte l'attention, pas le mouvement en soi. | Abrams & Christ, Psychological Science, 2003 — https://pubmed.ncbi.nlm.nih.gov/12930472/ | Science expérimentale, hors TikTok |

### 1.3 Le folklore — à ne pas prendre pour règle

- « 65–70 % de tenue à 3 s = 4 à 7 fois plus d'impressions », « 70 % de visionnage moyen = +300 % de distribution », « une rupture toutes les 4 s = 58 % de rétention contre 41 % » : chiffres de blogs d'outils (par exemple https://www.opus.pro/blog/tiktok-length-format-retention-data) dont la seule méthode déclarée est « j'ai analysé 500 vidéos ». Aucun jeu de données, aucune période.
- Les tableaux « complétion par durée » (38 % à 60 s, 27 % à 90 s) : même origine, non sourcés.
- Le « barème à points » (like = 1, commentaire = 2, partage = 3, revisionnage = 5) : aucune source. Le seul document interne publié donne une formule à poids non divulgués.
- « Les commentaires ouverts comptent double », « répondre dans la première heure relance la vidéo », « publier trois fois par jour est pénalisé », « supprimer et republier remet les compteurs à zéro » : rien de publié par TikTok ni de mesuré sérieusement. Plausible ou non, ce n'est pas démontré.
- L'heure « magique » : deux études de millions de publications se contredisent sur le week-end.

---

## 2. Ce que j'ai mesuré sur les films

Méthode : différence moyenne de luminance entre deux images consécutives (`signalstats`, YDIF), film ramené à 135×240, 10 images/s, zone du sujet et de la zone haute seulement (y = 440 à 1160 px de l'image d'origine : les sous-titres et l'en-tête sont exclus). Agrégé par seconde. Reproduire :

```
ffmpeg -i renders/<film>.mp4 -an -vf "fps=10,scale=135:240,crop=135:90:0:55,signalstats,metadata=print:key=lavfi.signalstats.YDIF:file=ydif.txt" -f null -
node activity.mjs
```

| Film | 0–1 s | 1–2 s | 2–3 s | Moyenne du corps (10 s → 1er CTA) | Bloc CTA → fin | Rapport CTA / corps | Durée du bloc CTA | Part du film |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 002 Airbag | 0,66 | 1,29 | 1,14 | 3,14 | 2,94 | **0,94** | 19,8 s | 21 % |
| 003 Ascenseur | 1,01 | 1,89 | 5,88 | 4,25 | 3,11 | 0,73 | 17,8 s | 22 % |
| 004 Différentiel | 5,80 | 7,17 | 7,37 | 5,24 | 2,74 | 0,52 | 21,4 s | 25 % |
| **005 Arrêt d'urgence** | **0,28** | **0,41** | **0,47** | 5,18 | 1,40 | **0,27** | 18,7 s | 22 % |
| **006 Défibrillateur** | 8,14 | 7,07 | 6,36 | 6,80 | 1,95 | **0,29** | 19,7 s | 23 % |

Trois lectures :

1. **L'ouverture du 005 est l'image la plus immobile de tout le film** (0,3 à 0,5 pendant 4 s ; la médiane du film est 2,1). Le 006 ouvre à 8,1.
2. **Le bloc d'appels à l'action s'immobilise d'épisode en épisode** : 0,94 du mouvement du film sur le 002, 0,27 sur le 005. Le 002 reste le modèle, le 005 et le 006 sont les plus figés.
3. Le bloc CTA pèse 21 à 25 % de chaque film, toujours après la chute.

Le minutage vient de `scratchpad/timing/script_00X.txt` ; les planches regardées sont citées à chaque constat.

---

## 3. Constats et propositions

### VR-01 · 005 — les trois premières secondes sont une image fixe, et « Panne de courant » ne se voit pas

**Preuve.**
- `frames/005/hook_01.jpg` et `hook_02.jpg` (0 → 3,3 s) : vingt vignettes identiques, seuls les mots de la carte s'allument. `audit/veille-retention/005_open_strip.png` (0,0 / 0,5 / 1,5 / 3,0 s en pleine largeur) : la cuve, la couronne verte et le trait pointillé ne bougent pas.
- YDIF 0,28 / 0,41 / 0,47 / 0,4 sur les quatre premières secondes (tableau ci-dessus).
- `episodes/005-arret-urgence/src/main.js:157` : `shot(0, t.promesse - 0.35, { az: 23 }, "sine.inOut")` — 7° d'azimut en 4,4 s, à 50 m de distance (`POSE0.d = 5050`, ligne 66). La couronne ne perd son courant qu'à `t.panne` = 9,24 s (ligne 177).
- La règle du projet « chaque phrase a sa démonstration » n'est pas tenue pour la toute première phrase du film : on dit « Panne de courant », rien ne s'éteint.

**Pourquoi ça compte.** La durée moyenne de visionnage mesurée sur 6 millions de vidéos est de 3,75 s (Metricool 2025) : la majorité des spectateurs a tranché avant que le 005 ait bougé. TikTok demande l'accroche « dans les 6 premières secondes », la proposition dans les 3 premières (consignes pub). Et c'est le démarrage d'un mouvement qui capte l'œil (Abrams & Christ 2003) : une image fixe, aussi belle soit-elle, se balaye comme une photo. Sur le compte, le 002 (0,66) et le 003 (1,01) ouvrent presque aussi immobiles : quand les courbes arriveront, comparer leur tenue à 3 s à celle du 004 (5,80) dira ce que ça coûte.

**Proposition (gratuite, image et son).** Dans `episodes/005-arret-urgence/src/main.js`, section 01 :

```js
// A — « Panne de courant. » : la couronne perd son courant UNE fois, sur le mot (pas un clignotement)
st(0.30, 0.10, { power: 0.15, feed: 0.2 }, "power2.in");
st(0.90, 0.55, { power: 1, feed: 1 }, "sine.out");        // revenu avant « Et c'est toi »
// la caméra part dès l'image 1 : un vrai travelling autour de la cuve, pas 7° en 4 s
shot(0, t.promesse - 0.35, { az: 10, el: 24, ty: 230 }, "sine.inOut");   // au lieu de { az: 23 }
```

- `power` existe déjà (`reactor.update({ power: S.power … })`, ligne 396) et sert à 9,24 s : les deux tweens ne se chevauchent pas. `FIRST.power = 1` : la dernière image reste identique à la première.
- Une seule chute tenue 0,5 s : conforme à « une lueur qui clignote plusieurs fois par seconde se lit comme un défaut ».
- Le « et si » de l'accroche prépare le C (« ce qui l'arrête… c'est la panne ») au lieu de le déflorer : on a vu les bobines faiblir, on apprend six secondes plus tard que c'est ça qui sauve.
- Son : `episode.json → sfx`, ajouter `{ "type": "impact", "at": "accroche:Panne+0.02", "gain": -15, "size": 0.9 }` (le même objet que celui posé sur `outage`), pour que la chute de lumière ait son bruit.
- Cible vérifiable : YDIF moyen de 0 à 3 s ≥ 2 (la médiane du film) — voir VR-07. Régler la pose avec `look` (quatre azimuts d'arrivée d'un coup).

Effort : S. Confiance : 4 (le fait mesuré est sûr ; l'ampleur du gain ne se connaîtra qu'avec la courbe).

---

### VR-02 · Mesure — rien n'est mesuré : le protocole, les cibles, les règles de décision

**Preuve.** CLAUDE.md, « Dossiers » : 001 à 004 « chiffres à demander ». Les quatre vidéos en ligne forment déjà une expérience gratuite :

| | Ouverture (YDIF 0–1 s) | Voix de l'accroche | Premier mot du bloc CTA |
| --- | --- | --- | --- |
| 002 | fixe (0,66) | — | une information (« Mais seulement si tu es bien assis ») |
| 003 | fixe (1,01) | **criée** | « Like » |
| 004 | en mouvement (5,80) | posée | « Like » |

**À demander à Merwan, pour chacune des quatre vidéos (TikTok Studio → la vidéo → Analyses ; les libellés peuvent varier) :**

1. Une capture de la **courbe de rétention** entière.
2. Vues, durée moyenne de visionnage, % « a regardé la vidéo en entier », temps de lecture total.
3. Likes, commentaires, partages, enregistrements, **nouveaux abonnés** venus de la vidéo.
4. Sources de trafic (% Pour toi, % Recherche, % Profil, % Abonnements) et, si l'app les montre, les requêtes de recherche.
5. Pour le 003 et le 005 : le commentaire a-t-il bien été épinglé ?

**Ce qu'on lit sur la courbe (instants tirés de `script_00X.txt`) :**

| Point | 003 | 004 | 005 | 006 |
| --- | --- | --- | --- | --- |
| Tenue à 3 s | 3,0 | 3,0 | 3,0 | 3,0 |
| Fin de l'accroche ABC | 6,4 | 9,3 | 9,6 | 10,6 |
| « Alors… on l'ouvre » | 20,0 | 25,1 | 23,7 | 24,2 |
| Fin de la chute | 57,1 | 58,4 | 57,0 | 61,0 |
| Premier mot du bloc CTA | 64,4 | 64,3 | 66,1 | 65,8 |
| Dernière seconde | 82 | 85 | 84 | 85 |

**Cibles de travail** (à recaler dès les premiers chiffres ; aucune n'est un seuil publié par TikTok) :

| Mesure | Alerte | Plancher visé | « Meilleur de la niche » | D'où vient le repère |
| --- | --- | --- | --- | --- |
| Tenue à 3 s | < 60 % | ≥ 70 % | ≥ 80 % | Shorts : 70–90 % pour les meilleurs (Galloway) |
| Durée moyenne (film de 85 s) | < 12 s | ≥ 25 s | ≥ 35 s | médiane Buffer des > 60 s : 11,3 s |
| Vu en entier | < 8 % | ≥ 12 % | ≥ 20 % | 4 % toutes vidéos (Metricool) ; 25–30 % marques, formats courts (Dash Hudson) |
| Perte entre fin de chute et 1er CTA + 3 s | > 30 % des présents | ≤ 20 % | ≤ 10 % | hypothèse de cet audit (VR-03, VR-04) |
| Abonnés, partages, enregistrements pour 1 000 vues | — | comparer les dossiers entre eux | — | pas de repère public fiable |
| Part « Recherche » du trafic | — | la suivre dossier par dossier | — | « search value » du programme de récompenses |

**Règles de décision.**
- Tenue à 3 s sous 60 % : on ne touche à rien d'autre avant d'avoir refait la première seconde (image et premier mot).
- 004 nettement au-dessus de 002/003 à 3 s : la règle « ça bouge dès la première demi-seconde » entre dans CLAUDE.md.
- La courbe casse au premier mot du bloc CTA : appliquer VR-04 sans attendre.
- Une bosse au-dessus de 100 % sur les quatre premières secondes : la boucle fait revoir ; sinon elle ne rapporte que sa beauté.

**Proposition.** Ajouter à CLAUDE.md, dans chaque entrée de « Dossiers », une ligne fixe : `vues · tenue 3 s · durée moyenne · vu en entier · abonnés/1000 · partages/1000 · % recherche · où la courbe casse`.

Effort : S (cinq minutes de captures pour Merwan). Confiance : 5.

---

### VR-03 · 005 et 006 — le bloc CTA : dix-neuf secondes sur un plan presque fixe

**Preuve.**
- 006 : `frames/006/film_09.jpg` (64 → 71,5 s), `film_10.jpg` (72 → 79,5 s) : de 65,5 s à 80,5 s, le boîtier posé sur la grille verte, même cadre ; seuls les panneaux HTML changent. Rapport CTA / corps : 0,29. Plage quasi figée mesurée : 78–80 s.
- 005 : `frames/005/film_09.jpg`, `film_10.jpg`, `film_11.jpg` : de 66 s à 83,5 s, l'électroaimant sur la grille verte. Rapport : 0,27. Et l'immobilité commence avant : `film_07.jpg` et `film_08.jpg` (48 → 63,5 s) montrent la cuve tenue pendant toute la chute, puis Chicago en plan large fixe de 57,5 à 62 s. YDIF par seconde de 52 à 61 s : 1,1 · 1,4 · 0,3 · 0,3 · 0,3 · 3,0 · 0,5 · 0,5 · 0,5 · 0,3. **Les 36 dernières secondes du 005 (42 % du film) comptent trois événements d'image.**
- 002, le modèle : `frames/002/film_10.jpg`, `film_11.jpg` — le volant passe en vue de dessus, deux points rouges se posent à 10 h 10, un cercle montre le passage du sac, puis les mains se déplacent à 9 h 15. Chaque CTA a son image **et apporte un fait**. Rapport : 0,94.
- Silence : 1,04 s entre la dernière phrase d'histoire et « Like » dans les deux films (005 : 65,03 → 66,07 ; 006 : 64,79 → 65,83).

**Pourquoi ça compte.** Le signal le mieux documenté est le temps de visionnage, et « finir une vidéo longue » est le signal fort nommé par TikTok. Le bloc CTA est la zone où le spectateur a déjà eu sa récompense : s'il reconnaît un générique, il part, et il emporte la complétion avec lui. Le projet s'impose « chaque phrase a sa démonstration » et « relance toutes les 8–12 s » partout sauf là.

**Proposition pour le 006 (gratuite, image).** Faire du bloc CTA **la marche jusqu'à la boîte**, dans le hall du lendemain que la boucle utilise déjà (`main.js:419`, `toTomorrow`) :

```js
// à la place du cut(toCta, BENCH, …) de la ligne 390
cut(toCta, IN_HALL, WHERE, { ...FIRST, cast: 1, chaos: 0, halo: 0, mood: 0, far: 1, beacon: 1.2, lines: 1.7, route: 0 });
shot(toCta, t.rewind - toCta, { ...BOXCLOSE, d: 400, az: -24, shift: -60 }, "sine.inOut", WHERE.d);  // un seul mouvement de 15 s
st(t.proche - 0.2, 1.6, { route: 1.3 });      // « la plus proche de chez toi, elle est où ? » : le chemin vert se trace au sol
```

- « Sept fois sur dix, il y a un témoin » : les passants du hall passent au vert un par un (c'est le panneau « témoins prêts n/12 » joué en 3D ; le panneau peut rester en zone haute).
- « Le 15, lui, le sait » : l'étiquette existe déjà.
- Le panneau « prochain dossier » est en HTML : il se pose en zone haute pendant que la caméra continue d'avancer.
- La coupe `toTomorrow` disparaît : la boucle arrive au bout du même mouvement, sur la boîte, comme aujourd'hui.
- Personne sur le trajet de la caméra (règle des figurants), poses à trouver au `look`.

**Proposition pour le 005 (gratuite, image).**
- Commentaire (« une fois arrêté, il chauffe encore combien de temps ? ») : revenir dans la cuve arrêtée. Les barres sont au fond, vertes, et **le cœur garde une braise orange** qui respire lentement : la question a son image, et c'est une information que le film n'a pas encore donnée.

```js
cut(t.comment - 0.12, IN_REACTOR, { tx: X, ty: -60, tz: 0, d: 2300, az: -10, el: 10, shift: 150 },
    { power: 0, neutrons: 0, glow: 0.6, heat: 0.2, mood: 0, gel: 0, feed: 0, others: 1, chain: 0, sealed: 0.8 });
shot(t.comment - 0.12, t.commentEnd - t.comment + 0.3, { d: 1900, az: -2 }, "sine.inOut");
st(t.combien - 0.6, 1.4, { heat: 0.45 }, "sine.inOut");   // la braise remonte sur « combien de temps »
```

  (valeurs de `heat` et `glow` à doser à l'image ; pas d'orange franc : la réaction est arrêtée, c'est une chaleur résiduelle.)
- Abonnement : retour à l'établi, mais la caméra tourne pendant toute la phrase (`az` 20 → −30) au lieu de s'arrêter après 1,6 s.
- Chute (51,4 → 57 s) : la cuve « s'écarte » puis ne bouge plus pendant six secondes. Lui donner une dérive lente continue (`shot(t.chute + 0.75, …, { az: 40, el: 22, d: … })`) et faire tomber « RIEN » avec un geste dans la scène (les bobines de la couronne s'éteignent une à une sur « on dépense… pour l'empêcher de s'arrêter »).
- Chicago : le plan large fixe de 4,5 s devient un travelling lent vers la barre dès la coupe (allonger le `shot` de la ligne 308 jusqu'à `t.barre`, avec un écart de distance réel : 7000 → 5200 au lieu de 7000 → 6600).

**Silences (gratuit) dans `episode.json`.** 005 : `hache.hold` 0,4 → 0,15 ; `comment.hold` 0,6 → 0,25. 006 : `refuse.hold` 0,4 → 0,15 ; `comment.hold` 0,5 → 0,25. Les repères recalent image et son.

Cible vérifiable : rapport CTA / corps ≥ 0,6 ; aucune plage de plus de 3 s sous 0,3 après la dixième seconde (hors pause voulue).

Effort : M par film. Confiance : 3 (le mécanisme est documenté, l'ampleur ne se lira que sur la courbe).

---

### VR-04 · Méthode — « Like », premier mot du bloc depuis le 003 : c'est le seul appel que TikTok dit étouffer

**Preuve.**
- 003 (64,40 s), 004 (64,28 s), 005 (66,07 s), 006 (65,83 s) : la phrase commence par « Like ». Le 006 ajoute une pause tenue après le mot (`vo` : « Like. [short pause] … »), que CLAUDE.md note comme une réussite de direction.
- Le 002 commençait par une information : « Mais seulement si tu es bien assis. Like pour que ça tombe sur… ».
- NYT / « TikTok Algo 101 » : le système est réglé pour repérer et étouffer les vidéos qui demandent explicitement un like. Les règles du fil « Pour toi » écartent les incitations artificielles à l'engagement.
- WSJ : les likes pèsent moins que le temps passé.

**Lecture honnête.** Un « Like, pour celui qui… » avec une raison tirée de l'histoire n'est pas un « like-for-like » ; rien ne prouve qu'il est pénalisé aujourd'hui. Mais c'est (1) le seul des trois appels nommé dans un document interne comme cible d'un filtre, (2) le signal le plus faible des trois, (3) le mot qui annonce au spectateur que le film est fini, suivi — dans le 006 — de 0,8 s de silence. On échange un signal fort (finir la vidéo) contre un signal faible.

**Ce que ça contredit dans CLAUDE.md.** « Trois CTA par épisode — like, commentaire, abonnement — après la chute, chacun avec sa phrase » et « un CTA dit trop vite : le redonner à jouer avec une pause ». Ce qui reste juste : jamais de « like et abonne-toi » expédié. Ce qui change : « pas expédié » ne veut pas dire « long » ; un appel réussi est une information nouvelle dont la demande est la dernière proposition.

**Règle proposée pour le 007 et les suivants (décision de Merwan).**
1. Bloc de fin ≤ 13 s, soit ≤ 15 % du film : commentaire (4–5 s) → abonnement (4–5 s) → boucle (≤ 3 s).
2. Chaque appel **commence par un fait ou par l'image**, la demande vient en fin de phrase.
3. Le commentaire paie le C de l'accroche, avec sa démonstration 3D (modèle : 002).
4. L'abonnement est l'appât du dossier suivant d'abord, « abonne-toi » ensuite.
5. Le like passe à l'image seule (chevrons `.rail` + sa raison écrite), posé sur la relance qui suit la chute ; ou bien il devient une proposition de la phrase de commentaire. Plus de pause après le mot.
6. `npm run voice` : garder l'alerte « CTA dit trop vite », retirer le conseil d'ajouter une pause.

**Application au 005 et au 006 (non publiés) — trois niveaux, au choix de Merwan.**

| Option | 005 | 006 | Crédits |
| --- | --- | --- | --- |
| A · supprimer le beat `like`, garder ses chevrons | le bloc s'ouvre sur « Et dis-moi en commentaire : une fois arrêté, il chauffe encore… » (−3,6 s) | « Sept fois sur dix… » disparaît aussi (−4,1 s) : dommage, c'est un fait | 0 |
| B · reprendre la seule phrase `like` | « Quelqu'un, autour de toi, imagine encore un gros bouton rouge. » + chevrons | « Sept fois sur dix, il y a un témoin. Autant qu'il ait vu ça. » + chevrons | ≈ 45 par film |
| C · reprendre les trois | commentaire : « Une fois arrêté, il chauffe encore. Combien de temps ? Dis-le en commentaire : la réponse est épinglée. » · abonnement : « Le prochain dossier est accroché à un mur, sur ton trajet. Et tu n'oserais jamais t'en servir. Abonne-toi : on l'ouvre. » | commentaire : « La plus proche de chez toi, elle est où ? Dis-le en commentaire. Tu ne sais pas ? Le 15, lui, le sait. » · abonnement : « Le prochain dossier te sort d'un avion en une demi-seconde. Avec une fusée sous le siège. Abonne-toi : on l'ouvre. » | ≈ 130 par film |

Recommandation : B sur les deux films (≈ 90 crédits, solde 26 266), C à partir du 007 où c'est gratuit. Et publier le 005 **ou** le 006 tel quel n'est pas une faute : c'est un pari à lire sur la courbe (VR-02).

Effort : S pour la règle. Confiance : 3.

---

### VR-05 · 006 et 005 — le mot que les gens cherchent n'est ni dit ni écrit dans la légende

**Preuve.**
- `script_006.txt` : « défibrillateur » n'est prononcé nulle part (la voix dit « une boîte verte », « elle »). `episode.json → post.caption` : « Tu passes devant sans la regarder. Elle se teste toute seule… » — le mot n'y est pas. Il n'existe que dans le petit titre de l'en-tête et dans le hashtag `#defibrillateur`.
- 005 : « arrêt d'urgence » n'est jamais dit ; « réacteur nucléaire » l'est à 3 s et figure dans la légende.
- 004 : « différentiel » est dit pour la première fois à 61 s.

**Pourquoi ça compte.** La « valeur de recherche » est l'un des quatre critères du programme de récompenses (officiel). Un quart des utilisateurs cherche dans les 30 s après l'ouverture ; TikTok personnalise les résultats de recherche. Que la recherche lise la légende, le texte à l'écran et la transcription de la voix est rapporté partout mais je ne l'ai pas vu confirmé dans un texte de TikTok : confiance 3. Le sujet du 006 est un sujet de recherche type (« comment marche un défibrillateur », « où trouver un défibrillateur »).

**Proposition (gratuite).**

Légende du 006 :
> Comment marche un défibrillateur ? Tu passes devant la boîte verte sans la regarder : elle se teste toute seule, elle te parle, et elle refuse de choquer un cœur qui bat. La plus proche de chez toi, elle est où ?

Légende du 005 :
> Comment s'arrête un réacteur nucléaire pendant une panne de courant ? Pas avec un gros bouton rouge : l'arrêt d'urgence, c'est arrêter de retenir les barres. Et une fois arrêté, il chauffe encore combien de temps, à ton avis ?

Les deux respectent la règle du projet (prolonger l'accroche, finir par la question du commentaire).

Méthode pour le 007 : le nom courant du système est **dit au moins une fois avant « Alors… on l'ouvre »**, sauf si le retournement de l'accroche repose sur le fait de le taire — auquel cas il est dit au plus tard dans la chute. Et il figure dans la première phrase de la légende, sous la forme d'une question que quelqu'un taperait.

Pipeline : `node scripts/sd.mjs script <ep>` affiche un avertissement si le titre de l'épisode (sans accents ni casse) n'apparaît ni dans un `text` ni dans `post.caption`.

Dès 1 000 abonnés : regarder « Creator Search Insights » (taper ce nom dans la recherche de l'app) avant de choisir un sujet — non vérifié dans cet audit, quota de recherche atteint.

Effort : S. Confiance : 3.

---

### VR-06 · 006 — deux promesses à tenir avant de publier

**Preuve.** `frames/006/film_10.jpg` (75 → 80 s) : panneau « PROCHAIN DOSSIER · 007 — CLASSÉ — 0,5 s pour quitter l'avion — S'ABONNER POUR L'OUVRIR », et la voix : « le prochain dossier te sort d'un avion en une demi-seconde ». CLAUDE.md : ce 007 est « à faire valider par Merwan ». 005 (`film_10.jpg`, 73 s) : « La réponse est épinglée ».

**Pourquoi ça compte.** « S'abonner pour l'ouvrir » est honnête tant que le dossier promis arrive. Si le 007 change de sujet après la publication du 006, c'est une fausse incitation au sens des règles du fil « Pour toi », et surtout une promesse rompue devant ceux qui se sont abonnés pour ça. Même chose pour un commentaire annoncé comme épinglé et qui ne l'est pas.

**Proposition.**
1. Merwan valide le sujet du 007 **avant** la mise en ligne du 006 ; sinon, reprise de la phrase `abo` (≈ 45 crédits) avec un appât qui ne nomme pas l'avion.
2. Dans le bureau de publication (`front`), une case « commentaire épinglé » à cocher à côté du bouton copier, pour le 005 et le 006.
3. Vérifier que le commentaire du 003 (« La réponse est épinglée ») l'a bien été.

Effort : S. Confiance : 4.

---

### VR-07 · Pipeline — `npm run qa` ne voit pas une ouverture figée ni un bloc de fin immobile

**Preuve.** `scripts/qa.mjs` contrôle la voix, le niveau, les images parasites, la fluidité. Rien sur l'immobilité : le 005 a passé tous les contrôles avec quatre secondes d'image fixe en ouverture. La mesure de la section 2 coûte quinze secondes par film.

**Proposition.** À côté de l'analyse de `scripts/flicker.mjs`, trois lignes de plus dans le rapport de `qa` :

```
ouverture   YDIF moyen 0–3 s             ≥ 2,0        sinon « ouverture figée : rien ne bouge avant la 4e seconde »
bloc de fin YDIF(1er CTA → fin) / YDIF(10 s → 1er CTA)   ≥ 0,6   sinon « le film s'arrête à NN s »
plages      après 10 s, toute suite de plus de 3 s sous 0,3     → listée avec ses instants (une pause voulue se justifie, une autre se corrige)
```

Mesure : `fps=10,scale=135:240,crop=135:90:0:55,signalstats` ; l'instant du premier CTA vient de `T.at("like")` (ou du premier beat marqué CTA). Seuils calés sur les cinq films : ouvertures 5,8 à 8,1 pour 004 et 006, 0,3 à 1,3 pour 002 et 005 ; rapports 0,94 (002) à 0,27 (005).

Effort : M. Confiance : 4.

---

### VR-08 · Compte — trois vidéos le même jour, deux prêtes : une cadence qui laisse lire chaque courbe

**Preuve.** CLAUDE.md : 001 le 5 octobre ; 002, 003 et 004 le 6 octobre. 005 et 006 sont rendus.

**Ce que disent les données.** Publier plus ne pénalise pas la vue médiane (Buffer, 11,4 M de publications) ; le gros du gain par publication est entre 1 et 2–5 par semaine. Les vues d'une vidéo se jouent sur ses 1 à 5 premiers jours (Socialinsider). Rien de documenté sur une pénalité à trois vidéos par jour. Mais la règle du projet — « l'épisode suivant s'écrit avec la courbe du précédent sous les yeux, 24 à 48 h après » — est impossible à tenir quand trois dossiers sortent ensemble, et le 003 et le 004 se sont partagé le même public d'essai.

**Proposition (décision de Merwan).**
- Un dossier tous les deux jours au plus tant que les courbes ne sont pas lues (3 à 4 par semaine, dans la zone où Buffer mesure le gain).
- Créneau fixe, choisi sur « activité des abonnés » de TikTok Studio dès qu'il y a assez d'abonnés ; d'ici là, début de soirée (le 004 est sorti vers 17 h ; Buffer place le fort entre 18 et 23 h, effet faible).
- Ordre : 005, puis 006 au moins 48 h après, **après** avoir lu la courbe du 004 et appliqué VR-01.
- Ne jamais supprimer pour republier : le contenu dupliqué est écarté des recommandations, et la vidéo d'origine garde ses vues tardives.

Effort : S. Confiance : 3.

---

### VR-09 · 006 — la première phrase à l'écran est recouverte par la tête à 1,2 s

**Preuve.** `audit/veille-retention/006_open_strip.png` (0,0 s et 1,2 s) et `frames/006/hook_01.jpg`, ligne 2 (0,83 → 1,67 s) : le corps tombe dans la zone des cartes d'accroche (1186–1542 px) ; la tête, claire, passe sous « QUELQU'UN » — rouge sur beige. CLAUDE.md fixe le sujet 3D entre 440 et 1160.

**Pourquoi ça compte.** C'est la phrase A, pendant la seconde où se décide le balayage ; les consignes de TikTok demandent la proposition lisible dans les 3 premières secondes.

**Proposition (gratuite).** Remonter le cadre du plan d'ouverture d'environ 140 px (`shift` de `POSE0` et de la pose de la ligne 169, à régler au `look` sur 0,0 / 0,8 / 1,2 / 1,6 s) pour que le corps couché finisse au-dessus de y = 1160 ; ou poser sous la carte la même ombre que `#title-shade`. La première et la dernière image restent identiques (même `POSE0`).

Effort : S. Confiance : 4.

---

### VR-10 · Méthode — la durée de 80 à 90 s est confirmée ; ce qui ne l'est pas, c'est de la remplir

**Confirmé.** Plus de 60 s : +43 % de portée médiane par rapport aux 30–60 s et temps de visionnage médian le plus haut (Buffer) ; condition d'entrée du programme de récompenses (TikTok) ; « finir une vidéo longue » = signal fort (TikTok 2020). La règle « le MP4 fait ≥ 60 s » est bonne. Ne pas raccourcir sous la minute.

**Nuance.** Les recommandeurs comparent le temps de visionnage à durée égale (D2Q, WTG) : 85 s ne valent que si elles tiennent mieux que les autres vidéos de 85 s. Chaque seconde qui retient moins que le reste du film coûte. Deux endroits où ça se joue ici :
- la phrase de boucle : 5,6 s sur le 004, 3,8 s sur le 005, 3,9 s sur le 006. Cible : ≤ 3 s.
- elle commence par « En attendant » dans les cinq derniers films (002 à 006). Un spectateur de la série apprend que ces deux mots veulent dire « c'est fini ». Pour le 007 : entrer dans la boucle par l'image ou par un fait, sans formule.

**La boucle elle-même.** Revoir est un signal (WSJ), et TikTok relance la lecture de toute façon ; son effet propre n'est chiffré nulle part. On la garde ; on la vérifie par la bosse de 0 à 4 s sur la courbe (VR-02).

Effort : S. Confiance : 4.

---

### VR-11 · Méthode — « ça bouge dès la première demi-seconde » : la règle qui manque à la section accroche

**Preuve.** CLAUDE.md demande que la première image soit « la plus forte du film » et tienne sans le son ; rien sur le mouvement. Résultat : 002 (0,66), 003 (1,01) et 005 (0,28) ouvrent sur une image arrêtée, 004 (5,80) et 006 (8,14) sur une action. Planches : `frames/002/hook_01.jpg`, `frames/003/hook_01.jpg`, `frames/005/hook_01.jpg`, `frames/006/hook_01.jpg`.

**Proposition de texte pour CLAUDE.md**, sous « La première image » :

> **La première image bouge.** Ce que dit la phrase A arrive à l'écran avant la fin de son premier mot : quelqu'un tombe (006), une main se referme (004), une lumière s'éteint (005). Une image fixe, même belle, se balaye comme une photo. `npm run qa` mesure l'ouverture : en dessous de 2 sur les trois premières secondes, on la refait.

À confirmer par la comparaison 002/003 contre 004 quand les courbes arrivent ; d'ici là, c'est la règle la mieux étayée par ce qu'on sait (durée moyenne de visionnage de 3,75 s, accroche dans les 6 premières secondes, capture de l'attention par le démarrage d'un mouvement).

Effort : S. Confiance : 4.

---

### VR-12 · Compte — formats et canaux annexes : à tester une fois, pas à installer

- **Carrousel photo.** +81 % d'interactions mais un tiers de partages en moins que la vidéo (Fanpage Karma). Pour ce compte : une « fiche du dossier » en six images (vue éclatée et quatre faits, tirées de `npm run snap`), 48 h après la vidéo, sans crédits de voix. Un seul essai, jugé sur les abonnés gagnés. Risque : diluer une identité bâtie sur la 3D animée.
- **Shorts et Reels.** Les MP4 de `renders/` n'ont pas de filigrane d'app ; Instagram ne déclasse que les logos d'autres applications, pas un logo à soi (Mosseri — https://www.socialmediatoday.com/news/instagram-clarifies-that-including-your-own-logo-on-a-reel-is-ok/730852/). Publier le même fichier ailleurs ne coûte rien, mais les zones sûres du film sont calées sur TikTok : à vérifier avant.
- **Playlists.** Réservées aux comptes de 10 000 abonnés d'après les guides (https://later.com/blog/tiktok-playlists) : pas encore. En attendant, épingler les trois meilleurs dossiers en haut du profil, et garder les couvertures « DOSSIER 00X » identiques.
- **Première heure.** Épingler tout de suite le commentaire prévu, répondre aux premiers commentaires (TikTok trie les commentaires selon réponses et likes). Effet sur la distribution : non démontré.

Effort : M. Confiance : 2.

---

## 4. Les règles de CLAUDE.md devant les sources

| Règle actuelle | Verdict | Sur quoi |
| --- | --- | --- |
| « L'accroche, c'est 99 % du travail », ABC avant la 10e seconde | **Confirmée** | durée moyenne de visionnage 3,75 s (Metricool) ; accroche dans les 6 s (TikTok pub) ; temps passé = signal maître (WSJ, NYT) |
| Première image la plus forte, qui tient sans le son | Confirmée, **incomplète** : il manque « elle bouge » | VR-11 |
| Cartes d'accroche lisibles dès l'image 1 | Confirmée, avec une nuance : TikTok s'écoute (88 % jugent le son essentiel). La carte est un appui, pas le canal principal ; la voix à 0,28 s et l'image passent avant | TikTok pub, Kantar |
| Voix qui démarre à 0,2 s, jamais criée | Cohérent ; pas de donnée publique sur le niveau de voix. L'écart 003 / 004 le dira | VR-02 |
| Épisode de 75 à 95 s, MP4 ≥ 60 s | **Confirmée** | Buffer, programme de récompenses |
| Relance toutes les 8 à 12 s | Cohérent, non chiffrable ; **non appliquée dans le dernier quart** des films | section 2 |
| Chaque phrase a sa démonstration | Cohérent ; non tenue pour la phrase A du 005 ni pour les CTA du 005 et du 006 | VR-01, VR-03 |
| Trois CTA parlés après la chute, « Like » compris, avec une pause | **Contredite en partie** : le like demandé à voix haute est le seul appel documenté comme filtré, et le bloc pèse 21 à 25 % du film | VR-04 |
| Le C trouve sa réponse à la fin, avec le commentaire | **Confirmée** : c'est une boucle ouverte qui sert la complétion, et une vraie raison de commenter | TikTok 2020 |
| « La réponse est épinglée » | Bon levier, à condition d'épingler | VR-06 |
| La boucle est sacrée | Plausible, non chiffrée ; à vérifier sur la courbe | VR-10 |
| Sous-titres mot à mot | Cohérent (compréhension, texte à l'écran) ; aucun chiffre propre à TikTok | — |
| Cinq hashtags au plus | Sans preuve dans un sens ni dans l'autre ; inoffensif | — |
| Apprendre de chaque vidéo 24 à 48 h après | **Confirmée** (les vues se jouent en 1 à 5 jours), mais rendue impossible par trois publications le même jour | VR-08 |
| Rien sur la recherche, la cadence, l'heure, les cibles chiffrées | **Manque** | VR-02, VR-05, VR-08 |

---

## 5. Ce qui marche déjà et qu'il ne faut pas casser

1. L'accroche A · B · C en moins de dix secondes, la voix à 0,28 s, la phrase entière à l'écran dès l'image 1 : c'est exactement là que les sources placent l'enjeu.
2. La durée de 82 à 94 s : au-dessus de la minute, dans la tranche qui a la meilleure portée médiane et qui ouvre la monétisation.
3. L'ouverture du 006 (quelqu'un tombe dans la première demi-seconde, YDIF 8,1) : le modèle pour toutes les suivantes.
4. Les appels à l'action du 002 (le volant vu de dessus, les mains, le passage du sac) : chacun a son image et son fait ; le film ne s'arrête pas.
5. Le commentaire qui paie la question de l'accroche, avec une réponse sourcée épinglée : une vraie raison d'ouvrir les commentaires, pas un appât.
6. L'identité de série (DOSSIER 00X, en-tête, couvertures, le dossier suivant annoncé) et des films 100 % originaux, sans filigrane : ce que le critère « originalité » récompense.

---

## 6. Fichiers produits

- `rapport.md` — ce rapport.
- `activity.mjs`, `ydif_<film>.txt` — la mesure d'immobilité, reproductible.
- `005_open_strip.png` — 005 à 0,0 / 0,5 / 1,5 / 3,0 s.
- `006_open_strip.png` — 006 à 0,0 et 1,2 s.
