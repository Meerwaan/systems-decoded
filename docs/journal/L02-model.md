# L02 · `model.js` — journal de l'agent

Le système plein : trois pôles de disjoncteur (le héros coupé), six sectionneurs, cadenas et pancarte, la perche, les jeux de pinces de terre, le disjoncteur de 1956.

## Fait

- **Pôle de disjoncteur à cuve sous tension** (pied à l'origine) : platine, poteau acier et goussets, fonte de tête, boîte de commande côté caméra (+z) et sa tringle, colonne isolante (brides alu, jupes sombres grandes/petites), chambre (bride basse + plage côté barres, jupes, bride haute + chapeau + plage côté ligne). Trois gris : jupes 0x434950, fonte 0x666c72, alu usiné 0xa7adb2.
- **Le héros est construit COUPÉ** : 250° du carter toujours là, le coin de 110° tourné vers l'azimut −25° (la caméra de l'établi) est une pièce à part que `see` efface, une coque de verre garde le contour ; les sections (faces coupées) en gris clair. Dedans, coupés pareil : tube support, couronne de doigts, pointe d'arc (bout émissif à part), cylindre de soufflage, buse PTFE blanche, tulipe (lèvre émissive à part), tige de manœuvre. `open` tire l'équipage mobile de 32 cm : l'arc fait 28 cm, dans la gorge de la buse.
- **L'arc** : ruban tourné vers l'œil (cœur blanc net, gaine signal, halo), une boule sur chaque pied, et **une lumière d'arc qui éclaire vraiment** : un terme d'éclairage injecté (`arcLit`) dans toutes les matières de la chambre — une LIGNE de lumière le long de l'arc, adoucie près d'elle (R0 13 cm). Une PointLight sur l'axe brûlait la buse blanche à 3 cm et laissait le carter noir (planche 2).
- **SF6** : 44 traînées veille qui partent du cylindre, passent la gorge, longent l'arc et sortent ; afflux à chaque zéro quand `wave` > 0.
- **Le courant** : sinusoïde encre dans un plan tourné vers la caméra de l'établi, à gauche de la chambre ; curseur signal ; chaque passage par zéro marqué veille (flash à son passage). L'arc respire avec |sin|, s'étrangle au zéro (largeur et éclat).
- **Éclaté** (`parts`), **nuage** (`cloud`), **ampoule à vide** (`vacuum` : le SF6 se vide — niveau qui descend —, les pièces SF6 s'effacent, l'ampoule coupée apparaît : céramique, capots, écran, contacts bout à bout, soufflet).
- **Sectionneurs** (centre-break) : deux poteaux, une poutre, roulements, colonnes isolantes, têtes alu, bras tubulaires sur pivots, contact mâle / doigts femelles. `sopen` tourne chaque bras de 90° (vers +z).
- **Boîte de commande du sectionneur de ligne, phase 1**, au pied de la colonne côté portique (x 575, z ≈ 630–644), moraillon, **cadenas** (anse qui pivote et claque), **pancarte** canvas « CONDAMNÉ · DÉFENSE DE MANŒUVRER » (Barlow Condensed, repeinte quand la police est chargée) pendue au cadenas, à droite de la boîte. Axe de fermeture (tringle + levier) : la pulsation `threat`.
- **Perche** télescopique (poignée sombre, garde, fibre gris chaud, bagues), **détecteur** (corps, trois voyants éteints, col isolant, électrode et crochet), ou **pince** au bout.
- **Jeux de pinces de terre** : borne plate qui sort du gravier, pince en C à vis en T (descend puis se serre), barre de court-circuit au sol, trois pinces de ligne à vis (œillet pour la perche), câbles cuivre (gris chaud) **éclairés** dont la forme est posée par le vertex shader (aucune allocation), tirets du courant à vitesse fixe (150 cm/s, période 46 cm).
- **1956** : châssis, deux supports isolants, six chambres en série (deux demi-corps à jupes, une fenêtre de 11 cm où l'arc brûle), brides, plages ; posé à `BENCH.old`.

## Planches

- b1 (8) : la chambre lit bien coupée ; l'arc et la PointLight brûlaient tout (gros plan blanc) ; benchPole sombre et minuscule.
- b2 (8) : arc défini ; arcCore encore brûlé (la buse blanche à 3 cm de la PointLight) ; poste : pôles, sectionneurs et cadenas lisibles ; pancarte coupée par le cadre.
- b3 (8) : lumière d'arc en ligne : l'arc se lit, la buse s'éclaire ; arcCore encore trop blanc (couleur de lumière trop chaude) ; benchPole toujours sombre ; nuage = colonne étroite et jaunâtre (mélange de teintes : une 4ᵉ couleur) ; 1956 : chambres sombres, arcs invisibles (cachés par les jupes) ; pancarte : 2ᵉ ligne trop large ; câbles de terre énormes en VIEW.work (la caméra est posée à côté d'EARTH.a).
- b4 (6) : arc net et ondulant dans la gorge orangée (le gros plan tient) ; 1956 : six fenêtres allumées lisibles ; nuage veille en bas, signal en haut, jamais mélangés ; pince de terre sur sa borne, barre, trois pinces de ligne en attente : lisible ; trois pinces posées : les câbles du jeu A barrent le cadre.
- Budget : 30 images lues (8 + 8 + 8 + 6). Aucune planche sans `--bare` (budget épuisé).

