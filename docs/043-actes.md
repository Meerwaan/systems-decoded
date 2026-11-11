# 043 · Le faisceau du CERN — le plan des actes

Voix enregistrée (`eleven_v4`, 90,87 s) : tous les instants ci-dessous sont les vrais (`npm run script -- 043`). Contrat : `src/world.js` (`FIRST`, `VIEW`, `STAGED`, `BENCHED`, `LIGHT`), `src/plan.js` (`BEAM`, `S6`). Lire ce haut, puis **sa** section.

## Ce qui vaut pour tous les actes

**La caméra en plan-séquence** (comme 038 à 042, `docs/recette-actes.md` → « Le plan-séquence ») : un `D.path` par lieu, une clé par idée (1 à 3 s d'écart), chaque clé change d'angle de 6 à 15° ; **az décroît toujours** dans un trajet ; `from`/`to` `"go"` ; une coupe n'est pas un arrêt ; le moment fort (l'éjection) se voit **sans coupe dessus**. Fin : coupe sur `POSE0` tourné de +12° puis `D.loop` **sans `fromD`** (le `fromD` a rendu noire la fin du 041).

**Les lieux, un seul monde** (maquette, aucune cote affichée) : le grain à l'origine (le train y va vers −x : az ≈ −90 le voit arriver) ; le point 6 un quart d'anneau en amont (`PLACES.kick`, 45 m) ; la ligne part vers +z et finit sur le bloc (`PLACES.face`), visible au fond du premier plan. Passer d'un lieu à l'autre est une **coupe** (ou un recul par rapport, `fromD`, quand la caméra suit quelque chose qui part : l'alerte, le flot).

**Le train se pilote par `gap`** (cm, ease `"none"`) : sa vitesse est d(gap)/dt. Allures : accroche 900 cm/s · le paquet héros 60 · le recul 1 500 · repos 300 (« calme ») · le retour au grain 900 · le trou qui arrive 610. `gap` = −477 (= −`BEAM.gap`/2) : le front du trou touche les aimants ; **+477 : son dos les quitte — la seule valeur où l'on tire** (`kick`), puis on tient `gap` et l'on court `dump` 0 → 1 (ease `"none"`). Ne jamais téléporter `gap` dans un plan (le train sauterait) ; on peut le poser librement sur une coupe.

**La grille** (`docs/recette-actes.md`) : 0 → 0,5 s l'image bouge **par son sujet** (le train file, le grain tombe : le 042 n'avait que 1,7 sur la première demi-seconde) ; 10 → 25 s un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; « Alors… on l'ouvre » seul dans son plan, quasi-silence (`suck`, `hush` déjà posés), **l'éclaté s'ouvre sur « on » (20,44)** ; la boucle : la dernière image est la première.

**Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe, jamais à moins d'une seconde l'un de l'autre) : train 1,72 · gagné 8,96 · abîmer 14,18 · sortie 18,10 · bloc 28,88 · lâcherait 33,44 · vingt 38,12 · parois 47,64 · seuil 50,28 · trou 53,16 · s'allument 55,56 (+ `jolt` 0,9) · dedans 61,04 · tient 64,44 · pas 67,42 · étale 69,74 · assez 78,30. `D.captionStyle({ hit: 0.25 })` dans `acte1.js`.

**Les sons sont posés** (`episode.json` → `sfx`, 46, tous dans les souffles, vérifiés mot à mot) : un acte n'en ajoute pas ; s'il en manque un, ligne exacte dans « À changer ailleurs ».

**L'en-tête** (`main.js`, rien à faire dans les actes, mais l'état doit le servir) : chrono en µs autour de l'instant où les aimants s'allument — T−900 → T−880 (accroche), T−900 → T−860 (scène), tenu T−860 atténué (autopsie), T−300 « Retour au grain » → T−210 « seuil » → T−200 « part » → T−8 « trou » → T−3 « passe » → T+0 « s'allument » → **T+89 « dedans »** (veille), tenu. Le compteur « Paquets » : ≈ 2 500, se vide avec `dump` → **`dump` doit valoir 1 avant « dedans » (61,04)** ; de `tocta` à la boucle, « Arrêts · grains » lit `grains` (0 → 37 dans le plan du commentaire, puis 37 tenu).

