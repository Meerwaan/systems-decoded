# 051 · glace.js — journal du décor (la glace à l'étrave)

## Lu
recette-agents, regles-image, 051-decors (haut + « glace.js »), plan.js, world.js (FIRST, VIEW, apply), lignes des actes qui pilotent la glace, build3d (solid, glass, asShell, lineMat, edgesOf), rng.

## Décisions (avant d'écrire)
- **La plaque au contact = une langue** (une « cuspide » réelle) de ±850 cm devant l'étrave, bordée de fissures déjà ouvertes : elle fléchit comme une poutre (même flèche sur toute sa largeur), donc la flèche se lit **de profil** (principle, bowSide). Une plaque de ±1 700 qui plierait en cuvette ne se lirait pas de côté (son bord proche reste droit).
- Flèche exagérée (≈ 85 cm au bord, une épaisseur) sur ≈ 15 m ; le bord suit l'étrave (il recule de ≈ 2 m vers l'arrière en descendant le long des 20°) — l'étrave ne grimpe pas, la glace plie et plonge.
- Fissure en arc à ≈ 7–8 épaisseurs de l'étrave, puis 2 radiales : 3 blocs (A) ; au-delà de l'arc, la plaque (B, deux moitiés) se redresse à plat.
- **La crête devant** : posée dans le repère de la glace de sorte qu'à `run` 0 son pied touche l'étrave (centre à CONTACT.edge − 600 + run·100) — avec `RIDGE.ahead` (−9 000) elle resterait à 42 m de l'étrave à `run` 0 et l'éperonnage (`run` −40 → 0) ne la toucherait jamais. À `run` −40 elle est à ≈ −9 400 : ≈ RIDGE.ahead.
- Tout ce qui est nombreux (blocs du chenal, crêtes) est instancié, leurs arêtes dans un seul trait mis à jour sans allocation.

## Planche 1 (8 images) — ce qu'elle a dit
- Banc : la flèche se lit de profil (slope nette), mais `VIEW.principle` met le contact au bord droit (z −4 800 à 92 % de la largeur) : il faut viser tz ≈ −5 150. Vu à el 2, la fissure en arc (sur le dessus) ne se voit pas : el ≈ 9.
- L'éclair (sprite 420) faisait un disque blanc baveux : réduit à ≈ 200, intensité 1,3.
- `tumble` 0,5 envoyait les blocs hors du cadre du banc : maintenant d'abord sur la tranche près de l'étrave (0 → 0,45), puis la glissade vers l'arrière et dessous (0,3 → 1).
- Glace, `bowSide` : la tôle de glace côté caméra cachait la flèche de la langue. Correction : de l'eau libre de part et d'autre de la langue sur 15 m devant l'étrave (la langue est une cuspide qui dépasse, son flanc bâbord se voit de profil).
- `high` : les crêtes faisaient un liseré sombre trop maigre ; agrandies (largeur 12,5 m, voile 1,5 × RIDGE.sail, pic à ≈ 4 m de la coque) ; la ligne de contact signal passait sous les débris : remontée à y + 40, plus large.

## Planches 2 à 6 (22 images ; 30 en tout, budget épuisé)
- Banc (`principle` recalé) : écrasement (débris + frange signal, la plaque immobile), flèche lisible de profil, fissure blanche → veille sur le dessus à crack 0,2–0,3, petite boule de lumière à l'arc, blocs sur la tranche près de l'étrave à tumble 0,5. OK.
- Glace : `high` — crêtes pâles le long des deux flancs, ligne de contact signal (grip 1), main d'eau noire (grip 0) ; chenal ouvert (blocs anguleux dans l'eau noire, wake 1) ; la crête devant lit bien comme un amas (run −20) ; « like » : l'étrave droite contre la crête, débris. OK.
- **Le défaut qui reste** : en glace, la mer de `banquise.js` est un plan OPAQUE à y 0 qui écrit sa profondeur ; la glace n'a que 10 cm hors de l'eau. De profil (`bowSide`), la flèche de la langue disparaît donc sous la surface : on voit la langue « plonger » sous l'étrave puis les blocs se dresser sur la tranche, pas la courbe. Ma correction possible est hors de mon fichier (ci-dessous).
- `hb(z)` (la flottaison contre laquelle s'appuient blocs, crêtes, ligne de contact) recopie la plénitude de `model.js` (1 − (1 − s)^2,4 de l'étrave à z −1 200, effilement après 2 600).
- Tons : dessus ink × 0,5, tranches × 0,68, faces de rupture × 0,9 (couleurs de sommet) ; arêtes sombres fines (0x1f2529) — sur glace claire, ce sont elles qui séparent les blocs d'un amas (la consigne disait « arêtes claires » : invisibles sur glace claire).

