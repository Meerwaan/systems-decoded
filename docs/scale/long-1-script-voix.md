# Scale YouTube (longs) — 1. Script et voix

Rapport du 2026-10-21 (agent 1 sur 3 : script et voix des longs). Demande de Merwan : « maintenant je veux que tu fasses pareil avec des agents pour les formats longs ». Ce qui suit : le diagnostic des deux longs en ligne, la recette (`docs/recette-long.md`, « L'écriture d'un long »), ce qui peut encore changer sur le L01 et le L02 sans les republier, trois sujets pour le L03. **Aucun crédit dépensé, aucune commande `npm run` sur L01 ni L02** (lus en texte ; les contrôles d'écriture lancés en lecture, par node), rien d'écrit dans leurs fichiers. Aucun chiffre YouTube des longs n'est encore dans `metrics/` : tout ce qui suit est tiré des scripts et des voix, à confirmer sur les courbes (§ 1.7 dit où les lire).

## En bref

- **Les deux longs tiennent la promesse de leur titre avant 15 s** (L01 : « ta tête », « moins d'un millimètre », « il devra casser » ; L02 : « coupée », « te tuer », « cinq gestes… en vie »). Pas toujours celle des miniatures : la nacelle du L02 (« SANS COUPER ») n'arrive qu'à 3:34.
- **Le L01 finit six chapitres sur douze à plat** (« Dans le sable. », « Deux, feuilleté. », « Et chaque vitrage est inspecté. »…) ; le L02, relu chapitre par chapitre avant la voix, un sur dix. C'est l'écart le plus net entre les deux scripts.
- **Les promesses de l'accroche restent 5 à 6 minutes sans rappel** (la vitre de côté du L01 : 5:36 ; l'ordre des pinces du L02 : 6:17) : la règle « une phrase par tiers rappelle le test » n'est tenue dans aucun des deux.
- **Deux coupures pub sur six tombent après une phrase qui ferme** (L01 6:39, L02 4:10), à quelques secondes d'une meilleure relance : elles se déplacent dans YouTube Studio, sans rien republier (L01 → 6:44,8 ; L02 → 4:35,2).
- **Le climax est freiné par des chiffres** : 42 mots de normes optiques entre « on va essayer de le détruire » et le premier coup, une petite bille à cinq chiffres après la grosse (L01) ; « Dans les simulations des ingénieurs… » au milieu de l'incident (L02).
- **Les deux finissent par un chapitre « Ce qu'il faut retenir »** (L01 : « Résumons. ») : le signal classique pour partir. À lire en premier sur les courbes (7:48, 7:53).
- **Les appels à l'action sont bien amenés** depuis la réécriture du L01 ; il reste le débit : le L01 dit son marquage et son commentaire 25 et 32 % plus vite que le reste du film.
- **La voix H2** : 1,3 dt d'une phrase à l'autre dans les deux films, « on l'ouvre » à 1,30 s dans les deux ; le climax du L02 ne monte pas (+0,3 dt) parce que deux de ses six phrases sont en `[serious]` (−0,5 et −0,6) ; celui du L01, sans `[serious]`, est le chapitre le plus haut (+1,7).
- **La recherche** (autocomplétion de YouTube, 21/10) : « comment est fabriqué le verre », « verre feuilleté ou verre trempé », « consignation haute tension », « ligne haute tension hélicoptère » — aucun n'est dans les titres en ligne. Titres, descriptions et chapitres prêts à coller au § 3.
- **L03, premier choix : le pneu** (« comment est fabriqué un pneu » est une requête de l'autocomplétion). Puis le casque de moto, puis le tunnel sous la Manche.

## 1. Diagnostic

### 1.1 Les 30 premières secondes, contre le titre et les miniatures

Instants mesurés sur la voix montée (`gen/episode.data.js`).

| | L01 « Moins d'1 mm entre ta tête et la route : comment on fabrique ton pare-brise » | L02 « Coupée, mais encore mortelle : les 5 gestes qui te gardent en vie à 400 000 volts » |
| --- | --- | --- |
| 0 → 10 s | « Ta tête part dans le pare-brise. Il *casse*… exactement comme prévu. » (0,3-4,2 s) · « Il est fait de sable. Et entre ses deux verres, un film de moins d'un millimètre va t'empêcher de passer au travers. » (4,6-10,0) | « Quatre cent mille volts. La ligne est *coupée*. Le détecteur dit : rien. Et pourtant… si tu la touches, elle peut encore te tuer. » (0,3-7,8) · « …tu as cinq gestes… le dernier… c'est lui qui te garde en vie. » (8,3-15,4) |
| 10 → 30 s | le C (« ta vitre de côté ne l'a peut-être pas », payé à 5:46 puis 8:06) ; le défi (« pour réussir cet essai… il devra casser », payé à 7:26) | le C (« Un soir de 1987, un apprenti est mort… Le bon ordre… tu l'auras à la fin », payé à 8:17) ; le défi (« sa voisine reste sous tension ») ; **l'abonnement à 0:31** (demandé par Merwan) |
| Titre tenu | « ta tête » 0,4 s · « moins d'un millimètre » ≈ 8 s · « fabriquer » ≈ 18 s ✓ | « coupée » ≈ 2 s · « te tuer » ≈ 7 s · « cinq gestes » ≈ 10 s ✓ |
| Miniatures tenues | 1 « IL DOIT CASSER » : 2 s et 24 s ✓ · 2 « ÇA NE PASSE PAS » : « passer au travers », ≈ 9 s ✓ · 3 « PAS FAIT POUR TENIR » : « il casse… comme prévu », 2 s ✓ | 1 « COUPÉE ET MORTELLE » : mots ≈ 2-7 s ✓, mais l'arc qu'elle montre n'arrive qu'à 2:13 · 2 « 5 GESTES POUR VIVRE » ≈ 10 s ✓ · **3 « SANS COUPER » (la nacelle) : 3:34 ✗** |
| « on l'ouvre » | 0:27, après 86 mots | 0:37, après 131 mots (dont 23 pour l'abonnement) |
| De trop | « On y reviendra. » (0:16) : une phrase de méta | — |

**Conclusion** : les deux accroches font leur travail. La miniature 3 du L02 promet ce que le film ne dit qu'à 3:34 : à sortir de la rotation (à l'agent 2 de trancher, c'est son fichier ; la règle est dans la recette : une miniature dont la promesse n'est pas dite avant 30 s sort du test).

