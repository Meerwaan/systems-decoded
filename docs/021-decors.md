# 021 · Veille du TGV — les décors

Deux fichiers neufs, un agent chacun, en parallèle : `episodes/021-veille-tgv/src/model.js` (le système : la veille automatique, VACMA) et `src/train.js` (le TGV Duplex aux rayons X, la ligne, la nuit). Tous deux existent en **bouchon** (volumes gris à la bonne place) : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/021-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/021-vacma-tgv.md` et `021-contre-verification.md` — leurs « À ne pas dire » d'abord.

**Le tact, avant tout.** Le film s'appuie sur un événement réel (24 décembre 2024, Crisenoy : le conducteur est mort). **Personne n'est jamais dans la cabine** : ni chute, ni corps, ni conducteur, ni nom, ni cause. La cabine est vide de la première image à la dernière, son siège vide, la porte du fond FERMÉE ; aucune porte latérale ouverte (elle dirait comment). Les seules figures : les 393 passagers (petites têtes de verre), toi à ta fenêtre (`YOU`), et — sur l'établi seulement — une chaussure de verre qui montre ce que veut dire « appuyer ».

**Une seule échelle : la vraie.** Le TGV Duplex (deux motrices, huit remorques à deux niveaux, ≈ 200 m), la voie, la caténaire : en centimètres, à l'échelle (ordres de grandeur ; aucune longueur ne s'écrit à l'écran). Les tailles du système (pédale, touches, boîtier, sonnerie, relais, valve) sont **illustratives** : l'aménagement d'une cabine de TGV n'a pas été trouvé. Rien de lui ne s'affiche.

**Le repère est celui du train** (011, 013, 014, 023) : il reste à l'origine, **nez vers −x**, haut +y, dessus du rail y = 0, **flanc GAUCHE vers +z** (côté caméra, `az` −20 … −70, où tombe la clé). En France on roule à gauche : l'autre voie est à la droite du train (−z), et les poteaux de caténaire aussi — **rien de haut entre la caméra et le train**. C'est le monde qui vient : `world.js` vous donne `run` (le défilement, en vrais mètres, vers +x) et `kmh` — ni horloge ni trajectoire à vous. Azimut : `az` 0 regarde de l'avant (−x), −90 du flanc gauche (+z), −180 de l'arrière.

**Couleurs** : signal = la menace (la cabine vide à pleine vitesse, le compte à rebours qui s'épuise sans personne, la sonnerie à laquelle personne ne répond) ; veille = le système vivant (le cadran nourri par un geste, le relais qui coupe, l'air qui s'échappe, les freins qui serrent, la radio qui prévient, le train arrêté) ; ink = le reste. La nuit est noire ; pas de bleu, pas de lune. Rien n'explose, personne n'est blessé.

---

## `src/model.js` — la veille automatique (le système)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres, `update`), `episodes/023-eolienne-de-secours/src/model.js` s'il est écrit, `kit/lib/build3d.js`, `kit/lib/figure.js` (pour l'idiome du verre d'une figure : la chaussure).

**Ce qu'il construit**, en cm, origine = la charnière de la pédale sur le plancher de la cabine, dans l'espace des genoux sous le pupitre, devant le siège (`plan.js` : `CAB_PEDAL`, `PEDAL`, `KEYS`, `BOX`, `BELL`, `RELAY`, `VALVE`, `BOOT`, `SYSTEM`, `BENCHAT`). Le conducteur serait à +x (le siège) : son pied viendrait de +x.

- **La pédale** (`PEDAL`) : une plaque d'acier striée (stries larges, jamais fines), charnière au talon (+x, l'origine), pointe vers −x ; relevée de `rest` degrés au repos, à plat enfoncée. Dessous, son ressort de rappel, VISIBLE (une spirale grossière) : c'est lui qui la relève. La pièce-héros du début : le gris le plus clair.
- **Les touches** (`KEYS`) : deux pavés tactiles couchés sur une réglette, au bord du pupitre, tournés vers le HAUT (lisibles d'en haut sous tous les azimuts). `keys` les allume comme sous des doigts : une lueur veille dessous, jamais un doigt.
- **Le boîtier du compte à rebours** (`BOX`) : dans le pupitre, derrière sa façade. Sur sa face +z (côté caméra), **le cadran** : un anneau épais (au moins 6 px à 270 px de large sur `VIEW.dialCab`) qui se vide dans le sens des aiguilles depuis midi (`count`), veille quand un geste le nourrit, signal quand il s'épuise sans personne (`danger`, franc : 0 ou 1). C'est la pièce-héros des actes 2 et 3 : ce qu'on comprend sans légende. Aucun chiffre, aucune graduation fine.
- **L'angle mort** (`blind`) : sur le cadran, un court secteur (≈ 1/12 du tour : « quelques secondes » de la minute) dessiné signal sourd, en creux, à l'intérieur de l'anneau. L'anneau passe dessus sans réagir.
- **La sonnerie** (`BELL`) : un timbre à calotte sur le pupitre et son marteau. `bell` la fait sonner : le marteau vibre à la cadence (30 Hz : un flou stable, jamais un saut d'image) et deux ou trois anneaux signal partent lentement autour d'elle.
- **Le relais** (`RELAY`) : un petit relais à côté du boîtier, ses contacts VISIBLES, une ligne de courant (encre) qui le traverse et file vers +x (la traction). `cut` écarte les contacts : l'écart s'allume veille, la ligne au-delà s'éteint.
- **La valve de freinage d'urgence** (`VALVE`) : sur un tronçon de la conduite générale sous le plancher (encre). `vent` l'ouvre : un clapet bouge, l'air sort par en dessous en traînées lentes encre (`makeMotes` en traînées, ou des filets : jamais des points), un liseré veille sur la valve ouverte.
- **Les fils** : de la pédale et des touches au boîtier, du boîtier à la sonnerie, au relais et à la valve : traits encre ≥ 1,8 px, sobres.
- **La chaussure** (`BOOT`, sur l'établi seulement) : une chaussure de verre (semelle, talon, empeigne ; ni jambe, ni cheville), qui vient d'au-dessus et de derrière (+x, +y) se poser sur la pédale et l'enfonce avec `pedal`. `still` la rend inerte : plus lourde, plus terne (verre à 40 %), enfoncée d'1 à 2 cm, le talon un peu affaissé — un poids mort, rien de plus. Ses propres matières.
- **Sur l'établi** (`bench` 1) : une plaque de plancher sous la pédale et la valve, deux fins poteaux de verre qui la tiennent à `BENCHAT`, et une silhouette de verre du pupitre (le dessus et sa façade, traits fins) qui porte les touches, le boîtier et la sonnerie — un morceau de cabine sur un socle de musée. Dans la cabine (`bench` 0), c'est `train.js` qui dessine le pupitre : rien de cela ne se voit.

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.

- `root` : un `THREE.Group` (re-parenté entre la cabine — `train.mount` — et l'établi).
- `A` (ancres, `Object3D`) : `hinge`, `pedal` (la pointe de la pédale), `keys`, `box`, `dial` (le centre du cadran), `bell`, `relay`, `valve`, `boot`, `centre` (le centre du système, `SYSTEM.centre`).
- `parts` : `{ pedal, keys, box, bell, relay, valve, boot }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — appelée seize fois par image, aucune allocation (le bouchon recrée tout : ne le copie pas). `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (plaque, poteaux, silhouette du pupitre), 0 dans la cabine |
| `pedal` | 0 relevée (angle de repos) → 1 enfoncée à plat ; le ressort se comprime avec elle |
| `foot` | sur l'établi seulement (0 dans la cabine) : la chaussure, 0 levée et effacée → 1 posée sur la pédale (elle descend avec `pedal`) |
| `still` | la chaussure inerte : 0 vivante → 1 lourde, terne, affaissée |
| `keys` | les deux touches allumées veille, comme sous des doigts (0–1) |
| `count` | le cadran : ce qui reste du compte à rebours (1 plein → 0 vide), dans le sens des aiguilles depuis midi |
| `danger` | la couleur de l'anneau : 0 veille → 1 signal (tenu franc) |
| `bell` | la sonnerie sonne : le marteau vibre, des anneaux signal partent (0–1) |
| `cut` | le relais : 0 fermé (la ligne encre passe) → 1 ouvert (contacts écartés, l'écart veille, la ligne au-delà éteinte) |
| `vent` | la valve : 0 fermée → 1 ouverte, l'air s'échappe en traînées lentes |
| `blind` | l'angle mort du cadran : un court secteur signal sourd dans l'anneau (0 absent → 1 dessiné) |
| `explode` | sur l'établi : 0 assemblé → 1 éclaté dans UN cadre vertical vu de `VIEW.exploded` — de haut en bas : la sonnerie, les touches, le boîtier et son cadran (au centre, le plus grand), le relais à côté, la pédale et son ressort, la valve en bas ; la chaussure absente |
| `litPedal`, `litKeys`, `litBox`, `litBell` | la pièce que la voix nomme luit faiblement veille (`litBox` : le boîtier et son cadran) |

**Images à réussir** (8, liste fermée — poses de départ dans `world.js` → `VIEW`) :

1. Le système entier sur l'établi, au repos (`VIEW.whole`, `pedal` 0, `count` 1) : on comprend l'objet sans légende — une pédale, deux touches, un boîtier à cadran, une sonnerie.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : six pièces dans un cadre, le cadran au centre, rien derrière l'en-tête.
3. La pédale et la chaussure, de près (`VIEW.pedalBench`) : deux images, `foot` 1 `pedal` 1 (enfoncée) puis `foot` 0,6 `pedal` 0 (relevée) — le geste se lit d'une image à l'autre ; puis `still` 1 : un poids mort, pas un pied blessé.
4. Les touches allumées (`VIEW.keysBench`, `keys` 1, `litKeys` 1).
5. **Le cadran** (`VIEW.dial` sur l'établi, `VIEW.dialCab` dans la cabine) : `count` 0,6 `danger` 0, puis `count` 0,3 `danger` 1 — lisible à 270 px ; puis `blind` 1 : l'angle mort se voit sans légende.
6. La sonnerie qui sonne, le cadran vide signal (`VIEW.bellCab`, `bell` 1, `count` 0, `danger` 1) — pas de scintillement (deux images à 1/30 s).
7. Dans la cabine (`VIEW.system`, `bench` 0, avec le pupitre de verre de `train.js`) : `cut` 1, `vent` 1 — le système reste l'élément le plus lisible sous le pupitre de verre.
8. La couverture : `cover` d'`episode.json` (instant `eclate$` : éclaté, `litBox` 1, `count` 0,75) — tout le système éclairé, quelque chose luit (le cadran), `el` 28, la vue éclatée sous la ligne « Système Décodé ».

---

## `src/train.js` — le TGV Duplex aux rayons X et la ligne, la nuit

**À lire pour l'idiome** : `episodes/023-eolienne-de-secours/src/avion.js` s'il est écrit (un grand véhicule de verre et son monde qui défile), `episodes/002-airbag/src/road.js` (une voie qui défile sous un véhicule), `episodes/007-siege-ejectable/src/jet.js` lignes 340–520 (le ciel, les traînées), `episodes/006-defibrillateur/src/hall.js` (un lieu aux rayons X, des figures), `kit/lib/figure.js` (toi, assis ; ta main tient le téléphone : `fig.hold`), `kit/lib/atmo.js` (`makeSurface` et son `uSmear`), `kit/lib/build3d.js` (`glass`, `asShell`, `edgesOf`, `fatLine`).

**Ce qu'il construit** (`plan.js` : `TRACK`, `CATENARY`, `WORLD`, `POWER`, `CAB`, `ANTENNA`, `PANTO`, `TRACTION`, `BOGIES`, `PIPE`, `TRAILERS`, `REAR`, `DECKS`, `PAX`, `YOU`, `CAB_PEDAL`) :

- **La motrice avant, de verre** : le nez profilé du TGV (pas un cône : la pente longue du capot, le pare-brise incliné, les deux feux avant faiblement allumés encre), la caisse, le toit ; cadres et vitres en traits fins.
- **La cabine, dedans** (`CAB`) : le pupitre (verre, avec son **espace des genoux ouvert vers le siège** : la pédale du système s'y tient, rien de plein devant elle vu de `VIEW.system`), son afficheur de vitesse (`display`), **le siège VIDE — plein, gris moyen, éclairé par la lueur du pupitre : c'est la chose la plus lumineuse de la nuit** (`cab`), la paroi du fond et **sa porte, fermée**, les vitres latérales. `mount` (la place du système) est à `CAB_PEDAL`.
- **Pleins dedans, seulement ce qui compte** : la chaîne de traction (le pantographe levé contre le fil de contact, la ligne de toit, le transformateur, les blocs moteurs des bogies de la motrice) ; la conduite générale (`PIPE`, un tube encre le long de tout le train, sous les planchers) ; les bogies (roues pleines, disques et garnitures de frein) ; l'antenne radio sur le toit (`ANTENNA`).
- **Les huit remorques à deux niveaux** (`TRAILERS`, `DECKS`), puis la motrice arrière (`REAR`) : verre, vitres sur deux niveaux en traits fins, faiblement éclairées encre quand `pax` > 0.
- **Les 393 passagers** (`PAX`) : des petites têtes de verre et des épaules, sur les deux niveaux, tournées vers −x, en rangées (instanciées). Aucun visage, aucun geste.
- **Toi** (`YOU`) : un corps de verre assis contre une fenêtre gauche, niveau haut de la première remorque, face au nez ; ton téléphone dans ta main, son écran allumé encre (`phone`). Jamais en très gros plan, jamais la main seule.
- **La ligne** : deux voies (les rails en traits clairs ; les traverses DESSINÉES DANS UN SHADER et étalées selon `kmh` — à 255, une bande lisse ; à 0, des traverses nettes ; jamais des lignes qui sautent d'une image à l'autre), le ballast en grille, l'autre voie à −z, les poteaux de caténaire du côté lointain (−z) tous les 63 m avec leurs consoles au-dessus des deux voies, le fil de contact (un trait continu : il ne doit pas scintiller). Le sol : une grille jusqu'à l'horizon, étalée elle aussi à vitesse (`uSmear`), jamais une dalle pleine. Le ciel : un dôme noir, une bande d'encre très basse à l'horizon. Tout ce qui est périodique boucle sur `run` (négatif possible).
- `run` fait défiler le monde vers +x : un objet du monde en X se tient en X + run·100 ; le train ne bouge pas.

**API à rendre** (exactement) : `export function buildTrain()` → `{ group, mount, A, update(P, time, px) }`.

- `group` (tout le décor), `mount` (la place du système sur le plancher de la cabine : le monde y accroche `system.root`).
- `A` : `nose`, `cab`, `seat`, `desk`, `display`, `door`, `window` (la vitre latérale gauche de la cabine), `antenna`, `panto`, `transformer`, `bogie` (le bogie avant), `pipe`, `pax` (au-dessus des têtes de la première remorque), `you` (ta tête), `phone`, `tail`.
- `update(P, time, px)`, `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `run` | le défilement du monde, en vrais mètres vers +x (poteaux, traverses, grille, horizon lointain immobile) |
| `kmh` | la vitesse : ce que tu étales (traverses, grille, poteaux en traînées) ; 0 = tout net, immobile |
| `shell` | le verre du train : coque, cadres, vitres (0–1) |
| `cab` | la lumière de la cabine : le pupitre luit, il éclaire le siège vide (0–1) |
| `pax` | les 393 : têtes de verre et vitres des remorques allumées (0 → 1 ; si tu peux, d'avant en arrière, remorque par remorque, quand il monte) |
| `you`, `phone` | toi à ta fenêtre (0/1) ; l'écran de ton téléphone allumé encre (0–1) |
| `traction` | le courant du fil de contact au pantographe, au transformateur, aux moteurs : des têtes de lumière encre qui coulent (1) → coupé (0 : la chaîne s'éteint, rien ne coule) |
| `brake` | le freinage d'urgence : une tête veille court le long de la conduite générale de l'avant à l'arrière (0–1 : sa position) ; derrière elle, la conduite passe veille et les garnitures de chaque bogie serrent, veille |
| `radio` | l'alarme : trois anneaux veille quittent l'antenne et s'élargissent lentement dans la nuit (0 rien → 1 les trois partis) |
| `display` | l'afficheur de vitesse du pupitre allumé veille (0–1) |
| `mood` | l'ambiance (0 veille, 1 signal) : à n'utiliser que pour une teinte franche ; rien à mi-chemin |

**Images à réussir** (8, liste fermée) :

1. **La première image** (`VIEW.hook`, `FIRST`) et ses trois rivales de `docs/021-actes.md` (b, c, d) : le nez de verre la nuit, la cabine allumée, **le siège vide lisible derrière le pare-brise**, les poteaux qui filent, les rails qui convergent. Elle arrête le pouce sans texte. Rends les quatre sur une planche, avec leurs poses.
2. La cabine de dedans (`VIEW.cab`) : le siège vide éclairé par le pupitre, la porte fermée derrière — puis la même de derrière le siège (`VIEW.seatBack`) : le pupitre, le pare-brise, la nuit qui arrive.
3. Le flanc de la cabine, dehors (`VIEW.side`) : sa vitre allumée, vide, la nuit qui défile derrière à travers le verre.
4. Au-dessus des têtes de la première remorque, vers l'avant (`VIEW.pax`, `pax` 1) : des rangées tournées vers la motrice sombre et, au bout, la cabine allumée — « aucun ne le voit » se lit.
5. L'avant du train de haut (`VIEW.train`, `pax` 1) : la motrice et deux ou trois remorques, les passagers allumés ; puis le large (`VIEW.wide`) : le train sur la ligne, les poteaux en file jusqu'à l'horizon — un objet à 300 m se voit encore (brouillard).
6. Au ras du rail (`VIEW.rail`, `kmh` 255) : roues, rails, poteaux en traînées — deux images à 1/30 s d'écart, rien ne saute ; puis `kmh` 0 : tout net.
7. La chaîne de traction (`VIEW.traction`) : `traction` 1 puis 0 — on voit le courant s'arrêter d'un coup ; et les freins (`VIEW.brakes`, `brake` 0,5) : la tête veille au milieu de la conduite, les bogies derrière elle serrés, ceux de devant éteints.
8. L'antenne (`VIEW.roof`, `kmh` 0, `radio` 0,6) : les anneaux dans la nuit ; et toi (`VIEW.you`, `you` 1, `phone` 1) : à ta fenêtre, le téléphone allumé, de dehors à travers le verre.
