# CR04 · Lac-Mégantic — journal de `convoi.js`

2026-11-14. Le reste du train et la pente, sur le bouchon de l'architecte (API gardée : `buildConvoi() → { group, A, update(S, time, px) }`, ancres `vb`, `tampon`, `middle`).

## Fait
- **La voie** de `TRACK.from` à `TRACK.to`, courbe comprise : ballast trapézoïdal balayé le long de `trackFrame` (un seul maillage, échantillons tous les 600 en ligne droite, 20 dans la courbe), **11 900 traverses** en instances (une toutes les 3 unités), deux rails clairs (argile 0,72, satinés) et, sur chaque rail, un **trait papier de 2 px** (`fatLine`) qui porte la voie jusqu'à la ville. Traverses et rails se fondent dans la couleur du ballast avec la distance (`distFade` : 900 → 2 200 et 1 400 → 3 200) : pas de rayures qui scintillent au loin.
- **Les 72 DOT-111** en instances (une géométrie fusionnée, trois gris par sommet) : citerne de 72 + deux fonds elliptiques (r 7,5, axe à 12,8), trou d'homme et sa plateforme à garde-corps, échelles à mi-longueur, selles, faux-longerons et plateformes de bout, vidange basse, **deux bogies à trois pièces**, et, en instances à part : essieux (tournent avec la distance parcourue, une touche claire sur chaque roue), attelages (têtes accouplées + **tiges claires qui sortent du faux-longeron de la moitié de chaque jeu** : la vague de `slack` se voit en barres claires), **cylindre de frein vert** (`auto`), **volant de frein à main au bout avant** (sombre et desserré ; vert et tourné de trois tours quand `brakes` dépasse le wagon).
- **Le wagon VB** (fourgon : toit cintré, porte coulissante, le plus clair des corps) et **le wagon tampon** (wagon couvert : montants, porte, nervures de bout) : groupes à eux, arêtes claires toujours, **volant au coin avant gauche de la paroi de bout** (matière `alarm({ noOk })` à chacun : rouge avec `culprit` 4 × `fault` × serré, guéri par `depuis`, vert quand serré × `ok`).
- **Arêtes** : les 14 citernes les plus proches de la lumière (`fx fy fz`) portent les arêtes d'argile (anneaux aux fonds et deux coutures), estompées au-delà de `fs` 500 → 1 100 (plan large : aucune, une ligne de 1,8 px sur un wagon lointain ferait une traînée).
- **Le déraillement** (`derail` 0 → 1), sans état : les wagons continuent de `PUSH` (calculé pour que le 69ᵉ véhicule, dernier des 63 citernes + VB + tampon, entre et que le 70ᵉ reste dehors : **les 9 dernières citernes restent sur les rails**), ceux qui passent `PILE.u` sont comprimés dans `PILE.len` (λ 3 000), repliés en accordéon (lacet alterné = acos de la compression), couchés sur le flanc (roulis 0,9 à 1,65 rad, vers l'extérieur de la courbe, −z, pour ¾), jetés jusqu'à ≈ 0,26 × `PILE.spread`, quelques-uns empilés. `run` est gelé à `RUN.derail` pour les wagons dès que `derail` > 0 : les locomotives (world.js) partent seules.
- **Route 161** (`ROAD`, lue en u : x = −u) : bitume, deux lignes de rive, tirets d'axe (estompés au loin), 31 poteaux à traverse ; **trois voitures** (caisse sombre sans détail, deux phares papier, deux feux arrière **ambre** — pas de rouge, il est à l'incident —, halo et flaque de lumière devant) qui partent de la tête (décalées de 0, 0,15, 0,3) et montent vers Nantes, éteintes au bout.
- **Les flèches de `seuil`** : plates, couchées parallèlement à la pente, 44 au-dessus du milieu du train ; `pull` rouge vers la tête (vers la ville), `hold` verte vers la queue ; 1 700 de long chacune, tige 34, pointe 120 × 150 ; elles poussent depuis le milieu (la pointe naît à la tige).
- `update` n'alloue rien (repère de voie recopié de `plan.js` sans tableaux, `vehicleU` en une passe) ; le placement des 74 véhicules n'est refait que si `run`, `slack` ou `derail` changent.

## Les nombres de l'état, chez moi
`run slack` placement, roues, tiges d'attelage · `brakes` volants (5 = VB, 6 = tampon, ≥ 7 citernes vertes) · `auto` cylindres verts (le relâchement éteint de la tête vers la queue : à `auto` 0,5 seules les citernes au-delà de la 24ᵉ sont encore vertes) · `culprit fault depuis ok` volants VB / tampon · `derail` la pile · `pull hold` flèches · `road` voitures · `solo` tout caché · `fx fy fz fs` les arêtes.

