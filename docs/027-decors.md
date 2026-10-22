# 027 · Voie de détresse — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/027-voie-de-detresse/src/model.js` (le système : la voie de détresse et la roue avant gauche, son tambour), `src/camion.js` (le poids lourd de verre, toi au volant), `src/col.js` (la route de montagne la nuit, le virage, le ravin, la vallée). Les trois existent en **bouchon** : le film se construit, `npm run check -- 027` passe ; tu remplaces ton fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `RUN`, `apply`, les aides `road`, `frame`, `travel`, `benchPoint`, `lanePoint`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/027-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/027-voie-de-detresse.md` et `027-contre-verification.md` — leurs « À ne pas dire » d'abord (aucune température, aucune distance d'arrêt, aucun « mur » : une glissière). **La voix est enregistrée** (86,1 s) : `npm run script -- 027` donne la table.

**On réutilise, on ne remodélise pas.** Il n'existe ni poids lourd aux rayons X ni route de montagne : ces deux fichiers sont neufs, mais leurs gestes existent — **copie et adapte, ne touche jamais aux fichiers des autres épisodes** (ni au kit) : la peau de verre d'un véhicule, ses vitres, toi assis au volant, tes mains qui suivent `steer`, ton pied droit sur la pédale (`episodes/014-abs/src/street.js`, l. 883 et suivantes : `buildStreet`, `makeFigure({ shell: true, hands: "real" })`, `A.foot`) ; la route mouillée, sa peinture, ses tirets, l'étalement à vitesse (`014-abs/src/street.js`, `makeRoad`) ; les bas-côtés, la lisière, les fossés (`025-esp/src/route.js`) ; les braises qui tombent (`makeEmbers` : `003-ascenseur/src/shaft.js`, `007-siege-ejectable/src/model.js`) ; un lieu aux rayons X (`006-defibrillateur/src/hall.js`) ; un fond de ciel la nuit et des traînées (`007-siege-ejectable/src/jet.js`, l. 340–520).

**L'échelle** : vraie en travers et en hauteur (le camion de 16,6 m, la route de 7 m, la voie de 4,5 m, la roue de 107 cm, les grains de 10/14 mm) ; **resserrée le long de la descente** (le panneau 52 m avant la fosse, une fosse de 66 m, l'arrêt 40 m après l'entrée, 500 m du haut du col au virage) — rien ne l'affiche, `sources` le dit.

**Le repère est celui de la route** (`plan.js`) : l'origine est l'essieu avant du camion, sur la route, à la première image (`s` = 0) ; le camion descend vers **−z** (son nez en −z) ; sa voie est centrée sur x = 0, l'autre voie à x = −350 ; **la GAUCHE est −x** (la montagne), **la DROITE +x** (la voie de détresse, puis le ravin). **La descente** : la route, ses bas-côtés et la voie sont sur UN plan, y = `SLOPE`·z (8 %) — à 20 m derrière le camion, la route est 1,6 m plus haut : `road(x, h, z)` (world.js) donne un point à `h` cm au-dessus d'elle. Le camion court sur son chemin (`truckAt(s)`, plan.js) : droit dans sa voie, puis de `PATH.s0` à `PATH.s1` un S vers la droite (cap 16° au plus) qui le pose dans l'axe de la fosse. **Azimut** (`kit/lib/stage.js`, vérifié sur planche : la caméra est en t + d·(sin az·cos el, sin el, cos az·cos el)) : `az` 0 se tient en +z, DERRIÈRE le camion, en amont ; −90 à son flanc GAUCHE ; +90 à droite ; ±180 devant, en aval. La lumière clé vient de −x, +y, +z (derrière à gauche) : on filme le plus souvent entre az −20 et −70 — d'où la roue-héros à **gauche**, côté conducteur.

