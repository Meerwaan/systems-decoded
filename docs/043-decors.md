# 043 · Le faisceau du CERN — les décors

Deux fichiers neufs, un par lieu, en parallèle : rien dans le catalogue pour le tunnel du LHC ni la ligne d'extraction. Le contrat : `episodes/043-faisceau-cern/src/plan.js` (toutes les cotes, `ringAt(s)`, `lineAt(u)`), `world.js` (`FIRST`, `VIEW`, `apply`). Les bouchons posés par l'architecte ont l'API définitive : on remplace le dedans, jamais la signature ni les nombres lus. **30 images lues au plus** par agent (ceux du 042 en ont lu 36 à 44 : on s'arrête à 30).

Commun aux deux :
- **Une maquette à l'échelle du sujet** (`plan.js`, tête) : l'anneau fait 283 m de tour (R 45 m), les paquets sont 9,6 cm l'un de l'autre, la ligne 20 m ; le bloc, les aimants d'éjection et de dilution gardent leurs proportions vraies. Aucune cote, aucune longueur affichée nulle part.
- **Tout dans un seul monde**, sans établi : le point 6 est sur l'anneau, un quart de tour EN AMONT du grain ; la ligne part du point 6 dans le sens du faisceau (+z) et finit sur le bloc, à ≈ 47 m du grain et dans le champ du premier plan (au fond, à gauche). L'autopsie se fait sur place (`BENCHED` = le système seul : tunnel, caverne et train éteints, le bloc sur son halo).
- Convention de caméra vérifiée sur planche : caméra = cible + d·(sin az·cos el, sin el, cos az·cos el) ; droite de l'image = (cos az, 0, −sin az). Au grain, az −90 regarde le train arriver (il va vers −x) ; au point 6 et au bloc, la ligne file vers +z : az −120 à −165 voit les aimants et la face d'entrée de trois quarts amont.
- Les planches des bouchons (`.cache/planches/043/architecte/p1–p3.jpg`) : **le verre du tube et des aimants, vu de l'intérieur, lave l'image en blanc** dès que la caméra est près du tube — chaque coque s'efface quand l'œil (`eye`, passé à `update`) entre dedans ou la frôle ; **les capteurs** (6 tous les 47 cm) font un ruban vert continu en plan rapproché ; **le halo** du bloc est trop grand et trop fort. Trois choses à régler d'abord.
- Trois couleurs : le train est de la lumière **encre** (blanche, chaude), ni système ni menace ; `signal` pour le grain, sa gerbe, la bobine qui chauffe, la perte au-dessus du seuil, tout fantôme ; `veille` pour les capteurs, l'alerte, les aimants armés et allumés, la route de sortie, le halo. La chaleur du graphite est du `signal` tenu bas (orange) : **jamais blanc**.
- Toute lumière se dose ≤ 3 ; une lumière a un endroit (un cœur, une traîne), jamais un voile ; ce qui file vite se dessine en traînées.

## anneau.js

**Le lieu : le tunnel de l'anneau au grain, l'anneau entier, et le train.** Autour aux rayons X ; le train plein de lumière.

