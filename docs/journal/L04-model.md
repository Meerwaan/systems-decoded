# L04 · `src/model.js` — les systèmes pleins (journal du décor)

Agent de décor `model.js`, 23/10. Fichier réécrit entièrement (le bouchon remplacé), interface de `world.js` gardée telle quelle. `npm run check -- L04` passe (les deux avertissements de console sont des notes du compilateur HLSL : l'`isnan` du filtre de `stage.js`, une précision double — rien de ce fichier).

**Images lues : 30 / 30** (quatre planches : 8 + 8 + 8 + 6).

## Ce qui est construit

- **La catapulte avant** (`cats[0]`, repère propre posé à `CAT[0].from`, −z = le lancement) : deux cylindres pleins (gris moyen, une couture sombre sur le dessus = la fente du cylindre), quatre brides seulement (rien de fin qui défile en rasant), un bouchon arrière sombre, un frein à eau plus gros à l'avant ; dans chacun un piston clair (lance à l'avant, connecteur qui monte par la fente) ; une traverse et une lame (sous le pont) jusqu'à la navette ; la navette sur le pont (gris mat) et son croc (deux joues, une encoche ouverte vers le haut). La fente du pont : deux filets (rubans de lumière toujours ≥ 2 px, encre au repos). La trace : un ruban veille à tête de lumière.
- **La vapeur** : la peau des cylindres s'allume veille de l'arrière jusqu'à la face arrière des pistons, avec un front plus clair juste derrière eux — c'est ce front qui pousse pendant le lancement ; pistons à l'arrêt, `press` étend en plus une charge très faible sur 15 m devant eux (« d'arrière en avant »).
- **Le ballon** (54 m³) : corps de verre, deux fonds pleins, trois cerclages, deux berceaux, la vapeur dedans (volume veille dosé). **La vanne** : un carter le long de z, une fenêtre à l'arrière où l'on voit le disque tourner (fermé : en travers du flux · ouvert : dans le flux), la molette graduée du 015 sur son flanc bâbord, la vapeur dans le carter. **Les conduites** : ballon → sous la vanne, vanne → collecteur sur les deux bouchons ; des anneaux de vapeur y courent à vitesse fixe (150 cm/s pour 46 cm : 1/9 de période par image).
- **La ferrure de la barre de retenue** sur le pont (dans `cats[0]`), à `from.z + 260`.
- **Le déflecteur** : trois panneaux charnière à l'avant, nervures larges au dos, vérins ; se lève à 52° (300 cm).
- **La barre de retenue** (le héros) : deux moitiés (côté train, côté pont) autour du col, trois gris : la pièce calibrée en os de chien, claire, le col à r 2,9 entre deux épaulements à r 8,2 ; douilles moyennes ; tiges sombres ; un T côté train, une chape côté pont. Le col s'allume veille (shader : brillant au col, faible ailleurs).
- **La cabine** : un caisson sombre enfoncé, un dôme vitré en tronc de pyramide sur montants pleins, une console à tribord, deux écrans (une jauge ronde dont l'aiguille suit `dial` — le raccord « le cadran de l'écran → la molette » —, et trois barres), deux sièges.
- **La catapulte oblique** (`cats[1]`) : le même constructeur, sans trace, deux brides.
- **Les trois brins** : le pendentif tendu à 9 cm du pont (deux jambes de câble, épaisseur ≥ 2,6 px), deux appuis bas, deux réas de pont dans leurs pots (ils pivotent vers l'anse quand Andromède est prise) ; sous le pont, pour chaque brin : deux câbles de manœuvre (descente, retour sous le pont, réa de renvoi, palan à deux brins sur la traverse), le frein : cylindre de verre, bagues pleines, huile (volume) veille → signal en chauffant, vérin et sa tête, traverse et ses deux grands réas, bloc fixe, rails, bloc-vanne et (Andromède) sa molette `bdial`.
- **Le laser** (ruban cœur + halo, ≥ 7 px de large, de la lisière bâbord près de l'arrondi jusqu'à 1,5 m au-dessus de ton avion) et **les trois guides** (la pente en tirets larges qui fondent avant le pixel et s'effacent à moins de 15 m de l'œil ; le crochet d'angle à ton nez ; l'axe prolongé vers l'arrière).
- **Le miroir** : socle, colonne de la lentille (verre sombre), deux bras pleins de cinq feux veille (la ligne), deux colonnes de quatre feux signal (wave-off), la boule (blanc chaud, signal sous ≈ −0,3). Chaque feu est une boule de lumière qui ne descend jamais sous 4 à 6 px, et dont le cœur s'élargit quand ce plancher la tient (un point qui se voit de loin, pas un disque qui bave).
- **L'établi** : item 2 — un tronçon de cylindre ouvert d'une fenêtre (vers une caméra à az −30), son piston, la vapeur veille derrière ; à côté, une catapulte électromagnétique : socle, deux rangées de douze bobines, la plaque d'induit entre elles, qui suit la vague. Item 4 — Ely, 1911 : une plateforme de planches aux rayons X, deux lisses, cinq cordes pleines tendues en travers, un sac de sable plein à chaque bout.

## Ce que fait chaque nombre (une ligne)

| nombre | effet |
| --- | --- |
| `under` | montre tout ce qui est sous le pont (cylindres, pistons, liaison, vanne, molette, ballon, conduites, freins, câbles) en fondu ; à 0 ils sont invisibles (`visible = false`). `explode` > 0 les montre aussi |
| `explode` | l'éclaté SUR PLACE, chaque pièce dans sa fenêtre : les filets de la fente montent de 2,6 m et s'effacent (0 → 0,5) ; les cylindres s'écartent de ±2,3 m et descendent (0 → 0,55) ; la navette monte de 2,6 m, la liaison de 1,4 m (0,08 → 0,55) ; les pistons sortent à l'arrière de leurs cylindres (0,2 → 0,8) ; la barre de retenue monte de 2 m (0,15 → 0,65) ; la vanne sort à bâbord et monte (0,35 → 0,9) ; le ballon vient à bâbord, monte et avance de 12 m (0,45 → 1) ; les conduites s'effacent (0 → 0,25) |
| `named` | 1 cylindres · 2 pistons · 3 navette, croc, liaison · 4 les deux filets de la fente (veille) · 5 la barre et son col · 6 le ballon (et sa vapeur ×1,35) · 7 la vanne et sa molette · 8 la cabine · 9 la catapulte oblique (ses filets aussi) · 10 le miroir · 11 les trois brins · 12 le frein d'Andromède |
| `shuttle` | mètres : navette, liaison et pistons avancent ; **la navette s'arrête à 70,4 m dans son frein à eau** (voir « À changer ailleurs ») ; avec l'éclaté, il fait encore glisser les pistons sortis (« les pistons glissent d'un mètre » : `shuttle` 0 → 1 pendant `named` 2) |
| `press` | la vapeur derrière les pistons (veille sur la peau, front clair derrière eux) ; pistons au départ, une charge très faible qui s'étend sur 15 m devant ; aussi le débit des conduites et du ballon (avec `valve`) |
| `trace` | une tête de lumière court la fente de la navette (s = 0) jusqu'au bord du pont (73,8 m), la ligne reste allumée derrière ; **ne dépend que de sa valeur : redescendu par un tween, la tête recule** — voir `traceOut` |
| `valve` | le disque tourne de 90° (fermé → ouvert), la vapeur passe : carter et conduites s'allument, anneaux qui courent |
| `dial` | la molette graduée de la vanne (±135°) ; l'aiguille de la jauge ronde de l'écran de la cabine |
| `tank` | la vapeur dans le ballon (× 0,35 sans `under`, × 1 avec) |
| `jbd` | le déflecteur se lève (0 → 52°), ses vérins apparaissent au-delà de 0,02 |
| `cabin` | vitrage teinté veille, écrans allumés |
| `held` | 0 : la barre couchée sur le pont, devant sa ferrure · 1 : accrochée au train avant (entre les deux, son bout se lève) |
| `strain` | 0 : un peu de mou (le col 9 cm plus bas) · 1 : tendue, le col veille qui respire lentement ; tremble avec `tremble` (30 Hz : un flou stable, sur une houle à 0,9 Hz, ±0,3 cm) |
| `broken` | 0 → 1 : la lumière blanche au col (montée sur 0 → 0,27 ≈ deux images à 0,25 s, puis elle meurt en rapetissant), six petits éclats ; la moitié train part avec le train avant (elle pend sous lui, il suit `shuttle`), la moitié pont retombe sur le pont et claque (rebond 0,55 → 0,85) |
| `shuttle2` | la navette oblique (mètres) |
| `wires` | les trois pendentifs veille (faible) ; `wireName` 1/2/3 allume plus fort celui qu'on nomme |
| `caught` | l'anse d'Andromède va à `hookAt`, les réas de pont pivotent vers elle |
| `pull` | une tête de lumière court de l'anse aux réas puis dans les câbles (2,2 m de course par mètre tiré : sortie du circuit vers 30 m) |
| `brake` | Andromède : la traverse et le vérin avancent de 3,7 m vers le bloc fixe, l'huile passe de veille à signal (0,25 → 0,95), ses anneaux courent |
| `bdial` | la molette du frein d'Andromède (±135°) |
| `mirror`, `ball`, `waveoff` | la ligne veille et la boule (±125 cm ; signal sous ≈ −0,3) ; les huit feux de wave-off, fixes, une respiration à 0,45 Hz |
| `laser`, `laserTo` | le faisceau du bord bâbord à 1,5 m au-dessus de ton avion |
| `guides` | 0 → 1/3 la pente se dessine depuis le toucher (1,1 km) · → 2/3 le crochet d'angle à ton nez (il suit `laserTo` et le tangage) · → 1 l'axe prolongé |
| bench `coils`, `press` | la vague des bobines (et la plaque qui la suit) vers −z ; la vapeur du tronçon et son piston qui avance de 20 cm |

## Poses qui cadrent (vérifiées sur planche, prêtes à coller)

Toutes avec `roll: 0, drift: 0.3, shift: 0`, `fov: 28` sauf indiqué. NG = `CAT[0].from` = (−200, 0, −5500).

- **L'éclaté, proposé à la place de `VIEW.exploded`** (le `VIEW` actuel est juste, mais à 42 m les pièces font 5 à 9 % de la hauteur) : `{ tx: -500, ty: -150, tz: -5300, d: 2700, az: -40, el: 22, side: -80, fov: 28, dof: 0 }` — état `{ explode: 1, under: 1, jet: 0, dog: 0, crew: 0, parked: 0 }`. Les deux cylindres fuient vers l'étrave en diagonale, pistons sortis à l'arrière, navette et barre en l'air, vanne à bâbord en bas ; `named` 1, 2, 3, 7 se lisent dessus. (Le ballon déplacé n'a pas été revu après son dernier réglage.)
- `VIEW.trough` `{ under: 1, press: 0.6, shuttle: 30, jet: 0, jbd: 0 }` : les cylindres verts derrière les pistons, le front clair — se lit. À `press` 1 pistons au départ (`shuttle` 0,15), la charge devant a été baissée après la planche (non revue).
- `VIEW.shuttle` `{ hooked: 1 }` : la navette et son croc, la barre derrière. Avec ton avion (`jet` 1), à revoir avec `bord.js` (sa barre de lancement doit tomber dans l'encoche, voir plus bas).
- `VIEW.holdback` `{ strain: 1 }` : le col veille en gros plan, la pièce en os de chien se lit. `{ broken: 0.15 }` : lumière et éclats au col. Pour voir la séparation : `d 420, az -75, el 8` avec `{ broken: 0.5, shuttle: 2 }` (la moitié pont couchée, l'autre partie avec le train).
- `{ held: 0, hooked: 0, strain: 0 }` sur `VIEW.holdback` avec `d 420, az -75, el 8` : la barre couchée devant sa ferrure, à côté du croc.
- `VIEW.valve` `{ under: 1, dial: 0.7, valve: 1, press: 1 }` : la molette, la fenêtre, le disque vertical, la vapeur dans les conduites — très lisible.
- `VIEW.tank` `{ under: 1, tank: 1 }` : se lit (le fond avant, retourné, n'a pas été revu après correction).
- `VIEW.cabin` `{ cabin: 1, cabinCrew: 1 }` : le dôme vert, les deux écrans (jauge, barres), deux personnages de verre assis — lisible.
- Le dos du déflecteur : `{ tx: -200, ty: 120, tz: -3700, d: 1500, az: -20, el: 10, fov: 40 }` `{ jbd: 1 }`.
- `VIEW.brake` `{ under: 1, brake: 0.7, bdial: 0.6, wires: 1 }` : le cylindre de verre plein d'huile orange à anneaux, le vérin, la traverse, la molette verte — très lisible.
- `VIEW.mirror` de nuit `{ night: 1, mirror: 1, ball: 0 }` : la ligne verte, la boule blanche au centre — lisible.
- **Miniature 2 (« FAITE POUR CASSER »)** : `VIEW.benchPiece` `{ tx: 0, ty: 20, tz: 0, d: 120, az: -24, el: 10, side: -100, fov: 28, dof: 5 }`, état `{ set: 1, item: 0, strain: 1 }` (et `mood` 0 si l'on veut le vert sans l'orange du sol) : la douille, le col veille, l'épaulement, la tige — la pièce remplit ≈ 45 % de la hauteur. `VIEW.benchHoldback` `{ set: 1, item: 0, strain: 0.6 }` : la barre entière, ≈ 60 % de la largeur.
- `VIEW.emals` `{ set: 1, item: 2, coils: 0.6, press: 1 }` et `VIEW.ely` `{ set: 1, item: 4 }` : lisibles tels quels.

## Ce qui n'est pas au niveau / pas vérifié

- **L'éclaté vu de loin** : 75 m de cylindres de 54 cm font des traits ; ce sont les pièces de l'arrière (pistons, navette, barre, vanne) qui le portent : filmer avec la pose proposée ou plus près, jamais à 42 m.
- La lueur rose sur le dessus de la navette, des lances et de la plaque d'induit : le reflet du contre-jour signal (`mood` 1) sur des faces claires ; avec `mood` 0 elle passe au vert. Navette rendue mate, pas revue ensuite.
- **Non revus après réglage (budget d'images épuisé)** : le miroir à 1,3 km (cœur élargi sous le plancher de pixels, plancher porté à 4–6 px : à juger sur le brouillon), la charge devant les pistons à l'arrêt (baissée de 0,2 à 0,06), le fond avant du ballon, sa position dans l'éclaté.
- **Andromède prise** (`caught` 1, `pull` 10) : non vue sur planche (mon cadrage visait à côté) ; le calcul de l'anse (repère du navire → piste → brin) est écrit mais à vérifier sur le premier essai du chapitre.
- Les guides et le laser de nuit : la pente et le faisceau se devinent sur la planche d'approche, pas jugés de près.
- Les écrans de la cabine sont deux signes (une jauge, trois barres), pas une interface.

## À changer ailleurs

1. **`plan.js` · `CAT[0]`** : sur la ligne de la catapulte avant (x = −200), le pont s'arrête à **73,8 m** de `from` ; avec 75 m de course plus le frein à eau, la navette sortirait du pont. Dans ce fichier, la navette **s'arrête dans son frein à eau à 70,4 m** et les cylindres finissent 30 cm avant le bord. Conséquence pour `world.js` / `bord.js` / les chapitres : `hooked` doit passer à 0 **avant `shuttle` 70,4** (au-delà, ton avion continue seul : `runOf` le fait déjà si `hooked` < 0,5). Si l'architecte préfère la course entière : reculer `CAT[0].from` d'au moins 4,5 m (z −5500 → −5050) avec tout ce qui en dépend (`JBD.z`, `TANK.at`, `VALVE.at`, `CABIN.at`, `CREW.dog`), ou avancer l'étrave du contour. La catapulte oblique tient (pont jusqu'à 86 m).
2. **`bord.js` · la barre de lancement** : l'encoche du croc est à **`onCat(0, 50, 20)`** au repos (50 cm devant l'axe de la roue avant, 20 cm au-dessus du pont) — ancre `model.cats[0].A.croc`. `RAFALE.tow` dit (0, 40, −25) : la barre doit descendre de là vers l'encoche, sinon la roue touche le croc.
3. **`world.js` · `VIEW.exploded`** → la pose proposée ci-dessus.
4. **`world.js` · FIRST et `model.set`** : ajouter `traceOut: 0` (0–1 : éteint la trace là où elle est, sans qu'elle recule) et le passer dans `model.set({ …, traceOut: S.traceOut })`. Sans lui, un `trace` 1 → 0 fait reculer la tête : à faire sur une coupe ou sous une carte. Concerne c1 (aperçu de nuit, « `trace` retombe »), c2 (« `trace`, `named` → 0 »), c6 (la boucle, où `D.loop` ramène `trace` à 0 pendant la descente vers POSE0 : la tête reculera à l'image).
5. **`world.js` · sièges de la cabine** : `model.cabin.A.seats[i]` est au plancher (y = −88 sous le pont), tourné pour que son +z regarde la console (+x) ; l'assise d'un siège est à 50 cm du plancher (y −38). `bord.js` assoit ses personnages en conséquence.
6. **`navire.js`** : laisser libre de peinture l'empreinte de la cabine (300 × 220 cm autour de `CABIN.at`) ; les pièces sous le pont n'apparaissent qu'avec `under` (ou `explode`), le pont n'a pas à les cacher.
7. **Ancres pour les étiquettes** : `model.brins.A.labels[0..2]` (aussi `athena`, `aphrodite`, `andromede`) à 60 cm au-dessus du milieu de chaque brin ; `model.holdback.A.neck` au col ; `model.cats[i].A.croc`.
