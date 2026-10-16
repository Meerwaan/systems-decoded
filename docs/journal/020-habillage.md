# 020 · habillage — l'essai du décorateur (2026-10-16)

Premier passage du décorateur (`docs/recette-decorateur.md`), fait à la main par celui qui orchestre, sur le 020 (choix de Merwan ; il était en fait publié le jour même, 16/10 à 17 h). Fichier : `episodes/020-taipei-101/src/habillage.js` ; quatre lignes dans `src/tour.js` (l'import, `dressTour(mount)`, `group.add`, l'appel dans `update`). **Ni le système, ni `world.js`, ni les actes n'ont bougé.** Le film publié (`renders/020-taipei-101.mp4`) n'est PAS refait et ne le sera pas.

## Avant

Dans la cage : la boule, la galerie, toi, la pluie — et derrière, un noir sans profondeur. Dehors : la tour seule dans la pluie, quelques blocs de verre à ses pieds. Rien ne dit « tu es à 400 m au-dessus d'une ville, la nuit ».

## Les touches

| touche | raison | suit |
| --- | --- | --- |
| Taipei la nuit : 22 000 lumières alignées sur les rues, de 26 m à 850 m de l'axe, 3 à 7 px | la profondeur et l'échelle : sous les planchers de verre, la ville ; dans le plan large, un tapis jusqu'à l'horizon | `city` (×1,4) |
| une couronne de 14 spots au plafond de la salle, au-dessus de la boule | la salle de la vraie boule est éclairée comme une scène : un lieu, plus un vide | `shell` |
| des lampes encastrées au bord intérieur de la galerie, côté opposé à la caméra seulement | elles soulignent le pied de la boule sans jamais se poser dessus | `shell` |

## Ce qui a raté en chemin (et la règle qui en sort)

- **Les `THREE.Sprite` ne s'affichent pas sur le plateau** : la lueur est un carré calculé dans son shader, tourné vers la caméra (`glow` du catalogue).
- **Des points de 2,4 px disparaissent en vignette** : la ville n'est apparue qu'à 3–7 px et `k` 1,6.
- Sur l'essai de la cuisine du 018 (abandonné pour le 020, remis tel quel) : une barre à ustensiles derrière la cocotte traversait la soupape — la caméra basse ramène tout le mur à la hauteur du sujet ; une barre de verre vue de côté n'est que reflet (verre plat) ; une coulée de lampe en disque se lit comme une boule collée au mur (`wash` tombe désormais du haut) ; un bocal ou une bouilloire placés hors des plans ne servent à rien (le personnage les cachait). Fichier gardé hors dépôt.

## Images lues

8 (scan du film) + 8 (avant) + 8 (après) + 4 + 4 (en grand) + la planche avant / après : ≈ 40 sur les deux essais, dont ≈ 30 pour le 020.

## qa

Brouillon rendu dans un dossier temporaire (2 min) : 3 606 images, **aucune image parasite**.

## Décision

**Validé par Merwan le 2026-10-16** : l'habillage reste dans le 020, et le décorateur entre dans la chaîne des courts et des longs. Le 020 étant déjà en ligne, il ne se rend pas à nouveau : son habillage reste dans le code comme **référence** du décorateur (un exemple complet d'`habillage.js`), et le décorateur vaut pour les dossiers suivants (« c'est pour les suivantes »). Ne pas relancer `render` sur le 020 : le film changerait par rapport à celui qui est publié.
