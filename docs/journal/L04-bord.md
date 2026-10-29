# L04 · décor `bord.js` — journal

Agent du décor « bord » (ton Rafale, les autres avions, les gens de verre, Pedro, les deux tables). Fichier unique : `episodes/L04-porte-avions/src/bord.js`.

## 23/10 — lecture

- Lu : consigne (`docs/L04-decors.md`, « Pour tous » + « bord.js »), `plan.js`, `world.js` (FIRST, VIEW, apply), `015/src/rafale.js` (en entier), `kit/lib/figure.js`, `build3d.js` (glass, asShell, plate, merge), `atmo.js` (contact, pool), l'hélicoptère du L02, l'en-tête du feu du 012, les lignes du plan des actes qui me concernent.
- Décision : je **recopie et adapte** les formes du 015 (sections, `skin`, `aerofoil`, `patch`) — importer `buildRafale` aurait importé le `plan.js` du 015 (`hookAt`), interdit.
- Le repère : celui du 015 (nez +z, aile gauche +x, roues principales à z = 0) retourné d'un demi-tour et décalé de `RAFALE.mains` = 530 : la roue avant du 015 (z = 530) tombe sur l'origine, nez vers −z. Les cotes du `plan.js` (nez −354, queue 1215, crosse 1086, cockpit z 44) retombent juste.
- La table de pont : `BENCH.board` = [320, 120] (x, z) contredit « étrave vers −z, même contour que le pont vu de haut » (un navire de 261 m couché sur 120 cm de profondeur). Je fais la table **longue selon z** (150 × 340) : voir « À changer ailleurs ».

## 23/10 — construction

