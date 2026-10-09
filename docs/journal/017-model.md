# 017 — `model.js` (le système : l'IRM et la boîte à deux boutons) : journal

Fichier : `episodes/017-irm/src/model.js`. API : `buildSystem()` → `{ root, update(P, time, px), A, parts }`.
Planches et `essais.json` : dossier temporaire `scratchpad/017/model-*` (générateur : `model-essais.mjs` ; `model-measure.mjs` : part de pixels brûlés par image, sans la lire ; `model-probe.mjs` : place et couleur de chaque pièce à l'écran). Budget : 30 images lues — **30 lues** (8 + 8 + 8 + 4 + 1 + 1).

## Parti pris

- Un seul objet coaxial, écrit dans le repère de l'aimant (son centre, le tunnel selon z). Du tunnel vers l'extérieur : le tube (r 34 → 36,5, ± 76) · le manchon des gradients (r 39 → 50, ± 72) · la cuve annulaire (r 54 → 100, ± 60) · les capots (r 108, ± 88). Chaque couche dépasse de la suivante à la bouche (4 puis 12 cm) : ouverte, la machine se lit en gradins. Liberté prise : un vrai manchon de gradient ne dépasse pas de l'aimant.
- Les capots : deux demi-tambours qui s'ouvrent au milieu, une façade plus claire creusée en entonnoir à chaque bout, un socle sombre, le collier de la tourelle sur la moitié arrière ; en façade deux pupitres (écran + trois touches) et un anneau de lumière autour de la bouche, plus une lampe dans le tunnel — c'est tout ce que `power` éteint.
- L'aimant : six anneaux de fil bobiné sur un mandrin (plus gros aux bouts, comme un vrai) et deux anneaux de blindage sur leurs entretoises — leur courant tourne dans l'autre sens (blindage actif). Ils sont dessinés APRÈS la lumière de l'hélium : du métal clair dans un bain vert.
- L'hélium : un volume de lumière veille coupé à son niveau (`helium` 1 → y = +88 cm au-dessus de l'axe, 0 → −99,5), une peau claire sous la surface, la surface elle-même (une nappe tenue entre les deux parois de la cuve annulaire), des bulles qui montent en faisant le tour du tunnel.
- Le champ : des boucles fermées dans des plans qui contiennent l'axe (20°, 50°, 80°, 110°, 200° autour de z), trois par plan (elles sortent à 1,5 m, 2,4 m, 3,4 m de l'axe). Aucun plan près de l'horizontale : les caméras du film sont côté −x, elles les verraient par la tranche — une broche en travers de la machine (premier jet).
- La boîte : dans son repère sa façade regarde +z et x va vers la droite de celui qui lui fait face. Dans la salle elle est retournée (elle regarde −z) : l'arrêt d'urgence est donc à x = 77,5 (à gauche de qui regarde le mur), l'arrêt de l'aimant à x = 62,5.
- Le tube de quench, sur l'établi, se fond dans le noir entre 2,7 et 3,3 m (il passerait derrière l'en-tête) ; il revient entier dès que `plume` bouge. Dans la salle il monte toujours jusqu'à 450.
- `explode` : à partir de 0,45 la cuve passe en verre toute seule — dans l'éclaté l'aimant doit se voir, `xray` ou non.

## Fait

- Capots (deux moitiés pleines, les mêmes en verre pour `xray`), pupitres, anneau de lumière, lampe du tunnel ; table (socle, colonne, cadre, berceau, matelas) ; tube et son pont ; manchon des gradients (quatre selles autour de l'axe, deux fois le long, cinq spires aux deux bouts, dessinées dans le shader, fondues sous le pixel) ; cuve (bandes, deux berceaux) et sa vitre ; mandrin, entretoises, huit anneaux (spires dessinées) ; bain, surface, bulles ; ronde du courant (une tête de lumière par anneau, 0,2 tour/s) ; tache chaude (part d'un point d'un anneau, fait le tour, gagne les voisins avec retard) et sa boule de lumière ; tourelle (bride, écrous, tête froide), tube en deux tronçons, givre qui grimpe, nuage (46 bouffées à bruit, semées), boule au débouché ; champ (15 boucles en tubes de 12 cm) ; boîte (boîtier, platine, coup-de-poing encre, bouton veille, capot de verre à charnière, étiquettes, poteau sur l'établi).
- Ancres : `mouth`, `top`, `bore`, `gradients`, `coils`, `vessel`, `helium`, `hot`, `turret`, `pipe`, `pipeTop`, `box`, `estop`, `mstop`, `table`, `panel`.

## Raté, et pourquoi

- Champ, premier jet : des fils de 2 px, dix-huit boucles dont six vues par la tranche → un écheveau et deux broches. Refait en tubes de 12 cm (un filet clair dans une gaine large), cinq plans choisis pour être vus de trois quarts.
- `hot` 0,6 de près : tout rose, tout brûlé (émission 1,25 sur presque tous les anneaux, plus la ronde du courant à 1,15). Émission ramenée à 0,6, propagation étalée (les anneaux voisins partent plus tard).
- Ronde du courant : deux têtes larges par anneau sur huit anneaux clairs = l'image lavée en blanc (14 % de pixels saturés). Une tête par anneau, queue courte : 5 à 7 %, contre 4,3 % sans courant. Reste discrète : de la lumière encre sur du métal clair.
- Nuage du tube : une boule blanche brûlée (30 bouffées à 0,36). 46 bouffées à 0,16, bruit plus contrasté : aucun pixel saturé.
- Bain d'hélium trop pâle : plein ou à 15 %, la cuve se lisait pareil. Corps du volume doublé.
- Bulles invisibles : dessinées avant les anneaux, ceux-ci les recouvraient toutes. Dessinées après (ordre 8).
- Dessus du tambour et table : brûlure blanc-vert de la lumière de contour sur le vernis. Vernis retiré de ce qui regarde vers le haut, lampe du tunnel divisée par trois.
- Éclaté : (1) 690 cm de large, tube et manchon côte à côte ; (2) tube tiré par l'arrière du manchon : de trois quarts avant le manchon le cachait presque en entier — une heure perdue à chercher une ombre ou des normales à l'envers, la sonde (`model-probe.mjs`, une émission bleue sur la pièce) a montré que le pixel visé était le manchon ; (3) tube tiré par la BOUCHE du manchon, vers l'œil : c'est la bonne. Le demi-capot arrière monte DERRIÈRE la rangée : pendu au-dessus, son socle la tenait à l'ombre.
- `knock` : l'émission des bouts du manchon brûlait (0,52) ; ramenée à 0,32 au plus.

