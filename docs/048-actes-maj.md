# 048 — ce que les décors ont changé (à lire avant docs/048-actes.md)

- Image 0 : A (plongée du 5ᵉ) retenue telle quelle (POSE0/FIRST de world.js) ; la boucle de fin retombe dessus.
- `VIEW.rear` passe à az +55 (l'arrière côté coupe ; az −142 filmait l'avant côté loin). Pose tunnel revêtu (sol) : `{ tx: 2400, ty: -1591, tz: 0, d: 3600, az: -38, el: 16, fov: 40, shift: 40 }`.
- Manomètre déplacé (plan.js `gauge: [372, -1591+230, 344]`), `gaugeBench` vise `BGX`. Aucun chiffre sur le cadran ; en-tête « Pression » en mots seulement.
- Profil de la machine : az entre −4 et +4, sinon roue et cloison cachent la chambre. `exploded`/`headBench` : réglages du journal 048-model.md (« Poses »).
- `rams` est transmis au sol : le front suit la roue. `face` 0→1 : blocs qui glissent de 16–34 cm, jamais un vide ; `loose` ≤ 0,3, une lueur, jamais un trou.
- Rue : cuvette = lueur + anneaux, la chaussée ne bouge que de settle × 0,1 cm ; la mire ×50 (`VIEW.kerb`) est le seul endroit où le tassement se lit. À `settle` 8, les tranches de la cuvette font un mur rouge dans les plans bas près de la rue (fin.js : éviter `{ tx: -420, ty: -150, tz: -300, d: 1600, az: -14, el: 10 }` ou baisser `settle` dans ce plan).
- `VIEW.sky` et `VIEW.bedroom` remplacés (calculés, non vus sur planche : à vérifier) ; à travers la fenêtre, le montant central passe devant le lit.
- Habillage : réverbères allumés et ville lointaine (visibles dans la section seulement), suivent `street`.
- Faibles connus : arbre/bras malaxeurs sombres quand la terre baisse ; vis fine à 270 px sur l'éclaté ; calotte du front un peu régulière.
