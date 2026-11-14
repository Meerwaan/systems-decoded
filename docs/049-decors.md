# 049 · Le GPS — les décors

Contrat posé le 14/11 par l'architecte (`docs/journal/049-architecte.md`). **Trois fichiers, un agent chacun** : `route.js` (une enveloppe de la route du 025, le moins cher), `model.js` (le téléphone, le système plein), `satellite.js` (le ciel : le satellite, ses signaux, les sphères). Chacun a aujourd'hui un **bouchon** en volumes gris qui construit, avec son **API définitive** : tu remplaces l'intérieur de la fonction, tu gardes ce qu'elle rend et les nombres qu'elle lit. `world.js` les appelle déjà (lis `apply()` : c'est ainsi que ton fichier est appelé).

Commun aux trois :
- **Le repère est celui de la voiture** (`src/plan.js`, en tête) : la voiture ne bouge jamais, son centre à l'origine, son nez vers −z, sa GAUCHE en −x, le sol en y 0. La route, le carrefour et le champ défilent dessous avec `gap` ; **le ciel ne défile pas** (les satellites, leurs anneaux, leurs sphères pendent dans le repère de la voiture). Caméra : az 0 derrière la voiture (+z), −90 à sa gauche, ±180 devant ; `el` < 0 regarde vers le haut.
- **Une maquette, pas l'échelle** : satellites à 30–45 m au-dessus de la voiture, le point bleu déplacé de 9 m dans le champ. **Aucune longueur ni hauteur écrite sur le ciel ou le sol** (`sources` le dit). La contre-vérification : coter « 1 µs = 300 m de lumière », jamais « le point a sauté de 300 m » ; jamais « 11 km d'erreur de position ».
- **Le point bleu est la seule entorse aux trois couleurs** : la voix dit « point bleu » six fois, c'est l'icône du téléphone. Un seul bleu (≈ #3B8CFF), sur le point seulement (à l'écran et au sol), jamais ailleurs. Si le chef de production le refuse, il passe en `veille` — l'API ne change pas.
- La nuit est **sèche** (la route du 025 sans pluie : `rain` 0).

## route.js

**L'enveloppe de la route du 025** — `import { buildRoute } from "../../025-esp/src/route.js"`, tel quel : **on ne touche jamais au fichier du 025** (il est en ligne). Elle apporte la voiture de verre, toi au volant, la route, son marquage, les bas-côtés, les fossés, les balises de l'habillage du 025. Ce que 049 ajoute, dans ton fichier seulement :

- **Le carrefour en T** à `gap` mètres devant le pare-chocs : la route qui croise (deux voies, son marquage, une ligne d'arrêt ou de cédez-le-passage à ton bord), **ta route qui finit** à son bord lointain (la haie, puis le champ sombre). La route du 025 est infinie : la couper proprement (plans de coupe sur ses matières, ou ce qui marche) ; **si elle ne se coupe pas, un carrefour en croix** (la voix ne dit que « un carrefour » ; le `voir` dit T — écris ce que tu as fait dans ton journal).
- **Les deux branches qui s'allument tour à tour** (`branchL`, `branchR`) : une tête de lumière `ink` qui file le long de la branche, vers la gauche puis vers la droite, pas un aplat.
- **Le champ sombre à ta droite**, au-delà du fossé (`FIELD`, `DITCH`) : des sillons en traits fins, aux rayons X (pas de sol plein : une grille, des sillons). **Le fossé marqué** (`ditch`) : une ligne signal le long de son bord, qui dit « de l'autre côté du fossé » — pas une bande pleine (le bouchon fait une bande : c'est trop).
- **Le bois du 025 caché** (ses arbres portent l'attribut `aTree` ; le bouchon les cache déjà) : rase campagne, il faut que le champ se lise. Quelques haies ou un hameau lointain si le plan est vide, rien devant la voiture.
- **Le support du téléphone** sur la planche de bord (`A.holder`, à `PHONE.at`, incliné de `PHONE.tilt`, tourné de `PHONE.turn`) : pince et pied, aux rayons X comme la voiture. `world.js` y monte le téléphone (repère propre du téléphone : écran +z, haut +y). Vérifie qu'il tient dans la planche de bord de la voiture du 025 et qu'on le voit de la place du conducteur ; s'il faut le déplacer, change `PHONE.at` sous « À changer ailleurs ».
- **Le panneau de direction** (`sign`) sur le bas-côté lointain, face à toi, dans tes phares : flèches gauche / droite, **aucun nom de lieu, aucun texte**.
- **« Onze kilomètres de lumière »** (`streak`) : un trait de lumière `veille` qui se déroule au-dessus de la route droit devant, et file dans la nuit jusqu'à l'horizon (une tête brillante, une longue traîne qui s'amincit avec la distance).

**API** — `buildRoad() → { group, road, frame, A, update(p, time, px) }` ; `frame` est le repère du carrefour, dans le `slide` défilant du 025 (origine : le bord proche du carrefour, sur l'axe de ta voie) ; `A` : `holder`, `sign` (plus ce qui te sert : `junction`, `fieldFix`…).
**Nombres lus** : `shell, gap, yaw, lane, steer, rolled, you, branchL, branchR, ditch, sign, streak, holder` (`gap` = `eta × MPS`, `rolled` = −`gap` : c'est `world.js` qui les calcule).

**Les images à réussir** (liste fermée ; poses de départ dans `world.js` → `VIEW`, à recaler et à rendre dans ton journal) :
1. `hook` (POSE0) — par le pare-brise, derrière le téléphone : la route qui file dans tes phares, le carrefour qui arrive, le champ à droite et sa ligne signal. Rien de clair derrière l'écran du téléphone.
2. `chase` — derrière la voiture, bas : les phares, le carrefour en T devant, la haie au bout.
3. `plunge` — en plongée : la voiture, sa voie, le fossé signal, les sillons du champ, la place du point bleu (`FIELD_FIX`).
4. `climax` — vue plongeante haute : la voiture et le carrefour lisibles à 270 px sous les cercles de `satellite.js`.
5. les deux branches allumées tour à tour (une planche de deux).
6. `sign` — le panneau dans les phares.
7. `streak` à 0,5 puis 1.

**À savoir** : le décorateur ne passe pas sur ce décor si le tien suffit (l'habillage du 025 vient avec lui) ; ce qui défile vite (sillons, marquage) se fond — `grid.uSmear` ou équivalent, pas de trait sous 1,8 px.

## model.js

**Le téléphone, plein** : le système qu'on ouvre. Un smartphone **sans marque**, sans logo ni encoche reconnaissable, en portrait, trois valeurs de gris (`metal` ≤ 0,5). Son repère propre : centre à l'origine, écran vers +z, haut vers +y (`PHONE.w/h/t` : 7,2 × 15 × 0,8 cm).

- **Les couches**, de l'écran vers le dos : verre et écran, cadre, **la carte** (le circuit, ses composants en relief bas), **la puce de réception** (`PHONE.chip`, la pièce-héros de l'éclaté : nettement plus claire), **l'antenne** (`PHONE.antenna`, une piste près du bord haut), **le quartz** (`PHONE.quartz` : un petit boîtier, et dedans la lame de cristal qui vibre — c'est lui qu'on voit battre), la batterie, le dos.
- **L'écran** est une carte de navigation de nuit **dessinée par le téléphone lui-même** (un canvas) : ta route verticale, le T du carrefour devant (il se rapproche avec `eta`), le champ hachuré à droite et son fossé, **le point bleu** avec son halo de précision ; `err` le pousse hors de la route, dans le champ. `map` 0 l'efface, `strike` la barre d'un trait (la chute : « il ne vient pas d'une carte ») ; il reste alors **une heure qui défile en millionièmes** (HH:MM:SS,ssssss tiré de `time`, en chiffres monospace `ink`) et le point posé sur la route. Le canvas ne se redessine que quand ses entrées quantifiées changent (`update` est appelé seize fois par image).
- **`peek`** (dans la voiture) : le dos, le cadre et l'écran passent au verre ; la carte, la puce, l'antenne et le quartz restent pleins — « on plonge dans le téléphone » sans quitter la voiture.
- **L'éclaté** (`explode`, sur l'établi) : **en rangée, en travers de la caméra** (les couches le long de son épaisseur, vues de trois quarts), une seule image verticale ; la carte et sa puce au centre.
- **Le quartz** : `qBeat` est un compteur (sa fraction = la pulsation : une lueur qui gonfle et retombe, jamais un clignotement) ; `tremble` fait trembler la lame ; `quartz` 0 `veille` → 1 `signal`, franc.

**API** — `buildPhone() → { root, parts, A, fx, update(p, time, px) }` ; `A` : `chip`, `antenna`, `quartz`, `screen`, `dot`, `top`.
**Nombres lus** : `bench, explode, peek, quartz, qBeat, tremble, screen, map, strike, err, eta, litChip, litQuartz`.

**Les images à réussir** :
1. `hook` (POSE0) — le téléphone vu de dessous dans son support, 40 % de la largeur : l'écran lisible à 270 px (la route, le T, le point qui saute dans le champ entre `err` 0 et 1).
2. `phone` — de trois quarts, proche : écran et point.
3. établi `bench` (« Alors… ») : le téléphone entier, plein, sur son halo.
4. `exploded` : les couches en rangée, la puce et l'antenne qui sortent, lisibles.
5. `chip` : la puce et son antenne, `litChip` 1.
6. `quartzBench` puis `quartzCar` (`peek` 1) : le quartz vert qui bat, puis rouge qui tremble (`quartz` 1, `tremble` 1).
7. la chute : la carte barrée (`strike` 1), puis effacée (`map` 0), l'heure en millionièmes et le point sur la route.

**À savoir** : sombre sur un halo ou clair sur sombre, jamais sombre sur sombre — dans la voiture la nuit, l'écran allumé fait son halo ; le dos du téléphone vu de dessous a besoin d'une arête claire.

## satellite.js

**Le ciel** : le satellite (plein), ses voisins, ses signaux, les sphères de distance, le point au sol, et sur l'établi le fil de lumière.

- **Le satellite**, **sans marque** (un caisson, deux ailes de panneaux solaires, le réseau d'antennes sur la face tournée vers la Terre — sa face −y), dans ses propres unités (`SAT` : caisson 16 × 18 × 16, envergure 64) ; dans le ciel il est mis à l'échelle `SKY_SCALE`, son réseau d'antennes tourné vers la voiture. Dedans, pleins : **l'oscillateur** (un boîtier, le synthétiseur de fréquence) et, au cœur, **l'horloge atomique** (un tube, un cœur `veille` qui bat au rythme de `beatSat`). `satGlass` passe le caisson aux rayons X (l'horloge pleine dedans) ; `satExplode` l'ouvre (ailes qui s'écartent, oscillateur et horloge qui sortent) ; `core` efface tout sauf l'horloge, seule sur sa lumière (« au cœur »).
- **`twin`** : l'horloge **restée au sol**, son double `ink`, à côté de celle du satellite ; `beatGnd` la fait battre. Si `beatSat` va moins vite que `beatGnd`, l'œil doit voir « plus lente » (promesse) ; plus vite, « en avance » (commentaire).
- **Les trois autres satellites au-dessus de toi** (`SATS[1..3]`, `sats` 1 → 4) et **le reste de la constellation** (`OTHERS`, `others`), plus pâles, qui glissent lentement sur leur trace (déterministe en `time`, lent).
- **Les anneaux de lumière** : `rings` 1 = un flot continu d'anneaux qui descendent de chaque satellite visible vers la voiture (une lumière qui a un endroit : une tête, une traîne ; au plus une demi-période par seconde, jamais un clignotement) ; `w1…w4` = UN anneau marqué par satellite, 0 au satellite → 1 à la voiture (la porte de l'acte 3). Rien ne remonte (« il n'envoie rien »).
- **Les sphères** (`spheres` 0 → 4) : centrées sur chaque satellite, de grandes coques transparentes (un liseré de Fresnel, quelques méridiens fins tracés au shader avec `fwidth`) **et surtout leur cercle au sol** — la ligne lumineuse où chaque sphère touche le sol : c'est là qu'on lit le croisement. **Géométrie juste, déjà réglée dans `plan.js`** : rayon = |S − ROAD_FIX| − `DELTA·err` pour les quatre ; à `err` 1 les trois premières se croisent EXACTEMENT en `FIELD_FIX` (vérifié), la quatrième le manque de ≈ 9 m ; à `err` 0 les quatre se croisent sur la route. Couleur **franche** : `signal` tant que `err` > 0,02, `veille` dessous.
- **Le point bleu au sol** (`dot`) : là où les sphères se croisent (`ROAD_FIX` → `FIELD_FIX` avec `err`), un disque bleu et son halo de précision, posé au sol.
- **Sur l'établi** (`bench`, repère de l'établi) : **le fil de lumière** (`thread`) de l'antenne du téléphone (`BENCH.phone` + `PHONE.antenna`) à celle du satellite (`BENCH.sat`) ; **la règle** (`ruler`) : une graduation par « 300 mètres » le long du fil ; **l'anneau qui le parcourt** (`travel` 0 → 1, du satellite au téléphone) et allume chaque graduation au passage ; **`distance`** : les graduations se fondent en un trait de distance plein.

**API** — `buildSky() → { group, hero: { root, parts }, bench, A, update(p, time, px) }` : `group` dans le repère de la voiture ; `hero.root` est re-parenté par `world.js` (dans `group`, ou dans l'établi) et `update` le place selon `p.bench` ; `bench` est le groupe de l'établi. `A` : `clock`, `osc`, `array`, `twin`, `sats[4]`, `dot`, `threadTop`, `threadFoot`.
**Nombres lus** : `bench, sats, others, satGlass, satExplode, core, twin, beatSat, beatGnd, rings, w1, w2, w3, w4, spheres, err, dot, thread, travel, ruler, distance, litOsc, litClock`.

**Les images à réussir** :
1. `hook` (POSE0) — le satellite, petit mais lisible, en haut du cadre par le pare-brise.
2. `up` — de la voiture vers le satellite : les anneaux qui descendent.
3. `satSky` — le satellite dans le ciel, caisson aux rayons X, l'horloge qui bat, son double `ink` à côté (`twin` 1).
4. `bench` / `satBench` — sur l'établi, le satellite entier puis éclaté ; `heart` : l'horloge atomique seule sur son halo (`core` 1).
5. `thread` — le fil, la règle, l'anneau à mi-course (`travel` 0,5), puis `distance` 1.
6. `high` — les quatre satellites, leurs quatre sphères, la constellation autour ; on y lit « chaque distance trace une sphère ».
7. `climax` — trois cercles au sol qui se croisent dans le champ (`err` 1, `spheres` 3), puis quatre qui se croisent sur la route (`err` 0, `spheres` 4).
8. `clocks` — les deux horloges côte à côte sur l'établi (commentaire).

**À savoir** : les sphères font 35 à 58 m de rayon — vues de près, ce sont des murs : leur coque s'efface quand la caméra est dedans, seul le cercle au sol reste. Le brouillard (`world.js`, 0,00004) doit laisser lire un satellite à 60 m. Le satellite est la seule pièce pleine du ciel.
