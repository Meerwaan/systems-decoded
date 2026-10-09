# 012 — fire.js (la flamme, le gaz, l'étincelle) — journal

Budget : 30 images lues au plus. Planches dans le dossier temporaire `…/scratchpad/012` (jamais dans `renders/`).

## Parti pris

- **La couronne** : 36 flammes instanciées (une tous les 10°, la n° 0 exactement dans la direction `SPILL.dir`, qui est aussi
  l'angle de la pointe du thermocouple). Chaque flamme est un vrai volume : un tube en goutte le long d'une courbe de Bézier
  dans le plan (rayon, hauteur), éclairé « en épaisseur » (n·v) : bords doux, jamais un cône dur. Trois peaux par flamme :
  le halo (signal, large, faible), le corps (signal), le cœur (ink, court, à la racine). Additif, borné.
- **Elle meurt en faisant le tour** : un front d'angle `F(flame)` part de `SPILL.dir` des deux côtés ; les flammes sur le front
  raccourcissent et vacillent (≈ 1,5 Hz), les dernières à l'opposé prennent plus de temps (courbe en `1 − flame^1,35`).
- **Le gaz** : des rubans face caméra qui suivent des lignes de courant sorties des mêmes fentes (deux par fente), larges,
  ternes, avec des bouffées qui avancent lentement. Une fente n'émet du gaz que si sa flamme est morte.
- **La pièce** : une colonne (les mêmes rubans, en grand, qui contournent la hotte) + une couche sous le plafond en vrai volume
  (un pavé traversé pas à pas, bruit 3D, auto-absorption) + l'étincelle (un panneau face caméra : cœur, corps, longue traîne).
- **La lueur** : une lumière ponctuelle signal dans la couronne (elle éclaire le chapeau, la pointe, les grilles), un anneau de
  lumière sur la plaque, un autre sous le fond de la casserole, une bande sur le bas de sa paroi.

## Au fil de l'eau

### Planche 1 (8 images lues — total 8)

Tout tourne, rien n'est au niveau :
- **Flammes roses, en aiguilles.** Additif : là où les flammes se recouvrent le signal dépasse 2, et le tone mapping
  (Neutral) le désature en saumon. Remède : « le plus clair gagne » (`MaxEquation`, comme `bolt.js`) — plus d'addition,
  le corps reste signal, le cœur ink le remplace au lieu de s'y ajouter, et le creux entre deux dents redevient sombre.
  Et la forme : 5,5 cm pour 1 cm de large = des épines. → 32 flammes, 4 cm, plus larges, pointe ronde.
- **Le gaz ressemble à un incendie** (POSE0) : trop vif, trop strié, il converge en langues. → quatre fois moins de
  lumière, rubans plus larges, il s'évase en montant.
- **La couche = un voile flou.** → relief : dessous en bosses plus grandes, bord plus net, une lumière de côté
  (un troisième échantillon vers la lumière : les bosses ont une face claire et une face sombre), plus d'absorption.
- L'étincelle : lisible (étoile à quatre branches), petite. Bien.
- `--bare` laisse les zones TikTok dessinées : seule manque la planche avec l'en-tête.

### Planche 2 (5 images — total 13) · `model.js` est arrivé

- Flammes en « le plus clair gagne » : signal franc, dents lisibles. Mais encore sombres, sans cœur visible, et celles
  qui pointent vers la caméra disparaissent (une peau éclairée par n·v est creuse vue en bout).
- `model.js` : couronne à **40 fentes**, fente i à l'angle π/2 − i·9° (x = cos, z = sin) → `PORTS = 40`, `portAt(i)`.
  La pointe du thermocouple (120,6°) tombe entre deux fentes (117° et 126°) : la flamme de 117° **se courbe vers elle**
  (`aBend`, 0,36 cm), sa racine reste dans sa fente.
- Mélanger ink et signal donne du saumon (30 % d'ink suffit) : corps signal pur, cœur ink pur, rien entre les deux.
- Vue en bout : `pow(n·v, mix(power, 0.3, (v·T)²))` — la flamme qui pointe vers l'œil est pleine.
- Le gaz, à POSE0 : terne enfin, mais encore des langues. La couche a du relief avec la lumière de côté.

### Planche 3 (4 images — total 17)

- Sous la casserole (bouchon) : pétales + cœurs blancs à chaque fente, ça se lit « gazinière ».
- Établi : dents trop pointues → profil `(1 − t³)^0.6`, 10 % plus courtes, fondu plus tard.
- Une lueur sur le chapeau (`onCap`, brillante au bord) : l'émail est presque noir, une vraie lumière n'y fait rien.

### Planche 4 (6 images — total 23) · `hob.js` est arrivé : tout est en verre, sombre

- **VIEW.burner, flame 1 : l'image du film.** Couronne de pétales signal, un cœur blanc par fente, sous la casserole
  de verre et ses bulles. On pense « gazinière » tout de suite.
- flame 0,6 / 0,3 : le devant est mort (la mousse y tombe), il reste les côtés, puis quelques flammes au fond.
- Établi (`VIEW.whole`) : la couronne libre, les cœurs blancs. Les pointes des flammes du fond montent à y ≈ 350 px :
  dans l'en-tête. `VIEW.tipPart` : la pointe devant sa flamme, les flammes en plumes douces.
- POSE0 (d 150) : la couronne fait ≈ 200 px de large. On lit un petit anneau de feu, pas plus.

### Mesures sans image, puis planche 5 (6 images — total 29) : le gaz, la pièce, l'étincelle, avec l'en-tête

- Le gaz en additif devenait rose devant la mousse et vif aux limbes ; en « le plus clair gagne » il disparaissait
  devant tout ce qui est clair. **C'est de la matière : il est posé PAR-DESSUS l'image** (une seule couleur terne,
  plus ou moins opaque) — il teinte et assombrit ce qui est clair, il se voit sur le noir, et cent rubans superposés
  ne dépassent jamais cette couleur. Indépendant de l'ordre de dessin (même couleur partout).
- VIEW.room, fill 0,3 : la colonne monte de la casserole, contourne la hotte, s'étale sous le plafond — **derrière
  l'en-tête** (le plafond est à y ≈ 376 px dans cette pose). fill 0,7 : une couche à dessous bosselé.
- Pose basse (`ty 150, el −3`), fill 1 : le dessous de la couche vu d'en bas, avec son relief ; plaque et personnage lisibles.
- Étincelle : perdue sur la plaque claire de l'interrupteur → plus grande, corps et rayons plus forts (mesurée : +29 de
  rouge moyen sur une tuile de 120 × 160 px à `spark` 1, +57 à 1,5).
- En gros plan, des rubans vrillés (nœud papillon) là où une traînée pointe vers la caméra → rubans tournés vers l'œil
  **dans l'espace** (`cross(tangente, regard)`), et une traînée vue en bout s'efface.

### Dernière image (1 — total 30) : VIEW.burner, gaz seul

Plus de rubans vrillés. Une brume terne sous la casserole et autour, sans cœur, sans dents : on ne la confond pas avec
la flamme. Mais sur une image arrêtée, les traînées ne se lisent guère : c'est une brume assez unie.
(Mesuré : opacité moyenne 0,17 devant la casserole, de 0,08 à 0,28 d'une colonne à l'autre.)

Réglages faits ensuite **sans image** (budget épuisé) : `LIGHT` 40 → 28 (la lumière de la couronne éclairait l'eau de
la casserole par-dessous, à 1,2 cm), panache de l'établi raccourci (30 cm au lieu de 42). `npm run check -- 012` passe.

## Ce que fait chaque nombre

| | |
| --- | --- |
| `flame` | 1 : 40 flammes. Le front de mort part de `SPILL.dir`, des deux côtés : **0,9** = 5 fentes de devant (3 mortes, 2 qui vacillent) · **0,6** = la moitié · **0,3** = il reste ±25° au fond · **0** = rien. La lueur (plaque, chapeau, paroi) et la lumière suivent, et se déplacent vers les dernières flammes. |
| `gas` | 0 → 0,2 : la brume prend son opacité ; 0 → 0,7 : elle gagne en portée (sous la casserole, puis autour, jusqu'à ≈ 30 cm). **Une fente ne donne du gaz que si sa flamme est morte** : on peut monter `gas` à 1 dès que `flame` descend. |
| `pot` | 1 : flammes couchées sous le fond, quelques-unes lèchent le bord ; gaz sous la casserole puis autour · 0 : flammes debout (celle de la pointe passe par elle), gaz en panache au-dessus du chapeau. |
| `fill` | 0 → 0,26 : la colonne grimpe jusqu'au plafond · 0,14 → 0,55 : la couche s'étale depuis son point d'arrivée · 0,15 → 1 : son dessous descend de 247 à 140 cm (± 18 de bosses). `A.layer` suit ce dessous. |
| `spark` | 0 → 1,5 : lumière et taille (rayon 7 → 16 cm). |
| `explode` | > 0,05 : tout est caché. `bench` : pas de lueur de plaque. `spill` : inutilisé (la vapeur est à `hob.js`). |

## Les poses

- `burner` (celle de `world.js`) : **la meilleure image de la flamme.** `{ ...P, tx: 166, ty: 93.4, tz: 35, d: 62, az: -34, el: 7, shift: 150 }`
- pour `fill` : `room: { ...P, tx: 205, ty: 150, tz: 80, d: 560, az: -52, el: -3, fov: 44, shift: 120 }` (vue à fill 1)
- accroche plus serrée (vue une fois, avec les bouchons seulement) : `{ tx: 166, ty: 98, tz: 34, d: 96, az: -36, el: 14, fov: 40, shift: 140, side: 30 }`
- `whole`, `tipPart`, `door` : celles de `world.js` conviennent (voir « À changer ailleurs » pour `whole`).

## Pas encore au niveau

1. **POSE0** : la couronne est trop petite pour être l'image qui arrête le pouce. C'est le cadre, pas la flamme.
2. **Le gaz en gros plan** : terne, large, sans cœur — mais les « traînées » ne se lisent qu'en mouvement, que personne n'a vu.
3. **La couche** : un nuage à bosses crédible, pas spectaculaire ; dans `VIEW.room` elle passe derrière l'en-tête et,
   dès fill 0,7, la caméra est dedans.
4. **Jamais vu en mouvement** : la respiration des flammes, le vacillement des mourantes (1,3 à 1,7 Hz), les bouffées.
5. **Jamais vus après leur dernier réglage** : l'étincelle agrandie, la brume ternie (`gain` 0,33), `LIGHT` 28, le
   panache de l'établi. Les rubans « dans l'espace » n'ont été vus qu'en gros plan.
6. Sur l'établi, les flammes côté caméra sont écrasées par la perspective : plus faibles que celles du fond.

## À changer ailleurs

- `plan.js` : `PARTS.burner` devrait porter `slots: 40` et l'origine des angles — aujourd'hui écrits en dur dans
  `model.js` (`n = 40`) et dans `fire.js` (`PORTS`, `portAt`).
- `world.js`, `VIEW.room` : remplacer par la pose basse ci-dessus (plafond à ≈ 530 px, sous l'en-tête ; plaque à ≈ 1075 ;
  caméra sous la couche à tout `fill`).
- `world.js`, `POSE0` : `d: 150` → ≈ 96 (à juger par celui qui monte l'acte 1).
- `world.js`, `VIEW.whole` : flamme allumée, les pointes entrent dans l'en-tête (y ≈ 350) — descendre le cadre
  d'environ 80 px (`shift: 150` → `70`) pour ce plan. Non essayé.
- Actes : garder `gas` à 1 pendant `fill` ; `spark` : 1 puis 1,5 deux images, puis 0.
- `fire.js`, une constante : `LIGHT` (28) si la lumière de la couronne est trop forte sur l'eau de la casserole.
