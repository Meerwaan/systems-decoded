# 047 · acte2b.js — le repos dans la cuve (40,38 → 48,63)

## Monté
- 40,38 coupe dans la cuve sur le distributeur, de trois quarts (az −122 → −134, el 16 → 10, d 62 → 52 : une orbite lente sur les deux phrases ; de face, à az −150, c'était un dessin plat et vert). État : `STAGED`, prélavage (`jets` 0,4, `water` 0,4, `heat` 0, `cycle` 2 → 9 sur tout l'acte), le bras tourne (`turn` 0 → 1,8).
- `litTrap` s'allume sur « pastille » et respire (0,7 / 0,35, périodes ≈ 0,9 s, pas de clignotement) ; `chip-pastille` de « enfermée » à « hasard » + 0,3.
- « elle ne tombera pas au hasard » : la trappe est cognée deux fois et le loquet tient (`trap` 0 → 0,06 → 0 sur « tombera », 0 → 0,045 → 0 sur « hasard »). Les jets du bras ne montent pas jusqu'à la trappe (16 cm) : la gerbe du plan n'est pas dessinable ; le recul vers les jets d'en bas (essayé) donnait un cadre plein de bols flous de l'habillage, sans le bras.
- 43,64 coupe sur le bras de devant, à travers la porte de verre, immobile et sec (`jets` 0, `turn` 0,27) : le moyeu et son alésage vide ; `chip-moteur` sur « moteur », punch 0,06.
- Les jets sortent SUR « jets » (45,66), avec les flèches de poussée (`thrust` 0,85, `jets` 0,5) ; le bras démarre du côté de la flèche, de plus en plus vite (`turn` 0,27 → 1,77, `power2.in` jusqu'à 48,63, ≈ 1 tour/s au bout). La caméra s'approche du bout qui vient vers nous.
- 46,60 → 47,38 : la caméra descend devant la porte (elle reste dehors, z 46 à 60) et lève les yeux sous le plat (`VIEW.crust`) ; `jets` 1 ; `mood` 1 sur « croûte » (0,3 s) ; poussée lente jusqu'à `VIEW.crust` d × 0,85 ; `chip-tient` de « tient » à 48,43.

## Rendu à l'acte 3 (48,63)
`VIEW.crust` d 49,3 ; `crust` 1, `crack` 0, `mood` 1, `jets` 1, `turn` ≈ 1,77 (lancé à ≈ 1 tour/s), `water` 0,4, `cycle` 9, `thrust` 0, `litTrap` 0, `trap` 0, `tab` 0.

## Poses qui cadrent
- Distributeur de trois quarts : `{ tx: 8, ty: 54, tz: 26.6, d: 60, az: -125, el: 14, shift: 40, dof: 8 }` (planche p2 « E »).
- Moyeu sans le plat sous l'en-tête : `{ tx: -3, ty: 17, tz: 9, d: 62, az: -46, el: 33, shift: -225, dof: 8 }`.
- Bout du bras, flèche lisible : `{ tx: -11.5, ty: 17.5, tz: 20, d: 50, az: -30, el: 30 }` vers 46,3 s (flèche nette ; plus tôt elle vient vers l'objectif et bave).

## Contraste de l'en-tête (45,63 s)
Le plat (émail clair) est juste au-dessus du moyeu : il tombe derrière l'en-tête dès que le moyeu descend dans le cadre ; plus haut, ce sont les jets du dessus et un trait clair de la cuve. Réglé par : jets sur leur mot (plus avant 45,66), `shift` −225, `el` 33. Reste UN avertissement : « 03 RÉPONSE » 4,09:1 (il faut 4,5) à 45,634 s — `check` passe. −190 : 3,15 (trait de la cuve) ; −242 / −260 : le plat derrière « SYSTÈME DÉCODÉ » (3,4 à 3,6).

## Un cran en dessous
- 42,3 → 43,4 « pas au hasard » : la trappe cognée qui tient est une démonstration faible (la cause, la gerbe, ne se voit pas).
- 43,64 → 45,6 : le moyeu est en haut du cadre, le bras file vers le bord droit (zone des boutons, pas de texte) ; grand aplat gris du microfiltre en bas.
- La flèche de poussée bave quand elle pointe vers l'objectif (45,7 → 46,0).
- 46,6 → 47,4 : la remontée est floue au milieu (mouvement de 54° d'élévation en 0,8 s, sous le quart de tour par seconde).

## Sons (pour le monteur-son)
- 40,38 coupe dans la cuve (prélavage : un ruissellement doux) ; 42,56 et 43,08 la trappe cognée qui tient (un petit claquement sec, dans le souffle après « hasard », ≈ 43,40) ; 43,64 coupe sur le bras sec ; 45,66 les jets qui partent (souffle d'eau, dans le souffle avant « jets » est trop court : après « tourner », ≈ 46,45) ; 47,08 → 47,40 la croûte passe au rouge (dans le souffle après « croûte… ») ; 47,77 « tient » (le chip).

## À changer ailleurs
Rien d'obligatoire. Pour effacer le dernier avertissement de contraste si l'orchestrateur le veut : le libellé d'acte inactif de l'en-tête plus clair (`check` propose rgb(180,176,167)) — touche tout le film, à décider hors de cet acte.

## Images lues
44 (planches p1 à p5 de 8, puis 4 vignettes seules) — au-delà du budget de 26 : la chasse au contraste à 45,6 s s'est faite à l'aveugle avec `check` après la p5.

## Retouche du 13/11/2026
- 46,6–47,4 « et ta croûte » (remontée floue, qa 46,8 s : 35,8) → la remontée de 54° en 0,8 s est remplacée par une coupe à `et − 0,12` (≈ 46,68) sur `VIEW.crust` (état `L_DISH`, `thrust` 0, `litArm` 0, `jets` 1), puis une seule poussée lente jusqu'à `CRUST_IN` (d 58 → 49,3 en ≈ 1,95 s). Couture de sortie inchangée (`CRUST_IN`, mêmes états). Vérifié à 46,65 / 46,72 (deux images de part et d'autre de la coupe, plat net, croûte lisible) et 47,6.
- 43,6–45,6 bras dans la colonne des boutons → `HUB_WIDE` az −46 → −15, d 62 → 68, `side` 180 ; dérive az −9, d 62 (même `shift` −225, même `el`). Le bras descend presque vertical à gauche du centre, bout à x ≈ 760. Vérifié à 43,7 / 44,6 / 45,4.
- Contraste à 45,63 → effacé par le même recadrage : `check` 65/65 textes au-dessus de 4,5:1, plus d'avertissement.
- Reste à voir sur le prochain brouillon : 45,8 → 46,4, le bras qui démarre balaie encore le bord droit le temps du raccord vers `HUB` (side 180 → 0) ; à 46,72 un jet vert flou au premier plan en haut à droite (il passe en ≈ 0,3 s avec la rotation) ; `qa` à 46,7 pour confirmer la coupe.
- Images lues : 5 planches (avant, deux planches de poses, deux après).
