# 049 · Le GPS — le plan de mise en scène

**La voix est enregistrée** (une prise, turbo, **94,9 s**) : le minutage est RÉEL, les secondes ci-dessous servent à te repérer. Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, vérifiés mot à mot sur la table de `npm run script -- 049` ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — jamais un nombre en dur. Les actes sont des squelettes qui construisent : à réécrire en entier. Le contrat : `src/world.js` (`FIRST`, `VIEW`, `BENCHED`, `STAGED`), `src/plan.js` (repère de la voiture : nez −z, gauche −x ; az 0 derrière, −90 à gauche). `VIEW` est réglé sur bouchons : pars des poses rendues dans les journaux des décors (`docs/journal/049-route.md`, `049-model.md`, `049-satellite.md`).

**La scène** (scénario, `sources` le dit) : de nuit, route de campagne inconnue, 70 km/h (jamais dit), un carrefour en T à cinq secondes. Ton point bleu est dans le champ : le quartz du téléphone retarde d'un millionième (une démonstration, assumée). Trois signaux, trois sphères **toutes rétrécies du même cran** (`err` le fait seul) qui se croisent dans le champ ; un quatrième signal, le téléphone corrige son heure, les quatre se croisent sur l'asphalte. Personne n'est blessé, la voiture passe le carrefour.

**À ne pas dire, ni montrer** (faits + contre-vérification) : le saut du point coté « 300 m » (on cote « un millionième = 300 mètres de lumière ») ; quatre sphères déjà concourantes avant la correction ; « 11 km d'erreur de position » (seulement un trait de lumière de 11 km) ; un téléphone qui émet vers le satellite (aucune flèche montante, sauf la flèche barrée du like) ; « les horloges de satellites battent plus vite » comme fait (elles sont **réglées** plus lentes : leur battement réglé paraît juste au sol) ; une carte qui insiste (« jamais de carte ») ; une marque, un logo, un nom de lieu sur le panneau.

## Le haut commun (tout acte le respecte)

**L'en-tête** (`main.js`, tu ne l'écris jamais) : en grand **T−`eta`** (secondes avant le carrefour : 6,0 à l'image 0, **5,0 sur « cinq »** 13,58, gelé sur l'établi, 0 au carrefour ; signal sous 1 s) — tu bouges `eta`, la route défile avec. Second compteur **« Retard »** = `err` en secondes (« 0,000 001 S » signal / « 0 S » veille) — tu bouges `err`, le point bleu (écran et sol), les sphères et l'en-tête suivent. `err` 0 → 1 sur « saute » (0,84) ; il reste 1 jusqu'à « Les quatre se resserrent » (61,80).

**La grille de rétention** (`docs/recette-actes.md`) : 0 → 0,5 s l'image bouge par son sujet (le point qui glisse, la route qui défile, les phares) ; 10 → 25 s **une deuxième accroche**, un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; portes d'acte = une coupe franche ou un changement d'échelle. Relance toutes les 8 à 12 s.

**Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe, jamais sur l'image 0) : champ 1,48 · lentes 9,08 · champ 15,42 · atomique 29,72 · distance 39,72 · fausse 48,40 · champ 55,40 · heure 60,52 · pas 66,70 · panneaux 83,10. Sous-titres : `D.captionStyle({ hit: 0.25 })` une fois (acte 1).

**« Alors… on l'ouvre. »** seul dans son plan : la coupe vers l'établi tombe à `tobench` (19,64, juste avant « Alors » 19,76), le téléphone entier sur son halo, le fil de lumière qui monte au satellite ; **l'éclaté s'ouvre sur « on »** (`explode`, 20,67). Rien d'autre ne bouge dans ce plan ; aucune étiquette.

