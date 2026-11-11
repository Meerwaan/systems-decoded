# 039 · acte2b.js (02 AUTOPSIE 2/2 : le principe, puis le repos) — journal

2026-11-05. Agent `acte`, `toprincipe` 31,97 → `tozero` 50,00. Planches dans `.cache/planches/039/acte2b/` (p1 à p4).

## Monté (un plan par souffle)
1. **31,97 coupe** sur l'établi, la dalle vue BASSE (`HEAP_LOW` = `VIEW.heap` d 2300 el 8 shift 40, poussée lente → d 2050) : « Pourquoi l'étaler ? » un petit tas se pose (`mass` 0 → 0,22).
2. « chauffe » (33,80) : `arrows` 0 → 1, flèches moyennes sur la tranche noire de la dalle.
3. « Épais » (35,56) : `mass` 0,22 → 1 jusqu'à « perce » : le tas s'épaissit, les flèches s'allongent et se serrent jusqu'à traverser la dalle ; `punch` sur « perce » (36,28).
4. « Étalé » (37,40) : `arrows` → 0, `spread` 0 → 1 jusqu'à `mincep`, la caméra monte (par rapport) vers `VIEW.sheet` d 4800 shift 220 : la chambre entière dans ses murets, orange ; `chip-170` de `m170` à `sa` − 0,3.
5. **40,28 coupe** (`principe:sa` − 0,13) sur le MÊME cadre bas que le tas (d 2050 → 1850) : la galette mince, flèches courtes et espacées ; `punch` sur « partage ».
6. **41,76 coupe** `torepos` : l'usine au repos, `VIEW.chamberLow` (la fosse sèche, la cuve au-dessus, cœur 0,3 brun : rien de rouge), `mood` 0, poussée lente ; `chip-jamais` 41,90 → `dort` − 0,2 ; `punch` sur « dort ».
7. « Dans le bâtiment… » (45,24) : montée vers `POOLWIDE` (la dalle sèche à gauche, le haut mur de la piscine, les deux vannes et leurs câbles, l'eau au-dessus) ; `litPool` 0,6. Une phrase, pas plus.
8. « Vannes fermées » : on descend sur une vanne (`VALVE` = `VIEW.valve` d 1250 shift −50 side 80), `litValves` 0,6 ; puis poussée lente jusqu'à `tozero` − 0,05 (d 1120) : levier, câble, déclencheur sur la dalle.

## Ce qui a raté, et pourquoi
- `VIEW.heap` d 1300 : le tas déborde du cadre des deux côtés → d 2300 / 2050.
- `mass` 0,55 → 1 : épaisseur bornée à `HEAP.h` dans les deux cas, rien ne change → départ à 0,22.
- `VIEW.sheet` d 2600 : la chambre déborde, l'orange passe sous l'en-tête → d 4800 shift 220.
- `VIEW.graze` : la cuve tombe sous l'en-tête (shift 150) ; une version basse (ty −150) ne la montrait pas → `chamberLow`. Cœur 0,7 = cylindre orange, lu menace → 0,3.
- Piscine : la coupe de la piscine vue de près (et `el` 48) = une dalle pâle illisible ; le plan large avec les vannes se lit mieux. Contraste « 03 RÉPONSE » à 46,7 s (l'eau pâle sous l'en-tête) → shift 60 → −40 (check sans avertissement).
- Vanne à d 960 : le levier passait sous l'en-tête et à droite → shift −50 side 80.

## Un cran en dessous
- 40,28 → 41,76 (« sa chaleur se partage ») : à `spread` 1 vu bas, seules trois flèches (à gauche) se voient, celles de droite sont cachées (ordre de dessin dans `corium.js` : `bodyOver` renderOrder 6 ou une vitre ?). Ça se lit « peu et court », mais pas symétrique.
- 45,24 → 46,90 (piscine) : l'eau reste un volume gris pâle, peu veille même à `litPool` 0,6.
- 41,76 → 45,2 : la chambre elle-même est sous le cadre ; c'est la fosse sèche sous la cuve qui « dort ».

## À changer ailleurs
- `corium.js` (agent du corium) : à `spread` 1, `mass` 1, caméra `{ ...VIEW.heap, d: 2050, el: 8, shift: 40 }`, les flèches de droite (x > 0) ne se voient pas — à regarder (ordre de dessin des flèches, `renderOrder` 5, contre la galette / les murets).

Images lues : 26 (8 + 8 + 7 + 3). `npm run check -- 039` passe.

## Retouche du 05/11/2026
- **45,5 s heurté** (montée de la dalle à la piscine en 1,6 s) → coupe nette à `repos:Dans` − 0,12 (45,32) sur `POOLWIDE`, état `L_POOL` posé par la coupe, puis poussée lente → `POOL_IN` (d 3000 → 2800) jusqu'à `piscine` + 0,3. Vérifié à 45,29 / 45,32 / 45,35 (une image avant, la coupe, une image après : continu des deux côtés).
- **46,0 s piscine illisible** → `POOLWIDE` au-dessus du mur : tx 850, ty −60, tz 2000, d 3000, az −40, el 45, shift 0 : l'eau veille sombre (model.js) remplit la moitié haute, les deux vannes sur le mur juste au-dessus des sous-titres. Vérifié à 45,6, 46,0, 46,3, 46,9. Contraste : 65/65.
- **41,76–45,2 chambre sous le cadre** → `GRAZE` = `chamberLow` avec ty 100, tz 1000, d 3600, el 20, shift 0 (`GRAZE_IN` d 3300) : la dalle sèche quadrillée au centre, la fosse et le bas de la cuve au-dessus. Vérifié à 41,80, 42,5, 44,0, 45,20.
- Reste à voir sur le brouillon : la descente `POOL_IN` → `VALVE` (46,66 → 47,61, d 2800 → 1250, az −40 → −16 en 0,95 s) n'est pas dans la liste ; `qa` dira si elle est heurtée (remède : coupe à `repos:Vannes` − 0,12).
- Planches : `.cache/planches/039/acte2b-retouche/` (p1 essais, p2, p3). `npm run check -- 039` passe.

## Retouche du 06/11/2026 (plan-séquence, validé par Merwan pour ce film)
- **Plages fixes 32,0–36,3 / 41,8–43,2 / 44,1–45,3 s** (`shot` sine.inOut + « coupe + poussée de 10 % ») → quatre `D.path` qui ne freinent pas : (1) 31,97 → 40,26 bas autour du tas (az −30 → −37 → −44 → −36, el 8–13) puis montée sur `SHEET` à `mincep` et au-delà (az −16, el 55) ; (2) la galette mince 40,28 → 41,74 (az −30 → −40) ; (3) l'usine au repos 41,76 → 45,30 (az −14 → −24 sur « dort » → −34) ; (4) la piscine 45,32 → 49,95 : `POOLWIDE`, clé à `piscine` + 0,25 (l'eau reste au cadre sur « attend »), `VALVE` az −4 sur « fermées », az −10 à + 1,15 s, `VALVE_IN` (pose de sortie inchangée). Coupes gardées : 31,97 (entrée), 40,28, 41,76, 45,32 ; poses d'entrée et de sortie inchangées.
- `npm run camera -- 039` : image quasi fixe 11 % → 1 % du film, plages fixes ≥ 1 s : aucune (32 à 45 s : 6 à 27 °/s par seconde).
- Vérifié à 32,0 · 33,8 · 35,56 · 36,3 · 37,4 · 38,6 · 39,84 · 40,24 · 40,3 · 41,0 · 41,74/41,8 · 43,2 · 45,28/45,34 · 46,26–47,71 (dont 47,36/47,39 et 47,68/47,71 à 1/30 s : continus). Pas de reflet sur l'objectif. Planches `.cache/planches/039/acte2b-retouche/ps1` à `ps4`. Sauvegarde : `acte2b.js.bak` au même endroit. `npm run check -- 039` passe (65/65 contraste).
- Reste à voir sur le brouillon : la montée tas → galette (38 s, 74 °/s) traverse le motif serré de la galette ; la descente piscine → vanne (46,6 → 47,7) reste rapide (≈ 1,1 s) mais continue.