### 1.2 Les fins de chapitre

La carte que `npm run script` dessine désormais pour un long (calculée en lecture, par node, sans `npm run` sur ces épisodes) :

```
L01  0:00  Introduction             suspension « Et pour réussir cet essai… il devra casser. »
     0:27  On l'ouvre               À PLAT     « Dans le sable. »
     0:48  Le four                  menace     « Des deux côtés. » (« Le problème : …parfaitement *plate*. »)
     1:15  Le bain d'étain          suspension « S'il casse… il fait des lames. »
     2:14  L'étenderie              suspension « …il va falloir la découper… l'imprimer… et la plier. »
     2:40  Découpe et bande noire   À PLAT     « Deux, feuilleté. »
     3:11  Le bombage               suspension « Si tu veux voir ça… abonne-toi, on y arrive. »
     3:36  La salle blanche         (faible)   « …pour le pé-vé-bé… celui de ton pare-brise. »
     4:57  L'autoclave              À PLAT     « Et chaque vitrage est inspecté. »
     5:26  Sur la route             À PLAT     « Sinon, c'est tout le pare-brise qu'on change. »
     5:46  Le verre trempé          À PLAT     « …du sulfure de nickel, resté dans le verre. »   ← puis une coupure pub
     6:41  Le test                  À PLAT     « …pas moins de quarante. »                       ← puis « Résumons. »
L02  0:00  Introduction             relance    « Abonne-toi, et monte avec moi : on va les voir, un par un. »
     0:37  On l'ouvre               relance    « Tu vas vite comprendre pourquoi. »
     0:48  Le poste                 question   « Et l'autre… que va-t-elle faire à la tienne ? »
     2:07  Le disjoncteur           menace     « Il faudrait pouvoir voir la coupure. »
     3:29  Sans couper              menace     « En cinq gestes : les cinq opérations de la consignation. »
     4:11  Séparer                  suspension « Mais un sectionneur… ça se referme. »
     4:36  Condamner, identifier    promesse   « Abonne-toi : ce qu'il rate, on te le montre juste après. »
     5:37  Vérifier                 question   « Alors ta ligne… est-elle vraiment morte ? »
     6:07  Mettre à la terre        menace     « Tu commences à travailler. » (« …sa voisine reste *sous tension*. »)
     7:10  L'incident               À PLAT     « À peine un claquement sec, quelque part dans le poste. » (le relâchement, voulu)
```

Le L02 a été relu par neuf relecteurs (un par chapitre) avec la consigne « le chapitre finit sur une relance » : ça se voit. C'est maintenant une règle de la recette et un contrôle de `npm run script`.

### 1.3 Ce qui reste ouvert juste avant chaque coupure pub

| Film | Coupure (script) | La phrase d'avant | Fils ouverts | Verdict |
| --- | --- | --- | --- | --- |
| L01 | 2:13,2 | « Mais attention : ce verre-là ne protège encore de *rien*. S'il casse… il fait des lames. » | le test, la vitre de côté, « comment va-t-il protéger ? » | bonne |
| L01 | 4:17,2 | « Il colle une étiquette dessus. Le range. Et n'y prête plus attention… pendant six ans. » | « et après six ans ? », le test, la vitre | la meilleure : payée 0,5 s après la pub (« En 1909… ») |
| L01 | 6:39,7 | « …La faute à un grain minuscule, du sulfure de nickel, resté dans le verre. » | le test, la vitre — mais la phrase ferme | **à déplacer à 6:44,8**, après « Ton pare-brise est fini. Maintenant… on va essayer de le *détruire*. » |
| L02 | 2:06,6 | « …Et l'autre… que va-t-elle faire à la tienne ? » | la voisine, la pince de 1987 | bonne |
| L02 | 4:10,3 | « …il faut encore la rendre *sûre*. En cinq gestes : les cinq opérations de la consignation. » | la voisine, 1987 — mais la phrase annonce un plan | **à déplacer à 4:35,2**, après « Mais un sectionneur… ça se referme. » (91 s avant la suivante) |
| L02 | 6:06,2 | « Alors ta ligne… est-elle vraiment morte ? » | la tension induite, 1987 | bonne |

