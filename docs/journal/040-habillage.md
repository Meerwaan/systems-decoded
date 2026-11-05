# 040 · habillage.js — journal du décorateur (la crête)

2026-11-05. Agent `decorateur`, fichier `episodes/040-abri-anti-feu/src/habillage.js`, décor habillé : `crete.js` seul. Planches : `.cache/planches/040/habillage/` (`essais.json` : 0,04 · 10,6 crest · zeroWide · back · standing ; états et poses écrits en dur pour les plans d'acte 3 et de fin, les actes n'étant pas montés).

## Lu
recette-decorateur, recette-agents (cadre, première image, économie), regles-image, `040-actes.md` (haut, acte1, candidates), `040-actes-maj.md`, journal `040-crete.md`, `plan.js`, `world.js` (FIRST, POSE0, VIEW, STAGED), en-tête et `update` de `crete.js`, en-tête de `details.js`.

## Ce qui est posé (trois touches)
1. **La ligne de bulldozer** : deux passes le long de la crête (z ≈ −320 et +360, chacune deux chenilles de 56 cm à 2 m d'écart, qui ondulent), les bords des chenilles et les tuiles tous les 30 cm, dessinés dans un shader sur un ruban posé 6 cm au-dessus du masque (`polygonOffset` −2/−4 : à 1 cm le masque la mangeait). Tuiles fondues en bande égale avant de passer sous quelques pixels. Rien à moins de 9 m de ton abri, rien de ton côté −x à moins de 28 m, rien sur l'emplacement du duo, effacée aux deux bouts. Suit `shell`. **Se lit dans `crest`** : une double bande en tirets qui file vers les équipes (la perspective du plan).
2. **Deux chicots fumants** sur le flanc +z, placés par projection sur `VIEW.back` (gauche et droite de ton dôme, jamais au-dessus) : tronc du bois de la forêt (même matière que crete.js, noircit avec `burn`), un filet de fumée en bande pliée (20 rangs) tournée vers la caméra, couché par le vent (+z, un peu −x) et qui se balance lentement (40 s). Fumée selon `burn` (seuils 0,5 et 0,55). Derrière toutes les autres caméras (vérifié à la main contre `CLEAR`).
3. **Un sac de ligne jeté** au bord de l'emplacement de l'équipe 39 ([1150, 182]) : verre + contour fin, sa sangle qui traîne. Se voit dans `zeroWide`, entre les deux dômes du premier plan. Suit `shell`.

## Essayé et retiré
- **Des braises sur le sommet raclé** (220 points, selon `burn`) : invisibles à la distance de toutes les poses (2,6 px au plus) — un coût sans image.
- **Deux fumées en bas du flanc −z pour `standing`** (« face à la pente qui fume ») : depuis la crête, le vent les pousse vers la caméra, la colonne reste droite → un pilier puis un faisceau pâle qui traverse le personnage debout. Retirées.
- Premier jet des fumées : quad droit de 17 m → des faisceaux de projecteur qui montaient dans l'en-tête ; corrigé (bande pliée, 11 m, penchée).

## Première image
0,04 s : identique à l'avant (rien de l'habillage n'est dans le champ de POSE0 : la ligne de bulldozer court le long de x, hors du coin regardé ; chicots et sac loin derrière d'autres caméras).

## Planches (images lues : 23)
avant (4) · apres1 (4, rien ne se voyait : ruban sous le masque) · apres2 (5) · grand1 (3 × 520 px) · apres3 avec zones (5) · grand2 (2 × 540 px). `apres.jpg` (état final, 5) tirée pour la planche des candidates, **non relue** (budget) : elle ne diffère d'apres3 que par des retraits (braises, fumées de `standing`) et la pente des fumées vue sur grand2.

## Pas au niveau
- La ligne de bulldozer reste discrète à 270 px dans `back` ; elle paie surtout dans `crest`.
- Le sac ne se voit que dans `zeroWide` tel qu'il est posé dans `VIEW` : si l'acte 3 change ce cadrage, il peut sortir du champ.
- `standing` (le like) reste sans fumée : la pente qui fume, si l'acte la veut, viendra de `smoke` (feu.js).

## À changer ailleurs
- Rien d'obligatoire. Les trois lignes sont posées dans `crete.js` (import, `group.add(dress.group)` après `pad`, `dress.update(p, time, px)` à la fin de `update`).

`npm run check -- 040` : passe (avertissement de contraste de la nav à 24,46 s, déjà connu).
