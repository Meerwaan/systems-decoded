# 039 · Le cendrier du réacteur — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/039-cendrier-reacteur/src/model.js` (le système, plein : le récupérateur de corium de l'EPR), `src/corium.js` (la menace : le cœur fondu, de la cuve à la chambre, la chaleur, la vapeur) et `src/batiment.js` (autour, aux rayons X : la cuve du 005 posée sur la fosse, le sous-sol du bâtiment réacteur, l'annonce du 040). Tous trois existent en **bouchon** : le film se construit (`npm run check -- 039`) ; tu remplaces ton fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply`). Recette : `docs/recette-agents.md`. Plan de mise en scène : `docs/039-actes.md` (son haut, et les lignes qui te concernent). Faits : `docs/faits/039-cendrier-reacteur.md` § 4 et § 10, `docs/faits/039-contre-verification.md` « Reste ouvert ». **La voix est enregistrée** (93,4 s) : `npm run script -- 039`.

**Un seul lieu, trois couches.** Pas de re-parentage : le système, le corium et le bâtiment sont dans la scène au même repère ; l'établi (`set` 0) est **le même endroit**, bâtiment effacé, un halo dessous (`makeBench(SIZE)` posé à `BASEMENT.floor`). La coupe vers l'établi se fait donc en place, et l'éclaté s'ouvre là.

