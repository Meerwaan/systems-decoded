# CR03 — ce que les décors ont changé (à lire avant ta section de docs/CR03-actes.md)

1. **Première image** : `POSE0 = { ...VIEW.arriere, d: 900, drift: 0 }` (trois quarts arrière, le feu sur toute la longueur). Plus `VIEW.first` : l'acte 1 part de POSE0. La boucle (fin) revient sur POSE0.
2. **VIEW nouvelles** : `arriere` (d 1300, le feu), `cede` et `couverture` (réservoir), recadrées : `runway` (fs ≈ 6 000), `v1` (el 8), `pneu` (morceau en vol dans le cadre, d 80), `carte` (fs ≈ 12 000), `vide` (fs ≈ 60, sinon la flaque ambre mange la suie), `preuve` (d 10, gros plan du panneau : les objets retrouvés sont à 100 unités l'un de l'autre, un cadre ne les tient pas tous), `bay`, `impact`, `panneau`.
3. **plan.js** : `IMPACT` et `PANEL` sont SUR la coupe (x = 0) ; `DEBRIS.from` bas à gauche ; `STRIP` 0,24 × 0,11 (lamelle plate).
4. **Réservoir** : nouveau nombre `kero` (0,5 terne → 1 sur « plein ») ; `A.panel` = le trou (fixe, pour le cercle), `A.fault` = le panneau qui tombe ; remettre `tear` à 0 seulement sous une coupe (le panneau remonterait).
5. **Concorde** : `n1…n4` doivent descendre franchement (pas de rotation à l'envers) ; la coupe des deux moteurs côte à côte (`cutaway`) ne se lit pas à 270 px sur les poses essayées : profil gauche, un peu en dessous, à vérifier par l'acte qui la monte. La goutte de 1979 demande un plan serré sous le réservoir 5 (pas `VIEW.dessous`, qui coupe l'avion au bord droit).
6. **Piste** : la barre de freinage est verte tant qu'elle finit sur la piste, rouge au-delà ; `inspect` lave la piste en vert ; `bourget` jusqu'à 1,25 pour une seconde pulsation ; Le Bourget allumé n'est vérifié que de loin ; d'en haut l'hôtel se repère par la fin de la trajectoire.

## Vague 2 (acte3, fin) — ce que la vague 1 a rendu
- acte2c rend à acte3 (97,84) : piste vide, `alt` −100 (avion caché), `soot` 1, `culprit` 1 (lamelle), `fault` 1, `cutaway` 0 (la coupe des nacelles n'est montée nulle part : illisible à 270 px).
- La lamelle rouge est déjà cerclée deux fois (acte2 « titane », acte2c issue) : en acte3, le défaut c'est le réservoir 5 (`VIEW.impact`, `panneau`, `cede` en gros plans plutôt que `bay`, qui est petit).
- Couverture proposée par acte2 : lamelle rouge + règle (`t1:centimètres+0.4`) ; `VIEW.couverture` (réservoir) existe aussi.
