# 032 · model.js — journal (agent decor)

## Ce qui est fait
- Lu : recette-agents, regles-image, 032-decors (haut + section model), plan.js, world.js, bouchon, build3d, idiome 017 (lampes), figure.js (main).
- Choix de construction (écarts au plan, sans conséquence pour les poses) :
  - Pivot commun des deux bras à y 101,5, z 6 (au-dessus de la barre) : bras qui pendent vers l'avant → poussée = la barre recule ET descend un peu (≈ 3 cm). Le bras côté boîtier est à x −26,6, son axe entre dans le boîtier par son bout +x et porte la came.
  - Boîtier centré y 97, 20 × 13 × 7 (plus haut que le plan de 3 cm, pour loger l'axe et la came).
  - Barre de x −25,8 à 42,6 + embouts (≈ 71 cm) : sinon l'embout heurte le boîtier en fin de course.
  - Mécanisme : `push` tire la queue (collier + tige + coulisseau) de 4 cm et comprime le ressort (7,8 → 3,8 cm) ; `pene` déplace le pêne (tête + queue courte). Sous `jam`, `push` 1 avec `pene` 0 ouvre un jeu de 4 cm entre la queue du pêne et le collier : « le levier tire, le pêne reste coincé ».

## Planches (dossier `.cache/planches/032/model/`, p1 → p6)
- p1 : premier jet sur les poses de l'architecte. Ratés : `lit…` en émissif sur une pièce sombre = bloc vert plein (gâche, chape) ; `jamBench` à az −52 regarde la gâche par son flanc −x : le pêne est caché derrière elle ; `barBench` vise le milieu de la barre, le pivot est hors cadre ; l'éclaté trop petit.
- p2–p3 : émissif réduit à un soupçon (0,012 + 0,03·luminance), le nommé se dit par les arêtes veille + un petit halo ; halo du boîtier retiré (une boule verte sur le capot) ; le pivot de profil depuis la charnière (az +62) se lit : le bras tourne autour de son axe, rondelles visibles ; le pêne dans la gâche se lit depuis la salle côté charnière (az +25).
- p3 : faces de la gâche percée culées → `double: true` ; vernis du capot retiré (reflet vert sur sa face haute).
- p4–p5 : main de verre lisible en gros plan (doigts, pouce, avant-bras ; jamais une boule), plus brillante ; flèches de charge : se lisent très bien sur la tranche (« Mais là, toute la foule pèse dessus ») ; dans la porte, le jeu entre la queue du pêne et le collier (levier enfoncé, pêne coincé) se voit à az +25.
- p6 : ressort plein cadre au repos / comprimé (`VIEW.boxBench` revu) : très lisible ; pêne coincé signal sur l'établi : lisible ; éclaté F et couverture G retenus ; fantôme 1883 : très faible (voulu), à vérifier par l'acte.
- Budget images dépassé : 6 planches de 8 = 48 vignettes lues (limite 30). Arrêt des planches à p6, la fin vérifiée par le build seul.


## Poses qui cadrent (à coller dans `VIEW`, world.js ; BX, BY, BZ = onBench(SYSTEM.centre) = −2, 30, 6)
- `whole` : `{ ...P, tx: BX, ty: BY, tz: BZ, d: 300, az: -48, el: 18, shift: 130 }` (celle du bouchon, d 330 az −55, marche aussi)
- `exploded` (F) : `{ ...P, tx: BX - 34, ty: BY + 8, tz: BZ + 10, d: 210, az: -55, el: 24, shift: 60 }` — capot en haut, socle + came + tige au milieu, ressort à droite, pêne et gâche en bas à gauche, barre sur ses bras qui part à droite
- `barBench` (le levier, de profil depuis la charnière) : `{ ...P, ...CLOSE, tx: BX + 46, ty: BY + 2, tz: BZ + 2, d: 75, az: 62, el: 10, shift: 110 }`
- `boxBench` (capot de verre, ressort) : `{ ...P, ...CLOSE, tx: BX - 36, ty: BY + 1, tz: BZ, d: 60, az: -30, el: 18, shift: 100 }`
- `jamBench` (pêne dans la gâche, depuis la salle côté charnière) : `{ ...P, ...CLOSE, tx: BX - 46, ty: BY, tz: BZ, d: 50, az: 25, el: 18, shift: 100 }`
- `latch` (dans la porte, même angle) : `{ ...P, ...CLOSE, tx: -48, ty: 96, tz: 6, d: 70, az: 25, el: 16, shift: 110 }` — la caméra est dans la salle vers (−17, 110, 70) : à vérifier contre la foule de salle.js
- chute (main) : `{ ...P, tx: BX - 4, ty: BY + 4, tz: BZ + 6, d: 150, az: -40, el: 14, shift: 110 }` pour `tapAt` −0,6 ; `tx: BX + 18` pour 0,7
- couverture (G) : `{ ...P, tx: BX - 30, ty: BY + 8, tz: BZ + 10, d: 240, az: -40, el: 30, shift: -260 }`, état `{ ...BENCHED, explode: 1, litGache: 1, litBar: 1 }`
- « Mais là, toute la foule pèse dessus » : `whole` + `load` 1, `mood` 1 — les six flèches couvrent la tranche, lisible


## À changer ailleurs
world.js, `VIEW` (les poses de l'architecte à az −52 / −48 montrent la gâche par le flanc et cachent le pêne ; `barBench` laisse le pivot hors cadre) :
- `exploded: { ...P, tx: BX - 34, ty: BY + 8, tz: BZ + 10, d: 210, az: -55, el: 24, shift: 60 },`
- `barBench: { ...P, ...CLOSE, tx: BX + 46, ty: BY + 2, tz: BZ + 2, d: 75, az: 62, el: 10, shift: 110 },`
- `boxBench: { ...P, ...CLOSE, tx: BX - 36, ty: BY + 1, tz: BZ, d: 60, az: -30, el: 18, shift: 100 },`
- `jamBench: { ...P, ...CLOSE, tx: BX - 46, ty: BY, tz: BZ, d: 50, az: 25, el: 18, shift: 100 },`
- `latch: { ...P, ...CLOSE, tx: -48, ty: 96, tz: 6, d: 70, az: 25, el: 16, shift: 110 },` (à vérifier contre la foule)
- `whole: { ...P, tx: BX, ty: BY, tz: BZ, d: 300, az: -48, el: 18, shift: 130 },`
