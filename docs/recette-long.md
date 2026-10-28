# La recette d'un long (YouTube, 16:9) — d'après le pilote L01

Écrite le 2026-10-15 au soir, à la fin du montage du L01 (« Fabriqué pour te sauver : ton pare-brise », 8 min 51), sur les mesures de `npm run metrics -- L01` (`metrics/production.json`). Le but de Merwan : **2 à 3 longs par semaine au départ, au moindre coût en jetons, sans rien céder sur la qualité**. Ce fichier dit comment, et ce qui coûte. Le format lui-même (le principe, la voix, la forme) est dans CLAUDE.md, « Le format long (YouTube) ».

**Trois recettes pour un long (depuis le 21/10)** : l'écriture et la voix ici (« L'écriture d'un long », juste après) ; l'image, le décor et la miniature dans `docs/recette-long-image.md` ; ce qui retient et fait dire « wow, il est trop fort » dans `docs/recette-long-retention.md`. Le diagnostic chiffré d'où sort la partie écriture : `docs/scale/long-1-script-voix.md`.

## Trois exigences de Merwan, qui valent pour tous les longs

- **« Si c'est trop statique on perd l'attention »** : la caméra ne s'arrête jamais ; un nouveau plan (coupe, ou mouvement qui révèle autre chose) toutes les 5 à 10 s ; jamais plus de 4 s sans mouvement visible ; on suit l'objet le long de la chaîne ; un mouvement vif (un « fouet ») sous chaque carte de chapitre.
- **« Il ne faut pas que l'image soit vide, mais pas trop remplie non plus »** : un sujet par plan qui occupe le tiers à la moitié du cadre ; toujours un fond qui situe (machine aux rayons X, grille, lueur), plus sombre et plus fin que le sujet ; jamais un petit objet seul dans du noir ; une seule information écrite à la fois (mot-clé OU fait OU étiquette) ; ce dont on ne parle pas s'éteint.
- **Un long n'est pas un gabarit où seul l'objet change** (« trop simple, un manque de qualité et de professionnalisme ») : ce qui se réutilise, c'est l'outillage et le savoir-faire ; chaque long a ses machines fidèles à SON procédé réel, sa pièce maîtresse visuelle (ici le ruban orange sur l'étain), sa première image et sa mise en scène.

## L'écriture d'un long (21/10, d'après le L01 et le L02)

À lire avant d'écrire le `episode.json` d'un long. `npm run script -- Lnn` en vérifie l'écriture (`scripts/lib/ecriture.mjs`, des avertissements, rien de bloqué) et dessine sa carte : les chapitres et la façon dont chacun finit, les coupures pub à poser, les requêtes de la voix, les fils. Le modèle (`kit/template-long/episode.json`) porte la recette : un film neuf en est le squelette.

### Ce que disent les deux premiers longs (des pistes : aucune courbe YouTube n'est encore lue)

- **Le rythme** : L01, 1 663 mots, 8 min 51, 13 chapitres ; L02, 1 787 mots, 9 min 10, 11 chapitres — 188 à 195 mots par minute, silences compris.
- **La promesse du titre est tenue tôt** dans les deux : L01 « ta tête » à 0,4 s, « moins d'un millimètre » vers 8 s, « il devra casser » vers 24 s ; L02 « coupée » vers 2 s, « te tuer » vers 7 s, « cinq gestes… en vie » vers 14 s. **Pas toujours celle des miniatures** : la nacelle du L02 (« SANS COUPER ») n'arrive qu'à 3:34.
- **Les fins de chapitre** : six sur douze finissent à plat dans le L01 (« Dans le sable. », « Deux, feuilleté. », « Et chaque vitrage est inspecté. », « …resté dans le verre. »…) ; une sur dix dans le L02, relu chapitre par chapitre avant la voix.
- **Les promesses de l'accroche oubliées en route** : la vitre de côté du L01 reste 5:36 sans un mot, l'ordre des pinces du L02 6:17 ; le test du L01, 3:13 (fils déclarés à la main sur une copie des deux scripts).
- **Une coupure pub mal placée** : la troisième du L01 (6:39) tombe après un fait clos, cinq secondes avant la meilleure relance du film (« Maintenant… on va essayer de le détruire. », 6:44).
- **Le climax freiné** : « on va essayer de le détruire », puis 42 mots de normes optiques avant le premier coup ; une petite bille à cinq chiffres entre la grosse bille et la tête (L01). « Dans les simulations des ingénieurs… » au milieu de l'incident (L02).
- **Un chapitre « Ce qu'il faut retenir »** à la fin des deux (L01 : « Résumons. ») : le signal classique pour partir. À lire sur les courbes, à 7:48 et 7:53.
- **Les appels à l'action** sont amenés depuis la réécriture du L01 (le seuil continue la phrase d'avant), mais le L01 dit son marquage et son commentaire 25 et 32 % plus vite que le reste du film : ses deux phrases les plus rapides.
- **La voix H2** : d'une phrase à l'autre, 1,3 demi-ton dans les deux films (le verdict des courts dirait « même ton partout » : sur un long, c'est l'oreille de Merwan qui tranche, et elle a dit « masterclass ») ; « on l'ouvre » à 1,30 s dans les deux ; le climax du L02 ne monte pas (« L'incident » +0,3 dt, contre +2,1 pour « Sans couper »).

