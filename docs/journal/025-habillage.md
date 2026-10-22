# 025 · ESP — journal de l'habillage `src/habillage.js`

2026-10-17/18. Le décorateur (docs/recette-decorateur.md) sur `route.js`. `model.js`, `world.js`, les actes, `episode.json`, `audio/` : non touchés.

## Accroche dans `route.js` (3 lignes)
- l'import (`dressRoute`) ;
- `const dress = dressRoute(); slide.add(dress.road); pivot.add(dress.far);` (juste après la fusée) ;
- `dress.update({ shell: sh, scroll, slid, co, si }, time, px);` dans `update`, après le bois.

## Les touches (toutes en `ink`, aux rayons X)
1. **Les balises J6** — un poteau blanc de 1,05 m tous les 50 m sur chaque accotement (ton côté : x ED + 85 ; en face : OTHER − 85), son bandeau noir, son catadioptre. Le poteau prend la lumière diffuse des phares (une version élargie des cônes de `route.js`) ; le catadioptre ne renvoie la lumière **que vers les phares** (cône de 14° → 3° autour de la direction des lampes, dans le shader) : vu de devant (l'accroche), il reste éteint. Raison : c'est le visage d'une départementale la nuit, et ça donne le rythme et la profondeur de la route devant et derrière.
2. **Le panneau A15b « passage d'animaux sauvages »** — triangle de 70 cm sur son poteau, double bordure, un cerf en quelques traits (pictogramme, pas de texte), face réfléchissante qui s'allume faiblement dans les phares. Sur la première image il est **derrière** la voiture (z + 26 m, de dos pour la caméra de l'accroche) : l'avertissement que tu viens de passer.
3. **Une borne** de départementale (sommet arrondi, bandeau de tête), loin devant au début.
4. **La campagne au loin, sur les côtés** (dans `pivot`, ne défile pas) : deux fermes (lampe de cour + fenêtres) à 380 m devant-droite et 520 m derrière-gauche, deux hameaux accrochés à une pente à 2,4 et 3 km (leurs lumières dessinent la ligne de la colline : aucune ligne tracée), la lueur du plus grand sur les nuages bas (`glow` du catalogue, k 0,28). **Jamais dans l'axe de la route** (± 25°) : l'accroche, la poursuite, l'élan au bord et la fusée regardent dans l'axe.
- Ce qui flotte dans l'air sous les phares : la pluie de `route.js` le fait déjà ; rien ajouté.

## Ce que chaque touche suit
- Tout : `shell` (passé par `route.update`). Bord de route : `scroll` (= 100·`gap`, enroulé dans une fenêtre de 180 m devant → 70 m derrière, fondue aux deux bouts : rien n'apparaît d'un coup), `slid`, `co`, `si` (pour savoir ce que les phares éclairent). La hauteur de la caméra (lue dans `onBeforeRender`) : au-dessus de ≈ 5 m le bord de route s'efface — `VIEW.top` et `wide` restent nus, pas de barres en travers de la toupie.
- Aucun nombre de l'état ajouté. Aucune géométrie réécrite à chaque image : les objets se déplacent par leur position, leur éclat est un uniform.

## Vérifié (8 images lues sur 24)
- Planche avant (8 poses : accroche, poursuite, top, large, arrière, avant, bord/élan, fusée) : la moitié haute de chaque plan bas est un noir sans profondeur ; la route n'a pas d'échelle hors des lignes peintes.
- Après : **accroche inchangée** (aucun poteau entre la caméra et le sanglier, le panneau loin derrière, catadioptres éteints vus de face) ; top et large inchangés ; poursuite : un poteau à droite du sanglier, à côté, jamais devant ; bord : un poteau en bas à gauche, l'élan dégagé ; arrière : deux lumières de ferme au loin, petites. Poteau à 15 m, panneau à 15 m, borne : lisibles dans la poursuite (le cerf du panneau ne se lit pas à cette distance, le triangle oui).
- Avec les zones TikTok : rien de l'habillage dans l'en-tête ni sous les boutons.
- `npm run check -- 025` passe (0 erreur ; avertissement « canvas à bord » déjà là avant).

## Pas au niveau (franchement)
- Le reflet des catadioptres est discret : un point de quelques pixels depuis la caméra de poursuite (elle est à ≈ 6–7° de l'axe des phares). Plus fort, il ferait concurrence aux yeux du sanglier.
- Le plan de la fusée : rien ajouté (tout ce qui y entrerait tombe soit sur la trajectoire, soit à hauteur du toit, sous y 1 580) ; la lisière y reste pâle.
- Les lumières de campagne ne se voient que dans les plans bas qui regardent de travers (arrière, avant, 1997) et y restent petites.
- Les poteaux défilent avec `gap` : non vus en mouvement. À confirmer au brouillon (`qa`) : 50 m entre deux poteaux, ≈ 3,7 m/s de film, rien de fin qui tourne.

## À changer ailleurs
- Rien d'obligatoire. Pour les actes : le panneau est dans les phares (15 m → 0 devant le nez) quand `gap` va de ≈ 61 à 46, la borne de ≈ −35 à −50 — si un plan de poursuite veut le panneau dans les phares, c'est là.
