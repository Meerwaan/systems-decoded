# 039 · habillage.js — journal du décorateur

Habille le seul `batiment.js` (sous-sol aux rayons X). Rien sur `model.js` ni `corium.js`, rien sur l'annonce du 040.

## Fait
- `src/habillage.js` : `dressBatiment()` → `{ group, update(P, time, px) }`, accroché dans le groupe `building` de `batiment.js` (3 lignes : import ; `const dress = dressBatiment(); building.add(dress.group);` ; `dress.update(P, time, px);` dans `update`). Suit `shell` (0 sur l'établi via `bench`). Rien ne bouge, rien ne clignote.
- **1 · Éclairage de secours** sur l'enceinte, une rangée à 4 m au-dessus du radier (y = F + 400), azimuts 146 · 158 · 170 · 190 · 202 · 214 (aucun pile derrière la cuve) : `glow` 210 cm k 0,9, `wash` 300 × 480 k 0,34, une réglette (trait). Raison : centrale à l'arrêt, évacuée, sur son éclairage de secours ; profondeur et échelle du noir derrière.
- **2 · Deux lampes sur le mur du fond de la salle** (z = CHAMBER.z0 − room), au-dessus de la bouche du canal, x ± 380, y 150 : la salle vide a un fond, une lumière qui attend au-dessus du chemin du corium.
- **3 · Un escalier** le long de l'enceinte (azimut 132 → 158, deux volées et un palier, garde-corps, une marche sur deux) : la seule chose à l'échelle d'un homme — et personne dessus.

## Ce qui a raté
- Premier placement (lampes à 102…258°, escalier à 236°) : **hors de tous les cadres** — un plan vertical ne voit de l'enceinte que ± 10 m derrière le point visé (chamberLow vise le fond vers x ≈ 500, graze vers x ≈ 1 500). Recentré sur 146…214°.
- Deux gyrophares signal qui respiraient (≈ 2,4 s), pour « l'alarme » : à 270 px, un point rouge près de la cuve, lu comme une braise égarée ; et il leur fallait `mood`, que `batiment.update` ne reçoit pas. Retirés : la menace a déjà sa lumière.
- Les coulées (`wash`) restent à peine visibles à 270 px même à k 0,34 : ce sont les cœurs des lampes qui donnent la profondeur.

## Ce que ça donne (planches dans `.cache/planches/039/habillage/`)
- `avant.jpg` / `apres-final.jpg` (mêmes 8 instants) : image 0 (`POSE0`) **inchangée** — rien de l'habillage n'y entre. Les gros plans (canal, vanne, piscine, galette) inchangés. Le gain est dans les larges : `chamberLow`, `section` / `wide`, `graze` (points de lumière en profondeur, l'escalier à droite de la fosse).
- `zones.jpg` (chamberLow avec l'en-tête) : rien sous l'en-tête ; le bas de l'escalier frôle la colonne des boutons (x > 905), en traits faibles.
- `npm run check -- 039` passe (le contraste à 5,19 s est celui déjà signalé par `batiment` : la peau du ventre).

## Poses (rien de neuf pour les actes)
- Les lampes se voient dans `VIEW.chamberLow` (B), `VIEW.section` / `wide`, `VIEW.graze`, `VIEW.pitSide` de loin ; les deux lampes de la salle surtout dans `graze` (en haut, au-dessus du fond de la salle).

## À changer ailleurs
- Rien d'obligatoire. Proposition, non essayée : l'air du plateau sur une lampe de l'enceinte derrière la fosse dans `chamberLow` (`stage.air.source` = position monde de la lampe à 170°, `[cx + 2592·sin170°, F + 400, cz + 2592·cos170°]` ≈ `[450, -160, -1553]`, `amount` 2, `spread` 0,15, `floor` 0) — seulement si une planche montre un gain net à 270 px.

Images lues : 24 (planches de 8, 8, 4, 3 et 1).
