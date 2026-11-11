# 045 · fin.js — retouche du 08/11 (agent retoucheur)

Lu : `docs/journal/045-fin.md`, `src/fin.js`, de `world.js` les poses (`VIEW`, `LINK_HOOK`), de `fusee.js` / `kourou.js` le tracé de `pulse` et du fantôme. Planches : `.cache/planches/045/retouche-fin/p1` à `p4` (4 images lues). Boucle, `toverdict`, `toloop`, `POSE0`, `FIRST` : non touchés.

## Retouche du 08/11

| Défaut | Correction | Vérifié à |
| --- | --- | --- |
| 73,0 → 75,5 : à `VIEW.junction` (az −80, d 1300) deux corps de verre et une barre | La coupe `tocta` tombe sur `SLIT` = `VIEW.junction` vu **d'au-dessus, d'équerre au plan des trois corps** (az −84, el 50, d 6000, cible entre les liaisons et la case, `dof` gardé) : l'étage central entre ses deux boosters, nez qui s'écartent, feux aux jonctions — Ariane 5 se reconnaît. Puis glissement vers le booster +z (cadre droit) : tz 150 → 220 → 300, az −86 / −88, d 5500 (« boosters ») → 4900 (« coupé ») : le central à gauche, le booster à droite, les liaisons tendues entre eux, qui cassent sur « coupé ». | p3 : 73,8 · 75,0 · 75,72 (liaisons tendues) · 75,80 (cassées) ; p4 : 71,82 / 71,87 (la coupe) |
| 76,3 → 77,6 : corps de verre au premier plan sous le panneau du duel, `pulse` sans plan | Clé ajoutée à `coupé + 1` (76,71) : az −90, el 45, d 4700, `shift` −60 — le plan tient pendant que le signal monte (lisible sur le flanc droit du central), le panneau entre au-dessus du sujet ; le recul part de là vers `devie` (inchangé), caméra toujours au-dessus de la fusée : plus aucun corps devant. | p3 : 76,3 (signal vert lisible) · 76,7 · 77,1 · 77,6 ; p4 : 76,68 / 76,74 (continu) · 77,3 · 78,0 · 78,3 · 79,2 (duel inchangé) |
| 69,7 → 71,4 : la ligne du fantôme fine | **Non corrigé ici** : c'est un `fatLine` de 2,6 px de large (`kourou.js`), largeur en pixels — ni la distance ni l'angle de `fin.js` ne l'épaississent. À 71,82 la croix se lit, la ligne pas du tout. | p1 : 70,9 ; p4 : 71,82 |

`npm run check -- 045` : passe (0 erreur ; l'avertissement est le bruit connu des shaders D3D). `npm run camera` : seconde 77 à 102 °/s (le recul d 4700 → 13 000 + el 45 → 18 en 1,6 s, dont ≈ 30° de rotation : pas un quart de tour), dans la plage du film (40 : 105, 45 : 115).

## À changer ailleurs

- `episodes/045-autodestruction-fusee/src/kourou.js:796` : `fatLine(pts, { color: BRAND.signal, width: 2.6, opacity: 1, dashed: true, dashSize: 900, gapSize: 600 })` → `width: 6`, `dashSize: 1500`, `gapSize: 500` (le fantôme à ≈ 1,5 px à 270 de large ; la croix, 4,5 px et éclaircie, reste au-dessus si on la passe à `width: 7`, ligne 826). Seul `fin.js` montre le fantôme.

## Reste à voir sur le prochain brouillon

- Le recul 76,7 → 78,3 en mouvement réel (rapide sur ses 0,7 premières secondes, vérifié image par image seulement).
- Les liaisons (150 unités) restent fines à 270 px : on les lit surtout par les feux et par leurs bouts qui retombent.
