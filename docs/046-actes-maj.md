# 046 — ce que les décors ont changé (à lire avant d'écrire un acte)

- **POSE0 choisi** (planches .cache/planches/046/image0*.jpg) : `{ tx -750, ty 1950, d 3300, az 100, el -22, fov 50, shift 0 }` — sous la cheminée, face au crépuscule ; bout et pilotes verts en haut, colonnes rouges derrière le pied. La (a) à az 156 laissait les colonnes hors cadre. À `flare` ≥ 0,8 la flamme touche l'en-tête : l'acte 1 garde la flamme sous 0,8 tant que la caméra est là, ou monte la caméra.
- **Poses changées dans world.js** : `VIEW.drum` (d 3000, az −38), `VIEW.seal` (d 1300, ty 250), `VIEW.compressor` (az +25, d 2400 : moteur et étincelle dans le cadre), `VIEW.flare` (toute l'usine sous la flamme, az −62, d 9000), `VIEW.washerArm` (sous le bras, el −84, d 30 : le moyeu éclipse le halo, la rotation se lit — raccord de la boucle).
- **« Il bulle dans la garde »** : ouvrir la garde (`section` ≈ 0,8), sinon les bulles sont dans le corps plein.
- **Aucune pose ne cadre les trois soupapes ensemble** depuis −x (derrière les colonnes) : essayer `az` ≈ +45.
- **flamme.js** : `smoke` ne s'éteint pas avec la flamme — à l'extinction, baisser `smoke` sur 1 à 2 s. `raw` règle quantité et portée du gaz cru (à 0,35 un tiers du chemin). Le gaz cru de près ressemble à de la vapeur, la pluie de feu à des étincelles : plutôt en plan moyen.
- **raffinerie.js** : `blast` 0 → 1 = toute la vie du fantôme d'explosion (la colonne du milieu disparaît pendant) ; `arm` en degrés, croissant = sens trigonométrique vu de dessus.
- **model.js** : `explode` écarte soupapes (+160) et bout (+140) seulement ; ballon et garde restent en place.
- Sur `VIEW.tip`, la buse du pilote remplit le premier plan : reculer un peu (d ≈ 650) si le bout dépasse 45 % de la largeur.
