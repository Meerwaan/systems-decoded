# 036 · L'éolienne dans la tempête — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/036-eolienne/src/model.js` (le système : le moyeu ouvert), `src/eolienne.js` (le mât et les trois pales aux rayons X) et `src/vent.js` (la tempête, et l'aile du principe). Tous trois existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import ; **lis son commentaire de tête : repères, azimut, sens du rotor, sens du pas**) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply` : c'est lui qui accroche les pales de `eolienne.js` et l'aile de `vent.js` aux repères de `model.js`). Recette : `docs/recette-agents.md`. Plan des actes : `docs/036-actes.md` (son haut, et les lignes qui te concernent). Faits : `docs/faits/036-eolienne.md` (« À ne pas dire ») et `036-contre-verification.md` (« Reste ouvert »). **La voix est enregistrée** (88,7 s) : `npm run script -- 036`.

**Réutilisé, sans agent** : la route de nuit du 025, sa voiture aux rayons X, toi au volant et son habillage (`dressRoute`, déjà appelé dans `025-esp/src/route.js`) — importés tels quels par `world.js`, posés à `CARAT` (la voiture à 100 m du mât, 84 m en amont du rotor et 50 m à côté : à portée d'une pale, jamais sous le rotor). On ne touche à aucun fichier du 025.

**L'échelle est VRAIE** (l'ordre d'une Enercon E-82 : rotor 82 m, moyeu 78 m) ; les pièces du moyeu ont des tailles et des places illustratives (rien ne s'affiche). Le film est en **temps réel** : `rotor` (en tours) est l'angle du rotor, `rpm` sa vitesse ; trois pales identiques : une image se lit modulo 1/3 de tour. **Repère monde** : l'origine au pied du mât, y en haut. **Repère de la nacelle** (la racine de `model.js`) : l'origine au sommet du mât, +z vers le vent (où regarde le cône), tourné vers `az = TURBINE.heading` (−50). **Azimut** (vérifié dans `kit/lib/stage.js`) : `az` 0 se tient en +z, −90 en −x. La clé vient de −x, +y, +z. **Le rotor tourne dans le sens horaire vu de face** (vérifié sur bouchon : pale B en bas à droite). **Le pas** : 0 = corde en travers, dans le plan du rotor (la pale produit, « de biais ») ; 90 = « en drapeau », la corde dans le vent, la pale montre sa tranche (vérifié sur bouchon : pale A à 90 = un trait vu de face).

**Couleurs** : signal = la menace (les rafales, la survitesse — traînées des bouts de pale au-dessus de 200 km/h —, la portée vers ta voiture, une batterie vieillie, le réseau qui meurt) ; veille = le système vivant (le réseau tant qu'il alimente, les batteries, les moteurs de pas qui tournent, l'aile du principe) ; ink = le reste. Nuit noire, pas de bleu. **Jamais de vérin hydraulique** : ce modèle règle ses pales à l'électricité (un moteur et une batterie par pale). **Le frein ne sert pas** : il reste froid, encre, jamais allumé.

---

## `src/model.js` — le système (le haut du mât ouvert)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres), `episodes/025-esp/src/model.js` (repère d'ancrage, pièces qui tournent), `kit/lib/build3d.js`.

