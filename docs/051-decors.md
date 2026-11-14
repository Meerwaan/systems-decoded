# 051 · Le brise-glace — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/051-brise-glace/src/model.js` (le système : le brise-glace, plein), `src/glace.js` (la glace à l'étrave : la plaque qui plie et casse, les blocs, les crêtes) et `src/banquise.js` (le champ de glace, la mer, le ciel, ton navire aux rayons X, la carte). Tous trois existent en **bouchon** (volumes gris) : le film se construit, on remplace le fichier en entier en gardant **exactement** ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `shokAt`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/051-actes.md` (son haut, puis les lignes qui te concernent). Faits : `docs/faits/051-brise-glace.md` et `051-contre-verification.md` — leurs « à ne pas dire » d'abord. **La voix est enregistrée** (96,9 s) : `npm run script -- 051` donne la table et les repères.

**Rien n'existe à reprendre tel quel** : le catalogue n'a ni glace de mer ni brise-glace (la voiture du 011 ne sert pas : le sujet est le navire). On reprend du **savoir-faire** par copie, jamais en touchant le fichier d'origine : la peau lissée par sections (`skin`, dans `episodes/L04-porte-avions/src/bord.js` ou `038-sous-marin/src/sousmarin.js`), la recette du navire et de la mer à l'infini (`015-brin-arret/src/carrier.js`, `L04/navire.js` : son journal dit le piège de l'ordre de rendu dans une coque), la plaque qui se fracture (`029-airbag-avalanche/src/pente.js`), les fissures drapées (`L01-pare-brise/src/casse.js`), les traînées (`makeStreaks`, 007/jet), le personnage de verre (`kit/lib/figure.js`). Ni `kit/`, ni un autre épisode ne se modifient.

**Le repère** (`plan.js`, vérifié sur bouchon) : origine = la flottaison du brise-glace au milieu du navire (y = 0, la surface de la mer), **étrave vers −z**, **bâbord = −x**, tribord = +x. Azimut (`kit/lib/stage.js`) : **az 0 se tient À L'ARRIÈRE (+z)**, −90 sur le flanc BÂBORD (−x), ±180 devant l'étrave. La clé vient de l'arrière-bâbord (−x, +y, +z). **Le brise-glace ne bouge jamais : c'est la glace qui glisse** — tout ce qui appartient à la glace (champ, floes, blocs, crêtes, ton navire) est décalé de **+`run`·100 en z** (`run` en mètres ; `run` qui baisse = il recule). Seule la plaque au contact reste sous l'étrave. Le roulis (`heel`) est fait par `world.js` (un groupe autour de l'axe long à la flottaison) : ne le refais pas. Sur l'établi, le sol est descendu à la quille (`BENCH_FLOOR`) : **mêmes coordonnées sur les deux décors**.

**L'échelle est la vraie** (un brise-glace lourd générique de ≈ 116 m, une glace d'un mètre), sauf deux libertés que `sources` dit : dans l'accroche et la boucle les deux navires sont rapprochés (`apart` ≈ 1 200 m au lieu de ≈ 11 000) ; la ceinture est dessinée plus épaisse que ses 50 mm en coupe. **Aucune longueur, aucun angle, aucune épaisseur écrits sur la 3D.**

**Couleurs** : signal = la menace (la lueur basse de l'horizon, le pack qui se resserre, le contact des crêtes qui serrent la coque, l'étrave « presque droite » qui ne fait qu'écraser) ; veille = le système vivant (la ceinture, l'eau des citernes, la flèche du poids, la fissure qu'il ouvre — l'instant où la glace cède est **blanc**, puis retombe) ; ink = le reste (la glace, ton navire, les traits). Ciel et mer noirs, **pas de bleu** : la glace est claire sur noir, le brise-glace plein et sombre sur son halo dans la glace claire. Personne n'est blessé ; aucun geste d'équipage.

---

## model.js

