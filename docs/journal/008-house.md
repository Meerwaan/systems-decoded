# Journal — 008 · `house.js` (la maison aux rayons X, toi, l'arbre)

Fichier : `episodes/008-paratonnerre/src/house.js`. Planches : `%TEMP%\sd-008\house.jpg` (jamais dans `renders/`).
Budget : 45 images lues. Compteur tenu en bas de chaque passe.

## Consignes reçues en cours de route

- Plus aucune planche dans `renders/` (Merwan a pris un échafaudage pour le film). Rien n'y a été écrit par moi.
- La barre : au-dessus du 007. Vraie coque de verre (lèvre, reflet, `through`), des épaisseurs (murs, débords, tableaux, tuiles de rive), charpente et réseaux en volume, personnage soigné, profondeur (le loin s'efface).

## Parti pris (avant la première planche)

- **Coque** : murs épais de 24 cm (plaques extrudées, baies percées, arêtes cassées → lèvre claire), toit en deux dalles de 14 cm avec débord, tuiles de rive et faîtières en volume, gouttières, appuis de fenêtre, porte avec marquise. Tout le verre de la maison = UNE coque (`asShell`, ordre 20) ; toi = ordre 10 (dessiné avant, vu à travers).
- **Tuiles** : dessinées dans le shader du toit (rangs + joints décalés), fondues par `fwidth` dès qu'elles passeraient sous le pixel et demi.
- **Traits** : mon propre matériau de lignes (mêmes quads que `LineSegments2`) qui **s'efface avec la profondeur** par rapport au centre de la maison — le pignon du fond ne pèse pas autant que la façade.
- **Dedans, en plein** : charpente à entrait retroussé (3 fermes, pannes, chevrons, faîtière), fils en gaine (r 2 cm), tuyaux (r 3,4 cm, colliers), tableau, prises, lampes, douche, lavabo, ballon.
- **Plan de la maison** : cloison à x = 50 (séjour / entrée). La prise près de toi est sur cette cloison, tournée vers la caméra (−x), à hauteur de main. Tableau sur le mur du fond, tourné vers +z. Salle de bain à l'étage, à droite en façade ; la descente d'eau longe la façade à droite de la porte.
- **`whatif`** : un graphe de traits minutés (0 → 1). Cheminée 0–0,10 · charpente 0,10–0,34 · arc vers la boîte de dérivation 0,14 · fils du grenier → tableau 0,56 · plinthe → prise près de toi 0,87, arc vers toi 0,92 · arc vers la douche 0,33, jets 0,45 · descente d'eau → terre 0,88–0,95 · tout brûle 0,95–1.

## Passes

### Passe 1 — premier jet (8 images lues : 1 avec en-tête + 7 nues)

Fait : tout le fichier d'un coup (coque épaisse, toit tuilé, charpente, fils, tuyaux, `whatif`, toi ×2, arbre).

Pièges rencontrés (à savoir pour les autres) :
- `plate()` du kit teste `outline.isShape`, que three ne pose pas sur une `THREE.Shape` → `outline.map is not a function`. Contourné chez moi (`shape.isShape = true`). Voir « À changer ailleurs ».
- Ne jamais ranger un `Object3D` dans `material.userData` d'un verre : `asShell` clone le matériau, `userData` passe par `JSON.stringify` → « circular structure ».
- **`look --file` : l'état fuit d'une image à la suivante** (le `state` d'une vignette reste tant que la suivante ne réécrit pas le même nombre, puisque toutes sont au même instant). Toujours écrire TOUS les nombres qu'on a touchés (`whatif`, `fire`, `out`, `inside`, `shell`, `rod`) dans chaque vignette.

Ce que disent les images :
- La maison se lit tout de suite (pignon, toit, cheminée, antenne, fenêtres à croisillons, porte). Mais c'est encore **du fil de fer** : le verre ne pèse rien à côté des traits.
- La dalle de l'étage, en verre, vue en rasant = une **dalle grise** en travers de l'image (plan rapproché sur toi). À sortir de la coque de la maison.
- Les appuis de fenêtre trop blancs (barre blanche à hauteur de tes mains).
- L'arc de la prise : zigzag de bande dessinée, couleur crème (lu « ink », pas « signal »). À refaire fin, fractal, orange.
- L'arbre : des boucles gribouillées (les bords de chaque boule + les brindilles). À refaire : un vrai squelette de branches, une couronne douce.
- Intérieur : fils = traits clairs fins = confondus avec les arêtes de la coque.
- `whatif` 0,6 et 1 en plan large : le trajet se lit d'un coup (cheminée → charpente en W → descente à gauche → plinthe → prise ; douche et descente à droite). Bon point de départ.
- POSE0 : le pied de la maison tombe sous y ≈ 1600 et l'arbre est sous les boutons de TikTok (x > 905) → « À changer ailleurs ».

### Passe 2 — le verre prend du corps (16 images lues)

- `glazed()` : mon verre de maison (mêmes uniformes que `glass()` du kit, donc `asShell` marche) avec `grade` (les murs s'éteignent vers le sol), `tile` (rangs de tuiles dans le shader), `streak` (reflets en biais des vitres, ancrés au mur).
- Dalle de l'étage + cloison : sorties de la coque de la maison, dans leur propre coque (ordre 15).
- Arcs : fractals (`jag`, déplacement du milieu), leur propre matériau de lignes, plus fins.
- Arbre : squelette de branches récursif (plein jusqu'au 3ᵉ ordre, traits au-delà), couronne de 7 boules douces.
- Lampe du séjour déplacée derrière toi : son halo est ce sur quoi tu te découpes depuis la pelouse.
- Raté : dalle encore visible (le terme `edge` s'allume sur une face plate vue en rasant) ; têtes et arcs crème (« ink ») au lieu de signal ; gaine électrique grosse comme un tuyau.

### Passe 3 (24 images) — couleurs et réseaux

- Dalle : `edge` 0, `rim` 0,012 → plus de bande grise.
- Fils : gaine r 1 cm + un trait (2,6 px, un peu au-dessus de 1 : ils « portent la lumière ») → ce sont les traits les plus clairs de la maison ; tuyaux en métal clair peu métallique ; charpente sombre.
- Signal : le plus chaud du trajet est un orange vif (`FIERY`), jamais crème ; à `whatif` 1 le trait s'élargit au lieu de blanchir (au-dessus de 3, le tone mapping le délave en rose).
- Raté : receveur de douche brûlé (plastique clair à plat sous la clé → bloom) ; la maison vue de dessus n'avait pas de tuiles.

### Passe 4 (32 images) — finitions

- Tuiles visibles aussi de face (terme dépendant de l'angle). Maçonnerie (cheminée) plus dense que les vitres. Plastiques et émail un diaphragme plus bas. Douche plus grosse, lavabo déplacé.
- Toi dehors : figure plus claire, tête ink, flaque de lumière sous les pieds.
- **Erreur de ma part** : deux fois j'ai cru la figure du dehors absente — elle était juste hors cadre (pose mal calculée). Elle est bien rendue.

### Passes 5–6 (45 images, budget épuisé)

- Appuis de fenêtre dans un verre à eux (moins clairs), murs un peu plus denses, halo de la lampe plus large, toi plus clair (tête ink).
- Douche : jets à demi-force, lumières plus petites → ne couvre plus la prise près de toi.
- Dernière image lue : `whatif` 1 maison entière — se lit d'un coup, équilibrée.

### Scintillement (mesuré, pas regardé : `sharp`, deux images consécutives, caméra fixe, ciel / pluie / tige éteints)

| plan | écart moyen /255 | max | pixels > 24 |
| --- | --- | --- | --- |
| maison entière, état normal (+ toi dehors) | 0,45 | 9 | 0 |
| toit de près (shader des tuiles) | 0,28 | 12 | 0 |
| `whatif` 1 (respiration lente des arcs et des lumières) | 1,26 | 19 | 0 |
| `whatif` 1 + `fire` 1 (les braises tombent : voulu) | 1,35 | 66 | 41 |

Rien ne scintille quand l'état ne bouge pas. (L'écart moyen ≈ 0,3–0,45 existe sans rien de moi qui bouge : sans doute le grain de l'étalonnage.) Les braises avancent d'environ 1 px par image en plan large.
Quatre états extrêmes (tout à 0, tout à 1, mélangé) passent sans erreur de page — planche mesurée, non lue.

## Les nombres de l'état, chez moi

- `shell` : le verre et les traits de la maison ET de l'arbre ; l'antenne et le tronc s'assombrissent avec. 0 = rien.
- `inside` : charpente, fils, tuyaux, tableau, prises, lampes (luminosité). 0 = rien. **Pour un plan d'intérieur : `shell` 0,5 + `inside` 1.**
- `you` / `out` : 0 / 1. `out` allume aussi une flaque de lumière sous tes pieds.
- `whatif` : 0 → 1, les heures sont dans `world.house.T` : `roof` 0,10 · `box` 0,17 (arc cheminée → boîte de dérivation) · `lamp2` 0,33 · `pipeTop` 0,36 (arc charpente → douche) · `jets` 0,45 · `unit` 0,56 (tableau) · `lamp1` 0,67 (la lampe derrière toi saute) · `socket` 0,87 · `you` 0,92 (l'arc de la prise, qui s'arrête à 62 % du chemin vers ta main) · `ground` 0,88 → `end` 0,95 · 0,94 → 1 : tout brûle.
- `fire` : braises qui tombent de l'entrée de la cheminée dans le toit + lueur à cet endroit. Indépendant de `whatif`.
- Ancres : `chimneyTop`, `antennaTop`, `treeTop`, `youHead`, `outHead`, `socket`, `shower`, `window`, `ridgeEnd`, et en plus `unit` (le tableau).

## Poses qui cadrent bien (complètes : ajouter `shift: 0, side: 0, roll: 0, drift: …`)

- Maison entière, contre-plongée : `{ tx: 0, ty: 480, tz: 0, d: 2700, az: -38, el: -12, fov: 40 }`
- Plus près (toi et ta lampe lisibles) : `{ tx: -100, ty: 520, tz: 0, d: 2300, az: -38, el: -12, fov: 40 }`
- Toi à la fenêtre, trois quarts : `{ tx: -60, ty: 150, tz: 300, d: 900, az: -34, el: -2, fov: 28 }`
- Intérieur entier (`shell` 0,5 · `inside` 1) : `{ tx: 0, ty: 330, tz: 0, d: 3000, az: -28, el: -3, fov: 34 }`
- Tableau et fils (idem) : `{ tx: -300, ty: 150, tz: -250, d: 900, az: -30, el: 2, fov: 30 }`
- Salle de bain (idem) : `{ tx: 330, ty: 380, tz: 290, d: 800, az: -50, el: -4, fov: 30 }`
- `whatif` maison entière (`rod` 0) : `{ tx: 40, ty: 430, tz: 0, d: 2900, az: -36, el: -8, fov: 38 }`
- `whatif` 1, toi et la prise : `{ tx: -20, ty: 100, tz: 200, d: 560, az: -58, el: 3, fov: 30 }`
- Toi dehors, de près : `{ tx: -1050, ty: 110, tz: 620, d: 700, az: -35, el: -8, fov: 34 }`
- Toi dehors + maison + arbre : `{ tx: 6, ty: 660, tz: 361, d: 5100, az: -15, el: -7, fov: 55 }` (tu fais ≈ 70 px de haut)
- Toit — bout du faîtage, antenne, cheminée : `{ tx: -150, ty: 900, tz: 0, d: 2450, az: -30, el: 4, fov: 28 }`
- Cheminée et antenne de près : `{ tx: 140, ty: 890, tz: -60, d: 1100, az: -35, el: 6, fov: 28 }`

## À changer ailleurs

1. **`kit/lib/build3d.js`, `plate()`** : `const shape = outline.isShape ? outline : …` — three ne pose pas `isShape` sur une `THREE.Shape`. Ligne exacte : `const shape = outline instanceof THREE.Shape ? outline : new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));`. (Chez moi : `shape.isShape = true` avant l'appel ; à retirer alors.)
2. **`world.js`, `POSE0`** : le rez-de-chaussée (toi à la fenêtre) tombe à y ≈ 1490–1625 px, soit au bord de la légende de TikTok, et l'arbre est sous ses boutons (x > 905, y 880–1760). Remonter la maison (`shift` ≈ 120, ou viser plus bas) ; l'arbre : accepter, ou `TREE.x` plus petit dans `plan.js`.
3. **`plan.js`** : `YOU.outside` (x −1050) et `TREE` (x 1350) sont de part et d'autre de la maison, à 24 m : ils ne tiennent ensemble que dans un cadre très large. Pour « toi dehors avec l'arbre » en plan moyen, rapprocher l'un de l'autre.
4. **Actes** : en `whatif`, la foudre doit viser `house.A.chimneyTop` (c'est `bolt.js` qui la dessine) ; les heures du trajet se lisent dans `world.house.T`.
5. **`look --file`** : l'état d'une vignette fuit dans la suivante (voir passe 1) — à dire dans la recette.
6. Une lueur signal au pied de l'antenne, sur le faîtage, dans un plan de toit à l'état normal : elle n'est pas dans `house.js` (rien de moi n'émet là) — à voir côté `bolt.js` (`uRoof` ?).

## Ce qui n'est pas encore au niveau

- En plan large la maison reste portée par ses traits : le verre a du corps (voile dégradé des murs, lustre des tuiles, vitres rayées de reflets, lèvres aux arêtes) mais une maison, ce sont des plans — elle n'a pas le modelé du Rafale.
- La pomme de douche ne se lit pas ; la salle de bain se lit par la colonne, le mitigeur, le receveur et le lavabo.
- Intérieur entier en vignette : fils (fils de lumière) et tuyaux (tubes gris) se distinguent, sans plus ; c'est franc dans les plans rapprochés (tableau, salle de bain).
- Toi dehors : la tête levée ne se voit pas (la tête du kit est une boule) ; la flaque de lumière est un trait mince vue d'une caméra basse.
- À POSE0 tu fais ≈ 75 px : c'est le halo de la lampe qui te trouve, pas ta silhouette.
- L'appui de fenêtre barre encore tes hanches dans le plan trois quarts à la fenêtre.
- **Mains « real » au lieu de « flat »** (la consigne disait `flat`) : choisies pour les gros plans ; revenir en arrière = un mot dans les deux `makeFigure`.
- Non vu (budget épuisé à 45 images) : les deux fourches de l'arc de la prise raccordées au trait principal (dernier changement, logique mais pas regardé) ; la planche des états extrêmes (mesurée seulement, aucune erreur de page).