**Ce qu'il construit**, dans le repère de la nacelle (`plan.js` : `HUB`, `BEARING`, `PITCH`, `BATTERY`, `GENERATOR`, `BRAKE`, `CARRIER`, `YAW`, `NACELLE`, `VANE`, `STUB`, `SYSTEM`). Plein (trois gris, `metal` ≤ 0,5), sauf le capot et le cône, de verre.
- **Le moyeu** (`HUB`) : une pièce de fonte creuse, trois brides, **ouverte** — on voit dedans depuis les poses de travail (`az` H−30 à H−60, `el` 15–25). Le bouchon en sphère pleine cache tout : c'est le premier défaut à régler (un moyeu en étoile, de grandes fenêtres de fonderie, ou la fonte coupée côté caméra).
- **Par pale** (trois fois, dans le repère de la pale `A.root[k]`) : **le roulement de pale** (une couronne, sa denture intérieure), **le moteur de pas** et son réducteur, son pignon dans la denture (`PITCH`) — le pignon tourne de lui-même quand le pas change (rapport ≈ 10) ; **le coffret de batteries** (`BATTERY` : 18 éléments visibles en rangée, une jauge sur sa face, vers la caméra) ; **le pied de pale** plein (`BEARING.stub`), boulonné sur la couronne, qui tourne avec le pas (`A.pitch[k]`).
- **Dans la nacelle** : le **générateur annulaire** (`GENERATOR` : sans multiplicateur, le rotor l'entraîne directement), l'**étrier du frein** sur sa jante (`BRAKE`), le **châssis** (`CARRIER`), la **couronne d'orientation** et ses six moteurs (`YAW`), l'anémomètre et la girouette (`VANE`).
- **De verre** : le **capot** (`NACELLE` : l'« œuf » d'Enercon, du cône à la queue) et le **cône** (`HUB.spinner`), réglés par `cover` ; et sur l'établi seulement, **le haut du mât** (`STUB`, 6 m de tube de verre sous la couronne : « en haut du mât »).

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.
- `root` : le repère de la nacelle (`world.js` le re-parente entre le sommet du mât et l'établi, tournés de la même façon : la coupe raccorde sur place).
- `A` : `hub` (tourne avec `rotor` : `rotation.z = −2π·rotor`) · `root[3]` (le repère de chaque pale, fixe dans le rotor, NON tourné par le pas : `world.js` y accroche l'aile de `vent.js`) · `pitch[3]` (le même, tourné de `−pitch·DEG` autour de +y : `world.js` y accroche les pales entières de `eolienne.js`) · `motor[3]` · `battery[3]` · `heart` (= `battery[0]`) · `gen` · `brake` · `carrier` · `centre`.
- `parts` : `{ stub, yaw, carrier, generator, brake, cover, hub, spinner, drives, batteries, roots }` — chacune ses matières.
- `update(P, time, px)`, seize fois par image, sans allocation :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (le haut du mât de verre), 0 au sommet du vrai mât |
| `cover` | le capot et le cône de verre (0–1) ; à 0,3 le moyeu plein se lit à travers |
| `rotor` | l'angle du rotor (tours) : `A.hub` tourne, tout ce qui est dedans avec lui |
| `rpm` | rien à dessiner chez toi (le flou est celui des pales) — sauf le générateur, s'il a un repère qui tourne |
| `pitchA/B/C` | chaque pied de pale tourne sur son axe (degrés) ; chaque pignon tourne d'autant × rapport |
| `explode` | sur l'établi : 0 → 1, dans UN cadre vertical vu de `VIEW.exploded` — le capot monte haut, le moyeu s'avance (+z) et se soulève un peu, chaque moteur et chaque coffret sortent du moyeu le long de l'axe de sa pale, le générateur reste sur le châssis ; rien derrière l'en-tête |
| `batt` | les trois coffrets réveillés : 0 sombres → 1 veille (leur jauge, une lueur qui a un endroit) |
| `charge` | la jauge des coffrets : 1 pleine → 0,33 « au tiers » ; **signal sous 0,5** |
| `motors` | les trois moteurs alimentés : 0 morts → 1 veille |
| `heart` | le coffret de la pale A seul : le reste du système s'assombrit autour (0–1) |
| `litMast`, `litNacelle`, `litGen`, `litHub`, `litMotor` | la pièce que la voix nomme luit faiblement veille (`litMast` : le haut du mât et sa couronne ; `litMotor` : les trois moteurs) |
| `litBrake` | l'étrier se montre, **encre, froid** — jamais veille ni signal |

**Images à réussir** (9, liste fermée — poses de départ dans `world.js` → `VIEW`) :
1. Sur l'établi, entier (`VIEW.whole`, `cover` 0,6) : on lit sans légende un haut de mât, une nacelle, un générateur en anneau, un moyeu et trois pieds de pale.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : tout dans un cadre vertical, sous la ligne « Système Décodé ».
3. Un moteur de pas et sa couronne (`VIEW.motor`, `motors` 1, `pitchA` 0 puis 30) : le pignon a tourné d'une image à l'autre.
4. **Le cœur** (`VIEW.battery`, `heart` 1, `batt` 1, `charge` 1 puis 0,33) : le coffret de la pale A, ses éléments, sa jauge veille, puis au tiers et signal — lisible à 270 px.
5. Dans la scène, `VIEW.system` (`cover` 1 puis 0,3, `batt` 1) : le moyeu plein est l'élément le plus lisible sous le verre ; les trois coffrets verts.
6. `VIEW.root` (`rotor` 0) : le pied de la pale A à l'entrée du moyeu, boulonné sur sa couronne, immobile sur son axe.
7. `VIEW.brake` (`litBrake` 1) : l'étrier sur la jante du générateur, froid.
8. De loin (`POSE0`, à 130 m) : le moyeu se lit comme une forme pleine et sombre sur son halo (≥ 40 px), et `batt` 1 y fait un point vert.
9. La couverture : `cover` d'`episode.json` (instant `eclate$`, éclaté, `heart` 1) — tout le système éclairé, quelque chose luit, `el` ≥ 28, sous « Système Décodé » (shift ≈ −430).

**Propre au dossier** : « sur ce modèle » est dans la voix — une seule technologie à l'image, l'électrique (moteur + batterie), jamais d'accumulateur ni de vérin. Les 18 éléments de Formerie sont des batteries au plomb en série : des blocs, pas des piles rondes. Le frein existe (maintenance) mais ne s'allume jamais.

---

## `src/eolienne.js` — le mât, les trois pales, le réseau, Formerie

**À lire pour l'idiome** : `episodes/020-taipei-101/src/tour.js` (une tour de verre de grande hauteur, `towerGlass`, sections, `asShell`), `episodes/006-defibrillateur/src/hall.js` (rayons X, personnage), `kit/lib/figure.js` (le technicien), `kit/lib/build3d.js`.

**Ce qu'il construit**, dans le repère monde (`plan.js` : `TOWER`, `TURBINE`, `BLADE`, `FOLD`, `MAINS`, `REACH`) :
- **Le mât** aux rayons X (verre + `asShell`, traits fins) : un cône de 75,5 m (`TOWER`), ses brides de sections (anneaux), sa porte au pied tournée vers la route, l'échelle intérieure côté route et ses paliers. Coupé en deux à `FOLD.y` (deux pièces) : la moitié haute plie autour d'un axe horizontal, vers `FOLD.toward` (loin de la route), de `fold × FOLD.max`, un pli signal à la charnière. `A.top` (le repère de la nacelle, tourné de `TURBINE.heading`) suit le pli : `model.js` y est accroché.
- **Les trois pales** de verre, chacune dans SON repère (`plan.js` : origine à la bride, +y vers le bout, +z vers le vent, +x le sens où elle avance) : profil d'aile, racine ronde (`BLADE.root`) qui s'élargit en corde (`chordMax` à `atMax`) puis s'effile (`chordTip`), vrillage (`twist` à la racine → 0 au bout, vers +z) ; bord d'attaque et bord de fuite en traits clairs, lisibles sur le ciel noir. `world.js` les accroche à `A.pitch[k]` de `model.js` : **le pas et la rotation viennent de là, tu n'y touches pas**. **Le flou** : avec `rpm`, chaque pale laisse derrière elle (vers −x) un éventail qui couvre l'angle balayé pendant l'obturation (au moins 3° à 11 tr/min), et ses bouts tracent une traînée — **signal au-dessus de 13 tr/min** (200 km/h en bout), encre en dessous ; à 3 tr/min, plus de flou. C'est ce qui fait bouger la première image : soigne-le.
- **`shake`** : la pale A fléchit (une onde qui court le long d'elle, jusqu'à ≈ 1 m au bout), sans scintiller.
- **`reach`** : un arc signal en tirets, de `REACH.from` (où passent les bouts de pale, côté route) jusqu'à ta voiture (`REACH.to`), tracé de 0 à 1, et un anneau au sol autour de la voiture.
- **Le réseau** (`MAINS`) : un câble enterré du pied du mât au poste de livraison (une boîte de verre sur le bas-côté de la route), puis la ligne le long de la route ; des têtes veille qui courent tant que `mains` est à 1 (vitesse ≤ 1/7 de période par image) ; à 0, encre sombre — la coupure part du pied, un éclat signal court qui s'éteint.
- **Le technicien** (`tech`) : `makeFigure`, de verre, sur l'échelle, bras et jambes qui alternent avec `tech` ; à 0,01 au pied, à 1 sous la trappe du sommet.
- **Au sol** : la plateforme de grutage en grille autour du pied, le chemin d'accès jusqu'à la route — rien de plein.

**API à rendre** (exactement) : `export function buildTurbine()` → `{ group, A, blades, update(P, time, px) }` — `group` (le repère monde) ; `A` : `top`, `foot`, `door`, `ladder` ; `blades` : trois `Group` dans leur repère de pale ; `update(P, time, px)` :

| nombre | ce que tu en fais |
| --- | --- |
| `tower` | le mât de verre, ses brides, sa porte, son échelle (0–1) |
| `blades` | les trois pales (0 sur l'établi) |
| `rpm` | le flou des pales et les traînées des bouts (signal > 13) |
| `pitchA/B/C` | lus pour doser le flou (une pale en drapeau balaie moins) — l'orientation vient de `A.pitch` |
| `shake`, `reach`, `mains`, `fold`, `tech` | voir ci-dessus |

**Images à réussir** (8, liste fermée) :
1. Les quatre candidates de la première image (`.cache/planches/036/premiere-image.json`, à 0,04 et 0,5 s) : les pales balaient la pluie et bougent entre les deux instants, le rotor ≥ 40 % de la largeur, le mât qui monte, la voiture en bas.
2. `VIEW.rotor`, `pitchA` 90, B et C à 0 : la tranche contre les faces, lisible à 270 px ; puis les trois à 90 et `rpm` 3 : plus de flou.
3. `VIEW.rotor`, `rpm` 19 : les traînées signal en bout de pale.
4. `VIEW.rotor`, `shake` 1 : la pale A qui fléchit se voit.
5. `VIEW.wide`, `reach` 1 : l'arc du bout de pale à la voiture, la voiture hors du disque du rotor.
6. `POSE0` puis `VIEW.wide`, `mains` 1 puis 0 : le câble vivant, puis mort.
7. `VIEW.wide`, `fold` 1 : la moitié haute repliée, loin de la route, la nacelle et les pales avec elle.
8. `VIEW.ladder`, `tech` 0,5 : le technicien sur l'échelle dans le mât de verre, le sommet et ses coffrets verts au bout.

**Propre au dossier** : le mât fait 75,5 m, la voiture 4,7 m : le brouillard (`0.000022`) et l'éclairage doivent laisser lire le mât de haut en bas depuis la route. Le balisage lumineux de la nacelle, la plateforme et le poste se peaufinent avec le décorateur (`habillage.js`), pas ici.

---

## `src/vent.js` — la tempête, et l'aile du principe

**À lire pour l'idiome** : `episodes/020-taipei-101/src/tour.js`, lignes 283–365 (`makeStreaks` : la pluie et les veines de vent — **fonction non exportée : recopie-la**, en le disant en tête) et 573–581 (comment elle s'emploie) ; `episodes/008-paratonnerre/src/model.js` (une tête de lumière qui avance) ; `kit/lib/build3d.js` (`fatLine`).

**Ce qu'il construit** :
- **`group`** (repère monde) : **la pluie** (traînées encre fines, le long de −`WIND` et vers le bas, en cubes emboîtés qui couvrent la voiture, la route et le mât jusqu'au rotor), **les rafales** (de longues veines signal, rares, derrière le rotor plus que devant). `storm` dose les deux. Jamais un point qui saute : des traînées qui glissent le long d'elles-mêmes.
- **`flow`** (le repère de la pale A, non tourné par le pas : `world.js` l'accroche à `A.root[0]`) : à `y = SECTION.y`, **la coupe de la pale** — un profil d'aile (`SECTION.chord`, épaisseur `thick`), son contour veille épais (≥ 3 px), tourné de `pitchA + SECTION.twist` (comme la pale de verre de `eolienne.js` à cette hauteur) ; **les filets** (5 à 7, encre) qui arrivent du vent relatif — à `pitchA` 0, de biais (≈ 25° du plan du rotor : le vent et l'avance de la pale), déviés par le profil ; à 90, le vent revient dans l'axe (+z), le profil le reçoit par la tranche, les filets passent droits ; **la flèche** (`lift`, veille) le long de +x — « elle tire le rotor » — aussi longue que le profil porte, 0 en drapeau ; **l'arc gradué** (`gauge`) de 0 à 90 autour de la coupe, trois traits (0, 45, 90), une aiguille sur `pitchA` — aucun chiffre en 3D (l'en-tête l'affiche).
- **`disc`** (le repère de la nacelle : `world.js` l'accroche à la racine de `model.js`) : **`slip`**, des filets qui viennent de +z, traversent le disque du rotor et glissent le long des trois pales en drapeau sans les pousser — « le vent qu'elle lâche ».

**API à rendre** (exactement) : `export function buildWind()` → `{ group, flow, disc, update(P, time, px) }`, avec `P = { storm, flow, lift, gauge, slip, pitchA, pitchB, pitchC, rpm }`.

**Images à réussir** (6, liste fermée) :
1. `POSE0`, `storm` 1 : la pluie se lit comme de la pluie dans le vent, les rafales signal derrière le rotor ; le rotor reste le plus lisible du cadre.
2. `VIEW.section` (`rotor` 0,25 : la pale A à l'horizontale ; règle la pose pour que la coupe soit au centre), `flow` 1, `lift` 1, `gauge` 1, `pitchA` 0 : une aile, de biais, la flèche qui tire.
3. Même pose, `pitchA` 45 puis 90 : la flèche raccourcit puis disparaît, la tranche face au vent, les filets droits.
4. `VIEW.rotor`, les trois pas à 90, `rpm` 3, `slip` 1 : les filets glissent.
5. `VIEW.system` (au sommet, `storm` 1) : la pluie ne voile pas le moyeu.
6. Sur l'établi (`storm` 0, `flow` 0) : rien de toi.

**Propre au dossier** : le principe est le moment éducatif du film (« une pale, c'est une aile ») — c'est l'image la plus importante de ton fichier ; une explication de principe (la portance) que l'image simplifie, `sources` le dit.
