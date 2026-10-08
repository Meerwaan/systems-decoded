# 008 · bolt.js — journal

Fichier : `episodes/008-paratonnerre/src/bolt.js` (le ciel d'orage, la pluie, les traceurs, l'arc en retour).
Planches : `%TEMP%\sd-008\bolt*.jpg` — rien dans `renders/` (consigne reçue en cours de route ; je n'y avais rien écrit).
Images lues : 45 sur 45 (8 + 6 + 6 + 1 + 8 + 6 + 4 + 1 + 3 + 2). Le reste a été mesuré sans être regardé (scripts dans mon
dossier temporaire : projection des points, captures PNG comparées pixel à pixel).

## 1. Le plan tel quel ne tient pas dans un cadre (calculé avant d'écrire)

Projection des points du plan avec la caméra du plateau :

- `POSE0` d'origine : pointe de la tige à y = 1064, faîtage 1249, sol 1695 — et la **jonction à y = 243** (sous l'en-tête),
  la tête du traceur à 0,72 à y = −655 (hors cadre, à 100 m de haut).
- La jonction est 24 m au-dessus d'une tige qui coiffe une maison de 8,2 m : rapport 2,9, que la perspective ne change pas.
  Pour que la tête du traceur soit entre 500 et 720 **et** au-dessus de la jonction, il faut la jonction à y ≥ 690 : la
  meilleure pose (balayage fov 50–70, el −8…−40, d 30–120 m) donne une maison de **248 px** de haut, tige à 1238.
- Un nuage à 260 m vu depuis 35 m de la maison est soit hors cadre (au-dessus), soit loin derrière — alors le canal
  vient vers la caméra, dans l'axe du regard, et ses dix premiers bonds tiennent en 50 px.
- Vérifié à la fin : avec le plan actuel, `bolt.js` se construit et se dessine sans erreur, mais la première image n'a
  presque rien dans le ciel (209 000 pixels éclairés contre 591 000 avec les nombres proposés).

D'où la proposition (« À changer ailleurs ») : **un ciel de maquette**. Nuage à 60 m, jonction 4,2 m au-dessus de la
pointe, bonds de 2,5 à 4 m. Vu de la pelouse on ne lit aucune hauteur : on lit un canal qui descend d'un plafond de nuage
vers un toit. Le commentaire « compressed about 2.3 times » de `plan.js` est à réécrire dans ce sens.

## 2. Ce qui est construit

