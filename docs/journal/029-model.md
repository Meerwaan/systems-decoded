# 029 — `src/model.js` (le sac airbag) : journal

Agent du système, nuit du 21 au 22/10. Consigne : `docs/029-decors.md`, section `src/model.js`.

## Lu
recette-agents, CLAUDE.md (patte, amateur, net et fluide), 029-decors (haut + ma section), plan.js, world.js, bouchon, build3d, figure.js (torse : épaules y 144–150, profondeur ×0,62), 012/model.js (tube + gaines à barres de lumière, boule de lumière), 004 (tirets `worldUnits`), faits « À ne pas dire ».

## Décisions
- Le sens du tirage : `pull` déplace la poignée de `+pull·HANDLE.pull·HANDLE.dir` (vers le bas et vers l'avant) — c'est ce que fait déjà le bouchon de pente.js (−0,8·12 en y).
- Le sac bouge le harnais avec lui (un seul objet) ; chaque pièce a SES matières (trigger ≠ venturi, zip/renfort du harnais ≠ ceux du sac).
- Le paquet plié est déplacé : `FOLD = { at: [1, 23.3, -10.5], size: [18, 5, 10] }` (à la place de plan.js il traversait le venturi).
- Le ballon : UN tube en fer à cheval (97 anneaux × 28), ligne médiane ≈ 183 cm, tube r 16,5 (≈ 150 L), qui sort du haut du sac derrière la tête, passe à côté d'elle (≥ 18 cm de la tête) et au-dessus, penché en arrière (jamais devant le visage). Se déplie : les bras sortent d'abord, la couronne peu après (décalage 0,28 seulement : à 0,5 les deux bras seuls se lisaient comme DEUX ballons), plat et froissé puis tendu. Tissu enduit éclairé : ombrage, quatre coutures en long + une tous les 22 cm (dans le shader, fondues sous le pixel), liseré.
- Le rabat s'ouvre vers l'arrière (charnière sur l'arête haute extérieure), 118°, sur bag 0 → 0,09 (« saute »).
- Flux : gaz veille sur le tuyau sombre, période 2,4 cm à 9 cm/s (1/8 de période par image) ; air ink, douze courants sur conducteurs sombres, période 2 cm à 6,6 cm/s (1/9). `sheathMaterial` refuse (throw) une vitesse > 1/7 de période par image.
- La cartouche : `finish` coupé sur elle (les anneaux d'usinage la faisaient lire « bouteille rainurée »).

## Planches (30 images lues, budget épuisé)
1. Établi, 8 : sac entier ✓ ; éclaté ✓ lisible mais trop petit dans le cadre ; poignée ✓ (tirée : sort du cadre) ; cartouche percée ✓ (étincelle dans la fenêtre du déclencheur) ; **venturi ✓✓** (les douze courants convergent, le gaz traverse) ; paquet plié ✓ ; ballon plein ✓ (il entrait dans l'en-tête).
2. Pente (bouchon de pente.js), 8 : promesse ✓ (contour veille autour de la tête) ; poignée à HANDOFF ✓ ; `behind` et `section` : le bouchon met le personnage hors de ces poses → rien à juger.
3. Gonflage, 8 images à 1/30 s (bag 0,02 → 0,28, debout, de dos, seethru 1) : aucune image qui saute ; rabat qui saute, paquet qui se consume, ballon froissé qui sort. Pas de surfaces confondues visibles.
4. Contrôle, 6 (avec en-tête) : éclaté sous « Système Décodé » ✓ ; ballon à 0,55 et 0,8 : silhouette trop « chou-fleur » et deux lobes à 0,55 → corrigé après (froissé 0,1 → 0,06, décalage couronne 0,5 → 0,28, bouts moins effilés) **sans nouvelle planche**.

## Poses (établi ; positions à explode 1 : poignée (−1, 4, 37), cartouche (−6, 27, 34), opercule (−6, 41, 34), venturi (−6, 59, 34), paquet (−3, 77, 31))
- whole (inchangée) ✓ ; cartBench `{ ...P, ...CLOSE, tx: -6, ty: 38, tz: 34, d: 80, az: -40, el: 12, shift: 120 }` ✓ ; venturiBench `{ ...P, ...CLOSE, tx: -6, ty: 58, tz: 34, d: 70, az: -40, el: 14, shift: 120 }` ✓ ; bagBench `{ ...P, ...CLOSE, tx: -3, ty: 77, tz: 31, d: 90, az: -30, el: 18, shift: 120 }` ✓.
- exploded (non vérifiée, plus serrée que la vérifiée) `{ ...P, tx: -3, ty: 40, tz: 18, d: 250, az: -24, el: 14, fov: 30, shift: 60 }`.
- handleBench (éclaté, qui garde la poignée tirée : elle part de 9,6 cm vers le bas, 7 vers l'avant) `{ ...P, ...CLOSE, tx: -1, ty: 2, tz: 40, d: 95, az: 20, el: 14, shift: 80 }` (non vérifiée).
- bagFull (non vérifiée ; à ty 62 / d 330 le ballon entrait dans l'en-tête) `{ ...P, tx: 0, ty: 70, tz: -5, d: 390, az: -30, el: 14, fov: 30, shift: 40 }`.

## Pas encore au niveau
- Les dernières retouches du ballon (froissé, décalage, bouts) n'ont pas été revues sur planche.
- `section`, `behind`, `strap` sur le vrai personnage : à juger par celui qui orchestre (le bouchon ne s'y trouve pas).
- Sous la lumière signal (`mood` 1), la cartouche claire vire au brun.
- Le déclencheur en coupe est petit : il se lit sur `cartBench`, pas plus large.
- POSE0 : la promesse monte ≈ 45 cm au-dessus de la tête → dans l'en-tête sur la pose du bouchon.

## À changer ailleurs
- `plan.js` : `folded: { at: [1, 23.3, -10.5], size: [18, 5, 10] },` (BAG.folded, pour que VIEW.bagBench vise juste).
- `world.js` : les poses ci-dessus (cartBench, venturiBench, bagBench, exploded, handleBench, bagFull).
- `pente.js` : la main suit la poignée de `+pull · HANDLE.pull · HANDLE.dir` (x +0,15, y −0,8, z +0,58), pas seulement −0,8 en y.