**Le brise-glace, PLEIN** — le système. À lire pour l'idiome : `episodes/007-siege-ejectable/src/model.js` (pièces, `lit…`, `explode`, ancres), la peau d'une coque (`skin` du L04 ou du 038), `kit/lib/build3d.js`.

**Ce qu'il construit** (cm, `plan.js` : `SHIP`, `STEM`, `BELT`, `TANKS`, `DECKHOUSE`, `PROPS`, `PUSH`) — un brise-glace générique, qu'on reconnaît sans légende en un tiers de seconde :

- **La coque** lissée par sections : flancs droits au milieu, forte entrée à l'avant, **l'étrave en cuillère inclinée à 20° sur la zone de glace** (`STEM.profile`, de −400 à +400 cm), plus raide au-dessus ; arrière à tableau ; pont principal à `SHIP.deck`. Trois gris : la coque sombre, les faces de pont plus claires, **l'étrave la plus claire** (la pièce-héros). `metal` ≤ 0,5.
- **La ceinture de glace** (`BELT`) : une bande de tôle plus claire tout le long de la flottaison, de bout en bout, avec ses joints de tôles (traits ≥ 1,8 px) — c'est elle que la voix nomme en premier.
- **Les citernes de gîte** (`TANKS`) : deux paires, bâbord et tribord, contre les flancs, sous la flottaison ; un tuyau transversal par paire au fond. **L'eau dedans** est un volume veille dont le niveau suit `tanks` (−1 : tout à bâbord ; +1 : tout à tribord ; la surface reste horizontale quand la coque roule — c'est ce qui se lit) ; `pump` fait courir des têtes de flux dans les tuyaux (tirets larges, au plus 1/7 de leur période par image).
- **La superstructure** à l'avant du milieu (passerelle et sa bande de vitres sombres, mât), cheminée, plate-forme hélico à l'arrière, **deux hélices et leurs safrans** (`PROPS`) : `prop` les fait tourner — au-delà de 0,5, un disque fondu, jamais de pales fines qui tournent vite.
- **L'étrave « presque droite »** (`STEM.straight`, ≈ 82°) : une proue de rechange teintée signal, pleine, qui prend la place de la vraie (`straight`, fondu enchaîné, chacune SES matières) au même point de flottaison — pour le principe et le like.
- **La flèche du poids** (`PUSH`) : épaisse, veille, du contact vers le bas ; avec `straight` 1 elle devient horizontale, vers l'avant, signal.
- **La coupe transversale** (`section`) : la coque construite en DEUX moitiés (avant / arrière, z = 0) ; à 1 la moitié arrière a disparu et la tranche est fermée par une face pleine qui montre le bordé, la ceinture épaisse, les membrures, les deux citernes et leur eau. (Pas de `clippingPlanes` : le plateau ne les active pas.)
- **L'éclaté** (`explode`, sur l'établi seulement) dans UN cadre vertical vu de `VIEW.exploded` : la superstructure monte, la ceinture se décolle de la coque (vers le haut et le dehors), les citernes descendent sous la quille, l'étrave avance (−z) ; rien derrière l'en-tête.

