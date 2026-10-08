# 010 — model.js (la lame, son bloc d'arbre, la cartouche) — journal

Fichier : `episodes/010-scie/src/model.js`. Planches et `essais.json` dans le dossier temporaire de la session (`scratchpad/010`), rien dans `renders/` ni dans le dépôt. **30 images lues sur 30** (8 + 8 + 6 + 8). Le reste a été vérifié en nombres : un petit script (`scratchpad/010/probe.mjs`) rend un état et lit la couleur du canevas sous des points de la scène — il ne coûte aucune image et a tranché trois questions (la couronne existe-t-elle, le fil se voit-il, qui fait les rayons sur la lame).

## Ce qui est construit

- **La lame** (dans `spin`, origine : son centre) : plaque d'acier découpée dans le profil d'une dent (deux tables, `BACK_T` / `FRONT_T` : dos, pointe, face inclinée, creux), 40 dents, 4 fentes de dilatation terminées par un trou, alésage ; 40 pastilles de carbure plus larges que la plaque (le trait de scie), flasque, écrou (rond : il tourne), bout d'arbre, flasque d'arbre. Avec `turn` 0, une pointe est exactement sur `TOUCH`.
- **La lame qui tourne** : la même acier, un seul shader pour trois objets — la plaque nette, le **disque** (opaque, il écrit sa profondeur, bord en lame de couteau), la **couronne** (les dents étirées le long de leur trajet : pour chaque pixel, la part du temps où une dent le couvre, calculée dans les mêmes tables que la plaque ; la part de carbure à part), et à `blur` ≥ 0,985 l'**anneau** plein (même géométrie que la couronne, opaque). À pleine vitesse : disque sombre (× 0,55), anneau clair haut d'une dent avec trois stries, marques de tournage concentriques, **deux reflets en nœud papillon qui tiennent en place** (la clé du plateau, et une boîte au-dessus pour que le second tombe sur la partie de la lame qui dépasse du plateau), un chatoiement lent (±16 %, période ≈ 8 s). Rien de fin ne tourne : tout ce qui est dessiné à pleine vitesse est concentrique.
- **Le bloc d'arbre** (dans `swing`, qui pivote autour d'`ARBOR.pivot`) : plaque de fonte du côté +x de la lame (œil du pivot, palier d'arbre, un lobe sous eux où la cartouche est goupillée, une fenêtre venue de fonderie), arbre, poulie à gorges, axe de pivot et ses bagues, les deux goupilles de la cartouche.
- **La cartouche** (`cart`, cotes du plan) : boîtier moulé d'une pièce (son coin haut-avant creusé au rayon de la lame, couvercle rapporté, trois vis, trois nervures, deux bossages de goupille) ; **le bloc d'aluminium** (croissant couché sur ce coin, face creusée à R + 2,5 mm, trois lumières fraisées, œil de pivot en aval de la morsure : les dents l'entraînent VERS la lame) ; **le ressort** (coupelle, bague de guidage, demi-coquille derrière, 8 spires, poussoir) et **la lame d'acier** rivée sur la coupelle, couchée le long du tube, son bec sur la collerette du poussoir ; **le déclencheur** (bornier, deux gros conducteurs, **le fil** tendu entre eux — un trait de 3,4 px, jamais plus fin —, et sous son milieu **la petite pièce noire** qui tient la lame d'acier fermée) ; **la carte** (deux condensateurs, thyristor, puce, prise, composants).
- **Sur l'établi** : la même lame et la même cartouche (`rig` change de parent), sur un pied mat (semelle, montant derrière la lame, platine et deux goupilles derrière la cartouche).
- **La morsure** : le bloc pivote (5,8° puis 4,5°), **s'écrase** (les lumières se referment, le bout libre s'enroule sur la lame : maillage et arêtes déplacés ensemble, sur place), étincelles lentes renaissantes, copeaux, une braise au point d'entrée.
- `export const OPENED` : où se tient chaque pièce de la rangée sur l'établi (`block`, `spring`, `wire`, `pcb`), pour écrire les poses.

## Les nombres de l'état

| | |
| --- | --- |
| `bench` | 1 : `rig` passe sous `benchGroup`, centre de lame en `KIT.blade` |
| `turn` | angle de la lame en tours (dessus vers +z). **Sous `blur` 0,5, pas plus de 0,2 tour/s** : au-delà les dents sautent d'une place à l'autre |
| `blur` | 0 plaque nette · 0,05–0,17 fondu plaque → couronne (même angle, même profil : pas de double image) · jusqu'à 0,7 dents étirées (largeur 1,6 · blur^1,5 pas) · 0,7–1 elles se referment en anneau · ≥ 0,985 anneau plein, opaque |
| `signal` | anneaux lents de lumière veille qui courent vers le bord, sur la plaque et le disque ; arêtes de la lame teintées |
| `lid` | opacité du boîtier (ses matières à lui). `explode` le dissout aussi (0,04 → 0,4) |
| `wire` | 1 → 0 : deux moitiés qui se rétractent vers leur conducteur et s'écartent, une perle en fusion à chaque bout |
| `flash` | cœur blanc (rayon 0,14 + 0,42·flash), haleine veille, et une vraie lampe ponctuelle (13·flash) qui éclaire le ressort et la carte |
| `pawl` | pièce noire qui s'envole (0 → 0,55), lame d'acier qui s'ouvre de 26° (0 → 0,3), poussoir et ressort qui suivent le bloc, bloc entré de 6 mm au bout libre |
| `bite` | 4,5° de plus, écrasement du bloc, étincelles (pleines dès 0,6), copeaux, braise |
| `drop` | `swing` tourne de `ARBOR.drop` degrés × drop (linéaire : à l'acte de l'adoucir). À 1, haut de lame à y ≈ 81,95 : sous le dessous du plateau (83) |
| `explode` | boîtier levé et dissous, puis bloc (0,08–0,68) · ressort (0,18–0,78) · déclencheur (0,28–0,88) · carte (0,38–1) : chacun sort d'abord du plan de la lame, puis file le long de la rangée ; le bloc se couche en berceau, le ressort se redresse, le fil se met à l'horizontale |
| `lit…` | teinte + émissif faible : le bloc, le ressort (tube, spires, poussoir, lame d'acier), et pour `litWire` **le fil et ses deux conducteurs seulement** |

## Ce qui a raté, et pourquoi

1. **Premier jet de la lame qui tourne : un disque gris.** Acier trop sombre et trop métallique (0x8a929a, métal 0,45) : il ne reflétait que le studio noir. Éclairci, métal 0,28.
2. **Un anneau noir entre le disque et ses dents** : le chant du disque (2 mm) vu de trois quarts. Son bord est maintenant affûté en couteau, la couronne en sort.
3. **Le reflet tombait sous le plateau** : la clé du plateau donne un nœud papillon orienté à ≈ 45° vers l'avant — caché par la planche. Second reflet ajouté (boîte au-dessus, un peu derrière), qui tombe sur le dôme visible.
4. **La couronne « physique » (transparente) ne se lisait pas** depuis `POSE0` : remarque du décor relayée en cours de route. À pleine vitesse c'est maintenant un anneau plein et clair sur un disque sombre (mesuré depuis `POSE0` : disque ≈ 65/255, anneau ≈ 168, fond 24 ; dans le reflet 160 et 245).
5. **Le signal repeignait la lame en vert** (0,6 → un disque vert) : ramené à des anneaux étroits (onde au cube), fond 0,02.
6. **L'éclair était une boule verte de 7 cm** collée sur le ressort : halo resserré (puissance 3, rayon 0,5 + 1,9·flash), cœur blanc, lampe divisée par deux.
7. **La lame d'acier butait dans le conducteur du haut** en s'ouvrant (elle balaie le plan du fil) : le fil et ses conducteurs sont décalés de 0,6 cm derrière elle (x ≥ 0,35), la pièce noire fait le pont.
8. **La pièce noire sortait gris clair** : son vernis renvoyait la boîte à lumière. Mate.
9. **« Mordu » ne se voyait pas de profil** : un bloc posé devant une lame. D'où l'écrasement (lumières refermées, bout enroulé) : là, on comprend.
10. **`litWire` allumait tout le bornier** (un bloc vert) : restreint au fil et aux conducteurs — corrigé après la dernière planche, **vérifié en nombres seulement** (fil 133/255/188, bornier resté sombre).
11. **Le plan a bougé pendant la séance** (lame remontée de 2,1 cm) : le lobe du bloc d'arbre et sa fenêtre étaient écrits en cotes absolues — passés en cotes relatives au pivot et à la cartouche ; tout suit le plan.

## Poses essayées (complètes)

Atelier :
- la cartouche sous le plateau, trois quarts (`table` 0,15) : `VIEW.cartridge` tel quel — `{ tx: 0, ty: 76.1, tz: -8, d: 95, az: -58, el: 4, fov: 28, shift: 150, side: 0, roll: 0, drift: 0.3 }`, lumière `fx: 0, fy: 76, fz: -8, fs: 30`
- **le déclenchement, de profil** (choisi : c'est là que le geste se lit) : `{ tx: 0, ty: 72.1, tz: -13, d: 56, az: -84, el: 3, fov: 28, shift: 100, side: 0, roll: 0, drift: 0 }`
- les dents dans le bloc, de dessous : `{ tx: 0, ty: 72.6, tz: -8.2, d: 46, az: -38, el: -12, fov: 28, shift: 150, side: 0, roll: 0, drift: 0 }`
- la plongée, de côté : `{ tx: 0, ty: 79, tz: -6, d: 125, az: -88, el: 4, fov: 28, shift: 60, side: 0, roll: 0, drift: 0 }`, lumière `fy: 78, fz: -6, fs: 45`
- la lame de près (essayée avant la remontée du plan, y décalé depuis) : `{ tx: 0, ty: 89.1, tz: 2, d: 88, az: -50, el: 14, fov: 28, shift: 100, side: 0, roll: 0, drift: 0 }`

Établi (`fov: 28`) :
- le tout — quatre azimuts essayés (−25 : lame en tranche ; −45 et −62 : bons ; −80 : presque de face). Choisi **−55** : `{ tx: 0, ty: 15.4, tz: -4.2, d: 158, az: -55, el: 10, fov: 28, shift: 160, side: 60, roll: 0, drift: 0.3 }` (essayé à −45 et −62 ; sujet entre y ≈ 500 et 1150)
- la rangée : `{ tx: -5, ty: 13.5, tz: 3, d: 140, az: -58, el: 8, fov: 28, shift: 58, side: 65, roll: 0, drift: 0.3 }`, lumière `fx: -5, fy: 12, fz: 3, fs: 19`
- le bloc : `{ tx: OPENED.block[0], ty: OPENED.block[1], tz: OPENED.block[2], d: 62, az: -58, el: 8, fov: 28, shift: 150, side: 0, roll: 0, drift: 0.3 }` (= −14.81, 7.4, −2.95), `fs: 10`
- le ressort : idem sur `OPENED.spring` (−11.1, 7.4, 2.99), `d: 50`, `fs: 9`
- le fil : idem sur `OPENED.wire` (−7.92, 7.4, 8.08), `d: 44` essayé (le déclencheur occupe un bon tiers de la largeur ; `d: 38` le serrerait, non essayé), `fs: 8`

## À changer ailleurs

- `world.js` → `VIEW.whole` et `VIEW.exploded` : les deux poses ci-dessus ; ajouter `blockPart`, `springPart`, `wirePart` (importer `OPENED` de `./model.js`).
- `world.js` → `POSE0` : le dôme de la lame est coupé par le bord gauche (sa moitié arrière est hors cadre). `tz: 13` → `≈ 9` le mettrait en entier ; à juger par celui qui tient le décor.
- `shop.js` : la main et le bras portent leur ombre sur la lame sous le plateau (un éventail de rayons, bien visible sur la lame arrêtée — mesuré : 50 contre 99 sans `you`). Si ce n'est pas voulu : pas d'ombre portée pour le personnage.

## Ce qui n'est pas au niveau, ou pas vu

- **Le déclencheur est petit.** Dans la rangée vue de `VIEW.exploded` on ne le lit pas (le fil fait 3,5 cm) : il lui faut son gros plan. Et ce gros plan n'a été vu qu'une fois, avant la correction de `litWire`.
- **Le geste `pawl` 0 → 1 est petit** (les 2,5 mm sont justes) : il se lit par l'éclair et par la lame d'acier qui s'ouvre, pas par le bloc. De profil, à `d` ≤ 56.
- **Boîtier effacé, de trois quarts à `d` 95**, l'intérieur est un fouillis de petites pièces : de profil, il se lit.
- **Jamais vus en image** : `explode` entre 0 et 1 (les trajets), `blur` entre 0,7 et 0,985 (les dents qui se referment en anneau), `blur` 0,25 et 0,6 depuis le passage à l'anneau plein. À regarder sur le brouillon.
- **Les copeaux** (points clairs) se voient à peine ; les étincelles, oui.
- La couronne et l'anneau sont des plans : lame qui tourne vue par la tranche (az proche de 0 ou 180), elle n'a pas d'épaisseur.
- Les normales du bloc écrasé ne sont pas recalculées (l'ombrage garde celui du bloc intact) : rien de visible sur mes planches.