Les instants sont ceux du script ; on ne sait pas où elles sont réellement dans YouTube Studio (rien dans le dépôt ne les a écrites pour Merwan). Si YouTube les a placées tout seul, il a pu couper une phrase.

**Les fils, déclarés à la main sur une copie temporaire des deux scripts** (`"fil"` / `"paie"`, la carte de `npm run script`) :

```
L01  test     ouvert 0:00 (accroche) → rappel 0:16 (défi) → 3:29 (seuil) → 5:12 (« au test, c'est lui qui va tout encaisser ») → 6:41 → payé 7:26
     vitre    ouvert 0:10 (curiosité) → rappel 5:46 (verre trempé) → payé 8:06
     tampon   ouvert 0:29 → payé 3:00          six-ans  ouvert 4:12 → payé 4:17 (de part et d'autre de la pub)
L02  détecteur ouvert 0:00 (accroche) → rappel 5:27 (seuil) → 5:57 → payé 6:17
     ordre    ouvert 0:15 (1987) → rappel 6:32 (« d'abord côté terre ») → payé 8:33
     voisine  ouvert 0:23 → rappel 1:55 → 5:21 → 7:00 → payé 7:32
     maillage ouvert 0:39 → payé 1:28          voir     ouvert 3:18 → payé 4:19
```

Les promesses de l'accroche restent longtemps sans rappel : **5:36 pour la vitre de côté du L01, 6:17 pour l'ordre des pinces du L02, 5:27 pour le détecteur** ; le test du L01, 3:13 (de 0:16 à 3:29). La règle de Merwan (« au moins une phrase par tiers du film rappelle le test qui vient ») n'est tenue dans aucun des deux : c'est maintenant un contrôle.

### 1.4 Les appels à l'action

