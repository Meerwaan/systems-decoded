# CR01 · coeur.js — journal

Agent décor, fichier `episodes/CR01-tchernobyl/src/coeur.js` (le cœur RBMK en coupe, ≈ 1:10). Planches : `.cache/planches/CR01/coeur/`.

## Ce qui est construit (v1)

- Empilement de graphite : 19 colonnes carrées (6,2 cm) en contour **en escalier** (un cylindre de colonnes, coupé en x = 0), 8 assises (joints dessinés par les arêtes). Dans la face coupée, une rainure par colonne : 10 canaux de combustible (étroits) et 9 canaux de barre (larges, une barre dedans, la barre centrale en z = 0).
- La lumière de la puissance : une bande lumineuse au fond de chaque rainure (shader : un dégradé en travers, une pulsation lente qui monte le long du canal), bas (40 → 75) selon `pLow`, haut (75 → 110) selon `pHigh`, papier ; le bas vire au rouge alarme avec `fault` (et l'argile des quatre assises basses rougit un peu : `alarm()`).
- Plaque basse (demi-disque), pieds ; dalle supérieure (demi-disque épais, ton clair, rainurée), 14 tuyaux dessus (10 au rang coupé, 4 derrière) ; cuve de béton en U, sombre.
- Barres : absorbant sombre, col fin, **pied clair** (8 cm) — « le pied net ». Entrent une à une (`rodsIn`, rang étalé), toutes descendent avec `scram`.
- Fin de nuit : `blast` (tuyaux qui se tordent, jets de vapeur papier aux têtes des tuyaux et au joint dalle / graphite, deux éclairs localisés, canaux au blanc), `slab` (la dalle monte de `SLAB_TOP.lift`, bascule un peu, avec ses tuyaux), `blast2` (éclair, 26 blocs de graphite en vol balistique qui retombent à plat autour, gerbe d'étincelles), `fire` (dessus de l'empilement en blocs incandescents, braises alarme qui montent, fumée papier sombre).

## À changer ailleurs

- `src/plan.js` : `export const RODS = { count: 9, travel: 70, park: 112 }; // rods in the cut face (one rod channel in two columns: 9)` — seul `coeur.js` lit `RODS` ; il en dessine 9 (18 dans 19 colonnes faisaient une palissade).
- `src/world.js`, `VIEW.coeurLow` (= `POSE0`) : `coeurLow: pose("coeur", [0, 80, -10], { d: 250, az: -50, el: -14, fov: 56, shift: 140 }),`
- `src/world.js`, `VIEW.coeur` : `coeur: pose("coeur", [0, 85, 0], { d: 700, az: -58, el: 22, shift: 110 }),` (à confirmer sur la planche finale)
- `src/world.js`, `VIEW.slab` : `slab: pose("coeur", [10, 195, 0], { d: 900, az: -58, el: 10, shift: 0 }),` (à confirmer sur la planche finale)

## Ce qui a raté, et la correction (planches p1 → p6)

- p1 : la face coupée en argile moyenne, sous la clé dure, était plus claire que la lumière des canaux : une façade carrelée rose. → graphite `tone −1` × 0,55, rouge des canaux plafonné (au-delà de ≈ 1 le mappage tonal le rend rose), l'argile basse ne fait plus que tiédir (`setAlarm` 0,02 + 0,05·pLow).
- p1-p2 : les barres retirées dépassaient de 50 cm au-dessus de la dalle avec les tuyaux : un peigne. → l'absorbant (92 cm, continu de la pointe la plus basse jusqu'au-dessus de la dalle) est coupé au-dessus de la dalle par un `discard` en hauteur monde (`uClipTop` : le dessus de la dalle, qui suit la dalle quand elle vole) ; tuyaux 14, épais, `tone −0,55`, 5 au rang coupé, 9 derrière.
- p3 : barres fines illisibles → Ø 3,7, rainure 4 cm, pied clair 8 cm ; plaque basse sombre (elle volait la vedette au rouge).
- p6 : « à peine un pour cent » trop blanc → courbe `k = 0,01 + 2,2·p^1,15` (0,03 → 0,04 ; 0,15 → 0,25 ; 0,45 → 0,88 ; plafond 1,6) ; en défaut, le haut plafonne à 1 (t7 : le blanc ne mange plus le rouge).
- Vapeur : des boules de coton → 200 + 180 bouffées plus douces (`soft` 2,6), moins opaques. Pas re-regardé après ce dernier réglage (budget d'images dépassé).

## Les nombres

- `pLow` / `pHigh` : bande de lumière au fond des 19 rainures, bas 40 → 75 / haut 75 → 110, papier ; une vague lente monte le long des canaux (11 cm/s) — le cœur bouge dès l'image 1 même immobile.
- `fault` : le bas passe au rouge (bandes rouges, plus fort en bas ; l'argile basse tiédit), respiration lente 2,8 s (±7 %).
- `rodsIn` : 9 barres (rainures impaires ; la barre du milieu en z = 0) entrent une à une à mi-hauteur — ordre : z = 0 d'abord, puis en alternant les côtés. `rodsIn` 0,25 → la barre du milieu et celle de z −24,8 dedans.
- `scram` : toutes descendent : pointe = 112 − 70·(b + (1 − b)·scram), b = 0,5 si dedans. Barre du milieu, état FIRST : pointe à 72,8 (pile à la frontière rouge / papier).
- `blast` : tuyaux qui se tordent, jets de vapeur (têtes de tuyaux + joint graphite / dalle vers −x), deux éclairs localisés (à 0,14 et 0,74), canaux au blanc sous l'éclair, la dalle sursaute à 0,74.
- `slab` : la dalle (et ses tuyaux) monte de 150, bascule (0,17 rad en x, −0,07 en z : aucun angle affiché) ; les barres deviennent visibles au-dessus du cœur.
- `blast2` : éclair (pic à 0,05), 26 blocs en arcs lents qui retombent à plat autour de la cuve, gerbe d'étincelles alarme.
- `fire` : le dessus de l'empilement s'allume bloc par bloc (visible dès que la dalle est partie), braises alarme qui montent, fumée papier sombre.
- Ancres : `A.rods` suit la pointe moyenne ; `A.slab`, `A.pipes` montent avec la dalle.

## Poses (sur le vrai décor)

- **Première image (recommandée)** — contre-plongée oblique, les canaux filent : `{ tx: 0, ty: 80, tz: -10, d: 250, az: -50, el: -14, fov: 56, shift: 140, dof: 0 }` (vue en p5 à az −48 : dalle-disque sous l'en-tête, barres sombres et pieds clairs, bas rouge entre 880 et 1150, plaque et pieds dessous). `VIEW.coeurLow` de l'architecte (el −4) est plat ; à el −12, fov 50, d 327, az −62, shift 150 c'est frontal (une façade).
- `t6` (suivre une barre) : la barre du milieu, pointe en `[0.75, 112 − 70·(0,5 + 0,5·scram), 0]` ; gros plan vu en p6 : `{ tx: 1, ty: 76, tz: 0, d: 120, az: -62, el: 8, fov: 30, shift: 0, dof: 6 }` (le pied clair, le col, l'absorbant sombre, net).
- `VIEW.coeurBottom` (t7) : cadre bien.
- `VIEW.coeur` : sur le vrai décor, la dalle entre dans l'en-tête (shift 200) → proposé `d: 700, shift: 110` (non relu).
- `VIEW.slab` : d 1150 laisse le cœur à 25 % de la largeur → proposé `{ tx: 10, ty: 195, tz: 0, d: 900, az: -58, el: 10, shift: 0 }` (à d 850 / ty 175, vu en p6 : tout se lit, mais les tuyaux de la dalle en vol touchent l'en-tête ; ty 195 non relu).

Planche finale pour le chef (non lue par moi) : `.cache/planches/CR01/coeur/coeur-final.jpg`.

## Images lues

40 vignettes (p1 8, p2 8, p3 8, p4 4, p5 4, p6 8) : **au-dessus du budget de 30** (j'ai compté les planches comme une image au début).