**Étiquettes** (`index.html`) : `#chip-grain` (signal, « Un grain de poussière »), `#chip-sortie` (veille, « Seule issue · La sortie de secours »), `#chip-bloc` (veille, « Le bloc · Graphite »). L'éclaté nomme par `co.add` sans chiffre ni unité : « Capteurs de pertes », « Aimants d'éjection », « Ligne d'extraction », « Aimants de dilution ». Une étiquette à la fois en zone haute ; pendant un mouvement, place fixe (`follow(id, null, 96, 470)`).

**Ce que l'image ne dit pas** (faits § 10 et contre-vérification) : sur un point la plaque **s'abîme et se fissure**, jamais un trou percé ; le « e » tient **dans** la face (jamais plus large) ; le graphite chauffe **orange, jamais blanc** ; au repos le train est **balayé, pas détruit** ; on ne montre jamais « 15 » sur les septa ; « 89 µs » est la durée de l'extraction, pas le délai depuis l'alerte (rien d'affiché entre « L'alerte part » et « Le trou passe » ne le chiffre) ; pas de photo ni de logo CERN, pas d'eau autour du bloc, rien de 2008.

**Anti-parasites** : un paquet ne traverse jamais l'objectif (le décor les efface à < 20 cm, mais ne cadrez pas un trajet *dans* le train) ; la caméra ne traverse aucune cuve, aucun septum, aucun aimant de dilution ni le noyau (le verre, oui) ; `dof` sur les seules poses `CLOSE` (`hero`, `coil`, `grainFloat`, `monitor`, `faceClose`, `etrace`) ; `mood` tenu franc (0 ou 1) ; un fantôme (le point, le balayage) passe `mood` à 1 le temps de sa phrase et revient à 0 ; pas de trajet de plus d'un quart de tour par seconde.

**Les poses de `VIEW` sont provisoires** (réglées sur bouchons) : partir de celles des journaux des décors (`docs/journal/043-anneau.md`, `043-sortie.md`) quand elles existent.

## acte1.js

**0 → 19,54 (`toopen`)** · 01 MENACE · accroche, promesse, scène. Part de `POSE0` et `FIRST`, sans coupe ; trois coupes au plus (le bloc, le grain, la scène). Trajet de az −80 vers −128.