**La caméra roule avec le camion** (`ride` 1) : un plan écrit autour du camion tel qu'il est à la première image le suit dans la descente (le réalisateur ajoute `travel(s)`). **Dans `look`, une pose complète est ABSOLUE** : pour une pose écrite autour du camion, ajoute `travel(s)` à `tx, ty, tz` — table ci-dessous. `frame(caméra, cible, objectif)` (world.js) écrit une pose juste à partir de deux points.

| `s` (m) | `travel(s)` = [x, y, z] | | `s` (m) | `travel(s)` |
| --- | --- | --- | --- | --- |
| −150 (haut du col) | 0, 1200, 15000 | | 237 (milieu du S, cap 16°) | 235, −1896, −23700 |
| 0 (image 0) | 0, 0, 0 | | 252 (tête de la fosse) | 470, −2016, −25200 |
| 140 | 0, −1120, −14000 | | 270 | 470, −2160, −27000 |
| 167 (`RUN.freeze`) | 0, −1336, −16700 | | 292 (`STOP`) | 470, −2336, −29200 |
| 220 (`RUN.zero`) | 0, −1760, −22000 | | | |

**Le banc** : la même voie, posée sur son bloc de terre (`BLOCK` = 120 cm sous sa surface), le banc incliné comme la pente : la coupe vers le banc est un simple déplacement, elle raccorde **en place** (vérifié sur planche : même pose, même image). Un point de la voie sur le banc : `benchPoint(x, y, z)`.