- `bord.js` écrit en une passe (≈ 1 500 lignes) ; essai à blanc dans node (esbuild + `buildBord()` + `set`/`update` sur tous les états) : passe.
- `npm run look` bloqué un temps : `model.js` (autre agent, en cours) levait « reading 'mats' » à la construction — pas mon fichier ; attendu qu'il se répare.
- Choix : le Rafale du 015 RECOPIÉ (formes, coques, train, crosse, tuyères, main, casque), adapté : repère sous la roue avant, `tilt` (tangage autour de l'essieu principal) → `roll` (roulis + frisson) → le repère du 015 retourné. Nouveau : barre de lancement articulée (`bar`), ferrure de la barre de retenue (`A.holdback`), bout de la barre (`A.tow`), viseur tête haute (shader, traits ≥ 1,8 px), feux de bout d'aile (points à taille minimale en pixels), chaleur qui s'élargit vers le déflecteur, lignes qui s'effacent avec la distance (`fadeFar`, LineMaterial patché : une ligne fine au loin ne fait que grouiller).
- Avions légers : UNE géométrie fusionnée (coque, voilure, verrière, train, tuyères, cœurs, contour) partagée par tous ; quatre familles de matières (suivant, ravitailleur, garés, hangar + ascenseur) qui s'effacent ensemble. ≈ 8 appels de dessin par avion.

## 23/10 — vérification (9 images lues sur 30)

Planches `look` (dossier temporaire, jamais `renders/`) : b1 (premières images, noseFront, cockpit, approche) · b1b, b1c, b1d (le cockpit, quatre essais de pose) · b2 (le chien, la cabine, l'officier, Pedro) · b3 (ravitailleur, tables, miniatures) · b4 (ravitailleur de près) · b5 (avions garés, hangar, ascenseur, **avec l'en-tête**) · b6 (gilet allumé, officier de dos). `npm run check -- L04` : passe (0 erreur ; l'avertissement `isnan` vient du plateau). Rendu `look` : 33 à 54 ms par image.

Corrigé en route : le viseur remonté à hauteur des yeux ; la verrière s'éteint à 85 % quand le viseur est allumé (de l'intérieur, elle lavait toute l'image) ; gilet allumé moins fort (il bavait) ; plateforme de l'officier en lèvre seule (elle faisait une dalle grise) ; pastilles des maquettes plus grandes ; tuyau du ravitailleur plus épais et plus clair.

## Ce que fait chaque nombre

**`rafale.update`** — `jet` fondu de tout l'avion · `pitch`° nez haut autour de l'essieu principal · `bank`° (> 0 aile droite basse, < 0 « à gauche ») · `gas` 0,5 ralenti → 1 plein gaz : la manette avance de 32 cm et ta main avec, deux cœurs signal → blancs, la chaleur qui s'élargit sur ≈ 4,4 m vers le déflecteur · `tremble` frisson à 30 Hz (un flou stable) sur une houle lente (0,55 et 0,83 Hz), amplitude ≤ 0,4 cm et ≤ 0,15° · `hook` 0 rentrée → 1 sortie : au sol le patin se pose sur le pont, en vol elle pend à sa butée (47°) ; `A.hook` = pointe · `bar` 0 barre de lancement relevée → 1 abaissée dans le croc ; `A.tow` = son bout · `you` toi (verre, casque plein, main gauche pleine sur la manette) · `hud` le viseur veille (et la verrière qui s'efface) · `night` feux de bout d'aile (bâbord signal, tribord veille, points ≥ 7 px) · `onDeck` la flaque de lumière et les trois ombres sous les roues · **optionnels** : `gear` (1) 0 = train rentré · `scrape` (0) les étincelles du patin. Ancres : `hook`, `cockpit`, `nozzles`, `holdback` (la ferrure sous le train avant, z ≈ +15, y 33), `tow`, `head`, `canopy`, `throttle`, `noseWheel`, `wheelL/R`, `nose`, `tail`, `fin`, `wingL/R`, `cg`.
**`next.update`** `jet`, `gas` (0,5 : deux petits cœurs signal), `night`, `gear`? · **`tanker.update`** `jet`, `night` (train rentré, nacelle pleine, tuyau plein qui respire lentement, panier veille ; `A.basket`).
**`set`** — `parked` (0–1) et `running` (leurs cœurs au ralenti) · `fleet` (hangar + la paire de l'ascenseur) · `dog`, `sig` 0…6 (`now`), `vest` 0,35 → 1 · `crew` · `cabinCrew` · `lso`, `lsoArm` 0 combiné à la poitrine → 1 levé au-dessus de la tête · `paddles` : > 0 bras écartés, raquette veille (sa gauche) et signal ; **0,5 → 1 les incline de 28°** · `pedro` (flotte lentement) · `zones` (bandes de l'étrave vers l'arrière + leurs bords) · `tokens` (posées une à une, elles descendent de 5 cm) · `green`, `red` (pastilles ; rouges : PARK[2], PARK[4] et une à l'arrière) · `rocket` 0 → 0,05 étincelle sur le F-4 ; 0,05 → 1 la tête et sa traînée filent en arc vers l'A-4 bâbord ; ≥ 0,94 l'impact (il meurt quand le feu prend) · `fire` 0 → 1 les flammes de place en place (l'A-4 touché d'abord, puis par distance ; « le plus clair gagne »), braises en traînées, flaque signal ; redescendre `fire` éteint d'abord les dernières · `burnt` assombrit les maquettes atteintes et tasse les flammes.

## Les poses qui cadrent (vérifiées ; `dof` à remettre selon le plan)

- `VIEW.hook1`, `hook2`, `hook3`, `noseFront` : justes avec `FIRST`. hook3 (deux cœurs blancs sur le déflecteur) est la plus forte des trois à mon œil.
- **Cockpit (remplace `cockpitPose`)** : œil à (x 20, y 300, z 84) dans le repère de l'avion — par-dessus ton épaule droite, le casque au bord gauche, le viseur lisible, le pont devant. Autour de `run` 0 du `track` 3 : `{ tx: -258.9, ty: 258.1, tz: 8925.5, d: 600, az: 8.5, el: 4, fov: 46, shift: 0, side: 0, roll: 0, drift: 0.3, ...SHARP }`, état `{ night: 1, hud: 1, track: 3, run: 0 }`.
- `VIEW.approach` : juste avec `ride` 1. En `ride` 0 à `run` −60 : `{ tx: 684.3, ty: 666.8, tz: 15371.4, d: 2600, az: 12, el: 4, fov: 28 }`.
- `VIEW.dog` : juste pour les gestes. `VIEW.cabin` (`cabinCrew` 1) : juste. `VIEW.lso` (az −20) le montre de face ; **de dos, l'approche derrière lui** : `{ tx: -2126.6, ty: 120, tz: 10432.6, d: 800, az: 165, el: 10, fov: 28, side: 120 }`. `VIEW.pedro` : juste (le plongeur petit : pousser vers la porte).
- Ravitailleur (`track` 2, `run` 2000, `alt` 400, `tanker` 1), trois quarts arrière : `{ tx: -23600, ty: 40150, tz: -213400, d: 3600, az: -25, el: 10, fov: 28 }` — les deux avions, le tuyau et le panier.
- `VIEW.board` : juste. Vue de haut, étrave en haut (raccord avec le navire vu de haut) : `{ tx: 0, ty: 24, tz: 0, d: 820, az: 0, el: 85, fov: 28 }`.
- `VIEW.forrestal` : juste. Le feu de près : `{ tx: -5, ty: 28, tz: 115, d: 190, az: -60, el: 24, fov: 28 }` (`rocket` 1, `fire` 0,8).

**Miniature 1** (« IL NE BOUGE PAS ») : `{ tx: -200, ty: 220, tz: -5000, d: 2500, az: -90, el: 3, fov: 30, shift: 0, side: 0, dof: 0 }`, état `FIRST` (`gas` 1, `tremble` 1, `jbd` 1) — l'avion de profil sur ≈ 40 % de la hauteur, la chaleur signal dans le déflecteur. **Miniature 3** (« REVENIR DE NUIT ») : `{ tx: -747, ty: 150, tz: 6300, d: 2400, az: -35, el: 10, fov: 28, dof: 0 }`, état `{ night: 1, lights: 1, track: 3, run: 36.86, hook: 1, caught: 1, pull: 3, wires: 1, gas: 0.8, jbd: 0, hooked: 0, held: 0, strain: 0, mirror: 1 }` — trois quarts arrière, la crosse sur le câble veille, les deux feux et les deux cœurs.

## Un cran en dessous

- L'avion de verre se lit en **silhouette sombre** devant la lueur de l'aube (b1 hook1, b2) : la passe de profondeur de la coque cache le ciel dessiné après elle (voir « À changer ailleurs », 4).
- Le cockpit : le casque est grand et clair au bord gauche ; la pose ne vaut qu'à `you` 1.
- Le geste 4 (« lancement ») : la jambe à genou est raide ; lisible en silhouette, pas en gros plan. Les gestes 1 et 6 se ressemblent à l'arrêt (ils bougent différemment).
- Pedro : un Dauphin simplifié (cabine en bulle, fenestron, roues de verre) ; le plongeur fait ≈ 10 % de la hauteur dans `VIEW.pedro`.
- Les maquettes du CDG sont petites dans `VIEW.board` (≈ 17 cm, à l'échelle) ; les pastilles se lisent, les silhouettes moins.
- `next`, `liftPair`, `fleet` : vus de loin seulement (b5). La roquette n'a pas été vue en vol sur une planche (seulement l'impact et le feu).

## À changer ailleurs

1. **`world.js` · `cockpitPose`** : l'œil est dans l'appui-tête (y = cockpit + 45, z = cockpit + 30). Le mettre à (lx 20, y 300, lz 84) dans le repère de l'avion, `fov` 46, `el` 4 : `const lx = 20; const lz = RAFALE.cockpit[2] + 40;`, `eye[1] = J[1] + 300`, défauts `{ d = 600, el = 4, fov = 46 }`.
2. **`world.js` · `apply`** : le train rentré en vol — `bord.rafale.update({ …, gear: tr === 2 ? 0 : 1 })` (sinon le Rafale vole train sorti à côté du ravitailleur) ; et, si un plan le veut, `scrape` (étincelles du patin) à l'appontage.
3. **`plan.js` · `BENCH.board`** : la table est longue selon z (étrave vers −z, comme le pont vu de haut) : `board: [150, 340]` (x, z). Personne d'autre ne la lit ; `bord.js` construit déjà 150 × 340.
4. **`navire.js`** : le ciel / la lueur de l'horizon doit être dessiné AVANT les coques de verre (`renderOrder` < 18, ou opaque) — sinon tout avion et tout personnage de verre devant l'aube devient une silhouette noire (la passe de profondeur d'`asShell`, ordre 19, cache ce qui est dessiné après).
5. **`model.js` · `cabin.A.seats`** : mes deux figurants assis ont leur origine AU PLANCHER entre leurs pieds et regardent leur +z ; tourner chaque siège vers ses écrans (ils cadrent déjà dans `VIEW.cabin`).
6. **La plateforme de l'officier** : je la dessine (lèvre de verre + pare-vent) avec `lso`. Si `navire.js` en dessine une, retirer la mienne (`platform`, `shield`).
7. **`docs/L04-actes.md`** : `paddles` 0,5 à la coupe (431,7), → 1 sur « raquettes » (433,4) pour les incliner.
