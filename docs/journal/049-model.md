# 049 · model.js — le téléphone (journal du décor)

## Ce qui est construit
- Téléphone sans marque (7,2 × 15 × 0,8), cinq couches à matières propres : `screen` (verre noir laqué + écran), `frame` (bande alu, boutons, port, haut-parleur), `board` (carte gris foncé autour de l'encoche photo, blindage, semis de composants fusionné, **puce** la plus claire, **antenne** en L près du bord haut + sa ligne d'alimentation jusqu'à la puce, **quartz** : boîtier ouvert et lame en diapason qui luit), `battery` (sachet gris moyen), `back` (dos sombre laqué, îlot photo deux objectifs, sans logo).
- Écran : deux canevas dessinés UNE fois (route seule ; reste de la carte : T, champ hachuré, fossé en tirets, chemins), fenêtrés par `texture.offset` selon `eta` → le T descend vers toi sans redessin (fenêtre valable de `eta` 0 à ≈ 15). Point bleu #3B8CFF (seul bleu, sur le point seulement) + halo de précision en maillages ; `err` 1 les pose dans le champ, le halo s'élargit.
- `strike` : trait signal en diagonale (haut-gauche → bas-droite), qui pousse avec `strike` et s'éteint avec `map`. `map` 0 : restent la route, le point et l'heure `23:41:SS,ssssss` sur sa carte sombre (une chaîne par image : `Math.round(time·30)`, pas de fantômes dans l'obturateur).
- `peek` : dos, cadre, verre → jumeaux de verre (`glass` + `asShell`, traits 1,8 px) ; batterie à 25 % ; carte, puce, antenne, quartz pleins.
- `explode` : rangée en travers d'une caméra à az ≈ −40/−48 (pas +3,4 x et +3,4 z par couche, fenêtres décalées de l'extérieur vers l'intérieur) ; la carte au milieu ; puce (+1,5), antenne et quartz (+0,8) se soulèvent à partir de k 0,45.
- Quartz : `qBeat` (fraction) = une lueur qui monte vite et retombe (sin² sur 60 % du battement, puis repos), jamais un clignotement ; `tremble` secoue la lame et écarte les dents ; `quartz` veille → signal par smoothstep 0,35–0,65 (franc).
- Établi : le corps descend de 1,5 (bas du téléphone sur le sol, BENCH.phone y 9).

## Ratés et corrections
- p1 : route et T trop larges et trop clairs (un « T » de lettre) → route 13 % de large, gris moyen bords clairs ; champ plus visible. Heure fantôme (16 instants = 16 chaînes) → arrondie à l'image + carte sombre derrière les chiffres. Arête du cadre qui brûlait en vert sur l'établi → alu `rough` 0,55 `metal` 0,3.
- Quartz trop lumineux en vert (bloc de lumière) → lame plus petite, lueur dosée ; reste un peu gros en vert sur l'établi en gros plan (voir « pas au niveau »).
- Pose `exploded` de l'architecte (d 64) coupe la rangée → d 100.

## Poses qui cadrent (essais p2–p5)
- hook = POSE0 tel quel : écran lisible, point qui saute dans le champ (err 0 → 1).
- exploded : `{ ...P, tx: 1.5, ty: 8, tz: 0, d: 100, az: -40, el: 20, fov: 30, shift: 80 }` (toute la rangée, la carte au centre).
- chip (puce + antenne + quartz, `explode` 1, `litChip` 1) : `{ ...P, ...CLOSE, tx: 1.4, ty: 11.5, tz: 0.8, d: 24, az: -60, el: 22, fov: 30, shift: 0 }` — az −60 : le cadre ne passe plus devant la puce.
- quartzBench (**exige `explode` 1** : sur l'établi `peek` est forcé à 0, l'écran cache la carte) : `{ ...P, ...CLOSE, tx: -1.6, ty: 9.5, tz: 0.8, d: 18, az: -40, el: 20, fov: 30, shift: 100 }`.
- bench, plus serré : `{ ...P, tx: 0, ty: 9, tz: 0, d: 52, az: -34, el: 10, fov: 30, shift: 120 }`.
- quartzCar, phone : celles de `VIEW` marchent (quartz rouge lisible à travers le verre).
- chute : `{ ...P, tx: 6, ty: 106, tz: -66, d: 30, az: 20, el: 4, fov: 34, shift: 40 }` (trait puis heure).

## Pas encore au niveau
- Dans l'éclaté large, la puce fait ≈ 10 px à 270 px : elle se lit au plan `chip`, pas dans la rangée.
- Le quartz vert en gros plan sur l'établi reste un bloc lumineux un peu gros (le boîtier se devine) ; le rouge dans la voiture est net.
- Reflet orange/blanc au coin haut-droit du téléphone dans le crochet : lumière d'ambiance signal sur l'alu (pas vérifié d'où exactement).

## À changer ailleurs (world.js → VIEW)
- `exploded: { ...P, tx: 1.5, ty: 8, tz: 0, d: 100, az: -40, el: 20, fov: 30, shift: 80 },`
- `chip: { ...P, ...CLOSE, tx: 1.4, ty: 11.5, tz: 0.8, d: 24, az: -60, el: 22, fov: 30, shift: 0 },`
- `quartzBench: { ...P, ...CLOSE, tx: -1.6, ty: 9.5, tz: 0.8, d: 18, az: -40, el: 20, fov: 30, shift: 100 },` (+ dans `docs/049-actes.md` : ce plan se tient avec `explode` 1)
