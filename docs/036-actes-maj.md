# 036 — ce que les décors ont changé (à lire avant d'écrire un acte)

1. **POSE0** choisie : `{ tx:-959, ty:4728, tz:-1597, d:13064, az:-12.2, el:-20, fov:82, shift:120 }` — derrière ta voiture, contre-plongée ; moyeu vers y ≈ 660, voiture 1320–1600. `hook` = POSE0. Ne pas resserrer le fov sans revoir la voiture (sous 1600 elle disparaît).
2. **Poses revues** (`world.js`) : `system`, `whole`, `battery`, `section` (principe : d 1500 sur la coupe, avec `rotor` 0,25), `ladder` (caméra DANS le mât ; l'acte fait suivre `ty = 12 + tech × 7298 + 330`). **Non revues** : `motor` (pignon lisible seulement à el −10), `exploded` (chargé), `brake`, la couverture : les vérifier sur planche avant d'y poser une phrase.
3. **Poses neuves** : `VIEW.feather` (la chute, filets `slip` de trois quarts — pas `VIEW.rotor`, qui écrase les filets) ; `VIEW.fold` (Formerie, le pli de profil ; `FOLD.toward` passe à 60).
4. **`PITCH.at` et `BATTERY`** ont bougé dans `plan.js` : lire les poses, jamais des coordonnées recopiées.
5. **Le pignon tourne 6 × la pale** : 30° de pas = un demi-tour de pignon, lisible. `charge` < 0,5 passe la jauge au signal.
6. **`rpm`** : éventail éteint sous ≈ 4 tr/min ; traînées des bouts encre, signal entre 12,7 et 13,3. L'emballement = un instant (rpm 11 → 13+ en ≈ 1 s), pas dix secondes.
7. **`shake`** (2,1 Hz, ≈ 3 m au bout) ne se lit qu'en mouvement ; `mood` pilote aussi le halo du rotor (1 signal, 0 encre sombre) — scènes calmes : `mood` bas.
8. **`tech`** au like : de 0,45 à 0,55, pas de 0,2 à 0,6 (13 m/s).
9. **Principe** : la pale A de verre traverse la coupe ; si elle couvre le haut du profil sur planche, le signaler (retouche `eolienne.js`).
10. `slip` lit `rotor` (transmis) ; `pitchB/C` et `rpm` ne sont pas lus par `vent.js`.
