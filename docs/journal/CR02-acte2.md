# CR02 · acte2.js — journal (06/11)

Plage : `tot1` 30,47 → `tot4` 61,28. Une maquette (le puits), **trois `D.path`**, un par lieu, tous lancés (`go`), l'`az` qui tourne toujours vers le négatif à l'écran.

## Ce qui est monté

- **A · `tot1` → `tot2` (un seul trajet, 15 s, pas de coupe à `tolecture`)** : coupe sur le haut de la colonne (az −54) ; la caméra descend avec l'interface boue / eau (`sea` 0 → 0,32 de « remplace » à « mer » : à 0,45 l'interface tombait sous le cadre, derrière le BOP simple) ; « Avant, un test » : montée au pupitre ; « pareil » : les deux aiguilles frémissent ensemble (0 → 70 → 0) ; « Le premier » : la caméra va vers TUBE pendant que l'aiguille balaie à 1 400 (« mille ») ; « Et l'autre ? » : glissement jusqu'à LIGNE ; « Zéro » : la lunette rougit (`culprit` 1, `fault` 1), `punch`, cercle feutre (640 × 600 sur `A.dialLine`), `chip-ligne` ; « réussi » : recul sur les deux cadrans (1 400 / 0), `chip-reussi` vert qui vire à l'alarme sur « ne » (45,08 : sur « pas », 45,56, il ne restait que 0,2 s avant sa sortie).
- **B · `tot2` → `tot3`** : coupe sur le fond (le cadran rouge → le rouge du fond) ; « coule » : la balance bascule (−0,2 → 0,6) ; `punch` « déjà » ; « gaz … fond » : `gas` 0 → 0,12, la caméra monte avec le front ; « Personne ne réagit » : la colonne claire au-dessus, le rouge en dessous. `sea` 0,82 (au lieu de 0,85) pour garder un filet de boue sous l'eau.
- **C · `tot3` → `tot4`** : coupe sur le milieu (même colonne, plus haut, plus tard), le front monte plus vite (0,35 → 0,47 → 0,6) ; « En bas » : descente sur le compteur ; `debit` 9 → 22 de « entre » à « vingt-deux » (l'aiguille passe la marque 10, la zone rouge s'allume) ; `chip-22` ; la marque 10 s'éteint sur « habitude » et éclate sur « dix » (`punch` court, relâché avant la coupe) ; recul : le compteur et le rouge qui file.
- Rend à `tot4` : puits, `gas` 0,6, `debit` 22, `mark` 1, `sea` 0,82, `dialTube` 1 400.

## Ce qui a raté et pourquoi

- **Les poses sont en coordonnées du monde** : le puits est à `ORIGIN.puits` = [5000, 0, 0]. Une clé `tx: 0` envoyait la caméra à 50 m (cadre vide à 60,9 s, 336 °/s à `camera`). Toutes les visées passent par `at(x, y, z)` (W du puits).
- **« 1 200 » à 38 s (remarque du décor)** : faux souvenir — personne n'écrit les cadrans ailleurs, et l'essai à quatre valeurs (0/0, 1 000/2 000, 1 400/0, 500/1 500) montre des aiguilles justes. Mais l'aiguille est une lame **large côté moyeu, fine à la pointe** : à 0 (pointe en bas à gauche) et à 1 400 (pointe en haut à droite), elle trace **la même diagonale** — à 270 px on lit deux cadrans pareils. C'est ce que tout le monde a vu. Voir « À changer ailleurs ».

## Mesures

- `npm run camera -- CR02` : aucune plage fixe ≥ 1 s entre 30,5 et 61,3 s (avant : 30,5–34,0 et 40,2–41,4) ; vitesse par seconde 4 à 43 °/s, minimum 4–5 °/s à 38, 46–47, 58 s.
- `npm run check -- CR02` passe (avertissements hors de mon acte : `#hud-remain` à 77 s, bord du canvas).

## Les poses qui cadrent (repère du puits, via `at`)

- haut : `at(0, 545, 0)`, d 440, az −54, el 8, shift 20 → interface : `at(0, 420, 0)`, d 450, az −64 (sea 0,32).
- TUBE seul : `at(10, 588, −78)`, d 208, az −70, el 11 · LIGNE : `at(10, 588, −47)`, d 196, az −75, el 7 · les deux : `at(10, 588, −62)`, d 262, az −78, el 10.
- fond : `at(0, 92, 0)`, d 450, az −55, el 6, shift 40 · compteur : `at(−3, 76, 40)`, d 262–290, az −65/−67, el 8, shift 40 · compteur + colonne : `at(0, 110, 26)`, d 380, az −73.

## Un cran en dessous

