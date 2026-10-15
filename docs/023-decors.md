# 023 · Éolienne de secours — les décors

Deux fichiers neufs, un agent chacun, en parallèle : `episodes/023-eolienne-de-secours/src/model.js` (la RAT) et `src/avion.js` (l'A330 et son monde). Tous deux existent en **bouchon** (volumes gris à la bonne place) : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/023-actes.md`. Faits : `docs/faits/023-contre-verification.md`.

**Deux échelles, exprès.** L'avion et la RAT sont à l'échelle VRAIE (A330-200 : 58,8 m, 60,3 m d'envergure, fuselage de 5,64 m) ; les tailles de la RAT (bras, hélice, pompe) sont **illustratives** — celles de l'A330 n'ont pas été trouvées. Le monde autour (mer, île, piste) est une **maquette à l'échelle du sujet** (règle du 008) : 10 km d'altitude dessinés 300 m, 120 km dessinés 800 m. **Aucune longueur, aucun chiffre ne s'écrit sur un décor.**

**Le repère est celui de l'avion** (011, 013, 014) : il reste à l'origine, **nez vers −x**, haut +y, **flanc GAUCHE vers +z** (côté caméra, `az` −20 … −70, où tombe la clé). Le moteur gauche (+z, proche) meurt le second (06 h 26) ; le droit (−z, loin, vu à travers le verre) a fui et meurt le premier. C'est le monde qui vient : `world.js` vous donne `ground` (le sol sous les roues, en cm) et `threshold` (le x du seuil de piste) — ni horloge ni trajectoire à vous.

**Couleurs** : signal = la panne (moteurs morts, circuits morts, freins, la piste hors d'atteinte) ; veille = la RAT (ses pales, le circuit qu'elle ranime, les gouvernes qui répondent, la piste atteinte) ; ink = le reste. Pas de bleu de nuit, pas d'aube orange : le ciel est noir, l'aube est une bande d'encre basse. Personne n'est blessé ; les pneus se dégonflent, rien n'explose.

---

## `src/model.js` — la RAT (le système)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres, `update`), `episodes/020-taipei-101/src/model.js`, `kit/lib/build3d.js`.

**Ce qu'il construit**, en cm, origine = la charnière du bras, dans la soute, juste au-dessus de la trappe (`plan.js` : `DOOR`, `ARM`, `SPRING`, `PROP`, `PUMP`, `LINES`, `HYD`, `BENCHAT`) :

- **La soute et la trappe** (`DOOR`) : un caisson sombre (verre épais : c'est un morceau de ventre) et, dessous, la trappe dans la peau (y = −12), charnière sur son bord +z ; elle s'ouvre vers le bas.
- **Le bras** (`ARM`) : rangé le long de +x dans la soute ; il descend de `travel` degrés autour de z jusqu'à pendre dans le vent, sous la trappe.
- **Le ressort** (`SPRING`) : un vérin à ressort du plafond de la soute au milieu du bras — corps, tige, et un ressort hélicoïdal VISIBLE qui s'allonge quand le bras sort : c'est lui qui « pousse ».
- **L'hélice** (`PROP`) : deux pales larges, pleines, la pièce-héros (le gris le plus clair), au bout du bras, son axe le long de x, face au vent (−x). Pas de détail fin qui tourne.
- **La pompe** (`PUMP`) : derrière l'hélice (+x), dans la nacelle — un carter qu'on lit comme une pompe (brides, deux raccords).
- **Les trois lignes** (`LINES`, `HYD`) : trois tuyaux parallèles qui partent de la pompe, remontent le bras et sortent de la soute — dans l'avion, `avion.js` les prolonge. Celle de `HYD.live` est celle que la pompe nourrit.
- **Sur l'établi** (`bench` 1) : deux fins poteaux de verre tiennent la soute à `BENCHAT` (un morceau de ventre sur un socle de musée).

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.

- `root` : un `THREE.Group` (re-parenté entre la soute de l'avion et l'établi).
- `A` (ancres, `Object3D`) : `hinge`, `door`, `spring`, `arm` (milieu du bras), `hub`, `blade` (le bout d'une pale, il tourne), `pump`, `lines` (le milieu des trois), `live` (le bout de la ligne vivante, là où elle quitte la soute).
- `parts` : `{ door, arm, spring, prop, pump, lines }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — appelée seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (les poteaux de verre), 0 dans l'avion |
| `door` | 0 fermée, à fleur du ventre → 1 ouverte |
| `arm` | 0 rangé → 1 sorti ; le ressort s'allonge avec lui. Le bras ne traverse pas la trappe : l'acte ouvre `door` avant |
| `turn` | l'angle de l'hélice, en TOURS (l'acte le fait avancer) |
| `whirl` | le disque des pales en rotation, voile veille translucide (0–1) |
| `wind` | sur l'établi seulement : quelques filets d'air qui arrivent de −x et traversent le disque (encre, veille là où ils touchent les pales) |
| `press` | la ligne vivante allumée veille depuis la pompe (0–1) ; les deux autres restent éteintes, signal sourd |
| `flow` | une tête de lumière veille qui court le long de la ligne vivante, de la pompe vers la sortie (0–1 : sa position) |
| `lines` | les trois lignes sous la pression des moteurs : encre à 1, signal sourd à 0 |
| `explode` | 0 assemblé → 1 éclaté dans UN cadre vertical : trappe en haut, ressort, bras, hélice, pompe sortie de sa nacelle, les trois lignes en rangée |
| `litDoor`, `litArm`, `litProp`, `litPump` | la pièce que la voix nomme luit faiblement veille (`litArm` : bras et ressort) |

**Images à réussir** (8, liste fermée — poses de départ dans `world.js` → `VIEW`) :

1. La RAT entière sur l'établi, sortie, au repos (`VIEW.whole`) : on comprend l'objet sans légende — une soute, un bras, une hélice, une pompe.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : cinq pièces et trois lignes dans un cadre, rien derrière l'en-tête.
3. La trappe et le ressort de près (`VIEW.door`, `door` 0,5, `arm` 0,3, `litArm` 1) : le ressort comprimé se lit.
4. Rangée (`arm` 0, `door` 0) : « Elle dort, repliée » — le bras dans la soute, vu à travers la trappe.
5. L'hélice presque de face (`VIEW.prop`, `turn` qui avance, `whirl` 1, `wind` 1) : le vent la fait tourner, sans scintillement.
6. La pompe et les trois lignes (`VIEW.pump`, `press` 1, `flow` 0,6) : une ligne vivante veille, deux mortes.
7. La même RAT dans l'avion (`VIEW.bay`, `door` 1, `arm` 1, `whirl` 1) : elle reste l'élément le plus lisible sous le ventre de verre.
8. La couverture : `cover` d'`episode.json` (instant `eclate$`) — tout le système éclairé, `el` ≥ 14.

---

## `src/avion.js` — l'A330 aux rayons X et son monde

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/jet.js` lignes 340–520 (le ciel, les traînées), `episodes/015-brin-arret/src/carrier.js` (la mer, le dôme de ciel — s'en inspirer ; import direct seulement si c'est simple), `kit/lib/figure.js` (toi, assis), `kit/lib/build3d.js` (`glass`, `asShell`, `edgesOf`).

**Ce qu'il construit** (`plan.js` : `FUSE`, `WING`, `ENGINES`, `TAIL`, `SURFACES`, `GEAR`, `BAY`, `YOU`, `CABIN`, `HYD`, `ALT`, `ISLAND`, `SKY`) :

- **L'A330 de verre** : fuselage, ailes en flèche, empennage — coque de verre, cadres et hublots en traits fins. Les hublots de la cabine sont faiblement allumés (encre), le tien plus que les autres.
- **Pleins dedans, seulement ce qui compte** : les deux moteurs (nacelle, soufflante, cœur : vivants = encre et soufflante qui tourne ; morts = froids, liseré signal ; la fraction d'`engines` est la soufflante qui ralentit) ; les réservoirs d'aile (`fuel`) ; les gouvernes (ailerons, profondeurs, gouverne de direction) ; les trois circuits (`HYD`) le long du ventre jusqu'aux ailes et à la queue ; le train principal et ses freins dans leurs puits ; **la soute de la RAT** (`mount` à `BAY.at`) avec une découpe dans la peau sous la trappe.
- **Toi** (`YOU`) : un corps de verre assis contre un hublot gauche, face au nez ; `grip` ferme ta main sur l'accoudoir. Jamais en très gros plan.
- **La cabine** (`pax`) : 306 personnes en rangées de petites têtes de verre (`CABIN`).
- **Le monde** : un dôme de ciel noir et, sous l'avion, la mer à `ground − ISLAND.h` — une surface mate qui se lit par ses reflets (pas de dalle grise vue en rasant), ancrée sur l'île (elle défile avec `threshold`) ; l'aube (`dawn`) : une bande d'encre basse à l'horizon et un éclat sur la mer. L'île (`ISLAND`) au seuil `threshold` : un plateau sombre aux rayons X, la piste vers −x, ses feux (`runway`, couleur par `made`). Le vent (`wind`) : des filets fins qui filent le long de l'avion vers l'arrière, en traînées.
- `pitch` et `bank` tournent l'avion (et `mount`) autour de l'origine ; le monde ne tourne pas avec eux.

**API à rendre** (exactement) : `export function buildAvion()` → `{ group, mount, A, update(P, time, px) }`.

- `group` (tout le décor), `mount` (la soute : le monde y accroche `system.root`).
- `A` : `nose`, `tail`, `cockpit`, `engL`, `engR`, `you` (ta tête), `window`, `bay`, `gear`, `wingTip`, `aileron`, `elevator`, `rudder`, `tanks`, `leak`, `threshold`, `island`.
- `update(P, time, px)`, `P` : `ground`, `threshold`, `ahead`, `pitch`, `bank`, `dawn`, `wind`, `shell`, `engines`, `fuel`, `leak`, `lines`, `press`, `flow`, `surf`, `stick`, `pax`, `you`, `grip`, `brakes`, `gear`, `tires`, `runway`, `made`, `mood` — leur sens est commenté dans `FIRST` (`world.js`). `press` / `flow` : la ligne vivante continue dans l'avion la lumière que `model.js` fait partir de la pompe (`flow` 0 → 1 : la tête va de la soute jusqu'aux gouvernes, elle y arrive à 1) ; `surf` 1 allume les gouvernes en veille, `stick` les braque (ailerons opposés, profondeurs ensemble).

**Images à réussir** (8, liste fermée) :

1. **La première image** (`VIEW.hook`, `FIRST`) : l'A330 de verre la nuit, de dessous et de face à gauche, le moteur proche grand et mort (liseré signal), ton hublot allumé, la mer noire loin dessous. Elle arrête le pouce sans texte.
2. Toi au hublot, de dehors (`VIEW.you`), l'aile et le moteur derrière toi.
3. L'avion entier, moteurs vivants (`VIEW.plane`, `engines` 2, `lines` 1, `fuel` 1), puis la même image `engines` 0, `lines` 0, `fuel` 0, `leak` 1 : on voit la panne d'un coup.
4. Les trois circuits de dessous (`VIEW.circuits`, `lines` 0, `press` 1, `flow` 1, `surf` 1) : un vivant veille jusqu'aux gouvernes, deux morts.
5. La queue (`VIEW.tail`, `surf` 1, `stick` ±1) : deux images, braquées d'un côté puis de l'autre — vérifier le sens.
6. Le large (`VIEW.wide`, `ahead` 1, `runway` 1, `made` 0) : l'avion petit au-dessus de la mer, l'île sur l'horizon — elle se voit encore (brouillard).
7. L'approche (`VIEW.approach`, `ahead` 0,1, `alt` 600, `dawn` 0,7, `runway` 1, `made` 1, `gear` 1) : la piste devant le nez.
8. Au sol (`ahead` −0,2, `alt` 0, `gear` 1, `brakes` 1, `tires` 1, `VIEW.gear`) : les roues sur la piste, freins chauds, pneus à plat, quelques étincelles lentes — rien de violent.
