# 028 — ce que les décors ont changé (à lire avec `docs/028-actes.md`)

**Première image choisie (planches de deux fois quatre candidates)** : (a) avec `shift` 120 — `POSE0` dans `world.js`. Toi endormi au premier plan, la chaudière qui rougeoie derrière ta tête, les rubans de gaz qui avancent dès l'image 0, le détecteur au mur du fond. Défaut connu : le détecteur n'y fait que ≈ 20 px à 270 px de large → l'acte 1 doit s'en approcher tôt (la poussée de la première seconde peut aller vers ta tête et le gaz, puis le détecteur prend sa place sur « ton détecteur… ne dit rien »). Le lavis orange de fond est voulu (mood 1) mais ne doit jamais tourner au kaki : gel ≤ 0,3, mood franc.

**Poses ajoutées ou changées** (déjà dans `world.js`) :
- `VIEW.exploded` `{ tx: -5, ty: BENCHAT[1], tz: ROW.z, d: 265, az: -32, el: 20, fov: 30, shift: 40 }` ; `VIEW.electrode` `{ ...CLOSE, tx: -3, tz: ROW.z + 2, d: 70, az: -28, el: 12, fov: 28, shift: 60 }`.
- `VIEW.window` `{ tx: 165, ty: 130, tz: -30, d: 330, az: -48, el: 4, fov: 36, shift: 120 }` (l'ancienne te laissait hors cadre).
- « Tu ouvres les yeux » : `{ tx: -55, ty: 105, tz: -55, d: 320, az: -62, el: 8, fov: 36, shift: 120 }`.
- Cadrent bien tels quels : `VIEW.boiler`, `house`, `kids`, `smoke`, `outside`, `system`, `wall`, `whole`, `puce`, `blood`.
- Le halo de l'établi s'élargit avec `explode` (dans `apply`). Les lumières du détecteur sont dessinées au-dessus de la brume (`renderOrder` relevé dans `model.js`).

**Points faibles à contourner** (ne pas les filmer en plan serré ni longtemps) :
- `VIEW.pillow` ne met pas le détecteur dans le cadre : l'alarme vue du lit est à trouver (une planche de quatre poses, par l'acte 3).
- Le battant ouvert de la fenêtre se lit mal et les rubans d'air dominent : régler `air` plus bas pendant que la fenêtre s'ouvre, cadrer ta main sur la poignée.
- Les souffles dehors (`breath`) n'ont pas été revus en image : à vérifier à la première planche de l'acte 3 / fin.
- L'anneau de la douleur (`ache`) ne se voit presque pas à 405 px : la phrase « Mal de tête… » doit être portée par un cadre serré sur ta tête, pas par un plan large.
- Dans la rangée de l'éclaté, les pièces lointaines font 110 à 150 px ; la pile est la plus faible. Chaque pièce nommée a son plan ou un `lit*` qui la désigne.
- Entre `current` 0,3 et 1, la différence est modeste : la « proportionnalité » se montre en contraste franc (0,2 puis 1), et l'anneau de dose qui se remplit.
- `finish` est coupé sur les matières du détecteur (il striait la façade).

**Exigences de Merwan pour ce film** : zéro image parasite ni scintillement au `qa` (CLAUDE.md, « Net et fluide ») ; un quart de tour en une seconde = une coupe ; aucun son de `sfx` sur un mot ; la voix n'est pas touchée.
