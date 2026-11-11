# 045 · acte1.js — retouche du 08/11 (agent `retoucheur`)

Liste fermée : `qa` du brouillon + relecture à 270 px. Rien touché d'autre : `POSE0`, la première demi-seconde (clés 0 et 0,5 intactes), la coupe `toscene` et `WIDE`, la couture de sortie (`HULL` à 18,24, même état) sont tels quels.

| Défaut | Correction | Vérifié à |
| --- | --- | --- |
| 1 · 12,0 → 14,0 plage lente | Le plan large glisse : orbite az −50 → −60 sur « un kilomètre… pleuvoir », la caméra monte (el 1,5 → 9), d 55 000 → 56 500 ; clés `couloir` (az −64, el 13,5, shift 72) et fin de plan (az −65,5, el 14,5). L'empreinte (`fall`) part de « Ses » − 0,5 (13,12, 1,6 s) au lieu de 13,70 ; les morceaux (`debris` 0,04) sur « Ses ». Nez ≥ 455, pas de tir ≤ 1 246 (calcul). | caméra 13 à 16 °/s de 12 à 13,6 s (4 à 6 avant) ; mouvement image (snaps, 72 × 128) 12,05 : 0,95 · 12,3 : 0,96 · 12,55 : 1,07 · 12,8 : 1,19 · 13,05 : 1,03 · 13,3 : 0,93 · 13,55 : 3,1 · 13,8 : 0,99 · 14,05 : 1,23 (brouillon 0,5 à 0,9) ; planche 12,8 / 13,9 |
| 2 · 9,0 → 10,0 mouvement 0,7 | Le gros plan du détonateur continue de tourner et de monter jusqu'à la coupe (d 95 → 80, az −72 → −76,5, el 6 → 8) ; le large part plus vite (`sol` az −45, el −1). | 9,05 : 1,77 · 9,3 : 1,91 · 9,75 : 1,07 · 10,05 : 1,10 · 10,3 : 1,06 (brouillon 9,0 : 0,67, 10,0 : 0,98) ; planche 8,8 / 9,5 |
| 3 · 17,9 remontée ≈ 150 °/s | Coupe nette sur la coque à `scene:Il` − 0,12 (16,86), puis poussée lente `HULL0` (d 3 100, az −58, el −12, fov 37) → `HULL` à 18,24, en mouvement ; le large tient jusqu'à la fin de « …son couloir » ; `chip-couloir` sort avec son plan (16,72). | caméra 19 °/s de 16,86 à 18,24 (115 à 250 avant) ; heurt (2ᵉ différence, 270 × 480) à 17,9 : 6,3 (brouillon 20,2) ; aucune image parasite à la coupe (16,83 / 16,87 / 16,90) ; planche 17,9 |
| 4 · 5,6 plongée heurtée | Coupe dans l'axe sur la ligne veille du cœur à `promesse` − 0,1 (4,81) : `LINE` (d 4 200, az −66,5, el 7, shift 30), la plongée repart de là (clé `charge` d 2 400 au lieu de 2 600) ; avant la coupe, la vue d'au-dessus pousse doucement (d 12 500 → 11 200) pendant que la lumière descend les lignes. | caméra 26 à 28 °/s autour de 5,6 (80 avant) ; heurt à 5,6 : 9,5 (brouillon 18,8) ; aucune image parasite à la coupe (4,77 / 4,80 / 4,83 / 4,87) ; planche 4,84 / 5,6 |
| 5 · 8,8 boîtier sombre sur sombre | Cadrage d'au-dessus (el 6 au lieu de −4 sur « déclenchée ») : la lumière clé se pose sur la face haute du boîtier du verrou, il se lit comme un volume ; essayés et écartés : `litLock` 0,45 (la face verte vole la vedette au détonateur), `fs` 150 (aucun effet), az −64. | planche d'essai 8,9 (5 variantes) puis planche 8,8 / 9,5 |

`npm run check -- 045` : passe. `npm run camera` (acte 1, par seconde) : 4:24 5:29 6:118 7:209 8:73 9:24 10:14 11:13 12:9 13:7 14:7 15:8 16:15 17:24.

## À voir sur le prochain brouillon

- `qa` → rythme 12 → 15 s : par image, le large est juste au-dessus de 1 (0,93 à 1,2 hors mots) ; 14,3 → 15,3 reste à 0,5–0,9 (une seconde, pas une plage de 2 s : le couloir s'allume à 15,59).
- Le couloir vu à az −64 (−55 avant) : la bande se lit sur la planche (16,5), à confirmer à pleine taille.
- La plongée dans la baie (6,4 → 7,7) passe toujours par ≈ 280 °/s (non signalée, contenu sombre) : hors liste, non touchée.

## À changer ailleurs

Rien.

## Images lues : 3

`avant.jpg` (10 images du brouillon), `t1.jpg` (essais du boîtier et des poses de coupe), `v1.jpg` (vérification, 8 instants) — dans `.cache/planches/045/retouche-acte1/`. Mesures sans image : `speed.mjs`, `v.mjs` (trajets hors ligne), `pairs2.mjs` (mouvement et heurt sur snaps), `odd.mjs` (image parasite aux coupes).
