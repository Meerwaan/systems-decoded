# 026 · Soyouz MS-10 — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/026-soyouz-ms10/src/model.js` (le système : la tête de sauvetage, ses quatre petits moteurs, l'équipage, les capteurs), `src/launcher.js` (la fusée Soyouz-FG aux rayons X, la croix de Korolev, le propulseur D, le pas de tir) et `src/sky.js` (le ciel et la Terre depuis l'altitude, l'air qui défile, la chute, le parachute, la steppe, le teaser du 027). Les trois existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED` / `GROUNDED`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/026-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/026-soyouz-ms10.md` et `026-contre-verification.md` — **leurs « À ne pas dire » d'abord** : ni vitesse, ni poussée, ni durée de combustion, ni « la tour a sauvé », ni « la fusée a explosé ». **La voix est enregistrée** (91,1 s) : `npm run script -- 026` donne la table.

**On réutilise avant de modéliser.** Le ciel à l'infini, le sol vu de haut, l'horizon et les traînées d'air existent : `episodes/007-siege-ejectable/src/jet.js` (lignes 340–520 : `makeStreaks`, `backdropMat`). Un jet de tuyère (un cœur chaud qui refroidit le long du jet, sans bord) : `flameMaterial` de `episodes/007-siege-ejectable/src/model.js`. Une lumière qui a un endroit (cœur, gaine, halo) : `episodes/008-paratonnerre/src/bolt.js`. Le personnage de verre et ses mains : `kit/lib/figure.js`. **On COPIE et on adapte — on ne touche jamais aux fichiers des autres épisodes** (ni au kit).

**Le repère** (vérifié dans `kit/lib/stage.js`) : **l'origine est TOI** — la base du module de descente (le bas du bouclier thermique), sur l'axe de la fusée ; l'axe de la fusée est y, le nez en haut. Le monde vient au module : le ciel, l'horizon et le sol sont dessinés à l'infini depuis `alt` (km) ; la fusée pend sous la tête et, une fois arrachée, tombe le long de son propre axe (`apart`, m) ; rien ne voyage jamais 93 km. `tilt` (degrés, + = le haut vers +x) tourne la fusée — et la tête tant qu'elle y est — autour de l'axe z passant par l'origine : c'est `world.js` qui le fait, **tu n'as rien à faire pour ça**. **Azimut** : la caméra est en t + d·(sin az · cos el, sin el, cos az · cos el) — `az` 0 se tient en +z (regarde vers −z), −90 en −x, ±180 en −z ; `el` > 0 regarde vers le bas, < 0 vers le haut. Propulseurs, moteurs et capteurs sont placés avec la même convention : (sin az, 0, cos az)·r (`around` dans `plan.js`). La lumière clé vient de −x, +y, +z. Pour VOIR la fusée tourner, une caméra près de az 0 ou ±180.

**L'échelle** : la fusée et le vaisseau à peu près à leur taille (≈ 50 m ; chiffres arrondis de plans publics, `plan.js`) — **aucune longueur n'est jamais écrite à l'écran**. Ce qui ne tient pas dans un cadre vertical n'est pas à l'échelle : 50 et 93 km sont `alt` ; la tour s'éloigne de quelques centaines de mètres au plus ; le parachute est dessiné plus petit qu'il n'est (`sources` le dira : « maquette »).

**Couleurs** (trois, et elles ont un sens) : **signal** = la menace — le propulseur D et sa frappe, la pièce faussée, la lampe АВАРИЯ, la chaleur de la chute ; **veille** = le système vivant — les quatre moteurs (allumés, puis leurs jets), les capteurs qui sentent la fusée tourner, toi vivant à la fin ; **ink** = le reste — la fusée, ses jets, la tour, le ciel, le parachute. Pas de bleu (le ciel à 50 km est noir). Personne n'est blessé.

---