`buildStorm()` → `{ group, A, update(p, time) }` (le 3ᵉ argument `px` n'est pas utilisé : chaque shader lit la focale dans
la matrice de projection, une pose d'essai avec un autre `fov` reste juste). Exporte aussi `BOUNDS = 14`.

- **Le dôme** (`skyMat`, technique du fond du 007) : grille du sol à quatre niveaux (2 / 10 / 50 / 250 m), ligne d'horizon,
  et le ventre du nuage au plan `SKY.base` — bruit à dérivée analytique, deux octaves en poches (creux arrondis), trois
  octaves douces, un pas de parallaxe, chaque octave s'efface avant de passer sous quelques pixels. Trois lumières :
  de l'intérieur là où le traceur est parti (un point et une longue traîne, qui passe où le nuage est mince), d'en dessous
  par le canal (c'est elle qui donne le relief), et blanche avec `hot`. Le sol prend aussi `hot` autour de la maison.
- **La pluie** (`makeRain` × 3 cubes de 8,4 m, 34 m et 136 m de côté qui suivent l'œil, 4 200 gouttes chacun) : une goutte
  = le trait qu'elle couvre, tête en perle claire. Pas de pluie sous le sol ni sous le toit (boîte de `HOUSE`).
  `renderOrder` 30 : une coque de verre (`asShell`) cache la pluie derrière elle.
- **Les canaux** (`ribbon` + `boltMat`) : chaque tronçon est une capsule dessinée à l'écran — cœur à bord net, gaine d'air
  chaud, long halo — large selon sa distance (0,72 à 1,7 fois sa largeur nominale, jamais sous 2,5 px), posée en « le plus
  clair gagne » (`MaxEquation`) : aucune perle aux coudes. Traceur : 14 bonds × 4 tronçons, 6 ramifications (2 à 4 bonds,
  qui s'affinent 0,8 → 0,5 et pâlissent, certaines refourchent), toutes nées sur les bonds déjà faits à la première
  image. Les bonds posés gardent un cœur de signal pur (lavé de blanc, l'orange vire au rose : appris sur la 2ᵉ planche),
  seul le bond qui vient de tomber est chauffé à blanc.
- **Les têtes** (`makeHead`) : sept boules de lumière à dégradé, face à l'œil (cœur blanc, corps, longue traîne), taille
  en centimètres bornée en pixels.
- **L'arc en retour** : un front qui monte (coordonnée 0 → 0,214 le traceur de la tige, puis le canal jusqu'au nuage) ;
  derrière lui le traceur n'existe plus, il reste un canal blanc de 9 px dont l'éclat est `hot`. Mesuré : à `hot` 0, une
  image « canal frappé » est identique au pixel près à une image sans canal. `THREE.PointLight` près de la jonction
  (`hot × 1,2e6`, sans ombre, toujours dans la scène).
- **Le traceur est dessiné pour être lu de la pelouse** (`EYE`, la position de caméra de `POSE0`) : ses coins sont posés
  dans l'image vue de là puis reportés en 3D. Les 9 premiers bonds font 72 % du chemin à l'écran (`HELD_SHARE`), les cinq
  derniers arrivent vers l'œil : raccourcis depuis la pelouse, pleins vus du pignon.

## 3. Les nombres de l'état

| | |
| --- | --- |
| `sky` | le dôme entier (grille, horizon, nuage) |
| `cloud` | la lueur signal dans le nuage ; s'efface d'elle-même sous `hot` et quand `strike` passe 0,7 → 1 |
| `rain` | visibilité des gouttes |
| `fall` | longueur des traits : 6 cm (suspendues) → 58 cm |
| `drop` | centimètres tombés (chaque goutte à 78–100 % de cette vitesse) |
| `leader` | bond k posé à `k / 14` ; entre deux, le bond attend puis part dans les derniers 38 % de son intervalle |
| `up` | traceur de la tige, continu, 0 → 1 à la jonction |
| `upTree` `upChimney` `upAntenna` | chacun 0 → 1 sa longueur (55 %, 36 %, 46 % du dernier écart) ; `ups` vaut pour les trois |
| `hair` | cheveux dressés + filament de 2,5 m au-dessus de `YOU.outside` |
| `strike` | front de l'arc en retour ; éteint les deux têtes et la lueur orange des gouttes |
| `hot` | éclat du canal frappé, du nuage, du sol, des gouttes, de la lampe (0–1,5) |

`A` : `leaderTip`, `junction`, `cloud`, `treeUp`, `chimneyUp`, `antennaUp`, et en plus `upTip`, `hairTip`, `front`.

## 4. Planches, dans l'ordre

1. (8) Premier jet. Aucun canal ni pluie : mes quads tournaient le dos à la caméra (`side: DoubleSide`). Nuage en plâtre
   (creux vifs à toutes les échelles), blanc total à `hot` 1,5.
2. (6) Canaux et pluie là. Traceur petit, cœur rose, branches horizontales, arc en retour en boudin. **Découvert : un
   nombre tenu par `state` reste tenu sur les images suivantes** (voir « À changer ailleurs »).
3. (6) Bonds inégaux à l'écran (9 grands, 5 raccourcis), cœur signal pur, zigzag ≤ 42°, arc affiné. Bon : la jonction vue
   du toit, l'arc qui remonte l'orange.
4. (1) Première image avec en-tête : le canal frôlait « 03 RÉPONSE ». → il s'arque à droite (`bow`) et passe entre les
   libellés ; canal 6 px, tête plus large.
5. (8 + 6) Liste fermée. Vu du pignon, les derniers bonds se perdaient dans les branches ; cœur du nuage en disque.
6. (4 + 1) Branches seulement sur les bonds déjà faits, celles du bas partent loin de l'œil ; cœur du nuage en point +
   traîne. Première image validée : tête à (539, 626).
7. (3 + 2) Contrôle final ; les deux dernières avec le plan proposé (bundle dans mon dossier temporaire).

Mesures sans image : entre `time` 0,02 et 0,05, état tenu, le ciel (y < 880) varie d'au plus **1/255** dans trois états
(première image, arc à mi-chemin, pluie qui tombe à `drop` fixe) ; ce qui bouge sous y = 880 est la charge du
conducteur (model.js). La première image rendue avec `bolt.js` final + les quatre lignes ci-dessous est **identique au
pixel près** à celle validée à l'œil.

## 5. Poses (toutes vues, prêtes à coller)

```js
// la première image — tête du traceur (539, 626), jonction (412, 760), pointe de la tige (388, 939), fenêtre 1433–1510
{ tx: -260, ty: 1500, tz: 0, d: 3600, az: -38, el: -24, fov: 62, shift: 125, side: 100 }
// du pignon, en contre-plongée : les cinq derniers bonds, un par un (71 px chacun), puis la jonction
{ tx: -200, ty: 2100, tz: -200, d: 3600, az: -66, el: -30, fov: 50, shift: 0, side: 0 }
// la jonction, du bord du toit : la plus belle image du lot
{ tx: -385, ty: 1480, tz: 20, d: 1263, az: -38.3, el: -38.1, fov: 40, shift: 0, side: 0 }
// de loin : la maison, tout le canal, le nuage — l'arc en retour s'y lit d'un coup
{ tx: 0, ty: 2300, tz: 0, d: 7000, az: -30, el: -18, fov: 50, shift: 0, side: 0 }
// les réponses : la tige, l'antenne, la cheminée et l'arbre séparés (à az −38, cheminée et antenne se superposent)
{ tx: 330, ty: 1150, tz: 0, d: 4300, az: -22, el: -14, fov: 46, shift: 0, side: 0 }
// toi dehors : cheveux et filament (l'arbre est juste derrière : az −60 le sortirait du cadre, non vu)
{ tx: 900, ty: 300, tz: 520, d: 1500, az: -35, el: -5, fov: 28, shift: 0, side: 0 }
```

## 6. Ce qui n'est pas au niveau

- **Rien n'a été rendu** (`render --draft`) : le dôme fait sept évaluations de bruit par pixel, seize fois par image. Si
  le brouillon traîne, passer `belly(q2, foot, 5)` à 4 octaves.
- Première image : les neuf premiers bonds passent derrière l'en-tête (assombris par `#hud-shade`) ; seuls les trois
  derniers et la tête sont en clair.
- Le nuage sous lumière signal est un rouge sombre à poches noires : une ambiance plus qu'un relief net. À `hot` 1,5, un
  ovale clair un peu plat autour de l'entrée du canal.
- Les réponses faibles sont petites en plan large (1,5 à 2,3 m) : il faut un cadre serré quand la voix les nomme.
- Vu du pignon, deux branches dessinent une boucle fermée en haut à gauche.
- La pluie n'a été vue qu'immobile (deux valeurs de `drop`), jamais en mouvement. Les gouttes teintées par la tête du
  traceur ne se voient qu'en plan serré.
- La lampe `flash` n'a pas été jugée : la maison est faite de traits, seuls les pleins la prennent.

## À changer ailleurs

`episodes/008-paratonnerre/src/plan.js` — quatre lignes (testées telles quelles), et le commentaire d'en-tête sur la
compression du ciel :

```js
export const SKY = { base: 6000 };
  from: [1950, SKY.base, -890],
  junction: [-370, 1640, 40], // where the rod's own leader meets it: 4.2 m above its tip
  first: 9 / 14, // on the first frame, 9 of the leader's 14 bounds have landed (bolt.js · BOUNDS): five to go
```

`episodes/008-paratonnerre/src/world.js` :

```js
export const POSE0 = { tx: -260, ty: 1500, tz: 0, d: 3600, az: -38, el: -24, fov: 62, shift: 125, side: 100, roll: 0, drift: 0 };
```

Si la caméra de `POSE0` change de place (pas de cadrage), me le dire ou déplacer `EYE` dans `bolt.js` : le traceur est
dessiné depuis ce point.

`kit/lib/direct.js` (outil) : `Object.assign(S, window.SD.force)` ne rend jamais ce qu'il a tenu — tant qu'aucun acte
n'écrit un nombre, la valeur forcée par une image d'essai reste sur les suivantes (ma 2ᵉ planche avait un arc en retour
dans l'image « pluie »). En attendant, donner tous les nombres dans chaque `state`.
