# 047 · `src/habillage.js` — journal du décorateur

Consigne : habiller la machine aux rayons X (`cuve.js`) et la cuisine de nuit autour d'elle ; la cuisine du 009 garde son habillage. Première image `POSE0` (« A sous le panier ») : rien qui la charge. Jamais d'eau qui remplit la cuve. Branché dans `main.js` comme le demandait la consigne (pas dans le décor).

## Lu
recette-decorateur, recette-agents (cadre, première image, économie), regles-image, 047-actes (haut, acte 1, fin, candidates), world.js, plan.js (exports), journaux cuve et cuisine, details.js (tête et briques utiles), atmo `makePool` / `makeMotes`.

## Planche avant (`.cache/planches/047/habillage/avant.png`)
POSE0 propre (ne pas toucher). Le panier du haut est un grand vide sur tous les plans de la machine (D, porte, cuve, coupe). La cuisine « allumée » (porte, 10,2 s) et « éteinte » (12,2 s) ne se distinguent que par le verre : « tu vas dormir » n'a pas d'image. La cuve en coupe : fond noir sans air.

## Touches posées
1. **La charge de la nuit** : six verres et deux bols retournés dans le panier du haut (verre `quietGlass`, contour 1,8 px). Un éco tourne à pleine charge : le plat n'est pas seul. Suit `shell` × l'élévation de la caméra (disparaît sous −10°, plein au-dessus de −4°) : vus d'en dessous (POSE0, `VIEW.crust`, la remontée de la boucle depuis `VIEW.below`) ils se posaient juste au-dessus du plat et brouillaient sa silhouette.
2. **La buée** dans la cuve, au-dessus du plat (`motes`, 90, montée 2,4 cm/s). Suit `shell × heat` : rien dans l'accroche (prélavage froid), elle naît avec « cinquante degrés ». Dresser en ordre 15 : à 27, la couche de profondeur du verre de la machine (21) la cachait.
3. **La lumière du soir** au sol devant la machine et l'évier (`makePool` ink, r 170, 0,2). Suit `room × (1 − night)` : elle s'éteint sur « tu vas dormir », et au like quand la caméra descend vers le sol.
4. Retiré : le flacon de liquide vaisselle et l'éponge au bord de l'évier — hors champ ou illisibles sur les deux plans de l'évier (le coin gauche est coupé, toi et le robinet occupent le reste).

## Ce qui a été vu
- apres2 : POSE0 identique à celle d'avant ; porte soir / nuit : le sol s'éteint, verres et bols se lisent dans le panier ; D (el −6) : verres à peine là.
- grand (avec zones) : dans `VIEW.tub` et `VIEW.section`, les bols et les verres tombent sous l'en-tête (pâles ; le contrôle de contraste passe 63/63).
- steam : la buée se lit en petits points (≈ 3 px) au-dessus du plat, discrète ; à 270 px elle se devine à peine.

## À changer ailleurs
Rien d'obligatoire. Si l'acte qui monte `VIEW.tub` / `VIEW.section` trouve les bols trop présents sous l'en-tête : descendre ces poses (`shift` 110 → 80) plutôt que retirer la charge.

## Pas au niveau
- La buée est à la limite de l'utile : des points, pas des traînées, sur une image fixe ; à juger en mouvement sur le brouillon (`qa`), à retirer si elle grouille.
- Images lues : 32 (budget 24 dépassé : une planche de contrôle de la buée de trop).