**API à rendre** (exactement) : `export function buildShip()` → `{ root, parts, A, update(S, time, onBench) }` — `update` appelée seize fois par image, aucune allocation.
- `parts` : `{ hull, belt, tanksPort, tanksStar, stem, straight, deckhouse, props }`, chacune avec SES matières (`setPartOpacity`).
- `A` (ancres) : `belt`, `tankPort`, `tankStar`, `stem` (le point de flottaison de l'étrave), `push`, `props`, `bridge`.

| nombre | ce que tu en fais |
| --- | --- |
| `explode` | sur l'établi (`onBench`) : 0 assemblé → 1 éclaté ; dans la glace, ignoré |
| `litBelt`, `litTanks`, `litStem` | la pièce que la voix nomme luit veille (une lumière qui a un endroit) ; l'étrave est « le cœur » |
| `straight` | 0 l'étrave à 20° · 1 l'étrave presque droite (signal) à sa place |
| `push` | la flèche du poids (0–1) ; vers le bas (veille) ou, avec `straight`, vers l'avant (signal) |
| `section` | 0 coque entière → 1 la moitié arrière partie, la tranche fermée |
| `tanks`, `pump` | le niveau de l'eau de chaque bord ; le flux dans les tuyaux |
| `prop` | les hélices (0 arrêtées → 1 pleine puissance) |
| `mood` | si tu en as besoin pour une lueur (lu, jamais écrit) |

**Images à réussir** (liste fermée ; poses de départ dans `world.js` → `VIEW`, réglées sur bouchon — donne les tiennes dans ton journal) :
1. `VIEW.whole` sur l'établi : un brise-glace sans légende (étrave en cuillère, superstructure à l'avant, ceinture) — le navire entier dans le cadre vertical (il est long : cherche l'azimut où il tient, 3/4 avant).
2. `VIEW.exploded`, `explode` 1 : quatre ensembles séparés, lisibles à 270 px, sous la ligne « Système Décodé ».
3. `VIEW.belt`, `litBelt` 1 : la bande s'allume le long de la flottaison.
4. `VIEW.tanks`, `litTanks` 1, `tanks` −1 puis +1 : l'eau change de bord, lisible à 270 px (la coque en verre fumé ou ouverte autour).
5. `VIEW.stem`, `litStem` 1, `push` 1 : l'étrave inclinée, la plus claire, la flèche vers le bas.
6. `VIEW.principle`, `straight` 0 puis 1 (avec la plaque de `glace.js`, `slab` 1) : l'étrave à 20° et la presque droite au même point.
7. Dans la glace, `VIEW.section`, `section` 1, `tanks` −1 → 1, `heel` 0 → 6, `pump` 1 : la tranche, l'eau qui passe, le roulis.
8. Dans la glace, `VIEW.quarter` et `VIEW.bow` : le navire plein est l'élément le plus lisible dans le pack clair ; `VIEW.stern`, `prop` 1.
+ La couverture (`episode.json` → `cover`, instant `eclate$`, `el` 28) : l'éclaté, l'étrave allumée.

**Propre au dossier** : ce n'est ni le Xuelong ni l'Oden (aucune livrée, aucun nom peint, aucun drapeau). Aucun degré de gîte n'est sourcé : `heel` reste ≤ 8, illustratif. La « ceinture d'acier épais » est le mot de la voix : la bande doit se distinguer du reste de la coque par sa valeur (plus claire), pas par une couleur.

---

## glace.js

**La glace à l'étrave**, dans le repère du navire — la mécanique de la rupture. C'est le fichier du principe : il doit montrer « elle supporte qu'on l'écrase, pas qu'on la plie ». À lire : la plaque de `029/pente.js`, `L01/casse.js` (fissures), `kit/lib/build3d.js`, `kit/lib/rng.js` (aléatoire semé).

**Ce qu'il construit** (`plan.js` : `ICE`, `CONTACT`, `PATCH`, `RIDGE`, `SHIP`, `STEM`) :
- **La plaque au contact** : une dalle d'un mètre (`ICE.thick`, 10 cm hors de l'eau), son bord sur le point de flottaison de l'étrave, `CONTACT.length` devant. `bend` la fait **fléchir sous l'étrave** (une vraie courbure, exagérée pour se lire à 270 px : la flèche doit se voir sur `VIEW.principle` et `VIEW.bowSide`) ; `crack` ouvre les fissures (d'abord la fissure en arc à quelques épaisseurs de l'étrave, puis les radiales) — l'instant où elle cède : un trait **blanc** qui retombe ink — et la plaque devient 3 à 5 blocs ; `tumble` les fait basculer sur la tranche et glisser le long de la coque, dessous (ce qui passe sous l'eau s'assombrit). Les faces de rupture plus claires que le dessus.
- **`crush`** : ce que fait l'étrave presque droite — le bord s'émiette sur place (de petits débris, une frange signal au contact), **la plaque ne bouge pas**.
- **Le chenal** : les blocs déjà cassés le long des deux flancs et dans le sillage (repère de la glace, `+run·100`) ; `wake` 1 = de l'eau noire entre les blocs, 0 = refermé (blocs tassés, floes qui reviennent).
- **Les crêtes de pression** (`ridge`) : des amas de blocs basculés le long des DEUX flancs, plus hauts que la glace (`RIDGE.sail`, illustratif), qui serrent la coque ; `grip` 1 = collés au bordé (une ligne de contact signal), 0 = une main d'eau noire entre elles et la coque.
- **La crête devant** (`crest`, repère de la glace à `RIDGE.ahead`) : celle que l'acte 3 éperonne. Quand `run` l'amène sous l'étrave, c'est elle la plaque au contact : `bend` / `crack` s'appliquent à elle (elle casse « en grand », les blocs s'écartent des deux côtés).
- **Sur l'établi** (`onBench`, `slab` 1) : un morceau de plaque sous l'étrave et, autour de la proue, un bac d'eau de verre (aux rayons X, sa surface à y = 0) qui dit où est la flottaison. Rien d'autre.

