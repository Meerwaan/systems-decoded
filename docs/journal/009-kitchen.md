# Journal — 009 · `kitchen.js` (la cuisine aux rayons X, toi, le bras du test)

Fichier : `episodes/009-micro-ondes/src/kitchen.js`. Planches et `essais.json` : dossier temporaire de la session (`…\scratchpad\009\`), jamais dans `renders/`.
Budget : 30 images lues — épuisé (8 + 8 + 8 + 5 + 1).

## Parti pris

- **Cuisine** : tout en verre (`glass` + `asShell`, ordre 24) et traits qui s'effacent avec la profondeur (trois familles : fort, fin, pâle). Colonne avec sa niche laissée libre aux cotes d'`OVEN` (joues ouvertes à la hauteur de la niche : de profil, aucune plaque de verre ne passe devant le four) ; meubles bas, plan de travail, évier et robinet col de cygne, plaque à quatre foyers, hotte et son conduit, trois meubles hauts, crédence carrelée en traits pâles, ligne du mur, coin de la pièce au fond à droite. Façades sans poignées : rien ne concurrence la poignée du four. Sol : les joints du carrelage (grille de 30 cm dans un shader, jamais sous 1,5 px) et une flaque de lumière très faible. Rien à gauche de la colonne (le côté des caméras).
- **Toi** : `makeFigure` (coque, mains « real », ordre 10). La boule du kit est remplacée par **une vraie tête** (crâne, front, arcades, pommettes, nez, lèvres, menton, oreilles, orbites — une union lisse d'ellipsoïdes vue depuis le centre de la tête) dans un verre qui sait **chauffer** (`warm` : le verre du kit, plus un rougeoiement signal autour de deux points du monde). Un cou. Deux yeux pleins, dans le verre.
- **La main qui tire** (la droite, côté plan de travail) est pleine, sombre au repos, claire dès qu'elle agit ; la gauche est en verre.
- **Sans la porte (`eyes`)** : les deux yeux passent au signal, chacun avec une boule de lumière à cœur brillant et longue traîne (un maillage, pas un sprite : sa taille est en centimètres quel que soit l'objectif, et le rendu logiciel ne plafonne pas la taille d'un point) ; puis le verre du visage rougeoie autour d'eux.
- **Le test (`hand`, `pain`)** : un second personnage dont on ne garde que l'avant-bras (verre, qui sort du noir) et la main (pleine : c'est d'elle que parle la phrase) ; le bout des doigts rougit et s'allume.
- Ordres de coque : toi 10, bras du test 12, four 20 (`model.js`), cuisine 24 : ce qui est dedans se dessine d'abord.

## Passes

### Passe 1 — premier jet (8 images lues, avec en-tête et zones)

Tout le fichier d'un coup. Le four n'existait pas encore (bouchon) : seules les ondes étaient là.
- Les planches horizontales en verre vues en rasant (tablette sous le four, plan de travail) = **des dalles grises** en travers de l'image — la leçon du 008, refaite. Corrigé : un verre à part pour tout ce qui est à plat (`fx.flat` : presque rien, pas de lèvre), ce sont les traits qui les dessinent.
- Corps trop laiteux (`glassK` 1,9 → 1,6). Bras gauche raide comme un pantin (→ jamais tout à fait tendu).
- « Sans la porte » : une boule de feu sur tout le visage. Dosé (rayon 8 → 6 cm, lumière 1,6 → 1,25, boules 8,5 → 5 cm).
- Quatre azimuts pour la première image : −40 montre ta nuque, −80 écrase le four ; **−62** garde ton profil ET la face de la porte.

### Passe 2 (16 images) — avec le vrai four

- La poignée de `model.js` : barre de 1,5 × 1,25 en z = 62,18 (pas 62,8) → `BAR` recalé.
- La main pleine fermée sur la barre se lit du premier coup (contre-plongée). `open` 0,6 : la main suit la barre, tu te redresses.
- La main du test, en verre, se perdait dans les lobes orange → **main pleine** en trois matières (paume, phalanges du milieu, bouts : la chaleur monte depuis les bouts).
- Yeux : billes d'acier sombres → globe clair, iris sombre.

### Passes 3 et 4 (29 images) — le bogue des « bulles »

- Sur toutes les planches, deux bulles de verre devant les yeux (« lunettes de plongée », puis « yeux de mouche » quand j'ai agrandi les orbites), et des éclats blancs en éventail derrière la tête. J'ai d'abord accusé `waves.js` (ses fronts sont des calottes à liseré). **C'était moi** : dans `headGeometry`, le creusement d'une orbite prenait la racine « entrée dans la boule » sans vérifier que la boule est DEVANT le rayon. Pour un rayon qui part vers l'arrière du crâne, les deux racines sont négatives → rayon négatif → le sommet ressort par le visage, sur la face avant de la boule.
- Trouvé sans image (budget) : un script qui charge la page et liste les sommets de la tête (max = 16,68 en (5,4 ; 0,3 ; 15,8) : la face avant de la boule d'orbite). Corrigé (`B <= 0 → continue`), vérifié par le même script (max 12,98 : le menton).
- **Leçon pour la recette** : quand une forme étrange survit à tous les réglages, inspecter la géométrie dans la page (script puppeteer, zéro image) avant de dépenser des vignettes.
- Posture : mes yeux tombent exactement où `waves.js` pose ses fils de lumière quand on ne lui donne pas `A.youEyes` (ses `EYES` : dy −1, front 7,1, rise 2,6) — la posture est résolue pour ça, quel que soit `near`.

### Passe 5 (30 images, budget épuisé) — la tête propre, enfin

Une seule image (trois quarts profil, de près) : tête de verre nette — front, arcade, nez, lèvres, menton, oreille, cou —, les fils de lumière arrivent sur les yeux. Deux défauts vus, corrigés **sans pouvoir les revoir** :
- les globes sortaient du visage comme des yeux de grenouille → reculés de 9 mm, DANS le verre (vus à travers, comme sous des paupières), un peu moins clairs ;
- menton en proue → raccourci de 8 mm.

Contrôle sans image après ces retouches : quinze états extrêmes (tout à 0, tout à 1, `near` 0 / 0,5, `pull` 0,25 / 0,5 / 1, `open` 0,15 / 0,6 / 1, `eyes`, `hand`, `pain`) → **aucune erreur de page** ; tête en (−8,0 ; 162,8 ; 79,0) à `near` 1 (= `YOU`), en (−8 ; 165,1 ; 124) à `near` 0 ; à `pull` 1 la tête recule à z = 91 (`open` 0,15) puis 108 (`open` ≥ 0,3) : jamais dans le balayage de la porte.

## Les nombres de l'état, chez moi

- `shell` : tout le verre, les traits et le sol de la cuisine (0 : rien). Ne touche ni toi ni le bras du test.
- `you` : 0 / 1 (seuil 0,5).
- `near` : 1 = centre de la tête en `YOU`, penché de 16° depuis les hanches, les yeux à 162 de haut et 7,1 cm devant `YOU.z` · 0 = un pas en arrière (`YOU.back`), presque droit (5°). Linéaire entre les deux (les pieds glissent : préférer une coupe, ou un mouvement court).
- `pull` : 0 → 0,5 la main droite (pleine, sombre au repos, elle s'éclaire en partant) va de la cuisse à la barre et se ferme sur les derniers 40 % ; 0,5 → 1 tu tires (le buste recule de 2,5°, tourne de 5°).
- `open` : la main suit la barre autour de `HINGE` (× 100°). Entre 0,05 et 0,3 tu te redresses (16° → −6°, la tête recule de 29 cm) ; tu restes en arrière tant que `pull` > 0,5 ; main lâchée (`pull` ≤ 0,5), tu reviens à la bouche du four entre 0,8 et 1 (la porte est alors à ta gauche).
- `eyes` : 0 → 0,5 les globes passent au signal, chacun avec son cœur brillant à longue traîne ; 0,25 → 1 le verre du visage rougeoie autour (rayon 1,6 → 6 cm). Respiration lente.
- `hand` : 0 → 1 l'avant-bras (verre, fondu entre z 72 et 92) et la main (pleine, opaque dès 0,55) entrent jusqu'au centre de `CAVITY`, paume vers le bas. `pain` : le bout des doigts rougit et s'allume — n'agit qu'une fois `hand` > 0,45.
- Ancres `A` : `youHead` (sommet du crâne), `youEyes` (entre les yeux, sur l'arcade, 1,45 cm devant eux : ce qu'attend `waves.watch`), `youHand` (la paume de la main qui tire), `testHand` (le bout des doigts du test), `columnTop`, `worktop`. Aussi rendus : `you`, `tester`, `fx`.

## Poses qui cadrent bien (complètes ; ajouter `roll: 0, drift: …`)

- **POSE0** (vue avec l'en-tête : four + tête entre y ≈ 610 et 1070, rien d'important sous 1600) : `{ tx: -8, ty: 160, tz: 64, d: 250, az: -62, el: 5, fov: 40, shift: 140, side: 80, roll: 0, drift: 0 }`
- 2 · profil de près, l'écart : `{ tx: -8, ty: 162, tz: 68, d: 135, az: -80, el: 2, fov: 28, shift: 60, side: 0 }` — et le visage de trois quarts profil : `{ tx: -8, ty: 162, tz: 70, d: 120, az: -100, el: 2, fov: 28, shift: 0, side: 0 }`
- 3 · depuis la cavité : `{ tx: -8, ty: 163, tz: 76, d: 52, az: 180, el: 0, fov: 55, shift: 0, side: 0 }`
- 4a · la main sur la poignée (`pull` 0,5) : `{ tx: 2, ty: 158, tz: 66, d: 150, az: -42, el: -14, fov: 30, shift: 0, side: 0 }`
- 4b / 4c · tu tires (`pull` 1, `open` 0,15 → 0,6) : `{ tx: -6, ty: 156, tz: 80, d: 190, az: -46, el: -8, fov: 30, shift: 0, side: 0 }`
- 5 · sans la porte (`door` 0, `eyes` 1) : `{ tx: -8, ty: 163, tz: 70, d: 125, az: -122, el: 2, fov: 30, shift: 0, side: 0 }`
- 6 · la main du test (`door` 0, `hand` 1, `pain` 1, `you` 0) : `{ tx: -4, ty: 158, tz: 50, d: 105, az: -40, el: 12, fov: 30, shift: 0, side: 0 }`
- 7 · large, toute la cuisine : `{ tx: 70, ty: 112, tz: 40, d: 600, az: -38, el: 8, fov: 36, shift: 150, side: 0 }`
- `near` 0, en pied : `{ tx: -8, ty: 140, tz: 92, d: 330, az: -62, el: 4, fov: 36, shift: 0, side: 0 }`

## À changer ailleurs

1. **`world.js`, `POSE0`** : remplacer par la pose ci-dessus. `VIEW.wide` : plutôt la pose 7 que `POSE0`.
2. **`world.js`, dans `buildWorld`**, après la construction : `waves.watch?.(kitchen.A.youEyes);` — sans ça les fils de lumière restent où le plan met tes yeux et ne te suivent pas quand tu te redresses (`pull`, `open`).
3. **`look --file`** : l'état d'une vignette fuit dans la suivante (déjà noté au 008) — écrire tous les nombres dans chaque vignette.
4. Les panneaux du modèle (« LA QUESTION DE L'ACCROCHE ? », « S'ABONNER POUR L'OUVRIR ») sont affichés à t = 0,02 tant que les actes sont des bouchons : ils couvrent la zone haute sur les planches avec en-tête.

## Ce qui n'est pas encore au niveau

- **La tête n'a été vue propre qu'une fois** (trois quarts profil). Jamais de face : l'image 3 (depuis la cavité) et l'image 5 (les yeux qui chauffent) n'ont été vues qu'avec le bogue des bulles par-dessus. Leurs poses sont bonnes, leur rendu est à regarder en premier — de face, une tête de verre peut tourner au crâne ; si c'est le cas : baisser `edge` de `fx.head`, adoucir les pommettes (`SKULL`, `k` plus grand).
- Les dernières retouches (globes reculés dans le verre, menton, teinte des yeux) ne sont pas revues.
- Le corps reste un mannequin articulé (les bras du kit sont des tubes) ; en plan large c'est sa silhouette qui porte, pas son modelé.
- La main droite, pleine, passe derrière ta tête pour toute caméra entre az −50 et −70 : la poignée est à hauteur de visage, 16 cm à droite. Le plan de la poignée doit être en contre-plongée (pose 4a) ou après que tu t'es redressé (4b / 4c).
- Pas de braises sur la main du test (les bouts rougeoient, avec un cœur brillant) : à ajouter seulement si le plan en manque.
- Meubles hauts et hotte : pâles, au fond. Ils disent « cuisine » dans le plan large, pas plus.
- `near` entre 0 et 1 : les pieds glissent.
