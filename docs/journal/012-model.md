# 012 — model.js (le système) — journal

Fichier : `episodes/012-gaziniere/src/model.js` — `buildSystem()` → `{ root, A, parts, update(p, time) }`. `npm run check -- 012` passe.
Planches et essais : dossier temporaire `…/scratchpad/012/model-{a,b,c,d}.{json,jpg}` (le générateur : `model-make.mjs`). **30 images lues** (4 planches : 8 + 8 + 8 + 6).

## Parti pris

- **Un seul assemblage rigide**, écrit dans le repère de `PARTS` (origine : centre du brûleur-héros sur la face de la plaque).
- **Le cœur** (groupe magnétique), sur l'axe x = −3, y = −3,9, du robinet vers l'arrière : siège (bague pleine dans le robinet, z 14,72) · clapet (pastille de caoutchouc sombre sur une coupelle claire) · ressort (la pièce la plus claire) · guide fixe (z 13,1 : la cloison contre laquelle le ressort pousse) · plaquette d'armature (rectangulaire, pour ne pas la confondre avec le clapet rond) · électroaimant (noyau en U, les deux branches l'une AU-DESSUS de l'autre pour que le U se lise de profil, une bobine sombre par branche) · la douille.
- **Course exagérée : 7 mm** (4 mm en vrai) — clapet, bout du ressort et armature bougent ensemble de 0,7 cm (`STROKE`, exporté). Le ressort est un seul maillage à deux formes (morph) : le fil ne s'écrase pas.
- **Comment la manette pousse le clapet** : sa tige (verticale) finit par un cône ; en descendant de `KNOBS.travel` (0,5 cm) le cône chasse un poussoir horizontal de 0,7 cm vers l'arrière, à travers le siège, contre le clapet. **C'est une came inventée** pour être lue en une image (un vrai robinet pousse dans son axe) : simplification à porter dans `sources` si un plan s'y attarde.
- **Le chemin du gaz dans le robinet est simplifié** : rampe → bas du robinet → à travers le siège → chambre du clapet → tube de sortie → injecteur. (Dans un vrai robinet la sécurité est en amont du boisseau.) Le clapet est la porte sur le trajet : fermé, tous les tirets disparaissent.
- **Sur l'établi** : un morceau de plaque en verre coupé net (contour « trou de serrure » : un disque autour du brûleur, une langue jusqu'à la manette), deux vés sous un tronçon de rampe, un pied sous l'injecteur. Tout cela (et le tube de sortie) s'efface entre `explode` 0 et 0,2.
- **Éclaté en rangée** en travers d'une caméra à az −44, centrée sur l'origine de l'établi, toutes les pièces à la même profondeur. De gauche à droite : brûleur (chapeau et couronne soulevés) avec la pointe et son fil restés à côté de la couronne (« dans la flamme ») · douille · électroaimant · armature · clapet et ressort · robinet, la manette levée au-dessus de lui sur sa tige (« sous la manette : un robinet »). L'ordre de la voix (robinet, ressort, électroaimant, pointe) se lit donc **de droite à gauche** : un travelling.
- Ordre de départ (rien ne se traverse) : brûleur, pointe et robinet partent (0 → 0,6) ; la douille recule dans son axe (0,14 → 0,44) puis se range (0,38 → 0,64) ; ce qu'elle contenait part ensuite (0,42 → 1) ; manette, chapeau, couronne se lèvent (0,5 → 1). Donner à `explode` au moins 1,2 s.

## Les nombres

