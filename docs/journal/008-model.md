# 008 — model.js (le paratonnerre) — journal

Fichier : `episodes/008-paratonnerre/src/model.js` (986 lignes). Planches : `%TEMP%\sd-008\model.jpg` (jamais dans `renders/` ; rien n'y a été écrit). 45 images lues sur 45.

## Ce qui est construit

- **Le système vrai**, de haut en bas : tige de capture (inox tourné, conique, bout arrondi Ø 2,1 cm, épaulement, gorge, six pans de serrage) · contre-écrou · manchon tourné sur le mât (gorge, collerette, deux vis de pression) · borne du conducteur sur le manchon (talon, plaque, deux boulons, le fil pincé entre les deux) · mât Ø 6 cm en deux longueurs manchonnées et boulonnées · quatre colliers de mât (bande, oreilles, boulon, étrier à deux vis) · embase à cheval sur le faîtage (deux ailes sur les rampants, trois boulons chacune, chape, douille, deux goussets, boulon de serrage) · deux jambes de force le long du faîtage (bande à oreilles sur le mât, bouts aplatis boulonnés, deux petites selles) · conducteur Ø 8 mm, cintré (baïonnette sous le manchon, départ au-dessus de l'embase, rampant, col de cygne à l'égout, retour au mur, façade, sous terre) · cinq colliers de toit, cinq colliers muraux (platine, tige, étrier) · joint de contrôle : le fil est **coupé**, chaque bout vissé dans sa borne, une barrette sur deux goujons ferme le chemin · piquet Ø 2,2 cm de 2,5 m (tête chanfreinée, gorge, pointe) et son étrier en U (plaque, deux écrous).
- **Valeurs**, du sol vers le ciel : fixations sombres (`cast`), mât et piquet moyens (`steel`), pièces usinées (`fine`), fil clair (`wire`), tige la plus claire (`hero`). Pas de cuivre.
- **De loin** : mât, tige, fil, piquet, jambes de force doublés d'un `fatLine` en pixels, caché dans la pièce de près.
- **La lumière** : une gaine autour du conducteur (un shader, une règle `s` en cm depuis le sommet — environ 17,6 m au pied du piquet, estimé à la main ; la valeur exacte est `rod.length`), jamais sous 6 px de large, bords doux ; un halo au sommet et un sur la tête du courant (cœur + traîne, taille minimale en pixels) ; douze lignes de champ calculées dans le shader (champ uniforme + puits au sommet : ρ² = ρ0² − 2b²(1 − cos θ)) ; des anneaux à cinq profondeurs autour du piquet.
- **Le kit** : `rod` (les 70 derniers cm, la même fonction `addHead` que sur la maison), `wire` (34 cm de fil, deux colliers, le joint ; la barrette dans son propre groupe), `stake` (tête + étrier + bout de fil, cassure, pointe), `stand` (socle tourné mat, coupelle où repose la pointe, potence, mâchoire, vis moletée). Cassures en couronne (`snapped`) : tube creux pour le mât, barre pleine pour le piquet, biseau à deux dents pour le fil.

## Ce qui a raté, et pourquoi

1. **`plate()` du kit ne prend pas un `THREE.Shape`** : il teste `outline.isShape`, qui n'existe pas dans three → « i.map is not a function ». Contourné chez moi (contour en points). `house.js` est tombé dessus pendant ma séance (trois builds en échec, puis réparé de son côté).
2. **`look` garde l'état forcé d'une image à la suivante** tant qu'aucun acte n'anime ce nombre : première planche, le champ est resté à 1 sur quatre images. Depuis : état complet à chaque image.
3. **La gaine peignait la tige en vert** dès `charge` 0,35 (la pièce-héros disparaissait) : sur la tige, la lueur est maintenant un dégradé vers le sommet, et le manchon reste du métal.
4. **Le mât sombre sur fond sombre** (acier 0x737b83, métal 0,4) : éclairci, moins métallique. Le vernis des fixations renvoyait le contre-jour signal : plaques roses → vernis retiré.
5. **La terre en coques** (ellipsoïdes vus par leur bord) : vue d'au-dessus de la pelouse, une jarre verte qui mange la moitié de l'image. Remplacé par des anneaux plats à cinq profondeurs : on lit des ondes.
6. **Le kit éclaté en hauteur** (la consigne) : une colonne de 1,7 m large comme la main, 4,2 px/cm — des miettes dans la zone du sujet, qui est plus large que haute (850 × 720 px). **Éclaté, le kit est maintenant une rangée** (tige · fil · piquet, dans l'ordre du courant, en travers de l'image d'une caméra à az −40) : 8,6 px/cm, chaque pièce deux fois plus grosse. Écart à la consigne, assumé et signalé.
7. **Les pièces allumées brûlaient** (émissif 0,2 sur une tige presque blanche → bloom) : l'allumage est une teinte + un émissif d'autant plus faible que la matière est claire.
8. **Les faces tournées vers le haut** prennent la clé et le contre-jour ensemble : dessus des bornes et anneau du socle plus lumineux que la tige. `fine` baissé d'un ton et moins miroir ; socle mat.
9. **Le fil se perdait dans ses propres colliers** (gris sombre sur platines sombres) : fil éclairci, tronçon rallongé de 28 à 34 cm → `KIT.tip` passe de 130 (bouchon) à **144**.

## Poses qui cadrent (essayées, sauf mention)

Maison (`fov: 28`, `side: 0`, `roll: 0`) :
- sommet / raccord : `VIEW.tip` tel quel, lumière `fx: -400, fy: 1150, fz: 0, fs: 90`
- tête de près : `{ tx: -400, ty: 1172, tz: 2, d: 200, az: -42, el: 8, shift: 60 }`, `fs: 60`
- embase : `{ tx: -400, ty: 852, tz: 10, d: 340, az: -44, el: 14, shift: 60 }`, `fs: 110`
- le fil d'un bout à l'autre (trois quarts) : `{ tx: -400, ty: 520, tz: 230, d: 2500, az: -52, el: 6, shift: 0 }`
- du sommet au pied du piquet (pour `flow`) : `{ tx: -400, ty: 460, tz: 200, d: 3300, az: -52, el: 5, shift: 0 }`
- la terre : `{ tx: -400, ty: -110, tz: 420, d: 1250, az: -40, el: 13, shift: 0 }`
- le champ, plan moyen : `{ tx: -400, ty: 1500, tz: 0, d: 2400, az: -40, el: -6, shift: 0 }`

Établi (`fov: 28`) :
- la rangée (éclaté) : `{ tx: KIT.open[0], ty: 40, tz: KIT.open[2], d: 448, az: -40, el: 10, shift: 160 }` — tient entre y ≈ 455 et 1145, bord droit du socle à x ≈ 880. Se lit de az −24 à −56.
- la tige : `{ tx: -33.7, ty: 46, tz: -28.3, d: 330, az: -40, el: 8, shift: 140 }`
- le fil et son joint : `{ tx: -15.3, ty: 45, tz: -8.3, d: 200, az: -40, el: 8, shift: 140 }`
- le piquet : `{ tx: 0, ty: 19, tz: 2.95, d: 205, az: -40, el: 10, shift: 140 }`
- assemblé (colonne) : `{ tx: 0, ty: 72, tz: 1.5, d: 840, az: -42, el: 10, shift: 160 }` — **calculé** depuis l'essai à 138 cm (`ty: 69, d: 800`), pas revu à 144.
- raccord : `moved(VIEW.tip, ROD.tip, KIT.tip)` — essayé, le sommet tombe au même pixel.

## Mesure du scintillement (cinq instants voisins, état tenu, les autres décors éteints)

Aucun pixel qui saute et revient, dans aucun des dix cas (sommet charge + champ, trois quarts charge, pelouse, flow, terre, rod 0, rod 0,5, établi). Ce qui bouge d'une image à l'autre : les tirets (178 à 828 pixels sur 518 400 en plan large ; 4 463 de près quand ils descendent, 5 cm par image pour une période de 38 cm). L'établi est immobile au pixel.

## À changer ailleurs

- `world.js`, `VIEW.exploded` → `{ tx: KIT.open[0], ty: 40, tz: KIT.open[2], d: 448, az: -40, el: 10, fov: 28, shift: 160, side: 0, roll: 0, drift: 0.3 }`
- `world.js`, `VIEW.whole` → `{ tx: 0, ty: 72, tz: 1.5, d: 840, az: -42, el: 10, fov: 28, shift: 160, side: 0, roll: 0, drift: 0.3 }` (ou la rangée : voir « pas au niveau »)
- `world.js`, commentaire de `explode` dans `FIRST` → `0 assembled, one above the other → 1 a row: rod · wire · stake side by side`
- `world.js`, `SIZE` : rien à changer (le kit fait 144 cm de haut, rayon 72).
- `kit/lib/build3d.js`, `plate()` : `outline.isShape` → `outline instanceof THREE.Shape` (three n'a pas de `isShape`).
- Sur la maison, de près, donner un petit `fs` (60 à 110) : à 700, la carte d'ombres fait 1,8 cm par texel et les ombres du mécanisme disparaissent.

## Pas au niveau

- **Assemblé, le kit reste une colonne maigre** (5 px/cm, mât de 30 px) : c'est l'image faible. Le plan fort est la rangée.
- **Changé après la dernière planche, pas revu** : l'anneau incrusté du socle (assombri, mat). Il ne peut qu'être plus discret qu'avant.
- **Première image (POSE0)** : le fil se suit en pleine résolution, à peine sur une vignette ; la lueur du sommet y est petite.
- **Le contre-jour signal** de la maison teinte en saumon les faces du dessus de l'embase.
- **Au raccord**, la tige est verte sur la maison (charge) et nue sur l'établi.
- Rien n'a été vu en rendu logiciel (le bloom du brouillon peut différer : la tête du courant à `flowOn` 1,5 d'abord).
