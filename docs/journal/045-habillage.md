# 045 · habillage.js — journal

Décorateur, 08/11. Fichier : `episodes/045-autodestruction-fusee/src/habillage.js` (`dressKourou() → { group, update(p, time, px) }`), accroché dans `kourou.js` par **4 lignes** (l'import, `const dress = dressKourou();`, `group.add(dress.group);`, `dress.update(p, time, px);` à la fin de `update`). Rien dans `fusee.js`, rien dans `sauvegarde.js`. Planches : `.cache/planches/045/habillage/`.

## Ce que j'ai lu dans la planche avant (`avant.jpg`, 8 instants, squelettes des actes)

- **Image 0** : ciel noir, la fusée seule. La caméra regarde à 24° et plus au-dessus de l'horizon : rien du sol ne peut y entrer. Je n'y touche pas (vérifié au pixel : différence nulle).
- **Plans larges du sol** (`wide`, `padView`, `couloir`, `verdict`) : le lieu est déjà chargé (mangrove, mâts, bande) ; ce qui manque, c'est **le temps** : rien ne dit qu'une fusée vient de partir d'ici, ni que des morceaux viennent d'y tomber.
- **Le pas de tir au repos** (`padOut`, `booth` avant H0+7, `teaser`) : une fusée posée, inerte.

## Les touches (toutes « ce qui flotte dans l'air du pas de tir », encre, au sol)

1. **Le nuage du décollage** (`climb`, et `fall`, `debris` pour s'effacer) — deux bancs de fumée qui sortent des bouches des carneaux est et ouest (x = ±71 m), bas et larges, qui dérivent au sud-ouest (alizés). Ils naissent dans les premiers mètres de la montée (`climb` 0 → 0,035), puis dérivent et s'amincissent. 37 s après le décollage, ils disent d'où elle est partie (« à un kilomètre du pas de tir ») ; vus de la cabine à H0+7, ils jaillissent. La reconstitution du like les ramène dans les carneaux (l'état rembobine). Le banc est s'efface à moitié sous l'empreinte (`fall`) et avec les débris (`debris`) : le couloir et les morceaux restent le message.
2. **La fumée des retombées** (`debris` 0,5 → 1) — six colonnes fines, penchées vers l'ouest, deux dans la savane, quatre dans la mangrove, toutes dans l'ellipse de `FALL` et loin de la croix du fantôme : les lueurs des débris meurent à 1, la fumée garde l'endroit.
3. **L'haleine froide du pas de tir** (`climb` = 0) — la vapeur des lignes cryogéniques qui roule du bord de la table (faces ouest et nord, celles que voient les caméras) et retombe sur l'aire ; une boucle lente (9 s par bouffée), éteinte dès que la fusée monte. « Armée avant l'allumage, elle attend ».

Brique : `makePuffs(puffs, { k, loop, rate, depth })` — des bouffées douces (points additifs, jamais sous 2,4 px), chacune de `a` à `b` quand l'état monte (ou en boucle), avec une dérive de vent. Aucun saut au modulo ; divisions bornées.

## Réglages (ce qui a raté)

- 1er jet (k 0,05) : rien ne se voyait à 270 px.
- 2e (k 0,15) : les bancs flottaient en boules au-dessus de la mangrove → plus bas, plus denses (48 bouffées, hauteur ≤ 19 m, montée de dérive 2,5 m), k 0,12 puis **0,08** (le cœur du banc à 144/255 au plan large : plus sombre que la fusée et sa traînée). Colonnes : plus fines et plus hautes (26 à 42 m), k 0,18.
- La vapeur ne se voyait pas à `padOut` : la table y est au bord bas du cadre (pas un problème de profondeur : essayé sans `depthTest`, même mesure ; remis).

## Mesures (avant / après, mêmes instants, `diff.mjs` : pixels éclaircis de plus de 6/255, cadre 1080 × 1920)

| plan | pixels | moyenne + | max | où |
| --- | --- | --- | --- | --- |
| 0 hook | 0 | — | 0 | — |
| 9,7 wide | 1 728 | 36 | 144 | x 636–884, y 1 120–1 304 (le banc est, à droite des mâts) |
| 12,1 padView | 1 985 | 40 | 164 | y 996–1 216 |
| 16,3 couloir | 1 575 | 21 | 72 | sur l'empreinte (atténué par `fall`) |
| 40,6 padOut | 110 | — | — | rien (la table au bord bas) |
| 42,3 booth (avant H0+7) | 3 533 | 22 | 84 | la vapeur au pied du pas de tir, jusqu'à y 1 040 (bord haut des écrans) |
| 63,8 verdict | 2 257 | 21 | 84 | colonnes et banc atténué, y 904–1 484 |
| 88,9 teaser | 876 | 13 | 36 | la vapeur, y 1 192–1 668 (à peine) |

## Images lues : 24 / 24

`avant.jpg` (8), `apres.jpg` (8), `apres540.jpg` (4), `apres540b.jpg` (4, avec les zones). La dernière passe (k 0,08, banc est atténué par `debris`) est **mesurée, pas regardée** (`apres3.jpg`).

## Ce qui n'est pas au niveau

- **La vapeur n'a jamais été vue à l'œil** : mesurée seulement (cabine avant H0+7, teaser). À juger sur la planche des candidates ou la relecture ; pour l'éteindre : dans `habillage.js`, `vapour.u.uAmt.value = 0`.
- **Les colonnes** se lisent comme un voile léger au-dessus des débris, pas encore comme six colonnes nettes (vues à 540 px).
- **Le banc est** reste un peu « boule de coton » de près (cabine, 44 s).

## À changer ailleurs

Rien d'obligatoire. Pour les actes : le nuage suit `climb` (il naît entre 0 et 0,035, ≈ 42,7 → 43,8 s dans la cabine) ; la vapeur ne vit qu'à `climb` 0 ; les colonnes entre `debris` 0,5 et 1. Pas de lumière derrière un sujet : pas d'`air` à proposer.

## Pour `docs/catalogue.md`

`045/src/habillage.js` — `makePuffs` : fumées et vapeurs tenues par l'état (ou en boucle lente), au sol d'un décor aux rayons X ; ici bancs de décollage aux carneaux, colonnes des retombées, haleine froide d'un lanceur cryogénique sur sa table.