### 1. L'emballage s'écrit avec l'accroche

Le titre, les trois miniatures et l'accroche s'écrivent ensemble (titres et miniatures, c'est nous qui les tranchons ; l'accroche, Merwan la valide avec le devis voix). **Ce qu'ils promettent est dit avant 30 s** : le mot qui tient la promesse du titre et celui de la miniature se déclarent dans les repères (`"titre": "promesse:millimètre"`, `"miniature": "accroche:casse"`) et `npm run script` dit à quelle seconde ils tombent. Une miniature dont la promesse n'est pas dans les 30 premières secondes sort de la rotation : le test A/B de YouTube la jugerait à la durée de visionnage, et ceux qu'elle fait cliquer partent avant.

**Le mot que les gens cherchent** (`post.youtube.keyword`) se lit dans l'autocomplétion de YouTube — gratuite, sans compte : `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=fr&gl=fr&q=<début de la requête>` (WebFetch). Relevé le 21/10 : « comment est fabriqué le verre », « verre feuilleté ou verre trempé », « consignation haute tension », « ligne haute tension hélicoptère », « comment est fabriqué un pneu ». Il va après les deux points du titre et dans les deux premières lignes de la description.

### 2. Les 30 premières secondes

- **0 → 10 s** : A (une scène, à toi, au présent) et le fait du titre. « Ta tête part dans le pare-brise. Il *casse*… exactement comme prévu. » Une première phrase de douze mots au plus.
- **10 → 30 s** : C (une question à toi, payée à la fin) et le défi (payé au test). **Jamais de sommaire** (« dans cette vidéo », « on va voir », « au programme ») : les étapes, c'est l'en-tête qui les montre. « On y reviendra. » est une phrase de trop (L01).
- **« Alors… on l'ouvre. »** entre 25 et 45 s (L01 : 0:27, L02 : 0:37), mot pour mot, `[calm]`. Avant elle, 110 mots au plus (L01 : 86).
- **Pas d'abonnement dans la première minute** tant que la courbe du L02 (demande à 0:31, sur la demande de Merwan) n'a pas dit ce qu'elle coûte contre celle du L01 à la même seconde.

### 3. Les chapitres