**La boucle** : la dernière image (« Et pendant qu'elle chauffe… », 93,27 → 94,16) est la première : `D.loop` ramène `POSE0` et `FIRST` (`err` 0, `eta` 6, `mood` 1). « Ton point bleu saute » relance le film.

**Anti-parasites** : une coupe se pose quelques images AVANT sa phrase ; plus d'un quart de tour en une seconde = une coupe ; mouvements longs en `sine.inOut`, plongées et reculs par rapport (`shot(at, durée, pose, ease, fromD)`) ; ce que la caméra frôle est invisible ; une seule étiquette à la fois en zone haute (436–790) ; tout panneau a fini de sortir avant la coupe ; les sphères vues de dedans : leur coque s'efface, le cercle au sol reste. Les compteurs `qBeat`, `beatSat`, `beatGnd` se tweenent en `"none"` (linéaires) : leur fraction est la pulsation ; un battement par seconde environ, jamais plus de deux.

**Le plan-séquence (`D.path`) n'est pas la règle ici** (pilote du 038 seul) : `shot` et `cut` comme d'habitude, mais aucune plage fixe de plus de 2 s.

**Étiquettes déjà dans `index.html`** (une à la fois, `chip(id, anchor|null, dx, dy, from, to)`) : `chip-micro` (Décalage · 0,000 001 seconde), `chip-orbite` / `chip-sol` (les deux horloges), `chip-300` (Un millionième de seconde · 300 mètres de lumière), `chip-trajet` (Trajet du signal · ≈ 7 centièmes de seconde), `chip-38` (Sans réglage · par jour · +38 millionièmes), `chip-11` (De lumière · 11 kilomètres), `#retitle` (Ton point bleu vient · D'une carte → D'une horloge), `#duel` (Toi, tu suis… · Le point bleu / Les panneaux), `#next` (050 · « Elle ne chauffe pas : elle fait chauffer la casserole. »). Les pièces se nomment avec `co.add` (Puce de réception, Antenne, Oscillateur, Horloge atomique, Quartz).

## acte1.js

**01 MENACE, 0 → `tobench` 19,64.** Sans coupe à 0 (part de `POSE0`, `FIRST`). Deux coupes au plus. Le sujet : le téléphone, puis le ciel, puis la route.

| Phrase (instants) | Ce qu'on voit | Part du cadre |
| --- | --- | --- |
| « Ton point bleu saute dans un *champ*. » 0,26 → 1,80 | POSE0 : sous le téléphone dans son support, la route qui file par le pare-brise. Le point glisse hors de la route dès l'image 1 (`err` 0 → 0,25 sur 0 → 0,84), puis **saute** dans le champ sur « saute » (0,84, `err` → 1 en 0,4 s). Punch sur « champ ». | téléphone 40 % de la largeur ; satellite petit en haut |
| « Il a suffi d'un millionième de +seconde+. » 2,24 → 4,04 | `chip-micro` s'allume sur « millionième » (3,00). La caméra remonte lentement le long du téléphone vers le haut du pare-brise. | téléphone 35 % |
| « Ton téléphone n'envoie rien aux satellites : il écoute des +horloges+, là-haut. » 4,51 → 8,20 | On monte du téléphone vers le ciel (`VIEW.up`) : `rings` 1, les anneaux descendent du satellite jusqu'à la voiture ; rien ne remonte. Sur « horloges » (7,00), on arrive au satellite (`satSky`), `satGlass` → 1 : l'horloge pleine qui bat dans le caisson. | satellite 40 % ; anneaux jusqu'au toit de la voiture |
| « Et on les règle trop *lentes*… exprès. » 8,28 → 10,44 | `twin` 1 : l'horloge au sol (`ink`) à côté ; sur « lentes » (9,08) `beatSat` ralentit d'un cran sous `beatGnd` ; `chip-orbite` / `chip-sol` (à côté de chaque horloge, le temps de la phrase). Punch sur « lentes ». | les deux horloges 50 % |
| « De nuit, route inconnue. » 10,88 → 12,58 | **Coupe** (≈ 10,75) : la plongée sur la route (`plunge`) — ta voiture, ses phares, la route qui défile. | voiture 25 %, route en diagonale |
| « Un carrefour, dans cinq secondes. » 12,63 → 14,50 | Le T apparaît devant ; `eta` arrive à **5,0 sur « cinq »** (13,58), puis décompte lentement (×`SLOWMO` 4 : ≈ 4,6 à `tobench`). | carrefour et voiture dans le cadre |
| « Ton point bleu est dans le *champ*. » 14,58 → 15,86 | `dot` 1 : le point bleu posé au sol dans le champ, `ditch` 1 : le fossé signal entre lui et la route. Punch sur « champ ». | voiture et point, le fossé entre |
| « À gauche… ou à droite ? » 15,94 → 17,14 | `branchL` sur « gauche » (16,06), puis `branchR` sur « droite » (16,90) — la gauche s'éteint quand la droite s'allume. | carrefour 40 % |
| « Tout se joue dans ton +téléphone+. » 17,70 → 18,90 | On plonge par le pare-brise sur le téléphone dans son support (`VIEW.phone`) : la fin du plan, l'écran et son point dans le champ. | téléphone 40 % |

**Couture de sortie** : à `tobench` 19,64, `eta` ≈ 4,6, `err` 1, le téléphone cadré de trois quarts (`VIEW.phone`) — l'acte 2 coupe sur le même téléphone, sur l'établi.

## acte2.js

**02 AUTOPSIE, `tobench` 19,64 → `tozero` 49,03** (11 phrases : un fichier). L'établi, puis une coupe vers le ciel pour le repos.

| Phrase (instants) | Ce qu'on voit | Part du cadre |
| --- | --- | --- |
| « Alors… on l'ouvre. » 19,76 → 21,12 | `cut(tobench, SET.BENCH, VIEW.bench, { ...BENCHED, eta, err })` : le téléphone entier, plein, sur son halo, le fil de lumière qui monte vers le satellite au-dessus. **`explode` sur « on »** (20,67). Rien d'autre. | téléphone 35 % |
| « Dans ton téléphone, une puce et son antenne. » 22,15 → 24,32 | L'éclaté en rangée (`exploded`) ; sur « puce » (23,28) on serre la puce (`chip`, `litChip` 1), l'antenne s'allume sur « antenne » (23,96). `co.add` les deux, dans un cadre. | puce 30 % |
| « Elle écoute à vingt mille kilomètres : un satellite. » 24,60 → 26,88 | On remonte le fil de lumière (`thread`, de `threadFoot` à `threadTop`) jusqu'au satellite, entier, plein (`satBench`) sur « satellite » (26,40). | satellite 45 % |
| « Son oscillateur… et au cœur, une horloge +atomique+. » 27,36 → 30,08 | `satExplode` sur « oscillateur » (27,52) ; sur « cœur » (28,64) `core` 1 : l'horloge seule sur son halo (`heart`), elle bat (`beatSat`). Punch sur « atomique ». | horloge 35 % |
| « Pourquoi ça marche ? Chaque satellite dit l'heure. » 30,81 → 33,32 | Le principe **sur la pièce même** : l'horloge marque l'heure, un anneau part du réseau d'antennes (`travel` démarre) ; recul vers `thread` (le fil entier, satellite en haut, téléphone en bas). `core` retombe, le satellite revient entier. | fil sur toute la hauteur |
| « Son signal file à la vitesse de la lumière : trois cents mètres par millionième de seconde. » 33,72 → 37,88 | `ruler` 1 : une graduation par « 300 mètres » ; l'anneau descend le fil et allume chaque graduation (`travel` linéaire). `chip-300` sur « mètres » (36,28). | fil 70 % de la hauteur |
| « Le temps du trajet… donne la +distance+. » 38,32 → 40,20 | L'anneau arrive au téléphone (`travel` 1 sur « trajet » 38,68) ; `chip-trajet` ; sur « distance » (39,72) `distance` 1 : les graduations se fondent en un trait. Punch sur « distance ». | fil et téléphone |
| « Au-dessus de toi, presque toujours quatre satellites, ou plus. » 40,67 → 43,56 | **Coupe** (≈ 40,55) vers le ciel, `STAGED` : vue haute (`high`), `sats` 1 → 4 sur « quatre » (42,20), `others` 1 sur « ou plus » ; la constellation glisse lentement. | les quatre satellites et la voiture |
| « Chaque distance trace une sphère. » 43,92 → 45,48 | `spheres` 0 → 4, une par une, sur « trace » (44,68) ; on lit leurs cercles au sol autour de la voiture. Garde `err` 1 (vue de haut, les 9 m ne se lisent pas) ou passe-le à 0 pour l'idéal : ton choix, mais **remets 1 avant `tozero`** sans qu'on le voie. | sphères 80 % |
| « Mais ton téléphone n'a qu'une horloge à quartz… et elle est *fausse*. » 45,92 → 48,68 | On plonge dans le téléphone : **dans la voiture** (`quartzCar`, `peek` 1, le chemin le plus court) ou coupe à l'établi (`quartzBench`) ; le quartz vert bat (`qBeat`), puis tremble ; **rouge sur « fausse »** (48,40, `quartz` 1, `tremble` 1). Punch sur « fausse ». | quartz 30 % |

**Couture d'entrée** : `BENCHED` garde `eta` (≈ 4,6) et `err` 1. **Couture de sortie** : à `tozero` 49,03, `quartz` 1, `err` 1 ; l'acte 3 coupe sur la route.

## acte3.js

**03 RÉPONSE, `tozero` 49,03 → `toverdict` 64,58.** En coupes, un plan par souffle. Le chrono reprend : `eta` ≈ 4,6 → 0 sur l'acte (×`SLOWMO`), la voiture arrive au carrefour.

| Phrase (instants) | Ce qu'on voit | Part du cadre |
| --- | --- | --- |
| « Le carrefour. » 49,15 → 49,72 | **Coupe** à `tozero` : derrière la voiture (`chase`), le T devant, `mood` 1, `ditch` 1, `dot` 1. | carrefour 40 % |
| « Trois signaux. » 50,04 → 50,68 | Coupe vers le ciel : `w1`, `w2`, `w3` descendent ensemble (0 → 1 en ≈ 1,2 s), `sats` 3. | satellites et anneaux |
| « Trois sphères. » 51,00 → 51,64 | `spheres` 3 en `climax` : trois cercles au sol, signal (`err` 1). | cercles 80 % |
| « Ton téléphone retarde d'un millionième. » 51,96 → 53,80 | Le téléphone (`quartzCar`, `peek` 1) : le quartz rouge qui tremble ; l'en-tête dit 0,000 001 S. | quartz 30 % |
| « Elles se croisent… dans le *champ*. » 54,15 → 55,56 | `climax` : les trois cercles se coupent en un point, dans le champ, de l'autre côté du fossé ; le point bleu y est. Punch sur « champ ». | croisement au centre |
| « Un quatrième signal. Une quatrième sphère. » 56,16 → 58,56 | `w4` descend (56,32 → 57,4), `sats` 4 ; `spheres` 4 sur « sphère » (58,16) : le quatrième cercle **manque** le point du champ. | les quatre cercles |
| « Ton téléphone corrige sa propre *heure*. » 58,96 → 60,64 | `quartzCar` : le quartz se recale, `quartz` 0, `tremble` 0, il repasse au vert sur « heure » (60,52). Punch sur « heure ». | quartz 30 % |
| « Les quatre se +resserrent+. » 61,12 → 62,16 | **Le moment fort, sans coupe dessus** : `climax`, la caméra déjà en mouvement ; `err` 1 → 0 sur `trigger` (61,75, ≈ 0,5 s) : les quatre cercles se rejoignent en un seul point sur l'asphalte, signal → veille ; `jolt` léger ; son à `snap` (62,22). `mood` → 0 là, pas avant. | cercles 80 % |
| « Ton point bleu revient sur la route. » 62,56 → 64,00 | Le point est sur la route (`dot` 1, `ditch` 0), la voiture passe le carrefour (`eta` → 0 puis au-delà ; `yaw` pour tourner si tu veux) ; on redescend vers la voiture. | voiture 30 % |

**Coutures** : entrée `{ ...STAGED, eta: ≈4.6, err: 1, dot: 1, ditch: 1, quartz: 1 }` ; sortie à `toverdict` : `err` 0, `mood` 0, `eta` 0.

## fin.js

**`toverdict` 64,58 → 94,93.** L'ordre : chute → ce qui est dû et le commentaire → like → prochain dossier → boucle.

| Phrase (instants) | Ce qu'on voit | Part du cadre |
| --- | --- | --- |
| « Voilà son secret : ton point bleu ne vient *pas* d'une carte. Il vient d'une +horloge+. » 64,70 → 68,62 | **Coupe** au cadre de l'accroche (le téléphone vu de dessous, POSE0 un peu plus près) : `#retitle` ; sur « pas » (66,70) `strike` 1 sur la carte de l'écran puis `map` 0 ; `D.verdict` ; sur « horloge » (68,14) il ne reste que l'heure en millionièmes et le point sur la route. | téléphone 40 % |
| « Où tu es… c'est une question d'heure. » 68,97 → 70,70 | Même plan, l'heure défile ; recul lent. Le titre sort avant `tocta`. | téléphone 35 % |
| « Et ces horloges trop lentes ? Einstein. Là-haut, le temps passe plus vite : sans réglage, trente-huit millionièmes d'avance par jour. » 71,65 → 78,38 | **Coupe** (`tocta`) : les deux horloges côte à côte (`clocks`, `twin` 1) ; sur « vite » (75,42) `beatSat` passe devant `beatGnd` ; `chip-38` sur « d'avance » (77,62). | horloges 50 % |
| « Onze kilomètres de lumière. » 78,78 → 79,98 | Coupe sur la route : `streak` 0 → 1, le trait de lumière file dans la nuit ; `chip-11`. **Jamais** « erreur de position ». | trait sur toute la profondeur |
| « En commentaire : toi… le point bleu, ou les panneaux ? » 80,37 → 83,34 | `duelCall` (A sur « point » 82,14, B sur « panneaux » 83,10) ; à l'image, le panneau dans les phares (`sign` 1, `VIEW.sign`) puis l'écran et son point. Le film ne répond pas. | panneau 30 % |
| « Like : pour celui qui croit que son téléphone parle aux satellites. » 84,04 → 86,92 | Le téléphone et le satellite : les anneaux ne descendent que dans un sens ; une flèche montante tentée, barrée (si `satellite.js` la fournit ; sinon les anneaux seuls). `likeCall`. | téléphone + ciel |
| « Abonne-toi : prochain dossier, la plaque à induction. Elle ne chauffe pas : elle fait chauffer la casserole. » 87,37 → 92,60 | `nextFile` (050, son fait) ; orbite lente autour du téléphone sur l'établi, rien du sujet ne revient. | panneau en zone haute |
| « Et pendant qu'elle chauffe… » 93,27 → 94,16 | **Coupe** à `toloop` vers le cadre d'ouverture, `D.loop` (`rewind` 93,84) : la dernière image est la première. | = POSE0 |

## La première image — quatre candidates

Notées sur les six points (`docs/recette-agents.md`) **sur bouchons** (planches `.cache/planches/049/architecte/p1.jpg`, `p2.jpg`) : à retirer sur les vrais décors. Le fichier prêt pour `npm run look -- 049 --file .cache/planches/049/premiere-image.json --out .cache/planches/049/premiere-image.jpg --cols 4`.

| | Candidate | 1 événement | 2 basse | 3 menace derrière | 4 forme 40 % | 5 système là | 6 bouge par le sujet | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A** | **Sous le téléphone** (POSE0) : le téléphone vu de dessous dans son support, l'écran où le point glisse, la route et le carrefour par le pare-brise, le satellite en haut | ✓ le point saute | ✓ | ~ le champ et son fossé derrière (à vérifier) | ✓ | ✓ si le satellite tient en haut | ✓ point + route qui défile | **5/6 — recommandée** |
| B | Depuis le champ : au ras des sillons, la voiture qui arrive phares allumés, le point bleu posé dans le champ devant elle, les anneaux qui tombent | ✓ | ✓ | ✓ le point et le fossé signal | ~ la voiture (pas le téléphone) | ~ anneaux | ✓ la voiture | 4/6 |
| C | Par-dessus le satellite : le satellite de dos, énorme au premier plan, ses anneaux qui plongent vers la voiture minuscule et le point dans le champ | ✓ | ✗ plongée | ✓ | ✓ vu d'où on ne le voit jamais | ✓ | ✓ anneaux | 5/6 (sans la perspective basse) |
| D | Par-dessus ton épaule : le téléphone sur la planche de bord, le volant, la route devant | ✓ | ✗ | ~ | ✓ | ✗ pas de satellite | ~ route | 3/6 |

```json
[
 {"at":0.9,"label":"A sous le telephone","pose":{"tx":6,"ty":104,"tz":-66,"d":40,"az":22,"el":-8,"fov":48,"shift":110,"side":0,"roll":0,"drift":0,"dof":0},"state":{"err":0.6,"eta":5.9}},
 {"at":0.9,"label":"B depuis le champ","pose":{"tx":300,"ty":60,"tz":-150,"d":1200,"az":150,"el":-3,"fov":44,"shift":200,"side":0,"roll":0,"drift":0,"dof":0},"state":{"err":1,"eta":5.9,"dot":1,"ditch":1,"rings":1}},
 {"at":0.9,"label":"C par-dessus le satellite","pose":{"tx":0,"ty":50,"tz":0,"d":6180,"az":149.6,"el":47.4,"fov":34,"shift":0,"side":0,"roll":0,"drift":0,"dof":0},"state":{"err":1,"eta":5.9,"dot":1,"ditch":1,"rings":1}},
 {"at":0.9,"label":"D par-dessus l'epaule","pose":{"tx":6,"ty":106,"tz":-66,"d":55,"az":-20.6,"el":10.5,"fov":44,"shift":160,"side":0,"roll":0,"drift":0,"dof":0},"state":{"err":0.6,"eta":5.9}}
]
```

Ce que la planche des vrais décors doit trancher : pour A, que la route, le fossé signal et le satellite se lisent derrière l'écran (sinon C, qui coche tout sauf la perspective basse). Si C sort, l'accroche commence dans le ciel et l'acte 1 redescend vers le téléphone sur « Ton téléphone n'envoie rien » : à réécrire dans la section `acte1.js`.
