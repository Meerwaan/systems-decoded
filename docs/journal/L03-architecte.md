# L03 · journal de l'architecte (2026-10-22)

**Fait** : `src/plan.js` (trois avions à l'échelle — A350, A380, 737-200 —, leurs portes, `OPEN` par site, la piste, le Dash 8, l'approche ; la cabine en deux aménagements ; l'établi, le paquet, le siège, les sept documents), `src/world.js` (SET PISTE / CABINE / BENCH, `FIRST` fermé et commenté, `AT`, `benchLight`, `VIEW` posées sur bouchons, `HAND` c12 → c56, `benchFromCabin`, `PACK_IN_DOOR`, `runAt`, `CHRONO_HUD`, `apply`), `src/main.js` (l'en-tête : étape + chrono), `src/chapters.js`, les bouchons `avion.js`, `cabine.js`, `model.js`, `habillage.js` (vraies interfaces), six chapitres bouchons qui tiennent les coutures et la boucle. `index.html` : en-tête « Dossier L03 · Évacuation », lecture « Chrono ». `docs/L03-decors.md`, `docs/L03-actes.md`.

**Contrôle** : `npm run check -- L03` passe (lint 0, contrastes 33/33, aucun avertissement « la dernière image n'est pas la première »). Planche `look` de huit essais sur les bouchons (`scratchpad/L03/controle.jpg`) : les trois lieux, les trois variantes, l'éclaté, le paquet dans la porte se construisent. 1 image lue.

**Choix** :
- L'avion reste à x = 0, le monde vient à lui (`run`, `alt`) comme au 023 ; `runAt(D, t)` fait toucher le Dash 8 SUR « percutent ».
- Les portes s'ouvrent par groupes définis par site (`doorA/B/C` + `OPEN`) plutôt qu'un nombre par porte : la liste de `FIRST` reste courte.
- Le chrono de l'en-tête : courant ≥ 0 (encre), arrêté = négatif (veille ≤ 90 s, signal au-delà), « < 20 min » à −1 200.
- `explode` 1 → 2 = le banc de démonstration du gonflage (pas de nombre de plus).
- Le paquet du toboggan est re-parenté dans la porte (`cabine.A.bustle`, tourné de 180°) : le raccord « on l'ouvre » se calcule (`benchFromCabin`).
- Six groupes : c1 0 → 49,84 · c2 → 161,59 · c3 → 272,06 · c4 → 361,82 · c5 → 435,05 · c6 → 534,27 (coutures sous les cartes).

**Flou / à trancher par l'orchestrateur** :
- La première image : `hook1` (la cabine du plancher, provisoire) contre `hook2` / `hook3` (dehors, Haneda) et `hook4`.
- La miniature 1 (`thumb`, à 85,4 s) : son cartouche dit « Dans le noir · ½ des portes » mais l'instant montre UN toboggan au poste de stationnement ; lui donner `state: { site: 1, doorA: 1, shut: 1 }` dans `episode.json` (non touché ici).
- Le mot de l'en-tête reste « Étape » (demande) alors que les étapes sont des sujets (« Le toboggan »… « Le siège 16 g ») ; à Tokyo et à la fin l'en-tête revient à « Évacuation » (step 0) : `lineHud` ne sait pas allumer les cinq repères « faits » sans afficher une étape.
- Les portes ouvertes au hangar (le côté gauche) et celles de l'A380 à Hambourg ne sont pas sourcées : c'est une reconstitution, jamais dite.

**À changer ailleurs** : rien d'obligatoire dans le kit. Souhaitable : une option de `lineHud` pour « toutes les étapes faites » (repères allumés, libellé libre).

## Intégration des décors (22/10, reprise)

- `world.js` : `FIRST.run` et `plan.js · DASH` décrivent le Dash 8 à `DASH.x + run − 2·DASH.hit` (devant le nez) ; `VIEW` reprend les poses vues des trois journaux (cabine : `aisleLow`, `section` sous 1,20 m, `bustle`, `lever`, `sill`, `you`, `bag`, `crewFront`, `hatch`, `passage` + `thumbBag`, `thumbSmoke`, `speaker`, `doll`, `exit`, `doorOpen`, `crowdOut`, `fireIn`, `hatchHole` ; avion : `thumbSlide`, `slideProfile`, `dash`, `wreck` ; établi : `exploded`, `asp`, `tube`, `sled`, `dummy` + `secret`, `girt`, `rig`, `bottle`, `leak`, `thumbAir`) ; `benchLight(SEAT).fz` 25 ; candidates `hook1` à `hook6`.
- `episode.json` : `thumb` / `thumb2` / `thumb3` ont une pose complète et leur `state` (hangar · cabine sous la fumée · le sac pendu à ta main).
- CONFLIT `A.sill` tranché : z 232 (cabine.js inchangé) ; `model.js` (une ligne + deux constantes) fait tomber la barre armée DANS les ferrures (`GIRT_SEAT` 7,5 cm au-dessus du plancher).
- `docs/L03-actes.md` : règles communes des décors (allée < 40 cm/s, caméra sous 1,20 m quand `smoke` ≥ 1, jamais à moins d'1 m d'une tête de verre, 1L / 1R, `bridge` > 0,5 désarme, `gulp` ramené à 0, une feuille à la fois, `thump` avant le feu, `grid: 0` sous le traîneau qui file vers −x), et un « à contourner » par plan concerné.
- Planches lues : `integ.jpg` (2), `candidates.jpg` (6). La crête de coque de `thumbSlide` reste sous l'en-tête (≈ 225 px).