## Chaque nombre de l'état, chez moi

- `place` : 1 (établi) montre le 1956 si `era` > 0.
- `explode` : colonnes (+150) et chambres (+330) des trois pôles montent, chacune dans sa fenêtre ; les colonnes des sectionneurs (+120).
- `named` : 3 les trois pôles, 4 les trois sectionneurs de ligne, 6 cadenas + pancarte, 7 le détecteur, 8 tous les jeux de pinces (veille doux + arêtes veille).
- `open` : l'équipage mobile du héros descend de 32 cm (ampoule : 4 cm). `arc` : l'arc (n'existe que si l'écart > 0,5 cm). `heat` : cœur plus blanc, plus large, lumière plus forte.
- `gas` : traînées SF6 ; avec `wave`, afflux au passage par zéro. `wave` / `cycle` : la sinusoïde (4 demi-ondes visibles, défile au-delà), le curseur, les zéros veille ; l'arc respire avec |sin(π·cycle)| et s'étrangle au zéro.
- `see` : le coin de 110° du carter s'efface (coque de verre à la place) ; l'intérieur n'est dessiné que si `see` > 0 ou `parts` > 0.
- `parts` : fixe +70, buse +16, tulipe −10, cylindre −42, tige −80 (et l'arc suit ses pieds).
- `cloud` : panache qui monte du chapeau (hauteur 250 → 1 200 cm), veille bas, signal haut.
- `vacuum` : 0 → 0,1 le SF6 apparaît, 0,1 → 0,5 son niveau descend ; 0,25 → 0,55 les pièces SF6 s'effacent ; 0,45 → 0,85 l'ampoule apparaît.
- `era` : 0 → 0,6 le 1956 apparaît ; 1 → 2 ses six fenêtres s'allument une à une.
- `sopen` : bras à 90° (vers +z). `lock` : 0 → 0,45 cadenas qui arrive (ouvert), 0,8 → 1 l'anse claque. `sign` : la pancarte apparaît et se balance jusqu'au repos à 1.
- `threat` : respiration signal (≈ 0,5 Hz) sur la boîte de commande des pôles tant que `sopen` < 0,5 ; sur l'axe de fermeture du sectionneur (tringle + levier) une fois ouvert, éteinte quand `lock` → 1.
- `head` : 0 détecteur, 1 pince au bout de la perche (cachée quand la perche porte la pince d'un jeu, clamps entre 1 et 2). `beep` : les voyants (signal).
- Jeux de pinces — `clamps` : 0 → 0,55 la pince descend sur la borne, 0,55 → 1 la vis tourne ; 1 → 2 phase après phase : la perche vide va chercher la pince (0 → 0,18 de sa fenêtre), la monte (0,18 → 0,9), la vis se ferme ; `A.head` continu. `earthed` : teinte veille des câbles. `current` : tirets veille qui descendent (150 cm/s). `wrong` : la pince de terre et la barre vont pendre en `free`. `shock` : câbles et tirets signal.

## Les poses qui cadrent bien (complètes)

- ÉTABLI, la chambre ouverte et l'arc : `{ "tx": 0, "ty": 748, "tz": 0, "d": 300, "az": -25, "el": 6, "fov": 28, "shift": 0, "side": -160, "roll": 0, "drift": 0.3 }` + `{ "set": 1, "see": 1, "open": 1, "arc": 1, "heat": 0.6, "fx": 0, "fy": 750, "fz": 0, "fs": 300, "mood": 0 }`. Même pose pour `gas` + `wave` (la sinusoïde occupe la gauche), `vacuum`.
- ÉTABLI, le cœur de l'arc (miniature, `heat` 1) : `{ "tx": 0, "ty": 745, "tz": 0, "d": 90, "az": -20, "el": 4, "fov": 32, "shift": 0, "side": 0, "roll": 0, "drift": 0.3 }`.
- ÉTABLI, l'éclaté de la chambre : `{ "tx": 0, "ty": 750, "tz": 0, "d": 420, "az": -25, "el": 6, "fov": 28, "shift": 0, "side": -160, "roll": 0, "drift": 0.3 }` + `{ "see": 1, "parts": 1 }`.
- ÉTABLI, le nuage : `{ "tx": 0, "ty": 1150, "tz": 0, "d": 1700, "az": -28, "el": 6, "fov": 28, "shift": 0, "side": -160, "roll": 0, "drift": 0.3 }` + `{ "cloud": 0.8, "fy": 800, "fs": 600 }`.
- ÉTABLI, 1956 : `{ "tx": 520, "ty": 300, "tz": -260, "d": 1300, "az": -30, "el": 10, "fov": 28, "shift": 0, "side": -120, "roll": 0, "drift": 0.3 }` + `{ "era": 2, "fx": 520, "fy": 300, "fz": -260, "fs": 500 }`.
- POSTE, le pôle : `VIEW.breaker` tel quel. Le sectionneur : `VIEW.lsect` tel quel (`sopen` 0,5 puis 1).
- POSTE, cadenas et pancarte : `{ "tx": 590, "ty": 118, "tz": 660, "d": 190, "az": -26, "el": 12, "fov": 28, "shift": 0, "side": 0, "roll": 0, "drift": 0.3 }` + `{ "sopen": 1, "lock": 1, "sign": 1, "fx": 575, "fy": 120, "fz": 640, "fs": 200 }`.
- POSTE, la pince sur sa borne : `{ "tx": 300, "ty": 20, "tz": 1250, "d": 110, "az": -35, "el": 16, "fov": 28, "shift": 0, "side": 0, "roll": 0, "drift": 0.3 }` + `{ "clamps": 1, "fx": 300, "fy": 20, "fz": 1250, "fs": 200 }` (tirer `clamps` 0 → 1).
- POSTE, les trois pinces posées, de côté : `{ "tx": 300, "ty": 1000, "tz": 0, "d": 1300, "az": -72, "el": 4, "fov": 28, "shift": 0, "side": 0, "roll": 0, "drift": 0.3 }` + `{ "clamps": 2, "earthed": 1, "current": 1, "fs": 900 }`.

## Pas encore au niveau

- **Le pôle entier sur l'établi** (`VIEW.benchPole`) : 9 m de haut pour un établi de 300 — le halo n'éclaire que son pied, le pôle se lit sombre et maigre. Liserés de jupes ajoutés après, non revus. Préférer les plans de la chambre, ou un plan serré sur colonne + chambre.
- La coupe est fixe, tournée vers az −25 : un plan `see` > 0 hors de az −5 … −45 montre l'intérieur de biais.
- Les traînées de SF6 sont fines (1,6 px mini) : lisibles en gros plan, pas en plan large.
- Les câbles de terre sous la lumière signal du poste tirent sur le brun. En `VIEW.work`, la caméra est posée à côté d'`EARTH.a` : les câbles du jeu A barrent le cadre.
- Non revus après correction : la 2ᵉ ligne de la pancarte (réduite), les liserés de jupes au poste, `vacuum` avec `parts`, `wrong` / `shock` (1987).

## À changer ailleurs

1. `world.js`, dans `apply`, la perche est longue de 1 050 cm quelle que soit la distance (sa tête passe à travers le conducteur ou s'arrête avant). Remplacer
   `qPole.setFromUnitVectors(Y, vC.subVectors(vB, vA).normalize());`
   par
   `vC.subVectors(vB, vA); model.pole.fit?.(vC.length()); qPole.setFromUnitVectors(Y, vC.normalize());`
   (la perche est télescopique : le bout du crochet, ou l'œillet de la pince, tombe exactement sur la cible).
2. `world.js · VIEW.work` : `{ ...P, tx: 300, ty: 1000, tz: 0, d: 1300, az: -72, el: 4 }` (ou reculer `EARTH.a`), sinon les câbles du jeu A, au ras de la caméra, barrent l'image.
3. `world.js · VIEW.lockup` : `{ ...P, tx: LSECT.x - LSECT.gap / 2 + 15, ty: 118, tz: PH[0] + 60, d: 190, az: -26, el: 12 }` (la pancarte pend à droite de la boîte : l'ancienne pose la coupait).