| nombre | ce qu'il fait |
| --- | --- |
| `bench` | 1 : le morceau de plaque en verre, les deux vés, le pied (0 : rien — la plaque est celle de `hob.js`) |
| `shell` | dans la cuisine seulement : le tronçon de rampe s'efface (opacité 1 − shell), la rampe est celle de `hob.js` |
| `safety` | 1 → 0 : la pointe, son fil, la douille et tout ce qu'elle contient se dissolvent (matières propres) ; un bouchon six pans apparaît à l'arrière du robinet ; le gaz passe alors quel que soit `valve` ; chaleur, courant et prise s'éteignent avec |
| `press` | la manette et sa tige descendent de 0,5 ; le cône pousse le poussoir, le poussoir le clapet ; l'armature arrive sur les pôles. Ouvert = max(press, valve) |
| `valve` | 1 clapet décollé de 7 mm, ressort à bloc, armature sur les pôles → 0 ressort détendu, clapet sur son siège, armature revenue contre le guide |
| `heat` | la pointe : peau de lumière signal, blanche au bout, qui se retire vers le bout en refroidissant ; une boule à cœur brillant et longue traîne ; une vraie lumière sur la couronne |
| `volts` | 0 → 0,4 : une tête de lumière veille descend le fil, de la pointe à l'écrou de la douille, le fil allumé derrière elle · 0,4 → 1 : le fil gagne en intensité, tirets de 1,3 cm à 1,8 cm/s vers l'aimant |
| `hold` | bobines veille, bague de lumière au bout de chaque pôle, halo doux ; tant qu'il y a un jeu (`valve` 0, `press` 0), six lignes de champ le traversent (« pas assez pour l'attirer ») |
| `xray` | le corps du robinet et la douille passent en verre (fondu enchaîné : plein → verre) ; clapet ouvert, le gaz se voit : tirets signal de 1,7 cm à 5 cm/s (un dixième de période par image) de la rampe à l'injecteur |
| `explode` | la rangée (établi) |
| `litTap` | robinet + manette (et le verre du robinet si `xray`) · `litSpring` ressort + clapet · `litMagnet` électroaimant + armature · `litTip` pointe + fil + écrou. À 1 c'est franc ; 0,5–0,7 pour « faiblement » |

`A` : `burner, ports, tip, lead, knob, tap, magnet, spring, seal` — enfants de leurs pièces, ils suivent l'éclaté ; `spring` suit la compression, `seal` le clapet.

## Poses qui cadrent (vérifiées sur planche)