**Matière** : la glace est pleine, mate (`rough` ≈ 0,9), claire (ink à 70–80 %), arêtes fines claires ; ses tranches un ton plus clair que son dessus. Jamais bleue.

**API à rendre** : `export function buildGlace()` → `{ root, A, update(S, time, onBench) }` ; `A` : `contact`, `crack`, `ridge`. Lit `bend`, `crack`, `crush`, `tumble`, `ridge`, `crest`, `grip`, `slab`, `run`, `straight`, `close`, `wake`, `mood`. `root` est ajouté par `world.js` dans le repère du navire (sur les deux décors) ; dans la glace, `banquise.js` ne dessine pas de floe dans la boîte `PATCH` : c'est à toi.

**Images à réussir** (liste fermée) :
1. `VIEW.principle` sur l'établi, `slab` 1, `straight` 1, `crush` 0 → 1 : le bord s'émiette, la plaque immobile.
2. Même pose, `straight` 0, `push` 1, `bend` 0 → 1 puis `crack` 0 → 1 : la plaque fléchit (visible à 270 px), le trait blanc, les blocs.
3. `VIEW.bowSide` dans la glace, `run` qui avance, le cycle `bend` → `crack` → `tumble` : les blocs basculent et passent sous la coque.
4. `VIEW.high`, `ridge` 1, `grip` 1 : le navire pincé des deux bords ; puis `grip` 0 : l'eau noire qui s'ouvre.
5. `VIEW.section`, `ridge` 1, `grip` 1 → 0 avec `heel` 6 : la glace se décolle des flancs.
6. `VIEW.bowSide`, `crest` 1, `run` −40 → 0, puis `bend` 1 et `crack` 1 : l'éperonnage, la crête qui casse en grand.
7. `VIEW.high`, `wake` 1 → 0 : le chenal derrière le navire qui se referme.

**Propre au dossier** : en glace plate mince, la proue **ne grimpe pas** sur la glace (« à ne pas dire en absolu ») : la plaque plie et plonge, l'étrave ne se cabre pas. La glace casse **sans choc** (« sans la frapper ») : la flexion se joue lente, la rupture est sèche.

---

## banquise.js

