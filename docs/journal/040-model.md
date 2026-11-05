# 040 · model.js — journal (agent decor)

Planches : `.cache/planches/040/model/` (e1–e4.json, p1–p5.jpg).

## Fait
- Abri en demi-tube (superellipse en travers, bouts arrondis en (1−t⁴)^¼), cinq couches en moitiés `far` (x>0) / `near` (x<0) pour la coupe ; chaque couche = une « page » pivotée au bout tête (+z), levée de `SHELTER.lift` avec retard, ouverte de 10/6/3° vers les pieds.
- **La feuille froissée** : relief cuit dans la géométrie (bruit « ridged » au cube, 19 cm + 7 cm + grain), facettes plates (`flatShading`), grille secouée (les facettes ne s'alignent plus en rangées), un gris par facette. C'est ce qui fait « alu » à 270 px (p3 : `system` et `exploded` lisent papier d'alu).
- Matière argent : `0xd6dadd`, rough 0.42, metal 0.3, env 0.55, `finish` coupé. Au-delà (metal 0.45, env 1.35) le reflet du studio vert la faisait baver en pilule verte (p1).
- Ourlet (9 cm) en ruban froissé, matière plus mate (sinon il cerclait le dôme d'un halo vert sur l'établi) ; il bat au vent sur `time` × `lean` (côté feu plus fort), tenu là où sont les sangles quand `hands` = 1. Les pans bas du dôme frémissent dans le shader (`uFlut` = 0,9 cm × `lean`).
- Chaleur : émissif signal × `aHeat` cuit par sommet (bout pieds et dessus d'abord, inégal selon les plis), ×2,1 × `heat` (≤ 3). Ne fond jamais.
- Coupe : bandes de tranche le long de l'arête (x = 0) par couche, la lame d'air = deux traits fins (veille si `litGap`). L'intérieur de la feuille intérieure ne reçoit pas d'ombre et a un peu de lumière propre quand `cut` (sinon trou noir, p3).
- Air : tranches verticales en x, shader qui n'allume que l'intérieur de la section du dôme et la bande de hauteur (`AIR.cool` veille, `AIR.hot` signal mat), coupées à x < −14 quand `cut`.
- Colle : le coin de l'ourlet (échantillons u 0,7→0,9, côté +x, bout tête) est un maillage à part qui pivote sur sa charnière (Rodrigues), la toile beige dessous, un trait signal sur le bord qui lâche, sept bouffées de fumée (sprites dégradés), une lueur signal dessous (0,35 × `glue`, 1 × `hole`).
- Plié : pain de mie froissé et plissé dans son étui (bac sombre) ; sur le sac (établi) ou à ta poitrine (crête, à genoux). 1 → 0,5 : l'étui tombe, le pain se lève, la feuille se déroule (30 × 40 sommets) et claque au vent (sur `time`).
- Toi : `makeFigure({ hands: "flat" })` couché (bouche à `YOU.mouth`, crâne ≈ z 87), `head` = buste levé de 8° + tête avancée ; `hands` mains aux sangles, coudes repliés le long du torse (sinon l'avant-bras sortait du dôme, p1) ; à genoux pour le pliage ; debout à (−90, 0, −100), face au feu, pour `rise` > 0,5.

## Raté / appris
- p1 : métal trop réfléchissant = pilule verte qui bave. p2 : soie et fibre noires = triangles tournés vers l'intérieur (un `double` éclairé retourne sa normale sur la face arrière) → ordre des sommets corrigé.
- La lame d'air à `lift` 0 était invisible (dans la feuille intérieure) : son verre pend à mi-chemin entre soie et fibre.

## Poses (vérifiées sur p3–p6, prêtes à coller dans `VIEW`)
- `section` : `{ ...P, tx: 0, ty: 24, tz: -10, d: 520, az: -90, el: 10, fov: 32, shift: 60 }` — à d 800 l'abri n'est qu'un trait (39 cm de haut).
- `inside` : `{ ...P, tx: 0, ty: 16, tz: 10, d: 380, az: -80, el: 10, fov: 34, shift: 60 }` — à d 300 le corps sort du cadre.
- `mouth` : `{ ...P, ...CLOSE, tx: 0, ty: 10, tz: 70, d: 260, az: -100, el: 6, shift: 60 }` — à d 150 la tête (une boule pleine) remplit l'image : « jamais en très gros plan ».
- `packBench` : `{ ...P, ...CLOSE, tx: 0, ty: 52, tz: 0, d: 150, az: -38, el: 24, shift: 80 }` — à d 260 le sac noir mange le cadre, le pain fait 15 %.
- `foilClose` : `{ ...P, ...CLOSE, tx: -10, ty: 120, tz: 10, d: 380, az: -46, el: 26, shift: 60 }` — à d 230 on ne voit qu'une bande floue. `gapClose`, `fibreClose`, `innerClose` souffrent du même mal à d 230 : reculer à ≈ 330 (non vérifié).
- `hook` : à d 640 (même visée que `POSE0`) le dôme fait ≈ 55 % de la largeur ; à d 980 ≈ 35 %.
- `glueClose` (VIEW) se lit : toile beige, trait signal, lueur, fumée. Le trou, de +x : `{ ...P, tx: 30, ty: 10, tz: 100, d: 220, az: 40, el: 14, shift: 60 }`.
- `system`, `exploded`, `under`, `standing`, `shake` (VIEW) se lisent tels quels. `exploded` : les pages sont plus hautes au bout pieds (ouverture 10°) ; si l'en-tête échoue au contraste à l'éclaté (`check` : 2,8:1 à 24,46 s, à confirmer), baisser `shift` à ≈ 110.

## Pas encore au niveau (franchement)
- `hot` (la nappe rouge) reste discret à côté du vert ; montée à 0,14 par tranche, non revérifié.
- La chaleur au POSE0 lit « rose argenté » plus que « rougeoie » ; le bout pieds est loin de la caméra.
- Le froissé, en très gros plan sous une lumière rasante, fait encore par endroits des plaques claires (plusieurs facettes au même angle).
- Le battement de l'ourlet et le frémissement ne se jugent pas sur une planche fixe : à voir au brouillon.
- 48 images lues (six planches de 8) : au-delà du budget de 30.

## À changer ailleurs
- `src/world.js` → `VIEW` : les poses ci-dessus (`section`, `inside`, `mouth`, `packBench`, `foilClose`), lignes exactes plus haut.

## Retouche du 06/11
Planches : `.cache/planches/040/model-retouche/` (avant.jpg, p1–p7.jpg).
- **Feuille rose sous le feu (0,3 · 42,5 · 48,5 s)** — la cause n'était pas que `heat` : la lumière ponctuelle signal de `feu.js` (3400 × `fire`) donnait un diffus ET un lobe spéculaire large saumon sur le gris clair (rose même à `heat` 0, p2). Correction dans le shader de la feuille (`foilMaterial`, ourlet compris) : diffus et spéculaire directs ramenés au gris à 88 % (`lights_fragment_end`) ; l'orange revient en reflets doux là où la feuille renvoie le feu (`uFire`, nouvel uniforme interne, normale = 65 % courbe du dôme + 35 % facette) ; `heat` ne rougeoie plus en nappe : `uHeat × smoothstep(0,42 → 0,9, aHeat)` (bout pieds, dessus), et l'argent s'efface de 70 % sous cette lueur pour qu'elle reste signal franc. Vérifié à 0,04 (argent, reflets orange doux, rien de perdu), 42,5 (argent), 48,5 (argent clair, plus de rose), 61 (inchangé) — p6, p7.
- **Pavés roses en gros plan (`shovelClose`)** — le rose a disparu avec la nappe d'émissif. Vérifié sur `shovelClose` à d 260 avec et sans `dof` (p5–p7) : plus de rose ; il reste, à d 260 seulement (pas une pose du film), la mosaïque grise des facettes plates (déjà notée « plaques claires » plus haut). À d 460 (la vraie pose) rien ne se voit à 270 px.
- Non vu sur planche : la lueur franche du bout pieds (aucune pose de vérification ne le cadre de face) — à regarder au brouillon (acte 3, `t.toinside` / `t.reponse`, heat 0,5–0,6).
- API et nombres de l'état inchangés ; `check` passe.
