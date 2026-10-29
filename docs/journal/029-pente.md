# 029 · `src/pente.js` — journal

2026-10-22. La montagne, l'avalanche, toi. Lu : consigne commune, `docs/recette-agents.md`, CLAUDE.md (patte, « jamais amateur », « net et fluide »), `docs/029-decors.md`, le journal de l'architecte, `plan.js`, `world.js`, le bouchon, `kit/lib/figure.js`, `atmo.js`, `build3d.js`, `007/src/jet.js` l. 340–520, `026/src/sky.js` (traînées).

## Choix de construction (avant les planches)
- **Trois groupes** : `still` (la montagne immobile, dans le repère de la pente, glissé de −`travel`·100 le long de s : grille, lit découvert, mur de la cassure, cassure, jets, rochers, crête, chalet) ; le repère de la pente lui-même (ce qui bouge avec toi : la plaque et ses fissures, les blocs, la surface de l'écoulement, la coupe, la poudre) ; le monde (toi, tes skis, tes bâtons, le ciel).
- **Le ciel** : un dôme à l'infini (l'idiome du `backdropMat` du 007), horizon un peu plus clair, trois plans de crêtes en traits ink. Il sait où est la montagne (deux demi-espaces : la pente et son versant au-delà de la crête) : il ne dessine rien derrière elle — les crêtes ne se voient pas à travers la pente de verre.
- **La grille** : trois niveaux (1, 5, 25 m), chacun s'efface avant que ses cellules passent sous ~5 px ; étalée le long de s sur la distance parcourue en une image (vitesse mesurée entre les seize appels d'une image).
- **La cassure** : la tête court en `crack^1.5` (à 0,12 elle est à ≈ 1 m de tes skis, au bord du cadre de l'accroche ; elle part ensuite) — un ruban à largeur en pixels (cœur 3 px, halo), deux têtes de lumière, un jet de traînées par mètre, déclenché par le passage de la tête.
- **Les blocs** : 649 en une seule géométrie instanciée, tout dans le vertex shader (culbute ∝ `travel`, tri ∝ `sort`, ils s'écartent de ton corps). Chaque bloc ne bouge qu'en hauteur entre « mélangé » et « trié », et les colonnes des gros et des moyens ne se recouvrent pas : aucun gros ne traverse un moyen.
- **La coupe** : vue de côté seulement ; les blocs du côté de la caméra sont retirés (coupe à x = 0) quand la caméra regarde en travers.

## Fait (fichier complet, `npm run check -- 029` passe : 0 erreur, 65/65 contrastes)
- Ciel à l'infini (crêtes en trois plans, horizon plus clair, masqué derrière la montagne) ; grille de la montagne (1/5/25 m, étalée le long de s à la vitesse mesurée, courbée en vallée plate de s 21 000 à 25 000) ; lit découvert ; mur de la cassure (fondu près de l'objectif : sinon une bande en travers de l'image) ; cassure (ruban à largeur en pixels, deux têtes de lumière, tête en `crack^1.5`) ; jets de traînées (un tous les 70 cm, 7 traînées, orange pâle) ; plaque détachée et fissures Voronoi (qui s'effacent de loin) ; blocs instanciés (9 + 40 + 600, faces sombres, arêtes signal) ; surface de l'écoulement ; coupe ; poudre en traînées ; rochers, crête, chalet et sa ligne veille ; toi (skieur fléchi, bâtons, skis de verre ; renversé, roulé, membres qui ballottent ; recroquevillé enseveli ; main gauche à la poignée en x, y, z avec `pull` — la ligne de l'agent du sac est appliquée).
- Raté puis corrigé : (1) les blocs sortaient orange vif — la sortie du shader est linéaire, 0,3 se lit déjà clair : facteurs divisés par ~4 ; (2) `fwidth` dans un vertex shader (la surface) : `waveSurf` séparé ; (3) skis dressés en travers de la coupe quand tu es renversé : ils s'effacent à 15 % ; (4) grains qui tournaient trop vite par image : culbute ÷ max(taille, 34 cm).

## Planches (30 images lues, budget plein)
- p1 (8) : les 4 candidates, la plaque, emporté, la coupe tri 0/1 · p2 (4) : la coupe à plat (roulis −34) · p3 (8) : l'accroche à crack 0,12/0,18/0,26, (c), coupe 0/1, enseveli, le large · p4 (8) : huit images à 1/30 s pendant la coulée (`ride`, travel +10 cm/image, roll +0,012) — **aucune image ne saute** (blocs, membres, grille) · p5 (2) : l'accroche avec l'en-tête, la vallée.
- Limite de `look` : un état tenu sur les seize instants ⇒ vitesse mesurée nulle ⇒ ni étalement de la grille ni traînées « de vitesse » (la poudre a une longueur minimale ∝ `rush`). Le vrai contrôle du scintillement est le brouillon + `qa`.

