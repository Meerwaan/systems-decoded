# 041 · Le bouclier de l'ISS — les décors

Architecte, 08/11. Voix réelle 92,87 s (`eleven_v4`, une prise). **Deux décors neufs** (aucun décor spatial au catalogue) et **un réutilisé** :

| Fichier | Ce que c'est | Matière |
| --- | --- | --- |
| `src/whipple.js` | **le système** : le coupon de bouclier Whipple « rembourré » (tôle, vide, matelas, coque) + ce qui le frappe (la bille, le nuage, la plaque-miroir) | plein |
| `src/station.js` | **autour** : l'ISS entière, le labo où tu dors, l'équipage, les capsules, l'esquive, Kosmos 1408 au loin, le char du 042 | rayons X |
| `026-soyouz-ms10/src/sky.js` | **la Terre vue d'orbite** : le dôme de studio du 026, importé tel quel par `world.js` à `alt` 400 km (limbe ≈ 20° sous l'horizontale, vérifié sur bouchon : l'arc se lit dès que la caméra plonge de 10 à 16°) | — |

**Un seul lieu, à taille vraie** (`plan.js`) : l'origine est le point d'impact, la face extérieure de la tôle, sur le flanc +z du labo. La station vole vers −x (l'avant), la Terre est en bas (−y), la bille arrive de +z tout droit (−z). **az 0** : caméra sur +z, dans l'axe de la bille ; **az −90** : caméra à l'avant (−x), les couches de profil, **le dehors (+z) à DROITE de l'image** (vérifié sur planche). La lumière clé vient de −x, +y, +z. L'établi est le même lieu : station et Terre effacées, un halo sous le coupon (`BENCH.floor` −21,5) ; la coupe vers l'établi se fait sur place. **La caméra tourne toujours dans le même sens : az décroît dans chaque trajet** (`world.js`, commentaire de `VIEW`).

Ce qui vaut pour les deux : trois couleurs (ink, veille, signal) et rien d'autre — **le kevlar n'est jamais jaune, la céramique jamais blanche pure** (deux gris du matelas) ; aucune grandeur n'est dessinée sur un décor (les jauges disent « un centimètre », « dix centimètres » par leur seule longueur, la voix dit le chiffre) ; `update(P, time, px, eye)` est appelé seize fois par image : rien n'y est alloué ; `eye` (la position de la caméra) sert à garder une lumière lisible à toute distance (≥ 7 px). Faits : `docs/faits/041-bouclier-iss.md` § 4 et § 10 (« À ne pas dire » : jamais « vaporisé », jamais « explose », pas partout pareil, pas 10 cm).

## whipple.js

**Le système, plein, à taille vraie, et tout ce qui le frappe.** Bouchon en place (boîtes grises plates, bille, cône) : API définitive, intérieur à réécrire. Voisin pour l'idiome : `episodes/007-siege-ejectable/src/model.js` (système plein) ; pour la bille et ses lumières, `makeBall` (`episodes/L04-porte-avions/src/model.js`, recopié ailleurs six fois) et la règle « une lumière a un endroit » ; pour le nuage, les braises périodiques (`makeEmbers`, recopiées neuf fois).

**À construire.**
- **Le coupon** : un carré de 40 × 40 cm découpé dans la paroi du labo, **courbe** (concentrique à l'axe du labo, `COUPON.axis`, rayon ≈ 2,1 m : la flèche fait ≈ 1 cm sur 40 cm, elle se voit et dit « une coque »), tranches nettes et chanfreinées comme une éprouvette d'essai. Quatre couches (`LAYERS`, rayons) : la **tôle** (aluminium, 2 mm, la plus claire : c'est la pièce-héros), **10 cm de vide**, le **matelas** (8 mm : céramique dessus en gris clair mat, kevlar dessous en gris plus sombre au tissage visible au shader, `fwidth`), la **coque** (4,8 mm, aluminium, gris moyen ; côté cabine, si tu veux, l'amorce d'un quadrillage d'usinage). Trois valeurs de gris, `metal` ≤ 0,5, arêtes fines. Entretoises : aucune source ne les décrit — n'en mets pas.
- **L'éclaté** (`explode`) : les couches s'écartent **vers +z** (vers d'où vient la bille), en rangée en travers de la caméra vue d'az −70 (`SPREAD` : tôle +30 cm, matelas +12, coque fixe). Chaque couche a ses propres matières (`litBumper`, `litBlanket`, `litWall` : un liseré veille faible sur la pièce que la voix nomme ; `litGap` : **le vide s'éclaire**, un volume de lumière veille très doux entre tôle et matelas, la seule fois où « rien » se voit).
- **La bille** (`bille`, `dist`, `trail`) : une sphère d'1 cm, chauffée à blanc (cœur blanc, teinte signal), sur son chemin (0, 0, `dist`) ; sa traînée part derrière elle (+z), longue quand `trail` 1, nulle quand 0 (la bille figée, pour la jauge). À toute distance, elle reste une lumière de ≥ 7 px (`eye`, `px`) : vue du labo entier (d ≈ 1 000) un point vif à longue traîne ; vue à 16 cm, une bille ronde qui brille.
- **La grosse** (`big`) : une sphère de la taille d'une balle de baseball (7,4 cm), signal, sombre et rugueuse (pas une lumière : un objet), à côté et un peu derrière la bille (`BIG.offset`), qui garde sa place quand `dist` change.
- **La balle de fusil** (`bullet`) : une balle de 7,62 mm de verre (`glass` + `asShell`), à côté du chemin, qui n'avance qu'à 1/15 de la bille (`BULLET` : z = ref + (dist − ref)/15) — « laissée sur place ».
- **Le balayage** (`scan`) : un mince éventail de lumière ink qui passe sur la bille de gauche à droite sans l'accrocher (rien ne s'allume sur elle, aucun réticule ne se ferme).
- **Les jauges** : `gauge1`, un trait d'un centimètre à deux butées collé sous la bille (il la suit) ; `gauge10`, une règle de dix centimètres **dans le vide**, au bord bas du coupon (`GAUGE10`), qui va de la tôle au matelas. Encre, ≥ 2 px, aucun chiffre.
- **L'impact** (`burst` 0 → 1, `shock`, `molten`), piloté sur les mots :
  · 0 → 0,1 : le contact, un éclair **qui a un endroit** (une boule blanche qui gonfle deux images et meurt, jamais un voile) ;
  · 0,1 → 0,3 : la tôle **percée d'un trou net** (≈ 2 à 3 fois la bille, bord retroussé côté vide, rougeoyant puis sombre) ; la bille est **brisée** : elle disparaît, un nuage naît derrière la tôle ;
  · 0,3 → 0,7 : **le nuage s'étale** en cône dans le vide (fragments solides et gouttes : des dizaines de petits éclats signal en traînées, plus clairs au front ; à 0,7 le front touche le matelas, ≈ 9 cm de large) ;
  · 0,7 → 0,85 : **le matelas le casse encore** : le front s'écrase sur la céramique, les éclats se fragmentent (plus nombreux, plus petits, plus pâles), la céramique marque un cratère peu profond ;
  · 0,85 → 1 : **une pluie** de petits points chauds étalés sur la coque (une tache diffuse de 10 à 15 cm, des dizaines de points, aucun trou) ; la coque **se bombe à peine** (≈ 1 mm vers la cabine) **et tient** ; à 1, la coque prend un liseré veille (elle a gagné) ;
  · `shock` 0 → 1 : un anneau signal qui court dans la tôle autour du point d'impact et s'éteint ;
  · `molten` 0 → 1 : la part des éclats qui sont des **gouttes de métal fondu** (orange-blanc, rondes, à traîne) — jamais tout, jamais de vapeur dessinée comme une explosion.
  Tout est déterministe (semé, `kit/lib/rng.js`) et ne dépend que de `burst` : rejoué à l'acte 3 exactement comme au principe.
- **Le miroir** (`mirror`, `pierce`) : une seule plaque plate d'aluminium de 6,8 mm (la tôle et la coque réunies), **au-dessus du coupon** (`MIRROR.at` y +54 : dans un cadre vertical, les deux s'empilent ; le long de x elle se cachait derrière le coupon), face extérieure au même z. Sa bille jumelle arrive de +z ; `pierce` 0 → 0,4 elle approche, 0,4 contact (éclair), 0,4 → 0,8 **un seul point qui creuse** (un cratère profond, bord en couronne, signal au fond), 0,8 → 1 **la plaque se troue** : un bouchon de métal et un jet d'éclats sortent de l'autre côté, serrés, en un seul point.

**Nombres lus** (`update(P, time, px, eye)`) : `explode, litBumper, litGap, litBlanket, litWall, bille, dist, trail, scan, bullet, gauge1, big, burst, shock, molten, gauge10, mirror, pierce, bench`.
**Exports** : `buildWhipple() → { root, parts: { bumper, blanket, wall, mirror }, A, update }` ; ancres `A.impact`, `A.bille` (suit `dist`), `A.gap`, `A.blanket`, `A.wall`, `A.mirror`, `A.big`, `A.gauge10`. `root` n'est déplacé que par l'esquive (`world.js`).

**Les images à réussir (liste fermée).**
1. `VIEW.system` (établi, az −62, d 125) : le coupon assemblé de trois quarts, sombre sur son halo, la tôle claire et fine, le vide lisible entre elle et le matelas, la coque derrière.
2. `VIEW.exploded` (az −70, d 150, `explode` 1) : les trois couches en rangée, chacune lisible à 270 px ; `litBumper`, `litBlanket`, `litWall` tour à tour.
3. `VIEW.gap` (az −78, d 56, dof) : `explode` 0, `litGap` 1, `gauge10` 1 — « dix centimètres de vide » : le vide est le sujet, éclairé.
4. `VIEW.profile` (az −80, d 52) : de profil, en orbite (station en verre autour) : tôle comme un trait, le vide, la coque ; la bille à `dist` 30 au bord droit, `gauge1` 1 puis `big` 1.
5. `VIEW.billeClose` (az −92, d 16) : la bille à `dist` 26, sa jauge d'un centimètre, la balle fantôme à côté (`bullet` 1), le balayage qui passe (`scan` 0 → 1).
6. `VIEW.contact` puis `VIEW.cone` (az −48 → −62) : `burst` 0,1 (éclair, `shock` 0,3), 0,3 (trou + nuage naissant), 0,7 (`molten` 1, cône à pleine largeur), 0,85, 1 (pluie, coque bombée, liseré veille) — six vignettes de la même suite.
7. `VIEW.pair` (az −84, d 230, établi) : coupon en bas, miroir en haut ; `pierce` 0,6 et 1 à côté de `burst` 0,7 et 1 : « une pluie… pas une balle » se lit sans légende.
8. **La première image** : la bille à `dist` 220, `trail` 1, vue de `POSE0` (d 1 150) : un point blanc-orange à longue traîne, lisible à 270 px.

**Propre au dossier.** Le contact se voit **en entier, sans coupe dessus** (règle du plan-séquence) : `burst` doit se lire en mouvement, pas seulement en poses. Le nuage n'est jamais « vaporisé » ni une explosion de feu : des éclats et des gouttes, qui s'étalent. Le trou dans la tôle reste après le choc (la tôle a servi : elle est percée, c'est voulu).

## station.js

**Autour, aux rayons X, à taille vraie : l'ISS, ceux qui y dorment, et ce qui passe près d'elle.** Bouchon en place (tubes de verre aux bonnes places, sans fenêtre ni détail) : API définitive, intérieur à réécrire. Voisins pour l'idiome : un décor aux rayons X → `episodes/006-defibrillateur/src/hall.js` ; une coque de véhicule en sections → `skin` (`episodes/023-eolienne-de-secours/src/avion.js`) ; le personnage → `kit/lib/figure.js` (`makeFigure`, ses notes dans `docs/catalogue.md` § Personnages) ; les lumières qui filent → `makeSprites` (`025/route.js`).

**À construire** (positions : `plan.js`, `HERO`, `MODULES`, `DRAGON`, `SOYUZ`, `PROGRESS`, `TRUSS`, `CREW`) :
- **La station** (`ship`, le seul groupe que l'esquive déplace) : une maquette fidèle aux proportions, qu'on reconnaît en un tiers de seconde de loin — la ligne des modules pressurisés le long de x (Harmony + Columbus et Kibo, **le labo** = le module-héros, Unity, Zarya, Zvezda), **la poutre** de 109 m en travers (z) au-dessus du labo, **ses quatre paires d'ailes** (≈ 35 × 12 m, maillage de cellules en traits fins qui s'efface de loin, `fwidth`), les radiateurs ; Crew Dragon à l'avant, Soyouz sous Zarya, Progress à l'arrière. Verre (`glass` + `asShell`), traits fins, **aucune surface pleine** ; de loin, les ailes sont ce qui fait l'ISS : elles doivent se lire sur le noir et sur la Terre.
- **Le labo** (`HERO`), seul détaillé : coque de verre de 4,26 m, ses anneaux, quelques baies (racks) en traits côté −z, **une fenêtre laissée ouverte** de 40 × 40 cm autour de l'origine (le coupon de `whipple.js` est sa paroi là) ; **le bouclier** sur tout le labo : la tôle à 11,4 cm de la coque, en panneaux (traits ink, presque invisibles quand `shield` 0 — il est déjà là, petit, dès la première image).
- **Toi** (`you`) : un personnage de verre (`makeFigure`) **dans son sac de couchage**, couché le long de la paroi +z du labo, la tête au plus près du point d'impact (`SLEEPER`), bras croisés ou flottants, le sac en verre plus dense que le corps. Jamais en très gros plan, jamais la main seule. Il « dort » : une respiration lente (le sac qui gonfle d'un rien, période ≈ 4 s), rien d'autre ne bouge chez lui.
- **L'air de la cabine** (`cabin`) : une lueur ink très pâle qui remplit le labo (« derrière ta paroi, ton air »), plus dense contre la paroi +z ; jamais un voile sur l'image.
- **Le bouclier sur toute la station** (`shield`, `ram`) : des traits veille sur les panneaux de tôle de chaque module ; `ram` les rend **plus épais et plus brillants à l'avant** (les faces tournées vers −x et les flancs) et plus pâles côté Terre (−y) — TP-2003-210788 : « pas partout pareil ».
- **L'équipage** (`crew`, `shelter`) : six silhouettes de verre plus pâles que toi, à leurs postes (`CREW.posts`) ; `shelter` 0 → 1 : les sept (toi compris) **flottent** jusqu'aux capsules — quatre vers Dragon, trois vers Soyouz — et s'y enferment ; à 1, les écoutilles se ferment (un trait veille). `capsules` : Dragon et Soyouz ressortent (traits plus denses).
- **L'esquive** (`burn`, `dodge`, `flyby`) : les moteurs de Progress (`burn`) : deux jets ink courts et vifs à l'arrière, jamais une flamme de fusée ; `dodge` 0 → 1 pousse `ship` de `DODGE.dy` (+y) ; `flyby` : l'objet de la taille d'une balle de baseball, signal, lumière à traîne (≥ 7 px) qui arrive de loin devant (`FLYBY.from`) et **passe sous le labo** une fois la station déplacée (`FLYBY.to`).
- **Au loin, Kosmos 1408** (`kosmos`) : 0,1 un petit satellite (boîte, deux panneaux) au loin ; 0,3 le coup (un éclair qui a un endroit) ; → 1 **un nuage de points signal qui s'étale le long de son orbite** (`KOSMOS.along`), en traînées, 1 500 points au plus. Maquette : aucune distance n'est vraie.
- **Le prochain dossier** (`teaser`, vu sur l'établi, Terre cachée) : un char (≈ 9 m) aux rayons X dans le noir, sous scellés (deux ou trois bandes ink en travers, sans texte), **son toit seul souligné en veille**. Rien de plus précis : la nature exacte du « toit » est hors périmètre (contre-vérification).
- `flown` : km parcourus sur l'orbite — pour ce qui glisse sur la Terre (le décorateur : nuages, lumières des villes la nuit). La station, elle, reste où elle est.

**Nombres lus** : `shell, you, cabin, shield, ram, crew, shelter, capsules, burn, dodge, flyby, kosmos, teaser, flown, bench` (`bench` 1 : tout ce qui est en orbite disparaît, le char reste).
**Exports** : `buildStation() → { group, ship, A, update }` ; ancres `A.hero`, `A.head` (la tête du dormeur), `A.cabin`, `A.dragon`, `A.soyuz`, `A.progress`, `A.front` (l'avant de Dragon), `A.flyby`, `A.kosmos`, `A.teaser`.

**Les images à réussir (liste fermée).**
1. **La première image** (`POSE0`, d 1 150, az −62) : le labo de trois quarts par-dessous, coque de verre, toi endormi lisible à travers, la tôle à une main de la coque, le point d'impact petit mais lisible ; candidates b, c, d de `docs/041-actes.md` aussi (dont `issLow`).
2. `VIEW.cabin` (dans le labo, az −130) : toi dans ton sac contre la paroi, l'air en halo, la paroi derrière toi.
3. `VIEW.lab` et `VIEW.front` (az −56, −72) : le labo et Harmony, le bouclier veille plus épais à l'avant (`shield` 1, `ram` 1).
4. `VIEW.whole` (d 26 000, az −40, el 16) : l'ISS entière sur le limbe de la Terre, lisible à 270 px (les ailes !), `shield` 1 — puis `burn` 1, `dodge` 1, `flyby` qui passe dessous.
5. `VIEW.shelter` (az −34) : les sept qui flottent vers Dragon et Soyouz (`shelter` 0,5 et 1).
6. Kosmos au loin depuis l'arrière de la station (`kosmos` 0,2 puis 1) : le nuage qui s'étale, la station au premier plan.
7. `VIEW.teaser` : le char sous scellés, le toit souligné, sombre sur noir mais lisible.

**Propre au dossier.** Aucun modèle de l'ISS ne se télécharge : on modélise (jamais d'image de stock). La station est un dessin de verre, jamais une maquette pleine « réaliste ». Personne n'est blessé ; l'astronaute dort à la fin de l'acte 3 comme au début.
