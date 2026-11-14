# 049 · habillage.js — journal

Décor habillé : `route.js` (enveloppe de la route du 025 + carrefour, champ, haie, panneau, support). L'habillage du 025 (balises J6, panneau A15b, borne, campagne lointaine) vient avec sa route : gardé tel quel.

## Les touches (toutes `ink`, aux rayons X, aucune sur le téléphone, le satellite ou le point bleu)
1. **Deux fermes au-delà du carrefour** (dans `frame`, défilent avec `gap`) : à droite, lampe de cour + deux fenêtres à 300 m, 52 m à droite de l'axe ; à gauche, une lampe + une fenêtre à 600 m. Raison : quelqu'un vit là, personne à qui demander le chemin. Visibles dans la poursuite (`chase`), au-dessus de la haie, de part et d'autre de la route.
2. **Un village sur un coteau, loin à gauche** (≈ 800 m, 32° à gauche de l'axe : la caméra voit 900 m, `far: 90000` dans main.js) : neuf lumières qui dessinent la pente. Raison : « route inconnue ». Dans l'accroche et le plan `phone`, à gauche du téléphone, jamais derrière.
3. **Des lunettes de soleil pliées sur la planche de bord**, à gauche du support (verre + arêtes fines). Raison : il fait nuit, elles ne servent plus ; l'habitacle est habité. Lisibles dans l'accroche, à gauche du pied du support.
- Écartés : des arbres dans la haie (montaient dans l'en-tête de la poursuite, boules autour du téléphone dans l'accroche) ; une lueur de ville sur les nuages (un disque à côté du coin du téléphone) ; une brume sur le champ (le point bleu doit rester la seule lumière du champ).

## Ce que chaque touche suit
- Tout : `shell` (passé par `route.update` : sur l'établi, `shell` 0, tout s'efface). Aucun nombre d'état ajouté.

## Les quatre lignes dans route.js (posées)
- l'import, `const life = dressRoad(); frame.add(life.far); group.add(life.cab);`, `life.update({ shell: sh }, time, px);`.

## Vérifié (24 images lues sur 24)
- Planche avant 8 (`.cache/planches/049/habillage/avant.jpg`), après 8 (`apres.jpg`), deux planches de 4 à 405 px (`apres2.jpg`, `apres3.jpg`, la seconde avec les zones TikTok).
- Accroche à côté de celle d'avant : le téléphone reste le seul sujet ; les lunettes à gauche, plus sombres que le support. Rien sous l'en-tête ni sous les boutons.
- `npm run check -- 049` passe (0 erreur ; l'avertissement et les infos sont ceux des étiquettes, pas de l'habillage).

## Pas au niveau (franchement)
- Dernière retouche NON revue (budget d'images épuisé) : ferme de droite poussée de x 3500 à 5200 (elle tombait juste à côté de la flèche haute du panneau dans `sign`), village remonté (ses lumières traversaient le verre gauche des lunettes dans l'accroche), lueurs de nuages retirées. À regarder sur la planche des candidates de la première image.
- Les lampes de ferme sont petites dans la poursuite (quelques pixels à 270 px) : elles se devinent, comme voulu.
- Les vues hautes (`plunge`, `branches`, `climax`) et le trait (`streak`) n'ont rien reçu : rien n'y manquait qui ne serait pas devant le sujet.

## À changer ailleurs
- Rien d'obligatoire. Hors de mon fichier : `main.js` coupe tout au-delà de 900 m (`far: 90000`) — les hameaux du 025 (2,4 à 3 km) ne se voient donc plus au 049.