| | L01 | L02 |
| --- | --- | --- |
| Abonnement | seuil 3:29 (39 % du film), né de la phrase d'avant (« il faut glisser quelque chose » → « Ce quelque chose, c'est lui qui va prendre le choc, tout à l'heure. Si tu veux voir ça… abonne-toi, on y arrive. ») | 0:31, avant « on l'ouvre » (demandé par Merwan) + seuil 5:27 (60 %), né de la phrase d'avant, 31 mots |
| Commentaire | 8:29 : une lecture à faire chez soi (le marquage de la vitre conducteur) — le type de question qui a le plus fait commenter sur TikTok | 8:45 : deux publics (l'habilité : le geste le plus dur à tenir ; l'autre : celui qu'il aurait oublié) |
| Like | 8:35 : un partage avec sa raison (« quelqu'un qui garde un brise-vitre dans sa boîte à gants ») | 8:54 : un partage à un électricien (« il te dira ce qui manque ») — qui appelle aussi les commentaires |
| Rendez-vous | « On se retrouve très vite, dans une autre usine… » ✓ | « …dans un autre endroit où tu n'entres jamais. » ✓ |
| Débit (`audio/vo.json`, médiane du film 16,9 et 17,2 l/s) | **marquage 21,2 (+25 %), commentaire 22,4 (+32 %)** — les deux phrases les plus rapides du film ; like +12 %, rendez-vous +11 % | commentaire −2 %, like +5 %, rendez-vous +5 % |

La remarque de Merwan sur le premier enregistrement du L01 (« trop brut ») a été réglée à la réécriture : les appels à l'action naissent tous de la phrase d'avant. Ce qui reste : **le débit des appels à l'action du L01**, et une seule question à camp unique (L01 : « ce qui est écrit sur ta vitre » — une réponse d'un mot serait « trempée… ou feuilletée ? »).

### 1.5 Ce qui peut sauter

Phrase lue sans l'autre : l'histoire n'y perd rien. Au total ≈ 75 s dans le L01 et ≈ 50 s dans le L02 — qui ne se coupent pas sur des films en ligne, mais disent où le L03 doit mettre mieux (un long ne descend pas sous 8 min : les coupures pub).

| Film | Phrases | Durée | Pourquoi |
| --- | --- | --- | --- |
| L01 | « On y reviendra. » (`defi`) | 0,8 s | un méta dans les 30 premières secondes |
| L01 | `premier`, `anglais`, `loi` (4:25-4:48 : le brevet de 1902, English Triplex, la loi anglaise) | 21 s | une digression qui n'ouvre ni ne paie de fil ; le flacon de Bénédictus, lui, en est une bonne |
| L01 | `yeux` (5:18) | 7 s | un catalogue (capteur de pluie, support de caméra) qui ferme le chapitre |
| L01 | le chapitre « Sur la route » (5:26-5:45) | 19 s | utile, mais aucun fil : il casse la montée vers le test (à garder s'il finit sur « Et ta vitre de côté ? ») |
| L01 | `optique` (6:45-6:57) | 12 s | des normes juste après « on va essayer de le détruire » : à placer avant |
| L01 | `froid` (7:10-7:21) | 10 s | cinq chiffres ; la petite bille après la grosse redescend |
| L01 | `temoin` (7:41-7:47) | 6 s | après « Rien ne passe. », un anticlimax ; il irait au chapitre du verre trempé |
| L01 | `recap` (« Résumons… », 7:49-8:01) | 12 s | le signal de fin, juste avant la chute |
| L02 | `reseau` (0:54-1:02) | 8 s | du contexte (2 900 postes, 100 000 km) |
| L02 | `histoire` (2:51-3:04) | 13 s → 3 | 1956, 5 000 A, 115 kV, six chambres : une phrase suffit (« Ce combat contre l'arc dure depuis 1956. ») |
| L02 | `climat`, `vide` (3:04-3:17) | 13 s | de la culture générale, hors du fil ; à garder seulement si Merwan y tient (c'est un `[amused]` réussi) |
| L02 | `tst4` (3:54-4:00) | 6 s | une statistique de RTE |
| L02 | `chiffre` (7:23-7:31) | 8 s | « Dans les simulations des ingénieurs… » au milieu de l'incident : dans la réponse due, ou dans les sources |

### 1.6 La voix

| | L01 | L02 |
| --- | --- | --- |
| Requêtes | 13, de 369 à 1 705 caractères | 10, de 489 à 1 737 |
| Facturé | 2 405 crédits (5 468 annoncés) | 2 514 (5 714) |
| D'une phrase à l'autre | 1,27 dt, 0,94 dB | 1,30 dt, 0,97 dB |
| « on l'ouvre » | 1,3 s, 11,8 l/s | 1,3 s, 10,1 l/s, −4,2 dt |
| Chapitre le plus haut | « Le test » +1,71 dt — le climax monte | « Sans couper » +2,12 ; « L'incident » +0,34 — le climax ne monte pas |
| La phrase la plus haute | « Dernière étape. On le frappe. » +6,9 (reprise seule) | « …on ne la coupe pas du tout » `[amused]` +3,4 |
| `[amused]` | 4 (essais, bande, prêt, surprise) | 4 (gravier, climat, tst1, malt5) |

- **« Même ton partout »** est le verdict que `npm run voice` calcule sur les actes d'un court ; sur un long il ne veut rien dire, et l'oreille de Merwan a tranché (H2 : « masterclass »). Ce qui se mesure utilement sur un long : le débit des appels à l'action, « on l'ouvre », et le registre du chapitre du test.
- **`[serious]` fait descendre Eric** : au L02, les deux phrases `[serious]` de l'incident sortent à −0,5 et −0,6 dt pendant que `[curious]` y monte à +2,8 ; le banc du 025 l'avait mesuré (2,3 dt sous `[tense]`, mêmes mots). Au test : `[curious]` et `[conversational, curious]`.
- **Le L01 dit son « promesse » en `[firm, matter-of-fact]`** (l'accroche vient de l'essai) : la balise que la recette H2 a retirée (« trop formel »). Rien à reprendre, c'est en ligne.

### 1.7 Quand les courbes arriveront : où les lire

À demander dans YouTube Studio pour chaque long (en plus de ce que l'orchestrateur demande déjà) : la courbe de fidélisation entière, avec la valeur au survol aux instants ci-dessous ; les « Moments clés » (Intro : la part encore là à 0:30) ; dans « Portée », les sources de trafic (Recherche YouTube, Vidéos suggérées, Parcourir, Shorts) et **la carte « Termes de recherche YouTube »** (ce que les gens ont tapé pour arriver : c'est elle qui dira si « comment on fabrique le verre » vaut mieux que « pare-brise ») ; et l'endroit réel des coupures pub.

| Instant L01 | Ce qui s'y passe | Instant L02 | Ce qui s'y passe |
| --- | --- | --- | --- |
| 0:30 | fin de l'introduction (Intro) | 0:30 | fin de l'introduction (Intro) |
| 0:16 | « On y reviendra… » | **0:31-0:37** | **l'abonnement demandé tôt : à comparer au L01 à la même seconde** |
| 0:27 | « on l'ouvre » | 0:37 | « on l'ouvre » |
| 2:13 | coupure pub 1 | 2:06 | coupure pub 1 |
| 3:29 | seuil (abonnement) | 2:51-3:17 | 1956, le climat (26 s sans fil) |
| 3:49-4:56 | l'histoire de Bénédictus (67 s) ; coupure pub 2 à 4:17 | 3:28 | « Sans couper » (la miniature 3) |
| 4:25-4:48 | 1902, English Triplex, la loi (21 s qui peuvent sauter) | 4:10 | coupure pub 2 (après une phrase qui ferme) |
| 5:25 | « Sur la route » | 5:27 | seuil (deuxième demande d'abonnement) |
| 6:39 | coupure pub 3 (après une phrase qui ferme) | 6:06 | coupure pub 3 |
| 6:41-6:57 | « on va essayer de le détruire » puis 12 s de normes | 7:09 | « L'incident » (le climax) |
| **7:48** | **carte « Ce qu'il faut retenir », « Résumons »** | **7:53** | **carte « Ce qu'il faut retenir »** |
| 8:01 | chute | 8:09 | chute |
| 8:23-8:35 | marquage et commentaire (dits vite) | 8:17 | Virginie, 1987 (la réponse promise à 0:22) |
| 8:35 → 8:51 | like, rendez-vous, boucle, écran de fin | 8:45 → 9:10 | commentaire, like, rendez-vous, boucle |

La méthode est celle des courts (`docs/scale/1-script-voix.md`) : la part restante au début et à la fin de chaque phrase, la perte par seconde de chaque phrase, et la comparaison des deux films à la même seconde là où l'un fait ce que l'autre ne fait pas (l'abonnement à 0:31, le « Résumons »).

## 2. La recette

- **`docs/recette-long.md`** : un lien vers `docs/recette-long-image.md` et `docs/recette-long-retention.md` (agents 2 et 3) en tête ; une section « L'écriture d'un long » (ce que disent les deux premiers longs ; l'emballage s'écrit avec l'accroche ; les 30 premières secondes ; les chapitres ; les fils ; les coupures pub ; le test ; la fin dans l'ordre ; les appels à l'action ; le budget ; la voix ; la chaîne d'écriture) ; et « Ce que le L02 ajoute » au titre (le titre ne redit pas une miniature ; le mot qu'on tape ; le test A/B juge à la durée de visionnage ; les deux premières lignes). Les sections de production, des transitions et de la miniature sont intactes.
- **`kit/template-long/episode.json`** : un squelette qui porte la recette (21 phrases, 6 chapitres, une coupure pub après une question, le seuil né de la phrase d'avant, la fin dans l'ordre, les fils `test` et `du`, les repères `titre` et `miniature`, `post.youtube.keyword`, les balises H2, `voice.parts` sur les débuts de chapitre). `etape1`, `etape2`, `ouvre`, `boucle` et les repères que lisent `src/` et `sfx` sont gardés. **Vérifié** : un long neuf tiré du modèle (fait dans le dossier temporaire, pas dans `episodes/`) construit et passe `check` (0 erreur de lint, 37/37 contrastes, « Check passed »), deux fois — la seconde avec les `src/` du modèle tels que l'agent 2 les modifie (`LOOK`) ; `npm run script` n'y voit qu'un avertissement : le budget de mots d'un squelette.
- **`scripts/lib/ecriture.mjs`** : les contrôles d'un long (`Lnn`), à côté de ceux des courts, inchangés (vérifié : 025 → les mêmes 3 avertissements, 026 → aucun, HS01 → ignoré). Le budget (1 550 à 1 950 mots, 8 min 10 avec la voix) ; la promesse du titre et de la miniature avant 30 s (repères `titre`, `miniature`) ; la 2ᵉ personne et la première phrase ; aucun sommaire dans la première minute ; « on l'ouvre » une fois, `[calm]`, avant 1:00 ; 110 mots au plus avant elle ; chaque chapitre finit sur une relance (question, menace, promesse, suspension) ; aucun titre de chapitre « à retenir » ni « Résumons » ; YouTube et ses chapitres de 10 s ; les coupures pub (après une phrase qui laisse une question, 90 s d'écart, ni avant 1:30 ni dans la dernière minute, un fil ouvert) ; les fils (`fil` / `paie` : ouverts et payés, rappelés au moins une fois par tiers du film, celui de l'accroche payé après la chute) ; l'abonnement (une fois, au seuil, entre 25 et 65 %, jamais en commençant par « Abonne-toi ») ; l'ordre de la fin ; un rendez-vous sans sujet ni date ; les appels à l'action au pas du film (+20 % au plus) ; 40 mots et deux chiffres au plus par phrase ; les balises H2 (interdites : `[firm, matter-of-fact]`, `[thoughtful]` et celles des courts ; `[tense]` à l'accroche, `[calm]` à « on l'ouvre » et à la boucle, `[amused]` quatre fois) ; `voice.parts` (des débuts de chapitre, 2 500 caractères par requête au plus, 10 000 sans parties) ; l'emballage (titre de 40 à 100 caractères, un mot en capitales au plus, aucun mot répété d'une miniature, le mot cherché dans un titre et dans les 160 premiers caractères de la description, deux variantes, cinq hashtags, aucune annonce de sujet). Et, avant les avertissements, **la carte** : les chapitres et comment chacun finit, les coupures pub à poser à la main (au dixième de seconde, dans le silence après la phrase), les requêtes de la voix, les fils.
- **`scripts/sd.mjs`** (partie `script`) : dans la table, la carte de chaque chapitre (`── titre ──`) et « ⏸ pub » en face de la phrase après laquelle tombe une coupure ; rien ne change pour un court.
- **Lancés en lecture** : L01, 20 avertissements (les repères `titre` et `miniature` absents, les six fins à plat, « Ce qu'il faut retenir », « Résumons », la coupure de 6:39, aucun fil déclaré, trois appels à l'action trop rapides, deux phrases à trois chiffres et plus, une de 42 mots, `[firm, matter-of-fact]`, pas de mot cherché) ; L02, 15 (le titre qui redit deux miniatures, la coupure de 4:10, l'abonnement à 0:31, 131 mots avant « on l'ouvre », « L'incident » à plat, « Ce qu'il faut retenir », RTE en capitales…).

## 3. L01 et L02 : ce qui peut encore changer sans les republier

Rien n'a été écrit dans leurs `episode.json` ni dans `scripts/posts.mjs`. Tout se colle dans YouTube Studio, à la main, par Merwan.

### L01 — le pare-brise

**Titres, pour le test A/B** (jusqu'à trois paires titre + miniature ; YouTube garde celle qui donne le plus de durée de visionnage) :

| | Titre | Miniature | Ce que la paire mesure |
| --- | --- | --- | --- |
| **Principal** | **Moins d'1 mm entre ta tête et la route : comment on fabrique le verre de ton pare-brise** (87 car.) | 1 « IL DOIT CASSER » | la même accroche, avec la requête qu'on tape le plus (« comment est fabriqué le verre ») |
| Témoin | Moins d'1 mm entre ta tête et la route : comment on fabrique ton pare-brise (75, en ligne) | 1 « IL DOIT CASSER » | — |
| Variante | Ton pare-brise est fait de sable : comment on fabrique le verre qui te sauve (76) | 2 « ÇA NE PASSE PAS » | une autre accroche (le paradoxe du sable) |

**Description** (les deux premières lignes sont celles que montre la recherche) :

```
Comment on fabrique le verre de ton pare-brise, du sable fondu à 1 500 °C jusqu'au test où on lâche dessus une tête de 10 kg… et pourquoi il doit casser.
Verre feuilleté ou verre trempé ? Et la vitre à viser le jour où il faut sortir de ta voiture.

Chapitres
00:00 Ta tête dans le pare-brise
00:26 Les 3 couches d'un pare-brise
00:47 Comment on fabrique le verre : le four à 1 500 °C
01:14 Le verre flotté, sur un bain d'étain
02:13 L'étenderie : refroidir sans casser
02:39 La bande noire (ce n'est pas de la déco)
03:10 Le bombage : courbé par son propre poids
03:35 Le film PVB, et le flacon de 1903
04:56 L'autoclave
05:25 Impact de gravillon : réparer ou changer ?
05:45 Verre trempé ou verre feuilleté ?
06:40 Le test : on le frappe exprès
07:48 La vitre à viser pour sortir de ta voiture

Sources : brochure Saint-Gobain Sekurit (étapes de fabrication) · Pilkington (verre flotté) · règlement ONU n° 43 (essais d'homologation) · Société chimique de France (Édouard Bénédictus) · AAA, 2019 (brise-vitres).

Fabriqué pour te sauver : comment on fabrique les objets qui te protègent. Abonne-toi : on se retrouve très vite, dans une autre usine.

Le coin de ta vitre conducteur : il est écrit quoi ?
```

Les instants des chapitres sont ceux d'aujourd'hui (les cartes du film gardent leurs anciens titres : ce n'est pas un problème, YouTube lit la description). Le dernier chapitre ne dit plus « Ce qu'il faut retenir » mais le fil qu'il paie (la vitre de côté, ouverte à 0:10). Hashtags inchangés.

**Coupures pub** (Studio → Monétisation → coupures publicitaires, posées à la main) : **2:13,2 · 4:17,2 · 6:44,8** (la troisième déplacée de 6:39,7 : juste après « Maintenant… on va essayer de le détruire. »).

### L02 — le poste haute tension

**Titres, pour le test A/B** :

| | Titre | Miniature | Ce que la paire mesure |
| --- | --- | --- | --- |
| **Principal** | **Le détecteur dit « rien »… et la ligne peut encore te tuer : la consignation haute tension** (90 car. ; l'accroche tient dans les 60 premiers) | 1 « COUPÉE ET MORTELLE » (l'arc) | le piège du film + la requête qu'on tape ; le titre ne redit plus la miniature |
| Témoin | Coupée, mais encore mortelle : les 5 gestes qui te gardent en vie à 400 000 volts (81, en ligne) | 1 | — |
| Variante | Pour te protéger, on fabrique un court-circuit : la consignation haute tension (77) | 2 « 5 GESTES POUR VIVRE » (les pinces : c'est le court-circuit fait exprès) | le paradoxe du film |

La miniature 3 (la nacelle, « SANS COUPER ») sort du test : sa promesse arrive à 3:34.

**Description** :

```
Consignation haute tension : les 5 étapes qui te gardent en vie sur une ligne de 400 000 volts coupée… mais encore mortelle.
Dans un poste électrique : l'arc du disjoncteur au SF6, une ligne réparée sous tension depuis un hélicoptère, et la tension induite que le détecteur ne voit pas.

Chapitres
00:00 Une ligne coupée… encore mortelle
00:36 Dans un poste électrique haute tension
00:48 Champ électrique, tension de pas, tension de toucher
02:07 Le disjoncteur SF6 et son arc électrique
03:28 Réparer une ligne haute tension en hélicoptère, sans couper
04:10 Consignation, étape 1 : séparer
04:35 Étapes 2 et 3 : condamner, identifier
05:36 Étape 4 : la VAT (et ce qu'elle ne voit pas)
06:06 Étape 5 : mise à la terre et en court-circuit
07:09 L'incident : la tension induite
07:53 1987 : la pince défaite dans le mauvais ordre

Sources : INRS, brochure ED 6109 « Consignations et déconsignations » · Code du travail, articles R4544-1 à R4544-11 · RTE (réseau, travaux sous tension en hélicoptère, juillet 2025) · NIOSH, rapport FACE 87-42 · CIGRE, simulations de tensions induites sur lignes à double circuit · Westinghouse (premier disjoncteur haute tension au SF6, 1956).

Système Décodé : on ouvre les systèmes qui te protègent. Abonne-toi : on se retrouve très vite, dans un autre endroit où tu n'entres jamais.

Toi qui es habilité : lequel de ces cinq gestes est le plus dur à tenir, un soir de fatigue ?
```

Le dernier chapitre paie le fil de l'accroche (« Le bon ordre… tu l'auras à la fin ») au lieu d'annoncer la fin. Aucun mot de « série » ni d'« Accès interdit ». Hashtags inchangés.

**Coupures pub** : **2:06,6 · 4:35,2 · 6:06,2** (la deuxième déplacée de 4:10,3 : juste après « Mais un sectionneur… ça se referme. »).

## 4. Le prochain long (L03) : trois sujets, classés

Aucun fait n'a été cherché (la consigne : rien avant le oui de Merwan) : les chiffres des accroches sont des angles, à vérifier à la recherche. Les requêtes viennent de l'autocomplétion de YouTube (21/10, `hl=fr`, `gl=fr`).

### 1. Le pneu — premier choix

- **Accroche** : « Quatre surfaces grandes comme une carte postale te retiennent à la route… et elles devraient être blanches. » (le caoutchouc naturel est clair ; c'est le noir de carbone qui le rend noir et résistant — à vérifier). Titre possible : « Ton pneu devrait être blanc : comment est fabriqué un pneu ».
- **Le mot que les gens tapent** : « comment est fabriqué un pneu » — la requête exacte sort dans l'autocomplétion ; et « fabrication pneu michelin ».
- **Pourquoi il tiendra 9 minutes** : la chaîne la plus visuelle des trois (le mélange de caoutchouc, de noir de carbone et de soufre ; l'extrusion de la bande de roulement ; les nappes d'acier ; la confection sur tambour ; la cuisson sous presse, où le pneu « cru » prend ses sculptures ; le contrôle ; le test à grande vitesse et l'aquaplaning), trois histoires qui s'emboîtent (Goodyear et son poêle, Dunlop et le tricycle de son fils, Michelin et le radial — une invention française), une menace à chaque étape (une bulle, une nappe décalée, un pneu sous-gonflé qui chauffe) et une lecture à faire chez soi pour le commentaire : les quatre chiffres de la date sur le flanc, ou le témoin d'usure. C'est l'objet que tout le monde a (quatre par voiture), comme les frites ou le Kinder chez « Je T'explique Comment ».
- **Ce qu'il réutilise** : le kit d'usine du L01 (fours et tunnel, tapis, portiques, banc d'essai, poinçon), la voiture, la roue, le frein et la route mouillée du 014 (`014/src/model.js`, `street.js`), la voiture du 025. À modéliser : ses machines (mélangeur, extrudeuse, tambour, presse de cuisson) et le pneu en coupe, sa pièce maîtresse.
- **Le risque** : un deuxième long « voiture » après le pare-brise.

### 2. Le casque de moto

- **Accroche** : « Ta tête frappe le bitume. Ce qui te sauve, c'est du polystyrène… et il ne servira qu'une fois. »
- **Mot tapé** : « fabrication casque moto » (une seule suggestion : moins cherché).
- **Pourquoi 9 minutes** : la coque (injectée ou en couches de fibres), le calotin en billes de polystyrène gonflées à la vapeur, l'écran, la jugulaire, l'homologation (chocs sur enclumes, choc oblique) ; l'histoire de Lawrence d'Arabie, mort à moto en 1935, et du neurochirurgien qui en a tiré le casque des estafettes (à vérifier) ; la leçon : un casque qui a pris un choc est mort, même intact.
- **Ce qu'il réutilise** : la tour de chute et la tête d'essai du L01 (`kit/lib/postes.js` : c'est l'essai du casque), le personnage de verre (`kit/lib/figure.js`), la route du 014. Le plus « Fabriqué pour te sauver » des trois ; le public le plus étroit (les motards).

### 3. Le tunnel sous la Manche (un lieu où tu n'entres jamais, comme le L02)

- **Accroche** : « Un camion brûle dans un train, sous la mer. Et tout le monde en sort vivant. » (l'incendie de 2008 : à vérifier)
- **Mot tapé** : « tunnel sous la manche » (« construction », « documentaire », « c'est pas sorcier » dans l'autocomplétion : une demande de documentaire).
- **Pourquoi 9 minutes** : trois tunnels, pas deux — celui du milieu, où personne ne va, est le refuge ; les rameaux qui les relient, l'air poussé pour que la fumée n'y entre pas, les stations d'extinction, la navette, le centre de contrôle ; l'incendie, minute par minute.
- **Ce qu'il réutilise** : le TGV du 021 (`train.js`), le feu du 012 (`fire.js`), le camion du 014. Le plus cher en 3D (les tubes, les rameaux) et en faits.

## 5. Ce que Merwan tranche (oui / non)

1. **Le sujet du L03 : le pneu** — oui / non. (Un non : le casque de moto.) Rien n'est cherché ni écrit avant son oui.
2. **L01 et L02 : mettre en ligne les titres en test A/B, les descriptions et les chapitres du § 3, et poser les coupures pub à la main** (L01 : la 3ᵉ à 6:44,8 ; L02 : la 2ᵉ à 4:35,2) — oui / non. Les titres, c'est nous qui les avons tranchés (sa délégation du 15/10) ; il n'a qu'à les coller dans YouTube Studio, sans rien republier.
3. **Pour le script du L03 : un seul relecteur pour tout le film au lieu de neuf** (L02 : 1,7 M de jetons ; `npm run script` compte maintenant les fins à plat, les chiffres, les balises et les coupures pub) — oui / non.

## 6. À ajouter à CLAUDE.md (l'orchestrateur l'intègre)

Dans « Le format long (YouTube) », après « Le squelette d'un long, de A à Z » :

> **L'écriture d'un long (depuis le 21/10)** : `docs/recette-long.md`, « L'écriture d'un long », à lire avant d'écrire un script long ; `npm run script -- Lnn` en vérifie l'écriture (`scripts/lib/ecriture.mjs`, des avertissements) et dessine sa carte : chaque chapitre et comment il finit (« À PLAT » s'il ferme), les coupures pub à poser **à la main** dans YouTube Studio (au dixième de seconde), les requêtes de la voix, les fils. Ce qu'elle tire des L01 et L02 (des pistes : aucune courbe YouTube lue) : la promesse du titre et des miniatures dite avant 30 s (repères `titre`, `miniature`) ; le mot que les gens tapent, relevé dans l'autocomplétion de YouTube (`post.youtube.keyword`), après les deux points du titre et dans les deux premières lignes de la description ; chaque chapitre finit sur une question, une menace, une promesse ou « … » (le L01 en finissait six sur douze à plat, le L02 relu une sur dix) ; les fils se déclarent (`"fil"`, `"paie"`) et chaque coupure pub tombe après une phrase qui laisse une question en l'air ; ni chiffres ni précautions au milieu du test ; jamais « Résumons » ni de chapitre « Ce qu'il faut retenir » ; les appels à l'action au pas du film (L01 : commentaire +32 %) ; 1 650 à 1 850 mots, jamais sous 1 550 (8 min : les coupures pub) ; au test, pas de `[serious]` (elle fait descendre Eric : −0,5 dt à l'incident du L02, quand `[curious]` y monte à +2,8) ; `[firm, matter-of-fact]` et `[thoughtful]` interdites. Le titre ne redit pas les mots d'une miniature (L02 : « Coupée, mais encore mortelle » et « COUPÉE ET MORTELLE »). Le test A/B de YouTube Studio garde la variante qui donne le plus de durée de visionnage, pas le meilleur taux de clic : une miniature dont la promesse n'est pas dite avant 30 s sort de la rotation (L02 : la nacelle, 3:34). Diagnostic : `docs/scale/long-1-script-voix.md`.

Dans les entrées L01 et L02 :

> **21/10** : titres en test A/B, descriptions (le mot qu'on tape en tête : « comment on fabrique le verre », « consignation haute tension ») et chapitres réécrits pour la recherche, prêts à coller (`docs/scale/long-1-script-voix.md`, § 3) ; coupures pub à poser à la main — L01 : 2:13,2 · 4:17,2 · 6:44,8 ; L02 : 2:06,6 · 4:35,2 · 6:06,2.

## 7. Pour des fichiers qui ne sont pas les miens

- **`scripts/srt.mjs` et `scripts/lib/episode.mjs`** (facultatif) : un champ `chapYT` sur un beat, le titre du chapitre dans la description quand il doit différer de la carte du film (« On l'ouvre » à l'écran, « Les 3 couches d'un pare-brise » dans la recherche) — `schedule()` le recopie comme `chap`, `srt.mjs` lit `b.chapYT ?? b.chap`.
- **`scripts/voice.mjs`** : rien. Son verdict « même ton partout » n'a pas de sens sur un long ; il pourrait ne pas l'afficher pour un `Lnn` (la carte de `npm run script` donne ce qui compte).
- **Agent 2 (miniatures)** : la miniature 3 du L02 (la nacelle) promet ce que le film ne dit qu'à 3:34 ; les paires titre + miniature du § 3 supposent les miniatures en ligne — si elles changent, garder la règle : le titre ne redit pas les mots de sa miniature.

## Fichiers

Écrits ou modifiés : `docs/recette-long.md`, `kit/template-long/episode.json`, `scripts/lib/ecriture.mjs`, `scripts/sd.mjs` (partie `script`), `docs/scale/long-1-script-voix.md`. Non touchés : les épisodes publiés (L01, L02, HS01, HS02, les courts), CLAUDE.md, `scripts/posts.mjs`, `front/`, `metrics/`, `renders/`. Le long d'essai qui a servi à vérifier le modèle a été construit dans le dossier temporaire de la session, jamais dans `episodes/`.