| Instant | Voix | Plan | Part du cadre |
| --- | --- | --- | --- |
| 0 → 2,28 | « Ton faisceau porte l'énergie d'un *train lancé*. » | `POSE0` lancé (`path`, `glide`) vers `train` à 1,72 : le train de lumière file vers l'objectif (`gap` +900 cm/s), le grain tombe devant (`grain` 0,35 → 0,7), la gerbe commence (`spray` 0,15 → 0,4). `punch` « train ». | le train 45 → 65 % de la largeur |
| 2,72 → 4,36 | « Un grain de poussière va le jeter +dehors+. » | la caméra passe sur le grain (az −86, plus près) : `grain` → 1 sur « poussière » (3,12), `#chip-grain` 2,9 → 4,5 ; sur « dehors » (4,08) la route verte file au fond vers le bloc (`route` 0 → 0,5). | le grain et sa lueur 15 %, le train derrière 50 % |
| 4,71 coupe | « Pour l'avaler : un +bloc+ de six tonnes. » (4,83 → 6,68) | `blockFar` (az −146 → −158) : le bloc sur son halo, la route veille arrive dans sa face (`route` → 1 à 5,8), `litBlock` 0,6, `LIGHT.block`, `mood` 0. | le bloc 35–45 % (diagonale) |
| 7,03 coupe | « Et des grains comme lui… combien ont déjà *gagné* ? » (7,15 → 9,24) | `grainFloat` (CLOSE) : le grain rouge qui flotte devant le train (`gap` 200 cm/s), `mood` 1 ; `punch` « gagné ». | le grain 15–20 %, le train 50 % |
| 9,90 coupe | « Le grain fait pleuvoir des particules sur les aimants. » (10,02 → 12,10) | même seconde : `coil` (az −20, CLOSE) : la gerbe pleut (`spray` → 1 sur « pleuvoir » 10,62), la bobine rougit sur « aimants » (`coil` → 0,7). | bobine + gerbe 40 % |
| 12,54 → 14,66 | « Un vingtième d'un paquet suffit à en *abîmer* un. » | trajet vers `hero` (az −34) : un paquet en grand (`hero` → 1, le train ralentit à 60 cm/s), son vingtième se détache sur « vingtième » (12,74) et frappe sur « abîmer » (`slice` → 1 à 14,2, `coil` → 1). | le paquet 50 % |
| 15,06 → 16,50 | « Ton train en compte des milliers. » | le train repart (1 500 cm/s, `hero` → 0) ; recul par rapport vers `trainLong` (az −104) : les wagons jusqu'à l'horizon. | le train : une diagonale d'un bord à l'autre |
| 17,02 → 18,82 | « Seule issue… la +sortie de secours+. » | on monte sur `ringArc` (az −118, le quart d'anneau du grain au point 6) puis on plonge vers `exitLit` (az −128) : l'embranchement seul éclairé en vert (`route` 1, `arm` 1, `litKick` 1, `sensors` 0,3) ; `#chip-sortie` 18,0 → 19,4 ; `punch` « sortie ». | l'embranchement 30 % |

Sortie : à 19,54 la caméra plonge encore vers l'embranchement (lancée) ; `acte2.js` coupe sur `dive`, même sens de mouvement. Rien d'affiché après 19,45.

## acte2.js

**19,54 (`toopen`) → 48,24 (`tozero`)** · 02 AUTOPSIE · on l'ouvre, l'éclaté, le principe, le repos. `setAct(tl, 2, explode)`. Trois lieux : le point 6 → l'anneau → la ligne → le bloc (un trajet, coupes permises à 24,44 et 34,16), puis le point 6 au repos (coupe 40,47, `torepos`).

| Instant | Voix | Plan | Part du cadre |
| --- | --- | --- | --- |
| 19,54 coupe | « Alors… on l'ouvre. » (19,66 → 20,88) | `dive` (`STAGED`, `gap` 3 000 : le train passe dans les cuves, `mood` 0, `LIGHT.kick`) ; la caméra s'engouffre vers la branche ; **`explode` 0 → 1 sur « on » (20,44)**, en cascade le long de la ligne (≈ 0,9 s). Seule dans son plan. | la rangée et la branche 60 % |
| 21,83 → 24,16 | « Trois mille six cents capteurs guettent la moindre perte. » | recul par rapport jusqu'à `sensors` (l'anneau de trois quarts) : la vague verte fait le tour (`sensors` 0,3 → 1, 21,9 → 23,6) ; `co.add` « Capteurs de pertes ». | l'anneau 85 % |
| 24,44 (coupe permise) | « Quinze aimants le poussent hors de l'anneau. » (24,56 → 26,16) | `kickers` : les 15 cuves levées, allumées une à une (`litKick` 1, `arm` 1) ; `co.add` « Aimants d'éjection ». | la rangée 70 % |
| 26,64 → 27,60 | « Sept cents mètres de ligne. » | trajet le long de la ligne, `lineLong` (bas, az −160) : la route file loin (`litLine` 1, `litSepta` 0,5) ; `co.add` « Ligne d'extraction ». | la ligne de bout en bout |
| 27,88 → 29,20 | « Et au bout… +le bloc+. » | on suit la route jusqu'à `blockHero` : la coque glissée découvre le noyau plein (`litBlock` 1), `#chip-bloc` 28,9 → 30,2 ; `punch` « bloc ». | le bloc 55 % |
| 29,85 → 30,36 | « Pourquoi il tient ? » | glisse vers `faceClose` (CLOSE) : la face d'entrée ; le reste s'éteint (`BENCHED` à petites touches : `shell` 0,12, `cavern` 0,2, `beam` 0). | la face 60 % |
| 30,84 → 33,80 | « Sur un seul point, même le matériau le plus robuste lâcherait. » | fantôme (`mood` 1) : un fin faisceau signal sur UN point (`point` 0 → 1 sur « point » 31,60), la plaque se fissure sur « lâcherait » (`crack` 0 → 1, 33,44 → 33,8) ; `punch` « lâcherait ». | la face 70 % |
| 34,16 (coupe permise) | « Alors dix aimants le font tourner : » (34,28 → 35,64) | `point`, `crack` → 0, `mood` 0 ; `dilution` : les dix s'allument tour à tour (`dil` 0 → 1) ; `co.add` « Aimants de dilution » ; puis on suit la tache le long de la ligne (vers `lineRush`). | les dix 65 % |
| 35,96 → 38,48 | « il dessine un « e » : un trait d'un +mètre vingt+. » | retour sur `faceClose` (az −150 → −158) : `paint` 0 → 1 (36,0 → 38,4), `heat` 0,3 → 0,6 ; `punch` « vingt ». | la face 70 % |
| 38,72 → 40,12 | « Même énergie… étalée. » | `heat` 0,6 → 0,45 (la trace pâlit en orange), la caméra recule un peu pour voir toute la face et le noyau. | la face 55 % |
| 40,47 coupe (`torepos`) | « Dans le train, un trou : trois microsecondes sans aucun proton. » (40,59 → 43,80) | `gapFind` (`STAGED`, `mood` 0, `LIGHT.kick`) : le train tourne calme (300 cm/s) devant les cuves éteintes ; `gap` −1 300 à 40,47 → −477 à 41,9 → +477 à 45,1 : le trou noir passe devant elles. | les cuves et le trou 60 % |
| 44,20 → 45,32 | « Les aimants ne s'allument que là. » | `arm` 0,3 → 0,8 pendant que le trou est devant (« attendent en vert veille »). | |
| 45,68 → 47,96 | « Ailleurs… ils balaieraient ce train contre les *parois*. » | fantôme (`mood` 1) : tirés en plein train (`kick` 1, signal tant que `sweep` > 0), les paquets balayés contre la paroi (`sweep` 0 → 1, 46,4 → 47,9) ; `punch` « parois » ; tout revient (`kick`, `sweep` 0) à 48,2. | les cuves et le flot balayé 60 % |

