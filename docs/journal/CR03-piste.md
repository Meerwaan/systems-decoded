# CR03 · piste.js — journal du décor

## Lu
recette-agents, regles-image, CR03-decors (haut + section piste), reconstitution.md, plan.js, world.js, bouchon, API du kit (reconstitution, build3d, atmo.makeSurface/makePool), glowTexture/spriteMat de CR02 bop.js.

## Ce qui est construit (API du bouchon gardée : `buildPiste()` → `{ group, A, haloR: 2.6, update(S, time, px) }`)
- **Piste 26R** : bitume brun-noir mat (shader : rapiéçages, granulat, gomme déposée dans les deux zones de toucher), accotements, voie de circulation parallèle côté −z et ses bretelles ; peinture complète (barre de seuil, 12 bandes « piano », « 26R » et « 08L » en police à barres, zones de toucher 3-3-2-2-1, points de visée, axe en tirets, bords) ; feux de bord tous les 60 m + rangée en travers de chaque bout (supports d'argile + cœurs ambre faibles, taille monde de près / 2,4 px mini de loin).
- **Autour** : aérodrome en herbe tondue (rangs le long de la piste), damier de champs (6 tons, sillons au shader fondus par `fwidth`), haies et bosquets sombres, N17 et ses tirets, Gonesse (≈ 600 maisons à pignon + quelques barres, une géométrie, rues tournées de 11°, couloir de la trajectoire et abords de l'hôtel dégagés), **l'hôtel** (long, bas, toit le plus clair du cadre, bandes de fenêtres sombres, parking), **Le Bourget** (piste à 35°, peinture, hangars à voûte, feux de bord + rampe d'approche vers Roissy, voile ambre).
- **Lamelle** : 2,2 de long, **dessinée 0,24 × 0,11** (plan.js dit 0,16 × 0,28 : plus épaisse que large, elle lisait comme une poutre), bord déchiré, 8 trous de rivets, légère courbure, le bout déchiré qui se relève (ombre) ; `alarm({ noOk })` : jamais verte.
- **Règle** : ruban d'argile claire, 23 graduations sans chiffre (majeures tous les 10 cm), un rouleau qui avance en tournant et rapetisse, finit au bout déchiré.
- **V1** : bande ambre peinte (6 de large) qui se trace du bord +z au bord −z + trait écran 13 px qui ne vit que de loin (opacité selon la distance caméra, 700 → 2 600).
- **Barre de freinage** : bande additive (remplissage, bords ≥ 2,5 px, front lumineux), du train principal vers l'avant, longueur `run × STOP.k × stop` ; verte → rouge **par le noir** quand son bout passe `RUNWAY.x1` (fondu sur ±60 unités).
- **Preuve** : panneau 1,5 bombé (0,26), lisse, 20 trous ; morceau de pneu cintré (rayon 3) et trois rainures, posés aux points `FOUND`.
- **Suie** : bande presque noire, bords déchiquetés, par plaques, de la lamelle jusqu'à l'envol (`RUN.liftoff`), z 5 → 51, révélée vers l'ouest.
- **Trajectoire** : trait ambre 9 px + halo 24 px, de la lamelle (`RUN.strip`) jusqu'à l'hôtel sur `trajZ`, tête de lumière qui avance.
- **Inspection** : camionnette blanche (cabine, caisse, vitres sombres, roues, rampe + gyrophare ambre qui respire à 0,8 Hz) ; derrière elle la piste se lave de vert (bords et front) et ses feux de bord passent au vert.

## État lu
`run` (barre) · `stop` (barre : pousse et apparaît) · `v1` (ligne tracée) · `ruler` (règle) · `found` (panneau + morceau) · `soot` (suie vers l'ouest) · `traj` (trajectoire + tête) · `bourget` (feux + voile, jusqu'à 1,25 pour une pulsation) · `inspect` (camionnette, lavis vert, feux verts) · `culprit` 1 + `fault` (lamelle rouge). `ok` et `depuis` : rien chez moi.

## Le sol et la grille (choix demandé)
`makeSurface` pose sa base à −0,0009·fs, sa grille à +0,00045·fs, sa flaque ambre à +0,0011·fs, son capteur d'ombre à +0,0016·fs (et ce capteur ÉCRIT la profondeur, `renderOrder` 1). Mes champs sont à y 0, le bitume à 0,03, la peinture à 0,08 (polygonOffset), la suie à 0,1, les bandes à 0,12. Donc la grille ambre se voit **partout près du sujet** (champs, et bitume dès fs ≳ 70) et s'efface au loin. Mes plaques ne reçoivent pas d'ombre (le capteur du kit les porte). **Tout ce qui est transparent chez moi a `renderOrder` ≤ 0,5** : sinon le capteur, plus haut que le sol, le cache (premier jet : barre, V1 et feux invisibles). La suie est à 0,5 : après la flaque additive, avant le capteur.

## Ce qui a raté en route
- Quad unité tourné vers le bas → la suie (pas DoubleSide) n'existait pas. Corrigé (index 0,1,2 / 0,2,3).
- Champs trop sombres : sous la flaque ambre, piste et champs se confondaient. Champs remontés à 0x51–0x82, bitume 0x16 : la piste se lit en bande sombre.
- Maisons avec arêtes : vues de haut, une nuée de traits blancs. Arêtes retirées, densité baissée (30 % d'îlots vides).

## Poses qui cadrent sur le vrai décor (à coller ; `P` = { side 0, roll 0, drift 0, dof 0 })
- **first** (lamelle au premier plan, 28 derrière elle, 2,6 de haut) : `{ tx: -10269.2, ty: 22.9, tz: 0, d: 1373.45, az: 89.27, el: -0.847, fov: 24, shift: 240 }` — l'avion à y ≈ 700, la lamelle à y ≈ 1 230 (au-dessus des sous-titres seulement si l'acte la garde ≤ 1 240 ; sinon `shift` 200).
- **runway** (la piste entière, du seuil au bout) : caméra (6000, 9000, 1200) → cible (−5943, 0, 0) : `{ tx: -5943, ty: 0, tz: 0, d: 15002.5, az: 84.26, el: 36.86, fov: 38 }`, **fs ≈ 6 000**. La V1 et la barre se lisent à 270 px. (`VIEW.runway` actuel coupe le bas : la piste n'entre qu'à partir de x ≈ −5 650.)
- **v1** : comme `VIEW.v1` mais `el: 8` (à −2 la caméra est à 2 du sol : la ligne n'est qu'un fil).
- **lamelle** : `VIEW.lamelle` tel quel, fs ≈ 20 — lamelle et règle lisibles, rouge net sur son halo.
- **carte** : `{ tx: -27000, ty: 0, tz: 2500, d: 26000, az: 78, el: 42, fov: 34 }` avec **fs ≈ 12 000** (à 3 000 la lumière ne couvre pas la carte : tout est noir sauf la trajectoire) : damier, Gonesse en bloc sombre, la trajectoire jusqu'à l'hôtel, Le Bourget en haut à gauche.
- **vide** : caméra (−8890, 3,4, 19) → (−10200, 9, 26) : `{ tx: -10200, ty: 9, tz: 26, d: 1310.03, az: 90.31, el: -0.245, fov: 24, shift: 240 }`, fs ≈ 60 (à 160 la flaque ambre noie le premier plan). (`VIEW.vide` actuel : caméra à z 151, la lamelle hors cadre.)
- **preuve** : sur le panneau `{ tx: FOUND.panel[0], ty: 0.3, tz: 30, d: 10, az: -58, el: 30, fov: 30, shift: 40, dof: 6 }`, fs 40. `VIEW.preuve` (d 70 entre panneau et morceau) ne montre aucun des deux : ils sont à 100 l'un de l'autre.
- **inspection** : `VIEW.inspection` lit le lavis vert ; de près, la camionnette : `{ tx: <x camionnette>, ty: 6, tz: -60, d: 140, az: -35, el: 14 }`, fs 80.

## Pas encore au niveau
- Le premier plan au ras du sol est mangé par la flaque ambre du monde (fs 160 → rayon 240) : la suie de `vide` et le bitume autour de la lamelle se lisent mal. Réglage de l'acte (fs plus petit) ou de `world.js`, pas du décor.
- Le Bourget « allumé » ne s'est pas vérifié de près (une pose ratée, budget d'images dépassé) ; de loin (carte fs 12 000) il se lit en trait lumineux.
- L'hôtel ne se repère d'en haut que par la tête de la trajectoire qui s'y arrête (9 × 2 px à 270 px).
- Budget d'images dépassé : 44 vignettes lues pour 30 (planches de 8 lues trop tôt).

## À changer ailleurs
- `world.js`, `VIEW.runway` : `runway: pose([-5943, 0, 0], { d: 15002.5, az: 84.26, el: 36.86, fov: 38, shift: 0 }),` et l'acte 1 pose `fs` ≈ 6 000 sur ce plan.
- `world.js`, `VIEW.v1` : `el: 8` au lieu de `el: -2`.
- `world.js`, `VIEW.carte` : `carte: pose([-27000, 0, 2500], { d: 26000, az: 78, el: 42, fov: 34, shift: 0 }),` avec `fs` ≈ 12 000.
- `world.js`, `VIEW.vide` : `vide: pose([-10200, 9, 26], { d: 1310.03, az: 90.31, el: -0.245, fov: 24, shift: 240 }),` avec `fs` ≈ 60.
- `world.js`, `VIEW.preuve` : `preuve: pose([FOUND.panel[0], 0.3, FOUND.panel[2]], { d: 10, az: -58, el: 30, fov: 30, shift: 40, ...CLOSE }),`.
- `plan.js`, `STRIP` (facultatif, pour que concorde.js pose le pneu sur la vraie épaisseur) : `w: 0.24, thick: 0.11`.

## Retouche du 13/11 (agent `retoucheur`, 11 images lues ; planches `.cache/planches/CR03/piste-retouche/`)
- **81 s, le long bâton noir à boule** → c'était une **haie** (boîte 6 × 7-11 × la longueur d'un champ, `hedgeMat` 0x2c2823) et son arbre au bout, vus de la hauteur de l'avion : pas une ombre (`fs` le changeait parce qu'il éclaire la haie). Plus aucune haie ni aucun arbre sous le vol t7 (`underFlight` : x −29 600 → −23 800, z −1 000 → 2 600) ; les tirages `R()` sont gardés, le damier ne bouge pas. Vérifié à 80,967 / 81 / 81,033 : le bâton a disparu, il reste la couture claire entre deux champs, comme les autres ; trois images en continuité.
- **92–96 s, la suie illisible** → bord net et déchiqueté (seuil `fwidth`, plus de fondu), cœur presque opaque (0,82 à 1 au lieu de 0,5 à 1), moins effacée au loin (−40 % au lieu de −75 %), largeur 46 → 72 (elle mange l'axe et les barres de toucher : c'est par la peinture qu'elle avale qu'elle se lit hors du halo), `polygonOffset` −4 / −16 pour passer devant la peinture en vue rasante. Vérifié à 93 et 95,5 : à `el` 2 une traînée noire nette jusqu'à l'horizon, bords déchirés sur les barres blanches ; **à `VIEW.vide` tel quel (caméra à 3,4 de haut) elle ne se lit toujours pas** : à cette hauteur la bande couvre toute la largeur du cadre jusqu'à ≈ 300 devant, aucun bord n'entre — c'est la pose, plus le décor.

## À changer ailleurs (retouche du 13/11)
- `world.js`, `VIEW.vide` : `vide: pose([-10200, 9, 26], { d: 1310.03, az: 90.31, el: 2, fov: 24, shift: 240 }), // fs ≈ 60` — la caméra monte à ≈ 55 au-dessus de la lamelle, qui sort du cadre jusqu'à ce que le `path` d'acte2c redescende sur elle (`t.top`, d 26) : la descente de la traînée vers la lamelle devient le mouvement du plan.
