# 020 · `src/model.js` — journal

Début 04 h 55 (14/10). Budget : 30 images, 45 minutes.

## Ce qui est construit

- **La boule** : une seule géométrie de 41 disques (chant, dessus, dessous), attributs `aPlate` / `aH` / `aCover`. Silhouette en escalier aux pôles, tambour rayé à l'équateur. Joint sombre, filet clair au-dessus / ombré dessous et un gris par plaque dessinés dans le shader avec `fwidth` (fondus en moyenne sous 3 px par plaque). `plates` : déplacement dans le vertex shader (2,4 cm par plaque, la pile grandit vers le haut de 96 cm). Les faces couvertes par la plaque voisine ne sont pas dessinées (`discard`), sauf un bord de 26 cm vu par les fentes.
- Berceau (cuvette tournée), quatre bras et palonniers (où finissent les câbles), tige + manchon.
- Anneau de butée à section octogonale, quatre pieds ; `limit` : flanc signal du côté où va la tige, une barre signal « le jeu qui reste » de la tige à l'anneau, une boule de lumière au point de rencontre ; `datum` : cercle (taille de la tige) + croix, ink.
- Huit vérins : corps sombre debout sur le plancher, tige claire qui descend du berceau — longueur vraie (le fût fait 245, la tige 275 : de 284 à 515 cm sans sortir).
- Huit brins de câble : bande de torons 26 × 16 cm (4 de large, 3 d'épaisseur ; 4 brins de 12 + 4 de 11 = 92), rainures dans le shader ; selles aux attaches.
- Cadre en verre : plancher (un contour, presque pas de verre : vu en rasant c'était une assiette laiteuse), quatre poteaux, ceinture et croix du haut.
- Ce qui monte vers l'en-tête (câbles, selles, verre du cadre, leurs traits) se fond dans le noir entre 395 et 476 px du haut (`gl_FragCoord`, image 1080 × 1920).

## Ce qui a raté, et pourquoi

- Planche 1 : plancher de verre = disque laiteux (une face plane vue en rasant est tout « rim ») → verre presque nul, contour seul.
- Planche 2 : `GAP` 6 cm → la boule devenait un œuf (2,40 m de plus). Revenu à 2,4 cm.
- Planche 2 : `xray` 0,6 → une masse menthe brûlée : les 41 disques pleins à 40 % les uns à travers les autres. D'où `aCover`.
- Planche 2 : `litBall` 1 lavait les strates → dosé à 0,035 + 0,3 sur les joints ; albédo de la boule baissé (0xbec3c8), terrasses × 0,8.
- Vérins : l'émissif uni faisait « peint en vert » → lueur au cœur (face à l'œil, `facing³`).
- Climax : avec `az` −30, la barre du jeu est derrière la tige quand la course est positive. Le film veut la course NÉGATIVE (la boule traîne vers −x, `swing` pair) : le jeu est alors devant.
- En vue de dessus, les câbles passent entre l'œil et la tige : ils s'amincissent avec `xray` (× 0,22 à `xray` 1).

- Planche 3 : un poteau de verre et le V de deux brins passent devant la boule vue de `az` −32 … −40 (`plan.js` met une attache et un poteau sur la diagonale de la caméra). Poteaux amincis (verre presque nul, trait à 0,16) ; le V reste : c'est le plan.
- Ajouté sans image (budget épuisé) : un cœur sombre dans la pile écartée (une fente vue à l'horizontale aurait montré le jour au travers) ; visible seulement si `plates` > 0 et `xray` = 0.

## Chaque nombre de l'état

| nombre | ce qu'il fait ici |
| --- | --- |
| `bench` | verre du cadre entier (1) ou à moitié (0, dans la tour) |
| `course` | boule + berceau + tige : x = course, y = 980 − √(980² − course²), sans tourner ; les brins s'inclinent, les vérins s'allongent / se raccourcissent ; +x = vers la droite de l'image |
| `vel` | dose `brake` : le vérin dont la tête court vers le pied luit (celui qui s'ouvre, un peu) |
| `explode` | vérins en étoile (+150, 0 → 0,45) · cadre et attaches +120 (0,08 → 0,6) · boule +200, berceau et tige +70 (0,2 → 0,78) · brins en éventail (0,4 → 0,92) · anneau −46 et élargi de 85 (0,5 → 1) |
| `plates` | 2,4 cm entre plaques, la pile grandit vers le haut (96 cm) |
| `xray` | boule et berceau en verre (cinq joints restent, en traits) ; les câbles s'amincissent avec lui (× 0,22 à 1) |
| `pull` | tête de lumière veille des palonniers (0) aux attaches (1), ce qu'elle a passé reste allumé |
| `brake` | cœur veille du fût qui se ferme + une lumière à son presse-étoupe |
| `heat` | cœur pâle des fûts, bouffées lentes (période ≈ 16 s) |
| `lock` | colliers veille qui se serrent sur les tiges |
| `limit` | anneau signal du côté où va la tige (∝ (course/150)^1,5), barre signal du jeu qui reste, lumière au point de rencontre (∝ proximité³) |
| `datum` | cercle (taille de la tige) + croix ink au centre de l'anneau |
| `lit…` | boule : joints veille · câbles, vérins, anneau : veille faible |

## Poses (vues sur planche ; `fov` 28, `side` 0)

- **whole** (tout sous l'en-tête) : `{ tx: 0, ty: 640, tz: 0, d: 6300, az: -36, el: 8, shift: 180 }` — vue à `shift` 150 (haut du cadre à 480 px, bord du plancher à 1280) ; 180 dégage les sous-titres, non re-tirée.
- **chute** (resserré, les câbles se fondent sous l'en-tête) : `{ tx: 0, ty: 520, tz: 0, d: 3900, az: -36, el: 8, shift: 170 }`, `litBall` 1.
- **exploded** : `{ tx: 0, ty: 700, tz: 0, d: 7000, az: -36, el: 8, shift: 170 }`, `explode` 1, `plates` 1, `fs` 900 — haut à 453 px, bas ≈ 1280.
- **ball** : `{ tx: 0, ty: 480, tz: 0, d: 2900, az: -32, el: 6, shift: 150 }` ; plaques écartées : `ty` 560, `el` 8.
- **cables** : `{ tx: 0, ty: 860, tz: 0, d: 3300, az: -40, el: -4, shift: 150 }`, `litCables` 1, `pull` 0 → 1.
- **dampersBench** : `{ tx: 40, ty: 170, tz: 100, d: 2100, az: -40, el: 10, shift: 150 }`, `xray` 0,6, `brake` 1, `heat` 0,7.
- **climax, d'en haut** : `{ tx: -40, ty: 130, tz: 0, d: 2100, az: -24, el: 52, shift: 120 }`, `xray` 1, `limit` 1, `datum` 1, course NÉGATIVE (`swing` pair). Dans la tour : `ty: CAGE.at[1] + 130`.
- **ring, trois quarts bas** : `{ tx: -60, ty: 130, tz: 0, d: 1500, az: -30, el: 22, shift: 150 }`, mêmes nombres.
- **swing** : `{ tx: 0, ty: 560, tz: 0, d: 4400, az: -14, el: 5, shift: 170 }`, `datum` 1, `limit` 1, `reach` 100 : `swing` pair → la boule à gauche, l'anneau rouge sous le berceau.
- **couverture** : un instant de l'acte 2 (établi), état `{ explode: 1, plates: 1, litCables: 1, pull: 1, litDampers: 1, litRing: 1, litBall: 0.6, fs: 900 }`, pose `{ tx: 0, ty: 600, tz: 0, d: 8200, az: -36, el: 30, fov: 28, shift: -330 }` : le système entre y ≈ 890 et 1730.

## Pas au niveau

- L'éclaté est complet mais petit (boule ≈ 300 px de large à `d` 7000) et sage : des pièces soulevées plus qu'un éclaté spectaculaire.
- Le V de deux brins devant la boule (voir plus haut). Non essayé : filmer la boule depuis un axe (`az` 0 ou −90), où les brins se rangent de part et d'autre du centre.
- `heat` : la brume est discrète (des bouffées douces) ; `lock` : colliers vus en petit seulement.
- `xray` 0,6 : le bord du berceau en verre est un trait blanc un peu brûlé.
- Dans la tour, vue de dessus (climax), les planchers de verre de `tour.js` lavent les fûts des vérins (une image, pendant que `tour.js` était en chantier).
- Aucun brouillon rendu : le mouvement n'est pas jugé. L'ombre de la pile écartée reste celle de la boule soudée ; l'ombre de l'anneau ne s'élargit pas.

## Images lues

30 (planches de 8, 8, 8, 4 avec en-tête et zones, 2). `npm run check -- 020` passe (62/62).

## À changer ailleurs

- `world.js` → `VIEW` : remplacer par les poses ci-dessus (`whole`, `exploded`, `ball`, `cables`, `dampersBench`, `ring`, `swing`), et `pin: { ...P, tx: -40, ty: CY + 130, tz: 0, d: 2100, az: -24, el: 52, shift: 120 }`. `VIEW.whole` d'origine (`d` 4700) met le haut du cadre derrière l'en-tête : il convient au plan resserré de la chute, pas à « le système entier ».
- Actes : jouer le climax (`limit`, `datum`, `xray`) sur une course NÉGATIVE (`swing` pair) : le jeu qui reste est alors du côté de la caméra.
- `tour.js` : au-dessus de la cage vue d'en haut, garder les planchers de verre faibles (ils voilent les vérins).