## Poses qui cadrent
- **La coupe (tri) — à plat, roulis** : `{ tx: 0, ty: -60, tz: 10, d: 950, az: -90, el: 4, fov: 34, shift: 0, roll: -32 }` — la pente devient horizontale : gros en haut, grains en bande au lit à `sort` 1, mélangés à 0 (lu sur vignette).
- **Enseveli** : `{ tx: 0, ty: -100, tz: -40, d: 600, az: -90, el: 4, fov: 36, shift: 0, roll: -32 }`.
- **La vallée** (`teaser` 1) : `{ tx: 600, ty: -14145 + 61.6·T, tz: 21944 − 78.8·T, d: 15000, az: 178, el: 22, fov: 30, shift: -90 }` (T = `travel` en m tenu dans le plan) — chalet entre y ≈ 915 et 1120, sa ligne jusqu'à ≈ 1290, la zone haute libre.
- (c) `crackSide` tel quel : la tête de la cassure et sa traîne foncent vers l'objectif, jets visibles — la plus vivante des quatre.

## Pas encore au niveau (franchement)
- L'accroche (a) : la cassure est une ligne basse derrière tes talons, les jets restent fins ; la tête (pleine) touche le bas de l'en-tête (≈ 430 px) — baisser `ty` ou `shift` 0.
- Le large : la coulée n'est qu'un voile orange, la cassure en amont peu lisible.
- La coupe ne retire les blocs côté caméra qu'à moins de ~10° du travers (`az` ±80 à ±100) ; entre deux, la coupe balaie.
- Le chalet du 030 se tient sur la grille courbée, pas sur `VALLEY.chalet` exact : `A.chalet` fait foi (22 m au-dessus du plan de la pente).

## À changer ailleurs
- `world.js` → `VIEW.section = { ...P, tx: 0, ty: -60, tz: 10, d: 950, az: -90, el: 4, fov: 34, shift: 0, roll: -32 };`
- `world.js` → `VIEW.buried = { ...P, tx: 0, ty: -100, tz: -40, d: 600, az: -90, el: 4, fov: 36, shift: 0, roll: -32 };`
- `world.js` → `VIEW.valley = { ...P, tx: 600, ty: -14145, tz: 21944, d: 15000, az: 178, el: 22, fov: 30, shift: -90 };` (à `travel` 0 ; décaler comme ci-dessus si `travel` est tenu)
- `POSE0` (si (a) est retenue) : `ty: 50` ou `shift: 0` pour sortir la tête de l'en-tête.

## Reprise (demande de l'orchestrateur : la neige, la cassure, la poudre) — 16 images lues
- **Le manteau** (`GL_MANTLE`, sur la grille de la montagne et sur la plaque, identiques à `travel` 0) : remplissage doux, reflet rasant (Fresnel), éclat du soleil bas, plus lumineux près de toi (`uYou`), éteint au loin, une ondulation lente de la lumière. Additif : pas de sol plein.
- **La marche** : `makeTranche`, la tranche de la plaque (40 cm) en signal, lèvre vive, pied plus sombre, plus chaude près de la tête qui court ; elle descend de 12 × `slab` cm avec la plaque ; la lèvre immobile (encre) se tient `3 + 9 × slab` cm en amont, avec le trait de la cassure. Fissures secondaires bornées à 1,25 px et éteintes à moins de 1,5 m de l'objectif (les zigzags épais venaient de là).
- **Le rideau de poudre** : `makeCurtain`, 2 600 traînées jaillies de la cassure (denses près de toi), lancées vers le haut et en arrière vers l'amont, en éventail ; densité et éclat ∝ `rush` ; montée ∝ `crack` et `travel` (plafonnée à ≈ 1/8 de sa hauteur par image). Poudre autour de toi : 640 traînées, plus claires.
- **Scintillement** : huit images à 1/30 s (cadre visé, crack 0,6→0,74, slab 0,5→0,64, travel 0,5→1,06, rush 0,8), écart moyen entre images voisines (gris, 0–255) : 5,5 · 6,9 · 6,6 · 5,0 · 6,6 · 5,0 · 6,3 ; à deux images d'écart : 7,6 · 5,9 · 7,1 · 7,2 · 7,2 · 6,8. Aucune image qui saute puis revient (mesure par script sur la planche, sans la lire).
- Cadres : le cadre visé `{ tx: 0, ty: 30, tz: 0, d: 320, az: 70, el: -50, fov: 54, shift: 40 }` — skis en diagonale, la tranche en grande diagonale signal, le rideau derrière ; tête vers y ≈ 535, hors de l'en-tête. (a) `{ tx: 0, ty: 50, tz: 10, d: 300, az: 12, el: -34, fov: 52, shift: 20 }` — la marche en bande signal en travers sous tes skis, le rideau dense derrière toi.
- Pas encore au niveau : dans (a) le rideau, vu de face, reste vertical (lu un peu comme de la pluie) ; la tranche à `FIRST` est déjà large dans les deux cadres (la tête court à ≈ 1 m, mais vue de près ça remplit) ; le manteau n'a été vu qu'en contre-plongée.
