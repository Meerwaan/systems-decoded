# 025 · ESP — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/025-actes.md`. Les décors sont rendus : `docs/journal/025-route.md`, `docs/journal/025-model.md`, l'habillage `docs/journal/025-habillage.md`. **La voix est enregistrée** (91,5 s ; « Alors… on l'ouvre » vient d'une reprise, déjà montée) : les repères tombent sur les vrais mots.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate (b) recadrée, `{ tx: 0, ty: 50, tz: -2035, d: 950, az: -172, el: 3, fov: 34, shift: 120 }` — le sanglier de profil en silhouette au centre-gauche, ses soies, un œil signal ; ta voiture et ses deux phares au fond, en haut à droite. `FIRST` n'a pas bougé. Personne ne les change.
- **Le sanglier se tient à `gap`** : si l'acte 1 fait filer `gap`, il s'éloigne de la caméra vers la voiture. La caméra le suit (`tz` = −235 − 100·gap) ou pousse plus vite que lui.
- **L'azimut** : az 0 = la caméra derrière la voiture (+z), az −90 = son flanc gauche (−x).
- Le 026 est le Soyouz MS-10 : `abo` et `boucle` sont dans le script, la fusée dans `route.js` (`VIEW.rocket`).

## Les poses (vues sur planche)

- `VIEW` mis à jour d'après les journaux : `whole` et `exploded` (de az −12 : à −24 le coin avant droit tombe sous les boutons de TikTok ; chaque pièce y est petite, ce sont des cadres « toute la voiture »), `ecuBench` et `unit` (visée sur le centre du cadran), `wheelBench`, `cornerFR` (de l'avant gauche, az −135 : de az −40 tes mains cachaient le coin), `engine`, `rocket` (voiture arrêtée : `kmh` 0, `lane` −0,6, `gap` fixe). `top`, `wide`, `verge` (avec `gap` 18), `tip` (1997), `yawBench`, `system` : vus, ils cadrent.
- **Le comparateur** se lit très bien de près (`ecuBench`, `unit`) : c'est lui qui dit « oui / non » — l'aiguille encre = où tu veux aller, l'aiguille veille/signal = où va la voiture, le secteur entre les deux s'allume.

## Ce qui n'est pas au niveau, et comment le filmer

- **Vu de dessus (`top`)**, le coin avant droit qui serre n'est qu'une petite tache veille : la lueur de jante (`bFR`) porte le plan, sinon un plan serré sur l'avant (`cornerFR`).
- Le plan du moteur (`engine`) est encombré par le frein avant gauche : plan bref, ou laisse-le.
- Dans les plans serrés de l'établi, les fils pulsés (`sense`) font du fouillis vert : `sense` à 0 quand ils ne sont pas le sujet.
- Les corps des bêtes dans les phares tirent vers le gris plein (surtout l'élan) ; 1997 avec l'élan dans le même cadre : pose à trouver.
- Le ralenti (`SLOWMO` 6) n'a pas été vu en mouvement : la médiane avance de 12 cm par image, à confirmer au brouillon.
- **Habillage** : balises J6 tous les 50 m, un panneau « passage d'animaux sauvages » (passe de 15 m devant le nez jusqu'au nez quand `gap` va de ≈ 61 à 46), une borne, des fermes et hameaux au loin. Tout s'efface au-dessus de 5 m de caméra : `top` et `wide` restent nus.

## Le tact

Personne n'est blessé ; le sanglier n'est pas touché. 1997 : la voiture bascule, sans corps ni violence.
