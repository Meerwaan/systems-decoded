# 033 · Porte d'avion — retouche de `src/acte2.js` (agent retoucheur, 30/10)

Lu : journal `033-acte2.md`, `acte2.js`, `direct.js` (shot/cut), `blocks.js` (benchCut). Planches : `.cache/planches/033/retouche2/` a–e (36 vignettes, 5 images lues).

| Défaut | Correction | Vérifié à |
| --- | --- | --- |
| 1 · 18,0–20,0 plage lente, 20,0 heurté (15,2) | `explode` part sur « l'ouvre » (repère `ouvre:l'ouvre`, ≈ 20,04) en `sine.inOut` 1,3 s au lieu de `power2.out` 1,2 s sur « on » ; le recul (par rapport) passe de `sine.inOut` à `sine.out` : il quitte le gros plan dès la coupe. La plage 18,0–19,82 appartient à l'acte 1 (tenue sur VIEW.edge) : voir « À changer ailleurs ». | 20,00 / 20,03 (continus), 20,50, 21,2 |
| 2 · 27,4 heurté (14,8) | le plongeon 720 → 220 remplacé par une coupe nette à `appuie` − 0,1 (même plateau, `named` 0 : le débord allumé traversait l'objectif) sur STOP_IN d 150, puis poussée lente vers STOP d 128 jusqu'à « butées », 120 jusqu'à `repos`. | 26,90 / 26,95 (continus), 27,4 |
| 3 · 28,8–29,7 butées petites | STOP = `{ ...stopB, ty 80, d 128, az −80, el 8, shift 40 }` : les deux plots verts occupent le centre-gauche, le crochet n'est plus qu'une barre en haut. | 28,85, 29,6 |
| 4 · 22,6–24,6 poignée sous les boutons | PAIR d 720 → 800, az −40 → −34, side 150 : le bout de la poignée vers x ≈ 710. | 22,9, 23,8 |
| 5 · 38,85–42,30 seuil, porte 15 % | AISLE = `{ ...VIEW.aisle, ty DY+100, tz DZ−75, d 720, el 6, fov 24 }` → d 640 linéaire (23 cm/s) : la porte (≈ 40 % de la largeur) et le voisin aux rayons X au centre, à gauche de la colonne des boutons ; plus de dossiers sombres. État rendu à l'acte 3 inchangé ; seule la pose finale change (d 640, fov 24, tz DZ−75 au lieu de d 870, fov 32). Chevrons `#rail-seuil` intacts. | 38,87 / 38,90 (continus), 40,5, 42,25 |

Reste à voir sur le prochain brouillon : `qa` à 20,0 et 27,4 ; la coupe acte 2 → acte 3 à 42,30 (la pose de départ a changé : vérifier qu'elle reste une coupe franche, pas un saut d'axe gênant) ; à 21,2, dans l'éclaté entier (EXP = VIEW.exploded), le bout de la poignée frôle encore x ≈ 940, y ≈ 900 avant le glissement vers PAIR.

## À changer ailleurs
- `src/acte1.js` l. 141 (la tenue sur le bord, 18,1 → 19,82, « mouvement < 1 ») : `shot(atEdge, t.tobench - atEdge, EDGE, "sine.inOut", EDGE.d * 1.03);` → `shot(atEdge, t.tobench - atEdge, EDGE, "sine.out", EDGE.d * 1.2);` — une poussée lente et continue qui se pose sur EXACTEMENT VIEW.edge (la couture ne bouge pas).

`npm run check -- 033` : passe.