À construire (cotes : `plan.js`) :
- **Le tube** (`PIPE.r` 4,5 cm), verre, sur tout l'anneau ; au loin, l'anneau devient **une ligne de lumière** à épaisseur en pixels (un trait ≥ 1,8 px) où le train se lit blanc et le trou noir.
- **Les 45 aimants de l'arc** (`MAGNET`) : cryostat r 46, culasse r 28, **bobine en deux demi-coquilles** r 5,5–10 autour du tube, tout en verre et traits fins ; brides et interconnexions en traits. **Ils suivent la courbe** (flèche de 9,7 cm sur 590 cm : un cylindre droit laisserait le tube sortir de sa bobine). Pas d'aimant de l'arc dans `INSERTION` (le point 6 : le tube y passe nu, `sortie.js` l'habille). La seconde ouverture (l'autre faisceau, `MAGNET.twin` vers l'intérieur) en traits fins, vide, jamais pleine ni allumée. Détaillés à moins de ≈ 30 m de l'œil, simplifiés au-delà.
- **La bobine frappée** (aimant 0, juste en aval du grain, x ≈ −19 … −609) : avec `coil`, elle rougit **à travers son verre** (signal, de l'impact `A.coilHit` vers les bords), quelques braises lentes (`makeEmbers`, `docs/catalogue.md` → recopiés) — c'est elle que la gerbe « abîme ».
- **Le tunnel** (`TUNNEL`) : section r 190, son axe 60 cm vers l'intérieur et 45 cm plus haut que le faisceau, sol en **grille** à y −105 (jamais un sol plein), supports des aimants en traits.
- **Le train** : 2 496 paquets en 52 wagons de 48, 7 places vides entre wagons, et le trou de 3 µs (`BEAM`) — capsules `len` 5, r 1,1, cœur blanc ; position de chaque paquet par `gap` et `dump` (formule ci-dessous). Il doit se lire **comme un train qui fonce** : à 900 cm/s (l'accroche) et à 6 000 cm/s (l'extraction), les wagons avancent (pas d'effet de roue de chariot : les 16 instants de l'obturateur les étirent en traînées), le trou passe noir. Un paquet qui passe à moins de ≈ 20 cm de l'objectif s'efface (pas de flash plein cadre).
- **Le grain** (`GRAIN`) : une perle signal r 0,6 avec un dégradé lumineux (pas une sphère unie), qui tombe du haut du tube sur l'axe (`grain` 0,1 → 1).
- **La gerbe** (`spray`) : des protons signal arrachés par le grain, **en traînées**, qui partent en aval et frappent la paroi du tube et la bobine 0 (x −20 … −300) ; périodique dans le temps (vivante dès l'image 1), intensité `spray`.
- **Le paquet héros** (`hero`) : UN paquet en grand à `A.hero` (s ≈ 70), fait de quelques centaines de grains de lumière ; **son vingtième** (`slice`) : une tranche à sa tête qui se détache et frappe la bobine à `A.coilHit` (un point de lumière au contact, ≤ 3).
- **Les 3 600 capteurs de pertes** (`BLM`) : 600 groupes de 6 petits cylindres sur le flanc haut extérieur des cryostats (r ≈ 47). De près, **seul le groupe du grain se lit** (`GRAIN_GROUP`, les 6 juste en aval du grain) ; les autres s'effacent avec la distance à l'œil (pas de ruban vert) ; de loin, l'anneau pointillé. `sensors` : 0 éteints · 0,3 veille faible · 1 allumés, **une vague** qui part du point 6 et fait le tour dans les deux sens.
- **La barre de perte** (`loss`) sur le capteur du grain (`A.monitor`) : une jauge verticale veille qui monte ; le trait du seuil à 0,7 (encre) **passe au signal** quand la barre le crève, le capteur fait UNE impulsion signal (pas de clignotement).
- **L'alerte** (`alert` 0 → 1) : une tête de lumière veille et sa traîne, le long du flanc des cryostats (le câble), du capteur du grain jusqu'au point 6 en amont (7 069 cm), qui arrive sur `A.alertEnd`.
- **Le fantôme du repos** (`sweep`) : sur les 600 cm en aval des aimants d'éjection, les paquets sont balayés contre la paroi du tube, teintés signal, translucides ; **balayés, pas détruits**.
- **Les 37 grains du commentaire** (`grains` 0 → 37) : en rang au-dessus du tube vide, en amont du grain (s −30 − 12 i), chacun s'allume à son tour ; au-dessus de chacun, si ça se lit à 270 px, un petit anneau (trait encre) qui se vide ; sinon les grains seuls.
- **Le teaser du 044** à `TEASER.at`, sur son sol à lui (grille) : un gilet de verre (aux rayons X, bretelles, contour des plaques) sous scellés (un ruban en traits, sans texte, sans insigne), sur sa poitrine **une pierre pleine qui devient une balle aplatie** (`teaser` 0,4 → 1), un halo veille dessous.

API (bouchon en place, signature définitive) :
```js
export function buildAnneau() → { group, A, update(p, time, px, eye) }
// p = { shell, ring, beam, gap, dump, grain, spray, coil, hero, slice, sensors, loss, alert, sweep, grains, teaser }
// A = { grain, coilHit, hero, monitor, alertEnd, tally, teaser }   (cm, monde)
```
- `shell` le tunnel et les aimants de l'arc · `ring` l'anneau au loin (ligne, aimants et capteurs lointains) · `beam` la lumière du train.
- **Le train** : centre du trou à l'abscisse `S6 + gap + dump·(C − BEAM.gap)` ; le paquet k (k = 0 juste derrière le trou) à `centre − BEAM.gap/2 − (place(k) + 0,5)·BEAM.slot` ; caché si `k < dump·BEAM.n` (parti dans la ligne). Le monde ne déclenche jamais l'éjection hors de `gap = +BEAM.gap/2` (le trou tout juste passé) : c'est la règle des actes.
- Ne lit rien de `sortie.js`. Ne crée rien dans `update` (seize appels par image).

Réutilise : `@kit/build3d.js` (`glass` + `asShell`, `glow`, `fatLine`, `setGlow`), `@kit/atmo.js` (`makeSurface` pour les grilles, `makeMotes` en traînées pour la gerbe si utile), `makeEmbers` (recopié, `docs/catalogue.md`). L'idiome d'un décor aux rayons X : `006/src/hall.js`.

**Les images à réussir** (liste fermée ; poses de `world.js` → `VIEW`, à recaler et à rendre dans le journal) :
1. `hook` (`POSE0`) à 0,02 et 0,5 s, `FIRST` : le train blanc qui file vers l'objectif au ras du tube, le grain qui tombe devant lui, la gerbe qui pleut vers nous, au fond à gauche le bloc sur son halo (de `sortie.js`). Le sujet (le train) ≥ 40 % de la largeur. Et les trois autres candidates : `side`, `under`, `inpipe`.
2. `train` à 1,8 s : le train plein cadre, les wagons lisibles en mouvement.
3. `coil` à 11,5 s (`spray` 1, `coil` 0,7) : la gerbe frappe la bobine qui rougit.
4. `hero` à 13 s et 14,3 s (`hero` 1, `slice` 0,4 puis 1) : un paquet en grand, son vingtième qui frappe.
5. `trainLong` à 15,8 s : le train jusqu'à l'horizon de l'anneau ; `ringArc` à 17,2 s : le quart d'anneau du grain au point 6, la ligne de lumière.
6. `sensors` à 23 s (`sensors` 0,3 → 1) : l'anneau ponctué de milliers de capteurs, la vague.
7. `gapFind` à 42 s (`gap` −300) : le trou noir devant les aimants d'éjection ; même pose à 47,5 s (`sweep` 1) : le fantôme.
8. `monitor` à 50 s (`loss` 0,6 puis 0,85) : la barre crève le seuil.
9. `ringPulse` à 51,5 s (`alert` 0,5) : l'impulsion verte qui file vers le point 6.
10. `tally` à 74 s (`beam` 0, `grains` 37) ; `like` à 80 s (le train immobile, le grain devant) ; `teaser` à 83 et 87 s (`teaser` 0,2 puis 1).

Propre au dossier : le grain et les paquets sont **énormes** pour l'œil (un vrai grain fait quelques microns, un vrai paquet un millimètre de large) — c'est la maquette, `sources` le dit. Le train n'est **jamais** rouge sauf dans le fantôme : c'est l'énergie qu'on protège, pas la menace.

## sortie.js

**Le système, plein : le point 6, la sortie de secours.** Les aimants et le bloc pleins ; la ligne, son tunnel, la caverne et la coque du bloc aux rayons X.

À construire (cotes : `plan.js`) :
- **Les 15 aimants d'éjection** (`KICKERS`, MKD) autour du tube de l'anneau, centrés sur `S6`, un tous les 30 cm : des cuves à vide pleines (r 13, 26 cm), brides, piquages, traversée haute tension sur le dessus — trois valeurs de gris, arêtes fines, `metal` ≤ 0,5. `arm` : une respiration veille lente sur leurs brides (pas de clignotement) ; `kick` : ils s'allument **en cascade** le long de la rangée (un éclair veille par cuve qui se pose clair) ; **pendant `sweep` > 0, leur lumière est signal** (le fantôme du repos).
- **Les 15 septa** (`SEPTA`, MSD) le long de la ligne (u 420 → 960) : blocs d'acier (22 × 26 × 32), la ligne passe dans leur fente, le tube de l'anneau à côté (l'écart grandit de ≈ 20 à 100 cm : la branche se lit). `septa` allume leur fente. **Jamais comptés à l'image** (la voix compte les aimants d'éjection).
- **La ligne** : son tube de verre qui s'élargit (r 6 → 22) de la branche (`BRANCH.u` 960) au bloc, son tunnel r 130 (rayons X, sol en grille y −110, supports en traits).
- **Les 10 aimants de dilution** (`DILUTION`, 4 horizontaux puis 6 verticaux) : pleins, leur entrefer tourné à l'horizontale ou à la verticale (on voit lesquels balaient dans quel sens) ; `dil` les allume tour à tour, en cycle (la tache tourne).
- **Le bloc** (`BLOCK`, taille vraie : 852 × Ø 72) : **la coque d'acier aux rayons X** (verre, brides, fonds), **le noyau de graphite plein**, en tronçons de gris différents (le noyau réel a des densités étagées) ; refroidi à l'air : **aucun tuyau d'eau**. Sa face d'entrée lisible derrière une bride.
- **La caverne** (`CAVERN`) et ses blocs de blindage (fer, béton) en traits et verre ; sol en grille ; **le halo** veille sous le bloc (`pool`), dosé comme la flaque d'un établi (planche des bouchons : trop grand, trop fort).
- **Le « e »** sur la face (`ETRACE`) : une trace de chaleur d'environ 1,2 m de long **lovée dans la face de 70 cm** (boucle r ≈ 15 + barre ≈ 30 : jamais plus large que la face), dessinée par la tache du faisceau (une tête blanche ≤ 3 qui court), la trace derrière elle refroidit à l'orange (`signal` bas). Progression = `max(paint, dump)`. `heat` : la trace et le graphite autour, 0 froid · 0,5 orange · 1 orange vif — **jamais blanc** (contre-vérification).
- **Le flot extrait** (`dump`, 0 < `dump` < 1) : le train qui quitte l'anneau au point 6, passe les septa, descend la ligne en s'élargissant (wagons blancs étirés en traînées) et arrive sur la tête du « e ». Il prolonge le train d'`anneau.js` au raccord (les paquets cachés là-bas réapparaissent ici).
- **La route** (`route` 0 → 1) : une tête de lumière veille et sa traîne, du point 6 le long de la ligne jusqu'à la face ; achevée, elle reste un trait veille fin.
- **Le fantôme du principe** : `point` — tout le faisceau sur UN point de la face, un fin faisceau signal translucide et une tache qui chauffe ; `crack` — la plaque **s'abîme** : des fissures partent de la tache sur la face (traits signal, puis sombres) ; **jamais un trou percé** (contre-vérification).
- **L'éclaté** (`explode`) : « un système tout en longueur s'ouvre en rangée, en travers de la caméra » — les aimants d'éjection, les septa et les dilueurs **montent** en rangée (40 à 60 cm, en cascade le long de la ligne, `makePart` + `delay`), la coque du bloc glisse vers l'aval (≈ 260 cm) et découvre le noyau, les blocs de blindage s'écartent.
- `lit*` : la pièce que la voix nomme, en veille faible.

API (bouchon en place, signature définitive) :
```js
export function buildSortie() → { group, A, update(p, time, px, eye) }
// p = { cavern, explode, litKick, litSepta, litLine, litDil, litBlock, arm, kick, septa, dil, route, paint, heat,
//       point, crack, pool, dump, beam, sweep }
// A = { kick, septa, branch, dilution, face, block, spot, halo }   (cm, monde)
```
- `dump` et `beam` sont aussi lus par `anneau.js` : le flot apparaît ici quand les paquets disparaissent là-bas.
- Ne lit rien d'`anneau.js` ; le tube de l'anneau au point 6 est à lui (nu dans `INSERTION`).

Réutilise : `@kit/build3d.js` (`solid`, `box`, `cyl`, `lathe`, `makePart`, `explode`, `setPartOpacity`, `edgesOf`, `glass` + `asShell`), `@kit/atmo.js` (`makePool` pour le halo, `makeSurface`), `makeBall` (recopié : la tache, `docs/catalogue.md`). L'idiome d'un système plein : `007/src/model.js`.

**Les images à réussir** (liste fermée ; poses de `world.js` → `VIEW`) :
1. `hook` à 0,02 s, vu d'`anneau.js` : le bloc sur son halo, petit mais lisible, au fond à gauche (≈ 47 m).
2. `blockFar` à 5,8 s (`route` 0,6 → 1) : le bloc sur son halo, la route verte qui arrive dans sa face.
3. `exitLit` à 18,6 s (`route` 1, `arm` 1, `litKick` 1) : l'embranchement, seul éclairé en vert.
4. `dive` à 20,2 s puis `exploded` à 21,5 s (`explode` 0 → 1) : l'éclaté le long de la ligne.
5. `kickers` à 25 s (`litKick` 1, `arm` 1, `explode` 1) : les 15 cuves en rangée, de trois quarts.
6. `lineLong` à 27 s (`route` 1, `litLine` 1) : la ligne qui file loin, le bloc au bout.
7. `blockHero` à 28,9 s (`litBlock` 1, `explode` 1) : la coque aux rayons X, le noyau plein, sur son halo.
8. `faceClose` à 32 s puis 33,8 s (`point` 1, `crack` 0 → 1) : le point unique, la plaque qui se fissure.
9. `dilution` à 35 s (`dil` 1) : les dix aimants qui tournent.
10. `faceClose` à 37 s et 39,5 s (`paint` 0,6 puis 1, `heat` 0,6 puis 0,45) : le « e » qui se dessine, puis s'étale.
11. `gapFind` à 44,5 s (`arm` 0,8) puis 47 s (`kick` 1, `sweep` 1 : signal).
12. `fire` à 55,5 s (`kick` 0 → 1, `septa` 1) ; `lineRush` à 56,8 s (`dump` 0,25) ; `faceClose` à 58,5 s (`dump` 0,6, `heat` 0,7).
13. `verdict` à 66 s (`paint` 1, `heat` 0,5) ; `etrace` à 69,8 s.

Propre au dossier : la masse (6 t) et la longueur ne s'écrivent sur rien ; pas de photo, pas de logo CERN (licence non vérifiée : on reconstitue en 3D) ; pas d'eau.
