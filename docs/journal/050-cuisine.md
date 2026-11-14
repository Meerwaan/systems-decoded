# 050 · cuisine.js — journal du décor

Consigne : enveloppe de 009/kitchen.js (`hob:false`, modèle 018/cuisine.js), toi en verre (main gauche à plat sur le foyer vide, main droite au manche), main d'enfant pour le like. Planches dans `.cache/planches/050/cuisine/`.

## Fait
- Premier jet écrit (une `Write`) : toi penché de 18° (`lean`) — à plat sur un foyer à 40 cm devant toi, un bras debout (57 cm) n'y arrive pas ; main gauche `reach` avec `dir`/`palm` (paume en bas, doigts vers l'avant), arc pendant `palm`, `hover` = un doigt (2,6 cm) ; main droite `hold` sur le manche (prise par-dessus), fondue depuis la main pendante par `grip` ; enfant = une figure à l'échelle 0,6 dont on ne garde que l'avant-bras et la main gauche. Ancres `A.*` posées sur les mains (elles suivent). Aucune allocation dans `update`.

## Planches
- p1 (8) : bras de verre = poutres claires (reflet de la boîte à lumière dans le verre) ; doigts serrés en saucisse ; main droite hors des cadres VIEW ; main d'enfant au bord gauche de VIEW.top, hors zone sûre.
- p2 (8) : `fingers.pose(k)` accepte k < 0 (pas de borne hors de `grip`) : −0,4 écarte et tend les doigts, −0,8 les décolle du verre → `SPREAD = { flat: -0.4, hover: -0.25 }`. La tache blanche/rose au centre d'`emptyZone` et `twoZones` reste avec `spec: 0` sur toi : c'est le verre de la plaque (model.js), pas la figure.
- p3 (8) : vue de trois quarts haut depuis l'avant gauche, la caméra passe au-dessus de ton épaule : ton corps barre le cadre → `glassK` 0,38, `spec` 0, `through` 0 pour toi (l'enfant garde 0,6). Main d'enfant qui s'agrippe au bord du plan de travail, avant-bras qui monte devant le meuble : se lit (« une petite main »).
- p4 (6) : le corps ne se voit plus que par ses bords, il reste lisible en plan large (penché, une main à plat, l'autre qui tient la casserole levée). Prise du manche lisible depuis la droite (az −15). Défaut : à `palm` 1 la main gauche n'atteint pas le foyer droit (bras 57 cm) et flotte haut.
- p5 (3) : `lean` modulé par `palm` (penché +7°, roulis −6°, tourné −22° vers le foyer droit) : la main y arrive. Écart encore ≈ 5 cm → `GAP` 2,0 (non revu en image : budget d'images dépassé, 33 lues).
- `npm run check -- 050` passe.

## Poses qui cadrent (essais)
- Les deux mains, plan large : `{ tx: 189, ty: 93.4, tz: 42, d: 140, az: -38, el: 22, fov: 30, shift: 120 }` (grip 1).
- La casserole levée dans ta main : `{ tx: 204, ty: 106, tz: 47, d: 100, az: -15, el: 8, fov: 30, shift: 120 }` (grip 1, lift 1) — depuis la gauche (az −66 à −75), ton bras gauche à plat sur son foyer passe devant la casserole.
- La main d'enfant : `{ tx: 170, ty: 90.4, tz: 46, d: 160, az: -20, el: 60, fov: 30, shift: 120 }` (child 1, you 0).
- Toi en entier : `{ tx: 180, ty: 115, tz: 55, d: 240, az: -80, el: 8, fov: 30 }`.

## À changer ailleurs
- `world.js`, VIEW.top : `top: { ...P, tx: HX - 11, ty: HY, tz: HZ + 15, d: 160, az: -20, el: 60, shift: 120, ...SHARP },` (la main d'enfant, à x 151, sort à gauche du cadre actuel).
- `world.js`, VIEW.twoZones : `d: 140, tx: HX + 8, tz: HANDW[2] + 3` (la main droite sur le manche entre dans le cadre).
- `world.js`, VIEW.panLow ne montre pas la casserole levée (cadre de 28 cm au ras du verre) : pour « tu soulèves », la pose « casserole levée » ci-dessus.
- `model.js` (agent du système) : la tache claire du verre de la plaque dans la cuisine (rose/blanche, au centre d'`emptyZone`, `twoZones`, `hotRing`) reste visible avec la figure sans reflet.
