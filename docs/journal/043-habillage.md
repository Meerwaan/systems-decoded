# 043 · habillage.js — journal du décorateur

## Lu
recette-decorateur (entière), recette-agents (cadre, première image, économie), regles-image, 043-actes-maj, 043-actes (haut, plans, candidates), world.js, plan.js, journaux 043-anneau et 043-sortie, details.js (tête, glow, update), anneau.js (ribbon, bp, tunnel, update), sortie.js (repère ligne, caverne, update).

## Touches posées (`episodes/043-faisceau-cern/src/habillage.js`)
Tunnel de l'anneau (`dressTunnel`, repère monde, `bp(s, out, up)` comme anneau.js), traits en rubans de pixels qui s'effacent près de l'œil (40 → 160 cm) et au loin (11 → 24 m), comme les traits du tunnel :
1. **Ligne cryogénique (QRL)** contre le mur extérieur, au-dessus des aimants (out 74, up 124, r 22) : trois génératrices, une bride à chaque bout d'aimant, un bras au mur, un piquage vers la chaîne une fois par maille (aimant i ≡ 3 mod 7, jamais l'aimant 0). Raison : l'hélium qui rend les aimants supraconducteurs court à côté d'eux tout le tour.
2. **Monorail** sous la voûte, au-dessus du passage (out −150, up 186/196), une suspente par section : le rail du train d'inspection (TIM) — personne ne marche là quand le faisceau tourne.
3. **Deux chemins de câbles** sur le mur intérieur (up 92 et 128) : bord, rebord, une console par section — les 3 600 capteurs parlent à quelqu'un.
4. **Réglettes** sous la voûte (out −96, up 222), une par aimant, 3 px, k 0,62, fondu 13 → 26 m.
Rien sur l'insertion (point 6 ± 9 m) : `gapFind`/`fire` regardent les cuves à travers le mur intérieur, les chemins de câbles y seraient passés devant.

Ligne et caverne (`dressCavern`, repère `line` de sortie.js, `makeDresser().glow`) :
5. **Lampes du tunnel de la ligne** (u 1 750 → 2 650, tous les 3 m, sous la voûte, size 90, k 0,7).
6. **Lampes de la caverne** : deux rangées de quatre sous le toit (x ±130, au-dessus des blindages, jamais sur l'axe du bloc), size 130, k 0,75. Premier essai à size 16/22 : invisibles (le cœur de `glow` fait 13 % de sa taille : à 15–23 m, deux pixels).

## Nombres suivis
Tunnel : `shell` (anneau.js `update`, `habit.update({ shell: p.shell })`). Caverne : `cavern` (sortie.js, `habit.update({ cavern: cav })`).

## Lignes posées dans les décors (3 chacun)
- anneau.js : `import { dressTunnel } from "./habillage.js";` · `const habit = dressTunnel(); group.add(habit.group);` après `group.add(tunLines);` · `habit.update({ shell: p.shell }, time, px);` après la ligne des `tunLines`.
- sortie.js : `import { dressCavern } from "./habillage.js";` · `const habit = dressCavern(); line.add(habit.group);` après `group.add(line);` · `habit.update({ cavern: cav }, time, px);` après `const cav = clamp01(p.cavern);`.

## Planches (`.cache/planches/043/habillage/`)
- `avant.jpg` / `apres.jpg` (8, mêmes instants : 0,02 image 0 · 5,5 blockFar · 10,8 coil · 16 trainLong · 27,2 lineLong · 29 blockHero · 42,5 gapFind · 72,5 tally). Image 0 : identique à 270 px (rien entre l'œil et le train, rien sur le grain) — au moins aussi forte.
- `grand.jpg` (4 à 540, avec en-tête et zones) : image 0, blockFar, trainLong, blockHero. Les lampes de la caverne se lisent sous le toit (blockFar, blockHero, en zone haute) ; rien ne traverse le bloc ni le train.
- `reprise.jpg` (4 : image 0, lineLong, verdict, exitLit).
Images lues : 24 / 24. `npm run check -- 043` : passe (0 erreur).

## Pas au niveau (franchement)
- **Le tunnel de l'anneau paie peu** : les caméras du film sont au ras du faisceau et regardent le long de l'axe ; les murs tombent hors cadre (coil, tally, hero) ou sous l'en-tête (image 0 : les réglettes et les brides de la QRL vers y ≈ 240–300, très pâles, n'attirent pas l'œil). Elles se devinent dans `trainLong` (structure le long de la courbe). Je n'ai pas pu les isoler à 270 px.
- Les lampes du tunnel de la ligne ne se voient pas dans `lineLong` (trop loin, pas de halo) ; celles de la caverne sont discrètes (traînées douces sous le toit).
- Non vu : `ringArc`, `sensors` (tout s'éteint au-delà de 24 m : rien n'y change), `like`, `grainFloat`, `monitor` (la QRL est 54° au-dessus de l'axe : hors cadre par le calcul).

## À changer ailleurs
Rien d'obligatoire. Si l'on veut que le tunnel se lise comme un lieu, il faut un plan qui regarde un mur (p. ex. `tally` avec `el` −4 et `ty` 40, ou `trainLong` plus bas) : c'est aux actes d'en décider.

## Pour docs/catalogue.md
`043/habillage.js` — `dressTunnel` : un tunnel technique courbe habillé aux rayons X (ligne cryogénique, monorail, chemins de câbles, réglettes) en rubans qui s'effacent avec la distance ; resservira pour tout tunnel ou galerie (métro, tunnel routier, galerie de service).
