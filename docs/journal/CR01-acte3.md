# CR01 · acte3.js — journal (agent acte, 05/11)

Lu : recette-agents, recette-actes, regles-image, CR01-actes (haut + § acte3), CR01-actes-maj (V3), world.js, main.js, index.html (étiquettes), direct.js (API), journaux canal / coeur / da-v3 / etat. Planches : `.cache/planches/CR01/acte3/` (p1 → p4, sondes numériques `probe*.mjs`).

## Monté (tocanal 86,54 → toissue 112,28), sur les vrais instants (`beat:mot` vérifiés sur gen/episode.data.js)
1. **Plan maître, canal, sans coupe** (86,54 → 95,34) : coupe en gros plan sur le pied du déplaceur au-dessus de l'eau du bas (`ok` 0, `fault` 0, `flux` 1, `steam` 0,6, p 0,45) ; « graphite » 86,76 → `fault` 1 (rouge) + cercle `feutre-graphite` (86,82 → 87,60) ; « sous la partie qui freine » : recul par rapport jusqu'à la tranche entière (d 940), `ok` 1 sur « freine » (l'absorbant vert) ; « En entrant… chasse l'eau du bas » : `rod` 0 → 0,18 de « entrant » à « bas » ; « l'eau qui avalait les neutrons » : plongée par rapport vers le bas (d 400), les neutrons passent ; « Alors… le frein accélère » : recul vers la tranche, `pLow` → 1 (power2.in), `pHigh` → 0,08, `punch` sur « accélère ».
2. **t7, cœur** (95,34) : contre-plongée sur le bas rouge (angle de l'image 0, plus près ; `ok` 1 : barres vertes) ; `chip-530` de 97,30 à 99,90 ; « en flèche » `pLow` 1 / `pHigh` 0,9 (power3.in) + `punch` ; « surchauffe » : recul, `scram` 0,15 → 0,4 en linéaire, **arrêt net sur « bloquent »** + `jolt` 0,5, `ok` → 0 (le vert des barres meurt).
3. **t8, cœur large** (102,64) : `blast` 0,6 sur « éclatent », 1 sur « explose » ; rapproché vers la dalle (« un disque géant ») ; « se soulève » : `slab` 1 (power2.out), la caméra monte avec (recul par rapport) ; `blast2` dès « explosion » (110,04), `fire` de « graphite » à « feu » + 0,4.

## Rendu à fin.js (toissue)
cœur, `fault` 1, `ok` 0, `pLow` 1, `pHigh` 0,9, `rodsIn` 0,25, `scram` 0,4, `blast` 1, `slab` 1, `blast2` ≈ 1, `fire` 1 ; caméra `{ coeur [10,185,0], d 1210, az −58, el 14, shift 150 }`.

## Ce qui a raté, et la correction
- p1/p3 : t7 tout noir. Cause (sondée sans image, `probe.mjs`) : mon dernier `shot` du canal partait à `accelere + 0,85` = 95,37, APRÈS la coupe de `tot7` (95,34), avec une durée négative → il ramenait la caméra dans le canal. Corrigé (il part à `accelere − 0,1`, finit à `tot7 − 0,02`). Le `dof` n'y était pour rien.
- p2 : `VIEW.slab` mettait le cœur sous les sous-titres (1320–1680) → cible y 85, shift 150, el 12 ; après la dalle, cible y 185, d 1180.
- p3 : tranche entière sous l'en-tête (absorbant caché) → d 940, shift 100.
- p4 : en t7 le cœur débordait dans la colonne des boutons → d 350, side 170 (non revu à l'image : budget épuisé ; rendu non noir vérifié par sonde).

## Un cran en dessous (dit franchement)
- 89,3 → 95,3 : la tranche entière ne fait que ≈ 40 % de la largeur (la hauteur l'interdit), et « le haut freine, le bas brûle » se lit mais faiblement à 270 px (repère `accelere2`).
- 86,54 → 87,9 : le gros plan est une façade de blocs (lecture « carrelée »), le rouge sauve la lecture.
- 109–112 : après la dalle, le cœur fait ≈ 30 % de la largeur, son bas passe sous les sous-titres.
- t7 recadré (d 350, side 170) pas relu à l'œil.

## À changer ailleurs
- `episodes/CR01-tchernobyl/src/main.js` : supprimer la ligne `feutre(D, { id: "feutre-defaut", … });` — acte3.js pose son cercle (`feutre-graphite`) sur « graphite », taillé pour le gros plan ; celui de main.js démarre à `defaut + 0,8` = 85,48 (dans le plan cœur de l'acte 2b, ancré sur le canal invisible) et double le mien jusqu'à 95,1 (vu sur p1, p3).
- (suggestion kit) `kit/lib/direct.js`, dans `commit`, avant `shots.sort` : `shots.forEach((s) => { if (!s.cut && !(s.dur > 0)) console.warn(\`[direct] shot à ${s.at.toFixed(2)} s de durée ${s.dur} : il écrase la coupe qui le précède\`); });`

## Images lues
26 (p1 8, p2 8, p3 8, p4 2). Sondes numériques (luminance, rouge par bande) sans lecture d'image.

## Retouche du 05/11 (retoucheur)
- **Heurté 88,3 s** (recul 290 → 940 en 1,5 s) → coupe dans l'axe `cut(reveal, null, SLICE, lit(... 120))` à `freine − 0,15` = 88,01 (la lumière monte avec la coupe), puis poussée lente SLICE → SLICE_IN jusqu'à `bas + 0,05`. L'absorbant est dans le cadre quand il verdit sur « freine ». Vérifié à 87,97 / 88,01 / 88,40 / 89,60.
- **Heurté 91,8 s** (plongée 900 → 400 en 1,47 s sur « avalait ») → la plongée part à `bas + 0,05` = 90,33 (fin du `rod`), 2,16 s, `sine.inOut` par rapport ; la lumière descend sur la même durée. Vérifié à 90,30 / 90,90 / 91,50 / 92,00 / 92,50.
- **Entrée depuis acte2b** (poussée linéaire jusqu'au pied) → la poussée FOOT → FOOT_IN (d 278 au lieu de 290) en `power1.out` : elle part à la vitesse de la poussée de l'acte 2b (≈ 0,2 /s en rapport) et se pose. Même place du pied à 86,50 / 86,54 / 86,57 ; la forme change (manchon cuivré → bloc du canal), raccord de place, pas de saut.
- **86,5–95 s (déplaceur sans vert, bouffées)** : le déplaceur reste rouge, seul l'absorbant verdit ; aucune image fautive sur les 16 instants. Les bouffées (points sombres dans les colonnes d'eau) se lisent peu à 270 px — à juger en mouvement sur le prochain brouillon.
- **t7 recadré** : à d 350 / side 170 le cœur touchait la colonne des boutons (bord droit ≈ 990 px entre y 880 et 1140) → BOT side 240, BOT_IN d 335, RODS garde side 170. Bord droit ≈ 920 px, rien dans la zone dessinée. Vérifié à 95,40 / 97,60 / 99,30 / 100,80 / 101,70.
- `npm run check -- CR01` passe. Images lues : 4 (a, b, c, c2 dans `.cache/planches/CR01/acte3-retouche/`).
