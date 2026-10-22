# 025 · ESP — les décors

Deux fichiers, un agent chacun, en parallèle : `episodes/025-esp/src/model.js` (le système : l'ESP) et `src/route.js` (la route de campagne la nuit, le sanglier, la voiture du 014 aux rayons X). Tous deux existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `HANDOFF`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/025-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/025-esp.md` et `025-contre-verification.md` — leurs « À ne pas dire » d'abord. **La voix est enregistrée** (91,5 s) : `npm run script -- 025` donne la table.

**On réutilise, on ne remodélise pas.** La voiture, la route mouillée, la pluie et toi au volant existent : `episodes/014-abs/src/street.js` (qui reprend la carrosserie du 011). Le frein, son disque, son étrier, la couronne dentée, son capteur et le bloc hydraulique existent : `episodes/014-abs/src/model.js`. **On COPIE et on adapte — on ne touche jamais aux fichiers du 014** (ni au kit).

**L'échelle** : la vraie pour la voiture, la route, ses bas-côtés ; les tailles du système sont illustratives (rien ne s'affiche). Le sanglier et l'élan à peu près à leur taille.

**Le repère est celui de la voiture (014)** : son centre au sol à l'origine, **nez vers −z**, tu es à **−x** (conduite à gauche) — **la GAUCHE est −x**. `yaw` (degrés) : la voiture tourne à GAUCHE quand il croît (le nez va de −z vers −x). **Deux repères, un nombre** (`onboard`, dans `world.js`) : `route.js` dessine, comme le 014, la route qui tourne autour de la voiture de −yaw (`pivot`) et glisse de `lane` (`slide`) ; `world.js` retourne tout l'ensemble de +yaw·(1 − onboard). Donc : à `onboard` 0 la route est immobile et la voiture tourne dessus (la toupie, les flèches, vues de haut) ; à `onboard` 1 la voiture est d'équerre et la route tourne dessous (les plans serrés, le système, la coupe vers l'établi). **Tu n'as rien à faire pour ça** : dessine dans le repère de la voiture, la route tournée de −yaw comme au 014. **Azimut** (`kit/lib/stage.js`, vérifié : la caméra est en t + d·(sin az, …, cos az)) : `az` 0 se tient en +z, DERRIÈRE la voiture ; −90 à −x, son flanc GAUCHE ; ±180 devant. La lumière clé vient de −x, +y, +z (de derrière à gauche).

**Couleurs** : signal = la menace (les yeux du sanglier dans les phares, l'arrière qui décroche et ses traces, la flèche de la voiture quand elle ne va plus où tu braques, le comparateur quand la réponse est non) ; veille = le système vivant (les impulsions des capteurs, le comparateur quand la réponse est oui, LE frein qui serre, le moment qu'il rend à la voiture) ; ink = le reste, et où ton volant demande d'aller. Nuit noire, pas de bleu. Personne n'est blessé, le sanglier n'est jamais touché.

---

## `src/model.js` — l'ESP (le système)