**Couleurs** : signal = la menace (la chaleur des tambours et leurs braises, les feux stop qui brûlent sans que rien ne ralentisse, les chevrons du virage, le bord du ravin) ; veille = le système vivant (la voie : le damier du panneau, la lèvre de la fosse, le lustre du gravier ; et ce qu'elle fait : les ornières, la vague de gravier) ; ink = le reste (le camion de verre, la route, la montagne, toi). La nuit, pas de bleu (le C26a réel est bleu : ici une plaque sombre, son damier veille, **aucun texte**). Personne n'est blessé ; le ravin n'est jamais atteint ; aucun corps.

---

## `src/model.js` — la voie de détresse et la roue (le système, PLEIN)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres), `episodes/014-abs/src/model.js` (un frein dans une roue, son disque qui chauffe), `episodes/008-paratonnerre/src/model.js` (un système long qui s'ouvre en rangée), `kit/lib/build3d.js`.

**Ce qu'il construit**, en cm, dans le repère de la voie (`plan.js`, `LANE` : origine à la tête de la fosse, sur son axe, à sa surface ; la fosse court vers −z) :

- **Le panneau** (C26a, `PANEL`) sur le bas-côté droit de la route, « bien avant » : un poteau, une plaque carrée sombre, son symbole en veille — un damier et une flèche qui part à droite. Aucun texte.
- **L'accès** (`ACCESS`) : le biseau de bitume qui quitte la route au bord droit (x = 175) à `ACCESS.s0` et s'élargit jusqu'à toute la largeur de la fosse à sa tête — asphalte plein, sombre ; son bord avec la fosse est **net** (« quittent le bitume » : on doit voir où le bitume s'arrête). Sa limite gauche suit le bord droit de la route jusqu'au virage (`CURVE`) : `col.js` ne dessine rien dessous.
- **La fosse** (`BED` : 66 m, 4,5 m de large, ≈ 90 cm de profond) : sa lèvre (une bordure béton ou terre, veille faible avec `laneLit`), ses parois (vues sur le banc et dans la coupe), et **le gravier rond** qui la remplit à ras : la valeur de gris la plus claire du système. Une surface (shader : galets ronds de 1,2 cm, fondus en gris moyen dès qu'ils passent sous le pixel — `fwidth`) **et des grains en instances** là où une caméra s'approche (sous et devant chaque roue dans la fosse ; sur le banc : la zone des grains, les deux moitiés, la coupe). Les grains d'instances sont **attachés à des cellules du monde** (un treillis haché, déterministe) : quand une roue avance, ils restent en place puis sont poussés quand le pneu arrive. **Les ornières** : de la tête de la fosse jusqu'à chaque roue dans le lit (lignes des roues à x = ±102,5 autour de l'axe ; l'essieu `i` à `s − AXLES[i]`, `inBed`), un sillon de `SINK·sink` de profondeur, et **la vague de gravier** devant chaque pneu : « chaque tour de roue pousse le gravier devant elle ». Rien ne dépend d'autre chose que de l'état (`s`, `sink`).
- **La glissière béton** (`RAIL`, profil GBA, gris moyen) le long du côté DROIT de la fosse — jamais « un mur » (contre-vérification).
- **La butte de terre** (`BERM`) qui ferme la fosse : 1 m au plus, terre sombre (la valeur la plus sombre).
- **Le bord de route** (sur le banc seulement) : un ruban de la voie de droite (bitume, sa rive encre) le long de l'accès, de `ACCESS.s0` − 10 m jusqu'au virage, pour que « la voie quitte la route » se lise sur le banc (dans la scène, c'est `col.js` qui dessine la route : caché).
- **Le bloc** (sur le banc seulement) : la terre sous toute la voie, 120 cm, ses faces coupées montrant la couche de gravier — le socle de l'autopsie. Dans la scène il est caché (sous la plateforme de `col.js`).
- **Sur le banc seulement — la comparaison** (`DEMO`) : les 24 premiers mètres de la fosse partagés en long par un muret ; la moitié GAUCHE garde ses grains ronds, la moitié DROITE se remplit de **grains concassés** (anguleux, facettes nettes) avec `crushed` ; **la roue jumelle** (la même roue sans son frein) roule dans la moitié concassée (`twinS`), la roue-héros dans la ronde (`benchS`) ; chacune laisse son ornière. Aucun chiffre.
- **Sur le banc seulement — la coupe** (`section`) : la moitié ronde ouverte du côté gauche, de la tête de la roue-héros arrêtée (`DEMO.round`) sur ±3 m : la face coupée montre les grains en profondeur ; sous la roue qui s'enfonce, les grains roulent et s'écartent.
- **LA ROUE-HÉROS** (`wheel`, la roue avant gauche du camion) : pneu plein (caoutchouc sombre, sculptures franches — la rotation se lit ; leur contraste s'efface avec la vitesse angulaire, sinon elles sautent d'une image à l'autre), jante acier (gris moyen, ses trous), moyeu ; dedans, **le frein à tambour** (`DRUM`) : le tambour (fonte, sombre ; sa face intérieure chauffe en signal avec `heat` — une lumière qui a un endroit, jamais un voile ; il « gonfle » d'un cheveu à chaud si ça se lit), deux mâchoires (acier), leurs **garnitures** (gris-brun ; signal à chaud), la came en S et son axe. **`cutaway`** ôte un quart du pneu, de la jante et du tambour, côté extérieur (−x) : on voit les mâchoires intactes — « ils ne sont pas cassés » — et la chaleur dedans. Les mâchoires s'écartent avec `pedal` (le contact se lit).

**API à rendre** (exactement) : `export function buildLane()` → `{ root, wheel, A, parts, update(P, time, px) }`.

- `root` : la voie (tout sauf la roue-héros), dans son repère. `world.js` la pose à `LANE.at` inclinée de `TILT` (scène) ou sur son bloc (banc).
- `wheel` : la roue-héros, origine au centre du moyeu, essieu selon x, face extérieure vers −x. `world.js` l'accroche à `camion.js` → `A.hubFL` dans la scène (qui braque et s'enfonce), à ton `A.benchWheel` sur le banc. Elle tourne d'elle-même : de `s` dans la scène (100·s / 53 rad), de `benchS` sur le banc.
- `A` (`Object3D`) : `panel`, `access`, `gravel`, `rail`, `berm`, `round`, `crushed`, `section`, `benchWheel` (le montage de la roue sur le banc, que tu déplaces avec `benchS` et `sink`), `twin`, `drum`, `shoe`, `tyre` (l'avant du contact : là où le gravier est poussé).
- `parts` : `{ panel, access, roadEdge, pit, gravel, rail, berm, crushed, twin, tyre, rim, drum, shoes }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur le banc (le bloc, la comparaison, la coupe), 0 dans la scène |
| `s` | dans la scène : la rotation de la roue-héros ; les ornières et les vagues de gravier jusqu'aux roues (`truckAt`, `AXLES`, `inBed`) |
| `sink` | dans la scène : la profondeur des sillons et des vagues (la roue elle-même s'enfonce avec le camion) ; sur le banc : la roue-héros et la jumelle descendent de `SINK·sink` |
| `heat` | la chaleur du tambour-héros (0 froid → 1 au rouge) |
| `cutaway` | le quart ouvert du pneu, de la jante, du tambour (0–1) |
| `pedal` | les mâchoires s'écartent (0 relâché → 1 serré) |
| `laneLit` | la voie vivante : le damier, la lèvre de la fosse, le lustre du gravier, veille (0,35 sur l'image 0 : petit mais lisible) |
| `explode` | sur le banc : 0 assemblé → 1 les pièces écartées dans UN cadre vertical vu de `VIEW.exploded` — le panneau monte, le gravier sort de sa fosse (la fosse vide se lit), la glissière monte et s'écarte, la butte monte ; le bloc reste |
| `litPanel`, `litAccess`, `litGravel`, `litRail`, `litBerm` | la pièce que la voix nomme luit faiblement veille |
| `crushed` | sur le banc : la moitié droite concassée, le muret, la roue jumelle (0–1) |
| `benchS`, `twinS` | sur le banc : les mètres roulés par la roue-héros (s'arrête à `DEMO.round`) et la jumelle (`DEMO.crushed`) depuis la tête de la fosse |
| `section` | sur le banc : la coupe ouverte autour de la roue-héros arrêtée (0–1) |
| `wheelIn` | sur le banc : la roue-héros (et la jumelle avec `crushed`) présente (0 → 1) |

**Images à réussir** (8, liste fermée — poses dans `world.js` → `VIEW`, ou `frame()`) :

1. **L'éclaté** (`VIEW.exploded`, `set` 0, `explode` 1, `laneLit` 1) : la voie se lit en rangée — panneau, accès, fosse vide et son gravier soulevé, glissière, butte — dans un cadre vertical, sous la ligne « Système Décodé ». Et **la couverture** (`cover` d'`episode.json`, instant `eclate$`, `shift` −480 : tout éclairé, `el` ≥ 28).
2. Le panneau (`VIEW.panelBench`, `litPanel` 1) : un C26a sans texte, son damier veille.
3. **Les grains** (`VIEW.grains`, `d` 70) : des grains RONDS, chacun lisible (≥ 30 px à 1080), la lumière sur eux ; puis la même pose sur la moitié concassée (`crushed` 1, `tx` + 220) : des facettes.
4. **La comparaison** (`VIEW.demo`, `crushed` 1, `wheelIn` 1, `sink` 0,5, `benchS` 8, `twinS` 20) : deux roues, deux ornières, l'une deux fois et demie plus longue — lisible à 270 px.
5. **La coupe** (`VIEW.section`, `section` 1, `benchS` 8, `sink` 0,5 puis 1) : la face coupée, les grains en profondeur, la roue qui descend, les grains qui s'écartent de dessous.
6. **Le tambour** (`VIEW.drum` + `travel(0)`, `cutaway` 0 puis 1, `heat` 0,8 puis 1) : le tambour ouvert, les mâchoires entières, la garniture et la face du tambour au rouge.
7. **La roue dans le gravier** (`VIEW.sinkL` + `travel(270)`, `s` 270, `sink` 1) : enfoncée d'une trentaine de centimètres, la vague devant, l'ornière derrière.
8. **D'en haut** (`VIEW.top` + `travel(292)`, `s` 292, `sink` 1) : la fosse, ses ornières de la tête jusqu'au camion arrêté (dessiné par `camion.js`), la butte intacte devant ; et sur l'image 0 (`POSE0`) : la voie, loin à droite, **petite mais lisible** (veille).

---

## `src/camion.js` — le poids lourd de verre, toi au volant

**À lire pour l'idiome** : `episodes/014-abs/src/street.js` (la peau de verre d'un véhicule, ses vitres, ses arêtes, toi assis, tes mains, ton pied sur la pédale : **pars de ces gestes**, dans les proportions d'un camion), `episodes/006-defibrillateur/src/hall.js` (un objet aux rayons X), `kit/lib/figure.js`, `kit/lib/build3d.js` (`glass` + `asShell`).

**Ce qu'il construit**, en cm, dans le repère du camion (`plan.js`, `TRUCK` : origine au centre de l'essieu avant au sol, nez vers −z, toi côté −x) — **de verre** (`glass` + `asShell`, traits fins, aucun aplat), sobre : seuls comptent les roues, les freins et la cabine.

- **Le tracteur** 4×2 : une cabine européenne à face plate (pare-brise, vitres latérales, déflecteur de toit), le châssis (deux longerons), le réservoir, la sellette (`TRUCK.kingpin`), le pare-chocs, les phares (encre : un cœur et une traînée, une lumière qui a un endroit — leur flaque sur la route est à `col.js`), les rétroviseurs.
- **La semi-remorque** (13,6 m, un fourgon) et ses trois essieux : elle **tourne sur la sellette** pour que ses essieux restent sur le chemin (`truckAt(s − 10,9)`, l'articulation se déduit du cap) ; ses feux arrière.
- **Neuf roues** (toutes sauf l'avant gauche, qui est à `model.js`) : pneus de verre (des anneaux, l'essieu moteur jumelé), et dedans, PLEINS, **les tambours** (fonte sombre) qui chauffent avec `heat` (signal) ; **des braises** qui en tombent et filent en arrière (des traînées, jamais des points ; périodiques : vivantes dès l'image 0 ; leur longueur suit `kmh`). Les roues tournent de `s` (100·s / 53 rad), l'étalement à vitesse (rien de fin qui saute d'une image à l'autre).
- **Les feux stop** (signal) : allumés quand `pedal` > 0,08 — ils brûlent pendant que le camion accélère : c'est la menace.
- **`A.hubFL`** : le moyeu avant gauche, où `world.js` accroche la roue-héros de `model.js` : il **braque** avec `steer` (30° à 1, + vers la droite) et **s'enfonce** avec l'essieu avant.
- **L'enfoncement** : chaque essieu descend de `SINK·sink·inBed(s − AXLES[i])` une fois dans le gravier ; la caisse suit (le nez plonge quand l'avant entre, puis tout le camion est bas) — d'une trentaine de centimètres, jamais enterré.
- **Toi**, de verre (`makeFigure`, comme au 014), assis à gauche : mains sur le volant (plein) qui tourne de `steer` (100° à 1) ; **ton pied droit sur la pédale de frein** (pleine, `YOU.pedal`) : `pedal` l'enfonce (0 levé, pied au-dessus → 1 au plancher) — « c'est ton propre pied », « la pédale s'enfonce », « sans toucher la pédale » se lisent sur elle. Jamais de très gros plan sur toi, jamais la main seule.

**API à rendre** (exactement) : `export function buildTruck()` → `{ group, A, update(P, time, px) }`.

- `group` : tout le camion dans son repère ; `world.js` le pose à `truckAt(s)`, tourné de son cap, incliné de la pente.
- `A` : `hubFL`, `cab`, `seat`, `pedal`, `foot`, `hands`, `lamps` (le milieu des phares : `world.js` en tire la flaque de `col.js`), `kingpin`, `tail`, `rearDrum`, `driveDrum`.
- `update(P, time, px)`, `P = { s, kmh, pedal, steer, heat, sink, you, shell }` :

| nombre | ce que tu en fais |
| --- | --- |
| `s` | la rotation des roues ; l'articulation de la remorque (chemin) ; l'essieu qui est dans le gravier (`inBed`) |
| `kmh` | l'étalement : braises, sculptures, tout ce qui file |
| `pedal` | la pédale et ton pied ; les feux stop (> 0,08) |
| `steer` | le volant (100°), les roues avant (30°, + à droite) |
| `heat` | les tambours (signal), leurs braises (0 rien → 1 au rouge, braises nombreuses) |
| `sink` | l'enfoncement des essieux qui sont dans le gravier |
| `you` | toi (0/1) |
| `shell` | le verre du camion (0–1) |

**Images à réussir** (8, liste fermée — `frame()` ou `VIEW`, + `travel(s)` dans `look`) :

1. **Les quatre candidates de la première image** (planche de quatre, `s` 0, `heat` 0,8, `pedal` 0,6, `kmh` 72) : (a) `VIEW.rear` = `POSE0` « les tambours », (b) `VIEW.wheel` « la roue », (c) `VIEW.under` « dessous », (d) `VIEW.map` « la carte » — chacune notée sur les six points (`docs/027-actes.md`). Elles arrêtent le pouce sans texte : un poids lourd reconnu en un tiers de seconde.
2. `VIEW.side` + `travel(110)` : le camion entier qui dévale, ses tambours rouges, ses braises.
3. `VIEW.pedal` : ton pied sur la pédale, `pedal` 0,6 puis 1 (elle s'enfonce), puis 0 (levé, au-dessus d'elle).
4. `VIEW.hands` : tes mains, `steer` 0 puis 0,5 (le volant tourne à droite).
5. `VIEW.entry` + `travel(252)`, `s` 252, `steer` 0,2, `sink` 0,5 : les roues avant qui plongent, le nez qui pique (la fosse est à `model.js`).
6. `VIEW.bedWide` + `travel(292)`, `s` 292, `sink` 1 : tout le camion bas dans le lit, la remorque dans l'axe.
7. `VIEW.colTop` + `travel(-150)`, `s` −150, `pedal` 1, `heat` 0,4 : le camion qui descend du haut du col, feux stop allumés.
8. La chaleur : `VIEW.rear`, `heat` 0,2 (tambours sombres, aucune braise) contre `heat` 1.

---

## `src/col.js` — la route de montagne la nuit, le virage, le ravin (rayons X)

**À lire pour l'idiome** : `episodes/014-abs/src/street.js` (`makeRoad` : l'asphalte, sa peinture, ses tirets, l'étalement — **copie**), `episodes/025-esp/src/route.js` (bas-côtés, fossés, lisière, balises), `episodes/007-siege-ejectable/src/jet.js` l. 340–520 (le ciel), `episodes/006-defibrillateur/src/hall.js`.

**Ce qu'il construit**, en cm, dans le repère de la route (`plan.js`), **sur le plan de la pente** (y = `SLOPE`·z) :

- **La route** (`ROAD`) : du **haut du col** (`ROAD.top` : elle passe la crête, le ciel derrière) jusqu'au **virage à GAUCHE** en bas (`CURVE` : 25 m de rayon à l'axe, 75°) et un peu au-delà. Asphalte presque noir (un shader à toi, **pas** `solid()` : la matière `finish` y met du bruit), lignes de rive encre, tirets de l'axe (3 m / 10 m), étalés à vitesse. **La flaque des phares** sur la route (de `P.lamp`, `P.beam` : un cône doux, encre, qui se déplace avec le camion — une lumière qui a un endroit). **Des repères de vitesse** : des balises de bord de route tous les 25 m des deux côtés (blanches, sobres) — c'est ce qui file dans l'image 0. La rive droite devient pointillée où l'accès la quitte (`ACCESS.s0` → `CURVE.s`).
- **Les bas-côtés** : une grille (pas de sol plein). **Ne dessine rien** sur l'emprise de la voie (`model.js`) : x de `BED.x − 400` à `RAIL.x + 100`, s de `ACCESS.s0` à `BERM.s1` + 2, ni sur l'accès (entre le bord droit de la route et la fosse).
- **La montagne à gauche** (`MOUNTAIN`) : une pente raide qui monte du bas-côté gauche jusqu'à sa crête, de verre, en courbes de niveau sobres ; l'éperon autour duquel tourne le virage. Elle ne doit jamais être un mur clair qui bave (sur le bouchon, son grand plan de verre fait une dalle blanche : à éviter).
- **Le virage** : sa glissière (verre, traits) sur le bord extérieur, et **sept chevrons** (J4, signal) qui luisent avec `danger` — la menace qu'on voit de loin, au fond de la descente.
- **Le bord du ravin** (`EDGE.line`) : la lèvre de la plateforme (un trait signal, `danger`), puis la falaise qui tombe (`EDGE.drop`, 120 m) en courbes de niveau ; au-delà, **le vide** : sombre, mais avec de la profondeur (l'autre versant de la vallée, une crête contre un ciel à peine moins noir).
- **La vallée** en bas : son fond (une grille qui s'efface), **un village** (quelques maisons de verre, quelques lumières encre), et **la maison du prochain dossier** (`HOME`) dont la fenêtre s'allume avec `home` (encre : « chez toi »).
- Le ciel : nuit ; des étoiles seulement si elles tiennent (fixes, ≥ 2,4 px, aucun scintillement) — dans le doute, aucune.
- Le décorateur passera après toi (`docs/recette-decorateur.md`) : laisse de la place à la vie du lieu, ne la fais pas.

**API à rendre** (exactement) : `export function buildCol()` → `{ group, A, update(P, time, px) }`.

- `group` : dans le repère de la route, jamais déplacé.
- `A` : `bend` (le bord extérieur du virage), `chevrons` (celui du milieu), `edge` (le bord devant la butte), `ravine` (un point dans le vide), `valley`, `home`, `col` (la route au haut du col), `panelSpot`.
- `update(P, time, px)`, `P = { shell, danger, home, lamp, beam }` (`lamp`, `beam` : deux `THREE.Vector3` que `world.js` remplit à chaque image, la position monde des phares et leur direction) :

| nombre | ce que tu en fais |
| --- | --- |
| `shell` | le verre et les traits du lieu (0–1) |
| `danger` | les chevrons et le bord du ravin, signal (0,6 sur l'image 0 → 1 sur « ravin ») |
| `home` | la fenêtre de la maison dans la vallée (0–1) |
| `lamp`, `beam` | la flaque des phares sur la route |

`world.js` règle le brouillard de la scène (`FOG` = 0,000035) : s'il te faut une autre valeur, écris-la sous « À changer ailleurs ».

**Images à réussir** (7, liste fermée) :

1. `VIEW.ahead` + `travel(140)`, `danger` 1 : la descente qui plonge, les chevrons au fond, le ravin derrière (de la profondeur), la voie à droite, la montagne à gauche — « En bas, un virage… et le ravin » se lit à 270 px.
2. `VIEW.bend` (repère de la route), `danger` 1 : le virage, sa glissière, ses chevrons, le bord, le vide, la vallée loin dessous.
3. **L'image 0** (`POSE0`, avec `camion.js` tel qu'il est) : la route qui file vers son point de fuite, les balises qui défilent, la flaque des phares, les chevrons tout au fond derrière le camion.
4. `VIEW.lane` + `travel(167)` : toute la géographie de loin — le camion petit, la voie à droite, le virage, le ravin.
5. `VIEW.colTop` + `travel(-150)` : le haut du col, la route qui passe la crête, le ciel derrière.
6. `VIEW.valley`, `home` 1 : la vallée, le village, la fenêtre allumée.
7. `VIEW.map` + `travel(-120)` : le col la nuit, de haut — un camion qui descend (le plan du like).