Sortie : 48,24, `acte3.js` coupe ; rien d'affiché après 48,1.

## acte3.js

**48,24 (`tozero`) → 65,22 (`toverdict`)** · 02 → 03 RÉPONSE. `setAct(tl, 3, tozero)`. Le grain (coupe), puis l'alerte qu'on suit jusqu'au point 6 (coupe permise à 51,72), puis un seul trajet du point 6 au bloc **sans coupe sur l'éjection**.

| Instant | Voix | Plan | Part du cadre |
| --- | --- | --- | --- |
| 48,24 coupe | « Retour au grain. » (48,36 → 48,92) | `STAGED`, `mood` 1, `LIGHT.grain`, `grain` 1, `spray` 1, `coil` 0,8, `gap` à 900 cm/s ; la caméra sur le grain et sa gerbe (`grainFloat` élargi). | grain + gerbe 35 % |
| 49,32 → 50,52 | « La perte franchit le *seuil*. » | trajet vers `monitor` (CLOSE) : `loss` 0,3 → 0,7 sur « franchit » (49,80) → 0,85 sur « seuil » (50,28) : le seuil passe signal ; `punch` « seuil ». | capteur + barre 40 % |
| 50,79 → 51,48 | « L'alerte part. » | `alert` 0 → 1 (50,8 → 52,6) ; la caméra la suit en reculant (`fromD`) vers `ringPulse`. | l'arc et l'impulsion |
| 51,72 (coupe permise) | « Le système attend… le +trou+. » (51,84 → 53,40) | au point 6, bas le long du tube, vers `fire` : les cuves armées (`arm` 1, `LIGHT.kick`), le trou arrive (`gap` −1 840 à 51,72 → −477 à 53,99 : 610 cm/s) ; `punch` « trou ». | cuves + train + trou 60 % |
| 53,99 → 54,64 | « Le trou passe. » | la caméra continue d'approcher : le trou noir devant les cuves. | |
| 55,00 → 55,92 | « Quinze aimants *s'allument*. » | `kick` 0 → 1 en cascade (55,0 → 55,5) ; **`gap` = +477 à 55,51 (`trigger`)**, tenu ; `septa` → 1 (55,6 → 55,9) ; `jolt` 0,9 à 55,56. | la rangée 70 % |
| 56,20 → 57,12 | « Le train quitte l'anneau. » | `dump` 0 → 1 de 55,56 à **60,85** (ease `"none"`), `dil` 1 dès 56,0 ; la caméra suit le flot dans la ligne (`lineRush`) ; derrière, l'anneau se vide. | le flot de bout en bout |
| 57,48 → 58,88 | « Il peint son « e » sur le bloc. » | `faceClose` : le « e » grandit avec `dump`, `heat` suit (0 → 0,8). | la face 70 % |
| 59,24 → 61,28 | « Quatre-vingt-neuf microsecondes : tout est *dedans*. » | `dump` = 1 à 60,85 ; la caméra recule (le bloc et la ligne vide) ; `punch` « dedans ». | bloc + ligne 50 % |
| 61,72 → 63,84 | « Le graphite peut monter jusqu'à quatorze cents degrés. » | `heat` 0,8 → 1 (orange vif, **jamais blanc**), le bloc de trois quarts. | le bloc 55 % |
| 64,28 → 64,64 | « Il +tient+. » | `mood` → 0 sur « tient » (64,44) ; le bloc intact sur son halo (`pool` 1) ; `punch` « tient ». | le bloc 55 % |