## `src/model.js` — le système (plein)

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/model.js` (un système plein, son moteur-fusée et sa flamme, ses pièces et ancres), `episodes/025-esp/src/model.js` (les nombres `lit…`, l'éclaté dans UN cadre, un squelette tenu sur l'établi par du verre), `kit/lib/figure.js`, `kit/lib/build3d.js`.

**Ce qu'il construit**, en cm, origine = la base du module de descente (`plan.js` : `DM`, `OM`, `FAIRING`, `MOTORS`, `FINS`, `TOWER`, `SEATS`, `YOU`, `MATE`, `CONSOLE`, `SENSORS`, `BENCH`, `SM`, `STAGE3`, `TRUSS`, `CORE`). Trois valeurs de gris : la coiffe la plus sombre, les modules au milieu, **les quatre moteurs nettement plus clairs** (le héros). Métal ≤ 0,5.

- **La coiffe** (`fairingL`, `fairingR`) : un cylindre de r 150 de y −40 à 560, en deux demi-coquilles fendues selon le plan x = 0 (chacune ses matières), paroi fine (on voit sa face intérieure quand elle s'ouvre), les quatre grilles stabilisatrices repliées à plat en bas (`FINS` : treillis fins, jamais nommées). `skin` 1 → 0 : la coiffe et son nez passent au verre (rayons X) — leurs arêtes restent, **les quatre moteurs restent pleins** : on voit dedans.
- **Le nez** (`nose`) : l'ogive de 560 à 790 ; à son sommet, la bride où la tour était posée. Il porte les moteurs.
- **Les quatre petits moteurs à poudre** (`motors`, LE HÉROS) : chacun dans sa nacelle contre l'ogive (`MOTORS` : az −45, 45, 135, −135 ; y 615 ; r 132), tuyère inclinée de 28° vers l'extérieur et vers le bas : leur jet descend le long de la coiffe en s'écartant. Taille illustrative (≈ 75 cm). `litMotors` 0 → 4 : une lueur veille faible au col de chaque tuyère, l'un après l'autre dans l'ordre de `MOTORS.az` (fractionnaire = partiel) — c'est « quatre ». `fire` 0 → 1 : **les quatre jets**, veille, un cœur presque blanc dans la tuyère qui refroidit le long d'un jet de 6 à 9 m (l'idiome `flameMaterial` du 007, teinté veille), une lumière qui a un endroit à la sortie ; à 1 c'est ce qu'il y a de plus clair dans l'image, jamais au-dessus de 3.
- **La tour** (`tower`, ink, verre et traits fins — jamais veille : ce n'est pas elle qui te sauve) : sur le nez (`TOWER` : de 790 à 1360, r 38), un fût avec sa couronne de petites tuyères en bas et sa pointe. `tower` = les mètres qu'elle a volé depuis son siège, le long de `TOWER.away` (surtout vers le haut, un peu de côté) ; dès qu'elle vole, son petit jet ink et une traînée fine derrière elle. À 10–15 m elle se lit comme une tour ; loin (≥ 100 m), un point clair et sa traînée. 0 la repose sur le nez (sur l'établi : « de la tour qui part », « quand ta tour s'en va »).
- **Le module orbital** (`om`) : un œuf à taille courte (`OM` : 228 → 498, r 112), sa sonde d'amarrage, gris moyen plein.
- **Le module de descente** (`dm`) : la cloche (`DM` : r 108 à la base, 46 au col), **son bouclier thermique plein** (le plus sombre), **ses parois en VERRE** avec leurs cerclages pleins : on voit dedans (sur le bouchon il est plein : c'est le défaut à corriger, voir la planche de l'architecte).
- **L'équipage** (`crew`, `seats`) : TOI (siège de gauche, x −60) et TON ÉQUIPIER (celui du milieu, x 4), personnages de verre (`makeFigure`), **allongés sur le dos** dans leurs sièges — le dos vers le bouclier, le visage vers +y, les genoux remontés (le siège Kazbek) ; le siège de droite vide. **Les trois coques de siège pleines**, claires : c'est contre elles que « plaqué dans ton siège » se lit. `press` 0 → 1 : vous vous enfoncez de 3–4 cm, la tête plaquée en arrière. `litYou`, `litMate` : une lueur veille faible sur le personnage (toi plus clair) ; à « Vivant », `litYou` 1. Jamais un visage en gros plan, jamais une main seule.
- **Le pupitre** (`console`) : au-dessus de vos visages (`CONSOLE`, incliné de 52°), sombre, quelques touches à peine marquées, et **sa lampe** : un rectangle qui s'allume signal avec le mot **АВАРИЯ** dedans (une texture de canevas, capitales grasses ; à 1, les lettres chauffées à blanc) — `avaria` 0 → 1. Le mot se lit sur `VIEW.console` ; à 270 px c'est un rectangle signal : l'étiquette `#chip-avarie` dit le mot.
- **Les capteurs** (`sensors`, un groupe À PART, dans les coordonnées de `root` : `world.js` le monte sur la fusée dans le ciel, sous la tête sur l'établi) : deux boîtiers (`SENSORS.at` : sur la baie d'instruments du troisième étage, en haut du bloc central), gris clair pleins, chacun avec un petit anneau de gyroscope sur sa face et sa lampe ; leurs fils (ink, ≥ 1,8 px) qui remontent la peau de la fusée jusqu'à la jonction sous le module (y −40). `sense` 0 → 1 : les lampes veille et des têtes de lumière lentes qui montent les fils vers la tête (une respiration, jamais un clignotement). `litSensors` : les boîtiers luisent faiblement veille. Aucun angle, aucun chiffre (« des capteurs qui la sentent tourner », sans chiffre).
- **Sur l'établi seulement** (`ghost`, `bench` 1) : une section de fusée en verre sous la tête, pour tenir les capteurs à leur place — la jupe de coiffe et le module de service dedans (`SKIRT`, `SM`), le troisième étage (`STAGE3`), le treillis ouvert (`TRUSS`), le haut du bloc central coupé net à `BENCH.floor` (−1290 : le sol de l'établi est là). Même verre que `launcher.js`. Dans le ciel : rien (`launcher.js` dessine tout ça).
- **L'éclaté** (`explode`, établi) : 0 → 1 dans UN cadre vertical (`VIEW.exploded`) — le nez et ses quatre moteurs montent (≈ +260), les deux demi-coquilles s'ouvrent en coquillage (±260 en x, un peu tournées vers l'extérieur), le module orbital monte (≈ +110), le module de descente reste, avec vous dedans ; les capteurs se décollent un peu de la section de verre (vers l'extérieur) pour se lire. Rien derrière l'en-tête.
- **Le largage de la coiffe** (`shed`) : 0 → 1, les deux demi-coquilles basculent vers l'extérieur et tombent, **le nez et ses moteurs partent avec elles** (« la coiffe qui tombe » : tout ce qui est coiffe s'en va) ; à 1 il ne reste que les deux modules nus.
- **Le module se libère** (`free`, ciel) : 0 → 1, la coiffe, son nez, ses moteurs et le module orbital montent (jusqu'à ≈ +30 m) et s'effacent ; le module de descente reste à l'origine.

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, sensors, A, parts, update(P, time, px) }`.

- `root` : un `THREE.Group` — la tête, la tour, les modules, l'équipage, le pupitre, la section de verre (établi). `sensors` : le groupe des capteurs et de leurs fils.
- `A` (ancres, `Object3D`) : `nose`, `motors` (le centre de la couronne des moteurs), `motor` (la sortie de tuyère du moteur az −45), `tower`, `om`, `dm`, `you` (ta tête), `mate`, `console`, `lamp`, `sensorA`, `sensorB` (dans `sensors`), `centre` ; et `seat` (ton siège) si tu veux.
- `parts` : `{ fairingL, fairingR, nose, motors, tower, om, dm, seats, crew, console, sensors, ghost }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (la section de verre visible), 0 dans le ciel |
| `skin` | la coiffe : 1 pleine → 0 verre (arêtes et moteurs restent) |
| `explode`, `shed`, `free` | voir plus haut (`explode` vaut 0 dans le ciel, `free` 0 sur l'établi : `world.js` s'en charge) |
| `tower` | mètres de vol de la tour depuis son siège (0 : posée) ; son jet ink dès qu'elle vole |
| `fire` | les quatre jets veille (0–1) |
| `litMotors` | 0 → 4 : les moteurs s'allument faiblement veille, un par un |
| `avaria` | la lampe АВАРИЯ du pupitre (signal) |
| `press` | vous, plaqués dans vos sièges |
| `sense`, `litSensors` | les capteurs : lampes et impulsions qui montent les fils ; les boîtiers qui luisent |
| `litShip`, `litMate`, `litYou` | ce que la voix nomme luit faiblement veille : `litShip` les deux modules (leurs arêtes), `litMate` ton équipier, `litYou` toi |