## Poses qui cadrent (à coller)
- principe (banc) : `{ tx: 0, ty: -50, tz: -5150, d: 4200, az: -90, el: 9, fov: 28, shift: 140 }` — le contact à ≈ 70 % de la largeur, l'arc de fissure visible sur le dessus (el 2 la cache).
- crête qui approche / éperonnage large : `{ tx: 0, ty: 200, tz: -6500, d: 9000, az: -112, el: 9, fov: 30, shift: 150 }`.
- like (étrave droite contre la crête) : `{ tx: 0, ty: 150, tz: -5000, d: 4200, az: -100, el: 6, fov: 30, shift: 150 }`.
- `VIEW.section` (d 7 600) ne fait que 23 m de large : la coque (26 m) n'y tient pas, les crêtes sont hors cadre. Il faut d ≥ 12 000 pour voir la glace se décoller des flancs.

## Comment piloter (pour les actes)
- `crack` se tire sur 0,5 à 1 s (le blanc vit entre 0,02 et 0,45 ; un saut 0 → 1 le perd).
- `tumble` : 0 → 0,45 les blocs se dressent sur la tranche près de l'étrave ; 0,3 → 1 ils glissent vers l'arrière et passent sous la coque (≈ 34 m).
- Remettre `bend`/`crack`/`tumble` à 0 fait réapparaître la langue entière d'un coup : seulement sur une coupe.
- La crête : son centre est à `CONTACT.edge − 950 + run·100` (à run 0 son pied est sous le surplomb de l'étrave ; à run −40, ≈ −9 750). `crack` avec la crête sous l'étrave la fend en V et jette ses blocs des deux côtés.
- `section` > 0,5 : rien de la glace n'existe à l'arrière de la coupe (z > 0).

## À changer ailleurs
- `banquise.js` (pour que la flèche se lise en glace, le décor l'a demandé sur `bowSide`) : une fenêtre dans le plan du pack/de la mer autour de l'étrave, le temps des plans de profil — dans le shader du pack, après `inPatch` : `if (uBowWindow > 0.5 && abs(vW.x) < 2600.0 && vW.z > -8400.0 && vW.z < -3000.0) discard;` avec `uBowWindow: { value: 0 }` mis à `S.bowWater ?? 0` — ce qui demande aussi dans `world.js` → `FIRST` : `bowWater: 0, // the sea see-through at the bow (bowSide): the plate's sag and the blocks under the hull show (0/1)`. Sous la fenêtre, glace.js assombrit déjà ce qui plonge. Sans cette fenêtre, `bowSide` montre la langue qui plonge et les blocs qui se dressent, pas la courbe.
- `plan.js` (doc seulement) : `RIDGE.ahead` (−9 000) ne sert plus ; la crête est à `CONTACT.edge − 950` dans le repère de la glace (glace.js `CREST_Z`). Ligne : `export const RIDGE = { sail: 280, flank: 1700, ahead: -5750, width: 900 };` (à −9 000, la crête restait à 42 m de l'étrave à run 0).
- `world.js` → `VIEW.principle` : `principle: { ...P, ...CLOSE, tx: 0, ty: -50, tz: -5150, d: 4200, az: -90, el: 9, fov: 28, shift: 140 },`