Sortie : à 65,22 le trajet passe par `VIEW.verdict` (lancé) avec `dump` 1, `beam` 0, `paint` 0, `heat` 0,9, `mood` 0 ; `fin.js` coupe sur cette pose et cet état.

## fin.js

**65,22 (`toverdict`) → 90,87** · chute → ce qui est dû et le commentaire → like → prochain dossier → boucle (`kit/template/src/fin.js`, et le `fin.js` du 042 pour l'orbite et la boucle). Une orbite lente qui ne s'arrête jamais (az décroissant).

| Instant | Voix | Plan | Part du cadre |
| --- | --- | --- | --- |
| 65,22 coupe (invisible) | « Voilà le secret : ce train, on ne l'encaisse *pas* sur un point. On le jette dehors… et on l'+étale+. » (65,34 → 70,14) | `verdict` → `etrace` : le bloc refroidit (`heat` 0,9 → 0,4, la trace en « e » encore orange), la caméra glisse jusqu'à la face, le « e » seul en grand sur « étale » (69,74). `retitle` (« On l'encaisse » barré sur « pas » 67,42 → « On l'étale » à 69,69, sorti à 70,47) ; `D.verdict(67.42)`. | le bloc 50 % → le « e » 70 % |
| 70,89 coupe (`tocta`) | « Et ces grains, combien ont gagné ? Trente-sept fois, en moins de deux ans. » (71,01 → 74,46) | `tally` : le grain qui flotte dans le tube vide (`beam` 0, `grain` 0,6, `mood` 0) ; les grains s'alignent `grains` 0 → 37 de 71,6 à 72,9 (le compteur dit 37 quand la voix le dit). | le tube et les grains 60 % |
| 74,85 → 78,74 | « En +commentaire+ : couper pour un grain… trop prudent, ou juste *assez* ? » | orbite lente ; `duelCall` (from 76,54, aAt `duelA` 77,14 « Trop prudent », bAt `duelB` 78,30 « Juste assez », to 79,10). Le film ne répond pas. | |
| 79,20 coupe (`tolike`) | « +Like+ : pour celui qui croit qu'un grain de poussière, c'est *rien*. » (79,32 → 82,36) | `like` : le grain minuscule devant le train immobile qui remplit le cadre (`beam` 1, `gap` fixe) ; `likeCall` 79,32 → 82,48. | le train 80 %, le grain au centre |
| 82,69 coupe (`toabo`) | « +Abonne-toi+ : prochain dossier, un policier croit avoir pris une pierre dans les côtes. C'était une *balle*. » (82,81 → 87,64) | `teaser` (anneau et caverne éteints) : le gilet sous scellés, la pierre qui devient balle (`teaser` 0,2 → 1 sur « balle » 87,40) ; `nextFile` (show 83,47, fact 84,3, hide 87,80, rails 82,9 → 87,79). | le gilet 45 % |
| 88,18 coupe (`toloop`) | « Une balle, ça va vite. Mais… » (88,30 → 90,16) | coupe sur `POSE0` az −68 (+12°) avec `FIRST`, sauf `gap` 6 582 → 9 000 à 90,867 (ease `"none"` : 900 cm/s, la vitesse de l'accroche) et `grain` 0,1 → 0,35 ; `D.loop({ at: 88.18, rewindAt: 90.00 })` **sans `fromD`**. La dernière image est la première. | |

## La première image : quatre candidates

Notées sur les six points de `docs/recette-agents.md` **sur bouchons** (`.cache/planches/043/architecte/p2.jpg`) : à refaire sur les décors finis, avec l'habillage. Le fichier prêt à tirer : `.cache/planches/043/image0.json` (`npm run look -- 043 --file .cache/planches/043/image0.json --out .cache/planches/043/image0.jpg --cols 4`, sans `--bare`). Toutes à 0,02 s sur `FIRST` (le train à 900 cm/s, `grain` 0,35, `spray` 0,15) ; tirer aussi 0,5 s pour le point 6.

| | Pose | 1 en cours | 2 basse | 3 menace derrière | 4 forme, 40 % | 5 système là | 6 bouge par son sujet | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **a** « voir » (`POSE0`) | au ras du tube, dans l'aimant de verre en aval, trois quarts avant | ✓ le grain tombe, la gerbe pleut | ✓ | ½ le grain rouge devant le train, `mood` 1 | ✓ le train qui fonce, ≥ 40 % | ✓ le bloc et son halo au fond à gauche, petits | ✓ le train file | **5,5** |
| **b** `side` | plus loin, trois quarts, hors du cryostat | ✓ | ½ | ½ | ✓ aimants de verre + train en diagonale | ✓ le groupe de capteurs du grain, en veille | ✓ | **4,5** |
| **c** `under` | sous le tube, regard vers le haut | ✓ le grain tombe vers l'objectif | ✓ | ✓ | ✗ la forme ne se reconnaît pas d'en dessous | ✗ | ✓ | **4** |
| **d** `inpipe` | dans le tube, hors de l'axe : le train arrive comme dans son tunnel | ✓ | ✓ | ✓ le grain entre l'objectif et le train | ✓ le plus reconnaissable (un train dans son tunnel) | ✗ rien du système | ✓ (risque : un paquet qui frôle l'objectif) | **5** |

Les poses, prêtes à coller (`essais.json`) :
```json
[
 { "at": 0.02, "label": "a voir", "pose": { "tx": 90, "ty": 1, "tz": -4, "d": 150, "az": -80, "el": 5, "fov": 34, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
 { "at": 0.02, "label": "b side", "pose": { "tx": 60, "ty": 2, "tz": 0, "d": 260, "az": -62, "el": 6, "fov": 34, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
 { "at": 0.02, "label": "c under", "pose": { "tx": 70, "ty": 2, "tz": 0, "d": 120, "az": -86, "el": -9, "fov": 40, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
 { "at": 0.02, "label": "d inpipe", "pose": { "tx": 120, "ty": -1.5, "tz": 0.5, "d": 160, "az": -89, "el": 1, "fov": 46, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }
]
```
Pour **d**, si le système manque, essayer `inpipe` avec `az` −84 : le bloc entre au fond à gauche (le tube courbe vers l'intérieur de l'anneau, à gauche de l'image). Le choix est collé dans `world.js` (`POSE0`, et `FIRST` s'il change) **avant** que les actes partent.