**Le champ, la mer, le ciel, ton navire, la carte** — dans le repère de la glace (décalé de `+run·100` en z), sauf le ciel. À lire : `015-brin-arret/src/carrier.js` (la mer et le ciel à l'infini), `038-sous-marin/src/mer.js`, `kit/lib/atmo.js`, `kit/lib/figure.js`, `L04-porte-avions/src/bord.js` pour l'hélicoptère (copie sa fonction, ne l'importe pas : `buildBord` construit tout le pont).

**Ce qu'il construit** (`plan.js` : `ICE`, `FIELD`, `SHOK`, `APART`, `WIND`, `HELI`, `PATCH`) :
- **La mer** noire, et **le pack** : un plan à shader sur `FIELD.radius` — des floes de 20 à 80 m (cellules semées, bords d'un mètre qui accrochent la lumière), des chenaux d'eau noire entre eux tant que `close` < 1 ; `close` qui monte fait **converger** les floes (les chenaux se ferment, les bords se touchent et se soulèvent). Il doit se lire de 3 m (la première image) à 15 km de haut (la carte). Rien dans la boîte `PATCH` autour du brise-glace (c'est `glace.js`), sauf l'eau.
- **Des floes en 3D** près de ce que filment la première image et le flanc de ton navire (une épaisseur, des arêtes) : ils **glissent dès l'image 1** (`time`) et se referment sur sa coque quand `close` monte.
- **Le ciel** : noir en haut, une **lueur signal basse sur l'horizon** (la menace derrière le sujet), la brume qui mange le pack lointain et garde un navire à ≈ 1,3 km lisible (la densité est réglée dans `world.js` : dis-moi si elle ne te va pas).
- **Ton navire** (le navire pris, `SHOK` : ≈ 72 m, renforcé glace, jamais nommé) **aux rayons X** : coque de verre lissée, superstructure, mât, grue ; à `shokAt(apart, run)`, tourné de `SHOK.yaw`. Sur son pont, **des gens de verre** (`crowd`, 6 à 9 silhouettes, `makeFigure`) — de loin, une échelle ; de près, jamais en très gros plan. Là où les floes le touchent, un contact signal quand `close` > 0,8.
- **La carte** (`line`) : vue de 15 km, chaque navire est un point lumineux et un anneau (≥ 40 px à 1080 de large ; le brise-glace veille, ton navire ink) et **la ligne de distance** de l'étrave du brise-glace à ton navire. **Attention** : à cette distance, une mer et un pack à 15 cm l'un de l'autre se battent (vu sur bouchon : tout noir) — sépare les couches ou dessine la mer sans écrire la profondeur.
- **Le vent d'est** (`wind`) : de longues flèches signal au-dessus du pack, selon `WIND.dir`, qui avancent (traînées, pas de points) et poussent le pack contre les deux navires.
- **L'hélicoptère** (`heli`) au-dessus de ton navire à `HELI.y` : le rotor est un disque fondu.
- **Le bouillon de l'hélice** (`prop` > 0,5) : une tache d'eau brassée claire à l'arrière du brise-glace.

**API à rendre** : `export function buildBanquise()` → `{ root, A, update(S, time) }` ; `A` : `shok`, `shokBow`, `heli`, `lineMid`, `beaconIce`, `beaconShok`. Lit `shell`, `close`, `wake`, `run`, `apart`, `shok`, `crowd`, `line`, `wind`, `heli`, `ridge`, `prop`, `mood`. `world.js` le cache sur l'établi.

**Images à réussir** (liste fermée) :
1. **`POSE0`, la première image** : au ras de la glace, les floes qui glissent et se referment sur la coque de verre de ton navire (≥ 40 % de la largeur), derrière lui le brise-glace plein, petit mais lisible, la lueur signal derrière les deux ; ça bouge dès l'image 1 par les floes. Puis les trois autres candidates du haut de `docs/051-actes.md`.
2. `VIEW.deck` : les gens de verre sur le pont, les plaques contre la coque.
3. `VIEW.flank` : au ras, les plaques se pressent contre la coque.
4. `VIEW.top`, `apart` 11 000, `line` 1 : les deux points, la ligne, le pack lisible de 15 km.
5. `VIEW.high`, `close` 1 : le brise-glace pris dans un pack compact (avec `glace.js`).
6. `VIEW.top`, `wind` 1 : le vent pousse le pack contre les deux navires.
7. `heli` 1 au-dessus de ton navire, et le brise-glace au loin dans le même cadre (le duel du commentaire).

**Propre au dossier** : pas de base, pas de manchot, pas de soleil de minuit dessiné. Le navire pris est « ton navire » : on ne lit aucun nom sur lui. L'hélicoptère n'est montré qu'au commentaire (c'est l'une des deux réponses du duel), jamais en train d'évacuer qui que ce soit.
