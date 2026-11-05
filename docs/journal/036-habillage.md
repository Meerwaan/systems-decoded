# 036 · `src/habillage.js` — journal du décorateur

Agent `decorateur`, 04/11. Fichier habillé : `eolienne.js` seulement (la route du 025 garde `dressRoute`). Dossier temporaire : `.cache/planches/036/habillage/`.

## Planche avant (8 instants, `essais.json`)

POSE0 (0,04) · réseau sauté (`mains` 0,15) · `VIEW.system` · `VIEW.rotor` · `VIEW.wide` el −10 + `reach` · `VIEW.behind` `mood` 0 · `VIEW.wide` `fold` 1 · `VIEW.feather` (duel). Ce qui manquait : à POSE0, toute la moitié droite sous le rotor est un noir sans profondeur (l'horizon est une ligne) ; le pied du mât (y ≈ 1240) n'a ni lumière ni échelle ; le poste de livraison est une boîte vide.

## Touches posées (`dressTurbine({ top })` → `{ group, update({ tower, mains }, time) }`)

1. **Le parc, au loin** : quatre feux de balisage des éoliennes voisines (trois à droite, un à gauche), à hauteur de moyeu, 0,8 à 1,1 km — rien que leurs lumières (la nuit, c'est tout ce qu'on en voit). Ils respirent **ensemble** avec celui de la nacelle (un parc est synchronisé) : 44 périodes sur les 88,73 s du film (≈ 30 éclats/min, dans les 20–60 réels), la dernière image respire comme la première. Encre, pas rouge : le rouge est la menace. Suit `tower`.
2. **Le feu de la nacelle** : sur un petit mât à l'arrière du toit, dans le repère de la nacelle (il plie avec le mât). Vu de la route, bas et de face, la nacelle le cache — comme en vrai ; il se montre dans les plans qui voient le toit. Éteint sous 42 m de la caméra (les gros plans sont au système). Suit `tower`.
3. **La lampe de la porte au pied du mât** : un point, sa coulée sur la peau du mât (`wash`), et son reflet étiré sous le sol (la plateforme mouillée). Le pied d'un mât de 80 m a une place et une échelle. Suit `tower`.
4. **Le poste de livraison** : sa porte (un trait fin) et la lampe au-dessus, avec sa coulée et son reflet — **la lampe meurt avec le réseau** (`mains` 0,9 → 0,78 : le front de coupure passe le poste tôt). « Le réseau a sauté » a aussi sa petite image en bas, près de la route.

Chaque lumière garde une taille à l'écran (calculée à chaque dessin depuis la distance caméra, `onBeforeRender`) : un point lisible au loin, jamais une tache en gros plan.

## Ce qui a raté et pourquoi

- Premier jet invisible : les tailles étaient plafonnées en centimètres (160 cm à 130 m = 14 px) → plafonds levés, la taille vient des pixels.
- Le parc à 1,3–1,7 km était coupé par le plan lointain de la caméra (`far` 120 000 dans `main.js`) → ramené entre 0,8 et 1,1 km de la voiture. Dans `VIEW.wide` (caméra plus loin), les plus lointains peuvent sortir du plan lointain : sans gravité.
- Le feu de nacelle n'apparaît pas à POSE0 (caché par la nacelle, la géométrie le confirme) : gardé tel quel, c'est juste et ça laisse le moyeu seul.

## Images lues : 24 / 24

avant 8 · après (premier jet) 8 · deux à 540 px 2 + 2 · recadrages 4. **La planche après finale (`apres-final.jpg`) n'est pas relue** (budget atteint) : à POSE0, l'état relu à 400 px (`crops.jpg`, 3ᵉ vignette) est celui qui part, au feu de nacelle près (invisible de là).

## À changer ailleurs

- Rien d'obligatoire. Proposition, non essayée : `main.js`, `far: 160000` au lieu de 120000 si l'on veut le parc dans `VIEW.wide` (coût : précision du tampon de profondeur ; à ne faire que si la planche montre un gain).

## Pas au niveau

- La lampe du poste et sa mort sur `saute1` ne sont pas vérifiées en grand (le recadrage l'a manquée) ; à 270 px elle reste un détail.
- Le feu de nacelle n'est vu sur aucune planche.