**À lire pour l'idiome** : `episodes/014-abs/src/model.js` (le coin de roue, le bloc, les conduites : **pars d'une copie**), `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres), `kit/lib/build3d.js`.

**Ce qu'il construit**, en cm, à ses VRAIES places dans la voiture, origine = celle de la voiture (`plan.js` : `HUBS`, `corner(k)`, `DISC`, `CALIPER`, `RING`, `UNIT`, `ECU`, `SAS`, `YAWS`, `LINES`, `STEERING`, `SYSTEM`, `BENCHAT`). Sur l'établi, il se tient à `BENCHAT` (l'origine) **sur ses quatre pneus de verre** : un squelette de voiture, « l'ESP, c'est toute la voiture ».

- **Les quatre coins** (`FL`, `FR`, `RL`, `RR`) : le frein du 014 en quatre exemplaires, en miroir pour la droite — disque ventilé côté intérieur, étrier sur son quart arrière haut, plaquettes, couronne dentée et capteur de vitesse. Les deux avant braquent avec `steer` (30° à 1, autour de la verticale du moyeu) ; les disques tournent avec `rolled` (étalés à vitesse : le film est au ralenti, `kmh` est la vitesse de l'histoire). **Le coin avant DROIT (`FR`) est le héros** : « l'avant, à l'extérieur du virage » (on braque à GAUCHE). Le plus clair des quatre quand il serre.
- **Le bloc ESP** (`UNIT`, le bloc ABS du 014 : électrovannes, pompe) et, clipsé dessus, **le calculateur** (`ECU`). Sur la face du calculateur tournée vers la caméra (−x / +z) : **le comparateur** — un cadran sombre, deux aiguilles épaisses (≥ 6 px à 270 px de large sur `VIEW.unit`) : l'aiguille encre = où tu veux aller (`aim`), l'aiguille veille/signal = où va la voiture (`yaw`) ; entre elles, quand elles s'écartent, le secteur qui les sépare s'allume (signal si `alarm`, veille sinon). Échelle : 1° de l'histoire = 2° d'aiguille, bornée. **C'est la pièce-héros des actes 2 et 3** : ce qu'on comprend sans légende (« la réponse est oui / non »). Une image du calcul, pas une pièce réelle (`sources` le dit) : sobre, aucun chiffre, aucune graduation fine.
- **Les quatre conduites** (`LINES`) du bloc à chaque étrier, encre, ≥ 1,8 px. `bFL…bRR` : une tête de pression veille court du bloc à l'étrier, puis les plaquettes serrent et le disque passe veille (une lueur qui a un endroit, jamais un voile). Une électrovanne du bloc s'allume avec sa conduite.
- **Le capteur d'angle de volant** (`SAS`) : un anneau sur la colonne, juste derrière le volant. Dans la voiture, `route.js` dessine le volant ; **sur l'établi seulement**, dessine un volant de verre et sa colonne (il tourne de 100° à `steer` 1).
- **Le capteur de lacet** (`YAWS`) : un petit boîtier sur le tunnel, au cœur de la voiture (« at the heart of the ESP », Bosch).
- **Les fils** des capteurs au calculateur (les quatre de roue, l'angle, le lacet) : traits encre ≥ 1,8 px, sobres ; `sense` y fait monter des impulsions lentes veille (une respiration, jamais un clignotement : pas de « 25 par seconde » à l'image, ce serait un scintillement).
- **Sur l'établi** (`bench` 1) : les quatre pneus de verre (anneaux, pas de jantes pleines) qui portent le squelette sur le sol de l'établi, le volant et sa colonne de verre. Dans la voiture (`bench` 0) : rien de cela, `route.js` les dessine.

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.

- `root` : un `THREE.Group` (re-parenté entre la voiture et l'établi ; `world.js` le cache en 1997, voir `archive`).
- `A` (ancres, `Object3D`) : `FL`, `FR`, `RL`, `RR` (chaque étrier, qui braque avec sa roue), `unit`, `ecu`, `dial` (le centre du comparateur), `sas`, `yaws`, `centre`.
- `parts` : `{ FL, FR, RL, RR, unit, ecu, sas, yaws, wheel }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (pneus et volant de verre), 0 dans la voiture |
| `shell` | dans la voiture : 1 normal ; quand il baisse, le système reste plein (c'est le décor qui s'efface) |
| `steer` | les roues avant braquent (30°), le volant de l'établi tourne (100°) ; le capteur d'angle s'allume un peu quand il bouge |
| `aim`, `yaw` | les deux aiguilles du comparateur (2° d'aiguille par degré) |
| `alarm` | 0 : l'aiguille de la voiture et l'écart veille (oui) · 1 : signal (non). Tenu franc |
| `rolled`, `kmh` | la rotation des disques et des couronnes ; l'étalement à vitesse |
| `bFL`, `bFR`, `bRL`, `bRR` | chaque frein : la pression court sa conduite, les plaquettes serrent, le disque passe veille (0–1) |
| `sense` | les impulsions des capteurs vers le calculateur (0–1) |
| `explode` | sur l'établi : 0 assemblé → 1 éclaté dans UN cadre vertical vu de `VIEW.exploded` — le volant et son capteur montent le plus haut, le calculateur et son comparateur au-dessus du bloc, le capteur de lacet au-dessus du tunnel, chaque coin s'écarte vers l'extérieur ; rien derrière l'en-tête |
| `litSteer`, `litYaw`, `litWheels`, `litEcu` | la pièce que la voix nomme luit faiblement veille (`litWheels` : les quatre capteurs de roue ; `litEcu` : le calculateur et son comparateur) |
| `litCorners`, `litFR` | les quatre coins, et le coin avant droit seul (« une roue… pas les quatre ») |

**Images à réussir** (8, liste fermée — poses de départ dans `world.js` → `VIEW`) :

1. Le squelette entier sur l'établi (`VIEW.whole`) : on comprend sans légende — quatre roues, un volant, un boîtier au centre, un bloc et son cadran.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : tout dans un cadre vertical, sous la ligne « Système Décodé ».
3. Le volant et son capteur (`VIEW.wheelBench`, `steer` 0 puis 0,5, `litSteer` 1) — le geste se lit d'une image à l'autre.
4. Le capteur de lacet (`VIEW.yawBench`, `litYaw` 1) — et le squelette qui tourne sur son halo (`onboard` 0, `yaw` 12 : c'est `world.js` qui le fait tourner, vérifie seulement que ça se lit).
5. **Le comparateur** (`VIEW.ecuBench` sur l'établi, `VIEW.unit` dans la voiture) : `aim` 12 `yaw` 12 `alarm` 0 (une seule aiguille, veille : oui) ; puis `aim` 12 `yaw` 40 `alarm` 1 (deux aiguilles, le secteur signal : non) — lisible à 270 px.
6. **Le coin avant droit qui serre** (`VIEW.cornerFR` dans la voiture, `bFR` 0,5 puis 1) : la pression à mi-conduite, puis le disque veille ; les trois autres coins éteints dans le même plan large (`VIEW.top` avec `litCorners` 0, `bFR` 1).
7. Dans la voiture (`VIEW.system`, `onboard` 1, `shell` 0,4) : le système reste l'élément le plus lisible sous la carrosserie de verre.
8. La couverture : `cover` d'`episode.json` (instant `eclate$` : éclaté, `litEcu` 1, `aim` = `yaw` = 10, `bFR` 1) — tout le système éclairé, quelque chose luit, `el` ≥ 28, la vue éclatée sous « Système Décodé » (shift ≈ −520).

---

## `src/route.js` — la route de campagne la nuit, le sanglier, la voiture aux rayons X

**Pars d'une COPIE de `episodes/014-abs/src/street.js`** (la route mouillée, la pluie, les gerbes, la carrosserie du 011, toi au volant, `pivot` / `slide`, `gap`, `lane`, `yaw`, `steer`, `rolled`, `skid`). Le bouchon actuel l'importe tel quel : remplace-le en entier. À lire aussi : `episodes/006-defibrillateur/src/hall.js` (un lieu aux rayons X), `kit/lib/figure.js`, `kit/lib/atmo.js`.

**Ce qui change par rapport au 014** :

- **Plus de camion** (retire-le). **Les quatre roues sont dessinées ici, en verre** (le 014 laissait l'avant gauche au système) : pneus et jantes de verre ; c'est `model.js` qui met dedans les freins pleins.
- **Une route de campagne** (`ROAD`, `LANE`) : une voie dans chaque sens (ta voie centrée en x 0, l'autre à −350, à ta GAUCHE), lignes de rive, ligne médiane discontinue, l'eau et ses reflets (014) ; au-delà des rives, les bas-côtés (une grille), **les FOSSÉS** des deux côtés (« c'est lui qui t'évite le fossé » : ils doivent se lire de haut), puis la lisière du bois (troncs de verre, sobres — le décorateur l'habillera). Tes phares : deux cônes de lumière sur l'eau ; la seule lumière de la nuit.
- **Le sanglier** (`BOAR`, `boar`) : dans ta voie, à `gap` mètres du pare-chocs, immobile ; verre simple (corps trapu, groin, oreilles, pattes courtes), ses **deux yeux renvoient les phares en signal** — la seule menace pleine de couleur de la première image. Il n'est jamais touché.
- **L'élan** (`MOOSE`, `moose`, `mooseAt`) : verre, grand (les bois en traits encre) ; à `mooseAt` 0 dans ta voie à `gap` (1997), à 1 debout au bas-côté de gauche, au bord du faisceau (le C de l'accroche).
- **Les flèches** (`ARROW`, `arrows`) : posées sur la route, partant de la voiture. L'encre selon `aim` (où ton volant demande d'aller), dans le repère de la ROUTE ; celle de la voiture selon `yaw` (son cap), **veille quand elles se confondent, signal si `alarm`**. Larges, plates, pointe nette ; lisibles de `VIEW.top`.
- **Le décrochage** (`slide`) : l'arrière part — les traces des pneus arrière, signal, qui s'incurvent vers l'extérieur sur l'eau (approxime-les à partir de `yaw` et `lane` : arcs dont la courbure suit l'écart ; elles ne dépendent que de l'état). Le `skid` du 014 (traces droites de roues bloquées) n'est plus le bon geste.
- **Le moment** (`moment`) : un arc veille autour de la voiture, de haut, tourné CONTRE la toupie (vers la droite), qui part du coin avant droit : « freinée par ce seul coin, la voiture se redresse ».
- **Les gaz** (`gas`) : le moteur (`ENGINE`, verre) et les deux arbres de transmission vers les roues avant : des têtes de lumière encre qui coulent (1) → coupé (0 : plus rien ne coule, en 0,2 s).
- **1997** (`tip`) : la même voiture (aucune marque, aucun logo), ses roues gauches se soulèvent, elle s'appuie sur ses roues droites (≈ 40° à 1) — **jamais sur le toit, jamais retombée** ; toi absent (`you` 0) ; `world.js` cache le système (la Classe A n'avait pas d'ESP).
- **La fusée** (`rocket`, l'annonce du 026) : loin dans le ciel au-dessus du bois, une lumière encre qui monte sur sa traînée (→ 0,7), la traînée qui se rompt avec une petite lueur signal (0,7–0,8), puis un point veille qui s'en détache et redescend lentement (→ 1). Petit, net, une lumière qui a un endroit.
- `you` : toi au volant (014), mains sur le volant qui suit `steer`. Pas de pied sur la pédale (l'ESP freine sans toi).

**API à rendre** (exactement) : `export function buildRoute()` → `{ group, A, update(P, time, px) }`.

- `group` (tout le décor, dans le repère de la voiture ; `world.js` le tourne).
- `A` : `nose`, `tail`, `boar`, `moose`, `steering`, `you` (ta tête), `engine`, `wheelFR` (la roue avant droite), `rocket`.
- `update(P, time, px)`, `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `shell` | le verre de la voiture et de la route (0–1) |
| `gap` | mètres jusqu'au sanglier (et à l'élan) ; la route, la peinture, la pluie défilent avec (négatif : dépassé) |
| `lane` | mètres vers la GAUCHE : la route glisse vers la droite |
| `yaw` | le cap de la voiture (la route tourne de −yaw autour d'elle) |
| `aim` | la flèche encre (où tu braques) |
| `steer` | le volant dans tes mains (100°), les roues avant (30°) |
| `kmh`, `rolled` | l'étalement de la pluie, des gerbes, de la peinture ; la rotation des roues |
| `rain` | la nuit mouillée (0–1) |
| `boar`, `moose`, `mooseAt` | le sanglier ; l'élan et sa place |
| `you` | toi au volant (0/1) |
| `slide` | les traces de l'arrière qui décroche (0–1) |
| `arrows`, `alarm` | les deux flèches ; la couleur de celle de la voiture |
| `moment` | l'arc veille du redressement (0–1) |
| `gas` | le flux du moteur aux roues avant (1 → 0 coupé) |
| `tip` | 1997 : la voiture sur deux roues (0 → 1) |
| `rocket` | la fusée du prochain dossier (0 → 1, voir plus haut) |
| `bFR` | (si tu veux) une lueur veille sur la jante avant droite quand son frein serre ; le frein lui-même est à `model.js` |

**Images à réussir** (8, liste fermée) :

1. **La première image** et ses trois rivales (planche de quatre, avec leurs poses, voir `docs/025-actes.md`) : (a) `VIEW.chase`, (b) `POSE0` (provisoire), (c) `VIEW.top`, (d) `VIEW.shoulder` (`onboard` 1). `FIRST` : le sanglier dans les phares, la pluie, la route mouillée. Elle arrête le pouce sans texte.
2. **La toupie de haut** (`VIEW.top`) : `yaw` 35, `aim` 12, `steer` 0,7, `lane` 1, `gap` −8, `arrows` 1, `alarm` 1, `slide` 1 — on lit sans légende : la voiture ne va pas où le volant dit.
3. Le large (`VIEW.wide`, `yaw` 70, `lane` 2,5) : la route, les deux fossés, la lisière — où la toupie finirait.
4. Le redressement (`VIEW.top`, `yaw` 25, `moment` 1, `bFR` 1, `arrows` 1, `alarm` 0) ; puis `VIEW.front` et `VIEW.rear` à `yaw` 8 : le nez revient, l'arrière suit.
5. Le moteur (`VIEW.engine`, `onboard` 1) : `gas` 1 puis 0 — on voit le flux s'arrêter.
6. L'élan au bas-côté (`VIEW.verge`, `moose` 1, `mooseAt` 1, `yaw` 30) ; puis dans la voie (`mooseAt` 0, `VIEW.chase`).
7. 1997 (`VIEW.tip`, `tip` 1, `you` 0, `archive` 1, `steer` −0,6) : sur deux roues, jamais un accident.
8. La fusée (`rocket` 0,5 puis 0,9), de derrière la voiture arrêtée au bord, caméra levée vers le ciel au-dessus du bois.
