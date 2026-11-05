# 039 · batiment.js — journal

## Fait
- Réécrit en entier (enveloppe du 005 sans le modifier, sous-sol aux rayons X, annonce du 040).
- 005 lu : avec `fall` 1, `uFront` = 36 − 366 = −330 → le combustible n'est allumé que sur ses 30 cm du bas : **noir**. Choix : grappes descendues (`fall` 1, l'arrêt d'urgence a eu lieu) et `uFront` repoussé à 1e4 après chaque `update` : le cœur luit sur toute sa hauteur (la chaleur résiduelle).
- Verre du 005 : shader patché sur CETTE instance (fondu de hauteur, repère du 005 300 → 637) ; ses traits reçoivent une couleur par sommet qui fond pareil. Calotte inférieure : 4 parallèles + 12 méridiens à r + 5 (hors de la peau rouge de corium.js à r + 3), méridiens prolongés sur la virole.
- Sous-sol : bloc carré de la fosse (demi-largeur 512, du radier −560 au bord 1100, alésage r 362 vitré au-dessus du revêtement), tunnel du canal (traits), salle de la chambre (4 murs de verre, ni plafond ni sol ; arêtes, 4 poutres), enceinte en ARC derrière (azimut 65° → 295°, centrée sur −z : jamais entre la caméra habituelle et l'usine), qui fond au-dessus de BASEMENT.fade ; grille de sol en shader (cellule 1 m, majeures 5 m), pas de dalle. Verre en `asShell` ordre 30 (le plus extérieur : tout le reste se dessine avant et se voit).
- Annonce du 040 : 8 abris pleins (alu, 2,1 × 0,8 × 0,4 m) en grappe, front de feu irrégulier (rayon qui ondule avec l'azimut, pas un brûleur), langues lentes en shader, sol qui rougeoie, 320 braises, lumière du feu derrière les abris (PointLight decay 0, portée 42 m, toujours là, intensité 0 hors annonce).
- Planche 1 : le cœur à `glow` 2,4·core était un mur orange plat de près, et les tiges de commande éclairées par-dessous faisaient une brosse blanche sous l'en-tête → `glow` 1,6·core, `uUnder` × 0,3. Le feu en cercle parfait = un brûleur de gazinière → front ondulé.
- Planche 2 : à 5,19 s ce qui passe sous l'en-tête est la **peau rouge du ventre (corium.js)** pendant le mouvement de l'acte 1, pas le verre du 005. `chamberLow` d'origine met le haut du cœur sous l'en-tête → pose B ci-dessous.
- Planche 3 : POSE0 sans ventre : la calotte lit comme un dôme (parallèles + méridiens). `pitSide` : le revêtement plein de model.js cache le bain (pose ou découpe : à model.js). L'éclaté : la cuve soulevée de 700 frôle l'en-tête, en verre pâle (faible) — cadrage à régler avec SPREAD de model.js.
- `npm run check -- 039` passe (3 ⚠ contraste à 5,19 s : le ventre de corium.js, voir plus haut).

## Poses
- `VIEW.teaser` : `{ ...P, tx: TX, ty: 0, tz: TZ, d: 5600, az: -20, el: 34, fov: 36, shift: -20 }` — le cercle (teaser 1) entre y ≈ 800 et 1260, les abris 930–1100, sous le panneau `#next`.
- `VIEW.chamberLow` B : `{ ...P, tx: 0, ty: 420, tz: 400, d: 3300, az: -14, el: 8, fov: 40, shift: -60 }` — le cœur rouge sort de dessous l'en-tête (≈ 560–960).
- `POSE0` : la calotte et sa cage lisibles ; avec `belly` 0,85, c'est la peau de corium.js qui fait l'image.

## À changer ailleurs
- `world.js`, VIEW : `teaser: { ...P, tx: TX, ty: 0, tz: TZ, d: 5600, az: -20, el: 34, fov: 36, shift: -20 },`
- `world.js`, VIEW : `chamberLow: { ...P, tx: 0, ty: 420, tz: 400, d: 3300, az: -14, el: 8, fov: 40, shift: -60 },` (si l'acte 1 la garde ; c'est aussi la candidate c de la première image)
- `fin.js` : le cercle se referme si `teaser` monte pendant le plan : `cut(t.abo - 0.12, SET.PLANT, VIEW.teaser, { ...STAGED, teaser: 0.3, mood: 1 });` puis `tl.to(S, { teaser: 1, duration: t.toloop - t.abo, ease: "sine.out" }, t.abo);` (à 0,3 le front déborde du cadre, à 1 il tient dedans).
- Contraste à 5,19 s : la peau du ventre (corium.js) sous l'en-tête pendant le mouvement de l'acte 1 → à l'acte 1 (pose de passage plus basse) ou à corium.js (peau qui s'éteint vers le haut).

Images lues : 18 (planches de 8, 4, 6).
