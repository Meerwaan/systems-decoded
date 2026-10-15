# L01 — `kit/lib/usine.js` (four, cuve, tapis) — journal

2026-10-15, soir. Propriétaire : `kit/lib/usine.js` seul. Interface du bouchon conservée (mêmes exports, mêmes noms ; tout ajout est optionnel, avec une valeur par défaut). Le build passe, la page tourne (aucune erreur sur la dernière planche).

## Ce qui est fait

- **Le principe de lumière** : une machine n'est jamais pleine ; c'est ce qu'elle chauffe qui l'éclaire. Chaque coque peut recevoir une **chaleur cuite** (`xray(geo, { heat: (x, y, z) => 0–1 })`) : là où il fait chaud, le bord du verre et ses arêtes passent de l'encre au signal (un second jeu d'arêtes en signal, chaque extrémité aussi chaude que la coque à cet endroit). En plus, une **lumière intérieure** (`innerMat`) : les faces arrière d'une copie rentrée de la coque, éclairées depuis la source (le bain de verre en bas, ou les résistances en haut), selon le profil de chaleur du poste — on voit une forge à travers une vitre, pas un voile.
- **Le four** (`makeFurnace`) : trois machines d'un même bloc (`kind`) — fusion (voûte en arc, armatures et tirants, brûleurs en rangées avec leurs lances, langues de flamme sur le bain, regards ; niche d'enfournement sous la trémie, élévateur à godets derrière ; canal de sortie et sa porte, le « tweel », qui monte avec `open`) ; étenderie (tunnel bas ouvert, zones encadrées, un ventilateur par zone sur le toit, portes de visite ; chauffé par le ruban à l'entrée) ; four à résistances (toit plat, résistances qui rougissent sous le toit, poteaux de zone, portes levantes aux deux bouts, regards, cheminée).
- **La cuve plate** (bain d'étain) : bac OUVERT (murs, fond, deux bouts — une première version fermée posait un couvercle de verre sur le miroir), étain en miroir sombre calculé dans le shader (rayon réfléchi → les nervures de la hotte et sa chaleur d'entrée, la lueur du ruban sur l'étain à côté de lui, un reflet doux de la boîte à lumière), hotte très légère nervurée, collecteur azote + hydrogène sur le toit, passages des molettes dans les joints latéraux, souffle pâle sous la hotte.
- **La cuve cylindrique** (autoclave) : tambour, fond bombé, bride et boulons, griffes de fermeture rapide (bouche et porte décalées d'une demi-griffe), porte bombée sur son poteau de charnière (côté opposé à la caméra : on voit dedans quand elle est ouverte), hublot qui luit avec la pression, cerclages, berceaux, manomètre côté caméra dont l'aiguille suit `pressure`, arrivée d'air et son volant, rails du chariot ; la chaleur ≈ 140 °C reste une lueur douce.
- **Le tapis** : rouleaux en verre fusionnés en un seul maillage (le shader `glass()` n'instancie pas : réglé en fusionnant), chacun avec une marque douce qui tourne de `roll / radius` (l'obturateur du plateau la floute) ; longerons par tronçon entre les trous, un palier (cercle) à chaque bout de rouleau, pieds ; zones `warm` où le verre chaud éclaire les rouleaux.
- `xray()` garde sa signature et `userData.fade(a)` ; largeur de trait par défaut passée de 1,6 à **1,8 px** (règle « aucun trait sous 1,8 px » ; touche aussi `postes.js` et `dossier.js` s'ils n'en donnent pas).
- Les petites pièces d'acier (armatures, poteaux, boulons, griffes, ventilateurs, berceaux…) sont hors de la coque unique (`shell: false`) : dedans, elles masquaient la lueur des parois derrière elles en barres noires (planche 2).

## Ce qui a raté et pourquoi

1. Planche 1 : le four était une dalle saumon. Cause : lumière intérieure uniforme ET terme de chaleur du verre quatre fois plus fort que son bord encre — sur les grandes faces vues en rasant, il remplissait tout. Réglé : la chaleur prend le bord du verre lui-même (`uRim × 1,6`), l'encre s'efface sous la chaleur, la lumière intérieure tombe vite avec la hauteur (`floor` 0,03).
2. Planche 2 : autoclave sous pression tout orange (même cause), barres noires dans le four de bombage (asShell, voir plus haut).
3. Planches 2 et 4 : dans l'étenderie, les parois vues de l'intérieur s'allumaient en blanc par le terme de « lèvre » du verre (`edge`, fait pour les surfaces courbes). Réglé pour le tunnel : `rim` 0,06, `power` 4, `edge` 0,1.
4. Planche 4 : l'étain se lisait comme une dalle grise. Cause trouvée en relisant le code : le bac était une boîte fermée. Refait ouvert, **non revu à l'image** (budget atteint).

## Catalogue du bloc

### `makeFurnace(opts)` → `{ group, A: { mouth, exit }, set({ amount, glow, batch, open, time }) }`

| réglage | défaut | effet |
| --- | --- | --- |
| `length`, `half`, `height` | 1000, 250, 300 | taille (cm) |
| `tunnel` | false | raccourci pour `kind: "lehr"` |
| `hopper` | null | `{ x, top, mouth, shape: "box" \| "cone", r }` : trémie (et `kind` → `"melter"`) |
| `kind` | lehr / melter / oven | la machine (voir plus haut) |
| `roof` | arch (melter), flat | voûte en arc ou toit plat |
| `crown` | half × 0,3 | flèche de la voûte |
| `wall` | height − crown | hauteur des murs |
| `melt` | height × 0,29 (melter), 90 | hauteur de ce qui luit (surface du bain / tapis) ; lumière intérieure et canal s'y règlent |
| `fire` | burners / none / elements | brûleurs, rien, résistances |
| `burners` | ≈ 0,62 L / 160 par flanc | nombre de brûleurs par flanc |
| `firing` | "near" | côté qui crache la flamme : near (caméra), far, both |
| `elements` | L / 75 | nombre de résistances (four à résistances) |
| `windows` | 3 (melter), 2 (oven), 0 | regards par flanc |
| `bays` | 160 | pas des armatures (melter) |
| `zones` | L / 300 (lehr), L / 250 (oven) | zones encadrées |
| `fans` | 1 | ventilateurs par zone (lehr) |
| `ends` | selon kind | `{ in, out }` ou une chaîne : open · shut · slot · door · spout |
| `slot` | autour de `melt` | `{ y0, y1, half }` de l'ouverture des bouts |
| `spout`, `canal` | 60, min(half × 0,45, 130) | longueur et demi-largeur du canal de sortie |
| `doghouse`, `lift` | true avec trémie | niche d'enfournement, élévateur à godets |
| `stack` | oven : `{ x: 0.82, h: 56, r: 13 }`, sinon null | cheminée (`false` l'enlève) ; `x` en fraction de L, `z` optionnel |
| `hot` | selon kind | profil de chaleur `{ h0, h1, inL, outL }` (fractions de L) |
| `heatGain` | 2,6 (lehr), 1 | la chaleur montrée pour un même `glow` |
| `lines`, `rim`, `power` | selon kind | densité des traits, bord du verre |
| set `glow` | 0 | le feu (0–1, au-delà ça monte encore) |
| set `batch` | 0 | le mélange qui tombe (visible entre 0,02 et 0,98, fondu aux bords) |
| set `open` | 0,5 (melter), 1 (oven) | porte de sortie / tweel |
| set `time` | 0 | (s) les flammes respirent, le mélange tombe en temps réel ; sans lui, sa chute suit `batch` |

Exemples qui donnent des machines différentes :
- four de fusion d'un autre film (verre creux, bouteilles) : `{ kind: "melter", roof: "arch", crown: 60, burners: 3, firing: "both", windows: 5, ends: { in: "shut", out: "slot" } }` — court et trapu, flammes des deux côtés, sortie par une fente.
- four de cuisson de céramique (casque, assiette) : `{ kind: "oven", roof: "arch", crown: 50, fire: "elements", elements: 20, zones: 6, ends: "door", stack: { x: 0.3, h: 120, r: 20 } }`.
- tunnel de séchage / polymérisation (peinture, airbag) : `{ tunnel: true, zones: 3, fans: 2, heatGain: 1.5, hot: { h0: 0.1, h1: 0.6, inL: 0.3, outL: 0.2 } }`.

### `makeVat({ shape: "flat", … })` → `{ group, A: { entry, exit }, set({ amount, shine, heat }) }`

`length`, `half`, `level` (miroir), `hood` (toit) · `tray` 8 (bord du bac au-dessus du miroir) · `bay` 200 (nervures de la hotte, reflétées dans l'étain) · `ports` L / 260 par flanc (passages des molettes) · `ribbon` 180 (demi-largeur de ce qui flotte : sa lueur sur l'étain) · `spread` 70 (portée de cette lueur) · `pipes` true (collecteur gaz) · `atmo` 0,025 (souffle pâle sous la hotte) · `exitBox` 0 (caisson de sortie, sa longueur) · `lines` 0,38. Set : `shine` (force du miroir), `heat` (entrée chaude → sortie froide).
Autres cuves : `{ bay: 120, ports: 0, pipes: false, ribbon: 60 }` — un bain de trempe étroit ; `{ hood: level + 40, atmo: 0 }` — une cuve sans hotte.

### `makeVat({ shape: "cylinder", … })` → `{ group, A: { entry, exit }, set({ amount, door, pressure }) }`

`length`, `radius`, `axisY` · `head` dished / flat · `hinge` far / near · `lugs` 16 · `bolts` 28 · `bands` L / 260 · `saddles` L / 450 · `gauge`, `window`, `pipes`, `rails` (true) · `lines` 0,42. Set : `door` 0 ouverte → 1 fermée (≈ 112° d'ouverture), `pressure` 0–1 (lueur intérieure douce, aiguille du manomètre, hublot).
Autres : `{ head: "flat", lugs: 0, bands: 8, saddles: 4, gauge: false }` — une cuve de stockage ; `{ radius: 60, length: 300, hinge: "near" }` — une chambre d'essai.

### `makeConveyor(opts)` → `{ group, set({ amount, roll, heat }) }`

`from`, `to`, `half`, `y`, `pitch` 45, `gaps` · `radius` 5 (rouleaux) · `rails` true · `legs` 360 (pas des pieds) · `warm` `[[x0, x1, k]…]` (où le verre chaud éclaire les rouleaux, fondu sur le dernier quart) · `mark` 0,3 (la marque qui tourne) · `lines` 0,4. Set : `roll` (cm parcourus), `heat` (multiplie `warm`, défaut 1).
Autres : `{ radius: 12, pitch: 70, legs: 200 }` — un tapis lourd ; `{ radius: 3, pitch: 18, rails: false }` — un banc de rouleaux fins.

## Poses qui cadrent bien (complètes, état LINE `{ "set": 2, "line": 1, "melt": 1, "ribbon": 1, "flow": 4000 }`)

- four entier : `{ "fov": 28, "shift": 0, "side": -150, "roll": 0, "drift": 0.3, "tx": 450, "ty": 150, "tz": 0, "d": 1800, "az": -24, "el": 20 }` (VIEW.furnace) — voûte orange, brûleurs, armatures, trémie à gauche
- gorge : VIEW.throat `{ …, "tx": 1030, "ty": 100, "d": 520, "az": -40, "el": 16, "side": -150 }` — le canal et son tweel en haut à droite
- trémie en contre-plongée : VIEW.hopper `{ "fov": 28, "side": -160, "tx": -200, "ty": 360, "tz": 0, "d": 900, "az": -30, "el": -6 }` + `{ "charge": 0.5 }` — la chute, la voûte en arc derrière
- étenderie : VIEW.lehr `{ "fov": 28, "side": -120, "tx": 3700, "ty": 100, "tz": 0, "d": 1700, "az": -16, "el": 14 }`
- dans le tunnel : VIEW.lehrIn `{ "fov": 40, "side": 0, "tx": 3100, "ty": 125, "tz": 0, "d": 320, "az": -82, "el": 6 }` — les rouleaux qui filent, les parois tièdes, la sortie claire
- **porte de l'autoclave ouverte** (meilleure que VIEW.autoclave pour `door`) : `{ "fov": 28, "shift": 0, "side": -100, "roll": 0, "drift": 0.3, "tx": 8850, "ty": 195, "tz": 0, "d": 950, "az": -42, "el": 12 }` + `{ "door": 0 }` — bride, boulons, griffes, manomètre
- autoclave sous pression : VIEW.autoclave + `{ "door": 1, "press": 1 }`
- four de bombage : VIEW.bend + `{ "glow": 0.6, "cut": 1, "print": 1, "mould": 1, "bend": 0.5, "pos": 6600 }` — résistances rouges au-dessus du moule
- four de trempe : VIEW.temper + `{ "sideGlow": 1, "sidePos": 6400 }`
- rouleaux de près : `{ "fov": 28, "shift": 0, "side": -100, "roll": 0, "drift": 0.3, "tx": 4950, "ty": 82, "tz": 120, "d": 260, "az": -35, "el": 14 }` — des tubes de verre, longeron, pieds

## Ce qui n'est pas au niveau (franchement)

- **Le miroir d'étain n'a pas été revu** après la correction du bac (budget d'images atteint) : reflets des nervures, lueur du ruban sur l'étain, à juger sur la première planche de l'acte (VIEW.ribbon, et une pose sur la marge `{ "tx": 2300, "ty": 90, "tz": 210, "d": 420, "az": -34, "el": 20 }`).
- L'étenderie vue de dehors reste un peu fade (toit blanchâtre en rasant) ; dedans, elle tient.
- L'autoclave sous pression : lueur douce mais assez uniforme sur tout le tambour.
- Le filet du mélange est petit en vignette 640 px (grains de ≈ 1 px de large) ; il se lit en gros plan.
- Le longeron du tapis, de très près, fait une bande grise au premier plan.
- Les deux fours à résistances (bombage, trempe) sont identiques tant que `world.js` ne leur donne pas de réglages (ci-dessous).
- La marque des rouleaux et la respiration des flammes ne sont pas vues en mouvement (aucun rendu) : à regarder au brouillon, `qa` dira si un rouleau scintille.

## À changer ailleurs (`episodes/L01-pare-brise/src/world.js`)

1. Le temps pour les flammes et la chute du mélange : `furnace.set({ amount: a, glow: S.melt, batch: S.charge, time });` (et `time` aussi dans `bender.set` et `temperOven.set`).
2. Le verre chaud éclaire les rouleaux : `const rollers = makeConveyor({ from: ST.lift.x0, to: LINE.x1 - 200, half: 200, y: LINE.y, warm: [[ST.lift.x0, ST.lehr.x0 + 900, 1]], gaps: […inchangé…] });` puis `rollers.set({ amount: a, roll: S.flow, heat: S.ribbon });` — et `temperRoll` : `warm: [[ST.temper.furnace[0], ST.temper.furnace[1] + 250, 1]]`, `temperRoll.set({ amount: a, roll: S.flow, heat: S.sideGlow });`
3. Deux fours différents : `const bender = makeFurnace({ length: ST.bend.x1 - ST.bend.x0, half: ST.bend.half, height: ST.bend.h, kind: "oven", elements: 9, zones: 2, windows: 3, stack: { x: 0.5, h: 70, r: 16, z: 0 } });` et `const temperOven = makeFurnace({ length: ST.temper.furnace[1] - ST.temper.furnace[0], half: 160, height: 200, kind: "oven", elements: 18, zones: 4, windows: 2, slot: { y0: 60, y1: 130 }, stack: false });`
4. Le caisson de sortie du bain, au-dessus des rouleaux de relevage : `makeVat({ shape: "flat", …, exitBox: ST.lift.x1 - ST.lift.x0 })`.
5. (pour `verre.js`) le canal de sortie fait 260 cm de large (`canal` 130) et son fond est à `melt − 16` = 94 : la langue de verre doit y passer ; `A.exit` du four = (x 1 060, y 110).
6. (constaté, pas à moi) en contre-plongée sur la trémie, le sol de la halle (`makeBench(900)`) fait une bande grise en bas à gauche.

## Images lues : 30 (planches de 6, 6, 8, 6, 4 ; la dernière, de contrôle d'erreurs, non lue)