## Planches (30 images lues sur 30)
1. `p1.jpg` (8) — tout tient ; `pente` à 5 000 : le train est une ligne de pixels et les flèches (70 de large) l'écrasent ; `rangee` trop loin.
2. `p2.jpg` (8) — gros plans : citerne, bogies, volant au bout, cylindre vert, anneaux d'arêtes justes ; garde-corps du dessus trop hauts (réglé) ; la pile trop éparpillée dans la ville (réglé : écart réduit, empilement).
3. `p3.jpg` (8) — volant rouge du tampon net au coin avant ; flèches rétrécies lisibles ; `rangee` lisible (un anneau vert dans chaque intervalle) ; pile encore lâche (λ 1 400 → 3 000).
4. `p4.jpg` (6) — la pile se lit en tas d'accordéon dans la courbe ; `seul` et la route tiennent ; relâchement de `auto` dans le bon sens.

## Poses qui cadrent (pour `VIEW`, en `lookFrom` de `world.js`)
- `pente` : `lookFrom(L([-150, 260, 420]), L([2000, 0, 0]), { fov: 30, shift: -60 })`, lumière `lit(L([2400, 10, 0]), 2400)` — flèche rouge vers le bas-gauche, verte vers le haut ; variante plus haute `lookFrom(L([-300, 420, 700]), L([2400, 0, 0]), { fov: 30, shift: -60 })`.
- `tete` (les sept, de près) : `lookFrom(L([150, 60, 150]), L([420, 12, 0]), { fov: 30, shift: 20 })`, `lit(L([380, 12, 0]), 220)` ; le volant du tampon seul : `lookFrom(L([430, 30, 80]), L([560, 15, 4]), { fov: 30 })`, `lit(L([560, 14, 0]), 90)`. `VIEW.tete` du bouchon tient pour le plan d'ensemble (volants trop petits pour être comptés).
- `attelages` : `lookFrom(L([480, 9, 34]), L([1400, 8, 3]), { fov: 18, shift: 40 })`, `lit(L([900, 8, 0]), 300)` ; un jeu de près : `lookFrom(L([940, 8, 60]), L([1065, 6, 0]), { fov: 30 })`.
- `route` : `VIEW.route` tient ; plus près des voitures : `lookFrom(L([-200, 30, -260]), L([500, 4, -182]), { fov: 30, shift: 20 })`, `lit(L([300, 6, -150]), 400)`. `seul` : `VIEW.seul` tient, `lit(L([300, 9, 0]), 500)`.
- `rangee` : `lookFrom(L([600, 14, 95]), L([1150, 13, 0]), { fov: 26, shift: 30 })`, `lit(L([1150, 12, 0]), 450)` — la caméra doit rester à ≥ 15° de l'axe, sinon chaque citerne cache le volant de la suivante.
- `courbe` : `lookFrom(T(24500, [0, 520, -1400]), T(24700, [0, 0, 0]), { fov: 30 })`, `lit(T(24700, [0, 0, 0]), 900)` (plus près que `VIEW.courbe`, qui noie la pile dans la ville).

## Pas encore au niveau
- `pente` : le train entier (7 150 de long) reste un trait fin sur une vignette ; les flèches le lisent, pas le train lui-même. Un cadre plus serré (≈ les 40 premières citernes) le rendrait épais, au prix du « train entier ».
- Les sept volants « tous en tête » ne se comptent pas dans un plan d'ensemble : il faut le plan rapproché ci-dessus.
- La pile : lisible en tas, mais les citernes y sont un peu trop régulières (même taille, pas de bosselure) ; la lueur rouge de `ville.js` les teinte, ce qui les sert.
- Le premier plan `file` n'a pas été re-tiré avec les vraies citernes derrière la tête (budget d'images épuisé).

## À changer ailleurs
- `docs/CR04-actes.md`, acte3 `toissue` : pendant `derail` 0 → 1, faire avancer `run` de 24 050 à ≈ 26 100 (les locomotives sortent de la pile ; à `run` 24 050 tenu, le VB passerait à travers la locomotive 5).
- `src/locomotive.js` (même lecture que les miens) : le volant vert seulement quand il est serré (`applied × ok`), sinon au t1 (`ok` 1, `brakes` 0 → 7) les cinq volants des locomotives sont verts avant d'être serrés et l'« un par un » ne se voit qu'au VB et au tampon.
- `src/world.js` `VIEW` : remplacer `pente`, `rangee`, `courbe` par les poses ci-dessus.
