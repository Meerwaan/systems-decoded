# 045 · acte2.js — retouche du 08/11

Agent retoucheur. Liste fermée : `qa` du brouillon + relecture à 270 px. Coutures intactes (coupe 18,24 sur `WHOLE` + `BENCHED arm 0`, coupe 21,50 sur `ANT` avec `NEAR` inchangé, pose et état rendus à 39,22 inchangés).

| Défaut | Correction | Vérifié à |
| --- | --- | --- |
| 1 · 18,5 → 21,0 plage lente | Trajet A refait : `TURN` (az −60, d 412) sur « on », `ROWV` (tx −20, d 470, az −66) à `on + 0,8` (la rangée vient de s'ouvrir, la caméra est allée avec elle), nouvelle clé `LEAN` (tx −50, d 400, az −68) à `sur + 0,2`, puis `NEAR` inchangé. L'ancien `ROWV` à 20,82 arrêtait `d` (il y repartait en sens inverse) et `tx` : 20,3 → 21,0 figé, puis un fouet vers `NEAR`. `npm run camera` : 19 s 12 → 19 °/s, 20 s 16 → 20, 21 s 41 → 27. « Alors… » garde sa lente rotation (−56 → −60). | 18,9 · 19,55 · 19,9 · 20,25 · 20,6 · 20,95 · 21,3 · 21,46 : les pièces partent nettement (flou de mouvement à 19,55), la rangée entière à 20,25–20,6, puis la glissade vers l'antenne. |
| 2 · 26,2 détonateur masse verte | `fire` ne monte plus de 0 à 0,2 en 0,34 s (tout ce temps dans le plein flash du décor, `fire` 0,04 → 0,16 = émission 0,9) : `now(cordeau − 0,25, fire 0,22)` saute le plein, le flash part à ≈ 0,55 et retombe en ≈ 0,3 s pendant que la tête part sur le cordeau ; la course du cordeau repart de là (`cordeau − 0,24 → bout`, linéaire). | 26,133 / 26,167 / 26,2 / 26,3 : avant, éclair, retombée ; les bagues du cylindre se lisent sur chaque image. |
| 3 · 28,5 tête de lumière en boule | `sauvegarde.js`, sur l'établi seulement (la fusée garde 8 et 9) : sprite `3,4 → 1,4`, traîne du cordeau `uTail 9 → 16`. | 26,233, 28,5 : un cœur blanc petit, le cordeau allumé derrière lui sur toute sa longueur visible. |
| 4 · 31,1 fantôme de la moitié arrière | `section` sort du tween de 0,6 s (`litCharge` 0,4 y reste) : `now(principe:tranche$ + 0,09, section 1)`, sur le `swish` de la plongée — la moitié arrière part d'un coup, la caméra continue (une révélation sur le mouvement). Un essai à 0,1 s laissait encore deux images de fantôme. | 31,2 / 31,233 (pleine) → 31,267 / 31,3 (le V ouvert) : aucune image intermédiaire. |
| 5 · 34–36 `BLAST` d 96 | Rien à changer. | 34,5 / 35,6 : la charge centrée sur sa bande, le front qui court sur le dos, le V allumé ; se lit à 270 px. |

Reste à voir sur le prochain brouillon : `qa` → mouvement sur 18,5–21,0 (le chiffre `qa` n'est mesurable que sur un rendu) ; le saut de la section à 31,26 ne doit pas sortir en image parasite (c'est une marche, pas une image isolée).

## À changer ailleurs

1. La couverture (`episode.json` → `cover`, `fire` 0,44 sur l'établi) montre la tête plus petite qu'avant : à regarder au prochain `npm run cover -- 045`.

## Images lues

4 planches (`.cache/planches/045/retouche-acte2/p1.jpg` à `p4.jpg`). `npm run check -- 045` passe.