## Poses (complètes avec `fov: 28, side: 0, roll: 0, drift: 0.3`)

Sur l'établi :

1. Entière, avec la table : `{ tx: 28, ty: 105, tz: 24, d: 1450, az: -40, el: 14, shift: 160 }`
2. Ouverte (`cover` 0, `xray` 1) — l'image du film : `{ tx: 6, ty: 104, tz: 5, d: 1250, az: -40, el: 14, shift: 185 }` (regardée à d 1150 / shift 160 : la cuve descendait à 1227 px ; reculée par le calcul, pas revue)
3. Éclatée (`explode` 1, et `fs: 420` pour que la lumière et les ombres couvrent la rangée) : `{ tx: -4, ty: 150, tz: -3, d: 2750, az: -40, el: 16, shift: 200 }` (regardée à d 2650, tx −14 : le capot avant touchait le bord droit ; recentrée par le calcul)
4. Le champ (`seen` 1, `fs: 420`) : `{ tx: 0, ty: 190, tz: 0, d: 2900, az: -40, el: 14, shift: 160 }`
5. Les anneaux (`cover` 0, `xray` 1 ; `spin`, `hot`, `boil`) : `{ tx: -25, ty: 150, tz: 30, d: 560, az: -40, el: 12, shift: 160 }`
6. La cuve (`helium` 1 → 0,15) : la pose 2
7. Le tube : `plume` 0,5 `{ tx: 20, ty: 440, tz: -30, d: 1300, az: -40, el: -4, shift: 160 }` · `plume` 1 `{ tx: 60, ty: 520, tz: -30, d: 1900, az: -40, el: -6, shift: 160 }` (avec `fy: 300, fs: 420`)
8. La boîte sur son poteau : `{ tx: 178, ty: 118, tz: 70, d: 150, az: -38, el: 8, shift: 160 }` (avec `fx: 178, fy: 118, fz: 70, fs: 60`)
9. Les gradients (`xray` 1, `knock` 1) : `{ tx: 0, ty: 108, tz: 50, d: 700, az: -30, el: 10, shift: 160 }`
10. `power` 0 / 1 : `{ tx: 0, ty: 112, tz: 90, d: 620, az: -28, el: 8, shift: 160 }`

Places dans l'éclaté (monde, cm ; la cuve reste sur l'origine) : demi-capot avant (171, +170, 92) · arrière (−17, +130, −275) · manchon (−219, 0, −105) · tube (−219, 0, −20) · tourelle et tube +45 · table +120 en z.

## Pas au niveau

- L'éclaté est une vue d'ensemble : à d 2750 la cuve fait ≈ 370 px, la tourelle 60, la boîte 40. Chaque pièce nommée demande son plan rapproché (viser son ancre).
- La ronde du courant : jugée sur images fixes seulement ; une lueur douce plutôt qu'une comète nette.
- `knock` : le tremblement ne se juge pas sur une image ; ce qui se lit, c'est la lueur encre des deux bouts du manchon. Dernière version mesurée, pas revue.
- Assemblée, les gradients ne se voient qu'aux deux bouches (12 cm de manchon et sa tranche) ; leurs selles ne se voient que dans l'éclaté.
- Le coup-de-poing enfoncé (course portée à 2,6 cm, pas revue) ne se voit pas de face : de trois quarts, ou avec la main.
- Les bulles sont petites (des étincelles à d 560) ; la houle de la surface ne se voit que niveau bas.
- Les lueurs `lit…` : vues une fois, toutes ensemble ; `litHelium` mesuré seulement.
- Dans la salle : rien de regardé (la salle était un bouchon) — testé sans erreur, c'est tout.
- Un halo vert sur l'encadrement du bouton d'arrêt de l'aimant (bloom).

## À changer ailleurs

- `suite.js` — la main sur les boutons : la boîte regarde −z, son x est retourné. Dessus du coup-de-poing : `(77.5, 139, 404.8)` ; dessus du bouton d'arrêt de l'aimant : `(62.5, 139, 408.8)` ; le capot levé occupe y 145–153, z 401–413 (au-dessus du bouton, qu'il dégage). Soit `x = BOX.at[0] - BOX.estop[0]` et `x = BOX.at[0] - BOX.mstop[0]` (ou lire `world.system.A.estop` / `A.mstop`).
- `world.js` — `VIEW.whole` et `VIEW.system` : la pose 1 (ou 2) ; `VIEW.exploded` : la pose 3, avec `fs: 420` dans l'état de ce plan.
- `plan.js` — `MAGNET.table.from: 70` : le berceau commence à z = 78 et le cadre à 92 (l'entonnoir occupe 73–88) ; dessus du matelas à y = 83,6.
- Le tube traverse le plafond (290) et le toit (330) ; sa bague est à y 354–358, son rebord à 443–450 ; le nuage dérive vers +x (jusqu'à ≈ +210 cm) et monte jusqu'à y ≈ 720 à `plume` 1.
