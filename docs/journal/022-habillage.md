# 022 — `habillage.js` (la chambre, la nuit) : journal du décorateur

Fichier : `episodes/022-batterie-telephone/src/habillage.js`. API : `dressChambre()` → `{ group, update({ shell }, time, px) }`. Accroché dans `chambre.js` en trois lignes (l'import, `group.add(dress.group)`, `dress.update({ shell }, time, px)` juste après le calcul de `shell`). Planches : dossier temporaire `scratchpad/022/hab-*`. Fait le 17/10, après la voix (96,8 s) et **après le montage des actes** (l'inverse de la recette : tout a été vérifié sur les vraies poses). **30 images lues sur 30** (8 + 8 + 6 + 4 + 4).

## Ce que voient les caméras de la chambre (projeté avant de placer)

- Tous les plans de la chambre sauf un sont **serrés sur l'oreiller** (première image, « Sous l'oreiller », « Et ton oreiller ? », le like, la boucle : d 190 à 360, champ ≈ 90 cm de large à la cible). Le seul vide qu'ils montrent : **la tête de lit**, en haut à gauche, entre l'en-tête et l'oreiller. La fenêtre du mur +x, la table, le sol devant le lit : hors de tous ces cadres.
- La table de nuit (« pas de couverture », « gonflée ») : la prise et l'étiquette `chip-rien` (96, 470) prennent le haut gauche ; une lampe de chevet y serait tombée sous l'étiquette — écartée.
- Le plan large (« tu l'éloignes ») : le chemin veille part de la table et descend vers le cercle au sol — des chaussons entre la table et le lit tombaient dessus à l'écran, la porte d'un mur −x aussi : écartés. La fenêtre du mur +x est juste hors du cadre à droite.

## Ce qui est posé

| touche | sa raison | ce qu'elle suit | où elle se voit |
| --- | --- | --- | --- |
| **La rue derrière le volet** : quatre bandes douces de lumière de la rue sur la tête de lit, au-dessus de l'oreiller, à gauche de ta tête (`slats`, nouvelle brique de `details.js`, encre, k 0,11) | la nuit, lumières éteintes : la seule lueur chaude de la chambre est sous l'oreiller | `shell` (et donc `fade` : elle part avec la chambre dans la plongée vers les pores) | 0,04 s · 51,1 s (`tozero`) · 75,5 s (`tocta`) · 87,6 s (like, sous `#net`) · 95,5 s (boucle) ; petite, sur la tête de lit, dans le plan large |
| **Un verre d'eau** au coin de la table côté lit (`jar` sans couvercle) | ce qu'on pose là avant de dormir | `shell` | 81,2 s (`nocover` : à droite du téléphone posé) ; hors cadre en `TABLE_NEAR` ; un point dans le plan large |

Placement des bandes : trois essais. Au premier (y 73–105) elles passaient sous l'en-tête (236–410) ; au deuxième elles sortaient par la gauche (la tête de lit est 35 cm derrière l'oreiller : vu de az −52, un point de la tête de lit apparaît ≈ 45 cm « à gauche » d'un point de l'oreiller de même x) ; retenu : centre x 12, y 66, 50 × 16 cm — entre ≈ 545 et 670 px dans la première image, sous l'en-tête et au-dessus de l'oreiller, sans traverser la silhouette de ta tête.

Statique : rien ne dépend de `time` ; la première et la dernière image restent les mêmes. Rien ne bouge assez vite pour scintiller (bandes de ≈ 100 px, bords fondus).

## Essayé puis retiré

- **La poussière dans la lumière** (`motes`, 46 traînées devant la tête de lit) : invisible sur toutes les planches (≤ 405 px de large). Un coût sans image, et elle dépend du temps : retirée.
- La lampe de chevet, les chaussons, la porte et sa lumière, la fenêtre et la rue au loin : voir plus haut — hors cadre ou sur le sujet d'un plan.

## Contrôles

- `npm run check -- 022` passe (contraste 66/66 ; les deux avertissements de console et `canvas_content_at_edge` existaient avant).
- Pas de brouillon ni de `qa` faits par moi : à faire par celui qui orchestre.

## Ce qui n'est pas au niveau

- **Deux touches, pas trois à six** : la chambre est filmée serrée, il n'y a de place que sur la tête de lit et la table. Le plan large (≈ 3,6 s, sous le champ du commentaire) reste une boîte vide à droite du lit.
- Le verre d'eau a la forme d'un bocal (`jar` se resserre en haut) : il se lit « un récipient », petit et pâle.
- Les bandes sont fixes : elles ne réagissent à rien de l'histoire (ce n'est pas leur rôle).

## À changer ailleurs

- Rien d'obligatoire. Si l'on veut que le plan large vive : une fenêtre et un rayon de lumière de la rue au sol demanderaient de tourner la caméra de `AWAY` (fin.js) d'une dizaine de degrés vers +x — à décider par celui qui orchestre, pas par moi.