**Images à réussir** (9, liste fermée — poses de départ dans `world.js` → `VIEW`, les autres décors en bouchon) :

1. La tête dans le ciel (`VIEW.head`, `skin` 1, `litMotors` 4) : on comprend sans légende — une coiffe, quatre petits moteurs allumés en haut, la place vide de la tour.
2. **Dedans** (`VIEW.inside`, `skin` 0) : vous deux dans vos sièges, à travers la coiffe et le module de verre — les sièges pleins, les deux personnages de verre, le pupitre au-dessus ; puis `press` 1.
3. **Le pupitre** (`VIEW.console`, `avaria` 0 puis 1) : АВАРИЯ s'allume, se lit.
4. **Un moteur** (`VIEW.nozzle`, `litMotors` 4 ; puis `fire` 1) : la tuyère, puis son jet.
5. **Les quatre jets** (`VIEW.head` et `VIEW.torn`, `fire` 1) : quatre jets veille qui descendent le long de la coiffe en s'écartant ; la tête est l'objet le plus lisible.
6. L'établi (`VIEW.whole` cadré sur la tête, la section de verre qui descend hors cadre) et **l'éclaté** (`VIEW.exploded`, `explode` 1, `litMotors` 4) : tout dans un cadre vertical, sous « Système Décodé ».
7. **Les capteurs** sur leur section de verre (`VIEW.sensorsBench`, `sense` 1, `litSensors` 1) ; puis la colonne qui tourne (`tilt` 7 : c'est `world.js` qui la tourne autour de son pied — vérifie seulement que ça se lit).
8. **La fenêtre** sur l'établi (`VIEW.whole`) : `tower` 0 → 8 (la tour quitte le nez), puis `shed` 0,5 et 1 (la coiffe tombe).
9. **La tour qui part** (`VIEW.towerUp`, `tower` 12, `litMotors` 4) : candidate (d) de la première image ; et la couverture (`cover` d'`episode.json`, instant `eclate$` : éclaté, `litMotors` 4, `litYou` 1, `sense` 1 — tout le système éclairé, quelque chose luit, `el` ≥ 28, sous le titre).

---

## `src/launcher.js` — la fusée Soyouz-FG (rayons X) et le pas de tir

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/jet.js` (un grand engin aux rayons X : coque de verre, traits fins, `asShell`), `flameMaterial` de `episodes/007-siege-ejectable/src/model.js` (les jets), `episodes/008-paratonnerre/src/bolt.js` (une lumière qui a un endroit), `episodes/006-defibrillateur/src/hall.js` (un lieu aux rayons X : le pas de tir).

**Ce qu'il construit**, en cm, origine = la base du module (la fusée pend dessous ; `plan.js` : `SKIRT`, `SM`, `STAGE3`, `TRUSS`, `CORE`, `BOOSTERS`, `IMPACT`, `FAULT`, `ENGINES`, `PAD`). Tout en verre et traits fins (`glass` + `asShell`) : c'est ce qui entoure le système.

- **La jupe de coiffe** qui reste (`SKIRT`) et **le module de service** dedans (`SM` : sa jupe, ses deux panneaux solaires repliés, sa tuyère).
- **Le troisième étage** (`STAGE3`), sa baie d'instruments en haut (le capteur A y est posé), son moteur dans **le treillis ouvert** (`TRUSS` : des barres en traits — la silhouette de la Soyouz) ; **le bloc central** (`CORE` : le plus large en haut, r 148, aminci jusqu'à 104 à son pied), son moteur (quatre tuyères et quatre verniers).
- **Les quatre propulseurs** (`BOOSTERS`, la croix de Korolev) : de longs cônes (r 34 → 134), le nez appuyé contre le bloc central à y −1905, leur moteur en bas (quatre tuyères, deux verniers), leur petit aileron triangulaire. Azimuts : B +z, V +x, G −z, **D −x**. **D est LE propulseur** : dessiné comme les autres tant qu'il est attaché ; ses arêtes passent au signal dès que `bad` > 0,05.
- `sep` 0 → 1 : **les trois bons** (B, V, G) s'ouvrent — leur nez pivote vers l'extérieur autour de leur pied (la croix : vue d'en dessous, quatre pétales qui s'ouvrent ; à ≈ 0,3 c'est la croix), une courte bouffée de gaz ink à chaque nez (la croix que l'on voit du sol), puis ils tombent en tournant et disparaissent à 1.
- `bad` 0 → 1 → 2 : **D** — son pied s'écarte mais son nez pivote VERS le bloc central : **contact exactement à 1** (son nez contre le flanc du bloc, en `IMPACT`) ; de 1 à 2 il rebondit, tombe en tournant, disparaît à 2.
- `impact` 0–1 : en `IMPACT`, **la lumière qui a un endroit** (un cœur blanc de 2–3 px, une gaine et un halo signal, jamais un voile), quelques éclats lents (peu, comme les étincelles du 003) ; et une marque signal faible qui reste sur la peau du bloc tant que `impact` > 0,2 (le dégât).
- `fault` 0–1 : **la pièce faussée**, en `FAULT`, à la jonction haute de D — une petite pièce (une ferrure, une attache : ni capteur ni rotule reconnaissable — « une pièce »), visiblement tordue de quelques degrés, qui s'allume signal. Lisible sur `VIEW.fault` (d 420).
- `burn` 0–1 : **le jet du bloc central** (ink : un cœur presque blanc aux tuyères qui refroidit le long du jet ; à 50 km, l'air est mince : le jet s'élargit en un grand panache pâle). `boost` 0–1 : les jets des quatre propulseurs, plus petits (ils meurent à la séparation).
- `trail` 0–1 : **la traînée** sous la fusée, longue, pâle, qui s'élargit — le chemin d'où elle vient. Elle reste dans le ciel quand la fusée tourne : `update` reçoit `tilt` — contre-tourne-la autour des moteurs (`world.js` tourne tout le groupe). Ses ondulations avancent avec `flown`.
- `shell` 0–1 : les rayons X de la fusée (le verre, les traits).
- **Le pas de tir** (`pad`, un groupe À PART, son pont à son y 0 : `world.js` le pose sur le sol, y = −alt·1e5) : Baïkonour, en verre — le pont autour d'une grande fosse à flammes (`PAD.pit`), **les quatre bras** qui tiennent la fusée suspendue au niveau du haut des propulseurs (≈ `PAD.arms` − `PAD.deck` au-dessus du pont), les deux demi-portiques de service rabattus, deux mâts. `pad` 0–1.

**API à rendre** (exactement) : `export function buildLauncher()` → `{ group, pad, A, update(P, time, px) }`.

- `group` : la fusée (`world.js` la tourne, la secoue, la laisse tomber ; il y monte les capteurs de `model.js`). `pad` : le pas de tir.
- `A` : `impact`, `fault`, `boosterD` (le nez de D), `engines`, `waist`, `top` (la jonction sous la tête).
- `update(P, time, px)`, `P` : `shell`, `sep`, `bad`, `impact`, `fault`, `burn`, `boost`, `trail`, `tilt` (pour la traînée), `apart` (la fusée qui s'éloigne : sa traînée), `alt` (sur le pas de tir : la fosse, la fumée au départ), `pad`, `flown`, `airspeed`.

**Images à réussir** (8, liste fermée) :

1. **La première image et ses rivales** (planche de quatre, poses dans `docs/026-actes.md` ; `sky.js` et `model.js` en bouchon) : (a) `POSE0` — la croix d'en dessous, `sep` 0,25, `bad` 0,7 ; (b) le profil sur la courbe de la Terre ; (c) au ras du coup, `bad` 0,95. Elle arrête le pouce sans texte.
2. **La croix** (`VIEW.cross`, `sep` 0,3, `bad` 0,5) : trois propulseurs qui s'ouvrent, D qui rentre, en signal.
3. **La frappe** (`VIEW.strike`, `bad` 0,9 puis 1 avec `impact` 1, puis `impact` 0,3) : on comprend « il frappe » sans légende.
4. **Le tour** (`VIEW.stack`, `tilt` 0 puis 18) : la fusée tourne, sa traînée reste.
5. **L'arrachement** (`VIEW.torn`, `apart` 30 puis 120, `tilt` 25, `bad` 2, `sep` 1) : la fusée qui tombe sous la tête, son flanc marqué.
6. **La pièce faussée** sur le pas de tir (`VIEW.fault`, `GROUNDED`, `fault` 1) : petite, tordue, signal.
7. **Le pas de tir** (`VIEW.pad`, `GROUNDED`) : la fusée dans ses bras ; puis `burn` et `boost` 1 et `alt` de `PAD.alt` à 0,15 (MS-12 décolle : le pas de tir descend, la fumée dans la fosse).
8. `shell` 0,25 derrière la tête (`VIEW.system`) : la fusée s'efface, la tête pleine se détache.

---

## `src/sky.js` — le ciel, la Terre, la chute, le parachute, la steppe

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/jet.js` lignes 340–520 (`makeStreaks`, `backdropMat` : **pars d'une copie**), `kit/lib/atmo.js` (`makeMotes`, `makeContact`), `episodes/008-paratonnerre/src/bolt.js` (une lumière qui a un endroit).

**Ce qu'il construit**, autour du module (l'origine), dans le repère de la scène — `world.js` ne le tourne jamais (`plan.js` : `EARTH`, `CHUTE`, `DM`, `TEASER`) :

- **Le dôme** (à l'infini, copie de `backdropMat` du 007) : le ciel noir ; **le limbe** — l'horizon de la Terre, à l'angle que donne `alt` (km, rayon `EARTH.R`) : une ligne claire et fine, et au-dessus une bande d'air pâle, mince ; sous lui la Terre, sombre, quelques strates de nuages très bas (ink, faibles) ; à 93 km la courbe se voit franchement ; en dessous de ≈ 2 km, **la steppe** — un sol plat, sa grille sans scintillement (les niveaux du 007), l'horizon plat. `pitch` (degrés) penche la verticale locale (le dôme tourne autour de z) : une caméra en `roll` remet l'horizon de niveau. Pas d'étoiles, pas de bleu.
- **L'air qui défile** (copie de `makeStreaks`) : des traînées fines ink autour du module, le long de y, qui avancent avec `flown` ; leur longueur suit |`airspeed`|, leur sens son signe (+ on monte : elles descendent ; − on tombe : elles montent) ; rares à 50–93 km (l'air est mince), denses pendant la chute ; aucune à 0.
- **La gaine de la chute** (`heat` 0–1) : le module tombe bouclier en bas — sous le bouclier, un bord chauffé à blanc, une gaine d'air chaud signal qui remonte le long du module et un long sillage au-dessus de lui (signal qui retombe vers l'ink). Une lumière qui a un endroit (le bord du bouclier), jamais un voile.
- **Le parachute** (`chute` 0 → 1) : accroché en `CHUTE.riser` (le haut du module) — la sangle et les suspentes (ink, ≥ 1,8 px) qui convergent, la voilure (`CHUTE.r`, `CHUTE.depth`, **plus petite que la vraie**) en verre, ses fuseaux en traits fins, son évent ; de 0 à 0,35 les suspentes se déroulent avec un petit extracteur, puis la voilure s'ouvre (rifée, puis pleine) ; elle respire doucement.
- **La dernière poussée** (`retro` 0–1) : sous le module, tout près du sol (`alt` < 0,005), un éclat court (un anneau de lumière à cœur blanc, ink) et **la poussière de la steppe** projetée en anneau (`makeMotes` : traînées lentes, ink, éclairées par l'éclat) ; à `alt` 0, le module posé (`makeContact`).
- **Le teaser du 027** (`truck`) : loin dans la nuit (`TEASER` : az 25°, ≈ 3,8 km), une route (un trait ink fin) qui descend une pente ; deux phares (ink, cœur et petit halo, ≥ 3 px) qui la descendent (0 → 0,8) ; puis, au bord de la route, une courte bretelle qui monte, éclairée **veille** (la sortie : le système du prochain dossier) (0,8 → 1). Petit, net. Aucun texte.

**API à rendre** (exactement) : `export function buildSky()` → `{ group, A, update(P, time, px) }`.

- `group` : tout ce qui précède, autour de l'origine (`world.js` l'ajoute à la scène, jamais tourné).
- `A` : `canopy` (le centre de la voilure), `ground` (le point du sol sous le module : y = −alt·1e5), `truck` (les phares).
- `update(P, time, px)`, `P` : `alt`, `pitch`, `flown`, `airspeed`, `heat`, `chute`, `retro`, `truck`.

**Images à réussir** (8, liste fermée ; la fusée et la tête en bouchon) :

1. **50 km** (`VIEW.stack`, `alt` 50) : le limbe sous la fusée, le noir au-dessus ; puis `pitch` 22 avec une caméra `roll` −22 (candidate b).
2. D'en dessous (`POSE0`) : le ciel ne se lit pas comme un gris uniforme ; le limbe au bord du cadre si on le voit.
3. **93 km** (`VIEW.apogee`, `alt` 93) : la courbe de la Terre sous le module.
4. **La chute** (`VIEW.fall`, `alt` 60 → 30, `airspeed` −1, `heat` 1) : la gaine, les traînées qui montent.
5. **Le parachute** (`VIEW.chute`, `alt` 1,5, `chute` 0,35 puis 1) : le module ET sa voilure se lisent dans le même cadre.
6. **La steppe** (`VIEW.ground`, `alt` 0,002 puis 0, `retro` 1 puis 0) : l'éclat, la poussière, puis le module posé.
7. **Le pas de tir la nuit** (`VIEW.pad`, `alt` `PAD.alt`, avec le pas de tir de `launcher.js` en bouchon) : le sol et l'horizon justes sous la fusée.
8. **Le teaser** (`truck` 0,5 puis 1), du module posé sur la steppe vers az 25 (pose : `{ tx: 0, ty: 150, tz: 0, d: 900, az: -155, el: 2, fov: 40, shift: 120 }`) : les phares qui descendent, puis la bretelle.

---

## Le décorateur (après les trois décors, avant la première image)

`src/habillage.js`, recette `docs/recette-decorateur.md`. Ce qu'il habille : **le pas de tir** (`launcher.js` : projecteurs sur mâts, la nuit autour — rien qui ne soit sûr, sans texte) et **la steppe** (`sky.js` : herbe rase, au loin les lumières des hélicoptères des secours — sourcés : « en quelques minutes ») ; à 50 km, rien de plus que ce que fait le dôme. **Jamais** sur la fusée, sur la tête ni devant elles.