Établi (coordonnées de l'établi, `fov` 28) :

```js
whole:      { tx: 0, ty: 5, tz: 0, d: 94, az: -40, el: 22, shift: 230, side: 60 },      // vu à shift 200 : sujet 480–1200 px
exploded:   { tx: 0, ty: 5.5, tz: 0, d: 128, az: -44, el: 24, shift: 315, side: 30 },   // vu à shift 285 : rangée x 93–973, y 480–907
rowTap:     { tx: 8.2, ty: 7.0, tz: 7.9, d: 58, az: -44, el: 20, shift: 170 },          // explode 1 : la manette au-dessus du robinet (robinet ≈ 265 px)
rowHeart:   { tx: 4.6, ty: 3.6, tz: 4.45, d: 40, az: -44, el: 18, shift: 170 },         // explode 1 : aimant · armature · ressort (ressort ≈ 160 px, aimant ≈ 100 × 130)
rowTip:     { tx: -7.4, ty: 7.6, tz: -3.2, d: 64, az: -44, el: 20, shift: 170 },        // explode 1 : le brûleur ouvert, la pointe devant, le fil
magnetPart: { tx: -1.5, ty: 3.5, tz: 4.9, d: 24, az: -78, el: 8, shift: 160 },          // xray 1, de profil : ressort ET aimant dans un cadre (valve 1/0)
pressPart:  { tx: -1.5, ty: 4.4, tz: 6.3, d: 30, az: -82, el: 6, shift: 160 },          // xray 1 : manette, cône, poussoir, clapet (press 0/1)
chain:      { tx: -1.5, ty: 5.8, tz: 2.2, d: 60, az: -68, el: 10, shift: 170 },         // xray 1 : pointe rouge → fil veille → aimant qui tient
```

Cuisine : `VIEW.system`, `VIEW.under`, `VIEW.tip` tels quels (vus : le système plein dans le verre ; la pointe rouge devant la couronne, puis disparue à `safety` 0). En plus, **le cadre du « clac » dans la cuisine** :

```js
heart: { tx: 163, ty: 86.9, tz: 47.4, d: 24, az: -78, el: 8, shift: 160, fov: 28 },     // xray 1 : valve 1 + hold 1, puis valve 0 + hold 0
```

## Ce qui a raté, et pourquoi

- Chapeau émaillé brillant (vernis) : vu de dessus il renvoyait la lumière de contre en **boule verte** (planche a), puis en disque pâle (b). Mat, sans vernis : il est enfin sombre. Même chose, en moins fort, pour la manette.
- Le morceau de plaque en verre faisait une bande laiteuse vu par la tranche : `rim` et `edge` divisés par deux.
- Tube de sortie trop sombre : invisible sous la plaque. Éclairci (les tirets signal restent lisibles dessus).
- Tronçon de rampe trop long : le vé de droite tombait dans la colonne de boutons de TikTok. Raccourci (5,4 cm).
- La douille partait en diagonale : sa paroi traversait l'électroaimant. Elle recule d'abord dans son axe.

## Ce qui n'est pas au niveau

- **Dans la rangée large (d 128), le cœur est petit** : aimant ≈ 35 px, ressort ≈ 60 px, douille ≈ 110 px. Les 150 px ne sont atteints qu'en s'approchant (`rowHeart` : ressort 160 px ; l'aimant fait 100 px de large à d 40, 135 à d 30). La pièce fait une phalange : la rangée large ne peut être qu'un plan de situation, les noms se disent sur le travelling serré.
- **`whole` est correct, pas spectaculaire** : objet long et bas, la douille y fait une centaine de pixels.
- Dans le gros plan du cœur, **les tirets du gaz dans le tube de sortie passent juste au-dessus de la douille**, très gros (270 px de période à d 24) : ils disent bien « ça coule / c'est coupé », mais ils disputent l'image au ressort. S'ils gênent : baisser `0.2 + 1.55 * dash` dans `flowMaterial`, ou filmer plus bas (el 0–4).
- Le contour du robinet en verre est lourd (boîte aux arêtes blanches) dans les gros plans.
- Les lignes de champ sont fines (≈ 2 px à d 44) : elles ne comptent que de près.
- Dans l'éclaté, l'écrou du fil pend au premier plan, sous la rangée.
- **Jamais vu en mouvement** : le morph du ressort, la course des tirets, la tête de lumière (vue une fois, à `volts` 0,25), l'éclaté (trois instants vus : 0,3 · 0,55 · 1), `press` entre 0 et 1.
- `VIEW.system` / `VIEW.under` ont été jugés avec une plaque encore bouchon : à revoir quand `hob.js` est là.

## À changer ailleurs

- `world.js` → `VIEW` : remplacer `whole`, `exploded`, `magnetPart` par les poses ci-dessus ; ajouter `rowTap`, `rowHeart`, `rowTip`, `pressPart`, `chain` (établi) et `heart` (cuisine). `tapPart` et `tipPart` n'ont pas été essayés.
- `plan.js` (pour mémoire, personne d'autre ne les lit aujourd'hui) : `PARTS.magnet.r` 0.8 → **0.9** ; `PARTS.outlet` → `[[-1.8, -2.7, 15], [0, -2.7, 15], [0, -3.0, 0.55]]` (le plan le faisait passer à y = −3,9, exactement derrière le groupe magnétique et le fil vus de profil) ; `PARTS.lead` arrive à l'écrou en z = 10,5.
- `hob.js` : la manette-héros **flotte à 0,6 cm** de la plaque (elle descend de 0,5) : son dessus est à y = 3,0 au repos, 2,5 enfoncée — la main de « toi » se pose là ; les trois autres manettes gagnent à avoir le même pied (bas à 0,6, haut à 3,0). La plaque ne doit rien dessiner de plein au brûleur-héros (coupelle : trou de rayon 4,62), ni à sa manette, ni à la pointe (x −2,9, z 4,9). Sa rampe passe dans mon collier (rayon 0,8 en `PARTS.rail`) ; mon tronçon s'efface quand `shell` = 1.
- `fire.js` : la couronne a **40 fentes**, centrées aux angles i × 9° comptés depuis +z vers +x — position (4,4 · sin a ; 1,6 ; 4,4 · cos a), hautes de y 1,22 à 1,96. Le chapeau (rayon 3,7) est mat et sombre.
- Actes : `explode` sur au moins 1,2 s ; `lit*` à 1 est franc ; la tête de lumière du fil se voit entre `volts` 0,04 et 0,4 ; les lignes de champ entre `hold` > 0 et un clapet fermé.
- `sources` (episode.json) : la course de 7 mm (4 en vrai), la came conique, le trajet du gaz simplifié dans le robinet.
