# 032 · salle.js — journal

## Lu (30/10)
recette-agents, regles-image, 032-decors (haut + section salle), 032-actes (haut + première image), plan.js, world.js, bouchon, kit (figure, build3d glass/asShell, atmo makeSurface), L03 cabine (la foule y est un maillage fusionné animé dans le shader).

## Choix
- Foule : 7 personnages `makeFigure` posés (premier rang, shell, ordre 12) + 39 au fond en **InstancedMesh** de trois poses figées (verre maison qui lit `instanceMatrix`, et sa propre couche « hold » instanciée : `asShell` crée un Mesh simple, il ne marche pas sur un InstancedMesh). Ordres : toi 10, premier rang 12, foule 14, battant 24 → toi cache la foule, la foule ne te voile pas.
- Murs et battant : **pas de verre `glass`** sur les grandes faces (vu de profil, le rim fait la dalle blanche) — un « pane » qui ne brille que de face (|n·v|²) et des traits fins. Plus de dalle possible à az −84.
- Vague : sin(ω t + k·dist), période 1,5 s, court de l'arrière vers la porte.

## Construit (salle.js, 918 l., build et `check` passent)
- Mur de la porte (les deux époques) : traits fins + 6 « panes » ; salle d'aujourd'hui : murs latéraux, fond, plafond (panneaux lumineux en traits), joints de bardage, plinthe ; sol `makeSurface` rendu **mat et noir** (env 0 : il faisait une dalle grise vu au ras, et une bande bleue vue de dehors).
- Dormant plein (`box` chanfreiné + arêtes), battant pane + contour 2,2 px + plaque de propreté, trois paumelles sur l'axe. Axe côté face extérieure aujourd'hui (s'ouvre vers −z), face intérieure en 1883 (vers +z). `A.leaf` = coordonnées « porte fermée ».
- Tremblement : ≤ 0,3° (≈ 5 mm au bord libre), 5 Hz, plus fort quand la vague arrive à la porte ; nul porte ouverte.
- Pictogramme : panneau veille (glow 0,25 → 1,55), bonhomme qui court et porte ouverte dessinés en noir, halo vert sur le mur ; rien en 1883.
- Dehors : flaque douce (ink) à `OUTSIDE`, lueur dans l'encadrement (vue de la salle seulement), traînée de lumière sur le sol de la salle ; × `outside`, liées à `swing`.
- Arcs : ruban au sol (5 cm, révélé par l'angle, tête plus claire), flèche qui suit le bord libre, battant fantôme pane + contour. Signal vers +z (`arcIn`), veille vers −z (`arcOut`). **Sens vérifiés sur planche** (door, az −30 el 30).
- Toi : `makeFigure` shell, ordre 10, glassK 1,25, tête et mains de verre, penché 16°, joue contre le verre (tête décalée), main gauche à plat haut sur le verre, bras droit coincé coude dehors, hanche au contact de la barre (z = FACE + BAR.out + BAR.r + 9,2) ; `push` recule de BAR.stroke ; `swing` te fait trébucher de 34 cm ; `flow` te fait sortir le premier.
- Premier rang : 7 `makeFigure` (3 poses : mains à plat sur le dos devant, un bras levé, épaule en avant), ordre 12, pâles ; en 1883 enfants (× 0,72) tassés sur le palier contre le battant.
- Foule : 39 figures instanciées (3 poses figées), entonnoir de 150 à 750 cm, coin serrure (x < −40, z < 220) dégagé ; plus pâles au loin ; **s'effacent à moins de 70–260 cm de la caméra** (jamais un mur de verre devant l'objectif). En 1883 : 3 de front sur les 13 premières marches, plus claires (sujet).
- Vague : déplacement ± 13 cm (fond), ± 5 (premier rang), 1,2 (toi) vers la porte + bascule 3–8°, sin(ω t + k d), période 1,5 s, longueur 3,4 m.
- `flow` : progression u = 2,2 flow − 1,2 o (o : rang de départ, toi 0) ; file vers la porte (z 40), dehors tout droit dans la lumière, puis s'écarte vers +x (le battant ouvert est à +x) ; plus lumineux une fois dehors.
- 1883 : marches (nez de marche en traits 2,2 px = le rythme de l'escalier, profils sur les murs, mains courantes), murs de la cage en panes ; verrou plein signal (émissif léger) au bord libre côté salle, tige qui descend dans le sol avec `bolt`, pastille de lumière signal au sol ; l'enfant qui passe (`slip`) : palier → entrebâillement (de côté, 55°) → dehors.

## Planches (40 vignettes lues — au-delà du budget de 30, voir « pas au niveau »)
- p1 (4 candidates × 0,04/0,5) : (a) profil — la foule remplit le cadre, toi illisible ; (b) dehors — **la meilleure** : la porte sur ≈ 64 % de la largeur, toi plaqué derrière le verre, la barre pleine entre vous, la foule derrière, plus pâle ; (c) l'entonnoir se lit (porte, vert, foule) ; (d) trop près.
- p2/p3 : arcs OK ; `chest` à d 150 trop près (un torse) ; `hip` OK ; `stairTop` : marches trop claires (pane 0,07 → 0,022) ; `stairDoor` : caméra DANS la foule d'enfants → pose à changer.
- p4/p5 : mur à az −84 : **plus de dalle** ; `chest` à d 230 meilleur ; 1883 de profil OK ; vue « dehors à travers l'entrebâillement » : enfants sombres et lisibles mais l'entrebâillement ne se lit pas ; « gap haut » (az −35 el 40) : verrou rouge net au bord libre, enfants devant ; `bolt bas` (d 140) : le verrou se lit très bien.

## Poses qui cadrent (prêtes à coller)
- POSE0 / `outside` (b) : `{ tx: -5, ty: 115, tz: 30, d: 380, az: -152, el: -8, fov: 40, shift: 110, side: 0, roll: 0, drift: 0.3, dof: 0 }` (telle quelle).
- `chest` : `{ ...P, ...CLOSE, tx: 4, ty: 132, tz: 22, d: 230, az: -76, el: 3, shift: 100 }`.
- `bolt` : `{ ...P, ...CLOSE, tx: -42, ty: 18, tz: 40, d: 140, az: -40, el: 22, shift: 70 }`.
- `stairDoor` (le battant entrebâillé, le verrou, l'entrebâillement, de haut côté serrure) : `{ ...P, tx: -32, ty: 45, tz: 28, d: 300, az: -35, el: 40, fov: 36, shift: 80 }` — à affiner (enfants du palier devant).
- `crowd`, `door`, `above1883`, `hip`, `outflow` : celles de `world.js` tiennent.

## Pas au niveau (franchement)
- L'entrebâillement de 1883 (`slip`) ne se lit pas encore en une image : les enfants du palier le masquent ; l'enfant qui passe n'a pas été revu après son éclaircissement (budget d'images dépassé).
- `outflow` : la file qui sort se voit à gauche du cadre (elle s'écarte vers +x), pas dans l'embrasure ; de la salle, l'embrasure paraît vide à flow 0,5. Non revu après le dernier réglage.
- Toi, vu de dehors, reste un mannequin sombre au contour clair : lisible, pas encore « studio ».
- `stairTop` : enfants pâles et nombreux, lecture moyenne à 270 px.

## À changer ailleurs
- `world.js` : `export const POSE0 = { tx: -5, ty: 115, tz: 30, d: 380, az: -152, el: -8, fov: 40, shift: 110, side: 0, roll: 0, drift: 0.3, dof: 0 };` (candidate b, si le chef la retient)
- `world.js`, `VIEW.chest` : `chest: { ...P, ...CLOSE, tx: 4, ty: 132, tz: 22, d: 230, az: -76, el: 3, shift: 100 },`
- `world.js`, `VIEW.stairDoor` : `stairDoor: { ...P, tx: -32, ty: 45, tz: 28, d: 300, az: -35, el: 40, fov: 36, shift: 80 },` (l'ancienne met la caméra au milieu des enfants)
- `world.js`, `VIEW.bolt` : `bolt: { ...P, ...CLOSE, tx: -42, ty: 18, tz: 40, d: 140, az: -40, el: 22, shift: 70 },`