**Le repère** (`plan.js`) : origine au centre du sol de la fosse, **sur** son béton sacrificiel (y 0), à l'aplomb de la cuve (axe y). Le chemin du corium part vers **+z** : fosse (z 0) → porte fusible (sous le centre du sol) → chute → canal → chambre d'étalement (z 750 → 2450, plus bas : sol à y −330). La piscine (un secteur de l'IRWST) est à côté de la chambre, côté **+x**. **Azimut vérifié** (`kit/lib/stage.js` : la caméra est en t + d·(sin az·cos el, sin el, cos az·cos el)) : `az` 0 se tient en +z, au bout de la chambre, et regarde vers la fosse ; −90 à −x ; ±180 derrière la fosse. Sur planche (bouchons) : à `az` −18 la chambre est devant, le canal, puis la fosse et sa cuve rouge derrière, empilés dans le cadre vertical — **le bon axe pour tout plan large** ; de flanc (`az` −50), le tout ne tient pas en largeur. La lumière clé vient de −x, +y, +z.

**L'échelle** : la chambre est **vraie en surface** (1000 × 1700 cm = 170 m², ASN / IRSN) — la seule grandeur affichée du film (`chip-170`). Tout le reste est une **maquette** aux proportions plausibles, jamais écrite : la cuve est celle du 005 (900 MWe), la fosse, la porte, le canal, la piscine et les vannes sont placés pour l'image (`sources` le dit). Le pied de la cuve est à 2,6 m au-dessus du sol de la fosse (`VESSEL.low`).

**Couleurs** : signal = le corium, sa chaleur, le ventre rouge, l'explosion de vapeur ; veille = le système vivant (la porte quand on la nomme, les vannes qui s'ouvrent, le chemin de l'eau quand elle part, le liseré du système qui a gagné) ; ink = le bâtiment, le verre de la cuve, **l'eau elle-même** (verre clair, pas de bleu), la vapeur. Personne dans le bâtiment.

**À ne pas montrer** (faits § 10, contre-vérification) : de l'eau dans la chambre avant l'étalement ; la chambre sous la cuve (elle est **à côté**) ; un corium qui tombe directement dans la chambre (il passe par la fosse, la porte, le canal) ; un « ça a déjà servi ». La mer orange s'étale vite (quelques dizaines de secondes), puis reste immobile pendant les minutes.

---

## model.js

**Le système, plein**, neuf : rien de comparable dans le catalogue. À lire pour l'idiome : `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres), `kit/lib/build3d.js` (têtes), `docs/memoire/regles-image.md`.

**Ce qu'il construit** (cotes de `plan.js`) :
- **La fosse** (`PIT`) : le revêtement de **béton sacrificiel** (sol et paroi jusqu'à `PIT.top`, `sac` d'épaisseur), une matière de béton clair grenu ; derrière, la couche de **briques de zircone** (`zirc`) en appareil lisible sur la tranche ; la structure en béton de la fosse est à `batiment.js`. `eaten` : la face intérieure recule et devient rugueuse (jusqu'à ≈ 60 % de `sac`), les éclats tombent — « fait pour être mangé ».
- **La porte fusible** (`PLUG`, la pièce-héros, la plus claire) : une porte métallique au centre du sol, sous un bouchon de béton sacrificiel cerclé (`ring`) qui la fait lire d'en haut ; c'est le seul endroit sans zircone. `plug` : 0 froide · → 0,5 rougit (signal, une lumière qui a un endroit) · → 1 s'affaisse, fond, s'ouvre — un trou sombre bordé de lumière, la chute dessous (`SHAFT`).
- **Le canal** (`SHAFT`, `CHANNEL`) : la chute sous la porte, puis le canal de transfert en pente douce jusqu'à la bouche de la chambre ; parois de zircone, section `w` × `h`, **ouvert sur le dessus** (ou à couvercle de verre) pour que le corium s'y voie couler.
- **La chambre d'étalement** (`CHAMBER`) : le plancher et les murets en **fonte épaisse** (éléments en plaques jointives, nervures dessous = les canaux de refroidissement, `ribs`), une couche mince de béton sacrificiel dessus ; le **canal central** (`CENTRAL`) dessous ; l'espace derrière les murets par où l'eau remonte. Vide, froide, sombre au repos — mais lisible (sombre **sur le halo** sur l'établi, arêtes claires).
- **La piscine** (`POOL`, un secteur de l'IRWST) : le bassin (béton, plein, plus sombre que le système), son eau immobile (`ink`, verre clair, reflets fins) au niveau `level`.
- **Les vannes passives** (`VALVES`, deux) bas dans la paroi de la piscine, leurs conduites (`PIPES`) jusqu'au canal central, et leurs **déclencheurs** (`TRIGGERS`) posés au ras de la dalle près du muret +x, chacun relié à sa vanne (tige ou câble ≥ 1,8 px). `valves` : le clapet bascule, **de profil dans `VIEW.valve`** (vérifier le sens sur deux images) ; `triggers` : le déclencheur se brise, s'affaisse, tombe en morceaux.
- **L'eau** (`water`, ink ; ses têtes en veille) : 0 dans la piscine · → 0,25 des têtes veille descendent les conduites · → 0,5 le canal central se remplit · → 0,8 elle remonte derrière les murets et entre par les bords · 1 elle déborde **sur** la galette (au niveau `FLOOD.level`, au-dessus de la galette, y −310) ; le niveau de la piscine baisse un peu.
- `guard` : le liseré veille de tout le système (il a gagné) ; `lit…` : la pièce que la voix nomme luit faiblement veille (une lueur qui a un endroit, jamais un voile).
- **L'éclaté** (`explode`) : six morceaux dans **un** cadre vertical (`VIEW.exploded`, `az` −18 : il s'empile en profondeur) — la cuve se soulève (c'est `batiment.js` qui la monte de 700), le revêtement de la fosse monte, la porte descend sous lui, le canal, la chambre, la piscine et ses vannes s'écartent. `SPREAD` (en tête du bouchon) est à régler pour que tout tienne dans `VIEW.exploded`, rien hors du cadre, rien devant la porte.

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.
- `root` : un `THREE.Group`, ajouté une fois à la scène (pas de re-parentage).
- `A` (ancres, `Object3D`, qui suivent l'éclaté) : `pit`, `plug`, `channel`, `mouth` (la bouche du canal dans la chambre), `chamber`, `heap` (`HEAP.at`), `pool`, `valve0`, `valve1`, `trigger0`, `trigger1`, `centre`.
- `parts` : `{ pit, plug, channel, chamber, pool, valves }` — chacune avec SES matières.
- `update(P, time, px)`, seize fois par image, sans allocation. `P` : `explode`, `eaten`, `plug`, `valves`, `triggers`, `water`, `guard`, `litPit`, `litPlug`, `litChannel`, `litChamber`, `litPool`, `litValves` (tous 0–1).

**Les images à réussir** (planches à 270–405 px, avec et sans en-tête) :
1. `VIEW.plugTop` : la porte froide (`plug` 0), rouge (`plug` 0,45), ouverte (`plug` 1) — trois états lisibles sans légende.
2. `POSE0` (première image) : la porte, en bas du cadre, au centre du sol, **petite mais lisible** avec `litPlug` 0,35.
3. `VIEW.exploded` : six morceaux nets sur le halo, chacun reconnaissable ; puis chaque `lit…` à 1 sur sa pièce.
4. `VIEW.graze` (établi et usine) : la chambre vide, la fonte froide, les nervures au bord, la cuve au fond.
5. `VIEW.pool` : l'eau immobile, les deux vannes basses dans la paroi.
6. `VIEW.valve` : **un déclencheur et sa vanne dans le même cadre** ; fermé, puis `triggers` 1 + `valves` 1. Sur bouchon ce plan ne se lisait pas (le muret masquait) : la pose est à refaire chez toi.
7. `water` 0,25 / 0,5 / 0,8 / 1 dans `VIEW.sheet`, avec `mass` 1 `spread` 1 (`corium.js` dessine la galette).
8. `guard` 1 dans `VIEW.sheet` : le système qui veille, sous l'eau.

**Propre au dossier** : la fonte est le métal (`metal` ≤ 0,5), le béton sacrificiel la valeur claire, la zircone une troisième valeur ; la porte la plus claire. La dalle de la chambre doit pouvoir **recevoir** la galette de `corium.js` à `CHAMBER.floor` (rien qui dépasse au-dessus du sol sauf les déclencheurs et les murets).

---

## corium.js

**La menace**, neuve : le cœur fondu, une matière lumineuse qui coule. À lire : `kit/lib/atmo.js` (`makeEmbers`, `makeMotes`, traînées), `episodes/012-gaziniere/src/hob.js` (la mousse : une surface placée par shader), `episodes/008-paratonnerre/src/bolt.js` (cœur-gaine-halo), `docs/memoire/regles-image.md` (« ce qui émet se dose », « une lumière a un endroit », braises).

**Ce qu'il construit** :
- **Le ventre** (`belly`) : la calotte inférieure de la cuve du 005 (`VESSEL` : sphère de rayon `r` posée de `belly` à `low`) qui rougit **vue de dessous** — un dégradé chaud centré sur le point bas, pas une coquille unie ; une peau à l'extérieur du verre du 005, **une seule face** (sur bouchon, vue d'en haut, l'intérieur de la calotte faisait un voile rose sur tout le cadre).
- **La brèche** (`breach`) : le trou au point bas, bord chauffé à blanc ; **`pour`** : ≈ 0,3 une goutte qui gonfle, se détache et tombe (périodique : vivante dès l'image 0, qui doit bouger **par son sujet**), des braises ; → 1 un filet continu jusqu'au sol, qui s'écrase en éclaboussure.
- **La fosse** (`pit`) : le bain qui monte (jusqu'à ≈ 80 cm), croûte sombre craquelée sur une lave signal, le bord qui ronge le béton (lueur au contact) ; `fume` : des fumées ink lentes au-dessus. **La porte reste lisible** sous le bain : un cercle plus chaud là où elle est.
- **Le flux** (`flow`) : la chute sous la porte (0 → 0,2), puis le front dans le canal (0,2 → 1) jusqu'à la bouche — une tête plus brillante, une langue qui coule (traînée), pas un bloc qui s'allonge.
- **La chambre** (`mass`, `spread`) : UN corps — `spread` 0 un tas épais (centré sur `HEAP.at`, rayon `r`, hauteur `h`), `spread` 1 une galette mince (`CHAMBER.sheet`) sur toute la dalle ; volume à peu près conservé. Le front s'étale **depuis la bouche** du canal (`CHANNEL.to`, côté fosse) vers le bout de la chambre (+z) : bord organique, bourrelet brillant, intérieur qui fonce un peu. Dans le principe, le même corps passe du tas à la galette sur place (sur `HEAP.at`).
- **La chaleur** (`arrows`) : des flèches signal **sous** le corium, dans la dalle : serrées et longues quand il est épais (elles « percent le sol »), espacées et courtes quand il est mince — leur longueur et leur espacement se lisent de `spread`.
- **Sous l'eau** (`cool`) : la galette passe de l'orange à une croûte sombre, quelques veines orange ; `steam` : vapeur ink qui monte quand l'eau la touche (`water` ≥ 0,8, de `model.js`), puis se calme.
- **Le contre-exemple** (`blast`, la chute : « trop tôt, l'eau peut exploser en vapeur ») : dans la fosse pleine (`pit` 1), de l'eau ink versée d'en haut (→ 0,3), puis une explosion de vapeur teintée signal qui gonfle et retombe (→ 1). Hypothèse, jamais un fait : rien de plus violent qu'une bouffée qui remplit la fosse.

**API à rendre** : `export function buildCorium()` → `{ group, A, update(P, time, px) }`.
- `A` : `breach`, `drop` (la goutte qui tombe, qui bouge), `pit`, `front` (la tête du flux, qui bouge), `sheet`, `blast`.
- `update(P, time, px)` : `belly`, `breach`, `pour`, `pit`, `fume`, `flow`, `mass`, `spread`, `arrows`, `cool`, `steam`, `blast`, `water` (lu seulement). `world.js` cache le groupe quand `explode` > 0,02.

**Les images à réussir** :
1. `POSE0` à 0,04, 0,3, 0,7 s : le ventre rouge en haut, la goutte qui gonfle, se détache, tombe vers nous (le cadre bouge par son sujet).
2. `pour` 1 dans `POSE0` et `VIEW.overPit` : le filet, l'éclaboussure.
3. `VIEW.overPit` : `pit` 0,3 et 0,8, `fume` 0,6 — la porte lisible sous le bain.
4. `VIEW.channel` : `flow` 0,5, la tête qui court.
5. `VIEW.sheet` : `mass` 1, `spread` 0,3 / 0,7 / 1 — « une mer orange, mince » ; le chiffre `chip-170` en zone haute ne doit rien cacher.
6. `VIEW.heap` : `spread` 0 avec `arrows` 1 (le tas, ses flèches serrées) ; puis `spread` 1 (galette, flèches espacées).
7. `VIEW.sheet` : `cool` 0,6 + `steam` 1 avec `water` 1 de `model.js`.
8. `VIEW.pitSide` : `blast` 0,3 puis 0,8.

**Propre au dossier** : au-dessus de 3, ça bave — le corium est la plus forte source du film, il doit rester une matière (croûte, veines, bourrelet), jamais une dalle orange plate (le bouchon en est une : c'est exactement ce qu'il ne faut pas). Pas de clignotement : des mouvements lents, des braises en traînées.

---

## batiment.js

**Autour, aux rayons X.** Il **réutilise** la cuve du 005 : `import { buildReactor } from "../../005-arret-urgence/src/reactor.js"` (ancien moteur, **enveloppé, jamais modifié** : son groupe est déplacé de `REACTOR.x` à `VESSEL.at`, ses nombres réglés ici). Son `update` (tête de fonction) lit `power fall reaction shell heat glow neutrons feed others sealed chain` ; le bouchon passe `power 0` (couronne éteinte), `fall 1` (grappes descendues), `reaction`/`glow` ← `core`, le reste à 0. **À vérifier sur planche** : ce que `core` allume vraiment avec `fall` 1 (le combustible pourrait rester noir sous les grappes : alors `fall` 0,6 ou ce qui se lit le mieux), et le verre du 005 vu **de dessous** (`POSE0`).

**Ce qu'il construit** :
- **La cuve** (le 005, `vessel` = l'opacité de son verre et de ses traits, `core` = la lueur de son cœur), montée de 700 par `explode`.
- **Le sous-sol du bâtiment réacteur** : la structure en béton de la fosse (un massif, épaisseur `PIT.wall`, jusqu'à `PIT.rim`, le puits autour de la cuve), le tunnel du canal, la salle de la chambre (murs à `BASEMENT.room` de la fonte, plafond `BASEMENT.ceiling`), le mur de l'enceinte qui s'incurve derrière (rayon `BASEMENT.containment`, centré sur `BASEMENT.centre`) et **s'efface au-dessus de `BASEMENT.fade`** (rien de clair ne monte derrière l'en-tête), la grille du sol à `BASEMENT.floor` (pas de sol plein). Verre et traits fins ; rien de plein.
- **L'annonce du 040** (`teaser`, loin, à `TEASER.at`) : une rangée d'abris anti-feu au sol, une ligne de feu qui se referme autour (`TEASER.ring`, signal, braises) — une silhouette, sous le panneau `#next` (zone haute), lisible à 270 px.

**API à rendre** : `export function buildBatiment()` → `{ group, reactor, A, update(P, time, px) }`. `A` : `vessel` (point bas de la cuve, qui suit `explode`), `pit`, `pool`, `teaser`. `update` : `shell`, `vessel`, `core`, `explode`, `teaser`, `bench` (1 : le bâtiment disparaît quel que soit `shell`).

**Les images à réussir** :
1. `VIEW.wide` (`shell` 1) : le bâtiment lisible et discret, la cuve rouge sur la fosse, le chemin vers nous.
2. `POSE0` : la cuve vue de dessous — énorme, son verre et ses traits ne font pas un disque vide.
3. `VIEW.chamberLow` : la cuve debout sur la fosse, derrière la chambre.
4. `VIEW.pitSide` : la fosse dans son massif de verre, ouverte à la caméra (on voit le bain dedans).
5. `VIEW.teaser` avec l'en-tête et le panneau : abris et cercle de feu sous le panneau.
6. `VIEW.exploded` sur l'établi (`bench` 1) : plus de bâtiment, la cuve soulevée en verre pâle (`vessel` 0,6).

**Propre au dossier** : le décorateur passera ensuite (`src/habillage.js`) — laisse la place à ce qui dit « un bâtiment réacteur » (caillebotis, chemins de câbles, éclairage de secours) sans le faire toi-même. Un décor qui pourra resservir (les courts du nucléaire) : garde les cotes dans `plan.js`, rien en dur.