- 31–33 s : le haut de la colonne, boue sombre peu texturée, cadrans derrière l'en-tête : se lit, sans plus.
- 53–55 s (`VIEW.middle` décalé) : le BOP simple pèse en haut du cadre, la colonne fait ≈ 25 % de la largeur.
- 0 contre 1 400 : lisible par la lunette rouge, le cercle et les étiquettes, pas par les aiguilles (décor).

## À changer ailleurs

- `episodes/CR02-deepwater/src/puits.js`, dans `gauge()`, juste avant `const needle = new THREE.Group();` — un arc de valeur sombre, de 0 jusqu'à l'aiguille (1 400 = un grand arc, 0 = rien) :
  ```js
  const arc = new THREE.Mesh(new THREE.RingGeometry(r * 0.46, r * 0.58, 96, 1, -Math.PI / 4, (3 * Math.PI) / 2), new THREE.MeshBasicMaterial({ color: 0x161210, side: THREE.DoubleSide }));
  arc.scale.x = -1; // the ring runs counter-clockwise from −45°: mirrored, it starts at 0 (lower left) and runs clockwise, like the needle
  arc.position.z = 0.12;
  arc.geometry.setDrawRange(0, 0);
  g.add(arc);
  ```
  `return { g, needle, phi, zoneMats, markMat, arc };` et dans `update`, après les deux lignes `dialT.needle…` / `dialL.needle…` :
  `dialT.arc.geometry.setDrawRange(0, 6 * Math.round(96 * clamp01(S.dialTube / 2000)));`
  `dialL.arc.geometry.setDrawRange(0, 6 * Math.round(96 * clamp01(S.dialLine / 2000)));`
  (et la pointe de l'aiguille plus large que sa queue, si le décor le veut : `ns` 0,95 k ↔ 0,3 k inversés).

## Couverture (proposée, non tirée : budget d'images épuisé)

Repère `vingtdeux` (57,32) · pose `{ ...at(0, 230, 10), d: 600, az: -62, el: 30, shift: 40, fov: 30, dof: 0 }` · état `{ sea: 0.82, gas: 0.6, balance: 1, debit: 22, mark: 1, dialTube: 1400, dialLine: 0, culprit: 1, fault: 1 }` : la colonne vue d'en haut, le gaz rouge qui luit au-dessus du BOP simple, le compteur dans le rouge (les cadrans du pupitre restent hors cadre).

## Images lues

28 (a 8, essai des aiguilles 4, b 8, c 8) : deux de plus que le budget.

## Retouche du 06/11

- **38–45 s, aiguilles sur la même diagonale** → `puits.js` : `gauge({ fill: true })` pour TUBE et LIGNE, arc de valeur sombre `RingGeometry(r·0,30, r·0,60, 96, 1, −π/4, 3π/2)`, `scale.x = −1`, `DoubleSide`, z 0,12 (plus épais que proposé : r·0,46–0,58 restait fin à 270 px) ; `update` : `setDrawRange` selon `dialTube` / `dialLine`. Vérifié à 41 et 43,5 s : TUBE un grand arc noir, LIGNE vide.
- **31–34 s, brun sur brun** → l'eau de mer descend dès la coupe (`sea` 0 → 0,13 de `tot1`+0,1 à « remplace », puis 0,32 comme avant) ; la caméra se rapproche (`pour` d 370, `remplace` d 350, `mer`+0,2 d 380). Coupe d'entrée (pose et état) inchangée. Vérifié à 32,6, 33,9, 36,2 s : chapeau clair sur la boue, colonne ≈ 33 % de la largeur.
- **Heurt 36,9 s** → retrait de la clé `test1` : une seule montée `mer`+0,2 → `cadrans`. **Heurt 56,2 s** → la descente s'étale de « pompes » à « vingt-deux » (`entre` à `at(−2, 120, 30)` d 296, arrivée au compteur sur `vingtdeux`), `souviens` d 256 / az −70 pour ne pas laisser 57,4–59 s fixe. `camera` : aucune plage fixe, 36 s : 43 °/s (cloche), 56 s : 17 °/s. À confirmer au `qa` du prochain brouillon.
- **53–55 s, BOP qui pèse** → `MID` `at(0, 214, 0)` d 320 (au lieu de 235 / 560), `pression` d 308, `pompes` d 298 : colonne ≈ 35–40 % de la largeur, BOP derrière l'en-tête. Vérifié à 52,15, 53, 53,9, 54,8 s. Sortie à `tot4` inchangée.
- Reste faible : 56,6 s, le compteur passe un instant en bas à droite (près des boutons) pendant la descente.
- `npm run check -- CR02` passe. Images lues : 4.
