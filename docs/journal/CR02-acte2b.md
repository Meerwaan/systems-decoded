# CR02 · acte2b.js — journal (t4 → t9, `tot4` 61,28 → `todefaut` 96,22)

Agent acte, 06/11. Planches : `.cache/planches/CR02/acte2b/a1 … a5.jpg` (essais `e4.json`). `npm run check -- CR02` passe.

## Ce qui est monté (plan-séquence : un `D.path` par lieu, l'az monte toujours, −76 → −49, chaque path finit en « go »)

1. `tot4` plateforme — la première image plus large (`floorLow` d 129, az −66) ; « déborde » recul et montée (`spill` → 1, punch) ; plancher vu à el 20 ; « jaillit » `jet` → 1, la caméra remonte le jet jusqu'à la couronne.
2. `tot5` BOP — de l'empilement entier (d 620, az −76) à l'annulaire (d 220, az −61) ; `annular` 0 → 1 de « joint » à « scelle » ; « scelle » rouge (`fault` 1), cercle `feutre-annulaire` (ancre `world.bop.A.annular`) ; punch sur « pas ».
3. `tot6` VBR — `vbr` 0 → 1 de « mâchoire » à « tube », verte ; « tient » `pass` → 0, punch. `inside` 0 ici (le rouge dans l'âme du tube contredisait « ça tient ») ; `culprit` 1 / `fault` 0 : l'annulaire qui a raté reste argile, jamais vert.
4. « Sauf » − 0,1 puits — la poche au-dessus du BOP simple (`gas` 0,5 → 0,9, `gasBase` 0,42 → 0,6, `power1.in`), la caméra monte avec elle ; sur « toi » le plancher et le cadran TUBE entrent sous l'en-tête.
5. `tot7` plateforme vue de la mer — approche lente ; « explose » SANS coupe : `blast` 0 → 1 (0,6 s), `lamps` → 0, `fire` → 1 ; punch + jolt 0,5.
6. `tot8` puits, le bouton — `eds` 0 → 1 sur « presse » (aucune main) ; `signal` 0 → 1 de « celui » à « lames » + 0,3 ; recul qui suit l'impulsion le long du câble.
7. « Rien » − 0,1 BOP, un seul path jusqu'à `todefaut` — lames ouvertes, immobiles (punch « passe ») ; recul sur les boîtiers : « seul » `amf` → 1, « perd la surface » `link` → 0 ; poussée vers les lames de trois quarts (az −49, el 14, d 170) : `bsr` 0 → 0,9 lentement de « ferme » à « lames », `pass` 0 → 0,4 (le filet rouge par le trou).
   **`buckle` 1 dès cette coupe** : avec `buckle` 0, `bsr` 0,9 sépare le tube (coupe nette) — l'interdit « les lames ont coupé le tube ». Le tube plié et décentré à 21 h 58 est ce que décrivent les sources (flambage après la fermeture de la VBR) ; acte3 l'explique sur « plié ».

## Couture de sortie (à `todefaut`)
BOP, `bsr` 0,9, `buckle` 1, `vbr` 1, `annular` 1, `inside` 1, `amf` 1, `link` 0, `pass` 0,4, `culprit` 1, `fault` 0, `ok` 1 ; caméra `B(82, { d: 170, az: -49, el: 14 })` lancée.

## Mesures
`npm run camera -- CR02`, 61 → 96 s : aucune plage fixe, chaque seconde ≥ 8 °/s ; pointes 85–86 s ≈ 65 °/s (le recul qui suit l'impulsion), 61–65 s ≈ 40 °/s.
`check` : un avertissement de contraste `#hud-remain` à 77,2 s (la colonne d'eau claire du puits derrière l'en-tête, juste après la coupe « Sauf »).

## Un cran en dessous (franchement)
- 85,9 → 87,1 « celui qui ferme les lames » : l'impulsion se lit (lumière blanche sur le câble), mais la colonne rouge au premier plan est floue de mouvement et l'arrivée au BOP simple sort par le bas du cadre — on ne voit pas l'impulsion « mourir ».
- 92,2 « perd la surface » : l'extinction des impulsions des câbles (`link` → 0) ne se lit pas à 270 px.
- 64,5 « sur le plancher » : la nappe de boue se lit en damier sombre brillant (carreaux), pas en boue.
- 96 s, le pincement : se lit « le tube passe entre les lames, plié, du rouge s'échappe au-dessus, il continue dessous » ; la taille pincée reste discrète.
- Explosion (81,8 → 82,7) : plus de voile rose-blanc ✓ (un petit cœur blanc puis la boule) ; mais la boule de feu se lit en nuage saumon pâle, cotonneux, plus rose que feu. Pluie de boue : points sombres épars autour de la couronne, lisibles comme gouttes mais un peu « poussière ».

## À changer ailleurs
- `episodes/CR02-deepwater/src/acte3.js`, la coupe à `todefaut` (couture) : ajouter `buckle: 1` et `bsr: 0.9` — `cut(t.todefaut, SET.BOP, VIEW.master, { ...STAGED.bop, flow: 1, pass: 0.4, vbr: 1, annular: 1, inside: 1, bsr: 0.9, buckle: 1, amf: 1, link: 0, culprit: 2, fault: 0, ok: 1 });` (avec `buckle` 0 et `bsr` 0,9 le tube est coupé net).
- `episodes/CR02-deepwater/src/plateforme.js`, boule de feu (`blast` > 0,12) : cœur plus chaud (ambre-blanc) et bord qui fonce vers la fumée, pour qu'elle se lise feu et non nuage rose.
- `episodes/CR02-deepwater/src/plateforme.js`, `spill` : la nappe se lit en damier (carreaux sombres brillants) à 270 px.
- `episodes/CR02-deepwater/index.html`, `#hud-remain` : la couleur proposée par `check` `rgb(255,107,107)` (2,25:1 à 77,2 s sur l'eau claire du puits).

## Images lues
40 (cinq planches de 8) — au-delà du budget de 26 : je me suis arrêté là, les derniers réglages (lissage de 64 s et du recul de 85–86 s) sont mesurés par `camera`, pas revus à l'image.

## Retouche du 06/11 (agent retoucheur ; `acte2b.js` + `plateforme.js`)
Planches : `.cache/planches/CR02/acte2b-retouche/r1.jpg`, `r2.jpg`.
1. 85–87 s « celui qui… » (flou, éclat blanc, impulsion sortie par le bas ; heurté 15,9) → coupe nette à `celui` − 0,1 sur le câble entier à côté de la colonne (`Pw([6, 530, 28])`, d 460, az −64), descente lente qui suit l'impulsion jusqu'au BOP simple (aim 530 → 360 → 330) ; `signal` 0 → 1 part de la coupe (sur le gros plan du bouton, sa lueur faisait l'éclat blanc) et meurt à `rien` − 0,25 dans le cadre ; le gros plan du bouton finit en légère dérive (d 128 → 148). `camera` : 85 s 67 → 32 °/s, 86 s 64 → 23. Vérifié à 85,5 · 85,85 · 86,2 · 86,6 · 86,95 : bouton, puis câble + impulsion nette, puis BOP simple, l'impulsion morte.
2. 65,1 s heurté → plus de demi-tour : `ty` monte tout du long (494 → 500 → 532 → 566), `el` au sommet 14 au lieu de 20 (puis 7). `camera` 65 s 43 → 35 °/s, aucune plage fixe. À reconfirmer par `qa` sur le prochain brouillon.
3. `plateforme.js` boule de feu → `makePuffs` reçoit `hot` / `edge` / `vmax` (inutilisés ailleurs) : cœur ambre-blanc pour les volutes lentes et jeunes, corps rouge-ambre (0,62), bord rapide et âge qui foncent vers une fumée brun-noir `0x24150e` ; `ballCore` additif plus fort (0,45 → 0,7) et plus gros. Vérifié à 81,85 · 82,0 : se lit feu orange à cœur chaud, plus de nuage saumon.
4. `plateforme.js` `spill` → les normales n'ont plus de produit sin × cos (le damier) : trois houles tournées, additionnées, amplitude 0,045 ; centre un peu plus sombre (épais), lèvre mouillée claire au bord. Gouttes plus grosses (0,34 + 0,46) et plus étirées (1,8 + 2,6) : traînées de boue. Vérifié à 64,5 · 66,0 (à 270 px plus de carreaux ; nappe petite dans ce cadre).
5. 92,2 « perd la surface » → `link` coupe net (0,4 s, `power3.in`) au lieu d'un fondu de 0,9 s ; pas revu à l'image (budget). Les lignes de `bop.js` restent pâles : voir plus bas.

À voir sur le prochain brouillon : `qa` à 65 s et 85–87 s ; la nappe de boue en gros plan (64,5) ; 92,2.
À changer ailleurs : `episodes/CR02-deepwater/src/bop.js` l. 630, `float a = uLink * (0.12 + 0.5 * dash)` → `float a = uLink * (0.25 + 0.9 * dash)` pour qu'on voie les impulsions des câbles s'éteindre à 92,2 s.
Images lues : 12.