- **8 à 13 chapitres, de 20 à 90 s chacun** (YouTube ignore tous les chapitres si l'un fait moins de 10 s).
- **Le titre d'un chapitre se lit deux fois** : sur la carte, et dans la recherche (les « moments clés » de YouTube et de Google). Ce que les gens tapent, ou ce qu'ils attendent : « Verre trempé ou verre feuilleté ? », « Étape 5 : la mise à la terre ». Le premier, à 00:00, n'a pas de carte : jamais « Introduction », la scène (« Ta tête dans le pare-brise »). Le dernier jamais « Ce qu'il faut retenir » : le fil qu'il paie (« La vitre à viser pour sortir »).
- **Un chapitre naît du précédent et relance le suivant** : sa première phrase reprend le mot ou l'idée de la dernière d'avant ; sa dernière phrase finit sur une question, une menace (un mot `*signal*`), une promesse (« tout à l'heure », « juste après ») ou une suspension (« … »). **Jamais sur un fait clos.** `npm run script` écrit « À PLAT » en face de ceux qui ferment.

### 4. Les fils

- **Ils se déclarent dans le script** : `"fil": "test"` sur la phrase qui ouvre un fil (ou le rappelle, s'il est déjà ouvert), `"paie": "test"` sur celle qui le paie (une chaîne ou une liste). `npm run script` en dessine la carte et vérifie le reste.
- **Trois fils au moins** : la question de l'accroche (C, payée après la chute), le défi (payé au test), un ou deux au milieu (L01 : le petit tampon du coin, ouvert à 0:29 et payé à 3:00 ; « pendant six ans », dit juste avant la coupure pub de 4:17 et payé juste après).
- **Le test se rappelle au moins une fois par tiers du film** (Merwan) : `npm run script` prévient d'un fil resté plus d'un tiers du film sans rappel.
- **Un fil se paie seul, tard** : jamais deux réponses dans la même phrase.
- **Une digression de plus de 20 s ouvre ou paie un fil.** Le flacon de Bénédictus, oui (il tombe, il tient, « pendant six ans » : une histoire). Le brevet de 1902, English Triplex et la loi anglaise des années 1930, non : 21 s qui peuvent sauter.

### 5. Les coupures pub

- **Trois pour 9 min**, vers 2:00, 4:15 et 6:30 : 90 s d'écart au moins, aucune avant 1:30 ni dans la dernière minute. Il faut 8 min de film pour en avoir : **1 550 mots au moins**.
- **Juste après une phrase qui laisse une question en l'air** (« ? », « … », une menace), avec au moins un fil ouvert. Une pub qui tombe après un fait clos perd ceux qui n'attendaient plus rien.
- **Posées à la main** dans YouTube Studio, aux instants que donne `npm run script` (« Coupures pub — à poser à la main… », au dixième de seconde, dans le silence qui suit la phrase, avant la carte suivante). Jamais le placement automatique : il peut couper une phrase.

### 6. Le test (le climax)

- **Des phrases de trois à huit mots, un chiffre au plus par phrase, une montée qui ne recule jamais** (petit → grand : au L01, la petite bille après la grosse redescend).
- **Ni normes ni précautions au milieu** : les chiffres qui prouvent vont à l'étape d'avant, les « dans les simulations » dans la réponse due ou dans les sources. Entre « on va essayer de le détruire » et le premier coup : cinq secondes au plus.

### 7. La fin, dans l'ordre

**Chute → ce qui est dû (le fil de l'accroche) → commentaire → like → rendez-vous → boucle.** Pas de résumé annoncé (« Résumons », « Ce qu'il faut retenir ») : si le film enseigne une liste, c'est une question dans la chute (« Qu'est-ce qui t'a sauvé ? Pas le détecteur… », L02). Le rendez-vous ne nomme ni sujet ni date (Merwan, 15/10). La boucle retombe sur les premiers mots de l'accroche (« …le jour où… » → « Ta tête part dans le pare-brise »).

### 8. Les appels à l'action (« smooth et bien amenés » ; au L01 : « trop brut »)

- **Abonnement** : une fois, à la porte du test (25 à 65 % du film ; L01 : 39 %, L02 : 60 %), dans la phrase qui continue la précédente — jamais en commençant par « Abonne-toi ». Au L01 : « …il faut glisser quelque chose. » → « Ce quelque chose, c'est lui qui va prendre le choc, tout à l'heure. Si tu veux voir ça… abonne-toi, on y arrive. » 32 mots au plus.
- **Commentaire** : il prolonge le geste qu'on vient d'apprendre (« regarde le marquage » → « dis-moi ce qui est écrit sur ta vitre conducteur »), une lecture à faire chez soi ou un camp à choisir, une réponse d'un mot si possible (« trempée… ou feuilletée ? »), deux publics s'il y en a deux (L02 : l'habilité, et celui qui ne l'est pas).
- **Like** : avec un partage et sa raison (« envoie-la à quelqu'un qui garde un brise-vitre dans sa boîte à gants » ; « à un vrai électricien : il te dira ce qui manque »).
- **Rendez-vous** : « On se retrouve très vite, dans… ».
- **Dits au pas du film, ou plus lents** : un `[short pause]` avant la question ; `npm run script` prévient au-delà de +20 % (L01 : « comment » et « etiquette »).

### 9. Le budget

**1 650 à 1 850 mots** (≈ 8 min 45 à 9 min 45), jamais sous 1 550 (les coupures pub), jamais gonflé vers 12 min. Avant « on l'ouvre », 110 mots au plus ; un chapitre, 90 s au plus ; une phrase, 40 mots au plus et deux chiffres au plus (un, c'est mieux : L01 « froid » en dit cinq).

### 10. La voix (H2, validée par Merwan le 15/10)

- **Une requête par chapitre** : `voice.parts` = la première phrase de chaque chapitre ; « on l'ouvre » reste d'office dans la requête de l'accroche (`voice.mjs`). Mesuré : 10 et 13 requêtes de 370 à 1 740 caractères (L02, L01). Jamais plus de 2 500 caractères (une requête longue installe Eric dans son registre bas : banc H1), ni plus de 10 000 (la limite d'ElevenLabs). Une requête commence toujours sous une carte de chapitre.
- **Les balises** : `[conversational, curious]`, `[warm, conversational]` et `[curious]` en rotation, jamais trois fois la même de suite ; `[serious]` sur les menaces ; `[amused]` sur quatre paradoxes au plus, jamais sur l'accroche, une victime, la chute ; `[tense]` pour l'accroche seulement ; `[calm]` pour « on l'ouvre » et la boucle ; `[warm]` pour le like et le rendez-vous. **Interdites sur un long** : `[firm, matter-of-fact]` et `[thoughtful]` (un ton de présentateur : « trop formel »), et toutes celles qui le sont sur un court (`[urgent]`, `[dramatic]`, `[ominous]`, `[low, grave voice]`, `[relieved]`, `[nervous]`, `[slowly]`).
- **Le climax monte par l'écriture** (phrases courtes, aucune précaution) **et sans `[serious]`** : elle fait descendre Eric (banc du 025 : 2,3 dt sous `[tense]`, mêmes mots). Mesuré : au L02, les deux phrases `[serious]` de l'incident sortent à −0,5 et −0,6 dt quand `[curious]` y monte à +2,8, et le chapitre reste à +0,3 dt (« Sans couper » : +2,1) ; au L01, le test n'en a aucune et c'est le chapitre le plus haut du film (+1,7 dt). Au test : `[curious]` et `[conversational, curious]`, `[serious]` gardée pour une menace posée hors du climax.
- **Ce qui se mesure** : le débit des appels à l'action (+20 % au plus) et « on l'ouvre » (1,07 à 1,5 s). Le verdict « même ton partout » est calculé sur les actes d'un court : sur un long, il ne dit rien.
- **Le coût** : une prise en turbo, 5 200 à 5 700 crédits annoncés, 2 400 à 2 500 facturés (≈ 0,44 de l'annonce) ; une phrase reprise seule ≈ 25 crédits.

### 11. La chaîne d'écriture

Faits (deux passes) → le plan des fils et des chapitres (les coupures pub y sont) → le script → `npm run script` (tout ce qui est mécanique) → la relecture (au L02 : un relecteur par chapitre, neuf agents légers, 1,7 M de jetons ; maintenant que la machine compte les fins à plat, les chiffres et les balises, un seul relecteur pour tout le film suffirait, sur l'exactitude, le vocabulaire et une note d'image par phrase — à décider par Merwan) → l'accroche, l'emballage et le devis voix en un seul oui → la voix, une requête par chapitre → son écoute. La courbe de rétention se pose ensuite phrase par phrase, comme pour les courts (les instants sont dans la carte de `npm run script`) ; ce qu'on y lit : `docs/recette-long-retention.md`.

## Ce que le pilote a construit une fois (et qui ne se refait plus)

| Quoi | Où | Ce que ça fait |
| --- | --- | --- |
| Le cadre 16:9 | `kit/long.css`, `kit/lib/landscape.js` (importé en premier : sans lui la 3D est rendue en portrait puis étirée), `kit/template-long/` | 1920 × 1080, l'en-tête « DOSSIER · ÉTAPE 03 / 08 · température », les zones (mots-clés en bas à gauche, faits en colonne, moitié droite libre les 15 dernières secondes) |
| Les textes à l'écran | `kit/lib/long.js` (`buildChapters`, `buildKeywords`, `lineHud`, `fact`, `chipEl`) ; `D.commit({ long })` dans `kit/lib/direct.js` | une carte par chapitre (`chap` dans le script) 0,9 s avant son premier mot ; les mots marqués `*…*` / `+…+` en mots-clés au moment où ils sont dits ; `quiet` : des fenêtres où aucun mot-clé ne passe |
| Les mots hors de l'image | `npm run srt -- <ep>` (`scripts/srt.mjs`) | `renders/<dossier>.srt` tiré des vrais instants de la voix, et les chapitres horodatés écrits dans `post.youtube.description` (à partir de `descriptionTemplate`, marqueur `__CHAPITRES__`) |
| La miniature | `npm run cover -- <ep>` sur un long → `renders/<dossier>-miniature.png` 1280 × 720 | `episode.json` → `thumb` : `at`, `cam`, `state`, `title` (deux ou trois mots), `tone` |
| La musique | `scripts/sfx.mjs` → type `music` | pad, basse, arpège et pied quand « drive » monte ; s'efface sous la voix ; `curve: [[moment, niveau, drive]]` ; mesuré 8 à 10 LU sous la voix |
| Le kit d'usine aux rayons X | `kit/lib/usine.js` (fours : fusion, tunnel, résistances ; cuve plate à miroir, autoclave ; tapis à rouleaux), `kit/lib/postes.js` (portiques à quatre outils, salle blanche, soufflerie, tour de chute, tête d'essai, banc optique, poinçon) | **des familles de machines très réglables** : le catalogue (chaque réglage, des exemples de réglages qui donnent des machines différentes, les poses vues) est dans `docs/journal/L01-usine.md` et `L01-postes.md` |
| Les outils à la taille d'un long | `look`, `review` lisent le cadre de la page ; `qa` lit le film par tranches de 60 s (un long décodé d'un coup ne tient pas en mémoire) ; `chrono` accepte `L01` | |

Les blocs des courts qui désignent les boutons de TikTok (`followCall`, `likeCall`, `commentCall`, `nextFile`, `rail`) **plantent sur la page d'un long** : les appels à l'action d'un long passent par la voix, `fact` et le nom du compte allumé à la main.

## La chaîne, dans l'ordre (mesurée sur le L01)

| Étape | Qui | Mesuré au L01 |
| --- | --- | --- |
| 0. Kit 16:9 (une fois) | celui qui orchestre | ≈ 35 min |
| 1. Architecte : `plan.js` (sans import), `world.js` (le contrat), un bouchon par décor avec sa vraie interface, les fichiers de chapitres vides, `docs/<ep>-decors.md`, `docs/<ep>-actes.md` (les phrases sur les vrais instants de la voix) | 1 agent | 27 min · 417 k |
| 2. Décors, en parallèle, un fichier chacun | 5 agents | 23 à 28 min · 330 à 400 k chacun · 1,83 M |
| 2 bis. **Habillage** (depuis le 16/10, pas encore mesuré sur un long) : la vie de chaque lieu — `docs/recette-decorateur.md`, `kit/lib/details.js` ; il tourne pendant l'intégration | 1 à 2 agents | visé : 20 à 25 min · 250 à 400 k chacun |
| 3. Intégration des « À changer ailleurs » des décors dans le contrat, et la planche des candidates de la première image | 1 agent | 8 min · 272 k |
| 4. Choisir la première image (planche de six) | celui qui orchestre | 2 min |
| 5. Chapitres, en parallèle, un fichier par groupe de chapitres (≈ 60 à 110 s de film chacun) | 7 agents | 11 à 19 min · 280 à 380 k chacun · 2,21 M |
| 6. Relecture du film entier : deux planches de 28 images (une toutes les 9,6 s) | celui qui orchestre | 7 min |
| 7. Reprises des plans faibles, par l'agent qui les a montés (`SendMessage` : il garde son contexte) — depuis le 27/10 : un `retoucheur` neuf par fichier, en une vague après le `qa` du brouillon (voir plus bas) | 5 agents | 3 à 5 min · 13 à 23 k chacun (chiffre du travail ajouté : au L04, 0,46 M par reprise) |
| 8. Brouillon (8 min 42 de calcul), `qa`, reprises des images parasites | celui qui orchestre + 4 agents | 16 min · 63 k |
| 9. Rendu final, `qa`, miniature, `srt` | celui qui orchestre | 17 min |

**Total du pilote : ≈ 2 h 45 de bout en bout (2 h 13 chronométrées de l'architecte à la miniature, plus ≈ 35 min de kit 16:9) et 4,91 M de jetons d'agents** (21 agents ou reprises : décors et intégration 2,56 M, chapitres 2,35 M), sur une voix déjà faite. Jauge : la fenêtre de 5 h de 32 à ≥ 39 % avant sa remise à zéro, puis de 1 à 35 % — ≈ 45 points en tout ; hebdo 56 → 65 % (**+9 points**). Rendu final : `check` sans erreur (31/31 contrastes), voix calée à 0 ms, −14,03 LUFS, **aucune image parasite** (le mouvement le plus heurté : 465,0 s, le témoin de l'essai).

## Ce qui a raté, et la règle qui en sort

- **Des images vides** à la première relecture (un petit objet dans un grand cadre sombre : la tour d'essai en plan large, le témoin dans un coin, le document de 1902, la découpe) : la consigne des chapitres avait la règle, pas le chiffre. Écrire dans `docs/<ep>-actes.md`, pour chaque plan, **la part du cadre que tient le sujet**, et préférer le gros plan quand un décor est fait de traits fins.
- **Des murs orange** : un verre plat et chaud vu de près remplit la moitié du cadre d'un aplat. Le verre chaud se montre plus large, avec la machine qui le situe et sa lueur sur la hotte ; et **le signal est réservé au verre au-dessus de ≈ 450 °C** (l'autoclave à 140 °C teintait tout son tambour : corrigé dans `usine.js`).
- **Une plaque blanche sur le ruban** : le verre plat comme un miroir renvoie le panneau froid du studio (`stage.js · studioEnvironment`) quand on le regarde en rasant vers +x/−z (az ≈ −30 à −70). Sur le verre chaud : az ≥ −15 ou ≈ −86, el hors de 22–32 — ou baisser le poids de ce panneau dans le shader du ruban (`verre.js`).
- **Les images parasites du brouillon** (72, en six endroits) avaient quatre causes, toutes déjà écrites dans CLAUDE.md pour les courts : deux tweens du même nombre qui se chevauchent à une coupe (la pluie de grains remise à 0 par la coupe suivante) ; un motif rayé (rouleaux, planches, conduits) traversé vite ; un plan de durée négative qui chevauche le suivant ; la caméra qui quitte un voile (une hotte de verre) en plein plan. **À mettre dans la consigne de chaque chapitre** : aucun `shot` de durée ≤ 0, aucun nombre dont deux tweens se chevauchent, rouleaux et rayures longés lentement ou coupés.
- **Le premier plan choisi tôt** : la planche de six candidates tirée par l'intégration, choisie avant les chapitres, a fait que la fin a bouclé juste du premier coup. À garder.
- **Les reprises par `SendMessage` coûtent 13 à 23 k** au lieu de 300 k pour un agent neuf : c'est la bonne façon de corriger. — **Démenti par les mesures suivantes (27/10)** : au L03 (une vingtaine de reprises) et au L04 (neuf reprises, 4,3 M), chaque reprise a coûté 0,35 à 0,46 M, parce qu'un agent repris relit tout son contexte (≈ 0,4 M) à chaque appel ; les 13 à 23 k du L01 ne comptaient que le travail ajouté. Depuis : les retouches d'après brouillon passent à un agent neuf du type `retoucheur` (le fichier, le journal de l'agent d'origine, la liste fermée des défauts), en une seule vague après le `qa` ; `SendMessage` sert à reprendre un agent coupé par la limite, ou pour une question d'une ligne. Détail et chiffres : `docs/chaine-optimisee.md`.

## Pour le L02 : ce qui doit coûter moins, sans rien céder

1. **Pas d'étape 0** : le kit 16:9 existe (−45 min).
2. **Les décors partent des kits, réglés autrement** : le four, la cuve, le tapis, les portiques, la salle, la tour sont là — un long ne modélise que **son objet** et **ses machines propres** (pour l'airbag : le métier à tisser, la découpe laser, la couture, le pliage, le générateur). Attendu : 3 décors au lieu de 5, ≈ −0,7 M. Jamais un bloc posé tel quel : la consigne de chaque décor dit quels réglages changent son allure.
3. **L'intégration se fond dans l'architecte** : les décors écrivent leurs « À changer ailleurs » dans leur journal, l'architecte (repris par `SendMessage`, il a le contexte) les applique et tire la planche des candidates (−270 k).
4. **Six groupes de chapitres au lieu de sept** si le film le permet, avec la règle du cadre chiffrée et les règles anti-parasites dès la consigne : moins de reprises.
5. **Un seul brouillon** : il a suffi ici ; le rendu final se lance dès que les reprises des images parasites sont rentrées.

Cible du L02, à mesurer : **≈ 2 h et ≈ 3,5 M de jetons d'agents**, ≈ 35 points de fenêtre et ≈ +6 d'hebdo. Deux longs par semaine tiennent alors dans l'hebdo avec les courts ; trois demandent que les courts de la semaine reprennent leurs décors.

## Les transitions : des plans qui se suivent et collent l'un à l'autre (Merwan, 16/10)

Après avoir vu le L01 en entier : « très bien pour un épisode 1 et pilote », mais « pour les futurs il faut des transitions vraiment qui se suivent et qui collent les unes aux autres, sinon ça rend pas bien » — certaines coupes du L01 cassent le rythme. Le L01 reste tel quel ; à partir du L02 :

- **Une coupe est un raccord, jamais un saut** : sur la même forme (le bord du verre d'un plan devient le bord du verre du suivant), sur le même objet à la même place de l'écran (comme le raccord décor → établi des courts), ou sur le mouvement (la caméra garde sa direction et sa vitesse de part et d'autre de la coupe).
- **On ne coupe pas pendant que la caméra freine ou repart** : soit le mouvement continue à travers la coupe, soit la coupe tombe sur un temps fort de la voix ou du son.
- **Entre deux lieux** (usine → labo → établi → voiture), un passage qui se voit : un fouet flou de mouvement des deux côtés de la coupe, ou une plongée dans un détail qui devient le détail du lieu suivant.
- **Au plan de mise en scène** (`docs/<ep>-actes.md`), chaque coupe écrit son raccord (forme, objet, mouvement) ; un groupe de chapitres rend à son voisin la pose ET le mouvement en cours.
- **À construire dans le kit avant le L02** : un fondu de quelques images sur les coupes de lieu à lieu (le plateau connaît les coupes : `stage.cut`), et une aide `D.match(at, from, to)` qui pose une coupe en raccord de mouvement.

## La miniature (refaite le 16/10 : la première faisait « vraiment amateur »)

La première version (la tête de verre contre la toile, vue de l'intérieur, grise sur noir) ne donnait pas envie de cliquer : à 160 px, une boule floue et des fissures en cheveux. Ce qui marche mieux :

- **un objet PLEIN, éclairé, au tiers droit** — au L01, la masse de 10 kg orange qui fend le pare-brise, la toile blanche qui rayonne autour ; jamais un personnage de verre, jamais un décor aux rayons X seul ;
- **la forme de l'objet qui traverse le cadre** (la courbe du pare-brise en diagonale) plutôt qu'un objet posé au centre ;
- **deux ou trois mots énormes** (300 px sur 1080, contour sombre), le dernier dans la couleur du sens (signal = la menace, veille = ce qui sauve), et **un cartouche-fait** au-dessus (« TEST · 10 KG ») plutôt que le numéro de dossier, qui ne dit rien à un inconnu ;
- **plus de contraste que le film** : `thumb.grade` (`{ contrast: 1.32, saturation: 1.15 }`) ;
- **trois miniatures pour le test de YouTube** (il en fait tourner jusqu'à trois) : `thumb`, `thumb2`, `thumb3` → `npm run cover -- <ep>`, `--alt 2`, `--alt 3` → `<dossier>-miniature.png`, `-miniature-2.png`, `-miniature-3.png`. Trois objets différents, trois phrases différentes, le même ton (au L01 : la masse de 10 kg « IL DOIT CASSER », la bille d'acier « ÇA NE PASSE PAS », le pare-brise étoilé « PAS FAIT POUR TENIR »).

On cherche l'image sur une planche `look --bare` de six angles autour de l'instant le plus fort du film, avant d'écrire le texte.

## Le titre (16/10 : « il fait autant le travail » que la miniature)

- **Le titre et la miniature se complètent, ils ne se répètent pas** : la miniature montre un instant (au L01 : la casse), le titre promet le chemin (« du sable au test de casse »). Le premier titre du L01 redisait « il DOIT casser », déjà écrit en énorme sur la miniature : deux fois la même information, une place perdue.
- Il doit aller avec les TROIS miniatures de la rotation : il ne parle donc d'aucune en particulier.
- Le mot que les gens cherchent en tête (« Comment c'est fait : », l'objet), l'essentiel dans les 60 premiers caractères (au-delà, le téléphone coupe), aucune majuscule criée, aucune promesse que le film ne tient pas.
- Deux titres de rechange dans `post.youtube.titleAlts` (un paradoxe court, une version « comment on fabrique ») pour le test ; la raison du choix dans `titleNote`.
- Retenu au L01 après une recherche (16/10) : **« Comment on fabrique un pare-brise (et pourquoi il casse) »** — la requête telle qu'on la tape, en tête ; la parenthèse est la QUESTION dont la miniature donne l'affirmation (« IL DOIT CASSER ») : c'est la paire qui ouvre une boucle, pas une répétition. Les données propres à notre créneau (CTR, suggestions de recherche) n'existent pas encore : c'est le test A/B de YouTube Studio et les chiffres du L01 qui trancheront pour la série.
- **Corrigé le même jour par Merwan : « pas assez accrocheur, beaucoup trop niche ; il faut limite du putaclic, mais qui reste fidèle ».** Le titre ne décrit pas la vidéo, il donne le fait le plus incroyable qu'elle prouve, en une phrase courte (≈ 45 à 55 caractères), au plus un mot en capitales. Retenu : **« S'il ne casse pas, ton pare-brise est refusé »** ; pour le test : « On lâche 10 kg sur ton pare-brise. Il DOIT casser » et « Ton pare-brise est fait de sable (et on le frappe exprès) ». Le mot de recherche (« comment on fabrique ») va dans la description, pas en tête du titre. Fidèle veut dire : chaque mot est vrai dans le film (ici, l'essai de la tête du R43).
- **Puis, plus choc encore (sa demande, « vrai titre YouTube »)** : **« Moins d'1 mm entre ta tête et la route »** — l'enjeu (ta tête), un chiffre qui intrigue, aucun mot technique ; pour le test : « Ton pare-brise DOIT casser pour te sauver la vie » et « On lâche une tête de 10 kg sur ton pare-brise ».
- **Et plus long** (« là c'est vraiment court ») : l'accroche d'abord, puis « : » et la promesse avec le mot cherché — **« Moins d'1 mm entre ta tête et la route : comment on fabrique ton pare-brise »** (75 caractères). Ce qui doit tenir si le téléphone coupe vers 60 caractères, c'est l'accroche, pas le mot-clé.

### Ce que le L02 ajoute (21/10)

- **Le titre ne redit pas une miniature, aucune des trois** : « Coupée, mais encore mortelle : les 5 gestes… » répète « COUPÉE ET MORTELLE » et « 5 GESTES ». `npm run script` compare le titre à `thumb`, `thumb2`, `thumb3`.
- **Le mot cherché est un mot qu'on tape**, vérifié dans l'autocomplétion de YouTube (voir « L'écriture d'un long », 1) : « consignation haute tension » plutôt que « les 5 gestes ». Il se déclare dans `post.youtube.keyword` ; `npm run script` le cherche dans les titres et les 160 premiers caractères de la description.
- **Le test A/B de YouTube Studio** (« Tester et comparer », sur ordinateur, fonctions avancées activées) fait tourner jusqu'à trois titres, trois miniatures ou trois paires, de quelques jours à deux semaines, et garde **celle qui donne le plus de durée de visionnage, pas le meilleur taux de clic** (aide YouTube, « A/B test titles & thumbnails ») : une promesse que les 30 premières secondes ne tiennent pas y perd. On teste des paires titre + miniature qui se complètent, avec l'emballage en ligne comme témoin.
- **Les deux premières lignes de la description** (≈ 150 caractères, ce que montre la recherche) : le mot cherché dans une phrase qui donne envie, puis l'accroche ; les chapitres ensuite, puis les sources.
