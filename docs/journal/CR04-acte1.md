# CR04 · Lac-Mégantic — journal de `acte1.js` (01 L'HEURE, 0 → tot1)

## Monté
- **0 → 3,16** POSE0 / FIRST, sans coupe : le train roule seul dès l'image 1 (`run` 1,4/s, `"none"`), la lumière suit la roue, la caméra suit à 60 % de sa vitesse (la roue gagne dans le cadre, le rail glisse) ; `slack` 0 → 0,04 autour de « démarre » ; punch `choc` relâché avant la coupe.
- **3,30** coupe sur le volant (rouge, chaîne tendue), le train roule toujours : la caméra suit la locomotive (`LR`), le sol glisse ; volant ≈ 400 px, centre y ≈ 700.
- **5,04** coupe : la tête garée moteur allumé, `VIEW.cheminee` × 1,3 ; « coupé » : `cutoff` 0 → 1, `engine` → 0, la fumée meurt ; punch « locomotive ».
- **8,43 → 11,66** glissé vers le flanc : les deux camps dans un cadre (`CAMP`, d ≈ 64, volant en haut, cylindre et conduite au milieu) ; `#mano` entre (60) ; « l'air » `ok` 0,6 (cylindre et conduite verts) ; « freins » la caméra monte vers le volant.
- **11,66** coupe `VIEW.coupe` (solo, cutaway) puis UN `path` le long de la machine : cylindre sur « serrent » (`psi` 0 → 70, `ok` 0,7) → compresseur sur « compresseur » (`engine` 0 → 1 sur « rechargé », `ok` 1) → il s'arrête sur « Coupe » → flanc cylindre + raccords sur « fuit » (`leak` 1, `culprit` 3, `fault` 1, `psi` → 62) → le volant (le rouge s'en va, « tient » : `brakes` 0 → 1 en 1,1 s) → recul vif sur « assez » (d 190), punch relâché avant la coupe.
- **23,57** coupe `VIEW.pente` : « dix » `pull`, « il » `hold` + `#colonne` vide, « soixante-six » `mark` (punch), « Retiens » la marque pulse ; poussée lente (d × 0,92, az + 4).

## Rendu à l'acte 2 (à `tot1`)
Pente, train garé (`run` 0, `slack` 0), `pull` 1, `hold` 1, `col` 1, `mark` 1, `brakes` 0, `psi` 0, `engine` 0, `cutoff` 1, `solo` 0, `cutaway` 0 ; pose ≈ `{ ...VIEW.pente, d × 0,92, az + 4 }`.

## Planches (32 images lues : budget de 26 DÉPASSÉ de 6)
- p1 (0,02 → 9,0) : volant de l'accroche trop gros, dans l'en-tête → d 25, shift 230 ; camps trop serrés.
- p2 (10,2 → 22,0) : camps sans le volant ; cylindre flou trop près ; compresseur trop bas ; à 18,0 le compresseur sort du cadre ; volant trop gros.
- p3 (corrigé) : volant de l'accroche bon ; camps lisibles ; cylindre, compresseur, fuite lisibles ; 18,0 encore sorti → clé `coupe` + 0,5.
- p4 : camps bons (volant sous l'en-tête, mano à gauche), 17,9 compresseur bon, recul « assez » lit le volant petit sur la caisse ; **pente : la flèche verte absente à 27,5 et 29,8** (le trajet tournait de + 6 à + 15°) → trajet ramené à + 4° au plus, **non revu**.

## Un cran en dessous (franchement)
- `seuil` (23,57 → 29,98) : le correctif de la flèche verte n'a pas été revu à l'image ; le train reste un trait fin (maj § 5). À tirer au relecteur : 27,0 et 29,7.
- Le volant ne peut pas « s'allumer en vert » (`brakeMat` est `noOk`) : sur « freins » (10,60) et « tient » (21,34), seul le geste (caméra qui monte, volant qui tourne) le désigne.
- `VIEW.coupe` à 12,6 : les portes ouvertes du capot se lisent peu ; le compresseur n'y est qu'un point (journal locomotive).
- La chaîne rouge de l'image 0 passe dans l'en-tête (choix de POSE0, maj § 1).

## Sons (pour le monteur-son)
0,0 frottement du sabot / grincement de roue · 2,90 (souffle après « démarre ») coup sourd des attelages · 6,36 l'horloge recule (clac) · 6,84 → 7,1 le moteur s'éteint, le coupe-circuit claque (dans le souffle 7,9) · 15,9 le compresseur démarre · 17,42 → 18,4 il ralentit · 18,95 → 19,3 bouffées d'air (souffle après « fuit ») · 21,5 → 22,4 cliquet du volant · 22,6 → 23,5 recul vif (swish) · 23,57 coupe sur la pente (hit, souffle 23,34 → 23,69) · 24,7 la flèche rouge · 27,4 → 28,0 la marque « 66 t » (tic, souffle 28,58 → 28,98).

## À changer ailleurs
- `episodes/CR04-lac-megantic/src/locomotive.js` (ligne ≈ 804) : un volant serré pourrait prendre le vert de `ok` (comme le propose le journal `convoi`) : `setOk`-style « vert quand serré × ok » pour que « tient » (21,34) et « freins » (10,60) s'allument. Facultatif.

## Retouche du 14/11
- 0 → 2,5 lent → `V` 1,4 → 2,2 (roue ≈ 50°/s), caméra qui suit à 30 % au lieu de 60 % (la roue avance dans le cadre) ; POSE0 à 0 inchangée. Vérifié à 0,04 / 0,5 : la roue a bougé, une bouffée sort. Reste faible à mesurer : la caméra est angulairement fixe 0 → 2,6 (`camera`), seul le sujet bouge — à relire au `qa` du prochain brouillon.
- Heurtés 15,5 / 18,3 / 20,2 / 23,0 → le `path` unique devient cinq plans en coupes nettes (chaque coupe 0,12 s avant son mot) avec poussée lente : capot vu d'en haut (11,66) → cylindre `serrent − 0,12` → compresseur `rechargé − 0,12` → raccords `fuit − 0,5` (souffle après « moteur… ») → volant `tient − 1,15` (avant « Le frein à main ») → recul lent d × 1,7 jusqu'à la pente (au lieu de d 190 en 1 s). La lumière saute avec chaque coupe. `camera` : 11 → 21 s entre 4 et 8 °/s (avant : 87 °/s à 12-13 s), 22-23 s à 32-35 °/s. Vérifié à 15,62 / 18,4 / 20,25 / 23,3.
- 9,0 `#mano` sur « 5017 » → `mano` entre sur « l'air » (`campair − 0,15`). Vérifié à 9,0 : 5017 libre.
- 12,6 aplat ocre, capot peu lisible → l'ouverture du principe n'est plus `VIEW.coupe` (flanc fermé) mais une vue plongeante sur le capot ouvert (`L([0,34,46]) → L([-24,10,0])`, dof 0, lumière sur le capot dans l'état de la coupe). **Non revu à l'image** (budget de 12 images atteint) : à lire au prochain brouillon à 12,6 et 14,5.
- 27,0 / 29,7 flèche verte : présente aux deux instants (petite, en haut à droite de la voie). Aucun changement.
- `npm run check -- CR04` passe.
