# 037 · ciel.js — journal du décor

Agent décor, 04/11. Contrat : `docs/037-decors.md` § ciel.js. API gardée : `buildSky()` → `{ group, A: { ground, field }, update(p, time, px) }`.

## Ce qui est construit
- Dôme à l'infini recopié du 026 (`domeMat`) : noir, bande d'air pâle, fine ligne d'horizon à la vraie dépression (courbure de la Terre : rayon qui manque le sol = ciel).
- Campagne en damier dans le dôme : blocs de parcelles (Voronoï, chacun tourné), bandes de champs (100–200 m × 120–340 m), quatre valeurs d'ink (bois le plus sombre, labours en vague douce), haies fines, trois familles de routes sinueuses, villages et fermes en points, brume. Tout trait ≥ 1,5 px et plus pâle quand il s'élargit ; détail fondu par `fwidth`.
- Champ d'atterrissage (HOME x −120…28 m, z −90…110 m) dessiné exprès : labouré selon z, haie sur x = +28 m.
- `strata` dans le dôme : nappes à hauteur fixe (140 m d'écart en haut, 40 m en bas), 1,6 km de rayon, grains + bord.
- Traînées d'air (makeStreaks du 026) : longueur = vz, course = alt ; fondues si la caméra est à plus de 60 m.
- `gate` : vraie nappe à 225 m (GATE.r), grille veille 12 m / 60 m, bord lumineux, respire lentement (`time`).
- Près du sol (alt < 60 m) : herbe du matin (touffes basses côté caméras), clôture x = 26,2 m, haie x = 28,5 m et deux arbres, ombre de contact sous le sac (alt < 1,5 m).

## Planches
- p1 : damier lisible en dive ; under trop noir sous l'horizon ; strata = pois trop gros ; gate = sol vert trop plein ; herbe trop dense (étoiles blanches).
- p2 : ground 4000 = damier très fin, « très haut » immédiat ; ground 300 : route et champs ; landed : sillons + herbe + haie/clôture/arbres (dans la zone HUD avec cette pose).
- p3 : brume plus claire, champs gardés en bandes vers l'horizon (`fa` = moyenne géométrique de fwidth), fermes jittées, nappes 2,4 km de rayon (bords en courbes de niveau, serrés vers le bas), halo du matin sous le sac à alt 0 (sujet sombre sur halo).
- p4 (diagnostic) : `under` paraît noir sous l'horizon parce que la pose ne montre que 1,2° à 14° sous l'horizon et que le bas est sous la zone TikTok — pas un bug.
- p5 (avec HUD) : tout se lit à 270 px. Dernier défaut corrigé sans planche : en `cross`, une ligne de 60 m de la grille vue à 1,6 m faisait une bande verte → traits de la grille plafonnés à 3 px.
- 30 images lues. `check` passe. 8–9 ms par image (look).

## Poses
- `VIEW.dive`, `side`, `gateWide`, `cross`, `ground`, `landed` de l'architecte cadrent bien le ciel tels quels.
- `under` : la campagne n'occupe que le bas (sous la zone TikTok) ; pour la voir fuir, `el: -6, shift: -120` (non tiré).
- `landed` : haie, clôture et arbres tombent dans l'en-tête ; si on veut les voir, `el: 26, d: 1500` (non tiré).
- Le damier dit « très haut » le mieux à `alt` ≥ 2 000 (ground 4000 : parfait) ; à 1 350, champs de 100–340 m = 5 à 8 par largeur de cadre.

## Ce qui n'est pas au niveau
- `strata` : lisible (courbes de niveau + grains) mais abstrait ; le resserrement vers le bas se lit mieux à `alt` 2 000 qu'à 900.
- `mood` est lu mais ne fait rien chez moi.
- Herbe du matin : touffes en traits, un peu « pousses blanches » vues de loin.

## À changer ailleurs
- `world.js`, dans `apply()` : `sky.update({ alt: S.alt, vz: S.vz, sky: S.sky, threat: S.threat, strata: S.strata, gate: S.gate, mood: S.mood }, time, px);` → `sky.update(S, time, px);` (mêmes noms ; plus d'objet alloué seize fois par image). Même remarque pour `system.update({...})` et `diver.update({...})` (objets réutilisables).
