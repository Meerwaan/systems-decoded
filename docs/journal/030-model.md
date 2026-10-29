# 030 · Prise de terre — journal de `src/model.js` (la chaîne de terre)

2026-10-22. Consigne : `docs/030-decors.md` § `src/model.js`. Lu : recette des agents, consigne, `plan.js`, `world.js`, bouchon, journal de l'architecte, `build3d.js`, `atmo.js`, idiomes du 008 (`bent`, `tube`, `testJoint`, gaine de lumière, anneaux) et `finish.js`.

## Plan de construction
- Les pièces (bout de carcasse, cosse, fiche, socle, tableau, borne, barrette) sont des objets uniques placés à chaque image d'après `PLACE` ou `BENCH` ; les conducteurs ont une géométrie par implantation, tous sur une même règle `s` (cm depuis la cosse) : PE de la machine → cordon → (pont dans la fiche) → PE du mur / de l'établi → conducteur de terre (pont dans la barrette) → deux bras de boucle partant de la jonction.
- Lumière : une gaine additive par conducteur (l'idiome du 008 : sommets sur le trajet, gonflés à au moins 2,6 px), `run` = une tête + ce qu'elle a passé, `leak` = tirets qui courent derrière un front, plus anneaux.
- Vert-jaune : matière pleine à bandes en biais (helice), `pe` les allume veille, l'autre bande encre.

## Fait (2026-10-22)
- `src/model.js` réécrit en entier, même API : `buildModel()` → `{ root, parts, A, update(P, time, px) }`, `parts` = `stub, cosse, pe, plug, socket, tableau, borne, barrette, terre, loop` (chacune ses matières), ancres `A` comme demandé. `update` n'alloue rien (tableaux et fermetures précalculés) ; aléatoire : aucun.
- Pièces : bout de carcasse émaillé (coin replié, bords cassés en zigzag de vue interrompue, deux trous), plot de masse (patte, bossage, rondelle éventail, cosse à œillet sertie, vis cruciforme), fil de phase qui monte au coin et y touche la tôle (cuivre nu), neutre coupé ; cordon sombre ; fiche 2P+T ronde (deux broches, alvéole de terre cerclée de métal en haut) ; socle blanc à puits, deux trous sombres, broche de terre en haut (`pin`) ; différentiel deux modules (profil modulaire, joint entre modules, manette noire sur pivot, bouton test, fenêtre qui s'allume, rail DIN, phase et neutre en haut et en bas) ; borne principale (barre de cuivre, cinq vis, pieds isolants) ; barrette (008, réduite : socle, deux blocs, barre amovible sur goujons) ; conducteur de terre en cuivre nu ; boucle à fond de fouille (en place : deux bras depuis la jonction, l'un le long du mur du fond jusqu'à x ≈ 740, l'autre jusqu'à l'angle puis le long du mur de gauche jusqu'à z ≈ 840 ; sur l'établi : un rectangle arrondi 24 × 8 cm autour d'un bout de semelle de verre) ; collier de jonction.
- Lumière sur une règle `s` (cm depuis la cosse) : gaine additive (min 2,6 px) ; `run` = tête + traînée ; `leak` = front + tirets qui descendent (en place : période 24 cm, 88 cm/s = 2,9 cm par image = 1/8 de période ; établi : 6 cm, 21 cm/s = 1/8,6) ; anneaux : établi = cercles sur la grille autour de la boucle ; en place = anneaux fins dans des plans en travers de la boucle, à sept stations le long des deux bras, coupés au-dessus de la semelle.
- Les tirets fondent en trait plein si la caméra balaie vite (mesuré entre deux instants consécutifs dans `onBeforeRender`, déterministe à un saut de temps).

## Planches (30 images lues sur 30)
1. Établi, 4 : la colonne se lit (carcasse, fil rayé, fiche-socle, différentiel et barre, barrette, boucle) ; éclaté à 0,5 ; `run` 0,6 ; `chain` 0 = fantômes, la tête s'arrête à la fiche. Le bout de carcasse ressemblait à une boîte électrique → bords zigzag, retours de 2,4 cm.
2. Gros plans, 8 : le grain `finish` rayait plastique et émail → `finish` coupé sur blanc / émail / sombre ; `ddr` verdissait phase et neutre → seul le corps blanc s'allume ; la fiche ne se juge pas de trois quarts (la fiche cache tout) ; anneaux de l'établi trop grands → rayon 17.
3. En place, 8 : `chain` 0 / 0,5 / 1 sur le mur : la chaîne pousse bien de la prise vers le tableau puis la terre ; **sous le sol, raté** : coquilles coaxiales = grands voiles verts → remplacées par des anneaux de station ; la cosse dans la carcasse (VIEW.system) ; la coupe entière allumée (`run` 1).
4. Avec en-tête, 8 : sous le sol, anneaux fins, deux images à 1/30 s : les tirets ne sautent pas ; fiche de profil (`az` −72) : les broches sortent, mais la broche de terre ne se voit pas ; cosse de près ; manette tombée lisible ; éclaté ; couverture.
5. 2 : socle, fiche tirée, de trois quarts plongeant (`el` 30) : broche / pas de broche se distinguent, mais discrètement → broche grossie (r 0,36) sur un pied sombre, **non revue** ; le cordon passait devant le socle → contourne maintenant par la droite, **non revu**.

## Poses qui cadrent (prêtes à coller dans `world.js` → `VIEW`)
- `whole: { ...P, tx: 0, ty: 36, tz: 0, d: 250, az: -30, el: 12, shift: 0 }` (vue)
- `exploded: { ...P, tx: 0, ty: 37.5, tz: 0, d: 260, az: -30, el: 10, shift: -20 }` (calculée depuis la vue `d` 245 / `shift` −60, dont le bas touchait 1 600)
- `bStub: { ...P, ...CLOSE, tx: -3, ty: 66, tz: 0, d: 64, az: -30, el: 12, shift: -40 }` (calculée : à `shift` 40 la lumière du défaut passait sous l'en-tête)
- `bPlug: { ...P, ...CLOSE, tx: 0, ty: 46, tz: 3, d: 72, az: -24, el: 30, shift: 0 }` — la broche, **fiche tirée** (`plug` ≤ 0,3) ; de profil pour « la broche entre dans l'alvéole » : `{ ...P, ...CLOSE, tx: 0, ty: 47, tz: 3, d: 70, az: -72, el: 8, shift: 60 }`
- `bTab: { ...P, ...CLOSE, tx: -3, ty: 30, tz: 1, d: 80, az: -28, el: 10, shift: 40 }`
- `bEarth`, `under`, `wall`, `section`, `system` : ceux de `VIEW` tiennent (vus).
- Couverture (`episode.json` → `cover.cam`) : `{ "tx": 0, "ty": 37, "tz": 0, "d": 300, "az": -30, "el": 28, "fov": 28, "shift": -470, "side": 0, "roll": 0 }` avec éclaté, `run` 1, `pe` 1 (calculée ; à `d` 330 / `shift` −520 la colonne était petite et descendait à 1 810).

## Pas au niveau, franchement
- La broche du socle reste petite : elle ne se lit que fiche tirée et vue d'au-dessus ; fiche enfoncée, la fiche la cache (normal, mais les actes doivent tirer la fiche pour « Sans broche »).
- Le nouveau tracé du cordon sur l'établi et la broche grossie n'ont pas été revus (budget d'images épuisé).
- Le bout de carcasse sous `live` 1 tire vers le saumon (émissif 0,035 + arêtes signal) : à juger sur le raccord.
- En place, la cosse est petite dans la carcasse de verre (`VIEW.system`, `d` 120) : c'est le raccord qui la porte.
- Non regardés : la tête `run` en place (arrêt à la fiche, `chain` 0), l'éclaté entre 0,2 et 0,9 en mouvement, la fonte des tirets en balayage.

## À changer ailleurs
- `world.js` → `VIEW` : les poses ci-dessus (`whole`, `exploded`, `bStub`, `bPlug`, `bTab`).
- `episode.json` → `cover.cam` : la ligne ci-dessus.
- `plan.js` (pour mémoire, rien d'obligatoire) : la fiche enfoncée a sa face au fond du puits, z = 2,3 (et non 4,5 / 3,5) ; la broche est à +1,0 au-dessus du centre (et non +2,6) — `A.plug`, `A.pin` suivent la géométrie ; la boucle de l'établi est un rectangle arrondi passant par `BENCH.join`, pas un cercle de rayon 11.
- `docs/030-actes-maj.md` : `plug` 0 tire la fiche de 6 cm ; la broche se montre fiche tirée, `el` ≥ 25 ; `ddr` allume la fenêtre et le corps du différentiel, `trip` fait basculer la manette (0,42 → 2,72 rad) ; sur l'établi `leak` ne s'allume que si `chain` > 0,5.
